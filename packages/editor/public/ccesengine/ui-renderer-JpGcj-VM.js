import { o as assertIsTrue, g as getError, w as warnID, a as _createClass, P as Pool, _ as _inheritsLoose, k as errorID, N as assertID, G as macro, R as RecyclePool, x as ccenum, I as assert, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import { n as sys, C as Color, V as Vec2, f as Vec3, M as Mat4, m as Rect, c as ccclass, d as disallowMultiple, A as approx, E as EPSILON, N as visibleRect, J as AABB, b as applyDecoratedInitializer, B as Size, s as serializable, l as executionOrder, t as type, L as override, r as requireComponent } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { d as builtinResMgr, b as Material } from './scene-vWcxM1_c.js';
import './deprecated-n0w4kK7g.js';
import './debug-view-BuNhRPv_.js';
import { N as NodeEventType, C as Component } from './node-event-Ccvtv8bJ.js';
import './device-manager-CBXP-ttm.js';
import { a as AttributeName, A as Attribute, F as Format, x as FormatInfos, $ as API, aa as Feature, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, I as InputAssemblerInfo, ah as ComparisonFunc, c as DepthStencilState, ai as StencilOp, m as murmurhash2_32_gc, ag as BlendFactor, aj as BlendOp, ak as ColorMask } from './buffer-barrier-BlQXg9Aa.js';
import { d as director, D as DirectorEvent, u as uiRendererManager } from './director-F7e_Lqjg.js';
import './deprecated-Dswa7XeN.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { R as Renderer } from './renderer-C7HM72NY.js';
import { S as SortingLayers } from './sorting-layers-BHqhkSbY.js';

var ATTR_POSITION = AttributeName.ATTR_POSITION;
var ATTR_COLOR = AttributeName.ATTR_COLOR;
var ATTR_TEX_COORD = AttributeName.ATTR_TEX_COORD;
var ATTR_COLOR2 = AttributeName.ATTR_COLOR2;
var vfmt = [new Attribute(ATTR_POSITION, Format.RGB32F)];
var vfmtPosColor = [new Attribute(ATTR_POSITION, Format.RGB32F), new Attribute(ATTR_COLOR, Format.RGBA32F)];
var vfmtPosUvColor = [new Attribute(ATTR_POSITION, Format.RGB32F), new Attribute(ATTR_TEX_COORD, Format.RG32F), new Attribute(ATTR_COLOR, Format.RGBA32F)];
var vfmtPosUvColor4B = [new Attribute(ATTR_POSITION, Format.RGB32F), new Attribute(ATTR_TEX_COORD, Format.RG32F), new Attribute(ATTR_COLOR, Format.RGBA8, true)];
var vfmtPosUvTwoColor = [new Attribute(ATTR_POSITION, Format.RGB32F), new Attribute(ATTR_TEX_COORD, Format.RG32F), new Attribute(ATTR_COLOR, Format.RGBA32F), new Attribute(ATTR_COLOR2, Format.RGBA32F)];
var vfmtPosUvTwoColor4B = [new Attribute(ATTR_POSITION, Format.RGB32F), new Attribute(ATTR_TEX_COORD, Format.RG32F), new Attribute(ATTR_COLOR, Format.RGBA8, true), new Attribute(ATTR_COLOR2, Format.RGBA8, true)];
function getComponentPerVertex(attrs) {
  var count = 0;
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];
    var info = FormatInfos[attr.format];
    count += info.count;
  }
  return count;
}
function getAttributeStride(attrs) {
  var count = 0;
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];
    var info = FormatInfos[attr.format];
    count += info.size;
  }
  return count;
}
cclegacy.internal.vfmtPosUvColor = vfmtPosUvColor;
cclegacy.internal.vfmtPosUvTwoColor = vfmtPosUvTwoColor;
cclegacy.internal.vfmtPosUvColor4B = vfmtPosUvColor4B;
cclegacy.internal.vfmtPosUvTwoColor4B = vfmtPosUvTwoColor4B;

var vertexFormat = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getAttributeStride: getAttributeStride,
    getComponentPerVertex: getComponentPerVertex,
    vfmt: vfmt,
    vfmtPosColor: vfmtPosColor,
    vfmtPosUvColor: vfmtPosUvColor,
    vfmtPosUvColor4B: vfmtPosUvColor4B,
    vfmtPosUvTwoColor: vfmtPosUvTwoColor,
    vfmtPosUvTwoColor4B: vfmtPosUvTwoColor4B
});

var MeshBufferSharedBufferView;
(function (MeshBufferSharedBufferView) {
  MeshBufferSharedBufferView[MeshBufferSharedBufferView["byteOffset"] = 0] = "byteOffset";
  MeshBufferSharedBufferView[MeshBufferSharedBufferView["vertexOffset"] = 1] = "vertexOffset";
  MeshBufferSharedBufferView[MeshBufferSharedBufferView["indexOffset"] = 2] = "indexOffset";
  MeshBufferSharedBufferView[MeshBufferSharedBufferView["dirty"] = 3] = "dirty";
  MeshBufferSharedBufferView[MeshBufferSharedBufferView["count"] = 4] = "count";
})(MeshBufferSharedBufferView || (MeshBufferSharedBufferView = {}));
var IA_POOL_USED_SCALE = 1 / 2;
var MeshBuffer = function () {
  function MeshBuffer() {
    this._byteOffset = 0;
    this._vertexOffset = 0;
    this._indexOffset = 0;
    this._dirty = false;
    this._floatsPerVertex = 0;
    this._vData = null;
    this._iData = null;
    this._vertexFormatBytes = 0;
    this._initVDataCount = 0;
    this._initIDataCount = 0;
    this._attributes = null;
    this._iaPool = [];
    this._iaInfo = null;
    this._nextFreeIAHandle = 0;
  }
  var _proto = MeshBuffer.prototype;
  _proto.initSharedBuffer = function initSharedBuffer() {
  };
  _proto.syncSharedBufferToNative = function syncSharedBufferToNative() {
  };
  _proto.initialize = function initialize(device, attrs, vFloatCount, iCount) {
    this._initVDataCount = vFloatCount;
    this._initIDataCount = iCount;
    this._attributes = attrs;
    this.floatsPerVertex = getAttributeStride(attrs) >> 2;
    var vDataCountLimit = 65536;
    var glApi = device.gfxAPI;
    if (glApi === API.WEBGPU || glApi === API.WEBGL2 || glApi === API.WEBGL && device.hasFeature(Feature.ELEMENT_INDEX_UINT)) {
      vDataCountLimit = 4294967295;
    }
    assertIsTrue(this._initVDataCount / this._floatsPerVertex < vDataCountLimit, getError(9005));
    if (!this.vData || !this.iData) {
      this.vData = new Float32Array(this._initVDataCount);
      this.iData = new Uint16Array(this._initIDataCount);
    }
    this._iaPool.push(this.createNewIA(device));
  };
  _proto.reset = function reset() {
    this._nextFreeIAHandle = 0;
    this.dirty = false;
  };
  _proto.destroy = function destroy() {
    this.reset();
    this._attributes = null;
    this._iaInfo = null;
    this.vData = null;
    this.iData = null;
    for (var i = 0; i < this._iaPool.length; ++i) {
      var iaRef = this._iaPool[i];
      var vertexBuffer0 = iaRef.vertexBuffers[0];
      if (vertexBuffer0) {
        vertexBuffer0.destroy();
      }
      var indexBuffer = iaRef.indexBuffer;
      if (indexBuffer) {
        indexBuffer.destroy();
      }
      iaRef.ia.destroy();
    }
    this._iaPool.length = 0;
  };
  _proto.setDirty = function setDirty() {
    this.dirty = true;
  };
  _proto.request = function request(vertexCount, indexCount) {
    warnID(9002);
    return false;
  };
  _proto.requireFreeIA = function requireFreeIA(device) {
    if (this._iaPool.length <= this._nextFreeIAHandle) {
      this._iaPool.push(this.createNewIA(device));
    }
    var ia = this._iaPool[this._nextFreeIAHandle++].ia;
    return ia;
  };
  _proto.recycleIA = function recycleIA(ia) {
    var pool = this._iaPool;
    for (var i = 0; i < this._nextFreeIAHandle; ++i) {
      if (ia === pool[i].ia) {
        var iaRef = pool[i];
        pool[i] = pool[--this._nextFreeIAHandle];
        pool[this._nextFreeIAHandle] = iaRef;
        return;
      }
    }
  };
  _proto.checkCapacity = function checkCapacity(vertexCount, indexCount) {
    var maxVertex = (this.vertexOffset + vertexCount) * this._floatsPerVertex;
    var maxIndex = this.indexOffset + indexCount;
    if (maxVertex > this._initVDataCount || maxIndex > this._initIDataCount) {
      return false;
    }
    return true;
  };
  _proto.uploadBuffers = function uploadBuffers() {
    if (this.byteOffset === 0 || !this._dirty) {
      return;
    }
    var iOS14 = sys.__isWebIOS14OrIPadOS14Env;
    var submitCount = iOS14 ? this._nextFreeIAHandle : 1;
    if (iOS14 && submitCount / this._iaPool.length < IA_POOL_USED_SCALE) {
      var count = submitCount / IA_POOL_USED_SCALE;
      var length = this._iaPool.length;
      for (var i = length - 1; i >= count; i--) {
        var iaRef = this._iaPool[i];
        if (iaRef.vertexBuffers[0]) {
          iaRef.vertexBuffers[0].destroy();
        }
        if (iaRef.indexBuffer) {
          iaRef.indexBuffer.destroy();
        }
        iaRef.ia.destroy();
      }
      this._iaPool.length = count;
    }
    var byteCount = this.byteOffset;
    var indexCount = this.indexOffset;
    for (var _i = 0; _i < submitCount; ++_i) {
      var _iaRef = this._iaPool[_i];
      var verticesData = new Float32Array(this.vData.buffer, 0, byteCount >> 2);
      var indicesData = new Uint16Array(this.iData.buffer, 0, indexCount);
      var vertexBuffer = _iaRef.vertexBuffers[0];
      if (byteCount > vertexBuffer.size) {
        vertexBuffer.resize(byteCount);
      }
      vertexBuffer.update(verticesData);
      if (indexCount * 2 > _iaRef.indexBuffer.size) {
        _iaRef.indexBuffer.resize(indexCount * 2);
      }
      _iaRef.indexBuffer.update(indicesData);
    }
    this.dirty = false;
  };
  _proto.createNewIA = function createNewIA(device) {
    var ia;
    var vertexBuffers;
    var indexBuffer;
    if (sys.__isWebIOS14OrIPadOS14Env || !this._iaPool[0]) {
      var vbStride = this._vertexFormatBytes = this._floatsPerVertex * Float32Array.BYTES_PER_ELEMENT;
      var ibStride = Uint16Array.BYTES_PER_ELEMENT;
      var vertexBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, vbStride, vbStride));
      indexBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, ibStride, ibStride));
      vertexBuffers = [vertexBuffer];
      this._iaInfo = new InputAssemblerInfo(this._attributes, vertexBuffers, indexBuffer);
      ia = device.createInputAssembler(this._iaInfo);
    } else {
      ia = device.createInputAssembler(this._iaInfo);
      vertexBuffers = this._iaInfo.vertexBuffers;
      indexBuffer = this._iaInfo.indexBuffer;
    }
    return {
      ia: ia,
      vertexBuffers: vertexBuffers,
      indexBuffer: indexBuffer
    };
  };
  return _createClass(MeshBuffer, [{
    key: "attributes",
    get: function get() {
      return this._attributes;
    }
  }, {
    key: "vertexFormatBytes",
    get: function get() {
      return this._vertexFormatBytes;
    }
  }, {
    key: "byteOffset",
    get: function get() {
      return this._byteOffset;
    },
    set: function set(val) {
      this._byteOffset = val;
    }
  }, {
    key: "vertexOffset",
    get: function get() {
      return this._vertexOffset;
    },
    set: function set(val) {
      this._vertexOffset = val;
    }
  }, {
    key: "indexOffset",
    get: function get() {
      return this._indexOffset;
    },
    set: function set(val) {
      this._indexOffset = val;
    }
  }, {
    key: "dirty",
    get: function get() {
      return this._dirty;
    },
    set: function set(val) {
      this._dirty = val;
    }
  }, {
    key: "floatsPerVertex",
    get: function get() {
      return this._floatsPerVertex;
    },
    set: function set(val) {
      this._floatsPerVertex = val;
    }
  }, {
    key: "vData",
    get: function get() {
      return this._vData;
    },
    set: function set(val) {
      this._vData = val;
    }
  }, {
    key: "iData",
    get: function get() {
      return this._iData;
    },
    set: function set(val) {
      this._iData = val;
    }
  }, {
    key: "nativeObj",
    get: function get() {
      return this._nativeObj;
    }
  }, {
    key: "sharedBuffer",
    get: function get() {
      return this._sharedBuffer;
    }
  }]);
}();

