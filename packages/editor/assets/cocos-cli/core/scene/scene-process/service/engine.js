'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineService = void 0;
const time_1 = __importDefault(require("./engine/time"));
const cc_1 = require("cc");
const geometry_renderer_1 = require("./engine/geometry_renderer");
const core_1 = require("./core");
const rpc_1 = require("../rpc");
const tickTime = 1000 / 60;
/**
 * 引擎管理器，用于引擎相关操作
 */
let EngineService = class EngineService extends core_1.BaseService {
    _setTimeoutId = null;
    _rafId = null;
    _maxDeltaTimeInEM = 1 / 30;
    _stateRecord = 0; // 记录当前状态
    _shouldRepaintInEM = false; // 强制引擎渲染一帧
    _tickInEM = false;
    _tickedFrameInEM = -1;
    _paused = false;
    _capture = false; // 抓帧时定时器需要切换
    _bindTick = this._tick.bind(this);
    geometryRenderer;
    _sceneTick = false; // tick 是否暂停
    async init() {
        cc.game.pause(); // 暂停引擎的 mainLoop
        this.geometryRenderer = new geometry_renderer_1.GeometryRenderer();
        this.startTick();
        this._sceneTick = await rpc_1.Rpc.getInstance().request('sceneConfigInstance', 'get', ['tick']);
        console.log('sceneTick: ' + this._sceneTick);
    }
    setTimeout(callback, time) {
        if (this._capture) {
            // eslint-disable-next-line no-undef
            this._rafId = requestAnimationFrame(callback);
        }
        else {
            this._setTimeoutId = setTimeout(callback, time);
        }
    }
    clearTimeout() {
        if (this._setTimeoutId) {
            clearTimeout(this._setTimeoutId);
            this._setTimeoutId = null;
        }
        if (this._rafId) {
            // eslint-disable-next-line no-undef
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }
    async repaintInEditMode() {
        // 避免 tickInEditMode() 在同一帧执行时又调到这里，导致下一帧又执行 tickInEditMode，陷入循环
        if (this._tickedFrameInEM !== cc_1.director.getTotalFrames()) {
            this._shouldRepaintInEM = true;
        }
    }
    setFrameRate(fps) {
        this._maxDeltaTimeInEM = 1 / fps;
    }
    startTick() {
        if (this._setTimeoutId === null) {
            this._tick();
        }
    }
    stopTick() {
        this.clearTimeout();
    }
    tickInEditMode(deltaTime) {
        this._tickedFrameInEM = cc_1.director.getTotalFrames();
        if (this.geometryRenderer) {
            this.geometryRenderer.flush();
        }
        cc_1.director.tick(deltaTime);
    }
    getGeometryRenderer() {
        return this.geometryRenderer;
    }
    resume() {
        this._paused = false;
        this.startTick();
    }
    pause() {
        this.stopTick();
        this._paused = true;
    }
    _tick() {
        if (this._paused)
            return;
        this.setTimeout(this._bindTick, tickTime);
        const now = performance.now() / 1000;
        time_1.default.update(now, false, this._maxDeltaTimeInEM);
        if (this._isTickAllowed()) {
            this._shouldRepaintInEM = false;
            this.tickInEditMode(time_1.default.deltaTime);
            this.broadcast('engine:update');
        }
        this.broadcast('engine:ticked');
    }
    _isTickAllowed() {
        return this._sceneTick || this._shouldRepaintInEM || this._tickInEM;
    }
    get capture() {
        return this._capture;
    }
    set capture(b) {
        this._capture = b;
    }
    //
    onEditorOpened() {
        void this.repaintInEditMode();
    }
    onEditorClosed() {
        void this.repaintInEditMode();
    }
    onEditorReload() {
        void this.repaintInEditMode();
    }
    onNodeChanged() {
        void this.repaintInEditMode();
    }
    onComponentAdded() {
        void this.repaintInEditMode();
    }
    onComponentRemoved() {
        void this.repaintInEditMode();
    }
    onSetPropertyComponent() {
        void this.repaintInEditMode();
    }
};
exports.EngineService = EngineService;
exports.EngineService = EngineService = __decorate([
    (0, core_1.register)('Engine')
], EngineService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NlbmUvc2NlbmUtcHJvY2Vzcy9zZXJ2aWNlL2VuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7OztBQUViLHlEQUFpQztBQUNqQywyQkFBc0U7QUFDdEUsa0VBQTBGO0FBQzFGLGlDQUErQztBQUUvQyxnQ0FBNkI7QUFFN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUUzQjs7R0FFRztBQUVJLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxrQkFBMEI7SUFDakQsYUFBYSxHQUEwQixJQUFJLENBQUM7SUFDNUMsTUFBTSxHQUFrQixJQUFJLENBQUM7SUFDN0IsaUJBQWlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMzQixZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUztJQUMzQixrQkFBa0IsR0FBRyxLQUFLLENBQUMsQ0FBQyxXQUFXO0lBQ3ZDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDbEIsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEIsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUNoQixRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUEsYUFBYTtJQUU5QixTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsZ0JBQWdCLENBQStFO0lBQy9GLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQSxZQUFZO0lBQ2hDLEtBQUssQ0FBQyxJQUFJO1FBQ2IsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQjtRQUNsQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxvQ0FBZ0IsRUFBaUYsQ0FBQztRQUM5SCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFB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QVEsQ0FBQztHQUNOLGFBQWEsQ0E4SXpCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IFRpbWUgZnJvbSAnLi9lbmdpbmUvdGltZSc7XHJcbmltcG9ydCB7IGRpcmVjdG9yLCBHZW9tZXRyeVJlbmRlcmVyIGFzIENDR2VvbWV0cnlSZW5kZXJlciB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgR2VvbWV0cnlSZW5kZXJlciwgbWV0aG9kcyBhcyBHZW9tZXRyeU1ldGhvZHMgfSBmcm9tICcuL2VuZ2luZS9nZW9tZXRyeV9yZW5kZXJlcic7XHJcbmltcG9ydCB7IEJhc2VTZXJ2aWNlLCByZWdpc3RlciB9IGZyb20gJy4vY29yZSc7XHJcbmltcG9ydCB7IElFbmdpbmVFdmVudHMsIElFbmdpbmVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vY29tbW9uJztcclxuaW1wb3J0IHsgUnBjIH0gZnJvbSAnLi4vcnBjJztcclxuXHJcbmNvbnN0IHRpY2tUaW1lID0gMTAwMCAvIDYwO1xyXG5cclxuLyoqXHJcbiAqIOW8leaTjueuoeeQhuWZqO+8jOeUqOS6juW8leaTjuebuOWFs+aTjeS9nFxyXG4gKi9cclxuQHJlZ2lzdGVyKCdFbmdpbmUnKVxyXG5leHBvcnQgY2xhc3MgRW5naW5lU2VydmljZSBleHRlbmRzIEJhc2VTZXJ2aWNlPElFbmdpbmVFdmVudHM+IGltcGxlbWVudHMgSUVuZ2luZVNlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBfc2V0VGltZW91dElkOiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfcmFmSWQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfbWF4RGVsdGFUaW1lSW5FTSA9IDEgLyAzMDtcclxuICAgIHByaXZhdGUgX3N0YXRlUmVjb3JkID0gMDsgLy8g6K6w5b2V5b2T5YmN54q25oCBXHJcbiAgICBwcml2YXRlIF9zaG91bGRSZXBhaW50SW5FTSA9IGZhbHNlOyAvLyDlvLrliLblvJXmk47muLLmn5PkuIDluKdcclxuICAgIHByaXZhdGUgX3RpY2tJbkVNID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF90aWNrZWRGcmFtZUluRU0gPSAtMTtcclxuICAgIHByaXZhdGUgX3BhdXNlZCA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfY2FwdHVyZSA9IGZhbHNlOy8vIOaKk+W4p+aXtuWumuaXtuWZqOmcgOimgeWIh+aNolxyXG5cclxuICAgIHByaXZhdGUgX2JpbmRUaWNrID0gdGhpcy5fdGljay5iaW5kKHRoaXMpO1xyXG4gICAgcHJpdmF0ZSBnZW9tZXRyeVJlbmRlcmVyITogR2VvbWV0cnlSZW5kZXJlciAmIFBpY2s8Q0NHZW9tZXRyeVJlbmRlcmVyLCB0eXBlb2YgR2VvbWV0cnlNZXRob2RzW251bWJlcl0+O1xyXG4gICAgcHJpdmF0ZSBfc2NlbmVUaWNrID0gZmFsc2U7Ly8gdGljayDmmK/lkKbmmoLlgZxcclxuICAgIHB1YmxpYyBhc3luYyBpbml0KCkge1xyXG4gICAgICAgIGNjLmdhbWUucGF1c2UoKTsgLy8g5pqC5YGc5byV5pOO55qEIG1haW5Mb29wXHJcbiAgICAgICAgdGhpcy5nZW9tZXRyeVJlbmRlcmVyID0gbmV3IEdlb21ldHJ5UmVuZGVyZXIoKSBhcyBHZW9tZXRyeVJlbmRlcmVyICYgUGljazxDQ0dlb21ldHJ5UmVuZGVyZXIsIHR5cGVvZiBHZW9tZXRyeU1ldGhvZHNbbnVtYmVyXT47XHJcbiAgICAgICAgdGhpcy5zdGFydFRpY2soKTtcclxuICAgICAgICB0aGlzLl9zY2VuZVRpY2sgPSBhd2FpdCBScGMuZ2V0SW5zdGFuY2UoKS5yZXF1ZXN0KCdzY2VuZUNvbmZpZ0luc3RhbmNlJywgJ2dldCcsIFsndGljayddKSBhcyBib29sZWFuO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzY2VuZVRpY2s6ICcgKyB0aGlzLl9zY2VuZVRpY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRUaW1lb3V0KGNhbGxiYWNrOiBhbnksIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLl9jYXB0dXJlKSB7XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICAgICAgICB0aGlzLl9yYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0VGltZW91dElkID0gc2V0VGltZW91dChjYWxsYmFjaywgdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhclRpbWVvdXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NldFRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fc2V0VGltZW91dElkKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0VGltZW91dElkID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3JhZklkKSB7XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JhZklkID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIHJlcGFpbnRJbkVkaXRNb2RlKCkge1xyXG4gICAgICAgIC8vIOmBv+WFjSB0aWNrSW5FZGl0TW9kZSgpIOWcqOWQjOS4gOW4p+aJp+ihjOaXtuWPiOiwg+WIsOi/memHjO+8jOWvvOiHtOS4i+S4gOW4p+WPiOaJp+ihjCB0aWNrSW5FZGl0TW9kZe+8jOmZt+WFpeW+queOr1xyXG4gICAgICAgIGlmICh0aGlzLl90aWNrZWRGcmFtZUluRU0gIT09IGRpcmVjdG9yLmdldFRvdGFsRnJhbWVzKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2hvdWxkUmVwYWludEluRU0gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0RnJhbWVSYXRlKGZwczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fbWF4RGVsdGFUaW1lSW5FTSA9IDEgLyBmcHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXJ0VGljaygpIHtcclxuICAgICAgICBpZiAodGhpcy5fc2V0VGltZW91dElkID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RpY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0b3BUaWNrKCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRpY2tJbkVkaXRNb2RlKGRlbHRhVGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fdGlja2VkRnJhbWVJbkVNID0gZGlyZWN0b3IuZ2V0VG90YWxGcmFtZXMoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZ2VvbWV0cnlSZW5kZXJlcikge1xyXG4gICAgICAgICAgICB0aGlzLmdlb21ldHJ5UmVuZGVyZXIuZmx1c2goKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGlyZWN0b3IudGljayhkZWx0YVRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRHZW9tZXRyeVJlbmRlcmVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdlb21ldHJ5UmVuZGVyZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc3VtZSgpIHtcclxuICAgICAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXJ0VGljaygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLnN0b3BUaWNrKCk7XHJcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF90aWNrKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9wYXVzZWQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnNldFRpbWVvdXQodGhpcy5fYmluZFRpY2ssIHRpY2tUaW1lKTtcclxuICAgICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKSAvIDEwMDA7XHJcbiAgICAgICAgVGltZS51cGRhdGUobm93LCBmYWxzZSwgdGhpcy5fbWF4RGVsdGFUaW1lSW5FTSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9pc1RpY2tBbGxvd2VkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2hvdWxkUmVwYWludEluRU0gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy50aWNrSW5FZGl0TW9kZShUaW1lLmRlbHRhVGltZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KCdlbmdpbmU6dXBkYXRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0KCdlbmdpbmU6dGlja2VkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNUaWNrQWxsb3dlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NlbmVUaWNrIHx8IHRoaXMuX3Nob3VsZFJlcGFpbnRJbkVNIHx8IHRoaXMuX3RpY2tJbkVNO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FwdHVyZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FwdHVyZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgY2FwdHVyZShiOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fY2FwdHVyZSA9IGI7XHJcbiAgICB9XHJcblxyXG4gICAgLy9cclxuXHJcbiAgICBvbkVkaXRvck9wZW5lZCgpIHtcclxuICAgICAgICB2b2lkIHRoaXMucmVwYWludEluRWRpdE1vZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkVkaXRvckNsb3NlZCgpIHtcclxuICAgICAgICB2b2lkIHRoaXMucmVwYWludEluRWRpdE1vZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkVkaXRvclJlbG9hZCgpIHtcclxuICAgICAgICB2b2lkIHRoaXMucmVwYWludEluRWRpdE1vZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbk5vZGVDaGFuZ2VkKCkge1xyXG4gICAgICAgIHZvaWQgdGhpcy5yZXBhaW50SW5FZGl0TW9kZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQ29tcG9uZW50QWRkZWQoKSB7XHJcbiAgICAgICAgdm9pZCB0aGlzLnJlcGFpbnRJbkVkaXRNb2RlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25Db21wb25lbnRSZW1vdmVkKCkge1xyXG4gICAgICAgIHZvaWQgdGhpcy5yZXBhaW50SW5FZGl0TW9kZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uU2V0UHJvcGVydHlDb21wb25lbnQoKSB7XHJcbiAgICAgICAgdm9pZCB0aGlzLnJlcGFpbnRJbkVkaXRNb2RlKCk7XHJcbiAgICB9XHJcblxyXG59XHJcbiJdfQ==