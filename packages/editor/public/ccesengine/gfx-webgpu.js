import { a as _createClass, _ as _inheritsLoose, e as warn, J as CachedArray, Q as error, L as log, l as _createForOfIteratorHelperLoose, aq as _asyncToGenerator, ar as _regenerator, w as warnID, k as errorID, az as INT_MAX, D as debug } from './gc-object-CShF5lzx.js';
import { B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, ao as BufferFlagBit, ad as Rect, D as DrawInfo, F as Format, x as FormatInfos, N as DescriptorType, O as ShaderStageFlagBit, ak as ColorMask, a4 as Filter, E as TextureType, H as TextureUsageBit, br as formatAlignment, aI as FormatSize, bq as alignTo, a0 as TextureFlagBit, at as DESCRIPTOR_BUFFER_TYPE, aw as DESCRIPTOR_STORAGE_BUFFER_TYPE, av as DESCRIPTOR_SAMPLER_TYPE, Z as ViewDimension, k as DescriptorSet, aO as IndirectBuffer, r as Buffer, bo as Viewport, ar as CommandBufferType, a5 as DescriptorSetInfo, g as CommandBuffer, l as Framebuffer, o as InputAssembler, au as DESCRIPTOR_DYNAMIC_TYPE, j as DescriptorSetLayout, i as PipelineLayout, aj as BlendOp, y as PrimitiveMode, as as CullMode, h as PipelineState, Q as Queue, a8 as StoreOp, aQ as LoadOp, n as RenderPass, p as Sampler, S as Shader, R as RasterizerState, c as DepthStencilState, e as BlendState, z as TextureInfo, aP as IsPowerOf2, aJ as FormatSurfaceSize, q as Texture, J as BufferTextureCopy, s as Swapchain, G as GeneralBarrier, T as TextureBarrier, f as BufferBarrier, _ as FormatFeatureBit, ae as SamplerInfo, az as DescriptorSetLayoutInfo, L as DescriptorSetLayoutBinding, $ as API, t as Device, aa as Feature, a$ as QueueInfo, b0 as QueueType, aq as CommandBufferInfo, a1 as SampleCount } from './buffer-barrier-BlQXg9Aa.js';
import './device-manager-CBXP-ttm.js';
import { n as sys } from './index-uXI1_UMk.js';
import { e as ensureWasmModuleReady, i as instantiateWasm } from './wasm-web-BpK36a26.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { l as legacyCC } from './global-exports-DnCP_14L.js';

var WebGPUDeviceManager = function () {
  function WebGPUDeviceManager() {}
  WebGPUDeviceManager.setInstance = function setInstance(instance) {
    WebGPUDeviceManager._instance = instance;
  };
  return _createClass(WebGPUDeviceManager, null, [{
    key: "instance",
    get: function get() {
      return WebGPUDeviceManager._instance;
    }
  }]);
}();
WebGPUDeviceManager._instance = null;
function hashCombine(hash, currHash) {
  return currHash ^= (hash >>> 0) + 0x9e3779b9 + (currHash << 6) + (currHash >> 2);
}
function hashCombineNum(val, currHash) {
  var hash = 5381;
  return hashCombine(hash * 33 ^ val, currHash);
}
function hashCombineStr(str, currHash) {
  var hash = 5381;
  var strLength = str.length;
  for (var i = 0; i < strLength; i++) {
    hash = hash * 33 ^ str.charCodeAt(i);
  }
  return hashCombine(hash, currHash);
}
var webGPU = {
  glslang: undefined,
  twgsl: undefined
};
function overrideClass(wasm) {
  if ('compileGLSL' in wasm) {
    webGPU.glslang = wasm;
  } else if ('convertSpirV2WGSL' in wasm) {
    webGPU.twgsl = wasm;
  }
}
function overrideWebGPUDefine(wasm) {
  overrideClass(wasm);
}
var DefaultResources = function () {
  function DefaultResources() {
    this.buffersDescLayout = new Map();
    this.texturesDescLayout = new Map();
    this.samplersDescLayout = new Map();
    this.buffer = void 0;
    this.storageBuffers = [];
    this.texture = void 0;
    this.cubeTexture = void 0;
    this.sampler = void 0;
    this.setLayout = void 0;
    this.descSet = void 0;
  }
  var _proto = DefaultResources.prototype;
  _proto.getStorageBuffer = function getStorageBuffer(idx) {
    if (this.storageBuffers[idx]) {
      return this.storageBuffers[idx];
    }
    var bufferInfo = new BufferInfo(BufferUsageBit.STORAGE, MemoryUsageBit.DEVICE, 16, 16, BufferFlagBit.NONE);
    var defaultBuff = WebGPUDeviceManager.instance.createBuffer(bufferInfo);
    this.storageBuffers[idx] = defaultBuff;
    return defaultBuff;
  };
  return DefaultResources;
}();
var DescUpdateFrequency;
(function (DescUpdateFrequency) {
  DescUpdateFrequency[DescUpdateFrequency["LOW"] = 0] = "LOW";
  DescUpdateFrequency[DescUpdateFrequency["NORMAL"] = 1] = "NORMAL";
})(DescUpdateFrequency || (DescUpdateFrequency = {}));

