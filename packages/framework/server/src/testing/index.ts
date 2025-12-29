/**
 * @zh 服务器测试工具
 * @en Server testing utilities
 *
 * @example
 * ```typescript
 * import { createTestServer, TestClient } from '@esengine/server/testing'
 *
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
 *     it('should join room', async () => {
 *         const client = await env.createClient()
 *         const result = await client.joinRoom('game')
 *         expect(result.roomId).toBeDefined()
 *     })
 * })
 * ```
 */

export { TestClient, type TestClientOptions } from './TestClient.js'
export {
    createTestServer,
    createTestEnv,
    type TestServerOptions,
    type TestEnvironment,
} from './TestServer.js'
export { MockRoom } from './MockRoom.js'
