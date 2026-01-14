import './_virtual_internal_constants-DWlew7Dp.js';
import { n as sys, c as ccclass, t as type, b as applyDecoratedInitializer, s as serializable, a2 as SystemPriority, S as System, M as Mat4, C as Color, L as override, f as Vec3, E as EPSILON } from './index-uXI1_UMk.js';
import { g as game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import { i as instantiateWasm, f as fetchBuffer, e as ensureWasmModuleReady } from './wasm-web-BpK36a26.js';
import { a as _createClass, as as getset, Q as error, e as warn, _ as _inheritsLoose, E as Enum, j as CCString, l as _createForOfIteratorHelperLoose, x as ccenum, m as setClassAlias, w as warnID, W as logID, ah as setPropertyEnumType, d as CCObjectFlags, k as errorID, b as _applyDecoratedDescriptor, R as RecyclePool } from './gc-object-CShF5lzx.js';
import { l as legacyCC } from './global-exports-DnCP_14L.js';
import './debug-view-BuNhRPv_.js';
import { A as Asset, N as NodeEventType } from './node-event-Ccvtv8bJ.js';
import { N as Node, i as Texture2D, k as assetManager, d as builtinResMgr, M as MaterialInstance, b as Material } from './scene-vWcxM1_c.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { g as getAttributeStride, m as vfmtPosUvColor4B, n as vfmtPosUvTwoColor4B, f as RenderEntity, h as RenderEntityType, U as UIRenderer, a as StaticVBAccessor, l as RenderData } from './ui-renderer-JpGcj-VM.js';
import { m as murmurhash2_32_gc, aj as BlendOp, ag as BlendFactor } from './buffer-barrier-BlQXg9Aa.js';
import './device-manager-CBXP-ttm.js';
import './deprecated-n0w4kK7g.js';
import './deprecated-CN-RjLP6.js';
import './touch-BKrZ-fxl.js';
import './renderer-C7HM72NY.js';
import './sorting-layers-BHqhkSbY.js';

var spine;
(function (spine, _MathUtils) {
  function defineReverseKeyEnum(e) {
    for (var key in e) {
      var value = e[key];
      e[value] = key;
    }
  }
  var e = spine.MixBlend = {
    setup: 0,
    first: 1,
    replace: 2,
    add: 3
  };
  defineReverseKeyEnum(e);
  e = spine.MixDirection = {
    mixIn: 0,
    mixOut: 1
  };
  defineReverseKeyEnum(e);
  e = spine.TimelineType = {
    rotate: 0,
    translate: 1,
    scale: 2,
    shear: 3,
    attachment: 4,
    color: 5,
    deform: 6,
    event: 7,
    drawOrder: 8,
    ikConstraint: 9,
    transformConstraint: 10,
    pathConstraintPosition: 11,
    pathConstraintSpacing: 12,
    pathConstraintMix: 13,
    twoColor: 14
  };
  defineReverseKeyEnum(e);
  e = spine.EventType = {
    start: 0,
    interrupt: 1,
    end: 2,
    complete: 3,
    dispose: 4,
    event: 5
  };
  defineReverseKeyEnum(e);
  e = spine.BlendMode = {
    Normal: 0,
    Additive: 1,
    Multiply: 2,
    Screen: 3
  };
  defineReverseKeyEnum(e);
  e = spine.TransformMode = {
    Normal: 0,
    OnlyTranslation: 1,
    NoRotationOrReflection: 2,
    NoScale: 3,
    NoScaleOrReflection: 4
  };
  defineReverseKeyEnum(e);
  e = spine.PositionMode = {
    Fixed: 0,
    Percent: 1
  };
  defineReverseKeyEnum(e);
  e = spine.SpacingMode = {
    Length: 0,
    Fixed: 1,
    Percent: 2
  };
  defineReverseKeyEnum(e);
  e = spine.RotateMode = {
    Tangent: 0,
    Chain: 1,
    ChainScale: 2
  };
  defineReverseKeyEnum(e);
  e = spine.TextureFilter = {
    Nearest: 9728,
    Linear: 9729,
    MipMap: 9987,
    MipMapNearestNearest: 9984,
    MipMapLinearNearest: 9985,
    MipMapNearestLinear: 9986,
    MipMapLinearLinear: 9987
  };
  defineReverseKeyEnum(e);
  e = spine.TextureWrap = {
    MirroredRepeat: 33648,
    ClampToEdge: 33071,
    Repeat: 10497
  };
  defineReverseKeyEnum(e);
  e = spine.AttachmentType = {
    Region: 0,
    BoundingBox: 1,
    Mesh: 2,
    LinkedMesh: 3,
    Path: 4,
    Point: 5,
    Clipping: 6
  };
  defineReverseKeyEnum(e);
  e = null;
  var PI = 3.1415927;
  var PI2 = PI * 2;
  var radiansToDegrees = 180 / PI;
  var radDeg = radiansToDegrees;
  var degreesToRadians = PI / 180;
  var degRad = degreesToRadians;
  spine.MathUtils = (_MathUtils = function () {
    function MathUtils() {}
    MathUtils.clamp = function clamp(value, min, max) {
      if (value < min) return min;
      if (value > max) return max;
      return value;
    };
    MathUtils.cosDeg = function cosDeg(degrees) {
      return Math.cos(degrees * degRad);
    };
    MathUtils.sinDeg = function sinDeg(degrees) {
      return Math.sin(degrees * degRad);
    };
    MathUtils.signum = function signum(value) {
      return value > 0 ? 1 : value < 0 ? -1 : 0;
    };
    MathUtils.toInt = function toInt(x) {
      return x > 0 ? Math.floor(x) : Math.ceil(x);
    };
    MathUtils.cbrt = function cbrt(x) {
      var y = Math.pow(Math.abs(x), 1 / 3);
      return x < 0 ? -y : y;
    };
    MathUtils.randomTriangular = function randomTriangular(min, max) {
      return MathUtils.randomTriangularWith(min, max, (min + max) * 0.5);
    };
    MathUtils.randomTriangularWith = function randomTriangularWith(min, max, mode) {
      var u = Math.random();
      var d = max - min;
      if (u <= (mode - min) / d) return min + Math.sqrt(u * d * (mode - min));
      return max - Math.sqrt((1 - u) * d * (max - mode));
    };
    return MathUtils;
  }(), _MathUtils.PI = PI, _MathUtils.PI2 = PI2, _MathUtils.radiansToDegrees = radiansToDegrees, _MathUtils.radDeg = radDeg, _MathUtils.degreesToRadians = degreesToRadians, _MathUtils.degRad = degRad, _MathUtils);
})(spine || (spine = {}));
var spine$1 = spine;

var DataInput = function () {
  function DataInput(binary) {
    this.cursor = void 0;
    this.data = void 0;
    this.data = binary;
    this.cursor = 0;
  }
  return _createClass(DataInput, [{
    key: "remaining",
    get: function get() {
      return this.data.length - this.cursor;
    }
  }]);
}();
var SkeletonBinary = function () {
  function SkeletonBinary() {}
  SkeletonBinary.readString = function readString(input) {
    var length = this.readVarint(input, true);
    if (length === 0) return null;
    var bytes = input.data.subarray(input.cursor, input.cursor + length - 1);
    input.cursor += length - 1;
    return new TextDecoder().decode(bytes);
  };
  SkeletonBinary.readVarint = function readVarint(input, optimizePositive) {
    var value = 0;
    var shift = 0;
    var b;
    do {
      b = this.readByte(input);
      value |= (b & 0x7F) << shift;
      shift += 7;
    } while (b & 0x80 && shift < 32);
    if (!optimizePositive) {
      value = value >>> 1 ^ -(value & 1);
    }
    return value;
  };
  SkeletonBinary.readByte = function readByte(input) {
    if (input.cursor >= input.data.length) {
      throw new Error("Buffer underflow");
    }
    return input.data[input.cursor++];
  };
  SkeletonBinary.readInt = function readInt(input) {
    if (input.remaining < 4) throw new Error("Buffer underflow");
    var b1 = input.data[input.cursor++];
    var b2 = input.data[input.cursor++];
    var b3 = input.data[input.cursor++];
    var b4 = input.data[input.cursor++];
    var value = b1 << 24 | b2 << 16 | b3 << 8 | b4;
    return value | 0;
  };
  return SkeletonBinary;
}();

var SPINE_VERSION = '4.2';
function isVersionCompatible(version) {
  {
    if (!version || !version.startsWith('4.2.')) {
      return false;
    }
  }
  return true;
}
function isBinaryCompatible(buffer) {
  {
    var input = new DataInput(buffer);
    SkeletonBinary.readInt(input);
    SkeletonBinary.readInt(input);
    var version = SkeletonBinary.readString(input);
    return isVersionCompatible(version);
  }
}
function isJsonCompatible(json) {
  {
    return isVersionCompatible(json['skeleton']['spine']);
  }
}

function resizeArray(array, newSize) {
  if (!array) return new Array(newSize);
  if (newSize === array.length) return array;
  if (newSize < array.length) return array.slice(0, newSize);else return new Array(newSize);
}
function overrideDefineArrayProp(prototype, getPropVector, name) {
  var _name = "_" + name;
  Object.defineProperty(prototype, name, {
    get: function get() {
      var vectors = getPropVector.call(this);
      var count = vectors.size();
      var array = this[_name];
      array = resizeArray(array, count);
      for (var i = 0; i < count; i++) array[i] = vectors.get(i);
      this[_name] = array;
      return array;
    }
  });
}
function overrideDefineArrayArrayProp(prototype, getPropVector, name) {
  var _name = "_" + name;
  Object.defineProperty(prototype, name, {
    get: function get() {
      var vectors = getPropVector.call(this);
      var count = vectors.size();
      var array = this[_name];
      array = resizeArray(array, count);
      for (var i = 0; i < count; i++) {
        var vectorI = vectors.get(i);
        var countJ = vectorI.size();
        var arrayJ = array[i];
        arrayJ = resizeArray(arrayJ, countJ);
        for (var j = 0; j < countJ; j++) arrayJ[j] = vectorI.get(j);
        array[i] = arrayJ;
      }
      this[_name] = array;
      return array;
    }
  });
}
function overrideDefineArrayFunction(prototype, getPropVector, name) {
  var _name = "_" + name;
  Object.defineProperty(prototype, name, {
    value: function value() {
      var vectors = getPropVector.call(this);
      var count = vectors.size();
      var array = this[_name];
      array = resizeArray(array, count);
      for (var i = 0; i < count; i++) array[i] = vectors.get(i);
      this[_name] = array;
      return array;
    }
  });
}
function overrideClass(wasm) {
  spine$1.wasmUtil = wasm.SpineWasmUtil;
  spine$1.wasmUtil.wasm = wasm;
  spine$1.wasmUtil.spineWasmInit();
  for (var k in wasm) {
    var v = wasm[k];
    if (!spine$1[k]) {
      spine$1[k] = v;
    }
  }
}
function overrideProperty_IkConstraintData() {
  var prototype = spine$1.IkConstraintData.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
}
function overrideProperty_PathConstraintData() {
  var prototype = spine$1.PathConstraintData.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
}
function overrideProperty_VertexAttachment() {
  var prototype = spine$1.VertexAttachment.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
  overrideDefineArrayProp(prototype, prototype.getVertices, 'vertices');
  var originComputeWorldVertices = prototype.computeWorldVertices;
  var vectors = new spine$1.SPVectorFloat();
  Object.defineProperty(prototype, 'computeWorldVertices', {
    value: function value(slot, start, count, worldVertices, offset, stride) {
      var length = worldVertices.length;
      vectors.resize(length, 0);
      for (var i = 0; i < length; i++) vectors.set(i, worldVertices[i]);
      originComputeWorldVertices.call(this, slot, start, count, vectors, offset, stride);
      for (var _i = 0; _i < length; _i++) worldVertices[_i] = vectors.get(_i);
    }
  });
}
function overrideProperty_MeshAttachment() {
  var prototype = spine$1.MeshAttachment.prototype;
  overrideDefineArrayProp(prototype, prototype.getRegionUVs, 'regionUVs');
  overrideDefineArrayProp(prototype, prototype.getUVs, 'uvs');
  overrideDefineArrayProp(prototype, prototype.getTriangles, 'triangles');
  overrideDefineArrayProp(prototype, prototype.getEdges, 'edges');
}
function overrideProperty_PathAttachment() {
  var prototype = spine$1.PathAttachment.prototype;
  overrideDefineArrayProp(prototype, prototype.getLengths, 'lengths');
}
function overrideProperty_RegionAttachment() {
  var prototype = spine$1.RegionAttachment.prototype;
  overrideDefineArrayProp(prototype, prototype.getOffset, 'offset');
  var getUVs = prototype.getUVs;
  var setUVs = prototype.setUVs;
  var _uvs = '_uvs';
  Object.defineProperty(prototype, 'uvs', {
    get: function get() {
      var vectors = getUVs.call(this);
      var count = vectors.size();
      var array = prototype[_uvs];
      array = resizeArray(array, count);
      for (var i = 0; i < count; i++) array[i] = vectors.get(i);
      prototype[_uvs] = array;
      return array;
    },
    set: function set(value) {
      setUVs.call(this, value[0], value[1], value[2], value[3], value[4] === 1);
    }
  });
  var originComputeWorldVertices = prototype.computeWorldVertices;
  var vectors = new spine$1.SPVectorFloat();
  Object.defineProperty(prototype, 'computeWorldVertices', {
    value: function value(bone, worldVertices, offset, stride) {
      var length = worldVertices.length;
      vectors.resize(length, 0);
      for (var i = 0; i < length; i++) vectors.set(i, worldVertices[i]);
      originComputeWorldVertices.call(this, bone, vectors, offset, stride);
      for (var _i2 = 0; _i2 < length; _i2++) worldVertices[_i2] = vectors.get(_i2);
    }
  });
}
function overrideProperty_IkConstraint() {
  var prototype = spine$1.IkConstraint.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
}
function overrideProperty_PathConstraint() {
  var prototype = spine$1.PathConstraint.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
}
function overrideProperty_TransformConstraintData() {
  var prototype = spine$1.TransformConstraintData.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
}
function overrideProperty_TransformConstraint() {
  var prototype = spine$1.TransformConstraint.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
}
function overrideProperty_Bone() {
  var prototype = spine$1.Bone.prototype;
  overrideDefineArrayProp(prototype, prototype.getChildren, 'children');
}
function overrideProperty_Slot() {
  var prototype = spine$1.Slot.prototype;
  overrideDefineArrayProp(prototype, prototype.getDeform, 'deform');
}
function overrideProperty_Skin() {
  var prototype = spine$1.Skin.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
  overrideDefineArrayProp(prototype, prototype.getAttachments, 'attachments');
  overrideDefineArrayProp(prototype, prototype.getConstraints, 'constraints');
  overrideDefineArrayFunction(prototype, prototype.getAttachments, 'getAttachments');
  var originGetAttachmentsForSlot = prototype.getAttachmentsForSlot;
  Object.defineProperty(prototype, 'getAttachmentsForSlot', {
    value: function value(slotIndex, attachments) {
      var vectors = originGetAttachmentsForSlot.call(this, slotIndex);
      var count = vectors.size();
      attachments.length = count;
      for (var i = 0; i < count; i++) {
        attachments[i] = vectors.get(i);
      }
      vectors["delete"]();
    }
  });
  var originFindNamesForSlot = prototype.findNamesForSlot;
  Object.defineProperty(prototype, 'findNamesForSlot', {
    value: function value(slotIndex, names) {
      var vectors = originFindNamesForSlot.call(this, slotIndex);
      var count = vectors.size();
      names.length = count;
      for (var i = 0; i < count; i++) {
        names[i] = vectors.get(i);
      }
      vectors["delete"]();
    }
  });
}
function overrideProperty_SkinEntry() {
  var prototype = spine$1.SkinEntry.prototype;
  var propertyPolyfills = [['name', prototype.getName], ['attachment', prototype.getAttachment]];
  propertyPolyfills.forEach(function (prop) {
    getset(prototype, prop[0], prop[1]);
  });
}
function overrideProperty_SkeletonData() {
  var prototype = spine$1.SkeletonData.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
  overrideDefineArrayProp(prototype, prototype.getSlots, 'slots');
  overrideDefineArrayProp(prototype, prototype.getSkins, 'skins');
  overrideDefineArrayProp(prototype, prototype.getAnimations, 'animations');
  overrideDefineArrayProp(prototype, prototype.getEvents, 'events');
  overrideDefineArrayProp(prototype, prototype.getIkConstraints, 'ikConstraints');
  overrideDefineArrayProp(prototype, prototype.getTransformConstraints, 'transformConstraints');
  overrideDefineArrayProp(prototype, prototype.getPathConstraints, 'pathConstraints');
}
function overrideProperty_RotateTimeline() {
  var prototype = spine$1.RotateTimeline.prototype;
  overrideDefineArrayProp(prototype, prototype.getFrames, 'frames');
}
function overrideProperty_Timeline() {
  var prototype = spine$1.Timeline.prototype;
  overrideDefineArrayProp(prototype, prototype.getFrames, 'frames');
}
function overrideProperty_AttachmentTimeline() {
  var prototype = spine$1.AttachmentTimeline.prototype;
  overrideDefineArrayProp(prototype, prototype.getAttachmentNames, 'attachmentNames');
}
function overrideProperty_DeformTimeline() {
  var prototype = spine$1.DeformTimeline.prototype;
  overrideDefineArrayProp(prototype, prototype.getFrames, 'frames');
  overrideDefineArrayArrayProp(prototype, prototype.getFrameVertices, 'frameVertices');
}
function overrideProperty_EventTimeline() {
  var prototype = spine$1.EventTimeline.prototype;
  overrideDefineArrayProp(prototype, prototype.getFrames, 'frames');
  overrideDefineArrayProp(prototype, prototype.getEvents, 'events');
}
function overrideProperty_DrawOrderTimeline() {
  var prototype = spine$1.DrawOrderTimeline.prototype;
  overrideDefineArrayProp(prototype, prototype.getFrames, 'frames');
}
function overrideProperty_AnimationState() {
  var prototype = spine$1.AnimationState.prototype;
  overrideDefineArrayProp(prototype, prototype.getTracks, 'tracks');
}
function overrideProperty_Animation() {
  var prototype = spine$1.Animation.prototype;
  overrideDefineArrayProp(prototype, prototype.getTimelines, 'timelines');
}
function overrideProperty_Skeleton() {
  var prototype = spine$1.Skeleton.prototype;
  overrideDefineArrayProp(prototype, prototype.getBones, 'bones');
  overrideDefineArrayProp(prototype, prototype.getSlots, 'slots');
  overrideDefineArrayProp(prototype, prototype.getDrawOrder, 'drawOrder');
  overrideDefineArrayProp(prototype, prototype.getIkConstraints, 'ikConstraints');
  overrideDefineArrayProp(prototype, prototype.getTransformConstraints, 'transformConstraints');
  overrideDefineArrayProp(prototype, prototype.getPathConstraints, 'pathConstraints');
  overrideDefineArrayProp(prototype, prototype.getUpdateCacheList, '_updateCache');
}
function overrideSpineDefine(wasm) {
  overrideClass(wasm);
  overrideProperty_IkConstraintData();
  overrideProperty_PathConstraintData();
  overrideProperty_MeshAttachment();
  overrideProperty_PathAttachment();
  overrideProperty_RegionAttachment();
  overrideProperty_VertexAttachment();
  overrideProperty_IkConstraint();
  overrideProperty_PathConstraint();
  overrideProperty_TransformConstraintData();
  overrideProperty_TransformConstraint();
  overrideProperty_Bone();
  overrideProperty_Slot();
  overrideProperty_Skin();
  overrideProperty_SkinEntry();
  overrideProperty_SkeletonData();
  overrideProperty_RotateTimeline();
  {
    overrideProperty_Timeline();
  }
  overrideProperty_AttachmentTimeline();
  overrideProperty_DeformTimeline();
  overrideProperty_EventTimeline();
  overrideProperty_DrawOrderTimeline();
  overrideProperty_AnimationState();
  overrideProperty_Animation();
  overrideProperty_Skeleton();
}

var PAGESIZE = 65536;
var PAGECOUNT = 32 * 16;
var MEMORYSIZE = PAGESIZE * PAGECOUNT;
var wasmInstance = null;
var registerList = [];
function initWasm(wasmFactory, wasmUrl) {
  return new Promise(function (resolve, reject) {
    var errorMessage = function errorMessage(err) {
      return "[Spine]: Spine wasm load failed: " + err;
    };
    wasmFactory({
      instantiateWasm: function instantiateWasm$1(importObject, receiveInstance) {
        instantiateWasm(wasmUrl, importObject).then(function (result) {
          receiveInstance(result.instance, result.module);
        })["catch"](function (err) {
          return reject(errorMessage(err));
        });
      }
    }).then(function (Instance) {
      wasmInstance = Instance;
      registerList.forEach(function (cb) {
        cb(wasmInstance);
      });
    }).then(resolve)["catch"](function (err) {
      return reject(errorMessage(err));
    });
  });
}
function initAsmJS(asmFactory, asmJsMemUrl) {
  return new Promise(function (resolve, reject) {
    fetchBuffer(asmJsMemUrl).then(function (arrayBuffer) {
      var wasmMemory = {};
      wasmMemory.buffer = new ArrayBuffer(MEMORYSIZE);
      var module = {
        wasmMemory: wasmMemory,
        memoryInitializerRequest: {
          response: arrayBuffer,
          status: 200
        }
      };
      return asmFactory(module).then(function (instance) {
        wasmInstance = instance;
        registerList.forEach(function (cb) {
          cb(wasmInstance);
        });
      });
    }).then(resolve)["catch"](reject);
  });
}
function shouldUseWasmModule() {
  {
    return sys.hasFeature(sys.Feature.WASM);
  }
}
registerList.push(overrideSpineDefine);

function waitForSpineWasmInstantiation() {
  var errorReport = function errorReport(msg) {
    error(msg);
  };
  return ensureWasmModuleReady().then(function () {
    if (shouldUseWasmModule()) {
      return Promise.all([import('./spine.wasm-CKlzv4Nk.js'), import('./spine-D-3LymbO.js')]).then(function (_ref) {
        var wasmFactory = _ref[0]["default"],
          spineWasmUrl = _ref[1]["default"];
        return initWasm(wasmFactory, spineWasmUrl);
      });
    } else {
      return Promise.all([import('./spine.asm-DD8GvRWA.js'), import('./spine.js-Ca6WXHpH.js')]).then(function (_ref2) {
        var asmFactory = _ref2[0]["default"],
          asmJsMemUrl = _ref2[1]["default"];
        return initAsmJS(asmFactory, asmJsMemUrl);
      });
    }
  })["catch"](errorReport);
}

{
  game.onPostInfrastructureInitDelegate.add(waitForSpineWasmInstantiation);
}

var _listener_ID = 0;
var _track_ID = 0;
var TrackEntryListeners = function () {
  function TrackEntryListeners() {
    this.start = void 0;
    this.interrupt = void 0;
    this.end = void 0;
    this.dispose = void 0;
    this.complete = void 0;
    this.event = void 0;
  }
  TrackEntryListeners.getListeners = function getListeners(entry, instance) {
    if (!entry.listener) {
      entry.listener = new TrackEntryListeners();
      var id = ++_track_ID;
      instance.setTrackEntryListener(id, entry);
      TrackEntryListeners._trackSet.set(id, entry);
    }
    return entry.listener;
  };
  TrackEntryListeners.emitListener = function emitListener(id, entry, event, eventType) {
    var listener = TrackEntryListeners._listenerSet.get(id);
    if (!listener) return;
    switch (eventType) {
      case spine$1.EventType.event:
        if (listener.event) {
          listener.event(entry, event);
        }
        break;
      case spine$1.EventType.start:
        if (listener.start) {
          listener.start(entry);
        }
        break;
      case spine$1.EventType.interrupt:
        if (listener.interrupt) {
          listener.interrupt(entry);
        }
        break;
      case spine$1.EventType.end:
        if (listener.end) {
          listener.end(entry);
        }
        break;
      case spine$1.EventType.dispose:
        if (listener.dispose) {
          listener.dispose(entry);
        }
        break;
      case spine$1.EventType.complete:
        if (listener.complete) {
          listener.complete(entry);
        }
        break;
      default:
        warn('emitListener doesn\'t handled', eventType);
        break;
    }
  };
  TrackEntryListeners.emitTrackEntryListener = function emitTrackEntryListener(id, entry, event, eventType) {
    var curTrack = this._trackSet.get(id);
    if (!curTrack) return;
    switch (eventType) {
      case spine$1.EventType.start:
        if (curTrack.listener.start) {
          curTrack.listener.start(entry);
        }
        break;
      case spine$1.EventType.interrupt:
        if (curTrack.listener.interrupt) {
          curTrack.listener.interrupt(entry);
        }
        break;
      case spine$1.EventType.end:
        if (curTrack.listener.end) {
          curTrack.listener.end(entry);
        }
        break;
      case spine$1.EventType.dispose:
        if (curTrack.listener.dispose) {
          curTrack.listener.dispose(entry);
        }
        this._trackSet["delete"](id);
        curTrack.listener = null;
        break;
      case spine$1.EventType.complete:
        if (curTrack.listener.complete) {
          curTrack.listener.complete(entry);
        }
        break;
      case spine$1.EventType.event:
        if (curTrack.listener.event) {
          curTrack.listener.event(entry, event);
        }
        break;
      default:
        warn('TrackEntry doesn\'t handled', eventType);
        break;
    }
  };
  TrackEntryListeners.addListener = function addListener(listener) {
    var id = ++_listener_ID;
    TrackEntryListeners._listenerSet.set(id, listener);
    return id;
  };
  TrackEntryListeners.removeListener = function removeListener(id) {
    TrackEntryListeners._listenerSet["delete"](id);
  };
  return TrackEntryListeners;
}();
TrackEntryListeners._listenerSet = new Map();
TrackEntryListeners._trackSet = new Map();
globalThis.TrackEntryListeners = TrackEntryListeners;

var _SkeletonCache;
var MaxCacheTime = 30;
var FrameTime = 1 / 60;
var _useTint$1 = true;
getAttributeStride(vfmtPosUvColor4B);
var _byteStrideTwoColor$1 = getAttributeStride(vfmtPosUvTwoColor4B);
var FrameBoneInfo = function FrameBoneInfo() {
  this.a = 0;
  this.b = 0;
  this.c = 0;
  this.d = 0;
  this.worldX = 0;
  this.worldY = 0;
};
var SpineModel = function SpineModel() {
  this.vCount = 0;
  this.iCount = 0;
  this.vData = null;
  this.iData = null;
  this.meshes = [];
};
var SpineDrawItem = function SpineDrawItem() {
  this.iCount = 0;
  this.blendMode = 0;
  this.textureID = 0;
};
var AnimationCache = function () {
  function AnimationCache(data) {
    this._instance = null;
    this._state = null;
    this._skeletonData = null;
    this._skeleton = null;
    this._privateMode = false;
    this._curIndex = -1;
    this._isCompleted = false;
    this._maxFrameIdex = 0;
    this._frameIdx = -1;
    this._inited = false;
    this._invalid = true;
    this._enableCacheAttachedInfo = false;
    this._skeletonInfo = null;
    this._animationName = null;
    this.isCompleted = false;
    this.totalTime = 0;
    this.frames = [];
    this._privateMode = false;
    this._inited = false;
    this._invalid = true;
    this._instance = new spine$1.SkeletonInstance();
    this._instance.isCache = true;
    this._skeletonData = data;
    this._skeleton = this._instance.initSkeleton(data);
    this._instance.setUseTint(_useTint$1);
  }
  var _proto = AnimationCache.prototype;
  _proto.init = function init(skeletonInfo, animationName) {
    this._inited = true;
    this._animationName = animationName;
    this._skeletonInfo = skeletonInfo;
  };
  _proto.setSkin = function setSkin(skinName) {
    if (this._skeleton) this._skeleton.setSkinByName(skinName);
    this._instance.setSkin(skinName);
  };
  _proto.setAnimation = function setAnimation(animationName) {
    var animations = this._skeletonData.animations;
    var animation = null;
    animations.forEach(function (element) {
      if (element.name === animationName) {
        animation = element;
      }
    });
    if (!animation) {
      warn("find no animation named " + animationName + " !!!");
      return;
    }
    this._maxFrameIdex = Math.floor(animation.duration / FrameTime);
    if (this._maxFrameIdex <= 0) this._maxFrameIdex = 1;
    this._instance.setAnimation(0, animationName, false);
  };
  _proto.updateToFrame = function updateToFrame(frameIdx) {
    if (!this._inited) return;
    this.begin();
    if (!this.needToUpdate(frameIdx)) return;
    do {
      this._frameIdx++;
      this.totalTime += FrameTime;
      this._instance.updateAnimation(FrameTime);
      var model = this._instance.updateRenderData();
      this.updateRenderData(this._frameIdx, model);
      if (this._frameIdx >= this._maxFrameIdex) {
        this.isCompleted = true;
      }
    } while (this.needToUpdate(frameIdx));
  };
  _proto.getFrame = function getFrame(frameIdx) {
    var index = frameIdx % this._maxFrameIdex;
    return this.frames[index];
  };
  _proto.invalidAnimationFrames = function invalidAnimationFrames() {
    this._curIndex = -1;
    this._isCompleted = false;
    this.frames.length = 0;
  };
  _proto.updateRenderData = function updateRenderData(index, model) {
    var vc = model.vCount;
    var ic = model.iCount;
    var floatStride = (_byteStrideTwoColor$1 ) / Float32Array.BYTES_PER_ELEMENT;
    var vUint8Buf = new Uint8Array(Float32Array.BYTES_PER_ELEMENT * floatStride * vc);
    var iUint16Buf = new Uint16Array(ic);
    var HEAPU8 = spine$1.wasmUtil.wasm.HEAPU8;
    var vPtr = model.vPtr;
    var vLength = vc * Float32Array.BYTES_PER_ELEMENT * floatStride;
    vUint8Buf.set(HEAPU8.subarray(vPtr, vPtr + vLength));
    var iPtr = model.iPtr;
    var iLength = Uint16Array.BYTES_PER_ELEMENT * ic;
    var iUint8Buf = new Uint8Array(iUint16Buf.buffer);
    iUint8Buf.set(HEAPU8.subarray(iPtr, iPtr + iLength));
    var modelData = new SpineModel();
    modelData.vCount = vc;
    modelData.iCount = ic;
    modelData.vData = vUint8Buf;
    modelData.iData = iUint16Buf;
    var data = model.getData();
    var textures = model.getTextures();
    var count = data.size();
    for (var i = 0; i < count; i += 5) {
      var meshData = new SpineDrawItem();
      meshData.iCount = data.get(i + 3);
      meshData.blendMode = data.get(i + 4);
      meshData.textureID = textures.get(i / 5);
      modelData.meshes.push(meshData);
    }
    var bones = this._skeleton.bones;
    var boneInfosArray = [];
    bones.forEach(function (bone) {
      var boneInfo = new FrameBoneInfo();
      boneInfo.a = bone.a;
      boneInfo.b = bone.b;
      boneInfo.c = bone.c;
      boneInfo.d = bone.d;
      boneInfo.worldX = bone.worldX;
      boneInfo.worldY = bone.worldY;
      boneInfosArray.push(boneInfo);
    });
    this.frames[index] = {
      model: modelData,
      boneInfos: boneInfosArray
    };
  };
  _proto.begin = function begin() {
    if (!this._invalid) return;
    var skeletonInfo = this._skeletonInfo;
    var preAnimationCache = skeletonInfo == null ? void 0 : skeletonInfo.curAnimationCache;
    if (preAnimationCache && preAnimationCache !== this) {
      if (this._privateMode) {
        preAnimationCache.invalidAllFrame();
      } else {
        preAnimationCache.updateToFrame(0);
      }
    }
    var listener = skeletonInfo == null ? void 0 : skeletonInfo.listener;
    this._instance.setAnimation(0, this._animationName, false);
    this.bind(listener);
    skeletonInfo.curAnimationCache = this;
    this._frameIdx = -1;
    this.isCompleted = false;
    this.totalTime = 0;
    this._invalid = false;
  };
  _proto.end = function end() {
    if (!this.needToUpdate()) {
      this._skeletonInfo.curAnimationCache = null;
      this.frames.length = this._frameIdx + 1;
      this.isCompleted = true;
      this.unbind(this._skeletonInfo.listener);
    }
  };
  _proto.bind = function bind(listener) {
    var _this = this;
    var completeHandle = function completeHandle(entry) {
      if (entry && entry.animation.name === _this._animationName) {
        _this.isCompleted = true;
      }
    };
    listener.complete = completeHandle;
  };
  _proto.unbind = function unbind(listener) {
    listener.complete = null;
  };
  _proto.needToUpdate = function needToUpdate(toFrameIdx) {
    return !this.isCompleted && this.totalTime < MaxCacheTime && (toFrameIdx === undefined || this._frameIdx < toFrameIdx);
  };
  _proto.isInited = function isInited() {
    return this._inited;
  };
  _proto.isInvalid = function isInvalid() {
    return this._invalid;
  };
  _proto.invalidAllFrame = function invalidAllFrame() {
    this.isCompleted = false;
    this._invalid = true;
  };
  _proto.enableCacheAttachedInfo = function enableCacheAttachedInfo() {
    if (!this._enableCacheAttachedInfo) {
      this._enableCacheAttachedInfo = true;
      this.invalidAllFrame();
    }
  };
  _proto.clear = function clear() {
    this._inited = false;
    this.invalidAllFrame();
  };
  _proto.destroy = function destroy() {
    if (this._instance) {
      this._instance.destroy();
      this._instance = null;
    }
  };
  return _createClass(AnimationCache, [{
    key: "skeleton",
    get: function get() {
      return this._skeleton;
    }
  }]);
}();
var SkeletonCache = function () {
  function SkeletonCache() {
    this._privateMode = void 0;
    this._skeletonCache = void 0;
    this._animationPool = void 0;
    this._sharedCacheMap = new Map();
    this._privateMode = false;
    this._animationPool = {};
    this._skeletonCache = {};
  }
  var _proto2 = SkeletonCache.prototype;
  _proto2.enablePrivateMode = function enablePrivateMode() {
    this._privateMode = true;
  };
  _proto2.clear = function clear() {
    this._animationPool = {};
    this._skeletonCache = {};
  };
  _proto2.invalidAnimationCache = function invalidAnimationCache(uuid) {
    var skeletonInfo = this._skeletonCache[uuid];
    var skeleton = skeletonInfo && skeletonInfo.skeleton;
    if (!skeleton) return;
    var animationsCache = skeletonInfo.animationsCache;
    for (var aniKey in animationsCache) {
      var animationCache = animationsCache[aniKey];
      animationCache.invalidAllFrame();
    }
  };
  _proto2.destroySkeleton = function destroySkeleton(assetUuid) {
    var _this2 = this;
    if (!this._privateMode) {
      var refCount = this._sharedCacheMap.get(assetUuid);
      if (refCount) {
        refCount -= 1;
        if (refCount > 0) {
          this._sharedCacheMap.set(assetUuid, refCount);
          return;
        }
        this._sharedCacheMap["delete"](assetUuid);
      }
    }
    var skeletonInfo = this._skeletonCache[assetUuid];
    if (!skeletonInfo) return;
    var sharedOperate = function sharedOperate(aniKey, animationCache) {
      _this2._animationPool[assetUuid + "#" + aniKey] = animationCache;
      animationCache.clear();
    };
    var privateOperate = function privateOperate(aniKey, animationCache) {
      animationCache.destroy();
    };
    var operate = this._privateMode ? privateOperate : sharedOperate;
    var animationsCache = skeletonInfo.animationsCache;
    for (var aniKey in animationsCache) {
      var animationCache = animationsCache[aniKey];
      if (!animationCache) continue;
      operate(aniKey, animationCache);
    }
    if (skeletonInfo.skeleton) {
      spine$1.wasmUtil.destroySpineSkeleton(skeletonInfo.skeleton);
    }
    delete this._skeletonCache[assetUuid];
  };
  _proto2.createSkeletonInfo = function createSkeletonInfo(skeletonAsset) {
    var uuid = skeletonAsset.uuid;
    var runtimeData = skeletonAsset.getRuntimeData();
    if (!this._privateMode) {
      var refCount = this._sharedCacheMap.get(uuid);
      if (!refCount) {
        refCount = 1;
      } else {
        refCount += 1;
      }
      this._sharedCacheMap.set(uuid, refCount);
    }
    if (this._skeletonCache[uuid]) {
      return this._skeletonCache[uuid];
    }
    var skeleton = new spine$1.Skeleton(runtimeData);
    var clipper = null;
    var state = null;
    var listener = new TrackEntryListeners();
    var skeletonInfo = this._skeletonCache[uuid] = {
      skeleton: skeleton,
      clipper: clipper,
      state: state,
      listener: listener,
      animationsCache: {},
      curAnimationCache: null,
      assetUUID: uuid
    };
    return skeletonInfo;
  };
  _proto2.getSkeletonInfo = function getSkeletonInfo(skeletonAsset) {
    var uuid = skeletonAsset.uuid;
    return this._skeletonCache[uuid];
  };
  _proto2.getAnimationCache = function getAnimationCache(uuid, animationName) {
    var skeletonInfo = this._skeletonCache[uuid];
    if (!skeletonInfo) return null;
    var animationsCache = skeletonInfo.animationsCache;
    return animationsCache[animationName];
  };
  _proto2.initAnimationCache = function initAnimationCache(uuid, data, animationName) {
    var spData = data.getRuntimeData();
    if (!spData) return null;
    var skeletonInfo = this._skeletonCache[uuid];
    var skeleton = skeletonInfo && skeletonInfo.skeleton;
    if (!skeleton) return null;
    var animationsCache = skeletonInfo.animationsCache;
    var animationCache = animationsCache[animationName];
    if (!animationCache) {
      var poolKey = uuid + "#" + animationName;
      animationCache = this._animationPool[poolKey];
      if (animationCache) {
        delete this._animationPool[poolKey];
      } else {
        animationCache = new AnimationCache(spData);
        animationCache._privateMode = this._privateMode;
      }
      animationCache.init(skeletonInfo, animationName);
      animationsCache[animationName] = animationCache;
    }
    animationCache.init(skeletonInfo, animationName);
    animationCache.setAnimation(animationName);
    return animationCache;
  };
  _proto2.destroyCachedAnimations = function destroyCachedAnimations(uuid) {
    if (uuid) {
      var animationPool = this._animationPool;
      for (var key in animationPool) {
        if (key.includes(uuid)) {
          animationPool[key].destroy();
          delete animationPool[key];
        }
      }
      var skeletonInfo = this._skeletonCache[uuid];
      var skeleton = skeletonInfo && skeletonInfo.skeleton;
      if (skeleton) {
        spine$1.wasmUtil.destroySpineSkeleton(skeleton);
      }
      if (skeletonInfo) {
        delete this._skeletonCache[uuid];
      }
    } else {
      var _animationPool = this._animationPool;
      for (var _key in _animationPool) {
        _animationPool[_key].destroy();
        delete _animationPool[_key];
      }
    }
  };
  return SkeletonCache;
}();
_SkeletonCache = SkeletonCache;
SkeletonCache.FrameTime = FrameTime;
SkeletonCache.sharedCache = new _SkeletonCache();

var _dec$1, _dec2$1, _dec3$1, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4$1, _initializer5$1;
var SkeletonData = (_dec$1 = ccclass('sp.SkeletonData'), _dec2$1 = type([Texture2D]), _dec3$1 = type([CCString]), _dec$1(_class$1 = (_class2$1 = function (_Asset) {
  function SkeletonData() {
    var _this;
    _this = _Asset.call(this) || this;
    _this._skeletonJson = _initializer$1 && _initializer$1();
    _this.textures = _initializer2$1 && _initializer2$1();
    _this.textureNames = _initializer3$1 && _initializer3$1();
    _this.scale = _initializer4$1 && _initializer4$1();
    _this._atlasText = _initializer5$1 && _initializer5$1();
    _this._buffer = void 0;
    _this._skeletonCache = null;
    _this._skinsEnum = null;
    _this._animsEnum = null;
    _this.reset();
    return _this;
  }
  _inheritsLoose(SkeletonData, _Asset);
  var _proto = SkeletonData.prototype;
  _proto.createNode = function createNode(callback) {
    var node = new Node(this.name);
    var skeleton = node.addComponent('cc.Skeleton');
    skeleton.skeletonData = this;
    return callback(null, node);
  };
  _proto.reset = function reset() {
    this._skeletonCache = null;
  };
  _proto.resetEnums = function resetEnums() {
  };
  _proto.getRuntimeData = function getRuntimeData(quiet) {
    if (this._skeletonCache) {
      return this._skeletonCache;
    }
    if (!(this.textures && this.textures.length > 0) && this.textureNames && this.textureNames.length > 0) {
      if (!quiet) {
        error(this.name + " no textures found!");
      }
      return null;
    }
    var uuid = this.mergedUUID();
    var spData = spine$1.wasmUtil.querySpineSkeletonDataByUUID(uuid);
    if (spData) {
      this._skeletonCache = spData;
    } else {
      var size = this.textures.length;
      var textureUUIDs = [];
      for (var i = 0; i < size; ++i) {
        var tex = this.textures[i];
        textureUUIDs.push(tex.uuid || tex.getId());
      }
      if (this._skeletonJson) {
        this._skeletonCache = spine$1.wasmUtil.createSpineSkeletonDataWithJson(this.skeletonJsonStr, this._atlasText, this.textureNames, textureUUIDs);
        spine$1.wasmUtil.registerSpineSkeletonDataWithUUID(this._skeletonCache, uuid);
      } else {
        var rawData = new Uint8Array(this._nativeAsset);
        var byteSize = rawData.length;
        var ptr = spine$1.wasmUtil.createStoreMemory(byteSize);
        var wasmMem = spine$1.wasmUtil.wasm.HEAPU8.subarray(ptr, ptr + byteSize);
        wasmMem.set(rawData);
        this._skeletonCache = spine$1.wasmUtil.createSpineSkeletonDataWithBinary(byteSize, this._atlasText, this.textureNames, textureUUIDs);
        spine$1.wasmUtil.registerSpineSkeletonDataWithUUID(this._skeletonCache, uuid);
        spine$1.wasmUtil.freeStoreMemory();
      }
    }
    return this._skeletonCache;
  };
  _proto.getSkinsEnum = function getSkinsEnum() {
    if (this._skinsEnum) {
      return this._skinsEnum;
    }
    var sd = this.getRuntimeData(true);
    if (sd) {
      var skins = sd.skins;
      var enumDef = {};
      for (var i = 0; i < skins.length; i++) {
        var name = skins[i].name;
        enumDef[name] = i;
      }
      return this._skinsEnum = Enum(enumDef);
    }
    return null;
  };
  _proto.getAnimsEnum = function getAnimsEnum() {
    if (this._animsEnum && Object.keys(this._animsEnum).length > 1) {
      return this._animsEnum;
    }
    var sd = this.getRuntimeData(true);
    if (sd) {
      var enumDef = {
        '<None>': 0
      };
      var anims = sd.animations;
      for (var i = 0; i < anims.length; i++) {
        var name = anims[i].name;
        enumDef[name] = i + 1;
      }
      return this._animsEnum = Enum(enumDef);
    }
    return null;
  };
  _proto.mergedUUID = function mergedUUID() {
    var hashContent = [this._atlasText].concat(this.textures.map(function (texture) {
      return texture.getId();
    })).join('');
    return "" + this._uuid + murmurhash2_32_gc(hashContent, 668);
  };
  _proto.destroy = function destroy() {
    SkeletonCache.sharedCache.destroyCachedAnimations(this._uuid);
    spine$1.wasmUtil.destroySpineSkeletonDataWithUUID(this.mergedUUID());
    return _Asset.prototype.destroy.call(this);
  };
  _proto.isEmpty = function isEmpty() {
    return this._atlasText.length === 0 && !this._skeletonJson && !this._nativeAsset;
  };
  return _createClass(SkeletonData, [{
    key: "skeletonJsonStr",
    get: function get() {
      if (this._skeletonJson) {
        return JSON.stringify(this._skeletonJson);
      }
      return '';
    }
  }, {
    key: "skeletonJson",
    get: function get() {
      return this._skeletonJson;
    },
    set: function set(value) {
      this.reset();
      if (typeof value === 'string') {
        this._skeletonJson = JSON.parse(value);
      } else {
        this._skeletonJson = value;
      }
      if (!this._uuid && value.skeleton) {
        this._uuid = value.skeleton.hash;
      }
    }
  }, {
    key: "atlasText",
    get: function get() {
      return this._atlasText;
    },
    set: function set(value) {
      this._atlasText = value;
      this.reset();
    }
  }, {
    key: "_nativeAsset",
    get: function get() {
      return this._buffer;
    },
    set: function set(bin) {
      this._buffer = bin;
      this.reset();
    }
  }]);
}(Asset), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_skeletonJson", [serializable], function () {
  return null;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "textures", [serializable, _dec2$1], function () {
  return [];
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "textureNames", [serializable, _dec3$1], function () {
  return [];
}), _initializer4$1 = applyDecoratedInitializer(_class2$1.prototype, "scale", [serializable], function () {
  return 1;
}), _initializer5$1 = applyDecoratedInitializer(_class2$1.prototype, "_atlasText", [serializable], function () {
  return '';
}), _class2$1)) || _class$1);
legacyCC.internal.SpineSkeletonData = SkeletonData;

var SkeletonSystem = function (_System) {
  function SkeletonSystem() {
    var _this;
    _this = _System.call(this) || this;
    _this._skeletons = new Set();
    return _this;
  }
  _inheritsLoose(SkeletonSystem, _System);
  SkeletonSystem.getInstance = function getInstance() {
    if (!SkeletonSystem._instance) {
      SkeletonSystem._instance = new SkeletonSystem();
      director.registerSystem(SkeletonSystem.ID, SkeletonSystem._instance, SystemPriority.HIGH);
    }
    return SkeletonSystem._instance;
  };
  var _proto = SkeletonSystem.prototype;
  _proto.add = function add(skeleton) {
    if (!skeleton) return;
    if (!this._skeletons.has(skeleton)) {
      this._skeletons.add(skeleton);
    }
  };
  _proto.remove = function remove(skeleton) {
    if (!skeleton) return;
    if (this._skeletons.has(skeleton)) {
      this._skeletons["delete"](skeleton);
    }
  };
  _proto.postUpdate = function postUpdate(dt) {
    if (!this._skeletons) {
      return;
    }
    this._skeletons.forEach(function (skeleton) {
      skeleton.updateAnimation(dt);
    });
  };
  _proto.prepareRenderData = function prepareRenderData() {
    if (!this._skeletons) {
      return;
    }
    this._skeletons.forEach(function (skeleton) {
      skeleton._markForUpdateRenderData();
    });
  };
  return SkeletonSystem;
}(System);
SkeletonSystem.ID = 'SKELETON';
SkeletonSystem._instance = void 0;
legacyCC.internal.SpineSkeletonSystem = SkeletonSystem;

var tempMat4 = new Mat4();
var AttachUtil = function () {
  function AttachUtil() {
    this._isInitialized = false;
    this._skeletonBones = null;
    this._socketNodes = null;
    this._keysToDelete = [];
    this._isInitialized = false;
  }
  var _proto = AttachUtil.prototype;
  _proto.init = function init(skeletonComp) {
    var _skeletonComp$socketN;
    this._isInitialized = false;
    if (!skeletonComp || ((_skeletonComp$socketN = skeletonComp.socketNodes) == null ? void 0 : _skeletonComp$socketN.size) === 0) return;
    this._skeletonBones = skeletonComp._skeleton.bones;
    if (!this._skeletonBones || this._skeletonBones.length < 1) return;
    this._socketNodes = skeletonComp.socketNodes;
    if (!this._socketNodes || this._socketNodes.size <= 0) return;
    this._isInitialized = true;
    this._syncAttachedNode();
  };
  _proto.updateSkeletonBones = function updateSkeletonBones(bones) {
    this._skeletonBones = bones;
  };
  _proto.reset = function reset() {
    this._isInitialized = false;
    this._skeletonBones = null;
    this._socketNodes = null;
    this._keysToDelete.length = 0;
  };
  _proto._syncAttachedNode = function _syncAttachedNode() {
    if (!this._isInitialized) return;
    var socketNodes = this._socketNodes;
    for (var _iterator = _createForOfIteratorHelperLoose(socketNodes), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        boneIdx = _step$value[0],
        boneNode = _step$value[1];
      if (!boneNode || !boneNode.isValid) {
        this._keysToDelete.push(boneIdx);
        continue;
      }
      var bone = this._skeletonBones[boneIdx];
      if (bone) this.matrixHandle(boneNode, bone);
    }
    if (this._keysToDelete.length <= 0) return;
    for (var _iterator2 = _createForOfIteratorHelperLoose(this._keysToDelete), _step2; !(_step2 = _iterator2()).done;) {
      var _boneIdx = _step2.value;
      socketNodes["delete"](_boneIdx);
    }
    this._keysToDelete.length = 0;
  };
  _proto.matrixHandle = function matrixHandle(node, bone) {
    var tm = tempMat4;
    tm.m00 = bone.a;
    tm.m01 = bone.c;
    tm.m04 = bone.b;
    tm.m05 = bone.d;
    tm.m12 = bone.worldX;
    tm.m13 = bone.worldY;
    node.matrix = tempMat4;
  };
  return AttachUtil;
}();

var _dec, _dec2, _class, _class2, _initializer, _initializer2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class3, _class4, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _Skeleton;
function isSkeletonDataValid(skeletonData) {
  return !!skeletonData && !skeletonData.isEmpty();
}
var timeScale = 1.0;
var SpineAnimationCacheMode;
(function (SpineAnimationCacheMode) {
  SpineAnimationCacheMode[SpineAnimationCacheMode["UNSET"] = -1] = "UNSET";
  SpineAnimationCacheMode[SpineAnimationCacheMode["REALTIME"] = 0] = "REALTIME";
  SpineAnimationCacheMode[SpineAnimationCacheMode["SHARED_CACHE"] = 1] = "SHARED_CACHE";
  SpineAnimationCacheMode[SpineAnimationCacheMode["PRIVATE_CACHE"] = 2] = "PRIVATE_CACHE";
})(SpineAnimationCacheMode || (SpineAnimationCacheMode = {}));
ccenum(SpineAnimationCacheMode);
var AnimationCacheMode = SpineAnimationCacheMode;
var DefaultSkinsEnum;
(function (DefaultSkinsEnum) {
  DefaultSkinsEnum[DefaultSkinsEnum["default"] = 0] = "default";
})(DefaultSkinsEnum || (DefaultSkinsEnum = {}));
ccenum(DefaultSkinsEnum);
var SpineDefaultAnimsEnum;
(function (SpineDefaultAnimsEnum) {
  SpineDefaultAnimsEnum[SpineDefaultAnimsEnum["<None>"] = 0] = "<None>";
})(SpineDefaultAnimsEnum || (SpineDefaultAnimsEnum = {}));
ccenum(SpineDefaultAnimsEnum);
var DefaultAnimsEnum = SpineDefaultAnimsEnum;
var SpineMaterialType;
(function (SpineMaterialType) {
  SpineMaterialType[SpineMaterialType["COLORED_TEXTURED"] = 0] = "COLORED_TEXTURED";
  SpineMaterialType[SpineMaterialType["TWO_COLORED"] = 1] = "TWO_COLORED";
})(SpineMaterialType || (SpineMaterialType = {}));
var SpineSocket = (_dec = ccclass('sp.Skeleton.SpineSocket'), _dec2 = type(Node), _dec(_class = (_class2 = function SpineSocket(path, target) {
  if (path === void 0) {
    path = '';
  }
  if (target === void 0) {
    target = null;
  }
  this.path = _initializer && _initializer();
  this.target = _initializer2 && _initializer2();
  this.path = path;
  this.target = target;
}, _initializer = applyDecoratedInitializer(_class2.prototype, "path", [serializable], function () {
  return '';
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "target", [_dec2, serializable], function () {
  return null;
}), _class2)) || _class);
setClassAlias(SpineSocket, 'sp.Skeleton.SpineSocket');
var Skeleton = (_dec3 = ccclass('sp.Skeleton'), _dec4 = type(SkeletonData), _dec5 = type(DefaultSkinsEnum), _dec6 = type(SpineDefaultAnimsEnum), _dec7 = type(SpineAnimationCacheMode), _dec8 = type([SpineSocket]), _dec9 = type(Material), _dec3(_class3 = (_class4 = (_Skeleton = function (_UIRenderer) {
  function Skeleton() {
    var _this;
    _this = _UIRenderer.call(this) || this;
    _this._skeletonData = _initializer3 && _initializer3();
    _this.defaultSkin = _initializer4 && _initializer4();
    _this.defaultAnimation = _initializer5 && _initializer5();
    _this._premultipliedAlpha = _initializer6 && _initializer6();
    _this._timeScale = _initializer7 && _initializer7();
    _this._preCacheMode = _initializer8 && _initializer8();
    _this._cacheMode = _initializer9 && _initializer9();
    _this._sockets = _initializer0 && _initializer0();
    _this._useTint = _initializer1 && _initializer1();
    _this._debugMesh = _initializer10 && _initializer10();
    _this._debugBones = _initializer11 && _initializer11();
    _this._debugSlots = _initializer12 && _initializer12();
    _this._enableBatch = _initializer13 && _initializer13();
    _this._runtimeData = null;
    _this._skeleton = null;
    _this._instance = null;
    _this._state = null;
    _this._textures = [];
    _this._skeletonInfo = null;
    _this._animationName = '';
    _this._skinName = '';
    _this._drawList = new RecyclePool(function () {
      return {
        material: null,
        texture: null,
        indexOffset: 0,
        indexCount: 0
      };
    }, 1);
    _this._materialCache = {};
    _this.paused = false;
    _this._enumSkins = Enum({});
    _this._enumAnimations = Enum({});
    _this.attachUtil = void 0;
    _this._socketNodes = new Map();
    _this._cachedSockets = new Map();
    _this._startEntry = void 0;
    _this._endEntry = void 0;
    _this._paused = false;
    _this._accTime = 0;
    _this._playCount = 0;
    _this._skeletonCache = null;
    _this._animCache = null;
    _this._animationQueue = [];
    _this._headAniInfo = null;
    _this._isAniComplete = true;
    _this._playTimes = 0;
    _this._curFrame = null;
    _this._listener = null;
    _this._debugRenderer = null;
    _this._startSlotIndex = void 0;
    _this._endSlotIndex = void 0;
    _this._customMaterialInstance = null;
    _this._vLength = 0;
    _this._vBuffer = null;
    _this._iLength = 0;
    _this._iBuffer = null;
    _this._model = void 0;
    _this._tempColor = {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    };
    _this._eventListenerID = -1;
    _this._slotTextures = null;
    _this._isRenderable = false;
    _this.loop = _initializer14 && _initializer14();
    _this._useVertexOpacity = true;
    _this._startEntry = {
      animation: {
        name: ''
      },
      trackIndex: 0
    };
    _this._endEntry = {
      animation: {
        name: ''
      },
      trackIndex: 0
    };
    _this._startSlotIndex = -1;
    _this._endSlotIndex = -1;
    {
      _this._instance = new spine$1.SkeletonInstance();
      _this._instance.dtRate = _this._timeScale * timeScale;
      _this._instance.isCache = _this.isAnimationCached();
    }
    _this.attachUtil = new AttachUtil();
    return _this;
  }
  _inheritsLoose(Skeleton, _UIRenderer);
  var _proto = Skeleton.prototype;
  _proto.__preload = function __preload() {
    _UIRenderer.prototype.__preload.call(this);
    this._updateSkeletonData();
    this._updateDebugDraw();
  };
  _proto.onRestore = function onRestore() {
    this.updateMaterial();
    this._markForUpdateRenderData();
  };
  _proto.getState = function getState() {
    return this._state;
  };
  _proto.onEnable = function onEnable() {
    _UIRenderer.prototype.onEnable.call(this);
    this._flushAssembler();
    SkeletonSystem.getInstance().add(this);
    this._isRenderable = true;
  };
  _proto.onDisable = function onDisable() {
    _UIRenderer.prototype.onDisable.call(this);
    SkeletonSystem.getInstance().remove(this);
    this._isRenderable = false;
  };
  _proto.onDestroy = function onDestroy() {
    var _this$_slotTextures;
    if (this._eventListenerID > 0) {
      TrackEntryListeners.removeListener(this._eventListenerID);
      this._eventListenerID = -1;
    }
    this._drawList.destroy();
    this.destroyRenderData();
    this._cleanMaterialCache();
    this._vBuffer = null;
    this._iBuffer = null;
    this.attachUtil.reset();
    (_this$_slotTextures = this._slotTextures) == null ? void 0 : _this$_slotTextures.clear();
    this._slotTextures = null;
    this._cachedSockets.clear();
    this._socketNodes.clear();
    this._animCache = null;
    SkeletonSystem.getInstance().remove(this);
    if (this._instance) {
      this._instance.destroy();
      this._instance = null;
    }
    this._destroySkeletonInfo(this._skeletonCache);
    this._skeletonCache = null;
    _UIRenderer.prototype.onDestroy.call(this);
  };
  _proto.clearAnimation = function clearAnimation(trackIndex) {
    if (!this.isAnimationCached()) {
      this.clearTrack(trackIndex || 0);
      this.setToSetupPose();
    }
  };
  _proto.clearAnimations = function clearAnimations() {
    if (!this.isAnimationCached()) {
      this.clearTracks();
      this.setToSetupPose();
    }
  };
  _proto._updateSkeletonData = function _updateSkeletonData() {
    var skeletonData = this._skeletonData;
    if (!isSkeletonDataValid(this._skeletonData)) {
      this._runtimeData = null;
      this._state = null;
      this._skeleton = null;
      this._textures = [];
      this._refreshInspector();
      if (this._isRenderable) {
        SkeletonSystem.getInstance().remove(this);
      }
      return;
    }
    if (this._instance) {
      this._instance.dtRate = this._timeScale * timeScale;
    }
    this._runtimeData = skeletonData.getRuntimeData();
    if (!this._runtimeData) return;
    this.setSkeletonData(this._runtimeData);
    this._textures = skeletonData.textures;
    this._refreshInspector();
    if (this.defaultSkin && this.defaultSkin !== '') {
      this.setSkin(this.defaultSkin);
    } else if (this._skinName && this._skinName !== '') {
      this.setSkin(this._skinName);
    }
    if (this.defaultAnimation) {
      this.animation = this.defaultAnimation.toString();
    } else if (this._animationName) {
      this.animation = this._animationName;
    } else {
      this.animation = '';
    }
    this._updateUseTint();
    this._indexBoneSockets();
    this._updateSocketBindings();
    this.attachUtil.init(this);
    this._preCacheMode = this._cacheMode;
  };
  _proto.setSkeletonData = function setSkeletonData(skeletonData) {
    {
      var preSkeletonCache = this._skeletonCache;
      if (this._cacheMode === SpineAnimationCacheMode.SHARED_CACHE) {
        this._skeletonCache = SkeletonCache.sharedCache;
      } else if (this._cacheMode === SpineAnimationCacheMode.PRIVATE_CACHE) {
        this._skeletonCache = new SkeletonCache();
        this._skeletonCache.enablePrivateMode();
      } else {
        this._skeletonCache = null;
      }
      if (preSkeletonCache !== this._skeletonCache) {
        this._destroySkeletonInfo(preSkeletonCache);
      }
    }
    if (this.isAnimationCached()) {
      if (this.debugBones || this.debugSlots) {
        warnID(16410);
      }
      var skeletonInfo = this._skeletonCache.getSkeletonInfo(this._skeletonData);
      if (this._skeletonInfo !== skeletonInfo) {
        this._destroySkeletonInfo(this._skeletonCache);
        if (!skeletonInfo && this._cacheMode === SpineAnimationCacheMode.PRIVATE_CACHE) {
          this._animCache = this._skeletonCache.initAnimationCache(this.skeletonData.uuid, this._skeletonData, this._animationName);
        }
        this._skeletonInfo = this._skeletonCache.createSkeletonInfo(this._skeletonData);
      }
      if (this._skeletonInfo) {
        this._skeleton = this._skeletonInfo.skeleton;
      }
    } else {
      this._skeleton = this._instance.initSkeleton(skeletonData);
      this._state = this._instance.getAnimationState();
      this._instance.setPremultipliedAlpha(this._premultipliedAlpha);
    }
    if (this._isRenderable) {
      SkeletonSystem.getInstance().add(this);
    }
    this._flushAssembler();
  };
  _proto.setSlotsRange = function setSlotsRange(startSlotIndex, endSlotIndex) {
    if (this.isAnimationCached()) {
      warnID(16411);
    } else {
      this._startSlotIndex = startSlotIndex;
      this._endSlotIndex = endSlotIndex;
    }
  };
  _proto.getAttachment = function getAttachment(slotName, attachmentName) {
    if (this._skeleton) {
      return this._skeleton.getAttachmentByName(slotName, attachmentName);
    }
    return null;
  };
  _proto.setAttachment = function setAttachment(slotName, attachmentName) {
    if (this._skeleton) {
      this._skeleton.setAttachment(slotName, attachmentName);
    }
    this.invalidAnimationCache();
  };
  _proto.getTextureAtlas = function getTextureAtlas(regionAttachment) {
    return regionAttachment.region;
  };
  _proto.setAnimation = function setAnimation(trackIndex, name, loop) {
    if (!(typeof name === 'string')) {
      logID(7511);
      return null;
    }
    var skeleton = this._skeleton;
    var animation = skeleton ? skeleton.data.findAnimation(name) : null;
    if (!animation) {
      logID(7509, name);
      return null;
    }
    var trackEntry = null;
    if (loop === undefined) loop = true;
    this._playTimes = loop ? 0 : 1;
    if (this.isAnimationCached()) {
      if (trackIndex !== 0) {
        warnID(16412);
      }
      if (!this._skeletonCache) return null;
      var cache = this._skeletonCache.getAnimationCache(this._skeletonData.uuid, name);
      if (!cache) {
        cache = this._skeletonCache.initAnimationCache(this.skeletonData.uuid, this._skeletonData, name);
        if (cache && this._skinName) cache.setSkin(this._skinName);
      }
      if (cache) {
        this._animationName = name;
        this._isAniComplete = false;
        this._accTime = 0;
        this._playCount = 0;
        this._animCache = cache;
        if (this._socketNodes.size > 0) {
          this._animCache.enableCacheAttachedInfo();
        }
        this._animCache.updateToFrame(0);
        this._curFrame = this._animCache.frames[0];
      }
    } else {
      this._animationName = name;
      trackEntry = this._instance.setAnimation(trackIndex, name, loop);
    }
    this._markForUpdateRenderData();
    return trackEntry;
  };
  _proto.addAnimation = function addAnimation(trackIndex, name, loop, delay) {
    delay = delay || 0;
    if (this.isAnimationCached()) {
      if (trackIndex !== 0) {
        warnID(16413);
      }
      this._animationQueue.push({
        animationName: name,
        loop: loop,
        delay: delay
      });
      return null;
    } else if (this._skeleton) {
      var _this$_state;
      var animation = this._skeleton.data.findAnimation(name);
      if (!animation) {
        logID(7510, name);
        return null;
      }
      return (_this$_state = this._state) == null ? void 0 : _this$_state.addAnimationWith(trackIndex, animation, loop, delay);
    }
    return null;
  };
  _proto.findAnimation = function findAnimation(name) {
    if (this._skeleton) {
      return this._skeleton.data.findAnimation(name);
    }
    return null;
  };
  _proto.getCurrent = function getCurrent(trackIndex) {
    if (this.isAnimationCached()) {
      warnID(16414);
    } else if (this._state) {
      return this._state.getCurrent(trackIndex);
    }
    return null;
  };
  _proto.setSkin = function setSkin(name) {
    if (!name) return;
    if (this._skeleton) this._skeleton.setSkinByName(name);
    this._instance.setSkin(name);
    if (this.isAnimationCached()) {
      if (this._animCache) {
        this._animCache.setSkin(name);
      }
    }
    this._skinName = name;
    this.invalidAnimationCache();
  };
  _proto.updateAnimation = function updateAnimation(dt) {
    this._markForUpdateRenderData();
    if (this.paused) return;
    if (this.isAnimationCached()) {
      dt *= this._timeScale * timeScale;
      if (this._isAniComplete) {
        var _this$_headAniInfo;
        if (this._animationQueue.length === 0 && !this._headAniInfo) {
          var frameCache = this._animCache;
          if (frameCache && frameCache.isInvalid()) {
            frameCache.updateToFrame(0);
            var frames = frameCache.frames;
            this._curFrame = frames[frames.length - 1];
          }
          return;
        }
        if (!this._headAniInfo) {
          this._headAniInfo = this._animationQueue.shift();
        }
        this._accTime += dt;
        if (this._accTime > ((_this$_headAniInfo = this._headAniInfo) == null ? void 0 : _this$_headAniInfo.delay)) {
          var aniInfo = this._headAniInfo;
          this._headAniInfo = null;
          this.setAnimation(0, aniInfo == null ? void 0 : aniInfo.animationName, aniInfo == null ? void 0 : aniInfo.loop);
        }
        return;
      }
      this._updateCache(dt);
    } else {
      this._instance.updateAnimation(dt);
    }
  };
  _proto._updateCache = function _updateCache(dt) {
    var frameCache = this._animCache;
    if (!frameCache.isInited()) {
      return;
    }
    var frames = frameCache.frames;
    var frameTime = SkeletonCache.FrameTime;
    if (this._accTime === 0 && this._playCount === 0) {
      this._startEntry.animation.name = this._animationName;
      if (this._listener && this._listener.start) {
        this._listener.start(this._startEntry);
      }
    }
    this._accTime += dt;
    var frameIdx = Math.floor(this._accTime / frameTime);
    if (!frameCache.isCompleted) {
      frameCache.updateToFrame(frameIdx);
    }
    this._curFrame = frames[frameIdx];
    if (this._curFrame !== undefined) {
      this.attachUtil.updateSkeletonBones(this._curFrame.boneInfos);
    }
    if (frameCache.isCompleted && frameIdx >= frames.length) {
      this._playCount++;
      if (this._playTimes > 0 && this._playCount >= this._playTimes) {
        this._curFrame = frames[frames.length - 1];
        this._accTime = 0;
        this._playCount = 0;
        this._isAniComplete = true;
        this._emitCacheCompleteEvent();
        return;
      }
      this._accTime = 0;
      frameIdx = 0;
      this._curFrame = frames[frameIdx];
      this._emitCacheCompleteEvent();
    }
  };
  _proto._emitCacheCompleteEvent = function _emitCacheCompleteEvent() {
    if (!this._listener) return;
    this._endEntry.animation.name = this._animationName;
    if (this._listener.complete) this._listener.complete(this._endEntry);
    if (this._listener.end) this._listener.end(this._endEntry);
  };
  _proto.updateRenderData = function updateRenderData() {
    if (this.isAnimationCached()) {
      if (!this._curFrame) return null;
      var model = this._curFrame.model;
      return model;
    } else {
      var _model = this._instance.updateRenderData();
      return _model;
    }
  };
  _proto._flushAssembler = function _flushAssembler() {
    var assembler = Skeleton.Assembler.getAssembler(this);
    if (this._assembler !== assembler) {
      this._assembler = assembler;
    }
    if (this._skeleton && this._assembler && this._assembler.createData) {
      this._renderData = this._assembler.createData(this);
      this._markForUpdateRenderData();
      this._updateColor();
    }
  };
  _proto._render = function _render(batcher) {
    var indicesCount = 0;
    if (this.renderData && this._drawList.length > 0) {
      var rd = this.renderData;
      var chunk = rd.chunk;
      var accessor = chunk.vertexAccessor;
      var meshBuffer = rd.getMeshBuffer();
      var origin = meshBuffer.indexOffset;
      for (var i = 0; i < this._drawList.length; i++) {
        var dc = this._drawList.data[i];
        if (dc.texture) {
          batcher.commitMiddleware(this, meshBuffer, origin + dc.indexOffset, dc.indexCount, dc.texture, dc.material, this._enableBatch);
        }
        indicesCount += dc.indexCount;
      }
      var subIndices = rd.indices.subarray(0, indicesCount);
      accessor.appendIndices(chunk.bufferId, subIndices);
      accessor.getMeshBuffer(chunk.bufferId).setDirty();
    }
  };
  _proto.requestDrawData = function requestDrawData(material, textureUUID, indexOffset, indexCount) {
    var draw = this._drawList.add();
    draw.material = material;
    var tex = assetManager.assets.get(textureUUID);
    if (!tex) {
      var _this$skeletonData;
      tex = (_this$skeletonData = this.skeletonData) == null ? void 0 : _this$skeletonData.textures.find(function (t) {
        return t.uuid === textureUUID || t.getId() === textureUUID;
      });
      if (!tex) {
        var _this$_slotTextures2;
        tex = (_this$_slotTextures2 = this._slotTextures) == null ? void 0 : _this$_slotTextures2.get(textureUUID);
      }
    }
    draw.texture = tex;
    draw.indexOffset = indexOffset;
    draw.indexCount = indexCount;
    return draw;
  };
  _proto._updateBuiltinMaterial = function _updateBuiltinMaterial() {
    var material = builtinResMgr.get('default-spine-material');
    return material;
  };
  _proto.updateMaterial = function updateMaterial() {
    var mat;
    if (this._customMaterial) mat = this._customMaterial;else mat = this._updateBuiltinMaterial();
    this.setSharedMaterial(mat, 0);
    this._cleanMaterialCache();
  };
  _proto.getMaterialTemplate = function getMaterialTemplate() {
    if (this.customMaterial !== null) return this.customMaterial;
    if (this.material) return this.material;
    this.updateMaterial();
    return this.material;
  };
  _proto._cleanMaterialCache = function _cleanMaterialCache() {
    for (var val in this._materialCache) {
      this._materialCache[val].destroy();
    }
    this._materialCache = {};
  };
  _proto.getMaterialForBlendAndTint = function getMaterialForBlendAndTint(src, dst, type) {
    var key = type + "/" + src + "/" + dst;
    var inst = this._materialCache[key];
    if (inst) {
      return inst;
    }
    if (this._customMaterialInstance) {
      inst = this._customMaterialInstance;
    } else {
      var material = this.getMaterialTemplate();
      var matInfo = {
        parent: material,
        subModelIdx: 0,
        owner: this
      };
      inst = new MaterialInstance(matInfo);
    }
    this._materialCache[key] = inst;
    inst.overridePipelineStates({
      blendState: {
        blendColor: Color.WHITE,
        targets: [{
          blendEq: BlendOp.ADD,
          blendAlphaEq: BlendOp.ADD,
          blendSrc: src,
          blendDst: dst,
          blendSrcAlpha: src,
          blendDstAlpha: dst
        }]
      }
    });
    var useTwoColor = false;
    if (type === SpineMaterialType.TWO_COLORED) {
      useTwoColor = true;
    }
    var useLocal = !this._enableBatch;
    inst.recompileShaders({
      TWO_COLORED: useTwoColor,
      USE_LOCAL: useLocal
    });
    return inst;
  };
  _proto._updateAnimEnum = function _updateAnimEnum() {
    var animEnum;
    if (isSkeletonDataValid(this.skeletonData)) {
      animEnum = this.skeletonData.getAnimsEnum();
    } else {
      animEnum = SpineDefaultAnimsEnum;
    }
    this._enumAnimations = Enum({});
    Object.assign(this._enumAnimations, animEnum);
    Enum.update(this._enumAnimations);
    setPropertyEnumType(this, '_animationIndex', this._enumAnimations);
  };
  _proto._updateSkinEnum = function _updateSkinEnum() {
    var skinEnum;
    if (isSkeletonDataValid(this.skeletonData)) {
      skinEnum = this.skeletonData.getSkinsEnum();
    } else {
      skinEnum = DefaultSkinsEnum;
    }
    this._enumSkins = Enum({});
    Object.assign(this._enumSkins, skinEnum);
    Enum.update(this._enumSkins);
    setPropertyEnumType(this, '_defaultSkinIndex', this._enumSkins);
  };
  _proto._refreshInspector = function _refreshInspector() {
  };
  _proto.destroyRenderData = function destroyRenderData() {
    this._drawList.reset();
    _UIRenderer.prototype.destroyRenderData.call(this);
  };
  _proto.createRenderEntity = function createRenderEntity() {
    var renderEntity = new RenderEntity(RenderEntityType.DYNAMIC);
    renderEntity.setUseLocal(true);
    return renderEntity;
  };
  _proto.markForUpdateRenderData = function markForUpdateRenderData(enable) {
    if (enable === void 0) {
      enable = true;
    }
    _UIRenderer.prototype._markForUpdateRenderData.call(this, enable);
    if (this._debugRenderer) {
      this._debugRenderer._markForUpdateRenderData(enable);
    }
  };
  _proto.syncAttachedNode = function syncAttachedNode() {
    this.attachUtil._syncAttachedNode();
  };
  _proto.isAnimationCached = function isAnimationCached() {
    return this._cacheMode !== SpineAnimationCacheMode.REALTIME;
  };
  _proto.setAnimationCacheMode = function setAnimationCacheMode(cacheMode) {
    if (this._preCacheMode !== cacheMode) {
      this._cacheMode = cacheMode;
      this._preCacheMode = cacheMode;
      if (this._instance) {
        this._instance.isCache = this.isAnimationCached();
      }
      this._updateSkeletonData();
      this._markForUpdateRenderData();
    }
  };
  _proto.setToSetupPose = function setToSetupPose() {
    if (this._skeleton) {
      this._skeleton.setToSetupPose();
    }
  };
  _proto.setBonesToSetupPose = function setBonesToSetupPose() {
    if (this._skeleton) {
      this._skeleton.setBonesToSetupPose();
    }
  };
  _proto.setSlotsToSetupPose = function setSlotsToSetupPose() {
    if (this._skeleton) {
      this._skeleton.setSlotsToSetupPose();
    }
  };
  _proto.invalidAnimationCache = function invalidAnimationCache() {
    if (!this.isAnimationCached()) return;
    if (this._skeletonCache) {
      this._skeletonCache.invalidAnimationCache(this._skeletonData.uuid);
    }
  };
  _proto.findBone = function findBone(boneName) {
    if (this._skeleton) {
      return this._skeleton.findBone(boneName);
    }
    return null;
  };
  _proto.findSlot = function findSlot(slotName) {
    if (this._skeleton) {
      return this._skeleton.findSlot(slotName);
    }
    return null;
  };
  _proto.setMix = function setMix(fromAnimation, toAnimation, duration) {
    if (this.isAnimationCached()) {
      warnID(16415);
      return;
    }
    if (this._state) {
      this._instance.setMix(fromAnimation, toAnimation, duration);
    }
  };
  _proto.clearTracks = function clearTracks() {
    if (this.isAnimationCached()) {
      warnID(16416);
    } else if (this._state) {
      this._state.clearTracks();
      this.setToSetupPose();
    }
  };
  _proto.clearTrack = function clearTrack(trackIndex) {
    if (this.isAnimationCached()) {
      warnID(16417);
    } else if (this._state) {
      this._state.clearTrack(trackIndex);
    }
  };
  _proto.updateWorldTransform = function updateWorldTransform() {
    if (!this.isAnimationCached()) return;
    if (this._skeleton) {
      this._skeleton.updateWorldTransform();
    }
  };
  _proto._verifySockets = function _verifySockets(sockets) {
    for (var i = 0, l = sockets.length; i < l; i++) {
      var target = sockets[i].target;
      if (target) {
        if (!target.parent || target.parent !== this.node) {
          error("Target node " + target.name + " is expected to be a direct child of " + this.node.name);
          continue;
        }
      }
    }
    var uniqueSocketNode = new Map();
    sockets.forEach(function (x) {
      if (x.target) {
        if (uniqueSocketNode.get(x.target)) {
          error("Target node " + x.target.name + " has existed.");
        } else {
          uniqueSocketNode.set(x.target, true);
        }
      }
    });
  };
  _proto._updateSocketBindings = function _updateSocketBindings() {
    if (!this._skeleton) return;
    this._socketNodes.clear();
    for (var i = 0, l = this._sockets.length; i < l; i++) {
      var socket = this._sockets[i];
      if (socket.path && socket.target) {
        var boneIdx = this._cachedSockets.get(socket.path);
        if (!boneIdx) {
          error("Skeleton data does not contain path " + socket.path);
          continue;
        }
        this._socketNodes.set(boneIdx, socket.target);
      }
    }
  };
  _proto._indexBoneSockets = function _indexBoneSockets() {
    if (!this._skeleton) {
      return;
    }
    this._cachedSockets.clear();
    var bones = this._skeleton.bones;
    var _getBoneName = function getBoneName(bone) {
      if (bone.parent == null) return bone.data.name || '<Unamed>';
      return _getBoneName(bones[bone.parent.data.index]) + "/" + bone.data.name;
    };
    for (var i = 0, l = bones.length; i < l; i++) {
      var bd = bones[i].data;
      var boneName = _getBoneName(bones[i]);
      this._cachedSockets.set(boneName, bd.index);
    }
  };
  _proto.querySockets = function querySockets() {
    if (!this._skeleton) {
      return [];
    }
    if (this._cachedSockets.size === 0) {
      this._indexBoneSockets();
    }
    if (this._cachedSockets.size > 0) {
      return Array.from(this._cachedSockets.keys()).sort();
    }
    return [];
  };
  _proto._updateUseTint = function _updateUseTint() {
    this._cleanMaterialCache();
    this.destroyRenderData();
    {
      if (!this.isAnimationCached()) {
        this._instance.setUseTint(this._useTint);
      }
    }
    var assembler = this._assembler;
    if (assembler && assembler.createData && this._skeleton) {
      this._renderData = assembler.createData(this);
      this._markForUpdateRenderData();
    }
  };
  _proto._updateBatch = function _updateBatch() {
    this._cleanMaterialCache();
    this._markForUpdateRenderData();
  };
  _proto._updateDebugDraw = function _updateDebugDraw() {
    if (this.debugBones || this.debugSlots || this.debugMesh) {
      if (!this._debugRenderer) {
        var debugDrawNode = new Node('DEBUG_DRAW_NODE');
        debugDrawNode.layer = this.node.layer;
        debugDrawNode.hideFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
        var debugDraw = null;
        try {
          debugDraw = debugDrawNode.addComponent('cc.Graphics');
          debugDraw.lineWidth = 5;
          debugDraw.strokeColor = new Color(255, 0, 0, 255);
          this._debugRenderer = debugDraw;
          debugDrawNode.parent = this.node;
          this.node.on(NodeEventType.LAYER_CHANGED, this._applyLayer, this);
        } catch (e) {
          errorID(4501, e.message);
          debugDrawNode.destroy();
          debugDrawNode = null;
        }
      }
      if (this.isAnimationCached()) {
        warnID(16418);
      } else {
        this._instance.setDebugMode(true);
      }
    } else if (this._debugRenderer) {
      this.node.off(NodeEventType.LAYER_CHANGED, this._applyLayer, this);
      this._debugRenderer.node.destroy();
      this._debugRenderer = null;
      if (!this.isAnimationCached()) {
        if (this._instance) {
          this._instance.setDebugMode(false);
        }
      }
    }
  };
  _proto._updateUITransform = function _updateUITransform() {
    var uiTrans = this.node._getUITransformComp();
    var skeletonData = this._runtimeData;
    if (!skeletonData) {
      uiTrans.setContentSize(100, 100);
      uiTrans.anchorX = 0.5;
      uiTrans.anchorX = 0.5;
      return;
    }
    var width = skeletonData.width;
    var height = skeletonData.height;
    if (width && height) {
      uiTrans.setContentSize(width, height);
      if (width !== 0) uiTrans.anchorX = Math.abs(skeletonData.x) / width;
      if (height !== 0) uiTrans.anchorY = Math.abs(skeletonData.y) / height;
    }
  };
  _proto._updateColor = function _updateColor() {
    var self = this;
    var uiProps = self.node._uiProps;
    var tempColor = self._tempColor;
    var color = self._color;
    var parentOpacity = self.node.parent ? self.node.parent._uiProps.opacity : 1.0;
    var a = uiProps.localOpacity * parentOpacity * color.a / 255;
    if (tempColor.r === color.r && tempColor.g === color.g && tempColor.b === color.b && tempColor.a === a) {
      return;
    }
    uiProps.colorDirty = true;
    tempColor.r = color.r;
    tempColor.g = color.g;
    tempColor.b = color.b;
    tempColor.a = a;
    var r = color.r / 255.0;
    var g = color.g / 255.0;
    var b = color.b / 255.0;
    this._instance.setColor(r, g, b, a);
  };
  _proto.setVertexEffectDelegate = function setVertexEffectDelegate(effectDelegate) {
    {
      warnID(16409);
      return;
    }
  };
  _proto._ensureListener = function _ensureListener() {
    if (!this._listener) {
      this._listener = new TrackEntryListeners();
      this._eventListenerID = TrackEntryListeners.addListener(this._listener);
      this._instance.setListener(this._eventListenerID);
    }
  };
  _proto.setStartListener = function setStartListener(listener) {
    this._ensureListener();
    this._listener.start = listener;
  };
  _proto.setInterruptListener = function setInterruptListener(listener) {
    this._ensureListener();
    this._listener.interrupt = listener;
  };
  _proto.setEndListener = function setEndListener(listener) {
    this._ensureListener();
    this._listener.end = listener;
  };
  _proto.setDisposeListener = function setDisposeListener(listener) {
    this._ensureListener();
    this._listener.dispose = listener;
  };
  _proto.setCompleteListener = function setCompleteListener(listener) {
    this._ensureListener();
    this._listener.complete = listener;
  };
  _proto.setEventListener = function setEventListener(listener) {
    this._ensureListener();
    this._listener.event = listener;
  };
  _proto.setTrackStartListener = function setTrackStartListener(entry, listener) {
    TrackEntryListeners.getListeners(entry, this._instance).start = listener;
  };
  _proto.setTrackInterruptListener = function setTrackInterruptListener(entry, listener) {
    TrackEntryListeners.getListeners(entry, this._instance).interrupt = listener;
  };
  _proto.setTrackEndListener = function setTrackEndListener(entry, listener) {
    TrackEntryListeners.getListeners(entry, this._instance).end = listener;
  };
  _proto.setTrackDisposeListener = function setTrackDisposeListener(entry, listener) {
    TrackEntryListeners.getListeners(entry, this._instance).dispose = listener;
  };
  _proto.setTrackCompleteListener = function setTrackCompleteListener(entry, listener) {
    var onComplete = function onComplete(trackEntry) {
      var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
      listener(trackEntry, loopCount);
    };
    TrackEntryListeners.getListeners(entry, this._instance).complete = onComplete;
  };
  _proto.setTrackEventListener = function setTrackEventListener(entry, listener) {
    TrackEntryListeners.getListeners(entry, this._instance).event = listener;
  };
  _proto.getDebugShapes = function getDebugShapes() {
    return this._instance.getDebugShapes();
  };
  _proto.setSlotTexture = function setSlotTexture(slotName, tex2d, createNew) {
    if (this.isAnimationCached()) {
      error("Cached mode can't change texture of slot");
      return;
    }
    var slot = this.findSlot(slotName);
    if (!slot) {
      error("No slot named:" + slotName);
      return;
    }
    var width = tex2d.width;
    var height = tex2d.height;
    var createNewAttachment = createNew || false;
    this._instance.resizeSlotRegion(slotName, width, height, createNewAttachment);
    var uuid = tex2d.uuid;
    if (!uuid) {
      uuid = tex2d.getId();
    }
    this._instance.setSlotTexture(slotName, uuid);
    if (!this._slotTextures) this._slotTextures = new Map();
    this._slotTextures.set(uuid, tex2d);
  };
  _proto._destroySkeletonInfo = function _destroySkeletonInfo(skeletonCache) {
    if (skeletonCache && this._skeletonInfo) {
      skeletonCache.destroySkeleton(this._skeletonInfo.assetUUID);
      this._skeletonInfo = null;
    }
  };
  _proto._applyLayer = function _applyLayer() {
    if (this._debugRenderer) {
      this._debugRenderer.node.layer = this.node.layer;
    }
  };
  return _createClass(Skeleton, [{
    key: "drawList",
    get: function get() {
      return this._drawList;
    }
  }, {
    key: "skeletonData",
    get: function get() {
      return this._skeletonData;
    },
    set: function set(value) {
      if (value) value.resetEnums();
      if (this._skeletonData !== value) {
        this.destroyRenderData();
        this._skeletonData = value;
        this.defaultSkin = '';
        this.defaultAnimation = '';
        this._animationName = '';
        this._skinName = '';
        this._animCache = null;
        this._destroySkeletonInfo(this._skeletonCache);
        this._updateSkeletonData();
        this._updateUITransform();
      }
    }
  }, {
    key: "_defaultSkinIndex",
    get: function get() {
      if (isSkeletonDataValid(this.skeletonData)) {
        var skinsEnum = this.skeletonData.getSkinsEnum();
        if (skinsEnum) {
          if (this.defaultSkin === '') {
            if (skinsEnum.hasOwnProperty(0)) {
              this._defaultSkinIndex = 0;
              return 0;
            }
          } else {
            var skinIndex = skinsEnum[this.defaultSkin];
            if (skinIndex !== undefined) {
              return skinIndex;
            }
          }
        }
      }
      return 0;
    },
    set: function set(value) {
      var skinsEnum;
      if (isSkeletonDataValid(this.skeletonData)) {
        skinsEnum = this.skeletonData.getSkinsEnum();
      }
      if (!skinsEnum) {
        error(this.name + " skin enums are invalid");
        return;
      }
      var skinName = skinsEnum[value];
      if (skinName !== undefined) {
        this.defaultSkin = String(skinName);
        this.setSkin(this.defaultSkin);
        this._refreshInspector();
        this._markForUpdateRenderData();
      } else {
        error(this.name + " skin enums are invalid");
      }
    }
  }, {
    key: "_animationIndex",
    get: function get() {
      var animationName = this.animation;
      if (isSkeletonDataValid(this.skeletonData)) {
        if (animationName) {
          var animsEnum = this.skeletonData.getAnimsEnum();
          if (animsEnum) {
            var animIndex = animsEnum[animationName];
            if (animIndex !== undefined) {
              return animIndex;
            }
          }
        } else {
          this._refreshInspector();
        }
      }
      return 0;
    },
    set: function set(value) {
      var animsEnum;
      if (isSkeletonDataValid(this.skeletonData)) {
        animsEnum = this.skeletonData.getAnimsEnum();
      }
      if (!animsEnum) {
        error(this.name + " animation enums are invalid");
        return;
      }
      var animName = String(animsEnum[value]);
      if (animName !== undefined) {
        this.animation = animName;
        {
          this.animation = animName;
        }
      } else {
        error(this.name + " animation enums are invalid");
      }
    }
  }, {
    key: "defaultCacheMode",
    get: function get() {
      return this._cacheMode;
    },
    set: function set(mode) {
      this._cacheMode = mode;
      this.setAnimationCacheMode(this._cacheMode);
    }
  }, {
    key: "premultipliedAlpha",
    get: function get() {
      return this._premultipliedAlpha;
    },
    set: function set(v) {
      if (v !== this._premultipliedAlpha) {
        this._premultipliedAlpha = v;
        this._instance.setPremultipliedAlpha(v);
        this._markForUpdateRenderData();
      }
    }
  }, {
    key: "timeScale",
    get: function get() {
      return this._timeScale;
    },
    set: function set(value) {
      if (value !== this._timeScale) {
        this._timeScale = value;
        if (this._instance) {
          this._instance.dtRate = this._timeScale * timeScale;
        }
      }
    }
  }, {
    key: "useTint",
    get: function get() {
      return this._useTint;
    },
    set: function set(value) {
      if (value !== this._useTint) {
        this._useTint = value;
        this._updateUseTint();
      }
    }
  }, {
    key: "enableBatch",
    get: function get() {
      return this._enableBatch;
    },
    set: function set(value) {
      if (value !== this._enableBatch) {
        this._enableBatch = value;
        this._updateBatch();
      }
    }
  }, {
    key: "sockets",
    get: function get() {
      return this._sockets;
    },
    set: function set(val) {
      this._sockets = val;
      this._updateSocketBindings();
      this.attachUtil.init(this);
    }
  }, {
    key: "debugSlots",
    get: function get() {
      return this._debugSlots;
    },
    set: function set(v) {
      if (v !== this._debugSlots) {
        this._debugSlots = v;
        this._updateDebugDraw();
        this._markForUpdateRenderData();
      }
    }
  }, {
    key: "debugBones",
    get: function get() {
      return this._debugBones;
    },
    set: function set(v) {
      if (v !== this._debugBones) {
        this._debugBones = v;
        this._updateDebugDraw();
        this._markForUpdateRenderData();
      }
    }
  }, {
    key: "debugMesh",
    get: function get() {
      return this._debugMesh;
    },
    set: function set(value) {
      if (value !== this._debugMesh) {
        this._debugMesh = value;
        this._updateDebugDraw();
        this._markForUpdateRenderData();
      }
    }
  }, {
    key: "socketNodes",
    get: function get() {
      return this._socketNodes;
    }
  }, {
    key: "animation",
    get: function get() {
      return this._animationName;
    },
    set: function set(value) {
      if (value) {
        this.setAnimation(0, value, this.loop);
      } else {
        this.clearAnimation(0);
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
      this._markForUpdateRenderData();
    }
  }, {
    key: "customMaterialInstance",
    get: function get() {
      if (!this._customMaterial) {
        return null;
      }
      if (!this._customMaterialInstance) {
        var matInfo = {
          parent: this._customMaterial,
          subModelIdx: 0,
          owner: this
        };
        this._customMaterialInstance = new MaterialInstance(matInfo);
      }
      return this._customMaterialInstance;
    }
  }]);
}(UIRenderer), _Skeleton.SpineSocket = SpineSocket, _Skeleton.AnimationCacheMode = SpineAnimationCacheMode, _Skeleton), _initializer3 = applyDecoratedInitializer(_class4.prototype, "_skeletonData", [serializable], function () {
  return null;
}), _initializer4 = applyDecoratedInitializer(_class4.prototype, "defaultSkin", [serializable], function () {
  return '';
}), _initializer5 = applyDecoratedInitializer(_class4.prototype, "defaultAnimation", [serializable], function () {
  return '';
}), _initializer6 = applyDecoratedInitializer(_class4.prototype, "_premultipliedAlpha", [serializable], function () {
  return true;
}), _initializer7 = applyDecoratedInitializer(_class4.prototype, "_timeScale", [serializable], function () {
  return 1;
}), _initializer8 = applyDecoratedInitializer(_class4.prototype, "_preCacheMode", [serializable], function () {
  return SpineAnimationCacheMode.UNSET;
}), _initializer9 = applyDecoratedInitializer(_class4.prototype, "_cacheMode", [serializable], function () {
  return SpineAnimationCacheMode.REALTIME;
}), _initializer0 = applyDecoratedInitializer(_class4.prototype, "_sockets", [serializable], function () {
  return [];
}), _initializer1 = applyDecoratedInitializer(_class4.prototype, "_useTint", [serializable], function () {
  return false;
}), _initializer10 = applyDecoratedInitializer(_class4.prototype, "_debugMesh", [serializable], function () {
  return false;
}), _initializer11 = applyDecoratedInitializer(_class4.prototype, "_debugBones", [serializable], function () {
  return false;
}), _initializer12 = applyDecoratedInitializer(_class4.prototype, "_debugSlots", [serializable], function () {
  return false;
}), _initializer13 = applyDecoratedInitializer(_class4.prototype, "_enableBatch", [serializable], function () {
  return false;
}), _applyDecoratedDescriptor(_class4.prototype, "skeletonData", [_dec4], Object.getOwnPropertyDescriptor(_class4.prototype, "skeletonData"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "_defaultSkinIndex", [_dec5], Object.getOwnPropertyDescriptor(_class4.prototype, "_defaultSkinIndex"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "_animationIndex", [_dec6], Object.getOwnPropertyDescriptor(_class4.prototype, "_animationIndex"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "defaultCacheMode", [_dec7], Object.getOwnPropertyDescriptor(_class4.prototype, "defaultCacheMode"), _class4.prototype), _initializer14 = applyDecoratedInitializer(_class4.prototype, "loop", [serializable], function () {
  return true;
}), _applyDecoratedDescriptor(_class4.prototype, "sockets", [_dec8], Object.getOwnPropertyDescriptor(_class4.prototype, "sockets"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "customMaterial", [override, _dec9], Object.getOwnPropertyDescriptor(_class4.prototype, "customMaterial"), _class4.prototype), _class4)) || _class3);
legacyCC.internal.SpineSkeleton = Skeleton;

var VertexEffectDelegate = function () {
  function VertexEffectDelegate() {
    this.name = 'sp.VertexEffectDelegate';
    this._vertexEffect = void 0;
    this._interpolation = void 0;
    this._effectType = void 0;
    this._vertexEffect = null;
    this._interpolation = null;
    this._effectType = 'none';
  }
  var _proto = VertexEffectDelegate.prototype;
  _proto.clear = function clear() {
    this._vertexEffect = null;
    this._interpolation = null;
    this._effectType = 'none';
  };
  _proto.initJitter = function initJitter(jitterX, jitterY) {
    this._effectType = 'jitter';
    this._vertexEffect = new spine$1.JitterEffect(jitterX, jitterY);
    return this._vertexEffect;
  };
  _proto.initSwirlWithPow = function initSwirlWithPow(radius, power) {
    this._effectType = 'swirl';
    this._interpolation = new spine$1.Pow(power);
    this._vertexEffect = new spine$1.SwirlEffect(radius, this._interpolation);
    return this._vertexEffect;
  };
  _proto.initSwirlWithPowOut = function initSwirlWithPowOut(radius, power) {
    this._effectType = 'swirl';
    this._interpolation = new spine$1.PowOut(power);
    this._vertexEffect = new spine$1.SwirlEffect(radius, this._interpolation);
    return this._vertexEffect;
  };
  _proto.getJitterVertexEffect = function getJitterVertexEffect() {
    return this._vertexEffect;
  };
  _proto.getSwirlVertexEffect = function getSwirlVertexEffect() {
    return this._vertexEffect;
  };
  _proto.getVertexEffect = function getVertexEffect() {
    return this._vertexEffect;
  };
  _proto.getEffectType = function getEffectType() {
    return this._effectType;
  };
  return VertexEffectDelegate;
}();

var ADJUST_SIZE_RATE = 1.1;
var _slotColor = new Color(0, 0, 255, 255);
var _boneColor = new Color(255, 0, 0, 255);
var _originColor = new Color(0, 255, 0, 255);
var _meshColor = new Color(255, 255, 0, 255);
var _nodeR;
var _nodeG;
var _nodeB;
var _nodeA;
var _accessor = null;
var _tintAccessor = null;
var _premultipliedAlpha = false;
var _useTint = false;
var _byteStrideOneColor = getAttributeStride(vfmtPosUvColor4B);
var _byteStrideTwoColor = getAttributeStride(vfmtPosUvTwoColor4B);
var DEBUG_TYPE_REGION = 0;
var DEBUG_TYPE_MESH = 1;
var tempVecPos = new Vec3(0, 0, 0);
function _getSlotMaterial(blendMode, comp) {
  var src;
  var dst;
  switch (blendMode) {
    case 1:
      src = _premultipliedAlpha ? BlendFactor.ONE : BlendFactor.SRC_ALPHA;
      dst = BlendFactor.ONE;
      break;
    case 2:
      src = BlendFactor.DST_COLOR;
      dst = BlendFactor.ONE_MINUS_SRC_ALPHA;
      break;
    case 3:
      src = _premultipliedAlpha ? BlendFactor.ONE : BlendFactor.SRC_ALPHA;
      dst = BlendFactor.ONE_MINUS_SRC_COLOR;
      break;
    case 0:
    default:
      src = _premultipliedAlpha ? BlendFactor.ONE : BlendFactor.SRC_ALPHA;
      dst = BlendFactor.ONE_MINUS_SRC_ALPHA;
      break;
  }
  return comp.getMaterialForBlendAndTint(src, dst, _useTint ? SpineMaterialType.TWO_COLORED : SpineMaterialType.COLORED_TEXTURED);
}
var Simple = function () {
  function Simple() {
    this.vCount = 32767;
  }
  var _proto = Simple.prototype;
  _proto.ensureAccessor = function ensureAccessor(useTint) {
    var accessor = useTint ? _tintAccessor : _accessor;
    if (!accessor) {
      var device = director.root.device;
      var batcher = director.root.batcher2D;
      var attributes = useTint ? vfmtPosUvTwoColor4B : vfmtPosUvColor4B;
      if (useTint) {
        accessor = _tintAccessor = new StaticVBAccessor(device, attributes, this.vCount);
        batcher.registerBufferAccessor(Number.parseInt('SPINETINT', 36), _tintAccessor);
      } else {
        accessor = _accessor = new StaticVBAccessor(device, attributes, this.vCount);
        batcher.registerBufferAccessor(Number.parseInt('SPINE', 36), _accessor);
      }
    }
    return accessor;
  };
  _proto.createData = function createData(comp) {
    var rd = comp.renderData;
    if (!rd) {
      var useTint = comp.useTint || comp.isAnimationCached();
      var accessor = this.ensureAccessor(useTint);
      rd = RenderData.add(useTint ? vfmtPosUvTwoColor4B : vfmtPosUvColor4B, accessor);
    }
    return rd;
  };
  _proto.updateRenderData = function updateRenderData(comp) {
    var _comp$skeletonData;
    var skeleton = comp._skeleton;
    if (skeleton && comp.node.active && (_comp$skeletonData = comp.skeletonData) != null && _comp$skeletonData.isValid) {
      updateComponentRenderData(comp);
    }
  };
  return Simple;
}();
var simple = new Simple();
function updateComponentRenderData(comp) {
  comp.drawList.reset();
  var rd = comp.renderData;
  if (comp.color.a === 0 || !rd) return;
  comp._updateColor();
  _premultipliedAlpha = comp.premultipliedAlpha;
  _useTint = comp.useTint || comp.isAnimationCached();
  if (comp.isAnimationCached()) {
    cacheTraverse(comp);
  } else {
    realTimeTraverse(comp);
  }
  var accessor = _useTint ? _tintAccessor : _accessor;
  comp.syncAttachedNode();
  if (rd.vertexCount > 0 || rd.indexCount > 0) accessor.getMeshBuffer(rd.chunk.bufferId).setDirty();
}
function realTimeTraverse(comp) {
  var _comp$_vBuffer, _comp$_iBuffer;
  var floatStride = (comp.useTint ? _byteStrideTwoColor : _byteStrideOneColor) / Float32Array.BYTES_PER_ELEMENT;
  var model = comp.updateRenderData();
  var vc = model.vCount;
  var ic = model.iCount;
  var rd = comp.renderData;
  if (!rd || vc < 1 || ic < 1) return;
  if (rd.vertexCount !== vc || rd.indexCount !== ic) {
    comp._vLength = vc * Float32Array.BYTES_PER_ELEMENT * floatStride;
    if (!rd.chunk || rd.chunk.vb.byteLength < comp._vLength || rd.chunk.indexCount < ic) {
      rd.resize(Math.ceil(vc * ADJUST_SIZE_RATE), Math.ceil(ic * ADJUST_SIZE_RATE));
    } else if (rd.chunk) {
      rd.updateSize(vc, ic);
    }
    comp._vBuffer = new Uint8Array(rd.chunk.vb.buffer, rd.chunk.vb.byteOffset, comp._vLength);
    comp._iLength = Uint16Array.BYTES_PER_ELEMENT * ic;
  }
  if (!rd.indices || rd.indices.length < ic) {
    rd.indices = new Uint16Array(ic);
    comp._iBuffer = new Uint8Array(rd.indices.buffer);
  }
  var vbuf = rd.chunk.vb;
  var vPtr = model.vPtr;
  var iPtr = model.iPtr;
  var ibuf = rd.indices;
  var HEAPU8 = spine$1.wasmUtil.wasm.HEAPU8;
  (_comp$_vBuffer = comp._vBuffer) == null ? void 0 : _comp$_vBuffer.set(HEAPU8.subarray(vPtr, vPtr + comp._vLength), 0);
  (_comp$_iBuffer = comp._iBuffer) == null ? void 0 : _comp$_iBuffer.set(HEAPU8.subarray(iPtr, iPtr + comp._iLength), 0);
  var chunkOffset = rd.chunk.vertexOffset;
  for (var i = 0; i < ic; i++) ibuf[i] += chunkOffset;
  var data = model.getData();
  var textures = model.getTextures();
  var count = data.size();
  var indexOffset = 0;
  var indexCount = 0;
  for (var _i = 0; _i < count; _i += 5) {
    indexCount = data.get(_i + 3);
    var material = _getSlotMaterial(data.get(_i + 4), comp);
    comp.requestDrawData(material, textures.get(_i / 5), indexOffset, indexCount);
    indexOffset += indexCount;
  }
  if (comp.enableBatch) {
    var worldMat = comp.node.worldMatrix;
    var index = 0;
    for (var _i2 = 0; _i2 < vc; _i2++) {
      index = _i2 * floatStride;
      tempVecPos.x = vbuf[index];
      tempVecPos.y = vbuf[index + 1];
      tempVecPos.z = 0;
      tempVecPos.transformMat4(worldMat);
      vbuf[index] = tempVecPos.x;
      vbuf[index + 1] = tempVecPos.y;
      vbuf[index + 2] = tempVecPos.z;
    }
  }
  var graphics = comp._debugRenderer;
  var locSkeleton = comp._skeleton;
  if (graphics && (comp.debugBones || comp.debugSlots || comp.debugMesh)) {
    graphics.clear();
    var debugShapes = comp.getDebugShapes();
    var shapeCount = debugShapes.size();
    for (var _i3 = 0; _i3 < shapeCount; _i3++) {
      var shape = debugShapes.get(_i3);
      if (shape.type === DEBUG_TYPE_REGION && comp.debugSlots) {
        graphics.strokeColor = _slotColor;
        var vertexFloatOffset = shape.vOffset * floatStride;
        var vertexFloatCount = shape.vCount * floatStride;
        graphics.moveTo(vbuf[vertexFloatOffset], vbuf[vertexFloatOffset + 1]);
        for (var ii = vertexFloatOffset + floatStride, nn = vertexFloatOffset + vertexFloatCount; ii < nn; ii += floatStride) {
          graphics.lineTo(vbuf[ii], vbuf[ii + 1]);
        }
        graphics.close();
        graphics.stroke();
      } else if (shape.type === DEBUG_TYPE_MESH && comp.debugMesh) {
        graphics.strokeColor = _meshColor;
        var iCount = shape.iCount;
        var iOffset = shape.iOffset;
        for (var _ii = iOffset, _nn = iOffset + iCount; _ii < _nn; _ii += 3) {
          var v1 = ibuf[_ii] * floatStride;
          var v2 = ibuf[_ii + 1] * floatStride;
          var v3 = ibuf[_ii + 2] * floatStride;
          graphics.moveTo(vbuf[v1], vbuf[v1 + 1]);
          graphics.lineTo(vbuf[v2], vbuf[v2 + 1]);
          graphics.lineTo(vbuf[v3], vbuf[v3 + 1]);
          graphics.close();
          graphics.stroke();
        }
      }
    }
    if (comp.debugBones) {
      graphics.strokeColor = _boneColor;
      graphics.fillColor = _slotColor;
      for (var _i4 = 0, n = locSkeleton.bones.length; _i4 < n; _i4++) {
        var bone = locSkeleton.bones[_i4];
        var x = bone.data.length * bone.a + bone.worldX;
        var y = bone.data.length * bone.c + bone.worldY;
        graphics.moveTo(bone.worldX, bone.worldY);
        graphics.lineTo(x, y);
        graphics.stroke();
        graphics.circle(bone.worldX, bone.worldY, Math.PI * 1.5);
        graphics.fill();
        if (_i4 === 0) {
          graphics.fillColor = _originColor;
        }
      }
    }
  }
}
function cacheTraverse(comp) {
  var model = comp.updateRenderData();
  if (!model) return;
  var vc = model.vCount;
  var ic = model.iCount;
  var rd = comp.renderData;
  if (!rd || vc < 1 || ic < 1) return;
  if (rd.vertexCount !== vc || rd.indexCount !== ic) {
    if (!rd.chunk || rd.chunk.vb.byteLength < vc * Float32Array.BYTES_PER_ELEMENT * _byteStrideTwoColor || rd.chunk.indexCount < ic) {
      rd.resize(Math.ceil(vc * ADJUST_SIZE_RATE), Math.ceil(ic * ADJUST_SIZE_RATE));
    } else if (rd.chunk) {
      rd.updateSize(vc, ic);
    }
  }
  if (!rd.indices || rd.indices.length < ic) {
    rd.indices = new Uint16Array(ic);
  }
  var vbuf = rd.chunk.vb;
  var vUint8Buf = new Uint8Array(vbuf.buffer, vbuf.byteOffset, Float32Array.BYTES_PER_ELEMENT * vbuf.length);
  vUint8Buf.set(model.vData);
  var nodeColor = comp.color;
  var opacity = comp.node._uiProps.opacity;
  if (1 - opacity > EPSILON || Color.toUint32(nodeColor) !== 0xffffffff || _premultipliedAlpha) {
    _nodeR = nodeColor.r / 255;
    _nodeG = nodeColor.g / 255;
    _nodeB = nodeColor.b / 255;
    _nodeA = opacity;
    for (var i = 0; i < vc; i++) {
      var index = i * _byteStrideTwoColor + 5 * Float32Array.BYTES_PER_ELEMENT;
      var R = vUint8Buf[index];
      var G = vUint8Buf[index + 1];
      var B = vUint8Buf[index + 2];
      var A = vUint8Buf[index + 3];
      var fA = A * _nodeA;
      var multiplier = _premultipliedAlpha ? fA / 255 : 1;
      vUint8Buf[index] = Math.floor(multiplier * R * _nodeR);
      vUint8Buf[index + 1] = Math.floor(multiplier * G * _nodeG);
      vUint8Buf[index + 2] = Math.floor(multiplier * B * _nodeB);
      vUint8Buf[index + 3] = Math.floor(fA);
      vUint8Buf[index + 4] = Math.floor(vUint8Buf[index + 4] * _nodeR);
      vUint8Buf[index + 5] = Math.floor(vUint8Buf[index + 5] * _nodeG);
      vUint8Buf[index + 6] = Math.floor(vUint8Buf[index + 6] * _nodeB);
      vUint8Buf[index + 7] = _premultipliedAlpha ? 255 : 0;
    }
  }
  var iUint16Buf = rd.indices;
  iUint16Buf.set(model.iData);
  var chunkOffset = rd.chunk.vertexOffset;
  for (var _i5 = 0; _i5 < ic; _i5++) {
    iUint16Buf[_i5] += chunkOffset;
  }
  var meshes = model.meshes;
  var count = meshes.length;
  var indexOffset = 0;
  var indexCount = 0;
  for (var _i6 = 0; _i6 < count; _i6++) {
    var mesh = meshes[_i6];
    var material = _getSlotMaterial(mesh.blendMode, comp);
    var textureID = mesh.textureID;
    indexCount = mesh.iCount;
    comp.requestDrawData(material, textureID, indexOffset, indexCount);
    indexOffset += indexCount;
  }
  var floatStride = _byteStrideTwoColor / Float32Array.BYTES_PER_ELEMENT;
  if (comp.enableBatch) {
    var worldMat = comp.node.worldMatrix;
    var _index = 0;
    for (var _i7 = 0; _i7 < vc; _i7++) {
      _index = _i7 * floatStride;
      tempVecPos.x = vbuf[_index];
      tempVecPos.y = vbuf[_index + 1];
      tempVecPos.z = 0;
      tempVecPos.transformMat4(worldMat);
      vbuf[_index] = tempVecPos.x;
      vbuf[_index + 1] = tempVecPos.y;
      vbuf[_index + 2] = tempVecPos.z;
    }
  }
}
legacyCC.internal.SpineAssembler = simple;

var simpleSpineAssembler = {
  getAssembler: function getAssembler() {
    return simple;
  }
};
Skeleton.Assembler = simpleSpineAssembler;

var ATTACHMENT_TYPE;
(function (ATTACHMENT_TYPE) {
  ATTACHMENT_TYPE[ATTACHMENT_TYPE["REGION"] = 0] = "REGION";
  ATTACHMENT_TYPE[ATTACHMENT_TYPE["BOUNDING_BOX"] = 1] = "BOUNDING_BOX";
  ATTACHMENT_TYPE[ATTACHMENT_TYPE["MESH"] = 2] = "MESH";
  ATTACHMENT_TYPE[ATTACHMENT_TYPE["SKINNED_MESH"] = 3] = "SKINNED_MESH";
})(ATTACHMENT_TYPE || (ATTACHMENT_TYPE = {}));
ccenum(ATTACHMENT_TYPE);
var AnimationEventType;
(function (AnimationEventType) {
  AnimationEventType[AnimationEventType["START"] = 0] = "START";
  AnimationEventType[AnimationEventType["INTERRUPT"] = 1] = "INTERRUPT";
  AnimationEventType[AnimationEventType["END"] = 2] = "END";
  AnimationEventType[AnimationEventType["COMPLETE"] = 3] = "COMPLETE";
  AnimationEventType[AnimationEventType["DISPOSE"] = 4] = "DISPOSE";
  AnimationEventType[AnimationEventType["EVENT"] = 5] = "EVENT";
})(AnimationEventType || (AnimationEventType = {}));
ccenum(AnimationEventType);
function loadWasmModuleSpine() {
  {
    return Promise.resolve();
  }
}

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get ATTACHMENT_TYPE () { return ATTACHMENT_TYPE; },
    AnimationCacheMode: AnimationCacheMode,
    get AnimationEventType () { return AnimationEventType; },
    DefaultAnimsEnum: DefaultAnimsEnum,
    get DefaultSkinsEnum () { return DefaultSkinsEnum; },
    SPINE_VERSION: SPINE_VERSION,
    Skeleton: Skeleton,
    SkeletonData: SkeletonData,
    get SpineAnimationCacheMode () { return SpineAnimationCacheMode; },
    get SpineDefaultAnimsEnum () { return SpineDefaultAnimsEnum; },
    get SpineMaterialType () { return SpineMaterialType; },
    SpineSocket: SpineSocket,
    VertexEffectDelegate: VertexEffectDelegate,
    isBinaryCompatible: isBinaryCompatible,
    isJsonCompatible: isJsonCompatible,
    loadWasmModuleSpine: loadWasmModuleSpine,
    simpleSpineAssembler: simpleSpineAssembler,
    spine: spine$1,
    timeScale: timeScale
});

export { loadWasmModuleSpine, index as sp };
//# sourceMappingURL=spine.js.map