var WebGPUAdressMode = ['repeat', 'mirror-repeat', 'clamp-to-edge', 'clamp-to-edge'];
var WebGPUCompareFunc = ['never', 'less', 'equal', 'less-equal', 'greater', 'not-equal', 'greater-equal', 'always'];
function GFXStageToWebGPUStage(stage) {
  var flag = 0x0;
  if (stage & ShaderStageFlagBit.VERTEX) {
    flag |= GPUShaderStage.VERTEX;
  }
  if (stage & ShaderStageFlagBit.FRAGMENT) {
    flag |= GPUShaderStage.FRAGMENT;
  }
  if (stage & ShaderStageFlagBit.COMPUTE) {
    flag |= GPUShaderStage.COMPUTE;
  }
  if (stage === ShaderStageFlagBit.ALL) {
    flag |= GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE;
  }
  if (flag === 0x0) {
    throw new Error('shader stage not supported by webGPU!');
  }
  return flag;
}
function GFXFormatToWGPUVertexFormat(format) {
  switch (format) {
    case Format.R32F:
      return 'float32';
    case Format.R32UI:
      return 'uint32';
    case Format.R32I:
      return 'sint32';
    case Format.RG8:
      return 'unorm8x2';
    case Format.RG8SN:
      return 'snorm8x2';
    case Format.RG8UI:
      return 'uint8x2';
    case Format.RG8I:
      return 'sint8x2';
    case Format.RG16F:
      return 'float16x2';
    case Format.RG16UI:
      return 'uint16x2';
    case Format.RG16I:
      return 'sint16x2';
    case Format.RG32F:
      return 'float32x2';
    case Format.RG32UI:
      return 'uint32x2';
    case Format.RG32I:
      return 'sint32x2';
    case Format.RGB32F:
      return 'float32x3';
    case Format.RGB32UI:
      return 'uint32x3';
    case Format.RGB32I:
      return 'sint32x3';
    case Format.BGRA8:
      return 'unorm8x4';
    case Format.RGBA8:
      return 'unorm8x4';
    case Format.SRGB8_A8:
      return 'uint8x4';
    case Format.RGBA8SN:
      return 'snorm8x4';
    case Format.RGBA8UI:
      return 'uint8x4';
    case Format.RGBA8I:
      return 'sint8x4';
    case Format.RGBA16F:
      return 'float16x4';
    case Format.RGBA16UI:
      return 'uint16x4';
    case Format.RGBA16I:
      return 'sint16x4';
    case Format.RGBA32F:
      return 'float32x4';
    case Format.RGBA32UI:
      return 'uint32x4';
    case Format.RGBA32I:
      return 'sint32x4';
    default:
      {
        warn('Unsupported Format, return sint8x4 in default.');
        return 'sint8x4';
      }
  }
}
function GFXFormatToWGPUTextureFormat(format) {
  switch (format) {
    case Format.R8:
      return 'r8unorm';
    case Format.R8SN:
      return 'r8snorm';
    case Format.R8UI:
      return 'r8uint';
    case Format.R8I:
      return 'r8sint';
    case Format.RG8:
      return 'rg8unorm';
    case Format.RG8SN:
      return 'rg8snorm';
    case Format.RG8UI:
      return 'rg8uint';
    case Format.RG8I:
      return 'rg8sint';
    case Format.BGRA8:
      return 'bgra8unorm';
    case Format.RGBA8:
      return 'rgba8unorm';
    case Format.SRGB8_A8:
      return 'rgba8unorm-srgb';
    case Format.RGBA8SN:
      return 'rgba8snorm';
    case Format.RGBA8UI:
      return 'rgba8uint';
    case Format.RGBA8I:
      return 'rgba8sint';
    case Format.R16I:
      return 'r16sint';
    case Format.R16UI:
      return 'r16uint';
    case Format.R16F:
      return 'r16sint';
    case Format.RG16I:
      return 'rg16sint';
    case Format.RG16UI:
      return 'rg16uint';
    case Format.RG16F:
      return 'rg16float';
    case Format.RGBA16I:
      return 'rgba16sint';
    case Format.RGBA16UI:
      return 'rgba16uint';
    case Format.RGBA16F:
      return 'rgba16float';
    case Format.R32I:
      return 'r32sint';
    case Format.R32UI:
      return 'r32uint';
    case Format.R32F:
      return 'r32float';
    case Format.RG32I:
      return 'rg32sint';
    case Format.RG32UI:
      return 'rg32uint';
    case Format.RG32F:
      return 'rg32float';
    case Format.RGBA32I:
      return 'rgba32sint';
    case Format.RGBA32UI:
      return 'rgba32uint';
    case Format.RGBA32F:
      return 'rgba32float';
    case Format.RGB10A2:
      return 'rgb10a2unorm';
    case Format.DEPTH:
      return 'depth24plus';
    case Format.DEPTH_STENCIL:
      return 'depth24plus-stencil8';
    case Format.BC1_ALPHA:
      return 'bc1-rgba-unorm';
    case Format.BC1_SRGB_ALPHA:
      return 'bc1-rgba-unorm-srgb';
    case Format.BC2:
      return 'bc2-rgba-unorm';
    case Format.BC2_SRGB:
      return 'bc2-rgba-unorm-srgb';
    case Format.BC3:
      return 'bc3-rgba-unorm';
    case Format.BC3_SRGB:
      return 'bc3-rgba-unorm-srgb';
    case Format.BC4_SNORM:
      return 'bc4-r-snorm';
    case Format.BC6H_SF16:
      return 'bc6h-rgb-float';
    case Format.BC6H_UF16:
      return 'bc6h-rgb-ufloat';
    case Format.BC7:
      return 'bc7-rgba-unorm';
    case Format.BC7_SRGB:
      return 'bc7-rgba-unorm-srgb';
    default:
      {
        warn('Unsupported Format, return rgba8unorm indefault.');
        return 'rgba8unorm';
      }
  }
}
function GFXFormatToWGPUFormat(format) {
  return GFXFormatToWGPUTextureFormat(format);
}
function wGPUTextureFormatToGFXFormat(format) {
  switch (format) {
    case 'r8unorm':
      return Format.R8;
    case 'r8snorm':
      return Format.R8SN;
    case 'r8uint':
      return Format.R8UI;
    case 'r8sint':
      return Format.R8I;
    case 'rg8unorm':
      return Format.RG8;
    case 'rg8snorm':
      return Format.RG8SN;
    case 'rg8uint':
      return Format.RG8UI;
    case 'rg8sint':
      return Format.RG8I;
    case 'bgra8unorm':
      return Format.BGRA8;
    case 'rgba8unorm':
      return Format.RGBA8;
    case 'rgba8unorm-srgb':
      return Format.SRGB8_A8;
    case 'rgba8snorm':
      return Format.RGBA8SN;
    case 'rgba8uint':
      return Format.RGBA8UI;
    case 'rgba8sint':
      return Format.RGBA8I;
    case 'r16sint':
      return Format.R16I;
    case 'r16uint':
      return Format.R16UI;
    case 'r16float':
      return Format.R16F;
    case 'rg16sint':
      return Format.RG16I;
    case 'rg16uint':
      return Format.RG16UI;
    case 'rg16float':
      return Format.RG16F;
    case 'rgba16sint':
      return Format.RGBA16I;
    case 'rgba16uint':
      return Format.RGBA16UI;
    case 'rgba16float':
      return Format.RGBA16F;
    case 'r32sint':
      return Format.R32I;
    case 'r32uint':
      return Format.R32UI;
    case 'r32float':
      return Format.R32F;
    case 'rg32sint':
      return Format.RG32I;
    case 'rg32uint':
      return Format.RG32UI;
    case 'rg32float':
      return Format.RG32F;
    case 'rgba32sint':
      return Format.RGBA32I;
    case 'rgba32uint':
      return Format.RGBA32UI;
    case 'rgba32float':
      return Format.RGBA32F;
    case 'rgb10a2unorm':
      return Format.RGB10A2;
    case 'depth24plus':
      return Format.DEPTH;
    case 'depth24plus-stencil8':
      return Format.DEPTH_STENCIL;
    case 'bc1-rgba-unorm':
      return Format.BC1_ALPHA;
    case 'bc1-rgba-unorm-srgb':
      return Format.BC1_SRGB_ALPHA;
    case 'bc2-rgba-unorm':
      return Format.BC2;
    case 'bc2-rgba-unorm-srgb':
      return Format.BC2_SRGB;
    case 'bc3-rgba-unorm':
      return Format.BC3;
    case 'bc3-rgba-unorm-srgb':
      return Format.BC3_SRGB;
    case 'bc4-r-snorm':
      return Format.BC4_SNORM;
    case 'bc6h-rgb-float':
      return Format.BC6H_SF16;
    case 'bc6h-rgb-ufloat':
      return Format.BC6H_UF16;
    case 'bc7-rgba-unorm':
      return Format.BC7;
    case 'bc7-rgba-unorm-srgb':
      return Format.BC7_SRGB;
    default:
      return Format.RGBA8;
  }
}
function WGPUFormatToGFXFormat(format) {
  return wGPUTextureFormatToGFXFormat(format);
}
function GFXTextureToWebGPUTexture(textureType) {
  switch (textureType) {
    case TextureType.TEX1D:
      return '1d';
    case TextureType.TEX2D:
      return '2d';
    case TextureType.TEX2D_ARRAY:
      return '2d-array';
    case TextureType.TEX3D:
      return '3d';
    case TextureType.CUBE:
      return 'cube';
    default:
      {
        error('Unsupported textureType, convert to WebGPUTexture failed.');
        return '2d';
      }
  }
}
function GFXTextureUsageToNative(usage) {
  var nativeUsage = 0;
  if (usage & TextureUsageBit.TRANSFER_SRC) {
    nativeUsage |= GPUTextureUsage.COPY_SRC;
  }
  if (usage & TextureUsageBit.TRANSFER_DST) {
    nativeUsage |= GPUTextureUsage.COPY_DST;
  }
  if (usage & TextureUsageBit.SAMPLED) {
    nativeUsage |= GPUTextureUsage.TEXTURE_BINDING;
  }
  if (usage & TextureUsageBit.STORAGE) {
    nativeUsage |= GPUTextureUsage.STORAGE_BINDING;
  }
  if (usage & TextureUsageBit.COLOR_ATTACHMENT || usage & TextureUsageBit.DEPTH_STENCIL_ATTACHMENT) {
    nativeUsage |= GPUTextureUsage.RENDER_ATTACHMENT;
  }
  if (!nativeUsage) {
    nativeUsage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT;
  }
  if (nativeUsage & GPUTextureUsage.TEXTURE_BINDING && !(nativeUsage & GPUTextureUsage.RENDER_ATTACHMENT)) {
    nativeUsage |= GPUTextureUsage.RENDER_ATTACHMENT;
  }
  return nativeUsage;
}
var WebGPUStencilOp = ['zero', 'keep', 'replace', 'increment-clamp', 'decrement-clamp', 'invert', 'increment-wrap', 'decrement-wrap'];
var WebGPUCompereFunc = ['never', 'less', 'equal', 'less-equal', 'greater', 'not-equal', 'greater-equal', 'always'];
var WebGPUBlendOps = ['add', 'subtract', 'reverse-subtract', 'min', 'max'];
function WebGPUBlendMask(mask) {
  switch (mask) {
    case ColorMask.R:
      return GPUColorWrite.RED;
    case ColorMask.G:
      return GPUColorWrite.GREEN;
    case ColorMask.B:
      return GPUColorWrite.BLUE;
    case ColorMask.A:
      return GPUColorWrite.ALPHA;
    default:
      return GPUColorWrite.ALL;
  }
}
var WebGPUBlendFactors = ['zero', 'one', 'src-alpha', 'dst-alpha', 'one-minus-src-alpha', 'one-minus-dst-alpha', 'src', 'dst', 'one-minus-src', 'one-minus-dst', 'src-alpha-saturated', 'constant', 'one-minus-constant', 'src-alpha', 'one-minus-src-alpha'];
var WebGPUCmd;
(function (WebGPUCmd) {
  WebGPUCmd[WebGPUCmd["BEGIN_RENDER_PASS"] = 0] = "BEGIN_RENDER_PASS";
  WebGPUCmd[WebGPUCmd["END_RENDER_PASS"] = 1] = "END_RENDER_PASS";
  WebGPUCmd[WebGPUCmd["BIND_STATES"] = 2] = "BIND_STATES";
  WebGPUCmd[WebGPUCmd["DRAW"] = 3] = "DRAW";
  WebGPUCmd[WebGPUCmd["UPDATE_BUFFER"] = 4] = "UPDATE_BUFFER";
  WebGPUCmd[WebGPUCmd["COPY_BUFFER_TO_TEXTURE"] = 5] = "COPY_BUFFER_TO_TEXTURE";
  WebGPUCmd[WebGPUCmd["COUNT"] = 6] = "COUNT";
})(WebGPUCmd || (WebGPUCmd = {}));
var WebGPUCmdObject = function WebGPUCmdObject(type) {
  this.cmdType = void 0;
  this.refCount = 0;
  this.cmdType = type;
};
var WebGPUCmdBeginRenderPass = function (_WebGPUCmdObject2) {
  function WebGPUCmdBeginRenderPass() {
    var _this;
    _this = _WebGPUCmdObject2.call(this, WebGPUCmd.BEGIN_RENDER_PASS) || this;
    _this.gpuRenderPass = null;
    _this.gpuFramebuffer = null;
    _this.renderArea = new Rect();
    _this.clearColors = [];
    _this.clearDepth = 1.0;
    _this.clearStencil = 0;
    return _this;
  }
  _inheritsLoose(WebGPUCmdBeginRenderPass, _WebGPUCmdObject2);
  var _proto = WebGPUCmdBeginRenderPass.prototype;
  _proto.clear = function clear() {
    this.gpuFramebuffer = null;
    this.clearColors.length = 0;
  };
  return WebGPUCmdBeginRenderPass;
}(WebGPUCmdObject);
var WebGPUCmdBindStates = function (_WebGPUCmdObject3) {
  function WebGPUCmdBindStates() {
    var _this2;
    _this2 = _WebGPUCmdObject3.call(this, WebGPUCmd.BIND_STATES) || this;
    _this2.gpuPipelineState = null;
    _this2.gpuInputAssembler = null;
    _this2.gpuDescriptorSets = [];
    _this2.dynamicOffsets = [];
    _this2.viewport = null;
    _this2.scissor = null;
    _this2.lineWidth = null;
    _this2.depthBias = null;
    _this2.blendConstants = [];
    _this2.depthBounds = null;
    _this2.stencilWriteMask = null;
    _this2.stencilCompareMask = null;
    return _this2;
  }
  _inheritsLoose(WebGPUCmdBindStates, _WebGPUCmdObject3);
  var _proto2 = WebGPUCmdBindStates.prototype;
  _proto2.clear = function clear() {
    this.gpuPipelineState = null;
    this.gpuInputAssembler = null;
    this.gpuDescriptorSets.length = 0;
    this.dynamicOffsets.length = 0;
    this.viewport = null;
    this.scissor = null;
    this.lineWidth = null;
    this.depthBias = null;
    this.blendConstants.length = 0;
    this.depthBounds = null;
    this.stencilWriteMask = null;
    this.stencilCompareMask = null;
  };
  return WebGPUCmdBindStates;
}(WebGPUCmdObject);
var WebGPUCmdDraw = function (_WebGPUCmdObject4) {
  function WebGPUCmdDraw() {
    var _this3;
    _this3 = _WebGPUCmdObject4.call(this, WebGPUCmd.DRAW) || this;
    _this3.drawInfo = new DrawInfo();
    return _this3;
  }
  _inheritsLoose(WebGPUCmdDraw, _WebGPUCmdObject4);
  var _proto3 = WebGPUCmdDraw.prototype;
  _proto3.clear = function clear() {};
  return WebGPUCmdDraw;
}(WebGPUCmdObject);
var WebGPUCmdUpdateBuffer = function (_WebGPUCmdObject5) {
  function WebGPUCmdUpdateBuffer() {
    var _this4;
    _this4 = _WebGPUCmdObject5.call(this, WebGPUCmd.UPDATE_BUFFER) || this;
    _this4.gpuBuffer = null;
    _this4.buffer = null;
    _this4.offset = 0;
    _this4.size = 0;
    return _this4;
  }
  _inheritsLoose(WebGPUCmdUpdateBuffer, _WebGPUCmdObject5);
  var _proto4 = WebGPUCmdUpdateBuffer.prototype;
  _proto4.clear = function clear() {
    this.gpuBuffer = null;
    this.buffer = null;
  };
  return WebGPUCmdUpdateBuffer;
}(WebGPUCmdObject);
var WebGPUCmdCopyBufferToTexture = function (_WebGPUCmdObject6) {
  function WebGPUCmdCopyBufferToTexture() {
    var _this5;
    _this5 = _WebGPUCmdObject6.call(this, WebGPUCmd.COPY_BUFFER_TO_TEXTURE) || this;
    _this5.gpuTexture = null;
    _this5.buffers = [];
    _this5.regions = [];
    return _this5;
  }
  _inheritsLoose(WebGPUCmdCopyBufferToTexture, _WebGPUCmdObject6);
  var _proto5 = WebGPUCmdCopyBufferToTexture.prototype;
  _proto5.clear = function clear() {
    this.gpuTexture = null;
    this.buffers.length = 0;
    this.regions.length = 0;
  };
  return WebGPUCmdCopyBufferToTexture;
}(WebGPUCmdObject);
var WebGPUCmdPackage = function () {
  function WebGPUCmdPackage() {
    this.cmds = new CachedArray(1);
    this.beginRenderPassCmds = new CachedArray(1);
    this.bindStatesCmds = new CachedArray(1);
    this.drawCmds = new CachedArray(1);
    this.updateBufferCmds = new CachedArray(1);
    this.copyBufferToTextureCmds = new CachedArray(1);
  }
  var _proto6 = WebGPUCmdPackage.prototype;
  _proto6.clearCmds = function clearCmds(allocator) {
    if (this.beginRenderPassCmds.length) {
      allocator.beginRenderPassCmdPool.freeCmds(this.beginRenderPassCmds);
      this.beginRenderPassCmds.clear();
    }
    if (this.bindStatesCmds.length) {
      allocator.bindStatesCmdPool.freeCmds(this.bindStatesCmds);
      this.bindStatesCmds.clear();
    }
    if (this.drawCmds.length) {
      allocator.drawCmdPool.freeCmds(this.drawCmds);
      this.drawCmds.clear();
    }
    if (this.updateBufferCmds.length) {
      allocator.updateBufferCmdPool.freeCmds(this.updateBufferCmds);
      this.updateBufferCmds.clear();
    }
    if (this.copyBufferToTextureCmds.length) {
      allocator.copyBufferToTextureCmdPool.freeCmds(this.copyBufferToTextureCmds);
      this.copyBufferToTextureCmds.clear();
    }
    this.cmds.clear();
  };
  return WebGPUCmdPackage;
}();
function WebGPUCmdFuncCreateBuffer(device, gpuBuffer) {
  var nativeDevice = device.nativeDevice;
  var bufferDesc = {};
  bufferDesc.size = gpuBuffer.size;
  var bufferUsage = 0x0;
  if ((gpuBuffer.usage & BufferUsageBit.INDEX || gpuBuffer.usage & BufferUsageBit.VERTEX) && !(gpuBuffer.usage & BufferUsageBit.TRANSFER_DST)) {
    gpuBuffer.usage |= BufferUsageBit.TRANSFER_DST;
  }
  if (gpuBuffer.usage & BufferUsageBit.VERTEX) bufferUsage |= GPUBufferUsage.VERTEX;
  if (gpuBuffer.usage & BufferUsageBit.INDEX) bufferUsage |= GPUBufferUsage.INDEX;
  if (gpuBuffer.usage & BufferUsageBit.UNIFORM) bufferUsage |= GPUBufferUsage.UNIFORM;
  if (gpuBuffer.usage & BufferUsageBit.INDIRECT) bufferUsage |= GPUBufferUsage.INDIRECT;
  if (gpuBuffer.usage & BufferUsageBit.TRANSFER_SRC) bufferUsage |= GPUBufferUsage.COPY_SRC;
  if (gpuBuffer.usage & BufferUsageBit.TRANSFER_DST) bufferUsage |= GPUBufferUsage.COPY_DST;
  if (gpuBuffer.usage & BufferUsageBit.STORAGE) bufferUsage |= GPUBufferUsage.STORAGE;
  if (bufferUsage === 0x0) {
    warn('Unsupported GFXBufferType yet, create UNIFORM buffer in default.');
    bufferUsage |= GPUBufferUsage.UNIFORM;
  }
  if (!(bufferUsage & GPUBufferUsage.COPY_DST)) {
    bufferUsage |= GPUBufferUsage.COPY_DST;
  }
  bufferDesc.usage = bufferUsage;
  gpuBuffer.gpuTarget = bufferUsage;
  gpuBuffer.gpuBuffer = nativeDevice.createBuffer(bufferDesc);
}
function WebGPUCmdFuncDestroyBuffer(device, gpuBuffer) {
  if (gpuBuffer.gpuBuffer) {
    gpuBuffer.gpuBuffer.destroy();
  }
}
function WebGPUCmdFuncResizeBuffer(device, gpuBuffer) {
  WebGPUCmdFuncDestroyBuffer(device, gpuBuffer);
  WebGPUCmdFuncCreateBuffer(device, gpuBuffer);
}
function WebGPUCmdFuncUpdateBuffer(device, gpuBuffer, buffer, offset, size) {
  if (gpuBuffer.usage & BufferUsageBit.INDIRECT) {
    gpuBuffer.indirects.length = offset;
    Array.prototype.push.apply(gpuBuffer.indirects, buffer.drawInfos);
  } else {
    var nativeDevice = device.nativeDevice;
    var buff = buffer;
    var rawBuffer;
    buff = buff.slice(0, size);
    if ('buffer' in buff) {
      rawBuffer = buff.buffer;
    } else {
      rawBuffer = buff;
    }
    if (rawBuffer.byteLength !== size) {
      rawBuffer = rawBuffer.slice(0, size);
    }
    var stagingBuffer = nativeDevice.createBuffer({
      label: "staging buffer " + size,
      size: size,
      usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
      mappedAtCreation: true
    });
    var mappedRange = stagingBuffer.getMappedRange();
    new Uint8Array(mappedRange).set(new Uint8Array(rawBuffer));
    stagingBuffer.unmap();
    var commandEncoder = nativeDevice.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(stagingBuffer, 0, gpuBuffer.gpuBuffer, offset, size);
    var commandBuffer = commandEncoder.finish();
    nativeDevice.queue.submit([commandBuffer]);
    stagingBuffer.destroy();
  }
}
function WebGPUCmdFuncCreateTexture(device, gpuTexture) {
  gpuTexture.gpuTarget = GFXTextureToWebGPUTexture(gpuTexture.type);
  gpuTexture.gpuInternalFmt = GFXFormatToWGPUTextureFormat(gpuTexture.format);
  gpuTexture.gpuFormat = GFXFormatToWGPUFormat(gpuTexture.format);
  gpuTexture.gpuUsage = GFXTextureUsageToNative(gpuTexture.usage);
  gpuTexture.gpuWrapS = gpuTexture.isPowerOf2 ? 'repeat' : 'clamp-to-edge';
  gpuTexture.gpuWrapT = gpuTexture.isPowerOf2 ? 'repeat' : 'clamp-to-edge';
  gpuTexture.gpuMinFilter = 'linear';
  gpuTexture.gpuMagFilter = 'linear';
  gpuTexture.samples = Number(gpuTexture.samples) > 1 ? 4 : 1;
  var texDescriptor = {
    size: [gpuTexture.width, gpuTexture.height, gpuTexture.arrayLayer],
    mipLevelCount: gpuTexture.mipLevel,
    sampleCount: gpuTexture.samples,
    format: gpuTexture.gpuFormat,
    usage: gpuTexture.gpuUsage
  };
  gpuTexture.gpuTexture = device.nativeDevice.createTexture(texDescriptor);
}
function WebGPUCmdFuncDestroyTexture(gpuTexture) {
  if (gpuTexture.gpuTexture) {
    gpuTexture.gpuTexture.destroy();
  }
}
function WebGPUCmdFuncResizeTexture(device, gpuTexture) {
  if (gpuTexture.gpuTexture) {
    WebGPUCmdFuncDestroyTexture(gpuTexture);
  }
  WebGPUCmdFuncCreateTexture(device, gpuTexture);
}
function WebGPUCmdFuncCreateSampler(device, gpuSampler) {
  var nativeDevice = device.nativeDevice;
  gpuSampler.gpuMinFilter = gpuSampler.minFilter === Filter.LINEAR || gpuSampler.minFilter === Filter.ANISOTROPIC ? 'linear' : 'nearest';
  gpuSampler.gpuMagFilter = gpuSampler.magFilter === Filter.LINEAR || gpuSampler.magFilter === Filter.ANISOTROPIC ? 'linear' : 'nearest';
  gpuSampler.gpuMipFilter = gpuSampler.mipFilter === Filter.LINEAR || gpuSampler.mipFilter === Filter.ANISOTROPIC ? 'linear' : 'nearest';
  gpuSampler.gpuWrapS = WebGPUAdressMode[gpuSampler.addressU];
  gpuSampler.gpuWrapT = WebGPUAdressMode[gpuSampler.addressV];
  gpuSampler.gpuWrapR = WebGPUAdressMode[gpuSampler.addressW];
  var samplerDesc = {};
  samplerDesc.addressModeU = gpuSampler.gpuWrapS;
  samplerDesc.addressModeV = gpuSampler.gpuWrapT;
  samplerDesc.addressModeW = gpuSampler.gpuWrapR;
  samplerDesc.minFilter = gpuSampler.gpuMinFilter;
  samplerDesc.magFilter = gpuSampler.gpuMagFilter;
  samplerDesc.mipmapFilter = gpuSampler.gpuMipFilter;
  samplerDesc.lodMinClamp = 0;
  samplerDesc.lodMaxClamp = gpuSampler.mipLevel;
  if (WebGPUCompareFunc[gpuSampler.compare] !== 'always') {
    samplerDesc.compare = WebGPUCompareFunc[gpuSampler.compare];
  }
  samplerDesc.maxAnisotropy = gpuSampler.maxAnisotropy || 1;
  var sampler = nativeDevice.createSampler(samplerDesc);
  gpuSampler.gpuSampler = sampler;
}
function WebGPUCmdFuncDestroySampler(device, gpuSampler) {
  if (gpuSampler.gpuSampler) {
    gpuSampler.gpuSampler = null;
  }
}
var copyTexToBufferDesc = {};
var destArrayBuffer = [];
function WebGPUCmdFuncCopyTextureToBuffer(_x, _x2, _x3, _x4) {
  return _WebGPUCmdFuncCopyTextureToBuffer.apply(this, arguments);
}
function _WebGPUCmdFuncCopyTextureToBuffer() {
  _WebGPUCmdFuncCopyTextureToBuffer = _asyncToGenerator(_regenerator().m(function _callee(device, texture, buffers, regions) {
    var x, y, w, h, nativeDevice, commandEncoder, regionSize, k, copyDestBuffer, region;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          x = 0;
          y = 0;
          w = 1;
          h = 1;
          nativeDevice = device.nativeDevice;
          commandEncoder = nativeDevice.createCommandEncoder({});
          regionSize = regions.length;
          k = 0;
        case 1:
          if (!(k < regionSize)) {
            _context.n = 4;
            break;
          }
          if (destArrayBuffer[k]) {
            buffers[k].set(new Uint8Array(destArrayBuffer[k]), 0);
          }
          copyTexToBufferDesc.size = buffers[k].byteLength;
          copyTexToBufferDesc.usage = GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST;
          copyDestBuffer = nativeDevice.createBuffer(copyTexToBufferDesc);
          region = regions[k];
          x = region.texOffset.x;
          y = region.texOffset.y;
          w = region.texExtent.width;
          h = region.texExtent.height;
          commandEncoder.copyTextureToBuffer({
            texture: texture.gpuTexture,
            mipLevel: 0,
            origin: {
              x: x,
              y: y
            }
          }, {
            buffer: copyDestBuffer,
            offset: 0,
            bytesPerRow: w * 4,
            rowsPerImage: h
          }, {
            width: w,
            height: h
          });
          nativeDevice.queue.submit([commandEncoder.finish()]);
          _context.n = 2;
          return copyDestBuffer.mapAsync(GPUMapMode.READ);
        case 2:
          destArrayBuffer[k] = copyDestBuffer.getMappedRange();
          buffers[k].set(new Uint8Array(destArrayBuffer[k]), 0);
        case 3:
          k++;
          _context.n = 1;
          break;
        case 4:
          return _context.a(2);
      }
    }, _callee);
  }));
  return _WebGPUCmdFuncCopyTextureToBuffer.apply(this, arguments);
}
var SEPARATE_SAMPLER_BINDING_OFFSET = 16;
function seperateCombinedSamplerTexture(shaderSource) {
  var samplerReg = /.*?(\(set = \d+, binding = )(\d+)\) uniform[^;]+sampler(\w*) (\w+);/g;
  var iter = samplerReg.exec(shaderSource);
  var referredMap = new Map();
  while (iter) {
    var samplerName = iter[4];
    var samplerType = iter[3];
    referredMap.set(samplerName, samplerType);
    iter = samplerReg.exec(shaderSource);
  }
  var code = shaderSource;
  var sampReg = /.*?(\(set = \d+, binding = )(\d+)\) uniform[^;]+sampler(\w*) (\w+);/g;
  var it = sampReg.exec(code);
  while (it) {
    code = code.replace(sampReg, "layout$1 $2) uniform texture$3 $4;\n\n        layout$1 $2 + " + SEPARATE_SAMPLER_BINDING_OFFSET + ") uniform sampler $4_sampler;\n");
    it = sampReg.exec(code);
  }
  var builtinSample = ['texture', 'textureSize', 'texelFetch', 'textureLod'];
  var replaceBultin = function replaceBultin(samplerName, samplerType, target) {
    builtinSample.forEach(function (sampleFunc) {
      var builtinSampleReg = new RegExp(sampleFunc + "\\s*\\(\\s*" + samplerName + "\\s*,");
      var builtinFuncIter = builtinSampleReg.exec(target);
      while (builtinFuncIter) {
        target = target.replace(builtinFuncIter[0], sampleFunc + "(sampler" + samplerType + "(" + samplerName + ", " + samplerName + "_sampler),");
        builtinFuncIter = builtinSampleReg.exec(target);
      }
    });
    return target;
  };
  var funcReg = /\s([\S]+)\s*\(([\w\s,]+)\)[\s|\\|n]*{/g;
  var funcIter = funcReg.exec(code);
  var funcSet = new Set();
  var paramTypeMap = new Map();
  var _loop = function _loop() {
    paramTypeMap.clear();
    var params = funcIter[2];
    var paramsRes = params.slice();
    if (params.includes('sampler')) {
      var paramIndexSet = new Set();
      var paramArr = params.split(',');
      var paramSize = paramArr.length;
      for (var i = 0; i < paramSize; ++i) {
        var paramDecl = paramArr[i].split(' ');
        var typeDecl = paramDecl[paramDecl.length - 2];
        if (typeDecl.includes('sampler') && typeDecl !== 'sampler') {
          var _samplerType = typeDecl.replace('sampler', '');
          var paramName = paramDecl[paramDecl.length - 1];
          paramsRes = paramsRes.replace(paramArr[i], " texture" + _samplerType + " " + paramName + ", sampler " + paramName + "_sampler");
          paramIndexSet.add(i);
          paramTypeMap.set(paramName, _samplerType);
        }
      }
      code = code.replace(params, paramsRes);
      var funcName = funcIter[1];
      if (!funcSet.has(funcName)) {
        var funcSamplerReg = new RegExp(funcName + "\\s*?\\((\\s*[^;\\{]+)", 'g');
        var matched;
        while ((matched = funcSamplerReg.exec(code)) !== null) {
          if (!matched[1].match(/\b\w+\b\s*\b\w+\b/g)) {
            var stripStr = matched[1][matched[1].length - 1] === ')' ? matched[1].slice(0, -1) : matched[1];
            var _params = stripStr.split(',');
            var queued = 0;
            var paramIndex = 0;
            var _paramSize = _params.length;
            for (var _i = 0; _i < _paramSize; ++_i) {
              if (_params[_i].includes('(')) {
                ++queued;
              }
              if (_params[_i].includes(')')) {
                --queued;
              }
              if (!queued || _i === _paramSize - 1) {
                if (paramIndexSet.has(paramIndex)) {
                  _params[_i] += ", " + _params[_i] + "_sampler";
                }
                ++paramIndex;
              }
            }
            var newParams = _params.join(',');
            var newInvokeStr = matched[0].replace(stripStr, newParams);
            code = code.replace(matched[0], newInvokeStr);
          }
        }
      }
      var count = 1;
      var startIndex = code.indexOf(funcIter[1], funcIter.index);
      startIndex = code.indexOf('{', startIndex) + 1;
      var endIndex = 0;
      while (count) {
        if (code.charAt(startIndex) === '{') {
          ++count;
        } else if (code.charAt(startIndex) === '}') {
          --count;
        }
        if (count === 0) {
          endIndex = startIndex;
          break;
        }
        var nextLeft = code.indexOf('{', startIndex + 1);
        var nextRight = code.indexOf('}', startIndex + 1);
        startIndex = nextLeft === -1 ? nextRight : Math.min(nextLeft, nextRight);
      }
      var funcBody = code.slice(funcIter.index, endIndex);
      var newFunc = funcBody;
      paramTypeMap.forEach(function (type, name) {
        newFunc = replaceBultin(name, type, newFunc);
      });
      code = code.replace(funcBody, newFunc);
      funcSet.add(funcIter[1]);
    }
    funcIter = funcReg.exec(code);
  };
  while (funcIter) {
    _loop();
  }
  referredMap.forEach(function (type, name) {
    code = replaceBultin(name, type, code);
  });
  var functionDefs = '';
  var precisionKeyWord = 'highp';
  var isNanIndex = code.indexOf('isnan');
  if (isNanIndex !== -1) {
    functionDefs += "\n\n         bool isNan(" + precisionKeyWord + " float val) {\n             return (val < 0.0 || 0.0 < val || val == 0.0) ? false : true;\n         }\n         \n";
    code = code.replace(/isnan\(/gi, 'isNan(');
  }
  var isInfIndex = code.indexOf('isinf');
  if (isInfIndex !== -1) {
    functionDefs += "\n\n         bool isInf(" + precisionKeyWord + " float x) {\n             return x == x * 2.0 && x != 0.0;\n         }\n         \n";
    code = code.replace(/isinf\(/gi, 'isInf(');
  }
  var firstPrecisionIdx = code.indexOf('precision');
  firstPrecisionIdx = code.indexOf(';', firstPrecisionIdx);
  firstPrecisionIdx += 1;
  code = code.slice(0, firstPrecisionIdx) + "\n" + functionDefs + "\n" + code.slice(firstPrecisionIdx);
  return code;
}
function reflect(wgsl) {
  var bindingList = [];
  for (var _iterator = _createForOfIteratorHelperLoose(wgsl), _step; !(_step = _iterator()).done;) {
    var wgslStr = _step.value;
    var reg = /@group\((\d)\)\s+@binding\((\d+)\)/g;
    var iter = reg.exec(wgslStr);
    while (iter) {
      var set = +iter[1];
      var binding = +iter[2];
      while (bindingList.length <= set) {
        bindingList.push([]);
      }
      bindingList[set][bindingList[set].length] = binding;
      iter = reg.exec(wgslStr);
    }
  }
  return bindingList;
}
var clearPassData = {
  vertShader: null,
  fragShader: null,
  bindGroupLayout: null,
  pipelineLayout: null,
  pipeline: null
};
function clearRect(device, texture, renderArea, color) {
  var _texture$gpuTexture;
  var format = texture.gpuTexture.format;
  texture.gpuTarget;
  var nativeDevice = device.nativeDevice;
  if (!clearPassData.vertShader) {
    var clearQuadVert = "\n        struct VertexOutput {\n            @builtin(position) Position: vec4<f32>,\n        }\n\n        @vertex\n        fn main(@builtin(vertex_index) VertexIndex: u32) -> VertexOutput {\n            var pos = array<vec2<f32>, 6>(\n            vec2<f32>(1.0, 1.0),\n            vec2<f32>(1.0, -1.0),\n            vec2<f32>(-1.0, -1.0),\n            vec2<f32>(1.0, 1.0),\n            vec2<f32>(-1.0, -1.0),\n            vec2<f32>(-1.0, 1.0)\n            );\n\n            var output: VertexOutput;\n            output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);\n            return output;\n        }\n        ";
    var clearQuadFrag = "\n        struct ClearColor {\n            color: vec4<f32>,\n        }\n\n        @group(0) @binding(0) var<uniform> uClearColor: ClearColor;\n\n        @fragment\n        fn main() -> @location(0) vec4<f32> {\n            return uClearColor.color;\n        }\n        ";
    var vertShaderModule = nativeDevice.createShaderModule({
      code: clearQuadVert
    });
    var fragShaderModule = nativeDevice.createShaderModule({
      code: clearQuadFrag
    });
    clearPassData.vertShader = vertShaderModule;
    clearPassData.fragShader = fragShaderModule;
    var bufferEntry = {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {
        type: 'uniform',
        hasDynamicOffset: false,
        minBindingSize: 16
      }
    };
    var bgLayoutDesc = {
      label: 'clearPassBGLayout',
      entries: [bufferEntry]
    };
    var bindGroupLayout = nativeDevice.createBindGroupLayout(bgLayoutDesc);
    clearPassData.bindGroupLayout = bindGroupLayout;
    var pipelineLayoutDesc = {
      label: 'clearPassPipelineLayout',
      bindGroupLayouts: [clearPassData.bindGroupLayout]
    };
    var pipelineLayout = nativeDevice.createPipelineLayout(pipelineLayoutDesc);
    clearPassData.pipelineLayout = pipelineLayout;
    var vertexState = {
      module: clearPassData.vertShader,
      entryPoint: 'main'
    };
    var primitiveState = {
      topology: 'triangle-list',
      frontFace: 'ccw',
      cullMode: 'none'
    };
    var colorState = {
      format: format,
      writeMask: 0xF
    };
    var fragState = {
      module: clearPassData.fragShader,
      entryPoint: 'main',
      targets: [colorState]
    };
    var multisample = {
      count: 1,
      alphaToCoverageEnabled: false,
      mask: 0xFFFFFFFF
    };
    var pipelineDesc = {
      label: 'clearPassPipeline',
      layout: clearPassData.pipelineLayout,
      vertex: vertexState,
      primitive: primitiveState,
      fragment: fragState,
      multisample: multisample
    };
    var pipeline = nativeDevice.createRenderPipeline(pipelineDesc);
    clearPassData.pipeline = pipeline;
  }
  var commandEncoder = nativeDevice.createCommandEncoder();
  var desc = {
    format: format,
    dimension: '2d',
    baseMipLevel: 0,
    mipLevelCount: 1,
    baseArrayLayer: 0,
    arrayLayerCount: 1,
    aspect: 'all'
  };
  var dstView = (_texture$gpuTexture = texture.gpuTexture) == null ? void 0 : _texture$gpuTexture.createView(desc);
  var bufferDesc = {
    usage: GPUBufferUsage.UNIFORM,
    size: 16,
    mappedAtCreation: true
  };
  var uniformBuffer = nativeDevice.createBuffer(bufferDesc);
  var colorArr = [color.x, color.y, color.z, color.w];
  var mappedBuffer = uniformBuffer.getMappedRange(0, 16);
  var f32 = new Float32Array(mappedBuffer);
  f32.set(colorArr);
  uniformBuffer.unmap();
  var entry = {
    binding: 0,
    resource: {
      buffer: uniformBuffer,
      offset: 0,
      size: 16
    }
  };
  var bindgroupDesc = {
    layout: clearPassData.bindGroupLayout,
    entries: [entry]
  };
  var bindGroup = nativeDevice.createBindGroup(bindgroupDesc);
  var colorAttachment = {
    view: dstView,
    loadOp: 'load',
    storeOp: 'store',
    clearValue: [0.88, 0.88, 0.88, 1.0]
  };
  var rpDesc = {
    colorAttachments: [colorAttachment]
  };
  var renderPassEncoder = commandEncoder.beginRenderPass(rpDesc);
  renderPassEncoder.setPipeline(clearPassData.pipeline);
  renderPassEncoder.setBindGroup(0, bindGroup);
  renderPassEncoder.setViewport(renderArea.x, renderArea.y, renderArea.width, renderArea.height, 0.0, 1.0);
  renderPassEncoder.setScissorRect(renderArea.x, renderArea.y, renderArea.width, renderArea.height);
  renderPassEncoder.draw(6, 1, 0, 0);
  renderPassEncoder.end();
  var commandBuffer = commandEncoder.finish();
  nativeDevice.queue.submit([commandBuffer]);
  uniformBuffer.destroy();
}
function findEmployAttr(stage) {
  if (stage.type !== ShaderStageFlagBit.VERTEX) {
    return;
  }
  var locationRegex = /@location\(\d+\)[ ]+\w+/g;
  var matches = stage.source.match(locationRegex);
  if (!matches) {
    return;
  }
  matches.forEach(function (match) {
    var locRegex = /@location\((\d+)\)/g;
    var matchLoc = match.match(locRegex);
    var location = matchLoc[0].slice(matchLoc[0].indexOf('(') + 1, matchLoc[0].indexOf(')')).trim();
    var locNameRegex = /@location\(\d+\)/;
    var locName = match.replace(locNameRegex, '').trim();
    var rmvLocRegex = new RegExp(",*[ ]*@location\\(\\d+\\)[ ]+" + locName + "+\\b\\s*:\\s*\\w+\\<\\w+\\>\\s*");
    var equalAttr = new RegExp("\\b(\\w+)\\s*=[ ]*" + locName + "\\b\\s*;", 'g');
    var targetVar = stage.source.match(equalAttr);
    var targetVarName = targetVar[0];
    var searchTarVarName = targetVarName.slice(0, targetVarName.indexOf('=')).trim();
    var matchCountRegex = new RegExp("\\.*\\b" + searchTarVarName + "\\b\\.*", 'g');
    var matchesCount = stage.source.match(matchCountRegex);
    var usageCount = matchesCount ? matchesCount.length : 0;
    if (usageCount <= 2) {
      stage.source = stage.source.replace(rmvLocRegex, '');
      stage.source = stage.source.replace(equalAttr, '');
      var varNameReg = new RegExp("var\\<\\w+\\>\\s+" + searchTarVarName + "+\\s*:\\s*\\w+\\<\\w+\\>\\s*;");
      stage.source = stage.source.replace(varNameReg, '');
    } else {
      stage.attrs.set(parseInt(location), locName);
    }
  });
}
function WebGPUCmdFuncCreateGPUShader(device, gpuShader) {
  var nativeDevice = device.nativeDevice;
  var glslang = device.glslang;
  var twgsl = device.twgsl;
  var wgslCodes = [];
  var stageSize = gpuShader.gpuStages.length;
  var _loop2 = function _loop2() {
    wgslCodes.length = 0;
    var gpuStage = gpuShader.gpuStages[i];
    var glslSource = seperateCombinedSamplerTexture(gpuStage.source);
    var stageStr = gpuStage.type === ShaderStageFlagBit.VERTEX ? 'vertex' : gpuStage.type === ShaderStageFlagBit.FRAGMENT ? 'fragment' : 'compute';
    var sourceCode = "#version 450\n#define CC_USE_WGPU 1\n" + glslSource;
    var spv = glslang.compileGLSL(sourceCode, stageStr, false, '1.3');
    var wgsl = twgsl.convertSpirV2WGSL(spv);
    if (wgsl === '') {
      error('empty wgsl');
    }
    gpuStage.source = wgsl;
    findEmployAttr(gpuStage);
    wgsl = gpuStage.source;
    var shader = nativeDevice == null ? void 0 : nativeDevice.createShaderModule({
      code: wgsl
    });
    shader.getCompilationInfo().then(function (compileInfo) {
      compileInfo.messages.forEach(function (info) {
        log(sourceCode, wgsl, info.lineNum, info.linePos, info.type, info.message);
      });
    })["catch"](function (compileInfo) {
      compileInfo.messages.forEach(function (info) {
        log(sourceCode, wgsl, info.lineNum, info.linePos, info.type, info.message);
      });
    });
    var shaderStage = {
      module: shader,
      entryPoint: 'main'
    };
    gpuStage.gpuShader = shaderStage;
    wgslCodes.push(wgsl);
    var bindingList = reflect(wgslCodes);
    gpuStage.bindings = bindingList;
    var bindingListSize = bindingList.length;
    for (var s = 0; s < bindingListSize; s++) {
      var currBindingSize = bindingList[s].length;
      if (currBindingSize) {
        if (!gpuShader.bindings.has(s)) {
          gpuShader.bindings.set(s, []);
        }
        var bindings = gpuShader.bindings.get(s);
        for (var b = 0; b < currBindingSize; b++) {
          if (!bindings.includes(bindingList[s][b])) {
            bindings.push(bindingList[s][b]);
          }
        }
      }
    }
  };
  for (var i = 0; i < stageSize; ++i) {
    _loop2();
  }
}
function WebGPUCmdFuncDestroyShader(device, gpuShader) {
  if (gpuShader.gpuProgram) {
    gpuShader.gpuProgram = null;
  }
}
function WebGPUCmdFuncCreateInputAssember(device, gpuInputAssembler) {
  var attrSize = gpuInputAssembler.attributes.length;
  gpuInputAssembler.gpuAttribs = new Array(attrSize);
  var offsets = [0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < attrSize; ++i) {
    var attrib = gpuInputAssembler.attributes[i];
    var stream = attrib.stream !== undefined ? attrib.stream : 0;
    var gpuBuffer = gpuInputAssembler.gpuVertexBuffers[stream];
    var gpuType = 0;
    var size = FormatInfos[attrib.format].size;
    gpuInputAssembler.gpuAttribs[i] = {
      name: attrib.name,
      gpuBuffer: gpuBuffer.gpuBuffer,
      gpuType: gpuType,
      size: size,
      count: FormatInfos[attrib.format].count,
      stride: gpuBuffer.stride,
      componentCount: 4,
      isNormalized: attrib.isNormalized !== undefined ? attrib.isNormalized : false,
      isInstanced: attrib.isInstanced !== undefined ? attrib.isInstanced : false,
      offset: offsets[stream]
    };
    offsets[stream] += size;
  }
}
function WebGPUCmdFuncDestroyInputAssembler(device, gpuInputAssembler) {}
function WebGPUCmdFuncCopyTexImagesToTexture(device, texImages, gpuTexture, regions) {
  var nativeDevice = device.nativeDevice;
  var regionSize = regions.length;
  for (var i = 0; i < regionSize; i++) {
    var region = regions[i];
    var texImg = texImages[i];
    nativeDevice.queue.copyExternalImageToTexture({
      source: texImg
    }, {
      texture: gpuTexture.gpuTexture,
      mipLevel: region.texSubres.mipLevel,
      origin: {
        x: region.texOffset.x,
        y: region.texOffset.y,
        z: region.texSubres.baseArrayLayer
      }
    }, [regions[i].texExtent.width, regions[i].texExtent.height, regions[i].texExtent.depth]);
  }
  if (gpuTexture.flags & TextureFlagBit.GEN_MIPMAP) {
    genMipMap(device, gpuTexture, 1, gpuTexture.mipLevel - 1, 0);
  }
}
var GFXSampleTypeToGPUTextureSampleType = ['float', 'unfilterable-float', 'sint', 'uint'];
var GFXViewDimensionToGPUViewDimension = ['2d', '2d', '1d', '1d', '2d', '2d-array', '2d', '2d-array', '3d', 'cube', 'cube-array', '2d'];
var GFXMemoryAccessToGPUStorageTextureAccess = ['read-only', 'read-only', 'write-only', 'read-write'];
function createBindGroupLayoutEntry(currBind) {
  var binding = currBind.binding;
  var gpuVisibility = GFXStageToWebGPUStage(currBind.stageFlags);
  var entrys = [];
  var entry = {
    binding: binding,
    visibility: gpuVisibility
  };
  entrys.push(entry);
  var device = WebGPUDeviceManager.instance;
  var entrySampler = null;
  var samplerType = GFXSampleTypeToGPUTextureSampleType[currBind.sampleType];
  if (samplerType === 'float' && !device.floatFilterable) {
    samplerType = 'unfilterable-float';
  }
  var isTexUnFilter = samplerType === 'unfilterable-float';
  var viewDimension = GFXViewDimensionToGPUViewDimension[currBind.viewDimension];
  var type = currBind.descriptorType;
  var multisampled = currBind.viewDimension > 5 && currBind.viewDimension < 8;
  switch (type) {
    case DescriptorType.UNIFORM_BUFFER:
    case DescriptorType.DYNAMIC_UNIFORM_BUFFER:
      entry.buffer = {
        type: 'uniform',
        hasDynamicOffset: type === DescriptorType.DYNAMIC_UNIFORM_BUFFER,
        minBindingSize: undefined
      };
      break;
    case DescriptorType.STORAGE_BUFFER:
    case DescriptorType.DYNAMIC_STORAGE_BUFFER:
      entry.buffer = {
        type: 'storage',
        hasDynamicOffset: type === DescriptorType.DYNAMIC_STORAGE_BUFFER,
        minBindingSize: undefined
      };
      break;
    case DescriptorType.SAMPLER_TEXTURE:
      entry.texture = {
        sampleType: samplerType,
        viewDimension: viewDimension,
        multisampled: multisampled
      };
      entrySampler = {
        binding: binding + SEPARATE_SAMPLER_BINDING_OFFSET,
        visibility: gpuVisibility
      };
      entrySampler.sampler = {
        type: isTexUnFilter ? 'non-filtering' : 'filtering'
      };
      entrys.push(entrySampler);
      break;
    case DescriptorType.SAMPLER:
      entry.sampler = {
        type: isTexUnFilter ? 'non-filtering' : 'filtering'
      };
      break;
    case DescriptorType.TEXTURE:
      entry.texture = {
        sampleType: samplerType,
        viewDimension: viewDimension,
        multisampled: multisampled
      };
      break;
    case DescriptorType.STORAGE_IMAGE:
      entry.storageTexture = {
        access: GFXMemoryAccessToGPUStorageTextureAccess[currBind.access],
        format: GFXFormatToWGPUFormat(currBind.format),
        viewDimension: viewDimension
      };
      break;
    case DescriptorType.INPUT_ATTACHMENT:
      entry.texture = {
        sampleType: samplerType,
        viewDimension: viewDimension,
        multisampled: multisampled
      };
      break;
    default:
      throw new Error("Unsupported descriptor type: " + type);
  }
  return entrys;
}
function TextureSampleTypeTrait(format) {
  switch (format) {
    case Format.R8:
    case Format.R8SN:
    case Format.RG8:
    case Format.RGBA8:
    case Format.BGRA8:
    case Format.RG8SN:
    case Format.SRGB8_A8:
    case Format.RGB10A2:
    case Format.RGBA16F:
      return 'float';
    case Format.R8UI:
    case Format.R16UI:
    case Format.RG8UI:
    case Format.R32UI:
    case Format.RG16UI:
    case Format.RGBA8UI:
    case Format.RG32UI:
    case Format.RGBA32UI:
    case Format.RGBA16UI:
    case Format.DEPTH_STENCIL:
      return 'uint';
    case Format.R8I:
    case Format.R16I:
    case Format.RG8I:
    case Format.RG16I:
    case Format.RGBA8I:
    case Format.RG32I:
    case Format.RGBA16I:
    case Format.RGBA32I:
    case Format.R32I:
      return 'sint';
    case Format.R16F:
    case Format.R32F:
    case Format.RG16F:
    case Format.R11G11B10F:
    case Format.RG32F:
    case Format.RGBA32F:
      return 'unfilterable-float';
    case Format.DEPTH:
      return 'depth';
    default:
      warn('Unsupported texture sample type yet. Please refer to the documentation for supported formats.');
      return 'float';
  }
}
function FormatToWGPUFormatType(format) {
  if (format === Format.DEPTH_STENCIL) {
    return 'unfilterable-float';
  }
  return TextureSampleTypeTrait(format);
}
var mipmapData;
function genMipMap(device, texture, fromLevel, levelCount, baseLayer) {
  var format = texture.gpuFormat;
  texture.gpuTarget;
  var nativeDevice = device.nativeDevice;
  if (!mipmapData) {
    mipmapData = {};
    var texQuadVert = "\n        struct VertexOutput {\n            @builtin(position) Position : vec4<f32>,\n            @location(0) fragUV : vec2<f32>,\n          }\n\n          @vertex\n          fn vert_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {\n            var pos = array<vec2<f32>, 6>(\n              vec2<f32>( 1.0,  1.0),\n              vec2<f32>( 1.0, -1.0),\n              vec2<f32>(-1.0, -1.0),\n              vec2<f32>( 1.0,  1.0),\n              vec2<f32>(-1.0, -1.0),\n              vec2<f32>(-1.0,  1.0)\n            );\n\n            var uv = array<vec2<f32>, 6>(\n              vec2<f32>(1.0, 0.0),\n              vec2<f32>(1.0, 1.0),\n              vec2<f32>(0.0, 1.0),\n              vec2<f32>(1.0, 0.0),\n              vec2<f32>(0.0, 1.0),\n              vec2<f32>(0.0, 0.0)\n            );\n\n            var output : VertexOutput;\n            output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);\n            output.fragUV = uv[VertexIndex];\n            return output;\n          }\n        ";
    var texQuadFrag = "\n        @group(0) @binding(0) var mySampler : sampler;\n        @group(0) @binding(1) var myTexture : texture_2d<f32>;\n\n        @fragment\n        fn frag_main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {\n        return textureSample(myTexture, mySampler, fragUV);\n        }\n        ";
    var samplerDesc = {};
    samplerDesc.label = 'filterSampler';
    samplerDesc.addressModeU = 'mirror-repeat';
    samplerDesc.addressModeV = 'mirror-repeat';
    samplerDesc.addressModeW = 'mirror-repeat';
    samplerDesc.magFilter = 'linear';
    samplerDesc.minFilter = 'linear';
    samplerDesc.mipmapFilter = 'linear';
    samplerDesc.lodMinClamp = 0.0;
    samplerDesc.lodMaxClamp = 32.0;
    samplerDesc.maxAnisotropy = 1;
    mipmapData.sampler = nativeDevice.createSampler(samplerDesc);
    var shaderDescVert = nativeDevice.createShaderModule({
      code: texQuadVert
    });
    mipmapData.vertShader = shaderDescVert;
    var shaderDescFrag = nativeDevice.createShaderModule({
      code: texQuadFrag
    });
    mipmapData.fragShader = shaderDescFrag;
    var samplerEntry = {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: {
        type: 'filtering'
      }
    };
    var textureEntry = {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {
        sampleType: TextureSampleTypeTrait(texture.format),
        viewDimension: '2d',
        multisampled: false
      }
    };
    var bgLayoutDesc = {
      label: 'fullscreenTexturedQuadBGLayout',
      entries: [samplerEntry, textureEntry]
    };
    var bindGroupLayout = nativeDevice.createBindGroupLayout(bgLayoutDesc);
    mipmapData.bindGroupLayout = bindGroupLayout;
    var pipelineLayoutDesc = {
      label: 'fullscreenTexturedQuadPipelineLayout',
      bindGroupLayouts: [bindGroupLayout]
    };
    var pipelineLayout = nativeDevice.createPipelineLayout(pipelineLayoutDesc);
    mipmapData.pipelineLayout = pipelineLayout;
    var vertexState = {
      module: mipmapData.vertShader,
      entryPoint: 'vert_main',
      buffers: []
    };
    var primitiveState = {
      topology: 'triangle-list',
      frontFace: 'ccw',
      cullMode: 'none'
    };
    var colorState = {
      format: format,
      writeMask: 0xF
    };
    var fragState = {
      module: mipmapData.fragShader,
      entryPoint: 'frag_main',
      targets: [colorState]
    };
    var multisample = {
      count: 1,
      alphaToCoverageEnabled: false,
      mask: 0xFFFFFFFF
    };
    var pipelineDesc = {
      label: 'fullscreenTexturedQuadPipeline',
      layout: pipelineLayout,
      vertex: vertexState,
      primitive: primitiveState,
      fragment: fragState,
      multisample: multisample
    };
    var pipeline = nativeDevice.createRenderPipeline(pipelineDesc);
    mipmapData.pipeline = pipeline;
  }
  var desc = {
    format: format,
    dimension: '2d',
    baseMipLevel: fromLevel,
    mipLevelCount: 1,
    baseArrayLayer: baseLayer,
    arrayLayerCount: 1,
    aspect: 'all'
  };
  var commandEncoder = nativeDevice.createCommandEncoder();
  for (var i = fromLevel; i < fromLevel + levelCount; ++i) {
    desc.baseMipLevel = i - 1;
    var srcView = texture.gpuTexture.createView(desc);
    desc.baseMipLevel = i;
    desc.baseArrayLayer = baseLayer;
    desc.arrayLayerCount = 1;
    var dstView = texture.gpuTexture.createView(desc);
    var entries = [{
      binding: 0,
      resource: mipmapData.sampler
    }, {
      binding: 1,
      resource: srcView
    }];
    var bindgroupDesc = {
      layout: mipmapData.bindGroupLayout,
      entries: entries
    };
    var bindGroup = nativeDevice.createBindGroup(bindgroupDesc);
    var colorAttachment = {
      view: dstView,
      loadOp: 'clear',
      storeOp: 'store',
      clearValue: [0.88, 0.88, 0.88, 1.0]
    };
    var rpDesc = {
      colorAttachments: [colorAttachment]
    };
    var renderPassEncoder = commandEncoder.beginRenderPass(rpDesc);
    renderPassEncoder.setPipeline(mipmapData.pipeline);
    renderPassEncoder.setBindGroup(0, bindGroup);
    renderPassEncoder.draw(6, 1, 0, 0);
    renderPassEncoder.end();
  }
  var commandBuffer = commandEncoder.finish();
  nativeDevice.queue.submit([commandBuffer]);
}
function WebGPUCmdFuncCopyBuffersToTexture(device, buffers, gpuTexture, regions) {
  var nativeDevice = device.nativeDevice;
  var dstFormat = gpuTexture.format;
  var blockSize = formatAlignment(dstFormat);
  var regionSize = regions.length;
  for (var i = 0; i < regionSize; ++i) {
    var region = regions[i];
    var bufferPixelWidth = region.buffStride > 0 ? region.buffStride : region.texExtent.width;
    var bufferPixelHeight = region.buffTexHeight > 0 ? region.buffTexHeight : region.texExtent.height;
    FormatSize(dstFormat, region.texExtent.width, 1, 1);
    var bufferBytesPerRow = FormatSize(dstFormat, bufferPixelWidth, 1, 1);
    var bufferBytesPerImageSlice = FormatSize(dstFormat, bufferPixelWidth, bufferPixelHeight, 1);
    var bufferBytesPerImageLayer = FormatSize(dstFormat, bufferPixelWidth, bufferPixelHeight, region.texExtent.depth);
    var targetWidth = region.texExtent.width === 0 ? 0 : alignTo(region.texExtent.width, blockSize.width);
    var targetHeight = region.texExtent.height === 0 ? 0 : alignTo(region.texExtent.height, blockSize.height);
    var imgDataLayout = {
      offset: 0,
      bytesPerRow: bufferBytesPerRow,
      rowsPerImage: bufferPixelHeight
    };
    var compactInWidth = bufferPixelWidth === region.texExtent.width;
    for (var l = region.texSubres.baseArrayLayer; l < region.texSubres.layerCount + region.texSubres.baseArrayLayer; l++) {
      for (var d = region.texOffset.z; d < region.texExtent.depth + region.texOffset.z; d++) {
        if (compactInWidth) {
          var arrayBuffer = buffers[i];
          var buffer = void 0;
          if ('buffer' in arrayBuffer) {
            buffer = new Uint8Array(arrayBuffer.buffer, arrayBuffer.byteOffset, arrayBuffer.byteLength);
          } else {
            buffer = new Uint8Array(arrayBuffer);
          }
          var srcData = new Uint8Array(buffer, buffer.byteOffset + region.buffOffset + (l - region.texSubres.baseArrayLayer) * bufferBytesPerImageLayer + (d - region.texOffset.z) * bufferBytesPerImageSlice);
          var copyTarget = {
            texture: gpuTexture.gpuTexture,
            mipLevel: region.texSubres.mipLevel,
            origin: {
              x: region.texOffset.x,
              y: region.texOffset.y,
              z: l
            }
          };
          nativeDevice.queue.writeTexture(copyTarget, srcData, imgDataLayout, [targetWidth, targetHeight, region.texExtent.depth]);
        } else {
          for (var h = region.texOffset.y; h < region.texExtent.height + region.texOffset.y; h += blockSize.height) {
            var _srcData = new Uint8Array(buffers[i].buffer, buffers[i].byteOffset + region.buffOffset + (l - region.texSubres.baseArrayLayer) * bufferBytesPerImageLayer + ((d - region.texOffset.z) * bufferBytesPerImageSlice + (h - region.texOffset.y) / blockSize.height * bufferBytesPerRow));
            var _copyTarget = {
              texture: gpuTexture.gpuTexture,
              mipLevel: region.texSubres.mipLevel,
              origin: {
                x: region.texOffset.x,
                y: h,
                z: l
              }
            };
            nativeDevice.queue.writeTexture(_copyTarget, _srcData, imgDataLayout, [targetWidth, blockSize.height, region.texExtent.depth]);
          }
        }
      }
      if (gpuTexture.flags & TextureFlagBit.GEN_MIPMAP) {
        genMipMap(device, gpuTexture, 1, gpuTexture.mipLevel - 1, 0);
      }
    }
  }
}

var WebGPUDescriptorSet = function (_DescriptorSet) {
  function WebGPUDescriptorSet() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _DescriptorSet.call.apply(_DescriptorSet, [this].concat(args)) || this;
    _this._gpuDescriptorSet = null;
    _this._bindGroupEntries = new Map();
    _this._dynamicOffsets = [];
    return _this;
  }
  _inheritsLoose(WebGPUDescriptorSet, _DescriptorSet);
  var _proto = WebGPUDescriptorSet.prototype;
  _proto.initialize = function initialize(info) {
    var layout = this._layout = info.layout;
    var _ref = layout.gpuDescriptorSetLayout,
      bindings = _ref.bindings,
      descriptorIndices = _ref.descriptorIndices,
      descriptorCount = _ref.descriptorCount;
    this._buffers = Array(descriptorCount).fill(null);
    this._textures = Array(descriptorCount).fill(null);
    this._samplers = Array(descriptorCount).fill(null);
    var gpuDescriptors = [];
    var bindGroup = null;
    var bindGroupLayout = null;
    this._gpuDescriptorSet = {
      gpuDescriptors: gpuDescriptors,
      descriptorIndices: descriptorIndices,
      bindGroup: bindGroup,
      bindGroupLayout: bindGroupLayout
    };
    var bindingSize = bindings.length;
    for (var i = 0; i < bindingSize; ++i) {
      var binding = bindings[i];
      var bindCount = binding.count;
      for (var j = 0; j < bindCount; j++) {
        gpuDescriptors.push({
          type: binding.descriptorType,
          gpuBuffer: null,
          gpuTexture: null,
          gpuSampler: null
        });
      }
    }
  };
  _proto.destroy = function destroy() {
    this._layout = null;
    this._gpuDescriptorSet = null;
    this._buffers.length = 0;
    this._textures.length = 0;
    this._samplers.length = 0;
    this._bindGroupEntries.clear();
  };
  _proto._bindBufferEntry = function _bindBufferEntry(bind, buffer) {
    var destBind = this._gpuDescriptorSet.gpuDescriptors[bind.binding];
    if (destBind) {
      destBind.gpuBuffer = buffer.gpuBuffer;
    }
    var nativeBuffer = buffer.gpuBuffer.gpuBuffer;
    var bindGrpEntry = {
      binding: bind.binding,
      resource: {
        buffer: nativeBuffer,
        offset: buffer.gpuBuffer.gpuOffset,
        size: buffer.gpuBuffer.size
      }
    };
    this._bindGroupEntries.set(bindGrpEntry.binding, bindGrpEntry);
    buffer.resetChange();
  };
  _proto._bindTextureEntry = function _bindTextureEntry(bind, texture) {
    this._gpuDescriptorSet.gpuDescriptors[bind.binding].gpuTexture = texture.gpuTexture;
    var nativeTexView = texture.getNativeTextureView();
    var bindGrpEntry = {
      binding: bind.binding,
      resource: nativeTexView
    };
    this._bindGroupEntries.set(bindGrpEntry.binding, bindGrpEntry);
    texture.resetChange();
  };
  _proto._bindSamplerEntry = function _bindSamplerEntry(bind, sampler) {
    var samplerIdx = bind.binding + SEPARATE_SAMPLER_BINDING_OFFSET;
    this._gpuDescriptorSet.gpuDescriptors[bind.binding].gpuSampler = sampler.gpuSampler;
    var device = WebGPUDeviceManager.instance;
    var currTexture = this._textures[bind.binding] || device.defaultResource.texture;
    var levelCount = currTexture.levelCount;
    var texFormat = currTexture.format;
    var isUnFilter = FormatToWGPUFormatType(texFormat) === 'unfilterable-float' || FormatToWGPUFormatType(texFormat) === 'float' && !device.floatFilterable;
    if (isUnFilter) {
      sampler.gpuSampler.minFilter = Filter.POINT;
      sampler.gpuSampler.magFilter = Filter.POINT;
      sampler.gpuSampler.mipFilter = Filter.POINT;
    }
    var currGPUSampler = sampler.createGPUSampler(levelCount);
    var bindSamplerGrpEntry = {
      binding: samplerIdx,
      resource: currGPUSampler
    };
    this._bindGroupEntries.set(samplerIdx, bindSamplerGrpEntry);
    sampler.resetChange();
  };
  _proto._applyBindGroup = function _applyBindGroup() {
    if (this._isDirty && this._gpuDescriptorSet) {
      var layout = this._layout;
      this._bindGroupEntries.clear();
      this._dynamicOffsets.length = 0;
      var descriptors = this._gpuDescriptorSet.gpuDescriptors;
      var bindings = layout.gpuDescriptorSetLayout.bindings;
      var descCount = bindings.length;
      var device = WebGPUDeviceManager.instance;
      for (var i = 0; i < descCount; ++i) {
        var binding = bindings[i];
        var bindIdx = binding.binding;
        var descType = descriptors[i].type;
        if (descType & DESCRIPTOR_BUFFER_TYPE) {
          var defaultBuffer = device.defaultResource.buffer;
          var buffer = this._buffers[i] || defaultBuffer;
          if (buffer === defaultBuffer && descType & DESCRIPTOR_STORAGE_BUFFER_TYPE) {
            buffer = device.defaultResource.getStorageBuffer(bindIdx);
          }
          this._bindBufferEntry(binding, buffer);
          if (descType & (DescriptorType.DYNAMIC_STORAGE_BUFFER | DescriptorType.DYNAMIC_UNIFORM_BUFFER)) {
            this._dynamicOffsets.push(bindIdx);
          }
        } else if (descType & DESCRIPTOR_SAMPLER_TYPE) {
          if ((descType & DescriptorType.SAMPLER) !== DescriptorType.SAMPLER) {
            var currTex = this._textures[i];
            if (!currTex || currTex.hasChange && !currTex.gpuTexture) {
              if (binding.viewDimension === ViewDimension.TEXCUBE) {
                currTex = device.defaultResource.cubeTexture;
              } else {
                currTex = device.defaultResource.texture;
              }
            }
            this._bindTextureEntry(binding, currTex);
          }
          if (!((descType & DescriptorType.STORAGE_IMAGE) === DescriptorType.STORAGE_IMAGE || (descType & DescriptorType.INPUT_ATTACHMENT) === DescriptorType.INPUT_ATTACHMENT || (descType & DescriptorType.TEXTURE) === DescriptorType.TEXTURE)) {
            var currSampler = this._samplers[i] || device.defaultResource.sampler;
            this._bindSamplerEntry(binding, currSampler);
          }
        }
      }
      this._isDirty = false;
      this._createBindGroup();
    }
  };
  _proto._hasResourceChange = function _hasResourceChange(resource) {
    if (resource && resource.hasChange) {
      return true;
    }
    return false;
  };
  _proto._isResourceChange = function _isResourceChange() {
    var _this2 = this;
    var layout = this._layout;
    if (!layout) {
      return false;
    }
    return layout.gpuDescriptorSetLayout.bindings.some(function (bind) {
      var binding = bind.binding;
      var resource = _this2._buffers[binding] || _this2._textures[binding] || _this2._samplers[binding];
      return _this2._hasResourceChange(resource);
    });
  };
  _proto.prepare = function prepare(force) {
    if (force === void 0) {
      force = false;
    }
    var breakUpdate = !this._isResourceChange() && !force;
    if (breakUpdate) return;
    this._isDirty = true;
    this._applyBindGroup();
  };
  _proto._createBindGroup = function _createBindGroup() {
    var device = WebGPUDeviceManager.instance;
    var nativeDevice = device.nativeDevice;
    var layout = this._layout;
    var bindGroup = nativeDevice == null ? void 0 : nativeDevice.createBindGroup({
      layout: layout.gpuDescriptorSetLayout.bindGroupLayout,
      entries: this._bindGroupEntries.values()
    });
    this._gpuDescriptorSet.bindGroupLayout = layout.gpuDescriptorSetLayout.bindGroupLayout;
    this._gpuDescriptorSet.bindGroup = bindGroup;
  };
  _proto.update = function update() {
    this._applyBindGroup();
  };
  return _createClass(WebGPUDescriptorSet, [{
    key: "gpuDescriptorSet",
    get: function get() {
      return this._gpuDescriptorSet;
    }
  }, {
    key: "dynamicOffsets",
    get: function get() {
      return this._dynamicOffsets;
    }
  }, {
    key: "dynamicOffsetCount",
    get: function get() {
      return this._dynamicOffsets.length;
    }
  }]);
}(DescriptorSet);

var WebGPUBuffer = function (_Buffer) {
  function WebGPUBuffer() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Buffer.call.apply(_Buffer, [this].concat(args)) || this;
    _this._gpuBuffer = null;
    _this._indirectBuffer = null;
    _this._hasChange = false;
    return _this;
  }
  _inheritsLoose(WebGPUBuffer, _Buffer);
  var _proto = WebGPUBuffer.prototype;
  _proto.resetChange = function resetChange() {
    this._hasChange = false;
  };
  _proto.initialize = function initialize(info) {
    if ('buffer' in info) {
      this._isBufferView = true;
      var buffer = info.buffer;
      this._usage = buffer.usage;
      this._memUsage = buffer.memUsage;
      this._size = this._stride = Math.ceil(info.range / 4.0) * 4;
      this._count = 1;
      this._flags = buffer.flags;
      this._gpuBuffer = {
        usage: this._usage,
        memUsage: this._memUsage,
        size: this._size,
        stride: this._stride,
        buffer: null,
        indirects: buffer.gpuBuffer.indirects,
        gpuTarget: buffer.gpuBuffer.gpuTarget,
        gpuBuffer: buffer.gpuBuffer.gpuBuffer,
        gpuOffset: info.offset,
        flags: this._flags,
        drawIndirectByIndex: false
      };
    } else {
      this._usage = info.usage;
      this._memUsage = info.memUsage;
      this._size = Math.ceil(info.size / 4.0) * 4;
      this._stride = Math.max(info.stride || this._size, 1);
      this._count = this._size / this._stride;
      this._flags = info.flags;
      if (this._usage & BufferUsageBit.INDIRECT) {
        this._indirectBuffer = new IndirectBuffer();
      }
      this._gpuBuffer = {
        usage: this._usage,
        memUsage: this._memUsage,
        size: this._size,
        stride: this._stride,
        buffer: null,
        indirects: [],
        gpuTarget: 0,
        flags: this._flags,
        gpuBuffer: null,
        gpuOffset: 0,
        drawIndirectByIndex: false
      };
      if (info.usage & BufferUsageBit.INDIRECT) {
        this._gpuBuffer.indirects = this._indirectBuffer.drawInfos;
      }
      var device = WebGPUDeviceManager.instance;
      WebGPUCmdFuncCreateBuffer(device, this._gpuBuffer);
      device.memoryStatus.bufferSize += this._size;
    }
  };
  _proto.destroy = function destroy() {
    if (this._gpuBuffer) {
      if (!this._isBufferView) {
        var device = WebGPUDeviceManager.instance;
        WebGPUCmdFuncDestroyBuffer(device, this._gpuBuffer);
        device.memoryStatus.bufferSize -= this._size;
      }
      this._hasChange = true;
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
    this._hasChange = true;
    if (this._gpuBuffer) {
      this._gpuBuffer.size = this._size;
      if (this._size > 0) {
        var device = WebGPUDeviceManager.instance;
        WebGPUCmdFuncResizeBuffer(device, this._gpuBuffer);
        device.memoryStatus.bufferSize -= oldSize;
        device.memoryStatus.bufferSize += this._size;
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
    buffSize = Math.ceil(buffSize / 4.0) * 4;
    if (this.size < buffSize) {
      this.resize(buffSize);
    }
    this._hasChange = true;
    var device = WebGPUDeviceManager.instance;
    WebGPUCmdFuncUpdateBuffer(device, this._gpuBuffer, buffer, 0, buffSize);
  };
  return _createClass(WebGPUBuffer, [{
    key: "gpuBuffer",
    get: function get() {
      return this._gpuBuffer;
    }
  }, {
    key: "hasChange",
    get: function get() {
      return this._hasChange;
    }
  }]);
}(Buffer);

var currPipelineState = null;
var descriptorSets = [];
var groupSets = [0, 1, 2];
var renderAreas = [];
var samples = 1;
var WebGPUCommandBuffer = function (_CommandBuffer) {
  function WebGPUCommandBuffer() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _CommandBuffer.call.apply(_CommandBuffer, [this].concat(args)) || this;
    _this.cmdPackage = new WebGPUCmdPackage();
    _this._webGPUAllocator = null;
    _this._isInRenderPass = false;
    _this._curGPUPipelineState = null;
    _this._curWebGPUPipelineState = null;
    _this._curGPUDescriptorSets = [];
    _this._curGPUInputAssembler = null;
    _this._curDynamicOffsets = [];
    _this._curViewport = null;
    _this._curScissor = null;
    _this._curLineWidth = null;
    _this._curDepthBias = null;
    _this._curBlendConstants = [];
    _this._curDepthBounds = null;
    _this._curStencilWriteMask = null;
    _this._curStencilCompareMask = null;
    _this._isStateValid = false;
    _this._globalDescriptors = [];
    _this._nativeCommandBuffer = null;
    _this._encoder = undefined;
    _this._descSetDirtyIndex = INT_MAX;
    _this._nativePassDesc = null;
    _this._wgpuRenderPass = void 0;
    _this._renderPassFuncQueue = [];
    return _this;
  }
  _inheritsLoose(WebGPUCommandBuffer, _CommandBuffer);
  var _proto = WebGPUCommandBuffer.prototype;
  _proto.pipelineBarrier = function pipelineBarrier(barrier, bufferBarriers, buffers, textureBarriers, textures) {
    throw new Error('Method not implemented.');
  };
  _proto.blitTexture = function blitTexture(srcTexture, dstTexture, regions, filter) {
    if (srcTexture.samples > 1) {
      return;
    }
    var device = WebGPUDeviceManager.instance;
    var gpuDevice = device.nativeDevice;
    var encoder = gpuDevice.createCommandEncoder();
    var actualSrcTexture = srcTexture.getTextureHandle();
    for (var _iterator = _createForOfIteratorHelperLoose(regions), _step; !(_step = _iterator()).done;) {
      var region = _step.value;
      encoder.copyTextureToTexture({
        texture: actualSrcTexture,
        origin: {
          x: region.srcOffset.x,
          y: region.srcOffset.y,
          z: region.srcSubres.baseArrayLayer
        }
      }, {
        texture: dstTexture.getTextureHandle(),
        origin: {
          x: region.dstOffset.x,
          y: region.dstOffset.y,
          z: region.dstSubres.baseArrayLayer
        }
      }, {
        width: region.dstExtent.width,
        height: region.dstExtent.height,
        depthOrArrayLayers: region.dstExtent.depth
      });
    }
    var commandBuffer = encoder.finish();
    gpuDevice.queue.submit([commandBuffer]);
  };
  _proto.initialize = function initialize(info) {
    this._type = info.type;
    this._queue = info.queue;
    var device = WebGPUDeviceManager.instance;
    this._webGPUAllocator = device.cmdAllocator;
    this._encoder = {};
    var setCount = device.bindingMappings.blockOffsets.length;
    for (var i = 0; i < setCount; i++) {
      this._curGPUDescriptorSets.push(null);
      this._curDynamicOffsets.push([]);
    }
    return true;
  };
  _proto.destroy = function destroy() {
    if (this._webGPUAllocator) {
      this._webGPUAllocator.clearCmds(this.cmdPackage);
      this._webGPUAllocator = null;
    }
  };
  _proto.begin = function begin(renderPass, subpass, frameBuffer) {
    this._webGPUAllocator.clearCmds(this.cmdPackage);
    renderAreas.length = 0;
    this._curGPUPipelineState = null;
    this._curGPUInputAssembler = null;
    this._curGPUDescriptorSets.length = 0;
    var dynamicOffsetSize = this._curDynamicOffsets.length;
    for (var i = 0; i < dynamicOffsetSize; i++) {
      this._curDynamicOffsets[i].length = 0;
    }
    this._curViewport = null;
    this._curScissor = null;
    this._curLineWidth = null;
    this._curDepthBias = null;
    this._curBlendConstants.length = 0;
    this._curDepthBounds = null;
    this._curStencilWriteMask = null;
    this._curStencilCompareMask = null;
    this._numDrawCalls = 0;
    this._numInstances = 0;
    this._numTris = 0;
  };
  _proto.end = function end() {
    this._isStateValid = false;
    this._isInRenderPass = false;
  };
  _proto.beginRenderPass = function beginRenderPass(renderPass, framebuffer, renderArea, clearColors, clearDepth, clearStencil) {
    var _this$_wgpuRenderPass;
    var device = WebGPUDeviceManager.instance;
    var gpuDevice = device;
    this._wgpuRenderPass = renderPass;
    var nativePassDesc = this._nativePassDesc = this._wgpuRenderPass.gpuRenderPass.nativeRenderPass;
    var originalRP = this._wgpuRenderPass.gpuRenderPass.originalRP;
    var gpuFramebuffer = framebuffer.gpuFramebuffer;
    renderAreas.push(renderArea);
    var needPartialClear = false;
    samples = 1;
    var renderingFullScreen = gpuFramebuffer.gpuColorTextures.every(function (val) {
      if (renderArea.x !== 0 || renderArea.y !== 0 || renderArea.width !== val.width || renderArea.height !== val.height) {
        return false;
      }
      return true;
    });
    var swapchain = gpuDevice.getSwapchains()[0];
    var clearColorSize = clearColors.length;
    for (var i = 0; i < clearColorSize; i++) {
      var colorTex = swapchain.colorGPUTextureView;
      var currGPUTex = void 0;
      if (gpuFramebuffer.isOffscreen) {
        currGPUTex = gpuFramebuffer.gpuColorTextures[i];
        colorTex = currGPUTex.getTextureView();
      }
      colorTex.label = gpuFramebuffer.isOffscreen ? 'offscreen' : 'swapchain';
      if (!renderingFullScreen) {
        needPartialClear = originalRP.colorAttachments[i].loadOp === 'clear';
        if (renderAreas.length > 1) {
          nativePassDesc.colorAttachments[i].loadOp = 'load';
        }
      }
      nativePassDesc.colorAttachments[i].view = colorTex;
      if (currGPUTex && currGPUTex.resolveTex) {
        samples = currGPUTex.samples;
        nativePassDesc.colorAttachments[i].resolveTarget = currGPUTex.resolveTex.gpuTexture.createView();
      }
      nativePassDesc.colorAttachments[i].clearValue = [clearColors[i].x, clearColors[i].y, clearColors[i].z, clearColors[i].w];
    }
    if (((_this$_wgpuRenderPass = this._wgpuRenderPass.depthStencilAttachment) == null ? void 0 : _this$_wgpuRenderPass.format) !== Format.UNKNOWN) {
      var _gpuFramebuffer$gpuDe;
      var tex = (_gpuFramebuffer$gpuDe = gpuFramebuffer.gpuDepthStencilTexture) == null ? void 0 : _gpuFramebuffer$gpuDe.gpuTexture;
      var depthTex = tex ? tex.createView() : swapchain.gpuDepthStencilTextureView;
      var depthStencilAttachment = nativePassDesc.depthStencilAttachment;
      depthStencilAttachment.view = depthTex;
      depthStencilAttachment.depthClearValue = clearDepth;
      depthStencilAttachment.stencilClearValue = clearStencil;
    }
    renderArea.x = Math.floor(renderArea.x);
    renderArea.y = Math.floor(renderArea.y);
    renderArea.width = Math.floor(renderArea.width);
    renderArea.height = Math.floor(renderArea.height);
    var vpfunc = function vpfunc(passEncoder) {
      passEncoder.setViewport(renderArea.x, renderArea.y, renderArea.width, renderArea.height, 0.0, 1.0);
    };
    var srfunc = function srfunc(passEncoder) {
      passEncoder.setScissorRect(renderArea.x, renderArea.y, renderArea.width, renderArea.height);
    };
    this._renderPassFuncQueue.push(vpfunc);
    this._renderPassFuncQueue.push(srfunc);
    if (!renderingFullScreen && needPartialClear) {
      var idx = 0;
      gpuFramebuffer.gpuColorTextures.forEach(function (tex) {
        clearRect(device, tex, renderArea, clearColors[idx]);
        idx++;
      });
    }
    this._isInRenderPass = true;
  };
  _proto.endRenderPass = function endRenderPass() {
    var device = WebGPUDeviceManager.instance;
    var nativeDevice = device.nativeDevice;
    var cmdEncoder = nativeDevice.createCommandEncoder();
    var passEncoder = cmdEncoder.beginRenderPass(this._nativePassDesc);
    this._renderPassFuncQueue.forEach(function (cb) {
      cb(passEncoder);
    });
    passEncoder.end();
    nativeDevice == null ? void 0 : nativeDevice.queue.submit([cmdEncoder.finish()]);
    var idx = 0;
    for (var _iterator2 = _createForOfIteratorHelperLoose(this._nativePassDesc.colorAttachments), _step2; !(_step2 = _iterator2()).done;) {
      var attachment = _step2.value;
      attachment.loadOp = this._wgpuRenderPass.gpuRenderPass.originalRP.colorAttachments[idx].loadOp;
      idx++;
    }
    this._isInRenderPass = false;
    this._isStateValid = false;
    this._renderPassFuncQueue.length = 0;
  };
  _proto.bindPipelineState = function bindPipelineState(pipelineState) {
    var webgpuPipelineState = pipelineState;
    var gpuPipelineState = webgpuPipelineState.gpuPipelineState;
    if (gpuPipelineState !== this._curGPUPipelineState) {
      this._curWebGPUPipelineState = webgpuPipelineState;
      this._curGPUPipelineState = gpuPipelineState;
      currPipelineState = webgpuPipelineState;
      this._isStateValid = true;
    }
  };
  _proto.bindDescriptorSet = function bindDescriptorSet(set, descriptorSet, dynamicOffsets) {
    var gpuDescriptorSets = descriptorSet.gpuDescriptorSet;
    if (gpuDescriptorSets !== this._curGPUDescriptorSets[set]) {
      this._curGPUDescriptorSets[set] = gpuDescriptorSets;
      descriptorSets[set] = descriptorSet;
      this._isStateValid = true;
    }
    if (dynamicOffsets && dynamicOffsets.length) {
      var offsets = this._curDynamicOffsets[set];
      var dynamicOffsetSize = dynamicOffsets.length;
      for (var i = 0; i < dynamicOffsetSize; i++) offsets[i] = dynamicOffsets[i];
      offsets.length = dynamicOffsetSize;
      this._isStateValid = true;
    }
  };
  _proto.bindInputAssembler = function bindInputAssembler(inputAssembler) {
    var gpuInputAssembler = inputAssembler.gpuInputAssembler;
    this._curGPUInputAssembler = gpuInputAssembler;
    this._isStateValid = true;
  };
  _proto.setViewport = function setViewport(viewport) {
    viewport.left = Math.floor(viewport.left);
    viewport.top = Math.floor(viewport.top);
    viewport.width = Math.floor(viewport.width);
    viewport.height = Math.floor(viewport.height);
    viewport.minDepth = Math.floor(viewport.minDepth);
    viewport.maxDepth = Math.floor(viewport.maxDepth);
    this._curViewport = new Viewport(viewport.left, viewport.top, viewport.width, viewport.height, viewport.minDepth, viewport.maxDepth);
    var vpfunc = function vpfunc(passEncoder) {
      passEncoder.setViewport(viewport.left, viewport.top, viewport.width, viewport.height, viewport.minDepth, viewport.maxDepth);
    };
    this._renderPassFuncQueue.push(vpfunc);
    this._isStateValid = true;
  };
  _proto.setScissor = function setScissor(scissor) {
    scissor.x = Math.floor(scissor.x);
    scissor.y = Math.floor(scissor.y);
    scissor.width = Math.floor(scissor.width);
    scissor.height = Math.floor(scissor.height);
    var srfunc = function srfunc(passEncoder) {
      passEncoder.setScissorRect(scissor.x, scissor.y, scissor.width, scissor.height);
    };
    this._renderPassFuncQueue.push(srfunc);
    this._isStateValid = true;
  };
  _proto.setLineWidth = function setLineWidth(lineWidth) {
    error('line width not supproted by webGPU');
  };
  _proto.setDepthBias = function setDepthBias(depthBiasConstantFactor, depthBiasClamp, depthBiasSlopeFactor) {
    if (!this._curDepthBias) {
      this._curDepthBias = {
        constantFactor: depthBiasConstantFactor,
        clamp: depthBiasClamp,
        slopeFactor: depthBiasSlopeFactor
      };
      this._isStateValid = true;
    } else if (this._curDepthBias.constantFactor !== depthBiasConstantFactor || this._curDepthBias.clamp !== depthBiasClamp || this._curDepthBias.slopeFactor !== depthBiasSlopeFactor) {
      this._curDepthBias.constantFactor = depthBiasConstantFactor;
      this._curDepthBias.clamp = depthBiasClamp;
      this._curDepthBias.slopeFactor = depthBiasSlopeFactor;
      this._isStateValid = true;
    }
  };
  _proto.setBlendConstants = function setBlendConstants(blendConstants) {
    if (this._curBlendConstants[0] !== blendConstants.x || this._curBlendConstants[1] !== blendConstants.y || this._curBlendConstants[2] !== blendConstants.z || this._curBlendConstants[3] !== blendConstants.w) {
      this._curBlendConstants.length = 0;
      Array.prototype.push.apply(this._curBlendConstants, [blendConstants.x, blendConstants.y, blendConstants.z, blendConstants.w]);
      this._isStateValid = true;
    }
  };
  _proto.setDepthBound = function setDepthBound(minDepthBounds, maxDepthBounds) {
    if (!this._curDepthBounds) {
      this._curDepthBounds = {
        minBounds: minDepthBounds,
        maxBounds: maxDepthBounds
      };
      this._isStateValid = true;
    } else if (this._curDepthBounds.minBounds !== minDepthBounds || this._curDepthBounds.maxBounds !== maxDepthBounds) {
      this._curDepthBounds = {
        minBounds: minDepthBounds,
        maxBounds: maxDepthBounds
      };
      this._isStateValid = true;
    }
  };
  _proto.setStencilWriteMask = function setStencilWriteMask(face, writeMask) {
    if (!this._curStencilWriteMask) {
      this._curStencilWriteMask = {
        face: face,
        writeMask: writeMask
      };
      this._isStateValid = true;
    } else if (this._curStencilWriteMask.face !== face || this._curStencilWriteMask.writeMask !== writeMask) {
      this._curStencilWriteMask.face = face;
      this._curStencilWriteMask.writeMask = writeMask;
      this._isStateValid = true;
    }
  };
  _proto.setStencilCompareMask = function setStencilCompareMask(face, reference, compareMask) {
    if (!this._curStencilCompareMask) {
      this._curStencilCompareMask = {
        face: face,
        reference: reference,
        compareMask: compareMask
      };
      this._isStateValid = true;
    } else if (this._curStencilCompareMask.face !== face || this._curStencilCompareMask.reference !== reference || this._curStencilCompareMask.compareMask !== compareMask) {
      this._curStencilCompareMask.face = face;
      this._curStencilCompareMask.reference = reference;
      this._curStencilCompareMask.compareMask = compareMask;
      this._isStateValid = true;
    }
  };
  _proto.draw = function draw(inputAssembler) {
    var device = WebGPUDeviceManager.instance;
    if (this._type === CommandBufferType.PRIMARY && !this._isInRenderPass) {
      errorID(16328);
      return;
    }
    if (this._isStateValid) {
      this.bindStates();
    }
    var ia = inputAssembler;
    var iaData = ia.gpuInputAssembler;
    var nativeDevice = device;
    if (ia.indirectBuffer) {
      var indirectBuffer = iaData.gpuIndirectBuffer;
      if (nativeDevice.multiDrawIndirectSupport) ; else {
        var _iaData$gpuIndirectBu;
        var drawInfoCount = (_iaData$gpuIndirectBu = iaData.gpuIndirectBuffer) == null ? void 0 : _iaData$gpuIndirectBu.indirects.length;
        if (indirectBuffer.drawIndirectByIndex) {
          var drawFunc = function drawFunc(passEncoder) {
            var drawInfoSize = Object.keys(DrawInfo).length;
            for (var i = 0; i < drawInfoCount; i++) {
              passEncoder == null ? void 0 : passEncoder.drawIndexedIndirect(indirectBuffer.gpuBuffer, indirectBuffer.gpuOffset + i * drawInfoSize);
            }
          };
          this._renderPassFuncQueue.push(drawFunc);
        } else {
          var _drawFunc = function _drawFunc(passEncoder) {
            var drawInfoSize = Object.keys(DrawInfo).length;
            for (var i = 0; i < drawInfoCount; i++) {
              passEncoder == null ? void 0 : passEncoder.drawIndirect(indirectBuffer.gpuBuffer, indirectBuffer.gpuOffset + i * drawInfoSize);
            }
          };
          this._renderPassFuncQueue.push(_drawFunc);
        }
      }
    } else {
      inputAssembler.instanceCount > 0 ? inputAssembler.instanceCount : 1;
      var drawByIndex = inputAssembler.indexBuffer && ia.indexCount > 0;
      if (drawByIndex) {
        var _drawFunc2 = function _drawFunc2(passEncoder) {
          var instanceCount = Math.max(ia.instanceCount, 1);
          passEncoder == null ? void 0 : passEncoder.drawIndexed(ia.indexCount, instanceCount, ia.firstIndex, ia.firstVertex, ia.firstInstance);
        };
        this._renderPassFuncQueue.push(_drawFunc2);
      } else {
        var _drawFunc3 = function _drawFunc3(passEncoder) {
          var instanceCount = Math.max(ia.instanceCount, 1);
          passEncoder == null ? void 0 : passEncoder.draw(ia.vertexCount, instanceCount, ia.firstVertex, ia.firstInstance);
        };
        this._renderPassFuncQueue.push(_drawFunc3);
      }
    }
    ++this._numDrawCalls;
    this._numInstances += inputAssembler.instanceCount;
    var indexCount = inputAssembler.indexCount || inputAssembler.vertexCount;
    if (this._curGPUPipelineState) {
      var gpuPrimitive = this._curGPUPipelineState.gpuPrimitive;
      switch (gpuPrimitive) {
        case 'triangle-strip':
          this._numTris += (indexCount - 2) * Math.max(inputAssembler.instanceCount, 1);
          break;
        case 'triangle-list':
          {
            this._numTris += indexCount / 3 * Math.max(inputAssembler.instanceCount, 1);
            break;
          }
      }
    }
  };
  _proto.updateBuffer = function updateBuffer(buffer, data, offset, size) {
    if (this._type === CommandBufferType.PRIMARY && this._isInRenderPass) {
      errorID(16329);
      return;
    }
    var gpuBuffer = buffer.gpuBuffer;
    if (!gpuBuffer) {
      return;
    }
    this._webGPUAllocator.updateBufferCmdPool.alloc(WebGPUCmdUpdateBuffer);
    var buff = null;
    if (buffer.usage & BufferUsageBit.INDIRECT) {
      buff = data;
    } else {
      if (size !== undefined) ; else {
        data.byteLength;
      }
      buff = data;
    }
    var device = WebGPUDeviceManager.instance;
    var nativeDevice = device.nativeDevice;
    nativeDevice == null ? void 0 : nativeDevice.queue.writeBuffer(gpuBuffer.gpuBuffer, gpuBuffer.gpuOffset, buff);
  };
  _proto.copyBuffersToTexture = function copyBuffersToTexture(buffers, texture, regions) {
    if (this._type === CommandBufferType.PRIMARY && this._isInRenderPass) {
      errorID(16330);
      return;
    }
    var gpuTexture = texture.gpuTexture;
    if (!gpuTexture) {
      return;
    }
    var cmd = this._webGPUAllocator.copyBufferToTextureCmdPool.alloc(WebGPUCmdCopyBufferToTexture);
    cmd.gpuTexture = gpuTexture;
    cmd.regions = regions;
    cmd.buffers = buffers;
    this.cmdPackage.copyBufferToTextureCmds.push(cmd);
    this.cmdPackage.cmds.push(WebGPUCmd.COPY_BUFFER_TO_TEXTURE);
  };
  _proto.execute = function execute(cmdBuffs, count) {
    for (var i = 0; i < count; ++i) {
      var WebGPUCmdBuff = cmdBuffs[i];
      var cmdPackage = WebGPUCmdBuff.cmdPackage;
      var rpLength = cmdPackage.beginRenderPassCmds.length;
      for (var c = 0; c < rpLength; ++c) {
        var cmd = cmdPackage.beginRenderPassCmds.array[c];
        ++cmd.refCount;
        this.cmdPackage.beginRenderPassCmds.push(cmd);
      }
      var bindStatesCmds = cmdPackage.bindStatesCmds;
      var stateCmdCount = bindStatesCmds.length;
      for (var _c = 0; _c < stateCmdCount; ++_c) {
        var _cmd = bindStatesCmds.array[_c];
        ++_cmd.refCount;
        this.cmdPackage.bindStatesCmds.push(_cmd);
      }
      var drawCmds = cmdPackage.drawCmds;
      var drawCmdCount = drawCmds.length;
      for (var _c2 = 0; _c2 < drawCmdCount; ++_c2) {
        var _cmd2 = drawCmds.array[_c2];
        ++_cmd2.refCount;
        this.cmdPackage.drawCmds.push(_cmd2);
      }
      var updateBufferCmdCount = cmdPackage.updateBufferCmds.length;
      for (var _c3 = 0; _c3 < updateBufferCmdCount; ++_c3) {
        var _cmd3 = cmdPackage.updateBufferCmds.array[_c3];
        ++_cmd3.refCount;
        this.cmdPackage.updateBufferCmds.push(_cmd3);
      }
      var copyBufferTexCmdCount = cmdPackage.copyBufferToTextureCmds.length;
      for (var _c4 = 0; _c4 < copyBufferTexCmdCount; ++_c4) {
        var _cmd4 = cmdPackage.copyBufferToTextureCmds.array[_c4];
        ++_cmd4.refCount;
        this.cmdPackage.copyBufferToTextureCmds.push(_cmd4);
      }
      this.cmdPackage.cmds.concat(cmdPackage.cmds.array);
      this._numDrawCalls += WebGPUCmdBuff._numDrawCalls;
      this._numInstances += WebGPUCmdBuff._numInstances;
      this._numTris += WebGPUCmdBuff._numTris;
    }
  };
  _proto.bindStates = function bindStates() {
    var _currPipelineState,
      _this$_curGPUPipeline,
      _this2 = this;
    if (!this._curGPUPipelineState) {
      return;
    }
    this._curGPUPipelineState.gpuPipelineLayout;
    var wgpuPipLayout = (_currPipelineState = currPipelineState) == null ? void 0 : _currPipelineState.pipelineLayout;
    var device = WebGPUDeviceManager.instance;
    for (var i = 0; i < groupSets.length; i++) {
      var currSetIdx = groupSets[i];
      var currDesc = descriptorSets[currSetIdx];
      if (currDesc && currDesc.gpuDescriptorSet) {
        currDesc.prepare();
      } else {
        var currLayout = wgpuPipLayout.setLayouts[currSetIdx];
        var currLayoutInfo = new DescriptorSetInfo(currLayout);
        var newDescSet = device.createDescriptorSet(currLayoutInfo);
        descriptorSets[currSetIdx] = newDescSet;
        newDescSet.prepare(true);
      }
    }
    var gpuIA = this._curGPUInputAssembler;
    gpuIA.samples = samples > 1 ? 4 : 1;
    this._curWebGPUPipelineState.prepare(gpuIA);
    var wgpuPipeline = this._curGPUPipelineState.nativePipeline;
    var pplFunc = function pplFunc(passEncoder) {
      passEncoder.setPipeline(wgpuPipeline);
    };
    this._renderPassFuncQueue.push(pplFunc);
    if ((_this$_curGPUPipeline = this._curGPUPipelineState.pipelineState) != null && _this$_curGPUPipeline.depthStencil) {
      var stencilRef = this._curGPUPipelineState.stencilRef;
      var stencilRefFunc = function stencilRefFunc(passEncoder) {
        passEncoder.setStencilReference(stencilRef);
      };
      this._renderPassFuncQueue.push(stencilRefFunc);
    }
    var currGPUDescSize = groupSets.length;
    var wgpuBindGroups = new Array(currGPUDescSize);
    var wgpuDynOffsets = new Array(currGPUDescSize);
    for (var _i = 0; _i < currGPUDescSize; _i++) {
      var _currSetIdx = groupSets[_i];
      var descObj = descriptorSets[_currSetIdx];
      var curGpuDesc = descObj.gpuDescriptorSet;
      wgpuBindGroups[_currSetIdx] = curGpuDesc.bindGroup;
      wgpuDynOffsets[_currSetIdx] = [].concat(this._curDynamicOffsets[_currSetIdx]);
      if (!descObj.dynamicOffsetCount) {
        wgpuDynOffsets[_currSetIdx] = [];
      } else if (descObj && descObj.dynamicOffsetCount !== wgpuDynOffsets[_currSetIdx].length) {
        wgpuDynOffsets[_currSetIdx].length = descObj.dynamicOffsetCount;
        for (var j = 0; j < descObj.dynamicOffsetCount; j++) {
          var currOffset = wgpuDynOffsets[_currSetIdx][j];
          if (!currOffset) {
            wgpuDynOffsets[_currSetIdx][j] = 0;
          } else {
            var currBind = descObj.dynamicOffsets[j];
            var bindObj = descObj.gpuDescriptorSet.gpuDescriptors[currBind];
            if (bindObj && bindObj.gpuBuffer && currOffset > bindObj.gpuBuffer.gpuBuffer.size) {
              wgpuDynOffsets[_currSetIdx][j] = 0;
            }
          }
        }
      }
    }
    var bgfunc = function bgfunc(passEncoder) {
      var gpuBindGroupSize = wgpuBindGroups.length;
      for (var _i2 = 0; _i2 < gpuBindGroupSize; _i2++) {
        var currBindGroup = wgpuBindGroups[_i2];
        if (!currBindGroup) {
          currBindGroup = device.defaultResource.descSet.gpuDescriptorSet.bindGroup;
        }
        passEncoder.setBindGroup(_i2, currBindGroup, wgpuDynOffsets[_i2]);
      }
    };
    this._renderPassFuncQueue.push(bgfunc);
    var ia = gpuIA;
    var wgpuVertexBuffers = new Array(ia.gpuVertexBuffers.length);
    var gpuVertBuffSize = ia.gpuVertexBuffers.length;
    for (var _i3 = 0; _i3 < gpuVertBuffSize; _i3++) {
      wgpuVertexBuffers[_i3] = {
        slot: _i3,
        buffer: ia.gpuVertexBuffers[_i3].gpuBuffer,
        offset: ia.gpuVertexBuffers[_i3].gpuOffset
      };
    }
    var vbFunc = function vbFunc(passEncoder) {
      var vertBuffSize = wgpuVertexBuffers.length;
      for (var _i4 = 0; _i4 < vertBuffSize; _i4++) {
        passEncoder.setVertexBuffer(wgpuVertexBuffers[_i4].slot, wgpuVertexBuffers[_i4].buffer, wgpuVertexBuffers[_i4].offset);
      }
    };
    this._renderPassFuncQueue.push(vbFunc);
    if (ia.gpuIndexBuffer) {
      var wgpuIndexBuffer = {
        indexType: ia.gpuIndexType,
        buffer: ia.gpuIndexBuffer.gpuBuffer,
        offset: ia.gpuIndexBuffer.gpuOffset,
        size: ia.gpuIndexBuffer.size
      };
      var ibFunc = function ibFunc(passEncoder) {
        passEncoder.setIndexBuffer(wgpuIndexBuffer.buffer, wgpuIndexBuffer.indexType, wgpuIndexBuffer.offset, wgpuIndexBuffer.size);
      };
      this._renderPassFuncQueue.push(ibFunc);
    }
    var bcFunc = function bcFunc(passEncoder) {
      passEncoder.setBlendConstant([_this2._curBlendConstants[0], _this2._curBlendConstants[1], _this2._curBlendConstants[2], _this2._curBlendConstants[3]]);
    };
    if (this._curBlendConstants.length) this._renderPassFuncQueue.push(bcFunc);
    this._isStateValid = false;
  };
  return WebGPUCommandBuffer;
}(CommandBuffer);

var WebGPUFramebuffer = function (_Framebuffer) {
  function WebGPUFramebuffer() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Framebuffer.call.apply(_Framebuffer, [this].concat(args)) || this;
    _this._gpuFramebuffer = null;
    return _this;
  }
  _inheritsLoose(WebGPUFramebuffer, _Framebuffer);
  var _proto = WebGPUFramebuffer.prototype;
  _proto.initialize = function initialize(info) {
    this._renderPass = info.renderPass;
    this._colorTextures = info.colorTextures || [];
    this._depthStencilTexture = info.depthStencilTexture || null;
    var gpuColorTextures = [];
    var isOffscreen = true;
    var colorTexSize = info.colorTextures.length;
    for (var i = 0; i < colorTexSize; i++) {
      var colorTexture = info.colorTextures[i];
      if (colorTexture) {
        var gpuTex = colorTexture.gpuTexture;
        gpuColorTextures.push(gpuTex);
        if (gpuTex.isSwapchainTexture) {
          isOffscreen = false;
        }
      }
    }
    var gpuDepthStencilTexture = null;
    if (info.depthStencilTexture) {
      gpuDepthStencilTexture = info.depthStencilTexture.gpuTexture;
    }
    var width = Number.MAX_SAFE_INTEGER;
    var height = Number.MAX_SAFE_INTEGER;
    this._gpuFramebuffer = {
      gpuRenderPass: info.renderPass.gpuRenderPass,
      gpuColorTextures: gpuColorTextures,
      gpuDepthStencilTexture: gpuDepthStencilTexture,
      gpuFramebuffer: null,
      isOffscreen: isOffscreen,
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
      }
    };
    this._width = this._gpuFramebuffer.width;
    this._height = this._gpuFramebuffer.height;
  };
  _proto.destroy = function destroy() {
    if (this._gpuFramebuffer) {
      this._gpuFramebuffer = null;
    }
  };
  return _createClass(WebGPUFramebuffer, [{
    key: "gpuFramebuffer",
    get: function get() {
      return this._gpuFramebuffer;
    }
  }]);
}(Framebuffer);

var WebGPUInputAssembler = function (_InputAssembler) {
  function WebGPUInputAssembler() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _InputAssembler.call.apply(_InputAssembler, [this].concat(args)) || this;
    _this._gpuInputAssembler = null;
    return _this;
  }
  _inheritsLoose(WebGPUInputAssembler, _InputAssembler);
  var _proto = WebGPUInputAssembler.prototype;
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
      this.drawInfo.indexCount = this._indexBuffer.size / this._indexBuffer.stride;
      this.drawInfo.firstIndex = 0;
    } else {
      var vertBuff = this._vertexBuffers[0];
      this.drawInfo.vertexCount = vertBuff.size / vertBuff.stride;
      this.drawInfo.firstVertex = 0;
      this.drawInfo.vertexOffset = 0;
    }
    this._drawInfo.instanceCount = 0;
    this._drawInfo.firstInstance = 0;
    this._indirectBuffer = info.indirectBuffer || null;
    var vertBuffSize = info.vertexBuffers.length;
    var gpuVertexBuffers = new Array(vertBuffSize);
    for (var i = 0; i < vertBuffSize; ++i) {
      var vb = info.vertexBuffers[i];
      if (vb.gpuBuffer) {
        gpuVertexBuffers[i] = vb.gpuBuffer;
      }
    }
    var gpuIndexBuffer = null;
    var gpuIndexType = 'uint16';
    if (info.indexBuffer) {
      gpuIndexBuffer = info.indexBuffer.gpuBuffer;
      if (gpuIndexBuffer) {
        switch (gpuIndexBuffer.stride) {
          case 2:
            gpuIndexType = 'uint16';
            break;
          case 4:
            gpuIndexType = 'uint32';
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
      samples: 1,
      gpuAttribs: [],
      gpuIndexType: gpuIndexType
    };
    WebGPUCmdFuncCreateInputAssember(WebGPUDeviceManager.instance, this._gpuInputAssembler);
  };
  _proto.destroy = function destroy() {
    var WebGPUDev = WebGPUDeviceManager.instance;
    if (this._gpuInputAssembler) {
      WebGPUCmdFuncDestroyInputAssembler(WebGPUDev, this._gpuInputAssembler);
    }
    this._gpuInputAssembler = null;
  };
  return _createClass(WebGPUInputAssembler, [{
    key: "gpuInputAssembler",
    get: function get() {
      return this._gpuInputAssembler;
    }
  }]);
}(InputAssembler);

