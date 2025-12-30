# @esengine/ecs-framework

## 2.6.0

### Minor Changes

- feat(ecs): 添加 @NetworkEntity 装饰器，支持自动广播实体生成/销毁

    ### 新功能

    **@NetworkEntity 装饰器**
    - 标记组件为网络实体，自动广播 spawn/despawn 消息
    - 支持 `autoSpawn` 和 `autoDespawn` 配置选项
    - 通过事件系统（`ECSEventType.COMPONENT_ADDED` / `ECSEventType.ENTITY_DESTROYED`）实现

    **ECSRoom 增强**
    - 新增 `enableAutoNetworkEntity` 配置选项（默认启用）
    - 自动监听组件添加和实体销毁事件
    - 简化 GameRoom 实现，无需手动回调

    ### 改进

    **Entity 事件**
    - `Entity.destroy()` 现在发出 `entity:destroyed` 事件
    - `Entity.active` 变化时发出 `entity:enabled` / `entity:disabled` 事件
    - 使用 `ECSEventType` 常量替代硬编码字符串

    ### 使用示例

    ```typescript
    import { Component, ECSComponent, sync, NetworkEntity } from '@esengine/ecs-framework';

    @ECSComponent('Enemy')
    @NetworkEntity('Enemy')
    class EnemyComponent extends Component {
        @sync('float32') x: number = 0;
        @sync('float32') y: number = 0;
    }

    // 服务端
    const entity = scene.createEntity('Enemy');
    entity.addComponent(new EnemyComponent()); // 自动广播 spawn
    entity.destroy(); // 自动广播 despawn
    ```

## 2.5.1

### Patch Changes

