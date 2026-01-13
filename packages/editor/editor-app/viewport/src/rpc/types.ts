/**
 * @zh RPC 类型定义
 * @en RPC type definitions
 */

// ============================================================================
// Base Types
// ============================================================================

/**
 * @zh RPC 请求
 * @en RPC Request
 */
export interface RPCRequest {
  id: number;
  method: string;
  params?: unknown;
}

/**
 * @zh RPC 响应
 * @en RPC Response
 */
export interface RPCResponse {
  id: number;
  result?: unknown;
  error?: RPCError;
}

/**
 * @zh RPC 错误
 * @en RPC Error
 */
export interface RPCError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * @zh RPC 通知（无需响应）
 * @en RPC Notification (no response needed)
 */
export interface RPCNotification {
  method: string;
  params?: unknown;
}

// ============================================================================
// Scene Types
// ============================================================================

/**
 * @zh 节点数据（层级树用）
 * @en Node data for hierarchy tree
 */
export interface NodeData {
  uuid: string;
  name: string;
  active: boolean;
  children: NodeData[];
  components: string[];
}

/**
 * @zh 节点属性
 * @en Node properties
 */
export interface NodeProperties {
  uuid: string;
  name: string;
  active: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  components: ComponentData[];
}

/**
 * @zh 组件数据
 * @en Component data
 */
export interface ComponentData {
  type: string;
  uuid: string;
  enabled: boolean;
  properties: Record<string, PropertyValue>;
}

/**
 * @zh 属性值
 * @en Property value
 */
export type PropertyValue =
  | { type: 'number'; value: number; min?: number; max?: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'color'; value: [number, number, number, number] }
  | { type: 'vec2'; value: [number, number] }
  | { type: 'vec3'; value: [number, number, number] }
  | { type: 'asset'; value: string | null; assetType: string }
  | { type: 'enum'; value: number; options: string[] }
  | { type: 'object'; value: Record<string, PropertyValue> };

// ============================================================================
// Asset Types
// ============================================================================

/**
 * @zh 资源节点数据
 * @en Asset node data
 */
export interface AssetNodeData {
  uuid: string;
  name: string;
  path: string;
  type: AssetType;
  children?: AssetNodeData[];
}

/**
 * @zh 资源类型
 * @en Asset type
 */
export type AssetType =
  | 'folder'
  | 'scene'
  | 'prefab'
  | 'image'
  | 'spriteFrame'
  | 'texture'
  | 'audio'
  | 'animation'
  | 'script'
  | 'material'
  | 'font'
  | 'json'
  | 'unknown';

// ============================================================================
// RPC Methods
// ============================================================================

/**
 * @zh RPC 方法定义
 * @en RPC method definitions
 */
export interface RPCMethods {
  // Scene methods
  'scene.getTree': { params: void; result: NodeData | null };
  'scene.getNodeProperties': { params: { uuid: string }; result: NodeProperties | null };
  'scene.setNodeProperty': { params: { uuid: string; path: string; value: unknown }; result: boolean };
  'scene.selectNode': { params: { uuid: string | null }; result: void };
  'scene.createNode': { params: { type: string; parentUuid?: string }; result: string | null };
  'scene.deleteNode': { params: { uuid: string }; result: boolean };
  'scene.duplicateNode': { params: { uuid: string }; result: string | null };
  'scene.reparentNode': { params: { uuid: string; newParentUuid: string | null; index?: number }; result: boolean };
  'scene.loadFromPath': { params: { path: string }; result: { success: boolean; error?: string } };
  'scene.save': { params: void; result: { success: boolean; error?: string } };
  'scene.initMcpClient': { params: { baseUrl: string; projectPath: string }; result: boolean };

  // Asset methods
  'asset.getTree': { params: { path?: string }; result: AssetNodeData[] };
  'asset.load': { params: { uuid: string }; result: boolean };
  'asset.loadScene': { params: { path: string }; result: boolean };

  // Editor methods
  'editor.getState': { params: void; result: EditorStateData };
  'editor.setTool': { params: { tool: string }; result: void };
  'editor.undo': { params: void; result: boolean };
  'editor.redo': { params: void; result: boolean };

  // Effect methods
  'effect.registerChunk': { params: { name: string; content: string }; result: boolean };
  'effect.registerChunks': { params: { chunks: Record<string, string> }; result: boolean };
  'effect.compile': { params: { name: string; content: string }; result: boolean };
  'effect.compileMultiple': { params: { effects: Record<string, string> }; result: number };
  'effect.getRegistered': { params: void; result: string[] };

  // cocos-cli methods
  'cocos-cli.init': { params: { baseUrl: string; projectPath: string }; result: boolean };
  'cocos-cli.getConfig': { params: void; result: { baseUrl: string; projectPath: string } | null };
}

/**
 * @zh 编辑器状态数据
 * @en Editor state data
 */
export interface EditorStateData {
  isPlaying: boolean;
  isPaused: boolean;
  selectedNodeUuid: string | null;
  currentScenePath: string | null;
  activeTool: string;
}

// ============================================================================
// Notifications
// ============================================================================

/**
 * @zh 通知类型定义
 * @en Notification type definitions
 */
export interface RPCNotifications {
  'scene.changed': { sceneUuid: string };
  'scene.nodeSelected': { uuid: string | null };
  'scene.nodeChanged': { uuid: string; changes: string[] };
  'scene.hierarchyChanged': void;
  'scene.loaded': { path: string; info?: unknown };
  'scene.saved': void;
  'asset.changed': { uuid: string };
  'editor.stateChanged': Partial<EditorStateData>;
  'console.log': { level: 'info' | 'warn' | 'error'; message: string };
  'viewport.ready': void;
}