var WebGPUDescriptorSetLayout = function (_DescriptorSetLayout) {
  function WebGPUDescriptorSetLayout() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _DescriptorSetLayout.call.apply(_DescriptorSetLayout, [this].concat(args)) || this;
    _this._gpuDescriptorSetLayout = null;
    _this._bindGrpLayoutEntries = new Map();
    _this._hasChange = false;
    _this._currBinds = [];
    _this._prepareEntries = [];
    _this.buffers = new Map();
    _this.textures = new Map();
    _this.samplers = new Map();
    _this.references = [];
    return _this;
  }
  _inheritsLoose(WebGPUDescriptorSetLayout, _DescriptorSetLayout);
  var _proto = WebGPUDescriptorSetLayout.prototype;
  _proto.resetChanged = function resetChanged() {
    this._hasChange = false;
  };
  _proto.initialize = function initialize(info) {
    Array.prototype.push.apply(this._bindings, info.bindings);
    var gfxDevice = WebGPUDeviceManager.instance;
    if (!this._bindings.length) {
      this._bindings.push(gfxDevice.defaultResource.setLayout.bindings[0]);
    }
    var descriptorCount = 0;
    var maxBinding = -1;
    var flattenedIndices = [];
    var bindingSize = this._bindings.length;
    for (var i = 0; i < bindingSize; i++) {
      var binding = this._bindings[i];
      flattenedIndices.push(descriptorCount);
      descriptorCount += binding.count;
      if (binding.binding > maxBinding) maxBinding = binding.binding;
    }
    this._bindingIndices = Array(maxBinding + 1).fill(-1);
    var descriptorIndices = this._descriptorIndices = Array(maxBinding + 1).fill(-1);
    for (var _i = 0; _i < bindingSize; _i++) {
      var _binding = this._bindings[_i];
      this._bindingIndices[_binding.binding] = _i;
      descriptorIndices[_binding.binding] = flattenedIndices[_i];
    }
    var dynamicBindings = [];
    for (var _i2 = 0; _i2 < bindingSize; _i2++) {
      var _binding2 = this._bindings[_i2];
      if (_binding2.descriptorType & DESCRIPTOR_DYNAMIC_TYPE) {
        for (var j = 0; j < _binding2.count; j++) {
          dynamicBindings.push(_binding2.binding);
        }
      }
    }
    var bindGrpLayoutEntries = [];
    this._bindings.forEach(function (binding) {
      bindGrpLayoutEntries.push.apply(bindGrpLayoutEntries, createBindGroupLayoutEntry(binding));
    });
    var device = gfxDevice.nativeDevice;
    var groupLayout = device.createBindGroupLayout({
      entries: bindGrpLayoutEntries
    });
    this._gpuDescriptorSetLayout = {
      bindings: this._bindings,
      dynamicBindings: dynamicBindings,
      descriptorIndices: descriptorIndices,
      descriptorCount: descriptorCount,
      entries: bindGrpLayoutEntries,
      bindGroupLayout: groupLayout
    };
  };
  _proto.clear = function clear() {
    this.buffers.clear();
    this.textures.clear();
    this.samplers.clear();
    this._bindGrpLayoutEntries.clear();
  };
  _proto.destroy = function destroy() {
    this._bindings.length = 0;
    this.clear();
    this._gpuDescriptorSetLayout = null;
  };
  return _createClass(WebGPUDescriptorSetLayout, [{
    key: "gpuDescriptorSetLayout",
    get: function get() {
      return this._gpuDescriptorSetLayout;
    }
  }, {
    key: "currBinds",
    get: function get() {
      return this._currBinds;
    }
  }, {
    key: "prepareEntries",
    get: function get() {
      return this._prepareEntries;
    }
  }, {
    key: "bindGrpLayoutEntries",
    get: function get() {
      return this._bindGrpLayoutEntries;
    }
  }, {
    key: "hasChanged",
    get: function get() {
      return this._hasChange;
    }
  }]);
}(DescriptorSetLayout);

