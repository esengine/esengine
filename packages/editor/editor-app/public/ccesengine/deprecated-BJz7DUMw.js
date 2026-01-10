import { a as _createClass, l as _createForOfIteratorHelperLoose, _ as _inheritsLoose, w as warnID, o as assertIsTrue, b as _applyDecoratedDescriptor, e as warn, j as CCString, m as setClassAlias } from './gc-object-CShF5lzx.js';
import { M as Mat4, Q as Quat, f as Vec3, J as AABB, c as ccclass, t as type, b as applyDecoratedInitializer, l as executionOrder, V as Vec2, s as serializable, L as override } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { S as Skeleton } from './skeleton-CBhmWmEt.js';
import { B as BatchingSchemes, P as PixelFormat, I as ImageAsset, i as Texture2D, j as TextureFilter, W as WrapMode, N as Node, b as Material } from './scene-vWcxM1_c.js';
import { a as MorphModel, M as MeshRenderer } from './mesh-renderer-CdPG3X-W.js';
import './device-manager-CBXP-ttm.js';
import { ae as SamplerInfo, a4 as Filter, af as Address, F as Format, _ as FormatFeatureBit, x as FormatInfos, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, A as Attribute, a as AttributeName, J as BufferTextureCopy, W as Type } from './buffer-barrier-BlQXg9Aa.js';
import { m as UBOSkinningAnimation, n as UBOSkinning, o as UNIFORM_REALTIME_JOINT_TEXTURE_BINDING, p as UBOSkinningTexture, q as UNIFORM_JOINT_TEXTURE_BINDING, I as INST_JOINT_ANIM_INFO } from './pipeline-state-manager-C5U4ouGL.js';
import { d as ModelType } from './deprecated-n0w4kK7g.js';
import { T as TextureBufferPool } from './deprecated-CN-RjLP6.js';
import { r as readBuffer, w as writeBuffer, m as mapBuffer } from './debug-view-BuNhRPv_.js';
import './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import './node-event-Ccvtv8bJ.js';
import { M as Mesh } from './mesh-XWfHgs1t.js';

var BAKE_SKELETON_CURVE_SYMBOL = Symbol('BakeNodeCurves');

var SkelAnimDataHub = function () {
  function SkelAnimDataHub() {}
  SkelAnimDataHub.getOrExtract = function getOrExtract(clip) {
    var data = SkelAnimDataHub.pool.get(clip);
    if (!data || data.samples !== clip.sample) {
      if (data) {
        cclegacy.director.root.dataPoolManager.releaseAnimationClip(clip);
      }
      var frames = Math.ceil(clip.sample * clip.duration) + 1;
      var step = clip.sample;
      data = clip[BAKE_SKELETON_CURVE_SYMBOL](0, step, frames);
      SkelAnimDataHub.pool.set(clip, data);
    }
    return data;
  };
  SkelAnimDataHub.destroy = function destroy(clip) {
    SkelAnimDataHub.pool["delete"](clip);
  };
  return SkelAnimDataHub;
}();
SkelAnimDataHub.pool = new Map();

var m4_1$2 = new Mat4();
function getPathFromRoot(target, root) {
  var node = target;
  var path = '';
  while (node !== null && node !== root) {
    path = node.name + "/" + path;
    node = node.parent;
  }
  return path.slice(0, -1);
}
function getWorldTransformUntilRoot(target, root, outMatrix) {
  Mat4.identity(outMatrix);
  while (target !== root) {
    Mat4.fromRTS(m4_1$2, target.rotation, target.position, target.scale);
    Mat4.multiply(outMatrix, m4_1$2, outMatrix);
    target = target.parent;
  }
  return outMatrix;
}

var jointTextureSamplerInfo = new SamplerInfo(Filter.POINT, Filter.POINT, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP);