var BufferAccessor = function () {
  function BufferAccessor(device, attributes) {
    this._buffers = [];
    this._device = device;
    this._attributes = attributes;
    this._floatsPerVertex = getAttributeStride(attributes) >> 2;
    this._vertexFormatBytes = this._floatsPerVertex * Float32Array.BYTES_PER_ELEMENT;
  }
  var _proto = BufferAccessor.prototype;
  _proto.initialize = function initialize() {};
  _proto.reset = function reset() {};
  _proto.request = function request(vertexCount, indexCount) {
  };
  _proto.appendBuffers = function appendBuffers(vertices, indices) {};
  _proto.uploadBuffers = function uploadBuffers() {};
  _proto.destroy = function destroy() {
    this._attributes.length = 0;
  };
  return _createClass(BufferAccessor, [{
    key: "attributes",
    get: function get() {
      return this._attributes;
    }
  }, {
    key: "vertexFormatBytes",
    get: function get() {
      return this._vertexFormatBytes;
    }
  }, {
    key: "floatsPerVertex",
    get: function get() {
      return this._floatsPerVertex;
    }
  }]);
}();

var _entryPool = new Pool(function () {
  return {
    offset: 0,
    length: 0
  };
}, 32);
var StaticVBChunk = function () {
  function StaticVBChunk(vertexAccessor, bufferId, meshBuffer, vertexOffset, vb, indexCount) {
    this.vertexAccessor = vertexAccessor;
    this.bufferId = bufferId;
    this.meshBuffer = meshBuffer;
    this.vertexOffset = vertexOffset;
    this.vb = vb;
    this.indexCount = indexCount;
    assertIsTrue(meshBuffer === vertexAccessor.getMeshBuffer(bufferId));
  }
  var _proto = StaticVBChunk.prototype;
  _proto.setIndexBuffer = function setIndexBuffer(indices) {
  };
  return _createClass(StaticVBChunk, [{
    key: "ib",
    get: function get() {
      return this._ib;
    }
  }]);
}();
var StaticVBAccessor = function (_BufferAccessor) {
  function StaticVBAccessor(device, attributes, vCount, iCount) {
    var _this;
    _this = _BufferAccessor.call(this, device, attributes) || this;
    _this._freeLists = [];
    _this._vCount = 0;
    _this._iCount = 0;
    _this._id = 0;
    _this._vCount = vCount || Math.floor(macro.BATCHER2D_MEM_INCREMENT * 1024 / _this._vertexFormatBytes);
    _this._iCount = iCount || _this._vCount * StaticVBAccessor.IB_SCALE;
    _this._id = StaticVBAccessor.generateID();
    _this._allocateBuffer();
    return _this;
  }
  _inheritsLoose(StaticVBAccessor, _BufferAccessor);
  var _proto2 = StaticVBAccessor.prototype;
  _proto2.destroy = function destroy() {
    for (var i = 0; i < this._buffers.length; ++i) {
      this._buffers[i].destroy();
      var freeList = this._freeLists[i];
      for (var j = 0; j < freeList.length; ++j) {
        _entryPool.free(freeList[j]);
      }
    }
    this._buffers.length = 0;
    this._freeLists.length = 0;
    _BufferAccessor.prototype.destroy.call(this);
  };
  _proto2.reset = function reset() {
    for (var i = 0; i < this._buffers.length; ++i) {
      var buffer = this._buffers[i];
      buffer.indexOffset = 0;
      buffer.reset();
    }
  };
  _proto2.getVertexBuffer = function getVertexBuffer(bid) {
    return this._buffers[bid].vData;
  };
  _proto2.getIndexBuffer = function getIndexBuffer(bid) {
    return this._buffers[bid].iData;
  };
  _proto2.getMeshBuffer = function getMeshBuffer(bid) {
    return this._buffers[bid];
  };
  _proto2.uploadBuffers = function uploadBuffers() {
    for (var i = 0; i < this._buffers.length; ++i) {
      var firstEntry = this._freeLists[i][0];
      var buffer = this._buffers[i];
      if (!firstEntry || firstEntry.length < buffer.vData.byteLength) {
        buffer.uploadBuffers();
      }
    }
  };
  _proto2.appendIndices = function appendIndices(bufferId, indices) {
    var buf = this._buffers[bufferId];
    var iCount = indices.length;
    if (iCount) {
      var needLength = buf.indexOffset + indices.length;
      if (buf.iData.length < needLength) {
        var expansionLength = Math.floor(1.25 * needLength);
        var newIData = new Uint16Array(expansionLength);
        newIData.set(buf.iData);
        buf.iData = newIData;
      }
      buf.iData.set(indices, buf.indexOffset);
      buf.indexOffset += indices.length;
    }
  };
  _proto2.allocateChunk = function allocateChunk(vertexCount, indexCount) {
    var byteLength = vertexCount * this.vertexFormatBytes;
    if (vertexCount > this._vCount || indexCount > this._iCount) {
      errorID(9004, byteLength);
      return null;
    }
    var buf = null;
    var freeList;
    var bid = 0;
    var eid = -1;
    var entry = null;
    for (var i = 0; i < this._buffers.length; ++i) {
      buf = this._buffers[i];
      freeList = this._freeLists[i];
      for (var e = 0; e < freeList.length; ++e) {
        if (freeList[e].length >= byteLength) {
          entry = freeList[e];
          bid = i;
          eid = e;
          break;
        }
      }
      if (entry) break;
    }
    if (!entry) {
      bid = this._allocateBuffer();
      buf = this._buffers[bid];
      if (buf) {
        eid = 0;
        entry = this._freeLists[bid][eid];
      }
    }
    if (entry) {
      var _vertexOffset = entry.offset / this.vertexFormatBytes;
      assertIsTrue(Number.isInteger(_vertexOffset));
      var _vb = new Float32Array(buf.vData.buffer, entry.offset, byteLength >> 2).fill(0);
      this._allocateChunkFromEntry(bid, eid, entry, byteLength);
      return new StaticVBChunk(this, bid, buf, _vertexOffset, _vb, indexCount);
    } else {
      return null;
    }
  };
  _proto2.recycleChunk = function recycleChunk(chunk) {
    var freeList = this._freeLists[chunk.bufferId];
    var buf = this._buffers[chunk.bufferId];
    var offset = chunk.vertexOffset * this.vertexFormatBytes;
    var bytes = chunk.vb.byteLength;
    if (bytes === 0) return;
    var recycled = false;
    var i = 0;
    var prevEntry = null;
    var nextEntry = freeList[i];
    while (nextEntry && nextEntry.offset < offset) {
      prevEntry = nextEntry;
      nextEntry = freeList[++i];
    }
    if (prevEntry) {
      var distance = offset - (prevEntry.offset + prevEntry.length);
      assertIsTrue(distance >= 0);
      if (distance === 0) {
        prevEntry.length += bytes;
        offset = prevEntry.offset;
        bytes = prevEntry.length;
        if (nextEntry && nextEntry.offset - (offset + bytes) === 0) {
          prevEntry.length += nextEntry.length;
          freeList.splice(i, 1);
          _entryPool.free(nextEntry);
          nextEntry = null;
        }
        recycled = true;
      }
    }
    if (!recycled && nextEntry) {
      var _distance = nextEntry.offset - (offset + bytes);
      assertIsTrue(_distance >= 0);
      if (_distance === 0) {
        nextEntry.offset = offset;
        nextEntry.length += bytes;
      } else {
        var newEntry = _entryPool.alloc();
        newEntry.offset = offset;
        newEntry.length = bytes;
        freeList.splice(i, 0, newEntry);
      }
      recycled = true;
    }
    if (recycled) {
      if (offset + bytes === buf.byteOffset) {
        buf.byteOffset = offset;
      }
    } else {
      var _newEntry = _entryPool.alloc();
      _newEntry.offset = offset;
      _newEntry.length = bytes;
      freeList.push(_newEntry);
    }
  };
  _proto2._allocateChunkFromEntry = function _allocateChunkFromEntry(bid, eid, entry, bytes) {
    var remaining = entry.length - bytes;
    var offset = entry.offset + bytes;
    var buf = this._buffers[bid];
    if (buf.byteOffset < offset) {
      buf.byteOffset = offset;
    }
    assertID(remaining >= 0, 9004, bid, entry.offset, entry.length);
    if (remaining === 0) {
      this._freeLists[bid].splice(eid, 1);
      _entryPool.free(entry);
    } else {
      entry.offset += bytes;
      entry.length = remaining;
    }
  };
  _proto2._allocateBuffer = function _allocateBuffer() {
    assertID(this._buffers.length === this._freeLists.length, 9003);
    var buffer = new MeshBuffer();
    var vFloatCount = this._vCount * this._floatsPerVertex;
    buffer.initialize(this._device, this._attributes, vFloatCount, this._iCount);
    this._buffers.push(buffer);
    var entry = _entryPool.alloc();
    entry.offset = 0;
    entry.length = buffer.vData.byteLength;
    var freeList = [entry];
    this._freeLists.push(freeList);
    var batcher = director.root.batcher2D;
    batcher.syncMeshBuffersToNative(this.id, this._buffers);
    return this._buffers.length - 1;
  };
  StaticVBAccessor.generateID = function generateID() {
    return StaticVBAccessor.ID_COUNT++;
  };
  return _createClass(StaticVBAccessor, [{
    key: "id",
    get: function get() {
      return this._id;
    }
  }]);
}(BufferAccessor);
StaticVBAccessor.IB_SCALE = 4;
StaticVBAccessor.ID_COUNT = 0;

