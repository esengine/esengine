/**
 * 启动资源数据库，依赖于 project, engine 的初始化
 */
export declare function startupAssetDB(): Promise<void>;
export { default as assetManager } from './manager/asset';
export { default as assetDBManager } from './manager/asset-db';
