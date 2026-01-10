/**
 * @zh 全局类型声明 - 将 ccesengine 暴露为 globalThis.cc
 * @en Global type declarations - Exposes ccesengine as globalThis.cc
 */

import type * as ccModule from 'cc';

declare global {
    /**
     * @zh ccesengine 全局对象（运行时由 EngineAdapter 注入）
     * @en ccesengine global object (injected by EngineAdapter at runtime)
     */
    const cc: typeof ccModule;

    interface Window {
        cc: typeof ccModule;
    }
}

export {};
