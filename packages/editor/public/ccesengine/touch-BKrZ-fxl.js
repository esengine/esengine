import { _ as _inheritsLoose, a as _createClass } from './gc-object-CShF5lzx.js';
import { V as Vec2 } from './index-uXI1_UMk.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';

var Event = function () {
  function Event(type, bubbles) {
    this.target = null;
    this.currentTarget = null;
    this.eventPhase = 0;
    this.propagationStopped = false;
    this.propagationImmediateStopped = false;
    this.type = type;
    this.bubbles = !!bubbles;
  }
  var _proto = Event.prototype;
  _proto.unuse = function unuse() {
    this.type = Event.NO_TYPE;
    this.target = null;
    this.currentTarget = null;
    this.eventPhase = Event.NONE;
    this.propagationStopped = false;
    this.propagationImmediateStopped = false;
  };
  _proto.reuse = function reuse(type, bubbles) {
    this.type = type;
    this.bubbles = bubbles || false;
  };
  _proto.isStopped = function isStopped() {
    return this.propagationStopped || this.propagationImmediateStopped;
  };
  _proto.getCurrentTarget = function getCurrentTarget() {
    return this.currentTarget;
  };
  _proto.getType = function getType() {
    return this.type;
  };
  return Event;
}();
Event.NO_TYPE = 'no_type';
Event.TOUCH = 'touch';
Event.MOUSE = 'mouse';
Event.KEYBOARD = 'keyboard';
Event.ACCELERATION = 'acceleration';
Event.NONE = 0;
Event.CAPTURING_PHASE = 1;
Event.AT_TARGET = 2;
Event.BUBBLING_PHASE = 3;
cclegacy.Event = Event;

var SystemEventType;
(function (SystemEventType) {
  SystemEventType["TOUCH_START"] = "touch-start";
  SystemEventType["TOUCH_MOVE"] = "touch-move";
  SystemEventType["TOUCH_END"] = "touch-end";
  SystemEventType["TOUCH_CANCEL"] = "touch-cancel";
  SystemEventType["MOUSE_DOWN"] = "mouse-down";
  SystemEventType["MOUSE_MOVE"] = "mouse-move";
  SystemEventType["MOUSE_UP"] = "mouse-up";
  SystemEventType["MOUSE_WHEEL"] = "mouse-wheel";
  SystemEventType["MOUSE_ENTER"] = "mouse-enter";
  SystemEventType["MOUSE_LEAVE"] = "mouse-leave";
  SystemEventType["KEY_DOWN"] = "keydown";
  SystemEventType["KEY_UP"] = "keyup";
  SystemEventType["DEVICEMOTION"] = "devicemotion";
  SystemEventType["TRANSFORM_CHANGED"] = "transform-changed";
  SystemEventType["SCENE_CHANGED_FOR_PERSISTS"] = "scene-changed-for-persists";
  SystemEventType["SIZE_CHANGED"] = "size-changed";
  SystemEventType["ANCHOR_CHANGED"] = "anchor-changed";
  SystemEventType["COLOR_CHANGED"] = "color-changed";
  SystemEventType["CHILD_ADDED"] = "child-added";
  SystemEventType["CHILD_REMOVED"] = "child-removed";
  SystemEventType["PARENT_CHANGED"] = "parent-changed";
  SystemEventType["NODE_DESTROYED"] = "node-destroyed";
  SystemEventType["LAYER_CHANGED"] = "layer-changed";
  SystemEventType["SIBLING_ORDER_CHANGED"] = "sibling-order-changed";
})(SystemEventType || (SystemEventType = {}));
var InputEventType;
(function (InputEventType) {
  InputEventType["TOUCH_START"] = "touch-start";
  InputEventType["TOUCH_MOVE"] = "touch-move";
  InputEventType["TOUCH_END"] = "touch-end";
  InputEventType["TOUCH_CANCEL"] = "touch-cancel";
  InputEventType["MOUSE_DOWN"] = "mouse-down";
  InputEventType["MOUSE_MOVE"] = "mouse-move";
  InputEventType["MOUSE_UP"] = "mouse-up";
  InputEventType["MOUSE_LEAVE"] = "mouse-leave-window";
  InputEventType["MOUSE_ENTER"] = "mouse-enter-window";
  InputEventType["MOUSE_WHEEL"] = "mouse-wheel";
  InputEventType["KEY_DOWN"] = "keydown";
  InputEventType["KEY_PRESSING"] = "key-pressing";
  InputEventType["KEY_UP"] = "keyup";
  InputEventType["DEVICEMOTION"] = "devicemotion";
  InputEventType["GAMEPAD_INPUT"] = "gamepad-input";
  InputEventType["GAMEPAD_CHANGE"] = "gamepad-change";
  InputEventType["HANDLE_INPUT"] = "handle-input";
  InputEventType["HANDLE_POSE_INPUT"] = "handle-pose-input";
  InputEventType["HMD_POSE_INPUT"] = "hmd-pose-input";
  InputEventType["HANDHELD_POSE_INPUT"] = "handheld-pose-input";
})(InputEventType || (InputEventType = {}));
cclegacy.SystemEventType = SystemEventType;

