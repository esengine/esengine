/**
 * 服务器入口
 * Server entry point
 */
import { GameServer } from './services/GameServer';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

const server = new GameServer({
    port: PORT,
    roomConfig: {
        maxPlayers: 16,
        tickRate: 20
    }
});

// 启动服务器
// Start server
server.start().catch((err) => {
    console.error('[Main] 服务器启动失败 | Server failed to start:', err);
    process.exit(1);
});

// 优雅关闭
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[Main] 正在关闭服务器... | Shutting down server...');
    await server.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
});
