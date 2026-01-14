import ts from 'typescript';
import { DBInfo } from '../@types/config-export';
export interface DbURLInfo {
    dbURL: string;
    target: string;
}
export declare class TypeScriptConfigBuilder {
    private _realTsConfigPath;
    private _tempDirPath;
    private _configFilePath;
    private _declarationHomePath;
    private _engineTsPath;
    private _projectPath;
    private _dbInfos;
    private internalTsConfig;
    private internalDbURLInfos;
    constructor(projectPath: string, engineTsPath: string);
    setDbURLInfos(dbInfos: DBInfo[]): void;
    getTempPath(): string;
    getProjectPath(): string;
    getRealTsConfigPath(): string;
    getInternalDbURLInfos(): Promise<Readonly<DbURLInfo>[]>;
    getCompilerOptions(): Promise<Readonly<ts.CompilerOptions>>;
    generateDeclarations(types: string[]): Promise<void>;
    buildCommonConfig(): Promise<void>;
    private addEngineDeclarations;
    private addJsbDeclarations;
    private addEnvDeclarations;
    private addCustomMacroDeclarations;
    private addDbPathMappings;
    private tsConfigTypePath;
    /**
     * 在收到 custom-macro-changed 消息后，更新相关自定义宏配置
     * 包括 cc.custom-macro.d.ts 和 custom-macro.js
     */
    updateCustomMacro(): Promise<void>;
    /**
     * 更新 custom-macro.js 文件，用于 Web 运行时判断
     */
    updateCustomMacroJS(): Promise<void>;
    getDbURLInfos(): Promise<DbURLInfo[]>;
}
