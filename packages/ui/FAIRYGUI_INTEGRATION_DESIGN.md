# FairyGUI ECS 集成设计文档

## 1. 架构概览

### 1.1 设计原则

- **完全兼容 FairyGUI Editor** - 使用官方编辑器导出的 `.fui` 包
- **ECS 原生集成** - UI 对象作为 Entity + Component 存在
- **渲染管线分离** - 输出渲染数据给 WebGPU 渲染器
- **零 Laya 依赖** - 完全替换 Laya API

### 1.2 核心模块

```
packages/fairygui/
├── src/
│   ├── core/                    # 核心类
│   │   ├── GObject.ts           # UI 对象基类
│   │   ├── GComponent.ts        # 容器组件
│   │   ├── GRoot.ts             # 根容器
│   │   ├── Controller.ts        # 控制器（状态机）
│   │   └── Transition.ts        # 动效
│   │
│   ├── display/                 # 显示对象
│   │   ├── DisplayObject.ts     # 抽象显示对象（替代 Laya.Sprite）
│   │   ├── Image.ts             # 图像
│   │   ├── MovieClip.ts         # 动画
│   │   └── TextField.ts         # 文本
│   │
│   ├── widgets/                 # 控件
│   │   ├── GImage.ts
│   │   ├── GTextField.ts
│   │   ├── GTextInput.ts
│   │   ├── GButton.ts
│   │   ├── GList.ts
│   │   ├── GSlider.ts
│   │   ├── GProgressBar.ts
│   │   ├── GComboBox.ts
│   │   ├── GScrollBar.ts
│   │   └── GLoader.ts
│   │
│   ├── layout/                  # 布局系统
│   │   ├── Relations.ts         # 关联约束
│   │   ├── RelationItem.ts      # 关联项
│   │   └── Margin.ts            # 边距
│   │
│   ├── gears/                   # Gear 系统（控制器联动）
│   │   ├── GearBase.ts
│   │   ├── GearDisplay.ts
│   │   ├── GearXY.ts
│   │   ├── GearSize.ts
│   │   ├── GearLook.ts
│   │   └── GearColor.ts
│   │
│   ├── scroll/                  # 滚动系统
│   │   └── ScrollPane.ts
│   │
│   ├── package/                 # 包管理
│   │   ├── UIPackage.ts         # UI 包
│   │   ├── PackageItem.ts       # 包资源项
│   │   └── UIObjectFactory.ts   # 对象工厂
│   │
│   ├── utils/                   # 工具
│   │   ├── ByteBuffer.ts        # 二进制读取
│   │   ├── ToolSet.ts           # 工具函数
│   │   └── ColorUtils.ts        # 颜色工具
│   │
│   ├── events/                  # 事件系统
│   │   ├── EventDispatcher.ts   # 事件分发（替代 Laya.Event）
│   │   └── Events.ts            # 事件类型
│   │
│   ├── render/                  # 渲染桥接
│   │   ├── FGUIRenderData.ts    # 渲染数据结构
│   │   ├── FGUIRenderSystem.ts  # ECS 渲染系统
│   │   └── FGUIRenderCollector.ts
│   │
│   └── ecs/                     # ECS 集成
│       ├── FGUIComponent.ts     # FairyGUI 组件
│       ├── FGUISystem.ts        # 更新系统
│       └── FGUIRuntimeModule.ts # 运行时模块
```

## 2. 抽象层设计

### 2.1 替换 Laya.Sprite → DisplayObject

```typescript
/**
 * 抽象显示对象（替代 Laya.Sprite）
 * 不依赖任何渲染引擎，只维护变换和层级数据
 */
export abstract class DisplayObject {
    // 变换属性
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    scaleX: number = 1;
    scaleY: number = 1;
    rotation: number = 0;
    alpha: number = 1;
    visible: boolean = true;

    // 层级
    parent: DisplayObject | null = null;
    protected _children: DisplayObject[] = [];

    // 事件
    protected _eventDispatcher: EventDispatcher;

    // 渲染数据收集
    abstract collectRenderData(collector: IRenderCollector): void;
}
```

### 2.2 替换 Laya.Event → EventDispatcher

```typescript
export class EventDispatcher {
    private _listeners: Map<string, Set<EventListener>> = new Map();

    on(type: string, listener: Function, thisArg?: any): void;
    off(type: string, listener: Function, thisArg?: any): void;
    emit(type: string, data?: any): void;
    once(type: string, listener: Function, thisArg?: any): void;
}
```

### 2.3 替换 Laya.stage → Stage