var EventAcceleration = function (_Event) {
  function EventAcceleration(acc, bubbles) {
    var _this;
    _this = _Event.call(this, SystemEventType.DEVICEMOTION, bubbles) || this;
    _this.acc = acc;
    return _this;
  }
  _inheritsLoose(EventAcceleration, _Event);
  return EventAcceleration;
}(Event);
Event.EventAcceleration = EventAcceleration;

var EventKeyboard = function (_Event) {
  function EventKeyboard(keyCode, eventType, bubbles) {
    var _this;
    if (typeof eventType === 'boolean') {
      var _isPressed = eventType;
      eventType = _isPressed ? SystemEventType.KEY_DOWN : SystemEventType.KEY_UP;
    }
    _this = _Event.call(this, eventType, bubbles) || this;
    _this.rawEvent = void 0;
    _this._isPressed = eventType !== SystemEventType.KEY_UP;
    if (typeof keyCode === 'number') {
      _this.keyCode = keyCode;
    } else {
      _this.keyCode = keyCode.keyCode;
      _this.rawEvent = keyCode;
    }
    _this.windowId = 0;
    return _this;
  }
  _inheritsLoose(EventKeyboard, _Event);
  return _createClass(EventKeyboard, [{
    key: "isPressed",
    get: function get() {
      return this._isPressed;
    }
  }]);
}(Event);
Event.EventKeyboard = EventKeyboard;

