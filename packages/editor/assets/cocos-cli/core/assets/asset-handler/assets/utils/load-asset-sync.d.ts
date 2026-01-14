import { Constructor, Asset } from 'cc';
export declare function loadAssetSync<T extends Asset>(uuid: string, type: Constructor<T>): T | undefined;
