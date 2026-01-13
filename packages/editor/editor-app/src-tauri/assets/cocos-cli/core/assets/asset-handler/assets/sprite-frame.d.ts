import { AssetHandler } from '../../@types/protected';
export declare const SpriteFrameHandler: AssetHandler;
export default SpriteFrameHandler;
export interface TrimOptions {
    width: number;
    height: number;
    trimX: number;
    trimY: number;
    rotated: boolean;
}
export declare function trimImage(source: string, dest: string, options: TrimOptions): Promise<any>;
