import { ProjectType } from './project/@types/public';
/**
 * 项目管理器，提供打开项目、创建项目的入口
 */
declare class ProjectManager {
    private _currentLauncher;
    /**
     * 查询所有项目模板，用于创建的命令行选项显示
     * @returns
     */
    queryTemplates(): void;
    /**
     * 创建一个项目
     * @param projectPath
     * @param type
     * @returns
     */
    create(projectPath: string, type?: ProjectType, template?: string): Promise<boolean>;
    /**
     * 打开某个项目
     * @param path
     */
    open(path: string): Promise<void>;
    close(): Promise<void>;
}
export declare const projectManager: ProjectManager;
export {};
