---
"@esengine/ecs-framework": patch
---

fix(sync): Decoder 现在使用 GlobalComponentRegistry 查找组件 | Decoder now uses GlobalComponentRegistry for component lookup

**问题 | Problem:**
1. `Decoder.ts` 有自己独立的 `componentRegistry` Map，与 `GlobalComponentRegistry` 完全分离。这导致通过 `@ECSComponent` 装饰器注册的组件在网络反序列化时找不到，产生 "Unknown component type" 错误。
2. `@sync` 装饰器使用 `constructor.name` 作为 `typeId`，而不是 `@ECSComponent` 装饰器指定的名称，导致编码和解码使用不同的类型 ID。

1. `Decoder.ts` had its own local `componentRegistry` Map that was completely separate from `GlobalComponentRegistry`. This caused components registered via `@ECSComponent` decorator to not be found during network deserialization, resulting in "Unknown component type" errors.
2. `@sync` decorator used `constructor.name` as `typeId` instead of the name specified by `@ECSComponent` decorator, causing encoding and decoding to use different type IDs.

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