var EventMouse = function (_Event) {
  function EventMouse(eventType, bubbles, prevLoc, windowId) {
    var _this;
    _this = _Event.call(this, eventType, bubbles) || this;
    _this.movementX = 0;
    _this.movementY = 0;
    _this.windowId = 0;
    _this.preventSwallow = false;
    _this._button = EventMouse.BUTTON_MISSING;
    _this._x = 0;
    _this._y = 0;
    _this._prevX = 0;
    _this._prevY = 0;
    _this._scrollX = 0;
    _this._scrollY = 0;
    _this._eventType = eventType;
    if (prevLoc) {
      _this._prevX = prevLoc.x;
      _this._prevY = prevLoc.y;
    }
    _this.windowId = windowId !== null && windowId !== void 0 ? windowId : _this.windowId;
    return _this;
  }
  _inheritsLoose(EventMouse, _Event);
  var _proto = EventMouse.prototype;
  _proto.setScrollData = function setScrollData(scrollX, scrollY) {
    this._scrollX = scrollX;
    this._scrollY = scrollY;
  };
  _proto.getScrollX = function getScrollX() {
    return this._scrollX;
  };
  _proto.getScrollY = function getScrollY() {
    return this._scrollY;
  };
  _proto.setLocation = function setLocation(x, y) {
    this._x = x;
    this._y = y;
  };
  _proto.getLocation = function getLocation(out) {
    if (!out) {
      out = new Vec2();
    }
    Vec2.set(out, this._x, this._y);
    return out;
  };
  _proto.getLocationInView = function getLocationInView(out) {
    if (!out) {
      out = new Vec2();
    }
    Vec2.set(out, this._x, cclegacy.view._designResolutionSize.height - this._y);
    return out;
  };
  _proto.getUILocation = function getUILocation(out) {
    if (!out) {
      out = new Vec2();
    }
    Vec2.set(out, this._x, this._y);
    cclegacy.view._convertToUISpace(out);
    return out;
  };
  _proto.getPreviousLocation = function getPreviousLocation(out) {
    if (!out) {
      out = new Vec2();
    }
    Vec2.set(out, this._prevX, this._prevY);
    return out;
  };
  _proto.getUIPreviousLocation = function getUIPreviousLocation(out) {
    if (!out) {
      out = new Vec2();
    }
    Vec2.set(out, this._prevX, this._prevY);
    cclegacy.view._convertToUISpace(out);
    return out;
  };
  _proto.getDelta = function getDelta(out) {
    if (!out) {
      out = new Vec2();
    }
    Vec2.set(out, this._x - this._prevX, this._y - this._prevY);
    return out;
  };
  _proto.getDeltaX = function getDeltaX() {
    return this._x - this._prevX;
  };
  _proto.getDeltaY = function getDeltaY() {
    return this._y - this._prevY;
  };
  _proto.getUIDelta = function getUIDelta(out) {
    if (!out) {
      out = new Vec2();
    }
    var view = cclegacy.view;
    Vec2.set(out, (this._x - this._prevX) / view.getScaleX(), (this._y - this._prevY) / view.getScaleY());
    return out;
  };
  _proto.getUIDeltaX = function getUIDeltaX() {
    return (this._x - this._prevX) / cclegacy.view.getScaleX();
  };
  _proto.getUIDeltaY = function getUIDeltaY() {
    return (this._y - this._prevY) / cclegacy.view.getScaleY();
  };
  _proto.setButton = function setButton(button) {
    this._button = button;
  };
  _proto.getButton = function getButton() {
    return this._button;
  };
  _proto.getLocationX = function getLocationX() {
    return this._x;
  };
  _proto.getLocationY = function getLocationY() {
    return this._y;
  };
  _proto.getUILocationX = function getUILocationX() {
    var view = cclegacy.view;
    var viewport = view.getViewportRect();
    return (this._x - viewport.x) / view.getScaleX();
  };
  _proto.getUILocationY = function getUILocationY() {
    var view = cclegacy.view;
    var viewport = view.getViewportRect();
    return (this._y - viewport.y) / view.getScaleY();
  };
  return _createClass(EventMouse, [{
    key: "eventType",
    get: function get() {
      return this._eventType;
    }
  }]);
}(Event);
EventMouse.BUTTON_MISSING = -1;
EventMouse.BUTTON_LEFT = 0;
EventMouse.BUTTON_RIGHT = 2;
EventMouse.BUTTON_MIDDLE = 1;
EventMouse.BUTTON_4 = 3;
EventMouse.BUTTON_5 = 4;
EventMouse.BUTTON_6 = 5;
EventMouse.BUTTON_7 = 6;
EventMouse.BUTTON_8 = 7;
Event.EventMouse = EventMouse;

