import { Command } from 'commander'
import prompts from 'prompts'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VERSION = '1.0.0'

function printLogo(): void {
    console.log()
    console.log(chalk.cyan('  ╭──────────────────────────────────────╮'))
    console.log(chalk.cyan('  │                                      │'))
    console.log(chalk.cyan('  │   ') + chalk.bold.white('Create ESEngine Server') + chalk.cyan('         │'))
    console.log(chalk.cyan('  │                                      │'))
    console.log(chalk.cyan('  ╰──────────────────────────────────────╯'))
    console.log()
}

function detectPackageManager(): 'pnpm' | 'yarn' | 'npm' {
    const userAgent = process.env.npm_config_user_agent || ''
    if (userAgent.includes('pnpm')) return 'pnpm'
    if (userAgent.includes('yarn')) return 'yarn'
    return 'npm'
}

function getInstallCommand(pm: string): string {
    return pm === 'yarn' ? 'yarn' : `${pm} install`
}

function writeFile(projectPath: string, relativePath: string, content: string): void {
    const fullPath = path.join(projectPath, relativePath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, content)
}

function generateProject(projectPath: string, projectName: string): void {
    // ========================================================================
    // package.json
    // ========================================================================
    const packageJson = {
        name: projectName,
        version: '1.0.0',
        type: 'module',
        private: true,
        scripts: {
            dev: 'tsx watch src/server/main.ts',
            start: 'tsx src/server/main.ts',
            build: 'tsc',
            'build:start': 'tsc && node dist/server/main.js',
        },
        dependencies: {
            '@esengine/server': 'latest',
            '@esengine/rpc': 'latest',
        },
        devDependencies: {
            '@types/node': '^20.0.0',
            tsx: '^4.0.0',
            typescript: '^5.0.0',
        },
    }
    writeFile(projectPath, 'package.json', JSON.stringify(packageJson, null, 2))

    // ========================================================================
    // tsconfig.json
    // ========================================================================
    const tsconfig = {
        compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            lib: ['ES2022'],
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            declaration: true,
            sourceMap: true,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist'],
    }
    writeFile(projectPath, 'tsconfig.json', JSON.stringify(tsconfig, null, 2))

    // ========================================================================
    // src/shared/protocol.ts - 共享协议定义
    // ========================================================================
    const protocolTs = `/**
 * 游戏协议定义
 * Game Protocol Definition
 *
 * 这个文件定义了客户端和服务端共享的协议类型
 * This file defines protocol types shared between client and server
 */

// ============================================================================
// 房间 API | Room API
// ============================================================================

/** 加入房间请求 | Join room request */
export interface JoinRoomReq {
    roomType: string
    playerName: string
    options?: Record<string, unknown>
}

/** 加入房间响应 | Join room response */
export interface JoinRoomRes {
    roomId: string
    playerId: string
}

// ============================================================================
// 游戏消息 | Game Messages
// ============================================================================

/** 移动消息 | Move message */
export interface MsgMove {
    x: number
    y: number
}

/** 聊天消息 | Chat message */
export interface MsgChat {
    text: string
}

// ============================================================================
// 服务端广播 | Server Broadcasts
// ============================================================================

/** 玩家加入广播 | Player joined broadcast */
export interface BroadcastJoined {
    playerId: string
    playerName: string
}

/** 玩家离开广播 | Player left broadcast */
export interface BroadcastLeft {
    playerId: string
}

/** 状态同步广播 | State sync broadcast */
export interface BroadcastSync {
    players: PlayerState[]
}

// ============================================================================
// 共享类型 | Shared Types
// ============================================================================

/** 玩家状态 | Player state */
export interface PlayerState {
    id: string
    name: string
    x: number
    y: number
}
`
    writeFile(projectPath, 'src/shared/protocol.ts', protocolTs)

    // ========================================================================
    // src/shared/index.ts
    // ========================================================================
    const sharedIndexTs = `export * from './protocol.js'
`
    writeFile(projectPath, 'src/shared/index.ts', sharedIndexTs)

    // ========================================================================
    // src/server/main.ts - 服务端入口
    // ========================================================================
    const serverMainTs = `import { createServer } from '@esengine/server'
import { GameRoom } from './rooms/GameRoom.js'

const PORT = Number(process.env.PORT) || 3000

async function main() {
    const server = await createServer({
        port: PORT,
        onConnect(conn) {
            console.log('[Server] Client connected:', conn.id)
        },
        onDisconnect(conn) {
            console.log('[Server] Client disconnected:', conn.id)
        },
    })

    // 注册房间类型
    server.define('game', GameRoom)

    await server.start()

    console.log('========================================')
    console.log('  ${projectName}')
    console.log('========================================')
    console.log(\`  WebSocket: ws://localhost:\${PORT}\`)
    console.log('  Room type: "game"')
    console.log('  Press Ctrl+C to stop')
    console.log('========================================')
}

process.on('SIGINT', () => {
    console.log('\\nShutting down...')
    process.exit(0)
})

main().catch(console.error)
`
    writeFile(projectPath, 'src/server/main.ts', serverMainTs)

    // ========================================================================
    // src/server/rooms/GameRoom.ts - 游戏房间
    // ========================================================================
    const gameRoomTs = `import { Room, Player, onMessage } from '@esengine/server'
import type {
    MsgMove,
    MsgChat,
    PlayerState,
    BroadcastSync,
    BroadcastJoined,
    BroadcastLeft,
} from '../../shared/index.js'

/** 玩家数据 | Player data */
interface PlayerData {
    name: string
    x: number
    y: number
}

/**
 * 游戏房间
 * Game Room
 */
export class GameRoom extends Room<{ players: PlayerState[] }, PlayerData> {
    // 配置
    maxPlayers = 8
    tickRate = 20

    // 状态
    state = {
        players: [] as PlayerState[],
    }

    // ========================================================================
    // 生命周期 | Lifecycle
    // ========================================================================

    onCreate() {
        console.log(\`[GameRoom] Room \${this.id} created\`)
    }

    onJoin(player: Player<PlayerData>) {
        // 初始化玩家数据
        player.data.name = 'Player_' + player.id.slice(-4)
        player.data.x = Math.random() * 800
        player.data.y = Math.random() * 600

        // 添加到状态
        this.state.players.push({
            id: player.id,
            name: player.data.name,
            x: player.data.x,
            y: player.data.y,
        })

        // 广播玩家加入
        this.broadcast<BroadcastJoined>('Joined', {
            playerId: player.id,
            playerName: player.data.name,
        })

        console.log(\`[GameRoom] \${player.data.name} joined room \${this.id}\`)
    }

    onLeave(player: Player<PlayerData>) {
        // 从状态移除
        this.state.players = this.state.players.filter(p => p.id !== player.id)

        // 广播玩家离开
        this.broadcast<BroadcastLeft>('Left', {
            playerId: player.id,
        })

        console.log(\`[GameRoom] \${player.data.name} left room \${this.id}\`)
    }

    onTick(_dt: number) {
        // 广播状态同步
        this.broadcast<BroadcastSync>('Sync', {
            players: this.state.players,
        })
    }

    onDispose() {
        console.log(\`[GameRoom] Room \${this.id} disposed\`)
    }

    // ========================================================================
    // 消息处理 | Message Handlers
    // ========================================================================

    @onMessage('Move')
    handleMove(data: MsgMove, player: Player<PlayerData>) {
        player.data.x = data.x
        player.data.y = data.y

        // 更新状态
        const p = this.state.players.find(p => p.id === player.id)
        if (p) {
            p.x = data.x
            p.y = data.y
        }
    }

    @onMessage('Chat')
    handleChat(data: MsgChat, player: Player<PlayerData>) {
        // 广播聊天消息
        this.broadcast('Chat', {
            from: player.data.name,
            text: data.text,
        })
    }
}
`
    writeFile(projectPath, 'src/server/rooms/GameRoom.ts', gameRoomTs)

    // ========================================================================
    // src/client/index.ts - 客户端示例
    // ========================================================================
    const clientIndexTs = `/**
 * 客户端示例代码
 * Client Example Code
 *
 * 这是一个示例，展示如何从客户端连接服务器
 * This is an example showing how to connect to the server from client
 */

import { connect } from '@esengine/rpc/client'
import type {
    JoinRoomReq,
    JoinRoomRes,
    MsgMove,
    BroadcastSync,
    BroadcastJoined,
} from '../shared/index.js'

async function main() {
    // 连接服务器
    const client = await connect('ws://localhost:3000')

    // 加入房间
    const result = await client.call<JoinRoomReq, JoinRoomRes>('JoinRoom', {
        roomType: 'game',
        playerName: 'Alice',
    })
    console.log('Joined room:', result.roomId)

    // 监听广播
    client.onMessage<BroadcastJoined>('Joined', (data) => {
        console.log('Player joined:', data.playerName)
    })

    client.onMessage<BroadcastSync>('Sync', (data) => {
        console.log('State update:', data.players.length, 'players')
    })

    // 发送移动消息
    client.send<MsgMove>('RoomMessage', {
        type: 'Move',
        payload: { x: 100, y: 200 },
    })
}

main().catch(console.error)
`
    writeFile(projectPath, 'src/client/index.ts', clientIndexTs)

    // ========================================================================
    // .gitignore
    // ========================================================================
    const gitignore = `node_modules/
dist/
*.log
.DS_Store
`
    writeFile(projectPath, '.gitignore', gitignore)

    // ========================================================================
    // README.md
    // ========================================================================
    const readme = `# ${projectName}

ESEngine 游戏服务器项目。

## 项目结构

\`\`\`
src/
├── shared/                 # 共享协议（客户端服务端都用）
│   ├── protocol.ts         # 类型定义
│   └── index.ts
├── server/                 # 服务端
│   ├── main.ts             # 入口
│   └── rooms/
│       └── GameRoom.ts     # 游戏房间
└── client/                 # 客户端示例
    └── index.ts
\`\`\`

## 快速开始

\`\`\`bash
# 启动服务器
npm run dev

# 服务器将在 ws://localhost:3000 启动
\`\`\`

## 客户端连接

\`\`\`typescript
import { connect } from '@esengine/rpc/client'

const client = await connect('ws://localhost:3000')

// 加入房间
const { roomId } = await client.call('JoinRoom', {
    roomType: 'game',
    playerName: 'Alice',
})

// 监听同步
client.onMessage('Sync', (state) => {
    console.log(state.players)
})

// 发送消息
client.send('RoomMessage', { type: 'Move', payload: { x: 100, y: 200 } })
\`\`\`
`
    writeFile(projectPath, 'README.md', readme)
}

