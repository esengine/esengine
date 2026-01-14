import { f as Vec3, a0 as SplineMode, a1 as Spline, S as System, a2 as SystemPriority, a3 as easing } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { _ as _inheritsLoose, k as errorID, W as logID, i as isCCObject, a as _createClass, G as macro, a6 as _assertThisInitialized, w as warnID, e as warn } from './gc-object-CShF5lzx.js';
import './prefab-DYg_oxpo.js';
import { N as Node } from './scene-vWcxM1_c.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { N as NodeEventType } from './node-event-Ccvtv8bJ.js';
import './deprecated-Dswa7XeN.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import { R as Renderer } from './renderer-C7HM72NY.js';
import { c as cclegacy, e as engineVersion, l as legacyCC } from './global-exports-DnCP_14L.js';
import './touch-BKrZ-fxl.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './debug-view-BuNhRPv_.js';
import './deprecated-n0w4kK7g.js';

var _v3_tmp_1 = new Vec3();
var _v3_tmp_2 = new Vec3();
function createSplineProperty(mode, knots) {
  var spline = null;
  return {
    value: knots.length > 0 ? knots[knots.length - 1] : Vec3.ZERO,
    progress: function progress(start, end, current, ratio) {
      return spline.getPoint(ratio);
    },
    clone: function clone(v) {
      return Vec3.clone(v);
    },
    add: function add(a, b) {
      return a.clone().add(b);
    },
    sub: function sub(a, b) {
      return a.clone().subtract(b);
    },
    onStart: function onStart(param) {
      var start = param.start,
        end = param.end,
        relative = param.relative,
        reversed = param.reversed;
      spline = Spline.create(mode);
      spline.addKnot(start);
      var reversedLast = null;
      if (relative && reversed) {
        reversedLast = _v3_tmp_2;
        Vec3.subtract(reversedLast, start, knots[knots.length - 1]);
      }
      for (var i = 0, len = knots.length; i < len; ++i) {
        var v = reversed ? knots[len - 1 - i] : knots[i];
        if (relative) {
          if (reversed) {
            if (i > 0) {
              spline.addKnot(Vec3.copy(_v3_tmp_1, reversedLast).add(v));
            }
          } else {
            spline.addKnot(Vec3.copy(_v3_tmp_1, start).add(v));
          }
        } else {
          spline.addKnot(v);
        }
      }
      if (relative && reversed) {
        spline.addKnot(end);
      }
    },
    onComplete: function onComplete() {
      spline = null;
    },
    onStop: function onStop() {
      spline = null;
    },
    legacyProgress: false
  };
}
function bezier() {
  for (var _len = arguments.length, knots = new Array(_len), _key = 0; _key < _len; _key++) {
    knots[_key] = arguments[_key];
  }
  return createSplineProperty(SplineMode.BEZIER, knots);
}
function catmullRom() {
  for (var _len2 = arguments.length, knots = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    knots[_key2] = arguments[_key2];
  }
  return createSplineProperty(SplineMode.CATMULL_ROM, knots);
}

var tweenProgress = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bezier: bezier,
    catmullRom: catmullRom
});

var ActionEnum;
(function (ActionEnum) {
  ActionEnum[ActionEnum["TAG_INVALID"] = -1] = "TAG_INVALID";
})(ActionEnum || (ActionEnum = {}));
var Action = function () {
  function Action() {
    this.originalTarget = null;
    this.target = null;
    this._owner = null;
    this.tag = ActionEnum.TAG_INVALID;
    this._id = undefined;
    this._paused = false;
  }
  var _proto = Action.prototype;
  _proto.isDone = function isDone() {
    return true;
  };
  _proto.startWithTarget = function startWithTarget(target) {
    this.originalTarget = target;
    this.target = target;
  };
  _proto.stop = function stop() {
    this.target = null;
  };
  _proto.getTarget = function getTarget() {
    return this.target;
  };
  _proto.setTarget = function setTarget(target) {
    this.target = target;
  };
  _proto.getOriginalTarget = function getOriginalTarget() {
    return this.originalTarget;
  };
  _proto.setOriginalTarget = function setOriginalTarget(originalTarget) {
    this.originalTarget = originalTarget;
  };
  _proto._getWorkerTarget = function _getWorkerTarget() {
    var _this$_owner;
    var workerTarget = (_this$_owner = this._owner) == null ? void 0 : _this$_owner.getTarget();
    return workerTarget !== null && workerTarget !== void 0 ? workerTarget : this.target;
  };
  _proto.getTag = function getTag() {
    return this.tag;
  };
  _proto.setTag = function setTag(tag) {
    this.tag = tag;
  };
  _proto.setId = function setId(id) {
    this._id = id;
  };
  _proto.getId = function getId() {
    return this._id;
  };
  _proto.setPaused = function setPaused(paused) {
    this._paused = paused;
  };
  return Action;
}();
var FiniteTimeAction = function (_Action2) {
  function FiniteTimeAction() {
    var _this;
    _this = _Action2.call(this) || this;
    _this._duration = 0;
    return _this;
  }
  _inheritsLoose(FiniteTimeAction, _Action2);
  var _proto2 = FiniteTimeAction.prototype;
  _proto2.getDurationScaled = function getDurationScaled() {
    return this._duration;
  };
  _proto2.getDuration = function getDuration() {
    return this._duration;
  };
  _proto2.setDuration = function setDuration(duration) {
    this._duration = duration;
  };
  return FiniteTimeAction;
}(Action);

