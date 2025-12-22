import { EventDispatcher } from '../events/EventDispatcher';
import type { GComponent } from './GComponent';
import type { GObject } from './GObject';
import { GTween } from '../tween/GTween';
import type { GTweener } from '../tween/GTweener';
import { EEaseType } from '../tween/EaseType';
import { ByteBuffer } from '../utils/ByteBuffer';
import type { SimpleHandler } from '../display/MovieClip';

/**
 * Transition action types
 * 过渡动画动作类型
 */
export const enum ETransitionActionType {
    XY = 0,
    Size = 1,
    Scale = 2,
    Pivot = 3,
    Alpha = 4,
    Rotation = 5,
    Color = 6,
    Animation = 7,
    Visible = 8,
    Sound = 9,
    Transition = 10,
    Shake = 11,
    ColorFilter = 12,
    Skew = 13,
    Text = 14,
    Icon = 15,
    Unknown = 16
}

/**
 * Transition item value
 * 过渡项值
 */
interface ITransitionValue {
    f1?: number;
    f2?: number;
    f3?: number;
    f4?: number;
    b1?: boolean;
    b2?: boolean;
    b3?: boolean;
    visible?: boolean;
    playing?: boolean;
    frame?: number;
    sound?: string;
    volume?: number;
    transName?: string;
    playTimes?: number;
    trans?: Transition;
    stopTime?: number;
    amplitude?: number;
    duration?: number;
    offsetX?: number;
    offsetY?: number;
    lastOffsetX?: number;
    lastOffsetY?: number;
    text?: string;
    audioClip?: string;
    flag?: boolean;
}

/**
 * Tween config
 * 补间配置
 */
interface ITweenConfig {
    duration: number;
    easeType: EEaseType;
    repeat: number;
    yoyo: boolean;
    startValue: ITransitionValue;
    endValue: ITransitionValue;
    endLabel?: string;
    endHook?: SimpleHandler;
}

/**
 * Transition item
 * 过渡项
 */
interface ITransitionItem {
    time: number;
    targetId: string;
    type: ETransitionActionType;
    tweenConfig?: ITweenConfig;
    label?: string;
    value: ITransitionValue;
    hook?: SimpleHandler;
    tweener?: GTweener;
    target?: GObject;
    displayLockToken: number;
}

/** Options flags */
const OPTION_AUTO_STOP_DISABLED = 2;
const OPTION_AUTO_STOP_AT_END = 4;

/**
 * Transition
 *
 * Animation transition system for UI components.
 * Supports keyframe animations, tweening, and chained transitions.
 *
 * UI 组件的动画过渡系统，支持关键帧动画、补间和链式过渡
 */
export class Transition extends EventDispatcher {
    /** Transition name | 过渡动画名称 */
    public name: string = '';

    private _owner: GComponent;
    private _ownerBaseX: number = 0;
    private _ownerBaseY: number = 0;
    private _items: ITransitionItem[] = [];
    private _totalTimes: number = 0;
    private _totalTasks: number = 0;
    private _playing: boolean = false;
    private _paused: boolean = false;
    private _onComplete: SimpleHandler | null = null;
    private _options: number = 0;
    private _reversed: boolean = false;
    private _totalDuration: number = 0;
    private _autoPlay: boolean = false;
    private _autoPlayTimes: number = 1;
    private _autoPlayDelay: number = 0;
    private _timeScale: number = 1;
    private _startTime: number = 0;
    private _endTime: number = -1;

    constructor(owner: GComponent) {
        super();
        this._owner = owner;
    }

    public get owner(): GComponent {
        return this._owner;
    }

    public get playing(): boolean {
        return this._playing;
    }

    public get autoPlay(): boolean {
        return this._autoPlay;
    }

    public set autoPlay(value: boolean) {
        this.setAutoPlay(value, this._autoPlayTimes, this._autoPlayDelay);
    }

    public get autoPlayRepeat(): number {
        return this._autoPlayTimes;
    }

    public get autoPlayDelay(): number {
        return this._autoPlayDelay;
    }

    public get timeScale(): number {
        return this._timeScale;
    }

    public set timeScale(value: number) {
        if (this._timeScale !== value) {
            this._timeScale = value;
            if (this._playing) {
                for (const item of this._items) {
                    if (item.tweener) {
                        item.tweener.setTimeScale(value);
                    } else if (item.type === ETransitionActionType.Transition && item.value.trans) {
                        item.value.trans.timeScale = value;
                    }
                }
            }
        }
    }

