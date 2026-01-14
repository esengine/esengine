import { O as screenAdapter, V as Vec2, f as Vec3, Q as Quat, m as Rect, n as sys, i as replaceProperty, G as markAsWarning, B as Size, j as removeProperty, c as ccclass, b as applyDecoratedInitializer, s as serializable } from './index-uXI1_UMk.js';
import { N as Node, ad as SceneGlobals, aB as NodeUIProperties, aC as expandNestedPrefabInstanceNode, aD as applyTargetOverrides, aE as utils } from './scene-vWcxM1_c.js';
import { E as EventHandler, N as NodeEventType, A as Asset } from './node-event-Ccvtv8bJ.js';
import { ac as CCClass, n as EventTarget, $ as systemInfo, B as BrowserType, a4 as OS, e as warn, _ as _inheritsLoose, av as Feature, M as fastRemoveAt$1, a as _createClass, W as logID, G as macro, d as CCObjectFlags, w as warnID, aw as MutableForwardIterator, a5 as Pool, l as _createForOfIteratorHelperLoose, K as isValid, o as assertIsTrue, g as getError, k as errorID, I as assert, L as log, ax as removeAt, E as Enum, v as value, ay as obsolete } from './gc-object-CShF5lzx.js';
import { T as TEST, E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';
import { l as legacyCC, c as cclegacy } from './global-exports-DnCP_14L.js';
import { L as Layers } from './pipeline-state-manager-C5U4ouGL.js';
import { a as EventAcceleration, I as InputEventType, e as EventGamepad, f as EventHandle, g as EventHMD, K as KeyCode, b as EventKeyboard, c as EventMouse, T as Touch, d as EventTouch, S as SystemEventType, E as Event } from './touch-BKrZ-fxl.js';

var Acceleration = function Acceleration(x, y, z, timestamp) {
  if (x === void 0) {
    x = 0;
  }
  if (y === void 0) {
    y = 0;
  }
  if (z === void 0) {
    z = 0;
  }
  if (timestamp === void 0) {
    timestamp = 0;
  }
  this.x = x;
  this.y = y;
  this.z = z;
  this.timestamp = timestamp;
};

CCClass.Attr.setClassAttr(EventHandler, 'target', 'type', 'Object');
CCClass.Attr.setClassAttr(EventHandler, 'target', 'ctor', Node);

var AccelerometerInputSource = function () {
  function AccelerometerInputSource() {
    this._intervalInMileSeconds = 200;
    this._accelTimer = 0;
    this._eventTarget = new EventTarget();
    this._globalEventClass = window.DeviceMotionEvent || window.DeviceOrientationEvent;
    if (systemInfo.browserType === BrowserType.MOBILE_QQ) {
      this._globalEventClass = window.DeviceOrientationEvent;
    }
    this._deviceEventName = this._globalEventClass === window.DeviceMotionEvent ? 'devicemotion' : 'deviceorientation';
    this._didAccelerateFunc = this._didAccelerate.bind(this);
  }
  var _proto = AccelerometerInputSource.prototype;
  _proto._registerEvent = function _registerEvent() {
    this._accelTimer = performance.now();
    window.addEventListener(this._deviceEventName, this._didAccelerateFunc, false);
  };
  _proto._unregisterEvent = function _unregisterEvent() {
    this._accelTimer = 0;
    window.removeEventListener(this._deviceEventName, this._didAccelerateFunc, false);
  };
  _proto._didAccelerate = function _didAccelerate(event) {
    var now = performance.now();
    if (now - this._accelTimer < this._intervalInMileSeconds) {
      return;
    }
    this._accelTimer = now;
    var x = 0;
    var y = 0;
    var z = 0;
    if (this._globalEventClass === window.DeviceMotionEvent) {
      var deviceMotionEvent = event;
      var _eventAcceleration = deviceMotionEvent.accelerationIncludingGravity;
      x = ((_eventAcceleration == null ? void 0 : _eventAcceleration.x) || 0) * 0.1;
      y = ((_eventAcceleration == null ? void 0 : _eventAcceleration.y) || 0) * 0.1;
      z = ((_eventAcceleration == null ? void 0 : _eventAcceleration.z) || 0) * 0.1;
    } else {
      var deviceOrientationEvent = event;
      x = (deviceOrientationEvent.gamma || 0) / 90 * 0.981;
      y = -((deviceOrientationEvent.beta || 0) / 90) * 0.981;
      z = (deviceOrientationEvent.alpha || 0) / 90 * 0.981;
    }
    if (screenAdapter.isFrameRotated) {
      var tmp = x;
      x = -y;
      y = tmp;
    }
    var LANDSCAPE_LEFT = -90;
    var PORTRAIT_UPSIDE_DOWN = 180;
    var LANDSCAPE_RIGHT = 90;
    var tmpX = x;
    if (window.orientation === LANDSCAPE_RIGHT) {
      x = -y;
      y = tmpX;
    } else if (window.orientation === LANDSCAPE_LEFT) {
      x = y;
      y = -tmpX;
    } else if (window.orientation === PORTRAIT_UPSIDE_DOWN) {
      x = -x;
      y = -y;
    }
    if (systemInfo.os === OS.ANDROID && systemInfo.browserType !== BrowserType.MOBILE_QQ) {
      x = -x;
      y = -y;
    }
    var timestamp = performance.now();
    var acceleration = new Acceleration(x, y, z, timestamp);
    var eventAcceleration = new EventAcceleration(acceleration);
    this._eventTarget.emit(InputEventType.DEVICEMOTION, eventAcceleration);
  };
  _proto.start = function start() {
    var _this = this;
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(function (response) {
        if (response === 'granted') {
          _this._registerEvent();
        }
      })["catch"](function (e) {
        warn(e);
      });
    } else {
      this._registerEvent();
    }
  };
  _proto.stop = function stop() {
    this._unregisterEvent();
  };
  _proto.setInterval = function setInterval(intervalInMileSeconds) {
    this._intervalInMileSeconds = intervalInMileSeconds;
  };
  _proto.on = function on(eventType, callback, target) {
    this._eventTarget.on(eventType, callback, target);
  };
  return AccelerometerInputSource;
}();

var InputSource = function InputSource() {};
var InputSourceAxis1D = function (_InputSource) {
  function InputSourceAxis1D() {
    return _InputSource.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceAxis1D, _InputSource);
  var _proto = InputSourceAxis1D.prototype;
  _proto.getValue = function getValue() {
    throw new Error('Method not implemented.');
  };
  return InputSourceAxis1D;
}(InputSource);
var InputSourceAxis2D = function (_InputSource2) {
  function InputSourceAxis2D() {
    return _InputSource2.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceAxis2D, _InputSource2);
  var _proto2 = InputSourceAxis2D.prototype;
  _proto2.getValue = function getValue() {
    throw new Error('Method not implemented.');
  };
  return InputSourceAxis2D;
}(InputSource);
var InputSourceAxis3D = function (_InputSource3) {
  function InputSourceAxis3D() {
    return _InputSource3.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceAxis3D, _InputSource3);
  var _proto3 = InputSourceAxis3D.prototype;
  _proto3.getValue = function getValue() {
    throw new Error('Method not implemented.');
  };
  return InputSourceAxis3D;
}(InputSource);
var InputSourceQuat = function (_InputSource4) {
  function InputSourceQuat() {
    return _InputSource4.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceQuat, _InputSource4);
  var _proto4 = InputSourceQuat.prototype;
  _proto4.getValue = function getValue() {
    throw new Error('Method not implemented.');
  };
  return InputSourceQuat;
}(InputSource);
var CompositeInputSourceAxis1D = function (_InputSourceAxis1D) {
  function CompositeInputSourceAxis1D(options) {
    var _this;
    _this = _InputSourceAxis1D.call(this) || this;
    _this.positive = options.positive;
    _this.negative = options.negative;
    return _this;
  }
  _inheritsLoose(CompositeInputSourceAxis1D, _InputSourceAxis1D);
  var _proto5 = CompositeInputSourceAxis1D.prototype;
  _proto5.getValue = function getValue() {
    var positiveValue = this.positive.getValue();
    var negativeValue = this.negative.getValue();
    if (Math.abs(positiveValue) > Math.abs(negativeValue)) {
      return positiveValue;
    }
    return -negativeValue;
  };
  return CompositeInputSourceAxis1D;
}(InputSourceAxis1D);
var CompositeInputSourceAxis2D = function (_InputSourceAxis2D) {
  function CompositeInputSourceAxis2D(options) {
    var _this2;
    _this2 = _InputSourceAxis2D.call(this) || this;
    _this2.up = options.up;
    _this2.down = options.down;
    _this2.left = options.left;
    _this2.right = options.right;
    _this2.xAxis = new CompositeInputSourceAxis1D({
      positive: _this2.right,
      negative: _this2.left
    });
    _this2.yAxis = new CompositeInputSourceAxis1D({
      positive: _this2.up,
      negative: _this2.down
    });
    return _this2;
  }
  _inheritsLoose(CompositeInputSourceAxis2D, _InputSourceAxis2D);
  var _proto6 = CompositeInputSourceAxis2D.prototype;
  _proto6.getValue = function getValue() {
    return new Vec2(this.xAxis.getValue(), this.yAxis.getValue());
  };
  return CompositeInputSourceAxis2D;
}(InputSourceAxis2D);
(function (_InputSourceAxis3D) {
  function CompositeInputSourceAxis3D(options) {
    var _this3;
    _this3 = _InputSourceAxis3D.call(this) || this;
    _this3.up = options.up;
    _this3.down = options.down;
    _this3.left = options.left;
    _this3.right = options.right;
    _this3.forward = options.forward;
    _this3.backward = options.backward;
    _this3.xAxis = new CompositeInputSourceAxis1D({
      positive: _this3.right,
      negative: _this3.left
    });
    _this3.yAxis = new CompositeInputSourceAxis1D({
      positive: _this3.up,
      negative: _this3.down
    });
    _this3.zAxis = new CompositeInputSourceAxis1D({
      positive: _this3.forward,
      negative: _this3.backward
    });
    return _this3;
  }
  _inheritsLoose(CompositeInputSourceAxis3D, _InputSourceAxis3D);
  var _proto7 = CompositeInputSourceAxis3D.prototype;
  _proto7.getValue = function getValue() {
    return new Vec3(this.xAxis.getValue(), this.yAxis.getValue(), this.zAxis.getValue());
  };
  return CompositeInputSourceAxis3D;
})(InputSourceAxis3D);
var InputSourceButton = function (_InputSourceAxis1D2) {
  function InputSourceButton() {
    return _InputSourceAxis1D2.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceButton, _InputSourceAxis1D2);
  var _proto8 = InputSourceButton.prototype;
  _proto8.getValue = function getValue() {
    return _InputSourceAxis1D2.prototype.getValue.call(this);
  };
  return InputSourceButton;
}(InputSourceAxis1D);
var InputSourceDpad = function (_CompositeInputSource) {
  function InputSourceDpad() {
    return _CompositeInputSource.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceDpad, _CompositeInputSource);
  return InputSourceDpad;
}(CompositeInputSourceAxis2D);
var InputSourceStick = function (_CompositeInputSource2) {
  function InputSourceStick() {
    return _CompositeInputSource2.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceStick, _CompositeInputSource2);
  return InputSourceStick;
}(CompositeInputSourceAxis2D);
var InputSourceOrientation = function (_InputSourceQuat) {
  function InputSourceOrientation() {
    return _InputSourceQuat.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceOrientation, _InputSourceQuat);
  var _proto9 = InputSourceOrientation.prototype;
  _proto9.getValue = function getValue() {
    return _InputSourceQuat.prototype.getValue.call(this);
  };
  return InputSourceOrientation;
}(InputSourceQuat);
var InputSourcePosition = function (_InputSourceAxis3D2) {
  function InputSourcePosition() {
    return _InputSourceAxis3D2.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourcePosition, _InputSourceAxis3D2);
  var _proto0 = InputSourcePosition.prototype;
  _proto0.getValue = function getValue() {
    return _InputSourceAxis3D2.prototype.getValue.call(this);
  };
  return InputSourcePosition;
}(InputSourceAxis3D);
var InputSourceTouch = function (_InputSourceAxis1D3) {
  function InputSourceTouch() {
    return _InputSourceAxis1D3.apply(this, arguments) || this;
  }
  _inheritsLoose(InputSourceTouch, _InputSourceAxis1D3);
  var _proto1 = InputSourceTouch.prototype;
  _proto1.getValue = function getValue() {
    return _InputSourceAxis1D3.prototype.getValue.call(this);
  };
  return InputSourceTouch;
}(InputSourceAxis1D);

