import { type } from 'os';
import { IAsset, IAssetInfo, VirtualAsset, Asset, IExportData, IAssetType } from './asset';
import { Migrate } from '@cocos/asset-db/libs/importer';

export interface CustomOperator {
    label?: string; // 处理方法名，displayName 将会出现在一些文档定义上
    operator: (...args: any[]) => any | Promise<any>;
    public?: boolean; // 是否公开此方法在查询列表上
    // 将来可能有的其他描述信息，比如图信息配置
};

export type ThumbnailSize = 'large' | 'small' | 'middle' | 'origin';

export interface Importer {
    version: string; // 对用户可见的版本号，影响数据迁移、meta 文件内的版本号
    versionCode?: number; // 对内判断导入是否变化的版本号，用户不可见

    /**
     * 实际导入流程
     * @param asset
     */
    import(asset: VirtualAsset | Asset): Promise<boolean>;
    // ---- 一些导入过程中需要的行为配置 ----
    migrations?: Migrate[];

    afterSubAssetsImport?(asset: Asset): Promise<void>; //后续理论上是 createSubAsset 的时候可以监听它的 import 完成行为

    /**
     * 是否强制重新导入
     * @param asset
     */
    force?(asset: VirtualAsset | Asset): Promise<boolean>;
}

export interface IExportOptions {
    debug: boolean;
    compressUUID: boolean;
    stripDefault: boolean;
    canUseCache: boolean;
}

export interface Exporter {
    // 导入接口，生成需要被放置在 importer 和 native 目录下的资源文件路径
    // 其中：默认 import 的结果会按照 uuid 的剪裁路径拼接规则存放在 asset/import 目录下, native 同理
    generateExportData?: (asset: IAsset, options?: Partial<IExportOptions>) => IExportData | Promise<IExportData>;

    // 根据配置路径导出资源到目标目录下，内置了默认的拷贝行为，这个钩子主要用于处理 font 字体拷贝这类的
    outputExportData?: (src: IExportData, dest: IExportData) => boolean | Promise<boolean>;
}

export type AssetHandler = AssetHandlerBase | CustomAssetHandler;

export interface CustomAssetHandler extends Partial<AssetHandlerBase> {
    name: string;
    // 继承的资源处理器名称
    extends: string;
    // 通过钩子，扩展已有的资源导入流程
    importer?: ImporterHook | Importer;
}

export interface AssetHandlerBase extends CustomHandlerBase {
    /**
     * 资源的显示名称，支持 i18n:xxx
     */
    displayName?: string;
    /**
     * 资源描述信息，支持 i18n:xxx
     */
    description?: string;
    /**
     * 资源描述文档
     */
    docURL?: string;

    /**
     * 检查文件是否适用于这个处理器
     * @param asset
     */
    validate?(asset: IAsset): Promise<boolean>;

    // 资源导入行为处理
    importer: Importer;
    // 定义资源的导出行为，构建将会调用此处的方法
    exporter?: Exporter;

    /**
     * 自定义资源销毁行为，可选，无此方法时仅走 db 默认销毁资源的流程
     * @param asset 
     * @returns 
     */
    destroy?: (asset: IAsset) => Promise<void>;

    // 对应导入资源在导入后的资源类型信息，未传递默认为 cc.Asset
    assetType?: IAssetType;

    // 指定资源的 userData 配置
    userDataConfig?: {
        // 用于 userData 默认值的渲染界面
        default: Record<string, IUerDataConfigItem>;

        /**
         * 获取指定资源的 userData 配置，可选，如配置需要根据资源做差异化处理可以在此配置
         * @return 自定义配置的定义，包括渲染定义
         * @param asset 
         */
        generate?(asset: IAsset): Promise<Record<string, IUerDataConfigItem>>;
    };

    // 指定资源的缩略图信息，默认值为必填项，thumbnail 为可选性
    iconInfo?: {
        default: ThumbnailInfo;

        /**
         * 获取某个资源的预览图信息（预览图地址，icon 图标等）
         * @return 缩略图信息
         * @param asset 
         */
        generateThumbnail?(asset: IAsset): ThumbnailInfo | Promise<ThumbnailInfo>;
    };

    /**
     * 资源创建信息
     */
    createInfo?: {
        generateMenuInfo?(): ICreateMenuInfo[] | Promise<ICreateMenuInfo[]>;

        /**
         * 创建当前资源，可选，无此方法时走 db 默认创建资源的流程（需要提供模板地址）
         * @param option 
         */
        create?(option: CreateAssetOptions): Promise<string>;

        /**
         * 保存当前资源，可选，无此方法时走 db 默认保存资源的流程
         * @param asset 需要保存的资源信息
         * @param content 资源内容
         */
        save?(asset: IAsset, content: string | Buffer | JSON): boolean | Promise<boolean>;

        // 阻止默认的模板菜单自动创建，默认为 false ，如果 generateMenuInfo 里接管了模板菜单的生成，此处需要设置
        preventDefaultTemplateMenu?: boolean;
    };

    // 虚拟资源可以实例化成实体的话，会带上这个扩展名
    instantiation?: string;
}

export interface FileNameCheckConfig {
    // 匹配规则
    regStr: string;
    // 匹配失败时的提示类型
    failedType: 'error' | 'warn' | 'info',
    // 匹配失败时的提示信息，支持 i18n:xxx
    failedInfo: string;
}

