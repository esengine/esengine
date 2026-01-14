import { Platform } from '../../../@types';
import { IBuildTemplate, BuildTemplateConfig } from '../../../@types/protected';
export declare class BuildTemplate implements IBuildTemplate {
    _buildTemplateDirs: string[];
    map: Record<string, {
        url: string;
        path: string;
    }>;
    _versionUser: string;
    config?: BuildTemplateConfig;
    get isEnable(): boolean;
    constructor(platform: Platform | string, taskName: string, config?: BuildTemplateConfig);
    query(name: string): string;
    private _initVersion;
    findFile(relativeUrl: string): string;
    initUrl(relativeUrl: string, name?: string): string | undefined;
    copyTo(dest: string): Promise<void>;
}