var _vec2$1 = new Vec2();
var EventTouch = function (_Event) {
  function EventTouch(changedTouches, bubbles, eventType, touches) {
    var _this;
    if (touches === void 0) {
      touches = [];
    }
    _this = _Event.call(this, eventType, bubbles) || this;
    _this.touch = null;
    _this.simulate = false;
    _this.windowId = 0;
    _this.preventSwallow = false;
    _this._eventCode = eventType;
    _this._touches = changedTouches || [];
    _this._allTouches = touches;
    return _this;
  }
  _inheritsLoose(EventTouch, _Event);
  var _proto = EventTouch.prototype;
  _proto.getEventCode = function getEventCode() {
    return this._eventCode;
  };
  _proto.getTouches = function getTouches() {
    return this._touches;
  };
  _proto.getAllTouches = function getAllTouches() {
    return this._allTouches;
  };
  _proto.setLocation = function setLocation(x, y) {
    if (this.touch) {
      this.touch.setTouchInfo(this.touch.getID(), x, y);
    }
  };
  _proto.getLocation = function getLocation(out) {
    return this.touch ? this.touch.getLocation(out) : new Vec2();
  };
  _proto.getUILocation = function getUILocation(out) {
    return this.touch ? this.touch.getUILocation(out) : new Vec2();
  };
  _proto.getLocationInView = function getLocationInView(out) {
    return this.touch ? this.touch.getLocationInView(out) : new Vec2();
  };
  _proto.getPreviousLocation = function getPreviousLocation(out) {
    return this.touch ? this.touch.getPreviousLocation(out) : new Vec2();
  };
  _proto.getStartLocation = function getStartLocation(out) {
    return this.touch ? this.touch.getStartLocation(out) : new Vec2();
  };
  _proto.getUIStartLocation = function getUIStartLocation(out) {
    return this.touch ? this.touch.getUIStartLocation(out) : new Vec2();
  };
  _proto.getID = function getID() {
    return this.touch ? this.touch.getID() : null;
  };
  _proto.getDelta = function getDelta(out) {
    return this.touch ? this.touch.getDelta(out) : new Vec2();
  };
  _proto.getUIDelta = function getUIDelta(out) {
    return this.touch ? this.touch.getUIDelta(out) : new Vec2();
  };
  _proto.getDeltaX = function getDeltaX() {
    return this.touch ? this.touch.getDelta(_vec2$1).x : 0;
  };
  _proto.getDeltaY = function getDeltaY() {
    return this.touch ? this.touch.getDelta(_vec2$1).y : 0;
  };
  _proto.getLocationX = function getLocationX() {
    return this.touch ? this.touch.getLocationX() : 0;
  };
  _proto.getLocationY = function getLocationY() {
    return this.touch ? this.touch.getLocationY() : 0;
  };
  return EventTouch;
}(Event);
EventTouch.MAX_TOUCHES = 5;
Event.EventTouch = EventTouch;

var EventGamepad = function (_Event) {
  function EventGamepad(type, gamepad) {
    var _this;
    _this = _Event.call(this, type, false) || this;
    _this.gamepad = gamepad;
    return _this;
  }
  _inheritsLoose(EventGamepad, _Event);
  return EventGamepad;
}(Event);

var EventHandle = function (_Event) {
  function EventHandle(eventType, handleInputDevice) {
    var _this;
    _this = _Event.call(this, eventType, false) || this;
    _this.handleInputDevice = handleInputDevice;
    return _this;
  }
  _inheritsLoose(EventHandle, _Event);
  return EventHandle;
}(Event);

var EventHMD = function (_Event) {
  function EventHMD(eventType, hmdInputDevice) {
    var _this;
    _this = _Event.call(this, eventType, false) || this;
    _this.hmdInputDevice = hmdInputDevice;
    return _this;
  }
  _inheritsLoose(EventHMD, _Event);
  return EventHMD;
}(Event);

var EventHandheld = function (_Event) {
  function EventHandheld(eventType, handheldInputDevice) {
    var _this;
    _this = _Event.call(this, eventType, false) || this;
    _this.handheldInputDevice = handheldInputDevice;
    return _this;
  }
  _inheritsLoose(EventHandheld, _Event);
  return EventHandheld;
}(Event);

