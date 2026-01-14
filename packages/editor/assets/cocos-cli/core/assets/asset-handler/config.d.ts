import { AssetHandler } from '../@types/protected';
export interface AssetHandlerInfo {
    name: string;
    extensions: string[];
    load: () => AssetHandler | Promise<AssetHandler>;
}
export declare const assetHandlerInfos: AssetHandlerInfo[];
