/**
 * 一些全局路径配置记录
 */
export declare const GlobalPaths: {
    staticDir: string;
    workspace: string;
    enginePath: string;
};
/**
 * CLI 的任务模式
 */
type CLITaskMode = 'hold' | 'simple';
interface IGlobalConfig {
    mode: CLITaskMode;
}
export declare const GlobalConfig: IGlobalConfig;
export {};