    public play(
        onComplete?: SimpleHandler,
        times: number = 1,
        delay: number = 0,
        startTime: number = 0,
        endTime: number = -1
    ): void {
        this._play(onComplete || null, times, delay, startTime, endTime, false);
    }

    public playReverse(
        onComplete?: SimpleHandler,
        times: number = 1,
        delay: number = 0,
        startTime: number = 0,
        endTime: number = -1
    ): void {
        this._play(onComplete || null, times, delay, startTime, endTime, true);
    }

    public changePlayTimes(value: number): void {
        this._totalTimes = value;
    }

    public setAutoPlay(value: boolean, times: number = -1, delay: number = 0): void {
        if (this._autoPlay !== value) {
            this._autoPlay = value;
            this._autoPlayTimes = times;
            this._autoPlayDelay = delay;

            if (this._autoPlay) {
                if (this._owner.onStage) {
                    this.play(undefined, this._autoPlayTimes, this._autoPlayDelay);
                }
            } else {
                if (!this._owner.onStage) {
                    this.stop(false, true);
                }
            }
        }
    }

    public _play(
        onComplete: SimpleHandler | null,
        times: number,
        delay: number,
        startTime: number,
        endTime: number,
        reversed: boolean
    ): void {
        this.stop(true, true);

        this._totalTimes = times;
        this._reversed = reversed;
        this._startTime = startTime;
        this._endTime = endTime;
        this._playing = true;
        this._paused = false;
        this._onComplete = onComplete;

        for (const item of this._items) {
            if (!item.target) {
                if (item.targetId) {
                    item.target = this._owner.getChildById(item.targetId) ?? undefined;
                } else {
                    item.target = this._owner;
                }
            } else if (item.target !== this._owner && item.target.parent !== this._owner) {
                item.target = undefined;
            }

            if (item.target && item.type === ETransitionActionType.Transition) {
                let trans = (item.target as GComponent).getTransition(item.value.transName || '');
                if (trans === this) trans = null;
                if (trans) {
                    if (item.value.playTimes === 0) {
                        for (let j = this._items.indexOf(item) - 1; j >= 0; j--) {
                            const item2 = this._items[j];
                            if (item2.type === ETransitionActionType.Transition && item2.value.trans === trans) {
                                item2.value.stopTime = item.time - item2.time;
                                trans = null;
                                break;
                            }
                        }
                        if (trans) item.value.stopTime = 0;
                    } else {
                        item.value.stopTime = -1;
                    }
                }
                item.value.trans = trans ?? undefined;
            }
        }

        if (delay === 0) {
            this.onDelayedPlay();
        } else {
            GTween.delayedCall(delay).setTarget(this).onComplete(() => this.onDelayedPlay());
        }
    }

    public stop(bSetToComplete: boolean = true, bProcessCallback: boolean = false): void {
        if (!this._playing) return;

        this._playing = false;
        this._totalTasks = 0;
        this._totalTimes = 0;
        const handler = this._onComplete;
        this._onComplete = null;

        GTween.kill(this);

        const cnt = this._items.length;
        if (this._reversed) {
            for (let i = cnt - 1; i >= 0; i--) {
                const item = this._items[i];
                if (item.target) this.stopItem(item, bSetToComplete);
            }
        } else {
            for (let i = 0; i < cnt; i++) {
                const item = this._items[i];
                if (item.target) this.stopItem(item, bSetToComplete);
            }
        }

        if (bProcessCallback && handler) {
            if (typeof handler === 'function') handler();
            else if (typeof handler.run === 'function') handler.run();
        }
    }

    private stopItem(item: ITransitionItem, bSetToComplete: boolean): void {
        if (item.tweener) {
            item.tweener.kill(bSetToComplete);
            item.tweener = undefined;

            if (item.type === ETransitionActionType.Shake && !bSetToComplete && item.target) {
                item.target.x -= item.value.lastOffsetX || 0;
                item.target.y -= item.value.lastOffsetY || 0;
            }
        }

        if (item.type === ETransitionActionType.Transition && item.value.trans) {
            item.value.trans.stop(bSetToComplete, false);
        }
    }

    public pause(): void {
        if (!this._playing || this._paused) return;
        this._paused = true;

        const tweener = GTween.getTween(this);
        if (tweener) tweener.setPaused(true);

        for (const item of this._items) {
            if (!item.target) continue;
            if (item.type === ETransitionActionType.Transition && item.value.trans) {
                item.value.trans.pause();
            }
            if (item.tweener) item.tweener.setPaused(true);
        }
    }

