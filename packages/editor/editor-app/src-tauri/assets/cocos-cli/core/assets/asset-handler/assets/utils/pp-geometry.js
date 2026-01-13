"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNormalizer = exports.PPGeometry = void 0;
exports.getGfxAttributeName = getGfxAttributeName;
const cc_1 = require("cc");
function getMergedSetSize(s1, s2) {
    let count = s1.size;
    for (const n of s2) {
        if (!s1.has(n)) {
            count++;
        }
    }
    return count;
}
function mergeSets(s1, s2) {
    const res = new Set();
    for (const n of s1) {
        res.add(n);
    }
    for (const n of s2) {
        res.add(n);
    }
    return res;
}
function isStrictSubSet(dom, sub) {
    for (const n of sub) {
        if (!dom.has(n)) {
            return false;
        }
    }
    return true;
}
/**
 * Post-processing geometry.
 */
class PPGeometry {
    static skinningProcess(originals, disableMeshSplit) {
        const geometries = [];
        const materialIndices = [];
        const capacity = cc_1.pipeline.JOINT_UNIFORM_CAPACITY;
        // split sub-mesh if needed
        for (let i = 0; i < originals.length; i++) {
            const geom = originals[i];
            if (disableMeshSplit || !geom._jointSet || geom._jointSet.size <= capacity) {
                geometries.push(geom);
                materialIndices.push(i);
                continue;
            }
            const joints = geom.getAttribute(PPGeometry.StdSemantics.joints).data;
            const indices = geom._getTriangleIndices();
            const splitInfos = EditorExtends.GeometryUtils.splitBasedOnJoints(joints, indices, geom.primitiveMode, capacity);
            if (!splitInfos.length) {
                geometries.push(geom);
                materialIndices.push(i);
                continue;
            }
            for (const info of splitInfos) {
                const vertexList = Array.from(info.indices.reduce((acc, cur) => acc.add(cur), new Set()).values());
                const indices = new (EditorExtends.GeometryUtils.getUintArrayCtor(vertexList.length))(info.indices.length);
                info.indices.forEach((cur, idx) => (indices[idx] = vertexList.indexOf(cur)));
                const newGeom = new PPGeometry(vertexList.length, info.primitiveMode, indices, info.jointSet);
                geom.forEachAttribute((attribute) => {
                    const { semantic } = attribute;
                    const comp = attribute.components;
                    const data = attribute.data;
                    const newData = new data.constructor(vertexList.length * comp);
                    vertexList.forEach((v, idx) => {
                        for (let i = 0; i < comp; i++) {
                            newData[idx * comp + i] = data[v * comp + i];
                        }
                    });
                    newGeom.setAttribute(semantic, newData, comp, attribute.isNormalized);
                    if (attribute.morphs) {
                        const newAttribute = newGeom.getAttribute(semantic);
                        newAttribute.morphs = new Array(attribute.morphs.length);
                        for (let iTarget = 0; iTarget < attribute.morphs.length; ++iTarget) {
                            const comp = 3; // TODO!!
                            const data = attribute.morphs[iTarget];
                            const newMorphData = new data.constructor(vertexList.length * comp);
                            vertexList.forEach((v, idx) => {
                                for (let i = 0; i < comp; ++i) {
                                    newMorphData[idx * comp + i] = data[v * comp + i];
                                }
                            });
                            newAttribute.morphs[iTarget] = newMorphData;
                        }
                    }
                });
                geometries.push(newGeom);
                materialIndices.push(i);
            }
        }
        // reuse buffer if possible
        const jointSets = geometries.reduce((acc, cur) => (cur._jointSet && acc.push(cur._jointSet), acc), []);
        let hasMergablePair = jointSets.length > 1;
        while (hasMergablePair) {
            hasMergablePair = false;
            let minDist = Infinity;
            let p = -1;
            let q = -1;
            for (let i = 0; i < jointSets.length; i++) {
                const s1 = jointSets[i];
                for (let j = i + 1; j < jointSets.length; j++) {
                    const s2 = jointSets[j];
                    const merged = getMergedSetSize(s1, s2);
                    if (merged <= capacity) {
                        const dist = Math.min(Math.abs(merged - s1.size), Math.abs(merged - s2.size));
                        if (dist < minDist) {
                            hasMergablePair = true;
                            minDist = dist;
                            p = i;
                            q = j;
                        }
                    }
                }
            }
            if (hasMergablePair) {
                const s1 = jointSets[p];
                const s2 = jointSets[q];
                jointSets[p] = mergeSets(s1, s2);
                jointSets[q] = jointSets[jointSets.length - 1];
                if (--jointSets.length <= 1) {
                    break;
                }
                minDist = Infinity;
            }
        }
        let jointMaps = jointSets.map((s) => Array.from(s.values()).sort((a, b) => a - b)); // default is radix sort
        if (!jointMaps.length || jointMaps.every((m) => m.length === 1 && !m[0])) {
            jointMaps = undefined;
        }
        else {
            for (let i = 0; i < geometries.length; i++) {
                const geom = geometries[i];
                const joints = geom._jointSet;
                if (!joints) {
                    continue;
                }
                geom._jointMapIndex = jointSets.findIndex((s) => isStrictSubSet(s, joints));
                // the actual mapping in VB is performed at runtime
            }
        }
        return { geometries, materialIndices, jointMaps };
    }
    get vertexCount() {
        return this._vertexCount;
    }
    get indices() {
        return this._indices;
    }
    get primitiveMode() {
        return this._primitiveMode;
    }
    get jointMapIndex() {
        return this._jointMapIndex;
    }
    _vertexCount;
    _vertices = {};
    _primitiveMode;
    _indices;
    _generatedIndices;
    _jointSet;
    _jointMapIndex;
    constructor(vertexCount, primitiveMode, indices, jointSet) {
        this._vertexCount = vertexCount;
        this._primitiveMode = primitiveMode;
        this._jointSet = jointSet;
        if (indices && indices.BYTES_PER_ELEMENT < Uint16Array.BYTES_PER_ELEMENT) {
            indices = Uint16Array.from(indices); // metal doesn't support uint8 indices
        }
        this._indices = indices;
    }
    calculateNormals(storageConstructor = Float32Array) {
        const positions = this._assertAttribute(PPGeometry.StdSemantics.position).data;
        const indices = this._getTriangleIndices();
        const result = new storageConstructor(3 * this._vertexCount);
        return EditorExtends.GeometryUtils.calculateNormals(positions, indices, result);
    }
    calculateTangents(storageConstructor = Float32Array, uvset = 0) {
        const positions = this._assertAttribute(PPGeometry.StdSemantics.position).data;
        const indices = this._getTriangleIndices();
        const normals = this._assertAttribute(PPGeometry.StdSemantics.normal).data;
        const uvs = this._assertAttribute(PPGeometry.StdSemantics.set(PPGeometry.StdSemantics.texcoord, uvset)).data;
        const result = new storageConstructor(4 * this._vertexCount);
        return EditorExtends.GeometryUtils.calculateTangents(positions, indices, normals, uvs, result);
    }
    sanityCheck() {
        if (!this.hasAttribute(PPGeometry.StdSemantics.weights) || !this.hasAttribute(PPGeometry.StdSemantics.joints)) {
            return;
        }
        const weights = this.getAttribute(PPGeometry.StdSemantics.weights);
        const joints = this.getAttribute(PPGeometry.StdSemantics.joints);
        const nVertices = this.vertexCount;
        // convert joints as uint16
        if (joints.data.constructor !== Uint16Array) {
            const newData = new Uint16Array(joints.data.length);
            for (let i = 0; i < newData.length; i++) {
                newData[i] = joints.data[i];
            }
            joints.data = newData;
        }
        // normalize weights
        const [targetSum, offset] = getTargetJointWeightCheckParams(weights.data.constructor);
        for (let iVertex = 0; iVertex < nVertices; ++iVertex) {
            let sum = 0;
            for (let i = 0; i < weights.components; i++) {
                let v = weights.data[weights.components * iVertex + i];
                if (Number.isNaN(v)) {
                    v = weights.data[weights.components * iVertex + i] = targetSum - offset;
                }
                sum += v + offset;
            }
            if (sum !== targetSum && sum !== 0) {
                if (targetSum === 1) {
                    // floating point arithmetics
                    for (let i = 0; i < weights.components; i++) {
                        weights.data[weights.components * iVertex + i] *= targetSum / sum;
                    }
                }
                else {
                    // quantized, need dithering
                    const weightF = [];
                    for (let i = 0; i < weights.components; i++) {
                        weightF.push((weights.data[weights.components * iVertex + i] + offset) / sum);
                    }
                    let ditherAcc = 0;
                    for (let i = 0; i < weights.components; i++) {
                        const w = weightF[i];
                        const wi = (0, cc_1.clamp)(Math.floor((w + ditherAcc) * targetSum), 0, targetSum);
                        ditherAcc = w - wi / targetSum;
                        weights.data[weights.components * iVertex + i] = wi - offset;
                    }
                }
            }
        }
        // prepare joints info
        this._jointSet = new Set();
        this._jointSet.add(0);
        for (let iVertex = 0; iVertex < nVertices; ++iVertex) {
            for (let i = 0; i < joints.components; i++) {
                if (weights.data[joints.components * iVertex + i] > 0) {
                    this._jointSet.add(joints.data[joints.components * iVertex + i]);
                }
                else {
                    joints.data[joints.components * iVertex + i] = 0;
                }
            }
        }
    }
    getAttribute(semantic) {
        return this._vertices[semantic];
    }
    hasAttribute(semantic) {
        return semantic in this._vertices;
    }
    deleteAttribute(semantic) {
        delete this._vertices[semantic];
    }
    setAttribute(semantic, data, components, isNormalized) {
        // const isNormalized = getIsNormalized(semantic, data.constructor as PPGeometryTypedArrayConstructor);
        if (isNormalized === undefined) {
            if (data.constructor === Float32Array) {
                isNormalized = false;
            }
            else if (typeof semantic === 'number') {
                switch (PPGeometry.StdSemantics.decode(semantic).semantic0) {
                    case PPGeometry.StdSemantics.texcoord:
                    case PPGeometry.StdSemantics.color:
                    case PPGeometry.StdSemantics.weights:
                        isNormalized = true;
                        break;
                }
            }
        }
        this._vertices[semantic] = new PPGeometry.Attribute(semantic, data, components, isNormalized);
    }
    *attributes() {
        yield* Object.values(this._vertices);
    }
    forEachAttribute(visitor) {
        Object.values(this._vertices).forEach(visitor);
    }
    /**
     * Reduce the max number of joint influence up to 4(one set).
     * Note, this method may result in non-normalized weights.
     */
    reduceJointInfluences() {
        const countSet = (expected) => Object.values(this._vertices).reduce((previous, attribute) => (previous += equalStdSemantic(attribute.semantic, expected) ? 1 : 0), 0);
        const nJointSets = countSet(PPGeometry.StdSemantics.joints);
        if (nJointSets <= 1) {
            return;
        }
        let weightStorageConstructor;
        for (const attribute of Object.values(this._vertices)) {
            if (equalStdSemantic(attribute.semantic, PPGeometry.StdSemantics.weights)) {
                const constructor = attribute.data.constructor;
                if (!weightStorageConstructor) {
                    weightStorageConstructor = constructor;
                }
                else if (weightStorageConstructor !== constructor) {
                    console.error('All weights attribute should be of same component type.');
                    return; // Do not proceed
                }
            }
        }
        if (!weightStorageConstructor) {
            console.error('The number of joints attribute and weights attribute are not matched.');
            return;
        }
        const nMergedComponents = 4;
        const mergedJoints = new Uint16Array(nMergedComponents * this._vertexCount);
        const mergedWeights = new weightStorageConstructor(nMergedComponents * this._vertexCount);
        for (const attribute of Object.values(this._vertices)) {
            if (!PPGeometry.isStdSemantic(attribute.semantic)) {
                continue;
            }
            const { semantic0, set } = PPGeometry.StdSemantics.decode(attribute.semantic);
            if (semantic0 !== PPGeometry.StdSemantics.joints) {
                continue;
            }
            const weightSemantic = PPGeometry.StdSemantics.set(PPGeometry.StdSemantics.weights, set);
            if (!(weightSemantic in this._vertices)) {
                console.error(`Vertex attribute joints-${set} has no corresponding weights attribute`);
                continue;
            }
            const joints = attribute;
            const weights = this._vertices[weightSemantic].data;
            const nInputComponents = 4;
            for (let iInputComponent = 0; iInputComponent < nInputComponents; ++iInputComponent) {
                for (let iVertex = 0; iVertex < this._vertexCount; ++iVertex) {
                    const iInput = iVertex * nInputComponents + iInputComponent;
                    const weight = weights[iInput];
                    // Here implies and establishes the promise:
                    // merged weights are sorted in descending order.
                    // So the problem is, insert(and replace) a value into a descending-sorted seq.
                    for (let iReplaceComponent = 0; iReplaceComponent < nMergedComponents; ++iReplaceComponent) {
                        const iReplace = iVertex * nMergedComponents + iReplaceComponent;
                        if (weight >= mergedWeights[iReplace]) {
                            const iReplaceLast = (iVertex + 1) * nMergedComponents - 1;
                            for (let i = iReplaceLast - 1; i >= iReplace; --i) {
                                mergedWeights[i + 1] = mergedWeights[i];
                                mergedJoints[i + 1] = mergedJoints[i];
                            }
                            mergedWeights[iReplace] = weight;
                            mergedJoints[iReplace] = joints.data[iInput];
                            break;
                        }
                    }
                }
            }
            this.deleteAttribute(attribute.semantic);
            this.deleteAttribute(weightSemantic);
        }
        for (let iVertex = 0; iVertex < this._vertexCount; ++iVertex) {
            let sum = 0.0;
            for (let iComponent = 0; iComponent < nMergedComponents; ++iComponent) {
                sum += mergedWeights[nMergedComponents * iVertex + iComponent];
            }
            if (sum !== 0.0) {
                for (let iComponent = 0; iComponent < nMergedComponents; ++iComponent) {
                    mergedWeights[nMergedComponents * iVertex + iComponent] /= sum;
                }
            }
        }
        this.setAttribute(PPGeometry.StdSemantics.set(PPGeometry.StdSemantics.joints, 0), mergedJoints, nMergedComponents);
        this.setAttribute(PPGeometry.StdSemantics.set(PPGeometry.StdSemantics.weights, 0), mergedWeights, nMergedComponents);
    }
    _getTriangleIndices() {
        if (this._primitiveMode !== cc_1.gfx.PrimitiveMode.TRIANGLE_LIST) {
            throw new Error('Triangles expected.');
        }
        return (this._indices ||
            this._generatedIndices ||
            (this._generatedIndices = (() => {
                const ctor = this._vertexCount >= 1 << (Uint16Array.BYTES_PER_ELEMENT * 8) ? Uint32Array : Uint16Array;
                const indices = new ctor(this._vertexCount);
                for (let i = 0; i < this._vertexCount; ++i) {
                    indices[i] = i;
                }
                return indices;
            })()));
    }
    _assertAttribute(semantic) {
        if (!this.hasAttribute(semantic)) {
            let semanticRep;
            if (!PPGeometry.isStdSemantic(semantic)) {
                semanticRep = semantic;
            }
            else {
                const { semantic0, set } = PPGeometry.StdSemantics.decode(semantic);
                semanticRep = `${PPGeometry.StdSemantics[semantic0]}`;
                if (set !== 0) {
                    semanticRep += `(set ${set})`;
                }
            }
            throw new Error(`${semanticRep} attribute is expect but not present`);
        }
        else {
            return this.getAttribute(semantic);
        }
    }
}
exports.PPGeometry = PPGeometry;
// returns [ targetSum, offset ]
function getTargetJointWeightCheckParams(ctor) {
    switch (ctor) {
        case Int8Array:
            return [0xff, 0x80];
        case Uint8Array:
            return [0xff, 0];
        case Int16Array:
            return [0xffff, 0x8000];
        case Uint16Array:
            return [0xffff, 0];
        case Int32Array:
            return [0xffffffff, 0x80000000];
        case Uint32Array:
            return [0xffffffff, 0];
        case Float32Array:
            return [1, 0];
    }
    return [1, 0];
}
(function (PPGeometry) {
    let StdSemantics;
    (function (StdSemantics) {
        StdSemantics[StdSemantics["position"] = 0] = "position";
        StdSemantics[StdSemantics["normal"] = 1] = "normal";
        StdSemantics[StdSemantics["texcoord"] = 2] = "texcoord";
        StdSemantics[StdSemantics["tangent"] = 3] = "tangent";
        StdSemantics[StdSemantics["joints"] = 4] = "joints";
        StdSemantics[StdSemantics["weights"] = 5] = "weights";
        StdSemantics[StdSemantics["color"] = 6] = "color";
    })(StdSemantics = PPGeometry.StdSemantics || (PPGeometry.StdSemantics = {}));
    (function (StdSemantics) {
        function set(semantic, set) {
            return (set << 4) + semantic;
        }
        StdSemantics.set = set;
        function decode(semantic) {
            return {
                semantic0: (semantic & 0xf),
                set: semantic >> 4,
            };
        }
        StdSemantics.decode = decode;
    })(StdSemantics = PPGeometry.StdSemantics || (PPGeometry.StdSemantics = {}));
    function isStdSemantic(semantic) {
        return typeof semantic === 'number';
    }
    PPGeometry.isStdSemantic = isStdSemantic;
    class Attribute {
        semantic;
        data;
        components;
        isNormalized;
        morphs = null;
        constructor(semantic, data, components, isNormalized = false) {
            this.semantic = semantic;
            this.data = data;
            this.components = components;
            this.isNormalized = isNormalized;
        }
        getGFXFormat() {
            const map2 = attributeFormatMap.get(this.data.constructor);
            if (map2 !== undefined) {
                if (this.components in map2) {
                    return map2[this.components];
                }
            }
            throw new Error('No corresponding gfx format for attribute.');
        }
    }
    PPGeometry.Attribute = Attribute;
})(PPGeometry || (exports.PPGeometry = PPGeometry = {}));
const stdSemanticInfoMap = {
    [PPGeometry.StdSemantics.position]: {
        gfxAttributeName: cc_1.gfx.AttributeName.ATTR_POSITION,
        components: 3,
    },
    [PPGeometry.StdSemantics.normal]: {
        gfxAttributeName: cc_1.gfx.AttributeName.ATTR_NORMAL,
        components: 3,
    },
    [PPGeometry.StdSemantics.texcoord]: {
        gfxAttributeName: cc_1.gfx.AttributeName.ATTR_TEX_COORD,
        components: 2,
        multisets: {
            1: cc_1.gfx.AttributeName.ATTR_TEX_COORD1,
            2: cc_1.gfx.AttributeName.ATTR_TEX_COORD2,
            3: cc_1.gfx.AttributeName.ATTR_TEX_COORD3,
            4: cc_1.gfx.AttributeName.ATTR_TEX_COORD4,
            5: cc_1.gfx.AttributeName.ATTR_TEX_COORD5,
            6: cc_1.gfx.AttributeName.ATTR_TEX_COORD6,
            7: cc_1.gfx.AttributeName.ATTR_TEX_COORD7,
            8: cc_1.gfx.AttributeName.ATTR_TEX_COORD8,
        },
    },
    [PPGeometry.StdSemantics.tangent]: {
        gfxAttributeName: cc_1.gfx.AttributeName.ATTR_TANGENT,
        components: 4,
    },
    [PPGeometry.StdSemantics.joints]: {
        gfxAttributeName: cc_1.gfx.AttributeName.ATTR_JOINTS,
        components: 4,
    },
    [PPGeometry.StdSemantics.weights]: {
        gfxAttributeName: cc_1.gfx.AttributeName.ATTR_WEIGHTS,
        components: 4,
    },
    [PPGeometry.StdSemantics.color]: {
        gfxAttributeName: cc_1.gfx.AttributeName.ATTR_COLOR,
        components: [3, 4],
    },
};
const attributeFormatMap = new Map([
    [
        Int8Array,
        {
            1: cc_1.gfx.Format.R8SN,
            2: cc_1.gfx.Format.RG8SN,
            3: cc_1.gfx.Format.RGB8SN,
            4: cc_1.gfx.Format.RGBA8SN,
        },
    ],
    [
        Uint8Array,
        {
            1: cc_1.gfx.Format.R8,
            2: cc_1.gfx.Format.RG8,
            3: cc_1.gfx.Format.RGB8,
            4: cc_1.gfx.Format.RGBA8,
        },
    ],
    [
        Int16Array,
        {
            1: cc_1.gfx.Format.R16I,
            2: cc_1.gfx.Format.RG16I,
            3: cc_1.gfx.Format.RGB16I,
            4: cc_1.gfx.Format.RGBA16I,
        },
    ],
    [
        Uint16Array,
        {
            1: cc_1.gfx.Format.R16UI,
            2: cc_1.gfx.Format.RG16UI,
            3: cc_1.gfx.Format.RGB16UI,
            4: cc_1.gfx.Format.RGBA16UI,
        },
    ],
    [
        Int32Array,
        {
            1: cc_1.gfx.Format.R32I,
            2: cc_1.gfx.Format.RG32I,
            3: cc_1.gfx.Format.RGB32I,
            4: cc_1.gfx.Format.RGBA32I,
        },
    ],
    [
        Uint32Array,
        {
            1: cc_1.gfx.Format.R32UI,
            2: cc_1.gfx.Format.RG32UI,
            3: cc_1.gfx.Format.RGB32UI,
            4: cc_1.gfx.Format.RGBA32UI,
        },
    ],
    [
        Float32Array,
        {
            1: cc_1.gfx.Format.R32F,
            2: cc_1.gfx.Format.RG32F,
            3: cc_1.gfx.Format.RGB32F,
            4: cc_1.gfx.Format.RGBA32F,
        },
    ],
]);
/**
 * @returns The corresponding GFX attribute name.
 * @throws If the attribute **is standard semantic** but is not a valid GFX attribute name:
 * - It has a different number of component which is not permitted.
 * - Its set count beyond how many that kind of GFX attributes can proceed.
 */