- [#392](https://github.com/esengine/esengine/pull/392) [`a08a84b`](https://github.com/esengine/esengine/commit/a08a84b7db28e1140cbc637d442552747ad81c76) Thanks [@esengine](https://github.com/esengine)! - fix(sync): Decoder 现在使用 GlobalComponentRegistry 查找组件 | Decoder now uses GlobalComponentRegistry for component lookup

    **问题 | Problem:**
    1. `Decoder.ts` 有自己独立的 `componentRegistry` Map，与 `GlobalComponentRegistry` 完全分离。这导致通过 `@ECSComponent` 装饰器注册的组件在网络反序列化时找不到，产生 "Unknown component type" 错误。
    2. `@sync` 装饰器使用 `constructor.name` 作为 `typeId`，而不是 `@ECSComponent` 装饰器指定的名称，导致编码和解码使用不同的类型 ID。
    3. `Decoder.ts` had its own local `componentRegistry` Map that was completely separate from `GlobalComponentRegistry`. This caused components registered via `@ECSComponent` decorator to not be found during network deserialization, resulting in "Unknown component type" errors.
    4. `@sync` decorator used `constructor.name` as `typeId` instead of the name specified by `@ECSComponent` decorator, causing encoding and decoding to use different type IDs.

    **修改 | Changes:**
    - 从 Decoder.ts 中移除本地 `componentRegistry`
    - 更新 `decodeEntity` 和 `decodeSpawn` 使用 `GlobalComponentRegistry.getComponentType()`
    - 移除已废弃的 `registerSyncComponent` 和 `autoRegisterSyncComponent` 函数
    - 更新 `@sync` 装饰器使用 `getComponentTypeName()` 获取组件类型名称
    - 更新 `@ECSComponent` 装饰器同步更新 `SYNC_METADATA.typeId`
    - Removed local `componentRegistry` from Decoder.ts
    - Updated `decodeEntity` and `decodeSpawn` to use `GlobalComponentRegistry.getComponentType()`
    - Removed deprecated `registerSyncComponent` and `autoRegisterSyncComponent` functions
    - Updated `@sync` decorator to use `getComponentTypeName()` for component type name
    - Updated `@ECSComponent` decorator to sync update `SYNC_METADATA.typeId`

    现在使用 `@ECSComponent` 装饰器的组件会自动可用于网络同步解码，无需手动注册。

    Now `@ECSComponent` decorated components are automatically available for network sync decoding without any manual registration.

## 2.5.0

### Minor Changes

- [#390](https://github.com/esengine/esengine/pull/390) [`1f297ac`](https://github.com/esengine/esengine/commit/1f297ac769e37700f72fb4425639af7090898256) Thanks [@esengine](https://github.com/esengine)! - feat: ECS 网络状态同步系统

    ## @esengine/ecs-framework

    新增 `@sync` 装饰器和二进制编解码器，支持基于 Component 的网络状态同步：

    ```typescript
    import { Component, ECSComponent, sync } from '@esengine/ecs-framework';

    @ECSComponent('Player')
    class PlayerComponent extends Component {
        @sync('string') name: string = '';
        @sync('uint16') score: number = 0;
        @sync('float32') x: number = 0;
        @sync('float32') y: number = 0;
    }
    ```

    ### 新增导出
    - `sync` - 标记需要同步的字段装饰器
    - `SyncType` - 支持的同步类型
    - `SyncOperation` - 同步操作类型（FULL/DELTA/SPAWN/DESPAWN）
    - `encodeSnapshot` / `decodeSnapshot` - 批量编解码
    - `encodeSpawn` / `decodeSpawn` - 实体生成编解码
    - `encodeDespawn` / `processDespawn` - 实体销毁编解码
    - `ChangeTracker` - 字段级变更追踪
    - `initChangeTracker` / `clearChanges` / `hasChanges` - 变更追踪工具函数

    ### 内部方法标记

    将以下方法标记为 `@internal`，用户应通过 `Core.update()` 驱动更新：
    - `Scene.update()`
    - `SceneManager.update()`
    - `WorldManager.updateAll()`

    ## @esengine/network

    新增 `ComponentSyncSystem`，基于 `@sync` 装饰器自动同步组件状态：

    ```typescript
    import { ComponentSyncSystem } from '@esengine/network';

    // 服务端：编码状态
    const data = syncSystem.encodeAllEntities(false);

    // 客户端：解码状态
    syncSystem.applySnapshot(data);
    ```

    ### 修复
    - 将 `@esengine/ecs-framework` 从 devDependencies 移到 peerDependencies

    ## @esengine/server

    新增 `ECSRoom`，带有 ECS World 支持的房间基类：

    ```typescript
    import { ECSRoom } from '@esengine/server/ecs';

    // 服务端启动
    Core.create();
    setInterval(() => Core.update(1 / 60), 16);

    // 定义房间
    class GameRoom extends ECSRoom {
        onCreate() {
            this.addSystem(new PhysicsSystem());
        }

        onJoin(player: Player) {
            const entity = this.createPlayerEntity(player.id);
            entity.addComponent(new PlayerComponent());
        }
    }
    ```

    ### 设计
    - 每个 `ECSRoom` 在 `Core.worldManager` 中创建独立的 World
    - `Core.update()` 统一更新 Time 和所有 World
    - `onTick()` 只处理状态同步逻辑

## 2.4.4

### Patch Changes

- [`7d74623`](https://github.com/esengine/esengine/commit/7d746237100084ac3456f1af92ff664db4e50cc8) Thanks [@esengine](https://github.com/esengine)! - fix(core): 修复 npm 发布目录配置，确保从 dist 目录发布以保持与 Cocos Creator 的兼容性

## 2.4.3

### Patch Changes

- [#356](https://github.com/esengine/esengine/pull/356) [`ce2db4e`](https://github.com/esengine/esengine/commit/ce2db4e48a7cdac44265420ef16e83f6424f4dea) Thanks [@esengine](https://github.com/esengine)! - fix(core): 修复 World cleanup 在打包环境下的兼容性问题
    - 使用 forEach 替代 spread + for...of 解构模式，避免某些打包工具（如 Cocos Creator）转换后的兼容性问题
    - 重构 World 和 WorldManager 类，提升代码质量
    - 提取默认配置为常量，统一双语注释格式
