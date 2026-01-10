import { g as getError, a as _createClass, x as ccenum, _ as _inheritsLoose, o as assertIsTrue, D as debug, w as warnID, an as getClassName, k as errorID, l as _createForOfIteratorHelperLoose, V as ValueType, au as remove, aA as removeIf, t as createMap, aB as contains, Z as Eventify, b as _applyDecoratedDescriptor, m as setClassAlias } from './gc-object-CShF5lzx.js';
import { b4 as WrapModeMask, c as ccclass$1, b as applyDecoratedInitializer, s as serializable$1, b5 as uniquelyReferenced, V as Vec2, f as Vec3, g as Vec4, Q as Quat, aE as RealCurve, aI as QuatCurve, C as Color, B as Size, aK as ObjectCurve, a$ as binarySearchEpsilon, a3 as easing, aP as bezierByTime, ab as lerp, aZ as EasingMethod, aF as RealInterpolationMode, aH as TangentWeightMode, aJ as QuatInterpolationMode, M as Mat4, A as approx, a as clamp, U as clamp01, t as type, l as executionOrder } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { A as Asset, C as Component } from './node-event-Ccvtv8bJ.js';
import { S as SkelAnimDataHub, B as BAKE_SKELETON_CURVE_SYMBOL } from './deprecated-BJz7DUMw.js';
import { N as Node } from './scene-vWcxM1_c.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { m as murmurhash2_32_gc } from './buffer-barrier-BlQXg9Aa.js';

var CLASS_NAME_PREFIX_ANIM = 'cc.animation.';
var createEvalSymbol = Symbol('CreateEval');

var Playable = function () {
  function Playable() {
    this._isPlaying = false;
    this._isPaused = false;
    this._stepOnce = false;
  }
  var _proto = Playable.prototype;
  _proto.play = function play() {
    if (this._isPlaying) {
      if (this._isPaused) {
        this._isPaused = false;
        this.onResume();
      } else {
        this.onError(getError(3912));
      }
    } else {
      this._isPlaying = true;
      this.onPlay();
    }
  };
  _proto.stop = function stop() {
    if (this._isPlaying) {
      this._isPlaying = false;
      this.onStop();
      this._isPaused = false;
    }
  };
  _proto.pause = function pause() {
    if (this._isPlaying && !this._isPaused) {
      this._isPaused = true;
      this.onPause();
    }
  };
  _proto.resume = function resume() {
    if (this._isPlaying && this._isPaused) {
      this._isPaused = false;
      this.onResume();
    }
  };
  _proto.step = function step() {
    this.pause();
    this._stepOnce = true;
    if (!this._isPlaying) {
      this.play();
    }
  };
  _proto.update = function update(deltaTime) {};
  _proto.onPlay = function onPlay() {};
  _proto.onPause = function onPause() {};
  _proto.onResume = function onResume() {};
  _proto.onStop = function onStop() {};
  _proto.onError = function onError(message) {};
  return _createClass(Playable, [{
    key: "isPlaying",
    get: function get() {
      return this._isPlaying;
    }
  }, {
    key: "isPaused",
    get: function get() {
      return this._isPaused;
    }
  }, {
    key: "isMotionless",
    get: function get() {
      return !this.isPlaying || this.isPaused;
    }
  }]);
}();

var WrapMode;
(function (WrapMode) {
  WrapMode[WrapMode["Default"] = WrapModeMask.Default] = "Default";
  WrapMode[WrapMode["Normal"] = WrapModeMask.Normal] = "Normal";
  WrapMode[WrapMode["Reverse"] = WrapModeMask.Reverse] = "Reverse";
  WrapMode[WrapMode["Loop"] = WrapModeMask.Loop] = "Loop";
  WrapMode[WrapMode["LoopReverse"] = WrapModeMask.Loop | WrapModeMask.Reverse] = "LoopReverse";
  WrapMode[WrapMode["PingPong"] = WrapModeMask.PingPong] = "PingPong";
  WrapMode[WrapMode["PingPongReverse"] = WrapModeMask.PingPong | WrapModeMask.Reverse] = "PingPongReverse";
})(WrapMode || (WrapMode = {}));
ccenum(WrapMode);
var WrappedInfo = function () {
  function WrappedInfo(info) {
    this.ratio = 0;
    this.time = 0;
    this.direction = 1;
    this.stopped = true;
    this.iterations = 0;
    this.frameIndex = undefined;
    if (info) {
      this.set(info);
    }
  }
  var _proto = WrappedInfo.prototype;
  _proto.set = function set(info) {
    this.ratio = info.ratio;
    this.time = info.time;
    this.direction = info.direction;
    this.stopped = info.stopped;
    this.iterations = info.iterations;
    this.frameIndex = info.frameIndex;
  };
  return WrappedInfo;
}();
function isLerpable(object) {
  return typeof object.lerp === 'function';
}

var PoseOutput = function () {
  function PoseOutput(pose) {
    this.weight = 0.0;
    this._pose = void 0;
    this._blendStateWriters = [];
    this._pose = pose;
  }
  var _proto = PoseOutput.prototype;
  _proto.destroy = function destroy() {
    for (var iBlendStateWriter = 0; iBlendStateWriter < this._blendStateWriters.length; ++iBlendStateWriter) {
      this._pose.destroyWriter(this._blendStateWriters[iBlendStateWriter]);
    }
    this._blendStateWriters.length = 0;
  };
  _proto.createPoseWriter = function createPoseWriter(node, property, constants) {
    var writer = this._pose.createWriter(node, property, this, constants);
    this._blendStateWriters.push(writer);
    return writer;
  };
  return PoseOutput;
}();

function getGlobalAnimationManager() {
  var animationManager = cclegacy.director.getAnimationManager();
  return animationManager;
}

var AnimationStateEventType;
(function (AnimationStateEventType) {
  AnimationStateEventType["PLAY"] = "play";
  AnimationStateEventType["STOP"] = "stop";
  AnimationStateEventType["PAUSE"] = "pause";
  AnimationStateEventType["RESUME"] = "resume";
  AnimationStateEventType["LASTFRAME"] = "lastframe";
  AnimationStateEventType["FINISHED"] = "finished";
})(AnimationStateEventType || (AnimationStateEventType = {}));
ccenum(AnimationStateEventType);
var AnimationState = function (_Playable) {
  function AnimationState(clip, name) {
    var _this;
    if (name === void 0) {
      name = '';
    }
    _this = _Playable.call(this) || this;
    _this.duration = 1.0;
    _this.time = 0.0;
    _this.frameRate = 0;
    _this._targetNode = null;
    _this._curveLoaded = false;
    _this._clip = void 0;
    _this._speed = 1.0;
    _this._useSimpleProcess = false;
    _this._target = null;
    _this._wrapMode = WrapMode.Normal;
    _this._repeatCount = 1;
    _this._delay = 0.0;
    _this._delayTime = 0.0;
    _this._currentFramePlayed = false;
    _this._name = void 0;
    _this._lastIterations = NaN;
    _this._lastWrapInfo = null;
    _this._wrappedInfo = new WrappedInfo();
    _this._allowLastFrame = false;
    _this._blendStateWriterHost = {
      weight: 0.0
    };
    _this._playbackDuration = 0.0;
    _this._invDuration = 1.0;
    _this._poseOutput = null;
    _this._weight = 1.0;
    _this._clipEval = void 0;
    _this._clipEventEval = void 0;
    _this._clipEmbeddedPlayerEval = void 0;
    _this._doNotCreateEval = false;
    _this._clip = clip;
    _this._name = name || clip && clip.name;
    _this._playbackRange = {
      min: 0.0,
      max: clip.duration
    };
    _this._playbackDuration = clip.duration;
    if (!clip.duration) {
      debug("Clip " + clip.name + " has zero duration.");
    }
    return _this;
  }
  _inheritsLoose(AnimationState, _Playable);
  var _proto = AnimationState.prototype;
  _proto.initialize = function initialize(root, blendStateBuffer, mask) {
    if (this._curveLoaded) {
      return;
    }
    this._curveLoaded = true;
    if (this._poseOutput) {
      this._poseOutput.destroy();
      this._poseOutput = null;
    }
    if (this._clipEval) {
      this._clipEval = undefined;
    }
    if (this._clipEventEval) {
      this._clipEventEval = undefined;
    }
    if (this._clipEmbeddedPlayerEval) {
      this._clipEmbeddedPlayerEval.destroy();
      this._clipEmbeddedPlayerEval = undefined;
    }
    this._targetNode = root;
    var clip = this._clip;
    this.duration = clip.duration;
    this._invDuration = 1.0 / this.duration;
    this._speed = clip.speed;
    this.wrapMode = clip.wrapMode;
    this.frameRate = clip.sample;
    this._playbackRange.min = 0.0;
    this._playbackRange.max = clip.duration;
    this._playbackDuration = clip.duration;
    if ((this.wrapMode & WrapModeMask.Loop) === WrapModeMask.Loop) {
      this.repeatCount = Infinity;
    } else {
      this.repeatCount = 1;
    }
    if (!this._doNotCreateEval) {
      var _ref, _getGlobalAnimationMa, _this$_poseOutput;
      var pose = (_ref = blendStateBuffer !== null && blendStateBuffer !== void 0 ? blendStateBuffer : (_getGlobalAnimationMa = getGlobalAnimationManager()) == null ? void 0 : _getGlobalAnimationMa.blendState) !== null && _ref !== void 0 ? _ref : null;
      if (pose) {
        this._poseOutput = new PoseOutput(pose);
      }
      this._clipEval = clip.createEvaluator({
        target: root,
        pose: (_this$_poseOutput = this._poseOutput) !== null && _this$_poseOutput !== void 0 ? _this$_poseOutput : undefined,
        mask: mask
      });
    }
    {
      if (clip.containsAnyEvent()) {
        this._clipEventEval = clip.createEventEvaluator(this._targetNode);
      }
    }
    if (clip.containsAnyEmbeddedPlayer()) {
      this._clipEmbeddedPlayerEval = clip.createEmbeddedPlayerEvaluator(this._targetNode);
      this._clipEmbeddedPlayerEval.notifyHostSpeedChanged(this._speed);
    }
  };
  _proto.destroy = function destroy() {
    if (!this.isMotionless) {
      getGlobalAnimationManager().removeAnimation(this);
    }
    if (this._poseOutput) {
      this._poseOutput.destroy();
      this._poseOutput = null;
    }
    this._clipEval = undefined;
  };
  _proto.emit = function emit() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    getGlobalAnimationManager().pushDelayEvent(this._emit, this, args);
  };
  _proto.on = function on(type, callback, target) {
    if (this._target && this._target.isValid) {
      return this._target.on(type, callback, target);
    } else {
      return null;
    }
  };
  _proto.once = function once(type, callback, target) {
    if (this._target && this._target.isValid) {
      return this._target.once(type, callback, target);
    } else {
      return null;
    }
  };
  _proto.off = function off(type, callback, target) {
    if (this._target && this._target.isValid) {
      this._target.off(type, callback, target);
    }
  };
  _proto.allowLastFrameEvent = function allowLastFrameEvent(allowed) {
    this._allowLastFrame = allowed;
  };
  _proto._setEventTarget = function _setEventTarget(target) {
    this._target = target;
  };
  _proto.setTime = function setTime(time) {
    this._currentFramePlayed = false;
    this.time = time || 0.0;
    {
      var _this$_clipEventEval;
      var info = this.getWrappedInfo(time, this._wrappedInfo);
      (_this$_clipEventEval = this._clipEventEval) == null ? void 0 : _this$_clipEventEval.ignore(info.ratio, info.direction);
    }
  };
  _proto.update = function update(delta) {
    if (this._delayTime > 0.0) {
      this._delayTime -= delta;
      if (this._delayTime > 0.0) {
        return;
      }
    }
    if (this._currentFramePlayed) {
      this.time += delta * this._speed;
    } else {
      this._currentFramePlayed = true;
    }
    this._process();
  };
  _proto.sample = function sample() {
    var info = this.getWrappedInfo(this.time, this._wrappedInfo);
    this._sampleCurves(info.time);
    {
      this._sampleEvents(info);
    }
    this._sampleEmbeddedPlayers(info);
    return info;
  };
  _proto.onPlay = function onPlay() {
    var _this$_clipEmbeddedPl;
    this.setTime(this._getPlaybackStart());
    this._delayTime = this._delay;
    this._onReplayOrResume();
    this.emit(AnimationStateEventType.PLAY, this);
    (_this$_clipEmbeddedPl = this._clipEmbeddedPlayerEval) == null ? void 0 : _this$_clipEmbeddedPl.notifyHostPlay(this.current);
  };
  _proto.onStop = function onStop() {
    var _this$_clipEmbeddedPl2;
    if (!this.isPaused) {
      this._onPauseOrStop();
    }
    this.emit(AnimationStateEventType.STOP, this);
    (_this$_clipEmbeddedPl2 = this._clipEmbeddedPlayerEval) == null ? void 0 : _this$_clipEmbeddedPl2.notifyHostStop();
  };
  _proto.onResume = function onResume() {
    var _this$_clipEmbeddedPl3;
    this._onReplayOrResume();
    this.emit(AnimationStateEventType.RESUME, this);
    (_this$_clipEmbeddedPl3 = this._clipEmbeddedPlayerEval) == null ? void 0 : _this$_clipEmbeddedPl3.notifyHostPlay(this.current);
  };
  _proto.onPause = function onPause() {
    var _this$_clipEmbeddedPl4;
    this._onPauseOrStop();
    this.emit(AnimationStateEventType.PAUSE, this);
    (_this$_clipEmbeddedPl4 = this._clipEmbeddedPlayerEval) == null ? void 0 : _this$_clipEmbeddedPl4.notifyHostPause(this.current);
  };
  _proto._sampleCurves = function _sampleCurves(time) {
    var poseOutput = this._poseOutput,
      clipEval = this._clipEval;
    if (poseOutput) {
      poseOutput.weight = this.weight;
    }
    if (clipEval) {
      clipEval.evaluate(time);
    }
  };
  _proto._process = function _process() {
    if (this._useSimpleProcess) {
      this.simpleProcess();
    } else {
      this.process();
    }
  };
  _proto.process = function process() {
    var info = this.sample();
    if (this._allowLastFrame) {
      var lastInfo;
      if (!this._lastWrapInfo) {
        lastInfo = this._lastWrapInfo = new WrappedInfo(info);
      } else {
        lastInfo = this._lastWrapInfo;
      }
      if (this.repeatCount > 1 && (info.iterations | 0) > (lastInfo.iterations | 0)) {
        this.emit(AnimationStateEventType.LASTFRAME, this);
      }
      lastInfo.set(info);
    }
    if (info.stopped) {
      this.stop();
      this.emit(AnimationStateEventType.FINISHED, this);
    }
  };
  _proto.simpleProcess = function simpleProcess() {
    var playbackStart = this._playbackRange.min;
    var playbackDuration = this._playbackDuration;
    var time = 0.0;
    var ratio = 0.0;
    if (playbackDuration !== 0.0) {
      time = this.time % playbackDuration;
      if (time < 0.0) {
        time += playbackDuration;
      }
      var realTime = playbackStart + time;
      ratio = realTime * this._invDuration;
    }
    this._sampleCurves(playbackStart + time);
    if (this._clipEventEval || this._clipEmbeddedPlayerEval) {
      var wrapInfo = this.getWrappedInfo(this.time, this._wrappedInfo);
      {
        this._sampleEvents(wrapInfo);
      }
      this._sampleEmbeddedPlayers(wrapInfo);
    }
    if (this._allowLastFrame) {
      if (Number.isNaN(this._lastIterations)) {
        this._lastIterations = ratio;
      }
      if (this.time > 0 && this._lastIterations > ratio || this.time < 0 && this._lastIterations < ratio) {
        this.emit(AnimationStateEventType.LASTFRAME, this);
      }
      this._lastIterations = ratio;
    }
  };
  _proto._needReverse = function _needReverse(currentIterations) {
    var wrapMode = this.wrapMode;
    var needReverse = false;
    if ((wrapMode & WrapModeMask.PingPong) === WrapModeMask.PingPong) {
      var isEnd = currentIterations - (currentIterations | 0) === 0;
      if (isEnd && currentIterations > 0) {
        currentIterations -= 1;
      }
      var isOddIteration = currentIterations & 1;
      if (isOddIteration) {
        needReverse = !needReverse;
      }
    }
    if ((wrapMode & WrapModeMask.Reverse) === WrapModeMask.Reverse) {
      needReverse = !needReverse;
    }
    return needReverse;
  };
  _proto.getWrappedInfo = function getWrappedInfo(time, info) {
    info = info || new WrappedInfo();
    var playbackStart = this._playbackRange.min,
      playbackDuration = this._playbackDuration;
    var repeatCount = this.repeatCount;
    if (playbackDuration === 0.0) {
      info.time = 0.0;
      info.ratio = 0.0;
      info.direction = 1.0;
      info.stopped = !!Number.isFinite(repeatCount);
      info.iterations = 0.0;
      return info;
    }
    var stopped = false;
    time -= playbackStart;
    var currentIterations = time > 0 ? time / playbackDuration : -(time / playbackDuration);
    if (currentIterations >= repeatCount) {
      currentIterations = repeatCount;
      stopped = true;
      var tempRatio = repeatCount - (repeatCount | 0);
      if (tempRatio === 0) {
        tempRatio = 1;
      }
      time = tempRatio * playbackDuration * (time > 0 ? 1 : -1);
    }
    if (time > playbackDuration) {
      var tempTime = time % playbackDuration;
      time = tempTime === 0 ? playbackDuration : tempTime;
    } else if (time < 0) {
      time %= playbackDuration;
      if (time !== 0) {
        time += playbackDuration;
      }
    }
    var needReverse = false;
    var shouldWrap = this._wrapMode & WrapModeMask.ShouldWrap;
    if (shouldWrap) {
      needReverse = this._needReverse(currentIterations);
    }
    var direction = needReverse ? -1 : 1;
    if (this.speed < 0) {
      direction *= -1;
    }
    if (shouldWrap && needReverse) {
      time = playbackDuration - time;
    }
    info.time = playbackStart + time;
    info.ratio = info.time / this.duration;
    info.direction = direction;
    info.stopped = stopped;
    info.iterations = currentIterations;
    return info;
  };
  _proto._getPlaybackStart = function _getPlaybackStart() {
    return this._playbackRange.min;
  };
  _proto._sampleEvents = function _sampleEvents(wrapInfo) {
    var _this$_clipEventEval2;
    (_this$_clipEventEval2 = this._clipEventEval) == null ? void 0 : _this$_clipEventEval2.sample(wrapInfo.ratio, wrapInfo.direction, wrapInfo.iterations);
  };
  _proto._sampleEmbeddedPlayers = function _sampleEmbeddedPlayers(wrapInfo) {
    var _this$_clipEmbeddedPl5;
    (_this$_clipEmbeddedPl5 = this._clipEmbeddedPlayerEval) == null ? void 0 : _this$_clipEmbeddedPl5.evaluate(wrapInfo.time, Math.trunc(wrapInfo.iterations));
  };
  _proto._emit = function _emit(type, state) {
    if (this._target && this._target.isValid) {
      this._target.emit(type, type, state);
    }
  };
  _proto._onReplayOrResume = function _onReplayOrResume() {
    getGlobalAnimationManager().addAnimation(this);
  };
  _proto._onPauseOrStop = function _onPauseOrStop() {
    getGlobalAnimationManager().removeAnimation(this);
  };
  return _createClass(AnimationState, [{
    key: "clip",
    get: function get() {
      return this._clip;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "length",
    get: function get() {
      return this.duration;
    }
  }, {
    key: "wrapMode",
    get: function get() {
      return this._wrapMode;
    },
    set: function set(value) {
      var _this$_clipEventEval3;
      this._wrapMode = value;
      this.time = 0;
      if (value & WrapModeMask.Loop) {
        this.repeatCount = Infinity;
      } else {
        this.repeatCount = 1;
      }
      (_this$_clipEventEval3 = this._clipEventEval) == null ? void 0 : _this$_clipEventEval3.setWrapMode(value);
    }
  }, {
    key: "repeatCount",
    get: function get() {
      return this._repeatCount;
    },
    set: function set(value) {
      this._repeatCount = value;
      var shouldWrap = this._wrapMode & WrapModeMask.ShouldWrap;
      var reverse = (this.wrapMode & WrapModeMask.Reverse) === WrapModeMask.Reverse;
      if (value === Infinity && !shouldWrap && !reverse) {
        this._useSimpleProcess = true;
      } else {
        this._useSimpleProcess = false;
      }
    }
  }, {
    key: "delay",
    get: function get() {
      return this._delay;
    },
    set: function set(value) {
      this._delayTime = this._delay = value;
    }
  }, {
    key: "playbackRange",
    get: function get() {
      return this._playbackRange;
    },
    set: function set(value) {
      assertIsTrue(value.max >= value.min);
      this._playbackRange.min = Math.max(value.min, 0);
      this._playbackRange.max = Math.min(value.max, this.duration);
      this._playbackDuration = this._playbackRange.max - this._playbackRange.min;
      this.setTime(0.0);
    }
  }, {
    key: "speed",
    get: function get() {
      return this._speed;
    },
    set: function set(value) {
      var _this$_clipEmbeddedPl6;
      this._speed = value;
      (_this$_clipEmbeddedPl6 = this._clipEmbeddedPlayerEval) == null ? void 0 : _this$_clipEmbeddedPl6.notifyHostSpeedChanged(value);
    }
  }, {
    key: "current",
    get: function get() {
      return this.getWrappedInfo(this.time).time;
    }
  }, {
    key: "ratio",
    get: function get() {
      return this.duration === 0.0 ? 0.0 : this.current / this.duration;
    }
  }, {
    key: "weight",
    get: function get() {
      return this._weight;
    },
    set: function set(value) {
      this._weight = value;
      if (this._poseOutput) {
        this._poseOutput.weight = value;
      }
    }
  }, {
    key: "curveLoaded",
    get: function get() {
      return this._curveLoaded;
    }
  }]);
}(Playable);
cclegacy.AnimationState = AnimationState;

