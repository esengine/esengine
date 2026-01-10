import './device-manager-CBXP-ttm.js';
import { x as FormatInfos, a3 as getTypedArrayConstructor, z as TextureInfo, E as TextureType, H as TextureUsageBit, F as Format, J as BufferTextureCopy } from './buffer-barrier-BlQXg9Aa.js';
import { j as removeProperty, i as replaceProperty } from './index-uXI1_UMk.js';
import { D as debug } from './gc-object-CShF5lzx.js';
import { a as RenderScene, M as Model, S as SpotLight, b as SubModel } from './deprecated-n0w4kK7g.js';
import { L as Layers } from './pipeline-state-manager-C5U4ouGL.js';
import { l as legacyCC } from './global-exports-DnCP_14L.js';
import { h as Pass, S as Shadows } from './scene-vWcxM1_c.js';
import { f as Camera } from './debug-view-BuNhRPv_.js';

var RenderQueue;
(function (RenderQueue) {
  RenderQueue[RenderQueue["OPAQUE"] = 0] = "OPAQUE";
  RenderQueue[RenderQueue["TRANSPARENT"] = 1] = "TRANSPARENT";
  RenderQueue[RenderQueue["OVERLAY"] = 2] = "OVERLAY";
})(RenderQueue || (RenderQueue = {}));
var PassStage;
(function (PassStage) {
  PassStage[PassStage["DEFAULT"] = 1] = "DEFAULT";
  PassStage[PassStage["FORWARD"] = 2] = "FORWARD";
  PassStage[PassStage["SHADOWCAST"] = 4] = "SHADOWCAST";
})(PassStage || (PassStage = {}));

