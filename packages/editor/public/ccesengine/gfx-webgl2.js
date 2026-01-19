import { _ as _inheritsLoose, a as _createClass, k as errorID, $ as systemInfo, a4 as OS, w as warnID, N as assertID, ad as debugID, Q as error, l as _createForOfIteratorHelperLoose, W as logID, D as debug, e as warn, G as macro, B as BrowserType } from './gc-object-CShF5lzx.js';
import { at as DESCRIPTOR_BUFFER_TYPE, av as DESCRIPTOR_SAMPLER_TYPE, k as DescriptorSet, M as MemoryUsageBit, b as BufferUsageBit, x as FormatInfos, F as Format, aQ as LoadOp, ak as ColorMask, a4 as Filter, a3 as getTypedArrayConstructor, br as formatAlignment, aG as Extent, aU as Offset, bq as alignTo, aI as FormatSize, a0 as TextureFlagBit, as as CullMode, aD as DynamicStateFlagBit, X as UniformSamplerTexture, W as Type, O as ShaderStageFlagBit, E as TextureType, a1 as SampleCount, r as Buffer, b9 as StencilFace, g as CommandBuffer, aE as DynamicStates, l as Framebuffer, o as InputAssembler, au as DESCRIPTOR_DYNAMIC_TYPE, j as DescriptorSetLayout, i as PipelineLayout, h as PipelineState, be as TextureBlit, Q as Queue, n as RenderPass, p as Sampler, S as Shader, bo as Viewport, ad as Rect, R as RasterizerState, c as DepthStencilState, e as BlendState, aP as IsPowerOf2, aJ as FormatSurfaceSize, z as TextureInfo, H as TextureUsageBit, q as Texture, J as BufferTextureCopy, s as Swapchain, $ as API, t as Device, a$ as QueueInfo, b0 as QueueType, aq as CommandBufferInfo, aa as Feature, _ as FormatFeatureBit, ar as CommandBufferType, G as GeneralBarrier, T as TextureBarrier, f as BufferBarrier } from './buffer-barrier-BlQXg9Aa.js';
import { W as WebGLConstants } from './gl-constants-Dp0l46iW.js';
import { c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';
import { I as nextPow2, n as sys } from './index-uXI1_UMk.js';
import { U as USE_XR, E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';

var WebGL2DescriptorSet = function (_DescriptorSet) {
  function WebGL2DescriptorSet() {
    var _this;
    _this = _DescriptorSet.call(this) || this;
    _this._gpuDescriptorSet = null;
    return _this;
  }
  _inheritsLoose(WebGL2DescriptorSet, _DescriptorSet);
  var _proto = WebGL2DescriptorSet.prototype;
  _proto.initialize = function initialize(info) {
    this._layout = info.layout;
    var _getGpuDescriptorSetL = info.layout.getGpuDescriptorSetLayout(),
      bindings = _getGpuDescriptorSetL.bindings,
      descriptorIndices = _getGpuDescriptorSetL.descriptorIndices,
      descriptorCount = _getGpuDescriptorSetL.descriptorCount;
    this._buffers = Array(descriptorCount).fill(null);
    this._textures = Array(descriptorCount).fill(null);
    this._samplers = Array(descriptorCount).fill(null);
    var gpuDescriptors = [];
    this._gpuDescriptorSet = {
      gpuDescriptors: gpuDescriptors,
      descriptorIndices: descriptorIndices
    };
    for (var i = 0; i < bindings.length; ++i) {
      var binding = bindings[i];
      for (var j = 0; j < binding.count; j++) {
        var gpuDescriptor = {
          type: binding.descriptorType,
          gpuBuffer: null,
          gpuTextureView: null,
          gpuSampler: null
        };
        gpuDescriptors.push(gpuDescriptor);
      }
    }
  };
  _proto.destroy = function destroy() {
    this._layout = null;
    this._gpuDescriptorSet = null;
  };
  _proto.update = function update() {
    if (this._isDirty && this._gpuDescriptorSet) {
      var descriptors = this._gpuDescriptorSet.gpuDescriptors;
      for (var i = 0; i < descriptors.length; ++i) {
        if (descriptors[i].type & DESCRIPTOR_BUFFER_TYPE) {
          if (this._buffers[i]) {
            descriptors[i].gpuBuffer = this._buffers[i].getGpuBuffer();
          }
        } else if (descriptors[i].type & DESCRIPTOR_SAMPLER_TYPE) {
          if (this._textures[i]) {
            descriptors[i].gpuTextureView = this._textures[i].gpuTextureView;
          }
          if (this._samplers[i]) {
            descriptors[i].gpuSampler = this._samplers[i].gpuSampler;
          }
        }
      }
      this._isDirty = false;
    }
  };
  return _createClass(WebGL2DescriptorSet, [{
    key: "gpuDescriptorSet",
    get: function get() {
      return this._gpuDescriptorSet;
    }
  }]);
}(DescriptorSet);

var WebGL2EXT;
(function (WebGL2EXT) {
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGB_S3TC_DXT1_EXT"] = 33776] = "COMPRESSED_RGB_S3TC_DXT1_EXT";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_S3TC_DXT1_EXT"] = 33777] = "COMPRESSED_RGBA_S3TC_DXT1_EXT";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_S3TC_DXT3_EXT"] = 33778] = "COMPRESSED_RGBA_S3TC_DXT3_EXT";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_S3TC_DXT5_EXT"] = 33779] = "COMPRESSED_RGBA_S3TC_DXT5_EXT";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB_S3TC_DXT1_EXT"] = 35916] = "COMPRESSED_SRGB_S3TC_DXT1_EXT";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT"] = 35917] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT"] = 35918] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT"] = 35919] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGB_PVRTC_4BPPV1_IMG"] = 35840] = "COMPRESSED_RGB_PVRTC_4BPPV1_IMG";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGB_PVRTC_2BPPV1_IMG"] = 35841] = "COMPRESSED_RGB_PVRTC_2BPPV1_IMG";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_PVRTC_4BPPV1_IMG"] = 35842] = "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_PVRTC_2BPPV1_IMG"] = 35843] = "COMPRESSED_RGBA_PVRTC_2BPPV1_IMG";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGB_ETC1_WEBGL"] = 36196] = "COMPRESSED_RGB_ETC1_WEBGL";
  WebGL2EXT[WebGL2EXT["COMPRESSED_R11_EAC"] = 37488] = "COMPRESSED_R11_EAC";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SIGNED_R11_EAC"] = 37489] = "COMPRESSED_SIGNED_R11_EAC";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RG11_EAC"] = 37490] = "COMPRESSED_RG11_EAC";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SIGNED_RG11_EAC"] = 37491] = "COMPRESSED_SIGNED_RG11_EAC";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGB8_ETC2"] = 37492] = "COMPRESSED_RGB8_ETC2";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ETC2"] = 37493] = "COMPRESSED_SRGB8_ETC2";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37494] = "COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37495] = "COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA8_ETC2_EAC"] = 37496] = "COMPRESSED_RGBA8_ETC2_EAC";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ETC2_EAC"] = 37497] = "COMPRESSED_SRGB8_ALPHA8_ETC2_EAC";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_4x4_KHR"] = 37808] = "COMPRESSED_RGBA_ASTC_4x4_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_5x4_KHR"] = 37809] = "COMPRESSED_RGBA_ASTC_5x4_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_5x5_KHR"] = 37810] = "COMPRESSED_RGBA_ASTC_5x5_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_6x5_KHR"] = 37811] = "COMPRESSED_RGBA_ASTC_6x5_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_6x6_KHR"] = 37812] = "COMPRESSED_RGBA_ASTC_6x6_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_8x5_KHR"] = 37813] = "COMPRESSED_RGBA_ASTC_8x5_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_8x6_KHR"] = 37814] = "COMPRESSED_RGBA_ASTC_8x6_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_8x8_KHR"] = 37815] = "COMPRESSED_RGBA_ASTC_8x8_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_10x5_KHR"] = 37816] = "COMPRESSED_RGBA_ASTC_10x5_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_10x6_KHR"] = 37817] = "COMPRESSED_RGBA_ASTC_10x6_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_10x8_KHR"] = 37818] = "COMPRESSED_RGBA_ASTC_10x8_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_10x10_KHR"] = 37819] = "COMPRESSED_RGBA_ASTC_10x10_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_12x10_KHR"] = 37820] = "COMPRESSED_RGBA_ASTC_12x10_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_RGBA_ASTC_12x12_KHR"] = 37821] = "COMPRESSED_RGBA_ASTC_12x12_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR"] = 37840] = "COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR"] = 37841] = "COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR"] = 37842] = "COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR"] = 37843] = "COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR"] = 37844] = "COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR"] = 37845] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR"] = 37846] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR"] = 37847] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR"] = 37848] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR"] = 37849] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR"] = 37850] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR"] = 37851] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR"] = 37852] = "COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR";
  WebGL2EXT[WebGL2EXT["COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR"] = 37853] = "COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR";
})(WebGL2EXT || (WebGL2EXT = {}));
var WebGL2DeviceManager = function () {
  function WebGL2DeviceManager() {}
  WebGL2DeviceManager.setInstance = function setInstance(instance) {
    WebGL2DeviceManager._instance = instance;
  };
  return _createClass(WebGL2DeviceManager, null, [{
    key: "instance",
    get: function get() {
      return WebGL2DeviceManager._instance;
    }
  }]);
}();
WebGL2DeviceManager._instance = null;