var _dec$c, _class$c, _class2$9, _initializer$9, _dec2$6, _class3$5, _class4$5, _initializer2$7;
function isPropertyPath(path) {
  return typeof path === 'string' || typeof path === 'number';
}
function isCustomPath(path, constructor) {
  return path instanceof constructor;
}
var HierarchyPath = (_dec$c = ccclass$1('cc.animation.HierarchyPath'), _dec$c(_class$c = (_class2$9 = function () {
  function HierarchyPath(path) {
    this.path = _initializer$9 && _initializer$9();
    this.path = path || '';
  }
  var _proto = HierarchyPath.prototype;
  _proto.get = function get(target) {
    if (!(target instanceof Node)) {
      warnID(3925);
      return null;
    }
    var result = target.getChildByPath(this.path);
    if (!result) {
      warnID(3926, target.name, this.path);
      return null;
    }
    return result;
  };
  return HierarchyPath;
}(), _initializer$9 = applyDecoratedInitializer(_class2$9.prototype, "path", [serializable$1], function () {
  return '';
}), _class2$9)) || _class$c);
var ComponentPath = (_dec2$6 = ccclass$1('cc.animation.ComponentPath'), _dec2$6(_class3$5 = (_class4$5 = function () {
  function ComponentPath(component) {
    this.component = _initializer2$7 && _initializer2$7();
    this.component = component || '';
  }
  var _proto2 = ComponentPath.prototype;
  _proto2.get = function get(target) {
    if (!(target instanceof Node)) {
      warnID(3927);
      return null;
    }
    var result = target.getComponent(this.component);
    if (!result) {
      warnID(3928, target.name, this.component);
      return null;
    }
    return result;
  };
  return ComponentPath;
}(), _initializer2$7 = applyDecoratedInitializer(_class4$5.prototype, "component", [serializable$1], function () {
  return '';
}), _class4$5)) || _class3$5);

var _dec$b, _class$b, _class2$8, _initializer$8, _dec2$5, _class3$4, _class4$4, _initializer2$6, _initializer3$3, _TrackBinding, _dec3$2, _class5$1, _class6$1, _initializer4$3, _dec4$2, _class7$1, _class8$1, _initializer5$3, _dec5$2, _class9$1, _class0$1, _initializer6$3;
var normalizedFollowTag = Symbol('NormalizedFollow');
var parseTrsPathTag = Symbol('ConvertAsTrsPath');
var trackBindingTag = Symbol('TrackBinding');
var TrackPath = (_dec$b = ccclass$1(CLASS_NAME_PREFIX_ANIM + "TrackPath"), _dec$b(_class$b = (_class2$8 = function () {
  function TrackPath() {
    this._paths = _initializer$8 && _initializer$8();
  }
  var _proto = TrackPath.prototype;
  _proto.toProperty = function toProperty(name) {
    this._paths.push(name);
    return this;
  };
  _proto.toElement = function toElement(index) {
    this._paths.push(index);
    return this;
  };
  _proto.toHierarchy = function toHierarchy(nodePath) {
    this._paths.push(new HierarchyPath(nodePath));
    return this;
  };
  _proto.toComponent = function toComponent(constructor) {
    var path = new ComponentPath(typeof constructor === 'string' ? constructor : getClassName(constructor));
    this._paths.push(path);
    return this;
  };
  _proto.toCustomized = function toCustomized(resolver) {
    this._paths.push(resolver);
    return this;
  };
  _proto.append = function append() {
    var _this$_paths;
    for (var _len = arguments.length, trackPaths = new Array(_len), _key = 0; _key < _len; _key++) {
      trackPaths[_key] = arguments[_key];
    }
    var paths = (_this$_paths = this._paths).concat.apply(_this$_paths, trackPaths.map(function (trackPath) {
      return trackPath._paths;
    }));
    this._paths = paths;
    return this;
  };
  _proto.isPropertyAt = function isPropertyAt(index) {
    return typeof this._paths[index] === 'string';
  };
  _proto.parsePropertyAt = function parsePropertyAt(index) {
    return this._paths[index];
  };
  _proto.isElementAt = function isElementAt(index) {
    return typeof this._paths[index] === 'number';
  };
  _proto.parseElementAt = function parseElementAt(index) {
    return this._paths[index];
  };
  _proto.isHierarchyAt = function isHierarchyAt(index) {
    return this._paths[index] instanceof HierarchyPath;
  };
  _proto.parseHierarchyAt = function parseHierarchyAt(index) {
    assertIsTrue(this.isHierarchyAt(index));
    return this._paths[index].path;
  };
  _proto.isComponentAt = function isComponentAt(index) {
    return this._paths[index] instanceof ComponentPath;
  };
  _proto.parseComponentAt = function parseComponentAt(index) {
    assertIsTrue(this.isComponentAt(index));
    return this._paths[index].component;
  };
  _proto.slice = function slice(beginIndex, endIndex) {
    var trackPath = new TrackPath();
    trackPath._paths = this._paths.slice(beginIndex, endIndex);
    return trackPath;
  };
  _proto.trace = function trace(object, beginIndex, endIndex) {
    var _beginIndex, _endIndex;
    (_beginIndex = beginIndex) !== null && _beginIndex !== void 0 ? _beginIndex : beginIndex = 0;
    (_endIndex = endIndex) !== null && _endIndex !== void 0 ? _endIndex : endIndex = this._paths.length;
    return this[normalizedFollowTag](object, beginIndex, endIndex);
  };
  _proto[parseTrsPathTag] = function () {
    var paths = this._paths;
    var nPaths = paths.length;
    var iPath = 0;
    var nodePath = '';
    for (; iPath < nPaths; ++iPath) {
      var path = paths[iPath];
      if (!(path instanceof HierarchyPath)) {
        break;
      } else if (!path.path) {
        continue;
      } else if (nodePath) {
        nodePath += "/" + path.path;
      } else {
        nodePath = path.path;
      }
    }
    if (iPath === nPaths) {
      return null;
    }
    var prs;
    if (iPath !== nPaths - 1) {
      return null;
    }
    switch (paths[iPath]) {
      case 'position':
      case 'scale':
      case 'rotation':
      case 'eulerAngles':
        prs = paths[iPath];
        break;
      default:
        return null;
    }
    return {
      node: nodePath,
      property: prs
    };
  };
  _proto[normalizedFollowTag] = function (root, beginIndex, endIndex) {
    var paths = this._paths;
    var result = root;
    for (var iPath = beginIndex; iPath < endIndex; ++iPath) {
      var path = paths[iPath];
      if (isPropertyPath(path)) {
        if (!(path in result)) {
          warnID(3929, path);
          return null;
        } else {
          result = result[path];
        }
      } else {
        result = path.get(result);
      }
      if (result === null) {
        break;
      }
    }
    return result;
  };
  return _createClass(TrackPath, [{
    key: "length",
    get: function get() {
      return this._paths.length;
    }
  }]);
}(), _initializer$8 = applyDecoratedInitializer(_class2$8.prototype, "_paths", [serializable$1], function () {
  return [];
}), _class2$8)) || _class$b);
var TrackBinding = (_dec2$5 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "TrackBinding"), _dec2$5(_class3$4 = uniquelyReferenced(_class3$4 = (_class4$4 = (_TrackBinding = function () {
  function TrackBinding() {
    this.path = _initializer2$6 && _initializer2$6();
    this.proxy = _initializer3$3 && _initializer3$3();
  }
  var _proto2 = TrackBinding.prototype;
  _proto2.parseTrsPath = function parseTrsPath() {
    if (this.proxy) {
      return null;
    } else {
      return this.path[parseTrsPathTag]();
    }
  };
  _proto2.createRuntimeBinding = function createRuntimeBinding(target, poseOutput, isConstant) {
    var path = this.path,
      proxy = this.proxy;
    var nPaths = path.length;
    var iLastPath = nPaths - 1;
    if (nPaths !== 0 && (path.isPropertyAt(iLastPath) || path.isElementAt(iLastPath)) && !proxy) {
      var lastPropertyKey = path.isPropertyAt(iLastPath) ? path.parsePropertyAt(iLastPath) : path.parseElementAt(iLastPath);
      var resultTarget = path[normalizedFollowTag](target, 0, nPaths - 1);
      if (resultTarget === null) {
        return null;
      }
      if (poseOutput && resultTarget instanceof Node && isTrsPropertyName(lastPropertyKey)) {
        var blendStateWriter = poseOutput.createPoseWriter(resultTarget, lastPropertyKey, isConstant);
        return blendStateWriter;
      }
      var _setValue;
      var _getValue;
      {
        _setValue = function _setValue(value) {
          resultTarget[lastPropertyKey] = value;
        };
        _getValue = function _getValue() {
          return resultTarget[lastPropertyKey];
        };
      }
      return {
        target: resultTarget,
        setValue: _setValue,
        getValue: _getValue
      };
    } else if (!proxy) {
      errorID(3921);
      return null;
    } else {
      var _resultTarget = path[normalizedFollowTag](target, 0, nPaths);
      if (_resultTarget === null) {
        return null;
      }
      var runtimeProxy = proxy.forTarget(_resultTarget);
      if (!runtimeProxy) {
        return null;
      }
      var _binding = {
        setValue: function setValue(value) {
          runtimeProxy.set(value);
        }
      };
      var proxyGet = runtimeProxy.get;
      if (proxyGet) {
        _binding.getValue = function () {
          return proxyGet.call(runtimeProxy);
        };
      }
      return _binding;
    }
  };
  _proto2.isMaskedOff = function isMaskedOff(mask) {
    var trsPath = this.parseTrsPath();
    if (!trsPath) {
      return false;
    }
    var joints = mask.joints[Symbol.iterator]();
    for (var jointMaskInfoIter = joints.next(); !jointMaskInfoIter.done; jointMaskInfoIter = joints.next()) {
      var _jointMaskInfoIter = jointMaskInfoIter,
        jointMaskInfo = _jointMaskInfoIter.value;
      if (jointMaskInfo.path !== trsPath.node) {
        continue;
      }
      return !jointMaskInfo.enabled;
    }
    return false;
  };
  return TrackBinding;
}(), _TrackBinding._animationFunctions = new WeakMap(), _TrackBinding), _initializer2$6 = applyDecoratedInitializer(_class4$4.prototype, "path", [serializable$1], function () {
  return new TrackPath();
}), _initializer3$3 = applyDecoratedInitializer(_class4$4.prototype, "proxy", [serializable$1], null), _class4$4)) || _class3$4) || _class3$4);
function isTrsPropertyName(name) {
  return name === 'position' || name === 'rotation' || name === 'scale' || name === 'eulerAngles';
}
var Track = (_dec3$2 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "Track"), _dec3$2(_class5$1 = (_class6$1 = function () {
  function Track() {
    this._binding = _initializer4$3 && _initializer4$3();
  }
  var _proto3 = Track.prototype;
  _proto3.channels = function channels() {
    return [];
  };
  _proto3.range = function range() {
    var range = {
      min: Infinity,
      max: -Infinity
    };
    for (var _iterator = _createForOfIteratorHelperLoose(this.channels()), _step; !(_step = _iterator()).done;) {
      var channel = _step.value;
      range.min = Math.min(range.min, channel.curve.rangeMin);
      range.max = Math.max(range.max, channel.curve.rangeMax);
    }
    return range;
  };
  return _createClass(Track, [{
    key: "path",
    get: function get() {
      return this._binding.path;
    },
    set: function set(value) {
      this._binding.path = value;
    }
  }, {
    key: "proxy",
    get: function get() {
      return this._binding.proxy;
    },
    set: function set(value) {
      this._binding.proxy = value;
    }
  }, {
    key: trackBindingTag,
    get: function get() {
      return this._binding;
    }
  }]);
}(), _initializer4$3 = applyDecoratedInitializer(_class6$1.prototype, "_binding", [serializable$1], function () {
  return new TrackBinding();
}), _class6$1)) || _class5$1);
var Channel = (_dec4$2 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "Channel"), _dec4$2(_class7$1 = (_class8$1 = function () {
  function Channel(curve) {
    this.name = '';
    this._curve = _initializer5$3 && _initializer5$3();
    this._curve = curve;
  }
  return _createClass(Channel, [{
    key: "curve",
    get: function get() {
      return this._curve;
    }
  }]);
}(), _initializer5$3 = applyDecoratedInitializer(_class8$1.prototype, "_curve", [serializable$1], null), _class8$1)) || _class7$1);
var SingleChannelTrack = (_dec5$2 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "SingleChannelTrack"), _dec5$2(_class9$1 = (_class0$1 = function (_Track2) {
  function SingleChannelTrack() {
    var _this;
    _this = _Track2.call(this) || this;
    _this._channel = _initializer6$3 && _initializer6$3();
    _this._channel = new Channel(_this.createCurve());
    return _this;
  }
  _inheritsLoose(SingleChannelTrack, _Track2);
  var _proto4 = SingleChannelTrack.prototype;
  _proto4.channels = function channels() {
    return [this._channel];
  };
  _proto4.createCurve = function createCurve() {
    throw new Error("Not impl");
  };
  _proto4[createEvalSymbol] = function () {
    var curve = this._channel.curve;
    return new SingleChannelTrackEval(curve);
  };
  return _createClass(SingleChannelTrack, [{
    key: "channel",
    get: function get() {
      return this._channel;
    }
  }]);
}(Track), _initializer6$3 = applyDecoratedInitializer(_class0$1.prototype, "_channel", [serializable$1], null), _class0$1)) || _class9$1);
var SingleChannelTrackEval = function () {
  function SingleChannelTrackEval(_curve) {
    this._curve = _curve;
  }
  var _proto5 = SingleChannelTrackEval.prototype;
  _proto5.evaluate = function evaluate(time) {
    return this._curve.evaluate(time);
  };
  return _createClass(SingleChannelTrackEval, [{
    key: "requiresDefault",
    get: function get() {
      return false;
    }
  }]);
}();

var _dec2$4, _class3$3, _class4$3, _initializer4$2, _initializer5$2, _initializer6$2;
function makeCubicSplineValueConstructor(name, ConstructorX, scaleFx, scaleAndAdd) {
  var _dec, _class, _class2, _initializer, _initializer2, _initializer3;
  var tempValue = new ConstructorX();
  var m0 = new ConstructorX();
  var m1 = new ConstructorX();
  var CubicSplineValueClass = (_dec = ccclass$1(name), _dec(_class = (_class2 = function () {
    function CubicSplineValueClass(dataPoint, inTangent, outTangent) {
      this.dataPoint = _initializer && _initializer();
      this.inTangent = _initializer2 && _initializer2();
      this.outTangent = _initializer3 && _initializer3();
      this.dataPoint = dataPoint || new ConstructorX();
      this.inTangent = inTangent || new ConstructorX();
      this.outTangent = outTangent || new ConstructorX();
    }
    var _proto = CubicSplineValueClass.prototype;
    _proto.lerp = function lerp(to, t, dt) {
      var p0 = this.dataPoint;
      var p1 = to.dataPoint;
      m0 = scaleFx(m0, this.inTangent, dt);
      m1 = scaleFx(m1, to.outTangent, dt);
      var t_3 = t * t * t;
      var t_2 = t * t;
      var f_0 = 2 * t_3 - 3 * t_2 + 1;
      var f_1 = t_3 - 2 * t_2 + t;
      var f_2 = -2 * t_3 + 3 * t_2;
      var f_3 = t_3 - t_2;
      tempValue = scaleFx(tempValue, p0, f_0);
      tempValue = scaleAndAdd(tempValue, tempValue, m0, f_1);
      tempValue = scaleAndAdd(tempValue, tempValue, p1, f_2);
      tempValue = scaleAndAdd(tempValue, tempValue, m1, f_3);
      return tempValue;
    };
    _proto.getNoLerp = function getNoLerp() {
      return this.dataPoint;
    };
    return CubicSplineValueClass;
  }(), _initializer = applyDecoratedInitializer(_class2.prototype, "dataPoint", [serializable$1], function () {
    return new ConstructorX();
  }), _initializer2 = applyDecoratedInitializer(_class2.prototype, "inTangent", [serializable$1], function () {
    return new ConstructorX();
  }), _initializer3 = applyDecoratedInitializer(_class2.prototype, "outTangent", [serializable$1], function () {
    return new ConstructorX();
  }), _class2)) || _class);
  if (ConstructorX === Quat) {
    var _lerp = CubicSplineValueClass.prototype.lerp;
    CubicSplineValueClass.prototype.lerp = function (to, t, dt) {
      var result = _lerp.call(this, to, t, dt);
      Quat.normalize(result, result);
      return result;
    };
  }
  return CubicSplineValueClass;
}
var CubicSplineVec2Value = makeCubicSplineValueConstructor('cc.CubicSplineVec2Value', Vec2, Vec2.multiplyScalar, Vec2.scaleAndAdd);
var CubicSplineVec3Value = makeCubicSplineValueConstructor('cc.CubicSplineVec3Value', Vec3, Vec3.multiplyScalar, Vec3.scaleAndAdd);
var CubicSplineVec4Value = makeCubicSplineValueConstructor('cc.CubicSplineVec4Value', Vec4, Vec4.multiplyScalar, Vec4.scaleAndAdd);
var CubicSplineQuatValue = makeCubicSplineValueConstructor('cc.CubicSplineQuatValue', Quat, Quat.multiplyScalar, Quat.scaleAndAdd);
var CubicSplineNumberValue = (_dec2$4 = ccclass$1('cc.CubicSplineNumberValue'), _dec2$4(_class3$3 = (_class4$3 = function () {
  function CubicSplineNumberValue(dataPoint, inTangent, outTangent) {
    this.dataPoint = _initializer4$2 && _initializer4$2();
    this.inTangent = _initializer5$2 && _initializer5$2();
    this.outTangent = _initializer6$2 && _initializer6$2();
    this.dataPoint = dataPoint;
    this.inTangent = inTangent;
    this.outTangent = outTangent;
  }
  var _proto2 = CubicSplineNumberValue.prototype;
  _proto2.lerp = function lerp(to, t, dt) {
    var p0 = this.dataPoint;
    var p1 = to.dataPoint;
    var m0 = this.outTangent * dt;
    var m1 = to.inTangent * dt;
    var t_3 = t * t * t;
    var t_2 = t * t;
    var f_0 = 2 * t_3 - 3 * t_2 + 1;
    var f_1 = t_3 - 2 * t_2 + t;
    var f_2 = -2 * t_3 + 3 * t_2;
    var f_3 = t_3 - t_2;
    return p0 * f_0 + m0 * f_1 + p1 * f_2 + m1 * f_3;
  };
  _proto2.getNoLerp = function getNoLerp() {
    return this.dataPoint;
  };
  return CubicSplineNumberValue;
}(), _initializer4$2 = applyDecoratedInitializer(_class4$3.prototype, "dataPoint", [serializable$1], function () {
  return 0;
}), _initializer5$2 = applyDecoratedInitializer(_class4$3.prototype, "inTangent", [serializable$1], function () {
  return 0;
}), _initializer6$2 = applyDecoratedInitializer(_class4$3.prototype, "outTangent", [serializable$1], function () {
  return 0;
}), _class4$3)) || _class3$3);

var _dec$a, _class$a;
var RealTrack = (_dec$a = ccclass$1(CLASS_NAME_PREFIX_ANIM + "RealTrack"), _dec$a(_class$a = function (_SingleChannelTrack) {
  function RealTrack() {
    return _SingleChannelTrack.apply(this, arguments) || this;
  }
  _inheritsLoose(RealTrack, _SingleChannelTrack);
  var _proto = RealTrack.prototype;
  _proto.createCurve = function createCurve() {
    return new RealCurve();
  };
  return RealTrack;
}(SingleChannelTrack)) || _class$a);

function maskIfEmpty(curve) {
  return curve.keyFramesCount === 0 ? undefined : curve;
}

