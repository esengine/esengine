import { PackageItem } from './PackageItem';
import { EPackageItemType, EObjectType } from '../core/FieldTypes';
import { UIObjectFactory } from '../core/UIObjectFactory';
import { ByteBuffer } from '../utils/ByteBuffer';
import type { GObject } from '../core/GObject';

/** FairyGUI package file magic number | FairyGUI 包文件魔数 */
const PACKAGE_MAGIC = 0x46475549; // 'FGUI'

/** Package dependency | 包依赖 */
interface IPackageDependency {
    id: string;
    name: string;
}

/** Atlas sprite info | 图集精灵信息 */
interface IAtlasSprite {
    atlas: PackageItem;
    rect: { x: number; y: number; width: number; height: number };
    offset: { x: number; y: number };
    originalSize: { x: number; y: number };
    rotated: boolean;
}

/**
 * UIPackage
 *
 * Represents a FairyGUI package (.fui file).
 * Manages loading and accessing package resources.
 *
 * 表示 FairyGUI 包（.fui 文件），管理包资源的加载和访问
 */
export class UIPackage {
    /** Package ID | 包 ID */
    public id: string = '';

    /** Package name | 包名称 */
    public name: string = '';

    /** Package URL | 包 URL */
    public url: string = '';

    /** Is constructing | 正在构造中 */
    public static _constructing: number = 0;

    private _items: PackageItem[] = [];
    private _itemsById: Map<string, PackageItem> = new Map();
    private _itemsByName: Map<string, PackageItem> = new Map();
    private _sprites: Map<string, IAtlasSprite> = new Map();
    private _dependencies: IPackageDependency[] = [];
    private _branches: string[] = [];
    private _branchIndex: number = -1;
    private _resKey: string = '';

    private static _packages: Map<string, UIPackage> = new Map();
    private static _packagesByUrl: Map<string, UIPackage> = new Map();
    private static _branch: string = '';
    private static _vars: Map<string, string> = new Map();

    /**
     * Get branch name
     * 获取分支名称
     */
    public static get branch(): string {
        return UIPackage._branch;
    }

    /**
     * Set branch name
     * 设置分支名称
     */
    public static set branch(value: string) {
        UIPackage._branch = value;
        for (const pkg of UIPackage._packages.values()) {
            if (pkg._branches.length > 0) {
                pkg._branchIndex = pkg._branches.indexOf(value);
            }
        }
    }

    /**
     * Get variable
     * 获取变量
     */
    public static getVar(key: string): string | undefined {
        return UIPackage._vars.get(key);
    }

    /**
     * Set variable
     * 设置变量
     */
    public static setVar(key: string, value: string): void {
        UIPackage._vars.set(key, value);
    }

    /**
     * Get package by ID
     * 通过 ID 获取包
     */
    public static getById(id: string): UIPackage | null {
        return UIPackage._packages.get(id) || null;
    }

    /**
     * Get package by ID (instance method wrapper)
     * 通过 ID 获取包（实例方法包装器）
     */
    public getPackageById(id: string): UIPackage | null {
        return UIPackage.getById(id);
    }

    /**
     * Get package by name
     * 通过名称获取包
     */
    public static getByName(name: string): UIPackage | null {
        for (const pkg of UIPackage._packages.values()) {
            if (pkg.name === name) {
                return pkg;
            }
        }
        return null;
    }

    /**
     * Add package from binary data
     * 从二进制数据添加包
     */
    public static addPackageFromBuffer(resKey: string, descData: ArrayBuffer): UIPackage {
        const buffer = new ByteBuffer(descData);
        const pkg = new UIPackage();
        pkg._resKey = resKey;
        pkg.loadPackage(buffer);

        UIPackage._packages.set(pkg.id, pkg);
        UIPackage._packages.set(resKey, pkg);
        return pkg;
    }

