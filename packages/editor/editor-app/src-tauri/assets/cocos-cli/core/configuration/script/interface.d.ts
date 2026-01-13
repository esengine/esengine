/**
 * 配置范围
 */
export type ConfigurationScope = 'default' | 'project';
export declare const MessageType: {
    readonly Save: "configuration:save";
    readonly Registry: "configuration:registry";
    readonly UnRegistry: "configuration:unregistry";
    readonly Reload: "configuration:reload";
    readonly Update: "configuration:update";
    readonly Remove: "configuration:remove";
};
/**
 * 配置的格式
 */
export interface IConfiguration {
    /**
     * 其他配置
     */
    [key: string]: any;
}