var AttrUInt8ArrayView;
(function (AttrUInt8ArrayView) {
  AttrUInt8ArrayView[AttrUInt8ArrayView["DrawInfoType"] = 0] = "DrawInfoType";
  AttrUInt8ArrayView[AttrUInt8ArrayView["VertDirty"] = 1] = "VertDirty";
  AttrUInt8ArrayView[AttrUInt8ArrayView["BooleanValues"] = 2] = "BooleanValues";
  AttrUInt8ArrayView[AttrUInt8ArrayView["Stride"] = 3] = "Stride";
  AttrUInt8ArrayView[AttrUInt8ArrayView["Count"] = 4] = "Count";
})(AttrUInt8ArrayView || (AttrUInt8ArrayView = {}));
var AttrUInt16ArrayView;
(function (AttrUInt16ArrayView) {
  AttrUInt16ArrayView[AttrUInt16ArrayView["BufferID"] = 0] = "BufferID";
  AttrUInt16ArrayView[AttrUInt16ArrayView["AccessorID"] = 1] = "AccessorID";
  AttrUInt16ArrayView[AttrUInt16ArrayView["Count"] = 2] = "Count";
})(AttrUInt16ArrayView || (AttrUInt16ArrayView = {}));
var AttrUInt32ArrayView;
(function (AttrUInt32ArrayView) {
  AttrUInt32ArrayView[AttrUInt32ArrayView["VertexOffset"] = 0] = "VertexOffset";
  AttrUInt32ArrayView[AttrUInt32ArrayView["IndexOffset"] = 1] = "IndexOffset";
  AttrUInt32ArrayView[AttrUInt32ArrayView["VBCount"] = 2] = "VBCount";
  AttrUInt32ArrayView[AttrUInt32ArrayView["IBCount"] = 3] = "IBCount";
  AttrUInt32ArrayView[AttrUInt32ArrayView["DataHash"] = 4] = "DataHash";
  AttrUInt32ArrayView[AttrUInt32ArrayView["Count"] = 5] = "Count";
})(AttrUInt32ArrayView || (AttrUInt32ArrayView = {}));
var RenderDrawInfoType;
(function (RenderDrawInfoType) {
  RenderDrawInfoType[RenderDrawInfoType["COMP"] = 0] = "COMP";
  RenderDrawInfoType[RenderDrawInfoType["MODEL"] = 1] = "MODEL";
  RenderDrawInfoType[RenderDrawInfoType["MIDDLEWARE"] = 2] = "MIDDLEWARE";
  RenderDrawInfoType[RenderDrawInfoType["SUB_NODE"] = 3] = "SUB_NODE";
})(RenderDrawInfoType || (RenderDrawInfoType = {}));
var RenderDrawInfo = function () {
  function RenderDrawInfo(nativeDrawInfo) {
    this._accId = -1;
    this._bufferId = -1;
    this._vertexOffset = 0;
    this._indexOffset = 0;
    this._vb = null;
    this._ib = null;
    this._vData = null;
    this._iData = null;
    this._vertDirty = false;
    this._vbCount = 0;
    this._ibCount = 0;
    this._dataHash = 0;
    this._isMeshBuffer = false;
    this._material = null;
    this._texture = null;
    this._sampler = null;
    this._stride = 0;
    this._useLocal = false;
    this._model = null;
    this._drawInfoType = RenderDrawInfoType.COMP;
    this._subNode = null;
    this._render2dBuffer = null;
  }
  var _proto = RenderDrawInfo.prototype;
  _proto.init = function init(nativeDrawInfo) {
  };
  _proto.clear = function clear() {
    return;
  };
  _proto.setAccId = function setAccId(accId) {
    this._accId = accId;
  };
  _proto.setBufferId = function setBufferId(bufferId) {
    this._bufferId = bufferId;
  };
  _proto.setAccAndBuffer = function setAccAndBuffer(accId, bufferId) {
    this._bufferId = bufferId;
    this._accId = accId;
  };
  _proto.setVertexOffset = function setVertexOffset(vertexOffset) {
    this._vertexOffset = vertexOffset;
  };
  _proto.setIndexOffset = function setIndexOffset(indexOffset) {
    this._indexOffset = indexOffset;
  };
  _proto.setVB = function setVB(vbBuffer) {
  };
  _proto.setIB = function setIB(ibBuffer) {
  };
  _proto.setVData = function setVData(vDataBuffer) {
  };
  _proto.setIData = function setIData(iDataBuffer) {
  };
  _proto.setVBCount = function setVBCount(vbCount) {
    this._vbCount = vbCount;
  };
  _proto.setIBCount = function setIBCount(ibCount) {
  };
  _proto.setVertDirty = function setVertDirty(val) {
    this._vertDirty = val;
  };
  _proto.setDataHash = function setDataHash(dataHash) {
    this._dataHash = dataHash;
  };
  _proto.setIsMeshBuffer = function setIsMeshBuffer(isMeshBuffer) {
    this._isMeshBuffer = isMeshBuffer;
  };
  _proto.setVertexPositionInWorld = function setVertexPositionInWorld(isVertexPositionInWorld) {
  };
  _proto.setMaterial = function setMaterial(material) {
    this._material = material;
  };
  _proto.setTexture = function setTexture(texture) {
    this._texture = texture;
  };
  _proto.setSampler = function setSampler(sampler) {
    this._sampler = sampler;
  };
  _proto.setModel = function setModel(model) {
  };
  _proto.setDrawInfoType = function setDrawInfoType(drawInfoType) {
    this._drawInfoType = drawInfoType;
  };
  _proto.setSubNode = function setSubNode(node) {
    this._subNode = node;
  };
  _proto.setStride = function setStride(stride) {
    this._stride = stride;
  };
  _proto.initRender2dBuffer = function initRender2dBuffer() {
  };
  _proto.fillRender2dBuffer = function fillRender2dBuffer(vertexDataArr) {
  };
  return _createClass(RenderDrawInfo, [{
    key: "nativeObj",
    get: function get() {
      return this._nativeObj;
    }
  }, {
    key: "render2dBuffer",
    get: function get() {
      return this._render2dBuffer;
    }
  }]);
}();

var Stage;
(function (Stage) {
  Stage[Stage["DISABLED"] = 0] = "DISABLED";
  Stage[Stage["CLEAR"] = 1] = "CLEAR";
  Stage[Stage["ENTER_LEVEL"] = 2] = "ENTER_LEVEL";
  Stage[Stage["ENABLED"] = 3] = "ENABLED";
  Stage[Stage["EXIT_LEVEL"] = 4] = "EXIT_LEVEL";
  Stage[Stage["CLEAR_INVERTED"] = 5] = "CLEAR_INVERTED";
  Stage[Stage["ENTER_LEVEL_INVERTED"] = 6] = "ENTER_LEVEL_INVERTED";
})(Stage || (Stage = {}));
var StencilSharedBufferView;
(function (StencilSharedBufferView) {
  StencilSharedBufferView[StencilSharedBufferView["stencilTest"] = 0] = "stencilTest";
  StencilSharedBufferView[StencilSharedBufferView["func"] = 1] = "func";
  StencilSharedBufferView[StencilSharedBufferView["stencilMask"] = 2] = "stencilMask";
  StencilSharedBufferView[StencilSharedBufferView["writeMask"] = 3] = "writeMask";
  StencilSharedBufferView[StencilSharedBufferView["failOp"] = 4] = "failOp";
  StencilSharedBufferView[StencilSharedBufferView["zFailOp"] = 5] = "zFailOp";
  StencilSharedBufferView[StencilSharedBufferView["passOp"] = 6] = "passOp";
  StencilSharedBufferView[StencilSharedBufferView["ref"] = 7] = "ref";
  StencilSharedBufferView[StencilSharedBufferView["count"] = 8] = "count";
})(StencilSharedBufferView || (StencilSharedBufferView = {}));
var StencilManager = function () {
  function StencilManager() {
    this._maskStack = [];
    this._stencilPattern = {
      stencilTest: true,
      func: ComparisonFunc.ALWAYS,
      stencilMask: 0xffff,
      writeMask: 0xffff,
      failOp: StencilOp.KEEP,
      zFailOp: StencilOp.KEEP,
      passOp: StencilOp.KEEP,
      ref: 1
    };
    this._stage = Stage.DISABLED;
    this.stencilStateMap = new Map();
    this.stencilStateMapWithDepth = new Map();
  }
  var _proto = StencilManager.prototype;
  _proto.pushMask = function pushMask(mask) {
    this._maskStack.push(mask);
  };
  _proto.clear = function clear(comp) {
    var isInverted = comp.stencilStage !== Stage.ENTER_LEVEL;
    return isInverted ? Stage.CLEAR_INVERTED : Stage.CLEAR;
  };
  _proto.enableMask = function enableMask() {
    this.stage = Stage.ENABLED;
  };
  _proto.exitMask = function exitMask() {
    if (this._maskStack.length === 0) {
      return;
    }
    this._maskStack.pop();
    if (this._maskStack.length === 0) {
      this.stage = Stage.DISABLED;
    } else {
      this.stage = Stage.ENABLED;
    }
  };
  _proto.getWriteMask = function getWriteMask() {
    return 1 << this._maskStack.length - 1;
  };
  _proto.getExitWriteMask = function getExitWriteMask() {
    return 1 << this._maskStack.length;
  };
  _proto.getStencilRef = function getStencilRef() {
    var result = 0;
    for (var i = 0; i < this._maskStack.length; ++i) {
      result += 0x00000001 << i;
    }
    return result;
  };
  _proto.getMaskStackSize = function getMaskStackSize() {
    return this._maskStack.length;
  };
  _proto.reset = function reset() {
    this._maskStack.length = 0;
    this.stage = Stage.DISABLED;
  };
  _proto.destroy = function destroy() {
    this.stencilStateMap.forEach(function (value, key) {
      value.destroy();
    });
    this.stencilStateMap.clear();
  };
  _proto.getStencilStage = function getStencilStage(stage, mat) {
    var key = 0;
    var depthTest = false;
    var depthWrite = false;
    var depthFunc = ComparisonFunc.LESS;
    var cacheMap = this.stencilStateMap;
    if (mat && mat.passes[0]) {
      var pass = mat.passes[0];
      var dss = pass.depthStencilState;
      var depthTestValue = 0;
      var depthWriteValue = 0;
      if (dss.depthTest) depthTestValue = 1;
      if (dss.depthWrite) depthWriteValue = 1;
      key = depthTestValue | depthWriteValue << 1 | dss.depthFunc << 2 | stage << 6 | this._maskStack.length << 9;
      depthTest = dss.depthTest;
      depthWrite = dss.depthWrite;
      depthFunc = dss.depthFunc;
      cacheMap = this.stencilStateMapWithDepth;
    } else {
      key = stage << 16 | this._maskStack.length;
    }
    if (cacheMap && cacheMap.has(key)) {
      return cacheMap.get(key);
    }
    this.setStateFromStage(stage);
    var stencilPattern = this._stencilPattern;
    var depthStencilState = new DepthStencilState(depthTest, depthWrite, depthFunc, stencilPattern.stencilTest, stencilPattern.func, stencilPattern.stencilMask, stencilPattern.writeMask, stencilPattern.failOp, stencilPattern.zFailOp, stencilPattern.passOp, stencilPattern.ref, stencilPattern.stencilTest, stencilPattern.func, stencilPattern.stencilMask, stencilPattern.writeMask, stencilPattern.failOp, stencilPattern.zFailOp, stencilPattern.passOp, stencilPattern.ref);
    cacheMap.set(key, depthStencilState);
    return depthStencilState;
  };
  _proto.getStencilHash = function getStencilHash(stage) {
    return stage << 8 | this._maskStack.length;
  };
  _proto.setStateFromStage = function setStateFromStage(stage) {
    var pattern = this._stencilPattern;
    if (stage === Stage.DISABLED) {
      pattern.stencilTest = false;
      pattern.func = ComparisonFunc.ALWAYS;
      pattern.failOp = StencilOp.KEEP;
      pattern.stencilMask = pattern.writeMask = 0xffff;
      pattern.ref = 1;
    } else {
      pattern.stencilTest = true;
      if (stage === Stage.ENABLED) {
        pattern.func = ComparisonFunc.EQUAL;
        pattern.failOp = StencilOp.KEEP;
        pattern.stencilMask = pattern.ref = this.getStencilRef();
        pattern.writeMask = this.getWriteMask();
      } else if (stage === Stage.CLEAR) {
        pattern.func = ComparisonFunc.NEVER;
        pattern.failOp = StencilOp.ZERO;
        pattern.writeMask = pattern.stencilMask = pattern.ref = this.getWriteMask();
      } else if (stage === Stage.CLEAR_INVERTED) {
        pattern.func = ComparisonFunc.NEVER;
        pattern.failOp = StencilOp.REPLACE;
        pattern.writeMask = pattern.stencilMask = pattern.ref = this.getWriteMask();
      } else if (stage === Stage.ENTER_LEVEL) {
        pattern.func = ComparisonFunc.NEVER;
        pattern.failOp = StencilOp.REPLACE;
        pattern.writeMask = pattern.stencilMask = pattern.ref = this.getWriteMask();
      } else if (stage === Stage.ENTER_LEVEL_INVERTED) {
        pattern.func = ComparisonFunc.NEVER;
        pattern.failOp = StencilOp.ZERO;
        pattern.writeMask = pattern.stencilMask = pattern.ref = this.getWriteMask();
      }
    }
  };
  return _createClass(StencilManager, [{
    key: "stage",
    get: function get() {
      return this._stage;
    },
    set: function set(val) {
      this._stage = val;
    }
  }, {
    key: "pattern",
    get: function get() {
      return this._stencilPattern;
    }
  }]);
}();
StencilManager.sharedManager = null;
StencilManager.sharedManager = new StencilManager();

