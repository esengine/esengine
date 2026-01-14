import { IBinGroupConfig, IBundle } from '../../../../@types/protected';
export declare function previewBinGroup(bundle: IBundle, threshold: number): Promise<{
    uuidList: string[];
    sizeList: number[];
    totalSize: number;
}>;
export declare function handleBinGroup(bundle: IBundle, config?: IBinGroupConfig): Promise<void>;
export declare function outputBinGroup(bundle: IBundle, config?: IBinGroupConfig): Promise<void>;
