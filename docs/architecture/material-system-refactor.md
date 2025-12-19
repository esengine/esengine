# ESEngine 材质系统统一架构重构方案

## 问题概述

当前 UI 和 Scene (Sprite) 两套渲染系统存在大量代码重复：

| 重复项 | Sprite | UI | 重复度 |
|--------|--------|----|----|
| 材质属性覆盖接口 | `MaterialPropertyOverride` | `UIMaterialPropertyOverride` | 100% |
| 材质方法 (12个) | `SpriteComponent` | `UIRenderComponent` | 100% |
| ShinyEffect 组件 | `ShinyEffectComponent` | `UIShinyEffectComponent` | 99% |
| ShinyEffect 系统 | `ShinyEffectSystem` | `UIShinyEffectSystem` | 98% |

**根本原因**：缺乏统一的材质覆盖接口抽象层。

---

## 一、统一材质覆盖接口

### 1.1 定义通用接口

在 `@esengine/material-system` 包中定义统一接口：

```typescript
// packages/material-system/src/interfaces/IMaterialOverridable.ts

/**
 * Material property override definition.
 * 材质属性覆盖定义。
 */
export interface MaterialPropertyOverride {
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'int';
    value: number | number[];
}

export type MaterialOverrides = Record<string, MaterialPropertyOverride>;

/**
 * Interface for components that support material property overrides.
 * 支持材质属性覆盖的组件接口。
 */
export interface IMaterialOverridable {
    /** Material GUID for asset reference | 材质资产引用的 GUID */
    materialGuid: string;

    /** Current material overrides | 当前材质覆盖 */
    readonly materialOverrides: MaterialOverrides;

    /** Get current material ID | 获取当前材质 ID */
    getMaterialId(): number;

    /** Set material ID | 设置材质 ID */
    setMaterialId(id: number): void;

    // Uniform setters
    setOverrideFloat(name: string, value: number): this;
    setOverrideVec2(name: string, x: number, y: number): this;
    setOverrideVec3(name: string, x: number, y: number, z: number): this;
    setOverrideVec4(name: string, x: number, y: number, z: number, w: number): this;
    setOverrideColor(name: string, r: number, g: number, b: number, a?: number): this;
    setOverrideInt(name: string, value: number): this;

    // Uniform getters
    getOverride(name: string): MaterialPropertyOverride | undefined;
    removeOverride(name: string): this;
    clearOverrides(): this;
    hasOverrides(): boolean;
}
```

### 1.2 创建 Mixin 实现

使用 Mixin 模式避免代码重复：

```typescript
// packages/material-system/src/mixins/MaterialOverridableMixin.ts

import type { MaterialPropertyOverride, MaterialOverrides } from '../interfaces/IMaterialOverridable';

/**
 * Mixin that provides material override functionality.
 * 提供材质覆盖功能的 Mixin。
 */
export function MaterialOverridableMixin<TBase extends new (...args: any[]) => {}>(Base: TBase) {
    return class extends Base {
        materialGuid: string = '';
        private _materialId: number = 0;
        private _materialOverrides: MaterialOverrides = {};

        get materialOverrides(): MaterialOverrides {
            return this._materialOverrides;
        }

        getMaterialId(): number {
            return this._materialId;
        }

        setMaterialId(id: number): void {
            this._materialId = id;
        }

        setOverrideFloat(name: string, value: number): this {
            this._materialOverrides[name] = { type: 'float', value };
            return this;
        }

        setOverrideVec2(name: string, x: number, y: number): this {
            this._materialOverrides[name] = { type: 'vec2', value: [x, y] };
            return this;
        }

        setOverrideVec3(name: string, x: number, y: number, z: number): this {
            this._materialOverrides[name] = { type: 'vec3', value: [x, y, z] };
            return this;
        }

        setOverrideVec4(name: string, x: number, y: number, z: number, w: number): this {
            this._materialOverrides[name] = { type: 'vec4', value: [x, y, z, w] };
            return this;
        }

        setOverrideColor(name: string, r: number, g: number, b: number, a: number = 1.0): this {
            this._materialOverrides[name] = { type: 'color', value: [r, g, b, a] };
            return this;
        }

        setOverrideInt(name: string, value: number): this {
            this._materialOverrides[name] = { type: 'int', value: Math.floor(value) };
            return this;
        }

        getOverride(name: string): MaterialPropertyOverride | undefined {
            return this._materialOverrides[name];
        }

        removeOverride(name: string): this {
            delete this._materialOverrides[name];
            return this;
        }

        clearOverrides(): this {
            this._materialOverrides = {};
            return this;
        }

        hasOverrides(): boolean {
            return Object.keys(this._materialOverrides).length > 0;
        }
    };
}
```

