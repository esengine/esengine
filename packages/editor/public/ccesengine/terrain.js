import { a as _createClass, _ as _inheritsLoose, K as isValid, b as _applyDecoratedDescriptor, d as CCObjectFlags, q as CCFloat } from './gc-object-CShF5lzx.js';
import { a as clamp, c as ccclass, B as Size, b as applyDecoratedInitializer, s as serializable, g as Vec4, u as v3, f as Vec3, m as Rect, V as Vec2, t as type, d as disallowMultiple } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { l as legacyCC } from './global-exports-DnCP_14L.js';
import { b as Material, c as MobilityMode, d as builtinResMgr, W as WrapMode, i as Texture2D, P as PixelFormat, j as TextureFilter, N as Node, E as EffectAsset } from './scene-vWcxM1_c.js';
import { M as Model } from './deprecated-n0w4kK7g.js';
import { M as ModelRenderer } from './model-renderer-BBapFDY7.js';
import { g as RenderingSubMesh, P as PipelineEventType } from './debug-view-BuNhRPv_.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import { d as director } from './director-F7e_Lqjg.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, A as Attribute, a as AttributeName, F as Format, y as PrimitiveMode } from './buffer-barrier-BlQXg9Aa.js';
import './deprecated-CN-RjLP6.js';
import { T as TERRAIN_BLOCK_TILE_COMPLEXITY, a as TERRAIN_BLOCK_VERTEX_SIZE, b as TERRAIN_BLOCK_VERTEX_COMPLEXITY, c as TerrainAsset, d as TerrainLayerInfo, e as TERRAIN_HEIGHT_FMAX, f as TERRAIN_HEIGHT_FMIN, g as TERRAIN_HEIGHT_BASE, h as TERRAIN_HEIGHT_FACTORY, i as TERRAIN_MAX_BLEND_LAYERS, j as TERRAIN_DATA_VERSION5, k as TERRAIN_MAX_LAYER_COUNT } from './terrain-asset-BMvu7XYU.js';
export { r as TERRAIN_DATA_VERSION, s as TERRAIN_DATA_VERSION2, t as TERRAIN_DATA_VERSION3, u as TERRAIN_DATA_VERSION4, v as TERRAIN_DATA_VERSION6, w as TERRAIN_DATA_VERSION7, x as TERRAIN_DATA_VERSION8, y as TERRAIN_DATA_VERSION_DEFAULT, q as TERRAIN_EAST_INDEX, m as TERRAIN_HEIGHT_FACTORY_V7, l as TERRAIN_MAX_LEVELS, n as TERRAIN_NORTH_INDEX, o as TERRAIN_SOUTH_INDEX, p as TERRAIN_WEST_INDEX, z as TerrainLayerBinaryInfo } from './terrain-asset-BMvu7XYU.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './prefab-DYg_oxpo.js';
import './touch-BKrZ-fxl.js';
import './renderer-C7HM72NY.js';

var HeightField = function () {
  function HeightField(w, h) {
    this.data = new Uint16Array();
    this.w = 0;
    this.h = 0;
    this.w = w;
    this.h = h;
    this.data = new Uint16Array(w * h);
    for (var i = 0; i < w * h; ++i) {
      this.data[i] = 0;
    }
  }
  var _proto = HeightField.prototype;
  _proto.set = function set(i, j, value) {
    this.data[j * this.w + i] = value;
  };
  _proto.get = function get(i, j) {
    return this.data[j * this.w + i];
  };
  _proto.getClamp = function getClamp(i, j) {
    i = clamp(i, 0, this.w - 1);
    j = clamp(j, 0, this.h - 1);
    return this.get(i, j);
  };
  _proto.getAt = function getAt(x, y) {
    var fx = x;
    var fy = y;
    var ix0 = Math.floor(fx);
    var iz0 = Math.floor(fy);
    var ix1 = ix0 + 1;
    var iz1 = iz0 + 1;
    var dx = fx - ix0;
    var dz = fy - iz0;
    ix0 = clamp(ix0, 0, this.w - 1);
    iz0 = clamp(iz0, 0, this.h - 1);
    ix1 = clamp(ix1, 0, this.w - 1);
    iz1 = clamp(iz1, 0, this.h - 1);
    var a = this.get(ix0, iz0);
    var b = this.get(ix1, iz0);
    var c = this.get(ix0, iz1);
    var d = this.get(ix1, iz1);
    var m = (b + c) * 0.5;
    if (dx + dz <= 1.0) {
      d = m + (m - a);
    } else {
      a = m + (m - d);
    }
    var h1 = a * (1.0 - dx) + b * dx;
    var h2 = c * (1.0 - dx) + d * dx;
    var h = h1 * (1.0 - dz) + h2 * dz;
    return h;
  };
  return HeightField;
}();