    /**
     * Add a loaded package
     * 添加已加载的包
     */
    public static addPackage(pkg: UIPackage): void {
        UIPackage._packages.set(pkg.id, pkg);
        if (pkg.url) {
            UIPackage._packagesByUrl.set(pkg.url, pkg);
        }
    }

    /**
     * Remove a package
     * 移除包
     */
    public static removePackage(idOrName: string): void {
        let pkg: UIPackage | null | undefined = UIPackage._packages.get(idOrName);
        if (!pkg) {
            pkg = UIPackage.getByName(idOrName);
        }
        if (pkg) {
            UIPackage._packages.delete(pkg.id);
            UIPackage._packages.delete(pkg._resKey);
            if (pkg.url) {
                UIPackage._packagesByUrl.delete(pkg.url);
            }
            pkg.dispose();
        }
    }

    /**
     * Create object from URL
     * 从 URL 创建对象
     */
    public static createObject(pkgName: string, resName: string): GObject | null {
        const pkg = UIPackage.getByName(pkgName);
        if (pkg) {
            return pkg.createObject(resName);
        }
        return null;
    }

    /**
     * Create object from URL string
     * 从 URL 字符串创建对象
     */
    public static createObjectFromURL(url: string): GObject | null {
        const pi = UIPackage.getItemByURL(url);
        if (pi) {
            return pi.owner?.internalCreateObject(pi) ?? null;
        }
        return null;
    }

    /**
     * Get item by URL
     * 通过 URL 获取项
     */
    public static getItemByURL(url: string): PackageItem | null {
        if (!url) return null;

        // URL format: ui://pkgName/resName or ui://pkgId/resId
        const pos = url.indexOf('//');
        if (pos === -1) return null;

        const pos2 = url.indexOf('/', pos + 2);
        if (pos2 === -1) {
            if (url.length > 13) {
                const pkgId = url.substring(5, 13);
                const pkg = UIPackage.getById(pkgId);
                if (pkg) {
                    const srcId = url.substring(13);
                    return pkg.getItemById(srcId);
                }
            }
        } else {
            const pkgName = url.substring(pos + 2, pos2);
            const pkg = UIPackage.getByName(pkgName);
            if (pkg) {
                const resName = url.substring(pos2 + 1);
                return pkg.getItemByName(resName);
            }
        }

        return null;
    }

    /**
     * Get item asset by URL
     * 通过 URL 获取项资源
     */
    public static getItemAssetByURL(url: string): any {
        const pi = UIPackage.getItemByURL(url);
        if (pi) {
            return pi.owner?.getItemAsset(pi);
        }
        return null;
    }

    /**
     * Normalize URL
     * 标准化 URL
     */
    public static normalizeURL(url: string): string {
        if (!url) return '';
        if (url.startsWith('ui://')) return url;
        return 'ui://' + url;
    }

    /**
     * Get item URL
     * 获取项目 URL
     */
    public static getItemURL(pkgName: string, resName: string): string | null {
        const pkg = UIPackage.getByName(pkgName);
        if (!pkg) return null;

        const pi = pkg.getItemByName(resName);
        if (!pi) return null;

        return 'ui://' + pkg.id + pi.id;
    }

    // Instance methods | 实例方法