    public resume(): void {
        if (!this._playing || !this._paused) return;
        this._paused = false;

        const tweener = GTween.getTween(this);
        if (tweener) tweener.setPaused(false);

        for (const item of this._items) {
            if (!item.target) continue;
            if (item.type === ETransitionActionType.Transition && item.value.trans) {
                item.value.trans.resume();
            }
            if (item.tweener) item.tweener.setPaused(false);
        }
    }

    public setValue(label: string, ...values: any[]): void {
        for (const item of this._items) {
            if (item.label === label) {
                const value = item.tweenConfig ? item.tweenConfig.startValue : item.value;
                this.setItemValue(item.type, value, values);
                return;
            } else if (item.tweenConfig?.endLabel === label) {
                this.setItemValue(item.type, item.tweenConfig.endValue, values);
                return;
            }
        }
    }

    private setItemValue(type: ETransitionActionType, value: ITransitionValue, args: any[]): void {
        switch (type) {
            case ETransitionActionType.XY:
            case ETransitionActionType.Size:
            case ETransitionActionType.Pivot:
            case ETransitionActionType.Scale:
            case ETransitionActionType.Skew:
                value.b1 = value.b2 = true;
                value.f1 = parseFloat(args[0]);
                value.f2 = parseFloat(args[1]);
                break;
            case ETransitionActionType.Alpha:
            case ETransitionActionType.Rotation:
            case ETransitionActionType.Color:
                value.f1 = parseFloat(args[0]);
                break;
            case ETransitionActionType.Animation:
                value.frame = parseInt(args[0]);
                if (args.length > 1) value.playing = args[1];
                break;
            case ETransitionActionType.Visible:
                value.visible = args[0];
                break;
            case ETransitionActionType.Sound:
                value.sound = args[0];
                if (args.length > 1) value.volume = parseFloat(args[1]);
                break;
            case ETransitionActionType.Transition:
                value.transName = args[0];
                if (args.length > 1) value.playTimes = parseInt(args[1]);
                break;
            case ETransitionActionType.Shake:
                value.amplitude = parseFloat(args[0]);
                if (args.length > 1) value.duration = parseFloat(args[1]);
                break;
            case ETransitionActionType.ColorFilter:
                value.f1 = parseFloat(args[0]);
                value.f2 = parseFloat(args[1]);
                value.f3 = parseFloat(args[2]);
                value.f4 = parseFloat(args[3]);
                break;
            case ETransitionActionType.Text:
            case ETransitionActionType.Icon:
                value.text = args[0];
                break;
        }
    }

    public setTarget(label: string, target: GObject): void {
        for (const item of this._items) {
            if (item.label === label) {
                item.targetId = target.id;
                item.target = target;
                return;
            }
        }
    }

    public setHook(label: string, callback: SimpleHandler): void {
        for (const item of this._items) {
            if (item.label === label) {
                item.hook = callback;
                return;
            } else if (item.tweenConfig?.endLabel === label) {
                item.tweenConfig.endHook = callback;
                return;
            }
        }
    }

    public clearHooks(): void {
        for (const item of this._items) {
            item.hook = undefined;
            if (item.tweenConfig) item.tweenConfig.endHook = undefined;
        }
    }

    public onOwnerAddedToStage(): void {
        if (this._autoPlay && !this._playing) {
            this.play(undefined, this._autoPlayTimes, this._autoPlayDelay);
        }
    }

    public onOwnerRemovedFromStage(): void {
        if ((this._options & OPTION_AUTO_STOP_DISABLED) === 0) {
            this.stop((this._options & OPTION_AUTO_STOP_AT_END) !== 0, false);
        }
    }

    private onDelayedPlay(): void {
        this._ownerBaseX = this._owner.x;
        this._ownerBaseY = this._owner.y;
        this._totalTasks = 1;

        const cnt = this._items.length;
        for (let i = this._reversed ? cnt - 1 : 0; this._reversed ? i >= 0 : i < cnt; this._reversed ? i-- : i++) {
            const item = this._items[i];
            if (item.target) this.playItem(item);
        }

        this._totalTasks--;
        this.checkAllComplete();
    }