var _dec$9, _class$9, _class2$7, _initializer$7, _initializer2$5;
var CHANNEL_NAMES$2 = ['X', 'Y', 'Z', 'W'];
var VectorTrack = (_dec$9 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "VectorTrack"), _dec$9(_class$9 = (_class2$7 = function (_Track) {
  function VectorTrack() {
    var _this;
    _this = _Track.call(this) || this;
    _this._channels = _initializer$7 && _initializer$7();
    _this._nComponents = _initializer2$5 && _initializer2$5();
    _this._channels = new Array(4);
    for (var i = 0; i < _this._channels.length; ++i) {
      var channel = new Channel(new RealCurve());
      channel.name = CHANNEL_NAMES$2[i];
      _this._channels[i] = channel;
    }
    return _this;
  }
  _inheritsLoose(VectorTrack, _Track);
  var _proto = VectorTrack.prototype;
  _proto.channels = function channels() {
    return this._channels;
  };
  _proto[createEvalSymbol] = function () {
    switch (this._nComponents) {
      default:
      case 2:
        return new Vec2TrackEval(maskIfEmpty(this._channels[0].curve), maskIfEmpty(this._channels[1].curve));
      case 3:
        return new Vec3TrackEval(maskIfEmpty(this._channels[0].curve), maskIfEmpty(this._channels[1].curve), maskIfEmpty(this._channels[2].curve));
      case 4:
        return new Vec4TrackEval(maskIfEmpty(this._channels[0].curve), maskIfEmpty(this._channels[1].curve), maskIfEmpty(this._channels[2].curve), maskIfEmpty(this._channels[3].curve));
    }
  };
  return _createClass(VectorTrack, [{
    key: "componentsCount",
    get: function get() {
      return this._nComponents;
    },
    set: function set(value) {
      this._nComponents = value;
    }
  }]);
}(Track), _initializer$7 = applyDecoratedInitializer(_class2$7.prototype, "_channels", [serializable$1], null), _initializer2$5 = applyDecoratedInitializer(_class2$7.prototype, "_nComponents", [serializable$1], function () {
  return 4;
}), _class2$7)) || _class$9);
var Vec2TrackEval = function () {
  function Vec2TrackEval(_x, _y) {
    this._result = new Vec2();
    this._x = _x;
    this._y = _y;
  }
  var _proto2 = Vec2TrackEval.prototype;
  _proto2.evaluate = function evaluate(time, defaultValue) {
    if (defaultValue) {
      Vec2.copy(this._result, defaultValue);
    }
    if (this._x) {
      this._result.x = this._x.evaluate(time);
    }
    if (this._y) {
      this._result.y = this._y.evaluate(time);
    }
    return this._result;
  };
  return _createClass(Vec2TrackEval, [{
    key: "requiresDefault",
    get: function get() {
      return !this._x || !this._y;
    }
  }]);
}();
var Vec3TrackEval = function () {
  function Vec3TrackEval(_x, _y, _z) {
    this._result = new Vec3();
    this._x = _x;
    this._y = _y;
    this._z = _z;
  }
  var _proto3 = Vec3TrackEval.prototype;
  _proto3.evaluate = function evaluate(time, defaultValue) {
    var _x = this._x,
      _y = this._y,
      _z = this._z,
      _result = this._result;
    if (defaultValue) {
      Vec3.copy(_result, defaultValue);
    }
    if (_x) {
      _result.x = _x.evaluate(time);
    }
    if (_y) {
      _result.y = _y.evaluate(time);
    }
    if (_z) {
      _result.z = _z.evaluate(time);
    }
    return _result;
  };
  return _createClass(Vec3TrackEval, [{
    key: "requiresDefault",
    get: function get() {
      return !this._x || !this._y || !this._z;
    }
  }]);
}();
var Vec4TrackEval = function () {
  function Vec4TrackEval(_x, _y, _z, _w) {
    this._result = new Vec4();
    this._x = _x;
    this._y = _y;
    this._z = _z;
    this._w = _w;
  }
  var _proto4 = Vec4TrackEval.prototype;
  _proto4.evaluate = function evaluate(time, defaultValue) {
    if (defaultValue) {
      Vec4.copy(this._result, defaultValue);
    }
    if (this._x) {
      this._result.x = this._x.evaluate(time);
    }
    if (this._y) {
      this._result.y = this._y.evaluate(time);
    }
    if (this._z) {
      this._result.z = this._z.evaluate(time);
    }
    if (this._w) {
      this._result.w = this._w.evaluate(time);
    }
    return this._result;
  };
  return _createClass(Vec4TrackEval, [{
    key: "requiresDefault",
    get: function get() {
      return !this._x || !this._y || !this._z || !this._w;
    }
  }]);
}();

var _dec$8, _class$8;
var QuatTrack = (_dec$8 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "QuatTrack"), _dec$8(_class$8 = function (_SingleChannelTrack) {
  function QuatTrack() {
    return _SingleChannelTrack.apply(this, arguments) || this;
  }
  _inheritsLoose(QuatTrack, _SingleChannelTrack);
  var _proto = QuatTrack.prototype;
  _proto.createCurve = function createCurve() {
    return new QuatCurve();
  };
  _proto[createEvalSymbol] = function () {
    return new QuatTrackEval(this.channels()[0].curve);
  };
  return QuatTrack;
}(SingleChannelTrack)) || _class$8);
var QuatTrackEval = function () {
  function QuatTrackEval(_curve) {
    this._result = new Quat();
    this._curve = _curve;
  }
  var _proto2 = QuatTrackEval.prototype;
  _proto2.evaluate = function evaluate(time) {
    this._curve.evaluate(time, this._result);
    return this._result;
  };
  return _createClass(QuatTrackEval, [{
    key: "requiresDefault",
    get: function get() {
      return false;
    }
  }]);
}();

var _dec$7, _class$7, _class2$6, _initializer$6;
var CHANNEL_NAMES$1 = ['Red', 'Green', 'Blue', 'Alpha'];
var ColorTrack = (_dec$7 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "ColorTrack"), _dec$7(_class$7 = (_class2$6 = function (_Track) {
  function ColorTrack() {
    var _this;
    _this = _Track.call(this) || this;
    _this._channels = _initializer$6 && _initializer$6();
    _this._channels = new Array(4);
    for (var i = 0; i < _this._channels.length; ++i) {
      var channel = new Channel(new RealCurve());
      channel.name = CHANNEL_NAMES$1[i];
      _this._channels[i] = channel;
    }
    return _this;
  }
  _inheritsLoose(ColorTrack, _Track);
  var _proto = ColorTrack.prototype;
  _proto.channels = function channels() {
    return this._channels;
  };
  _proto[createEvalSymbol] = function () {
    return new ColorTrackEval(maskIfEmpty(this._channels[0].curve), maskIfEmpty(this._channels[1].curve), maskIfEmpty(this._channels[2].curve), maskIfEmpty(this._channels[3].curve));
  };
  return ColorTrack;
}(Track), _initializer$6 = applyDecoratedInitializer(_class2$6.prototype, "_channels", [serializable$1], null), _class2$6)) || _class$7);
var ColorTrackEval = function () {
  function ColorTrackEval(_x, _y, _z, _w) {
    this._result = new Color();
    this._x = _x;
    this._y = _y;
    this._z = _z;
    this._w = _w;
  }
  var _proto2 = ColorTrackEval.prototype;
  _proto2.evaluate = function evaluate(time, defaultValue) {
    if (defaultValue) {
      Color.copy(this._result, defaultValue);
    }
    if (this._x) {
      this._result.r = this._x.evaluate(time);
    }
    if (this._y) {
      this._result.g = this._y.evaluate(time);
    }
    if (this._z) {
      this._result.b = this._z.evaluate(time);
    }
    if (this._w) {
      this._result.a = this._w.evaluate(time);
    }
    return this._result;
  };
  return _createClass(ColorTrackEval, [{
    key: "requiresDefault",
    get: function get() {
      return !this._x || !this._y || !this._z || !this._w;
    }
  }]);
}();

var _dec$6, _class$6, _class2$5, _initializer$5;
var CHANNEL_NAMES = ['Width', 'Height'];
var SizeTrack = (_dec$6 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "SizeTrack"), _dec$6(_class$6 = (_class2$5 = function (_Track) {
  function SizeTrack() {
    var _this;
    _this = _Track.call(this) || this;
    _this._channels = _initializer$5 && _initializer$5();
    _this._channels = new Array(2);
    for (var i = 0; i < _this._channels.length; ++i) {
      var channel = new Channel(new RealCurve());
      channel.name = CHANNEL_NAMES[i];
      _this._channels[i] = channel;
    }
    return _this;
  }
  _inheritsLoose(SizeTrack, _Track);
  var _proto = SizeTrack.prototype;
  _proto.channels = function channels() {
    return this._channels;
  };
  _proto[createEvalSymbol] = function () {
    return new SizeTrackEval(maskIfEmpty(this._channels[0].curve), maskIfEmpty(this._channels[1].curve));
  };
  return SizeTrack;
}(Track), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "_channels", [serializable$1], null), _class2$5)) || _class$6);
var SizeTrackEval = function () {
  function SizeTrackEval(_width, _height) {
    this._result = new Size();
    this._width = _width;
    this._height = _height;
  }
  var _proto2 = SizeTrackEval.prototype;
  _proto2.evaluate = function evaluate(time, defaultValue) {
    if (defaultValue) {
      this._result.x = defaultValue.x;
      this._result.y = defaultValue.y;
    }
    if (this._width) {
      this._result.width = this._width.evaluate(time);
    }
    if (this._height) {
      this._result.height = this._height.evaluate(time);
    }
    return this._result;
  };
  return _createClass(SizeTrackEval, [{
    key: "requiresDefault",
    get: function get() {
      return !this._width || !this._height;
    }
  }]);
}();

var _dec$5, _class$5;
var ObjectTrack = (_dec$5 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "ObjectTrack"), _dec$5(_class$5 = function (_SingleChannelTrack) {
  function ObjectTrack() {
    return _SingleChannelTrack.apply(this, arguments) || this;
  }
  _inheritsLoose(ObjectTrack, _SingleChannelTrack);
  var _proto = ObjectTrack.prototype;
  _proto.createCurve = function createCurve() {
    return new ObjectCurve();
  };
  return ObjectTrack;
}(SingleChannelTrack)) || _class$5);

function invokeComponentMethodsEngagedInAnimationEvent(node, methodName, args) {
  var components = node.components;
  var nComponents = components.length;
  for (var iComponent = 0; iComponent < nComponents; ++iComponent) {
    var component = components[iComponent];
    var fx = component[methodName];
    if (typeof fx === 'function') {
      fx.apply(component, args);
    }
  }
}

var RatioSampler = function () {
  function RatioSampler(ratios) {
    this.ratios = void 0;
    this._findRatio = void 0;
    this.ratios = ratios;
    var currRatioDif;
    var lastRatioDif;
    var canOptimize = true;
    var EPSILON = 1e-6;
    for (var i = 1, l = ratios.length; i < l; i++) {
      currRatioDif = ratios[i] - ratios[i - 1];
      if (i === 1) {
        lastRatioDif = currRatioDif;
      } else if (Math.abs(currRatioDif - lastRatioDif) > EPSILON) {
        canOptimize = false;
        break;
      }
    }
    this._findRatio = canOptimize ? quickFindIndex : binarySearchEpsilon;
  }
  var _proto = RatioSampler.prototype;
  _proto.sample = function sample(ratio) {
    return this._findRatio(this.ratios, ratio);
  };
  return RatioSampler;
}();
cclegacy.RatioSampler = RatioSampler;
var AnimCurve = function () {
  function AnimCurve(propertyCurveData, duration) {
    this.types = undefined;
    this.type = null;
    this._values = [];
    this._lerp = undefined;
    this._duration = void 0;
    this._array = void 0;
    this._duration = duration;
    this._values = propertyCurveData.values;
    var getCurveType = function getCurveType(easingMethod) {
      if (typeof easingMethod === 'string') {
        return easingMethod;
      } else if (Array.isArray(easingMethod)) {
        if (easingMethod[0] === easingMethod[1] && easingMethod[2] === easingMethod[3]) {
          return AnimCurve.Linear;
        } else {
          return AnimCurve.Bezier(easingMethod);
        }
      } else {
        return AnimCurve.Linear;
      }
    };
    if (propertyCurveData.easingMethod !== undefined) {
      this.type = getCurveType(propertyCurveData.easingMethod);
    } else if (Array.isArray(propertyCurveData.easingMethods)) {
      this.types = propertyCurveData.easingMethods.map(getCurveType);
    } else if (propertyCurveData.easingMethods !== undefined) {
      this.types = new Array(this._values.length).fill(null);
      for (var _i = 0, _Object$keys = Object.keys(propertyCurveData.easingMethods); _i < _Object$keys.length; _i++) {
        var index = _Object$keys[_i];
        this.types[index] = getCurveType(propertyCurveData.easingMethods[index]);
      }
    } else {
      this.type = null;
    }
    var firstValue = propertyCurveData.values[0];
    var interpolate = propertyCurveData.interpolate === undefined ? true : propertyCurveData.interpolate;
    if (interpolate) {
      this._lerp = selectLerpFx(firstValue);
    }
    if (propertyCurveData._arrayLength !== undefined) {
      this._array = new Array(propertyCurveData._arrayLength);
    }
  }
  AnimCurve.Bezier = function Bezier(controlPoints) {
    return controlPoints;
  };
  var _proto2 = AnimCurve.prototype;
  _proto2.hasLerp = function hasLerp() {
    return !!this._lerp;
  };
  _proto2.valueAt = function valueAt(index) {
    if (this._array === undefined) {
      var value = this._values[index];
      if (value && value.getNoLerp) {
        return value.getNoLerp();
      } else {
        return value;
      }
    } else {
      for (var i = 0; i < this._array.length; ++i) {
        this._array[i] = this._values[this._array.length * index + i];
      }
      return this._array;
    }
  };
  _proto2.valueBetween = function valueBetween(ratio, from, fromRatio, to, toRatio) {
    if (this._lerp) {
      var type = this.types ? this.types[from] : this.type;
      var dRatio = toRatio - fromRatio;
      var ratioBetweenFrames = (ratio - fromRatio) / dRatio;
      if (type) {
        ratioBetweenFrames = computeRatioByType(ratioBetweenFrames, type);
      }
      if (this._array === undefined) {
        var fromVal = this._values[from];
        var toVal = this._values[to];
        var value = this._lerp(fromVal, toVal, ratioBetweenFrames, dRatio * this._duration);
        return value;
      } else {
        for (var i = 0; i < this._array.length; ++i) {
          var _fromVal = this._values[this._array.length * from + i];
          var _toVal = this._values[this._array.length * to + i];
          this._array[i] = this._lerp(_fromVal, _toVal, ratioBetweenFrames, dRatio * this._duration);
        }
        return this._array;
      }
    } else if (this._array === undefined) {
      return this.valueAt(from);
    } else {
      for (var _i2 = 0; _i2 < this._array.length; ++_i2) {
        this._array[_i2] = this._values[this._array.length * from + _i2];
      }
      return this._array;
    }
  };
  _proto2.empty = function empty() {
    return this._values.length === 0;
  };
  _proto2.constant = function constant() {
    return this._values.length === 1;
  };
  return AnimCurve;
}();
AnimCurve.Linear = null;
cclegacy.AnimCurve = AnimCurve;
var EventInfo = function () {
  function EventInfo() {
    this.events = [];
  }
  var _proto3 = EventInfo.prototype;
  _proto3.add = function add(func, params) {
    this.events.push({
      func: func || '',
      params: params || []
    });
  };
  return EventInfo;
}();
function sampleAnimationCurve(curve, sampler, ratio) {
  var index = sampler.sample(ratio);
  if (index < 0) {
    index = ~index;
    if (index <= 0) {
      index = 0;
    } else if (index >= sampler.ratios.length) {
      index = sampler.ratios.length - 1;
    } else {
      return curve.valueBetween(ratio, index - 1, sampler.ratios[index - 1], index, sampler.ratios[index]);
    }
  }
  return curve.valueAt(index);
}
cclegacy.sampleAnimationCurve = sampleAnimationCurve;
function computeRatioByType(ratio, type) {
  if (typeof type === 'string') {
    var func = easing[type];
    if (func) {
      ratio = func(ratio);
    } else {
      errorID(3906, type);
    }
  } else if (Array.isArray(type)) {
    ratio = bezierByTime(type, ratio);
  }
  return ratio;
}
function quickFindIndex(ratios, ratio) {
  var length = ratios.length - 1;
  if (length === 0) {
    return 0;
  }
  var start = ratios[0];
  if (ratio < start) {
    return 0;
  }
  var end = ratios[length];
  if (ratio > end) {
    return length;
  }
  ratio = (ratio - start) / (end - start);
  var eachLength = 1 / length;
  var index = ratio / eachLength;
  var floorIndex = index | 0;
  var EPSILON = 1e-6;
  if (index - floorIndex < EPSILON) {
    return floorIndex;
  } else if (floorIndex + 1 - index < EPSILON) {
    return floorIndex + 1;
  }
  return ~(floorIndex + 1);
}
var selectLerpFx = function () {
  function makeValueTypeLerpFx(constructor) {
    var tempValue = new constructor();
    return function (from, to, ratio) {
      constructor.lerp(tempValue, from, to, ratio);
      return tempValue;
    };
  }
  function callLerpable(from, to, t, dt) {
    return from.lerp(to, t, dt);
  }
  function makeQuatSlerpFx() {
    var tempValue = new Quat();
    return function (from, to, t, dt) {
      return Quat.slerp(tempValue, from, to, t);
    };
  }
  return function (value) {
    if (value === null) {
      return undefined;
    }
    if (typeof value === 'number') {
      return lerp;
    } else if (typeof value === 'object' && value.constructor) {
      if (value instanceof Quat) {
        return makeQuatSlerpFx();
      } else if (value instanceof ValueType) {
        return makeValueTypeLerpFx(value.constructor);
      } else if (value.constructor === Number) {
        return lerp;
      } else if (isLerpable(value)) {
        return callLerpable;
      }
    }
    return undefined;
  };
}();

var _dec$4, _class$4, _class2$4, _initializer$4, _dec2$3, _class3$2, _class4$2, _initializer2$4;
var UntypedTrackChannel = (_dec$4 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "UntypedTrackChannel"), _dec$4(_class$4 = (_class2$4 = function (_Channel) {
  function UntypedTrackChannel() {
    var _this;
    _this = _Channel.call(this, new RealCurve()) || this;
    _this.property = _initializer$4 && _initializer$4();
    return _this;
  }
  _inheritsLoose(UntypedTrackChannel, _Channel);
  return UntypedTrackChannel;
}(Channel), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "property", [serializable$1], function () {
  return '';
}), _class2$4)) || _class$4);
var UntypedTrack = (_dec2$3 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "UntypedTrack"), _dec2$3(_class3$2 = (_class4$2 = function (_Track) {
  function UntypedTrack() {
    var _this2;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this2 = _Track.call.apply(_Track, [this].concat(args)) || this;
    _this2._channels = _initializer2$4 && _initializer2$4();
    return _this2;
  }
  _inheritsLoose(UntypedTrack, _Track);
  var _proto = UntypedTrack.prototype;
  _proto.channels = function channels() {
    return this._channels;
  };
  _proto[createEvalSymbol] = function () {
    throw new Error("UntypedTrack should be handled specially. Please file an issue.");
  };
  _proto.createLegacyEval = function createLegacyEval(hintValue) {
    var _this3 = this;
    var trySearchCurve = function trySearchCurve(property) {
      var _this3$_channels$find;
      return (_this3$_channels$find = _this3._channels.find(function (channel) {
        return channel.property === property;
      })) == null ? void 0 : _this3$_channels$find.curve;
    };
    switch (true) {
      default:
        throw new Error(getError(3931));
      case hintValue instanceof Vec2:
        return new Vec2TrackEval(trySearchCurve('x'), trySearchCurve('y'));
      case hintValue instanceof Vec3:
        return new Vec3TrackEval(trySearchCurve('x'), trySearchCurve('y'), trySearchCurve('z'));
      case hintValue instanceof Vec4:
        return new Vec4TrackEval(trySearchCurve('x'), trySearchCurve('y'), trySearchCurve('z'), trySearchCurve('w'));
      case hintValue instanceof Color:
        return new ColorTrackEval(trySearchCurve('r'), trySearchCurve('g'), trySearchCurve('b'), trySearchCurve('a'));
      case hintValue instanceof Size:
        return new SizeTrackEval(trySearchCurve('width'), trySearchCurve('height'));
    }
  };
  _proto.addChannel = function addChannel(property) {
    var channel = new UntypedTrackChannel();
    channel.property = property;
    this._channels.push(channel);
    return channel;
  };
  _proto.upgrade = function upgrade(refine) {
    var _this4 = this;
    var trySearchChannel = function trySearchChannel(property, outChannel) {
      var untypedChannel = _this4.channels().find(function (channel) {
        return channel.property === property;
      });
      if (untypedChannel) {
        outChannel.name = untypedChannel.name;
        outChannel.curve.assignSorted(Array.from(untypedChannel.curve.times()), Array.from(untypedChannel.curve.values()));
      }
    };
    var kind = refine(this.path, this.proxy);
    switch (kind) {
      default:
        break;
      case 'vec2':
      case 'vec3':
      case 'vec4':
        {
          var track = new VectorTrack();
          track.path = this.path;
          track.proxy = this.proxy;
          track.componentsCount = kind === 'vec2' ? 2 : kind === 'vec3' ? 3 : 4;
          var _track$channels = track.channels(),
            x = _track$channels[0],
            y = _track$channels[1],
            z = _track$channels[2],
            w = _track$channels[3];
          switch (kind) {
            case 'vec4':
              trySearchChannel('w', w);
            case 'vec3':
              trySearchChannel('z', z);
            default:
            case 'vec2':
              trySearchChannel('x', x);
              trySearchChannel('y', y);
          }
          return track;
        }
      case 'color':
        {
          var _track = new ColorTrack();
          var _track$channels2 = _track.channels(),
            r = _track$channels2[0],
            g = _track$channels2[1],
            b = _track$channels2[2],
            a = _track$channels2[3];
          trySearchChannel('r', r);
          trySearchChannel('g', g);
          trySearchChannel('b', b);
          trySearchChannel('a', a);
          trySearchChannel('x', r);
          trySearchChannel('y', g);
          trySearchChannel('z', b);
          trySearchChannel('w', a);
          return _track;
        }
      case 'size':
        break;
    }
    return null;
  };
  return UntypedTrack;
}(Track), _initializer2$4 = applyDecoratedInitializer(_class4$2.prototype, "_channels", [serializable$1], function () {
  return [];
}), _class4$2)) || _class3$2);

