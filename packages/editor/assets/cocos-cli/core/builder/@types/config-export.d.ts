import { IBuildCommonOptions, WebMobileBuildOptions, IBuildCacheUseConfig, OverwriteProjectSettings, IBundleOptions, UserCompressConfig, WebDesktopBuildOptions } from './public';
export interface BuildConfiguration {
    common: IBuildCommonOptions;
    platforms: {
        'web-desktop'?: WebDesktopBuildOptions & OverwriteProjectSettings;
        'web-mobile'?: WebMobileBuildOptions & OverwriteProjectSettings;
    };
    useCacheConfig?: IBuildCacheUseConfig;
    bundleConfig: {
        custom: Record<string, IBundleOptions>;
    };
    textureCompressConfig: UserCompressConfig;
}