var BUTTON_SOUTH = 0;
var BUTTON_EAST = 1;
var BUTTON_WEST = 2;
var BUTTON_NORTH = 3;
var BUTTON_L1 = 4;
var BUTTON_R1 = 5;
var BUTTON_L2 = 6;
var BUTTON_R2 = 7;
var BUTTON_SHARE = 8;
var BUTTON_OPTIONS = 9;
var BUTTON_L3 = 10;
var BUTTON_R3 = 11;
var BUTTON_DPAD_UP = 12;
var BUTTON_DPAD_DOWN = 13;
var BUTTON_DPAD_LEFT = 14;
var BUTTON_DPAD_RIGHT = 15;
var AXIS_LEFT_STICK_X = 0;
var AXIS_LEFT_STICK_Y = 1;
var AXIS_RIGHT_STICK_X = 2;
var AXIS_RIGHT_STICK_Y = 3;
var XR_TRIGGER = 0;
var XR_GRIP = 1;
var XR_TOUCHPAD = 2;
var XR_STICK = 3;
var XR_BUTTON_1 = 4;
var XR_BUTTON_2 = 5;
var XR_AXIS_TOUCHPAD_X = 0;
var XR_AXIS_TOUCHPAD_Y = 1;
var XR_AXIS_STICK_X = 2;
var XR_AXIS_STICK_Y = 3;
var EPSILON = 0.01;
var XRLeftHandedness = 'left';
var XRRightHandedness = 'right';
var devicesTmp = [];
var Pose$1;
(function (Pose) {
  Pose[Pose["HAND_LEFT"] = 1] = "HAND_LEFT";
  Pose[Pose["HAND_RIGHT"] = 4] = "HAND_RIGHT";
  Pose[Pose["AIM_LEFT"] = 2] = "AIM_LEFT";
  Pose[Pose["AIM_RIGHT"] = 5] = "AIM_RIGHT";
})(Pose$1 || (Pose$1 = {}));
var GamepadInputDevice = function () {
  function GamepadInputDevice(deviceId) {
    var _this$_webPoseState;
    this._deviceId = -1;
    this._connected = false;
    this._webPoseState = (_this$_webPoseState = {}, _this$_webPoseState[Pose$1.HAND_LEFT] = {
      position: Vec3.ZERO,
      orientation: Quat.IDENTITY
    }, _this$_webPoseState[Pose$1.HAND_RIGHT] = {
      position: Vec3.ZERO,
      orientation: Quat.IDENTITY
    }, _this$_webPoseState[Pose$1.AIM_LEFT] = {
      position: Vec3.ZERO,
      orientation: Quat.IDENTITY
    }, _this$_webPoseState[Pose$1.AIM_RIGHT] = {
      position: Vec3.ZERO,
      orientation: Quat.IDENTITY
    }, _this$_webPoseState);
    this._deviceId = deviceId;
    this._initInputSource();
  }
  GamepadInputDevice._init = function _init() {
    if (!systemInfo.hasFeature(Feature.EVENT_GAMEPAD)) {
      return;
    }
    GamepadInputDevice._registerEvent();
  };
  GamepadInputDevice._on = function _on(eventType, cb, target) {
    GamepadInputDevice._eventTarget.on(eventType, cb, target);
  };
  GamepadInputDevice._removeInputDevice = function _removeInputDevice(id) {
    var removeIndex = GamepadInputDevice.all.findIndex(function (device) {
      return device.deviceId === id;
    });
    if (removeIndex === -1) {
      return;
    }
    fastRemoveAt$1(GamepadInputDevice.all, removeIndex);
  };
  GamepadInputDevice._getOrCreateInputDevice = function _getOrCreateInputDevice(id, connected) {
    var device = GamepadInputDevice.all.find(function (device) {
      return device.deviceId === id;
    });
    if (!device) {
      device = new GamepadInputDevice(id);
      GamepadInputDevice.all.push(device);
    }
    device._connected = connected;
    return device;
  };
  GamepadInputDevice._ensureDirectorDefined = function _ensureDirectorDefined(callback) {
    GamepadInputDevice._intervalId = setInterval(function () {
      if (legacyCC.director && legacyCC.Director) {
        clearInterval(GamepadInputDevice._intervalId);
        GamepadInputDevice._intervalId = -1;
        callback();
      }
    }, 50);
  };
  GamepadInputDevice._updateGamepadCnt = function _updateGamepadCnt() {
    var cnt = 0;
    for (var i = 0, l = GamepadInputDevice._cachedWebGamepads.length; i < l; i++) {
      if (GamepadInputDevice._cachedWebGamepads[i]) cnt++;
    }
    GamepadInputDevice._totalGamepadCnt = cnt;
  };
  GamepadInputDevice._registerEvent = function _registerEvent() {
    GamepadInputDevice._ensureDirectorDefined(function () {
      GamepadInputDevice._cachedWebGamepads = GamepadInputDevice._getWebGamePads();
      GamepadInputDevice._updateGamepadCnt();
      legacyCC.director.on(legacyCC.Director.EVENT_BEGIN_FRAME, GamepadInputDevice._scanGamepads);
    });
    window.addEventListener('gamepadconnected', function (e) {
      GamepadInputDevice._cachedWebGamepads[e.gamepad.index] = e.gamepad;
      GamepadInputDevice._updateGamepadCnt();
      var device = GamepadInputDevice._getOrCreateInputDevice(e.gamepad.index, true);
      GamepadInputDevice._eventTarget.emit(InputEventType.GAMEPAD_CHANGE, new EventGamepad(InputEventType.GAMEPAD_CHANGE, device));
    });
    window.addEventListener('gamepaddisconnected', function (e) {
      GamepadInputDevice._cachedWebGamepads[e.gamepad.index] = null;
      GamepadInputDevice._updateGamepadCnt();
      var device = GamepadInputDevice._getOrCreateInputDevice(e.gamepad.index, false);
      GamepadInputDevice._removeInputDevice(e.gamepad.index);
      GamepadInputDevice._eventTarget.emit(InputEventType.GAMEPAD_CHANGE, new EventGamepad(InputEventType.GAMEPAD_CHANGE, device));
    });
  };
  GamepadInputDevice._scanWebGamepads = function _scanWebGamepads(devices) {
    var allDisconnected = GamepadInputDevice._totalGamepadCnt === 0;
    if (allDisconnected) return;
    var webGamepads = GamepadInputDevice._getWebGamePads();
    if (!webGamepads) {
      return;
    }
    for (var i = 0; i < webGamepads.length; ++i) {
      var webGamepad = webGamepads[i];
      if (!webGamepad) {
        continue;
      }
      var cachedWebGamepad = GamepadInputDevice._cachedWebGamepads[webGamepad.index];
      if (cachedWebGamepad) {
        var device = void 0;
        var cachedButtons = cachedWebGamepad.buttons;
        for (var j = 0; j < cachedButtons.length; ++j) {
          var cachedButton = cachedButtons[j];
          var button = webGamepad.buttons[j];
          if (Math.abs(cachedButton.value - button.value) > EPSILON) {
            device = GamepadInputDevice._getOrCreateInputDevice(webGamepad.index, true);
            break;
          }
        }
        if (device) {
          devices.push(device);
          continue;
        }
        var cachedAxes = cachedWebGamepad.axes;
        for (var _j = 0; _j < cachedAxes.length; ++_j) {
          var cachedAxisValue = cachedAxes[_j];
          var axisValue = webGamepad.axes[_j];
          if (Math.abs(cachedAxisValue - axisValue) > EPSILON) {
            device = GamepadInputDevice._getOrCreateInputDevice(webGamepad.index, true);
            break;
          }
        }
        if (device) {
          devices.push(device);
          continue;
        }
      }
    }
    GamepadInputDevice._cachedWebGamepads = webGamepads;
  };
  GamepadInputDevice._scanGamepads = function _scanGamepads() {
    devicesTmp.length = 0;
    GamepadInputDevice._scanWebGamepads(devicesTmp);
    GamepadInputDevice._scanWebXRGamepads(devicesTmp);
    for (var i = 0; i < devicesTmp.length; ++i) {
      var device = devicesTmp[i];
      GamepadInputDevice._eventTarget.emit(InputEventType.GAMEPAD_INPUT, new EventGamepad(InputEventType.GAMEPAD_INPUT, device));
    }
    GamepadInputDevice._scanWebXRGamepadsPose();
  };
  GamepadInputDevice._scanWebXRGamepads = function _scanWebXRGamepads(devices) {
    var _GamepadInputDevice$_, _GamepadInputDevice$_2;
    var webxrGamepadMap = GamepadInputDevice._getWebXRGamepadMap();
    if (!webxrGamepadMap) {
      GamepadInputDevice._cachedWebXRGamepadMap = null;
      if (GamepadInputDevice.xr && GamepadInputDevice.xr._connected) {
        GamepadInputDevice.xr._connected = false;
        GamepadInputDevice._eventTarget.emit(InputEventType.GAMEPAD_CHANGE, new EventGamepad(InputEventType.GAMEPAD_CHANGE, GamepadInputDevice.xr));
        devices.push(GamepadInputDevice.xr);
      }
      return;
    }
    if (!GamepadInputDevice.xr) {
      GamepadInputDevice.xr = new GamepadInputDevice(-1);
    }
    var left = webxrGamepadMap.get(XRLeftHandedness);
    var right = webxrGamepadMap.get(XRRightHandedness);
    if (!left && !right) {
      if (GamepadInputDevice.xr._connected) {
        GamepadInputDevice.xr._connected = false;
        GamepadInputDevice._eventTarget.emit(InputEventType.GAMEPAD_CHANGE, new EventGamepad(InputEventType.GAMEPAD_CHANGE, GamepadInputDevice.xr));
      }
    } else if (!GamepadInputDevice.xr._connected) {
      GamepadInputDevice.xr._connected = true;
      GamepadInputDevice._eventTarget.emit(InputEventType.GAMEPAD_CHANGE, new EventGamepad(InputEventType.GAMEPAD_CHANGE, GamepadInputDevice.xr));
    }
    if (GamepadInputDevice.checkGamepadChanged(left, (_GamepadInputDevice$_ = GamepadInputDevice._cachedWebXRGamepadMap) == null ? void 0 : _GamepadInputDevice$_.get(XRLeftHandedness))) {
      devices.push(GamepadInputDevice.xr);
    } else if (GamepadInputDevice.checkGamepadChanged(right, (_GamepadInputDevice$_2 = GamepadInputDevice._cachedWebXRGamepadMap) == null ? void 0 : _GamepadInputDevice$_2.get(XRRightHandedness))) {
      devices.push(GamepadInputDevice.xr);
    }
    if (!GamepadInputDevice._cachedWebXRGamepadMap) {
      GamepadInputDevice._cachedWebXRGamepadMap = new Map();
    }
    GamepadInputDevice._cachedWebXRGamepadMap.set(XRLeftHandedness, GamepadInputDevice._copyCacheGamepadValue(left));
    GamepadInputDevice._cachedWebXRGamepadMap.set(XRRightHandedness, GamepadInputDevice._copyCacheGamepadValue(right));
  };
  GamepadInputDevice.checkGamepadChanged = function checkGamepadChanged(currGamepad, cachedGamepad) {
    if (!currGamepad && !cachedGamepad) {
      return false;
    } else if (!currGamepad || !cachedGamepad) {
      return true;
    }
    var cachedButtons = cachedGamepad.buttons;
    for (var j = 0; j < cachedButtons.length; ++j) {
      var cachedButton = cachedButtons[j];
      var button = currGamepad.buttons[j];
      if (button.value !== 0 || cachedButton !== 0) {
        return true;
      }
    }
    var cachedAxes = cachedGamepad.axes;
    for (var _j2 = 0; _j2 < cachedAxes.length; ++_j2) {
      var cachedAxisValue = cachedAxes[_j2];
      var axisValue = currGamepad.axes[_j2];
      if (axisValue !== 0 || cachedAxisValue !== 0) {
        return true;
      }
    }
    return false;
  };
  GamepadInputDevice._copyCacheGamepadValue = function _copyCacheGamepadValue(gamepad) {
    if (!gamepad) {
      return undefined;
    }
    var cacheGamepad = {
      buttons: new Array(gamepad.buttons.length),
      axes: new Array(gamepad.axes.length)
    };
    for (var j = 0; j < gamepad.buttons.length; ++j) {
      cacheGamepad.buttons[j] = gamepad.buttons[j].value;
    }
    for (var _j3 = 0; _j3 < gamepad.axes.length; ++_j3) {
      cacheGamepad.axes[_j3] = gamepad.axes[_j3];
    }
    return cacheGamepad;
  };
  GamepadInputDevice._scanWebXRGamepadsPose = function _scanWebXRGamepadsPose() {
    var _globalThis$__globalX;
    var infoList = (_globalThis$__globalX = globalThis.__globalXR) == null ? void 0 : _globalThis$__globalX.webxrHandlePoseInfos;
    if (!infoList || !GamepadInputDevice.xr) {
      return;
    }
    for (var i = 0; i < infoList.length; ++i) {
      var info = infoList[i];
      GamepadInputDevice.xr._updateWebPoseState(info);
    }
    GamepadInputDevice._eventTarget.emit(InputEventType.HANDLE_POSE_INPUT, new EventGamepad(InputEventType.HANDLE_POSE_INPUT, GamepadInputDevice.xr));
  };
  GamepadInputDevice._getWebXRGamepadMap = function _getWebXRGamepadMap() {
    var _globalThis$__globalX2;
    return (_globalThis$__globalX2 = globalThis.__globalXR) == null ? void 0 : _globalThis$__globalX2.webxrGamepadMap;
  };
  GamepadInputDevice._getWebGamePads = function _getWebGamePads() {
    if (typeof navigator.getGamepads === 'function') {
      return navigator.getGamepads();
    } else if (typeof navigator.webkitGetGamepads === 'function') {
      return navigator.webkitGetGamepads();
    }
    return [];
  };
  GamepadInputDevice._getWebGamepad = function _getWebGamepad(deviceId) {
    var webGamepads = GamepadInputDevice._getWebGamePads();
    for (var i = 0; i < webGamepads.length; ++i) {
      var webGamepad = webGamepads[i];
      if (webGamepad && webGamepad.index === deviceId) {
        return webGamepad;
      }
    }
    return undefined;
  };
  var _proto = GamepadInputDevice.prototype;
  _proto._axisToButtons = function _axisToButtons(axisValue) {
    var value = Math.abs(axisValue);
    if (axisValue > 0) {
      return {
        negative: 0,
        positive: value
      };
    } else if (axisValue < 0) {
      return {
        negative: value,
        positive: 0
      };
    } else {
      return {
        negative: 0,
        positive: 0
      };
    }
  };
  _proto._updateWebPoseState = function _updateWebPoseState(info) {
    if (info.code !== Pose$1.HAND_LEFT && info.code !== Pose$1.AIM_LEFT && info.code !== Pose$1.HAND_RIGHT && info.code !== Pose$1.AIM_RIGHT) {
      return;
    }
    this._webPoseState[info.code] = {
      position: new Vec3(info.position.x, info.position.y, info.position.z),
      orientation: new Quat(info.orientation.x, info.orientation.y, info.orientation.z, info.orientation.w)
    };
  };
  _proto._initInputSource = function _initInputSource() {
    var _this = this;
    this._buttonNorth = new InputSourceButton();
    this._buttonNorth.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_3;
        var webxrGamepad = (_GamepadInputDevice$_3 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_3.get(XRLeftHandedness);
        if (webxrGamepad && webxrGamepad.buttons.length > XR_BUTTON_2) {
          return webxrGamepad.buttons[XR_BUTTON_2].value;
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_NORTH].value;
      }
      return 0;
    };
    this._buttonEast = new InputSourceButton();
    this._buttonEast.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_4;
        var webxrGamepad = (_GamepadInputDevice$_4 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_4.get(XRRightHandedness);
        if (webxrGamepad && webxrGamepad.buttons.length > XR_BUTTON_2) {
          return webxrGamepad.buttons[XR_BUTTON_2].value;
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_EAST].value;
      }
      return 0;
    };
    this._buttonWest = new InputSourceButton();
    this._buttonWest.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_5;
        var webxrGamepad = (_GamepadInputDevice$_5 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_5.get(XRLeftHandedness);
        if (webxrGamepad && webxrGamepad.buttons.length > XR_BUTTON_1) {
          return webxrGamepad.buttons[XR_BUTTON_1].value;
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_WEST].value;
      }
      return 0;
    };
    this._buttonSouth = new InputSourceButton();
    this._buttonSouth.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_6;
        var webxrGamepad = (_GamepadInputDevice$_6 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_6.get(XRRightHandedness);
        if (webxrGamepad && webxrGamepad.buttons.length > XR_BUTTON_1) {
          return webxrGamepad.buttons[XR_BUTTON_1].value;
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_SOUTH].value;
      }
      return 0;
    };
    this._buttonL1 = new InputSourceButton();
    this._buttonL1.getValue = function () {
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_L1].value;
      }
      return 0;
    };
    this._buttonL2 = new InputSourceButton();
    this._buttonL2.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_7;
        var webxrGamepad = (_GamepadInputDevice$_7 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_7.get(XRLeftHandedness);
        if (webxrGamepad && webxrGamepad.buttons.length > XR_TRIGGER) {
          return webxrGamepad.buttons[XR_TRIGGER].value;
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_L2].value;
      }
      return 0;
    };
    this._buttonL3 = new InputSourceButton();
    this._buttonL3.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_8;
        var webxrGamepad = (_GamepadInputDevice$_8 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_8.get(XRLeftHandedness);
        if (webxrGamepad) {
          if (webxrGamepad.buttons.length > XR_STICK && webxrGamepad.buttons[XR_STICK].value !== 0) {
            return webxrGamepad.buttons[XR_STICK].value;
          } else if (webxrGamepad.buttons.length > XR_TOUCHPAD && webxrGamepad.buttons[XR_TOUCHPAD].value !== 0) {
            return webxrGamepad.buttons[XR_TOUCHPAD].value;
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_L3].value;
      }
      return 0;
    };
    this._buttonR1 = new InputSourceButton();
    this._buttonR1.getValue = function () {
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_R1].value;
      }
      return 0;
    };
    this._buttonR2 = new InputSourceButton();
    this._buttonR2.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_9;
        var webxrGamepad = (_GamepadInputDevice$_9 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_9.get(XRRightHandedness);
        if (webxrGamepad && webxrGamepad.buttons.length > XR_TRIGGER) {
          return webxrGamepad.buttons[XR_TRIGGER].value;
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_R2].value;
      }
      return 0;
    };
    this._buttonR3 = new InputSourceButton();
    this._buttonR3.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_0;
        var webxrGamepad = (_GamepadInputDevice$_0 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_0.get(XRRightHandedness);
        if (webxrGamepad) {
          if (webxrGamepad.buttons.length > XR_STICK && webxrGamepad.buttons[XR_STICK].value !== 0) {
            return webxrGamepad.buttons[XR_STICK].value;
          } else if (webxrGamepad.buttons.length > XR_TOUCHPAD && webxrGamepad.buttons[XR_TOUCHPAD].value !== 0) {
            return webxrGamepad.buttons[XR_TOUCHPAD].value;
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_R3].value;
      }
      return 0;
    };
    this._buttonShare = new InputSourceButton();
    this._buttonShare.getValue = function () {
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_SHARE].value;
      }
      return 0;
    };
    this._buttonOptions = new InputSourceButton();
    this._buttonOptions.getValue = function () {
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_OPTIONS].value;
      }
      return 0;
    };
    var dpadUp = new InputSourceButton();
    dpadUp.getValue = function () {
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_DPAD_UP].value;
      }
      return 0;
    };
    var dpadDown = new InputSourceButton();
    dpadDown.getValue = function () {
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_DPAD_DOWN].value;
      }
      return 0;
    };
    var dpadLeft = new InputSourceButton();
    dpadLeft.getValue = function () {
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_DPAD_LEFT].value;
      }
      return 0;
    };
    var dpadRight = new InputSourceButton();
    dpadRight.getValue = function () {
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return webGamepad.buttons[BUTTON_DPAD_RIGHT].value;
      }
      return 0;
    };
    this._dpad = new InputSourceDpad({
      up: dpadUp,
      down: dpadDown,
      left: dpadLeft,
      right: dpadRight
    });
    var leftStickUp = new InputSourceButton();
    leftStickUp.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_1;
          var webxrGamepad = (_GamepadInputDevice$_1 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_1.get(XRLeftHandedness);
          if (webxrGamepad) {
            if (webxrGamepad.axes.length > XR_AXIS_STICK_Y && webxrGamepad.axes[XR_AXIS_STICK_Y] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_STICK_Y]).negative;
            } else if (webxrGamepad.axes.length > XR_AXIS_TOUCHPAD_Y && webxrGamepad.axes[XR_AXIS_TOUCHPAD_Y] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_TOUCHPAD_Y]).negative;
            }
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return _this._axisToButtons(webGamepad.axes[AXIS_LEFT_STICK_Y]).negative;
      }
      return 0;
    };
    var leftStickDown = new InputSourceButton();
    leftStickDown.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_10;
          var webxrGamepad = (_GamepadInputDevice$_10 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_10.get(XRLeftHandedness);
          if (webxrGamepad) {
            if (webxrGamepad.axes.length > XR_AXIS_STICK_Y && webxrGamepad.axes[XR_AXIS_STICK_Y] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_STICK_Y]).positive;
            } else if (webxrGamepad.axes.length > XR_AXIS_TOUCHPAD_Y && webxrGamepad.axes[XR_AXIS_TOUCHPAD_Y] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_TOUCHPAD_Y]).positive;
            }
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return _this._axisToButtons(webGamepad.axes[AXIS_LEFT_STICK_Y]).positive;
      }
      return 0;
    };
    var leftStickLeft = new InputSourceButton();
    leftStickLeft.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_11;
          var webxrGamepad = (_GamepadInputDevice$_11 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_11.get(XRLeftHandedness);
          if (webxrGamepad) {
            if (webxrGamepad.axes.length > XR_AXIS_STICK_X && webxrGamepad.axes[XR_AXIS_STICK_X] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_STICK_X]).negative;
            } else if (webxrGamepad.axes.length > XR_AXIS_TOUCHPAD_X && webxrGamepad.axes[XR_AXIS_TOUCHPAD_X] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_TOUCHPAD_X]).negative;
            }
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return _this._axisToButtons(webGamepad.axes[AXIS_LEFT_STICK_X]).negative;
      }
      return 0;
    };
    var leftStickRight = new InputSourceButton();
    leftStickRight.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_12;
          var webxrGamepad = (_GamepadInputDevice$_12 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_12.get(XRLeftHandedness);
          if (webxrGamepad) {
            if (webxrGamepad.axes.length > XR_AXIS_STICK_X && webxrGamepad.axes[XR_AXIS_STICK_X] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_STICK_X]).positive;
            } else if (webxrGamepad.axes.length > XR_AXIS_TOUCHPAD_X && webxrGamepad.axes[XR_AXIS_TOUCHPAD_X] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_TOUCHPAD_X]).positive;
            }
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return _this._axisToButtons(webGamepad.axes[AXIS_LEFT_STICK_X]).positive;
      }
      return 0;
    };
    this._leftStick = new InputSourceStick({
      up: leftStickUp,
      down: leftStickDown,
      left: leftStickLeft,
      right: leftStickRight
    });
    var rightStickUp = new InputSourceButton();
    rightStickUp.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_13;
          var webxrGamepad = (_GamepadInputDevice$_13 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_13.get(XRRightHandedness);
          if (webxrGamepad) {
            if (webxrGamepad.axes.length > XR_AXIS_STICK_Y && webxrGamepad.axes[XR_AXIS_STICK_Y] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_STICK_Y]).negative;
            } else if (webxrGamepad.axes.length > XR_AXIS_TOUCHPAD_Y && webxrGamepad.axes[XR_AXIS_TOUCHPAD_Y] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_TOUCHPAD_Y]).negative;
            }
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return _this._axisToButtons(webGamepad.axes[AXIS_RIGHT_STICK_Y]).negative;
      }
      return 0;
    };
    var rightStickDown = new InputSourceButton();
    rightStickDown.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_14;
          var webxrGamepad = (_GamepadInputDevice$_14 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_14.get(XRRightHandedness);
          if (webxrGamepad) {
            if (webxrGamepad.axes.length > XR_AXIS_STICK_Y && webxrGamepad.axes[XR_AXIS_STICK_Y] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_STICK_Y]).positive;
            } else if (webxrGamepad.axes.length > XR_AXIS_TOUCHPAD_Y && webxrGamepad.axes[XR_AXIS_TOUCHPAD_Y] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_TOUCHPAD_Y]).positive;
            }
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return _this._axisToButtons(webGamepad.axes[AXIS_RIGHT_STICK_Y]).positive;
      }
      return 0;
    };
    var rightStickLeft = new InputSourceButton();
    rightStickLeft.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_15;
          var webxrGamepad = (_GamepadInputDevice$_15 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_15.get(XRRightHandedness);
          if (webxrGamepad) {
            if (webxrGamepad.axes.length > XR_AXIS_STICK_X && webxrGamepad.axes[XR_AXIS_STICK_X] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_STICK_X]).negative;
            } else if (webxrGamepad.axes.length > XR_AXIS_TOUCHPAD_X && webxrGamepad.axes[XR_AXIS_TOUCHPAD_X] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_TOUCHPAD_X]).negative;
            }
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return _this._axisToButtons(webGamepad.axes[AXIS_RIGHT_STICK_X]).negative;
      }
      return 0;
    };
    var rightStickRight = new InputSourceButton();
    rightStickRight.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_16;
          var webxrGamepad = (_GamepadInputDevice$_16 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_16.get(XRRightHandedness);
          if (webxrGamepad) {
            if (webxrGamepad.axes.length > XR_AXIS_STICK_X && webxrGamepad.axes[XR_AXIS_STICK_X] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_STICK_X]).positive;
            } else if (webxrGamepad.axes.length > XR_AXIS_TOUCHPAD_X && webxrGamepad.axes[XR_AXIS_TOUCHPAD_X] !== 0) {
              return _this._axisToButtons(webxrGamepad.axes[XR_AXIS_TOUCHPAD_X]).positive;
            }
          }
        }
        return 0;
      }
      var webGamepad = GamepadInputDevice._getWebGamepad(_this.deviceId);
      if (webGamepad) {
        return _this._axisToButtons(webGamepad.axes[AXIS_RIGHT_STICK_X]).positive;
      }
      return 0;
    };
    this._rightStick = new InputSourceStick({
      up: rightStickUp,
      down: rightStickDown,
      left: rightStickLeft,
      right: rightStickRight
    });
    this._buttonStart = new InputSourceButton();
    this._buttonStart.getValue = function () {
      return 0;
    };
    this._gripLeft = new InputSourceButton();
    this._gripLeft.getValue = function () {
      if (_this.deviceId === -1) {
        {
          var _GamepadInputDevice$_17;
          var webxrGamepad = (_GamepadInputDevice$_17 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_17.get(XRLeftHandedness);
          if (webxrGamepad && webxrGamepad.buttons.length > XR_GRIP) {
            return webxrGamepad.buttons[XR_GRIP].value;
          }
        }
      }
      return 0;
    };
    this._gripRight = new InputSourceButton();
    this._gripRight.getValue = function () {
      if (_this.deviceId === -1) {
        var _GamepadInputDevice$_18;
        var webxrGamepad = (_GamepadInputDevice$_18 = GamepadInputDevice._getWebXRGamepadMap()) == null ? void 0 : _GamepadInputDevice$_18.get(XRRightHandedness);
        if (webxrGamepad && webxrGamepad.buttons.length > XR_GRIP) {
          return webxrGamepad.buttons[XR_GRIP].value;
        }
      }
      return 0;
    };
    this._handLeftPosition = new InputSourcePosition();
    this._handLeftPosition.getValue = function () {
      return _this._webPoseState[Pose$1.HAND_LEFT].position;
    };
    this._handLeftOrientation = new InputSourceOrientation();
    this._handLeftOrientation.getValue = function () {
      return _this._webPoseState[Pose$1.HAND_LEFT].orientation;
    };
    this._handRightPosition = new InputSourcePosition();
    this._handRightPosition.getValue = function () {
      return _this._webPoseState[Pose$1.HAND_RIGHT].position;
    };
    this._handRightOrientation = new InputSourceOrientation();
    this._handRightOrientation.getValue = function () {
      return _this._webPoseState[Pose$1.HAND_RIGHT].orientation;
    };
    this._aimLeftPosition = new InputSourcePosition();
    this._aimLeftPosition.getValue = function () {
      return _this._webPoseState[Pose$1.AIM_LEFT].position;
    };
    this._aimLeftOrientation = new InputSourceOrientation();
    this._aimLeftOrientation.getValue = function () {
      return _this._webPoseState[Pose$1.AIM_LEFT].orientation;
    };
    this._aimRightPosition = new InputSourcePosition();
    this._aimRightPosition.getValue = function () {
      return _this._webPoseState[Pose$1.AIM_RIGHT].position;
    };
    this._aimRightOrientation = new InputSourceOrientation();
    this._aimRightOrientation.getValue = function () {
      return _this._webPoseState[Pose$1.AIM_RIGHT].orientation;
    };
  };
  return _createClass(GamepadInputDevice, [{
    key: "buttonNorth",
    get: function get() {
      return this._buttonNorth;
    }
  }, {
    key: "buttonEast",
    get: function get() {
      return this._buttonEast;
    }
  }, {
    key: "buttonWest",
    get: function get() {
      return this._buttonWest;
    }
  }, {
    key: "buttonSouth",
    get: function get() {
      return this._buttonSouth;
    }
  }, {
    key: "buttonL1",
    get: function get() {
      return this._buttonL1;
    }
  }, {
    key: "buttonL2",
    get: function get() {
      return this._buttonL2;
    }
  }, {
    key: "buttonL3",
    get: function get() {
      return this._buttonL3;
    }
  }, {
    key: "buttonR1",
    get: function get() {
      return this._buttonR1;
    }
  }, {
    key: "buttonR2",
    get: function get() {
      return this._buttonR2;
    }
  }, {
    key: "buttonR3",
    get: function get() {
      return this._buttonR3;
    }
  }, {
    key: "buttonShare",
    get: function get() {
      return this._buttonShare;
    }
  }, {
    key: "buttonOptions",
    get: function get() {
      return this._buttonOptions;
    }
  }, {
    key: "dpad",
    get: function get() {
      return this._dpad;
    }
  }, {
    key: "leftStick",
    get: function get() {
      return this._leftStick;
    }
  }, {
    key: "rightStick",
    get: function get() {
      return this._rightStick;
    }
  }, {
    key: "buttonStart",
    get: function get() {
      return this._buttonStart;
    }
  }, {
    key: "gripLeft",
    get: function get() {
      return this._gripLeft;
    }
  }, {
    key: "gripRight",
    get: function get() {
      return this._gripRight;
    }
  }, {
    key: "handLeftPosition",
    get: function get() {
      return this._handLeftPosition;
    }
  }, {
    key: "handLeftOrientation",
    get: function get() {
      return this._handLeftOrientation;
    }
  }, {
    key: "handRightPosition",
    get: function get() {
      return this._handRightPosition;
    }
  }, {
    key: "handRightOrientation",
    get: function get() {
      return this._handRightOrientation;
    }
  }, {
    key: "aimLeftPosition",
    get: function get() {
      return this._aimLeftPosition;
    }
  }, {
    key: "aimLeftOrientation",
    get: function get() {
      return this._aimLeftOrientation;
    }
  }, {
    key: "aimRightPosition",
    get: function get() {
      return this._aimRightPosition;
    }
  }, {
    key: "aimRightOrientation",
    get: function get() {
      return this._aimRightOrientation;
    }
  }, {
    key: "deviceId",
    get: function get() {
      return this._deviceId;
    }
  }, {
    key: "connected",
    get: function get() {
      return this._connected;
    }
  }]);
}();
GamepadInputDevice.all = [];
GamepadInputDevice.xr = null;
GamepadInputDevice._eventTarget = new EventTarget();
GamepadInputDevice._cachedWebGamepads = [];
GamepadInputDevice._cachedWebXRGamepadMap = null;
GamepadInputDevice._intervalId = -1;
GamepadInputDevice._totalGamepadCnt = 0;

