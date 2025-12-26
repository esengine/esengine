/**
 * @zh ESEngine 资产加载器
 * @en ESEngine asset loader
 *
 * @zh 实现 IAssetLoader 接口，用于通过 AssetManager 加载行为树文件。
 * 此文件仅在使用 ESEngine 时需要。
 *
 * @en Implements IAssetLoader interface for loading behavior tree files via AssetManager.
 * This file is only needed when using ESEngine.
 */

import type {
    IAssetLoader,
    IAssetParseContext,
    IAssetContent,
    AssetContentType
} from '@esengine/asset-system';
import { Core } from '@esengine/ecs-framework';
import { BehaviorTreeData } from '../execution/BehaviorTreeData';
import { BehaviorTreeAssetManager } from '../execution/BehaviorTreeAssetManager';
import { EditorToBehaviorTreeDataConverter } from '../Serialization/EditorToBehaviorTreeDataConverter';
import { BehaviorTreeAssetType } from '../constants';

/**
 * @zh 行为树资产接口
 * @en Behavior tree asset interface
 */
export interface IBehaviorTreeAsset {
    /** @zh 行为树数据 @en Behavior tree data */
    data: BehaviorTreeData;
    /** @zh 文件路径 @en File path */
    path: string;
}

/**
 * @zh 行为树加载器
 * @en Behavior tree loader implementing IAssetLoader interface
 */
export class BehaviorTreeLoader implements IAssetLoader<IBehaviorTreeAsset> {
    readonly supportedType = BehaviorTreeAssetType;
    readonly supportedExtensions = ['.btree'];
    readonly contentType: AssetContentType = 'text';

    /**
     * @zh 从内容解析行为树资产
     * @en Parse behavior tree asset from content
     */
    async parse(content: IAssetContent, context: IAssetParseContext): Promise<IBehaviorTreeAsset> {
        if (!content.text) {
            throw new Error('Behavior tree content is empty');
        }

        // Convert to runtime data
        const treeData = EditorToBehaviorTreeDataConverter.fromEditorJSON(content.text);

        // Use file path as ID
        const assetPath = context.metadata.path;
        treeData.id = assetPath;

        // Also register to BehaviorTreeAssetManager for legacy code
        const btAssetManager = Core.services.tryResolve(BehaviorTreeAssetManager);
        if (btAssetManager) {
            btAssetManager.loadAsset(treeData);
        }

        return {
            data: treeData,
            path: assetPath
        };
    }

    /**
     * @zh 释放资产
     * @en Dispose asset
     */
    dispose(asset: IBehaviorTreeAsset): void {
        const btAssetManager = Core.services.tryResolve(BehaviorTreeAssetManager);
        if (btAssetManager && asset.data) {
            btAssetManager.unloadAsset(asset.data.id);
        }
    }
}
