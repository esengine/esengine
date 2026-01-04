/**
 * @zh 蓝图系统 - 处理所有带有 BlueprintComponent 的实体
 * @en Blueprint System - Processes all entities with BlueprintComponent
 */

import { EntitySystem, Matcher, ECSSystem, type Entity, Time } from '@esengine/ecs-framework';
import { BlueprintComponent } from './BlueprintComponent';
import { registerAllComponentNodes } from '../registry';

/**
 * @zh 蓝图执行系统
 * @en Blueprint execution system
 *
 * @zh 自动处理所有带有 BlueprintComponent 的实体，管理蓝图的初始化、执行和清理
 * @en Automatically processes all entities with BlueprintComponent, manages blueprint initialization, execution and cleanup
 *
 * @example
 * ```typescript
 * import { BlueprintSystem } from '@esengine/blueprint';
 *
 * // 添加到场景
 * scene.addSystem(new BlueprintSystem());
 *
 * // 为实体添加蓝图
 * const entity = scene.createEntity('Player');
 * const blueprint = new BlueprintComponent();
 * blueprint.blueprintAsset = await loadBlueprintAsset('player.bp');
 * entity.addComponent(blueprint);
 * ```
 */
@ECSSystem('BlueprintSystem')
export class BlueprintSystem extends EntitySystem {
    private _componentsRegistered = false;

    constructor() {
        super(Matcher.all(BlueprintComponent));
    }

    /**
     * @zh 系统初始化时注册所有组件节点
     * @en Register all component nodes when system initializes
     */
    protected override onInitialize(): void {
        if (!this._componentsRegistered) {
            registerAllComponentNodes();
            this._componentsRegistered = true;
        }
    }

    /**
     * @zh 处理所有带有蓝图组件的实体
     * @en Process all entities with blueprint components
     */
    protected override process(entities: readonly Entity[]): void {
        const dt = Time.deltaTime;

        for (const entity of entities) {
            const blueprint = entity.getComponent(BlueprintComponent);
            if (!blueprint?.blueprintAsset) continue;

            // 初始化 VM
            if (!blueprint.vm) {
                blueprint.initialize(entity, this.scene!);
            }

            // 自动启动
            if (blueprint.autoStart && !blueprint.isStarted) {
                blueprint.start();
            }

            // 每帧更新
            blueprint.tick(dt);
        }
    }

    /**
     * @zh 实体移除时清理蓝图资源
     * @en Cleanup blueprint resources when entity is removed
     */
    protected override onRemoved(entity: Entity): void {
        const blueprint = entity.getComponent(BlueprintComponent);
        if (blueprint) {
            blueprint.cleanup();
        }
    }
}
