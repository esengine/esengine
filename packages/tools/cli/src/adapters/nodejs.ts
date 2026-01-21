import type { FileEntry, PlatformAdapter, ProjectConfig } from './types.js';

/**
 * @zh Node.js 平台适配器
 * @en Node.js platform adapter
 */
export const nodejsAdapter: PlatformAdapter = {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Generate Node.js game server with ECS and networking',

    getDependencies() {
        return {
            '@esengine/ecs-framework': 'latest',
            '@esengine/rpc': 'latest',
            '@esengine/network': 'latest',
            'ws': '^8.18.0'
        };
    },

    getDevDependencies() {
        return {
            '@types/node': '^20.0.0',
            '@types/ws': '^8.5.13',
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
        return [
            { path: 'src/index.ts', content: generateIndex(config) },
            { path: 'src/server/GameServer.ts', content: generateGameServer(config) },
            { path: 'src/game/Game.ts', content: generateGame(config) },
            { path: 'src/game/scenes/MainScene.ts', content: generateMainScene(config) },
            { path: 'src/game/components/PositionComponent.ts', content: generatePositionComponent() },
            { path: 'src/game/components/VelocityComponent.ts', content: generateVelocityComponent() },
            { path: 'src/game/systems/MovementSystem.ts', content: generateMovementSystem() },
            { path: 'tsconfig.json', content: generateTsConfig() },
            { path: 'README.md', content: generateReadme(config) }
        ];
    }
};

function generateIndex(config: ProjectConfig): string {
    return `import { createGameServer } from './server/GameServer';

const PORT = Number(process.env.PORT) || 3000;

async function main() {
    const { server } = createGameServer({ port: PORT });
    await server.start();

    console.log('========================================');
    console.log('  ${config.name} Server');
    console.log('========================================');
    console.log(\`  WebSocket: ws://localhost:\${PORT}\`);
    console.log('  Press Ctrl+C to stop');
    console.log('========================================');
}

process.on('SIGINT', () => {
    console.log('\\nShutting down...');
    process.exit(0);
});

main().catch(console.error);
`;
}

function generateGameServer(config: ProjectConfig): string {
    return `import { serve } from '@esengine/rpc/server';
import {
    gameProtocol,
    type JoinRequest,
    type JoinResponse,
    type ReconnectRequest,
    type ReconnectResponse,
} from '@esengine/network';
import { Game } from '../game/Game';

/**
 * @zh 服务器配置
 * @en Server configuration
 */
export interface ServerConfig {
    port: number;
    maxPlayers?: number;
    tickRate?: number;
}

/**
 * @zh 玩家数据
 * @en Player data
 */
interface PlayerData {
    id: number;
    name: string;
    token: string;
}

/**
 * @zh 创建游戏服务器
 * @en Create game server
 */
export function createGameServer(config: Partial<ServerConfig> = {}) {
    const port = config.port ?? 3000;
    const maxPlayers = config.maxPlayers ?? 16;
    const tickRate = config.tickRate ?? 20;

    // 玩家管理
    const players = new Map<string, PlayerData>();
    const playerTokens = new Map<number, string>(); // playerId -> token
    let nextPlayerId = 1;

    // 创建 RPC 服务器
    const server = serve(gameProtocol, {
        port,
        api: {
            join: async (input: JoinRequest, conn): Promise<JoinResponse> => {
                const playerId = nextPlayerId++;
                const token = crypto.randomUUID();

                players.set(conn.id, { id: playerId, name: input.playerName, token });
                playerTokens.set(playerId, token);

                console.log(\`[Server] Player joined: \${input.playerName} (ID: \${playerId})\`);

                return {
                    playerId,
                    roomId: input.roomId ?? 'default',
                };
            },
            leave: async (_input, conn) => {
                const player = players.get(conn.id);
                if (player) {
                    console.log(\`[Server] Player left: \${player.name}\`);
                    players.delete(conn.id);
                }
            },
            reconnect: async (input: ReconnectRequest, conn): Promise<ReconnectResponse> => {
                const expectedToken = playerTokens.get(input.playerId);

                if (!expectedToken || expectedToken !== input.token) {
                    return { success: false, error: 'Invalid token' };
                }

                console.log(\`[Server] Player reconnected: \${input.playerId}\`);
                return { success: true };
            },
        },
        onConnect: (conn) => {
            console.log(\`[Server] Client connected: \${conn.id}\`);
        },
        onDisconnect: (conn) => {
            const player = players.get(conn.id);
            if (player) {
                console.log(\`[Server] Player disconnected: \${player.name}\`);
                players.delete(conn.id);
            }
        },
        onStart: (p) => {
            console.log(\`[Server] Started on ws://localhost:\${p}\`);
        },
    });

    // 初始化 ECS 游戏逻辑
    const game = new Game({ targetFPS: tickRate });
    game.start();

    // 游戏循环：广播状态同步
    setInterval(() => {
        // 在这里广播游戏状态
        // server.broadcast('sync', { frame: 0, timestamp: Date.now(), entities: [] });
    }, 1000 / tickRate);

    return { server, game, players };
}
`;
}

function generateGame(config: ProjectConfig): string {
    return `import { Core, type ICoreConfig } from '@esengine/ecs-framework';
import { MainScene } from './scenes/MainScene';

/**
 * @zh 游戏主类
 * @en Main game class
 */
export class Game {
    private _scene: MainScene;
    private _running = false;
    private _tickInterval: ReturnType<typeof setInterval> | null = null;
    private _lastTime = 0;
    private _targetFPS = 60;

    constructor(options: { debug?: boolean; targetFPS?: number } = {}) {
        const { debug = false, targetFPS = 60 } = options;
        this._targetFPS = targetFPS;

        const config: ICoreConfig = { debug };
        Core.create(config);

        this._scene = new MainScene();
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

function generateMainScene(config: ProjectConfig): string {
    return `import { Scene } from '@esengine/ecs-framework';
import { MovementSystem } from '../systems/MovementSystem';

/**
 * @zh 主场景
 * @en Main scene
 */
export class MainScene extends Scene {
    initialize(): void {
        this.name = '${config.name}';

        // 注册系统
        this.addSystem(new MovementSystem());

        // 添加更多系统...
    }

    onStart(): void {
        // 创建初始实体
        console.log('[MainScene] Scene started');
    }
}
`;
}

function generatePositionComponent(): string {
    return `import { Component, ECSComponent } from '@esengine/ecs-framework';

/**
 * @zh 位置组件
 * @en Position component
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

    reset(): void {
        this.x = 0;
        this.y = 0;
    }
}
`;
}

function generateVelocityComponent(): string {
    return `import { Component, ECSComponent } from '@esengine/ecs-framework';

/**
 * @zh 速度组件
 * @en Velocity component
 */
@ECSComponent('Velocity')
export class VelocityComponent extends Component {
    vx = 0;
    vy = 0;

    constructor(vx = 0, vy = 0) {
        super();
        this.vx = vx;
        this.vy = vy;
    }

    reset(): void {
        this.vx = 0;
        this.vy = 0;
    }
}
`;
}

function generateMovementSystem(): string {
    return `import { EntitySystem, Matcher, Entity, Time } from '@esengine/ecs-framework';
import { PositionComponent } from '../components/PositionComponent';
import { VelocityComponent } from '../components/VelocityComponent';

/**
 * @zh 移动系统
 * @en Movement system
 */
export class MovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(PositionComponent, VelocityComponent));
    }

    protected processEntity(entity: Entity, dt: number): void {
        const pos = entity.getComponent(PositionComponent)!;
        const vel = entity.getComponent(VelocityComponent)!;

        pos.x += vel.vx * dt;
        pos.y += vel.vy * dt;
    }
}
`;
}

function generateTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`;
}

