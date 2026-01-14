import { x as ccenum, _ as _inheritsLoose, e as warn, a as _createClass, b as _applyDecoratedDescriptor, E as Enum, X as contains, a4 as OS, B as BrowserType, w as warnID, W as logID, k as errorID, l as _createForOfIteratorHelperLoose, aw as MutableForwardIterator, d as CCObjectFlags } from './gc-object-CShF5lzx.js';
import { C as Color, c as ccclass, t as type, ab as lerp, f as Vec3, b as applyDecoratedInitializer, s as serializable, u as v3, l as executionOrder, r as requireComponent, M as Mat4, O as screenAdapter, n as sys, N as visibleRect, B as Size, V as Vec2, U as clamp01, v as v2, A as approx, b6 as editorOnly, L as override, E as EPSILON$1, j as removeProperty, G as markAsWarning } from './index-uXI1_UMk.js';
import { a as EDITOR_NOT_IN_PREVIEW } from './_virtual_internal_constants-DWlew7Dp.js';
import { l as legacyCC, a as ccwindow, c as cclegacy } from './global-exports-DnCP_14L.js';
import { S as SpriteFrame } from './sprite-frame-DHXMUUT-.js';
import { S as Sprite, a as SpriteEventType } from './sprite-BKXaVEzt.js';
import { B as BitmapFont, L as Label, V as VerticalTextAlignment } from './label-B6xdfUV_.js';
import { i as input } from './prefab-DYg_oxpo.js';
import { T as TransformBit, N as Node, l as Scene, I as ImageAsset, i as Texture2D } from './scene-vWcxM1_c.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { N as NodeEventType, E as EventHandler, C as Component } from './node-event-Ccvtv8bJ.js';
import './sprite-renderer-C7_6H1N4.js';
import { U as UIRenderer, i as UITransform } from './ui-renderer-JpGcj-VM.js';
import { XrUIPressEventType, XrKeyboardEventType, DeviceType } from './xr.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import { V as View, g as game, v as view } from './deprecated-Dswa7XeN.js';
export { R as ResolutionPolicy } from './deprecated-Dswa7XeN.js';
import { K as KeyCode, I as InputEventType, d as EventTouch, S as SystemEventType, E as Event, e as EventGamepad, f as EventHandle } from './touch-BKrZ-fxl.js';
import { C as Camera } from './camera-component-BFt9vSC_.js';
import './debug-view-BuNhRPv_.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './create-mesh-CfKC5EQd.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './deprecated-n0w4kK7g.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './sorting-layers-BHqhkSbY.js';

var minigame = {};

var _dec$g, _dec2$f, _dec3$e, _dec4$b, _dec5$b, _dec6$5, _dec7$4, _dec8$3, _dec9$3, _dec0$1, _class$g, _class2$e, _initializer$e, _initializer2$d, _initializer3$b, _initializer4$a, _initializer5$8, _initializer6$5, _initializer7$5, _initializer8$5, _initializer9$5, _initializer0$5, _initializer1$5, _initializer10$4, _initializer11$3, _initializer12$2, _Button;
var _tempColor$1 = new Color();
var Transition;
(function (Transition) {
  Transition[Transition["NONE"] = 0] = "NONE";
  Transition[Transition["COLOR"] = 1] = "COLOR";
  Transition[Transition["SPRITE"] = 2] = "SPRITE";
  Transition[Transition["SCALE"] = 3] = "SCALE";
})(Transition || (Transition = {}));
ccenum(Transition);
var State;
(function (State) {
  State[State["NORMAL"] = 0] = "NORMAL";
  State[State["HOVER"] = 1] = "HOVER";
  State[State["PRESSED"] = 2] = "PRESSED";
  State[State["DISABLED"] = 3] = "DISABLED";
})(State || (State = {}));
var ButtonEventType;
(function (ButtonEventType) {
  ButtonEventType["CLICK"] = "click";
})(ButtonEventType || (ButtonEventType = {}));
var Button = (_dec$g = ccclass('cc.Button'), _dec2$f = executionOrder(110), _dec3$e = requireComponent(UITransform), _dec4$b = type(Node), _dec5$b = type(Transition), _dec6$5 = type(SpriteFrame), _dec7$4 = type(SpriteFrame), _dec8$3 = type(SpriteFrame), _dec9$3 = type(SpriteFrame), _dec0$1 = type([EventHandler]), _dec$g(_class$g = _dec2$f(_class$g = _dec3$e(_class$g = (_class2$e = (_Button = function (_Component) {
  function Button() {
    var _this;
    _this = _Component.call(this) || this;
    _this.clickEvents = _initializer$e && _initializer$e();
    _this._interactable = _initializer2$d && _initializer2$d();
    _this._transition = _initializer3$b && _initializer3$b();
    _this._normalColor = _initializer4$a && _initializer4$a();
    _this._hoverColor = _initializer5$8 && _initializer5$8();
    _this._pressedColor = _initializer6$5 && _initializer6$5();
    _this._disabledColor = _initializer7$5 && _initializer7$5();
    _this._normalSprite = _initializer8$5 && _initializer8$5();
    _this._hoverSprite = _initializer9$5 && _initializer9$5();
    _this._pressedSprite = _initializer0$5 && _initializer0$5();
    _this._disabledSprite = _initializer1$5 && _initializer1$5();
    _this._duration = _initializer10$4 && _initializer10$4();
    _this._zoomScale = _initializer11$3 && _initializer11$3();
    _this._target = _initializer12$2 && _initializer12$2();
    _this._pressed = false;
    _this._hovered = false;
    _this._fromColor = new Color();
    _this._toColor = new Color();
    _this._time = 0;
    _this._transitionFinished = true;
    _this._fromScale = v3();
    _this._toScale = v3();
    _this._originalScale = null;
    _this._sprite = null;
    _this._targetScale = v3();
    return _this;
  }
  _inheritsLoose(Button, _Component);
  var _proto = Button.prototype;
  _proto.__preload = function __preload() {
    if (!this.target) {
      this.target = this.node;
    }
    this._applyTarget();
    this._resetState();
  };
  _proto.onEnable = function onEnable() {
    {
      this._registerNodeEvent();
    }
  };
  _proto.onDisable = function onDisable() {
    this._resetState();
    {
      this._unregisterNodeEvent();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this.target.isValid) {
      this._unregisterTargetEvent(this.target);
    }
  };
  _proto.update = function update(dt) {
    var target = this.target;
    if (this._transitionFinished || !target) {
      return;
    }
    if (this._transition !== Transition.COLOR && this._transition !== Transition.SCALE) {
      return;
    }
    this._time += dt;
    var ratio = 1.0;
    if (this._duration > 0) {
      ratio = this._time / this._duration;
    }
    if (ratio >= 1) {
      ratio = 1;
    }
    if (this._transition === Transition.COLOR) {
      var renderComp = target._uiProps.uiComp;
      Color.lerp(_tempColor$1, this._fromColor, this._toColor, ratio);
      if (renderComp) {
        renderComp.color = _tempColor$1;
      }
    } else if (this.transition === Transition.SCALE) {
      target.getScale(this._targetScale);
      this._targetScale.x = lerp(this._fromScale.x, this._toScale.x, ratio);
      this._targetScale.y = lerp(this._fromScale.y, this._toScale.y, ratio);
      target.setScale(this._targetScale);
    }
    if (ratio === 1) {
      this._transitionFinished = true;
    }
  };
  _proto._resizeNodeToTargetNode = function _resizeNodeToTargetNode() {
    if (!this.target) {
      return;
    }
    this.target._getUITransformComp();
  };
  _proto._resetState = function _resetState() {
    this._pressed = false;
    this._hovered = false;
    var target = this.target;
    if (!target) {
      return;
    }
    var transition = this._transition;
    if (transition === Transition.COLOR && this._interactable) {
      var renderComp = target.getComponent(UIRenderer);
      if (renderComp) {
        renderComp.color = this._normalColor;
      }
    } else if (transition === Transition.SCALE && this._originalScale) {
      target.setScale(this._originalScale);
    }
    this._transitionFinished = true;
  };
  _proto._registerNodeEvent = function _registerNodeEvent() {
    var self = this;
    var node = self.node;
    node.on(NodeEventType.TOUCH_START, self._onTouchBegan, self);
    node.on(NodeEventType.TOUCH_MOVE, self._onTouchMove, self);
    node.on(NodeEventType.TOUCH_END, self._onTouchEnded, self);
    node.on(NodeEventType.TOUCH_CANCEL, self._onTouchCancel, self);
    node.on(NodeEventType.MOUSE_ENTER, self._onMouseMoveIn, self);
    node.on(NodeEventType.MOUSE_LEAVE, self._onMouseMoveOut, self);
    {
      node.on(XrUIPressEventType.XRUI_HOVER_ENTERED, self._xrHoverEnter, self);
      node.on(XrUIPressEventType.XRUI_HOVER_EXITED, self._xrHoverExit, self);
      node.on(XrUIPressEventType.XRUI_CLICK, self._xrClick, self);
      node.on(XrUIPressEventType.XRUI_UNCLICK, self._xrUnClick, self);
    }
  };
  _proto._registerTargetEvent = function _registerTargetEvent(target) {
    target.on(NodeEventType.TRANSFORM_CHANGED, this._onTargetTransformChanged, this);
  };
  _proto._unregisterNodeEvent = function _unregisterNodeEvent() {
    var self = this;
    var node = self.node;
    node.off(NodeEventType.TOUCH_START, self._onTouchBegan, self);
    node.off(NodeEventType.TOUCH_MOVE, self._onTouchMove, self);
    node.off(NodeEventType.TOUCH_END, self._onTouchEnded, self);
    node.off(NodeEventType.TOUCH_CANCEL, self._onTouchCancel, self);
    node.off(NodeEventType.MOUSE_ENTER, self._onMouseMoveIn, self);
    node.off(NodeEventType.MOUSE_LEAVE, self._onMouseMoveOut, self);
    {
      node.off(XrUIPressEventType.XRUI_HOVER_ENTERED, self._xrHoverEnter, self);
      node.off(XrUIPressEventType.XRUI_HOVER_EXITED, self._xrHoverExit, self);
      node.off(XrUIPressEventType.XRUI_CLICK, self._xrClick, self);
      node.off(XrUIPressEventType.XRUI_UNCLICK, self._xrUnClick, self);
    }
  };
  _proto._unregisterTargetEvent = function _unregisterTargetEvent(target) {
    target.off(NodeEventType.TRANSFORM_CHANGED);
  };
  _proto._getTargetSprite = function _getTargetSprite(target) {
    var sprite = null;
    if (target) {
      sprite = target.getComponent(Sprite);
    }
    return sprite;
  };
  _proto._applyTarget = function _applyTarget() {
    if (this.target) {
      this._sprite = this._getTargetSprite(this.target);
      if (!this._originalScale) {
        this._originalScale = new Vec3();
      }
      Vec3.copy(this._originalScale, this.target.scale);
      this._registerTargetEvent(this.target);
    }
  };
  _proto._onTargetSpriteFrameChanged = function _onTargetSpriteFrameChanged(comp) {
    if (this._transition === Transition.SPRITE) {
      this._setCurrentStateSpriteFrame(comp.spriteFrame);
    }
  };
  _proto._setCurrentStateSpriteFrame = function _setCurrentStateSpriteFrame(spriteFrame) {
    if (!spriteFrame) {
      return;
    }
    switch (this._getButtonState()) {
      case State.NORMAL:
        this._normalSprite = spriteFrame;
        break;
      case State.HOVER:
        this._hoverSprite = spriteFrame;
        break;
      case State.PRESSED:
        this._pressedSprite = spriteFrame;
        break;
      case State.DISABLED:
        this._disabledSprite = spriteFrame;
        break;
    }
  };
  _proto._onTargetColorChanged = function _onTargetColorChanged(color) {
    if (this._transition === Transition.COLOR) {
      this._setCurrentStateColor(color);
    }
  };
  _proto._setCurrentStateColor = function _setCurrentStateColor(color) {
    switch (this._getButtonState()) {
      case State.NORMAL:
        this._normalColor = color;
        break;
      case State.HOVER:
        this._hoverColor = color;
        break;
      case State.PRESSED:
        this._pressedColor = color;
        break;
      case State.DISABLED:
        this._disabledColor = color;
        break;
    }
  };
  _proto._onTargetTransformChanged = function _onTargetTransformChanged(transformBit) {
    if (transformBit & TransformBit.SCALE && this._originalScale && this._transition === Transition.SCALE && this._transitionFinished) {
      Vec3.copy(this._originalScale, this.target.scale);
    }
  };
  _proto._onTouchBegan = function _onTouchBegan(event) {
    if (!this._interactable || !this.enabledInHierarchy) {
      return;
    }
    this._pressed = true;
    this._updateState();
    if (event) {
      event.propagationStopped = true;
    }
  };
  _proto._onTouchMove = function _onTouchMove(event) {
    if (!this._interactable || !this.enabledInHierarchy || !this._pressed) {
      return;
    }
    if (!event) {
      return;
    }
    var touch = event.touch;
    if (!touch) {
      return;
    }
    var hit = this.node._getUITransformComp().hitTest(touch.getLocation(), event.windowId);
    if (this._transition === Transition.SCALE && this.target && this._originalScale) {
      if (hit) {
        Vec3.copy(this._fromScale, this._originalScale);
        Vec3.multiplyScalar(this._toScale, this._originalScale, this._zoomScale);
        this._transitionFinished = false;
      } else {
        this._time = 0;
        this._transitionFinished = true;
        this.target.setScale(this._originalScale);
      }
    } else {
      var state;
      if (hit) {
        state = State.PRESSED;
      } else {
        state = State.NORMAL;
      }
      this._applyTransition(state);
    }
    if (event) {
      event.propagationStopped = true;
    }
  };
  _proto._onTouchEnded = function _onTouchEnded(event) {
    if (!this._interactable || !this.enabledInHierarchy) {
      return;
    }
    if (this._pressed) {
      EventHandler.emitEvents(this.clickEvents, event);
      this.node.emit(ButtonEventType.CLICK, this);
    }
    this._pressed = false;
    this._updateState();
    if (event) {
      event.propagationStopped = true;
    }
  };
  _proto._onTouchCancel = function _onTouchCancel(event) {
    if (!this._interactable || !this.enabledInHierarchy) {
      return;
    }
    this._pressed = false;
    this._updateState();
  };
  _proto._onMouseMoveIn = function _onMouseMoveIn(event) {
    if (this._pressed || !this.interactable || !this.enabledInHierarchy) {
      return;
    }
    if (this._transition === Transition.SPRITE && !this._hoverSprite) {
      return;
    }
    if (!this._hovered) {
      this._hovered = true;
      this._updateState();
    }
  };
  _proto._onMouseMoveOut = function _onMouseMoveOut(event) {
    if (this._hovered) {
      this._hovered = false;
      this._updateState();
    }
  };
  _proto._updateState = function _updateState() {
    var state = this._getButtonState();
    this._applyTransition(state);
  };
  _proto._getButtonState = function _getButtonState() {
    var state = State.NORMAL;
    if (!this._interactable) {
      state = State.DISABLED;
    } else if (this._pressed) {
      state = State.PRESSED;
    } else if (this._hovered) {
      state = State.HOVER;
    }
    return state;
  };
  _proto._updateColorTransition = function _updateColorTransition(state) {
    var _this$target;
    var color = this._getColorByState(state);
    var renderComp = (_this$target = this.target) == null ? void 0 : _this$target.getComponent(UIRenderer);
    if (!renderComp) {
      return;
    }
    if (state === State.DISABLED) {
      renderComp.color = color;
      this._transitionFinished = true;
    } else {
      this._fromColor = renderComp.color.clone();
      this._toColor = color;
      this._time = 0;
      this._transitionFinished = false;
    }
  };
  _proto._updateSpriteTransition = function _updateSpriteTransition(state) {
    var sprite = this._getSpriteFrameByState(state);
    if (this._sprite && sprite) {
      this._sprite.spriteFrame = sprite;
    }
  };
  _proto._updateScaleTransition = function _updateScaleTransition(state) {
    if (!this._interactable) {
      return;
    }
    if (state === State.PRESSED) {
      this._zoomUp();
    } else {
      this._zoomBack();
    }
  };
  _proto._zoomUp = function _zoomUp() {
    if (!this._originalScale) {
      return;
    }
    Vec3.copy(this._fromScale, this._originalScale);
    Vec3.multiplyScalar(this._toScale, this._originalScale, this._zoomScale);
    this._time = 0;
    this._transitionFinished = false;
  };
  _proto._zoomBack = function _zoomBack() {
    if (!this.target || !this._originalScale) {
      return;
    }
    Vec3.copy(this._fromScale, this.target.scale);
    Vec3.copy(this._toScale, this._originalScale);
    this._time = 0;
    this._transitionFinished = false;
  };
  _proto._applyTransition = function _applyTransition(state) {
    var transition = this._transition;
    if (transition === Transition.COLOR) {
      this._updateColorTransition(state);
    } else if (transition === Transition.SPRITE) {
      this._updateSpriteTransition(state);
    } else if (transition === Transition.SCALE) {
      this._updateScaleTransition(state);
    }
  };
  _proto._getSpriteFrameByState = function _getSpriteFrameByState(state) {
    switch (state) {
      case State.NORMAL:
        return this._normalSprite;
      case State.DISABLED:
        return this._disabledSprite;
      case State.HOVER:
        return this.hoverSprite;
      case State.PRESSED:
        return this._pressedSprite;
      default:
        {
          warn('Button._getColorByState(): wrong state.');
        }
        return null;
    }
  };
  _proto._getColorByState = function _getColorByState(state) {
    switch (state) {
      case State.NORMAL:
        return this._normalColor;
      case State.DISABLED:
        return this._disabledColor;
      case State.HOVER:
        return this._hoverColor;
      case State.PRESSED:
        return this._pressedColor;
      default:
        {
          warn('Button._getColorByState(): wrong state.');
        }
        return new Color();
    }
  };
  _proto._xrHoverEnter = function _xrHoverEnter() {
    this._onMouseMoveIn();
    this._updateState();
  };
  _proto._xrHoverExit = function _xrHoverExit() {
    this._onMouseMoveOut();
    if (this._pressed) {
      this._pressed = false;
      this._updateState();
    }
  };
  _proto._xrClick = function _xrClick() {
    if (!this._interactable || !this.enabledInHierarchy) {
      return;
    }
    this._pressed = true;
    this._updateState();
  };
  _proto._xrUnClick = function _xrUnClick() {
    if (!this._interactable || !this.enabledInHierarchy) {
      return;
    }
    if (this._pressed) {
      EventHandler.emitEvents(this.clickEvents, this);
      this.node.emit(ButtonEventType.CLICK, this);
    }
    this._pressed = false;
    this._updateState();
  };
  return _createClass(Button, [{
    key: "target",
    get: function get() {
      return this._target || this.node;
    },
    set: function set(value) {
      if (this._target === value) {
        return;
      }
      if (this._target) {
        this._unregisterTargetEvent(this._target);
      }
      this._target = value;
      this._applyTarget();
    }
  }, {
    key: "interactable",
    get: function get() {
      return this._interactable;
    },
    set: function set(value) {
      if (this._interactable === value) {
        return;
      }
      this._interactable = value;
      this._updateState();
      if (!this._interactable) {
        this._resetState();
      }
    }
  }, {
    key: "_resizeToTarget",
    set: function set(value) {
      if (value) {
        this._resizeNodeToTargetNode();
      }
    }
  }, {
    key: "transition",
    get: function get() {
      return this._transition;
    },
    set: function set(value) {
      if (this._transition === value) {
        return;
      }
      if (this._transition === Transition.COLOR) {
        this._updateColorTransition(State.NORMAL);
      } else if (this._transition === Transition.SPRITE) {
        this._updateSpriteTransition(State.NORMAL);
      }
      this._transition = value;
      this._updateState();
    }
  }, {
    key: "normalColor",
    get: function get() {
      return this._normalColor;
    },
    set: function set(value) {
      if (this._normalColor === value) {
        return;
      }
      this._normalColor.set(value);
      this._updateState();
    }
  }, {
    key: "pressedColor",
    get: function get() {
      return this._pressedColor;
    },
    set: function set(value) {
      if (this._pressedColor === value) {
        return;
      }
      this._pressedColor.set(value);
    }
  }, {
    key: "hoverColor",
    get: function get() {
      return this._hoverColor;
    },
    set: function set(value) {
      if (this._hoverColor === value) {
        return;
      }
      this._hoverColor.set(value);
    }
  }, {
    key: "disabledColor",
    get: function get() {
      return this._disabledColor;
    },
    set: function set(value) {
      if (this._disabledColor === value) {
        return;
      }
      this._disabledColor.set(value);
      this._updateState();
    }
  }, {
    key: "duration",
    get: function get() {
      return this._duration;
    },
    set: function set(value) {
      if (this._duration === value) {
        return;
      }
      this._duration = value;
    }
  }, {
    key: "zoomScale",
    get: function get() {
      return this._zoomScale;
    },
    set: function set(value) {
      if (this._zoomScale === value) {
        return;
      }
      this._zoomScale = value;
    }
  }, {
    key: "normalSprite",
    get: function get() {
      return this._normalSprite;
    },
    set: function set(value) {
      if (this._normalSprite === value) {
        return;
      }
      this._normalSprite = value;
      var sprite = this.node.getComponent(Sprite);
      if (sprite) {
        sprite.spriteFrame = value;
      }
      this._updateState();
    }
  }, {
    key: "pressedSprite",
    get: function get() {
      return this._pressedSprite;
    },
    set: function set(value) {
      if (this._pressedSprite === value) {
        return;
      }
      this._pressedSprite = value;
      this._updateState();
    }
  }, {
    key: "hoverSprite",
    get: function get() {
      return this._hoverSprite;
    },
    set: function set(value) {
      if (this._hoverSprite === value) {
        return;
      }
      this._hoverSprite = value;
      this._updateState();
    }
  }, {
    key: "disabledSprite",
    get: function get() {
      return this._disabledSprite;
    },
    set: function set(value) {
      if (this._disabledSprite === value) {
        return;
      }
      this._disabledSprite = value;
      this._updateState();
    }
  }]);
}(Component), _Button.Transition = Transition, _Button.EventType = ButtonEventType, _Button), _applyDecoratedDescriptor(_class2$e.prototype, "target", [_dec4$b], Object.getOwnPropertyDescriptor(_class2$e.prototype, "target"), _class2$e.prototype), _applyDecoratedDescriptor(_class2$e.prototype, "transition", [_dec5$b], Object.getOwnPropertyDescriptor(_class2$e.prototype, "transition"), _class2$e.prototype), _applyDecoratedDescriptor(_class2$e.prototype, "normalSprite", [_dec6$5], Object.getOwnPropertyDescriptor(_class2$e.prototype, "normalSprite"), _class2$e.prototype), _applyDecoratedDescriptor(_class2$e.prototype, "pressedSprite", [_dec7$4], Object.getOwnPropertyDescriptor(_class2$e.prototype, "pressedSprite"), _class2$e.prototype), _applyDecoratedDescriptor(_class2$e.prototype, "hoverSprite", [_dec8$3], Object.getOwnPropertyDescriptor(_class2$e.prototype, "hoverSprite"), _class2$e.prototype), _applyDecoratedDescriptor(_class2$e.prototype, "disabledSprite", [_dec9$3], Object.getOwnPropertyDescriptor(_class2$e.prototype, "disabledSprite"), _class2$e.prototype), _initializer$e = applyDecoratedInitializer(_class2$e.prototype, "clickEvents", [_dec0$1, serializable], function () {
  return [];
}), _initializer2$d = applyDecoratedInitializer(_class2$e.prototype, "_interactable", [serializable], function () {
  return true;
}), _initializer3$b = applyDecoratedInitializer(_class2$e.prototype, "_transition", [serializable], function () {
  return Transition.NONE;
}), _initializer4$a = applyDecoratedInitializer(_class2$e.prototype, "_normalColor", [serializable], function () {
  return Color.WHITE.clone();
}), _initializer5$8 = applyDecoratedInitializer(_class2$e.prototype, "_hoverColor", [serializable], function () {
  return new Color(211, 211, 211, 255);
}), _initializer6$5 = applyDecoratedInitializer(_class2$e.prototype, "_pressedColor", [serializable], function () {
  return Color.WHITE.clone();
}), _initializer7$5 = applyDecoratedInitializer(_class2$e.prototype, "_disabledColor", [serializable], function () {
  return new Color(124, 124, 124, 255);
}), _initializer8$5 = applyDecoratedInitializer(_class2$e.prototype, "_normalSprite", [serializable], function () {
  return null;
}), _initializer9$5 = applyDecoratedInitializer(_class2$e.prototype, "_hoverSprite", [serializable], function () {
  return null;
}), _initializer0$5 = applyDecoratedInitializer(_class2$e.prototype, "_pressedSprite", [serializable], function () {
  return null;
}), _initializer1$5 = applyDecoratedInitializer(_class2$e.prototype, "_disabledSprite", [serializable], function () {
  return null;
}), _initializer10$4 = applyDecoratedInitializer(_class2$e.prototype, "_duration", [serializable], function () {
  return 0.1;
}), _initializer11$3 = applyDecoratedInitializer(_class2$e.prototype, "_zoomScale", [serializable], function () {
  return 1.2;
}), _initializer12$2 = applyDecoratedInitializer(_class2$e.prototype, "_target", [serializable], function () {
  return null;
}), _class2$e)) || _class$g) || _class$g) || _class$g);
legacyCC.Button = Button;

var tabIndexUtil = function () {
  function tabIndexUtil() {}
  tabIndexUtil.add = function add(editBoxImpl) {
    var list = this._tabIndexList;
    var index = list.indexOf(editBoxImpl);
    if (index === -1) {
      list.push(editBoxImpl);
    }
  };
  tabIndexUtil.remove = function remove(editBoxImpl) {
    var list = this._tabIndexList;
    var index = list.indexOf(editBoxImpl);
    if (index !== -1) {
      list.splice(index, 1);
    }
  };
  tabIndexUtil.resort = function resort() {
    this._tabIndexList.sort(function (a, b) {
      return a._delegate.tabIndex - b._delegate.tabIndex;
    });
  };
  tabIndexUtil.next = function next(editBoxImpl) {
    var list = this._tabIndexList;
    var index = list.indexOf(editBoxImpl);
    editBoxImpl.setFocus(false);
    if (index !== -1) {
      var nextImpl = list[index + 1];
      if (nextImpl && nextImpl._delegate.tabIndex >= 0) {
        nextImpl.setFocus(true);
      }
    }
  };
  return tabIndexUtil;
}();
tabIndexUtil._tabIndexList = [];

var KeyboardReturnType;
(function (KeyboardReturnType) {
  KeyboardReturnType[KeyboardReturnType["DEFAULT"] = 0] = "DEFAULT";
  KeyboardReturnType[KeyboardReturnType["DONE"] = 1] = "DONE";
  KeyboardReturnType[KeyboardReturnType["SEND"] = 2] = "SEND";
  KeyboardReturnType[KeyboardReturnType["SEARCH"] = 3] = "SEARCH";
  KeyboardReturnType[KeyboardReturnType["GO"] = 4] = "GO";
  KeyboardReturnType[KeyboardReturnType["NEXT"] = 5] = "NEXT";
})(KeyboardReturnType || (KeyboardReturnType = {}));
Enum(KeyboardReturnType);
var InputMode;
(function (InputMode) {
  InputMode[InputMode["ANY"] = 0] = "ANY";
  InputMode[InputMode["EMAIL_ADDR"] = 1] = "EMAIL_ADDR";
  InputMode[InputMode["NUMERIC"] = 2] = "NUMERIC";
  InputMode[InputMode["PHONE_NUMBER"] = 3] = "PHONE_NUMBER";
  InputMode[InputMode["URL"] = 4] = "URL";
  InputMode[InputMode["DECIMAL"] = 5] = "DECIMAL";
  InputMode[InputMode["SINGLE_LINE"] = 6] = "SINGLE_LINE";
})(InputMode || (InputMode = {}));
Enum(InputMode);
var InputFlag;
(function (InputFlag) {
  InputFlag[InputFlag["PASSWORD"] = 0] = "PASSWORD";
  InputFlag[InputFlag["SENSITIVE"] = 1] = "SENSITIVE";
  InputFlag[InputFlag["INITIAL_CAPS_WORD"] = 2] = "INITIAL_CAPS_WORD";
  InputFlag[InputFlag["INITIAL_CAPS_SENTENCE"] = 3] = "INITIAL_CAPS_SENTENCE";
  InputFlag[InputFlag["INITIAL_CAPS_ALL_CHARACTERS"] = 4] = "INITIAL_CAPS_ALL_CHARACTERS";
  InputFlag[InputFlag["DEFAULT"] = 5] = "DEFAULT";
})(InputFlag || (InputFlag = {}));
Enum(InputFlag);

var EditBoxImplBase = function () {
  function EditBoxImplBase() {
    this._editing = false;
    this._delegate = null;
  }
  var _proto = EditBoxImplBase.prototype;
  _proto.init = function init(delegate) {};
  _proto.onEnable = function onEnable() {};
  _proto.beforeDraw = function beforeDraw() {};
  _proto.onDisable = function onDisable() {
    if (this._editing) {
      this.endEditing();
    }
  };
  _proto.clear = function clear() {
    this._delegate = null;
  };
  _proto.setTabIndex = function setTabIndex(index) {};
  _proto.setSize = function setSize(width, height) {};
  _proto.setFocus = function setFocus(value) {
    if (value) {
      this.beginEditing();
    } else {
      this.endEditing();
    }
  };
  _proto.isFocused = function isFocused() {
    return this._editing;
  };
  _proto.beginEditing = function beginEditing() {};
  _proto.endEditing = function endEditing() {};
  return EditBoxImplBase;
}();