var HashElement = function HashElement() {
  this.actions = [];
  this.target = null;
  this.actionIndex = 0;
  this.currentAction = null;
  this.paused = false;
  this.lock = false;
};
var ActionManager = function () {
  function ActionManager() {
    this._hashTargets = new Map();
    this._arrayTargets = [];
    this._currentTarget = void 0;
    this._elementPool = [];
  }
  var _proto = ActionManager.prototype;
  _proto._getElement = function _getElement(target, paused) {
    var element = this._elementPool.pop();
    if (!element) {
      element = new HashElement();
    }
    element.target = target;
    element.paused = !!paused;
    return element;
  };
  _proto._putElement = function _putElement(element) {
    element.actions.length = 0;
    element.actionIndex = 0;
    element.currentAction = null;
    element.paused = false;
    element.target = null;
    element.lock = false;
    this._elementPool.push(element);
  };
  _proto._onNodeActiveChanged = function _onNodeActiveChanged(target, active) {
    if (active) {
      this.resumeTarget(target);
    } else {
      this.pauseTarget(target);
    }
  };
  _proto._onNodeDestroy = function _onNodeDestroy(target) {
    this._removeAllActionsFromTarget(target, false);
  };
  _proto._registerNodeEvent = function _registerNodeEvent(target) {
    if (target.isValid) {
      target.on(NodeEventType.ACTIVE_CHANGED, this._onNodeActiveChanged, this);
      target.on(NodeEventType.NODE_DESTROYED, this._onNodeDestroy, this);
    }
  };
  _proto._unregisterNodeEvent = function _unregisterNodeEvent(target) {
    if (target.isValid) {
      target.off(NodeEventType.ACTIVE_CHANGED, this._onNodeActiveChanged, this);
      target.off(NodeEventType.NODE_DESTROYED, this._onNodeDestroy, this);
    }
  };
  _proto.addAction = function addAction(action, target, paused, isBindNodeState) {
    if (isBindNodeState === void 0) {
      isBindNodeState = true;
    }
    if (!action || !target) {
      errorID(1000);
      return;
    }
    var element = this._hashTargets.get(target);
    if (!element) {
      element = this._getElement(target, paused);
      this._hashTargets.set(target, element);
      this._arrayTargets.push(element);
    } else if (!element.actions) {
      element.actions = [];
    }
    var registerNodeEvent = isBindNodeState && element.actions.length === 0 && target instanceof Node;
    if (registerNodeEvent) {
      this._registerNodeEvent(target);
      if (!target.active) {
        element.paused = true;
      }
    }
    element.target = target;
    element.actions.push(action);
    action.startWithTarget(target);
  };
  _proto.removeAllActions = function removeAllActions() {
    var locTargets = this._arrayTargets;
    for (var i = 0; i < locTargets.length; i++) {
      var element = locTargets[i];
      if (element) {
        if (element.target instanceof Node) {
          this._unregisterNodeEvent(element.target);
        }
        this._putElement(element);
      }
    }
    this._arrayTargets.length = 0;
    this._hashTargets = new Map();
  };
  _proto.removeAllActionsFromTarget = function removeAllActionsFromTarget(target) {
    this._removeAllActionsFromTarget(target, true);
  };
  _proto._removeAllActionsFromTarget = function _removeAllActionsFromTarget(target, offNodeEvent) {
    if (target == null) return;
    var element = this._hashTargets.get(target);
    if (element) {
      if (offNodeEvent && target instanceof Node) {
        this._unregisterNodeEvent(target);
      }
      element.actions.length = 0;
      this._deleteHashElement(element);
    }
  };
  _proto.removeAction = function removeAction(action) {
    if (action == null) return;
    var target = action.getOriginalTarget();
    var element = this._hashTargets.get(target);
    if (element) {
      for (var i = 0; i < element.actions.length; i++) {
        if (element.actions[i] === action) {
          element.actions.splice(i, 1);
          if (element.actionIndex >= i) element.actionIndex--;
          break;
        }
      }
    }
  };
  _proto._removeActionByTag = function _removeActionByTag(tag, element, target) {
    for (var i = 0, l = element.actions.length; i < l; ++i) {
      var action = element.actions[i];
      if (action && action.getTag() === tag) {
        if (target && action.getOriginalTarget() !== target) {
          continue;
        }
        this._removeActionAtIndex(i, element);
        break;
      }
    }
  };
  _proto._removeAllActionsByTag = function _removeAllActionsByTag(tag, element, target) {
    for (var i = element.actions.length - 1; i >= 0; --i) {
      var action = element.actions[i];
      if (action && action.getTag() === tag) {
        if (target && action.getOriginalTarget() !== target) {
          continue;
        }
        this._removeActionAtIndex(i, element);
      }
    }
  };
  _proto.removeActionByTag = function removeActionByTag(tag, target) {
    var _this = this;
    if (tag === ActionEnum.TAG_INVALID) logID(1002);
    var hashTargets = this._hashTargets;
    if (target) {
      var element = hashTargets.get(target);
      if (element) {
        this._removeActionByTag(tag, element, target);
      }
    } else {
      hashTargets.forEach(function (element) {
        _this._removeActionByTag(tag, element);
      });
    }
  };
  _proto.removeAllActionsByTag = function removeAllActionsByTag(tag, target) {
    var _this2 = this;
    if (tag === ActionEnum.TAG_INVALID) logID(1002);
    var hashTargets = this._hashTargets;
    if (target) {
      var element = hashTargets.get(target);
      if (element) {
        this._removeAllActionsByTag(tag, element, target);
      }
    } else {
      hashTargets.forEach(function (element) {
        _this2._removeAllActionsByTag(tag, element);
      });
    }
  };
  _proto.getActionByTag = function getActionByTag(tag, target) {
    if (tag === ActionEnum.TAG_INVALID) logID(1004);
    var element = this._hashTargets.get(target);
    if (element) {
      if (element.actions != null) {
        for (var i = 0; i < element.actions.length; ++i) {
          var action = element.actions[i];
          if (action && action.getTag() === tag) {
            return action;
          }
        }
      }
      logID(1005, tag);
    }
    return null;
  };
  _proto.getNumberOfRunningActionsInTarget = function getNumberOfRunningActionsInTarget(target) {
    var element = this._hashTargets.get(target);
    if (element) {
      return element.actions ? element.actions.length : 0;
    }
    return 0;
  };
  _proto.pauseTarget = function pauseTarget(target) {
    var element = this._hashTargets.get(target);
    if (element) element.paused = true;
  };
  _proto.resumeTarget = function resumeTarget(target) {
    var element = this._hashTargets.get(target);
    if (element) element.paused = false;
  };
  _proto.pauseAllRunningActions = function pauseAllRunningActions() {
    var idsWithActions = [];
    var locTargets = this._arrayTargets;
    for (var i = 0; i < locTargets.length; i++) {
      var element = locTargets[i];
      if (element && !element.paused) {
        element.paused = true;
        if (element.target) {
          idsWithActions.push(element.target);
        }
      }
    }
    return idsWithActions;
  };
  _proto.resumeTargets = function resumeTargets(targetsToResume) {
    if (!targetsToResume) return;
    for (var i = 0; i < targetsToResume.length; i++) {
      if (targetsToResume[i]) this.resumeTarget(targetsToResume[i]);
    }
  };
  _proto.pauseTargets = function pauseTargets(targetsToPause) {
    if (!targetsToPause) return;
    for (var i = 0; i < targetsToPause.length; i++) {
      if (targetsToPause[i]) this.pauseTarget(targetsToPause[i]);
    }
  };
  _proto.isActionRunning = function isActionRunning(action) {
    var elements = this._hashTargets.get(action.getOriginalTarget());
    var index = -1;
    if (elements) index = elements.actions.indexOf(action);
    return index !== -1;
  };
  _proto._removeActionAtIndex = function _removeActionAtIndex(index, element) {
    element.actions.splice(index, 1);
    if (element.actionIndex >= index) element.actionIndex--;
    if (element.actions.length === 0) {
      if (element.target instanceof Node) {
        this._unregisterNodeEvent(element.target);
      }
      this._deleteHashElement(element);
    }
  };
  _proto._deleteHashElement = function _deleteHashElement(element) {
    var ret = false;
    if (element && !element.lock) {
      if (this._hashTargets.get(element.target)) {
        this._hashTargets["delete"](element.target);
        var targets = this._arrayTargets;
        for (var i = 0, l = targets.length; i < l; i++) {
          if (targets[i] === element) {
            targets.splice(i, 1);
            break;
          }
        }
        this._putElement(element);
        ret = true;
      }
    }
    return ret;
  };
  _proto.update = function update(dt) {
    var locTargets = this._arrayTargets;
    var locCurrTarget;
    for (var elt = 0; elt < locTargets.length; elt++) {
      this._currentTarget = locTargets[elt];
      locCurrTarget = this._currentTarget;
      var target = locCurrTarget.target;
      if (isCCObject(target) && !target.isValid) {
        this.removeAllActionsFromTarget(target);
        elt--;
        continue;
      }
      if (!locCurrTarget.paused && locCurrTarget.actions) {
        locCurrTarget.lock = true;
        for (locCurrTarget.actionIndex = 0; locCurrTarget.actionIndex < locCurrTarget.actions.length; locCurrTarget.actionIndex++) {
          locCurrTarget.currentAction = locCurrTarget.actions[locCurrTarget.actionIndex];
          if (!locCurrTarget.currentAction) continue;
          locCurrTarget.currentAction.step(dt);
          if (locCurrTarget.currentAction && locCurrTarget.currentAction.isDone()) {
            locCurrTarget.currentAction.stop();
            var action = locCurrTarget.currentAction;
            locCurrTarget.currentAction = null;
            this.removeAction(action);
          }
          locCurrTarget.currentAction = null;
        }
        locCurrTarget.lock = false;
      }
      if (locCurrTarget.actions.length === 0) {
        if (target instanceof Node) {
          this._unregisterNodeEvent(target);
        }
        if (this._deleteHashElement(locCurrTarget)) {
          elt--;
        }
      }
    }
  };
  return ActionManager;
}();

var TweenSystem = function (_System) {
  function TweenSystem() {
    var _this;
    _this = _System.call(this) || this;
    _this.actionMgr = new ActionManager();
    return _this;
  }
  _inheritsLoose(TweenSystem, _System);
  var _proto = TweenSystem.prototype;
  _proto.update = function update(dt) {
    {
      this.actionMgr.update(dt);
    }
  };
  return _createClass(TweenSystem, [{
    key: "ActionManager",
    get: function get() {
      return this.actionMgr;
    }
  }]);
}(System);
TweenSystem.ID = 'TWEEN';
TweenSystem.instance = void 0;
director.on(DirectorEvent.INIT, function () {
  var sys = new TweenSystem();
  TweenSystem.instance = sys;
  director.registerSystem(TweenSystem.ID, sys, SystemPriority.MEDIUM);
});

