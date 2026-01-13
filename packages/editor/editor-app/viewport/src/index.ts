/**
 * @zh Viewport 入口 - CCESEngine WebView viewport
 * @en Viewport entry - CCESEngine WebView viewport
 */

import { rpc } from './rpc';
import { sceneService } from './services';
import { getCameraController, type CameraController } from './CameraController';
import { effectService } from './EffectService';
import { cocosCliClient, type MaterialConfig, type BuiltinResources } from './cces-cli';
import {
  getCC,
  type CC,
  type Scene,
  type Camera,
  type GeometryRenderer,
  type Vec3,
  type RenderCamera,
  type CompiledEffectData,
  type EffectAsset,
} from './types';

let cc: CC;
let scene: Scene | null = null;
let camera: Camera | null = null;
let cameraController: CameraController | null = null;
let isInitialized = false;

// Reusable vectors for grid drawing
let gridVec0: Vec3;
let gridVec1: Vec3;
let gridVecsInitialized = false;

// ============================================================================
// Effect Registration
// ============================================================================

/**
 * @zh 从 cces-cli 加载内置资源
 * @en Load builtin resources from cces-cli
 */
async function loadBuiltinResourcesFromCli(): Promise<BuiltinResources | null> {
  const config = cocosCliClient.getConfig();
  if (!config) {
    console.log('[Viewport] cces-cli not initialized, using fallback');
    return null;
  }

  try {
    console.log('[Viewport] Loading builtin resources from cces-cli...');
    const response = await cocosCliClient.engine.getBuiltinResources();

    if (response.code !== 0 || !response.data) {
      console.warn('[Viewport] Failed to get builtin resources:', response.reason);
      return null;
    }

    console.log('[Viewport] Got builtin resources from cces-cli:',
      Object.keys(response.data.chunks).length, 'chunks,',
      Object.keys(response.data.effects).length, 'effects,',
      response.data.materialConfigs.length, 'material configs'
    );

    return response.data;
  } catch (e) {
    console.warn('[Viewport] Error loading builtin resources from cces-cli:', e);
    return null;
  }
}

/**
 * @zh 创建内置 UI 材质
 * @en Create builtin UI materials
 */
function createBuiltinMaterials(materialConfigs: MaterialConfig[]): void {
  const builtinResMgr = cc.builtinResMgr;
  if (!builtinResMgr) {
    console.warn('[Viewport] builtinResMgr not available');
    return;
  }

  console.log('[Viewport] Creating builtin materials...');

  for (const config of materialConfigs) {
    try {
      // Check if material already exists
      const existing = builtinResMgr.get(config.name);
      if (existing) {
        console.log(`[Viewport] Material already exists: ${config.name}`);
        continue;
      }

      // Create the material
      const material = new cc.Material();
      material.initialize({
        effectName: config.effectName,
        defines: config.defines || {},
      });

      // Register with builtinResMgr
      // Use internal method to add asset
      const addAsset = (builtinResMgr as unknown as { _addAsset?: (name: string, asset: unknown) => void })._addAsset;
      if (addAsset) {
        addAsset.call(builtinResMgr, config.name, material);
        console.log(`[Viewport] Created builtin material: ${config.name}`);
      } else {
        // Fallback: try to access internal assets map
        const assets = (builtinResMgr as unknown as { _resources?: Map<string, unknown> })._resources;
        if (assets && assets instanceof Map) {
          assets.set(config.name, material);
          console.log(`[Viewport] Created builtin material (fallback): ${config.name}`);
        } else {
          console.warn(`[Viewport] Cannot register material: ${config.name}`);
        }
      }
    } catch (e) {
      console.error(`[Viewport] Failed to create material ${config.name}:`, e);
    }
  }

  console.log('[Viewport] Builtin materials created');
}

/**
 * @zh 注册内置 effects 到 ccesengine
 * @en Register builtin effects to ccesengine
 *
 * @zh 优先从 cces-cli 获取内置资源，回退到 window 全局变量
 * @en Prioritize getting builtin resources from cces-cli, fallback to window globals
 */
