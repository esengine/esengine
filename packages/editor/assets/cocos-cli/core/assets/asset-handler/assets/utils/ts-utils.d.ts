import { FileNameCheckConfig } from "../../../@types/protected";
export declare class ScriptNameChecker {
    classNameStringFormat: string;
    requiredCamelCaseClassName: boolean;
    static camelFormatReg: RegExp;
    static classNameFormatReg: RegExp;
    static commentsReg: RegExp;
    static invalidClassNameReg: RegExp;
    static getDefaultClassName(): string;
    constructor(requiredCamelCaseClassName: boolean, classNameStringFormat: string);
    isValid(fileName: string): Promise<{
        state: string;
    }>;
    getValidFileName(fileName: string): Promise<string>;
    static getValidClassName(fileName: string): string;
    getValidCamelCaseClassName(fileName: string): string;
}
export declare class ScriptNameCheckerManager {
    static getScriptChecker(templateContent: string): Promise<ScriptNameChecker>;
}
export declare const DefaultScriptFileNameCheckConfig: FileNameCheckConfig;