---

## 二、Shader Property 元数据系统

### 2.1 定义属性元数据接口

```typescript
// packages/material-system/src/interfaces/IShaderProperty.ts

/**
 * Shader property UI metadata.
 * 着色器属性 UI 元数据。
 */
export interface ShaderPropertyMeta {
    /** Property type | 属性类型 */
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'int' | 'texture';

    /** Display label (supports i18n key) | 显示标签（支持 i18n 键） */
    label: string;

    /** Property group for organization | 属性分组 */
    group?: string;

    /** Default value | 默认值 */
    default?: number | number[] | string;

    // Numeric constraints
    min?: number;
    max?: number;
    step?: number;

    /** UI hints | UI 提示 */
    hint?: 'range' | 'angle' | 'hdr' | 'normal';

    /** Tooltip description | 工具提示描述 */
    tooltip?: string;

    /** Whether to hide in inspector | 是否在检查器中隐藏 */
    hidden?: boolean;
}

/**
 * Extended shader definition with property metadata.
 * 带属性元数据的扩展着色器定义。
 */
export interface ShaderAssetDefinition {
    /** Shader name | 着色器名称 */
    name: string;

    /** Display name for UI | UI 显示名称 */
    displayName?: string;

    /** Shader description | 着色器描述 */
    description?: string;

    /** Vertex shader source (inline or path) | 顶点着色器源（内联或路径）*/
    vertexSource: string;

    /** Fragment shader source (inline or path) | 片段着色器源（内联或路径）*/
    fragmentSource: string;

    /** Property metadata for inspector | 检查器属性元数据 */
    properties?: Record<string, ShaderPropertyMeta>;

    /** Render queue / order | 渲染队列/顺序 */
    renderQueue?: number;

    /** Preset blend mode | 预设混合模式 */
    blendMode?: 'alpha' | 'additive' | 'multiply' | 'opaque';
}
```

### 2.2 .shader 资产文件格式

```json
{
  "$schema": "esengine://schemas/shader.json",
  "version": 1,
  "name": "Shiny",
  "displayName": "闪光效果 | Shiny Effect",
  "description": "扫光高亮动画着色器 | Sweeping highlight animation shader",

  "vertexSource": "./shaders/sprite.vert",
  "fragmentSource": "./shaders/shiny.frag",

  "blendMode": "alpha",
  "renderQueue": 2000,

  "properties": {
    "u_shinyProgress": {
      "type": "float",
      "label": "进度 | Progress",
      "group": "Animation",
      "default": 0,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "hidden": true
    },
    "u_shinyWidth": {
      "type": "float",
      "label": "宽度 | Width",
      "group": "Effect",
      "default": 0.25,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "tooltip": "闪光带宽度 | Width of the shiny band"
    },
    "u_shinyRotation": {
      "type": "float",
      "label": "角度 | Rotation",
      "group": "Effect",
      "default": 2.25,
      "min": 0,
      "max": 6.28,
      "step": 0.01,
      "hint": "angle"
    },
    "u_shinySoftness": {
      "type": "float",
      "label": "柔和度 | Softness",
      "group": "Effect",
      "default": 1.0,
      "min": 0,
      "max": 1,
      "step": 0.01
    },
    "u_shinyBrightness": {
      "type": "float",
      "label": "亮度 | Brightness",
      "group": "Effect",
      "default": 1.0,
      "min": 0,
      "max": 2,
      "step": 0.01
    },
    "u_shinyGloss": {
      "type": "float",
      "label": "光泽度 | Gloss",
      "group": "Effect",
      "default": 1.0,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "tooltip": "0=白色高光, 1=带颜色 | 0=white shine, 1=color-tinted"
    }
  }
}
```

