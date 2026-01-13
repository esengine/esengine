import { CommonResultType } from '../base/schema-base';
import { TBuiltinResources } from './schema';
export declare class EngineApi {
    /**
     * @zh 获取内置资源
     * @en Get Builtin Resources
     *
     * 返回 viewport 初始化所需的所有内置资源，包括 shader chunks、effects 和材质配置
     * Returns all builtin resources needed for viewport initialization, including shader chunks, effects, and material configs
     */
    getBuiltinResources(): Promise<CommonResultType<TBuiltinResources>>;
    /**
     * @zh 递归加载所有 chunks
     * @en Recursively load all chunks
     */
    private loadChunks;
    /**
     * @zh 加载所需的 effects
     * @en Load required effects
     */
    private loadEffects;
    /**
     * @zh 检查是否为必需的 effect
     * @en Check if effect is required
     */
    private isRequiredEffect;
}
