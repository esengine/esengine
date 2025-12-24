/**
 * 生成实体消息
 * Spawn entity message
 */

import type { Vec2 } from './types';

export interface MsgSpawn {
    /** 网络 ID | Network ID */
    netId: number;
    /** 所有者客户端 ID | Owner client ID */
    ownerId: number;
    /** 预制体类型 | Prefab type */
    prefab: string;
    /** 初始位置 | Initial position */
    pos: Vec2;
    /** 初始旋转 | Initial rotation */
    rot: number;
}