var TERRAIN_LOD_VERTS = 33;
var TERRAIN_LOD_TILES = 32;
var TERRAIN_LOD_LEVELS = 4;
var TERRAIN_LOD_NORTH_INDEX = 0;
var TERRAIN_LOD_SOUTH_INDEX = 1;
var TERRAIN_LOD_WEST_INDEX = 2;
var TERRAIN_LOD_EAST_INDEX = 3;
var TERRAIN_LOD_MAX_DISTANCE = 100000000000000.0;
var TerrainLodKey = function () {
  function TerrainLodKey() {
    this.level = 0;
    this.north = 0;
    this.south = 0;
    this.west = 0;
    this.east = 0;
  }
  var _proto = TerrainLodKey.prototype;
  _proto.equals = function equals(rk) {
    return this.level === rk.level && this.north === rk.north && this.south === rk.south && this.west === rk.west && this.east === rk.east;
  };
  return TerrainLodKey;
}();
var TerrainIndexPool = function TerrainIndexPool() {
  this.size = 0;
  this.indices = null;
};
var TerrainIndexData = function TerrainIndexData() {
  this.key = new TerrainLodKey();
  this.start = 0;
  this.size = 0;
  this.buffer = null;
  this.primCount = 0;
};
var TerrainLod = function () {
  function TerrainLod() {
    this._bodyIndexPool = void 0;
    this._connecterIndexPool = void 0;
    this._indexMap = [];
    this._indexBuffer = new Uint16Array();
    this._bodyIndexPool = new Array(TERRAIN_LOD_LEVELS);
    for (var i = 0; i < TERRAIN_LOD_LEVELS; ++i) {
      this._bodyIndexPool[i] = new TerrainIndexPool();
    }
    this._connecterIndexPool = new Array(TERRAIN_LOD_LEVELS * TERRAIN_LOD_LEVELS * 4);
    for (var _i = 0; _i < TERRAIN_LOD_LEVELS; ++_i) {
      for (var j = 0; j < TERRAIN_LOD_LEVELS; ++j) {
        for (var k = 0; k < 4; ++k) {
          this._connecterIndexPool[TerrainLod.mapIndex(_i, j, k)] = new TerrainIndexPool();
        }
      }
    }
    for (var _i2 = 0; _i2 < TERRAIN_LOD_LEVELS; ++_i2) {
      this._genBodyIndex(_i2);
    }
    for (var _i3 = 0; _i3 < TERRAIN_LOD_LEVELS; ++_i3) {
      for (var _j = 0; _j < TERRAIN_LOD_LEVELS; ++_j) {
        this._genConnecterIndexNorth(_i3, _j);
        this._genConnecterIndexSouth(_i3, _j);
        this._genConnecterIndexWest(_i3, _j);
        this._genConnecterIndexEast(_i3, _j);
      }
    }
    var levels = TERRAIN_LOD_LEVELS;
    for (var l = 0; l < levels; ++l) {
      for (var n = 0; n < levels; ++n) {
        if (n < l) {
          continue;
        }
        for (var s = 0; s < levels; ++s) {
          if (s < l) {
            continue;
          }
          for (var w = 0; w < levels; ++w) {
            if (w < l) {
              continue;
            }
            for (var e = 0; e < levels; ++e) {
              if (e < l) {
                continue;
              }
              var _k = new TerrainLodKey();
              _k.level = l;
              _k.north = n;
              _k.south = s;
              _k.west = w;
              _k.east = e;
              this._genIndexData(_k);
            }
          }
        }
      }
    }
  }
  TerrainLod.mapIndex = function mapIndex(i, j, k) {
    return i * (TERRAIN_LOD_LEVELS * TERRAIN_LOD_LEVELS) + j * TERRAIN_LOD_LEVELS + k;
  };
  var _proto2 = TerrainLod.prototype;
  _proto2.getIndexData = function getIndexData(k) {
    for (var i = 0; i < this._indexMap.length; ++i) {
      if (this._indexMap[i].key.equals(k)) {
        return this._indexMap[i];
      }
    }
    return null;
  };
  _proto2._genBodyIndex = function _genBodyIndex(level) {
    var step = 1 << level;
    var tiles = TERRAIN_LOD_TILES >> level;
    var start = 0;
    if (level < TERRAIN_LOD_LEVELS - 1) {
      tiles -= 2;
      start = step * TERRAIN_LOD_VERTS + step;
    }
    if (tiles === 0 || tiles === 0) {
      return;
    }
    var count = tiles * tiles * 6;
    this._bodyIndexPool[level].indices = new Uint16Array(count);
    var index = 0;
    var indices = new Uint16Array(count);
    var row_c = start;
    var row_n = row_c + TERRAIN_LOD_VERTS * step;
    for (var y = 0; y < tiles; ++y) {
      for (var x = 0; x < tiles; ++x) {
        indices[index++] = row_n + x * step;
        indices[index++] = row_n + (x + 1) * step;
        indices[index++] = row_c + x * step;
        indices[index++] = row_n + (x + 1) * step;
        indices[index++] = row_c + (x + 1) * step;
        indices[index++] = row_c + x * step;
      }
      row_c += TERRAIN_LOD_VERTS * step;
      row_n += TERRAIN_LOD_VERTS * step;
    }
    this._bodyIndexPool[level].size = index;
    this._bodyIndexPool[level].indices = indices;
  };
  _proto2._genConnecterIndexNorth = function _genConnecterIndexNorth(level, connecter) {
    var connecterIndex = TerrainLod.mapIndex(level, connecter, TERRAIN_LOD_NORTH_INDEX);
    if (connecter < level || level === TERRAIN_LOD_LEVELS - 1) {
      this._connecterIndexPool[connecterIndex].size = 0;
      this._connecterIndexPool[connecterIndex].indices = null;
      return;
    }
    var self_step = 1 << level;
    var neighbor_step = 1 << connecter;
    var self_tile = TERRAIN_LOD_TILES >> level;
    var count = self_tile * 2 + 2;
    var index = 0;
    var indices = new Uint16Array(count);
    indices[index++] = 0;
    indices[index++] = 0;
    for (var i = 1; i < self_tile; ++i) {
      var x1 = i * self_step;
      var y1 = self_step;
      var x0 = x1 / neighbor_step * neighbor_step;
      var y0 = y1 - self_step;
      var index0 = y1 * TERRAIN_LOD_VERTS + x1;
      var index1 = y0 * TERRAIN_LOD_VERTS + x0;
      indices[index++] = index0;
      indices[index++] = index1;
    }
    indices[index++] = TERRAIN_LOD_VERTS - 1;
    indices[index++] = TERRAIN_LOD_VERTS - 1;
    this._connecterIndexPool[connecterIndex].size = index;
    this._connecterIndexPool[connecterIndex].indices = indices;
  };
  _proto2._genConnecterIndexSouth = function _genConnecterIndexSouth(level, connecter) {
    var connecterIndex = TerrainLod.mapIndex(level, connecter, TERRAIN_LOD_SOUTH_INDEX);
    if (connecter < level || level === TERRAIN_LOD_LEVELS - 1) {
      this._connecterIndexPool[connecterIndex].size = 0;
      this._connecterIndexPool[connecterIndex].indices = null;
      return;
    }
    var self_step = 1 << level;
    var neighbor_step = 1 << connecter;
    var self_tile = TERRAIN_LOD_TILES >> level;
    var count = self_tile * 2 + 2;
    var index = 0;
    var indices = new Uint16Array(count);
    indices[index++] = TERRAIN_LOD_TILES * TERRAIN_LOD_VERTS;
    indices[index++] = TERRAIN_LOD_TILES * TERRAIN_LOD_VERTS;
    for (var i = 1; i < self_tile; ++i) {
      var x0 = i * self_step;
      var y0 = TERRAIN_LOD_VERTS - 1 - self_step;
      var x1 = x0 / neighbor_step * neighbor_step;
      var y1 = y0 + self_step;
      var index0 = y1 * TERRAIN_LOD_VERTS + x1;
      var index1 = y0 * TERRAIN_LOD_VERTS + x0;
      indices[index++] = index0;
      indices[index++] = index1;
    }
    indices[index++] = TERRAIN_LOD_VERTS * TERRAIN_LOD_VERTS - 1;
    indices[index++] = TERRAIN_LOD_VERTS * TERRAIN_LOD_VERTS - 1;
    this._connecterIndexPool[connecterIndex].size = index;
    this._connecterIndexPool[connecterIndex].indices = indices;
  };
  _proto2._genConnecterIndexWest = function _genConnecterIndexWest(level, connecter) {
    var connecterIndex = TerrainLod.mapIndex(level, connecter, TERRAIN_LOD_WEST_INDEX);
    if (connecter < level || level === TERRAIN_LOD_LEVELS - 1) {
      this._connecterIndexPool[connecterIndex].size = 0;
      this._connecterIndexPool[connecterIndex].indices = null;
      return;
    }
    var self_step = 1 << level;
    var neighbor_step = 1 << connecter;
    var self_tile = TERRAIN_LOD_TILES >> level;
    var count = self_tile * 2 + 2;
    var index = 0;
    var indices = new Uint16Array(count);
    indices[index++] = 0;
    indices[index++] = 0;
    for (var i = 1; i < self_tile; ++i) {
      var x0 = 0;
      var y0 = i * self_step / neighbor_step * neighbor_step;
      var x1 = self_step;
      var y1 = i * self_step;
      var index0 = y0 * TERRAIN_LOD_VERTS + x0;
      var index1 = y1 * TERRAIN_LOD_VERTS + x1;
      indices[index++] = index0;
      indices[index++] = index1;
    }
    indices[index++] = TERRAIN_LOD_TILES * TERRAIN_LOD_VERTS;
    indices[index++] = TERRAIN_LOD_TILES * TERRAIN_LOD_VERTS;
    this._connecterIndexPool[connecterIndex].size = index;
    this._connecterIndexPool[connecterIndex].indices = indices;
  };
  _proto2._genConnecterIndexEast = function _genConnecterIndexEast(level, connecter) {
    var connecterIndex = TerrainLod.mapIndex(level, connecter, TERRAIN_LOD_EAST_INDEX);
    if (connecter < level || level === TERRAIN_LOD_LEVELS - 1) {
      this._connecterIndexPool[connecterIndex].size = 0;
      this._connecterIndexPool[connecterIndex].indices = null;
      return;
    }
    var self_step = 1 << level;
    var neighbor_step = 1 << connecter;
    var self_tile = TERRAIN_LOD_TILES >> level;
    var count = self_tile * 2 + 2;
    var index = 0;
    var indices = new Uint16Array(count);
    indices[index++] = TERRAIN_LOD_VERTS - 1;
    indices[index++] = TERRAIN_LOD_VERTS - 1;
    for (var i = 1; i < self_tile; ++i) {
      var x0 = TERRAIN_LOD_VERTS - 1 - self_step;
      var y0 = i * self_step;
      var x1 = TERRAIN_LOD_VERTS - 1;
      var y1 = i * self_step / neighbor_step * neighbor_step;
      var index0 = y0 * TERRAIN_LOD_VERTS + x0;
      var index1 = y1 * TERRAIN_LOD_VERTS + x1;
      indices[index++] = index0;
      indices[index++] = index1;
    }
    indices[index++] = TERRAIN_LOD_VERTS * TERRAIN_LOD_VERTS - 1;
    indices[index++] = TERRAIN_LOD_VERTS * TERRAIN_LOD_VERTS - 1;
    this._connecterIndexPool[connecterIndex].size = index;
    this._connecterIndexPool[connecterIndex].indices = indices;
  };
  _proto2._getConnenterIndex = function _getConnenterIndex(i, j, k) {
    return this._connecterIndexPool[TerrainLod.mapIndex(i, j, k)];
  };
  _proto2._genIndexData = function _genIndexData(k) {
    var data = this.getIndexData(k);
    if (data != null) {
      return data;
    }
    var body = this._bodyIndexPool[k.level];
    var north = this._getConnenterIndex(k.level, k.north, TERRAIN_LOD_NORTH_INDEX);
    var south = this._getConnenterIndex(k.level, k.south, TERRAIN_LOD_SOUTH_INDEX);
    var west = this._getConnenterIndex(k.level, k.west, TERRAIN_LOD_WEST_INDEX);
    var east = this._getConnenterIndex(k.level, k.east, TERRAIN_LOD_EAST_INDEX);
    data = new TerrainIndexData();
    data.size = 0;
    data.primCount = 0;
    if (body.indices != null) {
      data.size += body.size;
    }
    if (north.indices) {
      data.size += (north.size - 2) * 3;
    }
    if (south.indices) {
      data.size += (south.size - 2) * 3;
    }
    if (west.indices) {
      data.size += (west.size - 2) * 3;
    }
    if (east.indices) {
      data.size += (east.size - 2) * 3;
    }
    if (data.size === 0) {
      return null;
    }
    var index = 0;
    data.buffer = new Uint16Array(data.size);
    data.key.level = k.level;
    data.key.east = k.east;
    data.key.west = k.west;
    data.key.north = k.north;
    data.key.south = k.south;
    if (body.indices) {
      for (var i = 0; i < body.size; ++i) {
        data.buffer[index++] = body.indices[i];
      }
    }
    if (north.indices) {
      for (var _i4 = 0; _i4 < north.size - 2; _i4 += 2) {
        var a = north.indices[_i4 + 0];
        var b = north.indices[_i4 + 1];
        var c = north.indices[_i4 + 2];
        var d = north.indices[_i4 + 3];
        data.buffer[index++] = a;
        data.buffer[index++] = c;
        data.buffer[index++] = b;
        data.buffer[index++] = c;
        data.buffer[index++] = d;
        data.buffer[index++] = b;
      }
    }
    if (south.indices) {
      for (var _i5 = 0; _i5 < south.size - 2; _i5 += 2) {
        var _a = south.indices[_i5 + 0];
        var _b = south.indices[_i5 + 1];
        var _c = south.indices[_i5 + 2];
        var _d = south.indices[_i5 + 3];
        data.buffer[index++] = _a;
        data.buffer[index++] = _c;
        data.buffer[index++] = _b;
        data.buffer[index++] = _c;
        data.buffer[index++] = _d;
        data.buffer[index++] = _b;
      }
    }
    if (west.indices) {
      for (var _i6 = 0; _i6 < west.size - 2; _i6 += 2) {
        var _a2 = west.indices[_i6 + 0];
        var _b2 = west.indices[_i6 + 1];
        var _c2 = west.indices[_i6 + 2];
        var _d2 = west.indices[_i6 + 3];
        data.buffer[index++] = _a2;
        data.buffer[index++] = _c2;
        data.buffer[index++] = _b2;
        data.buffer[index++] = _c2;
        data.buffer[index++] = _d2;
        data.buffer[index++] = _b2;
      }
    }
    if (east.indices) {
      for (var _i7 = 0; _i7 < east.size - 2; _i7 += 2) {
        var _a3 = east.indices[_i7 + 0];
        var _b3 = east.indices[_i7 + 1];
        var _c3 = east.indices[_i7 + 2];
        var _d3 = east.indices[_i7 + 3];
        data.buffer[index++] = _a3;
        data.buffer[index++] = _c3;
        data.buffer[index++] = _b3;
        data.buffer[index++] = _c3;
        data.buffer[index++] = _d3;
        data.buffer[index++] = _b3;
      }
    }
    data.primCount = index / 3;
    data.start = this._indexBuffer.length;
    this._indexMap.push(data);
    var temp = new Uint16Array(data.start + data.size);
    temp.set(this._indexBuffer, 0);
    temp.set(data.buffer, data.start);
    this._indexBuffer = temp;
    return data;
  };
  return TerrainLod;
}();