var WebGPUPipelineLayout = function (_PipelineLayout) {
  function WebGPUPipelineLayout() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PipelineLayout.call.apply(_PipelineLayout, [this].concat(args)) || this;
    _this._gpuPipelineLayout = null;
    _this._nativePipelineLayout = void 0;
    _this._bindGrpLayouts = [];
    return _this;
  }
  _inheritsLoose(WebGPUPipelineLayout, _PipelineLayout);
  var _proto = WebGPUPipelineLayout.prototype;
  _proto.fetchPipelineLayout = function fetchPipelineLayout(resetAll) {
    if (resetAll === void 0) {
      resetAll = true;
    }
    var gpuPipelineLayout = this._gpuPipelineLayout;
    if (resetAll) {
      gpuPipelineLayout.gpuSetLayouts.length = 0;
      gpuPipelineLayout.dynamicOffsetIndices.length = 0;
    }
    var webGPUDevice = WebGPUDeviceManager.instance;
    var nativeDevice = webGPUDevice.nativeDevice;
    this._bindGrpLayouts.length = 0;
    var setLayoutSize = this._setLayouts.length;
    for (var i = 0; i < setLayoutSize; i++) {
      var setLayout = this._setLayouts[i];
      var bindGroupLayout = setLayout.gpuDescriptorSetLayout.bindGroupLayout;
      if (bindGroupLayout) {
        if (resetAll) {
          var dynamicBindings = setLayout.gpuDescriptorSetLayout.dynamicBindings;
          var indices = Array(setLayout.bindingIndices.length).fill(-1);
          var dynBindSize = dynamicBindings.length;
          for (var j = 0; j < dynBindSize; j++) {
            var binding = dynamicBindings[j];
            if (indices[binding] < 0) indices[binding] = gpuPipelineLayout.dynamicOffsetCount + j;
          }
          gpuPipelineLayout.gpuSetLayouts.push(setLayout.gpuDescriptorSetLayout);
          gpuPipelineLayout.dynamicOffsetIndices.push(indices);
          gpuPipelineLayout.dynamicOffsetCount += dynBindSize;
        }
        this._bindGrpLayouts[i] = bindGroupLayout;
      }
    }
    this._nativePipelineLayout = nativeDevice == null ? void 0 : nativeDevice.createPipelineLayout({
      bindGroupLayouts: this._bindGrpLayouts
    });
    return this._nativePipelineLayout;
  };
  _proto.initialize = function initialize(info) {
    Array.prototype.push.apply(this._setLayouts, info.setLayouts);
    var dynamicOffsetIndices = [];
    var gpuSetLayouts = [];
    var dynamicOffsetCount = 0;
    var that = this;
    this._gpuPipelineLayout = {
      setLayouts: this._setLayouts,
      gpuSetLayouts: gpuSetLayouts,
      dynamicOffsetIndices: dynamicOffsetIndices,
      dynamicOffsetCount: dynamicOffsetCount,
      gpuBindGroupLayouts: this._bindGrpLayouts,
      get nativePipelineLayout() {
        return that._nativePipelineLayout;
      }
    };
    this.fetchPipelineLayout();
    return true;
  };
  _proto.changeSetLayout = function changeSetLayout(idx, setLayout) {
    this._setLayouts[idx] = setLayout;
  };
  _proto.destroy = function destroy() {
    this._setLayouts.length = 0;
  };
  return _createClass(WebGPUPipelineLayout, [{
    key: "gpuPipelineLayout",
    get: function get() {
      return this._gpuPipelineLayout;
    }
  }]);
}(PipelineLayout);

