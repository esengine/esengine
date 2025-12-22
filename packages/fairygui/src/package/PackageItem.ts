import { EPackageItemType, EObjectType } from '../core/FieldTypes';
import type { UIPackage } from './UIPackage';
import type { ByteBuffer } from '../utils/ByteBuffer';

/**
 * PackageItem
 *
 * Represents a resource item in a UI package.
 *
 * 表示 UI 包中的资源项
 */
export class PackageItem {
    /** Owner package | 所属包 */
    public owner: UIPackage | null = null;

    /** Item type | 项目类型 */
    public type: EPackageItemType = EPackageItemType.Unknown;

    /** Object type | 对象类型 */
    public objectType: EObjectType = EObjectType.Image;

    /** Item ID | 项目 ID */
    public id: string = '';

    /** Item name | 项目名称 */
    public name: string = '';

    /** Width | 宽度 */
    public width: number = 0;

    /** Height | 高度 */
    public height: number = 0;

    /** File path | 文件路径 */
    public file: string = '';

    /** Is exported | 是否导出 */
    public exported: boolean = false;

    // Image specific | 图像相关
    /** Scale9 grid | 九宫格 */
    public scale9Grid: { x: number; y: number; width: number; height: number } | null = null;

    /** Scale by tile | 平铺缩放 */
    public scaleByTile: boolean = false;

    /** Tile grid indent | 平铺网格缩进 */
    public tileGridIndice: number = 0;

    // MovieClip specific | 动画相关
    /** Frame delay | 帧延迟 */
    public interval: number = 0;

    /** Repeat delay | 重复延迟 */
    public repeatDelay: number = 0;

    /** Swing | 摇摆 */
    public swing: boolean = false;

    // Sound specific | 音频相关
    /** Volume | 音量 */
    public volume: number = 1;

    // Component specific | 组件相关
    /** Raw data (ByteBuffer for parsed data) | 原始数据 */
    public rawData: ByteBuffer | null = null;

    /** Branch index | 分支索引 */
    public branches: string[] | null = null;

    /** High resolution | 高分辨率 */
    public highResolution: string[] | null = null;

    // Loaded content | 加载的内容
    /** Loaded texture | 加载的纹理 */
    public texture: any = null;

    /** Loaded frames | 加载的帧 */
    public frames: any[] | null = null;

    /** Loaded font | 加载的字体 */
    public bitmapFont: any = null;

    /** Loading flag | 加载中标记 */
    public loading: boolean = false;

    /** Decoded flag | 已解码标记 */
    public decoded: boolean = false;

    /**
     * Get full path
     * 获取完整路径
     */
    public toString(): string {
        return this.owner ? `${this.owner.name}/${this.name}` : this.name;
    }

    /**
     * Get branch version of this item
     * 获取此项目的分支版本
     */
    public getBranch(): PackageItem {
        if (this.branches && this.branches.length > 0 && this.owner) {
            const branchName = this.owner.constructor.name === 'UIPackage'
                ? (this.owner as any).constructor.branch
                : '';
            if (branchName) {
                const branchIndex = this.branches.indexOf(branchName);
                if (branchIndex >= 0) {
                    const branchItem = this.owner.getItemById(this.branches[branchIndex]);
                    if (branchItem) return branchItem;
                }
            }
        }
        return this;
    }

    /**
     * Get high resolution version of this item
     * 获取此项目的高分辨率版本
     */
    public getHighResolution(): PackageItem {
        if (this.highResolution && this.highResolution.length > 0 && this.owner) {
            // For now, return first high res version if available
            const hiResItem = this.owner.getItemById(this.highResolution[0]);
            if (hiResItem) return hiResItem;
        }
        return this;
    }

    /**
     * Load this item's content
     * 加载此项目的内容
     */
    public load(): void {
        if (this.loading || this.decoded) return;

        this.loading = true;

        // Loading is typically done by the package
        // This is a placeholder for async loading
        if (this.owner) {
            this.owner.getItemAsset(this);
        }

        this.loading = false;
        this.decoded = true;
    }
}
