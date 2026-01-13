import { Importer as AssetDBImporter } from '@cocos/asset-db';
import { IAsset, IExportData } from '../@types/protected/asset';
import { ICONConfig, AssetHandler, CustomHandler, ICreateMenuInfo, CreateAssetOptions, ThumbnailSize, ThumbnailInfo, IExportOptions, IAssetConfig } from '../@types/protected/asset-handler';
import type { AssetHandlerInfo } from '../asset-handler/config';
interface HandlerInfo extends AssetHandlerInfo {
    pkgName: string;
    internal: boolean;
}
export declare class CustomImporter extends AssetDBImporter {
    constructor(extensions: string[], assetHandler: AssetHandler);
}
declare class AssetHandlerManager {
    static createTemplateRoot: string;
    name2handler: Record<string, AssetHandler>;
    type2handler: Record<string, AssetHandler[]>;
    name2importer: Record<string, CustomImporter>;
    importer2OperateRecord: {
        [importer: string]: {
            [operate: string]: AssetHandler | CustomHandler;
        };
    };
    extname2registerInfo: Record<string, HandlerInfo[]>;
    name2registerInfo: Record<string, HandlerInfo>;
    name2custom: Record<string, CustomHandler>;
    importer2custom: Record<string, CustomHandler[]>;
    _iconConfigMap: Record<string, ICONConfig> | null;
    _userDataCache: Record<string, any>;
    _defaultUserData: Record<string, any>;
    clear(): void;
    compileEffect(_force: boolean): void;
    startAutoGenEffectBin(): void;
    getEffectBinPath(): Promise<string>;
    init(): Promise<void>;
    /**
     * 激活剩余未注册完成的资源处理器
     */
    activateRegisterAll(): Promise<void>;
    private activateRegister;
    register(pkgName: string, assetHandlerInfos: AssetHandlerInfo[], internal: boolean): void;
    unregister(pkgName: string, assetHandlerInfos: AssetHandlerInfo[]): void;
    findImporter(asset: IAsset, withoutDefaultImporter?: boolean): Promise<AssetDBImporter | null>;
    getDefaultImporter(asset: IAsset): Promise<AssetDBImporter | null>;
    _findImporterInRegisterInfo(asset: IAsset, registerInfos: HandlerInfo[]): Promise<AssetDBImporter | undefined>;
    add(assetHandler: AssetHandler, extensions: string[]): void;
    /**
     * 获取各个资源的新建列表数据
     */
    getCreateMap(): Promise<ICreateMenuInfo[]>;
    /**
     * 根据导入器名称获取资源模板信息
     * @param importer
     * @returns
     */
    getCreateMenuByName(importer: string): Promise<ICreateMenuInfo[]>;
    /**
     * 生成创建资源模板
     * @param importer
     */
    createAssetTemplate(importer: string, templatePath: string, target: string): Promise<boolean>;
    queryIconConfigMap(): Promise<Record<string, ICONConfig>>;
    /**
     * 创建资源
     * @param options
     * @returns 返回资源创建地址
     */
    createAsset(options: CreateAssetOptions): Promise<string>;
    /**
     * 调用自定义的销毁资源流程
     * @param asset
     * @returns
     */
    destroyAsset(asset: IAsset): Promise<void>;
    saveAsset(asset: IAsset, content: string | Buffer): Promise<boolean>;
    generateThumbnail(asset: IAsset, size?: number | ThumbnailSize): Promise<ThumbnailInfo | null>;
    /**
     * 生成某个资源的导出文件信息
     * @param asset
     * @param options
     * @returns
     */
    generateExportData(asset: IAsset, options?: IExportOptions): Promise<IExportData | null>;
    /**
     * 拷贝生成导入文件到最终目标地址
     * @param handler
     * @param src
     * @param dest
     * @returns
     */
    outputExportData(handler: string, src: IExportData, dest: IExportData): Promise<boolean>;
    /**
     * 查询各个资源的基本配置 MAP
     */
    queryAssetConfigMap(): Promise<Record<string, IAssetConfig>>;
    queryUserDataConfig(asset: IAsset): Promise<false | Record<string, import("../@types/protected/asset-handler").IUerDataConfigItem> | undefined>;
    queryUserDataConfigDefault(importer: string): Promise<Record<string, import("../@types/protected/asset-handler").IUerDataConfigItem> | undefined>;
    runImporterHook(asset: IAsset, hookName: 'before' | 'after'): Promise<void>;
    _findOperateHandler(importer: string, operate: keyof AssetHandler): CustomHandler | AssetHandler | null;
    queryAllImporter(): string[];
    queryAllAssetTypes(): unknown[];
    /**
     * 更新默认配置数据并保存（偏好设置的用户操作修改入口）
     */
    updateDefaultUserData(handler: string, key: string, value: any): Promise<void>;
    /**
     * 更新导入默认值到导入器的渲染配置内部
     * @param handler
     * @param key
     * @param value
     */
    private _updateDefaultUserDataToHandler;
}
declare const assetHandlerManager: AssetHandlerManager;
export default assetHandlerManager;
