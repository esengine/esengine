---
title: API 参考
description: ESEngine 完整 API 文档
---

# API 参考

ESEngine 提供完整的 TypeScript API 文档，涵盖所有核心类、接口和方法。

## 核心模块

### 基础类

| 类名 | 描述 |
|------|------|
| [Core](/api/classes/Core) | 框架核心单例，管理整个 ECS 生命周期 |
| [Scene](/api/classes/Scene) | 场景类，包含实体和系统 |
| [World](/api/classes/World) | 游戏世界，可包含多个场景 |
| [Entity](/api/classes/Entity) | 实体类，组件的容器 |
| [Component](/api/classes/Component) | 组件基类，纯数据容器 |

### 系统类

| 类名 | 描述 |
|------|------|
| [EntitySystem](/api/classes/EntitySystem) | 实体系统基类 |
| [ProcessingSystem](/api/classes/ProcessingSystem) | 处理系统，逐个处理实体 |
| [IntervalSystem](/api/classes/IntervalSystem) | 间隔执行系统 |
| [PassiveSystem](/api/classes/PassiveSystem) | 被动系统，不自动执行 |

### 工具类

| 类名 | 描述 |
|------|------|
| [Matcher](/api/classes/Matcher) | 实体匹配器，用于过滤实体 |
| [Time](/api/classes/Time) | 时间管理器 |
| [PerformanceMonitor](/api/classes/PerformanceMonitor) | 性能监控 |

## 装饰器

| 装饰器 | 描述 |
|--------|------|
| [@ECSComponent](/api/functions/ECSComponent) | 组件装饰器，用于注册组件 |
| [@ECSSystem](/api/functions/ECSSystem) | 系统装饰器，用于注册系统 |

## 枚举

| 枚举 | 描述 |
|------|------|
| [ECSEventType](/api/enumerations/ECSEventType) | ECS 事件类型 |
| [LogLevel](/api/enumerations/LogLevel) | 日志级别 |

## 接口

| 接口 | 描述 |
|------|------|
| [IScene](/api/interfaces/IScene) | 场景接口 |
| [IComponent](/api/interfaces/IComponent) | 组件接口 |
| [ISystemBase](/api/interfaces/ISystemBase) | 系统基础接口 |
| [ICoreConfig](/api/interfaces/ICoreConfig) | Core 配置接口 |

:::tip[API 文档生成]
完整 API 文档由 TypeDoc 自动生成，详见 GitHub 仓库中的 `/docs/api` 目录。
:::
