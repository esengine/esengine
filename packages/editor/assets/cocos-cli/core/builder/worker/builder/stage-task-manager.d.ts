import { BuildTaskBase } from './manager/task-base';
import { IBuildOptionBase } from '../../@types';
import { IBuildHooksInfo, IBuildStageTask, IBuildStageItem } from '../../@types/protected';
export interface IBuildStageConfig extends IBuildStageItem {
    root: string;
    hooksInfo: IBuildHooksInfo;
    buildTaskOptions: IBuildOptionBase;
}
export declare class BuildStageTask extends BuildTaskBase implements IBuildStageTask {
    options: IBuildOptionBase;
    hooksInfo: IBuildHooksInfo;
    private root;
    hookMap: Record<string, string>;
    constructor(id: string, config: IBuildStageConfig);
    run(): Promise<boolean>;
    break(reason: string): void;
    handleHook(func: Function, internal: boolean): Promise<void>;
    saveOptions(): Promise<void>;
}