async function registerBuiltinEffects(): Promise<void> {
  effectService.init();

  // Try to load from cces-cli first
  const cliResources = await loadBuiltinResourcesFromCli();

  if (cliResources) {
    // Use resources from cces-cli
    console.log('[Viewport] Registering chunks from cces-cli...');
    effectService.registerChunks(cliResources.chunks);
    console.log('[Viewport] Chunks registered');

    console.log('[Viewport] Compiling effects from cces-cli...');
    for (const [name, content] of Object.entries(cliResources.effects)) {
      console.log(`[Viewport] Compiling effect: ${name}`);
      try {
        const result = effectService.compileAndRegister(name, content);
        if (result) {
          console.log(`[Viewport] Effect compiled successfully: ${name}`);
        } else {
          console.error(`[Viewport] Effect compilation returned null: ${name}`);
        }
      } catch (e) {
        console.error(`[Viewport] Effect compilation error for ${name}:`, e);
      }
    }

    // Create builtin materials
    if (cliResources.materialConfigs.length > 0) {
      createBuiltinMaterials(cliResources.materialConfigs);
    }

    return;
  }

  // Fallback to window globals
  console.log('[Viewport] Using fallback: window globals');

  // Register pre-compiled effects if available
  const builtinEffects = window.__BUILTIN_EFFECTS__;
  if (builtinEffects && builtinEffects.length > 0) {
    for (const effectData of builtinEffects) {
      const effect = new cc.EffectAsset();

      effect.name = effectData.name;
      effect.techniques = effectData.techniques;
      effect.shaders = effectData.shaders;
      effect.combinations = effectData.combinations ?? [];
      effect.hideInEditor = effectData.hideInEditor ?? false;

      effect.onLoaded();
    }
  }

  // Register chunks if available (for dynamic compilation)
  const builtinChunks = window.__BUILTIN_CHUNKS__;
  if (builtinChunks) {
    console.log('[Viewport] Registering chunks...');
    effectService.registerChunks(builtinChunks);
    console.log('[Viewport] Chunks registered');
  }

  // Compile raw effects if available (new mode)
  const rawEffects = window.__RAW_EFFECTS__;
  if (rawEffects) {
    console.log('[Viewport] Compiling effects...');
    for (const [name, content] of Object.entries(rawEffects)) {
      console.log(`[Viewport] Compiling effect: ${name}`);
      try {
        const result = effectService.compileAndRegister(name, content);
        if (result) {
          console.log(`[Viewport] Effect compiled successfully: ${name}`);
        } else {
          console.error(`[Viewport] Effect compilation returned null: ${name}`);
        }
      } catch (e) {
        console.error(`[Viewport] Effect compilation error for ${name}:`, e);
      }
    }
  }
}

// ============================================================================
// Engine Initialization
// ============================================================================

/**
 * @zh 初始化引擎
 * @en Initialize engine
 */
async function initEngine(): Promise<void> {
  cc = getCC();
  if (!cc) {
    throw new Error('CCESEngine not loaded');
  }

  // Setup delegate promises BEFORE calling init
  const baseInitPromise = new Promise<void>((resolve) => {
    cc.game.onPostBaseInitDelegate.add(() => resolve());
  });

  const subsystemInitPromise = new Promise<void>((resolve) => {
    cc.game.onPostSubsystemInitDelegate.add(() => resolve());
  });

  // Initialize game
  await cc.game.init({ debugMode: 1 });

  // Wait for delegates
  await baseInitPromise;
  await subsystemInitPromise;

  // Register builtin effects before starting the game loop
  await registerBuiltinEffects();

  // Start game loop
  cc.game.run();

  // Create initial scene
  await createInitialScene();

  // Initialize services
  sceneService.init();

  isInitialized = true;

  // Setup ResizeObserver to handle container size changes
  setupResizeObserver();

  // Notify egui that viewport is ready
  rpc.notify('viewport.ready', undefined);
}

/**
 * @zh 创建初始场景
 * @en Create initial scene
 */
