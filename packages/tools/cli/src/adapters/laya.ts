import type { FileEntry, PlatformAdapter, ProjectConfig } from './types.js';

/**
 * @zh Laya 3.x 平台适配器
 * @en Laya 3.x platform adapter
 */
export const layaAdapter: PlatformAdapter = {
    id: 'laya',
    name: 'Laya 3.x',
    description: 'Generate ECS integration for LayaAir 3.x projects',

    getDependencies() {
        return {
            '@esengine/ecs-framework': 'latest'
        };
    },

    getDevDependencies() {
        return {};
    },

    getScripts() {
        return {};
    },

    generateFiles(config: ProjectConfig): FileEntry[] {
        const files: FileEntry[] = [];

        files.push({
            path: 'src/ecs/ECSManager.ts',
            content: generateECSManager(config)
        });

        files.push({
            path: 'src/ecs/components/PositionComponent.ts',
            content: generatePositionComponent()
        });

        files.push({
            path: 'src/ecs/systems/MovementSystem.ts',
            content: generateMovementSystem()
        });

        files.push({
            path: 'src/ecs/README.md',
            content: generateReadme(config)
        });

        return files;
    }
};

function generateECSManager(config: ProjectConfig): string {
    return `import { Core, Scene, type ICoreConfig } from '@esengine/ecs-framework';
import { MovementSystem } from './systems/MovementSystem';

const { regClass, property } = Laya;

/**
 * Game Scene - Define your game systems here
 */
class GameScene extends Scene {
    initialize(): void {
        this.name = '${config.name}';
        this.addSystem(new MovementSystem());
        // Add more systems here...
    }

    onStart(): void {
        // Create your initial entities here
    }
}

/**
 * ECS Manager - Bridge between LayaAir and ESEngine ECS
 *
 * Attach this script to a node in your scene via Laya IDE.
 * All game logic should be implemented in ECS Systems.
 */
@regClass()
export class ECSManager extends Laya.Script {
    /** @zh 调试模式 @en Debug mode */
    @property({ type: Boolean, caption: 'Debug', tips: 'Enable debug mode for ECS framework' })
    debug = false;

    /** @zh 启用远程调试 @en Enable remote debugging */
    @property({ type: Boolean, caption: 'Remote Debug', tips: 'Connect to ECS debugger via WebSocket' })
    remoteDebug = false;

    /** @zh WebSocket调试地址 @en WebSocket debug URL */
    @property({ type: String, caption: 'Debug URL', tips: 'WebSocket URL for remote debugging (e.g., ws://localhost:9229)' })
    debugUrl = 'ws://localhost:9229';

    /** @zh 自动重连 @en Auto reconnect */
    @property({ type: Boolean, caption: 'Auto Reconnect', tips: 'Auto reconnect when connection lost' })
    autoReconnect = true;

    private static _instance: ECSManager | null = null;
    private _scene!: GameScene;

    static get instance() { return ECSManager._instance; }
    get scene() { return this._scene; }

    onAwake(): void {
        if (ECSManager._instance) {
            this.destroy();
            return;
        }
        ECSManager._instance = this;

        const config: ICoreConfig = {
            debug: this.debug
        };

        // 配置远程调试
        if (this.remoteDebug && this.debugUrl) {
            config.debugConfig = {
                enabled: true,
                websocketUrl: this.debugUrl,
                autoReconnect: this.autoReconnect,
                channels: {
                    entities: true,
                    systems: true,
                    performance: true,
                    components: true,
                    scenes: true
                }
            };
        }

        Core.create(config);
        this._scene = new GameScene();
        Core.setScene(this._scene);
    }

    onUpdate(): void {
        Core.update(Laya.timer.delta / 1000);
    }

    onDestroy(): void {
        if (ECSManager._instance === this) {
            ECSManager._instance = null;
            Core.destroy();
        }
    }
}
`;
}

function generatePositionComponent(): string {
    return `import { Component, ECSComponent } from '@esengine/ecs-framework';

/**
 * Position component - stores entity position
 */
@ECSComponent('Position')
export class PositionComponent extends Component {
    x = 0;
    y = 0;

    constructor(x = 0, y = 0) {
        super();
        this.x = x;
        this.y = y;
    }
}
`;
}

function generateMovementSystem(): string {
    return `import { EntitySystem, Matcher, Entity, Time, ECSSystem } from '@esengine/ecs-framework';
import { PositionComponent } from '../components/PositionComponent';

/**
 * Movement system - processes entities with PositionComponent
 *
 * Customize this system for your game logic.
 */
@ECSSystem('MovementSystem')
export class MovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(PositionComponent));
    }

    protected process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            const position = entity.getComponent(PositionComponent)!;
            // Update position using Time.deltaTime
            // position.x += velocity.dx * Time.deltaTime;
        }
    }
}
`;
}

function generateReadme(config: ProjectConfig): string {
    return `# ${config.name} - ECS Module

This module integrates ESEngine ECS framework with LayaAir 3.x.

## Quick Start

1. In Laya IDE, attach \`ECSManager\` script to a node in your scene
2. Create your own components in \`components/\` folder
3. Create your systems in \`systems/\` folder
4. Register systems in \`ECSManager.onAwake()\`

## Creating Components

\`\`\`typescript
import { Component } from '@esengine/ecs-framework';

export class MyComponent extends Component {
    health: number = 100;

    reset() {
        this.health = 100;
    }
}
\`\`\`

## Creating Systems

\`\`\`typescript
import { EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
import { MyComponent } from '../components/MyComponent';

export class MySystem extends EntitySystem {
    constructor() {
        super(Matcher.all(MyComponent));
    }

    protected processEntity(entity: Entity, dt: number): void {
        const comp = entity.getComponent(MyComponent)!;
        // Process entity
    }
}
\`\`\`

## Documentation

- [ESEngine ECS Framework](https://github.com/esengine/esengine)
- [LayaAir Documentation](https://layaair.com/)
`;
}