var ActionInstant = function (_FiniteTimeAction) {
  function ActionInstant() {
    return _FiniteTimeAction.apply(this, arguments) || this;
  }
  _inheritsLoose(ActionInstant, _FiniteTimeAction);
  var _proto = ActionInstant.prototype;
  _proto.isDone = function isDone() {
    return true;
  };
  _proto.step = function step(_dt) {
    this.update(1);
  };
  _proto.update = function update(_dt) {};
  _proto.reverse = function reverse() {
    return this.clone();
  };
  _proto.isUnknownDuration = function isUnknownDuration() {
    return false;
  };
  return ActionInstant;
}(FiniteTimeAction);
var Show = function (_ActionInstant) {
  function Show() {
    return _ActionInstant.apply(this, arguments) || this;
  }
  _inheritsLoose(Show, _ActionInstant);
  var _proto2 = Show.prototype;
  _proto2.update = function update(_dt) {
    var target = this._getWorkerTarget();
    if (!target) return;
    var _renderComps = target.getComponentsInChildren(Renderer);
    for (var i = 0; i < _renderComps.length; ++i) {
      var render = _renderComps[i];
      render.enabled = true;
    }
  };
  _proto2.reverse = function reverse() {
    return new Hide();
  };
  _proto2.clone = function clone() {
    var action = new Show();
    action._id = this._id;
    return action;
  };
  _proto2.toString = function toString() {
    return '<Show>';
  };
  return Show;
}(ActionInstant);
function show() {
  return new Show();
}
var Hide = function (_ActionInstant2) {
  function Hide() {
    return _ActionInstant2.apply(this, arguments) || this;
  }
  _inheritsLoose(Hide, _ActionInstant2);
  var _proto3 = Hide.prototype;
  _proto3.update = function update(_dt) {
    var target = this._getWorkerTarget();
    if (!target) return;
    var _renderComps = target.getComponentsInChildren(Renderer);
    for (var i = 0; i < _renderComps.length; ++i) {
      var render = _renderComps[i];
      render.enabled = false;
    }
  };
  _proto3.reverse = function reverse() {
    return new Show();
  };
  _proto3.clone = function clone() {
    var action = new Hide();
    action._id = this._id;
    return action;
  };
  _proto3.toString = function toString() {
    return '<Hide>';
  };
  return Hide;
}(ActionInstant);
function hide() {
  return new Hide();
}
(function (_ActionInstant3) {
  function ToggleVisibility() {
    return _ActionInstant3.apply(this, arguments) || this;
  }
  _inheritsLoose(ToggleVisibility, _ActionInstant3);
  var _proto4 = ToggleVisibility.prototype;
  _proto4.update = function update(_dt) {
    var target = this._getWorkerTarget();
    if (!target) return;
    var _renderComps = target.getComponentsInChildren(Renderer);
    for (var i = 0; i < _renderComps.length; ++i) {
      var render = _renderComps[i];
      render.enabled = !render.enabled;
    }
  };
  _proto4.reverse = function reverse() {
    return new ToggleVisibility();
  };
  _proto4.clone = function clone() {
    var action = new ToggleVisibility();
    action._id = this._id;
    return action;
  };
  _proto4.toString = function toString() {
    return '<ToggleVisibility>';
  };
  return ToggleVisibility;
})(ActionInstant);
var RemoveSelf = function (_ActionInstant4) {
  function RemoveSelf(isNeedCleanUp) {
    var _this;
    _this = _ActionInstant4.call(this) || this;
    _this._isNeedCleanUp = true;
    if (isNeedCleanUp !== undefined) _this.init(isNeedCleanUp);
    return _this;
  }
  _inheritsLoose(RemoveSelf, _ActionInstant4);
  var _proto5 = RemoveSelf.prototype;
  _proto5.update = function update(_dt) {
    var target = this._getWorkerTarget();
    if (!target) return;
    target.removeFromParent();
    if (this._isNeedCleanUp) {
      target.destroy();
    }
  };
  _proto5.init = function init(isNeedCleanUp) {
    this._isNeedCleanUp = isNeedCleanUp;
    return true;
  };
  _proto5.reverse = function reverse() {
    return new RemoveSelf(this._isNeedCleanUp);
  };
  _proto5.clone = function clone() {
    var action = new RemoveSelf(this._isNeedCleanUp);
    action._id = this._id;
    return action;
  };
  _proto5.toString = function toString() {
    return '<RemoveSelf>';
  };
  return RemoveSelf;
}(ActionInstant);
function removeSelf(isNeedCleanUp) {
  return new RemoveSelf(isNeedCleanUp);
}
var CallFunc = function (_ActionInstant5) {
  function CallFunc(selector, callbackThis, data) {
    var _this2;
    _this2 = _ActionInstant5.call(this) || this;
    _this2._callbackThis = undefined;
    _this2._callback = undefined;
    _this2._data = undefined;
    _this2.initWithFunction(selector, callbackThis, data);
    return _this2;
  }
  _inheritsLoose(CallFunc, _ActionInstant5);
  var _proto6 = CallFunc.prototype;
  _proto6.initWithFunction = function initWithFunction(callback, callbackThis, data) {
    if (callback) {
      this._callback = callback;
    }
    if (callbackThis) {
      this._callbackThis = callbackThis;
    }
    if (data !== undefined) {
      this._data = data;
    }
    return true;
  };
  _proto6.execute = function execute() {
    if (this._callback) {
      var _target = this._getWorkerTarget();
      this._callback.call(this._callbackThis, _target, this._data);
    }
  };
  _proto6.update = function update(_dt) {
    this.execute();
  };
  _proto6.getTargetCallback = function getTargetCallback() {
    return this._callbackThis;
  };
  _proto6.setTargetCallback = function setTargetCallback(sel) {
    if (sel !== this._callbackThis) {
      this._callbackThis = sel;
    }
  };
  _proto6.clone = function clone() {
    var action = new CallFunc();
    action._id = this._id;
    if (this._callback) action.initWithFunction(this._callback, this._callbackThis, this._data);
    return action;
  };
  _proto6.toString = function toString() {
    return "<CallFunc>";
  };
  return CallFunc;
}(ActionInstant);
function callFunc(selector, selectorTarget, data) {
  return new CallFunc(selector, selectorTarget, data);
}

