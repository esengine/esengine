/**
 * @zh 定点数快照缓冲区
 * @en Fixed-point Snapshot Buffer
 *
 * @zh 用于帧同步确定性计算的快照缓冲区
 * @en Snapshot buffer for deterministic lockstep calculations
 */

import { Fixed32 } from '@esengine/ecs-framework-math';

// =============================================================================
// 定点数快照接口 | Fixed Snapshot Interfaces
// =============================================================================

/**
 * @zh 定点数状态快照
 * @en Fixed-point state snapshot
 */
export interface IFixedStateSnapshot<T> {
    /**
     * @zh 帧号（定点数时间戳）
     * @en Frame number (fixed-point timestamp)
     */
    readonly frame: number;

    /**
     * @zh 状态数据
     * @en State data
     */
    readonly state: T;
}

/**
 * @zh 定点数快照缓冲区配置
 * @en Fixed-point snapshot buffer configuration
 */
export interface IFixedSnapshotBufferConfig {
    /**
     * @zh 最大快照数量
     * @en Maximum snapshot count
     */
    maxSize: number;

    /**
     * @zh 插值延迟帧数
     * @en Interpolation delay in frames
     */
    interpolationDelayFrames: number;
}

/**
 * @zh 插值结果
 * @en Interpolation result
 */
export interface IFixedInterpolationResult<T> {
    /**
     * @zh 前一个快照
     * @en Previous snapshot
     */
    readonly from: IFixedStateSnapshot<T>;

    /**
     * @zh 后一个快照
     * @en Next snapshot
     */
    readonly to: IFixedStateSnapshot<T>;

    /**
     * @zh 插值因子 (0-1)
     * @en Interpolation factor (0-1)
     */
    readonly t: Fixed32;
}

// =============================================================================
// 定点数快照缓冲区实现 | Fixed Snapshot Buffer Implementation
// =============================================================================

/**
 * @zh 定点数快照缓冲区
 * @en Fixed-point snapshot buffer
 *
 * @zh 使用帧号而非毫秒时间戳，确保跨平台确定性
 * @en Uses frame numbers instead of millisecond timestamps for cross-platform determinism
 */
export class FixedSnapshotBuffer<T> {
    private readonly _buffer: IFixedStateSnapshot<T>[] = [];
    private readonly _maxSize: number;
    private readonly _interpolationDelayFrames: number;

    constructor(config: IFixedSnapshotBufferConfig) {
        this._maxSize = config.maxSize;
        this._interpolationDelayFrames = config.interpolationDelayFrames;
    }

    /**
     * @zh 获取缓冲区大小
     * @en Get buffer size
     */
    get size(): number {
        return this._buffer.length;
    }

    /**
     * @zh 获取插值延迟帧数
     * @en Get interpolation delay in frames
     */
    get interpolationDelayFrames(): number {
        return this._interpolationDelayFrames;
    }

    /**
     * @zh 添加快照
     * @en Add snapshot
     *
     * @param snapshot - @zh 状态快照 @en State snapshot
     */
    push(snapshot: IFixedStateSnapshot<T>): void {
        let insertIndex = this._buffer.length;
        for (let i = this._buffer.length - 1; i >= 0; i--) {
            if (this._buffer[i].frame <= snapshot.frame) {
                insertIndex = i + 1;
                break;
            }
            if (i === 0) {
                insertIndex = 0;
            }
        }

        this._buffer.splice(insertIndex, 0, snapshot);

        while (this._buffer.length > this._maxSize) {
            this._buffer.shift();
        }
    }

    /**
     * @zh 根据帧号获取插值快照
     * @en Get interpolation snapshots by frame number
     *
     * @param currentFrame - @zh 当前帧号 @en Current frame number
     * @returns @zh 插值结果（包含定点数插值因子）或 null @en Interpolation result with fixed-point factor or null
     */
    getInterpolationSnapshots(currentFrame: number): IFixedInterpolationResult<T> | null {
        if (this._buffer.length < 2) {
            return null;
        }

        const targetFrame = currentFrame - this._interpolationDelayFrames;

        for (let i = 0; i < this._buffer.length - 1; i++) {
            const prev = this._buffer[i];
            const next = this._buffer[i + 1];

            if (prev.frame <= targetFrame && next.frame >= targetFrame) {
                const duration = next.frame - prev.frame;
                let t: Fixed32;
                if (duration > 0) {
                    const elapsed = targetFrame - prev.frame;
                    t = Fixed32.from(elapsed).div(Fixed32.from(duration));
                    t = Fixed32.clamp(t, Fixed32.ZERO, Fixed32.ONE);
                } else {
                    t = Fixed32.ZERO;
                }
                return { from: prev, to: next, t };
            }
        }

        if (targetFrame > this._buffer[this._buffer.length - 1].frame) {
            const prev = this._buffer[this._buffer.length - 2];
            const next = this._buffer[this._buffer.length - 1];
            const duration = next.frame - prev.frame;
            let t: Fixed32;
            if (duration > 0) {
                const elapsed = targetFrame - prev.frame;
                t = Fixed32.from(elapsed).div(Fixed32.from(duration));
                t = Fixed32.min(t, Fixed32.from(2));
            } else {
                t = Fixed32.ONE;
            }
            return { from: prev, to: next, t };
        }

        return null;
    }