var RenderEntityFillColorType;
(function (RenderEntityFillColorType) {
  RenderEntityFillColorType[RenderEntityFillColorType["COLOR"] = 0] = "COLOR";
  RenderEntityFillColorType[RenderEntityFillColorType["VERTEX"] = 1] = "VERTEX";
})(RenderEntityFillColorType || (RenderEntityFillColorType = {}));
var RenderEntityType;
(function (RenderEntityType) {
  RenderEntityType[RenderEntityType["STATIC"] = 0] = "STATIC";
  RenderEntityType[RenderEntityType["DYNAMIC"] = 1] = "DYNAMIC";
  RenderEntityType[RenderEntityType["CROSSED"] = 2] = "CROSSED";
})(RenderEntityType || (RenderEntityType = {}));
var RenderEntityUInt32SharedBufferView;
(function (RenderEntityUInt32SharedBufferView) {
  RenderEntityUInt32SharedBufferView[RenderEntityUInt32SharedBufferView["priority"] = 0] = "priority";
  RenderEntityUInt32SharedBufferView[RenderEntityUInt32SharedBufferView["count"] = 1] = "count";
})(RenderEntityUInt32SharedBufferView || (RenderEntityUInt32SharedBufferView = {}));
var RenderEntityUInt8SharedBufferView;
(function (RenderEntityUInt8SharedBufferView) {
  RenderEntityUInt8SharedBufferView[RenderEntityUInt8SharedBufferView["colorR"] = 0] = "colorR";
  RenderEntityUInt8SharedBufferView[RenderEntityUInt8SharedBufferView["colorG"] = 1] = "colorG";
  RenderEntityUInt8SharedBufferView[RenderEntityUInt8SharedBufferView["colorB"] = 2] = "colorB";
  RenderEntityUInt8SharedBufferView[RenderEntityUInt8SharedBufferView["colorA"] = 3] = "colorA";
  RenderEntityUInt8SharedBufferView[RenderEntityUInt8SharedBufferView["maskMode"] = 4] = "maskMode";
  RenderEntityUInt8SharedBufferView[RenderEntityUInt8SharedBufferView["fillColorType"] = 5] = "fillColorType";
  RenderEntityUInt8SharedBufferView[RenderEntityUInt8SharedBufferView["count"] = 6] = "count";
})(RenderEntityUInt8SharedBufferView || (RenderEntityUInt8SharedBufferView = {}));
var RenderEntityBoolSharedBufferViewBitIndex;
(function (RenderEntityBoolSharedBufferViewBitIndex) {
  RenderEntityBoolSharedBufferViewBitIndex[RenderEntityBoolSharedBufferViewBitIndex["enabled"] = 0] = "enabled";
  RenderEntityBoolSharedBufferViewBitIndex[RenderEntityBoolSharedBufferViewBitIndex["useLocal"] = 1] = "useLocal";
  RenderEntityBoolSharedBufferViewBitIndex[RenderEntityBoolSharedBufferViewBitIndex["count"] = 2] = "count";
})(RenderEntityBoolSharedBufferViewBitIndex || (RenderEntityBoolSharedBufferViewBitIndex = {}));
var MaskMode;
(function (MaskMode) {
  MaskMode[MaskMode["NONE"] = 0] = "NONE";
  MaskMode[MaskMode["MASK"] = 1] = "MASK";
  MaskMode[MaskMode["MASK_INVERTED"] = 2] = "MASK_INVERTED";
  MaskMode[MaskMode["MASK_NODE"] = 3] = "MASK_NODE";
  MaskMode[MaskMode["MASK_NODE_INVERTED"] = 4] = "MASK_NODE_INVERTED";
})(MaskMode || (MaskMode = {}));
var RenderEntity = function () {
  function RenderEntity(entityType) {
    this._renderEntityType = RenderEntityType.STATIC;
    this._dynamicDrawInfoArr = [];
    this._node = null;
    this._renderTransform = null;
    this._stencilStage = Stage.DISABLED;
    this._colorDirty = true;
    this._enabled = false;
    this._useLocal = false;
    this._maskMode = MaskMode.NONE;
    this._color = Color.WHITE.clone();
  }
  var _proto = RenderEntity.prototype;
  _proto.setPriority = function setPriority(val) {
  };
  _proto.setUseLocal = function setUseLocal(useLocal) {
    this._useLocal = useLocal;
  };
  _proto.addDynamicRenderDrawInfo = function addDynamicRenderDrawInfo(renderDrawInfo) {
  };
  _proto.removeDynamicRenderDrawInfo = function removeDynamicRenderDrawInfo() {
  };
  _proto.clearDynamicRenderDrawInfos = function clearDynamicRenderDrawInfos() {
  };
  _proto.clearStaticRenderDrawInfos = function clearStaticRenderDrawInfos() {
  };
  _proto.clearRenderDrawInfos = function clearRenderDrawInfos() {
  };
  _proto.setDynamicRenderDrawInfo = function setDynamicRenderDrawInfo(renderDrawInfo, index) {
  };
  _proto.setMaskMode = function setMaskMode(mode) {
    this._maskMode = mode;
  };
  _proto.setFillColorType = function setFillColorType(fillColorType) {
  };
  _proto.getStaticRenderDrawInfo = function getStaticRenderDrawInfo() {
    return null;
  };
  _proto.setNode = function setNode(node) {
    this._node = node;
  };
  _proto.setRenderTransform = function setRenderTransform(renderTransform) {
    this._renderTransform = renderTransform;
  };
  _proto.setStencilStage = function setStencilStage(stage) {
    this._stencilStage = stage;
  };
  _proto.initSharedBuffer = function initSharedBuffer() {
  };
  return _createClass(RenderEntity, [{
    key: "nativeObj",
    get: function get() {
      return this._nativeObj;
    }
  }, {
    key: "renderDrawInfoArr",
    get: function get() {
      return this._dynamicDrawInfoArr;
    }
  }, {
    key: "renderEntityType",
    get: function get() {
      return this._renderEntityType;
    }
  }, {
    key: "color",
    get: function get() {
      return this._color;
    },
    set: function set(val) {
      this._color = val;
    }
  }, {
    key: "colorDirty",
    get: function get() {
      return this._colorDirty;
    },
    set: function set(val) {
      this._colorDirty = val;
    }
  }, {
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
    }
  }]);
}();