    /**
     * Load package from buffer
     * 从缓冲区加载包
     */
    private loadPackage(buffer: ByteBuffer): void {
        if (buffer.getUint32() !== PACKAGE_MAGIC) {
            throw new Error('FairyGUI: invalid package format in \'' + this._resKey + '\'');
        }

        buffer.version = buffer.getInt32();
        const compressed = buffer.readBool();
        this.id = buffer.readUTFString();
        this.name = buffer.readUTFString();
        buffer.skip(20);

        // Handle compressed data
        if (compressed) {
            // Note: Compression requires pako or similar library
            // For now, we'll throw an error if the package is compressed
            throw new Error('FairyGUI: compressed packages are not supported yet');
        }

        const ver2 = buffer.version >= 2;
        const indexTablePos = buffer.pos;

        // Read string table
        buffer.seek(indexTablePos, 4);
        const strCount = buffer.getInt32();
        const stringTable: string[] = [];
        for (let i = 0; i < strCount; i++) {
            stringTable[i] = buffer.readUTFString();
        }
        buffer.stringTable = stringTable;

        // Read custom strings (version 2+)
        if (buffer.seek(indexTablePos, 5)) {
            const customCount = buffer.readInt32();
            for (let i = 0; i < customCount; i++) {
                const index = buffer.readUint16();
                const len = buffer.readInt32();
                stringTable[index] = buffer.getCustomString(len);
            }
        }

        // Read dependencies
        buffer.seek(indexTablePos, 0);
        const depCount = buffer.getInt16();
        for (let i = 0; i < depCount; i++) {
            this._dependencies.push({
                id: buffer.readS(),
                name: buffer.readS()
            });
        }

        // Read branches (version 2+)
        let branchIncluded = false;
        if (ver2) {
            const branchCount = buffer.getInt16();
            if (branchCount > 0) {
                this._branches = buffer.readSArray(branchCount);
                if (UIPackage._branch) {
                    this._branchIndex = this._branches.indexOf(UIPackage._branch);
                }
                branchIncluded = true;
            }
        }

        // Read items
        buffer.seek(indexTablePos, 1);

        const path = this._resKey;
        const lastSlash = path.lastIndexOf('/');
        const shortPath = lastSlash === -1 ? '' : path.substring(0, lastSlash + 1);
        // Remove .fui extension for atlas base path (e.g., "assets/ui/Bag.fui" -> "assets/ui/Bag_")
        // 移除 .fui 扩展名用于图集基础路径
        const baseName = path.endsWith('.fui') ? path.slice(0, -4) : path;
        const basePath = baseName + '_';

        const itemCount = buffer.getUint16();
        for (let i = 0; i < itemCount; i++) {
            let nextPos = buffer.getInt32();
            nextPos += buffer.pos;

            const pi = new PackageItem();
            pi.owner = this;
            pi.type = buffer.readByte() as EPackageItemType;
            pi.id = buffer.readS();
            pi.name = buffer.readS();
            buffer.readS(); // path
            const file = buffer.readS();
            if (file) {
                pi.file = file;
            }
            buffer.readBool(); // exported
            pi.width = buffer.getInt32();
            pi.height = buffer.getInt32();

            switch (pi.type) {
                case EPackageItemType.Image: {
                    pi.objectType = EObjectType.Image;
                    const scaleOption = buffer.readByte();
                    if (scaleOption === 1) {
                        pi.scale9Grid = {
                            x: buffer.getInt32(),
                            y: buffer.getInt32(),
                            width: buffer.getInt32(),
                            height: buffer.getInt32()
                        };
                        pi.tileGridIndice = buffer.getInt32();
                    } else if (scaleOption === 2) {
                        pi.scaleByTile = true;
                    }
                    buffer.readBool(); // smoothing
                    break;
                }

                case EPackageItemType.MovieClip: {
                    buffer.readBool(); // smoothing
                    pi.objectType = EObjectType.MovieClip;
                    pi.rawData = buffer.readBuffer();
                    break;
                }

                case EPackageItemType.Font: {
                    pi.rawData = buffer.readBuffer();
                    break;
                }

                case EPackageItemType.Component: {
                    const extension = buffer.readByte();
                    if (extension > 0) {
                        pi.objectType = extension as EObjectType;
                    } else {
                        pi.objectType = EObjectType.Component;
                    }
                    pi.rawData = buffer.readBuffer();
                    UIObjectFactory.resolvePackageItemExtension(pi);
                    break;
                }

                case EPackageItemType.Atlas:
                case EPackageItemType.Sound:
                case EPackageItemType.Misc: {
                    pi.file = basePath + pi.file;
                    break;
                }

                case EPackageItemType.Spine:
                case EPackageItemType.DragonBones: {
                    pi.file = shortPath + pi.file;
                    buffer.getFloat32(); // skeletonAnchor.x
                    buffer.getFloat32(); // skeletonAnchor.y
                    break;
                }
            }

            // Version 2 specific
            if (ver2) {
                const branchStr = buffer.readS();
                if (branchStr) {
                    pi.name = branchStr + '/' + pi.name;
                }

                const branchCnt = buffer.getUint8();
                if (branchCnt > 0) {
                    if (branchIncluded) {
                        pi.branches = buffer.readSArray(branchCnt);
                    } else {
                        this._itemsById.set(buffer.readS(), pi);
                    }
                }

                const highResCnt = buffer.getUint8();
                if (highResCnt > 0) {
                    pi.highResolution = buffer.readSArray(highResCnt);
                }
            }

            this._items.push(pi);
            this._itemsById.set(pi.id, pi);
            if (pi.name) {
                this._itemsByName.set(pi.name, pi);
            }

            buffer.pos = nextPos;
        }

        // Read sprites
        buffer.seek(indexTablePos, 2);

        const spriteCount = buffer.getUint16();
        for (let i = 0; i < spriteCount; i++) {
            let nextPos = buffer.getUint16();
            nextPos += buffer.pos;

            const itemId = buffer.readS();
            const atlasItem = this._itemsById.get(buffer.readS());

            if (atlasItem) {
                const sprite: IAtlasSprite = {
                    atlas: atlasItem,
                    rect: {
                        x: buffer.getInt32(),
                        y: buffer.getInt32(),
                        width: buffer.getInt32(),
                        height: buffer.getInt32()
                    },
                    offset: { x: 0, y: 0 },
                    originalSize: { x: 0, y: 0 },
                    rotated: buffer.readBool()
                };

                if (ver2 && buffer.readBool()) {
                    sprite.offset.x = buffer.getInt32();
                    sprite.offset.y = buffer.getInt32();
                    sprite.originalSize.x = buffer.getInt32();
                    sprite.originalSize.y = buffer.getInt32();
                } else {
                    sprite.originalSize.x = sprite.rect.width;
                    sprite.originalSize.y = sprite.rect.height;
                }

                this._sprites.set(itemId, sprite);
            }

            buffer.pos = nextPos;
        }

        // Read hit test data (optional)
        if (buffer.seek(indexTablePos, 3)) {
            const hitTestCount = buffer.getUint16();
            for (let i = 0; i < hitTestCount; i++) {
                let nextPos = buffer.getInt32();
                nextPos += buffer.pos;

                const pi = this._itemsById.get(buffer.readS());
                if (pi && pi.type === EPackageItemType.Image) {
                    // PixelHitTestData would be loaded here
                    // For now we skip this
                }

                buffer.pos = nextPos;
            }
        }
    }