async function createInitialScene(): Promise<void> {
  scene = new cc.Scene('EditorScene');

  // Create editor camera
  const cameraNode = new cc.Node('EditorCamera');
  camera = cameraNode.addComponent(cc.Camera);
  camera.projection = cc.Camera.ProjectionType.PERSPECTIVE;
  camera.clearFlags = cc.Camera.ClearFlag.SOLID_COLOR;
  camera.clearColor = cc.color(45, 45, 45, 255);
  camera.near = 0.1;
  camera.far = 10000;
  camera.fov = 45;
  cameraNode.setPosition(5, 5, 10);
  cameraNode.lookAt(cc.v3(0, 0, 0));
  scene.addChild(cameraNode);

  // Run scene
  cc.director.runSceneImmediate(scene);

  // Initialize camera controller
  const canvas = cc.game.canvas;
  if (canvas && camera) {
    cameraController = getCameraController();
    cameraController.init(camera, canvas);
  }

  // Initialize geometry renderer for grid
  await initGeometryRenderer();
  startGridRendering();
}

// ============================================================================
// Grid Rendering
// ============================================================================

/**
 * @zh 初始化几何渲染器
 * @en Initialize geometry renderer
 */
async function initGeometryRenderer(): Promise<void> {
  const root = cc.director.root;
  const pipelineSceneData = root?.pipeline?.pipelineSceneData;

  if (pipelineSceneData?.initGeometryRendererMaterials) {
    pipelineSceneData.initGeometryRendererMaterials();
  }

  const internalCamera = camera?.camera as RenderCamera | undefined;
  if (internalCamera?.initGeometryRenderer) {
    internalCamera.initGeometryRenderer();
  }

  // Wait for geometry renderer initialization
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (camera?.camera?.geometryRenderer) break;
  }
}

/**
 * @zh 获取几何渲染器
 * @en Get geometry renderer
 */
function getGeometryRenderer(): GeometryRenderer | null {
  if (!camera) return null;
  const renderCamera = camera.camera;
  if (!renderCamera) return null;

  if (renderCamera.geometryRenderer) {
    return renderCamera.geometryRenderer;
  }

  renderCamera.initGeometryRenderer();
  return renderCamera.geometryRenderer;
}

// Reusable color objects for grid drawing
let gridColor: InstanceType<typeof cc.Color>;
let gridColorFaded: InstanceType<typeof cc.Color>;
let axisColorX: InstanceType<typeof cc.Color>;
let axisColorY: InstanceType<typeof cc.Color>;
let axisColorZ: InstanceType<typeof cc.Color>;
let gridColorsInitialized = false;

/**
 * @zh 计算网格参数基于相机距离 - 返回两个层级用于平滑过渡
 * @en Calculate grid parameters based on camera distance - returns two levels for smooth transition
 */
function calculateGridParams(): {
  baseSpacing: number;
  fadeRatio: number;
  extent: number;
} {
  if (!camera) return { baseSpacing: 1, fadeRatio: 0, extent: 100 };

  const cameraPos = camera.node.position;
  const cameraHeight = Math.abs(cameraPos.y);
  const cameraDistance = Math.sqrt(cameraPos.x ** 2 + cameraPos.y ** 2 + cameraPos.z ** 2);

  // Use the larger of height or distance for grid scaling
  const referenceDistance = Math.max(cameraHeight, cameraDistance * 0.5, 1);

  // Calculate grid level with fractional part for smooth transition
  const logDistance = Math.log10(referenceDistance);
  const spacingPower = Math.floor(logDistance);
  const baseSpacing = Math.pow(10, spacingPower);

  // fadeRatio: 0 = fully show fine grid, 1 = fully show coarse grid
  const fadeRatio = logDistance - spacingPower;

  // Grid extent scales with camera distance
  const extent = referenceDistance * 20;

  return { baseSpacing, fadeRatio, extent };
}

/**
 * @zh 绘制单层网格
 * @en Draw single grid layer
 */
