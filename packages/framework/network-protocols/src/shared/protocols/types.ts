/**
 * 共享类型定义
 * Shared type definitions
 */

/**
 * 二维向量
 * 2D Vector
 */
export interface Vec2 {
    x: number;
    y: number;
}

/**
 * 实体状态
 * Entity state
 */
export interface IEntityState {
    /** 网络 ID | Network ID */
    netId: number;
    /** 位置 | Position */
    pos?: Vec2;
    /** 旋转角度（弧度）| Rotation (radians) */
    rot?: number;
}

/**
 * 玩家输入
 * Player input
 */
export interface IPlayerInput {
    /** 帧号 | Frame number */
    frame: number;
    /** 移动方向 | Move direction */
    moveDir?: Vec2;
    /** 动作列表 | Action list */
    actions?: string[];
}