var uploadJointData = uploadJointDataLBS;
var MINIMUM_JOINT_TEXTURE_SIZE = 480;
function selectJointsMediumFormat(device) {
  if (device.getFormatFeatures(Format.RGBA32F) & FormatFeatureBit.SAMPLED_TEXTURE) {
    return Format.RGBA32F;
  }
  return Format.RGBA8;
}
function uploadJointDataLBS(out, base, mat, firstBone) {
  out[base + 0] = mat.m00;
  out[base + 1] = mat.m01;
  out[base + 2] = mat.m02;
  out[base + 3] = mat.m12;
  out[base + 4] = mat.m04;
  out[base + 5] = mat.m05;
  out[base + 6] = mat.m06;
  out[base + 7] = mat.m13;
  out[base + 8] = mat.m08;
  out[base + 9] = mat.m09;
  out[base + 10] = mat.m10;
  out[base + 11] = mat.m14;
}
new Quat();
new Quat();
new Vec3();
new Quat();
new Vec3();
function roundUpTextureSize(targetLength, formatSize) {
  var formatScale = 4 / Math.sqrt(formatSize);
  return Math.ceil(Math.max(MINIMUM_JOINT_TEXTURE_SIZE * formatScale, targetLength) / 12) * 12;
}
var v3_3 = new Vec3();
var v3_4 = new Vec3();
var v3_min$1 = new Vec3();
var v3_max$1 = new Vec3();
var m4_1$1 = new Mat4();
var m4_2 = new Mat4();
var ab_1$1 = new AABB();
var Inf = Number.MAX_SAFE_INTEGER;
var JointTexturePool = function () {
  function JointTexturePool(device) {
    this._device = void 0;
    this._pool = void 0;
    this._textureBuffers = new Map();
    this._formatSize = void 0;
    this._pixelsPerJoint = void 0;
    this._customPool = void 0;
    this._chunkIdxMap = new Map();
    this._device = device;
    var format = selectJointsMediumFormat(this._device);
    this._formatSize = FormatInfos[format].size;
    this._pixelsPerJoint = 48 / this._formatSize;
    this._pool = new TextureBufferPool(device);
    this._pool.initialize({
      format: format,
      roundUpFn: roundUpTextureSize
    });
    this._customPool = new TextureBufferPool(device);
    this._customPool.initialize({
      format: format,
      roundUpFn: roundUpTextureSize
    });
  }
  var _proto = JointTexturePool.prototype;
  _proto.clear = function clear() {
    this._pool.destroy();
    this._textureBuffers.clear();
  };
  _proto.registerCustomTextureLayouts = function registerCustomTextureLayouts(layouts) {
    for (var i = 0; i < layouts.length; i++) {
      var layout = layouts[i];
      var textureLength = layout.textureLength;
      if (!(this._device.getFormatFeatures(Format.RGBA32F) & FormatFeatureBit.SAMPLED_TEXTURE)) {
        textureLength *= 2;
      }
      var chunkIdx = this._customPool.createChunk(textureLength);
      for (var j = 0; j < layout.contents.length; j++) {
        var content = layout.contents[j];
        var skeleton = content.skeleton;
        this._chunkIdxMap.set(skeleton, chunkIdx);
        for (var k = 0; k < content.clips.length; k++) {
          var clip = content.clips[k];
          this._chunkIdxMap.set(skeleton ^ clip, chunkIdx);
        }
      }
    }
  };
  _proto.getDefaultPoseTexture = function getDefaultPoseTexture(skeleton, mesh, skinningRoot) {
    var hash = skeleton.hash ^ 0;
    var texture = this._textureBuffers.get(hash) || null;
    if (texture && texture.bounds.has(mesh.hash)) {
      texture.refCount++;
      return texture;
    }
    var joints = skeleton.joints,
      bindposes = skeleton.bindposes;
    var textureBuffer = null;
    var buildTexture = false;
    var jointCount = joints.length;
    if (!texture) {
      var bufSize = jointCount * 12;
      var customChunkIdx = this._chunkIdxMap.get(hash);
      var handle = customChunkIdx !== undefined ? this._customPool.alloc(bufSize * Float32Array.BYTES_PER_ELEMENT, customChunkIdx) : this._pool.alloc(bufSize * Float32Array.BYTES_PER_ELEMENT);
      if (!handle) {
        return texture;
      }
      texture = {
        pixelOffset: handle.start / this._formatSize,
        refCount: 1,
        bounds: new Map(),
        skeletonHash: skeleton.hash,
        clipHash: 0,
        readyToBeDeleted: false,
        handle: handle
      };
      textureBuffer = new Float32Array(bufSize);
      buildTexture = true;
    } else {
      texture.refCount++;
    }
    Vec3.set(v3_min$1, Inf, Inf, Inf);
    Vec3.set(v3_max$1, -Inf, -Inf, -Inf);
    var boneSpaceBounds = mesh.getBoneSpaceBounds(skeleton);
    for (var j = 0, offset = 0; j < jointCount; j++, offset += 12) {
      var node = skinningRoot.getChildByPath(joints[j]);
      var mat = node ? getWorldTransformUntilRoot(node, skinningRoot, m4_1$1) : skeleton.inverseBindposes[j];
      var bound = boneSpaceBounds[j];
      if (bound) {
        AABB.transform(ab_1$1, bound, mat);
        ab_1$1.getBoundary(v3_3, v3_4);
        Vec3.min(v3_min$1, v3_min$1, v3_3);
        Vec3.max(v3_max$1, v3_max$1, v3_4);
      }
      if (buildTexture) {
        if (node) {
          Mat4.multiply(mat, mat, bindposes[j]);
        }
        uploadJointData(textureBuffer, offset, node ? mat : Mat4.IDENTITY);
      }
    }
    var bounds = [new AABB()];
    texture.bounds.set(mesh.hash, bounds);
    AABB.fromPoints(bounds[0], v3_min$1, v3_max$1);
    if (buildTexture) {
      this._pool.update(texture.handle, textureBuffer.buffer);
      this._textureBuffers.set(hash, texture);
    }
    return texture;
  };
  _proto.getSequencePoseTexture = function getSequencePoseTexture(skeleton, clip, mesh, skinningRoot) {
    var hash = skeleton.hash ^ clip.hash;
    var texture = this._textureBuffers.get(hash) || null;
    if (texture && texture.bounds.has(mesh.hash)) {
      texture.refCount++;
      return texture;
    }
    var joints = skeleton.joints,
      bindposes = skeleton.bindposes;
    var clipData = SkelAnimDataHub.getOrExtract(clip);
    var frames = clipData.frames;
    var textureBuffer = null;
    var buildTexture = false;
    var jointCount = joints.length;
    if (!texture) {
      var bufSize = jointCount * 12 * frames;
      var customChunkIdx = this._chunkIdxMap.get(hash);
      var handle = customChunkIdx !== undefined ? this._customPool.alloc(bufSize * Float32Array.BYTES_PER_ELEMENT, customChunkIdx) : this._pool.alloc(bufSize * Float32Array.BYTES_PER_ELEMENT);
      if (!handle) {
        return null;
      }
      var animInfos = this._createAnimInfos(skeleton, clip, skinningRoot);
      texture = {
        pixelOffset: handle.start / this._formatSize,
        refCount: 1,
        bounds: new Map(),
        skeletonHash: skeleton.hash,
        clipHash: clip.hash,
        readyToBeDeleted: false,
        handle: handle,
        animInfos: animInfos
      };
      textureBuffer = new Float32Array(bufSize);
      buildTexture = true;
    } else {
      texture.refCount++;
    }
    var boneSpaceBounds = mesh.getBoneSpaceBounds(skeleton);
    var bounds = [];
    texture.bounds.set(mesh.hash, bounds);
    for (var f = 0; f < frames; f++) {
      bounds.push(new AABB(Inf, Inf, Inf, -Inf, -Inf, -Inf));
    }
    for (var _f = 0, offset = 0; _f < frames; _f++) {
      var bound = bounds[_f];
      for (var j = 0; j < jointCount; j++, offset += 12) {
        var _j = texture.animInfos[j],
          curveData = _j.curveData,
          downstream = _j.downstream,
          bindposeIdx = _j.bindposeIdx,
          bindposeCorrection = _j.bindposeCorrection;
        var mat = void 0;
        var transformValid = true;
        if (curveData && downstream) {
          mat = Mat4.multiply(m4_1$1, curveData[_f], downstream);
        } else if (curveData) {
          mat = curveData[_f];
        } else if (downstream) {
          mat = downstream;
        } else {
          mat = skeleton.inverseBindposes[bindposeIdx];
          transformValid = false;
        }
        var boneSpaceBound = boneSpaceBounds[j];
        if (boneSpaceBound) {
          var transform = bindposeCorrection ? Mat4.multiply(m4_2, mat, bindposeCorrection) : mat;
          AABB.transform(ab_1$1, boneSpaceBound, transform);
          ab_1$1.getBoundary(v3_3, v3_4);
          Vec3.min(bound.center, bound.center, v3_3);
          Vec3.max(bound.halfExtents, bound.halfExtents, v3_4);
        }
        if (buildTexture) {
          if (transformValid) {
            Mat4.multiply(m4_1$1, mat, bindposes[bindposeIdx]);
          }
          uploadJointData(textureBuffer, offset, transformValid ? m4_1$1 : Mat4.IDENTITY);
        }
      }
      AABB.fromPoints(bound, bound.center, bound.halfExtents);
    }
    if (buildTexture) {
      this._pool.update(texture.handle, textureBuffer.buffer);
      this._textureBuffers.set(hash, texture);
    }
    return texture;
  };
  _proto.releaseHandle = function releaseHandle(handle) {
    if (handle.refCount > 0) {
      handle.refCount--;
    }
    if (!handle.refCount && handle.readyToBeDeleted) {
      var hash = handle.skeletonHash ^ handle.clipHash;
      var customChunkIdx = this._chunkIdxMap.get(hash);
      (customChunkIdx !== undefined ? this._customPool : this._pool).free(handle.handle);
      if (this._textureBuffers.get(hash) === handle) {
        this._textureBuffers["delete"](hash);
      }
    }
  };
  _proto.releaseSkeleton = function releaseSkeleton(skeleton) {
    var it = this._textureBuffers.values();
    var res = it.next();
    while (!res.done) {
      var handle = res.value;
      if (handle.skeletonHash === skeleton.hash) {
        handle.readyToBeDeleted = true;
        if (handle.refCount) {
          this._textureBuffers["delete"](handle.skeletonHash ^ handle.clipHash);
        } else {
          this.releaseHandle(handle);
        }
      }
      res = it.next();
    }
  };
  _proto.releaseAnimationClip = function releaseAnimationClip(clip) {
    var it = this._textureBuffers.values();
    var res = it.next();
    while (!res.done) {
      var handle = res.value;
      if (handle.clipHash === clip.hash) {
        handle.readyToBeDeleted = true;
        if (handle.refCount) {
          this._textureBuffers["delete"](handle.skeletonHash ^ handle.clipHash);
        } else {
          this.releaseHandle(handle);
        }
      }
      res = it.next();
    }
  };
  _proto._createAnimInfos = function _createAnimInfos(skeleton, clip, skinningRoot) {
    var animInfos = [];
    var joints = skeleton.joints,
      bindposes = skeleton.bindposes;
    var jointCount = joints.length;
    var clipData = SkelAnimDataHub.getOrExtract(clip);
    for (var j = 0; j < jointCount; j++) {
      var animPath = joints[j];
      var source = clipData.joints[animPath];
      var animNode = skinningRoot.getChildByPath(animPath);
      var downstream = void 0;
      var correctionPath = void 0;
      while (!source) {
        var idx = animPath.lastIndexOf('/');
        animPath = animPath.substring(0, idx);
        source = clipData.joints[animPath];
        if (animNode) {
          if (!downstream) {
            downstream = new Mat4();
          }
          Mat4.fromRTS(m4_1$1, animNode.rotation, animNode.position, animNode.scale);
          Mat4.multiply(downstream, m4_1$1, downstream);
          animNode = animNode.parent;
        } else {
          correctionPath = animPath;
        }
        if (idx < 0) {
          break;
        }
      }
      var bindposeIdx = j;
      var bindposeCorrection = void 0;
      if (correctionPath !== undefined && source) {
        bindposeIdx = j - 1;
        for (var t = 0; t < jointCount; t++) {
          if (joints[t] === correctionPath) {
            bindposeIdx = t;
            bindposeCorrection = new Mat4();
            Mat4.multiply(bindposeCorrection, bindposes[t], skeleton.inverseBindposes[j]);
            break;
          }
        }
      }
      animInfos.push({
        curveData: source && source.transforms,
        downstream: downstream,
        bindposeIdx: bindposeIdx,
        bindposeCorrection: bindposeCorrection
      });
    }
    return animInfos;
  };
  return _createClass(JointTexturePool, [{
    key: "pixelsPerJoint",
    get: function get() {
      return this._pixelsPerJoint;
    }
  }]);
}();
var JointAnimationInfo = function () {
  function JointAnimationInfo(device) {
    this._pool = new Map();
    this._device = void 0;
    this._device = device;
  }
  var _proto2 = JointAnimationInfo.prototype;
  _proto2.getData = function getData(nodeID) {
    if (nodeID === void 0) {
      nodeID = '-1';
    }
    var res = this._pool.get(nodeID);
    if (res) {
      return res;
    }
    var buffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOSkinningAnimation.SIZE, UBOSkinningAnimation.SIZE));
    var data = new Float32Array([0, 0, 0, 0]);
    buffer.update(data);
    var info = {
      buffer: buffer,
      data: data,
      dirty: false,
      dirtyForJSB: new Uint8Array([0]),
      currentClip: null
    };
    this._pool.set(nodeID, info);
    return info;
  };
  _proto2.destroy = function destroy(nodeID) {
    var info = this._pool.get(nodeID);
    if (!info) {
      return;
    }
    info.buffer.destroy();
    this._pool["delete"](nodeID);
  };
  _proto2.switchClip = function switchClip(info, clip) {
    info.currentClip = clip;
    info.data[0] = 0;
    info.buffer.update(info.data);
    info.dirty = false;
    return info;
  };
  _proto2.clear = function clear() {
    for (var _iterator = _createForOfIteratorHelperLoose(this._pool.values()), _step; !(_step = _iterator()).done;) {
      var info = _step.value;
      info.buffer.destroy();
    }
    this._pool.clear();
  };
  return JointAnimationInfo;
}();

