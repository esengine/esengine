import { z } from 'zod';
export declare const SchemaSceneRef: z.ZodObject<{
    url: z.ZodString;
    uuid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    uuid: string;
}, {
    url: string;
    uuid: string;
}>;
export declare const SchemaPolyfills: z.ZodObject<{
    asyncFunctions: z.ZodOptional<z.ZodBoolean>;
    coreJs: z.ZodOptional<z.ZodBoolean>;
    targets: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    targets?: string | undefined;
    asyncFunctions?: boolean | undefined;
    coreJs?: boolean | undefined;
}, {
    targets?: string | undefined;
    asyncFunctions?: boolean | undefined;
    coreJs?: boolean | undefined;
}>;
export declare const SchemaBundleConfig: z.ZodObject<{
    root: z.ZodString;
    priority: z.ZodOptional<z.ZodNumber>;
    compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
    isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    name: z.ZodString;
    dest: z.ZodOptional<z.ZodString>;
    scriptDest: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    root: string;
    compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    isRemote?: boolean | undefined;
    output?: boolean | undefined;
    priority?: number | undefined;
    dest?: string | undefined;
    scriptDest?: string | undefined;
}, {
    name: string;
    root: string;
    compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    isRemote?: boolean | undefined;
    output?: boolean | undefined;
    priority?: number | undefined;
    dest?: string | undefined;
    scriptDest?: string | undefined;
}>;
export declare const SchemaPlatform: z.ZodDefault<z.ZodString>;
export declare const SchemaPlatformCanMake: z.ZodString;
export declare const SchemaRoot: z.ZodString;
export type IPlatformRoot = z.infer<typeof SchemaRoot>;
export type TPlatform = z.infer<typeof SchemaPlatform>;
export type TPlatformCanMake = z.infer<typeof SchemaPlatformCanMake>;
export declare const SchemaWebDesktopPackages: z.ZodObject<{
    useWebGPU: z.ZodDefault<z.ZodBoolean>;
    resolution: z.ZodObject<{
        designHeight: z.ZodNumber;
        designWidth: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        designHeight: number;
        designWidth: number;
    }, {
        designHeight: number;
        designWidth: number;
    }>;
}, "strip", z.ZodTypeAny, {
    useWebGPU: boolean;
    resolution: {
        designHeight: number;
        designWidth: number;
    };
}, {
    resolution: {
        designHeight: number;
        designWidth: number;
    };
    useWebGPU?: boolean | undefined;
}>;
export declare const SchemaWebMobilePackages: z.ZodObject<{
    useWebGPU: z.ZodDefault<z.ZodBoolean>;
    orientation: z.ZodDefault<z.ZodEnum<["portrait", "landscape", "auto"]>>;
    embedWebDebugger: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    useWebGPU: boolean;
    orientation: "auto" | "landscape" | "portrait";
    embedWebDebugger: boolean;
}, {
    useWebGPU?: boolean | undefined;
    orientation?: "auto" | "landscape" | "portrait" | undefined;
    embedWebDebugger?: boolean | undefined;
}>;
export declare const SchemaMacPackage: z.ZodObject<{
    packageName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    packageName: string;
}, {
    packageName: string;
}>;
export declare const SchemaAndroidPackage: z.ZodObject<{
    packageName: z.ZodString;
    keystorePath: z.ZodOptional<z.ZodString>;
    keystorePassword: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    packageName: string;
    keystorePath?: string | undefined;
    keystorePassword?: string | undefined;
}, {
    packageName: string;
    keystorePath?: string | undefined;
    keystorePassword?: string | undefined;
}>;
export declare const SchemaBuildBaseConfig: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}, {
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}>;
export declare const SchemaBuildRuntimeOptions: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    taskId?: string | undefined;
    taskName?: string | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    taskId?: string | undefined;
    taskName?: string | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaBuildBaseOption: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaWebDesktopBuildOption: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"web-desktop">;
    packages: z.ZodOptional<z.ZodObject<{
        'web-desktop': z.ZodObject<{
            useWebGPU: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            resolution: z.ZodOptional<z.ZodObject<{
                designHeight: z.ZodNumber;
                designWidth: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                designHeight: number;
                designWidth: number;
            }, {
                designHeight: number;
                designWidth: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        }, {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    }, {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    platform: "web-desktop";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "web-desktop";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaWebMobileBuildOption: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"web-mobile">;
    packages: z.ZodOptional<z.ZodObject<{
        'web-mobile': z.ZodObject<{
            useWebGPU: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            orientation: z.ZodOptional<z.ZodDefault<z.ZodEnum<["portrait", "landscape", "auto"]>>>;
            embedWebDebugger: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        }, {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    }, {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    platform: "web-mobile";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "web-mobile";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaWindowsBuildOption: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"windows">;
}, "strip", z.ZodTypeAny, {
    platform: "windows";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "windows";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaIOSPackage: z.ZodEffects<z.ZodObject<{
    packageName: z.ZodString;
    osTarget: z.ZodOptional<z.ZodObject<{
        iphoneos: z.ZodOptional<z.ZodBoolean>;
        simulator: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }>>;
    targetVersion: z.ZodOptional<z.ZodString>;
    developerTeam: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodAny, z.objectOutputType<{
    packageName: z.ZodString;
    osTarget: z.ZodOptional<z.ZodObject<{
        iphoneos: z.ZodOptional<z.ZodBoolean>;
        simulator: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }>>;
    targetVersion: z.ZodOptional<z.ZodString>;
    developerTeam: z.ZodOptional<z.ZodString>;
}, z.ZodAny, "strip">, z.objectInputType<{
    packageName: z.ZodString;
    osTarget: z.ZodOptional<z.ZodObject<{
        iphoneos: z.ZodOptional<z.ZodBoolean>;
        simulator: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }>>;
    targetVersion: z.ZodOptional<z.ZodString>;
    developerTeam: z.ZodOptional<z.ZodString>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    packageName: z.ZodString;
    osTarget: z.ZodOptional<z.ZodObject<{
        iphoneos: z.ZodOptional<z.ZodBoolean>;
        simulator: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }>>;
    targetVersion: z.ZodOptional<z.ZodString>;
    developerTeam: z.ZodOptional<z.ZodString>;
}, z.ZodAny, "strip">, z.objectInputType<{
    packageName: z.ZodString;
    osTarget: z.ZodOptional<z.ZodObject<{
        iphoneos: z.ZodOptional<z.ZodBoolean>;
        simulator: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }, {
        iphoneos?: boolean | undefined;
        simulator?: boolean | undefined;
    }>>;
    targetVersion: z.ZodOptional<z.ZodString>;
    developerTeam: z.ZodOptional<z.ZodString>;
}, z.ZodAny, "strip">>;
export declare const SchemaIOSBuildOption: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"ios">;
    packages: z.ZodObject<{
        ios: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>, z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        ios?: z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        ios?: z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    platform: "ios";
    packages: {
        ios?: z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "ios";
    packages: {
        ios?: z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaAndroidBuildOption: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"android">;
    packages: z.ZodObject<{
        android: z.ZodOptional<z.ZodObject<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        android?: z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        android?: z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    platform: "android";
    packages: {
        android?: z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "android";
    packages: {
        android?: z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaMacBuildOption: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"mac">;
    packages: z.ZodObject<{
        mac: z.ZodOptional<z.ZodObject<{
            packageName: z.ZodString;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        mac?: z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        mac?: z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    platform: "mac";
    packages: {
        mac?: z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "mac";
    packages: {
        mac?: z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaOtherPlatformBuildOption: z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    packages: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    debug?: boolean | undefined;
    name?: string | undefined;
    platform?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: any;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    debug?: boolean | undefined;
    name?: string | undefined;
    platform?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: any;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>;
export declare const SchemaKnownBuildOptions: (z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"web-desktop">;
    packages: z.ZodOptional<z.ZodObject<{
        'web-desktop': z.ZodObject<{
            useWebGPU: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            resolution: z.ZodOptional<z.ZodObject<{
                designHeight: z.ZodNumber;
                designWidth: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                designHeight: number;
                designWidth: number;
            }, {
                designHeight: number;
                designWidth: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        }, {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    }, {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    platform: "web-desktop";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "web-desktop";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}> | z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"web-mobile">;
    packages: z.ZodOptional<z.ZodObject<{
        'web-mobile': z.ZodObject<{
            useWebGPU: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            orientation: z.ZodOptional<z.ZodDefault<z.ZodEnum<["portrait", "landscape", "auto"]>>>;
            embedWebDebugger: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        }, {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    }, {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    platform: "web-mobile";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "web-mobile";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}> | z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"windows">;
}, "strip", z.ZodTypeAny, {
    platform: "windows";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "windows";
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}> | z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"ios">;
    packages: z.ZodObject<{
        ios: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>, z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        ios?: z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        ios?: z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    platform: "ios";
    packages: {
        ios?: z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "ios";
    packages: {
        ios?: z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}> | z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"android">;
    packages: z.ZodObject<{
        android: z.ZodOptional<z.ZodObject<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        android?: z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        android?: z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    platform: "android";
    packages: {
        android?: z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "android";
    packages: {
        android?: z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}> | z.ZodObject<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"mac">;
    packages: z.ZodObject<{
        mac: z.ZodOptional<z.ZodObject<{
            packageName: z.ZodString;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        mac?: z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        mac?: z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    platform: "mac";
    packages: {
        mac?: z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}, {
    platform: "mac";
    packages: {
        mac?: z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    taskId?: string | undefined;
    taskName?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
    configPath?: string | undefined;
    skipCheck?: boolean | undefined;
}>)[];
export declare const SchemaBuildOption: z.ZodDefault<z.ZodDiscriminatedUnion<"platform", any>>;
export type TBuildOption = z.infer<typeof SchemaBuildOption>;
export declare const SchemaResultBase: z.ZodObject<{
    code: z.ZodNumber;
    dest: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: number;
    reason?: string | undefined;
    dest?: string | undefined;
}, {
    code: number;
    reason?: string | undefined;
    dest?: string | undefined;
}>;
export declare const SchemaBuildResult: z.ZodNullable<z.ZodObject<{
    code: z.ZodNumber;
    dest: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
} & {
    custom: z.ZodOptional<z.ZodObject<{
        nativePrjDir: z.ZodOptional<z.ZodString>;
        previewUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        nativePrjDir?: string | undefined;
        previewUrl?: string | undefined;
    }, {
        nativePrjDir?: string | undefined;
        previewUrl?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: number;
    custom?: {
        nativePrjDir?: string | undefined;
        previewUrl?: string | undefined;
    } | undefined;
    reason?: string | undefined;
    dest?: string | undefined;
}, {
    code: number;
    custom?: {
        nativePrjDir?: string | undefined;
        previewUrl?: string | undefined;
    } | undefined;
    reason?: string | undefined;
    dest?: string | undefined;
}>>;
export declare const SchemaMakeResult: z.ZodNullable<z.ZodObject<{
    code: z.ZodNumber;
    dest: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
} & {
    custom: z.ZodOptional<z.ZodObject<{
        nativePrjDir: z.ZodOptional<z.ZodString>;
        executableFile: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        nativePrjDir?: string | undefined;
        executableFile?: string | undefined;
    }, {
        nativePrjDir?: string | undefined;
        executableFile?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: number;
    custom?: {
        nativePrjDir?: string | undefined;
        executableFile?: string | undefined;
    } | undefined;
    reason?: string | undefined;
    dest?: string | undefined;
}, {
    code: number;
    custom?: {
        nativePrjDir?: string | undefined;
        executableFile?: string | undefined;
    } | undefined;
    reason?: string | undefined;
    dest?: string | undefined;
}>>;
export declare const SchemaPreviewSettingsResult: z.ZodNullable<z.ZodObject<{
    settings: z.ZodObject<{
        CocosEngine: z.ZodString;
        engine: z.ZodObject<{
            debug: z.ZodBoolean;
            platform: z.ZodString;
            customLayers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                bit: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                name: string;
                bit: number;
            }, {
                name: string;
                bit: number;
            }>, "many">;
            sortingLayers: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                name: z.ZodString;
                value: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                name: string;
                value: number;
                id: number;
            }, {
                name: string;
                value: number;
                id: number;
            }>, "many">;
            macros: z.ZodRecord<z.ZodString, z.ZodAny>;
            builtinAssets: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            debug: boolean;
            platform: string;
            sortingLayers: {
                name: string;
                value: number;
                id: number;
            }[];
            customLayers: {
                name: string;
                bit: number;
            }[];
            macros: Record<string, any>;
            builtinAssets: string[];
        }, {
            debug: boolean;
            platform: string;
            sortingLayers: {
                name: string;
                value: number;
                id: number;
            }[];
            customLayers: {
                name: string;
                bit: number;
            }[];
            macros: Record<string, any>;
            builtinAssets: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        engine: {
            debug: boolean;
            platform: string;
            sortingLayers: {
                name: string;
                value: number;
                id: number;
            }[];
            customLayers: {
                name: string;
                bit: number;
            }[];
            macros: Record<string, any>;
            builtinAssets: string[];
        };
        CocosEngine: string;
    }, {
        engine: {
            debug: boolean;
            platform: string;
            sortingLayers: {
                name: string;
                value: number;
                id: number;
            }[];
            customLayers: {
                name: string;
                bit: number;
            }[];
            macros: Record<string, any>;
            builtinAssets: string[];
        };
        CocosEngine: string;
    }>;
    script2library: z.ZodRecord<z.ZodString, z.ZodString>;
    bundleConfigs: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        uuids: z.ZodArray<z.ZodString, "many">;
        paths: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
        scenes: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        packs: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">>;
        versions: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">>;
        redirect: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">;
        debug: z.ZodBoolean;
        types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        encrypted: z.ZodOptional<z.ZodBoolean>;
        isZip: z.ZodOptional<z.ZodBoolean>;
        zipVersion: z.ZodOptional<z.ZodString>;
        extensionMap: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">>;
        dependencyRelationships: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">>;
        hasPreloadScript: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        debug: boolean;
        name: string;
        scenes: Record<string, string | number>;
        paths: Record<string, string[]>;
        redirect: (string | number)[];
        uuids: string[];
        packs: Record<string, (string | number)[]>;
        versions: Record<string, (string | number)[]>;
        extensionMap: Record<string, (string | number)[]>;
        dependencyRelationships: Record<string, (string | number)[]>;
        hasPreloadScript: boolean;
        types?: string[] | undefined;
        encrypted?: boolean | undefined;
        isZip?: boolean | undefined;
        zipVersion?: string | undefined;
    }, {
        debug: boolean;
        name: string;
        scenes: Record<string, string | number>;
        paths: Record<string, string[]>;
        redirect: (string | number)[];
        uuids: string[];
        packs: Record<string, (string | number)[]>;
        versions: Record<string, (string | number)[]>;
        extensionMap: Record<string, (string | number)[]>;
        dependencyRelationships: Record<string, (string | number)[]>;
        hasPreloadScript: boolean;
        types?: string[] | undefined;
        encrypted?: boolean | undefined;
        isZip?: boolean | undefined;
        zipVersion?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    bundleConfigs: {
        debug: boolean;
        name: string;
        scenes: Record<string, string | number>;
        paths: Record<string, string[]>;
        redirect: (string | number)[];
        uuids: string[];
        packs: Record<string, (string | number)[]>;
        versions: Record<string, (string | number)[]>;
        extensionMap: Record<string, (string | number)[]>;
        dependencyRelationships: Record<string, (string | number)[]>;
        hasPreloadScript: boolean;
        types?: string[] | undefined;
        encrypted?: boolean | undefined;
        isZip?: boolean | undefined;
        zipVersion?: string | undefined;
    }[];
    settings: {
        engine: {
            debug: boolean;
            platform: string;
            sortingLayers: {
                name: string;
                value: number;
                id: number;
            }[];
            customLayers: {
                name: string;
                bit: number;
            }[];
            macros: Record<string, any>;
            builtinAssets: string[];
        };
        CocosEngine: string;
    };
    script2library: Record<string, string>;
}, {
    bundleConfigs: {
        debug: boolean;
        name: string;
        scenes: Record<string, string | number>;
        paths: Record<string, string[]>;
        redirect: (string | number)[];
        uuids: string[];
        packs: Record<string, (string | number)[]>;
        versions: Record<string, (string | number)[]>;
        extensionMap: Record<string, (string | number)[]>;
        dependencyRelationships: Record<string, (string | number)[]>;
        hasPreloadScript: boolean;
        types?: string[] | undefined;
        encrypted?: boolean | undefined;
        isZip?: boolean | undefined;
        zipVersion?: string | undefined;
    }[];
    settings: {
        engine: {
            debug: boolean;
            platform: string;
            sortingLayers: {
                name: string;
                value: number;
                id: number;
            }[];
            customLayers: {
                name: string;
                bit: number;
            }[];
            macros: Record<string, any>;
            builtinAssets: string[];
        };
        CocosEngine: string;
    };
    script2library: Record<string, string>;
}>>;
export type TPreviewSettingsResult = z.infer<typeof SchemaPreviewSettingsResult>;
export declare const SchemaBuildConfigResult: z.ZodNullable<z.ZodUnion<[z.ZodObject<Omit<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"web-desktop">;
    packages: z.ZodOptional<z.ZodObject<{
        'web-desktop': z.ZodObject<{
            useWebGPU: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            resolution: z.ZodOptional<z.ZodObject<{
                designHeight: z.ZodNumber;
                designWidth: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                designHeight: number;
                designWidth: number;
            }, {
                designHeight: number;
                designWidth: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        }, {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    }, {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    }>>;
}, "taskId" | "taskName" | "configPath" | "skipCheck">, "strip", z.ZodTypeAny, {
    platform: "web-desktop";
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}, {
    platform: "web-desktop";
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-desktop': {
            useWebGPU?: boolean | undefined;
            resolution?: {
                designHeight: number;
                designWidth: number;
            } | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}>, z.ZodObject<Omit<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"web-mobile">;
    packages: z.ZodOptional<z.ZodObject<{
        'web-mobile': z.ZodObject<{
            useWebGPU: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            orientation: z.ZodOptional<z.ZodDefault<z.ZodEnum<["portrait", "landscape", "auto"]>>>;
            embedWebDebugger: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        }, {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    }, {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    }>>;
}, "taskId" | "taskName" | "configPath" | "skipCheck">, "strip", z.ZodTypeAny, {
    platform: "web-mobile";
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}, {
    platform: "web-mobile";
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: {
        'web-mobile': {
            useWebGPU?: boolean | undefined;
            orientation?: "auto" | "landscape" | "portrait" | undefined;
            embedWebDebugger?: boolean | undefined;
        };
    } | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}>, z.ZodObject<Omit<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"windows">;
}, "taskId" | "taskName" | "configPath" | "skipCheck">, "strip", z.ZodTypeAny, {
    platform: "windows";
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}, {
    platform: "windows";
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}>, z.ZodObject<Omit<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"ios">;
    packages: z.ZodObject<{
        ios: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>, z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        ios?: z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        ios?: z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "taskId" | "taskName" | "configPath" | "skipCheck">, "strip", z.ZodTypeAny, {
    platform: "ios";
    packages: {
        ios?: z.objectOutputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}, {
    platform: "ios";
    packages: {
        ios?: z.objectInputType<{
            packageName: z.ZodString;
            osTarget: z.ZodOptional<z.ZodObject<{
                iphoneos: z.ZodOptional<z.ZodBoolean>;
                simulator: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }, {
                iphoneos?: boolean | undefined;
                simulator?: boolean | undefined;
            }>>;
            targetVersion: z.ZodOptional<z.ZodString>;
            developerTeam: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}>, z.ZodObject<Omit<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"android">;
    packages: z.ZodObject<{
        android: z.ZodOptional<z.ZodObject<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        android?: z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        android?: z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "taskId" | "taskName" | "configPath" | "skipCheck">, "strip", z.ZodTypeAny, {
    platform: "android";
    packages: {
        android?: z.objectOutputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}, {
    platform: "android";
    packages: {
        android?: z.objectInputType<{
            packageName: z.ZodString;
            keystorePath: z.ZodOptional<z.ZodString>;
            keystorePassword: z.ZodOptional<z.ZodString>;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}>, z.ZodObject<Omit<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodLiteral<"mac">;
    packages: z.ZodObject<{
        mac: z.ZodOptional<z.ZodObject<{
            packageName: z.ZodString;
        }, "strip", z.ZodAny, z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip">, z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip">>>;
    }, "strip", z.ZodTypeAny, {
        mac?: z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    }, {
        mac?: z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    }>;
}, "taskId" | "taskName" | "configPath" | "skipCheck">, "strip", z.ZodTypeAny, {
    platform: "mac";
    packages: {
        mac?: z.objectOutputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}, {
    platform: "mac";
    packages: {
        mac?: z.objectInputType<{
            packageName: z.ZodString;
        }, z.ZodAny, "strip"> | undefined;
    };
    debug?: boolean | undefined;
    name?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}>, z.ZodObject<Omit<{
    configPath: z.ZodOptional<z.ZodString>;
    skipCheck: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taskId: z.ZodOptional<z.ZodString>;
    taskName: z.ZodOptional<z.ZodString>;
} & {
    name: z.ZodOptional<z.ZodString>;
    outputName: z.ZodOptional<z.ZodString>;
    buildPath: z.ZodOptional<z.ZodString>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        uuid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        uuid: string;
    }, {
        url: string;
        uuid: string;
    }>, "many">>;
    startScene: z.ZodOptional<z.ZodString>;
    debug: z.ZodOptional<z.ZodBoolean>;
    md5Cache: z.ZodOptional<z.ZodBoolean>;
    polyfills: z.ZodOptional<z.ZodObject<{
        asyncFunctions: z.ZodOptional<z.ZodBoolean>;
        coreJs: z.ZodOptional<z.ZodBoolean>;
        targets: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }, {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    }>>;
    buildScriptTargets: z.ZodOptional<z.ZodString>;
    mainBundleCompressionType: z.ZodOptional<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>;
    mainBundleIsRemote: z.ZodOptional<z.ZodBoolean>;
    server: z.ZodOptional<z.ZodString>;
    startSceneAssetBundle: z.ZodOptional<z.ZodBoolean>;
    bundleConfigs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        root: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        compressionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["none", "merge_dep", "merge_all_json", "subpackage", "zip"]>>>;
        isRemote: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        output: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        name: z.ZodString;
        dest: z.ZodOptional<z.ZodString>;
        scriptDest: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }, {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }>, "many">>;
    moveRemoteBundleScript: z.ZodOptional<z.ZodBoolean>;
    nativeCodeBundleMode: z.ZodOptional<z.ZodEnum<["wasm", "asmjs", "both"]>>;
    sourceMaps: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"inline">]>>;
    experimentalEraseModules: z.ZodOptional<z.ZodBoolean>;
    bundleCommonChunk: z.ZodOptional<z.ZodBoolean>;
    mangleProperties: z.ZodOptional<z.ZodBoolean>;
    inlineEnum: z.ZodOptional<z.ZodBoolean>;
    skipCompressTexture: z.ZodOptional<z.ZodBoolean>;
    packAutoAtlas: z.ZodOptional<z.ZodBoolean>;
    useSplashScreen: z.ZodOptional<z.ZodBoolean>;
    nextStages: z.ZodOptional<z.ZodArray<z.ZodEnum<["make", "run"]>, "many">>;
    useCacheConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        engine: z.ZodOptional<z.ZodBoolean>;
        textureCompress: z.ZodOptional<z.ZodBoolean>;
        autoAtlas: z.ZodOptional<z.ZodBoolean>;
        serializeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }, {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    }>>>;
} & {
    platform: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    packages: z.ZodOptional<z.ZodAny>;
}, "taskId" | "taskName" | "configPath" | "skipCheck">, "strip", z.ZodTypeAny, {
    debug?: boolean | undefined;
    name?: string | undefined;
    platform?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: any;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}, {
    debug?: boolean | undefined;
    name?: string | undefined;
    platform?: string | undefined;
    useCacheConfig?: {
        engine?: boolean | undefined;
        serializeData?: boolean | undefined;
        textureCompress?: boolean | undefined;
        autoAtlas?: boolean | undefined;
    } | undefined;
    outputName?: string | undefined;
    buildPath?: string | undefined;
    scenes?: {
        url: string;
        uuid: string;
    }[] | undefined;
    skipCompressTexture?: boolean | undefined;
    packAutoAtlas?: boolean | undefined;
    sourceMaps?: boolean | "inline" | undefined;
    experimentalEraseModules?: boolean | undefined;
    bundleCommonChunk?: boolean | undefined;
    startScene?: string | undefined;
    mangleProperties?: boolean | undefined;
    inlineEnum?: boolean | undefined;
    md5Cache?: boolean | undefined;
    polyfills?: {
        targets?: string | undefined;
        asyncFunctions?: boolean | undefined;
        coreJs?: boolean | undefined;
    } | undefined;
    buildScriptTargets?: string | undefined;
    mainBundleCompressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
    mainBundleIsRemote?: boolean | undefined;
    server?: string | undefined;
    startSceneAssetBundle?: boolean | undefined;
    moveRemoteBundleScript?: boolean | undefined;
    useSplashScreen?: boolean | undefined;
    nextStages?: ("make" | "run")[] | undefined;
    packages?: any;
    nativeCodeBundleMode?: "wasm" | "asmjs" | "both" | undefined;
    bundleConfigs?: {
        name: string;
        root: string;
        compressionType?: "none" | "merge_dep" | "merge_all_json" | "subpackage" | "zip" | undefined;
        isRemote?: boolean | undefined;
        output?: boolean | undefined;
        priority?: number | undefined;
        dest?: string | undefined;
        scriptDest?: string | undefined;
    }[] | undefined;
}>]>>;
export type TBuildConfigResult = z.infer<typeof SchemaBuildConfigResult>;
export type TBuildBaseConfig = z.infer<typeof SchemaBuildBaseConfig>;
export type TBuildRuntimeOptions = z.infer<typeof SchemaBuildRuntimeOptions>;
export type TBuildResultData = z.infer<typeof SchemaBuildResult>;
export type IMakeResultData = z.infer<typeof SchemaMakeResult>;
export type IRunResultData = z.infer<typeof SchemaBuildResult>;
export type TBundleConfig = z.infer<typeof SchemaBundleConfig>;
export type TPolyfills = z.infer<typeof SchemaPolyfills>;
export type TSceneRef = z.infer<typeof SchemaSceneRef>;
export type TWebDesktopPackages = z.infer<typeof SchemaWebDesktopPackages>;
export type TWebMobilePackages = z.infer<typeof SchemaWebMobilePackages>;
export declare const SchemaBuildDest: z.ZodString;
export type TBuildDest = z.infer<typeof SchemaBuildDest>;
export declare const SchemaRunResult: z.ZodString;
export type TRunResult = z.infer<typeof SchemaRunResult>;
