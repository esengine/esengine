import type { CocosParams } from './base/default';
export declare const EXT_LIST: string[];
export declare class cchelper {
    static replaceEnvVariables(str: string): string;
    static fixPath(p: string): string;
    static delay(ms: number): Promise<void>;
    static join(p1: string, ...p2: string[]): string;
    static copyFileSync(srcRoot: string, srcFile: string, dstRoot: string, dstFile: string): void;
    static copyFileAsync(src: string, dst: string): Promise<void>;
    static copyRecursiveAsync(srcDir: string, dst: string): Promise<void>;
    static prepareDirsForFiles(srcRoot: string, files: string[], dstDir: string): void;
    static parallelCopyFiles(par: number, srcRoot: string, files: string[], dstDir: string): Promise<void>;
    static makeDirectoryRecursive(dir: string): void;
    static removeDirectoryRecursive(dir: string): Promise<void>;
    static copyFilesWithConfig(cfg: {
        from: string;
        to: string;
        include?: string[];
        exclude?: string[];
    }, srcRoot: string, dstRoot: string): Promise<void>;
    static replaceInFile(patterns: {
        reg: string | RegExp;
        text: string;
    }[], filepath: string): Promise<void>;
    static exactValueFromFile(regexp: RegExp, filename: string, idx: number): string | undefined;
    static runCmd(cmd: string, args: string[], slient: boolean, cwd?: string): Promise<void>;
    static existsSync(filePath: string): boolean;
    static checkJavaHome(): boolean;
    static accessSync(file: string, mode: number): boolean;
    static which(executable: string): null | string;
}
export declare const toolHelper: {
    getXcodeMajorVerion(): number;
    runCommand(cmd: string, args: string[], cb?: (code: number, stdout: string, stderr: string) => void): Promise<boolean>;
    runCmake(args: string[], workDir?: string): Promise<void>;
    runXcodeBuild(args: string[]): Promise<void>;
};
export declare class Paths {
    static enginePath: string;
    static nativeRoot: string;
    static projectDir: string;
    static cmakePath: string;
    /**
     * ios/mac/windows/android
     */
    private platform;
    /**
     * ios/mac/win64/win32/android
     */
    private platformTemplateDirName;
    /**
     * build/[platform]
     */
    buildDir: string;
    /**
     * build/[platform]/data
     */
    buildAssetsDir: string;
    constructor(params: CocosParams<Object>);
    /**
     * [project]/native/engine/common
     */
    get commonDirInPrj(): string;
    /**
     * [engine]/templates/common
     */
    get commonDirInCocos(): string;
    /**
     * [project]/native/engine
     */
    get nativeTemplateDirInPrj(): string;
    /**
     * [engine]/templates
     */
    get nativeTemplateDirInCocos(): string;
    /**
     * [project]/native/engine/[platformTemplateDirName]
     */
    get platformTemplateDirInPrj(): string;
    /**
     * [engine]/templates/[platformTemplateDirName]
     */
    get platformTemplateDirInCocos(): string;
    /**
     * build/[platform]/proj
     */
    get nativePrjDir(): string;
}
