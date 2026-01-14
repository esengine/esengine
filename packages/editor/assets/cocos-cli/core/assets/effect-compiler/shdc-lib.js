'use strict';
const tokenizer = require('glsl-tokenizer/string');
const parser = require('glsl-parser/direct');
const mappings = require('./offline-mappings');
const yaml = require('js-yaml');
const tabAsSpaces = 2;
const plainDefineRE = /#define\s+(\w+)\s+(\w+)/g;
const effectDefineRE = /#pragma\s+define\s+(\w+)\s+(.*)\n/g;
const ident = /[_a-zA-Z]\w*/g;
const labelRE = /(\w+)\((.*?)\)/;
const locationRE = /location\s*=\s*(\d+)/;
const inDecl = /(?:layout\s*\((.*?)\)\s*)?in ((?:\w+\s+)?\w+\s+(\w+)\s*(?:\[[\d\s]+])?)\s*;/g;
const outDecl = /(?:layout\s*\((.*?)\)\s*)?(?<=\b)out ((?:\w+\s+)?\w+\s+(\w+)\s*(?:\[[\d\s]+])?)\s*;/g;
const layoutExtract = /layout\s*\((.*?)\)(\s*)$/;
const bindingExtract = /(?:location|binding)\s*=\s*(\d+)/;
const builtinRE = /^cc\w+$/i;
const pragmasToStrip = /^\s*(?:#pragma\s*)(?!STDGL|optimize|debug).*$\n/gm;
// texture function table remapping texture(glsl300) to textureXX(glsl100)
const textureFuncRemap = new Map([['ExternalOES', '2D']]);
let effectName = '', shaderName = '', shaderTokens = [];
const formatMsg = (msg, ln) => `${effectName}.effect - ${shaderName}` + (ln !== undefined ? ` - ${ln}: ` : ': ') + msg;
const options = {
    throwOnError: true,
    throwOnWarning: false,
    noSource: false,
    skipParserTest: false,
    chunkSearchFn: (names) => ({}),
    getAlternativeChunkPaths: (path) => [],
};
const dumpSource = (tokens) => {
    let ln = 0;
    return tokens.reduce((acc, cur) => (cur.line > ln ? acc + `\n${(ln = cur.line)}\t${cur.data.replace(/\n/g, '')}` : acc + cur.data), '');
};
const throwFnFactory = (level, outputFn) => {
    return (msg, ln) => {
        if (options.noSource) {
            ln = undefined;
        }
        const source = ln !== undefined ? ' ↓↓↓↓↓ EXPAND THIS MESSAGE FOR MORE INFO ↓↓↓↓↓' + dumpSource(shaderTokens) + '\n' : '';
        const formattedMsg = formatMsg(level + ' ' + msg, ln) + source;
        if (options.throwOnWarning) {
            throw formattedMsg;
        }
        else {
            outputFn(formattedMsg);
        }
    };
};
const warn = throwFnFactory('Warning', console.warn);
const error = throwFnFactory('Error', console.error);
const convertType = (t) => {
    const tp = mappings.typeMap[t];
    return tp === undefined ? t : tp;
};
const VSBit = mappings.getShaderStage('vertex');
const FSBit = mappings.getShaderStage('fragment');
const CSBit = mappings.getShaderStage('compute');
const mapShaderStage = (stage) => {
    switch (stage) {
        case 'vert':
            return VSBit;
        case 'frag':
            return FSBit;
        case 'compute':
            return CSBit;
        default:
            return 0;
    }
};
const stripComments = (() => {
    const crlfNewLines = /\r\n/g;
    const blockComments = /\/\*.*?\*\//gs;
    const lineComments = /\s*\/\/.*$/gm;
    return (code) => {
        // strip comments
        let result = code.replace(blockComments, '');
        result = result.replace(lineComments, '');
        // replace CRLFs (tokenizer doesn't work with /r/n)
        result = result.replace(crlfNewLines, '\n');
        return result;
    };
})();
const globalChunks = {};
const globalDeprecations = { chunks: {}, identifiers: {} };
const addChunk = (() => {
    const depRE = /#pragma\s+deprecate-(chunk|identifier)\s+([\w-]+)(?:\s+(.*))?/g;
    return (name, content, chunks = globalChunks, deprecations = globalDeprecations) => {
        const chunk = stripComments(content);
        let depCap = depRE.exec(chunk);
        let code = '', nextBegIdx = 0;
        while (depCap) {
            const type = `${depCap[1]}s`;
            if (!deprecations[type]) {
                deprecations[type] = {};
            }
            deprecations[type][depCap[2]] = depCap[3];
            code += chunk.slice(nextBegIdx, depCap.index);
            nextBegIdx = depCap.index + depCap[0].length;
            depCap = depRE.exec(chunk);
        }
        chunks[name] = code + chunk.slice(nextBegIdx);
    };
})();
const invokeSearch = (names) => {
    const { name, content } = options.chunkSearchFn(names);
    if (content !== undefined) {
        addChunk(name, content);
        return name;
    }
    return '';
};
const unwindIncludes = (() => {
    const includeRE = /^(.*)#include\s+[<"]([^>"]+)[>"](.*)$/gm;
    let replacer;
    const replacerFactory = (chunks, deprecations, record) => (str, prefix, name, suffix) => {
        name = name.trim();
        if (name.endsWith('.chunk')) {
            name = name.slice(0, -6);
        }
        const originalName = name;
        if (record.has(name)) {
            return '';
        }
        if (deprecations[name] !== undefined) {
            error(`EFX2003: header '${name}' is deprecated: ${deprecations[name]}`);
        }
        let content = undefined;
        do {
            content = chunks[name];
            if (content !== undefined) {
                break;
            }
            const alternatives = options.getAlternativeChunkPaths(name);
            if (alternatives.some((path) => {
                if (chunks[path] !== undefined) {
                    name = path;
                    content = chunks[path];
                    return true;
                }
                return false;
            })) {
                break;
            }
            name = invokeSearch([].concat(name, alternatives));
            content = globalChunks[name];
            if (content !== undefined) {
                break;
            }
            error(`EFX2001: can not resolve '${originalName}'`);
            return '';
        } while (0); // eslint-disable-line
        record.add(name);
        if (prefix) {
            content = content.replace(/^/gm, prefix);
        }
        if (suffix) {
            content = content.replace(/\n/g, suffix + '\n') + suffix;
        }
        content = content.replace(includeRE, replacer);
        return content;
    };
    return (str, chunks, deprecations, record = new Set()) => {
        replacer = replacerFactory(chunks, deprecations.chunks, record);
        str = str.replace(includeRE, replacer);
        if (deprecations.identifierRE) {
            let depCap = deprecations.identifierRE.exec(str);
            while (depCap) {
                const depMsg = deprecations.identifiers[depCap[1]];
                if (depMsg) {
                    error(`EFX2004: identifier '${depCap[1]}' is deprecated: ${depMsg}`);
                }
                depCap = deprecations.identifierRE.exec(str);
            }
        }
        return str;
    };
})();
const expandFunctionalMacro = (() => {
    const getMatchingParen = (string, startParen) => {
        if (string[startParen] !== '(') {
            return startParen;
        }
        let depth = 1;
        let i = startParen + 1;
        for (; i < string.length; i++) {
            if (string[i] === '(') {
                depth++;
            }
            if (string[i] === ')') {
                depth--;
            }
            if (depth === 0) {
                break;
            }
        }
        return i;
    };
    const parenAwareSplit = (string) => {
        const res = [];
        let beg = 0;
        for (let i = 0; i < string.length; i++) {
            if (string[i] === '(') {
                i = getMatchingParen(string, i) + 1;
            }
            if (string[i] === ',') {
                res.push(string.substring(beg, i).trim());
                beg = i + 1;
            }
        }
        if (beg !== string.length || string[string.length - 1] === ',') {
            res.push(string.substring(beg).trim());
        }
        return res;
    };
    const defineRE = /#pragma\s+define\s+(\w+)\(([\w,\s]*)\)\s+(.*?)\n/g;
    const hashRE = /(?<=\w)##(?=\w)/g;
    const newlineRE = /\\\s*?\n/g;
    const newlineMarkRE = /@@/g;
    const definePrefixRE = /#pragma\s+define|#define/;
    return (code) => {
        code = code.replace(newlineRE, '@@');
        let defineCapture = defineRE.exec(code);
        // loop through definitions
        while (defineCapture !== null) {
            const fnName = defineCapture[1];
            const fnParams = parenAwareSplit(defineCapture[2]);
            const fnBody = defineCapture[3];
            const defStartIdx = defineCapture.index;
            const defEndIdx = defineCapture.index + defineCapture[0].length;
            const macroRE = new RegExp('^(.*?)' + fnName + '\\s*\\(', 'gm');
            // loop through invocations
            if (new RegExp('\\b' + fnName + '\\b').test(fnBody)) {
                warn(`EFX2002: recursive macro processor '${fnName}'`);
            }
            else {
                for (let macroCapture = macroRE.exec(code); macroCapture !== null; macroCapture = macroRE.exec(code)) {
                    const openParenIdx = macroCapture.index + macroCapture[0].length - 1;
                    if (openParenIdx > defStartIdx && openParenIdx < defEndIdx) {
                        continue;
                    } // skip original definition
                    const prefix = macroCapture[1];
                    const startIdx = macroCapture.index + prefix.length;
                    const endIdx = getMatchingParen(code, openParenIdx) + 1;
                    const params = parenAwareSplit(code.slice(macroCapture.index + macroCapture[0].length, endIdx - 1));
                    if (params.length !== fnParams.length) {
                        warn(`EFX2005: not enough arguments for function-like macro invocation '${fnName}'`);
                    }
                    // patch function body
                    const records = [];
                    for (let i = 0; i < fnParams.length; i++) {
                        const re = new RegExp('\\b' + fnParams[i] + '\\b', 'g');
                        let match;
                        while ((match = re.exec(fnBody)) !== null) {
                            records.push({ beg: match.index, end: re.lastIndex, target: params[i] });
                        }
                    }
                    let body = '';
                    let index = 0;
                    for (const record of records.sort((a, b) => a.beg - b.beg)) {
                        body += fnBody.slice(index, record.beg) + record.target;
                        index = record.end;
                    }
                    body += fnBody.slice(index, fnBody.length);
                    if (!definePrefixRE.test(prefix)) {
                        // for top level invocations
                        let indentCount = prefix.search(/\S/); // calc indentation
                        if (indentCount < 0) {
                            indentCount = prefix.length;
                        }
                        body = body.replace(hashRE, ''); // clear the hashes
                        body = body.replace(newlineMarkRE, '\n' + ' '.repeat(indentCount)); // restore newlines in the output
                    }
                    else {
                        const lastNewline = prefix.lastIndexOf('@@'); // calc indentation
                        const curLinePrefix = lastNewline < 0 ? prefix : prefix.slice(lastNewline + 2);
                        let indentCount = curLinePrefix.search(/\S/);
                        if (indentCount < 0) {
                            indentCount = curLinePrefix.length;
                        }
                        body = body.replace(newlineMarkRE, '@@' + ' '.repeat(indentCount));
                    }
                    // replace the invocation
                    code = code.substring(0, startIdx) + body + code.substring(endIdx);
                    // move to the starting point in case the function body is actually shorter than the invocation
                    macroRE.lastIndex -= macroCapture[0].length;
                }
            }
            code = code.substring(0, defStartIdx) + code.substring(defEndIdx); // no longer need to be around
            defineRE.lastIndex = 0; // reset pointer
            defineCapture = defineRE.exec(code);
        }
        code.replace(newlineMarkRE, '\\\n');
        return code;
    };
})();
const expandInputStatement = (statements) => {
    let gl4Index = 0;
    let es1Index = 0;
    let es3Index = 0;
    let outIndex = 0;
    let dsIndex;
    const Types = {
        u: ['uvec4', 'usubpassInput'],
        i: ['ivec4', 'isubpassInput'],
        f: ['vec4', 'subpassInput'],
    };
    const inputPrefix = '__in';
    let out = '';
    let hasColor = false;
    let hasDepthStencil = false;
    for (const statement of statements) {
        const inputType = statement.type;
        const varType = Types[statement.signed];
        const inout = statement.inout;
        const name = statement.name;
        const precision = statement.precision ? statement.precision : '';
        const inputIndex = inputType !== 'Color' ? dsIndex ?? gl4Index : gl4Index;
        const macroOut = `\n` +
            `#if __VERSION__ >= 450\n` +
            `  layout(location = ${outIndex}) out ${varType[0]} ${name};\n` +
            `#elif __VERSION__ >= 300\n` +
            `  layout(location = ${es3Index}) out ${varType[0]} ${name};\n` +
            `#endif\n`;
        const macroOut450 = `\n` + `#if __VERSION__ >= 450\n` + `  layout(location = ${outIndex}) out ${varType[0]} ${name};\n` + `#endif\n`;
        const macroDepthStencilIn = `\n` +
            `#pragma rate ${inputPrefix}${name} pass\n` +
            `#if CC_DEVICE_CAN_BENEFIT_FROM_INPUT_ATTACHMENT\n` +
            `  #if __VERSION__ >= 450\n` +
            `    layout(input_attachment_index = ${inputIndex}) uniform ${varType[1]} ${inputPrefix}${name};\n` +
            `    #define subpassLoad_${name} subpassLoad(${inputPrefix}${name})\n` +
            `  #else\n` +
            `    #define subpassLoad_${name} ${varType[0]}(gl_LastFrag${inputType}ARM, 0, 0, 0)\n` +
            `  #endif\n` +
            `#else\n` +
            `  #define subpassLoad_${name} ${varType[0]}(0, 0, 0, 0)\n` +
            `#endif\n`;
        const macroColorIn = `\n` +
            `#pragma rate ${inputPrefix}${name} pass\n` +
            `#if CC_DEVICE_CAN_BENEFIT_FROM_INPUT_ATTACHMENT\n` +
            `  #if __VERSION__ >= 450\n` +
            `    layout(input_attachment_index = ${inputIndex}) uniform subpassInput ${inputPrefix}${name};\n` +
            `    #define subpassLoad_${name} subpassLoad(${inputPrefix}${name})\n` +
            `  #elif __VERSION__ >= 300\n` +
            `    layout(location = ${es3Index}) inout ${precision} ${varType[0]} ${name};\n` +
            `    #define subpassLoad_${name} ${name}\n` +
            `  #else\n` +
            `    #define subpassLoad_${name} gl_LastFragData[${es1Index}]\n` +
            `  #endif\n` +
            `#else\n` +
            `  #define subpassLoad_${name} ${precision} ${varType[0]}(0, 0, 0, 0)\n` +
            `#endif\n`;
        if (inout === 'out') {
            out += macroOut;
            outIndex++;
            es3Index++;
        }
        if (inout === 'inout') {
            out += macroOut450;
            outIndex++;
        }
        if (inout === 'in' || inout === 'inout') {
            if (inputType === 'Color') {
                out += macroColorIn;
                gl4Index++;
                es1Index++;
                es3Index++;
                hasColor = true;
            }
            else {
                if (dsIndex === void 0) {
                    dsIndex = gl4Index;
                    gl4Index++;
                }
                out += macroDepthStencilIn;
                hasDepthStencil = true;
            }
        }
    }
    const colorExtension = '#pragma extension([GL_EXT_shader_framebuffer_fetch, __VERSION__ < 450, enable])\n';
    const dsExtension = '#pragma extension([GL_ARM_shader_framebuffer_fetch_depth_stencil, __VERSION__ < 450, enable])\n';
    if (hasColor) {
        out = colorExtension + out;
    }
    if (hasDepthStencil) {
        out = dsExtension + out;
    }
    return out;
};
const expandSubpassInout = (code) => {
    const inputStatements = [];
    const inputTypeWeights = {
        Color: 0,
        Depth: 1,
        Stencil: 2,
    };
    const inoutTypeWeights = {
        in: 0,
        inout: 1,
        out: 2,
    };
    const FilterMap = {
        Color: { inouts: ['in', 'out', 'inout'], types: ['i', 'f', 'u'], hint: '' },
        Depth: { inouts: ['in'], types: ['f'], hint: 'subpassDepth' },
        Stencil: { inouts: ['in'], types: ['i'], hint: 'isubpassStencil' },
    };
    // replace subpassLoad(val) functions to subpassLoad_val
    code = code.replace(/subpassLoad\s*\(\s*(\w+)\s*\)/g, `subpassLoad_$1`);
    let attachmentIndex = 0;
    const subpassDefineRE = /#pragma\s+(i|u)?subpass(Color|Depth|Stencil)\s+(\w+)\s*(mediump|highp|lowp)?\s+(\w+)\s+/g;
    let defineCapture = subpassDefineRE.exec(code);
    while (defineCapture !== null) {
        const signed = defineCapture[1] ? defineCapture[1] : 'f';
        const input = defineCapture[2];
        const inout = defineCapture[3];
        const precision = defineCapture[4];
        const name = defineCapture[5];
        const index = attachmentIndex;
        const filter = FilterMap[input];
        if (!filter.inouts.includes(inout)) {
            error(`unsupported inout type ${input}, ${inout}`);
            return code;
        }
        if (!filter.types.includes(signed)) {
            error(`unsupported subpass type for ${input}, only ${filter.hint} supported`);
            return code;
        }
        inputStatements.push({
            type: input,
            inout: inout,
            name: name,
            index: index,
            precision: precision,
            signed: signed,
            sortKeyInput: inputTypeWeights[input],
            sortKeyInout: inoutTypeWeights[inout],
        });
        const beg = defineCapture.index;
        const end = defineCapture.index + defineCapture[0].length;
        code = code.substring(0, beg) + code.substring(end);
        subpassDefineRE.lastIndex = beg;
        defineCapture = subpassDefineRE.exec(code);
        ++attachmentIndex;
    }
    inputStatements.sort((a, b) => {
        if (a.sortKeyInout !== b.sortKeyInout) {
            return a.sortKeyInout - b.sortKeyInout;
        }
        if (a.sortKeyInput != b.sortKeyInput) {
            return a.sortKeyInput - b.sortKeyInput;
        }
        // no sort will be applied to out-only color attachment
        if (a.sortKeyInout === inoutTypeWeights['out']) {
            return a.index - b.index;
        }
        else {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
        }
        return 0;
    });
    const out = expandInputStatement(inputStatements);
    const subpassReplaceRE = /#pragma\s+subpass/g;
    const subpassReplace = subpassReplaceRE.exec(code);
    if (subpassReplace) {
        const beg = subpassReplace.index;
        const end = subpassReplace.index + subpassReplace[0].length;
        code = code.substring(0, beg) + out + code.substring(end);
    }
    return code;
};
const expandLiteralMacro = (code) => {
    const defines = {};
    let defCap = effectDefineRE.exec(code);
    // extraction
    while (defCap !== null) {
        let value = defCap[2];
        if (value.endsWith('\\')) {
            value = value.slice(0, -1);
        }
        defines[defCap[1]] = value.trim();
        const beg = defCap.index;
        const end = defCap.index + defCap[0].length;
        code = code.substring(0, beg) + code.substring(end);
        effectDefineRE.lastIndex = beg;
        defCap = effectDefineRE.exec(code);
    }
    // replacement
    const keyREs = Object.keys(defines).map((k) => new RegExp(`\\b${k}\\b`, 'g'));
    const values = Object.values(defines);
    for (let i = 0; i < values.length; i++) {
        let value = values[i];
        for (let j = 0; j < i; j++) {
            // only replace ealier ones
            value = value.replace(keyREs[j], values[j]);
        }
        code = code.replace(keyREs[i], value);
    }
    return code;
};
const extractMacroDefinitions = (code) => {
    const defines = new Set();
    let defCap = plainDefineRE.exec(code);
    const substituteMap = new Map();
    while (defCap !== null) {
        defines.add(defCap[1]);
        if (defCap[2] && defCap[2].toLowerCase !== 'true' && defCap[2].toLowerCase !== 'false') {
            const tryNumber = parseInt(defCap[2]);
            if (isNaN(tryNumber)) {
                // #define CC_SURFACE_USE_VERTEX_COLOR USE_VERTEX_COLOR
                substituteMap.set(defCap[1], defCap[2]);
            }
        }
        defCap = plainDefineRE.exec(code);
    }
    return [defines, substituteMap];
};
const eliminateDeadCode = (() => {
    const scopeRE = /[{}()]/g;
    const sigRE = /(?:\w+p\s+)?\w+\s+(\w+)\s*$/; // precision? returnType fnName
    const spacesRE = /^\s*$/;
    let name = '';
    let beg = 0;
    let end = 0;
    const recordBegin = (code, leftParen) => {
        const cap = code.substring(end, leftParen).match(sigRE) || ['', ''];
        name = cap[1];
        beg = leftParen - cap[0].length;
    };
    const getAllCaptures = (code, RE) => {
        const caps = [];
        let cap = RE.exec(code);
        while (cap) {
            caps.push(cap);
            cap = RE.exec(code);
        }
        return caps;
    };
    const livepool = new Set();
    const ascension = (functions, idx) => {
        if (livepool.has(idx)) {
            return;
        }
        livepool.add(idx);
        for (const dep of functions[idx].deps) {
            ascension(functions, dep);
        }
    };
    return (code, entry, functions) => {
        let depth = 0, state = 0, paramListEnd = 0;
        end = 0;
        scopeRE.lastIndex = 0;
        livepool.clear();
        const functionsFull = [];
        // extraction
        for (const cur of getAllCaptures(code, scopeRE)) {
            const c = cur[0];
            if (depth === 0) {
                if (c === '(') {
                    (state = 1), recordBegin(code, cur.index);
                }
                else if (c === ')') {
                    if (state === 1) {
                        (state = 2), (paramListEnd = cur.index + 1);
                    }
                    else {
                        state = 0;
                    }
                }
                else if (c === '{') {
                    if (state === 2 && spacesRE.test(code.substring(paramListEnd, cur.index))) {
                        state = 3;
                    }
                    else {
                        state = 0;
                    }
                }
            }
            if (c === '{') {
                depth++;
            }
            if (c === '}' && --depth === 0) {
                if (state !== 3) {
                    continue;
                }
                end = cur.index + 1;
                state = 0;
                if (name) {
                    functionsFull.push({ name, beg, end, paramListEnd, deps: [] });
                }
            }
        }
        // inspection
        let entryIdx = functionsFull.findIndex((f) => f.name === entry);
        if (entryIdx < 0) {
            error(`EFX2403: entry function '${entry}' not found.`);
            entryIdx = 0;
        }
        for (let i = 0; i < functionsFull.length; i++) {
            const fn = functionsFull[i];
            const caps = getAllCaptures(code, new RegExp('\\b' + fn.name + '\\b', 'g'));
            for (const cap of caps) {
                const target = functionsFull.findIndex((f) => cap.index > f.beg && cap.index < f.end);
                if (target >= 0 && target !== i) {
                    functionsFull[target].deps.push(i);
                }
            }
        }
        // extract all functionsFull reachable from main
        // actually this even works with function overloading, albeit not the best output possible:
        // overloads for the same function will be extracted all at once or not at all
        ascension(functionsFull, entryIdx);
        // elimination
        let result = '', pointer = 0, offset = 0;
        for (let i = 0; i < functionsFull.length; i++) {
            const dc = functionsFull[i];
            const { name, beg, end } = dc;
            if (livepool.has(i) || name === 'main') {
                // adjust position and add to final list
                dc.beg -= offset;
                dc.end -= offset;
                dc.paramListEnd -= offset;
                functions.push(dc);
                continue;
            }
            result += code.substring(pointer, beg);
            pointer = end;
            offset += end - beg;
        }
        return result + code.substring(pointer);
    };
})();
const parseCustomLabels = (arr, out = {}) => {
    let str = arr.join(' ');
    let labelCap = labelRE.exec(str);
    while (labelCap) {
        try {
            out[labelCap[1]] = yaml.load(labelCap[2] || 'true');
        }
        catch (e) {
            warn(`EFX2102: parameter for label '${labelCap[1]}' is not legal YAML: ${e.message}`);
        }
        str = str.substring(labelCap.index + labelCap[0].length);
        labelCap = labelRE.exec(str);
    }
    return out;
};
/**
 * say we are extracting from this program:
 * ```
 *    // ..
 * 12 #if USE_LIGHTING
 *      // ..
 * 34   #if NUM_LIGHTS > 0
 *        // ..
 * 56   #endif
 *      // ..
 * 78 #endif
 *    // ..
 * ```
 *
 * the output would be:
 * ```
 * // the complete define list
 * defines = [
 *   { name: 'USE_LIGHTING', type: 'boolean', defines: [] },
 *   { name: 'NUM_LIGHTS', type: 'number', range: [0, 3], defines: [ 'USE_LIGHTING' ] }
 * ]
 * // bookkeeping: define dependency throughout the code
 * cache = {
 *   lines: [12, 34, 56, 78],
 *   12: [ 'USE_LIGHTING' ],
 *   34: [ 'USE_LIGHTING', 'NUM_LIGHTS' ],
 *   56: [ 'USE_LIGHTING' ],
 *   78: []
 * }
 * ````
 */
const getDefs = (line, cache) => {
    let idx = cache.lines.findIndex((i) => i > line);
    if (idx < 0) {
        idx = cache.lines.length;
    }
    return cache[cache.lines[idx - 1]] || [];
};
const pushDefines = (defines, existingDefines, newDefine) => {
    if (existingDefines.has(newDefine.name)) {
        return;
    }
    defines.push(newDefine);
};
const extractDefines = (tokens, defines, cache) => {
    const curDefs = [], save = (line) => {
        cache[line] = curDefs.reduce((acc, val) => acc.concat(val), []);
        cache.lines.push(line);
    };
    let elifClauses = 0;
    for (let i = 0; i < tokens.length; i++) {
        let t = tokens[i], str = t.data, id, df;
        if (t.type !== 'preprocessor' || str.startsWith('#extension')) {
            continue;
        }
        str = str.split(/\s+/);
        if (str[0] === '#endif') {
            // pop one level up
            while (elifClauses > 0) {
                curDefs.pop(), elifClauses--;
            } // pop all the elifs
            curDefs.pop();
            save(t.line);
            continue;
        }
        else if (str[0] === '#else' || str[0] === '#elif') {
            // flip
            const def = curDefs[curDefs.length - 1];
            def && def.forEach((d, i) => (def[i] = d[0] === '!' ? d.slice(1) : '!' + d));
            save(t.line);
            if (str[0] === '#else') {
                continue;
            }
            elifClauses++;
        }
        else if (str[0] === '#pragma') {
            // pragmas
            if (str.length <= 1) {
                continue;
            }
            if (str[1] === 'define-meta') {
                // define specifications
                if (str.length <= 2) {
                    warn('EFX2101: define pragma: missing info', t.line);
                    continue;
                }
                ident.lastIndex = 0;
                if (!ident.test(str[2])) {
                    continue;
                } // some constant macro replaced this one, skip
                const d = curDefs.reduce((acc, val) => acc.concat(val), []);
                let def = defines.find((d) => d.name === str[2]);
                if (!def) {
                    pushDefines(defines, cache.existingDefines, (def = { name: str[2], type: 'boolean', defines: d, dummyDependency: true }));
                }
                const prop = parseCustomLabels(str.splice(3));
                for (const key in prop) {
                    if (key === 'range') {
                        // number range
                        def.type = 'number';
                        def.range = [0, 3];
                        def.fixedType = true;
                        if (!Array.isArray(prop.range)) {
                            warn(`EFX2103: invalid range for macro '${def.name}'`, t.line);
                        }
                        else {
                            def.range = prop.range;
                        }
                    }
                    else if (key === 'options') {
                        // string options
                        def.type = 'string';
                        def.options = [];
                        def.fixedType = true;
                        if (!Array.isArray(prop.options)) {
                            warn(`EFX2104: invalid options for macro '${def.name}'`, t.line);
                        }
                        else {
                            def.options = prop.options;
                        }
                    }
                    else if (key === 'default') {
                        switch (prop.default) {
                            case true:
                                def.default = 1;
                                break;
                            case false:
                                def.default = 0;
                                break;
                            default:
                                def.type = 'constant';
                                def.default = prop.default;
                                def.fixedType = true;
                                break;
                        }
                    }
                    else if (key === 'editor') {
                        def.editor = prop.editor;
                    }
                    else {
                        warn(`EFX2105: define pragma: illegal label '${key}'`, t.line);
                        continue;
                    }
                }
            }
            else if (str[1] === 'warning') {
                warn(`EFX2107: ${str.slice(2).join(' ')}`);
            }
            else if (str[1] === 'error') {
                error(`EFX2108: ${str.slice(2).join(' ')}`);
            }
            else {
                // other specifications, save for later passes
                const labels = parseCustomLabels(str.slice(1));
                if (labels.extension) {
                    // extension request
                    cache.extensions[labels.extension[0]] = {
                        defines: getDefs(t.line, cache),
                        cond: labels.extension[1],
                        level: labels.extension[2],
                        runtimeCond: labels.extension[3],
                    };
                }
                else {
                    cache[t.line] = labels;
                }
            }
            continue;
        }
        else if (!/#(el)?if$/.test(str[0])) {
            continue;
        }
        let defs = [];
        let orAppeared = false;
        str.splice(1).some((s) => {
            ident.lastIndex = 0;
            id = ident.exec(s);
            if (id) {
                // is identifier
                if (id[0] === 'defined' || // skip macros that can be undefined
                    id[0].startsWith('__') || // skip language builtin macros
                    id[0].startsWith('GL_') ||
                    id[0] === 'VULKAN') {
                    return false;
                }
                const d = curDefs.reduce((acc, val) => acc.concat(val), defs.slice());
                df = defines.find((d) => d.name === id[0]);
                if (df) {
                    let needUpdate = d.length < df.defines.length; // update path if shorter
                    if (df.dummyDependency) {
                        (needUpdate = true), delete df.dummyDependency;
                    } // or have a dummy
                    if (needUpdate) {
                        df.defines = d;
                    }
                }
                else {
                    pushDefines(defines, cache.existingDefines, (df = { name: id[0], type: 'boolean', defines: d }));
                }
                defs.push((s[0] === '!' ? '!' : '') + id[0]);
            }
            else if (df && /^[<=>]+$/.test(s) && !df.fixedType) {
                df.type = 'number';
                df.range = [0, 3];
            }
            else if (s === '||') {
                orAppeared = true;
                return false;
            }
            return false;
        });
        if (orAppeared) {
            defs = []; // or is not supported, skip all
        }
        curDefs.push(defs);
        save(t.line);
    }
    defines.forEach((d) => (delete d.fixedType, delete d.dummyDependency));
};
const extractUpdateRates = (tokens, rates = []) => {
    for (let i = 0; i < tokens.length; i++) {
        let t = tokens[i], str = t.data, id, df;
        if (t.type !== 'preprocessor' || str.startsWith('#extension')) {
            continue;
        }
        str = str.split(/\s+/);
        if (str[0] === '#pragma' && str.length === 4) {
            if (str[1] === 'rate') {
                rates.push({ name: str[2], rate: str[3] });
            }
        }
    }
    return rates;
};
const extractUnfilterableFloat = (tokens, sampleTypes = []) => {
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        let str = t.data;
        if (t.type !== 'preprocessor' || str.startsWith('#extension')) {
            continue;
        }
        str = str.split(/\s+/);
        if (str[0] === '#pragma' && str.length === 3) {
            if (str[1] === 'unfilterable-float') {
                sampleTypes.push({ name: str[2], sampleType: 1 }); // SampleType.UNFILTERABLE_FLOAT
            }
        }
    }
    return sampleTypes;
};
const extractParams = (() => {
    // tokens (from ith): [ ..., ('highp', ' ',) 'vec4', ' ', 'color', ('[', '4', ']',) ... ]
    const precision = /(low|medium|high)p/;
    const extractInfo = (tokens, i) => {
        const param = {};
        const definedPrecision = precision.exec(tokens[i].data);
        let offset = definedPrecision ? 2 : 0;
        param.name = tokens[i + offset + 2].data;
        param.typename = tokens[i + offset].data;
        param.type = convertType(tokens[i + offset].data);
        param.count = 1;
        if (definedPrecision) {
            param.precision = definedPrecision[0] + ' ';
        }
        // handle array type
        if (tokens[(offset = nextWord(tokens, i + offset + 2))].data === '[') {
            let expr = '', end = offset;
            while (tokens[++end].data !== ']') {
                expr += tokens[end].data;
            }
            try {
                if (/^[\d+\-*/%\s]+$/.test(expr)) {
                    param.count = eval(expr);
                } // arithmetics
                else if (builtinRE.test(param.name)) {
                    param.count = expr;
                }
                else {
                    throw expr;
                }
                param.isArray = true;
            }
            catch (e) {
                error(`EFX2202: ${param.name}: non-builtin array length must be compile-time constant: ${e}`, tokens[offset].line);
            }
        }
        return param;
    };
    const stripDuplicates = (arr) => {
        const dict = {};
        return arr.filter((e) => (dict[e] ? false : (dict[e] = true)));
    };
    const exMap = { whitespace: true };
    const nextWord = (tokens, i) => {
        do {
            ++i;
        } while (exMap[tokens[i].type]);
        return i;
    };
    const nextSemicolon = (tokens, i, check = (t) => { }) => {
        while (tokens[i].data !== ';') {
            check(tokens[i++]);
        }
        return i;
    };
    const isFunctionParameter = (functions, pos) => functions.some((f) => pos > f.beg && pos < f.paramListEnd);
    const nonBlockUniforms = /texture|sampler|image|subpassInput/;
    return (tokens, cache, shaderInfo, stage, functions) => {
        const res = [];
        const isVert = stage === 'vert';
        for (let i = 0; i < tokens.length; i++) {
            let t = tokens[i], str = t.data, dest, type;
            if (str === 'uniform') {
                (dest = shaderInfo.blocks), (type = 'blocks');
            }
            else if (str === 'in' && !isFunctionParameter(functions, t.position)) {
                if (stage === 'compute') {
                    // compute shader local_size definition, skipped
                    i = nextWord(tokens, i + 2);
                    continue;
                }
                dest = isVert ? shaderInfo.attributes : shaderInfo.varyings;
                type = isVert ? 'attributes' : 'varyings';
            }
            else if (str === 'out' && !isFunctionParameter(functions, t.position)) {
                dest = isVert ? shaderInfo.varyings : shaderInfo.fragColors;
                type = isVert ? 'varyings' : 'fragColors';
            }
            else if (str === 'buffer') {
                (dest = shaderInfo.buffers), (type = 'buffers');
            }
            else {
                continue;
            }
            const defines = getDefs(t.line, cache), param = {};
            // uniforms
            param.tags = cache[t.line - 1]; // pass pragma tags further
            let idx = nextWord(tokens, i + 2);
            if (tokens[idx].data !== '{') {
                Object.assign(param, extractInfo(tokens, i + 2));
                if (dest === shaderInfo.blocks) {
                    // samplerTextures
                    const uType = tokens[i + (param.precision ? 4 : 2)].data;
                    const uTypeCap = nonBlockUniforms.exec(uType);
                    if (!uTypeCap) {
                        error('EFX2201: vector uniforms must be declared in blocks.', t.line);
                    }
                    else if (uType === 'sampler') {
                        dest = shaderInfo.samplers;
                        type = 'samplers';
                    }
                    else if (uTypeCap[0] === 'sampler') {
                        dest = shaderInfo.samplerTextures;
                        type = 'samplerTextures';
                    }
                    else if (uTypeCap[0] === 'texture') {
                        dest = shaderInfo.textures;
                        type = 'textures';
                    }
                    else if (uTypeCap[0] === 'image') {
                        dest = shaderInfo.images;
                        type = 'images';
                    }
                    else if (uTypeCap[0] === 'subpassInput') {
                        dest = shaderInfo.subpassInputs;
                        type = 'subpassInputs';
                    }
                } // other attributes or varyings
                idx = nextSemicolon(tokens, idx);
            }
            else {
                // blocks
                param.name = tokens[i + 2].data;
                param.members = [];
                while (tokens[(idx = nextWord(tokens, idx))].data !== '}') {
                    if (dest !== shaderInfo.buffers) {
                        // don't need to parse SSBO members
                        const info = extractInfo(tokens, idx);
                        if (mappings.isSampler(info.type)) {
                            error('EFX2208: texture uniforms must be declared outside blocks.', tokens[idx].line);
                        }
                        param.members.push(info);
                    }
                    idx = nextSemicolon(tokens, idx);
                }
                // std140 specific checks
                param.members.reduce((acc, cur) => {
                    let baseAlignment = mappings.GetTypeSize(cur.type);
                    switch (cur.typename) {
                        case 'mat2':
                            baseAlignment /= 2;
                            break;
                        case 'mat3':
                            baseAlignment /= 3;
                            break;
                        case 'mat4':
                            baseAlignment /= 4;
                            break;
                    }
                    if (cur.count > 1 && baseAlignment < 16) {
                        const typeMsg = `uniform ${convertType(cur.type)} ${cur.name}[${cur.count}]`;
                        error('EFX2203: ' + typeMsg + ': array UBO members need to be 16-bytes-aligned to avoid implicit padding');
                        baseAlignment = 16;
                    }
                    else if (baseAlignment === 12) {
                        const typeMsg = `uniform ${convertType(cur.type)} ${cur.name}`;
                        error('EFX2204: ' + typeMsg + ': please use 1, 2 or 4-component vectors to avoid implicit padding');
                        baseAlignment = 16;
                    }
                    else if (mappings.isPaddedMatrix(cur.type)) {
                        const typeMsg = `uniform ${convertType(cur.type)} ${cur.name}`;
                        error('EFX2210: ' + typeMsg + ': use only 4x4 matrices to avoid implicit padding');
                    }
                    const alignedOffset = Math.ceil(acc / baseAlignment) * baseAlignment;
                    const implicitPadding = alignedOffset - acc;
                    if (implicitPadding) {
                        error(`EFX2205: UBO '${param.name}' introduces implicit padding: ` +
                            `${implicitPadding} bytes before '${cur.name}', consider re-ordering the members`);
                    }
                    return alignedOffset + baseAlignment * cur.count; // base offset for the next member
                }, 0); // top level UBOs have a base offset of zero
                // check for preprocessors inside blocks
                const pre = cache.lines.find((l) => l >= tokens[i].line && l < tokens[idx].line);
                if (pre) {
                    error(`EFX2206: ${param.name}: no preprocessors allowed inside uniform blocks!`, pre);
                }
                // check for struct members
                param.members.forEach((info) => {
                    if (typeof info.type === 'string') {
                        error(`EFX2211: '${info.type} ${info.name}' in block '${param.name}': ` +
                            'struct-typed member within UBOs is not supported due to compatibility reasons.', tokens[idx].line);
                    }
                });
                idx = nextWord(tokens, idx);
                if (tokens[idx].data !== ';') {
                    error('EFX2209: Block declarations must be semicolon-terminated，non-array-typed and instance-name-free. ' +
                        `Please check your '${param.name}' block declaration.`, tokens[idx].line);
                }
            }
            // check for duplicates
            const item = dest.find((i) => i.name === param.name);
            if (item) {
                if (param.members && JSON.stringify(item.members) !== JSON.stringify(param.members)) {
                    error(`EFX2207: different UBO using the same name '${param.name}'`, t.line);
                }
                item.stageFlags |= mapShaderStage(stage);
                param.duplicate = item;
            }
            let beg = i;
            if (dest === shaderInfo.buffers || dest === shaderInfo.images) {
                param.memoryAccess = mappings.getMemoryAccessFlag(tokens[i - 2].data);
                if (/writeonly|readonly/.test(tokens[i - 2].data)) {
                    beg = i - 2;
                }
            }
            res.push({ beg: tokens[beg].position, end: tokens[idx].position, param: param.duplicate || param, type });
            if (!param.duplicate) {
                param.defines = stripDuplicates(defines);
                param.stageFlags = mapShaderStage(stage);
                dest.push(param);
            }
            // now we are done with the whole expression
            i = idx;
        }
        return res;
    };
})();
const miscChecks = (() => {
    // mostly from glsl 100 spec, except:
    // 'texture' is reserved on android devices with relatively new GPUs
    // usage as an identifier will lead to runtime compilation failure:
    // https://github.com/pedroSG94/rtmp-rtsp-stream-client-java/issues/146
    const reservedKeywords = 'asm|class|union|enum|typedef|template|this|packed|goto|switch|default|inline|noinline|volatile|' +
        'public|static|extern|external|interface|flat|long|short|double|half|fixed|unsigned|superp|input|' +
        'output|hvec2|hvec3|hvec4|dvec2|dvec3|dvec4|fvec2|fvec3|fvec4|sampler1D|sampler3D|sampler1DShadow|' +
        'sampler2DShadow|sampler2DRect|sampler3DRect|sampler2DRectShadow|sizeof|cast|namespace|using|texture';
    const keywordRE = new RegExp(`\\b(?:${reservedKeywords})\\b`);
    const precisionRE = /precision\s+(low|medium|high)p\s+(\w+)/;
    return (code) => {
        // precision declaration check
        const cap = precisionRE.exec(code);
        if (cap) {
            if (/#extension/.test(code.slice(cap.index))) {
                warn('EFX2400: precision declaration should come after extensions');
            }
        }
        else {
            warn('EFX2401: precision declaration not found.');
        }
        const resCap = keywordRE.exec(code);
        if (resCap) {
            error(`EFX2402: using reserved keyword in glsl1: ${resCap[0]}`);
        }
        // the parser throws obscure errors when encounters some semantic errors,
        // so in some situation disabling this might be a better option
        if (options.skipParserTest) {
            return;
        }
        // AST based checks
        const tokens = tokenizer(code).filter((t) => t.type !== 'preprocessor');
        shaderTokens = tokens;
        try {
            parser(tokens);
        }
        catch (e) {
            error(`EFX2404: glsl1 parser failed: ${e}`, 0);
        }
    };
})();
const finalTypeCheck = (() => {
    let gl = require('gl')(300, 150, { preserveDrawingBuffer: true });
    const supportedExtensions = gl.getSupportedExtensions();
    for (let i = 0; i !== supportedExtensions.length; ++i) {
        gl.getExtension(supportedExtensions[i]);
    }
    const getDefineString = (defines) => defines.reduce((acc, cur) => {
        let value = 1; // enable all boolean swithces
        switch (cur.type) {
            case 'string':
                value = cur.options[0];
                break;
            case 'number':
                value = cur.range[0];
                break;
            case 'constant':
                value = cur.default;
                break;
            case 'boolean':
                value = cur.default === undefined ? 1 : cur.default;
                break;
        }
        return `${acc}#define ${cur.name} ${value}\n`;
    }, '');
    const compile = (source, type) => {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            let lineNumber = 1;
            const dump = source.replace(/^|\n/g, () => `\n${lineNumber++} `);
            const err = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            shader = null;
            error(`EFX2406: compilation failed: ↓↓↓↓↓ EXPAND THIS MESSAGE FOR MORE INFO ↓↓↓↓↓\n${err}\n${dump}`);
        }
        return shader;
    };
    const link = (...args) => {
        let prog = gl.createProgram();
        args.forEach((s) => gl.attachShader(prog, s));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            const err = gl.getProgramInfoLog(prog);
            gl.deleteProgram(prog);
            prog = null;
            error(`EFX2407: link failed: ${err}`);
        }
        return prog;
    };
    return (vert, frag, defines, vertName, fragName) => {
        const prefix = '#version 100\n' + getDefineString(defines);
        shaderName = vertName;
        const vs = compile(prefix + vert, gl.VERTEX_SHADER);
        shaderName = fragName;
        const fs = compile(prefix + frag, gl.FRAGMENT_SHADER);
        shaderName = 'linking';
        const prog = link(vs, fs);
        gl.deleteProgram(prog);
        gl.deleteShader(fs);
        gl.deleteShader(vs);
    };
})();
const stripToSpecificVersion = (() => {
    const globalSearch = /#(if|elif|else|endif)(.*)?/g;
    const legalExpr = /^[\d<=>!|&^\s]*(__VERSION__)?[\d<=>!|&^\s]*$/; // all compile-time constant branches
    const macroWrap = (src, runtimeCond, defines) => {
        /* */
        return runtimeCond ? `#if ${runtimeCond}\n${src}#endif\n` : src;
        /* not now, maybe. the macro dependency extraction is still too fragile *
        const macros = defines.reduce((acc, cur) => `${acc} && ${cur}`, '').slice(4);
        return macros ? `#if ${macros}\n${src}#endif\n` : src;
        /* */
    };
    const declareExtension = (ext, level) => {
        if (level === 'require') {
            return `#extension ${ext}: require\n`;
        }
        return `\n#ifdef ${ext}\n#extension ${ext}: enable\n#endif\n`;
    };
    return (code, version, extensions, isVert) => {
        if (version < 310) {
            // keep std140 declaration, discard others
            code = code.replace(/layout\s*\((.*?)\)(\s*)(\w+)\s+(\w+)/g, (_, tokens, trailingSpaces, type, uType) => {
                if (!isVert && type === 'out') {
                    return _;
                } // keep Draw Buffer locations
                if (type !== 'out' && type !== 'in' && type !== 'uniform') {
                    return _;
                } // keep Storage Buffer bindings
                if (type === 'uniform' && uType.includes('image')) {
                    return _;
                } // keep Storage Image bindings
                const decl = tokens.indexOf('std140') >= 0 ? 'layout(std140)' + trailingSpaces + type : type;
                return `${decl} ${uType}`;
            });
        }
        // extraction
        const instances = [];
        let cap = null, temp = null;
        /* eslint-disable-next-line */
        while (true) {
            // eslint-disable-line
            cap = globalSearch.exec(code);
            if (!cap) {
                break;
            }
            if (cap[1] === 'if') {
                if (temp) {
                    temp.level++;
                    continue;
                }
                if (!legalExpr.test(cap[2])) {
                    continue;
                }
                temp = { start: cap.index, end: cap.index, conds: [cap[2]], content: [cap.index + cap[0].length], level: 1 };
            }
            else if (cap[1] === 'elif') {
                if (!temp || temp.level > 1) {
                    continue;
                }
                if (!legalExpr.test(cap[2])) {
                    error(`EFX2301: #elif conditions after a constant #if should be constant too; get '${cap[2]}'`);
                    cap[2] = '';
                }
                temp.conds.push(cap[2]);
                temp.content.push(cap.index, cap.index + cap[0].length);
            }
            else if (cap[1] === 'else') {
                if (!temp || temp.level > 1) {
                    continue;
                }
                temp.conds.push('true');
                temp.content.push(cap.index, cap.index + cap[0].length);
            }
            else if (cap[1] === 'endif') {
                if (!temp || --temp.level) {
                    continue;
                }
                temp.content.push(cap.index);
                temp.end = cap.index + cap[0].length;
                instances.push(temp);
                temp = null;
            }
        }
        let res = code;
        if (instances.length) {
            // replacement
            res = res.substring(0, instances[0].start);
            for (let j = 0; j < instances.length; j++) {
                const ins = instances[j];
                for (let i = 0; i < ins.conds.length; i++) {
                    if (eval(ins.conds[i].replace('__VERSION__', version))) {
                        const subBlock = code.substring(ins.content[i * 2], ins.content[i * 2 + 1]);
                        res += stripToSpecificVersion(subBlock, version, isVert);
                        break;
                    }
                }
                const next = (instances[j + 1] && instances[j + 1].start) || code.length;
                res += code.substring(ins.end, next);
            }
        }
        // extensions
        for (const ext in extensions) {
            const { defines, cond, level, runtimeCond } = extensions[ext];
            if (eval(cond.replace('__VERSION__', version))) {
                res = macroWrap(declareExtension(ext, level), runtimeCond, defines) + res;
            }
        }
        return res;
    };
})();
const glsl300to100 = (code, blocks, defines, paramInfo, functions, cache, vert) => {
    let res = '';
    // unpack UBOs
    let idx = 0;
    paramInfo.forEach((i) => {
        if (i.type !== 'blocks') {
            return;
        }
        res += code.slice(idx, i.beg);
        const indentCount = res.length - res.search(/\s*$/) + 1;
        blocks
            .find((u) => u.name === i.param.name)
            .members.forEach((m) => {
            // crucial optimization, for the uniform vectors in WebGL (iOS especially) is extremely limited
            const matches = code.match(new RegExp(`\\b${m.name}\\b`, 'g'));
            if (!matches || matches.length <= 1) {
                return;
            }
            const type = convertType(m.type);
            const precision = m.precision || '';
            const arraySpec = typeof m.count === 'string' || m.isArray ? `[${m.count}]` : '';
            res += ' '.repeat(indentCount) + `uniform ${precision}${type} ${m.name}${arraySpec};\n`;
        });
        idx = i.end + (code[i.end] === ';');
    });
    res += code.slice(idx);
    // texture functions
    res = res.replace(/\btexture((?!2D|Cube)\w*)\s*\(\s*(\w+)\s*([,[])/g, (original, suffix, name, endToken, idx) => {
        // skip replacement if function already defined
        const fnName = 'texture' + suffix;
        if (functions.find((f) => f.name === fnName)) {
            return original;
        }
        // find in parent scope first
        let re = new RegExp('sampler(\\w+)\\s+' + name);
        const scope = functions.find((f) => idx > f.beg && idx < f.end);
        let cap = (scope && re.exec(res.substring(scope.beg, scope.eng))) || re.exec(res);
        if (!cap) {
            // perhaps defined in macro
            const def = defines.find((d) => d.name === name);
            if (def && def.options) {
                for (const n of def.options) {
                    re = new RegExp('sampler(\\w+)\\s+' + n);
                    cap = re.exec(res);
                    if (cap) {
                        break;
                    }
                }
            }
            if (!cap) {
                error(`EFX2300: sampler '${name}' does not exist`);
                return original;
            }
        }
        const texFnType = textureFuncRemap.get(cap[1]) ?? cap[1];
        return `texture${texFnType}${suffix}(${name}${endToken}`;
    });
    if (vert) {
        // in/out => attribute/varying
        res = res.replace(inDecl, (str, qualifiers, decl) => `attribute ${decl};`);
        res = res.replace(outDecl, (str, qualifiers, decl) => `varying ${decl};`);
    }
    else {
        // in/out => varying/gl_FragColor
        res = res.replace(inDecl, (str, qualifiers, decl) => `varying ${decl};`);
        const outList = [];
        res = res.replace(outDecl, (str, qualifiers, decl, name) => {
            const locationCap = qualifiers && locationRE.exec(qualifiers);
            if (!locationCap) {
                error('EFX2302: fragment output location must be specified');
            }
            outList.push({ name, location: locationCap[1] });
            return '';
        });
        if (outList.length === 1) {
            const outRE = new RegExp(`\\b${outList[0].name}\\b`, 'g');
            res = res.replace(outRE, 'gl_FragColor');
        }
        else if (outList.length > 1) {
            // EXT_draw_buffers
            for (const out of outList) {
                const outRE = new RegExp(`\\b${out.name}\\b`, 'g');
                res = res.replace(outRE, `gl_FragData[${out.location}]`);
            }
            if (!cache.extensions['GL_EXT_draw_buffers']) {
                cache.extensions['GL_EXT_draw_buffers'] = {
                    defines: [],
                    cond: '__VERSION__ <= 100',
                    // we can't reliably deduce the macro dependecies for this extension
                    // so not making this a hard require here
                    level: 'enable',
                };
            }
        }
    }
    res = res.replace(/layout\s*\(.*?\)\s*/g, () => ''); // layout qualifiers
    return res.replace(pragmasToStrip, ''); // strip pragmas here for a cleaner webgl compiler output
};
const decorateBlockMemoryLayouts = (code, paramInfo) => {
    let idx = 0;
    const positions = [];
    paramInfo.forEach((info, paramIdx) => {
        if (info.type !== 'blocks' && info.type !== 'buffers') {
            return;
        }
        const isSSBO = info.type === 'buffers';
        const frag = code.slice(idx, info.beg);
        const cap = layoutExtract.exec(frag);
        positions[paramIdx] = cap ? idx + cap.index + (isSSBO ? 0 : cap[0].length - cap[2].length - 1) : -1;
        idx = info.end;
    });
    let res = '';
    idx = 0;
    paramInfo.forEach((info, paramIdx) => {
        const position = positions[paramIdx];
        if (position === undefined) {
            return;
        }
        // insert declarations
        if (info.type === 'blocks') {
            // UBO-specific
            if (position < 0) {
                // no qualifier, just insert everything
                res += code.slice(idx, info.beg);
                res += 'layout(std140) ';
            }
            else {
                // append the token
                res += code.slice(idx, position);
                res += ', std140';
                res += code.slice(position, info.beg);
            }
        }
        else if (info.type === 'buffers') {
            // SSBO-specific
            let declaration = 'std430'; // std430 are preferred for SSBOs
            if (info.param.tags && info.param.tags.glBinding !== undefined) {
                declaration += `, binding = ${info.param.tags.glBinding}`;
            }
            // ignore input specifiers
            res += code.slice(idx, position < 0 ? info.beg : position);
            res += `layout(${declaration}) `;
        }
        res += code.slice(info.beg, info.end);
        idx = info.end;
    });
    res += code.slice(idx);
    return res;
};
const decorateBindings = (code, manifest, paramInfo) => {
    paramInfo = paramInfo.filter((i) => !builtinRE.test(i.param.name));
    let idx = 0;
    const record = [];
    const overrides = {};
    // extract existing binding infos
    paramInfo.forEach((info, paramIdx) => {
        // overlapping locations/bindings under different macros are not supported yet
        if (info.type === 'fragColors') {
            return;
        }
        const name = info.param.name;
        if (!manifest[info.type]) {
            return;
        }
        const frag = code.slice(idx, info.beg);
        const layoutInfo = { prop: info.param };
        const cap = layoutExtract.exec(frag);
        const category = overrides[info.type] || (overrides[info.type] = {});
        if (cap) {
            // position of ')'
            layoutInfo.position = idx + cap.index + cap[0].length - cap[2].length - 1;
            const bindingCap = bindingExtract.exec(cap[1]);
            if (bindingCap) {
                if (cap[1].search(/\bset\s*=/) < 0) {
                    layoutInfo.position = cap[1].length - layoutInfo.position;
                } // should insert set declaration
                else {
                    layoutInfo.position = -1;
                } // indicating no-op
                const value = parseInt(bindingCap[1]);
                // adapt bindings
                const dest = info.type === 'varyings' || info.type === 'attributes' ? 'location' : 'binding';
                let validSubstitution = manifest[info.type].find((v) => v[dest] === value);
                if (!validSubstitution && info.type === 'subpassInputs') {
                    // input attachments need fallback bindings, skip this check
                    validSubstitution = true;
                }
                if (validSubstitution) {
                    // auto-generated binding is guaranteed to be consecutive
                    if (category[value] && category[value] !== name) {
                        error(`EFX2600: duplicated binding/location declaration for '${category[value]}' and '${name}'`);
                    }
                    category[(category[value] = name)] = value;
                }
                else if (info.type === 'blocks') {
                    error(`EFX2601: illegal custom binding for '${name}', block bindings should be consecutive and start from 0`);
                }
                else if (info.type === 'samplerTextures') {
                    error(`EFX2602: illegal custom binding for '${name}', texture bindings should be consecutive and after all the blocks`);
                }
                else if (info.type === 'buffers') {
                    error(`EFX2603: illegal custom binding for '${name}', buffer bindings should be consecutive and after all the ` +
                        'blocks/samplerTextures');
                }
                else if (info.type === 'images') {
                    error(`EFX2604: illegal custom binding for '${name}', image bindings should be consecutive and after all the ` +
                        'blocks/samplerTextures/buffers');
                }
                else if (info.type === 'textures') {
                    error(`EFX2605: illegal custom binding for '${name}', texture bindings should be consecutive and after all the ` +
                        'blocks/samplerTextures/buffers/images');
                }
                else if (info.type === 'samplers') {
                    error(`EFX2606: illegal custom binding for '${name}', sampler bindings should be consecutive and after all the ` +
                        'blocks/samplerTextures/buffers/images/textures');
                }
                else {
                    // attributes or varyings
                    error(`EFX2607: illegal custom location for '${name}', locations should be consecutive and start from 0`);
                }
            }
        }
        record[paramIdx] = layoutInfo;
        idx = info.end;
    });
    // override bindings/locations
    paramInfo.forEach((info, paramIdx) => {
        if (!overrides[info.type]) {
            return;
        }
        const needLocation = info.type === 'attributes' || info.type === 'varyings' || info.type === 'fragColors';
        const dest = needLocation ? 'location' : 'binding';
        const category = overrides[info.type];
        const name = info.param.name;
        if (info.type === 'attributes') {
            // some rationale behind these oddities:
            // 1. paramInfo member is guaranteed to be in consistent order with manifest members
            // 2. we want the output number to be as consistent as possible with their declaration order.
            //    e.g. gfx.InputState utilizes declaration order to calculate buffer offsets, etc.
            if (name in category) {
                record[paramIdx].prop[dest] = category[name];
            }
            else {
                let n = 0;
                while (category[n]) {
                    n++;
                }
                record[paramIdx].prop[dest] = n;
                category[n] = name;
            }
        }
        else {
            if (name in category) {
                const oldLocation = record[paramIdx].prop[dest];
                const substitute = manifest[info.type].find((v) => v[dest] === category[name]);
                if (substitute) {
                    substitute[dest] = oldLocation;
                }
                record[paramIdx].prop[dest] = category[name];
            }
        }
    });
    // insert declarations
    let res = '';
    idx = 0;
    const setIndex = mappings.SetIndex.MATERIAL;
    paramInfo.forEach((info, paramIdx) => {
        if (!record[paramIdx]) {
            return;
        }
        const needLocation = info.type === 'attributes' || info.type === 'varyings' || info.type === 'fragColors';
        const dest = needLocation ? 'location' : 'binding';
        const { position, prop } = record[paramIdx];
        const setDeclaration = needLocation ? '' : `set = ${setIndex}, `;
        // insert declaration
        if (position === undefined) {
            // no qualifier, just insert everything
            res += code.slice(idx, info.beg);
            res += `layout(${setDeclaration + dest} = ${prop[dest]}) `;
        }
        else if (position >= 0) {
            // qualifier exists, but no binding specified
            res += code.slice(idx, position);
            res += `, ${setDeclaration + dest} = ${prop[dest]}`;
            res += code.slice(position, info.beg);
        }
        else if (position < -1) {
            // binding exists, but no set specified
            res += code.slice(idx, -position);
            res += setDeclaration;
            res += code.slice(-position, info.beg);
        }
        else {
            // no-op, binding is already specified
            res += code.slice(idx, info.beg);
        }
        res += code.slice(info.beg, info.end);
        idx = info.end;
    });
    res += code.slice(idx);
    // remove subpass fallback declarations
    manifest.samplerTextures = manifest.samplerTextures.filter((t) => manifest.subpassInputs.findIndex((s) => s.binding === t.binding) < 0);
    return res;
};
const remapDefine = (obj, substituteMap) => {
    for (let i = 0; i < obj.defines.length; ++i) {
        let subVal = substituteMap.get(obj.defines[i]);
        while (subVal) {
            obj.defines[i] = subVal;
            subVal = substituteMap.get(subVal);
        }
    }
};
const shaderFactory = (() => {
    const trailingSpaces = /\s+$/gm;
    const newlines = /(^\s*\n){2,}/gm;
    const clean = (code) => {
        let result = code.replace(pragmasToStrip, ''); // strip our pragmas
        result = result.replace(newlines, '\n'); // squash multiple newlines
        result = result.replace(trailingSpaces, '');
        return result;
    };
    const objectMap = (obj, fn) => Object.keys(obj).reduce((acc, cur) => ((acc[cur] = fn(cur)), acc), {});
    const filterFactory = (target, builtins) => (u) => {
        if (!builtinRE.test(u.name)) {
            return true;
        }
        const tags = u.tags;
        let type;
        if (!tags || !tags.builtin) {
            type = 'global';
        }
        else {
            type = tags.builtin;
        }
        builtins[`${type}s`][target].push({ name: u.name, defines: u.defines });
        return false;
    };
    const classifyDescriptor = (descriptors, shaderInfo, member) => {
        const instance = 0;
        const batch = 1;
        // const phase = 2;
        const pass = 3;
        const sources = shaderInfo[member];
        for (let i = 0; i !== sources.length; ++i) {
            const info = sources[i];
            if (info.rate !== undefined) {
                descriptors[info.rate][member].push(info);
                continue;
            }
            if (!builtinRE.test(info.name)) {
                descriptors[batch][member].push(info);
                continue;
            }
            const tags = info.tags;
            if (!info.tags || !info.tags.builtin) {
                descriptors[pass][member].push(info);
            }
            else {
                if (tags.builtin === 'global') {
                    descriptors[pass][member].push(info);
                }
                else if (tags.builtin === 'local') {
                    descriptors[instance][member].push(info);
                }
            }
        }
    };
    const classifyDescriptors = (descriptors, shaderInfo) => {
        classifyDescriptor(descriptors, shaderInfo, 'blocks');
        classifyDescriptor(descriptors, shaderInfo, 'samplerTextures');
        classifyDescriptor(descriptors, shaderInfo, 'samplers');
        classifyDescriptor(descriptors, shaderInfo, 'textures');
        classifyDescriptor(descriptors, shaderInfo, 'buffers');
        classifyDescriptor(descriptors, shaderInfo, 'images');
        classifyDescriptor(descriptors, shaderInfo, 'subpassInputs');
    };
    const wrapEntry = (() => {
        const wrapperFactory = (stage, fn) => {
            switch (stage) {
                case 'vert':
                    return `\nvoid main() { gl_Position = ${fn}(); }\n`;
                case 'frag':
                    return `\nlayout(location = 0) out vec4 cc_FragColor;\nvoid main() { cc_FragColor = ${fn}(); }\n`;
                default:
                    return `\nvoid main() { ${fn}(); }\n`;
            }
        };
        return (content, entry, stage) => (entry === 'main' ? content : content + wrapperFactory(stage, entry));
    })();
    const entryRE = /([^:]+)(?::(\w+))?/;
    const preprocess = (name, chunks, deprecations, stage, defaultEntry = 'main') => {
        const entryCap = entryRE.exec(name);
        const entry = entryCap[2] || defaultEntry;
        const record = new Set();
        const functions = [];
        let code = unwindIncludes(`#include <${entryCap[1]}>`, chunks, deprecations, record);
        code = wrapEntry(code, entry, stage);
        code = expandSubpassInout(code);
        code = expandLiteralMacro(code);
        code = expandFunctionalMacro(code);
        code = eliminateDeadCode(code, entry, functions); // this has to be the last process, or the `functions` output won't match
        return { code, record, functions };
    };
    const rateMapping = {
        instance: 0,
        batch: 1,
        phase: 2,
        pass: 3,
    };
    const assignRate = (entry, rates) => {
        entry.forEach((i) => {
            const rate = rates.find((r) => r.name === i.name);
            if (rate) {
                i.rate = rateMapping[rate.rate];
            }
        });
    };
    const assignSampleType = (entry, sampleTypes) => {
        entry.forEach((i) => {
            const sampleTypeInfo = sampleTypes.find((s) => s.name === i.name);
            if (sampleTypeInfo) {
                i.sampleType = sampleTypeInfo.sampleType;
            }
            else {
                i.sampleType = 0; // SampleType.FLOAT;
            }
        });
    };
    const tokenizerOpt = { version: '300 es' };
    const createShaderInfo = () => ({
        blocks: [],
        samplerTextures: [],
        samplers: [],
        textures: [],
        buffers: [],
        images: [],
        subpassInputs: [],
        attributes: [],
        varyings: [],
        fragColors: [],
        descriptors: [],
    });
    const compile = (name, stage, outDefines = [], shaderInfo = createShaderInfo(), chunks = globalChunks, deprecations = globalDeprecations) => {
        const out = {};
        shaderName = name;
        const cache = { lines: [], extensions: {} };
        const { code, record, functions } = preprocess(name, chunks, deprecations, stage);
        const tokens = (shaderTokens = tokenizer(code, tokenizerOpt));
        // [0]: existingDefines; [1]: substituteMap
        const res = extractMacroDefinitions(code);
        cache.existingDefines = res[0];
        const substituteMap = res[1];
        extractDefines(tokens, outDefines, cache);
        const rates = extractUpdateRates(tokens);
        const sampleTypes = extractUnfilterableFloat(tokens);
        const blockInfo = extractParams(tokens, cache, shaderInfo, stage, functions);
        shaderInfo.samplerTextures = shaderInfo.samplerTextures.filter((ele) => !shaderInfo.subpassInputs.find((obj) => obj.name === ele.name));
        out.blockInfo = blockInfo; // pass forward
        out.record = record; // header dependencies
        out.extensions = cache.extensions; // extensions requests
        out.glsl4 = code;
        shaderInfo.attributes.forEach((attr) => {
            remapDefine(attr, substituteMap);
        });
        shaderInfo.blocks.forEach((block) => {
            remapDefine(block, substituteMap);
        });
        shaderInfo.buffers.forEach((buffer) => {
            remapDefine(buffer, substituteMap);
        });
        shaderInfo.images.forEach((image) => {
            remapDefine(image, substituteMap);
        });
        shaderInfo.samplerTextures.forEach((samplerTexture) => {
            remapDefine(samplerTexture, substituteMap);
        });
        shaderInfo.samplers.forEach((sampler) => {
            remapDefine(sampler, substituteMap);
        });
        shaderInfo.textures.forEach((texture) => {
            remapDefine(texture, substituteMap);
        });
        assignRate(shaderInfo.blocks, rates);
        assignRate(shaderInfo.buffers, rates);
        assignRate(shaderInfo.images, rates);
        assignRate(shaderInfo.samplerTextures, rates);
        assignRate(shaderInfo.samplers, rates);
        assignRate(shaderInfo.textures, rates);
        assignRate(shaderInfo.subpassInputs, rates);
        assignSampleType(shaderInfo.samplerTextures, sampleTypes);
        assignSampleType(shaderInfo.textures, sampleTypes);
        const isVert = stage == 'vert';
        out.glsl3 = stripToSpecificVersion(decorateBlockMemoryLayouts(code, blockInfo), 300, cache.extensions, isVert); // GLES3 needs explicit memory layout qualifier
        if (stage == 'vert' || stage == 'frag') {
            // glsl1 only supports vert and frag
            out.glsl1 = stripToSpecificVersion(glsl300to100(code, shaderInfo.blocks, outDefines, blockInfo, functions, cache, isVert), 100, cache.extensions, isVert);
            miscChecks(out.glsl1); // TODO : add higher version checks
        }
        else {
            out.glsl1 = '';
        }
        return out;
    };
    const createBuiltinInfo = () => ({ blocks: [], samplerTextures: [], buffers: [], images: [] });
    const build = (stageNames, type, chunks = globalChunks, deprecations = globalDeprecations) => {
        let defines = [];
        const shaderInfo = createShaderInfo();
        const src = { vert: '', frag: '' };
        for (const stage in stageNames) {
            src[stage] = compile(stageNames[stage], stage, defines, shaderInfo, chunks, deprecations);
        }
        if (type === 'graphics') {
            finalTypeCheck(src.vert.glsl1, src.frag.glsl1, defines, stageNames['vert'], stageNames['frag']);
        }
        const builtins = { globals: createBuiltinInfo(), locals: createBuiltinInfo(), statistics: {} };
        // strip runtime constants & generate statistics
        defines = defines.filter((d) => d.type !== 'constant');
        let vsUniformVectors = 0, fsUniformVectors = 0, csUniformVectors = 0;
        shaderInfo.blocks.forEach((b) => {
            const vectors = b.members.reduce((acc, cur) => {
                if (typeof cur.count !== 'number') {
                    return acc;
                }
                return acc + Math.ceil(mappings.GetTypeSize(cur.type) / 16) * cur.count;
            }, 0);
            if (b.stageFlags & VSBit) {
                vsUniformVectors += vectors;
            }
            if (b.stageFlags & FSBit) {
                fsUniformVectors += vectors;
            }
            if (b.stageFlags & CSBit) {
                csUniformVectors += vectors;
            }
        }, 0);
        if (type === 'graphics') {
            builtins.statistics.CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = vsUniformVectors;
            builtins.statistics.CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = fsUniformVectors;
        }
        if (type === 'compute') {
            builtins.statistics.CC_EFFECT_USED_COMPUTE_UNIFORM_VECTORS = csUniformVectors;
        }
        // filter out pipeline builtin params
        shaderInfo.descriptors[0] = {
            rate: 0,
            blocks: [],
            samplerTextures: [],
            samplers: [],
            textures: [],
            buffers: [],
            images: [],
            subpassInputs: [],
        };
        shaderInfo.descriptors[1] = {
            rate: 1,
            blocks: [],
            samplerTextures: [],
            samplers: [],
            textures: [],
            buffers: [],
            images: [],
            subpassInputs: [],
        };
        shaderInfo.descriptors[2] = {
            rate: 2,
            blocks: [],
            samplerTextures: [],
            samplers: [],
            textures: [],
            buffers: [],
            images: [],
            subpassInputs: [],
        };
        shaderInfo.descriptors[3] = {
            rate: 3,
            blocks: [],
            samplerTextures: [],
            samplers: [],
            textures: [],
            buffers: [],
            images: [],
            subpassInputs: [],
        };
        classifyDescriptors(shaderInfo.descriptors, shaderInfo);
        // convert count from string to 0, avoiding jsb crash
        for (let k = 0; k !== 4; ++k) {
            const set = shaderInfo.descriptors[k];
            set.blocks.forEach((b) => {
                for (const m of b.members) {
                    if (typeof m.count !== 'number') {
                        m.count = 0;
                    }
                }
            });
        }
        // filter descriptors
        shaderInfo.blocks = shaderInfo.blocks.filter(filterFactory('blocks', builtins));
        shaderInfo.samplerTextures = shaderInfo.samplerTextures.filter(filterFactory('samplerTextures', builtins));
        shaderInfo.buffers = shaderInfo.buffers.filter(filterFactory('buffers', builtins));
        shaderInfo.images = shaderInfo.images.filter(filterFactory('images', builtins));
        // attribute property process
        shaderInfo.attributes.forEach((a) => {
            a.format = mappings.formatMap[a.typename];
            if (a.defines.indexOf('USE_INSTANCING') >= 0) {
                a.isInstanced = true;
            }
            if (a.tags && a.tags.format) {
                // custom format
                const f = mappings.getFormat(a.tags.format);
                if (f !== undefined) {
                    a.format = f;
                }
                if (mappings.isNormalized(f)) {
                    a.isNormalized = true;
                }
            }
        });
        // strip the intermediate informations
        shaderInfo.attributes.forEach((v) => (delete v.tags, delete v.typename, delete v.precision, delete v.isArray, delete v.type, delete v.count, delete v.stageFlags));
        shaderInfo.varyings.forEach((v) => (delete v.tags, delete v.typename, delete v.precision, delete v.isArray));
        shaderInfo.blocks.forEach((b) => (delete b.rate, delete b.tags, b.members.forEach((v) => (delete v.typename, delete v.precision, delete v.isArray))));
        shaderInfo.samplerTextures.forEach((v) => (delete v.rate, delete v.tags, delete v.typename, delete v.precision, delete v.isArray));
        shaderInfo.buffers.forEach((v) => (delete v.rate, delete v.tags, delete v.typename, delete v.precision, delete v.isArray, delete v.members));
        shaderInfo.images.forEach((v) => (delete v.rate, delete v.tags, delete v.typename, delete v.precision, delete v.isArray));
        shaderInfo.textures.forEach((v) => (delete v.rate, delete v.tags, delete v.typename, delete v.precision, delete v.isArray));
        shaderInfo.samplers.forEach((v) => (delete v.rate, delete v.tags, delete v.typename, delete v.precision, delete v.isArray));
        shaderInfo.subpassInputs.forEach((v) => (delete v.rate, delete v.tags, delete v.typename, delete v.precision, delete v.isArray));
        // assign bindings
        let bindingIdx = 0;
        shaderInfo.blocks.forEach((u) => (u.binding = bindingIdx++));
        shaderInfo.samplerTextures.forEach((u) => (u.binding = bindingIdx++));
        shaderInfo.samplers.forEach((u) => (u.binding = bindingIdx++));
        shaderInfo.textures.forEach((u) => (u.binding = bindingIdx++));
        shaderInfo.buffers.forEach((u) => (u.binding = bindingIdx++));
        shaderInfo.images.forEach((u) => (u.binding = bindingIdx++));
        shaderInfo.subpassInputs.forEach((u) => (u.binding = bindingIdx++));
        let locationIdx = 0;
        shaderInfo.attributes.forEach((a) => (a.location = locationIdx++));
        locationIdx = 0;
        shaderInfo.varyings.forEach((u) => (u.location = locationIdx++));
        locationIdx = 0;
        shaderInfo.fragColors.forEach((u) => (u.location = locationIdx++));
        // filter defines for json
        shaderInfo.blocks.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.samplerTextures.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.samplers.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.textures.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.buffers.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.images.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.subpassInputs.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.attributes.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.varyings.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        shaderInfo.fragColors.forEach((u) => (u.defines = u.defines.filter((d) => defines.find((def) => d.endsWith(def.name)))));
        // generate binding layout for glsl4
        const glsl1 = {}, glsl3 = {}, glsl4 = {};
        const record = new Set();
        for (const stage in stageNames) {
            // generate binding layout for glsl4
            const isVert = stage === 'vert';
            src[stage].glsl4 = stripToSpecificVersion(decorateBindings(src[stage].glsl4, shaderInfo, src[stage].blockInfo), 460, src[stage].extensions, isVert);
            glsl4[stage] = clean(src[stage].glsl4); // for SPIR-V-based cross-compilation
            glsl3[stage] = clean(src[stage].glsl3); // for WebGL2/GLES3
            glsl1[stage] = clean(src[stage].glsl1); // for WebGL/GLES2
            src[stage].record.forEach((v) => record.add(v));
        }
        let hash = 0;
        if (type === 'graphics') {
            if (glsl4.compute || glsl3.compute) {
                error('compute shader is not supported in graphics effect');
            }
            hash = mappings.murmurhash2_32_gc(glsl4.vert + glsl4.frag + glsl3.vert + glsl3.frag + glsl1.vert + glsl1.frag, 666);
        }
        else {
            if (glsl4.vert || glsl4.frag || glsl3.vert || glsl3.frag || glsl1.vert || glsl1.frag) {
                error('vertex/fragment shader is not supported in compute effect');
            }
            hash = mappings.murmurhash2_32_gc(glsl4.vert + glsl4.frag + glsl4.compute + glsl3.vert + glsl3.frag + glsl3.compute + glsl1.vert + glsl1.frag, 666);
        }
        const passGroup = shaderInfo.descriptors[3];
        shaderInfo.blocks = shaderInfo.blocks.filter((v) => passGroup.blocks.every((t) => t.name !== v.name));
        shaderInfo.samplerTextures = shaderInfo.samplerTextures.filter((v) => passGroup.samplerTextures.every((t) => t.name !== v.name));
        shaderInfo.samplers = shaderInfo.samplers.filter((v) => passGroup.samplers.every((t) => t.name !== v.name));
        shaderInfo.textures = shaderInfo.textures.filter((v) => passGroup.textures.every((t) => t.name !== v.name));
        shaderInfo.buffers = shaderInfo.buffers.filter((v) => passGroup.buffers.every((t) => t.name !== v.name));
        shaderInfo.images = shaderInfo.images.filter((v) => passGroup.images.every((t) => t.name !== v.name));
        return Object.assign(shaderInfo, { hash, glsl4, glsl3, glsl1, builtins, defines, record });
    };
    return { compile, build };
})();
const compileShader = shaderFactory.compile;
// ==================
// effects
// ==================
const parseEffect = (() => {
    const effectRE = /CCEffect\s*%{([^]+?)(?:}%|%})/;
    const programRE = /CCProgram\s*([\w-]+)\s*%{([^]*?)(?:}%|%})/;
    const hashComments = /#.*$/gm;
    const whitespaces = /^\s*$/;
    const noIndent = /\n[^\s]/;
    const leadingSpace = /^[^\S\n]/gm; // \s without \n
    const tabs = /\t/g;
    const stripHashComments = (code) => code.replace(hashComments, '');
    const structuralTypeCheck = (ref, cur, path = 'effect') => {
        if (Array.isArray(ref)) {
            if (!Array.isArray(cur)) {
                error(`EFX1002: ${path} must be an array`);
                return;
            }
            if (ref[0]) {
                for (let i = 0; i < cur.length; i++) {
                    structuralTypeCheck(ref[0], cur[i], path + `[${i}]`);
                }
            }
        }
        else {
            if (!cur || typeof cur !== 'object' || Array.isArray(cur)) {
                error(`EFX1003: ${path} must be an object`);
                return;
            }
            for (const key of Object.keys(cur)) {
                if (key.indexOf(':') !== -1) {
                    error(`EFX1004: syntax error at '${key}', you might need to insert a space after colon`);
                }
            }
            if (ref.any) {
                for (const key of Object.keys(cur)) {
                    structuralTypeCheck(ref.any, cur[key], path + `.${key}`);
                }
            }
            else {
                for (const key of Object.keys(ref)) {
                    let testKey = key;
                    if (testKey[0] === '$') {
                        testKey = testKey.substring(1);
                    }
                    else if (!cur[testKey]) {
                        continue;
                    }
                    structuralTypeCheck(ref[key], cur[testKey], path + `.${testKey}`);
                }
            }
        }
    };
    return (name, content) => {
        shaderName = 'syntax';
        content = content.replace(tabs, ' '.repeat(tabAsSpaces));
        // process each block
        let effect = {}, templates = {}, localDeprecations = {};
        const effectCap = effectRE.exec(stripHashComments(content));
        if (!effectCap) {
            error('EFX1000: CCEffect is not defined');
        }
        else {
            try {
                const src = yaml.load(effectCap[1]);
                // deep clone to decouple references
                effect = JSON.parse(JSON.stringify(src));
            }
            catch (e) {
                error(`EFX1001: CCEffect parser failed: ${e}`);
            }
            if (!effect.name) {
                effect.name = name;
            }
            structuralTypeCheck(mappings.effectStructure, effect);
        }
        content = stripComments(content);
        let programCap = programRE.exec(content);
        while (programCap) {
            let result = programCap[2];
            if (!whitespaces.test(result)) {
                // skip this for empty blocks
                while (!noIndent.test(result)) {
                    result = result.replace(leadingSpace, '');
                }
            }
            addChunk(programCap[1], result, templates, localDeprecations);
            content = content.substring(programCap.index + programCap[0].length);
            programCap = programRE.exec(content);
        }
        return { effect, templates, localDeprecations };
    };
})();
const mapPassParam = (() => {
    const findUniformType = (name, shader) => {
        let res = 0, cb = (u) => {
            if (u.name !== name) {
                return false;
            }
            res = u.type;
            return true;
        };
        if (!shader.blocks.some((b) => b.members.some(cb))) {
            shader.samplerTextures.some(cb);
        }
        return res;
    };
    const propTypeCheck = (value, type, givenType) => {
        if (type <= 0) {
            return 'no matching uniform';
        }
        if (value === undefined) {
            return '';
        } // default value
        if (givenType === 'string') {
            if (!mappings.isSampler(type)) {
                return 'string for vectors';
            }
        }
        else if (!Array.isArray(value)) {
            return 'non-array for buffer members';
        }
        else if (value.length !== mappings.GetTypeSize(type) / 4) {
            return 'wrong array length';
        }
        return '';
    };
    const targetRE = /^(\w+)(?:\.([xyzw]+|[rgba]+))?$/;
    const channelMap = { x: 0, y: 1, z: 2, w: 3, r: 0, g: 1, b: 2, a: 3 };
    const mapTarget = (target, shader) => {
        const handleInfo = [target, 0, 0];
        const cap = targetRE.exec(target);
        if (!cap) {
            error(`EFX3303: illegal property target '${target}'`);
            return handleInfo;
        }
        const swizzle = (cap[2] && cap[2].toLowerCase()) || '';
        const beginning = channelMap[swizzle[0]] || 0;
        if (swizzle
            .split('')
            .map((c, idx) => channelMap[c] - beginning - idx)
            .some((n) => n)) {
            error(`EFX3304: '${target}': random component swizzle is not supported`);
        }
        handleInfo[0] = cap[1];
        handleInfo[1] = beginning;
        handleInfo[2] = findUniformType(cap[1], shader);
        if (swizzle.length) {
            handleInfo[2] -= Math.max(0, mappings.GetTypeSize(handleInfo[2]) / 4 - swizzle.length);
        }
        if (handleInfo[2] <= 0) {
            error(`EFX3305: no matching uniform target '${target}'`);
        }
        return handleInfo;
    };
    const mapProperties = (props, shader) => {
        let metadata = {};
        for (const p of Object.keys(props)) {
            if (p === '__metadata__') {
                metadata = props[p];
                delete props[p];
                continue;
            }
            const info = props[p], shaderType = findUniformType(p, shader);
            // type translation or extraction
            if (info.type !== undefined) {
                warn(`EFX3300: property '${p}': you don't have to specify type in here`);
            }
            info.type = shaderType;
            // target specification
            if (info.target) {
                info.handleInfo = mapTarget(info.target, shader);
                delete info.target;
                info.type = info.handleInfo[2];
                // polyfill source property
                const deprecated = info.editor && info.editor.visible;
                const target = info.handleInfo[0], targetType = findUniformType(info.handleInfo[0], shader);
                if (!props[target]) {
                    props[target] = { type: targetType, editor: { visible: false } };
                }
                if (deprecated === undefined || deprecated) {
                    if (!props[target].editor) {
                        props[target].editor = { deprecated: true };
                    }
                    else if (props[target].editor.deprecated === undefined) {
                        props[target].editor.deprecated = true;
                    }
                }
                if (mappings.isSampler(targetType)) {
                    if (info.value) {
                        props[target].value = info.value;
                    }
                }
                else {
                    if (!props[target].value) {
                        props[target].value = Array(mappings.GetTypeSize(targetType) / 4).fill(0);
                    }
                    if (Array.isArray(info.value)) {
                        props[target].value.splice(info.handleInfo[1], info.value.length, ...info.value);
                    }
                    else if (info.value !== undefined) {
                        props[target].value.splice(info.handleInfo[1], 1, info.value);
                    }
                }
            }
            // sampler specification
            if (info.sampler) {
                info.samplerHash = mapSampler(generalMap(info.sampler));
                delete info.sampler;
            }
            // default values
            const givenType = typeof info.value;
            // convert numbers to array
            if (givenType === 'number' || givenType === 'boolean') {
                info.value = [info.value];
            }
            // type check the given value
            const msg = propTypeCheck(info.value, info.type, givenType);
            if (msg) {
                error(`EFX3302: illegal property declaration for '${p}': ${msg}`);
            }
        }
        for (const p of Object.keys(props)) {
            patchMetadata(props[p], metadata);
        }
        return props;
    };
    const patchMetadata = (target, metadata) => {
        for (const k of Object.keys(metadata)) {
            const v = metadata[k];
            if (typeof v === 'object' && typeof target[k] === 'object') {
                patchMetadata(target[k], v);
            }
            else if (target[k] === undefined) {
                target[k] = v;
            }
        }
    };
    const generalMap = (obj) => {
        for (const key in obj) {
            const prop = obj[key];
            if (typeof prop === 'string') {
                // string literal
                let num = parseInt(prop);
                if (isNaN(num)) {
                    num = mappings.passParams[prop.toUpperCase()];
                }
                if (num !== undefined) {
                    obj[key] = num;
                }
            }
            else if (Array.isArray(prop)) {
                // arrays:
                if (!prop.length) {
                    continue;
                } // empty
                switch (typeof prop[0]) {
                    case 'object':
                        prop.forEach(generalMap);
                        break; // nested props
                    case 'string':
                        generalMap(prop);
                        break; // string array
                    case 'number':
                        obj[key] = // color array
                            (((prop[0] * 255) << 24) | ((prop[1] * 255) << 16) | ((prop[2] * 255) << 8) | ((prop[3] || 255) * 255)) >>> 0;
                }
            }
            else if (typeof prop === 'object') {
                generalMap(prop); // nested props
            }
        }
        return obj;
    };
    const samplerInfo = new mappings.SamplerInfo();
    const mapSampler = (obj) => {
        for (const key of Object.keys(obj)) {
            if (samplerInfo[key] === undefined) {
                warn(`EFX3301: illegal sampler info '${key}'`);
            }
        }
        return mappings.Sampler.computeHash(obj);
    };
    const priorityRE = /^([a-zA-Z]+)?\s*([+-])?\s*([\dxabcdef]+)?$/i;
    const dfault = mappings.RenderPriority.DEFAULT;
    const min = mappings.RenderPriority.MIN;
    const max = mappings.RenderPriority.MAX;
    const mapPriority = (str) => {
        let res = 0;
        const cap = priorityRE.exec(str);
        if (cap[1]) {
            res = mappings.RenderPriority[cap[1].toUpperCase()];
        }
        if (cap[3]) {
            res += parseInt(cap[3]) * (cap[2] === '-' ? -1 : 1);
        }
        if (isNaN(res) || res < min || res > max) {
            warn(`EFX3000: illegal pass priority: ${str}`);
            return dfault;
        }
        return res;
    };
    const mapSwitch = (def, shader) => {
        if (shader.defines.find((d) => d.name === def)) {
            error('EFX3200: existing shader macros cannot be used as pass switch');
        }
        return def;
    };
    const mapDSS = (dss) => {
        for (const key of Object.keys(dss)) {
            if (!key.startsWith('stencil')) {
                continue;
            }
            if (!key.endsWith('Front') && !key.endsWith('Back')) {
                dss[key + 'Front'] = dss[key + 'Back'] = dss[key];
                delete dss[key];
            }
        }
        if (dss.stencilWriteMaskFront !== dss.stencilWriteMaskBack) {
            warn('EFX3100: WebGL(2) doesn\'t support inconsistent front/back stencil write mask');
        }
        if (dss.stencilReadMaskFront !== dss.stencilReadMaskBack) {
            warn('EFX3101: WebGL(2) doesn\'t support inconsistent front/back stencil read mask');
        }
        if (dss.stencilRefFront !== dss.stencilRefBack) {
            warn('EFX3102: WebGL(2) doesn\'t support inconsistent front/back stencil ref');
        }
        return generalMap(dss);
    };
    return (pass, shader) => {
        shaderName = 'type error';
        const tmp = {};
        // special treatments
        if (pass.priority) {
            tmp.priority = mapPriority(pass.priority);
            delete pass.priority;
        }
        if (pass.depthStencilState) {
            tmp.depthStencilState = mapDSS(pass.depthStencilState);
            delete pass.depthStencilState;
        }
        if (pass.switch) {
            tmp.switch = mapSwitch(pass.switch, shader);
            delete pass.switch;
        }
        if (pass.properties) {
            tmp.properties = mapProperties(pass.properties, shader);
            delete pass.properties;
        }
        if (pass.migrations) {
            tmp.migrations = pass.migrations;
            delete pass.migrations;
        }
        generalMap(pass);
        Object.assign(pass, tmp);
    };
})();
const reduceHeaderRecord = (shaders) => {
    const deps = new Set();
    for (const shader of shaders) {
        shader.record.forEach(deps.add, deps);
    }
    return [...deps.values()];
};
const stageValidation = (stages) => {
    const passMap = {
        vert: 'graphics',
        frag: 'graphics',
        compute: 'compute',
    };
    if (stages.length === 0) {
        error('0 stages provided for a pass');
        return '';
    }
    const type = passMap[stages[0]];
    stages.forEach((stage) => {
        // validation: all stages must have the same pass type
        if (!passMap[stage]) {
            error(`invalid stage type ${stage}`);
            return '';
        }
        if (passMap[stage] !== type) {
            error('more than one pass type appears');
            return '';
        }
    });
    if (type === 'graphics') {
        const vert = stages.find((s) => s === 'vert');
        const frag = stages.find((s) => s === 'frag');
        if (stages.length === 1 || !vert || !frag) {
            error('graphics pass must include vert and frag shaders');
            return '';
        }
    }
    return type;
};
const buildEffect = (name, content) => {
    effectName = name;
    let { effect, templates, localDeprecations } = parseEffect(name, content);
    if (!effect || !Array.isArray(effect.techniques)) {
        return null;
    }
    // map passes
    templates = Object.assign({}, globalChunks, templates);
    const deprecations = {};
    for (const type in globalDeprecations) {
        deprecations[type] = Object.assign({}, globalDeprecations[type], localDeprecations[type]);
    }
    const deprecationStr = Object.keys(deprecations.identifiers)
        .reduce((cur, acc) => `|${acc}` + cur, '')
        .slice(1);
    if (deprecationStr.length) {
        deprecations.identifierRE = new RegExp(`\\b(${deprecationStr})\\b`, 'g');
    }
    const shaders = (effect.shaders = []);
    for (const jsonTech of effect.techniques) {
        for (const pass of jsonTech.passes) {
            const stageNames = {};
            const stages = [];
            if (pass.vert) {
                stageNames['vert'] = pass.vert;
                delete pass.vert;
                stages.push('vert');
            }
            if (pass.frag) {
                stageNames['frag'] = pass.frag;
                delete pass.frag;
                stages.push('frag');
            }
            if (pass.compute) {
                stageNames['compute'] = pass.compute;
                delete pass.compute;
                stages.push('compute');
            }
            const name = (pass.program = stages.reduce((acc, val) => acc.concat(`|${stageNames[val]}`), effectName));
            const type = stageValidation(stages);
            if (type === '') {
                // invalid, skip pass
                continue;
            }
            let shader = shaders.find((s) => s.name === name);
            if (!shader) {
                shader = shaderFactory.build(stageNames, type, templates, deprecations);
                shader.name = name;
                shaders.push(shader);
            }
            mapPassParam(pass, shader);
        }
    }
    effect.dependencies = reduceHeaderRecord(shaders);
    return effect;
};
// ==================
// exports
// ==================
module.exports = {
    options,
    addChunk,
    compileShader,
    buildEffect,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hkYy1saWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvZWZmZWN0LWNvbXBpbGVyL3NoZGMtbGliLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQzdDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQy9DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVoQyxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDdEIsTUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7QUFDakQsTUFBTSxjQUFjLEdBQUcsb0NBQW9DLENBQUM7QUFDNUQsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDO0FBQzlCLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ2pDLE1BQU0sVUFBVSxHQUFHLHNCQUFzQixDQUFDO0FBQzFDLE1BQU0sTUFBTSxHQUFHLDhFQUE4RSxDQUFDO0FBQzlGLE1BQU0sT0FBTyxHQUFHLHNGQUFzRixDQUFDO0FBQ3ZHLE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0FBQ2pELE1BQU0sY0FBYyxHQUFHLGtDQUFrQyxDQUFDO0FBQzFELE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQztBQUM3QixNQUFNLGNBQWMsR0FBRyxtREFBbUQsQ0FBQztBQUUzRSwwRUFBMEU7QUFDMUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUUxRCxJQUFJLFVBQVUsR0FBRyxFQUFFLEVBQ2YsVUFBVSxHQUFHLEVBQUUsRUFDZixZQUFZLEdBQUcsRUFBRSxD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QUFFLEVBQUUsQ0FBQyxDQUNILE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FDN0gsQ0FDSixDQUFDO1FBQ0YsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3RyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FDckIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FDN0gsQ0FBQztRQUNGLFVBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ25JLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUN0QixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUNuSCxDQUFDO1FBQ0YsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDMUgsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDNUgsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDNUgsVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxP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LElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUgsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2SCxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZILFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEgsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNySCxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVILFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekgsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2SCxV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QUssQ0FBQyxJQUFJLEVBQzNHLEdBQUcsQ0FDTixDQUFDO1FBQ04sQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEcsVUFBVSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDakksVUFBVSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUcsVUFBVSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUcsVUFBVSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxD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Q0FBQztJQUNsRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUM7QUFFRixxQkFBcUI7QUFDckIsVUFBVTtBQUNWLHFCQUFxQjtBQUVyQixNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsT0FBTztJQUNQLFFBQVE7SUFDUixhQUFhO0lBQ2IsV0FBVztDQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCB0b2tlbml6ZXIgPSByZXF1aXJlKCdnbHNsLXRva2VuaXplci9zdHJpbmcnKTtcclxuY29uc3QgcGFyc2VyID0gcmVxdWlyZSgnZ2xzbC1wYXJzZXIvZGlyZWN0Jyk7XHJcbmNvbnN0IG1hcHBpbmdzID0gcmVxdWlyZSgnLi9vZmZsaW5lLW1hcHBpbmdzJyk7XHJcbmNvbnN0IHlhbWwgPSByZXF1aXJlKCdqcy15YW1sJyk7XHJcblxyXG5jb25zdCB0YWJBc1NwYWNlcyA9IDI7XHJcbmNvbnN0IHBsYWluRGVmaW5lUkUgPSAvI2RlZmluZVxccysoXFx3KylcXHMrKFxcdyspL2c7XHJcbmNvbnN0IGVmZmVjdERlZmluZVJFID0gLyNwcmFnbWFcXHMrZGVmaW5lXFxzKyhcXHcrKVxccysoLiopXFxuL2c7XHJcbmNvbnN0IGlkZW50ID0gL1tfYS16QS1aXVxcdyovZztcclxuY29uc3QgbGFiZWxSRSA9IC8oXFx3KylcXCgoLio/KVxcKS87XHJcbmNvbnN0IGxvY2F0aW9uUkUgPSAvbG9jYXRpb25cXHMqPVxccyooXFxkKykvO1xyXG5jb25zdCBpbkRlY2wgPSAvKD86bGF5b3V0XFxzKlxcKCguKj8pXFwpXFxzKik/aW4gKCg/OlxcdytcXHMrKT9cXHcrXFxzKyhcXHcrKVxccyooPzpcXFtbXFxkXFxzXStdKT8pXFxzKjsvZztcclxuY29uc3Qgb3V0RGVjbCA9IC8oPzpsYXlvdXRcXHMqXFwoKC4qPylcXClcXHMqKT8oPzw9XFxiKW91dCAoKD86XFx3K1xccyspP1xcdytcXHMrKFxcdyspXFxzKig/OlxcW1tcXGRcXHNdK10pPylcXHMqOy9nO1xyXG5jb25zdCBsYXlvdXRFeHRyYWN0ID0gL2xheW91dFxccypcXCgoLio/KVxcKShcXHMqKSQvO1xyXG5jb25zdCBiaW5kaW5nRXh0cmFjdCA9IC8oPzpsb2NhdGlvbnxiaW5kaW5nKVxccyo9XFxzKihcXGQrKS87XHJcbmNvbnN0IGJ1aWx0aW5SRSA9IC9eY2NcXHcrJC9pO1xyXG5jb25zdCBwcmFnbWFzVG9TdHJpcCA9IC9eXFxzKig/OiNwcmFnbWFcXHMqKSg/IVNUREdMfG9wdGltaXplfGRlYnVnKS4qJFxcbi9nbTtcclxuXHJcbi8vIHRleHR1cmUgZnVuY3Rpb24gdGFibGUgcmVtYXBwaW5nIHRleHR1cmUoZ2xzbDMwMCkgdG8gdGV4dHVyZVhYKGdsc2wxMDApXHJcbmNvbnN0IHRleHR1cmVGdW5jUmVtYXAgPSBuZXcgTWFwKFtbJ0V4dGVybmFsT0VTJywgJzJEJ11dKTtcclxuXHJcbmxldCBlZmZlY3ROYW1lID0gJycsXHJcbiAgICBzaGFkZXJOYW1lID0gJycsXHJcbiAgICBzaGFkZXJUb2tlbnMgPSBbXTtcclxuY29uc3QgZm9ybWF0TXNnID0gKG1zZywgbG4pID0+IGAke2VmZmVjdE5hbWV9LmVmZmVjdCAtICR7c2hhZGVyTmFtZX1gICsgKGxuICE9PSB1bmRlZmluZWQgPyBgIC0gJHtsbn06IGAgOiAnOiAnKSArIG1zZztcclxuY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgIHRocm93T25FcnJvcjogdHJ1ZSxcclxuICAgIHRocm93T25XYXJuaW5nOiBmYWxzZSxcclxuICAgIG5vU291cmNlOiBmYWxzZSxcclxuICAgIHNraXBQYXJzZXJUZXN0OiBmYWxzZSxcclxuICAgIGNodW5rU2VhcmNoRm46IChuYW1lcykgPT4gKHt9KSxcclxuICAgIGdldEFsdGVybmF0aXZlQ2h1bmtQYXRoczogKHBhdGgpID0+IFtdLFxyXG59O1xyXG5jb25zdCBkdW1wU291cmNlID0gKHRva2VucykgPT4ge1xyXG4gICAgbGV0IGxuID0gMDtcclxuICAgIHJldHVybiB0b2tlbnMucmVkdWNlKChhY2MsIGN1cikgPT4gKGN1ci5saW5lID4gbG4gPyBhY2MgKyBgXFxuJHsobG4gPSBjdXIubGluZSl9XFx0JHtjdXIuZGF0YS5yZXBsYWNlKC9cXG4vZywgJycpfWAgOiBhY2MgKyBjdXIuZGF0YSksICcnKTtcclxufTtcclxuY29uc3QgdGhyb3dGbkZhY3RvcnkgPSAobGV2ZWwsIG91dHB1dEZuKSA9PiB7XHJcbiAgICByZXR1cm4gKG1zZywgbG4pID0+IHtcclxuICAgICAgICBpZiAob3B0aW9ucy5ub1NvdXJjZSkge1xyXG4gICAgICAgICAgICBsbiA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc291cmNlID0gbG4gIT09IHVuZGVmaW5lZCA/ICcg4oaT4oaT4oaT4oaT4oaTIEVYUEFORCBUSElTIE1FU1NBR0UgRk9SIE1PUkUgSU5GTyDihpPihpPihpPihpPihpMnICsgZHVtcFNvdXJjZShzaGFkZXJUb2tlbnMpICsgJ1xcbicgOiAnJztcclxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRNc2cgPSBmb3JtYXRNc2cobGV2ZWwgKyAnICcgKyBtc2csIGxuKSArIHNvdXJjZTtcclxuICAgICAgICBpZiAob3B0aW9ucy50aHJvd09uV2FybmluZykge1xyXG4gICAgICAgICAgICB0aHJvdyBmb3JtYXR0ZWRNc2c7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3V0cHV0Rm4oZm9ybWF0dGVkTXNnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5jb25zdCB3YXJuID0gdGhyb3dGbkZhY3RvcnkoJ1dhcm5pbmcnLCBjb25zb2xlLndhcm4pO1xyXG5jb25zdCBlcnJvciA9IHRocm93Rm5GYWN0b3J5KCdFcnJvcicsIGNvbnNvbGUuZXJyb3IpO1xyXG5cclxuY29uc3QgY29udmVydFR5cGUgPSAodCkgPT4ge1xyXG4gICAgY29uc3QgdHAgPSBtYXBwaW5ncy50eXBlTWFwW3RdO1xyXG4gICAgcmV0dXJuIHRwID09PSB1bmRlZmluZWQgPyB0IDogdHA7XHJcbn07XHJcblxyXG5jb25zdCBWU0JpdCA9IG1hcHBpbmdzLmdldFNoYWRlclN0YWdlKCd2ZXJ0ZXgnKTtcclxuY29uc3QgRlNCaXQgPSBtYXBwaW5ncy5nZXRTaGFkZXJTdGFnZSgnZnJhZ21lbnQnKTtcclxuY29uc3QgQ1NCaXQgPSBtYXBwaW5ncy5nZXRTaGFkZXJTdGFnZSgnY29tcHV0ZScpO1xyXG5cclxuY29uc3QgbWFwU2hhZGVyU3RhZ2UgPSAoc3RhZ2UpID0+IHtcclxuICAgIHN3aXRjaCAoc3RhZ2UpIHtcclxuICAgICAgICBjYXNlICd2ZXJ0JzpcclxuICAgICAgICAgICAgcmV0dXJuIFZTQml0O1xyXG4gICAgICAgIGNhc2UgJ2ZyYWcnOlxyXG4gICAgICAgICAgICByZXR1cm4gRlNCaXQ7XHJcbiAgICAgICAgY2FzZSAnY29tcHV0ZSc6XHJcbiAgICAgICAgICAgIHJldHVybiBDU0JpdDtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHN0cmlwQ29tbWVudHMgPSAoKCkgPT4ge1xyXG4gICAgY29uc3QgY3JsZk5ld0xpbmVzID0gL1xcclxcbi9nO1xyXG4gICAgY29uc3QgYmxvY2tDb21tZW50cyA9IC9cXC9cXCouKj9cXCpcXC8vZ3M7XHJcbiAgICBjb25zdCBsaW5lQ29tbWVudHMgPSAvXFxzKlxcL1xcLy4qJC9nbTtcclxuICAgIHJldHVybiAoY29kZSkgPT4ge1xyXG4gICAgICAgIC8vIHN0cmlwIGNvbW1lbnRzXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGNvZGUucmVwbGFjZShibG9ja0NvbW1lbnRzLCAnJyk7XHJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UobGluZUNvbW1lbnRzLCAnJyk7XHJcbiAgICAgICAgLy8gcmVwbGFjZSBDUkxGcyAodG9rZW5pemVyIGRvZXNuJ3Qgd29yayB3aXRoIC9yL24pXHJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoY3JsZk5ld0xpbmVzLCAnXFxuJyk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbn0pKCk7XHJcblxyXG5jb25zdCBnbG9iYWxDaHVua3MgPSB7fTtcclxuY29uc3QgZ2xvYmFsRGVwcmVjYXRpb25zID0geyBjaHVua3M6IHt9LCBpZGVudGlmaWVyczoge30gfTtcclxuY29uc3QgYWRkQ2h1bmsgPSAoKCkgPT4ge1xyXG4gICAgY29uc3QgZGVwUkUgPSAvI3ByYWdtYVxccytkZXByZWNhdGUtKGNodW5rfGlkZW50aWZpZXIpXFxzKyhbXFx3LV0rKSg/OlxccysoLiopKT8vZztcclxuICAgIHJldHVybiAobmFtZSwgY29udGVudCwgY2h1bmtzID0gZ2xvYmFsQ2h1bmtzLCBkZXByZWNhdGlvbnMgPSBnbG9iYWxEZXByZWNhdGlvbnMpID0+IHtcclxuICAgICAgICBjb25zdCBjaHVuayA9IHN0cmlwQ29tbWVudHMoY29udGVudCk7XHJcbiAgICAgICAgbGV0IGRlcENhcCA9IGRlcFJFLmV4ZWMoY2h1bmspO1xyXG4gICAgICAgIGxldCBjb2RlID0gJycsXHJcbiAgICAgICAgICAgIG5leHRCZWdJZHggPSAwO1xyXG4gICAgICAgIHdoaWxlIChkZXBDYXApIHtcclxuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGAke2RlcENhcFsxXX1zYDtcclxuICAgICAgICAgICAgaWYgKCFkZXByZWNhdGlvbnNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGRlcHJlY2F0aW9uc1t0eXBlXSA9IHt9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uc1t0eXBlXVtkZXBDYXBbMl1dID0gZGVwQ2FwWzNdO1xyXG5cclxuICAgICAgICAgICAgY29kZSArPSBjaHVuay5zbGljZShuZXh0QmVnSWR4LCBkZXBDYXAuaW5kZXgpO1xyXG4gICAgICAgICAgICBuZXh0QmVnSWR4ID0gZGVwQ2FwLmluZGV4ICsgZGVwQ2FwWzBdLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGRlcENhcCA9IGRlcFJFLmV4ZWMoY2h1bmspO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjaHVua3NbbmFtZV0gPSBjb2RlICsgY2h1bmsuc2xpY2UobmV4dEJlZ0lkeCk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxuY29uc3QgaW52b2tlU2VhcmNoID0gKG5hbWVzKSA9PiB7XHJcbiAgICBjb25zdCB7IG5hbWUsIGNvbnRlbnQgfSA9IG9wdGlvbnMuY2h1bmtTZWFyY2hGbihuYW1lcyk7XHJcbiAgICBpZiAoY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgYWRkQ2h1bmsobmFtZSwgY29udGVudCk7XHJcbiAgICAgICAgcmV0dXJuIG5hbWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJyc7XHJcbn07XHJcblxyXG5jb25zdCB1bndpbmRJbmNsdWRlcyA9ICgoKSA9PiB7XHJcbiAgICBjb25zdCBpbmNsdWRlUkUgPSAvXiguKikjaW5jbHVkZVxccytbPFwiXShbXj5cIl0rKVs+XCJdKC4qKSQvZ207XHJcbiAgICBsZXQgcmVwbGFjZXI7XHJcbiAgICBjb25zdCByZXBsYWNlckZhY3RvcnkgPSAoY2h1bmtzLCBkZXByZWNhdGlvbnMsIHJlY29yZCkgPT4gKHN0ciwgcHJlZml4LCBuYW1lLCBzdWZmaXgpID0+IHtcclxuICAgICAgICBuYW1lID0gbmFtZS50cmltKCk7XHJcbiAgICAgICAgaWYgKG5hbWUuZW5kc1dpdGgoJy5jaHVuaycpKSB7XHJcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDAsIC02KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxOYW1lID0gbmFtZTtcclxuICAgICAgICBpZiAocmVjb3JkLmhhcyhuYW1lKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZXByZWNhdGlvbnNbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBlcnJvcihgRUZYMjAwMzogaGVhZGVyICcke25hbWV9JyBpcyBkZXByZWNhdGVkOiAke2RlcHJlY2F0aW9uc1tuYW1lXX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbnRlbnQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBjb250ZW50ID0gY2h1bmtzW25hbWVdO1xyXG4gICAgICAgICAgICBpZiAoY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBhbHRlcm5hdGl2ZXMgPSBvcHRpb25zLmdldEFsdGVybmF0aXZlQ2h1bmtQYXRocyhuYW1lKTtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVzLnNvbWUoKHBhdGgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2h1bmtzW3BhdGhdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjaHVua3NbcGF0aF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5hbWUgPSBpbnZva2VTZWFyY2goW10uY29uY2F0KG5hbWUsIGFsdGVybmF0aXZlcykpO1xyXG4gICAgICAgICAgICBjb250ZW50ID0gZ2xvYmFsQ2h1bmtzW25hbWVdO1xyXG4gICAgICAgICAgICBpZiAoY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlcnJvcihgRUZYMjAwMTogY2FuIG5vdCByZXNvbHZlICcke29yaWdpbmFsTmFtZX0nYCk7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9IHdoaWxlICgwKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxyXG4gICAgICAgIHJlY29yZC5hZGQobmFtZSk7XHJcblxyXG4gICAgICAgIGlmIChwcmVmaXgpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXi9nbSwgcHJlZml4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN1ZmZpeCkge1xyXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXG4vZywgc3VmZml4ICsgJ1xcbicpICsgc3VmZml4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKGluY2x1ZGVSRSwgcmVwbGFjZXIpO1xyXG4gICAgICAgIHJldHVybiBjb250ZW50O1xyXG4gICAgfTtcclxuICAgIHJldHVybiAoc3RyLCBjaHVua3MsIGRlcHJlY2F0aW9ucywgcmVjb3JkID0gbmV3IFNldCgpKSA9PiB7XHJcbiAgICAgICAgcmVwbGFjZXIgPSByZXBsYWNlckZhY3RvcnkoY2h1bmtzLCBkZXByZWNhdGlvbnMuY2h1bmtzLCByZWNvcmQpO1xyXG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKGluY2x1ZGVSRSwgcmVwbGFjZXIpO1xyXG4gICAgICAgIGlmIChkZXByZWNhdGlvbnMuaWRlbnRpZmllclJFKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXBDYXAgPSBkZXByZWNhdGlvbnMuaWRlbnRpZmllclJFLmV4ZWMoc3RyKTtcclxuICAgICAgICAgICAgd2hpbGUgKGRlcENhcCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVwTXNnID0gZGVwcmVjYXRpb25zLmlkZW50aWZpZXJzW2RlcENhcFsxXV07XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVwTXNnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoYEVGWDIwMDQ6IGlkZW50aWZpZXIgJyR7ZGVwQ2FwWzFdfScgaXMgZGVwcmVjYXRlZDogJHtkZXBNc2d9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZXBDYXAgPSBkZXByZWNhdGlvbnMuaWRlbnRpZmllclJFLmV4ZWMoc3RyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbmNvbnN0IGV4cGFuZEZ1bmN0aW9uYWxNYWNybyA9ICgoKSA9PiB7XHJcbiAgICBjb25zdCBnZXRNYXRjaGluZ1BhcmVuID0gKHN0cmluZywgc3RhcnRQYXJlbikgPT4ge1xyXG4gICAgICAgIGlmIChzdHJpbmdbc3RhcnRQYXJlbl0gIT09ICcoJykge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhcnRQYXJlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRlcHRoID0gMTtcclxuICAgICAgICBsZXQgaSA9IHN0YXJ0UGFyZW4gKyAxO1xyXG4gICAgICAgIGZvciAoOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChzdHJpbmdbaV0gPT09ICcoJykge1xyXG4gICAgICAgICAgICAgICAgZGVwdGgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc3RyaW5nW2ldID09PSAnKScpIHtcclxuICAgICAgICAgICAgICAgIGRlcHRoLS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaTtcclxuICAgIH07XHJcbiAgICBjb25zdCBwYXJlbkF3YXJlU3BsaXQgPSAoc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gW107XHJcbiAgICAgICAgbGV0IGJlZyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHN0cmluZ1tpXSA9PT0gJygnKSB7XHJcbiAgICAgICAgICAgICAgICBpID0gZ2V0TWF0Y2hpbmdQYXJlbihzdHJpbmcsIGkpICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc3RyaW5nW2ldID09PSAnLCcpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5wdXNoKHN0cmluZy5zdWJzdHJpbmcoYmVnLCBpKS50cmltKCkpO1xyXG4gICAgICAgICAgICAgICAgYmVnID0gaSArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJlZyAhPT0gc3RyaW5nLmxlbmd0aCB8fCBzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSAnLCcpIHtcclxuICAgICAgICAgICAgcmVzLnB1c2goc3RyaW5nLnN1YnN0cmluZyhiZWcpLnRyaW0oKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgZGVmaW5lUkUgPSAvI3ByYWdtYVxccytkZWZpbmVcXHMrKFxcdyspXFwoKFtcXHcsXFxzXSopXFwpXFxzKyguKj8pXFxuL2c7XHJcbiAgICBjb25zdCBoYXNoUkUgPSAvKD88PVxcdykjIyg/PVxcdykvZztcclxuICAgIGNvbnN0IG5ld2xpbmVSRSA9IC9cXFxcXFxzKj9cXG4vZztcclxuICAgIGNvbnN0IG5ld2xpbmVNYXJrUkUgPSAvQEAvZztcclxuICAgIGNvbnN0IGRlZmluZVByZWZpeFJFID0gLyNwcmFnbWFcXHMrZGVmaW5lfCNkZWZpbmUvO1xyXG4gICAgcmV0dXJuIChjb2RlKSA9PiB7XHJcbiAgICAgICAgY29kZSA9IGNvZGUucmVwbGFjZShuZXdsaW5lUkUsICdAQCcpO1xyXG4gICAgICAgIGxldCBkZWZpbmVDYXB0dXJlID0gZGVmaW5lUkUuZXhlYyhjb2RlKTtcclxuICAgICAgICAvLyBsb29wIHRocm91Z2ggZGVmaW5pdGlvbnNcclxuICAgICAgICB3aGlsZSAoZGVmaW5lQ2FwdHVyZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBmbk5hbWUgPSBkZWZpbmVDYXB0dXJlWzFdO1xyXG4gICAgICAgICAgICBjb25zdCBmblBhcmFtcyA9IHBhcmVuQXdhcmVTcGxpdChkZWZpbmVDYXB0dXJlWzJdKTtcclxuICAgICAgICAgICAgY29uc3QgZm5Cb2R5ID0gZGVmaW5lQ2FwdHVyZVszXTtcclxuICAgICAgICAgICAgY29uc3QgZGVmU3RhcnRJZHggPSBkZWZpbmVDYXB0dXJlLmluZGV4O1xyXG4gICAgICAgICAgICBjb25zdCBkZWZFbmRJZHggPSBkZWZpbmVDYXB0dXJlLmluZGV4ICsgZGVmaW5lQ2FwdHVyZVswXS5sZW5ndGg7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hY3JvUkUgPSBuZXcgUmVnRXhwKCdeKC4qPyknICsgZm5OYW1lICsgJ1xcXFxzKlxcXFwoJywgJ2dtJyk7XHJcbiAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCBpbnZvY2F0aW9uc1xyXG4gICAgICAgICAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgZm5OYW1lICsgJ1xcXFxiJykudGVzdChmbkJvZHkpKSB7XHJcbiAgICAgICAgICAgICAgICB3YXJuKGBFRlgyMDAyOiByZWN1cnNpdmUgbWFjcm8gcHJvY2Vzc29yICcke2ZuTmFtZX0nYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtYWNyb0NhcHR1cmUgPSBtYWNyb1JFLmV4ZWMoY29kZSk7IG1hY3JvQ2FwdHVyZSAhPT0gbnVsbDsgbWFjcm9DYXB0dXJlID0gbWFjcm9SRS5leGVjKGNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlblBhcmVuSWR4ID0gbWFjcm9DYXB0dXJlLmluZGV4ICsgbWFjcm9DYXB0dXJlWzBdLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wZW5QYXJlbklkeCA+IGRlZlN0YXJ0SWR4ICYmIG9wZW5QYXJlbklkeCA8IGRlZkVuZElkeCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IC8vIHNraXAgb3JpZ2luYWwgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IG1hY3JvQ2FwdHVyZVsxXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydElkeCA9IG1hY3JvQ2FwdHVyZS5pbmRleCArIHByZWZpeC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kSWR4ID0gZ2V0TWF0Y2hpbmdQYXJlbihjb2RlLCBvcGVuUGFyZW5JZHgpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBwYXJlbkF3YXJlU3BsaXQoY29kZS5zbGljZShtYWNyb0NhcHR1cmUuaW5kZXggKyBtYWNyb0NhcHR1cmVbMF0ubGVuZ3RoLCBlbmRJZHggLSAxKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggIT09IGZuUGFyYW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuKGBFRlgyMDA1OiBub3QgZW5vdWdoIGFyZ3VtZW50cyBmb3IgZnVuY3Rpb24tbGlrZSBtYWNybyBpbnZvY2F0aW9uICcke2ZuTmFtZX0nYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBhdGNoIGZ1bmN0aW9uIGJvZHlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWNvcmRzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmblBhcmFtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoJ1xcXFxiJyArIGZuUGFyYW1zW2ldICsgJ1xcXFxiJywgJ2cnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gcmUuZXhlYyhmbkJvZHkpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3Jkcy5wdXNoKHsgYmVnOiBtYXRjaC5pbmRleCwgZW5kOiByZS5sYXN0SW5kZXgsIHRhcmdldDogcGFyYW1zW2ldIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBib2R5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJlY29yZCBvZiByZWNvcmRzLnNvcnQoKGEsIGIpID0+IGEuYmVnIC0gYi5iZWcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkgKz0gZm5Cb2R5LnNsaWNlKGluZGV4LCByZWNvcmQuYmVnKSArIHJlY29yZC50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcmVjb3JkLmVuZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYm9keSArPSBmbkJvZHkuc2xpY2UoaW5kZXgsIGZuQm9keS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZGVmaW5lUHJlZml4UkUudGVzdChwcmVmaXgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvciB0b3AgbGV2ZWwgaW52b2NhdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluZGVudENvdW50ID0gcHJlZml4LnNlYXJjaCgvXFxTLyk7IC8vIGNhbGMgaW5kZW50YXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGVudENvdW50IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50Q291bnQgPSBwcmVmaXgubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UoaGFzaFJFLCAnJyk7IC8vIGNsZWFyIHRoZSBoYXNoZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keSA9IGJvZHkucmVwbGFjZShuZXdsaW5lTWFya1JFLCAnXFxuJyArICcgJy5yZXBlYXQoaW5kZW50Q291bnQpKTsgLy8gcmVzdG9yZSBuZXdsaW5lcyBpbiB0aGUgb3V0cHV0XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdE5ld2xpbmUgPSBwcmVmaXgubGFzdEluZGV4T2YoJ0BAJyk7IC8vIGNhbGMgaW5kZW50YXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VyTGluZVByZWZpeCA9IGxhc3ROZXdsaW5lIDwgMCA/IHByZWZpeCA6IHByZWZpeC5zbGljZShsYXN0TmV3bGluZSArIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZW50Q291bnQgPSBjdXJMaW5lUHJlZml4LnNlYXJjaCgvXFxTLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRlbnRDb3VudCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudENvdW50ID0gY3VyTGluZVByZWZpeC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keSA9IGJvZHkucmVwbGFjZShuZXdsaW5lTWFya1JFLCAnQEAnICsgJyAnLnJlcGVhdChpbmRlbnRDb3VudCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBpbnZvY2F0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgY29kZSA9IGNvZGUuc3Vic3RyaW5nKDAsIHN0YXJ0SWR4KSArIGJvZHkgKyBjb2RlLnN1YnN0cmluZyhlbmRJZHgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1vdmUgdG8gdGhlIHN0YXJ0aW5nIHBvaW50IGluIGNhc2UgdGhlIGZ1bmN0aW9uIGJvZHkgaXMgYWN0dWFsbHkgc2hvcnRlciB0aGFuIHRoZSBpbnZvY2F0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgbWFjcm9SRS5sYXN0SW5kZXggLT0gbWFjcm9DYXB0dXJlWzBdLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb2RlID0gY29kZS5zdWJzdHJpbmcoMCwgZGVmU3RhcnRJZHgpICsgY29kZS5zdWJzdHJpbmcoZGVmRW5kSWR4KTsgLy8gbm8gbG9uZ2VyIG5lZWQgdG8gYmUgYXJvdW5kXHJcbiAgICAgICAgICAgIGRlZmluZVJFLmxhc3RJbmRleCA9IDA7IC8vIHJlc2V0IHBvaW50ZXJcclxuICAgICAgICAgICAgZGVmaW5lQ2FwdHVyZSA9IGRlZmluZVJFLmV4ZWMoY29kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvZGUucmVwbGFjZShuZXdsaW5lTWFya1JFLCAnXFxcXFxcbicpO1xyXG4gICAgICAgIHJldHVybiBjb2RlO1xyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbmNvbnN0IGV4cGFuZElucHV0U3RhdGVtZW50ID0gKHN0YXRlbWVudHMpID0+IHtcclxuICAgIGxldCBnbDRJbmRleCA9IDA7XHJcbiAgICBsZXQgZXMxSW5kZXggPSAwO1xyXG4gICAgbGV0IGVzM0luZGV4ID0gMDtcclxuICAgIGxldCBvdXRJbmRleCA9IDA7XHJcbiAgICBsZXQgZHNJbmRleDtcclxuXHJcbiAgICBjb25zdCBUeXBlcyA9IHtcclxuICAgICAgICB1OiBbJ3V2ZWM0JywgJ3VzdWJwYXNzSW5wdXQnXSxcclxuICAgICAgICBpOiBbJ2l2ZWM0JywgJ2lzdWJwYXNzSW5wdXQnXSxcclxuICAgICAgICBmOiBbJ3ZlYzQnLCAnc3VicGFzc0lucHV0J10sXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGlucHV0UHJlZml4ID0gJ19faW4nO1xyXG5cclxuICAgIGxldCBvdXQgPSAnJztcclxuICAgIGxldCBoYXNDb2xvciA9IGZhbHNlO1xyXG4gICAgbGV0IGhhc0RlcHRoU3RlbmNpbCA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAoY29uc3Qgc3RhdGVtZW50IG9mIHN0YXRlbWVudHMpIHtcclxuICAgICAgICBjb25zdCBpbnB1dFR5cGUgPSBzdGF0ZW1lbnQudHlwZTtcclxuICAgICAgICBjb25zdCB2YXJUeXBlID0gVHlwZXNbc3RhdGVtZW50LnNpZ25lZF07XHJcbiAgICAgICAgY29uc3QgaW5vdXQgPSBzdGF0ZW1lbnQuaW5vdXQ7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IHN0YXRlbWVudC5uYW1lO1xyXG4gICAgICAgIGNvbnN0IHByZWNpc2lvbiA9IHN0YXRlbWVudC5wcmVjaXNpb24gPyBzdGF0ZW1lbnQucHJlY2lzaW9uIDogJyc7XHJcbiAgICAgICAgY29uc3QgaW5wdXRJbmRleCA9IGlucHV0VHlwZSAhPT0gJ0NvbG9yJyA/IGRzSW5kZXggPz8gZ2w0SW5kZXggOiBnbDRJbmRleDtcclxuICAgICAgICBjb25zdCBtYWNyb091dCA9XHJcbiAgICAgICAgICAgIGBcXG5gICtcclxuICAgICAgICAgICAgYCNpZiBfX1ZFUlNJT05fXyA+PSA0NTBcXG5gICtcclxuICAgICAgICAgICAgYCAgbGF5b3V0KGxvY2F0aW9uID0gJHtvdXRJbmRleH0pIG91dCAke3ZhclR5cGVbMF19ICR7bmFtZX07XFxuYCArXHJcbiAgICAgICAgICAgIGAjZWxpZiBfX1ZFUlNJT05fXyA+PSAzMDBcXG5gICtcclxuICAgICAgICAgICAgYCAgbGF5b3V0KGxvY2F0aW9uID0gJHtlczNJbmRleH0pIG91dCAke3ZhclR5cGVbMF19ICR7bmFtZX07XFxuYCArXHJcbiAgICAgICAgICAgIGAjZW5kaWZcXG5gO1xyXG5cclxuICAgICAgICBjb25zdCBtYWNyb091dDQ1MCA9IGBcXG5gICsgYCNpZiBfX1ZFUlNJT05fXyA+PSA0NTBcXG5gICsgYCAgbGF5b3V0KGxvY2F0aW9uID0gJHtvdXRJbmRleH0pIG91dCAke3ZhclR5cGVbMF19ICR7bmFtZX07XFxuYCArIGAjZW5kaWZcXG5gO1xyXG5cclxuICAgICAgICBjb25zdCBtYWNyb0RlcHRoU3RlbmNpbEluID1cclxuICAgICAgICAgICAgYFxcbmAgK1xyXG4gICAgICAgICAgICBgI3ByYWdtYSByYXRlICR7aW5wdXRQcmVmaXh9JHtuYW1lfSBwYXNzXFxuYCArXHJcbiAgICAgICAgICAgIGAjaWYgQ0NfREVWSUNFX0NBTl9CRU5FRklUX0ZST01fSU5QVVRfQVRUQUNITUVOVFxcbmAgK1xyXG4gICAgICAgICAgICBgICAjaWYgX19WRVJTSU9OX18gPj0gNDUwXFxuYCArXHJcbiAgICAgICAgICAgIGAgICAgbGF5b3V0KGlucHV0X2F0dGFjaG1lbnRfaW5kZXggPSAke2lucHV0SW5kZXh9KSB1bmlmb3JtICR7dmFyVHlwZVsxXX0gJHtpbnB1dFByZWZpeH0ke25hbWV9O1xcbmAgK1xyXG4gICAgICAgICAgICBgICAgICNkZWZpbmUgc3VicGFzc0xvYWRfJHtuYW1lfSBzdWJwYXNzTG9hZCgke2lucHV0UHJlZml4fSR7bmFtZX0pXFxuYCArXHJcbiAgICAgICAgICAgIGAgICNlbHNlXFxuYCArXHJcbiAgICAgICAgICAgIGAgICAgI2RlZmluZSBzdWJwYXNzTG9hZF8ke25hbWV9ICR7dmFyVHlwZVswXX0oZ2xfTGFzdEZyYWcke2lucHV0VHlwZX1BUk0sIDAsIDAsIDApXFxuYCArXHJcbiAgICAgICAgICAgIGAgICNlbmRpZlxcbmAgK1xyXG4gICAgICAgICAgICBgI2Vsc2VcXG5gICtcclxuICAgICAgICAgICAgYCAgI2RlZmluZSBzdWJwYXNzTG9hZF8ke25hbWV9ICR7dmFyVHlwZVswXX0oMCwgMCwgMCwgMClcXG5gICtcclxuICAgICAgICAgICAgYCNlbmRpZlxcbmA7XHJcblxyXG4gICAgICAgIGNvbnN0IG1hY3JvQ29sb3JJbiA9XHJcbiAgICAgICAgICAgIGBcXG5gICtcclxuICAgICAgICAgICAgYCNwcmFnbWEgcmF0ZSAke2lucHV0UHJlZml4fSR7bmFtZX0gcGFzc1xcbmAgK1xyXG4gICAgICAgICAgICBgI2lmIENDX0RFVklDRV9DQU5fQkVORUZJVF9GUk9NX0lOUFVUX0FUVEFDSE1FTlRcXG5gICtcclxuICAgICAgICAgICAgYCAgI2lmIF9fVkVSU0lPTl9fID49IDQ1MFxcbmAgK1xyXG4gICAgICAgICAgICBgICAgIGxheW91dChpbnB1dF9hdHRhY2htZW50X2luZGV4ID0gJHtpbnB1dEluZGV4fSkgdW5pZm9ybSBzdWJwYXNzSW5wdXQgJHtpbnB1dFByZWZpeH0ke25hbWV9O1xcbmAgK1xyXG4gICAgICAgICAgICBgICAgICNkZWZpbmUgc3VicGFzc0xvYWRfJHtuYW1lfSBzdWJwYXNzTG9hZCgke2lucHV0UHJlZml4fSR7bmFtZX0pXFxuYCArXHJcbiAgICAgICAgICAgIGAgICNlbGlmIF9fVkVSU0lPTl9fID49IDMwMFxcbmAgK1xyXG4gICAgICAgICAgICBgICAgIGxheW91dChsb2NhdGlvbiA9ICR7ZXMzSW5kZXh9KSBpbm91dCAke3ByZWNpc2lvbn0gJHt2YXJUeXBlWzBdfSAke25hbWV9O1xcbmAgK1xyXG4gICAgICAgICAgICBgICAgICNkZWZpbmUgc3VicGFzc0xvYWRfJHtuYW1lfSAke25hbWV9XFxuYCArXHJcbiAgICAgICAgICAgIGAgICNlbHNlXFxuYCArXHJcbiAgICAgICAgICAgIGAgICAgI2RlZmluZSBzdWJwYXNzTG9hZF8ke25hbWV9IGdsX0xhc3RGcmFnRGF0YVske2VzMUluZGV4fV1cXG5gICtcclxuICAgICAgICAgICAgYCAgI2VuZGlmXFxuYCArXHJcbiAgICAgICAgICAgIGAjZWxzZVxcbmAgK1xyXG4gICAgICAgICAgICBgICAjZGVmaW5lIHN1YnBhc3NMb2FkXyR7bmFtZX0gJHtwcmVjaXNpb259ICR7dmFyVHlwZVswXX0oMCwgMCwgMCwgMClcXG5gICtcclxuICAgICAgICAgICAgYCNlbmRpZlxcbmA7XHJcblxyXG4gICAgICAgIGlmIChpbm91dCA9PT0gJ291dCcpIHtcclxuICAgICAgICAgICAgb3V0ICs9IG1hY3JvT3V0O1xyXG4gICAgICAgICAgICBvdXRJbmRleCsrO1xyXG4gICAgICAgICAgICBlczNJbmRleCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlub3V0ID09PSAnaW5vdXQnKSB7XHJcbiAgICAgICAgICAgIG91dCArPSBtYWNyb091dDQ1MDtcclxuICAgICAgICAgICAgb3V0SW5kZXgrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbm91dCA9PT0gJ2luJyB8fCBpbm91dCA9PT0gJ2lub3V0Jykge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXRUeXBlID09PSAnQ29sb3InKSB7XHJcbiAgICAgICAgICAgICAgICBvdXQgKz0gbWFjcm9Db2xvckluO1xyXG4gICAgICAgICAgICAgICAgZ2w0SW5kZXgrKztcclxuICAgICAgICAgICAgICAgIGVzMUluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBlczNJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgaGFzQ29sb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRzSW5kZXggPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRzSW5kZXggPSBnbDRJbmRleDtcclxuICAgICAgICAgICAgICAgICAgICBnbDRJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0ICs9IG1hY3JvRGVwdGhTdGVuY2lsSW47XHJcbiAgICAgICAgICAgICAgICBoYXNEZXB0aFN0ZW5jaWwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbG9yRXh0ZW5zaW9uID0gJyNwcmFnbWEgZXh0ZW5zaW9uKFtHTF9FWFRfc2hhZGVyX2ZyYW1lYnVmZmVyX2ZldGNoLCBfX1ZFUlNJT05fXyA8IDQ1MCwgZW5hYmxlXSlcXG4nO1xyXG4gICAgY29uc3QgZHNFeHRlbnNpb24gPSAnI3ByYWdtYSBleHRlbnNpb24oW0dMX0FSTV9zaGFkZXJfZnJhbWVidWZmZXJfZmV0Y2hfZGVwdGhfc3RlbmNpbCwgX19WRVJTSU9OX18gPCA0NTAsIGVuYWJsZV0pXFxuJztcclxuXHJcbiAgICBpZiAoaGFzQ29sb3IpIHtcclxuICAgICAgICBvdXQgPSBjb2xvckV4dGVuc2lvbiArIG91dDtcclxuICAgIH1cclxuICAgIGlmIChoYXNEZXB0aFN0ZW5jaWwpIHtcclxuICAgICAgICBvdXQgPSBkc0V4dGVuc2lvbiArIG91dDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuY29uc3QgZXhwYW5kU3VicGFzc0lub3V0ID0gKGNvZGUpID0+IHtcclxuICAgIGNvbnN0IGlucHV0U3RhdGVtZW50cyA9IFtdO1xyXG5cclxuICAgIGNvbnN0IGlucHV0VHlwZVdlaWdodHMgPSB7XHJcbiAgICAgICAgQ29sb3I6IDAsXHJcbiAgICAgICAgRGVwdGg6IDEsXHJcbiAgICAgICAgU3RlbmNpbDogMixcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgaW5vdXRUeXBlV2VpZ2h0cyA9IHtcclxuICAgICAgICBpbjogMCxcclxuICAgICAgICBpbm91dDogMSxcclxuICAgICAgICBvdXQ6IDIsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IEZpbHRlck1hcCA9IHtcclxuICAgICAgICBDb2xvcjogeyBpbm91dHM6IFsnaW4nLCAnb3V0JywgJ2lub3V0J10sIHR5cGVzOiBbJ2knLCAnZicsICd1J10sIGhpbnQ6ICcnIH0sXHJcbiAgICAgICAgRGVwdGg6IHsgaW5vdXRzOiBbJ2luJ10sIHR5cGVzOiBbJ2YnXSwgaGludDogJ3N1YnBhc3NEZXB0aCcgfSxcclxuICAgICAgICBTdGVuY2lsOiB7IGlub3V0czogWydpbiddLCB0eXBlczogWydpJ10sIGhpbnQ6ICdpc3VicGFzc1N0ZW5jaWwnIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHJlcGxhY2Ugc3VicGFzc0xvYWQodmFsKSBmdW5jdGlvbnMgdG8gc3VicGFzc0xvYWRfdmFsXHJcbiAgICBjb2RlID0gY29kZS5yZXBsYWNlKC9zdWJwYXNzTG9hZFxccypcXChcXHMqKFxcdyspXFxzKlxcKS9nLCBgc3VicGFzc0xvYWRfJDFgKTtcclxuXHJcbiAgICBsZXQgYXR0YWNobWVudEluZGV4ID0gMDtcclxuICAgIGNvbnN0IHN1YnBhc3NEZWZpbmVSRSA9IC8jcHJhZ21hXFxzKyhpfHUpP3N1YnBhc3MoQ29sb3J8RGVwdGh8U3RlbmNpbClcXHMrKFxcdyspXFxzKihtZWRpdW1wfGhpZ2hwfGxvd3ApP1xccysoXFx3KylcXHMrL2c7XHJcbiAgICBsZXQgZGVmaW5lQ2FwdHVyZSA9IHN1YnBhc3NEZWZpbmVSRS5leGVjKGNvZGUpO1xyXG4gICAgd2hpbGUgKGRlZmluZUNhcHR1cmUgIT09IG51bGwpIHtcclxuICAgICAgICBjb25zdCBzaWduZWQgPSBkZWZpbmVDYXB0dXJlWzFdID8gZGVmaW5lQ2FwdHVyZVsxXSA6ICdmJztcclxuICAgICAgICBjb25zdCBpbnB1dCA9IGRlZmluZUNhcHR1cmVbMl07XHJcbiAgICAgICAgY29uc3QgaW5vdXQgPSBkZWZpbmVDYXB0dXJlWzNdO1xyXG4gICAgICAgIGNvbnN0IHByZWNpc2lvbiA9IGRlZmluZUNhcHR1cmVbNF07XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGRlZmluZUNhcHR1cmVbNV07XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBhdHRhY2htZW50SW5kZXg7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlciA9IEZpbHRlck1hcFtpbnB1dF07XHJcbiAgICAgICAgaWYgKCFmaWx0ZXIuaW5vdXRzLmluY2x1ZGVzKGlub3V0KSkge1xyXG4gICAgICAgICAgICBlcnJvcihgdW5zdXBwb3J0ZWQgaW5vdXQgdHlwZSAke2lucHV0fSwgJHtpbm91dH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNvZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWZpbHRlci50eXBlcy5pbmNsdWRlcyhzaWduZWQpKSB7XHJcbiAgICAgICAgICAgIGVycm9yKGB1bnN1cHBvcnRlZCBzdWJwYXNzIHR5cGUgZm9yICR7aW5wdXR9LCBvbmx5ICR7ZmlsdGVyLmhpbnR9IHN1cHBvcnRlZGApO1xyXG4gICAgICAgICAgICByZXR1cm4gY29kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlucHV0U3RhdGVtZW50cy5wdXNoKHtcclxuICAgICAgICAgICAgdHlwZTogaW5wdXQsXHJcbiAgICAgICAgICAgIGlub3V0OiBpbm91dCxcclxuICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICBwcmVjaXNpb246IHByZWNpc2lvbixcclxuICAgICAgICAgICAgc2lnbmVkOiBzaWduZWQsXHJcbiAgICAgICAgICAgIHNvcnRLZXlJbnB1dDogaW5wdXRUeXBlV2VpZ2h0c1tpbnB1dF0sXHJcbiAgICAgICAgICAgIHNvcnRLZXlJbm91dDogaW5vdXRUeXBlV2VpZ2h0c1tpbm91dF0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJlZyA9IGRlZmluZUNhcHR1cmUuaW5kZXg7XHJcbiAgICAgICAgY29uc3QgZW5kID0gZGVmaW5lQ2FwdHVyZS5pbmRleCArIGRlZmluZUNhcHR1cmVbMF0ubGVuZ3RoO1xyXG4gICAgICAgIGNvZGUgPSBjb2RlLnN1YnN0cmluZygwLCBiZWcpICsgY29kZS5zdWJzdHJpbmcoZW5kKTtcclxuICAgICAgICBzdWJwYXNzRGVmaW5lUkUubGFzdEluZGV4ID0gYmVnO1xyXG4gICAgICAgIGRlZmluZUNhcHR1cmUgPSBzdWJwYXNzRGVmaW5lUkUuZXhlYyhjb2RlKTtcclxuICAgICAgICArK2F0dGFjaG1lbnRJbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBpbnB1dFN0YXRlbWVudHMuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgIGlmIChhLnNvcnRLZXlJbm91dCAhPT0gYi5zb3J0S2V5SW5vdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuc29ydEtleUlub3V0IC0gYi5zb3J0S2V5SW5vdXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYS5zb3J0S2V5SW5wdXQgIT0gYi5zb3J0S2V5SW5wdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuc29ydEtleUlucHV0IC0gYi5zb3J0S2V5SW5wdXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBubyBzb3J0IHdpbGwgYmUgYXBwbGllZCB0byBvdXQtb25seSBjb2xvciBhdHRhY2htZW50XHJcbiAgICAgICAgaWYgKGEuc29ydEtleUlub3V0ID09PSBpbm91dFR5cGVXZWlnaHRzWydvdXQnXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGEubmFtZSA8IGIubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYS5uYW1lID4gYi5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBvdXQgPSBleHBhbmRJbnB1dFN0YXRlbWVudChpbnB1dFN0YXRlbWVudHMpO1xyXG5cclxuICAgIGNvbnN0IHN1YnBhc3NSZXBsYWNlUkUgPSAvI3ByYWdtYVxccytzdWJwYXNzL2c7XHJcbiAgICBjb25zdCBzdWJwYXNzUmVwbGFjZSA9IHN1YnBhc3NSZXBsYWNlUkUuZXhlYyhjb2RlKTtcclxuICAgIGlmIChzdWJwYXNzUmVwbGFjZSkge1xyXG4gICAgICAgIGNvbnN0IGJlZyA9IHN1YnBhc3NSZXBsYWNlLmluZGV4O1xyXG4gICAgICAgIGNvbnN0IGVuZCA9IHN1YnBhc3NSZXBsYWNlLmluZGV4ICsgc3VicGFzc1JlcGxhY2VbMF0ubGVuZ3RoO1xyXG4gICAgICAgIGNvZGUgPSBjb2RlLnN1YnN0cmluZygwLCBiZWcpICsgb3V0ICsgY29kZS5zdWJzdHJpbmcoZW5kKTtcclxuICAgIH1cclxuICAgIHJldHVybiBjb2RlO1xyXG59O1xyXG5cclxuY29uc3QgZXhwYW5kTGl0ZXJhbE1hY3JvID0gKGNvZGUpID0+IHtcclxuICAgIGNvbnN0IGRlZmluZXMgPSB7fTtcclxuICAgIGxldCBkZWZDYXAgPSBlZmZlY3REZWZpbmVSRS5leGVjKGNvZGUpO1xyXG4gICAgLy8gZXh0cmFjdGlvblxyXG4gICAgd2hpbGUgKGRlZkNhcCAhPT0gbnVsbCkge1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IGRlZkNhcFsyXTtcclxuICAgICAgICBpZiAodmFsdWUuZW5kc1dpdGgoJ1xcXFwnKSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDAsIC0xKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVmaW5lc1tkZWZDYXBbMV1dID0gdmFsdWUudHJpbSgpO1xyXG4gICAgICAgIGNvbnN0IGJlZyA9IGRlZkNhcC5pbmRleDtcclxuICAgICAgICBjb25zdCBlbmQgPSBkZWZDYXAuaW5kZXggKyBkZWZDYXBbMF0ubGVuZ3RoO1xyXG4gICAgICAgIGNvZGUgPSBjb2RlLnN1YnN0cmluZygwLCBiZWcpICsgY29kZS5zdWJzdHJpbmcoZW5kKTtcclxuICAgICAgICBlZmZlY3REZWZpbmVSRS5sYXN0SW5kZXggPSBiZWc7XHJcbiAgICAgICAgZGVmQ2FwID0gZWZmZWN0RGVmaW5lUkUuZXhlYyhjb2RlKTtcclxuICAgIH1cclxuICAgIC8vIHJlcGxhY2VtZW50XHJcbiAgICBjb25zdCBrZXlSRXMgPSBPYmplY3Qua2V5cyhkZWZpbmVzKS5tYXAoKGspID0+IG5ldyBSZWdFeHAoYFxcXFxiJHtrfVxcXFxiYCwgJ2cnKSk7XHJcbiAgICBjb25zdCB2YWx1ZXMgPSBPYmplY3QudmFsdWVzKGRlZmluZXMpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbaV07XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBpOyBqKyspIHtcclxuICAgICAgICAgICAgLy8gb25seSByZXBsYWNlIGVhbGllciBvbmVzXHJcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShrZXlSRXNbal0sIHZhbHVlc1tqXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvZGUgPSBjb2RlLnJlcGxhY2Uoa2V5UkVzW2ldLCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY29kZTtcclxufTtcclxuXHJcbmNvbnN0IGV4dHJhY3RNYWNyb0RlZmluaXRpb25zID0gKGNvZGUpID0+IHtcclxuICAgIGNvbnN0IGRlZmluZXMgPSBuZXcgU2V0KCk7XHJcbiAgICBsZXQgZGVmQ2FwID0gcGxhaW5EZWZpbmVSRS5leGVjKGNvZGUpO1xyXG4gICAgY29uc3Qgc3Vic3RpdHV0ZU1hcCA9IG5ldyBNYXAoKTtcclxuICAgIHdoaWxlIChkZWZDYXAgIT09IG51bGwpIHtcclxuICAgICAgICBkZWZpbmVzLmFkZChkZWZDYXBbMV0pO1xyXG4gICAgICAgIGlmIChkZWZDYXBbMl0gJiYgZGVmQ2FwWzJdLnRvTG93ZXJDYXNlICE9PSAndHJ1ZScgJiYgZGVmQ2FwWzJdLnRvTG93ZXJDYXNlICE9PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRyeU51bWJlciA9IHBhcnNlSW50KGRlZkNhcFsyXSk7XHJcbiAgICAgICAgICAgIGlmIChpc05hTih0cnlOdW1iZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAjZGVmaW5lIENDX1NVUkZBQ0VfVVNFX1ZFUlRFWF9DT0xPUiBVU0VfVkVSVEVYX0NPTE9SXHJcbiAgICAgICAgICAgICAgICBzdWJzdGl0dXRlTWFwLnNldChkZWZDYXBbMV0sIGRlZkNhcFsyXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVmQ2FwID0gcGxhaW5EZWZpbmVSRS5leGVjKGNvZGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtkZWZpbmVzLCBzdWJzdGl0dXRlTWFwXTtcclxufTtcclxuXHJcbmNvbnN0IGVsaW1pbmF0ZURlYWRDb2RlID0gKCgpID0+IHtcclxuICAgIGNvbnN0IHNjb3BlUkUgPSAvW3t9KCldL2c7XHJcbiAgICBjb25zdCBzaWdSRSA9IC8oPzpcXHcrcFxccyspP1xcdytcXHMrKFxcdyspXFxzKiQvOyAvLyBwcmVjaXNpb24/IHJldHVyblR5cGUgZm5OYW1lXHJcbiAgICBjb25zdCBzcGFjZXNSRSA9IC9eXFxzKiQvO1xyXG4gICAgbGV0IG5hbWUgPSAnJztcclxuICAgIGxldCBiZWcgPSAwO1xyXG4gICAgbGV0IGVuZCA9IDA7XHJcbiAgICBjb25zdCByZWNvcmRCZWdpbiA9IChjb2RlLCBsZWZ0UGFyZW4pID0+IHtcclxuICAgICAgICBjb25zdCBjYXAgPSBjb2RlLnN1YnN0cmluZyhlbmQsIGxlZnRQYXJlbikubWF0Y2goc2lnUkUpIHx8IFsnJywgJyddO1xyXG4gICAgICAgIG5hbWUgPSBjYXBbMV07XHJcbiAgICAgICAgYmVnID0gbGVmdFBhcmVuIC0gY2FwWzBdLmxlbmd0aDtcclxuICAgIH07XHJcbiAgICBjb25zdCBnZXRBbGxDYXB0dXJlcyA9IChjb2RlLCBSRSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNhcHMgPSBbXTtcclxuICAgICAgICBsZXQgY2FwID0gUkUuZXhlYyhjb2RlKTtcclxuICAgICAgICB3aGlsZSAoY2FwKSB7XHJcbiAgICAgICAgICAgIGNhcHMucHVzaChjYXApO1xyXG4gICAgICAgICAgICBjYXAgPSBSRS5leGVjKGNvZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2FwcztcclxuICAgIH07XHJcbiAgICBjb25zdCBsaXZlcG9vbCA9IG5ldyBTZXQoKTtcclxuICAgIGNvbnN0IGFzY2Vuc2lvbiA9IChmdW5jdGlvbnMsIGlkeCkgPT4ge1xyXG4gICAgICAgIGlmIChsaXZlcG9vbC5oYXMoaWR4KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpdmVwb29sLmFkZChpZHgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgZGVwIG9mIGZ1bmN0aW9uc1tpZHhdLmRlcHMpIHtcclxuICAgICAgICAgICAgYXNjZW5zaW9uKGZ1bmN0aW9ucywgZGVwKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIChjb2RlLCBlbnRyeSwgZnVuY3Rpb25zKSA9PiB7XHJcbiAgICAgICAgbGV0IGRlcHRoID0gMCxcclxuICAgICAgICAgICAgc3RhdGUgPSAwLFxyXG4gICAgICAgICAgICBwYXJhbUxpc3RFbmQgPSAwO1xyXG4gICAgICAgIGVuZCA9IDA7XHJcbiAgICAgICAgc2NvcGVSRS5sYXN0SW5kZXggPSAwO1xyXG4gICAgICAgIGxpdmVwb29sLmNsZWFyKCk7XHJcbiAgICAgICAgY29uc3QgZnVuY3Rpb25zRnVsbCA9IFtdO1xyXG4gICAgICAgIC8vIGV4dHJhY3Rpb25cclxuICAgICAgICBmb3IgKGNvbnN0IGN1ciBvZiBnZXRBbGxDYXB0dXJlcyhjb2RlLCBzY29wZVJFKSkge1xyXG4gICAgICAgICAgICBjb25zdCBjID0gY3VyWzBdO1xyXG4gICAgICAgICAgICBpZiAoZGVwdGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChjID09PSAnKCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAoc3RhdGUgPSAxKSwgcmVjb3JkQmVnaW4oY29kZSwgY3VyLmluZGV4KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gJyknKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChzdGF0ZSA9IDIpLCAocGFyYW1MaXN0RW5kID0gY3VyLmluZGV4ICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gJ3snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSAyICYmIHNwYWNlc1JFLnRlc3QoY29kZS5zdWJzdHJpbmcocGFyYW1MaXN0RW5kLCBjdXIuaW5kZXgpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IDM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYyA9PT0gJ3snKSB7XHJcbiAgICAgICAgICAgICAgICBkZXB0aCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjID09PSAnfScgJiYgLS1kZXB0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlICE9PSAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbmQgPSBjdXIuaW5kZXggKyAxO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbnNGdWxsLnB1c2goeyBuYW1lLCBiZWcsIGVuZCwgcGFyYW1MaXN0RW5kLCBkZXBzOiBbXSB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpbnNwZWN0aW9uXHJcbiAgICAgICAgbGV0IGVudHJ5SWR4ID0gZnVuY3Rpb25zRnVsbC5maW5kSW5kZXgoKGYpID0+IGYubmFtZSA9PT0gZW50cnkpO1xyXG4gICAgICAgIGlmIChlbnRyeUlkeCA8IDApIHtcclxuICAgICAgICAgICAgZXJyb3IoYEVGWDI0MDM6IGVudHJ5IGZ1bmN0aW9uICcke2VudHJ5fScgbm90IGZvdW5kLmApO1xyXG4gICAgICAgICAgICBlbnRyeUlkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnVuY3Rpb25zRnVsbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBmbiA9IGZ1bmN0aW9uc0Z1bGxbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGNhcHMgPSBnZXRBbGxDYXB0dXJlcyhjb2RlLCBuZXcgUmVnRXhwKCdcXFxcYicgKyBmbi5uYW1lICsgJ1xcXFxiJywgJ2cnKSk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2FwIG9mIGNhcHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGZ1bmN0aW9uc0Z1bGwuZmluZEluZGV4KChmKSA9PiBjYXAuaW5kZXggPiBmLmJlZyAmJiBjYXAuaW5kZXggPCBmLmVuZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID49IDAgJiYgdGFyZ2V0ICE9PSBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb25zRnVsbFt0YXJnZXRdLmRlcHMucHVzaChpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBleHRyYWN0IGFsbCBmdW5jdGlvbnNGdWxsIHJlYWNoYWJsZSBmcm9tIG1haW5cclxuICAgICAgICAvLyBhY3R1YWxseSB0aGlzIGV2ZW4gd29ya3Mgd2l0aCBmdW5jdGlvbiBvdmVybG9hZGluZywgYWxiZWl0IG5vdCB0aGUgYmVzdCBvdXRwdXQgcG9zc2libGU6XHJcbiAgICAgICAgLy8gb3ZlcmxvYWRzIGZvciB0aGUgc2FtZSBmdW5jdGlvbiB3aWxsIGJlIGV4dHJhY3RlZCBhbGwgYXQgb25jZSBvciBub3QgYXQgYWxsXHJcbiAgICAgICAgYXNjZW5zaW9uKGZ1bmN0aW9uc0Z1bGwsIGVudHJ5SWR4KTtcclxuICAgICAgICAvLyBlbGltaW5hdGlvblxyXG4gICAgICAgIGxldCByZXN1bHQgPSAnJyxcclxuICAgICAgICAgICAgcG9pbnRlciA9IDAsXHJcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmdW5jdGlvbnNGdWxsLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRjID0gZnVuY3Rpb25zRnVsbFtpXTtcclxuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCBiZWcsIGVuZCB9ID0gZGM7XHJcbiAgICAgICAgICAgIGlmIChsaXZlcG9vbC5oYXMoaSkgfHwgbmFtZSA9PT0gJ21haW4nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhZGp1c3QgcG9zaXRpb24gYW5kIGFkZCB0byBmaW5hbCBsaXN0XHJcbiAgICAgICAgICAgICAgICBkYy5iZWcgLT0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgZGMuZW5kIC09IG9mZnNldDtcclxuICAgICAgICAgICAgICAgIGRjLnBhcmFtTGlzdEVuZCAtPSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbnMucHVzaChkYyk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gY29kZS5zdWJzdHJpbmcocG9pbnRlciwgYmVnKTtcclxuICAgICAgICAgICAgcG9pbnRlciA9IGVuZDtcclxuICAgICAgICAgICAgb2Zmc2V0ICs9IGVuZCAtIGJlZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIGNvZGUuc3Vic3RyaW5nKHBvaW50ZXIpO1xyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbmNvbnN0IHBhcnNlQ3VzdG9tTGFiZWxzID0gKGFyciwgb3V0ID0ge30pID0+IHtcclxuICAgIGxldCBzdHIgPSBhcnIuam9pbignICcpO1xyXG4gICAgbGV0IGxhYmVsQ2FwID0gbGFiZWxSRS5leGVjKHN0cik7XHJcbiAgICB3aGlsZSAobGFiZWxDYXApIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBvdXRbbGFiZWxDYXBbMV1dID0geWFtbC5sb2FkKGxhYmVsQ2FwWzJdIHx8ICd0cnVlJyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB3YXJuKGBFRlgyMTAyOiBwYXJhbWV0ZXIgZm9yIGxhYmVsICcke2xhYmVsQ2FwWzFdfScgaXMgbm90IGxlZ2FsIFlBTUw6ICR7ZS5tZXNzYWdlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKGxhYmVsQ2FwLmluZGV4ICsgbGFiZWxDYXBbMF0ubGVuZ3RoKTtcclxuICAgICAgICBsYWJlbENhcCA9IGxhYmVsUkUuZXhlYyhzdHIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBzYXkgd2UgYXJlIGV4dHJhY3RpbmcgZnJvbSB0aGlzIHByb2dyYW06XHJcbiAqIGBgYFxyXG4gKiAgICAvLyAuLlxyXG4gKiAxMiAjaWYgVVNFX0xJR0hUSU5HXHJcbiAqICAgICAgLy8gLi5cclxuICogMzQgICAjaWYgTlVNX0xJR0hUUyA+IDBcclxuICogICAgICAgIC8vIC4uXHJcbiAqIDU2ICAgI2VuZGlmXHJcbiAqICAgICAgLy8gLi5cclxuICogNzggI2VuZGlmXHJcbiAqICAgIC8vIC4uXHJcbiAqIGBgYFxyXG4gKlxyXG4gKiB0aGUgb3V0cHV0IHdvdWxkIGJlOlxyXG4gKiBgYGBcclxuICogLy8gdGhlIGNvbXBsZXRlIGRlZmluZSBsaXN0XHJcbiAqIGRlZmluZXMgPSBbXHJcbiAqICAgeyBuYW1lOiAnVVNFX0xJR0hUSU5HJywgdHlwZTogJ2Jvb2xlYW4nLCBkZWZpbmVzOiBbXSB9LFxyXG4gKiAgIHsgbmFtZTogJ05VTV9MSUdIVFMnLCB0eXBlOiAnbnVtYmVyJywgcmFuZ2U6IFswLCAzXSwgZGVmaW5lczogWyAnVVNFX0xJR0hUSU5HJyBdIH1cclxuICogXVxyXG4gKiAvLyBib29ra2VlcGluZzogZGVmaW5lIGRlcGVuZGVuY3kgdGhyb3VnaG91dCB0aGUgY29kZVxyXG4gKiBjYWNoZSA9IHtcclxuICogICBsaW5lczogWzEyLCAzNCwgNTYsIDc4XSxcclxuICogICAxMjogWyAnVVNFX0xJR0hUSU5HJyBdLFxyXG4gKiAgIDM0OiBbICdVU0VfTElHSFRJTkcnLCAnTlVNX0xJR0hUUycgXSxcclxuICogICA1NjogWyAnVVNFX0xJR0hUSU5HJyBdLFxyXG4gKiAgIDc4OiBbXVxyXG4gKiB9XHJcbiAqIGBgYGBcclxuICovXHJcbmNvbnN0IGdldERlZnMgPSAobGluZSwgY2FjaGUpID0+IHtcclxuICAgIGxldCBpZHggPSBjYWNoZS5saW5lcy5maW5kSW5kZXgoKGkpID0+IGkgPiBsaW5lKTtcclxuICAgIGlmIChpZHggPCAwKSB7XHJcbiAgICAgICAgaWR4ID0gY2FjaGUubGluZXMubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNhY2hlW2NhY2hlLmxpbmVzW2lkeCAtIDFdXSB8fCBbXTtcclxufTtcclxuXHJcbmNvbnN0IHB1c2hEZWZpbmVzID0gKGRlZmluZXMsIGV4aXN0aW5nRGVmaW5lcywgbmV3RGVmaW5lKSA9PiB7XHJcbiAgICBpZiAoZXhpc3RpbmdEZWZpbmVzLmhhcyhuZXdEZWZpbmUubmFtZSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBkZWZpbmVzLnB1c2gobmV3RGVmaW5lKTtcclxufTtcclxuXHJcbmNvbnN0IGV4dHJhY3REZWZpbmVzID0gKHRva2VucywgZGVmaW5lcywgY2FjaGUpID0+IHtcclxuICAgIGNvbnN0IGN1ckRlZnMgPSBbXSxcclxuICAgICAgICBzYXZlID0gKGxpbmUpID0+IHtcclxuICAgICAgICAgICAgY2FjaGVbbGluZV0gPSBjdXJEZWZzLnJlZHVjZSgoYWNjLCB2YWwpID0+IGFjYy5jb25jYXQodmFsKSwgW10pO1xyXG4gICAgICAgICAgICBjYWNoZS5saW5lcy5wdXNoKGxpbmUpO1xyXG4gICAgICAgIH07XHJcbiAgICBsZXQgZWxpZkNsYXVzZXMgPSAwO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgdCA9IHRva2Vuc1tpXSxcclxuICAgICAgICAgICAgc3RyID0gdC5kYXRhLFxyXG4gICAgICAgICAgICBpZCxcclxuICAgICAgICAgICAgZGY7XHJcbiAgICAgICAgaWYgKHQudHlwZSAhPT0gJ3ByZXByb2Nlc3NvcicgfHwgc3RyLnN0YXJ0c1dpdGgoJyNleHRlbnNpb24nKSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RyID0gc3RyLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgaWYgKHN0clswXSA9PT0gJyNlbmRpZicpIHtcclxuICAgICAgICAgICAgLy8gcG9wIG9uZSBsZXZlbCB1cFxyXG4gICAgICAgICAgICB3aGlsZSAoZWxpZkNsYXVzZXMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJEZWZzLnBvcCgpLCBlbGlmQ2xhdXNlcy0tO1xyXG4gICAgICAgICAgICB9IC8vIHBvcCBhbGwgdGhlIGVsaWZzXHJcbiAgICAgICAgICAgIGN1ckRlZnMucG9wKCk7XHJcbiAgICAgICAgICAgIHNhdmUodC5saW5lKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJbMF0gPT09ICcjZWxzZScgfHwgc3RyWzBdID09PSAnI2VsaWYnKSB7XHJcbiAgICAgICAgICAgIC8vIGZsaXBcclxuICAgICAgICAgICAgY29uc3QgZGVmID0gY3VyRGVmc1tjdXJEZWZzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICBkZWYgJiYgZGVmLmZvckVhY2goKGQsIGkpID0+IChkZWZbaV0gPSBkWzBdID09PSAnIScgPyBkLnNsaWNlKDEpIDogJyEnICsgZCkpO1xyXG4gICAgICAgICAgICBzYXZlKHQubGluZSk7XHJcbiAgICAgICAgICAgIGlmIChzdHJbMF0gPT09ICcjZWxzZScpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsaWZDbGF1c2VzKys7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJbMF0gPT09ICcjcHJhZ21hJykge1xyXG4gICAgICAgICAgICAvLyBwcmFnbWFzXHJcbiAgICAgICAgICAgIGlmIChzdHIubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdHJbMV0gPT09ICdkZWZpbmUtbWV0YScpIHtcclxuICAgICAgICAgICAgICAgIC8vIGRlZmluZSBzcGVjaWZpY2F0aW9uc1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0ci5sZW5ndGggPD0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhcm4oJ0VGWDIxMDE6IGRlZmluZSBwcmFnbWE6IG1pc3NpbmcgaW5mbycsIHQubGluZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZGVudC5sYXN0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpZGVudC50ZXN0KHN0clsyXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH0gLy8gc29tZSBjb25zdGFudCBtYWNybyByZXBsYWNlZCB0aGlzIG9uZSwgc2tpcFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGN1ckRlZnMucmVkdWNlKChhY2MsIHZhbCkgPT4gYWNjLmNvbmNhdCh2YWwpLCBbXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVmID0gZGVmaW5lcy5maW5kKChkKSA9PiBkLm5hbWUgPT09IHN0clsyXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRlZikge1xyXG4gICAgICAgICAgICAgICAgICAgIHB1c2hEZWZpbmVzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5leGlzdGluZ0RlZmluZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChkZWYgPSB7IG5hbWU6IHN0clsyXSwgdHlwZTogJ2Jvb2xlYW4nLCBkZWZpbmVzOiBkLCBkdW1teURlcGVuZGVuY3k6IHRydWUgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3AgPSBwYXJzZUN1c3RvbUxhYmVscyhzdHIuc3BsaWNlKDMpKTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHByb3ApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAncmFuZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG51bWJlciByYW5nZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWYudHlwZSA9ICdudW1iZXInO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWYucmFuZ2UgPSBbMCwgM107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZi5maXhlZFR5cGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvcC5yYW5nZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhcm4oYEVGWDIxMDM6IGludmFsaWQgcmFuZ2UgZm9yIG1hY3JvICcke2RlZi5uYW1lfSdgLCB0LmxpbmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmLnJhbmdlID0gcHJvcC5yYW5nZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnb3B0aW9ucycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RyaW5nIG9wdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmLnR5cGUgPSAnc3RyaW5nJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmLm9wdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmLmZpeGVkVHlwZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9wLm9wdGlvbnMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXJuKGBFRlgyMTA0OiBpbnZhbGlkIG9wdGlvbnMgZm9yIG1hY3JvICcke2RlZi5uYW1lfSdgLCB0LmxpbmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmLm9wdGlvbnMgPSBwcm9wLm9wdGlvbnM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocHJvcC5kZWZhdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRydWU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmLmRlZmF1bHQgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBmYWxzZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWYuZGVmYXVsdCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZi50eXBlID0gJ2NvbnN0YW50JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWYuZGVmYXVsdCA9IHByb3AuZGVmYXVsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWYuZml4ZWRUeXBlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZWRpdG9yJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWYuZWRpdG9yID0gcHJvcC5lZGl0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2FybihgRUZYMjEwNTogZGVmaW5lIHByYWdtYTogaWxsZWdhbCBsYWJlbCAnJHtrZXl9J2AsIHQubGluZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzdHJbMV0gPT09ICd3YXJuaW5nJykge1xyXG4gICAgICAgICAgICAgICAgd2FybihgRUZYMjEwNzogJHtzdHIuc2xpY2UoMikuam9pbignICcpfWApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0clsxXSA9PT0gJ2Vycm9yJykge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IoYEVGWDIxMDg6ICR7c3RyLnNsaWNlKDIpLmpvaW4oJyAnKX1gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIG90aGVyIHNwZWNpZmljYXRpb25zLCBzYXZlIGZvciBsYXRlciBwYXNzZXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVscyA9IHBhcnNlQ3VzdG9tTGFiZWxzKHN0ci5zbGljZSgxKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobGFiZWxzLmV4dGVuc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbiByZXF1ZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuZXh0ZW5zaW9uc1tsYWJlbHMuZXh0ZW5zaW9uWzBdXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogZ2V0RGVmcyh0LmxpbmUsIGNhY2hlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZDogbGFiZWxzLmV4dGVuc2lvblsxXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxhYmVscy5leHRlbnNpb25bMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnRpbWVDb25kOiBsYWJlbHMuZXh0ZW5zaW9uWzNdLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlW3QubGluZV0gPSBsYWJlbHM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICghLyMoZWwpP2lmJC8udGVzdChzdHJbMF0pKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGVmcyA9IFtdO1xyXG4gICAgICAgIGxldCBvckFwcGVhcmVkID0gZmFsc2U7XHJcbiAgICAgICAgc3RyLnNwbGljZSgxKS5zb21lKChzKSA9PiB7XHJcbiAgICAgICAgICAgIGlkZW50Lmxhc3RJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGlkID0gaWRlbnQuZXhlYyhzKTtcclxuICAgICAgICAgICAgaWYgKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpcyBpZGVudGlmaWVyXHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgaWRbMF0gPT09ICdkZWZpbmVkJyB8fCAvLyBza2lwIG1hY3JvcyB0aGF0IGNhbiBiZSB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgICAgICBpZFswXS5zdGFydHNXaXRoKCdfXycpIHx8IC8vIHNraXAgbGFuZ3VhZ2UgYnVpbHRpbiBtYWNyb3NcclxuICAgICAgICAgICAgICAgICAgICBpZFswXS5zdGFydHNXaXRoKCdHTF8nKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGlkWzBdID09PSAnVlVMS0FOJ1xyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGN1ckRlZnMucmVkdWNlKChhY2MsIHZhbCkgPT4gYWNjLmNvbmNhdCh2YWwpLCBkZWZzLnNsaWNlKCkpO1xyXG4gICAgICAgICAgICAgICAgZGYgPSBkZWZpbmVzLmZpbmQoKGQpID0+IGQubmFtZSA9PT0gaWRbMF0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5lZWRVcGRhdGUgPSBkLmxlbmd0aCA8IGRmLmRlZmluZXMubGVuZ3RoOyAvLyB1cGRhdGUgcGF0aCBpZiBzaG9ydGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRmLmR1bW15RGVwZW5kZW5jeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAobmVlZFVwZGF0ZSA9IHRydWUpLCBkZWxldGUgZGYuZHVtbXlEZXBlbmRlbmN5O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gLy8gb3IgaGF2ZSBhIGR1bW15XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5lZWRVcGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGYuZGVmaW5lcyA9IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwdXNoRGVmaW5lcyhkZWZpbmVzLCBjYWNoZS5leGlzdGluZ0RlZmluZXMsIChkZiA9IHsgbmFtZTogaWRbMF0sIHR5cGU6ICdib29sZWFuJywgZGVmaW5lczogZCB9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWZzLnB1c2goKHNbMF0gPT09ICchJyA/ICchJyA6ICcnKSArIGlkWzBdKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkZiAmJiAvXls8PT5dKyQvLnRlc3QocykgJiYgIWRmLmZpeGVkVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgZGYudHlwZSA9ICdudW1iZXInO1xyXG4gICAgICAgICAgICAgICAgZGYucmFuZ2UgPSBbMCwgM107XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocyA9PT0gJ3x8Jykge1xyXG4gICAgICAgICAgICAgICAgb3JBcHBlYXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChvckFwcGVhcmVkKSB7XHJcbiAgICAgICAgICAgIGRlZnMgPSBbXTsgLy8gb3IgaXMgbm90IHN1cHBvcnRlZCwgc2tpcCBhbGxcclxuICAgICAgICB9XHJcbiAgICAgICAgY3VyRGVmcy5wdXNoKGRlZnMpO1xyXG4gICAgICAgIHNhdmUodC5saW5lKTtcclxuICAgIH1cclxuICAgIGRlZmluZXMuZm9yRWFjaCgoZCkgPT4gKGRlbGV0ZSBkLmZpeGVkVHlwZSwgZGVsZXRlIGQuZHVtbXlEZXBlbmRlbmN5KSk7XHJcbn07XHJcblxyXG5jb25zdCBleHRyYWN0VXBkYXRlUmF0ZXMgPSAodG9rZW5zLCByYXRlcyA9IFtdKSA9PiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCB0ID0gdG9rZW5zW2ldLFxyXG4gICAgICAgICAgICBzdHIgPSB0LmRhdGEsXHJcbiAgICAgICAgICAgIGlkLFxyXG4gICAgICAgICAgICBkZjtcclxuICAgICAgICBpZiAodC50eXBlICE9PSAncHJlcHJvY2Vzc29yJyB8fCBzdHIuc3RhcnRzV2l0aCgnI2V4dGVuc2lvbicpKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdHIgPSBzdHIuc3BsaXQoL1xccysvKTtcclxuICAgICAgICBpZiAoc3RyWzBdID09PSAnI3ByYWdtYScgJiYgc3RyLmxlbmd0aCA9PT0gNCkge1xyXG4gICAgICAgICAgICBpZiAoc3RyWzFdID09PSAncmF0ZScpIHtcclxuICAgICAgICAgICAgICAgIHJhdGVzLnB1c2goeyBuYW1lOiBzdHJbMl0sIHJhdGU6IHN0clszXSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByYXRlcztcclxufTtcclxuXHJcbmNvbnN0IGV4dHJhY3RVbmZpbHRlcmFibGVGbG9hdCA9ICh0b2tlbnMsIHNhbXBsZVR5cGVzID0gW10pID0+IHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdCA9IHRva2Vuc1tpXTtcclxuICAgICAgICBsZXQgc3RyID0gdC5kYXRhO1xyXG4gICAgICAgIGlmICh0LnR5cGUgIT09ICdwcmVwcm9jZXNzb3InIHx8IHN0ci5zdGFydHNXaXRoKCcjZXh0ZW5zaW9uJykpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0ciA9IHN0ci5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgIGlmIChzdHJbMF0gPT09ICcjcHJhZ21hJyAmJiBzdHIubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgIGlmIChzdHJbMV0gPT09ICd1bmZpbHRlcmFibGUtZmxvYXQnKSB7XHJcbiAgICAgICAgICAgICAgICBzYW1wbGVUeXBlcy5wdXNoKHsgbmFtZTogc3RyWzJdLCBzYW1wbGVUeXBlOiAxIH0pOyAvLyBTYW1wbGVUeXBlLlVORklMVEVSQUJMRV9GTE9BVFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNhbXBsZVR5cGVzO1xyXG59O1xyXG5cclxuY29uc3QgZXh0cmFjdFBhcmFtcyA9ICgoKSA9PiB7XHJcbiAgICAvLyB0b2tlbnMgKGZyb20gaXRoKTogWyAuLi4sICgnaGlnaHAnLCAnICcsKSAndmVjNCcsICcgJywgJ2NvbG9yJywgKCdbJywgJzQnLCAnXScsKSAuLi4gXVxyXG4gICAgY29uc3QgcHJlY2lzaW9uID0gLyhsb3d8bWVkaXVtfGhpZ2gpcC87XHJcbiAgICBjb25zdCBleHRyYWN0SW5mbyA9ICh0b2tlbnMsIGkpID0+IHtcclxuICAgICAgICBjb25zdCBwYXJhbSA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGRlZmluZWRQcmVjaXNpb24gPSBwcmVjaXNpb24uZXhlYyh0b2tlbnNbaV0uZGF0YSk7XHJcbiAgICAgICAgbGV0IG9mZnNldCA9IGRlZmluZWRQcmVjaXNpb24gPyAyIDogMDtcclxuICAgICAgICBwYXJhbS5uYW1lID0gdG9rZW5zW2kgKyBvZmZzZXQgKyAyXS5kYXRhO1xyXG4gICAgICAgIHBhcmFtLnR5cGVuYW1lID0gdG9rZW5zW2kgKyBvZmZzZXRdLmRhdGE7XHJcbiAgICAgICAgcGFyYW0udHlwZSA9IGNvbnZlcnRUeXBlKHRva2Vuc1tpICsgb2Zmc2V0XS5kYXRhKTtcclxuICAgICAgICBwYXJhbS5jb3VudCA9IDE7XHJcbiAgICAgICAgaWYgKGRlZmluZWRQcmVjaXNpb24pIHtcclxuICAgICAgICAgICAgcGFyYW0ucHJlY2lzaW9uID0gZGVmaW5lZFByZWNpc2lvblswXSArICcgJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaGFuZGxlIGFycmF5IHR5cGVcclxuICAgICAgICBpZiAodG9rZW5zWyhvZmZzZXQgPSBuZXh0V29yZCh0b2tlbnMsIGkgKyBvZmZzZXQgKyAyKSldLmRhdGEgPT09ICdbJykge1xyXG4gICAgICAgICAgICBsZXQgZXhwciA9ICcnLFxyXG4gICAgICAgICAgICAgICAgZW5kID0gb2Zmc2V0O1xyXG4gICAgICAgICAgICB3aGlsZSAodG9rZW5zWysrZW5kXS5kYXRhICE9PSAnXScpIHtcclxuICAgICAgICAgICAgICAgIGV4cHIgKz0gdG9rZW5zW2VuZF0uZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKC9eW1xcZCtcXC0qLyVcXHNdKyQvLnRlc3QoZXhwcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbS5jb3VudCA9IGV2YWwoZXhwcik7XHJcbiAgICAgICAgICAgICAgICB9IC8vIGFyaXRobWV0aWNzXHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChidWlsdGluUkUudGVzdChwYXJhbS5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtLmNvdW50ID0gZXhwcjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXhwcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHBhcmFtLmlzQXJyYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcihgRUZYMjIwMjogJHtwYXJhbS5uYW1lfTogbm9uLWJ1aWx0aW4gYXJyYXkgbGVuZ3RoIG11c3QgYmUgY29tcGlsZS10aW1lIGNvbnN0YW50OiAke2V9YCwgdG9rZW5zW29mZnNldF0ubGluZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhcmFtO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHN0cmlwRHVwbGljYXRlcyA9IChhcnIpID0+IHtcclxuICAgICAgICBjb25zdCBkaWN0ID0ge307XHJcbiAgICAgICAgcmV0dXJuIGFyci5maWx0ZXIoKGUpID0+IChkaWN0W2VdID8gZmFsc2UgOiAoZGljdFtlXSA9IHRydWUpKSk7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgZXhNYXAgPSB7IHdoaXRlc3BhY2U6IHRydWUgfTtcclxuICAgIGNvbnN0IG5leHRXb3JkID0gKHRva2VucywgaSkgPT4ge1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgKytpO1xyXG4gICAgICAgIH0gd2hpbGUgKGV4TWFwW3Rva2Vuc1tpXS50eXBlXSk7XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgbmV4dFNlbWljb2xvbiA9ICh0b2tlbnMsIGksIGNoZWNrID0gKHQpID0+IHsgfSkgPT4ge1xyXG4gICAgICAgIHdoaWxlICh0b2tlbnNbaV0uZGF0YSAhPT0gJzsnKSB7XHJcbiAgICAgICAgICAgIGNoZWNrKHRva2Vuc1tpKytdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgaXNGdW5jdGlvblBhcmFtZXRlciA9IChmdW5jdGlvbnMsIHBvcykgPT4gZnVuY3Rpb25zLnNvbWUoKGYpID0+IHBvcyA+IGYuYmVnICYmIHBvcyA8IGYucGFyYW1MaXN0RW5kKTtcclxuICAgIGNvbnN0IG5vbkJsb2NrVW5pZm9ybXMgPSAvdGV4dHVyZXxzYW1wbGVyfGltYWdlfHN1YnBhc3NJbnB1dC87XHJcbiAgICByZXR1cm4gKHRva2VucywgY2FjaGUsIHNoYWRlckluZm8sIHN0YWdlLCBmdW5jdGlvbnMpID0+IHtcclxuICAgICAgICBjb25zdCByZXMgPSBbXTtcclxuICAgICAgICBjb25zdCBpc1ZlcnQgPSBzdGFnZSA9PT0gJ3ZlcnQnO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0ID0gdG9rZW5zW2ldLFxyXG4gICAgICAgICAgICAgICAgc3RyID0gdC5kYXRhLFxyXG4gICAgICAgICAgICAgICAgZGVzdCxcclxuICAgICAgICAgICAgICAgIHR5cGU7XHJcbiAgICAgICAgICAgIGlmIChzdHIgPT09ICd1bmlmb3JtJykge1xyXG4gICAgICAgICAgICAgICAgKGRlc3QgPSBzaGFkZXJJbmZvLmJsb2NrcyksICh0eXBlID0gJ2Jsb2NrcycpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0ciA9PT0gJ2luJyAmJiAhaXNGdW5jdGlvblBhcmFtZXRlcihmdW5jdGlvbnMsIHQucG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhZ2UgPT09ICdjb21wdXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbXB1dGUgc2hhZGVyIGxvY2FsX3NpemUgZGVmaW5pdGlvbiwgc2tpcHBlZFxyXG4gICAgICAgICAgICAgICAgICAgIGkgPSBuZXh0V29yZCh0b2tlbnMsIGkgKyAyKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlc3QgPSBpc1ZlcnQgPyBzaGFkZXJJbmZvLmF0dHJpYnV0ZXMgOiBzaGFkZXJJbmZvLnZhcnlpbmdzO1xyXG4gICAgICAgICAgICAgICAgdHlwZSA9IGlzVmVydCA/ICdhdHRyaWJ1dGVzJyA6ICd2YXJ5aW5ncyc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyID09PSAnb3V0JyAmJiAhaXNGdW5jdGlvblBhcmFtZXRlcihmdW5jdGlvbnMsIHQucG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0ID0gaXNWZXJ0ID8gc2hhZGVySW5mby52YXJ5aW5ncyA6IHNoYWRlckluZm8uZnJhZ0NvbG9ycztcclxuICAgICAgICAgICAgICAgIHR5cGUgPSBpc1ZlcnQgPyAndmFyeWluZ3MnIDogJ2ZyYWdDb2xvcnMnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0ciA9PT0gJ2J1ZmZlcicpIHtcclxuICAgICAgICAgICAgICAgIChkZXN0ID0gc2hhZGVySW5mby5idWZmZXJzKSwgKHR5cGUgPSAnYnVmZmVycycpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZGVmaW5lcyA9IGdldERlZnModC5saW5lLCBjYWNoZSksXHJcbiAgICAgICAgICAgICAgICBwYXJhbSA9IHt9O1xyXG4gICAgICAgICAgICAvLyB1bmlmb3Jtc1xyXG4gICAgICAgICAgICBwYXJhbS50YWdzID0gY2FjaGVbdC5saW5lIC0gMV07IC8vIHBhc3MgcHJhZ21hIHRhZ3MgZnVydGhlclxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gbmV4dFdvcmQodG9rZW5zLCBpICsgMik7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbnNbaWR4XS5kYXRhICE9PSAneycpIHtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ocGFyYW0sIGV4dHJhY3RJbmZvKHRva2VucywgaSArIDIpKTtcclxuICAgICAgICAgICAgICAgIGlmIChkZXN0ID09PSBzaGFkZXJJbmZvLmJsb2Nrcykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNhbXBsZXJUZXh0dXJlc1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVUeXBlID0gdG9rZW5zW2kgKyAocGFyYW0ucHJlY2lzaW9uID8gNCA6IDIpXS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVUeXBlQ2FwID0gbm9uQmxvY2tVbmlmb3Jtcy5leGVjKHVUeXBlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXVUeXBlQ2FwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKCdFRlgyMjAxOiB2ZWN0b3IgdW5pZm9ybXMgbXVzdCBiZSBkZWNsYXJlZCBpbiBibG9ja3MuJywgdC5saW5lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVUeXBlID09PSAnc2FtcGxlcicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdCA9IHNoYWRlckluZm8uc2FtcGxlcnM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnc2FtcGxlcnMnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodVR5cGVDYXBbMF0gPT09ICdzYW1wbGVyJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0ID0gc2hhZGVySW5mby5zYW1wbGVyVGV4dHVyZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnc2FtcGxlclRleHR1cmVzJztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVUeXBlQ2FwWzBdID09PSAndGV4dHVyZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdCA9IHNoYWRlckluZm8udGV4dHVyZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSAndGV4dHVyZXMnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodVR5cGVDYXBbMF0gPT09ICdpbWFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdCA9IHNoYWRlckluZm8uaW1hZ2VzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlID0gJ2ltYWdlcyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1VHlwZUNhcFswXSA9PT0gJ3N1YnBhc3NJbnB1dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdCA9IHNoYWRlckluZm8uc3VicGFzc0lucHV0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdzdWJwYXNzSW5wdXRzJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IC8vIG90aGVyIGF0dHJpYnV0ZXMgb3IgdmFyeWluZ3NcclxuICAgICAgICAgICAgICAgIGlkeCA9IG5leHRTZW1pY29sb24odG9rZW5zLCBpZHgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gYmxvY2tzXHJcbiAgICAgICAgICAgICAgICBwYXJhbS5uYW1lID0gdG9rZW5zW2kgKyAyXS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgcGFyYW0ubWVtYmVycyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRva2Vuc1soaWR4ID0gbmV4dFdvcmQodG9rZW5zLCBpZHgpKV0uZGF0YSAhPT0gJ30nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc3QgIT09IHNoYWRlckluZm8uYnVmZmVycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBkb24ndCBuZWVkIHRvIHBhcnNlIFNTQk8gbWVtYmVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gZXh0cmFjdEluZm8odG9rZW5zLCBpZHgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwcGluZ3MuaXNTYW1wbGVyKGluZm8udHlwZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKCdFRlgyMjA4OiB0ZXh0dXJlIHVuaWZvcm1zIG11c3QgYmUgZGVjbGFyZWQgb3V0c2lkZSBibG9ja3MuJywgdG9rZW5zW2lkeF0ubGluZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW0ubWVtYmVycy5wdXNoKGluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZHggPSBuZXh0U2VtaWNvbG9uKHRva2VucywgaWR4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIHN0ZDE0MCBzcGVjaWZpYyBjaGVja3NcclxuICAgICAgICAgICAgICAgIHBhcmFtLm1lbWJlcnMucmVkdWNlKChhY2MsIGN1cikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBiYXNlQWxpZ25tZW50ID0gbWFwcGluZ3MuR2V0VHlwZVNpemUoY3VyLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoY3VyLnR5cGVuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ21hdDInOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUFsaWdubWVudCAvPSAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ21hdDMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUFsaWdubWVudCAvPSAzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ21hdDQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUFsaWdubWVudCAvPSA0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXIuY291bnQgPiAxICYmIGJhc2VBbGlnbm1lbnQgPCAxNikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlTXNnID0gYHVuaWZvcm0gJHtjb252ZXJ0VHlwZShjdXIudHlwZSl9ICR7Y3VyLm5hbWV9WyR7Y3VyLmNvdW50fV1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcignRUZYMjIwMzogJyArIHR5cGVNc2cgKyAnOiBhcnJheSBVQk8gbWVtYmVycyBuZWVkIHRvIGJlIDE2LWJ5dGVzLWFsaWduZWQgdG8gYXZvaWQgaW1wbGljaXQgcGFkZGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlQWxpZ25tZW50ID0gMTY7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlQWxpZ25tZW50ID09PSAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlTXNnID0gYHVuaWZvcm0gJHtjb252ZXJ0VHlwZShjdXIudHlwZSl9ICR7Y3VyLm5hbWV9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoJ0VGWDIyMDQ6ICcgKyB0eXBlTXNnICsgJzogcGxlYXNlIHVzZSAxLCAyIG9yIDQtY29tcG9uZW50IHZlY3RvcnMgdG8gYXZvaWQgaW1wbGljaXQgcGFkZGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlQWxpZ25tZW50ID0gMTY7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtYXBwaW5ncy5pc1BhZGRlZE1hdHJpeChjdXIudHlwZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZU1zZyA9IGB1bmlmb3JtICR7Y29udmVydFR5cGUoY3VyLnR5cGUpfSAke2N1ci5uYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKCdFRlgyMjEwOiAnICsgdHlwZU1zZyArICc6IHVzZSBvbmx5IDR4NCBtYXRyaWNlcyB0byBhdm9pZCBpbXBsaWNpdCBwYWRkaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFsaWduZWRPZmZzZXQgPSBNYXRoLmNlaWwoYWNjIC8gYmFzZUFsaWdubWVudCkgKiBiYXNlQWxpZ25tZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGltcGxpY2l0UGFkZGluZyA9IGFsaWduZWRPZmZzZXQgLSBhY2M7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGxpY2l0UGFkZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBFRlgyMjA1OiBVQk8gJyR7cGFyYW0ubmFtZX0nIGludHJvZHVjZXMgaW1wbGljaXQgcGFkZGluZzogYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtpbXBsaWNpdFBhZGRpbmd9IGJ5dGVzIGJlZm9yZSAnJHtjdXIubmFtZX0nLCBjb25zaWRlciByZS1vcmRlcmluZyB0aGUgbWVtYmVyc2AsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbGlnbmVkT2Zmc2V0ICsgYmFzZUFsaWdubWVudCAqIGN1ci5jb3VudDsgLy8gYmFzZSBvZmZzZXQgZm9yIHRoZSBuZXh0IG1lbWJlclxyXG4gICAgICAgICAgICAgICAgfSwgMCk7IC8vIHRvcCBsZXZlbCBVQk9zIGhhdmUgYSBiYXNlIG9mZnNldCBvZiB6ZXJvXHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgcHJlcHJvY2Vzc29ycyBpbnNpZGUgYmxvY2tzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmUgPSBjYWNoZS5saW5lcy5maW5kKChsKSA9PiBsID49IHRva2Vuc1tpXS5saW5lICYmIGwgPCB0b2tlbnNbaWR4XS5saW5lKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihgRUZYMjIwNjogJHtwYXJhbS5uYW1lfTogbm8gcHJlcHJvY2Vzc29ycyBhbGxvd2VkIGluc2lkZSB1bmlmb3JtIGJsb2NrcyFgLCBwcmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIHN0cnVjdCBtZW1iZXJzXHJcbiAgICAgICAgICAgICAgICBwYXJhbS5tZW1iZXJzLmZvckVhY2goKGluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGluZm8udHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgRUZYMjIxMTogJyR7aW5mby50eXBlfSAke2luZm8ubmFtZX0nIGluIGJsb2NrICcke3BhcmFtLm5hbWV9JzogYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3RydWN0LXR5cGVkIG1lbWJlciB3aXRoaW4gVUJPcyBpcyBub3Qgc3VwcG9ydGVkIGR1ZSB0byBjb21wYXRpYmlsaXR5IHJlYXNvbnMuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuc1tpZHhdLmxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZHggPSBuZXh0V29yZCh0b2tlbnMsIGlkeCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9rZW5zW2lkeF0uZGF0YSAhPT0gJzsnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdFRlgyMjA5OiBCbG9jayBkZWNsYXJhdGlvbnMgbXVzdCBiZSBzZW1pY29sb24tdGVybWluYXRlZO+8jG5vbi1hcnJheS10eXBlZCBhbmQgaW5zdGFuY2UtbmFtZS1mcmVlLiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYFBsZWFzZSBjaGVjayB5b3VyICcke3BhcmFtLm5hbWV9JyBibG9jayBkZWNsYXJhdGlvbi5gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnNbaWR4XS5saW5lLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGR1cGxpY2F0ZXNcclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGRlc3QuZmluZCgoaSkgPT4gaS5uYW1lID09PSBwYXJhbS5uYW1lKTtcclxuICAgICAgICAgICAgaWYgKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJhbS5tZW1iZXJzICYmIEpTT04uc3RyaW5naWZ5KGl0ZW0ubWVtYmVycykgIT09IEpTT04uc3RyaW5naWZ5KHBhcmFtLm1lbWJlcnMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoYEVGWDIyMDc6IGRpZmZlcmVudCBVQk8gdXNpbmcgdGhlIHNhbWUgbmFtZSAnJHtwYXJhbS5uYW1lfSdgLCB0LmxpbmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaXRlbS5zdGFnZUZsYWdzIHw9IG1hcFNoYWRlclN0YWdlKHN0YWdlKTtcclxuICAgICAgICAgICAgICAgIHBhcmFtLmR1cGxpY2F0ZSA9IGl0ZW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGJlZyA9IGk7XHJcbiAgICAgICAgICAgIGlmIChkZXN0ID09PSBzaGFkZXJJbmZvLmJ1ZmZlcnMgfHwgZGVzdCA9PT0gc2hhZGVySW5mby5pbWFnZXMpIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtLm1lbW9yeUFjY2VzcyA9IG1hcHBpbmdzLmdldE1lbW9yeUFjY2Vzc0ZsYWcodG9rZW5zW2kgLSAyXS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmICgvd3JpdGVvbmx5fHJlYWRvbmx5Ly50ZXN0KHRva2Vuc1tpIC0gMl0uZGF0YSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZWcgPSBpIC0gMjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXMucHVzaCh7IGJlZzogdG9rZW5zW2JlZ10ucG9zaXRpb24sIGVuZDogdG9rZW5zW2lkeF0ucG9zaXRpb24sIHBhcmFtOiBwYXJhbS5kdXBsaWNhdGUgfHwgcGFyYW0sIHR5cGUgfSk7XHJcbiAgICAgICAgICAgIGlmICghcGFyYW0uZHVwbGljYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbS5kZWZpbmVzID0gc3RyaXBEdXBsaWNhdGVzKGRlZmluZXMpO1xyXG4gICAgICAgICAgICAgICAgcGFyYW0uc3RhZ2VGbGFncyA9IG1hcFNoYWRlclN0YWdlKHN0YWdlKTtcclxuICAgICAgICAgICAgICAgIGRlc3QucHVzaChwYXJhbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbm93IHdlIGFyZSBkb25lIHdpdGggdGhlIHdob2xlIGV4cHJlc3Npb25cclxuICAgICAgICAgICAgaSA9IGlkeDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH07XHJcbn0pKCk7XHJcblxyXG5jb25zdCBtaXNjQ2hlY2tzID0gKCgpID0+IHtcclxuICAgIC8vIG1vc3RseSBmcm9tIGdsc2wgMTAwIHNwZWMsIGV4Y2VwdDpcclxuICAgIC8vICd0ZXh0dXJlJyBpcyByZXNlcnZlZCBvbiBhbmRyb2lkIGRldmljZXMgd2l0aCByZWxhdGl2ZWx5IG5ldyBHUFVzXHJcbiAgICAvLyB1c2FnZSBhcyBhbiBpZGVudGlmaWVyIHdpbGwgbGVhZCB0byBydW50aW1lIGNvbXBpbGF0aW9uIGZhaWx1cmU6XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGVkcm9TRzk0L3J0bXAtcnRzcC1zdHJlYW0tY2xpZW50LWphdmEvaXNzdWVzLzE0NlxyXG4gICAgY29uc3QgcmVzZXJ2ZWRLZXl3b3JkcyA9XHJcbiAgICAgICAgJ2FzbXxjbGFzc3x1bmlvbnxlbnVtfHR5cGVkZWZ8dGVtcGxhdGV8dGhpc3xwYWNrZWR8Z290b3xzd2l0Y2h8ZGVmYXVsdHxpbmxpbmV8bm9pbmxpbmV8dm9sYXRpbGV8JyArXHJcbiAgICAgICAgJ3B1YmxpY3xzdGF0aWN8ZXh0ZXJufGV4dGVybmFsfGludGVyZmFjZXxmbGF0fGxvbmd8c2hvcnR8ZG91YmxlfGhhbGZ8Zml4ZWR8dW5zaWduZWR8c3VwZXJwfGlucHV0fCcgK1xyXG4gICAgICAgICdvdXRwdXR8aHZlYzJ8aHZlYzN8aHZlYzR8ZHZlYzJ8ZHZlYzN8ZHZlYzR8ZnZlYzJ8ZnZlYzN8ZnZlYzR8c2FtcGxlcjFEfHNhbXBsZXIzRHxzYW1wbGVyMURTaGFkb3d8JyArXHJcbiAgICAgICAgJ3NhbXBsZXIyRFNoYWRvd3xzYW1wbGVyMkRSZWN0fHNhbXBsZXIzRFJlY3R8c2FtcGxlcjJEUmVjdFNoYWRvd3xzaXplb2Z8Y2FzdHxuYW1lc3BhY2V8dXNpbmd8dGV4dHVyZSc7XHJcbiAgICBjb25zdCBrZXl3b3JkUkUgPSBuZXcgUmVnRXhwKGBcXFxcYig/OiR7cmVzZXJ2ZWRLZXl3b3Jkc30pXFxcXGJgKTtcclxuICAgIGNvbnN0IHByZWNpc2lvblJFID0gL3ByZWNpc2lvblxccysobG93fG1lZGl1bXxoaWdoKXBcXHMrKFxcdyspLztcclxuICAgIHJldHVybiAoY29kZSkgPT4ge1xyXG4gICAgICAgIC8vIHByZWNpc2lvbiBkZWNsYXJhdGlvbiBjaGVja1xyXG4gICAgICAgIGNvbnN0IGNhcCA9IHByZWNpc2lvblJFLmV4ZWMoY29kZSk7XHJcbiAgICAgICAgaWYgKGNhcCkge1xyXG4gICAgICAgICAgICBpZiAoLyNleHRlbnNpb24vLnRlc3QoY29kZS5zbGljZShjYXAuaW5kZXgpKSkge1xyXG4gICAgICAgICAgICAgICAgd2FybignRUZYMjQwMDogcHJlY2lzaW9uIGRlY2xhcmF0aW9uIHNob3VsZCBjb21lIGFmdGVyIGV4dGVuc2lvbnMnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdhcm4oJ0VGWDI0MDE6IHByZWNpc2lvbiBkZWNsYXJhdGlvbiBub3QgZm91bmQuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlc0NhcCA9IGtleXdvcmRSRS5leGVjKGNvZGUpO1xyXG4gICAgICAgIGlmIChyZXNDYXApIHtcclxuICAgICAgICAgICAgZXJyb3IoYEVGWDI0MDI6IHVzaW5nIHJlc2VydmVkIGtleXdvcmQgaW4gZ2xzbDE6ICR7cmVzQ2FwWzBdfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGUgcGFyc2VyIHRocm93cyBvYnNjdXJlIGVycm9ycyB3aGVuIGVuY291bnRlcnMgc29tZSBzZW1hbnRpYyBlcnJvcnMsXHJcbiAgICAgICAgLy8gc28gaW4gc29tZSBzaXR1YXRpb24gZGlzYWJsaW5nIHRoaXMgbWlnaHQgYmUgYSBiZXR0ZXIgb3B0aW9uXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc2tpcFBhcnNlclRlc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBU1QgYmFzZWQgY2hlY2tzXHJcbiAgICAgICAgY29uc3QgdG9rZW5zID0gdG9rZW5pemVyKGNvZGUpLmZpbHRlcigodCkgPT4gdC50eXBlICE9PSAncHJlcHJvY2Vzc29yJyk7XHJcbiAgICAgICAgc2hhZGVyVG9rZW5zID0gdG9rZW5zO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHBhcnNlcih0b2tlbnMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZXJyb3IoYEVGWDI0MDQ6IGdsc2wxIHBhcnNlciBmYWlsZWQ6ICR7ZX1gLCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxuY29uc3QgZmluYWxUeXBlQ2hlY2sgPSAoKCkgPT4ge1xyXG4gICAgbGV0IGdsID0gcmVxdWlyZSgnZ2wnKSgzMDAsIDE1MCwgeyBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUgfSk7XHJcbiAgICBjb25zdCBzdXBwb3J0ZWRFeHRlbnNpb25zID0gZ2wuZ2V0U3VwcG9ydGVkRXh0ZW5zaW9ucygpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgIT09IHN1cHBvcnRlZEV4dGVuc2lvbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBnbC5nZXRFeHRlbnNpb24oc3VwcG9ydGVkRXh0ZW5zaW9uc1tpXSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBnZXREZWZpbmVTdHJpbmcgPSAoZGVmaW5lcykgPT5cclxuICAgICAgICBkZWZpbmVzLnJlZHVjZSgoYWNjLCBjdXIpID0+IHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gMTsgLy8gZW5hYmxlIGFsbCBib29sZWFuIHN3aXRoY2VzXHJcbiAgICAgICAgICAgIHN3aXRjaCAoY3VyLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjdXIub3B0aW9uc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjdXIucmFuZ2VbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjb25zdGFudCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjdXIuZGVmYXVsdDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY3VyLmRlZmF1bHQgPT09IHVuZGVmaW5lZCA/IDEgOiBjdXIuZGVmYXVsdDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYCR7YWNjfSNkZWZpbmUgJHtjdXIubmFtZX0gJHt2YWx1ZX1cXG5gO1xyXG4gICAgICAgIH0sICcnKTtcclxuICAgIGNvbnN0IGNvbXBpbGUgPSAoc291cmNlLCB0eXBlKSA9PiB7XHJcbiAgICAgICAgbGV0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcclxuICAgICAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xyXG4gICAgICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcclxuICAgICAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgICAgICBsZXQgbGluZU51bWJlciA9IDE7XHJcbiAgICAgICAgICAgIGNvbnN0IGR1bXAgPSBzb3VyY2UucmVwbGFjZSgvXnxcXG4vZywgKCkgPT4gYFxcbiR7bGluZU51bWJlcisrfSBgKTtcclxuICAgICAgICAgICAgY29uc3QgZXJyID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xyXG4gICAgICAgICAgICBnbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcclxuICAgICAgICAgICAgc2hhZGVyID0gbnVsbDtcclxuICAgICAgICAgICAgZXJyb3IoYEVGWDI0MDY6IGNvbXBpbGF0aW9uIGZhaWxlZDog4oaT4oaT4oaT4oaT4oaTIEVYUEFORCBUSElTIE1FU1NBR0UgRk9SIE1PUkUgSU5GTyDihpPihpPihpPihpPihpNcXG4ke2Vycn1cXG4ke2R1bXB9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzaGFkZXI7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgbGluayA9ICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgbGV0IHByb2cgPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICAgICAgYXJncy5mb3JFYWNoKChzKSA9PiBnbC5hdHRhY2hTaGFkZXIocHJvZywgcykpO1xyXG4gICAgICAgIGdsLmxpbmtQcm9ncmFtKHByb2cpO1xyXG4gICAgICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9nLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZyk7XHJcbiAgICAgICAgICAgIGdsLmRlbGV0ZVByb2dyYW0ocHJvZyk7XHJcbiAgICAgICAgICAgIHByb2cgPSBudWxsO1xyXG4gICAgICAgICAgICBlcnJvcihgRUZYMjQwNzogbGluayBmYWlsZWQ6ICR7ZXJyfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJvZztcclxuICAgIH07XHJcbiAgICByZXR1cm4gKHZlcnQsIGZyYWcsIGRlZmluZXMsIHZlcnROYW1lLCBmcmFnTmFtZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHByZWZpeCA9ICcjdmVyc2lvbiAxMDBcXG4nICsgZ2V0RGVmaW5lU3RyaW5nKGRlZmluZXMpO1xyXG4gICAgICAgIHNoYWRlck5hbWUgPSB2ZXJ0TmFtZTtcclxuICAgICAgICBjb25zdCB2cyA9IGNvbXBpbGUocHJlZml4ICsgdmVydCwgZ2wuVkVSVEVYX1NIQURFUik7XHJcbiAgICAgICAgc2hhZGVyTmFtZSA9IGZyYWdOYW1lO1xyXG4gICAgICAgIGNvbnN0IGZzID0gY29tcGlsZShwcmVmaXggKyBmcmFnLCBnbC5GUkFHTUVOVF9TSEFERVIpO1xyXG4gICAgICAgIHNoYWRlck5hbWUgPSAnbGlua2luZyc7XHJcbiAgICAgICAgY29uc3QgcHJvZyA9IGxpbmsodnMsIGZzKTtcclxuICAgICAgICBnbC5kZWxldGVQcm9ncmFtKHByb2cpO1xyXG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcihmcyk7XHJcbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHZzKTtcclxuICAgIH07XHJcbn0pKCk7XHJcblxyXG5jb25zdCBzdHJpcFRvU3BlY2lmaWNWZXJzaW9uID0gKCgpID0+IHtcclxuICAgIGNvbnN0IGdsb2JhbFNlYXJjaCA9IC8jKGlmfGVsaWZ8ZWxzZXxlbmRpZikoLiopPy9nO1xyXG4gICAgY29uc3QgbGVnYWxFeHByID0gL15bXFxkPD0+IXwmXlxcc10qKF9fVkVSU0lPTl9fKT9bXFxkPD0+IXwmXlxcc10qJC87IC8vIGFsbCBjb21waWxlLXRpbWUgY29uc3RhbnQgYnJhbmNoZXNcclxuICAgIGNvbnN0IG1hY3JvV3JhcCA9IChzcmMsIHJ1bnRpbWVDb25kLCBkZWZpbmVzKSA9PiB7XHJcbiAgICAgICAgLyogKi9cclxuICAgICAgICByZXR1cm4gcnVudGltZUNvbmQgPyBgI2lmICR7cnVudGltZUNvbmR9XFxuJHtzcmN9I2VuZGlmXFxuYCA6IHNyYztcclxuICAgICAgICAvKiBub3Qgbm93LCBtYXliZS4gdGhlIG1hY3JvIGRlcGVuZGVuY3kgZXh0cmFjdGlvbiBpcyBzdGlsbCB0b28gZnJhZ2lsZSAqXHJcbiAgICAgICAgY29uc3QgbWFjcm9zID0gZGVmaW5lcy5yZWR1Y2UoKGFjYywgY3VyKSA9PiBgJHthY2N9ICYmICR7Y3VyfWAsICcnKS5zbGljZSg0KTtcclxuICAgICAgICByZXR1cm4gbWFjcm9zID8gYCNpZiAke21hY3Jvc31cXG4ke3NyY30jZW5kaWZcXG5gIDogc3JjO1xyXG4gICAgICAgIC8qICovXHJcbiAgICB9O1xyXG4gICAgY29uc3QgZGVjbGFyZUV4dGVuc2lvbiA9IChleHQsIGxldmVsKSA9PiB7XHJcbiAgICAgICAgaWYgKGxldmVsID09PSAncmVxdWlyZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjZXh0ZW5zaW9uICR7ZXh0fTogcmVxdWlyZVxcbmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBgXFxuI2lmZGVmICR7ZXh0fVxcbiNleHRlbnNpb24gJHtleHR9OiBlbmFibGVcXG4jZW5kaWZcXG5gO1xyXG4gICAgfTtcclxuICAgIHJldHVybiAoY29kZSwgdmVyc2lvbiwgZXh0ZW5zaW9ucywgaXNWZXJ0KSA9PiB7XHJcbiAgICAgICAgaWYgKHZlcnNpb24gPCAzMTApIHtcclxuICAgICAgICAgICAgLy8ga2VlcCBzdGQxNDAgZGVjbGFyYXRpb24sIGRpc2NhcmQgb3RoZXJzXHJcbiAgICAgICAgICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL2xheW91dFxccypcXCgoLio/KVxcKShcXHMqKShcXHcrKVxccysoXFx3KykvZywgKF8sIHRva2VucywgdHJhaWxpbmdTcGFjZXMsIHR5cGUsIHVUeXBlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmVydCAmJiB0eXBlID09PSAnb3V0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfO1xyXG4gICAgICAgICAgICAgICAgfSAvLyBrZWVwIERyYXcgQnVmZmVyIGxvY2F0aW9uc1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgIT09ICdvdXQnICYmIHR5cGUgIT09ICdpbicgJiYgdHlwZSAhPT0gJ3VuaWZvcm0nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF87XHJcbiAgICAgICAgICAgICAgICB9IC8vIGtlZXAgU3RvcmFnZSBCdWZmZXIgYmluZGluZ3NcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAndW5pZm9ybScgJiYgdVR5cGUuaW5jbHVkZXMoJ2ltYWdlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXztcclxuICAgICAgICAgICAgICAgIH0gLy8ga2VlcCBTdG9yYWdlIEltYWdlIGJpbmRpbmdzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWNsID0gdG9rZW5zLmluZGV4T2YoJ3N0ZDE0MCcpID49IDAgPyAnbGF5b3V0KHN0ZDE0MCknICsgdHJhaWxpbmdTcGFjZXMgKyB0eXBlIDogdHlwZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtkZWNsfSAke3VUeXBlfWA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBleHRyYWN0aW9uXHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2VzID0gW107XHJcbiAgICAgICAgbGV0IGNhcCA9IG51bGwsXHJcbiAgICAgICAgICAgIHRlbXAgPSBudWxsO1xyXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSAqL1xyXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICAgICAgY2FwID0gZ2xvYmFsU2VhcmNoLmV4ZWMoY29kZSk7XHJcbiAgICAgICAgICAgIGlmICghY2FwKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2FwWzFdID09PSAnaWYnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGVtcCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXAubGV2ZWwrKztcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghbGVnYWxFeHByLnRlc3QoY2FwWzJdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGVtcCA9IHsgc3RhcnQ6IGNhcC5pbmRleCwgZW5kOiBjYXAuaW5kZXgsIGNvbmRzOiBbY2FwWzJdXSwgY29udGVudDogW2NhcC5pbmRleCArIGNhcFswXS5sZW5ndGhdLCBsZXZlbDogMSB9O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNhcFsxXSA9PT0gJ2VsaWYnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRlbXAgfHwgdGVtcC5sZXZlbCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghbGVnYWxFeHByLnRlc3QoY2FwWzJdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGBFRlgyMzAxOiAjZWxpZiBjb25kaXRpb25zIGFmdGVyIGEgY29uc3RhbnQgI2lmIHNob3VsZCBiZSBjb25zdGFudCB0b287IGdldCAnJHtjYXBbMl19J2ApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhcFsyXSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGVtcC5jb25kcy5wdXNoKGNhcFsyXSk7XHJcbiAgICAgICAgICAgICAgICB0ZW1wLmNvbnRlbnQucHVzaChjYXAuaW5kZXgsIGNhcC5pbmRleCArIGNhcFswXS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNhcFsxXSA9PT0gJ2Vsc2UnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRlbXAgfHwgdGVtcC5sZXZlbCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRlbXAuY29uZHMucHVzaCgndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgdGVtcC5jb250ZW50LnB1c2goY2FwLmluZGV4LCBjYXAuaW5kZXggKyBjYXBbMF0ubGVuZ3RoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjYXBbMV0gPT09ICdlbmRpZicpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGVtcCB8fCAtLXRlbXAubGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRlbXAuY29udGVudC5wdXNoKGNhcC5pbmRleCk7XHJcbiAgICAgICAgICAgICAgICB0ZW1wLmVuZCA9IGNhcC5pbmRleCArIGNhcFswXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZXMucHVzaCh0ZW1wKTtcclxuICAgICAgICAgICAgICAgIHRlbXAgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZXMgPSBjb2RlO1xyXG4gICAgICAgIGlmIChpbnN0YW5jZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIHJlcGxhY2VtZW50XHJcbiAgICAgICAgICAgIHJlcyA9IHJlcy5zdWJzdHJpbmcoMCwgaW5zdGFuY2VzWzBdLnN0YXJ0KTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBpbnN0YW5jZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlucyA9IGluc3RhbmNlc1tqXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5zLmNvbmRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2YWwoaW5zLmNvbmRzW2ldLnJlcGxhY2UoJ19fVkVSU0lPTl9fJywgdmVyc2lvbikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YkJsb2NrID0gY29kZS5zdWJzdHJpbmcoaW5zLmNvbnRlbnRbaSAqIDJdLCBpbnMuY29udGVudFtpICogMiArIDFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzICs9IHN0cmlwVG9TcGVjaWZpY1ZlcnNpb24oc3ViQmxvY2ssIHZlcnNpb24sIGlzVmVydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSAoaW5zdGFuY2VzW2ogKyAxXSAmJiBpbnN0YW5jZXNbaiArIDFdLnN0YXJ0KSB8fCBjb2RlLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHJlcyArPSBjb2RlLnN1YnN0cmluZyhpbnMuZW5kLCBuZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBleHRlbnNpb25zXHJcbiAgICAgICAgZm9yIChjb25zdCBleHQgaW4gZXh0ZW5zaW9ucykge1xyXG4gICAgICAgICAgICBjb25zdCB7IGRlZmluZXMsIGNvbmQsIGxldmVsLCBydW50aW1lQ29uZCB9ID0gZXh0ZW5zaW9uc1tleHRdO1xyXG4gICAgICAgICAgICBpZiAoZXZhbChjb25kLnJlcGxhY2UoJ19fVkVSU0lPTl9fJywgdmVyc2lvbikpKSB7XHJcbiAgICAgICAgICAgICAgICByZXMgPSBtYWNyb1dyYXAoZGVjbGFyZUV4dGVuc2lvbihleHQsIGxldmVsKSwgcnVudGltZUNvbmQsIGRlZmluZXMpICsgcmVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxuY29uc3QgZ2xzbDMwMHRvMTAwID0gKGNvZGUsIGJsb2NrcywgZGVmaW5lcywgcGFyYW1JbmZvLCBmdW5jdGlvbnMsIGNhY2hlLCB2ZXJ0KSA9PiB7XHJcbiAgICBsZXQgcmVzID0gJyc7XHJcbiAgICAvLyB1bnBhY2sgVUJPc1xyXG4gICAgbGV0IGlkeCA9IDA7XHJcbiAgICBwYXJhbUluZm8uZm9yRWFjaCgoaSkgPT4ge1xyXG4gICAgICAgIGlmIChpLnR5cGUgIT09ICdibG9ja3MnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzICs9IGNvZGUuc2xpY2UoaWR4LCBpLmJlZyk7XHJcbiAgICAgICAgY29uc3QgaW5kZW50Q291bnQgPSByZXMubGVuZ3RoIC0gcmVzLnNlYXJjaCgvXFxzKiQvKSArIDE7XHJcbiAgICAgICAgYmxvY2tzXHJcbiAgICAgICAgICAgIC5maW5kKCh1KSA9PiB1Lm5hbWUgPT09IGkucGFyYW0ubmFtZSlcclxuICAgICAgICAgICAgLm1lbWJlcnMuZm9yRWFjaCgobSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY3J1Y2lhbCBvcHRpbWl6YXRpb24sIGZvciB0aGUgdW5pZm9ybSB2ZWN0b3JzIGluIFdlYkdMIChpT1MgZXNwZWNpYWxseSkgaXMgZXh0cmVtZWx5IGxpbWl0ZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBjb2RlLm1hdGNoKG5ldyBSZWdFeHAoYFxcXFxiJHttLm5hbWV9XFxcXGJgLCAnZycpKTtcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlcyB8fCBtYXRjaGVzLmxlbmd0aCA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGNvbnZlcnRUeXBlKG0udHlwZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVjaXNpb24gPSBtLnByZWNpc2lvbiB8fCAnJztcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5U3BlYyA9IHR5cGVvZiBtLmNvdW50ID09PSAnc3RyaW5nJyB8fCBtLmlzQXJyYXkgPyBgWyR7bS5jb3VudH1dYCA6ICcnO1xyXG4gICAgICAgICAgICAgICAgcmVzICs9ICcgJy5yZXBlYXQoaW5kZW50Q291bnQpICsgYHVuaWZvcm0gJHtwcmVjaXNpb259JHt0eXBlfSAke20ubmFtZX0ke2FycmF5U3BlY307XFxuYDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgaWR4ID0gaS5lbmQgKyAoY29kZVtpLmVuZF0gPT09ICc7Jyk7XHJcbiAgICB9KTtcclxuICAgIHJlcyArPSBjb2RlLnNsaWNlKGlkeCk7XHJcbiAgICAvLyB0ZXh0dXJlIGZ1bmN0aW9uc1xyXG4gICAgcmVzID0gcmVzLnJlcGxhY2UoL1xcYnRleHR1cmUoKD8hMkR8Q3ViZSlcXHcqKVxccypcXChcXHMqKFxcdyspXFxzKihbLFtdKS9nLCAob3JpZ2luYWwsIHN1ZmZpeCwgbmFtZSwgZW5kVG9rZW4sIGlkeCkgPT4ge1xyXG4gICAgICAgIC8vIHNraXAgcmVwbGFjZW1lbnQgaWYgZnVuY3Rpb24gYWxyZWFkeSBkZWZpbmVkXHJcbiAgICAgICAgY29uc3QgZm5OYW1lID0gJ3RleHR1cmUnICsgc3VmZml4O1xyXG4gICAgICAgIGlmIChmdW5jdGlvbnMuZmluZCgoZikgPT4gZi5uYW1lID09PSBmbk5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmluZCBpbiBwYXJlbnQgc2NvcGUgZmlyc3RcclxuICAgICAgICBsZXQgcmUgPSBuZXcgUmVnRXhwKCdzYW1wbGVyKFxcXFx3KylcXFxccysnICsgbmFtZSk7XHJcbiAgICAgICAgY29uc3Qgc2NvcGUgPSBmdW5jdGlvbnMuZmluZCgoZikgPT4gaWR4ID4gZi5iZWcgJiYgaWR4IDwgZi5lbmQpO1xyXG4gICAgICAgIGxldCBjYXAgPSAoc2NvcGUgJiYgcmUuZXhlYyhyZXMuc3Vic3RyaW5nKHNjb3BlLmJlZywgc2NvcGUuZW5nKSkpIHx8IHJlLmV4ZWMocmVzKTtcclxuICAgICAgICBpZiAoIWNhcCkge1xyXG4gICAgICAgICAgICAvLyBwZXJoYXBzIGRlZmluZWQgaW4gbWFjcm9cclxuICAgICAgICAgICAgY29uc3QgZGVmID0gZGVmaW5lcy5maW5kKChkKSA9PiBkLm5hbWUgPT09IG5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoZGVmICYmIGRlZi5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2YgZGVmLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZSA9IG5ldyBSZWdFeHAoJ3NhbXBsZXIoXFxcXHcrKVxcXFxzKycgKyBuKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXAgPSByZS5leGVjKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFjYXApIHtcclxuICAgICAgICAgICAgICAgIGVycm9yKGBFRlgyMzAwOiBzYW1wbGVyICcke25hbWV9JyBkb2VzIG5vdCBleGlzdGApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRleEZuVHlwZSA9IHRleHR1cmVGdW5jUmVtYXAuZ2V0KGNhcFsxXSkgPz8gY2FwWzFdO1xyXG4gICAgICAgIHJldHVybiBgdGV4dHVyZSR7dGV4Rm5UeXBlfSR7c3VmZml4fSgke25hbWV9JHtlbmRUb2tlbn1gO1xyXG4gICAgfSk7XHJcbiAgICBpZiAodmVydCkge1xyXG4gICAgICAgIC8vIGluL291dCA9PiBhdHRyaWJ1dGUvdmFyeWluZ1xyXG4gICAgICAgIHJlcyA9IHJlcy5yZXBsYWNlKGluRGVjbCwgKHN0ciwgcXVhbGlmaWVycywgZGVjbCkgPT4gYGF0dHJpYnV0ZSAke2RlY2x9O2ApO1xyXG4gICAgICAgIHJlcyA9IHJlcy5yZXBsYWNlKG91dERlY2wsIChzdHIsIHF1YWxpZmllcnMsIGRlY2wpID0+IGB2YXJ5aW5nICR7ZGVjbH07YCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGluL291dCA9PiB2YXJ5aW5nL2dsX0ZyYWdDb2xvclxyXG4gICAgICAgIHJlcyA9IHJlcy5yZXBsYWNlKGluRGVjbCwgKHN0ciwgcXVhbGlmaWVycywgZGVjbCkgPT4gYHZhcnlpbmcgJHtkZWNsfTtgKTtcclxuICAgICAgICBjb25zdCBvdXRMaXN0ID0gW107XHJcbiAgICAgICAgcmVzID0gcmVzLnJlcGxhY2Uob3V0RGVjbCwgKHN0ciwgcXVhbGlmaWVycywgZGVjbCwgbmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbkNhcCA9IHF1YWxpZmllcnMgJiYgbG9jYXRpb25SRS5leGVjKHF1YWxpZmllcnMpO1xyXG4gICAgICAgICAgICBpZiAoIWxvY2F0aW9uQ2FwKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcignRUZYMjMwMjogZnJhZ21lbnQgb3V0cHV0IGxvY2F0aW9uIG11c3QgYmUgc3BlY2lmaWVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0TGlzdC5wdXNoKHsgbmFtZSwgbG9jYXRpb246IGxvY2F0aW9uQ2FwWzFdIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKG91dExpc3QubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG91dFJFID0gbmV3IFJlZ0V4cChgXFxcXGIke291dExpc3RbMF0ubmFtZX1cXFxcYmAsICdnJyk7XHJcbiAgICAgICAgICAgIHJlcyA9IHJlcy5yZXBsYWNlKG91dFJFLCAnZ2xfRnJhZ0NvbG9yJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChvdXRMaXN0Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgLy8gRVhUX2RyYXdfYnVmZmVyc1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG91dCBvZiBvdXRMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvdXRSRSA9IG5ldyBSZWdFeHAoYFxcXFxiJHtvdXQubmFtZX1cXFxcYmAsICdnJyk7XHJcbiAgICAgICAgICAgICAgICByZXMgPSByZXMucmVwbGFjZShvdXRSRSwgYGdsX0ZyYWdEYXRhWyR7b3V0LmxvY2F0aW9ufV1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWNhY2hlLmV4dGVuc2lvbnNbJ0dMX0VYVF9kcmF3X2J1ZmZlcnMnXSkge1xyXG4gICAgICAgICAgICAgICAgY2FjaGUuZXh0ZW5zaW9uc1snR0xfRVhUX2RyYXdfYnVmZmVycyddID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmluZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbmQ6ICdfX1ZFUlNJT05fXyA8PSAxMDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGNhbid0IHJlbGlhYmx5IGRlZHVjZSB0aGUgbWFjcm8gZGVwZW5kZWNpZXMgZm9yIHRoaXMgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc28gbm90IG1ha2luZyB0aGlzIGEgaGFyZCByZXF1aXJlIGhlcmVcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogJ2VuYWJsZScsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzID0gcmVzLnJlcGxhY2UoL2xheW91dFxccypcXCguKj9cXClcXHMqL2csICgpID0+ICcnKTsgLy8gbGF5b3V0IHF1YWxpZmllcnNcclxuICAgIHJldHVybiByZXMucmVwbGFjZShwcmFnbWFzVG9TdHJpcCwgJycpOyAvLyBzdHJpcCBwcmFnbWFzIGhlcmUgZm9yIGEgY2xlYW5lciB3ZWJnbCBjb21waWxlciBvdXRwdXRcclxufTtcclxuXHJcbmNvbnN0IGRlY29yYXRlQmxvY2tNZW1vcnlMYXlvdXRzID0gKGNvZGUsIHBhcmFtSW5mbykgPT4ge1xyXG4gICAgbGV0IGlkeCA9IDA7XHJcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcclxuICAgIHBhcmFtSW5mby5mb3JFYWNoKChpbmZvLCBwYXJhbUlkeCkgPT4ge1xyXG4gICAgICAgIGlmIChpbmZvLnR5cGUgIT09ICdibG9ja3MnICYmIGluZm8udHlwZSAhPT0gJ2J1ZmZlcnMnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaXNTU0JPID0gaW5mby50eXBlID09PSAnYnVmZmVycyc7XHJcbiAgICAgICAgY29uc3QgZnJhZyA9IGNvZGUuc2xpY2UoaWR4LCBpbmZvLmJlZyk7XHJcbiAgICAgICAgY29uc3QgY2FwID0gbGF5b3V0RXh0cmFjdC5leGVjKGZyYWcpO1xyXG4gICAgICAgIHBvc2l0aW9uc1twYXJhbUlkeF0gPSBjYXAgPyBpZHggKyBjYXAuaW5kZXggKyAoaXNTU0JPID8gMCA6IGNhcFswXS5sZW5ndGggLSBjYXBbMl0ubGVuZ3RoIC0gMSkgOiAtMTtcclxuICAgICAgICBpZHggPSBpbmZvLmVuZDtcclxuICAgIH0pO1xyXG4gICAgbGV0IHJlcyA9ICcnO1xyXG4gICAgaWR4ID0gMDtcclxuICAgIHBhcmFtSW5mby5mb3JFYWNoKChpbmZvLCBwYXJhbUlkeCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gcG9zaXRpb25zW3BhcmFtSWR4XTtcclxuICAgICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpbnNlcnQgZGVjbGFyYXRpb25zXHJcbiAgICAgICAgaWYgKGluZm8udHlwZSA9PT0gJ2Jsb2NrcycpIHtcclxuICAgICAgICAgICAgLy8gVUJPLXNwZWNpZmljXHJcbiAgICAgICAgICAgIGlmIChwb3NpdGlvbiA8IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIG5vIHF1YWxpZmllciwganVzdCBpbnNlcnQgZXZlcnl0aGluZ1xyXG4gICAgICAgICAgICAgICAgcmVzICs9IGNvZGUuc2xpY2UoaWR4LCBpbmZvLmJlZyk7XHJcbiAgICAgICAgICAgICAgICByZXMgKz0gJ2xheW91dChzdGQxNDApICc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhcHBlbmQgdGhlIHRva2VuXHJcbiAgICAgICAgICAgICAgICByZXMgKz0gY29kZS5zbGljZShpZHgsIHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIHJlcyArPSAnLCBzdGQxNDAnO1xyXG4gICAgICAgICAgICAgICAgcmVzICs9IGNvZGUuc2xpY2UocG9zaXRpb24sIGluZm8uYmVnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5mby50eXBlID09PSAnYnVmZmVycycpIHtcclxuICAgICAgICAgICAgLy8gU1NCTy1zcGVjaWZpY1xyXG4gICAgICAgICAgICBsZXQgZGVjbGFyYXRpb24gPSAnc3RkNDMwJzsgLy8gc3RkNDMwIGFyZSBwcmVmZXJyZWQgZm9yIFNTQk9zXHJcbiAgICAgICAgICAgIGlmIChpbmZvLnBhcmFtLnRhZ3MgJiYgaW5mby5wYXJhbS50YWdzLmdsQmluZGluZyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbiArPSBgLCBiaW5kaW5nID0gJHtpbmZvLnBhcmFtLnRhZ3MuZ2xCaW5kaW5nfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gaWdub3JlIGlucHV0IHNwZWNpZmllcnNcclxuICAgICAgICAgICAgcmVzICs9IGNvZGUuc2xpY2UoaWR4LCBwb3NpdGlvbiA8IDAgPyBpbmZvLmJlZyA6IHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgcmVzICs9IGBsYXlvdXQoJHtkZWNsYXJhdGlvbn0pIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXMgKz0gY29kZS5zbGljZShpbmZvLmJlZywgaW5mby5lbmQpO1xyXG4gICAgICAgIGlkeCA9IGluZm8uZW5kO1xyXG4gICAgfSk7XHJcbiAgICByZXMgKz0gY29kZS5zbGljZShpZHgpO1xyXG4gICAgcmV0dXJuIHJlcztcclxufTtcclxuXHJcbmNvbnN0IGRlY29yYXRlQmluZGluZ3MgPSAoY29kZSwgbWFuaWZlc3QsIHBhcmFtSW5mbykgPT4ge1xyXG4gICAgcGFyYW1JbmZvID0gcGFyYW1JbmZvLmZpbHRlcigoaSkgPT4gIWJ1aWx0aW5SRS50ZXN0KGkucGFyYW0ubmFtZSkpO1xyXG4gICAgbGV0IGlkeCA9IDA7XHJcbiAgICBjb25zdCByZWNvcmQgPSBbXTtcclxuICAgIGNvbnN0IG92ZXJyaWRlcyA9IHt9O1xyXG4gICAgLy8gZXh0cmFjdCBleGlzdGluZyBiaW5kaW5nIGluZm9zXHJcbiAgICBwYXJhbUluZm8uZm9yRWFjaCgoaW5mbywgcGFyYW1JZHgpID0+IHtcclxuICAgICAgICAvLyBvdmVybGFwcGluZyBsb2NhdGlvbnMvYmluZGluZ3MgdW5kZXIgZGlmZmVyZW50IG1hY3JvcyBhcmUgbm90IHN1cHBvcnRlZCB5ZXRcclxuICAgICAgICBpZiAoaW5mby50eXBlID09PSAnZnJhZ0NvbG9ycycpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuYW1lID0gaW5mby5wYXJhbS5uYW1lO1xyXG5cclxuICAgICAgICBpZiAoIW1hbmlmZXN0W2luZm8udHlwZV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmcmFnID0gY29kZS5zbGljZShpZHgsIGluZm8uYmVnKTtcclxuICAgICAgICBjb25zdCBsYXlvdXRJbmZvID0geyBwcm9wOiBpbmZvLnBhcmFtIH07XHJcbiAgICAgICAgY29uc3QgY2FwID0gbGF5b3V0RXh0cmFjdC5leGVjKGZyYWcpO1xyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gb3ZlcnJpZGVzW2luZm8udHlwZV0gfHwgKG92ZXJyaWRlc1tpbmZvLnR5cGVdID0ge30pO1xyXG4gICAgICAgIGlmIChjYXApIHtcclxuICAgICAgICAgICAgLy8gcG9zaXRpb24gb2YgJyknXHJcbiAgICAgICAgICAgIGxheW91dEluZm8ucG9zaXRpb24gPSBpZHggKyBjYXAuaW5kZXggKyBjYXBbMF0ubGVuZ3RoIC0gY2FwWzJdLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGNvbnN0IGJpbmRpbmdDYXAgPSBiaW5kaW5nRXh0cmFjdC5leGVjKGNhcFsxXSk7XHJcbiAgICAgICAgICAgIGlmIChiaW5kaW5nQ2FwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FwWzFdLnNlYXJjaCgvXFxic2V0XFxzKj0vKSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXlvdXRJbmZvLnBvc2l0aW9uID0gY2FwWzFdLmxlbmd0aCAtIGxheW91dEluZm8ucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICB9IC8vIHNob3VsZCBpbnNlcnQgc2V0IGRlY2xhcmF0aW9uXHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXlvdXRJbmZvLnBvc2l0aW9uID0gLTE7XHJcbiAgICAgICAgICAgICAgICB9IC8vIGluZGljYXRpbmcgbm8tb3BcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnQoYmluZGluZ0NhcFsxXSk7XHJcbiAgICAgICAgICAgICAgICAvLyBhZGFwdCBiaW5kaW5nc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdCA9IGluZm8udHlwZSA9PT0gJ3ZhcnlpbmdzJyB8fCBpbmZvLnR5cGUgPT09ICdhdHRyaWJ1dGVzJyA/ICdsb2NhdGlvbicgOiAnYmluZGluZyc7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsaWRTdWJzdGl0dXRpb24gPSBtYW5pZmVzdFtpbmZvLnR5cGVdLmZpbmQoKHYpID0+IHZbZGVzdF0gPT09IHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsaWRTdWJzdGl0dXRpb24gJiYgaW5mby50eXBlID09PSAnc3VicGFzc0lucHV0cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpbnB1dCBhdHRhY2htZW50cyBuZWVkIGZhbGxiYWNrIGJpbmRpbmdzLCBza2lwIHRoaXMgY2hlY2tcclxuICAgICAgICAgICAgICAgICAgICB2YWxpZFN1YnN0aXR1dGlvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsaWRTdWJzdGl0dXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBhdXRvLWdlbmVyYXRlZCBiaW5kaW5nIGlzIGd1YXJhbnRlZWQgdG8gYmUgY29uc2VjdXRpdmVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnlbdmFsdWVdICYmIGNhdGVnb3J5W3ZhbHVlXSAhPT0gbmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihgRUZYMjYwMDogZHVwbGljYXRlZCBiaW5kaW5nL2xvY2F0aW9uIGRlY2xhcmF0aW9uIGZvciAnJHtjYXRlZ29yeVt2YWx1ZV19JyBhbmQgJyR7bmFtZX0nYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5WyhjYXRlZ29yeVt2YWx1ZV0gPSBuYW1lKV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5mby50eXBlID09PSAnYmxvY2tzJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGBFRlgyNjAxOiBpbGxlZ2FsIGN1c3RvbSBiaW5kaW5nIGZvciAnJHtuYW1lfScsIGJsb2NrIGJpbmRpbmdzIHNob3VsZCBiZSBjb25zZWN1dGl2ZSBhbmQgc3RhcnQgZnJvbSAwYCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGluZm8udHlwZSA9PT0gJ3NhbXBsZXJUZXh0dXJlcycpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihgRUZYMjYwMjogaWxsZWdhbCBjdXN0b20gYmluZGluZyBmb3IgJyR7bmFtZX0nLCB0ZXh0dXJlIGJpbmRpbmdzIHNob3VsZCBiZSBjb25zZWN1dGl2ZSBhbmQgYWZ0ZXIgYWxsIHRoZSBibG9ja3NgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5mby50eXBlID09PSAnYnVmZmVycycpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYEVGWDI2MDM6IGlsbGVnYWwgY3VzdG9tIGJpbmRpbmcgZm9yICcke25hbWV9JywgYnVmZmVyIGJpbmRpbmdzIHNob3VsZCBiZSBjb25zZWN1dGl2ZSBhbmQgYWZ0ZXIgYWxsIHRoZSBgICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Jsb2Nrcy9zYW1wbGVyVGV4dHVyZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGluZm8udHlwZSA9PT0gJ2ltYWdlcycpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYEVGWDI2MDQ6IGlsbGVnYWwgY3VzdG9tIGJpbmRpbmcgZm9yICcke25hbWV9JywgaW1hZ2UgYmluZGluZ3Mgc2hvdWxkIGJlIGNvbnNlY3V0aXZlIGFuZCBhZnRlciBhbGwgdGhlIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmxvY2tzL3NhbXBsZXJUZXh0dXJlcy9idWZmZXJzJyxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmZvLnR5cGUgPT09ICd0ZXh0dXJlcycpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYEVGWDI2MDU6IGlsbGVnYWwgY3VzdG9tIGJpbmRpbmcgZm9yICcke25hbWV9JywgdGV4dHVyZSBiaW5kaW5ncyBzaG91bGQgYmUgY29uc2VjdXRpdmUgYW5kIGFmdGVyIGFsbCB0aGUgYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdibG9ja3Mvc2FtcGxlclRleHR1cmVzL2J1ZmZlcnMvaW1hZ2VzJyxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmZvLnR5cGUgPT09ICdzYW1wbGVycycpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYEVGWDI2MDY6IGlsbGVnYWwgY3VzdG9tIGJpbmRpbmcgZm9yICcke25hbWV9Jywgc2FtcGxlciBiaW5kaW5ncyBzaG91bGQgYmUgY29uc2VjdXRpdmUgYW5kIGFmdGVyIGFsbCB0aGUgYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdibG9ja3Mvc2FtcGxlclRleHR1cmVzL2J1ZmZlcnMvaW1hZ2VzL3RleHR1cmVzJyxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBhdHRyaWJ1dGVzIG9yIHZhcnlpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoYEVGWDI2MDc6IGlsbGVnYWwgY3VzdG9tIGxvY2F0aW9uIGZvciAnJHtuYW1lfScsIGxvY2F0aW9ucyBzaG91bGQgYmUgY29uc2VjdXRpdmUgYW5kIHN0YXJ0IGZyb20gMGApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlY29yZFtwYXJhbUlkeF0gPSBsYXlvdXRJbmZvO1xyXG4gICAgICAgIGlkeCA9IGluZm8uZW5kO1xyXG4gICAgfSk7XHJcbiAgICAvLyBvdmVycmlkZSBiaW5kaW5ncy9sb2NhdGlvbnNcclxuICAgIHBhcmFtSW5mby5mb3JFYWNoKChpbmZvLCBwYXJhbUlkeCkgPT4ge1xyXG4gICAgICAgIGlmICghb3ZlcnJpZGVzW2luZm8udHlwZV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZWVkTG9jYXRpb24gPSBpbmZvLnR5cGUgPT09ICdhdHRyaWJ1dGVzJyB8fCBpbmZvLnR5cGUgPT09ICd2YXJ5aW5ncycgfHwgaW5mby50eXBlID09PSAnZnJhZ0NvbG9ycyc7XHJcbiAgICAgICAgY29uc3QgZGVzdCA9IG5lZWRMb2NhdGlvbiA/ICdsb2NhdGlvbicgOiAnYmluZGluZyc7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBvdmVycmlkZXNbaW5mby50eXBlXTtcclxuICAgICAgICBjb25zdCBuYW1lID0gaW5mby5wYXJhbS5uYW1lO1xyXG4gICAgICAgIGlmIChpbmZvLnR5cGUgPT09ICdhdHRyaWJ1dGVzJykge1xyXG4gICAgICAgICAgICAvLyBzb21lIHJhdGlvbmFsZSBiZWhpbmQgdGhlc2Ugb2RkaXRpZXM6XHJcbiAgICAgICAgICAgIC8vIDEuIHBhcmFtSW5mbyBtZW1iZXIgaXMgZ3VhcmFudGVlZCB0byBiZSBpbiBjb25zaXN0ZW50IG9yZGVyIHdpdGggbWFuaWZlc3QgbWVtYmVyc1xyXG4gICAgICAgICAgICAvLyAyLiB3ZSB3YW50IHRoZSBvdXRwdXQgbnVtYmVyIHRvIGJlIGFzIGNvbnNpc3RlbnQgYXMgcG9zc2libGUgd2l0aCB0aGVpciBkZWNsYXJhdGlvbiBvcmRlci5cclxuICAgICAgICAgICAgLy8gICAgZS5nLiBnZnguSW5wdXRTdGF0ZSB1dGlsaXplcyBkZWNsYXJhdGlvbiBvcmRlciB0byBjYWxjdWxhdGUgYnVmZmVyIG9mZnNldHMsIGV0Yy5cclxuICAgICAgICAgICAgaWYgKG5hbWUgaW4gY2F0ZWdvcnkpIHtcclxuICAgICAgICAgICAgICAgIHJlY29yZFtwYXJhbUlkeF0ucHJvcFtkZXN0XSA9IGNhdGVnb3J5W25hbWVdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IG4gPSAwO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNhdGVnb3J5W25dKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbisrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVjb3JkW3BhcmFtSWR4XS5wcm9wW2Rlc3RdID0gbjtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5W25dID0gbmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChuYW1lIGluIGNhdGVnb3J5KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRMb2NhdGlvbiA9IHJlY29yZFtwYXJhbUlkeF0ucHJvcFtkZXN0XTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnN0aXR1dGUgPSBtYW5pZmVzdFtpbmZvLnR5cGVdLmZpbmQoKHYpID0+IHZbZGVzdF0gPT09IGNhdGVnb3J5W25hbWVdKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdWJzdGl0dXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3Vic3RpdHV0ZVtkZXN0XSA9IG9sZExvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVjb3JkW3BhcmFtSWR4XS5wcm9wW2Rlc3RdID0gY2F0ZWdvcnlbbmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIGluc2VydCBkZWNsYXJhdGlvbnNcclxuICAgIGxldCByZXMgPSAnJztcclxuICAgIGlkeCA9IDA7XHJcbiAgICBjb25zdCBzZXRJbmRleCA9IG1hcHBpbmdzLlNldEluZGV4Lk1BVEVSSUFMO1xyXG4gICAgcGFyYW1JbmZvLmZvckVhY2goKGluZm8sIHBhcmFtSWR4KSA9PiB7XHJcbiAgICAgICAgaWYgKCFyZWNvcmRbcGFyYW1JZHhdKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmVlZExvY2F0aW9uID0gaW5mby50eXBlID09PSAnYXR0cmlidXRlcycgfHwgaW5mby50eXBlID09PSAndmFyeWluZ3MnIHx8IGluZm8udHlwZSA9PT0gJ2ZyYWdDb2xvcnMnO1xyXG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZWVkTG9jYXRpb24gPyAnbG9jYXRpb24nIDogJ2JpbmRpbmcnO1xyXG4gICAgICAgIGNvbnN0IHsgcG9zaXRpb24sIHByb3AgfSA9IHJlY29yZFtwYXJhbUlkeF07XHJcbiAgICAgICAgY29uc3Qgc2V0RGVjbGFyYXRpb24gPSBuZWVkTG9jYXRpb24gPyAnJyA6IGBzZXQgPSAke3NldEluZGV4fSwgYDtcclxuICAgICAgICAvLyBpbnNlcnQgZGVjbGFyYXRpb25cclxuICAgICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAvLyBubyBxdWFsaWZpZXIsIGp1c3QgaW5zZXJ0IGV2ZXJ5dGhpbmdcclxuICAgICAgICAgICAgcmVzICs9IGNvZGUuc2xpY2UoaWR4LCBpbmZvLmJlZyk7XHJcbiAgICAgICAgICAgIHJlcyArPSBgbGF5b3V0KCR7c2V0RGVjbGFyYXRpb24gKyBkZXN0fSA9ICR7cHJvcFtkZXN0XX0pIGA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIHF1YWxpZmllciBleGlzdHMsIGJ1dCBubyBiaW5kaW5nIHNwZWNpZmllZFxyXG4gICAgICAgICAgICByZXMgKz0gY29kZS5zbGljZShpZHgsIHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgcmVzICs9IGAsICR7c2V0RGVjbGFyYXRpb24gKyBkZXN0fSA9ICR7cHJvcFtkZXN0XX1gO1xyXG4gICAgICAgICAgICByZXMgKz0gY29kZS5zbGljZShwb3NpdGlvbiwgaW5mby5iZWcpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPCAtMSkge1xyXG4gICAgICAgICAgICAvLyBiaW5kaW5nIGV4aXN0cywgYnV0IG5vIHNldCBzcGVjaWZpZWRcclxuICAgICAgICAgICAgcmVzICs9IGNvZGUuc2xpY2UoaWR4LCAtcG9zaXRpb24pO1xyXG4gICAgICAgICAgICByZXMgKz0gc2V0RGVjbGFyYXRpb247XHJcbiAgICAgICAgICAgIHJlcyArPSBjb2RlLnNsaWNlKC1wb3NpdGlvbiwgaW5mby5iZWcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG5vLW9wLCBiaW5kaW5nIGlzIGFscmVhZHkgc3BlY2lmaWVkXHJcbiAgICAgICAgICAgIHJlcyArPSBjb2RlLnNsaWNlKGlkeCwgaW5mby5iZWcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXMgKz0gY29kZS5zbGljZShpbmZvLmJlZywgaW5mby5lbmQpO1xyXG4gICAgICAgIGlkeCA9IGluZm8uZW5kO1xyXG4gICAgfSk7XHJcbiAgICByZXMgKz0gY29kZS5zbGljZShpZHgpO1xyXG4gICAgLy8gcmVtb3ZlIHN1YnBhc3MgZmFsbGJhY2sgZGVjbGFyYXRpb25zXHJcbiAgICBtYW5pZmVzdC5zYW1wbGVyVGV4dHVyZXMgPSBtYW5pZmVzdC5zYW1wbGVyVGV4dHVyZXMuZmlsdGVyKCh0KSA9PiBtYW5pZmVzdC5zdWJwYXNzSW5wdXRzLmZpbmRJbmRleCgocykgPT4gcy5iaW5kaW5nID09PSB0LmJpbmRpbmcpIDwgMCk7XHJcbiAgICByZXR1cm4gcmVzO1xyXG59O1xyXG5cclxuY29uc3QgcmVtYXBEZWZpbmUgPSAob2JqLCBzdWJzdGl0dXRlTWFwKSA9PiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9iai5kZWZpbmVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgbGV0IHN1YlZhbCA9IHN1YnN0aXR1dGVNYXAuZ2V0KG9iai5kZWZpbmVzW2ldKTtcclxuICAgICAgICB3aGlsZSAoc3ViVmFsKSB7XHJcbiAgICAgICAgICAgIG9iai5kZWZpbmVzW2ldID0gc3ViVmFsO1xyXG4gICAgICAgICAgICBzdWJWYWwgPSBzdWJzdGl0dXRlTWFwLmdldChzdWJWYWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHNoYWRlckZhY3RvcnkgPSAoKCkgPT4ge1xyXG4gICAgY29uc3QgdHJhaWxpbmdTcGFjZXMgPSAvXFxzKyQvZ207XHJcbiAgICBjb25zdCBuZXdsaW5lcyA9IC8oXlxccypcXG4pezIsfS9nbTtcclxuICAgIGNvbnN0IGNsZWFuID0gKGNvZGUpID0+IHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gY29kZS5yZXBsYWNlKHByYWdtYXNUb1N0cmlwLCAnJyk7IC8vIHN0cmlwIG91ciBwcmFnbWFzXHJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UobmV3bGluZXMsICdcXG4nKTsgLy8gc3F1YXNoIG11bHRpcGxlIG5ld2xpbmVzXHJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UodHJhaWxpbmdTcGFjZXMsICcnKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIGNvbnN0IG9iamVjdE1hcCA9IChvYmosIGZuKSA9PiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZSgoYWNjLCBjdXIpID0+ICgoYWNjW2N1cl0gPSBmbihjdXIpKSwgYWNjKSwge30pO1xyXG4gICAgY29uc3QgZmlsdGVyRmFjdG9yeSA9ICh0YXJnZXQsIGJ1aWx0aW5zKSA9PiAodSkgPT4ge1xyXG4gICAgICAgIGlmICghYnVpbHRpblJFLnRlc3QodS5uYW1lKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGFncyA9IHUudGFncztcclxuICAgICAgICBsZXQgdHlwZTtcclxuICAgICAgICBpZiAoIXRhZ3MgfHwgIXRhZ3MuYnVpbHRpbikge1xyXG4gICAgICAgICAgICB0eXBlID0gJ2dsb2JhbCc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHlwZSA9IHRhZ3MuYnVpbHRpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnVpbHRpbnNbYCR7dHlwZX1zYF1bdGFyZ2V0XS5wdXNoKHsgbmFtZTogdS5uYW1lLCBkZWZpbmVzOiB1LmRlZmluZXMgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGNsYXNzaWZ5RGVzY3JpcHRvciA9IChkZXNjcmlwdG9ycywgc2hhZGVySW5mbywgbWVtYmVyKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSAwO1xyXG4gICAgICAgIGNvbnN0IGJhdGNoID0gMTtcclxuICAgICAgICAvLyBjb25zdCBwaGFzZSA9IDI7XHJcbiAgICAgICAgY29uc3QgcGFzcyA9IDM7XHJcbiAgICAgICAgY29uc3Qgc291cmNlcyA9IHNoYWRlckluZm9bbWVtYmVyXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSAhPT0gc291cmNlcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBjb25zdCBpbmZvID0gc291cmNlc1tpXTtcclxuICAgICAgICAgICAgaWYgKGluZm8ucmF0ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdG9yc1tpbmZvLnJhdGVdW21lbWJlcl0ucHVzaChpbmZvKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghYnVpbHRpblJFLnRlc3QoaW5mby5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRvcnNbYmF0Y2hdW21lbWJlcl0ucHVzaChpbmZvKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHRhZ3MgPSBpbmZvLnRhZ3M7XHJcbiAgICAgICAgICAgIGlmICghaW5mby50YWdzIHx8ICFpbmZvLnRhZ3MuYnVpbHRpbikge1xyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRvcnNbcGFzc11bbWVtYmVyXS5wdXNoKGluZm8pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhZ3MuYnVpbHRpbiA9PT0gJ2dsb2JhbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yc1twYXNzXVttZW1iZXJdLnB1c2goaW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRhZ3MuYnVpbHRpbiA9PT0gJ2xvY2FsJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0b3JzW2luc3RhbmNlXVttZW1iZXJdLnB1c2goaW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3QgY2xhc3NpZnlEZXNjcmlwdG9ycyA9IChkZXNjcmlwdG9ycywgc2hhZGVySW5mbykgPT4ge1xyXG4gICAgICAgIGNsYXNzaWZ5RGVzY3JpcHRvcihkZXNjcmlwdG9ycywgc2hhZGVySW5mbywgJ2Jsb2NrcycpO1xyXG4gICAgICAgIGNsYXNzaWZ5RGVzY3JpcHRvcihkZXNjcmlwdG9ycywgc2hhZGVySW5mbywgJ3NhbXBsZXJUZXh0dXJlcycpO1xyXG4gICAgICAgIGNsYXNzaWZ5RGVzY3JpcHRvcihkZXNjcmlwdG9ycywgc2hhZGVySW5mbywgJ3NhbXBsZXJzJyk7XHJcbiAgICAgICAgY2xhc3NpZnlEZXNjcmlwdG9yKGRlc2NyaXB0b3JzLCBzaGFkZXJJbmZvLCAndGV4dHVyZXMnKTtcclxuICAgICAgICBjbGFzc2lmeURlc2NyaXB0b3IoZGVzY3JpcHRvcnMsIHNoYWRlckluZm8sICdidWZmZXJzJyk7XHJcbiAgICAgICAgY2xhc3NpZnlEZXNjcmlwdG9yKGRlc2NyaXB0b3JzLCBzaGFkZXJJbmZvLCAnaW1hZ2VzJyk7XHJcbiAgICAgICAgY2xhc3NpZnlEZXNjcmlwdG9yKGRlc2NyaXB0b3JzLCBzaGFkZXJJbmZvLCAnc3VicGFzc0lucHV0cycpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHdyYXBFbnRyeSA9ICgoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgd3JhcHBlckZhY3RvcnkgPSAoc3RhZ2UsIGZuKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoc3RhZ2UpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3ZlcnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgXFxudm9pZCBtYWluKCkgeyBnbF9Qb3NpdGlvbiA9ICR7Zm59KCk7IH1cXG5gO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZnJhZyc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcXG5sYXlvdXQobG9jYXRpb24gPSAwKSBvdXQgdmVjNCBjY19GcmFnQ29sb3I7XFxudm9pZCBtYWluKCkgeyBjY19GcmFnQ29sb3IgPSAke2ZufSgpOyB9XFxuYDtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcXG52b2lkIG1haW4oKSB7ICR7Zm59KCk7IH1cXG5gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gKGNvbnRlbnQsIGVudHJ5LCBzdGFnZSkgPT4gKGVudHJ5ID09PSAnbWFpbicgPyBjb250ZW50IDogY29udGVudCArIHdyYXBwZXJGYWN0b3J5KHN0YWdlLCBlbnRyeSkpO1xyXG4gICAgfSkoKTtcclxuICAgIGNvbnN0IGVudHJ5UkUgPSAvKFteOl0rKSg/OjooXFx3KykpPy87XHJcbiAgICBjb25zdCBwcmVwcm9jZXNzID0gKG5hbWUsIGNodW5rcywgZGVwcmVjYXRpb25zLCBzdGFnZSwgZGVmYXVsdEVudHJ5ID0gJ21haW4nKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZW50cnlDYXAgPSBlbnRyeVJFLmV4ZWMobmFtZSk7XHJcbiAgICAgICAgY29uc3QgZW50cnkgPSBlbnRyeUNhcFsyXSB8fCBkZWZhdWx0RW50cnk7XHJcbiAgICAgICAgY29uc3QgcmVjb3JkID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGNvbnN0IGZ1bmN0aW9ucyA9IFtdO1xyXG4gICAgICAgIGxldCBjb2RlID0gdW53aW5kSW5jbHVkZXMoYCNpbmNsdWRlIDwke2VudHJ5Q2FwWzFdfT5gLCBjaHVua3MsIGRlcHJlY2F0aW9ucywgcmVjb3JkKTtcclxuICAgICAgICBjb2RlID0gd3JhcEVudHJ5KGNvZGUsIGVudHJ5LCBzdGFnZSk7XHJcbiAgICAgICAgY29kZSA9IGV4cGFuZFN1YnBhc3NJbm91dChjb2RlKTtcclxuICAgICAgICBjb2RlID0gZXhwYW5kTGl0ZXJhbE1hY3JvKGNvZGUpO1xyXG4gICAgICAgIGNvZGUgPSBleHBhbmRGdW5jdGlvbmFsTWFjcm8oY29kZSk7XHJcbiAgICAgICAgY29kZSA9IGVsaW1pbmF0ZURlYWRDb2RlKGNvZGUsIGVudHJ5LCBmdW5jdGlvbnMpOyAvLyB0aGlzIGhhcyB0byBiZSB0aGUgbGFzdCBwcm9jZXNzLCBvciB0aGUgYGZ1bmN0aW9uc2Agb3V0cHV0IHdvbid0IG1hdGNoXHJcbiAgICAgICAgcmV0dXJuIHsgY29kZSwgcmVjb3JkLCBmdW5jdGlvbnMgfTtcclxuICAgIH07XHJcbiAgICBjb25zdCByYXRlTWFwcGluZyA9IHtcclxuICAgICAgICBpbnN0YW5jZTogMCxcclxuICAgICAgICBiYXRjaDogMSxcclxuICAgICAgICBwaGFzZTogMixcclxuICAgICAgICBwYXNzOiAzLFxyXG4gICAgfTtcclxuICAgIGNvbnN0IGFzc2lnblJhdGUgPSAoZW50cnksIHJhdGVzKSA9PiB7XHJcbiAgICAgICAgZW50cnkuZm9yRWFjaCgoaSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByYXRlID0gcmF0ZXMuZmluZCgocikgPT4gci5uYW1lID09PSBpLm5hbWUpO1xyXG4gICAgICAgICAgICBpZiAocmF0ZSkge1xyXG4gICAgICAgICAgICAgICAgaS5yYXRlID0gcmF0ZU1hcHBpbmdbcmF0ZS5yYXRlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGFzc2lnblNhbXBsZVR5cGUgPSAoZW50cnksIHNhbXBsZVR5cGVzKSA9PiB7XHJcbiAgICAgICAgZW50cnkuZm9yRWFjaCgoaSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzYW1wbGVUeXBlSW5mbyA9IHNhbXBsZVR5cGVzLmZpbmQoKHMpID0+IHMubmFtZSA9PT0gaS5uYW1lKTtcclxuICAgICAgICAgICAgaWYgKHNhbXBsZVR5cGVJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBpLnNhbXBsZVR5cGUgPSBzYW1wbGVUeXBlSW5mby5zYW1wbGVUeXBlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaS5zYW1wbGVUeXBlID0gMDsgLy8gU2FtcGxlVHlwZS5GTE9BVDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHRva2VuaXplck9wdCA9IHsgdmVyc2lvbjogJzMwMCBlcycgfTtcclxuICAgIGNvbnN0IGNyZWF0ZVNoYWRlckluZm8gPSAoKSA9PiAoe1xyXG4gICAgICAgIGJsb2NrczogW10sXHJcbiAgICAgICAgc2FtcGxlclRleHR1cmVzOiBbXSxcclxuICAgICAgICBzYW1wbGVyczogW10sXHJcbiAgICAgICAgdGV4dHVyZXM6IFtdLFxyXG4gICAgICAgIGJ1ZmZlcnM6IFtdLFxyXG4gICAgICAgIGltYWdlczogW10sXHJcbiAgICAgICAgc3VicGFzc0lucHV0czogW10sXHJcbiAgICAgICAgYXR0cmlidXRlczogW10sXHJcbiAgICAgICAgdmFyeWluZ3M6IFtdLFxyXG4gICAgICAgIGZyYWdDb2xvcnM6IFtdLFxyXG4gICAgICAgIGRlc2NyaXB0b3JzOiBbXSxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgY29tcGlsZSA9IChcclxuICAgICAgICBuYW1lLFxyXG4gICAgICAgIHN0YWdlLFxyXG4gICAgICAgIG91dERlZmluZXMgPSBbXSxcclxuICAgICAgICBzaGFkZXJJbmZvID0gY3JlYXRlU2hhZGVySW5mbygpLFxyXG4gICAgICAgIGNodW5rcyA9IGdsb2JhbENodW5rcyxcclxuICAgICAgICBkZXByZWNhdGlvbnMgPSBnbG9iYWxEZXByZWNhdGlvbnMsXHJcbiAgICApID0+IHtcclxuICAgICAgICBjb25zdCBvdXQgPSB7fTtcclxuICAgICAgICBzaGFkZXJOYW1lID0gbmFtZTtcclxuICAgICAgICBjb25zdCBjYWNoZSA9IHsgbGluZXM6IFtdLCBleHRlbnNpb25zOiB7fSB9O1xyXG4gICAgICAgIGNvbnN0IHsgY29kZSwgcmVjb3JkLCBmdW5jdGlvbnMgfSA9IHByZXByb2Nlc3MobmFtZSwgY2h1bmtzLCBkZXByZWNhdGlvbnMsIHN0YWdlKTtcclxuICAgICAgICBjb25zdCB0b2tlbnMgPSAoc2hhZGVyVG9rZW5zID0gdG9rZW5pemVyKGNvZGUsIHRva2VuaXplck9wdCkpO1xyXG4gICAgICAgIC8vIFswXTogZXhpc3RpbmdEZWZpbmVzOyBbMV06IHN1YnN0aXR1dGVNYXBcclxuICAgICAgICBjb25zdCByZXMgPSBleHRyYWN0TWFjcm9EZWZpbml0aW9ucyhjb2RlKTtcclxuICAgICAgICBjYWNoZS5leGlzdGluZ0RlZmluZXMgPSByZXNbMF07XHJcbiAgICAgICAgY29uc3Qgc3Vic3RpdHV0ZU1hcCA9IHJlc1sxXTtcclxuICAgICAgICBleHRyYWN0RGVmaW5lcyh0b2tlbnMsIG91dERlZmluZXMsIGNhY2hlKTtcclxuICAgICAgICBjb25zdCByYXRlcyA9IGV4dHJhY3RVcGRhdGVSYXRlcyh0b2tlbnMpO1xyXG4gICAgICAgIGNvbnN0IHNhbXBsZVR5cGVzID0gZXh0cmFjdFVuZmlsdGVyYWJsZUZsb2F0KHRva2Vucyk7XHJcbiAgICAgICAgY29uc3QgYmxvY2tJbmZvID0gZXh0cmFjdFBhcmFtcyh0b2tlbnMsIGNhY2hlLCBzaGFkZXJJbmZvLCBzdGFnZSwgZnVuY3Rpb25zKTtcclxuXHJcbiAgICAgICAgc2hhZGVySW5mby5zYW1wbGVyVGV4dHVyZXMgPSBzaGFkZXJJbmZvLnNhbXBsZXJUZXh0dXJlcy5maWx0ZXIoXHJcbiAgICAgICAgICAgIChlbGUpID0+ICFzaGFkZXJJbmZvLnN1YnBhc3NJbnB1dHMuZmluZCgob2JqKSA9PiBvYmoubmFtZSA9PT0gZWxlLm5hbWUpLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIG91dC5ibG9ja0luZm8gPSBibG9ja0luZm87IC8vIHBhc3MgZm9yd2FyZFxyXG4gICAgICAgIG91dC5yZWNvcmQgPSByZWNvcmQ7IC8vIGhlYWRlciBkZXBlbmRlbmNpZXNcclxuICAgICAgICBvdXQuZXh0ZW5zaW9ucyA9IGNhY2hlLmV4dGVuc2lvbnM7IC8vIGV4dGVuc2lvbnMgcmVxdWVzdHNcclxuICAgICAgICBvdXQuZ2xzbDQgPSBjb2RlO1xyXG5cclxuICAgICAgICBzaGFkZXJJbmZvLmF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICAgICAgICByZW1hcERlZmluZShhdHRyLCBzdWJzdGl0dXRlTWFwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzaGFkZXJJbmZvLmJsb2Nrcy5mb3JFYWNoKChibG9jaykgPT4ge1xyXG4gICAgICAgICAgICByZW1hcERlZmluZShibG9jaywgc3Vic3RpdHV0ZU1hcCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2hhZGVySW5mby5idWZmZXJzLmZvckVhY2goKGJ1ZmZlcikgPT4ge1xyXG4gICAgICAgICAgICByZW1hcERlZmluZShidWZmZXIsIHN1YnN0aXR1dGVNYXApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNoYWRlckluZm8uaW1hZ2VzLmZvckVhY2goKGltYWdlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlbWFwRGVmaW5lKGltYWdlLCBzdWJzdGl0dXRlTWFwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzaGFkZXJJbmZvLnNhbXBsZXJUZXh0dXJlcy5mb3JFYWNoKChzYW1wbGVyVGV4dHVyZSkgPT4ge1xyXG4gICAgICAgICAgICByZW1hcERlZmluZShzYW1wbGVyVGV4dHVyZSwgc3Vic3RpdHV0ZU1hcCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2hhZGVySW5mby5zYW1wbGVycy5mb3JFYWNoKChzYW1wbGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJlbWFwRGVmaW5lKHNhbXBsZXIsIHN1YnN0aXR1dGVNYXApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNoYWRlckluZm8udGV4dHVyZXMuZm9yRWFjaCgodGV4dHVyZSkgPT4ge1xyXG4gICAgICAgICAgICByZW1hcERlZmluZSh0ZXh0dXJlLCBzdWJzdGl0dXRlTWFwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBhc3NpZ25SYXRlKHNoYWRlckluZm8uYmxvY2tzLCByYXRlcyk7XHJcbiAgICAgICAgYXNzaWduUmF0ZShzaGFkZXJJbmZvLmJ1ZmZlcnMsIHJhdGVzKTtcclxuICAgICAgICBhc3NpZ25SYXRlKHNoYWRlckluZm8uaW1hZ2VzLCByYXRlcyk7XHJcbiAgICAgICAgYXNzaWduUmF0ZShzaGFkZXJJbmZvLnNhbXBsZXJUZXh0dXJlcywgcmF0ZXMpO1xyXG4gICAgICAgIGFzc2lnblJhdGUoc2hhZGVySW5mby5zYW1wbGVycywgcmF0ZXMpO1xyXG4gICAgICAgIGFzc2lnblJhdGUoc2hhZGVySW5mby50ZXh0dXJlcywgcmF0ZXMpO1xyXG4gICAgICAgIGFzc2lnblJhdGUoc2hhZGVySW5mby5zdWJwYXNzSW5wdXRzLCByYXRlcyk7XHJcblxyXG4gICAgICAgIGFzc2lnblNhbXBsZVR5cGUoc2hhZGVySW5mby5zYW1wbGVyVGV4dHVyZXMsIHNhbXBsZVR5cGVzKTtcclxuICAgICAgICBhc3NpZ25TYW1wbGVUeXBlKHNoYWRlckluZm8udGV4dHVyZXMsIHNhbXBsZVR5cGVzKTtcclxuXHJcbiAgICAgICAgY29uc3QgaXNWZXJ0ID0gc3RhZ2UgPT0gJ3ZlcnQnO1xyXG4gICAgICAgIG91dC5nbHNsMyA9IHN0cmlwVG9TcGVjaWZpY1ZlcnNpb24oZGVjb3JhdGVCbG9ja01lbW9yeUxheW91dHMoY29kZSwgYmxvY2tJbmZvKSwgMzAwLCBjYWNoZS5leHRlbnNpb25zLCBpc1ZlcnQpOyAvLyBHTEVTMyBuZWVkcyBleHBsaWNpdCBtZW1vcnkgbGF5b3V0IHF1YWxpZmllclxyXG4gICAgICAgIGlmIChzdGFnZSA9PSAndmVydCcgfHwgc3RhZ2UgPT0gJ2ZyYWcnKSB7XHJcbiAgICAgICAgICAgIC8vIGdsc2wxIG9ubHkgc3VwcG9ydHMgdmVydCBhbmQgZnJhZ1xyXG4gICAgICAgICAgICBvdXQuZ2xzbDEgPSBzdHJpcFRvU3BlY2lmaWNWZXJzaW9uKFxyXG4gICAgICAgICAgICAgICAgZ2xzbDMwMHRvMTAwKGNvZGUsIHNoYWRlckluZm8uYmxvY2tzLCBvdXREZWZpbmVzLCBibG9ja0luZm8sIGZ1bmN0aW9ucywgY2FjaGUsIGlzVmVydCksXHJcbiAgICAgICAgICAgICAgICAxMDAsXHJcbiAgICAgICAgICAgICAgICBjYWNoZS5leHRlbnNpb25zLFxyXG4gICAgICAgICAgICAgICAgaXNWZXJ0LFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBtaXNjQ2hlY2tzKG91dC5nbHNsMSk7IC8vIFRPRE8gOiBhZGQgaGlnaGVyIHZlcnNpb24gY2hlY2tzXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3V0Lmdsc2wxID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdXQ7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgY3JlYXRlQnVpbHRpbkluZm8gPSAoKSA9PiAoeyBibG9ja3M6IFtdLCBzYW1wbGVyVGV4dHVyZXM6IFtdLCBidWZmZXJzOiBbXSwgaW1hZ2VzOiBbXSB9KTtcclxuICAgIGNvbnN0IGJ1aWxkID0gKHN0YWdlTmFtZXMsIHR5cGUsIGNodW5rcyA9IGdsb2JhbENodW5rcywgZGVwcmVjYXRpb25zID0gZ2xvYmFsRGVwcmVjYXRpb25zKSA9PiB7XHJcbiAgICAgICAgbGV0IGRlZmluZXMgPSBbXTtcclxuICAgICAgICBjb25zdCBzaGFkZXJJbmZvID0gY3JlYXRlU2hhZGVySW5mbygpO1xyXG4gICAgICAgIGNvbnN0IHNyYyA9IHsgdmVydDogJycsIGZyYWc6ICcnIH07XHJcbiAgICAgICAgZm9yIChjb25zdCBzdGFnZSBpbiBzdGFnZU5hbWVzKSB7XHJcbiAgICAgICAgICAgIHNyY1tzdGFnZV0gPSBjb21waWxlKHN0YWdlTmFtZXNbc3RhZ2VdLCBzdGFnZSwgZGVmaW5lcywgc2hhZGVySW5mbywgY2h1bmtzLCBkZXByZWNhdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PT0gJ2dyYXBoaWNzJykge1xyXG4gICAgICAgICAgICBmaW5hbFR5cGVDaGVjayhzcmMudmVydC5nbHNsMSwgc3JjLmZyYWcuZ2xzbDEsIGRlZmluZXMsIHN0YWdlTmFtZXNbJ3ZlcnQnXSwgc3RhZ2VOYW1lc1snZnJhZyddKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1aWx0aW5zID0geyBnbG9iYWxzOiBjcmVhdGVCdWlsdGluSW5mbygpLCBsb2NhbHM6IGNyZWF0ZUJ1aWx0aW5JbmZvKCksIHN0YXRpc3RpY3M6IHt9IH07XHJcbiAgICAgICAgLy8gc3RyaXAgcnVudGltZSBjb25zdGFudHMgJiBnZW5lcmF0ZSBzdGF0aXN0aWNzXHJcbiAgICAgICAgZGVmaW5lcyA9IGRlZmluZXMuZmlsdGVyKChkKSA9PiBkLnR5cGUgIT09ICdjb25zdGFudCcpO1xyXG4gICAgICAgIGxldCB2c1VuaWZvcm1WZWN0b3JzID0gMCxcclxuICAgICAgICAgICAgZnNVbmlmb3JtVmVjdG9ycyA9IDAsXHJcbiAgICAgICAgICAgIGNzVW5pZm9ybVZlY3RvcnMgPSAwO1xyXG4gICAgICAgIHNoYWRlckluZm8uYmxvY2tzLmZvckVhY2goKGIpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdmVjdG9ycyA9IGIubWVtYmVycy5yZWR1Y2UoKGFjYywgY3VyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGN1ci5jb3VudCAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYyArIE1hdGguY2VpbChtYXBwaW5ncy5HZXRUeXBlU2l6ZShjdXIudHlwZSkgLyAxNikgKiBjdXIuY291bnQ7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgICAgICBpZiAoYi5zdGFnZUZsYWdzICYgVlNCaXQpIHtcclxuICAgICAgICAgICAgICAgIHZzVW5pZm9ybVZlY3RvcnMgKz0gdmVjdG9ycztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYi5zdGFnZUZsYWdzICYgRlNCaXQpIHtcclxuICAgICAgICAgICAgICAgIGZzVW5pZm9ybVZlY3RvcnMgKz0gdmVjdG9ycztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYi5zdGFnZUZsYWdzICYgQ1NCaXQpIHtcclxuICAgICAgICAgICAgICAgIGNzVW5pZm9ybVZlY3RvcnMgKz0gdmVjdG9ycztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDApO1xyXG4gICAgICAgIGlmICh0eXBlID09PSAnZ3JhcGhpY3MnKSB7XHJcbiAgICAgICAgICAgIGJ1aWx0aW5zLnN0YXRpc3RpY3MuQ0NfRUZGRUNUX1VTRURfVkVSVEVYX1VOSUZPUk1fVkVDVE9SUyA9IHZzVW5pZm9ybVZlY3RvcnM7XHJcbiAgICAgICAgICAgIGJ1aWx0aW5zLnN0YXRpc3RpY3MuQ0NfRUZGRUNUX1VTRURfRlJBR01FTlRfVU5JRk9STV9WRUNUT1JTID0gZnNVbmlmb3JtVmVjdG9ycztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09ICdjb21wdXRlJykge1xyXG4gICAgICAgICAgICBidWlsdGlucy5zdGF0aXN0aWNzLkNDX0VGRkVDVF9VU0VEX0NPTVBVVEVfVU5JRk9STV9WRUNUT1JTID0gY3NVbmlmb3JtVmVjdG9ycztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmlsdGVyIG91dCBwaXBlbGluZSBidWlsdGluIHBhcmFtc1xyXG4gICAgICAgIHNoYWRlckluZm8uZGVzY3JpcHRvcnNbMF0gPSB7XHJcbiAgICAgICAgICAgIHJhdGU6IDAsXHJcbiAgICAgICAgICAgIGJsb2NrczogW10sXHJcbiAgICAgICAgICAgIHNhbXBsZXJUZXh0dXJlczogW10sXHJcbiAgICAgICAgICAgIHNhbXBsZXJzOiBbXSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IFtdLFxyXG4gICAgICAgICAgICBidWZmZXJzOiBbXSxcclxuICAgICAgICAgICAgaW1hZ2VzOiBbXSxcclxuICAgICAgICAgICAgc3VicGFzc0lucHV0czogW10sXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzaGFkZXJJbmZvLmRlc2NyaXB0b3JzWzFdID0ge1xyXG4gICAgICAgICAgICByYXRlOiAxLFxyXG4gICAgICAgICAgICBibG9ja3M6IFtdLFxyXG4gICAgICAgICAgICBzYW1wbGVyVGV4dHVyZXM6IFtdLFxyXG4gICAgICAgICAgICBzYW1wbGVyczogW10sXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBbXSxcclxuICAgICAgICAgICAgYnVmZmVyczogW10sXHJcbiAgICAgICAgICAgIGltYWdlczogW10sXHJcbiAgICAgICAgICAgIHN1YnBhc3NJbnB1dHM6IFtdLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2hhZGVySW5mby5kZXNjcmlwdG9yc1syXSA9IHtcclxuICAgICAgICAgICAgcmF0ZTogMixcclxuICAgICAgICAgICAgYmxvY2tzOiBbXSxcclxuICAgICAgICAgICAgc2FtcGxlclRleHR1cmVzOiBbXSxcclxuICAgICAgICAgICAgc2FtcGxlcnM6IFtdLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogW10sXHJcbiAgICAgICAgICAgIGJ1ZmZlcnM6IFtdLFxyXG4gICAgICAgICAgICBpbWFnZXM6IFtdLFxyXG4gICAgICAgICAgICBzdWJwYXNzSW5wdXRzOiBbXSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNoYWRlckluZm8uZGVzY3JpcHRvcnNbM10gPSB7XHJcbiAgICAgICAgICAgIHJhdGU6IDMsXHJcbiAgICAgICAgICAgIGJsb2NrczogW10sXHJcbiAgICAgICAgICAgIHNhbXBsZXJUZXh0dXJlczogW10sXHJcbiAgICAgICAgICAgIHNhbXBsZXJzOiBbXSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IFtdLFxyXG4gICAgICAgICAgICBidWZmZXJzOiBbXSxcclxuICAgICAgICAgICAgaW1hZ2VzOiBbXSxcclxuICAgICAgICAgICAgc3VicGFzc0lucHV0czogW10sXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjbGFzc2lmeURlc2NyaXB0b3JzKHNoYWRlckluZm8uZGVzY3JpcHRvcnMsIHNoYWRlckluZm8pO1xyXG5cclxuICAgICAgICAvLyBjb252ZXJ0IGNvdW50IGZyb20gc3RyaW5nIHRvIDAsIGF2b2lkaW5nIGpzYiBjcmFzaFxyXG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrICE9PSA0OyArK2spIHtcclxuICAgICAgICAgICAgY29uc3Qgc2V0ID0gc2hhZGVySW5mby5kZXNjcmlwdG9yc1trXTtcclxuICAgICAgICAgICAgc2V0LmJsb2Nrcy5mb3JFYWNoKChiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG0gb2YgYi5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtLmNvdW50ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZmlsdGVyIGRlc2NyaXB0b3JzXHJcbiAgICAgICAgc2hhZGVySW5mby5ibG9ja3MgPSBzaGFkZXJJbmZvLmJsb2Nrcy5maWx0ZXIoZmlsdGVyRmFjdG9yeSgnYmxvY2tzJywgYnVpbHRpbnMpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnNhbXBsZXJUZXh0dXJlcyA9IHNoYWRlckluZm8uc2FtcGxlclRleHR1cmVzLmZpbHRlcihmaWx0ZXJGYWN0b3J5KCdzYW1wbGVyVGV4dHVyZXMnLCBidWlsdGlucykpO1xyXG4gICAgICAgIHNoYWRlckluZm8uYnVmZmVycyA9IHNoYWRlckluZm8uYnVmZmVycy5maWx0ZXIoZmlsdGVyRmFjdG9yeSgnYnVmZmVycycsIGJ1aWx0aW5zKSk7XHJcbiAgICAgICAgc2hhZGVySW5mby5pbWFnZXMgPSBzaGFkZXJJbmZvLmltYWdlcy5maWx0ZXIoZmlsdGVyRmFjdG9yeSgnaW1hZ2VzJywgYnVpbHRpbnMpKTtcclxuICAgICAgICAvLyBhdHRyaWJ1dGUgcHJvcGVydHkgcHJvY2Vzc1xyXG4gICAgICAgIHNoYWRlckluZm8uYXR0cmlidXRlcy5mb3JFYWNoKChhKSA9PiB7XHJcbiAgICAgICAgICAgIGEuZm9ybWF0ID0gbWFwcGluZ3MuZm9ybWF0TWFwW2EudHlwZW5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoYS5kZWZpbmVzLmluZGV4T2YoJ1VTRV9JTlNUQU5DSU5HJykgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgYS5pc0luc3RhbmNlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGEudGFncyAmJiBhLnRhZ3MuZm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjdXN0b20gZm9ybWF0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gbWFwcGluZ3MuZ2V0Rm9ybWF0KGEudGFncy5mb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGYgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGEuZm9ybWF0ID0gZjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChtYXBwaW5ncy5pc05vcm1hbGl6ZWQoZikpIHtcclxuICAgICAgICAgICAgICAgICAgICBhLmlzTm9ybWFsaXplZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gc3RyaXAgdGhlIGludGVybWVkaWF0ZSBpbmZvcm1hdGlvbnNcclxuICAgICAgICBzaGFkZXJJbmZvLmF0dHJpYnV0ZXMuZm9yRWFjaChcclxuICAgICAgICAgICAgKHYpID0+IChcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB2LnRhZ3MsIGRlbGV0ZSB2LnR5cGVuYW1lLCBkZWxldGUgdi5wcmVjaXNpb24sIGRlbGV0ZSB2LmlzQXJyYXksIGRlbGV0ZSB2LnR5cGUsIGRlbGV0ZSB2LmNvdW50LCBkZWxldGUgdi5zdGFnZUZsYWdzXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnZhcnlpbmdzLmZvckVhY2goKHYpID0+IChkZWxldGUgdi50YWdzLCBkZWxldGUgdi50eXBlbmFtZSwgZGVsZXRlIHYucHJlY2lzaW9uLCBkZWxldGUgdi5pc0FycmF5KSk7XHJcbiAgICAgICAgc2hhZGVySW5mby5ibG9ja3MuZm9yRWFjaChcclxuICAgICAgICAgICAgKGIpID0+IChkZWxldGUgYi5yYXRlLCBkZWxldGUgYi50YWdzLCBiLm1lbWJlcnMuZm9yRWFjaCgodikgPT4gKGRlbGV0ZSB2LnR5cGVuYW1lLCBkZWxldGUgdi5wcmVjaXNpb24sIGRlbGV0ZSB2LmlzQXJyYXkpKSksXHJcbiAgICAgICAgKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnNhbXBsZXJUZXh0dXJlcy5mb3JFYWNoKCh2KSA9PiAoZGVsZXRlIHYucmF0ZSwgZGVsZXRlIHYudGFncywgZGVsZXRlIHYudHlwZW5hbWUsIGRlbGV0ZSB2LnByZWNpc2lvbiwgZGVsZXRlIHYuaXNBcnJheSkpO1xyXG4gICAgICAgIHNoYWRlckluZm8uYnVmZmVycy5mb3JFYWNoKFxyXG4gICAgICAgICAgICAodikgPT4gKGRlbGV0ZSB2LnJhdGUsIGRlbGV0ZSB2LnRhZ3MsIGRlbGV0ZSB2LnR5cGVuYW1lLCBkZWxldGUgdi5wcmVjaXNpb24sIGRlbGV0ZSB2LmlzQXJyYXksIGRlbGV0ZSB2Lm1lbWJlcnMpLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgc2hhZGVySW5mby5pbWFnZXMuZm9yRWFjaCgodikgPT4gKGRlbGV0ZSB2LnJhdGUsIGRlbGV0ZSB2LnRhZ3MsIGRlbGV0ZSB2LnR5cGVuYW1lLCBkZWxldGUgdi5wcmVjaXNpb24sIGRlbGV0ZSB2LmlzQXJyYXkpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnRleHR1cmVzLmZvckVhY2goKHYpID0+IChkZWxldGUgdi5yYXRlLCBkZWxldGUgdi50YWdzLCBkZWxldGUgdi50eXBlbmFtZSwgZGVsZXRlIHYucHJlY2lzaW9uLCBkZWxldGUgdi5pc0FycmF5KSk7XHJcbiAgICAgICAgc2hhZGVySW5mby5zYW1wbGVycy5mb3JFYWNoKCh2KSA9PiAoZGVsZXRlIHYucmF0ZSwgZGVsZXRlIHYudGFncywgZGVsZXRlIHYudHlwZW5hbWUsIGRlbGV0ZSB2LnByZWNpc2lvbiwgZGVsZXRlIHYuaXNBcnJheSkpO1xyXG4gICAgICAgIHNoYWRlckluZm8uc3VicGFzc0lucHV0cy5mb3JFYWNoKCh2KSA9PiAoZGVsZXRlIHYucmF0ZSwgZGVsZXRlIHYudGFncywgZGVsZXRlIHYudHlwZW5hbWUsIGRlbGV0ZSB2LnByZWNpc2lvbiwgZGVsZXRlIHYuaXNBcnJheSkpO1xyXG4gICAgICAgIC8vIGFzc2lnbiBiaW5kaW5nc1xyXG4gICAgICAgIGxldCBiaW5kaW5nSWR4ID0gMDtcclxuICAgICAgICBzaGFkZXJJbmZvLmJsb2Nrcy5mb3JFYWNoKCh1KSA9PiAodS5iaW5kaW5nID0gYmluZGluZ0lkeCsrKSk7XHJcbiAgICAgICAgc2hhZGVySW5mby5zYW1wbGVyVGV4dHVyZXMuZm9yRWFjaCgodSkgPT4gKHUuYmluZGluZyA9IGJpbmRpbmdJZHgrKykpO1xyXG4gICAgICAgIHNoYWRlckluZm8uc2FtcGxlcnMuZm9yRWFjaCgodSkgPT4gKHUuYmluZGluZyA9IGJpbmRpbmdJZHgrKykpO1xyXG4gICAgICAgIHNoYWRlckluZm8udGV4dHVyZXMuZm9yRWFjaCgodSkgPT4gKHUuYmluZGluZyA9IGJpbmRpbmdJZHgrKykpO1xyXG4gICAgICAgIHNoYWRlckluZm8uYnVmZmVycy5mb3JFYWNoKCh1KSA9PiAodS5iaW5kaW5nID0gYmluZGluZ0lkeCsrKSk7XHJcbiAgICAgICAgc2hhZGVySW5mby5pbWFnZXMuZm9yRWFjaCgodSkgPT4gKHUuYmluZGluZyA9IGJpbmRpbmdJZHgrKykpO1xyXG4gICAgICAgIHNoYWRlckluZm8uc3VicGFzc0lucHV0cy5mb3JFYWNoKCh1KSA9PiAodS5iaW5kaW5nID0gYmluZGluZ0lkeCsrKSk7XHJcbiAgICAgICAgbGV0IGxvY2F0aW9uSWR4ID0gMDtcclxuICAgICAgICBzaGFkZXJJbmZvLmF0dHJpYnV0ZXMuZm9yRWFjaCgoYSkgPT4gKGEubG9jYXRpb24gPSBsb2NhdGlvbklkeCsrKSk7XHJcbiAgICAgICAgbG9jYXRpb25JZHggPSAwO1xyXG4gICAgICAgIHNoYWRlckluZm8udmFyeWluZ3MuZm9yRWFjaCgodSkgPT4gKHUubG9jYXRpb24gPSBsb2NhdGlvbklkeCsrKSk7XHJcbiAgICAgICAgbG9jYXRpb25JZHggPSAwO1xyXG4gICAgICAgIHNoYWRlckluZm8uZnJhZ0NvbG9ycy5mb3JFYWNoKCh1KSA9PiAodS5sb2NhdGlvbiA9IGxvY2F0aW9uSWR4KyspKTtcclxuXHJcbiAgICAgICAgLy8gZmlsdGVyIGRlZmluZXMgZm9yIGpzb25cclxuICAgICAgICBzaGFkZXJJbmZvLmJsb2Nrcy5mb3JFYWNoKCh1KSA9PiAodS5kZWZpbmVzID0gdS5kZWZpbmVzLmZpbHRlcigoZCkgPT4gZGVmaW5lcy5maW5kKChkZWYpID0+IGQuZW5kc1dpdGgoZGVmLm5hbWUpKSkpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnNhbXBsZXJUZXh0dXJlcy5mb3JFYWNoKCh1KSA9PiAodS5kZWZpbmVzID0gdS5kZWZpbmVzLmZpbHRlcigoZCkgPT4gZGVmaW5lcy5maW5kKChkZWYpID0+IGQuZW5kc1dpdGgoZGVmLm5hbWUpKSkpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnNhbXBsZXJzLmZvckVhY2goKHUpID0+ICh1LmRlZmluZXMgPSB1LmRlZmluZXMuZmlsdGVyKChkKSA9PiBkZWZpbmVzLmZpbmQoKGRlZikgPT4gZC5lbmRzV2l0aChkZWYubmFtZSkpKSkpO1xyXG4gICAgICAgIHNoYWRlckluZm8udGV4dHVyZXMuZm9yRWFjaCgodSkgPT4gKHUuZGVmaW5lcyA9IHUuZGVmaW5lcy5maWx0ZXIoKGQpID0+IGRlZmluZXMuZmluZCgoZGVmKSA9PiBkLmVuZHNXaXRoKGRlZi5uYW1lKSkpKSk7XHJcbiAgICAgICAgc2hhZGVySW5mby5idWZmZXJzLmZvckVhY2goKHUpID0+ICh1LmRlZmluZXMgPSB1LmRlZmluZXMuZmlsdGVyKChkKSA9PiBkZWZpbmVzLmZpbmQoKGRlZikgPT4gZC5lbmRzV2l0aChkZWYubmFtZSkpKSkpO1xyXG4gICAgICAgIHNoYWRlckluZm8uaW1hZ2VzLmZvckVhY2goKHUpID0+ICh1LmRlZmluZXMgPSB1LmRlZmluZXMuZmlsdGVyKChkKSA9PiBkZWZpbmVzLmZpbmQoKGRlZikgPT4gZC5lbmRzV2l0aChkZWYubmFtZSkpKSkpO1xyXG4gICAgICAgIHNoYWRlckluZm8uc3VicGFzc0lucHV0cy5mb3JFYWNoKCh1KSA9PiAodS5kZWZpbmVzID0gdS5kZWZpbmVzLmZpbHRlcigoZCkgPT4gZGVmaW5lcy5maW5kKChkZWYpID0+IGQuZW5kc1dpdGgoZGVmLm5hbWUpKSkpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLmF0dHJpYnV0ZXMuZm9yRWFjaCgodSkgPT4gKHUuZGVmaW5lcyA9IHUuZGVmaW5lcy5maWx0ZXIoKGQpID0+IGRlZmluZXMuZmluZCgoZGVmKSA9PiBkLmVuZHNXaXRoKGRlZi5uYW1lKSkpKSk7XHJcbiAgICAgICAgc2hhZGVySW5mby52YXJ5aW5ncy5mb3JFYWNoKCh1KSA9PiAodS5kZWZpbmVzID0gdS5kZWZpbmVzLmZpbHRlcigoZCkgPT4gZGVmaW5lcy5maW5kKChkZWYpID0+IGQuZW5kc1dpdGgoZGVmLm5hbWUpKSkpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLmZyYWdDb2xvcnMuZm9yRWFjaCgodSkgPT4gKHUuZGVmaW5lcyA9IHUuZGVmaW5lcy5maWx0ZXIoKGQpID0+IGRlZmluZXMuZmluZCgoZGVmKSA9PiBkLmVuZHNXaXRoKGRlZi5uYW1lKSkpKSk7XHJcblxyXG4gICAgICAgIC8vIGdlbmVyYXRlIGJpbmRpbmcgbGF5b3V0IGZvciBnbHNsNFxyXG4gICAgICAgIGNvbnN0IGdsc2wxID0ge30sXHJcbiAgICAgICAgICAgIGdsc2wzID0ge30sXHJcbiAgICAgICAgICAgIGdsc2w0ID0ge307XHJcbiAgICAgICAgY29uc3QgcmVjb3JkID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGZvciAoY29uc3Qgc3RhZ2UgaW4gc3RhZ2VOYW1lcykge1xyXG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBiaW5kaW5nIGxheW91dCBmb3IgZ2xzbDRcclxuICAgICAgICAgICAgY29uc3QgaXNWZXJ0ID0gc3RhZ2UgPT09ICd2ZXJ0JztcclxuICAgICAgICAgICAgc3JjW3N0YWdlXS5nbHNsNCA9IHN0cmlwVG9TcGVjaWZpY1ZlcnNpb24oXHJcbiAgICAgICAgICAgICAgICBkZWNvcmF0ZUJpbmRpbmdzKHNyY1tzdGFnZV0uZ2xzbDQsIHNoYWRlckluZm8sIHNyY1tzdGFnZV0uYmxvY2tJbmZvKSxcclxuICAgICAgICAgICAgICAgIDQ2MCxcclxuICAgICAgICAgICAgICAgIHNyY1tzdGFnZV0uZXh0ZW5zaW9ucyxcclxuICAgICAgICAgICAgICAgIGlzVmVydCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgZ2xzbDRbc3RhZ2VdID0gY2xlYW4oc3JjW3N0YWdlXS5nbHNsNCk7IC8vIGZvciBTUElSLVYtYmFzZWQgY3Jvc3MtY29tcGlsYXRpb25cclxuICAgICAgICAgICAgZ2xzbDNbc3RhZ2VdID0gY2xlYW4oc3JjW3N0YWdlXS5nbHNsMyk7IC8vIGZvciBXZWJHTDIvR0xFUzNcclxuICAgICAgICAgICAgZ2xzbDFbc3RhZ2VdID0gY2xlYW4oc3JjW3N0YWdlXS5nbHNsMSk7IC8vIGZvciBXZWJHTC9HTEVTMlxyXG4gICAgICAgICAgICBzcmNbc3RhZ2VdLnJlY29yZC5mb3JFYWNoKCh2KSA9PiByZWNvcmQuYWRkKHYpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBoYXNoID0gMDtcclxuICAgICAgICBpZiAodHlwZSA9PT0gJ2dyYXBoaWNzJykge1xyXG4gICAgICAgICAgICBpZiAoZ2xzbDQuY29tcHV0ZSB8fCBnbHNsMy5jb21wdXRlKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcignY29tcHV0ZSBzaGFkZXIgaXMgbm90IHN1cHBvcnRlZCBpbiBncmFwaGljcyBlZmZlY3QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYXNoID0gbWFwcGluZ3MubXVybXVyaGFzaDJfMzJfZ2MoZ2xzbDQudmVydCArIGdsc2w0LmZyYWcgKyBnbHNsMy52ZXJ0ICsgZ2xzbDMuZnJhZyArIGdsc2wxLnZlcnQgKyBnbHNsMS5mcmFnLCA2NjYpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChnbHNsNC52ZXJ0IHx8IGdsc2w0LmZyYWcgfHwgZ2xzbDMudmVydCB8fCBnbHNsMy5mcmFnIHx8IGdsc2wxLnZlcnQgfHwgZ2xzbDEuZnJhZykge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IoJ3ZlcnRleC9mcmFnbWVudCBzaGFkZXIgaXMgbm90IHN1cHBvcnRlZCBpbiBjb21wdXRlIGVmZmVjdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhhc2ggPSBtYXBwaW5ncy5tdXJtdXJoYXNoMl8zMl9nYyhcclxuICAgICAgICAgICAgICAgIGdsc2w0LnZlcnQgKyBnbHNsNC5mcmFnICsgZ2xzbDQuY29tcHV0ZSArIGdsc2wzLnZlcnQgKyBnbHNsMy5mcmFnICsgZ2xzbDMuY29tcHV0ZSArIGdsc2wxLnZlcnQgKyBnbHNsMS5mcmFnLFxyXG4gICAgICAgICAgICAgICAgNjY2LFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGFzc0dyb3VwID0gc2hhZGVySW5mby5kZXNjcmlwdG9yc1szXTtcclxuICAgICAgICBzaGFkZXJJbmZvLmJsb2NrcyA9IHNoYWRlckluZm8uYmxvY2tzLmZpbHRlcigodikgPT4gcGFzc0dyb3VwLmJsb2Nrcy5ldmVyeSgodCkgPT4gdC5uYW1lICE9PSB2Lm5hbWUpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnNhbXBsZXJUZXh0dXJlcyA9IHNoYWRlckluZm8uc2FtcGxlclRleHR1cmVzLmZpbHRlcigodikgPT4gcGFzc0dyb3VwLnNhbXBsZXJUZXh0dXJlcy5ldmVyeSgodCkgPT4gdC5uYW1lICE9PSB2Lm5hbWUpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnNhbXBsZXJzID0gc2hhZGVySW5mby5zYW1wbGVycy5maWx0ZXIoKHYpID0+IHBhc3NHcm91cC5zYW1wbGVycy5ldmVyeSgodCkgPT4gdC5uYW1lICE9PSB2Lm5hbWUpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLnRleHR1cmVzID0gc2hhZGVySW5mby50ZXh0dXJlcy5maWx0ZXIoKHYpID0+IHBhc3NHcm91cC50ZXh0dXJlcy5ldmVyeSgodCkgPT4gdC5uYW1lICE9PSB2Lm5hbWUpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLmJ1ZmZlcnMgPSBzaGFkZXJJbmZvLmJ1ZmZlcnMuZmlsdGVyKCh2KSA9PiBwYXNzR3JvdXAuYnVmZmVycy5ldmVyeSgodCkgPT4gdC5uYW1lICE9PSB2Lm5hbWUpKTtcclxuICAgICAgICBzaGFkZXJJbmZvLmltYWdlcyA9IHNoYWRlckluZm8uaW1hZ2VzLmZpbHRlcigodikgPT4gcGFzc0dyb3VwLmltYWdlcy5ldmVyeSgodCkgPT4gdC5uYW1lICE9PSB2Lm5hbWUpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc2hhZGVySW5mbywgeyBoYXNoLCBnbHNsNCwgZ2xzbDMsIGdsc2wxLCBidWlsdGlucywgZGVmaW5lcywgcmVjb3JkIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB7IGNvbXBpbGUsIGJ1aWxkIH07XHJcbn0pKCk7XHJcblxyXG5jb25zdCBjb21waWxlU2hhZGVyID0gc2hhZGVyRmFjdG9yeS5jb21waWxlO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09XHJcbi8vIGVmZmVjdHNcclxuLy8gPT09PT09PT09PT09PT09PT09XHJcblxyXG5jb25zdCBwYXJzZUVmZmVjdCA9ICgoKSA9PiB7XHJcbiAgICBjb25zdCBlZmZlY3RSRSA9IC9DQ0VmZmVjdFxccyoleyhbXl0rPykoPzp9JXwlfSkvO1xyXG4gICAgY29uc3QgcHJvZ3JhbVJFID0gL0NDUHJvZ3JhbVxccyooW1xcdy1dKylcXHMqJXsoW15dKj8pKD86fSV8JX0pLztcclxuICAgIGNvbnN0IGhhc2hDb21tZW50cyA9IC8jLiokL2dtO1xyXG4gICAgY29uc3Qgd2hpdGVzcGFjZXMgPSAvXlxccyokLztcclxuICAgIGNvbnN0IG5vSW5kZW50ID0gL1xcblteXFxzXS87XHJcbiAgICBjb25zdCBsZWFkaW5nU3BhY2UgPSAvXlteXFxTXFxuXS9nbTsgLy8gXFxzIHdpdGhvdXQgXFxuXHJcbiAgICBjb25zdCB0YWJzID0gL1xcdC9nO1xyXG4gICAgY29uc3Qgc3RyaXBIYXNoQ29tbWVudHMgPSAoY29kZSkgPT4gY29kZS5yZXBsYWNlKGhhc2hDb21tZW50cywgJycpO1xyXG4gICAgY29uc3Qgc3RydWN0dXJhbFR5cGVDaGVjayA9IChyZWYsIGN1ciwgcGF0aCA9ICdlZmZlY3QnKSA9PiB7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVmKSkge1xyXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY3VyKSkge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IoYEVGWDEwMDI6ICR7cGF0aH0gbXVzdCBiZSBhbiBhcnJheWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWZbMF0pIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3VyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0dXJhbFR5cGVDaGVjayhyZWZbMF0sIGN1cltpXSwgcGF0aCArIGBbJHtpfV1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICghY3VyIHx8IHR5cGVvZiBjdXIgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoY3VyKSkge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IoYEVGWDEwMDM6ICR7cGF0aH0gbXVzdCBiZSBhbiBvYmplY3RgKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhjdXIpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoJzonKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihgRUZYMTAwNDogc3ludGF4IGVycm9yIGF0ICcke2tleX0nLCB5b3UgbWlnaHQgbmVlZCB0byBpbnNlcnQgYSBzcGFjZSBhZnRlciBjb2xvbmApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYuYW55KSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhjdXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0dXJhbFR5cGVDaGVjayhyZWYuYW55LCBjdXJba2V5XSwgcGF0aCArIGAuJHtrZXl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyZWYpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlc3RLZXkgPSBrZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3RLZXlbMF0gPT09ICckJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0S2V5ID0gdGVzdEtleS5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghY3VyW3Rlc3RLZXldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzdHJ1Y3R1cmFsVHlwZUNoZWNrKHJlZltrZXldLCBjdXJbdGVzdEtleV0sIHBhdGggKyBgLiR7dGVzdEtleX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gKG5hbWUsIGNvbnRlbnQpID0+IHtcclxuICAgICAgICBzaGFkZXJOYW1lID0gJ3N5bnRheCc7XHJcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSh0YWJzLCAnICcucmVwZWF0KHRhYkFzU3BhY2VzKSk7XHJcbiAgICAgICAgLy8gcHJvY2VzcyBlYWNoIGJsb2NrXHJcbiAgICAgICAgbGV0IGVmZmVjdCA9IHt9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZXMgPSB7fSxcclxuICAgICAgICAgICAgbG9jYWxEZXByZWNhdGlvbnMgPSB7fTtcclxuICAgICAgICBjb25zdCBlZmZlY3RDYXAgPSBlZmZlY3RSRS5leGVjKHN0cmlwSGFzaENvbW1lbnRzKGNvbnRlbnQpKTtcclxuICAgICAgICBpZiAoIWVmZmVjdENhcCkge1xyXG4gICAgICAgICAgICBlcnJvcignRUZYMTAwMDogQ0NFZmZlY3QgaXMgbm90IGRlZmluZWQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3JjID0geWFtbC5sb2FkKGVmZmVjdENhcFsxXSk7XHJcbiAgICAgICAgICAgICAgICAvLyBkZWVwIGNsb25lIHRvIGRlY291cGxlIHJlZmVyZW5jZXNcclxuICAgICAgICAgICAgICAgIGVmZmVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3JjKSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGVycm9yKGBFRlgxMDAxOiBDQ0VmZmVjdCBwYXJzZXIgZmFpbGVkOiAke2V9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFlZmZlY3QubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgZWZmZWN0Lm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0cnVjdHVyYWxUeXBlQ2hlY2sobWFwcGluZ3MuZWZmZWN0U3RydWN0dXJlLCBlZmZlY3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50ID0gc3RyaXBDb21tZW50cyhjb250ZW50KTtcclxuICAgICAgICBsZXQgcHJvZ3JhbUNhcCA9IHByb2dyYW1SRS5leGVjKGNvbnRlbnQpO1xyXG4gICAgICAgIHdoaWxlIChwcm9ncmFtQ2FwKSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBwcm9ncmFtQ2FwWzJdO1xyXG4gICAgICAgICAgICBpZiAoIXdoaXRlc3BhY2VzLnRlc3QocmVzdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgLy8gc2tpcCB0aGlzIGZvciBlbXB0eSBibG9ja3NcclxuICAgICAgICAgICAgICAgIHdoaWxlICghbm9JbmRlbnQudGVzdChyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UobGVhZGluZ1NwYWNlLCAnJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkQ2h1bmsocHJvZ3JhbUNhcFsxXSwgcmVzdWx0LCB0ZW1wbGF0ZXMsIGxvY2FsRGVwcmVjYXRpb25zKTtcclxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQuc3Vic3RyaW5nKHByb2dyYW1DYXAuaW5kZXggKyBwcm9ncmFtQ2FwWzBdLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHByb2dyYW1DYXAgPSBwcm9ncmFtUkUuZXhlYyhjb250ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgZWZmZWN0LCB0ZW1wbGF0ZXMsIGxvY2FsRGVwcmVjYXRpb25zIH07XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxuY29uc3QgbWFwUGFzc1BhcmFtID0gKCgpID0+IHtcclxuICAgIGNvbnN0IGZpbmRVbmlmb3JtVHlwZSA9IChuYW1lLCBzaGFkZXIpID0+IHtcclxuICAgICAgICBsZXQgcmVzID0gMCxcclxuICAgICAgICAgICAgY2IgPSAodSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHUubmFtZSAhPT0gbmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlcyA9IHUudHlwZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIGlmICghc2hhZGVyLmJsb2Nrcy5zb21lKChiKSA9PiBiLm1lbWJlcnMuc29tZShjYikpKSB7XHJcbiAgICAgICAgICAgIHNoYWRlci5zYW1wbGVyVGV4dHVyZXMuc29tZShjYik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgcHJvcFR5cGVDaGVjayA9ICh2YWx1ZSwgdHlwZSwgZ2l2ZW5UeXBlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGUgPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ25vIG1hdGNoaW5nIHVuaWZvcm0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfSAvLyBkZWZhdWx0IHZhbHVlXHJcbiAgICAgICAgaWYgKGdpdmVuVHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgaWYgKCFtYXBwaW5ncy5pc1NhbXBsZXIodHlwZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnc3RyaW5nIGZvciB2ZWN0b3JzJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnbm9uLWFycmF5IGZvciBidWZmZXIgbWVtYmVycyc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5sZW5ndGggIT09IG1hcHBpbmdzLkdldFR5cGVTaXplKHR5cGUpIC8gNCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3dyb25nIGFycmF5IGxlbmd0aCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH07XHJcbiAgICBjb25zdCB0YXJnZXRSRSA9IC9eKFxcdyspKD86XFwuKFt4eXp3XSt8W3JnYmFdKykpPyQvO1xyXG4gICAgY29uc3QgY2hhbm5lbE1hcCA9IHsgeDogMCwgeTogMSwgejogMiwgdzogMywgcjogMCwgZzogMSwgYjogMiwgYTogMyB9O1xyXG4gICAgY29uc3QgbWFwVGFyZ2V0ID0gKHRhcmdldCwgc2hhZGVyKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlSW5mbyA9IFt0YXJnZXQsIDAsIDBdO1xyXG4gICAgICAgIGNvbnN0IGNhcCA9IHRhcmdldFJFLmV4ZWModGFyZ2V0KTtcclxuICAgICAgICBpZiAoIWNhcCkge1xyXG4gICAgICAgICAgICBlcnJvcihgRUZYMzMwMzogaWxsZWdhbCBwcm9wZXJ0eSB0YXJnZXQgJyR7dGFyZ2V0fSdgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUluZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN3aXp6bGUgPSAoY2FwWzJdICYmIGNhcFsyXS50b0xvd2VyQ2FzZSgpKSB8fCAnJztcclxuICAgICAgICBjb25zdCBiZWdpbm5pbmcgPSBjaGFubmVsTWFwW3N3aXp6bGVbMF1dIHx8IDA7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBzd2l6emxlXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoJycpXHJcbiAgICAgICAgICAgICAgICAubWFwKChjLCBpZHgpID0+IGNoYW5uZWxNYXBbY10gLSBiZWdpbm5pbmcgLSBpZHgpXHJcbiAgICAgICAgICAgICAgICAuc29tZSgobikgPT4gbilcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgZXJyb3IoYEVGWDMzMDQ6ICcke3RhcmdldH0nOiByYW5kb20gY29tcG9uZW50IHN3aXp6bGUgaXMgbm90IHN1cHBvcnRlZGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVJbmZvWzBdID0gY2FwWzFdO1xyXG4gICAgICAgIGhhbmRsZUluZm9bMV0gPSBiZWdpbm5pbmc7XHJcbiAgICAgICAgaGFuZGxlSW5mb1syXSA9IGZpbmRVbmlmb3JtVHlwZShjYXBbMV0sIHNoYWRlcik7XHJcbiAgICAgICAgaWYgKHN3aXp6bGUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUluZm9bMl0gLT0gTWF0aC5tYXgoMCwgbWFwcGluZ3MuR2V0VHlwZVNpemUoaGFuZGxlSW5mb1syXSkgLyA0IC0gc3dpenpsZS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaGFuZGxlSW5mb1syXSA8PSAwKSB7XHJcbiAgICAgICAgICAgIGVycm9yKGBFRlgzMzA1OiBubyBtYXRjaGluZyB1bmlmb3JtIHRhcmdldCAnJHt0YXJnZXR9J2ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFuZGxlSW5mbztcclxuICAgIH07XHJcbiAgICBjb25zdCBtYXBQcm9wZXJ0aWVzID0gKHByb3BzLCBzaGFkZXIpID0+IHtcclxuICAgICAgICBsZXQgbWV0YWRhdGEgPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IHAgb2YgT2JqZWN0LmtleXMocHJvcHMpKSB7XHJcbiAgICAgICAgICAgIGlmIChwID09PSAnX19tZXRhZGF0YV9fJykge1xyXG4gICAgICAgICAgICAgICAgbWV0YWRhdGEgPSBwcm9wc1twXTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBwcm9wc1twXTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBwcm9wc1twXSxcclxuICAgICAgICAgICAgICAgIHNoYWRlclR5cGUgPSBmaW5kVW5pZm9ybVR5cGUocCwgc2hhZGVyKTtcclxuICAgICAgICAgICAgLy8gdHlwZSB0cmFuc2xhdGlvbiBvciBleHRyYWN0aW9uXHJcbiAgICAgICAgICAgIGlmIChpbmZvLnR5cGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgd2FybihgRUZYMzMwMDogcHJvcGVydHkgJyR7cH0nOiB5b3UgZG9uJ3QgaGF2ZSB0byBzcGVjaWZ5IHR5cGUgaW4gaGVyZWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZm8udHlwZSA9IHNoYWRlclR5cGU7XHJcbiAgICAgICAgICAgIC8vIHRhcmdldCBzcGVjaWZpY2F0aW9uXHJcbiAgICAgICAgICAgIGlmIChpbmZvLnRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgaW5mby5oYW5kbGVJbmZvID0gbWFwVGFyZ2V0KGluZm8udGFyZ2V0LCBzaGFkZXIpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGluZm8udGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgaW5mby50eXBlID0gaW5mby5oYW5kbGVJbmZvWzJdO1xyXG4gICAgICAgICAgICAgICAgLy8gcG9seWZpbGwgc291cmNlIHByb3BlcnR5XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZXByZWNhdGVkID0gaW5mby5lZGl0b3IgJiYgaW5mby5lZGl0b3IudmlzaWJsZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGluZm8uaGFuZGxlSW5mb1swXSxcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRUeXBlID0gZmluZFVuaWZvcm1UeXBlKGluZm8uaGFuZGxlSW5mb1swXSwgc2hhZGVyKTtcclxuICAgICAgICAgICAgICAgIGlmICghcHJvcHNbdGFyZ2V0XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BzW3RhcmdldF0gPSB7IHR5cGU6IHRhcmdldFR5cGUsIGVkaXRvcjogeyB2aXNpYmxlOiBmYWxzZSB9IH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVwcmVjYXRlZCA9PT0gdW5kZWZpbmVkIHx8IGRlcHJlY2F0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXByb3BzW3RhcmdldF0uZWRpdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzW3RhcmdldF0uZWRpdG9yID0geyBkZXByZWNhdGVkOiB0cnVlIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wc1t0YXJnZXRdLmVkaXRvci5kZXByZWNhdGVkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHNbdGFyZ2V0XS5lZGl0b3IuZGVwcmVjYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG1hcHBpbmdzLmlzU2FtcGxlcih0YXJnZXRUeXBlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzW3RhcmdldF0udmFsdWUgPSBpbmZvLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9wc1t0YXJnZXRdLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzW3RhcmdldF0udmFsdWUgPSBBcnJheShtYXBwaW5ncy5HZXRUeXBlU2l6ZSh0YXJnZXRUeXBlKSAvIDQpLmZpbGwoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGluZm8udmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzW3RhcmdldF0udmFsdWUuc3BsaWNlKGluZm8uaGFuZGxlSW5mb1sxXSwgaW5mby52YWx1ZS5sZW5ndGgsIC4uLmluZm8udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5mby52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzW3RhcmdldF0udmFsdWUuc3BsaWNlKGluZm8uaGFuZGxlSW5mb1sxXSwgMSwgaW5mby52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHNhbXBsZXIgc3BlY2lmaWNhdGlvblxyXG4gICAgICAgICAgICBpZiAoaW5mby5zYW1wbGVyKSB7XHJcbiAgICAgICAgICAgICAgICBpbmZvLnNhbXBsZXJIYXNoID0gbWFwU2FtcGxlcihnZW5lcmFsTWFwKGluZm8uc2FtcGxlcikpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGluZm8uc2FtcGxlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBkZWZhdWx0IHZhbHVlc1xyXG4gICAgICAgICAgICBjb25zdCBnaXZlblR5cGUgPSB0eXBlb2YgaW5mby52YWx1ZTtcclxuICAgICAgICAgICAgLy8gY29udmVydCBudW1iZXJzIHRvIGFycmF5XHJcbiAgICAgICAgICAgIGlmIChnaXZlblR5cGUgPT09ICdudW1iZXInIHx8IGdpdmVuVHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgICAgICBpbmZvLnZhbHVlID0gW2luZm8udmFsdWVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHR5cGUgY2hlY2sgdGhlIGdpdmVuIHZhbHVlXHJcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IHByb3BUeXBlQ2hlY2soaW5mby52YWx1ZSwgaW5mby50eXBlLCBnaXZlblR5cGUpO1xyXG4gICAgICAgICAgICBpZiAobXNnKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcihgRUZYMzMwMjogaWxsZWdhbCBwcm9wZXJ0eSBkZWNsYXJhdGlvbiBmb3IgJyR7cH0nOiAke21zZ31gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IHAgb2YgT2JqZWN0LmtleXMocHJvcHMpKSB7XHJcbiAgICAgICAgICAgIHBhdGNoTWV0YWRhdGEocHJvcHNbcF0sIG1ldGFkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByb3BzO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHBhdGNoTWV0YWRhdGEgPSAodGFyZ2V0LCBtZXRhZGF0YSkgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhtZXRhZGF0YSkpIHtcclxuICAgICAgICAgICAgY29uc3QgdiA9IG1ldGFkYXRhW2tdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXRba10gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICBwYXRjaE1ldGFkYXRhKHRhcmdldFtrXSwgdik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0W2tdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldFtrXSA9IHY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3QgZ2VuZXJhbE1hcCA9IChvYmopID0+IHtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcCA9IG9ialtrZXldO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzdHJpbmcgbGl0ZXJhbFxyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9IHBhcnNlSW50KHByb3ApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKG51bSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBudW0gPSBtYXBwaW5ncy5wYXNzUGFyYW1zW3Byb3AudG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmpba2V5XSA9IG51bTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3ApKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheXM6XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByb3AubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9IC8vIGVtcHR5XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHR5cGVvZiBwcm9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcC5mb3JFYWNoKGdlbmVyYWxNYXApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gbmVzdGVkIHByb3BzXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhbE1hcChwcm9wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIHN0cmluZyBhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtrZXldID0gLy8gY29sb3IgYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoKHByb3BbMF0gKiAyNTUpIDw8IDI0KSB8ICgocHJvcFsxXSAqIDI1NSkgPDwgMTYpIHwgKChwcm9wWzJdICogMjU1KSA8PCA4KSB8ICgocHJvcFszXSB8fCAyNTUpICogMjU1KSkgPj4+IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3AgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICBnZW5lcmFsTWFwKHByb3ApOyAvLyBuZXN0ZWQgcHJvcHNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHNhbXBsZXJJbmZvID0gbmV3IG1hcHBpbmdzLlNhbXBsZXJJbmZvKCk7XHJcbiAgICBjb25zdCBtYXBTYW1wbGVyID0gKG9iaikgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpIHtcclxuICAgICAgICAgICAgaWYgKHNhbXBsZXJJbmZvW2tleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgd2FybihgRUZYMzMwMTogaWxsZWdhbCBzYW1wbGVyIGluZm8gJyR7a2V5fSdgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWFwcGluZ3MuU2FtcGxlci5jb21wdXRlSGFzaChvYmopO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHByaW9yaXR5UkUgPSAvXihbYS16QS1aXSspP1xccyooWystXSk/XFxzKihbXFxkeGFiY2RlZl0rKT8kL2k7XHJcbiAgICBjb25zdCBkZmF1bHQgPSBtYXBwaW5ncy5SZW5kZXJQcmlvcml0eS5ERUZBVUxUO1xyXG4gICAgY29uc3QgbWluID0gbWFwcGluZ3MuUmVuZGVyUHJpb3JpdHkuTUlOO1xyXG4gICAgY29uc3QgbWF4ID0gbWFwcGluZ3MuUmVuZGVyUHJpb3JpdHkuTUFYO1xyXG4gICAgY29uc3QgbWFwUHJpb3JpdHkgPSAoc3RyKSA9PiB7XHJcbiAgICAgICAgbGV0IHJlcyA9IDA7XHJcbiAgICAgICAgY29uc3QgY2FwID0gcHJpb3JpdHlSRS5leGVjKHN0cik7XHJcbiAgICAgICAgaWYgKGNhcFsxXSkge1xyXG4gICAgICAgICAgICByZXMgPSBtYXBwaW5ncy5SZW5kZXJQcmlvcml0eVtjYXBbMV0udG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjYXBbM10pIHtcclxuICAgICAgICAgICAgcmVzICs9IHBhcnNlSW50KGNhcFszXSkgKiAoY2FwWzJdID09PSAnLScgPyAtMSA6IDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4ocmVzKSB8fCByZXMgPCBtaW4gfHwgcmVzID4gbWF4KSB7XHJcbiAgICAgICAgICAgIHdhcm4oYEVGWDMwMDA6IGlsbGVnYWwgcGFzcyBwcmlvcml0eTogJHtzdHJ9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgbWFwU3dpdGNoID0gKGRlZiwgc2hhZGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNoYWRlci5kZWZpbmVzLmZpbmQoKGQpID0+IGQubmFtZSA9PT0gZGVmKSkge1xyXG4gICAgICAgICAgICBlcnJvcignRUZYMzIwMDogZXhpc3Rpbmcgc2hhZGVyIG1hY3JvcyBjYW5ub3QgYmUgdXNlZCBhcyBwYXNzIHN3aXRjaCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IG1hcERTUyA9IChkc3MpID0+IHtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkc3MpKSB7XHJcbiAgICAgICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3N0ZW5jaWwnKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFrZXkuZW5kc1dpdGgoJ0Zyb250JykgJiYgIWtleS5lbmRzV2l0aCgnQmFjaycpKSB7XHJcbiAgICAgICAgICAgICAgICBkc3Nba2V5ICsgJ0Zyb250J10gPSBkc3Nba2V5ICsgJ0JhY2snXSA9IGRzc1trZXldO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGRzc1trZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkc3Muc3RlbmNpbFdyaXRlTWFza0Zyb250ICE9PSBkc3Muc3RlbmNpbFdyaXRlTWFza0JhY2spIHtcclxuICAgICAgICAgICAgd2FybignRUZYMzEwMDogV2ViR0woMikgZG9lc25cXCd0IHN1cHBvcnQgaW5jb25zaXN0ZW50IGZyb250L2JhY2sgc3RlbmNpbCB3cml0ZSBtYXNrJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkc3Muc3RlbmNpbFJlYWRNYXNrRnJvbnQgIT09IGRzcy5zdGVuY2lsUmVhZE1hc2tCYWNrKSB7XHJcbiAgICAgICAgICAgIHdhcm4oJ0VGWDMxMDE6IFdlYkdMKDIpIGRvZXNuXFwndCBzdXBwb3J0IGluY29uc2lzdGVudCBmcm9udC9iYWNrIHN0ZW5jaWwgcmVhZCBtYXNrJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkc3Muc3RlbmNpbFJlZkZyb250ICE9PSBkc3Muc3RlbmNpbFJlZkJhY2spIHtcclxuICAgICAgICAgICAgd2FybignRUZYMzEwMjogV2ViR0woMikgZG9lc25cXCd0IHN1cHBvcnQgaW5jb25zaXN0ZW50IGZyb250L2JhY2sgc3RlbmNpbCByZWYnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGdlbmVyYWxNYXAoZHNzKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gKHBhc3MsIHNoYWRlcikgPT4ge1xyXG4gICAgICAgIHNoYWRlck5hbWUgPSAndHlwZSBlcnJvcic7XHJcbiAgICAgICAgY29uc3QgdG1wID0ge307XHJcbiAgICAgICAgLy8gc3BlY2lhbCB0cmVhdG1lbnRzXHJcbiAgICAgICAgaWYgKHBhc3MucHJpb3JpdHkpIHtcclxuICAgICAgICAgICAgdG1wLnByaW9yaXR5ID0gbWFwUHJpb3JpdHkocGFzcy5wcmlvcml0eSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBwYXNzLnByaW9yaXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFzcy5kZXB0aFN0ZW5jaWxTdGF0ZSkge1xyXG4gICAgICAgICAgICB0bXAuZGVwdGhTdGVuY2lsU3RhdGUgPSBtYXBEU1MocGFzcy5kZXB0aFN0ZW5jaWxTdGF0ZSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBwYXNzLmRlcHRoU3RlbmNpbFN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFzcy5zd2l0Y2gpIHtcclxuICAgICAgICAgICAgdG1wLnN3aXRjaCA9IG1hcFN3aXRjaChwYXNzLnN3aXRjaCwgc2hhZGVyKTtcclxuICAgICAgICAgICAgZGVsZXRlIHBhc3Muc3dpdGNoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFzcy5wcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHRtcC5wcm9wZXJ0aWVzID0gbWFwUHJvcGVydGllcyhwYXNzLnByb3BlcnRpZXMsIHNoYWRlcik7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBwYXNzLnByb3BlcnRpZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwYXNzLm1pZ3JhdGlvbnMpIHtcclxuICAgICAgICAgICAgdG1wLm1pZ3JhdGlvbnMgPSBwYXNzLm1pZ3JhdGlvbnM7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBwYXNzLm1pZ3JhdGlvbnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdlbmVyYWxNYXAocGFzcyk7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihwYXNzLCB0bXApO1xyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbmNvbnN0IHJlZHVjZUhlYWRlclJlY29yZCA9IChzaGFkZXJzKSA9PiB7XHJcbiAgICBjb25zdCBkZXBzID0gbmV3IFNldCgpO1xyXG4gICAgZm9yIChjb25zdCBzaGFkZXIgb2Ygc2hhZGVycykge1xyXG4gICAgICAgIHNoYWRlci5yZWNvcmQuZm9yRWFjaChkZXBzLmFkZCwgZGVwcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gWy4uLmRlcHMudmFsdWVzKCldO1xyXG59O1xyXG5cclxuY29uc3Qgc3RhZ2VWYWxpZGF0aW9uID0gKHN0YWdlcykgPT4ge1xyXG4gICAgY29uc3QgcGFzc01hcCA9IHtcclxuICAgICAgICB2ZXJ0OiAnZ3JhcGhpY3MnLFxyXG4gICAgICAgIGZyYWc6ICdncmFwaGljcycsXHJcbiAgICAgICAgY29tcHV0ZTogJ2NvbXB1dGUnLFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoc3RhZ2VzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGVycm9yKCcwIHN0YWdlcyBwcm92aWRlZCBmb3IgYSBwYXNzJyk7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdHlwZSA9IHBhc3NNYXBbc3RhZ2VzWzBdXTtcclxuICAgIHN0YWdlcy5mb3JFYWNoKChzdGFnZSkgPT4ge1xyXG4gICAgICAgIC8vIHZhbGlkYXRpb246IGFsbCBzdGFnZXMgbXVzdCBoYXZlIHRoZSBzYW1lIHBhc3MgdHlwZVxyXG4gICAgICAgIGlmICghcGFzc01hcFtzdGFnZV0pIHtcclxuICAgICAgICAgICAgZXJyb3IoYGludmFsaWQgc3RhZ2UgdHlwZSAke3N0YWdlfWApO1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwYXNzTWFwW3N0YWdlXSAhPT0gdHlwZSkge1xyXG4gICAgICAgICAgICBlcnJvcignbW9yZSB0aGFuIG9uZSBwYXNzIHR5cGUgYXBwZWFycycpO1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAodHlwZSA9PT0gJ2dyYXBoaWNzJykge1xyXG4gICAgICAgIGNvbnN0IHZlcnQgPSBzdGFnZXMuZmluZCgocykgPT4gcyA9PT0gJ3ZlcnQnKTtcclxuICAgICAgICBjb25zdCBmcmFnID0gc3RhZ2VzLmZpbmQoKHMpID0+IHMgPT09ICdmcmFnJyk7XHJcbiAgICAgICAgaWYgKHN0YWdlcy5sZW5ndGggPT09IDEgfHwgIXZlcnQgfHwgIWZyYWcpIHtcclxuICAgICAgICAgICAgZXJyb3IoJ2dyYXBoaWNzIHBhc3MgbXVzdCBpbmNsdWRlIHZlcnQgYW5kIGZyYWcgc2hhZGVycycpO1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHR5cGU7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZEVmZmVjdCA9IChuYW1lLCBjb250ZW50KSA9PiB7XHJcbiAgICBlZmZlY3ROYW1lID0gbmFtZTtcclxuICAgIGxldCB7IGVmZmVjdCwgdGVtcGxhdGVzLCBsb2NhbERlcHJlY2F0aW9ucyB9ID0gcGFyc2VFZmZlY3QobmFtZSwgY29udGVudCk7XHJcbiAgICBpZiAoIWVmZmVjdCB8fCAhQXJyYXkuaXNBcnJheShlZmZlY3QudGVjaG5pcXVlcykpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8vIG1hcCBwYXNzZXNcclxuICAgIHRlbXBsYXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIGdsb2JhbENodW5rcywgdGVtcGxhdGVzKTtcclxuICAgIGNvbnN0IGRlcHJlY2F0aW9ucyA9IHt9O1xyXG4gICAgZm9yIChjb25zdCB0eXBlIGluIGdsb2JhbERlcHJlY2F0aW9ucykge1xyXG4gICAgICAgIGRlcHJlY2F0aW9uc1t0eXBlXSA9IE9iamVjdC5hc3NpZ24oe30sIGdsb2JhbERlcHJlY2F0aW9uc1t0eXBlXSwgbG9jYWxEZXByZWNhdGlvbnNbdHlwZV0pO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGVwcmVjYXRpb25TdHIgPSBPYmplY3Qua2V5cyhkZXByZWNhdGlvbnMuaWRlbnRpZmllcnMpXHJcbiAgICAgICAgLnJlZHVjZSgoY3VyLCBhY2MpID0+IGB8JHthY2N9YCArIGN1ciwgJycpXHJcbiAgICAgICAgLnNsaWNlKDEpO1xyXG4gICAgaWYgKGRlcHJlY2F0aW9uU3RyLmxlbmd0aCkge1xyXG4gICAgICAgIGRlcHJlY2F0aW9ucy5pZGVudGlmaWVyUkUgPSBuZXcgUmVnRXhwKGBcXFxcYigke2RlcHJlY2F0aW9uU3RyfSlcXFxcYmAsICdnJyk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBzaGFkZXJzID0gKGVmZmVjdC5zaGFkZXJzID0gW10pO1xyXG4gICAgZm9yIChjb25zdCBqc29uVGVjaCBvZiBlZmZlY3QudGVjaG5pcXVlcykge1xyXG4gICAgICAgIGZvciAoY29uc3QgcGFzcyBvZiBqc29uVGVjaC5wYXNzZXMpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhZ2VOYW1lcyA9IHt9O1xyXG4gICAgICAgICAgICBjb25zdCBzdGFnZXMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKHBhc3MudmVydCkge1xyXG4gICAgICAgICAgICAgICAgc3RhZ2VOYW1lc1sndmVydCddID0gcGFzcy52ZXJ0O1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBhc3MudmVydDtcclxuICAgICAgICAgICAgICAgIHN0YWdlcy5wdXNoKCd2ZXJ0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhc3MuZnJhZykge1xyXG4gICAgICAgICAgICAgICAgc3RhZ2VOYW1lc1snZnJhZyddID0gcGFzcy5mcmFnO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBhc3MuZnJhZztcclxuICAgICAgICAgICAgICAgIHN0YWdlcy5wdXNoKCdmcmFnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhc3MuY29tcHV0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhZ2VOYW1lc1snY29tcHV0ZSddID0gcGFzcy5jb21wdXRlO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBhc3MuY29tcHV0ZTtcclxuICAgICAgICAgICAgICAgIHN0YWdlcy5wdXNoKCdjb21wdXRlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IChwYXNzLnByb2dyYW0gPSBzdGFnZXMucmVkdWNlKChhY2MsIHZhbCkgPT4gYWNjLmNvbmNhdChgfCR7c3RhZ2VOYW1lc1t2YWxdfWApLCBlZmZlY3ROYW1lKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBzdGFnZVZhbGlkYXRpb24oc3RhZ2VzKTtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpbnZhbGlkLCBza2lwIHBhc3NcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBzaGFkZXIgPSBzaGFkZXJzLmZpbmQoKHMpID0+IHMubmFtZSA9PT0gbmFtZSk7XHJcbiAgICAgICAgICAgIGlmICghc2hhZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzaGFkZXIgPSBzaGFkZXJGYWN0b3J5LmJ1aWxkKHN0YWdlTmFtZXMsIHR5cGUsIHRlbXBsYXRlcywgZGVwcmVjYXRpb25zKTtcclxuICAgICAgICAgICAgICAgIHNoYWRlci5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgICAgIHNoYWRlcnMucHVzaChzaGFkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1hcFBhc3NQYXJhbShwYXNzLCBzaGFkZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVmZmVjdC5kZXBlbmRlbmNpZXMgPSByZWR1Y2VIZWFkZXJSZWNvcmQoc2hhZGVycyk7XHJcbiAgICByZXR1cm4gZWZmZWN0O1xyXG59O1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09XHJcbi8vIGV4cG9ydHNcclxuLy8gPT09PT09PT09PT09PT09PT09XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIG9wdGlvbnMsXHJcbiAgICBhZGRDaHVuayxcclxuICAgIGNvbXBpbGVTaGFkZXIsXHJcbiAgICBidWlsZEVmZmVjdCxcclxufTtcclxuIl19