var WebPUPrimitives = ['point-list', 'line-list', 'line-strip', 'line-strip', 'line-list', 'line-strip', 'line-list', 'triangle-list', 'triangle-strip', 'triangle-strip', 'triangle-list', 'triangle-strip', 'triangle-strip', 'triangle-strip'];
var WebGPUPipelineState = function (_PipelineState) {
  function WebGPUPipelineState() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PipelineState.call.apply(_PipelineState, [this].concat(args)) || this;
    _this._gpuPipelineState = null;
    _this._locations = new Map();
    return _this;
  }
  _inheritsLoose(WebGPUPipelineState, _PipelineState);
  var _proto = WebGPUPipelineState.prototype;
  _proto.initialize = function initialize(info) {
    var _this$_renderPass$dep;
    this._primitive = info.primitive;
    this._shader = info.shader;
    this._pipelineLayout = info.pipelineLayout;
    this._rs = info.rasterizerState;
    this._dss = info.depthStencilState;
    this._bs = info.blendState;
    this._is = info.inputState;
    this._renderPass = info.renderPass;
    this._dynamicStates = info.dynamicStates;
    var dynamicStates = [];
    for (var i = 0; i < 31; i++) {
      if (this._dynamicStates & 1 << i) {
        dynamicStates.push(1 << i);
      }
    }
    var colorAttachments = this._renderPass.colorAttachments;
    var colorDescs = [];
    var colAttachmentSize = colorAttachments.length;
    var pipelineLayoutObj = info.pipelineLayout;
    for (var _i = 0; _i < colAttachmentSize; _i++) {
      var colDesc = {
        format: GFXFormatToWGPUFormat(colorAttachments[_i].format),
        writeMask: WebGPUBlendMask(this._bs.targets[_i].blendColorMask)
      };
      if (this._bs.targets[_i].blend) {
        colDesc.blend = {
          color: {
            dstFactor: WebGPUBlendFactors[this._bs.targets[_i].blendDst],
            operation: WebGPUBlendOps[this._bs.targets[_i].blendEq === BlendOp.MAX ? BlendOp.ADD : this._bs.targets[_i].blendEq],
            srcFactor: WebGPUBlendFactors[this._bs.targets[_i].blendSrc]
          },
          alpha: {
            dstFactor: WebGPUBlendFactors[this._bs.targets[_i].blendDstAlpha],
            operation: WebGPUBlendOps[this._bs.targets[_i].blendAlphaEq === BlendOp.MAX ? BlendOp.ADD : this._bs.targets[_i].blendAlphaEq],
            srcFactor: WebGPUBlendFactors[this._bs.targets[_i].blendSrcAlpha]
          }
        };
      }
      colorDescs.push(colDesc);
    }
    var vertexStage;
    var fragmentStage;
    var shaderStages = this._shader.gpuShader.gpuStages;
    var stageSize = shaderStages.length;
    for (var _i2 = 0; _i2 < stageSize; _i2++) {
      if (shaderStages[_i2].type === ShaderStageFlagBit.VERTEX) {
        vertexStage = shaderStages[_i2].gpuShader;
      }
      if (shaderStages[_i2].type === ShaderStageFlagBit.FRAGMENT) {
        fragmentStage = shaderStages[_i2].gpuShader;
      }
    }
    var gpuShader = info.shader;
    var shaderAttrs = gpuShader.attributes;
    var attrsSize = shaderAttrs.length;
    for (var _i3 = 0; _i3 < attrsSize; _i3++) {
      this._locations.set(shaderAttrs[_i3].name, shaderAttrs[_i3].location);
    }
    var stripTopology = info.primitive === PrimitiveMode.LINE_STRIP || info.primitive === PrimitiveMode.TRIANGLE_STRIP;
    var renderPplDesc = {
      layout: pipelineLayoutObj.gpuPipelineLayout.nativePipelineLayout,
      vertex: {
        module: vertexStage.module,
        entryPoint: 'main',
        buffers: []
      },
      primitive: {
        topology: WebPUPrimitives[info.primitive],
        frontFace: this._rs.isFrontFaceCCW ? 'ccw' : 'cw',
        cullMode: this._rs.cullMode === CullMode.NONE ? 'none' : this._rs.cullMode === CullMode.FRONT ? 'front' : 'back'
      },
      fragment: {
        module: fragmentStage.module,
        entryPoint: 'main',
        targets: colorDescs
      }
    };
    if (stripTopology) renderPplDesc.primitive.stripIndexFormat = 'uint16';
    var stencilRef = 0;
    if (((_this$_renderPass$dep = this._renderPass.depthStencilAttachment) == null ? void 0 : _this$_renderPass$dep.format) !== Format.UNKNOWN) {
      var dssDesc = {};
      dssDesc.format = GFXFormatToWGPUFormat(this._renderPass.depthStencilAttachment.format);
      dssDesc.depthWriteEnabled = this._dss.depthWrite;
      dssDesc.depthCompare = this._dss.depthTest ? WebGPUCompereFunc[this._dss.depthFunc] : 'always';
      var stencilReadMask = 0;
      var stencilWriteMask = 0;
      if (this._dss.stencilTestFront) {
        dssDesc.stencilFront = {
          compare: WebGPUCompereFunc[this._dss.stencilFuncFront],
          depthFailOp: WebGPUStencilOp[this._dss.stencilZFailOpFront],
          passOp: WebGPUStencilOp[this._dss.stencilPassOpFront],
          failOp: WebGPUStencilOp[this._dss.stencilFailOpFront]
        };
        stencilReadMask |= this._dss.stencilReadMaskFront;
        stencilWriteMask |= this._dss.stencilWriteMaskFront;
        stencilRef |= this._dss.stencilRefFront;
      }
      if (this._dss.stencilTestBack) {
        dssDesc.stencilBack = {
          compare: WebGPUCompereFunc[this._dss.stencilFuncBack],
          depthFailOp: WebGPUStencilOp[this._dss.stencilZFailOpBack],
          passOp: WebGPUStencilOp[this._dss.stencilPassOpBack],
          failOp: WebGPUStencilOp[this._dss.stencilFailOpBack]
        };
        stencilReadMask |= this._dss.stencilReadMaskBack;
        stencilWriteMask |= this._dss.stencilWriteMaskBack;
        stencilRef |= this._dss.stencilRefBack;
      }
      dssDesc.stencilReadMask = stencilReadMask;
      dssDesc.stencilWriteMask = stencilWriteMask;
      dssDesc.depthBias = this._rs.depthBias;
      dssDesc.depthBiasSlopeScale = this._rs.depthBiasSlop;
      dssDesc.depthBiasClamp = this._rs.depthBiasClamp;
      renderPplDesc.depthStencil = dssDesc;
    }
    this._gpuPipelineState = {
      gpuPrimitive: WebPUPrimitives[info.primitive],
      gpuShader: gpuShader.gpuShader,
      gpuPipelineLayout: pipelineLayoutObj.gpuPipelineLayout,
      rs: info.rasterizerState,
      dss: info.depthStencilState,
      stencilRef: stencilRef,
      bs: info.blendState,
      gpuRenderPass: info.renderPass.gpuRenderPass,
      dynamicStates: dynamicStates,
      pipelineState: renderPplDesc,
      nativePipeline: undefined
    };
  };
  _proto._getShaderLocation = function _getShaderLocation(name) {
    return this._locations.get(name);
  };
  _proto.updatePipelineLayout = function updatePipelineLayout() {
    if (this._gpuPipelineState && this._gpuPipelineState.pipelineState) {
      this._gpuPipelineState.pipelineState.layout = this._pipelineLayout.gpuPipelineLayout.nativePipelineLayout;
    }
  };
  _proto.prepare = function prepare(ia, forceUpdate) {
    if (forceUpdate === void 0) {
      forceUpdate = false;
    }
    if (this._gpuPipelineState.nativePipeline && !forceUpdate) {
      return;
    }
    var gpuShader = this.shader;
    var shaderAttrs = gpuShader.attributes;
    var pipelineState = this._gpuPipelineState.pipelineState;
    var vertexAttrs = [];
    var emptyPushAttr = [];
    var streamCount = ia.gpuVertexBuffers.length;
    for (var i = 0; i < streamCount; i++) {
      var currBufferLayout = {
        arrayStride: 0,
        attributes: []
      };
      var currAttrs = [];
      var shaderAttrSize = shaderAttrs.length;
      for (var j = 0; j < shaderAttrSize; j++) {
        var shaderAttr = shaderAttrs[j];
        var hasAttr = false;
        var gpuAttrSize = ia.gpuAttribs.length;
        for (var k = 0; k < gpuAttrSize; k++) {
          var gpuAttr = ia.gpuAttribs[k];
          var attr = ia.attributes[k];
          if (attr.name === shaderAttr.name) {
            hasAttr = true;
            var loc = shaderAttr.location;
            if (attr.stream === i) {
              currBufferLayout.arrayStride = gpuAttr.stride;
              currBufferLayout.stepMode = attr.isInstanced ? 'instance' : 'vertex';
              var attrLayout = {
                format: GFXFormatToWGPUVertexFormat(attr.format),
                offset: gpuAttr.offset,
                shaderLocation: loc
              };
              currAttrs.push(attrLayout);
            }
            break;
          }
        }
        var format = shaderAttr.format;
        if (!hasAttr && !emptyPushAttr.includes(shaderAttr.name) && FormatInfos[format].size <= ia.gpuVertexBuffers[i].stride) {
          emptyPushAttr.push(shaderAttr.name);
          var _attrLayout = {
            format: GFXFormatToWGPUVertexFormat(format),
            offset: 0,
            shaderLocation: shaderAttr.location
          };
          currAttrs.push(_attrLayout);
        }
      }
      if (currAttrs.length) {
        currBufferLayout.attributes = currAttrs;
        vertexAttrs.push(currBufferLayout);
      }
    }
    pipelineState.vertex.buffers = vertexAttrs;
    pipelineState.multisample = {
      count: ia.samples
    };
    var webgpuDevice = WebGPUDeviceManager.instance;
    var nativeDevice = webgpuDevice.nativeDevice;
    var nativePipeline = nativeDevice == null ? void 0 : nativeDevice.createRenderPipeline(pipelineState);
    this._gpuPipelineState.nativePipeline = nativePipeline;
  };
  _proto.destroy = function destroy() {
    this._gpuPipelineState = null;
  };
  return _createClass(WebGPUPipelineState, [{
    key: "gpuPipelineState",
    get: function get() {
      return this._gpuPipelineState;
    }
  }]);
}(PipelineState);