var AnimationClipLegacyData = function () {
  function AnimationClipLegacyData(duration) {
    this._keys = [];
    this._curves = [];
    this._commonTargets = [];
    this._ratioSamplers = [];
    this._runtimeCurves = void 0;
    this._data = null;
    this._duration = void 0;
    this._duration = duration;
  }
  var _proto = AnimationClipLegacyData.prototype;
  _proto.getPropertyCurves = function getPropertyCurves() {
    if (!this._runtimeCurves) {
      this._createPropertyCurves();
    }
    return this._runtimeCurves;
  };
  _proto.toTracks = function toTracks() {
    var newTracks = [];
    var legacyKeys = this.keys,
      legacyCurves = this.curves,
      legacyCommonTargets = this.commonTargets;
    var convertTrackPath = function convertTrackPath(track, modifiers, valueAdapter) {
      var trackPath = new TrackPath();
      for (var _iterator = _createForOfIteratorHelperLoose(modifiers), _step; !(_step = _iterator()).done;) {
        var modifier = _step.value;
        if (typeof modifier === 'string') {
          trackPath.toProperty(modifier);
        } else if (typeof modifier === 'number') {
          trackPath.toElement(modifier);
        } else if (modifier instanceof HierarchyPath) {
          trackPath.toHierarchy(modifier.path);
        } else if (modifier instanceof ComponentPath) {
          trackPath.toComponent(modifier.component);
        } else {
          trackPath.toCustomized(modifier);
        }
      }
      track.path = trackPath;
      track.proxy = valueAdapter;
    };
    var untypedTracks = legacyCommonTargets.map(function (legacyCommonTarget) {
      var track = new UntypedTrack();
      convertTrackPath(track, legacyCommonTarget.modifiers, legacyCommonTarget.valueAdapter);
      newTracks.push(track);
      return track;
    });
    var _loop = function _loop() {
        var _legacyCurveData$inte;
        var legacyCurve = _step2.value;
        var legacyCurveData = legacyCurve.data;
        var legacyValues = legacyCurveData.values;
        if (legacyValues.length === 0) {
          return 0;
        }
        var legacyKeysIndex = legacyCurveData.keys;
        var times = legacyKeysIndex < 0 ? [0.0] : legacyKeys[legacyCurveData.keys];
        var firstValue = legacyValues[0];
        var interpolate = (_legacyCurveData$inte = legacyCurveData.interpolate) !== null && _legacyCurveData$inte !== void 0 ? _legacyCurveData$inte : true;
        assertIsTrue(typeof legacyCurveData._arrayLength !== 'number' || typeof firstValue === 'number');
        var legacyEasingMethodConverter = new LegacyEasingMethodConverter(legacyCurveData, times.length);
        var installPathAndSetter = function installPathAndSetter(track) {
          convertTrackPath(track, legacyCurve.modifiers, legacyCurve.valueAdapter);
        };
        var legacyCommonTargetCurve;
        if (typeof legacyCurve.commonTarget === 'number') {
          if (!legacyValues.every(function (value) {
            return typeof value === 'number';
          })) {
            warnID(3932);
            return 0;
          }
          if (legacyCurve.valueAdapter || legacyCurve.modifiers.length !== 1 || typeof legacyCurve.modifiers[0] !== 'string') {
            warnID(3933);
            return 0;
          }
          var _propertyName = legacyCurve.modifiers[0];
          var untypedTrack = untypedTracks[legacyCurve.commonTarget];
          var _untypedTrack$addChan = untypedTrack.addChannel(_propertyName),
            curve = _untypedTrack$addChan.curve;
          legacyCommonTargetCurve = curve;
        }
        var convertCurve = function convertCurve() {
          if (typeof firstValue === 'number') {
            if (!legacyValues.every(function (value) {
              return typeof value === 'number';
            })) {
              warnID(3934);
              return;
            }
            var realCurve;
            if (legacyCommonTargetCurve) {
              realCurve = legacyCommonTargetCurve;
            } else {
              var track = new RealTrack();
              installPathAndSetter(track);
              newTracks.push(track);
              realCurve = track.channel.curve;
            }
            var interpolationMethod = interpolate ? RealInterpolationMode.LINEAR : RealInterpolationMode.CONSTANT;
            realCurve.assignSorted(times, legacyValues.map(function (value) {
              return {
                value: value,
                interpolationMode: interpolationMethod
              };
            }));
            legacyEasingMethodConverter.convert(realCurve);
            return;
          } else if (typeof firstValue === 'object') {
            switch (true) {
              default:
                break;
              case everyInstanceOf(legacyValues, Vec2):
              case everyInstanceOf(legacyValues, Vec3):
              case everyInstanceOf(legacyValues, Vec4):
                {
                  var components = firstValue instanceof Vec2 ? 2 : firstValue instanceof Vec3 ? 3 : 4;
                  var _track = new VectorTrack();
                  installPathAndSetter(_track);
                  _track.componentsCount = components;
                  var _track$channels = _track.channels(),
                    x = _track$channels[0].curve,
                    y = _track$channels[1].curve,
                    z = _track$channels[2].curve,
                    w = _track$channels[3].curve;
                  var interpolationMode = interpolate ? RealInterpolationMode.LINEAR : RealInterpolationMode.CONSTANT;
                  var valueToFrame = function valueToFrame(value) {
                    return {
                      value: value,
                      interpolationMode: interpolationMode
                    };
                  };
                  switch (components) {
                    case 4:
                      w.assignSorted(times, legacyValues.map(function (value) {
                        return valueToFrame(value.w);
                      }));
                      legacyEasingMethodConverter.convert(w);
                    case 3:
                      z.assignSorted(times, legacyValues.map(function (value) {
                        return valueToFrame(value.z);
                      }));
                      legacyEasingMethodConverter.convert(z);
                    default:
                      x.assignSorted(times, legacyValues.map(function (value) {
                        return valueToFrame(value.x);
                      }));
                      legacyEasingMethodConverter.convert(x);
                      y.assignSorted(times, legacyValues.map(function (value) {
                        return valueToFrame(value.y);
                      }));
                      legacyEasingMethodConverter.convert(y);
                      break;
                  }
                  newTracks.push(_track);
                  return;
                }
              case everyInstanceOf(legacyValues, Quat):
                {
                  var _track2 = new QuatTrack();
                  installPathAndSetter(_track2);
                  var _interpolationMode = interpolate ? QuatInterpolationMode.SLERP : QuatInterpolationMode.CONSTANT;
                  _track2.channel.curve.assignSorted(times, legacyValues.map(function (value) {
                    return {
                      value: Quat.clone(value),
                      interpolationMode: _interpolationMode
                    };
                  }));
                  legacyEasingMethodConverter.convertQuatCurve(_track2.channel.curve);
                  newTracks.push(_track2);
                  return;
                }
              case everyInstanceOf(legacyValues, Color):
                {
                  var _track3 = new ColorTrack();
                  installPathAndSetter(_track3);
                  var _track3$channels = _track3.channels(),
                    r = _track3$channels[0].curve,
                    g = _track3$channels[1].curve,
                    b = _track3$channels[2].curve,
                    a = _track3$channels[3].curve;
                  var _interpolationMode2 = interpolate ? RealInterpolationMode.LINEAR : RealInterpolationMode.CONSTANT;
                  var _valueToFrame = function _valueToFrame(value) {
                    return {
                      value: value,
                      interpolationMode: _interpolationMode2
                    };
                  };
                  r.assignSorted(times, legacyValues.map(function (value) {
                    return _valueToFrame(value.r);
                  }));
                  legacyEasingMethodConverter.convert(r);
                  g.assignSorted(times, legacyValues.map(function (value) {
                    return _valueToFrame(value.g);
                  }));
                  legacyEasingMethodConverter.convert(g);
                  b.assignSorted(times, legacyValues.map(function (value) {
                    return _valueToFrame(value.b);
                  }));
                  legacyEasingMethodConverter.convert(b);
                  a.assignSorted(times, legacyValues.map(function (value) {
                    return _valueToFrame(value.a);
                  }));
                  legacyEasingMethodConverter.convert(a);
                  newTracks.push(_track3);
                  return;
                }
              case everyInstanceOf(legacyValues, Size):
                {
                  var _track4 = new SizeTrack();
                  installPathAndSetter(_track4);
                  var _track4$channels = _track4.channels(),
                    width = _track4$channels[0].curve,
                    height = _track4$channels[1].curve;
                  var _interpolationMode3 = interpolate ? RealInterpolationMode.LINEAR : RealInterpolationMode.CONSTANT;
                  var _valueToFrame2 = function _valueToFrame2(value) {
                    return {
                      value: value,
                      interpolationMode: _interpolationMode3
                    };
                  };
                  width.assignSorted(times, legacyValues.map(function (value) {
                    return _valueToFrame2(value.width);
                  }));
                  legacyEasingMethodConverter.convert(width);
                  height.assignSorted(times, legacyValues.map(function (value) {
                    return _valueToFrame2(value.height);
                  }));
                  legacyEasingMethodConverter.convert(height);
                  newTracks.push(_track4);
                  return;
                }
              case everyInstanceOf(legacyValues, CubicSplineNumberValue):
                {
                  assertIsTrue(legacyEasingMethodConverter.nil);
                  var _track5 = new RealTrack();
                  installPathAndSetter(_track5);
                  var _interpolationMode4 = interpolate ? RealInterpolationMode.CUBIC : RealInterpolationMode.CONSTANT;
                  _track5.channel.curve.assignSorted(times, legacyValues.map(function (value) {
                    return {
                      value: value.dataPoint,
                      leftTangent: value.inTangent,
                      rightTangent: value.outTangent,
                      interpolationMode: _interpolationMode4
                    };
                  }));
                  newTracks.push(_track5);
                  return;
                }
              case everyInstanceOf(legacyValues, CubicSplineVec2Value):
              case everyInstanceOf(legacyValues, CubicSplineVec3Value):
              case everyInstanceOf(legacyValues, CubicSplineVec4Value):
                {
                  assertIsTrue(legacyEasingMethodConverter.nil);
                  var _components = firstValue instanceof CubicSplineVec2Value ? 2 : firstValue instanceof CubicSplineVec3Value ? 3 : 4;
                  var _track6 = new VectorTrack();
                  installPathAndSetter(_track6);
                  _track6.componentsCount = _components;
                  var _track6$channels = _track6.channels(),
                    _x = _track6$channels[0],
                    _y = _track6$channels[1],
                    _z = _track6$channels[2],
                    _w = _track6$channels[3];
                  var _interpolationMode5 = interpolate ? RealInterpolationMode.LINEAR : RealInterpolationMode.CONSTANT;
                  var _valueToFrame3 = function _valueToFrame3(value, inTangent, outTangent) {
                    return {
                      value: value,
                      leftTangent: inTangent,
                      rightTangent: outTangent,
                      interpolationMode: _interpolationMode5
                    };
                  };
                  switch (_components) {
                    case 4:
                      _w.curve.assignSorted(times, legacyValues.map(function (value) {
                        return _valueToFrame3(value.dataPoint.w, value.inTangent.w, value.outTangent.w);
                      }));
                    case 3:
                      _z.curve.assignSorted(times, legacyValues.map(function (value) {
                        return _valueToFrame3(value.dataPoint.z, value.inTangent.z, value.outTangent.z);
                      }));
                    default:
                      _x.curve.assignSorted(times, legacyValues.map(function (value) {
                        return _valueToFrame3(value.dataPoint.y, value.inTangent.y, value.outTangent.y);
                      }));
                      _y.curve.assignSorted(times, legacyValues.map(function (value) {
                        return _valueToFrame3(value.dataPoint.x, value.inTangent.x, value.outTangent.x);
                      }));
                      break;
                  }
                  newTracks.push(_track6);
                  return;
                }
              case legacyValues.every(function (value) {
                return value instanceof CubicSplineQuatValue;
              }):
                {
                  warnID(3935);
                  break;
                }
            }
          }
          var objectTrack = new ObjectTrack();
          installPathAndSetter(objectTrack);
          objectTrack.channel.curve.assignSorted(times, legacyValues);
          newTracks.push(objectTrack);
        };
        convertCurve();
      },
      _ret;
    for (var _iterator2 = _createForOfIteratorHelperLoose(legacyCurves), _step2; !(_step2 = _iterator2()).done;) {
      _ret = _loop();
      if (_ret === 0) continue;
    }
    return newTracks;
  };
  _proto._createPropertyCurves = function _createPropertyCurves() {
    var _this = this;
    this._ratioSamplers = this._keys.map(function (keys) {
      return new RatioSampler(keys.map(function (key) {
        return key / _this._duration;
      }));
    });
    this._runtimeCurves = this._curves.map(function (targetCurve) {
      return {
        curve: new AnimCurve(targetCurve.data, _this._duration),
        modifiers: targetCurve.modifiers,
        valueAdapter: targetCurve.valueAdapter,
        sampler: _this._ratioSamplers[targetCurve.data.keys],
        commonTarget: targetCurve.commonTarget
      };
    });
  };
  return _createClass(AnimationClipLegacyData, [{
    key: "keys",
    get: function get() {
      return this._keys;
    },
    set: function set(value) {
      this._keys = value;
    }
  }, {
    key: "curves",
    get: function get() {
      return this._curves;
    },
    set: function set(value) {
      this._curves = value;
      delete this._runtimeCurves;
    }
  }, {
    key: "commonTargets",
    get: function get() {
      return this._commonTargets;
    },
    set: function set(value) {
      this._commonTargets = value;
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    }
  }]);
}();
function everyInstanceOf(array, constructor) {
  return array.every(function (element) {
    return element instanceof constructor;
  });
}
var LegacyEasingMethodConverter = function () {
  function LegacyEasingMethodConverter(legacyCurveData, keyframesCount) {
    this._easingMethods = void 0;
    var easingMethods = legacyCurveData.easingMethods;
    if (Array.isArray(easingMethods)) {
      if (easingMethods.length === 0 && keyframesCount !== 0) {
        this._easingMethods = new Array(keyframesCount).fill(null);
      } else {
        this._easingMethods = easingMethods;
      }
    } else if (easingMethods === undefined) {
      this._easingMethods = new Array(keyframesCount).fill(legacyCurveData.easingMethod);
    } else {
      this._easingMethods = Array.from({
        length: keyframesCount
      }, function (_, index) {
        var _easingMethods$index;
        return (_easingMethods$index = easingMethods[index]) !== null && _easingMethods$index !== void 0 ? _easingMethods$index : null;
      });
    }
  }
  var _proto2 = LegacyEasingMethodConverter.prototype;
  _proto2.convert = function convert(curve) {
    var easingMethods = this._easingMethods;
    if (!easingMethods) {
      return;
    }
    var nKeyframes = curve.keyFramesCount;
    if (curve.keyFramesCount < 2) {
      return;
    }
    if (Array.isArray(easingMethods)) {
      assertIsTrue(nKeyframes === easingMethods.length);
    }
    var iLastKeyframe = nKeyframes - 1;
    for (var iKeyframe = 0; iKeyframe < iLastKeyframe; ++iKeyframe) {
      var easingMethod = easingMethods[iKeyframe];
      if (!easingMethod) {
        continue;
      }
      if (Array.isArray(easingMethod)) {
        timeBezierToTangents(easingMethod, curve.getKeyframeTime(iKeyframe), curve.getKeyframeValue(iKeyframe), curve.getKeyframeTime(iKeyframe + 1), curve.getKeyframeValue(iKeyframe + 1));
      } else {
        applyLegacyEasingMethodName(easingMethod, curve, iKeyframe);
      }
    }
  };
  _proto2.convertQuatCurve = function convertQuatCurve(curve) {
    var easingMethods = this._easingMethods;
    if (!easingMethods) {
      return;
    }
    var nKeyframes = curve.keyFramesCount;
    if (curve.keyFramesCount < 2) {
      return;
    }
    if (Array.isArray(easingMethods)) {
      assertIsTrue(nKeyframes === easingMethods.length);
    }
    var iLastKeyframe = nKeyframes - 1;
    for (var iKeyframe = 0; iKeyframe < iLastKeyframe; ++iKeyframe) {
      var easingMethod = easingMethods[iKeyframe];
      if (!easingMethod) {
        continue;
      }
      if (Array.isArray(easingMethod)) {
        curve.getKeyframeValue(iKeyframe).easingMethod = easingMethod.slice();
      } else {
        applyLegacyEasingMethodNameIntoQuatCurve(easingMethod, curve, iKeyframe);
      }
    }
  };
  return _createClass(LegacyEasingMethodConverter, [{
    key: "nil",
    get: function get() {
      return !this._easingMethods || this._easingMethods.every(function (easingMethod) {
        return easingMethod === null || easingMethod === undefined;
      });
    }
  }]);
}();
function applyLegacyEasingMethodName(easingMethodName, curve, keyframeIndex) {
  assertIsTrue(keyframeIndex !== curve.keyFramesCount - 1);
  assertIsTrue(easingMethodName in easingMethodNameMap);
  var keyframeValue = curve.getKeyframeValue(keyframeIndex);
  var easingMethod = easingMethodNameMap[easingMethodName];
  if (easingMethod === EasingMethod.CONSTANT) {
    keyframeValue.interpolationMode = RealInterpolationMode.CONSTANT;
  } else {
    keyframeValue.interpolationMode = RealInterpolationMode.LINEAR;
    keyframeValue.easingMethod = easingMethod;
  }
}
function applyLegacyEasingMethodNameIntoQuatCurve(easingMethodName, curve, keyframeIndex) {
  assertIsTrue(keyframeIndex !== curve.keyFramesCount - 1);
  assertIsTrue(easingMethodName in easingMethodNameMap);
  var keyframeValue = curve.getKeyframeValue(keyframeIndex);
  var easingMethod = easingMethodNameMap[easingMethodName];
  keyframeValue.easingMethod = easingMethod;
}
var easingMethodNameMap = {
  constant: EasingMethod.CONSTANT,
  linear: EasingMethod.LINEAR,
  quadIn: EasingMethod.QUAD_IN,
  quadOut: EasingMethod.QUAD_OUT,
  quadInOut: EasingMethod.QUAD_IN_OUT,
  quadOutIn: EasingMethod.QUAD_OUT_IN,
  cubicIn: EasingMethod.CUBIC_IN,
  cubicOut: EasingMethod.CUBIC_OUT,
  cubicInOut: EasingMethod.CUBIC_IN_OUT,
  cubicOutIn: EasingMethod.CUBIC_OUT_IN,
  quartIn: EasingMethod.QUART_IN,
  quartOut: EasingMethod.QUART_OUT,
  quartInOut: EasingMethod.QUART_IN_OUT,
  quartOutIn: EasingMethod.QUART_OUT_IN,
  quintIn: EasingMethod.QUINT_IN,
  quintOut: EasingMethod.QUINT_OUT,
  quintInOut: EasingMethod.QUINT_IN_OUT,
  quintOutIn: EasingMethod.QUINT_OUT_IN,
  sineIn: EasingMethod.SINE_IN,
  sineOut: EasingMethod.SINE_OUT,
  sineInOut: EasingMethod.SINE_IN_OUT,
  sineOutIn: EasingMethod.SINE_OUT_IN,
  expoIn: EasingMethod.EXPO_IN,
  expoOut: EasingMethod.EXPO_OUT,
  expoInOut: EasingMethod.EXPO_IN_OUT,
  expoOutIn: EasingMethod.EXPO_OUT_IN,
  circIn: EasingMethod.CIRC_IN,
  circOut: EasingMethod.CIRC_OUT,
  circInOut: EasingMethod.CIRC_IN_OUT,
  circOutIn: EasingMethod.CIRC_OUT_IN,
  elasticIn: EasingMethod.ELASTIC_IN,
  elasticOut: EasingMethod.ELASTIC_OUT,
  elasticInOut: EasingMethod.ELASTIC_IN_OUT,
  elasticOutIn: EasingMethod.ELASTIC_OUT_IN,
  backIn: EasingMethod.BACK_IN,
  backOut: EasingMethod.BACK_OUT,
  backInOut: EasingMethod.BACK_IN_OUT,
  backOutIn: EasingMethod.BACK_OUT_IN,
  bounceIn: EasingMethod.BOUNCE_IN,
  bounceOut: EasingMethod.BOUNCE_OUT,
  bounceInOut: EasingMethod.BOUNCE_IN_OUT,
  bounceOutIn: EasingMethod.BOUNCE_OUT_IN,
  smooth: EasingMethod.SMOOTH,
  fade: EasingMethod.FADE
};
function timeBezierToTangents(timeBezierPoints, previousTime, previousKeyframe, nextTime, nextKeyframe) {
  var p1X = timeBezierPoints[0],
    p1Y = timeBezierPoints[1],
    p2X = timeBezierPoints[2],
    p2Y = timeBezierPoints[3];
  var previousValue = previousKeyframe.value;
  var nextValue = nextKeyframe.value;
  var dValue = nextValue - previousValue;
  var dTime = nextTime - previousTime;
  var fx = 3 * dTime;
  var fy = 3 * dValue;
  var t1x = p1X * fx;
  var t1y = p1Y * fy;
  var t2x = (1.0 - p2X) * fx;
  var t2y = (1.0 - p2Y) * fy;
  var ONE_THIRD = 1.0 / 3.0;
  var previousTangent = t1y / t1x;
  var previousTangentWeight = Math.sqrt(t1x * t1x + t1y * t1y) * ONE_THIRD;
  var nextTangent = t2y / t2x;
  var nextTangentWeight = Math.sqrt(t2x * t2x + t2y * t2y) * ONE_THIRD;
  previousKeyframe.interpolationMode = RealInterpolationMode.CUBIC;
  previousKeyframe.tangentWeightMode = ensureRightTangentWeightMode(previousKeyframe.tangentWeightMode);
  previousKeyframe.rightTangent = previousTangent;
  previousKeyframe.rightTangentWeight = previousTangentWeight;
  nextKeyframe.tangentWeightMode = ensureLeftTangentWeightMode(nextKeyframe.tangentWeightMode);
  nextKeyframe.leftTangent = nextTangent;
  nextKeyframe.leftTangentWeight = nextTangentWeight;
}
function ensureLeftTangentWeightMode(tangentWeightMode) {
  if (tangentWeightMode === TangentWeightMode.NONE) {
    return TangentWeightMode.LEFT;
  } else if (tangentWeightMode === TangentWeightMode.RIGHT) {
    return TangentWeightMode.BOTH;
  } else {
    return tangentWeightMode;
  }
}
function ensureRightTangentWeightMode(tangentWeightMode) {
  if (tangentWeightMode === TangentWeightMode.NONE) {
    return TangentWeightMode.RIGHT;
  } else if (tangentWeightMode === TangentWeightMode.LEFT) {
    return TangentWeightMode.BOTH;
  } else {
    return tangentWeightMode;
  }
}

