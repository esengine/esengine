# @esengine/behavior-tree

## 4.1.2

### Patch Changes

- [#406](https://github.com/esengine/esengine/pull/406) [`0de4527`](https://github.com/esengine/esengine/commit/0de45279e612c04ae9be7fbd65ce496e4797a43c) Thanks [@esengine](https://github.com/esengine)! - fix(behavior-tree): export NodeExecutorMetadata as value instead of type

    Fixed the export of `NodeExecutorMetadata` decorator in `execution/index.ts`.
    Previously it was exported as `export type { NodeExecutorMetadata }` which only
    exported the type signature, not the actual function. This caused runtime errors
    in Cocos Creator: "TypeError: (intermediate value) is not a function".

    Changed to `export { NodeExecutorMetadata }` to properly export the decorator function.

## 4.1.1

### Patch Changes

- Updated dependencies [[`3e5b778`](https://github.com/esengine/esengine/commit/3e5b7783beec08e247f7525184935401923ecde8)]:
    - @esengine/ecs-framework@2.7.1

## 4.1.0

### Minor Changes

- [#400](https://github.com/esengine/esengine/pull/400) [`d2af9ca`](https://github.com/esengine/esengine/commit/d2af9caae9d5620c5f690272ab80dc246e9b7e10) Thanks [@esengine](https://github.com/esengine)! - feat(behavior-tree): add pure BehaviorTreePlugin class for Cocos/Laya integration
    - Added `BehaviorTreePlugin` class that only depends on `@esengine/ecs-framework`
    - Implements `IPlugin` interface with `install()`, `uninstall()`, and `setupScene()` methods
    - Removed `esengine/` subdirectory that incorrectly depended on `@esengine/engine-core`
    - Updated package documentation with correct usage examples

    Usage:

    ```typescript
    import { Core, Scene } from '@esengine/ecs-framework';
    import { BehaviorTreePlugin, BehaviorTreeBuilder, BehaviorTreeStarter } from '@esengine/behavior-tree';

    Core.create();
    const plugin = new BehaviorTreePlugin();
    await Core.installPlugin(plugin);

    const scene = new Scene();
    plugin.setupScene(scene);
    Core.setScene(scene);
    ```

## 4.0.0

### Patch Changes

- Updated dependencies [[`1f3a76a`](https://github.com/esengine/esengine/commit/1f3a76aabea2d3eb8a5eb8b73e29127da57e2028)]:
    - @esengine/ecs-framework@2.7.0

## 3.0.1

### Patch Changes

- Updated dependencies [[`04b08f3`](https://github.com/esengine/esengine/commit/04b08f3f073d69beb8f4be399c774bea0acb612e)]:
    - @esengine/ecs-framework@2.6.1

## 3.0.0

### Patch Changes

- Updated dependencies []:
    - @esengine/ecs-framework@2.6.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`a08a84b`](https://github.com/esengine/esengine/commit/a08a84b7db28e1140cbc637d442552747ad81c76)]:
    - @esengine/ecs-framework@2.5.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`1f297ac`](https://github.com/esengine/esengine/commit/1f297ac769e37700f72fb4425639af7090898256)]:
    - @esengine/ecs-framework@2.5.0

## 1.0.3

### Patch Changes

- Updated dependencies [[`7d74623`](https://github.com/esengine/esengine/commit/7d746237100084ac3456f1af92ff664db4e50cc8)]:
    - @esengine/ecs-framework@2.4.4

## 1.0.2

### Patch Changes

- Updated dependencies [[`ce2db4e`](https://github.com/esengine/esengine/commit/ce2db4e48a7cdac44265420ef16e83f6424f4dea)]:
    - @esengine/ecs-framework@2.4.3
