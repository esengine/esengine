/**
 * Animation3DComponent - 3D animation playback component.
 * Animation3DComponent - 3D 动画播放组件。
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';
import type { IGLTFAnimationClip } from '@esengine/asset-system';

/**
 * Animation play state.
 * 动画播放状态。
 */
export enum AnimationPlayState {
    /** Stopped - not playing. | 停止 - 未播放。 */
    Stopped = 'stopped',
    /** Playing forward. | 正向播放。 */
    Playing = 'playing',
    /** Paused. | 暂停。 */
    Paused = 'paused'
}

/**
 * Animation wrap mode.
 * 动画循环模式。
 */
export enum AnimationWrapMode {
    /** Play once and stop. | 播放一次后停止。 */
    Once = 'once',
    /** Loop continuously. | 连续循环。 */
    Loop = 'loop',
    /** Play forward then backward (ping-pong). | 往返播放。 */
    PingPong = 'pingpong',
    /** Clamp to last frame. | 停在最后一帧。 */
    ClampForever = 'clampForever'
}

/**
 * 3D Animation component for playing skeletal/node animations.
 * 用于播放骨骼/节点动画的 3D 动画组件。
 *
 * Requires MeshComponent for animation data source.
 * 需要 MeshComponent 作为动画数据来源。
 */
@ECSComponent('Animation3D', { requires: ['Mesh'] })
@Serializable({ version: 1, typeId: 'Animation3D' })
export class Animation3DComponent extends Component {
    /**
     * 默认动画片段名称
     * Default animation clip name
     */
    @Serialize()
    @Property({ type: 'string', label: 'Default Clip' })
    public defaultClip: string = '';

    /**
     * 播放速度（1.0 = 正常速度）
     * Playback speed (1.0 = normal speed)
     */
    @Serialize()
    @Property({ type: 'number', label: 'Speed', min: 0, max: 10 })
    public speed: number = 1.0;

    /**
     * 循环模式
     * Wrap mode
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Wrap Mode',
        options: ['once', 'loop', 'pingpong', 'clampForever']
    })
    public wrapMode: AnimationWrapMode = AnimationWrapMode.Loop;

    /**
     * 是否启动时自动播放
     * Whether to auto-play on start
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Play On Awake' })
    public playOnAwake: boolean = true;

    // ===== Runtime State | 运行时状态 =====

    /**
     * 当前播放状态
     * Current play state
     */
    private _playState: AnimationPlayState = AnimationPlayState.Stopped;

    /**
     * 当前播放的动画片段
     * Currently playing animation clip
     */
    private _currentClip: IGLTFAnimationClip | null = null;

    /**
     * 当前播放时间（秒）
     * Current playback time (seconds)
     */
    private _currentTime: number = 0;

    /**
     * 播放方向（1 = 正向，-1 = 反向）
     * Playback direction (1 = forward, -1 = backward)
     */
    private _direction: number = 1;

    /**
     * 可用的动画片段列表
     * Available animation clips
     */
    private _clips: IGLTFAnimationClip[] = [];

    /**
     * 当前片段名称到索引的映射
     * Map of clip name to index
     */
    private _clipNameToIndex: Map<string, number> = new Map();

    // ===== Public Getters | 公共获取器 =====

    /**
     * 获取当前播放状态
     * Get current play state
     */
    public get playState(): AnimationPlayState {
        return this._playState;
    }

    /**
     * 获取当前播放的动画片段
     * Get currently playing clip
     */
    public get currentClip(): IGLTFAnimationClip | null {
        return this._currentClip;
    }

    /**
     * 获取当前播放时间
     * Get current playback time
     */
    public get currentTime(): number {
        return this._currentTime;
    }

    /**
     * 获取当前片段的持续时间
     * Get duration of current clip
     */
    public get duration(): number {
        return this._currentClip?.duration ?? 0;
    }

    /**
     * 获取归一化时间（0-1）
     * Get normalized time (0-1)
     */
    public get normalizedTime(): number {
        if (!this._currentClip || this._currentClip.duration <= 0) return 0;
        return this._currentTime / this._currentClip.duration;
    }

    /**
     * 是否正在播放
     * Whether playing
     */
    public get isPlaying(): boolean {
        return this._playState === AnimationPlayState.Playing;
    }