var DummyAction = function (_FiniteTimeAction) {
  function DummyAction() {
    return _FiniteTimeAction.apply(this, arguments) || this;
  }
  _inheritsLoose(DummyAction, _FiniteTimeAction);
  var _proto = DummyAction.prototype;
  _proto.clone = function clone() {
    return new DummyAction();
  };
  _proto.reverse = function reverse() {
    return this.clone();
  };
  _proto.update = function update(time) {};
  _proto.step = function step(dt) {};
  _proto.isUnknownDuration = function isUnknownDuration() {
    return false;
  };
  _proto.toString = function toString() {
    return "DummyAction";
  };
  return DummyAction;
}(FiniteTimeAction);
var ActionInterval = function (_FiniteTimeAction2) {
  function ActionInterval(d) {
    var _this;
    _this = _FiniteTimeAction2.call(this) || this;
    _this.MAX_VALUE = 2;
    _this._elapsed = 0;
    _this._startTime = 0;
    _this._firstTick = false;
    _this._speed = 1;
    if (d !== undefined && !Number.isNaN(d)) {
      _this.initWithDuration(d);
    }
    return _this;
  }
  _inheritsLoose(ActionInterval, _FiniteTimeAction2);
  var _proto2 = ActionInterval.prototype;
  _proto2.setStartTime = function setStartTime(time) {
    time = time < 0 ? 0 : time > this._duration ? this._duration : time;
    this._startTime = time;
  };
  _proto2.getElapsed = function getElapsed() {
    return this._elapsed;
  };
  _proto2.initWithDuration = function initWithDuration(d) {
    this._duration = d === 0 ? macro.FLT_EPSILON : d;
    this._elapsed = 0;
    this._firstTick = true;
    return true;
  };
  _proto2.isDone = function isDone() {
    return this._elapsed >= this._duration && !this.isUnknownDuration();
  };
  _proto2._cloneDecoration = function _cloneDecoration(action) {
    action._speed = this._speed;
  };
  _proto2.step = function step(dt) {
    if (this._paused || this._speed === 0) return;
    dt *= this._speed;
    if (this._firstTick) {
      this._elapsed = this._startTime;
    } else this._elapsed += dt;
    var t = this._elapsed / (this._duration > 0.0000001192092896 ? this._duration : 0.0000001192092896);
    t = t < 1 ? t : 1;
    this.update(t > 0 ? t : 0);
    if (this.isUnknownDuration() && !this._firstTick) {
      if (t < 1) {
        this._elapsed -= dt;
      } else {
        this._elapsed = this._startTime + this._duration;
      }
    }
    if (this._firstTick) {
      this._firstTick = false;
      if (this._startTime > 0) {
        this._startTime = 0;
      }
    }
  };
  _proto2.startWithTarget = function startWithTarget(target) {
    _FiniteTimeAction2.prototype.startWithTarget.call(this, target);
    this._elapsed = 0;
    this._firstTick = true;
  };
  _proto2.getSpeed = function getSpeed() {
    return this._speed;
  };
  _proto2.setSpeed = function setSpeed(speed) {
    this._speed = speed;
  };
  _proto2.getDurationScaled = function getDurationScaled() {
    return this._duration / this._speed;
  };
  return ActionInterval;
}(FiniteTimeAction);
function sequenceActionWithOneTwo(actionOne, actionTwo) {
  var sequence = new Sequence();
  sequence.initWithTwoActions(actionOne, actionTwo);
  return sequence;
}
var Sequence = function (_ActionInterval2) {
  function Sequence(actions) {
    var _this2;
    _this2 = _ActionInterval2.call(this) || this;
    _this2._actions = [];
    _this2._split = 0;
    _this2._last = 0;
    _this2._reversed = false;
    if (!actions || actions.length === 0) {
      return _assertThisInitialized(_this2);
    }
    if (actions.length === 1) {
      actions.push(new DummyAction());
    }
    var last = actions.length - 1;
    if (last >= 0 && actions[last] == null) logID(1015);
    if (last >= 0) {
      var prev = actions[0];
      var action1;
      for (var i = 1; i < last; i++) {
        if (actions[i]) {
          action1 = prev;
          prev = sequenceActionWithOneTwo(action1, actions[i]);
        }
      }
      _this2.initWithTwoActions(prev, actions[last]);
    }
    return _this2;
  }
  _inheritsLoose(Sequence, _ActionInterval2);
  var _proto3 = Sequence.prototype;
  _proto3.initWithTwoActions = function initWithTwoActions(actionOne, actionTwo) {
    if (!actionOne || !actionTwo) {
      errorID(1025);
      return false;
    }
    var durationOne = actionOne.getDurationScaled();
    var durationTwo = actionTwo.getDurationScaled();
    var d = durationOne + durationTwo;
    this.initWithDuration(d);
    this._actions[0] = actionOne;
    this._actions[1] = actionTwo;
    return true;
  };
  _proto3.clone = function clone() {
    var action = new Sequence();
    action._id = this._id;
    action._speed = this._speed;
    this._cloneDecoration(action);
    action.initWithTwoActions(this._actions[0].clone(), this._actions[1].clone());
    return action;
  };
  _proto3.startWithTarget = function startWithTarget(target) {
    _ActionInterval2.prototype.startWithTarget.call(this, target);
    if (this._actions.length === 0) {
      return;
    }
    this._split = this._actions[0].getDurationScaled() / this._duration;
    this._last = -1;
  };
  _proto3.stop = function stop() {
    if (this._actions.length === 0) {
      return;
    }
    if (this._last !== -1) this._actions[this._last].stop();
    _ActionInterval2.prototype.stop.call(this);
  };
  _proto3.update = function update(t) {
    var locActions = this._actions;
    if (locActions.length === 0) {
      return;
    }
    var new_t = 0;
    var found = 0;
    var locSplit = this._split;
    var locLast = this._last;
    if (t < locSplit) {
      new_t = locSplit !== 0 ? t / locSplit : 1;
      if (found === 0 && locLast === 1 && this._reversed) {
        var two = locActions[1];
        two.update(0);
        if (two.isUnknownDuration()) return;
        two.stop();
      }
    } else {
      var one = locActions[0];
      found = 1;
      new_t = locSplit === 1 ? 1 : (t - locSplit) / (1 - locSplit);
      if (locLast === -1) {
        one.startWithTarget(this.target);
        one.update(1);
        if (one.isUnknownDuration()) return;
        one.stop();
      }
      if (locLast === 0) {
        one.update(1);
        if (one.isUnknownDuration()) return;
        one.stop();
      }
    }
    var actionFound = locActions[found];
    if (locLast === found && actionFound.isDone()) return;
    if (locLast !== found) actionFound.startWithTarget(this.target);
    actionFound.update(new_t > 1 ? new_t % 1 : new_t);
    this._last = found;
  };
  _proto3.reverse = function reverse() {
    var action = sequenceActionWithOneTwo(this._actions[1].reverse(), this._actions[0].reverse());
    this._cloneDecoration(action);
    action._reversed = true;
    return action;
  };
  _proto3.updateOwner = function updateOwner(owner) {
    if (this._actions.length < 2) {
      return;
    }
    var actionOne = this._actions[0];
    var actionTwo = this._actions[1];
    if (!actionTwo._owner) {
      actionTwo._owner = owner;
    }
    if (actionOne instanceof Sequence || actionOne instanceof Spawn) {
      actionOne.updateOwner(owner);
    } else if (!actionOne._owner) {
      actionOne._owner = owner;
    }
  };
  _proto3.findAction = function findAction(id) {
    for (var i = 0, len = this._actions.length; i < len; ++i) {
      var action = this._actions[i];
      if (action.getId() === id) {
        return action;
      }
      if (action instanceof Sequence || action instanceof Spawn) {
        action = action.findAction(id);
        if (action && action.getId() === id) {
          return action;
        }
      }
    }
    return null;
  };
  _proto3.isUnknownDuration = function isUnknownDuration() {
    if (this._actions.length === 0) return false;
    var one = this._actions[0];
    var two = this._actions[1];
    if (this._last < 1) {
      return one.isUnknownDuration();
    }
    return two.isUnknownDuration();
  };
  _proto3.toString = function toString() {
    return "<Sequence>";
  };
  return Sequence;
}(ActionInterval);
function sequence(actions) {
  return new Sequence(actions);
}
var Repeat = function (_ActionInterval3) {
  function Repeat(action, times) {
    var _this3;
    _this3 = _ActionInterval3.call(this) || this;
    _this3._times = 0;
    _this3._total = 0;
    _this3._nextDt = 0;
    _this3._actionInstant = false;
    _this3._innerAction = null;
    _this3.initWithAction(action, times);
    return _this3;
  }
  _inheritsLoose(Repeat, _ActionInterval3);
  var _proto4 = Repeat.prototype;
  _proto4.initWithAction = function initWithAction(action, times) {
    if (!action || times === undefined) {
      return false;
    }
    var duration = action.getDurationScaled() * times;
    if (this.initWithDuration(duration)) {
      this._times = times;
      this._innerAction = action;
      if (action instanceof ActionInstant) {
        this._actionInstant = true;
        this._times -= 1;
      }
      this._total = 0;
      return true;
    }
    return false;
  };
  _proto4.clone = function clone() {
    var action = new Repeat();
    action._id = this._id;
    action._speed = this._speed;
    this._cloneDecoration(action);
    if (this._innerAction) {
      action.initWithAction(this._innerAction.clone(), this._times);
    }
    return action;
  };
  _proto4.startWithTarget = function startWithTarget(target) {
    this._total = 0;
    this._nextDt = (this._innerAction ? this._innerAction.getDurationScaled() : 0) / this._duration;
    _ActionInterval3.prototype.startWithTarget.call(this, target);
    if (this._innerAction) this._innerAction.startWithTarget(target);
  };
  _proto4.stop = function stop() {
    if (this._innerAction) this._innerAction.stop();
    _ActionInterval3.prototype.stop.call(this);
  };
  _proto4.update = function update(dt) {
    var locInnerAction = this._innerAction;
    var locDuration = this._duration;
    var locTimes = this._times;
    var locNextDt = this._nextDt;
    if (!locInnerAction) {
      return;
    }
    if (dt >= locNextDt) {
      while (dt > locNextDt && this._total < locTimes) {
        locInnerAction.update(1);
        if (locInnerAction.isUnknownDuration()) return;
        this._total++;
        locInnerAction.stop();
        locInnerAction.startWithTarget(this.target);
        locNextDt += locInnerAction.getDurationScaled() / locDuration;
        this._nextDt = locNextDt > 1 ? 1 : locNextDt;
      }
      if (dt >= 1.0 && this._total < locTimes) {
        locInnerAction.update(1);
        if (locInnerAction.isUnknownDuration()) return;
        this._total++;
      }
      if (!this._actionInstant) {
        if (this._total === locTimes) {
          locInnerAction.stop();
        } else {
          locInnerAction.update(dt - (locNextDt - locInnerAction.getDurationScaled() / locDuration));
        }
      }
    } else {
      locInnerAction.update(dt * locTimes % 1.0);
    }
  };
  _proto4.isDone = function isDone() {
    return this._total === this._times;
  };
  _proto4.reverse = function reverse() {
    var actionArg = this._innerAction ? this._innerAction.reverse() : undefined;
    var action = new Repeat(actionArg, this._times);
    this._cloneDecoration(action);
    return action;
  };
  _proto4.setInnerAction = function setInnerAction(action) {
    if (this._innerAction !== action) {
      this._innerAction = action;
    }
  };
  _proto4.getInnerAction = function getInnerAction() {
    return this._innerAction;
  };
  _proto4.isUnknownDuration = function isUnknownDuration() {
    if (this._innerAction) {
      return this._innerAction.isUnknownDuration();
    }
    return false;
  };
  _proto4.toString = function toString() {
    return "<Repeat>";
  };
  return Repeat;
}(ActionInterval);
function repeat(action, times) {
  return new Repeat(action, times);
}
var RepeatForever = function (_ActionInterval4) {
  function RepeatForever(action) {
    var _this4;
    _this4 = _ActionInterval4.call(this) || this;
    _this4._innerAction = null;
    if (action) _this4.initWithAction(action);
    return _this4;
  }
  _inheritsLoose(RepeatForever, _ActionInterval4);
  var _proto5 = RepeatForever.prototype;
  _proto5.initWithAction = function initWithAction(action) {
    if (!action) {
      errorID(1026);
      return false;
    }
    this._innerAction = action;
    this._duration = Infinity;
    return true;
  };
  _proto5.clone = function clone() {
    var action = new RepeatForever();
    action._id = this._id;
    action._speed = this._speed;
    this._cloneDecoration(action);
    if (this._innerAction) {
      action.initWithAction(this._innerAction.clone());
    }
    return action;
  };
  _proto5.startWithTarget = function startWithTarget(target) {
    _ActionInterval4.prototype.startWithTarget.call(this, target);
    if (this._innerAction) {
      this._innerAction.startWithTarget(target);
    }
  };
  _proto5.stop = function stop() {
    if (this._innerAction) this._innerAction.stop();
    _ActionInterval4.prototype.stop.call(this);
  };
  _proto5.step = function step(dt) {
    if (this._paused || this._speed === 0) return;
    var locInnerAction = this._innerAction;
    if (!locInnerAction) {
      return;
    }
    dt *= this._speed;
    locInnerAction.step(dt);
    if (locInnerAction.isDone()) {
      locInnerAction.startWithTarget(this.target);
      locInnerAction.step(locInnerAction.getElapsed() - locInnerAction.getDurationScaled());
    }
  };
  _proto5.update = function update(_t) {
    logID(1007);
  };
  _proto5.isDone = function isDone() {
    return false;
  };
  _proto5.reverse = function reverse() {
    if (this._innerAction) {
      var action = new RepeatForever(this._innerAction.reverse());
      this._cloneDecoration(action);
      return action;
    }
    return this;
  };
  _proto5.setInnerAction = function setInnerAction(action) {
    if (this._innerAction !== action) {
      this._innerAction = action;
    }
  };
  _proto5.getInnerAction = function getInnerAction() {
    return this._innerAction;
  };
  _proto5.isUnknownDuration = function isUnknownDuration() {
    if (this._innerAction) {
      return this._innerAction.isUnknownDuration();
    }
    return false;
  };
  _proto5.toString = function toString() {
    return "<RepeatForever>";
  };
  return RepeatForever;
}(ActionInterval);
function repeatForever(action) {
  return new RepeatForever(action);
}
function spawnActionWithOneTwo(action1, action2) {
  var spawn = new Spawn();
  spawn.initWithTwoActions(action1, action2);
  return spawn;
}
var Spawn = function (_ActionInterval5) {
  function Spawn(actions) {
    var _this5;
    _this5 = _ActionInterval5.call(this) || this;
    _this5._one = null;
    _this5._two = null;
    _this5._finished = false;
    if (!actions || actions.length === 0) {
      return _assertThisInitialized(_this5);
    }
    if (actions.length === 1) {
      actions.push(new DummyAction());
    }
    var last = actions.length - 1;
    if (last >= 0 && actions[last] == null) logID(1015);
    if (last >= 0) {
      var prev = actions[0];
      var action1;
      for (var i = 1; i < last; i++) {
        if (actions[i]) {
          action1 = prev;
          prev = spawnActionWithOneTwo(action1, actions[i]);
        }
      }
      _this5.initWithTwoActions(prev, actions[last]);
    }
    return _this5;
  }
  _inheritsLoose(Spawn, _ActionInterval5);
  var _proto6 = Spawn.prototype;
  _proto6.initWithTwoActions = function initWithTwoActions(action1, action2) {
    if (!action1 || !action2) {
      errorID(1027);
      return false;
    }
    var ret = false;
    var d1 = action1.getDurationScaled();
    var d2 = action2.getDurationScaled();
    if (this.initWithDuration(Math.max(d1, d2))) {
      this._one = action1;
      this._two = action2;
      if (d1 > d2) {
        this._two = sequenceActionWithOneTwo(action2, delayTime(d1 - d2));
      } else if (d1 < d2) {
        this._one = sequenceActionWithOneTwo(action1, delayTime(d2 - d1));
      }
      ret = true;
    }
    return ret;
  };
  _proto6.clone = function clone() {
    var action = new Spawn();
    action._id = this._id;
    action._speed = this._speed;
    this._cloneDecoration(action);
    if (this._one && this._two) {
      action.initWithTwoActions(this._one.clone(), this._two.clone());
    }
    return action;
  };
  _proto6.startWithTarget = function startWithTarget(target) {
    _ActionInterval5.prototype.startWithTarget.call(this, target);
    if (this._one) this._one.startWithTarget(target);
    if (this._two) this._two.startWithTarget(target);
  };
  _proto6.stop = function stop() {
    if (this._one) this._one.stop();
    if (this._two) this._two.stop();
    _ActionInterval5.prototype.stop.call(this);
  };
  _proto6.update = function update(t) {
    if (this._one) {
      if (!this._finished || this._one.isUnknownDuration()) {
        this._one.update(t);
      }
    }
    if (this._two) {
      if (!this._finished || this._two.isUnknownDuration()) {
        this._two.update(t);
      }
    }
    this._finished = t === 1;
  };
  _proto6.reverse = function reverse() {
    if (this._one && this._two) {
      var action = spawnActionWithOneTwo(this._one.reverse(), this._two.reverse());
      this._cloneDecoration(action);
      return action;
    }
    return this;
  };
  _proto6.updateOwner = function updateOwner(owner) {
    if (!this._one || !this._two) {
      return;
    }
    if (!this._two._owner) {
      this._two._owner = owner;
    }
    var one = this._one;
    if (one instanceof Spawn || one instanceof Sequence) {
      one.updateOwner(owner);
    } else if (!one._owner) {
      one._owner = owner;
    }
  };
  _proto6.findAction = function findAction(id) {
    var one = this._one;
    var two = this._two;
    var foundAction = null;
    var find = function find(action) {
      if (action.getId() === id) return action;
      if (action instanceof Sequence || action instanceof Spawn) {
        var found = action.findAction(id);
        if (found) return found;
      }
      return null;
    };
    if (one) {
      foundAction = find(one);
      if (foundAction) return foundAction;
    }
    if (two) {
      foundAction = find(two);
      if (foundAction) return foundAction;
    }
    return null;
  };
  _proto6.isUnknownDuration = function isUnknownDuration() {
    var one = this._one;
    var two = this._two;
    if (one == null || two == null) return false;
    var isOneUnknownTime = one.isUnknownDuration();
    var isTwoUnknownTime = two.isUnknownDuration();
    if (isOneUnknownTime || isTwoUnknownTime) {
      if (isOneUnknownTime && isTwoUnknownTime) return true;else if (this._finished) return true;
    }
    return false;
  };
  _proto6.toString = function toString() {
    return "<Spawn>";
  };
  return Spawn;
}(ActionInterval);
function spawn(actions) {
  return new Spawn(actions);
}
var DelayTime = function (_ActionInterval6) {
  function DelayTime() {
    return _ActionInterval6.apply(this, arguments) || this;
  }
  _inheritsLoose(DelayTime, _ActionInterval6);
  var _proto7 = DelayTime.prototype;
  _proto7.update = function update(_dt) {};
  _proto7.reverse = function reverse() {
    var action = new DelayTime(this._duration);
    this._cloneDecoration(action);
    return action;
  };
  _proto7.clone = function clone() {
    var action = new DelayTime();
    action._id = this._id;
    action._speed = this._speed;
    this._cloneDecoration(action);
    action.initWithDuration(this._duration);
    return action;
  };
  _proto7.isUnknownDuration = function isUnknownDuration() {
    return false;
  };
  _proto7.toString = function toString() {
    return "<DelayTime>";
  };
  return DelayTime;
}(ActionInterval);
function delayTime(d) {
  return new DelayTime(d);
}
var ReverseTime = function (_ActionInterval7) {
  function ReverseTime(action) {
    var _this6;
    _this6 = _ActionInterval7.call(this) || this;
    _this6._other = null;
    if (action) _this6.initWithAction(action);
    return _this6;
  }
  _inheritsLoose(ReverseTime, _ActionInterval7);
  var _proto8 = ReverseTime.prototype;
  _proto8.initWithAction = function initWithAction(action) {
    if (!action) {
      errorID(1028);
      return false;
    }
    if (action === this._other) {
      errorID(1029);
      return false;
    }
    if (_ActionInterval7.prototype.initWithDuration.call(this, action.getDurationScaled())) {
      this._other = action;
      return true;
    }
    return false;
  };
  _proto8.clone = function clone() {
    var action = new ReverseTime();
    action._id = this._id;
    action._speed = this._speed;
    this._cloneDecoration(action);
    if (this._other) {
      action.initWithAction(this._other.clone());
    }
    return action;
  };
  _proto8.startWithTarget = function startWithTarget(target) {
    _ActionInterval7.prototype.startWithTarget.call(this, target);
    if (this._other) this._other.startWithTarget(target);
  };
  _proto8.update = function update(dt) {
    if (this._other) this._other.update(1 - dt);
  };
  _proto8.reverse = function reverse() {
    if (this._other) {
      return this._other.clone();
    }
    return this;
  };
  _proto8.stop = function stop() {
    if (this._other) this._other.stop();
    _ActionInterval7.prototype.stop.call(this);
  };
  _proto8.isUnknownDuration = function isUnknownDuration() {
    return false;
  };
  _proto8.toString = function toString() {
    return "<ReverseTime>";
  };
  return ReverseTime;
}(ActionInterval);
function reverseTime(action) {
  return new ReverseTime(action);
}
var ActionCustomUpdate = function (_ActionInterval8) {
  function ActionCustomUpdate(duration, cb, args) {
    var _this7;
    _this7 = _ActionInterval8.call(this, duration) || this;
    _this7._cb = cb;
    _this7._args = args;
    return _this7;
  }
  _inheritsLoose(ActionCustomUpdate, _ActionInterval8);
  var _proto9 = ActionCustomUpdate.prototype;
  _proto9.clone = function clone() {
    return new ActionCustomUpdate(this._duration, this._cb, this._args);
  };
  _proto9.update = function update(ratio) {
    this._cb.apply(this, [this.target, ratio].concat(this._args));
  };
  _proto9.reverse = function reverse() {
    return this.clone();
  };
  _proto9.isUnknownDuration = function isUnknownDuration() {
    return false;
  };
  _proto9.toString = function toString() {
    return "<ActionCustomUpdate>";
  };
  return ActionCustomUpdate;
}(ActionInterval);