var DEFAULT_STRIDE = getAttributeStride(vfmtPosUvColor) >> 2;
var BaseRenderData = function () {
  function BaseRenderData(vertexFormat) {
    if (vertexFormat === void 0) {
      vertexFormat = vfmtPosUvColor;
    }
    this.chunk = null;
    this._renderDrawInfo = null;
    this._material = null;
    this._dataHash = 0;
    this._isMeshBuffer = false;
    this._vc = 0;
    this._ic = 0;
    this._floatStride = 0;
    this._vertexFormat = vfmtPosUvColor;
    this._drawInfoType = RenderDrawInfoType.COMP;
    this._multiOwner = false;
    this._batcher = null;
    this._floatStride = vertexFormat === vfmtPosUvColor ? DEFAULT_STRIDE : getAttributeStride(vertexFormat) >> 2;
    this._vertexFormat = vertexFormat;
  }
  var _proto = BaseRenderData.prototype;
  _proto.isValid = function isValid() {
    return this._ic > 0 && this.chunk.vertexAccessor;
  };
  _proto.initRenderDrawInfo = function initRenderDrawInfo(comp, drawInfoType) {
    if (drawInfoType === void 0) {
      drawInfoType = RenderDrawInfoType.COMP;
    }
  };
  _proto.removeRenderDrawInfo = function removeRenderDrawInfo(comp) {
  };
  _proto.setRenderDrawInfoAttributes = function setRenderDrawInfoAttributes() {
  };
  return _createClass(BaseRenderData, [{
    key: "vertexCount",
    get: function get() {
      return this._vc;
    }
  }, {
    key: "indexCount",
    get: function get() {
      return this._ic;
    }
  }, {
    key: "stride",
    get: function get() {
      return this._floatStride << 2;
    }
  }, {
    key: "floatStride",
    get: function get() {
      return this._floatStride;
    }
  }, {
    key: "vertexFormat",
    get: function get() {
      return this._vertexFormat;
    }
  }, {
    key: "drawInfoType",
    get: function get() {
      return this._drawInfoType;
    },
    set: function set(type) {
      this._drawInfoType = type;
    }
  }, {
    key: "renderDrawInfo",
    get: function get() {
      return this._renderDrawInfo;
    }
  }, {
    key: "material",
    get: function get() {
      return this._material;
    },
    set: function set(val) {
      this._material = val;
    }
  }, {
    key: "dataHash",
    get: function get() {
      return this._dataHash;
    },
    set: function set(val) {
      this._dataHash = val;
    }
  }, {
    key: "multiOwner",
    get: function get() {
      return this._multiOwner;
    },
    set: function set(val) {
      this._multiOwner = val;
    }
  }, {
    key: "batcher",
    get: function get() {
      if (!this._batcher) {
        this._batcher = director.root.batcher2D;
      }
      return this._batcher;
    }
  }]);
}();
var RenderData = function (_BaseRenderData2) {
  function RenderData(vertexFormat, accessor) {
    var _this;
    if (vertexFormat === void 0) {
      vertexFormat = vfmtPosUvColor;
    }
    if (accessor === void 0) {
      accessor = null;
    }
    _this = _BaseRenderData2.call(this, vertexFormat) || this;
    _this._vertDirty = true;
    _this._textureHash = 0;
    _this.indices = null;
    _this.layer = 0;
    _this.nodeDirty = true;
    _this.passDirty = true;
    _this.textureDirty = true;
    _this.hashDirty = true;
    _this._data = [];
    _this._frame = null;
    _this._accessor = null;
    _this.vertexRow = 1;
    _this.vertexCol = 1;
    if (!accessor) {
      accessor = _this.batcher.switchBufferAccessor(_this._vertexFormat);
    }
    _this._accessor = accessor;
    return _this;
  }
  _inheritsLoose(RenderData, _BaseRenderData2);
  RenderData.add = function add(vertexFormat, accessor) {
    if (vertexFormat === void 0) {
      vertexFormat = vfmtPosUvColor;
    }
    if (accessor === void 0) {
      accessor = null;
    }
    var rd = new RenderData(vertexFormat, accessor);
    if (!accessor) {
      var batcher = director.root.batcher2D;
      accessor = batcher.switchBufferAccessor(rd._vertexFormat);
    }
    rd._accessor = accessor;
    return rd;
  };
  RenderData.remove = function remove(data) {
    data.clear();
    data._accessor = null;
  };
  var _proto2 = RenderData.prototype;
  _proto2.resize = function resize(vertexCount, indexCount) {
    if (vertexCount === this._vc && indexCount === this._ic && this.chunk) return;
    this._vc = vertexCount;
    this._ic = indexCount;
    if (this.chunk) {
      this._accessor.recycleChunk(this.chunk);
      this.chunk = null;
    }
    this.chunk = this._accessor.allocateChunk(vertexCount, indexCount);
    this.updateHash();
  };
  _proto2.updateSize = function updateSize(vertexCount, indexCount) {
    this._vc = vertexCount;
    this._ic = indexCount;
  };
  _proto2.setRenderDrawInfoAttributes = function setRenderDrawInfoAttributes() {
  };
  _proto2.fillDrawInfoAttributes = function fillDrawInfoAttributes(drawInfo) {
  };
  _proto2.syncRender2dBuffer = function syncRender2dBuffer() {
  };
  _proto2.resizeAndCopy = function resizeAndCopy(vertexCount, indexCount) {
    if (vertexCount === this._vc && indexCount === this._ic && this.chunk) return;
    this._vc = vertexCount;
    this._ic = indexCount;
    var oldChunk = this.chunk;
    this.chunk = this._accessor.allocateChunk(vertexCount, indexCount);
    if (oldChunk) {
      this.chunk.vb.set(oldChunk.vb);
      this._accessor.recycleChunk(oldChunk);
    }
    this.updateHash();
  };
  _proto2.getMeshBuffer = function getMeshBuffer() {
    if (this.chunk && this._accessor) {
      return this._accessor.getMeshBuffer(this.chunk.bufferId);
    } else {
      return null;
    }
  };
  _proto2.updateNode = function updateNode(comp) {
    this.layer = comp.node.layer;
    this.nodeDirty = false;
    this.hashDirty = true;
  };
  _proto2.updatePass = function updatePass(comp) {
    this.material = comp.getRenderMaterial(0);
    this.passDirty = false;
    this.hashDirty = true;
  };
  _proto2.updateTexture = function updateTexture(frame) {
    this.frame = frame;
    this.textureHash = frame.getHash();
    this.textureDirty = false;
    this.hashDirty = true;
  };
  _proto2.updateHash = function updateHash() {
    var bid = this.chunk ? this.chunk.bufferId : -1;
    var hashString = "" + bid + this.layer + " " + this.textureHash;
    this.dataHash = murmurhash2_32_gc(hashString, 666);
    this.hashDirty = false;
  };
  _proto2.updateRenderData = function updateRenderData(comp, frame) {
    if (this.passDirty) {
      this.material = comp.getRenderMaterial(0);
      this.passDirty = false;
      this.hashDirty = true;
    }
    if (this.nodeDirty) {
      var renderScene = comp.node.scene ? comp._getRenderScene() : null;
      this.layer = comp.node.layer;
      if (renderScene !== null) {
        this.nodeDirty = false;
      }
      this.hashDirty = true;
    }
    if (this.textureDirty) {
      this.frame = frame;
      this.textureHash = frame.getHash();
      this.textureDirty = false;
      this.hashDirty = true;
    }
    if (this.hashDirty) {
      this.updateHash();
    }
  };
  _proto2.clear = function clear() {
    this.resize(0, 0);
    this._data.length = 0;
    this.indices = null;
    this.vertDirty = true;
    this.material = null;
    this.nodeDirty = true;
    this.passDirty = true;
    this.textureDirty = true;
    this.hashDirty = true;
    this.layer = 0;
    this.frame = null;
    this.textureHash = 0;
    this.dataHash = 0;
  };
  RenderData.createStaticVBAccessor = function createStaticVBAccessor(attributes, vCount, iCount) {
    var device = director.root.device;
    var accessor = new StaticVBAccessor(device, attributes, vCount, iCount);
    return accessor;
  };
  return _createClass(RenderData, [{
    key: "dataLength",
    get: function get() {
      return this._data.length;
    },
    set: function set(length) {
      var data = this._data;
      if (data.length !== length) {
        for (var i = data.length; i < length; i++) {
          data.push({
            x: 0,
            y: 0,
            z: 0,
            u: 0,
            v: 0,
            color: Color.WHITE.clone()
          });
        }
        data.length = length;
      }
      this.syncRender2dBuffer();
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    }
  }, {
    key: "vertDirty",
    get: function get() {
      return this._vertDirty;
    },
    set: function set(val) {
      this._vertDirty = val;
    }
  }, {
    key: "textureHash",
    get: function get() {
      return this._textureHash;
    },
    set: function set(val) {
      this._textureHash = val;
    }
  }, {
    key: "frame",
    get: function get() {
      return this._frame;
    },
    set: function set(val) {
      this._frame = val;
    }
  }, {
    key: "accessor",
    get: function get() {
      return this._accessor;
    }
  }]);
}(BaseRenderData);
var MeshRenderData = function (_BaseRenderData3) {
  function MeshRenderData(vertexFormat) {
    var _this2;
    if (vertexFormat === void 0) {
      vertexFormat = vfmtPosUvColor;
    }
    _this2 = _BaseRenderData3.call(this, vertexFormat) || this;
    _this2._isMeshBuffer = true;
    _this2.vertexStart = 0;
    _this2.vertexRange = 0;
    _this2.indexStart = 0;
    _this2.indexRange = 0;
    _this2.lastFilledIndex = 0;
    _this2.lastFilledVertex = 0;
    _this2.frame = null;
    _this2._byteLength = 0;
    _this2._vertexBuffers = [];
    _this2._indexBuffer = null;
    _this2._iaPool = null;
    _this2._iaInfo = null;
    _this2.vData = new Float32Array(256 * _this2.stride);
    _this2.iData = new Uint16Array(256 * 6);
    return _this2;
  }
  _inheritsLoose(MeshRenderData, _BaseRenderData3);
  MeshRenderData.add = function add(vertexFormat) {
    if (vertexFormat === void 0) {
      vertexFormat = vfmtPosUvColor;
    }
    var rd = new MeshRenderData();
    rd._floatStride = vertexFormat === vfmtPosUvColor ? DEFAULT_STRIDE : getAttributeStride(vertexFormat) >> 2;
    rd._vertexFormat = vertexFormat;
    return rd;
  };
  MeshRenderData.remove = function remove(data) {
    data.clear();
  };
  var _proto3 = MeshRenderData.prototype;
  _proto3.request = function request(vertexCount, indexCount) {
    var byteOffset = this._byteLength + vertexCount * this.stride;
    var succeed = this.reserve(vertexCount, indexCount);
    if (!succeed) return false;
    this._vc += vertexCount;
    this._ic += indexCount;
    this._byteLength = byteOffset;
    this.vertexRange = this._vc;
    this.indexRange = this._ic;
    return true;
  };
  _proto3.reserve = function reserve(vertexCount, indexCount) {
    var newVBytes = this._byteLength + vertexCount * this.stride;
    var newICount = this.indexCount + indexCount;
    if (vertexCount + this.vertexCount > 65535) {
      return false;
    }
    var byteLength = this.vData.byteLength;
    var indicesLength = this.iData.length;
    var vCount = this.vData.length;
    var iCount = this.iData.length;
    if (newVBytes > byteLength || newICount > indicesLength) {
      while (byteLength < newVBytes || indicesLength < newICount) {
        vCount *= 2;
        iCount *= 2;
        byteLength = vCount * 4;
        indicesLength = iCount;
      }
      this._reallocBuffer(vCount, iCount);
    }
    return true;
  };
  _proto3.resize = function resize(vertexCount, indexCount) {
    var byteLength = vertexCount * this.stride;
    assertIsTrue(vertexCount >= 0 && indexCount >= 0 && byteLength <= this.vData.byteLength && indexCount <= this.iData.length);
    this._vc = vertexCount;
    this._ic = indexCount;
    this._byteLength = byteLength;
    this.updateRange(0, vertexCount, 0, indexCount);
  };
  _proto3.updateRange = function updateRange(vertOffset, vertexCount, indexOffset, indexCount) {
    assertIsTrue(vertexCount >= 0 && indexCount >= 0 && vertexCount <= this._vc && indexCount <= this._ic);
    this.vertexStart = vertOffset;
    this.indexStart = indexOffset;
    this.vertexRange = vertexCount;
    this.indexRange = indexCount;
  };
  _proto3.requestIA = function requestIA(device) {
    this._initIAInfo(device);
    var ia = this._iaPool.add();
    ia.firstIndex = this.indexStart;
    ia.indexCount = this.indexRange;
    return ia;
  };
  _proto3.uploadBuffers = function uploadBuffers() {
    if (this._byteLength === 0 || !this._vertexBuffers[0] || !this._indexBuffer) {
      return;
    }
    var indexCount = this._ic;
    var verticesData = new Float32Array(this.vData.buffer, 0, this._byteLength >> 2);
    var indicesData = new Uint16Array(this.iData.buffer, 0, indexCount);
    var vertexBuffer = this._vertexBuffers[0];
    if (this._byteLength > vertexBuffer.size) {
      vertexBuffer.resize(this._byteLength);
    }
    vertexBuffer.update(verticesData);
    var indexBytes = indexCount << 1;
    if (indexBytes > this._indexBuffer.size) {
      this._indexBuffer.resize(indexBytes);
    }
    this._indexBuffer.update(indicesData);
  };
  _proto3.freeIAPool = function freeIAPool() {
    if (this._iaPool) {
      this._iaPool.reset();
    }
  };
  _proto3.reset = function reset() {
    this._vc = 0;
    this._ic = 0;
    this._byteLength = 0;
    this.vertexStart = 0;
    this.vertexRange = 0;
    this.indexStart = 0;
    this.indexRange = 0;
    this.lastFilledIndex = 0;
    this.lastFilledVertex = 0;
    this.material = null;
    this.freeIAPool();
  };
  _proto3.clear = function clear() {
    this.reset();
    if (this._iaPool) {
      this._iaPool.destroy();
    }
    if (this._vertexBuffers[0]) {
      this._vertexBuffers[0].destroy();
      this._vertexBuffers = [];
    }
    this._iaInfo = null;
    this.vData = new Float32Array(256 * this.stride);
    this.iData = new Uint16Array(256 * 6);
  };
  _proto3._initIAInfo = function _initIAInfo(device) {
    var _this3 = this;
    if (!this._iaInfo) {
      var vbStride = this.stride;
      var vbs = this._vertexBuffers;
      if (!vbs.length) {
        vbs.push(device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, vbStride, vbStride)));
      }
      var ibStride = Uint16Array.BYTES_PER_ELEMENT;
      if (!this._indexBuffer) {
        this._indexBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, ibStride, ibStride));
      }
      this._iaInfo = new InputAssemblerInfo(this._vertexFormat, vbs, this._indexBuffer);
      this._iaPool = new RecyclePool(function () {
        return device.createInputAssembler(_this3._iaInfo);
      }, 1, function (ia) {
        ia.destroy();
      });
    }
  };
  _proto3._reallocBuffer = function _reallocBuffer(vCount, iCount) {
    var oldVData = this.vData;
    this.vData = new Float32Array(vCount);
    if (oldVData) {
      this.vData.set(oldVData, 0);
    }
    var oldIData = this.iData;
    this.iData = new Uint16Array(iCount);
    if (oldIData) {
      this.iData.set(oldIData, 0);
    }
  };
  _proto3.setRenderDrawInfoAttributes = function setRenderDrawInfoAttributes() {
  };
  _proto3.particleInitRenderDrawInfo = function particleInitRenderDrawInfo(entity) {
  };
  return _createClass(MeshRenderData, [{
    key: "formatByte",
    get: function get() {
      return this.stride;
    },
    set: function set(value) {}
  }, {
    key: "floatStride",
    get: function get() {
      return this._floatStride;
    }
  }, {
    key: "vDataOffset",
    get: function get() {
      return this._byteLength >>> 2;
    }
  }]);
}(BaseRenderData);

