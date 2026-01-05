---
title: "蓝图编辑器使用指南"
description: "Cocos Creator 蓝图可视化脚本编辑器完整使用教程"
---

本指南介绍如何在 Cocos Creator 中使用蓝图可视化脚本编辑器。

## 下载与安装

### 下载

> **内测中**：蓝图编辑器目前处于内测阶段，需要激活码才能使用。
> 请加入 QQ 群 **481923584** 后私聊群主获取激活码。

从 GitHub Release 下载最新版本：

**[下载 Cocos Node Editor v1.0.0](https://github.com/esengine/esengine/releases/tag/cocos-node-editor-v1.0.0)**

### 安装步骤

1. 解压 `cocos-node-editor.zip` 到项目的 `extensions` 目录：

```
your-project/
├── assets/
├── extensions/
│   └── cocos-node-editor/    ← 解压到这里
└── ...
```

2. 重启 Cocos Creator

3. 通过菜单 **扩展 → 扩展管理器** 确认插件已启用

4. 通过菜单 **面板 → Node Editor** 打开编辑器

## 界面介绍

- **工具栏** - 位于顶部，包含新建、打开、保存、撤销、重做等操作
- **变量面板** - 位于左上角，用于定义和管理蓝图变量
- **画布区域** - 主区域，用于放置和连接节点
- **节点菜单** - 右键点击画布空白处打开，按分类列出所有可用节点

## 画布操作

| 操作 | 方式 |
|------|------|
| 平移画布 | 鼠标中键拖拽 / Alt + 左键拖拽 |
| 缩放画布 | 鼠标滚轮 |
| 打开节点菜单 | 右键点击空白处 |
| 框选多个节点 | 在空白处拖拽 |
| 追加框选 | Ctrl + 拖拽 |
| 删除选中 | Delete 键 |

## 节点操作

### 添加节点

1. **从节点面板拖拽** - 将节点从左侧面板拖到画布
2. **右键菜单** - 右键点击画布空白处，选择节点

### 连接节点

1. 从输出引脚拖拽到输入引脚
2. 兼容类型的引脚会高亮显示
3. 松开鼠标完成连接

**引脚类型说明：**

| 引脚颜色 | 类型 | 说明 |
|---------|------|------|
| 白色 ▶ | Exec | 执行流程（控制执行顺序） |
| 青色 ◆ | Entity | 实体引用 |
| 紫色 ◆ | Component | 组件引用 |
| 浅蓝 ◆ | String | 字符串 |
| 绿色 ◆ | Number | 数值 |
| 红色 ◆ | Boolean | 布尔值 |
| 灰色 ◆ | Any | 任意类型 |

### 删除连接

点击连接线选中，按 Delete 键删除。

## 节点类型详解

### 事件节点 (Event)

事件节点是蓝图的入口点，当特定事件发生时触发执行。

| 节点 | 触发时机 | 输出 |
|------|---------|------|
| **Event BeginPlay** | 蓝图开始运行时 | Exec, Self (实体) |
| **Event Tick** | 每帧执行 | Exec, Delta Time |
| **Event EndPlay** | 蓝图停止时 | Exec |

**示例：游戏开始时打印消息**
```
[Event BeginPlay] ──Exec──→ [Print]
                              └─ Message: "游戏开始!"
```

### 实体节点 (Entity)

操作 ECS 实体的节点。

| 节点 | 功能 | 输入 | 输出 |
|------|------|------|------|
| **Get Self** | 获取当前实体 | - | Entity |
| **Create Entity** | 创建新实体 | Exec, Name | Exec, Entity |
| **Destroy Entity** | 销毁实体 | Exec, Entity | Exec |
| **Find Entity By Name** | 按名称查找 | Name | Entity |
| **Find Entities By Tag** | 按标签查找 | Tag | Entity[] |
| **Is Valid** | 检查实体有效性 | Entity | Boolean |
| **Get/Set Entity Name** | 获取/设置名称 | Entity | String |
| **Set Active** | 设置激活状态 | Exec, Entity, Active | Exec |

**示例：创建新实体**
```
[Event BeginPlay] ──→ [Create Entity] ──→ [Add Component]
                        └─ Name: "Bullet"     └─ Type: Transform
```

### 组件节点 (Component)

访问和操作 ECS 组件。

| 节点 | 功能 |
|------|------|
| **Has Component** | 检查实体是否有指定组件 |
| **Get Component** | 获取组件实例 |
| **Add Component** | 添加组件到实体 |
| **Remove Component** | 移除组件 |
| **Get/Set Property** | 获取/设置组件属性 |

**示例：修改 Transform 组件**
```
[Get Self] ─Entity─→ [Get Component: Transform] ─Component─→ [Set Property]
                                                               ├─ Property: x
                                                               └─ Value: 100
```

### 流程控制节点 (Flow)

控制执行流程的节点。

#### Branch (分支)

条件判断，类似 if/else。

```
         ┌─ True ──→ [DoSomething]
[Branch]─┤
         └─ False ─→ [DoOtherThing]
```

#### Sequence (序列)

按顺序执行多个分支。

```
           ┌─ Then 0 ──→ [Step1]
[Sequence]─┼─ Then 1 ──→ [Step2]
           └─ Then 2 ──→ [Step3]
```

#### For Loop (循环)

循环执行指定次数。

```
[For Loop] ─Loop Body─→ [每次迭代执行]
    │
    └─ Completed ────→ [循环结束后执行]
```

| 输入 | 说明 |
|------|------|
| First Index | 起始索引 |
| Last Index | 结束索引 |

| 输出 | 说明 |
|------|------|
| Loop Body | 每次迭代执行 |
| Index | 当前索引 |
| Completed | 循环结束后执行 |

#### For Each (遍历)

遍历数组元素。

#### While Loop (条件循环)

当条件为真时持续循环。

#### Do Once (单次执行)

只执行一次，之后跳过。

#### Flip Flop (交替执行)

每次执行时交替触发 A 和 B 输出。

#### Gate (门)

可通过 Open/Close/Toggle 控制是否允许执行通过。

### 时间节点 (Time)

| 节点 | 功能 | 输出类型 |
|------|------|---------|
| **Delay** | 延迟指定时间后继续执行 | Exec |
| **Get Delta Time** | 获取帧间隔时间 | Number |
| **Get Time** | 获取运行总时间 | Number |

**示例：延迟 2 秒后执行**
```
[Event BeginPlay] ──→ [Delay] ──→ [Print]
                       └─ Duration: 2.0   └─ "2秒后执行"
```

### 数学节点 (Math)

| 节点 | 功能 |
|------|------|
| **Add / Subtract / Multiply / Divide** | 四则运算 |
| **Abs** | 绝对值 |
| **Clamp** | 限制在范围内 |
| **Lerp** | 线性插值 |
| **Min / Max** | 最小/最大值 |
| **Random Range** | 随机数 |
| **Sin / Cos / Tan** | 三角函数 |

### 调试节点 (Debug)

| 节点 | 功能 |
|------|------|
| **Print** | 输出到控制台 |

## 变量系统

变量用于在蓝图中存储和共享数据。

### 创建变量

1. 在变量面板点击 **+** 按钮
2. 输入变量名称
3. 选择变量类型
4. 设置默认值（可选）

### 使用变量

- **拖拽到画布** - 创建 Get 或 Set 节点
- **Get 节点** - 读取变量值
- **Set 节点** - 写入变量值

### 变量类型

| 类型 | 说明 | 默认值 |
|------|------|--------|
| Boolean | 布尔值 | false |
| Number | 数值 | 0 |
| String | 字符串 | "" |
| Entity | 实体引用 | null |
| Vector2 | 二维向量 | (0, 0) |
| Vector3 | 三维向量 | (0, 0, 0) |

### 变量节点错误状态

如果删除了一个变量，但画布上还有引用该变量的节点：
- 节点会显示 **红色边框** 和 **警告图标**
- 需要重新创建变量或删除这些节点

## 节点分组

可以将多个节点组织到一个可视化组框中，便于整理复杂蓝图。

### 创建组

1. 框选或 Ctrl+点击 选中多个节点（至少 2 个）
2. 右键点击选中的节点
3. 选择 **创建分组**
4. 组框会自动包裹所有选中的节点

### 组操作

| 操作 | 方式 |
|------|------|
| 移动组 | 拖拽组框头部，所有节点一起移动 |
| 取消分组 | 右键点击组框 → **取消分组** |

### 特性

- **动态大小**：组框会自动调整大小以包裹所有节点
- **独立移动**：可以单独移动组内的节点，组框会自动调整
- **仅编辑器**：组是纯视觉组织，不影响运行时逻辑

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + S` | 保存蓝图 |
| `Ctrl + Z` | 撤销 |
| `Ctrl + Shift + Z` | 重做 |
| `Ctrl + C` | 复制选中节点 |
| `Ctrl + X` | 剪切选中节点 |
| `Ctrl + V` | 粘贴节点 |
| `Delete` | 删除选中项 |
| `Ctrl + A` | 全选 |

## 保存与加载

### 保存蓝图

1. 点击工具栏 **保存** 按钮
2. 选择保存位置（**必须保存在 `assets/resources` 目录下**，否则 Cocos Creator 无法动态加载）
3. 文件扩展名为 `.blueprint.json`

> **重要提示**：蓝图文件必须放在 `resources` 目录下，游戏运行时才能通过 `cc.resources.load()` 加载。

### 加载蓝图

1. 点击工具栏 **打开** 按钮
2. 选择 `.blueprint.json` 文件

### 蓝图文件格式

蓝图保存为 JSON 格式，可与 `@esengine/blueprint` 运行时兼容：

```json
{
  "version": 1,
  "type": "blueprint",
  "metadata": {
    "name": "PlayerController",
    "description": "玩家控制逻辑"
  },
  "variables": [],
  "nodes": [],
  "connections": []
}
```

## 实战示例

### 示例 1：移动控制

实现每帧移动实体：

```
[Event Tick] ─Exec─→ [Get Self] ─Entity─→ [Get Component: Transform]
                                               │
                     [Get Delta Time]          ▼
                          │              [Set Property: x]
                          │                    │
                     [Multiply] ◄──────────────┘
                          │
                          └─ Speed: 100
```

### 示例 2：生命值系统

受伤后检查死亡：

```
[On Damage Event] ─→ [Get Component: Health] ─→ [Get Property: current]
                                                        │
                                                        ▼
                                                  [Subtract]
                                                        │
                                                        ▼
                                                  [Set Property: current]
                                                        │
                                                        ▼
                              ┌─ True ─→ [Destroy Self]
                     [Branch]─┤
                              └─ False ─→ (继续)
                                   ▲
                                   │
                           [Less Or Equal]
                                   │
                              current <= 0
```

### 示例 3：延迟生成

每 2 秒生成一个敌人：

```
[Event BeginPlay] ─→ [Do N Times] ─Loop─→ [Delay: 2.0] ─→ [Create Entity: Enemy]
                          │
                          └─ N: 10
```

## 常见问题

### Q: 节点无法连接？

检查引脚类型是否匹配。执行引脚（白色）只能连接执行引脚，数据引脚需要类型兼容。

### Q: 蓝图不执行？

1. 确保实体添加了 `BlueprintComponent`
2. 确保场景添加了 `BlueprintSystem`
3. 检查 `autoStart` 是否为 `true`

### Q: 如何调试？

使用 **Print** 节点输出变量值到控制台。

## 下一步

- [ECS 节点参考](./nodes) - 完整节点列表
- [自定义节点](./custom-nodes) - 创建自定义节点
- [运行时集成](./vm) - 蓝图虚拟机 API
- [实际示例](./examples) - 更多游戏逻辑示例