    /**
     * @zh 根据精确帧时间获取插值快照（支持子帧插值）
     * @en Get interpolation snapshots by precise frame time (supports sub-frame interpolation)
     *
     * @param frameTime - @zh 精确帧时间（定点数）@en Precise frame time (fixed-point)
     * @returns @zh 插值结果或 null @en Interpolation result or null
     */
    getInterpolationSnapshotsFixed(frameTime: Fixed32): IFixedInterpolationResult<T> | null {
        if (this._buffer.length < 2) {
            return null;
        }

        const targetFrame = frameTime.sub(Fixed32.from(this._interpolationDelayFrames));

        for (let i = 0; i < this._buffer.length - 1; i++) {
            const prev = this._buffer[i];
            const next = this._buffer[i + 1];
            const prevFrame = Fixed32.from(prev.frame);
            const nextFrame = Fixed32.from(next.frame);

            if (prevFrame.le(targetFrame) && nextFrame.ge(targetFrame)) {
                const duration = nextFrame.sub(prevFrame);
                let t: Fixed32;
                if (duration.gt(Fixed32.ZERO)) {
                    t = targetFrame.sub(prevFrame).div(duration);
                    t = Fixed32.clamp(t, Fixed32.ZERO, Fixed32.ONE);
                } else {
                    t = Fixed32.ZERO;
                }
                return { from: prev, to: next, t };
            }
        }

        const lastFrame = Fixed32.from(this._buffer[this._buffer.length - 1].frame);
        if (targetFrame.gt(lastFrame)) {
            const prev = this._buffer[this._buffer.length - 2];
            const next = this._buffer[this._buffer.length - 1];
            const prevFrame = Fixed32.from(prev.frame);
            const nextFrame = Fixed32.from(next.frame);
            const duration = nextFrame.sub(prevFrame);
            let t: Fixed32;
            if (duration.gt(Fixed32.ZERO)) {
                t = targetFrame.sub(prevFrame).div(duration);
                t = Fixed32.min(t, Fixed32.from(2));
            } else {
                t = Fixed32.ONE;
            }
            return { from: prev, to: next, t };
        }

        return null;
    }

    /**
     * @zh 获取最新快照
     * @en Get latest snapshot
     */
    getLatest(): IFixedStateSnapshot<T> | null {
        return this._buffer.length > 0 ? this._buffer[this._buffer.length - 1] : null;
    }

    /**
     * @zh 获取特定帧号的快照
     * @en Get snapshot at specific frame
     */
    getAtFrame(frame: number): IFixedStateSnapshot<T> | null {
        for (const snapshot of this._buffer) {
            if (snapshot.frame === frame) {
                return snapshot;
            }
        }
        return null;
    }

    /**
     * @zh 获取特定帧号之后的所有快照
     * @en Get all snapshots after specific frame
     */
    getSnapshotsAfter(frame: number): IFixedStateSnapshot<T>[] {
        return this._buffer.filter(s => s.frame > frame);
    }

    /**
     * @zh 移除指定帧号之前的所有快照
     * @en Remove all snapshots before specific frame
     */
    removeSnapshotsBefore(frame: number): void {
        while (this._buffer.length > 0 && this._buffer[0].frame < frame) {
            this._buffer.shift();
        }
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
 * @zh 创建定点数快照缓冲区
 * @en Create fixed-point snapshot buffer
 *
 * @param maxSize - @zh 最大快照数量（默认 30）@en Maximum snapshot count (default 30)
 * @param interpolationDelayFrames - @zh 插值延迟帧数（默认 2）@en Interpolation delay frames (default 2)
 */
export function createFixedSnapshotBuffer<T>(
    maxSize: number = 30,
    interpolationDelayFrames: number = 2
): FixedSnapshotBuffer<T> {
    return new FixedSnapshotBuffer<T>({ maxSize, interpolationDelayFrames });
}
