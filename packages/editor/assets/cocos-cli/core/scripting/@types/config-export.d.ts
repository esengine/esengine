export interface ScriptProjectConfig {
    useDefineForClassFields: boolean;
    allowDeclareFields: boolean;
    loose: boolean;
    guessCommonJsExports: boolean;
    exportsConditions: string[];
    preserveSymlinks: boolean;
    importMap: string;
    previewBrowserslistConfigFile?: string;
    updateAutoUpdateImportConfig?: boolean;
}
export interface DBInfo {
    dbID: string;
    target: string;
}
