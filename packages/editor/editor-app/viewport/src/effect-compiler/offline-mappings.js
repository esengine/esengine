/**
 * Runtime offline-mappings for effect-compiler
 * Gets type constants from ccesengine at runtime
 */

// Get cc from global scope (will be available when ccesengine is loaded)
const getCC = () => {
    if (typeof window !== 'undefined' && window.cc) return window.cc;
    if (typeof globalThis !== 'undefined' && globalThis.cc) return globalThis.cc;
    return null;
};

// Lazy initialization - will be populated when first accessed
let _mappings = null;

const getMappings = () => {
    if (_mappings) return _mappings;

    const cc = getCC();
    if (!cc || !cc.gfx) {
        console.warn('[effect-compiler] cc.gfx not available, using fallback mappings');
        return getFallbackMappings();
    }

    const {
        Type, Format, FormatInfos, FormatType,
        ShaderStageFlagBit, DescriptorType, MemoryAccessBit,
        ColorMask, BlendOp, BlendFactor, StencilOp, ComparisonFunc,
        CullMode, ShadeModel, PolygonMode, PrimitiveMode,
        Filter, Address, DynamicStateFlagBit, SamplerInfo, Sampler,
    } = cc.gfx;

    const { RenderPassStage, RenderPriority, SetIndex } = cc.rendering || {};

    // murmurhash2_32_gc from cc.core
    const murmurhash2_32_gc = cc.murmurhash2_32_gc || ((str, seed = 0) => {
        let h = seed ^ str.length;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995);
            h ^= h >>> 13;
        }
        return h >>> 0;
    });

    const GetTypeSize = cc.gfx.GetTypeSize || ((type) => {
        const sizes = { 0: 0, 1: 4, 5: 4, 9: 4, 13: 8, 14: 12, 15: 16, 21: 16, 22: 36, 23: 64 };
        return sizes[type] || 4;
    });

    // Build type map
    const typeMap = {};
    typeMap[typeMap.bool = Type.BOOL] = 'bool';
    typeMap[typeMap.bvec2 = Type.BOOL2] = 'bvec2';
    typeMap[typeMap.bvec3 = Type.BOOL3] = 'bvec3';
    typeMap[typeMap.bvec4 = Type.BOOL4] = 'bvec4';
    typeMap[typeMap.int = Type.INT] = 'int';
    typeMap[typeMap.ivec2 = Type.INT2] = 'ivec2';
    typeMap[typeMap.ivec3 = Type.INT3] = 'ivec3';
    typeMap[typeMap.ivec4 = Type.INT4] = 'ivec4';
    typeMap[typeMap.uint = Type.UINT] = 'uint';
    typeMap[typeMap.uvec2 = Type.UINT2] = 'uvec2';
    typeMap[typeMap.uvec3 = Type.UINT3] = 'uvec3';
    typeMap[typeMap.uvec4 = Type.UINT4] = 'uvec4';
    typeMap[typeMap.float = Type.FLOAT] = 'float';
    typeMap[typeMap.vec2 = Type.FLOAT2] = 'vec2';
    typeMap[typeMap.vec3 = Type.FLOAT3] = 'vec3';
    typeMap[typeMap.vec4 = Type.FLOAT4] = 'vec4';
    typeMap[typeMap.mat2 = Type.MAT2] = 'mat2';
    typeMap[typeMap.mat3 = Type.MAT3] = 'mat3';
    typeMap[typeMap.mat4 = Type.MAT4] = 'mat4';
    typeMap[typeMap.mat2x3 = Type.MAT2X3] = 'mat2x3';
    typeMap[typeMap.mat2x4 = Type.MAT2X4] = 'mat2x4';
    typeMap[typeMap.mat3x2 = Type.MAT3X2] = 'mat3x2';
    typeMap[typeMap.mat3x4 = Type.MAT3X4] = 'mat3x4';
    typeMap[typeMap.mat4x2 = Type.MAT4X2] = 'mat4x2';
    typeMap[typeMap.mat4x3 = Type.MAT4X3] = 'mat4x3';
    typeMap[typeMap.sampler1D = Type.SAMPLER1D] = 'sampler1D';
    typeMap[typeMap.sampler1DArray = Type.SAMPLER1D_ARRAY] = 'sampler1DArray';
    typeMap[typeMap.sampler2D = Type.SAMPLER2D] = 'sampler2D';
    typeMap[typeMap.sampler2DArray = Type.SAMPLER2D_ARRAY] = 'sampler2DArray';
    typeMap[typeMap.sampler3D = Type.SAMPLER3D] = 'sampler3D';
    typeMap[typeMap.samplerCube = Type.SAMPLER_CUBE] = 'samplerCube';
    typeMap[typeMap.sampler = Type.SAMPLER] = 'sampler';
    typeMap[typeMap.texture1D = Type.TEXTURE1D] = 'texture1D';
    typeMap[typeMap.texture1DArray = Type.TEXTURE1D_ARRAY] = 'texture1DArray';
    typeMap[typeMap.texture2D = Type.TEXTURE2D] = 'texture2D';
    typeMap[typeMap.texture2DArray = Type.TEXTURE2D_ARRAY] = 'texture2DArray';
    typeMap[typeMap.texture3D = Type.TEXTURE3D] = 'texture3D';
    typeMap[typeMap.textureCube = Type.TEXTURE_CUBE] = 'textureCube';
    typeMap[typeMap.image1D = Type.IMAGE1D] = 'image1D';
    typeMap[typeMap.image1DArray = Type.IMAGE1D_ARRAY] = 'image1DArray';
    typeMap[typeMap.image2D = Type.IMAGE2D] = 'image2D';
    typeMap[typeMap.image2DArray = Type.IMAGE2D_ARRAY] = 'image2DArray';
    typeMap[typeMap.image3D = Type.IMAGE3D] = 'image3D';
    typeMap[typeMap.imageCube = Type.IMAGE_CUBE] = 'imageCube';
    typeMap[typeMap.subpassInput = Type.SUBPASS_INPUT] = 'subpassInput';
    // variations
    typeMap.int8_t = Type.INT;
    typeMap.i8vec2 = Type.INT2;
    typeMap.i8vec3 = Type.INT3;
    typeMap.i8vec4 = Type.INT4;
    typeMap.uint8_t = Type.UINT;
    typeMap.u8vec2 = Type.UINT2;
    typeMap.u8vec3 = Type.UINT3;
    typeMap.u8vec4 = Type.UINT4;
    typeMap.int16_t = Type.INT;
    typeMap.i16vec2 = Type.INT2;
    typeMap.i16vec3 = Type.INT3;
    typeMap.i16vec4 = Type.INT4;
    typeMap.uint16_t = Type.INT;
    typeMap.u16vec2 = Type.UINT2;
    typeMap.u16vec3 = Type.UINT3;
    typeMap.u16vec4 = Type.UINT4;
    typeMap.float16_t = Type.FLOAT;
    typeMap.f16vec2 = Type.FLOAT2;
    typeMap.f16vec3 = Type.FLOAT3;
    typeMap.f16vec4 = Type.FLOAT4;
    typeMap.mat2x2 = Type.MAT2;
    typeMap.mat3x3 = Type.MAT3;
    typeMap.mat4x4 = Type.MAT4;
    typeMap.isampler1D = Type.SAMPLER1D;
    typeMap.usampler1D = Type.SAMPLER1D;
    typeMap.sampler1DShadow = Type.SAMPLER1D;
    typeMap.isampler1DArray = Type.SAMPLER1D_ARRAY;
    typeMap.usampler1DArray = Type.SAMPLER1D_ARRAY;
    typeMap.sampler1DArrayShadow = Type.SAMPLER1D_ARRAY;
    typeMap.isampler2D = Type.SAMPLER2D;
    typeMap.usampler2D = Type.SAMPLER2D;
    typeMap.sampler2DShadow = Type.SAMPLER2D;
    typeMap.isampler2DArray = Type.SAMPLER2D_ARRAY;
    typeMap.usampler2DArray = Type.SAMPLER2D_ARRAY;
    typeMap.sampler2DArrayShadow = Type.SAMPLER2D_ARRAY;
    typeMap.isampler3D = Type.SAMPLER3D;
    typeMap.usampler3D = Type.SAMPLER3D;
    typeMap.isamplerCube = Type.SAMPLER_CUBE;
    typeMap.usamplerCube = Type.SAMPLER_CUBE;
    typeMap.samplerCubeShadow = Type.SAMPLER_CUBE;
    typeMap.iimage2D = Type.IMAGE2D;
    typeMap.uimage2D = Type.IMAGE2D;
    typeMap.usubpassInput = Type.SUBPASS_INPUT;
    typeMap.isubpassInput = Type.SUBPASS_INPUT;

    const isSampler = (type) => type >= Type.SAMPLER1D;
    const isPaddedMatrix = (type) => type >= Type.MAT2 && type < Type.MAT4;

    const formatMap = {
        bool: Format.R8,
        bvec2: Format.RG8,
        bvec3: Format.RGB8,
        bvec4: Format.RGBA8,
        int: Format.R32I,
        ivec2: Format.RG32I,
        ivec3: Format.RGB32I,
        ivec4: Format.RGBA32I,
        uint: Format.R32UI,
        uvec2: Format.RG32UI,
        uvec3: Format.RGB32UI,
        uvec4: Format.RGBA32UI,
        float: Format.R32F,
        vec2: Format.RG32F,
        vec3: Format.RGB32F,
        vec4: Format.RGBA32F,
        mat2: Format.RGBA32F,
        mat3: Format.RGBA32F,
        mat4: Format.RGBA32F,
    };

    const getFormat = (name) => Format[name.toUpperCase()];
    const getShaderStage = (name) => ShaderStageFlagBit[name.toUpperCase()];
    const getDescriptorType = (name) => DescriptorType ? DescriptorType[name.toUpperCase()] : 0;
    const isNormalized = (format) => {
        const type = FormatInfos && FormatInfos[format] && FormatInfos[format].type;
        return type === FormatType.UNORM || type === FormatType.SNORM;
    };
    const getMemoryAccessFlag = (access) => {
        if (!MemoryAccessBit) return 0;
        if (access === 'writeonly') return MemoryAccessBit.WRITE_ONLY;
        if (access === 'readonly') return MemoryAccessBit.READ_ONLY;
        return MemoryAccessBit.READ_WRITE;
    };

    // Pass params
    const passParams = {
        NONE: ColorMask.NONE,
        R: ColorMask.R,
        G: ColorMask.G,
        B: ColorMask.B,
        A: ColorMask.A,
        ALL: ColorMask.ALL,
        ADD: BlendOp.ADD,
        SUB: BlendOp.SUB,
        REV_SUB: BlendOp.REV_SUB,
        MIN: BlendOp.MIN,
        MAX: BlendOp.MAX,
        ZERO: BlendFactor.ZERO,
        ONE: BlendFactor.ONE,
        SRC_ALPHA: BlendFactor.SRC_ALPHA,
        DST_ALPHA: BlendFactor.DST_ALPHA,
        ONE_MINUS_SRC_ALPHA: BlendFactor.ONE_MINUS_SRC_ALPHA,
        ONE_MINUS_DST_ALPHA: BlendFactor.ONE_MINUS_DST_ALPHA,
        SRC_COLOR: BlendFactor.SRC_COLOR,
        DST_COLOR: BlendFactor.DST_COLOR,
        ONE_MINUS_SRC_COLOR: BlendFactor.ONE_MINUS_SRC_COLOR,
        ONE_MINUS_DST_COLOR: BlendFactor.ONE_MINUS_DST_COLOR,
        SRC_ALPHA_SATURATE: BlendFactor.SRC_ALPHA_SATURATE,
        KEEP: StencilOp.KEEP,
        REPLACE: StencilOp.REPLACE,
        INCR: StencilOp.INCR,
        DECR: StencilOp.DECR,
        INVERT: StencilOp.INVERT,
        INCR_WRAP: StencilOp.INCR_WRAP,
        DECR_WRAP: StencilOp.DECR_WRAP,
        NEVER: ComparisonFunc.NEVER,
        LESS: ComparisonFunc.LESS,
        EQUAL: ComparisonFunc.EQUAL,
        LESS_EQUAL: ComparisonFunc.LESS_EQUAL,
        GREATER: ComparisonFunc.GREATER,
        NOT_EQUAL: ComparisonFunc.NOT_EQUAL,
        GREATER_EQUAL: ComparisonFunc.GREATER_EQUAL,
        ALWAYS: ComparisonFunc.ALWAYS,
        FRONT: CullMode.FRONT,
        BACK: CullMode.BACK,
        GOURAND: ShadeModel ? ShadeModel.GOURAND : 0,
        FLAT: ShadeModel ? ShadeModel.FLAT : 1,
        FILL: PolygonMode.FILL,
        LINE: PolygonMode.LINE,
        POINT: PolygonMode.POINT,
        POINT_LIST: PrimitiveMode.POINT_LIST,
        LINE_LIST: PrimitiveMode.LINE_LIST,
        LINE_STRIP: PrimitiveMode.LINE_STRIP,
        LINE_LOOP: PrimitiveMode.LINE_LOOP,
        TRIANGLE_LIST: PrimitiveMode.TRIANGLE_LIST,
        TRIANGLE_STRIP: PrimitiveMode.TRIANGLE_STRIP,
        TRIANGLE_FAN: PrimitiveMode.TRIANGLE_FAN,
        LINEAR: Filter.LINEAR,
        ANISOTROPIC: Filter.ANISOTROPIC,
        WRAP: Address.WRAP,
        MIRROR: Address.MIRROR,
        CLAMP: Address.CLAMP,
        BORDER: Address.BORDER,
        LINE_WIDTH: DynamicStateFlagBit ? DynamicStateFlagBit.LINE_WIDTH : 1,
        DEPTH_BIAS: DynamicStateFlagBit ? DynamicStateFlagBit.DEPTH_BIAS : 2,
        BLEND_CONSTANTS: DynamicStateFlagBit ? DynamicStateFlagBit.BLEND_CONSTANTS : 4,
        TRUE: true,
        FALSE: false,
    };

    if (RenderPassStage) {
        Object.assign(passParams, RenderPassStage);
    }

    const effectStructure = {
        $techniques: [{
            $passes: [{
                depthStencilState: {},
                rasterizerState: {},
                blendState: { targets: [{}] },
                properties: { any: { sampler: {}, editor: {} } },
                migrations: { properties: { any: {} }, macros: { any: {} } },
                embeddedMacros: {},
            }],
        }],
    };

    _mappings = {
        murmurhash2_32_gc,
        Sampler,
        SamplerInfo,
        effectStructure,
        isSampler,
        typeMap,
        formatMap,
        getFormat,
        getShaderStage,
        getDescriptorType,
        isNormalized,
        isPaddedMatrix,
        getMemoryAccessFlag,
        passParams,
        SetIndex: SetIndex || { GLOBAL: 0, MATERIAL: 1, LOCAL: 2 },
        RenderPriority: RenderPriority || { MIN: 0, MAX: 255, DEFAULT: 128 },
        GetTypeSize,
    };

    return _mappings;
};

// Fallback mappings when cc is not available (for type checking/compilation)
const getFallbackMappings = () => ({
    murmurhash2_32_gc: (str, seed = 0) => {
        let h = seed ^ str.length;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995);
            h ^= h >>> 13;
        }
        return h >>> 0;
    },
    Sampler: null,
    SamplerInfo: null,
    effectStructure: { $techniques: [{ $passes: [{}] }] },
    isSampler: (type) => type >= 24,
    typeMap: {},
    formatMap: {},
    getFormat: () => 0,
    getShaderStage: (name) => name === 'vertex' ? 1 : name === 'fragment' ? 16 : 0,
    getDescriptorType: () => 0,
    isNormalized: () => false,
    isPaddedMatrix: () => false,
    getMemoryAccessFlag: () => 0,
    passParams: {},
    SetIndex: { GLOBAL: 0, MATERIAL: 1, LOCAL: 2 },
    RenderPriority: { MIN: 0, MAX: 255, DEFAULT: 128 },
    GetTypeSize: () => 4,
});

// Export as a getter to allow lazy initialization
module.exports = new Proxy({}, {
    get: (target, prop) => {
        const mappings = getMappings();
        return mappings[prop];
    }
});
