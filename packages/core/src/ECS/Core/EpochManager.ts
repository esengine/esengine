/**
 * 帧级变更检测管理器
 *
 * 基于 epoch（帧计数）的组件变更追踪系统。
 * 每帧递增 epoch，组件写入时记录当前 epoch，
 * 系统可以查询自上次检查以来发生变更的组件。
 *
 * Frame-level change detection manager.
 * Epoch-based component change tracking system.
 * Epoch increments each frame, components record current epoch on write,
 * systems can query components changed since last check.
 *
 * @example
 * ```typescript
 * // 在 System 中使用
 * class MovementSystem extends EntitySystem {
 *     private _lastEpoch = 0;
 *
 *     process(): void {
 *         const epoch = this.scene.epochManager;
 *
 *         // 只处理 Velocity 变化的实体
 *         for (const entity of this.entities) {
 *             const vel = entity.getComponent(Velocity);
 *             if (vel && vel.lastWriteEpoch > this._lastEpoch) {
 *                 // 处理变更
 *             }
 *         }
 *
 *         this._lastEpoch = epoch.current;
 *     }
 * }
 * ```
 */

/**
 * Epoch 管理器
 *
 * Epoch manager.
 */
export class EpochManager {
    /**
     * 当前 epoch 值
     *
     * 从 1 开始，0 表示"从未写入"。
     *
     * Current epoch value.
     * Starts from 1, 0 means "never written".
     */
    private _current: number = 1;

    /**
     * 获取当前 epoch
     *
     * Get current epoch.
     */
    public get current(): number {
        return this._current;
    }

    /**
     * 递增 epoch
     *
     * 应在每帧开始时调用。
     *
     * Increment epoch.
     * Should be called at the start of each frame.
     */
    public increment(): void {
        this._current++;

        // 处理溢出（虽然 2^53 帧基本不可能达到）
        // Handle overflow (though 2^53 frames is practically unreachable)
        if (this._current >= Number.MAX_SAFE_INTEGER) {
            this._current = 1;
        }
    }

    /**
     * 重置 epoch
     *
     * 在场景重置时调用。
     *
     * Reset epoch.
     * Called when scene is reset.
     */
    public reset(): void {
        this._current = 1;
    }

    /**
     * 检查给定 epoch 是否在指定 epoch 之后发生变更
     *
     * Check if given epoch is after the specified epoch (changed since).
     *
     * @param writeEpoch 写入时的 epoch | Epoch when written
     * @param sinceEpoch 检查点 epoch | Checkpoint epoch
     * @returns 是否在检查点之后发生变更 | Whether changed after checkpoint
     */
    public isChangedSince(writeEpoch: number, sinceEpoch: number): boolean {
        return writeEpoch > sinceEpoch;
    }
}