    private playItem(item: ITransitionItem): void {
        let time: number;

        if (item.tweenConfig) {
            time = this._reversed
                ? this._totalDuration - item.time - item.tweenConfig.duration
                : item.time;

            if (this._endTime === -1 || time < this._endTime) {
                const startValue = this._reversed ? item.tweenConfig.endValue : item.tweenConfig.startValue;
                const endValue = this._reversed ? item.tweenConfig.startValue : item.tweenConfig.endValue;

                item.value.b1 = startValue.b1;
                item.value.b2 = startValue.b2;

                switch (item.type) {
                    case ETransitionActionType.XY:
                    case ETransitionActionType.Size:
                    case ETransitionActionType.Scale:
                    case ETransitionActionType.Skew:
                        item.tweener = GTween.to2(
                            startValue.f1 || 0, startValue.f2 || 0,
                            endValue.f1 || 0, endValue.f2 || 0,
                            item.tweenConfig.duration
                        );
                        break;
                    case ETransitionActionType.Alpha:
                    case ETransitionActionType.Rotation:
                        item.tweener = GTween.to(startValue.f1 || 0, endValue.f1 || 0, item.tweenConfig.duration);
                        break;
                    case ETransitionActionType.Color:
                        item.tweener = GTween.toColor(startValue.f1 || 0, endValue.f1 || 0, item.tweenConfig.duration);
                        break;
                    case ETransitionActionType.ColorFilter:
                        item.tweener = GTween.to4(
                            startValue.f1 || 0, startValue.f2 || 0, startValue.f3 || 0, startValue.f4 || 0,
                            endValue.f1 || 0, endValue.f2 || 0, endValue.f3 || 0, endValue.f4 || 0,
                            item.tweenConfig.duration
                        );
                        break;
                }

                if (item.tweener) {
                    item.tweener
                        .setDelay(time)
                        .setEase(item.tweenConfig.easeType)
                        .setRepeat(item.tweenConfig.repeat, item.tweenConfig.yoyo)
                        .setTimeScale(this._timeScale)
                        .setTarget(item)
                        .onStart(() => this.callHook(item, false))
                        .onUpdate(() => this.onTweenUpdate(item))
                        .onComplete(() => this.onTweenComplete(item));

                    if (this._endTime >= 0) item.tweener.setBreakpoint(this._endTime - time);
                    this._totalTasks++;
                }
            }
        } else if (item.type === ETransitionActionType.Shake) {
            time = this._reversed
                ? this._totalDuration - item.time - (item.value.duration || 0)
                : item.time;

            item.value.offsetX = item.value.offsetY = 0;
            item.value.lastOffsetX = item.value.lastOffsetY = 0;

            item.tweener = GTween.shake(0, 0, item.value.amplitude || 0, item.value.duration || 0)
                .setDelay(time)
                .setTimeScale(this._timeScale)
                .setTarget(item)
                .onUpdate(() => this.onTweenUpdate(item))
                .onComplete(() => this.onTweenComplete(item));

            if (this._endTime >= 0) item.tweener.setBreakpoint(this._endTime - item.time);
            this._totalTasks++;
        } else {
            time = this._reversed ? this._totalDuration - item.time : item.time;

            if (time <= this._startTime) {
                this.applyValue(item);
                this.callHook(item, false);
            } else if (this._endTime === -1 || time <= this._endTime) {
                this._totalTasks++;
                item.tweener = GTween.delayedCall(time)
                    .setTimeScale(this._timeScale)
                    .setTarget(item)
                    .onComplete(() => {
                        item.tweener = undefined;
                        this._totalTasks--;
                        this.applyValue(item);
                        this.callHook(item, false);
                        this.checkAllComplete();
                    });
            }
        }
    }

    private onTweenUpdate(item: ITransitionItem): void {
        if (!item.tweener) return;
        const tweener = item.tweener;

        switch (item.type) {
            case ETransitionActionType.XY:
            case ETransitionActionType.Size:
            case ETransitionActionType.Scale:
            case ETransitionActionType.Skew:
                item.value.f1 = tweener.value.x;
                item.value.f2 = tweener.value.y;
                break;
            case ETransitionActionType.Alpha:
            case ETransitionActionType.Rotation:
                item.value.f1 = tweener.value.x;
                break;
            case ETransitionActionType.Color:
                item.value.f1 = tweener.value.color;
                break;
            case ETransitionActionType.ColorFilter:
                item.value.f1 = tweener.value.x;
                item.value.f2 = tweener.value.y;
                item.value.f3 = tweener.value.z;
                item.value.f4 = tweener.value.w;
                break;
            case ETransitionActionType.Shake:
                item.value.offsetX = tweener.deltaValue.x;
                item.value.offsetY = tweener.deltaValue.y;
                break;
        }
        this.applyValue(item);
    }