var _dec$1, _dec2$1, _class$1, _class2$1, _initializer$1, _initializer2$1, _UITransform;
var _vec2a = new Vec2();
var _vec2b = new Vec2();
var _vec3a = new Vec3();
var _mat4_temp = new Mat4();
var _matrix = new Mat4();
var _worldMatrix = new Mat4();
var _zeroMatrix = new Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
var _rect = new Rect();
var UITransform = (_dec$1 = ccclass('cc.UITransform'), _dec2$1 = executionOrder(110), _dec$1(_class$1 = _dec2$1(_class$1 = disallowMultiple(_class$1 = (_class2$1 = (_UITransform = function (_Component) {
  function UITransform() {
    var _this;
    _this = _Component.call(this) || this;
    _this._priority = 0;
    _this._contentSize = _initializer$1 && _initializer$1();
    _this._anchorPoint = _initializer2$1 && _initializer2$1();
    return _this;
  }
  _inheritsLoose(UITransform, _Component);
  var _proto = UITransform.prototype;
  _proto.__preload = function __preload() {
    this.node._uiProps.uiTransformComp = this;
  };
  _proto.onLoad = function onLoad() {
    if (this.node.parent) {
      UITransform.insertChangeMap(this.node.parent);
    }
  };
  _proto.onEnable = function onEnable() {
    this.node.on(NodeEventType.PARENT_CHANGED, this._parentChanged, this);
    this._markRenderDataDirty();
  };
  _proto.onDisable = function onDisable() {
    this.node.off(NodeEventType.PARENT_CHANGED, this._parentChanged, this);
  };
  _proto.onDestroy = function onDestroy() {
    this.node._uiProps.uiTransformComp = null;
  };
  _proto.setContentSize = function setContentSize(size, height) {
    var locContentSize = this._contentSize;
    var locWidth;
    var locHeight;
    if (height === undefined) {
      size = size;
      if (approx(size.width, locContentSize.width, EPSILON) && approx(size.height, locContentSize.height, EPSILON)) {
        return;
      }
      locWidth = size.width;
      locHeight = size.height;
    } else {
      size = size;
      if (approx(size, locContentSize.width, EPSILON) && approx(height, locContentSize.height, EPSILON)) {
        return;
      }
      locWidth = size;
      locHeight = height;
    }
    {
      locContentSize.width = locWidth;
      locContentSize.height = locHeight;
      this.node.emit(NodeEventType.SIZE_CHANGED);
    }
    this._markRenderDataDirty();
  };
  _proto.setAnchorPoint = function setAnchorPoint(point, y) {
    var locAnchorPoint = this._anchorPoint;
    if (y === undefined) {
      point = point;
      if (point.x === locAnchorPoint.x && point.y === locAnchorPoint.y) {
        return;
      }
      locAnchorPoint.x = point.x;
      locAnchorPoint.y = point.y;
    } else {
      if (point === locAnchorPoint.x && y === locAnchorPoint.y) {
        return;
      }
      locAnchorPoint.x = point;
      locAnchorPoint.y = y;
    }
    this.node.emit(NodeEventType.ANCHOR_CHANGED, this._anchorPoint);
    this._markRenderDataDirty();
  };
  _proto.isHit = function isHit(uiPoint) {
    var w = this._contentSize.width;
    var h = this._contentSize.height;
    var v2WorldPt = _vec2a;
    var testPt = _vec2b;
    var cameras = this._getRenderScene().cameras;
    for (var i = 0; i < cameras.length; i++) {
      var camera = cameras[i];
      if (!(camera.visibility & this.node.layer)) continue;
      camera.node.getWorldRT(_mat4_temp);
      var m12 = _mat4_temp.m12;
      var m13 = _mat4_temp.m13;
      var center = visibleRect.center;
      _mat4_temp.m12 = center.x - (_mat4_temp.m00 * m12 + _mat4_temp.m04 * m13);
      _mat4_temp.m13 = center.y - (_mat4_temp.m01 * m12 + _mat4_temp.m05 * m13);
      Mat4.invert(_mat4_temp, _mat4_temp);
      Vec2.transformMat4(v2WorldPt, uiPoint, _mat4_temp);
      this.node.getWorldMatrix(_worldMatrix);
      Mat4.invert(_mat4_temp, _worldMatrix);
      if (Mat4.strictEquals(_mat4_temp, _zeroMatrix)) {
        continue;
      }
      Vec2.transformMat4(testPt, v2WorldPt, _mat4_temp);
      testPt.x += this._anchorPoint.x * w;
      testPt.y += this._anchorPoint.y * h;
      var hit = false;
      if (testPt.x >= 0 && testPt.y >= 0 && testPt.x <= w && testPt.y <= h) {
        hit = this._maskTest(v2WorldPt);
      }
      if (hit) {
        return true;
      }
    }
    return false;
  };
  _proto.hitTest = function hitTest(screenPoint, windowId) {
    if (windowId === void 0) {
      windowId = 0;
    }
    var w = this._contentSize.width;
    var h = this._contentSize.height;
    var v3WorldPt = _vec3a;
    var v2WorldPt = _vec2a;
    var testPt = _vec2b;
    var cameras = this._getRenderScene().cameras;
    for (var i = 0; i < cameras.length; i++) {
      var camera = cameras[i];
      if (!(camera.visibility & this.node.layer) || camera.window && !camera.window.swapchain) {
        continue;
      }
      if (camera.systemWindowId !== windowId) {
        continue;
      }
      Vec3.set(v3WorldPt, screenPoint.x, screenPoint.y, 0);
      camera.screenToWorld(v3WorldPt, v3WorldPt);
      Vec2.set(v2WorldPt, v3WorldPt.x, v3WorldPt.y);
      this.node.getWorldMatrix(_worldMatrix);
      Mat4.invert(_mat4_temp, _worldMatrix);
      if (Mat4.strictEquals(_mat4_temp, _zeroMatrix)) {
        continue;
      }
      Vec2.transformMat4(testPt, v2WorldPt, _mat4_temp);
      testPt.x += this._anchorPoint.x * w;
      testPt.y += this._anchorPoint.y * h;
      var hit = false;
      if (testPt.x >= 0 && testPt.y >= 0 && testPt.x <= w && testPt.y <= h) {
        hit = this._maskTest(v2WorldPt);
      }
      if (hit) {
        return true;
      }
    }
    return false;
  };
  _proto._maskTest = function _maskTest(pointInWorldSpace) {
    var _this$node, _this$node$eventProce;
    var maskList = (_this$node = this.node) == null ? void 0 : (_this$node$eventProce = _this$node.eventProcessor) == null ? void 0 : _this$node$eventProce.maskList;
    if (maskList) {
      var parent = this.node;
      var length = maskList.length;
      for (var i = 0, j = 0; parent && j < length; ++i, parent = parent.parent) {
        var temp = maskList[j];
        if (i === temp.index) {
          if (parent === temp.comp.node) {
            var comp = temp.comp;
            if (comp && comp._enabled && !comp.isHit(pointInWorldSpace)) {
              return false;
            }
            j++;
          } else {
            maskList.length = j;
            break;
          }
        } else if (i > temp.index) {
          maskList.length = j;
          break;
        }
      }
    }
    return true;
  };
  _proto.convertToNodeSpaceAR = function convertToNodeSpaceAR(worldPoint, out) {
    this.node.getWorldMatrix(_worldMatrix);
    Mat4.invert(_mat4_temp, _worldMatrix);
    if (!out) {
      out = new Vec3();
    }
    return Vec3.transformMat4(out, worldPoint, _mat4_temp);
  };
  _proto.convertToWorldSpaceAR = function convertToWorldSpaceAR(nodePoint, out) {
    this.node.getWorldMatrix(_worldMatrix);
    if (!out) {
      out = new Vec3();
    }
    return Vec3.transformMat4(out, nodePoint, _worldMatrix);
  };
  _proto.getBoundingBox = function getBoundingBox() {
    var rect = new Rect();
    this._selfBoundingBox(rect);
    Mat4.fromSRT(_matrix, this.node.rotation, this.node.position, this.node.scale);
    rect.transformMat4(_matrix);
    return rect;
  };
  _proto.getBoundingBoxToWorld = function getBoundingBoxToWorld() {
    var rect = new Rect();
    var locChildren = this.node.children;
    for (var i = 0; i < locChildren.length; ++i) {
      var child = locChildren[i];
      if (child && child.active) {
        var uiTransform = child.getComponent(UITransform);
        if (uiTransform && uiTransform.contentSize.width && uiTransform.contentSize.height) {
          uiTransform._selfBoundingBox(_rect);
          _rect.transformMat4(child.worldMatrix);
          if (rect.width === 0) {
            rect.set(_rect);
          } else {
            Rect.union(rect, rect, _rect);
          }
        }
      }
    }
    if (this._contentSize.width && this._contentSize.height) {
      this._selfBoundingBox(_rect);
      _rect.transformMat4(this.node.worldMatrix);
      if (rect.width === 0) {
        rect.set(_rect);
      } else {
        Rect.union(rect, rect, _rect);
      }
    }
    return rect;
  };
  _proto.getBoundingBoxTo = function getBoundingBoxTo(targetMat) {
    var rect = new Rect();
    var locChildren = this.node.children;
    Mat4.invert(_mat4_temp, targetMat);
    for (var i = 0; i < locChildren.length; ++i) {
      var child = locChildren[i];
      if (child && child.active) {
        var uiTransform = child.getComponent(UITransform);
        if (uiTransform && uiTransform.contentSize.width && uiTransform.contentSize.height) {
          uiTransform._selfBoundingBox(_rect);
          Mat4.multiply(_matrix, child.worldMatrix, _mat4_temp);
          _rect.transformMat4(_matrix);
          if (rect.width === 0) {
            rect.set(_rect);
          } else {
            Rect.union(rect, rect, _rect);
          }
        }
      }
    }
    if (this._contentSize.width && this._contentSize.height) {
      this._selfBoundingBox(_rect);
      Mat4.multiply(_matrix, this.node.worldMatrix, _mat4_temp);
      _rect.transformMat4(_matrix);
      if (rect.width === 0) {
        rect.set(_rect);
      } else {
        Rect.union(rect, rect, _rect);
      }
    }
    return rect;
  };
  _proto.getComputeAABB = function getComputeAABB(out) {
    var width = this._contentSize.width;
    var height = this._contentSize.height;
    _rect.set(-this._anchorPoint.x * width, -this._anchorPoint.y * height, width, height);
    _rect.transformMat4(this.node.worldMatrix);
    var px = _rect.x + _rect.width * 0.5;
    var py = _rect.y + _rect.height * 0.5;
    var pz = this.node.worldPosition.z;
    var w = _rect.width / 2;
    var h = _rect.height / 2;
    var l = 0.001;
    if (out != null) {
      AABB.set(out, px, py, pz, w, h, l);
      return out;
    } else {
      return new AABB(px, py, pz, w, h, l);
    }
  };
  _proto._selfBoundingBox = function _selfBoundingBox(out) {
    var width = this._contentSize.width;
    var height = this._contentSize.height;
    out.set(-this._anchorPoint.x * width, -this._anchorPoint.y * height, width, height);
    return out;
  };
  _proto._parentChanged = function _parentChanged(node) {
    if (this.node.getComponent('cc.RenderRoot2D')) {
      return;
    }
    if (this.node.parent) {
      UITransform.insertChangeMap(this.node.parent);
    }
  };
  _proto._markRenderDataDirty = function _markRenderDataDirty() {
    var uiComp = this.node._uiProps.uiComp;
    if (uiComp) {
      uiComp._markForUpdateRenderData();
    }
  };
  UITransform.insertChangeMap = function insertChangeMap(node) {
    var key = node.uuid;
    if (!UITransform.priorityChangeNodeMap.has(key)) {
      UITransform.priorityChangeNodeMap.set(key, node);
    }
  };
  UITransform._sortChildrenSibling = function _sortChildrenSibling(node) {
    var siblings = node.children;
    if (siblings) {
      siblings.sort(function (a, b) {
        var aComp = a._getUITransformComp();
        var bComp = b._getUITransformComp();
        var ca = aComp ? aComp._priority : 0;
        var cb = bComp ? bComp._priority : 0;
        var diff = ca - cb;
        if (diff === 0) return a.siblingIndex - b.siblingIndex;
        return diff;
      });
    }
  };
  UITransform._sortSiblings = function _sortSiblings() {
    UITransform.priorityChangeNodeMap.forEach(function (node, ID) {
      UITransform._sortChildrenSibling(node);
      node._updateSiblingIndex();
      node.emit('childrenSiblingOrderChanged');
    });
    UITransform.priorityChangeNodeMap.clear();
  };
  UITransform._cleanChangeMap = function _cleanChangeMap() {
    UITransform.priorityChangeNodeMap.clear();
  };
  return _createClass(UITransform, [{
    key: "contentSize",
    get: function get() {
      return this._contentSize;
    },
    set: function set(value) {
      if (this._contentSize.equals(value)) {
        return;
      }
      {
        this._contentSize.set(value);
        this.node.emit(NodeEventType.SIZE_CHANGED);
      }
      this._markRenderDataDirty();
    }
  }, {
    key: "width",
    get: function get() {
      return this._contentSize.width;
    },
    set: function set(value) {
      if (this._contentSize.width === value) {
        return;
      }
      {
        this._contentSize.width = value;
        this.node.emit(NodeEventType.SIZE_CHANGED);
      }
      this._markRenderDataDirty();
    }
  }, {
    key: "height",
    get: function get() {
      return this._contentSize.height;
    },
    set: function set(value) {
      if (this.contentSize.height === value) {
        return;
      }
      {
        this._contentSize.height = value;
        this.node.emit(NodeEventType.SIZE_CHANGED);
      }
      this._markRenderDataDirty();
    }
  }, {
    key: "anchorPoint",
    get: function get() {
      return this._anchorPoint;
    },
    set: function set(value) {
      if (this._anchorPoint.equals(value)) {
        return;
      }
      this._anchorPoint.set(value);
      this.node.emit(NodeEventType.ANCHOR_CHANGED, this._anchorPoint);
      this._markRenderDataDirty();
    }
  }, {
    key: "anchorX",
    get: function get() {
      return this._anchorPoint.x;
    },
    set: function set(value) {
      if (this._anchorPoint.x === value) {
        return;
      }
      this._anchorPoint.x = value;
      this.node.emit(NodeEventType.ANCHOR_CHANGED, this._anchorPoint);
      this._markRenderDataDirty();
    }
  }, {
    key: "anchorY",
    get: function get() {
      return this._anchorPoint.y;
    },
    set: function set(value) {
      if (this._anchorPoint.y === value) {
        return;
      }
      this._anchorPoint.y = value;
      this.node.emit(NodeEventType.ANCHOR_CHANGED, this._anchorPoint);
      this._markRenderDataDirty();
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    },
    set: function set(value) {
      if (this._priority === value) {
        return;
      }
      if (this.node.getComponent('cc.RenderRoot2D')) {
        warnID(6706);
        return;
      }
      this._priority = value;
      if (this.node.parent) {
        UITransform.insertChangeMap(this.node.parent);
      }
    }
  }, {
    key: "visibility",
    get: function get() {
      var camera = director.root.batcher2D.getFirstRenderCamera(this.node);
      return camera ? camera.visibility : 0;
    }
  }, {
    key: "cameraPriority",
    get: function get() {
      var camera = director.root.batcher2D.getFirstRenderCamera(this.node);
      return camera ? camera.priority : 0;
    }
  }]);
}(Component), _UITransform.EventType = NodeEventType, _UITransform.priorityChangeNodeMap = new Map(), _UITransform), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_contentSize", [serializable], function () {
  return new Size(100, 100);
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_anchorPoint", [serializable], function () {
  return new Vec2(0.5, 0.5);
}), _class2$1)) || _class$1) || _class$1) || _class$1);
director.on(DirectorEvent.AFTER_UPDATE, UITransform._sortSiblings);
director.on(DirectorEvent.BEFORE_SCENE_LAUNCH, UITransform._cleanChangeMap);

