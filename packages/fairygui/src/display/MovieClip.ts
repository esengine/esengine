import { Image } from './Image';
import { Timer } from '../core/Timer';
import { FGUIEvents } from '../events/Events';
import type { IRenderCollector } from '../render/IRenderCollector';

/**
 * Frame data for movie clip animation
 * 动画帧数据
 */
export interface IFrame {
    /** Additional delay for this frame | 该帧额外延迟 */
    addDelay: number;
    /** Texture ID for this frame | 该帧的纹理 ID */
    texture?: string | number | null;
}

/**
 * Simple callback handler
 * 简单回调处理器
 */
export type SimpleHandler = (() => void) | { run: () => void };

/**
 * MovieClip
 *
 * Animated sprite display object with frame-based animation.
 *
 * 基于帧的动画精灵显示对象
 *
 * Features:
 * - Frame-by-frame animation
 * - Swing (ping-pong) mode
 * - Time scale control
 * - Play range and loop control
 */
export class MovieClip extends Image {
    /** Frame interval in milliseconds | 帧间隔（毫秒） */
    public interval: number = 0;

    /** Swing mode (ping-pong) | 摆动模式 */
    public swing: boolean = false;

    /** Delay between loops | 循环间延迟 */
    public repeatDelay: number = 0;

    /** Time scale multiplier | 时间缩放 */
    public timeScale: number = 1;

    private _playing: boolean = true;
    private _frameCount: number = 0;
    private _frames: IFrame[] = [];
    private _frame: number = 0;
    private _start: number = 0;
    private _end: number = 0;
    private _times: number = 0;
    private _endAt: number = 0;
    private _status: number = 0; // 0-none, 1-next loop, 2-ending, 3-ended

    private _frameElapsed: number = 0;
    private _reversed: boolean = false;
    private _repeatedCount: number = 0;
    private _endHandler: SimpleHandler | null = null;
    private _isOnStage: boolean = false;
    private _lastTime: number = 0;

    constructor() {
        super();
        this.touchable = false;
        this.setPlaySettings();

        // Subscribe to stage lifecycle events
        // 订阅舞台生命周期事件
        this.on(FGUIEvents.ADDED_TO_STAGE, this.onAddToStage, this);
        this.on(FGUIEvents.REMOVED_FROM_STAGE, this.onRemoveFromStage, this);
    }

    /**
     * Get animation frames
     * 获取动画帧
     */
    public get frames(): IFrame[] {
        return this._frames;
    }

    /**
     * Set animation frames
     * 设置动画帧
     */
    public set frames(value: IFrame[]) {
        this._frames = value;
        this.scaleByTile = false;
        this.scale9Grid = null;

        if (this._frames && this._frames.length > 0) {
            this._frameCount = this._frames.length;

            if (this._end === -1 || this._end > this._frameCount - 1) {
                this._end = this._frameCount - 1;
            }
            if (this._endAt === -1 || this._endAt > this._frameCount - 1) {
                this._endAt = this._frameCount - 1;
            }
            if (this._frame < 0 || this._frame > this._frameCount - 1) {
                this._frame = this._frameCount - 1;
            }

            this._frameElapsed = 0;
            this._repeatedCount = 0;
            this._reversed = false;
        } else {
            this._frameCount = 0;
        }

        this.drawFrame();
        this.checkTimer();
    }

    /**
     * Get frame count
     * 获取帧数
     */
    public get frameCount(): number {
        return this._frameCount;
    }

    /**
     * Get current frame index
     * 获取当前帧索引
     */
    public get frame(): number {
        return this._frame;
    }

    /**
     * Set current frame index
     * 设置当前帧索引
     */
    public set frame(value: number) {
        if (this._frame !== value) {
            if (this._frames && value >= this._frameCount) {
                value = this._frameCount - 1;
            }

            this._frame = value;
            this._frameElapsed = 0;
            this.drawFrame();
        }
    }

    /**
     * Get playing state
     * 获取播放状态
     */
    public get playing(): boolean {
        return this._playing;
    }

    /**
     * Set playing state
     * 设置播放状态
     */
    public set playing(value: boolean) {
        if (this._playing !== value) {
            this._playing = value;
            this.checkTimer();
        }
    }

    /**
     * Rewind to first frame
     * 倒回到第一帧
     */
    public rewind(): void {
        this._frame = 0;
        this._frameElapsed = 0;
        this._reversed = false;
        this._repeatedCount = 0;

        this.drawFrame();
    }

    /**
     * Sync status from another MovieClip
     * 从另一个 MovieClip 同步状态
     */
    public syncStatus(anotherMc: MovieClip): void {
        this._frame = anotherMc._frame;
        this._frameElapsed = anotherMc._frameElapsed;
        this._reversed = anotherMc._reversed;
        this._repeatedCount = anotherMc._repeatedCount;

        this.drawFrame();
    }