    /**
     * Get item by ID
     * 通过 ID 获取项
     */
    public getItemById(id: string): PackageItem | null {
        return this._itemsById.get(id) || null;
    }

    /**
     * Get item by name
     * 通过名称获取项
     */
    public getItemByName(name: string): PackageItem | null {
        return this._itemsByName.get(name) || null;
    }

    /**
     * Get all atlas file paths in this package
     * 获取此包中所有图集文件路径
     */
    public getAtlasFiles(): string[] {
        const files: string[] = [];
        for (const item of this._items) {
            if (item.type === EPackageItemType.Atlas && item.file) {
                files.push(item.file);
            }
        }
        return files;
    }

    /**
     * Get sprite by item ID
     * 通过项目 ID 获取精灵
     */
    public getSprite(itemId: string): IAtlasSprite | null {
        return this._sprites.get(itemId) || null;
    }

    /**
     * Get item asset
     * 获取项资源
     */
    public getItemAsset(item: PackageItem): any {
        switch (item.type) {
            case EPackageItemType.Image:
                if (!item.decoded) {
                    item.decoded = true;
                    const sprite = this._sprites.get(item.id);
                    if (sprite) {
                        // Store sprite info for rendering
                        // The atlas file path is used as texture ID
                        // Include atlas dimensions for UV calculation
                        item.texture = {
                            atlas: sprite.atlas.file,
                            atlasId: sprite.atlas.id,
                            rect: sprite.rect,
                            offset: sprite.offset,
                            originalSize: sprite.originalSize,
                            rotated: sprite.rotated,
                            atlasWidth: sprite.atlas.width,
                            atlasHeight: sprite.atlas.height
                        };
                    }
                }
                return item.texture;

            case EPackageItemType.Atlas:
                if (!item.decoded) {
                    item.decoded = true;
                    // Load atlas texture
                    // This would require asset loading infrastructure
                }
                return item.texture;

            case EPackageItemType.MovieClip:
                if (!item.decoded) {
                    item.decoded = true;
                    this.loadMovieClip(item);
                }
                return item.frames;

            case EPackageItemType.Font:
                if (!item.decoded) {
                    item.decoded = true;
                    this.loadFont(item);
                }
                return item.bitmapFont;

            case EPackageItemType.Component:
                return item.rawData;

            default:
                return null;
        }
    }

