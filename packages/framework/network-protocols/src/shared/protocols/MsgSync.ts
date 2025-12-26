/**
 * 状态同步消息
 * State sync message
 */

import type { IEntityState } from './types';

export interface MsgSync {
    /** 服务器时间戳 | Server timestamp */
    time: number;
    /** 实体状态列表 | Entity state list */
    entities: IEntityState[];
}