    /**
     * Advance animation by time
     * 推进动画时间
     *
     * @param timeInMilliseconds Time to advance | 推进时间（毫秒）
     */
    public advance(timeInMilliseconds: number): void {
        const beginFrame = this._frame;
        const beginReversed = this._reversed;
        const backupTime = timeInMilliseconds;

        while (true) {
            let tt = this.interval + this._frames[this._frame].addDelay;
            if (this._frame === 0 && this._repeatedCount > 0) {
                tt += this.repeatDelay;
            }
            if (timeInMilliseconds < tt) {
                this._frameElapsed = 0;
                break;
            }

            timeInMilliseconds -= tt;

            if (this.swing) {
                if (this._reversed) {
                    this._frame--;
                    if (this._frame <= 0) {
                        this._frame = 0;
                        this._repeatedCount++;
                        this._reversed = !this._reversed;
                    }
                } else {
                    this._frame++;
                    if (this._frame > this._frameCount - 1) {
                        this._frame = Math.max(0, this._frameCount - 2);
                        this._repeatedCount++;
                        this._reversed = !this._reversed;
                    }
                }
            } else {
                this._frame++;
                if (this._frame > this._frameCount - 1) {
                    this._frame = 0;
                    this._repeatedCount++;
                }
            }

            // Completed one round
            if (this._frame === beginFrame && this._reversed === beginReversed) {
                const roundTime = backupTime - timeInMilliseconds;
                timeInMilliseconds -= Math.floor(timeInMilliseconds / roundTime) * roundTime;
            }
        }

        this.drawFrame();
    }

    /**
     * Set play settings
     * 设置播放参数
     *
     * @param start Start frame | 开始帧
     * @param end End frame (-1 for last) | 结束帧（-1 为最后一帧）
     * @param times Loop times (0 for infinite) | 循环次数（0 为无限）
     * @param endAt Stop at frame (-1 for end) | 停止帧（-1 为结束帧）
     * @param endHandler Callback on end | 结束回调
     */
    public setPlaySettings(
        start: number = 0,
        end: number = -1,
        times: number = 0,
        endAt: number = -1,
        endHandler: SimpleHandler | null = null
    ): void {
        this._start = start;
        this._end = end;
        if (this._end === -1 || this._end > this._frameCount - 1) {
            this._end = this._frameCount - 1;
        }
        this._times = times;
        this._endAt = endAt;
        if (this._endAt === -1) {
            this._endAt = this._end;
        }
        this._status = 0;
        this._endHandler = endHandler;
        this.frame = start;
    }

    /**
     * Called when added to stage
     * 添加到舞台时调用
     */
    public onAddToStage(): void {
        this._isOnStage = true;
        this._lastTime = Timer.time;
        this.checkTimer();
    }

    /**
     * Called when removed from stage
     * 从舞台移除时调用
     */
    public onRemoveFromStage(): void {
        this._isOnStage = false;
        this.checkTimer();
    }

    /**
     * Update animation (called each frame)
     * 更新动画（每帧调用）
     */
    public update(): void {
        if (!this._playing || this._frameCount === 0 || this._status === 3) {
            return;
        }

        const currentTime = Timer.time;
        let dt = currentTime - this._lastTime;
        this._lastTime = currentTime;

        if (dt > 100) {
            dt = 100;
        }
        if (this.timeScale !== 1) {
            dt *= this.timeScale;
        }

        this._frameElapsed += dt;
        let tt = this.interval + this._frames[this._frame].addDelay;
        if (this._frame === 0 && this._repeatedCount > 0) {
            tt += this.repeatDelay;
        }
        if (this._frameElapsed < tt) {
            return;
        }

        this._frameElapsed -= tt;
        if (this._frameElapsed > this.interval) {
            this._frameElapsed = this.interval;
        }

        if (this.swing) {
            if (this._reversed) {
                this._frame--;
                if (this._frame <= 0) {
                    this._frame = 0;
                    this._repeatedCount++;
                    this._reversed = !this._reversed;
                }
            } else {
                this._frame++;
                if (this._frame > this._frameCount - 1) {
                    this._frame = Math.max(0, this._frameCount - 2);
                    this._repeatedCount++;
                    this._reversed = !this._reversed;
                }
            }
        } else {
            this._frame++;
            if (this._frame > this._frameCount - 1) {
                this._frame = 0;
                this._repeatedCount++;
            }
        }

        if (this._status === 1) {
            // New loop
            this._frame = this._start;
            this._frameElapsed = 0;
            this._status = 0;
        } else if (this._status === 2) {
            // Ending
            this._frame = this._endAt;
            this._frameElapsed = 0;
            this._status = 3; // Ended

            // Play end callback
            if (this._endHandler) {
                const handler = this._endHandler;
                this._endHandler = null;
                if (typeof handler === 'function') {
                    handler();
                } else {
                    handler.run();
                }
            }
        } else {
            if (this._frame === this._end) {
                if (this._times > 0) {
                    this._times--;
                    if (this._times === 0) {
                        this._status = 2; // Ending
                    } else {
                        this._status = 1; // New loop
                    }
                } else {
                    this._status = 1; // New loop
                }
            }
        }

        this.drawFrame();
    }

    private drawFrame(): void {
        if (this._frameCount > 0 && this._frame < this._frames.length) {
            const frame = this._frames[this._frame];
            this.texture = frame.texture ?? null;
        } else {
            this.texture = null;
        }
    }

    private checkTimer(): void {
        if (this._playing && this._frameCount > 0 && this._isOnStage) {
            Timer.add(this.update, this);
        } else {
            Timer.remove(this.update, this);
        }
    }

    public collectRenderData(collector: IRenderCollector): void {
        super.collectRenderData(collector);
    }
}
