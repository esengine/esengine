import { CommonResultType } from '../base/schema-base';
import { TBuildOption, TPlatform, TBuildDest, TPlatformCanMake, IRunResultData } from './schema';
export declare class BuilderApi {
    build(platform: TPlatform, options?: TBuildOption): Promise<CommonResultType<{
        code: number;
        custom?: {
            nativePrjDir?: string | undefined;
            previewUrl?: string | undefined;
        } | undefined;
        reason?: string | undefined;
        dest?: string | undefined;
    } | null>>;
    queryDefaultBuildConfig(platform: TPlatform): Promise<CommonResultType<{
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
    } | {
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
    } | {
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
    } | {
        platform: "ios";
        packages: {
            ios?: import("zod").objectOutputType<{
                packageName: import("zod").ZodString;
                osTarget: import("zod").ZodOptional<import("zod").ZodObject<{
                    iphoneos: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    simulator: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, "strip", import("zod").ZodTypeAny, {
                    iphoneos?: boolean | undefined;
                    simulator?: boolean | undefined;
                }, {
                    iphoneos?: boolean | undefined;
                    simulator?: boolean | undefined;
                }>>;
                targetVersion: import("zod").ZodOptional<import("zod").ZodString>;
                developerTeam: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("zod").ZodAny, "strip"> | undefined;
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
    } | {
        platform: "android";
        packages: {
            android?: import("zod").objectOutputType<{
                packageName: import("zod").ZodString;
                keystorePath: import("zod").ZodOptional<import("zod").ZodString>;
                keystorePassword: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("zod").ZodAny, "strip"> | undefined;
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
    } | {
        platform: "mac";
        packages: {
            mac?: import("zod").objectOutputType<{
                packageName: import("zod").ZodString;
            }, import("zod").ZodAny, "strip"> | undefined;
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
    } | {
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
    } | null>>;
    make(platform: TPlatformCanMake, dest: TBuildDest): Promise<CommonResultType<{
        code: number;
        custom?: {
            nativePrjDir?: string | undefined;
            executableFile?: string | undefined;
        } | undefined;
        reason?: string | undefined;
        dest?: string | undefined;
    } | null>>;
    run(platform: TPlatform, dest: TBuildDest): Promise<CommonResultType<IRunResultData>>;
}
