import { EPackageItemType, EObjectType } from '../core/FieldTypes';
import type { UIPackage } from './UIPackage';

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
    /** Raw data | 原始数据 */
    public rawData: ArrayBuffer | null = null;

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

    /**
     * Get full path
     * 获取完整路径
     */
    public toString(): string {
        return this.owner ? `${this.owner.name}/${this.name}` : this.name;
    }
}
