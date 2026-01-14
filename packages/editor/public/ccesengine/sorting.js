import { S as SortingLayers } from './sorting-layers-BHqhkSbY.js';
import { _ as _inheritsLoose, w as warnID, a as _createClass, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import { c as ccclass, t as type, d as disallowMultiple, a as clamp, b as applyDecoratedInitializer, s as serializable } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './global-exports-DnCP_14L.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import './director-F7e_Lqjg.js';
import './debug-view-BuNhRPv_.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './scene-vWcxM1_c.js';
import './touch-BKrZ-fxl.js';
import './prefab-DYg_oxpo.js';
import './deprecated-n0w4kK7g.js';
import './deprecated-Dswa7XeN.js';

var _dec, _dec2, _class, _class2, _initializer, _initializer2;
var MAX_INT16 = (1 << 15) - 1;
var MIN_INT16 = -1 << 15;
var Sorting = (_dec = ccclass('cc.Sorting'), _dec2 = type(SortingLayers.Enum), _dec(_class = disallowMultiple(_class = (_class2 = function (_Component) {
  function Sorting() {
    var _this;
    _this = _Component.call(this) || this;
    _this._sortingLayer = _initializer && _initializer();
    _this._sortingOrder = _initializer2 && _initializer2();
    _this._modelRenderer = null;
    return _this;
  }
  _inheritsLoose(Sorting, _Component);
  var _proto = Sorting.prototype;
  _proto.__preload = function __preload() {
    this._modelRenderer = this.getComponent('cc.ModelRenderer');
    if (!this._modelRenderer) {
      warnID(16301, this.node.name);
    }
    this._updateSortingPriority();
  };
  _proto._updateSortingPriority = function _updateSortingPriority() {
    var sortingLayerValue = SortingLayers.getLayerIndex(this._sortingLayer);
    var sortingPriority = SortingLayers.getSortingPriority(sortingLayerValue, this._sortingOrder);
    if (this._modelRenderer && this._modelRenderer.isValid) {
      this._modelRenderer.priority = sortingPriority;
    }
  };
  return _createClass(Sorting, [{
    key: "sortingLayer",
    get: function get() {
      return this._sortingLayer;
    },
    set: function set(val) {
      if (val === this._sortingLayer || !SortingLayers.isLayerValid(val)) return;
      this._sortingLayer = val;
      this._updateSortingPriority();
    }
  }, {
    key: "sortingOrder",
    get: function get() {
      return this._sortingOrder;
    },
    set: function set(val) {
      if (val === this._sortingOrder) return;
      this._sortingOrder = clamp(val, MIN_INT16, MAX_INT16);
      this._updateSortingPriority();
    }
  }]);
}(Component), _applyDecoratedDescriptor(_class2.prototype, "sortingLayer", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "sortingLayer"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_sortingLayer", [serializable], function () {
  return SortingLayers.Enum["default"];
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_sortingOrder", [serializable], function () {
  return 0;
}), _class2)) || _class) || _class);

export { Sorting, SortingLayers };
//# sourceMappingURL=sorting.js.map
