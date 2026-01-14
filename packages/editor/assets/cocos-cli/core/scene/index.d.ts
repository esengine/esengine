import { sceneConfigInstance } from './scene-configs';
export * from './common';
export * from './main-process';
export { sceneConfigInstance };
/**
 * 启动场景
 * @param enginePath 引擎目录
 * @param projectPath 项目目录
 */
export declare function startupScene(enginePath: string, projectPath: string): Promise<void>;
