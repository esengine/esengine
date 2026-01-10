import { S as SortingLayers } from './sorting-layers-BHqhkSbY.js';
import { _ as _inheritsLoose, w as warnID, a as _createClass, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import { c as ccclass, t as type, d as disallowMultiple, a as clamp, b as applyDecoratedInitializer, s as serializable, r as requireComponent } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './global-exports-DnCP_14L.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import { U as UIRenderer } from './ui-renderer-JpGcj-VM.js';
import { _ as _setSorting2DCount } from './batcher-2d-DWdWoCVz.js';
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
import './renderer-C7HM72NY.js';
import './deprecated-CN-RjLP6.js';

var _dec, _dec2, _dec3, _class, _class2, _initializer, _initializer2;
var MAX_INT16 = (1 << 15) - 1;
var MIN_INT16 = -1 << 15;
var sorting2DCount = 0;
var Sorting2D = (_dec = ccclass('cc.Sorting2D'), _dec2 = requireComponent(UIRenderer), _dec3 = type(SortingLayers.Enum), _dec(_class = disallowMultiple(_class = _dec2(_class = (_class2 = function (_Component) {
  function Sorting2D() {
    var _this;
    _this = _Component.call(this) || this;
    _this._isSorting2DEnabled = false;
    _this._sortingLayer = _initializer && _initializer();
    _this._sortingOrder = _initializer2 && _initializer2();
    _this._uiRenderer = null;
    return _this;
  }
  _inheritsLoose(Sorting2D, _Component);
  var _proto = Sorting2D.prototype;
  _proto.__preload = function __preload() {
    this._uiRenderer = this.getComponent(UIRenderer);
    if (!this._uiRenderer) {
      warnID(16300, this.node.name);
    }
  };
  _proto.onEnable = function onEnable() {
    this._isSorting2DEnabled = true;
    this._updateSortingPriority();
    ++sorting2DCount;
    _setSorting2DCount(sorting2DCount);
  };
  _proto.onDisable = function onDisable() {
    this._isSorting2DEnabled = false;
    this._updateSortingPriority();
    --sorting2DCount;
    _setSorting2DCount(sorting2DCount);
  };
  _proto._updateSortingPriority = function _updateSortingPriority() {
    var uiRenderer = this._uiRenderer;
    if (uiRenderer && uiRenderer.isValid) {
      if (this._isSorting2DEnabled) {
        var sortingLayerValue = SortingLayers.getLayerIndex(this._sortingLayer);
        var sortingPriority = SortingLayers.getSortingPriority(sortingLayerValue, this._sortingOrder);
        uiRenderer.priority = sortingPriority;
      } else {
        uiRenderer.priority = SortingLayers.getDefaultPriority();
      }
    }
  };
  return _createClass(Sorting2D, [{
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
}(Component), _applyDecoratedDescriptor(_class2.prototype, "sortingLayer", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "sortingLayer"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_sortingLayer", [serializable], function () {
  return SortingLayers.Enum["default"];
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_sortingOrder", [serializable], function () {
  return 0;
}), _class2)) || _class) || _class) || _class);

export { Sorting2D, SortingLayers };
//# sourceMappingURL=sorting-2d.js.map
