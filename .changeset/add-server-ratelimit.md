---
"@esengine/server": minor
---

feat(server): 添加可插拔速率限制系统 | add pluggable rate limiting system

- 新增令牌桶策略 (`TokenBucketStrategy`) - 推荐用于一般场景
- 新增滑动窗口策略 (`SlidingWindowStrategy`) - 精确跟踪
- 新增固定窗口策略 (`FixedWindowStrategy`) - 简单高效
- 新增房间速率限制 mixin (`withRateLimit`)
- 新增速率限制装饰器 (`@rateLimit`, `@noRateLimit`)
- 新增按消息类型限流装饰器 (`@rateLimitMessage`, `@noRateLimitMessage`)
- 支持与认证系统组合使用
- 导出路径: `@esengine/server/ratelimit`
