import { Paths } from '../utils';
import { CocosProjectTasks } from './cocosProjectTypes';
import { ICMakeConfig } from '../../type';
export type InternalNativePlatform = 'mac' | 'android' | 'windows' | 'ios';
export interface INativePlatformOptions {
    extends?: InternalNativePlatform;
    overwrite?: InternalNativePlatform;
    create: () => Promise<boolean>;
    genrate: () => Promise<boolean>;
    make?: () => Promise<boolean>;
    run?: () => Promise<boolean>;
    init: (params: CocosParams<Object>) => void;
}
export default abstract class NativePackTool {
    params: CocosParams<Object>;
    paths: Paths;
    cmakeArgs: string[];
    setEnv(key: string, value: any): void;
    init(params: CocosParams<Object>): void;
    protected parseVersion(content: string, key: string, def: number): number;
    protected copyCommonTemplate(): Promise<void>;
    private get projEngineVersionPath();
    private _debugInfo;
    private get DebugInfos();
    private _versionParser;
    private get versionParser();
    /**
     * Debug / Release
     */
    protected get buildType(): string;
    /**
     * Read version number from cocos-version.json
     */
    protected tryReadProjectTemplateVersion(): {
        version: string;
        skipCheck: boolean | undefined;
    } | null;
    /**
     * Read package.json file in the root folder and return the version field.
     */
    protected tryGetEngineVersion(): string | null;
    /**
     * Version condition from compatibility-info.json for current platform.
     */
    protected tryGetCompatibilityInfo(): string | null;
    private commonDirAreIdentical;
    private skipVersionCheck;
    /**
     * The engine version used to generate the 'native/' folder should match the
     * condition written in the 'compatibility-info.json' file.
     */
    private validateTemplateVersion;
    /**
     * Utility function to check if a file exists dst as in src.
     */
    protected validateDirectory(src: string, dst: string, missingDirs: string[]): void;
    /**
     *  Check files under `native/engine/platform` folder
     */
    protected validatePlatformDirectory(missing: string[]): void;
    /**
     * Check if any file removed from the 'native/' folder
     */
    private validateTemplateConsistency;
    /**
     * - Ensure the engine version used to generete 'native/' folder is compatible
     *   with the current engine version.
     * - Check if any file under the 'native/' folder is removed.
     */
    protected validateNativeDir(): void;
    /**
     * Write cocos-version.json into native/common/cocos-version.json
     */
    protected writeEngineVersion(): void;
    protected copyPlatformTemplate(): Promise<void>;
    protected projectNameASCII(): string;
    protected getExecutableNameOrDefault(): string;
    protected executeTemplateTask(tasks: CocosProjectTasks): Promise<void>;
    protected generateCMakeConfig(): Promise<void>;
    protected appendCmakeCommonArgs(args: string[]): void;
    /**
     * 加密脚本，加密后，会修改 cmake 参数，因而需要再次执行 cmake 配置文件的生成
     * @returns
     */
    protected encryptScripts(): Promise<void>;
    /**
     * 解析、执行 cocos-template.json 模板任务
     */
    protected executeCocosTemplateTask(): Promise<void>;
    abstract create(): Promise<boolean>;
    abstract getExecutableFile(): Promise<string>;
    generate?(): Promise<boolean>;
    make?(): Promise<boolean>;
    run?(): Promise<boolean>;
    static openWithIDE?(projPath: string, IDE?: string): Promise<boolean>;
}
export declare class CocosParams<T> {
    platformParams: T;
    debug: boolean;
    projectName: string;
    cmakePath: string;
    platform: InternalNativePlatform;
    platformName: string;
    executableName: string;
    /**
     * engine root
     */
    enginePath: string;
    /**
     * native engine root
     */
    nativeEnginePath: string;
    /**
     * project path
     */
    projDir: string;
    /**
     * build/[platform]
     */
    buildDir: string;
    /**
     * @zh 构建资源路径
     * @en /build/[platform]/data
     */
    buildAssetsDir: string;
    /**
     * @zh 是否加密脚本
     * @en is encrypted
     */
    encrypted?: boolean;
    /**
     * @zh 是否压缩脚本
     * @en is compress script
     */
    compressZip?: boolean;
    /**
     * @zh 加密密钥
     * @en encrypt Key
     */
    xxteaKey?: string;
    /**
     * @zh 是否为模拟器
     * @en is simulator
     */
    simulator?: boolean;
    cMakeConfig: ICMakeConfig;
    constructor(params: CocosParams<T>);
}