var ActionUnknownDuration = function (_FiniteTimeAction) {
  function ActionUnknownDuration(cb, args) {
    var _this;
    _this = _FiniteTimeAction.call(this) || this;
    _this._finished = false;
    _this._cb = cb;
    _this._args = args;
    return _this;
  }
  _inheritsLoose(ActionUnknownDuration, _FiniteTimeAction);
  var _proto = ActionUnknownDuration.prototype;
  _proto.clone = function clone() {
    return new ActionUnknownDuration(this._cb, this._args);
  };
  _proto.reverse = function reverse() {
    return this.clone();
  };
  _proto.step = function step(dt) {
    throw new Error('should never go here');
  };
  _proto.update = function update(t) {
    var dt = cclegacy.game.deltaTime;
    this._finished = this._cb.apply(this, [this.target, dt].concat(this._args));
  };
  _proto.isDone = function isDone() {
    return this._finished;
  };
  _proto.isUnknownDuration = function isUnknownDuration() {
    return !this.isDone();
  };
  _proto.toString = function toString() {
    return "<ActionUnknownDuration>";
  };
  return ActionUnknownDuration;
}(FiniteTimeAction);

function TweenEasingAdapter(easingName) {
  var initialChar = easingName.charAt(0);
  if (/[A-Z]/.test(initialChar)) {
    easingName = easingName.replace(initialChar, initialChar.toLowerCase());
    var arr = easingName.split('-');
    if (arr.length === 2) {
      var str0 = arr[0];
      if (str0 === 'linear') {
        easingName = 'linear';
      } else {
        var str1 = arr[1];
        switch (str0) {
          case 'quadratic':
            easingName = "quad" + str1;
            break;
          case 'quartic':
            easingName = "quart" + str1;
            break;
          case 'quintic':
            easingName = "quint" + str1;
            break;
          case 'sinusoidal':
            easingName = "sine" + str1;
            break;
          case 'exponential':
            easingName = "expo" + str1;
            break;
          case 'circular':
            easingName = "circ" + str1;
            break;
          default:
            easingName = str0 + str1;
            break;
        }
      }
    }
  }
  return easingName;
}
function TweenOptionChecker(opts) {
  var header = ' [Tween:] ';
  var message = " option is not support in v + " + engineVersion;
  var _opts = opts;
  if (_opts.delay) {
    warn(header + "delay" + message);
  }
  if (_opts.repeat) {
    warn(header + "repeat" + message);
  }
  if (_opts.repeatDelay) {
    warn(header + "repeatDelay" + message);
  }
  if (_opts.interpolation) {
    warn(header + "interpolation" + message);
  }
  if (_opts.onStop) {
    warn(header + "onStop" + message);
  }
}
var TweenAction = function (_ActionInterval) {
  function TweenAction(duration, props, opts) {
    var _this;
    _this = _ActionInterval.call(this) || this;
    _this._reversed = false;
    if (opts == null) {
      opts = Object.create(null);
    } else {
      TweenOptionChecker(opts);
      if (opts.easing && typeof opts.easing === 'string') {
        opts.easing = TweenEasingAdapter(opts.easing);
      }
      if (!opts.progress) {
        opts.progress = _this.progress;
      }
      if (opts.easing && typeof opts.easing === 'string') {
        var easingName = opts.easing;
        opts.easing = easing[easingName];
        if (!opts.easing) {
          warnID(1031, easingName);
        }
      }
    }
    _this._opts = opts;
    _this._props = Object.create(null);
    for (var name in props) {
      var _value$legacyProgress;
      if (!props.hasOwnProperty(name)) continue;
      var value = props[name];
      if (typeof value === 'function') {
        value = value();
      } else if (value == null) {
        continue;
      }
      var customEasing = void 0;
      var customProgress = void 0;
      var customValue = void 0;
      if (value.value !== undefined) {
        customValue = value.value;
        if (typeof customValue === 'function') {
          customValue = customValue();
        }
        if (value.easing !== undefined) {
          if (typeof value.easing === 'string') {
            customEasing = easing[value.easing];
            if (!customEasing) warnID(1031, value.easing);
          } else {
            customEasing = value.easing;
          }
        }
        if (value.progress !== undefined) {
          customProgress = value.progress;
        }
      } else {
        customValue = value;
      }
      var prop = Object.create(null);
      prop.start = prop.current = prop.end = null;
      prop.keys = null;
      prop.value = customValue;
      prop.easing = customEasing;
      prop.progress = customProgress;
      prop.convert = value.convert;
      prop.clone = value.clone;
      prop.add = value.add;
      prop.sub = value.sub;
      prop.legacyProgress = (_value$legacyProgress = value.legacyProgress) !== null && _value$legacyProgress !== void 0 ? _value$legacyProgress : true;
      prop.toFixed = value.toFixed;
      prop.onStart = value.onStart;
      prop.onStop = value.onStop;
      prop.onComplete = value.onComplete;
      prop.valid = true;
      _this._props[name] = prop;
    }
    _this._originProps = props;
    _this.initWithDuration(duration);
    return _this;
  }
  _inheritsLoose(TweenAction, _ActionInterval);
  var _proto = TweenAction.prototype;
  _proto.clone = function clone() {
    var action = new TweenAction(this._duration, this._originProps, this._opts);
    action._reversed = this._reversed;
    action._owner = this._owner;
    action._id = this._id;
    this._cloneDecoration(action);
    return action;
  };
  _proto.reverse = function reverse() {
    if (!this._opts.relative) {
      warnID(16382);
      return new TweenAction(0, {});
    }
    var action = new TweenAction(this._duration, this._originProps, this._opts);
    this._cloneDecoration(action);
    action._reversed = !this._reversed;
    action._owner = this._owner;
    return action;
  };
  _proto.startWithTarget = function startWithTarget(target) {
    _ActionInterval.prototype.startWithTarget.call(this, target);
    var workerTarget = this._getWorkerTarget();
    if (!workerTarget) return;
    var relative = !!this._opts.relative;
    var props = this._props;
    var reversed = this._reversed;
    var _loop = function _loop() {
        var _t = workerTarget[property];
        if (_t === undefined) {
          return 0;
        }
        var prop = props[property];
        var value = prop.value;
        if (typeof _t === 'number') {
          prop.start = _t;
          prop.current = _t;
          prop.end = relative ? reversed ? _t - value : _t + value : value;
        } else if (typeof _t === 'object') {
          if (prop.legacyProgress) {
            if (prop.start == null) {
              var Ctor = _t.constructor;
              prop.start = new Ctor();
              prop.current = new Ctor();
              prop.end = new Ctor();
            }
            var propertyKeys;
            if (value.getModifiableProperties) {
              propertyKeys = value.getModifiableProperties();
            } else {
              propertyKeys = Object.keys(value);
            }
            prop.keys = propertyKeys;
            for (var i = 0, len = propertyKeys.length; i < len; ++i) {
              var k = propertyKeys[i];
              if (isNaN(_t[k])) continue;
              prop.start[k] = _t[k];
              prop.current[k] = _t[k];
              prop.end[k] = relative ? reversed ? _t[k] - value[k] : _t[k] + value[k] : value[k];
            }
          } else {
            var clone = prop.clone;
            if (!clone) {
              warnID(16383, property);
              prop.valid = false;
              return 0;
            } else {
              var add = prop.add;
              var sub = prop.sub;
              if (relative) {
                if (!add) {
                  warnID(16384, property);
                  prop.valid = false;
                }
                if (reversed && !sub) {
                  warnID(16385, property);
                  prop.valid = false;
                }
                if (!prop.valid) return 0;
              }
              prop.start = clone(_t);
              prop.current = clone(_t);
              prop.end = relative ? reversed ? sub(_t, value) : add(_t, value) : clone(value);
            }
          }
        } else if (typeof _t === 'string') {
          var convertFn = prop.convert;
          var convertToNumber = function convertToNumber(v) {
            if (typeof v === 'number') return v;
            var convertedValue = v;
            if (convertFn) {
              convertedValue = convertFn(v);
            }
            if (typeof convertedValue !== 'number') {
              convertedValue = Number(convertedValue);
              if (Number.isNaN(convertedValue)) {
                warnID(16386, "" + v);
                return null;
              }
            }
            return convertedValue;
          };
          var targetNumValue = convertToNumber(value);
          var startNumValue = convertToNumber(_t);
          if (targetNumValue == null || startNumValue == null) {
            prop.valid = false;
            return 0;
          }
          prop.start = startNumValue;
          prop.current = _t;
          prop.end = relative ? reversed ? startNumValue - targetNumValue : startNumValue + targetNumValue : targetNumValue;
        }
        if (prop.onStart) {
          prop.onStart({
            relative: relative,
            reversed: reversed,
            start: prop.start,
            end: prop.end
          });
        }
      },
      _ret;
    for (var property in props) {
      _ret = _loop();
      if (_ret === 0) continue;
    }
    if (this._opts.onStart) {
      this._opts.onStart(workerTarget);
    }
  };
  _proto.stop = function stop() {
    var props = this._props;
    for (var name in props) {
      var prop = props[name];
      if (!prop.valid) continue;
      if (prop.onStop) {
        prop.onStop();
      }
    }
    _ActionInterval.prototype.stop.call(this);
  };
  _proto.update = function update(t) {
    var workerTarget = this._getWorkerTarget();
    if (!workerTarget) return;
    if (!this._opts) return;
    var props = this._props;
    var opts = this._opts;
    var easingTime = t;
    if (typeof opts.easing === 'function') easingTime = opts.easing(t);
    var progress = opts.progress;
    for (var name in props) {
      var prop = props[name];
      if (!prop.valid) continue;
      var time = prop.easing ? prop.easing(t) : easingTime;
      var interpolation = prop.progress ? prop.progress : progress;
      var start = prop.start;
      var end = prop.end;
      var current = prop.current;
      if (typeof current === 'number') {
        prop.current = interpolation(start, end, prop.current, time);
      } else if (typeof start === 'object') {
        if (prop.legacyProgress) {
          var keys = prop.keys;
          for (var i = 0, len = keys.length; i < len; ++i) {
            var k = keys[i];
            prop.current[k] = interpolation(start[k], end[k], prop.current[k], time);
          }
        } else {
          prop.current = interpolation(start, end, prop.current, time);
        }
      } else if (typeof current === 'string') {
        var newCurrent = interpolation(start, end, prop.current, time);
        if (typeof newCurrent === 'number') {
          var _prop$toFixed;
          newCurrent = newCurrent.toFixed((_prop$toFixed = prop.toFixed) !== null && _prop$toFixed !== void 0 ? _prop$toFixed : 0);
        } else if (typeof newCurrent !== 'string') {
          warnID(16387);
          continue;
        }
        prop.current = newCurrent;
      }
      workerTarget[name] = prop.current;
      if (t === 1 && prop.onComplete) {
        prop.onComplete();
      }
    }
    if (opts.onUpdate) {
      opts.onUpdate(workerTarget, t);
    }
    if (t === 1 && opts.onComplete) {
      opts.onComplete(workerTarget);
    }
  };
  _proto.progress = function progress(start, end, current, t) {
    return start + (end - start) * t;
  };
  _proto.isUnknownDuration = function isUnknownDuration() {
    return false;
  };
  return _createClass(TweenAction, [{
    key: "relative",
    get: function get() {
      return !!this._opts.relative;
    }
  }]);
}(ActionInterval);

