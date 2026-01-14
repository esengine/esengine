import { AssetHandlerType, ISupportCreateType, AssetUserDataMap, IAssetType } from './asset-types';

export interface IAssetMeta<T extends ISupportCreateType | 'unknown' = 'unknown'> {
    ver: string;
    importer: AssetHandlerType;
    imported: boolean;
    uuid: string;
    files: string[];
    subMetas: {
        [index: string]: IAssetMeta<'unknown'>;
    };
    userData: AssetUserDataMap[T extends keyof AssetUserDataMap ? T : 'unknown'];
    displayName?: string;
    id?: string;
    name?: string;
}

// 如果使用了 datakeys 过滤，请使用此接口定义
export interface IAssetInfo {
    name: string; // 资源名字
    source: string; // url 地址
    loadUrl: string; // loader 加载的层级地址
    url: string; // loader 加载地址会去掉扩展名，这个参数不去掉
    file: string; // 绝对路径
    uuid: string; // 资源的唯一 ID
    importer: AssetHandlerType; // 使用的导入器名字
    imported: boolean; // 是否结束导入过程
    invalid: boolean; // 是否导入成功
    type: IAssetType; // 类型
    isDirectory: boolean; // 是否是文件夹
    library: { [key: string]: string }; // 导入资源的 map

    // dataKeys 作用范围
    isBundle?: boolean; // 是否是文件夹
    displayName?: string; // 资源用于显示的名字
    readonly?: boolean; // 是否只读
    visible?: boolean; // 是否显示
    subAssets?: { [key: string]: IAssetInfo }; // 子资源 map
    // 虚拟资源可以实例化成实体的话，会带上这个扩展名
    instantiation?: string;
    redirect?: IRedirectInfo; // 跳转指向资源
    meta?: IAssetMeta,
    parent?: {
        source: string;
        library: { [key: string]: string };
        uuid: string;
    };
    extends?: string[]; // 资源的继承链信息
    mtime?: number; // 资源文件的 mtime
    depends?: string[]; // 依赖的资源 uuid 信息
    dependeds?: string[]; // 被依赖的资源 uuid 信息
}

export interface AssetOperationOption {
    // 是否强制覆盖已经存在的文件，默认 false，传递后会直接覆盖文件，未传递时有冲突会直接抛异常
    overwrite?: boolean;
    // 是否自动重命名冲突文件，默认 false ，传递后会以内部规则自动重命名冲突文件，新的文件名可以在返回值中获取
    rename?: boolean;
}

// Basic information about the resource
// 资源的基础信息
export interface AssetInfo extends IAssetInfo {
    // Asset name
    // 资源名字
    name: string;
    // Asset display name
    // 资源用于显示的名字
    displayName: string;
    // URL
    source: string;
    // loader 加载的层级地址
    path: string;
    // loader 加载地址会去掉扩展名，这个参数不去掉
    url: string;
    // 绝对路径
    file: string;
    // 资源的唯一 ID
    uuid: string;
    // 使用的导入器名字
    importer: string;
    // 类型
    type: string;
    // 是否是文件夹
    isDirectory: boolean;
    // 导入资源的 map
    library: { [key: string]: string };
    // 子资源 map
    subAssets: { [key: string]: AssetInfo };
    // 是否显示
    visible: boolean;
    // 是否只读
    readonly: boolean;

    // 虚拟资源可以实例化成实体的话，会带上这个扩展名
    instantiation?: string;
    // 跳转指向资源
    redirect?: IRedirectInfo;
    // 继承类型
    extends?: string[];
    // 是否导入完成
    imported: boolean;
    // 是否导入失败
    invalid: boolean;
}

export interface IRedirectInfo {
    // 跳转资源的类型
    type: string;
    // 跳转资源的 uuid
    uuid: string;
}

export interface QueryAssetsOption {
    ccType?: string | string[], // 'cc.ImageAsset' 这类，多个用数组
    isBundle?: boolean, // 筛选 asset bundle 信息，搜索子包只能与 pattern 选项共存
    importer?: string | string[], // 导入名称，多个用数组
    pattern?: string, // 路径匹配，globs 格式
    extname?: string | string[], // 扩展名匹配，多个用数组

    // 筛选一些符合 userData 配置的资源
    userData?: Record<string, boolean | string | number>;

    /**
     * @deprecated use ccType instead
     */
    type?: string;
}

export interface AssetOperationOption {
    // 是否强制覆盖已经存在的文件，默认 false
    overwrite?: boolean;
    // 是否自动重命名冲突文件，默认 false
    rename?: boolean;
}

export interface CreateAssetByTypeOptions extends AssetOperationOption {
    /**
     * 指定的模板名称，默认为 default
     */
    templateName?: string;

    /**
     * 资源内容，当 content 与 template 都传递时，优先使用 content 创建文件
     */
    content?: string | Buffer | JSON;
}

export interface AssetDBOptions {
    name: string;
    target: string;
    library: string;
    temp: string;
    interval: number;
    /**
     * 0: 忽略错误
     * 1: 仅仅打印错误
     * 2: 打印错误、警告
     * 3: 打印错误、警告、日志
     * 4: 打印错误、警告、日志、调试信息
     */
    level: number;
    ignoreFiles: string[];
    preImportExtList?: string[];
    readonly: boolean;
    visible: boolean;
    ignoreGlob?: string;
}

export interface ExecuteAssetDBScriptMethodOptions {
    name: string;
    method: string;
    args?: any[];
}

export * from './asset-types';