    /**
     * 获取所有可用的动画片段
     * Get all available clips
     */
    public get clips(): readonly IGLTFAnimationClip[] {
        return this._clips;
    }

    /**
     * 获取所有动画片段名称
     * Get all clip names
     */
    public get clipNames(): string[] {
        return this._clips.map(c => c.name);
    }

    // ===== Public Methods | 公共方法 =====

    /**
     * 设置动画片段列表（由 Animation3DSystem 调用）
     * Set animation clips (called by Animation3DSystem)
     */
    public setClips(clips: IGLTFAnimationClip[]): void {
        this._clips = clips;
        this._clipNameToIndex.clear();
        clips.forEach((clip, index) => {
            this._clipNameToIndex.set(clip.name, index);
        });
    }

    /**
     * 播放动画
     * Play animation
     *
     * @param clipName - 动画片段名称，不指定则播放当前/默认片段
     */
    public play(clipName?: string): void {
        const name = clipName ?? this.defaultClip ?? (this._clips[0]?.name ?? '');

        if (!name) {
            console.warn('[Animation3DComponent] No clip to play');
            return;
        }

        const index = this._clipNameToIndex.get(name);
        if (index === undefined) {
            console.warn(`[Animation3DComponent] Clip not found: ${name}`);
            return;
        }

        this._currentClip = this._clips[index];
        this._currentTime = 0;
        this._direction = 1;
        this._playState = AnimationPlayState.Playing;
    }

    /**
     * 停止动画
     * Stop animation
     */
    public stop(): void {
        this._playState = AnimationPlayState.Stopped;
        this._currentTime = 0;
    }

    /**
     * 暂停动画
     * Pause animation
     */
    public pause(): void {
        if (this._playState === AnimationPlayState.Playing) {
            this._playState = AnimationPlayState.Paused;
        }
    }

    /**
     * 恢复播放
     * Resume playback
     */
    public resume(): void {
        if (this._playState === AnimationPlayState.Paused) {
            this._playState = AnimationPlayState.Playing;
        }
    }

    /**
     * 设置播放时间
     * Set playback time
     */
    public setTime(time: number): void {
        this._currentTime = Math.max(0, Math.min(time, this.duration));
    }

    /**
     * 设置归一化时间
     * Set normalized time
     */
    public setNormalizedTime(t: number): void {
        this._currentTime = Math.max(0, Math.min(t, 1)) * this.duration;
    }

    /**
     * 更新播放时间（由 Animation3DSystem 调用）
     * Update playback time (called by Animation3DSystem)
     *
     * @param deltaTime - 时间增量（秒）
     */
    public updateTime(deltaTime: number): void {
        if (this._playState !== AnimationPlayState.Playing || !this._currentClip) {
            return;
        }

        const scaledDelta = deltaTime * this.speed * this._direction;
        this._currentTime += scaledDelta;

        const duration = this._currentClip.duration;
        if (duration <= 0) return;

        // Handle wrap mode
        // 处理循环模式
        switch (this.wrapMode) {
            case AnimationWrapMode.Once:
                if (this._currentTime >= duration || this._currentTime < 0) {
                    this._currentTime = Math.max(0, Math.min(this._currentTime, duration));
                    this._playState = AnimationPlayState.Stopped;
                }
                break;

            case AnimationWrapMode.Loop:
                while (this._currentTime >= duration) {
                    this._currentTime -= duration;
                }
                while (this._currentTime < 0) {
                    this._currentTime += duration;
                }
                break;

            case AnimationWrapMode.PingPong:
                if (this._currentTime >= duration) {
                    this._currentTime = duration - (this._currentTime - duration);
                    this._direction = -1;
                } else if (this._currentTime < 0) {
                    this._currentTime = -this._currentTime;
                    this._direction = 1;
                }
                break;

            case AnimationWrapMode.ClampForever:
                this._currentTime = Math.max(0, Math.min(this._currentTime, duration));
                break;
        }
    }

    /**
     * 重置组件
     * Reset component
     */
    reset(): void {
        this.defaultClip = '';
        this.speed = 1.0;
        this.wrapMode = AnimationWrapMode.Loop;
        this.playOnAwake = true;
        this._playState = AnimationPlayState.Stopped;
        this._currentClip = null;
        this._currentTime = 0;
        this._direction = 1;
        this._clips = [];
        this._clipNameToIndex.clear();
    }
}
