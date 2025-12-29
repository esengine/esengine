---
title: "速率限制"
description: "使用可配置的速率限制保护你的游戏服务器免受滥用"
---

`@esengine/server` 包含可插拔的速率限制系统，用于防止 DDoS 攻击、消息洪水和其他滥用行为。

## 安装

速率限制包含在 server 包中：

```bash
npm install @esengine/server
```

## 快速开始

```typescript
import { Room, onMessage } from '@esengine/server'
import { withRateLimit, rateLimit, noRateLimit } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room, {
    messagesPerSecond: 10,
    burstSize: 20,
    onLimited: (player, type, result) => {
        player.send('Error', {
            code: 'RATE_LIMITED',
            retryAfter: result.retryAfter,
        })
    },
}) {
    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: Player) {
        // 受速率限制保护（默认 10 msg/s）
    }

    @rateLimit({ messagesPerSecond: 1 })
    @onMessage('Trade')
    handleTrade(data: TradeData, player: Player) {
        // 交易使用更严格的限制
    }

    @noRateLimit()
    @onMessage('Heartbeat')
    handleHeartbeat(data: any, player: Player) {
        // 心跳不限制
    }
}
```

## 速率限制策略

### 令牌桶（默认）

令牌桶算法允许突发流量，同时保持长期速率限制。令牌以固定速率添加，每个请求消耗令牌。

```typescript
import { withRateLimit } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room, {
    strategy: 'token-bucket',
    messagesPerSecond: 10, // 补充速率
    burstSize: 20,         // 桶容量
}) { }
```

**工作原理：**
```
配置: rate=10/s, burstSize=20

[0s]   桶满: 20 令牌
[0s]   收到 15 条消息 → 允许，剩余 5
[0.5s] 补充 5 令牌 → 10 令牌
[0.5s] 收到 8 条消息 → 允许，剩余 2
[0.6s] 补充 1 令牌 → 3 令牌
[0.6s] 收到 5 条消息 → 允许 3，拒绝 2
```

**最适合：** 大多数通用场景，平衡突发容忍度与保护。

### 滑动窗口

滑动窗口算法精确跟踪时间窗口内的请求。比固定窗口更准确，但内存使用稍多。

```typescript
class GameRoom extends withRateLimit(Room, {
    strategy: 'sliding-window',
    messagesPerSecond: 10,
    burstSize: 10,
}) { }
```

**最适合：** 需要精确限流且不需要突发容忍的场景。

### 固定窗口

固定窗口算法将时间划分为固定间隔，并计算每个间隔内的请求数。简单且内存高效，但在窗口边界允许 2 倍突发。

```typescript
class GameRoom extends withRateLimit(Room, {
    strategy: 'fixed-window',
    messagesPerSecond: 10,
    burstSize: 10,
}) { }
```

**最适合：** 简单场景，可接受边界突发。

## 配置

### 房间配置

```typescript
import { withRateLimit } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room, {
    // 每秒允许的消息数（默认: 10）
    messagesPerSecond: 10,

    // 突发容量 / 桶大小（默认: 20）
    burstSize: 20,

    // 策略: 'token-bucket' | 'sliding-window' | 'fixed-window'
    strategy: 'token-bucket',

    // 被限流时的回调
    onLimited: (player, messageType, result) => {
        player.send('RateLimited', {
            type: messageType,
            retryAfter: result.retryAfter,
        })
    },

    // 限流时断开连接（默认: false）
    disconnectOnLimit: false,

    // 连续 N 次限流后断开（0 = 永不）
    maxConsecutiveLimits: 10,

    // 自定义键函数（默认: player.id）
    getKey: (player) => player.id,

    // 清理间隔（毫秒，默认: 60000）
    cleanupInterval: 60000,
}) { }
```

### 单消息配置

使用装饰器为特定消息配置速率限制：

