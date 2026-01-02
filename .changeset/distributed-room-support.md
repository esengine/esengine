---
"@esengine/server": minor
---

feat(server): 添加分布式房间支持 | Add distributed room support

**@esengine/server** - 新增分布式房间管理功能 | Added distributed room management features

- 新增 `DistributedRoomManager` 支持多服务器房间管理 | Added `DistributedRoomManager` for multi-server room management
- 新增 `MemoryAdapter` 用于测试和单机模式 | Added `MemoryAdapter` for testing and standalone mode
- 新增 `RedisAdapter` 用于生产环境多服务器部署 | Added `RedisAdapter` for production multi-server deployments
- 新增 `LoadBalancedRouter` 支持 5 种负载均衡策略 | Added `LoadBalancedRouter` with 5 load balancing strategies
  - round-robin: 轮询 | Round robin
  - least-rooms: 最少房间数 | Fewest rooms
  - least-players: 最少玩家数 | Fewest players
  - random: 随机选择 | Random selection
  - weighted: 权重（基于容量使用率）| Weighted by capacity usage
- `createServer` 新增 `distributed` 配置选项 | Added `distributed` config option to `createServer`
- 新增 `$redirect` 消息用于跨服务器玩家重定向 | Added `$redirect` message for cross-server player redirection
- 新增故障转移机制，服务器离线时自动恢复房间 | Added failover mechanism for automatic room recovery on server offline
- 新增 `room:migrated` 和 `server:draining` 事件类型 | Added `room:migrated` and `server:draining` event types