var WebGLWraps = [WebGLConstants.REPEAT, WebGLConstants.MIRRORED_REPEAT, WebGLConstants.CLAMP_TO_EDGE, WebGLConstants.CLAMP_TO_EDGE];
var _f32v4 = new Float32Array(4);
var max = Math.max;
var min = Math.min;
function GFXFormatToWebGLType(format, gl) {
  switch (format) {
    case Format.R8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.R8SN:
      return WebGLConstants.BYTE;
    case Format.R8UI:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.R8I:
      return WebGLConstants.BYTE;
    case Format.R16F:
      return WebGLConstants.HALF_FLOAT;
    case Format.R16UI:
      return WebGLConstants.UNSIGNED_SHORT;
    case Format.R16I:
      return WebGLConstants.SHORT;
    case Format.R32F:
      return WebGLConstants.FLOAT;
    case Format.R32UI:
      return WebGLConstants.UNSIGNED_INT;
    case Format.R32I:
      return WebGLConstants.INT;
    case Format.RG8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.RG8SN:
      return WebGLConstants.BYTE;
    case Format.RG8UI:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.RG8I:
      return WebGLConstants.BYTE;
    case Format.RG16F:
      return WebGLConstants.HALF_FLOAT;
    case Format.RG16UI:
      return WebGLConstants.UNSIGNED_SHORT;
    case Format.RG16I:
      return WebGLConstants.SHORT;
    case Format.RG32F:
      return WebGLConstants.FLOAT;
    case Format.RG32UI:
      return WebGLConstants.UNSIGNED_INT;
    case Format.RG32I:
      return WebGLConstants.INT;
    case Format.RGB8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.SRGB8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.RGB8SN:
      return WebGLConstants.BYTE;
    case Format.RGB8UI:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.RGB8I:
      return WebGLConstants.BYTE;
    case Format.RGB16F:
      return WebGLConstants.HALF_FLOAT;
    case Format.RGB16UI:
      return WebGLConstants.UNSIGNED_SHORT;
    case Format.RGB16I:
      return WebGLConstants.SHORT;
    case Format.RGB32F:
      return WebGLConstants.FLOAT;
    case Format.RGB32UI:
      return WebGLConstants.UNSIGNED_INT;
    case Format.RGB32I:
      return WebGLConstants.INT;
    case Format.BGRA8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.RGBA8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.SRGB8_A8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.RGBA8SN:
      return WebGLConstants.BYTE;
    case Format.RGBA8UI:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.RGBA8I:
      return WebGLConstants.BYTE;
    case Format.RGBA16F:
      return WebGLConstants.HALF_FLOAT;
    case Format.RGBA16UI:
      return WebGLConstants.UNSIGNED_SHORT;
    case Format.RGBA16I:
      return WebGLConstants.SHORT;
    case Format.RGBA32F:
      return WebGLConstants.FLOAT;
    case Format.RGBA32UI:
      return WebGLConstants.UNSIGNED_INT;
    case Format.RGBA32I:
      return WebGLConstants.INT;
    case Format.R5G6B5:
      return WebGLConstants.UNSIGNED_SHORT_5_6_5;
    case Format.R11G11B10F:
      return WebGLConstants.UNSIGNED_INT_10F_11F_11F_REV;
    case Format.RGB5A1:
      return WebGLConstants.UNSIGNED_SHORT_5_5_5_1;
    case Format.RGBA4:
      return WebGLConstants.UNSIGNED_SHORT_4_4_4_4;
    case Format.RGB10A2:
      return WebGLConstants.UNSIGNED_INT_2_10_10_10_REV;
    case Format.RGB10A2UI:
      return WebGLConstants.UNSIGNED_INT_2_10_10_10_REV;
    case Format.RGB9E5:
      return WebGLConstants.FLOAT;
    case Format.DEPTH:
      return WebGLConstants.FLOAT;
    case Format.DEPTH_STENCIL:
      return WebGLConstants.UNSIGNED_INT_24_8;
    case Format.BC1:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC1_SRGB:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC2:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC2_SRGB:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC3:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC3_SRGB:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC4:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC4_SNORM:
      return WebGLConstants.BYTE;
    case Format.BC5:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC5_SNORM:
      return WebGLConstants.BYTE;
    case Format.BC6H_SF16:
      return WebGLConstants.FLOAT;
    case Format.BC6H_UF16:
      return WebGLConstants.FLOAT;
    case Format.BC7:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.BC7_SRGB:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.ETC_RGB8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.ETC2_RGB8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.ETC2_SRGB8:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.ETC2_RGB8_A1:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.ETC2_SRGB8_A1:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.EAC_R11:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.EAC_R11SN:
      return WebGLConstants.BYTE;
    case Format.EAC_RG11:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.EAC_RG11SN:
      return WebGLConstants.BYTE;
    case Format.PVRTC_RGB2:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.PVRTC_RGBA2:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.PVRTC_RGB4:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.PVRTC_RGBA4:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.PVRTC2_2BPP:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.PVRTC2_4BPP:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.ASTC_RGBA_4X4:
    case Format.ASTC_RGBA_5X4:
    case Format.ASTC_RGBA_5X5:
    case Format.ASTC_RGBA_6X5:
    case Format.ASTC_RGBA_6X6:
    case Format.ASTC_RGBA_8X5:
    case Format.ASTC_RGBA_8X6:
    case Format.ASTC_RGBA_8X8:
    case Format.ASTC_RGBA_10X5:
    case Format.ASTC_RGBA_10X6:
    case Format.ASTC_RGBA_10X8:
    case Format.ASTC_RGBA_10X10:
    case Format.ASTC_RGBA_12X10:
    case Format.ASTC_RGBA_12X12:
    case Format.ASTC_SRGBA_4X4:
    case Format.ASTC_SRGBA_5X4:
    case Format.ASTC_SRGBA_5X5:
    case Format.ASTC_SRGBA_6X5:
    case Format.ASTC_SRGBA_6X6:
    case Format.ASTC_SRGBA_8X5:
    case Format.ASTC_SRGBA_8X6:
    case Format.ASTC_SRGBA_8X8:
    case Format.ASTC_SRGBA_10X5:
    case Format.ASTC_SRGBA_10X6:
    case Format.ASTC_SRGBA_10X8:
    case Format.ASTC_SRGBA_10X10:
    case Format.ASTC_SRGBA_12X10:
    case Format.ASTC_SRGBA_12X12:
      return WebGLConstants.UNSIGNED_BYTE;
    default:
      {
        return WebGLConstants.UNSIGNED_BYTE;
      }
  }
}
function GFXFormatToWebGLInternalFormat(format, gl) {
  switch (format) {
    case Format.A8:
      return WebGLConstants.ALPHA;
    case Format.L8:
      return WebGLConstants.LUMINANCE;
    case Format.LA8:
      return WebGLConstants.LUMINANCE_ALPHA;
    case Format.R8:
      return WebGLConstants.R8;
    case Format.R8SN:
      return WebGLConstants.R8_SNORM;
    case Format.R8UI:
      return WebGLConstants.R8UI;
    case Format.R8I:
      return WebGLConstants.R8I;
    case Format.RG8:
      return WebGLConstants.RG8;
    case Format.RG8SN:
      return WebGLConstants.RG8_SNORM;
    case Format.RG8UI:
      return WebGLConstants.RG8UI;
    case Format.RG8I:
      return WebGLConstants.RG8I;
    case Format.RGB8:
      return WebGLConstants.RGB8;
    case Format.RGB8SN:
      return WebGLConstants.RGB8_SNORM;
    case Format.RGB8UI:
      return WebGLConstants.RGB8UI;
    case Format.RGB8I:
      return WebGLConstants.RGB8I;
    case Format.BGRA8:
      return WebGLConstants.RGBA8;
    case Format.RGBA8:
      return WebGLConstants.RGBA8;
    case Format.RGBA8SN:
      return WebGLConstants.RGBA8_SNORM;
    case Format.RGBA8UI:
      return WebGLConstants.RGBA8UI;
    case Format.RGBA8I:
      return WebGLConstants.RGBA8I;
    case Format.R16I:
      return WebGLConstants.R16I;
    case Format.R16UI:
      return WebGLConstants.R16UI;
    case Format.R16F:
      return WebGLConstants.R16F;
    case Format.RG16I:
      return WebGLConstants.RG16I;
    case Format.RG16UI:
      return WebGLConstants.RG16UI;
    case Format.RG16F:
      return WebGLConstants.RG16F;
    case Format.RGB16I:
      return WebGLConstants.RGB16I;
    case Format.RGB16UI:
      return WebGLConstants.RGB16UI;
    case Format.RGB16F:
      return WebGLConstants.RGB16F;
    case Format.RGBA16I:
      return WebGLConstants.RGBA16I;
    case Format.RGBA16UI:
      return WebGLConstants.RGBA16UI;
    case Format.RGBA16F:
      return WebGLConstants.RGBA16F;
    case Format.R32I:
      return WebGLConstants.R32I;
    case Format.R32UI:
      return WebGLConstants.R32UI;
    case Format.R32F:
      return WebGLConstants.R32F;
    case Format.RG32I:
      return WebGLConstants.RG32I;
    case Format.RG32UI:
      return WebGLConstants.RG32UI;
    case Format.RG32F:
      return WebGLConstants.RG32F;
    case Format.RGB32I:
      return WebGLConstants.RGB32I;
    case Format.RGB32UI:
      return WebGLConstants.RGB32UI;
    case Format.RGB32F:
      return WebGLConstants.RGB32F;
    case Format.RGBA32I:
      return WebGLConstants.RGBA32I;
    case Format.RGBA32UI:
      return WebGLConstants.RGBA32UI;
    case Format.RGBA32F:
      return WebGLConstants.RGBA32F;
    case Format.R5G6B5:
      return WebGLConstants.RGB565;
    case Format.RGB5A1:
      return WebGLConstants.RGB5_A1;
    case Format.RGBA4:
      return WebGLConstants.RGBA4;
    case Format.SRGB8:
      return WebGLConstants.SRGB8;
    case Format.SRGB8_A8:
      return WebGLConstants.SRGB8_ALPHA8;
    case Format.RGB10A2:
      return WebGLConstants.RGB10_A2;
    case Format.RGB10A2UI:
      return WebGLConstants.RGB10_A2UI;
    case Format.R11G11B10F:
      return WebGLConstants.R11F_G11F_B10F;
    case Format.DEPTH:
      return WebGLConstants.DEPTH_COMPONENT32F;
    case Format.DEPTH_STENCIL:
      return WebGLConstants.DEPTH24_STENCIL8;
    case Format.BC1:
      return WebGL2EXT.COMPRESSED_RGB_S3TC_DXT1_EXT;
    case Format.BC1_ALPHA:
      return WebGL2EXT.COMPRESSED_RGBA_S3TC_DXT1_EXT;
    case Format.BC1_SRGB:
      return WebGL2EXT.COMPRESSED_SRGB_S3TC_DXT1_EXT;
    case Format.BC1_SRGB_ALPHA:
      return WebGL2EXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
    case Format.BC2:
      return WebGL2EXT.COMPRESSED_RGBA_S3TC_DXT3_EXT;
    case Format.BC2_SRGB:
      return WebGL2EXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
    case Format.BC3:
      return WebGL2EXT.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    case Format.BC3_SRGB:
      return WebGL2EXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
    case Format.ETC_RGB8:
      return WebGL2EXT.COMPRESSED_RGB_ETC1_WEBGL;
    case Format.ETC2_RGB8:
      return WebGL2EXT.COMPRESSED_RGB8_ETC2;
    case Format.ETC2_SRGB8:
      return WebGL2EXT.COMPRESSED_SRGB8_ETC2;
    case Format.ETC2_RGB8_A1:
      return WebGL2EXT.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2;
    case Format.ETC2_SRGB8_A1:
      return WebGL2EXT.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2;
    case Format.ETC2_RGBA8:
      return WebGL2EXT.COMPRESSED_RGBA8_ETC2_EAC;
    case Format.ETC2_SRGB8_A8:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC;
    case Format.EAC_R11:
      return WebGL2EXT.COMPRESSED_R11_EAC;
    case Format.EAC_R11SN:
      return WebGL2EXT.COMPRESSED_SIGNED_R11_EAC;
    case Format.EAC_RG11:
      return WebGL2EXT.COMPRESSED_RG11_EAC;
    case Format.EAC_RG11SN:
      return WebGL2EXT.COMPRESSED_SIGNED_RG11_EAC;
    case Format.PVRTC_RGB2:
      return WebGL2EXT.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
    case Format.PVRTC_RGBA2:
      return WebGL2EXT.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
    case Format.PVRTC_RGB4:
      return WebGL2EXT.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
    case Format.PVRTC_RGBA4:
      return WebGL2EXT.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
    case Format.ASTC_RGBA_4X4:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_4x4_KHR;
    case Format.ASTC_RGBA_5X4:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_5x4_KHR;
    case Format.ASTC_RGBA_5X5:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_5x5_KHR;
    case Format.ASTC_RGBA_6X5:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_6x5_KHR;
    case Format.ASTC_RGBA_6X6:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_6x6_KHR;
    case Format.ASTC_RGBA_8X5:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_8x5_KHR;
    case Format.ASTC_RGBA_8X6:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_8x6_KHR;
    case Format.ASTC_RGBA_8X8:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_8x8_KHR;
    case Format.ASTC_RGBA_10X5:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_10x5_KHR;
    case Format.ASTC_RGBA_10X6:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_10x6_KHR;
    case Format.ASTC_RGBA_10X8:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_10x8_KHR;
    case Format.ASTC_RGBA_10X10:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_10x10_KHR;
    case Format.ASTC_RGBA_12X10:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_12x10_KHR;
    case Format.ASTC_RGBA_12X12:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_12x12_KHR;
    case Format.ASTC_SRGBA_4X4:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
    case Format.ASTC_SRGBA_5X4:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR;
    case Format.ASTC_SRGBA_5X5:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR;
    case Format.ASTC_SRGBA_6X5:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR;
    case Format.ASTC_SRGBA_6X6:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR;
    case Format.ASTC_SRGBA_8X5:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR;
    case Format.ASTC_SRGBA_8X6:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR;
    case Format.ASTC_SRGBA_8X8:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR;
    case Format.ASTC_SRGBA_10X5:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR;
    case Format.ASTC_SRGBA_10X6:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR;
    case Format.ASTC_SRGBA_10X8:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR;
    case Format.ASTC_SRGBA_10X10:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR;
    case Format.ASTC_SRGBA_12X10:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR;
    case Format.ASTC_SRGBA_12X12:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR;
    default:
      {
        errorID(16309);
        return WebGLConstants.RGBA;
      }
  }
}
function GFXFormatToWebGLFormat(format, gl) {
  switch (format) {
    case Format.A8:
      return WebGLConstants.ALPHA;
    case Format.L8:
      return WebGLConstants.LUMINANCE;
    case Format.LA8:
      return WebGLConstants.LUMINANCE_ALPHA;
    case Format.R8:
    case Format.R8SN:
      return WebGLConstants.RED;
    case Format.R8UI:
    case Format.R8I:
      return WebGLConstants.RED;
    case Format.RG8:
    case Format.RG8SN:
    case Format.RG8UI:
    case Format.RG8I:
      return WebGLConstants.RG;
    case Format.RGB8:
    case Format.RGB8SN:
    case Format.RGB8UI:
    case Format.RGB8I:
      return WebGLConstants.RGB;
    case Format.BGRA8:
    case Format.RGBA8:
    case Format.RGBA8SN:
    case Format.RGBA8UI:
    case Format.RGBA8I:
      return WebGLConstants.RGBA;
    case Format.R16UI:
    case Format.R16I:
    case Format.R16F:
      return WebGLConstants.RED;
    case Format.RG16UI:
    case Format.RG16I:
    case Format.RG16F:
      return WebGLConstants.RG;
    case Format.RGB16UI:
    case Format.RGB16I:
    case Format.RGB16F:
      return WebGLConstants.RGB;
    case Format.RGBA16UI:
    case Format.RGBA16I:
    case Format.RGBA16F:
      return WebGLConstants.RGBA;
    case Format.R32UI:
    case Format.R32I:
    case Format.R32F:
      return WebGLConstants.RED;
    case Format.RG32UI:
    case Format.RG32I:
    case Format.RG32F:
      return WebGLConstants.RG;
    case Format.RGB32UI:
    case Format.RGB32I:
    case Format.RGB32F:
      return WebGLConstants.RGB;
    case Format.RGBA32UI:
    case Format.RGBA32I:
    case Format.RGBA32F:
      return WebGLConstants.RGBA;
    case Format.RGB10A2:
      return WebGLConstants.RGBA;
    case Format.R11G11B10F:
      return WebGLConstants.RGB;
    case Format.R5G6B5:
      return WebGLConstants.RGB;
    case Format.RGB5A1:
      return WebGLConstants.RGBA;
    case Format.RGBA4:
      return WebGLConstants.RGBA;
    case Format.SRGB8:
      return WebGLConstants.RGB;
    case Format.SRGB8_A8:
      return WebGLConstants.RGBA;
    case Format.DEPTH:
      return WebGLConstants.DEPTH_COMPONENT;
    case Format.DEPTH_STENCIL:
      return WebGLConstants.DEPTH_STENCIL;
    case Format.BC1:
      return WebGL2EXT.COMPRESSED_RGB_S3TC_DXT1_EXT;
    case Format.BC1_ALPHA:
      return WebGL2EXT.COMPRESSED_RGBA_S3TC_DXT1_EXT;
    case Format.BC1_SRGB:
      return WebGL2EXT.COMPRESSED_SRGB_S3TC_DXT1_EXT;
    case Format.BC1_SRGB_ALPHA:
      return WebGL2EXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
    case Format.BC2:
      return WebGL2EXT.COMPRESSED_RGBA_S3TC_DXT3_EXT;
    case Format.BC2_SRGB:
      return WebGL2EXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
    case Format.BC3:
      return WebGL2EXT.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    case Format.BC3_SRGB:
      return WebGL2EXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
    case Format.ETC_RGB8:
      return WebGL2EXT.COMPRESSED_RGB_ETC1_WEBGL;
    case Format.ETC2_RGB8:
      return WebGL2EXT.COMPRESSED_RGB8_ETC2;
    case Format.ETC2_SRGB8:
      return WebGL2EXT.COMPRESSED_SRGB8_ETC2;
    case Format.ETC2_RGB8_A1:
      return WebGL2EXT.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2;
    case Format.ETC2_SRGB8_A1:
      return WebGL2EXT.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2;
    case Format.ETC2_RGBA8:
      return WebGL2EXT.COMPRESSED_RGBA8_ETC2_EAC;
    case Format.ETC2_SRGB8_A8:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC;
    case Format.EAC_R11:
      return WebGL2EXT.COMPRESSED_R11_EAC;
    case Format.EAC_R11SN:
      return WebGL2EXT.COMPRESSED_SIGNED_R11_EAC;
    case Format.EAC_RG11:
      return WebGL2EXT.COMPRESSED_RG11_EAC;
    case Format.EAC_RG11SN:
      return WebGL2EXT.COMPRESSED_SIGNED_RG11_EAC;
    case Format.PVRTC_RGB2:
      return WebGL2EXT.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
    case Format.PVRTC_RGBA2:
      return WebGL2EXT.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
    case Format.PVRTC_RGB4:
      return WebGL2EXT.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
    case Format.PVRTC_RGBA4:
      return WebGL2EXT.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
    case Format.ASTC_RGBA_4X4:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_4x4_KHR;
    case Format.ASTC_RGBA_5X4:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_5x4_KHR;
    case Format.ASTC_RGBA_5X5:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_5x5_KHR;
    case Format.ASTC_RGBA_6X5:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_6x5_KHR;
    case Format.ASTC_RGBA_6X6:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_6x6_KHR;
    case Format.ASTC_RGBA_8X5:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_8x5_KHR;
    case Format.ASTC_RGBA_8X6:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_8x6_KHR;
    case Format.ASTC_RGBA_8X8:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_8x8_KHR;
    case Format.ASTC_RGBA_10X5:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_10x5_KHR;
    case Format.ASTC_RGBA_10X6:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_10x6_KHR;
    case Format.ASTC_RGBA_10X8:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_10x8_KHR;
    case Format.ASTC_RGBA_10X10:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_10x10_KHR;
    case Format.ASTC_RGBA_12X10:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_12x10_KHR;
    case Format.ASTC_RGBA_12X12:
      return WebGL2EXT.COMPRESSED_RGBA_ASTC_12x12_KHR;
    case Format.ASTC_SRGBA_4X4:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
    case Format.ASTC_SRGBA_5X4:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR;
    case Format.ASTC_SRGBA_5X5:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR;
    case Format.ASTC_SRGBA_6X5:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR;
    case Format.ASTC_SRGBA_6X6:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR;
    case Format.ASTC_SRGBA_8X5:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR;
    case Format.ASTC_SRGBA_8X6:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR;
    case Format.ASTC_SRGBA_8X8:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR;
    case Format.ASTC_SRGBA_10X5:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR;
    case Format.ASTC_SRGBA_10X6:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR;
    case Format.ASTC_SRGBA_10X8:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR;
    case Format.ASTC_SRGBA_10X10:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR;
    case Format.ASTC_SRGBA_12X10:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR;
    case Format.ASTC_SRGBA_12X12:
      return WebGL2EXT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR;
    default:
      {
        errorID(16310);
        return WebGLConstants.RGBA;
      }
  }
}
function GFXTypeToWebGLType(type, gl) {
  switch (type) {
    case Type.BOOL:
      return WebGLConstants.BOOL;
    case Type.BOOL2:
      return WebGLConstants.BOOL_VEC2;
    case Type.BOOL3:
      return WebGLConstants.BOOL_VEC3;
    case Type.BOOL4:
      return WebGLConstants.BOOL_VEC4;
    case Type.INT:
      return WebGLConstants.INT;
    case Type.INT2:
      return WebGLConstants.INT_VEC2;
    case Type.INT3:
      return WebGLConstants.INT_VEC3;
    case Type.INT4:
      return WebGLConstants.INT_VEC4;
    case Type.UINT:
      return WebGLConstants.UNSIGNED_INT;
    case Type.FLOAT:
      return WebGLConstants.FLOAT;
    case Type.FLOAT2:
      return WebGLConstants.FLOAT_VEC2;
    case Type.FLOAT3:
      return WebGLConstants.FLOAT_VEC3;
    case Type.FLOAT4:
      return WebGLConstants.FLOAT_VEC4;
    case Type.MAT2:
      return WebGLConstants.FLOAT_MAT2;
    case Type.MAT2X3:
      return WebGLConstants.FLOAT_MAT2x3;
    case Type.MAT2X4:
      return WebGLConstants.FLOAT_MAT2x4;
    case Type.MAT3X2:
      return WebGLConstants.FLOAT_MAT3x2;
    case Type.MAT3:
      return WebGLConstants.FLOAT_MAT3;
    case Type.MAT3X4:
      return WebGLConstants.FLOAT_MAT3x4;
    case Type.MAT4X2:
      return WebGLConstants.FLOAT_MAT4x2;
    case Type.MAT4X3:
      return WebGLConstants.FLOAT_MAT4x3;
    case Type.MAT4:
      return WebGLConstants.FLOAT_MAT4;
    case Type.SAMPLER2D:
      return WebGLConstants.SAMPLER_2D;
    case Type.SAMPLER2D_ARRAY:
      return WebGLConstants.SAMPLER_2D_ARRAY;
    case Type.SAMPLER3D:
      return WebGLConstants.SAMPLER_3D;
    case Type.SAMPLER_CUBE:
      return WebGLConstants.SAMPLER_CUBE;
    default:
      {
        errorID(16311);
        return Type.UNKNOWN;
      }
  }
}
function WebGLTypeToGFXType(glType, gl) {
  switch (glType) {
    case WebGLConstants.BOOL:
      return Type.BOOL;
    case WebGLConstants.BOOL_VEC2:
      return Type.BOOL2;
    case WebGLConstants.BOOL_VEC3:
      return Type.BOOL3;
    case WebGLConstants.BOOL_VEC4:
      return Type.BOOL4;
    case WebGLConstants.INT:
      return Type.INT;
    case WebGLConstants.INT_VEC2:
      return Type.INT2;
    case WebGLConstants.INT_VEC3:
      return Type.INT3;
    case WebGLConstants.INT_VEC4:
      return Type.INT4;
    case WebGLConstants.UNSIGNED_INT:
      return Type.UINT;
    case WebGLConstants.UNSIGNED_INT_VEC2:
      return Type.UINT2;
    case WebGLConstants.UNSIGNED_INT_VEC3:
      return Type.UINT3;
    case WebGLConstants.UNSIGNED_INT_VEC4:
      return Type.UINT4;
    case WebGLConstants.FLOAT:
      return Type.FLOAT;
    case WebGLConstants.FLOAT_VEC2:
      return Type.FLOAT2;
    case WebGLConstants.FLOAT_VEC3:
      return Type.FLOAT3;
    case WebGLConstants.FLOAT_VEC4:
      return Type.FLOAT4;
    case WebGLConstants.FLOAT_MAT2:
      return Type.MAT2;
    case WebGLConstants.FLOAT_MAT2x3:
      return Type.MAT2X3;
    case WebGLConstants.FLOAT_MAT2x4:
      return Type.MAT2X4;
    case WebGLConstants.FLOAT_MAT3x2:
      return Type.MAT3X2;
    case WebGLConstants.FLOAT_MAT3:
      return Type.MAT3;
    case WebGLConstants.FLOAT_MAT3x4:
      return Type.MAT3X4;
    case WebGLConstants.FLOAT_MAT4x2:
      return Type.MAT4X2;
    case WebGLConstants.FLOAT_MAT4x3:
      return Type.MAT4X3;
    case WebGLConstants.FLOAT_MAT4:
      return Type.MAT4;
    case WebGLConstants.SAMPLER_2D:
      return Type.SAMPLER2D;
    case WebGLConstants.SAMPLER_2D_ARRAY:
      return Type.SAMPLER2D_ARRAY;
    case WebGLConstants.SAMPLER_3D:
      return Type.SAMPLER3D;
    case WebGLConstants.SAMPLER_CUBE:
      return Type.SAMPLER_CUBE;
    default:
      {
        errorID(16313);
        return Type.UNKNOWN;
      }
  }
}
function WebGLGetTypeSize(glType, gl) {
  switch (glType) {
    case WebGLConstants.BOOL:
      return 4;
    case WebGLConstants.BOOL_VEC2:
      return 8;
    case WebGLConstants.BOOL_VEC3:
      return 12;
    case WebGLConstants.BOOL_VEC4:
      return 16;
    case WebGLConstants.INT:
      return 4;
    case WebGLConstants.INT_VEC2:
      return 8;
    case WebGLConstants.INT_VEC3:
      return 12;
    case WebGLConstants.INT_VEC4:
      return 16;
    case WebGLConstants.UNSIGNED_INT:
      return 4;
    case WebGLConstants.UNSIGNED_INT_VEC2:
      return 8;
    case WebGLConstants.UNSIGNED_INT_VEC3:
      return 12;
    case WebGLConstants.UNSIGNED_INT_VEC4:
      return 16;
    case WebGLConstants.FLOAT:
      return 4;
    case WebGLConstants.FLOAT_VEC2:
      return 8;
    case WebGLConstants.FLOAT_VEC3:
      return 12;
    case WebGLConstants.FLOAT_VEC4:
      return 16;
    case WebGLConstants.FLOAT_MAT2:
      return 16;
    case WebGLConstants.FLOAT_MAT2x3:
      return 24;
    case WebGLConstants.FLOAT_MAT2x4:
      return 32;
    case WebGLConstants.FLOAT_MAT3x2:
      return 24;
    case WebGLConstants.FLOAT_MAT3:
      return 36;
    case WebGLConstants.FLOAT_MAT3x4:
      return 48;
    case WebGLConstants.FLOAT_MAT4x2:
      return 32;
    case WebGLConstants.FLOAT_MAT4x3:
      return 48;
    case WebGLConstants.FLOAT_MAT4:
      return 64;
    case WebGLConstants.SAMPLER_2D:
      return 4;
    case WebGLConstants.SAMPLER_2D_ARRAY:
      return 4;
    case WebGLConstants.SAMPLER_2D_ARRAY_SHADOW:
      return 4;
    case WebGLConstants.SAMPLER_3D:
      return 4;
    case WebGLConstants.SAMPLER_CUBE:
      return 4;
    case WebGLConstants.INT_SAMPLER_2D:
      return 4;
    case WebGLConstants.INT_SAMPLER_2D_ARRAY:
      return 4;
    case WebGLConstants.INT_SAMPLER_3D:
      return 4;
    case WebGLConstants.INT_SAMPLER_CUBE:
      return 4;
    case WebGLConstants.UNSIGNED_INT_SAMPLER_2D:
      return 4;
    case WebGLConstants.UNSIGNED_INT_SAMPLER_2D_ARRAY:
      return 4;
    case WebGLConstants.UNSIGNED_INT_SAMPLER_3D:
      return 4;
    case WebGLConstants.UNSIGNED_INT_SAMPLER_CUBE:
      return 4;
    default:
      {
        errorID(16314);
        return 0;
      }
  }
}
function WebGLGetComponentCount(glType, gl) {
  switch (glType) {
    case WebGLConstants.FLOAT_MAT2:
      return 2;
    case WebGLConstants.FLOAT_MAT2x3:
      return 2;
    case WebGLConstants.FLOAT_MAT2x4:
      return 2;
    case WebGLConstants.FLOAT_MAT3x2:
      return 3;
    case WebGLConstants.FLOAT_MAT3:
      return 3;
    case WebGLConstants.FLOAT_MAT3x4:
      return 3;
    case WebGLConstants.FLOAT_MAT4x2:
      return 4;
    case WebGLConstants.FLOAT_MAT4x3:
      return 4;
    case WebGLConstants.FLOAT_MAT4:
      return 4;
    default:
      {
        return 1;
      }
  }
}
var WebGLCmpFuncs = [WebGLConstants.NEVER, WebGLConstants.LESS, WebGLConstants.EQUAL, WebGLConstants.LEQUAL, WebGLConstants.GREATER, WebGLConstants.NOTEQUAL, WebGLConstants.GEQUAL, WebGLConstants.ALWAYS];
var WebGLStencilOps = [WebGLConstants.ZERO, WebGLConstants.KEEP, WebGLConstants.REPLACE, WebGLConstants.INCR, WebGLConstants.DECR, WebGLConstants.INVERT, WebGLConstants.INCR_WRAP, WebGLConstants.DECR_WRAP];
var WebGLBlendOps = [WebGLConstants.FUNC_ADD, WebGLConstants.FUNC_SUBTRACT, WebGLConstants.FUNC_REVERSE_SUBTRACT, WebGLConstants.MIN, WebGLConstants.MAX];
var WebGLBlendFactors = [WebGLConstants.ZERO, WebGLConstants.ONE, WebGLConstants.SRC_ALPHA, WebGLConstants.DST_ALPHA, WebGLConstants.ONE_MINUS_SRC_ALPHA, WebGLConstants.ONE_MINUS_DST_ALPHA, WebGLConstants.SRC_COLOR, WebGLConstants.DST_COLOR, WebGLConstants.ONE_MINUS_SRC_COLOR, WebGLConstants.ONE_MINUS_DST_COLOR, WebGLConstants.SRC_ALPHA_SATURATE, WebGLConstants.CONSTANT_COLOR, WebGLConstants.ONE_MINUS_CONSTANT_COLOR, WebGLConstants.CONSTANT_ALPHA, WebGLConstants.ONE_MINUS_CONSTANT_ALPHA];
function WebGL2CmdFuncCreateBuffer(device, gpuBuffer) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var glUsage = gpuBuffer.memUsage & MemoryUsageBit.HOST ? WebGLConstants.DYNAMIC_DRAW : WebGLConstants.STATIC_DRAW;
  if (gpuBuffer.usage & BufferUsageBit.VERTEX) {
    gpuBuffer.glTarget = WebGLConstants.ARRAY_BUFFER;
    var glBuffer = gl.createBuffer();
    if (glBuffer) {
      gpuBuffer.glBuffer = glBuffer;
      if (gpuBuffer.size > 0) {
        if (device.extensions.useVAO) {
          if (cache.glVAO) {
            gl.bindVertexArray(null);
            cache.glVAO = null;
          }
        }
        gfxStateCache.gpuInputAssembler = null;
        if (cache.glArrayBuffer !== gpuBuffer.glBuffer) {
          gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, gpuBuffer.glBuffer);
          cache.glArrayBuffer = gpuBuffer.glBuffer;
        }
        gl.bufferData(WebGLConstants.ARRAY_BUFFER, gpuBuffer.size, glUsage);
        gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
        cache.glArrayBuffer = null;
      }
    }
  } else if (gpuBuffer.usage & BufferUsageBit.INDEX) {
    gpuBuffer.glTarget = WebGLConstants.ELEMENT_ARRAY_BUFFER;
    var _glBuffer = gl.createBuffer();
    if (_glBuffer) {
      gpuBuffer.glBuffer = _glBuffer;
      if (gpuBuffer.size > 0) {
        if (device.extensions.useVAO) {
          if (cache.glVAO) {
            gl.bindVertexArray(null);
            cache.glVAO = null;
          }
        }
        gfxStateCache.gpuInputAssembler = null;
        if (cache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
          gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
          cache.glElementArrayBuffer = gpuBuffer.glBuffer;
        }
        gl.bufferData(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.size, glUsage);
        gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
        cache.glElementArrayBuffer = null;
      }
    }
  } else if (gpuBuffer.usage & BufferUsageBit.UNIFORM) {
    gpuBuffer.glTarget = WebGLConstants.UNIFORM_BUFFER;
    var _glBuffer2 = gl.createBuffer();
    if (_glBuffer2 && gpuBuffer.size > 0) {
      gpuBuffer.glBuffer = _glBuffer2;
      if (cache.glUniformBuffer !== gpuBuffer.glBuffer) {
        gl.bindBuffer(WebGLConstants.UNIFORM_BUFFER, gpuBuffer.glBuffer);
        cache.glUniformBuffer = gpuBuffer.glBuffer;
      }
      gl.bufferData(WebGLConstants.UNIFORM_BUFFER, gpuBuffer.size, glUsage);
      gl.bindBuffer(WebGLConstants.UNIFORM_BUFFER, null);
      cache.glUniformBuffer = null;
    }
  } else if (gpuBuffer.usage & BufferUsageBit.INDIRECT) {
    gpuBuffer.glTarget = WebGLConstants.NONE;
  } else if (gpuBuffer.usage & BufferUsageBit.TRANSFER_DST) {
    gpuBuffer.glTarget = WebGLConstants.NONE;
  } else if (gpuBuffer.usage & BufferUsageBit.TRANSFER_SRC) {
    gpuBuffer.glTarget = WebGLConstants.NONE;
  } else {
    errorID(16315);
    gpuBuffer.glTarget = WebGLConstants.NONE;
  }
}
function WebGL2CmdFuncDestroyBuffer(device, gpuBuffer) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var useVAO = device.extensions.useVAO;
  if (gpuBuffer.glBuffer) {
    switch (gpuBuffer.glTarget) {
      case WebGLConstants.ARRAY_BUFFER:
        if (useVAO) {
          if (cache.glVAO) {
            gl.bindVertexArray(null);
            cache.glVAO = null;
          }
        }
        gfxStateCache.gpuInputAssembler = null;
        gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
        cache.glArrayBuffer = null;
        break;
      case WebGLConstants.ELEMENT_ARRAY_BUFFER:
        if (useVAO) {
          if (cache.glVAO) {
            gl.bindVertexArray(null);
            cache.glVAO = null;
          }
        }
        gfxStateCache.gpuInputAssembler = null;
        gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
        cache.glElementArrayBuffer = null;
        break;
      case WebGLConstants.UNIFORM_BUFFER:
        gl.bindBuffer(WebGLConstants.UNIFORM_BUFFER, null);
        cache.glUniformBuffer = null;
        break;
    }
    gl.deleteBuffer(gpuBuffer.glBuffer);
    gpuBuffer.glBuffer = null;
  }
}
function WebGL2CmdFuncResizeBuffer(device, gpuBuffer) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var glUsage = gpuBuffer.memUsage & MemoryUsageBit.HOST ? WebGLConstants.DYNAMIC_DRAW : WebGLConstants.STATIC_DRAW;
  if (gpuBuffer.usage & BufferUsageBit.VERTEX) {
    if (device.extensions.useVAO) {
      if (cache.glVAO) {
        gl.bindVertexArray(null);
        cache.glVAO = null;
      }
    }
    gfxStateCache.gpuInputAssembler = null;
    if (cache.glArrayBuffer !== gpuBuffer.glBuffer) {
      gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, gpuBuffer.glBuffer);
    }
    if (gpuBuffer.buffer) {
      gl.bufferData(WebGLConstants.ARRAY_BUFFER, gpuBuffer.buffer, glUsage);
    } else {
      gl.bufferData(WebGLConstants.ARRAY_BUFFER, gpuBuffer.size, glUsage);
    }
    gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
    cache.glArrayBuffer = null;
  } else if (gpuBuffer.usage & BufferUsageBit.INDEX) {
    if (device.extensions.useVAO) {
      if (cache.glVAO) {
        gl.bindVertexArray(null);
        cache.glVAO = null;
      }
    }
    gfxStateCache.gpuInputAssembler = null;
    if (cache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
      gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
    }
    if (gpuBuffer.buffer) {
      gl.bufferData(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.buffer, glUsage);
    } else {
      gl.bufferData(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.size, glUsage);
    }
    gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
    cache.glElementArrayBuffer = null;
  } else if (gpuBuffer.usage & BufferUsageBit.UNIFORM) {
    if (cache.glUniformBuffer !== gpuBuffer.glBuffer) {
      gl.bindBuffer(WebGLConstants.UNIFORM_BUFFER, gpuBuffer.glBuffer);
    }
    gl.bufferData(WebGLConstants.UNIFORM_BUFFER, gpuBuffer.size, glUsage);
    gl.bindBuffer(WebGLConstants.UNIFORM_BUFFER, null);
    cache.glUniformBuffer = null;
  } else if (gpuBuffer.usage & BufferUsageBit.INDIRECT || gpuBuffer.usage & BufferUsageBit.TRANSFER_DST || gpuBuffer.usage & BufferUsageBit.TRANSFER_SRC) {
    gpuBuffer.glTarget = WebGLConstants.NONE;
  } else {
    errorID(16315);
    gpuBuffer.glTarget = WebGLConstants.NONE;
  }
}
function WebGL2CmdFuncUpdateBuffer(device, gpuBuffer, buffer, offset, size) {
  if (gpuBuffer.usage & BufferUsageBit.INDIRECT) {
    gpuBuffer.indirects.clearDraws();
    var drawInfos = buffer.drawInfos;
    for (var i = 0; i < drawInfos.length; ++i) {
      gpuBuffer.indirects.setDrawInfo(offset + i, drawInfos[i]);
    }
  } else {
    var buff = buffer;
    var gl = device.gl;
    var cache = device.getStateCache();
    switch (gpuBuffer.glTarget) {
      case WebGLConstants.ARRAY_BUFFER:
        {
          if (device.extensions.useVAO) {
            if (cache.glVAO) {
              gl.bindVertexArray(null);
              cache.glVAO = null;
            }
          }
          gfxStateCache.gpuInputAssembler = null;
          if (cache.glArrayBuffer !== gpuBuffer.glBuffer) {
            gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, gpuBuffer.glBuffer);
            cache.glArrayBuffer = gpuBuffer.glBuffer;
          }
          if (systemInfo.os === OS.IOS && gpuBuffer.memUsage & MemoryUsageBit.HOST && offset === 0 && size === buff.byteLength) {
            gl.bufferData(gpuBuffer.glTarget, buff, gl.DYNAMIC_DRAW);
          } else if (size === buff.byteLength) {
            gl.bufferSubData(gpuBuffer.glTarget, offset, buff);
          } else {
            gl.bufferSubData(gpuBuffer.glTarget, offset, buff.slice(0, size));
          }
          break;
        }
      case WebGLConstants.ELEMENT_ARRAY_BUFFER:
        {
          if (device.extensions.useVAO) {
            if (cache.glVAO) {
              gl.bindVertexArray(null);
              cache.glVAO = null;
            }
          }
          gfxStateCache.gpuInputAssembler = null;
          if (cache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
            gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
            cache.glElementArrayBuffer = gpuBuffer.glBuffer;
          }
          if (systemInfo.os === OS.IOS && gpuBuffer.memUsage & MemoryUsageBit.HOST && offset === 0 && size === buff.byteLength) {
            gl.bufferData(gpuBuffer.glTarget, buff, gl.DYNAMIC_DRAW);
          } else if (size === buff.byteLength) {
            gl.bufferSubData(gpuBuffer.glTarget, offset, buff);
          } else {
            gl.bufferSubData(gpuBuffer.glTarget, offset, buff.slice(0, size));
          }
          break;
        }
      case WebGLConstants.UNIFORM_BUFFER:
        {
          if (cache.glUniformBuffer !== gpuBuffer.glBuffer) {
            gl.bindBuffer(WebGLConstants.UNIFORM_BUFFER, gpuBuffer.glBuffer);
            cache.glUniformBuffer = gpuBuffer.glBuffer;
          }
          if (systemInfo.os === OS.IOS && gpuBuffer.memUsage & MemoryUsageBit.HOST && offset === 0 && size === buff.byteLength) {
            gl.bufferData(gpuBuffer.glTarget, buff, gl.DYNAMIC_DRAW);
          } else if (size === buff.byteLength) {
            gl.bufferSubData(gpuBuffer.glTarget, offset, buff);
          } else {
            gl.bufferSubData(gpuBuffer.glTarget, offset, new Float32Array(buff, 0, size / 4));
          }
          break;
        }
      default:
        {
          errorID(16316);
        }
    }
  }
}
function WebGL2CmdFuncCreateTexture(device, gpuTexture) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var capabilities = device.capabilities;
  gpuTexture.glInternalFmt = GFXFormatToWebGLInternalFormat(gpuTexture.format);
  gpuTexture.glFormat = GFXFormatToWebGLFormat(gpuTexture.format);
  gpuTexture.glType = GFXFormatToWebGLType(gpuTexture.format);
  var w = gpuTexture.width;
  var h = gpuTexture.height;
  var d = gpuTexture.depth;
  var l = gpuTexture.arrayLayer;
  switch (gpuTexture.type) {
    case TextureType.TEX2D:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_2D;
        var maxSize = max(w, h);
        if (maxSize > capabilities.maxTextureSize) {
          errorID(9100, maxSize, capabilities.maxTextureSize);
        }
        if (gpuTexture.samples === SampleCount.X1) {
          gpuTexture.glTexture = gl.createTexture();
          if (gpuTexture.size > 0) {
            var glTexUnit = cache.glTexUnits[cache.texUnit];
            if (glTexUnit.glTexture !== gpuTexture.glTexture) {
              gl.bindTexture(WebGLConstants.TEXTURE_2D, gpuTexture.glTexture);
              glTexUnit.glTexture = gpuTexture.glTexture;
            }
            if (FormatInfos[gpuTexture.format].isCompressed) {
              for (var i = 0; i < gpuTexture.mipLevel; ++i) {
                var imgSize = FormatSize(gpuTexture.format, w, h, 1);
                var view = new Uint8Array(imgSize);
                gl.compressedTexImage2D(WebGLConstants.TEXTURE_2D, i, gpuTexture.glInternalFmt, w, h, 0, view);
                w = max(1, w >> 1);
                h = max(1, h >> 1);
              }
            } else if (gpuTexture.flags & TextureFlagBit.MUTABLE_STORAGE) {
              gl.texImage2D(WebGLConstants.TEXTURE_2D, 0, gpuTexture.glInternalFmt, w, h, 0, gpuTexture.glFormat, gpuTexture.glType, null);
            } else {
              gl.texStorage2D(WebGLConstants.TEXTURE_2D, gpuTexture.mipLevel, gpuTexture.glInternalFmt, w, h);
            }
          }
        } else {
          gpuTexture.glRenderbuffer = gl.createRenderbuffer();
          if (gpuTexture.size > 0) {
            if (cache.glRenderbuffer !== gpuTexture.glRenderbuffer) {
              gl.bindRenderbuffer(WebGLConstants.RENDERBUFFER, gpuTexture.glRenderbuffer);
              cache.glRenderbuffer = gpuTexture.glRenderbuffer;
            }
            gl.renderbufferStorageMultisample(WebGLConstants.RENDERBUFFER, gpuTexture.samples, gpuTexture.glInternalFmt, gpuTexture.width, gpuTexture.height);
          }
        }
        break;
      }
    case TextureType.TEX2D_ARRAY:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_2D_ARRAY;
        var _maxSize = max(w, h);
        if (_maxSize > capabilities.maxTextureSize) {
          errorID(9100, _maxSize, capabilities.maxTextureSize);
        }
        if (l > capabilities.maxArrayTextureLayers) {
          errorID(9100, l, capabilities.maxArrayTextureLayers);
        }
        gpuTexture.glTexture = gl.createTexture();
        if (gpuTexture.size > 0) {
          var _glTexUnit = cache.glTexUnits[cache.texUnit];
          if (_glTexUnit.glTexture !== gpuTexture.glTexture) {
            gl.bindTexture(WebGLConstants.TEXTURE_2D_ARRAY, gpuTexture.glTexture);
            _glTexUnit.glTexture = gpuTexture.glTexture;
          }
          if (FormatInfos[gpuTexture.format].isCompressed) {
            for (var _i = 0; _i < gpuTexture.mipLevel; ++_i) {
              var _imgSize = FormatSize(gpuTexture.format, w, h, l);
              var _view = new Uint8Array(_imgSize);
              gl.compressedTexImage3D(WebGLConstants.TEXTURE_2D_ARRAY, _i, gpuTexture.glInternalFmt, w, h, l, 0, _view);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          } else {
            gl.texStorage3D(WebGLConstants.TEXTURE_2D_ARRAY, gpuTexture.mipLevel, gpuTexture.glInternalFmt, w, h, l);
          }
        }
        break;
      }
    case TextureType.TEX3D:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_3D;
        var _maxSize2 = max(max(w, h), d);
        if (_maxSize2 > capabilities.max3DTextureSize) {
          errorID(9100, _maxSize2, capabilities.max3DTextureSize);
        }
        gpuTexture.glTexture = gl.createTexture();
        if (gpuTexture.size > 0) {
          var _glTexUnit2 = cache.glTexUnits[cache.texUnit];
          if (_glTexUnit2.glTexture !== gpuTexture.glTexture) {
            gl.bindTexture(WebGLConstants.TEXTURE_3D, gpuTexture.glTexture);
            _glTexUnit2.glTexture = gpuTexture.glTexture;
          }
          if (FormatInfos[gpuTexture.format].isCompressed) {
            for (var _i2 = 0; _i2 < gpuTexture.mipLevel; ++_i2) {
              var _imgSize2 = FormatSize(gpuTexture.format, w, h, d);
              var _view2 = new Uint8Array(_imgSize2);
              gl.compressedTexImage3D(WebGLConstants.TEXTURE_3D, _i2, gpuTexture.glInternalFmt, w, h, d, 0, _view2);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          } else {
            gl.texStorage3D(WebGLConstants.TEXTURE_3D, gpuTexture.mipLevel, gpuTexture.glInternalFmt, w, h, d);
          }
        }
        break;
      }
    case TextureType.CUBE:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_CUBE_MAP;
        var _maxSize3 = max(w, h);
        if (_maxSize3 > capabilities.maxCubeMapTextureSize) {
          errorID(9100, _maxSize3, capabilities.maxTextureSize);
        }
        gpuTexture.glTexture = gl.createTexture();
        if (gpuTexture.size > 0) {
          var _glTexUnit3 = cache.glTexUnits[cache.texUnit];
          if (_glTexUnit3.glTexture !== gpuTexture.glTexture) {
            gl.bindTexture(WebGLConstants.TEXTURE_CUBE_MAP, gpuTexture.glTexture);
            _glTexUnit3.glTexture = gpuTexture.glTexture;
          }
          if (FormatInfos[gpuTexture.format].isCompressed) {
            for (var _i3 = 0; _i3 < gpuTexture.mipLevel; ++_i3) {
              var _imgSize3 = FormatSize(gpuTexture.format, w, h, 1);
              var _view3 = new Uint8Array(_imgSize3);
              for (var f = 0; f < 6; ++f) {
                gl.compressedTexImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _i3, gpuTexture.glInternalFmt, w, h, 0, _view3);
              }
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          } else {
            gl.texStorage2D(WebGLConstants.TEXTURE_CUBE_MAP, gpuTexture.mipLevel, gpuTexture.glInternalFmt, w, h);
          }
        }
        break;
      }
    default:
      {
        errorID(16317);
        gpuTexture.type = TextureType.TEX2D;
        gpuTexture.glTarget = WebGLConstants.TEXTURE_2D;
      }
  }
}
function WebGL2CmdFuncDestroyTexture(device, gpuTexture) {
  var gl = device.gl;
  var cache = device.getStateCache();
  if (gpuTexture.glTexture) {
    var glTexUnits = cache.glTexUnits;
    var texUnit = cache.texUnit;
    gl.deleteTexture(gpuTexture.glTexture);
    for (var i = 0; i < glTexUnits.length; ++i) {
      if (glTexUnits[i].glTexture === gpuTexture.glTexture) {
        gl.activeTexture(WebGLConstants.TEXTURE0 + i);
        texUnit = i;
        gl.bindTexture(gpuTexture.glTarget, null);
        glTexUnits[i].glTexture = null;
      }
    }
    cache.texUnit = texUnit;
    gpuTexture.glTexture = null;
  }
  if (gpuTexture.glRenderbuffer) {
    var glRenderbuffer = cache.glRenderbuffer;
    gl.deleteRenderbuffer(gpuTexture.glRenderbuffer);
    if (glRenderbuffer === gpuTexture.glRenderbuffer) {
      gl.bindRenderbuffer(WebGLConstants.RENDERBUFFER, null);
      cache.glRenderbuffer = null;
    }
    gpuTexture.glRenderbuffer = null;
  }
}
function WebGL2CmdFuncResizeTexture(device, gpuTexture) {
  if (!gpuTexture.size) return;
  var gl = device.gl;
  var cache = device.getStateCache();
  var capabilities = device.capabilities;
  var w = gpuTexture.width;
  var h = gpuTexture.height;
  var d = gpuTexture.depth;
  var l = gpuTexture.arrayLayer;
  switch (gpuTexture.type) {
    case TextureType.TEX2D:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_2D;
        var maxSize = max(w, h);
        if (maxSize > capabilities.maxTextureSize) {
          errorID(9100, maxSize, capabilities.maxTextureSize);
        }
        if (gpuTexture.samples === SampleCount.X1) {
          var glTexUnit = cache.glTexUnits[cache.texUnit];
          if (glTexUnit.glTexture !== gpuTexture.glTexture) {
            gl.bindTexture(WebGLConstants.TEXTURE_2D, gpuTexture.glTexture);
            glTexUnit.glTexture = gpuTexture.glTexture;
          }
          if (FormatInfos[gpuTexture.format].isCompressed) {
            for (var i = 0; i < gpuTexture.mipLevel; ++i) {
              var imgSize = FormatSize(gpuTexture.format, w, h, 1);
              var view = new Uint8Array(imgSize);
              gl.compressedTexImage2D(WebGLConstants.TEXTURE_2D, i, gpuTexture.glInternalFmt, w, h, 0, view);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          } else {
            WebGL2CmdFuncDestroyTexture(device, gpuTexture);
            WebGL2CmdFuncCreateTexture(device, gpuTexture);
          }
        } else if (gpuTexture.glRenderbuffer) {
          if (cache.glRenderbuffer !== gpuTexture.glRenderbuffer) {
            gl.bindRenderbuffer(WebGLConstants.RENDERBUFFER, gpuTexture.glRenderbuffer);
            cache.glRenderbuffer = gpuTexture.glRenderbuffer;
          }
          gl.renderbufferStorageMultisample(WebGLConstants.RENDERBUFFER, gpuTexture.samples, gpuTexture.glInternalFmt, gpuTexture.width, gpuTexture.height);
        }
        break;
      }
    case TextureType.TEX2D_ARRAY:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_2D_ARRAY;
        var _maxSize4 = max(w, h);
        if (_maxSize4 > capabilities.maxTextureSize) {
          errorID(9100, _maxSize4, capabilities.maxTextureSize);
        }
        if (l > capabilities.maxArrayTextureLayers) {
          errorID(9100, l, capabilities.maxArrayTextureLayers);
        }
        gpuTexture.glTexture = gl.createTexture();
        if (gpuTexture.size > 0) {
          var _glTexUnit4 = cache.glTexUnits[cache.texUnit];
          if (_glTexUnit4.glTexture !== gpuTexture.glTexture) {
            gl.bindTexture(WebGLConstants.TEXTURE_2D_ARRAY, gpuTexture.glTexture);
            _glTexUnit4.glTexture = gpuTexture.glTexture;
          }
          if (FormatInfos[gpuTexture.format].isCompressed) {
            for (var _i4 = 0; _i4 < gpuTexture.mipLevel; ++_i4) {
              var _imgSize4 = FormatSize(gpuTexture.format, w, h, l);
              var _view4 = new Uint8Array(_imgSize4);
              gl.compressedTexImage3D(WebGLConstants.TEXTURE_2D_ARRAY, _i4, gpuTexture.glInternalFmt, w, h, l, 0, _view4);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          } else {
            gl.texStorage3D(WebGLConstants.TEXTURE_2D_ARRAY, gpuTexture.mipLevel, gpuTexture.glInternalFmt, w, h, l);
          }
        }
        break;
      }
    case TextureType.TEX3D:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_3D;
        var _maxSize5 = max(max(w, h), d);
        if (_maxSize5 > capabilities.max3DTextureSize) {
          errorID(9100, _maxSize5, capabilities.max3DTextureSize);
        }
        gpuTexture.glTexture = gl.createTexture();
        if (gpuTexture.size > 0) {
          var _glTexUnit5 = cache.glTexUnits[cache.texUnit];
          if (_glTexUnit5.glTexture !== gpuTexture.glTexture) {
            gl.bindTexture(WebGLConstants.TEXTURE_3D, gpuTexture.glTexture);
            _glTexUnit5.glTexture = gpuTexture.glTexture;
          }
          if (FormatInfos[gpuTexture.format].isCompressed) {
            for (var _i5 = 0; _i5 < gpuTexture.mipLevel; ++_i5) {
              var _imgSize5 = FormatSize(gpuTexture.format, w, h, d);
              var _view5 = new Uint8Array(_imgSize5);
              gl.compressedTexImage3D(WebGLConstants.TEXTURE_3D, _i5, gpuTexture.glInternalFmt, w, h, d, 0, _view5);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          } else {
            gl.texStorage3D(WebGLConstants.TEXTURE_3D, gpuTexture.mipLevel, gpuTexture.glInternalFmt, w, h, d);
          }
        }
        break;
      }
    case TextureType.CUBE:
      {
        gpuTexture.type = TextureType.CUBE;
        gpuTexture.glTarget = WebGLConstants.TEXTURE_CUBE_MAP;
        var _maxSize6 = max(w, h);
        if (_maxSize6 > capabilities.maxCubeMapTextureSize) {
          errorID(9100, _maxSize6, capabilities.maxTextureSize);
        }
        var _glTexUnit6 = cache.glTexUnits[cache.texUnit];
        if (_glTexUnit6.glTexture !== gpuTexture.glTexture) {
          gl.bindTexture(WebGLConstants.TEXTURE_CUBE_MAP, gpuTexture.glTexture);
          _glTexUnit6.glTexture = gpuTexture.glTexture;
        }
        if (FormatInfos[gpuTexture.format].isCompressed) {
          for (var f = 0; f < 6; ++f) {
            w = gpuTexture.width;
            h = gpuTexture.height;
            for (var _i6 = 0; _i6 < gpuTexture.mipLevel; ++_i6) {
              var _imgSize6 = FormatSize(gpuTexture.format, w, h, 1);
              var _view6 = new Uint8Array(_imgSize6);
              gl.compressedTexImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _i6, gpuTexture.glInternalFmt, w, h, 0, _view6);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          }
        } else {
          WebGL2CmdFuncDestroyTexture(device, gpuTexture);
          WebGL2CmdFuncCreateTexture(device, gpuTexture);
        }
        break;
      }
    default:
      {
        errorID(16317);
        gpuTexture.type = TextureType.TEX2D;
        gpuTexture.glTarget = WebGLConstants.TEXTURE_2D;
      }
  }
}
function WebGL2CmdFuncPrepareSamplerInfo(device, gpuSampler) {
  device.gl;
  if (gpuSampler.minFilter === Filter.LINEAR || gpuSampler.minFilter === Filter.ANISOTROPIC) {
    if (gpuSampler.mipFilter === Filter.LINEAR || gpuSampler.mipFilter === Filter.ANISOTROPIC) {
      gpuSampler.glMinFilter = WebGLConstants.LINEAR_MIPMAP_LINEAR;
    } else if (gpuSampler.mipFilter === Filter.POINT) {
      gpuSampler.glMinFilter = WebGLConstants.LINEAR_MIPMAP_NEAREST;
    } else {
      gpuSampler.glMinFilter = WebGLConstants.LINEAR;
    }
  } else if (gpuSampler.mipFilter === Filter.LINEAR || gpuSampler.mipFilter === Filter.ANISOTROPIC) {
    gpuSampler.glMinFilter = WebGLConstants.NEAREST_MIPMAP_LINEAR;
  } else if (gpuSampler.mipFilter === Filter.POINT) {
    gpuSampler.glMinFilter = WebGLConstants.NEAREST_MIPMAP_NEAREST;
  } else {
    gpuSampler.glMinFilter = WebGLConstants.NEAREST;
  }
  if (gpuSampler.magFilter === Filter.LINEAR || gpuSampler.magFilter === Filter.ANISOTROPIC) {
    gpuSampler.glMagFilter = WebGLConstants.LINEAR;
  } else {
    gpuSampler.glMagFilter = WebGLConstants.NEAREST;
  }
  gpuSampler.glWrapS = WebGLWraps[gpuSampler.addressU];
  gpuSampler.glWrapT = WebGLWraps[gpuSampler.addressV];
  gpuSampler.glWrapR = WebGLWraps[gpuSampler.addressW];
}
function WebGL2CmdFuncDestroySampler(device, gpuSampler) {
  var gl = device.gl;
  var it = gpuSampler.glSamplers.values();
  var res = it.next();
  while (!res.done) {
    gl.deleteSampler(res.value);
    var glSamplerUnits = device.getStateCache().glSamplerUnits;
    for (var i = 0; i < glSamplerUnits.length; ++i) {
      if (glSamplerUnits[i] === res.value) {
        gl.bindSampler(i, null);
        glSamplerUnits[i] = null;
      }
    }
  }
  gpuSampler.glSamplers.clear();
}
function WebGL2CmdFuncCreateFramebuffer(device, gpuFramebuffer) {
  var cache = device.getStateCache();
  for (var i = 0; i < gpuFramebuffer.gpuColorViews.length; ++i) {
    var tex = gpuFramebuffer.gpuColorViews[i].gpuTexture;
    if (tex.isSwapchainTexture) {
      gpuFramebuffer.isOffscreen = false;
      return;
    }
  }
  var gl = device.gl;
  var attachments = [];
  var glFramebuffer = gl.createFramebuffer();
  if (glFramebuffer) {
    gpuFramebuffer.glFramebuffer = glFramebuffer;
    if (cache.glFramebuffer !== gpuFramebuffer.glFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, gpuFramebuffer.glFramebuffer);
    }
    for (var _i7 = 0; _i7 < gpuFramebuffer.gpuColorViews.length; ++_i7) {
      var colorTextureView = gpuFramebuffer.gpuColorViews[_i7];
      var colorTexture = colorTextureView.gpuTexture;
      if (colorTexture) {
        if (colorTexture.glTexture) {
          gl.framebufferTexture2D(WebGLConstants.FRAMEBUFFER, WebGLConstants.COLOR_ATTACHMENT0 + _i7, colorTexture.glTarget, colorTexture.glTexture, colorTextureView.baseLevel);
        } else {
          gl.framebufferRenderbuffer(WebGLConstants.FRAMEBUFFER, WebGLConstants.COLOR_ATTACHMENT0 + _i7, WebGLConstants.RENDERBUFFER, colorTexture.glRenderbuffer);
        }
        attachments.push(WebGLConstants.COLOR_ATTACHMENT0 + _i7);
        gpuFramebuffer.width = min(gpuFramebuffer.width, colorTexture.width >> colorTextureView.baseLevel);
        gpuFramebuffer.height = min(gpuFramebuffer.height, colorTexture.height >> colorTextureView.baseLevel);
      }
    }
    var dstView = gpuFramebuffer.gpuDepthStencilView;
    if (dstView) {
      var dst = dstView.gpuTexture;
      var glAttachment = FormatInfos[dst.format].hasStencil ? WebGLConstants.DEPTH_STENCIL_ATTACHMENT : WebGLConstants.DEPTH_ATTACHMENT;
      if (dst.glTexture) {
        gl.framebufferTexture2D(WebGLConstants.FRAMEBUFFER, glAttachment, dst.glTarget, dst.glTexture, gpuFramebuffer.gpuDepthStencilView.baseLevel);
      } else {
        gl.framebufferRenderbuffer(WebGLConstants.FRAMEBUFFER, glAttachment, WebGLConstants.RENDERBUFFER, dst.glRenderbuffer);
      }
      gpuFramebuffer.width = min(gpuFramebuffer.width, dst.width >> dstView.baseLevel);
      gpuFramebuffer.height = min(gpuFramebuffer.height, dst.height >> dstView.baseLevel);
    }
    gl.drawBuffers(attachments);
    var status = gl.checkFramebufferStatus(WebGLConstants.FRAMEBUFFER);
    if (status !== WebGLConstants.FRAMEBUFFER_COMPLETE) {
      switch (status) {
        case WebGLConstants.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
          {
            errorID(16318);
            break;
          }
        case WebGLConstants.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
          {
            errorID(16319);
            break;
          }
        case WebGLConstants.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
          {
            errorID(16320);
            break;
          }
        case WebGLConstants.FRAMEBUFFER_UNSUPPORTED:
          {
            errorID(16321);
            break;
          }
      }
    }
    if (cache.glFramebuffer !== gpuFramebuffer.glFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, cache.glFramebuffer);
    }
  }
}
function WebGL2CmdFuncDestroyFramebuffer(device, gpuFramebuffer) {
  var gl = device.gl;
  var cache = device.getStateCache();
  if (gpuFramebuffer.glFramebuffer) {
    gl.deleteFramebuffer(gpuFramebuffer.glFramebuffer);
    if (cache.glFramebuffer === gpuFramebuffer.glFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, null);
      cache.glFramebuffer = null;
    }
    gpuFramebuffer.glFramebuffer = null;
  }
}
function WebGL2CmdFuncCreateShader(device, gpuShader) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var capabilities = device.capabilities;
  var _loop = function _loop() {
      var gpuStage = gpuShader.gpuStages[k];
      var glShaderType = 0;
      var shaderTypeStr = '';
      var lineNumber = 1;
      switch (gpuStage.type) {
        case ShaderStageFlagBit.VERTEX:
          {
            shaderTypeStr = 'VertexShader';
            glShaderType = WebGLConstants.VERTEX_SHADER;
            break;
          }
        case ShaderStageFlagBit.FRAGMENT:
          {
            shaderTypeStr = 'FragmentShader';
            glShaderType = WebGLConstants.FRAGMENT_SHADER;
            break;
          }
        default:
          {
            errorID(16322);
            return {
              v: void 0
            };
          }
      }
      var glShader = gl.createShader(glShaderType);
      if (glShader) {
        gpuStage.glShader = glShader;
        gl.shaderSource(gpuStage.glShader, "#version 300 es\n" + gpuStage.source);
        gl.compileShader(gpuStage.glShader);
        if (!gl.getShaderParameter(gpuStage.glShader, WebGLConstants.COMPILE_STATUS)) {
          errorID(16323, shaderTypeStr, gpuShader.name);
          errorID(16324, gpuStage.source.replace(/^|\n/g, function () {
            return "\n" + lineNumber++ + " ";
          }));
          error(gl.getShaderInfoLog(gpuStage.glShader));
          for (var l = 0; l < gpuShader.gpuStages.length; l++) {
            var stage = gpuShader.gpuStages[k];
            if (stage.glShader) {
              gl.deleteShader(stage.glShader);
              stage.glShader = null;
            }
          }
          return {
            v: void 0
          };
        }
      }
    },
    _ret;
  for (var k = 0; k < gpuShader.gpuStages.length; k++) {
    _ret = _loop();
    if (_ret) return _ret.v;
  }
  var glProgram = gl.createProgram();
  if (!glProgram) {
    return;
  }
  gpuShader.glProgram = glProgram;
  var enableEffectImport = !!(cclegacy.rendering && cclegacy.rendering.enableEffectImport);
  for (var _k = 0; _k < gpuShader.gpuStages.length; _k++) {
    var gpuStage = gpuShader.gpuStages[_k];
    gl.attachShader(gpuShader.glProgram, gpuStage.glShader);
  }
  gl.linkProgram(gpuShader.glProgram);
  for (var _k2 = 0; _k2 < gpuShader.gpuStages.length; _k2++) {
    var _gpuStage = gpuShader.gpuStages[_k2];
    if (_gpuStage.glShader) {
      gl.detachShader(gpuShader.glProgram, _gpuStage.glShader);
      gl.deleteShader(_gpuStage.glShader);
      _gpuStage.glShader = null;
    }
  }
  if (gl.getProgramParameter(gpuShader.glProgram, WebGLConstants.LINK_STATUS)) {
    debugID(16325, gpuShader.name);
  } else {
    errorID(16326, gpuShader.name);
    error(gl.getProgramInfoLog(gpuShader.glProgram));
    return;
  }
  var activeAttribCount = gl.getProgramParameter(gpuShader.glProgram, WebGLConstants.ACTIVE_ATTRIBUTES);
  gpuShader.glInputs = new Array(activeAttribCount);
  for (var i = 0; i < activeAttribCount; ++i) {
    var attribInfo = gl.getActiveAttrib(gpuShader.glProgram, i);
    if (attribInfo) {
      var varName = void 0;
      var nameOffset = attribInfo.name.indexOf('[');
      if (nameOffset !== -1) {
        varName = attribInfo.name.substring(0, nameOffset);
      } else {
        varName = attribInfo.name;
      }
      var glLoc = gl.getAttribLocation(gpuShader.glProgram, varName);
      var type = WebGLTypeToGFXType(attribInfo.type);
      var stride = WebGLGetTypeSize(attribInfo.type);
      gpuShader.glInputs[i] = {
        name: varName,
        type: type,
        stride: stride,
        count: attribInfo.size,
        size: stride * attribInfo.size,
        glType: attribInfo.type,
        glLoc: glLoc
      };
    }
  }
  var activeBlockCount = gl.getProgramParameter(gpuShader.glProgram, WebGLConstants.ACTIVE_UNIFORM_BLOCKS);
  var blockName;
  var blockIdx;
  var blockSize;
  var block;
  if (activeBlockCount) {
    gpuShader.glBlocks = new Array(activeBlockCount);
    for (var b = 0; b < activeBlockCount; ++b) {
      blockName = gl.getActiveUniformBlockName(gpuShader.glProgram, b);
      var _nameOffset = blockName.indexOf('[');
      if (_nameOffset !== -1) {
        blockName = blockName.substring(0, _nameOffset);
      }
      block = null;
      for (var _k3 = 0; _k3 < gpuShader.blocks.length; _k3++) {
        if (gpuShader.blocks[_k3].name === blockName) {
          block = gpuShader.blocks[_k3];
          break;
        }
      }
      if (!block) {
        errorID(16404, blockName);
      } else {
        blockIdx = b;
        blockSize = gl.getActiveUniformBlockParameter(gpuShader.glProgram, blockIdx, WebGLConstants.UNIFORM_BLOCK_DATA_SIZE);
        var glBinding = enableEffectImport ? block.flattened : block.binding + (device.bindingMappings.blockOffsets[block.set] || 0);
        gl.uniformBlockBinding(gpuShader.glProgram, blockIdx, glBinding);
        gpuShader.glBlocks[b] = {
          set: block.set,
          binding: block.binding,
          idx: blockIdx,
          name: blockName,
          size: blockSize,
          glBinding: glBinding
        };
      }
    }
  }
  for (var _i8 = 0; _i8 < gpuShader.subpassInputs.length; ++_i8) {
    var subpassInput = gpuShader.subpassInputs[_i8];
    gpuShader.samplerTextures.push(new UniformSamplerTexture(subpassInput.set, subpassInput.binding, subpassInput.name, Type.SAMPLER2D, subpassInput.count));
  }
  if (gpuShader.samplerTextures.length > 0) {
    gpuShader.glSamplerTextures = new Array(gpuShader.samplerTextures.length);
    for (var _i9 = 0; _i9 < gpuShader.samplerTextures.length; ++_i9) {
      var sampler = gpuShader.samplerTextures[_i9];
      gpuShader.glSamplerTextures[_i9] = {
        set: sampler.set,
        binding: sampler.binding,
        name: sampler.name,
        type: sampler.type,
        count: sampler.count,
        units: [],
        glUnits: null,
        glType: GFXTypeToWebGLType(sampler.type),
        glLoc: null
      };
    }
  }
  var glActiveSamplers = [];
  var glActiveSamplerLocations = [];
  var texUnitCacheMap = cache.texUnitCacheMap;
  if (!enableEffectImport) {
    var flexibleSetBaseOffset = 0;
    for (var _i0 = 0; _i0 < gpuShader.blocks.length; ++_i0) {
      if (gpuShader.blocks[_i0].set === device.bindingMappings.flexibleSet) {
        flexibleSetBaseOffset++;
      }
    }
    var arrayOffset = 0;
    for (var _i1 = 0; _i1 < gpuShader.samplerTextures.length; ++_i1) {
      var _sampler = gpuShader.samplerTextures[_i1];
      var _glLoc = gl.getUniformLocation(gpuShader.glProgram, _sampler.name);
      if (_glLoc && _glLoc.id !== -1) {
        glActiveSamplers.push(gpuShader.glSamplerTextures[_i1]);
        glActiveSamplerLocations.push(_glLoc);
      }
      if (texUnitCacheMap[_sampler.name] === undefined) {
        var binding = _sampler.binding + device.bindingMappings.samplerTextureOffsets[_sampler.set] + arrayOffset;
        if (_sampler.set === device.bindingMappings.flexibleSet) {
          binding -= flexibleSetBaseOffset;
        }
        texUnitCacheMap[_sampler.name] = binding % capabilities.maxTextureUnits;
        arrayOffset += _sampler.count - 1;
      }
    }
  } else {
    for (var _i10 = 0; _i10 < gpuShader.samplerTextures.length; ++_i10) {
      var _sampler2 = gpuShader.samplerTextures[_i10];
      var _glLoc2 = gl.getUniformLocation(gpuShader.glProgram, _sampler2.name);
      if (_glLoc2 && _glLoc2.id !== -1) {
        glActiveSamplers.push(gpuShader.glSamplerTextures[_i10]);
        glActiveSamplerLocations.push(_glLoc2);
      }
      if (texUnitCacheMap[_sampler2.name] === undefined) {
        texUnitCacheMap[_sampler2.name] = _sampler2.flattened % capabilities.maxTextureUnits;
      }
    }
  }
  if (glActiveSamplers.length) {
    var usedTexUnits = [];
    for (var _i11 = 0; _i11 < glActiveSamplers.length; ++_i11) {
      var glSampler = glActiveSamplers[_i11];
      var cachedUnit = texUnitCacheMap[glSampler.name];
      if (cachedUnit !== undefined) {
        glSampler.glLoc = glActiveSamplerLocations[_i11];
        for (var t = 0; t < glSampler.count; ++t) {
          while (usedTexUnits[cachedUnit]) {
            cachedUnit = (cachedUnit + 1) % capabilities.maxTextureUnits;
          }
          glSampler.units.push(cachedUnit);
          usedTexUnits[cachedUnit] = true;
        }
      }
    }
    var unitIdx = 0;
    for (var _i12 = 0; _i12 < glActiveSamplers.length; ++_i12) {
      var _glSampler = glActiveSamplers[_i12];
      if (!_glSampler.glLoc) {
        _glSampler.glLoc = glActiveSamplerLocations[_i12];
        while (usedTexUnits[unitIdx]) {
          unitIdx++;
        }
        for (var _t = 0; _t < _glSampler.count; ++_t) {
          while (usedTexUnits[unitIdx]) {
            unitIdx = (unitIdx + 1) % capabilities.maxTextureUnits;
          }
          if (texUnitCacheMap[_glSampler.name] === undefined) {
            texUnitCacheMap[_glSampler.name] = unitIdx;
          }
          _glSampler.units.push(unitIdx);
          usedTexUnits[unitIdx] = true;
        }
      }
    }
    if (cache.glProgram !== gpuShader.glProgram) {
      gl.useProgram(gpuShader.glProgram);
    }
    for (var _k4 = 0; _k4 < glActiveSamplers.length; _k4++) {
      var _glSampler2 = glActiveSamplers[_k4];
      _glSampler2.glUnits = new Int32Array(_glSampler2.units);
      gl.uniform1iv(_glSampler2.glLoc, _glSampler2.glUnits);
    }
    if (cache.glProgram !== gpuShader.glProgram) {
      gl.useProgram(cache.glProgram);
    }
  }
  gpuShader.glSamplerTextures = glActiveSamplers;
}
function WebGL2CmdFuncDestroyShader(device, gpuShader) {
  var gl = device.gl;
  var cache = device.getStateCache();
  if (gpuShader.glProgram) {
    gl.deleteProgram(gpuShader.glProgram);
    if (cache.glProgram === gpuShader.glProgram) {
      gl.useProgram(null);
      cache.glProgram = null;
    }
    gpuShader.glProgram = null;
  }
}
function WebGL2CmdFuncCreateInputAssember(device, gpuInputAssembler) {
  device.gl;
  gpuInputAssembler.glAttribs = new Array(gpuInputAssembler.attributes.length);
  var offsets = [0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < gpuInputAssembler.attributes.length; ++i) {
    var attrib = gpuInputAssembler.attributes[i];
    var stream = attrib.stream !== undefined ? attrib.stream : 0;
    var gpuBuffer = gpuInputAssembler.gpuVertexBuffers[stream];
    var glType = GFXFormatToWebGLType(attrib.format);
    var size = FormatInfos[attrib.format].size;
    gpuInputAssembler.glAttribs[i] = {
      name: attrib.name,
      glBuffer: gpuBuffer.glBuffer,
      glType: glType,
      size: size,
      count: FormatInfos[attrib.format].count,
      stride: gpuBuffer.stride,
      componentCount: WebGLGetComponentCount(glType),
      isNormalized: attrib.isNormalized !== undefined ? attrib.isNormalized : false,
      isInstanced: attrib.isInstanced !== undefined ? attrib.isInstanced : false,
      offset: offsets[stream]
    };
    offsets[stream] += size;
  }
}
function WebGL2CmdFuncDestroyInputAssembler(device, gpuInputAssembler) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var it = gpuInputAssembler.glVAOs.values();
  var res = it.next();
  var glVAO = cache.glVAO;
  while (!res.done) {
    gl.deleteVertexArray(res.value);
    if (glVAO === res.value) {
      gl.bindVertexArray(null);
      glVAO = null;
    }
    res = it.next();
  }
  cache.glVAO = glVAO;
  gpuInputAssembler.glVAOs.clear();
}
var gfxStateCache = {
  gpuPipelineState: null,
  gpuInputAssembler: null,
  glPrimitive: 0,
  invalidateAttachments: []
};
function WebGL2CmdFuncBeginRenderPass(device, gpuRenderPass, gpuFramebuffer, renderArea, clearColors, clearDepth, clearStencil) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var clears = 0;
  if (gpuFramebuffer && gpuRenderPass) {
    if (cache.glFramebuffer !== gpuFramebuffer.glFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, gpuFramebuffer.glFramebuffer);
      cache.glFramebuffer = gpuFramebuffer.glFramebuffer;
    }
    if (cache.viewport.left !== renderArea.x || cache.viewport.top !== renderArea.y || cache.viewport.width !== renderArea.width || cache.viewport.height !== renderArea.height) {
      gl.viewport(renderArea.x, renderArea.y, renderArea.width, renderArea.height);
      cache.viewport.left = renderArea.x;
      cache.viewport.top = renderArea.y;
      cache.viewport.width = renderArea.width;
      cache.viewport.height = renderArea.height;
    }
    if (cache.scissorRect.x !== renderArea.x || cache.scissorRect.y !== renderArea.y || cache.scissorRect.width !== renderArea.width || cache.scissorRect.height !== renderArea.height) {
      gl.scissor(renderArea.x, renderArea.y, renderArea.width, renderArea.height);
      cache.scissorRect.x = renderArea.x;
      cache.scissorRect.y = renderArea.y;
      cache.scissorRect.width = renderArea.width;
      cache.scissorRect.height = renderArea.height;
    }
    gfxStateCache.invalidateAttachments.length = 0;
    for (var j = 0; j < clearColors.length; ++j) {
      var colorAttachment = gpuRenderPass.colorAttachments[j];
      if (colorAttachment.format !== Format.UNKNOWN) {
        switch (colorAttachment.loadOp) {
          case LoadOp.LOAD:
            break;
          case LoadOp.CLEAR:
            {
              if (cache.bs.targets[0].blendColorMask !== ColorMask.ALL) {
                gl.colorMask(true, true, true, true);
              }
              if (gpuRenderPass.colorAttachments.length === 1) {
                var clearColor = clearColors[0];
                gl.clearColor(clearColor.x, clearColor.y, clearColor.z, clearColor.w);
                clears |= WebGLConstants.COLOR_BUFFER_BIT;
              } else {
                _f32v4[0] = clearColors[j].x;
                _f32v4[1] = clearColors[j].y;
                _f32v4[2] = clearColors[j].z;
                _f32v4[3] = clearColors[j].w;
                gl.clearBufferfv(WebGLConstants.COLOR, j, _f32v4);
              }
              break;
            }
          case LoadOp.DISCARD:
            {
              gfxStateCache.invalidateAttachments.push(WebGLConstants.COLOR_ATTACHMENT0 + j);
              break;
            }
        }
      }
    }
    if (gpuRenderPass.depthStencilAttachment) {
      if (gpuRenderPass.depthStencilAttachment.format !== Format.UNKNOWN) {
        switch (gpuRenderPass.depthStencilAttachment.depthLoadOp) {
          case LoadOp.LOAD:
            break;
          case LoadOp.CLEAR:
            {
              if (!cache.dss.depthWrite) {
                gl.depthMask(true);
              }
              gl.clearDepth(clearDepth);
              clears |= WebGLConstants.DEPTH_BUFFER_BIT;
              break;
            }
          case LoadOp.DISCARD:
            {
              gfxStateCache.invalidateAttachments.push(WebGLConstants.DEPTH_ATTACHMENT);
              break;
            }
        }
        if (FormatInfos[gpuRenderPass.depthStencilAttachment.format].hasStencil) {
          switch (gpuRenderPass.depthStencilAttachment.stencilLoadOp) {
            case LoadOp.LOAD:
              break;
            case LoadOp.CLEAR:
              {
                if (!cache.dss.stencilWriteMaskFront) {
                  gl.stencilMaskSeparate(WebGLConstants.FRONT, 0xffff);
                }
                if (!cache.dss.stencilWriteMaskBack) {
                  gl.stencilMaskSeparate(WebGLConstants.BACK, 0xffff);
                }
                gl.clearStencil(clearStencil);
                clears |= WebGLConstants.STENCIL_BUFFER_BIT;
                break;
              }
            case LoadOp.DISCARD:
              {
                gfxStateCache.invalidateAttachments.push(WebGLConstants.STENCIL_ATTACHMENT);
                break;
              }
          }
        }
      }
    }
    if (gpuFramebuffer.glFramebuffer && gfxStateCache.invalidateAttachments.length) {
      gl.invalidateFramebuffer(WebGLConstants.FRAMEBUFFER, gfxStateCache.invalidateAttachments);
    }
    if (clears) {
      gl.clear(clears);
    }
    if (clears & WebGLConstants.COLOR_BUFFER_BIT) {
      var colorMask = cache.bs.targets[0].blendColorMask;
      if (colorMask !== ColorMask.ALL) {
        var r = (colorMask & ColorMask.R) !== ColorMask.NONE;
        var g = (colorMask & ColorMask.G) !== ColorMask.NONE;
        var b = (colorMask & ColorMask.B) !== ColorMask.NONE;
        var a = (colorMask & ColorMask.A) !== ColorMask.NONE;
        gl.colorMask(r, g, b, a);
      }
    }
    if (clears & WebGLConstants.DEPTH_BUFFER_BIT && !cache.dss.depthWrite) {
      gl.depthMask(false);
    }
    if (clears & WebGLConstants.STENCIL_BUFFER_BIT) {
      if (!cache.dss.stencilWriteMaskFront) {
        gl.stencilMaskSeparate(WebGLConstants.FRONT, 0);
      }
      if (!cache.dss.stencilWriteMaskBack) {
        gl.stencilMaskSeparate(WebGLConstants.BACK, 0);
      }
    }
  }
}
function WebGL2CmdFuncBindStates(device, gpuPipelineState, gpuInputAssembler, gpuDescriptorSets, dynamicOffsets, dynamicStates) {
  var gl = device.gl;
  var capabilities = device.capabilities;
  var cache = device.getStateCache();
  var cacheRs = cache.rs;
  var cacheDss = cache.dss;
  var cacheBs = cache.bs;
  var cacheBlendColor = cacheBs.blendColor;
  var gpuShader = gpuPipelineState && gpuPipelineState.gpuShader;
  var isShaderChanged = false;
  if (gpuPipelineState && gfxStateCache.gpuPipelineState !== gpuPipelineState) {
    gfxStateCache.gpuPipelineState = gpuPipelineState;
    gfxStateCache.glPrimitive = gpuPipelineState.glPrimitive;
    if (gpuShader) {
      var glProgram = gpuShader.glProgram;
      if (cache.glProgram !== glProgram) {
        gl.useProgram(glProgram);
        cache.glProgram = glProgram;
        isShaderChanged = true;
      }
    }
    var rs = gpuPipelineState.rs;
    if (rs) {
      if (cacheRs.cullMode !== rs.cullMode) {
        switch (rs.cullMode) {
          case CullMode.NONE:
            {
              gl.disable(WebGLConstants.CULL_FACE);
              break;
            }
          case CullMode.FRONT:
            {
              gl.enable(WebGLConstants.CULL_FACE);
              gl.cullFace(WebGLConstants.FRONT);
              break;
            }
          case CullMode.BACK:
            {
              gl.enable(WebGLConstants.CULL_FACE);
              gl.cullFace(WebGLConstants.BACK);
              break;
            }
        }
        cacheRs.cullMode = rs.cullMode;
      }
      var isFrontFaceCCW = rs.isFrontFaceCCW;
      if (cacheRs.isFrontFaceCCW !== isFrontFaceCCW) {
        gl.frontFace(isFrontFaceCCW ? WebGLConstants.CCW : WebGLConstants.CW);
        cacheRs.isFrontFaceCCW = isFrontFaceCCW;
      }
      if (cacheRs.depthBias !== rs.depthBias || cacheRs.depthBiasSlop !== rs.depthBiasSlop) {
        gl.polygonOffset(rs.depthBias, rs.depthBiasSlop);
        cacheRs.depthBias = rs.depthBias;
        cacheRs.depthBiasSlop = rs.depthBiasSlop;
      }
      if (cacheRs.lineWidth !== rs.lineWidth) {
        gl.lineWidth(rs.lineWidth);
        cacheRs.lineWidth = rs.lineWidth;
      }
    }
    var dss = gpuPipelineState.dss;
    if (dss) {
      if (cacheDss.depthTest !== dss.depthTest) {
        if (dss.depthTest) {
          gl.enable(WebGLConstants.DEPTH_TEST);
        } else {
          gl.disable(WebGLConstants.DEPTH_TEST);
        }
        cacheDss.depthTest = dss.depthTest;
      }
      if (cacheDss.depthWrite !== dss.depthWrite) {
        gl.depthMask(dss.depthWrite);
        cacheDss.depthWrite = dss.depthWrite;
      }
      if (cacheDss.depthFunc !== dss.depthFunc) {
        gl.depthFunc(WebGLCmpFuncs[dss.depthFunc]);
        cacheDss.depthFunc = dss.depthFunc;
      }
      if (cacheDss.stencilTestFront !== dss.stencilTestFront || cacheDss.stencilTestBack !== dss.stencilTestBack) {
        if (dss.stencilTestFront || dss.stencilTestBack) {
          gl.enable(WebGLConstants.STENCIL_TEST);
        } else {
          gl.disable(WebGLConstants.STENCIL_TEST);
        }
        cacheDss.stencilTestFront = dss.stencilTestFront;
        cacheDss.stencilTestBack = dss.stencilTestBack;
      }
      if (cacheDss.stencilFuncFront !== dss.stencilFuncFront || cacheDss.stencilRefFront !== dss.stencilRefFront || cacheDss.stencilReadMaskFront !== dss.stencilReadMaskFront) {
        gl.stencilFuncSeparate(WebGLConstants.FRONT, WebGLCmpFuncs[dss.stencilFuncFront], dss.stencilRefFront, dss.stencilReadMaskFront);
        cacheDss.stencilFuncFront = dss.stencilFuncFront;
        cacheDss.stencilRefFront = dss.stencilRefFront;
        cacheDss.stencilReadMaskFront = dss.stencilReadMaskFront;
      }
      if (cacheDss.stencilFailOpFront !== dss.stencilFailOpFront || cacheDss.stencilZFailOpFront !== dss.stencilZFailOpFront || cacheDss.stencilPassOpFront !== dss.stencilPassOpFront) {
        gl.stencilOpSeparate(WebGLConstants.FRONT, WebGLStencilOps[dss.stencilFailOpFront], WebGLStencilOps[dss.stencilZFailOpFront], WebGLStencilOps[dss.stencilPassOpFront]);
        cacheDss.stencilFailOpFront = dss.stencilFailOpFront;
        cacheDss.stencilZFailOpFront = dss.stencilZFailOpFront;
        cacheDss.stencilPassOpFront = dss.stencilPassOpFront;
      }
      if (cacheDss.stencilWriteMaskFront !== dss.stencilWriteMaskFront) {
        gl.stencilMaskSeparate(WebGLConstants.FRONT, dss.stencilWriteMaskFront);
        cacheDss.stencilWriteMaskFront = dss.stencilWriteMaskFront;
      }
      if (cacheDss.stencilFuncBack !== dss.stencilFuncBack || cacheDss.stencilRefBack !== dss.stencilRefBack || cacheDss.stencilReadMaskBack !== dss.stencilReadMaskBack) {
        gl.stencilFuncSeparate(WebGLConstants.BACK, WebGLCmpFuncs[dss.stencilFuncBack], dss.stencilRefBack, dss.stencilReadMaskBack);
        cacheDss.stencilFuncBack = dss.stencilFuncBack;
        cacheDss.stencilRefBack = dss.stencilRefBack;
        cacheDss.stencilReadMaskBack = dss.stencilReadMaskBack;
      }
      if (cacheDss.stencilFailOpBack !== dss.stencilFailOpBack || cacheDss.stencilZFailOpBack !== dss.stencilZFailOpBack || cacheDss.stencilPassOpBack !== dss.stencilPassOpBack) {
        gl.stencilOpSeparate(WebGLConstants.BACK, WebGLStencilOps[dss.stencilFailOpBack], WebGLStencilOps[dss.stencilZFailOpBack], WebGLStencilOps[dss.stencilPassOpBack]);
        cacheDss.stencilFailOpBack = dss.stencilFailOpBack;
        cacheDss.stencilZFailOpBack = dss.stencilZFailOpBack;
        cacheDss.stencilPassOpBack = dss.stencilPassOpBack;
      }
      if (cacheDss.stencilWriteMaskBack !== dss.stencilWriteMaskBack) {
        gl.stencilMaskSeparate(WebGLConstants.BACK, dss.stencilWriteMaskBack);
        cacheDss.stencilWriteMaskBack = dss.stencilWriteMaskBack;
      }
    }
    var bs = gpuPipelineState.bs;
    if (bs) {
      if (cacheBs.isA2C !== bs.isA2C) {
        if (bs.isA2C) {
          gl.enable(WebGLConstants.SAMPLE_ALPHA_TO_COVERAGE);
        } else {
          gl.disable(WebGLConstants.SAMPLE_ALPHA_TO_COVERAGE);
        }
        cacheBs.isA2C = bs.isA2C;
      }
      var blendColor = bs.blendColor;
      if (cacheBlendColor.x !== blendColor.x || cacheBlendColor.y !== blendColor.y || cacheBlendColor.z !== blendColor.z || cacheBlendColor.w !== blendColor.w) {
        gl.blendColor(blendColor.x, blendColor.y, blendColor.z, blendColor.w);
        cacheBlendColor.x = blendColor.x;
        cacheBlendColor.y = blendColor.y;
        cacheBlendColor.z = blendColor.z;
        cacheBlendColor.w = blendColor.w;
      }
      var target0 = bs.targets[0];
      var target0Cache = cache.bs.targets[0];
      if (target0Cache.blend !== target0.blend) {
        if (target0.blend) {
          gl.enable(WebGLConstants.BLEND);
        } else {
          gl.disable(WebGLConstants.BLEND);
        }
        target0Cache.blend = target0.blend;
      }
      if (target0Cache.blendEq !== target0.blendEq || target0Cache.blendAlphaEq !== target0.blendAlphaEq) {
        gl.blendEquationSeparate(WebGLBlendOps[target0.blendEq], WebGLBlendOps[target0.blendAlphaEq]);
        target0Cache.blendEq = target0.blendEq;
        target0Cache.blendAlphaEq = target0.blendAlphaEq;
      }
      if (target0Cache.blendSrc !== target0.blendSrc || target0Cache.blendDst !== target0.blendDst || target0Cache.blendSrcAlpha !== target0.blendSrcAlpha || target0Cache.blendDstAlpha !== target0.blendDstAlpha) {
        gl.blendFuncSeparate(WebGLBlendFactors[target0.blendSrc], WebGLBlendFactors[target0.blendDst], WebGLBlendFactors[target0.blendSrcAlpha], WebGLBlendFactors[target0.blendDstAlpha]);
        target0Cache.blendSrc = target0.blendSrc;
        target0Cache.blendDst = target0.blendDst;
        target0Cache.blendSrcAlpha = target0.blendSrcAlpha;
        target0Cache.blendDstAlpha = target0.blendDstAlpha;
      }
      if (target0Cache.blendColorMask !== target0.blendColorMask) {
        gl.colorMask((target0.blendColorMask & ColorMask.R) !== ColorMask.NONE, (target0.blendColorMask & ColorMask.G) !== ColorMask.NONE, (target0.blendColorMask & ColorMask.B) !== ColorMask.NONE, (target0.blendColorMask & ColorMask.A) !== ColorMask.NONE);
        target0Cache.blendColorMask = target0.blendColorMask;
      }
    }
  }
  if (gpuPipelineState && gpuPipelineState.gpuPipelineLayout && gpuShader) {
    var blockLen = gpuShader.glBlocks.length;
    var dynamicOffsetIndices = gpuPipelineState.gpuPipelineLayout.dynamicOffsetIndices;
    for (var j = 0; j < blockLen; j++) {
      var glBlock = gpuShader.glBlocks[j];
      var gpuDescriptorSet = gpuDescriptorSets[glBlock.set];
      var descriptorIndex = gpuDescriptorSet && gpuDescriptorSet.descriptorIndices[glBlock.binding];
      var gpuDescriptor = descriptorIndex >= 0 && gpuDescriptorSet.gpuDescriptors[descriptorIndex];
      if (!gpuDescriptor || !gpuDescriptor.gpuBuffer) {
        continue;
      }
      var dynamicOffsetIndexSet = dynamicOffsetIndices[glBlock.set];
      var dynamicOffsetIndex = dynamicOffsetIndexSet && dynamicOffsetIndexSet[glBlock.binding];
      var offset = gpuDescriptor.gpuBuffer.glOffset;
      if (dynamicOffsetIndex >= 0) {
        offset += dynamicOffsets[dynamicOffsetIndex];
      }
      if (cache.glBindUBOs[glBlock.glBinding] !== gpuDescriptor.gpuBuffer.glBuffer || cache.glBindUBOOffsets[glBlock.glBinding] !== offset) {
        if (offset) {
          gl.bindBufferRange(WebGLConstants.UNIFORM_BUFFER, glBlock.glBinding, gpuDescriptor.gpuBuffer.glBuffer, offset, gpuDescriptor.gpuBuffer.size);
        } else {
          gl.bindBufferBase(WebGLConstants.UNIFORM_BUFFER, glBlock.glBinding, gpuDescriptor.gpuBuffer.glBuffer);
        }
        cache.glUniformBuffer = cache.glBindUBOs[glBlock.glBinding] = gpuDescriptor.gpuBuffer.glBuffer;
        cache.glBindUBOOffsets[glBlock.glBinding] = offset;
      }
    }
    var samplerLen = gpuShader.glSamplerTextures.length;
    for (var i = 0; i < samplerLen; i++) {
      var samplerInfo = gpuShader.glSamplerTextures[i];
      var _gpuDescriptorSet = gpuDescriptorSets[samplerInfo.set];
      var _descriptorIndex = _gpuDescriptorSet && _gpuDescriptorSet.descriptorIndices[samplerInfo.binding];
      var _gpuDescriptor = _descriptorIndex >= 0 && _gpuDescriptorSet.gpuDescriptors[_descriptorIndex];
      for (var l = 0; l < samplerInfo.units.length; l++) {
        var texUnit = samplerInfo.units[l];
        var glTexUnit = cache.glTexUnits[texUnit];
        if (!_gpuDescriptor || !_gpuDescriptor.gpuTextureView || !_gpuDescriptor.gpuTextureView.gpuTexture || !_gpuDescriptor.gpuSampler) {
          continue;
        }
        var gpuTextureView = _gpuDescriptor.gpuTextureView;
        var gpuTexture = gpuTextureView.gpuTexture;
        var minLod = gpuTextureView.baseLevel;
        var maxLod = minLod + gpuTextureView.levelCount;
        if (gpuTexture.size > 0) {
          if (glTexUnit.glTexture !== gpuTexture.glTexture) {
            if (cache.texUnit !== texUnit) {
              gl.activeTexture(WebGLConstants.TEXTURE0 + texUnit);
              cache.texUnit = texUnit;
            }
            if (gpuTexture.glTexture) {
              gl.bindTexture(gpuTexture.glTarget, gpuTexture.glTexture);
            } else {
              gl.bindTexture(gpuTexture.glTarget, device.nullTex2D.gpuTexture.glTexture);
            }
            glTexUnit.glTexture = gpuTexture.glTexture;
          }
          var _gpuDescriptor2 = _gpuDescriptor,
            gpuSampler = _gpuDescriptor2.gpuSampler;
          var glSampler = gpuSampler.getGLSampler(device, minLod, maxLod);
          if (cache.glSamplerUnits[texUnit] !== glSampler) {
            gl.bindSampler(texUnit, glSampler);
            cache.glSamplerUnits[texUnit] = glSampler;
          }
        }
        _gpuDescriptor = _gpuDescriptorSet.gpuDescriptors[++_descriptorIndex];
      }
    }
  }
  if (gpuInputAssembler && gpuShader && (isShaderChanged || gfxStateCache.gpuInputAssembler !== gpuInputAssembler)) {
    gfxStateCache.gpuInputAssembler = gpuInputAssembler;
    if (device.extensions.useVAO) {
      var glVAO = gpuInputAssembler.glVAOs.get(gpuShader.glProgram);
      if (!glVAO) {
        glVAO = gl.createVertexArray();
        gpuInputAssembler.glVAOs.set(gpuShader.glProgram, glVAO);
        gl.bindVertexArray(glVAO);
        gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
        gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
        cache.glArrayBuffer = null;
        cache.glElementArrayBuffer = null;
        var glAttrib;
        for (var _j = 0; _j < gpuShader.glInputs.length; _j++) {
          var glInput = gpuShader.glInputs[_j];
          glAttrib = null;
          for (var k = 0; k < gpuInputAssembler.glAttribs.length; k++) {
            var attrib = gpuInputAssembler.glAttribs[k];
            if (attrib.name === glInput.name) {
              glAttrib = attrib;
              break;
            }
          }
          if (glAttrib) {
            if (cache.glArrayBuffer !== glAttrib.glBuffer) {
              gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, glAttrib.glBuffer);
              cache.glArrayBuffer = glAttrib.glBuffer;
            }
            for (var c = 0; c < glAttrib.componentCount; ++c) {
              var glLoc = glInput.glLoc + c;
              var attribOffset = glAttrib.offset + glAttrib.size * c;
              gl.enableVertexAttribArray(glLoc);
              cache.glCurrentAttribLocs[glLoc] = true;
              gl.vertexAttribPointer(glLoc, glAttrib.count, glAttrib.glType, glAttrib.isNormalized, glAttrib.stride, attribOffset);
              gl.vertexAttribDivisor(glLoc, glAttrib.isInstanced ? 1 : 0);
            }
          }
        }
        var gpuBuffer = gpuInputAssembler.gpuIndexBuffer;
        if (gpuBuffer) {
          gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
        }
        gl.bindVertexArray(null);
        gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
        gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
        cache.glArrayBuffer = null;
        cache.glElementArrayBuffer = null;
      }
      if (cache.glVAO !== glVAO) {
        gl.bindVertexArray(glVAO);
        cache.glVAO = glVAO;
      }
    } else {
      for (var a = 0; a < capabilities.maxVertexAttributes; ++a) {
        cache.glCurrentAttribLocs[a] = false;
      }
      for (var _j2 = 0; _j2 < gpuShader.glInputs.length; _j2++) {
        var _glInput = gpuShader.glInputs[_j2];
        var _glAttrib = null;
        for (var _k5 = 0; _k5 < gpuInputAssembler.glAttribs.length; _k5++) {
          var _attrib = gpuInputAssembler.glAttribs[_k5];
          if (_attrib.name === _glInput.name) {
            _glAttrib = _attrib;
            break;
          }
        }
        if (_glAttrib) {
          if (cache.glArrayBuffer !== _glAttrib.glBuffer) {
            gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, _glAttrib.glBuffer);
            cache.glArrayBuffer = _glAttrib.glBuffer;
          }
          for (var _c = 0; _c < _glAttrib.componentCount; ++_c) {
            var _glLoc3 = _glInput.glLoc + _c;
            var _attribOffset = _glAttrib.offset + _glAttrib.size * _c;
            if (!cache.glEnabledAttribLocs[_glLoc3] && _glLoc3 >= 0) {
              gl.enableVertexAttribArray(_glLoc3);
              cache.glEnabledAttribLocs[_glLoc3] = true;
            }
            cache.glCurrentAttribLocs[_glLoc3] = true;
            gl.vertexAttribPointer(_glLoc3, _glAttrib.count, _glAttrib.glType, _glAttrib.isNormalized, _glAttrib.stride, _attribOffset);
            gl.vertexAttribDivisor(_glLoc3, _glAttrib.isInstanced ? 1 : 0);
          }
        }
      }
      var _gpuBuffer = gpuInputAssembler.gpuIndexBuffer;
      if (_gpuBuffer) {
        if (cache.glElementArrayBuffer !== _gpuBuffer.glBuffer) {
          gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, _gpuBuffer.glBuffer);
          cache.glElementArrayBuffer = _gpuBuffer.glBuffer;
        }
      }
      for (var _a = 0; _a < capabilities.maxVertexAttributes; ++_a) {
        if (cache.glEnabledAttribLocs[_a] !== cache.glCurrentAttribLocs[_a]) {
          gl.disableVertexAttribArray(_a);
          cache.glEnabledAttribLocs[_a] = false;
        }
      }
    }
  }
  if (gpuPipelineState && gpuPipelineState.dynamicStates.length) {
    var dsLen = gpuPipelineState.dynamicStates.length;
    for (var _k6 = 0; _k6 < dsLen; _k6++) {
      var dynamicState = gpuPipelineState.dynamicStates[_k6];
      switch (dynamicState) {
        case DynamicStateFlagBit.LINE_WIDTH:
          {
            if (cacheRs.lineWidth !== dynamicStates.lineWidth) {
              gl.lineWidth(dynamicStates.lineWidth);
              cacheRs.lineWidth = dynamicStates.lineWidth;
            }
            break;
          }
        case DynamicStateFlagBit.DEPTH_BIAS:
          {
            if (cacheRs.depthBias !== dynamicStates.depthBiasConstant || cache.rs.depthBiasSlop !== dynamicStates.depthBiasSlope) {
              gl.polygonOffset(dynamicStates.depthBiasConstant, dynamicStates.depthBiasSlope);
              cacheRs.depthBias = dynamicStates.depthBiasConstant;
              cacheRs.depthBiasSlop = dynamicStates.depthBiasSlope;
            }
            break;
          }
        case DynamicStateFlagBit.BLEND_CONSTANTS:
          {
            var blendConstant = dynamicStates.blendConstant;
            if (cacheBlendColor.x !== blendConstant.x || cacheBlendColor.y !== blendConstant.y || cacheBlendColor.z !== blendConstant.z || cacheBlendColor.w !== blendConstant.w) {
              gl.blendColor(blendConstant.x, blendConstant.y, blendConstant.z, blendConstant.w);
              cacheBlendColor.copy(blendConstant);
            }
            break;
          }
        case DynamicStateFlagBit.STENCIL_WRITE_MASK:
          {
            var front = dynamicStates.stencilStatesFront;
            var back = dynamicStates.stencilStatesBack;
            if (cacheDss.stencilWriteMaskFront !== front.writeMask) {
              gl.stencilMaskSeparate(WebGLConstants.FRONT, front.writeMask);
              cacheDss.stencilWriteMaskFront = front.writeMask;
            }
            if (cacheDss.stencilWriteMaskBack !== back.writeMask) {
              gl.stencilMaskSeparate(WebGLConstants.BACK, back.writeMask);
              cacheDss.stencilWriteMaskBack = back.writeMask;
            }
            break;
          }
        case DynamicStateFlagBit.STENCIL_COMPARE_MASK:
          {
            var _front = dynamicStates.stencilStatesFront;
            var _back = dynamicStates.stencilStatesBack;
            if (cacheDss.stencilRefFront !== _front.reference || cacheDss.stencilReadMaskFront !== _front.compareMask) {
              gl.stencilFuncSeparate(WebGLConstants.FRONT, WebGLCmpFuncs[cacheDss.stencilFuncFront], _front.reference, _front.compareMask);
              cacheDss.stencilRefFront = _front.reference;
              cacheDss.stencilReadMaskFront = _front.compareMask;
            }
            if (cacheDss.stencilRefBack !== _back.reference || cacheDss.stencilReadMaskBack !== _back.compareMask) {
              gl.stencilFuncSeparate(WebGLConstants.BACK, WebGLCmpFuncs[cacheDss.stencilFuncBack], _back.reference, _back.compareMask);
              cacheDss.stencilRefBack = _back.reference;
              cacheDss.stencilReadMaskBack = _back.compareMask;
            }
            break;
          }
      }
    }
  }
}
function WebGL2CmdFuncDraw(device, drawInfo) {
  var gl = device.gl;
  var gpuInputAssembler = gfxStateCache.gpuInputAssembler,
    glPrimitive = gfxStateCache.glPrimitive;
  var md = device.extensions.WEBGL_multi_draw;
  if (gpuInputAssembler) {
    var indexBuffer = gpuInputAssembler.gpuIndexBuffer;
    if (gpuInputAssembler.gpuIndirectBuffer) {
      var indirects = gpuInputAssembler.gpuIndirectBuffer.indirects;
      if (indirects.drawByIndex) {
        for (var j = 0; j < indirects.drawCount; j++) {
          indirects.byteOffsets[j] = indirects.offsets[j] * indexBuffer.stride;
        }
        if (md) {
          if (indirects.instancedDraw) {
            md.multiDrawElementsInstancedWEBGL(glPrimitive, indirects.counts, 0, gpuInputAssembler.glIndexType, indirects.byteOffsets, 0, indirects.instances, 0, indirects.drawCount);
          } else {
            md.multiDrawElementsWEBGL(glPrimitive, indirects.counts, 0, gpuInputAssembler.glIndexType, indirects.byteOffsets, 0, indirects.drawCount);
          }
        } else {
          for (var _j3 = 0; _j3 < indirects.drawCount; _j3++) {
            if (indirects.instances[_j3]) {
              gl.drawElementsInstanced(glPrimitive, indirects.counts[_j3], gpuInputAssembler.glIndexType, indirects.byteOffsets[_j3], indirects.instances[_j3]);
            } else {
              gl.drawElements(glPrimitive, indirects.counts[_j3], gpuInputAssembler.glIndexType, indirects.byteOffsets[_j3]);
            }
          }
        }
      } else if (md) {
        if (indirects.instancedDraw) {
          md.multiDrawArraysInstancedWEBGL(glPrimitive, indirects.offsets, 0, indirects.counts, 0, indirects.instances, 0, indirects.drawCount);
        } else {
          md.multiDrawArraysWEBGL(glPrimitive, indirects.offsets, 0, indirects.counts, 0, indirects.drawCount);
        }
      } else {
        for (var _j4 = 0; _j4 < indirects.drawCount; _j4++) {
          if (indirects.instances[_j4]) {
            gl.drawArraysInstanced(glPrimitive, indirects.offsets[_j4], indirects.counts[_j4], indirects.instances[_j4]);
          } else {
            gl.drawArrays(glPrimitive, indirects.offsets[_j4], indirects.counts[_j4]);
          }
        }
      }
    } else if (drawInfo.instanceCount) {
      if (indexBuffer) {
        if (drawInfo.indexCount > 0) {
          var offset = drawInfo.firstIndex * indexBuffer.stride;
          gl.drawElementsInstanced(glPrimitive, drawInfo.indexCount, gpuInputAssembler.glIndexType, offset, drawInfo.instanceCount);
        }
      } else if (drawInfo.vertexCount > 0) {
        gl.drawArraysInstanced(glPrimitive, drawInfo.firstVertex, drawInfo.vertexCount, drawInfo.instanceCount);
      }
    } else if (indexBuffer) {
      if (drawInfo.indexCount > 0) {
        var _offset = drawInfo.firstIndex * indexBuffer.stride;
        gl.drawElements(glPrimitive, drawInfo.indexCount, gpuInputAssembler.glIndexType, _offset);
      }
    } else if (drawInfo.vertexCount > 0) {
      gl.drawArrays(glPrimitive, drawInfo.firstVertex, drawInfo.vertexCount);
    }
  }
}
function toUseTexImage2D(texImages, regions) {
  if (texImages.length > 1 || regions.length > 1) return false;
  var isVideoElement = texImages[0] instanceof HTMLVideoElement;
  if (isVideoElement) {
    var videoElement = texImages[0];
    var isSameSize = regions[0].texOffset.x === 0 && regions[0].texOffset.y === 0 && regions[0].texExtent.width === videoElement.videoWidth && regions[0].texExtent.height === videoElement.videoHeight;
    return isSameSize;
  }
  return false;
}
function WebGL2CmdFuncCopyTexImagesToTexture(device, texImages, gpuTexture, regions) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var glTexUnit = cache.glTexUnits[cache.texUnit];
  if (glTexUnit.glTexture !== gpuTexture.glTexture) {
    gl.bindTexture(gpuTexture.glTarget, gpuTexture.glTexture);
    glTexUnit.glTexture = gpuTexture.glTexture;
  }
  var n = 0;
  var f = 0;
  switch (gpuTexture.glTarget) {
    case WebGLConstants.TEXTURE_2D:
      {
        if (gpuTexture.flags & TextureFlagBit.MUTABLE_STORAGE || toUseTexImage2D(texImages, regions)) {
          gl.texImage2D(WebGLConstants.TEXTURE_2D, regions[0].texSubres.mipLevel, gpuTexture.glInternalFmt, regions[0].texExtent.width, regions[0].texExtent.height, 0, gpuTexture.glFormat, gpuTexture.glType, texImages[0]);
        } else {
          for (var k = 0; k < regions.length; k++) {
            var region = regions[k];
            gl.texSubImage2D(WebGLConstants.TEXTURE_2D, region.texSubres.mipLevel, region.texOffset.x, region.texOffset.y, gpuTexture.glFormat, gpuTexture.glType, texImages[n++]);
          }
        }
        break;
      }
    case WebGLConstants.TEXTURE_CUBE_MAP:
      {
        for (var _k7 = 0; _k7 < regions.length; _k7++) {
          var _region = regions[_k7];
          var regionTexSubres = _region.texSubres;
          var regionTexOffset = _region.texOffset;
          var fcount = regionTexSubres.baseArrayLayer + regionTexSubres.layerCount;
          for (f = regionTexSubres.baseArrayLayer; f < fcount; ++f) {
            gl.texSubImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, regionTexSubres.mipLevel, regionTexOffset.x, regionTexOffset.y, gpuTexture.glFormat, gpuTexture.glType, texImages[n++]);
          }
        }
        break;
      }
    default:
      {
        errorID(16327);
      }
  }
  if (gpuTexture.flags & TextureFlagBit.GEN_MIPMAP) {
    gl.generateMipmap(gpuTexture.glTarget);
  }
}
var stagingBuffer = new Uint8Array(1);
function pixelBufferPick(buffer, format, offset, stride, extent) {
  var blockHeight = formatAlignment(format).height;
  var bufferSize = FormatSize(format, extent.width, extent.height, extent.depth);
  var rowStrideSize = FormatSize(format, stride.width, 1, 1);
  var sliceStrideSize = FormatSize(format, stride.width, stride.height, 1);
  var destRowSize = FormatSize(format, extent.width, 1, 1);
  var ArrayBufferCtor = getTypedArrayConstructor(FormatInfos[format]);
  if (stagingBuffer.byteLength < bufferSize) {
    stagingBuffer = new Uint8Array(bufferSize);
  }
  var destOffset = 0;
  var bufferOffset = offset;
  for (var i = 0; i < extent.depth; i++) {
    bufferOffset = offset + sliceStrideSize * i;
    for (var j = 0; j < extent.height; j += blockHeight) {
      stagingBuffer.subarray(destOffset, destOffset + destRowSize).set(new Uint8Array(buffer.buffer, buffer.byteOffset + bufferOffset, destRowSize));
      destOffset += destRowSize;
      bufferOffset += rowStrideSize;
    }
  }
  var length = bufferSize / ArrayBufferCtor.BYTES_PER_ELEMENT;
  assertID(Number.isInteger(length), 9101);
  return new ArrayBufferCtor(stagingBuffer.buffer, 0, length);
}
function WebGL2CmdFuncCopyBuffersToTexture(device, buffers, gpuTexture, regions) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var glTexUnit = cache.glTexUnits[cache.texUnit];
  if (glTexUnit.glTexture !== gpuTexture.glTexture) {
    gl.bindTexture(gpuTexture.glTarget, gpuTexture.glTexture);
    glTexUnit.glTexture = gpuTexture.glTexture;
  }
  var n = 0;
  var f = 0;
  var fmtInfo = FormatInfos[gpuTexture.format];
  var ArrayBufferCtor = getTypedArrayConstructor(fmtInfo);
  var isCompressed = fmtInfo.isCompressed;
  var blockSize = formatAlignment(gpuTexture.format);
  var extent = new Extent();
  var offset = new Offset();
  var stride = new Extent();
  switch (gpuTexture.glTarget) {
    case WebGLConstants.TEXTURE_2D:
      {
        for (var k = 0; k < regions.length; k++) {
          var region = regions[k];
          var mipLevel = region.texSubres.mipLevel;
          var regionTexOffset = region.texOffset;
          var regionTexExtent = region.texExtent;
          var regionTexExtentWidth = regionTexExtent.width;
          var regionTexExtentHeight = regionTexExtent.height;
          var blockSizeWidth = blockSize.width;
          var blockSizeHeight = blockSize.height;
          var regionBuffStride = region.buffStride;
          offset.x = regionTexOffset.x === 0 ? 0 : alignTo(regionTexOffset.x, blockSizeWidth);
          offset.y = regionTexOffset.y === 0 ? 0 : alignTo(regionTexOffset.y, blockSizeHeight);
          extent.width = regionTexExtentWidth < blockSizeWidth ? regionTexExtentWidth : alignTo(regionTexExtentWidth, blockSizeWidth);
          extent.height = regionTexExtentHeight < blockSizeHeight ? regionTexExtentWidth : alignTo(regionTexExtentHeight, blockSizeHeight);
          stride.width = regionBuffStride > 0 ? regionBuffStride : extent.width;
          stride.height = region.buffTexHeight > 0 ? region.buffTexHeight : extent.height;
          var destWidth = regionTexExtentWidth + offset.x === gpuTexture.width >> mipLevel ? regionTexExtentWidth : extent.width;
          var destHeight = regionTexExtentHeight + offset.y === gpuTexture.height >> mipLevel ? regionTexExtentHeight : extent.height;
          var pixels = void 0;
          var buffer = buffers[n++];
          if (stride.width === extent.width && stride.height === extent.height) {
            var length = FormatSize(gpuTexture.format, destWidth, destHeight, 1) / ArrayBufferCtor.BYTES_PER_ELEMENT;
            assertID(Number.isInteger(length), 9101);
            pixels = new ArrayBufferCtor(buffer.buffer, buffer.byteOffset + region.buffOffset, length);
          } else {
            pixels = pixelBufferPick(buffer, gpuTexture.format, region.buffOffset, stride, extent);
          }
          if (!isCompressed) {
            gl.texSubImage2D(WebGLConstants.TEXTURE_2D, mipLevel, offset.x, offset.y, destWidth, destHeight, gpuTexture.glFormat, gpuTexture.glType, pixels);
          } else if (gpuTexture.glInternalFmt !== WebGL2EXT.COMPRESSED_RGB_ETC1_WEBGL) {
            gl.compressedTexSubImage2D(WebGLConstants.TEXTURE_2D, mipLevel, offset.x, offset.y, destWidth, destHeight, gpuTexture.glFormat, pixels);
          } else {
            gl.compressedTexImage2D(WebGLConstants.TEXTURE_2D, mipLevel, gpuTexture.glInternalFmt, destWidth, destHeight, 0, pixels);
          }
        }
        break;
      }
    case WebGLConstants.TEXTURE_2D_ARRAY:
      {
        for (var _k8 = 0; _k8 < regions.length; _k8++) {
          var _region2 = regions[_k8];
          var _mipLevel = _region2.texSubres.mipLevel;
          var _regionTexOffset = _region2.texOffset;
          var _regionTexExtent = _region2.texExtent;
          var _regionTexExtentWidth = _regionTexExtent.width;
          var _regionTexExtentHeight = _regionTexExtent.height;
          var _blockSizeWidth = blockSize.width;
          var _blockSizeHeight = blockSize.height;
          var _regionBuffStride = _region2.buffStride;
          var regionTexSubres = _region2.texSubres;
          offset.x = _regionTexOffset.x === 0 ? 0 : alignTo(_regionTexOffset.x, _blockSizeWidth);
          offset.y = _regionTexOffset.y === 0 ? 0 : alignTo(_regionTexOffset.y, _blockSizeHeight);
          extent.width = _regionTexExtentWidth < _blockSizeWidth ? _regionTexExtentWidth : alignTo(_regionTexExtentWidth, _blockSizeWidth);
          extent.height = _regionTexExtentHeight < _blockSizeHeight ? _regionTexExtentWidth : alignTo(_regionTexExtentHeight, _blockSizeHeight);
          extent.depth = 1;
          stride.width = _regionBuffStride > 0 ? _regionBuffStride : extent.width;
          stride.height = _region2.buffTexHeight > 0 ? _region2.buffTexHeight : extent.height;
          var _destWidth = _regionTexExtentWidth + offset.x === gpuTexture.width >> _mipLevel ? _regionTexExtentWidth : extent.width;
          var _destHeight = _regionTexExtentHeight + offset.y === gpuTexture.height >> _mipLevel ? _regionTexExtentHeight : extent.height;
          var fcount = regionTexSubres.baseArrayLayer + regionTexSubres.layerCount;
          for (f = regionTexSubres.baseArrayLayer; f < fcount; ++f) {
            offset.z = f;
            var _pixels = void 0;
            var _buffer = buffers[n++];
            if (stride.width === extent.width && stride.height === extent.height) {
              var _length = FormatSize(gpuTexture.format, _destWidth, _destHeight, 1) / ArrayBufferCtor.BYTES_PER_ELEMENT;
              assertID(Number.isInteger(_length), 9101);
              _pixels = new ArrayBufferCtor(_buffer.buffer, _buffer.byteOffset + _region2.buffOffset, _length);
            } else {
              _pixels = pixelBufferPick(_buffer, gpuTexture.format, _region2.buffOffset, stride, extent);
            }
            if (!isCompressed) {
              gl.texSubImage3D(WebGLConstants.TEXTURE_2D_ARRAY, _mipLevel, offset.x, offset.y, offset.z, _destWidth, _destHeight, extent.depth, gpuTexture.glFormat, gpuTexture.glType, _pixels);
            } else if (gpuTexture.glInternalFmt !== WebGL2EXT.COMPRESSED_RGB_ETC1_WEBGL) {
              gl.compressedTexSubImage3D(WebGLConstants.TEXTURE_2D_ARRAY, _mipLevel, offset.x, offset.y, offset.z, _destWidth, _destHeight, extent.depth, gpuTexture.glFormat, _pixels);
            } else {
              gl.compressedTexImage3D(WebGLConstants.TEXTURE_2D_ARRAY, _mipLevel, gpuTexture.glInternalFmt, _destWidth, _destHeight, extent.depth, 0, _pixels);
            }
          }
        }
        break;
      }
    case WebGLConstants.TEXTURE_3D:
      {
        for (var _k9 = 0; _k9 < regions.length; _k9++) {
          var _region3 = regions[_k9];
          var _mipLevel2 = _region3.texSubres.mipLevel;
          var _regionTexOffset2 = _region3.texOffset;
          var _regionTexExtent2 = _region3.texExtent;
          var _regionTexExtentWidth2 = _regionTexExtent2.width;
          var _regionTexExtentHeight2 = _regionTexExtent2.height;
          var _blockSizeWidth2 = blockSize.width;
          var _blockSizeHeight2 = blockSize.height;
          var _regionBuffStride2 = _region3.buffStride;
          offset.x = _regionTexOffset2.x === 0 ? 0 : alignTo(_regionTexOffset2.x, _blockSizeWidth2);
          offset.y = _regionTexOffset2.y === 0 ? 0 : alignTo(_regionTexOffset2.y, _blockSizeHeight2);
          offset.z = _regionTexOffset2.z;
          extent.width = _regionTexExtentWidth2 < _blockSizeWidth2 ? _regionTexExtentWidth2 : alignTo(_regionTexExtentWidth2, _blockSizeWidth2);
          extent.height = _regionTexExtentHeight2 < _blockSizeHeight2 ? _regionTexExtentWidth2 : alignTo(_regionTexExtentHeight2, _blockSizeHeight2);
          extent.depth = _regionTexExtent2.depth;
          stride.width = _regionBuffStride2 > 0 ? _regionBuffStride2 : extent.width;
          stride.height = _region3.buffTexHeight > 0 ? _region3.buffTexHeight : extent.height;
          var _destWidth2 = _regionTexExtentWidth2 + offset.x === gpuTexture.width >> _mipLevel2 ? _regionTexExtentWidth2 : extent.width;
          var _destHeight2 = _regionTexExtentHeight2 + offset.y === gpuTexture.height >> _mipLevel2 ? _regionTexExtentHeight2 : extent.height;
          var _pixels2 = void 0;
          var _buffer2 = buffers[n++];
          if (stride.width === extent.width && stride.height === extent.height) {
            var _length2 = FormatSize(gpuTexture.format, _destWidth2, _destHeight2, extent.depth) / ArrayBufferCtor.BYTES_PER_ELEMENT;
            assertID(Number.isInteger(_length2), 9101);
            _pixels2 = new ArrayBufferCtor(_buffer2.buffer, _buffer2.byteOffset + _region3.buffOffset, _length2);
          } else {
            _pixels2 = pixelBufferPick(_buffer2, gpuTexture.format, _region3.buffOffset, stride, extent);
          }
          if (!isCompressed) {
            gl.texSubImage3D(WebGLConstants.TEXTURE_2D_ARRAY, _mipLevel2, offset.x, offset.y, offset.z, _destWidth2, _destHeight2, extent.depth, gpuTexture.glFormat, gpuTexture.glType, _pixels2);
          } else if (gpuTexture.glInternalFmt !== WebGL2EXT.COMPRESSED_RGB_ETC1_WEBGL) {
            gl.compressedTexSubImage3D(WebGLConstants.TEXTURE_2D_ARRAY, _mipLevel2, offset.x, offset.y, offset.z, _destWidth2, _destHeight2, extent.depth, gpuTexture.glFormat, _pixels2);
          } else {
            gl.compressedTexImage3D(WebGLConstants.TEXTURE_2D_ARRAY, _mipLevel2, gpuTexture.glInternalFmt, _destWidth2, _destHeight2, extent.depth, 0, _pixels2);
          }
        }
        break;
      }
    case WebGLConstants.TEXTURE_CUBE_MAP:
      {
        for (var _k0 = 0; _k0 < regions.length; _k0++) {
          var _region4 = regions[_k0];
          var _mipLevel3 = _region4.texSubres.mipLevel;
          var _regionTexOffset3 = _region4.texOffset;
          var _regionTexExtent3 = _region4.texExtent;
          var _regionTexExtentWidth3 = _regionTexExtent3.width;
          var _regionTexExtentHeight3 = _regionTexExtent3.height;
          var _blockSizeWidth3 = blockSize.width;
          var _blockSizeHeight3 = blockSize.height;
          var _regionBuffStride3 = _region4.buffStride;
          var _regionTexSubres = _region4.texSubres;
          offset.x = _regionTexOffset3.x === 0 ? 0 : alignTo(_regionTexOffset3.x, _blockSizeWidth3);
          offset.y = _regionTexOffset3.y === 0 ? 0 : alignTo(_regionTexOffset3.y, _blockSizeHeight3);
          extent.width = _regionTexExtentWidth3 < _blockSizeWidth3 ? _regionTexExtentWidth3 : alignTo(_regionTexExtentWidth3, _blockSizeWidth3);
          extent.height = _regionTexExtentHeight3 < _blockSizeHeight3 ? _regionTexExtentWidth3 : alignTo(_regionTexExtentHeight3, _blockSizeHeight3);
          stride.width = _regionBuffStride3 > 0 ? _regionBuffStride3 : extent.width;
          stride.height = _region4.buffTexHeight > 0 ? _region4.buffTexHeight : extent.height;
          var _destWidth3 = _regionTexExtentWidth3 + offset.x === gpuTexture.width >> _mipLevel3 ? _regionTexExtentWidth3 : extent.width;
          var _destHeight3 = _regionTexExtentHeight3 + offset.y === gpuTexture.height >> _mipLevel3 ? _regionTexExtentHeight3 : extent.height;
          var _fcount = _regionTexSubres.baseArrayLayer + _regionTexSubres.layerCount;
          for (f = _regionTexSubres.baseArrayLayer; f < _fcount; ++f) {
            var _pixels3 = void 0;
            var _buffer3 = buffers[n++];
            if (stride.width === extent.width && stride.height === extent.height) {
              var _length3 = FormatSize(gpuTexture.format, _destWidth3, _destHeight3, 1) / ArrayBufferCtor.BYTES_PER_ELEMENT;
              assertID(Number.isInteger(_length3), 9101);
              _pixels3 = new ArrayBufferCtor(_buffer3.buffer, _buffer3.byteOffset + _region4.buffOffset, _length3);
            } else {
              _pixels3 = pixelBufferPick(_buffer3, gpuTexture.format, _region4.buffOffset, stride, extent);
            }
            if (!isCompressed) {
              gl.texSubImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _mipLevel3, offset.x, offset.y, _destWidth3, _destHeight3, gpuTexture.glFormat, gpuTexture.glType, _pixels3);
            } else if (gpuTexture.glInternalFmt !== WebGL2EXT.COMPRESSED_RGB_ETC1_WEBGL) {
              gl.compressedTexSubImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _mipLevel3, offset.x, offset.y, _destWidth3, _destHeight3, gpuTexture.glFormat, _pixels3);
            } else {
              gl.compressedTexImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _mipLevel3, gpuTexture.glInternalFmt, _destWidth3, _destHeight3, 0, _pixels3);
            }
          }
        }
        break;
      }
    default:
      {
        errorID(16327);
      }
  }
  if (gpuTexture.flags & TextureFlagBit.GEN_MIPMAP) {
    gl.generateMipmap(gpuTexture.glTarget);
  }
}
function WebGL2CmdFuncCopyTextureToBuffers(device, gpuTexture, buffers, regions) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, framebuffer);
  var x = 0;
  var y = 0;
  var w = 1;
  var h = 1;
  switch (gpuTexture.glTarget) {
    case WebGLConstants.TEXTURE_2D:
      {
        for (var k = 0; k < regions.length; k++) {
          var region = regions[k];
          gl.framebufferTexture2D(WebGLConstants.FRAMEBUFFER, WebGLConstants.COLOR_ATTACHMENT0, gpuTexture.glTarget, gpuTexture.glTexture, region.texSubres.mipLevel);
          x = region.texOffset.x;
          y = region.texOffset.y;
          w = region.texExtent.width;
          h = region.texExtent.height;
          gl.readPixels(x, y, w, h, gpuTexture.glFormat, gpuTexture.glType, buffers[k]);
        }
        break;
      }
    default:
      {
        errorID(16399);
      }
  }
  gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, null);
  cache.glFramebuffer = null;
  gl.deleteFramebuffer(framebuffer);
}
function bindDrawFramebuffer(gl, framebuffer, cache) {
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
  cache.glFramebuffer = framebuffer;
}
function WebGL2CmdFuncBlitTexture(device, src, dst, regions, filter) {
  var gl = device.gl;
  var cache = device.getStateCache();
  var blitManager = device.blitManager;
  if (!blitManager) {
    return;
  }
  var glFilter = filter === Filter.LINEAR || filter === Filter.ANISOTROPIC ? WebGLConstants.LINEAR : WebGLConstants.NEAREST;
  var srcFramebuffer = blitManager.srcFramebuffer;
  var dstFramebuffer = blitManager.dstFramebuffer;
  var origReadFBO = cache.glReadFramebuffer;
  var origDrawFBO = cache.glFramebuffer;
  var srcMip = regions[0].srcSubres.mipLevel;
  var dstMip = regions[0].dstSubres.mipLevel;
  var blitInfo = function blitInfo(formatInfo) {
    var mask = 0;
    var attachment = WebGLConstants.COLOR_ATTACHMENT0;
    if (formatInfo.hasStencil) {
      attachment = WebGLConstants.DEPTH_STENCIL_ATTACHMENT;
    } else if (formatInfo.hasDepth) {
      attachment = WebGLConstants.DEPTH_ATTACHMENT;
    }
    if (formatInfo.hasDepth || formatInfo.hasStencil) {
      if (formatInfo.hasDepth) {
        mask |= WebGLConstants.DEPTH_BUFFER_BIT;
      }
      if (formatInfo.hasStencil) {
        mask |= WebGLConstants.STENCIL_BUFFER_BIT;
      }
    } else {
      mask |= WebGLConstants.COLOR_BUFFER_BIT;
    }
    return {
      mask: mask,
      attachment: attachment
    };
  };
  var regionIndices = regions.map(function (_, i) {
    return i;
  });
  regionIndices.sort(function (a, b) {
    return regions[a].srcSubres.mipLevel - regions[b].srcSubres.mipLevel;
  });
  var _blitInfo = blitInfo(FormatInfos[src.format]),
    srcMask = _blitInfo.mask,
    srcAttachment = _blitInfo.attachment;
  var _blitInfo2 = blitInfo(FormatInfos[dst.format]),
    dstAttachment = _blitInfo2.attachment;
  if (cache.glReadFramebuffer !== srcFramebuffer) {
    gl.bindFramebuffer(WebGLConstants.READ_FRAMEBUFFER, srcFramebuffer);
    cache.glReadFramebuffer = srcFramebuffer;
  }
  if (src.glTexture) {
    gl.framebufferTexture2D(WebGLConstants.READ_FRAMEBUFFER, srcAttachment, src.glTarget, src.glTexture, srcMip);
  } else {
    gl.framebufferRenderbuffer(WebGLConstants.READ_FRAMEBUFFER, srcAttachment, WebGLConstants.RENDERBUFFER, src.glRenderbuffer);
  }
  var status = gl.checkFramebufferStatus(gl.READ_FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    warnID(16318);
  }
  var isSwapchain = dst.isSwapchainTexture;
  if (isSwapchain) {
    bindDrawFramebuffer(gl, null, cache);
  } else {
    if (cache.glFramebuffer !== dstFramebuffer) {
      bindDrawFramebuffer(gl, dstFramebuffer, cache);
    }
    if (dst.glTexture) {
      gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, dstAttachment, dst.glTarget, dst.glTexture, dstMip);
    } else {
      gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, dstAttachment, gl.RENDERBUFFER, dst.glRenderbuffer);
    }
  }
  for (var i = 0; i < regionIndices.length; i++) {
    var region = regions[regionIndices[i]];
    if (src.glTexture && srcMip !== region.srcSubres.mipLevel) {
      srcMip = region.srcSubres.mipLevel;
      gl.framebufferTexture2D(WebGLConstants.READ_FRAMEBUFFER, srcAttachment, src.glTarget, src.glTexture, srcMip);
    }
    if (dst.glTexture && dstMip !== region.dstSubres.mipLevel && !isSwapchain) {
      dstMip = region.dstSubres.mipLevel;
      gl.framebufferTexture2D(WebGLConstants.DRAW_FRAMEBUFFER, dstAttachment, dst.glTarget, dst.glTexture, dstMip);
    }
    gl.blitFramebuffer(region.srcOffset.x, region.srcOffset.y, region.srcOffset.x + region.srcExtent.width, region.srcOffset.y + region.srcExtent.height, region.dstOffset.x, region.dstOffset.y, region.dstOffset.x + region.dstExtent.width, region.dstOffset.y + region.dstExtent.height, srcMask, glFilter);
  }
  if (cache.glReadFramebuffer !== origReadFBO) {
    gl.bindFramebuffer(WebGLConstants.READ_FRAMEBUFFER, origReadFBO);
    cache.glReadFramebuffer = origReadFBO;
  }
  if (cache.glFramebuffer !== origDrawFBO) {
    gl.bindFramebuffer(WebGLConstants.DRAW_FRAMEBUFFER, origDrawFBO);
    cache.glFramebuffer = origDrawFBO;
  }
}

