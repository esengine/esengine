/**
 * 加入房间 API
 * Join room API
 */

/**
 * 加入请求
 * Join request
 */
export interface ReqJoin {
    /** 玩家名称 | Player name */
    playerName: string;
    /** 房间 ID（可选，不传则自动匹配）| Room ID (optional, auto-match if not provided) */
    roomId?: string;
}

/**
 * 加入响应
 * Join response
 */
export interface ResJoin {
    /** 分配的客户端 ID | Assigned client ID */
    clientId: number;
    /** 房间 ID | Room ID */
    roomId: string;
    /** 房间当前玩家数 | Current player count in room */
    playerCount: number;
}