---

## 三、统一效果组件/系统架构

### 3.1 抽取通用 ShinyEffect 基类

```typescript
// packages/material-system/src/effects/BaseShinyEffect.ts

import { Component, Property, Serializable, Serialize } from '@esengine/ecs-framework';

/**
 * Base shiny effect configuration (shared between UI and Sprite).
 * 基础闪光效果配置（UI 和 Sprite 共享）。
 */
export abstract class BaseShinyEffect extends Component {
    // ============= Effect Parameters =============
    @Serialize()
    @Property({ type: 'number', label: 'Width', min: 0, max: 1, step: 0.01 })
    public width: number = 0.25;

    @Serialize()
    @Property({ type: 'number', label: 'Rotation', min: 0, max: 360, step: 1 })
    public rotation: number = 129;

    @Serialize()
    @Property({ type: 'number', label: 'Softness', min: 0, max: 1, step: 0.01 })
    public softness: number = 1.0;

    @Serialize()
    @Property({ type: 'number', label: 'Brightness', min: 0, max: 2, step: 0.01 })
    public brightness: number = 1.0;

    @Serialize()
    @Property({ type: 'number', label: 'Gloss', min: 0, max: 2, step: 0.01 })
    public gloss: number = 1.0;

    // ============= Animation Settings =============
    @Serialize()
    @Property({ type: 'boolean', label: 'Play' })
    public play: boolean = true;

    @Serialize()
    @Property({ type: 'boolean', label: 'Loop' })
    public loop: boolean = true;

    @Serialize()
    @Property({ type: 'number', label: 'Duration', min: 0.1, step: 0.1 })
    public duration: number = 2.0;

    @Serialize()
    @Property({ type: 'number', label: 'Loop Delay', min: 0, step: 0.1 })
    public loopDelay: number = 2.0;

    @Serialize()
    @Property({ type: 'number', label: 'Initial Delay', min: 0, step: 0.1 })
    public initialDelay: number = 0;

    // ============= Runtime State =============
    public progress: number = 0;
    public elapsedTime: number = 0;
    public inDelay: boolean = false;
    public delayRemaining: number = 0;
    public initialDelayProcessed: boolean = false;

    reset(): void {
        this.progress = 0;
        this.elapsedTime = 0;
        this.inDelay = false;
        this.delayRemaining = 0;
        this.initialDelayProcessed = false;
    }

    start(): void {
        this.reset();
        this.play = true;
    }

    stop(): void {
        this.play = false;
    }

    getRotationRadians(): number {
        return this.rotation * Math.PI / 180;
    }
}
```

### 3.2 通用动画更新逻辑

```typescript
// packages/material-system/src/effects/ShinyEffectAnimator.ts

import type { BaseShinyEffect } from './BaseShinyEffect';
import type { IMaterialOverridable } from '../interfaces/IMaterialOverridable';
import { BuiltInShaders } from '../types';

/**
 * Shared animator logic for shiny effect.
 * 闪光效果共享的动画逻辑。
 */
export class ShinyEffectAnimator {
    /**
     * Update animation state.
     * 更新动画状态。
     */
    static updateAnimation(shiny: BaseShinyEffect, deltaTime: number): void {
        if (!shiny.initialDelayProcessed && shiny.initialDelay > 0) {
            shiny.delayRemaining = shiny.initialDelay;
            shiny.inDelay = true;
            shiny.initialDelayProcessed = true;
        }

        if (shiny.inDelay) {
            shiny.delayRemaining -= deltaTime;
            if (shiny.delayRemaining <= 0) {
                shiny.inDelay = false;
                shiny.elapsedTime = 0;
            }
            return;
        }

        shiny.elapsedTime += deltaTime;
        shiny.progress = Math.min(shiny.elapsedTime / shiny.duration, 1.0);

        if (shiny.progress >= 1.0) {
            if (shiny.loop) {
                shiny.inDelay = true;
                shiny.delayRemaining = shiny.loopDelay;
                shiny.progress = 0;
                shiny.elapsedTime = 0;
            } else {
                shiny.play = false;
                shiny.progress = 1.0;
            }
        }
    }

    /**
     * Apply material overrides.
     * 应用材质覆盖。
     */
    static applyMaterialOverrides(shiny: BaseShinyEffect, target: IMaterialOverridable): void {
        if (target.getMaterialId() === 0) {
            target.setMaterialId(BuiltInShaders.Shiny);
        }

        target.setOverrideFloat('u_shinyProgress', shiny.progress);
        target.setOverrideFloat('u_shinyWidth', shiny.width);
        target.setOverrideFloat('u_shinyRotation', shiny.getRotationRadians());
        target.setOverrideFloat('u_shinySoftness', shiny.softness);
        target.setOverrideFloat('u_shinyBrightness', shiny.brightness);
        target.setOverrideFloat('u_shinyGloss', shiny.gloss);
    }
}
```