var Button;
(function (Button) {
  Button[Button["BUTTON_EAST"] = 0] = "BUTTON_EAST";
  Button[Button["BUTTON_SOUTH"] = 1] = "BUTTON_SOUTH";
  Button[Button["BUTTON_WEST"] = 2] = "BUTTON_WEST";
  Button[Button["BUTTON_NORTH"] = 3] = "BUTTON_NORTH";
  Button[Button["BUTTON_TRIGGER_LEFT"] = 4] = "BUTTON_TRIGGER_LEFT";
  Button[Button["BUTTON_TRIGGER_RIGHT"] = 5] = "BUTTON_TRIGGER_RIGHT";
  Button[Button["TRIGGER_LEFT"] = 6] = "TRIGGER_LEFT";
  Button[Button["TRIGGER_RIGHT"] = 7] = "TRIGGER_RIGHT";
  Button[Button["GRIP_LEFT"] = 8] = "GRIP_LEFT";
  Button[Button["GRIP_RIGHT"] = 9] = "GRIP_RIGHT";
  Button[Button["BUTTON_LEFT_STICK"] = 10] = "BUTTON_LEFT_STICK";
  Button[Button["LEFT_STICK_UP"] = 11] = "LEFT_STICK_UP";
  Button[Button["LEFT_STICK_DOWN"] = 12] = "LEFT_STICK_DOWN";
  Button[Button["LEFT_STICK_LEFT"] = 13] = "LEFT_STICK_LEFT";
  Button[Button["LEFT_STICK_RIGHT"] = 14] = "LEFT_STICK_RIGHT";
  Button[Button["BUTTON_RIGHT_STICK"] = 15] = "BUTTON_RIGHT_STICK";
  Button[Button["RIGHT_STICK_UP"] = 16] = "RIGHT_STICK_UP";
  Button[Button["RIGHT_STICK_DOWN"] = 17] = "RIGHT_STICK_DOWN";
  Button[Button["RIGHT_STICK_LEFT"] = 18] = "RIGHT_STICK_LEFT";
  Button[Button["RIGHT_STICK_RIGHT"] = 19] = "RIGHT_STICK_RIGHT";
  Button[Button["ROKID_MENU"] = 20] = "ROKID_MENU";
  Button[Button["ROKID_START"] = 21] = "ROKID_START";
})(Button || (Button = {}));
var KeyEventType;
(function (KeyEventType) {
  KeyEventType[KeyEventType["KET_CLICK"] = 0] = "KET_CLICK";
  KeyEventType[KeyEventType["KET_STICK"] = 1] = "KET_STICK";
  KeyEventType[KeyEventType["KET_GRAB"] = 2] = "KET_GRAB";
  KeyEventType[KeyEventType["KET_TOUCH"] = 3] = "KET_TOUCH";
})(KeyEventType || (KeyEventType = {}));
var StickKeyCode;
(function (StickKeyCode) {
  StickKeyCode[StickKeyCode["UNDEFINE"] = 0] = "UNDEFINE";
  StickKeyCode[StickKeyCode["A"] = 1] = "A";
  StickKeyCode[StickKeyCode["B"] = 2] = "B";
  StickKeyCode[StickKeyCode["X"] = 3] = "X";
  StickKeyCode[StickKeyCode["Y"] = 4] = "Y";
  StickKeyCode[StickKeyCode["L1"] = 5] = "L1";
  StickKeyCode[StickKeyCode["R1"] = 6] = "R1";
  StickKeyCode[StickKeyCode["MINUS"] = 7] = "MINUS";
  StickKeyCode[StickKeyCode["PLUS"] = 8] = "PLUS";
  StickKeyCode[StickKeyCode["L3"] = 9] = "L3";
  StickKeyCode[StickKeyCode["R3"] = 10] = "R3";
  StickKeyCode[StickKeyCode["MENU"] = 11] = "MENU";
  StickKeyCode[StickKeyCode["START"] = 12] = "START";
  StickKeyCode[StickKeyCode["TRIGGER_LEFT"] = 13] = "TRIGGER_LEFT";
  StickKeyCode[StickKeyCode["TRIGGER_RIGHT"] = 14] = "TRIGGER_RIGHT";
})(StickKeyCode || (StickKeyCode = {}));
var StickAxisCode;
(function (StickAxisCode) {
  StickAxisCode[StickAxisCode["UNDEFINE"] = 0] = "UNDEFINE";
  StickAxisCode[StickAxisCode["X"] = 1] = "X";
  StickAxisCode[StickAxisCode["Y"] = 2] = "Y";
  StickAxisCode[StickAxisCode["LEFT_STICK_X"] = 3] = "LEFT_STICK_X";
  StickAxisCode[StickAxisCode["LEFT_STICK_Y"] = 4] = "LEFT_STICK_Y";
  StickAxisCode[StickAxisCode["RIGHT_STICK_X"] = 5] = "RIGHT_STICK_X";
  StickAxisCode[StickAxisCode["RIGHT_STICK_Y"] = 6] = "RIGHT_STICK_Y";
  StickAxisCode[StickAxisCode["L2"] = 7] = "L2";
  StickAxisCode[StickAxisCode["R2"] = 8] = "R2";
  StickAxisCode[StickAxisCode["LEFT_GRIP"] = 9] = "LEFT_GRIP";
  StickAxisCode[StickAxisCode["RIGHT_GRIP"] = 10] = "RIGHT_GRIP";
})(StickAxisCode || (StickAxisCode = {}));
var StickTouchCode;
(function (StickTouchCode) {
  StickTouchCode[StickTouchCode["UNDEFINE"] = 0] = "UNDEFINE";
  StickTouchCode[StickTouchCode["A"] = 1] = "A";
  StickTouchCode[StickTouchCode["B"] = 2] = "B";
  StickTouchCode[StickTouchCode["X"] = 3] = "X";
  StickTouchCode[StickTouchCode["Y"] = 4] = "Y";
  StickTouchCode[StickTouchCode["LEFT_TRIGGER"] = 5] = "LEFT_TRIGGER";
  StickTouchCode[StickTouchCode["RIGHT_TRIGGER"] = 6] = "RIGHT_TRIGGER";
  StickTouchCode[StickTouchCode["LEFT_THUMBSTICK"] = 7] = "LEFT_THUMBSTICK";
  StickTouchCode[StickTouchCode["RIGHT_THUMBSTICK"] = 8] = "RIGHT_THUMBSTICK";
})(StickTouchCode || (StickTouchCode = {}));
var _nativeButtonMap = {
  1: Button.BUTTON_EAST,
  2: Button.BUTTON_SOUTH,
  3: Button.BUTTON_NORTH,
  4: Button.BUTTON_WEST,
  9: Button.BUTTON_LEFT_STICK,
  10: Button.BUTTON_RIGHT_STICK,
  11: Button.ROKID_MENU,
  12: Button.ROKID_START,
  13: Button.BUTTON_TRIGGER_LEFT,
  14: Button.BUTTON_TRIGGER_RIGHT
};
var HandleInputDevice = function () {
  function HandleInputDevice() {
    var _this$_nativeButtonSt,
      _this$_nativeTouchSta,
      _this = this;
    this._eventTarget = new EventTarget();
    this._nativeButtonState = (_this$_nativeButtonSt = {}, _this$_nativeButtonSt[Button.BUTTON_SOUTH] = 0, _this$_nativeButtonSt[Button.BUTTON_EAST] = 0, _this$_nativeButtonSt[Button.BUTTON_WEST] = 0, _this$_nativeButtonSt[Button.BUTTON_NORTH] = 0, _this$_nativeButtonSt[Button.BUTTON_TRIGGER_LEFT] = 0, _this$_nativeButtonSt[Button.BUTTON_TRIGGER_RIGHT] = 0, _this$_nativeButtonSt[Button.TRIGGER_LEFT] = 0, _this$_nativeButtonSt[Button.TRIGGER_RIGHT] = 0, _this$_nativeButtonSt[Button.GRIP_LEFT] = 0, _this$_nativeButtonSt[Button.GRIP_RIGHT] = 0, _this$_nativeButtonSt[Button.LEFT_STICK_UP] = 0, _this$_nativeButtonSt[Button.LEFT_STICK_DOWN] = 0, _this$_nativeButtonSt[Button.LEFT_STICK_LEFT] = 0, _this$_nativeButtonSt[Button.LEFT_STICK_RIGHT] = 0, _this$_nativeButtonSt[Button.RIGHT_STICK_UP] = 0, _this$_nativeButtonSt[Button.RIGHT_STICK_DOWN] = 0, _this$_nativeButtonSt[Button.RIGHT_STICK_LEFT] = 0, _this$_nativeButtonSt[Button.RIGHT_STICK_RIGHT] = 0, _this$_nativeButtonSt[Button.BUTTON_LEFT_STICK] = 0, _this$_nativeButtonSt[Button.BUTTON_RIGHT_STICK] = 0, _this$_nativeButtonSt[Button.ROKID_MENU] = 0, _this$_nativeButtonSt[Button.ROKID_START] = 0, _this$_nativeButtonSt);
    this._nativeTouchState = (_this$_nativeTouchSta = {}, _this$_nativeTouchSta[StickTouchCode.UNDEFINE] = 0, _this$_nativeTouchSta[StickTouchCode.A] = 0, _this$_nativeTouchSta[StickTouchCode.B] = 0, _this$_nativeTouchSta[StickTouchCode.X] = 0, _this$_nativeTouchSta[StickTouchCode.Y] = 0, _this$_nativeTouchSta[StickTouchCode.LEFT_TRIGGER] = 0, _this$_nativeTouchSta[StickTouchCode.RIGHT_TRIGGER] = 0, _this$_nativeTouchSta[StickTouchCode.LEFT_THUMBSTICK] = 0, _this$_nativeTouchSta[StickTouchCode.RIGHT_THUMBSTICK] = 0, _this$_nativeTouchSta);
    this._initInputSource();
    window.addEventListener('xr-remote-input', function (evt) {
      var remoteInputEvent = evt;
      var keyEventType = remoteInputEvent.detail.keyEventType;
      var stickAxisCode = remoteInputEvent.detail.stickAxisCode;
      var stickAxisValue = remoteInputEvent.detail.stickAxisValue;
      var stickKeyCode = remoteInputEvent.detail.stickKeyCode;
      var isButtonPressed = remoteInputEvent.detail.isButtonPressed;
      var touchCode = remoteInputEvent.detail.touchCode;
      var touchValue = remoteInputEvent.detail.touchValue;
      if (keyEventType === KeyEventType.KET_CLICK) {
        var button = _nativeButtonMap[stickKeyCode];
        _this._nativeButtonState[button] = isButtonPressed ? 1 : 0;
      } else if (keyEventType === KeyEventType.KET_STICK || keyEventType === KeyEventType.KET_GRAB) {
        var negativeButton;
        var positiveButton;
        var axisValue;
        switch (stickAxisCode) {
          case StickAxisCode.LEFT_STICK_X:
            negativeButton = Button.LEFT_STICK_LEFT;
            positiveButton = Button.LEFT_STICK_RIGHT;
            axisValue = _this._axisToButtons(stickAxisValue);
            break;
          case StickAxisCode.LEFT_STICK_Y:
            negativeButton = Button.LEFT_STICK_DOWN;
            positiveButton = Button.LEFT_STICK_UP;
            axisValue = _this._axisToButtons(stickAxisValue);
            break;
          case StickAxisCode.RIGHT_STICK_X:
            negativeButton = Button.RIGHT_STICK_LEFT;
            positiveButton = Button.RIGHT_STICK_RIGHT;
            axisValue = _this._axisToButtons(stickAxisValue);
            break;
          case StickAxisCode.RIGHT_STICK_Y:
            negativeButton = Button.RIGHT_STICK_DOWN;
            positiveButton = Button.RIGHT_STICK_UP;
            axisValue = _this._axisToButtons(stickAxisValue);
            break;
          case StickAxisCode.L2:
            _this._nativeButtonState[Button.TRIGGER_LEFT] = stickAxisValue;
            break;
          case StickAxisCode.R2:
            _this._nativeButtonState[Button.TRIGGER_RIGHT] = stickAxisValue;
            break;
          case StickAxisCode.LEFT_GRIP:
            _this._nativeButtonState[Button.GRIP_LEFT] = stickAxisValue;
            break;
          case StickAxisCode.RIGHT_GRIP:
            _this._nativeButtonState[Button.GRIP_RIGHT] = stickAxisValue;
            break;
        }
        if (negativeButton && positiveButton && axisValue) {
          _this._nativeButtonState[negativeButton] = axisValue.negative;
          _this._nativeButtonState[positiveButton] = axisValue.positive;
        }
      } else if (keyEventType === KeyEventType.KET_TOUCH) {
        switch (touchCode) {
          case StickTouchCode.A:
          case StickTouchCode.B:
          case StickTouchCode.X:
          case StickTouchCode.Y:
          case StickTouchCode.LEFT_TRIGGER:
          case StickTouchCode.RIGHT_TRIGGER:
          case StickTouchCode.LEFT_THUMBSTICK:
          case StickTouchCode.RIGHT_THUMBSTICK:
            _this._nativeTouchState[touchCode] = touchValue;
            break;
        }
      }
      _this._eventTarget.emit(InputEventType.HANDLE_INPUT, new EventHandle(InputEventType.HANDLE_INPUT, _this));
    });
  }
  var _proto = HandleInputDevice.prototype;
  _proto._axisToButtons = function _axisToButtons(axisValue) {
    var value = Math.abs(axisValue);
    if (axisValue > 0) {
      return {
        negative: 0,
        positive: value
      };
    } else if (axisValue < 0) {
      return {
        negative: value,
        positive: 0
      };
    } else {
      return {
        negative: 0,
        positive: 0
      };
    }
  };
  _proto._on = function _on(eventType, callback, target) {
    this._eventTarget.on(eventType, callback, target);
  };
  _proto._initInputSource = function _initInputSource() {
    var _this2 = this;
    this._buttonNorth = new InputSourceButton();
    this._buttonNorth.getValue = function () {
      return _this2._nativeButtonState[Button.BUTTON_NORTH];
    };
    this._buttonEast = new InputSourceButton();
    this._buttonEast.getValue = function () {
      return _this2._nativeButtonState[Button.BUTTON_EAST];
    };
    this._buttonWest = new InputSourceButton();
    this._buttonWest.getValue = function () {
      return _this2._nativeButtonState[Button.BUTTON_WEST];
    };
    this._buttonSouth = new InputSourceButton();
    this._buttonSouth.getValue = function () {
      return _this2._nativeButtonState[Button.BUTTON_SOUTH];
    };
    this._buttonTriggerLeft = new InputSourceButton();
    this._buttonTriggerLeft.getValue = function () {
      return _this2._nativeButtonState[Button.BUTTON_TRIGGER_LEFT];
    };
    this._buttonTriggerRight = new InputSourceButton();
    this._buttonTriggerRight.getValue = function () {
      return _this2._nativeButtonState[Button.BUTTON_TRIGGER_RIGHT];
    };
    this._triggerLeft = new InputSourceButton();
    this._triggerLeft.getValue = function () {
      return _this2._nativeButtonState[Button.TRIGGER_LEFT];
    };
    this._triggerRight = new InputSourceButton();
    this._triggerRight.getValue = function () {
      return _this2._nativeButtonState[Button.TRIGGER_RIGHT];
    };
    this._gripLeft = new InputSourceButton();
    this._gripLeft.getValue = function () {
      return _this2._nativeButtonState[Button.GRIP_LEFT];
    };
    this._gripRight = new InputSourceButton();
    this._gripRight.getValue = function () {
      return _this2._nativeButtonState[Button.GRIP_RIGHT];
    };
    this._buttonLeftStick = new InputSourceButton();
    this._buttonLeftStick.getValue = function () {
      return _this2._nativeButtonState[Button.BUTTON_LEFT_STICK];
    };
    var leftStickUp = new InputSourceButton();
    leftStickUp.getValue = function () {
      return _this2._nativeButtonState[Button.LEFT_STICK_UP];
    };
    var leftStickDown = new InputSourceButton();
    leftStickDown.getValue = function () {
      return _this2._nativeButtonState[Button.LEFT_STICK_DOWN];
    };
    var leftStickLeft = new InputSourceButton();
    leftStickLeft.getValue = function () {
      return _this2._nativeButtonState[Button.LEFT_STICK_LEFT];
    };
    var leftStickRight = new InputSourceButton();
    leftStickRight.getValue = function () {
      return _this2._nativeButtonState[Button.LEFT_STICK_RIGHT];
    };
    this._leftStick = new InputSourceStick({
      up: leftStickUp,
      down: leftStickDown,
      left: leftStickLeft,
      right: leftStickRight
    });
    this._buttonRightStick = new InputSourceButton();
    this._buttonRightStick.getValue = function () {
      return _this2._nativeButtonState[Button.BUTTON_RIGHT_STICK];
    };
    var rightStickUp = new InputSourceButton();
    rightStickUp.getValue = function () {
      return _this2._nativeButtonState[Button.RIGHT_STICK_UP];
    };
    var rightStickDown = new InputSourceButton();
    rightStickDown.getValue = function () {
      return _this2._nativeButtonState[Button.RIGHT_STICK_DOWN];
    };
    var rightStickLeft = new InputSourceButton();
    rightStickLeft.getValue = function () {
      return _this2._nativeButtonState[Button.RIGHT_STICK_LEFT];
    };
    var rightStickRight = new InputSourceButton();
    rightStickRight.getValue = function () {
      return _this2._nativeButtonState[Button.RIGHT_STICK_RIGHT];
    };
    this._rightStick = new InputSourceStick({
      up: rightStickUp,
      down: rightStickDown,
      left: rightStickLeft,
      right: rightStickRight
    });
    this._buttonOptions = new InputSourceButton();
    this._buttonOptions.getValue = function () {
      return _this2._nativeButtonState[Button.ROKID_MENU];
    };
    this._buttonStart = new InputSourceButton();
    this._buttonStart.getValue = function () {
      return _this2._nativeButtonState[Button.ROKID_START];
    };
    this._handLeftPosition = new InputSourcePosition();
    this._handLeftPosition.getValue = function () {
      return Vec3.ZERO;
    };
    this._handLeftOrientation = new InputSourceOrientation();
    this._handLeftOrientation.getValue = function () {
      return Quat.IDENTITY;
    };
    this._handRightPosition = new InputSourcePosition();
    this._handRightPosition.getValue = function () {
      return Vec3.ZERO;
    };
    this._handRightOrientation = new InputSourceOrientation();
    this._handRightOrientation.getValue = function () {
      return Quat.IDENTITY;
    };
    this._aimLeftPosition = new InputSourcePosition();
    this._aimLeftPosition.getValue = function () {
      return Vec3.ZERO;
    };
    this._aimLeftOrientation = new InputSourceOrientation();
    this._aimLeftOrientation.getValue = function () {
      return Quat.IDENTITY;
    };
    this._aimRightPosition = new InputSourcePosition();
    this._aimRightPosition.getValue = function () {
      return Vec3.ZERO;
    };
    this._aimRightOrientation = new InputSourceOrientation();
    this._aimRightOrientation.getValue = function () {
      return Quat.IDENTITY;
    };
    this._touchButtonA = new InputSourceTouch();
    this._touchButtonA.getValue = function () {
      return _this2._nativeTouchState[StickTouchCode.A];
    };
    this._touchButtonB = new InputSourceTouch();
    this._touchButtonB.getValue = function () {
      return _this2._nativeTouchState[StickTouchCode.B];
    };
    this._touchButtonX = new InputSourceTouch();
    this._touchButtonX.getValue = function () {
      return _this2._nativeTouchState[StickTouchCode.X];
    };
    this._touchButtonY = new InputSourceTouch();
    this._touchButtonY.getValue = function () {
      return _this2._nativeTouchState[StickTouchCode.Y];
    };
    this._touchButtonTriggerLeft = new InputSourceTouch();
    this._touchButtonTriggerLeft.getValue = function () {
      return _this2._nativeTouchState[StickTouchCode.LEFT_TRIGGER];
    };
    this._touchButtonTriggerRight = new InputSourceTouch();
    this._touchButtonTriggerRight.getValue = function () {
      return _this2._nativeTouchState[StickTouchCode.RIGHT_TRIGGER];
    };
    this._touchButtonThumbStickLeft = new InputSourceTouch();
    this._touchButtonThumbStickLeft.getValue = function () {
      return _this2._nativeTouchState[StickTouchCode.LEFT_THUMBSTICK];
    };
    this._touchButtonThumbStickRight = new InputSourceTouch();
    this._touchButtonThumbStickRight.getValue = function () {
      return _this2._nativeTouchState[StickTouchCode.RIGHT_THUMBSTICK];
    };
  };
  return _createClass(HandleInputDevice, [{
    key: "buttonNorth",
    get: function get() {
      return this._buttonNorth;
    }
  }, {
    key: "buttonEast",
    get: function get() {
      return this._buttonEast;
    }
  }, {
    key: "buttonWest",
    get: function get() {
      return this._buttonWest;
    }
  }, {
    key: "buttonSouth",
    get: function get() {
      return this._buttonSouth;
    }
  }, {
    key: "buttonTriggerLeft",
    get: function get() {
      return this._buttonTriggerLeft;
    }
  }, {
    key: "buttonTriggerRight",
    get: function get() {
      return this._buttonTriggerRight;
    }
  }, {
    key: "triggerLeft",
    get: function get() {
      return this._triggerLeft;
    }
  }, {
    key: "triggerRight",
    get: function get() {
      return this._triggerRight;
    }
  }, {
    key: "gripLeft",
    get: function get() {
      return this._gripLeft;
    }
  }, {
    key: "gripRight",
    get: function get() {
      return this._gripRight;
    }
  }, {
    key: "leftStick",
    get: function get() {
      return this._leftStick;
    }
  }, {
    key: "rightStick",
    get: function get() {
      return this._rightStick;
    }
  }, {
    key: "buttonLeftStick",
    get: function get() {
      return this._buttonLeftStick;
    }
  }, {
    key: "buttonRightStick",
    get: function get() {
      return this._buttonRightStick;
    }
  }, {
    key: "buttonOptions",
    get: function get() {
      return this._buttonOptions;
    }
  }, {
    key: "buttonStart",
    get: function get() {
      return this._buttonStart;
    }
  }, {
    key: "handLeftPosition",
    get: function get() {
      return this._handLeftPosition;
    }
  }, {
    key: "handLeftOrientation",
    get: function get() {
      return this._handLeftOrientation;
    }
  }, {
    key: "handRightPosition",
    get: function get() {
      return this._handRightPosition;
    }
  }, {
    key: "handRightOrientation",
    get: function get() {
      return this._handRightOrientation;
    }
  }, {
    key: "aimLeftPosition",
    get: function get() {
      return this._aimLeftPosition;
    }
  }, {
    key: "aimLeftOrientation",
    get: function get() {
      return this._aimLeftOrientation;
    }
  }, {
    key: "aimRightPosition",
    get: function get() {
      return this._aimRightPosition;
    }
  }, {
    key: "aimRightOrientation",
    get: function get() {
      return this._aimRightOrientation;
    }
  }, {
    key: "touchButtonA",
    get: function get() {
      return this._touchButtonA;
    }
  }, {
    key: "touchButtonB",
    get: function get() {
      return this._touchButtonB;
    }
  }, {
    key: "touchButtonX",
    get: function get() {
      return this._touchButtonX;
    }
  }, {
    key: "touchButtonY",
    get: function get() {
      return this._touchButtonY;
    }
  }, {
    key: "touchButtonTriggerLeft",
    get: function get() {
      return this._touchButtonTriggerLeft;
    }
  }, {
    key: "touchButtonTriggerRight",
    get: function get() {
      return this._touchButtonTriggerRight;
    }
  }, {
    key: "touchButtonThumbStickLeft",
    get: function get() {
      return this._touchButtonThumbStickLeft;
    }
  }, {
    key: "touchButtonThumbStickRight",
    get: function get() {
      return this._touchButtonThumbStickRight;
    }
  }]);
}();

