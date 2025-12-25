/**
 * @zh 快照缓冲区实现
 * @en Snapshot Buffer Implementation
 *
 * @zh 用于存储和插值网络状态快照
 * @en Stores and interpolates network state snapshots
 */

import type { IStateSnapshot, ISnapshotBuffer, ISnapshotBufferConfig } from './IStateSnapshot';

// =============================================================================
// 快照缓冲区实现 | Snapshot Buffer Implementation
// =============================================================================

/**
 * @zh 快照缓冲区
 * @en Snapshot buffer
 */
export class SnapshotBuffer<T> implements ISnapshotBuffer<T> {
    private readonly _buffer: IStateSnapshot<T>[] = [];
    private readonly _maxSize: number;
    private readonly _interpolationDelay: number;

    constructor(config: ISnapshotBufferConfig) {
        this._maxSize = config.maxSize;
        this._interpolationDelay = config.interpolationDelay;
    }

    get size(): number {
        return this._buffer.length;
    }

    /**
     * @zh 获取插值延迟
     * @en Get interpolation delay
     */
    get interpolationDelay(): number {
        return this._interpolationDelay;
    }

    /**
     * @zh 添加快照
     * @en Add snapshot
     */
    push(snapshot: IStateSnapshot<T>): void {
        // Insert in sorted order by timestamp
        let insertIndex = this._buffer.length;
        for (let i = this._buffer.length - 1; i >= 0; i--) {
            if (this._buffer[i].timestamp <= snapshot.timestamp) {
                insertIndex = i + 1;
                break;
            }
            if (i === 0) {
                insertIndex = 0;
            }
        }

        this._buffer.splice(insertIndex, 0, snapshot);

        // Remove old snapshots if buffer is full
        while (this._buffer.length > this._maxSize) {
            this._buffer.shift();
        }
    }

    /**
     * @zh 获取用于插值的两个快照
     * @en Get two snapshots for interpolation
     */
    getInterpolationSnapshots(renderTime: number): [IStateSnapshot<T>, IStateSnapshot<T>, number] | null {
        if (this._buffer.length < 2) {
            return null;
        }

        // Apply interpolation delay
        const targetTime = renderTime - this._interpolationDelay;

        // Find the two snapshots that bracket the target time
        for (let i = 0; i < this._buffer.length - 1; i++) {
            const prev = this._buffer[i];
            const next = this._buffer[i + 1];

            if (prev.timestamp <= targetTime && next.timestamp >= targetTime) {
                const duration = next.timestamp - prev.timestamp;
                const t = duration > 0 ? (targetTime - prev.timestamp) / duration : 0;
                return [prev, next, Math.max(0, Math.min(1, t))];
            }
        }

        // If target time is beyond buffer, extrapolate from last two snapshots
        if (targetTime > this._buffer[this._buffer.length - 1].timestamp) {
            const prev = this._buffer[this._buffer.length - 2];
            const next = this._buffer[this._buffer.length - 1];
            const duration = next.timestamp - prev.timestamp;
            const t = duration > 0 ? (targetTime - prev.timestamp) / duration : 1;
            // Clamp extrapolation to prevent wild values
            return [prev, next, Math.min(t, 2)];
        }

        // Target time is before buffer start
        return null;
    }

    /**
     * @zh 获取最新快照
     * @en Get latest snapshot
     */
    getLatest(): IStateSnapshot<T> | null {
        return this._buffer.length > 0 ? this._buffer[this._buffer.length - 1] : null;
    }

    /**
     * @zh 获取特定时间之后的所有快照
     * @en Get all snapshots after a specific time
     */
    getSnapshotsAfter(timestamp: number): IStateSnapshot<T>[] {
        return this._buffer.filter(s => s.timestamp > timestamp);
    }

    /**
     * @zh 清空缓冲区
     * @en Clear buffer
     */
    clear(): void {
        this._buffer.length = 0;
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建快照缓冲区
 * @en Create snapshot buffer
 *
 * @param maxSize - @zh 最大快照数量（默认 30）@en Maximum snapshot count (default 30)
 * @param interpolationDelay - @zh 插值延迟毫秒（默认 100）@en Interpolation delay in ms (default 100)
 */
export function createSnapshotBuffer<T>(
    maxSize: number = 30,
    interpolationDelay: number = 100
): SnapshotBuffer<T> {
    return new SnapshotBuffer<T>({ maxSize, interpolationDelay });
}
