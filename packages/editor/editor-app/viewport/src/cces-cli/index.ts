/**
 * @zh cces-cli MCP API 客户端
 * @en cces-cli MCP API client
 *
 * @zh 通过 HTTP 调用 cces-cli 的 MCP 服务器 API
 * @en Call cces-cli MCP server API via HTTP
 */

import { rpc } from '../rpc';

/**
 * @zh cces-cli MCP 服务器配置
 * @en cces-cli MCP server configuration
 */
export interface CocosCliConfig {
  /** @zh MCP 服务器 URL @en MCP server URL */
  baseUrl: string;
  /** @zh 项目路径 @en Project path */
  projectPath: string;
}

/**
 * @zh 通用 API 响应
 * @en Common API response
 */
export interface ApiResponse<T> {
  code: number;
  data?: T;
  reason?: string;
}

/**
 * @zh 资产信息
 * @en Asset info
 */
export interface AssetInfo {
  uuid: string;
  name: string;
  path: string;
  url: string;
  type: string;
  isDirectory: boolean;
  library?: Record<string, string>;
  subAssets?: Record<string, AssetInfo>;
  visible?: boolean;
  readonly?: boolean;
}

/**
 * @zh 场景信息
 * @en Scene info
 */
export interface SceneInfo {
  uuid: string;
  url: string;
  name: string;
  dirty: boolean;
}

/**
 * @zh 节点信息
 * @en Node info
 */
export interface NodeInfo {
  uuid: string;
  name: string;
  active: boolean;
  children: NodeInfo[];
  components: string[];
  parent?: string;
}

let config: CocosCliConfig | null = null;

/**
 * @zh 初始化 cces-cli 客户端
 * @en Initialize cces-cli client
 */
export function initCocosCliClient(baseUrl: string, projectPath: string): void {
  config = { baseUrl, projectPath };
}

/**
 * @zh 获取配置
 * @en Get configuration
 */
export function getConfig(): CocosCliConfig | null {
  return config;
}

/**
 * @zh 调用 MCP 工具
 * @en Call MCP tool
 */
