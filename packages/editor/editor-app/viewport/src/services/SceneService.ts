/**
 * @zh 场景服务 - 封装 CCESEngine 场景操作，提供 RPC API
 * @en Scene Service - Wraps CCESEngine scene operations, provides RPC API
 */

import { rpc } from '../rpc';
import type {
  NodeData,
  NodeProperties,
  ComponentData,
  PropertyValue,
} from '../rpc/types';
import {
  getCC,
  type CC,
  type Node,
  type Scene,
  type Component,
} from '../types';
import { cocosCliClient } from '../cocos-cli';

/**
 * @zh 场景服务类
 * @en Scene Service class
 */
class SceneService {
  private cc: CC | null = null;
  private selectedNodeUuid: string | null = null;

  /**
   * @zh 初始化服务
   * @en Initialize service
   */
  init(): void {
    this.cc = getCC();
    this.registerRPCMethods();
  }

  /**
   * @zh 注册 RPC 方法
   * @en Register RPC methods
   */
  private registerRPCMethods(): void {
    rpc.registerMethod('scene.getTree', () => this.getTree());
    rpc.registerMethod('scene.getNodeProperties', (p) => this.getNodeProperties(p.uuid));
    rpc.registerMethod('scene.setNodeProperty', (p) => this.setNodeProperty(p.uuid, p.path, p.value));
    rpc.registerMethod('scene.selectNode', (p) => this.selectNode(p.uuid));
    rpc.registerMethod('scene.createNode', (p) => this.createNode(p.type, p.parentUuid));
    rpc.registerMethod('scene.deleteNode', (p) => this.deleteNode(p.uuid));
    rpc.registerMethod('scene.duplicateNode', (p) => this.duplicateNode(p.uuid));
    rpc.registerMethod('scene.reparentNode', (p) => this.reparentNode(p.uuid, p.newParentUuid, p.index));
    // Scene file operations
    rpc.registerMethod('scene.loadFromPath', (p) => this.loadFromPath(p.path));
    rpc.registerMethod('scene.save', () => this.saveScene());
    rpc.registerMethod('scene.initMcpClient', (p) => this.initMcpClient(p.baseUrl, p.projectPath));
  }

  /**
   * @zh 获取当前场景
   * @en Get current scene
   */
  private getScene(): Scene | null {
    return this.cc?.director?.getScene() ?? null;
  }

  /**
   * @zh 通过 UUID 查找节点
   * @en Find node by UUID
   */
  private findNodeByUuid(uuid: string): Node | null {
    const scene = this.getScene();
    if (!scene) return null;

    const search = (node: Node): Node | null => {
      if (node.uuid === uuid) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    };

    return search(scene);
  }

  /**
   * @zh 获取场景树
   * @en Get scene tree
   */
  getTree(): NodeData | null {
    const scene = this.getScene();
    if (!scene) return null;

    const buildNodeData = (node: Node): NodeData => {
      return {
        uuid: node.uuid,
        name: node.name,
        active: node.active,
        children: node.children.map(buildNodeData),
        components: node.components?.map(c => c.constructor.name) ?? [],
      };
    };

    return buildNodeData(scene);
  }

