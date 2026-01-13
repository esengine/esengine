import { CCON } from 'cc/editor/serialization';
import { IAsset } from '../../../../assets/@types/protected';
import { AssetSerializeOptions } from '../../../@types/protected';
export declare function hasCCONFormatAssetInLibrary(asset: IAsset): boolean;
export declare function getCCONFormatAssetInLibrary(asset: IAsset): string;
export declare function getDesiredCCONExtensionMap(serializeOption: AssetSerializeOptions): string;
export declare function outputCCONFormat(ccon: CCON, fullBaseName: string): Promise<void>;