var SetAction = function (_ActionInstant) {
  function SetAction(props) {
    var _this;
    _this = _ActionInstant.call(this) || this;
    _this._props = void 0;
    _this._props = {};
    if (props) _this.init(props);
    return _this;
  }
  _inheritsLoose(SetAction, _ActionInstant);
  var _proto = SetAction.prototype;
  _proto.init = function init(props) {
    for (var name in props) {
      this._props[name] = props[name];
    }
    return true;
  };
  _proto.update = function update() {
    var props = this._props;
    var target = this._getWorkerTarget();
    for (var name in props) {
      target[name] = props[name];
    }
  };
  _proto.clone = function clone() {
    var action = new SetAction();
    action._id = this._id;
    action.init(this._props);
    return action;
  };
  _proto.isUnknownDuration = function isUnknownDuration() {
    return false;
  };
  return SetAction;
}(ActionInstant);

function getActionManager() {
  return TweenSystem.instance.ActionManager;
}
var Tween = function () {
  function Tween(target) {
    this._actions = [];
    this._finalAction = null;
    this._target = null;
    this._tag = ActionEnum.TAG_INVALID;
    this._timeScale = 1;
    this._isBindNodeState = true;
    this._target = target === undefined ? null : target;
  }
  var _proto = Tween.prototype;
  _proto.bindNodeState = function bindNodeState(isBindNodeState) {
    this._isBindNodeState = isBindNodeState;
    return this;
  };
  _proto.tag = function tag(_tag) {
    this._tag = _tag;
    return this;
  };
  _proto.id = function (id) {
    if (this._actions.length > 0) {
      this._actions[this._actions.length - 1].setId(id);
    }
    return this;
  };
  _proto.then = function then(other) {
    var u = other._union(true);
    if (u) {
      u.setSpeed(other._timeScale);
      this._actions.push(u);
    }
    return this;
  };
  _proto.reverse = function reverse(otherTweenOrId, id) {
    if (otherTweenOrId == null && id == null) {
      return this.reverseTween();
    }
    var tweenForFindAction;
    var actionId;
    if (otherTweenOrId instanceof Tween) {
      tweenForFindAction = otherTweenOrId;
      if (id !== undefined) {
        actionId = id;
      }
    } else if (typeof otherTweenOrId === 'number') {
      tweenForFindAction = this;
      actionId = otherTweenOrId;
    }
    if (tweenForFindAction) {
      var reversedAction = Tween.reverseAction(tweenForFindAction, actionId);
      if (reversedAction) {
        this._actions.push(reversedAction);
      }
    }
    return this;
  };
  _proto.reverseTween = function reverseTween() {
    if (this._actions.length === 0) {
      warnID(16388);
      return this.clone(this._target);
    }
    var action = this._union(false);
    var r = tween(this._target);
    r._timeScale = this._timeScale;
    if (action) r.insertAction(action.reverse());
    return r;
  };
  Tween.reverseAction = function reverseAction(t, actionId) {
    var actions = t._actions;
    if (actions.length === 0) return null;
    var action = null;
    var reversedAction = null;
    if (typeof actionId === 'number') {
      action = t.findAction(actionId, actions);
    } else if (t) {
      action = t._union(false);
    }
    if (action) {
      reversedAction = action.reverse();
      reversedAction._owner = t;
    } else {
      warnID(16391, "" + actionId);
    }
    return reversedAction;
  };
  _proto.findAction = function findAction(id, actions) {
    var action = null;
    for (var i = 0, len = actions.length; i < len; ++i) {
      action = actions[i];
      if (action.getId() === id) return action;
      if (action instanceof Sequence || action instanceof Spawn) {
        action = action.findAction(id);
        if (action) return action;
      }
    }
    return null;
  };
  _proto.insertAction = function insertAction(other) {
    var action = other.clone();
    this.updateOwnerForAction(action);
    this._actions.push(action);
    return this;
  };
  _proto.updateOwnerForAction = function updateOwnerForAction(action) {
    if (!action) return;
    if (action instanceof Sequence || action instanceof Spawn) {
      action.updateOwner(this);
    } else if (!action._owner) {
      action._owner = this;
    }
  };
  _proto.target = function (target) {
    this._target = target;
    return this;
  };
  _proto.getTarget = function getTarget() {
    return this._target;
  };
  _proto.start = function start(time) {
    if (time === void 0) {
      time = 0;
    }
    if (!this._target) {
      warnID(16392);
      return this;
    }
    if (this._finalAction) {
      getActionManager().removeAction(this._finalAction);
    }
    var _final = this._unionForStart();
    this._finalAction = _final;
    if (_final) {
      _final.setTag(this._tag);
      _final.setSpeed(this._timeScale);
      _final.setStartTime(time);
      _final.setPaused(false);
      getActionManager().addAction(_final, this._target, false, this._isBindNodeState);
    } else {
      warnID(16393);
    }
    return this;
  };
  _proto.stop = function stop() {
    if (this._finalAction) {
      this._finalAction.stop();
      getActionManager().removeAction(this._finalAction);
      this._finalAction = null;
    }
    return this;
  };
  _proto.pause = function pause() {
    if (this._finalAction) {
      this._finalAction.setPaused(true);
    } else {
      warnID(16389);
    }
    return this;
  };
  _proto.resume = function resume() {
    if (this._finalAction) {
      this._finalAction.setPaused(false);
    } else {
      warnID(16390);
    }
    return this;
  };
  _proto.clone = function clone(target) {
    var action = this._union(false);
    var r = tween(target !== null && target !== void 0 ? target : this._target);
    r._timeScale = this._timeScale;
    return action ? r.insertAction(action) : r;
  };
  _proto.union = function union(fromId) {
    var _this = this;
    var unionAll = function unionAll() {
      var action = _this._union(false);
      _this._actions.length = 0;
      if (action) _this._actions.push(action);
    };
    if (fromId === undefined) {
      unionAll();
      return this;
    }
    var actions = this._actions;
    var index = actions.findIndex(function (action) {
      return action.getId() === fromId;
    });
    var len = actions.length;
    if (len > 1) {
      var actionsToUnion = actions.splice(index);
      if (actionsToUnion.length === 1) {
        actions.push(actionsToUnion[0]);
      } else {
        actions.push(sequence(actionsToUnion));
      }
    }
    return this;
  };
  _proto.to = function to(duration, props, opts) {
    var options = opts || Object.create(null);
    options.relative = false;
    var action = new TweenAction(duration, props, options);
    this._actions.push(action);
    return this;
  };
  _proto.by = function by(duration, props, opts) {
    var options = opts || Object.create(null);
    options.relative = true;
    var action = new TweenAction(duration, props, options);
    this._actions.push(action);
    return this;
  };
  _proto.update = function update(duration, cb) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    var action = new ActionCustomUpdate(duration, cb, args);
    this._actions.push(action);
    return this;
  };
  _proto.updateUntil = function updateUntil(cb) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    var action = new ActionUnknownDuration(cb, args);
    this._actions.push(action);
    return this;
  };
  _proto.set = function set(props) {
    var action = new SetAction(props);
    this._actions.push(action);
    return this;
  };
  _proto.delay = function delay(duration) {
    var action = delayTime(duration);
    this._actions.push(action);
    return this;
  };
  _proto.call = function call(callback, callbackThis, data) {
    var action = callFunc(callback, callbackThis, data);
    this._actions.push(action);
    return this;
  };
  _proto.sequence = function sequence() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    var action = Tween._wrappedSequence(args);
    if (action) this._actions.push(action);
    return this;
  };
  _proto.parallel = function parallel() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    var action = Tween._wrappedParallel(args);
    if (action) this._actions.push(action);
    return this;
  };
  _proto.timeScale = function timeScale(scale) {
    this._timeScale = scale;
    if (this._finalAction) {
      this._finalAction.setSpeed(scale);
    }
    return this;
  };
  _proto.getTimeScale = function getTimeScale() {
    return this._timeScale;
  };
  _proto.repeat = function repeat$1(repeatTimes, embedTween) {
    if (repeatTimes === Infinity) {
      return this.repeatForever(embedTween);
    }
    var actions = this._actions;
    var action;
    if (embedTween instanceof Tween) {
      action = embedTween._union(false);
    } else {
      action = actions.pop();
    }
    if (action) actions.push(repeat(action, repeatTimes));
    return this;
  };
  _proto.repeatForever = function repeatForever$1(embedTween) {
    var actions = this._actions;
    var action;
    if (embedTween instanceof Tween) {
      action = embedTween._union(false);
    } else {
      action = actions.pop();
    }
    if (action && actions.length !== 0) {
      actions.push(repeat(action, Number.MAX_SAFE_INTEGER));
    } else if (action instanceof ActionInterval) {
      actions.push(repeatForever(action));
    } else {
      warnID(16394);
    }
    return this;
  };
  _proto.reverseTime = function reverseTime$1(embedTween) {
    var actions = this._actions;
    var action;
    if (embedTween instanceof Tween) {
      action = embedTween._union(false);
    } else {
      action = actions.pop();
    }
    if (action instanceof ActionInterval) {
      actions.push(reverseTime(action));
    } else {
      warnID(16395);
    }
    return this;
  };
  _proto.hide = function hide$1() {
    var isNode = this._target instanceof Node;
    if (isNode) {
      var action = hide();
      this._actions.push(action);
    }
    return this;
  };
  _proto.show = function show$1() {
    var isNode = this._target instanceof Node;
    if (isNode) {
      var action = show();
      this._actions.push(action);
    }
    return this;
  };
  _proto.removeSelf = function removeSelf$1() {
    var isNode = this._target instanceof Node;
    if (isNode) {
      var action = removeSelf(false);
      this._actions.push(action);
    }
    return this;
  };
  _proto.destroySelf = function destroySelf() {
    var isNode = this._target instanceof Node;
    if (isNode) {
      var action = removeSelf(true);
      this._actions.push(action);
    }
    return this;
  };
  Tween.getRunningCount = function getRunningCount(target) {
    return getActionManager().getNumberOfRunningActionsInTarget(target);
  };
  Tween.stopAll = function stopAll() {
    getActionManager().removeAllActions();
  };
  Tween.stopAllByTag = function stopAllByTag(tag, target) {
    getActionManager().removeAllActionsByTag(tag, target);
  };
  Tween.stopAllByTarget = function stopAllByTarget(target) {
    getActionManager().removeAllActionsFromTarget(target);
  };
  Tween.pauseAllByTarget = function pauseAllByTarget(target) {
    getActionManager().pauseTarget(target);
  };
  Tween.resumeAllByTarget = function resumeAllByTarget(target) {
    getActionManager().resumeTarget(target);
  };
  _proto._union = function _union(needUpdateOwner) {
    var actions = this._actions;
    if (actions.length === 0) return null;
    var action = sequence(actions);
    if (needUpdateOwner) {
      this.updateOwnerForAction(action);
    }
    return action;
  };
  _proto._unionForStart = function _unionForStart() {
    var actions = this._actions;
    if (actions.length === 0) return null;
    var action;
    if (actions.length === 1 && actions[0] instanceof RepeatForever) {
      action = actions[0];
    } else {
      action = sequence(actions);
    }
    return action;
  };
  Tween._tweenToActions = function _tweenToActions(args) {
    var tmpArgs = Tween._tmpArgs;
    tmpArgs.length = 0;
    for (var l = args.length, i = 0; i < l; i++) {
      var t = args[i];
      var action = t._union(true);
      if (action) {
        action.setSpeed(t._timeScale);
        tmpArgs.push(action);
      }
    }
  };
  Tween._wrappedSequence = function _wrappedSequence(args) {
    Tween._tweenToActions(args);
    var ret = sequence(Tween._tmpArgs);
    this._tmpArgs.length = 0;
    return ret;
  };
  Tween._wrappedParallel = function _wrappedParallel(args) {
    Tween._tweenToActions(args);
    var ret = spawn(Tween._tmpArgs);
    this._tmpArgs.length = 0;
    return ret;
  };
  return _createClass(Tween, [{
    key: "running",
    get: function get() {
      if (this._finalAction) {
        return getActionManager().isActionRunning(this._finalAction);
      }
      return false;
    }
  }, {
    key: "duration",
    get: function get() {
      if (this._finalAction) {
        return this._finalAction.getDuration();
      }
      return 0;
    }
  }]);
}();
Tween._tmpArgs = [];
legacyCC.Tween = Tween;
function tween(target) {
  return new Tween(target);
}
legacyCC.tween = tween;
function tweenUtil(target) {
  warnID(16396);
  return new Tween(target);
}
legacyCC.tweenUtil = tweenUtil;

export { Tween, TweenAction, TweenSystem, tween, tweenProgress, tweenUtil };
//# sourceMappingURL=tween.js.map
