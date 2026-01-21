import type { FileEntry, PlatformAdapter, ProjectConfig } from './types.js';

/**
 * @zh Web 客户端平台适配器（纯浏览器/Vite/Webpack 项目）
 * @en Web client platform adapter (pure browser/Vite/Webpack projects)
 */
export const webAdapter: PlatformAdapter = {
    id: 'web',
    name: 'Web Client',
    description: 'Generate web client with ECS and networking for browser games',

    getDependencies() {
        return {
            '@esengine/ecs-framework': 'latest',
            '@esengine/network': 'latest',
            '@esengine/rpc': 'latest'
        };
    },

    getDevDependencies() {
        return {
            '@types/node': '^20.0.0',
            'typescript': '^5.0.0',
            'vite': '^5.0.0'
        };
    },

    getScripts() {
        return {
            'dev': 'vite',
            'build': 'vite build',
            'preview': 'vite preview'
        };
    },

    generateFiles(config: ProjectConfig): FileEntry[] {
        return [
            { path: 'src/main.ts', content: generateMain(config) },
            { path: 'src/game/Game.ts', content: generateGame(config) },
            { path: 'src/game/scenes/MainScene.ts', content: generateMainScene(config) },
            { path: 'src/game/components/PositionComponent.ts', content: generatePositionComponent() },
            { path: 'src/game/components/VelocityComponent.ts', content: generateVelocityComponent() },
            { path: 'src/game/systems/MovementSystem.ts', content: generateMovementSystem() },
            { path: 'src/network/NetworkManager.ts', content: generateNetworkManager() },
            { path: 'src/network/handlers.ts', content: generateNetworkHandlers() },
            { path: 'index.html', content: generateHtml(config) },
            { path: 'vite.config.ts', content: generateViteConfig() },
            { path: 'tsconfig.json', content: generateTsConfig() },
            { path: 'README.md', content: generateReadme(config) }
        ];
    }
};