---

## 四、Material Inspector 设计

### 4.1 组件架构

```
MaterialPropertiesEditor (容器组件)
├── ShaderSelector (着色器选择器)
├── PropertyGroup (属性分组)
│   ├── FloatProperty (浮点属性)
│   ├── VectorProperty (向量属性)
│   ├── ColorProperty (颜色属性)
│   └── TextureProperty (纹理属性)
└── OverrideIndicator (覆盖指示器)
```

### 4.2 核心组件

```typescript
// packages/editor-app/src/components/inspectors/material/MaterialPropertiesEditor.tsx

interface MaterialPropertiesEditorProps {
    /** Target component implementing IMaterialOverridable */
    target: IMaterialOverridable;
    /** Current shader definition with property metadata */
    shaderDef?: ShaderAssetDefinition;
    /** Callback when property changes */
    onChange?: (name: string, value: MaterialPropertyOverride) => void;
}

export const MaterialPropertiesEditor: React.FC<MaterialPropertiesEditorProps> = ({
    target,
    shaderDef,
    onChange
}) => {
    // Group properties by their group field
    const groupedProps = useMemo(() => {
        if (!shaderDef?.properties) return {};

        const groups: Record<string, Array<[string, ShaderPropertyMeta]>> = {};
        for (const [name, meta] of Object.entries(shaderDef.properties)) {
            if (meta.hidden) continue;
            const group = meta.group || 'Default';
            if (!groups[group]) groups[group] = [];
            groups[group].push([name, meta]);
        }
        return groups;
    }, [shaderDef]);

    return (
        <div className="material-properties-editor">
            <ShaderSelector
                currentShaderId={target.getMaterialId()}
                onSelect={(id) => target.setMaterialId(id)}
            />

            {Object.entries(groupedProps).map(([group, props]) => (
                <PropertyGroup key={group} title={group}>
                    {props.map(([name, meta]) => (
                        <PropertyField
                            key={name}
                            name={name}
                            meta={meta}
                            value={target.getOverride(name)?.value ?? meta.default}
                            onChange={(value) => {
                                applyOverride(target, name, meta.type, value);
                                onChange?.(name, target.getOverride(name)!);
                            }}
                        />
                    ))}
                </PropertyGroup>
            ))}
        </div>
    );
};
```

---

## 五、实施计划

### Phase 1: 接口层 (1-2 天)

1. **创建 IMaterialOverridable 接口** (`packages/material-system/src/interfaces/`)
2. **创建 MaterialOverridableMixin** (`packages/material-system/src/mixins/`)
3. **导出新接口** (`packages/material-system/src/index.ts`)

### Phase 2: 重构现有组件 (2-3 天)

1. **修改 SpriteComponent**：实现 `IMaterialOverridable`，使用 Mixin
2. **修改 UIRenderComponent**：实现 `IMaterialOverridable`，使用 Mixin
3. **删除重复代码**：移除各组件中的重复材质方法

### Phase 3: 统一效果系统 (2-3 天)