var stack = [];
var pool = new Map();
function getWorldMatrix(transform, stamp) {
  var i = 0;
  var res = Mat4.IDENTITY;
  while (transform) {
    if (transform.stamp === stamp || transform.stamp + 1 === stamp && !transform.node.hasChangedFlags) {
      res = transform.world;
      transform.stamp = stamp;
      break;
    }
    transform.stamp = stamp;
    stack[i++] = transform;
    transform = transform.parent;
  }
  while (i > 0) {
    transform = stack[--i];
    stack[i] = null;
    var node = transform.node;
    Mat4.fromRTS(transform.local, node.rotation, node.position, node.scale);
    res = Mat4.multiply(transform.world, res, transform.local);
  }
  return res;
}
function getTransform(node, root) {
  var joint = null;
  var i = 0;
  while (node !== root) {
    var id = node.uuid;
    if (pool.has(id)) {
      joint = pool.get(id);
      break;
    } else {
      joint = {
        node: node,
        local: new Mat4(),
        world: new Mat4(),
        stamp: -1,
        parent: null
      };
      pool.set(id, joint);
    }
    stack[i++] = joint;
    node = node.parent;
    joint = null;
  }
  var child;
  while (i > 0) {
    child = stack[--i];
    stack[i] = null;
    child.parent = joint;
    joint = child;
  }
  return joint;
}
function deleteTransform(node) {
  var transform = pool.get(node.uuid) || null;
  while (transform) {
    pool["delete"](transform.node.uuid);
    transform = transform.parent;
  }
}