var Pose;
(function (Pose) {
  Pose[Pose["VIEW_LEFT"] = 0] = "VIEW_LEFT";
  Pose[Pose["VIEW_RIGHT"] = 3] = "VIEW_RIGHT";
  Pose[Pose["HEAD_MIDDLE"] = 6] = "HEAD_MIDDLE";
})(Pose || (Pose = {}));
var HMDInputDevice = function () {
  function HMDInputDevice() {
    var _this$_webPoseState;
    this._eventTarget = new EventTarget();
    this._intervalId = -1;
    this._webPoseState = (_this$_webPoseState = {}, _this$_webPoseState[Pose.VIEW_LEFT] = {
      position: Vec3.ZERO,
      orientation: Quat.IDENTITY
    }, _this$_webPoseState[Pose.VIEW_RIGHT] = {
      position: Vec3.ZERO,
      orientation: Quat.IDENTITY
    }, _this$_webPoseState[Pose.HEAD_MIDDLE] = {
      position: Vec3.ZERO,
      orientation: Quat.IDENTITY
    }, _this$_webPoseState);
    this._initInputSource();
    this._registerEvent();
  }
  var _proto = HMDInputDevice.prototype;
  _proto._ensureDirectorDefined = function _ensureDirectorDefined() {
    var _this = this;
    return new Promise(function (resolve) {
      _this._intervalId = setInterval(function () {
        if (legacyCC.director && legacyCC.Director) {
          clearInterval(_this._intervalId);
          _this._intervalId = -1;
          resolve();
        }
      }, 50);
    });
  };
  _proto._registerEvent = function _registerEvent() {
    var _this2 = this;
    this._ensureDirectorDefined().then(function () {
      legacyCC.director.on(legacyCC.Director.EVENT_BEGIN_FRAME, _this2._scanHmd, _this2);
    })["catch"](function (e) {});
  };
  _proto._scanHmd = function _scanHmd() {
    var _globalThis$__globalX;
    var infoList = (_globalThis$__globalX = globalThis.__globalXR) == null ? void 0 : _globalThis$__globalX.webxrHmdPoseInfos;
    if (!infoList) {
      return;
    }
    for (var i = 0; i < infoList.length; ++i) {
      var info = infoList[i];
      this._updateWebPoseState(info);
    }
    this._eventTarget.emit(InputEventType.HMD_POSE_INPUT, new EventHMD(InputEventType.HMD_POSE_INPUT, this));
  };
  _proto._on = function _on(eventType, callback, target) {
    this._eventTarget.on(eventType, callback, target);
  };
  _proto._updateWebPoseState = function _updateWebPoseState(info) {
    if (info.code !== Pose.VIEW_LEFT && info.code !== Pose.VIEW_RIGHT && info.code !== Pose.HEAD_MIDDLE) {
      return;
    }
    this._webPoseState[info.code] = {
      position: new Vec3(info.position.x, info.position.y, info.position.z),
      orientation: new Quat(info.orientation.x, info.orientation.y, info.orientation.z, info.orientation.w)
    };
  };
  _proto._initInputSource = function _initInputSource() {
    var _this3 = this;
    this._viewLeftPosition = new InputSourcePosition();
    this._viewLeftPosition.getValue = function () {
      return _this3._webPoseState[Pose.VIEW_LEFT].position;
    };
    this._viewLeftOrientation = new InputSourceOrientation();
    this._viewLeftOrientation.getValue = function () {
      return _this3._webPoseState[Pose.VIEW_LEFT].orientation;
    };
    this._viewRightPosition = new InputSourcePosition();
    this._viewRightPosition.getValue = function () {
      return _this3._webPoseState[Pose.VIEW_RIGHT].position;
    };
    this._viewRightOrientation = new InputSourceOrientation();
    this._viewRightOrientation.getValue = function () {
      return _this3._webPoseState[Pose.VIEW_RIGHT].orientation;
    };
    this._headMiddlePosition = new InputSourcePosition();
    this._headMiddlePosition.getValue = function () {
      return _this3._webPoseState[Pose.HEAD_MIDDLE].position;
    };
    this._headMiddleOrientation = new InputSourceOrientation();
    this._headMiddleOrientation.getValue = function () {
      return _this3._webPoseState[Pose.HEAD_MIDDLE].orientation;
    };
  };
  return _createClass(HMDInputDevice, [{
    key: "viewLeftPosition",
    get: function get() {
      return this._viewLeftPosition;
    }
  }, {
    key: "viewLeftOrientation",
    get: function get() {
      return this._viewLeftOrientation;
    }
  }, {
    key: "viewRightPosition",
    get: function get() {
      return this._viewRightPosition;
    }
  }, {
    key: "viewRightOrientation",
    get: function get() {
      return this._viewRightOrientation;
    }
  }, {
    key: "headMiddlePosition",
    get: function get() {
      return this._headMiddlePosition;
    }
  }, {
    key: "headMiddleOrientation",
    get: function get() {
      return this._headMiddleOrientation;
    }
  }]);
}();

