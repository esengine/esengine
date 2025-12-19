/**
 * Material override interfaces for ES Engine.
 * ES引擎材质覆盖接口。
 *
 * This module provides a unified interface for components that support
 * material property overrides (SpriteComponent, UIRenderComponent, etc.).
 * 此模块为支持材质属性覆盖的组件提供统一接口。
 *
 * @packageDocumentation
 */

/**
 * Material property override value types.
 * 材质属性覆盖值类型。
 */
export type MaterialPropertyType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'int';

/**
 * Material property override definition.
 * 材质属性覆盖定义。
 */
export interface MaterialPropertyOverride {
    /** Property type | 属性类型 */
    type: MaterialPropertyType;

    /** Property value | 属性值 */
    value: number | number[];
}

/**
 * Material overrides record type.
 * 材质覆盖记录类型。
 */
export type MaterialOverrides = Record<string, MaterialPropertyOverride>;

/**
 * Interface for components that support material property overrides.
 * 支持材质属性覆盖的组件接口。
 *
 * Both SpriteComponent and UIRenderComponent implement this interface,
 * allowing unified handling by material systems and inspectors.
 * SpriteComponent 和 UIRenderComponent 都实现此接口，
 * 允许材质系统和检查器统一处理。
 *
 * @example
 * ```typescript
 * function applyShinyEffect(target: IMaterialOverridable, progress: number): void {
 *     target.setMaterialId(BuiltInShaders.Shiny);
 *     target.setOverrideFloat('u_shinyProgress', progress);
 * }
 *
 * // Works with both SpriteComponent and UIRenderComponent
 * applyShinyEffect(spriteComponent, 0.5);
 * applyShinyEffect(uiRenderComponent, 0.5);
 * ```
 */
export interface IMaterialOverridable {
    /**
     * Material GUID for asset reference.
     * 材质资产引用的 GUID。
     */
    materialGuid: string;

    /**
     * Current material overrides (read-only access).
     * 当前材质覆盖（只读访问）。
     */
    readonly materialOverrides: MaterialOverrides;

    /**
     * Get current material ID.
     * 获取当前材质 ID。
     */
    getMaterialId(): number;

    /**
     * Set material ID.
     * 设置材质 ID。
     *
     * @param id - Material/Shader ID from BuiltInShaders or custom shader
     *             来自 BuiltInShaders 或自定义着色器的材质/着色器 ID
     */
    setMaterialId(id: number): void;

    /**
     * Set a float uniform override.
     * 设置浮点 uniform 覆盖。
     *
     * @param name - Uniform name (e.g., 'u_shinyProgress')
     * @param value - Float value
     */
    setOverrideFloat(name: string, value: number): this;

    /**
     * Set a vec2 uniform override.
     * 设置 vec2 uniform 覆盖。
     *
     * @param name - Uniform name
     * @param x - X component
     * @param y - Y component
     */
    setOverrideVec2(name: string, x: number, y: number): this;

    /**
     * Set a vec3 uniform override.
     * 设置 vec3 uniform 覆盖。
     *
     * @param name - Uniform name
     * @param x - X component
     * @param y - Y component
     * @param z - Z component
     */
    setOverrideVec3(name: string, x: number, y: number, z: number): this;

    /**
     * Set a vec4 uniform override.
     * 设置 vec4 uniform 覆盖。
     *
     * @param name - Uniform name
     * @param x - X component
     * @param y - Y component
     * @param z - Z component
     * @param w - W component
     */
    setOverrideVec4(name: string, x: number, y: number, z: number, w: number): this;

    /**
     * Set a color uniform override (RGBA, 0.0-1.0).
     * 设置颜色 uniform 覆盖（RGBA，0.0-1.0）。
     *
     * @param name - Uniform name
     * @param r - Red component (0-1)
     * @param g - Green component (0-1)
     * @param b - Blue component (0-1)
     * @param a - Alpha component (0-1), defaults to 1.0
     */
    setOverrideColor(name: string, r: number, g: number, b: number, a?: number): this;

    /**
     * Set an integer uniform override.
     * 设置整数 uniform 覆盖。
     *
     * @param name - Uniform name
     * @param value - Integer value
     */
    setOverrideInt(name: string, value: number): this;

    /**
     * Get a specific override value.
     * 获取特定覆盖值。
     *
     * @param name - Uniform name
     * @returns Override value or undefined if not set
     */
    getOverride(name: string): MaterialPropertyOverride | undefined;

    /**
     * Remove a specific override.
     * 移除特定覆盖。
     *
     * @param name - Uniform name to remove
     */
    removeOverride(name: string): this;

    /**
     * Clear all overrides.
     * 清除所有覆盖。
     */
    clearOverrides(): this;

    /**
     * Check if any overrides are set.
     * 检查是否设置了任何覆盖。
     */
    hasOverrides(): boolean;
}