var _dec$3, _class$3, _class2$3, _initializer$3, _dec2$2, _class3$1, _class4$1, _initializer2$3, _initializer3$2, _initializer4$1, _initializer5$1, _dec3$1, _class5, _class6, _initializer6$1, _initializer7$1, _dec4$1, _class7, _dec5$1, _class8, _dec6, _class9, _class0, _initializer8$1, _initializer9$1, _dec7, _class1, _class10, _initializer0$1, _initializer1$1, _initializer10$1, _initializer11$1;
var ccclass = ccclass$1,
  serializable = serializable$1;
function throwIfSplitMethodIsNotValid() {
  throw new Error("split() only valid in Editor.");
}
(_dec$3 = ccclass(CLASS_NAME_PREFIX_ANIM + "ExoticAnimation"), _dec$3(_class$3 = (_class2$3 = function () {
  function ExoticAnimation() {
    this._nodeAnimations = _initializer$3 && _initializer$3();
  }
  var _proto = ExoticAnimation.prototype;
  _proto.createEvaluator = function createEvaluator(binder) {
    return new ExoticTrsAnimationEvaluator(this._nodeAnimations, binder);
  };
  _proto.createEvaluatorForAnimationGraph = function createEvaluatorForAnimationGraph(context) {
    return new ExoticTrsAGEvaluation(this._nodeAnimations, context);
  };
  _proto.addNodeAnimation = function addNodeAnimation(path) {
    var nodeAnimation = new ExoticNodeAnimation(path);
    this._nodeAnimations.push(nodeAnimation);
    return nodeAnimation;
  };
  _proto.collectAnimatedJoints = function collectAnimatedJoints() {
    return Array.from(new Set(this._nodeAnimations.map(function (_ref) {
      var path = _ref.path;
      return path;
    })));
  };
  _proto.split = function split(from, to) {
    {
      return throwIfSplitMethodIsNotValid();
    }
  };
  _proto.toHashString = function toHashString() {
    return this._nodeAnimations.map(function (nodeAnimation) {
      return nodeAnimation.toHashString();
    }).join('\n');
  };
  return ExoticAnimation;
}(), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "_nodeAnimations", [serializable], function () {
  return [];
}), _class2$3)) || _class$3);
var ExoticNodeAnimation = (_dec2$2 = ccclass(CLASS_NAME_PREFIX_ANIM + "ExoticNodeAnimation"), _dec2$2(_class3$1 = (_class4$1 = function () {
  function ExoticNodeAnimation(path) {
    this._path = _initializer2$3 && _initializer2$3();
    this._position = _initializer3$2 && _initializer3$2();
    this._rotation = _initializer4$1 && _initializer4$1();
    this._scale = _initializer5$1 && _initializer5$1();
    this._path = path;
  }
  var _proto2 = ExoticNodeAnimation.prototype;
  _proto2.createPosition = function createPosition(times, values) {
    this._position = new ExoticTrack(times, new ExoticVec3TrackValues(values));
  };
  _proto2.createRotation = function createRotation(times, values) {
    this._rotation = new ExoticTrack(times, new ExoticQuatTrackValues(values));
  };
  _proto2.createScale = function createScale(times, values) {
    this._scale = new ExoticTrack(times, new ExoticVec3TrackValues(values));
  };
  _proto2.createEvaluator = function createEvaluator(binder) {
    return new ExoticNodeAnimationEvaluator(this._path, this._position, this._rotation, this._scale, binder);
  };
  _proto2.createEvaluatorForAnimationGraph = function createEvaluatorForAnimationGraph(context) {
    var transformHandle = context.bindTransform(this._path);
    if (!transformHandle) {
      return null;
    }
    return new ExoticNodeAnimationAGEvaluation(transformHandle, this._position, this._rotation, this._scale);
  };
  _proto2.split = function split(from, to, splitInfoCache) {
    {
      return throwIfSplitMethodIsNotValid();
    }
  };
  _proto2.toHashString = function toHashString() {
    var _this$_position$toHas, _this$_position, _this$_scale$toHashSt, _this$_scale, _this$_rotation$toHas, _this$_rotation;
    return this._path + "\n" + ((_this$_position$toHas = (_this$_position = this._position) == null ? void 0 : _this$_position.toHashString()) !== null && _this$_position$toHas !== void 0 ? _this$_position$toHas : '') + ((_this$_scale$toHashSt = (_this$_scale = this._scale) == null ? void 0 : _this$_scale.toHashString()) !== null && _this$_scale$toHashSt !== void 0 ? _this$_scale$toHashSt : '') + ((_this$_rotation$toHas = (_this$_rotation = this._rotation) == null ? void 0 : _this$_rotation.toHashString()) !== null && _this$_rotation$toHas !== void 0 ? _this$_rotation$toHas : '');
  };
  return _createClass(ExoticNodeAnimation, [{
    key: "path",
    get: function get() {
      return this._path;
    }
  }]);
}(), _initializer2$3 = applyDecoratedInitializer(_class4$1.prototype, "_path", [serializable], function () {
  return '';
}), _initializer3$2 = applyDecoratedInitializer(_class4$1.prototype, "_position", [serializable], function () {
  return null;
}), _initializer4$1 = applyDecoratedInitializer(_class4$1.prototype, "_rotation", [serializable], function () {
  return null;
}), _initializer5$1 = applyDecoratedInitializer(_class4$1.prototype, "_scale", [serializable], function () {
  return null;
}), _class4$1)) || _class3$1);
function floatToHashString(value) {
  return value.toPrecision(2);
}
function floatArrayToHashString(values) {
  return values.map(function (v) {
    return Number.parseFloat(floatToHashString(v));
  }).join(' ');
}
var ExoticVectorLikeTrackValues = (_dec3$1 = ccclass(CLASS_NAME_PREFIX_ANIM + "ExoticVectorLikeTrackValues"), _dec3$1(_class5 = (_class6 = function () {
  function ExoticVectorLikeTrackValues(values) {
    this._values = _initializer6$1 && _initializer6$1();
    this._isQuantized = _initializer7$1 && _initializer7$1();
    this._values = values;
  }
  var _proto3 = ExoticVectorLikeTrackValues.prototype;
  _proto3.quantize = function quantize(type) {
    assertIsTrue(!this._isQuantized);
    this._values = _quantize(this._values, type);
    this._isQuantized = true;
  };
  _proto3.toHashString = function toHashString() {
    var isQuantized = this._isQuantized,
      values = this._values;
    return isQuantized + " " + (isQuantized ? values.toHashString() : floatArrayToHashString(values));
  };
  return _createClass(ExoticVectorLikeTrackValues, [{
    key: "precision",
    get: function get() {
      return this._isQuantized ? this._values.originalPrecision : getFloatArrayPrecision(this._values);
    }
  }]);
}(), _initializer6$1 = applyDecoratedInitializer(_class6.prototype, "_values", [serializable], null), _initializer7$1 = applyDecoratedInitializer(_class6.prototype, "_isQuantized", [serializable], function () {
  return false;
}), _class6)) || _class5);
var ExoticVec3TrackValues = (_dec4$1 = ccclass(CLASS_NAME_PREFIX_ANIM + "ExoticVec3TrackValues"), _dec4$1(_class7 = function (_ExoticVectorLikeTrac) {
  function ExoticVec3TrackValues() {
    return _ExoticVectorLikeTrac.apply(this, arguments) || this;
  }
  _inheritsLoose(ExoticVec3TrackValues, _ExoticVectorLikeTrac);
  ExoticVec3TrackValues.imitate = function imitate(values, model) {
    var trackValues = new ExoticVec3TrackValues(values);
    if (model._isQuantized) {
      trackValues.quantize(model._values.quantizationType);
    }
    return trackValues;
  };
  var _proto4 = ExoticVec3TrackValues.prototype;
  _proto4.get = function get(index, resultValue) {
    var values = this._values,
      isQuantized = this._isQuantized;
    if (isQuantized) {
      loadVec3FromQuantized(values, index, resultValue);
    } else {
      Vec3.fromArray(resultValue, values, index * 3);
    }
  };
  _proto4.lerp = function lerp(prevIndex, nextIndex, ratio, prevValue, nextValue, resultValue) {
    var values = this._values,
      isQuantized = this._isQuantized;
    if (isQuantized) {
      loadVec3FromQuantized(values, prevIndex, prevValue);
      loadVec3FromQuantized(values, nextIndex, nextValue);
    } else {
      Vec3.fromArray(prevValue, values, prevIndex * 3);
      Vec3.fromArray(nextValue, values, nextIndex * 3);
    }
    Vec3.lerp(resultValue, prevValue, nextValue, ratio);
  };
  return ExoticVec3TrackValues;
}(ExoticVectorLikeTrackValues)) || _class7);
var ExoticQuatTrackValues = (_dec5$1 = ccclass(CLASS_NAME_PREFIX_ANIM + "ExoticQuatTrackValues"), _dec5$1(_class8 = function (_ExoticVectorLikeTrac2) {
  function ExoticQuatTrackValues() {
    return _ExoticVectorLikeTrac2.apply(this, arguments) || this;
  }
  _inheritsLoose(ExoticQuatTrackValues, _ExoticVectorLikeTrac2);
  ExoticQuatTrackValues.imitate = function imitate(values, model) {
    var trackValues = new ExoticQuatTrackValues(values);
    if (model._isQuantized) {
      trackValues.quantize(model._values.quantizationType);
    }
    return trackValues;
  };
  var _proto5 = ExoticQuatTrackValues.prototype;
  _proto5.get = function get(index, resultValue) {
    var values = this._values,
      isQuantized = this._isQuantized;
    if (isQuantized) {
      loadQuatFromQuantized(values, index, resultValue);
    } else {
      Quat.fromArray(resultValue, values, index * 4);
    }
  };
  _proto5.lerp = function lerp(prevIndex, nextIndex, ratio, prevValue, nextValue, resultValue) {
    var values = this._values,
      isQuantized = this._isQuantized;
    if (isQuantized) {
      loadQuatFromQuantized(values, prevIndex, prevValue);
      loadQuatFromQuantized(values, nextIndex, nextValue);
    } else {
      Quat.fromArray(prevValue, values, prevIndex * 4);
      Quat.fromArray(nextValue, values, nextIndex * 4);
    }
    Quat.slerp(resultValue, prevValue, nextValue, ratio);
  };
  return ExoticQuatTrackValues;
}(ExoticVectorLikeTrackValues)) || _class8);
var ExoticTrack = (_dec6 = ccclass(CLASS_NAME_PREFIX_ANIM + "ExoticTrack"), _dec6(_class9 = (_class0 = function () {
  function ExoticTrack(times, values) {
    this.times = _initializer8$1 && _initializer8$1();
    this.values = _initializer9$1 && _initializer9$1();
    this.times = times;
    this.values = values;
  }
  var _proto6 = ExoticTrack.prototype;
  _proto6.toHashString = function toHashString() {
    var times = this.times,
      values = this.values;
    return "times: " + floatArrayToHashString(times) + "; values: " + values.toHashString();
  };
  return ExoticTrack;
}(), _initializer8$1 = applyDecoratedInitializer(_class0.prototype, "times", [serializable], null), _initializer9$1 = applyDecoratedInitializer(_class0.prototype, "values", [serializable], null), _class0)) || _class9);
(function () {
  function SplitInfo() {
    this._reset();
  }
  var _proto7 = SplitInfo.prototype;
  _proto7.calculate = function calculate(times, from, to) {
    this._reset();
    if (from > to) {
      return;
    }
    var nKeyframes = times.length;
    if (!nKeyframes) {
      return;
    }
    var firstTime = times[0];
    var lastTime = times[nKeyframes - 1];
    var fromIndex = 0;
    var fromRatio = 0.0;
    if (from < firstTime) ; else if (from >= lastTime) {
      fromIndex = nKeyframes - 1;
      fromRatio = 0.0;
    } else {
      var _binarySearchRatio = binarySearchRatio(times, from);
      fromIndex = _binarySearchRatio.index;
      fromRatio = _binarySearchRatio.ratio;
    }
    var toIndex = 0;
    var toRatio = 0.0;
    if (to < firstTime) ; else if (to >= lastTime) {
      toIndex = nKeyframes - 1;
      toRatio = 0.0;
    } else {
      var _binarySearchRatio2 = binarySearchRatio(times, to);
      toIndex = _binarySearchRatio2.index;
      toRatio = _binarySearchRatio2.ratio;
    }
    assertIsTrue(toIndex >= fromIndex);
    var fromJust = !fromRatio;
    var toJust = !toRatio;
    if (fromIndex === toIndex && fromRatio === toRatio) {
      if (!fromJust) {
        this.preLerpIndex = fromIndex;
        this.preLerpRatio = fromRatio;
      } else {
        this.directKeyframesBegin = fromIndex;
        this.directKeyframesEnd = fromIndex + 1;
      }
      return;
    }
    if (!fromJust) {
      this.preLerpIndex = fromIndex;
      this.preLerpRatio = fromRatio;
    }
    this.directKeyframesBegin = fromJust ? fromIndex : fromIndex + 1;
    this.directKeyframesEnd = toIndex + 1;
    if (!toJust) {
      this.postLerpIndex = toIndex;
      this.postLerpRatio = toRatio;
    }
  };
  _proto7._reset = function _reset() {
    this.preLerpIndex = -1;
    this.preLerpRatio = 0.0;
    this.directKeyframesBegin = 0;
    this.directKeyframesEnd = 0;
    this.postLerpIndex = -1;
    this.postLerpRatio = 0.0;
  };
  return _createClass(SplitInfo, [{
    key: "keyframesCount",
    get: function get() {
      var preLerpIndex = this.preLerpIndex,
        directKeyframesBegin = this.directKeyframesBegin,
        directKeyframesEnd = this.directKeyframesEnd,
        postLerpIndex = this.postLerpIndex;
      return 0 + (preLerpIndex < 0 ? 0 : 1) + (directKeyframesEnd - directKeyframesBegin) + (postLerpIndex < 0 ? 0 : 1);
    }
  }]);
})();
function binarySearchRatio(values, value) {
  var nValues = values.length;
  assertIsTrue(values.length !== 0);
  var resultIndex = 0;
  var resultRatio = 0.0;
  var index0 = binarySearchEpsilon(values, value);
  if (index0 >= 0) {
    resultIndex = index0;
  } else {
    var iNext = ~index0;
    assertIsTrue(iNext !== 0 && iNext !== nValues && nValues > 1);
    var iPrev = iNext - 1;
    resultIndex = iPrev;
    var next = values[iNext];
    var prev = values[iPrev];
    resultRatio = (value - prev) / (next - prev);
  }
  return {
    index: resultIndex,
    ratio: resultRatio
  };
}
var ExoticTrsAnimationEvaluator = function () {
  function ExoticTrsAnimationEvaluator(nodeAnimations, binder) {
    this._nodeEvaluations = void 0;
    this._nodeEvaluations = nodeAnimations.map(function (nodeAnimation) {
      return nodeAnimation.createEvaluator(binder);
    });
  }
  var _proto8 = ExoticTrsAnimationEvaluator.prototype;
  _proto8.evaluate = function evaluate(time) {
    this._nodeEvaluations.forEach(function (nodeEvaluator) {
      nodeEvaluator.evaluate(time);
    });
  };
  return ExoticTrsAnimationEvaluator;
}();
var ExoticNodeAnimationEvaluator = function () {
  function ExoticNodeAnimationEvaluator(path, position, rotation, scale, binder) {
    this._position = null;
    this._rotation = null;
    this._scale = null;
    if (position) {
      this._position = createExoticTrackEvaluationRecord(position.times, position.values, Vec3, path, 'position', binder);
    }
    if (rotation) {
      this._rotation = createExoticTrackEvaluationRecord(rotation.times, rotation.values, Quat, path, 'rotation', binder);
    }
    if (scale) {
      this._scale = createExoticTrackEvaluationRecord(scale.times, scale.values, Vec3, path, 'scale', binder);
    }
  }
  var _proto9 = ExoticNodeAnimationEvaluator.prototype;
  _proto9.evaluate = function evaluate(time) {
    if (this._position) {
      var value = this._position.evaluator.evaluate(time);
      this._position.runtimeBinding.setValue(value);
    }
    if (this._rotation) {
      var _value = this._rotation.evaluator.evaluate(time);
      this._rotation.runtimeBinding.setValue(_value);
    }
    if (this._scale) {
      var _value2 = this._scale.evaluator.evaluate(time);
      this._scale.runtimeBinding.setValue(_value2);
    }
  };
  return ExoticNodeAnimationEvaluator;
}();
var ExoticTrackEvaluator = function () {
  function ExoticTrackEvaluator(times, values, ValueConstructor) {
    this._times = void 0;
    this._inputSampleResultCache = {
      just: false,
      index: -1,
      nextIndex: -1,
      ratio: 0.0
    };
    this._values = void 0;
    this._prevValue = void 0;
    this._nextValue = void 0;
    this._resultValue = void 0;
    this._times = times;
    this._values = values;
    this._prevValue = new ValueConstructor();
    this._nextValue = new ValueConstructor();
    this._resultValue = new ValueConstructor();
  }
  var _proto0 = ExoticTrackEvaluator.prototype;
  _proto0.evaluate = function evaluate(time) {
    var times = this._times,
      values = this._values,
      resultValue = this._resultValue;
    var nFrames = times.length;
    if (nFrames === 0) {
      return resultValue;
    }
    var inputSampleResult = sampleInput(times, time, this._inputSampleResultCache);
    if (inputSampleResult.just) {
      values.get(inputSampleResult.index, resultValue);
    } else {
      values.lerp(inputSampleResult.index, inputSampleResult.nextIndex, inputSampleResult.ratio, this._prevValue, this._nextValue, resultValue);
    }
    return resultValue;
  };
  return ExoticTrackEvaluator;
}();
var ExoticTrsAGEvaluation = function () {
  function ExoticTrsAGEvaluation(nodeAnimations, context) {
    this._nodeEvaluations = void 0;
    this._nodeEvaluations = nodeAnimations.map(function (nodeAnimation) {
      return nodeAnimation.createEvaluatorForAnimationGraph(context);
    }).filter(function (x) {
      return !!x;
    });
  }
  var _proto1 = ExoticTrsAGEvaluation.prototype;
  _proto1.destroy = function destroy() {
    var nodeEvaluations = this._nodeEvaluations;
    var nNodeEvaluations = nodeEvaluations.length;
    for (var iNodeEvaluation = 0; iNodeEvaluation < nNodeEvaluations; ++iNodeEvaluation) {
      nodeEvaluations[iNodeEvaluation].destroy();
    }
  };
  _proto1.evaluate = function evaluate(time, pose) {
    var nodeEvaluations = this._nodeEvaluations;
    var nNodeEvaluations = nodeEvaluations.length;
    for (var iNodeEvaluation = 0; iNodeEvaluation < nNodeEvaluations; ++iNodeEvaluation) {
      nodeEvaluations[iNodeEvaluation].evaluate(time, pose);
    }
  };
  return ExoticTrsAGEvaluation;
}();
var ExoticNodeAnimationAGEvaluation = function () {
  function ExoticNodeAnimationAGEvaluation(transformHandle, position, rotation, scale) {
    this._position = null;
    this._rotation = null;
    this._scale = null;
    this._transformHandle = void 0;
    this._transformHandle = transformHandle;
    if (position) {
      this._position = new ExoticTrackEvaluator(position.times, position.values, Vec3);
    }
    if (rotation) {
      this._rotation = new ExoticTrackEvaluator(rotation.times, rotation.values, Quat);
    }
    if (scale) {
      this._scale = new ExoticTrackEvaluator(scale.times, scale.values, Vec3);
    }
  }
  var _proto10 = ExoticNodeAnimationAGEvaluation.prototype;
  _proto10.destroy = function destroy() {
    this._transformHandle.destroy();
  };
  _proto10.evaluate = function evaluate(time, pose) {
    var transformIndex = this._transformHandle.index,
      position = this._position,
      rotation = this._rotation,
      scale = this._scale;
    var poseTransforms = pose.transforms;
    if (position) {
      var value = position.evaluate(time);
      poseTransforms.setPosition(transformIndex, value);
    }
    if (rotation) {
      var rotationAbs = rotation.evaluate(time);
      poseTransforms.setRotation(transformIndex, rotationAbs);
    }
    if (scale) {
      var _value3 = scale.evaluate(time);
      poseTransforms.setScale(transformIndex, _value3);
    }
  };
  return ExoticNodeAnimationAGEvaluation;
}();
function sampleInput(values, time, result) {
  var nFrames = values.length;
  assertIsTrue(nFrames !== 0);
  var firstTime = values[0];
  var lastTime = values[nFrames - 1];
  if (time < firstTime) {
    result.just = true;
    result.index = 0;
  } else if (time > lastTime) {
    result.just = true;
    result.index = nFrames - 1;
  } else {
    var _index2 = binarySearchEpsilon(values, time);
    if (_index2 >= 0) {
      result.just = true;
      result.index = _index2;
    } else {
      var _nextIndex = ~_index2;
      assertIsTrue(_nextIndex !== 0 && _nextIndex !== nFrames && nFrames > 1);
      var _prevIndex = _nextIndex - 1;
      var prevTime = values[_prevIndex];
      var nextTime = values[_nextIndex];
      var _ratio = (time - values[_prevIndex]) / (nextTime - prevTime);
      result.just = false;
      result.index = _prevIndex;
      result.nextIndex = _nextIndex;
      result.ratio = _ratio;
    }
  }
  return result;
}
var QUANTIZATION_TYPE_TO_ARRAY_VIEW_CONSTRUCTOR_MAP = {
  uint8: Uint8Array,
  uint16: Uint16Array
};
var FloatPrecision;
(function (FloatPrecision) {
  FloatPrecision[FloatPrecision["FLOAT_32"] = 0] = "FLOAT_32";
  FloatPrecision[FloatPrecision["FLOAT_64"] = 1] = "FLOAT_64";
})(FloatPrecision || (FloatPrecision = {}));
function getFloatArrayPrecision(array) {
  switch (array.BYTES_PER_ELEMENT) {
    default:
      assertIsTrue(false);
    case 4:
      return FloatPrecision.FLOAT_32;
    case 8:
      return FloatPrecision.FLOAT_64;
  }
}
var QuantizedFloatArray = (_dec7 = ccclass(CLASS_NAME_PREFIX_ANIM + "QuantizedFloatArray"), _dec7(_class1 = (_class10 = function () {
  function QuantizedFloatArray(originalPrecision, values, extent, min) {
    if (min === void 0) {
      min = 0.0;
    }
    this.originalPrecision = _initializer0$1 && _initializer0$1();
    this.min = _initializer1$1 && _initializer1$1();
    this.extent = _initializer10$1 && _initializer10$1();
    this.values = _initializer11$1 && _initializer11$1();
    this.originalPrecision = originalPrecision;
    this.values = values;
    this.extent = extent;
    this.min = min;
  }
  var _proto11 = QuantizedFloatArray.prototype;
  _proto11.toHashString = function toHashString() {
    var originalPrecision = this.originalPrecision,
      min = this.min,
      extent = this.extent,
      values = this.values;
    return originalPrecision + " " + floatToHashString(min) + " " + floatToHashString(extent) + " " + values.join(' ');
  };
  return _createClass(QuantizedFloatArray, [{
    key: "quantizationType",
    get: function get() {
      switch (this.values.BYTES_PER_ELEMENT) {
        default:
        case 1:
          return 'uint8';
        case 2:
          return 'uint16';
      }
    }
  }]);
}(), _initializer0$1 = applyDecoratedInitializer(_class10.prototype, "originalPrecision", [serializable], null), _initializer1$1 = applyDecoratedInitializer(_class10.prototype, "min", [serializable], null), _initializer10$1 = applyDecoratedInitializer(_class10.prototype, "extent", [serializable], null), _initializer11$1 = applyDecoratedInitializer(_class10.prototype, "values", [serializable], null), _class10)) || _class1);
function _quantize(values, type) {
  var TypedArrayViewConstructor = QUANTIZATION_TYPE_TO_ARRAY_VIEW_CONSTRUCTOR_MAP[type];
  var MAX = 1 << TypedArrayViewConstructor.BYTES_PER_ELEMENT;
  var min = Number.POSITIVE_INFINITY;
  var max = Number.NEGATIVE_INFINITY;
  values.forEach(function (value) {
    min = Math.min(value, min);
    max = Math.max(value, max);
  });
  var extent = max - min;
  var normalized = TypedArrayViewConstructor.from(values, function (value) {
    return (value - min) / extent * MAX;
  });
  return new QuantizedFloatArray(getFloatArrayPrecision(values), normalized, extent, min);
}
function indexQuantized(quantized, index) {
  var quantizedValue = quantized.values[index];
  var MAX_VALUE = 1 << quantized.values.BYTES_PER_ELEMENT;
  return quantizedValue / MAX_VALUE * quantized.extent + quantized.min;
}
function createExoticTrackEvaluationRecord(times, values, ValueConstructor, path, property, binder) {
  var trackBinding = new TrackBinding();
  trackBinding.path = new TrackPath().toHierarchy(path).toProperty(property);
  var runtimeBinding = binder(trackBinding);
  if (!runtimeBinding) {
    return null;
  }
  var evaluator = new ExoticTrackEvaluator(times, values, ValueConstructor);
  return {
    runtimeBinding: runtimeBinding,
    evaluator: evaluator
  };
}
function loadVec3FromQuantized(values, index, out) {
  Vec3.set(out, indexQuantized(values, 3 * index + 0), indexQuantized(values, 3 * index + 1), indexQuantized(values, 3 * index + 2));
}
function loadQuatFromQuantized(values, index, out) {
  Quat.set(out, indexQuantized(values, 4 * index + 0), indexQuantized(values, 4 * index + 1), indexQuantized(values, 4 * index + 2), indexQuantized(values, 4 * index + 3));
}

