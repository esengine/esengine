/**
 * @zh ESEngine 可用模块定义
 * @en ESEngine Available Modules Definition
 */

export interface ModuleInfo {
    id: string;
    name: string;
    package: string;
    version: string;
    description: string;
    category: 'core' | 'ai' | 'physics' | 'rendering' | 'network' | 'utility';
    dependencies?: string[];
}

/**
 * @zh 可用模块列表
 * @en Available modules list
 */
export const AVAILABLE_MODULES: ModuleInfo[] = [
    // Core
    {
        id: 'core',
        name: 'ECS Core',
        package: '@esengine/ecs-framework',
        version: 'latest',
        description: 'ECS 核心框架 | Core ECS framework',
        category: 'core'
    },
    {
        id: 'math',
        name: 'Math',
        package: '@esengine/ecs-framework-math',
        version: 'latest',
        description: '数学库 (向量、矩阵) | Math library (vectors, matrices)',
        category: 'core'
    },

    // AI
    {
        id: 'fsm',
        name: 'FSM',
        package: '@esengine/fsm',
        version: 'latest',
        description: '有限状态机 | Finite State Machine',
        category: 'ai'
    },
    {
        id: 'behavior-tree',
        name: 'Behavior Tree',
        package: '@esengine/behavior-tree',
        version: 'latest',
        description: '行为树 AI 系统 | Behavior Tree AI system',
        category: 'ai'
    },
    {
        id: 'pathfinding',
        name: 'Pathfinding',
        package: '@esengine/pathfinding',
        version: 'latest',
        description: '寻路系统 (A*, NavMesh) | Pathfinding (A*, NavMesh)',
        category: 'ai'
    },

    // Utility
    {
        id: 'timer',
        name: 'Timer',
        package: '@esengine/timer',
        version: 'latest',
        description: '定时器和冷却系统 | Timer and cooldown system',
        category: 'utility'
    },
    {
        id: 'spatial',
        name: 'Spatial',
        package: '@esengine/spatial',
        version: 'latest',
        description: '空间索引和 AOI 系统 | Spatial index and AOI system',
        category: 'utility'
    },
    {
        id: 'procgen',
        name: 'Procgen',
        package: '@esengine/procgen',
        version: 'latest',
        description: '程序化生成 (噪声、随机) | Procedural generation',
        category: 'utility'
    },
    {
        id: 'blueprint',
        name: 'Blueprint',
        package: '@esengine/blueprint',
        version: 'latest',
        description: '可视化脚本系统 | Visual scripting system',
        category: 'utility'
    },

    // Network
    {
        id: 'network',
        name: 'Network',
        package: '@esengine/network',
        version: 'latest',
        description: '网络同步客户端 | Network sync client',
        category: 'network',
        dependencies: ['network-protocols']
    },
    {
        id: 'network-protocols',
        name: 'Network Protocols',
        package: '@esengine/network-protocols',
        version: 'latest',
        description: '网络共享协议 | Shared network protocols',
        category: 'network'
    },
    {
        id: 'network-server',
        name: 'Network Server',
        package: '@esengine/network-server',
        version: 'latest',
        description: '网络游戏服务器 | Network game server',
        category: 'network',
        dependencies: ['network-protocols']
    }
];

/**
 * @zh 获取模块信息
 * @en Get module info by id
 */
export function getModuleById(id: string): ModuleInfo | undefined {
    return AVAILABLE_MODULES.find(m => m.id === id);
}

/**
 * @zh 按分类获取模块
 * @en Get modules by category
 */
export function getModulesByCategory(category: ModuleInfo['category']): ModuleInfo[] {
    return AVAILABLE_MODULES.filter(m => m.category === category);
}

/**
 * @zh 获取所有模块 ID
 * @en Get all module IDs
 */
export function getAllModuleIds(): string[] {
    return AVAILABLE_MODULES.map(m => m.id);
}
