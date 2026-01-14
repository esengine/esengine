

export interface ImportConfiguration {
    globList: string[];
    restoreAssetDBFromCache: boolean;
    createTemplateRoot: string;
    /**
     * 资源 userData 的默认值
     */
    userDataTemplate?: Record<string, any>;
}