function nearestPOT(num) {
  --num;
  num |= num >> 16;
  num |= num >> 8;
  num |= num >> 4;
  num |= num >> 2;
  num |= num >> 1;
  ++num;
  return num;
}
function roundUp(n, alignment) {
  return Math.ceil(n / alignment) * alignment;
}
var TextureBufferPool = function () {
  function TextureBufferPool(device) {
    this._format = Format.UNKNOWN;
    this._formatSize = 0;
    this._chunks = [];
    this._chunkCount = 0;
    this._handles = [];
    this._region0 = new BufferTextureCopy();
    this._region1 = new BufferTextureCopy();
    this._region2 = new BufferTextureCopy();
    this._roundUpFn = null;
    this._bufferViewCtor = Uint8Array;
    this._channels = 4;
    this._alignment = 1;
    this._device = device;
  }
  var _proto = TextureBufferPool.prototype;
  _proto.initialize = function initialize(info) {
    var formatInfo = FormatInfos[info.format];
    this._format = info.format;
    this._formatSize = formatInfo.size;
    this._channels = formatInfo.count;
    this._bufferViewCtor = getTypedArrayConstructor(formatInfo);
    this._roundUpFn = info.roundUpFn || null;
    this._alignment = info.alignment || 1;
    if (info.inOrderFree) {
      this.alloc = this._McDonaldAlloc;
    }
  };
  _proto.destroy = function destroy() {
    for (var i = 0; i < this._chunkCount; ++i) {
      var chunk = this._chunks[i];
      chunk.texture.destroy();
    }
    this._chunks.length = 0;
    this._handles.length = 0;
  };
  _proto.alloc = function alloc(size, chunkIdx) {
    size = roundUp(size, this._alignment);
    var index = -1;
    var start = -1;
    if (chunkIdx !== undefined) {
      index = chunkIdx;
      start = this._findAvailableSpace(size, index);
    }
    if (start < 0) {
      for (var i = 0; i < this._chunkCount; ++i) {
        index = i;
        start = this._findAvailableSpace(size, index);
        if (start >= 0) {
          break;
        }
      }
    }
    if (start >= 0) {
      var chunk = this._chunks[index];
      chunk.start += size;
      var handle = {
        chunkIdx: index,
        start: start,
        end: start + size,
        texture: chunk.texture
      };
      this._handles.push(handle);
      return handle;
    }
    var targetSize = Math.sqrt(size / this._formatSize);
    var texLength = this._roundUpFn && this._roundUpFn(targetSize, this._formatSize) || Math.max(1024, nearestPOT(targetSize));
    var newChunk = this._chunks[this.createChunk(texLength)];
    newChunk.start += size;
    var texHandle = {
      chunkIdx: this._chunkCount - 1,
      start: 0,
      end: size,
      texture: newChunk.texture
    };
    this._handles.push(texHandle);
    return texHandle;
  };
  _proto.free = function free(handle) {
    for (var i = 0; i < this._handles.length; ++i) {
      if (this._handles[i] === handle) {
        this._chunks[handle.chunkIdx].end = handle.end;
        this._handles.splice(i, 1);
        return;
      }
    }
  };
  _proto.createChunk = function createChunk(length) {
    var texSize = length * length * this._formatSize;
    debug("TextureBufferPool: Allocate chunk " + this._chunkCount + ", size: " + texSize + ", format: " + this._format);
    var texture = this._device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, this._format, length, length));
    var chunk = {
      texture: texture,
      size: texSize,
      start: 0,
      end: texSize
    };
    this._chunks[this._chunkCount] = chunk;
    return this._chunkCount++;
  };
  _proto.update = function update(handle, buffer) {
    var buffers = [];
    var regions = [];
    var start = handle.start / this._formatSize;
    var remainSize = buffer.byteLength / this._formatSize;
    var offsetX = start % handle.texture.width;
    var offsetY = Math.floor(start / handle.texture.width);
    var copySize = Math.min(handle.texture.width - offsetX, remainSize);
    var begin = 0;
    if (offsetX > 0) {
      this._region0.texOffset.x = offsetX;
      this._region0.texOffset.y = offsetY;
      this._region0.texExtent.width = copySize;
      this._region0.texExtent.height = 1;
      buffers.push(new this._bufferViewCtor(buffer, begin * this._formatSize, copySize * this._channels));
      regions.push(this._region0);
      offsetX = 0;
      offsetY += 1;
      remainSize -= copySize;
      begin += copySize;
    }
    if (remainSize > 0) {
      this._region1.texOffset.x = offsetX;
      this._region1.texOffset.y = offsetY;
      if (remainSize > handle.texture.width) {
        this._region1.texExtent.width = handle.texture.width;
        this._region1.texExtent.height = Math.floor(remainSize / handle.texture.width);
        copySize = this._region1.texExtent.width * this._region1.texExtent.height;
      } else {
        copySize = remainSize;
        this._region1.texExtent.width = copySize;
        this._region1.texExtent.height = 1;
      }
      buffers.push(new this._bufferViewCtor(buffer, begin * this._formatSize, copySize * this._channels));
      regions.push(this._region1);
      offsetX = 0;
      offsetY += this._region1.texExtent.height;
      remainSize -= copySize;
      begin += copySize;
    }
    if (remainSize > 0) {
      this._region2.texOffset.x = offsetX;
      this._region2.texOffset.y = offsetY;
      this._region2.texExtent.width = remainSize;
      this._region2.texExtent.height = 1;
      buffers.push(new this._bufferViewCtor(buffer, begin * this._formatSize, remainSize * this._channels));
      regions.push(this._region2);
    }
    this._device.copyBuffersToTexture(buffers, handle.texture, regions);
  };
  _proto._findAvailableSpace = function _findAvailableSpace(size, chunkIdx) {
    var chunk = this._chunks[chunkIdx];
    var isFound = false;
    var start = chunk.start;
    if (start + size <= chunk.size) {
      isFound = true;
    } else {
      start = 0;
      var handles = this._handles.filter(function (h) {
        return h.chunkIdx === chunkIdx;
      }).sort(function (a, b) {
        return a.start - b.start;
      });
      for (var i = 0; i < handles.length; i++) {
        var handle = handles[i];
        if (start + size <= handle.start) {
          isFound = true;
          break;
        }
        start = handle.end;
      }
      if (!isFound && start + size <= chunk.size) {
        isFound = true;
      }
    }
    return isFound ? start : -1;
  };
  _proto._McDonaldAlloc = function _McDonaldAlloc(size) {
    size = roundUp(size, this._alignment);
    for (var i = 0; i < this._chunkCount; ++i) {
      var chunk = this._chunks[i];
      var isFound = false;
      var start = chunk.start;
      if (start + size <= chunk.end) {
        isFound = true;
      } else if (start > chunk.end) {
        if (start + size <= chunk.size) {
          isFound = true;
        } else if (size <= chunk.end) {
          chunk.start = start = 0;
          isFound = true;
        }
      } else if (start === chunk.end) {
        chunk.start = start = 0;
        chunk.end = chunk.size;
        if (size <= chunk.end) {
          isFound = true;
        }
      }
      if (isFound) {
        chunk.start += size;
        var handle = {
          chunkIdx: i,
          start: start,
          end: start + size,
          texture: chunk.texture
        };
        this._handles.push(handle);
        return handle;
      }
    }
    var targetSize = Math.sqrt(size / this._formatSize);
    var texLength = this._roundUpFn && this._roundUpFn(targetSize, this._formatSize) || Math.max(1024, nearestPOT(targetSize));
    var newChunk = this._chunks[this.createChunk(texLength)];
    newChunk.start += size;
    var texHandle = {
      chunkIdx: this._chunkCount,
      start: 0,
      end: size,
      texture: newChunk.texture
    };
    this._handles.push(texHandle);
    return texHandle;
  };
  return TextureBufferPool;
}();

