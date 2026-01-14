import { IOptions } from './parser';
export declare function serialize(obj: Exclude<any, null | undefined>, options?: IOptions): string | object;
export declare namespace serialize {
    var asAsset: typeof import("./dynamic-builder").asAsset;
    var setName: typeof import("./dynamic-builder").setName;
    var findRootObject: typeof import("./dynamic-builder").findRootObject;
}
export declare function serializeCompiled(obj: Exclude<any, null | undefined>, options: IOptions): string | object;
export declare namespace serializeCompiled {
    var getRootData: typeof import("./compiled/builder").getRootData;
    var packJSONs: typeof import("./compiled/pack-jsons").default;
}