var KeyCode;
(function (KeyCode) {
  KeyCode[KeyCode["NONE"] = 0] = "NONE";
  KeyCode[KeyCode["MOBILE_BACK"] = 6] = "MOBILE_BACK";
  KeyCode[KeyCode["BACKSPACE"] = 8] = "BACKSPACE";
  KeyCode[KeyCode["TAB"] = 9] = "TAB";
  KeyCode[KeyCode["ENTER"] = 13] = "ENTER";
  KeyCode[KeyCode["SHIFT_LEFT"] = 16] = "SHIFT_LEFT";
  KeyCode[KeyCode["CTRL_LEFT"] = 17] = "CTRL_LEFT";
  KeyCode[KeyCode["ALT_LEFT"] = 18] = "ALT_LEFT";
  KeyCode[KeyCode["PAUSE"] = 19] = "PAUSE";
  KeyCode[KeyCode["CAPS_LOCK"] = 20] = "CAPS_LOCK";
  KeyCode[KeyCode["ESCAPE"] = 27] = "ESCAPE";
  KeyCode[KeyCode["SPACE"] = 32] = "SPACE";
  KeyCode[KeyCode["PAGE_UP"] = 33] = "PAGE_UP";
  KeyCode[KeyCode["PAGE_DOWN"] = 34] = "PAGE_DOWN";
  KeyCode[KeyCode["END"] = 35] = "END";
  KeyCode[KeyCode["HOME"] = 36] = "HOME";
  KeyCode[KeyCode["ARROW_LEFT"] = 37] = "ARROW_LEFT";
  KeyCode[KeyCode["ARROW_UP"] = 38] = "ARROW_UP";
  KeyCode[KeyCode["ARROW_RIGHT"] = 39] = "ARROW_RIGHT";
  KeyCode[KeyCode["ARROW_DOWN"] = 40] = "ARROW_DOWN";
  KeyCode[KeyCode["INSERT"] = 45] = "INSERT";
  KeyCode[KeyCode["DELETE"] = 46] = "DELETE";
  KeyCode[KeyCode["DIGIT_0"] = 48] = "DIGIT_0";
  KeyCode[KeyCode["DIGIT_1"] = 49] = "DIGIT_1";
  KeyCode[KeyCode["DIGIT_2"] = 50] = "DIGIT_2";
  KeyCode[KeyCode["DIGIT_3"] = 51] = "DIGIT_3";
  KeyCode[KeyCode["DIGIT_4"] = 52] = "DIGIT_4";
  KeyCode[KeyCode["DIGIT_5"] = 53] = "DIGIT_5";
  KeyCode[KeyCode["DIGIT_6"] = 54] = "DIGIT_6";
  KeyCode[KeyCode["DIGIT_7"] = 55] = "DIGIT_7";
  KeyCode[KeyCode["DIGIT_8"] = 56] = "DIGIT_8";
  KeyCode[KeyCode["DIGIT_9"] = 57] = "DIGIT_9";
  KeyCode[KeyCode["KEY_A"] = 65] = "KEY_A";
  KeyCode[KeyCode["KEY_B"] = 66] = "KEY_B";
  KeyCode[KeyCode["KEY_C"] = 67] = "KEY_C";
  KeyCode[KeyCode["KEY_D"] = 68] = "KEY_D";
  KeyCode[KeyCode["KEY_E"] = 69] = "KEY_E";
  KeyCode[KeyCode["KEY_F"] = 70] = "KEY_F";
  KeyCode[KeyCode["KEY_G"] = 71] = "KEY_G";
  KeyCode[KeyCode["KEY_H"] = 72] = "KEY_H";
  KeyCode[KeyCode["KEY_I"] = 73] = "KEY_I";
  KeyCode[KeyCode["KEY_J"] = 74] = "KEY_J";
  KeyCode[KeyCode["KEY_K"] = 75] = "KEY_K";
  KeyCode[KeyCode["KEY_L"] = 76] = "KEY_L";
  KeyCode[KeyCode["KEY_M"] = 77] = "KEY_M";
  KeyCode[KeyCode["KEY_N"] = 78] = "KEY_N";
  KeyCode[KeyCode["KEY_O"] = 79] = "KEY_O";
  KeyCode[KeyCode["KEY_P"] = 80] = "KEY_P";
  KeyCode[KeyCode["KEY_Q"] = 81] = "KEY_Q";
  KeyCode[KeyCode["KEY_R"] = 82] = "KEY_R";
  KeyCode[KeyCode["KEY_S"] = 83] = "KEY_S";
  KeyCode[KeyCode["KEY_T"] = 84] = "KEY_T";
  KeyCode[KeyCode["KEY_U"] = 85] = "KEY_U";
  KeyCode[KeyCode["KEY_V"] = 86] = "KEY_V";
  KeyCode[KeyCode["KEY_W"] = 87] = "KEY_W";
  KeyCode[KeyCode["KEY_X"] = 88] = "KEY_X";
  KeyCode[KeyCode["KEY_Y"] = 89] = "KEY_Y";
  KeyCode[KeyCode["KEY_Z"] = 90] = "KEY_Z";
  KeyCode[KeyCode["NUM_0"] = 96] = "NUM_0";
  KeyCode[KeyCode["NUM_1"] = 97] = "NUM_1";
  KeyCode[KeyCode["NUM_2"] = 98] = "NUM_2";
  KeyCode[KeyCode["NUM_3"] = 99] = "NUM_3";
  KeyCode[KeyCode["NUM_4"] = 100] = "NUM_4";
  KeyCode[KeyCode["NUM_5"] = 101] = "NUM_5";
  KeyCode[KeyCode["NUM_6"] = 102] = "NUM_6";
  KeyCode[KeyCode["NUM_7"] = 103] = "NUM_7";
  KeyCode[KeyCode["NUM_8"] = 104] = "NUM_8";
  KeyCode[KeyCode["NUM_9"] = 105] = "NUM_9";
  KeyCode[KeyCode["NUM_MULTIPLY"] = 106] = "NUM_MULTIPLY";
  KeyCode[KeyCode["NUM_PLUS"] = 107] = "NUM_PLUS";
  KeyCode[KeyCode["NUM_SUBTRACT"] = 109] = "NUM_SUBTRACT";
  KeyCode[KeyCode["NUM_DECIMAL"] = 110] = "NUM_DECIMAL";
  KeyCode[KeyCode["NUM_DIVIDE"] = 111] = "NUM_DIVIDE";
  KeyCode[KeyCode["F1"] = 112] = "F1";
  KeyCode[KeyCode["F2"] = 113] = "F2";
  KeyCode[KeyCode["F3"] = 114] = "F3";
  KeyCode[KeyCode["F4"] = 115] = "F4";
  KeyCode[KeyCode["F5"] = 116] = "F5";
  KeyCode[KeyCode["F6"] = 117] = "F6";
  KeyCode[KeyCode["F7"] = 118] = "F7";
  KeyCode[KeyCode["F8"] = 119] = "F8";
  KeyCode[KeyCode["F9"] = 120] = "F9";
  KeyCode[KeyCode["F10"] = 121] = "F10";
  KeyCode[KeyCode["F11"] = 122] = "F11";
  KeyCode[KeyCode["F12"] = 123] = "F12";
  KeyCode[KeyCode["NUM_LOCK"] = 144] = "NUM_LOCK";
  KeyCode[KeyCode["SCROLL_LOCK"] = 145] = "SCROLL_LOCK";
  KeyCode[KeyCode["SEMICOLON"] = 186] = "SEMICOLON";
  KeyCode[KeyCode["EQUAL"] = 187] = "EQUAL";
  KeyCode[KeyCode["COMMA"] = 188] = "COMMA";
  KeyCode[KeyCode["DASH"] = 189] = "DASH";
  KeyCode[KeyCode["PERIOD"] = 190] = "PERIOD";
  KeyCode[KeyCode["SLASH"] = 191] = "SLASH";
  KeyCode[KeyCode["BACK_QUOTE"] = 192] = "BACK_QUOTE";
  KeyCode[KeyCode["BRACKET_LEFT"] = 219] = "BRACKET_LEFT";
  KeyCode[KeyCode["BACKSLASH"] = 220] = "BACKSLASH";
  KeyCode[KeyCode["BRACKET_RIGHT"] = 221] = "BRACKET_RIGHT";
  KeyCode[KeyCode["QUOTE"] = 222] = "QUOTE";
  KeyCode[KeyCode["SHIFT_RIGHT"] = 2000] = "SHIFT_RIGHT";
  KeyCode[KeyCode["CTRL_RIGHT"] = 2001] = "CTRL_RIGHT";
  KeyCode[KeyCode["ALT_RIGHT"] = 2002] = "ALT_RIGHT";
  KeyCode[KeyCode["NUM_ENTER"] = 2003] = "NUM_ENTER";
})(KeyCode || (KeyCode = {}));