removeProperty(RenderScene.prototype, 'RenderScene.prototype', [{
  name: 'raycastUI2DNode'
}, {
  name: 'raycastUINode'
}]);
removeProperty(RenderScene.prototype, 'RenderScene.prototype', [{
  name: 'raycastAll',
  suggest: 'using intersect.rayModel in geometry'
}, {
  name: 'raycastAllModels',
  suggest: 'using intersect.rayModel in geometry'
}, {
  name: 'raycastSingleModel',
  suggest: 'using intersect.rayModel in geometry'
}, {
  name: 'raycastAllCanvas',
  suggest: 'using intersect.rayAABB in geometry'
}, {
  name: 'rayResultCanvas'
}, {
  name: 'rayResultModels'
}, {
  name: 'rayResultAll'
}, {
  name: 'rayResultSingleModel'
}]);
removeProperty(Model.prototype, 'Model.prototype', [{
  name: 'isInstancingEnabled'
}, {
  name: 'instancedAttributes'
}]);
var CameraVisFlags = {};
removeProperty(CameraVisFlags, 'CameraVisFlags', [{
  name: 'GENERAL'
}]);
replaceProperty(CameraVisFlags, 'CameraVisFlags', [{
  name: 'PROFILER',
  newName: 'PROFILER',
  target: Layers.BitMask,
  targetName: 'PROFILER'
}, {
  name: 'GIZMOS',
  newName: 'GIZMOS',
  target: Layers.BitMask,
  targetName: 'GIZMOS'
}, {
  name: 'EDITOR',
  newName: 'EDITOR',
  target: Layers.BitMask,
  targetName: 'EDITOR'
}, {
  name: 'UI',
  newName: 'UI',
  target: Layers.BitMask,
  targetName: 'UI_3D'
}, {
  name: 'UI2D',
  newName: 'UI2D',
  target: Layers.BitMask,
  targetName: 'UI_2D'
}]);
legacyCC.CameraVisFlags = CameraVisFlags;
var VisibilityFlags = {};
removeProperty(VisibilityFlags, 'VisibilityFlags', [{
  name: 'GENERAL'
}]);
replaceProperty(VisibilityFlags, 'VisibilityFlags', [{
  name: 'ALWALS',
  newName: 'ALWALS',
  target: Layers.Enum,
  targetName: 'ALWALS'
}, {
  name: 'PROFILER',
  newName: 'PROFILER',
  target: Layers.Enum,
  targetName: 'PROFILER'
}, {
  name: 'GIZMOS',
  newName: 'GIZMOS',
  target: Layers.Enum,
  targetName: 'GIZMOS'
}, {
  name: 'EDITOR',
  newName: 'EDITOR',
  target: Layers.Enum,
  targetName: 'EDITOR'
}, {
  name: 'UI',
  newName: 'UI',
  target: Layers.Enum,
  targetName: 'UI_3D'
}, {
  name: 'UI2D',
  newName: 'UI2D',
  target: Layers.Enum,
  targetName: 'UI_2D'
}]);
legacyCC.VisibilityFlags = VisibilityFlags;
replaceProperty(Pass.prototype, 'Pass.prototype', [{
  name: 'getBindingTypeFromHandle',
  newName: 'getDescriptorTypeFromHandle'
}]);
removeProperty(Camera.prototype, 'Camera.prototype', [{
  name: 'getSplitFrustum'
}, {
  name: 'setMatView'
}, {
  name: 'setMatViewInv'
}, {
  name: 'setMatProjInv'
}, {
  name: 'setMatViewProjInv'
}, {
  name: 'setMatProj'
}, {
  name: 'setMatViewProj'
}, {
  name: 'getMatViewInv'
}]);
removeProperty(Shadows.prototype, 'Shadows.prototype', [{
  name: 'aspect'
}, {
  name: 'selfShadow'
}, {
  name: 'linear'
}, {
  name: 'packing'
}, {
  name: 'autoAdapt'
}, {
  name: 'fixedArea'
}, {
  name: 'pcf'
}, {
  name: 'bias'
}, {
  name: 'normalBias'
}, {
  name: 'near'
}, {
  name: 'far'
}, {
  name: 'shadowDistance'
}, {
  name: 'invisibleOcclusionRange'
}, {
  name: 'orthoSize'
}, {
  name: 'saturation'
}]);
removeProperty(SpotLight.prototype, 'SpotLight.prototype', [{
  name: 'aspect'
}]);
replaceProperty(SubModel.prototype, 'SubModel.prototype', [{
  name: 'subMeshData',
  newName: 'subMesh'
}]);
removeProperty(SubModel.prototype, 'SubModel.prototype', [{
  name: 'getSubModel',
  suggest: 'Use `subModels[i]` instead'
}, {
  name: 'subModelNum',
  suggest: 'Use `subModels.length` instead'
}]);

export { CameraVisFlags as C, PassStage as P, RenderQueue as R, TextureBufferPool as T, VisibilityFlags as V, nearestPOT as n };
//# sourceMappingURL=deprecated-CN-RjLP6.js.map