var ccdocument = ccwindow.document;
var SCROLLY = 40;
var LEFT_PADDING$1 = 2;
var DELAY_TIME = 400;
var _matrix = new Mat4();
var _matrix_temp = new Mat4();
var _vec3 = new Vec3();
var _currentEditBoxImpl = null;
var _domCount = 0;
var EditBoxImpl = function (_EditBoxImplBase) {
  function EditBoxImpl() {
    var _this;
    _this = _EditBoxImplBase.call(this) || this;
    _this._delegate = null;
    _this._inputMode = -1;
    _this._inputFlag = -1;
    _this._returnType = -1;
    _this.__eventListeners = {};
    _this.__autoResize = false;
    _this.__orientationChanged = void 0;
    _this._edTxt = null;
    _this._isTextArea = false;
    _this._textLabelFont = null;
    _this._textLabelFontSize = null;
    _this._textLabelFontColor = null;
    _this._textLabelAlign = null;
    _this._placeholderLabelFont = null;
    _this._placeholderLabelFontSize = null;
    _this._placeholderLabelFontColor = null;
    _this._placeholderLabelAlign = null;
    _this._placeholderLineHeight = null;
    _this._placeholderStyleSheet = null;
    _this._domId = "EditBoxId_" + ++_domCount;
    _this._forceUpdate = false;
    return _this;
  }
  _inheritsLoose(EditBoxImpl, _EditBoxImplBase);
  var _proto = EditBoxImpl.prototype;
  _proto.init = function init(delegate) {
    if (!delegate) {
      return;
    }
    this._delegate = delegate;
    if (delegate.inputMode === InputMode.ANY) {
      this._createTextArea();
    } else {
      this._createInput();
    }
    tabIndexUtil.add(this);
    this.setTabIndex(delegate.tabIndex);
    this._initStyleSheet();
    this._registerEventListeners();
    this._addDomToGameContainer();
    View.instance.on('canvas-resize', this._resize, this);
    screenAdapter.on('window-resize', this._resize, this);
  };
  _proto.clear = function clear() {
    View.instance.off('canvas-resize', this._resize, this);
    screenAdapter.off('window-resize', this._resize, this);
    this._removeEventListeners();
    this._removeDomFromGameContainer();
    tabIndexUtil.remove(this);
    if (_currentEditBoxImpl === this) {
      _currentEditBoxImpl = null;
    }
    this._delegate = null;
  };
  _proto._resize = function _resize() {
    this._forceUpdate = true;
  };
  _proto.beforeDraw = function beforeDraw() {
    var node = this._delegate.node;
    if (!node.hasChangedFlags && !this._forceUpdate) {
      return;
    }
    this._forceUpdate = false;
    this._updateMatrix();
  };
  _proto.setTabIndex = function setTabIndex(index) {
    this._edTxt.tabIndex = index;
    tabIndexUtil.resort();
  };
  _proto.setSize = function setSize(width, height) {
    var elem = this._edTxt;
    if (elem) {
      elem.style.width = width + "px";
      elem.style.height = height + "px";
    }
  };
  _proto.beginEditing = function beginEditing() {
    if (_currentEditBoxImpl && _currentEditBoxImpl !== this) {
      _currentEditBoxImpl.setFocus(false);
    }
    this._editing = true;
    _currentEditBoxImpl = this;
    this._delegate._editBoxEditingDidBegan();
    this._showDom();
    this._edTxt.focus();
  };
  _proto.endEditing = function endEditing() {
    this._edTxt.blur();
  };
  _proto._createInput = function _createInput() {
    this._isTextArea = false;
    this._edTxt = ccdocument.createElement('input');
  };
  _proto._createTextArea = function _createTextArea() {
    this._isTextArea = true;
    this._edTxt = ccdocument.createElement('textarea');
  };
  _proto._addDomToGameContainer = function _addDomToGameContainer() {
    if (game.container && this._edTxt) {
      game.container.appendChild(this._edTxt);
      ccdocument.head.appendChild(this._placeholderStyleSheet);
    }
  };
  _proto._removeDomFromGameContainer = function _removeDomFromGameContainer() {
    var hasElem = contains(game.container, this._edTxt);
    if (hasElem && this._edTxt) {
      game.container.removeChild(this._edTxt);
    }
    var hasStyleSheet = contains(ccdocument.head, this._placeholderStyleSheet);
    if (hasStyleSheet) {
      ccdocument.head.removeChild(this._placeholderStyleSheet);
    }
    this._edTxt = null;
    this._placeholderStyleSheet = null;
  };
  _proto._showDom = function _showDom() {
    this._updateMaxLength();
    this._updateInputType();
    this._updateStyleSheet();
    if (this._edTxt && this._delegate) {
      this._edTxt.style.display = '';
      this._delegate._hideLabels();
    }
    if (sys.isMobile) {
      this._showDomOnMobile();
    }
  };
  _proto._hideDom = function _hideDom() {
    var elem = this._edTxt;
    if (elem && this._delegate) {
      elem.style.display = 'none';
      this._delegate._showLabels();
    }
    if (sys.isMobile) {
      this._hideDomOnMobile();
    }
  };
  _proto._showDomOnMobile = function _showDomOnMobile() {
    if (sys.os !== OS.ANDROID && sys.os !== OS.OHOS) {
      return;
    }
    screenAdapter.handleResizeEvent = false;
    this._adjustWindowScroll();
  };
  _proto._hideDomOnMobile = function _hideDomOnMobile() {
    if (sys.os === OS.ANDROID || sys.os === OS.OHOS) {
      screenAdapter.handleResizeEvent = true;
    }
    this._scrollBackWindow();
  };
  _proto._isElementInViewport = function _isElementInViewport() {
    if (this._edTxt) {
      var rect = this._edTxt.getBoundingClientRect();
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (ccwindow.innerHeight || ccdocument.documentElement.clientHeight) && rect.right <= (ccwindow.innerWidth || ccdocument.documentElement.clientWidth);
    }
    return false;
  };
  _proto._adjustWindowScroll = function _adjustWindowScroll() {
    var _this2 = this;
    setTimeout(function () {
      if (ccwindow.scrollY < SCROLLY && !_this2._isElementInViewport()) {
        _this2._edTxt.scrollIntoView({
          block: 'start',
          inline: 'nearest',
          behavior: 'smooth'
        });
      }
    }, DELAY_TIME);
  };
  _proto._scrollBackWindow = function _scrollBackWindow() {
    setTimeout(function () {
      if (sys.browserType === BrowserType.WECHAT && sys.os === OS.IOS) {
        if (ccwindow.top) {
          ccwindow.top.scrollTo(0, 0);
        }
        return;
      }
      ccwindow.scrollTo(0, 0);
    }, DELAY_TIME);
  };
  _proto._updateMatrix = function _updateMatrix() {
    if (!this._edTxt) {
      return;
    }
    var node = this._delegate.node;
    var scaleX = view.getScaleX();
    var scaleY = view.getScaleY();
    var viewport = view.getViewportRect();
    var dpr = screenAdapter.devicePixelRatio;
    node.getWorldMatrix(_matrix);
    var transform = node._getUITransformComp();
    if (transform) {
      Vec3.set(_vec3, -transform.anchorX * transform.width, -transform.anchorY * transform.height, _vec3.z);
      Mat4.transform(_matrix, _matrix, _vec3);
    }
    if (!node._getUITransformComp()) {
      return;
    }
    var camera = director.root.batcher2D.getFirstRenderCamera(node);
    if (!camera) return;
    camera.node.getWorldRT(_matrix_temp);
    var m12 = _matrix_temp.m12;
    var m13 = _matrix_temp.m13;
    var center = visibleRect.center;
    _matrix_temp.m12 = center.x - (_matrix_temp.m00 * m12 + _matrix_temp.m04 * m13);
    _matrix_temp.m13 = center.y - (_matrix_temp.m01 * m12 + _matrix_temp.m05 * m13);
    scaleX /= dpr;
    scaleY /= dpr;
    Vec3.set(_vec3, scaleX, scaleY, 1);
    Mat4.scale(_matrix_temp, _matrix_temp, _vec3);
    var container = game.container;
    var offsetX = parseInt(container && container.style.paddingLeft || '0');
    offsetX += viewport.x / dpr;
    var offsetY = parseInt(container && container.style.paddingBottom || '0');
    offsetY += viewport.y / dpr;
    _matrix_temp.m12 += offsetX;
    _matrix_temp.m13 += offsetY;
    Mat4.multiply(_matrix_temp, _matrix_temp, _matrix);
    var a = _matrix_temp.m00;
    var b = _matrix_temp.m01;
    var c = _matrix_temp.m04;
    var d = _matrix_temp.m05;
    var tx = _matrix_temp.m12;
    var ty = _matrix_temp.m13;
    var matrix = "matrix(" + a + "," + -b + "," + -c + "," + d + "," + tx + "," + -ty + ")";
    this._edTxt.style.transform = matrix;
    this._edTxt.style['-webkit-transform'] = matrix;
    this._edTxt.style['transform-origin'] = '0px 100% 0px';
    this._edTxt.style['-webkit-transform-origin'] = '0px 100% 0px';
  };
  _proto._updateInputType = function _updateInputType() {
    var delegate = this._delegate;
    var inputMode = delegate.inputMode;
    var inputFlag = delegate.inputFlag;
    var returnType = delegate.returnType;
    var elem = this._edTxt;
    if (this._inputMode === inputMode && this._inputFlag === inputFlag && this._returnType === returnType) {
      return;
    }
    this._inputMode = inputMode;
    this._inputFlag = inputFlag;
    this._returnType = returnType;
    if (this._isTextArea) {
      var transform = 'none';
      if (inputFlag === InputFlag.INITIAL_CAPS_ALL_CHARACTERS) {
        transform = 'uppercase';
      } else if (inputFlag === InputFlag.INITIAL_CAPS_WORD) {
        transform = 'capitalize';
      }
      elem.style.textTransform = transform;
      return;
    }
    elem = elem;
    if (inputFlag === InputFlag.PASSWORD) {
      elem.type = 'password';
      elem.style.textTransform = 'none';
      return;
    }
    var type = elem.type;
    if (inputMode === InputMode.EMAIL_ADDR) {
      type = 'email';
    } else if (inputMode === InputMode.NUMERIC) {
      type = 'number';
    } else if (inputMode === InputMode.DECIMAL) {
      type = 'digit';
    } else if (inputMode === InputMode.PHONE_NUMBER) {
      type = 'tel';
      elem.addEventListener('wheel', function () {
        return false;
      });
    } else if (inputMode === InputMode.URL) {
      type = 'url';
    } else {
      type = 'text';
      if (returnType === KeyboardReturnType.SEARCH) {
        type = 'search';
      }
    }
    elem.type = type;
    var textTransform = 'none';
    if (inputFlag === InputFlag.INITIAL_CAPS_ALL_CHARACTERS) {
      textTransform = 'uppercase';
    } else if (inputFlag === InputFlag.INITIAL_CAPS_WORD) {
      textTransform = 'capitalize';
    }
    elem.style.textTransform = textTransform;
  };
  _proto._updateMaxLength = function _updateMaxLength() {
    var maxLength = this._delegate.maxLength;
    if (maxLength < 0) {
      maxLength = 65535;
    }
    this._edTxt.maxLength = maxLength;
  };
  _proto._initStyleSheet = function _initStyleSheet() {
    if (!this._edTxt) {
      return;
    }
    var elem = this._edTxt;
    elem.style.color = '#000000';
    elem.style.border = '0px';
    elem.style.background = 'transparent';
    elem.style.width = '100%';
    elem.style.height = '100%';
    elem.style.outline = 'medium';
    elem.style.padding = '0';
    elem.style.textTransform = 'none';
    elem.style.display = 'none';
    elem.style.position = 'absolute';
    elem.style.bottom = '0px';
    elem.style.left = LEFT_PADDING$1 + "px";
    elem.className = 'cocosEditBox';
    elem.style.fontFamily = 'Arial';
    elem.id = this._domId;
    if (!this._isTextArea) {
      elem = elem;
      elem.type = 'text';
      elem.style['-moz-appearance'] = 'textfield';
    } else {
      elem.style.resize = 'none';
      elem.style.overflowY = 'scroll';
    }
    this._placeholderStyleSheet = ccdocument.createElement('style');
  };
  _proto._updateStyleSheet = function _updateStyleSheet() {
    var delegate = this._delegate;
    var elem = this._edTxt;
    if (elem && delegate) {
      elem.value = delegate.string;
      this._updateTextLabel(delegate.textLabel);
    }
  };
  _proto._updateTextLabel = function _updateTextLabel(textLabel) {
    if (!textLabel) {
      return;
    }
    var font = textLabel.font;
    if (font && !(font instanceof BitmapFont)) {
      font = font._fontFamily;
    } else {
      font = textLabel.fontFamily;
    }
    var fontSize = textLabel.fontSize * textLabel.node.scale.y;
    if (this._textLabelFont === font && this._textLabelFontSize === fontSize && this._textLabelFontColor === textLabel.fontColor && this._textLabelAlign === textLabel.horizontalAlign) {
      return;
    }
    this._textLabelFont = font;
    this._textLabelFontSize = fontSize;
    this._textLabelFontColor = textLabel.fontColor;
    this._textLabelAlign = textLabel.horizontalAlign;
    if (!this._edTxt) {
      return;
    }
    var elem = this._edTxt;
    elem.style.fontSize = fontSize + "px";
    elem.style.color = textLabel.color.toCSS();
    elem.style.fontFamily = font;
    switch (textLabel.horizontalAlign) {
      case Label.HorizontalAlign.LEFT:
        elem.style.textAlign = 'left';
        break;
      case Label.HorizontalAlign.CENTER:
        elem.style.textAlign = 'center';
        break;
      case Label.HorizontalAlign.RIGHT:
        elem.style.textAlign = 'right';
        break;
    }
  };
  _proto._updatePlaceholderLabel = function _updatePlaceholderLabel(placeholderLabel) {
    if (!placeholderLabel) {
      return;
    }
    var font = placeholderLabel.font;
    if (font && !(font instanceof BitmapFont)) {
      font = placeholderLabel.font._fontFamily;
    } else {
      font = placeholderLabel.fontFamily;
    }
    var fontSize = placeholderLabel.fontSize * placeholderLabel.node.scale.y;
    if (this._placeholderLabelFont === font && this._placeholderLabelFontSize === fontSize && this._placeholderLabelFontColor === placeholderLabel.fontColor && this._placeholderLabelAlign === placeholderLabel.horizontalAlign && this._placeholderLineHeight === placeholderLabel.fontSize) {
      return;
    }
    this._placeholderLabelFont = font;
    this._placeholderLabelFontSize = fontSize;
    this._placeholderLabelFontColor = placeholderLabel.fontColor;
    this._placeholderLabelAlign = placeholderLabel.horizontalAlign;
    this._placeholderLineHeight = placeholderLabel.fontSize;
    var styleEl = this._placeholderStyleSheet;
    var fontColor = placeholderLabel.color.toCSS();
    var lineHeight = placeholderLabel.fontSize;
    var horizontalAlign = '';
    switch (placeholderLabel.horizontalAlign) {
      case Label.HorizontalAlign.LEFT:
        horizontalAlign = 'left';
        break;
      case Label.HorizontalAlign.CENTER:
        horizontalAlign = 'center';
        break;
      case Label.HorizontalAlign.RIGHT:
        horizontalAlign = 'right';
        break;
    }
    styleEl.innerHTML = "#" + this._domId + "::-webkit-input-placeholder{text-transform: initial;-family: " + font + ";font-size: " + fontSize + "px;color: " + fontColor + ";line-height: " + lineHeight + "px;text-align: " + horizontalAlign + ";}" + ("#" + this._domId + "::-moz-placeholder{text-transform: initial;-family: " + font + ";font-size: " + fontSize + "px;color: " + fontColor + ";line-height: " + lineHeight + "px;text-align: " + horizontalAlign + ";}") + ("#" + this._domId + "::-ms-input-placeholder{text-transform: initial;-family: " + font + ";font-size: " + fontSize + "px;color: " + fontColor + ";line-height: " + lineHeight + "px;text-align: " + horizontalAlign + ";}");
    if (sys.browserType === BrowserType.EDGE) {
      styleEl.innerHTML += "#" + this._domId + "::-ms-clear{display: none;}";
    }
  };
  _proto._registerEventListeners = function _registerEventListeners() {
    var _this3 = this;
    if (!this._edTxt) {
      return;
    }
    var elem = this._edTxt;
    var inputLock = false;
    var cbs = this.__eventListeners;
    cbs.compositionStart = function () {
      inputLock = true;
    };
    cbs.compositionEnd = function () {
      inputLock = false;
      _this3._delegate._editBoxTextChanged(elem.value);
    };
    cbs.onInput = function () {
      if (inputLock) {
        return;
      }
      var delegate = _this3._delegate;
      var maxLength = delegate.maxLength;
      if (maxLength >= 0 && elem.type !== 'number') {
        elem.value = elem.value.slice(0, maxLength);
      }
      delegate._editBoxTextChanged(elem.value);
    };
    cbs.onClick = function () {
      if (_this3._editing) {
        if (sys.isMobile) {
          _this3._adjustWindowScroll();
        }
      }
    };
    cbs.onKeydown = function (e) {
      if (e.keyCode === KeyCode.ENTER) {
        e.propagationStopped = true;
        _this3._delegate._editBoxEditingReturn();
        if (!_this3._isTextArea) {
          elem.blur();
        }
      } else if (e.keyCode === KeyCode.TAB) {
        e.propagationStopped = true;
        e.preventDefault();
        tabIndexUtil.next(_this3);
      }
    };
    cbs.onBlur = function () {
      if (sys.isMobile && inputLock) {
        cbs.compositionEnd();
      }
      _this3._editing = false;
      _currentEditBoxImpl = null;
      _this3._hideDom();
      _this3._delegate._editBoxEditingDidEnded();
    };
    elem.addEventListener('compositionstart', cbs.compositionStart);
    elem.addEventListener('compositionend', cbs.compositionEnd);
    elem.addEventListener('input', cbs.onInput);
    elem.addEventListener('keydown', cbs.onKeydown);
    elem.addEventListener('blur', cbs.onBlur);
    elem.addEventListener('touchstart', cbs.onClick);
  };
  _proto._removeEventListeners = function _removeEventListeners() {
    if (!this._edTxt) {
      return;
    }
    var elem = this._edTxt;
    var cbs = this.__eventListeners;
    elem.removeEventListener('compositionstart', cbs.compositionStart);
    elem.removeEventListener('compositionend', cbs.compositionEnd);
    elem.removeEventListener('input', cbs.onInput);
    elem.removeEventListener('keydown', cbs.onKeydown);
    elem.removeEventListener('blur', cbs.onBlur);
    elem.removeEventListener('touchstart', cbs.onClick);
    cbs.compositionStart = null;
    cbs.compositionEnd = null;
    cbs.onInput = null;
    cbs.onKeydown = null;
    cbs.onBlur = null;
    cbs.onClick = null;
  };
  return EditBoxImpl;
}(EditBoxImplBase);