var uniformPatches = [{
  name: 'CC_USE_SKINNING',
  value: true
}, {
  name: 'CC_USE_REAL_TIME_JOINT_TEXTURE',
  value: false
}];
var texturePatches = [{
  name: 'CC_USE_SKINNING',
  value: true
}, {
  name: 'CC_USE_REAL_TIME_JOINT_TEXTURE',
  value: true
}];
function getRelevantBuffers(outIndices, outBuffers, jointMaps, targetJoint) {
  for (var i = 0; i < jointMaps.length; i++) {
    var idxMap = jointMaps[i];
    var index = -1;
    for (var j = 0; j < idxMap.length; j++) {
      if (idxMap[j] === targetJoint) {
        index = j;
        break;
      }
    }
    if (index >= 0) {
      outBuffers.push(i);
      outIndices.push(index);
    }
  }
}
var v3_min = new Vec3();
var v3_max = new Vec3();
var v3_1$1 = new Vec3();
var v3_2 = new Vec3();
var m4_1 = new Mat4();
var ab_1 = new AABB();
var RealTimeJointTexture = function RealTimeJointTexture() {
  this._format = PixelFormat.RGBA32F;
  this._textures = [];
  this._buffers = [];
};
RealTimeJointTexture.WIDTH = 256;
RealTimeJointTexture.HEIGHT = 3;
var SkinningModel = function (_MorphModel) {
  function SkinningModel() {
    var _this;
    _this = _MorphModel.call(this) || this;
    _this._buffers = [];
    _this._dataArray = [];
    _this._joints = [];
    _this._bufferIndices = null;
    _this._realTimeJointTexture = new RealTimeJointTexture();
    _this._realTimeTextureMode = false;
    _this.type = ModelType.SKINNING;
    return _this;
  }
  _inheritsLoose(SkinningModel, _MorphModel);
  var _proto = SkinningModel.prototype;
  _proto.destroy = function destroy() {
    this.bindSkeleton();
    if (this._buffers.length) {
      for (var i = 0; i < this._buffers.length; i++) {
        this._buffers[i].destroy();
      }
      this._buffers.length = 0;
    }
    this._dataArray.length = 0;
    this._realTimeJointTexture._textures.forEach(function (tex) {
      tex.destroy();
    });
    this._realTimeJointTexture._textures.length = 0;
    this._realTimeJointTexture._buffers.length = 0;
    _MorphModel.prototype.destroy.call(this);
  };
  _proto.uploadAnimation = function uploadAnimation() {};
  _proto.bindSkeleton = function bindSkeleton(skeleton, skinningRoot, mesh) {
    if (skeleton === void 0) {
      skeleton = null;
    }
    if (skinningRoot === void 0) {
      skinningRoot = null;
    }
    if (mesh === void 0) {
      mesh = null;
    }
    for (var i = 0; i < this._joints.length; i++) {
      deleteTransform(this._joints[i].target);
    }
    this._bufferIndices = null;
    this._joints.length = 0;
    if (!skeleton || !skinningRoot || !mesh) {
      return;
    }
    this._realTimeTextureMode = false;
    if (UBOSkinning.JOINT_UNIFORM_CAPACITY < skeleton.joints.length) {
      this._realTimeTextureMode = true;
    }
    this.transform = skinningRoot;
    var boneSpaceBounds = mesh.getBoneSpaceBounds(skeleton);
    var jointMaps = mesh.struct.jointMaps;
    this._ensureEnoughBuffers(jointMaps && jointMaps.length || 1);
    this._bufferIndices = mesh.jointBufferIndices;
    this._initRealTimeJointTexture();
    for (var index = 0; index < skeleton.joints.length; index++) {
      var bound = boneSpaceBounds[index];
      var target = skinningRoot.getChildByPath(skeleton.joints[index]);
      if (!bound || !target) {
        continue;
      }
      var transform = getTransform(target, skinningRoot);
      var bindpose = skeleton.bindposes[index];
      var indices = [];
      var buffers = [];
      if (!jointMaps) {
        indices.push(index);
        buffers.push(0);
      } else {
        getRelevantBuffers(indices, buffers, jointMaps, index);
      }
      this._joints.push({
        indices: indices,
        buffers: buffers,
        bound: bound,
        target: target,
        bindpose: bindpose,
        transform: transform
      });
    }
  };
  _proto.updateTransform = function updateTransform(stamp) {
    var root = this.transform;
    if (root.hasChangedFlags || root.isTransformDirty()) {
      root.updateWorldTransform();
      this._localDataUpdated = true;
    }
    Vec3.set(v3_min, Infinity, Infinity, Infinity);
    Vec3.set(v3_max, -Infinity, -Infinity, -Infinity);
    for (var i = 0; i < this._joints.length; i++) {
      var _this$_joints$i = this._joints[i],
        bound = _this$_joints$i.bound,
        transform = _this$_joints$i.transform;
      var worldMatrix = getWorldMatrix(transform, stamp);
      AABB.transform(ab_1, bound, worldMatrix);
      ab_1.getBoundary(v3_1$1, v3_2);
      Vec3.min(v3_min, v3_min, v3_1$1);
      Vec3.max(v3_max, v3_max, v3_2);
    }
    var worldBounds = this._worldBounds;
    if (this._modelBounds && worldBounds) {
      AABB.fromPoints(this._modelBounds, v3_min, v3_max);
      this._modelBounds.transform(root._mat, root._pos, root._rot, root._scale, this._worldBounds);
    }
  };
  _proto.updateUBOs = function updateUBOs(stamp) {
    _MorphModel.prototype.updateUBOs.call(this, stamp);
    for (var i = 0; i < this._joints.length; i++) {
      var _this$_joints$i2 = this._joints[i],
        indices = _this$_joints$i2.indices,
        buffers = _this$_joints$i2.buffers,
        transform = _this$_joints$i2.transform,
        bindpose = _this$_joints$i2.bindpose;
      Mat4.multiply(m4_1, transform.world, bindpose);
      for (var b = 0; b < buffers.length; b++) {
        uploadJointData(this._dataArray[buffers[b]], indices[b] * 12, m4_1);
      }
    }
    if (this._realTimeTextureMode) {
      this._updateRealTimeJointTextureBuffer();
    } else {
      for (var _b = 0; _b < this._buffers.length; _b++) {
        this._buffers[_b].update(this._dataArray[_b]);
      }
    }
    return true;
  };
  _proto.initSubModel = function initSubModel(idx, subMeshData, mat) {
    var original = subMeshData.vertexBuffers;
    var iaInfo = subMeshData.iaInfo;
    iaInfo.vertexBuffers = subMeshData.jointMappedBuffers;
    _MorphModel.prototype.initSubModel.call(this, idx, subMeshData, mat);
    iaInfo.vertexBuffers = original;
  };
  _proto.getMacroPatches = function getMacroPatches(subModelIndex) {
    var superMacroPatches = _MorphModel.prototype.getMacroPatches.call(this, subModelIndex);
    var myPatches = uniformPatches;
    if (this._realTimeTextureMode) {
      myPatches = texturePatches;
    }
    if (superMacroPatches) {
      return myPatches.concat(superMacroPatches);
    }
    return myPatches;
  };
  _proto._updateLocalDescriptors = function _updateLocalDescriptors(submodelIdx, descriptorSet) {
    _MorphModel.prototype._updateLocalDescriptors.call(this, submodelIdx, descriptorSet);
    var idx = this._bufferIndices[submodelIdx];
    if (this._realTimeTextureMode) {
      this._bindRealTimeJointTexture(idx, descriptorSet);
    } else {
      var buffer = this._buffers[idx];
      if (buffer) {
        descriptorSet.bindBuffer(UBOSkinning.BINDING, buffer);
      }
    }
  };
  _proto._updateInstancedAttributes = function _updateInstancedAttributes(attributes, subModel) {
    var pass = subModel.passes[0];
    if (pass.batchingScheme !== BatchingSchemes.NONE) {
      warnID(3936, this.node.getPathInHierarchy());
    }
    _MorphModel.prototype._updateInstancedAttributes.call(this, attributes, subModel);
  };
  _proto._ensureEnoughBuffers = function _ensureEnoughBuffers(count) {
    if (this._buffers.length) {
      for (var i = 0; i < this._buffers.length; i++) {
        this._buffers[i].destroy();
      }
      this._buffers.length = 0;
    }
    if (this._dataArray.length) this._dataArray.length = 0;
    if (!this._realTimeTextureMode) {
      for (var _i = 0; _i < count; _i++) {
        this._buffers[_i] = this._device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOSkinning.SIZE, UBOSkinning.SIZE));
        var maxJoints = UBOSkinning.JOINT_UNIFORM_CAPACITY;
        this._dataArray[_i] = new Float32Array(12 * maxJoints);
      }
    } else {
      for (var _i2 = 0; _i2 < count; _i2++) {
        var _maxJoints = RealTimeJointTexture.WIDTH;
        this._dataArray[_i2] = new Float32Array(12 * _maxJoints);
      }
    }
  };
  _proto._initRealTimeJointTexture = function _initRealTimeJointTexture() {
    if (this._realTimeJointTexture._textures.length) {
      this._realTimeJointTexture._textures.forEach(function (tex) {
        tex.destroy();
      });
      this._realTimeJointTexture._textures.length = 0;
    }
    this._realTimeJointTexture._buffers.length = 0;
    if (!this._realTimeTextureMode) return;
    var gfxDevice = director.root.device;
    var width = RealTimeJointTexture.WIDTH;
    var height = RealTimeJointTexture.HEIGHT;
    var hasFeatureFloatTexture = gfxDevice.getFormatFeatures(Format.RGBA32F) & FormatFeatureBit.SAMPLED_TEXTURE;
    if (hasFeatureFloatTexture === 0) {
      this._realTimeJointTexture._format = PixelFormat.RGBA8888;
      width = 4 * RealTimeJointTexture.WIDTH;
    }
    var textures = this._realTimeJointTexture._textures;
    var buffers = this._realTimeJointTexture._buffers;
    var pixelFormat = this._realTimeJointTexture._format;
    for (var i = 0; i < this._dataArray.length; i++) {
      buffers[i] = new Float32Array(4 * RealTimeJointTexture.HEIGHT * RealTimeJointTexture.WIDTH);
      var arrayBuffer = buffers[i];
      var updateView = pixelFormat === PixelFormat.RGBA32F ? arrayBuffer : new Uint8Array(arrayBuffer.buffer);
      var image = new ImageAsset({
        width: width,
        height: height,
        _data: updateView,
        _compressed: false,
        format: pixelFormat
      });
      var texture = new Texture2D();
      texture.setFilters(TextureFilter.NEAREST, TextureFilter.NEAREST);
      texture.setMipFilter(TextureFilter.NONE);
      texture.setWrapMode(WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE);
      texture.image = image;
      textures[i] = texture;
    }
  };
  _proto._bindRealTimeJointTexture = function _bindRealTimeJointTexture(idx, descriptorSet) {
    if (!this._realTimeTextureMode) return;
    var jointTexture = this._realTimeJointTexture._textures[idx];
    if (jointTexture) {
      var gfxTexture = jointTexture.getGFXTexture();
      var sampler = jointTexture.getGFXSampler();
      descriptorSet.bindTexture(UNIFORM_REALTIME_JOINT_TEXTURE_BINDING, gfxTexture);
      descriptorSet.bindSampler(UNIFORM_REALTIME_JOINT_TEXTURE_BINDING, sampler);
    }
  };
  _proto._updateRealTimeJointTextureBuffer = function _updateRealTimeJointTextureBuffer() {
    if (!this._realTimeTextureMode) return;
    var textures = this._realTimeJointTexture._textures;
    var buffers = this._realTimeJointTexture._buffers;
    for (var idx = 0; idx < textures.length; idx++) {
      var arrayBuffer = buffers[idx];
      var src = this._dataArray[idx];
      var count = src.length / 12;
      var idxSrc = 0;
      var idxDst = 0;
      for (var i = 0; i < count; i++) {
        idxDst = 4 * i;
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
        idxDst = 4 * (i + RealTimeJointTexture.WIDTH);
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
        idxDst = 4 * (i + 2 * RealTimeJointTexture.WIDTH);
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
        arrayBuffer[idxDst++] = src[idxSrc++];
      }
      var pixelFormat = this._realTimeJointTexture._format;
      var updateView = pixelFormat === PixelFormat.RGBA32F ? arrayBuffer : new Uint8Array(arrayBuffer.buffer);
      textures[idx].uploadData(updateView);
    }
  };
  return SkinningModel;
}(MorphModel);