```typescript
import { rateLimit, noRateLimit, rateLimitMessage } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room) {
    // 此消息使用自定义速率限制
    @rateLimit({ messagesPerSecond: 1, burstSize: 2 })
    @onMessage('Trade')
    handleTrade(data: TradeData, player: Player) { }

    // 此消息消耗 5 个令牌
    @rateLimit({ cost: 5 })
    @onMessage('ExpensiveAction')
    handleExpensive(data: any, player: Player) { }

    // 豁免速率限制
    @noRateLimit()
    @onMessage('Heartbeat')
    handleHeartbeat(data: any, player: Player) { }

    // 替代方案：显式指定消息类型
    @rateLimitMessage('SpecialAction', { messagesPerSecond: 2 })
    @onMessage('SpecialAction')
    handleSpecial(data: any, player: Player) { }
}
```

## 与认证系统组合

速率限制可与认证系统无缝配合：

```typescript
import { withRoomAuth } from '@esengine/server/auth'
import { withRateLimit } from '@esengine/server/ratelimit'

// 同时应用两个 mixin
class GameRoom extends withRateLimit(
    withRoomAuth(Room, { requireAuth: true }),
    { messagesPerSecond: 10 }
) {
    onJoin(player: AuthPlayer) {
        console.log(`${player.user?.name} 已加入，受速率限制保护`)
    }
}
```

## 速率限制结果

当消息被限流时，回调会收到结果对象：

```typescript
interface RateLimitResult {
    // 是否允许请求
    allowed: boolean

    // 剩余配额
    remaining: number

    // 配额重置时间（时间戳）
    resetAt: number

    // 重试等待时间（毫秒）
    retryAfter?: number
}
```

## 访问速率限制上下文

你可以访问任何玩家的速率限制上下文：

```typescript
import { getPlayerRateLimitContext } from '@esengine/server/ratelimit'

class GameRoom extends withRateLimit(Room) {
    someMethod(player: Player) {
        const context = this.getRateLimitContext(player)

        // 检查但不消费
        const status = context?.check()
        console.log(`剩余: ${status?.remaining}`)

        // 获取连续限流次数
        console.log(`连续限流: ${context?.consecutiveLimitCount}`)
    }
}

// 或使用独立函数
const context = getPlayerRateLimitContext(player)
```

## 自定义策略

你可以直接使用策略进行自定义实现：

```typescript
import {
    TokenBucketStrategy,
    SlidingWindowStrategy,
    FixedWindowStrategy,
    createTokenBucketStrategy,
} from '@esengine/server/ratelimit'

// 直接创建策略
const strategy = createTokenBucketStrategy({
    rate: 10,      // 每秒令牌数
    capacity: 20,  // 最大令牌数
})

// 检查并消费
const result = strategy.consume('player-123')
if (result.allowed) {
    // 处理消息
} else {
    // 被限流，等待 result.retryAfter 毫秒
}

// 检查但不消费
const status = strategy.getStatus('player-123')

// 重置某个键
strategy.reset('player-123')

// 清理过期记录
strategy.cleanup()
```

## 速率限制上下文

`RateLimitContext` 类管理单个玩家的速率限制：

```typescript
import { RateLimitContext, TokenBucketStrategy } from '@esengine/server/ratelimit'

const strategy = new TokenBucketStrategy({ rate: 10, capacity: 20 })
const context = new RateLimitContext('player-123', strategy)

// 检查但不消费
context.check()

// 消费配额
context.consume()

// 带消耗量消费
context.consume(undefined, 5)

// 为特定消息类型消费
context.consume('Trade')

// 设置单消息策略
context.setMessageStrategy('Trade', new TokenBucketStrategy({ rate: 1, capacity: 2 }))

// 重置
context.reset()

// 获取连续限流次数
console.log(context.consecutiveLimitCount)
```

## 房间生命周期钩子

你可以重写 `onRateLimited` 钩子进行自定义处理：

