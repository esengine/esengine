/* tslint:disable */
/* eslint-disable */
/**
 * Initialize panic hook for better error messages in console.
 * 初始化panic hook以在控制台显示更好的错误信息。
 */
export function init(): void;
/**
 * Game engine main interface exposed to JavaScript.
 * 暴露给JavaScript的游戏引擎主接口。
 *
 * This is the primary entry point for the engine from TypeScript/JavaScript.
 * 这是从TypeScript/JavaScript访问引擎的主要入口点。
 */
export class GameEngine {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get camera state.
   * 获取相机状态。
   *
   * # Returns | 返回
   * Array of [x, y, zoom, rotation] | 数组 [x, y, zoom, rotation]
   */
  getCamera(): Float32Array;
  /**
   * Check if a shader exists.
   * 检查着色器是否存在。
   */
  hasShader(shader_id: number): boolean;
  /**
   * Set camera position, zoom, and rotation.
   * 设置相机位置、缩放和旋转。
   *
   * # Arguments | 参数
   * * `x` - Camera X position | 相机X位置
   * * `y` - Camera Y position | 相机Y位置
   * * `zoom` - Zoom level | 缩放级别
   * * `rotation` - Rotation in radians | 旋转角度（弧度）
   */
  setCamera(x: number, y: number, zoom: number, rotation: number): void;
  /**
   * Check if a key is currently pressed.
   * 检查某个键是否当前被按下。
   *
   * # Arguments | 参数
   * * `key_code` - The key code to check | 要检查的键码
   */
  isKeyDown(key_code: string): boolean;
  /**
   * Check if a material exists.
   * 检查材质是否存在。
   */
  hasMaterial(material_id: number): boolean;
  /**
   * Load a texture from URL.
   * 从URL加载纹理。
   *
   * # Arguments | 参数
   * * `id` - Unique texture identifier | 唯一纹理标识符
   * * `url` - Image URL to load | 要加载的图片URL
   */
  loadTexture(id: number, url: string): void;
  /**
   * Update input state. Should be called once per frame.
   * 更新输入状态。应该每帧调用一次。
   */
  updateInput(): void;
  /**
   * Create a new game engine from external WebGL context.
   * 从外部 WebGL 上下文创建引擎。
   *
   * This is designed for WeChat MiniGame and similar environments.
   * 适用于微信小游戏等环境。
   */
  static fromExternal(gl_context: any, width: number, height: number): GameEngine;
  /**
   * Remove a shader.
   * 移除着色器。
   */
  removeShader(shader_id: number): boolean;
  /**
   * Set grid visibility.
   * 设置网格可见性。
   */
  setShowGrid(show: boolean): void;
  /**
   * Add a line gizmo.
   * 添加线条Gizmo。
   */
  addGizmoLine(points: Float32Array, r: number, g: number, b: number, a: number, closed: boolean): void;
  /**
   * Add a rectangle gizmo outline.
   * 添加矩形Gizmo边框。
   *
   * # Arguments | 参数
   * * `x` - Center X position | 中心X位置
   * * `y` - Center Y position | 中心Y位置
   * * `width` - Rectangle width | 矩形宽度
   * * `height` - Rectangle height | 矩形高度
   * * `rotation` - Rotation in radians | 旋转角度（弧度）
   * * `origin_x` - Origin X (0-1) | 原点X (0-1)
   * * `origin_y` - Origin Y (0-1) | 原点Y (0-1)
   * * `r`, `g`, `b`, `a` - Color (0.0-1.0) | 颜色
   * * `show_handles` - Whether to show transform handles | 是否显示变换手柄
   */
  addGizmoRect(x: number, y: number, width: number, height: number, rotation: number, origin_x: number, origin_y: number, r: number, g: number, b: number, a: number, show_handles: boolean): void;
  /**
   * Compile and register a custom shader.
   * 编译并注册自定义着色器。
   *
   * # Arguments | 参数
   * * `vertex_source` - Vertex shader GLSL source | 顶点着色器GLSL源代码
   * * `fragment_source` - Fragment shader GLSL source | 片段着色器GLSL源代码
   *
   * # Returns | 返回
   * The shader ID for referencing this shader | 用于引用此着色器的ID
   */
  compileShader(vertex_source: string, fragment_source: string): number;
  /**
   * Get editor mode.
   * 获取编辑器模式。
   */
  isEditorMode(): boolean;
  /**
   * Render sprites as overlay (without clearing screen).
   * 渲染精灵作为叠加层（不清除屏幕）。
   *
   * This is used for UI rendering on top of the world content.
   * 用于在世界内容上渲染 UI。
   */
  renderOverlay(): void;
  /**
   * Create and register a new material.
   * 创建并注册新材质。
   *
   * # Arguments | 参数
   * * `name` - Material name for debugging | 材质名称（用于调试）
   * * `shader_id` - Shader ID to use | 使用的着色器ID
   * * `blend_mode` - Blend mode: 0=None, 1=Alpha, 2=Additive, 3=Multiply, 4=Screen, 5=PremultipliedAlpha
   *
   * # Returns | 返回
   * The material ID for referencing this material | 用于引用此材质的ID
   */
  createMaterial(name: string, shader_id: number, blend_mode: number): number;
  /**
   * Remove a material.
   * 移除材质。
   */
  removeMaterial(material_id: number): boolean;
  /**
   * Resize a specific viewport.
   * 调整特定视口大小。
   */
  resizeViewport(viewport_id: string, width: number, height: number): void;
  /**
   * Convert screen coordinates to world coordinates.
   * 将屏幕坐标转换为世界坐标。
   *
   * # Arguments | 参数
   * * `screen_x` - Screen X coordinate (0 = left edge of canvas)
   * * `screen_y` - Screen Y coordinate (0 = top edge of canvas)
   *
   * # Returns | 返回
   * Array of [world_x, world_y] | 数组 [world_x, world_y]
   */
  screenToWorld(screen_x: number, screen_y: number): Float32Array;
  /**
   * Set clear color (background color).
   * 设置清除颜色（背景颜色）。
   *
   * # Arguments | 参数
   * * `r`, `g`, `b`, `a` - Color components (0.0-1.0) | 颜色分量 (0.0-1.0)
   */
  setClearColor(r: number, g: number, b: number, a: number): void;
  /**
   * Set editor mode.
   * 设置编辑器模式。
   *
   * When false (runtime mode), editor-only UI like grid, gizmos,
   * and axis indicator are automatically hidden.
   * 当为 false（运行时模式）时，编辑器专用 UI（如网格、gizmos、坐标轴指示器）会自动隐藏。
   */
  setEditorMode(is_editor: boolean): void;
  /**
   * Set gizmo visibility.
   * 设置辅助工具可见性。
   */
  setShowGizmos(show: boolean): void;
  /**
   * Convert world coordinates to screen coordinates.
   * 将世界坐标转换为屏幕坐标。
   *
   * # Arguments | 参数
   * * `world_x` - World X coordinate
   * * `world_y` - World Y coordinate
   *
   * # Returns | 返回
   * Array of [screen_x, screen_y] | 数组 [screen_x, screen_y]
   */
  worldToScreen(world_x: number, world_y: number): Float32Array;
  /**
   * Add a circle gizmo outline.
   * 添加圆形Gizmo边框。
   */
  addGizmoCircle(x: number, y: number, radius: number, r: number, g: number, b: number, a: number): void;
  /**
   * Get the graphics backend name (e.g., "WebGL2").
   * 获取图形后端名称（如 "WebGL2"）。
   */
  getBackendName(): string;
  /**
   * Get all registered viewport IDs.
   * 获取所有已注册的视口ID。
   */
  getViewportIds(): string[];
  /**
   * 检查纹理是否已就绪
   * Check if texture is ready to use
   *
   * # Arguments | 参数
   * * `id` - Texture ID | 纹理ID
   */
  isTextureReady(id: number): boolean;
  /**
   * Set scissor rect for clipping (screen coordinates, Y-down).
   * 设置裁剪矩形（屏幕坐标，Y 轴向下）。
   *
   * Content outside this rect will be clipped.
   * 此矩形外的内容将被裁剪。
   *
   * # Arguments | 参数
   * * `x` - Left edge in screen coordinates | 屏幕坐标中的左边缘
   * * `y` - Top edge in screen coordinates (Y-down) | 屏幕坐标中的上边缘（Y 向下）
   * * `width` - Rect width | 矩形宽度
   * * `height` - Rect height | 矩形高度
   */
  setScissorRect(x: number, y: number, width: number, height: number): void;
  /**
   * Add a capsule gizmo outline.
   * 添加胶囊Gizmo边框。
   */
  addGizmoCapsule(x: number, y: number, radius: number, half_height: number, rotation: number, r: number, g: number, b: number, a: number): void;
  /**
   * 获取纹理加载状态
   * Get texture loading state
   *
   * # Arguments | 参数
   * * `id` - Texture ID | 纹理ID
   *
   * # Returns | 返回
   * State string: "loading", "ready", or "failed:reason"
   * 状态字符串："loading"、"ready" 或 "failed:原因"
   */
  getTextureState(id: number): string;
  /**
   * Register a new viewport.
   * 注册新视口。
   *
   * # Arguments | 参数
   * * `id` - Unique viewport identifier | 唯一视口标识符
   * * `canvas_id` - HTML canvas element ID | HTML canvas元素ID
   */
  registerViewport(id: string, canvas_id: string): void;
  /**
   * Set a material's vec2 uniform.
   * 设置材质的vec2 uniform。
   */
  setMaterialVec2(material_id: number, name: string, x: number, y: number): boolean;
  /**
   * Set a material's vec3 uniform.
   * 设置材质的vec3 uniform。
   */
  setMaterialVec3(material_id: number, name: string, x: number, y: number, z: number): boolean;
  /**
   * Set a material's vec4 uniform (also used for colors).
   * 设置材质的vec4 uniform（也用于颜色）。
   */
  setMaterialVec4(material_id: number, name: string, x: number, y: number, z: number, w: number): boolean;
  /**
   * Submit mesh batch for rendering arbitrary 2D geometry.
   * 提交网格批次进行任意 2D 几何体渲染。
   *
   * Used for rendering ellipses, polygons, and other complex shapes.
   * 用于渲染椭圆、多边形和其他复杂形状。
   *
   * # Arguments | 参数
   * * `positions` - Float32Array [x, y, ...] for each vertex
   * * `uvs` - Float32Array [u, v, ...] for each vertex
   * * `colors` - Uint32Array of packed RGBA colors (one per vertex)
   * * `indices` - Uint16Array of triangle indices
   * * `texture_id` - Texture ID to use (0 for white pixel)
   */
  submitMeshBatch(positions: Float32Array, uvs: Float32Array, colors: Uint32Array, indices: Uint16Array, texture_id: number): void;
  /**
   * Submit MSDF text batch for rendering.
   * 提交 MSDF 文本批次进行渲染。
   *
   * # Arguments | 参数
   * * `positions` - Float32Array [x, y, ...] for each vertex (4 per glyph)
   * * `tex_coords` - Float32Array [u, v, ...] for each vertex
   * * `colors` - Float32Array [r, g, b, a, ...] for each vertex
   * * `outline_colors` - Float32Array [r, g, b, a, ...] for each vertex
   * * `outline_widths` - Float32Array [width, ...] for each vertex
   * * `texture_id` - Font atlas texture ID
   * * `px_range` - Pixel range for MSDF shader
   */
  submitTextBatch(positions: Float32Array, tex_coords: Float32Array, colors: Float32Array, outline_colors: Float32Array, outline_widths: Float32Array, texture_id: number, px_range: number): void;
  /**
   * Clear all textures and reset state.
   * 清除所有纹理并重置状态。
   *
   * This removes all loaded textures from GPU memory and resets
   * the ID counter. Use with caution as all texture references
   * will become invalid.
   * 这会从GPU内存中移除所有已加载的纹理并重置ID计数器。
   * 请谨慎使用，因为所有纹理引用都将变得无效。
   */
  clearAllTextures(): void;
  /**
   * Clear scissor rect (disable clipping).
   * 清除裁剪矩形（禁用裁剪）。
   */
  clearScissorRect(): void;
  /**
   * Render to a specific viewport.
   * 渲染到特定视口。
   */
  renderToViewport(viewport_id: string): void;
  /**
   * Set a material's color uniform (RGBA, 0.0-1.0).
   * 设置材质的颜色uniform（RGBA，0.0-1.0）。
   */
  setMaterialColor(material_id: number, name: string, r: number, g: number, b: number, a: number): boolean;
  /**
   * Set a material's float uniform.
   * 设置材质的浮点uniform。
   */
  setMaterialFloat(material_id: number, name: string, value: number): boolean;
  /**
   * Set transform tool mode.
   * 设置变换工具模式。
   *
   * # Arguments | 参数
   * * `mode` - 0=Select, 1=Move, 2=Rotate, 3=Scale
   */
  setTransformMode(mode: number): void;
  /**
   * Get the graphics backend version string.
   * 获取图形后端版本字符串。
   */
  getBackendVersion(): string;
  /**
   * Get or load texture by path.
   * 按路径获取或加载纹理。
   *
   * # Arguments | 参数
   * * `path` - Image path/URL | 图片路径/URL
   */
  getOrLoadTextureByPath(path: string): number;
  /**
   * Get camera for a specific viewport.
   * 获取特定视口的相机。
   */
  getViewportCamera(viewport_id: string): Float32Array | undefined;
  /**
   * Set the active viewport.
   * 设置活动视口。
   */
  setActiveViewport(id: string): boolean;
  /**
   * Set camera for a specific viewport.
   * 为特定视口设置相机。
   */
  setViewportCamera(viewport_id: string, x: number, y: number, zoom: number, rotation: number): void;
  /**
   * Set viewport configuration.
   * 设置视口配置。
   */
  setViewportConfig(viewport_id: string, show_grid: boolean, show_gizmos: boolean): void;
  /**
   * Submit sprite batch data for rendering.
   * 提交精灵批次数据进行渲染。
   *
   * # Arguments | 参数
   * * `transforms` - Float32Array [x, y, rotation, scaleX, scaleY, originX, originY] per sprite
   *                  每个精灵的变换数据
   * * `texture_ids` - Uint32Array of texture IDs | 纹理ID数组
   * * `uvs` - Float32Array [u0, v0, u1, v1] per sprite | 每个精灵的UV坐标
   * * `colors` - Uint32Array of packed RGBA colors | 打包的RGBA颜色数组
   * * `material_ids` - Uint32Array of material IDs (0 = default) | 材质ID数组（0 = 默认）
   */
  submitSpriteBatch(transforms: Float32Array, texture_ids: Uint32Array, uvs: Float32Array, colors: Uint32Array, material_ids: Uint32Array): void;
  /**
   * Unregister a viewport.
   * 注销视口。
   */
  unregisterViewport(id: string): void;
  /**
   * Create a blank texture for dynamic atlas.
   * 为动态图集创建空白纹理。
   *
   * This creates a texture that can be filled later using `updateTextureRegion`.
   * Used for runtime atlas generation to batch UI elements with different textures.
   * 创建一个可以稍后使用 `updateTextureRegion` 填充的纹理。
   * 用于运行时图集生成，以批处理使用不同纹理的 UI 元素。
   *
   * # Arguments | 参数
   * * `width` - Texture width in pixels (recommended: 2048) | 纹理宽度（推荐：2048）
   * * `height` - Texture height in pixels (recommended: 2048) | 纹理高度（推荐：2048）
   *
   * # Returns | 返回
   * The texture ID for the created blank texture | 创建的空白纹理ID
   */
  createBlankTexture(width: number, height: number): number;
  /**
   * Get maximum texture size supported by the backend.
   * 获取后端支持的最大纹理尺寸。
   */
  getMaxTextureSize(): number;
  /**
   * Load texture by path, returning texture ID.
   * 按路径加载纹理，返回纹理ID。
   *
   * # Arguments | 参数
   * * `path` - Image path/URL to load | 要加载的图片路径/URL
   */
  loadTextureByPath(path: string): number;
  /**
   * Update a region of an existing texture with pixel data.
   * 使用像素数据更新现有纹理的区域。
   *
   * This is used for dynamic atlas to copy individual textures into the atlas.
   * 用于动态图集将单个纹理复制到图集纹理中。
   *
   * # Arguments | 参数
   * * `id` - The texture ID to update | 要更新的纹理ID
   * * `x` - X offset in the texture | 纹理中的X偏移
   * * `y` - Y offset in the texture | 纹理中的Y偏移
   * * `width` - Width of the region to update | 要更新的区域宽度
   * * `height` - Height of the region to update | 要更新的区域高度
   * * `pixels` - RGBA pixel data (Uint8Array, 4 bytes per pixel) | RGBA像素数据（每像素4字节）
   */
  updateTextureRegion(id: number, x: number, y: number, width: number, height: number, pixels: Uint8Array): void;
  /**
   * Compile a shader with a specific ID.
   * 使用特定ID编译着色器。
   */
  compileShaderWithId(shader_id: number, vertex_source: string, fragment_source: string): void;
  /**
   * Get texture ID by path.
   * 按路径获取纹理ID。
   *
   * # Arguments | 参数
   * * `path` - Image path to lookup | 要查找的图片路径
   */
  getTextureIdByPath(path: string): number | undefined;
  /**
   * Create a material with a specific ID.
   * 使用特定ID创建材质。
   */
  createMaterialWithId(material_id: number, name: string, shader_id: number, blend_mode: number): void;
  /**
   * Set a material's blend mode.
   * 设置材质的混合模式。
   *
   * # Arguments | 参数
   * * `blend_mode` - 0=None, 1=Alpha, 2=Additive, 3=Multiply, 4=Screen, 5=PremultipliedAlpha
   */
  setMaterialBlendMode(material_id: number, blend_mode: number): boolean;
  /**
   * Clear the texture path cache.
   * 清除纹理路径缓存。
   *
   * This should be called when restoring scene snapshots to ensure
   * textures are reloaded with correct IDs.
   * 在恢复场景快照时应调用此方法，以确保纹理使用正确的ID重新加载。
   */
  clearTexturePathCache(): void;
  /**
   * Get texture size by path.
   * 按路径获取纹理尺寸。
   *
   * Returns an array [width, height] or null if not found.
   * 返回数组 [width, height]，如果未找到则返回 null。
   *
   * # Arguments | 参数
   * * `path` - Image path to lookup | 要查找的图片路径
   */
  getTextureSizeByPath(path: string): Float32Array | undefined;
  /**
   * 获取正在加载中的纹理数量
   * Get the number of textures currently loading
   */
  getTextureLoadingCount(): number;
  /**
   * Create a new game engine instance.
   * 创建新的游戏引擎实例。
   *
   * # Arguments | 参数
   * * `canvas_id` - The HTML canvas element ID | HTML canvas元素ID
   *
   * # Returns | 返回
   * A new GameEngine instance or an error | 新的GameEngine实例或错误
   */
  constructor(canvas_id: string);
  /**
   * Clear the screen with specified color.
   * 使用指定颜色清除屏幕。
   *
   * # Arguments | 参数
   * * `r` - Red component (0.0-1.0) | 红色分量
   * * `g` - Green component (0.0-1.0) | 绿色分量
   * * `b` - Blue component (0.0-1.0) | 蓝色分量
   * * `a` - Alpha component (0.0-1.0) | 透明度分量
   */
  clear(r: number, g: number, b: number, a: number): void;
  /**
   * Render the current frame.
   * 渲染当前帧。
   */
  render(): void;
  /**
   * Resize viewport.
   * 调整视口大小。
   *
   * # Arguments | 参数
   * * `width` - New viewport width | 新视口宽度
   * * `height` - New viewport height | 新视口高度
   */
  resize(width: number, height: number): void;
  /**
   * Get canvas width.
   * 获取画布宽度。
   */
  readonly width: number;
  /**
   * Get canvas height.
   * 获取画布高度。
   */
  readonly height: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gameengine_free: (a: number, b: number) => void;
  readonly gameengine_addGizmoCapsule: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly gameengine_addGizmoCircle: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
  readonly gameengine_addGizmoLine: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
  readonly gameengine_addGizmoRect: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => void;
  readonly gameengine_clear: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly gameengine_clearAllTextures: (a: number) => void;
  readonly gameengine_clearScissorRect: (a: number) => void;
  readonly gameengine_clearTexturePathCache: (a: number) => void;
  readonly gameengine_compileShader: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly gameengine_compileShaderWithId: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly gameengine_createBlankTexture: (a: number, b: number, c: number) => [number, number, number];
  readonly gameengine_createMaterial: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly gameengine_createMaterialWithId: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly gameengine_fromExternal: (a: any, b: number, c: number) => [number, number, number];
  readonly gameengine_getBackendName: (a: number) => [number, number];
  readonly gameengine_getBackendVersion: (a: number) => [number, number];
  readonly gameengine_getCamera: (a: number) => [number, number];
  readonly gameengine_getMaxTextureSize: (a: number) => number;
  readonly gameengine_getOrLoadTextureByPath: (a: number, b: number, c: number) => [number, number, number];
  readonly gameengine_getTextureIdByPath: (a: number, b: number, c: number) => number;
  readonly gameengine_getTextureLoadingCount: (a: number) => number;
  readonly gameengine_getTextureSizeByPath: (a: number, b: number, c: number) => any;
  readonly gameengine_getTextureState: (a: number, b: number) => [number, number];
  readonly gameengine_getViewportCamera: (a: number, b: number, c: number) => [number, number];
  readonly gameengine_getViewportIds: (a: number) => [number, number];
  readonly gameengine_hasMaterial: (a: number, b: number) => number;
  readonly gameengine_hasShader: (a: number, b: number) => number;
  readonly gameengine_height: (a: number) => number;
  readonly gameengine_isEditorMode: (a: number) => number;
  readonly gameengine_isKeyDown: (a: number, b: number, c: number) => number;
  readonly gameengine_isTextureReady: (a: number, b: number) => number;
  readonly gameengine_loadTexture: (a: number, b: number, c: number, d: number) => [number, number];
  readonly gameengine_loadTextureByPath: (a: number, b: number, c: number) => [number, number, number];
  readonly gameengine_new: (a: number, b: number) => [number, number, number];
  readonly gameengine_registerViewport: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly gameengine_removeMaterial: (a: number, b: number) => number;
  readonly gameengine_removeShader: (a: number, b: number) => number;
  readonly gameengine_render: (a: number) => [number, number];
  readonly gameengine_renderOverlay: (a: number) => [number, number];
  readonly gameengine_renderToViewport: (a: number, b: number, c: number) => [number, number];
  readonly gameengine_resize: (a: number, b: number, c: number) => void;
  readonly gameengine_resizeViewport: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly gameengine_screenToWorld: (a: number, b: number, c: number) => [number, number];
  readonly gameengine_setActiveViewport: (a: number, b: number, c: number) => number;
  readonly gameengine_setCamera: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly gameengine_setClearColor: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly gameengine_setEditorMode: (a: number, b: number) => void;
  readonly gameengine_setMaterialBlendMode: (a: number, b: number, c: number) => number;
  readonly gameengine_setMaterialColor: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly gameengine_setMaterialFloat: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly gameengine_setMaterialVec2: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly gameengine_setMaterialVec3: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly gameengine_setMaterialVec4: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly gameengine_setScissorRect: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly gameengine_setShowGizmos: (a: number, b: number) => void;
  readonly gameengine_setShowGrid: (a: number, b: number) => void;
  readonly gameengine_setTransformMode: (a: number, b: number) => void;
  readonly gameengine_setViewportCamera: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly gameengine_setViewportConfig: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly gameengine_submitMeshBatch: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
  readonly gameengine_submitSpriteBatch: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number];
  readonly gameengine_submitTextBatch: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number];
  readonly gameengine_unregisterViewport: (a: number, b: number, c: number) => void;
  readonly gameengine_updateInput: (a: number) => void;
  readonly gameengine_updateTextureRegion: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
  readonly gameengine_width: (a: number) => number;
  readonly gameengine_worldToScreen: (a: number, b: number, c: number) => [number, number];
  readonly init: () => void;
  readonly wasm_bindgen__convert__closures_____invoke__h0cae3d4947da04cb: (a: number, b: number) => void;
  readonly wasm_bindgen__closure__destroy__h0c01365f59f73f28: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
