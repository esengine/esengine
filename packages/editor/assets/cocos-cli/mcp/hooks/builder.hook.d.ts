export declare class BuilderHook {
    private dynamicPlatforms;
    constructor();
    /**
     * 扫描 packages/platforms 目录下的平台插件
     */
    private scanPlatformPackages;
    onRegisterParam(toolName: string, param: any, inputSchemaFields: Record<string, any>): void;
    onBeforeExecute(toolName: string, args: any): void;
    onValidationFailed(toolName: string, paramName: string, error: any): void;
}