    private onTweenComplete(item: ITransitionItem): void {
        item.tweener = undefined;
        this._totalTasks--;
        this.callHook(item, true);
        this.checkAllComplete();
    }

    private checkAllComplete(): void {
        if (this._playing && this._totalTasks === 0) {
            if (this._totalTimes < 0) {
                this.internalPlay();
            } else {
                this._totalTimes--;
                if (this._totalTimes > 0) {
                    this.internalPlay();
                } else {
                    this._playing = false;
                    const handler = this._onComplete;
                    this._onComplete = null;
                    if (handler) {
                        if (typeof handler === 'function') handler();
                        else if (typeof handler.run === 'function') handler.run();
                    }
                }
            }
        }
    }

    private internalPlay(): void {
        this._ownerBaseX = this._owner.x;
        this._ownerBaseY = this._owner.y;
        this._totalTasks = 1;

        for (const item of this._items) {
            if (item.target) this.playItem(item);
        }
        this._totalTasks--;
    }

    private callHook(item: ITransitionItem, tweenEnd: boolean): void {
        const hook = tweenEnd ? item.tweenConfig?.endHook : item.hook;
        if (hook) {
            if (typeof hook === 'function') hook();
            else if (typeof hook.run === 'function') hook.run();
        }
    }

    private applyValue(item: ITransitionItem): void {
        if (!item.target) return;
        const value = item.value;
        const target = item.target;

        switch (item.type) {
            case ETransitionActionType.XY:
                if (target === this._owner) {
                    if (value.b1 && value.b2) target.setXY((value.f1 || 0) + this._ownerBaseX, (value.f2 || 0) + this._ownerBaseY);
                    else if (value.b1) target.x = (value.f1 || 0) + this._ownerBaseX;
                    else target.y = (value.f2 || 0) + this._ownerBaseY;
                } else if (value.b3) {
                    if (value.b1 && value.b2) target.setXY((value.f1 || 0) * this._owner.width, (value.f2 || 0) * this._owner.height);
                    else if (value.b1) target.x = (value.f1 || 0) * this._owner.width;
                    else if (value.b2) target.y = (value.f2 || 0) * this._owner.height;
                } else {
                    if (value.b1 && value.b2) target.setXY(value.f1 || 0, value.f2 || 0);
                    else if (value.b1) target.x = value.f1 || 0;
                    else if (value.b2) target.y = value.f2 || 0;
                }
                break;
            case ETransitionActionType.Size:
                if (!value.b1) value.f1 = target.width;
                if (!value.b2) value.f2 = target.height;
                target.setSize(value.f1 || 0, value.f2 || 0);
                break;
            case ETransitionActionType.Pivot:
                target.setPivot(value.f1 || 0, value.f2 || 0, target.pivotAsAnchor);
                break;
            case ETransitionActionType.Alpha:
                target.alpha = value.f1 || 0;
                break;
            case ETransitionActionType.Rotation:
                target.rotation = value.f1 || 0;
                break;
            case ETransitionActionType.Scale:
                target.setScale(value.f1 || 0, value.f2 || 0);
                break;
            case ETransitionActionType.Skew:
                target.setSkew(value.f1 || 0, value.f2 || 0);
                break;
            case ETransitionActionType.Visible:
                target.visible = value.visible || false;
                break;
            case ETransitionActionType.Transition:
                if (this._playing && value.trans) {
                    this._totalTasks++;
                    const startTime = this._startTime > item.time ? this._startTime - item.time : 0;
                    let endTime = this._endTime >= 0 ? this._endTime - item.time : -1;
                    if (value.stopTime !== undefined && value.stopTime >= 0 && (endTime < 0 || endTime > value.stopTime)) {
                        endTime = value.stopTime;
                    }
                    value.trans.timeScale = this._timeScale;
                    value.trans._play(() => { this._totalTasks--; this.checkAllComplete(); }, value.playTimes || 1, 0, startTime, endTime, this._reversed);
                }
                break;
            case ETransitionActionType.Shake:
                target.x = target.x - (value.lastOffsetX || 0) + (value.offsetX || 0);
                target.y = target.y - (value.lastOffsetY || 0) + (value.offsetY || 0);
                value.lastOffsetX = value.offsetX;
                value.lastOffsetY = value.offsetY;
                break;
            case ETransitionActionType.Text:
                target.text = value.text || '';
                break;
            case ETransitionActionType.Icon:
                target.icon = value.text || '';
                break;
        }
    }

