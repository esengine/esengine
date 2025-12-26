/**
 * @zh 资产管理器接口（可选依赖）
 * @en Asset manager interface (optional dependency)
 *
 * @zh 行为树系统的可选资产管理器接口。
 * 当与 ESEngine 的 asset-system 集成时，传入 IAssetManager 实例。
 * 不使用 ESEngine 时，可以直接使用 BehaviorTreeAssetManager.loadFromEditorJSON()。
 *
 * @en Optional asset manager interface for behavior tree system.
 * When integrating with ESEngine's asset-system, pass an IAssetManager instance.
 * When not using ESEngine, use BehaviorTreeAssetManager.loadFromEditorJSON() directly.
 */

import type { BehaviorTreeData } from '../execution/BehaviorTreeData';

/**
 * @zh 行为树资产内容
 * @en Behavior tree asset content
 */
export interface IBehaviorTreeAssetContent {
    /** @zh 行为树数据 @en Behavior tree data */
    data: BehaviorTreeData;
    /** @zh 文件路径 @en File path */
    path: string;
}

/**
 * @zh 简化的资产管理器接口
 * @en Simplified asset manager interface
 *
 * @zh 这是行为树系统需要的最小资产管理器接口。
 * ESEngine 的 IAssetManager 实现此接口。
 * 其他引擎可以提供自己的实现。
 *
 * @en This is the minimal asset manager interface required by the behavior tree system.
 * ESEngine's IAssetManager implements this interface.
 * Other engines can provide their own implementation.
 */
export interface IBTAssetManager {
    /**
     * @zh 通过 GUID 加载资产
     * @en Load asset by GUID
     */
    loadAsset(guid: string): Promise<{ asset: IBehaviorTreeAssetContent | null } | null>;

    /**
     * @zh 通过 GUID 获取已加载的资产
     * @en Get loaded asset by GUID
     */
    getAsset<T = IBehaviorTreeAssetContent>(guid: string): T | null;
}