var myPatches = [{
  name: 'CC_USE_SKINNING',
  value: true
}, {
  name: 'CC_USE_BAKED_ANIMATION',
  value: true
}];
var BakedSkinningModel = function (_MorphModel) {
  function BakedSkinningModel() {
    var _this;
    _this = _MorphModel.call(this) || this;
    _this.uploadedAnim = undefined;
    _this._jointsMedium = void 0;
    _this._skeleton = null;
    _this._mesh = null;
    _this._dataPoolManager = void 0;
    _this._instAnimInfoIdx = -1;
    _this.type = ModelType.BAKED_SKINNING;
    _this._dataPoolManager = cclegacy.director.root.dataPoolManager;
    var jointTextureInfo = new Float32Array(4);
    var animInfo = _this._dataPoolManager.jointAnimationInfo.getData();
    _this._jointsMedium = {
      buffer: null,
      jointTextureInfo: jointTextureInfo,
      animInfo: animInfo,
      texture: null,
      boundsInfo: null
    };
    return _this;
  }
  _inheritsLoose(BakedSkinningModel, _MorphModel);
  var _proto = BakedSkinningModel.prototype;
  _proto.destroy = function destroy() {
    this.uploadedAnim = undefined;
    this._jointsMedium.boundsInfo = null;
    if (this._jointsMedium.buffer) {
      this._jointsMedium.buffer.destroy();
      this._jointsMedium.buffer = null;
    }
    this._applyJointTexture();
    _MorphModel.prototype.destroy.call(this);
  };
  _proto.bindSkeleton = function bindSkeleton(skeleton, skinningRoot, mesh) {
    if (skeleton === void 0) {
      skeleton = null;
    }
    if (skinningRoot === void 0) {
      skinningRoot = null;
    }
    if (mesh === void 0) {
      mesh = null;
    }
    this._skeleton = skeleton;
    this._mesh = mesh;
    if (!skeleton || !skinningRoot || !mesh) {
      return;
    }
    this.transform = skinningRoot;
    var resMgr = this._dataPoolManager;
    this._jointsMedium.animInfo = resMgr.jointAnimationInfo.getData(skinningRoot.uuid);
    if (!this._jointsMedium.buffer) {
      this._jointsMedium.buffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, UBOSkinningTexture.SIZE, UBOSkinningTexture.SIZE));
    }
  };
  _proto.updateTransform = function updateTransform(stamp) {
    _MorphModel.prototype.updateTransform.call(this, stamp);
    if (!this.uploadedAnim) {
      return;
    }
    var _this$_jointsMedium = this._jointsMedium,
      animInfo = _this$_jointsMedium.animInfo,
      boundsInfo = _this$_jointsMedium.boundsInfo;
    var skelBound = boundsInfo[animInfo.data[0]];
    var worldBounds = this._worldBounds;
    if (worldBounds && skelBound) {
      var node = this.transform;
      skelBound.transform(node._mat, node._pos, node._rot, node._scale, worldBounds);
    }
  };
  _proto.updateUBOs = function updateUBOs(stamp) {
    _MorphModel.prototype.updateUBOs.call(this, stamp);
    var info = this._jointsMedium.animInfo;
    var hasNonInstancingPass = false;
    var idx = this._instAnimInfoIdx;
    for (var i = 0; i < this._subModels.length; i++) {
      var subModel = this._subModels[i];
      if (idx >= 0) {
        var view = subModel.instancedAttributeBlock.views[idx];
        view[0] = info.data[0];
      } else {
        hasNonInstancingPass = true;
      }
    }
    if (hasNonInstancingPass && info.dirty) {
      info.buffer.update(info.data);
      info.dirty = false;
    }
    return true;
  };
  _proto.getMacroPatches = function getMacroPatches(subModelIndex) {
    var patches = _MorphModel.prototype.getMacroPatches.call(this, subModelIndex);
    return patches ? patches.concat(myPatches) : myPatches;
  };
  _proto.uploadAnimation = function uploadAnimation(anim) {
    if (!this._skeleton || !this._mesh || this.uploadedAnim === anim) {
      return;
    }
    this.uploadedAnim = anim;
    var resMgr = this._dataPoolManager;
    var texture = null;
    if (anim) {
      texture = resMgr.jointTexturePool.getSequencePoseTexture(this._skeleton, anim, this._mesh, this.transform);
      this._jointsMedium.boundsInfo = texture && texture.bounds.get(this._mesh.hash);
      this._modelBounds = null;
    } else {
      texture = resMgr.jointTexturePool.getDefaultPoseTexture(this._skeleton, this._mesh, this.transform);
      this._jointsMedium.boundsInfo = null;
      this._modelBounds = texture && texture.bounds.get(this._mesh.hash)[0];
    }
    this._applyJointTexture(texture);
  };
  _proto._applyJointTexture = function _applyJointTexture(texture) {
    if (texture === void 0) {
      texture = null;
    }
    var oldTex = this._jointsMedium.texture;
    if (oldTex && oldTex !== texture) {
      this._dataPoolManager.jointTexturePool.releaseHandle(oldTex);
    }
    this._jointsMedium.texture = texture;
    if (!texture) {
      return;
    }
    var _this$_jointsMedium2 = this._jointsMedium,
      buffer = _this$_jointsMedium2.buffer,
      jointTextureInfo = _this$_jointsMedium2.jointTextureInfo;
    jointTextureInfo[0] = texture.handle.texture.width;
    jointTextureInfo[1] = this._skeleton.joints.length;
    jointTextureInfo[2] = texture.pixelOffset + 0.1;
    jointTextureInfo[3] = 1 / jointTextureInfo[0];
    this.updateInstancedJointTextureInfo();
    if (buffer) {
      buffer.update(jointTextureInfo);
    }
    var tex = texture.handle.texture;
    for (var i = 0; i < this._subModels.length; ++i) {
      var descriptorSet = this._subModels[i].descriptorSet;
      descriptorSet.bindTexture(UNIFORM_JOINT_TEXTURE_BINDING, tex);
    }
  };
  _proto._updateLocalDescriptors = function _updateLocalDescriptors(submodelIdx, descriptorSet) {
    _MorphModel.prototype._updateLocalDescriptors.call(this, submodelIdx, descriptorSet);
    var _this$_jointsMedium3 = this._jointsMedium,
      buffer = _this$_jointsMedium3.buffer,
      texture = _this$_jointsMedium3.texture,
      animInfo = _this$_jointsMedium3.animInfo;
    descriptorSet.bindBuffer(UBOSkinningTexture.BINDING, buffer);
    descriptorSet.bindBuffer(UBOSkinningAnimation.BINDING, animInfo.buffer);
    if (texture) {
      var sampler = this._device.getSampler(jointTextureSamplerInfo);
      descriptorSet.bindTexture(UNIFORM_JOINT_TEXTURE_BINDING, texture.handle.texture);
      descriptorSet.bindSampler(UNIFORM_JOINT_TEXTURE_BINDING, sampler);
    }
  };
  _proto._updateInstancedAttributes = function _updateInstancedAttributes(attributes, subModel) {
    _MorphModel.prototype._updateInstancedAttributes.call(this, attributes, subModel);
    this._instAnimInfoIdx = subModel.getInstancedAttributeIndex(INST_JOINT_ANIM_INFO);
    this.updateInstancedJointTextureInfo();
  };
  _proto.updateInstancedJointTextureInfo = function updateInstancedJointTextureInfo() {
    var _this$_jointsMedium4 = this._jointsMedium,
      jointTextureInfo = _this$_jointsMedium4.jointTextureInfo,
      animInfo = _this$_jointsMedium4.animInfo;
    var idx = this._instAnimInfoIdx;
    for (var i = 0; i < this._subModels.length; i++) {
      var subModel = this._subModels[i];
      var views = subModel.instancedAttributeBlock.views;
      if (idx >= 0 && views.length > 0) {
        var view = views[idx];
        view[0] = animInfo.data[0];
        view[1] = jointTextureInfo[1];
        view[2] = jointTextureInfo[2];
      }
    }
  };
  return BakedSkinningModel;
}(MorphModel);