    /**
     * Load movie clip data
     * 加载动画片段数据
     */
    private loadMovieClip(item: PackageItem): void {
        const buffer = item.rawData as ByteBuffer;
        if (!buffer) return;

        buffer.seek(0, 0);

        item.interval = buffer.getInt32();
        item.swing = buffer.readBool();
        item.repeatDelay = buffer.getInt32();

        buffer.seek(0, 1);

        const frameCount = buffer.getInt16();
        item.frames = [];

        for (let i = 0; i < frameCount; i++) {
            let nextPos = buffer.getInt16();
            nextPos += buffer.pos;

            const fx = buffer.getInt32();
            const fy = buffer.getInt32();
            buffer.getInt32(); // width
            buffer.getInt32(); // height
            const addDelay = buffer.getInt32();
            const spriteId = buffer.readS();

            const frame: any = { addDelay, texture: null };

            if (spriteId) {
                const sprite = this._sprites.get(spriteId);
                if (sprite) {
                    // Create texture from sprite with atlas info for UV calculation
                    // 从 sprite 创建纹理信息，包含用于 UV 计算的图集信息
                    frame.texture = {
                        atlas: sprite.atlas.file,
                        atlasId: sprite.atlas.id,
                        rect: sprite.rect,
                        offset: sprite.offset,
                        originalSize: sprite.originalSize,
                        rotated: sprite.rotated,
                        atlasWidth: sprite.atlas.width,
                        atlasHeight: sprite.atlas.height
                    };
                }
            }

            item.frames[i] = frame;
            buffer.pos = nextPos;
        }
    }

    /**
     * Load font data
     * 加载字体数据
     */
    private loadFont(item: PackageItem): void {
        const buffer = item.rawData as ByteBuffer;
        if (!buffer) return;

        buffer.seek(0, 0);

        const ttf = buffer.readBool();
        const tint = buffer.readBool();
        buffer.readBool(); // autoScaleSize
        buffer.readBool(); // has channel
        const fontSize = Math.max(buffer.getInt32(), 1);
        const xadvance = buffer.getInt32();
        const lineHeight = buffer.getInt32();

        const font: any = {
            ttf,
            tint,
            fontSize,
            lineHeight: Math.max(lineHeight, fontSize),
            glyphs: new Map()
        };

        buffer.seek(0, 1);

        const glyphCount = buffer.getInt32();
        for (let i = 0; i < glyphCount; i++) {
            let nextPos = buffer.getInt16();
            nextPos += buffer.pos;

            const ch = buffer.getUint16();
            const glyph: any = {};

            const img = buffer.readS();
            const bx = buffer.getInt32();
            const by = buffer.getInt32();
            glyph.x = buffer.getInt32();
            glyph.y = buffer.getInt32();
            glyph.width = buffer.getInt32();
            glyph.height = buffer.getInt32();
            glyph.advance = buffer.getInt32();
            buffer.readByte(); // channel

            if (!ttf && glyph.advance === 0) {
                glyph.advance = xadvance > 0 ? xadvance : glyph.x + glyph.width;
            }

            font.glyphs.set(ch, glyph);
            buffer.pos = nextPos;
        }

        item.bitmapFont = font;
    }

