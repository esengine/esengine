---
title: "示例"
---

这里展示了ECS Framework的各种使用示例，通过实际的演示帮助您理解框架的功能和最佳实践。

## 🎮 互动演示

### 寻路系统

#### [A* 寻路演示](./astar-pathfinding-demo)
- **功能**: 网格寻路可视化
- **特性**: 迷宫生成、随机障碍、房间布局、螺旋地图
- **技术点**: A* 算法、增量寻路、ECS 架构

#### [多代理寻路演示](./multi-agent-pathfinding-demo)
- **功能**: 多代理同时寻路与避让
- **特性**: A* 寻路 + ORCA 避让结合、多种场景预设
- **技术点**: PathfindingSystem、LocalAvoidanceSystem 协作

#### [ORCA 局部避让演示](./orca-avoidance-demo)
- **功能**: 多代理碰撞避让 (ORCA 算法)
- **特性**: 50-500 代理实时避让、多种场景预设、参数调节
- **技术点**: KDTree 空间索引、线性规划求解、ECS 架构

### 系统演示

#### [Worker 系统演示](./worker-system-demo)
- **功能**: 展示 Worker 多线程物理计算和渲染优化
- **特性**: 1000+ 粒子实时物理模拟、碰撞检测、性能对比
- **技术点**: SharedArrayBuffer、Canvas 2D 优化、实体生命周期管理

## 🔗 外部示例

### [割草机演示](https://github.com/esengine/lawn-mower-demo)
- **平台**: Cocos Creator 3.x
- **功能**: 完整的游戏演示项目
- **特性**: 展示ECS架构在实际游戏项目中的应用

## 📚 更多资源

- [快速开始指南](/guide/getting-started)
- [核心概念](/guide/)
- [API文档](/api/README)