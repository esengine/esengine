import { E as Enum, _ as _inheritsLoose, l as _createForOfIteratorHelperLoose, e as warn, G as macro, w as warnID, a as _createClass, b as _applyDecoratedDescriptor, x as ccenum, k as errorID, ao as IDGenerator, aE as getClassById, aF as _wrapNativeSuper, g as getError, ac as CCClass, a5 as Pool, o as assertIsTrue, v as value, Q as error, an as getClassName, aG as getSuper, aH as isChildClassOf, aI as BUILTIN_CLASSID_RE, u as getClassId, aj as ENUM_TAG, ak as BITMASK_TAG, aJ as Platform, z as _extends, U as assertIsNonNullable, M as fastRemoveAt, N as assertID, aK as callInNextTick, K as isValid, ap as mixin, t as createMap, aL as addon, s as settings, S as SettingsCategory, n as EventTarget, D as debug, I as assert, d as CCObjectFlags, aM as get, P as Pool$1, al as CallbacksInvoker, L as log, aN as getClassByName, O as CCObject, q as CCFloat, p as CCInteger, j as CCString, V as ValueType } from './gc-object-CShF5lzx.js';
import { c as ccclass, n as sys, L as override, b as applyDecoratedInitializer, s as serializable, b6 as editorOnly, aA as deserializeTag, V as Vec2, f as Vec3, g as Vec4, Q as Quat, C as Color, B as Size, m as Rect, M as Mat4, t as type, P as Mat3, _ as Sphere, w as mat4, u as v3, a6 as quat, aB as serializeTag, A as approx, E as EPSILON, p as property, k as formerlySerializedAs, e as editorExtrasTag } from './index-uXI1_UMk.js';
import { X as XIAOMI, E as EDITOR, P as PREVIEW } from './_virtual_internal_constants-DWlew7Dp.js';
import { a as ccwindow, c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';
import { n as UBOSkinning, A as UBOForwardLightEnum, S as SetIndex, H as localDescriptorSetLayout, J as globalDescriptorSetLayout, Y as getPassPool, v as UNIFORM_LIGHTMAP_TEXTURE_BINDING, w as UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING, x as UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING, R as RenderPriority, a0 as RenderPassStage, i as isEnableEffect, P as PipelineStateManager, a1 as UNIFORM_ENVIRONMENT_BINDING, a2 as UNIFORM_DIFFUSEMAP_BINDING, L as Layers } from './pipeline-state-manager-C5U4ouGL.js';
import { A as Asset, C as Component, o as decodeUuid, q as parsed, r as files, k as Cache, u as normalize, i as assets, v as isScene, n as bundles, R as RequestType, b as basename, B as BuiltinBundleName, t as transform, w as Task, h as fetchPipeline, P as Pipeline, f as pipeline, x as transformPipeline, y as presets, z as assetsOverrideMap, e as extname, D as helper, F as references, N as NodeEventType } from './node-event-Ccvtv8bJ.js';
import { d as EventTouch, I as InputEventType } from './touch-BKrZ-fxl.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { F as Format, af as Address, a4 as Filter, _ as FormatFeatureBit, ae as SamplerInfo, m as murmurhash2_32_gc, J as BufferTextureCopy, a0 as TextureFlagBit, H as TextureUsageBit, $ as API, z as TextureInfo, E as TextureType, bi as TextureViewInfo, W as Type, aN as GetTypeSize, az as DescriptorSetLayoutInfo, b5 as ShaderInfo, L as DescriptorSetLayoutBinding, N as DescriptorType, U as UniformBlock, V as Uniform, X as UniformSamplerTexture, bk as UniformSampler, bn as UniformTexture, bl as UniformStorageBuffer, bm as UniformStorageImage, bj as UniformInputAttachment, A as Attribute, b6 as ShaderStage, O as ShaderStageFlagBit, aX as PipelineLayoutInfo, at as DESCRIPTOR_BUFFER_TYPE, av as DESCRIPTOR_SAMPLER_TYPE, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, I as InputAssemblerInfo, ap as BufferViewInfo, a5 as DescriptorSetInfo, p as Sampler, y as PrimitiveMode, aa as Feature, e as BlendState, c as DepthStencilState, R as RasterizerState, aD as DynamicStateFlagBit, bo as Viewport, ad as Rect$1, q as Texture } from './buffer-barrier-BlQXg9Aa.js';

var CustomPixelFormat;
(function (CustomPixelFormat) {
  CustomPixelFormat[CustomPixelFormat["VALUE"] = 1024] = "VALUE";
})(CustomPixelFormat || (CustomPixelFormat = {}));
var PixelFormat;
(function (PixelFormat) {
  PixelFormat[PixelFormat["RGB565"] = Format.R5G6B5] = "RGB565";
  PixelFormat[PixelFormat["RGB5A1"] = Format.RGB5A1] = "RGB5A1";
  PixelFormat[PixelFormat["RGBA4444"] = Format.RGBA4] = "RGBA4444";
  PixelFormat[PixelFormat["RGB888"] = Format.RGB8] = "RGB888";
  PixelFormat[PixelFormat["RGB32F"] = Format.RGB32F] = "RGB32F";
  PixelFormat[PixelFormat["RGBA8888"] = Format.RGBA8] = "RGBA8888";
  PixelFormat[PixelFormat["BGRA8888"] = Format.BGRA8] = "BGRA8888";
  PixelFormat[PixelFormat["RGBA32F"] = Format.RGBA32F] = "RGBA32F";
  PixelFormat[PixelFormat["A8"] = Format.A8] = "A8";
  PixelFormat[PixelFormat["I8"] = Format.L8] = "I8";
  PixelFormat[PixelFormat["AI8"] = Format.LA8] = "AI8";
  PixelFormat[PixelFormat["RGB_PVRTC_2BPPV1"] = Format.PVRTC_RGB2] = "RGB_PVRTC_2BPPV1";
  PixelFormat[PixelFormat["RGBA_PVRTC_2BPPV1"] = Format.PVRTC_RGBA2] = "RGBA_PVRTC_2BPPV1";
  PixelFormat[PixelFormat["RGB_A_PVRTC_2BPPV1"] = CustomPixelFormat.VALUE] = "RGB_A_PVRTC_2BPPV1";
  PixelFormat[PixelFormat["RGB_PVRTC_4BPPV1"] = Format.PVRTC_RGB4] = "RGB_PVRTC_4BPPV1";
  PixelFormat[PixelFormat["RGBA_PVRTC_4BPPV1"] = Format.PVRTC_RGBA4] = "RGBA_PVRTC_4BPPV1";
  PixelFormat[PixelFormat["RGB_A_PVRTC_4BPPV1"] = CustomPixelFormat.VALUE + 1] = "RGB_A_PVRTC_4BPPV1";
  PixelFormat[PixelFormat["RGB_ETC1"] = Format.ETC_RGB8] = "RGB_ETC1";
  PixelFormat[PixelFormat["RGBA_ETC1"] = CustomPixelFormat.VALUE + 2] = "RGBA_ETC1";
  PixelFormat[PixelFormat["RGB_ETC2"] = Format.ETC2_RGB8] = "RGB_ETC2";
  PixelFormat[PixelFormat["RGBA_ETC2"] = Format.ETC2_RGBA8] = "RGBA_ETC2";
  PixelFormat[PixelFormat["RGBA_ASTC_4x4"] = Format.ASTC_RGBA_4X4] = "RGBA_ASTC_4x4";
  PixelFormat[PixelFormat["RGBA_ASTC_5x4"] = Format.ASTC_RGBA_5X4] = "RGBA_ASTC_5x4";
  PixelFormat[PixelFormat["RGBA_ASTC_5x5"] = Format.ASTC_RGBA_5X5] = "RGBA_ASTC_5x5";
  PixelFormat[PixelFormat["RGBA_ASTC_6x5"] = Format.ASTC_RGBA_6X5] = "RGBA_ASTC_6x5";
  PixelFormat[PixelFormat["RGBA_ASTC_6x6"] = Format.ASTC_RGBA_6X6] = "RGBA_ASTC_6x6";
  PixelFormat[PixelFormat["RGBA_ASTC_8x5"] = Format.ASTC_RGBA_8X5] = "RGBA_ASTC_8x5";
  PixelFormat[PixelFormat["RGBA_ASTC_8x6"] = Format.ASTC_RGBA_8X6] = "RGBA_ASTC_8x6";
  PixelFormat[PixelFormat["RGBA_ASTC_8x8"] = Format.ASTC_RGBA_8X8] = "RGBA_ASTC_8x8";
  PixelFormat[PixelFormat["RGBA_ASTC_10x5"] = Format.ASTC_RGBA_10X5] = "RGBA_ASTC_10x5";
  PixelFormat[PixelFormat["RGBA_ASTC_10x6"] = Format.ASTC_RGBA_10X6] = "RGBA_ASTC_10x6";
  PixelFormat[PixelFormat["RGBA_ASTC_10x8"] = Format.ASTC_RGBA_10X8] = "RGBA_ASTC_10x8";
  PixelFormat[PixelFormat["RGBA_ASTC_10x10"] = Format.ASTC_RGBA_10X10] = "RGBA_ASTC_10x10";
  PixelFormat[PixelFormat["RGBA_ASTC_12x10"] = Format.ASTC_RGBA_12X10] = "RGBA_ASTC_12x10";
  PixelFormat[PixelFormat["RGBA_ASTC_12x12"] = Format.ASTC_RGBA_12X12] = "RGBA_ASTC_12x12";
})(PixelFormat || (PixelFormat = {}));
var WrapMode;
(function (WrapMode) {
  WrapMode[WrapMode["REPEAT"] = Address.WRAP] = "REPEAT";
  WrapMode[WrapMode["CLAMP_TO_EDGE"] = Address.CLAMP] = "CLAMP_TO_EDGE";
  WrapMode[WrapMode["MIRRORED_REPEAT"] = Address.MIRROR] = "MIRRORED_REPEAT";
  WrapMode[WrapMode["CLAMP_TO_BORDER"] = Address.BORDER] = "CLAMP_TO_BORDER";
})(WrapMode || (WrapMode = {}));
var TextureFilter;
(function (TextureFilter) {
  TextureFilter[TextureFilter["NONE"] = Filter.NONE] = "NONE";
  TextureFilter[TextureFilter["LINEAR"] = Filter.LINEAR] = "LINEAR";
  TextureFilter[TextureFilter["NEAREST"] = Filter.POINT] = "NEAREST";
})(TextureFilter || (TextureFilter = {}));

var _dec$e, _class$e, _class2$d, _ImageAsset;
var COMPRESSED_HEADER_LENGTH = 4;
var COMPRESSED_MIPMAP_DATA_SIZE_LENGTH = 4;
var COMPRESSED_MIPMAP_LEVEL_COUNT_LENGTH = 4;
var COMPRESSED_MIPMAP_MAGIC = 0x50494d43;
var compressType = Enum({
  PVR: 0,
  PKM: 1,
  ASTC: 2
});
var PVR_HEADER_LENGTH = 13;
var PVR_MAGIC = 0x03525650;
var PVR_HEADER_MAGIC = 0;
var PVR_HEADER_HEIGHT = 6;
var PVR_HEADER_WIDTH = 7;
var PVR_HEADER_METADATA = 12;
var ETC_PKM_HEADER_LENGTH = 16;
var ETC_PKM_FORMAT_OFFSET = 6;
var ETC_PKM_WIDTH_OFFSET = 12;
var ETC_PKM_HEIGHT_OFFSET = 14;
var ETC1_RGB_NO_MIPMAPS = 0;
var ETC2_RGB_NO_MIPMAPS = 1;
var ETC2_RGBA_NO_MIPMAPS = 3;
var ASTC_MAGIC = 0x5CA1AB13;
var ASTC_HEADER_LENGTH = 16;
var ASTC_HEADER_MAGIC = 4;
var ASTC_HEADER_SIZE_X_BEGIN = 7;
var ASTC_HEADER_SIZE_Y_BEGIN = 10;
function getASTCFormat(xdim, ydim) {
  if (xdim === 4) {
    return PixelFormat.RGBA_ASTC_4x4;
  }
  if (xdim === 5) {
    if (ydim === 4) {
      return PixelFormat.RGBA_ASTC_5x4;
    }
    return PixelFormat.RGBA_ASTC_5x5;
  }
  if (xdim === 6) {
    if (ydim === 5) {
      return PixelFormat.RGBA_ASTC_6x5;
    }
    return PixelFormat.RGBA_ASTC_6x6;
  }
  if (xdim === 8) {
    if (ydim === 5) {
      return PixelFormat.RGBA_ASTC_8x5;
    }
    if (ydim === 6) {
      return PixelFormat.RGBA_ASTC_8x6;
    }
    return PixelFormat.RGBA_ASTC_8x8;
  }
  if (xdim === 10) {
    if (ydim === 5) {
      return PixelFormat.RGBA_ASTC_10x5;
    }
    if (ydim === 6) {
      return PixelFormat.RGBA_ASTC_10x6;
    }
    if (ydim === 8) {
      return PixelFormat.RGBA_ASTC_10x8;
    }
    return PixelFormat.RGBA_ASTC_10x10;
  }
  if (ydim === 10) {
    return PixelFormat.RGBA_ASTC_12x10;
  }
  return PixelFormat.RGBA_ASTC_12x12;
}
function readBEUint16(header, offset) {
  return header[offset] << 8 | header[offset + 1];
}
function isImageBitmap(imageSource) {
  return !!(sys.hasFeature(sys.Feature.IMAGE_BITMAP) && imageSource instanceof ImageBitmap);
}
function isNativeImage(imageSource) {
  return imageSource instanceof HTMLImageElement || imageSource instanceof HTMLCanvasElement || isImageBitmap(imageSource);
}
var ImageAsset = (_dec$e = ccclass('cc.ImageAsset'), _dec$e(_class$e = (_class2$d = (_ImageAsset = function (_Asset) {
  function ImageAsset(nativeAsset) {
    var _this;
    _this = _Asset.call(this) || this;
    _this._nativeData = void 0;
    _this._exportedExts = undefined;
    _this._format = PixelFormat.RGBA8888;
    _this._width = 0;
    _this._height = 0;
    _this._nativeData = {
      _data: null,
      width: 0,
      height: 0,
      format: 0,
      _compressed: false,
      mipmapLevelDataSize: []
    };
    if (nativeAsset !== undefined) {
      _this.reset(nativeAsset);
    }
    return _this;
  }
  _inheritsLoose(ImageAsset, _Asset);
  ImageAsset.mergeCompressedTextureMips = function mergeCompressedTextureMips(files) {
    var out = new Uint8Array(0);
    var err = null;
    try {
      var fileHeaderLength = COMPRESSED_HEADER_LENGTH + COMPRESSED_MIPMAP_LEVEL_COUNT_LENGTH + files.length * COMPRESSED_MIPMAP_DATA_SIZE_LENGTH;
      var fileLength = 0;
      for (var _iterator = _createForOfIteratorHelperLoose(files), _step; !(_step = _iterator()).done;) {
        var _file = _step.value;
        fileLength += _file.byteLength;
      }
      fileLength += fileHeaderLength;
      out = new Uint8Array(fileLength);
      var outView = new DataView(out.buffer, out.byteOffset, out.byteLength);
      outView.setUint32(0, COMPRESSED_MIPMAP_MAGIC, true);
      outView.setUint32(COMPRESSED_HEADER_LENGTH, files.length, true);
      var dataOffset = fileHeaderLength;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        outView.setUint32(COMPRESSED_HEADER_LENGTH + COMPRESSED_MIPMAP_LEVEL_COUNT_LENGTH + i * COMPRESSED_MIPMAP_DATA_SIZE_LENGTH, file.byteLength, true);
        if (file instanceof ArrayBuffer) {
          var srcArray = new Uint8Array(file);
          out.set(srcArray, dataOffset);
        } else {
          var _srcArray = new Uint8Array(file.buffer, file.byteOffset, file.byteLength);
          out.set(_srcArray, dataOffset);
        }
        dataOffset += file.byteLength;
      }
    } catch (e) {
      err = e;
      warn(err);
    }
    return out;
  };
  ImageAsset.parseCompressedTextures = function parseCompressedTextures(file, type) {
    var out = {
      _data: new Uint8Array(0),
      _compressed: true,
      width: 0,
      height: 0,
      format: 0,
      mipmapLevelDataSize: []
    };
    var buffer = file instanceof ArrayBuffer ? file : file.buffer;
    var bufferView = new DataView(buffer);
    var magicNumber = bufferView.getUint32(0, true);
    if (magicNumber === COMPRESSED_MIPMAP_MAGIC) {
      var mipmapLevelNumber = bufferView.getUint32(COMPRESSED_HEADER_LENGTH, true);
      var mipmapLevelDataSize = bufferView.getUint32(COMPRESSED_HEADER_LENGTH + COMPRESSED_MIPMAP_LEVEL_COUNT_LENGTH, true);
      var fileHeaderByteLength = COMPRESSED_HEADER_LENGTH + COMPRESSED_MIPMAP_LEVEL_COUNT_LENGTH + mipmapLevelNumber * COMPRESSED_MIPMAP_DATA_SIZE_LENGTH;
      ImageAsset.parseCompressedTexture(file, 0, fileHeaderByteLength, mipmapLevelDataSize, type, out);
      var beginOffset = fileHeaderByteLength + mipmapLevelDataSize;
      for (var i = 1; i < mipmapLevelNumber; i++) {
        var endOffset = bufferView.getUint32(COMPRESSED_HEADER_LENGTH + COMPRESSED_MIPMAP_LEVEL_COUNT_LENGTH + i * COMPRESSED_MIPMAP_DATA_SIZE_LENGTH, true);
        ImageAsset.parseCompressedTexture(file, i, beginOffset, endOffset, type, out);
        beginOffset += endOffset;
      }
    } else {
      ImageAsset.parseCompressedTexture(file, 0, 0, 0, type, out);
    }
    return out;
  };
  ImageAsset.parseCompressedTexture = function parseCompressedTexture(file, levelIndex, beginOffset, endOffset, type, out) {
    switch (type) {
      case compressType.PVR:
        ImageAsset.parsePVRTexture(file, levelIndex, beginOffset, endOffset, out);
        break;
      case compressType.PKM:
        ImageAsset.parsePKMTexture(file, levelIndex, beginOffset, endOffset, out);
        break;
      case compressType.ASTC:
        ImageAsset.parseASTCTexture(file, levelIndex, beginOffset, endOffset, out);
        break;
    }
  };
  ImageAsset.parsePVRTexture = function parsePVRTexture(file, levelIndex, beginOffset, endOffset, out) {
    var buffer = file instanceof ArrayBuffer ? file : file.buffer;
    var header = new Int32Array(buffer, beginOffset, PVR_HEADER_LENGTH);
    if (header[PVR_HEADER_MAGIC] === PVR_MAGIC) {
      var byteOffset = beginOffset + header[PVR_HEADER_METADATA] + 52;
      var length = endOffset - header.byteLength;
      if (endOffset > 0) {
        var srcView = new Uint8Array(buffer, byteOffset, length);
        var dstView = new Uint8Array(out._data.byteLength + srcView.byteLength);
        dstView.set(out._data);
        dstView.set(srcView, out._data.byteLength);
        out._data = dstView;
        out.mipmapLevelDataSize[levelIndex] = length;
      } else {
        out._data = new Uint8Array(buffer, byteOffset);
      }
      out.width = levelIndex > 0 ? out.width : header[PVR_HEADER_WIDTH];
      out.height = levelIndex > 0 ? out.height : header[PVR_HEADER_HEIGHT];
    } else if (header[11] === 0x21525650) {
      var _byteOffset = beginOffset + header[0];
      var _length = endOffset - header.byteLength;
      if (endOffset > 0) {
        var _srcView = new Uint8Array(buffer, _byteOffset, _length);
        var _dstView = new Uint8Array(out._data.byteLength + _srcView.byteLength);
        _dstView.set(out._data);
        _dstView.set(_srcView, out._data.byteLength);
        out._data = _dstView;
        out.mipmapLevelDataSize[levelIndex] = _length;
      } else {
        out._data = new Uint8Array(buffer, _byteOffset);
      }
      out.width = levelIndex > 0 ? out.width : header[1];
      out.height = levelIndex > 0 ? out.height : header[2];
    } else {
      throw new Error('Invalid magic number in PVR header');
    }
  };
  ImageAsset.parsePKMTexture = function parsePKMTexture(file, levelIndex, beginOffset, endOffset, out) {
    var buffer = file instanceof ArrayBuffer ? file : file.buffer;
    var header = new Uint8Array(buffer, beginOffset, ETC_PKM_HEADER_LENGTH);
    var format = readBEUint16(header, ETC_PKM_FORMAT_OFFSET);
    if (format !== ETC1_RGB_NO_MIPMAPS && format !== ETC2_RGB_NO_MIPMAPS && format !== ETC2_RGBA_NO_MIPMAPS) {
      throw new Error('Invalid magic number in ETC header');
    }
    var byteOffset = beginOffset + ETC_PKM_HEADER_LENGTH;
    var length = endOffset - ETC_PKM_HEADER_LENGTH;
    if (endOffset > 0) {
      var srcView = new Uint8Array(buffer, byteOffset, length);
      var dstView = new Uint8Array(out._data.byteLength + srcView.byteLength);
      dstView.set(out._data);
      dstView.set(srcView, out._data.byteLength);
      out._data = dstView;
      out.mipmapLevelDataSize[levelIndex] = length;
    } else {
      out._data = new Uint8Array(buffer, byteOffset);
    }
    out.width = levelIndex > 0 ? out.width : readBEUint16(header, ETC_PKM_WIDTH_OFFSET);
    out.height = levelIndex > 0 ? out.height : readBEUint16(header, ETC_PKM_HEIGHT_OFFSET);
  };
  ImageAsset.parseASTCTexture = function parseASTCTexture(file, levelIndex, beginOffset, endOffset, out) {
    var buffer = file instanceof ArrayBuffer ? file : file.buffer;
    var header = new Uint8Array(buffer, beginOffset, ASTC_HEADER_LENGTH);
    var magicval = header[0] + (header[1] << 8) + (header[2] << 16) + (header[3] << 24);
    if (magicval !== ASTC_MAGIC) {
      throw new Error('Invalid magic number in ASTC header');
    }
    var xdim = header[ASTC_HEADER_MAGIC];
    var ydim = header[ASTC_HEADER_MAGIC + 1];
    var zdim = header[ASTC_HEADER_MAGIC + 2];
    if ((xdim < 3 || xdim > 6 || ydim < 3 || ydim > 6 || zdim < 3 || zdim > 6) && (xdim < 4 || xdim === 7 || xdim === 9 || xdim === 11 || xdim > 12 || ydim < 4 || ydim === 7 || ydim === 9 || ydim === 11 || ydim > 12 || zdim !== 1)) {
      throw new Error('Invalid block number in ASTC header');
    }
    var format = getASTCFormat(xdim, ydim);
    var byteOffset = beginOffset + ASTC_HEADER_LENGTH;
    var length = endOffset - ASTC_HEADER_LENGTH;
    if (endOffset > 0) {
      var srcView = new Uint8Array(buffer, byteOffset, length);
      var dstView = new Uint8Array(out._data.byteLength + srcView.byteLength);
      dstView.set(out._data);
      dstView.set(srcView, out._data.byteLength);
      out._data = dstView;
      out.mipmapLevelDataSize[levelIndex] = length;
    } else {
      out._data = new Uint8Array(buffer, byteOffset);
    }
    out.width = levelIndex > 0 ? out.width : header[ASTC_HEADER_SIZE_X_BEGIN] + (header[ASTC_HEADER_SIZE_X_BEGIN + 1] << 8) + (header[ASTC_HEADER_SIZE_X_BEGIN + 2] << 16);
    out.height = levelIndex > 0 ? out.height : header[ASTC_HEADER_SIZE_Y_BEGIN] + (header[ASTC_HEADER_SIZE_Y_BEGIN + 1] << 8) + (header[ASTC_HEADER_SIZE_Y_BEGIN + 2] << 16);
    out.format = format;
  };
  var _proto = ImageAsset.prototype;
  _proto.extractMipmap0 = function extractMipmap0() {
    if (this.mipmapLevelDataSize && this.mipmapLevelDataSize.length > 0) {
      var mipmapSize = this.mipmapLevelDataSize[0];
      var data = this.data;
      var dataView = new Uint8Array(data.buffer, 0, mipmapSize);
      var mipmap = new ImageAsset({
        _data: dataView,
        _compressed: true,
        width: this.width,
        height: this.height,
        format: this.format,
        mipmapLevelDataSize: []
      });
      mipmap._uuid = "" + this._uuid;
      return mipmap;
    } else {
      return this;
    }
  };
  _proto.extractMipmaps = function extractMipmaps() {
    var images = [];
    if (this.mipmapLevelDataSize && this.mipmapLevelDataSize.length > 0) {
      var mipmapLevelDataSize = this.mipmapLevelDataSize;
      var data = this.data;
      var byteOffset = 0;
      var height = this.height;
      var width = this.width;
      for (var _iterator2 = _createForOfIteratorHelperLoose(mipmapLevelDataSize), _step2; !(_step2 = _iterator2()).done;) {
        var mipmapSize = _step2.value;
        var dataView = new Uint8Array(data.buffer, byteOffset, mipmapSize);
        var mipmap = new ImageAsset({
          _data: dataView,
          _compressed: true,
          width: width,
          height: height,
          format: this.format,
          mipmapLevelDataSize: []
        });
        byteOffset += mipmapSize;
        mipmap._uuid = "" + this._uuid;
        width = Math.max(width >> 1, 1);
        height = Math.max(height >> 1, 1);
        images.push(mipmap);
      }
    } else {
      images.push(this);
    }
    return images;
  };
  _proto.reset = function reset(data) {
    if (isImageBitmap(data)) {
      this._nativeData = data;
    } else if (!(data instanceof HTMLElement)) {
      this._nativeData = data;
      this._format = data.format;
    } else {
      this._nativeData = data;
    }
  };
  _proto.destroy = function destroy() {
    if (this.data && this.data instanceof HTMLImageElement) {
      this.data.src = '';
      this._setRawAsset('');
    } else if (isImageBitmap(this.data)) {
      var _this$data;
      (_this$data = this.data) == null ? void 0 : _this$data.close();
    }
    return _Asset.prototype.destroy.call(this);
  };
  _proto._serialize = function _serialize() {
  };
  _proto._deserialize = function _deserialize(data) {
    var fmtStr = '';
    if (typeof data === 'string') {
      fmtStr = data;
    } else {
      this._width = data.w;
      this._height = data.h;
      fmtStr = data.fmt;
    }
    var device = _getGlobalDevice();
    var extensionIDs = fmtStr.split('_');
    var preferedExtensionIndex = Number.MAX_VALUE;
    var format = this._format;
    var ext = '';
    var SupportTextureFormats = macro.SUPPORT_TEXTURE_FORMATS;
    for (var _iterator4 = _createForOfIteratorHelperLoose(extensionIDs), _step4; !(_step4 = _iterator4()).done;) {
      var extensionID = _step4.value;
      var extFormat = extensionID.split('@');
      var i = parseInt(extFormat[0], undefined);
      var tmpExt = ImageAsset.extnames[i] || extFormat[0];
      var index = SupportTextureFormats.indexOf(tmpExt);
      if (index !== -1 && index < preferedExtensionIndex) {
        var fmt = extFormat[1] ? parseInt(extFormat[1]) : this._format;
        if (tmpExt === '.astc' && (!device || !(device.getFormatFeatures(Format.ASTC_RGBA_4X4) & FormatFeatureBit.SAMPLED_TEXTURE))) {
          continue;
        } else if (tmpExt === '.pvr' && (!device || !(device.getFormatFeatures(Format.PVRTC_RGBA4) & FormatFeatureBit.SAMPLED_TEXTURE))) {
          continue;
        } else if ((fmt === PixelFormat.RGB_ETC1 || fmt === PixelFormat.RGBA_ETC1) && (!device || !(device.getFormatFeatures(Format.ETC_RGB8) & FormatFeatureBit.SAMPLED_TEXTURE))) {
          continue;
        } else if ((fmt === PixelFormat.RGB_ETC2 || fmt === PixelFormat.RGBA_ETC2) && (!device || !(device.getFormatFeatures(Format.ETC2_RGB8) & FormatFeatureBit.SAMPLED_TEXTURE))) {
          continue;
        } else if (tmpExt === '.webp' && !sys.hasFeature(sys.Feature.WEBP)) {
          continue;
        }
        preferedExtensionIndex = index;
        ext = tmpExt;
        format = fmt;
      }
    }
    if (ext) {
      this._setRawAsset(ext);
      this._format = format;
    } else {
      warnID(3121);
    }
  };
  _proto.initDefault = function initDefault(uuid) {
    _Asset.prototype.initDefault.call(this, uuid);
    if (!ImageAsset._sharedPlaceHolderCanvas) {
      var canvas = ccwindow.document.createElement('canvas');
      var context = canvas.getContext('2d');
      var l = canvas.width = canvas.height = 2;
      context.fillStyle = '#ff00ff';
      context.fillRect(0, 0, l, l);
      this.reset(canvas);
      ImageAsset._sharedPlaceHolderCanvas = canvas;
    } else {
      this.reset(ImageAsset._sharedPlaceHolderCanvas);
    }
  };
  _proto.validate = function validate() {
    return !!this.data;
  };
  return _createClass(ImageAsset, [{
    key: "_nativeAsset",
    get: function get() {
      return this._nativeData;
    },
    set: function set(value) {
      if (!(value instanceof HTMLElement) && !isImageBitmap(value)) {
        value.format = value.format || this._format;
      }
      this.reset(value);
    }
  }, {
    key: "data",
    get: function get() {
      if (isNativeImage(this._nativeData)) {
        return this._nativeData;
      }
      return this._nativeData && this._nativeData._data;
    }
  }, {
    key: "width",
    get: function get() {
      return this._nativeData.width || this._width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._nativeData.height || this._height;
    }
  }, {
    key: "format",
    get: function get() {
      return this._format;
    }
  }, {
    key: "isCompressed",
    get: function get() {
      return this._format >= PixelFormat.RGB_ETC1 && this._format <= PixelFormat.RGBA_ASTC_12x12 || this._format >= PixelFormat.RGB_A_PVRTC_2BPPV1 && this._format <= PixelFormat.RGBA_ETC1;
    }
  }, {
    key: "mipmapLevelDataSize",
    get: function get() {
      return this._nativeData.mipmapLevelDataSize;
    }
  }, {
    key: "url",
    get: function get() {
      return this.nativeUrl;
    }
  }]);
}(Asset), _ImageAsset.extnames = ['.png', '.jpg', '.jpeg', '.bmp', '.webp', '.pvr', '.pkm', '.astc'], _ImageAsset._sharedPlaceHolderCanvas = null, _ImageAsset), _applyDecoratedDescriptor(_class2$d.prototype, "_nativeAsset", [override], Object.getOwnPropertyDescriptor(_class2$d.prototype, "_nativeAsset"), _class2$d.prototype), _class2$d)) || _class$e);
function _getGlobalDevice() {
  return deviceManager.gfxDevice;
}
cclegacy.ImageAsset = ImageAsset;

var _dec$d, _class$d, _class2$c, _initializer$b, _initializer2$7, _initializer3$6, _initializer4$6, _initializer5$4, _initializer6$3, _initializer7$3, _initializer8$3, _TextureBase;
ccenum(Format);
var idGenerator$1 = new IDGenerator('Tex');
var TextureBase = (_dec$d = ccclass('cc.TextureBase'), _dec$d(_class$d = (_class2$c = (_TextureBase = function (_Asset) {
  function TextureBase(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this._format = _initializer$b && _initializer$b();
    _this._minFilter = _initializer2$7 && _initializer2$7();
    _this._magFilter = _initializer3$6 && _initializer3$6();
    _this._mipFilter = _initializer4$6 && _initializer4$6();
    _this._wrapS = _initializer5$4 && _initializer5$4();
    _this._wrapT = _initializer6$3 && _initializer6$3();
    _this._wrapR = _initializer7$3 && _initializer7$3();
    _this._anisotropy = _initializer8$3 && _initializer8$3();
    _this._width = 1;
    _this._height = 1;
    _this._samplerInfo = new SamplerInfo();
    _this._gfxSampler = null;
    _this._gfxDevice = null;
    _this._textureHash = 0;
    _this._id = idGenerator$1.getNewId();
    _this._gfxDevice = _this._getGFXDevice();
    _this._textureHash = murmurhash2_32_gc(_this._id, 666);
    return _this;
  }
  _inheritsLoose(TextureBase, _Asset);
  var _proto = TextureBase.prototype;
  _proto.getId = function getId() {
    return this._id;
  };
  _proto.getPixelFormat = function getPixelFormat() {
    return this._format;
  };
  _proto.getAnisotropy = function getAnisotropy() {
    return this._anisotropy;
  };
  _proto.setWrapMode = function setWrapMode(wrapS, wrapT, wrapR) {
    if (wrapR === undefined) wrapR = wrapS;
    this._wrapS = wrapS;
    this._samplerInfo.addressU = wrapS;
    this._wrapT = wrapT;
    this._samplerInfo.addressV = wrapT;
    this._wrapR = wrapR;
    this._samplerInfo.addressW = wrapR;
    if (this._gfxDevice) {
      this._gfxSampler = this._gfxDevice.getSampler(this._samplerInfo);
    }
  };
  _proto.setFilters = function setFilters(minFilter, magFilter) {
    this._minFilter = minFilter;
    this._samplerInfo.minFilter = minFilter;
    this._magFilter = magFilter;
    this._samplerInfo.magFilter = magFilter;
    if (this._gfxDevice) {
      this._gfxSampler = this._gfxDevice.getSampler(this._samplerInfo);
    }
  };
  _proto.setMipFilter = function setMipFilter(mipFilter) {
    this._mipFilter = mipFilter;
    this._samplerInfo.mipFilter = mipFilter;
    if (this._gfxDevice) {
      this._gfxSampler = this._gfxDevice.getSampler(this._samplerInfo);
    }
  };
  _proto.setAnisotropy = function setAnisotropy(anisotropy) {
    anisotropy = Math.min(anisotropy, 16);
    this._anisotropy = anisotropy;
    this._samplerInfo.maxAnisotropy = anisotropy;
    if (this._gfxDevice) {
      this._gfxSampler = this._gfxDevice.getSampler(this._samplerInfo);
    }
  };
  _proto.destroy = function destroy() {
    var _cclegacy$director$ro;
    var destroyed = _Asset.prototype.destroy.call(this);
    if (destroyed && (_cclegacy$director$ro = cclegacy.director.root) != null && _cclegacy$director$ro.batcher2D) {
      cclegacy.director.root.batcher2D._releaseDescriptorSetCache(this._textureHash);
    }
    return destroyed;
  };
  _proto.getHash = function getHash() {
    return this._textureHash;
  };
  _proto.getGFXTexture = function getGFXTexture() {
    return null;
  };
  _proto.getSamplerInfo = function getSamplerInfo() {
    return this._samplerInfo;
  };
  _proto.getGFXSampler = function getGFXSampler() {
    if (!this._gfxSampler) {
      if (this._gfxDevice) {
        this._gfxSampler = this._gfxDevice.getSampler(this._samplerInfo);
      } else {
        errorID(9302);
      }
    }
    return this._gfxSampler;
  };
  _proto._serialize = function _serialize(ctxForExporting) {
    return '';
  };
  _proto._deserialize = function _deserialize(serializedData, handle) {
    var data = serializedData;
    var fields = data.split(',');
    fields.unshift('');
    if (fields.length >= 5) {
      this.setFilters(parseInt(fields[1]), parseInt(fields[2]));
      this.setWrapMode(parseInt(fields[3]), parseInt(fields[4]));
    }
    if (fields.length >= 7) {
      this.setMipFilter(parseInt(fields[5]));
      this.setAnisotropy(parseInt(fields[6]));
    }
  };
  _proto._getGFXDevice = function _getGFXDevice() {
    return deviceManager.gfxDevice;
  };
  _proto._getGFXFormat = function _getGFXFormat() {
    return this._getGFXPixelFormat(this._format);
  };
  _proto._setGFXFormat = function _setGFXFormat(format) {
    this._format = format === undefined ? PixelFormat.RGBA8888 : format;
  };
  _proto._getGFXPixelFormat = function _getGFXPixelFormat(format) {
    if (format === PixelFormat.RGBA_ETC1) {
      format = PixelFormat.RGB_ETC1;
    } else if (format === PixelFormat.RGB_A_PVRTC_4BPPV1) {
      format = PixelFormat.RGB_PVRTC_4BPPV1;
    } else if (format === PixelFormat.RGB_A_PVRTC_2BPPV1) {
      format = PixelFormat.RGB_PVRTC_2BPPV1;
    }
    return format;
  };
  return _createClass(TextureBase, [{
    key: "isCompressed",
    get: function get() {
      return this._format >= PixelFormat.RGB_ETC1 && this._format <= PixelFormat.RGBA_ASTC_12x12 || this._format >= PixelFormat.RGB_A_PVRTC_2BPPV1 && this._format <= PixelFormat.RGBA_ETC1;
    }
  }, {
    key: "isAlphaAtlas",
    get: function get() {
      return this._format === PixelFormat.RGBA_ETC1 || this._format === PixelFormat.RGB_A_PVRTC_4BPPV1 || this._format === PixelFormat.RGB_A_PVRTC_2BPPV1;
    }
  }, {
    key: "width",
    get: function get() {
      return this._width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    }
  }]);
}(Asset), _TextureBase.PixelFormat = PixelFormat, _TextureBase.WrapMode = WrapMode, _TextureBase.Filter = TextureFilter, _TextureBase), _initializer$b = applyDecoratedInitializer(_class2$c.prototype, "_format", [serializable], function () {
  return PixelFormat.RGBA8888;
}), _initializer2$7 = applyDecoratedInitializer(_class2$c.prototype, "_minFilter", [serializable], function () {
  return TextureFilter.LINEAR;
}), _initializer3$6 = applyDecoratedInitializer(_class2$c.prototype, "_magFilter", [serializable], function () {
  return TextureFilter.LINEAR;
}), _initializer4$6 = applyDecoratedInitializer(_class2$c.prototype, "_mipFilter", [serializable], function () {
  return TextureFilter.NONE;
}), _initializer5$4 = applyDecoratedInitializer(_class2$c.prototype, "_wrapS", [serializable], function () {
  return WrapMode.REPEAT;
}), _initializer6$3 = applyDecoratedInitializer(_class2$c.prototype, "_wrapT", [serializable], function () {
  return WrapMode.REPEAT;
}), _initializer7$3 = applyDecoratedInitializer(_class2$c.prototype, "_wrapR", [serializable], function () {
  return WrapMode.REPEAT;
}), _initializer8$3 = applyDecoratedInitializer(_class2$c.prototype, "_anisotropy", [serializable], function () {
  return 0;
}), _class2$c)) || _class$d);
cclegacy.TextureBase = TextureBase;

var _dec$c, _class$c, _class2$b, _initializer$a;
var MissingScript = (_dec$c = ccclass('cc.MissingScript'), _dec$c(_class$c = (_class2$b = function (_Component) {
  function MissingScript() {
    var _this;
    _this = _Component.call(this) || this;
    _this._$erialized = _initializer$a && _initializer$a();
    return _this;
  }
  _inheritsLoose(MissingScript, _Component);
  MissingScript.safeFindClass = function safeFindClass(id) {
    var cls = getClassById(id);
    if (cls) {
      return cls;
    }
    cclegacy.deserialize.reportMissingClass(id);
    return undefined;
  };
  var _proto = MissingScript.prototype;
  _proto.onLoad = function onLoad() {
    warnID(4600, this.node.name);
  };
  return MissingScript;
}(Component), _initializer$a = applyDecoratedInitializer(_class2$b.prototype, "_$erialized", [serializable, editorOnly], function () {
  return null;
}), _class2$b)) || _class$c);
cclegacy._MissingScript = MissingScript;
try {
  var props = MissingScript.__values__;
  if (props.length === 0 || props[props.length - 1] !== '_$erialized') {
    errorID(16338);
    errorID(16339, props.join(', '));
  }
} catch (e) {
  errorID(16340, "" + e);
}

var Decoder = function () {
  function Decoder(buffer) {
    this._offset = 0;
    this._buffer = void 0;
    this._view = void 0;
    if (buffer instanceof ArrayBuffer) {
      this._buffer = buffer;
      this._view = new DataView(this._buffer);
    } else if (ArrayBuffer.isView(buffer)) {
      this._buffer = buffer.buffer;
      this._view = new DataView(this._buffer, buffer.byteOffset, buffer.byteLength);
    } else {
      throw new Error('Invalid argument');
    }
  }
  var _proto = Decoder.prototype;
  _proto._array = function _array(length) {
    var value = new Array(length);
    for (var i = 0; i < length; i++) {
      value[i] = this.parse();
    }
    return value;
  };
  _proto._map = function _map(length) {
    var key = '';
    var value = {};
    for (var i = 0; i < length; i++) {
      key = this.parse();
      value[key] = this.parse();
    }
    return value;
  };
  _proto._str = function _str(length) {
    var value = utf8Read(this._view, this._offset, length);
    this._offset += length;
    return value;
  };
  _proto._bin = function _bin(length) {
    var value = this._buffer.slice(this._offset, this._offset + length);
    this._offset += length;
    return value;
  };
  _proto.parse = function parse() {
    var prefix = this._view.getUint8(this._offset++);
    var value;
    var length = 0;
    var type = 0;
    var hi = 0;
    var lo = 0;
    if (prefix < 0xc0) {
      if (prefix < 0x80) {
        return prefix;
      }
      if (prefix < 0x90) {
        return this._map(prefix & 0x0f);
      }
      if (prefix < 0xa0) {
        return this._array(prefix & 0x0f);
      }
      return this._str(prefix & 0x1f);
    }
    if (prefix > 0xdf) {
      return (0xff - prefix + 1) * -1;
    }
    switch (prefix) {
      case 0xc0:
        return null;
      case 0xc2:
        return false;
      case 0xc3:
        return true;
      case 0xc4:
        length = this._view.getUint8(this._offset);
        this._offset += 1;
        return this._bin(length);
      case 0xc5:
        length = this._view.getUint16(this._offset);
        this._offset += 2;
        return this._bin(length);
      case 0xc6:
        length = this._view.getUint32(this._offset);
        this._offset += 4;
        return this._bin(length);
      case 0xc7:
        length = this._view.getUint8(this._offset);
        type = this._view.getInt8(this._offset + 1);
        this._offset += 2;
        if (type === -1) {
          var ns = this._view.getUint32(this._offset);
          hi = this._view.getInt32(this._offset + 4);
          lo = this._view.getUint32(this._offset + 8);
          this._offset += 12;
          return new Date((hi * 0x100000000 + lo) * 1e3 + ns / 1e6);
        }
        return [type, this._bin(length)];
      case 0xc8:
        length = this._view.getUint16(this._offset);
        type = this._view.getInt8(this._offset + 2);
        this._offset += 3;
        return [type, this._bin(length)];
      case 0xc9:
        length = this._view.getUint32(this._offset);
        type = this._view.getInt8(this._offset + 4);
        this._offset += 5;
        return [type, this._bin(length)];
      case 0xca:
        value = this._view.getFloat32(this._offset);
        this._offset += 4;
        return value;
      case 0xcb:
        value = this._view.getFloat64(this._offset);
        this._offset += 8;
        return value;
      case 0xcc:
        value = this._view.getUint8(this._offset);
        this._offset += 1;
        return value;
      case 0xcd:
        value = this._view.getUint16(this._offset);
        this._offset += 2;
        return value;
      case 0xce:
        value = this._view.getUint32(this._offset);
        this._offset += 4;
        return value;
      case 0xcf:
        hi = this._view.getUint32(this._offset) * Math.pow(2, 32);
        lo = this._view.getUint32(this._offset + 4);
        this._offset += 8;
        return hi + lo;
      case 0xd0:
        value = this._view.getInt8(this._offset);
        this._offset += 1;
        return value;
      case 0xd1:
        value = this._view.getInt16(this._offset);
        this._offset += 2;
        return value;
      case 0xd2:
        value = this._view.getInt32(this._offset);
        this._offset += 4;
        return value;
      case 0xd3:
        hi = this._view.getInt32(this._offset) * Math.pow(2, 32);
        lo = this._view.getUint32(this._offset + 4);
        this._offset += 8;
        return hi + lo;
      case 0xd4:
        type = this._view.getInt8(this._offset);
        this._offset += 1;
        if (type === 0x00) {
          this._offset += 1;
          return undefined;
        }
        return [type, this._bin(1)];
      case 0xd5:
        type = this._view.getInt8(this._offset);
        this._offset += 1;
        return [type, this._bin(2)];
      case 0xd6:
        type = this._view.getInt8(this._offset);
        this._offset += 1;
        if (type === -1) {
          value = this._view.getUint32(this._offset);
          this._offset += 4;
          return new Date(value * 1e3);
        }
        return [type, this._bin(4)];
      case 0xd7:
        type = this._view.getInt8(this._offset);
        this._offset += 1;
        if (type === 0x00) {
          hi = this._view.getInt32(this._offset) * Math.pow(2, 32);
          lo = this._view.getUint32(this._offset + 4);
          this._offset += 8;
          return new Date(hi + lo);
        }
        if (type === -1) {
          hi = this._view.getUint32(this._offset);
          lo = this._view.getUint32(this._offset + 4);
          this._offset += 8;
          var s = (hi & 0x3) * 0x100000000 + lo;
          return new Date(s * 1e3 + (hi >>> 2) / 1e6);
        }
        return [type, this._bin(8)];
      case 0xd8:
        type = this._view.getInt8(this._offset);
        this._offset += 1;
        return [type, this._bin(16)];
      case 0xd9:
        length = this._view.getUint8(this._offset);
        this._offset += 1;
        return this._str(length);
      case 0xda:
        length = this._view.getUint16(this._offset);
        this._offset += 2;
        return this._str(length);
      case 0xdb:
        length = this._view.getUint32(this._offset);
        this._offset += 4;
        return this._str(length);
      case 0xdc:
        length = this._view.getUint16(this._offset);
        this._offset += 2;
        return this._array(length);
      case 0xdd:
        length = this._view.getUint32(this._offset);
        this._offset += 4;
        return this._array(length);
      case 0xde:
        length = this._view.getUint16(this._offset);
        this._offset += 2;
        return this._map(length);
      case 0xdf:
        length = this._view.getUint32(this._offset);
        this._offset += 4;
        return this._map(length);
    }
    throw new Error('Could not parse');
  };
  return _createClass(Decoder, [{
    key: "offset",
    get: function get() {
      return this._offset;
    }
  }]);
}();
function utf8Read(view, offset, length) {
  var string = '';
  var chr = 0;
  for (var i = offset, end = offset + length; i < end; i++) {
    var _byte = view.getUint8(i);
    if ((_byte & 0x80) === 0x00) {
      string += String.fromCharCode(_byte);
      continue;
    }
    if ((_byte & 0xe0) === 0xc0) {
      string += String.fromCharCode((_byte & 0x1f) << 6 | view.getUint8(++i) & 0x3f);
      continue;
    }
    if ((_byte & 0xf0) === 0xe0) {
      string += String.fromCharCode((_byte & 0x0f) << 12 | (view.getUint8(++i) & 0x3f) << 6 | (view.getUint8(++i) & 0x3f) << 0);
      continue;
    }
    if ((_byte & 0xf8) === 0xf0) {
      chr = (_byte & 0x07) << 18 | (view.getUint8(++i) & 0x3f) << 12 | (view.getUint8(++i) & 0x3f) << 6 | (view.getUint8(++i) & 0x3f) << 0;
      if (chr >= 0x010000) {
        chr -= 0x010000;
        string += String.fromCharCode((chr >>> 10) + 0xD800, (chr & 0x3FF) + 0xDC00);
      } else {
        string += String.fromCharCode(chr);
      }
      continue;
    }
    throw new Error("Invalid byte " + _byte.toString(16));
  }
  return string;
}
function notepackDecode(buffer) {
  var decoder = new Decoder(buffer);
  var value = decoder.parse();
  if (decoder.offset !== buffer.byteLength) {
    throw new Error(buffer.byteLength - decoder.offset + " trailing bytes");
  }
  return value;
}

var MAGIC = 0x4E4F4343;
var CHUNK_ALIGN_AS = 8;
var CCON = function () {
  function CCON(document, chunks) {
    this._document = document;
    this._chunks = chunks;
  }
  return _createClass(CCON, [{
    key: "document",
    get: function get() {
      return this._document;
    }
  }, {
    key: "chunks",
    get: function get() {
      return this._chunks;
    }
  }]);
}();
function decodeCCONBinary(bytes) {
  if (bytes.length < 16) {
    throw new InvalidCCONError(getError(13102));
  }
  var dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  var magic = dataView.getUint32(0, true);
  if (magic !== MAGIC) {
    throw new InvalidCCONError(getError(13100));
  }
  var version = dataView.getUint32(4, true);
  var dataByteLength = dataView.getUint32(8, true);
  if (dataByteLength !== dataView.byteLength) {
    throw new InvalidCCONError(getError(13102));
  }
  var chunksStart = 12;
  var jsonDataLength = dataView.getUint32(chunksStart, true);
  chunksStart += 4;
  var jsonData = new Uint8Array(dataView.buffer, chunksStart + dataView.byteOffset, jsonDataLength);
  chunksStart += jsonDataLength;
  var json;
  try {
    if (version === 1) {
      var jsonString = decodeJson(jsonData);
      json = JSON.parse(jsonString);
    } else if (version === 2) {
      json = notepackDecode(jsonData);
    }
  } catch (err) {
    throw new InvalidCCONError(err);
  }
  var chunks = [];
  while (chunksStart < dataView.byteLength) {
    if (chunksStart % CHUNK_ALIGN_AS !== 0) {
      var padding = CHUNK_ALIGN_AS - chunksStart % CHUNK_ALIGN_AS;
      chunksStart += padding;
    }
    var chunkDataLength = dataView.getUint32(chunksStart, true);
    chunksStart += 4;
    chunks.push(new Uint8Array(dataView.buffer, chunksStart + dataView.byteOffset, chunkDataLength));
    chunksStart += chunkDataLength;
  }
  if (chunksStart !== dataView.byteLength) {
    throw new InvalidCCONError(getError(13102));
  }
  return new CCON(json, chunks);
}
function decodeJson(data) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(data);
  } else if ('Buffer' in globalThis) {
    var _ref = globalThis,
      _Buffer = _ref.Buffer;
    return _Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString();
  } else {
    throw new Error(getError(13104));
  }
}
var InvalidCCONError = function (_Error) {
  function InvalidCCONError() {
    return _Error.apply(this, arguments) || this;
  }
  _inheritsLoose(InvalidCCONError, _Error);
  return InvalidCCONError;
}(_wrapNativeSuper(Error));
(function () {
  function BufferBuilder() {
    this._viewOrPaddings = [];
    this._length = 0;
  }
  var _proto = BufferBuilder.prototype;
  _proto.alignAs = function alignAs(align) {
    if (align !== 0) {
      var remainder = this._length % align;
      if (remainder !== 0) {
        var padding = align - remainder;
        this._viewOrPaddings.push(padding);
        this._length += padding;
        return padding;
      }
    }
    return 0;
  };
  _proto.append = function append(view) {
    var result = this._length;
    this._viewOrPaddings.push(view);
    this._length += view.byteLength;
    return result;
  };
  _proto.get = function get() {
    var result = new Uint8Array(this._length);
    var counter = 0;
    this._viewOrPaddings.forEach(function (viewOrPadding) {
      if (typeof viewOrPadding === 'number') {
        counter += viewOrPadding;
      } else {
        result.set(new Uint8Array(viewOrPadding.buffer, viewOrPadding.byteOffset, viewOrPadding.byteLength), counter);
        counter += viewOrPadding.byteLength;
      }
    });
    return result;
  };
  return _createClass(BufferBuilder, [{
    key: "byteLength",
    get: function get() {
      return this._length;
    }
  }]);
})();
cclegacy.internal.decodeCCONBinary = decodeCCONBinary;
cclegacy.internal.CCON = CCON;

var compileDeserialize = compileDeserializeNative;
var DELIMITER = CCClass.Attr.DELIMETER;
var POSTFIX_TYPE = DELIMITER + "type";
var POSTFIX_DEFAULT = DELIMITER + "default";
var POSTFIX_FORMERLY_SERIALIZED_AS = DELIMITER + "formerlySerializedAs";
function compileDeserializeNative(_self, klass) {
  var fastMode = canBeDeserializedInFastMode(klass);
  var shouldCopyId = isChildClassOf(klass, cclegacy.Node) || isChildClassOf(klass, cclegacy.Component);
  var shouldCopyRawData = false;
  var simpleProps = [];
  var simplePropsToRead = simpleProps;
  var advancedProps = [];
  var advancedPropsToRead = advancedProps;
  var advancedPropsValueType = [];
  (function () {
    var props = klass.__values__;
    shouldCopyRawData = props[props.length - 1] === '_$erialized';
    var attrs = CCClass.Attr.getClassAttrs(klass);
    for (var p = 0; p < props.length; p++) {
      var propName = props[p];
      var propNameToRead = propName;
      if (attrs[propName + POSTFIX_FORMERLY_SERIALIZED_AS]) {
        propNameToRead = attrs[propName + POSTFIX_FORMERLY_SERIALIZED_AS];
      }
      var defaultValue = CCClass.getDefault(attrs[propName + POSTFIX_DEFAULT]);
      var userType = attrs[propName + POSTFIX_TYPE];
      var isPrimitiveTypeInFastMode = false;
      if (fastMode && (defaultValue !== undefined || userType)) {
        isPrimitiveTypeInFastMode = isPrimitivePropertyByDefaultOrType(defaultValue, userType);
      }
      if (isPrimitiveTypeInFastMode) {
        if (propNameToRead !== propName && simplePropsToRead === simpleProps) {
          simplePropsToRead = simpleProps.slice();
        }
        simpleProps.push(propName);
        if (simplePropsToRead !== simpleProps) {
          simplePropsToRead.push(propNameToRead);
        }
      } else {
        if (propNameToRead !== propName && advancedPropsToRead === advancedProps) {
          advancedPropsToRead = advancedProps.slice();
        }
        advancedProps.push(propName);
        if (advancedPropsToRead !== advancedProps) {
          advancedPropsToRead.push(propNameToRead);
        }
        advancedPropsValueType.push(defaultValue instanceof cclegacy.ValueType && defaultValue.constructor);
      }
    }
  })();
  return function (s, o, d, k) {
    for (var i = 0; i < simpleProps.length; ++i) {
      var prop = d[simplePropsToRead[i]];
      if (prop !== undefined) {
        o[simpleProps[i]] = prop;
      }
    }
    for (var _i = 0; _i < advancedProps.length; ++_i) {
      var propName = advancedProps[_i];
      var _prop = d[advancedPropsToRead[_i]];
      if (_prop === undefined) {
        continue;
      }
      if (!fastMode && typeof _prop !== 'object') {
        o[propName] = _prop;
      } else {
        var valueTypeCtor = advancedPropsValueType[_i];
        if (valueTypeCtor) {
          if (fastMode || _prop) {
            s._deserializeFastDefinedObject(o[propName], _prop, valueTypeCtor);
          } else {
            o[propName] = null;
          }
        } else if (_prop) {
          s._deserializeAndAssignField(o, _prop, propName);
        } else {
          o[propName] = null;
        }
      }
    }
    if (shouldCopyId && d._id) {
      o._id = d._id;
    }
    if (shouldCopyRawData) {
      o._$erialized = JSON.parse(JSON.stringify(d));
      s._fillPlainObject(o._$erialized, d);
    }
  };
}
function canBeDeserializedInFastMode(klass) {
  return BUILTIN_CLASSID_RE.test(getClassId(klass));
}
function isPrimitivePropertyByDefaultOrType(defaultValue, userType) {
  if (defaultValue === undefined) {
    return userType instanceof CCClass.Attr.PrimitiveType || userType === ENUM_TAG || userType === BITMASK_TAG;
  } else {
    var defaultType = typeof defaultValue;
    return defaultType === 'string' || defaultType === 'number' || defaultType === 'boolean';
  }
}
var DeserializerPool = function (_js$Pool) {
  function DeserializerPool() {
    return _js$Pool.call(this, function (deserializer) {
      deserializer.clear();
    }, 1) || this;
  }
  _inheritsLoose(DeserializerPool, _js$Pool);
  return DeserializerPool;
}(Pool);
DeserializerPool.prototype.get = function (details, classFinder, reportMissingClass, customEnv, ignoreEditorOnly) {
  var cache = this._get();
  if (cache) {
    cache.reset(details, classFinder, reportMissingClass, customEnv, ignoreEditorOnly);
    return cache;
  } else {
    return new _Deserializer(details, classFinder, reportMissingClass, customEnv, ignoreEditorOnly);
  }
};
var _Deserializer = function () {
  function _Deserializer(result, classFinder, reportMissingClass, customEnv, ignoreEditorOnly) {
    this.deserializedList = [];
    this.deserializedData = null;
    this.result = result;
    this.customEnv = customEnv;
    this._classFinder = classFinder;
    this._reportMissingClass = reportMissingClass;
    this._onDereferenced = classFinder == null ? void 0 : classFinder.onDereferenced;
    {
      this._ignoreEditorOnly = ignoreEditorOnly;
    }
  }
  var _proto = _Deserializer.prototype;
  _proto.reset = function reset(result, classFinder, reportMissingClass, customEnv, ignoreEditorOnly) {
    this.result = result;
    this.customEnv = customEnv;
    this._classFinder = classFinder;
    this._reportMissingClass = reportMissingClass;
    this._onDereferenced = classFinder == null ? void 0 : classFinder.onDereferenced;
    {
      this._ignoreEditorOnly = ignoreEditorOnly;
    }
  };
  _proto.clear = function clear() {
    this.result = null;
    this.customEnv = null;
    this.deserializedList.length = 0;
    this.deserializedData = null;
    this._classFinder = null;
    this._reportMissingClass = null;
    this._onDereferenced = null;
  };
  _proto.deserialize = function deserialize(serializedData) {
    var fromCCON = false;
    var jsonObj;
    if (serializedData instanceof CCON) {
      fromCCON = true;
      jsonObj = serializedData.document;
      if (serializedData.chunks.length > 0) {
        assertIsTrue(serializedData.chunks.length === 1);
        this._mainBinChunk = serializedData.chunks[0];
      }
    } else {
      jsonObj = serializedData;
    }
    this._serializedData = jsonObj;
    this._context = {
      fromCCON: fromCCON
    };
    var serializedRootObject = Array.isArray(jsonObj) ? jsonObj[0] : jsonObj;
    {
      this.deserializedData = this._deserializeObject(serializedRootObject, 0);
    }
    this._serializedData = undefined;
    this._mainBinChunk = undefined;
    this._context = undefined;
    return this.deserializedData;
  };
  _proto._deserializeObject = function _deserializeObject(serialized, globalIndex, owner, propName) {
    switch (serialized.__type__) {
      case 'TypedArray':
        return this._deserializeTypedArrayView(serialized);
      case 'TypedArrayRef':
        return this._deserializeTypedArrayViewRef(serialized);
      default:
        if (serialized.__type__) {
          return this._deserializeTypeTaggedObject(serialized, globalIndex, owner, propName);
        } else if (!Array.isArray(serialized)) {
          return this._deserializePlainObject(serialized);
        } else {
          return this._deserializeArray(serialized);
        }
    }
  };
  _proto._deserializeTypedArrayView = function _deserializeTypedArrayView(value) {
    return globalThis[value.ctor].from(value.array);
  };
  _proto._deserializeTypedArrayViewRef = function _deserializeTypedArrayViewRef(value) {
    var offset = value.offset,
      length = value.length,
      constructorName = value.ctor;
    var obj = new globalThis[constructorName](this._mainBinChunk.buffer, this._mainBinChunk.byteOffset + offset, length);
    return obj;
  };
  _proto._deserializeArray = function _deserializeArray(value) {
    var obj = new Array(value.length);
    var prop;
    for (var i = 0; i < value.length; i++) {
      prop = value[i];
      if (typeof prop === 'object' && prop) {
        var isAssetType = this._deserializeAndAssignField(obj, prop, "" + i);
        if (isAssetType) {
          obj[i] = null;
        }
      } else {
        obj[i] = prop;
      }
    }
    return obj;
  };
  _proto._deserializePlainObject = function _deserializePlainObject(value) {
    var obj = {};
    this._fillPlainObject(obj, value);
    return obj;
  };
  _proto._deserializeTypeTaggedObject = function _deserializeTypeTaggedObject(value, globalIndex, owner, propName) {
    var _this = this;
    var type = value.__type__;
    var klass = this._classFinder(type, value, owner, propName);
    if (!klass) {
      var notReported = this._classFinder === getClassById;
      if (notReported) {
        this._reportMissingClass(type);
      }
      return null;
    }
    var createObject = function createObject(constructor) {
      var obj = new constructor();
      if (globalIndex >= 0) {
        _this.deserializedList[globalIndex] = obj;
      }
      return obj;
    };
    {
      var obj = createObject(klass);
      this._deserializeInto(value, obj, klass);
      return obj;
    }
  };
  _proto._deserializeInto = function _deserializeInto(value, object, constructor, skipCustomized) {
    if (skipCustomized === void 0) {
      skipCustomized = false;
    }
    if (!skipCustomized && object[deserializeTag]) {
      this._runCustomizedDeserialize(value, object, constructor);
      return;
    }
    if (object._deserialize) {
      object._deserialize(value.content, this);
      return;
    }
    if (cclegacy.Class._isCCClass(constructor)) {
      this._deserializeFireClass(object, value, constructor);
    } else {
      this._deserializeFastDefinedObject(object, value, constructor);
    }
  };
  _proto._runCustomizedDeserialize = function _runCustomizedDeserialize(value, object, constructor) {
    var _this2 = this;
    var serializationInput = {
      readProperty: function readProperty(name) {
        var serializedField = value[name];
        if (typeof serializedField !== 'object' || !serializedField) {
          return serializedField;
        } else {
          return _this2._deserializeObjectField(serializedField);
        }
      },
      readThis: function readThis() {
        _this2._deserializeInto(value, object, constructor, true);
      },
      readSuper: function readSuper() {
        var superConstructor = getSuper(constructor);
        if (superConstructor) {
          _this2._deserializeInto(value, object, superConstructor);
        }
      }
    };
    object[deserializeTag](serializationInput, this._context);
  };
  _proto._deserializeFireClass = function _deserializeFireClass(obj, serialized, klass) {
    var deserialize;
    if (klass.hasOwnProperty('__deserialize__')) {
      deserialize = klass.__deserialize__;
    } else {
      deserialize = compileDeserialize(this, klass);
      try {
        if (klass === MissingScript) {
          var props = klass.__values__;
          if (props.length === 0 || props[props.length - 1] !== '_$erialized') {
            errorID(16341);
            errorID(16342, props.join(', '));
          }
          var rawDeserialize = deserialize;
          deserialize = function deserialize(deserializer, object, deserialized, constructor) {
            rawDeserialize(deserializer, object, deserialized, constructor);
            if (!object._$erialized) {
              errorID(16343, JSON.stringify(deserialized));
            }
          };
        }
      } catch (e) {
        errorID(16344, "" + e);
      }
      value(klass, '__deserialize__', deserialize, true);
    }
    deserialize(this, obj, serialized, klass);
  };
  _proto._deserializeAndAssignField = function _deserializeAndAssignField(obj, serializedField, propName) {
    var id = serializedField.__id__;
    if (typeof id === 'number') {
      var field = this.deserializedList[id];
      if (field) {
        obj[propName] = field;
      } else {
        var _this$_onDereferenced;
        var source = this._serializedData[id];
        {
          obj[propName] = this._deserializeObject(source, id, undefined, propName);
        }
        (_this$_onDereferenced = this._onDereferenced) == null ? void 0 : _this$_onDereferenced.call(this, this.deserializedList, id, obj, propName);
      }
    } else {
      var uuid = serializedField.__uuid__;
      if (uuid) {
        var expectedType = serializedField.__expectedType__;
        this.result.push(obj, propName, uuid, expectedType);
      } else {
        obj[propName] = this._deserializeObject(serializedField, -1);
      }
    }
    return false;
  };
  _proto._deserializeObjectField = function _deserializeObjectField(serializedField) {
    var id = serializedField.__id__;
    if (typeof id === 'number') {
      var field = this.deserializedList[id];
      if (field) {
        return field;
      } else {
        var source = this._serializedData[id];
        var _field = this._deserializeObject(source, id, undefined, undefined);
        return _field;
      }
    } else {
      var uuid = serializedField.__uuid__;
      if (uuid) {
        serializedField.__expectedType__;
        throw new Error("Asset reference field serialization is currently not supported in custom serialization.");
      } else {
        return this._deserializeObject(serializedField, -1);
      }
    }
  };
  _proto._fillPlainObject = function _fillPlainObject(instance, serialized) {
    for (var propName in serialized) {
      if (!serialized.hasOwnProperty(propName)) {
        continue;
      }
      var prop = serialized[propName];
      if (typeof prop !== 'object') {
        if (propName !== '__type__') {
          instance[propName] = prop;
        }
      } else if (prop) {
        var isAssetType = this._deserializeAndAssignField(instance, prop, propName);
        if (isAssetType) {
          instance[propName] = null;
        }
      } else {
        instance[propName] = null;
      }
    }
  };
  _proto._deserializeFastDefinedObject = function _deserializeFastDefinedObject(instance, serialized, klass) {
    if (klass === cclegacy.Vec2) {
      instance.x = serialized.x || 0;
      instance.y = serialized.y || 0;
      return;
    } else if (klass === cclegacy.Vec3) {
      instance.x = serialized.x || 0;
      instance.y = serialized.y || 0;
      instance.z = serialized.z || 0;
      return;
    } else if (klass === cclegacy.Color) {
      instance.r = serialized.r || 0;
      instance.g = serialized.g || 0;
      instance.b = serialized.b || 0;
      var a = serialized.a;
      instance.a = a === undefined ? 255 : a;
      return;
    } else if (klass === cclegacy.Size) {
      instance.width = serialized.width || 0;
      instance.height = serialized.height || 0;
      return;
    }
    var attrs = CCClass.Attr.getClassAttrs(klass);
    var props = klass.__values__;
    if (!props) {
      error("Unable to deserialize " + getClassName(klass) + ". " + 'For non-CCClass types, they can only be marked as serializable by `CCClass.fastDefine`.');
    }
    for (var i = 0; i < props.length; i++) {
      var propName = props[i];
      var value = serialized[propName];
      var exists = value !== undefined || serialized.hasOwnProperty(propName);
      if (!exists) {
        value = CCClass.getDefault(attrs[propName + POSTFIX_DEFAULT]);
      }
      if (typeof value !== 'object') {
        instance[propName] = value;
      } else if (value) {
        this._deserializeAndAssignField(instance, value, propName);
      } else {
        instance[propName] = null;
      }
    }
  };
  return _createClass(_Deserializer, [{
    key: "ignoreEditorOnly",
    get: function get() {
      return this._ignoreEditorOnly;
    }
  }]);
}();
_Deserializer.pool = new DeserializerPool();
function deserializeDynamic(data, details, options) {
  var _options$reportMissin;
  options = options || {};
  var classFinder = options.classFinder || getClassById;
  var createAssetRefs = options.createAssetRefs || sys.platform === Platform.EDITOR_CORE;
  var customEnv = options.customEnv;
  var ignoreEditorOnly = options.ignoreEditorOnly;
  var reportMissingClass = (_options$reportMissin = options.reportMissingClass) !== null && _options$reportMissin !== void 0 ? _options$reportMissin : cclegacy.deserialize.reportMissingClass;
  details.init();
  var deserializer = _Deserializer.pool.get(details, classFinder, reportMissingClass, customEnv, ignoreEditorOnly);
  cclegacy.game._isCloning = true;
  var res = deserializer.deserialize(data);
  cclegacy.game._isCloning = false;
  _Deserializer.pool.put(deserializer);
  if (createAssetRefs) {
    details.assignAssetsBy(function (uuid, options) {
      return EditorExtends.serialize.asAsset(uuid, options.type);
    });
  }
  return res;
}
function parseUuidDependenciesDynamic(serialized) {
  var depends = [];
  var _parseDependRecursively = function parseDependRecursively(data, out) {
    if (!data || typeof data !== 'object' || typeof data.__id__ === 'number') {
      return;
    }
    var uuid = data.__uuid__;
    if (Array.isArray(data)) {
      for (var i = 0, l = data.length; i < l; i++) {
        _parseDependRecursively(data[i], out);
      }
    } else if (uuid) {
      out.push(uuid);
    } else {
      for (var prop in data) {
        _parseDependRecursively(data[prop], out);
      }
    }
  };
  _parseDependRecursively(serialized, depends);
  return depends;
}

function reportMissingClass(id) {
  {
    errorID(5302, id);
  }
}

var constructorMap = [Vec2, Vec3, Vec4, Quat, Color, Size, Rect, Mat4];
function vec4LikeSetter(obj, data) {
  obj.x = data[1];
  obj.y = data[2];
  obj.z = data[3];
  obj.w = data[4];
}
var setterMap = [function (obj, data) {
  obj.x = data[1];
  obj.y = data[2];
}, function (obj, data) {
  obj.x = data[1];
  obj.y = data[2];
  obj.z = data[3];
}, vec4LikeSetter, vec4LikeSetter, function (obj, data) {
  Color.fromUint32(obj, data[1]);
}, function (obj, data) {
  obj.width = data[1];
  obj.height = data[2];
}, function (obj, data) {
  obj.x = data[1];
  obj.y = data[2];
  obj.width = data[3];
  obj.height = data[4];
}, function (obj, data) {
  Mat4.fromArray(obj, data, 1);
}];
function deserializeBuiltinValueType(data, owner, key, value) {
  var typeIndex = value[0];
  assertIsTrue(typeIndex >= 0 && typeIndex < constructorMap.length);
  var object = new constructorMap[typeIndex]();
  var setter = setterMap[typeIndex];
  setter(object, value);
  owner[key] = object;
}
function deserializeBuiltinValueTypeInto(data, owner, key, value) {
  var typeIndex = value[0];
  assertIsTrue(typeIndex >= 0 && typeIndex < constructorMap.length);
  {
    var object = owner[key];
    var _setter = setterMap[typeIndex];
    _setter(object, value);
  }
}

var SUPPORT_MIN_FORMAT_VERSION = 1;
var EMPTY_PLACEHOLDER = 0;
var DataTypeID = {
  SimpleType: 0,
  InstanceRef: 1,
  Array_InstanceRef: 2,
  Array_AssetRefByInnerObj: 3,
  Class: 4,
  ValueTypeCreated: 5,
  AssetRefByInnerObj: 6,
  TRS: 7,
  ValueType: 8,
  Array_Class: 9,
  CustomizedClass: 10,
  Dict: 11,
  Array: 12,
  ARRAY_LENGTH: 13
};
var CLASS_TYPE = 0;
var CLASS_KEYS = 1;
var CLASS_PROP_TYPE_OFFSET = 2;
var MASK_CLASS = 0;
var OBJ_DATA_MASK = 0;
var CUSTOM_OBJ_DATA_CLASS = 0;
var CUSTOM_OBJ_DATA_CONTENT = 1;
var DICT_JSON_LAYOUT = 0;
var ARRAY_ITEM_VALUES = 0;
var Refs = {
  EACH_RECORD_LENGTH: 3,
  KEY_OFFSET: 1,
  TARGET_OFFSET: 2
};
var File = {
  Version: 0,
  Context: 0,
  SharedUuids: 1,
  SharedStrings: 2,
  SharedClasses: 3,
  SharedMasks: 4,
  Instances: 5,
  InstanceTypes: 6,
  Refs: 7,
  DependObjs: 8,
  DependKeys: 9,
  DependUuidIndices: 10};
var PACKED_SECTIONS = File.Instances;
var Details = function () {
  function Details() {
    this.uuidObjList = null;
    this.uuidPropList = null;
    this.uuidList = null;
    this.uuidTypeList = [];
  }
  var _proto = Details.prototype;
  _proto.init = function init(data) {
    if (data) {
      this.uuidObjList = data[File.DependObjs];
      this.uuidPropList = data[File.DependKeys];
      this.uuidList = data[File.DependUuidIndices];
    } else {
      var used = this.uuidList;
      if (!used) {
        this.uuidList = [];
        this.uuidObjList = [];
        this.uuidPropList = [];
        this.uuidTypeList = [];
      }
    }
  };
  _proto.reset = function reset() {
    {
      var used = this.uuidList;
      if (used) {
        this.uuidList.length = 0;
        this.uuidObjList.length = 0;
        this.uuidPropList.length = 0;
        this.uuidTypeList.length = 0;
      }
    }
  };
  _proto.push = function push(obj, propName, uuid, type) {
    this.uuidObjList.push(obj);
    this.uuidPropList.push(propName);
    this.uuidList.push(uuid);
    this.uuidTypeList.push(type || '');
  };
  return Details;
}();
Details.pool = new Pool(function (obj) {
  obj.reset();
}, 5);
Details.pool.get = function () {
  return this._get() || new Details();
};
function dereference(refs, instances, strings) {
  var dataLength = refs.length - 1;
  var i = 0;
  var instanceOffset = refs[dataLength] * Refs.EACH_RECORD_LENGTH;
  for (; i < instanceOffset; i += Refs.EACH_RECORD_LENGTH) {
    var _owner = refs[i];
    var target = instances[refs[i + Refs.TARGET_OFFSET]];
    var keyIndex = refs[i + Refs.KEY_OFFSET];
    if (keyIndex >= 0) {
      _owner[strings[keyIndex]] = target;
    } else {
      _owner[~keyIndex] = target;
    }
  }
  for (; i < dataLength; i += Refs.EACH_RECORD_LENGTH) {
    var _owner2 = instances[refs[i]];
    var _target = instances[refs[i + Refs.TARGET_OFFSET]];
    var _keyIndex = refs[i + Refs.KEY_OFFSET];
    if (_keyIndex >= 0) {
      _owner2[strings[_keyIndex]] = _target;
    } else {
      _owner2[~_keyIndex] = _target;
    }
  }
}
function deserializeCCObject(data, objectData) {
  var mask = data[File.SharedMasks][objectData[OBJ_DATA_MASK]];
  var clazz = mask[MASK_CLASS];
  var ctor = clazz[CLASS_TYPE];
  var obj = new ctor();
  var keys = clazz[CLASS_KEYS];
  var classTypeOffset = clazz[CLASS_PROP_TYPE_OFFSET];
  var maskTypeOffset = mask[mask.length - 1];
  var i = MASK_CLASS + 1;
  for (; i < maskTypeOffset; ++i) {
    var _key = keys[mask[i]];
    obj[_key] = objectData[i];
  }
  for (; i < objectData.length; ++i) {
    var _key2 = keys[mask[i]];
    var type = clazz[mask[i] + classTypeOffset];
    var op = ASSIGNMENTS[type];
    op(data, obj, _key2, objectData[i]);
  }
  return obj;
}
function deserializeCustomCCObject(data, ctor, value) {
  var obj = new ctor();
  if (obj._deserialize) {
    obj._deserialize(value, data[File.Context]);
  } else {
    errorID(5303, getClassName(ctor));
  }
  return obj;
}
function assignSimple(data, owner, key, value) {
  owner[key] = value;
}
function assignInstanceRef(data, owner, key, value) {
  if (value >= 0) {
    owner[key] = data[File.Instances][value];
  } else {
    data[File.Refs][~value * Refs.EACH_RECORD_LENGTH] = owner;
  }
}
function genArrayParser(parser) {
  return function (data, owner, key, value) {
    for (var i = 0; i < value.length; ++i) {
      parser(data, value, i, value[i]);
    }
    owner[key] = value;
  };
}
function parseAssetRefByInnerObj(data, owner, key, value) {
  owner[key] = null;
  data[File.DependObjs][value] = owner;
}
function parseClass(data, owner, key, value) {
  owner[key] = deserializeCCObject(data, value);
}
function parseCustomClass(data, owner, key, value) {
  var ctor = data[File.SharedClasses][value[CUSTOM_OBJ_DATA_CLASS]];
  owner[key] = deserializeCustomCCObject(data, ctor, value[CUSTOM_OBJ_DATA_CONTENT]);
}
function parseTRS(data, owner, key, value) {
  var typedArray = owner[key];
  typedArray.set(value);
}
function parseDict(data, owner, key, value) {
  var dict = value[DICT_JSON_LAYOUT];
  owner[key] = dict;
  for (var i = DICT_JSON_LAYOUT + 1; i < value.length; i += 3) {
    var subKey = value[i];
    var subType = value[i + 1];
    var subValue = value[i + 2];
    var op = ASSIGNMENTS[subType];
    op(data, dict, subKey, subValue);
  }
}
function parseArray(data, owner, key, value) {
  var array = value[ARRAY_ITEM_VALUES];
  for (var i = 0; i < array.length; ++i) {
    var subValue = array[i];
    var type = value[i + 1];
    if (type !== DataTypeID.SimpleType) {
      var op = ASSIGNMENTS[type];
      op(data, array, i, subValue);
    }
  }
  owner[key] = array;
}
var ASSIGNMENTS = new Array(DataTypeID.ARRAY_LENGTH);
ASSIGNMENTS[DataTypeID.SimpleType] = assignSimple;
ASSIGNMENTS[DataTypeID.InstanceRef] = assignInstanceRef;
ASSIGNMENTS[DataTypeID.Array_InstanceRef] = genArrayParser(assignInstanceRef);
ASSIGNMENTS[DataTypeID.Array_AssetRefByInnerObj] = genArrayParser(parseAssetRefByInnerObj);
ASSIGNMENTS[DataTypeID.Class] = parseClass;
ASSIGNMENTS[DataTypeID.ValueTypeCreated] = deserializeBuiltinValueTypeInto;
ASSIGNMENTS[DataTypeID.AssetRefByInnerObj] = parseAssetRefByInnerObj;
ASSIGNMENTS[DataTypeID.TRS] = parseTRS;
ASSIGNMENTS[DataTypeID.ValueType] = deserializeBuiltinValueType;
ASSIGNMENTS[DataTypeID.Array_Class] = genArrayParser(parseClass);
ASSIGNMENTS[DataTypeID.CustomizedClass] = parseCustomClass;
ASSIGNMENTS[DataTypeID.Dict] = parseDict;
ASSIGNMENTS[DataTypeID.Array] = parseArray;
function parseInstances(data) {
  var instances = data[File.Instances];
  var instanceTypes = data[File.InstanceTypes];
  var instanceTypesLen = instanceTypes === EMPTY_PLACEHOLDER ? 0 : instanceTypes.length;
  var rootIndex = instances[instances.length - 1];
  var normalObjectCount = instances.length - instanceTypesLen;
  if (typeof rootIndex !== 'number') {
    rootIndex = 0;
  } else {
    if (rootIndex < 0) {
      rootIndex = ~rootIndex;
    }
    --normalObjectCount;
  }
  var insIndex = 0;
  for (; insIndex < normalObjectCount; ++insIndex) {
    instances[insIndex] = deserializeCCObject(data, instances[insIndex]);
  }
  var classes = data[File.SharedClasses];
  for (var typeIndex = 0; typeIndex < instanceTypesLen; ++typeIndex, ++insIndex) {
    var type = instanceTypes[typeIndex];
    var eachData = instances[insIndex];
    if (type >= 0) {
      var ctor = classes[type];
      instances[insIndex] = deserializeCustomCCObject(data, ctor, eachData);
    } else {
      type = ~type;
      var op = ASSIGNMENTS[type];
      op(data, instances, insIndex, eachData);
    }
  }
  return rootIndex;
}
function getMissingClass(hasCustomFinder, type, reportMissingClass) {
  if (!hasCustomFinder) {
    reportMissingClass(type);
  }
  return Object;
}
function doLookupClass(classFinder, type, container, index, silent, hasCustomFinder, reportMissingClass) {
  var klass = classFinder(type);
  if (!klass) {
    if (silent) {
      container[index] = function (c, i, t) {
        return function proxy() {
          var actualClass = classFinder(t) || getMissingClass(hasCustomFinder, t, reportMissingClass);
          c[i] = actualClass;
          return new actualClass();
        };
      }(container, index, type);
      return;
    } else {
      klass = getMissingClass(hasCustomFinder, type, reportMissingClass);
    }
  }
  container[index] = klass;
}
function lookupClasses(data, silent, customFinder, reportMissingClass) {
  var classFinder = customFinder || getClassById;
  var classes = data[File.SharedClasses];
  for (var i = 0; i < classes.length; ++i) {
    var klassLayout = classes[i];
    if (typeof klassLayout !== 'string') {
      {
        if (typeof klassLayout[CLASS_TYPE] === 'function') {
          throw new Error('Can not deserialize the same JSON data again.');
        }
      }
      var type = klassLayout[CLASS_TYPE];
      doLookupClass(classFinder, type, klassLayout, CLASS_TYPE, silent, customFinder, reportMissingClass);
    } else {
      doLookupClass(classFinder, klassLayout, classes, i, silent, customFinder, reportMissingClass);
    }
  }
}
function cacheMasks(data) {
  var masks = data[File.SharedMasks];
  if (masks) {
    var classes = data[File.SharedClasses];
    for (var i = 0; i < masks.length; ++i) {
      var mask = masks[i];
      mask[MASK_CLASS] = classes[mask[MASK_CLASS]];
    }
  }
}
function parseResult(data) {
  var instances = data[File.Instances];
  var sharedStrings = data[File.SharedStrings];
  var dependSharedUuids = data[File.SharedUuids];
  var dependObjs = data[File.DependObjs];
  var dependKeys = data[File.DependKeys];
  var dependUuids = data[File.DependUuidIndices];
  for (var i = 0; i < dependObjs.length; ++i) {
    var obj = dependObjs[i];
    if (typeof obj === 'number') {
      dependObjs[i] = instances[obj];
    }
    var _key3 = dependKeys[i];
    if (typeof _key3 === 'number') {
      if (_key3 >= 0) {
        _key3 = sharedStrings[_key3];
      } else {
        _key3 = ~_key3;
      }
      dependKeys[i] = _key3;
    }
    var uuid = dependUuids[i];
    if (typeof uuid === 'number') {
      dependUuids[i] = dependSharedUuids[uuid];
    }
  }
}
function isCompiledJson(json) {
  if (Array.isArray(json)) {
    var _version = json[0];
    return typeof _version === 'number' || _version instanceof FileInfo;
  } else {
    return false;
  }
}
function initializeDeserializationContext(data, details, options) {
  var _options;
  details.init(data);
  (_options = options) !== null && _options !== void 0 ? _options : options = {};
  var version = data[File.Version];
  var preprocessed = false;
  if (typeof version === 'object') {
    preprocessed = version.preprocessed;
    version = version.version;
  }
  if (version < SUPPORT_MIN_FORMAT_VERSION) {
    throw new Error(getError(5304, version));
  }
  var context = options;
  context._version = version;
  context.result = details;
  data[File.Context] = context;
  if (!preprocessed) {
    var _options$reportMissin;
    lookupClasses(data, false, options.classFinder, (_options$reportMissin = options.reportMissingClass) !== null && _options$reportMissin !== void 0 ? _options$reportMissin : deserialize.reportMissingClass);
    cacheMasks(data);
  }
}
function deserialize(data, details, options) {
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  var isBorrowedDetails = false;
  if (!details) {
    var borrowedDetails = Details.pool.get();
    assertIsTrue(borrowedDetails, "Can not allocate deserialization details");
    details = borrowedDetails;
    isBorrowedDetails = true;
  }
  var res;
  if (!isCompiledJson(data)) {
    res = deserializeDynamic(data, details, options);
  } else {
    initializeDeserializationContext(data, details, options);
    var runtimeData = data;
    cclegacy.game._isCloning = true;
    var instances = runtimeData[File.Instances];
    var rootIndex = parseInstances(runtimeData);
    cclegacy.game._isCloning = false;
    if (runtimeData[File.Refs]) {
      dereference(runtimeData[File.Refs], instances, runtimeData[File.SharedStrings]);
    }
    parseResult(runtimeData);
    res = instances[rootIndex];
  }
  if (isBorrowedDetails) {
    Details.pool.put(details);
  }
  return res;
}
deserialize.Details = Details;
deserialize.reportMissingClass = reportMissingClass;
var FileInfo = function FileInfo(version) {
  this.preprocessed = true;
  this.version = version;
};
function unpackJSONs(data, classFinder, reportMissingClass) {
  if (data[File.Version] < SUPPORT_MIN_FORMAT_VERSION) {
    throw new Error(getError(5304, data[File.Version]));
  }
  lookupClasses(data, true, classFinder, deserialize.reportMissingClass);
  cacheMasks(data);
  var version = new FileInfo(data[File.Version]);
  var sharedUuids = data[File.SharedUuids];
  var sharedStrings = data[File.SharedStrings];
  var sharedClasses = data[File.SharedClasses];
  var sharedMasks = data[File.SharedMasks];
  var sections = data[PACKED_SECTIONS];
  for (var i = 0; i < sections.length; ++i) {
    var section = sections[i];
    section.unshift(version, sharedUuids, sharedStrings, sharedClasses, sharedMasks);
  }
  return sections;
}
function packCustomObjData(type, data, hasNativeDep) {
  return [SUPPORT_MIN_FORMAT_VERSION, EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER, [type], EMPTY_PLACEHOLDER, hasNativeDep ? [data, -1] : [data], [0], EMPTY_PLACEHOLDER, [], [], []];
}
function hasNativeDep(data) {
  var instances = data[File.Instances];
  var rootInfo = instances[instances.length - 1];
  if (typeof rootInfo !== 'number') {
    return false;
  } else {
    return rootInfo < 0;
  }
}
function getDependUuidList(json) {
  var sharedUuids = json[File.SharedUuids];
  return json[File.DependUuidIndices].map(function (index) {
    return sharedUuids[index];
  });
}
function parseUuidDependencies(serialized) {
  if (isCompiledJson(serialized)) {
    return getDependUuidList(serialized);
  } else {
    return parseUuidDependenciesDynamic(serialized);
  }
}
{
  deserialize.isCompiledJson = isCompiledJson;
}
cclegacy.deserialize = deserialize;

var dependMap = new WeakMap();
var nativeDependMap = new WeakSet();
var onLoadedInvokedMap = new WeakSet();

function deserializeAsset(json, options) {
  var classFinder;
  {
    classFinder = MissingScript.safeFindClass;
  }
  var tdInfo = Details.pool.get();
  var asset;
  try {
    asset = deserialize(json, tdInfo, {
      classFinder: classFinder,
      customEnv: options
    });
  } catch (e) {
    error(e);
    Details.pool.put(tdInfo);
    throw e;
  }
  asset._uuid = options.__uuid__ || '';
  var uuidList = tdInfo.uuidList;
  var objList = tdInfo.uuidObjList;
  var propList = tdInfo.uuidPropList;
  var typeList = tdInfo.uuidTypeList || [];
  var depends = [];
  for (var i = 0; i < uuidList.length; i++) {
    var dependUuid = uuidList[i];
    depends[i] = {
      uuid: decodeUuid(dependUuid),
      owner: objList[i],
      prop: propList[i],
      type: getClassById(typeList[i])
    };
  }
  dependMap.set(asset, depends);
  if (asset._native) {
    nativeDependMap.add(asset);
  }
  Details.pool.put(tdInfo);
  return asset;
}

var DependUtil = function () {
  function DependUtil() {
    this._depends = new Cache();
  }
  var _proto = DependUtil.prototype;
  _proto.init = function init() {
    this._depends.clear();
  };
  _proto.getNativeDep = function getNativeDep(uuid) {
    var depend = this._depends.get(uuid);
    if (depend && depend.nativeDep) {
      return _extends({}, depend.nativeDep);
    }
    return null;
  };
  _proto.getDeps = function getDeps(uuid) {
    if (this._depends.has(uuid)) {
      return this._depends.get(uuid).deps;
    }
    return [];
  };
  _proto.getDepsRecursively = function getDepsRecursively(uuid) {
    var exclude = Object.create(null);
    var depends = [];
    this._descend(uuid, exclude, depends);
    return depends;
  };
  _proto.remove = function remove(uuid) {
    this._depends.remove(uuid);
  };
  _proto.parse = function parse(uuid, json) {
    var out = null;
    if (Array.isArray(json) || json.__type__ || json instanceof CCON) {
      if (this._depends.has(uuid)) {
        return this._depends.get(uuid);
      }
      if (Array.isArray(json) && (!(isCompiledJson(json)) || !hasNativeDep(json))) {
        out = {
          deps: this._parseDepsFromJson(json)
        };
      } else {
        try {
          var asset = deserializeAsset(json, {
            __uuid__: uuid
          });
          out = this._parseDepsFromAsset(asset);
          if (out.nativeDep) {
            out.nativeDep.uuid = uuid;
          }
          parsed.add(uuid + "@import", asset);
        } catch (e) {
          files.remove(uuid + "@import");
          out = {
            deps: []
          };
        }
      }
    } else {
      if (this._depends.has(uuid)) {
        out = this._depends.get(uuid);
        if (out.parsedFromExistAsset) {
          return out;
        }
      }
      out = this._parseDepsFromAsset(json);
    }
    this._depends.add(uuid, out);
    return out;
  };
  _proto._parseDepsFromAsset = function _parseDepsFromAsset(asset) {
    var out = {
      deps: [],
      parsedFromExistAsset: true
    };
    var deps = dependMap.get(asset);
    assertIsNonNullable(deps);
    for (var i = 0, l = deps.length; i < l; i++) {
      out.deps.push(deps[i].uuid);
    }
    if (nativeDependMap.has(asset)) {
      out.nativeDep = asset._nativeDep;
    }
    return out;
  };
  _proto._parseDepsFromJson = function _parseDepsFromJson(json) {
    var depends = parseUuidDependencies(json);
    depends.forEach(function (uuid, index) {
      return depends[index] = decodeUuid(uuid);
    });
    return depends;
  };
  _proto._descend = function _descend(uuid, exclude, depends) {
    var deps = this.getDeps(uuid);
    for (var i = 0; i < deps.length; i++) {
      var depend = deps[i];
      if (!exclude[depend]) {
        exclude[depend] = true;
        depends.push(depend);
        this._descend(depend, exclude, depends);
      }
    }
  };
  return _createClass(DependUtil, null, [{
    key: "instance",
    get: function get() {
      if (!this._instance) {
        this._instance = new DependUtil();
      }
      return this._instance;
    }
  }]);
}();
DependUtil._instance = void 0;
var dependUtil = DependUtil.instance;

var _dec$b, _class$b;
var _regions = [new BufferTextureCopy()];
function getMipLevel(width, height) {
  var size = Math.max(width, height);
  var level = 0;
  while (size) {
    size >>= 1;
    level++;
  }
  return level;
}
function isPOT(n) {
  return n && (n & n - 1) === 0;
}
function canGenerateMipmap(device, w, h) {
  var needCheckPOT = device.gfxAPI === API.WEBGL;
  if (needCheckPOT) {
    return isPOT(w) && isPOT(h);
  }
  return true;
}
var SimpleTexture = (_dec$b = ccclass('cc.SimpleTexture'), _dec$b(_class$b = function (_TextureBase) {
  function SimpleTexture(name) {
    var _this;
    _this = _TextureBase.call(this, name) || this;
    _this._gfxTexture = null;
    _this._gfxTextureView = null;
    _this._mipmapLevel = 1;
    _this._textureWidth = 0;
    _this._textureHeight = 0;
    _this._baseLevel = 0;
    _this._maxLevel = 1000;
    return _this;
  }
  _inheritsLoose(SimpleTexture, _TextureBase);
  var _proto = SimpleTexture.prototype;
  _proto.getGFXTexture = function getGFXTexture() {
    return this._gfxTextureView;
  };
  _proto.destroy = function destroy() {
    this._tryDestroyTextureView();
    this._tryDestroyTexture();
    return _TextureBase.prototype.destroy.call(this);
  };
  _proto.updateImage = function updateImage() {
    this.updateMipmaps(0);
  };
  _proto.updateMipmaps = function updateMipmaps(firstLevel, count) {
  };
  _proto.uploadData = function uploadData(source, level, arrayIndex) {
    if (level === void 0) {
      level = 0;
    }
    if (arrayIndex === void 0) {
      arrayIndex = 0;
    }
    if (!this._gfxTexture || this._mipmapLevel <= level) {
      return;
    }
    var gfxDevice = this._getGFXDevice();
    if (!gfxDevice) {
      return;
    }
    var region = _regions[0];
    region.texExtent.width = this._textureWidth >> level;
    region.texExtent.height = this._textureHeight >> level;
    region.texSubres.mipLevel = level;
    region.texSubres.baseArrayLayer = arrayIndex;
    {
      if (source instanceof HTMLElement) {
        if (source.height > region.texExtent.height || source.width > region.texExtent.width) {
          error("Image source(" + this.name + ") bounds override.");
        }
      }
    }
    if (ArrayBuffer.isView(source)) {
      gfxDevice.copyBuffersToTexture([source], this._gfxTexture, _regions);
    } else {
      gfxDevice.copyTexImagesToTexture([source], this._gfxTexture, _regions);
    }
  };
  _proto._assignImage = function _assignImage(image, level, arrayIndex) {
    var data = image.data;
    if (!data) {
      return;
    }
    this.uploadData(data, level, arrayIndex);
    this._checkTextureLoaded();
    if (macro.CLEANUP_IMAGE_CACHE) {
      var deps = dependUtil.getDeps(this._uuid);
      var index = deps.indexOf(image._uuid);
      if (index !== -1) {
        fastRemoveAt(deps, index);
        image.decRef();
      }
    }
  };
  _proto._checkTextureLoaded = function _checkTextureLoaded() {
    this._textureReady();
  };
  _proto._textureReady = function _textureReady() {
    this.loaded = true;
    this.emit('load');
  };
  _proto._setMipmapLevel = function _setMipmapLevel(value) {
    this._mipmapLevel = value < 1 ? 1 : value;
  };
  _proto._setMipRange = function _setMipRange(baseLevel, maxLevel) {
    this._baseLevel = baseLevel < 1 ? 0 : baseLevel;
    this._maxLevel = maxLevel < 1 ? 0 : maxLevel;
  };
  _proto.setMipRange = function setMipRange(baseLevel, maxLevel) {
    assertID(baseLevel <= maxLevel, 3124);
    this._setMipRange(baseLevel, maxLevel);
    var device = this._getGFXDevice();
    if (!device) {
      return;
    }
    var textureView = this._createTextureView(device);
    this._tryDestroyTextureView();
    this._gfxTextureView = textureView;
  };
  _proto._getGfxTextureCreateInfo = function _getGfxTextureCreateInfo(presumed) {
    return null;
  };
  _proto._getGfxTextureViewCreateInfo = function _getGfxTextureViewCreateInfo(presumed) {
    return null;
  };
  _proto._tryReset = function _tryReset() {
    this._tryDestroyTextureView();
    this._tryDestroyTexture();
    if (this._mipmapLevel === 0) {
      return;
    }
    var device = this._getGFXDevice();
    if (!device) {
      return;
    }
    this._createTexture(device);
    this._gfxTextureView = this._createTextureView(device);
  };
  _proto.isUsingOfflineMipmaps = function isUsingOfflineMipmaps() {
    return false;
  };
  _proto._createTexture = function _createTexture(device) {
    if (this._width === 0 || this._height === 0) {
      return;
    }
    var flags = TextureFlagBit.NONE;
    if (this._mipFilter !== TextureFilter.NONE && canGenerateMipmap(device, this._width, this._height)) {
      this._mipmapLevel = getMipLevel(this._width, this._height);
      if (!this.isUsingOfflineMipmaps() && !this.isCompressed) {
        flags = TextureFlagBit.GEN_MIPMAP;
      }
    }
    var textureCreateInfo = this._getGfxTextureCreateInfo({
      usage: TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST | TextureUsageBit.COLOR_ATTACHMENT,
      format: this._getGFXFormat(),
      levelCount: this._mipmapLevel,
      flags: flags
    });
    if (!textureCreateInfo) {
      return;
    }
    var texture = device.createTexture(textureCreateInfo);
    this._textureWidth = textureCreateInfo.width;
    this._textureHeight = textureCreateInfo.height;
    this._gfxTexture = texture;
  };
  _proto._createTextureView = function _createTextureView(device) {
    if (!this._gfxTexture) {
      return null;
    }
    var maxLevel = this._maxLevel < this._mipmapLevel ? this._maxLevel : this._mipmapLevel - 1;
    var textureViewCreateInfo = this._getGfxTextureViewCreateInfo({
      texture: this._gfxTexture,
      format: this._getGFXFormat(),
      baseLevel: this._baseLevel,
      levelCount: maxLevel - this._baseLevel + 1
    });
    if (!textureViewCreateInfo) {
      return null;
    }
    return device.createTexture(textureViewCreateInfo);
  };
  _proto._tryDestroyTexture = function _tryDestroyTexture() {
    if (this._gfxTexture) {
      this._gfxTexture.destroy();
      this._gfxTexture = null;
    }
  };
  _proto._tryDestroyTextureView = function _tryDestroyTextureView() {
    if (this._gfxTextureView) {
      this._gfxTextureView.destroy();
      this._gfxTextureView = null;
    }
  };
  return _createClass(SimpleTexture, [{
    key: "mipmapLevel",
    get: function get() {
      return this._mipmapLevel;
    }
  }]);
}(TextureBase)) || _class$b);
cclegacy.SimpleTexture = SimpleTexture;

var _dec$a, _dec2$4, _class$a, _class2$a, _initializer$9;
var Texture2D = (_dec$a = ccclass('cc.Texture2D'), _dec2$4 = type([ImageAsset]), _dec$a(_class$a = (_class2$a = function (_SimpleTexture) {
  function Texture2D(name) {
    var _this;
    _this = _SimpleTexture.call(this, name) || this;
    _this._mipmaps = _initializer$9 && _initializer$9();
    _this._generatedMipmaps = [];
    return _this;
  }
  _inheritsLoose(Texture2D, _SimpleTexture);
  var _proto = Texture2D.prototype;
  _proto._setMipmapParams = function _setMipmapParams(value) {
    var _this2 = this;
    this._generatedMipmaps = value;
    this._setMipmapLevel(this._generatedMipmaps.length);
    if (this._generatedMipmaps.length > 0) {
      var imageAsset = this._generatedMipmaps[0];
      this.reset({
        width: imageAsset.width,
        height: imageAsset.height,
        format: imageAsset.format,
        mipmapLevel: this._generatedMipmaps.length,
        baseLevel: this._baseLevel,
        maxLevel: this._maxLevel
      });
      this._generatedMipmaps.forEach(function (mipmap, level) {
        _this2._assignImage(mipmap, level);
      });
    } else {
      this.reset({
        width: 0,
        height: 0,
        mipmapLevel: this._generatedMipmaps.length,
        baseLevel: this._baseLevel,
        maxLevel: this._maxLevel
      });
    }
  };
  _proto.initialize = function initialize() {
    this.mipmaps = this._mipmaps;
  };
  _proto.onLoaded = function onLoaded() {
    this.initialize();
  };
  _proto.reset = function reset(info) {
    this._width = info.width;
    this._height = info.height;
    this._setGFXFormat(info.format);
    var mipLevels = info.mipmapLevel === undefined ? 1 : info.mipmapLevel;
    this._setMipmapLevel(mipLevels);
    var minLod = info.baseLevel === undefined ? 0 : info.baseLevel;
    var maxLod = info.maxLevel === undefined ? 1000 : info.maxLevel;
    this._setMipRange(minLod, maxLod);
    this._tryReset();
  };
  _proto.create = function create(width, height, format, mipmapLevel, baseLevel, maxLevel) {
    if (format === void 0) {
      format = PixelFormat.RGBA8888;
    }
    if (mipmapLevel === void 0) {
      mipmapLevel = 1;
    }
    if (baseLevel === void 0) {
      baseLevel = 0;
    }
    if (maxLevel === void 0) {
      maxLevel = 1000;
    }
    this.reset({
      width: width,
      height: height,
      format: format,
      mipmapLevel: mipmapLevel,
      baseLevel: baseLevel,
      maxLevel: maxLevel
    });
  };
  _proto.toString = function toString() {
    return this._mipmaps.length !== 0 ? this._mipmaps[0].url : '';
  };
  _proto.updateMipmaps = function updateMipmaps(firstLevel, count) {
    if (firstLevel === void 0) {
      firstLevel = 0;
    }
    if (count === void 0) {
      count = undefined;
    }
    if (firstLevel >= this._generatedMipmaps.length) {
      return;
    }
    var nUpdate = Math.min(count === undefined ? this._generatedMipmaps.length : count, this._generatedMipmaps.length - firstLevel);
    for (var i = 0; i < nUpdate; ++i) {
      var level = firstLevel + i;
      this._assignImage(this._generatedMipmaps[level], level);
    }
  };
  _proto.getHtmlElementObj = function getHtmlElementObj() {
    return this._mipmaps[0] && this._mipmaps[0].data instanceof HTMLElement ? this._mipmaps[0].data : null;
  };
  _proto.destroy = function destroy() {
    this._mipmaps = [];
    this._generatedMipmaps = [];
    return _SimpleTexture.prototype.destroy.call(this);
  };
  _proto.description = function description() {
    var url = this._mipmaps[0] ? this._mipmaps[0].url : '';
    return "<cc.Texture2D | Name = " + url + " | Dimension = " + this.width + " x " + this.height + ">";
  };
  _proto.releaseTexture = function releaseTexture() {
    this.destroy();
  };
  _proto._serialize = function _serialize(ctxForExporting) {
    return null;
  };
  _proto._deserialize = function _deserialize(serializedData, handle) {
    var data = serializedData;
    _SimpleTexture.prototype._deserialize.call(this, data.base, handle);
    this._mipmaps = new Array(data.mipmaps.length);
    for (var i = 0; i < data.mipmaps.length; ++i) {
      this._mipmaps[i] = new ImageAsset();
      if (!data.mipmaps[i]) {
        continue;
      }
      var mipmapUUID = data.mipmaps[i];
      handle.result.push(this._mipmaps, "" + i, mipmapUUID, getClassId(ImageAsset));
    }
  };
  _proto._getGfxTextureCreateInfo = function _getGfxTextureCreateInfo(presumed) {
    var texInfo = new TextureInfo(TextureType.TEX2D);
    texInfo.width = this._width;
    texInfo.height = this._height;
    Object.assign(texInfo, presumed);
    return texInfo;
  };
  _proto._getGfxTextureViewCreateInfo = function _getGfxTextureViewCreateInfo(presumed) {
    var texViewInfo = new TextureViewInfo();
    texViewInfo.type = TextureType.TEX2D;
    Object.assign(texViewInfo, presumed);
    return texViewInfo;
  };
  _proto.initDefault = function initDefault(uuid) {
    _SimpleTexture.prototype.initDefault.call(this, uuid);
    var imageAsset = new ImageAsset();
    imageAsset.initDefault();
    this.image = imageAsset;
  };
  _proto.validate = function validate() {
    return this.mipmaps && this.mipmaps.length !== 0;
  };
  return _createClass(Texture2D, [{
    key: "mipmaps",
    get: function get() {
      return this._mipmaps;
    },
    set: function set(value) {
      this._mipmaps = value;
      var mipmaps = [];
      if (value.length === 1) {
        var image = value[0];
        mipmaps.push.apply(mipmaps, image.extractMipmaps());
      } else if (value.length > 1) {
        for (var i = 0; i < value.length; ++i) {
          var _image = value[i];
          mipmaps.push(_image.extractMipmap0());
        }
      }
      this._setMipmapParams(mipmaps);
    }
  }, {
    key: "image",
    get: function get() {
      return this._mipmaps.length === 0 ? null : this._mipmaps[0];
    },
    set: function set(value) {
      this.mipmaps = value ? [value] : [];
    }
  }]);
}(SimpleTexture), _initializer$9 = applyDecoratedInitializer(_class2$a.prototype, "_mipmaps", [_dec2$4], function () {
  return [];
}), _class2$a)) || _class$a);
cclegacy.Texture2D = Texture2D;

var _dec$9, _class$9, _class2$9, _initializer$8, _initializer2$6, _initializer3$5, _initializer4$5, _TextureCube;
var FaceIndex;
(function (FaceIndex) {
  FaceIndex[FaceIndex["right"] = 0] = "right";
  FaceIndex[FaceIndex["left"] = 1] = "left";
  FaceIndex[FaceIndex["top"] = 2] = "top";
  FaceIndex[FaceIndex["bottom"] = 3] = "bottom";
  FaceIndex[FaceIndex["front"] = 4] = "front";
  FaceIndex[FaceIndex["back"] = 5] = "back";
})(FaceIndex || (FaceIndex = {}));
var MipmapMode;
(function (MipmapMode) {
  MipmapMode[MipmapMode["NONE"] = 0] = "NONE";
  MipmapMode[MipmapMode["AUTO"] = 1] = "AUTO";
  MipmapMode[MipmapMode["BAKED_CONVOLUTION_MAP"] = 2] = "BAKED_CONVOLUTION_MAP";
})(MipmapMode || (MipmapMode = {}));
var TextureCube = (_dec$9 = ccclass('cc.TextureCube'), _dec$9(_class$9 = (_class2$9 = (_TextureCube = function (_SimpleTexture) {
  function TextureCube(name) {
    var _this;
    _this = _SimpleTexture.call(this, name) || this;
    _this.isRGBE = _initializer$8 && _initializer$8();
    _this._mipmapAtlas = _initializer2$6 && _initializer2$6();
    _this._mipmapMode = _initializer3$5 && _initializer3$5();
    _this._mipmaps = _initializer4$5 && _initializer4$5();
    _this._generatedMipmaps = [];
    return _this;
  }
  _inheritsLoose(TextureCube, _SimpleTexture);
  var _proto = TextureCube.prototype;
  _proto._setMipmapParams = function _setMipmapParams(value) {
    var _this2 = this;
    this._generatedMipmaps = value;
    this._setMipmapLevel(this._generatedMipmaps.length);
    if (this._generatedMipmaps.length > 0) {
      var imageAsset = this._generatedMipmaps[0].front;
      this.reset({
        width: imageAsset.width,
        height: imageAsset.height,
        format: imageAsset.format,
        mipmapLevel: this._generatedMipmaps.length,
        baseLevel: this._baseLevel,
        maxLevel: this._maxLevel
      });
      this._generatedMipmaps.forEach(function (mipmap, level) {
        _forEachFace(mipmap, function (face, faceIndex) {
          _this2._assignImage(face, level, faceIndex);
        });
      });
    } else {
      this.reset({
        width: 0,
        height: 0,
        mipmapLevel: this._generatedMipmaps.length,
        baseLevel: this._baseLevel,
        maxLevel: this._maxLevel
      });
    }
  };
  _proto.isUsingOfflineMipmaps = function isUsingOfflineMipmaps() {
    return this._mipmapMode === MipmapMode.BAKED_CONVOLUTION_MAP;
  };
  TextureCube.fromTexture2DArray = function fromTexture2DArray(textures, out) {
    var mipmaps = [];
    var nMipmaps = textures.length / 6;
    for (var i = 0; i < nMipmaps; i++) {
      var x = i * 6;
      mipmaps.push({
        front: textures[x + FaceIndex.front].image,
        back: textures[x + FaceIndex.back].image,
        left: textures[x + FaceIndex.left].image,
        right: textures[x + FaceIndex.right].image,
        top: textures[x + FaceIndex.top].image,
        bottom: textures[x + FaceIndex.bottom].image
      });
    }
    out = out || new TextureCube();
    out.mipmaps = mipmaps;
    return out;
  };
  _proto.onLoaded = function onLoaded() {
    if (this._mipmapMode === MipmapMode.BAKED_CONVOLUTION_MAP) {
      this.mipmapAtlas = this._mipmapAtlas;
    } else {
      this.mipmaps = this._mipmaps;
    }
  };
  _proto.reset = function reset(info) {
    this._width = info.width;
    this._height = info.height;
    this._setGFXFormat(info.format);
    var mipLevels = info.mipmapLevel === undefined ? 1 : info.mipmapLevel;
    this._setMipmapLevel(mipLevels);
    var minLod = info.baseLevel === undefined ? 0 : info.baseLevel;
    var maxLod = info.maxLevel === undefined ? 1000 : info.maxLevel;
    this._setMipRange(minLod, maxLod);
    this._tryReset();
  };
  _proto.updateMipmaps = function updateMipmaps(firstLevel, count) {
    var _this3 = this;
    if (firstLevel === void 0) {
      firstLevel = 0;
    }
    if (count === void 0) {
      count = undefined;
    }
    if (firstLevel >= this._generatedMipmaps.length) {
      return;
    }
    var nUpdate = Math.min(count === undefined ? this._generatedMipmaps.length : count, this._generatedMipmaps.length - firstLevel);
    var _loop = function _loop() {
      var level = firstLevel + i;
      _forEachFace(_this3._generatedMipmaps[level], function (face, faceIndex) {
        _this3._assignImage(face, level, faceIndex);
      });
    };
    for (var i = 0; i < nUpdate; ++i) {
      _loop();
    }
  };
  _proto.destroy = function destroy() {
    this._mipmaps = [];
    this._generatedMipmaps = [];
    this._mipmapAtlas = null;
    return _SimpleTexture.prototype.destroy.call(this);
  };
  _proto.releaseTexture = function releaseTexture() {
    this.destroy();
  };
  _proto._serialize = function _serialize(ctxForExporting) {
    return null;
  };
  _proto._deserialize = function _deserialize(serializedData, handle) {
    var data = serializedData;
    _SimpleTexture.prototype._deserialize.call(this, data.base, handle);
    this.isRGBE = data.rgbe;
    this._mipmapMode = data.mipmapMode;
    if (this._mipmapMode === MipmapMode.BAKED_CONVOLUTION_MAP) {
      var mipmapAtlas = data.mipmapAtlas;
      var mipmapLayout = data.mipmapLayout;
      this._mipmapAtlas = {
        atlas: {},
        layout: mipmapLayout
      };
      this._mipmapAtlas.atlas = {
        front: new ImageAsset(),
        back: new ImageAsset(),
        left: new ImageAsset(),
        right: new ImageAsset(),
        top: new ImageAsset(),
        bottom: new ImageAsset()
      };
      var imageAssetClassId = getClassId(ImageAsset);
      handle.result.push(this._mipmapAtlas.atlas, "front", mipmapAtlas.front, imageAssetClassId);
      handle.result.push(this._mipmapAtlas.atlas, "back", mipmapAtlas.back, imageAssetClassId);
      handle.result.push(this._mipmapAtlas.atlas, "left", mipmapAtlas.left, imageAssetClassId);
      handle.result.push(this._mipmapAtlas.atlas, "right", mipmapAtlas.right, imageAssetClassId);
      handle.result.push(this._mipmapAtlas.atlas, "top", mipmapAtlas.top, imageAssetClassId);
      handle.result.push(this._mipmapAtlas.atlas, "bottom", mipmapAtlas.bottom, imageAssetClassId);
    } else {
      this._mipmaps = new Array(data.mipmaps.length);
      for (var i = 0; i < data.mipmaps.length; ++i) {
        this._mipmaps[i] = {
          front: new ImageAsset(),
          back: new ImageAsset(),
          left: new ImageAsset(),
          right: new ImageAsset(),
          top: new ImageAsset(),
          bottom: new ImageAsset()
        };
        var mipmap = data.mipmaps[i];
        var _imageAssetClassId = getClassId(ImageAsset);
        handle.result.push(this._mipmaps[i], "front", mipmap.front, _imageAssetClassId);
        handle.result.push(this._mipmaps[i], "back", mipmap.back, _imageAssetClassId);
        handle.result.push(this._mipmaps[i], "left", mipmap.left, _imageAssetClassId);
        handle.result.push(this._mipmaps[i], "right", mipmap.right, _imageAssetClassId);
        handle.result.push(this._mipmaps[i], "top", mipmap.top, _imageAssetClassId);
        handle.result.push(this._mipmaps[i], "bottom", mipmap.bottom, _imageAssetClassId);
      }
    }
  };
  _proto._getGfxTextureCreateInfo = function _getGfxTextureCreateInfo(presumed) {
    var texInfo = new TextureInfo(TextureType.CUBE);
    texInfo.width = this._width;
    texInfo.height = this._height;
    texInfo.layerCount = 6;
    Object.assign(texInfo, presumed);
    return texInfo;
  };
  _proto._getGfxTextureViewCreateInfo = function _getGfxTextureViewCreateInfo(presumed) {
    var texViewInfo = new TextureViewInfo();
    texViewInfo.type = TextureType.CUBE;
    texViewInfo.baseLayer = 0;
    texViewInfo.layerCount = 6;
    Object.assign(texViewInfo, presumed);
    return texViewInfo;
  };
  _proto._uploadAtlas = function _uploadAtlas() {
    var _this4 = this;
    var layout = this._mipmapAtlas.layout;
    var mip0Layout = layout[0];
    this.reset({
      width: mip0Layout.width,
      height: mip0Layout.height,
      format: this._mipmapAtlas.atlas.front.format,
      mipmapLevel: layout.length
    });
    _forEachFace(this._mipmapAtlas.atlas, function (face, faceIndex) {
      var tex = new Texture2D();
      tex.image = face;
      tex.reset({
        width: face.width,
        height: face.height,
        format: face.format
      });
      tex.uploadData(face.data);
      for (var i = 0; i < layout.length; i++) {
        var layoutInfo = layout[i];
        var size = tex.getGFXTexture().size;
        var buffer = new Uint8Array(size);
        var region = new BufferTextureCopy();
        region.texOffset.x = layoutInfo.left;
        region.texOffset.y = layoutInfo.top;
        region.texExtent.width = layoutInfo.width;
        region.texExtent.height = layoutInfo.height;
        _this4._getGFXDevice().copyTextureToBuffers(tex.getGFXTexture(), [buffer], [region]);
        var bufferAsset = new ImageAsset({
          _data: buffer,
          _compressed: face.isCompressed,
          width: layoutInfo.width,
          height: layoutInfo.height,
          format: face.format
        });
        _this4._assignImage(bufferAsset, layoutInfo.level, faceIndex);
      }
    });
  };
  _proto.initDefault = function initDefault(uuid) {
    _SimpleTexture.prototype.initDefault.call(this, uuid);
    var imageAsset = new ImageAsset();
    imageAsset.initDefault();
    this.mipmaps = [{
      front: imageAsset,
      back: imageAsset,
      top: imageAsset,
      bottom: imageAsset,
      left: imageAsset,
      right: imageAsset
    }];
  };
  _proto.validate = function validate() {
    if (this._mipmapMode === MipmapMode.BAKED_CONVOLUTION_MAP) {
      if (this.mipmapAtlas === null || this.mipmapAtlas.layout.length === 0) {
        return false;
      }
      var atlas = this.mipmapAtlas.atlas;
      return !!(atlas.top && atlas.bottom && atlas.front && atlas.back && atlas.left && atlas.right);
    } else {
      return this._mipmaps.length !== 0 && !this._mipmaps.find(function (x) {
        return !(x.top && x.bottom && x.front && x.back && x.left && x.right);
      });
    }
  };
  return _createClass(TextureCube, [{
    key: "mipmaps",
    get: function get() {
      return this._mipmaps;
    },
    set: function set(value) {
      this._mipmaps = value;
      var cubeMaps = [];
      if (value.length === 1) {
        var cubeMipmap = value[0];
        var front = cubeMipmap.front.extractMipmaps();
        var back = cubeMipmap.back.extractMipmaps();
        var left = cubeMipmap.left.extractMipmaps();
        var right = cubeMipmap.right.extractMipmaps();
        var top = cubeMipmap.top.extractMipmaps();
        var bottom = cubeMipmap.bottom.extractMipmaps();
        if (front.length !== back.length || front.length !== left.length || front.length !== right.length || front.length !== top.length || front.length !== bottom.length) {
          errorID(16347);
          this._setMipmapParams([]);
          return;
        }
        var level = front.length;
        for (var i = 0; i < level; ++i) {
          var cubeMap = {
            front: front[i],
            back: back[i],
            left: left[i],
            right: right[i],
            top: top[i],
            bottom: bottom[i]
          };
          cubeMaps.push(cubeMap);
        }
      } else if (value.length > 1) {
        value.forEach(function (mipmap) {
          var cubeMap = {
            front: mipmap.front.extractMipmap0(),
            back: mipmap.back.extractMipmap0(),
            left: mipmap.left.extractMipmap0(),
            right: mipmap.right.extractMipmap0(),
            top: mipmap.top.extractMipmap0(),
            bottom: mipmap.bottom.extractMipmap0()
          };
          cubeMaps.push(cubeMap);
        });
      }
      this._setMipmapParams(cubeMaps);
    }
  }, {
    key: "mipmapAtlas",
    get: function get() {
      return this._mipmapAtlas;
    },
    set: function set(value) {
      var _this5 = this;
      this._mipmapAtlas = value;
      if (!this._mipmapAtlas) {
        this.reset({
          width: 0,
          height: 0,
          mipmapLevel: 0
        });
        return;
      }
      var imageAtlasAsset = this._mipmapAtlas.atlas.front;
      if (!imageAtlasAsset.data) {
        return;
      }
      var faceAtlas = this._mipmapAtlas.atlas;
      var layout = this._mipmapAtlas.layout;
      var mip0Layout = layout[0];
      var ctx = Object.assign(ccwindow.document.createElement('canvas'), {
        width: imageAtlasAsset.width,
        height: imageAtlasAsset.height
      }).getContext('2d');
      this.reset({
        width: mip0Layout.width,
        height: mip0Layout.height,
        format: imageAtlasAsset.format,
        mipmapLevel: layout.length
      });
      var _loop2 = function _loop2() {
        var layoutInfo = layout[j];
        _forEachFace(faceAtlas, function (face, faceIndex) {
          ctx.clearRect(0, 0, imageAtlasAsset.width, imageAtlasAsset.height);
          var drawImg = face.data;
          ctx.drawImage(drawImg, 0, 0);
          var rawData = ctx.getImageData(layoutInfo.left, layoutInfo.top, layoutInfo.width, layoutInfo.height);
          var bufferAsset = new ImageAsset({
            _data: rawData.data,
            _compressed: face.isCompressed,
            width: rawData.width,
            height: rawData.height,
            format: face.format
          });
          _this5._assignImage(bufferAsset, layoutInfo.level, faceIndex);
        });
      };
      for (var j = 0; j < layout.length; j++) {
        _loop2();
      }
    }
  }, {
    key: "image",
    get: function get() {
      return this._mipmaps.length === 0 ? null : this._mipmaps[0];
    },
    set: function set(value) {
      this.mipmaps = value ? [value] : [];
    }
  }]);
}(SimpleTexture), _TextureCube.FaceIndex = FaceIndex, _TextureCube), _initializer$8 = applyDecoratedInitializer(_class2$9.prototype, "isRGBE", [serializable], function () {
  return false;
}), _initializer2$6 = applyDecoratedInitializer(_class2$9.prototype, "_mipmapAtlas", [serializable], function () {
  return null;
}), _initializer3$5 = applyDecoratedInitializer(_class2$9.prototype, "_mipmapMode", [serializable], function () {
  return MipmapMode.NONE;
}), _initializer4$5 = applyDecoratedInitializer(_class2$9.prototype, "_mipmaps", [serializable], function () {
  return [];
}), _class2$9)) || _class$9);
legacyCC.TextureCube = TextureCube;
function _forEachFace(mipmap, callback) {
  callback(mipmap.front, FaceIndex.front);
  callback(mipmap.back, FaceIndex.back);
  callback(mipmap.left, FaceIndex.left);
  callback(mipmap.right, FaceIndex.right);
  callback(mipmap.top, FaceIndex.top);
  callback(mipmap.bottom, FaceIndex.bottom);
}

var isMatchByWord = function isMatchByWord(path, test) {
  if (path.length > test.length) {
    var nextAscii = path.charCodeAt(test.length);
    return nextAscii === 47;
  }
  return true;
};
var processOptions = function processOptions(options) {
  var uuids = options.uuids;
  var paths = options.paths;
  var types = options.types;
  var bundles = options.deps;
  var realEntries = options.paths = Object.create(null);
  if (options.debug === false) {
    for (var i = 0, l = uuids.length; i < l; i++) {
      uuids[i] = decodeUuid(uuids[i]);
    }
    for (var id in paths) {
      var entry = paths[id];
      var type = entry[1];
      entry[1] = types[type];
    }
  } else {
    var out = Object.create(null);
    for (var _i = 0, _l = uuids.length; _i < _l; _i++) {
      var uuid = uuids[_i];
      uuids[_i] = out[uuid] = decodeUuid(uuid);
    }
    uuids = out;
  }
  for (var _id in paths) {
    var _entry = paths[_id];
    realEntries[uuids[_id]] = _entry;
  }
  var scenes = options.scenes;
  for (var name in scenes) {
    var _uuid = scenes[name];
    scenes[name] = uuids[_uuid];
  }
  var packs = options.packs;
  for (var packId in packs) {
    var packedIds = packs[packId];
    for (var j = 0; j < packedIds.length; ++j) {
      packedIds[j] = uuids[packedIds[j]];
    }
  }
  var versions = options.versions;
  if (versions) {
    for (var folder in versions) {
      var entries = versions[folder];
      for (var _i2 = 0; _i2 < entries.length; _i2 += 2) {
        var _uuid2 = entries[_i2];
        entries[_i2] = uuids[_uuid2] || _uuid2;
      }
    }
  }
  var redirect = options.redirect;
  if (redirect) {
    for (var _i3 = 0; _i3 < redirect.length; _i3 += 2) {
      redirect[_i3] = uuids[redirect[_i3]];
      redirect[_i3 + 1] = bundles[redirect[_i3 + 1]];
    }
  }
  var extensionMap = options.extensionMap;
  if (extensionMap) {
    var _loop = function _loop(ext) {
      if (!Object.prototype.hasOwnProperty.call(options.extensionMap, ext)) {
        return 1;
      }
      options.extensionMap[ext].forEach(function (uuid, index) {
        options.extensionMap[ext][index] = uuids[uuid] || uuid;
      });
    };
    for (var ext in options.extensionMap) {
      if (_loop(ext)) continue;
    }
  }
};
var Config = function () {
  function Config() {
    this.name = '';
    this.base = '';
    this.importBase = '';
    this.nativeBase = '';
    this.deps = null;
    this.assetInfos = new Cache();
    this.scenes = new Cache();
    this.paths = new Cache();
  }
  var _proto = Config.prototype;
  _proto.init = function init(options) {
    var _this = this;
    processOptions(options);
    this.importBase = options.importBase || '';
    this.nativeBase = options.nativeBase || '';
    this.base = options.base || '';
    this.name = options.name || '';
    this.deps = options.deps || [];
    this._initUuid(options.uuids);
    this._initPath(options.paths);
    this._initScene(options.scenes);
    this._initPackage(options.packs, options.extensionMap['.cconb']);
    this._initVersion(options.versions);
    this._initRedirect(options.redirect);
    var _loop2 = function _loop2(ext) {
      if (!Object.prototype.hasOwnProperty.call(options.extensionMap, ext)) {
        return 1;
      }
      options.extensionMap[ext].forEach(function (uuid) {
        var assetInfo = _this.assetInfos.get(uuid);
        if (assetInfo) {
          assetInfo.extension = ext;
        }
      });
    };
    for (var ext in options.extensionMap) {
      if (_loop2(ext)) continue;
    }
  };
  _proto.getInfoWithPath = function getInfoWithPath(path, type) {
    if (!path) {
      return null;
    }
    path = normalize(path);
    var items = this.paths.get(path);
    if (items) {
      if (type) {
        for (var i = 0, l = items.length; i < l; i++) {
          var assetInfo = items[i];
          if (isChildClassOf(assetInfo.ctor, type)) {
            return assetInfo;
          }
        }
      } else {
        return items[0];
      }
    }
    return null;
  };
  _proto.getDirWithPath = function getDirWithPath(path, type, out) {
    path = normalize(path);
    if (path[path.length - 1] === '/') {
      path = path.slice(0, -1);
    }
    var infos = out || [];
    this.paths.forEach(function (items, p) {
      if (p.startsWith(path) && isMatchByWord(p, path) || !path) {
        for (var i = 0, l = items.length; i < l; i++) {
          var entry = items[i];
          if (!type || isChildClassOf(entry.ctor, type)) {
            infos.push(entry);
          }
        }
      }
    });
    return infos;
  };
  _proto.getAssetInfo = function getAssetInfo(uuid) {
    return this.assetInfos.get(uuid) || null;
  };
  _proto.getSceneInfo = function getSceneInfo(name) {
    if (!name.endsWith('.scene')) {
      name += '.scene';
    }
    if (name[0] !== '/' && !name.startsWith('db://')) {
      name = "/" + name;
    }
    var info = this.scenes.find(function (val, key) {
      return key.endsWith(name);
    });
    return info;
  };
  _proto.destroy = function destroy() {
    this.paths.destroy();
    this.scenes.destroy();
    this.assetInfos.destroy();
  };
  _proto._initUuid = function _initUuid(uuidList) {
    if (!uuidList) {
      return;
    }
    this.assetInfos.clear();
    for (var i = 0, l = uuidList.length; i < l; i++) {
      var uuid = uuidList[i];
      this.assetInfos.add(uuid, {
        uuid: uuid
      });
    }
  };
  _proto._initPath = function _initPath(pathList) {
    if (!pathList) {
      return;
    }
    var paths = this.paths;
    paths.clear();
    for (var uuid in pathList) {
      var info = pathList[uuid];
      var path = info[0];
      var type = info[1];
      var isSubAsset = info.length === 3;
      var assetInfo = this.assetInfos.get(uuid);
      assetInfo.path = path;
      assetInfo.ctor = getClassById(type);
      if (paths.has(path)) {
        if (isSubAsset) {
          paths.get(path).push(assetInfo);
        } else {
          paths.get(path).unshift(assetInfo);
        }
      } else {
        paths.add(path, [assetInfo]);
      }
    }
  };
  _proto._initScene = function _initScene(sceneList) {
    if (!sceneList) {
      return;
    }
    var scenes = this.scenes;
    scenes.clear();
    var assetInfos = this.assetInfos;
    for (var sceneName in sceneList) {
      var uuid = sceneList[sceneName];
      var assetInfo = assetInfos.get(uuid);
      assetInfo.url = sceneName;
      scenes.add(sceneName, assetInfo);
    }
  };
  _proto._initPackage = function _initPackage(packageList, cconbUuids) {
    if (!packageList) {
      return;
    }
    var assetInfos = this.assetInfos;
    for (var packUuid in packageList) {
      var uuids = packageList[packUuid];
      var isCconb = (uuids == null ? void 0 : uuids.length) > 0 && (cconbUuids == null ? void 0 : cconbUuids.includes(uuids[0]));
      var ext = isCconb ? '.bin' : '.json';
      var pack = {
        uuid: packUuid,
        packedUuids: uuids,
        ext: ext
      };
      assetInfos.add(packUuid, pack);
      for (var i = 0, l = uuids.length; i < l; i++) {
        var uuid = uuids[i];
        var assetInfo = assetInfos.get(uuid);
        var assetPacks = assetInfo.packs;
        if (assetPacks) {
          if (l === 1) {
            assetPacks.unshift(pack);
          } else {
            assetPacks.push(pack);
          }
        } else {
          assetInfo.packs = [pack];
        }
      }
    }
  };
  _proto._initVersion = function _initVersion(versions) {
    if (!versions) {
      return;
    }
    var assetInfos = this.assetInfos;
    var entries = versions["import"];
    if (entries) {
      for (var i = 0, l = entries.length; i < l; i += 2) {
        var uuid = entries[i];
        var assetInfo = assetInfos.get(uuid);
        assetInfo.ver = entries[i + 1];
      }
    }
    entries = versions["native"];
    if (entries) {
      for (var _i4 = 0, _l2 = entries.length; _i4 < _l2; _i4 += 2) {
        var _uuid3 = entries[_i4];
        var _assetInfo = assetInfos.get(_uuid3);
        _assetInfo.nativeVer = entries[_i4 + 1];
      }
    }
  };
  _proto._initRedirect = function _initRedirect(redirect) {
    if (!redirect) {
      return;
    }
    var assetInfos = this.assetInfos;
    for (var i = 0, l = redirect.length; i < l; i += 2) {
      var uuid = redirect[i];
      var assetInfo = assetInfos.get(uuid);
      assetInfo.redirect = redirect[i + 1];
    }
  };
  return Config;
}();

function visitAsset(asset, deps) {
  if (!asset._uuid) {
    return;
  }
  deps.push(asset._uuid);
}
function visitComponent(comp, deps) {
  var props = Object.getOwnPropertyNames(comp);
  for (var i = 0; i < props.length; i++) {
    var propName = props[i];
    if (propName === 'node' || propName === '__eventTargets') {
      continue;
    }
    var value = comp[propName];
    if (typeof value === 'object' && value) {
      if (Array.isArray(value)) {
        for (var j = 0; j < value.length; j++) {
          var val = value[j];
          if (val instanceof Asset) {
            visitAsset(val, deps);
          }
        }
      } else if (!value.constructor || value.constructor === Object) {
        var keys = Object.getOwnPropertyNames(value);
        for (var _j = 0; _j < keys.length; _j++) {
          var _val = value[keys[_j]];
          if (_val instanceof Asset) {
            visitAsset(_val, deps);
          }
        }
      } else if (value instanceof Asset) {
        visitAsset(value, deps);
      }
    }
  }
}
function visitNode(node, deps) {
  for (var i = 0; i < node._components.length; i++) {
    visitComponent(node._components[i], deps);
  }
  for (var _i = 0; _i < node._children.length; _i++) {
    visitNode(node._children[_i], deps);
  }
}
function descendOpRef(asset, refs, exclude, op) {
  exclude.push(asset._uuid);
  var depends = dependUtil.getDeps(asset._uuid);
  for (var i = 0, l = depends.length; i < l; i++) {
    var dependAsset = assets.get(depends[i]);
    if (!dependAsset) {
      continue;
    }
    var uuid = dependAsset._uuid;
    if (!(uuid in refs)) {
      refs[uuid] = dependAsset.refCount + op;
    } else {
      refs[uuid] += op;
    }
    if (exclude.includes(uuid)) {
      continue;
    }
    descendOpRef(dependAsset, refs, exclude, op);
  }
}
var _temp = [];
function checkCircularReference(asset) {
  var refs = Object.create(null);
  refs[asset._uuid] = asset.refCount;
  descendOpRef(asset, refs, _temp, -1);
  _temp.length = 0;
  if (refs[asset._uuid] !== 0) {
    return refs[asset._uuid];
  }
  for (var uuid in refs) {
    if (refs[uuid] !== 0) {
      descendOpRef(assets.get(uuid), refs, _temp, 1);
    }
  }
  _temp.length = 0;
  return refs[asset._uuid];
}
var ReleaseManager = function () {
  function ReleaseManager() {
    this._persistNodeDeps = new Cache();
    this._toDelete = new Cache();
    this._eventListener = false;
    this._dontDestroyAssets = [];
  }
  var _proto = ReleaseManager.prototype;
  _proto.addIgnoredAsset = function addIgnoredAsset(asset) {
    this._dontDestroyAssets.push(asset._uuid);
  };
  _proto.init = function init() {
    this._persistNodeDeps.clear();
    this._toDelete.clear();
  };
  _proto._addPersistNodeRef = function _addPersistNodeRef(node) {
    var deps = [];
    visitNode(node, deps);
    for (var i = 0, l = deps.length; i < l; i++) {
      var dependAsset = assets.get(deps[i]);
      if (dependAsset) {
        dependAsset.addRef();
      }
    }
    this._persistNodeDeps.add(node.uuid, deps);
  };
  _proto._removePersistNodeRef = function _removePersistNodeRef(node) {
    if (!this._persistNodeDeps.has(node.uuid)) {
      return;
    }
    var deps = this._persistNodeDeps.get(node.uuid);
    for (var i = 0, l = deps.length; i < l; i++) {
      var dependAsset = assets.get(deps[i]);
      if (dependAsset) {
        dependAsset.decRef();
      }
    }
    this._persistNodeDeps.remove(node.uuid);
  };
  _proto._autoRelease = function _autoRelease(oldScene, newScene, persistNodes) {
    if (oldScene) {
      var childs = dependUtil.getDeps(oldScene.uuid);
      for (var i = 0, l = childs.length; i < l; i++) {
        var asset = assets.get(childs[i]);
        if (asset) {
          asset.decRef(oldScene.autoReleaseAssets);
        }
      }
      var dependencies = dependUtil._depends.get(oldScene.uuid);
      if (dependencies && dependencies.persistDeps) {
        var persistDeps = dependencies.persistDeps;
        for (var _i2 = 0, _l = persistDeps.length; _i2 < _l; _i2++) {
          var _asset = assets.get(persistDeps[_i2]);
          if (_asset) {
            _asset.decRef(oldScene.autoReleaseAssets);
          }
        }
      }
      if (oldScene.uuid !== newScene.uuid) {
        dependUtil.remove(oldScene.uuid);
      }
    }
    var sceneDeps = dependUtil._depends.get(newScene.uuid);
    if (sceneDeps) {
      sceneDeps.persistDeps = [];
    }
    for (var key in persistNodes) {
      var _ref;
      var node = persistNodes[key];
      var deps = this._persistNodeDeps.get(node.uuid);
      for (var _iterator = _createForOfIteratorHelperLoose(deps), _step; !(_step = _iterator()).done;) {
        var dep = _step.value;
        var dependAsset = assets.get(dep);
        if (dependAsset) {
          dependAsset.addRef();
        }
      }
      if (!sceneDeps) {
        continue;
      }
      (_ref = sceneDeps.persistDeps).push.apply(_ref, deps);
    }
  };
  _proto.tryRelease = function tryRelease(asset, force) {
    if (force === void 0) {
      force = false;
    }
    if (!(asset instanceof Asset)) {
      return;
    }
    if (force) {
      this._free(asset, force);
      return;
    }
    this._toDelete.add(asset._uuid, asset);
    if (!this._eventListener) {
      this._eventListener = true;
      callInNextTick(this._freeAssets.bind(this));
    }
  };
  _proto._freeAssets = function _freeAssets() {
    var _this = this;
    this._eventListener = false;
    this._toDelete.forEach(function (asset) {
      _this._free(asset);
    });
    this._toDelete.clear();
  };
  _proto._free = function _free(asset, force) {
    if (force === void 0) {
      force = false;
    }
    var uuid = asset._uuid;
    this._toDelete.remove(uuid);
    if (!isValid(asset, true) || this._dontDestroyAssets.indexOf(uuid) !== -1) {
      return;
    }
    if (!force) {
      if (asset.refCount > 0) {
        if (checkCircularReference(asset) > 0) {
          return;
        }
      }
    }
    assets.remove(uuid);
    var depends = dependUtil.getDeps(uuid);
    for (var i = 0, l = depends.length; i < l; i++) {
      var dependAsset = assets.get(depends[i]);
      if (dependAsset) {
        dependAsset.decRef(false);
        {
          this._free(dependAsset, false);
        }
      }
    }
    {
      asset.destroy();
    }
    dependUtil.remove(uuid);
  };
  return ReleaseManager;
}();
var releaseManager = new ReleaseManager();

var defaultProgressCallback = null;
function setDefaultProgressCallback(onProgress) {
  defaultProgressCallback = onProgress;
}
function clear(task, clearRef) {
  for (var i = 0, l = task.input.length; i < l; i++) {
    var _item = task.input[i];
    {
      if (!_item.isNative && _item.content instanceof Asset) {
        _item.content.decRef(false);
      }
    }
    _item.recycle();
  }
  task.input = null;
}
function urlAppendTimestamp(url, append) {
  if (append) {
    if (/\?/.test(url)) {
      return url + "&_t=" + Date.now();
    }
    return url + "?_t=" + Date.now();
  }
  return url;
}
function retry(process, times, wait, onComplete, index) {
  if (index === void 0) {
    index = 0;
  }
  process(index, function (err, result) {
    index++;
    if (!err || index > times) {
      if (onComplete) {
        onComplete(err, result);
      }
    } else {
      setTimeout(function () {
        retry(process, times, wait, onComplete, index);
      }, wait);
    }
  });
}
function getDepends(uuid, data, exclude, depends, config) {
  try {
    var info = dependUtil.parse(uuid, data);
    for (var i = 0, l = info.deps.length; i < l; i++) {
      var dep = info.deps[i];
      if (!(dep in exclude)) {
        exclude[dep] = true;
        depends.push({
          uuid: dep,
          bundle: config && config.name
        });
      }
    }
    if (info.nativeDep) {
      if (config) {
        info.nativeDep.bundle = config.name;
      }
      depends.push(_extends({}, info.nativeDep));
    }
  } catch (e) {
    error(e.message, e.stack);
  }
}
function cache(id, asset, cacheAsset) {
  if (!asset) {
    return;
  }
  cacheAsset = cacheAsset !== undefined ? cacheAsset : cclegacy.assetManager.cacheAsset;
  if (!isScene(asset) && cacheAsset && !asset.isDefault) {
    assets.add(id, asset);
  }
}
function setProperties(uuid, asset, assetsMap) {
  var missingAsset = false;
  var depends = dependMap.get(asset);
  if (depends) {
    var missingAssetReporter = null;
    for (var i = 0, l = depends.length; i < l; i++) {
      var depend = depends[i];
      var dependAsset = assetsMap[depend.uuid + "@import"];
      if (!dependAsset) {
        {
          errorID(16350, depend.uuid);
        }
        cclegacy.assetManager.dispatchAssetMissing(asset, depend.owner, depend.prop, depend.uuid);
        if (depend.type && depend.type !== Asset) {
          var placeHolder = new depend.type();
          placeHolder.initDefault(depend.uuid);
          depend.owner[depend.prop] = placeHolder;
        }
        missingAsset = true;
      } else {
        depend.owner[depend.prop] = dependAsset.addRef();
      }
    }
    if (missingAssetReporter) {
      missingAssetReporter.reportByOwner();
    }
    dependMap["delete"](asset);
  }
  if (nativeDependMap.has(asset)) {
    if (assetsMap[uuid + "@native"]) {
      asset._nativeAsset = assetsMap[uuid + "@native"];
    } else {
      missingAsset = true;
      errorID(16351, uuid);
    }
    nativeDependMap["delete"](asset);
  }
  return missingAsset;
}
function gatherAsset(task) {
  var source = task.source;
  if (!task.options.__outputAsArray__ && source.length === 1) {
    task.output = source[0].content;
  } else {
    var output = task.output = [];
    for (var i = 0, l = source.length; i < l; i++) {
      output.push(source[i].content);
    }
  }
}
function forEach(array, process, onComplete) {
  var count = 0;
  var errs = [];
  var length = array.length;
  if (length === 0 && onComplete) {
    onComplete(errs);
  }
  var cb = function cb(err) {
    if (err) {
      errs.push(err);
    }
    count++;
    if (count === length) {
      if (onComplete) {
        onComplete(errs);
      }
    }
  };
  for (var i = 0; i < length; i++) {
    process(array[i], cb);
  }
}
function parseParameters(options, onProgress, onComplete) {
  var optionsOut = options;
  var onProgressOut = onProgress;
  var onCompleteOut = onComplete;
  if (onComplete === undefined) {
    var isCallback = typeof options === 'function';
    if (onProgress) {
      onCompleteOut = onProgress;
      if (!isCallback) {
        onProgressOut = null;
      }
    } else if (onProgress === undefined && isCallback) {
      onCompleteOut = options;
      optionsOut = null;
      onProgressOut = null;
    }
    if (onProgress !== undefined && isCallback) {
      onProgressOut = options;
      optionsOut = null;
    }
  }
  return {
    options: optionsOut || Object.create(null),
    onProgress: onProgressOut,
    onComplete: onCompleteOut
  };
}
function parseLoadResArgs(type, onProgress, onComplete) {
  var typeOut = type;
  var onProgressOut = onProgress;
  var onCompleteOut = onComplete;
  if (onComplete === undefined) {
    var isValidType = isChildClassOf(type, Asset);
    if (onProgress) {
      onCompleteOut = onProgress;
      if (isValidType) {
        onProgressOut = null;
      }
    } else if (onProgress === undefined && !isValidType) {
      onCompleteOut = type;
      onProgressOut = null;
      typeOut = null;
    }
    if (onProgress !== undefined && !isValidType) {
      onProgressOut = type;
      typeOut = null;
    }
  }
  return {
    type: typeOut,
    onProgress: onProgressOut || defaultProgressCallback,
    onComplete: onCompleteOut
  };
}
function checkCircleReference(owner, uuid, map, checked) {
  if (checked === void 0) {
    checked = {};
  }
  var item = map[uuid];
  if (!item || checked[uuid]) {
    return false;
  }
  checked[uuid] = true;
  var result = false;
  var deps = dependUtil.getDeps(uuid);
  if (deps) {
    for (var i = 0, l = deps.length; i < l; i++) {
      var dep = deps[i];
      if (dep === owner || checkCircleReference(owner, dep, map, checked)) {
        result = true;
        break;
      }
    }
  }
  return result;
}
function asyncify(cb) {
  return function (p1, p2) {
    if (!cb) {
      return;
    }
    var refs = [];
    if (Array.isArray(p2)) {
      p2.forEach(function (x) {
        return x instanceof Asset && refs.push(x.addRef());
      });
    } else if (p2 instanceof Asset) {
      refs.push(p2.addRef());
    }
    callInNextTick(function () {
      refs.forEach(function (x) {
        return x.decRef(false);
      });
      cb(p1, p2);
    });
  };
}

var Bundle = function () {
  function Bundle() {
    this._config = new Config();
  }
  var _proto = Bundle.prototype;
  _proto.getInfoWithPath = function getInfoWithPath(path, type) {
    return this._config.getInfoWithPath(path, type);
  };
  _proto.getDirWithPath = function getDirWithPath(path, type, out) {
    return this._config.getDirWithPath(path, type, out);
  };
  _proto.getAssetInfo = function getAssetInfo(uuid) {
    return this._config.getAssetInfo(uuid);
  };
  _proto.getSceneInfo = function getSceneInfo(name) {
    return this._config.getSceneInfo(name);
  };
  _proto.init = function init(options) {
    this._config.init(options);
    bundles.add(options.name, this);
  };
  _proto.load = function load(paths, type, onProgress, onComplete) {
    var _parseLoadResArgs = parseLoadResArgs(type, onProgress, onComplete),
      _type = _parseLoadResArgs.type,
      onProg = _parseLoadResArgs.onProgress,
      onComp = _parseLoadResArgs.onComplete;
    var options = {
      __requestType__: RequestType.PATH,
      type: _type,
      bundle: this.name,
      __outputAsArray__: Array.isArray(paths)
    };
    cclegacy.assetManager.loadAny(paths, options, onProg, onComp);
  };
  _proto.preload = function preload(paths, type, onProgress, onComplete) {
    var _parseLoadResArgs2 = parseLoadResArgs(type, onProgress, onComplete),
      _type = _parseLoadResArgs2.type,
      onProg = _parseLoadResArgs2.onProgress,
      onComp = _parseLoadResArgs2.onComplete;
    cclegacy.assetManager.preloadAny(paths, {
      __requestType__: RequestType.PATH,
      type: _type,
      bundle: this.name
    }, onProg, onComp);
  };
  _proto.loadDir = function loadDir(dir, type, onProgress, onComplete) {
    var _parseLoadResArgs3 = parseLoadResArgs(type, onProgress, onComplete),
      _type = _parseLoadResArgs3.type,
      onProg = _parseLoadResArgs3.onProgress,
      onComp = _parseLoadResArgs3.onComplete;
    cclegacy.assetManager.loadAny(dir, {
      __requestType__: RequestType.DIR,
      type: _type,
      bundle: this.name,
      __outputAsArray__: true
    }, onProg, onComp);
  };
  _proto.preloadDir = function preloadDir(dir, type, onProgress, onComplete) {
    var _parseLoadResArgs4 = parseLoadResArgs(type, onProgress, onComplete),
      _type = _parseLoadResArgs4.type,
      onProg = _parseLoadResArgs4.onProgress,
      onComp = _parseLoadResArgs4.onComplete;
    cclegacy.assetManager.preloadAny(dir, {
      __requestType__: RequestType.DIR,
      type: _type,
      bundle: this.name
    }, onProg, onComp);
  };
  _proto.loadScene = function loadScene(sceneName, options, onProgress, onComplete) {
    var _parseParameters = parseParameters(options, onProgress, onComplete),
      opts = _parseParameters.options,
      onProg = _parseParameters.onProgress,
      onComp = _parseParameters.onComplete;
    opts.preset = opts.preset || 'scene';
    opts.bundle = this.name;
    cclegacy.assetManager.loadAny({
      scene: sceneName
    }, opts, onProg, function (err, sceneAsset) {
      if (err) {
        error(err.message, err.stack);
      } else if (sceneAsset.scene) {
        var scene = sceneAsset.scene;
        scene.id = sceneAsset._uuid;
        scene.name = sceneAsset.name;
      } else {
        err = new Error("The asset " + sceneAsset._uuid + " is not a scene");
      }
      if (onComp) {
        onComp(err, sceneAsset);
      }
    });
  };
  _proto.preloadScene = function preloadScene(sceneName, options, onProgress, onComplete) {
    var _parseParameters2 = parseParameters(options, onProgress, onComplete),
      opts = _parseParameters2.options,
      onProg = _parseParameters2.onProgress,
      onComp = _parseParameters2.onComplete;
    opts.bundle = this.name;
    cclegacy.assetManager.preloadAny({
      scene: sceneName
    }, opts, onProg, function (err) {
      if (err) {
        errorID(1210, sceneName, err.message);
      }
      if (onComp) {
        onComp(err);
      }
    });
  };
  _proto.get = function get(path, type) {
    var info = this.getInfoWithPath(path, type);
    if (info) {
      return assets.get(info.uuid) || null;
    }
    return null;
  };
  _proto.release = function release(path, type) {
    var asset = this.get(path, type);
    if (asset) {
      releaseManager.tryRelease(asset, true);
    }
  };
  _proto.releaseUnusedAssets = function releaseUnusedAssets() {
    var _this = this;
    assets.forEach(function (asset) {
      var info = _this.getAssetInfo(asset._uuid);
      if (info && !info.redirect) {
        releaseManager.tryRelease(asset);
      }
    });
  };
  _proto.releaseAll = function releaseAll() {
    var _this2 = this;
    assets.forEach(function (asset) {
      var info = _this2.getAssetInfo(asset._uuid);
      if (info && !info.redirect) {
        releaseManager.tryRelease(asset, true);
      }
    });
  };
  _proto._destroy = function _destroy() {
    this._config.destroy();
  };
  return _createClass(Bundle, [{
    key: "config",
    get: function get() {
      return this._config;
    }
  }, {
    key: "name",
    get: function get() {
      return this._config.name;
    }
  }, {
    key: "deps",
    get: function get() {
      return this._config.deps;
    }
  }, {
    key: "base",
    get: function get() {
      return this._config.base;
    }
  }]);
}();
var resources = new Bundle();
cclegacy.resources = resources;

var CacheManager = function CacheManager() {
  this.cacheDir = void 0;
  this.cacheEnabled = void 0;
  this.autoClear = void 0;
  this.cacheInterval = void 0;
  this.deleteInterval = void 0;
  this.cachedFiles = void 0;
};

function downloadDomImage(url, options, onComplete) {
  var img = new ccwindow.Image();
  if (ccwindow.location.protocol !== 'file:' || XIAOMI) {
    img.crossOrigin = 'anonymous';
  }
  function loadCallback() {
    img.removeEventListener('load', loadCallback);
    img.removeEventListener('error', errorCallback);
    if (onComplete) {
      onComplete(null, img);
    }
  }
  function errorCallback() {
    img.removeEventListener('load', loadCallback);
    img.removeEventListener('error', errorCallback);
    if (onComplete) {
      onComplete(new Error(getError(4930, url)));
    }
  }
  img.addEventListener('load', loadCallback);
  img.addEventListener('error', errorCallback);
  img.src = url;
  return img;
}

function downloadFile(url, options, onProgress, onComplete) {
  var xhr = new XMLHttpRequest();
  var errInfo = "download failed: " + url + ", status: ";
  xhr.open('GET', url, true);
  if (options.xhrResponseType !== undefined) {
    xhr.responseType = options.xhrResponseType;
  }
  if (options.xhrWithCredentials !== undefined) {
    xhr.withCredentials = options.xhrWithCredentials;
  }
  if (options.xhrMimeType !== undefined && xhr.overrideMimeType) {
    xhr.overrideMimeType(options.xhrMimeType);
  }
  if (options.xhrTimeout !== undefined) {
    xhr.timeout = options.xhrTimeout;
  }
  if (options.xhrHeader) {
    for (var header in options.xhrHeader) {
      xhr.setRequestHeader(header, options.xhrHeader[header]);
    }
  }
  xhr.onload = function () {
    if (xhr.status === 200 || xhr.status === 0) {
      if (onComplete) {
        onComplete(null, xhr.response);
      }
    } else if (onComplete) {
      onComplete(new Error("" + errInfo + xhr.status + "(no response)"));
    }
  };
  if (onProgress) {
    xhr.onprogress = function (e) {
      if (e.lengthComputable) {
        onProgress(e.loaded, e.total);
      }
    };
  }
  xhr.onerror = function () {
    if (onComplete) {
      onComplete(new Error("" + errInfo + xhr.status + "(error)"));
    }
  };
  xhr.ontimeout = function () {
    if (onComplete) {
      onComplete(new Error("" + errInfo + xhr.status + "(time out)"));
    }
  };
  xhr.onabort = function () {
    if (onComplete) {
      onComplete(new Error("" + errInfo + xhr.status + "(abort)"));
    }
  };
  xhr.send(null);
  return xhr;
}

var ccdocument = ccwindow.document;
var downloaded = {};
function downloadScript(url, options, onComplete) {
  if (downloaded[url]) {
    if (onComplete) {
      onComplete(null);
    }
    return null;
  }
  var script = ccdocument.createElement('script');
  if (ccwindow.location.protocol !== 'file:') {
    script.crossOrigin = 'anonymous';
  }
  script.async = options.scriptAsyncLoading || false;
  script.src = url;
  function loadHandler() {
    script.parentNode.removeChild(script);
    script.removeEventListener('load', loadHandler, false);
    script.removeEventListener('error', errorHandler, false);
    downloaded[url] = true;
    if (onComplete) {
      onComplete(null);
    }
  }
  function errorHandler() {
    script.parentNode.removeChild(script);
    script.removeEventListener('load', loadHandler, false);
    script.removeEventListener('error', errorHandler, false);
    if (onComplete) {
      onComplete(new Error(getError(4928, url)));
    }
  }
  script.addEventListener('load', loadHandler, false);
  script.addEventListener('error', errorHandler, false);
  ccdocument.body.appendChild(script);
  return script;
}

var REGEX = /^(?:\w+:\/\/|\.+\/).+/;
var downloadImage = function downloadImage(url, options, onComplete) {
  var func = sys.hasFeature(sys.Feature.IMAGE_BITMAP) && cclegacy.assetManager.allowImageBitmap ? downloadBlob : downloadDomImage;
  func(url, options, onComplete);
};
var downloadBlob = function downloadBlob(url, options, onComplete) {
  options.xhrResponseType = 'blob';
  downloadFile(url, options, options.onFileProgress, onComplete);
};
var downloadJson = function downloadJson(url, options, onComplete) {
  options.xhrResponseType = 'json';
  downloadFile(url, options, options.onFileProgress, onComplete);
};
var downloadArrayBuffer = function downloadArrayBuffer(url, options, onComplete) {
  options.xhrResponseType = 'arraybuffer';
  downloadFile(url, options, options.onFileProgress, onComplete);
};
var downloadCCONB = function downloadCCONB(url, options, onComplete) {
  var handleArrayBuffer = function handleArrayBuffer(arrayBuffer, onComplete) {
    try {
      var ccon = decodeCCONBinary(new Uint8Array(arrayBuffer));
      onComplete(null, ccon);
    } catch (err) {
      onComplete(err);
    }
  };
  downloader._downloadArrayBuffer(url.replace('.cconb', '.bin'), options, function (err, arrayBuffer) {
    if (err) {
      downloader._downloadArrayBuffer(url, options, function (err, arrayBuffer) {
        if (err) {
          onComplete(err);
          return;
        }
        handleArrayBuffer(arrayBuffer, onComplete);
      });
      return;
    }
    handleArrayBuffer(arrayBuffer, onComplete);
  });
};
var downloadText = function downloadText(url, options, onComplete) {
  options.xhrResponseType = 'text';
  downloadFile(url, options, options.onFileProgress, onComplete);
};
var downloadBundle = function downloadBundle(nameOrUrl, options, onComplete) {
  var bundleName = basename(nameOrUrl);
  var url = nameOrUrl;
  if (!REGEX.test(url)) {
    if (downloader.remoteBundles.indexOf(bundleName) !== -1) {
      url = downloader.remoteServerAddress + "remote/" + bundleName;
    } else {
      url = "assets/" + bundleName;
    }
  }
  var version = options.version || downloader.bundleVers[bundleName];
  var count = 0;
  var config = url + "/config." + (version ? version + "." : '') + "json";
  var out = null;
  var error = null;
  downloadJson(config, options, function (err, response) {
    error = err || error;
    out = response;
    if (out) {
      out.base = url + "/";
    }
    if (++count === 2) {
      onComplete(error, out);
    }
  });
  var jspath = url + "/index." + (version ? version + "." : '') + "js";
  downloadScript(jspath, options, function (err) {
    error = err || error;
    if (++count === 2) {
      onComplete(error, out);
    }
  });
};
var Downloader = function () {
  function Downloader() {
    this.maxConcurrency = 15;
    this.maxRequestsPerFrame = 15;
    this.maxRetryCount = 0;
    this.appendTimeStamp = false;
    this.limited = !EDITOR;
    this.retryInterval = 2000;
    this.bundleVers = {};
    this.remoteBundles = [];
    this.downloadDomImage = downloadDomImage;
    this.downloadDomAudio = null;
    this.downloadFile = downloadFile;
    this.downloadScript = downloadScript;
    this._downloadArrayBuffer = downloadArrayBuffer;
    this._downloadJson = downloadJson;
    this._downloaders = {
      '.png': downloadImage,
      '.jpg': downloadImage,
      '.bmp': downloadImage,
      '.jpeg': downloadImage,
      '.gif': downloadImage,
      '.ico': downloadImage,
      '.tiff': downloadImage,
      '.webp': downloadImage,
      '.image': downloadImage,
      '.pvr': downloadArrayBuffer,
      '.pkm': downloadArrayBuffer,
      '.astc': downloadArrayBuffer,
      '.txt': downloadText,
      '.xml': downloadText,
      '.vsh': downloadText,
      '.fsh': downloadText,
      '.atlas': downloadText,
      '.tmx': downloadText,
      '.tsx': downloadText,
      '.json': downloadJson,
      '.ExportJson': downloadJson,
      '.plist': downloadText,
      '.cconb': downloadCCONB,
      '.fnt': downloadText,
      '.binary': downloadArrayBuffer,
      '.bin': downloadArrayBuffer,
      '.dbbin': downloadArrayBuffer,
      '.skel': downloadArrayBuffer,
      '.js': downloadScript,
      bundle: downloadBundle,
      "default": downloadText
    };
    this._downloading = new Cache();
    this._queue = [];
    this._queueDirty = false;
    this._totalNum = 0;
    this._totalNumThisPeriod = 0;
    this._lastDate = -1;
    this._checkNextPeriod = false;
    this._remoteServerAddress = '';
    this._maxInterval = 1 / 30;
  }
  var _proto = Downloader.prototype;
  _proto.init = function init(remoteServerAddress, bundleVers, remoteBundles) {
    if (remoteServerAddress === void 0) {
      remoteServerAddress = '';
    }
    if (bundleVers === void 0) {
      bundleVers = {};
    }
    if (remoteBundles === void 0) {
      remoteBundles = [];
    }
    this._downloading.clear();
    this._queue.length = 0;
    this._remoteServerAddress = remoteServerAddress;
    this.bundleVers = bundleVers;
    this.remoteBundles = remoteBundles;
  };
  _proto.register = function register(type, handler) {
    if (typeof type === 'object') {
      mixin(this._downloaders, type);
    } else {
      this._downloaders[type] = handler;
    }
  };
  _proto.download = function download(id, url, type, options, onComplete) {
    var _this = this;
    var file = files.get(id);
    if (file) {
      onComplete(null, file);
      return;
    }
    var downloadCallbacks = this._downloading.get(id);
    if (downloadCallbacks) {
      downloadCallbacks.push(onComplete);
      var request = this._queue.find(function (x) {
        return x.id === id;
      });
      if (!request) {
        return;
      }
      var priority = options.priority || 0;
      if (request.priority < priority) {
        request.priority = priority;
        this._queueDirty = true;
      }
      return;
    }
    var maxRetryCount = typeof options.maxRetryCount !== 'undefined' ? options.maxRetryCount : this.maxRetryCount;
    var maxConcurrency = typeof options.maxConcurrency !== 'undefined' ? options.maxConcurrency : this.maxConcurrency;
    var maxRequestsPerFrame = typeof options.maxRequestsPerFrame !== 'undefined' ? options.maxRequestsPerFrame : this.maxRequestsPerFrame;
    var handler = this._downloaders[type] || this._downloaders["default"];
    var process = function process(index, callback) {
      if (index === 0) {
        _this._downloading.add(id, [onComplete]);
      }
      if (!_this.limited) {
        handler(urlAppendTimestamp(url, _this.appendTimeStamp), options, callback);
        return;
      }
      _this._updateTime();
      var done = function done(err, data) {
        _this._totalNum--;
        _this._handleQueueInNextFrame(maxConcurrency, maxRequestsPerFrame);
        callback(err, data);
      };
      if (_this._totalNum < maxConcurrency && _this._totalNumThisPeriod < maxRequestsPerFrame) {
        handler(urlAppendTimestamp(url, _this.appendTimeStamp), options, done);
        _this._totalNum++;
        _this._totalNumThisPeriod++;
      } else {
        _this._queue.push({
          id: id,
          priority: options.priority || 0,
          url: url,
          options: options,
          done: done,
          handler: handler
        });
        _this._queueDirty = true;
        if (_this._totalNum < maxConcurrency) {
          _this._handleQueueInNextFrame(maxConcurrency, maxRequestsPerFrame);
        }
      }
    };
    var finale = function finale(err, result) {
      if (!err) {
        files.add(id, result);
      }
      var callbacks = _this._downloading.remove(id);
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i](err, result);
      }
    };
    retry(process, maxRetryCount, this.retryInterval, finale);
  };
  _proto.loadSubpackage = function loadSubpackage(name, completeCallback) {
    cclegacy.assetManager.loadBundle(name, null, completeCallback);
  };
  _proto._updateTime = function _updateTime() {
    var now = performance.now();
    var deltaTime = cclegacy.game.deltaTime;
    var interval = deltaTime > this._maxInterval ? this._maxInterval : deltaTime;
    if (now - this._lastDate > interval * 1000) {
      this._totalNumThisPeriod = 0;
      this._lastDate = now;
    }
  };
  _proto._handleQueue = function _handleQueue(maxConcurrency, maxRequestsPerFrame) {
    this._checkNextPeriod = false;
    this._updateTime();
    while (this._queue.length > 0 && this._totalNum < maxConcurrency && this._totalNumThisPeriod < maxRequestsPerFrame) {
      if (this._queueDirty) {
        this._queue.sort(function (a, b) {
          return a.priority - b.priority;
        });
        this._queueDirty = false;
      }
      var request = this._queue.pop();
      if (!request) {
        break;
      }
      this._totalNum++;
      this._totalNumThisPeriod++;
      request.handler(urlAppendTimestamp(request.url, this.appendTimeStamp), request.options, request.done);
    }
    this._handleQueueInNextFrame(maxConcurrency, maxRequestsPerFrame);
  };
  _proto._handleQueueInNextFrame = function _handleQueueInNextFrame(maxConcurrency, maxRequestsPerFrame) {
    if (!this._checkNextPeriod && this._queue.length > 0) {
      callInNextTick(this._handleQueue.bind(this), maxConcurrency, maxRequestsPerFrame);
      this._checkNextPeriod = true;
    }
  };
  return _createClass(Downloader, [{
    key: "remoteServerAddress",
    get: function get() {
      return this._remoteServerAddress;
    }
  }, {
    key: "handlers",
    get: function get() {
      return this._downloaders;
    }
  }], [{
    key: "instance",
    get: function get() {
      if (!Downloader._instance) {
        Downloader._instance = new Downloader();
      }
      return Downloader._instance;
    }
  }]);
}();
Downloader._instance = void 0;
var downloader = Downloader.instance;
var downloader$1 = Downloader.instance;

var _dec$8, _class$8, _class2$8, _initializer$7;
var JsonAsset = (_dec$8 = ccclass('cc.JsonAsset'), _dec$8(_class$8 = (_class2$8 = function (_Asset) {
  function JsonAsset(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this.json = _initializer$7 && _initializer$7();
    return _this;
  }
  _inheritsLoose(JsonAsset, _Asset);
  return JsonAsset;
}(Asset), _initializer$7 = applyDecoratedInitializer(_class2$8.prototype, "json", [serializable], function () {
  return null;
}), _class2$8)) || _class$8);
cclegacy.JsonAsset = JsonAsset;

var _dec$7, _class$7, _class2$7, _initializer$6;
var TextAsset = (_dec$7 = ccclass('cc.TextAsset'), _dec$7(_class$7 = (_class2$7 = function (_Asset) {
  function TextAsset(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this.text = _initializer$6 && _initializer$6();
    return _this;
  }
  _inheritsLoose(TextAsset, _Asset);
  var _proto = TextAsset.prototype;
  _proto.toString = function toString() {
    return this.text;
  };
  return TextAsset;
}(Asset), _initializer$6 = applyDecoratedInitializer(_class2$7.prototype, "text", [serializable], function () {
  return '';
}), _class2$7)) || _class$7);
cclegacy.TextAsset = TextAsset;

var _dec$6, _class$6, _class2$6;
var BufferAsset = (_dec$6 = ccclass('cc.BufferAsset'), _dec$6(_class$6 = (_class2$6 = function (_Asset) {
  function BufferAsset(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this._buffer = null;
    return _this;
  }
  _inheritsLoose(BufferAsset, _Asset);
  var _proto = BufferAsset.prototype;
  _proto.buffer = function buffer() {
    assertIsNonNullable(this._buffer);
    return this._buffer;
  };
  _proto.validate = function validate() {
    return !!this._buffer;
  };
  return _createClass(BufferAsset, [{
    key: "_nativeAsset",
    get: function get() {
      return this._buffer;
    },
    set: function set(bin) {
      if (bin instanceof ArrayBuffer) {
        this._buffer = bin;
      } else {
        this._buffer = bin.buffer;
      }
    }
  }]);
}(Asset), _applyDecoratedDescriptor(_class2$6.prototype, "_nativeAsset", [override], Object.getOwnPropertyDescriptor(_class2$6.prototype, "_nativeAsset"), _class2$6.prototype), _class2$6)) || _class$6);
cclegacy.BufferAsset = BufferAsset;

function createImageAsset(id, data, options, onComplete) {
  var out = null;
  var err = null;
  try {
    out = new ImageAsset();
    out._nativeUrl = id;
    out._nativeAsset = data;
  } catch (e) {
    err = e;
  }
  onComplete(err, out);
}
function createJsonAsset(id, data, options, onComplete) {
  var out = new JsonAsset();
  out.json = data;
  onComplete(null, out);
}
function createTextAsset(id, data, options, onComplete) {
  var out = new TextAsset();
  out.text = data;
  onComplete(null, out);
}
function createBufferAsset(id, data, options, onComplete) {
  var out = new BufferAsset();
  out._nativeUrl = id;
  out._nativeAsset = data;
  onComplete(null, out);
}
function createAsset(id, data, options, onComplete) {
  var out = new Asset();
  out._nativeUrl = id;
  out._nativeAsset = data;
  onComplete(null, out);
}
function createBundle(id, data, options, onComplete) {
  var bundle = bundles.get(data.name);
  if (!bundle) {
    bundle = data.name === BuiltinBundleName.RESOURCES ? resources : new Bundle();
    data.base = data.base || id + "/";
    bundle.init(data);
  }
  {
    import("virtual:///prerequisite-imports/" + bundle.name).then(function () {
      onComplete(null, bundle);
    })["catch"](onComplete);
  }
}
var Factory = function () {
  function Factory() {
    this._creating = new Cache();
    this._producers = {
      '.png': createImageAsset,
      '.jpg': createImageAsset,
      '.bmp': createImageAsset,
      '.jpeg': createImageAsset,
      '.gif': createImageAsset,
      '.ico': createImageAsset,
      '.tiff': createImageAsset,
      '.webp': createImageAsset,
      '.image': createImageAsset,
      '.pvr': createImageAsset,
      '.pkm': createImageAsset,
      '.astc': createImageAsset,
      '.txt': createTextAsset,
      '.xml': createTextAsset,
      '.vsh': createTextAsset,
      '.fsh': createTextAsset,
      '.atlas': createTextAsset,
      '.tmx': createTextAsset,
      '.tsx': createTextAsset,
      '.fnt': createTextAsset,
      '.json': createJsonAsset,
      '.ExportJson': createJsonAsset,
      '.binary': createBufferAsset,
      '.bin': createBufferAsset,
      '.dbbin': createBufferAsset,
      '.skel': createBufferAsset,
      bundle: createBundle,
      "default": createAsset
    };
  }
  var _proto = Factory.prototype;
  _proto.register = function register(type, handler) {
    if (typeof type === 'object') {
      mixin(this._producers, type);
    } else {
      this._producers[type] = handler;
    }
  };
  _proto.create = function create(id, data, type, options, onComplete) {
    var _this = this;
    var handler = this._producers[type] || this._producers["default"];
    var asset = assets.get(id);
    if (!options.reloadAsset && asset) {
      onComplete(null, asset);
      return;
    }
    var creating = this._creating.get(id);
    if (creating) {
      creating.push(onComplete);
      return;
    }
    this._creating.add(id, [onComplete]);
    handler(id, data, options, function (err, result) {
      if (!err && result instanceof Asset) {
        result._uuid = id;
        cache(id, result, options.cacheAsset);
      }
      var callbacks = _this._creating.remove(id);
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i](err, result);
      }
    });
  };
  return Factory;
}();
var factory = new Factory();

var PACK_BIN_TYPE = 'BINP';
var VERSION = 2;
var UNIT_SIZE = 4;
var LITTLE_ENDIAN = true;
function binPackageUnpack(arrayBuffer) {
  var dataView = new DataView(arrayBuffer, 0, arrayBuffer.byteLength);
  var packBinType = String.fromCharCode.apply(String, new Uint8Array(arrayBuffer.slice(0, UNIT_SIZE)));
  if (packBinType !== PACK_BIN_TYPE) {
    throw new Error('Invalid bin package format');
  }
  var version = dataView.getUint32(UNIT_SIZE, LITTLE_ENDIAN);
  if (version !== VERSION) {
    return compatibleOlderVersion(arrayBuffer, dataView, version);
  }
  var filesCount = dataView.getUint32(UNIT_SIZE * 2, LITTLE_ENDIAN);
  var filesPosition = [];
  var headOffset = UNIT_SIZE * (3 + filesCount * 2);
  for (var i = 0; i < filesCount; i++) {
    var offset = dataView.getUint32(UNIT_SIZE * (3 + i * 2), LITTLE_ENDIAN) + headOffset;
    var size = dataView.getUint32(UNIT_SIZE * (3 + i * 2 + 1), LITTLE_ENDIAN);
    filesPosition.push({
      offset: offset,
      size: size
    });
  }
  return filesPosition.map(function (_ref) {
    var offset = _ref.offset,
      size = _ref.size;
    return new Uint8Array(arrayBuffer, offset, size);
  });
}
function compatibleOlderVersion(arrayBuffer, dataView, version) {
  var map = {
    1: unpack_v1
  };
  return map[version](arrayBuffer, dataView);
}
function unpack_v1(arrayBuffer, dataView) {
  var filesCount = dataView.getUint32(UNIT_SIZE * 2, LITTLE_ENDIAN);
  var filesPosition = [];
  var offset = UNIT_SIZE * (3 + filesCount);
  for (var i = 0; i < filesCount; i++) {
    var size = dataView.getUint32(UNIT_SIZE * (3 + i), LITTLE_ENDIAN);
    filesPosition.push({
      offset: offset,
      size: size
    });
    offset += size;
  }
  return filesPosition.map(function (_ref2) {
    var offset = _ref2.offset,
      size = _ref2.size;
    return new Uint8Array(arrayBuffer, offset, size);
  });
}

var PackManager = function () {
  function PackManager() {
    this._loading = new Cache();
    this._unpackers = {
      '.json': this.unpackJson,
      '.bin': this.unpackBin
    };
  }
  var _proto = PackManager.prototype;
  _proto.unpackJson = function unpackJson(pack, json, options, onComplete) {
    var out = createMap(true);
    var err = null;
    if (Array.isArray(json)) {
      json = unpackJSONs(json);
      if (json.length !== pack.length) {
        errorID(4915);
      }
      for (var i = 0; i < pack.length; i++) {
        out[pack[i] + "@import"] = json[i];
      }
    } else {
      var textureType = getClassId(Texture2D);
      var imageAssetType = getClassId(ImageAsset);
      if (json.type === textureType && json.data) {
        var datas = json.data;
        if (datas.length !== pack.length) {
          errorID(4915);
        }
        for (var _i = 0; _i < pack.length; _i++) {
          out[pack[_i] + "@import"] = packCustomObjData(textureType, {
            base: datas[_i][0],
            mipmaps: datas[_i][1]
          });
        }
      } else if (json.type === imageAssetType && json.data) {
        var _datas = json.data;
        if (_datas.length !== pack.length) {
          errorID(4915);
        }
        for (var _i2 = 0; _i2 < pack.length; _i2++) {
          out[pack[_i2] + "@import"] = _datas[_i2];
        }
      } else {
        err = new Error('unmatched type pack!');
        onComplete(err, null);
        return;
      }
    }
    onComplete(err, out);
  };
  _proto.unpackBin = function unpackBin(pack, buffer, options, onComplete) {
    var out = createMap(true);
    var err = null;
    try {
      var uint8Arrays = binPackageUnpack(buffer);
      pack.forEach(function (uuid, index) {
        return out[uuid + "@import"] = decodeCCONBinary(uint8Arrays[index]);
      });
    } catch (e) {
      err = e;
    }
    onComplete(err, out);
  };
  _proto.init = function init() {
    this._loading.clear();
  };
  _proto.register = function register(type, handler) {
    if (typeof type === 'object') {
      mixin(this._unpackers, type);
    } else {
      this._unpackers[type] = handler;
    }
  };
  _proto.unpack = function unpack(pack, data, type, options, onComplete) {
    if (!data) {
      onComplete(new Error('package data is wrong!'));
      return;
    }
    var unpacker = this._unpackers[type];
    unpacker(pack, data, options, onComplete);
  };
  _proto.load = function load(item, options, onComplete) {
    var _this = this;
    if (item.isNative || !item.info || !item.info.packs) {
      downloader$1.download(item.id, item.url, item.ext, item.options, onComplete);
      return;
    }
    if (files.has(item.id)) {
      onComplete(null, files.get(item.id));
      return;
    }
    var packs = item.info.packs;
    var loadingPack = packs.find(function (val) {
      return _this._loading.has(val.uuid);
    });
    if (loadingPack) {
      var req = this._loading.get(loadingPack.uuid);
      assertIsTrue(req);
      req.push({
        onComplete: onComplete,
        id: item.id
      });
      return;
    }
    var pack = packs[0];
    this._loading.add(pack.uuid, [{
      onComplete: onComplete,
      id: item.id
    }]);
    assertIsTrue(item.config);
    var url = transform(pack.uuid, {
      ext: pack.ext,
      bundle: item.config.name
    });
    var done = function done(err, data) {
      files.remove(pack.uuid);
      if (err) {
        error(err.message, err.stack);
      }
      _this.unpack(pack.packedUuids, data, pack.ext, item.options, function (err2, result) {
        if (!err2) {
          for (var id in result) {
            files.add(id, result[id]);
          }
        }
        var callbacks = _this._loading.remove(pack.uuid);
        assertIsTrue(callbacks);
        for (var i = 0, l = callbacks.length; i < l; i++) {
          var cb = callbacks[i];
          if (err || err2) {
            cb.onComplete(err || err2);
            continue;
          }
          var unpackedData = result[cb.id];
          if (!unpackedData) {
            cb.onComplete(new Error('can not retrieve data from package'));
          } else {
            cb.onComplete(null, unpackedData);
          }
        }
      });
    };
    if (pack.ext === '.bin') {
      downloader$1._downloadArrayBuffer(url, item.options, done);
    } else if (pack.ext === '.json') {
      downloader$1.download(pack.uuid, url, pack.ext, item.options, done);
    } else {
      errorID(4916, pack.ext);
    }
  };
  return PackManager;
}();
var packManager = new PackManager();

function fetch(task, done) {
  var firstTask = false;
  if (!task.progress) {
    task.progress = {
      finish: 0,
      total: task.input.length,
      canInvoke: true
    };
    firstTask = true;
  }
  var options = task.options,
    progress = task.progress;
  var depends = [];
  var total = progress.total;
  var exclude = options.__exclude__ = options.__exclude__ || Object.create(null);
  task.output = [];
  forEach(task.input, function (item, cb) {
    if (!item.isNative && assets.has(item.uuid)) {
      var asset = assets.get(item.uuid);
      item.content = asset.addRef();
      task.output.push(item);
      if (progress.canInvoke) {
        task.dispatch('progress', ++progress.finish, progress.total, item);
      }
      cb();
      return;
    }
    packManager.load(item, task.options, function (err, data) {
      if (err) {
        if (!task.isFinished) {
          if (!cclegacy.assetManager.force || firstTask) {
            error(err.message, err.stack);
            progress.canInvoke = false;
            done(err);
          } else {
            task.output.push(item);
            if (progress.canInvoke) {
              task.dispatch('progress', ++progress.finish, progress.total, item);
            }
          }
        }
      } else if (!task.isFinished) {
        item.file = data;
        task.output.push(item);
        if (!item.isNative) {
          exclude[item.uuid] = true;
          getDepends(item.uuid, data, exclude, depends, item.config);
          progress.total = total + depends.length;
        }
        if (progress.canInvoke) {
          task.dispatch('progress', ++progress.finish, progress.total, item);
        }
      }
      cb();
    });
  }, function () {
    if (task.isFinished) {
      clear(task);
      task.dispatch('error');
      return;
    }
    if (depends.length > 0) {
      var subTask = Task.create({
        input: depends,
        progress: progress,
        options: options,
        onProgress: task.onProgress,
        onError: Task.prototype.recycle,
        onComplete: function onComplete(err) {
          if (!err) {
            var _task$output;
            (_task$output = task.output).push.apply(_task$output, subTask.output);
            subTask.recycle();
          }
          if (firstTask) {
            decreaseRef(task);
          }
          done(err);
        }
      });
      fetchPipeline.async(subTask);
      return;
    }
    if (firstTask) {
      decreaseRef(task);
    }
    done();
  });
}
function decreaseRef(task) {
  var output = task.output;
  for (var i = 0, l = output.length; i < l; i++) {
    if (output[i].content) {
      output[i].content.decRef(false);
    }
  }
}

var SAXParser = function () {
  function SAXParser() {
    this._parser = null;
    if (globalThis.DOMParser) {
      this._parser = new DOMParser();
    }
  }
  var _proto = SAXParser.prototype;
  _proto.parse = function parse(xmlTxt) {
    return this._parseXML(xmlTxt);
  };
  _proto._parseXML = function _parseXML(textxml) {
    if (this._parser) {
      return this._parser.parseFromString(textxml, 'text/xml');
    }
    throw new Error('Dom parser is not supported in this platform!');
  };
  return SAXParser;
}();
var PlistParser = function (_SAXParser2) {
  function PlistParser() {
    return _SAXParser2.apply(this, arguments) || this;
  }
  _inheritsLoose(PlistParser, _SAXParser2);
  var _proto2 = PlistParser.prototype;
  _proto2.parse = function parse(xmlTxt) {
    var xmlDoc = this._parseXML(xmlTxt);
    var plist = xmlDoc.documentElement;
    if (plist.tagName !== 'plist') {
      warnID(5100);
      return {};
    }
    var node = null;
    for (var i = 0, len = plist.childNodes.length; i < len; i++) {
      node = plist.childNodes[i];
      if (node.nodeType === 1) {
        break;
      }
    }
    return this._parseNode(node);
  };
  _proto2._parseNode = function _parseNode(node) {
    var data = null;
    var tagName = node.tagName;
    if (tagName === 'dict') {
      data = this._parseDict(node);
    } else if (tagName === 'array') {
      data = this._parseArray(node);
    } else if (tagName === 'string') {
      if (node.childNodes.length === 1) {
        data = node.firstChild.nodeValue;
      } else {
        data = '';
        for (var i = 0; i < node.childNodes.length; i++) {
          data += node.childNodes[i].nodeValue;
        }
      }
    } else if (tagName === 'false') {
      data = false;
    } else if (tagName === 'true') {
      data = true;
    } else if (tagName === 'real') {
      data = parseFloat(node.firstChild.nodeValue);
    } else if (tagName === 'integer') {
      data = parseInt(node.firstChild.nodeValue, 10);
    }
    return data;
  };
  _proto2._parseArray = function _parseArray(node) {
    var data = [];
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
      var child = node.childNodes[i];
      if (child.nodeType !== 1) {
        continue;
      }
      data.push(this._parseNode(child));
    }
    return data;
  };
  _proto2._parseDict = function _parseDict(node) {
    var data = {};
    var key = '';
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
      var child = node.childNodes[i];
      if (child.nodeType !== 1) {
        continue;
      }
      if (child.tagName === 'key') {
        key = child.firstChild.nodeValue;
      } else {
        data[key] = this._parseNode(child);
      }
    }
    return data;
  };
  return PlistParser;
}(SAXParser);
var plistParser = new PlistParser();

var Parser = function () {
  function Parser() {
    this._parsing = new Cache();
    this._parsers = {
      '.png': this.parseImage,
      '.jpg': this.parseImage,
      '.bmp': this.parseImage,
      '.jpeg': this.parseImage,
      '.gif': this.parseImage,
      '.ico': this.parseImage,
      '.tiff': this.parseImage,
      '.webp': this.parseImage,
      '.image': this.parseImage,
      '.pvr': this.parsePVRTex,
      '.pkm': this.parsePKMTex,
      '.astc': this.parseASTCTex,
      '.plist': this.parsePlist,
      "import": this.parseImport,
      '.ccon': this.parseImport,
      '.cconb': this.parseImport
    };
  }
  var _proto = Parser.prototype;
  _proto.parseImage = function parseImage(file, options, onComplete) {
    if (file instanceof HTMLImageElement) {
      onComplete(null, file);
      return;
    }
    createImageBitmap(file, {
      premultiplyAlpha: 'none'
    }).then(function (result) {
      onComplete(null, result);
    }, function (err) {
      onComplete(err, null);
    });
  };
  _proto.parsePVRTex = function parsePVRTex(file, options, onComplete) {
    var err = null;
    var out = null;
    try {
      out = ImageAsset.parseCompressedTextures(file, 0);
    } catch (e) {
      err = e;
      warn(err);
    }
    onComplete(err, out);
  };
  _proto.parsePKMTex = function parsePKMTex(file, options, onComplete) {
    var err = null;
    var out = null;
    try {
      out = ImageAsset.parseCompressedTextures(file, 1);
    } catch (e) {
      err = e;
      warn(err);
    }
    onComplete(err, out);
  };
  _proto.parseASTCTex = function parseASTCTex(file, options, onComplete) {
    var err = null;
    var out = null;
    try {
      out = ImageAsset.parseCompressedTextures(file, 2);
    } catch (e) {
      err = e;
      warn(err);
    }
    onComplete(err, out);
  };
  _proto.parsePlist = function parsePlist(file, options, onComplete) {
    var err = null;
    var result = plistParser.parse(file);
    if (!result) {
      err = new Error('parse failed');
    }
    onComplete(err, result);
  };
  _proto.parseImport = function parseImport(file, options, onComplete) {
    if (!file) {
      onComplete(new Error(getError(3702, options.__uuid__)));
      return;
    }
    var result = null;
    var err = null;
    try {
      result = deserializeAsset(file, options);
    } catch (e) {
      err = e;
    }
    onComplete(err, result);
  };
  _proto.init = function init() {
    this._parsing.clear();
  };
  _proto.register = function register(type, handler) {
    if (typeof type === 'object') {
      mixin(this._parsers, type);
    } else {
      this._parsers[type] = handler;
    }
  };
  _proto.parse = function parse(id, file, type, options, onComplete) {
    var _this = this;
    var parsedAsset = parsed.get(id);
    if (parsedAsset) {
      onComplete(null, parsedAsset);
      return;
    }
    var parsing = this._parsing.get(id);
    if (parsing) {
      parsing.push(onComplete);
      return;
    }
    var parseHandler = this._parsers[type];
    if (!parseHandler) {
      onComplete(null, file);
      return;
    }
    this._parsing.add(id, [onComplete]);
    parseHandler(file, options, function (err, data) {
      if (err) {
        files.remove(id);
      } else if (!isScene(data)) {
        parsed.add(id, data);
      }
      var callbacks = _this._parsing.remove(id);
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i](err, data);
      }
    });
  };
  return _createClass(Parser, null, [{
    key: "instance",
    get: function get() {
      if (!this._instance) {
        this._instance = new Parser();
      }
      return this._instance;
    }
  }]);
}();
Parser._instance = void 0;
var parser = Parser.instance;

function load(task, done) {
  var firstTask = false;
  if (!task.progress) {
    task.progress = {
      finish: 0,
      total: task.input.length,
      canInvoke: true
    };
    firstTask = true;
  }
  var options = task.options,
    progress = task.progress;
  options.__exclude__ = options.__exclude__ || Object.create(null);
  task.output = [];
  forEach(task.input, function (item, cb) {
    var subTask = Task.create({
      input: item,
      onProgress: task.onProgress,
      options: options,
      progress: progress,
      onComplete: function onComplete(err, result) {
        if (err && !task.isFinished) {
          if (!cclegacy.assetManager.force || firstTask) {
            progress.canInvoke = false;
            done(err);
          } else if (progress.canInvoke) {
            task.dispatch('progress', ++progress.finish, progress.total, item);
          }
        }
        task.output.push(result);
        subTask.recycle();
        cb(null);
      }
    });
    loadOneAssetPipeline.async(subTask);
  }, function () {
    options.__exclude__ = null;
    if (task.isFinished) {
      clear(task);
      task.dispatch('error');
      return;
    }
    gatherAsset(task);
    clear(task);
    done();
  });
}
var loadOneAssetPipeline = new Pipeline('loadOneAsset', [function fetch(task, done) {
  var item = task.output = task.input;
  var options = item.options,
    isNative = item.isNative,
    uuid = item.uuid,
    file = item.file;
  var reloadAsset = options.reloadAsset;
  if (file || !reloadAsset && !isNative && assets.has(uuid)) {
    done();
    return;
  }
  packManager.load(item, task.options, function (err, data) {
    item.file = data;
    done(err);
  });
}, function parse(task, done) {
  var item = task.output = task.input;
  var progress = task.progress;
  var exclude = task.options.__exclude__;
  var id = item.id,
    file = item.file,
    options = item.options;
  if (item.isNative) {
    parser.parse(id, file, item.ext, options, function (err, asset) {
      if (err) {
        done(err);
        return;
      }
      item.content = asset;
      if (progress.canInvoke) {
        task.dispatch('progress', ++progress.finish, progress.total, item);
      }
      files.remove(id);
      parsed.remove(id);
      done();
    });
  } else {
    var uuid = item.uuid;
    if (uuid in exclude) {
      var _exclude$uuid = exclude[uuid],
        finish = _exclude$uuid.finish,
        content = _exclude$uuid.content,
        err = _exclude$uuid.err,
        callbacks = _exclude$uuid.callbacks;
      if (progress.canInvoke) {
        task.dispatch('progress', ++progress.finish, progress.total, item);
      }
      if (finish || checkCircleReference(uuid, uuid, exclude)) {
        if (content) {
          content.addRef();
        }
        item.content = content;
        done(err);
      } else {
        callbacks.push({
          done: done,
          item: item
        });
      }
    } else if (!options.reloadAsset && assets.has(uuid)) {
      var asset = assets.get(uuid);
      item.content = asset.addRef();
      if (progress.canInvoke) {
        task.dispatch('progress', ++progress.finish, progress.total, item);
      }
      done();
    } else {
      options.__uuid__ = uuid;
      parser.parse(id, file, 'import', options, function (err, asset) {
        if (err) {
          done(err);
          return;
        }
        loadDepends(task, asset, done);
      });
    }
  }
}]);
function loadDepends(task, asset, done) {
  var item = task.input,
    progress = task.progress;
  var _ref = item,
    uuid = _ref.uuid,
    id = _ref.id,
    options = _ref.options,
    config = _ref.config;
  var cacheAsset = options.cacheAsset;
  var depends = [];
  if (asset.addRef) {
    asset.addRef();
  }
  getDepends(uuid, asset, Object.create(null), depends, config);
  if (progress.canInvoke) {
    task.dispatch('progress', ++progress.finish, progress.total += depends.length, item);
  }
  var repeatItem = task.options.__exclude__[uuid] = {
    content: asset,
    finish: false,
    callbacks: [{
      done: done,
      item: item
    }]
  };
  var subTask = Task.create({
    input: depends,
    options: task.options,
    onProgress: task.onProgress,
    onError: Task.prototype.recycle,
    progress: progress,
    onComplete: function onComplete(err) {
      if (asset.decRef) {
        asset.decRef(false);
      }
      repeatItem.finish = true;
      repeatItem.err = err;
      if (!err) {
        var output = Array.isArray(subTask.output) ? subTask.output : [subTask.output];
        var map = Object.create(null);
        for (var _iterator = _createForOfIteratorHelperLoose(output), _step; !(_step = _iterator()).done;) {
          var dependAsset = _step.value;
          if (!dependAsset) {
            continue;
          }
          map[dependAsset instanceof Asset ? dependAsset._uuid + "@import" : uuid + "@native"] = dependAsset;
        }
        setProperties(uuid, asset, map);
        try {
          if (typeof asset.onLoaded === 'function' && !onLoadedInvokedMap.has(asset) && !nativeDependMap.has(asset)) {
            asset.onLoaded();
            onLoadedInvokedMap.add(asset);
          }
        } catch (e) {
          errorID(16352, uuid, e.message, e.stack);
          {
            if (asset instanceof Asset) {
              asset.initDefault();
            } else {
              cclegacy.SceneAsset.prototype.initDefault.call(asset);
            }
          }
        }
        files.remove(id);
        parsed.remove(id);
        if (asset.validate && !asset.validate()) {
          error("The asset " + uuid + " is invalid for some reason and will be reverted to default asset, please check it out!");
          asset.initDefault();
        }
        cache(uuid, asset, cacheAsset);
        subTask.recycle();
      }
      var callbacks = repeatItem.callbacks;
      for (var i = 0, l = callbacks.length; i < l; i++) {
        var cb = callbacks[i];
        if (asset.addRef) {
          asset.addRef();
        }
        cb.item.content = asset;
        cb.done(err);
      }
      callbacks.length = 0;
    }
  });
  pipeline.async(subTask);
}

function preprocess(task, done) {
  var options = task.options;
  var subOptions = Object.create(null);
  var leftOptions = Object.create(null);
  for (var op in options) {
    switch (op) {
      case RequestType.PATH:
      case RequestType.UUID:
      case RequestType.DIR:
      case RequestType.SCENE:
      case RequestType.URL:
        break;
      case '__requestType__':
      case '__isNative__':
      case 'ext':
      case 'type':
      case '__nativeName__':
      case 'audioLoadMode':
      case 'bundle':
        subOptions[op] = options[op];
        break;
      case '__exclude__':
      case '__outputAsArray__':
        leftOptions[op] = options[op];
        break;
      default:
        subOptions[op] = options[op];
        leftOptions[op] = options[op];
        break;
    }
  }
  task.options = leftOptions;
  var subTask = Task.create({
    input: task.input,
    options: subOptions
  });
  var err = null;
  try {
    task.output = task.source = transformPipeline.sync(subTask);
  } catch (e) {
    err = e;
    for (var i = 0, l = subTask.output.length; i < l; i++) {
      subTask.output[i].recycle();
    }
  }
  subTask.recycle();
  done(err);
}

var RequestItem = function () {
  function RequestItem() {
    this.uuid = '';
    this.overrideUuid = '';
    this.url = '';
    this.ext = '.json';
    this.content = null;
    this.file = null;
    this.info = null;
    this.config = null;
    this.isNative = false;
    this.options = Object.create(null);
    this._id = '';
  }
  RequestItem.create = function create() {
    var out;
    if (RequestItem._deadPool.length !== 0) {
      out = RequestItem._deadPool.pop();
    } else {
      out = new RequestItem();
    }
    return out;
  };
  var _proto = RequestItem.prototype;
  _proto.recycle = function recycle() {
    if (RequestItem._deadPool.length === RequestItem.MAX_DEAD_NUM) {
      return;
    }
    this._id = '';
    this.uuid = '';
    this.overrideUuid = '';
    this.url = '';
    this.ext = '.json';
    this.content = null;
    this.file = null;
    this.info = null;
    this.config = null;
    this.isNative = false;
    this.options = Object.create(null);
    RequestItem._deadPool.push(this);
  };
  return _createClass(RequestItem, [{
    key: "id",
    get: function get() {
      if (!this._id) {
        this._id = (this.overrideUuid || this.uuid) + "@" + (this.isNative ? 'native' : 'import');
      }
      return this._id;
    }
  }]);
}();
RequestItem.MAX_DEAD_NUM = 500;
RequestItem._deadPool = [];

var infos = [];
function parse(task) {
  var options = task.options;
  var input = Array.isArray(task.input) ? task.input : [task.input];
  task.output = [];
  var _loop = function _loop() {
    var item = input[i];
    var out = RequestItem.create();
    var config = null;
    var info = null;
    if (typeof item === 'string') {
      item = Object.create(null);
      item[options.__requestType__ || RequestType.UUID] = input[i];
    }
    if (typeof item === 'object') {
      addon(item, options);
      if (item.preset) {
        addon(item, presets[item.preset]);
      }
      var _loop2 = function _loop2() {
        var _info2;
        switch (key) {
          case RequestType.UUID:
            {
              var _info;
              var uuid = out.uuid = decodeUuid(item.uuid);
              if (!item.bundle) {
                var bundle = bundles.find(function (bundle) {
                  return !!bundle.getAssetInfo(uuid);
                });
                item.bundle = bundle && bundle.name;
              }
              if (bundles.has(item.bundle)) {
                config = bundles.get(item.bundle).config;
                info = config.getAssetInfo(uuid);
                if (info && info.redirect) {
                  if (!bundles.has(info.redirect)) {
                    throw new Error("Please load bundle " + info.redirect + " first");
                  }
                  config = bundles.get(info.redirect).config;
                  info = config.getAssetInfo(uuid);
                }
                out.config = config;
                out.info = info;
              }
              out.ext = item.ext || ((_info = info) == null ? void 0 : _info.extension) || '.json';
              break;
            }
          case '__requestType__':
          case 'ext':
          case 'bundle':
          case 'preset':
          case 'type':
            break;
          case RequestType.DIR:
            if (bundles.has(item.bundle)) {
              bundles.get(item.bundle).config.getDirWithPath(item.dir, item.type, infos);
              for (var _iterator = _createForOfIteratorHelperLoose(infos), _step; !(_step = _iterator()).done;) {
                var assetInfo = _step.value;
                input.push({
                  uuid: assetInfo.uuid,
                  __isNative__: false,
                  ext: assetInfo.extension || '.json',
                  bundle: item.bundle
                });
              }
              infos.length = 0;
            }
            out.recycle();
            out = null;
            break;
          case RequestType.PATH:
            if (bundles.has(item.bundle)) {
              config = bundles.get(item.bundle).config;
              info = config.getInfoWithPath(item.path, item.type);
              if (info && info.redirect) {
                if (!bundles.has(info.redirect)) {
                  throw new Error("you need to load bundle " + info.redirect + " first");
                }
                config = bundles.get(info.redirect).config;
                info = config.getAssetInfo(info.uuid);
              }
              if (!info) {
                out.recycle();
                throw new Error("Bundle " + item.bundle + " doesn't contain " + item.path);
              }
              out.config = config;
              out.uuid = info.uuid;
              out.info = info;
            }
            out.ext = item.ext || ((_info2 = info) == null ? void 0 : _info2.extension) || '.json';
            break;
          case RequestType.SCENE:
            if (!item.bundle) {
              var _bundle = bundles.find(function (bundle) {
                return !!bundle.getSceneInfo(item.scene);
              });
              item.bundle = _bundle && _bundle.name;
            }
            if (bundles.has(item.bundle)) {
              config = bundles.get(item.bundle).config;
              info = config.getSceneInfo(item.scene);
              if (info && info.redirect) {
                if (!bundles.has(info.redirect)) {
                  throw new Error("you need to load bundle " + info.redirect + " first");
                }
                config = bundles.get(info.redirect).config;
                info = config.getAssetInfo(info.uuid);
              }
              if (!info) {
                out.recycle();
                throw new Error("Bundle " + config.name + " doesn't contain scene " + item.scene);
              }
              out.config = config;
              out.uuid = info.uuid;
              out.info = info;
            }
            break;
          case '__isNative__':
            out.isNative = item.__isNative__;
            break;
          case RequestType.URL:
            out.url = item.url;
            out.uuid = item.uuid || item.url;
            out.ext = item.ext || extname(item.url);
            out.isNative = item.__isNative__ !== undefined ? item.__isNative__ : true;
            break;
          default:
            out.options[key] = item[key];
        }
        if (!out) {
          return 1;
        }
      };
      for (var key in item) {
        if (_loop2()) break;
      }
    }
    if (!out) {
      return 1;
    }
    task.output.push(out);
    if (!out.uuid && !out.url) {
      throw new Error("Can not parse this input:" + JSON.stringify(item));
    }
  };
  for (var i = 0; i < input.length; i++) {
    if (_loop()) continue;
  }
  return null;
}
function replaceOverrideAsset(task) {
  var input = task.output = task.input;
  var _loop3 = function _loop3() {
    var item = input[i];
    if (assetsOverrideMap.has(item.uuid)) {
      var uuid = assetsOverrideMap.get(item.uuid);
      {
        item.overrideUuid = uuid;
        item.ext = item.isNative ? item.ext : '.json';
        return 1;
      }
    }
  };
  for (var i = 0; i < input.length; i++) {
    if (_loop3()) continue;
  }
}
function combine(task) {
  var input = task.output = task.input;
  for (var i = 0; i < input.length; i++) {
    var item = input[i];
    if (item.url) {
      continue;
    }
    var url = '';
    var base = '';
    var config = item.config;
    if (item.isNative) {
      base = config && config.nativeBase ? config.base + config.nativeBase : cclegacy.assetManager.generalNativeBase;
    } else {
      base = config && config.importBase ? config.base + config.importBase : cclegacy.assetManager.generalImportBase;
    }
    var uuid = item.overrideUuid || item.uuid;
    var ver = '';
    if (item.info) {
      if (item.isNative) {
        ver = item.info.nativeVer ? "." + item.info.nativeVer : '';
      } else {
        ver = item.info.ver ? "." + item.info.ver : '';
      }
    }
    if (item.ext === '.ttf') {
      url = base + "/" + uuid.slice(0, 2) + "/" + uuid + ver + "/" + item.options.__nativeName__;
    } else {
      url = base + "/" + uuid.slice(0, 2) + "/" + uuid + ver + item.ext;
    }
    item.url = url;
  }
  return null;
}

var querySettings = settings.querySettings.bind(settings);
var SETTINGS_CATEGORY_ASSETS = SettingsCategory.ASSETS;
var EVENT_ASSET_MISSING = 'asset-missing';
var AssetManager = function () {
  function AssetManager() {
    this.pipeline = pipeline.append(preprocess).append(load);
    this.fetchPipeline = fetchPipeline.append(preprocess).append(fetch);
    this.transformPipeline = transformPipeline.append(parse).append(replaceOverrideAsset).append(combine);
    this.bundles = bundles;
    this.assets = assets;
    this.assetsOverrideMap = assetsOverrideMap;
    this.generalImportBase = '';
    this.generalNativeBase = '';
    this.dependUtil = dependUtil;
    this.force = PREVIEW;
    this.allowImageBitmap = false;
    this.utils = helper;
    this.downloader = downloader$1;
    this.parser = parser;
    this.packManager = packManager;
    this.cacheAsset = true;
    this.cacheManager = null;
    this.presets = presets;
    this.factory = factory;
    this.preprocessPipe = preprocess;
    this.fetchPipe = fetch;
    this.loadPipe = load;
    this.references = references;
    this._releaseManager = releaseManager;
    this._files = files;
    this._parsed = parsed;
    this._parsePipeline = new Pipeline('parse existing json', [this.loadPipe]);
    this._projectBundles = [];
    this._eventTarget = new EventTarget();
  }
  var _proto = AssetManager.prototype;
  _proto.getReleaseManager = function getReleaseManager() {
    return this._releaseManager;
  };
  _proto.onAssetMissing = function onAssetMissing(func, target) {
    this._eventTarget.on(EVENT_ASSET_MISSING, func, target);
  };
  _proto.offAssetMissing = function offAssetMissing(func, target) {
    this._eventTarget.off(EVENT_ASSET_MISSING, func, target);
  };
  _proto.dispatchAssetMissing = function dispatchAssetMissing(parentAsset, owner, propName, uuid) {
    this._eventTarget.emit(EVENT_ASSET_MISSING, parentAsset, owner, propName, uuid);
  };
  _proto.init = function init(options) {
    if (options === void 0) {
      options = {};
    }
    var server = options.server || querySettings(SETTINGS_CATEGORY_ASSETS, 'server') || '';
    var bundleVers = options.bundleVers || querySettings(SETTINGS_CATEGORY_ASSETS, 'bundleVers') || {};
    var remoteBundles = options.remoteBundles || querySettings(SETTINGS_CATEGORY_ASSETS, 'remoteBundles') || [];
    var downloadMaxConcurrency = options.downloadMaxConcurrency || querySettings(SETTINGS_CATEGORY_ASSETS, 'downloadMaxConcurrency');
    if (downloadMaxConcurrency && downloadMaxConcurrency > 0) {
      this.downloader.maxConcurrency = downloadMaxConcurrency;
    }
    this._files.clear();
    this._parsed.clear();
    this._releaseManager.init();
    this.assets.clear();
    this.bundles.clear();
    this.packManager.init();
    this.downloader.init(server, bundleVers, remoteBundles);
    this.parser.init();
    this.dependUtil.init();
    var importBase = options.importBase || querySettings(SETTINGS_CATEGORY_ASSETS, 'importBase') || '';
    if (importBase && importBase.endsWith('/')) {
      importBase = importBase.substring(0, importBase.length - 1);
    }
    var nativeBase = options.nativeBase || querySettings(SETTINGS_CATEGORY_ASSETS, 'nativeBase') || '';
    if (nativeBase && nativeBase.endsWith('/')) {
      nativeBase = nativeBase.substring(0, nativeBase.length - 1);
    }
    this.generalImportBase = importBase;
    this.generalNativeBase = nativeBase;
    this._projectBundles = querySettings(SETTINGS_CATEGORY_ASSETS, 'projectBundles') || [];
    var assetsOverride = querySettings(SETTINGS_CATEGORY_ASSETS, 'assetsOverrides') || {};
    for (var key in assetsOverride) {
      this.assetsOverrideMap.set(key, assetsOverride[key]);
    }
  };
  _proto.getBundle = function getBundle(name) {
    return bundles.get(name) || null;
  };
  _proto.removeBundle = function removeBundle(bundle) {
    bundle._destroy();
    bundles.remove(bundle.name);
  };
  _proto.loadAny = function loadAny(requests, options, onProgress, onComplete) {
    var _parseParameters = parseParameters(options, onProgress, onComplete),
      opts = _parseParameters.options,
      onProg = _parseParameters.onProgress,
      onComp = _parseParameters.onComplete;
    opts.preset = opts.preset || 'default';
    requests = Array.isArray(requests) ? requests.slice() : requests;
    var task = Task.create({
      input: requests,
      onProgress: onProg,
      onComplete: asyncify(onComp),
      options: opts
    });
    pipeline.async(task);
  };
  _proto.preloadAny = function preloadAny(requests, options, onProgress, onComplete) {
    var _parseParameters2 = parseParameters(options, onProgress, onComplete),
      opts = _parseParameters2.options,
      onProg = _parseParameters2.onProgress,
      onComp = _parseParameters2.onComplete;
    opts.preset = opts.preset || 'preload';
    requests = Array.isArray(requests) ? requests.slice() : requests;
    var task = Task.create({
      input: requests,
      onProgress: onProg,
      onComplete: asyncify(onComp),
      options: opts
    });
    fetchPipeline.async(task);
  };
  _proto.loadRemote = function loadRemote(url, options, onComplete) {
    var _parseParameters3 = parseParameters(options, undefined, onComplete),
      opts = _parseParameters3.options,
      onComp = _parseParameters3.onComplete;
    if (!opts.reloadAsset && this.assets.has(url)) {
      asyncify(onComp)(null, this.assets.get(url));
      return;
    }
    opts.__isNative__ = true;
    opts.preset = opts.preset || 'remote';
    this.loadAny({
      url: url
    }, opts, null, function (err, data) {
      if (err) {
        error(err.message, err.stack);
        if (onComp) {
          onComp(err, data);
        }
      } else {
        factory.create(url, data, opts.ext || extname(url), opts, function (p1, p2) {
          if (onComp) {
            onComp(p1, p2);
          }
        });
      }
    });
  };
  _proto.loadBundle = function loadBundle(nameOrUrl, options, onComplete) {
    var _parseParameters4 = parseParameters(options, undefined, onComplete),
      opts = _parseParameters4.options,
      onComp = _parseParameters4.onComplete;
    var bundleName = basename(nameOrUrl);
    if (this.bundles.has(bundleName)) {
      asyncify(onComp)(null, this.getBundle(bundleName));
      return;
    }
    opts.preset = opts.preset || 'bundle';
    opts.ext = 'bundle';
    opts.__isNative__ = true;
    this.loadAny({
      url: nameOrUrl
    }, opts, null, function (err, data) {
      if (err) {
        error(err.message, err.stack);
        if (onComp) {
          onComp(err, data);
        }
      } else {
        factory.create(nameOrUrl, data, 'bundle', opts, function (p1, p2) {
          if (onComp) {
            onComp(p1, p2);
          }
        });
      }
    });
  };
  _proto.releaseAsset = function releaseAsset(asset) {
    releaseManager.tryRelease(asset, true);
  };
  _proto.releaseUnusedAssets = function releaseUnusedAssets() {
    assets.forEach(function (asset) {
      releaseManager.tryRelease(asset);
    });
  };
  _proto.releaseAll = function releaseAll() {
    assets.forEach(function (asset) {
      releaseManager.tryRelease(asset, true);
    });
  };
  _proto.loadWithJson = function loadWithJson(json, options, onProgress, onComplete) {
    var _parseParameters5 = parseParameters(options, onProgress, onComplete),
      opts = _parseParameters5.options,
      onProg = _parseParameters5.onProgress,
      onComp = _parseParameters5.onComplete;
    var item = RequestItem.create();
    item.isNative = false;
    item.uuid = opts.assetId || "" + new Date().getTime() + Math.random();
    item.file = json;
    item.ext = '.json';
    var task = Task.create({
      input: [item],
      onProgress: onProg,
      options: opts,
      onComplete: asyncify(function (err, data) {
        if (!err) {
          if (!opts.assetId) {
            data._uuid = '';
          }
        }
        if (onComp) {
          onComp(err, data);
        }
      })
    });
    this._parsePipeline.async(task);
  };
  return _createClass(AssetManager, [{
    key: "files",
    get: function get() {
      return this._files;
    }
  }, {
    key: "main",
    get: function get() {
      return bundles.get(BuiltinBundleName.MAIN) || null;
    }
  }, {
    key: "resources",
    get: function get() {
      return bundles.get(BuiltinBundleName.RESOURCES) || null;
    }
  }], [{
    key: "instance",
    get: function get() {
      if (!this._instance) {
        this._instance = new AssetManager();
      }
      return this._instance;
    }
  }]);
}();
AssetManager._instance = void 0;
AssetManager.Pipeline = Pipeline;
AssetManager.Task = Task;
AssetManager.Cache = Cache;
AssetManager.RequestItem = RequestItem;
AssetManager.Bundle = Bundle;
AssetManager.BuiltinBundleName = BuiltinBundleName;
AssetManager.CacheManager = CacheManager;
AssetManager.Downloader = Downloader;
AssetManager.Parser = Parser;
AssetManager.DependUtil = DependUtil;
var assetManager = cclegacy.assetManager = AssetManager.instance;
cclegacy.AssetManager = AssetManager;

var BuiltinResMgr = function () {
  function BuiltinResMgr() {
    this._resources = {};
    this._materialsToBeCompiled = [];
  }
  var _proto = BuiltinResMgr.prototype;
  _proto.init = function init() {
    var resources = this._resources;
    var len = 2;
    var numChannels = 4;
    var byteLength = len * len * numChannels;
    var blackValueView = new Uint8Array(byteLength);
    var emptyValueView = new Uint8Array(byteLength);
    var greyValueView = new Uint8Array(byteLength);
    var whiteValueView = new Uint8Array(byteLength);
    var normalValueView = new Uint8Array(byteLength);
    var offset = 0;
    for (var i = 0; i < len * len; i++) {
      blackValueView[offset] = 0;
      blackValueView[offset + 1] = 0;
      blackValueView[offset + 2] = 0;
      blackValueView[offset + 3] = 255;
      emptyValueView[offset] = 0;
      emptyValueView[offset + 1] = 0;
      emptyValueView[offset + 2] = 0;
      emptyValueView[offset + 3] = 0;
      greyValueView[offset] = 119;
      greyValueView[offset + 1] = 119;
      greyValueView[offset + 2] = 119;
      greyValueView[offset + 3] = 255;
      whiteValueView[offset] = 255;
      whiteValueView[offset + 1] = 255;
      whiteValueView[offset + 2] = 255;
      whiteValueView[offset + 3] = 255;
      normalValueView[offset] = 127;
      normalValueView[offset + 1] = 127;
      normalValueView[offset + 2] = 255;
      normalValueView[offset + 3] = 255;
      offset += numChannels;
    }
    var defaultSize = 16;
    var halfDefaultSize = defaultSize / 2;
    var defaultValueView = new Uint8Array(defaultSize * defaultSize * numChannels);
    offset = 0;
    for (var _i = 0; _i < defaultSize * defaultSize; _i++) {
      defaultValueView[offset] = 221;
      defaultValueView[offset + 1] = 221;
      defaultValueView[offset + 2] = 221;
      defaultValueView[offset + 3] = 255;
      offset += numChannels;
    }
    offset = 0;
    for (var _i2 = 0; _i2 < halfDefaultSize; _i2++) {
      for (var j = 0; j < halfDefaultSize; j++) {
        defaultValueView[offset] = 85;
        defaultValueView[offset + 1] = 85;
        defaultValueView[offset + 2] = 85;
        defaultValueView[offset + 3] = 255;
        offset += numChannels;
      }
      offset += halfDefaultSize * numChannels;
    }
    offset += halfDefaultSize * numChannels;
    for (var _i3 = 0; _i3 < halfDefaultSize; _i3++) {
      for (var _j = 0; _j < halfDefaultSize; _j++) {
        defaultValueView[offset] = 85;
        defaultValueView[offset + 1] = 85;
        defaultValueView[offset + 2] = 85;
        defaultValueView[offset + 3] = 255;
        offset += numChannels;
      }
      offset += halfDefaultSize * numChannels;
    }
    var blackMemImageSource = {
      width: len,
      height: len,
      _data: blackValueView,
      _compressed: false,
      format: PixelFormat.RGBA8888
    };
    var emptyMemImageSource = {
      width: len,
      height: len,
      _data: emptyValueView,
      _compressed: false,
      format: PixelFormat.RGBA8888
    };
    var greyMemImageSource = {
      width: len,
      height: len,
      _data: greyValueView,
      _compressed: false,
      format: PixelFormat.RGBA8888
    };
    var whiteMemImageSource = {
      width: len,
      height: len,
      _data: whiteValueView,
      _compressed: false,
      format: PixelFormat.RGBA8888
    };
    var normalMemImageSource = {
      width: len,
      height: len,
      _data: normalValueView,
      _compressed: false,
      format: PixelFormat.RGBA8888
    };
    var defaultMemImageSource = {
      width: defaultSize,
      height: defaultSize,
      _data: defaultValueView,
      _compressed: false,
      format: PixelFormat.RGBA8888
    };
    var imgAsset = new ImageAsset(blackMemImageSource);
    var blackTexture = new Texture2D();
    blackTexture._uuid = 'black-texture';
    blackTexture.image = imgAsset;
    resources[blackTexture._uuid] = blackTexture;
    var emptyImgAsset = new ImageAsset(emptyMemImageSource);
    var emptyTexture = new Texture2D();
    emptyTexture._uuid = 'empty-texture';
    emptyTexture.image = emptyImgAsset;
    resources[emptyTexture._uuid] = emptyTexture;
    var blackCubeTexture = new TextureCube();
    blackCubeTexture._uuid = 'black-cube-texture';
    blackCubeTexture.setMipFilter(TextureFilter.NEAREST);
    blackCubeTexture.image = {
      front: new ImageAsset(blackMemImageSource),
      back: new ImageAsset(blackMemImageSource),
      left: new ImageAsset(blackMemImageSource),
      right: new ImageAsset(blackMemImageSource),
      top: new ImageAsset(blackMemImageSource),
      bottom: new ImageAsset(blackMemImageSource)
    };
    resources[blackCubeTexture._uuid] = blackCubeTexture;
    var greyImgAsset = new ImageAsset(greyMemImageSource);
    var greyTexture = new Texture2D();
    greyTexture._uuid = 'grey-texture';
    greyTexture.image = greyImgAsset;
    resources[greyTexture._uuid] = greyTexture;
    var greyCubeTexture = new TextureCube();
    greyCubeTexture._uuid = 'grey-cube-texture';
    greyCubeTexture.setMipFilter(TextureFilter.NEAREST);
    greyCubeTexture.image = {
      front: new ImageAsset(greyMemImageSource),
      back: new ImageAsset(greyMemImageSource),
      left: new ImageAsset(greyMemImageSource),
      right: new ImageAsset(greyMemImageSource),
      top: new ImageAsset(greyMemImageSource),
      bottom: new ImageAsset(greyMemImageSource)
    };
    resources[greyCubeTexture._uuid] = greyCubeTexture;
    var whiteImgAsset = new ImageAsset(whiteMemImageSource);
    var whiteTexture = new Texture2D();
    whiteTexture._uuid = 'white-texture';
    whiteTexture.image = whiteImgAsset;
    resources[whiteTexture._uuid] = whiteTexture;
    var whiteCubeTexture = new TextureCube();
    whiteCubeTexture._uuid = 'white-cube-texture';
    whiteCubeTexture.setMipFilter(TextureFilter.NEAREST);
    whiteCubeTexture.image = {
      front: new ImageAsset(whiteMemImageSource),
      back: new ImageAsset(whiteMemImageSource),
      left: new ImageAsset(whiteMemImageSource),
      right: new ImageAsset(whiteMemImageSource),
      top: new ImageAsset(whiteMemImageSource),
      bottom: new ImageAsset(whiteMemImageSource)
    };
    resources[whiteCubeTexture._uuid] = whiteCubeTexture;
    var normalImgAsset = new ImageAsset(normalMemImageSource);
    var normalTexture = new Texture2D();
    normalTexture._uuid = 'normal-texture';
    normalTexture.image = normalImgAsset;
    resources[normalTexture._uuid] = normalTexture;
    var defaultImgAsset = new ImageAsset(defaultMemImageSource);
    var defaultTexture = new Texture2D();
    defaultTexture._uuid = 'default-texture';
    defaultTexture.image = defaultImgAsset;
    resources[defaultTexture._uuid] = defaultTexture;
    var defaultCubeTexture = new TextureCube();
    defaultCubeTexture.setMipFilter(TextureFilter.NEAREST);
    defaultCubeTexture._uuid = 'default-cube-texture';
    defaultCubeTexture.image = {
      front: new ImageAsset(defaultMemImageSource),
      back: new ImageAsset(defaultMemImageSource),
      left: new ImageAsset(defaultMemImageSource),
      right: new ImageAsset(defaultMemImageSource),
      top: new ImageAsset(defaultMemImageSource),
      bottom: new ImageAsset(defaultMemImageSource)
    };
    resources[defaultCubeTexture._uuid] = defaultCubeTexture;
    if (cclegacy.SpriteFrame) {
      var spriteFrame = new cclegacy.SpriteFrame();
      var image = imgAsset;
      var texture = new Texture2D();
      texture.image = image;
      spriteFrame.texture = texture;
      spriteFrame._uuid = 'default-spriteframe';
      resources[spriteFrame._uuid] = spriteFrame;
    }
  };
  _proto.addAsset = function addAsset(key, asset) {
    this._resources[key] = asset;
  };
  _proto.get = function get(uuid) {
    return this._resources[uuid];
  };
  _proto.loadBuiltinAssets = function loadBuiltinAssets() {
    var _this = this;
    var builtinAssets = settings.querySettings(SettingsCategory.ENGINE, 'builtinAssets');
    if (!builtinAssets) return Promise.resolve();
    var resources = this._resources;
    return new Promise(function (resolve, reject) {
      assetManager.loadBundle(BuiltinBundleName.INTERNAL, function (err, bundle) {
        if (err) {
          reject(err);
          return;
        }
        assetManager.loadAny(builtinAssets, function (err, assets) {
          if (err) {
            reject(err);
          } else {
            assets.forEach(function (asset) {
              resources[asset.name] = asset;
              {
                releaseManager.addIgnoredAsset(asset);
              }
              if (asset instanceof cclegacy.Material) {
                _this._materialsToBeCompiled.push(asset);
              }
            });
            resolve();
          }
        });
      });
    });
  };
  _proto.compileBuiltinMaterial = function compileBuiltinMaterial() {
    for (var i = 0; i < this._materialsToBeCompiled.length; ++i) {
      var mat = this._materialsToBeCompiled[i];
      for (var j = 0; j < mat.passes.length; ++j) {
        mat.passes[j].tryCompile();
      }
    }
    this._materialsToBeCompiled.length = 0;
  };
  return BuiltinResMgr;
}();
var builtinResMgr = cclegacy.builtinResMgr = new BuiltinResMgr();

var getPhaseID = function () {
  var phases = new Map();
  var phaseNum = 0;
  return function (phaseName) {
    if (typeof phaseName === 'number') {
      return phaseName;
    }
    if (!phases.has(phaseName)) {
      phases.set(phaseName, 1 << phaseNum);
      phaseNum++;
    }
    return phases.get(phaseName);
  };
}();

var _type2reader, _type2writer, _type2validator;
var typeMask = 0xfc000000;
var bindingMask = 0x03f00000;
var countMask = 0x000ff000;
var offsetMask = 0x00000fff;
var genHandle = function genHandle(binding, type, count, offset) {
  if (offset === void 0) {
    offset = 0;
  }
  return type << 26 & typeMask | binding << 20 & bindingMask | count << 12 & countMask | offset & offsetMask;
};
var getTypeFromHandle = function getTypeFromHandle(handle) {
  return (handle & typeMask) >>> 26;
};
var getBindingFromHandle = function getBindingFromHandle(handle) {
  return (handle & bindingMask) >>> 20;
};
var getCountFromHandle = function getCountFromHandle(handle) {
  return (handle & countMask) >>> 12;
};
var getOffsetFromHandle = function getOffsetFromHandle(handle) {
  return handle & offsetMask;
};
var customizeType = function customizeType(handle, type) {
  return handle & ~typeMask | type << 26 & typeMask;
};
var type2reader = (_type2reader = {}, _type2reader[Type.UNKNOWN] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return warnID(12010, idx);
}, _type2reader[Type.INT] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return a[idx];
}, _type2reader[Type.INT2] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec2.fromArray(v, a, idx);
}, _type2reader[Type.INT3] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec3.fromArray(v, a, idx);
}, _type2reader[Type.INT4] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec4.fromArray(v, a, idx);
}, _type2reader[Type.FLOAT] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return a[idx];
}, _type2reader[Type.FLOAT2] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec2.fromArray(v, a, idx);
}, _type2reader[Type.FLOAT3] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec3.fromArray(v, a, idx);
}, _type2reader[Type.FLOAT4] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec4.fromArray(v, a, idx);
}, _type2reader[Type.MAT3] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Mat3.fromArray(v, a, idx);
}, _type2reader[Type.MAT4] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Mat4.fromArray(v, a, idx);
}, _type2reader);
var type2writer = (_type2writer = {}, _type2writer[Type.UNKNOWN] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return warnID(12010, idx);
}, _type2writer[Type.INT] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return a[idx] = v;
}, _type2writer[Type.INT2] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec2.toArray(a, v, idx);
}, _type2writer[Type.INT3] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec3.toArray(a, v, idx);
}, _type2writer[Type.INT4] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec4.toArray(a, v, idx);
}, _type2writer[Type.FLOAT] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return a[idx] = v;
}, _type2writer[Type.FLOAT2] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec2.toArray(a, v, idx);
}, _type2writer[Type.FLOAT3] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec3.toArray(a, v, idx);
}, _type2writer[Type.FLOAT4] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Vec4.toArray(a, v, idx);
}, _type2writer[Type.MAT3] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Mat3.toArray(a, v, idx);
}, _type2writer[Type.MAT4] = function (a, v, idx) {
  if (idx === void 0) {
    idx = 0;
  }
  return Mat4.toArray(a, v, idx);
}, _type2writer);
var type2validator = (_type2validator = {}, _type2validator[Type.INT] = function (v) {
  return typeof v === 'number';
}, _type2validator[Type.FLOAT] = function (v) {
  return typeof v === 'number';
}, _type2validator[Type.INT2] = function (v) {
  return !!(v instanceof Vec2);
}, _type2validator[Type.FLOAT2] = function (v) {
  return !!(v instanceof Vec2);
}, _type2validator[Type.INT3] = function (v) {
  return !!(v instanceof Vec3);
}, _type2validator[Type.FLOAT3] = function (v) {
  return !!(v instanceof Vec3);
}, _type2validator[Type.INT4] = function (v) {
  return !!(v instanceof Vec4);
}, _type2validator[Type.FLOAT4] = function (v) {
  return !!(v instanceof Vec4 || v instanceof Color || v instanceof Quat);
}, _type2validator[Type.MAT3] = function (v) {
  return !!(v instanceof Mat3);
}, _type2validator[Type.MAT4] = function (v) {
  return !!(v instanceof Mat4);
}, _type2validator);
var defaultValues = [Object.freeze([0]), Object.freeze([0, 0]), Object.freeze([0, 0, 0, 0]), Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])];
function getDefaultFromType(type) {
  switch (type) {
    case Type.BOOL:
    case Type.INT:
    case Type.UINT:
    case Type.FLOAT:
      return defaultValues[0];
    case Type.BOOL2:
    case Type.INT2:
    case Type.UINT2:
    case Type.FLOAT2:
      return defaultValues[1];
    case Type.BOOL4:
    case Type.INT4:
    case Type.UINT4:
    case Type.FLOAT4:
      return defaultValues[2];
    case Type.MAT4:
      return defaultValues[3];
    case Type.SAMPLER2D:
      return 'default-texture';
    case Type.SAMPLER_CUBE:
      return 'default-cube-texture';
    case Type.SAMPLER2D_ARRAY:
      return 'default-array-texture';
    case Type.SAMPLER3D:
      return 'default-3d-texture';
  }
  return defaultValues[0];
}
function getStringFromType(type) {
  switch (type) {
    case Type.SAMPLER2D:
      return '-texture';
    case Type.SAMPLER_CUBE:
      return '-cube-texture';
    case Type.SAMPLER2D_ARRAY:
      return '-array-texture';
    case Type.SAMPLER3D:
      return '-3d-texture';
    default:
      return '-unknown';
  }
}
function overrideMacros(target, source) {
  var entries = Object.entries(source);
  var isDifferent = false;
  for (var i = 0; i < entries.length; i++) {
    if (target[entries[i][0]] !== entries[i][1]) {
      target[entries[i][0]] = entries[i][1];
      isDifferent = true;
    }
  }
  return isDifferent;
}

function mapDefine(info, def) {
  switch (info.type) {
    case 'boolean':
      return typeof def === 'number' ? def.toString() : def ? '1' : '0';
    case 'string':
      return def !== undefined ? def : info.options[0];
    case 'number':
      return def !== undefined ? def.toString() : info.range[0].toString();
    default:
      warnID(16369);
      return '-1';
  }
}
function prepareDefines(defs, tDefs) {
  var macros = [];
  for (var i = 0; i < tDefs.length; i++) {
    var tmpl = tDefs[i];
    var name = tmpl.name;
    var v = defs[name];
    var value = mapDefine(tmpl, v);
    var isDefault = !v || v === '0';
    macros.push({
      name: name,
      value: value,
      isDefault: isDefault
    });
  }
  return macros;
}
function getShaderInstanceName(name, macros) {
  return name + macros.reduce(function (acc, cur) {
    return cur.isDefault ? acc : acc + "|" + cur.name + cur.value;
  }, '');
}
function dependencyCheck(dependencies, defines) {
  for (var i = 0; i < dependencies.length; i++) {
    var d = dependencies[i];
    if (d[0] === '!') {
      if (defines[d.slice(1)]) {
        return false;
      }
    } else if (!defines[d]) {
      return false;
    }
  }
  return true;
}
function getActiveAttributes(tmpl, gfxAttributes, defines) {
  var out = [];
  var attributes = tmpl.attributes;
  for (var i = 0; i < attributes.length; i++) {
    if (!dependencyCheck(attributes[i].defines, defines)) {
      continue;
    }
    out.push(gfxAttributes[i]);
  }
  return out;
}
function getVariantKey(programInfo, defines) {
  var tmplDefs = programInfo.defines;
  if (programInfo.uber) {
    var _key = '';
    for (var i = 0; i < tmplDefs.length; i++) {
      var tmplDef = tmplDefs[i];
      var value = defines[tmplDef.name];
      if (!value || !tmplDef._map) {
        continue;
      }
      var mapped = tmplDef._map(value);
      var offset = tmplDef._offset;
      _key += "" + offset + mapped + "|";
    }
    return "" + _key + programInfo.hash;
  }
  var key = 0;
  for (var _i = 0; _i < tmplDefs.length; _i++) {
    var _tmplDef = tmplDefs[_i];
    var _value = defines[_tmplDef.name];
    if (!_value || !_tmplDef._map) {
      continue;
    }
    var _mapped = _tmplDef._map(_value);
    var _offset = _tmplDef._offset;
    key |= _mapped << _offset;
  }
  return key.toString(16) + "|" + programInfo.hash;
}
var defaultUniformCounts = new Map();
defaultUniformCounts.set('cc_joints', UBOSkinning.LAYOUT.members[0].count);
defaultUniformCounts.set('cc_lightPos', UBOForwardLightEnum.LIGHTS_PER_PASS);
defaultUniformCounts.set('cc_lightColor', UBOForwardLightEnum.LIGHTS_PER_PASS);
defaultUniformCounts.set('cc_lightSizeRangeAngle', UBOForwardLightEnum.LIGHTS_PER_PASS);
defaultUniformCounts.set('cc_lightDir', UBOForwardLightEnum.LIGHTS_PER_PASS);
defaultUniformCounts.set('cc_lightBoundingSizeVS', UBOForwardLightEnum.LIGHTS_PER_PASS);
function getUniformSize(prevSize, m) {
  if (m.count) {
    return prevSize + GetTypeSize(m.type) * m.count;
  } else {
    var count = defaultUniformCounts.get(m.name);
    if (count !== undefined) {
      return prevSize + GetTypeSize(m.type) * count;
    }
    errorID(16345, m.name);
  }
  return prevSize;
}
function getSize(blockMembers) {
  return blockMembers.reduce(getUniformSize, 0);
}
function genHandles(tmpl) {
  var handleMap = {};
  for (var i = 0; i < tmpl.blocks.length; i++) {
    var block = tmpl.blocks[i];
    var members = block.members;
    var offset = 0;
    for (var j = 0; j < members.length; j++) {
      var uniform = members[j];
      handleMap[uniform.name] = genHandle(block.binding, uniform.type, uniform.count, offset);
      offset += (GetTypeSize(uniform.type) >> 2) * uniform.count;
    }
  }
  for (var _i2 = 0; _i2 < tmpl.samplerTextures.length; _i2++) {
    var samplerTexture = tmpl.samplerTextures[_i2];
    handleMap[samplerTexture.name] = genHandle(samplerTexture.binding, samplerTexture.type, samplerTexture.count);
  }
  return handleMap;
}
function getBitCount(cnt) {
  return Math.ceil(Math.log2(Math.max(cnt, 2)));
}
function populateMacros(tmpl) {
  var offset = 0;
  var _loop = function _loop() {
    var def = tmpl.defines[i];
    var cnt = 1;
    if (def.type === 'number') {
      var range = def.range;
      cnt = getBitCount(range[1] - range[0] + 1);
      def._map = function (value) {
        return value - range[0];
      };
    } else if (def.type === 'string') {
      cnt = getBitCount(def.options.length);
      def._map = function (value) {
        return Math.max(0, def.options.findIndex(function (s) {
          return s === value;
        }));
      };
    } else if (def.type === 'boolean') {
      def._map = function (value) {
        return value ? 1 : 0;
      };
    }
    def._offset = offset;
    offset += cnt;
  };
  for (var i = 0; i < tmpl.defines.length; i++) {
    _loop();
  }
  if (offset > 31) {
    tmpl.uber = true;
  }
  tmpl.constantMacros = '';
  for (var key in tmpl.builtins.statistics) {
    tmpl.constantMacros += "#define " + key + " " + tmpl.builtins.statistics[key] + "\n";
  }
}
function getCombinationDefines(combination) {
  var defines = Object.keys(combination).reduce(function (out, name) {
    return out.reduce(function (acc, cur) {
      var choices = combination[name];
      for (var i = 0; i < choices.length; ++i) {
        var _defines = _extends({}, cur);
        _defines[name] = choices[i];
        acc.push(_defines);
      }
      return acc;
    }, []);
  }, [{}]);
  return defines;
}
function addEffectDefaultProperties(effect) {
  for (var i = 0; i < effect.techniques.length; i++) {
    var tech = effect.techniques[i];
    for (var j = 0; j < tech.passes.length; j++) {
      var pass = tech.passes[j];
      if (pass.propertyIndex !== undefined && pass.properties === undefined) {
        pass.properties = tech.passes[pass.propertyIndex].properties;
      }
    }
  }
}

var _dsLayoutInfo = new DescriptorSetLayoutInfo();
function insertBuiltinBindings(tmpl, tmplInfo, source, type, outBindings) {
  var target = tmpl.builtins[type];
  var tempBlocks = [];
  var _loop = function _loop() {
    var b = target.blocks[i];
    var info = source.layouts[b.name];
    var binding = info && source.bindings.find(function (bd) {
      return bd.binding === info.binding;
    });
    if (!info || !binding || !(binding.descriptorType & DESCRIPTOR_BUFFER_TYPE)) {
      warnID(16348, b.name);
      return 1;
    }
    tempBlocks.push(info);
  };
  for (var i = 0; i < target.blocks.length; i++) {
    if (_loop()) continue;
  }
  Array.prototype.unshift.apply(tmplInfo.shaderInfo.blocks, tempBlocks);
  var tempSamplerTextures = [];
  var _loop2 = function _loop2() {
    var s = target.samplerTextures[_i];
    var info = source.layouts[s.name];
    var binding = info && source.bindings.find(function (bd) {
      return bd.binding === info.binding;
    });
    if (!info || !binding || !(binding.descriptorType & DESCRIPTOR_SAMPLER_TYPE)) {
      warnID(16349, s.name);
      return 1;
    }
    tempSamplerTextures.push(info);
  };
  for (var _i = 0; _i < target.samplerTextures.length; _i++) {
    if (_loop2()) continue;
  }
  Array.prototype.unshift.apply(tmplInfo.shaderInfo.samplerTextures, tempSamplerTextures);
}
var ProgramLib = function () {
  function ProgramLib() {
    this._templates = {};
    this._cache = {};
    this._templateInfos = {};
  }
  var _proto = ProgramLib.prototype;
  _proto.register = function register(effect) {
    for (var i = 0; i < effect.shaders.length; i++) {
      var tmpl = this.define(effect.shaders[i]);
      tmpl.effectName = effect.name;
    }
    for (var _i2 = 0; _i2 < effect.techniques.length; _i2++) {
      var tech = effect.techniques[_i2];
      for (var j = 0; j < tech.passes.length; j++) {
        var pass = tech.passes[j];
        if (pass.propertyIndex !== undefined && pass.properties === undefined) {
          pass.properties = tech.passes[pass.propertyIndex].properties;
        }
      }
    }
  };
  _proto.define = function define(shader) {
    var curTmpl = this._templates[shader.name];
    if (curTmpl && curTmpl.hash === shader.hash) {
      return curTmpl;
    }
    var tmpl = _extends({}, shader);
    populateMacros(tmpl);
    this._templates[shader.name] = tmpl;
    if (!this._templateInfos[tmpl.hash]) {
      var tmplInfo = {};
      tmplInfo.samplerStartBinding = tmpl.blocks.length;
      tmplInfo.shaderInfo = new ShaderInfo();
      tmplInfo.blockSizes = [];
      tmplInfo.bindings = [];
      for (var i = 0; i < tmpl.blocks.length; i++) {
        var block = tmpl.blocks[i];
        tmplInfo.blockSizes.push(getSize(block.members));
        tmplInfo.bindings.push(new DescriptorSetLayoutBinding(block.binding, DescriptorType.UNIFORM_BUFFER, 1, block.stageFlags));
        tmplInfo.shaderInfo.blocks.push(new UniformBlock(SetIndex.MATERIAL, block.binding, block.name, block.members.map(function (m) {
          return new Uniform(m.name, m.type, m.count);
        }), 1));
      }
      for (var _i3 = 0; _i3 < tmpl.samplerTextures.length; _i3++) {
        var samplerTexture = tmpl.samplerTextures[_i3];
        tmplInfo.bindings.push(new DescriptorSetLayoutBinding(samplerTexture.binding, DescriptorType.SAMPLER_TEXTURE, samplerTexture.count, samplerTexture.stageFlags));
        tmplInfo.shaderInfo.samplerTextures.push(new UniformSamplerTexture(SetIndex.MATERIAL, samplerTexture.binding, samplerTexture.name, samplerTexture.type, samplerTexture.count));
      }
      for (var _i4 = 0; _i4 < tmpl.samplers.length; _i4++) {
        var sampler = tmpl.samplers[_i4];
        tmplInfo.bindings.push(new DescriptorSetLayoutBinding(sampler.binding, DescriptorType.SAMPLER, sampler.count, sampler.stageFlags));
        tmplInfo.shaderInfo.samplers.push(new UniformSampler(SetIndex.MATERIAL, sampler.binding, sampler.name, sampler.count));
      }
      for (var _i5 = 0; _i5 < tmpl.textures.length; _i5++) {
        var texture = tmpl.textures[_i5];
        tmplInfo.bindings.push(new DescriptorSetLayoutBinding(texture.binding, DescriptorType.TEXTURE, texture.count, texture.stageFlags));
        tmplInfo.shaderInfo.textures.push(new UniformTexture(SetIndex.MATERIAL, texture.binding, texture.name, texture.type, texture.count));
      }
      for (var _i6 = 0; _i6 < tmpl.buffers.length; _i6++) {
        var buffer = tmpl.buffers[_i6];
        tmplInfo.bindings.push(new DescriptorSetLayoutBinding(buffer.binding, DescriptorType.STORAGE_BUFFER, 1, buffer.stageFlags));
        tmplInfo.shaderInfo.buffers.push(new UniformStorageBuffer(SetIndex.MATERIAL, buffer.binding, buffer.name, 1, buffer.memoryAccess));
      }
      for (var _i7 = 0; _i7 < tmpl.images.length; _i7++) {
        var image = tmpl.images[_i7];
        tmplInfo.bindings.push(new DescriptorSetLayoutBinding(image.binding, DescriptorType.STORAGE_IMAGE, image.count, image.stageFlags));
        tmplInfo.shaderInfo.images.push(new UniformStorageImage(SetIndex.MATERIAL, image.binding, image.name, image.type, image.count, image.memoryAccess));
      }
      for (var _i8 = 0; _i8 < tmpl.subpassInputs.length; _i8++) {
        var subpassInput = tmpl.subpassInputs[_i8];
        tmplInfo.bindings.push(new DescriptorSetLayoutBinding(subpassInput.binding, DescriptorType.INPUT_ATTACHMENT, subpassInput.count, subpassInput.stageFlags));
        tmplInfo.shaderInfo.subpassInputs.push(new UniformInputAttachment(SetIndex.MATERIAL, subpassInput.binding, subpassInput.name, subpassInput.count));
      }
      tmplInfo.gfxAttributes = [];
      for (var _i9 = 0; _i9 < tmpl.attributes.length; _i9++) {
        var attr = tmpl.attributes[_i9];
        tmplInfo.gfxAttributes.push(new Attribute(attr.name, attr.format, attr.isNormalized, 0, attr.isInstanced, attr.location));
      }
      insertBuiltinBindings(tmpl, tmplInfo, localDescriptorSetLayout, 'locals');
      tmplInfo.shaderInfo.stages.push(new ShaderStage(ShaderStageFlagBit.VERTEX, ''));
      tmplInfo.shaderInfo.stages.push(new ShaderStage(ShaderStageFlagBit.FRAGMENT, ''));
      tmplInfo.handleMap = genHandles(tmpl);
      tmplInfo.setLayouts = [];
      this._templateInfos[tmpl.hash] = tmplInfo;
    }
    return tmpl;
  };
  _proto.getTemplate = function getTemplate(name) {
    return this._templates[name];
  };
  _proto.getTemplateInfo = function getTemplateInfo(name) {
    var hash = this._templates[name].hash;
    return this._templateInfos[hash];
  };
  _proto.getDescriptorSetLayout = function getDescriptorSetLayout(device, name, isLocal) {
    if (isLocal === void 0) {
      isLocal = false;
    }
    var tmpl = this._templates[name];
    var tmplInfo = this._templateInfos[tmpl.hash];
    if (!tmplInfo.setLayouts.length) {
      _dsLayoutInfo.bindings = tmplInfo.bindings;
      tmplInfo.setLayouts[SetIndex.MATERIAL] = device.createDescriptorSetLayout(_dsLayoutInfo);
      _dsLayoutInfo.bindings = localDescriptorSetLayout.bindings;
      tmplInfo.setLayouts[SetIndex.LOCAL] = device.createDescriptorSetLayout(_dsLayoutInfo);
    }
    return tmplInfo.setLayouts[isLocal ? SetIndex.LOCAL : SetIndex.MATERIAL];
  };
  _proto.hasProgram = function hasProgram(name) {
    return this._templates[name] !== undefined;
  };
  _proto.getKey = function getKey(name, defines) {
    var tmpl = this._templates[name];
    return getVariantKey(tmpl, defines);
  };
  _proto.destroyShaderByDefines = function destroyShaderByDefines(defines) {
    var _this = this;
    var names = Object.keys(defines);
    if (!names.length) {
      return;
    }
    var regexes = names.map(function (cur) {
      var val = defines[cur];
      if (typeof val === 'boolean') {
        val = val ? '1' : '0';
      }
      return new RegExp("" + cur + val);
    });
    var keys = Object.keys(this._cache).filter(function (k) {
      return regexes.every(function (re) {
        return re.test(_this._cache[k].name);
      });
    });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var prog = this._cache[k];
      debug("destroyed shader " + prog.name);
      prog.destroy();
      delete this._cache[k];
    }
  };
  _proto.getGFXShader = function getGFXShader(device, name, defines, pipeline, key) {
    Object.assign(defines, pipeline.macros);
    if (!key) key = this.getKey(name, defines);
    var res = this._cache[key];
    if (res) {
      return res;
    }
    var tmpl = this._templates[name];
    var tmplInfo = this._templateInfos[tmpl.hash];
    if (!tmplInfo.pipelineLayout) {
      this.getDescriptorSetLayout(device, name);
      insertBuiltinBindings(tmpl, tmplInfo, globalDescriptorSetLayout, 'globals');
      tmplInfo.setLayouts[SetIndex.GLOBAL] = pipeline.descriptorSetLayout;
      tmplInfo.pipelineLayout = device.createPipelineLayout(new PipelineLayoutInfo(tmplInfo.setLayouts));
    }
    var macroArray = prepareDefines(defines, tmpl.defines);
    var prefix = pipeline.constantMacros + tmpl.constantMacros + macroArray.reduce(function (acc, cur) {
      return acc + "#define " + cur.name + " " + cur.value + "\n";
    }, '');
    var src = tmpl.glsl3;
    var deviceShaderVersion = getDeviceShaderVersion(device);
    if (deviceShaderVersion) {
      src = tmpl[deviceShaderVersion];
    } else {
      errorID(16346);
    }
    tmplInfo.shaderInfo.stages[0].source = prefix + src.vert;
    tmplInfo.shaderInfo.stages[1].source = prefix + src.frag;
    tmplInfo.shaderInfo.attributes = getActiveAttributes(tmpl, tmplInfo.gfxAttributes, defines);
    tmplInfo.shaderInfo.name = getShaderInstanceName(name, macroArray);
    var shaderInfo = tmplInfo.shaderInfo;
    return this._cache[key] = device.createShader(shaderInfo);
  };
  return ProgramLib;
}();
function getDeviceShaderVersion(device) {
  switch (device.gfxAPI) {
    case API.GLES2:
    case API.WEBGL:
      return 'glsl1';
    case API.GLES3:
    case API.WEBGL2:
      return 'glsl3';
    default:
      return 'glsl4';
  }
}
var programLib = new ProgramLib();
cclegacy.programLib = programLib;

function instancingCompareFn(l, r) {
  var ls = l.sortRender;
  var rs = r.sortRender;
  return ls.hash - rs.hash || ls.shaderId - rs.shaderId;
}
var INITIAL_CAPACITY = 32;
var MAX_CAPACITY = 1024;
var InstancedBuffer = function () {
  function InstancedBuffer(pass) {
    this.instances = [];
    this.hasPendingModels = false;
    this.dynamicOffsets = [];
    this.sortRender = void 0;
    this._device = pass.device;
    this.pass = pass;
    this._passPool = getPassPool();
    this.sortRender = this._passPool.add();
  }
  var _proto = InstancedBuffer.prototype;
  _proto.destroy = function destroy() {
    this.instances.forEach(function (instance) {
      instance.vb.destroy();
      instance.ia.destroy();
    });
    this._passPool.reset();
    this.instances.length = 0;
  };
  _proto.merge = function merge(subModel, passIdx, shaderImplant) {
    if (shaderImplant === void 0) {
      shaderImplant = null;
    }
    var attrs = subModel.instancedAttributeBlock;
    var stride = attrs.buffer.length;
    if (!stride) {
      return;
    }
    var sourceIA = subModel.inputAssembler;
    var subModelDescriptorSet = subModel.descriptorSet;
    var lightingMap = subModelDescriptorSet.getTexture(UNIFORM_LIGHTMAP_TEXTURE_BINDING);
    var reflectionProbeCubemap = subModelDescriptorSet.getTexture(UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING);
    var reflectionProbePlanarMap = subModelDescriptorSet.getTexture(UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING);
    var reflectionProbeBlendCubemap = null;
    var useReflectionProbeType = subModel.useReflectionProbeType;
    var shader = shaderImplant;
    if (!shader) {
      shader = subModel.shaders[passIdx];
    }
    var descriptorSet = subModel.descriptorSet;
    var hash = subModel.passes[passIdx].priority << 16 | subModel.priority << 8 | passIdx;
    this.sortRender.hash = hash;
    this.sortRender.shaderId = shader.typedID;
    this.sortRender.passIdx = passIdx;
    for (var i = 0; i < this.instances.length; ++i) {
      var _instance$ia$indexBuf, _sourceIA$indexBuffer;
      var instance = this.instances[i];
      if (((_instance$ia$indexBuf = instance.ia.indexBuffer) == null ? void 0 : _instance$ia$indexBuf.objectID) !== ((_sourceIA$indexBuffer = sourceIA.indexBuffer) == null ? void 0 : _sourceIA$indexBuffer.objectID) || instance.count >= MAX_CAPACITY) {
        continue;
      }
      if (instance.lightingMap.objectID !== lightingMap.objectID) {
        continue;
      }
      if (instance.useReflectionProbeType !== useReflectionProbeType) {
        continue;
      }
      if (instance.reflectionProbeCubemap.objectID !== reflectionProbeCubemap.objectID) {
        continue;
      }
      if (instance.reflectionProbePlanarMap.objectID !== reflectionProbePlanarMap.objectID) {
        continue;
      }
      if (instance.stride !== stride) {
        continue;
      }
      if (instance.count >= instance.capacity) {
        instance.capacity <<= 1;
        var newSize = instance.stride * instance.capacity;
        var oldData = instance.data;
        instance.data = new Uint8Array(newSize);
        instance.data.set(oldData);
        instance.vb.resize(newSize);
      }
      instance.shader = shader;
      instance.descriptorSet = descriptorSet;
      instance.data.set(attrs.buffer, instance.stride * instance.count++);
      this.hasPendingModels = true;
      return;
    }
    var vb = this._device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, stride * INITIAL_CAPACITY, stride));
    var data = new Uint8Array(stride * INITIAL_CAPACITY);
    var vertexBuffers = sourceIA.vertexBuffers.slice();
    var attributes = sourceIA.attributes.slice();
    var indexBuffer = sourceIA.indexBuffer;
    for (var _i = 0; _i < attrs.attributes.length; _i++) {
      var attr = attrs.attributes[_i];
      var newAttr = new Attribute(attr.name, attr.format, attr.isNormalized, vertexBuffers.length, true);
      attributes.push(newAttr);
    }
    data.set(attrs.buffer);
    vertexBuffers.push(vb);
    var iaInfo = new InputAssemblerInfo(attributes, vertexBuffers, indexBuffer);
    var ia = this._device.createInputAssembler(iaInfo);
    this.instances.push({
      count: 1,
      capacity: INITIAL_CAPACITY,
      vb: vb,
      data: data,
      ia: ia,
      stride: stride,
      shader: shader,
      descriptorSet: descriptorSet,
      lightingMap: lightingMap,
      reflectionProbeCubemap: reflectionProbeCubemap,
      reflectionProbePlanarMap: reflectionProbePlanarMap,
      useReflectionProbeType: useReflectionProbeType,
      reflectionProbeBlendCubemap: reflectionProbeBlendCubemap
    });
    this.hasPendingModels = true;
  };
  _proto.uploadBuffers = function uploadBuffers(cmdBuff) {
    for (var i = 0; i < this.instances.length; ++i) {
      var instance = this.instances[i];
      if (!instance.count) {
        continue;
      }
      instance.ia.instanceCount = instance.count;
      cmdBuff.updateBuffer(instance.vb, instance.data);
    }
  };
  _proto.clear = function clear() {
    this.instances.forEach(function (instance) {
      instance.count = 0;
    });
    this.hasPendingModels = false;
    this._passPool.reset();
  };
  return InstancedBuffer;
}();

var _bufferInfo = new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE);
var _bufferViewInfo = new BufferViewInfo(null);
var _dsInfo = new DescriptorSetInfo(null);
var _materialSet = 1;
var BatchingSchemes;
(function (BatchingSchemes) {
  BatchingSchemes[BatchingSchemes["NONE"] = 0] = "NONE";
  BatchingSchemes[BatchingSchemes["INSTANCING"] = 1] = "INSTANCING";
})(BatchingSchemes || (BatchingSchemes = {}));
var Pass = function () {
  function Pass(root) {
    this._rootBuffer = null;
    this._buffers = [];
    this._descriptorSet = null;
    this._pipelineLayout = null;
    this._passIndex = 0;
    this._propertyIndex = 0;
    this._programName = '';
    this._dynamics = {};
    this._propertyHandleMap = {};
    this._rootBlock = null;
    this._blocksInt = [];
    this._blocks = [];
    this._shaderInfo = null;
    this._defines = {};
    this._properties = {};
    this._shader = null;
    this._bs = new BlendState();
    this._dss = new DepthStencilState();
    this._rs = new RasterizerState();
    this._priority = RenderPriority.DEFAULT;
    this._stage = RenderPassStage.DEFAULT;
    this._phase = getPhaseID('default');
    this._passID = 0xFFFFFFFF;
    this._subpassID = 0xFFFFFFFF;
    this._phaseID = 0xFFFFFFFF;
    this._primitive = PrimitiveMode.TRIANGLE_LIST;
    this._batchingScheme = BatchingSchemes.NONE;
    this._dynamicStates = DynamicStateFlagBit.NONE;
    this._instancedBuffers = {};
    this._hash = 0;
    this._rootBufferDirty = false;
    this._root = root;
    this._device = deviceManager.gfxDevice;
  }
  Pass.fillPipelineInfo = function fillPipelineInfo(pass, info) {
    if (info.priority !== undefined) {
      pass._priority = info.priority;
    }
    if (info.primitive !== undefined) {
      pass._primitive = info.primitive;
    }
    if (info.stage !== undefined) {
      pass._stage = info.stage;
    }
    if (info.dynamicStates !== undefined) {
      pass._dynamicStates = info.dynamicStates;
    }
    if (info.phase !== undefined) {
      pass._phase = getPhaseID(info.phase);
    }
    var bs = pass._bs;
    if (info.blendState) {
      var bsInfo = info.blendState;
      var targets = bsInfo.targets;
      if (targets) {
        targets.forEach(function (t, i) {
          bs.setTarget(i, t);
        });
      }
      if (bsInfo.isA2C !== undefined) {
        bs.isA2C = bsInfo.isA2C;
      }
      if (bsInfo.isIndepend !== undefined) {
        bs.isIndepend = bsInfo.isIndepend;
      }
      if (bsInfo.blendColor !== undefined) {
        bs.blendColor = bsInfo.blendColor;
      }
    }
    pass._rs.assign(info.rasterizerState);
    pass._dss.assign(info.depthStencilState);
  };
  Pass.getPassHash = function getPassHash(pass) {
    var shaderKey = '';
    if (cclegacy.rendering && cclegacy.rendering.enableEffectImport) {
      var key = cclegacy.rendering.programLib.getKey(pass._phaseID, pass.program, pass.defines);
      shaderKey = pass._phaseID.toString() + "," + key;
    } else {
      shaderKey = programLib.getKey(pass.program, pass.defines);
    }
    var res = shaderKey + "," + pass._primitive + "," + pass._dynamicStates;
    res += serializeBlendState(pass._bs);
    res += serializeDepthStencilState(pass._dss);
    res += serializeRasterizerState(pass._rs);
    return murmurhash2_32_gc(res, 666);
  };
  var _proto = Pass.prototype;
  _proto.initialize = function initialize(info) {
    this._doInit(info);
    this.resetUBOs();
    this.resetTextures();
    this.tryCompile();
  };
  _proto.getHandle = function getHandle(name, offset, targetType) {
    if (offset === void 0) {
      offset = 0;
    }
    if (targetType === void 0) {
      targetType = Type.UNKNOWN;
    }
    var handle = this._propertyHandleMap[name];
    if (!handle) {
      return 0;
    }
    if (targetType) {
      handle = customizeType(handle, targetType);
    } else if (offset) {
      handle = customizeType(handle, getTypeFromHandle(handle) - offset);
    }
    return handle + offset;
  };
  _proto.getBinding = function getBinding(name) {
    var handle = this.getHandle(name);
    if (!handle) {
      return -1;
    }
    return getBindingFromHandle(handle);
  };
  _proto.setUniform = function setUniform(handle, value) {
    var binding = getBindingFromHandle(handle);
    var type = getTypeFromHandle(handle);
    var ofs = getOffsetFromHandle(handle);
    var block = this._getBlockView(type, binding);
    {
      var validator = type2validator[type];
      assertID(Boolean(validator && validator(value)), 12011, binding, Type[type]);
    }
    type2writer[type](block, value, ofs);
    this._rootBufferDirty = true;
  };
  _proto.getUniform = function getUniform(handle, out) {
    var binding = getBindingFromHandle(handle);
    var type = getTypeFromHandle(handle);
    var ofs = getOffsetFromHandle(handle);
    var block = this._getBlockView(type, binding);
    return type2reader[type](block, out, ofs);
  };
  _proto.setUniformArray = function setUniformArray(handle, value) {
    var binding = getBindingFromHandle(handle);
    var type = getTypeFromHandle(handle);
    var stride = GetTypeSize(type) >> 2;
    var block = this._getBlockView(type, binding);
    var ofs = getOffsetFromHandle(handle);
    for (var i = 0; i < value.length; i++, ofs += stride) {
      if (value[i] === null) {
        continue;
      }
      type2writer[type](block, value[i], ofs);
    }
    this._rootBufferDirty = true;
  };
  _proto.bindTexture = function bindTexture(binding, value, index) {
    this._descriptorSet.bindTexture(binding, value, index || 0);
  };
  _proto.bindSampler = function bindSampler(binding, value, index) {
    this._descriptorSet.bindSampler(binding, value, index || 0);
  };
  _proto.setDynamicState = function setDynamicState(state, value) {
    var ds = this._dynamics[state];
    if (ds && ds.value === value) {
      return;
    }
    ds.value = value;
    ds.dirty = true;
  };
  _proto.overridePipelineStates = function overridePipelineStates(original, overrides) {
    warnID(12102);
  };
  _proto.update = function update() {
    if (!this._descriptorSet) {
      errorID(12006);
      return;
    }
    if (this._rootBuffer && this._rootBufferDirty) {
      this._rootBuffer.update(this._rootBlock);
      this._rootBufferDirty = false;
    }
    this._descriptorSet.update();
  };
  _proto.getInstancedBuffer = function getInstancedBuffer(extraKey) {
    if (extraKey === void 0) {
      extraKey = 0;
    }
    return this._instancedBuffers[extraKey] || (this._instancedBuffers[extraKey] = new InstancedBuffer(this));
  };
  _proto.destroy = function destroy() {
    for (var i = 0; i < this._shaderInfo.blocks.length; i++) {
      var u = this._shaderInfo.blocks[i];
      this._buffers[u.binding].destroy();
    }
    this._buffers = [];
    if (this._rootBuffer) {
      this._rootBuffer.destroy();
      this._rootBuffer = null;
    }
    for (var ib in this._instancedBuffers) {
      this._instancedBuffers[ib].destroy();
    }
    this._descriptorSet.destroy();
    this._rs.destroy();
    this._dss.destroy();
    this._bs.destroy();
  };
  _proto.resetUniform = function resetUniform(name) {
    var handle = this.getHandle(name);
    if (!handle) {
      return;
    }
    var type = getTypeFromHandle(handle);
    var binding = getBindingFromHandle(handle);
    var ofs = getOffsetFromHandle(handle);
    var count = getCountFromHandle(handle);
    var block = this._getBlockView(type, binding);
    var info = this._properties[name];
    var givenDefault = info && info.value;
    var value = givenDefault || getDefaultFromType(type);
    var size = (GetTypeSize(type) >> 2) * count;
    for (var k = 0; k + value.length <= size; k += value.length) {
      block.set(value, ofs + k);
    }
    this._rootBufferDirty = true;
  };
  _proto.resetTexture = function resetTexture(name, index) {
    var handle = this.getHandle(name);
    if (!handle) {
      return;
    }
    var type = getTypeFromHandle(handle);
    var binding = getBindingFromHandle(handle);
    var info = this._properties[name];
    var value = info && info.value;
    var textureBase;
    if (typeof value === 'string') {
      textureBase = builtinResMgr.get("" + value + getStringFromType(type));
    } else {
      textureBase = value || builtinResMgr.get(getDefaultFromType(type));
    }
    var texture = textureBase && textureBase.getGFXTexture();
    var samplerInfo = info && info.samplerHash !== undefined ? Sampler.unpackFromHash(info.samplerHash) : textureBase && textureBase.getSamplerInfo();
    var sampler = this._device.getSampler(samplerInfo);
    this._descriptorSet.bindSampler(binding, sampler, index || 0);
    this._descriptorSet.bindTexture(binding, texture, index || 0);
  };
  _proto.resetUBOs = function resetUBOs() {
    for (var i = 0; i < this._shaderInfo.blocks.length; i++) {
      var u = this._shaderInfo.blocks[i];
      var ofs = 0;
      for (var j = 0; j < u.members.length; j++) {
        var cur = u.members[j];
        var block = this._getBlockView(cur.type, u.binding);
        var info = this._properties[cur.name];
        var givenDefault = info && info.value;
        var value = givenDefault || getDefaultFromType(cur.type);
        var size = (GetTypeSize(cur.type) >> 2) * cur.count;
        for (var k = 0; k + value.length <= size; k += value.length) {
          block.set(value, ofs + k);
        }
        ofs += size;
      }
    }
    this._rootBufferDirty = true;
  };
  _proto.resetTextures = function resetTextures() {
    var _this = this;
    if (cclegacy.rendering) {
      var set = this._shaderInfo.descriptors[SetIndex.MATERIAL];
      set.samplerTextures.forEach(function (combined) {
        for (var j = 0; j < combined.count; ++j) {
          _this.resetTexture(combined.name, j);
        }
      });
    } else {
      for (var i = 0; i < this._shaderInfo.samplerTextures.length; i++) {
        var u = this._shaderInfo.samplerTextures[i];
        for (var j = 0; j < u.count; j++) {
          this.resetTexture(u.name, j);
        }
      }
    }
  };
  _proto.tryCompile = function tryCompile() {
    var pipeline = this._root.pipeline;
    if (!pipeline) {
      return false;
    }
    this._syncBatchingScheme();
    if (cclegacy.rendering && cclegacy.rendering.enableEffectImport) {
      var _programLib = cclegacy.rendering.programLib;
      var program = _programLib.getProgramVariant(this._device, this._phaseID, this._programName, this._defines);
      if (!program) {
        warnID(12103, this._programName);
        return false;
      }
      this._shader = program.shader;
      this._pipelineLayout = _programLib.getPipelineLayout(this.device, this._phaseID, this._programName);
    } else {
      var shader = programLib.getGFXShader(this._device, this._programName, this._defines, pipeline);
      if (!shader) {
        warnID(12104, this._programName);
        return false;
      }
      this._shader = shader;
      this._pipelineLayout = programLib.getTemplateInfo(this._programName).pipelineLayout;
    }
    this._hash = Pass.getPassHash(this);
    return true;
  };
  _proto.getShaderVariant = function getShaderVariant(patches) {
    if (patches === void 0) {
      patches = null;
    }
    if (!this._shader && !this.tryCompile()) {
      warnID(12105);
      return null;
    }
    if (!patches) {
      return this._shader;
    }
    var pipeline = this._root.pipeline;
    for (var _i = 0; _i < patches.length; _i++) {
      var patch = patches[_i];
      this._defines[patch.name] = patch.value;
    }
    if (this._isBlend) {
      this._defines.CC_IS_TRANSPARENCY_PASS = 1;
    }
    var shader = null;
    if (cclegacy.rendering && cclegacy.rendering.enableEffectImport) {
      var program = cclegacy.rendering.programLib.getProgramVariant(this._device, this._phaseID, this._programName, this._defines);
      if (program) {
        shader = program.shader;
      }
    } else {
      shader = programLib.getGFXShader(this._device, this._programName, this._defines, pipeline);
    }
    for (var _i2 = 0; _i2 < patches.length; _i2++) {
      var _patch = patches[_i2];
      delete this._defines[_patch.name];
    }
    return shader;
  };
  _proto.beginChangeStatesSilently = function beginChangeStatesSilently() {};
  _proto.endChangeStatesSilently = function endChangeStatesSilently() {};
  _proto._doInit = function _doInit(info, copyDefines) {
    var _cclegacy$rendering;
    if (copyDefines === void 0) {
      copyDefines = false;
    }
    this._priority = RenderPriority.DEFAULT;
    this._stage = RenderPassStage.DEFAULT;
    var enableEffectImport = (_cclegacy$rendering = cclegacy.rendering) == null ? void 0 : _cclegacy$rendering.enableEffectImport;
    if (enableEffectImport) {
      var r = cclegacy.rendering;
      if (typeof info.phase === 'number') {
        this._passID = info._passID;
        this._subpassID = info._subpassID;
        this._phaseID = info._phaseID;
      } else {
        this._passID = r.getPassID(info.pass);
        if (this._passID !== r.INVALID_ID) {
          if (info.subpass) {
            this._subpassID = r.getSubpassID(this._passID, info.subpass);
            this._phaseID = r.getPhaseID(this._subpassID, info.phase);
          } else {
            this._phaseID = r.getPhaseID(this._passID, info.phase);
          }
        }
      }
      if (this._passID === r.INVALID_ID) {
        errorID(12107, info.program);
        return;
      }
      if (this._phaseID === r.INVALID_ID) {
        errorID(12108, info.program);
        return;
      }
    } else {
      if (typeof info.phase === 'number') {
        this._passID = info._passID;
      } else if (info.pass && info.pass !== 'default') {
        assertID(this._passID === 0xFFFFFFFF, 12110);
        this._passID = 0;
      }
    }
    this._phase = getPhaseID('default');
    this._primitive = PrimitiveMode.TRIANGLE_LIST;
    this._passIndex = info.passIndex;
    this._propertyIndex = info.propertyIndex !== undefined ? info.propertyIndex : info.passIndex;
    this._programName = info.program;
    this._defines = copyDefines ? _extends({}, info.defines) : info.defines;
    if (enableEffectImport) {
      this._shaderInfo = cclegacy.rendering.programLib.getProgramInfo(this._phaseID, this._programName);
    } else {
      this._shaderInfo = programLib.getTemplate(info.program);
    }
    this._properties = info.properties || this._properties;
    var device = this._device;
    Pass.fillPipelineInfo(this, info);
    if (info.stateOverrides) {
      Pass.fillPipelineInfo(this, info.stateOverrides);
    }
    if (enableEffectImport) {
      _dsInfo.layout = cclegacy.rendering.programLib.getMaterialDescriptorSetLayout(this._device, this._phaseID, info.program);
    } else {
      _dsInfo.layout = programLib.getDescriptorSetLayout(this._device, info.program);
    }
    this._descriptorSet = this._device.createDescriptorSet(_dsInfo);
    var blocks = this._shaderInfo.blocks;
    var blockSizes;
    var handleMap;
    if (enableEffectImport) {
      var _programLib2 = cclegacy.rendering.programLib;
      blockSizes = _programLib2.getBlockSizes(this._phaseID, this._programName);
      handleMap = _programLib2.getHandleMap(this._phaseID, this._programName);
    } else {
      var tmplInfo = programLib.getTemplateInfo(info.program);
      blockSizes = tmplInfo.blockSizes;
      handleMap = tmplInfo.handleMap;
    }
    if (enableEffectImport) {
      var _programLib3 = cclegacy.rendering.programLib;
      var shaderInfo = _programLib3.getShaderInfo(this._phaseID, this.program);
      this._buildMaterialUniformBlocks(device, shaderInfo.blocks, blockSizes);
    } else {
      this._buildUniformBlocks(device, blocks, blockSizes);
    }
    var directHandleMap = this._propertyHandleMap = handleMap;
    var indirectHandleMap = {};
    for (var name in this._properties) {
      var prop = this._properties[name];
      if (!prop.handleInfo) {
        continue;
      }
      indirectHandleMap[name] = this.getHandle.apply(this, prop.handleInfo);
    }
    Object.assign(directHandleMap, indirectHandleMap);
  };
  _proto._buildUniformBlocks = function _buildUniformBlocks(device, blocks, blockSizes) {
    var alignment = device.capabilities.uboOffsetAlignment;
    var startOffsets = [];
    var lastSize = 0;
    var lastOffset = 0;
    for (var i = 0; i < blocks.length; i++) {
      var size = blockSizes[i];
      startOffsets.push(lastOffset);
      lastOffset += Math.ceil(size / alignment) * alignment;
      lastSize = size;
    }
    var totalSize = startOffsets[startOffsets.length - 1] + Math.ceil(lastSize / 16) * 16;
    if (totalSize) {
      _bufferInfo.size = Math.ceil(totalSize / 16) * 16;
      this._rootBuffer = device.createBuffer(_bufferInfo);
      this._rootBlock = new ArrayBuffer(totalSize);
    }
    for (var _i3 = 0, count = 0; _i3 < blocks.length; _i3++) {
      var binding = blocks[_i3].binding;
      var _size = blockSizes[_i3];
      _bufferViewInfo.buffer = this._rootBuffer;
      _bufferViewInfo.offset = startOffsets[count++];
      _bufferViewInfo.range = Math.ceil(_size / 16) * 16;
      var bufferView = this._buffers[binding] = device.createBuffer(_bufferViewInfo);
      this._blocks[binding] = new Float32Array(this._rootBlock, _bufferViewInfo.offset, _size / Float32Array.BYTES_PER_ELEMENT);
      this._blocksInt[binding] = new Int32Array(this._blocks[binding].buffer, this._blocks[binding].byteOffset, this._blocks[binding].length);
      this._descriptorSet.bindBuffer(binding, bufferView);
    }
  };
  _proto._buildMaterialUniformBlocks = function _buildMaterialUniformBlocks(device, blocks, blockSizes) {
    var alignment = device.capabilities.uboOffsetAlignment;
    var startOffsets = [];
    var lastSize = 0;
    var lastOffset = 0;
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      if (block.set !== _materialSet) {
        continue;
      }
      var size = blockSizes[i];
      startOffsets.push(lastOffset);
      lastOffset += Math.ceil(size / alignment) * alignment;
      lastSize = size;
    }
    if (lastSize !== 0) {
      var totalSize = startOffsets[startOffsets.length - 1] + lastSize;
      if (totalSize) {
        _bufferInfo.size = Math.ceil(totalSize / 16) * 16;
        this._rootBuffer = device.createBuffer(_bufferInfo);
        this._rootBlock = new ArrayBuffer(totalSize);
      }
    }
    for (var _i4 = 0, count = 0; _i4 < blocks.length; _i4++) {
      var _block = blocks[_i4];
      if (_block.set !== _materialSet) {
        continue;
      }
      var binding = blocks[_i4].binding;
      var _size2 = blockSizes[_i4];
      _bufferViewInfo.buffer = this._rootBuffer;
      _bufferViewInfo.offset = startOffsets[count++];
      _bufferViewInfo.range = Math.ceil(_size2 / 16) * 16;
      var bufferView = this._buffers[binding] = device.createBuffer(_bufferViewInfo);
      this._blocks[binding] = new Float32Array(this._rootBlock, _bufferViewInfo.offset, _size2 / Float32Array.BYTES_PER_ELEMENT);
      this._blocksInt[binding] = new Int32Array(this._blocks[binding].buffer, this._blocks[binding].byteOffset, this._blocks[binding].length);
      this._descriptorSet.bindBuffer(binding, bufferView);
    }
  };
  _proto._syncBatchingScheme = function _syncBatchingScheme() {
    if (this._defines.USE_INSTANCING) {
      if (this._device.hasFeature(Feature.INSTANCED_ARRAYS)) {
        this._batchingScheme = BatchingSchemes.INSTANCING;
      } else {
        this._defines.USE_INSTANCING = false;
        this._batchingScheme = BatchingSchemes.NONE;
      }
    } else {
      this._batchingScheme = BatchingSchemes.NONE;
    }
  };
  _proto._getBlockView = function _getBlockView(type, binding) {
    return type < Type.FLOAT ? this._blocksInt[binding] : this._blocks[binding];
  };
  _proto._initPassFromTarget = function _initPassFromTarget(target, dss, hashFactor) {
    this._priority = target.priority;
    this._stage = target.stage;
    this._phase = target.phase;
    this._phaseID = target._phaseID;
    this._passID = target._passID;
    this._batchingScheme = target.batchingScheme;
    this._primitive = target.primitive;
    this._dynamicStates = target.dynamicStates;
    this._bs = target.blendState;
    this._dss = dss;
    this._descriptorSet = target.descriptorSet;
    this._rs = target.rasterizerState;
    this._passIndex = target.passIndex;
    this._propertyIndex = target.propertyIndex;
    this._programName = target.program;
    this._defines = target.defines;
    this._shaderInfo = target._shaderInfo;
    this._properties = target._properties;
    this._blocks = target._blocks;
    this._blocksInt = target._blocksInt;
    this._dynamics = target._dynamics;
    this._shader = target._shader;
    if (cclegacy.rendering && cclegacy.rendering.enableEffectImport) {
      this._pipelineLayout = cclegacy.rendering.programLib.getPipelineLayout(this.device, this._phaseID, this._programName);
    } else {
      this._pipelineLayout = programLib.getTemplateInfo(this._programName).pipelineLayout;
    }
    this._hash = target._hash ^ hashFactor;
  };
  _proto._updatePassHash = function _updatePassHash() {
    this._hash = Pass.getPassHash(this);
  };
  _proto.setRootBufferDirty = function setRootBufferDirty(val) {
    this._rootBufferDirty = val;
  };
  _proto.setPriority = function setPriority(val) {
    this._priority = val;
  };
  return _createClass(Pass, [{
    key: "_isBlend",
    get: function get() {
      return this.blendState.targets.some(function (target) {
        return target.blend;
      });
    }
  }, {
    key: "root",
    get: function get() {
      return this._root;
    }
  }, {
    key: "device",
    get: function get() {
      return this._device;
    }
  }, {
    key: "shaderInfo",
    get: function get() {
      return this._shaderInfo;
    }
  }, {
    key: "localSetLayout",
    get: function get() {
      if (cclegacy.rendering && cclegacy.rendering.enableEffectImport) {
        return cclegacy.rendering.programLib.getLocalDescriptorSetLayout(this._device, this._phaseID, this._programName);
      } else {
        return programLib.getDescriptorSetLayout(this._device, this._programName, true);
      }
    }
  }, {
    key: "program",
    get: function get() {
      return this._programName;
    }
  }, {
    key: "properties",
    get: function get() {
      return this._properties;
    }
  }, {
    key: "defines",
    get: function get() {
      return this._defines;
    }
  }, {
    key: "passIndex",
    get: function get() {
      return this._passIndex;
    }
  }, {
    key: "propertyIndex",
    get: function get() {
      return this._propertyIndex;
    }
  }, {
    key: "dynamics",
    get: function get() {
      return this._dynamics;
    }
  }, {
    key: "blocks",
    get: function get() {
      return this._blocks;
    }
  }, {
    key: "blocksInt",
    get: function get() {
      return this._blocksInt;
    }
  }, {
    key: "rootBufferDirty",
    get: function get() {
      return this._rootBufferDirty;
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    }
  }, {
    key: "primitive",
    get: function get() {
      return this._primitive;
    }
  }, {
    key: "stage",
    get: function get() {
      return this._stage;
    }
  }, {
    key: "phase",
    get: function get() {
      return this._phase;
    }
  }, {
    key: "passID",
    get: function get() {
      return this._passID;
    }
  }, {
    key: "phaseID",
    get: function get() {
      return this._phaseID;
    }
  }, {
    key: "rasterizerState",
    get: function get() {
      return this._rs;
    }
  }, {
    key: "depthStencilState",
    get: function get() {
      return this._dss;
    }
  }, {
    key: "blendState",
    get: function get() {
      return this._bs;
    }
  }, {
    key: "dynamicStates",
    get: function get() {
      return this._dynamicStates;
    }
  }, {
    key: "batchingScheme",
    get: function get() {
      return this._batchingScheme;
    }
  }, {
    key: "descriptorSet",
    get: function get() {
      return this._descriptorSet;
    }
  }, {
    key: "hash",
    get: function get() {
      return this._hash;
    }
  }, {
    key: "pipelineLayout",
    get: function get() {
      return this._pipelineLayout;
    }
  }]);
}();
Pass.getTypeFromHandle = getTypeFromHandle;
Pass.getBindingFromHandle = getBindingFromHandle;
Pass.getCountFromHandle = getCountFromHandle;
Pass.getOffsetFromHandle = getOffsetFromHandle;
function serializeBlendState(bs) {
  var res = ",bs," + bs.isA2C;
  bs.targets.forEach(function (t) {
    res += ",bt," + t.blend + "," + t.blendEq + "," + t.blendAlphaEq + "," + t.blendColorMask;
    res += "," + t.blendSrc + "," + t.blendDst + "," + t.blendSrcAlpha + "," + t.blendDstAlpha;
  });
  return res;
}
function serializeRasterizerState(rs) {
  return ",rs," + rs.cullMode + "," + rs.depthBias + "," + rs.isFrontFaceCCW;
}
function serializeDepthStencilState(dss) {
  var res = ",dss," + dss.depthTest + "," + dss.depthWrite + "," + dss.depthFunc;
  res += "," + dss.stencilTestFront + "," + dss.stencilFuncFront + "," + dss.stencilRefFront + "," + dss.stencilReadMaskFront;
  res += "," + dss.stencilFailOpFront + "," + dss.stencilZFailOpFront + "," + dss.stencilPassOpFront + "," + dss.stencilWriteMaskFront;
  res += "," + dss.stencilTestBack + "," + dss.stencilFuncBack + "," + dss.stencilRefBack + "," + dss.stencilReadMaskBack;
  res += "," + dss.stencilFailOpBack + "," + dss.stencilZFailOpBack + "," + dss.stencilPassOpBack + "," + dss.stencilWriteMaskBack;
  return res;
}

var _dec$5, _class$5, _class2$5, _initializer$5, _initializer2$5, _initializer3$4, _initializer4$4, _EffectAsset;
var legacyBuiltinEffectNames = ['planar-shadow', 'skybox', 'deferred-lighting', 'bloom', 'hbao', 'copy-pass', 'post-process', 'profiler', 'splash-screen', 'unlit', 'sprite', 'particle', 'particle-gpu', 'particle-trail', 'billboard', 'terrain', 'graphics', 'clear-stencil', 'spine', 'occlusion-query', 'geometry-renderer', 'debug-renderer', 'ssss-blur', 'float-output-process'];
var EffectAsset = (_dec$5 = ccclass('cc.EffectAsset'), _dec$5(_class$5 = (_class2$5 = (_EffectAsset = function (_Asset) {
  function EffectAsset(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this.techniques = _initializer$5 && _initializer$5();
    _this.shaders = _initializer2$5 && _initializer2$5();
    _this.combinations = _initializer3$4 && _initializer3$4();
    _this.hideInEditor = _initializer4$4 && _initializer4$4();
    return _this;
  }
  _inheritsLoose(EffectAsset, _Asset);
  EffectAsset.register = function register(asset) {
    EffectAsset._effects[asset.name] = asset;
    EffectAsset._layoutValid = false;
  };
  EffectAsset.remove = function remove(asset) {
    if (typeof asset !== 'string') {
      if (EffectAsset._effects[asset.name] && EffectAsset._effects[asset.name] === asset) {
        delete EffectAsset._effects[asset.name];
      }
    } else {
      if (EffectAsset._effects[asset]) {
        delete EffectAsset._effects[asset];
        return;
      }
      for (var n in EffectAsset._effects) {
        if (EffectAsset._effects[n]._uuid === asset) {
          delete EffectAsset._effects[n];
          return;
        }
      }
    }
  };
  EffectAsset.get = function get(name) {
    if (EffectAsset._effects[name]) {
      return EffectAsset._effects[name];
    }
    for (var n in EffectAsset._effects) {
      if (EffectAsset._effects[n]._uuid === name) {
        return EffectAsset._effects[n];
      }
    }
    if (legacyBuiltinEffectNames.includes(name)) {
      warnID(16101, name);
    }
    return null;
  };
  EffectAsset.getAll = function getAll() {
    return EffectAsset._effects;
  };
  EffectAsset.isLayoutValid = function isLayoutValid() {
    return EffectAsset._layoutValid;
  };
  EffectAsset.setLayoutValid = function setLayoutValid() {
    EffectAsset._layoutValid = true;
  };
  var _proto = EffectAsset.prototype;
  _proto.onLoaded = function onLoaded() {
    if (cclegacy.rendering && cclegacy.rendering.enableEffectImport) {
      addEffectDefaultProperties(this);
      var _programLib = cclegacy.rendering.programLib;
      _programLib.addEffect(this);
      _programLib.init(deviceManager.gfxDevice);
    } else {
      programLib.register(this);
    }
    EffectAsset.register(this);
    {
      cclegacy.game.once(cclegacy.Game.EVENT_RENDERER_INITED, this._precompile, this);
    }
  };
  _proto._precompile = function _precompile() {
    var _this2 = this;
    if (cclegacy.rendering && cclegacy.rendering.enableEffectImport) {
      cclegacy.rendering.programLib.precompileEffect(deviceManager.gfxDevice, this);
      return;
    }
    var root = cclegacy.director.root;
    var _loop = function _loop() {
      var shader = _this2.shaders[i];
      var combination = _this2.combinations[i];
      if (!combination) {
        return 1;
      }
      var defines = getCombinationDefines(combination);
      defines.forEach(function (defines) {
        return programLib.getGFXShader(deviceManager.gfxDevice, shader.name, defines, root.pipeline);
      });
    };
    for (var i = 0; i < this.shaders.length; i++) {
      if (_loop()) continue;
    }
  };
  _proto.destroy = function destroy() {
    EffectAsset.remove(this);
    return _Asset.prototype.destroy.call(this);
  };
  _proto.initDefault = function initDefault(uuid) {
    _Asset.prototype.initDefault.call(this, uuid);
    var effect = EffectAsset.get('builtin-unlit');
    this.name = 'builtin-unlit';
    this.shaders = effect.shaders;
    this.combinations = effect.combinations;
    this.techniques = effect.techniques;
  };
  _proto.validate = function validate() {
    return this.techniques.length > 0 && this.shaders.length > 0;
  };
  return EffectAsset;
}(Asset), _EffectAsset._effects = {}, _EffectAsset._layoutValid = true, _EffectAsset), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "techniques", [serializable], function () {
  return [];
}), _initializer2$5 = applyDecoratedInitializer(_class2$5.prototype, "shaders", [serializable], function () {
  return [];
}), _initializer3$4 = applyDecoratedInitializer(_class2$5.prototype, "combinations", [serializable], function () {
  return [];
}), _initializer4$4 = applyDecoratedInitializer(_class2$5.prototype, "hideInEditor", [serializable, editorOnly], function () {
  return false;
}), _class2$5)) || _class$5);
cclegacy.EffectAsset = EffectAsset;

var profilerViewport = new Viewport();
var profilerScissor = new Rect$1();
function SRGBToLinear(out, gamma) {
  out.x = gamma.x * gamma.x;
  out.y = gamma.y * gamma.y;
  out.z = gamma.z * gamma.z;
}
var profilerCamera = null;
function decideProfilerCamera(cameras) {
  for (var i = cameras.length - 1; i >= 0; --i) {
    var camera = cameras[i];
    if (camera.window.swapchain) {
      profilerCamera = camera;
      return;
    }
  }
  profilerCamera = null;
}
function renderProfiler(device, renderPass, cmdBuff, profiler, camera) {
  if (isEnableEffect()) {
    return;
  }
  if (!profiler || !profiler.enabled) {
    return;
  }
  if (camera !== profilerCamera) {
    return;
  }
  var _profiler$subModels$ = profiler.subModels[0],
    inputAssembler = _profiler$subModels$.inputAssembler,
    passes = _profiler$subModels$.passes,
    shaders = _profiler$subModels$.shaders,
    descriptorSet = _profiler$subModels$.descriptorSet;
  profilerViewport.width = profilerScissor.width = camera.window.width;
  profilerViewport.height = profilerScissor.height = camera.window.height;
  var pso = PipelineStateManager.getOrCreatePipelineState(device, passes[0], shaders[0], renderPass, inputAssembler);
  cmdBuff.setViewport(profilerViewport);
  cmdBuff.setScissor(profilerScissor);
  cmdBuff.bindPipelineState(pso);
  cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, passes[0].descriptorSet);
  cmdBuff.bindDescriptorSet(SetIndex.LOCAL, descriptorSet);
  cmdBuff.bindInputAssembler(inputAssembler);
  cmdBuff.draw(inputAssembler);
}

var _dec$4, _dec2$3, _class$4, _class2$4, _initializer$4, _initializer2$4, _initializer3$3, _initializer4$3, _initializer5$3;
var v4_1 = new Vec4();
var Material = (_dec$4 = ccclass('cc.Material'), _dec2$3 = type(EffectAsset), _dec$4(_class$4 = (_class2$4 = function (_Asset) {
  function Material(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this._effectAsset = _initializer$4 && _initializer$4();
    _this._techIdx = _initializer2$4 && _initializer2$4();
    _this._defines = _initializer3$3 && _initializer3$3();
    _this._states = _initializer4$3 && _initializer4$3();
    _this._props = _initializer5$3 && _initializer5$3();
    _this._passes = [];
    _this._hash = 0;
    return _this;
  }
  _inheritsLoose(Material, _Asset);
  Material.getHash = function getHash(material) {
    var hash = 0;
    for (var _iterator = _createForOfIteratorHelperLoose(material.passes), _step; !(_step = _iterator()).done;) {
      var pass = _step.value;
      hash ^= pass.hash;
    }
    return hash;
  };
  var _proto = Material.prototype;
  _proto.initialize = function initialize(info) {
    if (this._passes.length) {
      warnID(12005);
      return;
    }
    if (!this._defines) {
      this._defines = [];
    }
    if (!this._states) {
      this._states = [];
    }
    if (!this._props) {
      this._props = [];
    }
    this._fillInfo(info);
    this._update();
  };
  _proto.reset = function reset(info) {
    this.initialize(info);
  };
  _proto.destroy = function destroy() {
    this._doDestroy();
    return _Asset.prototype.destroy.call(this);
  };
  _proto.recompileShaders = function recompileShaders(overrides, passIdx) {
    warnID(16370, this.name);
  };
  _proto.overridePipelineStates = function overridePipelineStates(overrides, passIdx) {
    warnID(16371, this.name);
  };
  _proto.onLoaded = function onLoaded() {
    this._update();
  };
  _proto.resetUniforms = function resetUniforms(clearPasses) {
    if (clearPasses === void 0) {
      clearPasses = true;
    }
    this._props.length = this._passes.length;
    for (var i = 0; i < this._props.length; i++) {
      this._props[i] = {};
    }
    if (!clearPasses) {
      return;
    }
    for (var _iterator2 = _createForOfIteratorHelperLoose(this._passes), _step2; !(_step2 = _iterator2()).done;) {
      var pass = _step2.value;
      pass.resetUBOs();
      pass.resetTextures();
    }
  };
  _proto.setProperty = function setProperty(name, val, passIdx) {
    var success = false;
    if (passIdx === undefined) {
      var passes = this._passes;
      var len = passes.length;
      for (var i = 0; i < len; i++) {
        var pass = passes[i];
        if (this._uploadProperty(pass, name, val)) {
          this._props[pass.propertyIndex][name] = val;
          success = true;
        }
      }
    } else {
      if (passIdx >= this._passes.length) {
        warnID(16372, passIdx);
      }
      var _pass = this._passes[passIdx];
      if (this._uploadProperty(_pass, name, val)) {
        this._props[_pass.propertyIndex][name] = val;
        success = true;
      }
    }
    if (!success) {
      warnID(16373, name);
    }
  };
  _proto.getProperty = function getProperty(name, passIdx) {
    if (passIdx === undefined) {
      var propsArray = this._props;
      var len = propsArray.length;
      for (var i = 0; i < len; i++) {
        var props = propsArray[i];
        if (name in props) {
          return props[name];
        }
      }
    } else {
      if (passIdx >= this._passes.length) {
        warnID(16372, passIdx);
        return null;
      }
      var _props = this._props[this._passes[passIdx].propertyIndex];
      if (name in _props) {
        return _props[name];
      }
    }
    return null;
  };
  _proto.copy = function copy(mat, overrides) {
    this._techIdx = mat._techIdx;
    this._props.length = mat._props.length;
    for (var i = 0; i < mat._props.length; i++) {
      this._props[i] = _extends({}, mat._props[i]);
    }
    this._defines.length = mat._defines.length;
    for (var _i = 0; _i < mat._defines.length; _i++) {
      this._defines[_i] = _extends({}, mat._defines[_i]);
    }
    this._states.length = mat._states.length;
    for (var _i2 = 0; _i2 < mat._states.length; _i2++) {
      this._states[_i2] = _extends({}, mat._states[_i2]);
    }
    this._effectAsset = mat._effectAsset;
    if (overrides) this._fillInfo(overrides);
    this._update();
  };
  _proto._fillInfo = function _fillInfo(info) {
    if (info.technique !== undefined) {
      this._techIdx = info.technique;
    }
    if (info.effectAsset) {
      this._effectAsset = info.effectAsset;
    } else if (info.effectName) {
      this._effectAsset = EffectAsset.get(info.effectName);
    }
    if (info.defines) {
      this._prepareInfo(info.defines, this._defines);
    }
    if (info.states) {
      this._prepareInfo(info.states, this._states);
    }
  };
  _proto._prepareInfo = function _prepareInfo(patch, cur) {
    var patchArray = patch;
    if (!Array.isArray(patchArray)) {
      var len = this._effectAsset ? this._effectAsset.techniques[this._techIdx].passes.length : 1;
      patchArray = Array(len).fill(patchArray);
    }
    for (var i = 0; i < patchArray.length; ++i) {
      Object.assign(cur[i] || (cur[i] = {}), patchArray[i]);
    }
  };
  _proto._createPasses = function _createPasses() {
    var tech = this._effectAsset.techniques[this._techIdx || 0];
    if (!tech) {
      return [];
    }
    var passNum = tech.passes.length;
    var passes = [];
    for (var k = 0; k < passNum; ++k) {
      var passInfo = tech.passes[k];
      var propIdx = passInfo.passIndex = k;
      var defines = passInfo.defines = this._defines[propIdx] || (this._defines[propIdx] = {});
      passInfo.stateOverrides = this._states[propIdx] || (this._states[propIdx] = {});
      if (passInfo.propertyIndex !== undefined) {
        Object.assign(defines, this._defines[passInfo.propertyIndex]);
      }
      if (passInfo.embeddedMacros !== undefined) {
        Object.assign(defines, passInfo.embeddedMacros);
      }
      if (passInfo["switch"] && !defines[passInfo["switch"]]) {
        continue;
      }
      var pass = new Pass(cclegacy.director.root);
      pass.initialize(passInfo);
      passes.push(pass);
    }
    return passes;
  };
  _proto._update = function _update(keepProps) {
    var _this2 = this;
    if (keepProps === void 0) {
      keepProps = true;
    }
    if (this._effectAsset) {
      this._passes = this._createPasses();
      var totalPasses = this._effectAsset.techniques[this._techIdx].passes.length;
      this._props.length = totalPasses;
      if (keepProps) {
        this._passes.forEach(function (pass, i) {
          var props = _this2._props[i];
          if (!props) {
            props = _this2._props[i] = {};
          }
          if (pass.propertyIndex !== undefined) {
            Object.assign(props, _this2._props[pass.propertyIndex]);
          }
          for (var p in props) {
            _this2._uploadProperty(pass, p, props[p]);
          }
        });
      } else {
        for (var i = 0; i < this._props.length; i++) {
          this._props[i] = {};
        }
      }
    }
    this._hash = Material.getHash(this);
  };
  _proto._uploadProperty = function _uploadProperty(pass, name, val) {
    var _this3 = this;
    var handle = pass.getHandle(name);
    if (!handle) {
      return false;
    }
    var type = getTypeFromHandle(handle);
    if (type < Type.SAMPLER1D) {
      if (Array.isArray(val)) {
        pass.setUniformArray(handle, val);
      } else if (val !== null) {
        var _pass$properties$name;
        if ((_pass$properties$name = pass.properties[name]) != null && _pass$properties$name.linear) {
          var v4 = val;
          SRGBToLinear(v4_1, v4);
          v4_1.w = v4.w;
          val = v4_1;
        }
        pass.setUniform(handle, val);
      } else {
        pass.resetUniform(name);
      }
    } else if (Array.isArray(val)) {
      val.forEach(function (v, i) {
        _this3._bindTexture(pass, handle, v, i);
      });
    } else if (val) {
      this._bindTexture(pass, handle, val);
    } else {
      pass.resetTexture(name);
    }
    return true;
  };
  _proto._bindTexture = function _bindTexture(pass, handle, val, index) {
    var binding = Pass.getBindingFromHandle(handle);
    if (val instanceof Texture) {
      pass.bindTexture(binding, val, index);
    } else if (val instanceof TextureBase) {
      var texture = val.getGFXTexture();
      if (!texture || !texture.width || !texture.height) {
        return;
      }
      pass.bindTexture(binding, texture, index);
      pass.bindSampler(binding, val.getGFXSampler(), index);
    }
  };
  _proto._doDestroy = function _doDestroy() {
    if (this._passes && this._passes.length) {
      for (var _iterator3 = _createForOfIteratorHelperLoose(this._passes), _step3; !(_step3 = _iterator3()).done;) {
        var pass = _step3.value;
        pass.destroy();
      }
    }
    this._passes.length = 0;
  };
  _proto.initDefault = function initDefault(uuid) {
    _Asset.prototype.initDefault.call(this, uuid);
    this.initialize({
      effectName: 'builtin-unlit',
      defines: {
        USE_COLOR: true
      },
      technique: 0
    });
    this.setProperty('mainColor', new Color('#ff00ff'));
  };
  _proto.validate = function validate() {
    return !!this._effectAsset && !this._effectAsset.isDefault && this.passes.length > 0;
  };
  return _createClass(Material, [{
    key: "effectAsset",
    get: function get() {
      return this._effectAsset;
    }
  }, {
    key: "effectName",
    get: function get() {
      return this._effectAsset ? this._effectAsset.name : '';
    }
  }, {
    key: "technique",
    get: function get() {
      return this._techIdx;
    }
  }, {
    key: "passes",
    get: function get() {
      return this._passes;
    }
  }, {
    key: "hash",
    get: function get() {
      return this._hash;
    }
  }, {
    key: "parent",
    get: function get() {
      return null;
    }
  }, {
    key: "owner",
    get: function get() {
      return null;
    }
  }]);
}(Asset), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "_effectAsset", [_dec2$3], function () {
  return null;
}), _initializer2$4 = applyDecoratedInitializer(_class2$4.prototype, "_techIdx", [serializable], function () {
  return 0;
}), _initializer3$3 = applyDecoratedInitializer(_class2$4.prototype, "_defines", [serializable], function () {
  return [];
}), _initializer4$3 = applyDecoratedInitializer(_class2$4.prototype, "_states", [serializable], function () {
  return [];
}), _initializer5$3 = applyDecoratedInitializer(_class2$4.prototype, "_props", [serializable], function () {
  return [];
}), _class2$4)) || _class$4);
cclegacy.Material = Material;

var ShadowSize = Enum({
  Low_256x256: 256,
  Medium_512x512: 512,
  High_1024x1024: 1024,
  Ultra_2048x2048: 2048
});
var ShadowType = Enum({
  Planar: 0,
  ShadowMap: 1
});
var PCFType = Enum({
  HARD: 0,
  SOFT: 1,
  SOFT_2X: 2,
  SOFT_4X: 3
});
var CSMLevel = Enum({
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4
});
var CSMOptimizationMode = Enum({
  NONE: 1,
  RemoveDuplicates: 2,
  DisableRotationFix: 3
});
var SHADOW_TYPE_NONE = ShadowType.ShadowMap + 1;
var Shadows = function () {
  function Shadows() {
    this.fixedSphere = new Sphere(0.0, 0.0, 0.0, 0.01);
    this.maxReceived = 4;
    this._matLight = new Mat4();
    this._material = null;
    this._instancingMaterial = null;
    this._enabled = false;
    this._type = SHADOW_TYPE_NONE;
    this._distance = 0;
    this._planeBias = 1.0;
    this._normal = new Vec3(0, 1, 0);
    this._shadowColor = new Color(0, 0, 0, 76);
    this._size = new Vec2(1024, 1024);
    this._shadowMapDirty = false;
  }
  var _proto = Shadows.prototype;
  _proto.getPlanarShader = function getPlanarShader(patches) {
    if (!this._material) {
      this._material = new Material();
      this._material.initialize({
        effectName: 'pipeline/planar-shadow'
      });
    }
    var passes = this._material.passes;
    {
      assert(passes.length > 0, 'passes should not be empty!');
    }
    return passes.length > 0 ? passes[0].getShaderVariant(patches) : null;
  };
  _proto.initialize = function initialize(shadowsInfo) {
    this._enabled = shadowsInfo.enabled;
    this._type = this.enabled ? shadowsInfo.type : SHADOW_TYPE_NONE;
    this.normal = shadowsInfo.planeDirection;
    this.distance = shadowsInfo.planeHeight;
    this.planeBias = shadowsInfo.planeBias;
    this.shadowColor = shadowsInfo.shadowColor;
    this.maxReceived = shadowsInfo.maxReceived;
    if (shadowsInfo.shadowMapSize !== this._size.x) {
      this.size.set(shadowsInfo.shadowMapSize, shadowsInfo.shadowMapSize);
      this._shadowMapDirty = true;
    }
  };
  _proto.activate = function activate() {
    if (this._enabled) {
      if (this.type === ShadowType.Planar) {
        this._updatePlanarInfo();
      } else {
        var root = cclegacy.director.root;
        var pipeline = root.pipeline;
        pipeline.macros.CC_SHADOW_TYPE = 2;
        root.onGlobalPipelineStateChanged();
      }
    } else {
      var _root = cclegacy.director.root;
      var _pipeline = _root.pipeline;
      _pipeline.macros.CC_SHADOW_TYPE = 0;
      _root.onGlobalPipelineStateChanged();
    }
  };
  _proto._updatePlanarInfo = function _updatePlanarInfo() {
    if (!this._material) {
      this._material = new Material();
      this._material.initialize({
        effectName: 'pipeline/planar-shadow'
      });
    }
    var root = cclegacy.director.root;
    var pipeline = root.pipeline;
    pipeline.macros.CC_SHADOW_TYPE = 1;
    root.onGlobalPipelineStateChanged();
  };
  _proto.destroy = function destroy() {
    if (this._material) {
      this._material.destroy();
    }
    if (this._instancingMaterial) {
      this._instancingMaterial.destroy();
    }
    this.fixedSphere.destroy();
  };
  return _createClass(Shadows, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
      this.activate();
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(val) {
      this._type = this.enabled ? val : SHADOW_TYPE_NONE;
      this.activate();
    }
  }, {
    key: "normal",
    get: function get() {
      return this._normal;
    },
    set: function set(val) {
      Vec3.copy(this._normal, val);
    }
  }, {
    key: "distance",
    get: function get() {
      return this._distance;
    },
    set: function set(val) {
      this._distance = val;
    }
  }, {
    key: "planeBias",
    get: function get() {
      return this._planeBias;
    },
    set: function set(val) {
      this._planeBias = val;
    }
  }, {
    key: "shadowColor",
    get: function get() {
      return this._shadowColor;
    },
    set: function set(color) {
      this._shadowColor = color;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(val) {
      this._size.set(val);
    }
  }, {
    key: "shadowMapDirty",
    get: function get() {
      return this._shadowMapDirty;
    },
    set: function set(val) {
      this._shadowMapDirty = val;
    }
  }, {
    key: "matLight",
    get: function get() {
      return this._matLight;
    }
  }, {
    key: "material",
    get: function get() {
      return this._material;
    }
  }, {
    key: "instancingMaterial",
    get: function get() {
      return this._instancingMaterial;
    }
  }]);
}();
Shadows.MAX_FAR = 2000.0;
Shadows.COEFFICIENT_OF_EXPANSION = 2.0 * Math.sqrt(3.0);
cclegacy.Shadows = Shadows;

function getPipelineSceneData() {
  return cclegacy.director.root.pipeline.pipelineSceneData;
}

var Ambient = function () {
  function Ambient() {
    this._groundAlbedoHDR = new Vec4(0.2, 0.2, 0.2, 1.0);
    this._skyColorHDR = new Vec4(0.2, 0.5, 0.8, 1.0);
    this._skyIllumHDR = 0;
    this._groundAlbedoLDR = new Vec4(0.2, 0.2, 0.2, 1.0);
    this._skyColorLDR = new Vec4(0.2, 0.5, 0.8, 1.0);
    this._skyIllumLDR = 0;
    this._mipmapCount = 1;
    this._enabled = false;
  }
  var _proto = Ambient.prototype;
  _proto.initialize = function initialize(ambientInfo) {
    this._skyColorHDR = ambientInfo.skyColorHDR;
    this._groundAlbedoHDR.set(ambientInfo.groundAlbedoHDR);
    this._skyIllumHDR = ambientInfo.skyIllumHDR;
    this._skyColorLDR = ambientInfo.skyColorLDR;
    this._groundAlbedoLDR.set(ambientInfo.groundAlbedoLDR);
    this._skyIllumLDR = ambientInfo.skyIllumLDR;
  };
  return _createClass(Ambient, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
    }
  }, {
    key: "skyColor",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._skyColorHDR;
      } else {
        return this._skyColorLDR;
      }
    },
    set: function set(color) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._skyColorHDR.set(color);
      } else {
        this._skyColorLDR.set(color);
      }
    }
  }, {
    key: "skyIllum",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._skyIllumHDR;
      } else {
        return this._skyIllumLDR;
      }
    },
    set: function set(illum) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._skyIllumHDR = illum;
      } else {
        this._skyIllumLDR = illum;
      }
    }
  }, {
    key: "groundAlbedo",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._groundAlbedoHDR;
      } else {
        return this._groundAlbedoLDR;
      }
    },
    set: function set(color) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._groundAlbedoHDR.set(color);
      } else {
        this._groundAlbedoLDR.set(color);
      }
    }
  }]);
}();
Ambient.SUN_ILLUM = 65000.0;
Ambient.SKY_ILLUM = 20000.0;
cclegacy.Ambient = Ambient;

var PassInstance = function (_Pass) {
  function PassInstance(parent, owner) {
    var _this;
    _this = _Pass.call(this, parent.root) || this;
    _this._dontNotify = false;
    _this._parent = parent;
    _this._owner = owner;
    _this._doInit(_this._parent, true);
    _this._shaderInfo.blocks.forEach(function (u) {
      var block = _this._blocks[u.binding];
      var parentBlock = _this._parent.blocks[u.binding];
      block.set(parentBlock);
    });
    _this._rootBufferDirty = true;
    var parentInstance = _this._parent;
    var thisDescriptorSet = _this._descriptorSet;
    _this._shaderInfo.samplerTextures.forEach(function (u) {
      for (var j = 0; j < u.count; j++) {
        var parentDescriptorSet = parentInstance._descriptorSet;
        var binding = u.binding;
        var sampler = parentDescriptorSet.getSampler(binding, j);
        var texture = parentDescriptorSet.getTexture(binding, j);
        thisDescriptorSet.bindSampler(binding, sampler, j);
        thisDescriptorSet.bindTexture(binding, texture, j);
      }
    });
    _Pass.prototype.tryCompile.call(_this);
    return _this;
  }
  _inheritsLoose(PassInstance, _Pass);
  var _proto = PassInstance.prototype;
  _proto.overridePipelineStates = function overridePipelineStates(original, overrides) {
    this._bs.reset();
    this._rs.reset();
    this._dss.reset();
    Pass.fillPipelineInfo(this, original);
    Pass.fillPipelineInfo(this, overrides);
    this._onStateChange();
  };
  _proto.tryCompile = function tryCompile(defineOverrides) {
    if (defineOverrides) {
      if (!overrideMacros(this._defines, defineOverrides)) {
        return false;
      }
    }
    var res = _Pass.prototype.tryCompile.call(this);
    this._onStateChange();
    return res;
  };
  _proto.beginChangeStatesSilently = function beginChangeStatesSilently() {
    this._dontNotify = true;
  };
  _proto.endChangeStatesSilently = function endChangeStatesSilently() {
    this._dontNotify = false;
  };
  _proto._syncBatchingScheme = function _syncBatchingScheme() {
    this._defines.USE_INSTANCING = false;
    this._batchingScheme = BatchingSchemes.NONE;
  };
  _proto._onStateChange = function _onStateChange() {
    this._hash = Pass.getPassHash(this);
    this._owner.onPassStateChange(this._dontNotify);
  };
  return _createClass(PassInstance, [{
    key: "parent",
    get: function get() {
      return this._parent;
    }
  }]);
}(Pass);

var MaterialInstance = function (_Material) {
  function MaterialInstance(info) {
    var _this;
    _this = _Material.call(this) || this;
    _this._passes = [];
    _this._subModelIdx = 0;
    _this._parent = info.parent;
    _this._owner = info.owner || null;
    _this._subModelIdx = info.subModelIdx || 0;
    _this.copy(_this._parent);
    return _this;
  }
  _inheritsLoose(MaterialInstance, _Material);
  var _proto = MaterialInstance.prototype;
  _proto.recompileShaders = function recompileShaders(overrides, passIdx) {
    if (!this._passes || !this.effectAsset) {
      return;
    }
    if (passIdx === undefined) {
      this._passes.forEach(function (pass) {
        pass.tryCompile(overrides);
      });
    } else {
      this._passes[passIdx].tryCompile(overrides);
    }
  };
  _proto.overridePipelineStates = function overridePipelineStates(overrides, passIdx) {
    if (!this._passes || !this.effectAsset) {
      return;
    }
    var passInfos = this.effectAsset.techniques[this.technique].passes;
    if (passIdx === undefined) {
      for (var i = 0; i < this._passes.length; i++) {
        var pass = this._passes[i];
        var state = this._states[i] || (this._states[i] = {});
        for (var key in overrides) {
          state[key] = overrides[key];
        }
        pass.overridePipelineStates(passInfos[pass.passIndex], state);
      }
    } else {
      var _state = this._states[passIdx] || (this._states[passIdx] = {});
      for (var _key in overrides) {
        _state[_key] = overrides[_key];
      }
      this._passes[passIdx].overridePipelineStates(passInfos[passIdx], _state);
    }
  };
  _proto.destroy = function destroy() {
    this._doDestroy();
    return true;
  };
  _proto.onPassStateChange = function onPassStateChange(dontNotify) {
    this._hash = Material.getHash(this);
    if (!dontNotify && this._owner) {
      this._owner._onRebuildPSO(this._subModelIdx, this);
    }
  };
  _proto._createPasses = function _createPasses() {
    var passes = [];
    var parentPasses = this._parent.passes;
    if (!parentPasses) {
      return passes;
    }
    for (var k = 0; k < parentPasses.length; ++k) {
      passes.push(new PassInstance(parentPasses[k], this));
    }
    return passes;
  };
  return _createClass(MaterialInstance, [{
    key: "parent",
    get: function get() {
      return this._parent;
    }
  }, {
    key: "owner",
    get: function get() {
      return this._owner;
    }
  }]);
}(Material);

var skybox_mesh = null;
var skybox_material = null;
var EnvironmentLightingType;
(function (EnvironmentLightingType) {
  EnvironmentLightingType[EnvironmentLightingType["HEMISPHERE_DIFFUSE"] = 0] = "HEMISPHERE_DIFFUSE";
  EnvironmentLightingType[EnvironmentLightingType["AUTOGEN_HEMISPHERE_DIFFUSE_WITH_REFLECTION"] = 1] = "AUTOGEN_HEMISPHERE_DIFFUSE_WITH_REFLECTION";
  EnvironmentLightingType[EnvironmentLightingType["DIFFUSEMAP_WITH_REFLECTION"] = 2] = "DIFFUSEMAP_WITH_REFLECTION";
})(EnvironmentLightingType || (EnvironmentLightingType = {}));
Enum(EnvironmentLightingType);
var Skybox = function () {
  function Skybox() {
    this._envmapLDR = null;
    this._envmapHDR = null;
    this._diffuseMapLDR = null;
    this._diffuseMapHDR = null;
    this._globalDSManager = null;
    this._model = null;
    this._default = null;
    this._enabled = false;
    this._useIBL = false;
    this._useHDR = true;
    this._useDiffuseMap = false;
    this._editableMaterial = null;
    this._activated = false;
    this._reflectionHDR = null;
    this._reflectionLDR = null;
    this._rotationAngle = 0;
  }
  var _proto = Skybox.prototype;
  _proto.initialize = function initialize(skyboxInfo) {
    this._activated = false;
    this._enabled = skyboxInfo.enabled;
    this._useIBL = skyboxInfo.useIBL;
    this._useDiffuseMap = skyboxInfo.applyDiffuseMap;
    this._useHDR = skyboxInfo.useHDR;
  };
  _proto.setEnvMaps = function setEnvMaps(envmapHDR, envmapLDR) {
    this._envmapHDR = envmapHDR;
    this._envmapLDR = envmapLDR;
    this._updateGlobalBinding();
    this._updatePipeline();
  };
  _proto.setDiffuseMaps = function setDiffuseMaps(diffuseMapHDR, diffuseMapLDR) {
    this._diffuseMapHDR = diffuseMapHDR;
    this._diffuseMapLDR = diffuseMapLDR;
    this._updateGlobalBinding();
    this._updatePipeline();
  };
  _proto.setSkyboxMaterial = function setSkyboxMaterial(skyboxMat) {
    if (skyboxMat) {
      this._editableMaterial = new MaterialInstance({
        parent: skyboxMat
      });
      this._editableMaterial.recompileShaders({
        USE_RGBE_CUBEMAP: this.isRGBE
      });
    } else {
      this._editableMaterial = null;
    }
    this._updatePipeline();
  };
  _proto.setReflectionMaps = function setReflectionMaps(reflectionHDR, reflectionLDR) {
    this._reflectionHDR = reflectionHDR;
    this._reflectionLDR = reflectionLDR;
    this._updateGlobalBinding();
    this._updatePipeline();
  };
  _proto.setRotationAngle = function setRotationAngle(angle) {
    this._rotationAngle = angle;
  };
  _proto.getRotationAngle = function getRotationAngle() {
    return this._rotationAngle;
  };
  _proto.updateMaterialRenderInfo = function updateMaterialRenderInfo() {
    this._updateGlobalBinding();
    this._updatePipeline();
  };
  _proto.activate = function activate() {
    var pipeline = cclegacy.director.root.pipeline;
    this._globalDSManager = pipeline.globalDSManager;
    this._default = builtinResMgr.get('default-cube-texture');
    if (!this._model) {
      this._model = cclegacy.director.root.createModel(cclegacy.renderer.scene.Model);
    }
    var isRGBE = this._default.isRGBE;
    this._default.isUsingOfflineMipmaps();
    if (this.envmap) {
      isRGBE = this.envmap.isRGBE;
      this.envmap.isUsingOfflineMipmaps();
    }
    if (!skybox_material) {
      var mat = new Material();
      mat.initialize({
        effectName: 'pipeline/skybox',
        defines: {
          USE_RGBE_CUBEMAP: isRGBE
        }
      });
      skybox_material = new MaterialInstance({
        parent: mat
      });
    }
    if (this.enabled) {
      if (!skybox_mesh) {
        skybox_mesh = cclegacy.utils.createMesh(cclegacy.primitives.box({
          width: 2,
          height: 2,
          length: 2
        }));
      }
      if (this._editableMaterial) {
        this._model.initSubModel(0, skybox_mesh.renderingSubMeshes[0], this._editableMaterial);
      } else {
        this._model.initSubModel(0, skybox_mesh.renderingSubMeshes[0], skybox_material);
      }
    }
    if (!this.envmap) {
      this.envmap = this._default;
    }
    if (!this.diffuseMap) {
      this.diffuseMap = this._default;
    }
    this._updateGlobalBinding();
    this._updatePipeline();
    this._activated = true;
  };
  _proto._updatePipeline = function _updatePipeline() {
    var root = cclegacy.director.root;
    var pipeline = root.pipeline;
    var useIBLValue = this.useIBL ? this.isRGBE ? 2 : 1 : 0;
    var useDiffuseMapValue = this.useIBL && this.useDiffuseMap && this.diffuseMap && this.diffuseMap !== this._default ? this.isRGBE ? 2 : 1 : 0;
    var useHDRValue = this.useHDR;
    var useConvMapValue = this.useConvolutionMap;
    if (pipeline.macros.CC_USE_IBL !== useIBLValue || pipeline.macros.CC_USE_DIFFUSEMAP !== useDiffuseMapValue || pipeline.macros.CC_USE_HDR !== useHDRValue || pipeline.macros.CC_IBL_CONVOLUTED !== useConvMapValue) {
      pipeline.macros.CC_USE_IBL = useIBLValue;
      pipeline.macros.CC_USE_DIFFUSEMAP = useDiffuseMapValue;
      pipeline.macros.CC_USE_HDR = useHDRValue;
      pipeline.macros.CC_IBL_CONVOLUTED = useConvMapValue;
      if (this._activated) {
        root.onGlobalPipelineStateChanged();
      }
    }
    if (this.enabled) {
      var envmap = this.envmap ? this.envmap : this._default;
      var skyboxMat = this._editableMaterial ? this._editableMaterial : skybox_material;
      if (skyboxMat) {
        skyboxMat.setProperty('environmentMap', envmap);
        skyboxMat.recompileShaders({
          USE_RGBE_CUBEMAP: this.isRGBE
        });
      }
      if (this._model) {
        this._model.setSubModelMaterial(0, skyboxMat);
        this._updateSubModes();
      }
    }
  };
  _proto._updateGlobalBinding = function _updateGlobalBinding() {
    if (cclegacy.rendering) {
      return;
    }
    if (this._globalDSManager) {
      var device = deviceManager.gfxDevice;
      if (this.reflectionMap) {
        var texture = this.reflectionMap.getGFXTexture();
        var sampler = device.getSampler(this.reflectionMap.getSamplerInfo());
        this._globalDSManager.bindSampler(UNIFORM_ENVIRONMENT_BINDING, sampler);
        this._globalDSManager.bindTexture(UNIFORM_ENVIRONMENT_BINDING, texture);
      } else {
        var envmap = this.envmap ? this.envmap : this._default;
        if (envmap) {
          var _texture = envmap.getGFXTexture();
          var _sampler = device.getSampler(envmap.getSamplerInfo());
          this._globalDSManager.bindSampler(UNIFORM_ENVIRONMENT_BINDING, _sampler);
          this._globalDSManager.bindTexture(UNIFORM_ENVIRONMENT_BINDING, _texture);
        }
      }
      var diffuseMap = this.diffuseMap ? this.diffuseMap : this._default;
      if (diffuseMap) {
        var _texture2 = diffuseMap.getGFXTexture();
        var _sampler2 = device.getSampler(diffuseMap.getSamplerInfo());
        this._globalDSManager.bindSampler(UNIFORM_DIFFUSEMAP_BINDING, _sampler2);
        this._globalDSManager.bindTexture(UNIFORM_DIFFUSEMAP_BINDING, _texture2);
      }
      this._globalDSManager.update();
    }
  };
  _proto._updateSubModes = function _updateSubModes() {
    if (this._model) {
      var subModels = this._model.subModels;
      for (var i = 0; i < subModels.length; i++) {
        subModels[i].update();
      }
    }
  };
  return _createClass(Skybox, [{
    key: "model",
    get: function get() {
      return this._model;
    }
  }, {
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
      if (val) this.activate();else this._updatePipeline();
    }
  }, {
    key: "useHDR",
    get: function get() {
      return this._useHDR;
    },
    set: function set(val) {
      this._useHDR = val;
      this.setEnvMaps(this._envmapHDR, this._envmapLDR);
    }
  }, {
    key: "useIBL",
    get: function get() {
      return this._useIBL;
    },
    set: function set(val) {
      this._useIBL = val;
      this._updatePipeline();
    }
  }, {
    key: "useDiffuseMap",
    get: function get() {
      return this._useDiffuseMap;
    },
    set: function set(val) {
      this._useDiffuseMap = val;
      this._updatePipeline();
    }
  }, {
    key: "isRGBE",
    get: function get() {
      if (this.envmap) {
        return this.envmap.isRGBE;
      } else {
        return false;
      }
    }
  }, {
    key: "useConvolutionMap",
    get: function get() {
      if (this.reflectionMap) {
        return this.reflectionMap.isUsingOfflineMipmaps();
      }
      if (this.envmap) {
        return this.envmap.isUsingOfflineMipmaps();
      }
      return false;
    }
  }, {
    key: "envmap",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._envmapHDR;
      } else {
        return this._envmapLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this.setEnvMaps(val, this._envmapLDR);
      } else {
        this.setEnvMaps(this._envmapHDR, val);
      }
    }
  }, {
    key: "diffuseMap",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._diffuseMapHDR;
      } else {
        return this._diffuseMapLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this.setDiffuseMaps(val, this._diffuseMapLDR);
      } else {
        this.setDiffuseMaps(this._diffuseMapHDR, val);
      }
    }
  }, {
    key: "reflectionMap",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._reflectionHDR;
      } else {
        return this._reflectionLDR;
      }
    }
  }, {
    key: "editableMaterial",
    get: function get() {
      return this._editableMaterial;
    }
  }]);
}();
cclegacy.Skybox = Skybox;

var _v4$1 = new Vec4();
var FogType = Enum({
  LINEAR: 0,
  EXP: 1,
  EXP_SQUARED: 2,
  LAYERED: 3
});
var FOG_TYPE_NONE = FogType.LAYERED + 1;
var Fog = function () {
  function Fog() {
    this._fogColor = new Color('#C8C8C8');
    this._colorArray = new Vec4(0.2, 0.2, 0.2, 1.0);
    this._enabled = false;
    this._accurate = false;
    this._type = 0;
    this._fogDensity = 0.3;
    this._fogStart = 0.5;
    this._fogEnd = 300;
    this._fogAtten = 5;
    this._fogTop = 1.5;
    this._fogRange = 1.2;
    this._activated = false;
  }
  var _proto = Fog.prototype;
  _proto.initialize = function initialize(fogInfo) {
    this._activated = false;
    this.fogColor = fogInfo.fogColor;
    this._enabled = fogInfo.enabled;
    this._type = this.enabled ? fogInfo.type : FOG_TYPE_NONE;
    this._accurate = fogInfo.accurate;
    this.fogDensity = fogInfo.fogDensity;
    this.fogStart = fogInfo.fogStart;
    this.fogEnd = fogInfo.fogEnd;
    this.fogAtten = fogInfo.fogAtten;
    this.fogTop = fogInfo.fogTop;
    this.fogRange = fogInfo.fogRange;
  };
  _proto.activate = function activate() {
    this._updatePipeline();
    this._activated = true;
  };
  _proto._updatePipeline = function _updatePipeline() {
    var root = cclegacy.director.root;
    var value = this.enabled ? this.type : FOG_TYPE_NONE;
    var accurateValue = this.accurate ? 1 : 0;
    var pipeline = root.pipeline;
    if (pipeline.macros.CC_USE_FOG === value && pipeline.macros.CC_USE_ACCURATE_FOG === accurateValue) {
      return;
    }
    pipeline.macros.CC_USE_FOG = value;
    pipeline.macros.CC_USE_ACCURATE_FOG = accurateValue;
    if (this._activated) {
      root.onGlobalPipelineStateChanged();
    }
  };
  return _createClass(Fog, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
      if (!val) {
        this._type = FOG_TYPE_NONE;
        this._updatePipeline();
      } else {
        this.activate();
      }
    }
  }, {
    key: "accurate",
    get: function get() {
      return this._accurate;
    },
    set: function set(val) {
      this._accurate = val;
      this._updatePipeline();
    }
  }, {
    key: "fogColor",
    get: function get() {
      return this._fogColor;
    },
    set: function set(val) {
      this._fogColor.set(val);
      _v4$1.set(val.x, val.y, val.z, val.w);
      SRGBToLinear(this._colorArray, _v4$1);
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(val) {
      this._type = this.enabled ? val : FOG_TYPE_NONE;
      if (this.enabled) this._updatePipeline();
    }
  }, {
    key: "fogDensity",
    get: function get() {
      return this._fogDensity;
    },
    set: function set(val) {
      this._fogDensity = val;
    }
  }, {
    key: "fogStart",
    get: function get() {
      return this._fogStart;
    },
    set: function set(val) {
      this._fogStart = val;
    }
  }, {
    key: "fogEnd",
    get: function get() {
      return this._fogEnd;
    },
    set: function set(val) {
      this._fogEnd = val;
    }
  }, {
    key: "fogAtten",
    get: function get() {
      return this._fogAtten;
    },
    set: function set(val) {
      this._fogAtten = val;
    }
  }, {
    key: "fogTop",
    get: function get() {
      return this._fogTop;
    },
    set: function set(val) {
      this._fogTop = val;
    }
  }, {
    key: "fogRange",
    get: function get() {
      return this._fogRange;
    },
    set: function set(val) {
      this._fogRange = val;
    }
  }, {
    key: "colorArray",
    get: function get() {
      return this._colorArray;
    }
  }]);
}();
cclegacy.Fog = Fog;

var NodeSpace;
(function (NodeSpace) {
  NodeSpace[NodeSpace["LOCAL"] = 0] = "LOCAL";
  NodeSpace[NodeSpace["WORLD"] = 1] = "WORLD";
})(NodeSpace || (NodeSpace = {}));
var TransformBit;
(function (TransformBit) {
  TransformBit[TransformBit["NONE"] = 0] = "NONE";
  TransformBit[TransformBit["POSITION"] = 1] = "POSITION";
  TransformBit[TransformBit["ROTATION"] = 2] = "ROTATION";
  TransformBit[TransformBit["SCALE"] = 4] = "SCALE";
  TransformBit[TransformBit["SKEW"] = 8] = "SKEW";
  TransformBit[TransformBit["RS"] = TransformBit.ROTATION | TransformBit.SCALE] = "RS";
  TransformBit[TransformBit["RSS"] = TransformBit.ROTATION | TransformBit.SCALE | TransformBit.SKEW] = "RSS";
  TransformBit[TransformBit["TRS"] = TransformBit.POSITION | TransformBit.ROTATION | TransformBit.SCALE] = "TRS";
  TransformBit[TransformBit["TRS_MASK"] = ~TransformBit.TRS] = "TRS_MASK";
})(TransformBit || (TransformBit = {}));
legacyCC.internal.TransformBit = TransformBit;
var MobilityMode = Enum({
  Static: 0,
  Stationary: 1,
  Movable: 2
});

var ToneMappingType = Enum({
  DEFAULT: 0,
  LINEAR: 1
});
var PostSettings = function () {
  function PostSettings() {
    this._toneMappingType = ToneMappingType.DEFAULT;
    this._activated = false;
  }
  var _proto = PostSettings.prototype;
  _proto.initialize = function initialize(postSettingsInfo) {
    this._toneMappingType = postSettingsInfo.toneMappingType;
  };
  _proto.activate = function activate() {
    this._updatePipeline();
    this._activated = true;
  };
  _proto._updatePipeline = function _updatePipeline() {
    var root = cclegacy.director.root;
    var pipeline = root.pipeline;
    pipeline.macros.CC_TONE_MAPPING_TYPE = this._toneMappingType;
    if (this._activated) {
      root.onGlobalPipelineStateChanged();
    }
  };
  return _createClass(PostSettings, [{
    key: "toneMappingType",
    get: function get() {
      return this._toneMappingType;
    },
    set: function set(val) {
      this._toneMappingType = val;
      this._updatePipeline();
    }
  }]);
}();

var NodeUIProperties = function () {
  function NodeUIProperties(node) {
    this._uiComp = null;
    this._opacity = 1;
    this._localOpacity = 1;
    this.colorDirty = true;
    this._uiTransformComp = null;
    this._uiSkewComp = null;
    this._node = node;
  }
  var _proto = NodeUIProperties.prototype;
  _proto.setOpacity = function setOpacity(v) {
    this._opacity = v;
  };
  _proto.applyOpacity = function applyOpacity(effectOpacity) {
    this._opacity = this._localOpacity * effectOpacity;
  };
  NodeUIProperties.markOpacityTree = function markOpacityTree(node, isDirty) {
  };
  return _createClass(NodeUIProperties, [{
    key: "uiTransformComp",
    get: function get() {
      if (!this._uiTransformComp) {
        this._uiTransformComp = this._node.getComponent('cc.UITransform');
      }
      return this._uiTransformComp;
    },
    set: function set(value) {
      this._uiTransformComp = value;
    }
  }, {
    key: "uiComp",
    get: function get() {
      return this._uiComp;
    },
    set: function set(comp) {
      if (this._uiComp && comp) {
        warnID(12002);
        return;
      }
      this._uiComp = comp;
    }
  }, {
    key: "opacity",
    get: function get() {
      return this._opacity;
    }
  }, {
    key: "localOpacity",
    get: function get() {
      return this._localOpacity;
    },
    set: function set(val) {
      this._localOpacity = val;
      this.colorDirty = true;
    }
  }]);
}();

CCObjectFlags.Destroying;
!!legacyCC.GAME_VIEW;
function nodePolyfill(Node) {
  {
    get(Node.prototype, ' INFO ', function () {
      var path = '';
      var node = this;
      while (node && !(node instanceof legacyCC.Scene)) {
        if (path) {
          path = node.name + "/" + path;
        } else {
          path = node.name;
        }
        node = node._parent;
      }
      return this.name + ", path: " + path;
    });
  }
}

var _arrayPool = new Pool$1(function () {
  return new Array(16);
}, 3);
var _currentHovered = null;
var pos = new Vec2();
var _touchEvents = [NodeEventType.TOUCH_START, NodeEventType.TOUCH_MOVE, NodeEventType.TOUCH_END, NodeEventType.TOUCH_CANCEL];
var _mouseEvents = [NodeEventType.MOUSE_DOWN, NodeEventType.MOUSE_ENTER, NodeEventType.MOUSE_MOVE, NodeEventType.MOUSE_LEAVE, NodeEventType.MOUSE_UP, NodeEventType.MOUSE_WHEEL];
var DispatcherEventType;
(function (DispatcherEventType) {
  DispatcherEventType[DispatcherEventType["ADD_POINTER_EVENT_PROCESSOR"] = 0] = "ADD_POINTER_EVENT_PROCESSOR";
  DispatcherEventType[DispatcherEventType["REMOVE_POINTER_EVENT_PROCESSOR"] = 1] = "REMOVE_POINTER_EVENT_PROCESSOR";
  DispatcherEventType[DispatcherEventType["MARK_LIST_DIRTY"] = 2] = "MARK_LIST_DIRTY";
})(DispatcherEventType || (DispatcherEventType = {}));
var globalCallbacksInvoker = new CallbacksInvoker();
var NodeEventProcessor = function () {
  function NodeEventProcessor(node) {
    this.claimedTouchIdList = [];
    this.maskList = null;
    this.cachedCameraPriority = 0;
    this.previousMouseIn = false;
    this.bubblingTarget = null;
    this.capturingTarget = null;
    this.shouldHandleEventMouse = false;
    this.shouldHandleEventTouch = false;
    this._dispatchingTouch = null;
    this._isEnabled = false;
    this._isMouseLeaveWindow = false;
    this._node = node;
  }
  var _proto = NodeEventProcessor.prototype;
  _proto.setEnabled = function setEnabled(value, recursive) {
    if (recursive === void 0) {
      recursive = false;
    }
    if (this._isEnabled === value) {
      return;
    }
    this._isEnabled = value;
    var node = this.node;
    var children = node.children;
    if (value) {
      this._attachMask();
    }
    globalCallbacksInvoker.emit(DispatcherEventType.MARK_LIST_DIRTY);
    if (recursive && children.length > 0) {
      for (var i = 0; i < children.length; ++i) {
        var child = children[i];
        child.eventProcessor.setEnabled(value, true);
      }
    }
  };
  _proto.reattach = function reattach() {
    this.node.walk(function (node) {
      var eventProcessor = node.eventProcessor;
      var currentMaskList = eventProcessor._searchComponentsInParent(NodeEventProcessor._maskComp);
      eventProcessor.maskList = currentMaskList;
    });
  };
  _proto.destroy = function destroy() {
    if (_currentHovered === this._node) {
      _currentHovered = null;
    }
    if (this.capturingTarget) this.capturingTarget.clear();
    if (this.bubblingTarget) this.bubblingTarget.clear();
    globalCallbacksInvoker.emit(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this);
    if (this._dispatchingTouch) {
      var cancelEvent = new EventTouch([this._dispatchingTouch], true, InputEventType.TOUCH_CANCEL);
      cancelEvent.touch = this._dispatchingTouch;
      this.dispatchEvent(cancelEvent);
      this._dispatchingTouch = null;
    }
  };
  _proto.on = function on(type, callback, target, useCapture) {
    this._tryEmittingAddEvent(type);
    useCapture = !!useCapture;
    var invoker;
    if (useCapture) {
      var _this$capturingTarget;
      invoker = (_this$capturingTarget = this.capturingTarget) !== null && _this$capturingTarget !== void 0 ? _this$capturingTarget : this.capturingTarget = this._newCallbacksInvoker();
    } else {
      var _this$bubblingTarget;
      invoker = (_this$bubblingTarget = this.bubblingTarget) !== null && _this$bubblingTarget !== void 0 ? _this$bubblingTarget : this.bubblingTarget = this._newCallbacksInvoker();
    }
    invoker.on(type, callback, target);
    return callback;
  };
  _proto.once = function once(type, callback, target, useCapture) {
    this._tryEmittingAddEvent(type);
    useCapture = !!useCapture;
    var invoker;
    if (useCapture) {
      var _this$capturingTarget2;
      invoker = (_this$capturingTarget2 = this.capturingTarget) !== null && _this$capturingTarget2 !== void 0 ? _this$capturingTarget2 : this.capturingTarget = this._newCallbacksInvoker();
    } else {
      var _this$bubblingTarget2;
      invoker = (_this$bubblingTarget2 = this.bubblingTarget) !== null && _this$bubblingTarget2 !== void 0 ? _this$bubblingTarget2 : this.bubblingTarget = this._newCallbacksInvoker();
    }
    invoker.on(type, callback, target, true);
    return callback;
  };
  _proto.off = function off(type, callback, target, useCapture) {
    var _invoker;
    useCapture = !!useCapture;
    var invoker;
    if (useCapture) {
      invoker = this.capturingTarget;
    } else {
      invoker = this.bubblingTarget;
    }
    (_invoker = invoker) == null ? void 0 : _invoker.off(type, callback, target);
  };
  _proto.targetOff = function targetOff(target) {
    var _this$capturingTarget3, _this$bubblingTarget3;
    (_this$capturingTarget3 = this.capturingTarget) == null ? void 0 : _this$capturingTarget3.removeAll(target);
    (_this$bubblingTarget3 = this.bubblingTarget) == null ? void 0 : _this$bubblingTarget3.removeAll(target);
    if (this.shouldHandleEventTouch && !this._hasTouchListeners()) {
      this.shouldHandleEventTouch = false;
    }
    if (this.shouldHandleEventMouse && !this._hasMouseListeners()) {
      this.shouldHandleEventMouse = false;
    }
    if (!this._hasPointerListeners()) {
      globalCallbacksInvoker.emit(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this);
    }
  };
  _proto.emit = function emit(type, arg0, arg1, arg2, arg3, arg4) {
    var _this$bubblingTarget4;
    (_this$bubblingTarget4 = this.bubblingTarget) == null ? void 0 : _this$bubblingTarget4.emit(type, arg0, arg1, arg2, arg3, arg4);
  };
  _proto.dispatchEvent = function dispatchEvent(event) {
    var owner = this.node;
    var target;
    var i = 0;
    event.target = owner;
    var cachedArray = _arrayPool.alloc();
    cachedArray.length = 0;
    this.getCapturingTargets(event.type, cachedArray);
    event.eventPhase = 1;
    for (i = cachedArray.length - 1; i >= 0; --i) {
      target = cachedArray[i];
      if (target.eventProcessor.capturingTarget) {
        event.currentTarget = target;
        target.eventProcessor.capturingTarget.emit(event.type, event, cachedArray);
        if (event.propagationStopped) {
          _arrayPool.free(cachedArray);
          return;
        }
      }
    }
    event.eventPhase = 2;
    event.currentTarget = owner;
    if (this.capturingTarget) {
      this.capturingTarget.emit(event.type, event);
    }
    if (!event.propagationImmediateStopped && this.bubblingTarget) {
      this.bubblingTarget.emit(event.type, event);
    }
    if (!event.propagationStopped && event.bubbles) {
      cachedArray.length = 0;
      this.getBubblingTargets(event.type, cachedArray);
      event.eventPhase = 3;
      for (i = 0; i < cachedArray.length; ++i) {
        target = cachedArray[i];
        if (target.eventProcessor.bubblingTarget) {
          event.currentTarget = target;
          target.eventProcessor.bubblingTarget.emit(event.type, event);
          if (event.propagationStopped) {
            _arrayPool.free(cachedArray);
            return;
          }
        }
      }
    }
    _arrayPool.free(cachedArray);
  };
  _proto.hasEventListener = function hasEventListener(type, callback, target) {
    var has = false;
    if (this.bubblingTarget) {
      has = this.bubblingTarget.hasEventListener(type, callback, target);
    }
    if (!has && this.capturingTarget) {
      has = this.capturingTarget.hasEventListener(type, callback, target);
    }
    return has;
  };
  _proto.getCapturingTargets = function getCapturingTargets(type, targets) {
    var parent = this._node.parent;
    while (parent) {
      var _parent$eventProcesso;
      if ((_parent$eventProcesso = parent.eventProcessor.capturingTarget) != null && _parent$eventProcesso.hasEventListener(type)) {
        targets.push(parent);
      }
      parent = parent.parent;
    }
  };
  _proto.getBubblingTargets = function getBubblingTargets(type, targets) {
    var parent = this._node.parent;
    while (parent) {
      var _parent$eventProcesso2;
      if ((_parent$eventProcesso2 = parent.eventProcessor.bubblingTarget) != null && _parent$eventProcesso2.hasEventListener(type)) {
        targets.push(parent);
      }
      parent = parent.parent;
    }
  };
  _proto.onUpdatingSiblingIndex = function onUpdatingSiblingIndex() {
    globalCallbacksInvoker.emit(DispatcherEventType.MARK_LIST_DIRTY);
  };
  _proto._searchComponentsInParent = function _searchComponentsInParent(ctor) {
    var node = this.node;
    if (ctor) {
      var index = 0;
      var list = [];
      for (var curr = node; curr && cclegacy.Node.isNode(curr); curr = curr.parent, ++index) {
        var comp = curr.getComponent(ctor);
        if (comp) {
          var next = {
            index: index,
            comp: comp
          };
          if (list) {
            list.push(next);
          } else {
            list = [next];
          }
        }
      }
      return list.length > 0 ? list : null;
    }
    return null;
  };
  _proto._attachMask = function _attachMask() {
    this.maskList = this._searchComponentsInParent(NodeEventProcessor._maskComp);
  };
  _proto._isTouchEvent = function _isTouchEvent(type) {
    var index = _touchEvents.indexOf(type);
    return index !== -1;
  };
  _proto._isMouseEvent = function _isMouseEvent(type) {
    var index = _mouseEvents.indexOf(type);
    return index !== -1;
  };
  _proto._hasTouchListeners = function _hasTouchListeners() {
    for (var i = 0; i < _touchEvents.length; ++i) {
      var eventType = _touchEvents[i];
      if (this.hasEventListener(eventType)) {
        return true;
      }
    }
    return false;
  };
  _proto._hasMouseListeners = function _hasMouseListeners() {
    for (var i = 0; i < _mouseEvents.length; ++i) {
      var eventType = _mouseEvents[i];
      if (this.hasEventListener(eventType)) {
        return true;
      }
    }
    return false;
  };
  _proto._hasPointerListeners = function _hasPointerListeners() {
    var has = this._hasTouchListeners();
    if (has) {
      return true;
    }
    return this._hasMouseListeners();
  };
  _proto._tryEmittingAddEvent = function _tryEmittingAddEvent(typeToAdd) {
    var isTouchEvent = this._isTouchEvent(typeToAdd);
    var isMouseEvent = this._isMouseEvent(typeToAdd);
    if (isTouchEvent) {
      this.shouldHandleEventTouch = true;
    } else if (isMouseEvent) {
      this.shouldHandleEventMouse = true;
    }
    if ((isTouchEvent || isMouseEvent) && !this._hasPointerListeners()) {
      globalCallbacksInvoker.emit(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this);
    }
  };
  _proto._newCallbacksInvoker = function _newCallbacksInvoker() {
    var _this = this;
    var callbacksInvoker = new CallbacksInvoker();
    callbacksInvoker._registerOffCallback(function () {
      if (_this.shouldHandleEventTouch && !_this._hasTouchListeners()) {
        _this.shouldHandleEventTouch = false;
      }
      if (_this.shouldHandleEventMouse && !_this._hasMouseListeners()) {
        _this.shouldHandleEventMouse = false;
      }
      if (!_this._hasPointerListeners()) {
        globalCallbacksInvoker.emit(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, _this);
      }
    });
    return callbacksInvoker;
  };
  _proto._handleEventMouse = function _handleEventMouse(eventMouse) {
    switch (eventMouse.type) {
      case InputEventType.MOUSE_DOWN:
        return this._handleMouseDown(eventMouse);
      case InputEventType.MOUSE_MOVE:
        return this._handleMouseMove(eventMouse);
      case InputEventType.MOUSE_UP:
        return this._handleMouseUp(eventMouse);
      case InputEventType.MOUSE_WHEEL:
        return this._handleMouseWheel(eventMouse);
      case InputEventType.MOUSE_LEAVE:
        return this._handleMouseLeave(eventMouse);
      case InputEventType.MOUSE_ENTER:
        return this._handleMouseEnter(eventMouse);
      default:
        return false;
    }
  };
  _proto._handleMouseDown = function _handleMouseDown(event) {
    var node = this._node;
    var uiTransformComp = node._getUITransformComp();
    if (!node || !uiTransformComp) {
      return false;
    }
    event.getLocation(pos);
    if (uiTransformComp.hitTest(pos, event.windowId)) {
      event.type = NodeEventType.MOUSE_DOWN;
      event.bubbles = true;
      node.dispatchEvent(event);
      event.propagationStopped = true;
      return true;
    }
    return false;
  };
  _proto._handleMouseMove = function _handleMouseMove(event) {
    var node = this._node;
    var uiTransformComp = node._getUITransformComp();
    if (!node || !uiTransformComp || this._isMouseLeaveWindow) {
      return false;
    }
    event.getLocation(pos);
    var hit = uiTransformComp.hitTest(pos, event.windowId);
    if (hit) {
      if (!this.previousMouseIn) {
        if (_currentHovered && _currentHovered !== node) {
          event.type = NodeEventType.MOUSE_LEAVE;
          _currentHovered.dispatchEvent(event);
          _currentHovered.eventProcessor.previousMouseIn = false;
        }
        _currentHovered = node;
        event.type = NodeEventType.MOUSE_ENTER;
        node.dispatchEvent(event);
        this.previousMouseIn = true;
      }
      event.type = NodeEventType.MOUSE_MOVE;
      event.bubbles = true;
      node.dispatchEvent(event);
      event.propagationStopped = true;
      return true;
    } else if (this.previousMouseIn) {
      event.type = NodeEventType.MOUSE_LEAVE;
      node.dispatchEvent(event);
      this.previousMouseIn = false;
      _currentHovered = null;
    }
    return false;
  };
  _proto._handleMouseUp = function _handleMouseUp(event) {
    var node = this._node;
    var uiTransformComp = node._getUITransformComp();
    if (!node || !uiTransformComp) {
      return false;
    }
    event.getLocation(pos);
    if (uiTransformComp.hitTest(pos, event.windowId)) {
      event.type = NodeEventType.MOUSE_UP;
      event.bubbles = true;
      node.dispatchEvent(event);
      event.propagationStopped = true;
      return true;
    }
    return false;
  };
  _proto._handleMouseWheel = function _handleMouseWheel(event) {
    var node = this._node;
    var uiTransformComp = node._getUITransformComp();
    if (!node || !uiTransformComp) {
      return false;
    }
    event.getLocation(pos);
    if (uiTransformComp.hitTest(pos, event.windowId)) {
      event.type = NodeEventType.MOUSE_WHEEL;
      event.bubbles = true;
      node.dispatchEvent(event);
      event.propagationStopped = true;
      return true;
    }
    return false;
  };
  _proto._handleMouseLeave = function _handleMouseLeave(event) {
    this._isMouseLeaveWindow = true;
    if (this.previousMouseIn) {
      event.type = NodeEventType.MOUSE_LEAVE;
      this._node.dispatchEvent(event);
      this.previousMouseIn = false;
      _currentHovered = null;
    }
    return false;
  };
  _proto._handleMouseEnter = function _handleMouseEnter(event) {
    this._isMouseLeaveWindow = false;
    return false;
  };
  _proto._handleEventTouch = function _handleEventTouch(eventTouch) {
    try {
      switch (eventTouch.type) {
        case InputEventType.TOUCH_START:
          return this._handleTouchStart(eventTouch);
        case InputEventType.TOUCH_MOVE:
          return this._handleTouchMove(eventTouch);
        case InputEventType.TOUCH_END:
          return this._handleTouchEnd(eventTouch);
        case InputEventType.TOUCH_CANCEL:
          return this._handleTouchCancel(eventTouch);
        default:
          return false;
      }
    } catch (err) {
      this.claimedTouchIdList.length = 0;
      throw err;
    }
  };
  _proto._handleTouchStart = function _handleTouchStart(event) {
    var node = this.node;
    var uiTransformComp = node._getUITransformComp();
    if (!node || !uiTransformComp) {
      return false;
    }
    event.getLocation(pos);
    if (uiTransformComp.hitTest(pos, event.windowId)) {
      event.type = NodeEventType.TOUCH_START;
      event.bubbles = true;
      this._dispatchingTouch = event.touch;
      node.dispatchEvent(event);
      return true;
    }
    return false;
  };
  _proto._handleTouchMove = function _handleTouchMove(event) {
    var node = this.node;
    if (!node || !node._getUITransformComp()) {
      return false;
    }
    event.type = NodeEventType.TOUCH_MOVE;
    event.bubbles = true;
    this._dispatchingTouch = event.touch;
    node.dispatchEvent(event);
    return true;
  };
  _proto._handleTouchEnd = function _handleTouchEnd(event) {
    var node = this.node;
    var uiTransformComp = node._getUITransformComp();
    if (!node || !uiTransformComp) {
      return;
    }
    event.getLocation(pos);
    if (uiTransformComp.hitTest(pos, event.windowId)) {
      event.type = NodeEventType.TOUCH_END;
    } else {
      event.type = NodeEventType.TOUCH_CANCEL;
    }
    event.bubbles = true;
    node.dispatchEvent(event);
    this._dispatchingTouch = null;
  };
  _proto._handleTouchCancel = function _handleTouchCancel(event) {
    var node = this.node;
    if (!node || !node._getUITransformComp()) {
      return;
    }
    event.type = NodeEventType.TOUCH_CANCEL;
    event.bubbles = true;
    node.dispatchEvent(event);
    this._dispatchingTouch = null;
  };
  return _createClass(NodeEventProcessor, [{
    key: "isEnabled",
    get: function get() {
      return this._isEnabled;
    }
  }, {
    key: "node",
    get: function get() {
      return this._node;
    }
  }]);
}();
NodeEventProcessor._maskComp = null;
NodeEventProcessor.callbacksInvoker = globalCallbacksInvoker;
cclegacy.NodeEventProcessor = NodeEventProcessor;

var m4_1$1 = mat4();
var tempNodes = [];
var DEG_TO_RAD = Math.PI / 180.0;
function findSkewAndGetOriginalWorldMatrix(node, out) {
  if (!node) {
    return false;
  }
  tempNodes.length = 0;
  var ancestors = tempNodes;
  var startNode = null;
  for (var cur = node; cur; cur = cur.parent) {
    ancestors.push(cur);
    if (cur._uiProps._uiSkewComp) {
      startNode = cur;
    }
  }
  var ret = false;
  if (startNode) {
    out.set(startNode.parent._mat);
    var start = ancestors.indexOf(startNode);
    for (var i = start; i >= 0; --i) {
      var _cur = ancestors[i];
      Mat4.fromSRT(m4_1$1, _cur.rotation, _cur.position, _cur.scale);
      Mat4.multiply(out, out, m4_1$1);
    }
    ret = true;
  } else {
    out.set(node._mat);
  }
  tempNodes.length = 0;
  return ret;
}
function updateLocalMatrixBySkew(uiSkewComp, outLocalMatrix) {
  if (!uiSkewComp.isSkewEnabled()) return;
  if (uiSkewComp.x === 0 && uiSkewComp.y === 0) return;
  if (uiSkewComp.rotational) {
    var radiansX = -(uiSkewComp.x * DEG_TO_RAD);
    var radiansY = uiSkewComp.y * DEG_TO_RAD;
    var cx = Math.cos(radiansX);
    var sx = Math.sin(radiansX);
    var cy = Math.cos(radiansY);
    var sy = Math.sin(radiansY);
    var m00 = outLocalMatrix.m00;
    var m01 = outLocalMatrix.m01;
    var m04 = outLocalMatrix.m04;
    var m05 = outLocalMatrix.m05;
    outLocalMatrix.m00 = cy * m00 - sx * m01;
    outLocalMatrix.m01 = sy * m00 + cx * m01;
    outLocalMatrix.m04 = cy * m04 - sx * m05;
    outLocalMatrix.m05 = sy * m04 + cx * m05;
  } else {
    var skewX = Math.tan(uiSkewComp.x * DEG_TO_RAD);
    var skewY = Math.tan(uiSkewComp.y * DEG_TO_RAD);
    var a = outLocalMatrix.m00;
    var b = outLocalMatrix.m01;
    var c = outLocalMatrix.m04;
    var d = outLocalMatrix.m05;
    outLocalMatrix.m00 = a + c * skewY;
    outLocalMatrix.m01 = b + d * skewY;
    outLocalMatrix.m04 = c + a * skewX;
    outLocalMatrix.m05 = d + b * skewX;
  }
}

var _dec$3, _dec2$2, _dec3$2, _class$3, _class2$3, _initializer$3, _initializer2$3, _initializer3$2, _initializer4$2, _initializer5$2, _initializer6$2, _initializer7$2, _initializer8$2, _initializer9$2, _initializer0$2, _initializer1$2, _Node;
var Destroying = CCObjectFlags.Destroying;
var DontDestroy = CCObjectFlags.DontDestroy;
var Deactivating = CCObjectFlags.Deactivating;
var TRANSFORM_CHANGED = NodeEventType.TRANSFORM_CHANGED;
var ACTIVE_CHANGED = NodeEventType.ACTIVE_CHANGED;
var TRANSFORM_ON = 1 << 0;
var ACTIVE_ON = 1 << 1;
var idGenerator = new IDGenerator('Node');
function getConstructor(typeOrClassName) {
  if (!typeOrClassName) {
    errorID(3804);
    return null;
  }
  if (typeof typeOrClassName === 'string') {
    return getClassByName(typeOrClassName);
  }
  return typeOrClassName;
}
var v3_a = v3();
var v3_b = v3();
var q_a = quat();
var q_b = quat();
var qt_1 = quat();
var m3_1 = new Mat3();
var m4_1 = mat4();
var m4_2 = mat4();
var dirtyNodes = [];
var reserveContentsForAllSyncablePrefabTag = Symbol('ReserveContentsForAllSyncablePrefab');
var globalFlagChangeVersion = 0;
var skewCompCount = 0;
var Node = (_dec$3 = ccclass('cc.Node'), _dec2$2 = type(Vec3), _dec3$2 = type(MobilityMode), _dec$3(_class$3 = (_class2$3 = (_Node = function (_CCObject) {
  function Node(name) {
    var _this;
    if (name === undefined) name = 'New Node';
    _this = _CCObject.call(this, name) || this;
    _this._parent = _initializer$3 && _initializer$3();
    _this._children = _initializer2$3 && _initializer2$3();
    _this._active = _initializer3$2 && _initializer3$2();
    _this._components = _initializer4$2 && _initializer4$2();
    _this._prefab = _initializer5$2 && _initializer5$2();
    _this._scene = null;
    _this._activeInHierarchy = false;
    _this._id = idGenerator.getNewId();
    _this._eventProcessor = new NodeEventProcessor(_this);
    _this._eventMask = 0;
    _this._siblingIndex = 0;
    _this._originalSceneId = '';
    _this._uiProps = new NodeUIProperties(_this);
    _this._static = false;
    _this._lpos = _initializer6$2 && _initializer6$2();
    _this._lrot = _initializer7$2 && _initializer7$2();
    _this._lscale = _initializer8$2 && _initializer8$2();
    _this._mobility = _initializer9$2 && _initializer9$2();
    _this._layer = _initializer0$2 && _initializer0$2();
    _this._euler = _initializer1$2 && _initializer1$2();
    _this._transformFlags = TransformBit.TRS | TransformBit.SKEW;
    _this._eulerDirty = false;
    _this._flagChangeVersion = 0;
    _this._hasChangedFlags = 0;
    _this._pos = new Vec3();
    _this._rot = new Quat();
    _this._scale = new Vec3(1, 1, 1);
    _this._mat = new Mat4();
    return _this;
  }
  _inheritsLoose(Node, _CCObject);
  var _proto = Node.prototype;
  _proto._setActiveInHierarchy = function _setActiveInHierarchy(v) {
    this._activeInHierarchy = v;
  };
  Node._setScene = function _setScene(node) {
    node._updateScene();
  };
  Node._incSkewCompCount = function _incSkewCompCount() {
    ++skewCompCount;
  };
  Node._decSkewCompCount = function _decSkewCompCount() {
    --skewCompCount;
  };
  Node._findComponent = function _findComponent(node, constructor) {
    var cls = constructor;
    var comps = node._components;
    if (cls._sealed) {
      for (var i = 0; i < comps.length; ++i) {
        var comp = comps[i];
        if (comp.constructor === constructor) {
          return comp;
        }
      }
    } else {
      for (var _i = 0; _i < comps.length; ++_i) {
        var _comp = comps[_i];
        if (_comp instanceof constructor) {
          return _comp;
        }
      }
    }
    return null;
  };
  Node._findComponents = function _findComponents(node, constructor, components) {
    var cls = constructor;
    var comps = node._components;
    if (cls._sealed) {
      for (var i = 0; i < comps.length; ++i) {
        var comp = comps[i];
        if (comp.constructor === constructor) {
          components.push(comp);
        }
      }
    } else {
      for (var _i2 = 0; _i2 < comps.length; ++_i2) {
        var _comp2 = comps[_i2];
        if (_comp2 instanceof constructor) {
          components.push(_comp2);
        }
      }
    }
  };
  Node._findChildComponent = function _findChildComponent(children, constructor) {
    for (var i = 0; i < children.length; ++i) {
      var node = children[i];
      var comp = Node._findComponent(node, constructor);
      if (comp) {
        return comp;
      }
      if (node._children.length > 0) {
        comp = Node._findChildComponent(node._children, constructor);
        if (comp) {
          return comp;
        }
      }
    }
    return null;
  };
  Node._findChildComponents = function _findChildComponents(children, constructor, components) {
    for (var i = 0; i < children.length; ++i) {
      var node = children[i];
      Node._findComponents(node, constructor, components);
      if (node._children.length > 0) {
        Node._findChildComponents(node._children, constructor, components);
      }
    }
  };
  _proto.getWritableComponents = function getWritableComponents() {
    return this._components;
  };
  _proto._updateScene = function _updateScene() {
    if (this._parent == null) {
      errorID(1640, this.name, this.uuid);
    } else {
      this._scene = this._parent._scene;
    }
  };
  _proto.attr = function attr(attrs) {
    mixin(this, attrs);
  };
  _proto.getParent = function getParent() {
    return this._parent;
  };
  _proto.modifyParent = function modifyParent(parent) {
    this._parent = parent;
  };
  _proto.setParent = function setParent(value, keepWorldTransform) {
    if (keepWorldTransform === void 0) {
      keepWorldTransform = false;
    }
    if (keepWorldTransform) {
      this.updateWorldTransform();
    }
    if (this._parent === value) {
      return;
    }
    var oldParent = this._parent;
    var newParent = value;
    if (oldParent && oldParent._objFlags & Deactivating) {
      errorID(3821);
    }
    this._parent = newParent;
    this._siblingIndex = 0;
    this._onSetParent(oldParent, keepWorldTransform);
    if (this.emit) {
      this.emit(NodeEventType.PARENT_CHANGED, oldParent);
    }
    if (oldParent) {
      if (!(oldParent._objFlags & Destroying)) {
        var removeAt = oldParent._children.indexOf(this);
        if (removeAt < 0) {
          errorID(1633);
          return;
        }
        oldParent._children.splice(removeAt, 1);
        oldParent._updateSiblingIndex();
        if (oldParent.emit) {
          oldParent.emit(NodeEventType.CHILD_REMOVED, this);
        }
      }
    }
    if (newParent) {
      if (newParent._objFlags & Deactivating) {
        errorID(3821);
      }
      newParent._children.push(this);
      this._siblingIndex = newParent._children.length - 1;
      if (newParent.emit) {
        newParent.emit(NodeEventType.CHILD_ADDED, this);
      }
    }
    this._onHierarchyChanged(oldParent);
  };
  _proto.getChildByUuid = function getChildByUuid(uuid) {
    if (!uuid) {
      log('Invalid uuid');
      return null;
    }
    var locChildren = this._children;
    for (var i = 0, len = locChildren.length; i < len; i++) {
      if (locChildren[i]._id === uuid) {
        return locChildren[i];
      }
    }
    return null;
  };
  _proto.getChildByName = function getChildByName(name) {
    if (!name) {
      log('Invalid name');
      return null;
    }
    var locChildren = this._children;
    for (var i = 0, len = locChildren.length; i < len; i++) {
      if (locChildren[i]._name === name) {
        return locChildren[i];
      }
    }
    return null;
  };
  _proto.getChildByPath = function getChildByPath(path) {
    var segments = path.split('/');
    var lastNode = this;
    var _loop = function _loop() {
        var segment = segments[i];
        if (segment.length === 0) {
          return 0;
        }
        var next = lastNode.children.find(function (childNode) {
          return childNode.name === segment;
        });
        if (!next) {
          return {
            v: null
          };
        }
        lastNode = next;
      },
      _ret;
    for (var i = 0; i < segments.length; ++i) {
      _ret = _loop();
      if (_ret === 0) continue;
      if (_ret) return _ret.v;
    }
    return lastNode;
  };
  _proto.addChild = function addChild(child) {
    child.setParent(this);
  };
  _proto.insertChild = function insertChild(child, siblingIndex) {
    child.setParent(this);
    child.setSiblingIndex(siblingIndex);
  };
  _proto.getSiblingIndex = function getSiblingIndex() {
    return this._siblingIndex;
  };
  _proto.setSiblingIndex = function setSiblingIndex(index) {
    if (!this._parent) {
      return;
    }
    if (this._parent._objFlags & Deactivating) {
      errorID(3821);
      return;
    }
    var siblings = this._parent._children;
    index = index >= 0 ? index : siblings.length + index;
    var oldIndex = siblings.indexOf(this);
    if (index !== oldIndex) {
      siblings.splice(oldIndex, 1);
      if (index < siblings.length) {
        siblings.splice(index, 0, this);
      } else {
        siblings.push(this);
      }
      this._parent._updateSiblingIndex();
      if (this._onSiblingIndexChanged) {
        this._onSiblingIndexChanged(index);
      }
      this._eventProcessor.onUpdatingSiblingIndex();
    }
  };
  _proto.walk = function walk(preFunc, postFunc) {
    var index = 1;
    var children = null;
    var curr = null;
    var i = 0;
    var stack = Node._stacks[Node._stackId];
    if (!stack) {
      stack = [];
      Node._stacks.push(stack);
    }
    Node._stackId++;
    stack.length = 0;
    stack[0] = this;
    var parent = null;
    var afterChildren = false;
    while (index) {
      index--;
      curr = stack[index];
      if (!curr) {
        continue;
      }
      if (!afterChildren && preFunc) {
        preFunc(curr);
      } else if (afterChildren && postFunc) {
        postFunc(curr);
      }
      stack[index] = null;
      if (afterChildren) {
        if (parent === this._parent) break;
        afterChildren = false;
      } else {
        if (curr._children.length > 0) {
          parent = curr;
          children = curr._children;
          i = 0;
          stack[index] = children[i];
          index++;
        } else {
          stack[index] = curr;
          index++;
          afterChildren = true;
        }
        continue;
      }
      if (children) {
        i++;
        if (children[i]) {
          stack[index] = children[i];
          index++;
        } else if (parent) {
          stack[index] = parent;
          index++;
          afterChildren = true;
          if (parent._parent) {
            children = parent._parent._children;
            i = children.indexOf(parent);
            parent = parent._parent;
          } else {
            parent = null;
            children = null;
          }
          if (i < 0) {
            break;
          }
        }
      }
    }
    stack.length = 0;
    Node._stackId--;
  };
  _proto.removeFromParent = function removeFromParent() {
    if (this._parent) {
      this._parent.removeChild(this);
    }
  };
  _proto.removeChild = function removeChild(child) {
    if (this._children.indexOf(child) > -1) {
      child.parent = null;
    }
  };
  _proto.removeAllChildren = function removeAllChildren() {
    var children = this._children;
    for (var i = children.length - 1; i >= 0; i--) {
      var node = children[i];
      if (node) {
        node.parent = null;
      }
    }
    this._children.length = 0;
  };
  _proto.isChildOf = function isChildOf(parent) {
    var child = this;
    do {
      if (child === parent) {
        return true;
      }
      child = child._parent;
    } while (child);
    return false;
  };
  _proto.getComponent = function getComponent(typeOrClassName) {
    var constructor = getConstructor(typeOrClassName);
    if (constructor) {
      return Node._findComponent(this, constructor);
    }
    return null;
  };
  _proto.getComponents = function getComponents(typeOrClassName) {
    var constructor = getConstructor(typeOrClassName);
    var components = [];
    if (constructor) {
      Node._findComponents(this, constructor, components);
    }
    return components;
  };
  _proto.getComponentInChildren = function getComponentInChildren(typeOrClassName) {
    var constructor = getConstructor(typeOrClassName);
    if (constructor) {
      return Node._findChildComponent(this._children, constructor);
    }
    return null;
  };
  _proto.getComponentsInChildren = function getComponentsInChildren(typeOrClassName) {
    var constructor = getConstructor(typeOrClassName);
    var components = [];
    if (constructor) {
      Node._findComponents(this, constructor, components);
      Node._findChildComponents(this._children, constructor, components);
    }
    return components;
  };
  _proto.addComponent = function addComponent(typeOrClassName) {
    var constructor;
    if (typeof typeOrClassName === 'string') {
      constructor = getClassByName(typeOrClassName);
      if (!constructor) {
        if (cclegacy._RF.peek()) {
          errorID(3808, typeOrClassName);
        }
        throw TypeError(getError(3807, typeOrClassName));
      }
    } else {
      if (!typeOrClassName) {
        throw TypeError(getError(3804));
      }
      constructor = typeOrClassName;
    }
    if (typeof constructor !== 'function') {
      throw TypeError(getError(3809));
    }
    if (!isChildClassOf(constructor, cclegacy.Component)) {
      throw TypeError(getError(3810));
    }
    var reqComps = constructor._requireComponent;
    if (reqComps) {
      if (Array.isArray(reqComps)) {
        for (var i = 0; i < reqComps.length; i++) {
          var reqComp = reqComps[i];
          if (!this.getComponent(reqComp)) {
            this.addComponent(reqComp);
          }
        }
      } else {
        var _reqComp = reqComps;
        if (!this.getComponent(_reqComp)) {
          this.addComponent(_reqComp);
        }
      }
    }
    var component = new constructor();
    component.node = this;
    this._components.push(component);
    this.emit(NodeEventType.COMPONENT_ADDED, component);
    if (this._activeInHierarchy) {
      cclegacy.director._nodeActivator.activateComp(component);
    }
    return component;
  };
  _proto.removeComponent = function removeComponent(component) {
    if (!component) {
      errorID(3813);
      return;
    }
    var componentInstance = null;
    if (component instanceof Component) {
      componentInstance = component;
    } else {
      componentInstance = this.getComponent(component);
    }
    if (componentInstance) {
      componentInstance.destroy();
    }
  };
  _proto.on = function on(type, callback, target, useCapture) {
    if (useCapture === void 0) {
      useCapture = false;
    }
    switch (type) {
      case TRANSFORM_CHANGED:
        this._eventMask |= TRANSFORM_ON;
        break;
      case ACTIVE_CHANGED:
        this._eventMask |= ACTIVE_ON;
        break;
    }
    this._eventProcessor.on(type, callback, target, useCapture);
  };
  _proto.off = function off(type, callback, target, useCapture) {
    if (useCapture === void 0) {
      useCapture = false;
    }
    this._eventProcessor.off(type, callback, target, useCapture);
    var hasListeners = this._eventProcessor.hasEventListener(type);
    if (!hasListeners) {
      switch (type) {
        case TRANSFORM_CHANGED:
          this._eventMask &= ~TRANSFORM_ON;
          break;
        case ACTIVE_CHANGED:
          this._eventMask &= ~ACTIVE_ON;
          break;
      }
    }
  };
  _proto.once = function once(type, callback, target, useCapture) {
    this._eventProcessor.once(type, callback, target, useCapture);
  };
  _proto.emit = function emit(type, arg0, arg1, arg2, arg3, arg4) {
    this._eventProcessor.emit(type, arg0, arg1, arg2, arg3, arg4);
  };
  _proto.dispatchEvent = function dispatchEvent(event) {
    this._eventProcessor.dispatchEvent(event);
  };
  _proto.hasEventListener = function hasEventListener(type, callback, target) {
    return this._eventProcessor.hasEventListener(type, callback, target);
  };
  _proto.targetOff = function targetOff(target) {
    this._eventProcessor.targetOff(target);
    if (this._eventMask & TRANSFORM_ON && !this._eventProcessor.hasEventListener(TRANSFORM_CHANGED)) {
      this._eventMask &= ~TRANSFORM_ON;
    }
    if (this._eventMask & ACTIVE_ON && !this._eventProcessor.hasEventListener(ACTIVE_CHANGED)) {
      this._eventMask &= ~ACTIVE_ON;
    }
  };
  _proto.destroy = function destroy() {
    if (_CCObject.prototype.destroy.call(this)) {
      this.active = false;
      return true;
    }
    return false;
  };
  _proto.destroyAllChildren = function destroyAllChildren() {
    var children = this._children;
    for (var i = 0; i < children.length; ++i) {
      children[i].destroy();
    }
  };
  _proto._removeComponent = function _removeComponent(component) {
    if (!component) {
      errorID(3814);
      return;
    }
    if (!(this._objFlags & Destroying)) {
      var i = this._components.indexOf(component);
      if (i !== -1) {
        this._components.splice(i, 1);
        this.emit(NodeEventType.COMPONENT_REMOVED, component);
      } else if (component.node !== this) {
        errorID(3815);
      }
    }
  };
  _proto._updateSiblingIndex = function _updateSiblingIndex() {
    for (var i = 0; i < this._children.length; ++i) {
      this._children[i]._siblingIndex = i;
    }
    this.emit(NodeEventType.CHILDREN_ORDER_CHANGED);
  };
  _proto._instantiate = function _instantiate(cloned, isSyncedNode) {
    if (isSyncedNode === void 0) {
      isSyncedNode = false;
    }
    if (!cloned) {
      cloned = cclegacy.instantiate._clone(this, this);
    }
    cloned._prefab;
    cloned._parent = null;
    cloned._onBatchCreated(isSyncedNode);
    return cloned;
  };
  _proto._onHierarchyChangedBase = function _onHierarchyChangedBase(oldParent) {
    var newParent = this._parent;
    if (this._persistNode && !(newParent instanceof cclegacy.Scene)) {
      cclegacy.game.removePersistRootNode(this);
    }
    var shouldActiveNow = this._active && !!(newParent && newParent._activeInHierarchy);
    if (this._activeInHierarchy !== shouldActiveNow) {
      cclegacy.director._nodeActivator.activateNode(this, shouldActiveNow);
    }
  };
  _proto._onPreDestroyBase = function _onPreDestroyBase() {
    this._objFlags |= Destroying;
    var parent = this._parent;
    var destroyByParent = !!parent && (parent._objFlags & Destroying) !== 0;
    if (this._persistNode) {
      cclegacy.game.removePersistRootNode(this);
    }
    if (!destroyByParent) {
      if (parent) {
        this.emit(NodeEventType.PARENT_CHANGED, this);
        var childIndex = parent._children.indexOf(this);
        parent._children.splice(childIndex, 1);
        this._siblingIndex = 0;
        parent._updateSiblingIndex();
        if (parent.emit) {
          parent.emit(NodeEventType.CHILD_REMOVED, this);
        }
      }
    }
    this.emit(NodeEventType.NODE_DESTROYED, this);
    this._eventProcessor.destroy();
    var children = this._children;
    for (var i = 0; i < children.length; ++i) {
      children[i]._destroyImmediate();
    }
    var comps = this._components;
    for (var _i3 = 0; _i3 < comps.length; ++_i3) {
      comps[_i3]._destroyImmediate();
    }
    return destroyByParent;
  };
  Node.isNode = function isNode(obj) {
    return obj instanceof Node && (obj.constructor === Node || !(obj instanceof cclegacy.Scene));
  };
  _proto._onPreDestroy = function _onPreDestroy() {
    return this._onPreDestroyBase();
  };
  _proto[serializeTag] = function (serializationOutput, context) {
    {
      serializationOutput.writeThis();
      return;
    }
  };
  _proto._onSetParent = function _onSetParent(oldParent, keepWorldTransform) {
    if (keepWorldTransform === void 0) {
      keepWorldTransform = false;
    }
    var self = this;
    var parent = self._parent;
    if (parent) {
      if ((oldParent == null || oldParent._scene !== parent._scene) && parent._scene != null) {
        self.walk(Node._setScene);
      }
    }
    if (keepWorldTransform) {
      if (parent) {
        parent.updateWorldTransform();
        if (approx(Mat4.determinant(parent._mat), 0, EPSILON)) {
          warnID(14300);
          self._transformFlags |= TransformBit.TRS;
          self.updateWorldTransform();
        } else {
          var newParentMatWithoutSkew = parent._mat;
          {
            var hasSkew = skewCompCount > 0;
            if (hasSkew) {
              if (oldParent) {
                var foundSkewInOldParent = findSkewAndGetOriginalWorldMatrix(oldParent, m4_2);
                Mat4.fromSRT(m4_1, self._lrot, self._lpos, self._lscale);
                var oldParentMatWithoutSkew = foundSkewInOldParent ? m4_2 : oldParent._mat;
                Mat4.multiply(self._mat, oldParentMatWithoutSkew, m4_1);
              }
              var foundSkewInNewParent = findSkewAndGetOriginalWorldMatrix(parent, m4_2);
              if (foundSkewInNewParent) {
                newParentMatWithoutSkew = m4_2;
              }
            }
          }
          Mat4.multiply(m4_1, Mat4.invert(m4_1, newParentMatWithoutSkew), self._mat);
          Mat4.toSRT(m4_1, self._lrot, self._lpos, self._lscale);
        }
      } else {
        Vec3.copy(self._lpos, self._pos);
        Quat.copy(self._lrot, self._rot);
        Vec3.copy(self._lscale, self._scale);
      }
      self._eulerDirty = true;
    }
    self.invalidateChildren(TransformBit.TRS);
  };
  _proto._onHierarchyChanged = function _onHierarchyChanged(oldParent) {
    this.eventProcessor.reattach();
    this._onHierarchyChangedBase(oldParent);
  };
  _proto._onBatchCreated = function _onBatchCreated(dontSyncChildPrefab) {
    if (this._eventMask & ACTIVE_ON) {
      if (!this._activeInHierarchy) {
        this.emit(ACTIVE_CHANGED, this, false);
      }
    }
    this.hasChangedFlags = TransformBit.TRS;
    this._children.forEach(function (child, i) {
      child._siblingIndex = i;
      child._onBatchCreated(dontSyncChildPrefab);
    });
  };
  _proto._onBeforeSerialize = function _onBeforeSerialize() {
    this.eulerAngles;
  };
  _proto._onPostActivated = function _onPostActivated(active) {
    var self = this;
    if (self._eventMask & ACTIVE_ON) {
      self.emit(ACTIVE_CHANGED, self, active);
    }
    var eventProcessor = this._eventProcessor;
    if (eventProcessor.isEnabled === active) {
      NodeEventProcessor.callbacksInvoker.emit(DispatcherEventType.MARK_LIST_DIRTY);
    }
    eventProcessor.setEnabled(active);
    if (active) {
      self.invalidateChildren(TransformBit.TRS);
      var uiComp = self._uiProps && self._uiProps.uiComp;
      if (uiComp) {
        uiComp.setNodeDirty();
        uiComp.setTextureDirty();
        uiComp._markForUpdateRenderData();
      }
    }
  };
  _proto.translate = function translate(trans, ns) {
    var space = ns || NodeSpace.LOCAL;
    if (space === NodeSpace.LOCAL) {
      Vec3.transformQuat(v3_a, trans, this._lrot);
      this._lpos.x += v3_a.x;
      this._lpos.y += v3_a.y;
      this._lpos.z += v3_a.z;
    } else if (space === NodeSpace.WORLD) {
      if (this._parent) {
        Quat.invert(q_a, this._parent.worldRotation);
        Vec3.transformQuat(v3_a, trans, q_a);
        var _scale = this.worldScale;
        this._lpos.x += v3_a.x / _scale.x;
        this._lpos.y += v3_a.y / _scale.y;
        this._lpos.z += v3_a.z / _scale.z;
      } else {
        this._lpos.x += trans.x;
        this._lpos.y += trans.y;
        this._lpos.z += trans.z;
      }
    }
    this.invalidateChildren(TransformBit.POSITION);
    if (this._eventMask & TRANSFORM_ON) {
      this.emit(TRANSFORM_CHANGED, TransformBit.POSITION);
    }
  };
  _proto.rotate = function rotate(rot, ns) {
    var space = ns || NodeSpace.LOCAL;
    Quat.normalize(q_a, rot);
    if (space === NodeSpace.LOCAL) {
      Quat.multiply(this._lrot, this._lrot, q_a);
    } else if (space === NodeSpace.WORLD) {
      var worldRot = this.worldRotation;
      Quat.multiply(q_b, q_a, worldRot);
      Quat.invert(q_a, worldRot);
      Quat.multiply(q_b, q_a, q_b);
      Quat.multiply(this._lrot, this._lrot, q_b);
    }
    this._eulerDirty = true;
    this.invalidateChildren(TransformBit.ROTATION);
    if (this._eventMask & TRANSFORM_ON) {
      this.emit(TRANSFORM_CHANGED, TransformBit.ROTATION);
    }
  };
  _proto.lookAt = function lookAt(pos, up) {
    this.getWorldPosition(v3_a);
    Vec3.subtract(v3_a, v3_a, pos);
    Vec3.normalize(v3_a, v3_a);
    Quat.fromViewUp(q_a, v3_a, up);
    this.setWorldRotation(q_a);
  };
  _proto.invalidateChildren = function invalidateChildren(dirtyBit) {
    var i = 0;
    var j = 0;
    var l = 0;
    var cur;
    var children;
    var hasChangedFlags = 0;
    var childDirtyBit = dirtyBit | TransformBit.POSITION;
    dirtyNodes[0] = this;
    while (i >= 0) {
      cur = dirtyNodes[i--];
      hasChangedFlags = cur.hasChangedFlags;
      if (cur.isValid && !cur.isSkipTransformUpdate && (cur._transformFlags & hasChangedFlags & dirtyBit) !== dirtyBit) {
        cur._transformFlags |= dirtyBit;
        cur.hasChangedFlags = hasChangedFlags | dirtyBit;
        children = cur._children;
        l = children.length;
        for (j = 0; j < l; j++) {
          dirtyNodes[++i] = children[j];
        }
      }
      dirtyBit = childDirtyBit;
    }
  };
  _proto.updateWorldTransform = function updateWorldTransform() {
    if (!this._transformFlags) {
      return;
    }
    var cur = this;
    var i = 0;
    while (cur && cur._transformFlags) {
      dirtyNodes[i++] = cur;
      cur = cur._parent;
    }
    var child;
    var childMat;
    var childPos;
    var dirtyBits = 0;
    var positionDirty = 0;
    var rotationScaleSkewDirty = 0;
    var uiSkewComp = null;
    var foundSkewInAncestor = false;
    while (i) {
      child = dirtyNodes[--i];
      childMat = child._mat;
      childPos = child._pos;
      dirtyBits |= child._transformFlags;
      positionDirty = dirtyBits & TransformBit.POSITION;
      rotationScaleSkewDirty = dirtyBits & TransformBit.RSS;
      if (cur) {
        if (positionDirty && !rotationScaleSkewDirty) {
          Vec3.transformMat4(childPos, child._lpos, cur._mat);
          childMat.m12 = childPos.x;
          childMat.m13 = childPos.y;
          childMat.m14 = childPos.z;
        }
        if (rotationScaleSkewDirty) {
          var originalWorldMatrix = childMat;
          Mat4.fromSRT(m4_1, child._lrot, child._lpos, child._lscale);
          if (skewCompCount > 0) {
            foundSkewInAncestor = findSkewAndGetOriginalWorldMatrix(cur, m4_2);
            uiSkewComp = child._uiProps._uiSkewComp;
            if (uiSkewComp || foundSkewInAncestor) {
              Mat4.multiply(m4_2, m4_2, m4_1);
              if (uiSkewComp) {
                updateLocalMatrixBySkew(uiSkewComp, m4_1);
              }
              originalWorldMatrix = m4_2;
            }
          }
          Mat4.multiply(childMat, cur._mat, m4_1);
          var rotTmp = dirtyBits & TransformBit.ROTATION ? child._rot : null;
          Mat4.toSRT(originalWorldMatrix, rotTmp, childPos, child._scale);
          if (foundSkewInAncestor) {
            Vec3.transformMat4(childPos, child._lpos, cur._mat);
          }
        }
      } else {
        if (positionDirty) {
          Vec3.copy(childPos, child._lpos);
          childMat.m12 = childPos.x;
          childMat.m13 = childPos.y;
          childMat.m14 = childPos.z;
        }
        if (rotationScaleSkewDirty) {
          if (dirtyBits & TransformBit.ROTATION) {
            Quat.copy(child._rot, child._lrot);
          }
          if (dirtyBits & TransformBit.SCALE) {
            Vec3.copy(child._scale, child._lscale);
          }
          Mat4.fromSRT(childMat, child._rot, child._pos, child._scale);
          if (skewCompCount > 0) {
            uiSkewComp = child._uiProps._uiSkewComp;
            if (uiSkewComp) {
              updateLocalMatrixBySkew(uiSkewComp, childMat);
            }
          }
        }
      }
      child._transformFlags = TransformBit.NONE;
      cur = child;
    }
  };
  _proto.setPosition = function setPosition(val, y, z) {
    var localPosition = this._lpos;
    if (y === undefined) {
      Vec3.copy(localPosition, val);
    } else {
      if (z === undefined) {
        z = localPosition.z;
      }
      Vec3.set(localPosition, val, y, z);
    }
    this.invalidateChildren(TransformBit.POSITION);
    if (this._eventMask & TRANSFORM_ON) {
      this.emit(TRANSFORM_CHANGED, TransformBit.POSITION);
    }
  };
  _proto.getPosition = function getPosition(out) {
    if (out) {
      return Vec3.set(out, this._lpos.x, this._lpos.y, this._lpos.z);
    }
    return Vec3.copy(new Vec3(), this._lpos);
  };
  _proto.setRotation = function setRotation(val, y, z, w) {
    if (y === undefined) {
      Quat.copy(this._lrot, val);
    } else {
      Quat.set(this._lrot, val, y, z, w);
    }
    this._eulerDirty = true;
    this.invalidateChildren(TransformBit.ROTATION);
    if (this._eventMask & TRANSFORM_ON) {
      this.emit(TRANSFORM_CHANGED, TransformBit.ROTATION);
    }
  };
  _proto.setRotationFromEuler = function setRotationFromEuler(val, y, zOpt) {
    if (y === undefined) {
      Vec3.copy(this._euler, val);
      Quat.fromEuler(this._lrot, val.x, val.y, val.z);
    } else {
      var _z = zOpt === undefined ? this._euler.z : zOpt;
      Vec3.set(this._euler, val, y, _z);
      Quat.fromEuler(this._lrot, val, y, _z);
    }
    this._eulerDirty = false;
    this.invalidateChildren(TransformBit.ROTATION);
    if (this._eventMask & TRANSFORM_ON) {
      this.emit(TRANSFORM_CHANGED, TransformBit.ROTATION);
    }
  };
  _proto.getRotation = function getRotation(out) {
    if (out) {
      return Quat.set(out, this._lrot.x, this._lrot.y, this._lrot.z, this._lrot.w);
    }
    return Quat.copy(new Quat(), this._lrot);
  };
  _proto.setScale = function setScale(val, y, z) {
    var localScale = this._lscale;
    if (y === undefined) {
      Vec3.copy(localScale, val);
    } else {
      if (z === undefined) {
        z = localScale.z;
      }
      Vec3.set(localScale, val, y, z);
    }
    this.invalidateChildren(TransformBit.SCALE);
    if (this._eventMask & TRANSFORM_ON) {
      this.emit(TRANSFORM_CHANGED, TransformBit.SCALE);
    }
  };
  _proto.getScale = function getScale(out) {
    if (out) {
      return Vec3.set(out, this._lscale.x, this._lscale.y, this._lscale.z);
    }
    return Vec3.copy(new Vec3(), this._lscale);
  };
  _proto.inverseTransformPoint = function inverseTransformPoint(out, p) {
    Vec3.copy(out, p);
    var cur = this;
    var i = 0;
    while (cur._parent) {
      dirtyNodes[i++] = cur;
      cur = cur._parent;
    }
    while (i >= 0) {
      Vec3.transformInverseRTS(out, out, cur._lrot, cur._lpos, cur._lscale);
      cur = dirtyNodes[--i];
    }
    return out;
  };
  _proto.setWorldPosition = function setWorldPosition(val, y, z) {
    var worldPosition = this._pos;
    if (y === undefined) {
      Vec3.copy(worldPosition, val);
    } else {
      Vec3.set(worldPosition, val, y, z);
    }
    var parent = this._parent;
    var local = this._lpos;
    if (parent) {
      parent.updateWorldTransform();
      Vec3.transformMat4(local, worldPosition, Mat4.invert(m4_1, parent._mat));
    } else {
      Vec3.copy(local, worldPosition);
    }
    this.invalidateChildren(TransformBit.POSITION);
    if (this._eventMask & TRANSFORM_ON) {
      this.emit(TRANSFORM_CHANGED, TransformBit.POSITION);
    }
  };
  _proto.getWorldPosition = function getWorldPosition(out) {
    this.updateWorldTransform();
    if (out) {
      return Vec3.copy(out, this._pos);
    }
    return Vec3.copy(new Vec3(), this._pos);
  };
  _proto.setWorldRotation = function setWorldRotation(val, y, z, w) {
    var worldRotation = this._rot;
    if (y === undefined) {
      Quat.copy(worldRotation, val);
    } else {
      Quat.set(worldRotation, val, y, z, w);
    }
    if (this._parent) {
      this._parent.updateWorldTransform();
      Quat.multiply(this._lrot, Quat.conjugate(this._lrot, this._parent._rot), worldRotation);
    } else {
      Quat.copy(this._lrot, worldRotation);
    }
    this._eulerDirty = true;
    this.invalidateChildren(TransformBit.ROTATION);
    if (this._eventMask & TRANSFORM_ON) {
      this.emit(TRANSFORM_CHANGED, TransformBit.ROTATION);
    }
  };
  _proto.setWorldRotationFromEuler = function setWorldRotationFromEuler(x, y, z) {
    Quat.fromEuler(q_a, x, y, z);
    this.setWorldRotation(q_a);
  };
  _proto.getWorldRotation = function getWorldRotation(out) {
    this.updateWorldTransform();
    if (out) {
      return Quat.copy(out, this._rot);
    }
    return Quat.copy(new Quat(), this._rot);
  };
  _proto.setWorldScale = function setWorldScale(val, y, z) {
    var self = this;
    var parent = self._parent;
    if (parent) {
      self.updateWorldTransform();
    }
    var worldScale = self._scale;
    if (y === undefined) {
      Vec3.copy(worldScale, val);
    } else {
      Vec3.set(worldScale, val, y, z);
    }
    var rotationFlag = TransformBit.NONE;
    if (parent) {
      var worldMatrix = self._mat;
      var uiSkewComp = self._uiProps._uiSkewComp;
      if (uiSkewComp) {
        Mat4.fromSRT(m4_1, self._lrot, self._lpos, self._lscale);
        Mat4.multiply(worldMatrix, parent._mat, m4_1);
      }
      var xScale = Vec3.set(v3_b, worldMatrix.m00, worldMatrix.m01, worldMatrix.m02).length();
      var yScale = Vec3.set(v3_b, worldMatrix.m04, worldMatrix.m05, worldMatrix.m06).length();
      var zScale = Vec3.set(v3_b, worldMatrix.m08, worldMatrix.m09, worldMatrix.m10).length();
      if (xScale === 0) {
        v3_a.x = worldScale.x;
        worldMatrix.m00 = 1;
        rotationFlag = TransformBit.ROTATION;
      } else {
        v3_a.x = worldScale.x / xScale;
      }
      if (yScale === 0) {
        v3_a.y = worldScale.y;
        worldMatrix.m05 = 1;
        rotationFlag = TransformBit.ROTATION;
      } else {
        v3_a.y = worldScale.y / yScale;
      }
      if (zScale === 0) {
        v3_a.z = worldScale.z;
        worldMatrix.m10 = 1;
        rotationFlag = TransformBit.ROTATION;
      } else {
        v3_a.z = worldScale.z / zScale;
      }
      Mat4.scale(m4_1, worldMatrix, v3_a);
      Mat4.multiply(m4_2, Mat4.invert(m4_2, parent._mat), m4_1);
      Mat3.fromQuat(m3_1, Quat.conjugate(qt_1, self._lrot));
      Mat3.multiplyMat4(m3_1, m3_1, m4_2);
      var localScale = self._lscale;
      localScale.x = Vec3.set(v3_a, m3_1.m00, m3_1.m01, m3_1.m02).length();
      localScale.y = Vec3.set(v3_a, m3_1.m03, m3_1.m04, m3_1.m05).length();
      localScale.z = Vec3.set(v3_a, m3_1.m06, m3_1.m07, m3_1.m08).length();
      if (localScale.x === 0 || localScale.y === 0 || localScale.z === 0) {
        rotationFlag = TransformBit.ROTATION;
      }
    } else {
      Vec3.copy(self._lscale, worldScale);
    }
    self.invalidateChildren(TransformBit.SCALE | rotationFlag);
    if (self._eventMask & TRANSFORM_ON) {
      self.emit(TRANSFORM_CHANGED, TransformBit.SCALE | rotationFlag);
    }
  };
  _proto.getWorldScale = function getWorldScale(out) {
    this.updateWorldTransform();
    if (out) {
      return Vec3.copy(out, this._scale);
    }
    return Vec3.copy(new Vec3(), this._scale);
  };
  _proto.getWorldMatrix = function getWorldMatrix(out) {
    this.updateWorldTransform();
    var target = out || new Mat4();
    return Mat4.copy(target, this._mat);
  };
  _proto.getWorldRS = function getWorldRS(out) {
    this.updateWorldTransform();
    var target = out || new Mat4();
    Mat4.copy(target, this._mat);
    target.m12 = 0;
    target.m13 = 0;
    target.m14 = 0;
    return target;
  };
  _proto.getWorldRT = function getWorldRT(out) {
    this.updateWorldTransform();
    var target = out || new Mat4();
    return Mat4.fromRT(target, this._rot, this._pos);
  };
  _proto.setRTS = function setRTS(rot, pos, scale) {
    var dirtyBit = 0;
    if (rot) {
      dirtyBit |= TransformBit.ROTATION;
      if (rot.w !== undefined) {
        Quat.copy(this._lrot, rot);
        this._eulerDirty = true;
      } else {
        Vec3.copy(this._euler, rot);
        Quat.fromEuler(this._lrot, rot.x, rot.y, rot.z);
        this._eulerDirty = false;
      }
    }
    if (pos) {
      Vec3.copy(this._lpos, pos);
      dirtyBit |= TransformBit.POSITION;
    }
    if (scale) {
      Vec3.copy(this._lscale, scale);
      dirtyBit |= TransformBit.SCALE;
    }
    if (dirtyBit) {
      this.invalidateChildren(dirtyBit);
      if (this._eventMask & TRANSFORM_ON) {
        this.emit(TRANSFORM_CHANGED, dirtyBit);
      }
    }
  };
  _proto.isTransformDirty = function isTransformDirty() {
    return this._transformFlags !== TransformBit.NONE;
  };
  _proto.pauseSystemEvents = function pauseSystemEvents(recursive) {
    this._eventProcessor.setEnabled(false, recursive);
  };
  _proto.resumeSystemEvents = function resumeSystemEvents(recursive) {
    this._eventProcessor.setEnabled(true, recursive);
  };
  Node.resetHasChangedFlags = function resetHasChangedFlags() {
    globalFlagChangeVersion += 1;
  };
  Node.clearNodeArray = function clearNodeArray() {
    if (Node.ClearFrame < Node.ClearRound && !EDITOR) {
      Node.ClearFrame++;
    } else {
      Node.ClearFrame = 0;
      dirtyNodes.length = 0;
    }
  };
  _proto.getPathInHierarchy = function getPathInHierarchy() {
    var result = this.name;
    var curNode = this.parent;
    while (curNode && !(curNode instanceof cclegacy.Scene)) {
      result = curNode.name + "/" + result;
      curNode = curNode.parent;
    }
    return result;
  };
  _proto._getUITransformComp = function _getUITransformComp() {
    return this._uiProps.uiTransformComp;
  };
  return _createClass(Node, [{
    key: "components",
    get: function get() {
      return this._components;
    }
  }, {
    key: "_persistNode",
    get: function get() {
      return (this._objFlags & DontDestroy) > 0;
    },
    set: function set(value) {
      if (value) {
        this._objFlags |= DontDestroy;
      } else {
        this._objFlags &= ~DontDestroy;
      }
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(value) {
      if (value.indexOf('/') !== -1) {
        errorID(1632);
        return;
      }
      this._name = value;
    }
  }, {
    key: "uuid",
    get: function get() {
      return this._id;
    }
  }, {
    key: "children",
    get: function get() {
      return this._children;
    }
  }, {
    key: "active",
    get: function get() {
      return this._active;
    },
    set: function set(isActive) {
      isActive = !!isActive;
      if (this._active !== isActive) {
        this._active = isActive;
        var parent = this._parent;
        if (parent) {
          var couldActiveInScene = parent._activeInHierarchy;
          if (couldActiveInScene) {
            cclegacy.director._nodeActivator.activateNode(this, isActive);
          }
        }
      }
    }
  }, {
    key: "activeInHierarchy",
    get: function get() {
      return this._activeInHierarchy;
    }
  }, {
    key: "parent",
    get: function get() {
      return this._parent;
    },
    set: function set(value) {
      this.setParent(value);
    }
  }, {
    key: "scene",
    get: function get() {
      return this._scene;
    }
  }, {
    key: "eventProcessor",
    get: function get() {
      return this._eventProcessor;
    }
  }, {
    key: "prefab",
    get: function get() {
      return this._prefab;
    }
  }, {
    key: "id",
    set: function set(v) {
      this._id = v;
    }
  }, {
    key: "siblingIndex",
    get: function get() {
      return this._siblingIndex;
    },
    set: function set(val) {
      this._siblingIndex = val;
    }
  }, {
    key: "position",
    get: function get() {
      return this._lpos;
    },
    set: function set(val) {
      this.setPosition(val);
    }
  }, {
    key: "x",
    get: function get() {
      return this._lpos.x;
    },
    set: function set(val) {
      this.setPosition(val, this._lpos.y, this._lpos.z);
    }
  }, {
    key: "y",
    get: function get() {
      return this._lpos.y;
    },
    set: function set(val) {
      this.setPosition(this._lpos.x, val, this._lpos.z);
    }
  }, {
    key: "z",
    get: function get() {
      return this._lpos.z;
    },
    set: function set(val) {
      this.setPosition(this._lpos.x, this._lpos.y, val);
    }
  }, {
    key: "worldPosition",
    get: function get() {
      this.updateWorldTransform();
      return this._pos;
    },
    set: function set(val) {
      this.setWorldPosition(val);
    }
  }, {
    key: "worldPositionX",
    get: function get() {
      this.updateWorldTransform();
      return this._pos.x;
    },
    set: function set(val) {
      this.setWorldPosition(val, this._pos.y, this._pos.z);
    }
  }, {
    key: "worldPositionY",
    get: function get() {
      this.updateWorldTransform();
      return this._pos.y;
    },
    set: function set(val) {
      this.setWorldPosition(this._pos.x, val, this._pos.z);
    }
  }, {
    key: "worldPositionZ",
    get: function get() {
      this.updateWorldTransform();
      return this._pos.z;
    },
    set: function set(val) {
      this.setWorldPosition(this._pos.x, this._pos.y, val);
    }
  }, {
    key: "rotation",
    get: function get() {
      return this._lrot;
    },
    set: function set(val) {
      this.setRotation(val);
    }
  }, {
    key: "eulerAngles",
    get: function get() {
      if (this._eulerDirty) {
        Quat.toEuler(this._euler, this._lrot);
        this._eulerDirty = false;
      }
      return this._euler;
    },
    set: function set(val) {
      this.setRotationFromEuler(val.x, val.y, val.z);
    }
  }, {
    key: "angle",
    get: function get() {
      return this.eulerAngles.z;
    },
    set: function set(val) {
      Vec3.set(this._euler, 0, 0, val);
      Quat.fromAngleZ(this._lrot, val);
      this._eulerDirty = false;
      this.invalidateChildren(TransformBit.ROTATION);
      if (this._eventMask & TRANSFORM_ON) {
        this.emit(TRANSFORM_CHANGED, TransformBit.ROTATION);
      }
    }
  }, {
    key: "worldRotation",
    get: function get() {
      this.updateWorldTransform();
      return this._rot;
    },
    set: function set(val) {
      this.setWorldRotation(val);
    }
  }, {
    key: "scale",
    get: function get() {
      return this._lscale;
    },
    set: function set(val) {
      this.setScale(val);
    }
  }, {
    key: "worldScale",
    get: function get() {
      this.updateWorldTransform();
      return this._scale;
    },
    set: function set(val) {
      this.setWorldScale(val);
    }
  }, {
    key: "matrix",
    set: function set(val) {
      Mat4.toSRT(val, this._lrot, this._lpos, this._lscale);
      this.invalidateChildren(TransformBit.TRS);
      this._eulerDirty = true;
      if (this._eventMask & TRANSFORM_ON) {
        this.emit(TRANSFORM_CHANGED, TransformBit.TRS);
      }
    }
  }, {
    key: "worldMatrix",
    get: function get() {
      this.updateWorldTransform();
      return this._mat;
    }
  }, {
    key: "forward",
    get: function get() {
      return Vec3.transformQuat(new Vec3(), Vec3.FORWARD, this.worldRotation);
    },
    set: function set(dir) {
      var len = dir.length();
      Vec3.multiplyScalar(v3_a, dir, -1 / len);
      Quat.fromViewUp(q_a, v3_a);
      this.setWorldRotation(q_a);
    }
  }, {
    key: "up",
    get: function get() {
      return Vec3.transformQuat(new Vec3(), Vec3.UP, this.worldRotation);
    }
  }, {
    key: "right",
    get: function get() {
      return Vec3.transformQuat(new Vec3(), Vec3.RIGHT, this.worldRotation);
    }
  }, {
    key: "mobility",
    get: function get() {
      return this._mobility;
    },
    set: function set(m) {
      if (this._mobility === m) {
        return;
      }
      this._mobility = m;
      this.emit(NodeEventType.MOBILITY_CHANGED);
    }
  }, {
    key: "layer",
    get: function get() {
      return this._layer;
    },
    set: function set(l) {
      var self = this;
      if (self._layer === l) {
        return;
      }
      self._layer = l;
      var uiComp = self._uiProps && self._uiProps.uiComp;
      if (uiComp) {
        uiComp.setNodeDirty();
        uiComp._markForUpdateRenderData();
      }
      self.emit(NodeEventType.LAYER_CHANGED, self._layer);
    }
  }, {
    key: "flagChangedVersion",
    get: function get() {
      return this._flagChangeVersion;
    }
  }, {
    key: "hasChangedFlags",
    get: function get() {
      return this._flagChangeVersion === globalFlagChangeVersion ? this._hasChangedFlags : 0;
    },
    set: function set(val) {
      this._flagChangeVersion = globalFlagChangeVersion;
      this._hasChangedFlags = val;
    }
  }, {
    key: "isSkipTransformUpdate",
    get: function get() {
      return (this._objFlags & CCObjectFlags.IsSkipTransformUpdate) !== 0;
    },
    set: function set(skip) {
      if (skip) {
        this._objFlags |= CCObjectFlags.IsSkipTransformUpdate;
      } else {
        this._objFlags &= ~CCObjectFlags.IsSkipTransformUpdate;
      }
    }
  }]);
}(CCObject), _Node.idGenerator = idGenerator, _Node._stacks = [[]], _Node._stackId = 0, _Node.EventType = NodeEventType, _Node.NodeSpace = NodeSpace, _Node.TransformDirtyBit = TransformBit, _Node.TransformBit = TransformBit, _Node.reserveContentsForAllSyncablePrefabTag = reserveContentsForAllSyncablePrefabTag, _Node.ClearFrame = 0, _Node.ClearRound = 1000, _Node), _applyDecoratedDescriptor(_class2$3.prototype, "_persistNode", [property], Object.getOwnPropertyDescriptor(_class2$3.prototype, "_persistNode"), _class2$3.prototype), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "_parent", [serializable], function () {
  return null;
}), _initializer2$3 = applyDecoratedInitializer(_class2$3.prototype, "_children", [serializable], function () {
  return [];
}), _initializer3$2 = applyDecoratedInitializer(_class2$3.prototype, "_active", [serializable], function () {
  return true;
}), _initializer4$2 = applyDecoratedInitializer(_class2$3.prototype, "_components", [serializable], function () {
  return [];
}), _initializer5$2 = applyDecoratedInitializer(_class2$3.prototype, "_prefab", [serializable], function () {
  return null;
}), _initializer6$2 = applyDecoratedInitializer(_class2$3.prototype, "_lpos", [serializable], function () {
  return new Vec3();
}), _initializer7$2 = applyDecoratedInitializer(_class2$3.prototype, "_lrot", [serializable], function () {
  return new Quat();
}), _initializer8$2 = applyDecoratedInitializer(_class2$3.prototype, "_lscale", [serializable], function () {
  return new Vec3(1, 1, 1);
}), _initializer9$2 = applyDecoratedInitializer(_class2$3.prototype, "_mobility", [serializable], function () {
  return MobilityMode.Static;
}), _initializer0$2 = applyDecoratedInitializer(_class2$3.prototype, "_layer", [serializable], function () {
  return Layers.Enum.DEFAULT;
}), _initializer1$2 = applyDecoratedInitializer(_class2$3.prototype, "_euler", [serializable], function () {
  return new Vec3();
}), _applyDecoratedDescriptor(_class2$3.prototype, "eulerAngles", [_dec2$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "eulerAngles"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "mobility", [_dec3$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "mobility"), _class2$3.prototype), _class2$3)) || _class$3);
nodePolyfill(Node);
cclegacy.Node = Node;

var _dec$2, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _class$2, _class2$2, _initializer$2, _initializer2$2, _initializer3$1, _initializer4$1, _initializer5$1, _initializer6$1, _dec6$1, _dec7$1, _dec8$1, _dec9$1, _dec0$1, _dec1$1, _dec10$1, _dec11$1, _dec12$1, _dec13$1, _dec14$1, _dec15$1, _dec16$1, _dec17$1, _dec18$1, _class3$1, _class4$1, _initializer7$1, _initializer8$1, _initializer9$1, _initializer0$1, _initializer1$1, _initializer10$1, _initializer11$1, _initializer12$1, _initializer13$1, _initializer14$1, _initializer15$1, _dec19$1, _dec20$1, _dec21$1, _dec22$1, _dec23$1, _dec24$1, _dec25$1, _dec26$1, _class5$1, _class6$1, _initializer16$1, _initializer17$1, _initializer18$1, _initializer19$1, _initializer20$1, _initializer21$1, _initializer22$1, _initializer23$1, _initializer24$1, _initializer25, _FogInfo, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _class7$1, _class8$1, _initializer26, _initializer27, _initializer28, _initializer29, _initializer30, _initializer31, _initializer32, _initializer33, _dec33, _dec34, _class9$1, _class0$1, _initializer34, _initializer35, _initializer36, _initializer37, _dec35, _dec36, _dec37, _class1$1, _class10$1, _initializer38, _initializer39, _initializer40, _dec38, _dec39, _class11$1, _class12$1, _initializer41, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _class13$1, _class14$1, _initializer42, _initializer43, _initializer44, _initializer45, _initializer46, _initializer47, _initializer48, _initializer49, _initializer50, _dec46, _dec47, _class15, _class16, _initializer51, _initializer52, _initializer53, _initializer54, _initializer55, _initializer56, _initializer57, _initializer58, _initializer59, _initializer60;
var _up = new Vec3(0, 1, 0);
var _v3 = new Vec3();
var _v4 = new Vec4();
var _col = new Color();
var _qt = new Quat();
var normalizeHDRColor = function normalizeHDRColor(color) {
  var intensity = 1.0 / Math.max(Math.max(Math.max(color.x, color.y), color.z), 0.0001);
  if (intensity < 1.0) {
    color.x *= intensity;
    color.y *= intensity;
    color.z *= intensity;
  }
};
var AmbientInfo = (_dec$2 = ccclass('cc.AmbientInfo'), _dec2$1 = type(CCFloat), _dec3$1 = formerlySerializedAs('_skyColor'), _dec4$1 = formerlySerializedAs('_skyIllum'), _dec5$1 = formerlySerializedAs('_groundAlbedo'), _dec$2(_class$2 = (_class2$2 = function () {
  function AmbientInfo() {
    this._skyColorHDR = _initializer$2 && _initializer$2();
    this._skyIllumHDR = _initializer2$2 && _initializer2$2();
    this._groundAlbedoHDR = _initializer3$1 && _initializer3$1();
    this._skyColorLDR = _initializer4$1 && _initializer4$1();
    this._skyIllumLDR = _initializer5$1 && _initializer5$1();
    this._groundAlbedoLDR = _initializer6$1 && _initializer6$1();
    this._resource = null;
  }
  var _proto = AmbientInfo.prototype;
  _proto.activate = function activate(resource) {
    this._resource = resource;
    resource.initialize(this);
  };
  return _createClass(AmbientInfo, [{
    key: "skyColorHDR",
    get: function get() {
      return this._skyColorHDR;
    }
  }, {
    key: "groundAlbedoHDR",
    get: function get() {
      return this._groundAlbedoHDR;
    }
  }, {
    key: "skyIllumHDR",
    get: function get() {
      return this._skyIllumHDR;
    }
  }, {
    key: "skyColorLDR",
    get: function get() {
      return this._skyColorLDR;
    }
  }, {
    key: "groundAlbedoLDR",
    get: function get() {
      return this._groundAlbedoLDR;
    }
  }, {
    key: "skyIllumLDR",
    get: function get() {
      return this._skyIllumLDR;
    }
  }, {
    key: "skyLightingColor",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      _v4.set(isHDR ? this._skyColorHDR : this._skyColorLDR);
      normalizeHDRColor(_v4);
      return _col.set(_v4.x * 255, _v4.y * 255, _v4.z * 255, 255);
    },
    set: function set(val) {
      _v4.set(val.x, val.y, val.z, val.w);
      if (getPipelineSceneData().isHDR) {
        this._skyColorHDR.set(_v4);
      } else {
        this._skyColorLDR.set(_v4);
      }
      if (this._resource) {
        this._resource.skyColor.set(_v4);
      }
    }
  }, {
    key: "skyColor",
    set: function set(val) {
      if (getPipelineSceneData().isHDR) {
        this._skyColorHDR.set(val);
      } else {
        this._skyColorLDR.set(val);
      }
      if (this._resource) {
        this._resource.skyColor.set(val);
      }
    }
  }, {
    key: "skyIllum",
    get: function get() {
      if (getPipelineSceneData().isHDR) {
        return this._skyIllumHDR;
      } else {
        return this._skyIllumLDR;
      }
    },
    set: function set(val) {
      if (getPipelineSceneData().isHDR) {
        this._skyIllumHDR = val;
      } else {
        this._skyIllumLDR = val;
      }
      if (this._resource) {
        this._resource.skyIllum = val;
      }
    }
  }, {
    key: "groundLightingColor",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      _v4.set(isHDR ? this._groundAlbedoHDR : this._groundAlbedoLDR);
      normalizeHDRColor(_v4);
      return _col.set(_v4.x * 255, _v4.y * 255, _v4.z * 255, 255);
    },
    set: function set(val) {
      _v4.set(val.x, val.y, val.z, val.w);
      if (getPipelineSceneData().isHDR) {
        this._groundAlbedoHDR.set(_v4);
      } else {
        this._groundAlbedoLDR.set(_v4);
      }
      if (this._resource) {
        this._resource.groundAlbedo.set(_v4);
      }
    }
  }, {
    key: "groundAlbedo",
    set: function set(val) {
      if (getPipelineSceneData().isHDR) {
        this._groundAlbedoHDR.set(val);
      } else {
        this._groundAlbedoLDR.set(val);
      }
      if (this._resource) {
        this._resource.groundAlbedo.set(val);
      }
    }
  }]);
}(), _applyDecoratedDescriptor(_class2$2.prototype, "skyIllum", [_dec2$1], Object.getOwnPropertyDescriptor(_class2$2.prototype, "skyIllum"), _class2$2.prototype), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_skyColorHDR", [serializable, _dec3$1], function () {
  return new Vec4(0.2, 0.5, 0.8, 1.0);
}), _initializer2$2 = applyDecoratedInitializer(_class2$2.prototype, "_skyIllumHDR", [serializable, _dec4$1], function () {
  return Ambient.SKY_ILLUM;
}), _initializer3$1 = applyDecoratedInitializer(_class2$2.prototype, "_groundAlbedoHDR", [serializable, _dec5$1], function () {
  return new Vec4(0.2, 0.2, 0.2, 1.0);
}), _initializer4$1 = applyDecoratedInitializer(_class2$2.prototype, "_skyColorLDR", [serializable], function () {
  return new Vec4(0.2, 0.5, 0.8, 1.0);
}), _initializer5$1 = applyDecoratedInitializer(_class2$2.prototype, "_skyIllumLDR", [serializable], function () {
  return Ambient.SKY_ILLUM;
}), _initializer6$1 = applyDecoratedInitializer(_class2$2.prototype, "_groundAlbedoLDR", [serializable], function () {
  return new Vec4(0.2, 0.2, 0.2, 1.0);
}), _class2$2)) || _class$2);
legacyCC.AmbientInfo = AmbientInfo;
var SkyboxInfo = (_dec6$1 = ccclass('cc.SkyboxInfo'), _dec7$1 = type(EnvironmentLightingType), _dec8$1 = type(TextureCube), _dec9$1 = type(CCFloat), _dec0$1 = type(TextureCube), _dec1$1 = type(TextureCube), _dec10$1 = type(Material), _dec11$1 = type(TextureCube), _dec12$1 = formerlySerializedAs('_envmap'), _dec13$1 = type(TextureCube), _dec14$1 = type(TextureCube), _dec15$1 = type(TextureCube), _dec16$1 = type(Material), _dec17$1 = type(TextureCube), _dec18$1 = type(TextureCube), _dec6$1(_class3$1 = (_class4$1 = function () {
  function SkyboxInfo() {
    this._envLightingType = _initializer7$1 && _initializer7$1();
    this._envmapHDR = _initializer8$1 && _initializer8$1();
    this._envmapLDR = _initializer9$1 && _initializer9$1();
    this._diffuseMapHDR = _initializer0$1 && _initializer0$1();
    this._diffuseMapLDR = _initializer1$1 && _initializer1$1();
    this._enabled = _initializer10$1 && _initializer10$1();
    this._useHDR = _initializer11$1 && _initializer11$1();
    this._editableMaterial = _initializer12$1 && _initializer12$1();
    this._reflectionHDR = _initializer13$1 && _initializer13$1();
    this._reflectionLDR = _initializer14$1 && _initializer14$1();
    this._rotationAngle = _initializer15$1 && _initializer15$1();
    this._resource = null;
  }
  var _proto2 = SkyboxInfo.prototype;
  _proto2.activate = function activate(resource) {
    this.envLightingType = this._envLightingType;
    this._resource = resource;
    resource.initialize(this);
    resource.setEnvMaps(this._envmapHDR, this._envmapLDR);
    resource.setDiffuseMaps(this._diffuseMapHDR, this._diffuseMapLDR);
    resource.setSkyboxMaterial(this._editableMaterial);
    resource.setReflectionMaps(this._reflectionHDR, this._reflectionLDR);
    resource.setRotationAngle(this._rotationAngle);
    resource.activate();
  };
  _proto2.updateEnvMap = function updateEnvMap(val) {
    if (!val) {
      this.applyDiffuseMap = false;
      this.useIBL = false;
      this.envLightingType = EnvironmentLightingType.HEMISPHERE_DIFFUSE;
      warnID(15001);
    }
    var resource = this._resource;
    if (resource) {
      resource.setEnvMaps(this._envmapHDR, this._envmapLDR);
      resource.setDiffuseMaps(this._diffuseMapHDR, this._diffuseMapLDR);
      resource.setReflectionMaps(this._reflectionHDR, this._reflectionLDR);
      resource.useDiffuseMap = this.applyDiffuseMap;
      resource.envmap = val;
    }
  };
  _proto2.setMaterialProperty = function setMaterialProperty(name, val, passIdx) {
    var resource = this._resource;
    if (!resource) return;
    var editableMaterial = resource.editableMaterial;
    if (resource.enabled && editableMaterial) {
      editableMaterial.setProperty(name, val, passIdx);
      editableMaterial.passes.forEach(function (pass) {
        pass.update();
      });
    }
  };
  return _createClass(SkyboxInfo, [{
    key: "applyDiffuseMap",
    get: function get() {
      if (EnvironmentLightingType.DIFFUSEMAP_WITH_REFLECTION === this._envLightingType) {
        return true;
      }
      return false;
    },
    set: function set(val) {
      if (this._resource) {
        this._resource.useDiffuseMap = val;
      }
    }
  }, {
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      if (this._enabled === val) return;
      this._enabled = val;
      if (this._resource) {
        this._resource.enabled = this._enabled;
      }
    }
  }, {
    key: "envLightingType",
    get: function get() {
      return this._envLightingType;
    },
    set: function set(val) {
      if (!this.envmap && EnvironmentLightingType.HEMISPHERE_DIFFUSE !== val) {
        this.useIBL = false;
        this.applyDiffuseMap = false;
        this._envLightingType = EnvironmentLightingType.HEMISPHERE_DIFFUSE;
        warnID(15001);
      } else {
        if (EnvironmentLightingType.HEMISPHERE_DIFFUSE === val) {
          this.useIBL = false;
          this.applyDiffuseMap = false;
        } else if (EnvironmentLightingType.AUTOGEN_HEMISPHERE_DIFFUSE_WITH_REFLECTION === val) {
          this.useIBL = true;
          this.applyDiffuseMap = false;
        } else if (EnvironmentLightingType.DIFFUSEMAP_WITH_REFLECTION === val) {
          this.useIBL = true;
          this.applyDiffuseMap = true;
        }
        this._envLightingType = val;
      }
    }
  }, {
    key: "useIBL",
    get: function get() {
      if (EnvironmentLightingType.HEMISPHERE_DIFFUSE !== this._envLightingType) {
        return true;
      }
      return false;
    },
    set: function set(val) {
      if (this._resource) {
        this._resource.useIBL = val;
      }
    }
  }, {
    key: "useHDR",
    get: function get() {
      getPipelineSceneData().isHDR = this._useHDR;
      return this._useHDR;
    },
    set: function set(val) {
      getPipelineSceneData().isHDR = val;
      this._useHDR = val;
      var resource = this._resource;
      if (resource) {
        if (this.envLightingType === EnvironmentLightingType.DIFFUSEMAP_WITH_REFLECTION) {
          if (this.diffuseMap === null) {
            this.envLightingType = EnvironmentLightingType.AUTOGEN_HEMISPHERE_DIFFUSE_WITH_REFLECTION;
            warnID(15000);
          } else if (this.diffuseMap.isDefault) {
            warnID(15002);
          }
        }
      }
      if (resource) {
        resource.useHDR = this._useHDR;
        resource.updateMaterialRenderInfo();
      }
    }
  }, {
    key: "envmap",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._envmapHDR;
      } else {
        return this._envmapLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._envmapHDR = val;
        this._reflectionHDR = null;
      } else {
        this._envmapLDR = val;
        this._reflectionLDR = null;
      }
      if (!val) {
        if (isHDR) {
          this._diffuseMapHDR = null;
        } else {
          this._diffuseMapLDR = null;
        }
        this.applyDiffuseMap = false;
        this.useIBL = false;
        this.envLightingType = EnvironmentLightingType.HEMISPHERE_DIFFUSE;
        warnID(15001);
      }
      var resource = this._resource;
      if (resource) {
        resource.setEnvMaps(this._envmapHDR, this._envmapLDR);
        resource.setDiffuseMaps(this._diffuseMapHDR, this._diffuseMapLDR);
        resource.setReflectionMaps(this._reflectionHDR, this._reflectionLDR);
        resource.useDiffuseMap = this.applyDiffuseMap;
        resource.envmap = val;
      }
    }
  }, {
    key: "rotationAngle",
    get: function get() {
      return this._rotationAngle;
    },
    set: function set(val) {
      this._rotationAngle = val;
      if (this._resource) {
        this._resource.setRotationAngle(this._rotationAngle);
      }
    }
  }, {
    key: "diffuseMap",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._diffuseMapHDR;
      } else {
        return this._diffuseMapLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._diffuseMapHDR = val;
      } else {
        this._diffuseMapLDR = val;
      }
      if (this._resource) {
        this._resource.setDiffuseMaps(this._diffuseMapHDR, this._diffuseMapLDR);
      }
    }
  }, {
    key: "reflectionMap",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._reflectionHDR;
      } else {
        return this._reflectionLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._reflectionHDR = val;
      } else {
        this._reflectionLDR = val;
      }
      if (this._resource) {
        this._resource.setReflectionMaps(this._reflectionHDR, this._reflectionLDR);
      }
    }
  }, {
    key: "skyboxMaterial",
    get: function get() {
      return this._editableMaterial;
    },
    set: function set(val) {
      this._editableMaterial = val;
      if (this._resource) {
        this._resource.setSkyboxMaterial(this._editableMaterial);
      }
    }
  }]);
}(), _applyDecoratedDescriptor(_class4$1.prototype, "envLightingType", [_dec7$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "envLightingType"), _class4$1.prototype), _applyDecoratedDescriptor(_class4$1.prototype, "envmap", [_dec8$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "envmap"), _class4$1.prototype), _applyDecoratedDescriptor(_class4$1.prototype, "rotationAngle", [_dec9$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "rotationAngle"), _class4$1.prototype), _applyDecoratedDescriptor(_class4$1.prototype, "diffuseMap", [_dec0$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "diffuseMap"), _class4$1.prototype), _applyDecoratedDescriptor(_class4$1.prototype, "reflectionMap", [_dec1$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "reflectionMap"), _class4$1.prototype), _applyDecoratedDescriptor(_class4$1.prototype, "skyboxMaterial", [_dec10$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "skyboxMaterial"), _class4$1.prototype), _initializer7$1 = applyDecoratedInitializer(_class4$1.prototype, "_envLightingType", [serializable], function () {
  return EnvironmentLightingType.HEMISPHERE_DIFFUSE;
}), _initializer8$1 = applyDecoratedInitializer(_class4$1.prototype, "_envmapHDR", [serializable, _dec11$1, _dec12$1], function () {
  return null;
}), _initializer9$1 = applyDecoratedInitializer(_class4$1.prototype, "_envmapLDR", [serializable, _dec13$1], function () {
  return null;
}), _initializer0$1 = applyDecoratedInitializer(_class4$1.prototype, "_diffuseMapHDR", [serializable, _dec14$1], function () {
  return null;
}), _initializer1$1 = applyDecoratedInitializer(_class4$1.prototype, "_diffuseMapLDR", [serializable, _dec15$1], function () {
  return null;
}), _initializer10$1 = applyDecoratedInitializer(_class4$1.prototype, "_enabled", [serializable], function () {
  return false;
}), _initializer11$1 = applyDecoratedInitializer(_class4$1.prototype, "_useHDR", [serializable], function () {
  return true;
}), _initializer12$1 = applyDecoratedInitializer(_class4$1.prototype, "_editableMaterial", [serializable, _dec16$1], function () {
  return null;
}), _initializer13$1 = applyDecoratedInitializer(_class4$1.prototype, "_reflectionHDR", [serializable, _dec17$1], function () {
  return null;
}), _initializer14$1 = applyDecoratedInitializer(_class4$1.prototype, "_reflectionLDR", [serializable, _dec18$1], function () {
  return null;
}), _initializer15$1 = applyDecoratedInitializer(_class4$1.prototype, "_rotationAngle", [serializable], function () {
  return 0;
}), _class4$1)) || _class3$1);
legacyCC.SkyboxInfo = SkyboxInfo;
var FogInfo = (_dec19$1 = ccclass('cc.FogInfo'), _dec20$1 = type(FogType), _dec21$1 = type(CCFloat), _dec22$1 = type(CCFloat), _dec23$1 = type(CCFloat), _dec24$1 = type(CCFloat), _dec25$1 = type(CCFloat), _dec26$1 = type(CCFloat), _dec19$1(_class5$1 = (_class6$1 = (_FogInfo = function () {
  function FogInfo() {
    this._type = _initializer16$1 && _initializer16$1();
    this._fogColor = _initializer17$1 && _initializer17$1();
    this._enabled = _initializer18$1 && _initializer18$1();
    this._fogDensity = _initializer19$1 && _initializer19$1();
    this._fogStart = _initializer20$1 && _initializer20$1();
    this._fogEnd = _initializer21$1 && _initializer21$1();
    this._fogAtten = _initializer22$1 && _initializer22$1();
    this._fogTop = _initializer23$1 && _initializer23$1();
    this._fogRange = _initializer24$1 && _initializer24$1();
    this._accurate = _initializer25 && _initializer25();
    this._resource = null;
  }
  var _proto3 = FogInfo.prototype;
  _proto3.activate = function activate(resource) {
    this._resource = resource;
    resource.initialize(this);
    resource.activate();
  };
  return _createClass(FogInfo, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      if (this._enabled === val) return;
      this._enabled = val;
      var resource = this._resource;
      if (resource) {
        resource.enabled = val;
        if (val) {
          resource.type = this._type;
        }
      }
    }
  }, {
    key: "accurate",
    get: function get() {
      return this._accurate;
    },
    set: function set(val) {
      if (this._accurate === val) return;
      this._accurate = val;
      var resource = this._resource;
      if (resource) {
        resource.accurate = val;
        if (val) {
          resource.type = this._type;
        }
      }
    }
  }, {
    key: "fogColor",
    get: function get() {
      return this._fogColor;
    },
    set: function set(val) {
      this._fogColor.set(val);
      if (this._resource) {
        this._resource.fogColor = this._fogColor;
      }
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(val) {
      this._type = val;
      if (this._resource) {
        this._resource.type = val;
      }
    }
  }, {
    key: "fogDensity",
    get: function get() {
      return this._fogDensity;
    },
    set: function set(val) {
      this._fogDensity = val;
      if (this._resource) {
        this._resource.fogDensity = val;
      }
    }
  }, {
    key: "fogStart",
    get: function get() {
      return this._fogStart;
    },
    set: function set(val) {
      this._fogStart = val;
      if (this._resource) {
        this._resource.fogStart = val;
      }
    }
  }, {
    key: "fogEnd",
    get: function get() {
      return this._fogEnd;
    },
    set: function set(val) {
      this._fogEnd = val;
      if (this._resource) {
        this._resource.fogEnd = val;
      }
    }
  }, {
    key: "fogAtten",
    get: function get() {
      return this._fogAtten;
    },
    set: function set(val) {
      this._fogAtten = val;
      if (this._resource) {
        this._resource.fogAtten = val;
      }
    }
  }, {
    key: "fogTop",
    get: function get() {
      return this._fogTop;
    },
    set: function set(val) {
      this._fogTop = val;
      if (this._resource) {
        this._resource.fogTop = val;
      }
    }
  }, {
    key: "fogRange",
    get: function get() {
      return this._fogRange;
    },
    set: function set(val) {
      this._fogRange = val;
      if (this._resource) {
        this._resource.fogRange = val;
      }
    }
  }]);
}(), _FogInfo.FogType = FogType, _FogInfo), _applyDecoratedDescriptor(_class6$1.prototype, "type", [_dec20$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "type"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "fogDensity", [_dec21$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "fogDensity"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "fogStart", [_dec22$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "fogStart"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "fogEnd", [_dec23$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "fogEnd"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "fogAtten", [_dec24$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "fogAtten"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "fogTop", [_dec25$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "fogTop"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "fogRange", [_dec26$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "fogRange"), _class6$1.prototype), _initializer16$1 = applyDecoratedInitializer(_class6$1.prototype, "_type", [serializable], function () {
  return FogType.LINEAR;
}), _initializer17$1 = applyDecoratedInitializer(_class6$1.prototype, "_fogColor", [serializable], function () {
  return new Color('#C8C8C8');
}), _initializer18$1 = applyDecoratedInitializer(_class6$1.prototype, "_enabled", [serializable], function () {
  return false;
}), _initializer19$1 = applyDecoratedInitializer(_class6$1.prototype, "_fogDensity", [serializable], function () {
  return 0.3;
}), _initializer20$1 = applyDecoratedInitializer(_class6$1.prototype, "_fogStart", [serializable], function () {
  return 0.5;
}), _initializer21$1 = applyDecoratedInitializer(_class6$1.prototype, "_fogEnd", [serializable], function () {
  return 300;
}), _initializer22$1 = applyDecoratedInitializer(_class6$1.prototype, "_fogAtten", [serializable], function () {
  return 5;
}), _initializer23$1 = applyDecoratedInitializer(_class6$1.prototype, "_fogTop", [serializable], function () {
  return 1.5;
}), _initializer24$1 = applyDecoratedInitializer(_class6$1.prototype, "_fogRange", [serializable], function () {
  return 1.2;
}), _initializer25 = applyDecoratedInitializer(_class6$1.prototype, "_accurate", [serializable], function () {
  return false;
}), _class6$1)) || _class5$1);
var ShadowsInfo = (_dec27 = ccclass('cc.ShadowsInfo'), _dec28 = type(ShadowType), _dec29 = type(CCFloat), _dec30 = type(CCFloat), _dec31 = type(CCInteger), _dec32 = type(ShadowSize), _dec27(_class7$1 = (_class8$1 = function () {
  function ShadowsInfo() {
    this._enabled = _initializer26 && _initializer26();
    this._type = _initializer27 && _initializer27();
    this._normal = _initializer28 && _initializer28();
    this._distance = _initializer29 && _initializer29();
    this._planeBias = _initializer30 && _initializer30();
    this._shadowColor = _initializer31 && _initializer31();
    this._maxReceived = _initializer32 && _initializer32();
    this._size = _initializer33 && _initializer33();
    this._resource = null;
  }
  var _proto4 = ShadowsInfo.prototype;
  _proto4.setPlaneFromNode = function setPlaneFromNode(node) {
    node.getWorldRotation(_qt);
    this.planeDirection = Vec3.transformQuat(_v3, _up, _qt);
    node.getWorldPosition(_v3);
    this.planeHeight = Vec3.dot(this._normal, _v3);
  };
  _proto4.activate = function activate(resource) {
    this._resource = resource;
    resource.initialize(this);
    resource.activate();
  };
  return _createClass(ShadowsInfo, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      if (this._enabled === val) return;
      this._enabled = val;
      var resource = this._resource;
      if (resource) {
        resource.enabled = val;
        if (val) {
          resource.type = this._type;
        }
      }
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(val) {
      this._type = val;
      if (this._resource) {
        this._resource.type = val;
      }
    }
  }, {
    key: "shadowColor",
    get: function get() {
      return this._shadowColor;
    },
    set: function set(val) {
      this._shadowColor.set(val);
      if (this._resource) {
        this._resource.shadowColor = val;
      }
    }
  }, {
    key: "planeDirection",
    get: function get() {
      return this._normal;
    },
    set: function set(val) {
      Vec3.copy(this._normal, val);
      if (this._resource) {
        this._resource.normal = val;
      }
    }
  }, {
    key: "planeHeight",
    get: function get() {
      return this._distance;
    },
    set: function set(val) {
      this._distance = val;
      if (this._resource) {
        this._resource.distance = val;
      }
    }
  }, {
    key: "planeBias",
    get: function get() {
      return this._planeBias;
    },
    set: function set(val) {
      this._planeBias = val;
      if (this._resource) {
        this._resource.planeBias = val;
      }
    }
  }, {
    key: "maxReceived",
    get: function get() {
      return this._maxReceived;
    },
    set: function set(val) {
      this._maxReceived = val;
      if (this._resource) {
        this._resource.maxReceived = val;
      }
    }
  }, {
    key: "shadowMapSize",
    get: function get() {
      return this._size.x;
    },
    set: function set(value) {
      var resource = this._resource;
      this._size.set(value, value);
      if (resource) {
        resource.size.set(value, value);
        resource.shadowMapDirty = true;
      }
    }
  }]);
}(), _applyDecoratedDescriptor(_class8$1.prototype, "type", [_dec28], Object.getOwnPropertyDescriptor(_class8$1.prototype, "type"), _class8$1.prototype), _applyDecoratedDescriptor(_class8$1.prototype, "planeHeight", [_dec29], Object.getOwnPropertyDescriptor(_class8$1.prototype, "planeHeight"), _class8$1.prototype), _applyDecoratedDescriptor(_class8$1.prototype, "planeBias", [_dec30], Object.getOwnPropertyDescriptor(_class8$1.prototype, "planeBias"), _class8$1.prototype), _applyDecoratedDescriptor(_class8$1.prototype, "maxReceived", [_dec31], Object.getOwnPropertyDescriptor(_class8$1.prototype, "maxReceived"), _class8$1.prototype), _applyDecoratedDescriptor(_class8$1.prototype, "shadowMapSize", [_dec32], Object.getOwnPropertyDescriptor(_class8$1.prototype, "shadowMapSize"), _class8$1.prototype), _initializer26 = applyDecoratedInitializer(_class8$1.prototype, "_enabled", [serializable], function () {
  return false;
}), _initializer27 = applyDecoratedInitializer(_class8$1.prototype, "_type", [serializable], function () {
  return ShadowType.Planar;
}), _initializer28 = applyDecoratedInitializer(_class8$1.prototype, "_normal", [serializable], function () {
  return new Vec3(0, 1, 0);
}), _initializer29 = applyDecoratedInitializer(_class8$1.prototype, "_distance", [serializable], function () {
  return 0;
}), _initializer30 = applyDecoratedInitializer(_class8$1.prototype, "_planeBias", [serializable], function () {
  return 1.0;
}), _initializer31 = applyDecoratedInitializer(_class8$1.prototype, "_shadowColor", [serializable], function () {
  return new Color(0, 0, 0, 76);
}), _initializer32 = applyDecoratedInitializer(_class8$1.prototype, "_maxReceived", [serializable], function () {
  return 4;
}), _initializer33 = applyDecoratedInitializer(_class8$1.prototype, "_size", [serializable], function () {
  return new Vec2(1024, 1024);
}), _class8$1)) || _class7$1);
legacyCC.ShadowsInfo = ShadowsInfo;
var DEFAULT_WORLD_MIN_POS = new Vec3(-1024, -1024, -1024);
var DEFAULT_WORLD_MAX_POS = new Vec3(1024.0, 1024.0, 1024.0);
var DEFAULT_OCTREE_DEPTH = 8;
var OctreeInfo = (_dec33 = ccclass('cc.OctreeInfo'), _dec34 = type(CCInteger), _dec33(_class9$1 = (_class0$1 = function () {
  function OctreeInfo() {
    this._enabled = _initializer34 && _initializer34();
    this._minPos = _initializer35 && _initializer35();
    this._maxPos = _initializer36 && _initializer36();
    this._depth = _initializer37 && _initializer37();
    this._resource = null;
  }
  var _proto5 = OctreeInfo.prototype;
  _proto5.activate = function activate(resource) {
    this._resource = resource;
    resource.initialize(this);
  };
  return _createClass(OctreeInfo, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      if (this._enabled === val) return;
      this._enabled = val;
      if (this._resource) {
        this._resource.enabled = val;
      }
    }
  }, {
    key: "minPos",
    get: function get() {
      return this._minPos;
    },
    set: function set(val) {
      this._minPos = val;
      if (this._resource) {
        this._resource.minPos = val;
      }
    }
  }, {
    key: "maxPos",
    get: function get() {
      return this._maxPos;
    },
    set: function set(val) {
      this._maxPos = val;
      if (this._resource) {
        this._resource.maxPos = val;
      }
    }
  }, {
    key: "depth",
    get: function get() {
      return this._depth;
    },
    set: function set(val) {
      this._depth = val;
      if (this._resource) {
        this._resource.depth = val;
      }
    }
  }]);
}(), _applyDecoratedDescriptor(_class0$1.prototype, "depth", [_dec34], Object.getOwnPropertyDescriptor(_class0$1.prototype, "depth"), _class0$1.prototype), _initializer34 = applyDecoratedInitializer(_class0$1.prototype, "_enabled", [serializable], function () {
  return false;
}), _initializer35 = applyDecoratedInitializer(_class0$1.prototype, "_minPos", [serializable], function () {
  return new Vec3(DEFAULT_WORLD_MIN_POS);
}), _initializer36 = applyDecoratedInitializer(_class0$1.prototype, "_maxPos", [serializable], function () {
  return new Vec3(DEFAULT_WORLD_MAX_POS);
}), _initializer37 = applyDecoratedInitializer(_class0$1.prototype, "_depth", [serializable], function () {
  return DEFAULT_OCTREE_DEPTH;
}), _class0$1)) || _class9$1);
legacyCC.OctreeInfo = OctreeInfo;
var SkinInfo = (_dec35 = ccclass('cc.SkinInfo'), _dec36 = type(CCFloat), _dec37 = type(CCFloat), _dec35(_class1$1 = (_class10$1 = function () {
  function SkinInfo() {
    this._enabled = _initializer38 && _initializer38();
    this._blurRadius = _initializer39 && _initializer39();
    this._sssIntensity = _initializer40 && _initializer40();
    this._resource = null;
  }
  var _proto6 = SkinInfo.prototype;
  _proto6.activate = function activate(resource) {
    this._resource = resource;
    resource.initialize(this);
  };
  return _createClass(SkinInfo, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      if (this._enabled === val) return;
      this._enabled = val;
      if (this._resource) {
        this._resource.enabled = val;
      }
    }
  }, {
    key: "blurRadius",
    get: function get() {
      return this._blurRadius;
    },
    set: function set(val) {
      this._blurRadius = val;
      if (this._resource) {
        this._resource.blurRadius = val;
      }
    }
  }, {
    key: "sssIntensity",
    get: function get() {
      return this._sssIntensity;
    },
    set: function set(val) {
      this._sssIntensity = val;
      if (this._resource) {
        this._resource.sssIntensity = val;
      }
    }
  }]);
}(), _applyDecoratedDescriptor(_class10$1.prototype, "blurRadius", [_dec36], Object.getOwnPropertyDescriptor(_class10$1.prototype, "blurRadius"), _class10$1.prototype), _applyDecoratedDescriptor(_class10$1.prototype, "sssIntensity", [_dec37], Object.getOwnPropertyDescriptor(_class10$1.prototype, "sssIntensity"), _class10$1.prototype), _initializer38 = applyDecoratedInitializer(_class10$1.prototype, "_enabled", [serializable], function () {
  return true;
}), _initializer39 = applyDecoratedInitializer(_class10$1.prototype, "_blurRadius", [serializable], function () {
  return 0.01;
}), _initializer40 = applyDecoratedInitializer(_class10$1.prototype, "_sssIntensity", [serializable], function () {
  return 3.0;
}), _class10$1)) || _class1$1);
legacyCC.SkinInfo = SkinInfo;
var PostSettingsInfo = (_dec38 = ccclass('cc.PostSettingsInfo'), _dec39 = type(ToneMappingType), _dec38(_class11$1 = (_class12$1 = function () {
  function PostSettingsInfo() {
    this._toneMappingType = _initializer41 && _initializer41();
    this._resource = null;
  }
  var _proto7 = PostSettingsInfo.prototype;
  _proto7.activate = function activate(resource) {
    this._resource = resource;
    resource.initialize(this);
    resource.activate();
  };
  return _createClass(PostSettingsInfo, [{
    key: "toneMappingType",
    get: function get() {
      return this._toneMappingType;
    },
    set: function set(val) {
      this._toneMappingType = val;
      if (this._resource) {
        this._resource.toneMappingType = val;
      }
    }
  }]);
}(), _applyDecoratedDescriptor(_class12$1.prototype, "toneMappingType", [_dec39], Object.getOwnPropertyDescriptor(_class12$1.prototype, "toneMappingType"), _class12$1.prototype), _initializer41 = applyDecoratedInitializer(_class12$1.prototype, "_toneMappingType", [serializable], function () {
  return ToneMappingType.DEFAULT;
}), _class12$1)) || _class11$1);
legacyCC.PostSettingsInfo = PostSettingsInfo;
var LightProbeInfo = (_dec40 = ccclass('cc.LightProbeInfo'), _dec41 = type(CCFloat), _dec42 = type(CCInteger), _dec43 = type(CCInteger), _dec44 = type(CCFloat), _dec45 = type(CCFloat), _dec40(_class13$1 = (_class14$1 = function () {
  function LightProbeInfo() {
    this._giScale = _initializer42 && _initializer42();
    this._giSamples = _initializer43 && _initializer43();
    this._bounces = _initializer44 && _initializer44();
    this._reduceRinging = _initializer45 && _initializer45();
    this._showProbe = _initializer46 && _initializer46();
    this._showWireframe = _initializer47 && _initializer47();
    this._showConvex = _initializer48 && _initializer48();
    this._data = _initializer49 && _initializer49();
    this._lightProbeSphereVolume = _initializer50 && _initializer50();
    this._nodes = [];
    this._scene = null;
    this._resource = null;
  }
  var _proto8 = LightProbeInfo.prototype;
  _proto8.activate = function activate(scene, resource) {
    this._scene = scene;
    this._resource = resource;
    resource.initialize(this);
  };
  _proto8.onProbeBakeFinished = function onProbeBakeFinished() {
    this.onProbeBakingChanged(this._scene);
  };
  _proto8.onProbeBakeCleared = function onProbeBakeCleared() {
    this.clearSHCoefficients();
    this.onProbeBakingChanged(this._scene);
  };
  _proto8.onProbeBakingChanged = function onProbeBakingChanged(node) {
    var _this = this;
    if (!node) {
      return;
    }
    node.emit(NodeEventType.LIGHT_PROBE_BAKING_CHANGED);
    node.children.forEach(function (child) {
      _this.onProbeBakingChanged(child);
    });
  };
  _proto8.clearSHCoefficients = function clearSHCoefficients() {
    if (!this._data) {
      return;
    }
    this._data.probes.forEach(function (probe) {
      probe.coefficients.length = 0;
    });
    this.clearAllSHUBOs();
  };
  _proto8.isUniqueNode = function isUniqueNode() {
    return this._nodes.length === 1;
  };
  _proto8.addNode = function addNode(node) {
    if (!node) {
      return false;
    }
    for (var i = 0; i < this._nodes.length; i++) {
      if (this._nodes[i].node === node) {
        return false;
      }
    }
    this._nodes.push({
      node: node,
      probes: null
    });
    return true;
  };
  _proto8.removeNode = function removeNode(node) {
    if (!node) {
      return false;
    }
    var index = this._nodes.findIndex(function (element) {
      return element.node === node;
    });
    if (index === -1) {
      return false;
    }
    this._nodes.splice(index, 1);
    return true;
  };
  _proto8.syncData = function syncData(node, probes) {
    for (var i = 0; i < this._nodes.length; i++) {
      if (this._nodes[i].node === node) {
        this._nodes[i].probes = probes;
        return;
      }
    }
  };
  _proto8.update = function update(updateTet) {
    if (updateTet === void 0) {
      updateTet = true;
    }
    if (!cclegacy.internal.LightProbesData) {
      return;
    }
    if (!this._data) {
      this._data = new cclegacy.internal.LightProbesData();
      if (this._resource) {
        this._resource.data = this._data;
      }
    }
    var points = [];
    for (var i = 0; i < this._nodes.length; i++) {
      var probeNode = this._nodes[i];
      var node = probeNode.node;
      var probes = probeNode.probes;
      var worldPosition = node.worldPosition;
      if (!probes) {
        continue;
      }
      for (var j = 0; j < probes.length; j++) {
        var position = v3();
        Vec3.add(position, probes[j], worldPosition);
        points.push(position);
      }
    }
    var pointCount = points.length;
    if (pointCount < 4) {
      this.resetAllTetraIndices();
      this._data.reset();
      return;
    }
    this._data.updateProbes(points);
    if (updateTet) {
      this.resetAllTetraIndices();
      this._data.updateTetrahedrons();
    }
  };
  _proto8.clearAllSHUBOs = function clearAllSHUBOs() {
    if (!this._scene) {
      return;
    }
    var renderScene = this._scene.renderScene;
    if (!renderScene) {
      return;
    }
    var models = renderScene.models;
    models.forEach(function (model) {
      model.clearSHUBOs();
    });
  };
  _proto8.resetAllTetraIndices = function resetAllTetraIndices() {
    if (!this._scene) {
      return;
    }
    var renderScene = this._scene.renderScene;
    if (!renderScene) {
      return;
    }
    var models = renderScene.models;
    models.forEach(function (model) {
      model.tetrahedronIndex = -1;
    });
  };
  return _createClass(LightProbeInfo, [{
    key: "giScale",
    get: function get() {
      return this._giScale;
    },
    set: function set(val) {
      if (this._giScale === val) return;
      this._giScale = val;
      if (this._resource) {
        this._resource.giScale = val;
      }
    }
  }, {
    key: "giSamples",
    get: function get() {
      return this._giSamples;
    },
    set: function set(val) {
      if (this._giSamples === val) return;
      this._giSamples = val;
      if (this._resource) {
        this._resource.giSamples = val;
      }
    }
  }, {
    key: "bounces",
    get: function get() {
      return this._bounces;
    },
    set: function set(val) {
      if (this._bounces === val) return;
      this._bounces = val;
      if (this._resource) {
        this._resource.bounces = val;
      }
    }
  }, {
    key: "reduceRinging",
    get: function get() {
      return this._reduceRinging;
    },
    set: function set(val) {
      if (this._reduceRinging === val) return;
      this._reduceRinging = val;
      if (this._resource) {
        this._resource.reduceRinging = val;
      }
    }
  }, {
    key: "showProbe",
    get: function get() {
      return this._showProbe;
    },
    set: function set(val) {
      if (this._showProbe === val) return;
      this._showProbe = val;
      if (this._resource) {
        this._resource.showProbe = val;
      }
    }
  }, {
    key: "showWireframe",
    get: function get() {
      return this._showWireframe;
    },
    set: function set(val) {
      if (this._showWireframe === val) return;
      this._showWireframe = val;
      if (this._resource) {
        this._resource.showWireframe = val;
      }
    }
  }, {
    key: "showConvex",
    get: function get() {
      return this._showConvex;
    },
    set: function set(val) {
      if (this._showConvex === val) return;
      this._showConvex = val;
      if (this._resource) {
        this._resource.showConvex = val;
      }
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    },
    set: function set(val) {
      if (this._data === val) return;
      this._data = val;
      if (this._resource) {
        this._resource.data = val;
      }
    }
  }, {
    key: "lightProbeSphereVolume",
    get: function get() {
      return this._lightProbeSphereVolume;
    },
    set: function set(val) {
      if (this._lightProbeSphereVolume === val) return;
      this._lightProbeSphereVolume = val;
      if (this._resource) {
        this._resource.lightProbeSphereVolume = val;
      }
    }
  }]);
}(), _applyDecoratedDescriptor(_class14$1.prototype, "giScale", [_dec41], Object.getOwnPropertyDescriptor(_class14$1.prototype, "giScale"), _class14$1.prototype), _applyDecoratedDescriptor(_class14$1.prototype, "giSamples", [_dec42], Object.getOwnPropertyDescriptor(_class14$1.prototype, "giSamples"), _class14$1.prototype), _applyDecoratedDescriptor(_class14$1.prototype, "bounces", [_dec43], Object.getOwnPropertyDescriptor(_class14$1.prototype, "bounces"), _class14$1.prototype), _applyDecoratedDescriptor(_class14$1.prototype, "reduceRinging", [_dec44], Object.getOwnPropertyDescriptor(_class14$1.prototype, "reduceRinging"), _class14$1.prototype), _applyDecoratedDescriptor(_class14$1.prototype, "lightProbeSphereVolume", [_dec45], Object.getOwnPropertyDescriptor(_class14$1.prototype, "lightProbeSphereVolume"), _class14$1.prototype), _initializer42 = applyDecoratedInitializer(_class14$1.prototype, "_giScale", [serializable], function () {
  return 1.0;
}), _initializer43 = applyDecoratedInitializer(_class14$1.prototype, "_giSamples", [serializable], function () {
  return 1024;
}), _initializer44 = applyDecoratedInitializer(_class14$1.prototype, "_bounces", [serializable], function () {
  return 2;
}), _initializer45 = applyDecoratedInitializer(_class14$1.prototype, "_reduceRinging", [serializable], function () {
  return 0.0;
}), _initializer46 = applyDecoratedInitializer(_class14$1.prototype, "_showProbe", [serializable], function () {
  return true;
}), _initializer47 = applyDecoratedInitializer(_class14$1.prototype, "_showWireframe", [serializable], function () {
  return true;
}), _initializer48 = applyDecoratedInitializer(_class14$1.prototype, "_showConvex", [serializable], function () {
  return false;
}), _initializer49 = applyDecoratedInitializer(_class14$1.prototype, "_data", [serializable], function () {
  return null;
}), _initializer50 = applyDecoratedInitializer(_class14$1.prototype, "_lightProbeSphereVolume", [serializable], function () {
  return 1.0;
}), _class14$1)) || _class13$1);
var SceneGlobals = (_dec46 = ccclass('cc.SceneGlobals'), _dec47 = type(SkyboxInfo), _dec46(_class15 = (_class16 = function () {
  function SceneGlobals() {
    this.ambient = _initializer51 && _initializer51();
    this.shadows = _initializer52 && _initializer52();
    this._skybox = _initializer53 && _initializer53();
    this.fog = _initializer54 && _initializer54();
    this.octree = _initializer55 && _initializer55();
    this.skin = _initializer56 && _initializer56();
    this.lightProbeInfo = _initializer57 && _initializer57();
    this.postSettings = _initializer58 && _initializer58();
    this.bakedWithStationaryMainLight = _initializer59 && _initializer59();
    this.bakedWithHighpLightmap = _initializer60 && _initializer60();
    this.disableLightmap = false;
  }
  var _proto9 = SceneGlobals.prototype;
  _proto9.activate = function activate(scene) {
    var sceneData = legacyCC.director.root.pipeline.pipelineSceneData;
    this.skybox.activate(sceneData.skybox);
    this.ambient.activate(sceneData.ambient);
    this.shadows.activate(sceneData.shadows);
    this.fog.activate(sceneData.fog);
    this.octree.activate(sceneData.octree);
    this.skin.activate(sceneData.skin);
    this.postSettings.activate(sceneData.postSettings);
    if (this.lightProbeInfo && sceneData.lightProbes) {
      this.lightProbeInfo.activate(scene, sceneData.lightProbes);
    }
    var root = legacyCC.director.root;
    root.onGlobalPipelineStateChanged();
  };
  return _createClass(SceneGlobals, [{
    key: "skybox",
    get: function get() {
      return this._skybox;
    },
    set: function set(value) {
      this._skybox = value;
    }
  }]);
}(), _initializer51 = applyDecoratedInitializer(_class16.prototype, "ambient", [serializable], function () {
  return new AmbientInfo();
}), _initializer52 = applyDecoratedInitializer(_class16.prototype, "shadows", [serializable], function () {
  return new ShadowsInfo();
}), _initializer53 = applyDecoratedInitializer(_class16.prototype, "_skybox", [serializable], function () {
  return new SkyboxInfo();
}), _initializer54 = applyDecoratedInitializer(_class16.prototype, "fog", [serializable], function () {
  return new FogInfo();
}), _applyDecoratedDescriptor(_class16.prototype, "skybox", [_dec47], Object.getOwnPropertyDescriptor(_class16.prototype, "skybox"), _class16.prototype), _initializer55 = applyDecoratedInitializer(_class16.prototype, "octree", [serializable], function () {
  return new OctreeInfo();
}), _initializer56 = applyDecoratedInitializer(_class16.prototype, "skin", [serializable], function () {
  return new SkinInfo();
}), _initializer57 = applyDecoratedInitializer(_class16.prototype, "lightProbeInfo", [serializable], function () {
  return new LightProbeInfo();
}), _initializer58 = applyDecoratedInitializer(_class16.prototype, "postSettings", [serializable], function () {
  return new PostSettingsInfo();
}), _initializer59 = applyDecoratedInitializer(_class16.prototype, "bakedWithStationaryMainLight", [serializable], function () {
  return false;
}), _initializer60 = applyDecoratedInitializer(_class16.prototype, "bakedWithHighpLightmap", [serializable], function () {
  return false;
}), _class16)) || _class15);
legacyCC.SceneGlobals = SceneGlobals;

var _dec$1, _dec2, _class$1, _class2$1, _initializer$1, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class3, _class4, _initializer2$1, _initializer3, _initializer4, _initializer5, _initializer6, _dec9, _class5, _class6, _initializer7, _dec0, _dec1, _dec10, _class7, _class8, _initializer8, _initializer9, _initializer0, _dec11, _dec12, _dec13, _class9, _class0, _initializer1, _initializer10, _dec14, _dec15, _dec16, _class1, _class10, _initializer11, _initializer12, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _class11, _class12, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _dec23, _dec24, _dec25, _dec26, _class13, _class14, _initializer19, _initializer20, _initializer21, _initializer22, _initializer23, _initializer24;
var TargetInfo = (_dec$1 = ccclass('cc.TargetInfo'), _dec2 = type([CCString]), _dec$1(_class$1 = (_class2$1 = function TargetInfo() {
  this.localID = _initializer$1 && _initializer$1();
}, _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "localID", [serializable, _dec2], function () {
  return [];
}), _class2$1)) || _class$1);
var TargetOverrideInfo = (_dec3 = ccclass('cc.TargetOverrideInfo'), _dec4 = type(CCObject), _dec5 = type(TargetInfo), _dec6 = type([CCString]), _dec7 = type(Node), _dec8 = type(TargetInfo), _dec3(_class3 = (_class4 = function TargetOverrideInfo() {
  this.source = _initializer2$1 && _initializer2$1();
  this.sourceInfo = _initializer3 && _initializer3();
  this.propertyPath = _initializer4 && _initializer4();
  this.target = _initializer5 && _initializer5();
  this.targetInfo = _initializer6 && _initializer6();
}, _initializer2$1 = applyDecoratedInitializer(_class4.prototype, "source", [serializable, _dec4], function () {
  return null;
}), _initializer3 = applyDecoratedInitializer(_class4.prototype, "sourceInfo", [serializable, _dec5], function () {
  return null;
}), _initializer4 = applyDecoratedInitializer(_class4.prototype, "propertyPath", [serializable, _dec6], function () {
  return [];
}), _initializer5 = applyDecoratedInitializer(_class4.prototype, "target", [serializable, _dec7], function () {
  return null;
}), _initializer6 = applyDecoratedInitializer(_class4.prototype, "targetInfo", [serializable, _dec8], function () {
  return null;
}), _class4)) || _class3);
var CompPrefabInfo = (_dec9 = ccclass('cc.CompPrefabInfo'), _dec9(_class5 = (_class6 = function CompPrefabInfo() {
  this.fileId = _initializer7 && _initializer7();
}, _initializer7 = applyDecoratedInitializer(_class6.prototype, "fileId", [serializable], function () {
  return '';
}), _class6)) || _class5);
var PropertyOverrideInfo = (_dec0 = ccclass('CCPropertyOverrideInfo'), _dec1 = type(TargetInfo), _dec10 = type([CCString]), _dec0(_class7 = (_class8 = function () {
  function PropertyOverrideInfo() {
    this.targetInfo = _initializer8 && _initializer8();
    this.propertyPath = _initializer9 && _initializer9();
    this.value = _initializer0 && _initializer0();
  }
  var _proto = PropertyOverrideInfo.prototype;
  _proto.isTarget = function isTarget(localID, propPath) {
  };
  return PropertyOverrideInfo;
}(), _initializer8 = applyDecoratedInitializer(_class8.prototype, "targetInfo", [serializable, _dec1], function () {
  return null;
}), _initializer9 = applyDecoratedInitializer(_class8.prototype, "propertyPath", [serializable, _dec10], function () {
  return [];
}), _initializer0 = applyDecoratedInitializer(_class8.prototype, "value", [serializable], null), _class8)) || _class7);
var MountedChildrenInfo = (_dec11 = ccclass('cc.MountedChildrenInfo'), _dec12 = type(TargetInfo), _dec13 = type([Node]), _dec11(_class9 = (_class0 = function () {
  function MountedChildrenInfo() {
    this.targetInfo = _initializer1 && _initializer1();
    this.nodes = _initializer10 && _initializer10();
  }
  var _proto2 = MountedChildrenInfo.prototype;
  _proto2.isTarget = function isTarget(localID) {
  };
  return MountedChildrenInfo;
}(), _initializer1 = applyDecoratedInitializer(_class0.prototype, "targetInfo", [serializable, _dec12], function () {
  return null;
}), _initializer10 = applyDecoratedInitializer(_class0.prototype, "nodes", [serializable, _dec13], function () {
  return [];
}), _class0)) || _class9);
var MountedComponentsInfo = (_dec14 = ccclass('cc.MountedComponentsInfo'), _dec15 = type(TargetInfo), _dec16 = type([Component]), _dec14(_class1 = (_class10 = function () {
  function MountedComponentsInfo() {
    this.targetInfo = _initializer11 && _initializer11();
    this.components = _initializer12 && _initializer12();
  }
  var _proto3 = MountedComponentsInfo.prototype;
  _proto3.isTarget = function isTarget(localID) {
  };
  return MountedComponentsInfo;
}(), _initializer11 = applyDecoratedInitializer(_class10.prototype, "targetInfo", [serializable, _dec15], function () {
  return null;
}), _initializer12 = applyDecoratedInitializer(_class10.prototype, "components", [serializable, _dec16], function () {
  return [];
}), _class10)) || _class1);
var PrefabInstance = (_dec17 = ccclass('cc.PrefabInstance'), _dec18 = type(Node), _dec19 = type([MountedChildrenInfo]), _dec20 = type([MountedComponentsInfo]), _dec21 = type([PropertyOverrideInfo]), _dec22 = type([TargetInfo]), _dec17(_class11 = (_class12 = function () {
  function PrefabInstance() {
    this.fileId = _initializer13 && _initializer13();
    this.prefabRootNode = _initializer14 && _initializer14();
    this.mountedChildren = _initializer15 && _initializer15();
    this.mountedComponents = _initializer16 && _initializer16();
    this.propertyOverrides = _initializer17 && _initializer17();
    this.removedComponents = _initializer18 && _initializer18();
    this.targetMap = {};
    this.expanded = false;
  }
  var _proto4 = PrefabInstance.prototype;
  _proto4.findPropertyOverride = function findPropertyOverride(localID, propPath) {
  };
  _proto4.removePropertyOverride = function removePropertyOverride(localID, propPath) {
  };
  return PrefabInstance;
}(), _initializer13 = applyDecoratedInitializer(_class12.prototype, "fileId", [serializable], function () {
  return '';
}), _initializer14 = applyDecoratedInitializer(_class12.prototype, "prefabRootNode", [serializable, _dec18], null), _initializer15 = applyDecoratedInitializer(_class12.prototype, "mountedChildren", [serializable, _dec19], function () {
  return [];
}), _initializer16 = applyDecoratedInitializer(_class12.prototype, "mountedComponents", [serializable, _dec20], function () {
  return [];
}), _initializer17 = applyDecoratedInitializer(_class12.prototype, "propertyOverrides", [serializable, _dec21], function () {
  return [];
}), _initializer18 = applyDecoratedInitializer(_class12.prototype, "removedComponents", [serializable, _dec22], function () {
  return [];
}), _class12)) || _class11);
var PrefabInfo = (_dec23 = ccclass('cc.PrefabInfo'), _dec24 = type(Node), _dec25 = type(PrefabInstance), _dec26 = type([TargetOverrideInfo]), _dec23(_class13 = (_class14 = function PrefabInfo() {
  this.root = _initializer19 && _initializer19();
  this.asset = _initializer20 && _initializer20();
  this.fileId = _initializer21 && _initializer21();
  this.instance = _initializer22 && _initializer22();
  this.targetOverrides = _initializer23 && _initializer23();
  this.nestedPrefabInstanceRoots = _initializer24 && _initializer24();
}, _initializer19 = applyDecoratedInitializer(_class14.prototype, "root", [serializable, _dec24], null), _initializer20 = applyDecoratedInitializer(_class14.prototype, "asset", [serializable], null), _initializer21 = applyDecoratedInitializer(_class14.prototype, "fileId", [serializable], function () {
  return '';
}), _initializer22 = applyDecoratedInitializer(_class14.prototype, "instance", [serializable, _dec25], null), _initializer23 = applyDecoratedInitializer(_class14.prototype, "targetOverrides", [serializable, _dec26], null), _initializer24 = applyDecoratedInitializer(_class14.prototype, "nestedPrefabInstanceRoots", [serializable], null), _class14)) || _class13);
cclegacy._PrefabInfo = PrefabInfo;

function createNodeWithPrefab(node) {
  var prefabInfo = node == null ? void 0 : node.prefab;
  if (!prefabInfo) {
    return;
  }
  var prefabInstance = prefabInfo.instance;
  if (!prefabInstance) {
    return;
  }
  if (!prefabInfo.asset) {
    {
      errorID(3701, node.name);
    }
    prefabInfo.instance = undefined;
    return;
  }
  var _objFlags = node._objFlags;
  var _parent = node.getParent();
  var _id = node.uuid;
  node[editorExtrasTag];
  cclegacy.game._isCloning = true;
  {
    var prefabRoot = prefabInfo.asset.data;
    prefabRoot._iN$t = node;
    cclegacy.instantiate._clone(prefabRoot, prefabRoot);
  }
  cclegacy.game._isCloning = false;
  node._objFlags = _objFlags;
  node.modifyParent(_parent);
  node.id = _id;
  if (node.prefab) {
    node.prefab.instance = prefabInfo.instance;
  }
}
function generateTargetMap(node, targetMap, isRoot) {
  var _node$prefab;
  if (!targetMap) {
    return;
  }
  if (!node) {
    return;
  }
  var curTargetMap = targetMap;
  var prefabInstance = (_node$prefab = node.prefab) == null ? void 0 : _node$prefab.instance;
  if (!isRoot && prefabInstance) {
    targetMap[prefabInstance.fileId] = {};
    curTargetMap = targetMap[prefabInstance.fileId];
  }
  var prefabInfo = node.prefab;
  if (prefabInfo) {
    curTargetMap[prefabInfo.fileId] = node;
  }
  node.components.forEach(function (comp) {
    if (comp.__prefab) {
      curTargetMap[comp.__prefab.fileId] = comp;
    }
  });
  node.children.forEach(function (childNode) {
    generateTargetMap(childNode, curTargetMap, false);
  });
}
function getTarget(localID, targetMap) {
  if (!localID) {
    return null;
  }
  var target = null;
  var targetIter = targetMap;
  for (var i = 0; i < localID.length; i++) {
    if (!targetIter) {
      return null;
    }
    targetIter = targetIter[localID[i]];
  }
  target = targetIter;
  return target;
}
function applyMountedChildren(node, mountedChildren, targetMap) {
  if (!mountedChildren) {
    return;
  }
  for (var i = 0; i < mountedChildren.length; i++) {
    var childInfo = mountedChildren[i];
    if (childInfo && childInfo.targetInfo) {
      var target = getTarget(childInfo.targetInfo.localID, targetMap);
      if (!target) {
        continue;
      }
      var curTargetMap = targetMap;
      var localID = childInfo.targetInfo.localID;
      if (localID.length > 0) {
        for (var _i = 0; _i < localID.length - 1; _i++) {
          curTargetMap = curTargetMap[localID[_i]];
        }
      }
      if (childInfo.nodes) {
        for (var _i2 = 0; _i2 < childInfo.nodes.length; _i2++) {
          var childNode = childInfo.nodes[_i2];
          if (!childNode || target.children.includes(childNode)) {
            continue;
          }
          target.children.push(childNode);
          childNode.modifyParent(target);
          generateTargetMap(childNode, curTargetMap, false);
          childNode.siblingIndex = target.children.length - 1;
          expandPrefabInstanceNode(childNode, true);
        }
      }
    }
  }
}
function applyMountedComponents(node, mountedComponents, targetMap) {
  if (!mountedComponents) {
    return;
  }
  for (var i = 0; i < mountedComponents.length; i++) {
    var componentsInfo = mountedComponents[i];
    if (componentsInfo && componentsInfo.targetInfo) {
      var target = getTarget(componentsInfo.targetInfo.localID, targetMap);
      if (!target) {
        continue;
      }
      if (componentsInfo.components) {
        for (var _i3 = 0; _i3 < componentsInfo.components.length; _i3++) {
          var comp = componentsInfo.components[_i3];
          if (!comp) {
            continue;
          }
          comp.node = target;
          target.getWritableComponents().push(comp);
        }
      }
    }
  }
}
function applyRemovedComponents(node, removedComponents, targetMap) {
  if (!removedComponents) {
    return;
  }
  for (var i = 0; i < removedComponents.length; i++) {
    var targetInfo = removedComponents[i];
    if (targetInfo) {
      var target = getTarget(targetInfo.localID, targetMap);
      if (!target || !target.node) {
        continue;
      }
      var index = target.node.components.indexOf(target);
      if (index >= 0) {
        target.node.getWritableComponents().splice(index, 1);
      }
    }
  }
}
function applyPropertyOverrides(node, propertyOverrides, targetMap) {
  if (propertyOverrides.length <= 0) {
    return;
  }
  var target = null;
  for (var i = 0; i < propertyOverrides.length; i++) {
    var propOverride = propertyOverrides[i];
    if (propOverride && propOverride.targetInfo) {
      var targetInfo = propOverride.targetInfo;
      target = getTarget(targetInfo.localID, targetMap);
      if (!target) {
        continue;
      }
      var targetPropOwner = target;
      var propertyPath = propOverride.propertyPath.slice();
      if (propertyPath.length > 0) {
        var targetPropName = propertyPath.pop();
        if (!targetPropName) {
          continue;
        }
        for (var _i4 = 0; _i4 < propertyPath.length; _i4++) {
          var propName = propertyPath[_i4];
          targetPropOwner = targetPropOwner[propName];
          if (!targetPropOwner) {
            break;
          }
        }
        if (!targetPropOwner) {
          continue;
        }
        if (Array.isArray(targetPropOwner)) {
          if (targetPropName === 'length') {
            targetPropOwner[targetPropName] = propOverride.value;
          } else {
            var index = Number.parseInt(targetPropName);
            if (Number.isInteger(index) && index < targetPropOwner.length) {
              targetPropOwner[targetPropName] = propOverride.value;
            }
          }
        } else if (targetPropOwner[targetPropName] instanceof ValueType) {
          targetPropOwner[targetPropName].set(propOverride.value);
        } else {
          targetPropOwner[targetPropName] = propOverride.value;
        }
      }
    }
  }
}
function applyTargetOverrides(node) {
  var _node$prefab2;
  var targetOverrides = (_node$prefab2 = node.prefab) == null ? void 0 : _node$prefab2.targetOverrides;
  if (targetOverrides) {
    for (var i = 0; i < targetOverrides.length; i++) {
      var _targetAsNode$prefab;
      var targetOverride = targetOverrides[i];
      var source = targetOverride.source;
      var sourceInfo = targetOverride.sourceInfo;
      if (sourceInfo) {
        var _src$prefab;
        var src = targetOverride.source;
        var sourceInstance = src == null ? void 0 : (_src$prefab = src.prefab) == null ? void 0 : _src$prefab.instance;
        if (sourceInstance && sourceInstance.targetMap) {
          source = getTarget(sourceInfo.localID, sourceInstance.targetMap);
        }
      }
      if (!source) {
        continue;
      }
      var target = null;
      var targetInfo = targetOverride.targetInfo;
      if (!targetInfo) {
        continue;
      }
      var targetAsNode = targetOverride.target;
      var targetInstance = targetAsNode == null ? void 0 : (_targetAsNode$prefab = targetAsNode.prefab) == null ? void 0 : _targetAsNode$prefab.instance;
      if (!targetInstance || !targetInstance.targetMap) {
        continue;
      }
      target = getTarget(targetInfo.localID, targetInstance.targetMap);
      if (!target) {
        continue;
      }
      var propertyPath = targetOverride.propertyPath.slice();
      var targetPropOwner = source;
      if (propertyPath.length > 0) {
        var targetPropName = propertyPath.pop();
        if (!targetPropName) {
          return;
        }
        for (var _i5 = 0; _i5 < propertyPath.length; _i5++) {
          var propName = propertyPath[_i5];
          targetPropOwner = targetPropOwner[propName];
          if (!targetPropOwner) {
            break;
          }
        }
        if (!targetPropOwner) {
          continue;
        }
        targetPropOwner[targetPropName] = target;
      }
    }
  }
}
function expandPrefabInstanceNode(node, recursively) {
  var _node$prefab3;
  if (recursively === void 0) {
    recursively = false;
  }
  var prefabInstance = node == null ? void 0 : (_node$prefab3 = node.prefab) == null ? void 0 : _node$prefab3.instance;
  if (prefabInstance && !prefabInstance.expanded) {
    createNodeWithPrefab(node);
    if (recursively) {
      if (node && node.children) {
        node.children.forEach(function (child) {
          expandPrefabInstanceNode(child, true);
        });
      }
    }
    var targetMap = {};
    prefabInstance.targetMap = targetMap;
    generateTargetMap(node, targetMap, true);
    applyMountedChildren(node, prefabInstance.mountedChildren, targetMap);
    applyRemovedComponents(node, prefabInstance.removedComponents, targetMap);
    applyMountedComponents(node, prefabInstance.mountedComponents, targetMap);
    applyPropertyOverrides(node, prefabInstance.propertyOverrides, targetMap);
    prefabInstance.expanded = true;
  } else if (recursively) {
    if (node && node.children) {
      node.children.forEach(function (child) {
        expandPrefabInstanceNode(child, true);
      });
    }
  }
}
function expandNestedPrefabInstanceNode(node) {
  var prefabInfo = node.prefab;
  if (prefabInfo && prefabInfo.nestedPrefabInstanceRoots) {
    prefabInfo.nestedPrefabInstanceRoots.forEach(function (instanceNode) {
      expandPrefabInstanceNode(instanceNode);
      applyTargetOverrides(instanceNode);
    });
  }
}
function applyNodeAndComponentId(prefabInstanceNode, rootId) {
  var components = prefabInstanceNode.components,
    children = prefabInstanceNode.children;
  for (var i = 0; i < components.length; i++) {
    var _comp$__prefab$fileId, _comp$__prefab;
    var comp = components[i];
    var fileID = (_comp$__prefab$fileId = (_comp$__prefab = comp.__prefab) == null ? void 0 : _comp$__prefab.fileId) !== null && _comp$__prefab$fileId !== void 0 ? _comp$__prefab$fileId : '';
    comp._id = "" + rootId + fileID;
  }
  for (var _i6 = 0; _i6 < children.length; _i6++) {
    var child = children[_i6];
    var prefabInfo = child.prefab;
    var fileId = prefabInfo != null && prefabInfo.instance ? prefabInfo.instance.fileId : prefabInfo == null ? void 0 : prefabInfo.fileId;
    if (!fileId) continue;
    child.id = "" + rootId + fileId;
    if (!(prefabInfo != null && prefabInfo.instance)) {
      applyNodeAndComponentId(child, rootId);
    }
  }
}

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CompPrefabInfo: CompPrefabInfo,
    MountedChildrenInfo: MountedChildrenInfo,
    MountedComponentsInfo: MountedComponentsInfo,
    PrefabInfo: PrefabInfo,
    PrefabInstance: PrefabInstance,
    PropertyOverrideInfo: PropertyOverrideInfo,
    TargetInfo: TargetInfo,
    TargetOverrideInfo: TargetOverrideInfo,
    applyMountedChildren: applyMountedChildren,
    applyMountedComponents: applyMountedComponents,
    applyNodeAndComponentId: applyNodeAndComponentId,
    applyPropertyOverrides: applyPropertyOverrides,
    applyRemovedComponents: applyRemovedComponents,
    applyTargetOverrides: applyTargetOverrides,
    createNodeWithPrefab: createNodeWithPrefab,
    expandNestedPrefabInstanceNode: expandNestedPrefabInstanceNode,
    expandPrefabInstanceNode: expandPrefabInstanceNode,
    generateTargetMap: generateTargetMap,
    getTarget: getTarget
});

var _dec, _class, _class2, _initializer, _initializer2;
var Scene = (_dec = ccclass('cc.Scene'), _dec(_class = (_class2 = function (_Node) {
  function Scene(name) {
    var _this;
    _this = _Node.call(this, name) || this;
    _this.autoReleaseAssets = _initializer && _initializer();
    _this._globals = _initializer2 && _initializer2();
    _this.dependAssets = null;
    _this._renderScene = null;
    _this._prefabSyncedInLiveReload = false;
    _this._activeInHierarchy = false;
    if (legacyCC.director && legacyCC.director.root) {
      _this._renderScene = legacyCC.director.root.createScene({});
    }
    _this._inited = legacyCC.game ? !legacyCC.game._isCloning : true;
    return _this;
  }
  _inheritsLoose(Scene, _Node);
  var _proto = Scene.prototype;
  _proto._updateScene = function _updateScene() {
    this._scene = this;
  };
  _proto.destroy = function destroy() {
    var success = CCObject.prototype.destroy.call(this);
    if (success) {
      var children = this._children;
      for (var i = 0; i < children.length; ++i) {
        children[i].active = false;
      }
    }
    if (this._renderScene) legacyCC.director.root.destroyScene(this._renderScene);
    this._active = false;
    this._activeInHierarchy = false;
    return success;
  };
  _proto.addComponent = function addComponent() {
    throw new Error(getError(3822));
  };
  _proto._onHierarchyChanged = function _onHierarchyChanged() {};
  _proto._onPostActivated = function _onPostActivated(active) {};
  _proto._onBatchCreated = function _onBatchCreated(dontSyncChildPrefab) {
    var len = this._children.length;
    for (var i = 0; i < len; ++i) {
      this._children[i]._siblingIndex = i;
      this._children[i]._onBatchCreated(dontSyncChildPrefab);
    }
  };
  _proto.updateWorldTransform = function updateWorldTransform() {};
  _proto._instantiate = function _instantiate(cloned, isSyncedNode) {
    return null;
  };
  _proto._load = function _load() {
    if (!this._inited) {
      expandNestedPrefabInstanceNode(this);
      applyTargetOverrides(this);
      this._onBatchCreated(EDITOR);
      this._inited = true;
    }
    this.walk(Node._setScene);
  };
  _proto._activate = function _activate(active) {
    if (active === void 0) {
      active = true;
    }
    legacyCC.director._nodeActivator.activateNode(this, active);
    {
      this._globals.activate(this);
    }
  };
  return _createClass(Scene, [{
    key: "renderScene",
    get: function get() {
      return this._renderScene;
    }
  }, {
    key: "globals",
    get: function get() {
      return this._globals;
    }
  }]);
}(Node), _initializer = applyDecoratedInitializer(_class2.prototype, "autoReleaseAssets", [serializable], function () {
  return false;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_globals", [serializable], function () {
  return new SceneGlobals();
}), _class2)) || _class);
legacyCC.Scene = Scene;

export { type2writer as $, Ambient as A, BatchingSchemes as B, CSMLevel as C, ToneMappingType as D, EffectAsset as E, FOG_TYPE_NONE as F, PassInstance as G, customizeType as H, ImageAsset as I, genHandle as J, getBindingFromHandle as K, getCountFromHandle as L, MaterialInstance as M, Node as N, getDefaultFromType as O, PixelFormat as P, getDeviceShaderVersion as Q, getOffsetFromHandle as R, Shadows as S, TransformBit as T, getStringFromType as U, getTypeFromHandle as V, WrapMode as W, overrideMacros as X, programLib as Y, type2reader as Z, type2validator as _, TRANSFORM_ON as a, InstancedBuffer as a0, NodeSpace as a1, AmbientInfo as a2, SkyboxInfo as a3, FogInfo as a4, ShadowsInfo as a5, DEFAULT_WORLD_MIN_POS as a6, DEFAULT_WORLD_MAX_POS as a7, DEFAULT_OCTREE_DEPTH as a8, OctreeInfo as a9, getSize as aA, NodeUIProperties as aB, expandNestedPrefabInstanceNode as aC, applyTargetOverrides as aD, utils as aE, renderProfiler as aF, SRGBToLinear as aG, NodeEventProcessor as aH, DispatcherEventType as aI, SkinInfo as aa, PostSettingsInfo as ab, LightProbeInfo as ac, SceneGlobals as ad, MissingScript as ae, deserialize as af, Details as ag, BufferAsset as ah, JsonAsset as ai, TextureCube as aj, AssetManager as ak, resources as al, BuiltinResMgr as am, dependUtil as an, parser as ao, setDefaultProgressCallback as ap, parseLoadResArgs as aq, instancingCompareFn as ar, decideProfilerCamera as as, getVariantKey as at, prepareDefines as au, getActiveAttributes as av, getShaderInstanceName as aw, genHandles as ax, getCombinationDefines as ay, populateMacros as az, Material as b, MobilityMode as c, builtinResMgr as d, getPipelineSceneData as e, TextureBase as f, getPhaseID as g, Pass as h, Texture2D as i, TextureFilter as j, assetManager as k, Scene as l, downloader$1 as m, factory as n, SAXParser as o, TextAsset as p, CSMOptimizationMode as q, releaseManager as r, EnvironmentLightingType as s, Fog as t, FogType as u, PCFType as v, PostSettings as w, ShadowSize as x, ShadowType as y, Skybox as z };
//# sourceMappingURL=scene-vWcxM1_c.js.map
