import { _ as _inheritsLoose, a as _createClass, b as _applyDecoratedDescriptor, C as CCBoolean } from './gc-object-CShF5lzx.js';
import { v as v2, c as ccclass, t as type, d as disallowMultiple, V as Vec2, b as applyDecoratedInitializer, s as serializable } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { N as NodeEventType, C as Component } from './node-event-Ccvtv8bJ.js';
import './prefab-DYg_oxpo.js';
import { N as Node, T as TransformBit, a as TRANSFORM_ON } from './scene-vWcxM1_c.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './touch-BKrZ-fxl.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';

var _dec, _dec2, _dec3, _class, _class2, _initializer, _initializer2;
var tempVec2 = v2();
var SkewType;
(function (SkewType) {
  SkewType[SkewType["NONE"] = 0] = "NONE";
  SkewType[SkewType["STANDARD"] = 1] = "STANDARD";
  SkewType[SkewType["ROTATIONAL"] = 2] = "ROTATIONAL";
})(SkewType || (SkewType = {}));
var UISkew = (_dec = ccclass('cc.UISkew'), _dec2 = type(CCBoolean), _dec3 = type(Vec2), _dec(_class = disallowMultiple(_class = (_class2 = function (_Component) {
  function UISkew() {
    var _this;
    _this = _Component.call(this) || this;
    _this._skew = _initializer && _initializer();
    _this._rotational = _initializer2 && _initializer2();
    _this._skewEnabled = false;
    return _this;
  }
  _inheritsLoose(UISkew, _Component);
  var _proto = UISkew.prototype;
  _proto.isSkewEnabled = function isSkewEnabled() {
    return this._skewEnabled;
  };
  _proto.__preload = function __preload() {
    this.node._uiProps._uiSkewComp = this;
  };
  _proto.onEnable = function onEnable() {
    this._skewEnabled = true;
    Node._incSkewCompCount();
    this._syncNative(true);
    this._updateNodeTransformFlags();
  };
  _proto.onDisable = function onDisable() {
    this._skewEnabled = false;
    Node._decSkewCompCount();
    this._syncNative(false);
    this._updateNodeTransformFlags();
  };
  _proto.onDestroy = function onDestroy() {
    this._skewEnabled = false;
    this._syncNative(false);
    this.node._uiProps._uiSkewComp = null;
    this._updateNodeTransformFlags();
  };
  _proto._syncNative = function _syncNative(enabled) {
  };
  _proto.setSkew = function setSkew(xOrVec2, y) {
    var v = this._skew;
    if (typeof xOrVec2 === 'number') {
      tempVec2.set(xOrVec2, y);
    } else {
      Vec2.copy(tempVec2, xOrVec2);
    }
    if (Vec2.equals(v, tempVec2)) return;
    v.set(tempVec2);
    if (this._skewEnabled) {
      this._updateNodeTransformFlags();
    }
  };
  _proto.getSkew = function getSkew(out) {
    if (!out) out = new Vec2();
    return out.set(this._skew);
  };
  _proto._updateNodeTransformFlags = function _updateNodeTransformFlags() {
    var node = this.node;
    node.invalidateChildren(TransformBit.SKEW);
    if (node._eventMask & TRANSFORM_ON) {
      node.emit(NodeEventType.TRANSFORM_CHANGED, TransformBit.SKEW);
    }
  };
  return _createClass(UISkew, [{
    key: "rotational",
    get: function get() {
      return this._rotational;
    },
    set: function set(value) {
      this._rotational = value;
      if (this._skewEnabled) {
        this._updateNodeTransformFlags();
      }
    }
  }, {
    key: "x",
    get: function get() {
      return this._skew.x;
    },
    set: function set(v) {
      this._skew.x = v;
      if (this._skewEnabled) {
        this._updateNodeTransformFlags();
      }
    }
  }, {
    key: "y",
    get: function get() {
      return this._skew.y;
    },
    set: function set(v) {
      this._skew.y = v;
      if (this._skewEnabled) {
        this._updateNodeTransformFlags();
      }
    }
  }, {
    key: "skew",
    get: function get() {
      return this._skew;
    },
    set: function set(value) {
      this.setSkew(value);
    }
  }]);
}(Component), _initializer = applyDecoratedInitializer(_class2.prototype, "_skew", [serializable], function () {
  return v2();
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_rotational", [serializable], function () {
  return false;
}), _applyDecoratedDescriptor(_class2.prototype, "rotational", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "rotational"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "skew", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "skew"), _class2.prototype), _class2)) || _class) || _class);
cclegacy.UISkew = UISkew;

export { UISkew };
//# sourceMappingURL=ui-skew.js.map