async function main() {
    printLogo()

    const program = new Command()

    program
        .name('create-esengine-server')
        .description('Create a new ESEngine game server project')
        .version(VERSION)
        .argument('[project-name]', 'Name of the project')
        .action(async (projectName?: string) => {
            if (!projectName) {
                const response = await prompts({
                    type: 'text',
                    name: 'name',
                    message: 'Project name:',
                    initial: 'my-game-server',
                }, {
                    onCancel: () => {
                        console.log(chalk.yellow('\n  Cancelled.'))
                        process.exit(0)
                    },
                })
                projectName = response.name
            }

            if (!projectName) {
                console.log(chalk.red('  Project name is required.'))
                process.exit(1)
            }

            const projectPath = path.resolve(process.cwd(), projectName)

            if (fs.existsSync(projectPath)) {
                const files = fs.readdirSync(projectPath)
                if (files.length > 0) {
                    const response = await prompts({
                        type: 'confirm',
                        name: 'overwrite',
                        message: `Directory "${projectName}" is not empty. Continue?`,
                        initial: false,
                    })
                    if (!response.overwrite) {
                        console.log(chalk.yellow('\n  Cancelled.'))
                        process.exit(0)
                    }
                }
            } else {
                fs.mkdirSync(projectPath, { recursive: true })
            }

            console.log()
            console.log(chalk.bold(`  Creating project in ${chalk.cyan(projectPath)}...`))
            console.log()

            generateProject(projectPath, projectName)
            console.log(chalk.green('  ✓ Created project files'))

            const pm = detectPackageManager()
            const installCmd = getInstallCommand(pm)

            console.log(chalk.gray(`  Running ${installCmd}...`))
            console.log()

            try {
                execSync(installCmd, { cwd: projectPath, stdio: 'inherit' })
                console.log()
                console.log(chalk.green('  ✓ Dependencies installed'))
            } catch {
                console.log(chalk.yellow(`\n  ⚠ Failed to install. Run "${installCmd}" manually.`))
            }

            console.log()
            console.log(chalk.bold('  Done! Next steps:'))
            console.log()
            console.log(chalk.cyan(`    cd ${projectName}`))
            console.log(chalk.cyan(`    ${pm} run dev`))
            console.log()
            console.log(chalk.gray('  Project structure:'))
            console.log(chalk.gray('    src/'))
            console.log(chalk.gray('    ├── shared/           # Shared protocol types'))
            console.log(chalk.gray('    │   └── protocol.ts'))
            console.log(chalk.gray('    ├── server/           # Server code'))
            console.log(chalk.gray('    │   ├── main.ts'))
            console.log(chalk.gray('    │   └── rooms/'))
            console.log(chalk.gray('    │       └── GameRoom.ts'))
            console.log(chalk.gray('    └── client/           # Client example'))
            console.log(chalk.gray('        └── index.ts'))
            console.log()
        })

    program.parse()
}

main().catch(console.error)
