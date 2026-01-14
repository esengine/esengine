import { Asset } from '@cocos/asset-db';
import { MeshOptimizerOption } from '../../../@types/userDatas';
import { GltfConverter } from '../utils/gltf-converter';
declare class GlTfReaderManager {
    private _map;
    /**
     *
     * @param asset
     * @param injectBufferDependencies 是否当创建 glTF 转换器的时候同时注入 glTF asset 对其引用的 buffer 文件的依赖。
     */
    getOrCreate(asset: Asset, importVersion: string, injectBufferDependencies?: boolean): Promise<GltfConverter>;
    delete(asset: Asset): void;
}
export declare const glTfReaderManager: GlTfReaderManager;
export declare function getFbxFilePath(asset: Asset, importerVersion: string): Promise<string>;
export declare function getGltfFilePath(asset: Asset, importerVersion: string): Promise<string>;
export declare function getOptimizerPath(asset: Asset, source: string, importerVersion: string, options: MeshOptimizerOption): string | Promise<string>;
export {};