    /**
     * Create object from item name
     * 从项名称创建对象
     */
    public createObject(resName: string): GObject | null {
        const pi = this.getItemByName(resName);
        if (pi) {
            return this.internalCreateObject(pi);
        }
        console.warn(`[UIPackage] createObject: item not found: "${resName}" in package "${this.name}". Available items:`, Array.from(this._itemsByName.keys()));
        return null;
    }

    /**
     * Internal create object from package item
     * 从包资源项内部创建对象
     */
    public internalCreateObject(item: PackageItem): GObject | null {
        // Check for extension first
        const url = 'ui://' + this.id + item.id;
        if (UIObjectFactory.hasExtension(url)) {
            const obj = UIObjectFactory.createObjectFromURL(url);
            if (obj) {
                obj.packageItem = item;
                UIPackage._constructing++;
                obj.constructFromResource();
                UIPackage._constructing--;
                return obj;
            }
        }

        // Create object based on item type
        const obj = UIObjectFactory.createObject(item.objectType);
        if (obj) {
            obj.packageItem = item;
            UIPackage._constructing++;
            obj.constructFromResource();
            UIPackage._constructing--;
        }
        return obj;
    }

    /**
     * Create object asynchronously
     * 异步创建对象
     */
    public createObjectAsync(resName: string, callback: (obj: GObject | null) => void): void {
        const pi = this.getItemByName(resName);
        if (pi) {
            this.internalCreateObjectAsync(pi, callback);
        } else {
            callback(null);
        }
    }

    /**
     * Internal create object asynchronously
     * 内部异步创建对象
     */
    public internalCreateObjectAsync(item: PackageItem, callback: (obj: GObject | null) => void): void {
        const obj = this.internalCreateObject(item);
        callback(obj);
    }

    /**
     * Get item URL
     * 获取项目 URL
     */
    public getItemUrl(item: PackageItem): string {
        return 'ui://' + this.id + item.id;
    }

    /**
     * Add item
     * 添加项
     */
    public addItem(item: PackageItem): void {
        item.owner = this;
        this._items.push(item);
        this._itemsById.set(item.id, item);
        this._itemsByName.set(item.name, item);
    }

    /**
     * Get all items
     * 获取所有项
     */
    public get items(): readonly PackageItem[] {
        return this._items;
    }

    /**
     * Get all exported component names
     * 获取所有导出的组件名称
     */
    public getExportedComponentNames(): string[] {
        return this._items
            .filter(item => item.type === EPackageItemType.Component && item.exported)
            .map(item => item.name);
    }

    /**
     * Get all component names (including non-exported)
     * 获取所有组件名称（包括未导出的）
     */
    public getAllComponentNames(): string[] {
        return this._items
            .filter(item => item.type === EPackageItemType.Component)
            .map(item => item.name);
    }

    /**
     * Get dependencies
     * 获取依赖
     */
    public get dependencies(): readonly IPackageDependency[] {
        return this._dependencies;
    }

    /**
     * Load all assets
     * 加载所有资源
     */
    public loadAllAssets(): void {
        for (const item of this._items) {
            this.getItemAsset(item);
        }
    }

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        for (const item of this._items) {
            item.owner = null;
            if (item.type === EPackageItemType.Atlas && item.texture) {
                // Dispose texture if needed
                item.texture = null;
            }
        }
        this._items.length = 0;
        this._itemsById.clear();
        this._itemsByName.clear();
        this._sprites.clear();
        this._dependencies.length = 0;
    }
}