var WebGPUQueue = function (_Queue) {
  function WebGPUQueue() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Queue.call.apply(_Queue, [this].concat(args)) || this;
    _this.numDrawCalls = 0;
    _this.numInstances = 0;
    _this.numTris = 0;
    _this._nativeQueue = null;
    _this._isAsync = false;
    return _this;
  }
  _inheritsLoose(WebGPUQueue, _Queue);
  var _proto = WebGPUQueue.prototype;
  _proto.initialize = function initialize(info) {
    this._type = info.type;
    return true;
  };
  _proto.destroy = function destroy() {};
  _proto.submit = function submit(cmdBuffs) {
    if (!this._isAsync) {
      var cmdBuffSize = cmdBuffs.length;
      for (var i = 0; i < cmdBuffSize; i++) {
        var cmdBuff = cmdBuffs[i];
        this.numDrawCalls += cmdBuff.numDrawCalls;
        this.numInstances += cmdBuff.numInstances;
        this.numTris += cmdBuff.numTris;
      }
    }
  };
  _proto.clear = function clear() {
    this.numDrawCalls = 0;
    this.numInstances = 0;
    this.numTris = 0;
  };
  return WebGPUQueue;
}(Queue);

var WebGPURenderPass = function (_RenderPass) {
  function WebGPURenderPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _RenderPass.call.apply(_RenderPass, [this].concat(args)) || this;
    _this._gpuRenderPass = null;
    return _this;
  }
  _inheritsLoose(WebGPURenderPass, _RenderPass);
  var _proto = WebGPURenderPass.prototype;
  _proto._generateColorAttachment = function _generateColorAttachment(colorAttachment) {
    return {
      view: {},
      loadOp: colorAttachment.loadOp === LoadOp.LOAD ? 'load' : 'clear',
      storeOp: colorAttachment.storeOp === StoreOp.STORE ? 'store' : 'discard'
    };
  };
  _proto._generateDSAttachment = function _generateDSAttachment(dsAttachment) {
    var depthStencilDescriptor = {};
    depthStencilDescriptor.depthClearValue = 1.0;
    depthStencilDescriptor.depthLoadOp = dsAttachment.depthLoadOp === LoadOp.CLEAR ? 'clear' : 'load';
    depthStencilDescriptor.depthStoreOp = dsAttachment.depthStoreOp === StoreOp.STORE ? 'store' : 'discard';
    depthStencilDescriptor.stencilClearValue = 0.0;
    depthStencilDescriptor.stencilLoadOp = dsAttachment.stencilLoadOp === LoadOp.CLEAR ? 'clear' : 'load';
    depthStencilDescriptor.stencilStoreOp = dsAttachment.stencilStoreOp === StoreOp.STORE ? 'store' : 'discard';
    depthStencilDescriptor.view = {};
    return depthStencilDescriptor;
  };
  _proto.initialize = function initialize(info) {
    this._colorInfos = info.colorAttachments;
    this._depthStencilInfo = info.depthStencilAttachment;
    this._subpasses = info.subpasses;
    var colorDescriptions = [];
    var originalColorDesc = [];
    for (var _iterator = _createForOfIteratorHelperLoose(info.colorAttachments), _step; !(_step = _iterator()).done;) {
      var attachment = _step.value;
      originalColorDesc[colorDescriptions.length] = this._generateColorAttachment(attachment);
      colorDescriptions[colorDescriptions.length] = this._generateColorAttachment(attachment);
    }
    var renderPassDesc = {
      colorAttachments: colorDescriptions
    };
    var originalRPDesc = {
      colorAttachments: originalColorDesc
    };
    if (info.depthStencilAttachment.format !== Format.UNKNOWN) {
      var depthStencilDescriptor = this._generateDSAttachment(info.depthStencilAttachment);
      var originalDepthStencilDesc = this._generateDSAttachment(info.depthStencilAttachment);
      renderPassDesc.depthStencilAttachment = depthStencilDescriptor;
      originalRPDesc.depthStencilAttachment = originalDepthStencilDesc;
    }
    this._gpuRenderPass = {
      colorAttachments: this._colorInfos,
      depthStencilAttachment: this._depthStencilInfo,
      nativeRenderPass: renderPassDesc,
      originalRP: originalRPDesc
    };
  };
  _proto.destroy = function destroy() {
    this._gpuRenderPass = null;
  };
  return _createClass(WebGPURenderPass, [{
    key: "gpuRenderPass",
    get: function get() {
      return this._gpuRenderPass;
    }
  }]);
}(RenderPass);

var samplerCaches = new Map();
var WebGPUSampler = function (_Sampler) {
  function WebGPUSampler(info, hash) {
    var _this;
    _this = _Sampler.call(this, info, hash) || this;
    _this._gpuSampler = null;
    _this._hasChange = false;
    _this._gpuSampler = {
      gpuSampler: null,
      compare: info.cmpFunc,
      minFilter: info.minFilter,
      magFilter: info.magFilter,
      mipFilter: info.mipFilter,
      addressU: info.addressU,
      addressV: info.addressV,
      addressW: info.addressW,
      maxAnisotropy: info.maxAnisotropy,
      mipLevel: 1,
      gpuMinFilter: 'linear',
      gpuMagFilter: 'linear',
      gpuMipFilter: 'linear',
      gpuWrapS: 'clamp-to-edge',
      gpuWrapT: 'clamp-to-edge',
      gpuWrapR: 'clamp-to-edge'
    };
    return _this;
  }
  _inheritsLoose(WebGPUSampler, _Sampler);
  var _proto = WebGPUSampler.prototype;
  _proto.resetChange = function resetChange() {
    this._hasChange = false;
  };
  _proto._computeSamplerKey = function _computeSamplerKey(info) {
    var hash = info.minFilter;
    hash |= info.magFilter << 2;
    hash |= info.mipFilter << 4;
    hash |= info.addressU << 6;
    hash |= info.addressV << 8;
    hash |= info.addressW << 10;
    hash |= info.maxAnisotropy << 12;
    hash |= info.compare << 16;
    hash |= info.mipLevel << 18;
    return hash;
  };
  _proto.createGPUSampler = function createGPUSampler(mipLevel) {
    if (mipLevel === void 0) {
      mipLevel = 1;
    }
    if (!this._gpuSampler) {
      return null;
    }
    this._gpuSampler.mipLevel = mipLevel;
    var currKey = this._computeSamplerKey(this._gpuSampler);
    var currGPUSampler = samplerCaches.get(currKey);
    if (currGPUSampler) return currGPUSampler;
    var device = WebGPUDeviceManager.instance;
    this._hasChange = true;
    WebGPUCmdFuncCreateSampler(device, this._gpuSampler);
    currGPUSampler = this._gpuSampler.gpuSampler;
    samplerCaches.set(currKey, currGPUSampler);
    return currGPUSampler;
  };
  _proto.destroy = function destroy() {
    if (!this._gpuSampler) {
      return;
    }
    this._hasChange = true;
    var device = WebGPUDeviceManager.instance;
    WebGPUCmdFuncDestroySampler(device, this._gpuSampler);
    this._gpuSampler = null;
  };
  return _createClass(WebGPUSampler, [{
    key: "gpuSampler",
    get: function get() {
      return this._gpuSampler;
    }
  }, {
    key: "samplerInfo",
    get: function get() {
      return this._info;
    }
  }, {
    key: "hasChange",
    get: function get() {
      return this._hasChange;
    }
  }]);
}(Sampler);

var WebGPUShader = function (_Shader) {
  function WebGPUShader() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Shader.call.apply(_Shader, [this].concat(args)) || this;
    _this._gpuShader = null;
    return _this;
  }
  _inheritsLoose(WebGPUShader, _Shader);
  var _proto = WebGPUShader.prototype;
  _proto.initialize = function initialize(info) {
    this._name = info.name;
    this._stages = info.stages;
    this._attributes = info.attributes;
    this._blocks = info.blocks;
    this._samplers = info.samplers;
    var stageSize = info.stages.length;
    this._gpuShader = {
      name: info.name,
      blocks: info.blocks.slice(),
      samplers: info.samplers,
      gpuStages: new Array(stageSize),
      gpuProgram: null,
      gpuInputs: [],
      gpuUniforms: [],
      gpuBlocks: [],
      gpuSamplers: [],
      bindings: new Map()
    };
    for (var i = 0; i < stageSize; ++i) {
      var stage = info.stages[i];
      this._gpuShader.gpuStages[i] = {
        type: stage.stage,
        source: stage.source,
        gpuShader: null,
        bindings: [],
        attrs: new Map()
      };
    }
    var device = WebGPUDeviceManager.instance;
    WebGPUCmdFuncCreateGPUShader(device, this._gpuShader);
  };
  _proto.destroy = function destroy() {
    if (!this._gpuShader) {
      return;
    }
    var device = WebGPUDeviceManager.instance;
    WebGPUCmdFuncDestroyShader(device, this._gpuShader);
    this._gpuShader = null;
  };
  return _createClass(WebGPUShader, [{
    key: "gpuShader",
    get: function get() {
      return this._gpuShader;
    }
  }]);
}(Shader);

var WebGPUStateCache = function () {
  function WebGPUStateCache() {
    this.gpuArrayBuffer = null;
    this.gpuElementArrayBuffer = null;
    this.gpuUniformBuffer = null;
    this.gpuBindUBOs = [];
    this.gpuBindUBOOffsets = [];
    this.texUnit = 0;
    this.gpuTexUnits = [];
    this.gpuSamplerUnits = [];
    this.gpuFramebuffer = null;
    this.gpuReadFramebuffer = null;
    this.gpuInputAssembler = null;
    this.viewport = new Viewport();
    this.scissorRect = new Rect(0, 0, 0, 0);
    this.rs = new RasterizerState();
    this.dss = new DepthStencilState();
    this.bs = new BlendState();
    this.gpuEnabledAttribLocs = [];
    this.gpuCurrentAttribLocs = [];
    this.texUnitCacheMap = {};
  }
  var _proto = WebGPUStateCache.prototype;
  _proto.initialize = function initialize(texUnit, bufferBindings, vertexAttributes) {
    for (var i = 0; i < texUnit; ++i) this.gpuTexUnits.push({
      gpuTexture: null
    });
    this.gpuSamplerUnits.length = texUnit;
    this.gpuSamplerUnits.fill(null);
    this.gpuBindUBOs.length = bufferBindings;
    this.gpuBindUBOs.fill(null);
    this.gpuBindUBOOffsets.length = bufferBindings;
    this.gpuBindUBOOffsets.fill(0);
    this.gpuEnabledAttribLocs.length = vertexAttributes;
    this.gpuEnabledAttribLocs.fill(false);
    this.gpuCurrentAttribLocs.length = vertexAttributes;
    this.gpuCurrentAttribLocs.fill(false);
  };
  return WebGPUStateCache;
}();