function drawGridLayer(
  geometryRenderer: GeometryRenderer,
  spacing: number,
  extent: number,
  alpha: number
): void {
  if (alpha < 0.05) return; // Skip nearly invisible layers

  const gridLines = Math.ceil(extent / spacing);
  const baseAlpha = Math.floor(alpha * 255);

  // Create color with adjusted alpha
  const lineColor = new cc.Color(80, 80, 80, baseAlpha);

  for (let i = -gridLines; i <= gridLines; i++) {
    const pos = i * spacing;
    if (i === 0) continue;

    // X-parallel lines (along Z axis)
    gridVec0.set(pos, 0, -extent);
    gridVec1.set(pos, 0, extent);
    geometryRenderer.addLine(gridVec0, gridVec1, lineColor);

    // Z-parallel lines (along X axis)
    gridVec0.set(-extent, 0, pos);
    gridVec1.set(extent, 0, pos);
    geometryRenderer.addLine(gridVec0, gridVec1, lineColor);
  }
}

let gizmoCenter: Vec3;
let gizmoMatX: InstanceType<typeof cc.Mat4>;
let gizmoMatY: InstanceType<typeof cc.Mat4>;
let gizmoMatZ: InstanceType<typeof cc.Mat4>;
let gizmoColorX: InstanceType<typeof cc.Color>;
let gizmoColorY: InstanceType<typeof cc.Color>;
let gizmoColorZ: InstanceType<typeof cc.Color>;
let gizmoInitialized = false;

/**
 * @zh 绘制坐标轴指示器（右上角）
 * @en Draw axis indicator (top-right corner)
 */
function drawAxisIndicator(geometryRenderer: GeometryRenderer): void {
  if (!camera) return;

  if (!gizmoInitialized) {
    gizmoCenter = new cc.Vec3();
    gizmoMatX = new cc.Mat4();
    gizmoMatY = new cc.Mat4();
    gizmoMatZ = new cc.Mat4();
    gizmoColorX = new cc.Color(220, 60, 60, 255);
    gizmoColorY = new cc.Color(60, 180, 60, 255);
    gizmoColorZ = new cc.Color(60, 120, 220, 255);
    gizmoInitialized = true;
  }

  const node = camera.node;
  const cameraPos = node.position;

  const fov = camera.fov * Math.PI / 180;
  const aspect = (cc.game.canvas?.width ?? 1) / (cc.game.canvas?.height ?? 1);
  const gizmoDistance = camera.near * 6;
  const axisLength = gizmoDistance * Math.tan(fov / 2) * 0.20;
  const shaftRadius = axisLength * 0.04;
  const shaftHeight = axisLength * 0.65;
  const coneRadius = axisLength * 0.10;
  const coneHeight = axisLength * 0.35;

  const forward = node.forward;
  const right = node.right;
  const up = node.up;

  const offsetRight = gizmoDistance * Math.tan(fov / 2 * aspect) * 0.78;
  const offsetUp = gizmoDistance * Math.tan(fov / 2) * 0.68;

  const cx = cameraPos.x + forward.x * gizmoDistance + right.x * offsetRight + up.x * offsetUp;
  const cy = cameraPos.y + forward.y * gizmoDistance + right.y * offsetRight + up.y * offsetUp;
  const cz = cameraPos.z + forward.z * gizmoDistance + right.z * offsetRight + up.z * offsetUp;

  cc.Mat4.fromZRotation(gizmoMatX, -Math.PI / 2);
  gizmoMatX.m12 = cx + shaftHeight / 2;
  gizmoMatX.m13 = cy;
  gizmoMatX.m14 = cz;
  gizmoCenter.set(0, 0, 0);
  geometryRenderer.addCylinder(gizmoCenter, shaftRadius, shaftHeight, gizmoColorX, 8, false, false, true, true, gizmoMatX);

  gizmoMatX.m12 = cx + shaftHeight + coneHeight / 2;
  geometryRenderer.addCone(gizmoCenter, coneRadius, coneHeight, gizmoColorX, 8, false, false, true, true, gizmoMatX);

  cc.Mat4.fromRotation(gizmoMatY, 0, cc.Vec3.UNIT_Y);
  gizmoMatY.m12 = cx;
  gizmoMatY.m13 = cy + shaftHeight / 2;
  gizmoMatY.m14 = cz;
  geometryRenderer.addCylinder(gizmoCenter, shaftRadius, shaftHeight, gizmoColorY, 8, false, false, true, true, gizmoMatY);

  gizmoMatY.m13 = cy + shaftHeight + coneHeight / 2;
  geometryRenderer.addCone(gizmoCenter, coneRadius, coneHeight, gizmoColorY, 8, false, false, true, true, gizmoMatY);

  cc.Mat4.fromXRotation(gizmoMatZ, Math.PI / 2);
  gizmoMatZ.m12 = cx;
  gizmoMatZ.m13 = cy;
  gizmoMatZ.m14 = cz + shaftHeight / 2;
  geometryRenderer.addCylinder(gizmoCenter, shaftRadius, shaftHeight, gizmoColorZ, 8, false, false, true, true, gizmoMatZ);

  gizmoMatZ.m14 = cz + shaftHeight + coneHeight / 2;
  geometryRenderer.addCone(gizmoCenter, coneRadius, coneHeight, gizmoColorZ, 8, false, false, true, true, gizmoMatZ);
}

