import { _ as _inheritsLoose, a as _createClass } from './gc-object-CShF5lzx.js';
import { c as ccclass, b as applyDecoratedInitializer, s as serializable } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './global-exports-DnCP_14L.js';
import { L as Layers } from './pipeline-state-manager-C5U4ouGL.js';
import { R as Renderer } from './renderer-C7HM72NY.js';
import { g as getPhaseID } from './scene-vWcxM1_c.js';

var _dec, _class, _class2, _initializer;
getPhaseID('specular-pass');
var ModelRenderer = (_dec = ccclass('cc.ModelRenderer'), _dec(_class = (_class2 = function (_Renderer) {
  function ModelRenderer() {
    var _this;
    _this = _Renderer.call(this) || this;
    _this._visFlags = _initializer && _initializer();
    _this._models = [];
    _this._priority = 0;
    return _this;
  }
  _inheritsLoose(ModelRenderer, _Renderer);
  var _proto = ModelRenderer.prototype;
  _proto._collectModels = function _collectModels() {
    return this._models;
  };
  _proto.onEnable = function onEnable() {
    this._updatePriority();
  };
  _proto._attachToScene = function _attachToScene() {};
  _proto._detachFromScene = function _detachFromScene() {};
  _proto._onVisibilityChange = function _onVisibilityChange(val) {};
  _proto._updatePriority = function _updatePriority() {
    if (this._models.length > 0) {
      for (var i = 0; i < this._models.length; i++) {
        this._models[i].priority = this._priority;
      }
    }
  };
  return _createClass(ModelRenderer, [{
    key: "visibility",
    get: function get() {
      return this._visFlags;
    },
    set: function set(val) {
      this._visFlags = val;
      this._onVisibilityChange(val);
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    },
    set: function set(val) {
      if (val === this._priority) return;
      this._priority = val;
      this._updatePriority();
    }
  }]);
}(Renderer), _initializer = applyDecoratedInitializer(_class2.prototype, "_visFlags", [serializable], function () {
  return Layers.Enum.NONE;
}), _class2)) || _class);

export { ModelRenderer as M };
//# sourceMappingURL=model-renderer-BBapFDY7.js.map
