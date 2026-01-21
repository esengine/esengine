import { cocosAdapter } from './cocos.js';
import { cocos2Adapter } from './cocos2.js';
import { layaAdapter } from './laya.js';
import { nodejsAdapter } from './nodejs.js';
import { webAdapter } from './web.js';
import type { AdapterRegistry, PlatformAdapter, PlatformType } from './types.js';

export * from './types.js';
export { cocosAdapter } from './cocos.js';
export { cocos2Adapter } from './cocos2.js';
export { layaAdapter } from './laya.js';
export { nodejsAdapter } from './nodejs.js';
export { webAdapter } from './web.js';

/**
 * @zh 平台适配器注册表
 * @en Platform adapter registry
 */
export const adapters: AdapterRegistry = {
    cocos: cocosAdapter,
    cocos2: cocos2Adapter,
    laya: layaAdapter,
    nodejs: nodejsAdapter,
    web: webAdapter
};

/**
 * @zh 获取平台适配器
 * @en Get platform adapter
 */
export function getAdapter(platform: PlatformType): PlatformAdapter {
    const adapter = adapters[platform];
    if (!adapter) {
        throw new Error(`Unknown platform: ${platform}`);
    }
    return adapter;
}

/**
 * @zh 获取所有可用平台
 * @en Get all available platforms
 */
export function getPlatforms(): PlatformType[] {
    return Object.keys(adapters) as PlatformType[];
}

/**
 * @zh 获取平台选项（用于交互式提示）
 * @en Get platform choices (for interactive prompts)
 */
export function getPlatformChoices(): Array<{ title: string; value: PlatformType; description: string }> {
    return Object.values(adapters).map((adapter) => ({
        title: adapter.name,
        value: adapter.id,
        description: adapter.description
    }));
}
