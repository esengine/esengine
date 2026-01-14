import { _ as _inheritsLoose } from './gc-object-CShF5lzx.js';
import { f as Vec3 } from './index-uXI1_UMk.js';
import { E as Event } from './touch-BKrZ-fxl.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './global-exports-DnCP_14L.js';

var DeviceType;
(function (DeviceType) {
  DeviceType[DeviceType["Other"] = 0] = "Other";
  DeviceType[DeviceType["Left"] = 1] = "Left";
  DeviceType[DeviceType["Right"] = 2] = "Right";
})(DeviceType || (DeviceType = {}));
var XrUIPressEventType;
(function (XrUIPressEventType) {
  XrUIPressEventType["XRUI_HOVER_ENTERED"] = "xrui-hover-entered";
  XrUIPressEventType["XRUI_HOVER_EXITED"] = "xrui-hover-exited";
  XrUIPressEventType["XRUI_HOVER_STAY"] = "xrui-hover-stay";
  XrUIPressEventType["XRUI_CLICK"] = "xrui-click";
  XrUIPressEventType["XRUI_UNCLICK"] = "xrui-unclick";
})(XrUIPressEventType || (XrUIPressEventType = {}));
var XrKeyboardEventType;
(function (XrKeyboardEventType) {
  XrKeyboardEventType["XR_CAPS_LOCK"] = "xr-caps-lock";
  XrKeyboardEventType["XR_KEYBOARD_INIT"] = "xr-keyboard-init";
  XrKeyboardEventType["XR_KEYBOARD_INPUT"] = "xr-keyboard-input";
  XrKeyboardEventType["TO_LATIN"] = "to-latin";
  XrKeyboardEventType["TO_SYMBOL"] = "to-symbol";
  XrKeyboardEventType["TO_MATH_SYMBOL"] = "to-math-symbol";
})(XrKeyboardEventType || (XrKeyboardEventType = {}));
var XrUIPressEvent = function (_Event) {
  function XrUIPressEvent() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Event.call.apply(_Event, [this].concat(args)) || this;
    _this.deviceType = DeviceType.Other;
    _this.hitPoint = new Vec3();
    return _this;
  }
  _inheritsLoose(XrUIPressEvent, _Event);
  return XrUIPressEvent;
}(Event);

export { DeviceType, XrKeyboardEventType, XrUIPressEvent, XrUIPressEventType };
//# sourceMappingURL=xr.js.map