var _dec$f, _dec2$e, _dec3$d, _dec4$a, _dec5$a, _dec6$4, _dec7$3, _dec8$2, _dec9$2, _dec0, _dec1, _dec10, _dec11, _class$f, _class2$d, _initializer$d, _initializer2$c, _initializer3$a, _initializer4$9, _initializer5$7, _initializer6$4, _initializer7$4, _initializer8$4, _initializer9$4, _initializer0$4, _initializer1$4, _initializer10$3, _initializer11$2, _EditBox;
var LEFT_PADDING = 2;
function capitalize(str) {
  return str.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
}
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
var EditBoxEventType;
(function (EditBoxEventType) {
  EditBoxEventType["EDITING_DID_BEGAN"] = "editing-did-began";
  EditBoxEventType["EDITING_DID_ENDED"] = "editing-did-ended";
  EditBoxEventType["TEXT_CHANGED"] = "text-changed";
  EditBoxEventType["EDITING_RETURN"] = "editing-return";
  EditBoxEventType["XR_EDITING_DID_BEGAN"] = "xr-editing-did-began";
  EditBoxEventType["XR_EDITING_DID_ENDED"] = "xr-editing-did-ended";
})(EditBoxEventType || (EditBoxEventType = {}));
var EditBox = (_dec$f = ccclass('cc.EditBox'), _dec2$e = executionOrder(110), _dec3$d = requireComponent(UITransform), _dec4$a = type(Label), _dec5$a = type(Label), _dec6$4 = type(SpriteFrame), _dec7$3 = type(InputFlag), _dec8$2 = type(InputMode), _dec9$2 = type(KeyboardReturnType), _dec0 = type([EventHandler]), _dec1 = type([EventHandler]), _dec10 = type([EventHandler]), _dec11 = type([EventHandler]), _dec$f(_class$f = _dec2$e(_class$f = _dec3$d(_class$f = (_class2$d = (_EditBox = function (_Component) {
  function EditBox() {
    var _this;
    _this = _Component.call(this) || this;
    _this.editingDidBegan = _initializer$d && _initializer$d();
    _this.textChanged = _initializer2$c && _initializer2$c();
    _this.editingDidEnded = _initializer3$a && _initializer3$a();
    _this.editingReturn = _initializer4$9 && _initializer4$9();
    _this._impl = null;
    _this._background = null;
    _this._textLabel = _initializer5$7 && _initializer5$7();
    _this._placeholderLabel = _initializer6$4 && _initializer6$4();
    _this._returnType = _initializer7$4 && _initializer7$4();
    _this._string = _initializer8$4 && _initializer8$4();
    _this._tabIndex = _initializer9$4 && _initializer9$4();
    _this._backgroundImage = _initializer0$4 && _initializer0$4();
    _this._inputFlag = _initializer1$4 && _initializer1$4();
    _this._inputMode = _initializer10$3 && _initializer10$3();
    _this._maxLength = _initializer11$2 && _initializer11$2();
    _this._isLabelVisible = false;
    return _this;
  }
  _inheritsLoose(EditBox, _Component);
  var _proto = EditBox.prototype;
  _proto.__preload = function __preload() {
    this._init();
  };
  _proto.onEnable = function onEnable() {
    {
      this._registerEvent();
    }
    this._ensureBackgroundSprite();
    if (this._impl) {
      this._impl.onEnable();
    }
  };
  _proto._beforeDraw = function _beforeDraw() {
    if (this._impl) {
      this._impl.beforeDraw();
    }
  };
  _proto.onDisable = function onDisable() {
    {
      this._unregisterEvent();
    }
    this._unregisterBackgroundEvent();
    if (this._impl) {
      this._impl.onDisable();
    }
  };
  _proto.onDestroy = function onDestroy() {
    director.off(DirectorEvent.BEFORE_DRAW, this._beforeDraw, this);
    if (this._impl) {
      this._impl.clear();
    }
  };
  _proto.setFocus = function setFocus() {
    if (this._impl) {
      this._impl.setFocus(true);
    }
  };
  _proto.focus = function focus() {
    if (this._impl) {
      this._impl.setFocus(true);
    }
  };
  _proto.blur = function blur() {
    if (this._impl) {
      this._impl.setFocus(false);
    }
  };
  _proto.isFocused = function isFocused() {
    if (this._impl) {
      return this._impl.isFocused();
    }
    return false;
  };
  _proto._editBoxEditingDidBegan = function _editBoxEditingDidBegan() {
    EventHandler.emitEvents(this.editingDidBegan, this);
    this.node.emit(EditBoxEventType.EDITING_DID_BEGAN, this);
  };
  _proto._editBoxEditingDidEnded = function _editBoxEditingDidEnded(text) {
    EventHandler.emitEvents(this.editingDidEnded, this);
    this.node.emit(EditBoxEventType.EDITING_DID_ENDED, this, text);
  };
  _proto._editBoxTextChanged = function _editBoxTextChanged(text) {
    text = this._updateLabelStringStyle(text, true);
    this.string = text;
    EventHandler.emitEvents(this.textChanged, text, this);
    this.node.emit(EditBoxEventType.TEXT_CHANGED, this);
  };
  _proto._editBoxEditingReturn = function _editBoxEditingReturn(text) {
    EventHandler.emitEvents(this.editingReturn, this);
    this.node.emit(EditBoxEventType.EDITING_RETURN, this, text);
  };
  _proto._showLabels = function _showLabels() {
    this._isLabelVisible = true;
    this._updateLabels();
  };
  _proto._hideLabels = function _hideLabels() {
    this._isLabelVisible = false;
    if (this._textLabel) {
      this._textLabel.node.active = false;
    }
    if (this._placeholderLabel) {
      this._placeholderLabel.node.active = false;
    }
  };
  _proto._onTouchBegan = function _onTouchBegan(event) {
    event.propagationStopped = true;
  };
  _proto._onTouchCancel = function _onTouchCancel(event) {
    event.propagationStopped = true;
  };
  _proto._onTouchEnded = function _onTouchEnded(event) {
    if (this._impl) {
      this._impl.beginEditing();
    }
    event.propagationStopped = true;
  };
  _proto._init = function _init() {
    this._updatePlaceholderLabel();
    this._updateTextLabel();
    this._isLabelVisible = true;
    this.node.on(NodeEventType.SIZE_CHANGED, this._resizeChildNodes, this);
    director.on(DirectorEvent.BEFORE_DRAW, this._beforeDraw, this);
    var impl = this._impl = new EditBox._EditBoxImpl();
    impl.init(this);
    this._updateString(this._string);
    this._syncSize();
  };
  _proto._ensureBackgroundSprite = function _ensureBackgroundSprite() {
    if (!this._background) {
      var background = this.node.getComponent(Sprite);
      if (!background) {
        background = this.node.addComponent(Sprite);
      }
      if (background !== this._background) {
        background.type = Sprite.Type.SLICED;
        background.spriteFrame = this._backgroundImage;
        this._background = background;
        this._registerBackgroundEvent();
      }
    }
  };
  _proto._updateTextLabel = function _updateTextLabel() {
    var textLabel = this._textLabel;
    if (!textLabel) {
      var node = this.node.getChildByName('TEXT_LABEL');
      if (!node) {
        node = new Node('TEXT_LABEL');
        node.layer = this.node.layer;
      }
      textLabel = node.getComponent(Label);
      if (!textLabel) {
        textLabel = node.addComponent(Label);
      }
      node.parent = this.node;
      this._textLabel = textLabel;
    }
    if (this._inputMode === InputMode.ANY) {
      textLabel.verticalAlign = VerticalTextAlignment.TOP;
      textLabel.enableWrapText = true;
    } else {
      textLabel.enableWrapText = false;
    }
    textLabel.string = this._updateLabelStringStyle(this._string);
  };
  _proto._updatePlaceholderLabel = function _updatePlaceholderLabel() {
    var placeholderLabel = this._placeholderLabel;
    if (!placeholderLabel) {
      var node = this.node.getChildByName('PLACEHOLDER_LABEL');
      if (!node) {
        node = new Node('PLACEHOLDER_LABEL');
        node.layer = this.node.layer;
      }
      placeholderLabel = node.getComponent(Label);
      if (!placeholderLabel) {
        placeholderLabel = node.addComponent(Label);
      }
      node.parent = this.node;
      this._placeholderLabel = placeholderLabel;
    }
    if (this._inputMode === InputMode.ANY) {
      placeholderLabel.enableWrapText = true;
    } else {
      placeholderLabel.enableWrapText = false;
    }
    placeholderLabel.string = this.placeholder;
  };
  _proto._syncSize = function _syncSize() {
    var trans = this.node._getUITransformComp();
    var size = trans.contentSize;
    if (this._background) {
      var bgTrans = this._background.node._getUITransformComp();
      bgTrans.anchorPoint = trans.anchorPoint;
      bgTrans.setContentSize(size);
    }
    this._updateLabelPosition(size);
    if (this._impl) {
      this._impl.setSize(size.width, size.height);
    }
  };
  _proto._updateLabels = function _updateLabels() {
    if (this._isLabelVisible) {
      var content = this._string;
      if (this._textLabel) {
        this._textLabel.node.active = content !== '';
      }
      if (this._placeholderLabel) {
        this._placeholderLabel.node.active = content === '';
      }
    }
  };
  _proto._updateString = function _updateString(text) {
    var textLabel = this._textLabel;
    if (!textLabel) {
      return;
    }
    var displayText = text;
    if (displayText) {
      displayText = this._updateLabelStringStyle(displayText);
    }
    textLabel.string = displayText;
    this._updateLabels();
  };
  _proto._updateLabelStringStyle = function _updateLabelStringStyle(text, ignorePassword) {
    if (ignorePassword === void 0) {
      ignorePassword = false;
    }
    var inputFlag = this._inputFlag;
    if (!ignorePassword && inputFlag === InputFlag.PASSWORD) {
      var passwordString = '';
      var len = text.length;
      for (var i = 0; i < len; ++i) {
        passwordString += "\u25CF";
      }
      text = passwordString;
    } else if (inputFlag === InputFlag.INITIAL_CAPS_ALL_CHARACTERS) {
      text = text.toUpperCase();
    } else if (inputFlag === InputFlag.INITIAL_CAPS_WORD) {
      text = capitalize(text);
    } else if (inputFlag === InputFlag.INITIAL_CAPS_SENTENCE) {
      text = capitalizeFirstLetter(text);
    }
    return text;
  };
  _proto._registerEvent = function _registerEvent() {
    var self = this;
    var node = self.node;
    node.on(NodeEventType.TOUCH_START, self._onTouchBegan, self);
    node.on(NodeEventType.TOUCH_END, self._onTouchEnded, self);
    {
      node.on(XrUIPressEventType.XRUI_UNCLICK, self._xrUnClick, self);
      node.on(XrKeyboardEventType.XR_KEYBOARD_INPUT, self._xrKeyBoardInput, self);
    }
  };
  _proto._unregisterEvent = function _unregisterEvent() {
    var self = this;
    var node = self.node;
    node.off(NodeEventType.TOUCH_START, self._onTouchBegan, self);
    node.off(NodeEventType.TOUCH_END, self._onTouchEnded, self);
    {
      node.off(XrUIPressEventType.XRUI_UNCLICK, self._xrUnClick, self);
      node.off(XrKeyboardEventType.XR_KEYBOARD_INPUT, self._xrKeyBoardInput, self);
    }
  };
  _proto._onBackgroundSpriteFrameChanged = function _onBackgroundSpriteFrameChanged() {
    if (!this._background) {
      return;
    }
    this.backgroundImage = this._background.spriteFrame;
  };
  _proto._registerBackgroundEvent = function _registerBackgroundEvent() {
    var node = this._background && this._background.node;
    node == null ? void 0 : node.on(SpriteEventType.SPRITE_FRAME_CHANGED, this._onBackgroundSpriteFrameChanged, this);
  };
  _proto._unregisterBackgroundEvent = function _unregisterBackgroundEvent() {
    var node = this._background && this._background.node;
    node == null ? void 0 : node.off(SpriteEventType.SPRITE_FRAME_CHANGED, this._onBackgroundSpriteFrameChanged, this);
  };
  _proto._updateLabelPosition = function _updateLabelPosition(size) {
    var trans = this.node._getUITransformComp();
    var offX = -trans.anchorX * trans.width;
    var offY = -trans.anchorY * trans.height;
    var placeholderLabel = this._placeholderLabel;
    var textLabel = this._textLabel;
    if (textLabel) {
      textLabel.node._getUITransformComp().setContentSize(size.width - LEFT_PADDING, size.height);
      textLabel.node.setPosition(offX + LEFT_PADDING, offY + size.height, textLabel.node.position.z);
      if (this._inputMode === InputMode.ANY) {
        textLabel.verticalAlign = VerticalTextAlignment.TOP;
      }
      textLabel.enableWrapText = this._inputMode === InputMode.ANY;
    }
    if (placeholderLabel) {
      placeholderLabel.node._getUITransformComp().setContentSize(size.width - LEFT_PADDING, size.height);
      placeholderLabel.node.setPosition(offX + LEFT_PADDING, offY + size.height, placeholderLabel.node.position.z);
      placeholderLabel.enableWrapText = this._inputMode === InputMode.ANY;
    }
  };
  _proto._resizeChildNodes = function _resizeChildNodes() {
    var trans = this.node._getUITransformComp();
    var textLabelNode = this._textLabel && this._textLabel.node;
    if (textLabelNode) {
      textLabelNode.setPosition(-trans.width / 2, trans.height / 2, textLabelNode.position.z);
      textLabelNode._getUITransformComp().setContentSize(trans.contentSize);
    }
    var placeholderLabelNode = this._placeholderLabel && this._placeholderLabel.node;
    if (placeholderLabelNode) {
      placeholderLabelNode.setPosition(-trans.width / 2, trans.height / 2, placeholderLabelNode.position.z);
      placeholderLabelNode._getUITransformComp().setContentSize(trans.contentSize);
    }
    var backgroundNode = this._background && this._background.node;
    if (backgroundNode) {
      backgroundNode._getUITransformComp().setContentSize(trans.contentSize);
    }
    this._syncSize();
  };
  _proto._xrUnClick = function _xrUnClick() {
    this.node.emit(EditBoxEventType.XR_EDITING_DID_BEGAN, this._maxLength, this.string);
  };
  _proto._xrKeyBoardInput = function _xrKeyBoardInput(str) {
    this.string = str;
  };
  return _createClass(EditBox, [{
    key: "string",
    get: function get() {
      return this._string;
    },
    set: function set(value) {
      if (this._maxLength >= 0 && value.length >= this._maxLength) {
        value = value.slice(0, this._maxLength);
      }
      if (this._string === value) {
        return;
      }
      this._string = value;
      this._updateString(value);
    }
  }, {
    key: "placeholder",
    get: function get() {
      if (!this._placeholderLabel) {
        return '';
      }
      return this._placeholderLabel.string;
    },
    set: function set(value) {
      if (this._placeholderLabel) {
        this._placeholderLabel.string = value;
      }
    }
  }, {
    key: "textLabel",
    get: function get() {
      return this._textLabel;
    },
    set: function set(oldValue) {
      if (this._textLabel !== oldValue) {
        this._textLabel = oldValue;
        if (this._textLabel) {
          this._updateTextLabel();
          this._updateLabels();
        }
      }
    }
  }, {
    key: "placeholderLabel",
    get: function get() {
      return this._placeholderLabel;
    },
    set: function set(oldValue) {
      if (this._placeholderLabel !== oldValue) {
        this._placeholderLabel = oldValue;
        if (this._placeholderLabel) {
          this._updatePlaceholderLabel();
          this._updateLabels();
        }
      }
    }
  }, {
    key: "backgroundImage",
    get: function get() {
      return this._backgroundImage;
    },
    set: function set(value) {
      if (this._backgroundImage === value) {
        return;
      }
      this._backgroundImage = value;
      this._ensureBackgroundSprite();
      this._background.spriteFrame = value;
    }
  }, {
    key: "inputFlag",
    get: function get() {
      return this._inputFlag;
    },
    set: function set(value) {
      if (this._inputFlag === value) {
        return;
      }
      this._inputFlag = value;
      this._updateString(this._string);
    }
  }, {
    key: "inputMode",
    get: function get() {
      return this._inputMode;
    },
    set: function set(oldValue) {
      if (this._inputMode !== oldValue) {
        this._inputMode = oldValue;
        this._updateTextLabel();
        this._updatePlaceholderLabel();
      }
    }
  }, {
    key: "returnType",
    get: function get() {
      return this._returnType;
    },
    set: function set(value) {
      this._returnType = value;
    }
  }, {
    key: "maxLength",
    get: function get() {
      return this._maxLength;
    },
    set: function set(value) {
      this._maxLength = value;
    }
  }, {
    key: "tabIndex",
    get: function get() {
      return this._tabIndex;
    },
    set: function set(value) {
      if (this._tabIndex !== value) {
        this._tabIndex = value;
        if (this._impl) {
          this._impl.setTabIndex(value);
        }
      }
    }
  }]);
}(Component), _EditBox._EditBoxImpl = EditBoxImplBase, _EditBox.KeyboardReturnType = KeyboardReturnType, _EditBox.InputFlag = InputFlag, _EditBox.InputMode = InputMode, _EditBox.EventType = EditBoxEventType, _EditBox), _applyDecoratedDescriptor(_class2$d.prototype, "textLabel", [_dec4$a], Object.getOwnPropertyDescriptor(_class2$d.prototype, "textLabel"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "placeholderLabel", [_dec5$a], Object.getOwnPropertyDescriptor(_class2$d.prototype, "placeholderLabel"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "backgroundImage", [_dec6$4], Object.getOwnPropertyDescriptor(_class2$d.prototype, "backgroundImage"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "inputFlag", [_dec7$3], Object.getOwnPropertyDescriptor(_class2$d.prototype, "inputFlag"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "inputMode", [_dec8$2], Object.getOwnPropertyDescriptor(_class2$d.prototype, "inputMode"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "returnType", [_dec9$2], Object.getOwnPropertyDescriptor(_class2$d.prototype, "returnType"), _class2$d.prototype), _initializer$d = applyDecoratedInitializer(_class2$d.prototype, "editingDidBegan", [_dec0, serializable], function () {
  return [];
}), _initializer2$c = applyDecoratedInitializer(_class2$d.prototype, "textChanged", [_dec1, serializable], function () {
  return [];
}), _initializer3$a = applyDecoratedInitializer(_class2$d.prototype, "editingDidEnded", [_dec10, serializable], function () {
  return [];
}), _initializer4$9 = applyDecoratedInitializer(_class2$d.prototype, "editingReturn", [_dec11, serializable], function () {
  return [];
}), _initializer5$7 = applyDecoratedInitializer(_class2$d.prototype, "_textLabel", [serializable], function () {
  return null;
}), _initializer6$4 = applyDecoratedInitializer(_class2$d.prototype, "_placeholderLabel", [serializable], function () {
  return null;
}), _initializer7$4 = applyDecoratedInitializer(_class2$d.prototype, "_returnType", [serializable], function () {
  return KeyboardReturnType.DEFAULT;
}), _initializer8$4 = applyDecoratedInitializer(_class2$d.prototype, "_string", [serializable], function () {
  return '';
}), _initializer9$4 = applyDecoratedInitializer(_class2$d.prototype, "_tabIndex", [serializable], function () {
  return 0;
}), _initializer0$4 = applyDecoratedInitializer(_class2$d.prototype, "_backgroundImage", [serializable], function () {
  return null;
}), _initializer1$4 = applyDecoratedInitializer(_class2$d.prototype, "_inputFlag", [serializable], function () {
  return InputFlag.DEFAULT;
}), _initializer10$3 = applyDecoratedInitializer(_class2$d.prototype, "_inputMode", [serializable], function () {
  return InputMode.ANY;
}), _initializer11$2 = applyDecoratedInitializer(_class2$d.prototype, "_maxLength", [serializable], function () {
  return 20;
}), _class2$d)) || _class$f) || _class$f) || _class$f);
if (typeof window === 'object' && typeof document === 'object' && true && true && true) {
  EditBox._EditBoxImpl = EditBoxImpl;
}
legacyCC.internal.EditBox = EditBox;

var _dec$e, _dec2$d, _dec3$c, _dec4$9, _dec5$9, _dec6$3, _dec7$2, _dec8$1, _dec9$1, _class$e, _class2$c, _initializer$c, _initializer2$b, _initializer3$9, _initializer4$8, _initializer5$6, _initializer6$3, _initializer7$3, _initializer8$3, _initializer9$3, _initializer0$3, _initializer1$3, _initializer10$2, _initializer11$1, _initializer12$1, _initializer13$1, _initializer14$1, _Layout;
var LayoutType;
(function (LayoutType) {
  LayoutType[LayoutType["NONE"] = 0] = "NONE";
  LayoutType[LayoutType["HORIZONTAL"] = 1] = "HORIZONTAL";
  LayoutType[LayoutType["VERTICAL"] = 2] = "VERTICAL";
  LayoutType[LayoutType["GRID"] = 3] = "GRID";
})(LayoutType || (LayoutType = {}));
ccenum(LayoutType);
var LayoutResizeMode;
(function (LayoutResizeMode) {
  LayoutResizeMode[LayoutResizeMode["NONE"] = 0] = "NONE";
  LayoutResizeMode[LayoutResizeMode["CONTAINER"] = 1] = "CONTAINER";
  LayoutResizeMode[LayoutResizeMode["CHILDREN"] = 2] = "CHILDREN";
})(LayoutResizeMode || (LayoutResizeMode = {}));
ccenum(LayoutResizeMode);
var LayoutAxisDirection;
(function (LayoutAxisDirection) {
  LayoutAxisDirection[LayoutAxisDirection["HORIZONTAL"] = 0] = "HORIZONTAL";
  LayoutAxisDirection[LayoutAxisDirection["VERTICAL"] = 1] = "VERTICAL";
})(LayoutAxisDirection || (LayoutAxisDirection = {}));
ccenum(LayoutAxisDirection);
var LayoutVerticalDirection;
(function (LayoutVerticalDirection) {
  LayoutVerticalDirection[LayoutVerticalDirection["BOTTOM_TO_TOP"] = 0] = "BOTTOM_TO_TOP";
  LayoutVerticalDirection[LayoutVerticalDirection["TOP_TO_BOTTOM"] = 1] = "TOP_TO_BOTTOM";
})(LayoutVerticalDirection || (LayoutVerticalDirection = {}));
ccenum(LayoutVerticalDirection);
var LayoutHorizontalDirection;
(function (LayoutHorizontalDirection) {
  LayoutHorizontalDirection[LayoutHorizontalDirection["LEFT_TO_RIGHT"] = 0] = "LEFT_TO_RIGHT";
  LayoutHorizontalDirection[LayoutHorizontalDirection["RIGHT_TO_LEFT"] = 1] = "RIGHT_TO_LEFT";
})(LayoutHorizontalDirection || (LayoutHorizontalDirection = {}));
ccenum(LayoutHorizontalDirection);
var LayoutConstraint;
(function (LayoutConstraint) {
  LayoutConstraint[LayoutConstraint["NONE"] = 0] = "NONE";
  LayoutConstraint[LayoutConstraint["FIXED_ROW"] = 1] = "FIXED_ROW";
  LayoutConstraint[LayoutConstraint["FIXED_COL"] = 2] = "FIXED_COL";
})(LayoutConstraint || (LayoutConstraint = {}));
ccenum(LayoutConstraint);
var _tempVec3$2 = new Vec3();
var Layout = (_dec$e = ccclass('cc.Layout'), _dec2$d = executionOrder(110), _dec3$c = requireComponent(UITransform), _dec4$9 = type(LayoutType), _dec5$9 = type(LayoutResizeMode), _dec6$3 = type(LayoutAxisDirection), _dec7$2 = type(LayoutVerticalDirection), _dec8$1 = type(LayoutHorizontalDirection), _dec9$1 = type(LayoutConstraint), _dec$e(_class$e = _dec2$d(_class$e = _dec3$c(_class$e = (_class2$c = (_Layout = function (_Component) {
  function Layout() {
    var _this;
    _this = _Component.call(this) || this;
    _this._resizeMode = _initializer$c && _initializer$c();
    _this._layoutType = _initializer2$b && _initializer2$b();
    _this._cellSize = _initializer3$9 && _initializer3$9();
    _this._startAxis = _initializer4$8 && _initializer4$8();
    _this._paddingLeft = _initializer5$6 && _initializer5$6();
    _this._paddingRight = _initializer6$3 && _initializer6$3();
    _this._paddingTop = _initializer7$3 && _initializer7$3();
    _this._paddingBottom = _initializer8$3 && _initializer8$3();
    _this._spacingX = _initializer9$3 && _initializer9$3();
    _this._spacingY = _initializer0$3 && _initializer0$3();
    _this._verticalDirection = _initializer1$3 && _initializer1$3();
    _this._horizontalDirection = _initializer10$2 && _initializer10$2();
    _this._constraint = _initializer11$1 && _initializer11$1();
    _this._constraintNum = _initializer12$1 && _initializer12$1();
    _this._affectedByScale = _initializer13$1 && _initializer13$1();
    _this._isAlign = _initializer14$1 && _initializer14$1();
    _this._layoutSize = new Size(300, 200);
    _this._layoutDirty = true;
    _this._childrenDirty = false;
    _this._usefulLayoutObj = [];
    _this._init = false;
    return _this;
  }
  _inheritsLoose(Layout, _Component);
  var _proto = Layout.prototype;
  _proto.updateLayout = function updateLayout(force) {
    if (force === void 0) {
      force = false;
    }
    if (this._layoutDirty || force) {
      this._doLayout();
      this._layoutDirty = false;
    }
  };
  _proto.onEnable = function onEnable() {
    this._addEventListeners();
    var trans = this.node._getUITransformComp();
    if (trans.contentSize.equals(Size.ZERO)) {
      trans.setContentSize(this._layoutSize);
    }
    this._childrenChanged();
  };
  _proto.onDisable = function onDisable() {
    this._usefulLayoutObj.length = 0;
    this._removeEventListeners();
  };
  _proto._checkUsefulObj = function _checkUsefulObj() {
    this._usefulLayoutObj.length = 0;
    var children = this.node.children;
    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      var uiTrans = child._getUITransformComp();
      if (child.activeInHierarchy && uiTrans) {
        this._usefulLayoutObj.push(uiTrans);
      }
    }
  };
  _proto._addEventListeners = function _addEventListeners() {
    director.on(DirectorEvent.AFTER_UPDATE, this.updateLayout, this);
    this.node.on(NodeEventType.SIZE_CHANGED, this._resized, this);
    this.node.on(NodeEventType.ANCHOR_CHANGED, this._doLayoutDirty, this);
    this.node.on(NodeEventType.CHILD_ADDED, this._childAdded, this);
    this.node.on(NodeEventType.CHILD_REMOVED, this._childRemoved, this);
    this.node.on(NodeEventType.CHILDREN_ORDER_CHANGED, this._childrenChanged, this);
    this.node.on('childrenSiblingOrderChanged', this.updateLayout, this);
    this._addChildrenEventListeners();
  };
  _proto._removeEventListeners = function _removeEventListeners() {
    director.off(DirectorEvent.AFTER_UPDATE, this.updateLayout, this);
    this.node.off(NodeEventType.SIZE_CHANGED, this._resized, this);
    this.node.off(NodeEventType.ANCHOR_CHANGED, this._doLayoutDirty, this);
    this.node.off(NodeEventType.CHILD_ADDED, this._childAdded, this);
    this.node.off(NodeEventType.CHILD_REMOVED, this._childRemoved, this);
    this.node.off(NodeEventType.CHILDREN_ORDER_CHANGED, this._childrenChanged, this);
    this.node.off('childrenSiblingOrderChanged', this.updateLayout, this);
    this._removeChildrenEventListeners();
  };
  _proto._addChildrenEventListeners = function _addChildrenEventListeners() {
    var children = this.node.children;
    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      child.on(NodeEventType.SIZE_CHANGED, this._doLayoutDirty, this);
      child.on(NodeEventType.TRANSFORM_CHANGED, this._transformDirty, this);
      child.on(NodeEventType.ANCHOR_CHANGED, this._doLayoutDirty, this);
      child.on(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this._childrenChanged, this);
    }
  };
  _proto._removeChildrenEventListeners = function _removeChildrenEventListeners() {
    var children = this.node.children;
    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      child.off(NodeEventType.SIZE_CHANGED, this._doLayoutDirty, this);
      child.off(NodeEventType.TRANSFORM_CHANGED, this._transformDirty, this);
      child.off(NodeEventType.ANCHOR_CHANGED, this._doLayoutDirty, this);
      child.off(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this._childrenChanged, this);
    }
  };
  _proto._childAdded = function _childAdded(child) {
    child.on(NodeEventType.SIZE_CHANGED, this._doLayoutDirty, this);
    child.on(NodeEventType.TRANSFORM_CHANGED, this._transformDirty, this);
    child.on(NodeEventType.ANCHOR_CHANGED, this._doLayoutDirty, this);
    child.on(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this._childrenChanged, this);
    this._childrenChanged();
  };
  _proto._childRemoved = function _childRemoved(child) {
    child.off(NodeEventType.SIZE_CHANGED, this._doLayoutDirty, this);
    child.off(NodeEventType.TRANSFORM_CHANGED, this._transformDirty, this);
    child.off(NodeEventType.ANCHOR_CHANGED, this._doLayoutDirty, this);
    child.off(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this._childrenChanged, this);
    this._childrenChanged();
  };
  _proto._resized = function _resized() {
    this._layoutSize.set(this.node._getUITransformComp().contentSize);
    this._doLayoutDirty();
  };
  _proto._doLayoutHorizontally = function _doLayoutHorizontally(baseWidth, rowBreak, fnPositionY, applyChildren) {
    var trans = this.node._getUITransformComp();
    var layoutAnchor = trans.anchorPoint;
    var limit = this._getFixedBreakingNum();
    var sign = 1;
    var paddingX = this._paddingLeft;
    if (this._horizontalDirection === LayoutHorizontalDirection.RIGHT_TO_LEFT) {
      sign = -1;
      paddingX = this._paddingRight;
    }
    var startPos = (this._horizontalDirection - layoutAnchor.x) * baseWidth + sign * paddingX;
    var nextX = startPos - sign * this._spacingX;
    var totalHeight = 0;
    var rowMaxHeight = 0;
    var tempMaxHeight = 0;
    var maxHeight = 0;
    var isBreak = false;
    var activeChildCount = this._usefulLayoutObj.length;
    var newChildWidth = this._cellSize.width;
    var paddingH = this._getPaddingH();
    if (this._layoutType !== LayoutType.GRID && this._resizeMode === LayoutResizeMode.CHILDREN) {
      newChildWidth = (baseWidth - paddingH - (activeChildCount - 1) * this._spacingX) / activeChildCount;
    }
    var children = this._usefulLayoutObj;
    for (var i = 0; i < children.length; ++i) {
      var childTrans = children[i];
      var child = childTrans.node;
      var scale = child.scale;
      var childScaleX = this._getUsedScaleValue(scale.x);
      var childScaleY = this._getUsedScaleValue(scale.y);
      if (this._resizeMode === LayoutResizeMode.CHILDREN) {
        childTrans.width = newChildWidth / childScaleX;
        if (this._layoutType === LayoutType.GRID) {
          childTrans.height = this._cellSize.height / childScaleY;
        }
      }
      var anchorX = Math.abs(this._horizontalDirection - childTrans.anchorX);
      var childBoundingBoxWidth = childTrans.width * childScaleX;
      var childBoundingBoxHeight = childTrans.height * childScaleY;
      if (childBoundingBoxHeight > tempMaxHeight) {
        maxHeight = Math.max(tempMaxHeight, maxHeight);
        rowMaxHeight = tempMaxHeight || childBoundingBoxHeight;
        tempMaxHeight = childBoundingBoxHeight;
      }
      nextX += sign * (anchorX * childBoundingBoxWidth + this._spacingX);
      var rightBoundaryOfChild = sign * (1 - anchorX) * childBoundingBoxWidth;
      if (rowBreak) {
        if (limit > 0) {
          isBreak = i / limit > 0 && i % limit === 0;
          if (isBreak) {
            rowMaxHeight = tempMaxHeight > childBoundingBoxHeight ? tempMaxHeight : rowMaxHeight;
          }
        } else if (childBoundingBoxWidth > baseWidth - paddingH) {
          if (nextX > startPos + sign * (anchorX * childBoundingBoxWidth)) {
            isBreak = true;
          }
        } else {
          var boundary = (1 - this._horizontalDirection - layoutAnchor.x) * baseWidth;
          var rowBreakBoundary = nextX + rightBoundaryOfChild + sign * (sign > 0 ? this._paddingRight : this._paddingLeft);
          isBreak = Math.abs(rowBreakBoundary) > Math.abs(boundary);
        }
        if (isBreak) {
          nextX = startPos + sign * (anchorX * childBoundingBoxWidth);
          if (childBoundingBoxHeight !== tempMaxHeight) {
            rowMaxHeight = tempMaxHeight;
          }
          totalHeight += rowMaxHeight + this._spacingY;
          rowMaxHeight = tempMaxHeight = childBoundingBoxHeight;
        }
      }
      var finalPositionY = fnPositionY(child, childTrans, totalHeight);
      if (applyChildren) {
        child.setPosition(nextX, finalPositionY);
      }
      nextX += rightBoundaryOfChild;
    }
    rowMaxHeight = Math.max(rowMaxHeight, tempMaxHeight);
    var containerResizeBoundary = Math.max(maxHeight, totalHeight + rowMaxHeight) + this._getPaddingV();
    return containerResizeBoundary;
  };
  _proto._doLayoutVertically = function _doLayoutVertically(baseHeight, columnBreak, fnPositionX, applyChildren) {
    var trans = this.node._getUITransformComp();
    var layoutAnchor = trans.anchorPoint;
    var limit = this._getFixedBreakingNum();
    var sign = 1;
    var paddingY = this._paddingBottom;
    if (this._verticalDirection === LayoutVerticalDirection.TOP_TO_BOTTOM) {
      sign = -1;
      paddingY = this._paddingTop;
    }
    var startPos = (this._verticalDirection - layoutAnchor.y) * baseHeight + sign * paddingY;
    var nextY = startPos - sign * this._spacingY;
    var tempMaxWidth = 0;
    var maxWidth = 0;
    var colMaxWidth = 0;
    var totalWidth = 0;
    var isBreak = false;
    var activeChildCount = this._usefulLayoutObj.length;
    var newChildHeight = this._cellSize.height;
    var paddingV = this._getPaddingV();
    if (this._layoutType !== LayoutType.GRID && this._resizeMode === LayoutResizeMode.CHILDREN) {
      newChildHeight = (baseHeight - paddingV - (activeChildCount - 1) * this._spacingY) / activeChildCount;
    }
    var children = this._usefulLayoutObj;
    for (var i = 0; i < children.length; ++i) {
      var childTrans = children[i];
      var child = childTrans.node;
      var scale = child.scale;
      var childScaleX = this._getUsedScaleValue(scale.x);
      var childScaleY = this._getUsedScaleValue(scale.y);
      if (this._resizeMode === LayoutResizeMode.CHILDREN) {
        childTrans.height = newChildHeight / childScaleY;
        if (this._layoutType === LayoutType.GRID) {
          childTrans.width = this._cellSize.width / childScaleX;
        }
      }
      var anchorY = Math.abs(this._verticalDirection - childTrans.anchorY);
      var childBoundingBoxWidth = childTrans.width * childScaleX;
      var childBoundingBoxHeight = childTrans.height * childScaleY;
      if (childBoundingBoxWidth > tempMaxWidth) {
        maxWidth = Math.max(tempMaxWidth, maxWidth);
        colMaxWidth = tempMaxWidth || childBoundingBoxWidth;
        tempMaxWidth = childBoundingBoxWidth;
      }
      nextY += sign * (anchorY * childBoundingBoxHeight + this._spacingY);
      var topBoundaryOfChild = sign * (1 - anchorY) * childBoundingBoxHeight;
      if (columnBreak) {
        if (limit > 0) {
          isBreak = i / limit > 0 && i % limit === 0;
          if (isBreak) {
            colMaxWidth = tempMaxWidth > childBoundingBoxHeight ? tempMaxWidth : colMaxWidth;
          }
        } else if (childBoundingBoxHeight > baseHeight - paddingV) {
          if (nextY > startPos + sign * (anchorY * childBoundingBoxHeight)) {
            isBreak = true;
          }
        } else {
          var boundary = (1 - this._verticalDirection - layoutAnchor.y) * baseHeight;
          var columnBreakBoundary = nextY + topBoundaryOfChild + sign * (sign > 0 ? this._paddingTop : this._paddingBottom);
          isBreak = Math.abs(columnBreakBoundary) > Math.abs(boundary);
        }
        if (isBreak) {
          nextY = startPos + sign * (anchorY * childBoundingBoxHeight);
          if (childBoundingBoxWidth !== tempMaxWidth) {
            colMaxWidth = tempMaxWidth;
          }
          totalWidth += colMaxWidth + this._spacingX;
          colMaxWidth = tempMaxWidth = childBoundingBoxWidth;
        }
      }
      var finalPositionX = fnPositionX(child, childTrans, totalWidth);
      if (applyChildren) {
        child.getPosition(_tempVec3$2);
        child.setPosition(finalPositionX, nextY, _tempVec3$2.z);
      }
      nextY += topBoundaryOfChild;
    }
    colMaxWidth = Math.max(colMaxWidth, tempMaxWidth);
    var containerResizeBoundary = Math.max(maxWidth, totalWidth + colMaxWidth) + this._getPaddingH();
    return containerResizeBoundary;
  };
  _proto._doLayoutGridAxisHorizontal = function _doLayoutGridAxisHorizontal(layoutAnchor, layoutSize) {
    var _this2 = this;
    var baseWidth = layoutSize.width;
    var sign = 1;
    var bottomBoundaryOfLayout = -layoutAnchor.y * layoutSize.height;
    var paddingY = this._paddingBottom;
    if (this._verticalDirection === LayoutVerticalDirection.TOP_TO_BOTTOM) {
      sign = -1;
      bottomBoundaryOfLayout = (1 - layoutAnchor.y) * layoutSize.height;
      paddingY = this._paddingTop;
    }
    var fnPositionY = function fnPositionY(child, childTrans, topOffset) {
      return bottomBoundaryOfLayout + sign * (topOffset + (1 - childTrans.anchorY) * childTrans.height * _this2._getUsedScaleValue(child.scale.y) + paddingY);
    };
    var newHeight = 0;
    if (this._resizeMode === LayoutResizeMode.CONTAINER) {
      newHeight = this._doLayoutHorizontally(baseWidth, true, fnPositionY, false);
      bottomBoundaryOfLayout = -layoutAnchor.y * newHeight;
      if (this._verticalDirection === LayoutVerticalDirection.TOP_TO_BOTTOM) {
        sign = -1;
        bottomBoundaryOfLayout = (1 - layoutAnchor.y) * newHeight;
      }
    }
    this._doLayoutHorizontally(baseWidth, true, fnPositionY, true);
    if (this._resizeMode === LayoutResizeMode.CONTAINER) {
      this.node._getUITransformComp().setContentSize(baseWidth, newHeight);
    }
  };
  _proto._doLayoutGridAxisVertical = function _doLayoutGridAxisVertical(layoutAnchor, layoutSize) {
    var _this3 = this;
    var baseHeight = layoutSize.height;
    var sign = 1;
    var leftBoundaryOfLayout = -layoutAnchor.x * layoutSize.width;
    var paddingX = this._paddingLeft;
    if (this._horizontalDirection === LayoutHorizontalDirection.RIGHT_TO_LEFT) {
      sign = -1;
      leftBoundaryOfLayout = (1 - layoutAnchor.x) * layoutSize.width;
      paddingX = this._paddingRight;
    }
    var fnPositionX = function fnPositionX(child, childTrans, leftOffset) {
      return leftBoundaryOfLayout + sign * (leftOffset + (1 - childTrans.anchorX) * childTrans.width * _this3._getUsedScaleValue(child.scale.x) + paddingX);
    };
    var newWidth = 0;
    if (this._resizeMode === LayoutResizeMode.CONTAINER) {
      newWidth = this._doLayoutVertically(baseHeight, true, fnPositionX, false);
      leftBoundaryOfLayout = -layoutAnchor.x * newWidth;
      if (this._horizontalDirection === LayoutHorizontalDirection.RIGHT_TO_LEFT) {
        sign = -1;
        leftBoundaryOfLayout = (1 - layoutAnchor.x) * newWidth;
      }
    }
    this._doLayoutVertically(baseHeight, true, fnPositionX, true);
    if (this._resizeMode === LayoutResizeMode.CONTAINER) {
      this.node._getUITransformComp().setContentSize(newWidth, baseHeight);
    }
  };
  _proto._doLayoutGrid = function _doLayoutGrid() {
    var trans = this.node._getUITransformComp();
    var layoutAnchor = trans.anchorPoint;
    var layoutSize = trans.contentSize;
    if (this.startAxis === LayoutAxisDirection.HORIZONTAL) {
      this._doLayoutGridAxisHorizontal(layoutAnchor, layoutSize);
    } else if (this.startAxis === LayoutAxisDirection.VERTICAL) {
      this._doLayoutGridAxisVertical(layoutAnchor, layoutSize);
    }
  };
  _proto._getHorizontalBaseWidth = function _getHorizontalBaseWidth(horizontal) {
    var children = this._usefulLayoutObj;
    var baseSize = 0;
    var activeChildCount = children.length;
    if (this._resizeMode === LayoutResizeMode.CONTAINER) {
      for (var i = 0; i < children.length; ++i) {
        var childTrans = children[i];
        var child = childTrans.node;
        var scale = child.scale;
        baseSize += childTrans.width * this._getUsedScaleValue(scale.x);
      }
      baseSize += (activeChildCount - 1) * this._spacingX + this._getPaddingH();
    } else {
      baseSize = this.node._getUITransformComp().width;
    }
    return baseSize;
  };
  _proto._getVerticalBaseHeight = function _getVerticalBaseHeight() {
    var children = this._usefulLayoutObj;
    var baseSize = 0;
    var activeChildCount = children.length;
    if (this._resizeMode === LayoutResizeMode.CONTAINER) {
      for (var i = 0; i < children.length; ++i) {
        var childTrans = children[i];
        var child = childTrans.node;
        var scale = child.scale;
        baseSize += childTrans.height * this._getUsedScaleValue(scale.y);
      }
      baseSize += (activeChildCount - 1) * this._spacingY + this._getPaddingV();
    } else {
      baseSize = this.node._getUITransformComp().height;
    }
    return baseSize;
  };
  _proto._doLayout = function _doLayout() {
    var _this4 = this;
    if (!this._init || this._childrenDirty) {
      this._checkUsefulObj();
      this._init = true;
      this._childrenDirty = false;
    }
    if (this._layoutType === LayoutType.HORIZONTAL) {
      var newWidth = this._getHorizontalBaseWidth();
      var fnPositionY = function fnPositionY(child) {
        var pos = _this4._isAlign ? Vec3.ZERO : child.position;
        return pos.y;
      };
      this._doLayoutHorizontally(newWidth, false, fnPositionY, true);
      this.node._getUITransformComp().width = newWidth;
    } else if (this._layoutType === LayoutType.VERTICAL) {
      var newHeight = this._getVerticalBaseHeight();
      var fnPositionX = function fnPositionX(child) {
        var pos = _this4._isAlign ? Vec3.ZERO : child.position;
        return pos.x;
      };
      this._doLayoutVertically(newHeight, false, fnPositionX, true);
      this.node._getUITransformComp().height = newHeight;
    } else if (this._layoutType === LayoutType.GRID) {
      this._doLayoutGrid();
    }
  };
  _proto._getUsedScaleValue = function _getUsedScaleValue(value) {
    return this._affectedByScale ? Math.abs(value) : 1;
  };
  _proto._transformDirty = function _transformDirty(type) {
    if (!(type & TransformBit.SCALE) || !(type & TransformBit.POSITION) || !this._affectedByScale) {
      return;
    }
    this._doLayoutDirty();
  };
  _proto._doLayoutDirty = function _doLayoutDirty() {
    this._layoutDirty = true;
  };
  _proto._childrenChanged = function _childrenChanged() {
    this._childrenDirty = true;
    this._doLayoutDirty();
  };
  _proto._getPaddingH = function _getPaddingH() {
    return this._paddingLeft + this._paddingRight;
  };
  _proto._getPaddingV = function _getPaddingV() {
    return this._paddingTop + this._paddingBottom;
  };
  _proto._getFixedBreakingNum = function _getFixedBreakingNum() {
    if (this._layoutType !== LayoutType.GRID || this._constraint === LayoutConstraint.NONE || this._constraintNum <= 0) {
      return 0;
    }
    var num = this._constraint === LayoutConstraint.FIXED_ROW ? Math.ceil(this._usefulLayoutObj.length / this._constraintNum) : this._constraintNum;
    if (this._startAxis === LayoutAxisDirection.VERTICAL) {
      num = this._constraint === LayoutConstraint.FIXED_COL ? Math.ceil(this._usefulLayoutObj.length / this._constraintNum) : this._constraintNum;
    }
    return num;
  };
  return _createClass(Layout, [{
    key: "alignHorizontal",
    get: function get() {
      return this._isAlign;
    },
    set: function set(value) {
      if (this._layoutType !== LayoutType.HORIZONTAL) {
        return;
      }
      this._isAlign = value;
      this._doLayoutDirty();
    }
  }, {
    key: "alignVertical",
    get: function get() {
      return this._isAlign;
    },
    set: function set(value) {
      if (this._layoutType !== LayoutType.VERTICAL) {
        return;
      }
      this._isAlign = value;
      this._doLayoutDirty();
    }
  }, {
    key: "type",
    get: function get() {
      return this._layoutType;
    },
    set: function set(value) {
      this._layoutType = value;
      this._doLayoutDirty();
    }
  }, {
    key: "resizeMode",
    get: function get() {
      return this._resizeMode;
    },
    set: function set(value) {
      if (this._layoutType === LayoutType.NONE) {
        return;
      }
      this._resizeMode = value;
      this._doLayoutDirty();
    }
  }, {
    key: "cellSize",
    get: function get() {
      return this._cellSize;
    },
    set: function set(value) {
      if (this._cellSize === value) {
        return;
      }
      this._cellSize.set(value);
      this._doLayoutDirty();
    }
  }, {
    key: "startAxis",
    get: function get() {
      return this._startAxis;
    },
    set: function set(value) {
      if (this._startAxis === value) {
        return;
      }
      this._startAxis = value;
      this._doLayoutDirty();
    }
  }, {
    key: "paddingLeft",
    get: function get() {
      return this._paddingLeft;
    },
    set: function set(value) {
      if (this._paddingLeft === value) {
        return;
      }
      this._paddingLeft = value;
      this._doLayoutDirty();
    }
  }, {
    key: "paddingRight",
    get: function get() {
      return this._paddingRight;
    },
    set: function set(value) {
      if (this._paddingRight === value) {
        return;
      }
      this._paddingRight = value;
      this._doLayoutDirty();
    }
  }, {
    key: "paddingTop",
    get: function get() {
      return this._paddingTop;
    },
    set: function set(value) {
      if (this._paddingTop === value) {
        return;
      }
      this._paddingTop = value;
      this._doLayoutDirty();
    }
  }, {
    key: "paddingBottom",
    get: function get() {
      return this._paddingBottom;
    },
    set: function set(value) {
      if (this._paddingBottom === value) {
        return;
      }
      this._paddingBottom = value;
      this._doLayoutDirty();
    }
  }, {
    key: "spacingX",
    get: function get() {
      return this._spacingX;
    },
    set: function set(value) {
      if (this._spacingX === value) {
        return;
      }
      this._spacingX = value;
      this._doLayoutDirty();
    }
  }, {
    key: "spacingY",
    get: function get() {
      return this._spacingY;
    },
    set: function set(value) {
      if (this._spacingY === value) {
        return;
      }
      this._spacingY = value;
      this._doLayoutDirty();
    }
  }, {
    key: "verticalDirection",
    get: function get() {
      return this._verticalDirection;
    },
    set: function set(value) {
      if (this._verticalDirection === value) {
        return;
      }
      this._verticalDirection = value;
      this._doLayoutDirty();
    }
  }, {
    key: "horizontalDirection",
    get: function get() {
      return this._horizontalDirection;
    },
    set: function set(value) {
      if (this._horizontalDirection === value) {
        return;
      }
      this._horizontalDirection = value;
      this._doLayoutDirty();
    }
  }, {
    key: "padding",
    get: function get() {
      return this._paddingLeft;
    },
    set: function set(value) {
      if (this.paddingLeft !== value || this._paddingRight !== value || this._paddingTop !== value || this._paddingBottom !== value) {
        this._paddingLeft = this._paddingRight = this._paddingTop = this._paddingBottom = value;
        this._doLayoutDirty();
      }
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._constraint;
    },
    set: function set(value) {
      if (this._layoutType === LayoutType.NONE || this._constraint === value) {
        return;
      }
      this._constraint = value;
      this._doLayoutDirty();
    }
  }, {
    key: "constraintNum",
    get: function get() {
      return this._constraintNum;
    },
    set: function set(value) {
      if (this._constraint === LayoutConstraint.NONE || this._constraintNum === value) {
        return;
      }
      if (value <= 0) {
        warnID(16400);
      }
      this._constraintNum = value;
      this._doLayoutDirty();
    }
  }, {
    key: "affectedByScale",
    get: function get() {
      return this._affectedByScale;
    },
    set: function set(value) {
      this._affectedByScale = value;
      this._doLayoutDirty();
    }
  }]);
}(Component), _Layout.Type = LayoutType, _Layout.VerticalDirection = LayoutVerticalDirection, _Layout.HorizontalDirection = LayoutHorizontalDirection, _Layout.ResizeMode = LayoutResizeMode, _Layout.AxisDirection = LayoutAxisDirection, _Layout.Constraint = LayoutConstraint, _Layout), _applyDecoratedDescriptor(_class2$c.prototype, "type", [_dec4$9], Object.getOwnPropertyDescriptor(_class2$c.prototype, "type"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "resizeMode", [_dec5$9], Object.getOwnPropertyDescriptor(_class2$c.prototype, "resizeMode"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "startAxis", [_dec6$3], Object.getOwnPropertyDescriptor(_class2$c.prototype, "startAxis"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "verticalDirection", [_dec7$2], Object.getOwnPropertyDescriptor(_class2$c.prototype, "verticalDirection"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "horizontalDirection", [_dec8$1], Object.getOwnPropertyDescriptor(_class2$c.prototype, "horizontalDirection"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "constraint", [_dec9$1], Object.getOwnPropertyDescriptor(_class2$c.prototype, "constraint"), _class2$c.prototype), _initializer$c = applyDecoratedInitializer(_class2$c.prototype, "_resizeMode", [serializable], function () {
  return LayoutResizeMode.NONE;
}), _initializer2$b = applyDecoratedInitializer(_class2$c.prototype, "_layoutType", [serializable], function () {
  return LayoutType.NONE;
}), _initializer3$9 = applyDecoratedInitializer(_class2$c.prototype, "_cellSize", [serializable], function () {
  return new Size(40, 40);
}), _initializer4$8 = applyDecoratedInitializer(_class2$c.prototype, "_startAxis", [serializable], function () {
  return LayoutAxisDirection.HORIZONTAL;
}), _initializer5$6 = applyDecoratedInitializer(_class2$c.prototype, "_paddingLeft", [serializable], function () {
  return 0;
}), _initializer6$3 = applyDecoratedInitializer(_class2$c.prototype, "_paddingRight", [serializable], function () {
  return 0;
}), _initializer7$3 = applyDecoratedInitializer(_class2$c.prototype, "_paddingTop", [serializable], function () {
  return 0;
}), _initializer8$3 = applyDecoratedInitializer(_class2$c.prototype, "_paddingBottom", [serializable], function () {
  return 0;
}), _initializer9$3 = applyDecoratedInitializer(_class2$c.prototype, "_spacingX", [serializable], function () {
  return 0;
}), _initializer0$3 = applyDecoratedInitializer(_class2$c.prototype, "_spacingY", [serializable], function () {
  return 0;
}), _initializer1$3 = applyDecoratedInitializer(_class2$c.prototype, "_verticalDirection", [serializable], function () {
  return LayoutVerticalDirection.TOP_TO_BOTTOM;
}), _initializer10$2 = applyDecoratedInitializer(_class2$c.prototype, "_horizontalDirection", [serializable], function () {
  return LayoutHorizontalDirection.LEFT_TO_RIGHT;
}), _initializer11$1 = applyDecoratedInitializer(_class2$c.prototype, "_constraint", [serializable], function () {
  return LayoutConstraint.NONE;
}), _initializer12$1 = applyDecoratedInitializer(_class2$c.prototype, "_constraintNum", [serializable], function () {
  return 2;
}), _initializer13$1 = applyDecoratedInitializer(_class2$c.prototype, "_affectedByScale", [serializable], function () {
  return false;
}), _initializer14$1 = applyDecoratedInitializer(_class2$c.prototype, "_isAlign", [serializable], function () {
  return false;
}), _class2$c)) || _class$e) || _class$e) || _class$e);
legacyCC.Layout = Layout;

var _dec$d, _dec2$c, _dec3$b, _dec4$8, _dec5$8, _class$d, _class2$b, _initializer$b, _initializer2$a, _initializer3$8, _initializer4$7, _initializer5$5, _ProgressBar;
var Mode;
(function (Mode) {
  Mode[Mode["HORIZONTAL"] = 0] = "HORIZONTAL";
  Mode[Mode["VERTICAL"] = 1] = "VERTICAL";
  Mode[Mode["FILLED"] = 2] = "FILLED";
})(Mode || (Mode = {}));
Enum(Mode);
var ProgressBar = (_dec$d = ccclass('cc.ProgressBar'), _dec2$c = executionOrder(110), _dec3$b = requireComponent(UITransform), _dec4$8 = type(Sprite), _dec5$8 = type(Mode), _dec$d(_class$d = _dec2$c(_class$d = _dec3$b(_class$d = (_class2$b = (_ProgressBar = function (_Component) {
  function ProgressBar() {
    var _this;
    _this = _Component.call(this) || this;
    _this._barSprite = _initializer$b && _initializer$b();
    _this._mode = _initializer2$a && _initializer2$a();
    _this._totalLength = _initializer3$8 && _initializer3$8();
    _this._progress = _initializer4$7 && _initializer4$7();
    _this._reverse = _initializer5$5 && _initializer5$5();
    return _this;
  }
  _inheritsLoose(ProgressBar, _Component);
  var _proto = ProgressBar.prototype;
  _proto.onLoad = function onLoad() {
    this._updateBarStatus();
  };
  _proto._initBarSprite = function _initBarSprite() {
    if (this._barSprite) {
      var entity = this._barSprite.node;
      if (!entity) {
        return;
      }
      var trans = this.node._getUITransformComp();
      var nodeSize = trans.contentSize;
      var nodeAnchor = trans.anchorPoint;
      var barSpriteSize = entity._getUITransformComp().contentSize;
      if (this._barSprite.fillType === Sprite.FillType.RADIAL) {
        this._mode = Mode.FILLED;
      }
      if (this._mode === Mode.HORIZONTAL) {
        this.totalLength = barSpriteSize.width;
      } else if (this._mode === Mode.VERTICAL) {
        this.totalLength = barSpriteSize.height;
      } else {
        this.totalLength = this._barSprite.fillRange;
      }
      if (entity.parent === this.node) {
        var x = -nodeSize.width * nodeAnchor.x;
        entity.setPosition(x, 0, 0);
      }
    }
  };
  _proto._updateBarStatus = function _updateBarStatus() {
    if (this._barSprite) {
      var entity = this._barSprite.node;
      if (!entity) {
        return;
      }
      var entTrans = entity._getUITransformComp();
      var entityAnchorPoint = entTrans.anchorPoint;
      var entitySize = entTrans.contentSize;
      var anchorPoint = new Vec2(0, 0.5);
      var progress = clamp01(this._progress);
      var actualLenth = this._totalLength * progress;
      var finalContentSize = entitySize;
      var totalWidth = 0;
      var totalHeight = 0;
      switch (this._mode) {
        case Mode.HORIZONTAL:
          if (this._reverse) {
            anchorPoint = new Vec2(1, 0.5);
          }
          finalContentSize = new Size(actualLenth, entitySize.height);
          totalWidth = this._totalLength;
          totalHeight = entitySize.height;
          break;
        case Mode.VERTICAL:
          if (this._reverse) {
            anchorPoint = new Vec2(0.5, 1);
          } else {
            anchorPoint = new Vec2(0.5, 0);
          }
          finalContentSize = new Size(entitySize.width, actualLenth);
          totalWidth = entitySize.width;
          totalHeight = this._totalLength;
          break;
      }
      if (this._mode === Mode.FILLED) {
        if (this._barSprite.type !== Sprite.Type.FILLED) {
          warnID(16397);
        } else {
          if (this._reverse) {
            actualLenth *= -1;
          }
          this._barSprite.fillRange = actualLenth;
        }
      } else if (this._barSprite.type !== Sprite.Type.FILLED) {
        var anchorOffsetX = anchorPoint.x - entityAnchorPoint.x;
        var anchorOffsetY = anchorPoint.y - entityAnchorPoint.y;
        var finalPosition = new Vec3(entity.position);
        finalPosition.add3f(totalWidth * anchorOffsetX, totalHeight * anchorOffsetY, 0);
        entity.setPosition(finalPosition);
        entTrans.setAnchorPoint(anchorPoint);
        entTrans.setContentSize(finalContentSize);
      } else {
        warnID(16398);
      }
    }
  };
  return _createClass(ProgressBar, [{
    key: "barSprite",
    get: function get() {
      return this._barSprite;
    },
    set: function set(value) {
      if (this._barSprite === value) {
        return;
      }
      this._barSprite = value;
      this._initBarSprite();
    }
  }, {
    key: "mode",
    get: function get() {
      return this._mode;
    },
    set: function set(value) {
      if (this._mode === value) {
        return;
      }
      this._mode = value;
      if (this._barSprite) {
        var entity = this._barSprite.node;
        if (!entity) {
          return;
        }
        var entitySize = entity._getUITransformComp().contentSize;
        if (this._mode === Mode.HORIZONTAL) {
          this.totalLength = entitySize.width;
        } else if (this._mode === Mode.VERTICAL) {
          this.totalLength = entitySize.height;
        } else if (this._mode === Mode.FILLED) {
          this.totalLength = this._barSprite.fillRange;
        }
      }
    }
  }, {
    key: "totalLength",
    get: function get() {
      return this._totalLength;
    },
    set: function set(value) {
      if (this._mode === Mode.FILLED) {
        value = clamp01(value);
      }
      if (this._totalLength === value) {
        return;
      }
      this._totalLength = value;
      this._updateBarStatus();
    }
  }, {
    key: "progress",
    get: function get() {
      return this._progress;
    },
    set: function set(value) {
      if (this._progress === value) {
        return;
      }
      this._progress = value;
      this._updateBarStatus();
    }
  }, {
    key: "reverse",
    get: function get() {
      return this._reverse;
    },
    set: function set(value) {
      if (this._reverse === value) {
        return;
      }
      this._reverse = value;
      if (this._barSprite) {
        this._barSprite.fillStart = 1 - this._barSprite.fillStart;
      }
      this._updateBarStatus();
    }
  }]);
}(Component), _ProgressBar.Mode = Mode, _ProgressBar), _applyDecoratedDescriptor(_class2$b.prototype, "barSprite", [_dec4$8], Object.getOwnPropertyDescriptor(_class2$b.prototype, "barSprite"), _class2$b.prototype), _applyDecoratedDescriptor(_class2$b.prototype, "mode", [_dec5$8], Object.getOwnPropertyDescriptor(_class2$b.prototype, "mode"), _class2$b.prototype), _initializer$b = applyDecoratedInitializer(_class2$b.prototype, "_barSprite", [serializable], function () {
  return null;
}), _initializer2$a = applyDecoratedInitializer(_class2$b.prototype, "_mode", [serializable], function () {
  return Mode.HORIZONTAL;
}), _initializer3$8 = applyDecoratedInitializer(_class2$b.prototype, "_totalLength", [serializable], function () {
  return 1;
}), _initializer4$7 = applyDecoratedInitializer(_class2$b.prototype, "_progress", [serializable], function () {
  return 0.1;
}), _initializer5$5 = applyDecoratedInitializer(_class2$b.prototype, "_reverse", [serializable], function () {
  return false;
}), _class2$b)) || _class$d) || _class$d) || _class$d);
legacyCC.ProgressBar = ProgressBar;

var _dec$c, _dec2$b, _dec3$a, _dec4$7, _dec5$7, _class$c, _class2$a, _initializer$a, _initializer2$9, _initializer3$7, _initializer4$6, _initializer5$4, _ScrollBar;
var GETTING_SHORTER_FACTOR = 20;
var _tempPos_1 = new Vec3();
var _tempPos_2 = new Vec3();
var _tempVec3$1 = new Vec3();
var defaultAnchor = new Vec2();
var _tempColor = new Color();
var _tempVec2$2 = new Vec2();
var ScrollBarDirection;
(function (ScrollBarDirection) {
  ScrollBarDirection[ScrollBarDirection["HORIZONTAL"] = 0] = "HORIZONTAL";
  ScrollBarDirection[ScrollBarDirection["VERTICAL"] = 1] = "VERTICAL";
})(ScrollBarDirection || (ScrollBarDirection = {}));
ccenum(ScrollBarDirection);
var ScrollBar = (_dec$c = ccclass('cc.ScrollBar'), _dec2$b = executionOrder(110), _dec3$a = requireComponent(UITransform), _dec4$7 = type(Sprite), _dec5$7 = type(ScrollBarDirection), _dec$c(_class$c = _dec2$b(_class$c = _dec3$a(_class$c = (_class2$a = (_ScrollBar = function (_Component) {
  function ScrollBar() {
    var _this;
    _this = _Component.call(this) || this;
    _this._scrollView = _initializer$a && _initializer$a();
    _this._handle = _initializer2$9 && _initializer2$9();
    _this._direction = _initializer3$7 && _initializer3$7();
    _this._enableAutoHide = _initializer4$6 && _initializer4$6();
    _this._autoHideTime = _initializer5$4 && _initializer5$4();
    _this._touching = false;
    _this._opacity = 255;
    _this._autoHideRemainingTime = 0;
    return _this;
  }
  _inheritsLoose(ScrollBar, _Component);
  var _proto = ScrollBar.prototype;
  _proto.hide = function hide() {
    this._autoHideRemainingTime = 0;
    this._setOpacity(0);
  };
  _proto.show = function show() {
    this._autoHideRemainingTime = this._autoHideTime;
    this._opacity = 255;
    this._setOpacity(this._opacity);
  };
  _proto.onScroll = function onScroll(outOfBoundary) {
    if (!this._scrollView) {
      return;
    }
    var content = this._scrollView.content;
    if (!content) {
      return;
    }
    var contentSize = content._getUITransformComp().contentSize;
    var scrollViewSize = this._scrollView.node._getUITransformComp().contentSize;
    var barSize = this.node._getUITransformComp().contentSize;
    if (this._conditionalDisableScrollBar(contentSize, scrollViewSize)) {
      return;
    }
    if (this._enableAutoHide) {
      this._autoHideRemainingTime = this._autoHideTime;
      this._setOpacity(this._opacity);
    }
    var contentMeasure = 0;
    var scrollViewMeasure = 0;
    var outOfBoundaryValue = 0;
    var contentPosition = 0;
    var handleNodeMeasure = 0;
    var outOfContentPosition = _tempVec2$2;
    outOfContentPosition.set(0, 0);
    if (this._direction === ScrollBarDirection.HORIZONTAL) {
      contentMeasure = contentSize.width;
      scrollViewMeasure = scrollViewSize.width;
      handleNodeMeasure = barSize.width;
      outOfBoundaryValue = outOfBoundary.x;
      this._convertToScrollViewSpace(outOfContentPosition, content);
      contentPosition = -outOfContentPosition.x;
    } else if (this._direction === ScrollBarDirection.VERTICAL) {
      contentMeasure = contentSize.height;
      scrollViewMeasure = scrollViewSize.height;
      handleNodeMeasure = barSize.height;
      outOfBoundaryValue = outOfBoundary.y;
      this._convertToScrollViewSpace(outOfContentPosition, content);
      contentPosition = -outOfContentPosition.y;
    }
    var length = this._calculateLength(contentMeasure, scrollViewMeasure, handleNodeMeasure, outOfBoundaryValue);
    var position = _tempVec2$2;
    this._calculatePosition(position, contentMeasure, scrollViewMeasure, handleNodeMeasure, contentPosition, outOfBoundaryValue, length);
    this._updateLength(length);
    this._updateHandlerPosition(position);
  };
  _proto.setScrollView = function setScrollView(scrollView) {
    this._scrollView = scrollView;
  };
  _proto.onTouchBegan = function onTouchBegan() {
    if (!this._enableAutoHide) {
      return;
    }
    this._touching = true;
  };
  _proto.onTouchEnded = function onTouchEnded() {
    if (!this._enableAutoHide) {
      return;
    }
    this._touching = false;
    if (this._autoHideTime <= 0) {
      return;
    }
    if (this._scrollView) {
      var content = this._scrollView.content;
      if (content) {
        var contentSize = content._getUITransformComp().contentSize;
        var scrollViewSize = this._scrollView.node._getUITransformComp().contentSize;
        if (this._conditionalDisableScrollBar(contentSize, scrollViewSize)) {
          return;
        }
      }
    }
    this._autoHideRemainingTime = this._autoHideTime;
  };
  _proto.onEnable = function onEnable() {
    var renderComp = this.node.getComponent(Sprite);
    if (renderComp) {
      this._opacity = renderComp.color.a;
    }
  };
  _proto.start = function start() {
    if (this._enableAutoHide) {
      this._setOpacity(0);
    }
  };
  _proto.update = function update(dt) {
    this._processAutoHide(dt);
  };
  _proto._convertToScrollViewSpace = function _convertToScrollViewSpace(out, content) {
    var scrollTrans = this._scrollView && this._scrollView.node._getUITransformComp();
    var contentTrans = content._getUITransformComp();
    if (!scrollTrans || !contentTrans) {
      out.set(Vec2.ZERO);
    } else {
      _tempPos_1.set(-contentTrans.anchorX * contentTrans.width, -contentTrans.anchorY * contentTrans.height, 0);
      contentTrans.convertToWorldSpaceAR(_tempPos_1, _tempPos_2);
      var scrollViewSpacePos = scrollTrans.convertToNodeSpaceAR(_tempPos_2);
      scrollViewSpacePos.x += scrollTrans.anchorX * scrollTrans.width;
      scrollViewSpacePos.y += scrollTrans.anchorY * scrollTrans.height;
      out.set(scrollViewSpacePos.x, scrollViewSpacePos.y);
    }
  };
  _proto._setOpacity = function _setOpacity(opacity) {
    if (this._handle) {
      var renderComp = this.node.getComponent(Sprite);
      if (renderComp) {
        _tempColor.set(renderComp.color);
        _tempColor.a = opacity;
        renderComp.color = _tempColor;
      }
      renderComp = this._handle.getComponent(Sprite);
      if (renderComp) {
        _tempColor.set(renderComp.color);
        _tempColor.a = opacity;
        renderComp.color = _tempColor;
      }
    }
  };
  _proto._updateHandlerPosition = function _updateHandlerPosition(position) {
    if (this._handle) {
      var oldPosition = _tempVec3$1;
      this._fixupHandlerPosition(oldPosition);
      this._handle.node.setPosition(position.x + oldPosition.x, position.y + oldPosition.y, oldPosition.z);
    }
  };
  _proto._fixupHandlerPosition = function _fixupHandlerPosition(out) {
    var uiTrans = this.node._getUITransformComp();
    var barSize = uiTrans.contentSize;
    var barAnchor = uiTrans.anchorPoint;
    var handleSize = this.handle.node._getUITransformComp().contentSize;
    var handleParent = this.handle.node.parent;
    Vec3.set(_tempPos_1, -barSize.width * barAnchor.x, -barSize.height * barAnchor.y, 0);
    var leftBottomWorldPosition = this.node._getUITransformComp().convertToWorldSpaceAR(_tempPos_1, _tempPos_2);
    var fixupPosition = out;
    fixupPosition.set(0, 0, 0);
    handleParent._getUITransformComp().convertToNodeSpaceAR(leftBottomWorldPosition, fixupPosition);
    if (this.direction === ScrollBarDirection.HORIZONTAL) {
      fixupPosition.set(fixupPosition.x, fixupPosition.y + (barSize.height - handleSize.height) / 2, fixupPosition.z);
    } else if (this.direction === ScrollBarDirection.VERTICAL) {
      fixupPosition.set(fixupPosition.x + (barSize.width - handleSize.width) / 2, fixupPosition.y, fixupPosition.z);
    }
    this.handle.node.setPosition(fixupPosition);
  };
  _proto._conditionalDisableScrollBar = function _conditionalDisableScrollBar(contentSize, scrollViewSize) {
    if (contentSize.width <= scrollViewSize.width && this._direction === ScrollBarDirection.HORIZONTAL) {
      return true;
    }
    if (contentSize.height <= scrollViewSize.height && this._direction === ScrollBarDirection.VERTICAL) {
      return true;
    }
    return false;
  };
  _proto._calculateLength = function _calculateLength(contentMeasure, scrollViewMeasure, handleNodeMeasure, outOfBoundary) {
    var denominatorValue = contentMeasure;
    if (outOfBoundary) {
      denominatorValue += (outOfBoundary > 0 ? outOfBoundary : -outOfBoundary) * GETTING_SHORTER_FACTOR;
    }
    var lengthRation = scrollViewMeasure / denominatorValue;
    return handleNodeMeasure * lengthRation;
  };
  _proto._calculatePosition = function _calculatePosition(out, contentMeasure, scrollViewMeasure, handleNodeMeasure, contentPosition, outOfBoundary, actualLenth) {
    var denominatorValue = contentMeasure - scrollViewMeasure;
    if (outOfBoundary) {
      denominatorValue += Math.abs(outOfBoundary);
    }
    var positionRatio = 0;
    if (denominatorValue) {
      positionRatio = contentPosition / denominatorValue;
      positionRatio = clamp01(positionRatio);
    }
    var position = (handleNodeMeasure - actualLenth) * positionRatio;
    if (this._direction === ScrollBarDirection.VERTICAL) {
      out.set(0, position);
    } else {
      out.set(position, 0);
    }
  };
  _proto._updateLength = function _updateLength(length) {
    if (this._handle) {
      var handleNode = this._handle.node;
      var handleTrans = handleNode._getUITransformComp();
      var handleNodeSize = handleTrans.contentSize;
      var anchor = handleTrans.anchorPoint;
      if (anchor.x !== defaultAnchor.x || anchor.y !== defaultAnchor.y) {
        handleTrans.setAnchorPoint(defaultAnchor);
      }
      if (this._direction === ScrollBarDirection.HORIZONTAL) {
        handleTrans.setContentSize(length, handleNodeSize.height);
      } else {
        handleTrans.setContentSize(handleNodeSize.width, length);
      }
    }
  };
  _proto._processAutoHide = function _processAutoHide(deltaTime) {
    if (!this._enableAutoHide || this._autoHideRemainingTime <= 0) {
      return;
    } else if (this._touching) {
      return;
    }
    this._autoHideRemainingTime -= deltaTime;
    if (this._autoHideRemainingTime <= this._autoHideTime) {
      this._autoHideRemainingTime = Math.max(0, this._autoHideRemainingTime);
      var opacity = this._opacity * (this._autoHideRemainingTime / this._autoHideTime);
      this._setOpacity(opacity);
    }
  };
  return _createClass(ScrollBar, [{
    key: "handle",
    get: function get() {
      return this._handle;
    },
    set: function set(value) {
      if (this._handle === value) {
        return;
      }
      this._handle = value;
      this.onScroll(Vec2.ZERO);
    }
  }, {
    key: "direction",
    get: function get() {
      return this._direction;
    },
    set: function set(value) {
      if (this._direction === value) {
        return;
      }
      this._direction = value;
      this.onScroll(Vec2.ZERO);
    }
  }, {
    key: "enableAutoHide",
    get: function get() {
      return this._enableAutoHide;
    },
    set: function set(value) {
      if (this._enableAutoHide === value) {
        return;
      }
      this._enableAutoHide = value;
      if (this._enableAutoHide) {
        this._setOpacity(0);
      }
    }
  }, {
    key: "autoHideTime",
    get: function get() {
      return this._autoHideTime;
    },
    set: function set(value) {
      if (this._autoHideTime === value) {
        return;
      }
      this._autoHideTime = value;
    }
  }]);
}(Component), _ScrollBar.Direction = ScrollBarDirection, _ScrollBar), _applyDecoratedDescriptor(_class2$a.prototype, "handle", [_dec4$7], Object.getOwnPropertyDescriptor(_class2$a.prototype, "handle"), _class2$a.prototype), _applyDecoratedDescriptor(_class2$a.prototype, "direction", [_dec5$7], Object.getOwnPropertyDescriptor(_class2$a.prototype, "direction"), _class2$a.prototype), _initializer$a = applyDecoratedInitializer(_class2$a.prototype, "_scrollView", [serializable], function () {
  return null;
}), _initializer2$9 = applyDecoratedInitializer(_class2$a.prototype, "_handle", [serializable], function () {
  return null;
}), _initializer3$7 = applyDecoratedInitializer(_class2$a.prototype, "_direction", [serializable], function () {
  return ScrollBarDirection.HORIZONTAL;
}), _initializer4$6 = applyDecoratedInitializer(_class2$a.prototype, "_enableAutoHide", [serializable], function () {
  return false;
}), _initializer5$4 = applyDecoratedInitializer(_class2$a.prototype, "_autoHideTime", [serializable], function () {
  return 1.0;
}), _class2$a)) || _class$c) || _class$c) || _class$c);
legacyCC.ScrollBar = ScrollBar;

var _dec$b, _dec2$a, _class$b;
var ViewGroup = (_dec$b = ccclass('cc.ViewGroup'), _dec2$a = executionOrder(110), _dec$b(_class$b = _dec2$a(_class$b = function (_Component) {
  function ViewGroup() {
    return _Component.apply(this, arguments) || this;
  }
  _inheritsLoose(ViewGroup, _Component);
  return ViewGroup;
}(Component)) || _class$b) || _class$b);
legacyCC.ViewGroup = ViewGroup;

var _dec$a, _dec2$9, _dec3$9, _dec4$6, _dec5$6, _dec6$2, _dec7$1, _class$a, _class2$9, _initializer$9, _initializer2$8, _initializer3$6, _initializer4$5, _initializer5$3, _initializer6$2, _initializer7$2, _initializer8$2, _initializer9$2, _initializer0$2, _initializer1$2, _ScrollView;
var NUMBER_OF_GATHERED_TOUCHES_FOR_MOVE_SPEED = 5;
var OUT_OF_BOUNDARY_BREAKING_FACTOR = 0.05;
var EPSILON = 1e-4;
var TOLERANCE = 1e4;
var MOVEMENT_FACTOR = 0.7;
var _tempVec3 = v3();
var _tempVec3_1 = v3();
var _tempVec2$1 = v2();
var _tempVec2_1$1 = v2();
var quintEaseOut = function quintEaseOut(time) {
  time -= 1;
  return time * time * time * time * time + 1;
};
var getTimeInMilliseconds = function getTimeInMilliseconds() {
  var currentTime = new Date();
  return currentTime.getMilliseconds();
};
var eventMap = {
  'scroll-to-top': 0,
  'scroll-to-bottom': 1,
  'scroll-to-left': 2,
  'scroll-to-right': 3,
  scrolling: 4,
  'bounce-bottom': 6,
  'bounce-left': 7,
  'bounce-right': 8,
  'bounce-top': 5,
  'scroll-ended': 9,
  'touch-up': 10,
  'scroll-ended-with-threshold': 11,
  'scroll-began': 12
};
var _moveDeltaOptions = {
  anchor: v2(),
  applyToHorizontal: false,
  applyToVertical: false
};
var assignMoveDeltaOption = function assignMoveDeltaOption(x, y, applyToHorizontal, applyToVertical) {
  _moveDeltaOptions.anchor.set(x, y);
  _moveDeltaOptions.applyToHorizontal = applyToHorizontal;
  _moveDeltaOptions.applyToVertical = applyToVertical;
};
var ScrollViewEventType;
(function (ScrollViewEventType) {
  ScrollViewEventType["NONE"] = "";
  ScrollViewEventType["SCROLL_TO_TOP"] = "scroll-to-top";
  ScrollViewEventType["SCROLL_TO_BOTTOM"] = "scroll-to-bottom";
  ScrollViewEventType["SCROLL_TO_LEFT"] = "scroll-to-left";
  ScrollViewEventType["SCROLL_TO_RIGHT"] = "scroll-to-right";
  ScrollViewEventType["SCROLL_BEGAN"] = "scroll-began";
  ScrollViewEventType["SCROLL_ENDED"] = "scroll-ended";
  ScrollViewEventType["BOUNCE_TOP"] = "bounce-top";
  ScrollViewEventType["BOUNCE_BOTTOM"] = "bounce-bottom";
  ScrollViewEventType["BOUNCE_LEFT"] = "bounce-left";
  ScrollViewEventType["BOUNCE_RIGHT"] = "bounce-right";
  ScrollViewEventType["SCROLLING"] = "scrolling";
  ScrollViewEventType["SCROLL_ENG_WITH_THRESHOLD"] = "scroll-ended-with-threshold";
  ScrollViewEventType["TOUCH_UP"] = "touch-up";
})(ScrollViewEventType || (ScrollViewEventType = {}));
var XrhoverType;
(function (XrhoverType) {
  XrhoverType[XrhoverType["NONE"] = 0] = "NONE";
  XrhoverType[XrhoverType["LEFT"] = 1] = "LEFT";
  XrhoverType[XrhoverType["RIGHT"] = 2] = "RIGHT";
})(XrhoverType || (XrhoverType = {}));
var ScrollView = (_dec$a = ccclass('cc.ScrollView'), _dec2$9 = executionOrder(110), _dec3$9 = requireComponent(UITransform), _dec4$6 = type(Node), _dec5$6 = type(ScrollBar), _dec6$2 = type(ScrollBar), _dec7$1 = type([EventHandler]), _dec$a(_class$a = _dec2$9(_class$a = _dec3$9(_class$a = (_class2$9 = (_ScrollView = function (_ViewGroup) {
  function ScrollView() {
    var _this;
    _this = _ViewGroup.call(this) || this;
    _this.bounceDuration = _initializer$9 && _initializer$9();
    _this.brake = _initializer2$8 && _initializer2$8();
    _this.elastic = _initializer3$6 && _initializer3$6();
    _this.inertia = _initializer4$5 && _initializer4$5();
    _this.horizontal = _initializer5$3 && _initializer5$3();
    _this.vertical = _initializer6$2 && _initializer6$2();
    _this.cancelInnerEvents = _initializer7$2 && _initializer7$2();
    _this.scrollEvents = _initializer8$2 && _initializer8$2();
    _this._autoScrolling = false;
    _this._scrolling = false;
    _this._content = _initializer9$2 && _initializer9$2();
    _this._horizontalScrollBar = _initializer0$2 && _initializer0$2();
    _this._verticalScrollBar = _initializer1$2 && _initializer1$2();
    _this._topBoundary = 0;
    _this._bottomBoundary = 0;
    _this._leftBoundary = 0;
    _this._rightBoundary = 0;
    _this._touchMoveDisplacements = [];
    _this._touchMoveTimeDeltas = [];
    _this._touchMovePreviousTimestamp = 0;
    _this._touchMoved = false;
    _this._autoScrollAttenuate = false;
    _this._autoScrollStartPosition = new Vec3();
    _this._autoScrollTargetDelta = new Vec3();
    _this._autoScrollTotalTime = 0;
    _this._autoScrollAccumulatedTime = 0;
    _this._autoScrollCurrentlyOutOfBoundary = false;
    _this._autoScrollBraking = false;
    _this._autoScrollBrakingStartPosition = new Vec3();
    _this._outOfBoundaryAmount = new Vec3();
    _this._outOfBoundaryAmountDirty = true;
    _this._stopMouseWheel = false;
    _this._mouseWheelEventElapsedTime = 0.0;
    _this._isScrollEndedWithThresholdEventFired = false;
    _this._scrollEventEmitMask = 0;
    _this._isBouncing = false;
    _this._contentPos = new Vec3();
    _this._deltaPos = new Vec3();
    _this._deltaAmount = new Vec3();
    _this._hoverIn = XrhoverType.NONE;
    return _this;
  }
  _inheritsLoose(ScrollView, _ViewGroup);
  var _proto = ScrollView.prototype;
  _proto.scrollToBottom = function scrollToBottom(timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    this._doScroll(0, 0, false, true, timeInSecond, attenuated);
  };
  _proto.scrollToTop = function scrollToTop(timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    this._doScroll(0, 1, false, true, timeInSecond, attenuated);
  };
  _proto.scrollToLeft = function scrollToLeft(timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    this._doScroll(0, 0, true, false, timeInSecond, attenuated);
  };
  _proto.scrollToRight = function scrollToRight(timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    this._doScroll(1, 0, true, false, timeInSecond, attenuated);
  };
  _proto.scrollToTopLeft = function scrollToTopLeft(timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    this._doScroll(0, 1, true, true, timeInSecond, attenuated);
  };
  _proto.scrollToTopRight = function scrollToTopRight(timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    this._doScroll(1, 1, true, true, timeInSecond, attenuated);
  };
  _proto.scrollToBottomLeft = function scrollToBottomLeft(timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    this._doScroll(0, 0, true, true, timeInSecond, attenuated);
  };
  _proto.scrollToBottomRight = function scrollToBottomRight(timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    this._doScroll(1, 0, true, true, timeInSecond, attenuated);
  };
  _proto.scrollToOffset = function scrollToOffset(offset, timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    var maxScrollOffset = this.getMaxScrollOffset();
    var anchor = v2();
    if (maxScrollOffset.x === 0) {
      anchor.x = 0;
    } else {
      anchor.x = offset.x / maxScrollOffset.x;
    }
    if (maxScrollOffset.y === 0) {
      anchor.y = 1;
    } else {
      anchor.y = (maxScrollOffset.y - offset.y) / maxScrollOffset.y;
    }
    this.scrollTo(anchor, timeInSecond, attenuated);
  };
  _proto.getScrollOffset = function getScrollOffset() {
    var topDelta = this._getContentTopBoundary() - this._topBoundary;
    var leftDelta = this._getContentLeftBoundary() - this._leftBoundary;
    return new Vec2(leftDelta, topDelta);
  };
  _proto.getMaxScrollOffset = function getMaxScrollOffset() {
    if (!this._content || !this.view) {
      return Vec2.ZERO;
    }
    var contentSize = this._content._getUITransformComp().contentSize;
    var horizontalMaximizeOffset = contentSize.width - this.view.width;
    var verticalMaximizeOffset = contentSize.height - this.view.height;
    horizontalMaximizeOffset = horizontalMaximizeOffset >= 0 ? horizontalMaximizeOffset : 0;
    verticalMaximizeOffset = verticalMaximizeOffset >= 0 ? verticalMaximizeOffset : 0;
    return new Vec2(horizontalMaximizeOffset, verticalMaximizeOffset);
  };
  _proto.scrollToPercentHorizontal = function scrollToPercentHorizontal(percent, timeInSecond, attenuated) {
    this._doScroll(percent, 0, true, false, timeInSecond, attenuated);
  };
  _proto.scrollTo = function scrollTo(anchor, timeInSecond, attenuated) {
    this._doScroll(anchor.x, anchor.y, true, true, timeInSecond, attenuated);
  };
  _proto.scrollToPercentVertical = function scrollToPercentVertical(percent, timeInSecond, attenuated) {
    this._doScroll(0, percent, false, true, timeInSecond, attenuated);
  };
  _proto._doScroll = function _doScroll(x, y, applyToHorizontal, applyToVertical, timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = true;
    }
    assignMoveDeltaOption(x, y, applyToHorizontal, applyToVertical);
    var moveDelta = this._calculateMovePercentDelta(_moveDeltaOptions);
    if (timeInSecond) {
      this._startAutoScroll(moveDelta, timeInSecond, attenuated);
    } else {
      this._moveContent(moveDelta);
    }
  };
  _proto.stopAutoScroll = function stopAutoScroll() {
    this._autoScrolling = false;
    this._autoScrollAccumulatedTime = this._autoScrollTotalTime;
  };
  _proto.setContentPosition = function setContentPosition(position) {
    this._setContentPosition(position);
  };
  _proto._setContentPosition = function _setContentPosition(position) {
    if (!this._content) {
      return;
    }
    var contentPos = this._getContentPosition();
    if (Math.abs(position.x - contentPos.x) < EPSILON && Math.abs(position.y - contentPos.y) < EPSILON) {
      return;
    }
    this._content.setPosition(position);
    this._outOfBoundaryAmountDirty = true;
  };
  _proto.getContentPosition = function getContentPosition() {
    return this._getContentPosition();
  };
  _proto._getContentPosition = function _getContentPosition() {
    if (!this._content) {
      return Vec3.ZERO.clone();
    }
    this._contentPos.set(this._content.position);
    return this._contentPos;
  };
  _proto.isScrolling = function isScrolling() {
    return this._scrolling;
  };
  _proto.isAutoScrolling = function isAutoScrolling() {
    return this._autoScrolling;
  };
  _proto.getScrollEndedEventTiming = function getScrollEndedEventTiming() {
    return EPSILON;
  };
  _proto.start = function start() {
    this._calculateBoundary();
    if (this._content) {
      director.once(DirectorEvent.BEFORE_DRAW, this._adjustContentOutOfBoundary, this);
    }
  };
  _proto.onEnable = function onEnable() {
    var self = this;
    {
      self._registerEvent();
      var content = this._content;
      if (content) {
        content.on(NodeEventType.SIZE_CHANGED, self._calculateBoundary, self);
        content.on(NodeEventType.TRANSFORM_CHANGED, self._scaleChanged, self);
        var view = self.view;
        if (view) {
          view.node.on(NodeEventType.TRANSFORM_CHANGED, self._scaleChanged, self);
          view.node.on(NodeEventType.SIZE_CHANGED, self._calculateBoundary, self);
        }
      }
      self._calculateBoundary();
    }
    self._updateScrollBarState();
  };
  _proto.update = function update(dt) {
    var deltaAmount = this._deltaAmount;
    if (this._autoScrolling) {
      this._processAutoScrolling(dt);
      deltaAmount.x = 0;
      deltaAmount.y = 0;
    } else if (deltaAmount.x !== 0 || deltaAmount.y !== 0) {
      this._processDeltaMove(deltaAmount);
      deltaAmount.x = 0;
      deltaAmount.y = 0;
    }
  };
  _proto.onDisable = function onDisable() {
    var self = this;
    {
      self._unregisterEvent();
      var content = self.content;
      if (content) {
        content.off(NodeEventType.SIZE_CHANGED, self._calculateBoundary, self);
        content.off(NodeEventType.TRANSFORM_CHANGED, self._scaleChanged, self);
        var view = self.view;
        if (view) {
          view.node.off(NodeEventType.TRANSFORM_CHANGED, self._scaleChanged, self);
          view.node.off(NodeEventType.SIZE_CHANGED, self._calculateBoundary, self);
        }
      }
    }
    self._deltaAmount.set(0, 0);
    self._hideScrollBar();
    self.stopAutoScroll();
  };
  _proto._registerEvent = function _registerEvent() {
    var self = this;
    var node = self.node;
    node.on(NodeEventType.TOUCH_START, self._onTouchBegan, self, true);
    node.on(NodeEventType.TOUCH_MOVE, self._onTouchMoved, self, true);
    node.on(NodeEventType.TOUCH_END, self._onTouchEnded, self, true);
    node.on(NodeEventType.TOUCH_CANCEL, self._onTouchCancelled, self, true);
    node.on(NodeEventType.MOUSE_WHEEL, self._onMouseWheel, self, true);
    {
      node.on(XrUIPressEventType.XRUI_HOVER_ENTERED, self._xrHoverEnter, self);
      node.on(XrUIPressEventType.XRUI_HOVER_EXITED, self._xrHoverExit, self);
    }
    input.on(InputEventType.HANDLE_INPUT, self._dispatchEventHandleInput, self);
    input.on(InputEventType.GAMEPAD_INPUT, self._dispatchEventHandleInput, self);
  };
  _proto._unregisterEvent = function _unregisterEvent() {
    var self = this;
    var node = self.node;
    node.off(NodeEventType.TOUCH_START, self._onTouchBegan, self, true);
    node.off(NodeEventType.TOUCH_MOVE, self._onTouchMoved, self, true);
    node.off(NodeEventType.TOUCH_END, self._onTouchEnded, self, true);
    node.off(NodeEventType.TOUCH_CANCEL, self._onTouchCancelled, self, true);
    node.off(NodeEventType.MOUSE_WHEEL, self._onMouseWheel, self, true);
    {
      node.off(XrUIPressEventType.XRUI_HOVER_ENTERED, self._xrHoverEnter, self);
      node.off(XrUIPressEventType.XRUI_HOVER_EXITED, self._xrHoverExit, self);
    }
    input.off(InputEventType.HANDLE_INPUT, self._dispatchEventHandleInput, self);
    input.off(InputEventType.GAMEPAD_INPUT, self._dispatchEventHandleInput, self);
  };
  _proto._onMouseWheel = function _onMouseWheel(event, captureListeners) {
    var self = this;
    if (!self.enabledInHierarchy) {
      return;
    }
    if (self._hasNestedViewGroup(event, captureListeners)) {
      return;
    }
    var wheelPrecision = -0.1;
    var scrollY = event.getScrollY();
    var deltaMove = _tempVec3;
    if (self.vertical) {
      deltaMove.set(0, scrollY * wheelPrecision, 0);
    } else if (self.horizontal) {
      deltaMove.set(scrollY * wheelPrecision, 0, 0);
    }
    self._mouseWheelEventElapsedTime = 0;
    self._deltaAmount.add(deltaMove);
    if (!self._stopMouseWheel) {
      self._handlePressLogic();
      self.schedule(this._checkMouseWheel, 1.0 / 60);
      self._stopMouseWheel = true;
    }
    self._stopPropagationIfTargetIsMe(event);
  };
  _proto._onTouchBegan = function _onTouchBegan(event, captureListeners) {
    var self = this;
    if (!self.enabledInHierarchy || !self._content) {
      return;
    }
    if (self._hasNestedViewGroup(event, captureListeners)) {
      return;
    }
    self._handlePressLogic();
    self._touchMoved = false;
    self._stopPropagationIfTargetIsMe(event);
  };
  _proto._onTouchMoved = function _onTouchMoved(event, captureListeners) {
    var self = this;
    if (!self.enabledInHierarchy || !self._content) {
      return;
    }
    if (self._hasNestedViewGroup(event, captureListeners)) {
      return;
    }
    var touch = event.touch;
    self._handleMoveLogic(touch);
    if (!self.cancelInnerEvents) {
      return;
    }
    var deltaMove = touch.getUILocation(_tempVec2$1);
    deltaMove.subtract(touch.getUIStartLocation(_tempVec2_1$1));
    if (deltaMove.length() > 7) {
      if (!self._touchMoved && event.target !== self.node) {
        var cancelEvent = new EventTouch(event.getTouches(), event.bubbles, SystemEventType.TOUCH_CANCEL);
        cancelEvent.touch = event.touch;
        cancelEvent.simulate = true;
        event.target.dispatchEvent(cancelEvent);
        self._touchMoved = true;
      }
    }
    self._stopPropagationIfTargetIsMe(event);
  };
  _proto._onTouchEnded = function _onTouchEnded(event, captureListeners) {
    var self = this;
    if (!self.enabledInHierarchy || !self._content || !event) {
      return;
    }
    if (self._hasNestedViewGroup(event, captureListeners)) {
      return;
    }
    self._dispatchEvent(ScrollViewEventType.TOUCH_UP);
    var touch = event.touch;
    self._handleReleaseLogic(touch);
    if (self._touchMoved) {
      event.propagationStopped = true;
    } else {
      self._stopPropagationIfTargetIsMe(event);
    }
  };
  _proto._onTouchCancelled = function _onTouchCancelled(event, captureListeners) {
    var self = this;
    if (!self.enabledInHierarchy || !self._content) {
      return;
    }
    if (self._hasNestedViewGroup(event, captureListeners)) {
      return;
    }
    if (event && !event.simulate) {
      self._handleReleaseLogic(event.touch);
    }
    self._stopPropagationIfTargetIsMe(event);
  };
  _proto._calculateBoundary = function _calculateBoundary() {
    var self = this;
    if (self._content && self.view) {
      var layout = self._content.getComponent(Layout);
      if (layout && layout.enabledInHierarchy) {
        layout.updateLayout();
      }
      var viewTrans = self.view;
      var anchorX = viewTrans.width * viewTrans.anchorX;
      var anchorY = viewTrans.height * viewTrans.anchorY;
      self._leftBoundary = -anchorX;
      self._bottomBoundary = -anchorY;
      self._rightBoundary = self._leftBoundary + viewTrans.width;
      self._topBoundary = self._bottomBoundary + viewTrans.height;
      self._moveContentToTopLeft(viewTrans.contentSize);
    }
  };
  _proto._hasNestedViewGroup = function _hasNestedViewGroup(event, captureListeners) {
    if (!event || event.eventPhase !== Event.CAPTURING_PHASE) {
      return false;
    }
    if (captureListeners) {
      for (var i = 0; i < captureListeners.length; i++) {
        var listener = captureListeners[i];
        if (this.node === listener) {
          if (event.target && event.target.getComponent(ViewGroup)) {
            return true;
          }
          return false;
        }
        if (listener.getComponent(ViewGroup)) {
          return true;
        }
      }
    }
    return false;
  };
  _proto._startInertiaScroll = function _startInertiaScroll(touchMoveVelocity) {
    _tempVec3.set(touchMoveVelocity);
    _tempVec3.multiplyScalar(MOVEMENT_FACTOR);
    this._startAttenuatingAutoScroll(_tempVec3, touchMoveVelocity);
  };
  _proto._calculateAttenuatedFactor = function _calculateAttenuatedFactor(distance) {
    if (this.brake <= 0) {
      return 1 - this.brake;
    }
    return (1 - this.brake) * (1 / (1 + distance * 0.000014 + distance * distance * 0.000000008));
  };
  _proto._startAttenuatingAutoScroll = function _startAttenuatingAutoScroll(deltaMove, initialVelocity) {
    var targetDelta = deltaMove.clone();
    targetDelta.normalize();
    if (this._content && this.view) {
      var contentSize = this._content._getUITransformComp().contentSize;
      var scrollViewSize = this.view.contentSize;
      var totalMoveWidth = contentSize.width - scrollViewSize.width;
      var totalMoveHeight = contentSize.height - scrollViewSize.height;
      var attenuatedFactorX = this._calculateAttenuatedFactor(totalMoveWidth);
      var attenuatedFactorY = this._calculateAttenuatedFactor(totalMoveHeight);
      targetDelta.x = targetDelta.x * totalMoveWidth * (1 - this.brake) * attenuatedFactorX;
      targetDelta.y = targetDelta.y * totalMoveHeight * attenuatedFactorY * (1 - this.brake);
      targetDelta.z = 0;
    }
    var originalMoveLength = deltaMove.length();
    var factor = targetDelta.length() / originalMoveLength;
    if (this.brake > 0 && factor > 7) {
      factor = Math.sqrt(factor);
      targetDelta.set(deltaMove);
      targetDelta.multiplyScalar(factor + 1);
    } else {
      targetDelta.add(deltaMove);
    }
    var time = this._calculateAutoScrollTimeByInitialSpeed(initialVelocity.length());
    if (this.brake > 0 && factor > 3) {
      factor = 3;
      time *= factor;
    }
    if (this.brake === 0 && factor > 1) {
      time *= factor;
    }
    this._startAutoScroll(targetDelta, time, true);
  };
  _proto._calculateAutoScrollTimeByInitialSpeed = function _calculateAutoScrollTimeByInitialSpeed(initialSpeed) {
    return Math.sqrt(Math.sqrt(initialSpeed / 5));
  };
  _proto._startAutoScroll = function _startAutoScroll(deltaMove, timeInSecond, attenuated) {
    if (attenuated === void 0) {
      attenuated = false;
    }
    var self = this;
    var adjustedDeltaMove = self._flattenVectorByDirection(deltaMove);
    self._autoScrolling = true;
    self._autoScrollTargetDelta = adjustedDeltaMove;
    self._autoScrollAttenuate = attenuated;
    Vec3.copy(self._autoScrollStartPosition, self._getContentPosition());
    self._autoScrollTotalTime = timeInSecond;
    self._autoScrollAccumulatedTime = 0;
    self._autoScrollBraking = false;
    self._isScrollEndedWithThresholdEventFired = false;
    self._autoScrollBrakingStartPosition.set(0, 0, 0);
    var currentOutOfBoundary = self._getHowMuchOutOfBoundary();
    if (!currentOutOfBoundary.equals(Vec3.ZERO, EPSILON)) {
      this._autoScrollCurrentlyOutOfBoundary = true;
    }
  };
  _proto._calculateTouchMoveVelocity = function _calculateTouchMoveVelocity() {
    var out = new Vec3();
    var totalTime = 0;
    totalTime = this._touchMoveTimeDeltas.reduce(function (a, b) {
      return a + b;
    }, totalTime);
    if (totalTime <= 0 || totalTime >= 0.5) {
      out.set(Vec3.ZERO);
    } else {
      var totalMovement = _tempVec3;
      totalMovement.set(0, 0, 0);
      totalMovement = this._touchMoveDisplacements.reduce(function (a, b) {
        a.add(b);
        return a;
      }, totalMovement);
      out.set(totalMovement.x * (1 - this.brake) / totalTime, totalMovement.y * (1 - this.brake) / totalTime, totalMovement.z);
    }
    return out;
  };
  _proto._flattenVectorByDirection = function _flattenVectorByDirection(vector) {
    if (!this.horizontal) vector.x = 0;
    if (!this.vertical) vector.y = 0;
    return vector;
  };
  _proto._moveContent = function _moveContent(deltaMove, canStartBounceBack) {
    var adjustedMove = this._flattenVectorByDirection(deltaMove);
    _tempVec3.set(this._getContentPosition());
    _tempVec3.add(adjustedMove);
    _tempVec3.set(Math.round(_tempVec3.x * TOLERANCE) * EPSILON, Math.round(_tempVec3.y * TOLERANCE) * EPSILON, _tempVec3.z);
    this._setContentPosition(_tempVec3);
    var outOfBoundary = this._getHowMuchOutOfBoundary();
    _tempVec2$1.set(outOfBoundary.x, outOfBoundary.y);
    this._updateScrollBar(_tempVec2$1);
    if (this.elastic && canStartBounceBack) {
      this._startBounceBackIfNeeded();
    }
  };
  _proto._getContentLeftBoundary = function _getContentLeftBoundary() {
    if (!this._content) {
      return -1;
    }
    var contentPos = this._getContentPosition();
    var uiTrans = this._content._getUITransformComp();
    return contentPos.x - uiTrans.anchorX * uiTrans.width;
  };
  _proto._getContentRightBoundary = function _getContentRightBoundary() {
    if (!this._content) {
      return -1;
    }
    var uiTrans = this._content._getUITransformComp();
    return this._getContentLeftBoundary() + uiTrans.width;
  };
  _proto._getContentTopBoundary = function _getContentTopBoundary() {
    if (!this._content) {
      return -1;
    }
    var uiTrans = this._content._getUITransformComp();
    return this._getContentBottomBoundary() + uiTrans.height;
  };
  _proto._getContentBottomBoundary = function _getContentBottomBoundary() {
    if (!this._content) {
      return -1;
    }
    var contentPos = this._getContentPosition();
    var uiTrans = this._content._getUITransformComp();
    return contentPos.y - uiTrans.anchorY * uiTrans.height;
  };
  _proto._getHowMuchOutOfBoundary = function _getHowMuchOutOfBoundary(addition) {
    if (!addition) {
      addition = Vec3.ZERO;
    }
    if (addition.equals(Vec3.ZERO, EPSILON) && !this._outOfBoundaryAmountDirty) {
      return this._outOfBoundaryAmount;
    }
    var outOfBoundaryAmount = new Vec3();
    var tempLeftBoundary = this._getContentLeftBoundary();
    var tempRightBoundary = this._getContentRightBoundary();
    if (tempLeftBoundary + addition.x > this._leftBoundary) {
      outOfBoundaryAmount.x = this._leftBoundary - (tempLeftBoundary + addition.x);
    } else if (tempRightBoundary + addition.x < this._rightBoundary) {
      outOfBoundaryAmount.x = this._rightBoundary - (tempRightBoundary + addition.x);
    }
    var tempTopBoundary = this._getContentTopBoundary();
    var tempBottomBoundary = this._getContentBottomBoundary();
    if (tempTopBoundary + addition.y < this._topBoundary) {
      outOfBoundaryAmount.y = this._topBoundary - (tempTopBoundary + addition.y);
    } else if (tempBottomBoundary + addition.y > this._bottomBoundary) {
      outOfBoundaryAmount.y = this._bottomBoundary - (tempBottomBoundary + addition.y);
    }
    if (addition.equals(Vec3.ZERO, EPSILON)) {
      this._outOfBoundaryAmount = outOfBoundaryAmount;
      this._outOfBoundaryAmountDirty = false;
    }
    this._clampDelta(outOfBoundaryAmount);
    return outOfBoundaryAmount;
  };
  _proto._updateScrollBar = function _updateScrollBar(outOfBoundary) {
    if (this._horizontalScrollBar && this._horizontalScrollBar.isValid) {
      this._horizontalScrollBar.onScroll(outOfBoundary);
    }
    if (this._verticalScrollBar && this._verticalScrollBar.isValid) {
      this._verticalScrollBar.onScroll(outOfBoundary);
    }
  };
  _proto._onScrollBarTouchBegan = function _onScrollBarTouchBegan() {
    if (this._horizontalScrollBar && this._horizontalScrollBar.isValid) {
      this._horizontalScrollBar.onTouchBegan();
    }
    if (this._verticalScrollBar && this._verticalScrollBar.isValid) {
      this._verticalScrollBar.onTouchBegan();
    }
  };
  _proto._onScrollBarTouchEnded = function _onScrollBarTouchEnded() {
    if (this._horizontalScrollBar && this._horizontalScrollBar.isValid) {
      this._horizontalScrollBar.onTouchEnded();
    }
    if (this._verticalScrollBar && this._verticalScrollBar.isValid) {
      this._verticalScrollBar.onTouchEnded();
    }
  };
  _proto._dispatchEvent = function _dispatchEvent(event) {
    if (event === ScrollViewEventType.SCROLL_ENDED) {
      this._scrollEventEmitMask = 0;
    } else if (event === ScrollViewEventType.SCROLL_TO_TOP || event === ScrollViewEventType.SCROLL_TO_BOTTOM || event === ScrollViewEventType.SCROLL_TO_LEFT || event === ScrollViewEventType.SCROLL_TO_RIGHT) {
      var flag = 1 << eventMap[event];
      if (this._scrollEventEmitMask & flag) {
        return;
      } else {
        this._scrollEventEmitMask |= flag;
      }
    }
    EventHandler.emitEvents(this.scrollEvents, this, eventMap[event]);
    this.node.emit(event, this);
  };
  _proto._adjustContentOutOfBoundary = function _adjustContentOutOfBoundary() {
    if (!this._content) {
      return;
    }
    this._outOfBoundaryAmountDirty = true;
    var outOfBoundary = this._getHowMuchOutOfBoundary();
    var _isOutOfBoundary = !outOfBoundary.equals(Vec3.ZERO, EPSILON);
    if (_isOutOfBoundary) {
      _tempVec3.set(this._getContentPosition());
      _tempVec3.add(outOfBoundary);
      this._setContentPosition(_tempVec3);
      this._updateScrollBar(Vec2.ZERO);
    }
  };
  _proto._hideScrollBar = function _hideScrollBar() {
    if (this._horizontalScrollBar && this._horizontalScrollBar.isValid) {
      this._horizontalScrollBar.hide();
    }
    if (this._verticalScrollBar && this._verticalScrollBar.isValid) {
      this._verticalScrollBar.hide();
    }
  };
  _proto._updateScrollBarState = function _updateScrollBarState() {
    var self = this;
    if (!self._content || !self.view) {
      return;
    }
    var viewTrans = self.view;
    var uiTrans = self._content._getUITransformComp();
    var verticalScrollBar = self._verticalScrollBar;
    if (verticalScrollBar && verticalScrollBar.isValid) {
      if (uiTrans.height < viewTrans.height || approx(uiTrans.height, viewTrans.height)) {
        verticalScrollBar.hide();
      } else {
        verticalScrollBar.show();
      }
    }
    var horizontalScrollBar = self._horizontalScrollBar;
    if (horizontalScrollBar && horizontalScrollBar.isValid) {
      if (uiTrans.width < viewTrans.width || approx(uiTrans.width, viewTrans.width)) {
        horizontalScrollBar.hide();
      } else {
        horizontalScrollBar.show();
      }
    }
  };
  _proto._stopPropagationIfTargetIsMe = function _stopPropagationIfTargetIsMe(event) {
    if (event.eventPhase === Event.AT_TARGET && event.target === this.node) {
      event.propagationStopped = true;
    }
  };
  _proto._processDeltaMove = function _processDeltaMove(deltaMove) {
    this._scrollChildren(deltaMove);
    this._gatherTouchMove(deltaMove);
  };
  _proto._handleMoveLogic = function _handleMoveLogic(touch) {
    this._getLocalAxisAlignDelta(this._deltaPos, touch);
    this._deltaAmount.add(this._deltaPos);
  };
  _proto._handleReleaseLogic = function _handleReleaseLogic(touch) {
    var self = this;
    self._getLocalAxisAlignDelta(self._deltaPos, touch);
    self._gatherTouchMove(self._deltaPos);
    self._processInertiaScroll();
    if (self._scrolling) {
      self._scrolling = false;
      if (!self._autoScrolling) {
        self._dispatchEvent(ScrollViewEventType.SCROLL_ENDED);
      }
    }
  };
  _proto._getLocalAxisAlignDelta = function _getLocalAxisAlignDelta(out, touch) {
    var uiTransformComp = this.node._getUITransformComp();
    if (uiTransformComp) {
      touch.getUILocation(_tempVec2$1);
      touch.getUIPreviousLocation(_tempVec2_1$1);
      _tempVec3.set(_tempVec2$1.x, _tempVec2$1.y, 0);
      _tempVec3_1.set(_tempVec2_1$1.x, _tempVec2_1$1.y, 0);
      uiTransformComp.convertToNodeSpaceAR(_tempVec3, _tempVec3);
      uiTransformComp.convertToNodeSpaceAR(_tempVec3_1, _tempVec3_1);
      Vec3.subtract(out, _tempVec3, _tempVec3_1);
    }
  };
  _proto._scrollChildren = function _scrollChildren(deltaMove) {
    var self = this;
    self._clampDelta(deltaMove);
    var realMove = deltaMove;
    var outOfBoundary;
    if (self.elastic) {
      outOfBoundary = self._getHowMuchOutOfBoundary();
      realMove.x *= outOfBoundary.x === 0 ? 1 : 0.5;
      realMove.y *= outOfBoundary.y === 0 ? 1 : 0.5;
    }
    if (!self.elastic) {
      outOfBoundary = self._getHowMuchOutOfBoundary(realMove);
      realMove.add(outOfBoundary);
    }
    var verticalScrollEventType = ScrollViewEventType.NONE;
    var horizontalScrollEventType = ScrollViewEventType.NONE;
    if (self._content) {
      var _ref = self._content._getUITransformComp(),
        anchorX = _ref.anchorX,
        anchorY = _ref.anchorY,
        width = _ref.width,
        height = _ref.height;
      var pos = self._content.position || Vec3.ZERO;
      if (self.vertical) {
        if (realMove.y > 0) {
          var icBottomPos = pos.y - anchorY * height;
          if (icBottomPos + realMove.y >= self._bottomBoundary) {
            verticalScrollEventType = ScrollViewEventType.SCROLL_TO_BOTTOM;
          }
        } else if (realMove.y < 0) {
          var icTopPos = pos.y - anchorY * height + height;
          if (icTopPos + realMove.y <= self._topBoundary) {
            verticalScrollEventType = ScrollViewEventType.SCROLL_TO_TOP;
          }
        }
      }
      if (self.horizontal) {
        if (realMove.x < 0) {
          var icRightPos = pos.x - anchorX * width + width;
          if (icRightPos + realMove.x <= self._rightBoundary) {
            horizontalScrollEventType = ScrollViewEventType.SCROLL_TO_RIGHT;
          }
        } else if (realMove.x > 0) {
          var icLeftPos = pos.x - anchorX * width;
          if (icLeftPos + realMove.x >= self._leftBoundary) {
            horizontalScrollEventType = ScrollViewEventType.SCROLL_TO_LEFT;
          }
        }
      }
    }
    self._moveContent(realMove, false);
    if (self.horizontal && realMove.x !== 0 || self.vertical && realMove.y !== 0) {
      if (!self._scrolling) {
        self._scrolling = true;
        self._dispatchEvent(ScrollViewEventType.SCROLL_BEGAN);
      }
      self._dispatchEvent(ScrollViewEventType.SCROLLING);
    }
    if (verticalScrollEventType !== ScrollViewEventType.NONE) {
      self._dispatchEvent(verticalScrollEventType);
    }
    if (horizontalScrollEventType !== ScrollViewEventType.NONE) {
      self._dispatchEvent(horizontalScrollEventType);
    }
  };
  _proto._handlePressLogic = function _handlePressLogic() {
    var self = this;
    if (self._autoScrolling) {
      self._dispatchEvent(ScrollViewEventType.SCROLL_ENDED);
    }
    self._autoScrolling = false;
    self._isBouncing = false;
    self._touchMovePreviousTimestamp = getTimeInMilliseconds();
    self._touchMoveDisplacements.length = 0;
    self._touchMoveTimeDeltas.length = 0;
    self._onScrollBarTouchBegan();
  };
  _proto._clampDelta = function _clampDelta(out) {
    if (this._content && this.view) {
      var scrollViewSize = this.view.contentSize;
      var uiTrans = this._content._getUITransformComp();
      if (uiTrans.width < scrollViewSize.width) {
        out.x = 0;
      }
      if (uiTrans.height < scrollViewSize.height) {
        out.y = 0;
      }
    }
  };
  _proto._gatherTouchMove = function _gatherTouchMove(delta) {
    var self = this;
    var clampDt = delta.clone();
    self._clampDelta(clampDt);
    while (self._touchMoveDisplacements.length >= NUMBER_OF_GATHERED_TOUCHES_FOR_MOVE_SPEED) {
      self._touchMoveDisplacements.shift();
      self._touchMoveTimeDeltas.shift();
    }
    self._touchMoveDisplacements.push(clampDt);
    var timeStamp = getTimeInMilliseconds();
    self._touchMoveTimeDeltas.push((timeStamp - self._touchMovePreviousTimestamp) / 1000);
    self._touchMovePreviousTimestamp = timeStamp;
  };
  _proto._startBounceBackIfNeeded = function _startBounceBackIfNeeded() {
    var self = this;
    if (!self.elastic) {
      return false;
    }
    var bounceBackAmount = self._getHowMuchOutOfBoundary();
    self._clampDelta(bounceBackAmount);
    if (bounceBackAmount.equals(Vec3.ZERO, EPSILON)) {
      return false;
    }
    var bounceBackTime = Math.max(self.bounceDuration, 0);
    self._startAutoScroll(bounceBackAmount, bounceBackTime, true);
    if (!self._isBouncing) {
      if (bounceBackAmount.y > 0) {
        self._dispatchEvent(ScrollViewEventType.BOUNCE_TOP);
      }
      if (bounceBackAmount.y < 0) {
        self._dispatchEvent(ScrollViewEventType.BOUNCE_BOTTOM);
      }
      if (bounceBackAmount.x > 0) {
        self._dispatchEvent(ScrollViewEventType.BOUNCE_RIGHT);
      }
      if (bounceBackAmount.x < 0) {
        self._dispatchEvent(ScrollViewEventType.BOUNCE_LEFT);
      }
      self._isBouncing = true;
    }
    return true;
  };
  _proto._processInertiaScroll = function _processInertiaScroll() {
    var bounceBackStarted = this._startBounceBackIfNeeded();
    if (!bounceBackStarted && this.inertia) {
      var touchMoveVelocity = this._calculateTouchMoveVelocity();
      if (!touchMoveVelocity.equals(Vec3.ZERO, EPSILON) && this.brake < 1) {
        this._startInertiaScroll(touchMoveVelocity);
      }
    }
    this._onScrollBarTouchEnded();
  };
  _proto._isOutOfBoundary = function _isOutOfBoundary() {
    var outOfBoundary = this._getHowMuchOutOfBoundary();
    return !outOfBoundary.equals(Vec3.ZERO, EPSILON);
  };
  _proto._isNecessaryAutoScrollBrake = function _isNecessaryAutoScrollBrake() {
    var self = this;
    if (self._autoScrollBraking) {
      return true;
    }
    if (self._isOutOfBoundary()) {
      if (!self._autoScrollCurrentlyOutOfBoundary) {
        self._autoScrollCurrentlyOutOfBoundary = true;
        self._autoScrollBraking = true;
        Vec3.copy(self._autoScrollBrakingStartPosition, self._getContentPosition());
        return true;
      }
    } else {
      self._autoScrollCurrentlyOutOfBoundary = false;
    }
    return false;
  };
  _proto._processAutoScrolling = function _processAutoScrolling(dt) {
    var self = this;
    var isAutoScrollBrake = self._isNecessaryAutoScrollBrake();
    var brakingFactor = isAutoScrollBrake ? OUT_OF_BOUNDARY_BREAKING_FACTOR : 1;
    self._autoScrollAccumulatedTime += dt * (1 / brakingFactor);
    var percentage = Math.min(1, self._autoScrollAccumulatedTime / self._autoScrollTotalTime);
    if (self._autoScrollAttenuate) {
      percentage = quintEaseOut(percentage);
    }
    var clonedAutoScrollTargetDelta = self._autoScrollTargetDelta.clone();
    clonedAutoScrollTargetDelta.multiplyScalar(percentage);
    var clonedAutoScrollStartPosition = self._autoScrollStartPosition.clone();
    clonedAutoScrollStartPosition.add(clonedAutoScrollTargetDelta);
    var reachedEnd = Math.abs(percentage - 1) <= EPSILON;
    var fireEvent = Math.abs(percentage - 1) <= self.getScrollEndedEventTiming();
    if (fireEvent && !self._isScrollEndedWithThresholdEventFired) {
      self._dispatchEvent(ScrollViewEventType.SCROLL_ENG_WITH_THRESHOLD);
      self._isScrollEndedWithThresholdEventFired = true;
    }
    if (self.elastic) {
      var brakeOffsetPosition = clonedAutoScrollStartPosition.clone();
      brakeOffsetPosition.subtract(self._autoScrollBrakingStartPosition);
      if (isAutoScrollBrake) {
        brakeOffsetPosition.multiplyScalar(brakingFactor);
      }
      clonedAutoScrollStartPosition.set(self._autoScrollBrakingStartPosition);
      clonedAutoScrollStartPosition.add(brakeOffsetPosition);
    } else {
      var moveDelta = clonedAutoScrollStartPosition.clone();
      moveDelta.subtract(self.getContentPosition());
      var outOfBoundary = self._getHowMuchOutOfBoundary(moveDelta);
      if (!outOfBoundary.equals(Vec3.ZERO, EPSILON)) {
        clonedAutoScrollStartPosition.add(outOfBoundary);
        reachedEnd = true;
      }
    }
    if (reachedEnd) {
      self._autoScrolling = false;
    }
    var deltaMove = clonedAutoScrollStartPosition.clone();
    deltaMove.subtract(self._getContentPosition());
    self._clampDelta(deltaMove);
    self._moveContent(deltaMove, reachedEnd);
    self._dispatchEvent(ScrollViewEventType.SCROLLING);
    if (!self._autoScrolling) {
      self._isBouncing = false;
      self._scrolling = false;
      self._dispatchEvent(ScrollViewEventType.SCROLL_ENDED);
    }
  };
  _proto._checkMouseWheel = function _checkMouseWheel(dt) {
    var self = this;
    var currentOutOfBoundary = self._getHowMuchOutOfBoundary();
    var maxElapsedTime = 0.1;
    if (!currentOutOfBoundary.equals(Vec3.ZERO, EPSILON)) {
      self._processInertiaScroll();
      if (self._scrolling) {
        self._scrolling = false;
        if (!self._autoScrolling) {
          self._dispatchEvent(ScrollViewEventType.SCROLL_ENDED);
        }
      }
      self.unschedule(self._checkMouseWheel);
      self._stopMouseWheel = false;
      return;
    }
    self._mouseWheelEventElapsedTime += dt;
    if (self._mouseWheelEventElapsedTime > maxElapsedTime) {
      self._onScrollBarTouchEnded();
      if (self._scrolling) {
        self._scrolling = false;
        if (!self._autoScrolling) {
          self._dispatchEvent(ScrollViewEventType.SCROLL_ENDED);
        }
      }
      self.unschedule(self._checkMouseWheel);
      self._stopMouseWheel = false;
    }
  };
  _proto._calculateMovePercentDelta = function _calculateMovePercentDelta(options) {
    var anchor = options.anchor;
    var applyToHorizontal = options.applyToHorizontal;
    var applyToVertical = options.applyToVertical;
    var self = this;
    self._calculateBoundary();
    anchor.clampf(Vec2.ZERO, Vec2.ONE);
    var bottomDelta = self._getContentBottomBoundary() - self._bottomBoundary;
    bottomDelta = -bottomDelta;
    var leftDelta = self._getContentLeftBoundary() - self._leftBoundary;
    leftDelta = -leftDelta;
    var moveDelta = new Vec3();
    if (self._content && self.view) {
      var totalScrollDelta = 0;
      var uiTrans = self._content._getUITransformComp();
      var contentSize = uiTrans.contentSize;
      var scrollSize = self.view.contentSize;
      if (applyToHorizontal) {
        totalScrollDelta = contentSize.width - scrollSize.width;
        moveDelta.x = leftDelta - totalScrollDelta * anchor.x;
      }
      if (applyToVertical) {
        totalScrollDelta = contentSize.height - scrollSize.height;
        moveDelta.y = bottomDelta - totalScrollDelta * anchor.y;
      }
    }
    return moveDelta;
  };
  _proto._moveContentToTopLeft = function _moveContentToTopLeft(scrollViewSize) {
    var self = this;
    var bottomDelta = self._getContentBottomBoundary() - self._bottomBoundary;
    bottomDelta = -bottomDelta;
    var moveDelta = new Vec3();
    var totalScrollDelta = 0;
    var leftDelta = self._getContentLeftBoundary() - self._leftBoundary;
    leftDelta = -leftDelta;
    if (self._content) {
      var uiTrans = self._content._getUITransformComp();
      var contentSize = uiTrans.contentSize;
      if (contentSize.height < scrollViewSize.height) {
        totalScrollDelta = contentSize.height - scrollViewSize.height;
        moveDelta.y = bottomDelta - totalScrollDelta;
      }
      if (contentSize.width < scrollViewSize.width) {
        totalScrollDelta = contentSize.width - scrollViewSize.width;
        moveDelta.x = leftDelta;
      }
    }
    self._updateScrollBarState();
    self._moveContent(moveDelta);
    self._adjustContentOutOfBoundary();
  };
  _proto._scaleChanged = function _scaleChanged(value) {
    if (value === TransformBit.SCALE) {
      this._calculateBoundary();
    }
  };
  _proto._xrHoverEnter = function _xrHoverEnter(event) {
    if (event.deviceType === DeviceType.Left) {
      this._hoverIn = XrhoverType.LEFT;
    } else if (event.deviceType === DeviceType.Right) {
      this._hoverIn = XrhoverType.RIGHT;
    }
  };
  _proto._xrHoverExit = function _xrHoverExit(event) {
    this._hoverIn = XrhoverType.NONE;
  };
  _proto._dispatchEventHandleInput = function _dispatchEventHandleInput(event) {
    var handleInputDevice;
    if (event instanceof EventGamepad) {
      handleInputDevice = event.gamepad;
    } else if (event instanceof EventHandle) {
      handleInputDevice = event.handleInputDevice;
    }
    var value;
    if (!this.enabledInHierarchy || this._hoverIn === XrhoverType.NONE) {
      return;
    }
    {
      if (this._hoverIn === XrhoverType.LEFT) {
        value = handleInputDevice.leftStick.getValue();
        if (!value.equals(Vec2.ZERO)) {
          this._xrThumbStickMove(value);
        }
      } else if (this._hoverIn === XrhoverType.RIGHT) {
        value = handleInputDevice.rightStick.getValue();
        if (!value.equals(Vec2.ZERO)) {
          this._xrThumbStickMove(value);
        }
      }
    }
  };
  _proto._xrThumbStickMove = function _xrThumbStickMove(event) {
    var self = this;
    if (!self.enabledInHierarchy) {
      return;
    }
    var wheelPrecision = -62.5;
    var scrollY = event.y;
    var deltaMove = _tempVec3;
    if (self.vertical) {
      deltaMove.set(0, scrollY * wheelPrecision, 0);
    } else if (self.horizontal) {
      deltaMove.set(scrollY * wheelPrecision, 0, 0);
    }
    self._mouseWheelEventElapsedTime = 0;
    self._deltaAmount.add(deltaMove);
    if (!self._stopMouseWheel) {
      self._handlePressLogic();
      self.schedule(self._checkMouseWheel, 1.0 / 60, NaN, 0);
      self._stopMouseWheel = true;
    }
  };
  return _createClass(ScrollView, [{
    key: "content",
    get: function get() {
      return this._content;
    },
    set: function set(value) {
      if (this._content === value) {
        return;
      }
      var viewTrans = value && value.parent && value.parent._getUITransformComp();
      if (value && (!value || !viewTrans)) {
        logID(4302);
        return;
      }
      this._content = value;
      this._calculateBoundary();
    }
  }, {
    key: "horizontalScrollBar",
    get: function get() {
      var horizontalScrollBar = this._horizontalScrollBar;
      if (horizontalScrollBar && !horizontalScrollBar.isValid) {
        errorID(4303, 'horizontal', this.node.name);
      }
      return horizontalScrollBar;
    },
    set: function set(value) {
      if (this._horizontalScrollBar === value) {
        return;
      }
      this._horizontalScrollBar = value;
      if (this._horizontalScrollBar) {
        this._horizontalScrollBar.setScrollView(this);
        this._updateScrollBar(Vec2.ZERO);
      }
    }
  }, {
    key: "verticalScrollBar",
    get: function get() {
      var verticalScrollBar = this._verticalScrollBar;
      if (verticalScrollBar && !verticalScrollBar.isValid) {
        errorID(4303, 'vertical', this.node.name);
      }
      return verticalScrollBar;
    },
    set: function set(value) {
      if (this._verticalScrollBar === value) {
        return;
      }
      this._verticalScrollBar = value;
      if (this._verticalScrollBar) {
        this._verticalScrollBar.setScrollView(this);
        this._updateScrollBar(Vec2.ZERO);
      }
    }
  }, {
    key: "view",
    get: function get() {
      var parent = this._content && this._content.parent;
      if (!parent) {
        return null;
      }
      return parent._getUITransformComp();
    }
  }]);
}(ViewGroup), _ScrollView.EventType = ScrollViewEventType, _ScrollView), _initializer$9 = applyDecoratedInitializer(_class2$9.prototype, "bounceDuration", [serializable], function () {
  return 1;
}), _initializer2$8 = applyDecoratedInitializer(_class2$9.prototype, "brake", [serializable], function () {
  return 0.5;
}), _initializer3$6 = applyDecoratedInitializer(_class2$9.prototype, "elastic", [serializable], function () {
  return true;
}), _initializer4$5 = applyDecoratedInitializer(_class2$9.prototype, "inertia", [serializable], function () {
  return true;
}), _applyDecoratedDescriptor(_class2$9.prototype, "content", [_dec4$6], Object.getOwnPropertyDescriptor(_class2$9.prototype, "content"), _class2$9.prototype), _initializer5$3 = applyDecoratedInitializer(_class2$9.prototype, "horizontal", [serializable], function () {
  return true;
}), _applyDecoratedDescriptor(_class2$9.prototype, "horizontalScrollBar", [_dec5$6], Object.getOwnPropertyDescriptor(_class2$9.prototype, "horizontalScrollBar"), _class2$9.prototype), _initializer6$2 = applyDecoratedInitializer(_class2$9.prototype, "vertical", [serializable], function () {
  return true;
}), _applyDecoratedDescriptor(_class2$9.prototype, "verticalScrollBar", [_dec6$2], Object.getOwnPropertyDescriptor(_class2$9.prototype, "verticalScrollBar"), _class2$9.prototype), _initializer7$2 = applyDecoratedInitializer(_class2$9.prototype, "cancelInnerEvents", [serializable], function () {
  return true;
}), _initializer8$2 = applyDecoratedInitializer(_class2$9.prototype, "scrollEvents", [_dec7$1, serializable], function () {
  return [];
}), _initializer9$2 = applyDecoratedInitializer(_class2$9.prototype, "_content", [serializable], function () {
  return null;
}), _initializer0$2 = applyDecoratedInitializer(_class2$9.prototype, "_horizontalScrollBar", [serializable], function () {
  return null;
}), _initializer1$2 = applyDecoratedInitializer(_class2$9.prototype, "_verticalScrollBar", [serializable], function () {
  return null;
}), _class2$9)) || _class$a) || _class$a) || _class$a);
legacyCC.ScrollView = ScrollView;

var _dec$9, _dec2$8, _dec3$8, _dec4$5, _dec5$5, _dec6$1, _class$9, _class2$8, _initializer$8, _initializer2$7, _initializer3$5, _initializer4$4, _Slider;
var _tempPos$1 = new Vec3();
var Direction$1;
(function (Direction) {
  Direction[Direction["Horizontal"] = 0] = "Horizontal";
  Direction[Direction["Vertical"] = 1] = "Vertical";
})(Direction$1 || (Direction$1 = {}));
ccenum(Direction$1);
var Slider = (_dec$9 = ccclass('cc.Slider'), _dec2$8 = executionOrder(110), _dec3$8 = requireComponent(UITransform), _dec4$5 = type(Sprite), _dec5$5 = type(Direction$1), _dec6$1 = type([EventHandler]), _dec$9(_class$9 = _dec2$8(_class$9 = _dec3$8(_class$9 = (_class2$8 = (_Slider = function (_Component) {
  function Slider() {
    var _this;
    _this = _Component.call(this) || this;
    _this.slideEvents = _initializer$8 && _initializer$8();
    _this._handle = _initializer2$7 && _initializer2$7();
    _this._direction = _initializer3$5 && _initializer3$5();
    _this._progress = _initializer4$4 && _initializer4$4();
    _this._offset = new Vec3();
    _this._dragging = false;
    _this._touchHandle = false;
    _this._handleLocalPos = new Vec3();
    _this._touchPos = new Vec3();
    return _this;
  }
  _inheritsLoose(Slider, _Component);
  var _proto = Slider.prototype;
  _proto.__preload = function __preload() {
    this._updateHandlePosition();
  };
  _proto.onEnable = function onEnable() {
    var self = this;
    var node = self.node;
    var handle = self._handle;
    self._updateHandlePosition();
    node.on(NodeEventType.TOUCH_START, self._onTouchBegan, self);
    node.on(NodeEventType.TOUCH_MOVE, self._onTouchMoved, self);
    node.on(NodeEventType.TOUCH_END, self._onTouchEnded, self);
    node.on(NodeEventType.TOUCH_CANCEL, self._onTouchCancelled, self);
    {
      node.on(XrUIPressEventType.XRUI_HOVER_STAY, self._xrHoverStay, self);
      node.on(XrUIPressEventType.XRUI_CLICK, self._xrClick, self);
      node.on(XrUIPressEventType.XRUI_UNCLICK, self._xrUnClick, self);
    }
    if (handle && handle.isValid) {
      var handleNode = handle.node;
      handleNode.on(NodeEventType.TOUCH_START, self._onHandleDragStart, self);
      handleNode.on(NodeEventType.TOUCH_MOVE, self._onTouchMoved, self);
      handleNode.on(NodeEventType.TOUCH_END, self._onTouchEnded, self);
    }
  };
  _proto.onDisable = function onDisable() {
    var self = this;
    var node = self.node;
    var handle = self._handle;
    node.off(NodeEventType.TOUCH_START, self._onTouchBegan, self);
    node.off(NodeEventType.TOUCH_MOVE, self._onTouchMoved, self);
    node.off(NodeEventType.TOUCH_END, self._onTouchEnded, self);
    node.off(NodeEventType.TOUCH_CANCEL, self._onTouchCancelled, self);
    {
      node.off(XrUIPressEventType.XRUI_HOVER_STAY, self._xrHoverStay, self);
      node.off(XrUIPressEventType.XRUI_CLICK, self._xrClick, self);
      node.off(XrUIPressEventType.XRUI_UNCLICK, self._xrUnClick, self);
    }
    if (handle && handle.isValid) {
      var handleNode = handle.node;
      handleNode.off(NodeEventType.TOUCH_START, self._onHandleDragStart, self);
      handleNode.off(NodeEventType.TOUCH_MOVE, self._onTouchMoved, self);
      handleNode.off(NodeEventType.TOUCH_END, self._onTouchEnded, self);
    }
  };
  _proto._onHandleDragStart = function _onHandleDragStart(event) {
    if (!event || !this._handle || !this._handle.node._getUITransformComp()) {
      return;
    }
    this._dragging = true;
    this._touchHandle = true;
    var touhPos = event.touch.getUILocation();
    Vec3.set(this._touchPos, touhPos.x, touhPos.y, 0);
    this._handle.node._getUITransformComp().convertToNodeSpaceAR(this._touchPos, this._offset);
    event.propagationStopped = true;
  };
  _proto._onTouchBegan = function _onTouchBegan(event) {
    if (!this._handle || !event) {
      return;
    }
    this._dragging = true;
    if (!this._touchHandle) {
      this._handleSliderLogic(event.touch);
    }
    event.propagationStopped = true;
  };
  _proto._onTouchMoved = function _onTouchMoved(event) {
    if (!this._dragging || !event) {
      return;
    }
    this._handleSliderLogic(event.touch);
    event.propagationStopped = true;
  };
  _proto._onTouchEnded = function _onTouchEnded(event) {
    this._dragging = false;
    this._touchHandle = false;
    this._offset = new Vec3();
    if (event) {
      event.propagationStopped = true;
    }
  };
  _proto._onTouchCancelled = function _onTouchCancelled(event) {
    this._dragging = false;
    if (event) {
      event.propagationStopped = true;
    }
  };
  _proto._handleSliderLogic = function _handleSliderLogic(touch) {
    this._updateProgress(touch);
    this._emitSlideEvent();
  };
  _proto._emitSlideEvent = function _emitSlideEvent() {
    EventHandler.emitEvents(this.slideEvents, this);
    this.node.emit('slide', this);
  };
  _proto._updateProgress = function _updateProgress(touch) {
    if (!this._handle || !touch) {
      return;
    }
    var touchPos = touch.getUILocation();
    Vec3.set(this._touchPos, touchPos.x, touchPos.y, 0);
    var uiTrans = this.node._getUITransformComp();
    var localTouchPos = uiTrans.convertToNodeSpaceAR(this._touchPos, _tempPos$1);
    if (this.direction === Direction$1.Horizontal) {
      this.progress = clamp01(0.5 + (localTouchPos.x - this._offset.x) / uiTrans.width);
    } else {
      this.progress = clamp01(0.5 + (localTouchPos.y - this._offset.y) / uiTrans.height);
    }
  };
  _proto._updateHandlePosition = function _updateHandlePosition() {
    if (!this._handle) {
      return;
    }
    this._handleLocalPos.set(this._handle.node.position);
    var uiTrans = this.node._getUITransformComp();
    if (this._direction === Direction$1.Horizontal) {
      this._handleLocalPos.x = -uiTrans.width * uiTrans.anchorX + this.progress * uiTrans.width;
    } else {
      this._handleLocalPos.y = -uiTrans.height * uiTrans.anchorY + this.progress * uiTrans.height;
    }
    this._handle.node.setPosition(this._handleLocalPos);
  };
  _proto._changeLayout = function _changeLayout() {
    var uiTrans = this.node._getUITransformComp();
    var contentSize = uiTrans.contentSize;
    uiTrans.setContentSize(contentSize.height, contentSize.width);
    if (this._handle) {
      var pos = this._handle.node.position;
      if (this._direction === Direction$1.Horizontal) {
        this._handle.node.setPosition(pos.x, 0, pos.z);
      } else {
        this._handle.node.setPosition(0, pos.y, pos.z);
      }
      this._updateHandlePosition();
    }
  };
  _proto._xrHandleProgress = function _xrHandleProgress(point) {
    if (!this._touchHandle) {
      var uiTrans = this.node._getUITransformComp();
      uiTrans.convertToNodeSpaceAR(point, _tempPos$1);
      if (this.direction === Direction$1.Horizontal) {
        this.progress = clamp01(0.5 + (_tempPos$1.x - this.node.position.x) / uiTrans.width);
      } else {
        this.progress = clamp01(0.5 + (_tempPos$1.y - this.node.position.y) / uiTrans.height);
      }
    }
  };
  _proto._xrClick = function _xrClick(event) {
    if (!this._handle) {
      return;
    }
    this._dragging = true;
    this._xrHandleProgress(event.hitPoint);
    this._emitSlideEvent();
  };
  _proto._xrUnClick = function _xrUnClick() {
    this._dragging = false;
    this._touchHandle = false;
  };
  _proto._xrHoverStay = function _xrHoverStay(event) {
    if (!this._dragging) {
      return;
    }
    this._xrHandleProgress(event.hitPoint);
    this._emitSlideEvent();
  };
  return _createClass(Slider, [{
    key: "handle",
    get: function get() {
      return this._handle;
    },
    set: function set(value) {
      if (this._handle === value) {
        return;
      }
      this._handle = value;
    }
  }, {
    key: "direction",
    get: function get() {
      return this._direction;
    },
    set: function set(value) {
      if (this._direction === value) {
        return;
      }
      this._direction = value;
      this._changeLayout();
    }
  }, {
    key: "progress",
    get: function get() {
      return this._progress;
    },
    set: function set(value) {
      if (this._progress === value) {
        return;
      }
      this._progress = value;
      this._updateHandlePosition();
    }
  }]);
}(Component), _Slider.Direction = Direction$1, _Slider), _applyDecoratedDescriptor(_class2$8.prototype, "handle", [_dec4$5], Object.getOwnPropertyDescriptor(_class2$8.prototype, "handle"), _class2$8.prototype), _applyDecoratedDescriptor(_class2$8.prototype, "direction", [_dec5$5], Object.getOwnPropertyDescriptor(_class2$8.prototype, "direction"), _class2$8.prototype), _initializer$8 = applyDecoratedInitializer(_class2$8.prototype, "slideEvents", [_dec6$1, serializable], function () {
  return [];
}), _initializer2$7 = applyDecoratedInitializer(_class2$8.prototype, "_handle", [serializable], function () {
  return null;
}), _initializer3$5 = applyDecoratedInitializer(_class2$8.prototype, "_direction", [serializable], function () {
  return Direction$1.Horizontal;
}), _initializer4$4 = applyDecoratedInitializer(_class2$8.prototype, "_progress", [serializable], function () {
  return 0.1;
}), _class2$8)) || _class$9) || _class$9) || _class$9);
legacyCC.Slider = Slider;

function extendsEnum() {
  for (var _len = arguments.length, enums = new Array(_len), _key = 0; _key < _len; _key++) {
    enums[_key] = arguments[_key];
  }
  {
    var kvs = [];
    for (var _iterator = _createForOfIteratorHelperLoose(enums), _step; !(_step = _iterator()).done;) {
      var e = _step.value;
      for (var _i = 0, _Object$keys = Object.keys(e); _i < _Object$keys.length; _i++) {
        var kv = _Object$keys[_i];
        if (kvs.indexOf(kv) >= 0) {
          errorID(3659);
        } else {
          kvs.push(kv);
        }
      }
    }
  }
  return Object.assign.apply(Object, [{}].concat(enums));
}

var _dec$8, _dec2$7, _dec3$7, _dec4$4, _dec5$4, _class$8, _class2$7, _initializer$7, _initializer2$6, _initializer3$4, _Toggle;
var ToggleEventType;
(function (ToggleEventType) {
  ToggleEventType["TOGGLE"] = "toggle";
})(ToggleEventType || (ToggleEventType = {}));
var Toggle = (_dec$8 = ccclass('cc.Toggle'), _dec2$7 = executionOrder(110), _dec3$7 = requireComponent(UITransform), _dec4$4 = type(Sprite), _dec5$4 = type([EventHandler]), _dec$8(_class$8 = _dec2$7(_class$8 = _dec3$7(_class$8 = (_class2$7 = (_Toggle = function (_Button) {
  function Toggle() {
    var _this;
    _this = _Button.call(this) || this;
    _this.checkEvents = _initializer$7 && _initializer$7();
    _this._isChecked = _initializer2$6 && _initializer2$6();
    _this._checkMark = _initializer3$4 && _initializer3$4();
    return _this;
  }
  _inheritsLoose(Toggle, _Button);
  var _proto = Toggle.prototype;
  _proto._internalToggle = function _internalToggle() {
    this.isChecked = !this.isChecked;
  };
  _proto._set = function _set(value, emitEvent) {
    if (emitEvent === void 0) {
      emitEvent = true;
    }
    if (this._isChecked == value) return;
    this._isChecked = value;
    var group = this._toggleContainer;
    if (group && group.enabled && this.enabled) {
      if (value || !group.anyTogglesChecked() && !group.allowSwitchOff) {
        this._isChecked = true;
        group.notifyToggleCheck(this, emitEvent);
      }
    }
    this.playEffect();
    if (emitEvent) {
      this._emitToggleEvents();
    }
  };
  _proto.playEffect = function playEffect() {
    if (this._checkMark) {
      this._checkMark.node.active = this._isChecked;
    }
  };
  _proto.setIsCheckedWithoutNotify = function setIsCheckedWithoutNotify(value) {
    this._set(value, false);
  };
  _proto.onEnable = function onEnable() {
    _Button.prototype.onEnable.call(this);
    this.playEffect();
    {
      this.node.on(Toggle.EventType.CLICK, this._internalToggle, this);
    }
  };
  _proto.onDisable = function onDisable() {
    _Button.prototype.onDisable.call(this);
    {
      this.node.off(Toggle.EventType.CLICK, this._internalToggle, this);
    }
  };
  _proto._emitToggleEvents = function _emitToggleEvents() {
    this.node.emit(Toggle.EventType.TOGGLE, this);
    if (this.checkEvents) {
      EventHandler.emitEvents(this.checkEvents, this);
    }
  };
  return _createClass(Toggle, [{
    key: "isChecked",
    get: function get() {
      return this._isChecked;
    },
    set: function set(value) {
      this._set(value);
    }
  }, {
    key: "checkMark",
    get: function get() {
      return this._checkMark;
    },
    set: function set(value) {
      if (this._checkMark === value) {
        return;
      }
      this._checkMark = value;
    }
  }, {
    key: "_resizeToTarget",
    set: function set(value) {
      if (value) {
        this._resizeNodeToTargetNode();
      }
    }
  }, {
    key: "_toggleContainer",
    get: function get() {
      var parent = this.node.parent;
      if (legacyCC.Node.isNode(parent)) {
        return parent.getComponent('cc.ToggleContainer');
      }
      return null;
    }
  }]);
}(Button), _Toggle.EventType = extendsEnum(ToggleEventType, ButtonEventType), _Toggle), _applyDecoratedDescriptor(_class2$7.prototype, "checkMark", [_dec4$4], Object.getOwnPropertyDescriptor(_class2$7.prototype, "checkMark"), _class2$7.prototype), _initializer$7 = applyDecoratedInitializer(_class2$7.prototype, "checkEvents", [_dec5$4, serializable], function () {
  return [];
}), _initializer2$6 = applyDecoratedInitializer(_class2$7.prototype, "_isChecked", [serializable], function () {
  return true;
}), _initializer3$4 = applyDecoratedInitializer(_class2$7.prototype, "_checkMark", [serializable], function () {
  return null;
}), _class2$7)) || _class$8) || _class$8) || _class$8);
legacyCC.Toggle = Toggle;

var _dec$7, _dec2$6, _dec3$6, _class$7, _class2$6, _initializer$6, _initializer2$5;
var ToggleContainer = (_dec$7 = ccclass('cc.ToggleContainer'), _dec2$6 = executionOrder(110), _dec3$6 = type([EventHandler]), _dec$7(_class$7 = _dec2$6(_class$7 = (_class2$6 = function (_Component) {
  function ToggleContainer() {
    var _this;
    _this = _Component.call(this) || this;
    _this._allowSwitchOff = _initializer$6 && _initializer$6();
    _this.checkEvents = _initializer2$5 && _initializer2$5();
    return _this;
  }
  _inheritsLoose(ToggleContainer, _Component);
  var _proto = ToggleContainer.prototype;
  _proto.onEnable = function onEnable() {
    this.ensureValidState();
    this.node.on(NodeEventType.CHILD_ADDED, this.ensureValidState, this);
    this.node.on(NodeEventType.CHILD_REMOVED, this.ensureValidState, this);
  };
  _proto.onDisable = function onDisable() {
    this.node.off(NodeEventType.CHILD_ADDED, this.ensureValidState, this);
    this.node.off(NodeEventType.CHILD_REMOVED, this.ensureValidState, this);
  };
  _proto.activeToggles = function activeToggles() {
    return this.toggleItems.filter(function (x) {
      return x.isChecked;
    });
  };
  _proto.anyTogglesChecked = function anyTogglesChecked() {
    return !!this.toggleItems.find(function (x) {
      return x.isChecked;
    });
  };
  _proto.notifyToggleCheck = function notifyToggleCheck(toggle, emitEvent) {
    if (emitEvent === void 0) {
      emitEvent = true;
    }
    if (!this.enabledInHierarchy) {
      return;
    }
    for (var i = 0; i < this.toggleItems.length; i++) {
      var item = this.toggleItems[i];
      if (item === toggle) {
        continue;
      }
      if (emitEvent) {
        item.isChecked = false;
      } else {
        item.setIsCheckedWithoutNotify(false);
      }
    }
    if (this.checkEvents) {
      legacyCC.Component.EventHandler.emitEvents(this.checkEvents, toggle);
    }
  };
  _proto.ensureValidState = function ensureValidState() {
    var toggles = this.toggleItems;
    if (!this._allowSwitchOff && !this.anyTogglesChecked() && toggles.length !== 0) {
      var toggle = toggles[0];
      toggle.isChecked = true;
      this.notifyToggleCheck(toggle);
    }
    var activeToggles = this.activeToggles();
    if (activeToggles.length > 1) {
      var firstToggle = activeToggles[0];
      for (var i = 0; i < activeToggles.length; ++i) {
        var _toggle = activeToggles[i];
        if (_toggle === firstToggle) {
          continue;
        }
        _toggle.isChecked = false;
      }
    }
  };
  return _createClass(ToggleContainer, [{
    key: "allowSwitchOff",
    get: function get() {
      return this._allowSwitchOff;
    },
    set: function set(value) {
      this._allowSwitchOff = value;
    }
  }, {
    key: "toggleItems",
    get: function get() {
      return this.node.children.map(function (item) {
        var toggle = item.getComponent('cc.Toggle');
        if (toggle && toggle.enabled) {
          return toggle;
        }
        return null;
      }).filter(Boolean);
    }
  }]);
}(Component), _initializer$6 = applyDecoratedInitializer(_class2$6.prototype, "_allowSwitchOff", [serializable], function () {
  return false;
}), _initializer2$5 = applyDecoratedInitializer(_class2$6.prototype, "checkEvents", [_dec3$6, serializable], function () {
  return [];
}), _class2$6)) || _class$7) || _class$7);
legacyCC.ToggleContainer = ToggleContainer;

var _dec$6, _dec2$5, _dec3$5, _dec4$3, _dec5$3, _class$6, _class2$5, _initializer$5, _initializer2$4, _initializer3$3, _initializer4$3, _initializer5$2, _initializer6$1, _initializer7$1, _initializer8$1, _initializer9$1, _initializer0$1, _initializer1$1, _initializer10$1, _initializer11, _initializer12, _initializer13, _initializer14, _initializer15, _initializer16, _Widget;
var _tempScale = new Vec2();
function getReadonlyNodeSize(parent) {
  var parentUITransform = parent._getUITransformComp();
  if (parent instanceof Scene) {
    return visibleRect;
  } else if (parentUITransform) {
    return parentUITransform.contentSize;
  } else {
    return Size.ZERO;
  }
}
function computeInverseTransForTarget(widgetNode, target, out_inverseTranslate, out_inverseScale) {
  if (widgetNode.parent) {
    _tempScale.set(widgetNode.parent.scale.x, widgetNode.parent.scale.y);
  } else {
    _tempScale.set(0, 0);
  }
  var scaleX = _tempScale.x;
  var scaleY = _tempScale.y;
  var translateX = 0;
  var translateY = 0;
  for (var node = widgetNode.parent;;) {
    if (!node) {
      out_inverseTranslate.x = out_inverseTranslate.y = 0;
      out_inverseScale.x = out_inverseScale.y = 1;
      return;
    }
    var pos = node.position;
    translateX += pos.x;
    translateY += pos.y;
    node = node.parent;
    if (node !== target) {
      if (node) {
        _tempScale.set(node.scale.x, node.scale.y);
      } else {
        _tempScale.set(0, 0);
      }
      var sx = _tempScale.x;
      var sy = _tempScale.y;
      translateX *= sx;
      translateY *= sy;
      scaleX *= sx;
      scaleY *= sy;
    } else {
      break;
    }
  }
  out_inverseScale.x = scaleX !== 0 ? 1 / scaleX : 1;
  out_inverseScale.y = scaleY !== 0 ? 1 / scaleY : 1;
  out_inverseTranslate.x = -translateX;
  out_inverseTranslate.y = -translateY;
}
var AlignMode;
(function (AlignMode) {
  AlignMode[AlignMode["ONCE"] = 0] = "ONCE";
  AlignMode[AlignMode["ALWAYS"] = 1] = "ALWAYS";
  AlignMode[AlignMode["ON_WINDOW_RESIZE"] = 2] = "ON_WINDOW_RESIZE";
})(AlignMode || (AlignMode = {}));
ccenum(AlignMode);
var AlignFlags;
(function (AlignFlags) {
  AlignFlags[AlignFlags["TOP"] = 1] = "TOP";
  AlignFlags[AlignFlags["MID"] = 2] = "MID";
  AlignFlags[AlignFlags["BOT"] = 4] = "BOT";
  AlignFlags[AlignFlags["LEFT"] = 8] = "LEFT";
  AlignFlags[AlignFlags["CENTER"] = 16] = "CENTER";
  AlignFlags[AlignFlags["RIGHT"] = 32] = "RIGHT";
  AlignFlags[AlignFlags["HORIZONTAL"] = 56] = "HORIZONTAL";
  AlignFlags[AlignFlags["VERTICAL"] = 7] = "VERTICAL";
})(AlignFlags || (AlignFlags = {}));
var TOP_BOT = AlignFlags.TOP | AlignFlags.BOT;
var LEFT_RIGHT = AlignFlags.LEFT | AlignFlags.RIGHT;
var Widget = (_dec$6 = ccclass('cc.Widget'), _dec2$5 = executionOrder(110), _dec3$5 = requireComponent(UITransform), _dec4$3 = type(Node), _dec5$3 = type(AlignMode), _dec$6(_class$6 = _dec2$5(_class$6 = _dec3$5(_class$6 = (_class2$5 = (_Widget = function (_Component) {
  function Widget() {
    var _this;
    _this = _Component.call(this) || this;
    _this._lastPos = new Vec3();
    _this._lastSize = new Size();
    _this._dirty = true;
    _this._hadAlignOnce = false;
    _this._alignFlags = _initializer$5 && _initializer$5();
    _this._target = _initializer2$4 && _initializer2$4();
    _this._left = _initializer3$3 && _initializer3$3();
    _this._right = _initializer4$3 && _initializer4$3();
    _this._top = _initializer5$2 && _initializer5$2();
    _this._bottom = _initializer6$1 && _initializer6$1();
    _this._horizontalCenter = _initializer7$1 && _initializer7$1();
    _this._verticalCenter = _initializer8$1 && _initializer8$1();
    _this._isAbsLeft = _initializer9$1 && _initializer9$1();
    _this._isAbsRight = _initializer0$1 && _initializer0$1();
    _this._isAbsTop = _initializer1$1 && _initializer1$1();
    _this._isAbsBottom = _initializer10$1 && _initializer10$1();
    _this._isAbsHorizontalCenter = _initializer11 && _initializer11();
    _this._isAbsVerticalCenter = _initializer12 && _initializer12();
    _this._originalWidth = _initializer13 && _initializer13();
    _this._originalHeight = _initializer14 && _initializer14();
    _this._alignMode = _initializer15 && _initializer15();
    _this._lockFlags = _initializer16 && _initializer16();
    return _this;
  }
  _inheritsLoose(Widget, _Component);
  var _proto = Widget.prototype;
  _proto.updateAlignment = function updateAlignment() {
    cclegacy._widgetManager.updateAlignment(this.node);
  };
  _proto._validateTargetInDEV = function _validateTargetInDEV() {
    var target = this._target;
    if (target) {
      var isParent = this.node !== target && this.node.isChildOf(target);
      if (!isParent) {
        errorID(6500);
        this.target = null;
      }
    }
  };
  _proto.setDirty = function setDirty() {
    this._recursiveDirty();
  };
  _proto.onEnable = function onEnable() {
    this.node.getPosition(this._lastPos);
    this._lastSize.set(this.node._getUITransformComp().contentSize);
    cclegacy._widgetManager.add(this);
    this._hadAlignOnce = false;
    this._registerEvent();
    this._registerTargetEvents();
  };
  _proto.onDisable = function onDisable() {
    cclegacy._widgetManager.remove(this);
    this._unregisterEvent();
    this._unregisterTargetEvents();
  };
  _proto.onDestroy = function onDestroy() {
    this._removeParentEvent();
  };
  _proto._adjustWidgetToAllowMovingInEditor = function _adjustWidgetToAllowMovingInEditor(eventType) {};
  _proto._adjustWidgetToAllowResizingInEditor = function _adjustWidgetToAllowResizingInEditor() {};
  _proto._adjustWidgetToAnchorChanged = function _adjustWidgetToAnchorChanged() {
    this.setDirty();
  };
  _proto._adjustTargetToParentChanged = function _adjustTargetToParentChanged(oldParent) {
    if (oldParent) {
      this._unregisterOldParentEvents(oldParent);
    }
    if (this.node.getParent()) {
      this._registerTargetEvents();
    }
    this._setDirtyByMode();
  };
  _proto._registerEvent = function _registerEvent() {
    {
      this.node.on(NodeEventType.TRANSFORM_CHANGED, this._setDirtyByMode, this);
      this.node.on(NodeEventType.SIZE_CHANGED, this._setDirtyByMode, this);
    }
    this.node.on(NodeEventType.ANCHOR_CHANGED, this._adjustWidgetToAnchorChanged, this);
    this.node.on(NodeEventType.PARENT_CHANGED, this._adjustTargetToParentChanged, this);
  };
  _proto._unregisterEvent = function _unregisterEvent() {
    {
      this.node.off(NodeEventType.TRANSFORM_CHANGED, this._setDirtyByMode, this);
      this.node.off(NodeEventType.SIZE_CHANGED, this._setDirtyByMode, this);
    }
    this.node.off(NodeEventType.ANCHOR_CHANGED, this._adjustWidgetToAnchorChanged, this);
  };
  _proto._removeParentEvent = function _removeParentEvent() {
    this.node.off(NodeEventType.PARENT_CHANGED, this._adjustTargetToParentChanged, this);
  };
  _proto._autoChangedValue = function _autoChangedValue(flag, isAbs) {
    var current = (this._alignFlags & flag) > 0;
    if (!current) {
      return;
    }
    var parentUiProps = this.node.parent && this.node.parent._uiProps;
    var parentTrans = parentUiProps && parentUiProps.uiTransformComp;
    var size = parentTrans ? parentTrans.contentSize : visibleRect;
    if (this.isAlignLeft && flag === AlignFlags.LEFT) {
      this._left = isAbs ? this._left * size.width : this._left / size.width;
    } else if (this.isAlignRight && flag === AlignFlags.RIGHT) {
      this._right = isAbs ? this._right * size.width : this._right / size.width;
    } else if (this.isAlignHorizontalCenter && flag === AlignFlags.CENTER) {
      this._horizontalCenter = isAbs ? this._horizontalCenter * size.width : this._horizontalCenter / size.width;
    } else if (this.isAlignTop && flag === AlignFlags.TOP) {
      this._top = isAbs ? this._top * size.height : this._top / size.height;
    } else if (this.isAlignBottom && flag === AlignFlags.BOT) {
      this._bottom = isAbs ? this._bottom * size.height : this._bottom / size.height;
    } else if (this.isAbsoluteVerticalCenter && flag === AlignFlags.MID) {
      this._verticalCenter = isAbs ? this._verticalCenter / size.height : this._verticalCenter / size.height;
    }
    this._recursiveDirty();
  };
  _proto._registerTargetEvents = function _registerTargetEvents() {
    var target = this._target || this.node.parent;
    if (target) {
      if (target.getComponent(UITransform)) {
        target.on(NodeEventType.TRANSFORM_CHANGED, this._setDirtyByMode, this);
        target.on(NodeEventType.SIZE_CHANGED, this._setDirtyByMode, this);
        target.on(NodeEventType.ANCHOR_CHANGED, this._setDirtyByMode, this);
      }
    }
  };
  _proto._unregisterTargetEvents = function _unregisterTargetEvents() {
    var target = this._target || this.node.parent;
    if (target) {
      target.off(NodeEventType.TRANSFORM_CHANGED, this._setDirtyByMode, this);
      target.off(NodeEventType.SIZE_CHANGED, this._setDirtyByMode, this);
      target.off(NodeEventType.ANCHOR_CHANGED, this._setDirtyByMode, this);
    }
  };
  _proto._unregisterOldParentEvents = function _unregisterOldParentEvents(oldParent) {
    var target = this._target || oldParent;
    if (target) {
      target.off(NodeEventType.TRANSFORM_CHANGED, this._setDirtyByMode, this);
      target.off(NodeEventType.SIZE_CHANGED, this._setDirtyByMode, this);
      target.off(NodeEventType.ANCHOR_CHANGED, this._setDirtyByMode, this);
    }
  };
  _proto._setDirtyByMode = function _setDirtyByMode() {
    if (this.alignMode === AlignMode.ALWAYS || EDITOR_NOT_IN_PREVIEW) {
      this._recursiveDirty();
    }
  };
  _proto._setAlign = function _setAlign(flag, isAlign) {
    var current = (this._alignFlags & flag) > 0;
    if (isAlign === current) {
      return;
    }
    var isHorizontal = (flag & LEFT_RIGHT) > 0;
    var trans = this.node._getUITransformComp();
    if (isAlign) {
      this._alignFlags |= flag;
      if (isHorizontal) {
        this.isAlignHorizontalCenter = false;
        if (this.isStretchWidth) {
          this._originalWidth = trans.width;
        }
      } else {
        this.isAlignVerticalCenter = false;
        if (this.isStretchHeight) {
          this._originalHeight = trans.height;
        }
      }
    } else {
      if (isHorizontal) {
        if (this.isStretchWidth) {
          trans.width = this._originalWidth;
        }
      } else if (this.isStretchHeight) {
        trans.height = this._originalHeight;
      }
      this._alignFlags &= ~flag;
    }
  };
  _proto._recursiveDirty = function _recursiveDirty() {
    if (this._dirty) {
      return;
    }
    this._dirty = true;
  };
  return _createClass(Widget, [{
    key: "target",
    get: function get() {
      return this._target;
    },
    set: function set(value) {
      if (this._target === value) {
        return;
      }
      this._unregisterTargetEvents();
      this._target = value;
      this._registerTargetEvents();
      this._validateTargetInDEV();
      this._recursiveDirty();
    }
  }, {
    key: "isAlignTop",
    get: function get() {
      return (this._alignFlags & AlignFlags.TOP) > 0;
    },
    set: function set(value) {
      this._setAlign(AlignFlags.TOP, value);
      this._recursiveDirty();
    }
  }, {
    key: "isAlignBottom",
    get: function get() {
      return (this._alignFlags & AlignFlags.BOT) > 0;
    },
    set: function set(value) {
      this._setAlign(AlignFlags.BOT, value);
      this._recursiveDirty();
    }
  }, {
    key: "isAlignLeft",
    get: function get() {
      return (this._alignFlags & AlignFlags.LEFT) > 0;
    },
    set: function set(value) {
      this._setAlign(AlignFlags.LEFT, value);
      this._recursiveDirty();
    }
  }, {
    key: "isAlignRight",
    get: function get() {
      return (this._alignFlags & AlignFlags.RIGHT) > 0;
    },
    set: function set(value) {
      this._setAlign(AlignFlags.RIGHT, value);
      this._recursiveDirty();
    }
  }, {
    key: "isAlignVerticalCenter",
    get: function get() {
      return (this._alignFlags & AlignFlags.MID) > 0;
    },
    set: function set(value) {
      if (value) {
        this.isAlignTop = false;
        this.isAlignBottom = false;
        this._alignFlags |= AlignFlags.MID;
      } else {
        this._alignFlags &= ~AlignFlags.MID;
      }
      this._recursiveDirty();
    }
  }, {
    key: "isAlignHorizontalCenter",
    get: function get() {
      return (this._alignFlags & AlignFlags.CENTER) > 0;
    },
    set: function set(value) {
      if (value) {
        this.isAlignLeft = false;
        this.isAlignRight = false;
        this._alignFlags |= AlignFlags.CENTER;
      } else {
        this._alignFlags &= ~AlignFlags.CENTER;
      }
      this._recursiveDirty();
    }
  }, {
    key: "isStretchWidth",
    get: function get() {
      return (this._alignFlags & LEFT_RIGHT) === LEFT_RIGHT;
    }
  }, {
    key: "isStretchHeight",
    get: function get() {
      return (this._alignFlags & TOP_BOT) === TOP_BOT;
    }
  }, {
    key: "top",
    get: function get() {
      return this._top;
    },
    set: function set(value) {
      this._top = value;
      this._recursiveDirty();
    }
  }, {
    key: "editorTop",
    get: function get() {
      return this._isAbsTop ? this._top : this._top * 100;
    },
    set: function set(value) {
      this._top = this._isAbsTop ? value : value / 100;
      this._recursiveDirty();
    }
  }, {
    key: "bottom",
    get: function get() {
      return this._bottom;
    },
    set: function set(value) {
      this._bottom = value;
      this._recursiveDirty();
    }
  }, {
    key: "editorBottom",
    get: function get() {
      return this._isAbsBottom ? this._bottom : this._bottom * 100;
    },
    set: function set(value) {
      this._bottom = this._isAbsBottom ? value : value / 100;
      this._recursiveDirty();
    }
  }, {
    key: "left",
    get: function get() {
      return this._left;
    },
    set: function set(value) {
      this._left = value;
      this._recursiveDirty();
    }
  }, {
    key: "editorLeft",
    get: function get() {
      return this._isAbsLeft ? this._left : this._left * 100;
    },
    set: function set(value) {
      this._left = this._isAbsLeft ? value : value / 100;
      this._recursiveDirty();
    }
  }, {
    key: "right",
    get: function get() {
      return this._right;
    },
    set: function set(value) {
      this._right = value;
      this._recursiveDirty();
    }
  }, {
    key: "editorRight",
    get: function get() {
      return this._isAbsRight ? this._right : this._right * 100;
    },
    set: function set(value) {
      this._right = this._isAbsRight ? value : value / 100;
      this._recursiveDirty();
    }
  }, {
    key: "horizontalCenter",
    get: function get() {
      return this._horizontalCenter;
    },
    set: function set(value) {
      this._horizontalCenter = value;
      this._recursiveDirty();
    }
  }, {
    key: "editorHorizontalCenter",
    get: function get() {
      return this._isAbsHorizontalCenter ? this._horizontalCenter : this._horizontalCenter * 100;
    },
    set: function set(value) {
      this._horizontalCenter = this._isAbsHorizontalCenter ? value : value / 100;
      this._recursiveDirty();
    }
  }, {
    key: "verticalCenter",
    get: function get() {
      return this._verticalCenter;
    },
    set: function set(value) {
      this._verticalCenter = value;
      this._recursiveDirty();
    }
  }, {
    key: "editorVerticalCenter",
    get: function get() {
      return this._isAbsVerticalCenter ? this._verticalCenter : this._verticalCenter * 100;
    },
    set: function set(value) {
      this._verticalCenter = this._isAbsVerticalCenter ? value : value / 100;
      this._recursiveDirty();
    }
  }, {
    key: "isAbsoluteTop",
    get: function get() {
      return this._isAbsTop;
    },
    set: function set(value) {
      if (this._isAbsTop === value) {
        return;
      }
      this._isAbsTop = value;
      this._autoChangedValue(AlignFlags.TOP, this._isAbsTop);
    }
  }, {
    key: "isAbsoluteBottom",
    get: function get() {
      return this._isAbsBottom;
    },
    set: function set(value) {
      if (this._isAbsBottom === value) {
        return;
      }
      this._isAbsBottom = value;
      this._autoChangedValue(AlignFlags.BOT, this._isAbsBottom);
    }
  }, {
    key: "isAbsoluteLeft",
    get: function get() {
      return this._isAbsLeft;
    },
    set: function set(value) {
      if (this._isAbsLeft === value) {
        return;
      }
      this._isAbsLeft = value;
      this._autoChangedValue(AlignFlags.LEFT, this._isAbsLeft);
    }
  }, {
    key: "isAbsoluteRight",
    get: function get() {
      return this._isAbsRight;
    },
    set: function set(value) {
      if (this._isAbsRight === value) {
        return;
      }
      this._isAbsRight = value;
      this._autoChangedValue(AlignFlags.RIGHT, this._isAbsRight);
    }
  }, {
    key: "isAbsoluteHorizontalCenter",
    get: function get() {
      return this._isAbsHorizontalCenter;
    },
    set: function set(value) {
      if (this._isAbsHorizontalCenter === value) {
        return;
      }
      this._isAbsHorizontalCenter = value;
      this._autoChangedValue(AlignFlags.CENTER, this._isAbsHorizontalCenter);
    }
  }, {
    key: "isAbsoluteVerticalCenter",
    get: function get() {
      return this._isAbsVerticalCenter;
    },
    set: function set(value) {
      if (this._isAbsVerticalCenter === value) {
        return;
      }
      this._isAbsVerticalCenter = value;
      this._autoChangedValue(AlignFlags.MID, this._isAbsVerticalCenter);
    }
  }, {
    key: "alignMode",
    get: function get() {
      return this._alignMode;
    },
    set: function set(value) {
      this._alignMode = value;
      this._recursiveDirty();
    }
  }, {
    key: "alignFlags",
    get: function get() {
      return this._alignFlags;
    },
    set: function set(value) {
      if (this._alignFlags === value) {
        return;
      }
      this._alignFlags = value;
      this._recursiveDirty();
    }
  }]);
}(Component), _Widget.AlignMode = AlignMode, _Widget), _applyDecoratedDescriptor(_class2$5.prototype, "target", [_dec4$3], Object.getOwnPropertyDescriptor(_class2$5.prototype, "target"), _class2$5.prototype), _applyDecoratedDescriptor(_class2$5.prototype, "alignMode", [_dec5$3], Object.getOwnPropertyDescriptor(_class2$5.prototype, "alignMode"), _class2$5.prototype), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "_alignFlags", [serializable], function () {
  return 0;
}), _initializer2$4 = applyDecoratedInitializer(_class2$5.prototype, "_target", [serializable], function () {
  return null;
}), _initializer3$3 = applyDecoratedInitializer(_class2$5.prototype, "_left", [serializable], function () {
  return 0;
}), _initializer4$3 = applyDecoratedInitializer(_class2$5.prototype, "_right", [serializable], function () {
  return 0;
}), _initializer5$2 = applyDecoratedInitializer(_class2$5.prototype, "_top", [serializable], function () {
  return 0;
}), _initializer6$1 = applyDecoratedInitializer(_class2$5.prototype, "_bottom", [serializable], function () {
  return 0;
}), _initializer7$1 = applyDecoratedInitializer(_class2$5.prototype, "_horizontalCenter", [serializable], function () {
  return 0;
}), _initializer8$1 = applyDecoratedInitializer(_class2$5.prototype, "_verticalCenter", [serializable], function () {
  return 0;
}), _initializer9$1 = applyDecoratedInitializer(_class2$5.prototype, "_isAbsLeft", [serializable], function () {
  return true;
}), _initializer0$1 = applyDecoratedInitializer(_class2$5.prototype, "_isAbsRight", [serializable], function () {
  return true;
}), _initializer1$1 = applyDecoratedInitializer(_class2$5.prototype, "_isAbsTop", [serializable], function () {
  return true;
}), _initializer10$1 = applyDecoratedInitializer(_class2$5.prototype, "_isAbsBottom", [serializable], function () {
  return true;
}), _initializer11 = applyDecoratedInitializer(_class2$5.prototype, "_isAbsHorizontalCenter", [serializable], function () {
  return true;
}), _initializer12 = applyDecoratedInitializer(_class2$5.prototype, "_isAbsVerticalCenter", [serializable], function () {
  return true;
}), _initializer13 = applyDecoratedInitializer(_class2$5.prototype, "_originalWidth", [serializable], function () {
  return 0;
}), _initializer14 = applyDecoratedInitializer(_class2$5.prototype, "_originalHeight", [serializable], function () {
  return 0;
}), _initializer15 = applyDecoratedInitializer(_class2$5.prototype, "_alignMode", [serializable], function () {
  return AlignMode.ON_WINDOW_RESIZE;
}), _initializer16 = applyDecoratedInitializer(_class2$5.prototype, "_lockFlags", [serializable, editorOnly], function () {
  return 0;
}), _class2$5)) || _class$6) || _class$6) || _class$6);
cclegacy.internal.computeInverseTransForTarget = computeInverseTransForTarget;
cclegacy.internal.getReadonlyNodeSize = getReadonlyNodeSize;
cclegacy.Widget = Widget;

var _dec$5, _dec2$4, _dec3$4, _dec4$2, _dec5$2, _class$5, _class2$4, _initializer$4, _initializer2$3, _initializer3$2, _initializer4$2, _PageViewIndicator;
var _color = new Color();
var Direction;
(function (Direction) {
  Direction[Direction["HORIZONTAL"] = 0] = "HORIZONTAL";
  Direction[Direction["VERTICAL"] = 1] = "VERTICAL";
})(Direction || (Direction = {}));
ccenum(Direction);
var PageViewIndicator = (_dec$5 = ccclass('cc.PageViewIndicator'), _dec2$4 = executionOrder(110), _dec3$4 = type(SpriteFrame), _dec4$2 = type(Direction), _dec5$2 = type(Size), _dec$5(_class$5 = _dec2$4(_class$5 = (_class2$4 = (_PageViewIndicator = function (_Component) {
  function PageViewIndicator() {
    var _this;
    _this = _Component.call(this) || this;
    _this.spacing = _initializer$4 && _initializer$4();
    _this._spriteFrame = _initializer2$3 && _initializer2$3();
    _this._direction = _initializer3$2 && _initializer3$2();
    _this._cellSize = _initializer4$2 && _initializer4$2();
    _this._layout = null;
    _this._pageView = null;
    _this._indicators = [];
    return _this;
  }
  _inheritsLoose(PageViewIndicator, _Component);
  var _proto = PageViewIndicator.prototype;
  _proto.onLoad = function onLoad() {
    this._updateLayout();
  };
  _proto.setPageView = function setPageView(target) {
    this._pageView = target;
    this._refresh();
  };
  _proto._updateLayout = function _updateLayout() {
    this._layout = this.getComponent(Layout);
    if (!this._layout) {
      this._layout = this.addComponent(Layout);
    }
    var layout = this._layout;
    if (this.direction === Direction.HORIZONTAL) {
      layout.type = LayoutType.HORIZONTAL;
      layout.spacingX = this.spacing;
    } else if (this.direction === Direction.VERTICAL) {
      layout.type = LayoutType.VERTICAL;
      layout.spacingY = this.spacing;
    }
    layout.resizeMode = LayoutResizeMode.CONTAINER;
  };
  _proto._createIndicator = function _createIndicator() {
    var node = new Node();
    node.layer = this.node.layer;
    var sprite = node.addComponent(Sprite);
    sprite.spriteFrame = this.spriteFrame;
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    node.parent = this.node;
    node._getUITransformComp().setContentSize(this._cellSize);
    return node;
  };
  _proto._changedState = function _changedState() {
    var indicators = this._indicators;
    if (indicators.length === 0 || !this._pageView) {
      return;
    }
    var idx = this._pageView.curPageIdx;
    if (idx >= indicators.length) {
      return;
    }
    for (var i = 0; i < indicators.length; ++i) {
      var node = indicators[i];
      if (!node._uiProps.uiComp) {
        continue;
      }
      var uiComp = node._uiProps.uiComp;
      _color.set(uiComp.color);
      _color.a = 255 / 2;
      uiComp.color = _color;
    }
    if (indicators[idx]._uiProps.uiComp) {
      var comp = indicators[idx]._uiProps.uiComp;
      _color.set(comp.color);
      _color.a = 255;
      comp.color = _color;
    }
  };
  _proto._refresh = function _refresh() {
    if (!this._pageView) {
      return;
    }
    var indicators = this._indicators;
    var pages = this._pageView.getPages();
    if (pages.length === indicators.length) {
      return;
    }
    var i = 0;
    if (pages.length > indicators.length) {
      for (i = 0; i < pages.length; ++i) {
        if (!indicators[i]) {
          indicators[i] = this._createIndicator();
        }
      }
    } else {
      var count = indicators.length - pages.length;
      for (i = count; i > 0; --i) {
        var node = indicators[i - 1];
        this.node.removeChild(node);
        indicators.splice(i - 1, 1);
      }
    }
    if (this._layout && this._layout.enabledInHierarchy) {
      this._layout.updateLayout();
    }
    this._changedState();
  };
  return _createClass(PageViewIndicator, [{
    key: "spriteFrame",
    get: function get() {
      return this._spriteFrame;
    },
    set: function set(value) {
      if (this._spriteFrame === value) {
        return;
      }
      this._spriteFrame = value;
    }
  }, {
    key: "direction",
    get: function get() {
      return this._direction;
    },
    set: function set(value) {
      if (this._direction === value) {
        return;
      }
      this._direction = value;
    }
  }, {
    key: "cellSize",
    get: function get() {
      return this._cellSize;
    },
    set: function set(value) {
      if (this._cellSize === value) {
        return;
      }
      this._cellSize = value;
    }
  }]);
}(Component), _PageViewIndicator.Direction = Direction, _PageViewIndicator), _applyDecoratedDescriptor(_class2$4.prototype, "spriteFrame", [_dec3$4], Object.getOwnPropertyDescriptor(_class2$4.prototype, "spriteFrame"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "direction", [_dec4$2], Object.getOwnPropertyDescriptor(_class2$4.prototype, "direction"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "cellSize", [_dec5$2], Object.getOwnPropertyDescriptor(_class2$4.prototype, "cellSize"), _class2$4.prototype), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "spacing", [serializable], function () {
  return 0;
}), _initializer2$3 = applyDecoratedInitializer(_class2$4.prototype, "_spriteFrame", [serializable], function () {
  return null;
}), _initializer3$2 = applyDecoratedInitializer(_class2$4.prototype, "_direction", [serializable], function () {
  return Direction.HORIZONTAL;
}), _initializer4$2 = applyDecoratedInitializer(_class2$4.prototype, "_cellSize", [serializable], function () {
  return new Size(20, 20);
}), _class2$4)) || _class$5) || _class$5);
legacyCC.PageViewIndicator = PageViewIndicator;

var _dec$4, _dec2$3, _dec3$3, _dec4$1, _dec5$1, _dec6, _dec7, _dec8, _dec9, _class$4, _class2$3, _initializer$3, _initializer2$2, _initializer3$1, _initializer4$1, _initializer5$1, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _PageView;
var _tempVec2 = new Vec2();
var SizeMode;
(function (SizeMode) {
  SizeMode[SizeMode["Unified"] = 0] = "Unified";
  SizeMode[SizeMode["Free"] = 1] = "Free";
})(SizeMode || (SizeMode = {}));
ccenum(SizeMode);
var PageViewDirection;
(function (PageViewDirection) {
  PageViewDirection[PageViewDirection["HORIZONTAL"] = 0] = "HORIZONTAL";
  PageViewDirection[PageViewDirection["VERTICAL"] = 1] = "VERTICAL";
})(PageViewDirection || (PageViewDirection = {}));
ccenum(PageViewDirection);
var PageViewEventType;
(function (PageViewEventType) {
  PageViewEventType["PAGE_TURNING"] = "page-turning";
})(PageViewEventType || (PageViewEventType = {}));
var PageView = (_dec$4 = ccclass('cc.PageView'), _dec2$3 = executionOrder(110), _dec3$3 = type(SizeMode), _dec4$1 = type(PageViewDirection), _dec5$1 = type(PageViewIndicator), _dec6 = type(ScrollBar), _dec7 = type(ScrollBar), _dec8 = type([EventHandler]), _dec9 = type([EventHandler]), _dec$4(_class$4 = _dec2$3(_class$4 = (_class2$3 = (_PageView = function (_ScrollView) {
  function PageView() {
    var _this;
    _this = _ScrollView.call(this) || this;
    _this.autoPageTurningThreshold = _initializer$3 && _initializer$3();
    _this.horizontal = _initializer2$2 && _initializer2$2();
    _this.vertical = _initializer3$1 && _initializer3$1();
    _this.cancelInnerEvents = _initializer4$1 && _initializer4$1();
    _this.scrollEvents = _initializer5$1 && _initializer5$1();
    _this.pageTurningSpeed = _initializer6 && _initializer6();
    _this.pageEvents = _initializer7 && _initializer7();
    _this._sizeMode = _initializer8 && _initializer8();
    _this._direction = _initializer9 && _initializer9();
    _this._scrollThreshold = _initializer0 && _initializer0();
    _this._pageTurningEventTiming = _initializer1 && _initializer1();
    _this._indicator = _initializer10 && _initializer10();
    _this._curPageIdx = 0;
    _this._lastPageIdx = 0;
    _this._pages = [];
    _this._initContentPos = v3();
    _this._scrollCenterOffsetX = [];
    _this._scrollCenterOffsetY = [];
    _this._touchBeganPosition = v2();
    _this._touchEndPosition = v2();
    return _this;
  }
  _inheritsLoose(PageView, _ScrollView);
  var _proto = PageView.prototype;
  _proto.onEnable = function onEnable() {
    _ScrollView.prototype.onEnable.call(this);
    this.node.on(NodeEventType.SIZE_CHANGED, this._updateAllPagesSize, this);
    {
      this.node.on(PageView.EventType.SCROLL_ENG_WITH_THRESHOLD, this._dispatchPageTurningEvent, this);
    }
  };
  _proto.onDisable = function onDisable() {
    _ScrollView.prototype.onDisable.call(this);
    this.node.off(NodeEventType.SIZE_CHANGED, this._updateAllPagesSize, this);
    {
      this.node.off(PageView.EventType.SCROLL_ENG_WITH_THRESHOLD, this._dispatchPageTurningEvent, this);
    }
  };
  _proto.onLoad = function onLoad() {
    this._initPages();
    if (this.indicator) {
      this.indicator.setPageView(this);
    }
  };
  _proto.getCurrentPageIndex = function getCurrentPageIndex() {
    return this._curPageIdx;
  };
  _proto.setCurrentPageIndex = function setCurrentPageIndex(index) {
    this.scrollToPage(index, 1);
  };
  _proto.getPages = function getPages() {
    return this._pages;
  };
  _proto.addPage = function addPage(page) {
    if (!page || this._pages.indexOf(page) !== -1 || !this.content) {
      return;
    }
    if (!page._getUITransformComp()) {
      logID(4301);
      return;
    }
    this.content.addChild(page);
    this._pages.push(page);
    this._updatePageView();
  };
  _proto.insertPage = function insertPage(page, index) {
    if (index < 0 || !page || this._pages.indexOf(page) !== -1 || !this.content) {
      return;
    }
    var pageCount = this._pages.length;
    if (index >= pageCount) {
      this.addPage(page);
    } else {
      if (!page._getUITransformComp()) {
        logID(4301);
        return;
      }
      this._pages.splice(index, 0, page);
      this.content.insertChild(page, index);
      this._updatePageView();
    }
  };
  _proto.removePage = function removePage(page) {
    if (!page || !this.content) {
      return;
    }
    var index = this._pages.indexOf(page);
    if (index === -1) {
      warnID(4300, page.name);
      return;
    }
    this.removePageAtIndex(index);
  };
  _proto.removePageAtIndex = function removePageAtIndex(index) {
    var pageList = this._pages;
    if (index < 0 || index >= pageList.length) {
      return;
    }
    var page = pageList[index];
    if (!page || !this.content) {
      return;
    }
    this.content.removeChild(page);
    pageList.splice(index, 1);
    this._updatePageView();
  };
  _proto.removeAllPages = function removeAllPages() {
    if (!this.content) {
      return;
    }
    var locPages = this._pages;
    for (var i = 0, len = locPages.length; i < len; i++) {
      this.content.removeChild(locPages[i]);
    }
    this._pages.length = 0;
    this._updatePageView();
  };
  _proto.scrollToPage = function scrollToPage(idx, timeInSecond) {
    if (timeInSecond === void 0) {
      timeInSecond = 0.3;
    }
    if (idx < 0 || idx >= this._pages.length) {
      return;
    }
    this._curPageIdx = idx;
    this.scrollToOffset(this._moveOffsetValue(idx), timeInSecond, true);
    if (this.indicator) {
      this.indicator._changedState();
    }
  };
  _proto.getScrollEndedEventTiming = function getScrollEndedEventTiming() {
    return this.pageTurningEventTiming;
  };
  _proto._updatePageView = function _updatePageView() {
    if (!this.content) {
      return;
    }
    var layout = this.content.getComponent(Layout);
    if (layout && layout.enabled) {
      layout.updateLayout();
    }
    var pageCount = this._pages.length;
    if (this._curPageIdx >= pageCount) {
      this._curPageIdx = pageCount === 0 ? 0 : pageCount - 1;
      this._lastPageIdx = this._curPageIdx;
    }
    var contentPos = this._initContentPos;
    for (var i = 0; i < pageCount; ++i) {
      var page = this._pages[i];
      var pos = page.position;
      if (this.direction === PageViewDirection.HORIZONTAL) {
        this._scrollCenterOffsetX[i] = Math.abs(contentPos.x + pos.x);
      } else {
        this._scrollCenterOffsetY[i] = Math.abs(contentPos.y + pos.y);
      }
    }
    if (this.indicator) {
      this.indicator._refresh();
    }
  };
  _proto._updateAllPagesSize = function _updateAllPagesSize() {
    var viewTrans = this.view;
    if (!this.content || !viewTrans) {
      return;
    }
    if (this._sizeMode !== SizeMode.Unified) {
      return;
    }
    var locPages = this._pages;
    var selfSize = viewTrans.contentSize;
    for (var i = 0, len = locPages.length; i < len; i++) {
      locPages[i]._getUITransformComp().setContentSize(selfSize);
    }
  };
  _proto._handleReleaseLogic = function _handleReleaseLogic() {
    this._autoScrollToPage();
    if (this._scrolling) {
      this._scrolling = false;
      if (!this._autoScrolling) {
        this._dispatchEvent(PageView.EventType.SCROLL_ENDED);
      }
    }
  };
  _proto._onTouchBegan = function _onTouchBegan(event, captureListeners) {
    event.touch.getUILocation(_tempVec2);
    Vec2.set(this._touchBeganPosition, _tempVec2.x, _tempVec2.y);
    _ScrollView.prototype._onTouchBegan.call(this, event, captureListeners);
  };
  _proto._onTouchMoved = function _onTouchMoved(event, captureListeners) {
    _ScrollView.prototype._onTouchMoved.call(this, event, captureListeners);
  };
  _proto._onTouchEnded = function _onTouchEnded(event, captureListeners) {
    event.touch.getUILocation(_tempVec2);
    Vec2.set(this._touchEndPosition, _tempVec2.x, _tempVec2.y);
    _ScrollView.prototype._onTouchEnded.call(this, event, captureListeners);
  };
  _proto._onTouchCancelled = function _onTouchCancelled(event, captureListeners) {
    event.touch.getUILocation(_tempVec2);
    Vec2.set(this._touchEndPosition, _tempVec2.x, _tempVec2.y);
    _ScrollView.prototype._onTouchCancelled.call(this, event, captureListeners);
  };
  _proto._onMouseWheel = function _onMouseWheel() {};
  _proto._syncScrollDirection = function _syncScrollDirection() {
    this.horizontal = this.direction === PageViewDirection.HORIZONTAL;
    this.vertical = this.direction === PageViewDirection.VERTICAL;
  };
  _proto._syncSizeMode = function _syncSizeMode() {
    var viewTrans = this.view;
    if (!this.content || !viewTrans) {
      return;
    }
    var layout = this.content.getComponent(Layout);
    if (layout) {
      if (this._sizeMode === SizeMode.Free && this._pages.length > 0) {
        var firstPageTrans = this._pages[0]._getUITransformComp();
        var lastPageTrans = this._pages[this._pages.length - 1]._getUITransformComp();
        if (this.direction === PageViewDirection.HORIZONTAL) {
          layout.paddingLeft = (viewTrans.width - firstPageTrans.width) / 2;
          layout.paddingRight = (viewTrans.width - lastPageTrans.width) / 2;
        } else if (this.direction === PageViewDirection.VERTICAL) {
          layout.paddingTop = (viewTrans.height - firstPageTrans.height) / 2;
          layout.paddingBottom = (viewTrans.height - lastPageTrans.height) / 2;
        }
      }
      layout.updateLayout();
    }
  };
  _proto._initPages = function _initPages() {
    if (!this.content) {
      return;
    }
    this._initContentPos = this.content.position;
    var children = this.content.children;
    for (var i = 0; i < children.length; ++i) {
      var page = children[i];
      if (this._pages.indexOf(page) >= 0) {
        continue;
      }
      this._pages.push(page);
    }
    this._syncScrollDirection();
    this._syncSizeMode();
    this._updatePageView();
  };
  _proto._dispatchPageTurningEvent = function _dispatchPageTurningEvent() {
    if (this._lastPageIdx === this._curPageIdx) {
      return;
    }
    this._lastPageIdx = this._curPageIdx;
    EventHandler.emitEvents(this.pageEvents, this, PageViewEventType.PAGE_TURNING);
    this.node.emit(PageViewEventType.PAGE_TURNING, this);
  };
  _proto._isQuicklyScrollable = function _isQuicklyScrollable(touchMoveVelocity) {
    if (this.direction === PageViewDirection.HORIZONTAL) {
      if (Math.abs(touchMoveVelocity.x) > this.autoPageTurningThreshold) {
        return true;
      }
    } else if (this.direction === PageViewDirection.VERTICAL) {
      if (Math.abs(touchMoveVelocity.y) > this.autoPageTurningThreshold) {
        return true;
      }
    }
    return false;
  };
  _proto._moveOffsetValue = function _moveOffsetValue(idx) {
    var offset = new Vec2();
    if (this._sizeMode === SizeMode.Free) {
      if (this.direction === PageViewDirection.HORIZONTAL) {
        offset.x = this._scrollCenterOffsetX[idx];
      } else if (this.direction === PageViewDirection.VERTICAL) {
        offset.y = this._scrollCenterOffsetY[idx];
      }
    } else {
      var viewTrans = this.view;
      if (!viewTrans) {
        return offset;
      }
      if (this.direction === PageViewDirection.HORIZONTAL) {
        offset.x = idx * viewTrans.width;
      } else if (this.direction === PageViewDirection.VERTICAL) {
        offset.y = idx * viewTrans.height;
      }
    }
    return offset;
  };
  _proto._getDragDirection = function _getDragDirection(moveOffset) {
    if (this._direction === PageViewDirection.HORIZONTAL) {
      if (moveOffset.x === 0) {
        return 0;
      }
      return moveOffset.x > 0 ? 1 : -1;
    } else {
      if (moveOffset.y === 0) {
        return 0;
      }
      return moveOffset.y < 0 ? 1 : -1;
    }
  };
  _proto._isScrollable = function _isScrollable(offset, index, nextIndex) {
    if (this._sizeMode === SizeMode.Free) {
      var curPageCenter = 0;
      var nextPageCenter = 0;
      if (this.direction === PageViewDirection.HORIZONTAL) {
        curPageCenter = this._scrollCenterOffsetX[index];
        nextPageCenter = this._scrollCenterOffsetX[nextIndex];
        return Math.abs(offset.x) >= Math.abs(curPageCenter - nextPageCenter) * this.scrollThreshold;
      } else if (this.direction === PageViewDirection.VERTICAL) {
        curPageCenter = this._scrollCenterOffsetY[index];
        nextPageCenter = this._scrollCenterOffsetY[nextIndex];
        return Math.abs(offset.y) >= Math.abs(curPageCenter - nextPageCenter) * this.scrollThreshold;
      }
    } else {
      var viewTrans = this.view;
      if (!viewTrans) {
        return false;
      }
      if (this.direction === PageViewDirection.HORIZONTAL) {
        return Math.abs(offset.x) >= viewTrans.width * this.scrollThreshold;
      } else if (this.direction === PageViewDirection.VERTICAL) {
        return Math.abs(offset.y) >= viewTrans.height * this.scrollThreshold;
      }
    }
    return false;
  };
  _proto._autoScrollToPage = function _autoScrollToPage() {
    var bounceBackStarted = this._startBounceBackIfNeeded();
    if (bounceBackStarted) {
      var bounceBackAmount = this._getHowMuchOutOfBoundary();
      this._clampDelta(bounceBackAmount);
      if (bounceBackAmount.x > 0 || bounceBackAmount.y < 0) {
        this._curPageIdx = this._pages.length === 0 ? 0 : this._pages.length - 1;
      }
      if (bounceBackAmount.x < 0 || bounceBackAmount.y > 0) {
        this._curPageIdx = 0;
      }
      if (this.indicator) {
        this.indicator._changedState();
      }
    } else {
      var moveOffset = new Vec2();
      Vec2.subtract(moveOffset, this._touchBeganPosition, this._touchEndPosition);
      var index = this._curPageIdx;
      var nextIndex = index + this._getDragDirection(moveOffset);
      var timeInSecond = this.pageTurningSpeed * Math.abs(index - nextIndex);
      if (nextIndex < this._pages.length) {
        if (this._isScrollable(moveOffset, index, nextIndex)) {
          this.scrollToPage(nextIndex, timeInSecond);
          return;
        } else {
          var touchMoveVelocity = this._calculateTouchMoveVelocity();
          if (this._isQuicklyScrollable(touchMoveVelocity)) {
            this.scrollToPage(nextIndex, timeInSecond);
            return;
          }
        }
      }
      this.scrollToPage(index, timeInSecond);
    }
  };
  return _createClass(PageView, [{
    key: "sizeMode",
    get: function get() {
      return this._sizeMode;
    },
    set: function set(value) {
      if (this._sizeMode === value) {
        return;
      }
      this._sizeMode = value;
      this._syncSizeMode();
    }
  }, {
    key: "direction",
    get: function get() {
      return this._direction;
    },
    set: function set(value) {
      if (this._direction === value) {
        return;
      }
      this._direction = value;
      this._syncScrollDirection();
    }
  }, {
    key: "scrollThreshold",
    get: function get() {
      return this._scrollThreshold;
    },
    set: function set(value) {
      if (this._scrollThreshold === value) {
        return;
      }
      this._scrollThreshold = value;
    }
  }, {
    key: "pageTurningEventTiming",
    get: function get() {
      return this._pageTurningEventTiming;
    },
    set: function set(value) {
      if (this._pageTurningEventTiming === value) {
        return;
      }
      this._pageTurningEventTiming = value;
    }
  }, {
    key: "indicator",
    get: function get() {
      return this._indicator;
    },
    set: function set(value) {
      if (this._indicator === value) {
        return;
      }
      this._indicator = value;
      if (this.indicator) {
        this.indicator.setPageView(this);
      }
    }
  }, {
    key: "curPageIdx",
    get: function get() {
      return this._curPageIdx;
    }
  }, {
    key: "verticalScrollBar",
    get: function get() {
      return _ScrollView.prototype.verticalScrollBar;
    },
    set: function set(value) {
      this.verticalScrollBar = value;
    }
  }, {
    key: "horizontalScrollBar",
    get: function get() {
      return _ScrollView.prototype.horizontalScrollBar;
    },
    set: function set(value) {
      this.horizontalScrollBar = value;
    }
  }]);
}(ScrollView), _PageView.SizeMode = SizeMode, _PageView.Direction = PageViewDirection, _PageView.EventType = extendsEnum(PageViewEventType, ScrollViewEventType), _PageView), _applyDecoratedDescriptor(_class2$3.prototype, "sizeMode", [_dec3$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "sizeMode"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "direction", [_dec4$1], Object.getOwnPropertyDescriptor(_class2$3.prototype, "direction"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "indicator", [_dec5$1], Object.getOwnPropertyDescriptor(_class2$3.prototype, "indicator"), _class2$3.prototype), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "autoPageTurningThreshold", [serializable], function () {
  return 100;
}), _applyDecoratedDescriptor(_class2$3.prototype, "verticalScrollBar", [_dec6, override], Object.getOwnPropertyDescriptor(_class2$3.prototype, "verticalScrollBar"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "horizontalScrollBar", [_dec7, override], Object.getOwnPropertyDescriptor(_class2$3.prototype, "horizontalScrollBar"), _class2$3.prototype), _initializer2$2 = applyDecoratedInitializer(_class2$3.prototype, "horizontal", [override, serializable], function () {
  return true;
}), _initializer3$1 = applyDecoratedInitializer(_class2$3.prototype, "vertical", [override, serializable], function () {
  return true;
}), _initializer4$1 = applyDecoratedInitializer(_class2$3.prototype, "cancelInnerEvents", [override, serializable], function () {
  return true;
}), _initializer5$1 = applyDecoratedInitializer(_class2$3.prototype, "scrollEvents", [_dec8, serializable, override], function () {
  return [];
}), _initializer6 = applyDecoratedInitializer(_class2$3.prototype, "pageTurningSpeed", [serializable], function () {
  return 0.3;
}), _initializer7 = applyDecoratedInitializer(_class2$3.prototype, "pageEvents", [_dec9, serializable], function () {
  return [];
}), _initializer8 = applyDecoratedInitializer(_class2$3.prototype, "_sizeMode", [serializable], function () {
  return SizeMode.Unified;
}), _initializer9 = applyDecoratedInitializer(_class2$3.prototype, "_direction", [serializable], function () {
  return PageViewDirection.HORIZONTAL;
}), _initializer0 = applyDecoratedInitializer(_class2$3.prototype, "_scrollThreshold", [serializable], function () {
  return 0.5;
}), _initializer1 = applyDecoratedInitializer(_class2$3.prototype, "_pageTurningEventTiming", [serializable], function () {
  return 0.1;
}), _initializer10 = applyDecoratedInitializer(_class2$3.prototype, "_indicator", [serializable], function () {
  return null;
}), _class2$3)) || _class$4) || _class$4);
legacyCC.PageView = PageView;

var _tempPos = new Vec3();
var _defaultAnchor = new Vec2();
var tInverseTranslate = new Vec2();
var tInverseScale = new Vec2(1, 1);
var _tempVec2_1 = new Vec2();
var _tempVec2_2 = new Vec2();
function align(node, widget) {
  if (widget._hadAlignOnce) return;
  if (widget.alignMode === AlignMode.ONCE) {
    widget._hadAlignOnce = true;
  }
  var hasTarget = widget.target;
  var target;
  var inverseTranslate = tInverseTranslate;
  var inverseScale = tInverseScale;
  if (hasTarget) {
    target = hasTarget;
    computeInverseTransForTarget(node, target, inverseTranslate, inverseScale);
  } else {
    target = node.parent;
  }
  var targetSize = getReadonlyNodeSize(target);
  var useGlobal = target instanceof Scene || !target.getComponent(UITransform);
  var targetAnchor = useGlobal ? _defaultAnchor : target.getComponent(UITransform).anchorPoint;
  var isRoot = useGlobal;
  node.getPosition(_tempPos);
  var uiTrans = node._getUITransformComp();
  var x = _tempPos.x;
  var y = _tempPos.y;
  var anchor = uiTrans.anchorPoint;
  var scale = node.scale;
  if (widget.alignFlags & AlignFlags.HORIZONTAL) {
    var localLeft = 0;
    var localRight = 0;
    var targetWidth = targetSize.width;
    if (isRoot) {
      localLeft = visibleRect.left.x;
      localRight = visibleRect.right.x;
    } else {
      localLeft = -targetAnchor.x * targetWidth;
      localRight = localLeft + targetWidth;
    }
    localLeft += widget.isAbsoluteLeft ? widget.left : widget.left * targetWidth;
    localRight -= widget.isAbsoluteRight ? widget.right : widget.right * targetWidth;
    if (hasTarget) {
      localLeft += inverseTranslate.x;
      localLeft *= inverseScale.x;
      localRight += inverseTranslate.x;
      localRight *= inverseScale.x;
    }
    var width = 0;
    var anchorX = anchor.x;
    var scaleX = scale.x;
    if (scaleX < 0) {
      anchorX = 1.0 - anchorX;
      scaleX = -scaleX;
    }
    if (widget.isStretchWidth) {
      width = localRight - localLeft;
      if (scaleX !== 0) {
        uiTrans.width = width / scaleX;
      }
      x = localLeft + anchorX * width;
    } else {
      width = uiTrans.width * scaleX;
      if (widget.isAlignHorizontalCenter) {
        var localHorizontalCenter = widget.isAbsoluteHorizontalCenter ? widget.horizontalCenter : widget.horizontalCenter * targetWidth;
        var targetCenter = (0.5 - targetAnchor.x) * targetSize.width;
        if (hasTarget) {
          localHorizontalCenter *= inverseScale.x;
          targetCenter += inverseTranslate.x;
          targetCenter *= inverseScale.x;
        }
        x = targetCenter + (anchorX - 0.5) * width + localHorizontalCenter;
      } else if (widget.isAlignLeft) {
        x = localLeft + anchorX * width;
      } else {
        x = localRight + (anchorX - 1) * width;
      }
      if (!approx(scaleX, 0, EPSILON$1)) {
        width /= scaleX;
      } else {
        width = uiTrans.width;
      }
    }
    widget._lastSize.width = width;
  }
  if (widget.alignFlags & AlignFlags.VERTICAL) {
    var localTop = 0;
    var localBottom = 0;
    var targetHeight = targetSize.height;
    if (isRoot) {
      localBottom = visibleRect.bottom.y;
      localTop = visibleRect.top.y;
    } else {
      localBottom = -targetAnchor.y * targetHeight;
      localTop = localBottom + targetHeight;
    }
    localBottom += widget.isAbsoluteBottom ? widget.bottom : widget.bottom * targetHeight;
    localTop -= widget.isAbsoluteTop ? widget.top : widget.top * targetHeight;
    if (hasTarget) {
      localBottom += inverseTranslate.y;
      localBottom *= inverseScale.y;
      localTop += inverseTranslate.y;
      localTop *= inverseScale.y;
    }
    var height = 0;
    var anchorY = anchor.y;
    var scaleY = scale.y;
    if (scaleY < 0) {
      anchorY = 1.0 - anchorY;
      scaleY = -scaleY;
    }
    if (widget.isStretchHeight) {
      height = localTop - localBottom;
      if (scaleY !== 0) {
        uiTrans.height = height / scaleY;
      }
      y = localBottom + anchorY * height;
    } else {
      height = uiTrans.height * scaleY;
      if (widget.isAlignVerticalCenter) {
        var localVerticalCenter = widget.isAbsoluteVerticalCenter ? widget.verticalCenter : widget.verticalCenter * targetHeight;
        var targetMiddle = (0.5 - targetAnchor.y) * targetSize.height;
        if (hasTarget) {
          localVerticalCenter *= inverseScale.y;
          targetMiddle += inverseTranslate.y;
          targetMiddle *= inverseScale.y;
        }
        y = targetMiddle + (anchorY - 0.5) * height + localVerticalCenter;
      } else if (widget.isAlignBottom) {
        y = localBottom + anchorY * height;
      } else {
        y = localTop + (anchorY - 1) * height;
      }
      if (!approx(scaleY, 0, EPSILON$1)) {
        height /= scaleY;
      } else {
        height = uiTrans.height;
      }
    }
    widget._lastSize.height = height;
  }
  node.setPosition(x, y, _tempPos.z);
  Vec3.set(widget._lastPos, x, y, _tempPos.z);
}
function visitNode(node) {
  var widget = node.getComponent(Widget);
  if (widget && widget.enabled) {
    {
      widget._validateTargetInDEV();
    }
    if (!cclegacy.isValid(node, true)) {
      return;
    }
    activeWidgets.push(widget);
  }
  var children = node.children;
  for (var _iterator = _createForOfIteratorHelperLoose(children), _step; !(_step = _iterator()).done;) {
    var child = _step.value;
    if (child.active) {
      visitNode(child);
    }
  }
}
function refreshScene() {
  var scene = director.getScene();
  if (scene) {
    widgetManager.isAligning = true;
    if (widgetManager._nodesOrderDirty) {
      activeWidgets.length = 0;
      visitNode(scene);
      widgetManager._nodesOrderDirty = false;
    }
    var widget = null;
    var iterator = widgetManager._activeWidgetsIterator;
    for (iterator.i = 0; iterator.i < activeWidgets.length; ++iterator.i) {
      widget = activeWidgets[iterator.i];
      if (widget._dirty) {
        align(widget.node, widget);
        widget._dirty = false;
      }
    }
    widgetManager.isAligning = false;
  }
}
var activeWidgets = [];
function updateAlignment(node) {
  var parent = node.parent;
  if (parent && Node.isNode(parent)) {
    updateAlignment(parent);
  }
  var widget = node.getComponent(Widget);
  if (widget && parent) {
    align(node, widget);
  }
}
var widgetManager = cclegacy._widgetManager = {
  isAligning: false,
  _nodesOrderDirty: false,
  _activeWidgetsIterator: new MutableForwardIterator(activeWidgets),
  animationState: null,
  init: function init() {
    director.on(DirectorEvent.AFTER_SCENE_LAUNCH, refreshScene);
    director.on(DirectorEvent.AFTER_UPDATE, refreshScene);
    View.instance.on('design-resolution-changed', this.onResized, this);
    {
      var thisOnResized = this.onResized.bind(this);
      View.instance.on('canvas-resize', thisOnResized);
      screenAdapter.on('window-resize', thisOnResized);
    }
  },
  add: function add(widget) {
    this._nodesOrderDirty = true;
  },
  remove: function remove(widget) {
    this._activeWidgetsIterator.remove(widget);
  },
  onResized: function onResized() {
    var scene = director.getScene();
    if (scene) {
      this.refreshWidgetOnResized(scene);
    }
  },
  refreshWidgetOnResized: function refreshWidgetOnResized(node) {
    var widget = Node.isNode(node) && node.getComponent(Widget);
    if (widget && widget.enabled && (widget.alignMode === AlignMode.ON_WINDOW_RESIZE || widget.alignMode === AlignMode.ALWAYS)) {
      widget.setDirty();
    }
    var children = node.children;
    for (var _iterator2 = _createForOfIteratorHelperLoose(children), _step2; !(_step2 = _iterator2()).done;) {
      var child = _step2.value;
      this.refreshWidgetOnResized(child);
    }
  },
  updateOffsetsToStayPut: function updateOffsetsToStayPut(widget, e) {
    function i(t, c) {
      return Math.abs(t - c) > 1e-10 ? c : t;
    }
    var widgetNode = widget.node;
    var widgetParent = widgetNode.parent;
    if (widgetParent) {
      var zero = _tempVec2_1;
      zero.set(0, 0);
      var one = _tempVec2_2;
      one.set(1, 1);
      if (widget.target) {
        widgetParent = widget.target;
        computeInverseTransForTarget(widgetNode, widgetParent, zero, one);
      }
      if (!e) {
        return;
      }
      var parentTrans = widgetParent._uiProps && widgetParent._getUITransformComp();
      var parentAP = parentTrans ? parentTrans.anchorPoint : _defaultAnchor;
      var trans = widgetNode._getUITransformComp();
      var matchSize = getReadonlyNodeSize(widgetParent);
      var myAP = trans.anchorPoint;
      var pos = widgetNode.position;
      var alignFlags = AlignFlags;
      var widgetNodeScale = widgetNode.scale;
      var temp = 0;
      if (e & alignFlags.LEFT) {
        var l = -parentAP.x * matchSize.width;
        l += zero.x;
        l *= one.x;
        temp = pos.x - myAP.x * trans.width * Math.abs(widgetNodeScale.x) - l;
        if (!widget.isAbsoluteLeft) {
          temp /= matchSize.width;
        }
        temp /= one.x;
        widget.left = i(widget.left, temp);
      }
      if (e & alignFlags.RIGHT) {
        var r = (1 - parentAP.x) * matchSize.width;
        r += zero.x;
        temp = (r *= one.x) - (pos.x + (1 - myAP.x) * trans.width * Math.abs(widgetNodeScale.x));
        if (!widget.isAbsoluteRight) {
          temp /= matchSize.width;
        }
        temp /= one.x;
        widget.right = i(widget.right, temp);
      }
      if (e & alignFlags.TOP) {
        var t = (1 - parentAP.y) * matchSize.height;
        t += zero.y;
        temp = (t *= one.y) - (pos.y + (1 - myAP.y) * trans.height * Math.abs(widgetNodeScale.y));
        if (!widget.isAbsoluteTop) {
          temp /= matchSize.height;
        }
        temp /= one.y;
        widget.top = i(widget.top, temp);
      }
      if (e & alignFlags.BOT) {
        var b = -parentAP.y * matchSize.height;
        b += zero.y;
        b *= one.y;
        temp = pos.y - myAP.y * trans.height * Math.abs(widgetNodeScale.y) - b;
        if (!widget.isAbsoluteBottom) {
          temp /= matchSize.height;
        }
        temp /= one.y;
        widget.bottom = i(widget.bottom, temp);
      }
    }
  },
  updateAlignment: updateAlignment,
  AlignMode: AlignMode,
  AlignFlags: AlignFlags
};
director.on(DirectorEvent.INIT, function () {
  widgetManager.init();
});

var _dec$3, _dec2$2, _dec3$2, _class$3, _class2$2, _initializer$2;
var SafeArea = (_dec$3 = ccclass('cc.SafeArea'), _dec2$2 = executionOrder(110), _dec3$2 = requireComponent(Widget), _dec$3(_class$3 = _dec2$2(_class$3 = _dec3$2(_class$3 = (_class2$2 = function (_Component) {
  function SafeArea() {
    var _this;
    _this = _Component.call(this) || this;
    _this._symmetric = _initializer$2 && _initializer$2();
    return _this;
  }
  _inheritsLoose(SafeArea, _Component);
  var _proto = SafeArea.prototype;
  _proto.onEnable = function onEnable() {
    this.updateArea();
    screenAdapter.on('window-resize', this.updateArea, this);
    screenAdapter.on('orientation-change', this.updateArea, this);
  };
  _proto.onDisable = function onDisable() {
    screenAdapter.off('window-resize', this.updateArea, this);
    screenAdapter.off('orientation-change', this.updateArea, this);
  };
  _proto.updateArea = function updateArea() {
    var widget = this.node.getComponent(Widget);
    var uiTransComp = this.node.getComponent(UITransform);
    if (!widget || !uiTransComp) {
      return;
    }
    widget.updateAlignment();
    var lastPos = this.node.position.clone();
    var lastAnchorPoint = uiTransComp.anchorPoint.clone();
    widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
    var visibleSize = view.getVisibleSize();
    var screenWidth = visibleSize.width;
    var screenHeight = visibleSize.height;
    var safeArea = sys.getSafeAreaRect(this._symmetric);
    widget.top = screenHeight - safeArea.y - safeArea.height;
    widget.bottom = safeArea.y;
    widget.left = safeArea.x;
    widget.right = screenWidth - safeArea.x - safeArea.width;
    widget.updateAlignment();
    var curPos = this.node.position.clone();
    var anchorX = lastAnchorPoint.x - (curPos.x - lastPos.x) / uiTransComp.width;
    var anchorY = lastAnchorPoint.y - (curPos.y - lastPos.y) / uiTransComp.height;
    uiTransComp.setAnchorPoint(anchorX, anchorY);
    widgetManager.add(widget);
  };
  return _createClass(SafeArea, [{
    key: "symmetric",
    get: function get() {
      return this._symmetric;
    },
    set: function set(value) {
      this._symmetric = value;
    }
  }]);
}(Component), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_symmetric", [serializable], function () {
  return true;
}), _class2$2)) || _class$3) || _class$3) || _class$3);
legacyCC.SafeArea = SafeArea;

var _dec$2, _dec2$1, _dec3$1, _dec4, _dec5, _class$2, _class2$1, _initializer$1, _initializer2$1, _initializer3, _initializer4, _initializer5;
var UICoordinateTracker = (_dec$2 = ccclass('cc.UICoordinateTracker'), _dec2$1 = executionOrder(110), _dec3$1 = type(Node), _dec4 = type(Camera), _dec5 = type([EventHandler]), _dec$2(_class$2 = _dec2$1(_class$2 = (_class2$1 = function (_Component) {
  function UICoordinateTracker() {
    var _this;
    _this = _Component.call(this) || this;
    _this.syncEvents = _initializer$1 && _initializer$1();
    _this._target = _initializer2$1 && _initializer2$1();
    _this._camera = _initializer3 && _initializer3();
    _this._useScale = _initializer4 && _initializer4();
    _this._distance = _initializer5 && _initializer5();
    _this._transformPos = v3();
    _this._viewPos = v3();
    _this._canMove = true;
    _this._lastWPos = v3();
    _this._lastCameraPos = v3();
    return _this;
  }
  _inheritsLoose(UICoordinateTracker, _Component);
  var _proto = UICoordinateTracker.prototype;
  _proto.onEnable = function onEnable() {
    this._checkCanMove();
  };
  _proto.update = function update() {
    var wPos = this.node.worldPosition;
    var camera = this._camera;
    if (!this._canMove || !camera || !camera.camera || this._lastWPos.equals(wPos) && this._lastCameraPos.equals(camera.node.worldPosition)) {
      return;
    }
    this._lastWPos.set(wPos);
    this._lastCameraPos.set(camera.node.worldPosition);
    camera.camera.update();
    camera.convertToUINode(wPos, this._target, this._transformPos);
    if (this._useScale) {
      Vec3.transformMat4(this._viewPos, this.node.worldPosition, camera.camera.matView);
    }
    if (this.syncEvents.length > 0) {
      var data = this._distance / Math.abs(this._viewPos.z);
      EventHandler.emitEvents(this.syncEvents, this._transformPos, data);
    }
  };
  _proto._checkCanMove = function _checkCanMove() {
    this._canMove = !!(this._camera && this._target);
  };
  return _createClass(UICoordinateTracker, [{
    key: "target",
    get: function get() {
      return this._target;
    },
    set: function set(value) {
      if (this._target === value) {
        return;
      }
      this._target = value;
      this._checkCanMove();
    }
  }, {
    key: "camera",
    get: function get() {
      return this._camera;
    },
    set: function set(value) {
      if (this._camera === value) {
        return;
      }
      this._camera = value;
      this._checkCanMove();
    }
  }, {
    key: "useScale",
    get: function get() {
      return this._useScale;
    },
    set: function set(value) {
      if (this._useScale === value) {
        return;
      }
      this._useScale = value;
    }
  }, {
    key: "distance",
    get: function get() {
      return this._distance;
    },
    set: function set(value) {
      if (this._distance === value) {
        return;
      }
      this._distance = value;
    }
  }]);
}(Component), _applyDecoratedDescriptor(_class2$1.prototype, "target", [_dec3$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "target"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "camera", [_dec4], Object.getOwnPropertyDescriptor(_class2$1.prototype, "camera"), _class2$1.prototype), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "syncEvents", [_dec5, serializable], function () {
  return [];
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_target", [serializable], function () {
  return null;
}), _initializer3 = applyDecoratedInitializer(_class2$1.prototype, "_camera", [serializable], function () {
  return null;
}), _initializer4 = applyDecoratedInitializer(_class2$1.prototype, "_useScale", [serializable], function () {
  return true;
}), _initializer5 = applyDecoratedInitializer(_class2$1.prototype, "_distance", [serializable], function () {
  return 1;
}), _class2$1)) || _class$2) || _class$2);

var _dec$1, _class$1;
var BlockEvents = [NodeEventType.TOUCH_START, NodeEventType.TOUCH_END, NodeEventType.TOUCH_MOVE, NodeEventType.MOUSE_DOWN, NodeEventType.MOUSE_MOVE, NodeEventType.MOUSE_UP, NodeEventType.MOUSE_ENTER, NodeEventType.MOUSE_LEAVE, NodeEventType.MOUSE_WHEEL];
function stopPropagation(event) {
  event.propagationStopped = true;
}
var BlockInputEvents = (_dec$1 = ccclass('cc.BlockInputEvents'), _dec$1(_class$1 = function (_Component) {
  function BlockInputEvents() {
    return _Component.apply(this, arguments) || this;
  }
  _inheritsLoose(BlockInputEvents, _Component);
  var _proto = BlockInputEvents.prototype;
  _proto.onEnable = function onEnable() {
    for (var i = 0; i < BlockEvents.length; i++) {
      this.node.on(BlockEvents[i], stopPropagation, this);
    }
  };
  _proto.onDisable = function onDisable() {
    for (var i = 0; i < BlockEvents.length; i++) {
      this.node.off(BlockEvents[i], stopPropagation, this);
    }
  };
  return BlockInputEvents;
}(Component)) || _class$1);

var _dec, _dec2, _dec3, _class, _class2, _initializer, _initializer2;
var SubContextView = (_dec = ccclass('cc.SubContextView'), _dec2 = executionOrder(110), _dec3 = requireComponent(UITransform), _dec(_class = _dec2(_class = _dec3(_class = (_class2 = function (_Component) {
  function SubContextView() {
    var _this;
    _this = _Component.call(this) || this;
    _this._fps = _initializer && _initializer();
    _this._sprite = null;
    _this._imageAsset = new ImageAsset();
    _this._texture = new Texture2D();
    _this._updatedTime = 0;
    _this._updateInterval = 0;
    _this._openDataContext = null;
    _this._content = new Node('content');
    _this._designResolutionSize = _initializer2 && _initializer2();
    _this._content.hideFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
    _this._updatedTime = performance.now();
    return _this;
  }
  _inheritsLoose(SubContextView, _Component);
  var _proto = SubContextView.prototype;
  _proto.onLoad = function onLoad() {
    if (minigame.getOpenDataContext) {
      this._updateInterval = 1000 / this._fps;
      this._openDataContext = minigame.getOpenDataContext();
      this._initSharedCanvas();
      this._initContentNode();
      this._updateSubContextView();
      this._updateContentLayer();
    } else {
      this.enabled = false;
    }
  };
  _proto.onEnable = function onEnable() {
    this._registerNodeEvent();
  };
  _proto.onDisable = function onDisable() {
    this._unregisterNodeEvent();
  };
  _proto._initSharedCanvas = function _initSharedCanvas() {
    if (this._openDataContext) {
      var sharedCanvas = this._openDataContext.canvas;
      var designWidth = this._designResolutionSize.width;
      var designHeight = this._designResolutionSize.height;
      sharedCanvas.width = designWidth;
      sharedCanvas.height = designHeight;
    }
  };
  _proto._initContentNode = function _initContentNode() {
    if (this._openDataContext) {
      var sharedCanvas = this._openDataContext.canvas;
      var image = this._imageAsset;
      image.reset(sharedCanvas);
      this._texture.image = image;
      this._texture.create(sharedCanvas.width, sharedCanvas.height);
      this._sprite = this._content.getComponent(Sprite);
      if (!this._sprite) {
        this._sprite = this._content.addComponent(Sprite);
      }
      if (this._sprite.spriteFrame) {
        this._sprite.spriteFrame.texture = this._texture;
      } else {
        var sp = new SpriteFrame();
        sp.texture = this._texture;
        this._sprite.spriteFrame = sp;
      }
      this._content.parent = this.node;
    }
  };
  _proto._updateSubContextView = function _updateSubContextView() {
    if (!this._openDataContext) {
      return;
    }
    var nodeTrans = this.node.getComponent(UITransform);
    var contentTrans = this._content.getComponent(UITransform);
    var scaleX = nodeTrans.width / contentTrans.width;
    var scaleY = nodeTrans.height / contentTrans.height;
    var scale = scaleX > scaleY ? scaleY : scaleX;
    contentTrans.width *= scale;
    contentTrans.height *= scale;
    var viewportRect = view.getViewportRect();
    var box = contentTrans.getBoundingBoxToWorld();
    var visibleSize = view.getVisibleSize();
    var dpr = screenAdapter.devicePixelRatio;
    var x = (viewportRect.width * (box.x / visibleSize.width) + viewportRect.x) / dpr;
    var y = (viewportRect.height * (box.y / visibleSize.height) + viewportRect.y) / dpr;
    var width = viewportRect.width * (box.width / visibleSize.width) / dpr;
    var height = viewportRect.height * (box.height / visibleSize.height) / dpr;
    this._openDataContext.postMessage({
      fromEngine: true,
      type: 'engine',
      event: 'viewport',
      x: x,
      y: y,
      width: width,
      height: height
    });
  };
  _proto._updateSubContextTexture = function _updateSubContextTexture() {
    var img = this._imageAsset;
    if (!img || !this._openDataContext) {
      return;
    }
    if (img.width <= 0 || img.height <= 0) {
      return;
    }
    var sharedCanvas = this._openDataContext.canvas;
    img.reset(sharedCanvas);
    if (sharedCanvas.width > img.width || sharedCanvas.height > img.height) {
      this._texture.create(sharedCanvas.width, sharedCanvas.height);
    }
    this._texture.uploadData(sharedCanvas);
  };
  _proto._registerNodeEvent = function _registerNodeEvent() {
    this.node.on(NodeEventType.TRANSFORM_CHANGED, this._updateSubContextView, this);
    this.node.on(NodeEventType.SIZE_CHANGED, this._updateSubContextView, this);
    this.node.on(NodeEventType.LAYER_CHANGED, this._updateContentLayer, this);
  };
  _proto._unregisterNodeEvent = function _unregisterNodeEvent() {
    this.node.off(NodeEventType.TRANSFORM_CHANGED, this._updateSubContextView, this);
    this.node.off(NodeEventType.SIZE_CHANGED, this._updateSubContextView, this);
    this.node.off(NodeEventType.LAYER_CHANGED, this._updateContentLayer, this);
  };
  _proto._updateContentLayer = function _updateContentLayer() {
    this._content.layer = this.node.layer;
  };
  _proto.update = function update(dt) {
    var calledUpdateManually = dt === undefined;
    if (calledUpdateManually) {
      this._updateSubContextTexture();
      return;
    }
    var now = performance.now();
    var deltaTime = now - this._updatedTime;
    if (deltaTime >= this._updateInterval) {
      this._updatedTime += this._updateInterval;
      this._updateSubContextTexture();
    }
  };
  _proto.onDestroy = function onDestroy() {
    this._content.destroy();
    this._texture.destroy();
    if (this._sprite) {
      this._sprite.destroy();
    }
    this._imageAsset.destroy();
    this._openDataContext = null;
  };
  return _createClass(SubContextView, [{
    key: "designResolutionSize",
    get: function get() {
      return this._designResolutionSize;
    },
    set: function set(value) {
      {
        return;
      }
    }
  }, {
    key: "fps",
    get: function get() {
      return this._fps;
    },
    set: function set(value) {
      if (this._fps === value) {
        return;
      }
      this._fps = value;
      this._updateInterval = 1000 / value;
    }
  }]);
}(Component), _initializer = applyDecoratedInitializer(_class2.prototype, "_fps", [serializable], function () {
  return 60;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_designResolutionSize", [serializable], function () {
  return new Size(640, 960);
}), _class2)) || _class) || _class) || _class);
legacyCC.SubContextView = SubContextView;

removeProperty(View.prototype, 'View.prototype', [{
  name: 'isAntiAliasEnabled',
  suggest: 'The API of Texture2d have been largely modified, no alternative'
}, {
  name: 'enableAntiAlias',
  suggest: 'The API of Texture2d have been largely modified, no alternative'
}]);
markAsWarning(View.prototype, 'View.prototype', [{
  name: 'adjustViewportMeta'
}, {
  name: 'enableAutoFullScreen',
  suggest: 'use screen.requestFullScreen() instead.'
}, {
  name: 'isAutoFullScreenEnabled'
}, {
  name: 'setCanvasSize',
  suggest: 'setting size in CSS pixels is not recommended, please use screen.windowSize instead.'
}, {
  name: 'getCanvasSize',
  suggest: 'please use screen.windowSize instead.'
}, {
  name: 'getFrameSize',
  suggest: 'getting size in CSS pixels is not recommended, please use screen.windowSize instead.'
}, {
  name: 'setFrameSize',
  suggest: 'setting size in CSS pixels is not recommended, please use screen.windowSize instead.'
}, {
  name: 'getDevicePixelRatio',
  suggest: 'use screen.devicePixelRatio instead.'
}, {
  name: 'convertToLocationInView'
}, {
  name: 'enableRetina'
}, {
  name: 'isRetinaEnabled'
}, {
  name: 'setRealPixelResolution'
}]);

export { BlockInputEvents, Button, EditBox, Layout, PageView, PageViewIndicator, ProgressBar, SafeArea, ScrollBar, ScrollView, Slider, SubContextView, Toggle, ToggleContainer, UICoordinateTracker, View, ViewGroup, Widget, view, widgetManager };
//# sourceMappingURL=ui.js.map
