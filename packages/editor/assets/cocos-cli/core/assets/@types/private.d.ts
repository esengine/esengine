export {
    ContributionInfo,
    ExecuteAssetDBScriptMethodOptions,
} from './public';

export * from './protected';
export * from './public';
export * from './private/plugin';

export interface IAssetDBConfig {
    name: string;
    target: string;
    readonly: boolean;
    visible: boolean;
    ignoreGlob?: string;
}

export interface IDatabaseInfo {
    name: string; // 数据库名字
    target: string; // 源目录地址
    library: string; // 导入数据地址
    temp: string; // 临时目录地址
    readonly: boolean; // 是否只读
    visible: boolean; // 是否显示
}

export interface IMoveOptions {
    confirmOverwrite?: boolean; // 是否要提示询问覆盖文件
    overwrite?: boolean; // 是否强制覆盖文件
}

export interface ICreateOption {
    src?: string; // 源文件地址，如果传入 content 为空，则复制这个指向的文件
    overwrite?: boolean; // 是否覆盖文件
}