1. **创建 BaseShinyEffect** (`packages/material-system/src/effects/`)
2. **创建 ShinyEffectAnimator** (`packages/material-system/src/effects/`)
3. **重构 ShinyEffectComponent**：继承 BaseShinyEffect
4. **重构 UIShinyEffectComponent**：继承 BaseShinyEffect
5. **重构系统**：使用 ShinyEffectAnimator

### Phase 4: Shader Property 系统 (2-3 天)

1. **定义 ShaderPropertyMeta 接口**
2. **扩展 ShaderDefinition** 添加 properties 字段
3. **创建 ShaderLoader** 支持 .shader 文件
4. **注册内置着色器属性元数据**

### Phase 5: Material Inspector (3-4 天)

1. **创建 MaterialPropertiesEditor 组件**
2. **创建 PropertyField 组件** (Float, Vector, Color, Texture)
3. **集成到现有 Inspector 系统**
4. **支持实时预览**

---

## 六、文件修改清单

| 优先级 | 包 | 文件 | 操作 |
|--------|-----|------|------|
| P0 | material-system | `src/interfaces/IMaterialOverridable.ts` | 新建 |
| P0 | material-system | `src/mixins/MaterialOverridableMixin.ts` | 新建 |
| P0 | material-system | `src/interfaces/IShaderProperty.ts` | 新建 |
| P1 | material-system | `src/effects/BaseShinyEffect.ts` | 新建 |
| P1 | material-system | `src/effects/ShinyEffectAnimator.ts` | 新建 |
| P1 | sprite | `src/SpriteComponent.ts` | 重构 |
| P1 | ui | `src/components/UIRenderComponent.ts` | 重构 |
| P2 | sprite | `src/ShinyEffectComponent.ts` | 重构 |
| P2 | ui | `src/components/UIShinyEffectComponent.ts` | 重构 |
| P2 | sprite | `src/systems/ShinyEffectSystem.ts` | 重构 |
| P2 | ui | `src/systems/render/UIShinyEffectSystem.ts` | 重构 |
| P3 | material-system | `src/loaders/ShaderLoader.ts` | 扩展 |
| P3 | editor-app | `src/components/inspectors/material/*` | 新建 |

---

## 七、Transform 组件统一（可选）

### 7.1 现状分析

| 特性 | TransformComponent | UITransformComponent |
|------|-------------------|---------------------|
| **坐标系** | 绝对坐标 (position.x/y/z) | 相对锚点坐标 (x/y + anchor) |
| **尺寸** | ❌ 无 | ✅ width/height + 约束 |
| **锚点系统** | ❌ 无 | ✅ anchorMin/Max |
| **3D 支持** | ✅ IVector3 | ❌ 纯 2D |
| **可见性** | ❌ 无 | ✅ visible, alpha |

### 7.2 结论

**不建议完全合并**，但可提取公共基类：

```typescript
// packages/engine-core/src/interfaces/ITransformBase.ts

export interface ITransformBase {
    /** 旋转角度（度） | Rotation in degrees */
    rotation: number;

    /** X 缩放 | Scale X */
    scaleX: number;

    /** Y 缩放 | Scale Y */
    scaleY: number;

    /** 本地到世界矩阵 | Local to world matrix */
    readonly localToWorldMatrix: Matrix2D;

    /** 是否需要更新 | Dirty flag */
    isDirty: boolean;

    /** 世界坐标 X | World position X */
    readonly worldX: number;

    /** 世界坐标 Y | World position Y */
    readonly worldY: number;

    /** 世界旋转 | World rotation */
    readonly worldRotation: number;

    /** 世界缩放 X | World scale X */
    readonly worldScaleX: number;

    /** 世界缩放 Y | World scale Y */
    readonly worldScaleY: number;
}
```

### 7.3 收益

- 渲染系统可以统一处理 `ITransformBase`
- 减少 SpriteRenderSystem 和 UIRenderSystem 的重复
- Gizmo 系统可以共享变换操作逻辑

---

## 八、向后兼容性

1. **接口兼容**：现有组件的 API 保持不变
2. **序列化兼容**：不改变现有序列化格式
3. **渐进迁移**：可分阶段进行，不影响现有功能
