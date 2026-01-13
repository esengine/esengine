'use strict';

const ps = require('path');
const fs = require('fs-extra');
const fsJetpack = require('fs-jetpack');

const options = {
    engineRoot: '',
    shouldThrow: false,
    noSource: false,
    stripSpaces: false,
    noOutput: false,
    essentialOnly: false,
    keepNewlines: false,
    filesOrDirs: [],
};
const argc = process.argv.length;
for (let i = 2; i < argc; i++) {
    const arg = process.argv[i];
    if (arg === '--engine' && i < argc - 1) {
        options.engineRoot = ps.resolve(process.argv[++i]);
    } else if (arg === '--throw') {
        options.shouldThrow = true;
    } else if (arg === '--no-source') {
        options.noSource = true;
    } else if (arg === '--strip-spaces') {
        options.stripSpaces = true;
    } else if (arg === '--no-output') {
        options.noOutput = true;
    } else if (arg === '--essential-only') {
        options.essentialOnly = true;
    } else if (arg.startsWith('--keep-newlines')) {
        options.keepNewlines = arg.length > 15 ? arg.substring(16) : '';
    } else {
        options.filesOrDirs.push(arg);
    }
}

const cacheFile = ps.join(__dirname, 'engine_root_cache.txt');
if (options.engineRoot && fs.existsSync(options.engineRoot)) {
    fs.writeFileSync(cacheFile, options.engineRoot);
} else {
    if (fs.existsSync(cacheFile)) {
        options.engineRoot = fs.readFileSync(cacheFile, 'utf8');
    }
    if (!options.engineRoot) {
        throw new Error('Engine root is not set');
    }
}

// polyfill some dirty globals
Object.assign(global, {
    Manager: { AssetInfo: { engine: options.engineRoot } },
    cc: {},
    CC_EDITOR: false,
    CC_DEV: false,
    CC_TEST: false,
});

const { default: preload } = require('cc/preload');
(async () => {
    await preload({
        root: options.engineRoot,
        editorExtensions: false,
        requiredModules: ['cc/editor/offline-mappings'],
    });

    main();
})().catch((err) => {
    console.error(err);
});