    public setup(buffer: ByteBuffer): void {
        this.name = buffer.readS();
        this._options = buffer.getInt32();
        this._autoPlay = buffer.readBool();
        this._autoPlayTimes = buffer.getInt32();
        this._autoPlayDelay = buffer.getFloat32();

        const cnt = buffer.getInt16();
        for (let i = 0; i < cnt; i++) {
            const dataLen = buffer.getInt16();
            const curPos = buffer.position;

            buffer.seek(curPos, 0);

            const item: ITransitionItem = {
                type: buffer.readByte() as ETransitionActionType,
                time: buffer.getFloat32(),
                targetId: '',
                value: {},
                displayLockToken: 0
            };

            const targetId = buffer.getInt16();
            if (targetId >= 0) {
                const child = this._owner.getChildAt(targetId);
                item.targetId = child?.id || '';
            }

            item.label = buffer.readS();

            if (buffer.readBool()) {
                buffer.seek(curPos, 1);
                item.tweenConfig = {
                    duration: buffer.getFloat32(),
                    easeType: buffer.readByte() as EEaseType,
                    repeat: buffer.getInt32(),
                    yoyo: buffer.readBool(),
                    startValue: {},
                    endValue: {},
                    endLabel: buffer.readS()
                };

                buffer.seek(curPos, 2);
                this.decodeValue(item.type, buffer, item.tweenConfig.startValue);

                buffer.seek(curPos, 3);
                this.decodeValue(item.type, buffer, item.tweenConfig.endValue);
            } else {
                buffer.seek(curPos, 2);
                this.decodeValue(item.type, buffer, item.value);
            }

            this._items.push(item);
            buffer.position = curPos + dataLen;
        }

        this._totalDuration = 0;
        for (const item of this._items) {
            let duration = item.time;
            if (item.tweenConfig) duration += item.tweenConfig.duration * (item.tweenConfig.repeat + 1);
            else if (item.type === ETransitionActionType.Shake) duration += item.value.duration || 0;
            if (duration > this._totalDuration) this._totalDuration = duration;
        }
    }

    private decodeValue(type: ETransitionActionType, buffer: ByteBuffer, value: ITransitionValue): void {
        switch (type) {
            case ETransitionActionType.XY:
            case ETransitionActionType.Size:
            case ETransitionActionType.Pivot:
            case ETransitionActionType.Skew:
                value.b1 = buffer.readBool();
                value.b2 = buffer.readBool();
                value.f1 = buffer.getFloat32();
                value.f2 = buffer.getFloat32();
                if (buffer.version >= 2 && type === ETransitionActionType.XY) value.b3 = buffer.readBool();
                break;
            case ETransitionActionType.Alpha:
            case ETransitionActionType.Rotation:
                value.f1 = buffer.getFloat32();
                break;
            case ETransitionActionType.Scale:
                value.f1 = buffer.getFloat32();
                value.f2 = buffer.getFloat32();
                break;
            case ETransitionActionType.Color:
                value.f1 = buffer.readColor();
                break;
            case ETransitionActionType.Animation:
                value.playing = buffer.readBool();
                value.frame = buffer.getInt32();
                break;
            case ETransitionActionType.Visible:
                value.visible = buffer.readBool();
                break;
            case ETransitionActionType.Sound:
                value.sound = buffer.readS();
                value.volume = buffer.getFloat32();
                break;
            case ETransitionActionType.Transition:
                value.transName = buffer.readS();
                value.playTimes = buffer.getInt32();
                break;
            case ETransitionActionType.Shake:
                value.amplitude = buffer.getFloat32();
                value.duration = buffer.getFloat32();
                break;
            case ETransitionActionType.ColorFilter:
                value.f1 = buffer.getFloat32();
                value.f2 = buffer.getFloat32();
                value.f3 = buffer.getFloat32();
                value.f4 = buffer.getFloat32();
                break;
            case ETransitionActionType.Text:
            case ETransitionActionType.Icon:
                value.text = buffer.readS();
                break;
        }
    }

    public dispose(): void {
        if (this._playing) GTween.kill(this);

        for (const item of this._items) {
            if (item.tweener) {
                item.tweener.kill();
                item.tweener = undefined;
            }
            item.target = undefined;
            item.hook = undefined;
            if (item.tweenConfig) item.tweenConfig.endHook = undefined;
        }

        this._items.length = 0;
        super.dispose();
    }
}