var _dec$2, _class$2, _class2$2, _initializer$2, _initializer2$2;
var AuxiliaryCurveEntry = (_dec$2 = ccclass$1(CLASS_NAME_PREFIX_ANIM + "AuxiliaryCurveEntry"), _dec$2(_class$2 = (_class2$2 = function AuxiliaryCurveEntry() {
  this.name = _initializer$2 && _initializer$2();
  this.curve = _initializer2$2 && _initializer2$2();
}, _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "name", [serializable$1], function () {
  return '';
}), _initializer2$2 = applyDecoratedInitializer(_class2$2.prototype, "curve", [serializable$1], function () {
  return new RealCurve();
}), _class2$2)) || _class$2);

var _dec$1, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _AnimationClip, _dec2$1, _class3, _class4, _initializer11, _initializer12;
var searchForRootBonePathSymbol = Symbol('SearchForRootBonePath');
var exoticAnimationTag = Symbol('ExoticAnimation');
var embeddedPlayerCountTag = Symbol('[[EmbeddedPlayerCount]]');
var getEmbeddedPlayersTag = Symbol('[[GetEmbeddedPlayers]]');
var addEmbeddedPlayerTag = Symbol('[[AddEmbeddedPlayer]]');
var removeEmbeddedPlayerTag = Symbol('[[RemoveEmbeddedPlayer]]');
var clearEmbeddedPlayersTag = Symbol('[[ClearEmbeddedPlayers]]');
var additiveSettingsTag = Symbol('[[Additive Settings]]');
var AnimationClip = (_dec$1 = ccclass$1('cc.AnimationClip'), _dec$1(_class$1 = (_class2$1 = (_AnimationClip = function (_Asset) {
  function AnimationClip(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this.sample = _initializer$1 && _initializer$1();
    _this.speed = _initializer2$1 && _initializer2$1();
    _this.wrapMode = _initializer3$1 && _initializer3$1();
    _this.enableTrsBlending = _initializer4 && _initializer4();
    _this._duration = _initializer5 && _initializer5();
    _this._hash = _initializer6 && _initializer6();
    _this.frameRate = 0;
    _this._tracks = _initializer7 && _initializer7();
    _this._exoticAnimation = _initializer8 && _initializer8();
    _this._legacyData = undefined;
    _this._legacyDataDirty = false;
    _this._events = _initializer9 && _initializer9();
    _this._embeddedPlayers = _initializer0 && _initializer0();
    _this._additiveSettings = _initializer1 && _initializer1();
    _this._auxiliaryCurveEntries = _initializer10 && _initializer10();
    _this._runtimeEvents = {
      ratios: [],
      eventGroups: []
    };
    return _this;
  }
  _inheritsLoose(AnimationClip, _Asset);
  AnimationClip.createWithSpriteFrames = function createWithSpriteFrames(spriteFrames, sample) {
    var clip = new AnimationClip();
    clip.sample = sample || clip.sample;
    clip.duration = spriteFrames.length / clip.sample;
    var step = 1 / clip.sample;
    var track = new ObjectTrack();
    track.path = new TrackPath().toComponent('cc.Sprite').toProperty('spriteFrame');
    var curve = track.channels()[0].curve;
    curve.assignSorted(spriteFrames.map(function (spriteFrame, index) {
      return [step * index, spriteFrame];
    }));
    clip.addTrack(track);
    return clip;
  };
  var _proto = AnimationClip.prototype;
  _proto.onLoaded = function onLoaded() {
    this.frameRate = this.sample;
    this.events = this._events;
  };
  _proto.range = function range() {
    var range = {
      min: Infinity,
      max: -Infinity
    };
    var tracks = this._tracks;
    var nTracks = tracks.length;
    for (var iTrack = 0; iTrack < nTracks; ++iTrack) {
      var track = tracks[iTrack];
      var trackRange = track.range();
      range.min = Math.min(range.min, trackRange.min);
      range.max = Math.max(range.max, trackRange.max);
    }
    return range;
  };
  _proto.getTrack = function getTrack(index) {
    return this._tracks[index];
  };
  _proto.addTrack = function addTrack(track) {
    var index = this._tracks.length;
    this._tracks.push(track);
    return index;
  };
  _proto.removeTrack = function removeTrack(index) {
    this._tracks.splice(index, 1);
  };
  _proto.clearTracks = function clearTracks() {
    this._tracks.length = 0;
  };
  _proto.containsAnyEvent = function containsAnyEvent() {
    return this._events.length !== 0;
  };
  _proto.createEventEvaluator = function createEventEvaluator(targetNode) {
    return new EventEvaluator(targetNode, this._runtimeEvents.ratios, this._runtimeEvents.eventGroups, this.wrapMode);
  };
  _proto.containsAnyEmbeddedPlayer = function containsAnyEmbeddedPlayer() {
    return this._embeddedPlayers.length !== 0;
  };
  _proto.createEmbeddedPlayerEvaluator = function createEmbeddedPlayerEvaluator(targetNode) {
    return new EmbeddedPlayerEvaluation(this._embeddedPlayers, targetNode);
  };
  _proto.createEvaluator = function createEvaluator(context) {
    var _this2 = this;
    var target = context.target;
    var binder = function binder(binding) {
      if (context.mask && binding.isMaskedOff(context.mask)) {
        return undefined;
      }
      var trackTarget = binding.createRuntimeBinding(target, _this2.enableTrsBlending ? context.pose : undefined, false);
      if (!trackTarget) {
        warnID(3937, _this2.name, context.target instanceof Node ? context.target.name : context.target);
      }
      return trackTarget !== null && trackTarget !== void 0 ? trackTarget : undefined;
    };
    return this._createEvalWithBinder(target, binder, context.rootMotion);
  };
  _proto.destroy = function destroy() {
    var _cclegacy$director$ro;
    var dataPoolManager = (_cclegacy$director$ro = cclegacy.director.root) == null ? void 0 : _cclegacy$director$ro.dataPoolManager;
    if (dataPoolManager) {
      dataPoolManager.releaseAnimationClip(this);
    }
    SkelAnimDataHub.destroy(this);
    return _Asset.prototype.destroy.call(this);
  };
  _proto[BAKE_SKELETON_CURVE_SYMBOL] = function (start, samples, frames) {
    var step = 1.0 / samples;
    var animatedJoints = this._collectAnimatedJoints();
    var nAnimatedJoints = animatedJoints.length;
    var jointsBakeInfo = {};
    for (var iAnimatedJoint = 0; iAnimatedJoint < nAnimatedJoints; ++iAnimatedJoint) {
      var joint = animatedJoints[iAnimatedJoint];
      jointsBakeInfo[joint] = {
        transforms: Array.from({
          length: frames
        }, function () {
          return new Mat4();
        })
      };
    }
    var skeletonFrames = animatedJoints.reduce(function (result, joint) {
      result[joint] = new BoneGlobalTransform();
      return result;
    }, {});
    for (var _joint in skeletonFrames) {
      var skeletonFrame = skeletonFrames[_joint];
      var parentJoint = _joint.lastIndexOf('/');
      if (parentJoint >= 0) {
        var parentJointName = _joint.substring(0, parentJoint);
        var parentJointFrame = skeletonFrames[parentJointName];
        if (parentJointFrame) {
          skeletonFrame.parent = parentJointFrame;
        }
      }
    }
    var binder = function binder(binding) {
      var trsPath = binding.parseTrsPath();
      if (!trsPath) {
        return undefined;
      }
      var jointFrame = skeletonFrames[trsPath.node];
      if (!jointFrame) {
        return undefined;
      }
      return createBoneTransformBinding(jointFrame, trsPath.property);
    };
    var evaluator = this._createEvalWithBinder(undefined, binder, undefined);
    for (var iFrame = 0; iFrame < frames; ++iFrame) {
      var time = start + step * iFrame;
      evaluator.evaluate(time);
      for (var _iAnimatedJoint = 0; _iAnimatedJoint < nAnimatedJoints; ++_iAnimatedJoint) {
        var _joint2 = animatedJoints[_iAnimatedJoint];
        Mat4.copy(jointsBakeInfo[_joint2].transforms[iFrame], skeletonFrames[_joint2].globalTransform);
      }
      for (var _iAnimatedJoint2 = 0; _iAnimatedJoint2 < nAnimatedJoints; ++_iAnimatedJoint2) {
        var _joint3 = animatedJoints[_iAnimatedJoint2];
        skeletonFrames[_joint3].invalidate();
      }
    }
    return {
      samples: samples,
      frames: frames,
      joints: jointsBakeInfo
    };
  };
  _proto.upgradeUntypedTracks = function upgradeUntypedTracks(refine) {
    var newTracks = [];
    var removals = [];
    var tracks = this._tracks;
    var nTracks = tracks.length;
    for (var iTrack = 0; iTrack < nTracks; ++iTrack) {
      var track = tracks[iTrack];
      if (!(track instanceof UntypedTrack)) {
        continue;
      }
      var newTrack = track.upgrade(refine);
      if (newTrack) {
        newTracks.push(newTrack);
        removals.push(track);
      }
    }
    var nRemovalTracks = removals.length;
    for (var iRemovalTrack = 0; iRemovalTrack < nRemovalTracks; ++iRemovalTrack) {
      remove(tracks, removals[iRemovalTrack]);
    }
    tracks.push.apply(tracks, newTracks);
  };
  _proto[searchForRootBonePathSymbol] = function () {
    return this._searchForRootBonePath();
  };
  _proto.getPropertyCurves = function getPropertyCurves() {
    return this._getLegacyData().getPropertyCurves();
  };
  _proto.updateEventDatas = function updateEventDatas() {
    this.events = this._events;
  };
  _proto.hasEvents = function hasEvents() {
    return this.events.length !== 0;
  };
  _proto.syncLegacyData = function syncLegacyData() {
    if (this._legacyData) {
      this._fromLegacy(this._legacyData);
      this._legacyData = undefined;
    }
  };
  _proto[getEmbeddedPlayersTag] = function () {
    return this._embeddedPlayers;
  };
  _proto[addEmbeddedPlayerTag] = function (embeddedPlayer) {
    this._embeddedPlayers.push(embeddedPlayer);
  };
  _proto[removeEmbeddedPlayerTag] = function (embeddedPlayer) {
    var iEmbeddedPlayer = this._embeddedPlayers.indexOf(embeddedPlayer);
    if (iEmbeddedPlayer >= 0) {
      this._embeddedPlayers.splice(iEmbeddedPlayer, 1);
    }
  };
  _proto[clearEmbeddedPlayersTag] = function () {
    this._embeddedPlayers.length = 0;
  };
  _proto.getAuxiliaryCurveNames_experimental = function getAuxiliaryCurveNames_experimental() {
    return this._auxiliaryCurveEntries.map(function (entry) {
      return entry.name;
    });
  };
  _proto.hasAuxiliaryCurve_experimental = function hasAuxiliaryCurve_experimental(name) {
    return !!this._findAuxiliaryCurveEntry(name);
  };
  _proto.addAuxiliaryCurve_experimental = function addAuxiliaryCurve_experimental(name) {
    var entry = this._findAuxiliaryCurveEntry(name);
    if (!entry) {
      entry = new AuxiliaryCurveEntry();
      entry.name = name;
      this._auxiliaryCurveEntries.push(entry);
    }
    return entry.curve;
  };
  _proto.getAuxiliaryCurve_experimental = function getAuxiliaryCurve_experimental(name) {
    var entry = this._findAuxiliaryCurveEntry(name);
    assertIsTrue(entry);
    return entry.curve;
  };
  _proto.renameAuxiliaryCurve_experimental = function renameAuxiliaryCurve_experimental(name, newName) {
    var entry = this._findAuxiliaryCurveEntry(name);
    if (entry) {
      entry.name = newName;
    }
  };
  _proto.removeAuxiliaryCurve_experimental = function removeAuxiliaryCurve_experimental(name) {
    removeIf(this._auxiliaryCurveEntries, function (entry) {
      return entry.name === name;
    });
  };
  _proto._trySyncLegacyData = function _trySyncLegacyData() {
    if (this._legacyDataDirty) {
      this._legacyDataDirty = false;
      this.syncLegacyData();
    }
  };
  _proto._createEvalWithBinder = function _createEvalWithBinder(target, binder, rootMotionOptions) {
    if (this._legacyDataDirty) {
      this._legacyDataDirty = false;
      this.syncLegacyData();
    }
    var rootMotionTrackExcludes = [];
    var rootMotionEvaluation;
    if (rootMotionOptions) {
      rootMotionEvaluation = this._createRootMotionEvaluation(target, rootMotionOptions, rootMotionTrackExcludes);
    }
    var trackEvalStatues = [];
    var exoticAnimationEvaluator;
    var tracks = this._tracks;
    var nTracks = tracks.length;
    for (var iTrack = 0; iTrack < nTracks; ++iTrack) {
      var track = tracks[iTrack];
      if (rootMotionTrackExcludes.includes(track)) {
        continue;
      }
      if (Array.from(track.channels()).every(function (_ref) {
        var curve = _ref.curve;
        return curve.keyFramesCount === 0;
      })) {
        continue;
      }
      var runtimeBinding = binder(track[trackBindingTag]);
      if (!runtimeBinding) {
        continue;
      }
      var trackEval = void 0;
      if (!(track instanceof UntypedTrack)) {
        trackEval = track[createEvalSymbol]();
      } else {
        if (!runtimeBinding.getValue) {
          errorID(3930);
          continue;
        }
        var hintValue = runtimeBinding.getValue();
        trackEval = track.createLegacyEval(hintValue);
      }
      trackEvalStatues.push(new TrackEvalStatus(runtimeBinding, trackEval));
    }
    if (this._exoticAnimation) {
      exoticAnimationEvaluator = this._exoticAnimation.createEvaluator(binder);
    }
    var evaluation = new AnimationClipEvaluation(trackEvalStatues, exoticAnimationEvaluator, rootMotionEvaluation);
    return evaluation;
  };
  _proto._createRootMotionEvaluation = function _createRootMotionEvaluation(target, rootMotionOptions, rootMotionTrackExcludes) {
    if (!(target instanceof Node)) {
      errorID(3920);
      return undefined;
    }
    var rootBonePath = this._searchForRootBonePath();
    if (!rootBonePath) {
      warnID(3923);
      return undefined;
    }
    var rootBone = target.getChildByPath(rootBonePath);
    if (!rootBone) {
      warnID(3924);
      return undefined;
    }
    var boneTransform = new BoneTransform();
    var rootMotionsTrackEvaluations = [];
    var tracks = this._tracks;
    var nTracks = tracks.length;
    for (var iTrack = 0; iTrack < nTracks; ++iTrack) {
      var track = tracks[iTrack];
      var trackBinding = track[trackBindingTag];
      var trsPath = trackBinding.parseTrsPath();
      if (!trsPath) {
        continue;
      }
      var bonePath = trsPath.node;
      if (bonePath !== rootBonePath) {
        continue;
      }
      rootMotionTrackExcludes.push(track);
      var property = trsPath.property;
      var runtimeBinding = createBoneTransformBinding(boneTransform, property);
      if (!runtimeBinding) {
        continue;
      }
      var trackEval = track[createEvalSymbol]();
      rootMotionsTrackEvaluations.push(new TrackEvalStatus(runtimeBinding, trackEval));
    }
    var rootMotionEvaluation = new RootMotionEvaluation(rootBone, this._duration, boneTransform, rootMotionsTrackEvaluations);
    return rootMotionEvaluation;
  };
  _proto._searchForRootBonePath = function _searchForRootBonePath() {
    var paths = this._tracks.map(function (track) {
      var trsPath = track[trackBindingTag].parseTrsPath();
      if (trsPath) {
        var nodePath = trsPath.node;
        return {
          path: nodePath,
          rank: nodePath.split('/').length
        };
      } else {
        return {
          path: '',
          rank: 0
        };
      }
    });
    paths.sort(function (a, b) {
      return a.rank - b.rank;
    });
    var iNonEmptyPath = paths.findIndex(function (p) {
      return p.rank !== 0;
    });
    if (iNonEmptyPath < 0) {
      return '';
    }
    var nPaths = paths.length;
    var firstPath = paths[iNonEmptyPath];
    var highestPathsAreSame = true;
    for (var iPath = iNonEmptyPath + 1; iPath < nPaths; ++iPath) {
      var path = paths[iPath];
      if (path.rank !== firstPath.rank) {
        break;
      }
      if (path.path !== firstPath.path) {
        highestPathsAreSame = false;
        break;
      }
    }
    return highestPathsAreSame ? firstPath.path : '';
  };
  _proto._getLegacyData = function _getLegacyData() {
    if (!this._legacyData) {
      this._legacyData = this._toLegacy();
    }
    return this._legacyData;
  };
  _proto._toLegacy = function _toLegacy() {
    var keys = [];
    var legacyCurves = [];
    var commonTargets = [];
    var legacyClipData = new AnimationClipLegacyData(this._duration);
    legacyClipData.keys = keys;
    legacyClipData.curves = legacyCurves;
    legacyClipData.commonTargets = commonTargets;
    return legacyClipData;
  };
  _proto._fromLegacy = function _fromLegacy(legacyData) {
    var newTracks = legacyData.toTracks();
    var nNewTracks = newTracks.length;
    for (var iNewTrack = 0; iNewTrack < nNewTracks; ++iNewTrack) {
      this.addTrack(newTracks[iNewTrack]);
    }
  };
  _proto._collectAnimatedJoints = function _collectAnimatedJoints() {
    var joints = new Set();
    var tracks = this._tracks;
    var nTracks = tracks.length;
    for (var iTrack = 0; iTrack < nTracks; ++iTrack) {
      var track = tracks[iTrack];
      var trsPath = track[trackBindingTag].parseTrsPath();
      if (trsPath) {
        joints.add(trsPath.node);
      }
    }
    if (this._exoticAnimation) {
      var animatedJoints = this._exoticAnimation.collectAnimatedJoints();
      var nAnimatedJoints = animatedJoints.length;
      for (var iAnimatedJoint = 0; iAnimatedJoint < nAnimatedJoints; ++iAnimatedJoint) {
        joints.add(animatedJoints[iAnimatedJoint]);
      }
    }
    return Array.from(joints);
  };
  _proto._findAuxiliaryCurveEntry = function _findAuxiliaryCurveEntry(name) {
    return this._auxiliaryCurveEntries.find(function (entry) {
      return entry.name === name;
    });
  };
  return _createClass(AnimationClip, [{
    key: "duration",
    get: function get() {
      return this._duration;
    },
    set: function set(value) {
      this._duration = value;
    }
  }, {
    key: "tracksCount",
    get: function get() {
      return this._tracks.length;
    }
  }, {
    key: "tracks",
    get: function get() {
      return this._tracks;
    }
  }, {
    key: "hash",
    get: function get() {
      var _this$_exoticAnimatio, _this$_exoticAnimatio2;
      if (this._hash) {
        return this._hash;
      }
      var hashString = "Exotic:" + ((_this$_exoticAnimatio = (_this$_exoticAnimatio2 = this._exoticAnimation) == null ? void 0 : _this$_exoticAnimatio2.toHashString()) !== null && _this$_exoticAnimatio !== void 0 ? _this$_exoticAnimatio : '');
      return this._hash = murmurhash2_32_gc(hashString, 666);
    }
  }, {
    key: "events",
    get: function get() {
      return this._events;
    },
    set: function set(value) {
      var _this3 = this;
      this._events = value;
      var ratios = [];
      var eventGroups = [];
      var events = this.events.sort(function (a, b) {
        return a.frame - b.frame;
      });
      var nEvents = events.length;
      var _loop = function _loop() {
        var eventData = events[iEvent];
        var ratio = eventData.frame / _this3._duration;
        var i = ratios.findIndex(function (r) {
          return r === ratio;
        });
        if (i < 0) {
          i = ratios.length;
          ratios.push(ratio);
          eventGroups.push({
            events: []
          });
        }
        eventGroups[i].events.push({
          functionName: eventData.func,
          parameters: eventData.params
        });
      };
      for (var iEvent = 0; iEvent < nEvents; ++iEvent) {
        _loop();
      }
      this._runtimeEvents = {
        ratios: ratios,
        eventGroups: eventGroups
      };
    }
  }, {
    key: exoticAnimationTag,
    get: function get() {
      return this._exoticAnimation;
    }
  }, {
    key: exoticAnimationTag,
    set: function set(value) {
      this._exoticAnimation = value;
    }
  }, {
    key: "isAdditive_experimental",
    get: function get() {
      return this._additiveSettings.enabled;
    }
  }, {
    key: additiveSettingsTag,
    get: function get() {
      return this._additiveSettings;
    }
  }, {
    key: "keys",
    get: function get() {
      return this._getLegacyData().keys;
    },
    set: function set(value) {
      this._legacyDataDirty = true;
      this._getLegacyData().keys = value;
    }
  }, {
    key: "curves",
    get: function get() {
      this._legacyDataDirty = true;
      return this._getLegacyData().curves;
    },
    set: function set(value) {
      this._getLegacyData().curves = value;
    }
  }, {
    key: "commonTargets",
    get: function get() {
      return this._getLegacyData().commonTargets;
    },
    set: function set(value) {
      this._legacyDataDirty = true;
      this._getLegacyData().commonTargets = value;
    }
  }, {
    key: "data",
    get: function get() {
      return this._getLegacyData().data;
    }
  }, {
    key: "eventGroups",
    get: function get() {
      return this._runtimeEvents.eventGroups;
    }
  }, {
    key: embeddedPlayerCountTag,
    get: function get() {
      return this._embeddedPlayers.length;
    }
  }, {
    key: "auxiliaryCurveCount_experimental",
    get: function get() {
      return this._auxiliaryCurveEntries.length;
    }
  }]);
}(Asset), _AnimationClip.WrapMode = WrapMode, _AnimationClip), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "sample", [serializable$1], function () {
  return 60;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "speed", [serializable$1], function () {
  return 1;
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "wrapMode", [serializable$1], function () {
  return WrapMode.Normal;
}), _initializer4 = applyDecoratedInitializer(_class2$1.prototype, "enableTrsBlending", [serializable$1], function () {
  return false;
}), _initializer5 = applyDecoratedInitializer(_class2$1.prototype, "_duration", [serializable$1], function () {
  return 0;
}), _initializer6 = applyDecoratedInitializer(_class2$1.prototype, "_hash", [serializable$1], function () {
  return 0;
}), _initializer7 = applyDecoratedInitializer(_class2$1.prototype, "_tracks", [serializable$1], function () {
  return [];
}), _initializer8 = applyDecoratedInitializer(_class2$1.prototype, "_exoticAnimation", [serializable$1], function () {
  return null;
}), _initializer9 = applyDecoratedInitializer(_class2$1.prototype, "_events", [serializable$1], function () {
  return [];
}), _initializer0 = applyDecoratedInitializer(_class2$1.prototype, "_embeddedPlayers", [serializable$1], function () {
  return [];
}), _initializer1 = applyDecoratedInitializer(_class2$1.prototype, "_additiveSettings", [serializable$1], function () {
  return new AdditiveSettings();
}), _initializer10 = applyDecoratedInitializer(_class2$1.prototype, "_auxiliaryCurveEntries", [serializable$1], function () {
  return [];
}), _class2$1)) || _class$1);
var AdditiveSettings = (_dec2$1 = ccclass$1('cc.AnimationClipAdditiveSettings'), _dec2$1(_class3 = (_class4 = function AdditiveSettings() {
  this.enabled = _initializer11 && _initializer11();
  this.refClip = _initializer12 && _initializer12();
}, _initializer11 = applyDecoratedInitializer(_class4.prototype, "enabled", [serializable$1], function () {
  return false;
}), _initializer12 = applyDecoratedInitializer(_class4.prototype, "refClip", [serializable$1], function () {
  return null;
}), _class4)) || _class3);
cclegacy.AnimationClip = AnimationClip;
var TrackEvalStatus = function () {
  function TrackEvalStatus(binding, trackEval) {
    this._binding = void 0;
    this._trackEval = void 0;
    this._shouldEvaluateDefault = true;
    this._binding = binding;
    this._trackEval = trackEval;
    this._shouldEvaluateDefault = !!binding.getValue && trackEval.requiresDefault;
  }
  var _proto2 = TrackEvalStatus.prototype;
  _proto2.evaluate = function evaluate(time) {
    var binding = this._binding,
      trackEval = this._trackEval;
    var defaultValue = this._shouldEvaluateDefault ? binding.getValue() : undefined;
    var value = trackEval.evaluate(time, defaultValue);
    binding.setValue(value);
  };
  return TrackEvalStatus;
}();
var EmbeddedPlayerEvaluation = function () {
  function EmbeddedPlayerEvaluation(embeddedPlayers, rootNode) {
    this._embeddedPlayers = embeddedPlayers;
    this._embeddedPlayerEvaluationInfos = embeddedPlayers.map(function (embeddedPlayer) {
      var player = embeddedPlayer.playable;
      if (!player) {
        return null;
      }
      var instantiatedPlayer = player.instantiate(rootNode);
      if (!instantiatedPlayer) {
        return null;
      }
      return {
        instantiatedPlayer: instantiatedPlayer,
        entered: false,
        hostPauseTime: 0.0,
        lastIterations: 0
      };
    });
  }
  var _proto3 = EmbeddedPlayerEvaluation.prototype;
  _proto3.destroy = function destroy() {
    var embeddedPlayerEvaluationInfos = this._embeddedPlayerEvaluationInfos;
    var nEmbeddedPlayers = embeddedPlayerEvaluationInfos.length;
    for (var iEmbeddedPlayer = 0; iEmbeddedPlayer < nEmbeddedPlayers; ++iEmbeddedPlayer) {
      var _embeddedPlayerEvalua;
      (_embeddedPlayerEvalua = embeddedPlayerEvaluationInfos[iEmbeddedPlayer]) == null ? void 0 : _embeddedPlayerEvalua.instantiatedPlayer.destroy();
    }
    this._embeddedPlayerEvaluationInfos.length = 0;
  };
  _proto3.evaluate = function evaluate(time, iterations) {
    assertIsTrue(Number.isInteger(iterations));
    var embeddedPlayers = this._embeddedPlayers,
      embeddedPlayerEvaluationInfos = this._embeddedPlayerEvaluationInfos;
    var nEmbeddedPlayers = embeddedPlayers.length;
    for (var iEmbeddedPlayer = 0; iEmbeddedPlayer < nEmbeddedPlayers; ++iEmbeddedPlayer) {
      var embeddedPlayerEvaluationInfo = embeddedPlayerEvaluationInfos[iEmbeddedPlayer];
      if (!embeddedPlayerEvaluationInfo) {
        continue;
      }
      var entered = embeddedPlayerEvaluationInfo.entered,
        instantiatedPlayer = embeddedPlayerEvaluationInfo.instantiatedPlayer,
        lastIterations = embeddedPlayerEvaluationInfo.lastIterations;
      var _embeddedPlayers$iEmb = embeddedPlayers[iEmbeddedPlayer],
        begin = _embeddedPlayers$iEmb.begin,
        end = _embeddedPlayers$iEmb.end;
      var withinEmbeddedPlayer = time >= begin && time <= end;
      if (withinEmbeddedPlayer) {
        if (!entered) {
          instantiatedPlayer.play();
          embeddedPlayerEvaluationInfo.entered = true;
        } else if (iterations !== lastIterations) {
          instantiatedPlayer.stop();
          instantiatedPlayer.play();
          embeddedPlayerEvaluationInfo.entered = true;
        }
      } else if (entered) {
        instantiatedPlayer.stop();
        embeddedPlayerEvaluationInfo.entered = false;
      }
      embeddedPlayerEvaluationInfo.lastIterations = iterations;
      if (embeddedPlayerEvaluationInfo.entered) {
        var playerTime = time - begin;
        embeddedPlayerEvaluationInfo.instantiatedPlayer.setTime(playerTime);
      }
    }
  };
  _proto3.notifyHostSpeedChanged = function notifyHostSpeedChanged(speed) {
    var embeddedPlayers = this._embeddedPlayers,
      embeddedPlayerEvaluationInfos = this._embeddedPlayerEvaluationInfos;
    var nEmbeddedPlayers = embeddedPlayers.length;
    for (var iEmbeddedPlayer = 0; iEmbeddedPlayer < nEmbeddedPlayers; ++iEmbeddedPlayer) {
      var embeddedPlayerEvaluationInfo = embeddedPlayerEvaluationInfos[iEmbeddedPlayer];
      if (!embeddedPlayerEvaluationInfo) {
        continue;
      }
      var instantiatedPlayer = embeddedPlayerEvaluationInfo.instantiatedPlayer;
      var reconciledSpeed = embeddedPlayers[iEmbeddedPlayer].reconciledSpeed;
      if (reconciledSpeed) {
        instantiatedPlayer.setSpeed(speed);
      }
    }
  };
  _proto3.notifyHostPlay = function notifyHostPlay(time) {
    var embeddedPlayers = this._embeddedPlayers,
      embeddedPlayerEvaluationInfos = this._embeddedPlayerEvaluationInfos;
    var nEmbeddedPlayers = embeddedPlayers.length;
    for (var iEmbeddedPlayer = 0; iEmbeddedPlayer < nEmbeddedPlayers; ++iEmbeddedPlayer) {
      var embeddedPlayerEvaluationInfo = embeddedPlayerEvaluationInfos[iEmbeddedPlayer];
      if (!embeddedPlayerEvaluationInfo) {
        continue;
      }
      var _embeddedPlayers$iEmb2 = embeddedPlayers[iEmbeddedPlayer],
        begin = _embeddedPlayers$iEmb2.begin,
        end = _embeddedPlayers$iEmb2.end;
      var instantiatedPlayer = embeddedPlayerEvaluationInfo.instantiatedPlayer,
        entered = embeddedPlayerEvaluationInfo.entered;
      if (entered) {
        var hostPauseTime = embeddedPlayerEvaluationInfo.hostPauseTime;
        if (instantiatedPlayer.randomAccess || approx(hostPauseTime, time, 1e-5)) {
          var startTime = clamp(time, begin, end);
          instantiatedPlayer.play();
          instantiatedPlayer.setTime(startTime - begin);
        } else {
          instantiatedPlayer.stop();
        }
      }
    }
  };
  _proto3.notifyHostPause = function notifyHostPause(time) {
    var embeddedPlayers = this._embeddedPlayers,
      embeddedPlayerEvaluationInfos = this._embeddedPlayerEvaluationInfos;
    var nEmbeddedPlayers = embeddedPlayers.length;
    for (var iEmbeddedPlayer = 0; iEmbeddedPlayer < nEmbeddedPlayers; ++iEmbeddedPlayer) {
      var embeddedPlayerEvaluationInfo = embeddedPlayerEvaluationInfos[iEmbeddedPlayer];
      if (!embeddedPlayerEvaluationInfo) {
        continue;
      }
      var instantiatedPlayer = embeddedPlayerEvaluationInfo.instantiatedPlayer,
        entered = embeddedPlayerEvaluationInfo.entered;
      if (entered) {
        instantiatedPlayer.pause();
        embeddedPlayerEvaluationInfo.hostPauseTime = time;
      }
    }
  };
  _proto3.notifyHostStop = function notifyHostStop() {
    var embeddedPlayers = this._embeddedPlayers,
      embeddedPlayerEvaluationInfos = this._embeddedPlayerEvaluationInfos;
    var nEmbeddedPlayers = embeddedPlayers.length;
    for (var iEmbeddedPlayer = 0; iEmbeddedPlayer < nEmbeddedPlayers; ++iEmbeddedPlayer) {
      var embeddedPlayerEvaluationInfo = embeddedPlayerEvaluationInfos[iEmbeddedPlayer];
      if (!embeddedPlayerEvaluationInfo) {
        continue;
      }
      var instantiatedPlayer = embeddedPlayerEvaluationInfo.instantiatedPlayer,
        entered = embeddedPlayerEvaluationInfo.entered;
      if (entered) {
        embeddedPlayerEvaluationInfo.entered = false;
        instantiatedPlayer.stop();
      }
    }
  };
  return EmbeddedPlayerEvaluation;
}();
var AnimationClipEvaluation = function () {
  function AnimationClipEvaluation(trackEvalStatuses, exoticAnimationEvaluator, rootMotionEvaluation) {
    this._exoticAnimationEvaluator = void 0;
    this._trackEvalStatues = [];
    this._rootMotionEvaluation = undefined;
    this._trackEvalStatues = trackEvalStatuses;
    this._exoticAnimationEvaluator = exoticAnimationEvaluator;
    this._rootMotionEvaluation = rootMotionEvaluation;
  }
  var _proto4 = AnimationClipEvaluation.prototype;
  _proto4.evaluate = function evaluate(time) {
    var trackEvalStatuses = this._trackEvalStatues,
      exoticAnimationEvaluator = this._exoticAnimationEvaluator;
    var nTrackEvalStatuses = trackEvalStatuses.length;
    for (var iTrackEvalStatus = 0; iTrackEvalStatus < nTrackEvalStatuses; ++iTrackEvalStatus) {
      trackEvalStatuses[iTrackEvalStatus].evaluate(time);
    }
    if (exoticAnimationEvaluator) {
      exoticAnimationEvaluator.evaluate(time);
    }
  };
  _proto4.evaluateRootMotion = function evaluateRootMotion(time, motionLength) {
    var rootMotionEvaluation = this._rootMotionEvaluation;
    if (rootMotionEvaluation) {
      rootMotionEvaluation.evaluate(time, motionLength);
    }
  };
  return AnimationClipEvaluation;
}();
var BoneTransform = function () {
  function BoneTransform() {
    this.position = new Vec3();
    this.scale = new Vec3(1.0, 1.0, 1.0);
    this.rotation = new Quat();
    this.eulerAngles = new Vec3();
  }
  var _proto5 = BoneTransform.prototype;
  _proto5.getTransform = function getTransform(out) {
    Mat4.fromRTS(out, this.rotation, this.position, this.scale);
  };
  return BoneTransform;
}();
var BoneGlobalTransform = function (_BoneTransform2) {
  function BoneGlobalTransform() {
    var _this4;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this4 = _BoneTransform2.call.apply(_BoneTransform2, [this].concat(args)) || this;
    _this4.parent = null;
    _this4._dirty = true;
    _this4._transform = new Mat4();
    return _this4;
  }
  _inheritsLoose(BoneGlobalTransform, _BoneTransform2);
  var _proto6 = BoneGlobalTransform.prototype;
  _proto6.invalidate = function invalidate() {
    this._dirty = true;
  };
  return _createClass(BoneGlobalTransform, [{
    key: "globalTransform",
    get: function get() {
      var transform = this._transform;
      if (this._dirty) {
        this._dirty = false;
        Mat4.fromRTS(transform, this.rotation, this.position, this.scale);
        if (this.parent) {
          Mat4.multiply(transform, this.parent.globalTransform, transform);
        }
      }
      return this._transform;
    }
  }]);
}(BoneTransform);
var motionTransformCache = new Mat4();
var RootMotionEvaluation = function () {
  function RootMotionEvaluation(_rootBone, _duration, _boneTransform, _trackEvalStatuses) {
    this._initialTransformCache = new Mat4();
    this._clipEndTransformCache = new Mat4();
    this._startTransformCache = new Mat4();
    this._endTransformCache = new Mat4();
    this._motionTransformCache = new Mat4();
    this._translationMotionCache = new Vec3();
    this._rotationMotionCache = new Quat();
    this._scaleMotionCache = new Vec3();
    this._rootBone = _rootBone;
    this._duration = _duration;
    this._boneTransform = _boneTransform;
    this._trackEvalStatuses = _trackEvalStatuses;
  }
  var _proto7 = RootMotionEvaluation.prototype;
  _proto7.evaluate = function evaluate(time, motionLength) {
    var motionTransform = this._calcMotionTransform(time, motionLength, this._motionTransformCache);
    var translationMotion = this._translationMotionCache,
      rotationMotion = this._rotationMotionCache,
      scaleMotion = this._scaleMotionCache,
      rootBone = this._rootBone;
    Mat4.toSRT(motionTransform, rotationMotion, translationMotion, scaleMotion);
    Vec3.add(translationMotion, translationMotion, rootBone.position);
    rootBone.setPosition(translationMotion);
    Quat.multiply(rotationMotion, rotationMotion, rootBone.rotation);
    rootBone.setRotation(rotationMotion);
    Vec3.multiply(scaleMotion, scaleMotion, rootBone.scale);
    rootBone.setScale(scaleMotion);
  };
  _proto7._calcMotionTransform = function _calcMotionTransform(time, motionLength, outTransform) {
    var duration = this._duration;
    var remainLength = duration - time;
    assertIsTrue(remainLength >= 0);
    var startTransform = this._evaluateAt(time, this._startTransformCache);
    if (motionLength < remainLength) {
      var endTransform = this._evaluateAt(time + motionLength, this._endTransformCache);
      relativeTransform(outTransform, startTransform, endTransform);
    } else {
      Mat4.identity(outTransform);
      var accumulateMotionTransform = function accumulateMotionTransform(from, to) {
        relativeTransform(motionTransformCache, from, to);
        Mat4.multiply(outTransform, outTransform, motionTransformCache);
      };
      var diff = motionLength - remainLength;
      var repeatCount = Math.floor(diff / duration);
      var lastRemainTime = diff - repeatCount * duration;
      var clipStartTransform = this._evaluateAt(0, this._initialTransformCache);
      var clipEndTransform = this._evaluateAt(duration, this._clipEndTransformCache);
      var _endTransform = this._evaluateAt(lastRemainTime, this._endTransformCache);
      accumulateMotionTransform(startTransform, clipEndTransform);
      relativeTransform(motionTransformCache, clipStartTransform, clipEndTransform);
      for (var i = 0; i < repeatCount; ++i) {
        Mat4.multiply(outTransform, outTransform, motionTransformCache);
      }
      accumulateMotionTransform(clipStartTransform, _endTransform);
    }
    return outTransform;
  };
  _proto7._evaluateAt = function _evaluateAt(time, outTransform) {
    var trackEvalStatuses = this._trackEvalStatuses;
    var nTrackEvalStatuses = trackEvalStatuses.length;
    for (var iTrackEvalStatus = 0; iTrackEvalStatus < nTrackEvalStatuses; ++iTrackEvalStatus) {
      trackEvalStatuses[iTrackEvalStatus].evaluate(time);
    }
    this._boneTransform.getTransform(outTransform);
    return outTransform;
  };
  return RootMotionEvaluation;
}();
function relativeTransform(out, from, to) {
  Mat4.invert(out, from);
  Mat4.multiply(out, to, out);
}
function createBoneTransformBinding(boneTransform, property) {
  switch (property) {
    default:
      return undefined;
    case 'position':
      return {
        setValue: function setValue(value) {
          Vec3.copy(boneTransform.position, value);
        }
      };
    case 'rotation':
      return {
        setValue: function setValue(value) {
          Quat.copy(boneTransform.rotation, value);
        }
      };
    case 'scale':
      return {
        setValue: function setValue(value) {
          Vec3.copy(boneTransform.scale, value);
        }
      };
    case 'eulerAngles':
      return {
        setValue: function setValue(value) {
          Vec3.copy(boneTransform.eulerAngles, value);
        }
      };
  }
}
var InvalidIndex = -1;
var EventEvaluator = function () {
  function EventEvaluator(_targetNode, _ratios, _eventGroups, _wrapMode) {
    this._lastFrameIndex = -1;
    this._lastIterations = 0.0;
    this._lastDirection = 0;
    this._ignoreIndex = InvalidIndex;
    this._sampled = false;
    this._targetNode = _targetNode;
    this._ratios = _ratios;
    this._eventGroups = _eventGroups;
    this._wrapMode = _wrapMode;
  }
  var _proto8 = EventEvaluator.prototype;
  _proto8.setWrapMode = function setWrapMode(wrapMode) {
    this._wrapMode = wrapMode;
  };
  _proto8.ignore = function ignore(ratio, direction) {
    this._ignoreIndex = InvalidIndex;
    this._sampled = false;
    var frameIndex = getEventGroupIndexAtRatio(ratio, this._ratios);
    if (frameIndex < 0) {
      frameIndex = ~frameIndex - 1;
      if (direction < 0) {
        frameIndex += 1;
      }
      this._ignoreIndex = frameIndex;
    }
  };
  _proto8.reset = function reset() {
    this._lastFrameIndex = -1;
    this._lastIterations = 0.0;
    this._lastDirection = 0;
    this._ignoreIndex = InvalidIndex;
    this._sampled = false;
  };
  _proto8.sample = function sample(ratio, direction, iterations) {
    if (this._eventGroups.length === 0) {
      return;
    }
    var length = this._eventGroups.length;
    var eventIndex = getEventGroupIndexAtRatio(ratio, this._ratios);
    if (eventIndex < 0) {
      eventIndex = ~eventIndex - 1;
      if (direction < 0) {
        eventIndex += 1;
      }
    }
    if (this._ignoreIndex !== eventIndex) {
      this._ignoreIndex = InvalidIndex;
    }
    if (!this._sampled) {
      this._sampled = true;
      this._doFire(eventIndex, false);
      this._lastFrameIndex = eventIndex;
      this._lastIterations = iterations;
      this._lastDirection = direction;
      return;
    }
    var wrapMode = this._wrapMode;
    var currentIterations = wrapIterations(iterations);
    var lastIterations = wrapIterations(this._lastIterations);
    var lastIndex = this._lastFrameIndex;
    var lastDirection = this._lastDirection;
    var iterationsChanged = lastIterations !== -1 && currentIterations !== lastIterations;
    if (lastIndex === eventIndex && iterationsChanged && length === 1) {
      this._doFire(0, false);
    } else if (lastIndex !== eventIndex || iterationsChanged) {
      direction = lastDirection;
      do {
        if (lastIndex !== eventIndex) {
          if (direction === -1 && lastIndex === 0 && eventIndex > 0) {
            if ((wrapMode & WrapModeMask.PingPong) === WrapModeMask.PingPong) {
              direction *= -1;
            } else {
              lastIndex = length;
            }
            lastIterations++;
          } else if (direction === 1 && lastIndex === length - 1 && eventIndex < length - 1) {
            if ((wrapMode & WrapModeMask.PingPong) === WrapModeMask.PingPong) {
              direction *= -1;
            } else {
              lastIndex = -1;
            }
            lastIterations++;
          }
          if (lastIndex === eventIndex) {
            break;
          }
          if (lastIterations > currentIterations) {
            break;
          }
        }
        lastIndex += direction;
        this._doFire(lastIndex, true);
      } while (lastIndex !== eventIndex && lastIndex > -1 && lastIndex < length);
    }
    this._lastFrameIndex = eventIndex;
    this._lastIterations = iterations;
    this._lastDirection = direction;
  };
  _proto8._doFire = function _doFire(eventIndex, delay) {
    if (delay) {
      getGlobalAnimationManager().pushDelayEvent(this._checkAndFire, this, [eventIndex]);
    } else {
      this._checkAndFire(eventIndex);
    }
  };
  _proto8._checkAndFire = function _checkAndFire(eventIndex) {
    if (!this._targetNode || !this._targetNode.isValid) {
      return;
    }
    var eventGroups = this._eventGroups;
    if (eventIndex < 0 || eventIndex >= eventGroups.length || this._ignoreIndex === eventIndex) {
      return;
    }
    var eventGroup = eventGroups[eventIndex];
    var nEvents = eventGroup.events.length;
    for (var iEvent = 0; iEvent < nEvents; ++iEvent) {
      var event = eventGroup.events[iEvent];
      invokeComponentMethodsEngagedInAnimationEvent(this._targetNode, event.functionName, event.parameters);
    }
  };
  return EventEvaluator;
}();
function wrapIterations(iterations) {
  if (iterations - (iterations | 0) === 0) {
    iterations -= 1;
  }
  return iterations | 0;
}
function getEventGroupIndexAtRatio(ratio, ratios) {
  var result = binarySearchEpsilon(ratios, ratio);
  return result;
}

var CrossFade = function (_Playable) {
  function CrossFade(scheduler) {
    var _this;
    _this = _Playable.call(this) || this;
    _this._managedStates = [];
    _this._fadings = [];
    _this._scheduled = false;
    _this._scheduler = scheduler !== null && scheduler !== void 0 ? scheduler : getGlobalAnimationManager();
    return _this;
  }
  _inheritsLoose(CrossFade, _Playable);
  var _proto = CrossFade.prototype;
  _proto.update = function update(deltaTime) {
    if (this.isMotionless) {
      return;
    }
    var managedStates = this._managedStates;
    var fadings = this._fadings;
    if (managedStates.length === 1 && fadings.length === 1) {
      var state = managedStates[0].state;
      if (state) {
        state.weight = 1.0;
      }
    } else {
      this._calculateWeights(deltaTime);
    }
    if (managedStates.length === 1 && fadings.length === 1) {
      this._unscheduleThis();
    }
  };
  _proto.crossFade = function crossFade(state, duration) {
    var _target$state;
    if (this._managedStates.length === 0) {
      duration = 0;
    }
    if (duration === 0) {
      this.clear();
    }
    var target = this._managedStates.find(function (weightedState) {
      return weightedState.state === state;
    });
    if (!target) {
      target = {
        state: state,
        reference: 0
      };
      if (state) {
        state.play();
      }
      this._managedStates.push(target);
    } else if ((_target$state = target.state) != null && _target$state.isMotionless) {
      target.state.play();
    }
    ++target.reference;
    this._fadings.unshift({
      easeDuration: duration,
      easeTime: 0,
      target: target
    });
    if (!this.isMotionless) {
      this._scheduleThis();
    }
  };
  _proto.clear = function clear() {
    for (var iManagedState = 0; iManagedState < this._managedStates.length; ++iManagedState) {
      var state = this._managedStates[iManagedState].state;
      if (state) {
        state.stop();
      }
    }
    this._managedStates.length = 0;
    this._fadings.length = 0;
  };
  _proto.onPlay = function onPlay() {
    _Playable.prototype.onPlay.call(this);
    this._scheduleThis();
  };
  _proto.onPause = function onPause() {
    _Playable.prototype.onPause.call(this);
    for (var iManagedState = 0; iManagedState < this._managedStates.length; ++iManagedState) {
      var state = this._managedStates[iManagedState].state;
      if (state) {
        state.pause();
      }
    }
    this._unscheduleThis();
  };
  _proto.onResume = function onResume() {
    _Playable.prototype.onResume.call(this);
    for (var iManagedState = 0; iManagedState < this._managedStates.length; ++iManagedState) {
      var state = this._managedStates[iManagedState].state;
      if (state) {
        state.resume();
      }
    }
    this._scheduleThis();
  };
  _proto.onStop = function onStop() {
    _Playable.prototype.onStop.call(this);
    this.clear();
  };
  _proto._calculateWeights = function _calculateWeights(deltaTime) {
    var managedStates = this._managedStates;
    var fadings = this._fadings;
    for (var iManagedState = 0; iManagedState < managedStates.length; ++iManagedState) {
      var state = managedStates[iManagedState].state;
      if (state) {
        state.weight = 0;
      }
    }
    var absoluteWeight = 1.0;
    var deadFadingBegin = fadings.length;
    for (var iFading = 0; iFading < fadings.length; ++iFading) {
      var fading = fadings[iFading];
      fading.easeTime += deltaTime;
      var relativeWeight = fading.easeDuration === 0 ? 1 : clamp01(fading.easeTime / fading.easeDuration);
      var weight = relativeWeight * absoluteWeight;
      absoluteWeight *= 1.0 - relativeWeight;
      if (fading.target.state) {
        fading.target.state.weight += weight;
      }
      if (fading.easeTime >= fading.easeDuration) {
        deadFadingBegin = iFading + 1;
        fading.easeTime = fading.easeDuration;
        break;
      }
    }
    if (deadFadingBegin !== fadings.length) {
      for (var iDeadFading = deadFadingBegin; iDeadFading < fadings.length; ++iDeadFading) {
        var deadFading = fadings[iDeadFading];
        --deadFading.target.reference;
        if (deadFading.target.reference <= 0) {
          if (deadFading.target.state) {
            deadFading.target.state.stop();
          }
          remove(this._managedStates, deadFading.target);
        }
      }
      fadings.splice(deadFadingBegin);
    }
  };
  _proto._scheduleThis = function _scheduleThis() {
    if (!this._scheduled) {
      this._scheduler.addCrossFade(this);
      this._scheduled = true;
    }
  };
  _proto._unscheduleThis = function _unscheduleThis() {
    if (this._scheduled) {
      this._scheduler.removeCrossFade(this);
      this._scheduled = false;
    }
  };
  return CrossFade;
}(Playable);

var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _initializer, _initializer2, _initializer3, _Animation;
var Animation = (_dec = ccclass$1('cc.Animation'), _dec2 = executionOrder(99), _dec3 = type([AnimationClip]), _dec4 = type(AnimationClip), _dec5 = type([AnimationClip]), _dec(_class = _dec2(_class = (_class2 = (_Animation = function (_Eventify) {
  function Animation() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Eventify.call.apply(_Eventify, [this].concat(args)) || this;
    _this.playOnLoad = _initializer && _initializer();
    _this._crossFade = new CrossFade();
    _this._nameToState = createMap(true);
    _this._clips = _initializer2 && _initializer2();
    _this._defaultClip = _initializer3 && _initializer3();
    _this._hasBeenPlayed = false;
    return _this;
  }
  _inheritsLoose(Animation, _Eventify);
  var _proto = Animation.prototype;
  _proto.onLoad = function onLoad() {
    this.clips = this._clips;
    for (var stateName in this._nameToState) {
      var state = this._nameToState[stateName];
      state.initialize(this.node);
    }
  };
  _proto.start = function start() {
    if (this.playOnLoad && !this._hasBeenPlayed && this._defaultClip) {
      this.crossFade(this._defaultClip.name, 0);
    }
  };
  _proto.onEnable = function onEnable() {
    this._crossFade.resume();
  };
  _proto.onDisable = function onDisable() {
    this._crossFade.pause();
  };
  _proto.onDestroy = function onDestroy() {
    this._crossFade.stop();
    for (var name in this._nameToState) {
      var state = this._nameToState[name];
      state.destroy();
    }
    this._nameToState = createMap(true);
  };
  _proto.play = function play(name) {
    this._hasBeenPlayed = true;
    if (!name) {
      if (!this._defaultClip) {
        return;
      }
      name = this._defaultClip.name;
    }
    this.crossFade(name, 0);
  };
  _proto.crossFade = function crossFade(name, duration) {
    if (duration === void 0) {
      duration = 0.3;
    }
    this._hasBeenPlayed = true;
    var state = this._nameToState[name];
    if (state) {
      this.doPlayOrCrossFade(state, duration);
    }
  };
  _proto.pause = function pause() {
    this._crossFade.pause();
  };
  _proto.resume = function resume() {
    this._crossFade.resume();
  };
  _proto.stop = function stop() {
    this._crossFade.stop();
  };
  _proto.getState = function getState(name) {
    var state = this._nameToState[name];
    if (state && !state.curveLoaded) {
      state.initialize(this.node);
    }
    return state || null;
  };
  _proto.createState = function createState(clip, name) {
    name = name || clip.name;
    this.removeState(name);
    return this._doCreateState(clip, name);
  };
  _proto.removeState = function removeState(name) {
    var state = this._nameToState[name];
    if (state) {
      state.allowLastFrameEvent(false);
      state.stop();
      delete this._nameToState[name];
    }
  };
  _proto.addClip = function addClip(clip, name) {
    if (!contains(this._clips, clip)) {
      this._clips.push(clip);
    }
    return this.createState(clip, name);
  };
  _proto.removeClip = function removeClip(clip, force) {
    var removalState;
    for (var name in this._nameToState) {
      var state = this._nameToState[name];
      var stateClip = state.clip;
      if (stateClip === clip) {
        removalState = state;
        break;
      }
    }
    if (clip === this._defaultClip) {
      if (force) {
        this._defaultClip = null;
      } else {
        {
          warnID(3902);
        }
        return;
      }
    }
    if (removalState && removalState.isPlaying) {
      if (force) {
        removalState.stop();
      } else {
        {
          warnID(3903);
        }
        return;
      }
    }
    this._clips = this._clips.filter(function (item) {
      return item !== clip;
    });
    if (removalState) {
      delete this._nameToState[removalState.name];
    }
  };
  _proto.on = function on(type, callback, thisArg, once) {
    var ret = _Eventify.prototype.on.call(this, type, callback, thisArg, once);
    if (type === AnimationStateEventType.LASTFRAME) {
      this._syncAllowLastFrameEvent();
    }
    return ret;
  };
  _proto.once = function once(type, callback, thisArg) {
    var ret = _Eventify.prototype.once.call(this, type, callback, thisArg);
    if (type === AnimationStateEventType.LASTFRAME) {
      this._syncAllowLastFrameEvent();
    }
    return ret;
  };
  _proto.off = function off(type, callback, thisArg) {
    _Eventify.prototype.off.call(this, type, callback, thisArg);
    if (type === AnimationStateEventType.LASTFRAME) {
      this._syncDisallowLastFrameEvent();
    }
  };
  _proto._createState = function _createState(clip, name) {
    return new AnimationState(clip, name);
  };
  _proto._doCreateState = function _doCreateState(clip, name) {
    var state = this._createState(clip, name);
    state._setEventTarget(this);
    state.allowLastFrameEvent(this.hasEventListener(AnimationStateEventType.LASTFRAME));
    if (this.node) {
      state.initialize(this.node);
    }
    this._nameToState[state.name] = state;
    return state;
  };
  _proto.doPlayOrCrossFade = function doPlayOrCrossFade(state, duration) {
    this._crossFade.play();
    this._crossFade.crossFade(state, duration);
  };
  _proto._removeStateOfAutomaticClip = function _removeStateOfAutomaticClip(clip) {
    for (var name in this._nameToState) {
      var state = this._nameToState[name];
      if (equalClips(clip, state.clip)) {
        state.stop();
        delete this._nameToState[name];
      }
    }
  };
  _proto._syncAllowLastFrameEvent = function _syncAllowLastFrameEvent() {
    if (this.hasEventListener(AnimationStateEventType.LASTFRAME)) {
      for (var stateName in this._nameToState) {
        this._nameToState[stateName].allowLastFrameEvent(true);
      }
    }
  };
  _proto._syncDisallowLastFrameEvent = function _syncDisallowLastFrameEvent() {
    if (!this.hasEventListener(AnimationStateEventType.LASTFRAME)) {
      for (var stateName in this._nameToState) {
        this._nameToState[stateName].allowLastFrameEvent(false);
      }
    }
  };
  return _createClass(Animation, [{
    key: "clips",
    get: function get() {
      return this._clips;
    },
    set: function set(value) {
      var _this2 = this;
      if (this._crossFade) {
        this._crossFade.clear();
      }
      this._clips.forEach(function (clip) {
        if (clip) {
          _this2._removeStateOfAutomaticClip(clip);
        }
      });
      value.forEach(function (clip) {
        if (clip) {
          _this2.createState(clip);
        }
      });
      var newDefaultClip = value.find(function (clip) {
        return equalClips(clip, _this2._defaultClip);
      });
      if (newDefaultClip) {
        this._defaultClip = newDefaultClip;
      } else {
        this._defaultClip = null;
      }
      this._clips = value;
    }
  }, {
    key: "defaultClip",
    get: function get() {
      return this._defaultClip;
    },
    set: function set(value) {
      this._defaultClip = value;
      if (!value) {
        return;
      }
      var isBoundedDefaultClip = this._clips.findIndex(function (clip) {
        return equalClips(clip, value);
      }) >= 0;
      if (!isBoundedDefaultClip) {
        this._clips.push(value);
        this.createState(value);
      }
    }
  }]);
}(Eventify(Component)), _Animation.EventType = AnimationStateEventType, _Animation), _applyDecoratedDescriptor(_class2.prototype, "clips", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "clips"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "defaultClip", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "defaultClip"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "playOnLoad", [serializable$1], function () {
  return false;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_clips", [_dec5], function () {
  return [];
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_defaultClip", [serializable$1], function () {
  return null;
}), _class2)) || _class) || _class);
function equalClips(clip1, clip2) {
  if (clip1 === clip2) {
    return true;
  }
  return !!clip1 && !!clip2 && clip1._uuid === clip2._uuid && clip1._uuid;
}
cclegacy.Animation = Animation;
cclegacy.AnimationComponent = Animation;
setClassAlias(Animation, 'cc.AnimationComponent');

export { AnimationState as A, CLASS_NAME_PREFIX_ANIM as C, EventInfo as E, HierarchyPath as H, ObjectTrack as O, QuatTrack as Q, RealTrack as R, SizeTrack as S, Track as T, UntypedTrack as U, VectorTrack as V, WrappedInfo as W, Animation as a, Channel as b, createEvalSymbol as c, additiveSettingsTag as d, exoticAnimationTag as e, isTrsPropertyName as f, getGlobalAnimationManager as g, AnimationClip as h, invokeComponentMethodsEngagedInAnimationEvent as i, ColorTrack as j, ComponentPath as k, CubicSplineNumberValue as l, CubicSplineQuatValue as m, normalizedFollowTag as n, CubicSplineVec2Value as o, CubicSplineVec3Value as p, CubicSplineVec4Value as q, TrackPath as r, isCustomPath as s, trackBindingTag as t, isPropertyPath as u, RatioSampler as v, AnimCurve as w, sampleAnimationCurve as x, computeRatioByType as y };
//# sourceMappingURL=animation-component-DyCWmzfU.js.map