var _dec, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _dec2, _class3, _class4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _dec3, _class5, _class6, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _class7, _class8, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _initializer20;
var TERRAIN_EFFECT_UUID = '1d08ef62-a503-4ce2-8b9a-46c90873f7d3';
var TerrainInfo = (_dec = ccclass('cc.TerrainInfo'), _dec(_class = (_class2 = function () {
  function TerrainInfo() {
    this.tileSize = _initializer && _initializer();
    this.blockCount = _initializer2 && _initializer2();
    this.weightMapSize = _initializer3 && _initializer3();
    this.lightMapSize = _initializer4 && _initializer4();
  }
  return _createClass(TerrainInfo, [{
    key: "size",
    get: function get() {
      var sz = new Size(0, 0);
      sz.width = this.blockCount[0] * TERRAIN_BLOCK_TILE_COMPLEXITY * this.tileSize;
      sz.height = this.blockCount[1] * TERRAIN_BLOCK_TILE_COMPLEXITY * this.tileSize;
      return sz;
    }
  }, {
    key: "tileCount",
    get: function get() {
      var _tileCount = [0, 0];
      _tileCount[0] = this.blockCount[0] * TERRAIN_BLOCK_TILE_COMPLEXITY;
      _tileCount[1] = this.blockCount[1] * TERRAIN_BLOCK_TILE_COMPLEXITY;
      return _tileCount;
    }
  }, {
    key: "vertexCount",
    get: function get() {
      var _vertexCount = this.tileCount;
      _vertexCount[0] += 1;
      _vertexCount[1] += 1;
      return _vertexCount;
    }
  }]);
}(), _initializer = applyDecoratedInitializer(_class2.prototype, "tileSize", [serializable], function () {
  return 1;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "blockCount", [serializable], function () {
  return [1, 1];
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "weightMapSize", [serializable], function () {
  return 128;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "lightMapSize", [serializable], function () {
  return 128;
}), _class2)) || _class);
var TerrainLayer = (_dec2 = ccclass('cc.TerrainLayer'), _dec2(_class3 = (_class4 = function TerrainLayer() {
  this.detailMap = _initializer5 && _initializer5();
  this.normalMap = _initializer6 && _initializer6();
  this.tileSize = _initializer7 && _initializer7();
  this.metallic = _initializer8 && _initializer8();
  this.roughness = _initializer9 && _initializer9();
}, _initializer5 = applyDecoratedInitializer(_class4.prototype, "detailMap", [serializable], function () {
  return null;
}), _initializer6 = applyDecoratedInitializer(_class4.prototype, "normalMap", [serializable], function () {
  return null;
}), _initializer7 = applyDecoratedInitializer(_class4.prototype, "tileSize", [serializable], function () {
  return 1;
}), _initializer8 = applyDecoratedInitializer(_class4.prototype, "metallic", [serializable], function () {
  return 0;
}), _initializer9 = applyDecoratedInitializer(_class4.prototype, "roughness", [serializable], function () {
  return 1;
}), _class4)) || _class3);
var TerrainRenderable = function (_ModelRenderer) {
  function TerrainRenderable() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _ModelRenderer.call.apply(_ModelRenderer, [this].concat(args)) || this;
    _this._model = null;
    _this._meshData = null;
    _this._brushPass = null;
    _this._brushMaterial = null;
    _this._currentMaterial = null;
    _this._currentMaterialLayers = 0;
    _this._lightmap = null;
    return _this;
  }
  _inheritsLoose(TerrainRenderable, _ModelRenderer);
  var _proto = TerrainRenderable.prototype;
  _proto.destroy = function destroy() {
    if (this._model != null) {
      legacyCC.director.root.destroyModel(this._model);
      this._model = null;
    }
    return _ModelRenderer.prototype.destroy.call(this);
  };
  _proto._destroyModel = function _destroyModel() {
    if (this._model != null) {
      legacyCC.director.root.destroyModel(this._model);
      this._model = null;
    }
    if (this._meshData != null) {
      this._meshData.destroy();
      this._meshData = null;
    }
  };
  _proto._invalidMaterial = function _invalidMaterial() {
    if (this._currentMaterial == null) {
      return;
    }
    this._clearMaterials();
    this._brushPass = null;
    this._currentMaterial = null;
    if (this._model != null) {
      this._model.enabled = false;
    }
  };
  _proto._updateMaterial = function _updateMaterial(block, init) {
    if (this._meshData == null || this._model == null) {
      return false;
    }
    var nLayers = block.getMaxLayer();
    if (this._currentMaterial == null || nLayers !== this._currentMaterialLayers) {
      this._currentMaterial = new Material();
      this._currentMaterial.initialize({
        effectAsset: block.getTerrain().getEffectAsset(),
        defines: block._getMaterialDefines(nLayers)
      });
      if (this._brushMaterial !== null) {
        var brushMaterialInstance = new Material();
        brushMaterialInstance.copy(this._brushMaterial);
        this._brushPass = null;
        if (brushMaterialInstance.passes !== null && brushMaterialInstance.passes.length > 0) {
          this._brushPass = brushMaterialInstance.passes[0];
          var passes = this._currentMaterial.passes;
          passes.push(this._brushPass);
          brushMaterialInstance.passes.pop();
        }
      }
      if (init) {
        this._model.initSubModel(0, this._meshData, this._currentMaterial);
      }
      this.setSharedMaterial(this._currentMaterial, 0);
      this._currentMaterialLayers = nLayers;
      this._model.enabled = true;
      this._model.receiveShadow = block.getTerrain().receiveShadow;
      return true;
    }
    return false;
  };
  _proto._updateLightingmap = function _updateLightingmap(texture, uvParam) {
    if (this._model == null) {
      return;
    }
    this._lightmap = texture;
    this._updateReceiveDirLight();
    this._model.updateLightingmap(texture, uvParam);
  };
  _proto._onMaterialModified = function _onMaterialModified(idx, mtl) {
    if (this._model == null) {
      return;
    }
    this._onRebuildPSO(idx, mtl || this._getBuiltinMaterial());
  };
  _proto._onRebuildPSO = function _onRebuildPSO(idx, material) {
    if (this._model) {
      this._model.setSubModelMaterial(idx, material);
    }
  };
  _proto._clearMaterials = function _clearMaterials() {
    if (this._model == null) {
      return;
    }
    this._onMaterialModified(0, null);
  };
  _proto._onUpdateReceiveDirLight = function _onUpdateReceiveDirLight(visibility, forceClose) {
    if (forceClose === void 0) {
      forceClose = false;
    }
    if (!this._model) {
      return;
    }
    if (forceClose) {
      this._model.receiveDirLight = false;
      return;
    }
    if (this.node && (visibility & this.node.layer) === this.node.layer || visibility & this._model.visFlags) {
      this._model.receiveDirLight = true;
    } else {
      this._model.receiveDirLight = false;
    }
  };
  _proto._updateReceiveDirLight = function _updateReceiveDirLight() {
    var scene = this.node.scene;
    if (!scene || !scene.renderScene) {
      return;
    }
    var mainLight = scene.renderScene.mainLight;
    if (!mainLight) {
      return;
    }
    var visibility = mainLight.visibility;
    if (!mainLight.node) {
      return;
    }
    if (mainLight.node.mobility === MobilityMode.Static && this._lightmap) {
      this._onUpdateReceiveDirLight(visibility, true);
    } else {
      this._onUpdateReceiveDirLight(visibility);
    }
  };
  _proto._getBuiltinMaterial = function _getBuiltinMaterial() {
    return builtinResMgr.get('missing-material');
  };
  return TerrainRenderable;
}(ModelRenderer);
var TerrainBlockLightmapInfo = (_dec3 = ccclass('cc.TerrainBlockLightmapInfo'), _dec3(_class5 = (_class6 = function TerrainBlockLightmapInfo() {
  this.texture = _initializer0 && _initializer0();
  this.UOff = _initializer1 && _initializer1();
  this.VOff = _initializer10 && _initializer10();
  this.UScale = _initializer11 && _initializer11();
  this.VScale = _initializer12 && _initializer12();
}, _initializer0 = applyDecoratedInitializer(_class6.prototype, "texture", [serializable], function () {
  return null;
}), _initializer1 = applyDecoratedInitializer(_class6.prototype, "UOff", [serializable], function () {
  return 0;
}), _initializer10 = applyDecoratedInitializer(_class6.prototype, "VOff", [serializable], function () {
  return 0;
}), _initializer11 = applyDecoratedInitializer(_class6.prototype, "UScale", [serializable], function () {
  return 0;
}), _initializer12 = applyDecoratedInitializer(_class6.prototype, "VScale", [serializable], function () {
  return 0;
}), _class6)) || _class5);
var TerrainBlock = function () {
  function TerrainBlock(t, i, j) {
    this._terrain = void 0;
    this._node = void 0;
    this._renderable = void 0;
    this._index = [1, 1];
    this._weightMap = null;
    this._lightmapInfo = null;
    this._lodLevel = 0;
    this._lodKey = new TerrainLodKey();
    this._errorMetrics = [0, 0, 0, 0];
    this._LevelDistances = [TERRAIN_LOD_MAX_DISTANCE, TERRAIN_LOD_MAX_DISTANCE, TERRAIN_LOD_MAX_DISTANCE, TERRAIN_LOD_MAX_DISTANCE];
    this._bbMin = v3();
    this._bbMax = v3();
    this._terrain = t;
    this._index[0] = i;
    this._index[1] = j;
    this._lightmapInfo = t._getLightmapInfo(i, j);
    this._node = new Node('TerrainBlock');
    this._node.setParent(this._terrain.node);
    this._node.hideFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
    this._node.layer = this._terrain.node.layer;
    this._renderable = this._node.addComponent(TerrainRenderable);
  }
  var _proto2 = TerrainBlock.prototype;
  _proto2.build = function build() {
    var gfxDevice = director.root.device;
    var vertexData = new Float32Array(TERRAIN_BLOCK_VERTEX_SIZE * TERRAIN_BLOCK_VERTEX_COMPLEXITY * TERRAIN_BLOCK_VERTEX_COMPLEXITY);
    this._buildVertexData(vertexData);
    var vertexBuffer = gfxDevice.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, TERRAIN_BLOCK_VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT * TERRAIN_BLOCK_VERTEX_COMPLEXITY * TERRAIN_BLOCK_VERTEX_COMPLEXITY, TERRAIN_BLOCK_VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT));
    vertexBuffer.update(vertexData);
    this._buildBoundingBox();
    var gfxAttributes = [new Attribute(AttributeName.ATTR_POSITION, Format.RGB32F), new Attribute(AttributeName.ATTR_NORMAL, Format.RGB32F), new Attribute(AttributeName.ATTR_TEX_COORD, Format.RG32F)];
    this._renderable._meshData = new RenderingSubMesh([vertexBuffer], gfxAttributes, PrimitiveMode.TRIANGLE_LIST, this._terrain._getSharedIndexBuffer(), null, false);
    this._renderable._model = legacyCC.director.root.createModel(Model);
    this._renderable._model.createBoundingShape(this._bbMin, this._bbMax);
    this._renderable._model.node = this._renderable._model.transform = this._node;
    if (this._renderable.node.scene != null) {
      this.visible = true;
    }
    this._updateWeightMap();
    this._updateMaterial(true);
    if (this._terrain.lodEnable) {
      this._updateLodBuffer(vertexData);
      this._updateIndexBuffer();
    }
  };
  _proto2.rebuild = function rebuild() {
    this._updateHeight();
    this._updateWeightMap();
    this._renderable._invalidMaterial();
    this._updateMaterial(false);
  };
  _proto2.destroy = function destroy() {
    this.visible = false;
    this._renderable._destroyModel();
    if (this._node != null && this._node.isValid) {
      this._node.destroy();
    }
    if (this._weightMap != null) {
      this._weightMap.destroy();
    }
  };
  _proto2.update = function update() {
    this._updateMaterial(false);
    if (this.lightmap !== this._renderable._lightmap) {
      this._renderable._updateLightingmap(this.lightmap, this.lightmapUVParam);
    }
    var useNormalMap = this._terrain.useNormalMap;
    var usePBR = this._terrain.usePBR;
    var getDetailTex = function getDetailTex(layer) {
      return layer !== null ? layer.detailMap : null;
    };
    var getNormalTex = function getNormalTex(layer) {
      var normalTex = layer !== null ? layer.normalMap : null;
      if (normalTex === null) {
        normalTex = builtinResMgr.get('normal-texture');
      }
      return normalTex;
    };
    var mtl = this._renderable._currentMaterial;
    if (mtl !== null) {
      var nLayers = this.getMaxLayer();
      var uvScale = new Vec4(1, 1, 1, 1);
      var roughness = new Vec4(1, 1, 1, 1);
      var metallic = new Vec4(0, 0, 0, 0);
      if (nLayers === 0) {
        if (this.layers[0] !== -1) {
          var l0 = this._terrain.getLayer(this.layers[0]);
          if (l0 !== null) {
            uvScale.x = 1.0 / l0.tileSize;
            roughness.x = l0.roughness;
            metallic.x = l0.metallic;
          }
          mtl.setProperty('detailMap0', getDetailTex(l0));
          if (useNormalMap) {
            mtl.setProperty('normalMap0', getNormalTex(l0));
          }
        } else {
          mtl.setProperty('detailMap0', builtinResMgr.get('default-texture'));
          if (useNormalMap) {
            mtl.setProperty('normalMap0', builtinResMgr.get('normal-texture'));
          }
        }
      } else if (nLayers === 1) {
        var _l = this._terrain.getLayer(this.layers[0]);
        var l1 = this._terrain.getLayer(this.layers[1]);
        if (_l !== null) {
          uvScale.x = 1.0 / _l.tileSize;
          roughness.x = _l.roughness;
          metallic.x = _l.metallic;
        }
        if (l1 !== null) {
          uvScale.y = 1.0 / l1.tileSize;
          roughness.y = l1.roughness;
          metallic.y = l1.metallic;
        }
        mtl.setProperty('weightMap', this._weightMap);
        mtl.setProperty('detailMap0', getDetailTex(_l));
        mtl.setProperty('detailMap1', getDetailTex(l1));
        if (useNormalMap) {
          mtl.setProperty('normalMap0', getNormalTex(_l));
          mtl.setProperty('normalMap1', getNormalTex(l1));
        }
      } else if (nLayers === 2) {
        var _l2 = this._terrain.getLayer(this.layers[0]);
        var _l3 = this._terrain.getLayer(this.layers[1]);
        var l2 = this._terrain.getLayer(this.layers[2]);
        if (_l2 !== null) {
          uvScale.x = 1.0 / _l2.tileSize;
          roughness.x = _l2.roughness;
          metallic.x = _l2.metallic;
        }
        if (_l3 !== null) {
          uvScale.y = 1.0 / _l3.tileSize;
          roughness.y = _l3.roughness;
          metallic.y = _l3.metallic;
        }
        if (l2 !== null) {
          uvScale.z = 1.0 / l2.tileSize;
          roughness.z = l2.roughness;
          metallic.z = l2.metallic;
        }
        mtl.setProperty('weightMap', this._weightMap);
        mtl.setProperty('detailMap0', getDetailTex(_l2));
        mtl.setProperty('detailMap1', getDetailTex(_l3));
        mtl.setProperty('detailMap2', getDetailTex(l2));
        if (useNormalMap) {
          mtl.setProperty('normalMap0', getNormalTex(_l2));
          mtl.setProperty('normalMap1', getNormalTex(_l3));
          mtl.setProperty('normalMap2', getNormalTex(l2));
        }
      } else if (nLayers === 3) {
        var _l4 = this._terrain.getLayer(this.layers[0]);
        var _l5 = this._terrain.getLayer(this.layers[1]);
        var _l6 = this._terrain.getLayer(this.layers[2]);
        var l3 = this._terrain.getLayer(this.layers[3]);
        if (_l4 !== null) {
          uvScale.x = 1.0 / _l4.tileSize;
          roughness.x = _l4.roughness;
          metallic.x = _l4.metallic;
        }
        if (_l5 !== null) {
          uvScale.y = 1.0 / _l5.tileSize;
          roughness.y = _l5.roughness;
          metallic.y = _l5.metallic;
        }
        if (_l6 !== null) {
          uvScale.z = 1.0 / _l6.tileSize;
          roughness.z = _l6.roughness;
          metallic.z = _l6.metallic;
        }
        if (l3 !== null) {
          uvScale.w = 1.0 / l3.tileSize;
          roughness.w = l3.roughness;
          metallic.w = l3.metallic;
        }
        mtl.setProperty('weightMap', this._weightMap);
        mtl.setProperty('detailMap0', getDetailTex(_l4));
        mtl.setProperty('detailMap1', getDetailTex(_l5));
        mtl.setProperty('detailMap2', getDetailTex(_l6));
        mtl.setProperty('detailMap3', getDetailTex(l3));
        if (useNormalMap) {
          mtl.setProperty('normalMap0', getNormalTex(_l4));
          mtl.setProperty('normalMap1', getNormalTex(_l5));
          mtl.setProperty('normalMap2', getNormalTex(_l6));
          mtl.setProperty('normalMap3', getNormalTex(l3));
        }
      }
      mtl.setProperty('UVScale', uvScale);
      if (usePBR) {
        mtl.setProperty('roughness', roughness);
        mtl.setProperty('metallic', metallic);
      }
    }
  };
  _proto2._buildLodInfo = function _buildLodInfo() {
    var vertexData = new Float32Array(TERRAIN_BLOCK_VERTEX_SIZE * TERRAIN_BLOCK_VERTEX_COMPLEXITY * TERRAIN_BLOCK_VERTEX_COMPLEXITY);
    this._buildVertexData(vertexData);
    this._updateLodBuffer(vertexData);
    this._updateIndexBuffer();
  };
  _proto2._updateLevel = function _updateLevel(camPos) {
    var terrain = this._terrain;
    var terrainNode = terrain.node;
    var maxLevel = TERRAIN_LOD_LEVELS - 1;
    var bbMin = v3();
    var bbMax = v3();
    Vec3.add(bbMin, this._bbMin, terrainNode.worldPosition);
    Vec3.add(bbMax, this._bbMax, terrainNode.worldPosition);
    var d1 = Vec3.distance(bbMin, camPos);
    var d2 = Vec3.distance(bbMax, camPos);
    var d = Math.min(d1, d2);
    d -= terrain.LodBias;
    this._lodLevel = 0;
    while (this._lodLevel < maxLevel) {
      var ld1 = this._LevelDistances[this._lodLevel + 1];
      if (d <= ld1) {
        break;
      }
      ++this._lodLevel;
    }
  };
  _proto2.setBrushMaterial = function setBrushMaterial(mtl) {
    if (this._renderable._brushMaterial !== mtl) {
      this._renderable._invalidMaterial();
      this._renderable._brushMaterial = mtl;
    }
  };
  _proto2._getBrushMaterial = function _getBrushMaterial() {
    return this._renderable ? this._renderable._brushMaterial : null;
  };
  _proto2._getBrushPass = function _getBrushPass() {
    return this._renderable ? this._renderable._brushPass : null;
  };
  _proto2.getTerrain = function getTerrain() {
    return this._terrain;
  };
  _proto2.getIndex = function getIndex() {
    return this._index;
  };
  _proto2.getRect = function getRect() {
    var rect = new Rect();
    rect.x = this._index[0] * TERRAIN_BLOCK_TILE_COMPLEXITY;
    rect.y = this._index[1] * TERRAIN_BLOCK_TILE_COMPLEXITY;
    rect.width = TERRAIN_BLOCK_TILE_COMPLEXITY;
    rect.height = TERRAIN_BLOCK_TILE_COMPLEXITY;
    return rect;
  };
  _proto2.setLayer = function setLayer(index, layerId) {
    if (this.layers[index] !== layerId) {
      this._terrain.setBlockLayer(this._index[0], this._index[1], index, layerId);
      this._renderable._invalidMaterial();
      this._updateMaterial(false);
    }
  };
  _proto2.getLayer = function getLayer(index) {
    return this.layers[index];
  };
  _proto2.getMaxLayer = function getMaxLayer() {
    if (this.layers[3] >= 0) {
      return 3;
    }
    if (this.layers[2] >= 0) {
      return 2;
    }
    if (this.layers[1] >= 0) {
      return 1;
    }
    return 0;
  };
  _proto2._getMaterialDefines = function _getMaterialDefines(nLayers) {
    var lightmapMacroValue = 1;
    if (this._terrain.node && this._terrain.node.scene) {
      if (this._terrain.node.scene.globals.bakedWithStationaryMainLight) {
        lightmapMacroValue = 2;
      }
    }
    return {
      LAYERS: nLayers + 1,
      CC_USE_LIGHTMAP: this.lightmap !== null ? lightmapMacroValue : 0,
      USE_NORMALMAP: this._terrain.useNormalMap ? 1 : 0,
      USE_PBR: this._terrain.usePBR ? 1 : 0
    };
  };
  _proto2._invalidMaterial = function _invalidMaterial() {
    this._renderable._invalidMaterial();
  };
  _proto2._updateMaterial = function _updateMaterial(init) {
    if (this._renderable._updateMaterial(this, init)) {
      if (this.lightmap !== null) {
        this.lightmap.setWrapMode(WrapMode.CLAMP_TO_BORDER, WrapMode.CLAMP_TO_BORDER);
      }
      this._renderable._updateLightingmap(this.lightmap, this.lightmapUVParam);
    }
  };
  _proto2._updateHeight = function _updateHeight() {
    if (this._renderable._meshData == null) {
      return;
    }
    var vertexData = new Float32Array(TERRAIN_BLOCK_VERTEX_SIZE * TERRAIN_BLOCK_VERTEX_COMPLEXITY * TERRAIN_BLOCK_VERTEX_COMPLEXITY);
    this._buildVertexData(vertexData);
    this._renderable._meshData.vertexBuffers[0].update(vertexData);
    this._buildBoundingBox();
    this._renderable._model.createBoundingShape(this._bbMin, this._bbMax);
    this._renderable._model.updateWorldBound();
    this._updateLodBuffer(vertexData);
    this._updateIndexBuffer();
  };
  _proto2._updateWeightMap = function _updateWeightMap() {
    var nLayers = this.getMaxLayer();
    if (nLayers === 0) {
      if (this._weightMap != null) {
        this._weightMap.destroy();
        this._weightMap = null;
      }
      return;
    }
    if (this._weightMap == null) {
      this._weightMap = new Texture2D();
      this._weightMap.create(this._terrain.weightMapSize, this._terrain.weightMapSize, PixelFormat.RGBA8888);
      this._weightMap.setFilters(TextureFilter.LINEAR, TextureFilter.LINEAR);
      this._weightMap.setWrapMode(WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE);
    }
    var weightData = new Uint8Array(this._terrain.weightMapSize * this._terrain.weightMapSize * 4);
    var weightIndex = 0;
    for (var j = 0; j < this._terrain.weightMapSize; ++j) {
      for (var i = 0; i < this._terrain.weightMapSize; ++i) {
        var x = this._index[0] * this._terrain.weightMapSize + i;
        var y = this._index[1] * this._terrain.weightMapSize + j;
        var w = this._terrain.getWeight(x, y);
        weightData[weightIndex * 4 + 0] = Math.floor(w.x * 255);
        weightData[weightIndex * 4 + 1] = Math.floor(w.y * 255);
        weightData[weightIndex * 4 + 2] = Math.floor(w.z * 255);
        weightData[weightIndex * 4 + 3] = Math.floor(w.w * 255);
        weightIndex += 1;
      }
    }
    this._weightMap.uploadData(weightData);
  };
  _proto2._updateLightmap = function _updateLightmap(info) {
    this._lightmapInfo = info;
    this._invalidMaterial();
  };
  _proto2._updateLod = function _updateLod() {
    var key = new TerrainLodKey();
    key.level = this._lodLevel;
    key.north = this._lodLevel;
    key.south = this._lodLevel;
    key.west = this._lodLevel;
    key.east = this._lodLevel;
    if (this._index[0] > 0) {
      var n = this.getTerrain().getBlock(this._index[0] - 1, this._index[1]);
      key.west = n._lodLevel;
      if (key.west < this._lodLevel) {
        key.west = this._lodLevel;
      }
    }
    if (this._index[0] < this._terrain.info.blockCount[0] - 1) {
      var _n = this.getTerrain().getBlock(this._index[0] + 1, this._index[1]);
      key.east = _n._lodLevel;
      if (key.east < this._lodLevel) {
        key.east = this._lodLevel;
      }
    }
    if (this._index[1] > 0) {
      var _n2 = this.getTerrain().getBlock(this._index[0], this._index[1] - 1);
      key.north = _n2._lodLevel;
      if (key.north < this._lodLevel) {
        key.north = this._lodLevel;
      }
    }
    if (this._index[1] < this._terrain.info.blockCount[1] - 1) {
      var _n3 = this.getTerrain().getBlock(this._index[0], this._index[1] + 1);
      key.south = _n3._lodLevel;
      if (key.south < this._lodLevel) {
        key.south = this._lodLevel;
      }
    }
    if (this._lodKey.equals(key)) {
      return;
    }
    this._lodKey = key;
    this._updateIndexBuffer();
  };
  _proto2._resetLod = function _resetLod() {
    var key = new TerrainLodKey();
    key.level = 0;
    key.north = 0;
    key.south = 0;
    key.west = 0;
    key.east = 0;
    if (this._lodKey.equals(key)) {
      return;
    }
    this._lodKey = key;
    this._updateIndexBuffer();
  };
  _proto2._updateIndexBuffer = function _updateIndexBuffer() {
    if (this._renderable._meshData === null) {
      return;
    }
    if (this._renderable._model === null) {
      return;
    }
    if (this._renderable._model.subModels.length === 0) {
      return;
    }
    var indexData = this._terrain._getIndexData(this._lodKey);
    if (indexData === null) {
      return;
    }
    var model = this._renderable._model.subModels[0];
    model.inputAssembler.firstIndex = indexData.start;
    model.inputAssembler.indexCount = indexData.size;
  };
  _proto2._getHeight = function _getHeight(x, y, verts) {
    var idx = TERRAIN_BLOCK_VERTEX_COMPLEXITY * y + x;
    return verts[idx * TERRAIN_BLOCK_VERTEX_SIZE + 1];
  };
  _proto2._updateLodBuffer = function _updateLodBuffer(vertices) {
    this._lodLevel = 0;
    this._lodKey = new TerrainLodKey();
    this._calcErrorMetrics(vertices);
    this._calcLevelDistances(vertices);
  };
  _proto2._calcErrorMetrics = function _calcErrorMetrics(vertices) {
    this._errorMetrics[0] = 0;
    for (var i = 1; i < TERRAIN_LOD_LEVELS; ++i) {
      this._errorMetrics[i] = this._calcErrorMetric(i, vertices);
    }
    for (var _i2 = 2; _i2 < TERRAIN_LOD_LEVELS; ++_i2) {
      this._errorMetrics[_i2] = Math.max(this._errorMetrics[_i2], this._errorMetrics[_i2 - 1]);
    }
  };
  _proto2._calcErrorMetric = function _calcErrorMetric(level, vertices) {
    var err = 0.0;
    var step = 1 << level;
    var xSectionVertices = TERRAIN_BLOCK_VERTEX_COMPLEXITY;
    var ySectionVertices = TERRAIN_BLOCK_VERTEX_COMPLEXITY;
    var xSides = xSectionVertices - 1 >> level;
    var ySides = ySectionVertices - 1 >> level;
    for (var y = 0; y < ySectionVertices; y += step) {
      for (var x = 0; x < xSides; ++x) {
        var x0 = x * step;
        var x1 = x0 + step;
        var xm = (x1 + x0) / 2;
        var h0 = this._getHeight(x0, y, vertices);
        var h1 = this._getHeight(x1, y, vertices);
        var hm = this._getHeight(xm, y, vertices);
        var hmi = (h0 + h1) / 2;
        var delta = Math.abs(hm - hmi);
        err = Math.max(err, delta);
      }
    }
    for (var _x2 = 0; _x2 < xSectionVertices; _x2 += step) {
      for (var _y2 = 0; _y2 < ySides; ++_y2) {
        var y0 = _y2 * step;
        var y1 = y0 + step;
        var ym = (y0 + y1) / 2;
        var _h = this._getHeight(_x2, y0, vertices);
        var _h2 = this._getHeight(_x2, y1, vertices);
        var _hm = this._getHeight(_x2, ym, vertices);
        var _hmi = (_h + _h2) / 2;
        var _delta = Math.abs(_hm - _hmi);
        err = Math.max(err, _delta);
      }
    }
    for (var _y3 = 0; _y3 < ySides; ++_y3) {
      var _y4 = _y3 * step;
      var _y5 = _y4 + step;
      var _ym = (_y4 + _y5) / 2;
      for (var _x3 = 0; _x3 < xSides; ++_x3) {
        var _x4 = _x3 * step;
        var _x5 = _x4 + step;
        var _xm = (_x4 + _x5) / 2;
        var _h3 = this._getHeight(_x4, _y4, vertices);
        var _h4 = this._getHeight(_x5, _y5, vertices);
        var _hm2 = this._getHeight(_xm, _ym, vertices);
        var _hmi2 = (_h3 + _h4) / 2;
        var _delta2 = Math.abs(_hm2 - _hmi2);
        err = Math.max(err, _delta2);
      }
    }
    return err;
  };
  _proto2._calcLevelDistances = function _calcLevelDistances(vertices) {
    var pixelErr = 4;
    var resolution = 768;
    var c = 1.0 / (2 * pixelErr / resolution);
    for (var i = 1; i < TERRAIN_LOD_LEVELS; ++i) {
      var e = this._errorMetrics[i];
      var d = e * c;
      this._LevelDistances[i] = d;
    }
  };
  _proto2._buildVertexData = function _buildVertexData(vertexData) {
    var index = 0;
    for (var j = 0; j < TERRAIN_BLOCK_VERTEX_COMPLEXITY; ++j) {
      for (var i = 0; i < TERRAIN_BLOCK_VERTEX_COMPLEXITY; ++i) {
        var x = this._index[0] * TERRAIN_BLOCK_TILE_COMPLEXITY + i;
        var y = this._index[1] * TERRAIN_BLOCK_TILE_COMPLEXITY + j;
        var position = this._terrain.getPosition(x, y);
        var normal = this._terrain.getNormal(x, y);
        var uv = new Vec2(i / TERRAIN_BLOCK_TILE_COMPLEXITY, j / TERRAIN_BLOCK_TILE_COMPLEXITY);
        vertexData[index++] = position.x;
        vertexData[index++] = position.y;
        vertexData[index++] = position.z;
        vertexData[index++] = normal.x;
        vertexData[index++] = normal.y;
        vertexData[index++] = normal.z;
        vertexData[index++] = uv.x;
        vertexData[index++] = uv.y;
      }
    }
  };
  _proto2._buildBoundingBox = function _buildBoundingBox() {
    this._bbMin.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    this._bbMax.set(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    for (var j = 0; j < TERRAIN_BLOCK_VERTEX_COMPLEXITY; ++j) {
      for (var i = 0; i < TERRAIN_BLOCK_VERTEX_COMPLEXITY; ++i) {
        var x = this._index[0] * TERRAIN_BLOCK_TILE_COMPLEXITY + i;
        var y = this._index[1] * TERRAIN_BLOCK_TILE_COMPLEXITY + j;
        var position = this._terrain.getPosition(x, y);
        Vec3.min(this._bbMin, this._bbMin, position);
        Vec3.max(this._bbMax, this._bbMax, position);
      }
    }
  };
  return _createClass(TerrainBlock, [{
    key: "valid",
    get: function get() {
      if (this._terrain === null) {
        return false;
      }
      var blocks = this._terrain.getBlocks();
      for (var i = 0; i < blocks.length; ++i) {
        if (blocks[i] === this) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: "material",
    get: function get() {
      return this._renderable ? this._renderable._currentMaterial : null;
    }
  }, {
    key: "layers",
    get: function get() {
      return this._terrain.getBlockLayers(this._index[0], this._index[1]);
    }
  }, {
    key: "weightmap",
    get: function get() {
      return this._weightMap;
    }
  }, {
    key: "lightmap",
    get: function get() {
      return this._lightmapInfo ? this._lightmapInfo.texture : null;
    }
  }, {
    key: "lightmapUVParam",
    get: function get() {
      if (this._lightmapInfo != null) {
        return new Vec4(this._lightmapInfo.UOff, this._lightmapInfo.VOff, this._lightmapInfo.UScale, this._lightmapInfo.VScale);
      }
      return new Vec4(0, 0, 0, 0);
    }
  }, {
    key: "visible",
    get: function get() {
      if (this._renderable._model !== null) {
        return this._renderable._model.scene !== null;
      }
      return false;
    },
    set: function set(val) {
      if (this._renderable._model !== null) {
        if (val) {
          if (this._terrain.node != null && this._terrain.node.scene != null && this._terrain.node.scene.renderScene != null && this._renderable._model.scene == null) {
            this._terrain.node.scene.renderScene.addModel(this._renderable._model);
          }
        } else if (this._renderable._model.scene !== null) {
          this._renderable._model.scene.removeModel(this._renderable._model);
        }
      }
    }
  }]);
}();
var Terrain = (_dec4 = ccclass('cc.Terrain'), _dec5 = type(TerrainAsset), _dec6 = type(EffectAsset), _dec7 = type(TerrainBlockLightmapInfo), _dec8 = type(CCFloat), _dec9 = type(TerrainAsset), _dec0 = type(EffectAsset), _dec1 = type(TerrainInfo), _dec4(_class7 = disallowMultiple(_class7 = (_class8 = function (_Component) {
  function Terrain() {
    var _this2;
    _this2 = _Component.call(this) || this;
    _this2.__asset = _initializer13 && _initializer13();
    _this2._effectAsset = _initializer14 && _initializer14();
    _this2._lightmapInfos = _initializer15 && _initializer15();
    _this2._receiveShadow = _initializer16 && _initializer16();
    _this2._useNormalmap = _initializer17 && _initializer17();
    _this2._usePBR = _initializer18 && _initializer18();
    _this2._lodEnable = _initializer19 && _initializer19();
    _this2._lodBias = _initializer20 && _initializer20();
    _this2._buitinAsset = null;
    _this2._tileSize = 1;
    _this2._blockCount = [1, 1];
    _this2._weightMapSize = 128;
    _this2._lightMapSize = 128;
    _this2._heights = new Uint16Array();
    _this2._weights = new Uint8Array();
    _this2._normals = new Float32Array();
    _this2._layerList = [];
    _this2._layerBuffer = [];
    _this2._blocks = [];
    _this2._lod = null;
    _this2._sharedIndexBuffer = null;
    _this2._sharedLodIndexBuffer = null;
    for (var i = 0; i < TERRAIN_MAX_LAYER_COUNT; ++i) {
      _this2._layerList.push(null);
    }
    return _this2;
  }
  _inheritsLoose(Terrain, _Component);
  var _proto3 = Terrain.prototype;
  _proto3.build = function build(info) {
    this._tileSize = info.tileSize;
    this._blockCount[0] = info.blockCount[0];
    this._blockCount[1] = info.blockCount[1];
    this._weightMapSize = info.weightMapSize;
    this._lightMapSize = info.lightMapSize;
    return this._buildImp();
  };
  _proto3.rebuild = function rebuild(info) {
    for (var i = 0; i < this._blocks.length; ++i) {
      this._blocks[i].destroy();
    }
    this._blocks = [];
    this._resetLightmap(false);
    this._rebuildLayerBuffer(info);
    var heightsChanged = this._rebuildHeights(info);
    this._rebuildWeights(info);
    this._tileSize = info.tileSize;
    this._blockCount[0] = info.blockCount[0];
    this._blockCount[1] = info.blockCount[1];
    this._weightMapSize = info.weightMapSize;
    this._lightMapSize = info.lightMapSize;
    if (heightsChanged) {
      this._normals = new Float32Array(this.heights.length * 3);
      this._buildNormals();
    }
    for (var j = 0; j < this._blockCount[1]; ++j) {
      for (var _i3 = 0; _i3 < this._blockCount[0]; ++_i3) {
        this._blocks.push(new TerrainBlock(this, _i3, j));
      }
    }
    for (var _i4 = 0; _i4 < this._blocks.length; ++_i4) {
      this._blocks[_i4].build();
    }
  };
  _proto3.importHeightField = function importHeightField(hf, heightScale) {
    var index = 0;
    for (var j = 0; j < this.vertexCount[1]; ++j) {
      for (var i = 0; i < this.vertexCount[0]; ++i) {
        var u = i / this.tileCount[0];
        var v = j / this.tileCount[1];
        var h = hf.getAt(u * hf.w, v * hf.h) * heightScale;
        this._heights[index++] = h;
      }
    }
    this._buildNormals();
    for (var _i5 = 0; _i5 < this._blocks.length; ++_i5) {
      this._blocks[_i5]._updateHeight();
    }
  };
  _proto3.exportHeightField = function exportHeightField(hf, heightScale) {
    var index = 0;
    for (var j = 0; j < hf.h; ++j) {
      for (var i = 0; i < hf.w; ++i) {
        var u = i / (hf.w - 1);
        var v = j / (hf.h - 1);
        var x = u * this.size.width;
        var y = v * this.size.height;
        var h = this.getHeightAt(x, y);
        if (h != null) {
          hf.data[index++] = h * heightScale;
        }
      }
    }
  };
  _proto3.exportAsset = function exportAsset() {
    var asset = new TerrainAsset();
    asset.tileSize = this.tileSize;
    asset.blockCount = this.blockCount;
    asset.lightMapSize = this.lightMapSize;
    asset.weightMapSize = this.weightMapSize;
    asset.heights = this.heights;
    asset.weights = this.weights;
    asset.layerBuffer = new Array(this._blocks.length * 4);
    for (var i = 0; i < this._blocks.length; ++i) {
      asset.layerBuffer[i * 4 + 0] = this._blocks[i].layers[0];
      asset.layerBuffer[i * 4 + 1] = this._blocks[i].layers[1];
      asset.layerBuffer[i * 4 + 2] = this._blocks[i].layers[2];
      asset.layerBuffer[i * 4 + 3] = this._blocks[i].layers[3];
    }
    this.exportLayerListToAsset(asset);
    return asset;
  };
  _proto3.exportLayerListToAsset = function exportLayerListToAsset(asset) {
    asset.layerInfos.length = 0;
    for (var i = 0; i < this._layerList.length; ++i) {
      var temp = this._layerList[i];
      if (temp && temp.detailMap && isValid(temp.detailMap)) {
        var layer = new TerrainLayerInfo();
        layer.slot = i;
        layer.tileSize = temp.tileSize;
        layer.detailMap = temp.detailMap;
        layer.normalMap = temp.normalMap;
        layer.metallic = temp.metallic;
        layer.roughness = temp.roughness;
        asset.layerInfos.push(layer);
      }
    }
  };
  _proto3.getEffectAsset = function getEffectAsset() {
    if (this._effectAsset === null) {
      return legacyCC.EffectAsset.get(TERRAIN_EFFECT_UUID);
    }
    return this._effectAsset;
  };
  _proto3.onEnable = function onEnable() {
    if (this._blocks.length === 0) {
      this._buildImp();
    }
    for (var i = 0; i < this._blocks.length; ++i) {
      this._blocks[i].visible = true;
    }
    legacyCC.director.root.pipelineEvent.on(PipelineEventType.RENDER_CAMERA_BEGIN, this.onUpdateFromCamera, this);
  };
  _proto3.onDisable = function onDisable() {
    legacyCC.director.root.pipelineEvent.off(PipelineEventType.RENDER_CAMERA_BEGIN, this.onUpdateFromCamera, this);
    for (var i = 0; i < this._blocks.length; ++i) {
      this._blocks[i].visible = false;
    }
  };
  _proto3.onDestroy = function onDestroy() {
    for (var i = 0; i < this._blocks.length; ++i) {
      this._blocks[i].destroy();
    }
    this._blocks = [];
    for (var _i6 = 0; _i6 < this._layerList.length; ++_i6) {
      this._layerList[_i6] = null;
    }
    if (this._sharedIndexBuffer != null) {
      this._sharedIndexBuffer.destroy();
    }
    if (this._sharedLodIndexBuffer != null) {
      this._sharedLodIndexBuffer.destroy();
    }
  };
  _proto3.onRestore = function onRestore() {
    this.onEnable();
    this._buildImp(true);
  };
  _proto3.update = function update(deltaTime) {
    for (var i = 0; i < this._blocks.length; ++i) {
      this._blocks[i].update();
    }
  };
  _proto3.onUpdateFromCamera = function onUpdateFromCamera(cam) {
    if (!this.lodEnable || this._sharedLodIndexBuffer == null) {
      return;
    }
    if (cam.scene !== this._getRenderScene()) {
      return;
    }
    for (var i = 0; i < this._blocks.length; ++i) {
      this._blocks[i]._updateLevel(cam.position);
    }
    for (var _i7 = 0; _i7 < this._blocks.length; ++_i7) {
      this._blocks[_i7]._updateLod();
    }
  };
  _proto3.addLayer = function addLayer(layer) {
    for (var i = 0; i < this._layerList.length; ++i) {
      var _this$_layerList$i;
      if (this._layerList[i] === null || this._layerList[i] && ((_this$_layerList$i = this._layerList[i]) == null ? void 0 : _this$_layerList$i.detailMap) === null) {
        this._layerList[i] = layer;
        if (this._asset) {
          this.exportLayerListToAsset(this._asset);
        }
        return i;
      }
    }
    return -1;
  };
  _proto3.setLayer = function setLayer(i, layer) {
    this._layerList[i] = layer;
    if (this._asset) {
      this.exportLayerListToAsset(this._asset);
    }
  };
  _proto3.removeLayer = function removeLayer(id) {
    this._layerList[id] = null;
    if (this._asset) {
      this.exportLayerListToAsset(this._asset);
    }
  };
  _proto3.getLayer = function getLayer(id) {
    if (id === -1) {
      return null;
    }
    return this._layerList[id];
  };
  _proto3.getPosition = function getPosition(i, j) {
    var x = i * this._tileSize;
    var z = j * this._tileSize;
    var y = this.getHeight(i, j);
    return v3(x, y, z);
  };
  _proto3.getHeightField = function getHeightField() {
    return this._heights;
  };
  _proto3.setHeight = function setHeight(i, j, h) {
    h = clamp(h, TERRAIN_HEIGHT_FMIN, TERRAIN_HEIGHT_FMAX);
    this._heights[j * this.vertexCount[0] + i] = TERRAIN_HEIGHT_BASE + h / TERRAIN_HEIGHT_FACTORY;
  };
  _proto3.getHeight = function getHeight(i, j) {
    return (this._heights[j * this.vertexCount[0] + i] - TERRAIN_HEIGHT_BASE) * TERRAIN_HEIGHT_FACTORY;
  };
  _proto3.getHeightClamp = function getHeightClamp(i, j) {
    i = clamp(i, 0, this.vertexCount[0] - 1);
    j = clamp(j, 0, this.vertexCount[1] - 1);
    return this.getHeight(i, j);
  };
  _proto3.getHeightAt = function getHeightAt(x, y) {
    var fx = x / this.tileSize;
    var fy = y / this.tileSize;
    var ix0 = Math.floor(fx);
    var iz0 = Math.floor(fy);
    var ix1 = ix0 + 1;
    var iz1 = iz0 + 1;
    var dx = fx - ix0;
    var dz = fy - iz0;
    if (ix0 < 0 || ix0 > this.vertexCount[0] - 1 || iz0 < 0 || iz0 > this.vertexCount[1] - 1) {
      return null;
    }
    ix0 = clamp(ix0, 0, this.vertexCount[0] - 1);
    iz0 = clamp(iz0, 0, this.vertexCount[1] - 1);
    ix1 = clamp(ix1, 0, this.vertexCount[0] - 1);
    iz1 = clamp(iz1, 0, this.vertexCount[1] - 1);
    var a = this.getHeight(ix0, iz0);
    var b = this.getHeight(ix1, iz0);
    var c = this.getHeight(ix0, iz1);
    var d = this.getHeight(ix1, iz1);
    var m = (b + c) * 0.5;
    if (dx + dz <= 1.0) {
      d = m + (m - a);
    } else {
      a = m + (m - d);
    }
    var h1 = a * (1.0 - dx) + b * dx;
    var h2 = c * (1.0 - dx) + d * dx;
    var h = h1 * (1.0 - dz) + h2 * dz;
    return h;
  };
  _proto3._setNormal = function _setNormal(i, j, n) {
    var index = j * this.vertexCount[0] + i;
    this._normals[index * 3 + 0] = n.x;
    this._normals[index * 3 + 1] = n.y;
    this._normals[index * 3 + 2] = n.z;
  };
  _proto3.getNormal = function getNormal(i, j) {
    var index = j * this.vertexCount[0] + i;
    var n = v3();
    n.x = this._normals[index * 3 + 0];
    n.y = this._normals[index * 3 + 1];
    n.z = this._normals[index * 3 + 2];
    return n;
  };
  _proto3.getNormalAt = function getNormalAt(x, y) {
    var fx = x / this.tileSize;
    var fy = y / this.tileSize;
    var ix0 = Math.floor(fx);
    var iz0 = Math.floor(fy);
    var ix1 = ix0 + 1;
    var iz1 = iz0 + 1;
    var dx = fx - ix0;
    var dz = fy - iz0;
    if (ix0 < 0 || ix0 > this.vertexCount[0] - 1 || iz0 < 0 || iz0 > this.vertexCount[1] - 1) {
      return null;
    }
    ix0 = clamp(ix0, 0, this.vertexCount[0] - 1);
    iz0 = clamp(iz0, 0, this.vertexCount[1] - 1);
    ix1 = clamp(ix1, 0, this.vertexCount[0] - 1);
    iz1 = clamp(iz1, 0, this.vertexCount[1] - 1);
    var a = this.getNormal(ix0, iz0);
    var b = this.getNormal(ix1, iz0);
    var c = this.getNormal(ix0, iz1);
    var d = this.getNormal(ix1, iz1);
    var m = v3();
    Vec3.add(m, b, c).multiplyScalar(0.5);
    if (dx + dz <= 1.0) {
      d.set(m);
      d.subtract(a);
      d.add(m);
    } else {
      a.set(m);
      a.subtract(d);
      a.add(m);
    }
    var n1 = v3();
    var n2 = v3();
    var n = v3();
    Vec3.lerp(n1, a, b, dx);
    Vec3.lerp(n2, c, d, dx);
    Vec3.lerp(n, n1, n2, dz);
    return n;
  };
  _proto3.setWeight = function setWeight(i, j, w) {
    var index = j * this._weightMapSize * this._blockCount[0] + i;
    this._weights[index * 4 + 0] = w.x * 255;
    this._weights[index * 4 + 1] = w.y * 255;
    this._weights[index * 4 + 2] = w.z * 255;
    this._weights[index * 4 + 3] = w.w * 255;
  };
  _proto3.getWeight = function getWeight(i, j) {
    var index = j * this._weightMapSize * this._blockCount[0] + i;
    var w = new Vec4();
    w.x = this._weights[index * 4 + 0] / 255.0;
    w.y = this._weights[index * 4 + 1] / 255.0;
    w.z = this._weights[index * 4 + 2] / 255.0;
    w.w = this._weights[index * 4 + 3] / 255.0;
    return w;
  };
  _proto3.getWeightAt = function getWeightAt(x, y) {
    var uWeightComplexity = this.weightMapSize * this.blockCount[0];
    var vWeightComplexity = this.weightMapSize * this.blockCount[1];
    if (uWeightComplexity === 0 || vWeightComplexity === 0) {
      return null;
    }
    var fx = x / uWeightComplexity;
    var fy = y / vWeightComplexity;
    var ix0 = Math.floor(fx);
    var iz0 = Math.floor(fy);
    var ix1 = ix0 + 1;
    var iz1 = iz0 + 1;
    var dx = fx - ix0;
    var dz = fy - iz0;
    if (ix0 < 0 || ix0 > uWeightComplexity - 1 || iz0 < 0 || iz0 > vWeightComplexity - 1) {
      return null;
    }
    ix0 = clamp(ix0, 0, uWeightComplexity - 1);
    iz0 = clamp(iz0, 0, vWeightComplexity - 1);
    ix1 = clamp(ix1, 0, uWeightComplexity - 1);
    iz1 = clamp(iz1, 0, vWeightComplexity - 1);
    var a = this.getWeight(ix0, iz0);
    var b = this.getWeight(ix1, iz0);
    var c = this.getWeight(ix0, iz1);
    var d = this.getWeight(ix1, iz1);
    var m = new Vec4();
    Vec4.add(m, b, c).multiplyScalar(0.5);
    if (dx + dz <= 1.0) {
      d = new Vec4();
      Vec4.subtract(d, m, a).add(m);
    } else {
      a = new Vec4();
      Vec4.subtract(a, m, d).add(m);
    }
    var n1 = new Vec4();
    var n2 = new Vec4();
    var n = new Vec4();
    Vec4.lerp(n1, a, b, dx);
    Vec4.lerp(n2, c, d, dx);
    Vec4.lerp(n, n1, n2, dz);
    return n;
  };
  _proto3.getMaxWeightLayerAt = function getMaxWeightLayerAt(x, y) {
    var uWeightComplexity = this.weightMapSize * this.blockCount[0];
    var vWeightComplexity = this.weightMapSize * this.blockCount[1];
    if (uWeightComplexity === 0 || vWeightComplexity === 0) {
      return null;
    }
    var fx = x / uWeightComplexity;
    var fy = y / vWeightComplexity;
    var ix0 = Math.floor(fx);
    var iz0 = Math.floor(fy);
    if (ix0 < 0 || ix0 > uWeightComplexity - 1 || iz0 < 0 || iz0 > vWeightComplexity - 1) {
      return null;
    }
    var w = this.getWeight(ix0, iz0);
    var bx = Math.floor(x / this.weightMapSize);
    var by = Math.floor(y / this.weightMapSize);
    var block = this.getBlock(bx, by);
    var i = 0;
    if (w.y > w[i] && block.getLayer(1) !== -1) {
      i = 1;
    }
    if (w.y > w[i] && block.getLayer(2) !== -1) {
      i = 2;
    }
    if (w.z > w[i] && block.getLayer(3) !== -1) {
      i = 3;
    }
    i = block.getLayer(i);
    return this.getLayer(i);
  };
  _proto3.getBlockLayers = function getBlockLayers(i, j) {
    var layerIndex = (j * this._blockCount[0] + i) * TERRAIN_MAX_BLEND_LAYERS;
    return [this._layerBuffer[layerIndex], this._layerBuffer[layerIndex + 1], this._layerBuffer[layerIndex + 2], this._layerBuffer[layerIndex + 3]];
  };
  _proto3.getBlockLayer = function getBlockLayer(i, j, index) {
    var layerIndex = (j * this._blockCount[0] + i) * TERRAIN_MAX_BLEND_LAYERS;
    return this._layerBuffer[layerIndex + index];
  };
  _proto3.setBlockLayer = function setBlockLayer(i, j, index, layerId) {
    var layerIndex = (j * this._blockCount[0] + i) * TERRAIN_MAX_BLEND_LAYERS;
    this._layerBuffer[layerIndex + index] = layerId;
  };
  _proto3.getBlock = function getBlock(i, j) {
    return this._blocks[j * this._blockCount[0] + i];
  };
  _proto3.getBlocks = function getBlocks() {
    return this._blocks;
  };
  _proto3.rayCheck = function rayCheck(start, dir, step, worldSpace) {
    if (worldSpace === void 0) {
      worldSpace = true;
    }
    var MAX_COUNT = 2000;
    var trace = start;
    if (worldSpace) {
      Vec3.subtract(trace, start, this.node.worldPosition);
    }
    var delta = v3();
    delta.set(dir);
    delta.multiplyScalar(step);
    var position = null;
    if (dir.equals(v3(0, 1, 0))) {
      var y = this.getHeightAt(trace.x, trace.z);
      if (y != null && trace.y <= y) {
        position = v3(trace.x, y, trace.z);
      }
    } else if (dir.equals(v3(0, -1, 0))) {
      var _y6 = this.getHeightAt(trace.x, trace.z);
      if (_y6 != null && trace.y >= _y6) {
        position = v3(trace.x, _y6, trace.z);
      }
    } else {
      var i = 0;
      while (i++ < MAX_COUNT) {
        var _y7 = this.getHeightAt(trace.x, trace.z);
        if (_y7 != null && trace.y <= _y7) {
          break;
        }
        trace.add(dir);
      }
      while (i++ < MAX_COUNT) {
        var _y8 = this.getHeightAt(trace.x, trace.z);
        if (_y8 != null && trace.y <= _y8) {
          position = v3(trace.x, _y8, trace.z);
          break;
        }
        trace.add(delta);
      }
    }
    return position;
  };
  _proto3._createSharedIndexBuffer = function _createSharedIndexBuffer() {
    var gfxDevice = deviceManager.gfxDevice;
    if (this._lod !== null) {
      var gfxBuffer = gfxDevice.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, Uint16Array.BYTES_PER_ELEMENT * this._lod._indexBuffer.length, Uint16Array.BYTES_PER_ELEMENT));
      gfxBuffer.update(this._lod._indexBuffer);
      return gfxBuffer;
    } else {
      var indexData = new Uint16Array(TERRAIN_BLOCK_TILE_COMPLEXITY * TERRAIN_BLOCK_TILE_COMPLEXITY * 6);
      var index = 0;
      for (var j = 0; j < TERRAIN_BLOCK_TILE_COMPLEXITY; ++j) {
        for (var i = 0; i < TERRAIN_BLOCK_TILE_COMPLEXITY; ++i) {
          var a = j * TERRAIN_BLOCK_VERTEX_COMPLEXITY + i;
          var b = j * TERRAIN_BLOCK_VERTEX_COMPLEXITY + i + 1;
          var c = (j + 1) * TERRAIN_BLOCK_VERTEX_COMPLEXITY + i;
          var d = (j + 1) * TERRAIN_BLOCK_VERTEX_COMPLEXITY + i + 1;
          indexData[index++] = a;
          indexData[index++] = c;
          indexData[index++] = b;
          indexData[index++] = b;
          indexData[index++] = c;
          indexData[index++] = d;
        }
      }
      var _gfxBuffer = gfxDevice.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, Uint16Array.BYTES_PER_ELEMENT * indexData.length, Uint16Array.BYTES_PER_ELEMENT));
      _gfxBuffer.update(indexData);
      return _gfxBuffer;
    }
  };
  _proto3._getSharedIndexBuffer = function _getSharedIndexBuffer() {
    if (this._sharedLodIndexBuffer !== null) {
      return this._sharedLodIndexBuffer;
    }
    if (this._sharedIndexBuffer !== null) {
      return this._sharedIndexBuffer;
    }
    if (this.lodEnable && this._lod === null) {
      this._lod = new TerrainLod();
    }
    if (this._lod !== null) {
      this._sharedLodIndexBuffer = this._createSharedIndexBuffer();
      return this._sharedLodIndexBuffer;
    } else {
      this._sharedIndexBuffer = this._createSharedIndexBuffer();
      return this._sharedIndexBuffer;
    }
  };
  _proto3._getIndexData = function _getIndexData(key) {
    if (this._sharedLodIndexBuffer !== null && this._lod !== null) {
      return this._lod.getIndexData(key);
    }
    return null;
  };
  _proto3._resetLightmap = function _resetLightmap(enable) {
    this._lightmapInfos.length = 0;
    if (enable) {
      for (var i = 0; i < this._blockCount[0] * this._blockCount[1]; ++i) {
        this._lightmapInfos.push(new TerrainBlockLightmapInfo());
      }
    }
  };
  _proto3._updateLightmap = function _updateLightmap(blockId, tex, uOff, vOff, uScale, vScale) {
    if (tex) {
      if (this._lightmapInfos.length === 0) {
        for (var i = 0; i < this._blockCount[0] * this._blockCount[1]; ++i) {
          this._lightmapInfos.push(new TerrainBlockLightmapInfo());
        }
      }
    } else if (this._lightmapInfos.length === 0) {
      return;
    }
    this._lightmapInfos[blockId].texture = tex;
    this._lightmapInfos[blockId].UOff = uOff;
    this._lightmapInfos[blockId].VOff = vOff;
    this._lightmapInfos[blockId].UScale = uScale;
    this._lightmapInfos[blockId].VScale = vScale;
    this._blocks[blockId]._updateLightmap(this._lightmapInfos[blockId]);
  };
  _proto3._getLightmapInfo = function _getLightmapInfo(i, j) {
    var index = j * this._blockCount[0] + i;
    return index < this._lightmapInfos.length ? this._lightmapInfos[index] : null;
  };
  _proto3._calcNormal = function _calcNormal(x, z) {
    var flip = 1;
    var here = this.getPosition(x, z);
    var right;
    var up;
    if (x < this.vertexCount[0] - 1) {
      right = this.getPosition(x + 1, z);
    } else {
      flip *= -1;
      right = this.getPosition(x - 1, z);
    }
    if (z < this.vertexCount[1] - 1) {
      up = this.getPosition(x, z + 1);
    } else {
      flip *= -1;
      up = this.getPosition(x, z - 1);
    }
    right.subtract(here);
    up.subtract(here);
    var normal = v3();
    normal.set(up);
    normal.cross(right);
    normal.multiplyScalar(flip);
    normal.normalize();
    return normal;
  };
  _proto3._buildNormals = function _buildNormals() {
    var index = 0;
    for (var y = 0; y < this.vertexCount[1]; ++y) {
      for (var x = 0; x < this.vertexCount[0]; ++x) {
        var n = this._calcNormal(x, y);
        this._normals[index * 3 + 0] = n.x;
        this._normals[index * 3 + 1] = n.y;
        this._normals[index * 3 + 2] = n.z;
        index += 1;
      }
    }
  };
  _proto3._buildImp = function _buildImp(restore) {
    var _this3 = this;
    if (restore === void 0) {
      restore = false;
    }
    if (this.valid) {
      return;
    }
    var terrainAsset = this.__asset;
    if (this._buitinAsset !== terrainAsset) {
      this._buitinAsset = terrainAsset;
    }
    if (!restore && terrainAsset !== null) {
      this._tileSize = terrainAsset.tileSize;
      this._blockCount = terrainAsset.blockCount;
      this._weightMapSize = terrainAsset.weightMapSize;
      this._lightMapSize = terrainAsset.lightMapSize;
      this._heights = terrainAsset.heights;
      this._normals = terrainAsset.normals;
      this._weights = terrainAsset.weights;
      this._layerBuffer = terrainAsset.layerBuffer;
      for (var i = 0; i < this._layerList.length; ++i) {
        this._layerList[i] = null;
      }
      if (terrainAsset.version < TERRAIN_DATA_VERSION5) {
        var _loop = function _loop() {
          var layer = new TerrainLayer();
          var layerInfo = terrainAsset.layerBinaryInfos[_i8];
          layer.tileSize = layerInfo.tileSize;
          legacyCC.assetManager.loadAny(layerInfo.detailMapId, function (err, asset) {
            layer.detailMap = asset;
          });
          if (layerInfo.normalMapId !== '') {
            legacyCC.assetManager.loadAny(layerInfo.normalMapId, function (err, asset) {
              layer.normalMap = asset;
            });
          }
          layer.roughness = layerInfo.roughness;
          layer.metallic = layerInfo.metallic;
          _this3._layerList[layerInfo.slot] = layer;
        };
        for (var _i8 = 0; _i8 < terrainAsset.layerBinaryInfos.length; ++_i8) {
          _loop();
        }
      } else {
        for (var _i9 = 0; _i9 < terrainAsset.layerInfos.length; ++_i9) {
          var layer = new TerrainLayer();
          var layerInfo = terrainAsset.layerInfos[_i9];
          layer.tileSize = layerInfo.tileSize;
          layer.detailMap = layerInfo.detailMap;
          layer.normalMap = layerInfo.normalMap;
          layer.roughness = layerInfo.roughness;
          layer.metallic = layerInfo.metallic;
          this._layerList[layerInfo.slot] = layer;
        }
      }
    }
    if (this._blockCount[0] === 0 || this._blockCount[1] === 0) {
      return;
    }
    var vertexCount = this.vertexCount[0] * this.vertexCount[1];
    if (this._heights === null || this._heights.length !== vertexCount) {
      this._heights = new Uint16Array(vertexCount);
      this._normals = new Float32Array(vertexCount * 3);
      for (var _i0 = 0; _i0 < vertexCount; ++_i0) {
        this._heights[_i0] = TERRAIN_HEIGHT_BASE;
        this._normals[_i0 * 3 + 0] = 0;
        this._normals[_i0 * 3 + 1] = 1;
        this._normals[_i0 * 3 + 2] = 0;
      }
      if (terrainAsset) {
        terrainAsset.heights = this._heights;
        terrainAsset.normals = this._normals;
      }
    }
    if (this._normals === null || this._normals.length !== vertexCount * 3) {
      this._normals = new Float32Array(vertexCount * 3);
      this._buildNormals();
    }
    var layerBufferSize = this.blockCount[0] * this.blockCount[1] * TERRAIN_MAX_BLEND_LAYERS;
    if (this._layerBuffer === null || this._layerBuffer.length !== layerBufferSize) {
      this._layerBuffer = new Array(layerBufferSize);
      for (var _i1 = 0; _i1 < layerBufferSize; ++_i1) {
        this._layerBuffer[_i1] = -1;
      }
      if (terrainAsset) {
        terrainAsset.layerBuffer = this._layerBuffer;
      }
    }
    var weightMapComplexityU = this._weightMapSize * this._blockCount[0];
    var weightMapComplexityV = this._weightMapSize * this._blockCount[1];
    if (this._weights.length !== weightMapComplexityU * weightMapComplexityV * 4) {
      this._weights = new Uint8Array(weightMapComplexityU * weightMapComplexityV * 4);
      for (var _i10 = 0; _i10 < weightMapComplexityU * weightMapComplexityV; ++_i10) {
        this._weights[_i10 * 4 + 0] = 255;
        this._weights[_i10 * 4 + 1] = 0;
        this._weights[_i10 * 4 + 2] = 0;
        this._weights[_i10 * 4 + 3] = 0;
      }
      if (terrainAsset) {
        terrainAsset.weights = this._weights;
      }
    }
    for (var j = 0; j < this._blockCount[1]; ++j) {
      for (var _i11 = 0; _i11 < this._blockCount[0]; ++_i11) {
        this._blocks.push(new TerrainBlock(this, _i11, j));
      }
    }
    for (var _i12 = 0; _i12 < this._blocks.length; ++_i12) {
      this._blocks[_i12].build();
    }
  };
  _proto3._rebuildHeights = function _rebuildHeights(info) {
    if (this.vertexCount[0] === info.vertexCount[0] && this.vertexCount[1] === info.vertexCount[1]) {
      return false;
    }
    var heights = new Uint16Array(info.vertexCount[0] * info.vertexCount[1]);
    for (var i = 0; i < heights.length; ++i) {
      heights[i] = TERRAIN_HEIGHT_BASE;
    }
    var w = Math.min(this.vertexCount[0], info.vertexCount[0]);
    var h = Math.min(this.vertexCount[1], info.vertexCount[1]);
    for (var j = 0; j < h; ++j) {
      for (var _i13 = 0; _i13 < w; ++_i13) {
        var index0 = j * info.vertexCount[0] + _i13;
        var index1 = j * this.vertexCount[0] + _i13;
        heights[index0] = this._heights[index1];
      }
    }
    this._heights = heights;
    return true;
  };
  _proto3._rebuildLayerBuffer = function _rebuildLayerBuffer(info) {
    if (this.blockCount[0] === info.blockCount[0] && this.blockCount[1] === info.blockCount[1]) {
      return false;
    }
    var layerBuffer = [];
    layerBuffer.length = info.blockCount[0] * info.blockCount[1] * TERRAIN_MAX_BLEND_LAYERS;
    for (var i = 0; i < layerBuffer.length; ++i) {
      layerBuffer[i] = -1;
    }
    var w = Math.min(this.blockCount[0], info.blockCount[0]);
    var h = Math.min(this.blockCount[1], info.blockCount[1]);
    for (var j = 0; j < h; ++j) {
      for (var _i14 = 0; _i14 < w; ++_i14) {
        var index0 = j * info.blockCount[0] + _i14;
        var index1 = j * this.blockCount[0] + _i14;
        for (var l = 0; l < TERRAIN_MAX_BLEND_LAYERS; ++l) {
          layerBuffer[index0 * TERRAIN_MAX_BLEND_LAYERS + l] = this._layerBuffer[index1 * TERRAIN_MAX_BLEND_LAYERS + l];
        }
      }
    }
    this._layerBuffer = layerBuffer;
    return true;
  };
  _proto3._rebuildWeights = function _rebuildWeights(info) {
    var _this4 = this;
    var oldWeightMapSize = this._weightMapSize;
    var oldWeightMapComplexityU = this._weightMapSize * this._blockCount[0];
    var oldWeightMapComplexityV = this._weightMapSize * this._blockCount[1];
    var weightMapComplexityU = info.weightMapSize * info.blockCount[0];
    var weightMapComplexityV = info.weightMapSize * info.blockCount[1];
    if (weightMapComplexityU === oldWeightMapComplexityU && weightMapComplexityV === oldWeightMapComplexityV) {
      return false;
    }
    var weights = new Uint8Array(weightMapComplexityU * weightMapComplexityV * 4);
    for (var i = 0; i < weightMapComplexityU * weightMapComplexityV; ++i) {
      weights[i * 4 + 0] = 255;
      weights[i * 4 + 1] = 0;
      weights[i * 4 + 2] = 0;
      weights[i * 4 + 3] = 0;
    }
    var w = Math.min(info.blockCount[0], this._blockCount[0]);
    var h = Math.min(info.blockCount[1], this._blockCount[1]);
    var getOldWeight = function getOldWeight(_i, _j, _weights) {
      var index = _j * oldWeightMapComplexityU + _i;
      var weight = new Vec4();
      weight.x = _weights[index * 4 + 0] / 255.0;
      weight.y = _weights[index * 4 + 1] / 255.0;
      weight.z = _weights[index * 4 + 2] / 255.0;
      weight.w = _weights[index * 4 + 3] / 255.0;
      return weight;
    };
    var sampleOldWeight = function sampleOldWeight(_x, _y, _xOff, _yOff, _weights) {
      var ix0 = Math.floor(_x);
      var iz0 = Math.floor(_y);
      var ix1 = Math.min(ix0 + 1, oldWeightMapSize - 1);
      var iz1 = Math.min(iz0 + 1, oldWeightMapSize - 1);
      var dx = _x - ix0;
      var dz = _y - iz0;
      var a = getOldWeight(ix0 + _xOff, iz0 + _yOff, _this4._weights);
      var b = getOldWeight(ix1 + _xOff, iz0 + _yOff, _this4._weights);
      var c = getOldWeight(ix0 + _xOff, iz1 + _yOff, _this4._weights);
      var d = getOldWeight(ix1 + _xOff, iz1 + _yOff, _this4._weights);
      var m = new Vec4();
      Vec4.add(m, b, c).multiplyScalar(0.5);
      if (dx + dz <= 1.0) {
        d.set(m);
        d.subtract(a);
        d.add(m);
      } else {
        a.set(m);
        a.subtract(d);
        a.add(m);
      }
      var n1 = new Vec4();
      var n2 = new Vec4();
      var n = new Vec4();
      Vec4.lerp(n1, a, b, dx);
      Vec4.lerp(n2, c, d, dx);
      Vec4.lerp(n, n1, n2, dz);
      return n;
    };
    for (var j = 0; j < h; ++j) {
      for (var _i15 = 0; _i15 < w; ++_i15) {
        var uOff = _i15 * oldWeightMapSize;
        var vOff = j * oldWeightMapSize;
        for (var v = 0; v < info.weightMapSize; ++v) {
          for (var u = 0; u < info.weightMapSize; ++u) {
            var _w = void 0;
            if (info.weightMapSize === oldWeightMapSize) {
              _w = getOldWeight(u + uOff, v + vOff, this._weights);
            } else {
              var x = u / (info.weightMapSize - 1) * (oldWeightMapSize - 1);
              var y = v / (info.weightMapSize - 1) * (oldWeightMapSize - 1);
              _w = sampleOldWeight(x, y, uOff, vOff, this._weights);
            }
            var du = _i15 * info.weightMapSize + u;
            var dv = j * info.weightMapSize + v;
            var index = dv * weightMapComplexityU + du;
            weights[index * 4 + 0] = _w.x * 255;
            weights[index * 4 + 1] = _w.y * 255;
            weights[index * 4 + 2] = _w.z * 255;
            weights[index * 4 + 3] = _w.w * 255;
          }
        }
      }
    }
    this._weights = weights;
    return true;
  };
  return _createClass(Terrain, [{
    key: "_asset",
    get: function get() {
      return this.__asset;
    },
    set: function set(value) {
      this.__asset = value;
      if (this._buitinAsset !== this.__asset) {
        this._buitinAsset = this.__asset;
        for (var i = 0; i < this._blocks.length; ++i) {
          this._blocks[i].destroy();
        }
        this._blocks = [];
        if (this.__asset === null) {
          this._effectAsset = null;
          this._lightmapInfos = [];
          this._receiveShadow = false;
          this._useNormalmap = false;
          this._usePBR = false;
          this._tileSize = 1;
          this._blockCount = [1, 1];
          this._weightMapSize = 128;
          this._lightMapSize = 128;
          this._heights = new Uint16Array();
          this._weights = new Uint8Array();
          this._normals = new Float32Array();
          this._layerBuffer = [];
          this._blocks = [];
          this._layerList = [];
          for (var _i16 = 0; _i16 < TERRAIN_MAX_LAYER_COUNT; ++_i16) {
            this._layerList.push(null);
          }
        }
        if (deviceManager.gfxDevice) {
          this._buildImp();
        }
      }
    }
  }, {
    key: "effectAsset",
    get: function get() {
      return this._effectAsset;
    },
    set: function set(value) {
      if (this._effectAsset === value) {
        return;
      }
      this._effectAsset = value;
      for (var i = 0; i < this._blocks.length; ++i) {
        this._blocks[i]._invalidMaterial();
      }
    }
  }, {
    key: "receiveShadow",
    get: function get() {
      return this._receiveShadow;
    },
    set: function set(val) {
      this._receiveShadow = val;
      for (var i = 0; i < this._blocks.length; i++) {
        this._blocks[i]._invalidMaterial();
      }
    }
  }, {
    key: "useNormalMap",
    get: function get() {
      return this._useNormalmap;
    },
    set: function set(val) {
      this._useNormalmap = val;
      for (var i = 0; i < this._blocks.length; i++) {
        this._blocks[i]._invalidMaterial();
      }
    }
  }, {
    key: "usePBR",
    get: function get() {
      return this._usePBR;
    },
    set: function set(val) {
      this._usePBR = val;
      for (var i = 0; i < this._blocks.length; i++) {
        this._blocks[i]._invalidMaterial();
      }
    }
  }, {
    key: "lodEnable",
    get: function get() {
      return this._lodEnable;
    },
    set: function set(val) {
      this._lodEnable = val;
      if (this._lodEnable && this._lod === null) {
        this._lod = new TerrainLod();
        if (this._sharedLodIndexBuffer === null) {
          this._sharedLodIndexBuffer = this._createSharedIndexBuffer();
        }
        for (var i = 0; i < this._blocks.length; ++i) {
          this._blocks[i].destroy();
        }
        this._blocks = [];
        for (var j = 0; j < this._blockCount[1]; ++j) {
          for (var _i17 = 0; _i17 < this._blockCount[0]; ++_i17) {
            this._blocks.push(new TerrainBlock(this, _i17, j));
          }
        }
        for (var _i18 = 0; _i18 < this._blocks.length; ++_i18) {
          this._blocks[_i18].build();
        }
      }
      if (!this._lodEnable) {
        for (var _i19 = 0; _i19 < this._blocks.length; _i19++) {
          this._blocks[_i19]._resetLod();
        }
      }
    }
  }, {
    key: "LodBias",
    get: function get() {
      return this._lodBias;
    },
    set: function set(val) {
      this._lodBias = val;
    }
  }, {
    key: "size",
    get: function get() {
      var sz = new Size(0, 0);
      sz.width = this.blockCount[0] * TERRAIN_BLOCK_TILE_COMPLEXITY * this.tileSize;
      sz.height = this.blockCount[1] * TERRAIN_BLOCK_TILE_COMPLEXITY * this.tileSize;
      return sz;
    }
  }, {
    key: "tileSize",
    get: function get() {
      return this._tileSize;
    }
  }, {
    key: "tileCount",
    get: function get() {
      return [this.blockCount[0] * TERRAIN_BLOCK_TILE_COMPLEXITY, this.blockCount[1] * TERRAIN_BLOCK_TILE_COMPLEXITY];
    }
  }, {
    key: "vertexCount",
    get: function get() {
      var _vertexCount = this.tileCount;
      _vertexCount[0] += 1;
      _vertexCount[1] += 1;
      return _vertexCount;
    }
  }, {
    key: "blockCount",
    get: function get() {
      return this._blockCount;
    }
  }, {
    key: "lightMapSize",
    get: function get() {
      return this._lightMapSize;
    }
  }, {
    key: "weightMapSize",
    get: function get() {
      return this._weightMapSize;
    }
  }, {
    key: "heights",
    get: function get() {
      return this._heights;
    }
  }, {
    key: "weights",
    get: function get() {
      return this._weights;
    }
  }, {
    key: "valid",
    get: function get() {
      return this._blocks.length > 0;
    }
  }, {
    key: "info",
    get: function get() {
      var ti = new TerrainInfo();
      ti.tileSize = this.tileSize;
      ti.blockCount[0] = this.blockCount[0];
      ti.blockCount[1] = this.blockCount[1];
      ti.weightMapSize = this.weightMapSize;
      ti.lightMapSize = this.lightMapSize;
      return ti;
    }
  }]);
}(Component), _initializer13 = applyDecoratedInitializer(_class8.prototype, "__asset", [_dec5, serializable], function () {
  return null;
}), _initializer14 = applyDecoratedInitializer(_class8.prototype, "_effectAsset", [_dec6, serializable], function () {
  return null;
}), _initializer15 = applyDecoratedInitializer(_class8.prototype, "_lightmapInfos", [_dec7, serializable], function () {
  return [];
}), _initializer16 = applyDecoratedInitializer(_class8.prototype, "_receiveShadow", [serializable], function () {
  return false;
}), _initializer17 = applyDecoratedInitializer(_class8.prototype, "_useNormalmap", [serializable], function () {
  return false;
}), _initializer18 = applyDecoratedInitializer(_class8.prototype, "_usePBR", [serializable], function () {
  return false;
}), _initializer19 = applyDecoratedInitializer(_class8.prototype, "_lodEnable", [serializable], function () {
  return false;
}), _initializer20 = applyDecoratedInitializer(_class8.prototype, "_lodBias", [_dec8, serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class8.prototype, "_asset", [_dec9], Object.getOwnPropertyDescriptor(_class8.prototype, "_asset"), _class8.prototype), _applyDecoratedDescriptor(_class8.prototype, "effectAsset", [_dec0], Object.getOwnPropertyDescriptor(_class8.prototype, "effectAsset"), _class8.prototype), _applyDecoratedDescriptor(_class8.prototype, "info", [_dec1], Object.getOwnPropertyDescriptor(_class8.prototype, "info"), _class8.prototype), _class8)) || _class7) || _class7);

export { HeightField, TERRAIN_BLOCK_TILE_COMPLEXITY, TERRAIN_BLOCK_VERTEX_COMPLEXITY, TERRAIN_BLOCK_VERTEX_SIZE, TERRAIN_DATA_VERSION5, TERRAIN_HEIGHT_BASE, TERRAIN_HEIGHT_FACTORY, TERRAIN_HEIGHT_FMAX, TERRAIN_HEIGHT_FMIN, TERRAIN_MAX_BLEND_LAYERS, TERRAIN_MAX_LAYER_COUNT, Terrain, TerrainAsset, TerrainBlock, TerrainBlockLightmapInfo, TerrainInfo, TerrainLayer, TerrainLayerInfo };
//# sourceMappingURL=terrain.js.map