var WebGL2IndirectDrawInfosEnums = {
  DEFAULT_CAPACITY: 4
};
var WebGL2IndirectDrawInfos = function () {
  function WebGL2IndirectDrawInfos() {
    this.counts = void 0;
    this.offsets = void 0;
    this.instances = void 0;
    this.drawCount = 0;
    this.drawByIndex = false;
    this.instancedDraw = false;
    this.byteOffsets = void 0;
    this._capacity = WebGL2IndirectDrawInfosEnums.DEFAULT_CAPACITY;
    this.counts = new Int32Array(WebGL2IndirectDrawInfosEnums.DEFAULT_CAPACITY);
    this.offsets = new Int32Array(WebGL2IndirectDrawInfosEnums.DEFAULT_CAPACITY);
    this.instances = new Int32Array(WebGL2IndirectDrawInfosEnums.DEFAULT_CAPACITY);
    this.byteOffsets = new Int32Array(WebGL2IndirectDrawInfosEnums.DEFAULT_CAPACITY);
  }
  var _proto = WebGL2IndirectDrawInfos.prototype;
  _proto.clearDraws = function clearDraws() {
    this.drawCount = 0;
    this.drawByIndex = false;
    this.instancedDraw = false;
  };
  _proto.setDrawInfo = function setDrawInfo(idx, info) {
    this._ensureCapacity(idx);
    this.drawByIndex = info.indexCount > 0;
    this.instancedDraw = !!info.instanceCount;
    this.drawCount = Math.max(idx + 1, this.drawCount);
    if (this.drawByIndex) {
      this.counts[idx] = info.indexCount;
      this.offsets[idx] = info.firstIndex;
    } else {
      this.counts[idx] = info.vertexCount;
      this.offsets[idx] = info.firstVertex;
    }
    this.instances[idx] = Math.max(1, info.instanceCount);
  };
  _proto._ensureCapacity = function _ensureCapacity(target) {
    if (this._capacity > target) return;
    this._capacity = nextPow2(target);
    var counts = new Int32Array(this._capacity);
    var offsets = new Int32Array(this._capacity);
    var instances = new Int32Array(this._capacity);
    this.byteOffsets = new Int32Array(this._capacity);
    counts.set(this.counts);
    offsets.set(this.offsets);
    instances.set(this.instances);
    this.counts = counts;
    this.offsets = offsets;
    this.instances = instances;
  };
  return WebGL2IndirectDrawInfos;
}();
var IWebGL2BlitManager = function () {
  function IWebGL2BlitManager() {
    this._srcFramebuffer = void 0;
    this._dstFramebuffer = void 0;
    var gl = WebGL2DeviceManager.instance.gl;
    this._srcFramebuffer = gl.createFramebuffer();
    this._dstFramebuffer = gl.createFramebuffer();
  }
  var _proto2 = IWebGL2BlitManager.prototype;
  _proto2.destroy = function destroy() {
    var gl = WebGL2DeviceManager.instance.gl;
    gl.deleteFramebuffer(this._srcFramebuffer);
    gl.deleteFramebuffer(this._dstFramebuffer);
  };
  return _createClass(IWebGL2BlitManager, [{
    key: "srcFramebuffer",
    get: function get() {
      return this._srcFramebuffer;
    }
  }, {
    key: "dstFramebuffer",
    get: function get() {
      return this._dstFramebuffer;
    }
  }]);
}();

