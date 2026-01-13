/**
 * @zh EditorBundle - 编辑器源文件资源加载系统
 * @en EditorBundle - Editor source file asset loading system
 *
 * @zh 直接从源文件加载资源，不依赖 Cocos Creator 的 library 目录
 * @en Load assets directly from source files, no dependency on Cocos Creator library
 */

import {
  getCC,
  type CC,
  type SceneAsset,
  type Asset,
  type ImageAsset,
  type Texture2D,
  type SpriteFrame,
} from './types';
import type { Details } from 'cc';

interface MetaFile {
  ver: string;
  importer: string;
  imported: boolean;
  uuid: string;
  files: string[];
  subMetas?: Record<string, MetaSubAsset>;
}

interface MetaSubAsset {
  importer: string;
  uuid: string;
  id?: string;
  subMetas?: Record<string, MetaSubAsset>;
}

interface DirectoryEntry {
  name: string;
  path: string;
  is_dir: boolean;
}

/**
 * @zh 资源信息
 * @en Asset info
 */
interface AssetEntry {
  uuid: string;
  sourcePath: string;
  importer: string;
  subId?: string;
  parentUuid?: string;
}

declare function __TAURI_INVOKE__(cmd: string, args?: Record<string, unknown>): Promise<unknown>;

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (typeof __TAURI_INVOKE__ !== 'undefined') {
    return __TAURI_INVOKE__(cmd, args) as Promise<T>;
  }
  throw new Error('Tauri invoke not available');
}

export class EditorBundle {
  private cc: CC;
  private projectPath: string | null = null;
  private initialized = false;

  /**
   * @zh UUID 到资源信息的映射
   * @en UUID to asset entry mapping
   */
  private assetEntries: Map<string, AssetEntry> = new Map();

  constructor() {
    this.cc = getCC();
  }

  /**
   * @zh 初始化编辑器资源系统
   * @en Initialize editor asset system
   */
  async initialize(projectPath: string): Promise<void> {
    if (this.initialized && this.projectPath === projectPath) {
      return;
    }

    this.projectPath = projectPath;
    this.assetEntries.clear();

    await this.scanAssetsFolder(`${projectPath}/assets`);

    this.initialized = true;
  }

  /**
   * @zh 加载场景
   * @en Load scene
   */
  async loadScene(scenePath: string): Promise<SceneAsset | null> {
    const sceneJson = await this.readJsonFile(scenePath);
    if (!sceneJson) {
      return null;
    }

    const sceneUuid = await this.getSceneUuid(scenePath);
    const uuids = this.extractDependencies(sceneJson);

    if (uuids.length > 0) {
      await this.loadAssets(uuids);
    }

    return this.deserializeScene(sceneJson, sceneUuid);
  }