var HandheldInputDevice = function () {
  function HandheldInputDevice() {
    this._eventTarget = new EventTarget();
    this._initInputSource();
  }
  var _proto = HandheldInputDevice.prototype;
  _proto._on = function _on(eventType, callback, target) {
    this._eventTarget.on(eventType, callback, target);
  };
  _proto._initInputSource = function _initInputSource() {
    this._handheldPosition = new InputSourcePosition();
    this._handheldPosition.getValue = function () {
      return Vec3.ZERO;
    };
    this._handheldOrientation = new InputSourceOrientation();
    this._handheldOrientation.getValue = function () {
      return Quat.IDENTITY;
    };
  };
  return _createClass(HandheldInputDevice, [{
    key: "handheldPosition",
    get: function get() {
      return this._handheldPosition;
    }
  }, {
    key: "handheldOrientation",
    get: function get() {
      return this._handheldOrientation;
    }
  }]);
}();

var code2KeyCode = {
  Backspace: KeyCode.BACKSPACE,
  Tab: KeyCode.TAB,
  Enter: KeyCode.ENTER,
  ShiftLeft: KeyCode.SHIFT_LEFT,
  ControlLeft: KeyCode.CTRL_LEFT,
  AltLeft: KeyCode.ALT_LEFT,
  ShiftRight: KeyCode.SHIFT_RIGHT,
  ControlRight: KeyCode.CTRL_RIGHT,
  AltRight: KeyCode.ALT_RIGHT,
  Pause: KeyCode.PAUSE,
  CapsLock: KeyCode.CAPS_LOCK,
  Escape: KeyCode.ESCAPE,
  Space: KeyCode.SPACE,
  PageUp: KeyCode.PAGE_UP,
  PageDown: KeyCode.PAGE_DOWN,
  End: KeyCode.END,
  Home: KeyCode.HOME,
  ArrowLeft: KeyCode.ARROW_LEFT,
  ArrowUp: KeyCode.ARROW_UP,
  ArrowRight: KeyCode.ARROW_RIGHT,
  ArrowDown: KeyCode.ARROW_DOWN,
  Insert: KeyCode.INSERT,
  Delete: KeyCode.DELETE,
  Digit0: KeyCode.DIGIT_0,
  Digit1: KeyCode.DIGIT_1,
  Digit2: KeyCode.DIGIT_2,
  Digit3: KeyCode.DIGIT_3,
  Digit4: KeyCode.DIGIT_4,
  Digit5: KeyCode.DIGIT_5,
  Digit6: KeyCode.DIGIT_6,
  Digit7: KeyCode.DIGIT_7,
  Digit8: KeyCode.DIGIT_8,
  Digit9: KeyCode.DIGIT_9,
  KeyA: KeyCode.KEY_A,
  KeyB: KeyCode.KEY_B,
  KeyC: KeyCode.KEY_C,
  KeyD: KeyCode.KEY_D,
  KeyE: KeyCode.KEY_E,
  KeyF: KeyCode.KEY_F,
  KeyG: KeyCode.KEY_G,
  KeyH: KeyCode.KEY_H,
  KeyI: KeyCode.KEY_I,
  KeyJ: KeyCode.KEY_J,
  KeyK: KeyCode.KEY_K,
  KeyL: KeyCode.KEY_L,
  KeyM: KeyCode.KEY_M,
  KeyN: KeyCode.KEY_N,
  KeyO: KeyCode.KEY_O,
  KeyP: KeyCode.KEY_P,
  KeyQ: KeyCode.KEY_Q,
  KeyR: KeyCode.KEY_R,
  KeyS: KeyCode.KEY_S,
  KeyT: KeyCode.KEY_T,
  KeyU: KeyCode.KEY_U,
  KeyV: KeyCode.KEY_V,
  KeyW: KeyCode.KEY_W,
  KeyX: KeyCode.KEY_X,
  KeyY: KeyCode.KEY_Y,
  KeyZ: KeyCode.KEY_Z,
  Numpad0: KeyCode.NUM_0,
  Numpad1: KeyCode.NUM_1,
  Numpad2: KeyCode.NUM_2,
  Numpad3: KeyCode.NUM_3,
  Numpad4: KeyCode.NUM_4,
  Numpad5: KeyCode.NUM_5,
  Numpad6: KeyCode.NUM_6,
  Numpad7: KeyCode.NUM_7,
  Numpad8: KeyCode.NUM_8,
  Numpad9: KeyCode.NUM_9,
  NumpadMultiply: KeyCode.NUM_MULTIPLY,
  NumpadAdd: KeyCode.NUM_PLUS,
  NumpadSubtract: KeyCode.NUM_SUBTRACT,
  NumpadDecimal: KeyCode.NUM_DECIMAL,
  NumpadDivide: KeyCode.NUM_DIVIDE,
  NumpadEnter: KeyCode.NUM_ENTER,
  F1: KeyCode.F1,
  F2: KeyCode.F2,
  F3: KeyCode.F3,
  F4: KeyCode.F4,
  F5: KeyCode.F5,
  F6: KeyCode.F6,
  F7: KeyCode.F7,
  F8: KeyCode.F8,
  F9: KeyCode.F9,
  F10: KeyCode.F10,
  F11: KeyCode.F11,
  F12: KeyCode.F12,
  NumLock: KeyCode.NUM_LOCK,
  ScrollLock: KeyCode.SCROLL_LOCK,
  Semicolon: KeyCode.SEMICOLON,
  Equal: KeyCode.EQUAL,
  Comma: KeyCode.COMMA,
  Minus: KeyCode.DASH,
  Period: KeyCode.PERIOD,
  Slash: KeyCode.SLASH,
  Backquote: KeyCode.BACK_QUOTE,
  BracketLeft: KeyCode.BRACKET_LEFT,
  Backslash: KeyCode.BACKSLASH,
  BracketRight: KeyCode.BRACKET_RIGHT,
  Quote: KeyCode.QUOTE
};

function getKeyCode(code) {
  return code2KeyCode[code] || KeyCode.NONE;
}
var KeyboardInputSource = function () {
  function KeyboardInputSource() {
    this._eventTarget = new EventTarget();
    this._registerEvent();
  }
  var _proto = KeyboardInputSource.prototype;
  _proto.dispatchKeyboardDownEvent = function dispatchKeyboardDownEvent(nativeKeyboardEvent) {
    this._handleKeyboardDown(nativeKeyboardEvent);
  };
  _proto.dispatchKeyboardUpEvent = function dispatchKeyboardUpEvent(nativeKeyboardEvent) {
    this._handleKeyboardUp(nativeKeyboardEvent);
  };
  _proto.on = function on(eventType, callback, target) {
    this._eventTarget.on(eventType, callback, target);
  };
  _proto._registerEvent = function _registerEvent() {
    var canvas = document.getElementById('GameCanvas');
    canvas == null ? void 0 : canvas.addEventListener('keydown', this._handleKeyboardDown.bind(this));
    canvas == null ? void 0 : canvas.addEventListener('keyup', this._handleKeyboardUp.bind(this));
  };
  _proto._getInputEvent = function _getInputEvent(event, eventType) {
    var keyCode = getKeyCode(event.code);
    var eventKeyboard = new EventKeyboard(keyCode, eventType);
    return eventKeyboard;
  };
  _proto._handleKeyboardDown = function _handleKeyboardDown(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!event.repeat) {
      var keyDownInputEvent = this._getInputEvent(event, InputEventType.KEY_DOWN);
      this._eventTarget.emit(InputEventType.KEY_DOWN, keyDownInputEvent);
    } else {
      var keyPressingInputEvent = this._getInputEvent(event, InputEventType.KEY_PRESSING);
      this._eventTarget.emit(InputEventType.KEY_PRESSING, keyPressingInputEvent);
    }
  };
  _proto._handleKeyboardUp = function _handleKeyboardUp(event) {
    var inputEvent = this._getInputEvent(event, InputEventType.KEY_UP);
    event.stopPropagation();
    event.preventDefault();
    this._eventTarget.emit(InputEventType.KEY_UP, inputEvent);
  };
  return KeyboardInputSource;
}();

var MouseInputSource = function () {
  function MouseInputSource() {
    this._canvas = void 0;
    this._eventTarget = new EventTarget();
    this._pointLocked = false;
    this._isPressed = false;
    this._preMousePos = new Vec2();
    this._handleMouseDown = void 0;
    this._handleMouseMove = void 0;
    this._handleMouseUp = void 0;
    if (systemInfo.hasFeature(Feature.EVENT_MOUSE)) {
      this._canvas = document.getElementById('GameCanvas');
      if (!this._canvas && !TEST && !EDITOR) {
        warn('failed to access canvas');
      }
      this._handleMouseDown = this._createCallback(InputEventType.MOUSE_DOWN);
      this._handleMouseMove = this._createCallback(InputEventType.MOUSE_MOVE);
      this._handleMouseUp = this._createCallback(InputEventType.MOUSE_UP);
      {
        this._registerEvent();
      }
    }
  }
  var _proto = MouseInputSource.prototype;
  _proto.dispatchMouseDownEvent = function dispatchMouseDownEvent(nativeMouseEvent) {
    this._handleMouseDown(nativeMouseEvent);
  };
  _proto.dispatchMouseMoveEvent = function dispatchMouseMoveEvent(nativeMouseEvent) {
    this._handleMouseMove(nativeMouseEvent);
  };
  _proto.dispatchMouseUpEvent = function dispatchMouseUpEvent(nativeMouseEvent) {
    this._handleMouseUp(nativeMouseEvent);
  };
  _proto.dispatchScrollEvent = function dispatchScrollEvent(nativeMouseEvent) {
    this._handleMouseWheel(nativeMouseEvent);
  };
  _proto.on = function on(eventType, callback, target) {
    this._eventTarget.on(eventType, callback, target);
  };
  _proto._getCanvasRect = function _getCanvasRect() {
    var canvas = this._canvas;
    var box = canvas == null ? void 0 : canvas.getBoundingClientRect();
    if (box) {
      return new Rect(box.x, box.y, box.width, box.height);
    }
    return new Rect(0, 0, 0, 0);
  };
  _proto._getLocation = function _getLocation(mouseEvent) {
    var canvasRect = this._getCanvasRect();
    var dpr = screenAdapter.devicePixelRatio;
    var x = this._pointLocked ? this._preMousePos.x / dpr + mouseEvent.movementX : mouseEvent.clientX - canvasRect.x;
    var y = this._pointLocked ? this._preMousePos.y / dpr - mouseEvent.movementY : canvasRect.y + canvasRect.height - mouseEvent.clientY;
    x *= dpr;
    y *= dpr;
    return new Vec2(x, y);
  };
  _proto._registerEvent = function _registerEvent() {
    var _this = this,
      _this$_canvas,
      _this$_canvas2,
      _this$_canvas3,
      _this$_canvas4,
      _this$_canvas5,
      _this$_canvas6;
    window.addEventListener('mousedown', function () {
      _this._isPressed = true;
    });
    (_this$_canvas = this._canvas) == null ? void 0 : _this$_canvas.addEventListener('mousedown', this._handleMouseDown);
    (_this$_canvas2 = this._canvas) == null ? void 0 : _this$_canvas2.addEventListener('mousemove', this._handleMouseMove);
    window.addEventListener('mouseup', this._handleMouseUp);
    (_this$_canvas3 = this._canvas) == null ? void 0 : _this$_canvas3.addEventListener('mouseup', this._handleMouseUp);
    (_this$_canvas4 = this._canvas) == null ? void 0 : _this$_canvas4.addEventListener('wheel', this._handleMouseWheel.bind(this));
    this._registerPointerLockEvent();
    (_this$_canvas5 = this._canvas) == null ? void 0 : _this$_canvas5.addEventListener('mouseleave', this._handleMouseLeave.bind(this));
    (_this$_canvas6 = this._canvas) == null ? void 0 : _this$_canvas6.addEventListener('mouseenter', this._handleMouseEnter.bind(this));
  };
  _proto._registerPointerLockEvent = function _registerPointerLockEvent() {
    var _this2 = this;
    var lockChangeAlert = function lockChangeAlert() {
      var canvas = _this2._canvas;
      if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
        _this2._pointLocked = true;
      } else {
        _this2._pointLocked = false;
      }
    };
    if ('onpointerlockchange' in document) {
      document.addEventListener('pointerlockchange', lockChangeAlert, false);
    } else if ('onmozpointerlockchange' in document) {
      document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    }
  };
  _proto._createCallback = function _createCallback(eventType) {
    var _this3 = this;
    return function (mouseEvent) {
      var _this3$_canvas;
      var location = _this3._getLocation(mouseEvent);
      var button = mouseEvent.button,
        buttons = mouseEvent.buttons;
      var targetButton = button;
      switch (eventType) {
        case InputEventType.MOUSE_DOWN:
          (_this3$_canvas = _this3._canvas) == null ? void 0 : _this3$_canvas.focus();
          _this3._isPressed = true;
          break;
        case InputEventType.MOUSE_UP:
          _this3._isPressed = false;
          break;
        case InputEventType.MOUSE_MOVE:
          if (1 & buttons) {
            targetButton = EventMouse.BUTTON_LEFT;
          } else if (2 & buttons) {
            targetButton = EventMouse.BUTTON_RIGHT;
          } else if (4 & buttons) {
            targetButton = EventMouse.BUTTON_MIDDLE;
          } else {
            targetButton = EventMouse.BUTTON_MISSING;
          }
          break;
      }
      var eventMouse = new EventMouse(eventType, false, _this3._preMousePos);
      eventMouse.setLocation(location.x, location.y);
      eventMouse.setButton(targetButton);
      eventMouse.movementX = mouseEvent.movementX;
      eventMouse.movementY = mouseEvent.movementY;
      _this3._preMousePos.set(location.x, location.y);
      mouseEvent.stopPropagation();
      if (mouseEvent.target === _this3._canvas) {
        mouseEvent.preventDefault();
      }
      _this3._eventTarget.emit(eventType, eventMouse);
    };
  };
  _proto._handleMouseWheel = function _handleMouseWheel(mouseEvent) {
    var eventType = InputEventType.MOUSE_WHEEL;
    var location = this._getLocation(mouseEvent);
    var button = mouseEvent.button;
    var eventMouse = new EventMouse(eventType, false, this._preMousePos);
    eventMouse.setLocation(location.x, location.y);
    eventMouse.setButton(button);
    eventMouse.movementX = mouseEvent.movementX;
    eventMouse.movementY = mouseEvent.movementY;
    var wheelSensitivityFactor = 5;
    eventMouse.setScrollData(mouseEvent.deltaX * wheelSensitivityFactor, -mouseEvent.deltaY * wheelSensitivityFactor);
    this._preMousePos.set(location.x, location.y);
    mouseEvent.stopPropagation();
    if (mouseEvent.target === this._canvas) {
      mouseEvent.preventDefault();
    }
    this._eventTarget.emit(eventType, eventMouse);
  };
  _proto._handleMouseLeave = function _handleMouseLeave(mouseEvent) {
    var eventType = InputEventType.MOUSE_LEAVE;
    var eventMouse = new EventMouse(eventType, false);
    this._eventTarget.emit(eventType, eventMouse);
  };
  _proto._handleMouseEnter = function _handleMouseEnter(mouseEvent) {
    var eventType = InputEventType.MOUSE_ENTER;
    var eventMouse = new EventMouse(eventType, false);
    this._eventTarget.emit(eventType, eventMouse);
  };
  _proto.dispatchEventsInCache = function dispatchEventsInCache() {};
  return MouseInputSource;
}();