function generateMain(config: ProjectConfig): string {
    return `import { Game } from './game/Game';
import { NetworkManager } from './network/NetworkManager';

/**
 * @zh 游戏入口
 * @en Game entry point
 */
async function main() {
    console.log('${config.name} starting...');

    // 创建游戏实例
    const game = new Game({ debug: true });
    game.start();

    // 创建网络管理器
    const network = new NetworkManager();

    // 连接到服务器
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'ws://localhost:3000';
    const playerName = prompt('Enter your name:') || 'Player';

    try {
        const connected = await network.connect({
            url: serverUrl,
            playerName,
        });

        if (connected) {
            console.log('Connected to server!');
            console.log('Player ID:', network.localPlayerId);
        } else {
            console.error('Failed to connect to server');
        }
    } catch (error) {
        console.error('Connection error:', error);
    }

    // 暴露到全局（调试用）
    (window as any).game = game;
    (window as any).network = network;
}

main().catch(console.error);
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
    private _animationId: number | null = null;
    private _lastTime = 0;

    constructor(options: { debug?: boolean } = {}) {
        const { debug = false } = options;

        const config: ICoreConfig = { debug };
        Core.create(config);

        this._scene = new MainScene();
        Core.setScene(this._scene);
    }

    /**
     * @zh 启动游戏循环
     * @en Start game loop
     */
    start(): void {
        if (this._running) return;
        this._running = true;
        this._lastTime = performance.now();

        const loop = (now: number) => {
            if (!this._running) return;

            const dt = (now - this._lastTime) / 1000;
            this._lastTime = now;

            Core.update(dt);

            this._animationId = requestAnimationFrame(loop);
        };

        this._animationId = requestAnimationFrame(loop);
    }

    /**
     * @zh 停止游戏循环
     * @en Stop game loop
     */
    stop(): void {
        if (!this._running) return;
        this._running = false;

        if (this._animationId !== null) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
        Core.destroy();
    }

    /**
     * @zh 获取场景
     * @en Get scene
     */
    get scene(): MainScene {
        return this._scene;
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
        console.log('[MainScene] Scene started');
        // 创建初始实体
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
    return `import { EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
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

function generateNetworkManager(): string {
    return `import { NetworkPlugin, type ConnectOptions } from '@esengine/network';
import { Core } from '@esengine/ecs-framework';
import { setupNetworkHandlers } from './handlers';

/**
 * @zh 网络连接选项
 * @en Network connection options
 */
export interface NetworkConnectOptions {
    url: string;
    playerName: string;
    roomId?: string;
}

/**
 * @zh 网络管理器
 * @en Network manager
 *
 * @zh 封装 NetworkPlugin，提供简单的连接和断线重连功能
 * @en Wraps NetworkPlugin with simple connection and reconnection
 */
export class NetworkManager {
    private _plugin: NetworkPlugin;
    private _localPlayerId: number = 0;
    private _isConnected: boolean = false;

    constructor() {
        this._plugin = new NetworkPlugin({
            enablePrediction: true,
            enableAutoReconnect: true,
            maxReconnectAttempts: 5,
            reconnectInterval: 2000,
        });
    }

    /**
     * @zh 连接到服务器
     * @en Connect to server
     */
    async connect(options: NetworkConnectOptions): Promise<boolean> {
        try {
            // 安装网络插件
            await Core.installPlugin(this._plugin);

            // 设置网络事件处理
            setupNetworkHandlers(this._plugin);

            // 连接到服务器
            const connectOptions: ConnectOptions = {
                url: options.url,
                playerName: options.playerName,
                roomId: options.roomId,
                onConnect: () => {
                    console.log('[Network] Connected');
                    this._isConnected = true;
                },
                onDisconnect: (reason) => {
                    console.log('[Network] Disconnected:', reason);
                    this._isConnected = false;
                },
                onError: (error) => {
                    console.error('[Network] Error:', error);
                },
            };

            const success = await this._plugin.connect(connectOptions);

            if (success) {
                this._localPlayerId = this._plugin.localPlayerId;
                this._isConnected = true;
            }

            return success;
        } catch (error) {
            console.error('[Network] Connection failed:', error);
            return false;
        }
    }

    /**
     * @zh 断开连接
     * @en Disconnect
     */
    async disconnect(): Promise<void> {
        await this._plugin.disconnect();
        this._isConnected = false;
        this._localPlayerId = 0;
    }

    /**
     * @zh 发送移动输入
     * @en Send move input
     */
    sendMove(x: number, y: number): void {
        if (!this._isConnected) return;
        this._plugin.sendMoveInput(x, y);
    }

    /**
     * @zh 发送动作输入
     * @en Send action input
     */
    sendAction(action: string): void {
        if (!this._isConnected) return;
        this._plugin.sendActionInput(action);
    }

    /**
     * @zh 获取本地玩家 ID
     * @en Get local player ID
     */
    get localPlayerId(): number {
        return this._localPlayerId;
    }

    /**
     * @zh 是否已连接
     * @en Is connected
     */
    get isConnected(): boolean {
        return this._isConnected;
    }

    /**
     * @zh 获取网络插件
     * @en Get network plugin
     */
    get plugin(): NetworkPlugin {
        return this._plugin;
    }
}
`;
}

function generateNetworkHandlers(): string {
    return `import type { NetworkPlugin } from '@esengine/network';
import { Core } from '@esengine/ecs-framework';
import { PositionComponent } from '../game/components/PositionComponent';
import { VelocityComponent } from '../game/components/VelocityComponent';

/**
 * @zh 设置网络事件处理器
 * @en Setup network event handlers
 */
export function setupNetworkHandlers(plugin: NetworkPlugin): void {
    // 注册玩家预制体
    plugin.registerPrefab('player', (scene, spawn) => {
        const entity = scene.createEntity(\`Player_\${spawn.netId}\`);
        entity.addComponent(new PositionComponent(spawn.x ?? 0, spawn.y ?? 0));
        entity.addComponent(new VelocityComponent());

        console.log('[Network] Player spawned:', spawn.netId);
        return entity;
    });

    // 注册 NPC 预制体（示例）
    plugin.registerPrefab('npc', (scene, spawn) => {
        const entity = scene.createEntity(\`NPC_\${spawn.netId}\`);
        entity.addComponent(new PositionComponent(spawn.x ?? 0, spawn.y ?? 0));

        console.log('[Network] NPC spawned:', spawn.netId);
        return entity;
    });

    // 可以添加更多预制体...
}
`;
}

function generateHtml(config: ProjectConfig): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #1a1a2e;
            color: #eee;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        #game-container {
            width: 800px;
            height: 600px;
            background: #16213e;
            border: 2px solid #0f3460;
            border-radius: 8px;
        }
        h1 {
            margin-bottom: 20px;
            color: #e94560;
        }
        .info {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <h1>${config.name}</h1>
    <div id="game-container"></div>
    <p class="info">Open console (F12) to see game logs</p>
    <script type="module" src="/src/main.ts"></script>
</body>
</html>
`;
}

function generateViteConfig(): string {
    return `import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    define: {
        // 环境变量
        'import.meta.env.VITE_SERVER_URL': JSON.stringify(process.env.VITE_SERVER_URL || 'ws://localhost:3000'),
    },
});
`;
}

function generateTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`;
}

function generateReadme(config: ProjectConfig): string {
    return `# ${config.name}

Web 游戏客户端，基于 ESEngine ECS 框架。

## 快速开始

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
\`\`\`

## 连接服务器

1. 先启动 Node.js 游戏服务器（端口 3000）
2. 启动此客户端（端口 5173）
3. 在浏览器中打开 http://localhost:5173
4. 输入玩家名称即可连接

## 项目结构

\`\`\`
src/
├── main.ts                    # 入口文件
├── game/
│   ├── Game.ts                # ECS 游戏主类
│   ├── scenes/
│   │   └── MainScene.ts       # 主场景
│   ├── components/            # ECS 组件
│   │   ├── PositionComponent.ts
│   │   └── VelocityComponent.ts
│   └── systems/               # ECS 系统
│       └── MovementSystem.ts
└── network/
    ├── NetworkManager.ts      # 网络管理器
    └── handlers.ts            # 网络事件处理
\`\`\`

## 环境变量

创建 \`.env\` 文件：

\`\`\`
VITE_SERVER_URL=ws://localhost:3000
\`\`\`

## 文档

- [ESEngine 文档](https://esengine.github.io/esengine/)
- [Network 模块](https://esengine.github.io/esengine/modules/network/)
`;
}