function generateReadme(config: ProjectConfig): string {
    return `# ${config.name}

Node.js 游戏服务器，基于 ESEngine ECS 框架。

## 快速开始

\`\`\`bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建并运行
npm run build:start
\`\`\`

## 项目结构

\`\`\`
src/
├── index.ts                    # 入口文件
├── server/
│   └── GameServer.ts           # 网络服务器配置
└── game/
    ├── Game.ts                 # ECS 游戏主类
    ├── scenes/
    │   └── MainScene.ts        # 主场景
    ├── components/             # ECS 组件
    │   ├── PositionComponent.ts
    │   └── VelocityComponent.ts
    └── systems/                # ECS 系统
        └── MovementSystem.ts
\`\`\`

## 客户端连接

\`\`\`typescript
import { Core } from '@esengine/ecs-framework';
import { NetworkPlugin } from '@esengine/network';

// 安装网络插件
const networkPlugin = new NetworkPlugin();
await Core.installPlugin(networkPlugin);

// 连接服务器
await networkPlugin.connect({
    url: 'ws://localhost:3000',
    playerName: 'Player1'
});
\`\`\`

## 文档

- [ESEngine 文档](https://esengine.github.io/esengine/)
- [RPC 模块](https://esengine.github.io/esengine/modules/rpc/)
- [Network 模块](https://esengine.github.io/esengine/modules/network/)
`;
}
