import { _ as _inheritsLoose, a as _createClass, k as errorID, $ as systemInfo, a4 as OS, N as assertID, ad as debugID, Q as error, at as nextPow2, w as warnID, D as debug, e as warn, B as BrowserType, G as macro } from './gc-object-CShF5lzx.js';
import { at as DESCRIPTOR_BUFFER_TYPE, av as DESCRIPTOR_SAMPLER_TYPE, k as DescriptorSet, ad as Rect, M as MemoryUsageBit, b as BufferUsageBit, x as FormatInfos, F as Format, aQ as LoadOp, ak as ColorMask, a3 as getTypedArrayConstructor, br as formatAlignment, aG as Extent, aU as Offset, bq as alignTo, aI as FormatSize, a0 as TextureFlagBit, as as CullMode, aD as DynamicStateFlagBit, X as UniformSamplerTexture, W as Type, O as ShaderStageFlagBit, E as TextureType, U as UniformBlock, V as Uniform, L as DescriptorSetLayoutBinding, N as DescriptorType, c as DepthStencilState, A as Attribute, D as DrawInfo, a4 as Filter, r as Buffer, b9 as StencilFace, g as CommandBuffer, aE as DynamicStates, l as Framebuffer, o as InputAssembler, au as DESCRIPTOR_DYNAMIC_TYPE, j as DescriptorSetLayout, i as PipelineLayout, h as PipelineState, Q as Queue, n as RenderPass, p as Sampler, S as Shader, bo as Viewport, R as RasterizerState, e as BlendState, aP as IsPowerOf2, aJ as FormatSurfaceSize, z as TextureInfo, H as TextureUsageBit, q as Texture, J as BufferTextureCopy, s as Swapchain, $ as API, t as Device, a$ as QueueInfo, b0 as QueueType, aq as CommandBufferInfo, aa as Feature, _ as FormatFeatureBit, ar as CommandBufferType, G as GeneralBarrier, T as TextureBarrier, f as BufferBarrier } from './buffer-barrier-BlQXg9Aa.js';
import { B as BYTEDANCE, W as WECHAT_MINI_PROGRAM, E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';
import { W as WebGLConstants } from './gl-constants-Dp0l46iW.js';
import { c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';

var WebGLDescriptorSet = function (_DescriptorSet) {
  function WebGLDescriptorSet() {
    var _this;
    _this = _DescriptorSet.call(this) || this;
    _this._gpuDescriptorSet = null;
    return _this;
  }
  _inheritsLoose(WebGLDescriptorSet, _DescriptorSet);
  var _proto = WebGLDescriptorSet.prototype;
  _proto.initialize = function initialize(info) {
    this._layout = info.layout;
    var _gpuDescriptorSetLayo = info.layout.gpuDescriptorSetLayout,
      bindings = _gpuDescriptorSetLayo.bindings,
      descriptorIndices = _gpuDescriptorSetLayo.descriptorIndices,
      descriptorCount = _gpuDescriptorSetLayo.descriptorCount;
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
          gpuTexture: null,
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
          var buffer = this._buffers[i];
          if (buffer) {
            descriptors[i].gpuBuffer = buffer.gpuBuffer || buffer.gpuBufferView;
          }
        } else if (descriptors[i].type & DESCRIPTOR_SAMPLER_TYPE) {
          if (this._textures[i]) {
            descriptors[i].gpuTexture = this._textures[i].gpuTexture;
          }
          if (this._samplers[i]) {
            descriptors[i].gpuSampler = this._samplers[i].gpuSampler;
          }
        }
      }
      this._isDirty = false;
    }
  };
  return _createClass(WebGLDescriptorSet, [{
    key: "gpuDescriptorSet",
    get: function get() {
      return this._gpuDescriptorSet;
    }
  }]);
}(DescriptorSet);