  /**
   * @zh 获取节点属性
   * @en Get node properties
   */
  getNodeProperties(uuid: string): NodeProperties | null {
    const node = this.findNodeByUuid(uuid);
    if (!node) return null;

    const position = node.position;
    const rotation = node.eulerAngles;
    const scale = node.scale;

    return {
      uuid: node.uuid,
      name: node.name,
      active: node.active,
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z],
      scale: [scale.x, scale.y, scale.z],
      components: this.getComponentsData(node),
    };
  }

  /**
   * @zh 获取组件数据
   * @en Get components data
   */
  private getComponentsData(node: Node): ComponentData[] {
    if (!node.components) return [];

    return node.components.map(comp => ({
      type: comp.constructor.name,
      uuid: comp.uuid,
      enabled: comp.enabled ?? true,
      properties: this.getComponentProperties(comp),
    }));
  }

  /**
   * @zh 获取组件属性
   * @en Get component properties
   */
  private getComponentProperties(comp: Component): Record<string, PropertyValue> {
    const props: Record<string, PropertyValue> = {};
    const cc = this.cc!;

    // Common component properties
    const compAny = comp as unknown as Record<string, unknown>;

    // Sprite component
    if (comp.constructor.name === 'Sprite') {
      if ('spriteFrame' in compAny) {
        const sf = compAny.spriteFrame as { _uuid?: string } | null;
        props['spriteFrame'] = {
          type: 'asset',
          value: sf?._uuid ?? null,
          assetType: 'spriteFrame',
        };
      }
      if ('color' in compAny) {
        const color = compAny.color as { r: number; g: number; b: number; a: number };
        props['color'] = {
          type: 'color',
          value: [color.r, color.g, color.b, color.a],
        };
      }
      if ('sizeMode' in compAny) {
        props['sizeMode'] = {
          type: 'enum',
          value: compAny.sizeMode as number,
          options: ['CUSTOM', 'TRIMMED', 'RAW'],
        };
      }
    }

    // Camera component
    if (comp.constructor.name === 'Camera') {
      if ('fov' in compAny) {
        props['fov'] = { type: 'number', value: compAny.fov as number, min: 1, max: 179 };
      }
      if ('near' in compAny) {
        props['near'] = { type: 'number', value: compAny.near as number, min: 0.01 };
      }
      if ('far' in compAny) {
        props['far'] = { type: 'number', value: compAny.far as number, min: 1 };
      }
      if ('clearColor' in compAny) {
        const color = compAny.clearColor as { r: number; g: number; b: number; a: number };
        props['clearColor'] = {
          type: 'color',
          value: [color.r, color.g, color.b, color.a],
        };
      }
    }

    // UITransform component
    if (comp.constructor.name === 'UITransform') {
      if ('contentSize' in compAny) {
        const size = compAny.contentSize as { width: number; height: number };
        props['contentSize'] = {
          type: 'vec2',
          value: [size.width, size.height],
        };
      }
      if ('anchorPoint' in compAny) {
        const anchor = compAny.anchorPoint as { x: number; y: number };
        props['anchorPoint'] = {
          type: 'vec2',
          value: [anchor.x, anchor.y],
        };
      }
    }

    // Label component
    if (comp.constructor.name === 'Label') {
      if ('string' in compAny) {
        props['string'] = { type: 'string', value: compAny.string as string };
      }
      if ('fontSize' in compAny) {
        props['fontSize'] = { type: 'number', value: compAny.fontSize as number, min: 1 };
      }
      if ('color' in compAny) {
        const color = compAny.color as { r: number; g: number; b: number; a: number };
        props['color'] = {
          type: 'color',
          value: [color.r, color.g, color.b, color.a],
        };
      }
    }

    return props;
  }

  /**
   * @zh 设置节点属性
   * @en Set node property
   */
  setNodeProperty(uuid: string, path: string, value: unknown): boolean {
    const node = this.findNodeByUuid(uuid);
    if (!node) return false;

    const cc = this.cc!;
    const parts = path.split('.');

    try {
      // Node properties
      if (parts[0] === 'name') {
        node.name = value as string;
        return true;
      }

      if (parts[0] === 'active') {
        node.active = value as boolean;
        return true;
      }

      if (parts[0] === 'position') {
        const v = value as [number, number, number];
        node.setPosition(v[0], v[1], v[2]);
        return true;
      }

      if (parts[0] === 'rotation') {
        const v = value as [number, number, number];
        node.setRotationFromEuler(v[0], v[1], v[2]);
        return true;
      }

      if (parts[0] === 'scale') {
        const v = value as [number, number, number];
        node.setScale(v[0], v[1], v[2]);
        return true;
      }

      // Component properties: component.{index}.{property}
      if (parts[0] === 'component' && parts.length >= 3) {
        const compIndex = parseInt(parts[1], 10);
        const propName = parts[2];
        const comp = node.components?.[compIndex];
        if (!comp) return false;

        (comp as unknown as Record<string, unknown>)[propName] = value;
        return true;
      }

      return false;
    } catch (e) {
      console.error('[SceneService] setNodeProperty error:', e);
      return false;
    }
  }

  /**
   * @zh 选择节点
   * @en Select node
   */
  selectNode(uuid: string | null): void {
    this.selectedNodeUuid = uuid;
    rpc.notify('scene.nodeSelected', { uuid });
  }

  /**
   * @zh 获取选中的节点 UUID
   * @en Get selected node UUID
   */
  getSelectedNodeUuid(): string | null {
    return this.selectedNodeUuid;
  }

  /**
   * @zh 创建节点
   * @en Create node
   */
  createNode(type: string, parentUuid?: string): string | null {
    const cc = this.cc!;
    const scene = this.getScene();
    if (!scene) return null;

    let parent: Node = scene;
    if (parentUuid) {
      const found = this.findNodeByUuid(parentUuid);
      if (found) parent = found;
    }

    try {
      const node = new cc.Node(type);

      // Add default components based on type
      switch (type) {
        case 'Sprite':
          node.addComponent(cc.Sprite);
          node.addComponent(cc.UITransform);
          break;
        case 'Label':
          node.addComponent(cc.Label);
          node.addComponent(cc.UITransform);
          break;
        case 'Camera':
          node.addComponent(cc.Camera);
          break;
        case 'Empty':
        default:
          // Just an empty node
          break;
      }

      parent.addChild(node);
      rpc.notify('scene.hierarchyChanged', undefined);
      return node.uuid;
    } catch (e) {
      console.error('[SceneService] createNode error:', e);
      return null;
    }
  }

  /**
   * @zh 删除节点
   * @en Delete node
   */
  deleteNode(uuid: string): boolean {
    const node = this.findNodeByUuid(uuid);
    if (!node) return false;

    // Don't delete the scene root
    const scene = this.getScene();
    if (node === scene) return false;

    try {
      node.removeFromParent();
      node.destroy();

      if (this.selectedNodeUuid === uuid) {
        this.selectNode(null);
      }

      rpc.notify('scene.hierarchyChanged', undefined);
      return true;
    } catch (e) {
      console.error('[SceneService] deleteNode error:', e);
      return false;
    }
  }

  /**
   * @zh 复制节点
   * @en Duplicate node
   */
  duplicateNode(uuid: string): string | null {
    const cc = this.cc!;
    const node = this.findNodeByUuid(uuid);
    if (!node || !node.parent) return null;

    try {
      const clone = cc.instantiate(node);
      clone.name = `${node.name} (Copy)`;
      node.parent.addChild(clone);

      rpc.notify('scene.hierarchyChanged', undefined);
      return clone.uuid;
    } catch (e) {
      console.error('[SceneService] duplicateNode error:', e);
      return null;
    }
  }

  /**
   * @zh 重新设置父节点
   * @en Reparent node
   */
  reparentNode(uuid: string, newParentUuid: string | null, index?: number): boolean {
    const node = this.findNodeByUuid(uuid);
    if (!node) return false;

    const scene = this.getScene();
    let newParent: Node | null = scene;

    if (newParentUuid) {
      newParent = this.findNodeByUuid(newParentUuid);
      if (!newParent) return false;
    }

    if (!newParent) return false;

    try {
      node.removeFromParent();

      if (index !== undefined && index >= 0) {
        newParent.insertChild(node, index);
      } else {
        newParent.addChild(node);
      }

      rpc.notify('scene.hierarchyChanged', undefined);
      return true;
    } catch (e) {
      console.error('[SceneService] reparentNode error:', e);
      return false;
    }
  }

  /**
   * @zh 初始化 MCP 客户端
   * @en Initialize MCP client
   */
  initMcpClient(baseUrl: string, projectPath: string): boolean {
    try {
      cocosCliClient.init(baseUrl, projectPath);
      console.log('[SceneService] MCP client initialized:', baseUrl, projectPath);
      return true;
    } catch (e) {
      console.error('[SceneService] initMcpClient error:', e);
      return false;
    }
  }

  /**
   * @zh 从路径加载场景
   * @en Load scene from path
   */
  async loadFromPath(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const config = cocosCliClient.getConfig();
      if (!config) {
        return { success: false, error: 'MCP client not initialized' };
      }

      const response = await cocosCliClient.scene.open(path);
      if (response.code !== 0) {
        return { success: false, error: response.reason ?? 'Failed to open scene' };
      }

      // Notify that scene hierarchy changed
      rpc.notify('scene.hierarchyChanged', undefined);
      rpc.notify('scene.loaded', { path, info: response.data });

      console.log('[SceneService] Scene loaded:', path, response.data);
      return { success: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error('[SceneService] loadFromPath error:', error);
      return { success: false, error };
    }
  }

  /**
   * @zh 保存当前场景
   * @en Save current scene
   */
  async saveScene(): Promise<{ success: boolean; error?: string }> {
    try {
      const config = cocosCliClient.getConfig();
      if (!config) {
        return { success: false, error: 'MCP client not initialized' };
      }

      const response = await cocosCliClient.scene.save();
      if (response.code !== 0) {
        return { success: false, error: response.reason ?? 'Failed to save scene' };
      }

      rpc.notify('scene.saved', undefined);
      console.log('[SceneService] Scene saved');
      return { success: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error('[SceneService] saveScene error:', error);
      return { success: false, error };
    }
  }
}

export const sceneService = new SceneService();
