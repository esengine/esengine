---
title: "蓝图可视化脚本 (Blueprint)"
description: "完整的可视化脚本系统"
---

`@esengine/blueprint` 提供了一个功能完整的可视化脚本系统，支持节点式编程、事件驱动和蓝图组合。

## 安装

```bash
npm install @esengine/blueprint
```

## 快速开始

```typescript
import {
    createBlueprintSystem,
    createBlueprintComponentData,
    NodeRegistry,
    RegisterNode
} from '@esengine/blueprint';

// 创建蓝图系统
const blueprintSystem = createBlueprintSystem(scene);

// 加载蓝图资产
const blueprint = await loadBlueprintAsset('player.bp');

// 创建蓝图组件数据
const componentData = createBlueprintComponentData();
componentData.blueprintAsset = blueprint;

// 在游戏循环中更新
function gameLoop(dt: number) {
    blueprintSystem.process(entities, dt);
}
```

## 核心概念

### 蓝图资产结构

蓝图保存为 `.bp` 文件，包含以下结构：

```typescript
interface BlueprintAsset {
    version: number;           // 格式版本
    type: 'blueprint';         // 资产类型
    metadata: BlueprintMetadata; // 元数据
    variables: BlueprintVariable[]; // 变量定义
    nodes: BlueprintNode[];    // 节点实例
    connections: BlueprintConnection[]; // 连接
}
```

### 节点类型

节点按功能分为以下类别：

| 类别 | 说明 | 颜色 |
|------|------|------|
| `event` | 事件节点（入口点） | 红色 |
| `flow` | 流程控制 | 灰色 |
| `entity` | 实体操作 | 蓝色 |
| `component` | 组件访问 | 青色 |
| `math` | 数学运算 | 绿色 |
| `logic` | 逻辑运算 | 红色 |
| `variable` | 变量访问 | 紫色 |
| `time` | 时间工具 | 青色 |
| `debug` | 调试工具 | 灰色 |

### 引脚类型

节点通过引脚连接：

```typescript
interface BlueprintPinDefinition {
    name: string;        // 引脚名称
    type: PinDataType;   // 数据类型
    direction: 'input' | 'output';
    isExec?: boolean;    // 是否是执行引脚
    defaultValue?: unknown;
}

// 支持的数据类型
type PinDataType =
    | 'exec'      // 执行流
    | 'boolean'   // 布尔值
    | 'number'    // 数字
    | 'string'    // 字符串
    | 'vector2'   // 2D 向量
    | 'vector3'   // 3D 向量
    | 'entity'    // 实体引用
    | 'component' // 组件引用
    | 'any';      // 任意类型
```

### 变量作用域

```typescript
type VariableScope =
    | 'local'     // 每次执行独立
    | 'instance'  // 每个实体独立
    | 'global';   // 全局共享
```

## 文档导航

- [虚拟机 API](./vm) - BlueprintVM 执行和上下文
- [自定义节点](./custom-nodes) - 创建自定义节点
- [内置节点](./nodes) - 内置节点参考
- [蓝图组合](./composition) - 片段和组合器
- [实际示例](./examples) - ECS 集成和最佳实践