export interface ICreateMenuInfo {
    // 新建菜单名称，支持 i18n:xxx
    label: string;
    // 模板名称，默认为 default ，作为模板选择的唯一标识符
    name: string;
    // 创建的默认文件名称带后缀，具体实际上是为 assets 面板提供的数据，assets 面板新建时，需要先让用户填写清楚命名最后才创建
    fullFileName: string;

    // 资源文件内容，支持字符串、Buffer、JSON
    content?: string | Buffer | JSON;
    // 资源文件模板地址，例如 db://xxx/ani ，支持 url 与绝对路径
    template?: string;
    // (当 content 与 template 都未传递时，将创建文件夹)
    // (当 content 与 template 都传递时，优先使用 content 创建文件)

    // 创建类型的 handler 名称，默认为当前处理器名称
    handler?: string;

    // 创建子菜单
    submenu?: ICreateMenuInfo[];
    // 分组名称
    group?: string;

    // 资源创建时的名称校验规则
    fileNameCheckConfigs?: FileNameCheckConfig[];
}

export interface CustomHandlerBase {
    /**
     * 导入器名称
     */
    name: string;

    /**
     * 打开资源文件行为
     * @param asset 
     */
    open?(asset: IAsset): boolean | Promise<boolean>;

    /**
     * 一些自定义的处理行为方法，方法 key 即 ID 是唯一的
     * 同名方法将会警告并覆盖内部，如需复用内部处理行为可以通过 API 调用
     */
    customOperationMap?: Record<string, CustomOperator>;
}

/**
 * 扩展已有的资源处理器(Importer 保持原样)
 */
export interface CustomHandler extends CustomHandlerBase {
    handlerList: string[];

    // 通过钩子，扩展已有的资源导入流程
    importer?: {
        before: (asset: IAsset) => Promise<boolean>;
        after: (asset: IAsset) => Promise<boolean>;
    };

    // ----------------- 资源基础操作相关 -------------------
    // 通过钩子，扩展已有的资源导入流程，做一些本地化处理
    importer?: ImporterHook;

    /**
     * 一些自定义的处理行为方法，方法 key 即 ID 是唯一的
     * 同名方法将会警告并覆盖内部，如需复用内部处理行为可以通过 API 调用
     */
    customOperationMap?: Record<string, CustomOperator>;
}

export interface ImporterHook {
    before?: (asset: IAsset) => Promise<boolean>;
    after?: (asset: IAsset) => Promise<boolean>;
}

export interface CreateAssetOptions {
    // 资源创建的输出地址，支持绝对路径和 url
    target: string;

    // 资源文件内容，支持字符串、Buffer、JSON
    content?: string | Buffer | JSON;
    // 资源文件模板地址，例如 db://xxx/ani ，支持 url 与绝对路径
    template?: string;
    // (当 content 与 template 都未传递时，将创建文件夹)
    // (当 content 与 template 都传递时，优先使用 content 创建文件)

    // 资源处理器名称，决定了此新建资源将由哪个资源处理器处理，未指定时将由 target 的后缀查找处理器
    handler?: string;
    // 指定 uuid ，由于 uuid 也有概率冲突，uuid 冲突时会自动重新分配 uuid
    uuid?: string;
    // 默认 false 不覆盖同名时文件将会重命名指定的 path
    overwrite?: boolean;
    // 是否自动重命名冲突文件，默认 false
    rename?: boolean;
    // 新建资源时指定的一些 userData 默认配置值
    userData?: Record<string, any>;
    // 传递一些自定义配置信息，可以在自定义资源处理器内使用
    customOptions?: Record<string, any>;
}

export interface CreateAssetDialogOptions {
    // 与资源处理器一对一的处理行为
    handler?: string;
    // 使用 type 时，由于同一个 type 会对应多种的实体资源，默认取第一个匹配的创建行为
    ccType?: string;
    // 默认创建地址
    url?: string;
    // 默认的资源模板地址
    template?: string;
}

export interface ExportAssetOptions {
    customOptions?: Record<string, string>;
    output: string;
}

export interface ThumbnailInfo {
    type: 'icon' | 'image',
    value: string; // 具体 icon 名字或者 image 路径，image 路径支持绝对路径、 db:// 、 project:// 、和 packages:// 下的路径
}

export interface ICONConfig extends ThumbnailInfo {
    // 是否支持缩略图，如存在可以单独像 db 查询缩略图信息
    thumbnail?: boolean;
}

export type UIType = 'ui-select' | 'ui-checkbox' | 'ui-input' | 'ui-textarea' | 'ui-number-input' | 'ui-checkbox';

export interface IUerDataConfigItem {
    key?: string; // 唯一标识符
    // 配置显示的名字，如果需要翻译，则传入 i18n:${key}
    label?: string;
    // 设置的简单说明
    description?: string;

    // 默认值
    default?: any;
    // 配置的类型
    type?: 'array' | 'object';
    itemConfigs?: IUerDataConfigItem[] | Record<string, IUerDataConfigItem>;
    render?: {
        ui: string;
        attributes?: Record<string, string | boolean | number>;
        items?: Array<{
            label: string;
            value: string;
        }>;
    };
}


export interface IAssetConfig {
    displayName?: string;
    description?: string;
    docURL?: string;
    userDataConfig?: Record<string, IUerDataConfigItem>;
    iconInfo?: ThumbnailInfo;
}