var WebGLEXT;
(function (WebGLEXT) {
  WebGLEXT[WebGLEXT["RGBA16F_EXT"] = 34842] = "RGBA16F_EXT";
  WebGLEXT[WebGLEXT["RGB16F_EXT"] = 34843] = "RGB16F_EXT";
  WebGLEXT[WebGLEXT["RGBA32F_EXT"] = 34836] = "RGBA32F_EXT";
  WebGLEXT[WebGLEXT["FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT"] = 33297] = "FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT";
  WebGLEXT[WebGLEXT["UNSIGNED_NORMALIZED_EXT"] = 35863] = "UNSIGNED_NORMALIZED_EXT";
  WebGLEXT[WebGLEXT["UNSIGNED_INT_24_8_WEBGL"] = 34042] = "UNSIGNED_INT_24_8_WEBGL";
  WebGLEXT[WebGLEXT["HALF_FLOAT_OES"] = 36193] = "HALF_FLOAT_OES";
  WebGLEXT[WebGLEXT["SRGB_EXT"] = 35904] = "SRGB_EXT";
  WebGLEXT[WebGLEXT["SRGB_ALPHA_EXT"] = 35906] = "SRGB_ALPHA_EXT";
  WebGLEXT[WebGLEXT["SRGB8_ALPHA8_EXT"] = 35907] = "SRGB8_ALPHA8_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_RGB_S3TC_DXT1_EXT"] = 33776] = "COMPRESSED_RGB_S3TC_DXT1_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_S3TC_DXT1_EXT"] = 33777] = "COMPRESSED_RGBA_S3TC_DXT1_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_S3TC_DXT3_EXT"] = 33778] = "COMPRESSED_RGBA_S3TC_DXT3_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_S3TC_DXT5_EXT"] = 33779] = "COMPRESSED_RGBA_S3TC_DXT5_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB_S3TC_DXT1_EXT"] = 35916] = "COMPRESSED_SRGB_S3TC_DXT1_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT"] = 35917] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT"] = 35918] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT"] = 35919] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT";
  WebGLEXT[WebGLEXT["COMPRESSED_RGB_PVRTC_4BPPV1_IMG"] = 35840] = "COMPRESSED_RGB_PVRTC_4BPPV1_IMG";
  WebGLEXT[WebGLEXT["COMPRESSED_RGB_PVRTC_2BPPV1_IMG"] = 35841] = "COMPRESSED_RGB_PVRTC_2BPPV1_IMG";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_PVRTC_4BPPV1_IMG"] = 35842] = "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_PVRTC_2BPPV1_IMG"] = 35843] = "COMPRESSED_RGBA_PVRTC_2BPPV1_IMG";
  WebGLEXT[WebGLEXT["COMPRESSED_RGB_ETC1_WEBGL"] = 36196] = "COMPRESSED_RGB_ETC1_WEBGL";
  WebGLEXT[WebGLEXT["COMPRESSED_R11_EAC"] = 37488] = "COMPRESSED_R11_EAC";
  WebGLEXT[WebGLEXT["COMPRESSED_SIGNED_R11_EAC"] = 37489] = "COMPRESSED_SIGNED_R11_EAC";
  WebGLEXT[WebGLEXT["COMPRESSED_RG11_EAC"] = 37490] = "COMPRESSED_RG11_EAC";
  WebGLEXT[WebGLEXT["COMPRESSED_SIGNED_RG11_EAC"] = 37491] = "COMPRESSED_SIGNED_RG11_EAC";
  WebGLEXT[WebGLEXT["COMPRESSED_RGB8_ETC2"] = 37492] = "COMPRESSED_RGB8_ETC2";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ETC2"] = 37493] = "COMPRESSED_SRGB8_ETC2";
  WebGLEXT[WebGLEXT["COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37494] = "COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37495] = "COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA8_ETC2_EAC"] = 37496] = "COMPRESSED_RGBA8_ETC2_EAC";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ETC2_EAC"] = 37497] = "COMPRESSED_SRGB8_ALPHA8_ETC2_EAC";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_4x4_KHR"] = 37808] = "COMPRESSED_RGBA_ASTC_4x4_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_5x4_KHR"] = 37809] = "COMPRESSED_RGBA_ASTC_5x4_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_5x5_KHR"] = 37810] = "COMPRESSED_RGBA_ASTC_5x5_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_6x5_KHR"] = 37811] = "COMPRESSED_RGBA_ASTC_6x5_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_6x6_KHR"] = 37812] = "COMPRESSED_RGBA_ASTC_6x6_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_8x5_KHR"] = 37813] = "COMPRESSED_RGBA_ASTC_8x5_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_8x6_KHR"] = 37814] = "COMPRESSED_RGBA_ASTC_8x6_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_8x8_KHR"] = 37815] = "COMPRESSED_RGBA_ASTC_8x8_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_10x5_KHR"] = 37816] = "COMPRESSED_RGBA_ASTC_10x5_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_10x6_KHR"] = 37817] = "COMPRESSED_RGBA_ASTC_10x6_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_10x8_KHR"] = 37818] = "COMPRESSED_RGBA_ASTC_10x8_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_10x10_KHR"] = 37819] = "COMPRESSED_RGBA_ASTC_10x10_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_12x10_KHR"] = 37820] = "COMPRESSED_RGBA_ASTC_12x10_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_RGBA_ASTC_12x12_KHR"] = 37821] = "COMPRESSED_RGBA_ASTC_12x12_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR"] = 37840] = "COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR"] = 37841] = "COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR"] = 37842] = "COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR"] = 37843] = "COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR"] = 37844] = "COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR"] = 37845] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR"] = 37846] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR"] = 37847] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR"] = 37848] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR"] = 37849] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR"] = 37850] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR"] = 37851] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR"] = 37852] = "COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR";
  WebGLEXT[WebGLEXT["COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR"] = 37853] = "COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR";
})(WebGLEXT || (WebGLEXT = {}));
var WebGLDeviceManager = function () {
  function WebGLDeviceManager() {}
  WebGLDeviceManager.setInstance = function setInstance(instance) {
    WebGLDeviceManager._instance = instance;
  };
  return _createClass(WebGLDeviceManager, null, [{
    key: "instance",
    get: function get() {
      return WebGLDeviceManager._instance;
    }
  }]);
}();
WebGLDeviceManager._instance = null;

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
      return WebGLEXT.HALF_FLOAT_OES;
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
      return WebGLEXT.HALF_FLOAT_OES;
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
      return WebGLEXT.HALF_FLOAT_OES;
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
      return WebGLEXT.HALF_FLOAT_OES;
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
      return WebGLConstants.FLOAT;
    case Format.RGB5A1:
      return WebGLConstants.UNSIGNED_SHORT_5_5_5_1;
    case Format.RGBA4:
      return WebGLConstants.UNSIGNED_SHORT_4_4_4_4;
    case Format.RGB10A2:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.RGB10A2UI:
      return WebGLConstants.UNSIGNED_INT;
    case Format.RGB9E5:
      return WebGLConstants.UNSIGNED_BYTE;
    case Format.DEPTH:
      return WebGLConstants.UNSIGNED_INT;
    case Format.DEPTH_STENCIL:
      return WebGLEXT.UNSIGNED_INT_24_8_WEBGL;
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
    case Format.R5G6B5:
      return WebGLConstants.RGB565;
    case Format.RGB5A1:
      return WebGLConstants.RGB5_A1;
    case Format.RGBA4:
      return WebGLConstants.RGBA4;
    case Format.RGBA16F:
      return WebGLEXT.RGBA16F_EXT;
    case Format.RGBA32F:
      return WebGLEXT.RGBA32F_EXT;
    case Format.SRGB8_A8:
      return WebGLEXT.SRGB8_ALPHA8_EXT;
    case Format.DEPTH:
      return WebGLConstants.DEPTH_COMPONENT16;
    case Format.DEPTH_STENCIL:
      return WebGLConstants.DEPTH_STENCIL;
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
    case Format.RGB8:
      return WebGLConstants.RGB;
    case Format.RGB16F:
      return WebGLConstants.RGB;
    case Format.RGB32F:
      return WebGLConstants.RGB;
    case Format.BGRA8:
      return WebGLConstants.RGBA;
    case Format.RGBA8:
      return WebGLConstants.RGBA;
    case Format.SRGB8_A8:
      return WebGLConstants.RGBA;
    case Format.RGBA16F:
      return WebGLConstants.RGBA;
    case Format.RGBA32F:
      return WebGLConstants.RGBA;
    case Format.R5G6B5:
      return WebGLConstants.RGB;
    case Format.RGB5A1:
      return WebGLConstants.RGBA;
    case Format.RGBA4:
      return WebGLConstants.RGBA;
    case Format.DEPTH:
      return WebGLConstants.DEPTH_COMPONENT;
    case Format.DEPTH_STENCIL:
      return WebGLConstants.DEPTH_STENCIL;
    case Format.BC1:
      return WebGLEXT.COMPRESSED_RGB_S3TC_DXT1_EXT;
    case Format.BC1_ALPHA:
      return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT1_EXT;
    case Format.BC1_SRGB:
      return WebGLEXT.COMPRESSED_SRGB_S3TC_DXT1_EXT;
    case Format.BC1_SRGB_ALPHA:
      return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
    case Format.BC2:
      return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT3_EXT;
    case Format.BC2_SRGB:
      return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
    case Format.BC3:
      return WebGLEXT.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    case Format.BC3_SRGB:
      return WebGLEXT.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
    case Format.ETC_RGB8:
      return WebGLEXT.COMPRESSED_RGB_ETC1_WEBGL;
    case Format.ETC2_RGB8:
      return WebGLEXT.COMPRESSED_RGB8_ETC2;
    case Format.ETC2_SRGB8:
      return WebGLEXT.COMPRESSED_SRGB8_ETC2;
    case Format.ETC2_RGB8_A1:
      return WebGLEXT.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2;
    case Format.ETC2_SRGB8_A1:
      return WebGLEXT.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2;
    case Format.ETC2_RGBA8:
      return WebGLEXT.COMPRESSED_RGBA8_ETC2_EAC;
    case Format.ETC2_SRGB8_A8:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC;
    case Format.EAC_R11:
      return WebGLEXT.COMPRESSED_R11_EAC;
    case Format.EAC_R11SN:
      return WebGLEXT.COMPRESSED_SIGNED_R11_EAC;
    case Format.EAC_RG11:
      return WebGLEXT.COMPRESSED_RG11_EAC;
    case Format.EAC_RG11SN:
      return WebGLEXT.COMPRESSED_SIGNED_RG11_EAC;
    case Format.PVRTC_RGB2:
      return WebGLEXT.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
    case Format.PVRTC_RGBA2:
      return WebGLEXT.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
    case Format.PVRTC_RGB4:
      return WebGLEXT.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
    case Format.PVRTC_RGBA4:
      return WebGLEXT.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
    case Format.ASTC_RGBA_4X4:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_4x4_KHR;
    case Format.ASTC_RGBA_5X4:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_5x4_KHR;
    case Format.ASTC_RGBA_5X5:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_5x5_KHR;
    case Format.ASTC_RGBA_6X5:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_6x5_KHR;
    case Format.ASTC_RGBA_6X6:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_6x6_KHR;
    case Format.ASTC_RGBA_8X5:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_8x5_KHR;
    case Format.ASTC_RGBA_8X6:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_8x6_KHR;
    case Format.ASTC_RGBA_8X8:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_8x8_KHR;
    case Format.ASTC_RGBA_10X5:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_10x5_KHR;
    case Format.ASTC_RGBA_10X6:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_10x6_KHR;
    case Format.ASTC_RGBA_10X8:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_10x8_KHR;
    case Format.ASTC_RGBA_10X10:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_10x10_KHR;
    case Format.ASTC_RGBA_12X10:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_12x10_KHR;
    case Format.ASTC_RGBA_12X12:
      return WebGLEXT.COMPRESSED_RGBA_ASTC_12x12_KHR;
    case Format.ASTC_SRGBA_4X4:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
    case Format.ASTC_SRGBA_5X4:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR;
    case Format.ASTC_SRGBA_5X5:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR;
    case Format.ASTC_SRGBA_6X5:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR;
    case Format.ASTC_SRGBA_6X6:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR;
    case Format.ASTC_SRGBA_8X5:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR;
    case Format.ASTC_SRGBA_8X6:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR;
    case Format.ASTC_SRGBA_8X8:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR;
    case Format.ASTC_SRGBA_10X5:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR;
    case Format.ASTC_SRGBA_10X6:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR;
    case Format.ASTC_SRGBA_10X8:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR;
    case Format.ASTC_SRGBA_10X10:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR;
    case Format.ASTC_SRGBA_12X10:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR;
    case Format.ASTC_SRGBA_12X12:
      return WebGLEXT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR;
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
    case Type.MAT3:
      return WebGLConstants.FLOAT_MAT3;
    case Type.MAT4:
      return WebGLConstants.FLOAT_MAT4;
    case Type.SAMPLER2D:
      return WebGLConstants.SAMPLER_2D;
    case Type.SAMPLER_CUBE:
      return WebGLConstants.SAMPLER_CUBE;
    default:
      {
        errorID(16311);
        return Type.UNKNOWN;
      }
  }
}
function GFXTypeToTypedArrayCtor(type) {
  switch (type) {
    case Type.BOOL:
    case Type.BOOL2:
    case Type.BOOL3:
    case Type.BOOL4:
    case Type.INT:
    case Type.INT2:
    case Type.INT3:
    case Type.INT4:
    case Type.UINT:
      return Int32Array;
    case Type.FLOAT:
    case Type.FLOAT2:
    case Type.FLOAT3:
    case Type.FLOAT4:
    case Type.MAT2:
    case Type.MAT3:
    case Type.MAT4:
      return Float32Array;
    default:
      {
        errorID(16312);
        return Float32Array;
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
    case WebGLConstants.FLOAT_MAT3:
      return Type.MAT3;
    case WebGLConstants.FLOAT_MAT4:
      return Type.MAT4;
    case WebGLConstants.SAMPLER_2D:
      return Type.SAMPLER2D;
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
    case WebGLConstants.FLOAT_MAT3:
      return 36;
    case WebGLConstants.FLOAT_MAT4:
      return 64;
    case WebGLConstants.SAMPLER_2D:
      return 4;
    case WebGLConstants.SAMPLER_CUBE:
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
    case WebGLConstants.FLOAT_MAT3:
      return 3;
    case WebGLConstants.FLOAT_MAT4:
      return 4;
    default:
      {
        return 1;
      }
  }
}
var WebGLCmpFuncs = [WebGLConstants.NEVER, WebGLConstants.LESS, WebGLConstants.EQUAL, WebGLConstants.LEQUAL, WebGLConstants.GREATER, WebGLConstants.NOTEQUAL, WebGLConstants.GEQUAL, WebGLConstants.ALWAYS];
var WebGLStencilOps = [0x0000, 0x1E00, 0x1E01, 0x1E02, 0x1E03, 0x150A, 0x8507, 0x8508];
var WebGLBlendOps = [0x8006, 0x800A, 0x800B, 0x8007, 0x8008];
var WebGLBlendFactors = [0x0000, 0x0001, 0x0302, 0x0304, 0x0303, 0x0305, 0x0300, 0x0306, 0x0301, 0x0307, 0x0308, 0x8001, 0x8002, 0x8003, 0x8004];
function WebGLCmdFuncCreateBuffer(device, gpuBuffer) {
  var gl = device.gl,
    stateCache = device.stateCache;
  var glUsage = gpuBuffer.memUsage & MemoryUsageBit.HOST ? WebGLConstants.DYNAMIC_DRAW : WebGLConstants.STATIC_DRAW;
  if (gpuBuffer.usage & BufferUsageBit.VERTEX) {
    gpuBuffer.glTarget = WebGLConstants.ARRAY_BUFFER;
    var glBuffer = gl.createBuffer();
    if (glBuffer) {
      gpuBuffer.glBuffer = glBuffer;
      if (gpuBuffer.size > 0) {
        if (device.extensions.useVAO) {
          if (stateCache.glVAO) {
            device.extensions.OES_vertex_array_object.bindVertexArrayOES(null);
            stateCache.glVAO = null;
          }
        }
        gfxStateCache.gpuInputAssembler = null;
        if (stateCache.glArrayBuffer !== gpuBuffer.glBuffer) {
          gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, gpuBuffer.glBuffer);
          stateCache.glArrayBuffer = gpuBuffer.glBuffer;
        }
        gl.bufferData(WebGLConstants.ARRAY_BUFFER, gpuBuffer.size, glUsage);
        gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
        stateCache.glArrayBuffer = null;
      }
    }
  } else if (gpuBuffer.usage & BufferUsageBit.INDEX) {
    gpuBuffer.glTarget = WebGLConstants.ELEMENT_ARRAY_BUFFER;
    var _glBuffer = gl.createBuffer();
    if (_glBuffer) {
      gpuBuffer.glBuffer = _glBuffer;
      if (gpuBuffer.size > 0) {
        if (device.extensions.useVAO) {
          if (stateCache.glVAO) {
            device.extensions.OES_vertex_array_object.bindVertexArrayOES(null);
            stateCache.glVAO = null;
          }
        }
        gfxStateCache.gpuInputAssembler = null;
        if (stateCache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
          gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
          stateCache.glElementArrayBuffer = gpuBuffer.glBuffer;
        }
        gl.bufferData(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.size, glUsage);
        gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
        stateCache.glElementArrayBuffer = null;
      }
    }
  } else if (gpuBuffer.usage & BufferUsageBit.UNIFORM) {
    gpuBuffer.glTarget = WebGLConstants.NONE;
    if (gpuBuffer.buffer) {
      gpuBuffer.vf32 = new Float32Array(gpuBuffer.buffer.buffer);
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
function WebGLCmdFuncDestroyBuffer(device, gpuBuffer) {
  var gl = device.gl;
  var cache = device.stateCache;
  if (gpuBuffer.glBuffer) {
    switch (gpuBuffer.glTarget) {
      case WebGLConstants.ARRAY_BUFFER:
        if (device.extensions.useVAO) {
          if (cache.glVAO) {
            device.extensions.OES_vertex_array_object.bindVertexArrayOES(null);
            cache.glVAO = null;
          }
        }
        gfxStateCache.gpuInputAssembler = null;
        gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
        cache.glArrayBuffer = null;
        break;
      case WebGLConstants.ELEMENT_ARRAY_BUFFER:
        if (device.extensions.useVAO) {
          if (cache.glVAO) {
            device.extensions.OES_vertex_array_object.bindVertexArrayOES(null);
            cache.glVAO = null;
          }
        }
        gfxStateCache.gpuInputAssembler = null;
        gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
        cache.glElementArrayBuffer = null;
        break;
    }
    gl.deleteBuffer(gpuBuffer.glBuffer);
    gpuBuffer.glBuffer = null;
  }
}
function WebGLCmdFuncResizeBuffer(device, gpuBuffer) {
  var gl = device.gl,
    stateCache = device.stateCache;
  var glUsage = gpuBuffer.memUsage & MemoryUsageBit.HOST ? WebGLConstants.DYNAMIC_DRAW : WebGLConstants.STATIC_DRAW;
  if (gpuBuffer.usage & BufferUsageBit.VERTEX) {
    if (device.extensions.useVAO) {
      if (stateCache.glVAO) {
        device.extensions.OES_vertex_array_object.bindVertexArrayOES(null);
        stateCache.glVAO = null;
      }
    }
    gfxStateCache.gpuInputAssembler = null;
    if (stateCache.glArrayBuffer !== gpuBuffer.glBuffer) {
      gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, gpuBuffer.glBuffer);
    }
    if (gpuBuffer.buffer) {
      gl.bufferData(WebGLConstants.ARRAY_BUFFER, gpuBuffer.buffer, glUsage);
    } else {
      gl.bufferData(WebGLConstants.ARRAY_BUFFER, gpuBuffer.size, glUsage);
    }
    gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
    stateCache.glArrayBuffer = null;
  } else if (gpuBuffer.usage & BufferUsageBit.INDEX) {
    if (device.extensions.useVAO) {
      if (stateCache.glVAO) {
        device.extensions.OES_vertex_array_object.bindVertexArrayOES(null);
        stateCache.glVAO = null;
      }
    }
    gfxStateCache.gpuInputAssembler = null;
    if (stateCache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
      gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
    }
    if (gpuBuffer.buffer) {
      gl.bufferData(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.buffer, glUsage);
    } else {
      gl.bufferData(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.size, glUsage);
    }
    gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
    stateCache.glElementArrayBuffer = null;
  } else if (gpuBuffer.usage & BufferUsageBit.UNIFORM) {
    if (gpuBuffer.buffer) {
      gpuBuffer.vf32 = new Float32Array(gpuBuffer.buffer.buffer);
    }
  } else if (gpuBuffer.usage & BufferUsageBit.INDIRECT || gpuBuffer.usage & BufferUsageBit.TRANSFER_DST || gpuBuffer.usage & BufferUsageBit.TRANSFER_SRC) {
    gpuBuffer.glTarget = WebGLConstants.NONE;
  } else {
    errorID(16315);
    gpuBuffer.glTarget = WebGLConstants.NONE;
  }
}
function WebGLCmdFuncUpdateBuffer(device, gpuBuffer, buffer, offset, size) {
  if (gpuBuffer.usage & BufferUsageBit.UNIFORM) {
    if (ArrayBuffer.isView(buffer)) {
      gpuBuffer.vf32.set(buffer, offset / Float32Array.BYTES_PER_ELEMENT);
    } else {
      gpuBuffer.vf32.set(new Float32Array(buffer), offset / Float32Array.BYTES_PER_ELEMENT);
    }
  } else if (gpuBuffer.usage & BufferUsageBit.INDIRECT) {
    gpuBuffer.indirects.clearDraws();
    var drawInfos = buffer.drawInfos;
    for (var i = 0; i < drawInfos.length; ++i) {
      gpuBuffer.indirects.setDrawInfo(offset + i, drawInfos[i]);
    }
  } else {
    var buff = buffer;
    var gl = device.gl,
      stateCache = device.stateCache;
    switch (gpuBuffer.glTarget) {
      case WebGLConstants.ARRAY_BUFFER:
        {
          if (device.extensions.useVAO) {
            if (stateCache.glVAO) {
              device.extensions.OES_vertex_array_object.bindVertexArrayOES(null);
              stateCache.glVAO = null;
            }
          }
          gfxStateCache.gpuInputAssembler = null;
          if (stateCache.glArrayBuffer !== gpuBuffer.glBuffer) {
            gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, gpuBuffer.glBuffer);
            stateCache.glArrayBuffer = gpuBuffer.glBuffer;
          }
          break;
        }
      case WebGLConstants.ELEMENT_ARRAY_BUFFER:
        {
          if (device.extensions.useVAO) {
            if (stateCache.glVAO) {
              device.extensions.OES_vertex_array_object.bindVertexArrayOES(null);
              stateCache.glVAO = null;
            }
          }
          gfxStateCache.gpuInputAssembler = null;
          if (stateCache.glElementArrayBuffer !== gpuBuffer.glBuffer) {
            gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, gpuBuffer.glBuffer);
            stateCache.glElementArrayBuffer = gpuBuffer.glBuffer;
          }
          break;
        }
      default:
        {
          errorID(16316);
          return;
        }
    }
    if (systemInfo.os === OS.IOS && gpuBuffer.memUsage & MemoryUsageBit.HOST && offset === 0 && size === buff.byteLength) {
      gl.bufferData(gpuBuffer.glTarget, buff, gl.DYNAMIC_DRAW);
    } else if (size === buff.byteLength) {
      gl.bufferSubData(gpuBuffer.glTarget, offset, buff);
    } else {
      gl.bufferSubData(gpuBuffer.glTarget, offset, buff.slice(0, size));
    }
  }
}
function WebGLCmdFuncCreateTexture(device, gpuTexture) {
  var gl = device.gl,
    stateCache = device.stateCache;
  gpuTexture.glFormat = gpuTexture.glInternalFmt = GFXFormatToWebGLFormat(gpuTexture.format);
  gpuTexture.glType = GFXFormatToWebGLType(gpuTexture.format);
  var w = gpuTexture.width;
  var h = gpuTexture.height;
  switch (gpuTexture.type) {
    case TextureType.TEX2D:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_2D;
        var maxSize = max(w, h);
        if (maxSize > device.capabilities.maxTextureSize) {
          errorID(9100, maxSize, device.capabilities.maxTextureSize);
        }
        if (!device.textureExclusive[gpuTexture.format] && (!device.extensions.WEBGL_depth_texture || BYTEDANCE) && FormatInfos[gpuTexture.format].hasDepth) {
          gpuTexture.glInternalFmt = GFXFormatToWebGLInternalFormat(gpuTexture.format);
          gpuTexture.glRenderbuffer = gl.createRenderbuffer();
          if (gpuTexture.size > 0) {
            if (stateCache.glRenderbuffer !== gpuTexture.glRenderbuffer) {
              gl.bindRenderbuffer(WebGLConstants.RENDERBUFFER, gpuTexture.glRenderbuffer);
              stateCache.glRenderbuffer = gpuTexture.glRenderbuffer;
            }
            gl.renderbufferStorage(WebGLConstants.RENDERBUFFER, gpuTexture.glInternalFmt, w, h);
          }
        } else {
          gpuTexture.glTexture = gl.createTexture();
          if (gpuTexture.size > 0) {
            var glTexUnit = stateCache.glTexUnits[stateCache.texUnit];
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
              for (var _i = 0; _i < gpuTexture.mipLevel; ++_i) {
                gl.texImage2D(WebGLConstants.TEXTURE_2D, _i, gpuTexture.glInternalFmt, w, h, 0, gpuTexture.glFormat, gpuTexture.glType, null);
                w = max(1, w >> 1);
                h = max(1, h >> 1);
              }
            }
            if (gpuTexture.isPowerOf2) {
              gpuTexture.glWrapS = WebGLConstants.REPEAT;
              gpuTexture.glWrapT = WebGLConstants.REPEAT;
            } else {
              gpuTexture.glWrapS = WebGLConstants.CLAMP_TO_EDGE;
              gpuTexture.glWrapT = WebGLConstants.CLAMP_TO_EDGE;
            }
            gpuTexture.glMinFilter = WebGLConstants.LINEAR;
            gpuTexture.glMagFilter = WebGLConstants.LINEAR;
            gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_WRAP_S, gpuTexture.glWrapS);
            gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_WRAP_T, gpuTexture.glWrapT);
            gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_MIN_FILTER, gpuTexture.glMinFilter);
            gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_MAG_FILTER, gpuTexture.glMagFilter);
          }
        }
        break;
      }
    case TextureType.CUBE:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_CUBE_MAP;
        var _maxSize = max(w, h);
        if (_maxSize > device.capabilities.maxCubeMapTextureSize) {
          errorID(9100, _maxSize, device.capabilities.maxTextureSize);
        }
        gpuTexture.glTexture = gl.createTexture();
        if (gpuTexture.size > 0) {
          var _glTexUnit = stateCache.glTexUnits[stateCache.texUnit];
          if (_glTexUnit.glTexture !== gpuTexture.glTexture) {
            gl.bindTexture(WebGLConstants.TEXTURE_CUBE_MAP, gpuTexture.glTexture);
            _glTexUnit.glTexture = gpuTexture.glTexture;
          }
          if (FormatInfos[gpuTexture.format].isCompressed) {
            for (var f = 0; f < 6; ++f) {
              w = gpuTexture.width;
              h = gpuTexture.height;
              for (var _i2 = 0; _i2 < gpuTexture.mipLevel; ++_i2) {
                var _imgSize = FormatSize(gpuTexture.format, w, h, 1);
                var _view = new Uint8Array(_imgSize);
                gl.compressedTexImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _i2, gpuTexture.glInternalFmt, w, h, 0, _view);
                w = max(1, w >> 1);
                h = max(1, h >> 1);
              }
            }
          } else {
            for (var _f = 0; _f < 6; ++_f) {
              w = gpuTexture.width;
              h = gpuTexture.height;
              for (var _i3 = 0; _i3 < gpuTexture.mipLevel; ++_i3) {
                gl.texImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + _f, _i3, gpuTexture.glInternalFmt, w, h, 0, gpuTexture.glFormat, gpuTexture.glType, null);
                w = max(1, w >> 1);
                h = max(1, h >> 1);
              }
            }
          }
          if (gpuTexture.isPowerOf2) {
            gpuTexture.glWrapS = WebGLConstants.REPEAT;
            gpuTexture.glWrapT = WebGLConstants.REPEAT;
          } else {
            gpuTexture.glWrapS = WebGLConstants.CLAMP_TO_EDGE;
            gpuTexture.glWrapT = WebGLConstants.CLAMP_TO_EDGE;
          }
          gpuTexture.glMinFilter = WebGLConstants.LINEAR;
          gpuTexture.glMagFilter = WebGLConstants.LINEAR;
          gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_WRAP_S, gpuTexture.glWrapS);
          gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_WRAP_T, gpuTexture.glWrapT);
          gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_MIN_FILTER, gpuTexture.glMinFilter);
          gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_MAG_FILTER, gpuTexture.glMagFilter);
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
function WebGLCmdFuncDestroyTexture(device, gpuTexture) {
  var gl = device.gl,
    stateCache = device.stateCache;
  if (gpuTexture.glTexture) {
    var glTexUnits = stateCache.glTexUnits;
    var texUnit = stateCache.texUnit;
    gl.deleteTexture(gpuTexture.glTexture);
    for (var i = 0; i < glTexUnits.length; i++) {
      if (glTexUnits[i].glTexture === gpuTexture.glTexture) {
        gl.activeTexture(WebGLConstants.TEXTURE0 + i);
        texUnit = i;
        gl.bindTexture(gpuTexture.glTarget, null);
        glTexUnits[i].glTexture = null;
      }
    }
    stateCache.texUnit = texUnit;
    gpuTexture.glTexture = null;
  }
  if (gpuTexture.glRenderbuffer) {
    var glRenderbuffer = stateCache.glRenderbuffer;
    gl.deleteRenderbuffer(gpuTexture.glRenderbuffer);
    if (glRenderbuffer === gpuTexture.glRenderbuffer) {
      gl.bindRenderbuffer(WebGLConstants.RENDERBUFFER, null);
      stateCache.glRenderbuffer = null;
    }
    gpuTexture.glRenderbuffer = null;
  }
}
function WebGLCmdFuncResizeTexture(device, gpuTexture) {
  if (!gpuTexture.size) return;
  var gl = device.gl,
    stateCache = device.stateCache;
  var w = gpuTexture.width;
  var h = gpuTexture.height;
  switch (gpuTexture.type) {
    case TextureType.TEX2D:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_2D;
        var maxSize = max(w, h);
        if (maxSize > device.capabilities.maxTextureSize) {
          errorID(9100, maxSize, device.capabilities.maxTextureSize);
        }
        if (gpuTexture.glRenderbuffer) {
          if (stateCache.glRenderbuffer !== gpuTexture.glRenderbuffer) {
            gl.bindRenderbuffer(WebGLConstants.RENDERBUFFER, gpuTexture.glRenderbuffer);
            stateCache.glRenderbuffer = gpuTexture.glRenderbuffer;
          }
          gl.renderbufferStorage(WebGLConstants.RENDERBUFFER, gpuTexture.glInternalFmt, w, h);
        } else if (gpuTexture.glTexture) {
          var glTexUnit = stateCache.glTexUnits[stateCache.texUnit];
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
            for (var _i4 = 0; _i4 < gpuTexture.mipLevel; ++_i4) {
              gl.texImage2D(WebGLConstants.TEXTURE_2D, _i4, gpuTexture.glInternalFmt, w, h, 0, gpuTexture.glFormat, gpuTexture.glType, null);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          }
        }
        break;
      }
    case TextureType.CUBE:
      {
        gpuTexture.glTarget = WebGLConstants.TEXTURE_CUBE_MAP;
        var _maxSize2 = max(w, h);
        if (_maxSize2 > device.capabilities.maxCubeMapTextureSize) {
          errorID(9100, _maxSize2, device.capabilities.maxTextureSize);
        }
        var _glTexUnit2 = stateCache.glTexUnits[stateCache.texUnit];
        if (_glTexUnit2.glTexture !== gpuTexture.glTexture) {
          gl.bindTexture(WebGLConstants.TEXTURE_CUBE_MAP, gpuTexture.glTexture);
          _glTexUnit2.glTexture = gpuTexture.glTexture;
        }
        if (FormatInfos[gpuTexture.format].isCompressed) {
          for (var f = 0; f < 6; ++f) {
            w = gpuTexture.width;
            h = gpuTexture.height;
            for (var _i5 = 0; _i5 < gpuTexture.mipLevel; ++_i5) {
              var _imgSize2 = FormatSize(gpuTexture.format, w, h, 1);
              var _view2 = new Uint8Array(_imgSize2);
              gl.compressedTexImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _i5, gpuTexture.glInternalFmt, w, h, 0, _view2);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
          }
        } else {
          for (var _f2 = 0; _f2 < 6; ++_f2) {
            w = gpuTexture.width;
            h = gpuTexture.height;
            for (var _i6 = 0; _i6 < gpuTexture.mipLevel; ++_i6) {
              gl.texImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + _f2, _i6, gpuTexture.glInternalFmt, w, h, 0, gpuTexture.glFormat, gpuTexture.glType, null);
              w = max(1, w >> 1);
              h = max(1, h >> 1);
            }
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
function WebGLCmdFuncCreateFramebuffer(device, gpuFramebuffer) {
  for (var i = 0; i < gpuFramebuffer.gpuColorTextures.length; ++i) {
    var tex = gpuFramebuffer.gpuColorTextures[i];
    if (tex.isSwapchainTexture) {
      gpuFramebuffer.isOffscreen = false;
      return;
    }
  }
  var gl = device.gl,
    stateCache = device.stateCache;
  var attachments = [];
  var glFramebuffer = gl.createFramebuffer();
  if (glFramebuffer) {
    gpuFramebuffer.glFramebuffer = glFramebuffer;
    if (stateCache.glFramebuffer !== gpuFramebuffer.glFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, gpuFramebuffer.glFramebuffer);
    }
    for (var _i7 = 0; _i7 < gpuFramebuffer.gpuColorTextures.length; ++_i7) {
      var gpuTexture = gpuFramebuffer.gpuColorTextures[_i7];
      if (gpuTexture) {
        if (gpuTexture.glTexture) {
          gl.framebufferTexture2D(WebGLConstants.FRAMEBUFFER, WebGLConstants.COLOR_ATTACHMENT0 + _i7, gpuTexture.glTarget, gpuTexture.glTexture, 0);
        } else {
          gl.framebufferRenderbuffer(WebGLConstants.FRAMEBUFFER, WebGLConstants.COLOR_ATTACHMENT0 + _i7, WebGLConstants.RENDERBUFFER, gpuTexture.glRenderbuffer);
        }
        attachments.push(WebGLConstants.COLOR_ATTACHMENT0 + _i7);
        gpuFramebuffer.width = min(gpuFramebuffer.width, gpuTexture.width);
        gpuFramebuffer.height = min(gpuFramebuffer.height, gpuTexture.height);
      }
    }
    var dst = gpuFramebuffer.gpuDepthStencilTexture;
    if (dst) {
      var glAttachment = FormatInfos[dst.format].hasStencil ? WebGLConstants.DEPTH_STENCIL_ATTACHMENT : WebGLConstants.DEPTH_ATTACHMENT;
      if (dst.glTexture) {
        gl.framebufferTexture2D(WebGLConstants.FRAMEBUFFER, glAttachment, dst.glTarget, dst.glTexture, 0);
      } else {
        gl.framebufferRenderbuffer(WebGLConstants.FRAMEBUFFER, glAttachment, WebGLConstants.RENDERBUFFER, dst.glRenderbuffer);
      }
      gpuFramebuffer.width = min(gpuFramebuffer.width, dst.width);
      gpuFramebuffer.height = min(gpuFramebuffer.height, dst.height);
    }
    if (device.extensions.WEBGL_draw_buffers) {
      device.extensions.WEBGL_draw_buffers.drawBuffersWEBGL(attachments);
    }
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
    if (stateCache.glFramebuffer !== gpuFramebuffer.glFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, stateCache.glFramebuffer);
    }
  }
}
function WebGLCmdFuncDestroyFramebuffer(device, gpuFramebuffer) {
  var gl = device.gl,
    stateCache = device.stateCache;
  if (gpuFramebuffer.glFramebuffer) {
    gl.deleteFramebuffer(gpuFramebuffer.glFramebuffer);
    if (stateCache.glFramebuffer === gpuFramebuffer.glFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, null);
      stateCache.glFramebuffer = null;
    }
    gpuFramebuffer.glFramebuffer = null;
  }
}
function WebGLCmdFuncCreateShader(device, gpuShader) {
  var gl = device.gl,
    stateCache = device.stateCache;
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
        gl.shaderSource(gpuStage.glShader, gpuStage.source);
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
  for (var _k = 0; _k < gpuShader.gpuStages.length; _k++) {
    var gpuStage = gpuShader.gpuStages[_k];
    gl.attachShader(gpuShader.glProgram, gpuStage.glShader);
  }
  gl.linkProgram(gpuShader.glProgram);
  if (device.extensions.destroyShadersImmediately) {
    for (var _k2 = 0; _k2 < gpuShader.gpuStages.length; _k2++) {
      var _gpuStage = gpuShader.gpuStages[_k2];
      if (_gpuStage.glShader) {
        gl.detachShader(gpuShader.glProgram, _gpuStage.glShader);
        gl.deleteShader(_gpuStage.glShader);
        _gpuStage.glShader = null;
      }
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
      var attribType = attribInfo.type,
        attribName = attribInfo.name,
        attribSize = attribInfo.size;
      var varName = void 0;
      var nameOffset = attribName.indexOf('[');
      if (nameOffset !== -1) {
        varName = attribName.substring(0, nameOffset);
      } else {
        varName = attribName;
      }
      var glLoc = gl.getAttribLocation(gpuShader.glProgram, varName);
      var gfxType = WebGLTypeToGFXType(attribType);
      var stride = WebGLGetTypeSize(attribType);
      gpuShader.glInputs[i] = {
        binding: glLoc,
        name: varName,
        type: gfxType,
        stride: stride,
        count: attribSize,
        size: stride * attribSize,
        glType: attribType,
        glLoc: glLoc
      };
    }
  }
  if (gpuShader.blocks.length > 0) {
    gpuShader.glBlocks = new Array(gpuShader.blocks.length);
    for (var _i8 = 0; _i8 < gpuShader.blocks.length; ++_i8) {
      var block = gpuShader.blocks[_i8];
      var glBlock = {
        set: block.set,
        binding: block.binding,
        name: block.name,
        size: 0,
        glUniforms: new Array(block.members.length),
        glActiveUniforms: []
      };
      gpuShader.glBlocks[_i8] = glBlock;
      for (var u = 0; u < block.members.length; ++u) {
        var uniform = block.members[u];
        var glType = GFXTypeToWebGLType(uniform.type);
        var _stride = WebGLGetTypeSize(glType);
        var size = _stride * uniform.count;
        glBlock.glUniforms[u] = {
          binding: -1,
          name: uniform.name,
          type: uniform.type,
          stride: _stride,
          count: uniform.count,
          size: size,
          offset: 0,
          glType: glType,
          glLoc: null,
          array: null
        };
      }
    }
  }
  for (var _i9 = 0; _i9 < gpuShader.subpassInputs.length; ++_i9) {
    var subpassInput = gpuShader.subpassInputs[_i9];
    gpuShader.samplerTextures.push(new UniformSamplerTexture(subpassInput.set, subpassInput.binding, subpassInput.name, Type.SAMPLER2D, subpassInput.count));
  }
  if (gpuShader.samplerTextures.length > 0) {
    gpuShader.glSamplerTextures = new Array(gpuShader.samplerTextures.length);
    for (var _i0 = 0; _i0 < gpuShader.samplerTextures.length; ++_i0) {
      var sampler = gpuShader.samplerTextures[_i0];
      gpuShader.glSamplerTextures[_i0] = {
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
  var activeUniformCount = gl.getProgramParameter(gpuShader.glProgram, WebGLConstants.ACTIVE_UNIFORMS);
  for (var _i1 = 0; _i1 < activeUniformCount; ++_i1) {
    var uniformInfo = gl.getActiveUniform(gpuShader.glProgram, _i1);
    if (uniformInfo) {
      var isSampler = uniformInfo.type === WebGLConstants.SAMPLER_2D || uniformInfo.type === WebGLConstants.SAMPLER_CUBE;
      if (!isSampler) {
        var _glLoc = gl.getUniformLocation(gpuShader.glProgram, uniformInfo.name);
        if (device.extensions.isLocationActive(_glLoc)) {
          var _varName = void 0;
          var _nameOffset = uniformInfo.name.indexOf('[');
          if (_nameOffset !== -1) {
            _varName = uniformInfo.name.substring(0, _nameOffset);
          } else {
            _varName = uniformInfo.name;
          }
          for (var j = 0; j < gpuShader.glBlocks.length; j++) {
            var _glBlock = gpuShader.glBlocks[j];
            for (var _k3 = 0; _k3 < _glBlock.glUniforms.length; _k3++) {
              var glUniform = _glBlock.glUniforms[_k3];
              if (glUniform.name === _varName) {
                glUniform.glLoc = _glLoc;
                glUniform.count = uniformInfo.size;
                glUniform.size = glUniform.stride * glUniform.count;
                glUniform.array = new (GFXTypeToTypedArrayCtor(glUniform.type))(glUniform.size / 4);
                _glBlock.glActiveUniforms.push(glUniform);
                break;
              }
            }
          }
        }
      }
    }
  }
  for (var _j = 0; _j < gpuShader.glBlocks.length; _j++) {
    var _glBlock2 = gpuShader.glBlocks[_j];
    for (var _k4 = 0; _k4 < _glBlock2.glUniforms.length; _k4++) {
      var _glUniform = _glBlock2.glUniforms[_k4];
      _glUniform.offset = _glBlock2.size / 4;
      _glBlock2.size += _glUniform.size;
    }
  }
  var glActiveSamplers = [];
  var glActiveSamplerLocations = [];
  var bindingMappings = device.bindingMappings,
    capabilities = device.capabilities;
  var texUnitCacheMap = device.stateCache.texUnitCacheMap;
  var maxTextureUnits = capabilities.maxTextureUnits;
  if (!(cclegacy.rendering && cclegacy.rendering.enableEffectImport)) {
    var flexibleSetBaseOffset = 0;
    for (var _i10 = 0; _i10 < gpuShader.blocks.length; ++_i10) {
      if (gpuShader.blocks[_i10].set === bindingMappings.flexibleSet) {
        flexibleSetBaseOffset++;
      }
    }
    var arrayOffset = 0;
    for (var _i11 = 0; _i11 < gpuShader.samplerTextures.length; ++_i11) {
      var _sampler = gpuShader.samplerTextures[_i11];
      var _glLoc2 = gl.getUniformLocation(gpuShader.glProgram, _sampler.name);
      if (device.extensions.isLocationActive(_glLoc2)) {
        glActiveSamplers.push(gpuShader.glSamplerTextures[_i11]);
        glActiveSamplerLocations.push(_glLoc2);
      }
      if (texUnitCacheMap[_sampler.name] === undefined) {
        var binding = _sampler.binding + bindingMappings.samplerTextureOffsets[_sampler.set] + arrayOffset;
        if (_sampler.set === bindingMappings.flexibleSet) {
          binding -= flexibleSetBaseOffset;
        }
        texUnitCacheMap[_sampler.name] = binding % maxTextureUnits;
        arrayOffset += _sampler.count - 1;
      }
    }
  } else {
    for (var _i12 = 0; _i12 < gpuShader.samplerTextures.length; ++_i12) {
      var _sampler2 = gpuShader.samplerTextures[_i12];
      var _glLoc3 = gl.getUniformLocation(gpuShader.glProgram, _sampler2.name);
      if (device.extensions.isLocationActive(_glLoc3)) {
        glActiveSamplers.push(gpuShader.glSamplerTextures[_i12]);
        glActiveSamplerLocations.push(_glLoc3);
      }
      if (texUnitCacheMap[_sampler2.name] === undefined) {
        texUnitCacheMap[_sampler2.name] = _sampler2.flattened % maxTextureUnits;
      }
    }
  }
  if (glActiveSamplers.length) {
    var usedTexUnits = [];
    for (var _i13 = 0; _i13 < glActiveSamplers.length; ++_i13) {
      var glSampler = glActiveSamplers[_i13];
      var cachedUnit = texUnitCacheMap[glSampler.name];
      if (cachedUnit !== undefined) {
        glSampler.glLoc = glActiveSamplerLocations[_i13];
        for (var t = 0; t < glSampler.count; ++t) {
          while (usedTexUnits[cachedUnit]) {
            cachedUnit = (cachedUnit + 1) % maxTextureUnits;
          }
          glSampler.units.push(cachedUnit);
          usedTexUnits[cachedUnit] = true;
        }
      }
    }
    var unitIdx = 0;
    for (var _i14 = 0; _i14 < glActiveSamplers.length; ++_i14) {
      var _glSampler = glActiveSamplers[_i14];
      if (!device.extensions.isLocationActive(_glSampler.glLoc)) {
        _glSampler.glLoc = glActiveSamplerLocations[_i14];
        for (var _t = 0; _t < _glSampler.count; ++_t) {
          while (usedTexUnits[unitIdx]) {
            unitIdx = (unitIdx + 1) % maxTextureUnits;
          }
          if (texUnitCacheMap[_glSampler.name] === undefined) {
            texUnitCacheMap[_glSampler.name] = unitIdx;
          }
          _glSampler.units.push(unitIdx);
          usedTexUnits[unitIdx] = true;
        }
      }
    }
    if (stateCache.glProgram !== gpuShader.glProgram) {
      gl.useProgram(gpuShader.glProgram);
    }
    for (var _i15 = 0; _i15 < glActiveSamplers.length; _i15++) {
      var _glSampler2 = glActiveSamplers[_i15];
      _glSampler2.glUnits = new Int32Array(_glSampler2.units);
      gl.uniform1iv(_glSampler2.glLoc, _glSampler2.glUnits);
    }
    if (stateCache.glProgram !== gpuShader.glProgram) {
      gl.useProgram(stateCache.glProgram);
    }
  }
  for (var _i16 = 0; _i16 < gpuShader.glBlocks.length;) {
    if (gpuShader.glBlocks[_i16].glActiveUniforms.length) {
      _i16++;
    } else {
      gpuShader.glBlocks[_i16] = gpuShader.glBlocks[gpuShader.glBlocks.length - 1];
      gpuShader.glBlocks.length--;
    }
  }
  gpuShader.glSamplerTextures = glActiveSamplers;
}
function WebGLCmdFuncDestroyShader(device, gpuShader) {
  if (gpuShader.glProgram) {
    var gl = device.gl,
      stateCache = device.stateCache;
    if (!device.extensions.destroyShadersImmediately) {
      for (var k = 0; k < gpuShader.gpuStages.length; k++) {
        var gpuStage = gpuShader.gpuStages[k];
        if (gpuStage.glShader) {
          gl.detachShader(gpuShader.glProgram, gpuStage.glShader);
          gl.deleteShader(gpuStage.glShader);
          gpuStage.glShader = null;
        }
      }
    }
    gl.deleteProgram(gpuShader.glProgram);
    if (stateCache.glProgram === gpuShader.glProgram) {
      gl.useProgram(null);
      stateCache.glProgram = null;
    }
    gpuShader.glProgram = null;
  }
}
function WebGLCmdFuncCreateInputAssember(device, gpuInputAssembler) {
  device.gl;
  gpuInputAssembler.glAttribs = new Array(gpuInputAssembler.attributes.length);
  var offsets = [0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < gpuInputAssembler.attributes.length; ++i) {
    var attrib = gpuInputAssembler.attributes[i];
    var attribFormat = attrib.format,
      attribIsNormalized = attrib.isNormalized,
      attribIsInstanced = attrib.isInstanced;
    var stream = attrib.stream !== undefined ? attrib.stream : 0;
    var gpuBuffer = gpuInputAssembler.gpuVertexBuffers[stream];
    var glType = GFXFormatToWebGLType(attribFormat);
    var size = FormatInfos[attribFormat].size;
    gpuInputAssembler.glAttribs[i] = {
      name: attrib.name,
      glBuffer: gpuBuffer.glBuffer,
      glType: glType,
      size: size,
      count: FormatInfos[attribFormat].count,
      stride: gpuBuffer.stride,
      componentCount: WebGLGetComponentCount(glType),
      isNormalized: attribIsNormalized !== undefined ? attribIsNormalized : false,
      isInstanced: attribIsInstanced !== undefined ? attribIsInstanced : false,
      offset: offsets[stream]
    };
    offsets[stream] += size;
  }
}
function WebGLCmdFuncDestroyInputAssembler(device, gpuInputAssembler) {
  var stateCache = device.stateCache;
  var it = gpuInputAssembler.glVAOs.values();
  var res = it.next();
  var OES_vertex_array_object = device.extensions.OES_vertex_array_object;
  var glVAO = stateCache.glVAO;
  while (!res.done) {
    OES_vertex_array_object.deleteVertexArrayOES(res.value);
    if (glVAO === res.value) {
      OES_vertex_array_object.bindVertexArrayOES(null);
      glVAO = null;
    }
    res = it.next();
  }
  stateCache.glVAO = glVAO;
  gpuInputAssembler.glVAOs.clear();
}
var gfxStateCache = {
  gpuPipelineState: null,
  gpuInputAssembler: null,
  glPrimitive: 0
};
var realRenderArea = new Rect();
function WebGLCmdFuncBeginRenderPass(device, gpuRenderPass, gpuFramebuffer, renderArea, clearColors, clearDepth, clearStencil) {
  var gl = device.gl;
  var cache = device.stateCache;
  var clears = 0;
  if (gpuFramebuffer) {
    var lodLevel = gpuFramebuffer.lodLevel;
    realRenderArea.x = renderArea.x << lodLevel;
    realRenderArea.y = renderArea.y << lodLevel;
    realRenderArea.width = renderArea.width << lodLevel;
    realRenderArea.height = renderArea.height << lodLevel;
  }
  if (gpuFramebuffer && gpuRenderPass) {
    var curGPUFrameBuffer = gpuFramebuffer.glFramebuffer;
    var realRenderAreaX = realRenderArea.x,
      realRenderAreaY = realRenderArea.y,
      realRenderAreaWidth = realRenderArea.width,
      realRenderAreaHeight = realRenderArea.height;
    if (cache.glFramebuffer !== curGPUFrameBuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, curGPUFrameBuffer);
      cache.glFramebuffer = curGPUFrameBuffer;
    }
    var cacheViewport = cache.viewport;
    if (cacheViewport.left !== realRenderAreaX || cacheViewport.top !== realRenderAreaY || cacheViewport.width !== realRenderAreaWidth || cacheViewport.height !== realRenderAreaHeight) {
      gl.viewport(realRenderAreaX, realRenderAreaY, realRenderAreaWidth, realRenderAreaHeight);
      cacheViewport.left = realRenderAreaX;
      cacheViewport.top = realRenderAreaY;
      cacheViewport.width = realRenderAreaWidth;
      cacheViewport.height = realRenderAreaHeight;
    }
    var cacheScissorRect = cache.scissorRect;
    if (cacheScissorRect.x !== realRenderAreaX || cacheScissorRect.y !== realRenderAreaY || cacheScissorRect.width !== realRenderAreaWidth || cacheScissorRect.height !== realRenderAreaHeight) {
      gl.scissor(realRenderAreaX, realRenderAreaY, realRenderAreaWidth, realRenderAreaHeight);
      cacheScissorRect.x = realRenderAreaX;
      cacheScissorRect.y = realRenderAreaY;
      cacheScissorRect.width = realRenderAreaWidth;
      cacheScissorRect.height = realRenderAreaHeight;
    }
    var clearCount = clearColors.length;
    if (!device.extensions.WEBGL_draw_buffers) {
      clearCount = 1;
    }
    var cacheDSS = cache.dss;
    for (var j = 0; j < clearCount; ++j) {
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
              var clearColor = clearColors[0];
              gl.clearColor(clearColor.x, clearColor.y, clearColor.z, clearColor.w);
              clears |= WebGLConstants.COLOR_BUFFER_BIT;
              break;
            }
          case LoadOp.DISCARD:
            {
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
              if (!cacheDSS.depthWrite) {
                gl.depthMask(true);
              }
              gl.clearDepth(clearDepth);
              clears |= WebGLConstants.DEPTH_BUFFER_BIT;
              break;
            }
          case LoadOp.DISCARD:
            {
              break;
            }
        }
        if (FormatInfos[gpuRenderPass.depthStencilAttachment.format].hasStencil) {
          switch (gpuRenderPass.depthStencilAttachment.stencilLoadOp) {
            case LoadOp.LOAD:
              break;
            case LoadOp.CLEAR:
              {
                if (!cacheDSS.stencilWriteMaskFront) {
                  gl.stencilMaskSeparate(WebGLConstants.FRONT, 0xffff);
                }
                if (!cacheDSS.stencilWriteMaskBack) {
                  gl.stencilMaskSeparate(WebGLConstants.BACK, 0xffff);
                }
                gl.clearStencil(clearStencil);
                clears |= WebGLConstants.STENCIL_BUFFER_BIT;
                break;
              }
            case LoadOp.DISCARD:
              {
                break;
              }
          }
        }
      }
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
    if (clears & WebGLConstants.DEPTH_BUFFER_BIT && !cacheDSS.depthWrite) {
      gl.depthMask(false);
    }
    if (clears & WebGLConstants.STENCIL_BUFFER_BIT) {
      if (!cacheDSS.stencilWriteMaskFront) {
        gl.stencilMaskSeparate(WebGLConstants.FRONT, 0);
      }
      if (!cacheDSS.stencilWriteMaskBack) {
        gl.stencilMaskSeparate(WebGLConstants.BACK, 0);
      }
    }
  }
}
function WebGLCmdFuncBindStates(device, gpuPipelineState, gpuInputAssembler, gpuDescriptorSets, dynamicOffsets, dynamicStates) {
  var gl = device.gl;
  var cache = device.stateCache;
  var cacheDSS = cache.dss;
  var cacheBS = cache.bs;
  var gpuShader = gpuPipelineState && gpuPipelineState.gpuShader;
  var isShaderChanged = false;
  var glWrapS;
  var glWrapT;
  var glMinFilter;
  if (gpuPipelineState && gfxStateCache.gpuPipelineState !== gpuPipelineState) {
    gfxStateCache.gpuPipelineState = gpuPipelineState;
    gfxStateCache.glPrimitive = gpuPipelineState.glPrimitive;
    if (gpuPipelineState.gpuShader) {
      var glProgram = gpuPipelineState.gpuShader.glProgram;
      if (cache.glProgram !== glProgram) {
        gl.useProgram(glProgram);
        cache.glProgram = glProgram;
        isShaderChanged = true;
      }
    }
    var rs = gpuPipelineState.rs;
    var cacheRS = cache.rs;
    if (rs) {
      if (cacheRS.cullMode !== rs.cullMode) {
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
        cacheRS.cullMode = rs.cullMode;
      }
      var isFrontFaceCCW = rs.isFrontFaceCCW;
      if (cacheRS.isFrontFaceCCW !== isFrontFaceCCW) {
        gl.frontFace(isFrontFaceCCW ? WebGLConstants.CCW : WebGLConstants.CW);
        cacheRS.isFrontFaceCCW = isFrontFaceCCW;
      }
      if (cacheRS.depthBias !== rs.depthBias || cacheRS.depthBiasSlop !== rs.depthBiasSlop) {
        gl.polygonOffset(rs.depthBias, rs.depthBiasSlop);
        cacheRS.depthBias = rs.depthBias;
        cacheRS.depthBiasSlop = rs.depthBiasSlop;
      }
      if (cacheRS.lineWidth !== rs.lineWidth) {
        gl.lineWidth(rs.lineWidth);
        cacheRS.lineWidth = rs.lineWidth;
      }
    }
    var dss = gpuPipelineState.dss;
    if (dss) {
      if (cacheDSS.depthTest !== dss.depthTest) {
        if (dss.depthTest) {
          gl.enable(WebGLConstants.DEPTH_TEST);
        } else {
          gl.disable(WebGLConstants.DEPTH_TEST);
        }
        cacheDSS.depthTest = dss.depthTest;
      }
      if (cacheDSS.depthWrite !== dss.depthWrite) {
        gl.depthMask(dss.depthWrite);
        cacheDSS.depthWrite = dss.depthWrite;
      }
      if (cacheDSS.depthFunc !== dss.depthFunc) {
        gl.depthFunc(WebGLCmpFuncs[dss.depthFunc]);
        cacheDSS.depthFunc = dss.depthFunc;
      }
      if (cacheDSS.stencilTestFront !== dss.stencilTestFront || cacheDSS.stencilTestBack !== dss.stencilTestBack) {
        if (dss.stencilTestFront || dss.stencilTestBack) {
          gl.enable(WebGLConstants.STENCIL_TEST);
        } else {
          gl.disable(WebGLConstants.STENCIL_TEST);
        }
        cacheDSS.stencilTestFront = dss.stencilTestFront;
        cacheDSS.stencilTestBack = dss.stencilTestBack;
      }
      if (cacheDSS.stencilFuncFront !== dss.stencilFuncFront || cacheDSS.stencilRefFront !== dss.stencilRefFront || cacheDSS.stencilReadMaskFront !== dss.stencilReadMaskFront) {
        gl.stencilFuncSeparate(WebGLConstants.FRONT, WebGLCmpFuncs[dss.stencilFuncFront], dss.stencilRefFront, dss.stencilReadMaskFront);
        cacheDSS.stencilFuncFront = dss.stencilFuncFront;
        cacheDSS.stencilRefFront = dss.stencilRefFront;
        cacheDSS.stencilReadMaskFront = dss.stencilReadMaskFront;
      }
      if (cacheDSS.stencilFailOpFront !== dss.stencilFailOpFront || cacheDSS.stencilZFailOpFront !== dss.stencilZFailOpFront || cacheDSS.stencilPassOpFront !== dss.stencilPassOpFront) {
        gl.stencilOpSeparate(WebGLConstants.FRONT, WebGLStencilOps[dss.stencilFailOpFront], WebGLStencilOps[dss.stencilZFailOpFront], WebGLStencilOps[dss.stencilPassOpFront]);
        cacheDSS.stencilFailOpFront = dss.stencilFailOpFront;
        cacheDSS.stencilZFailOpFront = dss.stencilZFailOpFront;
        cacheDSS.stencilPassOpFront = dss.stencilPassOpFront;
      }
      if (cacheDSS.stencilWriteMaskFront !== dss.stencilWriteMaskFront) {
        gl.stencilMaskSeparate(WebGLConstants.FRONT, dss.stencilWriteMaskFront);
        cacheDSS.stencilWriteMaskFront = dss.stencilWriteMaskFront;
      }
      if (cacheDSS.stencilFuncBack !== dss.stencilFuncBack || cacheDSS.stencilRefBack !== dss.stencilRefBack || cacheDSS.stencilReadMaskBack !== dss.stencilReadMaskBack) {
        gl.stencilFuncSeparate(WebGLConstants.BACK, WebGLCmpFuncs[dss.stencilFuncBack], dss.stencilRefBack, dss.stencilReadMaskBack);
        cacheDSS.stencilFuncBack = dss.stencilFuncBack;
        cacheDSS.stencilRefBack = dss.stencilRefBack;
        cacheDSS.stencilReadMaskBack = dss.stencilReadMaskBack;
      }
      if (cacheDSS.stencilFailOpBack !== dss.stencilFailOpBack || cacheDSS.stencilZFailOpBack !== dss.stencilZFailOpBack || cacheDSS.stencilPassOpBack !== dss.stencilPassOpBack) {
        gl.stencilOpSeparate(WebGLConstants.BACK, WebGLStencilOps[dss.stencilFailOpBack], WebGLStencilOps[dss.stencilZFailOpBack], WebGLStencilOps[dss.stencilPassOpBack]);
        cacheDSS.stencilFailOpBack = dss.stencilFailOpBack;
        cacheDSS.stencilZFailOpBack = dss.stencilZFailOpBack;
        cacheDSS.stencilPassOpBack = dss.stencilPassOpBack;
      }
      if (cacheDSS.stencilWriteMaskBack !== dss.stencilWriteMaskBack) {
        gl.stencilMaskSeparate(WebGLConstants.BACK, dss.stencilWriteMaskBack);
        cacheDSS.stencilWriteMaskBack = dss.stencilWriteMaskBack;
      }
    }
    var bs = gpuPipelineState.bs;
    if (bs) {
      if (cacheBS.isA2C !== bs.isA2C) {
        if (bs.isA2C) {
          gl.enable(WebGLConstants.SAMPLE_ALPHA_TO_COVERAGE);
        } else {
          gl.disable(WebGLConstants.SAMPLE_ALPHA_TO_COVERAGE);
        }
        cacheBS.isA2C = bs.isA2C;
      }
      if (cacheBS.blendColor.x !== bs.blendColor.x || cacheBS.blendColor.y !== bs.blendColor.y || cacheBS.blendColor.z !== bs.blendColor.z || cacheBS.blendColor.w !== bs.blendColor.w) {
        gl.blendColor(bs.blendColor.x, bs.blendColor.y, bs.blendColor.z, bs.blendColor.w);
        cacheBS.blendColor.x = bs.blendColor.x;
        cacheBS.blendColor.y = bs.blendColor.y;
        cacheBS.blendColor.z = bs.blendColor.z;
        cacheBS.blendColor.w = bs.blendColor.w;
      }
      var target0 = bs.targets[0];
      var target0Cache = cacheBS.targets[0];
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
      var descriptorIdx = gpuDescriptorSet && gpuDescriptorSet.descriptorIndices[glBlock.binding];
      var gpuDescriptor = descriptorIdx >= 0 && gpuDescriptorSet.gpuDescriptors[descriptorIdx];
      var vf32 = null;
      var offset = 0;
      if (gpuDescriptor && gpuDescriptor.gpuBuffer) {
        var gpuBuffer = gpuDescriptor.gpuBuffer;
        var dynamicOffsetIndexSet = dynamicOffsetIndices[glBlock.set];
        var dynamicOffsetIndex = dynamicOffsetIndexSet && dynamicOffsetIndexSet[glBlock.binding];
        if (dynamicOffsetIndex >= 0) {
          offset = dynamicOffsets[dynamicOffsetIndex];
        }
        if ('vf32' in gpuBuffer) {
          vf32 = gpuBuffer.vf32;
        } else {
          offset += gpuBuffer.offset;
          vf32 = gpuBuffer.gpuBuffer.vf32;
        }
        offset >>= 2;
      }
      if (!vf32) {
        continue;
      }
      var uniformLen = glBlock.glActiveUniforms.length;
      for (var l = 0; l < uniformLen; l++) {
        var glUniform = glBlock.glActiveUniforms[l];
        switch (glUniform.glType) {
          case WebGLConstants.BOOL:
          case WebGLConstants.INT:
            {
              for (var u = 0; u < glUniform.array.length; ++u) {
                var idx = glUniform.offset + offset + u;
                if (vf32[idx] !== glUniform.array[u]) {
                  for (var n = u, m = idx; n < glUniform.array.length; ++n, ++m) {
                    glUniform.array[n] = vf32[m];
                  }
                  gl.uniform1iv(glUniform.glLoc, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.BOOL_VEC2:
          case WebGLConstants.INT_VEC2:
            {
              for (var _u = 0; _u < glUniform.array.length; ++_u) {
                var _idx = glUniform.offset + offset + _u;
                if (vf32[_idx] !== glUniform.array[_u]) {
                  for (var _n = _u, _m = _idx; _n < glUniform.array.length; ++_n, ++_m) {
                    glUniform.array[_n] = vf32[_m];
                  }
                  gl.uniform2iv(glUniform.glLoc, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.BOOL_VEC3:
          case WebGLConstants.INT_VEC3:
            {
              for (var _u2 = 0; _u2 < glUniform.array.length; ++_u2) {
                var _idx2 = glUniform.offset + offset + _u2;
                if (vf32[_idx2] !== glUniform.array[_u2]) {
                  for (var _n2 = _u2, _m2 = _idx2; _n2 < glUniform.array.length; ++_n2, ++_m2) {
                    glUniform.array[_n2] = vf32[_m2];
                  }
                  gl.uniform3iv(glUniform.glLoc, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.BOOL_VEC4:
          case WebGLConstants.INT_VEC4:
            {
              for (var _u3 = 0; _u3 < glUniform.array.length; ++_u3) {
                var _idx3 = glUniform.offset + offset + _u3;
                if (vf32[_idx3] !== glUniform.array[_u3]) {
                  for (var _n3 = _u3, _m3 = _idx3; _n3 < glUniform.array.length; ++_n3, ++_m3) {
                    glUniform.array[_n3] = vf32[_m3];
                  }
                  gl.uniform4iv(glUniform.glLoc, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.FLOAT:
            {
              for (var _u4 = 0; _u4 < glUniform.array.length; ++_u4) {
                var _idx4 = glUniform.offset + offset + _u4;
                if (vf32[_idx4] !== glUniform.array[_u4]) {
                  for (var _n4 = _u4, _m4 = _idx4; _n4 < glUniform.array.length; ++_n4, ++_m4) {
                    glUniform.array[_n4] = vf32[_m4];
                  }
                  gl.uniform1fv(glUniform.glLoc, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.FLOAT_VEC2:
            {
              for (var _u5 = 0; _u5 < glUniform.array.length; ++_u5) {
                var _idx5 = glUniform.offset + offset + _u5;
                if (vf32[_idx5] !== glUniform.array[_u5]) {
                  for (var _n5 = _u5, _m5 = _idx5; _n5 < glUniform.array.length; ++_n5, ++_m5) {
                    glUniform.array[_n5] = vf32[_m5];
                  }
                  gl.uniform2fv(glUniform.glLoc, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.FLOAT_VEC3:
            {
              for (var _u6 = 0; _u6 < glUniform.array.length; ++_u6) {
                var _idx6 = glUniform.offset + offset + _u6;
                if (vf32[_idx6] !== glUniform.array[_u6]) {
                  for (var _n6 = _u6, _m6 = _idx6; _n6 < glUniform.array.length; ++_n6, ++_m6) {
                    glUniform.array[_n6] = vf32[_m6];
                  }
                  gl.uniform3fv(glUniform.glLoc, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.FLOAT_VEC4:
            {
              for (var _u7 = 0; _u7 < glUniform.array.length; ++_u7) {
                var _idx7 = glUniform.offset + offset + _u7;
                if (vf32[_idx7] !== glUniform.array[_u7]) {
                  for (var _n7 = _u7, _m7 = _idx7; _n7 < glUniform.array.length; ++_n7, ++_m7) {
                    glUniform.array[_n7] = vf32[_m7];
                  }
                  gl.uniform4fv(glUniform.glLoc, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.FLOAT_MAT2:
            {
              for (var _u8 = 0; _u8 < glUniform.array.length; ++_u8) {
                var _idx8 = glUniform.offset + offset + _u8;
                if (vf32[_idx8] !== glUniform.array[_u8]) {
                  for (var _n8 = _u8, _m8 = _idx8; _n8 < glUniform.array.length; ++_n8, ++_m8) {
                    glUniform.array[_n8] = vf32[_m8];
                  }
                  gl.uniformMatrix2fv(glUniform.glLoc, false, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.FLOAT_MAT3:
            {
              for (var _u9 = 0; _u9 < glUniform.array.length; ++_u9) {
                var _idx9 = glUniform.offset + offset + _u9;
                if (vf32[_idx9] !== glUniform.array[_u9]) {
                  for (var _n9 = _u9, _m9 = _idx9; _n9 < glUniform.array.length; ++_n9, ++_m9) {
                    glUniform.array[_n9] = vf32[_m9];
                  }
                  gl.uniformMatrix3fv(glUniform.glLoc, false, glUniform.array);
                  break;
                }
              }
              break;
            }
          case WebGLConstants.FLOAT_MAT4:
            {
              for (var _u0 = 0; _u0 < glUniform.array.length; ++_u0) {
                var _idx0 = glUniform.offset + offset + _u0;
                if (vf32[_idx0] !== glUniform.array[_u0]) {
                  for (var _n0 = _u0, _m0 = _idx0; _n0 < glUniform.array.length; ++_n0, ++_m0) {
                    glUniform.array[_n0] = vf32[_m0];
                  }
                  gl.uniformMatrix4fv(glUniform.glLoc, false, glUniform.array);
                  break;
                }
              }
              break;
            }
        }
      }
      continue;
    }
    var samplerLen = gpuShader.glSamplerTextures.length;
    for (var i = 0; i < samplerLen; i++) {
      var glSampler = gpuShader.glSamplerTextures[i];
      var _gpuDescriptorSet = gpuDescriptorSets[glSampler.set];
      var descriptorIndex = _gpuDescriptorSet && _gpuDescriptorSet.descriptorIndices[glSampler.binding];
      var _gpuDescriptor = descriptorIndex >= 0 && _gpuDescriptorSet.gpuDescriptors[descriptorIndex];
      var texUnitLen = glSampler.units.length;
      for (var _l = 0; _l < texUnitLen; _l++) {
        var texUnit = glSampler.units[_l];
        if (!_gpuDescriptor || !_gpuDescriptor.gpuSampler) {
          continue;
        }
        if (_gpuDescriptor.gpuTexture && _gpuDescriptor.gpuTexture.size > 0) {
          var _gpuDescriptor2 = _gpuDescriptor,
            gpuTexture = _gpuDescriptor2.gpuTexture;
          var glTexUnit = cache.glTexUnits[texUnit];
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
          var _gpuDescriptor3 = _gpuDescriptor,
            gpuSampler = _gpuDescriptor3.gpuSampler;
          if (gpuTexture.isPowerOf2) {
            glWrapS = gpuSampler.glWrapS;
            glWrapT = gpuSampler.glWrapT;
          } else {
            glWrapS = WebGLConstants.CLAMP_TO_EDGE;
            glWrapT = WebGLConstants.CLAMP_TO_EDGE;
          }
          if (gpuTexture.isPowerOf2) {
            if (gpuTexture.mipLevel <= 1 && (gpuSampler.glMinFilter === WebGLConstants.LINEAR_MIPMAP_NEAREST || gpuSampler.glMinFilter === WebGLConstants.LINEAR_MIPMAP_LINEAR)) {
              glMinFilter = WebGLConstants.LINEAR;
            } else {
              glMinFilter = gpuSampler.glMinFilter;
            }
          } else if (gpuSampler.glMinFilter === WebGLConstants.LINEAR || gpuSampler.glMinFilter === WebGLConstants.LINEAR_MIPMAP_NEAREST || gpuSampler.glMinFilter === WebGLConstants.LINEAR_MIPMAP_LINEAR) {
            glMinFilter = WebGLConstants.LINEAR;
          } else {
            glMinFilter = WebGLConstants.NEAREST;
          }
          if (gpuTexture.glWrapS !== glWrapS) {
            if (cache.texUnit !== texUnit) {
              gl.activeTexture(WebGLConstants.TEXTURE0 + texUnit);
              cache.texUnit = texUnit;
            }
            gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_WRAP_S, glWrapS);
            gpuTexture.glWrapS = glWrapS;
          }
          if (gpuTexture.glWrapT !== glWrapT) {
            if (cache.texUnit !== texUnit) {
              gl.activeTexture(WebGLConstants.TEXTURE0 + texUnit);
              cache.texUnit = texUnit;
            }
            gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_WRAP_T, glWrapT);
            gpuTexture.glWrapT = glWrapT;
          }
          if (gpuTexture.glMinFilter !== glMinFilter) {
            if (cache.texUnit !== texUnit) {
              gl.activeTexture(WebGLConstants.TEXTURE0 + texUnit);
              cache.texUnit = texUnit;
            }
            gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_MIN_FILTER, glMinFilter);
            gpuTexture.glMinFilter = glMinFilter;
          }
          if (gpuTexture.glMagFilter !== gpuSampler.glMagFilter) {
            if (cache.texUnit !== texUnit) {
              gl.activeTexture(WebGLConstants.TEXTURE0 + texUnit);
              cache.texUnit = texUnit;
            }
            gl.texParameteri(gpuTexture.glTarget, WebGLConstants.TEXTURE_MAG_FILTER, gpuSampler.glMagFilter);
            gpuTexture.glMagFilter = gpuSampler.glMagFilter;
          }
        }
        _gpuDescriptor = _gpuDescriptorSet.gpuDescriptors[++descriptorIndex];
      }
    }
  }
  if (gpuInputAssembler && gpuShader && (isShaderChanged || gfxStateCache.gpuInputAssembler !== gpuInputAssembler)) {
    gfxStateCache.gpuInputAssembler = gpuInputAssembler;
    var ia = device.extensions.ANGLE_instanced_arrays;
    if (device.extensions.useVAO) {
      var vao = device.extensions.OES_vertex_array_object;
      var glVAO = gpuInputAssembler.glVAOs.get(gpuShader.glProgram);
      if (!glVAO) {
        glVAO = vao.createVertexArrayOES();
        gpuInputAssembler.glVAOs.set(gpuShader.glProgram, glVAO);
        vao.bindVertexArrayOES(glVAO);
        gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
        gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
        cache.glArrayBuffer = null;
        cache.glElementArrayBuffer = null;
        var glAttrib;
        var inputLen = gpuShader.glInputs.length;
        for (var _j2 = 0; _j2 < inputLen; _j2++) {
          var glInput = gpuShader.glInputs[_j2];
          glAttrib = null;
          var attribLen = gpuInputAssembler.glAttribs.length;
          for (var k = 0; k < attribLen; k++) {
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
              if (ia) {
                ia.vertexAttribDivisorANGLE(glLoc, glAttrib.isInstanced ? 1 : 0);
              }
            }
          }
        }
        var _gpuBuffer = gpuInputAssembler.gpuIndexBuffer;
        if (_gpuBuffer) {
          gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, _gpuBuffer.glBuffer);
        }
        vao.bindVertexArrayOES(null);
        gl.bindBuffer(WebGLConstants.ARRAY_BUFFER, null);
        gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, null);
        cache.glArrayBuffer = null;
        cache.glElementArrayBuffer = null;
      }
      if (cache.glVAO !== glVAO) {
        vao.bindVertexArrayOES(glVAO);
        cache.glVAO = glVAO;
      }
    } else {
      for (var a = 0; a < device.capabilities.maxVertexAttributes; ++a) {
        cache.glCurrentAttribLocs[a] = false;
      }
      var _inputLen = gpuShader.glInputs.length;
      for (var _j3 = 0; _j3 < _inputLen; _j3++) {
        var _glInput = gpuShader.glInputs[_j3];
        var _glAttrib = null;
        var _attribLen = gpuInputAssembler.glAttribs.length;
        for (var _k5 = 0; _k5 < _attribLen; _k5++) {
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
            var _glLoc4 = _glInput.glLoc + _c;
            var _attribOffset = _glAttrib.offset + _glAttrib.size * _c;
            if (!cache.glEnabledAttribLocs[_glLoc4] && _glLoc4 >= 0) {
              gl.enableVertexAttribArray(_glLoc4);
              cache.glEnabledAttribLocs[_glLoc4] = true;
            }
            cache.glCurrentAttribLocs[_glLoc4] = true;
            gl.vertexAttribPointer(_glLoc4, _glAttrib.count, _glAttrib.glType, _glAttrib.isNormalized, _glAttrib.stride, _attribOffset);
            if (ia) {
              ia.vertexAttribDivisorANGLE(_glLoc4, _glAttrib.isInstanced ? 1 : 0);
            }
          }
        }
      }
      var _gpuBuffer2 = gpuInputAssembler.gpuIndexBuffer;
      if (_gpuBuffer2) {
        if (cache.glElementArrayBuffer !== _gpuBuffer2.glBuffer) {
          gl.bindBuffer(WebGLConstants.ELEMENT_ARRAY_BUFFER, _gpuBuffer2.glBuffer);
          cache.glElementArrayBuffer = _gpuBuffer2.glBuffer;
        }
      }
      for (var _a = 0; _a < device.capabilities.maxVertexAttributes; ++_a) {
        if (cache.glEnabledAttribLocs[_a] !== cache.glCurrentAttribLocs[_a]) {
          gl.disableVertexAttribArray(_a);
          cache.glEnabledAttribLocs[_a] = false;
        }
      }
    }
  }
  if (gpuPipelineState && gpuPipelineState.dynamicStates.length) {
    var dsLen = gpuPipelineState.dynamicStates.length;
    for (var _j4 = 0; _j4 < dsLen; _j4++) {
      var dynamicState = gpuPipelineState.dynamicStates[_j4];
      switch (dynamicState) {
        case DynamicStateFlagBit.LINE_WIDTH:
          {
            if (cache.rs.lineWidth !== dynamicStates.lineWidth) {
              gl.lineWidth(dynamicStates.lineWidth);
              cache.rs.lineWidth = dynamicStates.lineWidth;
            }
            break;
          }
        case DynamicStateFlagBit.DEPTH_BIAS:
          {
            if (cache.rs.depthBias !== dynamicStates.depthBiasConstant || cache.rs.depthBiasSlop !== dynamicStates.depthBiasSlope) {
              gl.polygonOffset(dynamicStates.depthBiasConstant, dynamicStates.depthBiasSlope);
              cache.rs.depthBias = dynamicStates.depthBiasConstant;
              cache.rs.depthBiasSlop = dynamicStates.depthBiasSlope;
            }
            break;
          }
        case DynamicStateFlagBit.BLEND_CONSTANTS:
          {
            var blendConstant = dynamicStates.blendConstant;
            if (cacheBS.blendColor.x !== blendConstant.x || cacheBS.blendColor.y !== blendConstant.y || cacheBS.blendColor.z !== blendConstant.z || cacheBS.blendColor.w !== blendConstant.w) {
              gl.blendColor(blendConstant.x, blendConstant.y, blendConstant.z, blendConstant.w);
              cacheBS.blendColor.copy(blendConstant);
            }
            break;
          }
        case DynamicStateFlagBit.STENCIL_WRITE_MASK:
          {
            var front = dynamicStates.stencilStatesFront;
            var back = dynamicStates.stencilStatesBack;
            if (cacheDSS.stencilWriteMaskFront !== front.writeMask) {
              gl.stencilMaskSeparate(WebGLConstants.FRONT, front.writeMask);
              cacheDSS.stencilWriteMaskFront = front.writeMask;
            }
            if (cacheDSS.stencilWriteMaskBack !== back.writeMask) {
              gl.stencilMaskSeparate(WebGLConstants.BACK, back.writeMask);
              cacheDSS.stencilWriteMaskBack = back.writeMask;
            }
            break;
          }
        case DynamicStateFlagBit.STENCIL_COMPARE_MASK:
          {
            var _front = dynamicStates.stencilStatesFront;
            var _back = dynamicStates.stencilStatesBack;
            if (cacheDSS.stencilRefFront !== _front.reference || cacheDSS.stencilReadMaskFront !== _front.compareMask) {
              gl.stencilFuncSeparate(WebGLConstants.FRONT, WebGLCmpFuncs[cacheDSS.stencilFuncFront], _front.reference, _front.compareMask);
              cacheDSS.stencilRefFront = _front.reference;
              cacheDSS.stencilReadMaskFront = _front.compareMask;
            }
            if (cacheDSS.stencilRefBack !== _back.reference || cacheDSS.stencilReadMaskBack !== _back.compareMask) {
              gl.stencilFuncSeparate(WebGLConstants.BACK, WebGLCmpFuncs[cacheDSS.stencilFuncBack], _back.reference, _back.compareMask);
              cacheDSS.stencilRefBack = _back.reference;
              cacheDSS.stencilReadMaskBack = _back.compareMask;
            }
            break;
          }
      }
    }
  }
}
function WebGLCmdFuncDraw(device, drawInfo) {
  var gl = device.gl;
  var _device$extensions = device.extensions,
    ia = _device$extensions.ANGLE_instanced_arrays,
    md = _device$extensions.WEBGL_multi_draw;
  var gpuInputAssembler = gfxStateCache.gpuInputAssembler,
    glPrimitive = gfxStateCache.glPrimitive;
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
          for (var _j5 = 0; _j5 < indirects.drawCount; _j5++) {
            if (indirects.instances[_j5] && ia) {
              ia.drawElementsInstancedANGLE(glPrimitive, indirects.counts[_j5], gpuInputAssembler.glIndexType, indirects.byteOffsets[_j5], indirects.instances[_j5]);
            } else {
              gl.drawElements(glPrimitive, indirects.counts[_j5], gpuInputAssembler.glIndexType, indirects.byteOffsets[_j5]);
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
        for (var _j6 = 0; _j6 < indirects.drawCount; _j6++) {
          if (indirects.instances[_j6] && ia) {
            ia.drawArraysInstancedANGLE(glPrimitive, indirects.offsets[_j6], indirects.counts[_j6], indirects.instances[_j6]);
          } else {
            gl.drawArrays(glPrimitive, indirects.offsets[_j6], indirects.counts[_j6]);
          }
        }
      }
    } else if (drawInfo.instanceCount && ia) {
      if (indexBuffer) {
        if (drawInfo.indexCount > 0) {
          var offset = drawInfo.firstIndex * indexBuffer.stride;
          ia.drawElementsInstancedANGLE(glPrimitive, drawInfo.indexCount, gpuInputAssembler.glIndexType, offset, drawInfo.instanceCount);
        }
      } else if (drawInfo.vertexCount > 0) {
        ia.drawArraysInstancedANGLE(glPrimitive, drawInfo.firstVertex, drawInfo.vertexCount, drawInfo.instanceCount);
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
function WebGLCmdFuncCopyTexImagesToTexture(device, texImages, gpuTexture, regions) {
  var gl = device.gl,
    stateCache = device.stateCache;
  var glTexUnit = stateCache.glTexUnits[stateCache.texUnit];
  if (glTexUnit.glTexture !== gpuTexture.glTexture) {
    gl.bindTexture(gpuTexture.glTarget, gpuTexture.glTexture);
    glTexUnit.glTexture = gpuTexture.glTexture;
  }
  var n = 0;
  var f = 0;
  switch (gpuTexture.glTarget) {
    case WebGLConstants.TEXTURE_2D:
      {
        for (var i = 0; i < regions.length; i++) {
          var region = regions[i];
          gl.texSubImage2D(WebGLConstants.TEXTURE_2D, region.texSubres.mipLevel, region.texOffset.x, region.texOffset.y, gpuTexture.glFormat, gpuTexture.glType, texImages[n++]);
        }
        break;
      }
    case WebGLConstants.TEXTURE_CUBE_MAP:
      {
        for (var _i17 = 0; _i17 < regions.length; _i17++) {
          var _region = regions[_i17];
          var regionTexOffset = _region.texOffset;
          var regionTexSubres = _region.texSubres;
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
  if (gpuTexture.flags & TextureFlagBit.GEN_MIPMAP && gpuTexture.isPowerOf2) {
    gl.generateMipmap(gpuTexture.glTarget);
  }
}
var stagingBuffer = new Uint8Array(1);
function pixelBufferPick(buffer, format, offset, stride, extent) {
  var blockHeight = formatAlignment(format).height;
  var bufferSize = FormatSize(format, extent.width, extent.height, extent.depth);
  var rowStride = FormatSize(format, stride.width, 1, 1);
  var sliceStride = FormatSize(format, stride.width, stride.height, 1);
  var chunkSize = FormatSize(format, extent.width, 1, 1);
  var ArrayBufferCtor = getTypedArrayConstructor(FormatInfos[format]);
  if (stagingBuffer.byteLength < bufferSize) {
    stagingBuffer = new Uint8Array(bufferSize);
  }
  var destOffset = 0;
  var bufferOffset = offset;
  for (var i = 0; i < extent.depth; i++) {
    bufferOffset = offset + sliceStride * i;
    for (var j = 0; j < extent.height; j += blockHeight) {
      stagingBuffer.subarray(destOffset, destOffset + chunkSize).set(new Uint8Array(buffer.buffer, buffer.byteOffset + bufferOffset, chunkSize));
      destOffset += chunkSize;
      bufferOffset += rowStride;
    }
  }
  var length = bufferSize / ArrayBufferCtor.BYTES_PER_ELEMENT;
  assertID(Number.isInteger(length), 9101);
  return new ArrayBufferCtor(stagingBuffer.buffer, 0, length);
}
function WebGLCmdFuncCopyBuffersToTexture(device, buffers, gpuTexture, regions) {
  var gl = device.gl,
    stateCache = device.stateCache;
  var glTexUnit = stateCache.glTexUnits[stateCache.texUnit];
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
        for (var i = 0; i < regions.length; i++) {
          var region = regions[i];
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
          } else if (gpuTexture.glInternalFmt !== WebGLEXT.COMPRESSED_RGB_ETC1_WEBGL && !device.extensions.noCompressedTexSubImage2D) {
            gl.compressedTexSubImage2D(WebGLConstants.TEXTURE_2D, mipLevel, offset.x, offset.y, destWidth, destHeight, gpuTexture.glFormat, pixels);
          } else {
            gl.compressedTexImage2D(WebGLConstants.TEXTURE_2D, mipLevel, gpuTexture.glInternalFmt, destWidth, destHeight, 0, pixels);
          }
        }
        break;
      }
    case WebGLConstants.TEXTURE_CUBE_MAP:
      {
        for (var _i18 = 0; _i18 < regions.length; _i18++) {
          var _region2 = regions[_i18];
          var _mipLevel = _region2.texSubres.mipLevel;
          var _regionTexOffset = _region2.texOffset;
          var _regionTexExtent = _region2.texExtent;
          var regionTexSubres = _region2.texSubres;
          var _regionTexExtentWidth = _regionTexExtent.width;
          var _regionTexExtentHeight = _regionTexExtent.height;
          var _blockSizeWidth = blockSize.width;
          var _blockSizeHeight = blockSize.height;
          offset.x = _regionTexOffset.x === 0 ? 0 : alignTo(_regionTexOffset.x, _blockSizeWidth);
          offset.y = _regionTexOffset.y === 0 ? 0 : alignTo(_regionTexOffset.y, _blockSizeHeight);
          extent.width = _regionTexExtentWidth < _blockSizeWidth ? _regionTexExtentWidth : alignTo(_regionTexExtentWidth, _blockSizeWidth);
          extent.height = _regionTexExtentHeight < _blockSizeHeight ? _regionTexExtentWidth : alignTo(_regionTexExtentHeight, _blockSizeHeight);
          stride.width = _region2.buffStride > 0 ? _region2.buffStride : extent.width;
          stride.height = _region2.buffTexHeight > 0 ? _region2.buffTexHeight : extent.height;
          var _destWidth = _regionTexExtentWidth + offset.x === gpuTexture.width >> _mipLevel ? _regionTexExtentWidth : extent.width;
          var _destHeight = _regionTexExtentHeight + offset.y === gpuTexture.height >> _mipLevel ? _regionTexExtentHeight : extent.height;
          var fcount = regionTexSubres.baseArrayLayer + regionTexSubres.layerCount;
          for (f = regionTexSubres.baseArrayLayer; f < fcount; ++f) {
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
              gl.texSubImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _mipLevel, offset.x, offset.y, _destWidth, _destHeight, gpuTexture.glFormat, gpuTexture.glType, _pixels);
            } else if (gpuTexture.glInternalFmt !== WebGLEXT.COMPRESSED_RGB_ETC1_WEBGL && !device.extensions.noCompressedTexSubImage2D) {
              gl.compressedTexSubImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _mipLevel, offset.x, offset.y, _destWidth, _destHeight, gpuTexture.glFormat, _pixels);
            } else {
              gl.compressedTexImage2D(WebGLConstants.TEXTURE_CUBE_MAP_POSITIVE_X + f, _mipLevel, gpuTexture.glInternalFmt, _destWidth, _destHeight, 0, _pixels);
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
function WebGLCmdFuncCopyTextureToBuffers(device, gpuTexture, buffers, regions) {
  var gl = device.gl;
  var cache = device.stateCache;
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
function WebGLCmdFuncBlitTexture(device, srcTexture, dstTexture, regions, filter) {
  device.blitManager.draw(srcTexture, dstTexture, regions, filter);
}

function createInt32Array(capacity) {
  return new Int32Array(capacity);
}
var WebGLIndirectDrawInfos = function () {
  function WebGLIndirectDrawInfos() {
    this.drawCount = 0;
    this.drawByIndex = false;
    this.instancedDraw = false;
    this._capacity = 4;
    this.counts = createInt32Array(this._capacity);
    this.offsets = createInt32Array(this._capacity);
    this.instances = createInt32Array(this._capacity);
    this.byteOffsets = createInt32Array(this._capacity);
  }
  var _proto = WebGLIndirectDrawInfos.prototype;
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
    var counts = createInt32Array(this._capacity);
    var offsets = createInt32Array(this._capacity);
    var instances = createInt32Array(this._capacity);
    this.byteOffsets = createInt32Array(this._capacity);
    counts.set(this.counts);
    offsets.set(this.offsets);
    instances.set(this.instances);
    this.counts = counts;
    this.offsets = offsets;
    this.instances = instances;
  };
  return WebGLIndirectDrawInfos;
}();
var IWebGLBlitManager = function () {
  function IWebGLBlitManager() {
    this._gpuShader = null;
    this._gpuDescriptorSetLayout = null;
    this._gpuPipelineLayout = null;
    this._gpuPipelineState = null;
    this._gpuVertexBuffer = null;
    this._gpuInputAssembler = null;
    this._gpuPointSampler = null;
    this._gpuLinearSampler = null;
    this._gpuDescriptorSet = null;
    this._gpuUniformBuffer = null;
    this._drawInfo = null;
    this._glFramebuffer = null;
    this._uniformBuffer = null;
    var device = WebGLDeviceManager.instance;
    var samplerOffset = device.bindingMappingInfo.maxBlockCounts[0];
    this._gpuShader = {
      name: 'Blit Pass',
      blocks: [new UniformBlock(0, 0, "BlitParams", [new Uniform("tilingOffsetSrc", Type.FLOAT4, 1), new Uniform("tilingOffsetDst", Type.FLOAT4, 1)], 1)],
      samplerTextures: [new UniformSamplerTexture(0, samplerOffset, 'textureSrc', Type.SAMPLER2D, 1)],
      subpassInputs: [],
      gpuStages: [{
        type: ShaderStageFlagBit.VERTEX,
        source: "\nprecision mediump float;\nattribute vec2 a_position;\nattribute vec2 a_texCoord;\nuniform vec4 tilingOffsetSrc;\nuniform vec4 tilingOffsetDst;\nvarying vec2 v_texCoord;\nvoid main() {\n    v_texCoord = a_texCoord * tilingOffsetSrc.xy + tilingOffsetSrc.zw;\n    gl_Position = vec4((a_position + 1.0) * tilingOffsetDst.xy - 1.0 + tilingOffsetDst.zw * 2.0, 0, 1);\n}",
        glShader: null
      }, {
        type: ShaderStageFlagBit.FRAGMENT,
        source: "\nprecision mediump float;\nuniform sampler2D textureSrc;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_FragColor = texture2D(textureSrc, v_texCoord);\n}",
        glShader: null
      }],
      glProgram: null,
      glInputs: [],
      glUniforms: [],
      glBlocks: [],
      glSamplerTextures: []
    };
    WebGLCmdFuncCreateShader(WebGLDeviceManager.instance, this._gpuShader);
    this._gpuDescriptorSetLayout = {
      bindings: [new DescriptorSetLayoutBinding(0, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX), new DescriptorSetLayoutBinding(samplerOffset, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT)],
      dynamicBindings: [],
      descriptorIndices: [],
      descriptorCount: samplerOffset + 1
    };
    for (var i = 0; i < samplerOffset; i++) {
      this._gpuDescriptorSetLayout.descriptorIndices[i] = 0;
    }
    this._gpuDescriptorSetLayout.descriptorIndices.push(1);
    this._gpuPipelineLayout = {
      gpuSetLayouts: [this._gpuDescriptorSetLayout],
      dynamicOffsetCount: 0,
      dynamicOffsetOffsets: [0],
      dynamicOffsetIndices: [[]]
    };
    this._gpuPipelineState = {
      glPrimitive: WebGLConstants.TRIANGLE_STRIP,
      gpuShader: this._gpuShader,
      gpuPipelineLayout: this._gpuPipelineLayout,
      rs: null,
      dss: new DepthStencilState(false, false),
      bs: null,
      dynamicStates: [],
      gpuRenderPass: null
    };
    this._gpuVertexBuffer = {
      usage: BufferUsageBit.VERTEX,
      memUsage: MemoryUsageBit.DEVICE,
      size: 16 * Float32Array.BYTES_PER_ELEMENT,
      stride: 4 * Float32Array.BYTES_PER_ELEMENT,
      buffer: null,
      vf32: null,
      indirects: new WebGLIndirectDrawInfos(),
      glTarget: 0,
      glBuffer: null
    };
    WebGLCmdFuncCreateBuffer(WebGLDeviceManager.instance, this._gpuVertexBuffer);
    WebGLDeviceManager.instance.memoryStatus.bufferSize += this._gpuVertexBuffer.size;
    var data = new Float32Array([-1, -1, 0.0, 0.0, 1.0, -1, 1.0, 0.0, -1, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    WebGLCmdFuncUpdateBuffer(WebGLDeviceManager.instance, this._gpuVertexBuffer, data, 0, data.length);
    this._gpuInputAssembler = {
      attributes: [new Attribute("a_position", Format.RG32F), new Attribute("a_texCoord", Format.RG32F)],
      gpuVertexBuffers: [this._gpuVertexBuffer],
      gpuIndexBuffer: null,
      gpuIndirectBuffer: null,
      glAttribs: [],
      glIndexType: 0,
      glVAOs: new Map()
    };
    WebGLCmdFuncCreateInputAssember(WebGLDeviceManager.instance, this._gpuInputAssembler);
    this._gpuPointSampler = {
      glMinFilter: 0x2600,
      glMagFilter: 0x2600,
      glWrapS: 0x2901,
      glWrapT: 0x2901,
      glWrapR: 0x2901
    };
    this._gpuLinearSampler = {
      glMinFilter: 0x2601,
      glMagFilter: 0x2601,
      glWrapS: 0x2901,
      glWrapT: 0x2901,
      glWrapR: 0x2901
    };
    this._uniformBuffer = new Float32Array(8);
    this._gpuUniformBuffer = {
      usage: BufferUsageBit.UNIFORM,
      memUsage: MemoryUsageBit.DEVICE,
      size: 8 * Float32Array.BYTES_PER_ELEMENT,
      stride: 8 * Float32Array.BYTES_PER_ELEMENT,
      buffer: this._uniformBuffer,
      vf32: null,
      indirects: new WebGLIndirectDrawInfos(),
      glTarget: 0,
      glBuffer: null
    };
    WebGLCmdFuncCreateBuffer(WebGLDeviceManager.instance, this._gpuUniformBuffer);
    WebGLDeviceManager.instance.memoryStatus.bufferSize += this._gpuUniformBuffer.size;
    this._gpuDescriptorSet = {
      gpuDescriptors: [{
        type: DescriptorType.UNIFORM_BUFFER,
        gpuBuffer: this._gpuUniformBuffer,
        gpuTexture: null,
        gpuSampler: null
      }, {
        type: DescriptorType.SAMPLER_TEXTURE,
        gpuBuffer: null,
        gpuTexture: null,
        gpuSampler: null
      }],
      descriptorIndices: this._gpuDescriptorSetLayout.descriptorIndices
    };
    this._drawInfo = new DrawInfo(4, 0, 0, 0, 0, 0, 0);
    this._glFramebuffer = WebGLDeviceManager.instance.gl.createFramebuffer();
  }
  var _proto2 = IWebGLBlitManager.prototype;
  _proto2.destroy = function destroy() {
    if (this._glFramebuffer) {
      WebGLDeviceManager.instance.gl.deleteFramebuffer(this._glFramebuffer);
      this._glFramebuffer = null;
    }
    if (this._gpuVertexBuffer) {
      WebGLDeviceManager.instance.memoryStatus.bufferSize -= this._gpuVertexBuffer.size;
      WebGLCmdFuncDestroyBuffer(WebGLDeviceManager.instance, this._gpuVertexBuffer);
    }
    if (this._gpuUniformBuffer) {
      WebGLDeviceManager.instance.memoryStatus.bufferSize -= this._gpuUniformBuffer.size;
      WebGLCmdFuncDestroyBuffer(WebGLDeviceManager.instance, this._gpuUniformBuffer);
    }
    if (this._gpuShader) {
      WebGLCmdFuncDestroyShader(WebGLDeviceManager.instance, this._gpuShader);
    }
    if (this._gpuInputAssembler) {
      WebGLCmdFuncDestroyInputAssembler(WebGLDeviceManager.instance, this._gpuInputAssembler);
    }
  };
  _proto2.draw = function draw(gpuTextureSrc, gpuTextureDst, regions, filter) {
    var device = WebGLDeviceManager.instance;
    var gl = device.gl;
    var stateCache = device.stateCache;
    var origFramebuffer = stateCache.glFramebuffer;
    gl.viewport(0, 0, gpuTextureDst.width, gpuTextureDst.height);
    gl.scissor(0, 0, gpuTextureDst.width, gpuTextureDst.height);
    if (!this._uniformBuffer || !this._gpuUniformBuffer || !this._gpuPipelineState || !this._gpuInputAssembler || !this._gpuDescriptorSet || !this._drawInfo) {
      return;
    }
    var descriptor = this._gpuDescriptorSet.gpuDescriptors[1];
    descriptor.gpuTexture = gpuTextureSrc;
    descriptor.gpuSampler = filter === Filter.POINT ? this._gpuPointSampler : this._gpuLinearSampler;
    var formatInfo = FormatInfos[gpuTextureDst.format];
    var attachment = WebGLConstants.COLOR_ATTACHMENT0;
    if (formatInfo.hasStencil) {
      attachment = WebGLConstants.DEPTH_STENCIL_ATTACHMENT;
    } else if (formatInfo.hasDepth) {
      attachment = WebGLConstants.DEPTH_ATTACHMENT;
    }
    var regionIndices = regions.map(function (_, i) {
      return i;
    });
    regionIndices.sort(function (a, b) {
      return regions[a].srcSubres.mipLevel - regions[b].srcSubres.mipLevel;
    });
    if (stateCache.glFramebuffer !== this._glFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, this._glFramebuffer);
      stateCache.glFramebuffer = this._glFramebuffer;
    }
    var mipLevel = regions[0].dstSubres.mipLevel;
    if (gpuTextureDst.glTexture) {
      gl.framebufferTexture2D(WebGLConstants.FRAMEBUFFER, attachment, gpuTextureDst.glTarget, gpuTextureDst.glTexture, mipLevel);
    } else {
      gl.framebufferRenderbuffer(WebGLConstants.FRAMEBUFFER, attachment, WebGLConstants.RENDERBUFFER, gpuTextureDst.glRenderbuffer);
    }
    for (var i = 0; i < regionIndices.length; ++i) {
      var region = regions[regionIndices[i]];
      if (gpuTextureSrc.glTexture && mipLevel !== region.srcSubres.mipLevel) {
        mipLevel = region.srcSubres.mipLevel;
        gl.framebufferTexture2D(WebGLConstants.FRAMEBUFFER, attachment, gpuTextureDst.glTarget, gpuTextureDst.glTexture, mipLevel);
      }
      var srcWidth = gpuTextureSrc.width;
      var srcHeight = gpuTextureSrc.height;
      var dstWidth = gpuTextureDst.width;
      var dstHeight = gpuTextureDst.height;
      this._uniformBuffer[0] = region.srcExtent.width / srcWidth;
      this._uniformBuffer[1] = region.srcExtent.height / srcHeight;
      this._uniformBuffer[2] = region.srcOffset.x / srcWidth;
      this._uniformBuffer[3] = region.srcOffset.y / srcHeight;
      this._uniformBuffer[4] = region.dstExtent.width / dstWidth;
      this._uniformBuffer[5] = region.dstExtent.height / dstHeight;
      this._uniformBuffer[6] = region.dstOffset.x / dstWidth;
      this._uniformBuffer[7] = region.dstOffset.y / dstHeight;
      WebGLCmdFuncUpdateBuffer(device, this._gpuUniformBuffer, this._uniformBuffer, 0, this._uniformBuffer.length * Float32Array.BYTES_PER_ELEMENT);
      WebGLCmdFuncBindStates(device, this._gpuPipelineState, this._gpuInputAssembler, [this._gpuDescriptorSet], [], null);
      WebGLCmdFuncDraw(device, this._drawInfo);
    }
    if (stateCache.glFramebuffer !== origFramebuffer) {
      gl.bindFramebuffer(WebGLConstants.FRAMEBUFFER, origFramebuffer);
      stateCache.glFramebuffer = origFramebuffer;
    }
    var origViewport = stateCache.viewport;
    gl.viewport(origViewport.left, origViewport.top, origViewport.width, origViewport.height);
    var origScissor = stateCache.scissorRect;
    gl.scissor(origScissor.x, origScissor.y, origScissor.width, origScissor.height);
  };
  return IWebGLBlitManager;
}();

var WebGLBuffer = function (_Buffer) {
  function WebGLBuffer() {
    var _this;
    _this = _Buffer.call(this) || this;
    _this._gpuBuffer = null;
    _this._gpuBufferView = null;
    _this._uniformBuffer = null;
    return _this;
  }
  _inheritsLoose(WebGLBuffer, _Buffer);
  var _proto = WebGLBuffer.prototype;
  _proto.initialize = function initialize(info) {
    if ('buffer' in info) {
      this._isBufferView = true;
      var buffer = info.buffer;
      this._usage = buffer.usage;
      this._memUsage = buffer.memUsage;
      this._size = this._stride = info.range;
      this._count = 1;
      this._flags = buffer.flags;
      this._gpuBufferView = {
        gpuBuffer: buffer.gpuBuffer,
        offset: info.offset,
        range: info.range
      };
    } else {
      this._usage = info.usage;
      this._memUsage = info.memUsage;
      this._size = info.size;
      this._stride = Math.max(info.stride || this._size, 1);
      this._count = this._size / this._stride;
      this._flags = info.flags;
      if (this._usage & BufferUsageBit.UNIFORM && this._size > 0) {
        this._uniformBuffer = new Uint8Array(this._size);
      }
      this._gpuBuffer = {
        usage: this._usage,
        memUsage: this._memUsage,
        size: this._size,
        stride: this._stride,
        buffer: null,
        vf32: null,
        indirects: new WebGLIndirectDrawInfos(),
        glTarget: 0,
        glBuffer: null
      };
      if (this._usage & BufferUsageBit.UNIFORM) {
        this._gpuBuffer.buffer = this._uniformBuffer;
      }
      WebGLCmdFuncCreateBuffer(WebGLDeviceManager.instance, this._gpuBuffer);
      WebGLDeviceManager.instance.memoryStatus.bufferSize += this._size;
    }
  };
  _proto.destroy = function destroy() {
    if (this._gpuBuffer) {
      WebGLCmdFuncDestroyBuffer(WebGLDeviceManager.instance, this._gpuBuffer);
      WebGLDeviceManager.instance.memoryStatus.bufferSize -= this._size;
      this._gpuBuffer = null;
    }
    if (this._gpuBufferView) {
      this._gpuBufferView = null;
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
    if (this._uniformBuffer) {
      this._uniformBuffer = new Uint8Array(size);
    }
    if (this._gpuBuffer) {
      if (this._uniformBuffer) {
        this._gpuBuffer.buffer = this._uniformBuffer;
      }
      this._gpuBuffer.size = size;
      if (size > 0) {
        WebGLCmdFuncResizeBuffer(WebGLDeviceManager.instance, this._gpuBuffer);
        WebGLDeviceManager.instance.memoryStatus.bufferSize -= oldSize;
        WebGLDeviceManager.instance.memoryStatus.bufferSize += size;
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
    WebGLCmdFuncUpdateBuffer(WebGLDeviceManager.instance, this._gpuBuffer, buffer, 0, buffSize);
  };
  return _createClass(WebGLBuffer, [{
    key: "gpuBuffer",
    get: function get() {
      return this._gpuBuffer;
    }
  }, {
    key: "gpuBufferView",
    get: function get() {
      return this._gpuBufferView;
    }
  }]);
}(Buffer);

var WebGLCommandBuffer = function (_CommandBuffer) {
  function WebGLCommandBuffer() {
    var _this;
    _this = _CommandBuffer.call(this) || this;
    _this._isInRenderPass = false;
    _this._curGPUPipelineState = null;
    _this._curGPUInputAssembler = null;
    _this._curGPUDescriptorSets = [];
    _this._curDynamicOffsets = Array(8).fill(0);
    _this._curDynamicStates = new DynamicStates();
    _this._isStateInvalied = false;
    return _this;
  }
  _inheritsLoose(WebGLCommandBuffer, _CommandBuffer);
  var _proto = WebGLCommandBuffer.prototype;
  _proto.initialize = function initialize(info) {
    this._type = info.type;
    this._queue = info.queue;
    var setCount = WebGLDeviceManager.instance.bindingMappings.blockOffsets.length;
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
  };
  _proto.end = function end() {
    if (this._isStateInvalied) {
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
      this._isStateInvalied = true;
    }
  };
  _proto.bindDescriptorSet = function bindDescriptorSet(set, descriptorSet, dynamicOffsets) {
    var gpuDescriptorSet = descriptorSet.gpuDescriptorSet;
    if (gpuDescriptorSet !== this._curGPUDescriptorSets[set]) {
      this._curGPUDescriptorSets[set] = gpuDescriptorSet;
      this._isStateInvalied = true;
    }
    if (dynamicOffsets) {
      var _this$_curGPUPipeline;
      var gpuPipelineLayout = (_this$_curGPUPipeline = this._curGPUPipelineState) == null ? void 0 : _this$_curGPUPipeline.gpuPipelineLayout;
      if (gpuPipelineLayout) {
        var offsets = this._curDynamicOffsets;
        var idx = gpuPipelineLayout.dynamicOffsetOffsets[set];
        for (var i = 0; i < dynamicOffsets.length; i++) offsets[idx + i] = dynamicOffsets[i];
        this._isStateInvalied = true;
      }
    }
  };
  _proto.bindInputAssembler = function bindInputAssembler(inputAssembler) {
    var gpuInputAssembler = inputAssembler.getGpuInputAssembler();
    this._curGPUInputAssembler = gpuInputAssembler;
    this._isStateInvalied = true;
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
      this._isStateInvalied = true;
    }
  };
  _proto.setScissor = function setScissor(scissor) {
    var cache = this._curDynamicStates.scissor;
    if (cache.x !== scissor.x || cache.y !== scissor.y || cache.width !== scissor.width || cache.height !== scissor.height) {
      cache.x = scissor.x;
      cache.y = scissor.y;
      cache.width = scissor.width;
      cache.height = scissor.height;
      this._isStateInvalied = true;
    }
  };
  _proto.setLineWidth = function setLineWidth(lineWidth) {
    if (this._curDynamicStates.lineWidth !== lineWidth) {
      this._curDynamicStates.lineWidth = lineWidth;
      this._isStateInvalied = true;
    }
  };
  _proto.setDepthBias = function setDepthBias(depthBiasConstantFactor, depthBiasClamp, depthBiasSlopeFactor) {
    var cache = this._curDynamicStates;
    if (cache.depthBiasConstant !== depthBiasConstantFactor || cache.depthBiasClamp !== depthBiasClamp || cache.depthBiasSlope !== depthBiasSlopeFactor) {
      cache.depthBiasConstant = depthBiasConstantFactor;
      cache.depthBiasClamp = depthBiasClamp;
      cache.depthBiasSlope = depthBiasSlopeFactor;
      this._isStateInvalied = true;
    }
  };
  _proto.setBlendConstants = function setBlendConstants(blendConstants) {
    var cache = this._curDynamicStates.blendConstant;
    if (cache.x !== blendConstants.x || cache.y !== blendConstants.y || cache.z !== blendConstants.z || cache.w !== blendConstants.w) {
      cache.copy(blendConstants);
      this._isStateInvalied = true;
    }
  };
  _proto.setDepthBound = function setDepthBound(minDepthBounds, maxDepthBounds) {
    var cache = this._curDynamicStates;
    if (cache.depthMinBounds !== minDepthBounds || cache.depthMaxBounds !== maxDepthBounds) {
      cache.depthMinBounds = minDepthBounds;
      cache.depthMaxBounds = maxDepthBounds;
      this._isStateInvalied = true;
    }
  };
  _proto.setStencilWriteMask = function setStencilWriteMask(face, writeMask) {
    var front = this._curDynamicStates.stencilStatesFront;
    var back = this._curDynamicStates.stencilStatesBack;
    if (face & StencilFace.FRONT) {
      if (front.writeMask !== writeMask) {
        front.writeMask = writeMask;
        this._isStateInvalied = true;
      }
    }
    if (face & StencilFace.BACK) {
      if (back.writeMask !== writeMask) {
        back.writeMask = writeMask;
        this._isStateInvalied = true;
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
        this._isStateInvalied = true;
      }
    }
    if (face & StencilFace.BACK) {
      if (back.compareMask !== compareMask || back.reference !== reference) {
        back.reference = reference;
        back.compareMask = compareMask;
        this._isStateInvalied = true;
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
  };
  _proto.blitTexture = function blitTexture(srcTexture, dstTexture, regions, filter) {
    errorID(16401);
  };
  return WebGLCommandBuffer;
}(CommandBuffer);

var WebGLFramebuffer = function (_Framebuffer) {
  function WebGLFramebuffer() {
    var _this;
    _this = _Framebuffer.call(this) || this;
    _this._gpuFramebuffer = null;
    _this._gpuColorTextures = [];
    _this._gpuDepthStencilTexture = void 0;
    return _this;
  }
  _inheritsLoose(WebGLFramebuffer, _Framebuffer);
  var _proto = WebGLFramebuffer.prototype;
  _proto.getGpuFramebuffer = function getGpuFramebuffer() {
    return this._gpuFramebuffer;
  };
  _proto.initialize = function initialize(info) {
    var _this2 = this,
      _this$_gpuFramebuffer;
    this._renderPass = info.renderPass;
    this._colorTextures = info.colorTextures || [];
    var depthStencilTexture = this._depthStencilTexture = info.depthStencilTexture || null;
    var lodLevel = 0;
    var gpuColorTextures = [];
    for (var i = 0; i < info.colorTextures.length; ++i) {
      var colorTexture = info.colorTextures[i];
      if (colorTexture) {
        gpuColorTextures.push(colorTexture.gpuTexture);
        lodLevel = colorTexture.lodLevel;
      }
    }
    var gpuDepthStencilTexture = null;
    if (depthStencilTexture) {
      gpuDepthStencilTexture = depthStencilTexture.gpuTexture;
      lodLevel = depthStencilTexture.lodLevel;
    }
    var width = Number.MAX_SAFE_INTEGER;
    var height = Number.MAX_SAFE_INTEGER;
    this._gpuFramebuffer = {
      gpuRenderPass: info.renderPass.gpuRenderPass,
      gpuColorTextures: gpuColorTextures,
      gpuDepthStencilTexture: gpuDepthStencilTexture,
      glFramebuffer: null,
      isOffscreen: true,
      get width() {
        if (this.gpuColorTextures.length > 0) {
          return this.gpuColorTextures[0].width;
        } else if (this.gpuDepthStencilTexture) {
          return this.gpuDepthStencilTexture.width;
        }
        return width;
      },
      set width(val) {
        width = val;
      },
      get height() {
        if (this.gpuColorTextures.length > 0) {
          return this.gpuColorTextures[0].height;
        } else if (this.gpuDepthStencilTexture) {
          return this.gpuDepthStencilTexture.height;
        }
        return height;
      },
      set height(val) {
        height = val;
      },
      lodLevel: lodLevel
    };
    WebGLCmdFuncCreateFramebuffer(WebGLDeviceManager.instance, this._gpuFramebuffer);
    this._gpuFramebuffer.gpuColorTextures.forEach(function (tex) {
      return _this2._gpuColorTextures.push(tex.glTexture);
    });
    this._gpuDepthStencilTexture = (_this$_gpuFramebuffer = this._gpuFramebuffer.gpuDepthStencilTexture) == null ? void 0 : _this$_gpuFramebuffer.glTexture;
    this._width = this._gpuFramebuffer.width;
    this._height = this._gpuFramebuffer.height;
  };
  _proto.destroy = function destroy() {
    if (this._gpuFramebuffer) {
      WebGLCmdFuncDestroyFramebuffer(WebGLDeviceManager.instance, this._gpuFramebuffer);
      this._gpuFramebuffer = null;
      this._gpuColorTextures.length = 0;
      this._gpuDepthStencilTexture = null;
    }
  };
  return _createClass(WebGLFramebuffer, [{
    key: "needRebuild",
    get: function get() {
      var gpuFramebuffer = this._gpuFramebuffer;
      if (gpuFramebuffer) {
        var _gpuFramebuffer$gpuDe;
        for (var i = 0; i < gpuFramebuffer.gpuColorTextures.length; i++) {
          if (gpuFramebuffer.gpuColorTextures[i].glTexture !== this._gpuColorTextures[i]) {
            return true;
          }
        }
        if (((_gpuFramebuffer$gpuDe = gpuFramebuffer.gpuDepthStencilTexture) == null ? void 0 : _gpuFramebuffer$gpuDe.glTexture) !== this._gpuDepthStencilTexture) {
          return true;
        }
      }
      return false;
    }
  }]);
}(Framebuffer);

var WebGLInputAssembler = function (_InputAssembler) {
  function WebGLInputAssembler() {
    var _this;
    _this = _InputAssembler.call(this) || this;
    _this._gpuInputAssembler = null;
    return _this;
  }
  _inheritsLoose(WebGLInputAssembler, _InputAssembler);
  var _proto = WebGLInputAssembler.prototype;
  _proto.getGpuInputAssembler = function getGpuInputAssembler() {
    return this._gpuInputAssembler;
  };
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
      if (vb.gpuBuffer) {
        gpuVertexBuffers[i] = vb.gpuBuffer;
      }
    }
    var gpuIndexBuffer = null;
    var glIndexType = 0;
    if (info.indexBuffer) {
      gpuIndexBuffer = info.indexBuffer.gpuBuffer;
      if (gpuIndexBuffer) {
        switch (gpuIndexBuffer.stride) {
          case 1:
            glIndexType = 0x1401;
            break;
          case 2:
            glIndexType = 0x1403;
            break;
          case 4:
            glIndexType = 0x1405;
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
      gpuIndirectBuffer = info.indirectBuffer.gpuBuffer;
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
    WebGLCmdFuncCreateInputAssember(WebGLDeviceManager.instance, this._gpuInputAssembler);
  };
  _proto.destroy = function destroy() {
    var device = WebGLDeviceManager.instance;
    if (this._gpuInputAssembler && device.extensions.useVAO) {
      WebGLCmdFuncDestroyInputAssembler(device, this._gpuInputAssembler);
    }
    this._gpuInputAssembler = null;
  };
  return WebGLInputAssembler;
}(InputAssembler);

var WebGLDescriptorSetLayout = function (_DescriptorSetLayout) {
  function WebGLDescriptorSetLayout() {
    var _this;
    _this = _DescriptorSetLayout.call(this) || this;
    _this._gpuDescriptorSetLayout = null;
    return _this;
  }
  _inheritsLoose(WebGLDescriptorSetLayout, _DescriptorSetLayout);
  var _proto = WebGLDescriptorSetLayout.prototype;
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
  return _createClass(WebGLDescriptorSetLayout, [{
    key: "gpuDescriptorSetLayout",
    get: function get() {
      return this._gpuDescriptorSetLayout;
    }
  }]);
}(DescriptorSetLayout);

var WebGLPipelineLayout = function (_PipelineLayout) {
  function WebGLPipelineLayout() {
    var _this;
    _this = _PipelineLayout.call(this) || this;
    _this._gpuPipelineLayout = null;
    return _this;
  }
  _inheritsLoose(WebGLPipelineLayout, _PipelineLayout);
  var _proto = WebGLPipelineLayout.prototype;
  _proto.initialize = function initialize(info) {
    Array.prototype.push.apply(this._setLayouts, info.setLayouts);
    var dynamicOffsetIndices = [];
    var gpuSetLayouts = [];
    var dynamicOffsetCount = 0;
    var dynamicOffsetOffsets = [];
    for (var i = 0; i < this._setLayouts.length; i++) {
      var setLayout = this._setLayouts[i];
      var dynamicBindings = setLayout.gpuDescriptorSetLayout.dynamicBindings;
      var indices = Array(setLayout.bindingIndices.length).fill(-1);
      for (var j = 0; j < dynamicBindings.length; j++) {
        var binding = dynamicBindings[j];
        if (indices[binding] < 0) indices[binding] = dynamicOffsetCount + j;
      }
      gpuSetLayouts.push(setLayout.gpuDescriptorSetLayout);
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
  return _createClass(WebGLPipelineLayout, [{
    key: "gpuPipelineLayout",
    get: function get() {
      return this._gpuPipelineLayout;
    }
  }]);
}(PipelineLayout);

var WebGLPrimitives = [0x0000, 0x0001, 0x0003, 0x0002, 0x0000, 0x0000, 0x0000, 0x0004, 0x0005, 0x0006, 0x0000, 0x0000, 0x0000, 0x0000];
var WebGLPipelineState = function (_PipelineState) {
  function WebGLPipelineState() {
    var _this;
    _this = _PipelineState.call(this) || this;
    _this._gpuPipelineState = null;
    return _this;
  }
  _inheritsLoose(WebGLPipelineState, _PipelineState);
  var _proto = WebGLPipelineState.prototype;
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
      gpuPipelineLayout: info.pipelineLayout.gpuPipelineLayout,
      rs: info.rasterizerState,
      dss: info.depthStencilState,
      bs: info.blendState,
      gpuRenderPass: info.renderPass.gpuRenderPass,
      dynamicStates: dynamicStates
    };
  };
  _proto.destroy = function destroy() {
    this._gpuPipelineState = null;
  };
  return _createClass(WebGLPipelineState, [{
    key: "gpuPipelineState",
    get: function get() {
      return this._gpuPipelineState;
    }
  }]);
}(PipelineState);

var WebGLPrimaryCommandBuffer = function (_WebGLCommandBuffer) {
  function WebGLPrimaryCommandBuffer() {
    return _WebGLCommandBuffer.apply(this, arguments) || this;
  }
  _inheritsLoose(WebGLPrimaryCommandBuffer, _WebGLCommandBuffer);
  var _proto = WebGLPrimaryCommandBuffer.prototype;
  _proto.beginRenderPass = function beginRenderPass(renderPass, framebuffer, renderArea, clearColors, clearDepth, clearStencil) {
    WebGLCmdFuncBeginRenderPass(WebGLDeviceManager.instance, renderPass.gpuRenderPass, framebuffer.getGpuFramebuffer(), renderArea, clearColors, clearDepth, clearStencil);
    this._isInRenderPass = true;
  };
  _proto.draw = function draw(infoOrAssembler) {
    if (this._isInRenderPass) {
      if (this._isStateInvalied) {
        this.bindStates();
      }
      var info = 'drawInfo' in infoOrAssembler ? infoOrAssembler.drawInfo : infoOrAssembler;
      WebGLCmdFuncDraw(WebGLDeviceManager.instance, info);
      ++this._numDrawCalls;
      this._numInstances += info.instanceCount;
      var indexCount = info.indexCount || info.vertexCount;
      if (this._curGPUPipelineState) {
        var glPrimitive = this._curGPUPipelineState.glPrimitive;
        switch (glPrimitive) {
          case WebGLConstants.TRIANGLES:
            {
              this._numTris += indexCount / 3 * Math.max(info.instanceCount, 1);
              break;
            }
          case WebGLConstants.TRIANGLE_STRIP:
          case WebGLConstants.TRIANGLE_FAN:
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
    var _WebGLDeviceManager$i = WebGLDeviceManager.instance,
      cache = _WebGLDeviceManager$i.stateCache,
      gl = _WebGLDeviceManager$i.gl;
    if (cache.viewport.left !== viewport.left || cache.viewport.top !== viewport.top || cache.viewport.width !== viewport.width || cache.viewport.height !== viewport.height) {
      gl.viewport(viewport.left, viewport.top, viewport.width, viewport.height);
      cache.viewport.left = viewport.left;
      cache.viewport.top = viewport.top;
      cache.viewport.width = viewport.width;
      cache.viewport.height = viewport.height;
    }
  };
  _proto.setScissor = function setScissor(scissor) {
    var _WebGLDeviceManager$i2 = WebGLDeviceManager.instance,
      cache = _WebGLDeviceManager$i2.stateCache,
      gl = _WebGLDeviceManager$i2.gl;
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
      var gpuBuffer = buffer.gpuBuffer;
      if (gpuBuffer) {
        var buffSize;
        if (size !== undefined) {
          buffSize = size;
        } else if (buffer.usage & BufferUsageBit.INDIRECT) {
          buffSize = 0;
        } else {
          buffSize = data.byteLength;
        }
        WebGLCmdFuncUpdateBuffer(WebGLDeviceManager.instance, gpuBuffer, data, 0, buffSize);
      }
    } else {
      errorID(16329);
    }
  };
  _proto.copyBuffersToTexture = function copyBuffersToTexture(buffers, texture, regions) {
    if (!this._isInRenderPass) {
      var gpuTexture = texture.gpuTexture;
      if (gpuTexture) {
        WebGLCmdFuncCopyBuffersToTexture(WebGLDeviceManager.instance, buffers, gpuTexture, regions);
      }
    } else {
      errorID(16330);
    }
  };
  _proto.execute = function execute(cmdBuffs, count) {
    errorID(16402);
  };
  _proto.bindStates = function bindStates() {
    WebGLCmdFuncBindStates(WebGLDeviceManager.instance, this._curGPUPipelineState, this._curGPUInputAssembler, this._curGPUDescriptorSets, this._curDynamicOffsets, this._curDynamicStates);
    this._isStateInvalied = false;
  };
  _proto.blitTexture = function blitTexture(srcTexture, dstTexture, regions, filter) {
    var gpuTextureSrc = srcTexture.gpuTexture;
    var gpuTextureDst = dstTexture.gpuTexture;
    WebGLCmdFuncBlitTexture(WebGLDeviceManager.instance, gpuTextureSrc, gpuTextureDst, regions, filter);
  };
  return WebGLPrimaryCommandBuffer;
}(WebGLCommandBuffer);

var WebGLQueue = function (_Queue) {
  function WebGLQueue() {
    var _this;
    _this = _Queue.call(this) || this;
    _this.numDrawCalls = 0;
    _this.numInstances = 0;
    _this.numTris = 0;
    return _this;
  }
  _inheritsLoose(WebGLQueue, _Queue);
  var _proto = WebGLQueue.prototype;
  _proto.initialize = function initialize(info) {
    this._type = info.type;
  };
  _proto.destroy = function destroy() {};
  _proto.submit = function submit(cmdBuffs) {
    var len = cmdBuffs.length;
    for (var i = 0; i < len; i++) {
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
  return WebGLQueue;
}(Queue);

var WebGLRenderPass = function (_RenderPass) {
  function WebGLRenderPass() {
    var _this;
    _this = _RenderPass.call(this) || this;
    _this._gpuRenderPass = null;
    return _this;
  }
  _inheritsLoose(WebGLRenderPass, _RenderPass);
  var _proto = WebGLRenderPass.prototype;
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
  return _createClass(WebGLRenderPass, [{
    key: "gpuRenderPass",
    get: function get() {
      return this._gpuRenderPass;
    }
  }]);
}(RenderPass);

var WebGLWraps = [0x2901, 0x8370, 0x812F, 0x812F];
var WebGLSampler = function (_Sampler) {
  function WebGLSampler(info, hash) {
    var _this;
    _this = _Sampler.call(this, info, hash) || this;
    _this._gpuSampler = null;
    var glMinFilter = 0;
    var glMagFilter = 0;
    var minFilter = _this._info.minFilter;
    var magFilter = _this._info.magFilter;
    var mipFilter = _this._info.mipFilter;
    if (minFilter === Filter.LINEAR || minFilter === Filter.ANISOTROPIC) {
      if (mipFilter === Filter.LINEAR || mipFilter === Filter.ANISOTROPIC) {
        glMinFilter = WebGLConstants.LINEAR_MIPMAP_LINEAR;
      } else if (mipFilter === Filter.POINT) {
        glMinFilter = WebGLConstants.LINEAR_MIPMAP_NEAREST;
      } else {
        glMinFilter = WebGLConstants.LINEAR;
      }
    } else if (mipFilter === Filter.LINEAR || mipFilter === Filter.ANISOTROPIC) {
      glMinFilter = WebGLConstants.NEAREST_MIPMAP_LINEAR;
    } else if (mipFilter === Filter.POINT) {
      glMinFilter = WebGLConstants.NEAREST_MIPMAP_NEAREST;
    } else {
      glMinFilter = WebGLConstants.NEAREST;
    }
    if (magFilter === Filter.LINEAR || magFilter === Filter.ANISOTROPIC) {
      glMagFilter = WebGLConstants.LINEAR;
    } else {
      glMagFilter = WebGLConstants.NEAREST;
    }
    var glWrapS = WebGLWraps[_this._info.addressU];
    var glWrapT = WebGLWraps[_this._info.addressV];
    var glWrapR = WebGLWraps[_this._info.addressW];
    _this._gpuSampler = {
      glMinFilter: glMinFilter,
      glMagFilter: glMagFilter,
      glWrapS: glWrapS,
      glWrapT: glWrapT,
      glWrapR: glWrapR
    };
    return _this;
  }
  _inheritsLoose(WebGLSampler, _Sampler);
  return _createClass(WebGLSampler, [{
    key: "gpuSampler",
    get: function get() {
      return this._gpuSampler;
    }
  }]);
}(Sampler);

var WebGLShader = function (_Shader) {
  function WebGLShader() {
    var _this;
    _this = _Shader.call(this) || this;
    _this._gpuShader = null;
    return _this;
  }
  _inheritsLoose(WebGLShader, _Shader);
  var _proto = WebGLShader.prototype;
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
      WebGLCmdFuncDestroyShader(WebGLDeviceManager.instance, this._gpuShader);
      this._gpuShader = null;
    }
  };
  return _createClass(WebGLShader, [{
    key: "gpuShader",
    get: function get() {
      if (this._gpuShader.glProgram === null) {
        WebGLCmdFuncCreateShader(WebGLDeviceManager.instance, this._gpuShader);
      }
      return this._gpuShader;
    }
  }]);
}(Shader);

var WebGLStateCache = function () {
  function WebGLStateCache() {
    this.glArrayBuffer = null;
    this.glElementArrayBuffer = null;
    this.glVAO = null;
    this.texUnit = 0;
    this.glTexUnits = [];
    this.glRenderbuffer = null;
    this.glFramebuffer = null;
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
  var _proto = WebGLStateCache.prototype;
  _proto.initialize = function initialize(texUnit, vertexAttributes) {
    for (var i = 0; i < texUnit; ++i) {
      var glTexUnit = {
        glTexture: null
      };
      this.glTexUnits.push(glTexUnit);
    }
    this.glEnabledAttribLocs.length = vertexAttributes;
    this.glEnabledAttribLocs.fill(false);
    this.glCurrentAttribLocs.length = vertexAttributes;
    this.glCurrentAttribLocs.fill(false);
  };
  return WebGLStateCache;
}();

var WebGLTexture = function (_Texture) {
  function WebGLTexture() {
    var _this;
    _this = _Texture.call(this) || this;
    _this._gpuTexture = null;
    _this._lodLevel = 0;
    return _this;
  }
  _inheritsLoose(WebGLTexture, _Texture);
  var _proto = WebGLTexture.prototype;
  _proto.initialize = function initialize(info, isSwapchainTexture) {
    var self = this;
    var instance = WebGLDeviceManager.instance;
    var texInfo = info;
    var viewInfo = info;
    if ('texture' in info) {
      texInfo = viewInfo.texture.info;
      self._isTextureView = true;
    }
    var thisTextureInfo = self._info;
    thisTextureInfo.copy(texInfo);
    var thisViewInfo = self._viewInfo;
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
        WebGLCmdFuncCreateTexture(instance, self._gpuTexture);
        instance.memoryStatus.textureSize += self._size;
      }
      thisViewInfo.texture = self;
      thisViewInfo.type = info.type;
      thisViewInfo.format = info.format;
      thisViewInfo.baseLevel = 0;
      thisViewInfo.levelCount = info.levelCount;
      thisViewInfo.baseLayer = 0;
      thisViewInfo.layerCount = info.layerCount;
    } else {
      thisViewInfo.copy(viewInfo);
      self._lodLevel = viewInfo.baseLevel;
      self._gpuTexture = viewInfo.texture._gpuTexture;
    }
  };
  _proto.destroy = function destroy() {
    var self = this;
    var instance = WebGLDeviceManager.instance;
    if (!self._isTextureView && self._gpuTexture) {
      WebGLCmdFuncDestroyTexture(instance, self._gpuTexture);
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
    var instance = WebGLDeviceManager.instance;
    var thisTextureInfo = self._info;
    if (thisTextureInfo.width === width && thisTextureInfo.height === height) {
      return;
    }
    if (thisTextureInfo.levelCount === WebGLTexture.getLevelCount(thisTextureInfo.width, thisTextureInfo.height)) {
      thisTextureInfo.levelCount = WebGLTexture.getLevelCount(width, height);
    } else if (thisTextureInfo.levelCount > 1) {
      thisTextureInfo.levelCount = Math.min(thisTextureInfo.levelCount, WebGLTexture.getLevelCount(width, height));
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
        WebGLCmdFuncResizeTexture(instance, thisGpuTexture);
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
  return _createClass(WebGLTexture, [{
    key: "gpuTexture",
    get: function get() {
      return this._gpuTexture;
    }
  }, {
    key: "lodLevel",
    get: function get() {
      return this._lodLevel;
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
  gl.disable(WebGLConstants.POLYGON_OFFSET_FILL);
  gl.polygonOffset(0.0, 0.0);
  gl.enable(WebGLConstants.DEPTH_TEST);
  gl.depthMask(true);
  gl.depthFunc(WebGLConstants.LESS);
  gl.depthRange(0.0, 1.0);
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
    EXT_blend_minmax: getExtension(gl, 'EXT_blend_minmax'),
    EXT_frag_depth: getExtension(gl, 'EXT_frag_depth'),
    EXT_shader_texture_lod: getExtension(gl, 'EXT_shader_texture_lod'),
    EXT_sRGB: getExtension(gl, 'EXT_sRGB'),
    OES_vertex_array_object: getExtension(gl, 'OES_vertex_array_object'),
    EXT_color_buffer_half_float: getExtension(gl, 'EXT_color_buffer_half_float'),
    WEBGL_color_buffer_float: getExtension(gl, 'WEBGL_color_buffer_float'),
    WEBGL_compressed_texture_etc1: getExtension(gl, 'WEBGL_compressed_texture_etc1'),
    WEBGL_compressed_texture_etc: getExtension(gl, 'WEBGL_compressed_texture_etc'),
    WEBGL_compressed_texture_pvrtc: getExtension(gl, 'WEBGL_compressed_texture_pvrtc'),
    WEBGL_compressed_texture_s3tc: getExtension(gl, 'WEBGL_compressed_texture_s3tc'),
    WEBGL_compressed_texture_s3tc_srgb: getExtension(gl, 'WEBGL_compressed_texture_s3tc_srgb'),
    WEBGL_debug_shaders: getExtension(gl, 'WEBGL_debug_shaders'),
    WEBGL_draw_buffers: getExtension(gl, 'WEBGL_draw_buffers'),
    WEBGL_lose_context: getExtension(gl, 'WEBGL_lose_context'),
    WEBGL_depth_texture: getExtension(gl, 'WEBGL_depth_texture'),
    OES_texture_half_float: getExtension(gl, 'OES_texture_half_float'),
    OES_texture_half_float_linear: getExtension(gl, 'OES_texture_half_float_linear'),
    OES_texture_float: getExtension(gl, 'OES_texture_float'),
    OES_texture_float_linear: getExtension(gl, 'OES_texture_float_linear'),
    OES_standard_derivatives: getExtension(gl, 'OES_standard_derivatives'),
    OES_element_index_uint: getExtension(gl, 'OES_element_index_uint'),
    ANGLE_instanced_arrays: getExtension(gl, 'ANGLE_instanced_arrays'),
    WEBGL_debug_renderer_info: getExtension(gl, 'WEBGL_debug_renderer_info'),
    WEBGL_multi_draw: null,
    WEBGL_compressed_texture_astc: null,
    destroyShadersImmediately: true,
    noCompressedTexSubImage2D: false,
    isLocationActive: function isLocationActive(glLoc) {
      return !!glLoc;
    },
    useVAO: false
  };
  {
    if (systemInfo.os !== OS.IOS || systemInfo.osMainVersion !== 14 || !systemInfo.isBrowser) {
      res.WEBGL_compressed_texture_astc = getExtension(gl, 'WEBGL_compressed_texture_astc');
    }
    if (systemInfo.os !== OS.ANDROID && systemInfo.os !== OS.IOS) {
      res.WEBGL_multi_draw = getExtension(gl, 'WEBGL_multi_draw');
    }
    if (systemInfo.browserType === BrowserType.UC) {
      res.ANGLE_instanced_arrays = null;
    }
    if (systemInfo.os === OS.IOS && systemInfo.osMainVersion <= 10 || (WECHAT_MINI_PROGRAM)) {
      res.destroyShadersImmediately = false;
    }
  }
  if (res.OES_vertex_array_object) {
    res.useVAO = true;
  }
  return res;
}
function getContext(canvas) {
  var context = null;
  try {
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
    context = canvas.getContext('webgl', webGLCtxAttribs);
  } catch (err) {
    return null;
  }
  return context;
}
var WebGLSwapchain = function (_Swapchain) {
  function WebGLSwapchain() {
    var _this;
    _this = _Swapchain.call(this) || this;
    _this.stateCache = new WebGLStateCache();
    _this.nullTex2D = null;
    _this.nullTexCube = null;
    _this._canvas = null;
    _this._webGLContextLostHandler = null;
    _this._extensions = null;
    _this._blitManager = null;
    return _this;
  }
  _inheritsLoose(WebGLSwapchain, _Swapchain);
  var _proto = WebGLSwapchain.prototype;
  _proto.initialize = function initialize(info) {
    var self = this;
    self._canvas = info.windowHandle;
    self._webGLContextLostHandler = self._onWebGLContextLost.bind(self);
    self._canvas.addEventListener(eventWebGLContextLost, self._webGLContextLostHandler);
    var instance = WebGLDeviceManager.instance;
    var gl = instance.gl,
      capabilities = instance.capabilities;
    self.stateCache.initialize(capabilities.maxTextureUnits, capabilities.maxVertexAttributes);
    self._extensions = getExtensions(gl);
    initStates(gl);
    var colorFmt = Format.RGBA8;
    var depthStencilFmt = Format.DEPTH_STENCIL;
    var depthBits = gl.getParameter(WebGLConstants.DEPTH_BITS);
    var stencilBits = gl.getParameter(WebGLConstants.STENCIL_BITS);
    if (depthBits && stencilBits) depthStencilFmt = Format.DEPTH_STENCIL;else if (depthBits) depthStencilFmt = Format.DEPTH;
    self._colorTexture = new WebGLTexture();
    self._colorTexture.initAsSwapchainTexture({
      swapchain: self,
      format: colorFmt,
      width: info.width,
      height: info.height
    });
    self._depthStencilTexture = new WebGLTexture();
    self._depthStencilTexture.initAsSwapchainTexture({
      swapchain: self,
      format: depthStencilFmt,
      width: info.width,
      height: info.height
    });
    self.nullTex2D = instance.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.SAMPLED, Format.RGBA8, 2, 2, TextureFlagBit.GEN_MIPMAP));
    self.nullTexCube = instance.createTexture(new TextureInfo(TextureType.CUBE, TextureUsageBit.SAMPLED, Format.RGBA8, 2, 2, TextureFlagBit.GEN_MIPMAP, 6));
    var nullTexRegion = new BufferTextureCopy();
    nullTexRegion.texExtent.width = 2;
    nullTexRegion.texExtent.height = 2;
    var nullTexBuff = new Uint8Array(self.nullTex2D.size);
    nullTexBuff.fill(0);
    instance.copyBuffersToTexture([nullTexBuff], self.nullTex2D, [nullTexRegion]);
    nullTexRegion.texSubres.layerCount = 6;
    instance.copyBuffersToTexture([nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff], self.nullTexCube, [nullTexRegion]);
    self._blitManager = new IWebGLBlitManager();
  };
  _proto.destroy = function destroy() {
    var self = this;
    if (self._canvas && self._webGLContextLostHandler) {
      self._canvas.removeEventListener(eventWebGLContextLost, self._webGLContextLostHandler);
      self._webGLContextLostHandler = null;
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
  return _createClass(WebGLSwapchain, [{
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
function setFormatFeatureBitwiseOr(formatFeatures, indexArray, feature) {
  for (var i = 0; i < indexArray.length; ++i) {
    formatFeatures[indexArray[i]] |= feature;
  }
}
function setTextureExclusive(textureExclusive, indexArray, isExclusive) {
  for (var i = 0; i < indexArray.length; ++i) {
    textureExclusive[indexArray[i]] = isExclusive;
  }
}
var WebGLDevice = function (_Device) {
  function WebGLDevice() {
    var _this;
    _this = _Device.call(this) || this;
    _this._swapchain = null;
    _this._context = null;
    _this._bindingMappings = null;
    _this._textureExclusive = new Array(Format.COUNT);
    return _this;
  }
  _inheritsLoose(WebGLDevice, _Device);
  var _proto = WebGLDevice.prototype;
  _proto.initialize = function initialize(info) {
    WebGLDeviceManager.setInstance(this);
    this._gfxAPI = API.WEBGL;
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
      errorID(16333);
      return false;
    }
    this._queue = this.createQueue(new QueueInfo(QueueType.GRAPHICS));
    this._cmdBuff = this.createCommandBuffer(new CommandBufferInfo(this._queue));
    var glGetParameter = gl.getParameter.bind(gl);
    var caps = this._caps;
    caps.maxVertexAttributes = glGetParameter(WebGLConstants.MAX_VERTEX_ATTRIBS);
    caps.maxVertexUniformVectors = glGetParameter(WebGLConstants.MAX_VERTEX_UNIFORM_VECTORS);
    caps.maxFragmentUniformVectors = glGetParameter(WebGLConstants.MAX_FRAGMENT_UNIFORM_VECTORS);
    caps.maxTextureUnits = glGetParameter(WebGLConstants.MAX_TEXTURE_IMAGE_UNITS);
    caps.maxVertexTextureUnits = glGetParameter(WebGLConstants.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    caps.maxTextureSize = glGetParameter(WebGLConstants.MAX_TEXTURE_SIZE);
    caps.maxCubeMapTextureSize = glGetParameter(WebGLConstants.MAX_CUBE_MAP_TEXTURE_SIZE);
    caps.maxArrayTextureLayers = 0;
    caps.max3DTextureSize = 0;
    caps.maxUniformBufferBindings = 16;
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
    if (exts.EXT_blend_minmax) {
      features[Feature.BLEND_MINMAX] = true;
    }
    if (exts.OES_element_index_uint) {
      features[Feature.ELEMENT_INDEX_UINT] = true;
    }
    if (exts.ANGLE_instanced_arrays) {
      features[Feature.INSTANCED_ARRAYS] = true;
    }
    if (exts.WEBGL_draw_buffers) {
      features[Feature.MULTIPLE_RENDER_TARGETS] = true;
    }
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
    debug('WebGL device initialized.');
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
    formatFeatures.fill(FormatFeatureBit.NONE);
    var textureExclusive = this._textureExclusive;
    textureExclusive.fill(true);
    var tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    setFormatFeature(formatFeatures, [Format.RGB8, Format.R5G6B5, Format.RGBA8, Format.RGBA4, Format.RGB5A1], tempFeature);
    setFormatFeature(formatFeatures, [Format.DEPTH, Format.DEPTH_STENCIL], FormatFeatureBit.RENDER_TARGET);
    setTextureExclusive(textureExclusive, [Format.R5G6B5, Format.RGBA4, Format.RGB5A1, Format.DEPTH, Format.DEPTH_STENCIL], false);
    setFormatFeatureBitwiseOr(formatFeatures, [Format.R8I, Format.RG8I, Format.RGB8I, Format.RGBA8I, Format.R8UI, Format.RG8UI, Format.RGB8UI, Format.RGBA8UI, Format.R8I, Format.RG8I, Format.RGB8I, Format.RGBA8I, Format.R8UI, Format.RG8UI, Format.RGB8UI, Format.RGBA8UI, Format.R32F, Format.RG32F, Format.RGB32F, Format.RGBA32F], FormatFeatureBit.VERTEX_ATTRIBUTE);
    if (exts.EXT_sRGB) {
      formatFeatures[Format.SRGB8] = tempFeature;
      formatFeatures[Format.SRGB8_A8] = tempFeature;
      textureExclusive[Format.SRGB8_A8] = false;
    }
    if (exts.WEBGL_depth_texture) {
      formatFeatures[Format.DEPTH] |= tempFeature;
      formatFeatures[Format.DEPTH_STENCIL] |= tempFeature;
    }
    if (exts.WEBGL_color_buffer_float) {
      formatFeatures[Format.RGB32F] |= FormatFeatureBit.RENDER_TARGET;
      formatFeatures[Format.RGBA32F] |= FormatFeatureBit.RENDER_TARGET;
      textureExclusive[Format.RGB32F] = false;
      textureExclusive[Format.RGBA32F] = false;
    }
    if (exts.EXT_color_buffer_half_float) {
      formatFeatures[Format.RGB16F] |= FormatFeatureBit.RENDER_TARGET;
      formatFeatures[Format.RGBA16F] |= FormatFeatureBit.RENDER_TARGET;
      textureExclusive[Format.RGB16F] = false;
      textureExclusive[Format.RGBA16F] = false;
    }
    if (exts.OES_texture_float) {
      formatFeatures[Format.RGB32F] |= FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE;
      formatFeatures[Format.RGBA32F] |= FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE;
    }
    if (exts.OES_texture_half_float) {
      formatFeatures[Format.RGB16F] |= FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE;
      formatFeatures[Format.RGBA16F] |= FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE;
    }
    if (exts.OES_texture_float_linear) {
      formatFeatures[Format.RGB32F] |= FormatFeatureBit.LINEAR_FILTER;
      formatFeatures[Format.RGBA32F] |= FormatFeatureBit.LINEAR_FILTER;
    }
    if (exts.OES_texture_half_float_linear) {
      formatFeatures[Format.RGB16F] |= FormatFeatureBit.LINEAR_FILTER;
      formatFeatures[Format.RGBA16F] |= FormatFeatureBit.LINEAR_FILTER;
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
      setFormatFeatureBitwiseOr(formatFeatures, [Format.PVRTC_RGB2, Format.PVRTC_RGBA2, Format.PVRTC_RGB4, Format.PVRTC_RGBA4], compressedFeature);
    }
    if (exts.WEBGL_compressed_texture_astc) {
      setFormatFeatureBitwiseOr(formatFeatures, [Format.ASTC_RGBA_4X4, Format.ASTC_RGBA_5X4, Format.ASTC_RGBA_5X5, Format.ASTC_RGBA_6X5, Format.ASTC_RGBA_6X6, Format.ASTC_RGBA_8X5, Format.ASTC_RGBA_8X6, Format.ASTC_RGBA_8X8, Format.ASTC_RGBA_10X5, Format.ASTC_RGBA_10X6, Format.ASTC_RGBA_10X8, Format.ASTC_RGBA_10X10, Format.ASTC_RGBA_12X10, Format.ASTC_RGBA_12X12, Format.ASTC_SRGBA_4X4, Format.ASTC_SRGBA_5X4, Format.ASTC_SRGBA_5X5, Format.ASTC_SRGBA_6X5, Format.ASTC_SRGBA_6X6, Format.ASTC_SRGBA_8X5, Format.ASTC_SRGBA_8X6, Format.ASTC_SRGBA_8X8, Format.ASTC_SRGBA_10X5, Format.ASTC_SRGBA_10X6, Format.ASTC_SRGBA_10X8, Format.ASTC_SRGBA_10X10, Format.ASTC_SRGBA_12X10, Format.ASTC_SRGBA_12X12], compressedFeature);
    }
  };
  _proto.createCommandBuffer = function createCommandBuffer(info) {
    var Ctor = info.type === CommandBufferType.PRIMARY ? WebGLPrimaryCommandBuffer : WebGLCommandBuffer;
    var cmdBuff = new Ctor();
    cmdBuff.initialize(info);
    return cmdBuff;
  };
  _proto.createSwapchain = function createSwapchain(info) {
    var swapchain = new WebGLSwapchain();
    this._swapchain = swapchain;
    swapchain.initialize(info);
    return swapchain;
  };
  _proto.createBuffer = function createBuffer(info) {
    var buffer = new WebGLBuffer();
    buffer.initialize(info);
    return buffer;
  };
  _proto.createTexture = function createTexture(info) {
    var texture = new WebGLTexture();
    texture.initialize(info);
    return texture;
  };
  _proto.createDescriptorSet = function createDescriptorSet(info) {
    var descriptorSet = new WebGLDescriptorSet();
    descriptorSet.initialize(info);
    return descriptorSet;
  };
  _proto.createShader = function createShader(info) {
    var shader = new WebGLShader();
    shader.initialize(info);
    return shader;
  };
  _proto.createInputAssembler = function createInputAssembler(info) {
    var inputAssembler = new WebGLInputAssembler();
    inputAssembler.initialize(info);
    return inputAssembler;
  };
  _proto.createRenderPass = function createRenderPass(info) {
    var renderPass = new WebGLRenderPass();
    renderPass.initialize(info);
    return renderPass;
  };
  _proto.createFramebuffer = function createFramebuffer(info) {
    var framebuffer = new WebGLFramebuffer();
    framebuffer.initialize(info);
    return framebuffer;
  };
  _proto.createDescriptorSetLayout = function createDescriptorSetLayout(info) {
    var descriptorSetLayout = new WebGLDescriptorSetLayout();
    descriptorSetLayout.initialize(info);
    return descriptorSetLayout;
  };
  _proto.createPipelineLayout = function createPipelineLayout(info) {
    var pipelineLayout = new WebGLPipelineLayout();
    pipelineLayout.initialize(info);
    return pipelineLayout;
  };
  _proto.createPipelineState = function createPipelineState(info) {
    var pipelineState = new WebGLPipelineState();
    pipelineState.initialize(info);
    return pipelineState;
  };
  _proto.createQueue = function createQueue(info) {
    var queue = new WebGLQueue();
    queue.initialize(info);
    return queue;
  };
  _proto.getSampler = function getSampler(info) {
    var hash = Sampler.computeHash(info);
    if (!this._samplers.has(hash)) {
      this._samplers.set(hash, new WebGLSampler(info, hash));
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
    WebGLCmdFuncCopyBuffersToTexture(this, buffers, texture.gpuTexture, regions);
  };
  _proto.copyTextureToBuffers = function copyTextureToBuffers(texture, buffers, regions) {
    WebGLCmdFuncCopyTextureToBuffers(this, texture.gpuTexture, buffers, regions);
  };
  _proto.copyTexImagesToTexture = function copyTexImagesToTexture(texImages, texture, regions) {
    WebGLCmdFuncCopyTexImagesToTexture(this, texImages, texture.gpuTexture, regions);
  };
  return _createClass(WebGLDevice, [{
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
    key: "stateCache",
    get: function get() {
      return this._swapchain.stateCache;
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

legacyCC.WebGLDevice = WebGLDevice;

export { WebGLDevice };
//# sourceMappingURL=gfx-webgl.js.map