/**
 * @zh 绘制编辑器网格 - 多层级平滑过渡
 * @en Draw editor grid - multi-level smooth transition
 */
function drawGrid(): void {
  const geometryRenderer = getGeometryRenderer();
  if (!geometryRenderer) return;

  geometryRenderer.reset();

  if (!gridVecsInitialized) {
    gridVec0 = new cc.Vec3();
    gridVec1 = new cc.Vec3();
    gridVecsInitialized = true;
  }

  if (!gridColorsInitialized) {
    gridColor = new cc.Color(100, 100, 100, 255);
    gridColorFaded = new cc.Color(60, 60, 60, 255);
    axisColorX = new cc.Color(255, 80, 80, 255);
    axisColorY = new cc.Color(80, 255, 80, 255);
    axisColorZ = new cc.Color(80, 80, 255, 255);
    gridColorsInitialized = true;
  }

  const { baseSpacing, fadeRatio, extent } = calculateGridParams();

  // Draw fine grid (fades out as we zoom out)
  const fineAlpha = 0.4 * (1 - fadeRatio);
  drawGridLayer(geometryRenderer, baseSpacing, extent, fineAlpha);

  // Draw main grid (always visible)
  const mainSpacing = baseSpacing * 10;
  const mainAlpha = 0.5;
  drawGridLayer(geometryRenderer, mainSpacing, extent, mainAlpha);

  // Draw coarse grid (fades in as we zoom out)
  const coarseSpacing = baseSpacing * 100;
  const coarseAlpha = 0.3 * fadeRatio;
  drawGridLayer(geometryRenderer, coarseSpacing, extent, coarseAlpha);

  // Draw axes - extend to full grid extent
  // X axis (red)
  gridVec0.set(-extent, 0, 0);
  gridVec1.set(extent, 0, 0);
  geometryRenderer.addLine(gridVec0, gridVec1, axisColorX);

  // Y axis (green)
  gridVec0.set(0, 0, 0);
  gridVec1.set(0, extent * 0.5, 0);
  geometryRenderer.addLine(gridVec0, gridVec1, axisColorY);

  // Z axis (blue)
  gridVec0.set(0, 0, -extent);
  gridVec1.set(0, 0, extent);
  geometryRenderer.addLine(gridVec0, gridVec1, axisColorZ);

  // Draw axis indicator in top-right corner
  drawAxisIndicator(geometryRenderer);
}

/**
 * @zh 启动网格渲染
 * @en Start grid rendering
 */
function startGridRendering(): void {
  cc.director.on(cc.Director.EVENT_BEFORE_DRAW, drawGrid);
}

// ============================================================================
// Scene Loading
// ============================================================================

/**
 * @zh 加载场景
 * @en Load scene
 */
