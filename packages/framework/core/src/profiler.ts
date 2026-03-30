/**
 * @zh Profiler 独立入口点 - 支持 tree-shaking
 * @en Profiler standalone entry point - supports tree-shaking
 *
 * @zh 通过 `@esengine/ecs-framework/profiler` 导入，
 * 避免引入整个 ECS 框架，减小打包体积。
 * @en Import via `@esengine/ecs-framework/profiler`,
 * avoids importing the entire ECS framework, reducing bundle size.
 *
 * @example
 * ```typescript
 * import { ProfilerSDK, AutoProfiler, Profile } from '@esengine/ecs-framework/profiler';
 *
 * ProfilerSDK.initialize({ enabled: true });
 *
 * class MySystem {
 *     @Profile()
 *     update() { ... }
 * }
 * ```
 */
export * from './Utils/Profiler';
