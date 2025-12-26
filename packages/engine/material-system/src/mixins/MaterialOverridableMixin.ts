/**
 * Material overridable mixin for ES Engine.
 * ES引擎材质覆盖 Mixin。
 *
 * This mixin provides material override functionality that can be mixed into
 * any component class (SpriteComponent, UIRenderComponent, etc.).
 * 此 Mixin 提供材质覆盖功能，可混入任何组件类。
 *
 * @packageDocumentation
 */

import type {
    MaterialPropertyOverride,
    MaterialOverrides,
    IMaterialOverridable
} from '../interfaces/IMaterialOverridable';

/**
 * Constructor type for mixin base class.
 * Mixin 基类的构造函数类型。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Mixin that provides material override functionality.
 * 提供材质覆盖功能的 Mixin。
 *
 * This mixin adds all material override methods to a base class,
 * implementing the IMaterialOverridable interface.
 * 此 Mixin 将所有材质覆盖方法添加到基类，实现 IMaterialOverridable 接口。
 *
 * @example
 * ```typescript
 * // Apply mixin to a component class
 * class MySpriteComponent extends MaterialOverridableMixin(Component) {
 *     // ... other properties
 * }
 *
 * // The class now has all material override methods
 * const sprite = new MySpriteComponent();
 * sprite.setMaterialId(BuiltInShaders.Shiny);
 * sprite.setOverrideFloat('u_shinyProgress', 0.5);
 * ```
 *
 * @param Base - Base class to extend
 * @returns Class with material override functionality
 */
export function MaterialOverridableMixin<TBase extends Constructor>(Base: TBase) {
    return class MaterialOverridableClass extends Base implements IMaterialOverridable {
        /**
         * Material GUID for asset reference.
         * 材质资产引用的 GUID。
         */
        materialGuid: string = '';

        /**
         * Current material ID.
         * 当前材质 ID。
         * @internal - Use getMaterialId() and setMaterialId() instead
         */
        __materialId: number = 0;

        /**
         * Material property overrides.
         * 材质属性覆盖。
         * @internal - Use materialOverrides getter instead
         */
        __materialOverrides: MaterialOverrides = {};

        /**
         * Get current material overrides.
         * 获取当前材质覆盖。
         */
        get materialOverrides(): MaterialOverrides {
            return this.__materialOverrides;
        }

        /**
         * Get current material ID.
         * 获取当前材质 ID。
         */
        getMaterialId(): number {
            return this.__materialId;
        }

        /**
         * Set material ID.
         * 设置材质 ID。
         */
        setMaterialId(id: number): void {
            this.__materialId = id;
        }

        /**
         * Set a float uniform override.
         * 设置浮点 uniform 覆盖。
         */
        setOverrideFloat(name: string, value: number): this {
            this.__materialOverrides[name] = { type: 'float', value };
            return this;
        }

        /**
         * Set a vec2 uniform override.
         * 设置 vec2 uniform 覆盖。
         */
        setOverrideVec2(name: string, x: number, y: number): this {
            this.__materialOverrides[name] = { type: 'vec2', value: [x, y] };
            return this;
        }

        /**
         * Set a vec3 uniform override.
         * 设置 vec3 uniform 覆盖。
         */
        setOverrideVec3(name: string, x: number, y: number, z: number): this {
            this.__materialOverrides[name] = { type: 'vec3', value: [x, y, z] };
            return this;
        }

        /**
         * Set a vec4 uniform override.
         * 设置 vec4 uniform 覆盖。
         */
        setOverrideVec4(name: string, x: number, y: number, z: number, w: number): this {
            this.__materialOverrides[name] = { type: 'vec4', value: [x, y, z, w] };
            return this;
        }

        /**
         * Set a color uniform override (RGBA, 0.0-1.0).
         * 设置颜色 uniform 覆盖（RGBA，0.0-1.0）。
         */
        setOverrideColor(name: string, r: number, g: number, b: number, a: number = 1.0): this {
            this.__materialOverrides[name] = { type: 'color', value: [r, g, b, a] };
            return this;
        }

        /**
         * Set an integer uniform override.
         * 设置整数 uniform 覆盖。
         */
        setOverrideInt(name: string, value: number): this {
            this.__materialOverrides[name] = { type: 'int', value: Math.floor(value) };
            return this;
        }

        /**
         * Get a specific override value.
         * 获取特定覆盖值。
         */
        getOverride(name: string): MaterialPropertyOverride | undefined {
            return this.__materialOverrides[name];
        }

        /**
         * Remove a specific override.
         * 移除特定覆盖。
         */
        removeOverride(name: string): this {
            delete this.__materialOverrides[name];
            return this;
        }

        /**
         * Clear all overrides.
         * 清除所有覆盖。
         */
        clearOverrides(): this {
            this.__materialOverrides = {};
            return this;
        }

        /**
         * Check if any overrides are set.
         * 检查是否设置了任何覆盖。
         */
        hasOverrides(): boolean {
            return Object.keys(this.__materialOverrides).length > 0;
        }
    };
}

/**
 * Helper class that can be used for composition instead of mixin.
 * 可用于组合而非 Mixin 的辅助类。
 *
 * Use this when you cannot use mixins (e.g., class already extends another class).
 * 当无法使用 Mixin 时使用此类（例如，类已继承其他类）。
 *
 * @example
 * ```typescript
 * class MyComponent extends Component {
 *     private _materialHelper = new MaterialOverrideHelper();
 *
 *     get materialOverrides() { return this._materialHelper.materialOverrides; }
 *     getMaterialId() { return this._materialHelper.getMaterialId(); }
 *     setMaterialId(id: number) { this._materialHelper.setMaterialId(id); }
 *     // ... delegate other methods
 * }
 * ```
 */
export class MaterialOverrideHelper implements IMaterialOverridable {
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
}