var _dec$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _class$1, _class2$1, _initializer$1, _initializer2$1;
var SkinnedMeshRenderer = (_dec$1 = ccclass('cc.SkinnedMeshRenderer'), _dec2$1 = executionOrder(100), _dec3$1 = type(Skeleton), _dec4$1 = type(Node), _dec5$1 = type(Skeleton), _dec6$1 = type(Node), _dec$1(_class$1 = _dec2$1(_class$1 = (_class2$1 = function (_MeshRenderer) {
  function SkinnedMeshRenderer() {
    var _this;
    _this = _MeshRenderer.call(this) || this;
    _this._skeleton = _initializer$1 && _initializer$1();
    _this._skinningRoot = _initializer2$1 && _initializer2$1();
    _this._clip = null;
    _this.associatedAnimation = null;
    _this._modelType = BakedSkinningModel;
    return _this;
  }
  _inheritsLoose(SkinnedMeshRenderer, _MeshRenderer);
  var _proto = SkinnedMeshRenderer.prototype;
  _proto.onLoad = function onLoad() {
    _MeshRenderer.prototype.onLoad.call(this);
    this._tryBindAnimation();
  };
  _proto.onDestroy = function onDestroy() {
    if (this.associatedAnimation) {
      this.associatedAnimation.notifySkinnedMeshRemoved(this);
      assertIsTrue(this.associatedAnimation === null);
    }
    _MeshRenderer.prototype.onDestroy.call(this);
  };
  _proto.uploadAnimation = function uploadAnimation(clip) {
    this._clip = clip;
    if (this.model && this.model.uploadAnimation) {
      this.model.uploadAnimation(clip);
    }
  };
  _proto.setUseBakedAnimation = function setUseBakedAnimation(val, force) {
    if (val === void 0) {
      val = true;
    }
    if (force === void 0) {
      force = false;
    }
    var modelType = val ? BakedSkinningModel : SkinningModel;
    if (!force && this._modelType === modelType) {
      return;
    }
    this._modelType = modelType;
    if (this._model) {
      cclegacy.director.root.destroyModel(this._model);
      this._model = null;
      this._models.length = 0;
      this._updateModels();
      this._updateCastShadow();
      this._updateReceiveShadow();
      this._updateUseLightProbe();
      if (this.enabledInHierarchy) {
        this._attachToScene();
      }
    }
  };
  _proto.setSharedMaterial = function setSharedMaterial(material, index) {
    _MeshRenderer.prototype.setSharedMaterial.call(this, material, index);
    if (this._modelType === SkinningModel) {
      this.getMaterialInstance(index);
    }
  };
  _proto._updateModelParams = function _updateModelParams() {
    this._update();
    _MeshRenderer.prototype._updateModelParams.call(this);
  };
  _proto._tryBindAnimation = function _tryBindAnimation() {
    var skinningRoot = this._skinningRoot;
    if (!skinningRoot) {
      return;
    }
    var skinningRootIsParent = false;
    for (var current = this.node; current; current = current.parent) {
      if (current === skinningRoot) {
        skinningRootIsParent = true;
        break;
      }
    }
    if (!skinningRootIsParent) {
      return;
    }
    var animation = skinningRoot.getComponent('cc.SkeletalAnimation');
    if (animation && animation.enabledInHierarchy) {
      animation.notifySkinnedMeshAdded(this);
    } else {
      this.setUseBakedAnimation(false);
    }
  };
  _proto._update = function _update() {
    if (this.model) {
      this.model.bindSkeleton(this._skeleton, this._skinningRoot, this._mesh);
      if (this.model.uploadAnimation) {
        this.model.uploadAnimation(this._clip);
      }
    }
  };
  return _createClass(SkinnedMeshRenderer, [{
    key: "skeleton",
    get: function get() {
      return this._skeleton;
    },
    set: function set(val) {
      if (val === this._skeleton) {
        return;
      }
      this._skeleton = val;
      this._update();
    }
  }, {
    key: "skinningRoot",
    get: function get() {
      return this._skinningRoot;
    },
    set: function set(value) {
      if (value === this._skinningRoot) {
        return;
      }
      this._skinningRoot = value;
      this._tryBindAnimation();
      this._update();
    }
  }, {
    key: "model",
    get: function get() {
      return this._model;
    }
  }]);
}(MeshRenderer), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_skeleton", [_dec3$1], function () {
  return null;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_skinningRoot", [_dec4$1], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$1.prototype, "skeleton", [_dec5$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "skeleton"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "skinningRoot", [_dec6$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "skinningRoot"), _class2$1.prototype), _class2$1)) || _class$1) || _class$1);

var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _dec6, _dec7, _dec8, _dec9, _class3, _class4, _initializer7, _initializer8, _initializer9;
var repeat = function repeat(n) {
  return n - Math.floor(n);
};
var batch_id = new Attribute(AttributeName.ATTR_BATCH_ID, Format.R32F);
var batch_uv = new Attribute(AttributeName.ATTR_BATCH_UV, Format.RG32F);
var batch_extras_size = FormatInfos[batch_id.format].size + FormatInfos[batch_uv.format].size;
var SkinnedMeshUnit = (_dec = ccclass('cc.SkinnedMeshUnit'), _dec2 = type(Mesh), _dec3 = type(Skeleton), _dec4 = type(Material), _dec5 = type(SkinnedMeshRenderer), _dec(_class = (_class2 = function () {
  function SkinnedMeshUnit() {
    this.mesh = _initializer && _initializer();
    this.skeleton = _initializer2 && _initializer2();
    this.material = _initializer3 && _initializer3();
    this._localTransform = _initializer4 && _initializer4();
    this._offset = _initializer5 && _initializer5();
    this._size = _initializer6 && _initializer6();
  }
  return _createClass(SkinnedMeshUnit, [{
    key: "offset",
    get: function get() {
      return this._offset;
    },
    set: function set(offset) {
      Vec2.copy(this._offset, offset);
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(size) {
      Vec2.copy(this._size, size);
    }
  }, {
    key: "copyFrom",
    get: function get() {
      return null;
    },
    set: function set(comp) {
      if (!comp) {
        return;
      }
      this.mesh = comp.mesh;
      this.skeleton = comp.skeleton;
      this.material = comp.getSharedMaterial(0);
      if (comp.skinningRoot) {
        getWorldTransformUntilRoot(comp.node, comp.skinningRoot, this._localTransform);
      }
    }
  }]);
}(), _initializer = applyDecoratedInitializer(_class2.prototype, "mesh", [_dec2], function () {
  return null;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "skeleton", [_dec3], function () {
  return null;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "material", [_dec4], function () {
  return null;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_localTransform", [serializable], function () {
  return new Mat4();
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_offset", [serializable], function () {
  return new Vec2(0, 0);
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_size", [serializable], function () {
  return new Vec2(1, 1);
}), _applyDecoratedDescriptor(_class2.prototype, "copyFrom", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "copyFrom"), _class2.prototype), _class2)) || _class);
var m4_local = new Mat4();
new Mat4();
var v3_1 = new Vec3();
var SkinnedMeshBatchRenderer = (_dec6 = ccclass('cc.SkinnedMeshBatchRenderer'), _dec7 = executionOrder(100), _dec8 = type([CCString]), _dec9 = type([SkinnedMeshUnit]), _dec6(_class3 = _dec7(_class3 = (_class4 = function (_SkinnedMeshRenderer) {
  function SkinnedMeshBatchRenderer() {
    var _this;
    _this = _SkinnedMeshRenderer.call(this) || this;
    _this.atlasSize = _initializer7 && _initializer7();
    _this.batchableTextureNames = _initializer8 && _initializer8();
    _this.units = _initializer9 && _initializer9();
    _this._textures = {};
    _this._batchMaterial = null;
    return _this;
  }
  _inheritsLoose(SkinnedMeshBatchRenderer, _SkinnedMeshRenderer);
  var _proto = SkinnedMeshBatchRenderer.prototype;
  _proto.onLoad = function onLoad() {
    _SkinnedMeshRenderer.prototype.onLoad.call(this);
    this.cook();
  };
  _proto.onDestroy = function onDestroy() {
    for (var tex in this._textures) {
      this._textures[tex].destroy();
    }
    this._textures = {};
    if (this._mesh) {
      this._mesh.destroy();
      this._mesh = null;
    }
    _SkinnedMeshRenderer.prototype.onDestroy.call(this);
  };
  _proto._onMaterialModified = function _onMaterialModified(idx, material) {
    this.cookMaterials();
    _SkinnedMeshRenderer.prototype._onMaterialModified.call(this, idx, this.getMaterialInstance(idx));
  };
  _proto.cook = function cook() {
    this.cookMaterials();
    this.cookSkeletons();
    this.cookMeshes();
  };
  _proto.cookMaterials = function cookMaterials() {
    var _this2 = this;
    if (!this._batchMaterial) {
      this._batchMaterial = this.getSharedMaterial(0);
    }
    var mat = this.getMaterialInstance(0);
    if (!mat || !this._batchMaterial || !this._batchMaterial.effectAsset) {
      warn('incomplete batch material!');
      return;
    }
    mat.copy(this._batchMaterial);
    this.resizeAtlases();
    var tech = mat.effectAsset.techniques[mat.technique];
    var _loop = function _loop(i) {
      var pass = tech.passes[i];
      if (!pass.properties) {
        return 1;
      }
      var _loop2 = function _loop2(prop) {
        if (pass.properties[prop].type >= Type.SAMPLER1D) {
          var tex = null;
          if (_this2.batchableTextureNames.find(function (n) {
            return n === prop;
          })) {
            tex = _this2._textures[prop];
            if (!tex) {
              tex = _this2.createTexture(prop);
            }
            _this2.cookTextures(tex, prop, i);
          } else {
            _this2.units.some(function (u) {
              return tex = u.material && u.material.getProperty(prop, i);
            });
          }
          if (tex) {
            mat.setProperty(prop, tex, i);
          }
        } else {
          var value = [];
          for (var u = 0; u < _this2.units.length; u++) {
            var unit = _this2.units[u];
            if (!unit.material) {
              continue;
            }
            value.push(unit.material.getProperty(prop.slice(0, -3), i));
          }
          mat.setProperty(prop, value, i);
        }
      };
      for (var prop in pass.properties) {
        _loop2(prop);
      }
    };
    for (var i = 0; i < tech.passes.length; i++) {
      if (_loop(i)) continue;
    }
  };
  _proto.cookSkeletons = function cookSkeletons() {
    if (!this._skinningRoot) {
      warn('no skinning root specified!');
      return;
    }
    var joints = [];
    var bindposes = [];
    for (var u = 0; u < this.units.length; u++) {
      var unit = this.units[u];
      if (!unit || !unit.skeleton) {
        continue;
      }
      var partial = unit.skeleton;
      Mat4.invert(m4_local, unit._localTransform);
      var _loop3 = function _loop3() {
        var path = partial.joints[i];
        var idx = joints.findIndex(function (p) {
          return p === path;
        });
        if (idx >= 0) {
          return 1;
        }
        joints.push(path);
        bindposes.push(Mat4.multiply(new Mat4(), partial.bindposes[i] || Mat4.IDENTITY, m4_local));
      };
      for (var i = 0; i < partial.joints.length; i++) {
        if (_loop3()) continue;
      }
    }
    var idxMap = Array.from(Array(joints.length).keys()).sort(function (a, b) {
      if (joints[a] > joints[b]) {
        return 1;
      }
      if (joints[a] < joints[b]) {
        return -1;
      }
      return 0;
    });
    var skeleton = new Skeleton();
    skeleton.joints = joints.map(function (_, idx, arr) {
      return arr[idxMap[idx]];
    });
    skeleton.bindposes = bindposes.map(function (_, idx, arr) {
      return arr[idxMap[idx]];
    });
    if (this._skeleton) {
      this._skeleton.destroy();
    }
    this.skeleton = skeleton;
  };
  _proto.cookMeshes = function cookMeshes() {
    var _this4 = this;
    var isValid = false;
    for (var u = 0; u < this.units.length; u++) {
      var unit = this.units[u];
      if (unit.mesh) {
        isValid = true;
        break;
      }
    }
    if (!isValid || !this._skinningRoot) {
      return;
    }
    if (this._mesh) {
      this._mesh.destroyRenderingMesh();
    } else {
      this._mesh = new Mesh();
    }
    var posOffset = 0;
    var posFormat = Format.UNKNOWN;
    var normalOffset = 0;
    var normalFormat = Format.UNKNOWN;
    var tangentOffset = 0;
    var tangentFormat = Format.UNKNOWN;
    var uvOffset = 0;
    var uvFormat = Format.UNKNOWN;
    var jointOffset = 0;
    var jointFormat = Format.UNKNOWN;
    var jointIndexMap = new Array(this.units.length);
    var unitLen = this.units.length;
    for (var i = 0; i < unitLen; i++) {
      var _unit = this.units[i];
      if (!_unit || !_unit.skeleton) {
        continue;
      }
      jointIndexMap[i] = _unit.skeleton.joints.map(function (j) {
        return _this4._skeleton.joints.findIndex(function (ref) {
          return j === ref;
        });
      });
    }
    var _loop4 = function _loop4() {
      var unit = _this4.units[_i];
      if (!unit || !unit.mesh || !unit.mesh.data) {
        return 1;
      }
      var newMesh = _this4._createUnitMesh(_i, unit.mesh);
      var dataView = new DataView(newMesh.data.buffer);
      Mat4.invert(m4_local, unit._localTransform);
      Mat4.transpose(m4_local, m4_local);
      var offset = unit.offset;
      var size = unit.size;
      var _loop5 = function _loop5() {
        var bundle = newMesh.struct.vertexBundles[b];
        posOffset = bundle.view.offset;
        posFormat = Format.UNKNOWN;
        for (var a = 0; a < bundle.attributes.length; a++) {
          var attr = bundle.attributes[a];
          if (attr.name === AttributeName.ATTR_POSITION) {
            posFormat = attr.format;
            break;
          }
          posOffset += FormatInfos[attr.format].size;
        }
        if (posFormat) {
          var pos = readBuffer(dataView, posFormat, posOffset, bundle.view.length, bundle.view.stride);
          for (var j = 0; j < pos.length; j += 3) {
            Vec3.fromArray(v3_1, pos, j);
            Vec3.transformMat4(v3_1, v3_1, unit._localTransform);
            Vec3.toArray(pos, v3_1, j);
          }
          writeBuffer(dataView, pos, posFormat, posOffset, bundle.view.stride);
        }
        normalOffset = bundle.view.offset;
        normalFormat = Format.UNKNOWN;
        for (var _a = 0; _a < bundle.attributes.length; _a++) {
          var _attr = bundle.attributes[_a];
          if (_attr.name === AttributeName.ATTR_NORMAL) {
            normalFormat = _attr.format;
            break;
          }
          normalOffset += FormatInfos[_attr.format].size;
        }
        if (normalFormat) {
          var normal = readBuffer(dataView, normalFormat, normalOffset, bundle.view.length, bundle.view.stride);
          for (var _j = 0; _j < normal.length; _j += 3) {
            Vec3.fromArray(v3_1, normal, _j);
            Vec3.transformMat4Normal(v3_1, v3_1, m4_local);
            Vec3.toArray(normal, v3_1, _j);
          }
          writeBuffer(dataView, normal, normalFormat, normalOffset, bundle.view.stride);
        }
        tangentOffset = bundle.view.offset;
        tangentFormat = Format.UNKNOWN;
        for (var _a2 = 0; _a2 < bundle.attributes.length; _a2++) {
          var _attr2 = bundle.attributes[_a2];
          if (_attr2.name === AttributeName.ATTR_TANGENT) {
            tangentFormat = _attr2.format;
            break;
          }
          tangentOffset += FormatInfos[_attr2.format].size;
        }
        if (tangentFormat) {
          var tangent = readBuffer(dataView, tangentFormat, tangentOffset, bundle.view.length, bundle.view.stride);
          for (var _j2 = 0; _j2 < tangent.length; _j2 += 3) {
            Vec3.fromArray(v3_1, tangent, _j2);
            Vec3.transformMat4Normal(v3_1, v3_1, m4_local);
            Vec3.toArray(tangent, v3_1, _j2);
          }
          writeBuffer(dataView, tangent, tangentFormat, tangentOffset, bundle.view.stride);
        }
        uvOffset = bundle.view.offset;
        uvFormat = Format.UNKNOWN;
        for (var _a3 = 0; _a3 < bundle.attributes.length; _a3++) {
          var _attr3 = bundle.attributes[_a3];
          if (_attr3.name === AttributeName.ATTR_BATCH_UV) {
            uvFormat = _attr3.format;
            break;
          }
          uvOffset += FormatInfos[_attr3.format].size;
        }
        if (uvFormat) {
          mapBuffer(dataView, function (cur, idx) {
            cur = repeat(cur);
            var comp = idx === 0 ? 'x' : 'y';
            return cur * size[comp] + offset[comp];
          }, uvFormat, uvOffset, bundle.view.length, bundle.view.stride, dataView);
        }
        var idxMap = jointIndexMap[_i];
        if (!idxMap) {
          return 1;
        }
        jointOffset = bundle.view.offset;
        jointFormat = Format.UNKNOWN;
        for (var _a4 = 0; _a4 < bundle.attributes.length; _a4++) {
          var _attr4 = bundle.attributes[_a4];
          if (_attr4.name === AttributeName.ATTR_JOINTS) {
            jointFormat = _attr4.format;
            break;
          }
          jointOffset += FormatInfos[_attr4.format].size;
        }
        if (jointFormat) {
          mapBuffer(dataView, function (cur) {
            return idxMap[cur];
          }, jointFormat, jointOffset, bundle.view.length, bundle.view.stride, dataView);
        }
      };
      for (var b = 0; b < newMesh.struct.vertexBundles.length; b++) {
        if (_loop5()) continue;
      }
      _this4._mesh.merge(newMesh);
    };
    for (var _i = 0; _i < unitLen; _i++) {
      if (_loop4()) continue;
    }
    this._onMeshChanged(this._mesh);
    this._updateModels();
  };
  _proto.cookTextures = function cookTextures(target, prop, passIdx) {
    var texImages = [];
    var texImageRegions = [];
    var texBuffers = [];
    var texBufferRegions = [];
    for (var u = 0; u < this.units.length; u++) {
      var unit = this.units[u];
      if (!unit.material) {
        continue;
      }
      var partial = unit.material.getProperty(prop, passIdx);
      if (partial && partial.image && partial.image.data) {
        var region = new BufferTextureCopy();
        region.texOffset.x = unit.offset.x * this.atlasSize;
        region.texOffset.y = unit.offset.y * this.atlasSize;
        region.texExtent.width = unit.size.x * this.atlasSize;
        region.texExtent.height = unit.size.y * this.atlasSize;
        var data = partial.image.data;
        if (!ArrayBuffer.isView(data)) {
          texImages.push(data);
          texImageRegions.push(region);
        } else {
          texBuffers.push(data);
          texBufferRegions.push(region);
        }
      }
    }
    var gfxTex = target.getGFXTexture();
    var _ref = cclegacy.director.root,
      device = _ref.device;
    if (texBuffers.length > 0) {
      device.copyBuffersToTexture(texBuffers, gfxTex, texBufferRegions);
    }
    if (texImages.length > 0) {
      device.copyTexImagesToTexture(texImages, gfxTex, texImageRegions);
    }
  };
  _proto.createTexture = function createTexture(prop) {
    var tex = new Texture2D();
    tex.setFilters(TextureFilter.LINEAR, TextureFilter.LINEAR);
    tex.setMipFilter(TextureFilter.NEAREST);
    tex.reset({
      width: this.atlasSize,
      height: this.atlasSize,
      format: PixelFormat.RGBA8888
    });
    this._textures[prop] = tex;
    return tex;
  };
  _proto.resizeAtlases = function resizeAtlases() {
    for (var prop in this._textures) {
      var tex = this._textures[prop];
      tex.reset({
        width: this.atlasSize,
        height: this.atlasSize,
        format: PixelFormat.RGBA8888
      });
    }
  };
  _proto._createUnitMesh = function _createUnitMesh(unitIdx, mesh) {
    var newMeshStruct = JSON.parse(JSON.stringify(mesh.struct));
    var modifiedBundles = {};
    for (var p = 0; p < mesh.struct.primitives.length; p++) {
      var primitive = mesh.struct.primitives[p];
      var uvOffset = 0;
      var uvFormat = Format.UNKNOWN;
      var bundleIdx = 0;
      for (; bundleIdx < primitive.vertexBundelIndices.length; bundleIdx++) {
        var bundle = mesh.struct.vertexBundles[primitive.vertexBundelIndices[bundleIdx]];
        uvOffset = bundle.view.offset;
        uvFormat = Format.UNKNOWN;
        for (var a = 0; a < bundle.attributes.length; a++) {
          var attr = bundle.attributes[a];
          if (attr.name === AttributeName.ATTR_TEX_COORD) {
            uvFormat = attr.format;
            break;
          }
          uvOffset += FormatInfos[attr.format].size;
        }
        if (uvFormat) {
          break;
        }
      }
      if (modifiedBundles[bundleIdx] !== undefined) {
        continue;
      }
      modifiedBundles[bundleIdx] = [uvFormat, uvOffset];
      var newBundle = newMeshStruct.vertexBundles[bundleIdx];
      newBundle.attributes.push(batch_id);
      newBundle.attributes.push(batch_uv);
      newBundle.view.offset = 0;
      newBundle.view.length += newBundle.view.count * batch_extras_size;
      newBundle.view.stride += batch_extras_size;
    }
    var totalLength = 0;
    for (var b = 0; b < newMeshStruct.vertexBundles.length; b++) {
      totalLength += newMeshStruct.vertexBundles[b].view.length;
    }
    for (var _p = 0; _p < newMeshStruct.primitives.length; _p++) {
      var pm = newMeshStruct.primitives[_p];
      if (pm.indexView) {
        pm.indexView.offset = totalLength;
        totalLength += pm.indexView.length;
      }
    }
    var newMeshData = new Uint8Array(totalLength);
    var oldMeshData = mesh.data;
    var newDataView = new DataView(newMeshData.buffer);
    var oldDataView = new DataView(oldMeshData.buffer);
    var isLittleEndian = cclegacy.sys.isLittleEndian;
    for (var _b in modifiedBundles) {
      var _newBundle = newMeshStruct.vertexBundles[_b];
      var oldBundle = mesh.struct.vertexBundles[_b];
      var _modifiedBundles$_b = modifiedBundles[_b],
        _uvFormat = _modifiedBundles$_b[0],
        _uvOffset = _modifiedBundles$_b[1];
      var uvs = readBuffer(oldDataView, _uvFormat, _uvOffset, oldBundle.view.length, oldBundle.view.stride);
      var oldView = oldBundle.view;
      var newView = _newBundle.view;
      var oldStride = oldView.stride;
      var newStride = newView.stride;
      var oldOffset = oldView.offset;
      var newOffset = newView.offset;
      for (var j = 0; j < newView.count; j++) {
        var srcVertex = oldMeshData.subarray(oldOffset, oldOffset + oldStride);
        newMeshData.set(srcVertex, newOffset);
        newDataView.setFloat32(newOffset + oldStride, unitIdx);
        newDataView.setFloat32(newOffset + oldStride + 4, uvs[j * 2], isLittleEndian);
        newDataView.setFloat32(newOffset + oldStride + 8, uvs[j * 2 + 1], isLittleEndian);
        newOffset += newStride;
        oldOffset += oldStride;
      }
    }
    for (var k = 0; k < newMeshStruct.primitives.length; k++) {
      var oldPrimitive = mesh.struct.primitives[k];
      var newPrimitive = newMeshStruct.primitives[k];
      if (oldPrimitive.indexView && newPrimitive.indexView) {
        var _oldStride = oldPrimitive.indexView.stride;
        var _newStride = newPrimitive.indexView.stride;
        var _oldOffset = oldPrimitive.indexView.offset;
        var _newOffset = newPrimitive.indexView.offset;
        for (var _j3 = 0; _j3 < newPrimitive.indexView.count; _j3++) {
          var srcIndices = oldMeshData.subarray(_oldOffset, _oldOffset + _oldStride);
          newMeshData.set(srcIndices, _newOffset);
          _newOffset += _newStride;
          _oldOffset += _oldStride;
        }
      }
    }
    var newMesh = new Mesh();
    newMesh.reset({
      struct: newMeshStruct,
      data: newMeshData
    });
    return newMesh;
  };
  return _createClass(SkinnedMeshBatchRenderer, [{
    key: "mesh",
    get: function get() {
      return _SkinnedMeshRenderer.prototype.mesh;
    },
    set: function set(val) {
      this.mesh = val;
    }
  }, {
    key: "skeleton",
    get: function get() {
      return _SkinnedMeshRenderer.prototype.skeleton;
    },
    set: function set(val) {
      this.skeleton = val;
    }
  }]);
}(SkinnedMeshRenderer), _initializer7 = applyDecoratedInitializer(_class4.prototype, "atlasSize", [serializable], function () {
  return 1024;
}), _initializer8 = applyDecoratedInitializer(_class4.prototype, "batchableTextureNames", [_dec8, serializable], function () {
  return [];
}), _initializer9 = applyDecoratedInitializer(_class4.prototype, "units", [_dec9, serializable], function () {
  return [];
}), _applyDecoratedDescriptor(_class4.prototype, "mesh", [override], Object.getOwnPropertyDescriptor(_class4.prototype, "mesh"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "skeleton", [override], Object.getOwnPropertyDescriptor(_class4.prototype, "skeleton"), _class4.prototype), _class4)) || _class3) || _class3);

cclegacy.SkinningModelComponent = SkinnedMeshRenderer;
setClassAlias(SkinnedMeshRenderer, 'cc.SkinningModelComponent');
cclegacy.SkinningModelUnit = SkinnedMeshUnit;
setClassAlias(SkinnedMeshUnit, 'cc.SkinningModelUnit');
cclegacy.BatchedSkinningModelComponent = SkinnedMeshBatchRenderer;
setClassAlias(SkinnedMeshBatchRenderer, 'cc.BatchedSkinningModelComponent');

export { BAKE_SKELETON_CURVE_SYMBOL as B, JointTexturePool as J, SkelAnimDataHub as S, JointAnimationInfo as a, SkinnedMeshRenderer as b, getWorldMatrix as c, deleteTransform as d, getTransform as e, getPathFromRoot as f, getWorldTransformUntilRoot as g, SkinnedMeshBatchRenderer as h, SkinnedMeshUnit as i };
//# sourceMappingURL=deprecated-BJz7DUMw.js.map