var WebGPUTexture = function (_Texture) {
  function WebGPUTexture() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Texture.call.apply(_Texture, [this].concat(args)) || this;
    _this._gpuTexture = null;
    _this._texDescriptor = null;
    _this._lodLevel = 0;
    _this._hasChange = false;
    return _this;
  }
  _inheritsLoose(WebGPUTexture, _Texture);
  var _proto = WebGPUTexture.prototype;
  _proto.getTextureHandle = function getTextureHandle() {
    var gpuTexture = this._gpuTexture;
    if (!gpuTexture) {
      return 0;
    }
    if (gpuTexture.gpuTexture) {
      return gpuTexture.gpuTexture;
    }
    return 0;
  };
  _proto.initAsSwapchainTexture = function initAsSwapchainTexture(info) {
    var texInfo = new TextureInfo();
    texInfo.format = info.format;
    texInfo.usage = FormatInfos[info.format].hasDepth ? TextureUsageBit.DEPTH_STENCIL_ATTACHMENT : TextureUsageBit.COLOR_ATTACHMENT;
    texInfo.width = info.width;
    texInfo.height = info.height;
    this.initialize(texInfo, true);
  };
  _proto.resetChange = function resetChange() {
    this._hasChange = false;
  };
  _proto.initialize = function initialize(info, isSwapchainTexture) {
    var texInfo = info;
    var viewInfo = info;
    if ('texture' in info) {
      texInfo = viewInfo.texture.info;
      this._isTextureView = true;
    }
    this._info.copy(texInfo);
    this._isPowerOf2 = IsPowerOf2(this._info.width) && IsPowerOf2(this._info.height);
    this._size = FormatSurfaceSize(this._info.format, this.width, this.height, this.depth, this._info.levelCount) * this._info.layerCount;
    if (!this._isTextureView) {
      this._gpuTexture = {
        type: texInfo.type,
        format: texInfo.format,
        usage: texInfo.usage,
        width: texInfo.width,
        height: texInfo.height,
        depth: texInfo.depth,
        size: this._size,
        arrayLayer: texInfo.layerCount,
        mipLevel: texInfo.levelCount,
        samples: texInfo.samples,
        flags: texInfo.flags,
        isPowerOf2: this._isPowerOf2,
        resolveTex: null,
        gpuTarget: '2d',
        gpuInternalFmt: 'rgba8unorm',
        gpuFormat: 'rgba8unorm',
        gpuType: 0,
        gpuUsage: GPUTextureUsage.RENDER_ATTACHMENT,
        gpuTexture: undefined,
        gpuRenderbuffer: null,
        gpuWrapS: 'clamp-to-edge',
        gpuWrapT: 'clamp-to-edge',
        gpuMinFilter: 'linear',
        gpuMagFilter: 'linear',
        getTextureView: this.getNativeTextureView.bind(this),
        isSwapchainTexture: isSwapchainTexture || false
      };
      if (!isSwapchainTexture) {
        var device = WebGPUDeviceManager.instance;
        WebGPUCmdFuncCreateTexture(device, this._gpuTexture);
        device.memoryStatus.textureSize += this._size;
      } else {
        this._gpuTexture.gpuInternalFmt = GFXFormatToWGPUFormat(this._gpuTexture.format);
        this._gpuTexture.gpuFormat = this._gpuTexture.gpuInternalFmt;
      }
      this._viewInfo.texture = this;
      this._viewInfo.type = info.type;
      this._viewInfo.format = info.format;
      this._viewInfo.baseLevel = 0;
      this._viewInfo.levelCount = info.levelCount;
      this._viewInfo.baseLayer = 0;
      this._viewInfo.layerCount = info.layerCount;
    } else {
      this._viewInfo.copy(viewInfo);
      this._lodLevel = viewInfo.baseLevel;
      this._gpuTexture = viewInfo.texture._gpuTexture;
    }
  };
  _proto.getNativeTextureView = function getNativeTextureView() {
    if (!this._gpuTexture || !this._gpuTexture.gpuTexture) {
      return null;
    }
    return this._gpuTexture.gpuTexture.createView({
      format: this.gpuTexture.gpuFormat,
      dimension: this._gpuTexture.gpuTarget,
      mipLevelCount: this._gpuTexture.mipLevel,
      arrayLayerCount: this.viewInfo.layerCount,
      baseMipLevel: 0,
      baseArrayLayer: 0
    });
  };
  _proto.destroy = function destroy() {
    this._hasChange = true;
    if (this._isTextureView || !this._isTextureView && !this._gpuTexture) {
      this._gpuTexture = null;
      return;
    }
    WebGPUCmdFuncDestroyTexture(this._gpuTexture);
    var device = WebGPUDeviceManager.instance;
    device.memoryStatus.textureSize -= this._size;
    this._gpuTexture = null;
  };
  _proto.resize = function resize(width, height) {
    if (this._info.width === width && this._info.height === height) {
      return;
    }
    if (this._info.levelCount === WebGPUTexture.getLevelCount(this._info.width, this._info.height)) {
      this._info.levelCount = WebGPUTexture.getLevelCount(width, height);
    } else if (this._info.levelCount > 1) {
      this._info.levelCount = Math.min(this._info.levelCount, WebGPUTexture.getLevelCount(width, height));
    }
    this._hasChange = true;
    var oldSize = this._size;
    this._info.width = width;
    this._info.height = height;
    this._size = FormatSurfaceSize(this.info.format, this.width, this.height, this.depth, this.info.levelCount) * this.info.layerCount;
    if (!this._isTextureView && this._gpuTexture) {
      this._gpuTexture.width = width;
      this._gpuTexture.height = height;
      this._gpuTexture.size = this._size;
      if (!this._gpuTexture.isSwapchainTexture) {
        var device = WebGPUDeviceManager.instance;
        WebGPUCmdFuncResizeTexture(device, this._gpuTexture);
        device.memoryStatus.textureSize -= oldSize;
        device.memoryStatus.textureSize += this._size;
      }
    }
  };
  return _createClass(WebGPUTexture, [{
    key: "gpuTexture",
    get: function get() {
      return this._gpuTexture;
    }
  }, {
    key: "lodLevel",
    get: function get() {
      return this._lodLevel;
    }
  }, {
    key: "hasChange",
    get: function get() {
      return this._hasChange;
    }
  }, {
    key: "gpuFormat",
    set: function set(val) {
      if (!this._isTextureView && this._gpuTexture && !this._gpuTexture.isSwapchainTexture) {
        WebGPUCmdFuncDestroyTexture(this._gpuTexture);
        var device = WebGPUDeviceManager.instance;
        this._gpuTexture.format = WGPUFormatToGFXFormat(val);
        WebGPUCmdFuncCreateTexture(device, this._gpuTexture);
        this._hasChange = true;
      }
    }
  }]);
}(Texture);

var WebGPUCommandPool = function () {
  function WebGPUCommandPool(Clazz, count) {
    this._frees = void 0;
    this._freeIdx = 0;
    this._freeCmds = void 0;
    this._frees = new Array(count);
    this._freeCmds = new CachedArray(count);
    for (var i = 0; i < count; ++i) {
      this._frees[i] = new Clazz();
    }
    this._freeIdx = count - 1;
  }
  var _proto = WebGPUCommandPool.prototype;
  _proto.alloc = function alloc(Clazz) {
    if (this._freeIdx < 0) {
      var size = this._frees.length * 2;
      var temp = this._frees;
      this._frees = new Array(size);
      var increase = size - temp.length;
      for (var i = 0; i < increase; ++i) {
        this._frees[i] = new Clazz();
      }
      for (var _i = increase, j = 0; _i < size; ++_i, ++j) {
        this._frees[_i] = temp[j];
      }
      this._freeIdx += increase;
    }
    var cmd = this._frees[this._freeIdx];
    this._frees[this._freeIdx--] = null;
    ++cmd.refCount;
    return cmd;
  };
  _proto.free = function free(cmd) {
    if (--cmd.refCount === 0) {
      this._freeCmds.push(cmd);
    }
  };
  _proto.freeCmds = function freeCmds(cmds) {
    var cmdLength = cmds.length;
    for (var i = 0; i < cmdLength; ++i) {
      if (--cmds.array[i].refCount === 0) {
        this._freeCmds.push(cmds.array[i]);
      }
    }
  };
  _proto.release = function release() {
    var freeCmdLength = this._freeCmds.length;
    for (var i = 0; i < freeCmdLength; ++i) {
      var cmd = this._freeCmds.array[i];
      cmd.clear();
      this._frees[++this._freeIdx] = cmd;
    }
    this._freeCmds.clear();
  };
  return WebGPUCommandPool;
}();
var WebGPUCommandAllocator = function () {
  function WebGPUCommandAllocator() {
    this.beginRenderPassCmdPool = void 0;
    this.bindStatesCmdPool = void 0;
    this.drawCmdPool = void 0;
    this.updateBufferCmdPool = void 0;
    this.copyBufferToTextureCmdPool = void 0;
    this.beginRenderPassCmdPool = new WebGPUCommandPool(WebGPUCmdBeginRenderPass, 1);
    this.bindStatesCmdPool = new WebGPUCommandPool(WebGPUCmdBindStates, 1);
    this.drawCmdPool = new WebGPUCommandPool(WebGPUCmdDraw, 1);
    this.updateBufferCmdPool = new WebGPUCommandPool(WebGPUCmdUpdateBuffer, 1);
    this.copyBufferToTextureCmdPool = new WebGPUCommandPool(WebGPUCmdCopyBufferToTexture, 1);
  }
  var _proto2 = WebGPUCommandAllocator.prototype;
  _proto2.clearCmds = function clearCmds(cmdPackage) {
    if (cmdPackage.beginRenderPassCmds.length) {
      this.beginRenderPassCmdPool.freeCmds(cmdPackage.beginRenderPassCmds);
      cmdPackage.beginRenderPassCmds.clear();
    }
    if (cmdPackage.bindStatesCmds.length) {
      this.bindStatesCmdPool.freeCmds(cmdPackage.bindStatesCmds);
      cmdPackage.bindStatesCmds.clear();
    }
    if (cmdPackage.drawCmds.length) {
      this.drawCmdPool.freeCmds(cmdPackage.drawCmds);
      cmdPackage.drawCmds.clear();
    }
    if (cmdPackage.updateBufferCmds.length) {
      this.updateBufferCmdPool.freeCmds(cmdPackage.updateBufferCmds);
      cmdPackage.updateBufferCmds.clear();
    }
    if (cmdPackage.copyBufferToTextureCmds.length) {
      this.copyBufferToTextureCmdPool.freeCmds(cmdPackage.copyBufferToTextureCmds);
      cmdPackage.copyBufferToTextureCmds.clear();
    }
    cmdPackage.cmds.clear();
  };
  _proto2.releaseCmds = function releaseCmds() {
    this.beginRenderPassCmdPool.release();
    this.bindStatesCmdPool.release();
    this.drawCmdPool.release();
    this.updateBufferCmdPool.release();
    this.copyBufferToTextureCmdPool.release();
  };
  return WebGPUCommandAllocator;
}();