  /**
   * @zh 运行场景
   * @en Run scene
   */
  async runScene(sceneAsset: SceneAsset): Promise<void> {
    const director = this.cc.director;
    if (!director) {
      throw new Error('[EditorBundle] Director not available');
    }

    const scene = sceneAsset.scene ?? sceneAsset;

    return new Promise((resolve, reject) => {
      try {
        director.runSceneImmediate(
          scene,
          () => { /* onBeforeLoad */ },
          () => { resolve(); }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @zh 扫描 assets 文件夹，收集资源信息
   * @en Scan assets folder to collect asset info
   */
  private async scanAssetsFolder(dirPath: string): Promise<void> {
    let entries: DirectoryEntry[];
    try {
      entries = await invoke<DirectoryEntry[]>('list_directory', { path: dirPath });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.is_dir) {
        await this.scanAssetsFolder(entry.path);
      } else if (entry.name.endsWith('.meta')) {
        await this.processMetaFile(entry.path);
      }
    }
  }

  /**
   * @zh 处理 meta 文件
   * @en Process meta file
   */
  private async processMetaFile(metaPath: string): Promise<void> {
    try {
      const content = await invoke<string>('read_file_content', { path: metaPath });
      const meta = JSON.parse(content) as MetaFile;

      if (!meta.uuid) return;

      const sourcePath = metaPath.slice(0, -5);

      this.assetEntries.set(meta.uuid, {
        uuid: meta.uuid,
        sourcePath,
        importer: meta.importer,
      });

      if (meta.subMetas) {
        this.processSubMetas(meta.subMetas, sourcePath, meta.uuid);
      }
    } catch {
      // Ignore parse errors
    }
  }

  /**
   * @zh 处理子资源
   * @en Process sub assets
   */
  private processSubMetas(
    subMetas: Record<string, MetaSubAsset>,
    sourcePath: string,
    parentUuid: string
  ): void {
    for (const [id, subMeta] of Object.entries(subMetas)) {
      if (subMeta.uuid) {
        this.assetEntries.set(subMeta.uuid, {
          uuid: subMeta.uuid,
          sourcePath,
          importer: subMeta.importer,
          subId: id,
          parentUuid,
        });
      }
      if (subMeta.subMetas) {
        this.processSubMetas(subMeta.subMetas, sourcePath, parentUuid);
      }
    }
  }

  /**
   * @zh 加载资源列表
   * @en Load asset list
   */
  private async loadAssets(uuids: string[]): Promise<void> {
    const cc = this.cc;
    if (!cc?.assetManager) return;

    const toLoad = uuids.filter(uuid => {
      return this.assetEntries.has(uuid) && !cc.assetManager.assets.has(uuid);
    });

    // Group by source file
    const bySource = new Map<string, AssetEntry[]>();
    for (const uuid of toLoad) {
      const entry = this.assetEntries.get(uuid)!;
      const group = bySource.get(entry.sourcePath) || [];
      group.push(entry);
      bySource.set(entry.sourcePath, group);
    }

    // Load each source file
    for (const [sourcePath, entries] of bySource) {
      await this.loadSourceFile(sourcePath, entries);
    }
  }

  /**
   * @zh 从源文件加载资源
   * @en Load assets from source file
   */
  private async loadSourceFile(sourcePath: string, entries: AssetEntry[]): Promise<void> {
    const cc = this.cc;
    const ext = this.getExtension(sourcePath).toLowerCase();

    // Image files
    if (['.png', '.jpg', '.jpeg', '.webp', '.bmp'].includes(ext)) {
      await this.loadImageSource(sourcePath, entries);
      return;
    }

    // Scene/prefab files - these are loaded via deserialize
    if (['.scene', '.prefab'].includes(ext)) {
      return;
    }

    // Other source types not yet supported
  }

  /**
   * @zh 从图片源文件创建资源
   * @en Create assets from image source file
   */
  private async loadImageSource(sourcePath: string, entries: AssetEntry[]): Promise<void> {
    const cc = this.cc;
    const imageUrl = this.pathToUrl(sourcePath);

    // Load image element
    const img = await this.loadImageElement(imageUrl);

    // Find or create ImageAsset (main asset)
    const imageEntry = entries.find(e => e.importer === 'image' || e.importer === 'texture');
    let imageAsset: ImageAsset | null = null;

    if (imageEntry) {
      imageAsset = new cc.ImageAsset(img) as unknown as ImageAsset;
      imageAsset._uuid = imageEntry.uuid;
      cc.assetManager.assets.add(imageEntry.uuid, imageAsset);
    }

    // Create Texture2D if needed
    const textureEntry = entries.find(e => e.subId === 'texture');
    let texture: Texture2D | null = null;

    if (textureEntry) {
      texture = new cc.Texture2D();
      texture._uuid = textureEntry.uuid;

      if (imageAsset) {
        texture.image = imageAsset;
      } else {
        // Create inline ImageAsset
        imageAsset = new cc.ImageAsset(img) as unknown as ImageAsset;
        texture.image = imageAsset;
      }

      cc.assetManager.assets.add(textureEntry.uuid, texture);
    }

    // Create SpriteFrame if needed
    const spriteFrameEntry = entries.find(e => e.subId === 'spriteFrame');
    if (spriteFrameEntry) {
      const spriteFrame = new cc.SpriteFrame();
      spriteFrame._uuid = spriteFrameEntry.uuid;

      // Use existing texture or create one
      if (texture) {
        spriteFrame.texture = texture;
      } else if (imageAsset) {
        texture = new cc.Texture2D();
        texture.image = imageAsset;
        spriteFrame.texture = texture;
      }

      cc.assetManager.assets.add(spriteFrameEntry.uuid, spriteFrame);
    }
  }

  /**
   * @zh 加载图片元素
   * @en Load image element
   */
  private loadImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load: ${url}`));
      img.src = url;
    });
  }

  /**
   * @zh 本地路径转 URL
   * @en Convert local path to URL
   */
  private pathToUrl(localPath: string): string {
    const normalized = localPath.replace(/\\/g, '/');
    const urlPath = normalized.replace(/^([A-Za-z]):\//, '$1/');
    return `/__project__/${urlPath}`;
  }

  /**
   * @zh 获取文件扩展名
   * @en Get file extension
   */
  private getExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    return lastDot >= 0 ? path.slice(lastDot) : '';
  }

  /**
   * @zh 读取 JSON 文件
   * @en Read JSON file
   */
  private async readJsonFile(filePath: string): Promise<unknown[] | null> {
    try {
      const content = await invoke<string>('read_file_content', { path: filePath });
      return JSON.parse(content) as unknown[];
    } catch (error) {
      console.error('[EditorBundle] Failed to read JSON:', filePath, error);
      return null;
    }
  }

  /**
   * @zh 获取场景 UUID
   * @en Get scene UUID
   */
  private async getSceneUuid(scenePath: string): Promise<string | undefined> {
    try {
      const metaPath = `${scenePath}.meta`;
      const content = await invoke<string>('read_file_content', { path: metaPath });
      const meta = JSON.parse(content) as { uuid?: string };
      return meta.uuid;
    } catch {
      return undefined;
    }
  }

  /**
   * @zh 提取场景依赖
   * @en Extract scene dependencies
   */
  private extractDependencies(json: unknown): string[] {
    const uuids = new Set<string>();

    const traverse = (obj: unknown): void => {
      if (!obj || typeof obj !== 'object') return;

      if (Array.isArray(obj)) {
        obj.forEach(traverse);
        return;
      }

      const record = obj as Record<string, unknown>;

      if ('__uuid__' in record && typeof record.__uuid__ === 'string') {
        uuids.add(record.__uuid__);
      }

      for (const value of Object.values(record)) {
        traverse(value);
      }
    };

    traverse(json);
    return Array.from(uuids);
  }

  /**
   * @zh 反序列化场景
   * @en Deserialize scene
   */
  private deserializeScene(json: unknown[], sceneUuid?: string): SceneAsset | null {
    const cc = this.cc;
    if (!cc?.deserialize) {
      console.error('[EditorBundle] deserialize not available');
      return null;
    }

    try {
      const details = this.getDetails();
      if (details.init) details.init();

      const asset = cc.deserialize(json, details) as SceneAsset;

      if (sceneUuid && asset) {
        asset._uuid = sceneUuid;
      }

      if (details.uuidList && details.uuidObjList && details.uuidPropList) {
        this.resolveSceneDependencies(details);
      }

      if (details.reset) details.reset();

      return asset;
    } catch (error) {
      console.error('[EditorBundle] Deserialize failed:', error);
      return null;
    }
  }

  /**
   * @zh 获取反序列化详情对象
   * @en Get deserialize details object
   */
  private getDetails(): Details {
    const cc = this.cc;
    const deserializeModule = cc.deserialize as {
      Details?: { pool?: { get?: () => Details } };
    };
    return deserializeModule.Details?.pool?.get?.() || {};
  }

  /**
   * @zh 解析场景依赖
   * @en Resolve scene dependencies
   */
  private resolveSceneDependencies(details: Details): void {
    const cc = this.cc;
    if (!cc?.assetManager?.assets) return;

    const uuidList = details.uuidList || [];
    const objList = details.uuidObjList || [];
    const propList = details.uuidPropList || [];

    for (let i = 0; i < uuidList.length; i++) {
      const uuid = uuidList[i];
      const obj = objList[i] as Record<string, unknown>;
      const prop = propList[i];

      if (!obj || !prop || !uuid || typeof uuid !== 'string') continue;

      const dependAsset = cc.assetManager.assets.get(uuid);
      if (dependAsset) {
        obj[prop] = dependAsset;
        if (typeof (dependAsset as Asset).addRef === 'function') {
          (dependAsset as Asset).addRef!();
        }
      }
    }
  }
}

let instance: EditorBundle | null = null;

export function getEditorBundle(): EditorBundle {
  if (!instance) {
    instance = new EditorBundle();
  }
  return instance;
}