async function callTool<T>(toolName: string, args: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  if (!config) {
    return { code: -1, reason: 'cces-cli client not initialized' };
  }

  try {
    const response = await fetch(`${config.baseUrl}/mcp/tools/${toolName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      return { code: response.status, reason: `HTTP ${response.status}: ${response.statusText}` };
    }

    return await response.json();
  } catch (error) {
    return { code: -1, reason: error instanceof Error ? error.message : String(error) };
  }
}

// ============================================================================
// Assets API
// ============================================================================

export const assets = {
  /**
   * @zh 查询资产信息
   * @en Query asset info
   */
  async queryInfo(urlOrUuidOrPath: string, dataKeys?: string[]): Promise<ApiResponse<AssetInfo | null>> {
    return callTool('assets-query-asset-info', { urlOrUUIDOrPath: urlOrUuidOrPath, dataKeys });
  },

  /**
   * @zh 查询资产元数据
   * @en Query asset metadata
   */
  async queryMeta(urlOrUuidOrPath: string): Promise<ApiResponse<unknown>> {
    return callTool('assets-query-asset-meta', { urlOrUUIDOrPath: urlOrUuidOrPath });
  },

  /**
   * @zh 批量查询资产
   * @en Query assets batch
   */
  async queryInfos(options?: {
    pattern?: string;
    type?: string;
    importer?: string;
    extname?: string;
  }): Promise<ApiResponse<AssetInfo[]>> {
    return callTool('assets-query-asset-infos', options);
  },

  /**
   * @zh 刷新资产目录
   * @en Refresh asset directory
   */
  async refresh(dir: string): Promise<ApiResponse<null>> {
    return callTool('assets-refresh', { dir });
  },

  /**
   * @zh 删除资产
   * @en Delete asset
   */
  async delete(dbPath: string): Promise<ApiResponse<{ dbPath: string }>> {
    return callTool('assets-delete-asset', { dbPath });
  },

  /**
   * @zh 创建资产
   * @en Create asset
   */
  async create(options: {
    url: string;
    content?: string;
    overwrite?: boolean;
    autoRename?: boolean;
  }): Promise<ApiResponse<AssetInfo | null>> {
    return callTool('assets-create-asset', options);
  },

  /**
   * @zh 按类型创建资产
   * @en Create asset by type
   */
  async createByType(
    ccType: string,
    dirOrUrl: string,
    baseName: string,
    options?: { content?: string; templateName?: string; overwrite?: boolean; autoRename?: boolean }
  ): Promise<ApiResponse<AssetInfo | null>> {
    return callTool('assets-create-asset-by-type', { ccType, dirOrUrl, baseName, ...options });
  },

  /**
   * @zh 导入资产
   * @en Import asset
   */
  async import(source: string, target: string, options?: { overwrite?: boolean; autoRename?: boolean }): Promise<ApiResponse<AssetInfo[]>> {
    return callTool('assets-import-asset', { source, target, ...options });
  },

  /**
   * @zh 重新导入资产
   * @en Reimport asset
   */
  async reimport(pathOrUrlOrUuid: string): Promise<ApiResponse<AssetInfo | null>> {
    return callTool('assets-reimport-asset', { pathOrUrlOrUUID: pathOrUrlOrUuid });
  },

  /**
   * @zh 保存资产
   * @en Save asset
   */
  async save(pathOrUrlOrUuid: string, data: string): Promise<ApiResponse<null>> {
    return callTool('assets-save-asset', { pathOrUrlOrUUID: pathOrUrlOrUuid, data });
  },

  /**
   * @zh 查询 UUID
   * @en Query UUID
   */
  async queryUuid(urlOrPath: string): Promise<ApiResponse<string | null>> {
    return callTool('assets-query-uuid', { urlOrPath });
  },

  /**
   * @zh 查询路径
   * @en Query path
   */
  async queryPath(urlOrUuid: string): Promise<ApiResponse<string | null>> {
    return callTool('assets-query-path', { urlOrUuid });
  },

  /**
   * @zh 查询 URL
   * @en Query URL
   */
  async queryUrl(uuidOrPath: string): Promise<ApiResponse<string | null>> {
    return callTool('assets-query-url', { uuidOrPath });
  },

  /**
   * @zh 移动资产
   * @en Move asset
   */
  async move(source: string, target: string, options?: { overwrite?: boolean; autoRename?: boolean }): Promise<ApiResponse<AssetInfo | null>> {
    return callTool('assets-move-asset', { source, target, ...options });
  },

  /**
   * @zh 重命名资产
   * @en Rename asset
   */
  async rename(source: string, target: string, options?: { overwrite?: boolean; autoRename?: boolean }): Promise<ApiResponse<AssetInfo | null>> {
    return callTool('assets-rename-asset', { source, target, ...options });
  },

  /**
   * @zh 查询可创建类型映射
   * @en Query create type map
   */
  async queryCreateMap(): Promise<ApiResponse<unknown[]>> {
    return callTool('assets-query-create-map', {});
  },
};

// ============================================================================
// Scene API
// ============================================================================

export const scene = {
  /**
   * @zh 查询当前场景
   * @en Query current scene
   */
  async queryCurrent(): Promise<ApiResponse<SceneInfo | null>> {
    return callTool('scene-query-current', {});
  },

  /**
   * @zh 打开场景
   * @en Open scene
   */
  async open(dbUrlOrUuid: string): Promise<ApiResponse<SceneInfo | null>> {
    return callTool('scene-open', { dbURLOrUUID: dbUrlOrUuid });
  },

  /**
   * @zh 关闭场景
   * @en Close scene
   */
  async close(): Promise<ApiResponse<boolean>> {
    return callTool('scene-close', {});
  },

  /**
   * @zh 保存场景
   * @en Save scene
   */
  async save(): Promise<ApiResponse<boolean>> {
    return callTool('scene-save', {});
  },

  /**
   * @zh 创建场景
   * @en Create scene
   */
  async create(options: {
    baseName: string;
    dbURL: string;
    templateType?: '2d' | '3d' | 'empty';
  }): Promise<ApiResponse<{ uuid: string; url: string } | null>> {
    return callTool('scene-create', options);
  },

  /**
   * @zh 重新加载场景
   * @en Reload scene
   */
  async reload(): Promise<ApiResponse<boolean>> {
    return callTool('scene-reload', {});
  },

  // Node sub-API
  node: {
    /**
     * @zh 查询节点树
     * @en Query node tree
     */
    async queryTree(uuid?: string): Promise<ApiResponse<NodeInfo | null>> {
      return callTool('scene-node-query-tree', { uuid });
    },

    /**
     * @zh 查询节点
     * @en Query node
     */
    async query(uuid: string): Promise<ApiResponse<unknown>> {
      return callTool('scene-node-query', { uuid });
    },

    /**
     * @zh 创建节点
     * @en Create node
     */
    async create(options: {
      parent?: string;
      name?: string;
      type?: string;
      components?: string[];
    }): Promise<ApiResponse<{ uuid: string } | null>> {
      return callTool('scene-node-create', options);
    },

    /**
     * @zh 删除节点
     * @en Remove node
     */
    async remove(uuid: string): Promise<ApiResponse<boolean>> {
      return callTool('scene-node-remove', { uuid });
    },

    /**
     * @zh 设置节点属性
     * @en Set node property
     */
    async setProperty(uuid: string, path: string, value: unknown): Promise<ApiResponse<boolean>> {
      return callTool('scene-node-set-property', { uuid, path, value });
    },
  },

  // Component sub-API
  component: {
    /**
     * @zh 添加组件
     * @en Add component
     */
    async add(nodeUuid: string, componentType: string): Promise<ApiResponse<{ uuid: string } | null>> {
      return callTool('scene-component-add', { nodeUuid, componentType });
    },

    /**
     * @zh 移除组件
     * @en Remove component
     */
    async remove(componentUuid: string): Promise<ApiResponse<boolean>> {
      return callTool('scene-component-remove', { componentUuid });
    },

    /**
     * @zh 设置组件属性
     * @en Set component property
     */
    async setProperty(uuid: string, path: string, value: unknown): Promise<ApiResponse<boolean>> {
      return callTool('scene-component-set-property', { uuid, path, value });
    },
  },
};

// ============================================================================
// Scripting API
// ============================================================================

/**
 * @zh 脚本信息
 * @en Script info
 */
export interface ScriptInfo {
  uuid: string;
  cid: string;
  name: string;
  path: string;
}

/**
 * @zh 编译结果
 * @en Compile result
 */
export interface CompileResult {
  success: boolean;
  code?: string;
  scriptInfos?: ScriptInfo[];
  error?: string;
}

export const scripting = {
  /**
   * @zh 编译脚本
   * @en Compile scripts
   */
  async compile(target: 'editor' | 'preview' = 'editor'): Promise<ApiResponse<CompileResult>> {
    return callTool('scripting-compile', { target });
  },

  /**
   * @zh 查询脚本信息
   * @en Query script info
   */
  async queryInfo(uuid: string): Promise<ApiResponse<{ uuid: string; cid: string | null; name: string | null } | null>> {
    return callTool('scripting-query-info', { uuid });
  },

  /**
   * @zh 获取加载器上下文
   * @en Get loader context
   */
  async getLoaderContext(target: 'editor' | 'preview' = 'editor'): Promise<ApiResponse<{ modules: Record<string, string>; importMap?: unknown } | null>> {
    return callTool('scripting-get-loader-context', { target });
  },

  /**
   * @zh 触发编译
   * @en Trigger compilation
   */
  async triggerCompile(): Promise<ApiResponse<boolean>> {
    return callTool('scripting-trigger-compile', {});
  },

  /**
   * @zh 检查编译状态
   * @en Check if ready
   */
  async isReady(target: 'editor' | 'preview' = 'editor'): Promise<ApiResponse<boolean>> {
    return callTool('scripting-is-ready', { target });
  },
};

// ============================================================================
// Project API
// ============================================================================

export const project = {
  /**
   * @zh 查询项目信息
   * @en Query project info
   */
  async queryInfo(): Promise<ApiResponse<unknown>> {
    return callTool('project-query-info', {});
  },
};

// ============================================================================
// Builder API
// ============================================================================

export const builder = {
  /**
   * @zh 构建项目
   * @en Build project
   */
  async build(platform: string, options?: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return callTool('builder-build', { platform, ...options });
  },
};

// ============================================================================
// Engine API
// ============================================================================

/**
 * @zh 材质配置
 * @en Material configuration
 */
export interface MaterialConfig {
  name: string;
  effectName: string;
  defines?: Record<string, boolean | number | string>;
}

/**
 * @zh 内置资源数据
 * @en Builtin resources data
 */
export interface BuiltinResources {
  chunks: Record<string, string>;
  effects: Record<string, string>;
  materialConfigs: MaterialConfig[];
  effectNameMapping?: Record<string, string>;
}

export const engine = {
  /**
   * @zh 获取内置资源
   * @en Get builtin resources
   *
   * 返回 viewport 初始化所需的所有内置资源，包括 shader chunks、effects 和材质配置
   * Returns all builtin resources needed for viewport initialization
   */
  async getBuiltinResources(): Promise<ApiResponse<BuiltinResources>> {
    return callTool('engine-get-builtin-resources', {});
  },
};

/**
 * @zh cces-cli API 客户端
 * @en cces-cli API client
 */
export const cocosCliClient = {
  init: initCocosCliClient,
  getConfig,
  assets,
  scene,
  project,
  builder,
  scripting,
  engine,
};

export default cocosCliClient;
