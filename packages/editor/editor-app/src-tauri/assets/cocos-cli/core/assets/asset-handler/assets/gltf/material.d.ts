import { Asset } from '@cocos/asset-db';
import { GltfConverter } from '../utils/gltf-converter';
import { DefaultGltfAssetFinder } from './asset-finder';
import { AssetHandler } from '../../../@types/protected';
export declare const GltfMaterialHandler: AssetHandler;
export default GltfMaterialHandler;
export declare function dumpMaterial(asset: Asset, assetFinder: DefaultGltfAssetFinder, gltfConverter: GltfConverter, index: number, name: string): Promise<string | null>;