var WebGL2Buffer = function (_Buffer) {
  function WebGL2Buffer() {
    var _this;
    _this = _Buffer.call(this) || this;
    _this._gpuBuffer = null;
    return _this;
  }
  _inheritsLoose(WebGL2Buffer, _Buffer);
  var _proto = WebGL2Buffer.prototype;
  _proto.getGpuBuffer = function getGpuBuffer() {
    return this._gpuBuffer;
  };
  _proto.initialize = function initialize(info) {
    if ('buffer' in info) {
      this._isBufferView = true;
      var buffer = info.buffer;
      this._usage = buffer.usage;
      this._memUsage = buffer.memUsage;
      this._size = this._stride = info.range;
      this._count = 1;
      this._flags = buffer.flags;
      this._gpuBuffer = {
        usage: this._usage,
        memUsage: this._memUsage,
        size: this._size,
        stride: this._stride,
        buffer: null,
        indirects: buffer.getGpuBuffer().indirects,
        glTarget: buffer.getGpuBuffer().glTarget,
        glBuffer: buffer.getGpuBuffer().glBuffer,
        glOffset: info.offset
      };
    } else {
      this._usage = info.usage;
      this._memUsage = info.memUsage;
      this._size = info.size;
      this._stride = Math.max(info.stride || this._size, 1);
      this._count = this._size / this._stride;
      this._flags = info.flags;
      this._gpuBuffer = {
        usage: this._usage,
        memUsage: this._memUsage,
        size: this._size,
        stride: this._stride,
        buffer: null,
        indirects: new WebGL2IndirectDrawInfos(),
        glTarget: 0,
        glBuffer: null,
        glOffset: 0
      };
      WebGL2CmdFuncCreateBuffer(WebGL2DeviceManager.instance, this._gpuBuffer);
      WebGL2DeviceManager.instance.memoryStatus.bufferSize += this._size;
    }
  };
  _proto.destroy = function destroy() {
    if (this._gpuBuffer) {
      if (!this._isBufferView) {
        WebGL2CmdFuncDestroyBuffer(WebGL2DeviceManager.instance, this._gpuBuffer);
        WebGL2DeviceManager.instance.memoryStatus.bufferSize -= this._size;
      }
      this._gpuBuffer = null;
    }
  };
  _proto.resize = function resize(size) {
    if (this._isBufferView) {
      warnID(16379);
      return;
    }
    var oldSize = this._size;
    if (oldSize === size) {
      return;
    }
    this._size = size;
    this._count = this._size / this._stride;
    if (this._gpuBuffer) {
      this._gpuBuffer.size = size;
      if (size > 0) {
        WebGL2CmdFuncResizeBuffer(WebGL2DeviceManager.instance, this._gpuBuffer);
        WebGL2DeviceManager.instance.memoryStatus.bufferSize -= oldSize;
        WebGL2DeviceManager.instance.memoryStatus.bufferSize += size;
      }
    }
  };
  _proto.update = function update(buffer, size) {
    if (this._isBufferView) {
      warnID(16380);
      return;
    }
    var buffSize;
    if (size !== undefined) {
      buffSize = size;
    } else if (this._usage & BufferUsageBit.INDIRECT) {
      buffSize = 0;
    } else {
      buffSize = buffer.byteLength;
    }
    WebGL2CmdFuncUpdateBuffer(WebGL2DeviceManager.instance, this._gpuBuffer, buffer, 0, buffSize);
  };
  return WebGL2Buffer;
}(Buffer);

