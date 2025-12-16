/**
 * 场景加载触发组件
 * Scene Load Trigger Component
 *
 * 配合 UIInteractable 使用，点击时自动加载指定场景。
 * Works with UIInteractable to automatically load scene on click.
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';

/**
 * 场景加载触发组件
 * Scene Load Trigger Component
 *
 * 添加到带有 UIInteractable 的实体上，点击时会加载 targetScene 指定的场景。
 * Add to entity with UIInteractable, loads targetScene on click.
 *
 * @example
 * ```json
 * {
 *   "type": "SceneLoadTrigger",
 *   "data": {
 *     "targetScene": "GameScene",
 *     "enabled": true
 *   }
 * }
 * ```
 */
@ECSComponent('SceneLoadTrigger')
@Serializable({ version: 1, typeId: 'SceneLoadTrigger' })
export class SceneLoadTriggerComponent extends Component {
    /**
     * 目标场景名称
     * Target scene name to load on click
     */
    @Serialize()
    @Property({ type: 'string', label: 'Target Scene' })
    public targetScene: string = '';

    /**
     * 是否启用
     * Whether the trigger is enabled
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Enabled' })
    public enabled: boolean = true;

    /**
     * 点击后是否禁用（防止重复点击）
     * Disable after click (prevent double clicks)
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Disable On Click' })
    public disableOnClick: boolean = true;

    /**
     * 内部标记：回调是否已绑定
     * Internal flag: whether callback is bound
     */
    public _callbackBound: boolean = false;
}
