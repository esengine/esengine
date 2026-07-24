/**
 * @zh 通用蓝图运行器 —— 不依赖 ECS，可由任意宿主驱动(例如 Cocos 的 cc.Component)
 * @en Generic blueprint runner — no ECS required; can be driven by any host (e.g. a Cocos cc.Component)
 *
 * @zh BlueprintVM 本身与 ECS 无关，本类只是把"绑定宿主(self) + 生命周期(start/tick/stop)"
 *     封装成方便在非 ECS 环境里调用的形态。组件的方法/属性节点在未连线时会默认作用于 `self`。
 * @en The BlueprintVM is already ECS-agnostic; this class simply wraps "bind a host (self) +
 *     lifecycle (start/tick/stop)" for non-ECS environments. A component's method/property nodes
 *     target `self` by default when their `component` input is unconnected.
 *
 * @example
 * ```typescript
 * // 在 Cocos 组件里驱动蓝图，无需 Scene / 实体 / BlueprintSystem
 * @ccclass('Playground')
 * export class Playground extends Component {
 *     @property(JsonAsset) bluePrintJson: JsonAsset = null!;
 *     private runner: BlueprintRunner | null = null;
 *
 *     onLoad() {
 *         this.runner = new BlueprintRunner(this.bluePrintJson.json, { self: this });
 *         this.runner.start();
 *     }
 *     update(dt: number) { this.runner?.tick(dt); }
 *     onDestroy() { this.runner?.stop(); }
 * }
 * ```
 */

import type { BlueprintAsset } from '../types/blueprint';
import { BlueprintVM } from './BlueprintVM';

/**
 * @zh 运行器选项
 * @en Runner options
 */
export interface BlueprintRunnerOptions {
    /**
     * @zh 蓝图所绑定的宿主实例；组件方法/属性节点未连线时默认作用于它
     * @en Host instance the blueprint is bound to; component method/property nodes target it by default
     */
    self?: object | null;

    /** @zh 调试模式 @en Debug mode */
    debug?: boolean;
}

/**
 * @zh 通用蓝图运行器
 * @en Generic blueprint runner
 */
export class BlueprintRunner {
    private readonly _vm: BlueprintVM;
    private _started = false;

    constructor(asset: BlueprintAsset, options: BlueprintRunnerOptions = {}) {
        this._vm = new BlueprintVM(asset, null, null, options.self ?? null);
        this._vm.debug = options.debug ?? false;
    }

    /** @zh 底层 VM 实例 @en Underlying VM instance */
    get vm(): BlueprintVM {
        return this._vm;
    }

    /** @zh 是否已启动 @en Whether the runner has started */
    get isStarted(): boolean {
        return this._started;
    }

    /**
     * @zh 启动蓝图(触发 BeginPlay)
     * @en Start the blueprint (fires BeginPlay)
     */
    start(): void {
        if (!this._started) {
            this._vm.start();
            this._started = true;
        }
    }

    /**
     * @zh 逐帧更新(触发 Tick)
     * @en Per-frame update (fires Tick)
     */
    tick(deltaTime: number): void {
        if (this._started) {
            this._vm.tick(deltaTime);
        }
    }

    /**
     * @zh 停止蓝图(触发 EndPlay)
     * @en Stop the blueprint (fires EndPlay)
     */
    stop(): void {
        if (this._started) {
            this._vm.stop();
            this._started = false;
        }
    }

    /**
     * @zh 触发一个内置事件
     * @en Trigger a built-in event
     */
    triggerEvent(eventType: string, data?: Record<string, unknown>): void {
        this._vm.triggerEvent(eventType, data);
    }

    /**
     * @zh 触发一个自定义事件
     * @en Trigger a custom event
     */
    triggerCustomEvent(eventName: string, data?: Record<string, unknown>): void {
        this._vm.triggerCustomEvent(eventName, data);
    }

    /**
     * @zh 释放资源
     * @en Dispose resources
     */
    dispose(): void {
        this._vm.dispose();
        this._started = false;
    }
}