var WebGL2CommandBuffer = function (_CommandBuffer) {
  function WebGL2CommandBuffer() {
    var _this;
    _this = _CommandBuffer.call(this) || this;
    _this._isInRenderPass = false;
    _this._curGPUPipelineState = null;
    _this._curGPUDescriptorSets = [];
    _this._curGPUInputAssembler = null;
    _this._curDynamicOffsets = Array(8).fill(0);
    _this._curDynamicStates = new DynamicStates();
    _this._isStateInvalid = false;
    return _this;
  }
  _inheritsLoose(WebGL2CommandBuffer, _CommandBuffer);
  var _proto = WebGL2CommandBuffer.prototype;
  _proto.initialize = function initialize(info) {
    this._type = info.type;
    this._queue = info.queue;
    var setCount = WebGL2DeviceManager.instance.bindingMappings.blockOffsets.length;
    for (var i = 0; i < setCount; i++) {
      this._curGPUDescriptorSets.push(null);
    }
  };
  _proto.destroy = function destroy() {};
  _proto.begin = function begin(renderPass, subpass, frameBuffer) {
    this._curGPUPipelineState = null;
    this._curGPUInputAssembler = null;
    this._curGPUDescriptorSets.length = 0;
    this._numDrawCalls = 0;
    this._numInstances = 0;
    this._numTris = 0;
    this._isInRenderPass = false;
  };
  _proto.end = function end() {
    if (this._isStateInvalid) {
      this.bindStates();
    }
    this._isInRenderPass = false;
  };
  _proto.beginRenderPass = function beginRenderPass(renderPass, framebuffer, renderArea, clearColors, clearDepth, clearStencil) {
    errorID(16401);
    this._isInRenderPass = true;
  };
  _proto.endRenderPass = function endRenderPass() {
    this._isInRenderPass = false;
  };
  _proto.bindPipelineState = function bindPipelineState(pipelineState) {
    var gpuPipelineState = pipelineState.gpuPipelineState;
    if (gpuPipelineState !== this._curGPUPipelineState) {
      this._curGPUPipelineState = gpuPipelineState;
      this._isStateInvalid = true;
    }
  };
  _proto.bindDescriptorSet = function bindDescriptorSet(set, descriptorSet, dynamicOffsets) {
    var gpuDescriptorSets = descriptorSet.gpuDescriptorSet;
    if (gpuDescriptorSets !== this._curGPUDescriptorSets[set]) {
      this._curGPUDescriptorSets[set] = gpuDescriptorSets;
      this._isStateInvalid = true;
    }
    if (dynamicOffsets) {
      var _this$_curGPUPipeline;
      var gpuPipelineLayout = (_this$_curGPUPipeline = this._curGPUPipelineState) == null ? void 0 : _this$_curGPUPipeline.gpuPipelineLayout;
      if (gpuPipelineLayout) {
        var offsets = this._curDynamicOffsets;
        var idx = gpuPipelineLayout.dynamicOffsetOffsets[set];
        for (var i = 0; i < dynamicOffsets.length; i++) offsets[idx + i] = dynamicOffsets[i];
        this._isStateInvalid = true;
      }
    }
  };
  _proto.bindInputAssembler = function bindInputAssembler(inputAssembler) {
    var gpuInputAssembler = inputAssembler.gpuInputAssembler;
    this._curGPUInputAssembler = gpuInputAssembler;
    this._isStateInvalid = true;
  };
  _proto.setViewport = function setViewport(viewport) {
    var cache = this._curDynamicStates.viewport;
    if (cache.left !== viewport.left || cache.top !== viewport.top || cache.width !== viewport.width || cache.height !== viewport.height || cache.minDepth !== viewport.minDepth || cache.maxDepth !== viewport.maxDepth) {
      cache.left = viewport.left;
      cache.top = viewport.top;
      cache.width = viewport.width;
      cache.height = viewport.height;
      cache.minDepth = viewport.minDepth;
      cache.maxDepth = viewport.maxDepth;
      this._isStateInvalid = true;
    }
  };
  _proto.setScissor = function setScissor(scissor) {
    var cache = this._curDynamicStates.scissor;
    if (cache.x !== scissor.x || cache.y !== scissor.y || cache.width !== scissor.width || cache.height !== scissor.height) {
      cache.x = scissor.x;
      cache.y = scissor.y;
      cache.width = scissor.width;
      cache.height = scissor.height;
      this._isStateInvalid = true;
    }
  };
  _proto.setLineWidth = function setLineWidth(lineWidth) {
    if (this._curDynamicStates.lineWidth !== lineWidth) {
      this._curDynamicStates.lineWidth = lineWidth;
      this._isStateInvalid = true;
    }
  };
  _proto.setDepthBias = function setDepthBias(depthBiasConstantFactor, depthBiasClamp, depthBiasSlopeFactor) {
    var cache = this._curDynamicStates;
    if (cache.depthBiasConstant !== depthBiasConstantFactor || cache.depthBiasClamp !== depthBiasClamp || cache.depthBiasSlope !== depthBiasSlopeFactor) {
      cache.depthBiasConstant = depthBiasConstantFactor;
      cache.depthBiasClamp = depthBiasClamp;
      cache.depthBiasSlope = depthBiasSlopeFactor;
      this._isStateInvalid = true;
    }
  };
  _proto.setBlendConstants = function setBlendConstants(blendConstants) {
    var cache = this._curDynamicStates.blendConstant;
    if (cache.x !== blendConstants.x || cache.y !== blendConstants.y || cache.z !== blendConstants.z || cache.w !== blendConstants.w) {
      cache.copy(blendConstants);
      this._isStateInvalid = true;
    }
  };
  _proto.setDepthBound = function setDepthBound(minDepthBounds, maxDepthBounds) {
    var cache = this._curDynamicStates;
    if (cache.depthMinBounds !== minDepthBounds || cache.depthMaxBounds !== maxDepthBounds) {
      cache.depthMinBounds = minDepthBounds;
      cache.depthMaxBounds = maxDepthBounds;
      this._isStateInvalid = true;
    }
  };
  _proto.setStencilWriteMask = function setStencilWriteMask(face, writeMask) {
    var front = this._curDynamicStates.stencilStatesFront;
    var back = this._curDynamicStates.stencilStatesBack;
    if (face & StencilFace.FRONT) {
      if (front.writeMask !== writeMask) {
        front.writeMask = writeMask;
        this._isStateInvalid = true;
      }
    }
    if (face & StencilFace.BACK) {
      if (back.writeMask !== writeMask) {
        back.writeMask = writeMask;
        this._isStateInvalid = true;
      }
    }
  };
  _proto.setStencilCompareMask = function setStencilCompareMask(face, reference, compareMask) {
    var front = this._curDynamicStates.stencilStatesFront;
    var back = this._curDynamicStates.stencilStatesBack;
    if (face & StencilFace.FRONT) {
      if (front.compareMask !== compareMask || front.reference !== reference) {
        front.reference = reference;
        front.compareMask = compareMask;
        this._isStateInvalid = true;
      }
    }
    if (face & StencilFace.BACK) {
      if (back.compareMask !== compareMask || back.reference !== reference) {
        back.reference = reference;
        back.compareMask = compareMask;
        this._isStateInvalid = true;
      }
    }
  };
  _proto.draw = function draw(infoOrAssembler) {
    errorID(16328);
  };
  _proto.updateBuffer = function updateBuffer(buffer, data, size) {
    errorID(16329);
  };
  _proto.copyBuffersToTexture = function copyBuffersToTexture(buffers, texture, regions) {
    errorID(16330);
  };
  _proto.execute = function execute(cmdBuffs, count) {
    errorID(16402);
  };
  _proto.pipelineBarrier = function pipelineBarrier(GeneralBarrier, bufferBarriers, buffers, textureBarriers, textures) {};
  _proto.bindStates = function bindStates() {
    errorID(16401);
    this._isStateInvalid = false;
  };
  _proto.blitTexture = function blitTexture(srcTexture, dstTexture, regions, filter) {
    errorID(16401);
  };
  return WebGL2CommandBuffer;
}(CommandBuffer);