async function loadScene(scenePath: string): Promise<boolean> {
  if (!isInitialized) {
    return false;
  }

  try {
    return new Promise((resolve) => {
      cc.assetManager.loadAny(
        { url: scenePath },
        (err: Error | null, sceneAsset: unknown) => {
          if (err) {
            rpc.notify('console.log', { level: 'error', message: `Failed to load scene: ${err.message}` });
            resolve(false);
            return;
          }

          const asset = sceneAsset as { scene?: Scene };
          const sceneToRun = asset.scene ?? sceneAsset as Scene;

          cc.director.runSceneImmediate(sceneToRun, undefined, () => {
            rpc.notify('scene.hierarchyChanged', undefined);
            resolve(true);
          });
        }
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    rpc.notify('console.log', { level: 'error', message });
    return false;
  }
}

// ============================================================================
// RPC Method Registration
// ============================================================================

// Register asset.loadScene method
rpc.registerMethod('asset.loadScene', async (params) => {
  return loadScene(params.path);
});

// Register editor.getState method
rpc.registerMethod('editor.getState', () => {
  return {
    isPlaying: false,
    isPaused: false,
    selectedNodeUuid: sceneService.getSelectedNodeUuid(),
    currentScenePath: null,
    activeTool: 'select',
  };
});

// Listen for notifications from egui
rpc.onNotification('scene.nodeSelected', (_params) => {
  // Handle selection from egui side
});

// ============================================================================
// Effect Compilation RPC Methods
// ============================================================================

// Register effect.registerChunk method
rpc.registerMethod('effect.registerChunk', (params: { name: string; content: string }) => {
  effectService.registerChunk(params.name, params.content);
  return true;
});

// Register effect.registerChunks method
rpc.registerMethod('effect.registerChunks', (params: { chunks: Record<string, string> }) => {
  effectService.registerChunks(params.chunks);
  return true;
});

// Register effect.compile method
rpc.registerMethod('effect.compile', (params: { name: string; content: string }) => {
  const result = effectService.compileAndRegister(params.name, params.content);
  return result !== null;
});

// Register effect.compileMultiple method
rpc.registerMethod('effect.compileMultiple', (params: { effects: Record<string, string> }) => {
  return effectService.compileAndRegisterEffects(params.effects);
});

// Register effect.getRegistered method
rpc.registerMethod('effect.getRegistered', () => {
  return effectService.getRegisteredEffectNames();
});

// ============================================================================
// cces-cli Integration RPC Methods
// ============================================================================

// Register cces-cli.init method - initialize cces-cli client
rpc.registerMethod('cces-cli.init', (params: { baseUrl: string; projectPath: string }) => {
  cocosCliClient.init(params.baseUrl, params.projectPath);
  return true;
});

// Register cces-cli.getConfig method
rpc.registerMethod('cces-cli.getConfig', () => {
  return cocosCliClient.getConfig();
});

// ============================================================================
// Window Events
// ============================================================================

let resizeObserver: ResizeObserver | null = null;

/**
 * @zh 处理容器尺寸变化
 * @en Handle container resize
 */
function handleResize(): void {
  const canvas = cc?.game?.canvas;
  if (!canvas) return;

  const container = canvas.parentElement;
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  if (width > 0 && height > 0) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
}

/**
 * @zh 设置 ResizeObserver 监听容器尺寸变化
 * @en Setup ResizeObserver to watch container size changes
 */
function setupResizeObserver(): void {
  const canvas = cc?.game?.canvas;
  if (!canvas) return;

  const container = canvas.parentElement;
  if (!container) return;

  // Initial resize
  handleResize();

  // Watch for container size changes
  resizeObserver = new ResizeObserver(() => {
    handleResize();
  });
  resizeObserver.observe(container);
}

window.addEventListener('load', async () => {
  try {
    await initEngine();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    rpc.notify('console.log', { level: 'error', message: `Init failed: ${message}` });
  }
});

// ============================================================================
// Debug API
// ============================================================================

declare global {
  interface Window {
    viewport: typeof viewportAPI;
    handleIPCCommand: (commandJson: string) => void;
  }
}

const viewportAPI = {
  loadScene,
  handleResize,
  get cc() { return cc; },
  get scene() { return cc?.director?.getScene(); },
  get camera() { return camera; },
  get cameraController() { return cameraController; },
  rpc,
  sceneService,
  effectService,
  cocosCliClient,
};

window.viewport = viewportAPI;

// ============================================================================
// Script Compilation
// ============================================================================

/**
 * @zh 编译并注册用户脚本（通过 cces-cli API）
 * @en Compile and register user scripts (via cces-cli API)
 */
async function compileAndRegisterScripts(): Promise<void> {
  const config = cocosCliClient.getConfig();
  if (!config) {
    console.log('[Scripts] cces-cli not initialized, skipping script compilation');
    return;
  }

  try {
    console.log('[Scripts] Compiling scripts via cces-cli...');

    // Call the scripting compile API
    const response = await cocosCliClient.scripting.compile('editor');

    if (response.code !== 0) {
      console.warn('[Scripts] Compilation request failed:', response.reason);
      return;
    }

    const result = response.data;
    if (!result || !result.success) {
      console.warn('[Scripts] Compilation failed:', result?.error);
      return;
    }

    // Execute the compiled code to register component classes
    if (result.code) {
      try {
        const scriptFn = new Function(result.code);
        scriptFn();
        console.log('[Scripts] Executed compiled code');
      } catch (e) {
        console.warn('[Scripts] Failed to execute compiled code:', e);
      }
    }

    // Additionally, manually register classes from scriptInfos
    // This ensures classes are registered even if the bundle execution failed
    if (result.scriptInfos && result.scriptInfos.length > 0) {
      for (const info of result.scriptInfos) {
        // Try to find the class in the global scope
        const className = info.name;
        const cid = info.cid;

        // Check if class already registered
        const existingClass = cc.js.getClassById(cid);
        if (existingClass) {
          console.log(`[Scripts] Class already registered: ${className} (${cid})`);
          continue;
        }

        // Try to find class in window using Reflect.get for type-safe dynamic access
        const globalClass = Reflect.get(window, className);
        if (typeof globalClass === 'function') {
          cc.js._setClassId(cid, globalClass);
          cc.js.setClassName(className, globalClass);
          console.log(`[Scripts] Registered class from global: ${className} (${cid})`);
        }
      }

      console.log('[Scripts] Registered', result.scriptInfos.length, 'script classes');
    }

  } catch (error) {
    console.warn('[Scripts] Failed to compile scripts:', error);
  }
}

// ============================================================================
// IPC Command Handler (from Rust egui editor)
// ============================================================================

interface IPCCommand {
  type: string;
  data: unknown;
}

interface LoadSceneData {
  path: string;
  content: string;
  libraryPath: string;
  assets: Record<string, unknown>;
  scriptsCode?: string;
  scriptsInfo?: [string, string][];
}

/**
 * @zh 处理来自 Rust egui 编辑器的 IPC 命令
 * @en Handle IPC commands from Rust egui editor
 */
window.handleIPCCommand = async (commandJson: string) => {
  try {
    const command = JSON.parse(commandJson) as IPCCommand;
    console.log('[IPC] Received command:', command.type);

    switch (command.type) {
      case 'loadScene': {
        const data = command.data as LoadSceneData;
        await handleLoadSceneCommand(data);
        break;
      }
      default:
        console.warn('[IPC] Unknown command type:', command.type);
    }
  } catch (error) {
    console.error('[IPC] Failed to handle command:', error);
  }
};

/**
 * @zh 处理加载场景命令
 * @en Handle load scene command
 */
async function handleLoadSceneCommand(data: LoadSceneData): Promise<void> {
  if (!cc) {
    console.error('[IPC] Engine not initialized');
    return;
  }

  try {
    console.log('[IPC] Loading scene:', data.path);

    // Step 1: Compile and register user scripts via cces-cli API
    await compileAndRegisterScripts();

    // Step 2: Deserialize and cache dependency assets
    const assetCount = data.assets ? Object.keys(data.assets).length : 0;
    if (assetCount > 0) {
      console.log('[IPC] Loading', assetCount, 'dependency assets...');

      for (const [uuid, assetJson] of Object.entries(data.assets)) {
        try {
          if (cc.assetManager.assets.has(uuid)) {
            continue; // Skip if already loaded
          }

          // Deserialize the asset
          const details = getDeserializeDetails();
          const asset = cc.deserialize(assetJson as unknown[], details);

          if (asset) {
            // Set UUID and add to cache
            (asset as { _uuid?: string })._uuid = uuid;
            cc.assetManager.assets.add(uuid, asset as Parameters<typeof cc.assetManager.assets.add>[1]);
          }
        } catch (e) {
          // Some assets may fail to deserialize - this is ok for now
          console.debug('[IPC] Asset', uuid, 'skipped:', e instanceof Error ? e.message : e);
        }
      }
      console.log('[IPC] Assets loaded into cache');
    }

    // Step 3: Parse and deserialize the scene
    const sceneJson = JSON.parse(data.content);
    const sceneDetails = getDeserializeDetails();
    const sceneAsset = cc.deserialize(sceneJson, sceneDetails);

    if (!sceneAsset) {
      throw new Error('Failed to deserialize scene');
    }

    // Step 4: Resolve scene dependencies from asset cache
    resolveDeserializeDependencies(sceneDetails);

    // Step 5: Run the scene
    const scene = (sceneAsset as { scene?: unknown }).scene ?? sceneAsset;

    try {
      await new Promise<void>((resolve, reject) => {
        try {
          cc.director.runSceneImmediate(
            scene as Parameters<typeof cc.director.runSceneImmediate>[0],
            () => { /* onBeforeLoad */ },
            () => {
              console.log('[IPC] Scene activated');
              resolve();
            }
          );
        } catch (error) {
          // Scene activation may throw errors for missing materials/scripts
          // but the scene structure is still valid
          console.warn('[IPC] Scene activation had errors:', error);
          resolve(); // Still resolve to continue
        }
      });
    } catch (runError) {
      console.warn('[IPC] Scene run error (non-fatal):', runError);
    }

    // Always notify hierarchy changed - scene structure is available even with errors
    rpc.notify('scene.hierarchyChanged', undefined);
    console.log('[IPC] Scene loaded (hierarchy updated)');

  } catch (error) {
    console.error('[IPC] Failed to load scene:', error);
    rpc.notify('console.log', {
      level: 'error',
      message: `Failed to load scene: ${error instanceof Error ? error.message : String(error)}`
    });

    // Still try to notify hierarchy if there's any scene data
    rpc.notify('scene.hierarchyChanged', undefined);
  }
}

/**
 * @zh 获取反序列化详情对象
 * @en Get deserialize details object
 */
function getDeserializeDetails(): Record<string, unknown> {
  const deserializeModule = cc.deserialize as unknown as {
    Details?: { pool?: { get?: () => Record<string, unknown> | null } };
  };
  const details = deserializeModule.Details?.pool?.get?.() || {};
  if (details && (details as { init?: () => void }).init) {
    (details as { init: () => void }).init();
  }
  return details as Record<string, unknown>;
}

/**
 * @zh 解析反序列化依赖
 * @en Resolve deserialize dependencies
 */
function resolveDeserializeDependencies(details: Record<string, unknown>): void {
  const uuidList = (details.uuidList || []) as string[];
  const objList = (details.uuidObjList || []) as Record<string, unknown>[];
  const propList = (details.uuidPropList || []) as string[];

  for (let i = 0; i < uuidList.length; i++) {
    const uuid = uuidList[i];
    const obj = objList[i];
    const prop = propList[i];

    if (!obj || !prop || !uuid || typeof uuid !== 'string') continue;

    const dependAsset = cc.assetManager.assets.get(uuid);
    if (dependAsset) {
      obj[prop] = dependAsset;
      // Add reference if the asset supports it
      if (typeof (dependAsset as { addRef?: () => void }).addRef === 'function') {
        (dependAsset as { addRef: () => void }).addRef();
      }
    }
  }

  // Reset details pool
  if ((details as { reset?: () => void }).reset) {
    (details as { reset: () => void }).reset();
  }
}