```typescript
export class Stage {
    private static _inst: Stage;

    width: number;
    height: number;
    mouseX: number = 0;
    mouseY: number = 0;

    // 输入事件
    readonly onMouseDown: EventDispatcher;
    readonly onMouseUp: EventDispatcher;
    readonly onMouseMove: EventDispatcher;
    readonly onResize: EventDispatcher;

    static get inst(): Stage;

    // 绑定到 HTMLCanvasElement
    bindToCanvas(canvas: HTMLCanvasElement): void;
}
```

### 2.4 替换 Laya.timer → Timer

```typescript
export class Timer {
    private static _inst: Timer;

    delta: number = 0;      // 上一帧耗时（毫秒）
    currentTime: number;    // 当前时间

    static get inst(): Timer;

    // 帧循环
    frameLoop(interval: number, caller: any, callback: Function): void;

    // 延迟调用
    callLater(caller: any, callback: Function): void;

    // 定时器
    once(delay: number, caller: any, callback: Function): void;
    loop(delay: number, caller: any, callback: Function): void;

    // 清除
    clear(caller: any, callback: Function): void;

    // 每帧更新（由 ECS 系统调用）
    update(dt: number): void;
}
```

### 2.5 替换 Laya.Point/Rectangle → Math Types

```typescript
// 使用现有的 @esengine/ecs-framework-math
import { Vec2, Rect } from '@esengine/ecs-framework-math';

// 或创建简单类型
export interface IPoint {
    x: number;
    y: number;
}

export interface IRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

## 3. ECS 集成设计

### 3.1 FGUIComponent

```typescript
/**
 * FairyGUI 组件 - 挂载在 Entity 上
 * 包装一个 GObject 或 GComponent
 */
@ECSComponent('FGUI')
export class FGUIComponent extends Component {
    // 关联的 GObject
    gObject: GObject | null = null;

    // 包 URL (用于反序列化)
    packageUrl: string = '';
    componentName: string = '';

    // 是否是根节点
    isRoot: boolean = false;
}
```

### 3.2 FGUISystem

```typescript
/**
 * FairyGUI 更新系统
 * 负责更新 GObject 树和收集渲染数据
 */
@ECSSystem('FGUI', { updateOrder: 50 })
export class FGUISystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(FGUIComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // 1. 更新 Timer
        Timer.inst.update(Time.deltaTime);

        // 2. 更新 GRoot
        GRoot.inst.update();

        // 3. 收集渲染数据
        this.collectRenderData();
    }
}
```

### 3.3 渲染数据结构

```typescript
export interface FGUIRenderPrimitive {
    type: 'rect' | 'image' | 'text' | 'mesh';

    // 变换
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    alpha: number;

    // 裁剪
    clipRect?: IRectangle;

    // 图像
    textureId?: number;
    uvRect?: IRectangle;
    color?: number;

    // 九宫格
    scale9Grid?: IRectangle;

    // 文本
    text?: string;
    font?: string;
    fontSize?: number;
    textColor?: number;

    // 排序
    sortOrder: number;
}
```

## 4. 实现计划

### Phase 1: 基础架构 ✅ 已完成
1. ✅ 抽象层（DisplayObject, EventDispatcher, Timer, Stage）
2. ✅ 工具类（ByteBuffer, MathTypes）
3. ✅ 事件系统（Events, FGUIEvents）

### Phase 2: 核心类 ✅ 已完成
1. ✅ GObject 基类
2. ✅ Relations 布局系统
3. ✅ GComponent 容器
4. ✅ GRoot 根容器
5. ✅ GGroup 组容器
6. ✅ Controller 控制器
7. ✅ Transition 过渡动画
8. ✅ GearBase 齿轮基类
9. ✅ ScrollPane 滚动面板

### Phase 3: 控件 🚧 进行中
1. GImage, GTextField
2. GButton, GSlider, GProgressBar
3. GList, GComboBox

### Phase 4: 包加载 🚧 基础已完成
1. ✅ UIPackage 基础结构
2. ✅ PackageItem 资源项
3. ✅ ByteBuffer 二进制解析
4. UIObjectFactory 对象工厂

### Phase 5: 渲染集成
1. FGUIRenderSystem
2. 与 WebGPU 渲染器对接
3. IRenderCollector 实现

## 5. 与现有系统的差异

| 特性 | 旧 UI 系统 | 新 FairyGUI 集成 |
|------|-----------|-----------------|
| 布局 | 锚点 + sizeDelta | Relations 约束 |
| 控件 | 手写组件 | FairyGUI Editor 设计 |
| 动效 | 无 | Transition 系统 |
| 状态 | 手动管理 | Controller + Gear |
| 列表 | 无虚拟列表 | GList 虚拟列表 |
| 文本 | Canvas 绘制 | 同样，但更完善 |

## 6. 迁移策略

1. 新建 `packages/fairygui` 包
2. 保留旧 `packages/ui` 直到新系统稳定
3. 逐步迁移编辑器 UI 使用新系统
4. 最终删除旧系统
