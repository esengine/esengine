import { ConfigurationScope } from '../../configuration';
import { IBuildCommonOptions } from '../@types';
import { IBuilderConfigItem } from '../@types/protected';
import { BuildConfiguration } from '../@types/config-export';
declare class BuilderConfig {
    /**
     * 持有的可双向绑定的配置管理实例
     */
    private _configInstance;
    getProject<T>(path?: string, scope?: ConfigurationScope): Promise<T>;
    setProject(path: string, value: any, scope?: ConfigurationScope): Promise<boolean>;
    commonOptionConfigs: Record<string, IBuilderConfigItem>;
    getBuildCommonOptions(): IBuildCommonOptions;
    getDefaultConfig(): BuildConfiguration;
    private _projectRoot;
    private _buildTemplateDir;
    private _projectTempDir;
    get projectRoot(): string;
    get buildTemplateDir(): string;
    get projectTempDir(): string;
    private _init;
    init(): Promise<void>;
}
declare const _default: BuilderConfig;
export default _default;