var tempVec2 = new Vec2();
var TouchManager = function () {
  function TouchManager() {
    this._touchMap = new Map();
    this._maxTouches = 8;
  }
  var _proto = TouchManager.prototype;
  _proto._createTouch = function _createTouch(touchID, x, y) {
    if (this._touchMap.has(touchID)) {
      logID(2301);
      return undefined;
    }
    var checkResult = this._checkTouchMapSizeMoreThanMax(touchID);
    if (checkResult) {
      logID(2300);
      return undefined;
    }
    var touch = new Touch(x, y, touchID);
    this._touchMap.set(touchID, touch);
    this._updateTouch(touch, x, y);
    return touch;
  };
  _proto.releaseTouch = function releaseTouch(touchID) {
    if (!this._touchMap.has(touchID)) {
      return;
    }
    this._touchMap["delete"](touchID);
  };
  _proto.getTouch = function getTouch(touchID) {
    return this._touchMap.get(touchID);
  };
  _proto.getOrCreateTouch = function getOrCreateTouch(touchID, x, y) {
    var touch = this.getTouch(touchID);
    if (!touch) {
      touch = this._createTouch(touchID, x, y);
    } else {
      this._updateTouch(touch, x, y);
    }
    return touch;
  };
  _proto.getAllTouches = function getAllTouches() {
    var touches = [];
    this._touchMap.forEach(function (touch) {
      if (touch) {
        touches.push(touch);
      }
    });
    return touches;
  };
  _proto.getTouchCount = function getTouchCount() {
    return this._touchMap.size;
  };
  _proto._updateTouch = function _updateTouch(touch, x, y) {
    touch.getLocation(tempVec2);
    touch.setPrevPoint(tempVec2);
    touch.setPoint(x, y);
  };
  _proto._checkTouchMapSizeMoreThanMax = function _checkTouchMapSizeMoreThanMax(touchID) {
    var _this = this;
    if (this._touchMap.has(touchID)) {
      return false;
    }
    var maxSize = macro.ENABLE_MULTI_TOUCH ? this._maxTouches : 1;
    if (this._touchMap.size < maxSize) {
      return false;
    }
    var now = performance.now();
    this._touchMap.forEach(function (touch) {
      if (now - touch.lastModified > macro.TOUCH_TIMEOUT) {
        logID(2302, touch.getID());
        _this.releaseTouch(touch.getID());
      }
    });
    return maxSize >= this._touchMap.size;
  };
  return TouchManager;
}();
var touchManager = new TouchManager();

var TouchInputSource = function () {
  function TouchInputSource() {
    this._canvas = void 0;
    this._eventTarget = new EventTarget();
    if (systemInfo.hasFeature(Feature.INPUT_TOUCH)) {
      this._canvas = document.getElementById('GameCanvas');
      if (!this._canvas && !TEST && !EDITOR) {
        warn('failed to access canvas');
      }
      {
        this._registerEvent();
      }
    }
  }
  var _proto = TouchInputSource.prototype;
  _proto._registerEvent = function _registerEvent() {
    var _this$_canvas, _this$_canvas2, _this$_canvas3, _this$_canvas4;
    (_this$_canvas = this._canvas) == null ? void 0 : _this$_canvas.addEventListener('touchstart', this._createCallback(InputEventType.TOUCH_START));
    (_this$_canvas2 = this._canvas) == null ? void 0 : _this$_canvas2.addEventListener('touchmove', this._createCallback(InputEventType.TOUCH_MOVE));
    (_this$_canvas3 = this._canvas) == null ? void 0 : _this$_canvas3.addEventListener('touchend', this._createCallback(InputEventType.TOUCH_END));
    (_this$_canvas4 = this._canvas) == null ? void 0 : _this$_canvas4.addEventListener('touchcancel', this._createCallback(InputEventType.TOUCH_CANCEL));
  };
  _proto._createCallback = function _createCallback(eventType) {
    var _this = this;
    return function (event) {
      var canvasRect = _this._getCanvasRect();
      var handleTouches = [];
      var length = event.changedTouches.length;
      for (var i = 0; i < length; ++i) {
        var changedTouch = event.changedTouches[i];
        var touchID = changedTouch.identifier;
        if (touchID === null) {
          continue;
        }
        var location = _this._getLocation(changedTouch, canvasRect);
        var touch = touchManager.getOrCreateTouch(touchID, location.x, location.y);
        if (!touch) {
          continue;
        }
        if (eventType === InputEventType.TOUCH_END || eventType === InputEventType.TOUCH_CANCEL) {
          touchManager.releaseTouch(touchID);
        }
        handleTouches.push(touch);
      }
      event.stopPropagation();
      if (event.target === _this._canvas) {
        event.preventDefault();
      }
      if (eventType === InputEventType.TOUCH_START) {
        var _this$_canvas5;
        (_this$_canvas5 = _this._canvas) == null ? void 0 : _this$_canvas5.focus();
      }
      if (handleTouches.length > 0) {
        var eventTouch = new EventTouch(handleTouches, false, eventType, touchManager.getAllTouches());
        _this._eventTarget.emit(eventType, eventTouch);
      }
    };
  };
  _proto._getCanvasRect = function _getCanvasRect() {
    var canvas = this._canvas;
    var box = canvas == null ? void 0 : canvas.getBoundingClientRect();
    if (box) {
      return new Rect(box.x, box.y, box.width, box.height);
    }
    return new Rect(0, 0, 0, 0);
  };
  _proto._getLocation = function _getLocation(touch, canvasRect) {
    if (globalThis.__globalXR && globalThis.__globalXR.ar && globalThis.__globalXR.ar.isWebXR()) {
      return new Vec2(touch.clientX, touch.clientY);
    }
    var x = touch.clientX - canvasRect.x;
    var y = canvasRect.y + canvasRect.height - touch.clientY;
    if (screenAdapter.isFrameRotated) {
      var tmp = x;
      x = canvasRect.height - y;
      y = tmp;
    }
    var dpr = screenAdapter.devicePixelRatio;
    x *= dpr;
    y *= dpr;
    return new Vec2(x, y);
  };
  _proto.on = function on(eventType, callback, target) {
    this._eventTarget.on(eventType, callback, target);
  };
  _proto.dispatchEventsInCache = function dispatchEventsInCache() {};
  return TouchInputSource;
}();

var _pointerEventTypeMap;
var EventDispatcherPriority;
(function (EventDispatcherPriority) {
  EventDispatcherPriority[EventDispatcherPriority["GLOBAL"] = 0] = "GLOBAL";
  EventDispatcherPriority[EventDispatcherPriority["UI"] = 1] = "UI";
})(EventDispatcherPriority || (EventDispatcherPriority = {}));
var InputEventDispatcher = function () {
  function InputEventDispatcher(inputEventTarget) {
    this.priority = EventDispatcherPriority.GLOBAL;
    this._inputEventTarget = inputEventTarget;
  }
  var _proto = InputEventDispatcher.prototype;
  _proto.onThrowException = function onThrowException() {};
  _proto.dispatchEvent = function dispatchEvent(event) {
    this._inputEventTarget.emit(event.type, event);
    return true;
  };
  return InputEventDispatcher;
}();
var pointerEventTypeMap = (_pointerEventTypeMap = {}, _pointerEventTypeMap[InputEventType.MOUSE_DOWN] = InputEventType.TOUCH_START, _pointerEventTypeMap[InputEventType.MOUSE_MOVE] = InputEventType.TOUCH_MOVE, _pointerEventTypeMap[InputEventType.MOUSE_UP] = InputEventType.TOUCH_END, _pointerEventTypeMap);
var Input = function () {
  function Input() {
    this._eventTarget = new EventTarget();
    this._touchInput = new TouchInputSource();
    this._mouseInput = new MouseInputSource();
    this._keyboardInput = new KeyboardInputSource();
    this._accelerometerInput = new AccelerometerInputSource();
    this._eventKeyboardList = [];
    this._eventAccelerationList = [];
    this._eventGamepadList = [];
    this._eventHandleList = [];
    this._eventHMDList = [];
    this._eventHandheldList = [];
    this._needSimulateTouchMoveEvent = false;
    this._eventDispatcherList = [];
    {
      this._handleInput = new HandleInputDevice();
      this._hmdInput = new HMDInputDevice();
      this._handheldInput = new HandheldInputDevice();
    }
    this._registerEvent();
    this._inputEventDispatcher = new InputEventDispatcher(this._eventTarget);
    this._registerEventDispatcher(this._inputEventDispatcher);
    {
      GamepadInputDevice._init();
    }
  }
  var _proto2 = Input.prototype;
  _proto2._dispatchMouseDownEvent = function _dispatchMouseDownEvent(nativeMouseEvent) {
    var _this$_mouseInput$dis, _this$_mouseInput;
    (_this$_mouseInput$dis = (_this$_mouseInput = this._mouseInput).dispatchMouseDownEvent) == null ? void 0 : _this$_mouseInput$dis.call(_this$_mouseInput, nativeMouseEvent);
  };
  _proto2._dispatchMouseMoveEvent = function _dispatchMouseMoveEvent(nativeMouseEvent) {
    var _this$_mouseInput$dis2, _this$_mouseInput2;
    (_this$_mouseInput$dis2 = (_this$_mouseInput2 = this._mouseInput).dispatchMouseMoveEvent) == null ? void 0 : _this$_mouseInput$dis2.call(_this$_mouseInput2, nativeMouseEvent);
  };
  _proto2._dispatchMouseUpEvent = function _dispatchMouseUpEvent(nativeMouseEvent) {
    var _this$_mouseInput$dis3, _this$_mouseInput3;
    (_this$_mouseInput$dis3 = (_this$_mouseInput3 = this._mouseInput).dispatchMouseUpEvent) == null ? void 0 : _this$_mouseInput$dis3.call(_this$_mouseInput3, nativeMouseEvent);
  };
  _proto2._dispatchMouseScrollEvent = function _dispatchMouseScrollEvent(nativeMouseEvent) {
    var _this$_mouseInput$dis4, _this$_mouseInput4;
    (_this$_mouseInput$dis4 = (_this$_mouseInput4 = this._mouseInput).dispatchScrollEvent) == null ? void 0 : _this$_mouseInput$dis4.call(_this$_mouseInput4, nativeMouseEvent);
  };
  _proto2._dispatchKeyboardDownEvent = function _dispatchKeyboardDownEvent(nativeKeyboardEvent) {
    var _this$_keyboardInput$, _this$_keyboardInput;
    (_this$_keyboardInput$ = (_this$_keyboardInput = this._keyboardInput).dispatchKeyboardDownEvent) == null ? void 0 : _this$_keyboardInput$.call(_this$_keyboardInput, nativeKeyboardEvent);
  };
  _proto2._dispatchKeyboardUpEvent = function _dispatchKeyboardUpEvent(nativeKeyboardEvent) {
    var _this$_keyboardInput$2, _this$_keyboardInput2;
    (_this$_keyboardInput$2 = (_this$_keyboardInput2 = this._keyboardInput).dispatchKeyboardUpEvent) == null ? void 0 : _this$_keyboardInput$2.call(_this$_keyboardInput2, nativeKeyboardEvent);
  };
  _proto2.on = function on(eventType, callback, target) {
    this._eventTarget.on(eventType, callback, target);
    return callback;
  };
  _proto2.once = function once(eventType, callback, target) {
    this._eventTarget.once(eventType, callback, target);
    return callback;
  };
  _proto2.off = function off(eventType, callback, target) {
    this._eventTarget.off(eventType, callback, target);
  };
  _proto2.getTouch = function getTouch(touchID) {
    return touchManager.getTouch(touchID);
  };
  _proto2.getAllTouches = function getAllTouches() {
    return touchManager.getAllTouches();
  };
  _proto2.getTouchCount = function getTouchCount() {
    return touchManager.getTouchCount();
  };
  _proto2.setAccelerometerEnabled = function setAccelerometerEnabled(isEnable) {
    if (isEnable) {
      this._accelerometerInput.start();
    } else {
      this._accelerometerInput.stop();
    }
  };
  _proto2.setAccelerometerInterval = function setAccelerometerInterval(intervalInMileSeconds) {
    this._accelerometerInput.setInterval(intervalInMileSeconds);
  };
  _proto2._simulateEventTouch = function _simulateEventTouch(eventMouse) {
    var eventType = pointerEventTypeMap[eventMouse.type];
    var touchID = 0;
    var touch = touchManager.getOrCreateTouch(touchID, eventMouse.getLocationX(), eventMouse.getLocationY());
    if (!touch) {
      return;
    }
    var changedTouches = [touch];
    var eventTouch = new EventTouch(changedTouches, false, eventType, eventType === InputEventType.TOUCH_END ? [] : changedTouches);
    eventTouch.windowId = eventMouse.windowId;
    if (eventType === InputEventType.TOUCH_END) {
      touchManager.releaseTouch(touchID);
    }
    this._dispatchEventTouch(eventTouch);
  };
  _proto2._registerEventDispatcher = function _registerEventDispatcher(eventDispatcher) {
    this._eventDispatcherList.push(eventDispatcher);
    this._eventDispatcherList.sort(function (a, b) {
      return b.priority - a.priority;
    });
  };
  _proto2._emitEvent = function _emitEvent(event) {
    var length = this._eventDispatcherList.length;
    for (var i = 0; i < length; ++i) {
      var dispatcher = this._eventDispatcherList[i];
      try {
        if (!dispatcher.dispatchEvent(event)) {
          break;
        }
      } catch (e) {
        this._clearEvents();
        dispatcher.onThrowException();
        throw e;
      }
    }
  };
  _proto2._registerEvent = function _registerEvent() {
    var self = this;
    var touchInput = self._touchInput;
    var mouseInput = self._mouseInput;
    var keyboardInput = self._keyboardInput;
    var handleInput = self._handleInput;
    if (sys.hasFeature(sys.Feature.INPUT_TOUCH)) {
      touchInput.on(InputEventType.TOUCH_START, function (event) {
        self._dispatchEventTouch(event);
      });
      touchInput.on(InputEventType.TOUCH_MOVE, function (event) {
        self._dispatchEventTouch(event);
      });
      touchInput.on(InputEventType.TOUCH_END, function (event) {
        self._dispatchEventTouch(event);
      });
      touchInput.on(InputEventType.TOUCH_CANCEL, function (event) {
        self._dispatchEventTouch(event);
      });
    }
    if (sys.hasFeature(sys.Feature.EVENT_MOUSE)) {
      mouseInput.on(InputEventType.MOUSE_DOWN, function (event) {
        self._needSimulateTouchMoveEvent = true;
        self._simulateEventTouch(event);
        self._dispatchEventMouse(event);
      });
      mouseInput.on(InputEventType.MOUSE_MOVE, function (event) {
        if (self._needSimulateTouchMoveEvent) {
          self._simulateEventTouch(event);
        }
        self._dispatchEventMouse(event);
      });
      mouseInput.on(InputEventType.MOUSE_UP, function (event) {
        self._needSimulateTouchMoveEvent = false;
        self._simulateEventTouch(event);
        self._dispatchEventMouse(event);
      });
      mouseInput.on(InputEventType.MOUSE_WHEEL, function (event) {
        self._dispatchEventMouse(event);
      });
      mouseInput.on(InputEventType.MOUSE_LEAVE, function (event) {
        self._dispatchEventMouse(event);
      });
      mouseInput.on(InputEventType.MOUSE_ENTER, function (event) {
        self._dispatchEventMouse(event);
      });
    }
    if (sys.hasFeature(sys.Feature.EVENT_KEYBOARD)) {
      var eventKeyboardList = self._eventKeyboardList;
      keyboardInput.on(InputEventType.KEY_DOWN, function (event) {
        self._dispatchOrPushEvent(event, eventKeyboardList);
      });
      keyboardInput.on(InputEventType.KEY_PRESSING, function (event) {
        self._dispatchOrPushEvent(event, eventKeyboardList);
      });
      keyboardInput.on(InputEventType.KEY_UP, function (event) {
        self._dispatchOrPushEvent(event, eventKeyboardList);
      });
    }
    if (sys.hasFeature(sys.Feature.EVENT_ACCELEROMETER)) {
      var eventAccelerationList = self._eventAccelerationList;
      self._accelerometerInput.on(InputEventType.DEVICEMOTION, function (event) {
        self._dispatchOrPushEvent(event, eventAccelerationList);
      });
    }
    {
      if (sys.hasFeature(sys.Feature.EVENT_GAMEPAD)) {
        var eventGamepadList = self._eventGamepadList;
        GamepadInputDevice._on(InputEventType.GAMEPAD_CHANGE, function (event) {
          self._dispatchOrPushEvent(event, eventGamepadList);
        });
        GamepadInputDevice._on(InputEventType.GAMEPAD_INPUT, function (event) {
          self._dispatchOrPushEvent(event, eventGamepadList);
        });
        GamepadInputDevice._on(InputEventType.HANDLE_POSE_INPUT, function (event) {
          self._dispatchOrPushEvent(event, eventGamepadList);
        });
      }
      if (sys.hasFeature(sys.Feature.EVENT_HANDLE)) {
        var eventHandleList = self._eventHandleList;
        handleInput._on(InputEventType.HANDLE_INPUT, function (event) {
          self._dispatchOrPushEvent(event, eventHandleList);
        });
        handleInput._on(InputEventType.HANDLE_POSE_INPUT, function (event) {
          self._dispatchOrPushEvent(event, eventHandleList);
        });
      }
      if (sys.hasFeature(sys.Feature.EVENT_HMD)) {
        var eventHMDList = self._eventHMDList;
        self._hmdInput._on(InputEventType.HMD_POSE_INPUT, function (event) {
          self._dispatchOrPushEvent(event, eventHMDList);
        });
      }
      if (sys.hasFeature(sys.Feature.EVENT_HANDHELD)) {
        var eventHandheldList = self._eventHandheldList;
        self._handheldInput._on(InputEventType.HANDHELD_POSE_INPUT, function (event) {
          self._dispatchOrPushEvent(event, eventHandheldList);
        });
      }
    }
  };
  _proto2._clearEvents = function _clearEvents() {
    this._eventKeyboardList.length = 0;
    this._eventAccelerationList.length = 0;
    this._eventGamepadList.length = 0;
    this._eventHandleList.length = 0;
    this._eventHMDList.length = 0;
  };
  _proto2._dispatchOrPushEvent = function _dispatchOrPushEvent(event, eventList) {
    {
      this._emitEvent(event);
    }
  };
  _proto2._dispatchEventMouse = function _dispatchEventMouse(event) {
    this._emitEvent(event);
  };
  _proto2._dispatchEventTouch = function _dispatchEventTouch(eventTouch) {
    var touches = eventTouch.getTouches();
    var touchesLength = touches.length;
    for (var i = 0; i < touchesLength; ++i) {
      eventTouch.touch = touches[i];
      eventTouch.propagationStopped = eventTouch.propagationImmediateStopped = false;
      this._emitEvent(eventTouch);
    }
  };
  _proto2._frameDispatchEvents = function _frameDispatchEvents() {
    return;
  };
  return Input;
}();
Input.EventType = InputEventType;
var input = new Input();

