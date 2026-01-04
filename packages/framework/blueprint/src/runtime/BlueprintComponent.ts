/**
 * @zh 蓝图组件 - 将蓝图附加到实体
 * @en Blueprint Component - Attaches a blueprint to an entity
 */

import { Component, ECSComponent, type Entity, type IScene } from '@esengine/ecs-framework';
import { BlueprintAsset } from '../types/blueprint';
import { BlueprintVM } from './BlueprintVM';

/**
 * @zh 蓝图组件，用于将可视化脚本附加到 ECS 实体
 * @en Blueprint component for attaching visual scripts to ECS entities
 *
 * @example
 * ```typescript
 * const entity = scene.createEntity('Player');
 * const blueprint = new BlueprintComponent();
 * blueprint.blueprintAsset = await loadBlueprintAsset('player.bp');
 * blueprint.autoStart = true;
 * entity.addComponent(blueprint);
 * ```
 */
@ECSComponent('Blueprint')
export class BlueprintComponent extends Component {
    /**
     * @zh 蓝图资产引用
     * @en Blueprint asset reference
     */
    blueprintAsset: BlueprintAsset | null = null;

    /**
     * @zh 用于序列化的蓝图资产路径
     * @en Blueprint asset path for serialization
     */
    blueprintPath: string = '';

    /**
     * @zh 实体创建时自动开始执行
     * @en Auto-start execution when entity is created
     */
    autoStart: boolean = true;

    /**
     * @zh 启用 VM 调试模式
     * @en Enable debug mode for VM
     */
    debug: boolean = false;

    /**
     * @zh 运行时 VM 实例
     * @en Runtime VM instance
     */
    vm: BlueprintVM | null = null;

    /**
     * @zh 蓝图是否已启动
     * @en Whether the blueprint has started
     */
    isStarted: boolean = false;

    /**
     * @zh 初始化蓝图 VM
     * @en Initialize blueprint VM
     */
    initialize(entity: Entity, scene: IScene): void {
        if (!this.blueprintAsset) return;

        this.vm = new BlueprintVM(this.blueprintAsset, entity, scene);
        this.vm.debug = this.debug;
    }

    /**
     * @zh 开始执行蓝图
     * @en Start blueprint execution
     */
    start(): void {
        if (this.vm && !this.isStarted) {
            this.vm.start();
            this.isStarted = true;
        }
    }

    /**
     * @zh 停止执行蓝图
     * @en Stop blueprint execution
     */
    stop(): void {
        if (this.vm && this.isStarted) {
            this.vm.stop();
            this.isStarted = false;
        }
    }

    /**
     * @zh 更新蓝图
     * @en Update blueprint
     */
    tick(deltaTime: number): void {
        if (this.vm && this.isStarted) {
            this.vm.tick(deltaTime);
        }
    }

    /**
     * @zh 清理蓝图资源
     * @en Cleanup blueprint resources
     */
    cleanup(): void {
        if (this.vm) {
            if (this.isStarted) {
                this.vm.stop();
            }
            this.vm = null;
            this.isStarted = false;
        }
    }
}