var WebGL2Framebuffer = function (_Framebuffer) {
  function WebGL2Framebuffer() {
    var _this;
    _this = _Framebuffer.call(this) || this;
    _this._gpuFramebuffer = null;
    _this._gpuColorViews = [];
    _this._gpuDepthStencilView = void 0;
    return _this;
  }
  _inheritsLoose(WebGL2Framebuffer, _Framebuffer);
  var _proto = WebGL2Framebuffer.prototype;
  _proto.getGpuFramebuffer = function getGpuFramebuffer() {
    return this._gpuFramebuffer;
  };
  _proto.initialize = function initialize(info) {
    var _this2 = this,
      _this$_gpuFramebuffer;
    this._renderPass = info.renderPass;
    this._colorTextures = info.colorTextures || [];
    this._depthStencilTexture = info.depthStencilTexture || null;
    var gpuColorViews = [];
    for (var i = 0; i < info.colorTextures.length; i++) {
      var colorTexture = info.colorTextures[i];
      if (colorTexture) {
        gpuColorViews.push(colorTexture.gpuTextureView);
      }
    }
    var gpuDepthStencilView = null;
    if (info.depthStencilTexture) {
      gpuDepthStencilView = info.depthStencilTexture.gpuTextureView;
    }
    var width = Number.MAX_SAFE_INTEGER;
    var height = Number.MAX_SAFE_INTEGER;
    this._gpuFramebuffer = {
      gpuRenderPass: info.renderPass.getGpuRenderPass(),
      gpuColorViews: gpuColorViews,
      gpuDepthStencilView: gpuDepthStencilView,
      glFramebuffer: null,
      isOffscreen: true,
      get width() {
        if (this.gpuColorViews.length > 0) {
          return this.gpuColorViews[0].gpuTexture.width;
        } else if (this.gpuDepthStencilView) {
          return this.gpuDepthStencilView.gpuTexture.width;
        }
        return width;
      },
      set width(val) {
        width = val;
      },
      get height() {
        if (this.gpuColorViews.length > 0) {
          return this.gpuColorViews[0].gpuTexture.height;
        } else if (this.gpuDepthStencilView) {
          return this.gpuDepthStencilView.gpuTexture.height;
        }
        return height;
      },
      set height(val) {
        height = val;
      }
    };
    WebGL2CmdFuncCreateFramebuffer(WebGL2DeviceManager.instance, this._gpuFramebuffer);
    this._gpuFramebuffer.gpuColorViews.forEach(function (tex) {
      return _this2._gpuColorViews.push(tex.gpuTexture.glTexture);
    });
    this._gpuDepthStencilView = (_this$_gpuFramebuffer = this._gpuFramebuffer.gpuDepthStencilView) == null ? void 0 : _this$_gpuFramebuffer.gpuTexture.glTexture;
    this._width = this._gpuFramebuffer.width;
    this._height = this._gpuFramebuffer.height;
  };
  _proto.destroy = function destroy() {
    if (this._gpuFramebuffer) {
      WebGL2CmdFuncDestroyFramebuffer(WebGL2DeviceManager.instance, this._gpuFramebuffer);
      this._gpuFramebuffer = null;
      this._gpuColorViews.length = 0;
      this._gpuDepthStencilView = null;
    }
  };
  return _createClass(WebGL2Framebuffer, [{
    key: "needRebuild",
    get: function get() {
      var gpuFramebuffer = this.getGpuFramebuffer();
      if (gpuFramebuffer) {
        var _gpuFramebuffer$gpuDe;
        for (var i = 0; i < gpuFramebuffer.gpuColorViews.length; i++) {
          if (gpuFramebuffer.gpuColorViews[i].gpuTexture.glTexture !== this._gpuColorViews[i]) {
            return true;
          }
        }
        if (((_gpuFramebuffer$gpuDe = gpuFramebuffer.gpuDepthStencilView) == null ? void 0 : _gpuFramebuffer$gpuDe.gpuTexture.glTexture) !== this._gpuDepthStencilView) {
          return true;
        }
      }
      return false;
    }
  }]);
}(Framebuffer);

var WebGL2InputAssembler = function (_InputAssembler) {
  function WebGL2InputAssembler() {
    var _this;
    _this = _InputAssembler.call(this) || this;
    _this._gpuInputAssembler = null;
    return _this;
  }
  _inheritsLoose(WebGL2InputAssembler, _InputAssembler);
  var _proto = WebGL2InputAssembler.prototype;
  _proto.initialize = function initialize(info) {
    if (info.vertexBuffers.length === 0) {
      errorID(16331);
      return;
    }
    this._attributes = info.attributes;
    this._attributesHash = this.computeAttributesHash();
    this._vertexBuffers = info.vertexBuffers;
    if (info.indexBuffer) {
      this._indexBuffer = info.indexBuffer;
      this._drawInfo.indexCount = this._indexBuffer.size / this._indexBuffer.stride;
      this._drawInfo.firstIndex = 0;
    } else {
      var vertBuff = this._vertexBuffers[0];
      this._drawInfo.vertexCount = vertBuff.size / vertBuff.stride;
      this._drawInfo.firstVertex = 0;
      this._drawInfo.vertexOffset = 0;
    }
    this._drawInfo.instanceCount = 0;
    this._drawInfo.firstInstance = 0;
    this._indirectBuffer = info.indirectBuffer || null;
    var gpuVertexBuffers = new Array(info.vertexBuffers.length);
    for (var i = 0; i < info.vertexBuffers.length; ++i) {
      var vb = info.vertexBuffers[i];
      if (vb.getGpuBuffer()) {
        gpuVertexBuffers[i] = vb.getGpuBuffer();
      }
    }
    var gpuIndexBuffer = null;
    var glIndexType = 0;
    if (info.indexBuffer) {
      gpuIndexBuffer = info.indexBuffer.getGpuBuffer();
      if (gpuIndexBuffer) {
        switch (gpuIndexBuffer.stride) {
          case 1:
            glIndexType = WebGLConstants.UNSIGNED_BYTE;
            break;
          case 2:
            glIndexType = WebGLConstants.UNSIGNED_SHORT;
            break;
          case 4:
            glIndexType = WebGLConstants.UNSIGNED_INT;
            break;
          default:
            {
              errorID(16332);
            }
        }
      }
    }
    var gpuIndirectBuffer = null;
    if (info.indirectBuffer) {
      gpuIndirectBuffer = info.indirectBuffer.getGpuBuffer();
    }
    this._gpuInputAssembler = {
      attributes: info.attributes,
      gpuVertexBuffers: gpuVertexBuffers,
      gpuIndexBuffer: gpuIndexBuffer,
      gpuIndirectBuffer: gpuIndirectBuffer,
      glAttribs: [],
      glIndexType: glIndexType,
      glVAOs: new Map()
    };
    WebGL2CmdFuncCreateInputAssember(WebGL2DeviceManager.instance, this._gpuInputAssembler);
  };
  _proto.destroy = function destroy() {
    var device = WebGL2DeviceManager.instance;
    if (this._gpuInputAssembler && device.extensions.useVAO) {
      WebGL2CmdFuncDestroyInputAssembler(device, this._gpuInputAssembler);
    }
    this._gpuInputAssembler = null;
  };
  return _createClass(WebGL2InputAssembler, [{
    key: "gpuInputAssembler",
    get: function get() {
      return this._gpuInputAssembler;
    }
  }]);
}(InputAssembler);

