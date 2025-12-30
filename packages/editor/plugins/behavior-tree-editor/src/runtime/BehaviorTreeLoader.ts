/**
 * @zh ESEngine 资产加载器
 * @en ESEngine asset loader
 * @internal
 */

import { Core } from '@esengine/ecs-framework';
import {
    BehaviorTreeAssetManager,
    EditorToBehaviorTreeDataConverter,
    BehaviorTreeAssetType,
    type BehaviorTreeData
} from '@esengine/behavior-tree';

/**
 * @zh 行为树资产接口
 * @en Behavior tree asset interface
 * @internal
 */
export interface IBehaviorTreeAsset {
    data: BehaviorTreeData;
    path: string;
}

/**
 * @zh 行为树加载器
 * @en Behavior tree loader implementing IAssetLoader interface
 * @internal
 */
export class BehaviorTreeLoader {
    readonly supportedType = BehaviorTreeAssetType;
    readonly supportedExtensions = ['.btree'];
    readonly contentType = 'text' as const;

    async parse(content: { text?: string }, context: { metadata: { path: string } }): Promise<IBehaviorTreeAsset> {
        if (!content.text) {
            throw new Error('Behavior tree content is empty');
        }

        const treeData = EditorToBehaviorTreeDataConverter.fromEditorJSON(content.text);
        const assetPath = context.metadata.path;
        treeData.id = assetPath;

        const btAssetManager = Core.services.tryResolve(BehaviorTreeAssetManager);
        if (btAssetManager) {
            btAssetManager.loadAsset(treeData);
        }

        return {
            data: treeData,
            path: assetPath
        };
    }

    dispose(asset: IBehaviorTreeAsset): void {
        const btAssetManager = Core.services.tryResolve(BehaviorTreeAssetManager);
        if (btAssetManager && asset.data) {
            btAssetManager.unloadAsset(asset.data.id);
        }
    }
}
