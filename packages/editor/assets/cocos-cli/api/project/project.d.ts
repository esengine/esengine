import { CommonResultType } from '../base/schema-base';
export declare class ProjectApi {
    open(projectPath: string): Promise<CommonResultType<boolean>>;
    close(): Promise<{
        code: 200 | 500;
        data: boolean;
    }>;
}