var SystemEvent = function (_EventTarget) {
  function SystemEvent() {
    var _this;
    _this = _EventTarget.call(this) || this;
    input.on(InputEventType.MOUSE_DOWN, function (e) {
      _this.emit(SystemEventType.MOUSE_DOWN, e);
    });
    input.on(InputEventType.MOUSE_MOVE, function (e) {
      _this.emit(SystemEventType.MOUSE_MOVE, e);
    });
    input.on(InputEventType.MOUSE_UP, function (e) {
      _this.emit(SystemEventType.MOUSE_UP, e);
    });
    input.on(InputEventType.MOUSE_WHEEL, function (e) {
      _this.emit(SystemEventType.MOUSE_WHEEL, e);
    });
    input.on(InputEventType.TOUCH_START, function (e) {
      _this.emit(SystemEventType.TOUCH_START, e.touch, e);
    });
    input.on(InputEventType.TOUCH_MOVE, function (e) {
      _this.emit(SystemEventType.TOUCH_MOVE, e.touch, e);
    });
    input.on(InputEventType.TOUCH_END, function (e) {
      _this.emit(SystemEventType.TOUCH_END, e.touch, e);
    });
    input.on(InputEventType.TOUCH_CANCEL, function (e) {
      _this.emit(SystemEventType.TOUCH_CANCEL, e.touch, e);
    });
    input.on(InputEventType.KEY_DOWN, function (e) {
      _this.emit(SystemEventType.KEY_DOWN, e);
    });
    input.on(InputEventType.KEY_PRESSING, function (e) {
      _this.emit(SystemEventType.KEY_DOWN, e);
    });
    input.on(InputEventType.KEY_UP, function (e) {
      _this.emit(SystemEventType.KEY_UP, e);
    });
    input.on(InputEventType.DEVICEMOTION, function (e) {
      _this.emit(SystemEventType.DEVICEMOTION, e);
    });
    return _this;
  }
  _inheritsLoose(SystemEvent, _EventTarget);
  var _proto = SystemEvent.prototype;
  _proto.setAccelerometerEnabled = function setAccelerometerEnabled(isEnabled) {
    input.setAccelerometerEnabled(isEnabled);
  };
  _proto.setAccelerometerInterval = function setAccelerometerInterval(interval) {
    input.setAccelerometerInterval(interval);
  };
  _proto.on = function on(type, callback, target, once) {
    _EventTarget.prototype.on.call(this, type, callback, target, once);
    return callback;
  };
  _proto.off = function off(type, callback, target) {
    _EventTarget.prototype.off.call(this, type, callback, target);
  };
  return SystemEvent;
}(EventTarget);
SystemEvent.EventType = SystemEventType;
cclegacy.SystemEvent = SystemEvent;
var systemEvent = new SystemEvent();
cclegacy.systemEvent = systemEvent;

replaceProperty(SystemEventType, 'Node.EventType', [{
  name: 'POSITION_PART',
  newName: 'TRANSFORM_CHANGED'
}, {
  name: 'ROTATION_PART',
  newName: 'TRANSFORM_CHANGED'
}, {
  name: 'SCALE_PART',
  newName: 'TRANSFORM_CHANGED'
}]);
replaceProperty(Event, 'Event', [{
  name: 'ACCELERATION',
  newName: 'DEVICEMOTION',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}]);
markAsWarning(Event, 'Event', [{
  name: 'TOUCH',
  suggest: 'please use SystemEvent.EventType.TOUCH_START, SystemEvent.EventType.TOUCH_MOVE, SystemEvent.EventType.TOUCH_END and SystemEvent.EventType.TOUCH_CANCEL instead'
}, {
  name: 'MOUSE',
  suggest: 'please use SystemEvent.EventType.MOUSE_DOWN, SystemEvent.EventType.MOUSE_MOVE, SystemEvent.EventType.MOUSE_UP, SystemEvent.EventType.MOUSE_WHEEL, Node.EventType.MOUSE_ENTER and Node.EventType.MOUSE_LEAVE instead'
}, {
  name: 'KEYBOARD',
  suggest: 'please use SystemEvent.EventType.KEY_DOWN and SystemEvent.EventType.KEY_UP instead'
}]);
replaceProperty(EventMouse, 'EventMouse', ['DOWN', 'UP', 'MOVE'].map(function (item) {
  return {
    name: item,
    newName: "MOUSE_" + item,
    target: SystemEvent.EventType,
    targetName: 'SystemEvent.EventType'
  };
}));
replaceProperty(EventMouse, 'EventMouse', [{
  name: 'SCROLL',
  newName: 'MOUSE_WHEEL',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}]);
markAsWarning(EventMouse.prototype, 'EventMouse.prototype', [{
  name: 'eventType',
  suggest: 'please use EventMouse.prototype.type instead'
}]);
replaceProperty(EventTouch, 'EventTouch', [{
  name: 'BEGAN',
  newName: 'TOUCH_START',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}]);
replaceProperty(EventTouch, 'EventTouch', [{
  name: 'MOVED',
  newName: 'TOUCH_MOVE',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}]);
replaceProperty(EventTouch, 'EventTouch', [{
  name: 'ENDED',
  newName: 'TOUCH_END',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}]);
replaceProperty(EventTouch, 'EventTouch', [{
  name: 'CANCELLED',
  newName: 'TOUCH_CANCEL',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}]);
markAsWarning(EventTouch.prototype, 'EventTouch.prototype', [{
  name: 'getEventCode',
  suggest: 'please use EventTouch.prototype.type instead'
}]);
replaceProperty(EventTouch.prototype, 'EventTouch.prototype', [{
  name: 'getUILocationInView',
  newName: 'getLocationInView',
  target: EventTouch,
  targetName: 'EventTouch'
}]);
markAsWarning(macro.KEY, 'macro.KEY', ['back', 'menu', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '+', '-', '/', ';', '=', ',', '.', '[', ']', 'dpadLeft', 'dpadRight', 'dpadUp', 'dpadDown', 'dpadCenter'].map(function (item) {
  return {
    name: item
  };
}));
markAsWarning(macro.KEY, 'macro.KEY', [{
  name: 'shift',
  suggest: 'please use KeyCode.SHIFT_LEFT instead'
}]);
markAsWarning(macro.KEY, 'macro.KEY', [{
  name: 'ctrl',
  suggest: 'please use KeyCode.CTRL_LEFT instead'
}]);
markAsWarning(macro.KEY, 'macro.KEY', [{
  name: 'alt',
  suggest: 'please use KeyCode.ALT_LEFT instead'
}]);
markAsWarning(macro, 'macro', [{
  name: 'KEY',
  suggest: 'please use KeyCode instead'
}]);

var _dec$1, _class$1;
replaceProperty(Node.prototype, 'Node', [{
  name: 'childrenCount',
  newName: 'children.length',
  customGetter: function customGetter() {
    return this.children.length;
  }
}]);
replaceProperty(Node.prototype, 'Node', [{
  name: 'width',
  targetName: 'node.getComponent(UITransform)',
  customGetter: function customGetter() {
    return this._getUITransformComp().width;
  },
  customSetter: function customSetter(value) {
    this._getUITransformComp().width = value;
  }
}, {
  name: 'height',
  targetName: 'node.getComponent(UITransform)',
  customGetter: function customGetter() {
    return this._getUITransformComp().height;
  },
  customSetter: function customSetter(value) {
    this._getUITransformComp().height = value;
  }
}, {
  name: 'anchorX',
  targetName: 'node.getComponent(UITransform)',
  customGetter: function customGetter() {
    return this._getUITransformComp().anchorX;
  },
  customSetter: function customSetter(value) {
    this._getUITransformComp().anchorX = value;
  }
}, {
  name: 'anchorY',
  targetName: 'node.getComponent(UITransform)',
  customGetter: function customGetter() {
    return this._getUITransformComp().anchorY;
  },
  customSetter: function customSetter(value) {
    this._getUITransformComp().anchorY = value;
  }
}, {
  name: 'getAnchorPoint',
  targetName: 'node.getComponent(UITransform)',
  customFunction: function customFunction(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._getUITransformComp().anchorPoint);
    return out;
  }
}, {
  name: 'setAnchorPoint',
  targetName: 'node.getComponent(UITransform)',
  customFunction: function customFunction(point, y) {
    this._getUITransformComp().setAnchorPoint(point, y);
  }
}, {
  name: 'getContentSize',
  targetName: 'node.getComponent(UITransform)',
  customFunction: function customFunction(out) {
    if (!out) {
      out = new Size();
    }
    out.set(this._getUITransformComp().contentSize);
    return out;
  }
}, {
  name: 'setContentSize',
  targetName: 'node.getComponent(UITransform)',
  customFunction: function customFunction(size, height) {
    if (typeof size === 'number') {
      this._getUITransformComp().setContentSize(size, height);
    } else {
      this._getUITransformComp().setContentSize(size);
    }
  }
}]);
removeProperty(SceneGlobals.prototype, 'SceneGlobals.prototype', [{
  name: 'aspect'
}, {
  name: 'selfShadow'
}, {
  name: 'linear'
}, {
  name: 'packing'
}, {
  name: 'autoAdapt'
}, {
  name: 'fixedArea'
}, {
  name: 'pcf'
}, {
  name: 'bias'
}, {
  name: 'normalBias'
}, {
  name: 'near'
}, {
  name: 'far'
}, {
  name: 'shadowDistance'
}, {
  name: 'invisibleOcclusionRange'
}, {
  name: 'orthoSize'
}, {
  name: 'saturation'
}]);
replaceProperty(SceneGlobals.prototype, 'SceneGlobals.prototype', [{
  name: 'distance',
  newName: 'planeHeight'
}, {
  name: 'normal',
  newName: 'planeDirection'
}, {
  name: 'size',
  newName: 'shadowMapSize'
}]);
removeProperty(Node.prototype, 'Node.prototype', [{
  name: 'addLayer'
}, {
  name: 'removeLayer'
}]);
replaceProperty(NodeUIProperties.prototype, 'NodeUIProperties', [{
  name: 'opacityDirty',
  newName: 'colorDirty'
}]);
removeProperty(Layers, 'Layers', [{
  name: 'All'
}, {
  name: 'RaycastMask'
}, {
  name: 'check'
}]);
replaceProperty(Layers, 'Layers', [{
  name: 'Default',
  newName: 'DEFAULT',
  target: Layers.Enum,
  targetName: 'Layers.Enum'
}, {
  name: 'Always',
  newName: 'ALWAYS',
  target: Layers.Enum,
  targetName: 'Layers.Enum'
}, {
  name: 'IgnoreRaycast',
  newName: 'IGNORE_RAYCAST',
  target: Layers.Enum,
  targetName: 'Layers.Enum'
}, {
  name: 'Gizmos',
  newName: 'GIZMOS',
  target: Layers.Enum,
  targetName: 'Layers.Enum'
}, {
  name: 'Editor',
  newName: 'EDITOR',
  target: Layers.Enum,
  targetName: 'Layers.Enum'
}, {
  name: 'UI',
  newName: 'UI_3D',
  target: Layers.Enum,
  targetName: 'Layers.Enum'
}, {
  name: 'UI2D',
  newName: 'UI_2D',
  target: Layers.Enum,
  targetName: 'Layers.Enum'
}, {
  name: 'SceneGizmo',
  newName: 'SCENE_GIZMO',
  target: Layers.Enum,
  targetName: 'Layers.Enum'
}, {
  name: 'makeInclusiveMask',
  newName: 'makeMaskInclude',
  target: Layers,
  targetName: 'Layers'
}, {
  name: 'makeExclusiveMask',
  newName: 'makeMaskExclude',
  target: Layers,
  targetName: 'Layers'
}]);
removeProperty(Layers.Enum, 'Layers.Enum', [{
  name: 'ALWAYS'
}]);
removeProperty(Layers.BitMask, 'Layers.BitMask', [{
  name: 'ALWAYS'
}]);
var HideInHierarchy = CCObjectFlags.HideInHierarchy;
var DontSave = CCObjectFlags.DontSave;
var PrivateNode = (_dec$1 = ccclass('cc.PrivateNode'), _dec$1(_class$1 = function (_Node) {
  function PrivateNode(name) {
    var _this;
    _this = _Node.call(this, name) || this;
    warnID(12003, _this.name);
    _this.hideFlags |= DontSave | HideInHierarchy;
    return _this;
  }
  _inheritsLoose(PrivateNode, _Node);
  return PrivateNode;
}(Node)) || _class$1);
replaceProperty(SystemEventType, 'SystemEventType', ['MOUSE_ENTER', 'MOUSE_LEAVE', 'TRANSFORM_CHANGED', 'SCENE_CHANGED_FOR_PERSISTS', 'SIZE_CHANGED', 'ANCHOR_CHANGED', 'COLOR_CHANGED', 'CHILD_ADDED', 'CHILD_REMOVED', 'PARENT_CHANGED', 'NODE_DESTROYED', 'LAYER_CHANGED', 'SIBLING_ORDER_CHANGED'].map(function (name) {
  return {
    name: name,
    target: Node.EventType,
    targetName: 'Node.EventType'
  };
}));
replaceProperty(Node.EventType, 'Node.EventType', [{
  name: 'DEVICEMOTION',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}, {
  name: 'KEY_DOWN',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}, {
  name: 'KEY_UP',
  target: SystemEvent.EventType,
  targetName: 'SystemEvent.EventType'
}]);
legacyCC.PrivateNode = PrivateNode;

function find(path, referenceNode) {
  if (!referenceNode) {
    var scene = legacyCC.director.getScene();
    if (!scene) {
      {
        warnID(5601);
      }
      return null;
    } else if (!scene.isValid) {
      warnID(5602);
      return null;
    }
    referenceNode = scene;
  } else if (!referenceNode.isValid) {
    warnID(5603);
    return null;
  }
  return referenceNode.getChildByPath(path);
}
legacyCC.find = find;

