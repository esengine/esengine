import { TextureCompress } from '../texture-compress';
import { IBundle } from '../../../../@types/protected';
import { BuilderAssetCache } from '../../manager/asset';
export declare function bundleDataTask(bundle: IBundle, imageCompressManager: TextureCompress): void;
export declare function bundleOutputTask(bundle: IBundle, cache: BuilderAssetCache): Promise<void>;
