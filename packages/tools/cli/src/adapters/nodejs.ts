import type { FileEntry, PlatformAdapter, ProjectConfig } from './types.js';

/**
 * @zh Node.js 平台适配器
 * @en Node.js platform adapter
 */
export const nodejsAdapter: PlatformAdapter = {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Generate standalone Node.js project with ECS (for servers, CLI tools, simulations)',

    getDependencies() {
        return {
            '@esengine/ecs-framework': 'latest'
        };
    },

    getDevDependencies() {
        return {
            '@types/node': '^20.0.0',
            'tsx': '^4.0.0',
            'typescript': '^5.0.0'
        };
    },

    getScripts() {
        return {
            'dev': 'tsx watch src/index.ts',
            'start': 'tsx src/index.ts',
            'build': 'tsc',
            'build:start': 'tsc && node dist/index.js'
        };
    },

    generateFiles(config: ProjectConfig): FileEntry[] {
        const files: FileEntry[] = [];

        files.push({
            path: 'src/index.ts',
            content: generateIndex(config)
        });

        files.push({
            path: 'src/Game.ts',
            content: generateGame(config)
        });

        files.push({
            path: 'src/components/PositionComponent.ts',
            content: generatePositionComponent()
        });

        files.push({
            path: 'src/systems/MovementSystem.ts',
            content: generateMovementSystem()
        });

        files.push({
            path: 'tsconfig.json',
            content: generateTsConfig()
        });

        files.push({
            path: 'README.md',
            content: generateReadme(config)
        });

        return files;
    }
};

function generateIndex(config: ProjectConfig): string {
    return `import { Game } from './Game.js';

const game = new Game();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\\nShutting down...');
    game.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    game.stop();
    process.exit(0);
});

// Start the game
game.start();

console.log('[${config.name}] Game started. Press Ctrl+C to stop.');
`;
}

function generateGame(config: ProjectConfig): string {
    return `import { Core, Scene, type ICoreConfig } from '@esengine/ecs-framework';
import { MovementSystem } from './systems/MovementSystem.js';

/**
 * Game configuration options
 */
export interface GameOptions {
    /** @zh 调试模式 @en Debug mode */
    debug?: boolean;
    /** @zh 目标帧率 @en Target FPS */
    targetFPS?: number;
    /** @zh 远程调试配置 @en Remote debug configuration */
    remoteDebug?: {
        /** @zh 启用远程调试 @en Enable remote debugging */
        enabled: boolean;
        /** @zh WebSocket地址 @en WebSocket URL */
        url: string;
        /** @zh 自动重连 @en Auto reconnect */
        autoReconnect?: boolean;
    };
}

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
 * Main game class with ECS game loop
 *
 * Features:
 * - Configurable debug mode and FPS
 * - Remote debugging via WebSocket
 * - Fixed timestep game loop
 * - Graceful start/stop
 */
export class Game {
    private readonly _scene: GameScene;
    private readonly _targetFPS: number;
    private _running = false;
    private _tickInterval: ReturnType<typeof setInterval> | null = null;
    private _lastTime = 0;

    get scene() { return this._scene; }
    get running() { return this._running; }

    constructor(options: GameOptions = {}) {
        const { debug = false, targetFPS = 60, remoteDebug } = options;
        this._targetFPS = targetFPS;

        const config: ICoreConfig = { debug };

        // 配置远程调试
        if (remoteDebug?.enabled && remoteDebug.url) {
            config.debugConfig = {
                enabled: true,
                websocketUrl: remoteDebug.url,
                autoReconnect: remoteDebug.autoReconnect ?? true,
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

    start(): void {
        if (this._running) return;
        this._running = true;
        this._lastTime = performance.now();

        this._tickInterval = setInterval(() => {
            const now = performance.now();
            Core.update((now - this._lastTime) / 1000);
            this._lastTime = now;
        }, 1000 / this._targetFPS);
    }

    stop(): void {
        if (!this._running) return;
        this._running = false;

        if (this._tickInterval) {
            clearInterval(this._tickInterval);
            this._tickInterval = null;
        }
        Core.destroy();
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
import { PositionComponent } from '../components/PositionComponent.js';

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

function generateTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`;
}

function generateReadme(config: ProjectConfig): string {
    return `# ${config.name}

A Node.js project using ESEngine ECS framework.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build and run
npm run build:start
\`\`\`

## Project Structure

\`\`\`
src/
├── index.ts              # Entry point
├── Game.ts               # Game loop and ECS setup
├── components/           # ECS components (data)
│   └── PositionComponent.ts
└── systems/              # ECS systems (logic)
    └── MovementSystem.ts
\`\`\`

## Creating Components

\`\`\`typescript
import { Component } from '@esengine/ecs-framework';

export class HealthComponent extends Component {
    current = 100;
    max = 100;

    reset(): void {
        this.current = this.max;
    }
}
\`\`\`

## Creating Systems

\`\`\`typescript
import { EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
import { HealthComponent } from '../components/HealthComponent.js';

export class HealthSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(HealthComponent));
    }

    protected processEntity(entity: Entity, dt: number): void {
        const health = entity.getComponent(HealthComponent)!;
        // Your logic here
    }
}
\`\`\`

## Use Cases

- Game servers
- CLI tools with complex logic
- Simulations
- Automated testing

## Documentation

- [ESEngine ECS Framework](https://github.com/esengine/esengine)
`;
}
