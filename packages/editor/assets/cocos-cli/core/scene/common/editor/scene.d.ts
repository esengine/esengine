import type { INode } from '../node';
import type { IComponentIdentifier } from '../component';
import type { IBaseIdentifier } from './base';
import { IPrefabInfo } from '../prefab';
/**
 * 场景信息
 */
export interface IScene extends IBaseIdentifier {
    name: string;
    prefab: IPrefabInfo | null;
    children: INode[];
    components: IComponentIdentifier[];
}
