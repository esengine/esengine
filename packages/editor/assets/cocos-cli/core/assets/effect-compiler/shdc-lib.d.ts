export namespace options {
    let throwOnError: boolean;
    let throwOnWarning: boolean;
    let noSource: boolean;
    let skipParserTest: boolean;
    function chunkSearchFn(names: any): {};
    function getAlternativeChunkPaths(path: any): never[];
}
export function addChunk(name: any, content: any, chunks?: {}, deprecations?: {
    chunks: {};
    identifiers: {};
}): void;
export function compileShader(name: any, stage: any, outDefines?: any[], shaderInfo?: {
    blocks: never[];
    samplerTextures: never[];
    samplers: never[];
    textures: never[];
    buffers: never[];
    images: never[];
    subpassInputs: never[];
    attributes: never[];
    varyings: never[];
    fragColors: never[];
    descriptors: never[];
}, chunks?: {}, deprecations?: {
    chunks: {};
    identifiers: {};
}): {
    blockInfo: {
        beg: any;
        end: any;
        param: any;
        type: string;
    }[];
    record: Set<any>;
    extensions: {};
    glsl4: any;
    glsl3: any;
    glsl1: any;
};
export function buildEffect(name: any, content: any): {
    name: any;
} | null;
