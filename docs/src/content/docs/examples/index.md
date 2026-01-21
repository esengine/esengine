---
title: "示例"
---

这里展示了ECS Framework的各种使用示例，通过实际的演示帮助您理解框架的功能和最佳实践。

## 🎮 互动演示

### 导航系统

#### [NavigationSystem 导航演示](./navigation-system-demo)
- **功能**: 可插拔导航架构的完整演示
- **场景**: NavMesh、A*、JPS、圆形交换、漏斗通道、压力测试
- **特性**: 运行时切换寻路算法、ORCA 多代理避让、碰撞检测
- **技术点**: NavigationSystem、IPathPlanner、ILocalAvoidance 接口

### 网络同步

#### [网络同步演示](./network-sync-demo)
- **功能**: 客户端-服务器状态同步
- **特性**: 插值、预测、延迟补偿
- **技术点**: NetworkIdentity、NetworkTransform、SnapshotBuffer

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
