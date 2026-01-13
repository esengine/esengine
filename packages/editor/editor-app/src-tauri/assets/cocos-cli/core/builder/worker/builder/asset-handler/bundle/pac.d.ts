import { TextureCompress } from '../texture-compress';
import { IBundle, IAtlasInfo, IPacInfo } from '../../../../@types/protected';
export declare function sortBundleInPac(bundles: IBundle[], atlas: IAtlasInfo, pacInfo: IPacInfo, dependedAssets: Record<string, string[]>, imageCompressManager?: TextureCompress): void;
