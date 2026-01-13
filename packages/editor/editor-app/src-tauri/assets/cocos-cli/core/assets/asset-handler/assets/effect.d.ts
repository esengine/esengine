import { Asset } from '@cocos/asset-db';
import { AssetHandler } from '../../@types/protected';
export interface IChunkInfo {
    name: string | undefined;
    content: string | undefined;
}
export declare const autoGenEffectBinInfo: {
    autoGenEffectBin: boolean;
    waitingGenEffectBin: boolean;
    waitingGenEffectBinTimmer: NodeJS.Timeout | null;
    effectBinPath: string;
};
export declare const EffectHandler: AssetHandler;
export default EffectHandler;
/**
 * source/contributions/asset-db-hook
 * effect 导入器比较特殊，单独增加了一个在所有 effect 导入完成后的钩子
 * 这个函数名字是固定的，如果需要修改，需要一同修改 cocos-editor 仓库里的 asset-db 插件代码
 * @param effectArray
 * @param force 强制重编
 */
export declare function afterImport(force?: boolean): Promise<void>;
/**
 * 编译所有的 effect
 * 调用入口：source/contributions/asset-db-script
 * 调用入口：this.afterImport
 * @param effectArray
 * @param force 强制重编
 */
export declare function recompileAllEffects(effectArray: Asset[], force?: boolean): Promise<void>;
