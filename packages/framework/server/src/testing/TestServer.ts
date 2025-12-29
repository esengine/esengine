/**
 * @zh 测试服务器工具
 * @en Test server utilities
 */

import { createServer } from '../core/server.js'
import type { GameServer } from '../types/index.js'
import { TestClient, type TestClientOptions } from './TestClient.js'

// ============================================================================
// Types | 类型定义
// ============================================================================

/**
 * @zh 测试服务器配置
 * @en Test server options
 */
export interface TestServerOptions {
    /**
     * @zh 端口号，0 表示随机端口
     * @en Port number, 0 for random port
     * @defaultValue 0
     */
    port?: number

    /**
     * @zh Tick 速率
     * @en Tick rate
     * @defaultValue 0
     */
    tickRate?: number

    /**
     * @zh 是否禁用控制台日志
     * @en Whether to suppress console logs
     * @defaultValue true
     */
    silent?: boolean
}

/**
 * @zh 测试环境
 * @en Test environment
 */
export interface TestEnvironment {
    /**
     * @zh 服务器实例
     * @en Server instance
     */
    server: GameServer

    /**
     * @zh 服务器端口
     * @en Server port
     */
    port: number

    /**
     * @zh 创建测试客户端
     * @en Create test client
     */
    createClient(options?: TestClientOptions): Promise<TestClient>

    /**
     * @zh 创建多个测试客户端
     * @en Create multiple test clients
     */
    createClients(count: number, options?: TestClientOptions): Promise<TestClient[]>

    /**
     * @zh 清理测试环境
     * @en Cleanup test environment
     */
    cleanup(): Promise<void>

    /**
     * @zh 所有已创建的客户端
     * @en All created clients
     */
    readonly clients: ReadonlyArray<TestClient>
}

// ============================================================================
// Helper Functions | 辅助函数
// ============================================================================

/**
 * @zh 获取随机可用端口
 * @en Get a random available port
 */
async function getRandomPort(): Promise<number> {
    const net = await import('node:net')
    return new Promise((resolve, reject) => {
        const server = net.createServer()
        server.listen(0, () => {
            const address = server.address()
            if (address && typeof address === 'object') {
                const port = address.port
                server.close(() => resolve(port))
            } else {
                server.close(() => reject(new Error('Failed to get port')))
            }
        })
        server.on('error', reject)
    })
}

/**
 * @zh 等待指定毫秒
 * @en Wait for specified milliseconds
 */
export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================================
// Factory Functions | 工厂函数
// ============================================================================

/**
 * @zh 创建测试服务器
 * @en Create test server
 *
 * @example
 * ```typescript
 * const { server, port, cleanup } = await createTestServer()
 * server.define('game', GameRoom)
 *
 * const client = new TestClient(port)
 * await client.connect()
 *
 * // ... run tests ...
 *
 * await cleanup()
 * ```
 */
export async function createTestServer(
    options: TestServerOptions = {}
): Promise<{ server: GameServer; port: number; cleanup: () => Promise<void> }> {
    const port = options.port || (await getRandomPort())
    const silent = options.silent ?? true

    // 临时禁用 console.log
    const originalLog = console.log
    if (silent) {
        console.log = () => {}
    }

    const server = await createServer({
        port,
        tickRate: options.tickRate ?? 0,
        apiDir: '__non_existent_api__',
        msgDir: '__non_existent_msg__',
    })

    await server.start()

    // 恢复 console.log
    if (silent) {
        console.log = originalLog
    }

    return {
        server,
        port,
        cleanup: async () => {
            await server.stop()
        },
    }
}

/**
 * @zh 创建完整测试环境
 * @en Create complete test environment
 *
 * @zh 包含服务器、客户端创建和清理功能的完整测试环境
 * @en Complete test environment with server, client creation and cleanup
 *
 * @example
 * ```typescript
 * describe('GameRoom', () => {
 *     let env: TestEnvironment
 *
 *     beforeEach(async () => {
 *         env = await createTestEnv()
 *         env.server.define('game', GameRoom)
 *     })
 *
 *     afterEach(async () => {
 *         await env.cleanup()
 *     })
 *
 *     it('should handle player join', async () => {
 *         const client = await env.createClient()
 *         const result = await client.joinRoom('game')
 *         expect(result.roomId).toBeDefined()
 *     })
 *
 *     it('should broadcast to all players', async () => {
 *         const [client1, client2] = await env.createClients(2)
 *
 *         await client1.joinRoom('game')
 *         const joinPromise = client1.waitForRoomMessage('PlayerJoined')
 *
 *         await client2.joinRoom('game')
 *         const msg = await joinPromise
 *
 *         expect(msg).toBeDefined()
 *     })
 * })
 * ```
 */
export async function createTestEnv(options: TestServerOptions = {}): Promise<TestEnvironment> {
    const { server, port, cleanup: serverCleanup } = await createTestServer(options)
    const clients: TestClient[] = []

    return {
        server,
        port,
        clients,

        async createClient(clientOptions?: TestClientOptions): Promise<TestClient> {
            const client = new TestClient(port, clientOptions)
            await client.connect()
            clients.push(client)
            return client
        },

        async createClients(count: number, clientOptions?: TestClientOptions): Promise<TestClient[]> {
            const newClients: TestClient[] = []
            for (let i = 0; i < count; i++) {
                const client = new TestClient(port, clientOptions)
                await client.connect()
                clients.push(client)
                newClients.push(client)
            }
            return newClients
        },

        async cleanup(): Promise<void> {
            // 断开所有客户端
            await Promise.all(clients.map((c) => c.disconnect().catch(() => {})))
            clients.length = 0

            // 停止服务器
            await serverCleanup()
        },
    }
}
