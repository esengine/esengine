import './_virtual_internal_constants-DWlew7Dp.js';
import './director-F7e_Lqjg.js';
import { g as game, G as Game } from './deprecated-Dswa7XeN.js';
import { k as errorID, s as settings, S as SettingsCategory, E as Enum } from './gc-object-CShF5lzx.js';

var SortingLayer = {
  "default": 0
};
game.on(Game.EVENT_POST_SUBSYSTEM_INIT, function () {
  SortingLayers.init();
});
var SortingLayers = function () {
  function SortingLayers() {}
  SortingLayers.getSortingPriority = function getSortingPriority(layer, order) {
    if (layer === void 0) {
      layer = 0;
    }
    if (order === void 0) {
      order = 0;
    }
    return (layer + (1 << 15) << 16 | order + (1 << 15)) >>> 0;
  };
  SortingLayers.getDefaultPriority = function getDefaultPriority() {
    return this.getSortingPriority(SortingLayer["default"], 0);
  };
  SortingLayers.getLayerIndex = function getLayerIndex(layer) {
    if (layer === void 0) {
      layer = 0;
    }
    var index = 0;
    if (this.indexMap.has(layer)) {
      index = this.indexMap.get(layer);
    } else {
      errorID(2105);
    }
    return index;
  };
  SortingLayers.getLayerIndexByName = function getLayerIndexByName(name) {
    var id = this.getLayerByName(name);
    return this.getLayerIndex(id);
  };
  SortingLayers.getLayerName = function getLayerName(layer) {
    if (layer === void 0) {
      layer = 0;
    }
    var name = '';
    if (this.nameMap.has(layer)) {
      name = this.nameMap.get(layer);
    } else {
      errorID(2105);
    }
    return name;
  };
  SortingLayers.getLayerByName = function getLayerByName(name) {
    var count = this.nameMap.size;
    var keyIterator = this.nameMap.keys();
    var key = 0;
    for (var i = 0; i < count; i++) {
      key = keyIterator.next().value;
      if (this.nameMap.get(key) === name) return key;
    }
    errorID(2106);
    return 0;
  };
  SortingLayers.isLayerValid = function isLayerValid(id) {
    if (this.indexMap.has(id)) {
      return true;
    } else {
      errorID(2105);
      return false;
    }
  };
  SortingLayers.getBuiltinLayers = function getBuiltinLayers() {
    return [{
      id: 0,
      name: 'default',
      value: 0
    }];
  };
  SortingLayers.init = function init() {
    var sortingLayers = settings.querySettings(SettingsCategory.ENGINE, 'sortingLayers');
    if (!sortingLayers || sortingLayers.length === 0) {
      sortingLayers = this.getBuiltinLayers();
    }
    SortingLayers.resetState();
    for (var i = 0; i < sortingLayers.length; i++) {
      var layer = sortingLayers[i];
      SortingLayers.setLayer(layer.id, layer.name, layer.value);
      SortingLayers.Enum[layer.name] = layer.id;
    }
    Enum.update(SortingLayers.Enum);
    Enum.sortList(SortingLayers.Enum, function (a, b) {
      return SortingLayers.getLayerIndex(a.value) - SortingLayers.getLayerIndex(b.value);
    });
  };
  SortingLayers.setLayer = function setLayer(layer, layerName, layerIndex) {
    this.nameMap.set(layer, layerName);
    this.indexMap.set(layer, layerIndex);
  };
  SortingLayers.resetState = function resetState() {
    var oldItem = Object.keys(SortingLayers.Enum);
    for (var i = 0; i < oldItem.length; i++) {
      delete SortingLayers.Enum[SortingLayers.Enum[oldItem[i]]];
      delete SortingLayers.Enum[oldItem[i]];
    }
    SortingLayers.indexMap.clear();
    SortingLayers.nameMap.clear();
  };
  return SortingLayers;
}();
SortingLayers.nameMap = new Map();
SortingLayers.indexMap = new Map();
SortingLayers.Enum = Enum(SortingLayer);

export { SortingLayers as S };
//# sourceMappingURL=sorting-layers-BHqhkSbY.js.map
