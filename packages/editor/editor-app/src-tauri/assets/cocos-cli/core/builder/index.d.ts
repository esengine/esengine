import { IBuildCommandOption, IBuildResultData, IBuildStageOptions, IBuildTaskOption, IBundleBuildOptions, IPreviewSettingsResult, Platform } from './@types/private';
import { BuildConfiguration } from './@types/config-export';
export declare function init(platform?: string): Promise<void>;
export declare function build<P extends Platform>(platform: P, options?: IBuildCommandOption): Promise<IBuildResultData>;
export declare function buildBundleOnly(bundleOptions: IBundleBuildOptions): Promise<IBuildResultData>;
export declare function executeBuildStageTask(taskId: string, stageName: string, options: IBuildStageOptions): Promise<IBuildResultData>;
export declare function getPreviewSettings<P extends Platform>(options?: IBuildTaskOption<P>): Promise<IPreviewSettingsResult>;
export declare function queryBuildConfig(): Promise<BuildConfiguration>;
export declare function queryDefaultBuildConfigByPlatform(platform: Platform): Promise<IBuildTaskOption<string>>;