var IWebGPUBlitManager = function () {
  function IWebGPUBlitManager() {
    this._srcFramebuffer = null;
    this._dstFramebuffer = null;
    WebGPUDeviceManager.instance;
  }
  var _proto = IWebGPUBlitManager.prototype;
  _proto.destroy = function destroy() {};
  return _createClass(IWebGPUBlitManager, [{
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

var WebGPUSwapchain = function (_Swapchain) {
  function WebGPUSwapchain() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Swapchain.call.apply(_Swapchain, [this].concat(args)) || this;
    _this.nullTex2D = null;
    _this.nullTexCube = null;
    _this._canvas = null;
    _this._blitManager = null;
    _this._webGPUDeviceLostHandler = null;
    return _this;
  }
  _inheritsLoose(WebGPUSwapchain, _Swapchain);
  var _proto = WebGPUSwapchain.prototype;
  _proto.initialize = function initialize(info) {
    this._canvas = info.windowHandle;
    var width = info.width,
      height = info.height;
    this._canvas.width = width;
    this._canvas.height = height;
    this._webGPUDeviceLostHandler = this._onWebGPUDeviceLost.bind(this);
    var device = WebGPUDeviceManager.instance;
    var nativeDevice = device.nativeDevice;
    nativeDevice.lost.then(this._webGPUDeviceLostHandler)["catch"](function (reasons) {});
    var capabilities = device.capabilities;
    device.stateCache.initialize(capabilities.maxTextureUnits, capabilities.maxUniformBufferBindings, capabilities.maxVertexAttributes);
    this._createTexture(width, height);
    this._depthStencilTexture = this._createDepthStencilTexture(width, height);
    this.nullTex2D = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, Format.RGBA8, 2, 2, TextureFlagBit.NONE));
    this.nullTexCube = device.createTexture(new TextureInfo(TextureType.CUBE, TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, Format.RGBA8, 2, 2, TextureFlagBit.NONE, 6));
    var nullTexRegion = new BufferTextureCopy();
    nullTexRegion.texExtent.width = 2;
    nullTexRegion.texExtent.height = 2;
    var nullTexBuff = new Uint8Array(this.nullTex2D.size);
    nullTexBuff.fill(0);
    device.copyBuffersToTexture([nullTexBuff], this.nullTex2D, [nullTexRegion]);
    nullTexRegion.texSubres.layerCount = 6;
    device.copyBuffersToTexture([nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff, nullTexBuff], this.nullTexCube, [nullTexRegion]);
    this._blitManager = new IWebGPUBlitManager();
  };
  _proto.resize = function resize(width, height, surfaceTransform) {
    var device = WebGPUDeviceManager.instance.nativeDevice;
    width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
    height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
    if (this._colorTexture.width !== width || this._colorTexture.height !== height) {
      debug("Resizing swapchain: " + width + "x" + height);
      this._canvas.width = width;
      this._canvas.height = height;
      this._colorTexture.resize(width, height);
      this._depthStencilTexture.resize(width, height);
    }
  };
  _proto.destroy = function destroy() {
    if (this._canvas && this._webGPUDeviceLostHandler) {
      this._webGPUDeviceLostHandler = null;
    }
    if (this.nullTex2D) {
      this.nullTex2D.destroy();
      this.nullTex2D = null;
    }
    if (this.nullTexCube) {
      this.nullTexCube.destroy();
      this.nullTexCube = null;
    }
    if (this._blitManager) {
      this._blitManager.destroy();
      this._blitManager = null;
    }
    this._canvas = null;
  };
  _proto._createTexture = function _createTexture(width, height) {
    var device = WebGPUDeviceManager.instance;
    var gfxSwapchainFormat = device.swapchainFormat;
    var swapchainFormat = GFXFormatToWGPUFormat(gfxSwapchainFormat);
    if (!this._colorTexture) {
      var nativeDevice = device.nativeDevice;
      var gpuConfig = {
        device: nativeDevice,
        format: swapchainFormat,
        alphaMode: 'opaque'
      };
      device.gpuConfig = gpuConfig;
      device.context.configure(gpuConfig);
    }
    this._colorTexture = new WebGPUTexture();
    this._colorTexture.initAsSwapchainTexture({
      swapchain: this,
      format: gfxSwapchainFormat,
      width: width,
      height: height
    });
    this._colorTexture.gpuTexture.gpuTexture = device.context.getCurrentTexture();
    return this._colorTexture;
  };
  _proto._createDepthStencilTexture = function _createDepthStencilTexture(width, height) {
    var device = WebGPUDeviceManager.instance;
    var depthInfo = new TextureInfo(TextureType.TEX2D, TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED, Format.DEPTH_STENCIL, width, height);
    var depthTexture = device.createTexture(depthInfo);
    return depthTexture;
  };
  _proto._onWebGPUDeviceLost = function _onWebGPUDeviceLost(info) {
    warnID(11000);
    warn('webgpu device lost');
  };
  return _createClass(WebGPUSwapchain, [{
    key: "blitManager",
    get: function get() {
      return this._blitManager;
    }
  }, {
    key: "colorTexture",
    get: function get() {
      this._colorTexture.gpuTexture.gpuTexture = WebGPUDeviceManager.instance.context.getCurrentTexture();
      return this._colorTexture;
    }
  }, {
    key: "colorGPUTexture",
    get: function get() {
      this._colorTexture.gpuTexture.gpuTexture = WebGPUDeviceManager.instance.context.getCurrentTexture();
      return this._colorTexture.gpuTexture.gpuTexture;
    }
  }, {
    key: "colorGPUTextureView",
    get: function get() {
      this._colorTexture.gpuTexture.gpuTexture = WebGPUDeviceManager.instance.context.getCurrentTexture();
      return this._colorTexture.gpuTexture.gpuTexture.createView();
    }
  }, {
    key: "depthStencilTexture",
    get: function get() {
      return this._depthStencilTexture;
    }
  }, {
    key: "gpuDepthStencilTexture",
    get: function get() {
      return this._depthStencilTexture.gpuTexture.gpuTexture;
    }
  }, {
    key: "gpuDepthStencilTextureView",
    get: function get() {
      return this._depthStencilTexture.gpuTexture.gpuTexture.createView();
    }
  }]);
}(Swapchain);

var wasmInstance = null;
var registerList = [];
function initWasm(wasmFactory, wasmUrl) {
  return new Promise(function (resolve, reject) {
    var errorMessage = function errorMessage(err) {
      return "[WebGPU]: WebGPU wasm load failed: " + err;
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
function shouldUseWasmModule() {
  {
    return sys.hasFeature(sys.Feature.WASM);
  }
}
function waitForWebGPUWasmInstantiation() {
  return _waitForWebGPUWasmInstantiation.apply(this, arguments);
}
function _waitForWebGPUWasmInstantiation() {
  _waitForWebGPUWasmInstantiation = _asyncToGenerator(_regenerator().m(function _callee() {
    var errorReport, _yield$Promise$all, glslModule, glslWasmModule, twgslModule, twgslWasmModule, glslFactory, glslWasmUrl, twgslFactory, twgslWasmUrl, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          errorReport = function errorReport(msg) {
            error('Error during WebGPU Wasm instantiation:', msg);
          };
          _context.p = 1;
          _context.n = 2;
          return ensureWasmModuleReady();
        case 2:
          if (!shouldUseWasmModule()) {
            _context.n = 5;
            break;
          }
          _context.n = 3;
          return Promise.all([import('./glslang-Crpsxxtd.js'), import('./glslang-BRkFzy9-.js'), import('./twgsl-BWZjwisI.js'), import('./twgsl-BsNcJMU5.js')]);
        case 3:
          _yield$Promise$all = _context.v;
          glslModule = _yield$Promise$all[0];
          glslWasmModule = _yield$Promise$all[1];
          twgslModule = _yield$Promise$all[2];
          twgslWasmModule = _yield$Promise$all[3];
          glslFactory = glslModule["default"];
          glslWasmUrl = glslWasmModule["default"];
          twgslFactory = twgslModule["default"];
          twgslWasmUrl = twgslWasmModule["default"];
          _context.n = 4;
          return Promise.all([initWasm(glslFactory, glslWasmUrl), initWasm(twgslFactory, twgslWasmUrl)]);
        case 4:
          _context.n = 6;
          break;
        case 5:
          throw new Error('Wasm module is not supported in this environment.');
        case 6:
          _context.n = 8;
          break;
        case 7:
          _context.p = 7;
          _t = _context.v;
          errorReport(_t);
        case 8:
          return _context.a(2);
      }
    }, _callee, null, [[1, 7]]);
  }));
  return _waitForWebGPUWasmInstantiation.apply(this, arguments);
}
registerList.push(overrideWebGPUDefine);

var loadWebGPUPromise;
function loadWebGPUWasmModule() {
  if (loadWebGPUPromise) return loadWebGPUPromise;
  loadWebGPUPromise = Promise.resolve().then(function () {
    return waitForWebGPUWasmInstantiation();
  });
  return loadWebGPUPromise;
}
var WebGPUDevice = function (_Device) {
  function WebGPUDevice() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Device.call.apply(_Device, [this].concat(args)) || this;
    _this.stateCache = new WebGPUStateCache();
    _this.cmdAllocator = new WebGPUCommandAllocator();
    _this.nullTex2D = null;
    _this.nullTexCube = null;
    _this.defaultResource = new DefaultResources();
    _this._adapter = null;
    _this._device = null;
    _this._context = null;
    _this._swapchain = null;
    _this._glslang = void 0;
    _this._twgsl = void 0;
    _this._bindingMappings = null;
    _this._multiDrawIndirect = false;
    _this._gpuConfig = null;
    _this._textureExclusive = new Array(Format.COUNT);
    return _this;
  }
  _inheritsLoose(WebGPUDevice, _Device);
  var _proto = WebGPUDevice.prototype;
  _proto.createSwapchain = function createSwapchain(info) {
    var swapchain = new WebGPUSwapchain();
    this._swapchain = swapchain;
    swapchain.initialize(info);
    return swapchain;
  };
  _proto.getSampler = function getSampler(info) {
    var hash = Sampler.computeHash(info);
    if (!this._samplers.has(hash)) {
      this._samplers.set(hash, new WebGPUSampler(info, hash));
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
  _proto.copyTextureToBuffers = function () {
    var _copyTextureToBuffers = _asyncToGenerator(_regenerator().m(function _callee(texture, buffers, regions) {
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.n = 1;
            return WebGPUCmdFuncCopyTextureToBuffer(this, texture.gpuTexture, buffers, regions);
          case 1:
            return _context.a(2);
        }
      }, _callee, this);
    }));
    function copyTextureToBuffers(_x, _x2, _x3) {
      return _copyTextureToBuffers.apply(this, arguments);
    }
    return copyTextureToBuffers;
  }();
  _proto.flushCommands = function flushCommands(cmdBuffs) {};
  _proto.initialize = function () {
    var _initialize = _asyncToGenerator(_regenerator().m(function _callee2(info) {
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            WebGPUDeviceManager.setInstance(this);
            return _context2.a(2, this.initDevice(info));
        }
      }, _callee2, this);
    }));
    function initialize(_x4) {
      return _initialize.apply(this, arguments);
    }
    return initialize;
  }();
  _proto.initFormatFeatures = function initFormatFeatures(exts) {
    this._formatFeatures.fill(FormatFeatureBit.NONE);
    this._textureExclusive.fill(true);
    var tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.LINEAR_FILTER | FormatFeatureBit.VERTEX_ATTRIBUTE;
    this._formatFeatures[Format.R8] = tempFeature;
    this._formatFeatures[Format.RG8] = tempFeature;
    this._formatFeatures[Format.RGB8] = tempFeature;
    this._formatFeatures[Format.RGBA8] = tempFeature;
    tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    this._formatFeatures[Format.R8SN] = tempFeature;
    this._formatFeatures[Format.RG8SN] = tempFeature;
    this._formatFeatures[Format.RGB8SN] = tempFeature;
    this._formatFeatures[Format.RGBA8SN] = tempFeature;
    this._formatFeatures[Format.R5G6B5] = tempFeature;
    this._formatFeatures[Format.RGBA4] = tempFeature;
    this._formatFeatures[Format.RGB5A1] = tempFeature;
    this._formatFeatures[Format.RGB10A2] = tempFeature;
    this._formatFeatures[Format.SRGB8] = tempFeature;
    this._formatFeatures[Format.SRGB8_A8] = tempFeature;
    this._formatFeatures[Format.R11G11B10F] = tempFeature;
    this._formatFeatures[Format.RGB9E5] = tempFeature;
    this._formatFeatures[Format.DEPTH] = tempFeature;
    this._formatFeatures[Format.DEPTH_STENCIL] = tempFeature;
    this._formatFeatures[Format.RGB10A2UI] = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.VERTEX_ATTRIBUTE;
    this._formatFeatures[Format.R16F] = tempFeature;
    this._formatFeatures[Format.RG16F] = tempFeature;
    this._formatFeatures[Format.RGB16F] = tempFeature;
    this._formatFeatures[Format.RGBA16F] = tempFeature;
    tempFeature = FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.VERTEX_ATTRIBUTE;
    this._formatFeatures[Format.R32F] = tempFeature;
    this._formatFeatures[Format.RG32F] = tempFeature;
    this._formatFeatures[Format.RGB32F] = tempFeature;
    this._formatFeatures[Format.RGBA32F] = tempFeature;
    this._formatFeatures[Format.RGB10A2UI] = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    tempFeature = FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.STORAGE_TEXTURE | FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER | FormatFeatureBit.VERTEX_ATTRIBUTE;
    this._formatFeatures[Format.R8I] = tempFeature;
    this._formatFeatures[Format.R8UI] = tempFeature;
    this._formatFeatures[Format.R16I] = tempFeature;
    this._formatFeatures[Format.R16UI] = tempFeature;
    this._formatFeatures[Format.R32I] = tempFeature;
    this._formatFeatures[Format.R32UI] = tempFeature;
    this._formatFeatures[Format.RG8I] = tempFeature;
    this._formatFeatures[Format.RG8UI] = tempFeature;
    this._formatFeatures[Format.RG16I] = tempFeature;
    this._formatFeatures[Format.RG16UI] = tempFeature;
    this._formatFeatures[Format.RG32I] = tempFeature;
    this._formatFeatures[Format.RG32UI] = tempFeature;
    this._formatFeatures[Format.RGB8I] = tempFeature;
    this._formatFeatures[Format.RGB8UI] = tempFeature;
    this._formatFeatures[Format.RGB16I] = tempFeature;
    this._formatFeatures[Format.RGB16UI] = tempFeature;
    this._formatFeatures[Format.RGB32I] = tempFeature;
    this._formatFeatures[Format.RGB32UI] = tempFeature;
    this._formatFeatures[Format.RGBA8I] = tempFeature;
    this._formatFeatures[Format.RGBA8UI] = tempFeature;
    this._formatFeatures[Format.RGBA16I] = tempFeature;
    this._formatFeatures[Format.RGBA16UI] = tempFeature;
    this._formatFeatures[Format.RGBA32I] = tempFeature;
    this._formatFeatures[Format.RGBA32UI] = tempFeature;
    this._textureExclusive[Format.R8] = false;
    this._textureExclusive[Format.RG8] = false;
    this._textureExclusive[Format.RGB8] = false;
    this._textureExclusive[Format.R5G6B5] = false;
    this._textureExclusive[Format.RGBA4] = false;
    this._textureExclusive[Format.RGB5A1] = false;
    this._textureExclusive[Format.RGBA8] = false;
    this._textureExclusive[Format.RGB10A2] = false;
    this._textureExclusive[Format.RGB10A2UI] = false;
    this._textureExclusive[Format.SRGB8_A8] = false;
    this._textureExclusive[Format.R8I] = false;
    this._textureExclusive[Format.R8UI] = false;
    this._textureExclusive[Format.R16I] = false;
    this._textureExclusive[Format.R16UI] = false;
    this._textureExclusive[Format.R32I] = false;
    this._textureExclusive[Format.R32UI] = false;
    this._textureExclusive[Format.RG8I] = false;
    this._textureExclusive[Format.RG8UI] = false;
    this._textureExclusive[Format.RG16I] = false;
    this._textureExclusive[Format.RG16UI] = false;
    this._textureExclusive[Format.RG32I] = false;
    this._textureExclusive[Format.RG32UI] = false;
    this._textureExclusive[Format.RGBA8I] = false;
    this._textureExclusive[Format.RGBA8UI] = false;
    this._textureExclusive[Format.RGBA16I] = false;
    this._textureExclusive[Format.RGBA16UI] = false;
    this._textureExclusive[Format.RGBA32I] = false;
    this._textureExclusive[Format.RGBA32UI] = false;
    this._textureExclusive[Format.DEPTH] = false;
    this._textureExclusive[Format.DEPTH_STENCIL] = false;
    if (exts.has('float32-filterable')) {
      this._formatFeatures[Format.R32F] |= FormatFeatureBit.RENDER_TARGET;
      this._formatFeatures[Format.RG32F] |= FormatFeatureBit.RENDER_TARGET;
      this._formatFeatures[Format.RGBA32F] |= FormatFeatureBit.RENDER_TARGET;
      this._textureExclusive[Format.R32F] = false;
      this._textureExclusive[Format.RG32F] = false;
      this._textureExclusive[Format.RGBA32F] = false;
      this._formatFeatures[Format.RGB32F] |= FormatFeatureBit.LINEAR_FILTER;
      this._formatFeatures[Format.RGBA32F] |= FormatFeatureBit.LINEAR_FILTER;
      this._formatFeatures[Format.R32F] |= FormatFeatureBit.LINEAR_FILTER;
      this._formatFeatures[Format.RG32F] |= FormatFeatureBit.LINEAR_FILTER;
    }
    if (exts.has('shader-f16')) {
      this._textureExclusive[Format.R16F] = false;
      this._textureExclusive[Format.RG16F] = false;
      this._textureExclusive[Format.RGBA16F] = false;
      this._formatFeatures[Format.RGB16F] |= FormatFeatureBit.LINEAR_FILTER;
      this._formatFeatures[Format.RGBA16F] |= FormatFeatureBit.LINEAR_FILTER;
      this._formatFeatures[Format.R16F] |= FormatFeatureBit.LINEAR_FILTER;
      this._formatFeatures[Format.RG16F] |= FormatFeatureBit.LINEAR_FILTER;
    }
    var compressedFeature = FormatFeatureBit.SAMPLED_TEXTURE | FormatFeatureBit.LINEAR_FILTER;
    if (exts.has('texture-compression-etc2')) {
      this._formatFeatures[Format.ETC2_RGB8] = compressedFeature;
      this._formatFeatures[Format.ETC2_RGBA8] = compressedFeature;
      this._formatFeatures[Format.ETC2_SRGB8] = compressedFeature;
      this._formatFeatures[Format.ETC2_SRGB8_A8] = compressedFeature;
      this._formatFeatures[Format.ETC2_RGB8_A1] = compressedFeature;
      this._formatFeatures[Format.ETC2_SRGB8_A1] = compressedFeature;
    }
    if (exts.has('texture-compression-bc')) {
      this._formatFeatures[Format.BC1] = compressedFeature;
      this._formatFeatures[Format.BC1_ALPHA] = compressedFeature;
      this._formatFeatures[Format.BC1_SRGB] = compressedFeature;
      this._formatFeatures[Format.BC1_SRGB_ALPHA] = compressedFeature;
      this._formatFeatures[Format.BC2] = compressedFeature;
      this._formatFeatures[Format.BC2_SRGB] = compressedFeature;
      this._formatFeatures[Format.BC3] = compressedFeature;
      this._formatFeatures[Format.BC3_SRGB] = compressedFeature;
    }
    if (exts.has('texture-compression-astc')) {
      this._formatFeatures[Format.ASTC_RGBA_4X4] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_5X4] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_5X5] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_6X5] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_6X6] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_8X5] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_8X6] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_8X8] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_10X5] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_10X6] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_10X8] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_10X10] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_12X10] = compressedFeature;
      this._formatFeatures[Format.ASTC_RGBA_12X12] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_4X4] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_5X4] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_5X5] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_6X5] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_6X6] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_8X5] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_8X6] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_8X8] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_10X5] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_10X6] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_10X8] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_10X10] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_12X10] = compressedFeature;
      this._formatFeatures[Format.ASTC_SRGBA_12X12] = compressedFeature;
    }
  };
  _proto.getDefaultDescResources = function getDefaultDescResources(entry, resourceInfo) {
    var currHash = hashCombineNum(entry.visibility, 0);
    var defaultRes = this.defaultResource;
    if (entry.buffer) {
      currHash = hashCombineStr(entry.buffer.type, currHash);
      if (entry.buffer.hasDynamicOffset) currHash = hashCombineNum(entry.buffer.hasDynamicOffset ? 1 : 0, currHash);
      if (entry.buffer.minBindingSize !== undefined) currHash = hashCombineNum(entry.buffer.minBindingSize, currHash);
      if (defaultRes.buffersDescLayout.has(currHash)) {
        return defaultRes.buffersDescLayout.get(currHash);
      }
      resourceInfo = resourceInfo;
      var bufferInfo = new BufferInfo();
      bufferInfo.usage = resourceInfo.usage;
      bufferInfo.size = bufferInfo.stride = 16;
      bufferInfo.memUsage = resourceInfo.memUsage;
      bufferInfo.flags = resourceInfo.flags;
      defaultRes.buffersDescLayout.set(currHash, this.createBuffer(bufferInfo));
      return defaultRes.buffersDescLayout.get(currHash);
    } else if (entry.texture) {
      resourceInfo = resourceInfo;
      currHash = hashCombineStr(entry.texture.sampleType, currHash);
      currHash = hashCombineStr(entry.texture.viewDimension, currHash);
      currHash = hashCombineNum(entry.texture.multisampled ? 1 : 0, currHash);
      currHash = hashCombineNum(resourceInfo.mipLevel, currHash);
      currHash = hashCombineNum(resourceInfo.arrayLayer, currHash);
      if (defaultRes.texturesDescLayout.has(currHash)) {
        return defaultRes.texturesDescLayout.get(currHash);
      }
      var texInfo = new TextureInfo(resourceInfo.type, resourceInfo.usage, resourceInfo.format, Math.pow(2, resourceInfo.mipLevel - 1), Math.pow(2, resourceInfo.mipLevel - 1), resourceInfo.flags, resourceInfo.arrayLayer, resourceInfo.mipLevel, resourceInfo.samples, 1);
      defaultRes.texturesDescLayout.set(currHash, this.createTexture(texInfo));
      return defaultRes.texturesDescLayout.get(currHash);
    } else if (entry.sampler) {
      resourceInfo = resourceInfo;
      currHash = hashCombineStr(entry.sampler.type, currHash);
      if (defaultRes.samplersDescLayout.has(currHash)) {
        return defaultRes.samplersDescLayout.get(currHash);
      }
      var samplerInfo = new SamplerInfo();
      samplerInfo.minFilter = resourceInfo.minFilter;
      samplerInfo.magFilter = resourceInfo.magFilter;
      samplerInfo.mipFilter = resourceInfo.mipFilter;
      samplerInfo.addressU = resourceInfo.addressU;
      samplerInfo.addressV = resourceInfo.addressV;
      samplerInfo.addressW = resourceInfo.addressW;
      defaultRes.samplersDescLayout.set(currHash, this.getSampler(samplerInfo));
      return defaultRes.samplersDescLayout.get(currHash);
    }
    return undefined;
  };
  _proto._createDefaultDescSet = function _createDefaultDescSet() {
    var defaultResource = this.defaultResource;
    var layoutInfo = new DescriptorSetLayoutInfo();
    var layoutBinding = new DescriptorSetLayoutBinding();
    layoutBinding.binding = 0;
    layoutBinding.count = 1;
    layoutBinding.descriptorType = DescriptorType.UNIFORM_BUFFER;
    layoutBinding.stageFlags = ShaderStageFlagBit.VERTEX;
    layoutInfo.bindings.push(layoutBinding);
    defaultResource.setLayout = this.createDescriptorSetLayout(layoutInfo);
    var descInfo = new DescriptorSetInfo();
    descInfo.layout = defaultResource.setLayout;
    defaultResource.descSet = this.createDescriptorSet(descInfo);
    defaultResource.descSet.bindBuffer(0, defaultResource.buffer);
    defaultResource.descSet.update();
  };
  _proto.initDevice = function () {
    var _initDevice = _asyncToGenerator(_regenerator().m(function _callee3(info) {
      var _this$_adapter;
      var gpu, maxVertAttrs, maxSampledTexPerShaderStage, submitFeatures, mapping, blockOffsets, samplerTextureOffsets, firstSet, mappingIdxSize, i, curSet, prevSet, _i, _curSet, canvas, adapterInfo, description, limits, features, texInfo, defaultDescTexResc, cubeTexInfo, defaultDescCubeTexResc, bufferInfo, defaultDescBuffResc, samplerInfo, defaultDescSmplResc, defaultResource, compressedFormat;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            gpu = navigator.gpu;
            _context3.n = 1;
            return gpu == null ? void 0 : gpu.requestAdapter();
          case 1:
            this._adapter = _context3.v;
            maxVertAttrs = this._adapter.limits.maxVertexAttributes;
            maxSampledTexPerShaderStage = this._adapter.limits.maxSampledTexturesPerShaderStage;
            submitFeatures = [];
            if (this._adapter.features.has('float32-filterable')) {
              submitFeatures.push('float32-filterable');
            } else {
              warn('Filterable 32-bit float textures support is not available');
            }
            _context3.n = 2;
            return (_this$_adapter = this._adapter) == null ? void 0 : _this$_adapter.requestDevice({
              requiredLimits: {
                maxVertexAttributes: maxVertAttrs,
                maxSampledTexturesPerShaderStage: maxSampledTexPerShaderStage
              },
              requiredFeatures: submitFeatures
            });
          case 2:
            this._device = _context3.v;
            _context3.n = 3;
            return loadWebGPUWasmModule();
          case 3:
            this._glslang = webGPU.glslang;
            this._twgsl = webGPU.twgsl;
            this._gfxAPI = API.WEBGPU;
            this._swapchainFormat = WGPUFormatToGFXFormat(navigator.gpu.getPreferredCanvasFormat());
            mapping = this._bindingMappingInfo = info.bindingMappingInfo;
            blockOffsets = [];
            samplerTextureOffsets = [];
            firstSet = mapping.setIndices[0];
            blockOffsets[firstSet] = 0;
            samplerTextureOffsets[firstSet] = 0;
            mappingIdxSize = mapping.setIndices.length;
            for (i = 1; i < mappingIdxSize; ++i) {
              curSet = mapping.setIndices[i];
              prevSet = mapping.setIndices[i - 1];
              blockOffsets[curSet] = mapping.maxBlockCounts[prevSet] + blockOffsets[prevSet];
              samplerTextureOffsets[curSet] = mapping.maxSamplerTextureCounts[prevSet] + samplerTextureOffsets[prevSet];
            }
            for (_i = 0; _i < mappingIdxSize; ++_i) {
              _curSet = mapping.setIndices[_i];
              samplerTextureOffsets[_curSet] -= mapping.maxBlockCounts[_curSet];
            }
            this._bindingMappings = {
              blockOffsets: blockOffsets,
              samplerTextureOffsets: samplerTextureOffsets,
              flexibleSet: mapping.setIndices[mappingIdxSize - 1]
            };
            canvas = Device.canvas;
            this._context = canvas.getContext('webgpu');
            this._device;
            adapterInfo = this._adapter.info;
            this._vendor = adapterInfo.vendor;
            this._renderer = adapterInfo.device;
            description = adapterInfo.description;
            limits = this._adapter.limits;
            this._caps.clipSpaceMinZ = 0.0;
            this._caps.screenSpaceSignY = -1;
            this._caps.uboOffsetAlignment = 256;
            this._caps.maxUniformBufferBindings = 12;
            this._caps.maxVertexAttributes = limits.maxVertexAttributes;
            this._caps.maxUniformBufferBindings = limits.maxUniformBufferBindingSize;
            this._caps.maxTextureSize = limits.maxTextureDimension2D;
            this._caps.maxArrayTextureLayers = limits.maxTextureArrayLayers;
            this._caps.max3DTextureSize = limits.maxTextureDimension3D;
            this._caps.uboOffsetAlignment = limits.minUniformBufferOffsetAlignment;
            features = this._adapter.features;
            this._multiDrawIndirect = false;
            this._features.fill(false);
            this._features[Feature.ELEMENT_INDEX_UINT] = true;
            this._features[Feature.INSTANCED_ARRAYS] = true;
            this._features[Feature.MULTIPLE_RENDER_TARGETS] = true;
            this.initFormatFeatures(features);
            this._queue = this.createQueue(new QueueInfo(QueueType.GRAPHICS));
            this._cmdBuff = this.createCommandBuffer(new CommandBufferInfo(this._queue));
            texInfo = new TextureInfo(TextureType.TEX2D, TextureUsageBit.STORAGE | TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, Format.RGBA8, 16, 16, TextureFlagBit.NONE, 1, 1, SampleCount.X1, 1);
            defaultDescTexResc = this.createTexture(texInfo);
            cubeTexInfo = new TextureInfo(TextureType.CUBE, TextureUsageBit.STORAGE | TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, Format.RGBA8, 16, 16, TextureFlagBit.NONE, 6);
            defaultDescCubeTexResc = this.createTexture(cubeTexInfo);
            bufferInfo = new BufferInfo(BufferUsageBit.UNIFORM, MemoryUsageBit.DEVICE, 16, 16, BufferFlagBit.NONE);
            defaultDescBuffResc = this.createBuffer(bufferInfo);
            samplerInfo = new SamplerInfo();
            defaultDescSmplResc = this.getSampler(samplerInfo);
            defaultResource = this.defaultResource;
            defaultResource.buffer = defaultDescBuffResc;
            defaultResource.texture = defaultDescTexResc;
            defaultResource.sampler = defaultDescSmplResc;
            defaultResource.cubeTexture = defaultDescCubeTexResc;
            this._createDefaultDescSet();
            compressedFormat = '';
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
            debug('WebGPU device initialized.');
            debug("RENDERER: " + this._renderer);
            debug("VENDOR: " + this._vendor);
            debug("DESCRIPTION: " + description);
            debug("COMPRESSED_FORMAT: " + compressedFormat);
            return _context3.a(2, Promise.resolve(true));
        }
      }, _callee3, this);
    }));
    function initDevice(_x5) {
      return _initDevice.apply(this, arguments);
    }
    return initDevice;
  }();
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
  _proto.resize = function resize(width, height) {};
  _proto.acquire = function acquire() {};
  _proto.present = function present() {
    var queue = this._queue;
    this._numDrawCalls = queue.numDrawCalls;
    this._numInstances = queue.numInstances;
    this._numTris = queue.numTris;
    queue.clear();
  };
  _proto.createCommandBuffer = function createCommandBuffer(info) {
    var cmdBuff = new WebGPUCommandBuffer();
    if (cmdBuff.initialize(info)) {
      return cmdBuff;
    }
    return null;
  };
  _proto.createBuffer = function createBuffer(info) {
    var buffer = new WebGPUBuffer();
    buffer.initialize(info);
    return buffer;
  };
  _proto.createTexture = function createTexture(info) {
    var texture = new WebGPUTexture();
    texture.initialize(info);
    return texture;
  };
  _proto.createDescriptorSet = function createDescriptorSet(info) {
    var descriptorSet = new WebGPUDescriptorSet();
    descriptorSet.initialize(info);
    return descriptorSet;
  };
  _proto.createShader = function createShader(info) {
    var shader = new WebGPUShader();
    shader.initialize(info);
    return shader;
  };
  _proto.createInputAssembler = function createInputAssembler(info) {
    var inputAssembler = new WebGPUInputAssembler();
    inputAssembler.initialize(info);
    return inputAssembler;
  };
  _proto.createRenderPass = function createRenderPass(info) {
    var renderPass = new WebGPURenderPass();
    renderPass.initialize(info);
    return renderPass;
  };
  _proto.createFramebuffer = function createFramebuffer(info) {
    var framebuffer = new WebGPUFramebuffer();
    framebuffer.initialize(info);
    return framebuffer;
  };
  _proto.createDescriptorSetLayout = function createDescriptorSetLayout(info) {
    var descriptorSetLayout = new WebGPUDescriptorSetLayout();
    descriptorSetLayout.initialize(info);
    return descriptorSetLayout;
  };
  _proto.createPipelineLayout = function createPipelineLayout(info) {
    var pipelineLayout = new WebGPUPipelineLayout();
    if (pipelineLayout.initialize(info)) {
      return pipelineLayout;
    }
    return null;
  };
  _proto.createPipelineState = function createPipelineState(info) {
    var pipelineState = new WebGPUPipelineState();
    pipelineState.initialize(info);
    return pipelineState;
  };
  _proto.createQueue = function createQueue(info) {
    var queue = new WebGPUQueue();
    if (queue.initialize(info)) {
      return queue;
    }
    return null;
  };
  _proto.copyBuffersToTexture = function copyBuffersToTexture(buffers, texture, regions) {
    WebGPUCmdFuncCopyBuffersToTexture(this, buffers, texture.gpuTexture, regions);
  };
  _proto.copyTexImagesToTexture = function copyTexImagesToTexture(texImages, texture, regions) {
    WebGPUCmdFuncCopyTexImagesToTexture(this, texImages, texture.gpuTexture, regions);
  };
  _proto.copyFramebufferToBuffer = function copyFramebufferToBuffer(srcFramebuffer, dstBuffer, regions) {};
  _proto.blitFramebuffer = function blitFramebuffer(src, dst, srcRect, dstRect, filter) {};
  return _createClass(WebGPUDevice, [{
    key: "isPremultipliedAlpha",
    get: function get() {
      if (!this._gpuConfig) {
        return false;
      }
      return this._gpuConfig.alphaMode === 'premultiplied';
    }
  }, {
    key: "multiDrawIndirectSupport",
    get: function get() {
      return this._multiDrawIndirect;
    }
  }, {
    key: "bindingMappings",
    get: function get() {
      return this._bindingMappings;
    }
  }, {
    key: "context",
    get: function get() {
      return this._context;
    }
  }, {
    key: "gpuConfig",
    get: function get() {
      return this._gpuConfig;
    },
    set: function set(config) {
      this._gpuConfig = config;
    }
  }, {
    key: "floatFilterable",
    get: function get() {
      return this._adapter.features.has('float32-filterable');
    }
  }, {
    key: "nativeDevice",
    get: function get() {
      return this._device;
    }
  }, {
    key: "glslang",
    get: function get() {
      return this._glslang;
    }
  }, {
    key: "twgsl",
    get: function get() {
      return this._twgsl;
    }
  }]);
}(Device);

legacyCC.WebGPUDevice = WebGPUDevice;

export { WebGPUDevice };
//# sourceMappingURL=gfx-webgpu.js.map