var _vec2 = new Vec2();
var Touch = function () {
  function Touch(x, y, id) {
    if (id === void 0) {
      id = 0;
    }
    this._point = new Vec2();
    this._prevPoint = new Vec2();
    this._lastModified = 0;
    this._id = 0;
    this._startPoint = new Vec2();
    this._startPointCaptured = false;
    this.setTouchInfo(id, x, y);
  }
  var _proto = Touch.prototype;
  _proto.getLocation = function getLocation(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._point.x, this._point.y);
    return out;
  };
  _proto.getLocationX = function getLocationX() {
    return this._point.x;
  };
  _proto.getLocationY = function getLocationY() {
    return this._point.y;
  };
  _proto.getUILocation = function getUILocation(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._point.x, this._point.y);
    cclegacy.view._convertToUISpace(out);
    return out;
  };
  _proto.getUILocationX = function getUILocationX() {
    var view = cclegacy.view;
    var viewport = view.getViewportRect();
    return (this._point.x - viewport.x) / view.getScaleX();
  };
  _proto.getUILocationY = function getUILocationY() {
    var view = cclegacy.view;
    var viewport = view.getViewportRect();
    return (this._point.y - viewport.y) / view.getScaleY();
  };
  _proto.getPreviousLocation = function getPreviousLocation(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._prevPoint.x, this._prevPoint.y);
    return out;
  };
  _proto.getUIPreviousLocation = function getUIPreviousLocation(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._prevPoint.x, this._prevPoint.y);
    cclegacy.view._convertToUISpace(out);
    return out;
  };
  _proto.getStartLocation = function getStartLocation(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._startPoint.x, this._startPoint.y);
    return out;
  };
  _proto.getUIStartLocation = function getUIStartLocation(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._startPoint.x, this._startPoint.y);
    cclegacy.view._convertToUISpace(out);
    return out;
  };
  _proto.getDelta = function getDelta(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._point);
    out.subtract(this._prevPoint);
    return out;
  };
  _proto.getUIDelta = function getUIDelta(out) {
    if (!out) {
      out = new Vec2();
    }
    _vec2.set(this._point);
    _vec2.subtract(this._prevPoint);
    var view = cclegacy.view;
    out.set(view.getScaleX(), view.getScaleY());
    Vec2.divide(out, _vec2, out);
    return out;
  };
  _proto.getLocationInView = function getLocationInView(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._point.x, cclegacy.view._designResolutionSize.height - this._point.y);
    return out;
  };
  _proto.getPreviousLocationInView = function getPreviousLocationInView(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._prevPoint.x, cclegacy.view._designResolutionSize.height - this._prevPoint.y);
    return out;
  };
  _proto.getStartLocationInView = function getStartLocationInView(out) {
    if (!out) {
      out = new Vec2();
    }
    out.set(this._startPoint.x, cclegacy.view._designResolutionSize.height - this._startPoint.y);
    return out;
  };
  _proto.getID = function getID() {
    return this._id;
  };
  _proto.setTouchInfo = function setTouchInfo(id, x, y) {
    if (id === void 0) {
      id = 0;
    }
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    this._prevPoint = this._point;
    this._point = new Vec2(x || 0, y || 0);
    this._id = id;
    if (!this._startPointCaptured) {
      this._startPoint = new Vec2(this._point);
      this._startPointCaptured = true;
    }
  };
  _proto.setPoint = function setPoint(x, y) {
    if (typeof x === 'object') {
      this._point.x = x.x;
      this._point.y = x.y;
    } else {
      this._point.x = x || 0;
      this._point.y = y || 0;
    }
    this._lastModified = cclegacy.game.frameStartTime;
  };
  _proto.setPrevPoint = function setPrevPoint(x, y) {
    if (typeof x === 'object') {
      this._prevPoint = new Vec2(x.x, x.y);
    } else {
      this._prevPoint = new Vec2(x || 0, y || 0);
    }
    this._lastModified = cclegacy.game.frameStartTime;
  };
  _proto.clone = function clone() {
    var touchID = this.getID();
    this.getStartLocation(_vec2);
    var clonedTouch = new Touch(_vec2.x, _vec2.y, touchID);
    this.getLocation(_vec2);
    clonedTouch.setPoint(_vec2.x, _vec2.y);
    this.getPreviousLocation(_vec2);
    clonedTouch.setPrevPoint(_vec2);
    return clonedTouch;
  };
  return _createClass(Touch, [{
    key: "lastModified",
    get: function get() {
      return this._lastModified;
    }
  }]);
}();
cclegacy.Touch = Touch;

export { Event as E, InputEventType as I, KeyCode as K, SystemEventType as S, Touch as T, EventAcceleration as a, EventKeyboard as b, EventMouse as c, EventTouch as d, EventGamepad as e, EventHandle as f, EventHMD as g, EventHandheld as h };
//# sourceMappingURL=touch-BKrZ-fxl.js.map