function getGfxAttributeName(attribute) {
    const { semantic } = attribute;
    let gfxAttributeName;
    if (!PPGeometry.isStdSemantic(semantic)) {
        gfxAttributeName = semantic;
    }
    else {
        // Validate standard semantic.
        const { semantic0, set } = PPGeometry.StdSemantics.decode(semantic);
        const semanticInfo = stdSemanticInfoMap[semantic0];
        if (!(Array.isArray(semanticInfo.components)
            ? semanticInfo.components.includes(attribute.components)
            : semanticInfo.components === attribute.components)) {
            throw new Error(`Mismatched ${PPGeometry.StdSemantics[semantic0]} components, expect ${semanticInfo.components}.`);
        }
        if (set === 0) {
            gfxAttributeName = semanticInfo.gfxAttributeName;
        }
        else if (semanticInfo.multisets && set in semanticInfo.multisets) {
            gfxAttributeName = semanticInfo.multisets[set];
        }
        else {
            throw new Error(`${PPGeometry.StdSemantics[semantic0]} doesn't allow set ${set}.`);
        }
    }
    return gfxAttributeName;
}
/**
 * Get the normalizer which normalize the integers of specified type array
 * into [0, 1](for unsigned integers) or [-1, 1](for signed integers).
 * The normalization is performed as described in:
 * https://www.khronos.org/opengl/wiki/Normalized_Integer
 * @returns The normalizer, or `undefined` if no corresponding normalizer.
 */