var fastRemoveAt = fastRemoveAt$1;
var IsStartCalled = CCObjectFlags.IsStartCalled;
var IsOnEnableCalled$1 = CCObjectFlags.IsOnEnableCalled;
CCObjectFlags.IsEditorOnEnableCalled;
function sortedIndex(array, comp) {
  var order = comp.constructor._executionOrder;
  var id = comp._id;
  var l = 0;
  for (var h = array.length - 1, m = h >>> 1; l <= h; m = l + h >>> 1) {
    var test = array[m];
    var testOrder = test.constructor._executionOrder;
    if (testOrder > order) {
      h = m - 1;
    } else if (testOrder < order) {
      l = m + 1;
    } else {
      var testId = test._id;
      if (testId > id) {
        h = m - 1;
      } else if (testId < id) {
        l = m + 1;
      } else {
        return m;
      }
    }
  }
  return ~l;
}
function stableRemoveInactive(iterator, flagToClear) {
  var array = iterator.array;
  var next = iterator.i + 1;
  while (next < array.length) {
    var comp = array[next];
    if (comp.node._activeInHierarchy) {
      ++next;
    } else {
      iterator.removeAt(next);
      if (flagToClear) {
        comp._objFlags &= ~flagToClear;
      }
    }
  }
}
var LifeCycleInvoker = function () {
  function LifeCycleInvoker(invokeFunc) {
    var Iterator = MutableForwardIterator;
    this._zero = new Iterator([]);
    this._neg = new Iterator([]);
    this._pos = new Iterator([]);
    this._invoke = invokeFunc;
  }
  return _createClass(LifeCycleInvoker, [{
    key: "zero",
    get: function get() {
      return this._zero;
    }
  }, {
    key: "neg",
    get: function get() {
      return this._neg;
    }
  }, {
    key: "pos",
    get: function get() {
      return this._pos;
    }
  }]);
}();
LifeCycleInvoker.stableRemoveInactive = stableRemoveInactive;
function compareOrder(a, b) {
  return a.constructor._executionOrder - b.constructor._executionOrder;
}
var OneOffInvoker = function (_LifeCycleInvoker2) {
  function OneOffInvoker() {
    return _LifeCycleInvoker2.apply(this, arguments) || this;
  }
  _inheritsLoose(OneOffInvoker, _LifeCycleInvoker2);
  var _proto = OneOffInvoker.prototype;
  _proto.add = function add(comp) {
    var order = comp.constructor._executionOrder;
    (order === 0 ? this._zero : order < 0 ? this._neg : this._pos).array.push(comp);
  };
  _proto.remove = function remove(comp) {
    var order = comp.constructor._executionOrder;
    (order === 0 ? this._zero : order < 0 ? this._neg : this._pos).fastRemove(comp);
  };
  _proto.cancelInactive = function cancelInactive(flagToClear) {
    stableRemoveInactive(this._zero, flagToClear);
    stableRemoveInactive(this._neg, flagToClear);
    stableRemoveInactive(this._pos, flagToClear);
  };
  _proto.invoke = function invoke() {
    var compsNeg = this._neg;
    if (compsNeg.array.length > 0) {
      compsNeg.array.sort(compareOrder);
      this._invoke(compsNeg);
      compsNeg.array.length = 0;
    }
    this._invoke(this._zero);
    this._zero.array.length = 0;
    var compsPos = this._pos;
    if (compsPos.array.length > 0) {
      compsPos.array.sort(compareOrder);
      this._invoke(compsPos);
      compsPos.array.length = 0;
    }
  };
  return OneOffInvoker;
}(LifeCycleInvoker);
var ReusableInvoker = function (_LifeCycleInvoker3) {
  function ReusableInvoker(invokeFunc) {
    return _LifeCycleInvoker3.call(this, invokeFunc) || this;
  }
  _inheritsLoose(ReusableInvoker, _LifeCycleInvoker3);
  var _proto2 = ReusableInvoker.prototype;
  _proto2.add = function add(comp) {
    var order = comp.constructor._executionOrder;
    if (order === 0) {
      this._zero.array.push(comp);
    } else {
      var array = order < 0 ? this._neg.array : this._pos.array;
      var i = sortedIndex(array, comp);
      if (i < 0) {
        array.splice(~i, 0, comp);
      } else {
        warn('component already added:', comp.name);
      }
    }
  };
  _proto2.remove = function remove(comp) {
    var order = comp.constructor._executionOrder;
    if (order === 0) {
      this._zero.fastRemove(comp);
    } else {
      var iterator = order < 0 ? this._neg : this._pos;
      var i = sortedIndex(iterator.array, comp);
      if (i >= 0) {
        iterator.removeAt(i);
      }
    }
  };
  _proto2.invoke = function invoke(dt) {
    if (this._neg.array.length > 0) {
      this._invoke(this._neg, dt);
    }
    this._invoke(this._zero, dt);
    if (this._pos.array.length > 0) {
      this._invoke(this._pos, dt);
    }
  };
  return ReusableInvoker;
}(LifeCycleInvoker);
function createInvokeImpl(singleInvoke, fastPath, ensureFlag) {
  return function (iterator, dt) {
    try {
      fastPath(iterator, dt);
    } catch (e) {
      legacyCC._throw(e);
      var array = iterator.array;
      if (ensureFlag) {
        array[iterator.i]._objFlags |= ensureFlag;
      }
      ++iterator.i;
      for (; iterator.i < array.length; ++iterator.i) {
        try {
          singleInvoke(array[iterator.i], dt);
        } catch (e) {
          legacyCC._throw(e);
          if (ensureFlag) {
            array[iterator.i]._objFlags |= ensureFlag;
          }
        }
      }
    }
  };
}
var invokeStart = createInvokeImpl(function (c) {
  c.start();
  c._objFlags |= IsStartCalled;
}, function (iterator) {
  var array = iterator.array;
  for (iterator.i = 0; iterator.i < array.length; ++iterator.i) {
    var comp = array[iterator.i];
    comp.start();
    comp._objFlags |= IsStartCalled;
  }
}, IsStartCalled);
var invokeUpdate = createInvokeImpl(function (c, dt) {
  c.update(dt);
}, function (iterator, dt) {
  var array = iterator.array;
  for (iterator.i = 0; iterator.i < array.length; ++iterator.i) {
    array[iterator.i].update(dt);
  }
});
var invokeLateUpdate = createInvokeImpl(function (c, dt) {
  c.lateUpdate(dt);
}, function (iterator, dt) {
  var array = iterator.array;
  for (iterator.i = 0; iterator.i < array.length; ++iterator.i) {
    array[iterator.i].lateUpdate(dt);
  }
});
var invokeOnEnable = function (iterator) {
  var compScheduler = legacyCC.director._compScheduler;
  var array = iterator.array;
  for (iterator.i = 0; iterator.i < array.length; ++iterator.i) {
    var comp = array[iterator.i];
    if (comp._enabled) {
      comp.onEnable();
      var deactivatedDuringOnEnable = !comp.node._activeInHierarchy;
      if (!deactivatedDuringOnEnable) {
        compScheduler._onEnabled(comp);
      }
    }
  }
};
var ComponentScheduler = function () {
  function ComponentScheduler() {
    this._deferredComps = [];
    this.unscheduleAll();
  }
  var _proto3 = ComponentScheduler.prototype;
  _proto3.unscheduleAll = function unscheduleAll() {
    this.startInvoker = new OneOffInvoker(invokeStart);
    this.updateInvoker = new ReusableInvoker(invokeUpdate);
    this.lateUpdateInvoker = new ReusableInvoker(invokeLateUpdate);
    this._updating = false;
  };
  _proto3._onEnabled = function _onEnabled(comp) {
    legacyCC.director.getScheduler().resumeTarget(comp);
    comp._objFlags |= IsOnEnableCalled$1;
    if (this._updating) {
      this._deferredComps.push(comp);
    } else {
      this._scheduleImmediate(comp);
    }
  };
  _proto3._onDisabled = function _onDisabled(comp) {
    legacyCC.director.getScheduler().pauseTarget(comp);
    comp._objFlags &= ~IsOnEnableCalled$1;
    var index = this._deferredComps.indexOf(comp);
    if (index >= 0) {
      fastRemoveAt(this._deferredComps, index);
      return;
    }
    if (comp.internalStart && !(comp._objFlags & IsStartCalled)) {
      this.startInvoker.remove(comp);
    }
    if (comp.internalUpdate) {
      this.updateInvoker.remove(comp);
    }
    if (comp.internalLateUpdate) {
      this.lateUpdateInvoker.remove(comp);
    }
  };
  _proto3.enableComp = function enableComp(comp, invoker) {
    if (!(comp._objFlags & IsOnEnableCalled$1)) {
      if (comp.internalOnEnable) {
        if (invoker) {
          invoker.add(comp);
          return;
        } else {
          comp.internalOnEnable();
          var deactivatedDuringOnEnable = !comp.node.activeInHierarchy;
          if (deactivatedDuringOnEnable) {
            return;
          }
        }
      }
      this._onEnabled(comp);
    }
  };
  _proto3.disableComp = function disableComp(comp) {
    if (comp._objFlags & IsOnEnableCalled$1) {
      if (comp.internalOnDisable) {
        comp.internalOnDisable();
      }
      this._onDisabled(comp);
    }
  };
  _proto3.startPhase = function startPhase() {
    this._updating = true;
    this.startInvoker.invoke();
    this._startForNewComps();
  };
  _proto3.updatePhase = function updatePhase(dt) {
    this.updateInvoker.invoke(dt);
  };
  _proto3.lateUpdatePhase = function lateUpdatePhase(dt) {
    this.lateUpdateInvoker.invoke(dt);
    this._updating = false;
    this._startForNewComps();
  };
  _proto3._startForNewComps = function _startForNewComps() {
    if (this._deferredComps.length > 0) {
      this._deferredSchedule();
      this.startInvoker.invoke();
    }
  };
  _proto3._scheduleImmediate = function _scheduleImmediate(comp) {
    if (typeof comp.internalStart === 'function' && !(comp._objFlags & IsStartCalled)) {
      this.startInvoker.add(comp);
    }
    if (typeof comp.internalUpdate === 'function') {
      this.updateInvoker.add(comp);
    }
    if (typeof comp.internalLateUpdate === 'function') {
      this.lateUpdateInvoker.add(comp);
    }
  };
  _proto3._deferredSchedule = function _deferredSchedule() {
    var comps = this._deferredComps;
    for (var i = 0, len = comps.length; i < len; i++) {
      this._scheduleImmediate(comps[i]);
    }
    comps.length = 0;
  };
  return ComponentScheduler;
}();

var MAX_POOL_SIZE = 4;
var IsPreloadStarted = CCObjectFlags.IsPreloadStarted;
var IsOnLoadStarted = CCObjectFlags.IsOnLoadStarted;
var IsOnLoadCalled = CCObjectFlags.IsOnLoadCalled;
var IsOnEnableCalled = CCObjectFlags.IsOnEnableCalled;
var Deactivating = CCObjectFlags.Deactivating;
var UnsortedInvoker = function (_LifeCycleInvoker) {
  function UnsortedInvoker(invokeFunc) {
    return _LifeCycleInvoker.call(this, invokeFunc) || this;
  }
  _inheritsLoose(UnsortedInvoker, _LifeCycleInvoker);
  var _proto = UnsortedInvoker.prototype;
  _proto.add = function add(comp) {
    this._zero.array.push(comp);
  };
  _proto.remove = function remove(comp) {
    this._zero.fastRemove(comp);
  };
  _proto.cancelInactive = function cancelInactive(flagToClear) {
    LifeCycleInvoker.stableRemoveInactive(this._zero, flagToClear);
  };
  _proto.invoke = function invoke() {
    this._invoke(this._zero);
    this._zero.array.length = 0;
  };
  return UnsortedInvoker;
}(LifeCycleInvoker);
var invokePreload = createInvokeImpl(function (c) {
  c.internalPreload == null ? void 0 : c.internalPreload();
}, function (iterator) {
  var array = iterator.array;
  for (iterator.i = 0; iterator.i < array.length; ++iterator.i) {
    var _array$iterator$i$int, _array$iterator$i;
    (_array$iterator$i$int = (_array$iterator$i = array[iterator.i]).internalPreload) == null ? void 0 : _array$iterator$i$int.call(_array$iterator$i);
  }
});
var invokeOnLoad = createInvokeImpl(function (c) {
  c.internalOnLoad == null ? void 0 : c.internalOnLoad();
  c._objFlags |= IsOnLoadCalled;
}, function (iterator) {
  var array = iterator.array;
  for (iterator.i = 0; iterator.i < array.length; ++iterator.i) {
    var comp = array[iterator.i];
    comp.internalOnLoad == null ? void 0 : comp.internalOnLoad();
    comp._objFlags |= IsOnLoadCalled;
  }
}, IsOnLoadCalled);
var activateTasksPool = new Pool(MAX_POOL_SIZE);
activateTasksPool.get = function getActivateTask() {
  var task = this._get() || {
    preload: new UnsortedInvoker(invokePreload),
    onLoad: new OneOffInvoker(invokeOnLoad),
    onEnable: new OneOffInvoker(invokeOnEnable)
  };
  task.preload.zero.i = -1;
  var invoker = task.onLoad;
  invoker.zero.i = -1;
  invoker.neg.i = -1;
  invoker.pos.i = -1;
  invoker = task.onEnable;
  invoker.zero.i = -1;
  invoker.neg.i = -1;
  invoker.pos.i = -1;
  return task;
};
function _componentCorrupted(node, comp, index) {
  errorID(3817, node.name, index);
  log('Corrupted component value:', comp);
  if (comp) {
    node._removeComponent(comp);
  } else {
    removeAt(node.getWritableComponents(), index);
  }
}
var NodeActivator = function () {
  function NodeActivator() {
    this.reset();
  }
  var _proto2 = NodeActivator.prototype;
  _proto2.reset = function reset() {
    this._activatingStack = [];
  };
  _proto2.activateNode = function activateNode(node, active) {
    if (active) {
      var task = activateTasksPool.get();
      if (task) {
        this._activatingStack.push(task);
        this._activateNodeRecursively(node, task.preload, task.onLoad, task.onEnable);
        task.preload.invoke();
        task.onLoad.invoke();
        task.onEnable.invoke();
        this._activatingStack.pop();
        activateTasksPool.put(task);
      }
    } else {
      this._deactivateNodeRecursively(node);
      var stack = this._activatingStack;
      for (var _iterator = _createForOfIteratorHelperLoose(stack), _step; !(_step = _iterator()).done;) {
        var lastTask = _step.value;
        lastTask.preload.cancelInactive(IsPreloadStarted);
        lastTask.onLoad.cancelInactive(IsOnLoadStarted);
        lastTask.onEnable.cancelInactive(IsOnEnableCalled);
      }
    }
    node.emit(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, node);
  };
  _proto2.activateComp = function activateComp(comp, preloadInvoker, onLoadInvoker, onEnableInvoker) {
    if (!isValid(comp, true)) {
      return;
    }
    if (!(comp._objFlags & IsPreloadStarted)) {
      comp._objFlags |= IsPreloadStarted;
      if (comp.internalPreload) {
        if (preloadInvoker) {
          preloadInvoker.add(comp);
        } else {
          comp.internalPreload();
        }
      }
    }
    if (!(comp._objFlags & IsOnLoadStarted)) {
      comp._objFlags |= IsOnLoadStarted;
      if (comp.internalOnLoad) {
        if (onLoadInvoker) {
          onLoadInvoker.add(comp);
        } else {
          comp.internalOnLoad();
          comp._objFlags |= IsOnLoadCalled;
        }
      } else {
        comp._objFlags |= IsOnLoadCalled;
      }
    }
    if (comp._enabled) {
      {
        assertIsTrue(comp.node, getError(3823, comp.uuid, comp.name));
      }
      var deactivatedOnLoading = !comp.node.activeInHierarchy;
      if (deactivatedOnLoading) {
        return;
      }
      legacyCC.director._compScheduler.enableComp(comp, onEnableInvoker);
    }
  };
  _proto2.destroyComp = function destroyComp(comp) {
    legacyCC.director._compScheduler.disableComp(comp);
    if (comp.internalOnDestroy && comp._objFlags & IsOnLoadCalled) {
      comp.internalOnDestroy();
    }
  };
  _proto2._activateNodeRecursively = function _activateNodeRecursively(node, preloadInvoker, onLoadInvoker, onEnableInvoker) {
    if (node._objFlags & Deactivating) {
      errorID(3816, node.name);
      return;
    }
    node._setActiveInHierarchy(true);
    var originCount = node.components.length;
    for (var i = 0; i < originCount; ++i) {
      var component = node.components[i];
      if (component instanceof legacyCC.Component) {
        this.activateComp(component, preloadInvoker, onLoadInvoker, onEnableInvoker);
      } else {
        _componentCorrupted(node, component, i);
        --i;
        --originCount;
      }
    }
    for (var _i = 0, len = node.children.length; _i < len; ++_i) {
      var child = node.children[_i];
      if (child.active) {
        this._activateNodeRecursively(child, preloadInvoker, onLoadInvoker, onEnableInvoker);
      }
    }
    node._onPostActivated(true);
  };
  _proto2._deactivateNodeRecursively = function _deactivateNodeRecursively(node) {
    {
      assert(!(node._objFlags & Deactivating), 'node should not deactivating');
      assert(node.activeInHierarchy, 'node should not deactivated');
    }
    node._objFlags |= Deactivating;
    node._setActiveInHierarchy(false);
    var originCount = node.components.length;
    for (var c = 0; c < originCount; ++c) {
      var component = node.components[c];
      if (component._enabled) {
        legacyCC.director._compScheduler.disableComp(component);
        if (node.activeInHierarchy) {
          node._objFlags &= ~Deactivating;
          return;
        }
      }
    }
    for (var i = 0, len = node.children.length; i < len; ++i) {
      var child = node.children[i];
      if (child.activeInHierarchy) {
        this._deactivateNodeRecursively(child);
        if (node.activeInHierarchy) {
          node._objFlags &= ~Deactivating;
          return;
        }
      }
    }
    node._onPostActivated(false);
    node._objFlags &= ~Deactivating;
  };
  return NodeActivator;
}();

var _dec, _class, _class2, _initializer, _initializer2, _initializer3, _Prefab;
var OptimizationPolicy = Enum({
  AUTO: 0,
  SINGLE_INSTANCE: 1,
  MULTI_INSTANCE: 2
});
var Prefab = (_dec = ccclass('cc.Prefab'), _dec(_class = (_class2 = (_Prefab = function (_Asset) {
  function Prefab() {
    var _this;
    _this = _Asset.call(this) || this;
    _this.data = _initializer && _initializer();
    _this.optimizationPolicy = _initializer2 && _initializer2();
    _this.persistent = _initializer3 && _initializer3();
    _this._createFunction = null;
    _this._instantiatedTimes = 0;
    return _this;
  }
  _inheritsLoose(Prefab, _Asset);
  var _proto = Prefab.prototype;
  _proto.createNode = function createNode(cb) {
    var node = legacyCC.instantiate(this);
    node.name = this.name;
    cb(null, node);
  };
  _proto.compileCreateFunction = function compileCreateFunction() {
  };
  _proto._doInstantiate = function _doInstantiate(rootToRedirect) {
    if (!this.data._prefab) {
      warnID(3700);
    }
    if (!this._createFunction) {
      this.compileCreateFunction();
    }
    return this._createFunction(rootToRedirect);
  };
  _proto._instantiate = function _instantiate() {
    var node;
    {
      node = this.data._instantiate();
    }
    ++this._instantiatedTimes;
    return node;
  };
  _proto.initDefault = function initDefault(uuid) {
    _Asset.prototype.initDefault.call(this, uuid);
    this.data = new Node();
    this.data.name = '(Missing Node)';
    var prefabInfo = new legacyCC._PrefabInfo();
    prefabInfo.asset = this;
    prefabInfo.root = this.data;
    this.data._prefab = prefabInfo;
  };
  _proto.validate = function validate() {
    return !!this.data;
  };
  _proto.onLoaded = function onLoaded() {
    var rootNode = this.data;
    expandNestedPrefabInstanceNode(rootNode);
    applyTargetOverrides(rootNode);
  };
  return Prefab;
}(Asset), _Prefab.OptimizationPolicy = OptimizationPolicy, _Prefab.OptimizationPolicyThreshold = 3, _Prefab), _initializer = applyDecoratedInitializer(_class2.prototype, "data", [serializable], function () {
  return null;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "optimizationPolicy", [serializable], function () {
  return OptimizationPolicy.AUTO;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "persistent", [serializable], function () {
  return false;
}), _class2)) || _class);
value(Prefab, '_utils', utils);
legacyCC.Prefab = Prefab;
{
  obsolete(legacyCC, 'cc._Prefab', 'Prefab');
}

export { Acceleration as A, ComponentScheduler as C, EventDispatcherPriority as E, Input as I, NodeActivator as N, Prefab as P, SystemEvent as S, PrivateNode as a, find as f, input as i, systemEvent as s };
//# sourceMappingURL=prefab-DYg_oxpo.js.map