var _dec, _dec2, _dec3, _dec4, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _UIRenderer;
ccenum(BlendFactor);
ccenum(BlendOp);
ccenum(ColorMask);
var InstanceMaterialType;
(function (InstanceMaterialType) {
  InstanceMaterialType[InstanceMaterialType["ADD_COLOR"] = 0] = "ADD_COLOR";
  InstanceMaterialType[InstanceMaterialType["ADD_COLOR_AND_TEXTURE"] = 1] = "ADD_COLOR_AND_TEXTURE";
  InstanceMaterialType[InstanceMaterialType["GRAYSCALE"] = 2] = "GRAYSCALE";
  InstanceMaterialType[InstanceMaterialType["USE_ALPHA_SEPARATED"] = 3] = "USE_ALPHA_SEPARATED";
  InstanceMaterialType[InstanceMaterialType["USE_ALPHA_SEPARATED_AND_GRAY"] = 4] = "USE_ALPHA_SEPARATED_AND_GRAY";
})(InstanceMaterialType || (InstanceMaterialType = {}));
var UIRenderer = (_dec = ccclass('cc.UIRenderer'), _dec2 = requireComponent(UITransform), _dec3 = type(Material), _dec4 = type(Material), _dec(_class = _dec2(_class = (_class2 = (_UIRenderer = function (_Renderer) {
  function UIRenderer() {
    var _this;
    _this = _Renderer.call(this) || this;
    _this._renderData = null;
    _this._materials = _initializer && _initializer();
    _this._customMaterial = _initializer2 && _initializer2();
    _this._srcBlendFactor = _initializer3 && _initializer3();
    _this._dstBlendFactor = _initializer4 && _initializer4();
    _this._color = _initializer5 && _initializer5();
    _this._stencilStage = Stage.DISABLED;
    _this._assembler = null;
    _this._postAssembler = null;
    _this._renderFlag = true;
    _this._instanceMaterialType = -1;
    _this._srcBlendFactorCache = BlendFactor.SRC_ALPHA;
    _this._dstBlendFactorCache = BlendFactor.ONE_MINUS_SRC_ALPHA;
    _this._dirtyVersion = -1;
    _this._internalId = -1;
    _this._flagChangedVersion = -1;
    _this._priority = 0;
    _this._fillColorType = RenderEntityFillColorType.COLOR;
    _this._lastParent = null;
    _this._renderEntity = _this.createRenderEntity();
    {
      _this.priority = SortingLayers.getDefaultPriority();
    }
    return _this;
  }
  _inheritsLoose(UIRenderer, _Renderer);
  var _proto = UIRenderer.prototype;
  _proto.setRenderData = function setRenderData(renderData) {
    this._renderData = renderData;
  };
  _proto.getFillColorType = function getFillColorType() {
    return this._fillColorType;
  };
  _proto.setFillColorType = function setFillColorType(val) {
    this._fillColorType = val;
  };
  _proto.onLoad = function onLoad() {
    this._renderEntity.setNode(this.node);
  };
  _proto.__preload = function __preload() {
    this.node._uiProps.uiComp = this;
    if (this._flushAssembler) {
      this._flushAssembler();
    }
  };
  _proto.onEnable = function onEnable() {
    this.node.on(NodeEventType.ANCHOR_CHANGED, this._nodeStateChange, this);
    this.node.on(NodeEventType.SIZE_CHANGED, this._nodeStateChange, this);
    this.node.on(NodeEventType.PARENT_CHANGED, this._colorDirty, this);
    if (!this._renderData && this._flushAssembler) {
      this._flushAssembler();
    }
    this.updateMaterial();
    this._colorDirty();
    uiRendererManager.addRenderer(this);
    this._markForUpdateRenderData();
  };
  _proto.onRestore = function onRestore() {
    this.updateMaterial();
    this._markForUpdateRenderData();
  };
  _proto._destroyData = function _destroyData() {
    this.destroyRenderData();
    if (this._materials) {
      for (var i = 0; i < this._materials.length; i++) {
        this.setSharedMaterial(null, i, true);
      }
    }
  };
  _proto.onDisable = function onDisable() {
    this.node.off(NodeEventType.ANCHOR_CHANGED, this._nodeStateChange, this);
    this.node.off(NodeEventType.SIZE_CHANGED, this._nodeStateChange, this);
    this.node.off(NodeEventType.PARENT_CHANGED, this._colorDirty, this);
    this.destroyRenderData();
    uiRendererManager.removeRenderer(this);
    this._renderFlag = false;
    this._renderEntity.enabled = false;
  };
  _proto.onDestroy = function onDestroy() {
    this._renderEntity.setNode(null);
    if (this.node._uiProps.uiComp === this) {
      this.node._uiProps.uiComp = null;
    }
    this._destroyData();
  };
  _proto.markForUpdateRenderData = function markForUpdateRenderData(enable) {
    if (enable === void 0) {
      enable = true;
    }
    this._markForUpdateRenderData(enable);
  };
  _proto._markForUpdateRenderData = function _markForUpdateRenderData(enable) {
    if (enable === void 0) {
      enable = true;
    }
    if (enable) {
      var renderData = this._renderData;
      if (renderData) {
        renderData.vertDirty = true;
      }
      uiRendererManager.markDirtyRenderer(this);
    }
  };
  _proto.requestRenderData = function requestRenderData(drawInfoType) {
    if (drawInfoType === void 0) {
      drawInfoType = RenderDrawInfoType.COMP;
    }
    var data = RenderData.add();
    data.initRenderDrawInfo(this, drawInfoType);
    this._renderData = data;
    return data;
  };
  _proto.destroyRenderData = function destroyRenderData() {
    this.renderEntity.clearRenderDrawInfos();
    if (!this._renderData) {
      return;
    }
    RenderData.remove(this._renderData);
    this._renderData = null;
  };
  _proto.updateRenderer = function updateRenderer() {
    var assembler = this._assembler;
    if (assembler && assembler.updateRenderData) {
      assembler.updateRenderData(this);
    }
    this._renderFlag = this._canRender();
    this._renderEntity.enabled = this._renderFlag;
  };
  _proto.fillBuffers = function fillBuffers(render) {
    if (this._renderFlag) {
      this._render(render);
    }
  };
  _proto.postUpdateAssembler = function postUpdateAssembler(render) {
    if (this._postAssembler && this._renderFlag) {
      this._postRender(render);
    }
  };
  _proto._render = function _render(render) {};
  _proto._postRender = function _postRender(render) {};
  _proto._canRender = function _canRender() {
    {
      assert(this.isValid, 'this component should not be invalid!');
    }
    return this.getSharedMaterial(0) !== null && this._enabled && this._color.a > 0;
  };
  _proto._postCanRender = function _postCanRender() {};
  _proto.updateMaterial = function updateMaterial() {
    if (this._customMaterial) {
      if (this.getSharedMaterial(0) !== this._customMaterial) {
        this.setSharedMaterial(this._customMaterial, 0);
      }
      return;
    }
    var mat = this._updateBuiltinMaterial();
    this.setSharedMaterial(mat, 0);
    if (this.stencilStage === Stage.ENTER_LEVEL || this.stencilStage === Stage.ENTER_LEVEL_INVERTED) {
      this.getMaterialInstance(0).recompileShaders({
        USE_ALPHA_TEST: true
      });
    }
    this._updateBlendFunc();
  };
  _proto._updateColor = function _updateColor() {
    this._colorDirty();
    this.setEntityColor(this._color);
    var assembler = this._assembler;
    if (assembler) {
      if (assembler.updateColor) {
        assembler.updateColor(this);
      }
      var renderFlag = this._renderFlag;
      this._renderFlag = this._canRender();
      this.setEntityEnabled(this._renderFlag);
      if (renderFlag !== this._renderFlag) {
        var renderData = this.renderData;
        if (renderData) {
          renderData.vertDirty = true;
        }
      }
    }
  };
  _proto.setEntityColorDirty = function setEntityColorDirty(dirty) {
  };
  _proto.setEntityColor = function setEntityColor(color) {
  };
  _proto.setEntityOpacity = function setEntityOpacity(opacity) {
  };
  _proto.setEntityEnabled = function setEntityEnabled(enabled) {
  };
  _proto._updateBlendFunc = function _updateBlendFunc() {
    var target = this.getRenderMaterial(0).passes[0].blendState.targets[0];
    this._dstBlendFactorCache = target.blendDst;
    this._srcBlendFactorCache = target.blendSrc;
    if (this._dstBlendFactorCache !== this._dstBlendFactor || this._srcBlendFactorCache !== this._srcBlendFactor) {
      target = this.getMaterialInstance(0).passes[0].blendState.targets[0];
      target.blend = true;
      target.blendDstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;
      target.blendDst = this._dstBlendFactor;
      target.blendSrc = this._srcBlendFactor;
      var targetPass = this.getMaterialInstance(0).passes[0];
      targetPass.blendState.setTarget(0, target);
      targetPass._updatePassHash();
      this._dstBlendFactorCache = this._dstBlendFactor;
      this._srcBlendFactorCache = this._srcBlendFactor;
    }
  };
  _proto._nodeStateChange = function _nodeStateChange(transformType) {
    if (this._renderData) {
      this._markForUpdateRenderData();
    }
    for (var i = 0; i < this.node.children.length; ++i) {
      var child = this.node.children[i];
      var renderComp = child.getComponent(UIRenderer);
      if (renderComp) {
        renderComp._markForUpdateRenderData();
      }
    }
  };
  _proto._colorDirty = function _colorDirty() {
    this.node._uiProps.colorDirty = true;
    this.setEntityColorDirty(true);
  };
  _proto._onMaterialModified = function _onMaterialModified(idx, material) {
    if (this._renderData) {
      this._markForUpdateRenderData();
      this._renderData.passDirty = true;
    }
    _Renderer.prototype._onMaterialModified.call(this, idx, material);
  };
  _proto._updateBuiltinMaterial = function _updateBuiltinMaterial() {
    var mat;
    switch (this._instanceMaterialType) {
      case InstanceMaterialType.ADD_COLOR:
        mat = builtinResMgr.get("ui-base-material");
        break;
      case InstanceMaterialType.GRAYSCALE:
        mat = builtinResMgr.get("ui-sprite-gray-material");
        break;
      case InstanceMaterialType.USE_ALPHA_SEPARATED:
        mat = builtinResMgr.get("ui-sprite-alpha-sep-material");
        break;
      case InstanceMaterialType.USE_ALPHA_SEPARATED_AND_GRAY:
        mat = builtinResMgr.get("ui-sprite-gray-alpha-sep-material");
        break;
      default:
        mat = builtinResMgr.get("ui-sprite-material");
        break;
    }
    return mat;
  };
  _proto.setNodeDirty = function setNodeDirty() {
    if (this._renderData) {
      this._renderData.nodeDirty = true;
    }
  };
  _proto.setTextureDirty = function setTextureDirty() {
    if (this._renderData) {
      this._renderData.textureDirty = true;
    }
  };
  _proto.createRenderEntity = function createRenderEntity() {
    return new RenderEntity(RenderEntityType.STATIC);
  };
  return _createClass(UIRenderer, [{
    key: "sharedMaterials",
    get: function get() {
      return this._materials;
    },
    set: function set(val) {
      for (var i = 0; i < val.length; i++) {
        if (val[i] !== this._materials[i]) {
          this.setSharedMaterial(val[i], i);
        }
      }
      if (val.length < this._materials.length) {
        for (var _i = val.length; _i < this._materials.length; _i++) {
          this.setSharedMaterial(null, _i);
        }
        this._materials.splice(val.length);
      }
    }
  }, {
    key: "customMaterial",
    get: function get() {
      return this._customMaterial;
    },
    set: function set(val) {
      this._customMaterial = val;
      this.updateMaterial();
    }
  }, {
    key: "color",
    get: function get() {
      return this._color;
    },
    set: function set(value) {
      if (this._color.equals(value)) {
        return;
      }
      this._color.set(value);
      this._updateColor();
    }
  }, {
    key: "renderData",
    get: function get() {
      return this._renderData;
    }
  }, {
    key: "stencilStage",
    get: function get() {
      return this._stencilStage;
    },
    set: function set(val) {
      this._stencilStage = val;
      this._renderEntity.setStencilStage(val);
    }
  }, {
    key: "srcBlendFactor",
    get: function get() {
      return this._srcBlendFactor;
    },
    set: function set(srcBlendFactor) {
      this._srcBlendFactor = srcBlendFactor;
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    },
    set: function set(val) {
      this._priority = val;
    }
  }, {
    key: "batcher",
    get: function get() {
      return director.root.batcher2D;
    }
  }, {
    key: "renderEntity",
    get: function get() {
      {
        assert(Boolean(this._renderEntity), 'this._renderEntity should not be invalid');
      }
      return this._renderEntity;
    }
  }, {
    key: "_useVertexOpacity",
    get: function get() {
      return this._fillColorType === RenderEntityFillColorType.VERTEX;
    },
    set: function set(val) {
      this.setFillColorType(RenderEntityFillColorType.VERTEX);
    }
  }, {
    key: "useVertexOpacity",
    get: function get() {
      return this._fillColorType === RenderEntityFillColorType.VERTEX;
    }
  }]);
}(Renderer), _UIRenderer.BlendState = BlendFactor, _UIRenderer.Assembler = null, _UIRenderer.PostAssembler = null, _UIRenderer), _applyDecoratedDescriptor(_class2.prototype, "sharedMaterials", [override], Object.getOwnPropertyDescriptor(_class2.prototype, "sharedMaterials"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "customMaterial", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "customMaterial"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_materials", [override], function () {
  return [];
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_customMaterial", [_dec4], function () {
  return null;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_srcBlendFactor", [serializable], function () {
  return BlendFactor.SRC_ALPHA;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_dstBlendFactor", [serializable], function () {
  return BlendFactor.ONE_MINUS_SRC_ALPHA;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_color", [serializable], function () {
  return Color.WHITE.clone();
}), _class2)) || _class) || _class);
cclegacy.internal.UIRenderer = UIRenderer;

export { BaseRenderData as B, InstanceMaterialType as I, MeshRenderData as M, RenderEntityFillColorType as R, StencilManager as S, UIRenderer as U, StaticVBAccessor as a, Stage as b, vfmt as c, vfmtPosColor as d, getComponentPerVertex as e, RenderEntity as f, getAttributeStride as g, RenderEntityType as h, UITransform as i, RenderDrawInfo as j, RenderDrawInfoType as k, RenderData as l, vfmtPosUvColor4B as m, vfmtPosUvTwoColor4B as n, MeshBuffer as o, vertexFormat as p, vfmtPosUvColor as v };
//# sourceMappingURL=ui-renderer-JpGcj-VM.js.map