var WebGL2DescriptorSetLayout = function (_DescriptorSetLayout) {
  function WebGL2DescriptorSetLayout() {
    var _this;
    _this = _DescriptorSetLayout.call(this) || this;
    _this._gpuDescriptorSetLayout = null;
    return _this;
  }
  _inheritsLoose(WebGL2DescriptorSetLayout, _DescriptorSetLayout);
  var _proto = WebGL2DescriptorSetLayout.prototype;
  _proto.getGpuDescriptorSetLayout = function getGpuDescriptorSetLayout() {
    return this._gpuDescriptorSetLayout;
  };
  _proto.initialize = function initialize(info) {
    Array.prototype.push.apply(this._bindings, info.bindings);
    var descriptorCount = 0;
    var maxBinding = -1;
    var flattenedIndices = [];
    for (var i = 0; i < this._bindings.length; i++) {
      var binding = this._bindings[i];
      flattenedIndices.push(descriptorCount);
      descriptorCount += binding.count;
      if (binding.binding > maxBinding) maxBinding = binding.binding;
    }
    this._bindingIndices = Array(maxBinding + 1).fill(-1);
    var descriptorIndices = this._descriptorIndices = Array(maxBinding + 1).fill(-1);
    for (var _i = 0; _i < this._bindings.length; _i++) {
      var _binding = this._bindings[_i];
      this._bindingIndices[_binding.binding] = _i;
      descriptorIndices[_binding.binding] = flattenedIndices[_i];
    }
    var dynamicBindings = [];
    for (var _i2 = 0; _i2 < this._bindings.length; _i2++) {
      var _binding2 = this._bindings[_i2];
      if (_binding2.descriptorType & DESCRIPTOR_DYNAMIC_TYPE) {
        for (var j = 0; j < _binding2.count; j++) {
          dynamicBindings.push(_binding2.binding);
        }
      }
    }
    this._gpuDescriptorSetLayout = {
      bindings: this._bindings,
      dynamicBindings: dynamicBindings,
      descriptorIndices: descriptorIndices,
      descriptorCount: descriptorCount
    };
  };
  _proto.destroy = function destroy() {
    this._bindings.length = 0;
  };
  return WebGL2DescriptorSetLayout;
}(DescriptorSetLayout);

var WebGL2PipelineLayout = function (_PipelineLayout) {
  function WebGL2PipelineLayout() {
    var _this;
    _this = _PipelineLayout.call(this) || this;
    _this._gpuPipelineLayout = null;
    return _this;
  }
  _inheritsLoose(WebGL2PipelineLayout, _PipelineLayout);
  var _proto = WebGL2PipelineLayout.prototype;
  _proto.getGpuPipelineLayout = function getGpuPipelineLayout() {
    return this._gpuPipelineLayout;
  };
  _proto.initialize = function initialize(info) {
    Array.prototype.push.apply(this._setLayouts, info.setLayouts);
    var dynamicOffsetIndices = [];
    var gpuSetLayouts = [];
    var dynamicOffsetCount = 0;
    var dynamicOffsetOffsets = [];
    for (var i = 0; i < this._setLayouts.length; i++) {
      var setLayout = this._setLayouts[i];
      var gpuDescriptorSetLayout = setLayout.getGpuDescriptorSetLayout();
      var dynamicBindings = gpuDescriptorSetLayout.dynamicBindings;
      var indices = Array(setLayout.bindingIndices.length).fill(-1);
      for (var j = 0; j < dynamicBindings.length; j++) {
        var binding = dynamicBindings[j];
        if (indices[binding] < 0) indices[binding] = dynamicOffsetCount + j;
      }
      gpuSetLayouts.push(gpuDescriptorSetLayout);
      dynamicOffsetIndices.push(indices);
      dynamicOffsetOffsets.push(dynamicOffsetCount);
      dynamicOffsetCount += dynamicBindings.length;
    }
    this._gpuPipelineLayout = {
      gpuSetLayouts: gpuSetLayouts,
      dynamicOffsetIndices: dynamicOffsetIndices,
      dynamicOffsetCount: dynamicOffsetCount,
      dynamicOffsetOffsets: dynamicOffsetOffsets
    };
  };
  _proto.destroy = function destroy() {
    this._setLayouts.length = 0;
  };
  return WebGL2PipelineLayout;
}(PipelineLayout);

var WebGLPrimitives = [WebGLConstants.POINTS, WebGLConstants.LINES, WebGLConstants.LINE_STRIP, WebGLConstants.LINE_LOOP, WebGLConstants.NONE, WebGLConstants.NONE, WebGLConstants.NONE, WebGLConstants.TRIANGLES, WebGLConstants.TRIANGLE_STRIP, WebGLConstants.TRIANGLE_FAN, WebGLConstants.NONE, WebGLConstants.NONE, WebGLConstants.NONE, WebGLConstants.NONE];
var WebGL2PipelineState = function (_PipelineState) {
  function WebGL2PipelineState() {
    var _this;
    _this = _PipelineState.call(this) || this;
    _this._gpuPipelineState = null;
    return _this;
  }
  _inheritsLoose(WebGL2PipelineState, _PipelineState);
  var _proto = WebGL2PipelineState.prototype;
  _proto.initialize = function initialize(info) {
    this._primitive = info.primitive;
    this._shader = info.shader;
    this._pipelineLayout = info.pipelineLayout;
    var bs = this._bs;
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
    Object.assign(this._rs, info.rasterizerState);
    Object.assign(this._dss, info.depthStencilState);
    this._is = info.inputState;
    this._renderPass = info.renderPass;
    this._dynamicStates = info.dynamicStates;
    var dynamicStates = [];
    for (var i = 0; i < 31; i++) {
      if (this._dynamicStates & 1 << i) {
        dynamicStates.push(1 << i);
      }
    }
    this._gpuPipelineState = {
      glPrimitive: WebGLPrimitives[info.primitive],
      gpuShader: info.shader.gpuShader,
      gpuPipelineLayout: info.pipelineLayout.getGpuPipelineLayout(),
      rs: info.rasterizerState,
      dss: info.depthStencilState,
      bs: info.blendState,
      gpuRenderPass: info.renderPass.getGpuRenderPass(),
      dynamicStates: dynamicStates
    };
  };
  _proto.destroy = function destroy() {
    this._gpuPipelineState = null;
  };
  return _createClass(WebGL2PipelineState, [{
    key: "gpuPipelineState",
    get: function get() {
      return this._gpuPipelineState;
    }
  }]);
}(PipelineState);

var currGPUFBO;
var textureBlit = new TextureBlit();
var WebGL2PrimaryCommandBuffer = function (_WebGL2CommandBuffer) {
  function WebGL2PrimaryCommandBuffer() {
    return _WebGL2CommandBuffer.call(this) || this;
  }
  _inheritsLoose(WebGL2PrimaryCommandBuffer, _WebGL2CommandBuffer);
  var _proto = WebGL2PrimaryCommandBuffer.prototype;
  _proto.beginRenderPass = function beginRenderPass(renderPass, framebuffer, renderArea, clearColors, clearDepth, clearStencil) {
    currGPUFBO = framebuffer.getGpuFramebuffer();
    WebGL2CmdFuncBeginRenderPass(WebGL2DeviceManager.instance, renderPass.getGpuRenderPass(), currGPUFBO, renderArea, clearColors, clearDepth, clearStencil);
    this._isInRenderPass = true;
  };
  _proto.endRenderPass = function endRenderPass() {
    _WebGL2CommandBuffer.prototype.endRenderPass.call(this);
    if (currGPUFBO) {
      var colorViews = currGPUFBO.gpuColorViews;
      for (var _iterator = _createForOfIteratorHelperLoose(colorViews), _step; !(_step = _iterator()).done;) {
        var colorView = _step.value;
        if (colorView.gpuTexture.resolveTex) {
          textureBlit.srcExtent.width = currGPUFBO.width;
          textureBlit.srcExtent.height = currGPUFBO.height;
          textureBlit.dstExtent.width = currGPUFBO.width;
          textureBlit.dstExtent.height = currGPUFBO.height;
          WebGL2CmdFuncBlitTexture(WebGL2DeviceManager.instance, colorView.gpuTexture, colorView.gpuTexture.resolveTex, [textureBlit], Filter.LINEAR);
        }
      }
    }
  };
  _proto.draw = function draw(infoOrAssembler) {
    if (this._isInRenderPass) {
      if (this._isStateInvalid) {
        this.bindStates();
      }
      var info = 'drawInfo' in infoOrAssembler ? infoOrAssembler.drawInfo : infoOrAssembler;
      WebGL2CmdFuncDraw(WebGL2DeviceManager.instance, info);
      ++this._numDrawCalls;
      this._numInstances += info.instanceCount;
      var indexCount = info.indexCount || info.vertexCount;
      if (this._curGPUPipelineState) {
        var glPrimitive = this._curGPUPipelineState.glPrimitive;
        switch (glPrimitive) {
          case 0x0004:
            {
              this._numTris += indexCount / 3 * Math.max(info.instanceCount, 1);
              break;
            }
          case 0x0005:
          case 0x0006:
            {
              this._numTris += (indexCount - 2) * Math.max(info.instanceCount, 1);
              break;
            }
        }
      }
    } else {
      errorID(16328);
    }
  };
  _proto.setViewport = function setViewport(viewport) {
    var gl = WebGL2DeviceManager.instance.gl;
    var cache = WebGL2DeviceManager.instance.getStateCache();
    if (cache.viewport.left !== viewport.left || cache.viewport.top !== viewport.top || cache.viewport.width !== viewport.width || cache.viewport.height !== viewport.height) {
      gl.viewport(viewport.left, viewport.top, viewport.width, viewport.height);
      cache.viewport.left = viewport.left;
      cache.viewport.top = viewport.top;
      cache.viewport.width = viewport.width;
      cache.viewport.height = viewport.height;
    }
  };
  _proto.setScissor = function setScissor(scissor) {
    var gl = WebGL2DeviceManager.instance.gl;
    var cache = WebGL2DeviceManager.instance.getStateCache();
    if (cache.scissorRect.x !== scissor.x || cache.scissorRect.y !== scissor.y || cache.scissorRect.width !== scissor.width || cache.scissorRect.height !== scissor.height) {
      gl.scissor(scissor.x, scissor.y, scissor.width, scissor.height);
      cache.scissorRect.x = scissor.x;
      cache.scissorRect.y = scissor.y;
      cache.scissorRect.width = scissor.width;
      cache.scissorRect.height = scissor.height;
    }
  };
  _proto.updateBuffer = function updateBuffer(buffer, data, size) {
    if (!this._isInRenderPass) {
      var gpuBuffer = buffer.getGpuBuffer();
      if (gpuBuffer) {
        var buffSize;
        if (size !== undefined) {
          buffSize = size;
        } else if (buffer.usage & BufferUsageBit.INDIRECT) {
          buffSize = 0;
        } else {
          buffSize = data.byteLength;
        }
        WebGL2CmdFuncUpdateBuffer(WebGL2DeviceManager.instance, gpuBuffer, data, 0, buffSize);
      }
    } else {
      errorID(16329);
    }
  };
  _proto.copyBuffersToTexture = function copyBuffersToTexture(buffers, texture, regions) {
    if (!this._isInRenderPass) {
      var gpuTexture = texture.gpuTexture;
      if (gpuTexture) {
        WebGL2CmdFuncCopyBuffersToTexture(WebGL2DeviceManager.instance, buffers, gpuTexture, regions);
      }
    } else {
      errorID(16330);
    }
  };
  _proto.execute = function execute(cmdBuffs, count) {
    errorID(16402);
  };
  _proto.bindStates = function bindStates() {
    WebGL2CmdFuncBindStates(WebGL2DeviceManager.instance, this._curGPUPipelineState, this._curGPUInputAssembler, this._curGPUDescriptorSets, this._curDynamicOffsets, this._curDynamicStates);
    this._isStateInvalid = false;
  };
  _proto.blitTexture = function blitTexture(srcTexture, dstTexture, regions, filter) {
    var gpuTextureSrc = srcTexture.gpuTexture;
    var gpuTextureDst = dstTexture.gpuTexture;
    WebGL2CmdFuncBlitTexture(WebGL2DeviceManager.instance, gpuTextureSrc, gpuTextureDst, regions, filter);
  };
  return WebGL2PrimaryCommandBuffer;
}(WebGL2CommandBuffer);

var WebGL2Queue = function (_Queue) {
  function WebGL2Queue() {
    var _this;
    _this = _Queue.call(this) || this;
    _this.numDrawCalls = 0;
    _this.numInstances = 0;
    _this.numTris = 0;
    return _this;
  }
  _inheritsLoose(WebGL2Queue, _Queue);
  var _proto = WebGL2Queue.prototype;
  _proto.initialize = function initialize(info) {
    this._type = info.type;
  };
  _proto.destroy = function destroy() {};
  _proto.submit = function submit(cmdBuffs) {
    for (var i = 0; i < cmdBuffs.length; i++) {
      var cmdBuff = cmdBuffs[i];
      this.numDrawCalls += cmdBuff.numDrawCalls;
      this.numInstances += cmdBuff.numInstances;
      this.numTris += cmdBuff.numTris;
    }
  };
  _proto.clear = function clear() {
    this.numDrawCalls = 0;
    this.numInstances = 0;
    this.numTris = 0;
  };
  return WebGL2Queue;
}(Queue);

var WebGL2RenderPass = function (_RenderPass) {
  function WebGL2RenderPass() {
    var _this;
    _this = _RenderPass.call(this) || this;
    _this._gpuRenderPass = null;
    return _this;
  }
  _inheritsLoose(WebGL2RenderPass, _RenderPass);
  var _proto = WebGL2RenderPass.prototype;
  _proto.getGpuRenderPass = function getGpuRenderPass() {
    return this._gpuRenderPass;
  };
  _proto.initialize = function initialize(info) {
    this._colorInfos = info.colorAttachments;
    this._depthStencilInfo = info.depthStencilAttachment;
    this._subpasses = info.subpasses;
    this._gpuRenderPass = {
      colorAttachments: this._colorInfos,
      depthStencilAttachment: this._depthStencilInfo
    };
    this._hash = this.computeHash();
  };
  _proto.destroy = function destroy() {
    this._gpuRenderPass = null;
  };
  return WebGL2RenderPass;
}(RenderPass);

var WebGL2Sampler = function (_Sampler) {
  function WebGL2Sampler(info, hash) {
    var _this;
    _this = _Sampler.call(this, info, hash) || this;
    _this._gpuSampler = null;
    _this._gpuSampler = {
      glSamplers: new Map(),
      minFilter: _this._info.minFilter,
      magFilter: _this._info.magFilter,
      mipFilter: _this._info.mipFilter,
      addressU: _this._info.addressU,
      addressV: _this._info.addressV,
      addressW: _this._info.addressW,
      glMinFilter: 0,
      glMagFilter: 0,
      glWrapS: 0,
      glWrapT: 0,
      glWrapR: 0,
      getGLSampler: function getGLSampler(device, minLod, maxLod) {
        var gl = device.gl;
        var samplerHash = minLod << 16 | maxLod;
        if (!this.glSamplers.has(samplerHash)) {
          var glSampler = gl.createSampler();
          if (glSampler) {
            this.glSamplers.set(samplerHash, glSampler);
            var glSamplerParameteri = gl.samplerParameteri.bind(gl);
            var glSamplerParameterf = gl.samplerParameterf.bind(gl);
            glSamplerParameteri(glSampler, WebGLConstants.TEXTURE_MIN_FILTER, this.glMinFilter);
            glSamplerParameteri(glSampler, WebGLConstants.TEXTURE_MAG_FILTER, this.glMagFilter);
            glSamplerParameteri(glSampler, WebGLConstants.TEXTURE_WRAP_S, this.glWrapS);
            glSamplerParameteri(glSampler, WebGLConstants.TEXTURE_WRAP_T, this.glWrapT);
            glSamplerParameteri(glSampler, WebGLConstants.TEXTURE_WRAP_R, this.glWrapR);
            glSamplerParameterf(glSampler, WebGLConstants.TEXTURE_MIN_LOD, minLod);
            glSamplerParameterf(glSampler, WebGLConstants.TEXTURE_MAX_LOD, maxLod);
          }
        }
        var sampler = this.glSamplers.get(samplerHash);
        return sampler;
      }
    };
    WebGL2CmdFuncPrepareSamplerInfo(WebGL2DeviceManager.instance, _this._gpuSampler);
    return _this;
  }
  _inheritsLoose(WebGL2Sampler, _Sampler);
  var _proto = WebGL2Sampler.prototype;
  _proto.destroy = function destroy() {
    if (this._gpuSampler) {
      WebGL2CmdFuncDestroySampler(WebGL2DeviceManager.instance, this._gpuSampler);
      this._gpuSampler = null;
    }
  };
  return _createClass(WebGL2Sampler, [{
    key: "gpuSampler",
    get: function get() {
      return this._gpuSampler;
    }
  }]);
}(Sampler);

var WebGL2Shader = function (_Shader) {
  function WebGL2Shader() {
    var _this;
    _this = _Shader.call(this) || this;
    _this._gpuShader = null;
    return _this;
  }
  _inheritsLoose(WebGL2Shader, _Shader);
  var _proto = WebGL2Shader.prototype;
  _proto.initialize = function initialize(info) {
    this._name = info.name;
    this._stages = info.stages;
    this._attributes = info.attributes;
    this._blocks = info.blocks;
    this._samplers = info.samplers;
    this._gpuShader = {
      name: info.name,
      blocks: info.blocks.slice(),
      samplerTextures: info.samplerTextures.slice(),
      subpassInputs: info.subpassInputs.slice(),
      gpuStages: new Array(info.stages.length),
      glProgram: null,
      glInputs: [],
      glUniforms: [],
      glBlocks: [],
      glSamplerTextures: []
    };
    for (var i = 0; i < info.stages.length; ++i) {
      var stage = info.stages[i];
      this._gpuShader.gpuStages[i] = {
        type: stage.stage,
        source: stage.source,
        glShader: null
      };
    }
  };
  _proto.destroy = function destroy() {
    if (this._gpuShader) {
      WebGL2CmdFuncDestroyShader(WebGL2DeviceManager.instance, this._gpuShader);
      this._gpuShader = null;
    }
  };
  return _createClass(WebGL2Shader, [{
    key: "gpuShader",
    get: function get() {
      if (this._gpuShader.glProgram === null) {
        WebGL2CmdFuncCreateShader(WebGL2DeviceManager.instance, this._gpuShader);
      }
      return this._gpuShader;
    }
  }]);
}(Shader);

var WebGL2StateCache = function () {
  function WebGL2StateCache() {
    this.glArrayBuffer = null;
    this.glElementArrayBuffer = null;
    this.glUniformBuffer = null;
    this.glBindUBOs = [];
    this.glBindUBOOffsets = [];
    this.glVAO = null;
    this.texUnit = 0;
    this.glTexUnits = [];
    this.glSamplerUnits = [];
    this.glRenderbuffer = null;
    this.glFramebuffer = null;
    this.glReadFramebuffer = null;
    this.viewport = new Viewport();
    this.scissorRect = new Rect(0, 0, 0, 0);
    this.rs = new RasterizerState();
    this.dss = new DepthStencilState();
    this.bs = new BlendState();
    this.glProgram = null;
    this.glEnabledAttribLocs = [];
    this.glCurrentAttribLocs = [];
    this.texUnitCacheMap = {};
  }
  var _proto = WebGL2StateCache.prototype;
  _proto.initialize = function initialize(texUnit, bufferBindings, vertexAttributes) {
    for (var i = 0; i < texUnit; ++i) {
      var glTexUnit = {
        glTexture: null
      };
      this.glTexUnits.push(glTexUnit);
    }
    this.glSamplerUnits.length = texUnit;
    this.glSamplerUnits.fill(null);
    this.glBindUBOs.length = bufferBindings;
    this.glBindUBOs.fill(null);
    this.glBindUBOOffsets.length = bufferBindings;
    this.glBindUBOOffsets.fill(0);
    this.glEnabledAttribLocs.length = vertexAttributes;
    this.glEnabledAttribLocs.fill(false);
    this.glCurrentAttribLocs.length = vertexAttributes;
    this.glCurrentAttribLocs.fill(false);
  };
  return WebGL2StateCache;
}();

var WebGL2Texture = function (_Texture) {
  function WebGL2Texture() {
    var _this;
    _this = _Texture.call(this) || this;
    _this._gpuTexture = null;
    _this._gpuTextureView = null;
    return _this;
  }
  _inheritsLoose(WebGL2Texture, _Texture);
  var _proto = WebGL2Texture.prototype;
  _proto.initialize = function initialize(info, isSwapchainTexture) {
    var self = this;
    var instance = WebGL2DeviceManager.instance;
    var thisTextureInfo = self._info;
    var thisViewInfo = self._viewInfo;
    var texInfo = info;
    var viewInfo = info;
    if ('texture' in info) {
      texInfo = viewInfo.texture.info;
      self._isTextureView = true;
    }
    thisTextureInfo.copy(texInfo);
    self._isPowerOf2 = IsPowerOf2(thisTextureInfo.width) && IsPowerOf2(thisTextureInfo.height);
    self._size = FormatSurfaceSize(thisTextureInfo.format, self.width, self.height, self.depth, thisTextureInfo.levelCount) * thisTextureInfo.layerCount;
    if (!self._isTextureView) {
      self._gpuTexture = {
        type: texInfo.type,
        format: texInfo.format,
        usage: texInfo.usage,
        width: texInfo.width,
        height: texInfo.height,
        depth: texInfo.depth,
        size: self._size,
        arrayLayer: texInfo.layerCount,
        mipLevel: texInfo.levelCount,
        samples: texInfo.samples,
        flags: texInfo.flags,
        isPowerOf2: self._isPowerOf2,
        resolveTex: null,
        glTarget: 0,
        glInternalFmt: 0,
        glFormat: 0,
        glType: 0,
        glUsage: 0,
        glTexture: null,
        glRenderbuffer: null,
        glWrapS: 0,
        glWrapT: 0,
        glMinFilter: 0,
        glMagFilter: 0,
        isSwapchainTexture: isSwapchainTexture || false
      };
      if (!self._gpuTexture.isSwapchainTexture) {
        WebGL2CmdFuncCreateTexture(instance, self._gpuTexture);
        instance.memoryStatus.textureSize += self._size;
      }
      thisViewInfo.texture = self;
      thisViewInfo.type = info.type;
      thisViewInfo.format = info.format;
      thisViewInfo.baseLevel = 0;
      thisViewInfo.levelCount = info.levelCount;
      thisViewInfo.baseLayer = 0;
      thisViewInfo.layerCount = info.layerCount;
      self._gpuTextureView = {
        gpuTexture: self._gpuTexture,
        type: thisViewInfo.type,
        format: thisViewInfo.format,
        baseLevel: thisViewInfo.baseLevel,
        levelCount: thisViewInfo.levelCount
      };
    } else {
      var _self$_gpuTexture;
      thisViewInfo.copy(viewInfo);
      self._gpuTexture = viewInfo.texture._gpuTexture;
      if (((_self$_gpuTexture = self._gpuTexture) == null ? void 0 : _self$_gpuTexture.format) !== texInfo.format) {
        logID(16403);
        return;
      }
      self._gpuTextureView = {
        gpuTexture: self._gpuTexture,
        type: viewInfo.type,
        format: viewInfo.format,
        baseLevel: viewInfo.baseLevel,
        levelCount: viewInfo.levelCount
      };
    }
  };
  _proto.destroy = function destroy() {
    var self = this;
    var instance = WebGL2DeviceManager.instance;
    if (!self._isTextureView && self._gpuTexture) {
      WebGL2CmdFuncDestroyTexture(instance, self._gpuTexture);
      instance.memoryStatus.textureSize -= self._size;
      self._gpuTexture = null;
    }
  };
  _proto.getTextureHandle = function getTextureHandle() {
    var gpuTexture = this._gpuTexture;
    if (!gpuTexture) {
      return 0;
    }
    if (gpuTexture.glTexture) {
      return gpuTexture.glTexture;
    } else if (gpuTexture.glRenderbuffer) {
      return gpuTexture.glRenderbuffer;
    }
    return 0;
  };
  _proto.resize = function resize(width, height) {
    var self = this;
    var instance = WebGL2DeviceManager.instance;
    var thisTextureInfo = self._info;
    if (thisTextureInfo.width === width && thisTextureInfo.height === height) {
      return;
    }
    if (thisTextureInfo.levelCount === WebGL2Texture.getLevelCount(thisTextureInfo.width, thisTextureInfo.height)) {
      thisTextureInfo.levelCount = WebGL2Texture.getLevelCount(width, height);
    } else if (thisTextureInfo.levelCount > 1) {
      thisTextureInfo.levelCount = Math.min(thisTextureInfo.levelCount, WebGL2Texture.getLevelCount(width, height));
    }
    var oldSize = self._size;
    thisTextureInfo.width = width;
    thisTextureInfo.height = height;
    self._size = FormatSurfaceSize(thisTextureInfo.format, self.width, self.height, self.depth, thisTextureInfo.levelCount) * thisTextureInfo.layerCount;
    var thisGpuTexture = self._gpuTexture;
    if (!self._isTextureView && thisGpuTexture) {
      thisGpuTexture.width = width;
      thisGpuTexture.height = height;
      thisGpuTexture.size = self._size;
      if (!thisGpuTexture.isSwapchainTexture) {
        WebGL2CmdFuncResizeTexture(instance, thisGpuTexture);
        instance.memoryStatus.textureSize -= oldSize;
        instance.memoryStatus.textureSize += self._size;
      }
    }
  };
  _proto.initAsSwapchainTexture = function initAsSwapchainTexture(info) {
    var texInfo = new TextureInfo();
    texInfo.format = info.format;
    texInfo.usage = FormatInfos[info.format].hasDepth ? TextureUsageBit.DEPTH_STENCIL_ATTACHMENT : TextureUsageBit.COLOR_ATTACHMENT;
    texInfo.width = info.width;
    texInfo.height = info.height;
    this.initialize(texInfo, true);
  };
  return _createClass(WebGL2Texture, [{
    key: "gpuTexture",
    get: function get() {
      return this._gpuTexture;
    }
  }, {
    key: "gpuTextureView",
    get: function get() {
      return this._gpuTextureView;
    }
  }]);
}(Texture);

