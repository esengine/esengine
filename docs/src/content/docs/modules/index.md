---
title: 功能模块
description: ESEngine 可选功能模块总览
---

ESEngine 提供了丰富的功能模块，可以按需引入到你的项目中。

## 模块列表

### AI 模块

| 模块 | 包名 | 描述 |
|------|------|------|
| [行为树](/modules/behavior-tree/) | `@esengine/behavior-tree` | AI 行为树系统，支持可视化编辑 |
| [状态机](/modules/fsm/) | `@esengine/fsm` | 有限状态机，用于角色/AI 状态管理 |

### 游戏逻辑

| 模块 | 包名 | 描述 |
|------|------|------|
| [定时器](/modules/timer/) | `@esengine/timer` | 定时器和冷却系统 |
| [空间索引](/modules/spatial/) | `@esengine/spatial` | 空间查询、AOI 兴趣区域管理 |
| [寻路系统](/modules/pathfinding/) | `@esengine/pathfinding` | A* 寻路、NavMesh 导航网格 |

### 工具模块

| 模块 | 包名 | 描述 |
|------|------|------|
| [可视化脚本](/modules/blueprint/) | `@esengine/blueprint` | 蓝图可视化脚本系统 |
| [程序化生成](/modules/procgen/) | `@esengine/procgen` | 噪声函数、随机工具 |

### 网络模块

| 模块 | 包名 | 描述 |
|------|------|------|
| [网络同步](/modules/network/) | `@esengine/network` | 多人游戏网络同步 |

## 安装

所有模块都可以独立安装：

```bash
# 安装单个模块
npm install @esengine/behavior-tree

# 或使用 CLI 添加到现有项目
npx @esengine/cli add behavior-tree
```

## 平台兼容性

所有功能模块都是纯 TypeScript 实现，兼容：

- Cocos Creator 3.x
- Laya 3.x
- Node.js
- 浏览器