function main() {
    const shdcLib = require(ps.join(__dirname, './index'));
    shdcLib.options.throwOnWarning = shdcLib.options.throwOnError = options.shouldThrow;
    shdcLib.options.noSource = options.noSource;
    shdcLib.options.skipParserTest = true;
    const closure = { dir: '' };
    const chunksDir = { dir: ps.join(options.engineRoot, 'editor/assets/chunks') };
    shdcLib.options.chunkSearchFn = (names) => {
        const res = { name: undefined, content: undefined };
        for (let i = 0; i < names.length; i++) {
            // user input path first
            const name = names[i];
            let file = ps.resolve(closure.dir, name + '.chunk');
            if (!fs.existsSync(file)) {
                file = ps.resolve(chunksDir.dir, name + '.chunk');
                if (!fs.existsSync(file)) {
                    continue;
                }
            }
            res.name = name;
            res.content = fs.readFileSync(file, { encoding: 'utf-8' });
            break;
        }
        return res;
    };
    const addChunks = (dir) => {
        const files = fsJetpack.find(dir, { matching: '*.chunk', recursive: false });
        for (let i = 0; i < files.length; ++i) {
            const name = ps.basename(files[i], '.chunk');
            const content = fs.readFileSync(files[i], { encoding: 'utf8' });
            shdcLib.addChunk(name, content);
        }
    };
    addChunks(ps.join(options.engineRoot, 'editor/assets/chunks'));

    const indent = (str, num) => str.replace(/\n/g, '\n' + ' '.repeat(num));
    const stringify = (o) => {
        return JSON.stringify(o)
            .replace(/([,{]|":)/g, '$1 ')
            .replace(/([}])/g, ' $1');
    };
    const stringifyArray = (arr, stringifyObj = stringify) => {
        let code = '';
        if (!arr.length) {
            return '[]';
        }
        for (const obj of arr) {
            code += `  ${indent(stringifyObj(obj), 2)},\n`;
        }
        return `[\n${code.slice(0, -2)}\n]`;
    };

    const stringifySource = (() => {
        const indentRE = /\s*?\n\s*/g;
        const spacesRE = /[\s\n]+/g,
            identifierRE = /\w/;
        const replacer = (
            m,
            ofs,
            str, // replace those following or followed by a non-identifier
        ) => (!ofs || !identifierRE.test(str[ofs - 1]) || !identifierRE.test(str[ofs + m.length]) ? '' : ' ');
        const stringifyCode = (src, path) => {
            if (options.stripSpaces) {
                src = src.replace(spacesRE, replacer);
            }
            if (options.essentialOnly) {
                src = src.replace(indentRE, '\n');
            }
            return path.includes(options.keepNewlines) ? `\`${src}\`` : `"${src.replace(/\n/g, '\\n')}"`;
        };
        return (src, path) => {
            let code = '{\n';
            code += `  "vert": ${indent(stringifyCode(src.vert, path + '.vert'), 4)},\n`;
            code += `  "frag": ${indent(stringifyCode(src.frag, path + '.frag'), 4)},\n`;
            code += '}';
            return code;
        };
    })();

    const stringifyEffect = (() => {
        const stringifyBlock = (u) =>
            `{"name": "${u.name}", "defines": ${stringify(u.defines)}, "binding": ${u.binding}, ` +
            (u.descriptorType ? '"descriptorType": ' + u.descriptorType + ', ' : '') +
            `"stageFlags": ${u.stageFlags}, "members": ${stringifyArray(u.members)}}`;
        const stringifyShader = (shader) => {
            let code = '';
            const {
                name,
                hash,
                glsl4,
                glsl3,
                glsl1,
                builtins,
                defines,
                blocks,
                samplerTextures,
                buffers,
                images,
                textures,
                samplers,
                subpassInputs,
                attributes,
                varyings,
            } = shader;

            code += '{\n';
            code += `  "name": "${name}",\n`;
            code += `  "hash": ${hash},\n`;
            if (glsl4) {
                code += `  "glsl4": ${indent(stringifySource(glsl4, 'glsl4'), 2)},\n`;
            }
            if (glsl3) {
                code += `  "glsl3": ${indent(stringifySource(glsl3, 'glsl3'), 2)},\n`;
            }
            if (glsl1) {
                code += `  "glsl1": ${indent(stringifySource(glsl1, 'glsl1'), 2)},\n`;
            }
            if (varyings) {
                code += `  "varyings": ${indent(stringifyArray(varyings), 2)},\n`;
            }
            code += '  "builtins": {\n';
            code += `    "statistics": ${stringify(builtins.statistics)},\n`;
            code += `    "globals": ${stringify(builtins.globals)},\n`;
            code += `    "locals": ${stringify(builtins.locals)}\n`;
            code += '  },\n';
            code += `  "defines": ${indent(stringifyArray(defines), 2)},\n`;
            code += `  "attributes": ${indent(stringifyArray(attributes), 2)},\n`;
            code += `  "blocks": ${indent(stringifyArray(blocks, stringifyBlock), 2)},\n`;
            code += `  "samplerTextures": ${indent(stringifyArray(samplerTextures), 2)},\n`;
            code += `  "buffers": ${indent(stringifyArray(buffers), 2)},\n`;
            code += `  "images": ${indent(stringifyArray(images), 2)},\n`;
            code += `  "textures": ${indent(stringifyArray(textures), 2)},\n`;
            code += `  "samplers": ${indent(stringifyArray(samplers), 2)},\n`;
            code += `  "subpassInputs": ${indent(stringifyArray(subpassInputs), 2)}\n`;
            code += '}';

            return code;
        };
        return (effect) => {
            if (options.essentialOnly) {
                shdcLib.stripEditorSupport(effect);
            }
            let code = '';
            code += '{\n';
            code += `  "name": "${effect.name}",\n`;
            code += effect._uuid ? `  "_uuid": "${effect._uuid}",\n` : '';
            code += `  "techniques": ${indent(stringifyArray(effect.techniques), 2)},\n`;
            if (!options.essentialOnly) {
                code += `  "dependencies": ${indent(stringifyArray(effect.dependencies), 2)},\n`;
                if (effect.editor) {
                    code += `  "editor": ${indent(stringify(effect.editor), 2)},\n`;
                }
            }
            code += `  "shaders": ${indent(stringifyArray(effect.shaders, stringifyShader), 2)}\n`;
            code += '}';
            return code;
        };
    })();

    const addEssential = (() => {
        // empty array will keep all techs
        const essentialList = {
            'pipeline/planar-shadow': { techs: [] },
            'pipeline/skybox': { techs: [] },
            'pipeline/deferred-lighting': { techs: [] },
            'pipeline/bloom': { techs: [] },
            'pipeline/post-process': { techs: [] },
            'util/profiler': { techs: [] },
            'util/splash-screen': { techs: [] },
            'builtin-standard': { techs: [0] },
            'builtin-unlit': { techs: [0] },
            'builtin-sprite': { techs: [] },
            'builtin-particle': { techs: [0] },
            'builtin-particle-gpu': { techs: [0] },
            'builtin-particle-trail': { techs: [0] },
            'builtin-billboard': { techs: [0] },
            'builtin-terrain': { techs: [0] },
            'builtin-graphics': { techs: [] },
            'builtin-clear-stencil': { techs: [] },
            'builtin-spine': { techs: [0] },
            'builtin-occlusion-query': { techs: [0] },
            'builtin-geometry-renderer': { techs: [] },
            'builtin-debug-renderer': { techs: [0] },
        };
        return (essentials, name, effect /* , path */) => {
            const info = essentialList[name];
            if (info !== undefined) {
                const partial = Object.assign({}, effect);
                if (info.techs.length) {
                    partial.techniques = info.techs.reduce((acc, cur) => (acc.push(partial.techniques[cur]), acc), []);
                    partial.shaders = partial.shaders.filter((s) =>
                        partial.techniques.some((tech) => tech.passes.some((p) => p.program === s.name)),
                    );
                }
                partial.shaders = partial.shaders.map((s) => {
                    const ns = Object.assign({}, s);
                    return ns;
                });
                partial.techniques = partial.techniques.map((t) => {
                    const nt = Object.assign({}, t);
                    nt.passes = nt.passes.map((p) => {
                        const np = Object.assign({}, p);
                        return np;
                    });
                    return nt;
                });
                essentials.push(partial);
            }
        };
    })();

    const buildEffect = (name, content) => {
        let effect = null;
        if (options.shouldThrow) {
            try {
                effect = shdcLib.buildEffect(name, content);
            } catch (e) {
                console.log(e);
            }
        } else {
            effect = shdcLib.buildEffect(name, content);
        }
        return effect;
    };

    const output = (path, content) => {
        if (options.noOutput) {
            return;
        }
        fs.ensureDirSync(ps.dirname(path));
        fs.writeFileSync(path, content, { encoding: 'utf8' });
        console.log(path + ' saved.');
    };

    // build specified files or directories
    if (options.filesOrDirs.length) {
        const getFileSystemInfo = (file) => {
            try {
                return fs.lstatSync(file);
            } catch (e) {
                console.error(file, 'does not exist!');
            }
            return null;
        };
        const compile = (file) => {
            const name = ps.basename(file, '.effect');
            const content = fs.readFileSync(file, { encoding: 'utf8' });
            closure.dir = ps.dirname(file);
            const effect = buildEffect(name, content);
            if (!effect) {
                return;
            }
            output(
                ps.join(ps.dirname(file), `${name}.ts`),
                '/* eslint-disable */\n' + `export const effect = ${stringifyEffect(effect)};\n`,
            );
        };
        for (let i = 0; i < options.filesOrDirs.length; i++) {
            const file = options.filesOrDirs[i];
            const stats = getFileSystemInfo(file);
            if (!stats) {
                continue;
            }
            if (stats.isDirectory()) {
                addChunks(file);
                fsJetpack.find(file, { matching: '*.effect', recursive: false }).forEach((f) => compile(f));
            } else {
                addChunks(ps.dirname(file)); // this won't work if dir is something like "D:\"
                compile(file);
            }
        }
        process.exit();
    }

    const target = ps.join(options.engineRoot, 'editor/assets');
    const files = fsJetpack.find(target, { matching: '**/*.effect' });
    const debugDir = ps.join(options.engineRoot, 'bin/effects.ts');
    const essentialPath = ps.join(options.engineRoot, 'test/fixtures/builtin-effects.ts');
    const shaderPath = ps.join(options.engineRoot, 'test/fixtures/builtin-glsl4.ts');

    const all = [],
        essentials = [];
    for (let i = 0; i < files.length; ++i) {
        const path = ps.relative(ps.join(target, 'effects'), ps.dirname(files[i])).replace(/\\/g, '/');
        const name = path + (path.length ? '/' : '') + ps.basename(files[i], '.effect');
        const content = fs.readFileSync(files[i], { encoding: 'utf8' });
        const effect = buildEffect(name, content);
        if (!effect) {
            continue;
        }
        all.push(effect);
        addEssential(essentials, name, effect, files[i]);
    }

    output(debugDir, `\nexport const effects = ${stringifyArray(all, stringifyEffect)};\n`);

    // need to separate shader source outputs for engine module clipping to work
    options.essentialOnly = true;
    const effectShaders = essentials.map(({ shaders }) =>
        shaders.map((shader) => {
            const s = shader['glsl4'] || null;
            delete shader['glsl4'];
            return s;
        }),
    );
    /* eslint-disable-next-line */
    const stringifyStrippedSource = (shaders) => stringifyArray(shaders, (src) => stringifySource(src, version));
    output(shaderPath, '/* eslint-disable */\n' + `export const glsl4 = ${stringifyArray(effectShaders, stringifyStrippedSource)};\n`);
    output(
        essentialPath,
        '/* eslint-disable */\n// absolute essential effects\n' +
        `export const effects = ${stringifyArray(essentials, stringifyEffect)};\n`,
    );
}