exports.getNormalizer = (() => {
    const U8_MAX = 2 ** 8 - 1;
    const U16_MAX = 2 ** 16 - 1;
    const U32_MAX = 2 ** 32 - 1;
    const I8_MAX = 2 ** (8 - 1) - 1;
    const I16_MAX = 2 ** (16 - 1) - 1;
    const I32_MAX = 2 ** (32 - 1) - 1;
    const u8 = (value) => value / U8_MAX;
    const u16 = (value) => value / U16_MAX;
    const u32 = (value) => value / U32_MAX;
    const i8 = (value) => Math.max(value / I8_MAX, -1);
    const i16 = (value) => Math.max(value / I16_MAX, -1);
    const i32 = (value) => Math.max(value / I32_MAX, -1);
    return (typedArray) => {
        switch (true) {
            case typedArray instanceof Int8Array:
                return i8;
            case typedArray instanceof Int16Array:
                return i16;
            case typedArray instanceof Int32Array:
                return i32;
            case typedArray instanceof Uint8Array:
                return u8;
            case typedArray instanceof Uint16Array:
                return u16;
            case typedArray instanceof Uint32Array:
                return u32;
            default:
                return null;
        }
    };
})();
const equalStdSemantic = (semantic, expected) => PPGeometry.isStdSemantic(semantic) && PPGeometry.StdSemantics.decode(semantic).semantic0 === expected;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHAtZ2VvbWV0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvdXRpbHMvcHAtZ2VvbWV0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBcW9CQSxrREF5QkM7QUE5cEJELDJCQUEwQztBQXdCMUMsU0FBUyxnQkFBZ0IsQ0FBQyxFQUFlLEVBQUUsRUFBZTtJQUN0RCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0lBQ3BCLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1osQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBQ0QsU0FBUyxTQUFTLENBQUMsRUFBZSxFQUFFLEVBQWU7SUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUM5QixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZixDQUFDO0lBQ0QsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUNqQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQUNELFNBQVMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsR0FBZ0I7SUFDdEQsS0FBSyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2QsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztJ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TyxHQUFHLENBQUM7WUFDZixLQUFLLFVBQVUsWUFBWSxVQUFVO2dCQUNqQyxPQUFPLEdBQUcsQ0FBQztZQUNmLEtBQUssVUFBVSxZQUFZLFVBQVU7Z0JBQ2pDLE9BQU8sRUFBRSxDQUFDO1lBQ2QsS0FBSyxVQUFVLFlBQVksV0FBVztnQkFDbEMsT0FBTyxHQUFHLENBQUM7WUFDZixLQUFLLFVBQVUsWUFBWSxXQUFXO2dCQUNsQyxPQUFPLEdBQUcsQ0FBQztZQUNmO2dCQUNJLE9BQU8sSUFBSyxDQUFDO1FBQ3JCLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFFBQTZCLEVBQUUsUUFBaUMsRUFBRSxFQUFFLENBQzFGLFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdmeCwgcGlwZWxpbmUsIGNsYW1wIH0gZnJvbSAnY2MnO1xyXG5cclxuZGVjbGFyZSBjb25zdCBFZGl0b3JFeHRlbmRzOiBhbnk7XHJcblxyXG5leHBvcnQgdHlwZSBQUEdlb21ldHJ5VHlwZWRBcnJheUNvbnN0cnVjdG9yID1cclxuICAgIHwgdHlwZW9mIEludDhBcnJheVxyXG4gICAgfCB0eXBlb2YgVWludDhBcnJheVxyXG4gICAgfCB0eXBlb2YgSW50MTZBcnJheVxyXG4gICAgfCB0eXBlb2YgVWludDE2QXJyYXlcclxuICAgIHwgdHlwZW9mIEludDMyQXJyYXlcclxuICAgIHwgdHlwZW9mIFVpbnQzMkFycmF5XHJcbiAgICB8IHR5cGVvZiBGbG9hdDMyQXJyYXlcclxuICAgIHwgdHlwZW9mIEZsb2F0NjRBcnJheTtcclxuXHJcbmV4cG9ydCB0eXBlIFBQR2VvbWV0cnlUeXBlZEFycmF5ID1cclxuICAgIHwgSW50OEFycmF5XHJcbiAgICB8IFVpbnQ4QXJyYXlcclxuICAgIHwgSW50MTZBcnJheVxyXG4gICAgfCBVaW50MTZBcnJheVxyXG4gICAgfCBJbnQzMkFycmF5XHJcbiAgICB8IFVpbnQzMkFycmF5XHJcbiAgICB8IEZsb2F0MzJBcnJheVxyXG4gICAgfCBGbG9hdDY0QXJyYXk7XHJcblxyXG5mdW5jdGlvbiBnZXRNZXJnZWRTZXRTaXplKHMxOiBTZXQ8bnVtYmVyPiwgczI6IFNldDxudW1iZXI+KSB7XHJcbiAgICBsZXQgY291bnQgPSBzMS5zaXplO1xyXG4gICAgZm9yIChjb25zdCBuIG9mIHMyKSB7XHJcbiAgICAgICAgaWYgKCFzMS5oYXMobikpIHtcclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY291bnQ7XHJcbn1cclxuZnVuY3Rpb24gbWVyZ2VTZXRzKHMxOiBTZXQ8bnVtYmVyPiwgczI6IFNldDxudW1iZXI+KSB7XHJcbiAgICBjb25zdCByZXMgPSBuZXcgU2V0PG51bWJlcj4oKTtcclxuICAgIGZvciAoY29uc3QgbiBvZiBzMSkge1xyXG4gICAgICAgIHJlcy5hZGQobik7XHJcbiAgICB9XHJcbiAgICBmb3IgKGNvbnN0IG4gb2YgczIpIHtcclxuICAgICAgICByZXMuYWRkKG4pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxufVxyXG5mdW5jdGlvbiBpc1N0cmljdFN1YlNldChkb206IFNldDxudW1iZXI+LCBzdWI6IFNldDxudW1iZXI+KSB7XHJcbiAgICBmb3IgKGNvbnN0IG4gb2Ygc3ViKSB7XHJcbiAgICAgICAgaWYgKCFkb20uaGFzKG4pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBvc3QtcHJvY2Vzc2luZyBnZW9tZXRyeS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBQUEdlb21ldHJ5IHtcclxuICAgIHB1YmxpYyBzdGF0aWMgc2tpbm5pbmdQcm9jZXNzKG9yaWdpbmFsczogUFBHZW9tZXRyeVtdLCBkaXNhYmxlTWVzaFNwbGl0OiBib29sZWFuIHwgdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc3QgZ2VvbWV0cmllczogUFBHZW9tZXRyeVtdID0gW107XHJcbiAgICAgICAgY29uc3QgbWF0ZXJpYWxJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IGNhcGFjaXR5ID0gcGlwZWxpbmUuSk9JTlRfVU5JRk9STV9DQVBBQ0lUWTtcclxuICAgICAgICAvLyBzcGxpdCBzdWItbWVzaCBpZiBuZWVkZWRcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yaWdpbmFscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBnZW9tID0gb3JpZ2luYWxzW2ldO1xyXG4gICAgICAgICAgICBpZiAoZGlzYWJsZU1lc2hTcGxpdCB8fCAhZ2VvbS5fam9pbnRTZXQgfHwgZ2VvbS5fam9pbnRTZXQuc2l6ZSA8PSBjYXBhY2l0eSkge1xyXG4gICAgICAgICAgICAgICAgZ2VvbWV0cmllcy5wdXNoKGdlb20pO1xyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWxJbmRpY2VzLnB1c2goaSk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBqb2ludHMgPSBnZW9tLmdldEF0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5qb2ludHMpLmRhdGE7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGljZXMgPSBnZW9tLl9nZXRUcmlhbmdsZUluZGljZXMoKTtcclxuICAgICAgICAgICAgY29uc3Qgc3BsaXRJbmZvcyA9IEVkaXRvckV4dGVuZHMuR2VvbWV0cnlVdGlscy5zcGxpdEJhc2VkT25Kb2ludHMoam9pbnRzLCBpbmRpY2VzLCBnZW9tLnByaW1pdGl2ZU1vZGUsIGNhcGFjaXR5KTtcclxuICAgICAgICAgICAgaWYgKCFzcGxpdEluZm9zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgZ2VvbWV0cmllcy5wdXNoKGdlb20pO1xyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWxJbmRpY2VzLnB1c2goaSk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGluZm8gb2Ygc3BsaXRJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmVydGV4TGlzdCA9IEFycmF5LmZyb20oaW5mby5pbmRpY2VzLnJlZHVjZSgoYWNjOiBhbnksIGN1cjogYW55KSA9PiBhY2MuYWRkKGN1ciksIG5ldyBTZXQ8bnVtYmVyPigpKS52YWx1ZXMoKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRpY2VzID0gbmV3IChFZGl0b3JFeHRlbmRzLkdlb21ldHJ5VXRpbHMuZ2V0VWludEFycmF5Q3Rvcih2ZXJ0ZXhMaXN0Lmxlbmd0aCkpKGluZm8uaW5kaWNlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgaW5mby5pbmRpY2VzLmZvckVhY2goKGN1cjogYW55LCBpZHg6IGFueSkgPT4gKGluZGljZXNbaWR4XSA9IHZlcnRleExpc3QuaW5kZXhPZihjdXIpKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdHZW9tID0gbmV3IFBQR2VvbWV0cnkodmVydGV4TGlzdC5sZW5ndGgsIGluZm8ucHJpbWl0aXZlTW9kZSwgaW5kaWNlcywgaW5mby5qb2ludFNldCk7XHJcbiAgICAgICAgICAgICAgICBnZW9tLmZvckVhY2hBdHRyaWJ1dGUoKGF0dHJpYnV0ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgc2VtYW50aWMgfSA9IGF0dHJpYnV0ZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wID0gYXR0cmlidXRlLmNvbXBvbmVudHM7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF0dHJpYnV0ZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RhdGEgPSBuZXcgKGRhdGEuY29uc3RydWN0b3IgYXMgUFBHZW9tZXRyeVR5cGVkQXJyYXlDb25zdHJ1Y3RvcikodmVydGV4TGlzdC5sZW5ndGggKiBjb21wKTtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJ0ZXhMaXN0LmZvckVhY2goKHY6IGFueSwgaWR4OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0RhdGFbaWR4ICogY29tcCArIGldID0gZGF0YVt2ICogY29tcCArIGldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3R2VvbS5zZXRBdHRyaWJ1dGUoc2VtYW50aWMsIG5ld0RhdGEsIGNvbXAsIGF0dHJpYnV0ZS5pc05vcm1hbGl6ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGUubW9ycGhzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0F0dHJpYnV0ZSA9IG5ld0dlb20uZ2V0QXR0cmlidXRlKHNlbWFudGljKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXR0cmlidXRlLm1vcnBocyA9IG5ldyBBcnJheShhdHRyaWJ1dGUubW9ycGhzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGlUYXJnZXQgPSAwOyBpVGFyZ2V0IDwgYXR0cmlidXRlLm1vcnBocy5sZW5ndGg7ICsraVRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcCA9IDM7IC8vIFRPRE8hIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF0dHJpYnV0ZS5tb3JwaHNbaVRhcmdldF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdNb3JwaERhdGEgPSBuZXcgKGRhdGEuY29uc3RydWN0b3IgYXMgUFBHZW9tZXRyeVR5cGVkQXJyYXlDb25zdHJ1Y3RvcikodmVydGV4TGlzdC5sZW5ndGggKiBjb21wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRleExpc3QuZm9yRWFjaCgodjogYW55LCBpZHg6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld01vcnBoRGF0YVtpZHggKiBjb21wICsgaV0gPSBkYXRhW3YgKiBjb21wICsgaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdHRyaWJ1dGUubW9ycGhzW2lUYXJnZXRdID0gbmV3TW9ycGhEYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBnZW9tZXRyaWVzLnB1c2gobmV3R2VvbSk7XHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbEluZGljZXMucHVzaChpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZXVzZSBidWZmZXIgaWYgcG9zc2libGVcclxuICAgICAgICBjb25zdCBqb2ludFNldHMgPSBnZW9tZXRyaWVzLnJlZHVjZSgoYWNjLCBjdXIpID0+IChjdXIuX2pvaW50U2V0ICYmIGFjYy5wdXNoKGN1ci5fam9pbnRTZXQpLCBhY2MpLCBbXSBhcyBTZXQ8bnVtYmVyPltdKTtcclxuICAgICAgICBsZXQgaGFzTWVyZ2FibGVQYWlyID0gam9pbnRTZXRzLmxlbmd0aCA+IDE7XHJcbiAgICAgICAgd2hpbGUgKGhhc01lcmdhYmxlUGFpcikge1xyXG4gICAgICAgICAgICBoYXNNZXJnYWJsZVBhaXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IG1pbkRpc3QgPSBJbmZpbml0eTtcclxuICAgICAgICAgICAgbGV0IHAgPSAtMTtcclxuICAgICAgICAgICAgbGV0IHEgPSAtMTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBqb2ludFNldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHMxID0gam9pbnRTZXRzW2ldO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgam9pbnRTZXRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgczIgPSBqb2ludFNldHNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gZ2V0TWVyZ2VkU2V0U2l6ZShzMSwgczIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXJnZWQgPD0gY2FwYWNpdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlzdCA9IE1hdGgubWluKE1hdGguYWJzKG1lcmdlZCAtIHMxLnNpemUpLCBNYXRoLmFicyhtZXJnZWQgLSBzMi5zaXplKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0IDwgbWluRGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzTWVyZ2FibGVQYWlyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpc3QgPSBkaXN0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxID0gajtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGFzTWVyZ2FibGVQYWlyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzMSA9IGpvaW50U2V0c1twXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHMyID0gam9pbnRTZXRzW3FdO1xyXG4gICAgICAgICAgICAgICAgam9pbnRTZXRzW3BdID0gbWVyZ2VTZXRzKHMxLCBzMik7XHJcbiAgICAgICAgICAgICAgICBqb2ludFNldHNbcV0gPSBqb2ludFNldHNbam9pbnRTZXRzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgaWYgKC0tam9pbnRTZXRzLmxlbmd0aCA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtaW5EaXN0ID0gSW5maW5pdHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGpvaW50TWFwcyA9IGpvaW50U2V0cy5tYXAoKHMpID0+IEFycmF5LmZyb20ocy52YWx1ZXMoKSkuc29ydCgoYSwgYikgPT4gYSAtIGIpKTsgLy8gZGVmYXVsdCBpcyByYWRpeCBzb3J0XHJcbiAgICAgICAgaWYgKCFqb2ludE1hcHMubGVuZ3RoIHx8IGpvaW50TWFwcy5ldmVyeSgobSkgPT4gbS5sZW5ndGggPT09IDEgJiYgIW1bMF0pKSB7XHJcbiAgICAgICAgICAgIGpvaW50TWFwcyA9IHVuZGVmaW5lZCE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnZW9tZXRyaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBnZW9tID0gZ2VvbWV0cmllc1tpXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGpvaW50cyA9IGdlb20uX2pvaW50U2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKCFqb2ludHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGdlb20uX2pvaW50TWFwSW5kZXggPSBqb2ludFNldHMuZmluZEluZGV4KChzKSA9PiBpc1N0cmljdFN1YlNldChzLCBqb2ludHMpKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgbWFwcGluZyBpbiBWQiBpcyBwZXJmb3JtZWQgYXQgcnVudGltZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IGdlb21ldHJpZXMsIG1hdGVyaWFsSW5kaWNlcywgam9pbnRNYXBzIH07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZlcnRleENvdW50KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92ZXJ0ZXhDb3VudDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaW5kaWNlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5kaWNlcztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcHJpbWl0aXZlTW9kZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJpbWl0aXZlTW9kZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgam9pbnRNYXBJbmRleCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fam9pbnRNYXBJbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF92ZXJ0ZXhDb3VudDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfdmVydGljZXM6IFJlY29yZDxzdHJpbmcsIFBQR2VvbWV0cnkuQXR0cmlidXRlPiA9IHt9O1xyXG4gICAgcHJpdmF0ZSBfcHJpbWl0aXZlTW9kZTogZ2Z4LlByaW1pdGl2ZU1vZGU7XHJcbiAgICBwcml2YXRlIF9pbmRpY2VzPzogUFBHZW9tZXRyeVR5cGVkQXJyYXk7XHJcbiAgICBwcml2YXRlIF9nZW5lcmF0ZWRJbmRpY2VzPzogUFBHZW9tZXRyeVR5cGVkQXJyYXk7XHJcbiAgICBwcml2YXRlIF9qb2ludFNldD86IFNldDxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBfam9pbnRNYXBJbmRleD86IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih2ZXJ0ZXhDb3VudDogbnVtYmVyLCBwcmltaXRpdmVNb2RlOiBnZnguUHJpbWl0aXZlTW9kZSwgaW5kaWNlcz86IFBQR2VvbWV0cnlUeXBlZEFycmF5LCBqb2ludFNldD86IFNldDxudW1iZXI+KSB7XHJcbiAgICAgICAgdGhpcy5fdmVydGV4Q291bnQgPSB2ZXJ0ZXhDb3VudDtcclxuICAgICAgICB0aGlzLl9wcmltaXRpdmVNb2RlID0gcHJpbWl0aXZlTW9kZTtcclxuICAgICAgICB0aGlzLl9qb2ludFNldCA9IGpvaW50U2V0O1xyXG4gICAgICAgIGlmIChpbmRpY2VzICYmIGluZGljZXMuQllURVNfUEVSX0VMRU1FTlQgPCBVaW50MTZBcnJheS5CWVRFU19QRVJfRUxFTUVOVCkge1xyXG4gICAgICAgICAgICBpbmRpY2VzID0gVWludDE2QXJyYXkuZnJvbShpbmRpY2VzKTsgLy8gbWV0YWwgZG9lc24ndCBzdXBwb3J0IHVpbnQ4IGluZGljZXNcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5kaWNlcyA9IGluZGljZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNhbGN1bGF0ZU5vcm1hbHMoc3RvcmFnZUNvbnN0cnVjdG9yOiBQUEdlb21ldHJ5VHlwZWRBcnJheUNvbnN0cnVjdG9yID0gRmxvYXQzMkFycmF5KSB7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gdGhpcy5fYXNzZXJ0QXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLnBvc2l0aW9uKS5kYXRhO1xyXG4gICAgICAgIGNvbnN0IGluZGljZXMgPSB0aGlzLl9nZXRUcmlhbmdsZUluZGljZXMoKTtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgc3RvcmFnZUNvbnN0cnVjdG9yKDMgKiB0aGlzLl92ZXJ0ZXhDb3VudCk7XHJcbiAgICAgICAgcmV0dXJuIEVkaXRvckV4dGVuZHMuR2VvbWV0cnlVdGlscy5jYWxjdWxhdGVOb3JtYWxzKHBvc2l0aW9ucywgaW5kaWNlcywgcmVzdWx0KSBhcyBQUEdlb21ldHJ5VHlwZWRBcnJheTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2FsY3VsYXRlVGFuZ2VudHMoc3RvcmFnZUNvbnN0cnVjdG9yOiBQUEdlb21ldHJ5VHlwZWRBcnJheUNvbnN0cnVjdG9yID0gRmxvYXQzMkFycmF5LCB1dnNldCA9IDApIHtcclxuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSB0aGlzLl9hc3NlcnRBdHRyaWJ1dGUoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3MucG9zaXRpb24pLmRhdGE7XHJcbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IHRoaXMuX2dldFRyaWFuZ2xlSW5kaWNlcygpO1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbHMgPSB0aGlzLl9hc3NlcnRBdHRyaWJ1dGUoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Mubm9ybWFsKS5kYXRhO1xyXG4gICAgICAgIGNvbnN0IHV2cyA9IHRoaXMuX2Fzc2VydEF0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5zZXQoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3MudGV4Y29vcmQsIHV2c2V0KSkuZGF0YTtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgc3RvcmFnZUNvbnN0cnVjdG9yKDQgKiB0aGlzLl92ZXJ0ZXhDb3VudCk7XHJcbiAgICAgICAgcmV0dXJuIEVkaXRvckV4dGVuZHMuR2VvbWV0cnlVdGlscy5jYWxjdWxhdGVUYW5nZW50cyhwb3NpdGlvbnMsIGluZGljZXMsIG5vcm1hbHMsIHV2cywgcmVzdWx0KSBhcyBQUEdlb21ldHJ5VHlwZWRBcnJheTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2FuaXR5Q2hlY2soKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy53ZWlnaHRzKSB8fCAhdGhpcy5oYXNBdHRyaWJ1dGUoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Muam9pbnRzKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHdlaWdodHMgPSB0aGlzLmdldEF0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy53ZWlnaHRzKTtcclxuICAgICAgICBjb25zdCBqb2ludHMgPSB0aGlzLmdldEF0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5qb2ludHMpO1xyXG4gICAgICAgIGNvbnN0IG5WZXJ0aWNlcyA9IHRoaXMudmVydGV4Q291bnQ7XHJcbiAgICAgICAgLy8gY29udmVydCBqb2ludHMgYXMgdWludDE2XHJcbiAgICAgICAgaWYgKGpvaW50cy5kYXRhLmNvbnN0cnVjdG9yICE9PSBVaW50MTZBcnJheSkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdEYXRhID0gbmV3IFVpbnQxNkFycmF5KGpvaW50cy5kYXRhLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3RGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbmV3RGF0YVtpXSA9IGpvaW50cy5kYXRhW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGpvaW50cy5kYXRhID0gbmV3RGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbm9ybWFsaXplIHdlaWdodHNcclxuICAgICAgICBjb25zdCBbdGFyZ2V0U3VtLCBvZmZzZXRdID0gZ2V0VGFyZ2V0Sm9pbnRXZWlnaHRDaGVja1BhcmFtcyh3ZWlnaHRzLmRhdGEuY29uc3RydWN0b3IgYXMgUFBHZW9tZXRyeVR5cGVkQXJyYXlDb25zdHJ1Y3Rvcik7XHJcbiAgICAgICAgZm9yIChsZXQgaVZlcnRleCA9IDA7IGlWZXJ0ZXggPCBuVmVydGljZXM7ICsraVZlcnRleCkge1xyXG4gICAgICAgICAgICBsZXQgc3VtID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3ZWlnaHRzLmNvbXBvbmVudHM7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB3ZWlnaHRzLmRhdGFbd2VpZ2h0cy5jb21wb25lbnRzICogaVZlcnRleCArIGldO1xyXG4gICAgICAgICAgICAgICAgaWYgKE51bWJlci5pc05hTih2KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYgPSB3ZWlnaHRzLmRhdGFbd2VpZ2h0cy5jb21wb25lbnRzICogaVZlcnRleCArIGldID0gdGFyZ2V0U3VtIC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3VtICs9IHYgKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN1bSAhPT0gdGFyZ2V0U3VtICYmIHN1bSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldFN1bSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZsb2F0aW5nIHBvaW50IGFyaXRobWV0aWNzXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3ZWlnaHRzLmNvbXBvbmVudHM7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHRzLmRhdGFbd2VpZ2h0cy5jb21wb25lbnRzICogaVZlcnRleCArIGldICo9IHRhcmdldFN1bSAvIHN1bTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHF1YW50aXplZCwgbmVlZCBkaXRoZXJpbmdcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB3ZWlnaHRGID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3ZWlnaHRzLmNvbXBvbmVudHM7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHRGLnB1c2goKHdlaWdodHMuZGF0YVt3ZWlnaHRzLmNvbXBvbmVudHMgKiBpVmVydGV4ICsgaV0gKyBvZmZzZXQpIC8gc3VtKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpdGhlckFjYyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3ZWlnaHRzLmNvbXBvbmVudHM7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3ID0gd2VpZ2h0RltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2kgPSBjbGFtcChNYXRoLmZsb29yKCh3ICsgZGl0aGVyQWNjKSAqIHRhcmdldFN1bSksIDAsIHRhcmdldFN1bSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpdGhlckFjYyA9IHcgLSB3aSAvIHRhcmdldFN1bTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0cy5kYXRhW3dlaWdodHMuY29tcG9uZW50cyAqIGlWZXJ0ZXggKyBpXSA9IHdpIC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwcmVwYXJlIGpvaW50cyBpbmZvXHJcbiAgICAgICAgdGhpcy5fam9pbnRTZXQgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgdGhpcy5fam9pbnRTZXQuYWRkKDApO1xyXG4gICAgICAgIGZvciAobGV0IGlWZXJ0ZXggPSAwOyBpVmVydGV4IDwgblZlcnRpY2VzOyArK2lWZXJ0ZXgpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBqb2ludHMuY29tcG9uZW50czsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2VpZ2h0cy5kYXRhW2pvaW50cy5jb21wb25lbnRzICogaVZlcnRleCArIGldID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2pvaW50U2V0LmFkZChqb2ludHMuZGF0YVtqb2ludHMuY29tcG9uZW50cyAqIGlWZXJ0ZXggKyBpXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGpvaW50cy5kYXRhW2pvaW50cy5jb21wb25lbnRzICogaVZlcnRleCArIGldID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QXR0cmlidXRlKHNlbWFudGljOiBQUEdlb21ldHJ5LlNlbWFudGljKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlcnRpY2VzW3NlbWFudGljXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzQXR0cmlidXRlKHNlbWFudGljOiBQUEdlb21ldHJ5LlNlbWFudGljKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbWFudGljIGluIHRoaXMuX3ZlcnRpY2VzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWxldGVBdHRyaWJ1dGUoc2VtYW50aWM6IFBQR2VvbWV0cnkuU2VtYW50aWMpIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5fdmVydGljZXNbc2VtYW50aWNdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRBdHRyaWJ1dGUoc2VtYW50aWM6IFBQR2VvbWV0cnkuU2VtYW50aWMsIGRhdGE6IFBQR2VvbWV0cnlUeXBlZEFycmF5LCBjb21wb25lbnRzOiBudW1iZXIsIGlzTm9ybWFsaXplZD86IGJvb2xlYW4pIHtcclxuICAgICAgICAvLyBjb25zdCBpc05vcm1hbGl6ZWQgPSBnZXRJc05vcm1hbGl6ZWQoc2VtYW50aWMsIGRhdGEuY29uc3RydWN0b3IgYXMgUFBHZW9tZXRyeVR5cGVkQXJyYXlDb25zdHJ1Y3Rvcik7XHJcbiAgICAgICAgaWYgKGlzTm9ybWFsaXplZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIGlzTm9ybWFsaXplZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZW1hbnRpYyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3MuZGVjb2RlKHNlbWFudGljKS5zZW1hbnRpYzApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLnRleGNvb3JkOlxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3MuY29sb3I6XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy53ZWlnaHRzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc05vcm1hbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl92ZXJ0aWNlc1tzZW1hbnRpY10gPSBuZXcgUFBHZW9tZXRyeS5BdHRyaWJ1dGUoc2VtYW50aWMsIGRhdGEsIGNvbXBvbmVudHMsIGlzTm9ybWFsaXplZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljICphdHRyaWJ1dGVzKCkge1xyXG4gICAgICAgIHlpZWxkKiBPYmplY3QudmFsdWVzKHRoaXMuX3ZlcnRpY2VzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZm9yRWFjaEF0dHJpYnV0ZSh2aXNpdG9yOiAoYXR0cmlidXRlOiBQUEdlb21ldHJ5LkF0dHJpYnV0ZSkgPT4gdm9pZCkge1xyXG4gICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5fdmVydGljZXMpLmZvckVhY2godmlzaXRvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWR1Y2UgdGhlIG1heCBudW1iZXIgb2Ygam9pbnQgaW5mbHVlbmNlIHVwIHRvIDQob25lIHNldCkuXHJcbiAgICAgKiBOb3RlLCB0aGlzIG1ldGhvZCBtYXkgcmVzdWx0IGluIG5vbi1ub3JtYWxpemVkIHdlaWdodHMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZWR1Y2VKb2ludEluZmx1ZW5jZXMoKSB7XHJcbiAgICAgICAgY29uc3QgY291bnRTZXQgPSAoZXhwZWN0ZWQ6IFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzKSA9PlxyXG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuX3ZlcnRpY2VzKS5yZWR1Y2UoXHJcbiAgICAgICAgICAgICAgICAocHJldmlvdXMsIGF0dHJpYnV0ZSkgPT4gKHByZXZpb3VzICs9IGVxdWFsU3RkU2VtYW50aWMoYXR0cmlidXRlLnNlbWFudGljLCBleHBlY3RlZCkgPyAxIDogMCksXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBuSm9pbnRTZXRzID0gY291bnRTZXQoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Muam9pbnRzKTtcclxuICAgICAgICBpZiAobkpvaW50U2V0cyA8PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB3ZWlnaHRTdG9yYWdlQ29uc3RydWN0b3I6IHVuZGVmaW5lZCB8IFBQR2VvbWV0cnlUeXBlZEFycmF5Q29uc3RydWN0b3I7XHJcbiAgICAgICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgT2JqZWN0LnZhbHVlcyh0aGlzLl92ZXJ0aWNlcykpIHtcclxuICAgICAgICAgICAgaWYgKGVxdWFsU3RkU2VtYW50aWMoYXR0cmlidXRlLnNlbWFudGljLCBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy53ZWlnaHRzKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSBhdHRyaWJ1dGUuZGF0YS5jb25zdHJ1Y3RvciBhcyBQUEdlb21ldHJ5VHlwZWRBcnJheUNvbnN0cnVjdG9yO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF3ZWlnaHRTdG9yYWdlQ29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgICAgICAgICB3ZWlnaHRTdG9yYWdlQ29uc3RydWN0b3IgPSBjb25zdHJ1Y3RvcjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAod2VpZ2h0U3RvcmFnZUNvbnN0cnVjdG9yICE9PSBjb25zdHJ1Y3Rvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0FsbCB3ZWlnaHRzIGF0dHJpYnV0ZSBzaG91bGQgYmUgb2Ygc2FtZSBjb21wb25lbnQgdHlwZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vIERvIG5vdCBwcm9jZWVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghd2VpZ2h0U3RvcmFnZUNvbnN0cnVjdG9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZSBudW1iZXIgb2Ygam9pbnRzIGF0dHJpYnV0ZSBhbmQgd2VpZ2h0cyBhdHRyaWJ1dGUgYXJlIG5vdCBtYXRjaGVkLicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBuTWVyZ2VkQ29tcG9uZW50cyA9IDQ7XHJcbiAgICAgICAgY29uc3QgbWVyZ2VkSm9pbnRzID0gbmV3IFVpbnQxNkFycmF5KG5NZXJnZWRDb21wb25lbnRzICogdGhpcy5fdmVydGV4Q291bnQpO1xyXG4gICAgICAgIGNvbnN0IG1lcmdlZFdlaWdodHMgPSBuZXcgd2VpZ2h0U3RvcmFnZUNvbnN0cnVjdG9yKG5NZXJnZWRDb21wb25lbnRzICogdGhpcy5fdmVydGV4Q291bnQpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBPYmplY3QudmFsdWVzKHRoaXMuX3ZlcnRpY2VzKSkge1xyXG4gICAgICAgICAgICBpZiAoIVBQR2VvbWV0cnkuaXNTdGRTZW1hbnRpYyhhdHRyaWJ1dGUuc2VtYW50aWMpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB7IHNlbWFudGljMCwgc2V0IH0gPSBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5kZWNvZGUoYXR0cmlidXRlLnNlbWFudGljKTtcclxuICAgICAgICAgICAgaWYgKHNlbWFudGljMCAhPT0gUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Muam9pbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB3ZWlnaHRTZW1hbnRpYyA9IFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLnNldChQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy53ZWlnaHRzLCBzZXQpO1xyXG4gICAgICAgICAgICBpZiAoISh3ZWlnaHRTZW1hbnRpYyBpbiB0aGlzLl92ZXJ0aWNlcykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFZlcnRleCBhdHRyaWJ1dGUgam9pbnRzLSR7c2V0fSBoYXMgbm8gY29ycmVzcG9uZGluZyB3ZWlnaHRzIGF0dHJpYnV0ZWApO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgam9pbnRzID0gYXR0cmlidXRlO1xyXG4gICAgICAgICAgICBjb25zdCB3ZWlnaHRzID0gdGhpcy5fdmVydGljZXNbd2VpZ2h0U2VtYW50aWNdLmRhdGE7XHJcbiAgICAgICAgICAgIGNvbnN0IG5JbnB1dENvbXBvbmVudHMgPSA0O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpSW5wdXRDb21wb25lbnQgPSAwOyBpSW5wdXRDb21wb25lbnQgPCBuSW5wdXRDb21wb25lbnRzOyArK2lJbnB1dENvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaVZlcnRleCA9IDA7IGlWZXJ0ZXggPCB0aGlzLl92ZXJ0ZXhDb3VudDsgKytpVmVydGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaUlucHV0ID0gaVZlcnRleCAqIG5JbnB1dENvbXBvbmVudHMgKyBpSW5wdXRDb21wb25lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2VpZ2h0ID0gd2VpZ2h0c1tpSW5wdXRdO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEhlcmUgaW1wbGllcyBhbmQgZXN0YWJsaXNoZXMgdGhlIHByb21pc2U6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWVyZ2VkIHdlaWdodHMgYXJlIHNvcnRlZCBpbiBkZXNjZW5kaW5nIG9yZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNvIHRoZSBwcm9ibGVtIGlzLCBpbnNlcnQoYW5kIHJlcGxhY2UpIGEgdmFsdWUgaW50byBhIGRlc2NlbmRpbmctc29ydGVkIHNlcS5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpUmVwbGFjZUNvbXBvbmVudCA9IDA7IGlSZXBsYWNlQ29tcG9uZW50IDwgbk1lcmdlZENvbXBvbmVudHM7ICsraVJlcGxhY2VDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaVJlcGxhY2UgPSBpVmVydGV4ICogbk1lcmdlZENvbXBvbmVudHMgKyBpUmVwbGFjZUNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdlaWdodCA+PSBtZXJnZWRXZWlnaHRzW2lSZXBsYWNlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaVJlcGxhY2VMYXN0ID0gKGlWZXJ0ZXggKyAxKSAqIG5NZXJnZWRDb21wb25lbnRzIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBpUmVwbGFjZUxhc3QgLSAxOyBpID49IGlSZXBsYWNlOyAtLWkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRXZWlnaHRzW2kgKyAxXSA9IG1lcmdlZFdlaWdodHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkSm9pbnRzW2kgKyAxXSA9IG1lcmdlZEpvaW50c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmdlZFdlaWdodHNbaVJlcGxhY2VdID0gd2VpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkSm9pbnRzW2lSZXBsYWNlXSA9IGpvaW50cy5kYXRhW2lJbnB1dF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5kZWxldGVBdHRyaWJ1dGUoYXR0cmlidXRlLnNlbWFudGljKTtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVBdHRyaWJ1dGUod2VpZ2h0U2VtYW50aWMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaVZlcnRleCA9IDA7IGlWZXJ0ZXggPCB0aGlzLl92ZXJ0ZXhDb3VudDsgKytpVmVydGV4KSB7XHJcbiAgICAgICAgICAgIGxldCBzdW0gPSAwLjA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlDb21wb25lbnQgPSAwOyBpQ29tcG9uZW50IDwgbk1lcmdlZENvbXBvbmVudHM7ICsraUNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgc3VtICs9IG1lcmdlZFdlaWdodHNbbk1lcmdlZENvbXBvbmVudHMgKiBpVmVydGV4ICsgaUNvbXBvbmVudF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN1bSAhPT0gMC4wKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpQ29tcG9uZW50ID0gMDsgaUNvbXBvbmVudCA8IG5NZXJnZWRDb21wb25lbnRzOyArK2lDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXJnZWRXZWlnaHRzW25NZXJnZWRDb21wb25lbnRzICogaVZlcnRleCArIGlDb21wb25lbnRdIC89IHN1bTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Muc2V0KFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLmpvaW50cywgMCksIG1lcmdlZEpvaW50cywgbk1lcmdlZENvbXBvbmVudHMpO1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLnNldChQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy53ZWlnaHRzLCAwKSwgbWVyZ2VkV2VpZ2h0cywgbk1lcmdlZENvbXBvbmVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFRyaWFuZ2xlSW5kaWNlcygpOiBQUEdlb21ldHJ5VHlwZWRBcnJheSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ByaW1pdGl2ZU1vZGUgIT09IGdmeC5QcmltaXRpdmVNb2RlLlRSSUFOR0xFX0xJU1QpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUcmlhbmdsZXMgZXhwZWN0ZWQuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHRoaXMuX2luZGljZXMgfHxcclxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVkSW5kaWNlcyB8fFxyXG4gICAgICAgICAgICAodGhpcy5fZ2VuZXJhdGVkSW5kaWNlcyA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdG9yID0gdGhpcy5fdmVydGV4Q291bnQgPj0gMSA8PCAoVWludDE2QXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA4KSA/IFVpbnQzMkFycmF5IDogVWludDE2QXJyYXk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRpY2VzID0gbmV3IGN0b3IodGhpcy5fdmVydGV4Q291bnQpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92ZXJ0ZXhDb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlc1tpXSA9IGk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kaWNlcztcclxuICAgICAgICAgICAgfSkoKSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2Fzc2VydEF0dHJpYnV0ZShzZW1hbnRpYzogUFBHZW9tZXRyeS5TZW1hbnRpYykge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoc2VtYW50aWMpKSB7XHJcbiAgICAgICAgICAgIGxldCBzZW1hbnRpY1JlcDogc3RyaW5nO1xyXG4gICAgICAgICAgICBpZiAoIVBQR2VvbWV0cnkuaXNTdGRTZW1hbnRpYyhzZW1hbnRpYykpIHtcclxuICAgICAgICAgICAgICAgIHNlbWFudGljUmVwID0gc2VtYW50aWM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IHNlbWFudGljMCwgc2V0IH0gPSBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5kZWNvZGUoc2VtYW50aWMpO1xyXG4gICAgICAgICAgICAgICAgc2VtYW50aWNSZXAgPSBgJHtQUEdlb21ldHJ5LlN0ZFNlbWFudGljc1tzZW1hbnRpYzBdfWA7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VtYW50aWNSZXAgKz0gYChzZXQgJHtzZXR9KWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3NlbWFudGljUmVwfSBhdHRyaWJ1dGUgaXMgZXhwZWN0IGJ1dCBub3QgcHJlc2VudGApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShzZW1hbnRpYyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyByZXR1cm5zIFsgdGFyZ2V0U3VtLCBvZmZzZXQgXVxyXG5mdW5jdGlvbiBnZXRUYXJnZXRKb2ludFdlaWdodENoZWNrUGFyYW1zKGN0b3I6IFBQR2VvbWV0cnlUeXBlZEFycmF5Q29uc3RydWN0b3IpIHtcclxuICAgIHN3aXRjaCAoY3Rvcikge1xyXG4gICAgICAgIGNhc2UgSW50OEFycmF5OlxyXG4gICAgICAgICAgICByZXR1cm4gWzB4ZmYsIDB4ODBdO1xyXG4gICAgICAgIGNhc2UgVWludDhBcnJheTpcclxuICAgICAgICAgICAgcmV0dXJuIFsweGZmLCAwXTtcclxuICAgICAgICBjYXNlIEludDE2QXJyYXk6XHJcbiAgICAgICAgICAgIHJldHVybiBbMHhmZmZmLCAweDgwMDBdO1xyXG4gICAgICAgIGNhc2UgVWludDE2QXJyYXk6XHJcbiAgICAgICAgICAgIHJldHVybiBbMHhmZmZmLCAwXTtcclxuICAgICAgICBjYXNlIEludDMyQXJyYXk6XHJcbiAgICAgICAgICAgIHJldHVybiBbMHhmZmZmZmZmZiwgMHg4MDAwMDAwMF07XHJcbiAgICAgICAgY2FzZSBVaW50MzJBcnJheTpcclxuICAgICAgICAgICAgcmV0dXJuIFsweGZmZmZmZmZmLCAwXTtcclxuICAgICAgICBjYXNlIEZsb2F0MzJBcnJheTpcclxuICAgICAgICAgICAgcmV0dXJuIFsxLCAwXTtcclxuICAgIH1cclxuICAgIHJldHVybiBbMSwgMF07XHJcbn1cclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgUFBHZW9tZXRyeSB7XHJcbiAgICBleHBvcnQgZW51bSBTdGRTZW1hbnRpY3Mge1xyXG4gICAgICAgIHBvc2l0aW9uLFxyXG4gICAgICAgIG5vcm1hbCxcclxuICAgICAgICB0ZXhjb29yZCxcclxuICAgICAgICB0YW5nZW50LFxyXG4gICAgICAgIGpvaW50cyxcclxuICAgICAgICB3ZWlnaHRzLFxyXG4gICAgICAgIGNvbG9yLFxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBuYW1lc3BhY2UgU3RkU2VtYW50aWNzIHtcclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gc2V0KHNlbWFudGljOiBTdGRTZW1hbnRpY3MsIHNldDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoc2V0IDw8IDQpICsgc2VtYW50aWM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gZGVjb2RlKHNlbWFudGljOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHNlbWFudGljMDogKHNlbWFudGljICYgMHhmKSBhcyBTdGRTZW1hbnRpY3MsXHJcbiAgICAgICAgICAgICAgICBzZXQ6IHNlbWFudGljID4+IDQsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCB0eXBlIFNlbWFudGljID0gU3RkU2VtYW50aWNzIHwgbnVtYmVyIHwgc3RyaW5nO1xyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBpc1N0ZFNlbWFudGljKHNlbWFudGljOiBTZW1hbnRpYyk6IHNlbWFudGljIGlzIFN0ZFNlbWFudGljcyB8IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzZW1hbnRpYyA9PT0gJ251bWJlcic7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZSB7XHJcbiAgICAgICAgcHVibGljIHNlbWFudGljOiBQUEdlb21ldHJ5LlNlbWFudGljO1xyXG4gICAgICAgIHB1YmxpYyBkYXRhOiBQUEdlb21ldHJ5VHlwZWRBcnJheTtcclxuICAgICAgICBwdWJsaWMgY29tcG9uZW50czogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBpc05vcm1hbGl6ZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIG1vcnBoczogUFBHZW9tZXRyeVR5cGVkQXJyYXlbXSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihzZW1hbnRpYzogUFBHZW9tZXRyeS5TZW1hbnRpYywgZGF0YTogUFBHZW9tZXRyeVR5cGVkQXJyYXksIGNvbXBvbmVudHM6IG51bWJlciwgaXNOb3JtYWxpemVkID0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zZW1hbnRpYyA9IHNlbWFudGljO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBjb21wb25lbnRzO1xyXG4gICAgICAgICAgICB0aGlzLmlzTm9ybWFsaXplZCA9IGlzTm9ybWFsaXplZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRHRlhGb3JtYXQoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hcDIgPSBhdHRyaWJ1dGVGb3JtYXRNYXAuZ2V0KHRoaXMuZGF0YS5jb25zdHJ1Y3RvciBhcyBQUEdlb21ldHJ5VHlwZWRBcnJheUNvbnN0cnVjdG9yKTtcclxuICAgICAgICAgICAgaWYgKG1hcDIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50cyBpbiBtYXAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcDJbdGhpcy5jb21wb25lbnRzXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvcnJlc3BvbmRpbmcgZ2Z4IGZvcm1hdCBmb3IgYXR0cmlidXRlLicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3Qgc3RkU2VtYW50aWNJbmZvTWFwOiBSZWNvcmQ8XHJcbiAgICBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcyxcclxuICAgIHtcclxuICAgICAgICBnZnhBdHRyaWJ1dGVOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgY29tcG9uZW50czogbnVtYmVyIHwgbnVtYmVyW107XHJcbiAgICAgICAgbXVsdGlzZXRzPzogUmVjb3JkPG51bWJlciwgc3RyaW5nPjtcclxuICAgIH1cclxuPiA9IHtcclxuICAgIFtQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5wb3NpdGlvbl06IHtcclxuICAgICAgICBnZnhBdHRyaWJ1dGVOYW1lOiBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1BPU0lUSU9OLFxyXG4gICAgICAgIGNvbXBvbmVudHM6IDMsXHJcbiAgICB9LFxyXG4gICAgW1BQR2VvbWV0cnkuU3RkU2VtYW50aWNzLm5vcm1hbF06IHtcclxuICAgICAgICBnZnhBdHRyaWJ1dGVOYW1lOiBnZnguQXR0cmlidXRlTmFtZS5BVFRSX05PUk1BTCxcclxuICAgICAgICBjb21wb25lbnRzOiAzLFxyXG4gICAgfSxcclxuICAgIFtQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy50ZXhjb29yZF06IHtcclxuICAgICAgICBnZnhBdHRyaWJ1dGVOYW1lOiBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1RFWF9DT09SRCxcclxuICAgICAgICBjb21wb25lbnRzOiAyLFxyXG4gICAgICAgIG11bHRpc2V0czoge1xyXG4gICAgICAgICAgICAxOiBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1RFWF9DT09SRDEsXHJcbiAgICAgICAgICAgIDI6IGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEVYX0NPT1JEMixcclxuICAgICAgICAgICAgMzogZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9URVhfQ09PUkQzLFxyXG4gICAgICAgICAgICA0OiBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1RFWF9DT09SRDQsXHJcbiAgICAgICAgICAgIDU6IGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEVYX0NPT1JENSxcclxuICAgICAgICAgICAgNjogZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9URVhfQ09PUkQ2LFxyXG4gICAgICAgICAgICA3OiBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1RFWF9DT09SRDcsXHJcbiAgICAgICAgICAgIDg6IGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEVYX0NPT1JEOCxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIFtQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy50YW5nZW50XToge1xyXG4gICAgICAgIGdmeEF0dHJpYnV0ZU5hbWU6IGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEFOR0VOVCxcclxuICAgICAgICBjb21wb25lbnRzOiA0LFxyXG4gICAgfSxcclxuICAgIFtQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5qb2ludHNdOiB7XHJcbiAgICAgICAgZ2Z4QXR0cmlidXRlTmFtZTogZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9KT0lOVFMsXHJcbiAgICAgICAgY29tcG9uZW50czogNCxcclxuICAgIH0sXHJcbiAgICBbUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Mud2VpZ2h0c106IHtcclxuICAgICAgICBnZnhBdHRyaWJ1dGVOYW1lOiBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1dFSUdIVFMsXHJcbiAgICAgICAgY29tcG9uZW50czogNCxcclxuICAgIH0sXHJcbiAgICBbUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3MuY29sb3JdOiB7XHJcbiAgICAgICAgZ2Z4QXR0cmlidXRlTmFtZTogZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9DT0xPUixcclxuICAgICAgICBjb21wb25lbnRzOiBbMywgNF0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuY29uc3QgYXR0cmlidXRlRm9ybWF0TWFwID0gbmV3IE1hcChbXHJcbiAgICBbXHJcbiAgICAgICAgSW50OEFycmF5LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgMTogZ2Z4LkZvcm1hdC5SOFNOLFxyXG4gICAgICAgICAgICAyOiBnZnguRm9ybWF0LlJHOFNOLFxyXG4gICAgICAgICAgICAzOiBnZnguRm9ybWF0LlJHQjhTTixcclxuICAgICAgICAgICAgNDogZ2Z4LkZvcm1hdC5SR0JBOFNOLFxyXG4gICAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICAgIFVpbnQ4QXJyYXksXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAxOiBnZnguRm9ybWF0LlI4LFxyXG4gICAgICAgICAgICAyOiBnZnguRm9ybWF0LlJHOCxcclxuICAgICAgICAgICAgMzogZ2Z4LkZvcm1hdC5SR0I4LFxyXG4gICAgICAgICAgICA0OiBnZnguRm9ybWF0LlJHQkE4LFxyXG4gICAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICAgIEludDE2QXJyYXksXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAxOiBnZnguRm9ybWF0LlIxNkksXHJcbiAgICAgICAgICAgIDI6IGdmeC5Gb3JtYXQuUkcxNkksXHJcbiAgICAgICAgICAgIDM6IGdmeC5Gb3JtYXQuUkdCMTZJLFxyXG4gICAgICAgICAgICA0OiBnZnguRm9ybWF0LlJHQkExNkksXHJcbiAgICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBbXHJcbiAgICAgICAgVWludDE2QXJyYXksXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAxOiBnZnguRm9ybWF0LlIxNlVJLFxyXG4gICAgICAgICAgICAyOiBnZnguRm9ybWF0LlJHMTZVSSxcclxuICAgICAgICAgICAgMzogZ2Z4LkZvcm1hdC5SR0IxNlVJLFxyXG4gICAgICAgICAgICA0OiBnZnguRm9ybWF0LlJHQkExNlVJLFxyXG4gICAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICAgIEludDMyQXJyYXksXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAxOiBnZnguRm9ybWF0LlIzMkksXHJcbiAgICAgICAgICAgIDI6IGdmeC5Gb3JtYXQuUkczMkksXHJcbiAgICAgICAgICAgIDM6IGdmeC5Gb3JtYXQuUkdCMzJJLFxyXG4gICAgICAgICAgICA0OiBnZnguRm9ybWF0LlJHQkEzMkksXHJcbiAgICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBbXHJcbiAgICAgICAgVWludDMyQXJyYXksXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAxOiBnZnguRm9ybWF0LlIzMlVJLFxyXG4gICAgICAgICAgICAyOiBnZnguRm9ybWF0LlJHMzJVSSxcclxuICAgICAgICAgICAgMzogZ2Z4LkZvcm1hdC5SR0IzMlVJLFxyXG4gICAgICAgICAgICA0OiBnZnguRm9ybWF0LlJHQkEzMlVJLFxyXG4gICAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICAgIEZsb2F0MzJBcnJheSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIDE6IGdmeC5Gb3JtYXQuUjMyRixcclxuICAgICAgICAgICAgMjogZ2Z4LkZvcm1hdC5SRzMyRixcclxuICAgICAgICAgICAgMzogZ2Z4LkZvcm1hdC5SR0IzMkYsXHJcbiAgICAgICAgICAgIDQ6IGdmeC5Gb3JtYXQuUkdCQTMyRixcclxuICAgICAgICB9LFxyXG4gICAgXSxcclxuXSBhcyBJdGVyYWJsZTxbUFBHZW9tZXRyeVR5cGVkQXJyYXlDb25zdHJ1Y3RvciwgUmVjb3JkPG51bWJlciwgZ2Z4LkZvcm1hdD5dPik7XHJcblxyXG4vKipcclxuICogQHJldHVybnMgVGhlIGNvcnJlc3BvbmRpbmcgR0ZYIGF0dHJpYnV0ZSBuYW1lLlxyXG4gKiBAdGhyb3dzIElmIHRoZSBhdHRyaWJ1dGUgKippcyBzdGFuZGFyZCBzZW1hbnRpYyoqIGJ1dCBpcyBub3QgYSB2YWxpZCBHRlggYXR0cmlidXRlIG5hbWU6XHJcbiAqIC0gSXQgaGFzIGEgZGlmZmVyZW50IG51bWJlciBvZiBjb21wb25lbnQgd2hpY2ggaXMgbm90IHBlcm1pdHRlZC5cclxuICogLSBJdHMgc2V0IGNvdW50IGJleW9uZCBob3cgbWFueSB0aGF0IGtpbmQgb2YgR0ZYIGF0dHJpYnV0ZXMgY2FuIHByb2NlZWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2Z4QXR0cmlidXRlTmFtZShhdHRyaWJ1dGU6IFBQR2VvbWV0cnkuQXR0cmlidXRlKSB7XHJcbiAgICBjb25zdCB7IHNlbWFudGljIH0gPSBhdHRyaWJ1dGU7XHJcbiAgICBsZXQgZ2Z4QXR0cmlidXRlTmFtZTogc3RyaW5nO1xyXG4gICAgaWYgKCFQUEdlb21ldHJ5LmlzU3RkU2VtYW50aWMoc2VtYW50aWMpKSB7XHJcbiAgICAgICAgZ2Z4QXR0cmlidXRlTmFtZSA9IHNlbWFudGljO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBWYWxpZGF0ZSBzdGFuZGFyZCBzZW1hbnRpYy5cclxuICAgICAgICBjb25zdCB7IHNlbWFudGljMCwgc2V0IH0gPSBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5kZWNvZGUoc2VtYW50aWMpO1xyXG4gICAgICAgIGNvbnN0IHNlbWFudGljSW5mbyA9IHN0ZFNlbWFudGljSW5mb01hcFtzZW1hbnRpYzBdO1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgIShBcnJheS5pc0FycmF5KHNlbWFudGljSW5mby5jb21wb25lbnRzKVxyXG4gICAgICAgICAgICAgICAgPyBzZW1hbnRpY0luZm8uY29tcG9uZW50cy5pbmNsdWRlcyhhdHRyaWJ1dGUuY29tcG9uZW50cylcclxuICAgICAgICAgICAgICAgIDogc2VtYW50aWNJbmZvLmNvbXBvbmVudHMgPT09IGF0dHJpYnV0ZS5jb21wb25lbnRzKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1pc21hdGNoZWQgJHtQUEdlb21ldHJ5LlN0ZFNlbWFudGljc1tzZW1hbnRpYzBdfSBjb21wb25lbnRzLCBleHBlY3QgJHtzZW1hbnRpY0luZm8uY29tcG9uZW50c30uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgZ2Z4QXR0cmlidXRlTmFtZSA9IHNlbWFudGljSW5mby5nZnhBdHRyaWJ1dGVOYW1lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VtYW50aWNJbmZvLm11bHRpc2V0cyAmJiBzZXQgaW4gc2VtYW50aWNJbmZvLm11bHRpc2V0cykge1xyXG4gICAgICAgICAgICBnZnhBdHRyaWJ1dGVOYW1lID0gc2VtYW50aWNJbmZvLm11bHRpc2V0c1tzZXRdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtQUEdlb21ldHJ5LlN0ZFNlbWFudGljc1tzZW1hbnRpYzBdfSBkb2Vzbid0IGFsbG93IHNldCAke3NldH0uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGdmeEF0dHJpYnV0ZU5hbWU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIG5vcm1hbGl6ZXIgd2hpY2ggbm9ybWFsaXplIHRoZSBpbnRlZ2VycyBvZiBzcGVjaWZpZWQgdHlwZSBhcnJheVxyXG4gKiBpbnRvIFswLCAxXShmb3IgdW5zaWduZWQgaW50ZWdlcnMpIG9yIFstMSwgMV0oZm9yIHNpZ25lZCBpbnRlZ2VycykuXHJcbiAqIFRoZSBub3JtYWxpemF0aW9uIGlzIHBlcmZvcm1lZCBhcyBkZXNjcmliZWQgaW46XHJcbiAqIGh0dHBzOi8vd3d3Lmtocm9ub3Mub3JnL29wZW5nbC93aWtpL05vcm1hbGl6ZWRfSW50ZWdlclxyXG4gKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplciwgb3IgYHVuZGVmaW5lZGAgaWYgbm8gY29ycmVzcG9uZGluZyBub3JtYWxpemVyLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGdldE5vcm1hbGl6ZXIgPSAoKCkgPT4ge1xyXG4gICAgY29uc3QgVThfTUFYID0gMiAqKiA4IC0gMTtcclxuICAgIGNvbnN0IFUxNl9NQVggPSAyICoqIDE2IC0gMTtcclxuICAgIGNvbnN0IFUzMl9NQVggPSAyICoqIDMyIC0gMTtcclxuICAgIGNvbnN0IEk4X01BWCA9IDIgKiogKDggLSAxKSAtIDE7XHJcbiAgICBjb25zdCBJMTZfTUFYID0gMiAqKiAoMTYgLSAxKSAtIDE7XHJcbiAgICBjb25zdCBJMzJfTUFYID0gMiAqKiAoMzIgLSAxKSAtIDE7XHJcblxyXG4gICAgdHlwZSBOb3JtYWxpemVyID0gKHZhbHVlOiBudW1iZXIpID0+IG51bWJlcjtcclxuXHJcbiAgICBjb25zdCB1ODogTm9ybWFsaXplciA9ICh2YWx1ZSkgPT4gdmFsdWUgLyBVOF9NQVg7XHJcbiAgICBjb25zdCB1MTY6IE5vcm1hbGl6ZXIgPSAodmFsdWUpID0+IHZhbHVlIC8gVTE2X01BWDtcclxuICAgIGNvbnN0IHUzMjogTm9ybWFsaXplciA9ICh2YWx1ZSkgPT4gdmFsdWUgLyBVMzJfTUFYO1xyXG4gICAgY29uc3QgaTg6IE5vcm1hbGl6ZXIgPSAodmFsdWUpID0+IE1hdGgubWF4KHZhbHVlIC8gSThfTUFYLCAtMSk7XHJcbiAgICBjb25zdCBpMTY6IE5vcm1hbGl6ZXIgPSAodmFsdWUpID0+IE1hdGgubWF4KHZhbHVlIC8gSTE2X01BWCwgLTEpO1xyXG4gICAgY29uc3QgaTMyOiBOb3JtYWxpemVyID0gKHZhbHVlKSA9PiBNYXRoLm1heCh2YWx1ZSAvIEkzMl9NQVgsIC0xKTtcclxuXHJcbiAgICByZXR1cm4gKHR5cGVkQXJyYXk6IFBQR2VvbWV0cnlUeXBlZEFycmF5KSA9PiB7XHJcbiAgICAgICAgc3dpdGNoICh0cnVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgdHlwZWRBcnJheSBpbnN0YW5jZW9mIEludDhBcnJheTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBpODtcclxuICAgICAgICAgICAgY2FzZSB0eXBlZEFycmF5IGluc3RhbmNlb2YgSW50MTZBcnJheTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBpMTY7XHJcbiAgICAgICAgICAgIGNhc2UgdHlwZWRBcnJheSBpbnN0YW5jZW9mIEludDMyQXJyYXk6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTMyO1xyXG4gICAgICAgICAgICBjYXNlIHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBVaW50OEFycmF5OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHU4O1xyXG4gICAgICAgICAgICBjYXNlIHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBVaW50MTZBcnJheTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB1MTY7XHJcbiAgICAgICAgICAgIGNhc2UgdHlwZWRBcnJheSBpbnN0YW5jZW9mIFVpbnQzMkFycmF5OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHUzMjtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsITtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxuY29uc3QgZXF1YWxTdGRTZW1hbnRpYyA9IChzZW1hbnRpYzogUFBHZW9tZXRyeS5TZW1hbnRpYywgZXhwZWN0ZWQ6IFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzKSA9PlxyXG4gICAgUFBHZW9tZXRyeS5pc1N0ZFNlbWFudGljKHNlbWFudGljKSAmJiBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5kZWNvZGUoc2VtYW50aWMpLnNlbWFudGljMCA9PT0gZXhwZWN0ZWQ7XHJcbiJdfQ==