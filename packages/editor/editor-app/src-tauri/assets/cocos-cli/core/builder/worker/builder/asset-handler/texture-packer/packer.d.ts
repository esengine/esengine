import { SpriteFrameInfo } from './pac-info';
import { IInternalPackOptions, IPackResult } from '../../../../@types/protected';
export declare function packer(spriteFrameInfos: SpriteFrameInfo[], packOptions: IInternalPackOptions): Promise<IPackResult>;