```typescript
class GameRoom extends withRateLimit(Room) {
    onRateLimited(player: Player, messageType: string, result: RateLimitResult) {
        // 记录事件
        console.log(`玩家 ${player.id} 在 ${messageType} 上被限流`)

        // 发送自定义错误
        player.send('SystemMessage', {
            type: 'warning',
            message: `请慢一点！${result.retryAfter}ms 后重试`,
        })
    }
}
```

## 最佳实践

1. **从令牌桶开始**：对于游戏来说是最灵活的算法。

2. **设置合适的限制**：考虑你的游戏机制：
   - 移动消息：较高限制（20-60/s）
   - 聊天消息：较低限制（1-5/s）
   - 交易/购买：非常低的限制（0.5-1/s）

3. **使用突发容量**：允许短暂突发以获得响应式体验：
   ```typescript
   messagesPerSecond: 10,
   burstSize: 30, // 允许 3 秒的突发
   ```

4. **豁免关键消息**：不要限制心跳或系统消息：
   ```typescript
   @noRateLimit()
   @onMessage('Heartbeat')
   handleHeartbeat() { }
   ```

5. **与认证结合**：对已认证用户按用户 ID 限流：
   ```typescript
   getKey: (player) => player.auth?.userId ?? player.id
   ```

6. **监控和调整**：记录限流事件以调整限制：
   ```typescript
   onLimited: (player, type, result) => {
       metrics.increment('rate_limit', { messageType: type })
   }
   ```

7. **优雅降级**：发送信息性错误而不是直接断开：
   ```typescript
   onLimited: (player, type, result) => {
       player.send('Error', {
           code: 'RATE_LIMITED',
           message: '请求过于频繁',
           retryAfter: result.retryAfter,
       })
   }
   ```

## 完整示例

```typescript
import { Room, onMessage, type Player } from '@esengine/server'
import { withRoomAuth, type AuthPlayer } from '@esengine/server/auth'
import {
    withRateLimit,
    rateLimit,
    noRateLimit,
    type RateLimitResult,
} from '@esengine/server/ratelimit'

interface User {
    id: string
    name: string
    premium: boolean
}

// 组合认证和速率限制
class GameRoom extends withRateLimit(
    withRoomAuth<User>(Room, { requireAuth: true }),
    {
        messagesPerSecond: 10,
        burstSize: 30,
        strategy: 'token-bucket',

        // 使用用户 ID 进行限流
        getKey: (player) => (player as AuthPlayer<User>).user?.id ?? player.id,

        // 处理限流
        onLimited: (player, type, result) => {
            player.send('Error', {
                code: 'RATE_LIMITED',
                messageType: type,
                retryAfter: result.retryAfter,
            })
        },

        // 连续 20 次限流后断开
        maxConsecutiveLimits: 20,
    }
) {
    onCreate() {
        console.log('房间已创建，具有认证 + 速率限制保护')
    }

    onJoin(player: AuthPlayer<User>) {
        this.broadcast('PlayerJoined', { name: player.user?.name })
    }

    // 高频移动（默认速率限制）
    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: AuthPlayer<User>) {
        this.broadcast('PlayerMoved', { id: player.id, ...data })
    }

    // 低频交易（严格限制）
    @rateLimit({ messagesPerSecond: 0.5, burstSize: 2 })
    @onMessage('Trade')
    handleTrade(data: TradeData, player: AuthPlayer<User>) {
        // 处理交易...
    }

    // 聊天使用中等限制
    @rateLimit({ messagesPerSecond: 2, burstSize: 5 })
    @onMessage('Chat')
    handleChat(data: { text: string }, player: AuthPlayer<User>) {
        this.broadcast('Chat', {
            from: player.user?.name,
            text: data.text,
        })
    }

    // 系统消息 - 不限制
    @noRateLimit()
    @onMessage('Heartbeat')
    handleHeartbeat(data: any, player: Player) {
        player.send('Pong', { time: Date.now() })
    }

    // 自定义限流处理
    onRateLimited(player: Player, messageType: string, result: RateLimitResult) {
        console.warn(`[限流] 玩家 ${player.id} 在 ${messageType} 上被限流`)
    }
}
```