var eventWebGLContextLost = 'webglcontextlost';
function initStates(gl) {
  gl.activeTexture(WebGLConstants.TEXTURE0);
  gl.pixelStorei(WebGLConstants.PACK_ALIGNMENT, 1);
  gl.pixelStorei(WebGLConstants.UNPACK_ALIGNMENT, 1);
  gl.pixelStorei(WebGLConstants.UNPACK_FLIP_Y_WEBGL, false);
  gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, null);
  gl.enable(WebGLConstants.SCISSOR_TEST);
  gl.enable(WebGLConstants.CULL_FACE);
  gl.cullFace(WebGLConstants.BACK);
  gl.frontFace(WebGLConstants.CCW);
  gl.polygonOffset(0.0, 0.0);
  gl.enable(WebGLConstants.DEPTH_TEST);
  gl.depthMask(true);
  gl.depthFunc(WebGLConstants.LESS);
  gl.stencilFuncSeparate(WebGLConstants.FRONT, WebGLConstants.ALWAYS, 1, 0xffff);
  gl.stencilOpSeparate(WebGLConstants.FRONT, WebGLConstants.KEEP, WebGLConstants.KEEP, WebGLConstants.KEEP);
  gl.stencilMaskSeparate(WebGLConstants.FRONT, 0xffff);
  gl.stencilFuncSeparate(WebGLConstants.BACK, WebGLConstants.ALWAYS, 1, 0xffff);
  gl.stencilOpSeparate(WebGLConstants.BACK, WebGLConstants.KEEP, WebGLConstants.KEEP, WebGLConstants.KEEP);
  gl.stencilMaskSeparate(WebGLConstants.BACK, 0xffff);
  gl.disable(WebGLConstants.STENCIL_TEST);
  gl.disable(WebGLConstants.SAMPLE_ALPHA_TO_COVERAGE);
  gl.disable(WebGLConstants.BLEND);
  gl.blendEquationSeparate(WebGLConstants.FUNC_ADD, WebGLConstants.FUNC_ADD);
  gl.blendFuncSeparate(WebGLConstants.ONE, WebGLConstants.ZERO, WebGLConstants.ONE, WebGLConstants.ZERO);
  gl.colorMask(true, true, true, true);
  gl.blendColor(0.0, 0.0, 0.0, 0.0);
}
function getExtension(gl, ext) {
  var prefixes = ['', 'WEBKIT_', 'MOZ_'];
  for (var i = 0; i < prefixes.length; ++i) {
    var _ext = gl.getExtension(prefixes[i] + ext);
    if (_ext) {
      return _ext;
    }
  }
  return null;
}
function getExtensions(gl) {
  var res = {
    EXT_texture_filter_anisotropic: getExtension(gl, 'EXT_texture_filter_anisotropic'),
    EXT_color_buffer_half_float: getExtension(gl, 'EXT_color_buffer_half_float'),
    EXT_color_buffer_float: getExtension(gl, 'EXT_color_buffer_float'),
    WEBGL_compressed_texture_etc1: getExtension(gl, 'WEBGL_compressed_texture_etc1'),
    WEBGL_compressed_texture_etc: getExtension(gl, 'WEBGL_compressed_texture_etc'),
    WEBGL_compressed_texture_pvrtc: getExtension(gl, 'WEBGL_compressed_texture_pvrtc'),
    WEBGL_compressed_texture_astc: getExtension(gl, 'WEBGL_compressed_texture_astc'),
    WEBGL_compressed_texture_s3tc: getExtension(gl, 'WEBGL_compressed_texture_s3tc'),
    WEBGL_compressed_texture_s3tc_srgb: getExtension(gl, 'WEBGL_compressed_texture_s3tc_srgb'),
    WEBGL_debug_shaders: getExtension(gl, 'WEBGL_debug_shaders'),
    WEBGL_lose_context: getExtension(gl, 'WEBGL_lose_context'),
    WEBGL_debug_renderer_info: getExtension(gl, 'WEBGL_debug_renderer_info'),
    OES_texture_half_float_linear: getExtension(gl, 'OES_texture_half_float_linear'),
    OES_texture_float_linear: getExtension(gl, 'OES_texture_float_linear'),
    WEBGL_multi_draw: null,
    useVAO: true
  };
  {
    if (systemInfo.os !== OS.ANDROID && systemInfo.os !== OS.IOS) {
      res.WEBGL_multi_draw = getExtension(gl, 'WEBGL_multi_draw');
    }
  }
  return res;
}
function getContext(canvas) {
  var context = null;
  try {
    var _globalThis$__globalX;
    if (USE_XR && (_globalThis$__globalX = globalThis.__globalXR) != null && _globalThis$__globalX.webxrCompatible) {
      var glAttribs = {
        alpha: macro.ENABLE_TRANSPARENT_CANVAS,
        antialias: EDITOR || macro.ENABLE_WEBGL_ANTIALIAS,
        depth: true,
        stencil: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
        xrCompatible: true
      };
      context = canvas.getContext('webgl2', glAttribs);
      return context;
    }
    var webGLCtxAttribs = {
      alpha: macro.ENABLE_TRANSPARENT_CANVAS,
      antialias: EDITOR || macro.ENABLE_WEBGL_ANTIALIAS,
      depth: true,
      stencil: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false
    };
    context = canvas.getContext('webgl2', webGLCtxAttribs);
  } catch (err) {
    return null;
  }
  return context;
}
var WebGL2Swapchain = function (_Swapchain) {
  function WebGL2Swapchain() {
    var _this;
    _this = _Swapchain.call(this) || this;
    _this.stateCache = new WebGL2StateCache();
    _this.nullTex2D = null;
    _this.nullTexCube = null;
    _this._canvas = null;
    _this._webGL2ContextLostHandler = null;
    _this._extensions = null;
    _this._blitManager = null;
    return _this;
  }
  _inheritsLoose(WebGL2Swapchain, _Swapchain);
  var _proto = WebGL2Swapchain.prototype;
  _proto.initialize = function initialize(info) {
    var self = this;
    self._canvas = info.windowHandle;
    self._webGL2ContextLostHandler = self._onWebGLContextLost.bind(self);
    self._canvas.addEventListener(eventWebGLContextLost, self._onWebGLContextLost);
    var instance = WebGL2DeviceManager.instance;
    var gl = instance.gl,
      capabilities = instance.capabilities;
    self.stateCache.initialize(capabilities.maxTextureUnits, capabilities.maxUniformBufferBindings, capabilities.maxVertexAttributes);
    self._extensions = getExtensions(gl);
    initStates(gl);
    var colorFmt = Format.RGBA8;
    var depthStencilFmt = Format.DEPTH_STENCIL;
    var depthBits = gl.getParameter(WebGLConstants.DEPTH_BITS);
    var stencilBits = gl.getParameter(WebGLConstants.STENCIL_BITS);
    if (depthBits && stencilBits) depthStencilFmt = Format.DEPTH_STENCIL;else if (depthBits) depthStencilFmt = Format.DEPTH;
    self._colorTexture = new WebGL2Texture();
    self._colorTexture.initAsSwapchainTexture({
      swapchain: self,
      format: colorFmt,
      width: info.width,
      height: info.height
    });
    self._depthStencilTexture = new WebGL2Texture();
    self._depthStencilTexture.initAsSwapchainTexture({
      swapchain: self,
      format: depthStencilFmt,
      width: info.width,
      height: info.height
    });
    self.nullTex2D = instance.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.SAMPLED, Format.RGBA8, 2, 2, TextureFlagBit.NONE));
    self.nullTexCube = instance.createTexture(new TextureInfo(TextureType.CUBE, TextureUsageBit.SAMPLED, Format.RGBA8, 2, 2, TextureFlagBit.NONE, 6));
    var nullTexRegion = new BufferTextureCopy();
    nullTexRegion.texExtent.width = 2;
    nullTexRegion.texExtent.height = 2;
    var nullTexBuff = new Uint8Array(self.nullTex2D.size);
    nullTexBuff.fill(0);
    instance.copyBuffersToTexture([nullTexBuff], self.nullTex2D, [nullTexRegion]);
    nullTexRegion.texSubres.layerCount = 6;
    instance.copyBuffersToTexture([nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff], self.nullTexCube, [nullTexRegion]);
    self._blitManager = new IWebGL2BlitManager();
  };
  _proto.destroy = function destroy() {
    var self = this;
    if (self._canvas && self._webGL2ContextLostHandler) {
      self._canvas.removeEventListener(eventWebGLContextLost, self._webGL2ContextLostHandler);
      self._webGL2ContextLostHandler = null;
    }
    if (self.nullTex2D) {
      self.nullTex2D.destroy();
      self.nullTex2D = null;
    }
    if (self.nullTexCube) {
      self.nullTexCube.destroy();
      self.nullTexCube = null;
    }
    if (self._blitManager) {
      self._blitManager.destroy();
      self._blitManager = null;
    }
    self._extensions = null;
    self._canvas = null;
  };
  _proto.resize = function resize(width, height, surfaceTransform) {
    var self = this;
    if (self._colorTexture.width !== width || self._colorTexture.height !== height) {
      debug("Resizing swapchain: " + width + "x" + height);
      self._canvas.width = width;
      self._canvas.height = height;
      self._colorTexture.resize(width, height);
      self._depthStencilTexture.resize(width, height);
    }
  };
  _proto._onWebGLContextLost = function _onWebGLContextLost(event) {
    warnID(11000);
    warn(event);
  };
  return _createClass(WebGL2Swapchain, [{
    key: "extensions",
    get: function get() {
      return this._extensions;
    }
  }, {
    key: "blitManager",
    get: function get() {
      return this._blitManager;
    }
  }]);
}(Swapchain);

function setFormatFeature(formatFeatures, indexArray, feature) {
  for (var i = 0; i < indexArray.length; ++i) {
    formatFeatures[indexArray[i]] = feature;
  }
}
function setTextureExclusive(textureExclusive, indexArray, isExclusive) {
  for (var i = 0; i < indexArray.length; ++i) {
    textureExclusive[indexArray[i]] = isExclusive;
  }
}
var WebGL2Device = function (_Device) {
  function WebGL2Device() {
    var _this;
    _this = _Device.call(this) || this;
    _this._swapchain = null;
    _this._context = null;
    _this._bindingMappings = null;
    _this._textureExclusive = new Array(Format.COUNT);
    return _this;
  }
  _inheritsLoose(WebGL2Device, _Device);
  var _proto = WebGL2Device.prototype;
  _proto.getStateCache = function getStateCache() {
    return this._swapchain.stateCache;
  };
  _proto.initialize = function initialize(info) {
    WebGL2DeviceManager.setInstance(this);
    this._gfxAPI = API.WEBGL2;
    var mapping = this._bindingMappingInfo = info.bindingMappingInfo;
    var blockOffsets = [];
    var samplerTextureOffsets = [];
    var firstSet = mapping.setIndices[0];
    blockOffsets[firstSet] = 0;
    samplerTextureOffsets[firstSet] = 0;
    for (var i = 1; i < mapping.setIndices.length; ++i) {
      var curSet = mapping.setIndices[i];
      var prevSet = mapping.setIndices[i - 1];
      blockOffsets[curSet] = mapping.maxBlockCounts[prevSet] + blockOffsets[prevSet];
      samplerTextureOffsets[curSet] = mapping.maxSamplerTextureCounts[prevSet] + samplerTextureOffsets[prevSet];
    }
    for (var _i = 0; _i < mapping.setIndices.length; ++_i) {
      var _curSet = mapping.setIndices[_i];
      samplerTextureOffsets[_curSet] -= mapping.maxBlockCounts[_curSet];
    }
    this._bindingMappings = {
      blockOffsets: blockOffsets,
      samplerTextureOffsets: samplerTextureOffsets,
      flexibleSet: mapping.setIndices[mapping.setIndices.length - 1]
    };
    var gl = this._context = getContext(Device.canvas);
    if (!gl) {
      errorID(16405);
      return false;
    }
    this._queue = this.createQueue(new QueueInfo(QueueType.GRAPHICS));
    this._cmdBuff = this.createCommandBuffer(new CommandBufferInfo(this._queue));
    var glGetParameter = gl.getParameter.bind(gl);
    var caps = this._caps;
    caps.maxVertexAttributes = glGetParameter(WebGLConstants.MAX_VERTEX_ATTRIBS);
    caps.maxVertexUniformVectors = glGetParameter(WebGLConstants.MAX_VERTEX_UNIFORM_VECTORS);
    if (systemInfo.os === OS.IOS) {
      var maxVertexUniformVectors = caps.maxVertexUniformVectors;
      if (sys.browserType === BrowserType.WECHAT) {
        caps.maxVertexUniformVectors = maxVertexUniformVectors < 256 ? maxVertexUniformVectors : 256;
      } else if (sys.browserType === BrowserType.SAFARI) {
        caps.maxVertexUniformVectors = maxVertexUniformVectors < 512 ? maxVertexUniformVectors : 512;
      }
    }
    caps.maxFragmentUniformVectors = glGetParameter(WebGLConstants.MAX_FRAGMENT_UNIFORM_VECTORS);
    caps.maxTextureUnits = glGetParameter(WebGLConstants.MAX_TEXTURE_IMAGE_UNITS);
    caps.maxVertexTextureUnits = glGetParameter(WebGLConstants.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    caps.maxUniformBufferBindings = glGetParameter(WebGLConstants.MAX_UNIFORM_BUFFER_BINDINGS);
    caps.maxUniformBlockSize = glGetParameter(WebGLConstants.MAX_UNIFORM_BLOCK_SIZE);
    caps.maxTextureSize = glGetParameter(WebGLConstants.MAX_TEXTURE_SIZE);
    caps.maxCubeMapTextureSize = glGetParameter(WebGLConstants.MAX_CUBE_MAP_TEXTURE_SIZE);
    caps.maxArrayTextureLayers = glGetParameter(WebGLConstants.MAX_ARRAY_TEXTURE_LAYERS);
    caps.max3DTextureSize = glGetParameter(WebGLConstants.MAX_3D_TEXTURE_SIZE);
    caps.uboOffsetAlignment = glGetParameter(WebGLConstants.UNIFORM_BUFFER_OFFSET_ALIGNMENT);
    var extensions = gl.getSupportedExtensions();
    var extStr = '';
    if (extensions) {
      extensions.forEach(function (ext) {
        extStr += ext + " ";
      });
    }
    var exts = getExtensions(gl);
    if (exts.WEBGL_debug_renderer_info) {
      this._renderer = glGetParameter(exts.WEBGL_debug_renderer_info.UNMASKED_RENDERER_WEBGL);
      this._vendor = glGetParameter(exts.WEBGL_debug_renderer_info.UNMASKED_VENDOR_WEBGL);
    } else {
      this._renderer = glGetParameter(WebGLConstants.RENDERER);
      this._vendor = glGetParameter(WebGLConstants.VENDOR);
    }
    var version = glGetParameter(WebGLConstants.VERSION);
    var features = this._features;
    features.fill(false);
    this.initFormatFeatures(exts);
    features[Feature.ELEMENT_INDEX_UINT] = true;
    features[Feature.INSTANCED_ARRAYS] = true;
    features[Feature.MULTIPLE_RENDER_TARGETS] = true;
    features[Feature.BLEND_MINMAX] = true;
    var compressedFormat = '';
    if (this.getFormatFeatures(Format.ETC_RGB8)) {
      compressedFormat += 'etc1 ';
    }
    if (this.getFormatFeatures(Format.ETC2_RGB8)) {
      compressedFormat += 'etc2 ';
    }
    if (this.getFormatFeatures(Format.BC1)) {
      compressedFormat += 'dxt ';
    }
    if (this.getFormatFeatures(Format.PVRTC_RGB2)) {
      compressedFormat += 'pvrtc ';
    }
    if (this.getFormatFeatures(Format.ASTC_RGBA_4X4)) {
      compressedFormat += 'astc ';
    }
    debug('WebGL2 device initialized.');
    debug("RENDERER: " + this._renderer);
    debug("VENDOR: " + this._vendor);
    debug("VERSION: " + version);
    debug("COMPRESSED_FORMAT: " + compressedFormat);
    debug("EXTENSIONS: " + extStr);
    return true;
  };
  _proto.destroy = function destroy() {
    if (this._queue) {
      this._queue.destroy();
      this._queue = null;
    }
    if (this._cmdBuff) {
      this._cmdBuff.destroy();
      this._cmdBuff = null;
    }
    var it = this._samplers.values();
    var res = it.next();
    while (!res.done) {
      res.value.destroy();
      res = it.next();
    }
    this._swapchain = null;
  };
  _proto.flushCommands = function flushCommands(cmdBuffs) {};
  _proto.acquire = function acquire(swapchains) {};
  _proto.present = function present() {
    var queue = this._queue;
    this._numDrawCalls = queue.numDrawCalls;
    this._numInstances = queue.numInstances;
    this._numTris = queue.numTris;
    queue.clear();
  };
  _proto.initFormatFeatures = function initFormatFeatures(exts) {
    var formatFeatures = this._formatFeatures;
    var textureExclusive = this._textureExclusive;
    formatFeatures.fill(FormatFeatureBit.NONE);
    textureExclusive.fill(true);
    var tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.LINEAR_FILTER | FormatFeatureBit.VERTEX_ATTRIBUTE;
    setFormatFeature(formatFeatures, [Format.R8, Format.RG8, Format.RGB8, Format.RGBA8], tempFeature);
    tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    setFormatFeature(formatFeatures, [Format.R8SN, Format.RG8SN, Format.RGB8SN, Format.RGBA8SN, Format.R5G6B5, Format.RGBA4, Format.RGB5A1, Format.RGB10A2, Format.SRGB8, Format.SRGB8_A8, Format.R11G11B10F, Format.RGB9E5, Format.DEPTH, Format.DEPTH_STENCIL], tempFeature);
    formatFeatures[Format.RGB10A2UI] = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.VERTEX_ATTRIBUTE;
    setFormatFeature(formatFeatures, [Format.R16F, Format.RG16F, Format.RGB16F, Format.RGBA16F], tempFeature);
    tempFeature = FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.VERTEX_ATTRIBUTE;
    setFormatFeature(formatFeatures, [Format.R32F, Format.RG32F, Format.RGB32F, Format.RGBA32F], tempFeature);
    formatFeatures[Format.RGB10A2UI] = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER | FormatFeatureBit.VERTEX_ATTRIBUTE;
    setFormatFeature(formatFeatures, [Format.R8I, Format.R8UI, Format.R16I, Format.R16UI, Format.R32I, Format.R32UI, Format.RG8I, Format.RG8UI, Format.RG16I, Format.RG16UI, Format.RG32I, Format.RG32UI, Format.RGB8I, Format.RGB8UI, Format.RGB16I, Format.RGB16UI, Format.RGB32I, Format.RGB32UI, Format.RGBA8I, Format.RGBA8UI, Format.RGBA16I, Format.RGBA16UI, Format.RGBA32I, Format.RGBA32UI], tempFeature);
    setTextureExclusive(textureExclusive, [Format.R8, Format.RG8, Format.RGB8, Format.R5G6B5, Format.RGBA4, Format.RGB5A1, Format.RGBA8, Format.RGB10A2, Format.RGB10A2UI, Format.SRGB8_A8, Format.R8I, Format.R8UI, Format.R16I, Format.R16UI, Format.R32I, Format.R32UI, Format.RG8I, Format.RG8UI, Format.RG16I, Format.RG16UI, Format.RG32I, Format.RG32UI, Format.RGBA8I, Format.RGBA8UI, Format.RGBA16I, Format.RGBA16UI, Format.RGBA32I, Format.RGBA32UI, Format.DEPTH, Format.DEPTH_STENCIL], false);
    if (exts.EXT_color_buffer_float) {
      formatFeatures[Format.R32F] |= FormatFeatureBit.RENDER_TARGET;
      formatFeatures[Format.RG32F] |= FormatFeatureBit.RENDER_TARGET;
      formatFeatures[Format.RGBA32F] |= FormatFeatureBit.RENDER_TARGET;
      setTextureExclusive(textureExclusive, [Format.R32F, Format.RG32F, Format.RGBA32F], false);
    }
    if (exts.EXT_color_buffer_half_float) {
      setTextureExclusive(textureExclusive, [Format.R16F, Format.RG16F, Format.RGBA16F], false);
    }
    if (exts.OES_texture_float_linear) {
      formatFeatures[Format.RGB32F] |= FormatFeatureBit.LINEAR_FILTER;
      formatFeatures[Format.RGBA32F] |= FormatFeatureBit.LINEAR_FILTER;
      formatFeatures[Format.R32F] |= FormatFeatureBit.LINEAR_FILTER;
      formatFeatures[Format.RG32F] |= FormatFeatureBit.LINEAR_FILTER;
    }
    if (exts.OES_texture_half_float_linear) {
      formatFeatures[Format.RGB16F] |= FormatFeatureBit.LINEAR_FILTER;
      formatFeatures[Format.RGBA16F] |= FormatFeatureBit.LINEAR_FILTER;
      formatFeatures[Format.R16F] |= FormatFeatureBit.LINEAR_FILTER;
      formatFeatures[Format.RG16F] |= FormatFeatureBit.LINEAR_FILTER;
    }
    var compressedFeature = FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    if (exts.WEBGL_compressed_texture_etc1) {
      formatFeatures[Format.ETC_RGB8] = compressedFeature;
    }
    if (exts.WEBGL_compressed_texture_etc) {
      setFormatFeature(formatFeatures, [Format.ETC2_RGB8, Format.ETC2_RGBA8, Format.ETC2_SRGB8, Format.ETC2_SRGB8_A8, Format.ETC2_RGB8_A1, Format.ETC2_SRGB8_A1], compressedFeature);
    }
    if (exts.WEBGL_compressed_texture_s3tc) {
      setFormatFeature(formatFeatures, [Format.BC1, Format.BC1_ALPHA, Format.BC1_SRGB, Format.BC1_SRGB_ALPHA, Format.BC2, Format.BC2_SRGB, Format.BC3, Format.BC3_SRGB], compressedFeature);
    }
    if (exts.WEBGL_compressed_texture_pvrtc) {
      setFormatFeature(formatFeatures, [Format.PVRTC_RGB2, Format.PVRTC_RGBA2, Format.PVRTC_RGB4, Format.PVRTC_RGBA4], compressedFeature);
    }
    if (exts.WEBGL_compressed_texture_astc) {
      setFormatFeature(formatFeatures, [Format.ASTC_RGBA_4X4, Format.ASTC_RGBA_5X4, Format.ASTC_RGBA_5X5, Format.ASTC_RGBA_6X5, Format.ASTC_RGBA_6X6, Format.ASTC_RGBA_8X5, Format.ASTC_RGBA_8X6, Format.ASTC_RGBA_8X8, Format.ASTC_RGBA_10X5, Format.ASTC_RGBA_10X6, Format.ASTC_RGBA_10X8, Format.ASTC_RGBA_10X10, Format.ASTC_RGBA_12X10, Format.ASTC_RGBA_12X12, Format.ASTC_SRGBA_4X4, Format.ASTC_SRGBA_5X4, Format.ASTC_SRGBA_5X5, Format.ASTC_SRGBA_6X5, Format.ASTC_SRGBA_6X6, Format.ASTC_SRGBA_8X5, Format.ASTC_SRGBA_8X6, Format.ASTC_SRGBA_8X8, Format.ASTC_SRGBA_10X5, Format.ASTC_SRGBA_10X6, Format.ASTC_SRGBA_10X8, Format.ASTC_SRGBA_10X10, Format.ASTC_SRGBA_12X10, Format.ASTC_SRGBA_12X12], compressedFeature);
    }
  };
  _proto.createCommandBuffer = function createCommandBuffer(info) {
    var Ctor = info.type === CommandBufferType.PRIMARY ? WebGL2PrimaryCommandBuffer : WebGL2CommandBuffer;
    var cmdBuff = new Ctor();
    cmdBuff.initialize(info);
    return cmdBuff;
  };
  _proto.createSwapchain = function createSwapchain(info) {
    var swapchain = new WebGL2Swapchain();
    this._swapchain = swapchain;
    swapchain.initialize(info);
    return swapchain;
  };
  _proto.createBuffer = function createBuffer(info) {
    var buffer = new WebGL2Buffer();
    buffer.initialize(info);
    return buffer;
  };
  _proto.createTexture = function createTexture(info) {
    var texture = new WebGL2Texture();
    texture.initialize(info);
    return texture;
  };
  _proto.createDescriptorSet = function createDescriptorSet(info) {
    var descriptorSet = new WebGL2DescriptorSet();
    descriptorSet.initialize(info);
    return descriptorSet;
  };
  _proto.createShader = function createShader(info) {
    var shader = new WebGL2Shader();
    shader.initialize(info);
    return shader;
  };
  _proto.createInputAssembler = function createInputAssembler(info) {
    var inputAssembler = new WebGL2InputAssembler();
    inputAssembler.initialize(info);
    return inputAssembler;
  };
  _proto.createRenderPass = function createRenderPass(info) {
    var renderPass = new WebGL2RenderPass();
    renderPass.initialize(info);
    return renderPass;
  };
  _proto.createFramebuffer = function createFramebuffer(info) {
    var framebuffer = new WebGL2Framebuffer();
    framebuffer.initialize(info);
    return framebuffer;
  };
  _proto.createDescriptorSetLayout = function createDescriptorSetLayout(info) {
    var descriptorSetLayout = new WebGL2DescriptorSetLayout();
    descriptorSetLayout.initialize(info);
    return descriptorSetLayout;
  };
  _proto.createPipelineLayout = function createPipelineLayout(info) {
    var pipelineLayout = new WebGL2PipelineLayout();
    pipelineLayout.initialize(info);
    return pipelineLayout;
  };
  _proto.createPipelineState = function createPipelineState(info) {
    var pipelineState = new WebGL2PipelineState();
    pipelineState.initialize(info);
    return pipelineState;
  };
  _proto.createQueue = function createQueue(info) {
    var queue = new WebGL2Queue();
    queue.initialize(info);
    return queue;
  };
  _proto.getSampler = function getSampler(info) {
    var hash = Sampler.computeHash(info);
    if (!this._samplers.has(hash)) {
      this._samplers.set(hash, new WebGL2Sampler(info, hash));
    }
    return this._samplers.get(hash);
  };
  _proto.getSwapchains = function getSwapchains() {
    return [this._swapchain];
  };
  _proto.getGeneralBarrier = function getGeneralBarrier(info) {
    var hash = GeneralBarrier.computeHash(info);
    if (!this._generalBarrierss.has(hash)) {
      this._generalBarrierss.set(hash, new GeneralBarrier(info, hash));
    }
    return this._generalBarrierss.get(hash);
  };
  _proto.getTextureBarrier = function getTextureBarrier(info) {
    var hash = TextureBarrier.computeHash(info);
    if (!this._textureBarriers.has(hash)) {
      this._textureBarriers.set(hash, new TextureBarrier(info, hash));
    }
    return this._textureBarriers.get(hash);
  };
  _proto.getBufferBarrier = function getBufferBarrier(info) {
    var hash = BufferBarrier.computeHash(info);
    if (!this._bufferBarriers.has(hash)) {
      this._bufferBarriers.set(hash, new BufferBarrier(info, hash));
    }
    return this._bufferBarriers.get(hash);
  };
  _proto.copyBuffersToTexture = function copyBuffersToTexture(buffers, texture, regions) {
    WebGL2CmdFuncCopyBuffersToTexture(this, buffers, texture.gpuTexture, regions);
  };
  _proto.copyTextureToBuffers = function copyTextureToBuffers(texture, buffers, regions) {
    WebGL2CmdFuncCopyTextureToBuffers(this, texture.gpuTexture, buffers, regions);
  };
  _proto.copyTexImagesToTexture = function copyTexImagesToTexture(texImages, texture, regions) {
    WebGL2CmdFuncCopyTexImagesToTexture(this, texImages, texture.gpuTexture, regions);
  };
  return _createClass(WebGL2Device, [{
    key: "gl",
    get: function get() {
      return this._context;
    }
  }, {
    key: "extensions",
    get: function get() {
      return this._swapchain.extensions;
    }
  }, {
    key: "nullTex2D",
    get: function get() {
      return this._swapchain.nullTex2D;
    }
  }, {
    key: "nullTexCube",
    get: function get() {
      return this._swapchain.nullTexCube;
    }
  }, {
    key: "textureExclusive",
    get: function get() {
      return this._textureExclusive;
    }
  }, {
    key: "bindingMappings",
    get: function get() {
      return this._bindingMappings;
    }
  }, {
    key: "blitManager",
    get: function get() {
      return this._swapchain.blitManager;
    }
  }]);
}(Device);

legacyCC.WebGL2Device = WebGL2Device;

export { WebGL2Device };
//# sourceMappingURL=gfx-webgl2.js.map
