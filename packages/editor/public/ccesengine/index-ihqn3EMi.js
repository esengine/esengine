import { _ as _p } from './zlib.min-3VC1ush6.js';
import { R as RecyclePool, l as _createForOfIteratorHelperLoose, a as _createClass, Q as error, e as warn, I as assert, _ as _inheritsLoose, $ as systemInfo, a4 as OS, G as macro, k as errorID, z as _extends } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { b1 as ResolveMode, F as Format, a1 as SampleCount, a0 as TextureFlagBit, E as TextureType, al as AccessFlagBit, bo as Viewport, aQ as LoadOp, a8 as StoreOp, C as ClearFlagBit, O as ShaderStageFlagBit, ac as Color, L as DescriptorSetLayoutBinding, V as Uniform, az as DescriptorSetLayoutInfo, U as UniformBlock, Y as MemoryAccessBit, Z as ViewDimension, b3 as SampleType, W as Type, ad as Rect, r as Buffer, q as Texture, p as Sampler, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, a5 as DescriptorSetInfo, N as DescriptorType, $ as API, aX as PipelineLayoutInfo, aN as GetTypeSize, _ as FormatFeatureBit, aa as Feature, ap as BufferViewInfo, H as TextureUsageBit, z as TextureInfo, be as TextureBlit, l as Framebuffer, aK as FramebufferInfo, bc as SurfaceTransform, A as Attribute, I as InputAssemblerInfo, P as PipelineStateInfo, aW as PipelineBindPoint, aC as DispatchInfo, a7 as DepthStencilAttachment, a6 as ColorAttachment, aM as GeneralBarrierInfo, a9 as RenderPassInfo, ae as SamplerInfo, a4 as Filter, af as Address, ah as ComparisonFunc, X as UniformSamplerTexture, bm as UniformStorageImage, b5 as ShaderInfo, b6 as ShaderStage, bj as UniformInputAttachment, bl as UniformStorageBuffer, bn as UniformTexture, bk as UniformSampler, at as DESCRIPTOR_BUFFER_TYPE, av as DESCRIPTOR_SAMPLER_TYPE } from './buffer-barrier-BlQXg9Aa.js';
import { J as AABB, g as Vec4, h as toRadian, _ as Sphere, F as intersect, f as Vec3, M as Mat4, Q as Quat, C as Color$1, V as Vec2, b3 as packRGBE } from './index-uXI1_UMk.js';
import { L as LightType, S as SkyBoxFlagValue, f as Camera, o as ProbeType, v as DebugViewCompositeType, u as PipelineSceneData } from './debug-view-BuNhRPv_.js';
import './deprecated-n0w4kK7g.js';
import { C as CSMLevel, y as ShadowType, v as PCFType, d as builtinResMgr, a0 as InstancedBuffer, ar as instancingCompareFn, B as BatchingSchemes, g as getPhaseID$1, b as Material, as as decideProfilerCamera, at as getVariantKey, au as prepareDefines, Q as getDeviceShaderVersion, av as getActiveAttributes, aw as getShaderInstanceName, ax as genHandles, ay as getCombinationDefines, az as populateMacros, aA as getSize } from './scene-vWcxM1_c.js';
import { z as supportsR32FloatTexture, A as UBOForwardLightEnum, P as PipelineStateManager, S as SetIndex, n as UBOSkinning, L as Layers, B as UBOForwardLight, D as UBOLocal, E as UBODeferredLight, U as UBOLocalEnum, F as supportsRGBA16HalfFloatTexture, G as getDefaultShadowTexture, H as localDescriptorSetLayout } from './pipeline-state-manager-C5U4ouGL.js';
import { P as PipelineInputAssemblerData } from './render-types-D3qsZZI9.js';
import { c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';
import './deprecated-CN-RjLP6.js';
import './prefab-DYg_oxpo.js';
import './node-event-Ccvtv8bJ.js';

var UpdateFrequency;
(function (UpdateFrequency) {
  UpdateFrequency[UpdateFrequency["PER_INSTANCE"] = 0] = "PER_INSTANCE";
  UpdateFrequency[UpdateFrequency["PER_BATCH"] = 1] = "PER_BATCH";
  UpdateFrequency[UpdateFrequency["PER_PHASE"] = 2] = "PER_PHASE";
  UpdateFrequency[UpdateFrequency["PER_PASS"] = 3] = "PER_PASS";
  UpdateFrequency[UpdateFrequency["COUNT"] = 4] = "COUNT";
})(UpdateFrequency || (UpdateFrequency = {}));
var ParameterType = {
  CONSTANTS: 0,
  CBV: 1,
  UAV: 2,
  SRV: 3,
  TABLE: 4,
  SSV: 5
};
var ResourceResidency;
(function (ResourceResidency) {
  ResourceResidency[ResourceResidency["MANAGED"] = 0] = "MANAGED";
  ResourceResidency[ResourceResidency["MEMORYLESS"] = 1] = "MEMORYLESS";
  ResourceResidency[ResourceResidency["PERSISTENT"] = 2] = "PERSISTENT";
  ResourceResidency[ResourceResidency["EXTERNAL"] = 3] = "EXTERNAL";
  ResourceResidency[ResourceResidency["BACKBUFFER"] = 4] = "BACKBUFFER";
})(ResourceResidency || (ResourceResidency = {}));
var QueueHint;
(function (QueueHint) {
  QueueHint[QueueHint["NONE"] = 0] = "NONE";
  QueueHint[QueueHint["OPAQUE"] = 1] = "OPAQUE";
  QueueHint[QueueHint["MASK"] = 2] = "MASK";
  QueueHint[QueueHint["BLEND"] = 3] = "BLEND";
  QueueHint[QueueHint["RENDER_OPAQUE"] = 1] = "RENDER_OPAQUE";
  QueueHint[QueueHint["RENDER_CUTOUT"] = 2] = "RENDER_CUTOUT";
  QueueHint[QueueHint["RENDER_TRANSPARENT"] = 3] = "RENDER_TRANSPARENT";
})(QueueHint || (QueueHint = {}));
var ResourceDimension;
(function (ResourceDimension) {
  ResourceDimension[ResourceDimension["BUFFER"] = 0] = "BUFFER";
  ResourceDimension[ResourceDimension["TEXTURE1D"] = 1] = "TEXTURE1D";
  ResourceDimension[ResourceDimension["TEXTURE2D"] = 2] = "TEXTURE2D";
  ResourceDimension[ResourceDimension["TEXTURE3D"] = 3] = "TEXTURE3D";
})(ResourceDimension || (ResourceDimension = {}));
var ResourceFlags;
(function (ResourceFlags) {
  ResourceFlags[ResourceFlags["NONE"] = 0] = "NONE";
  ResourceFlags[ResourceFlags["UNIFORM"] = 1] = "UNIFORM";
  ResourceFlags[ResourceFlags["INDIRECT"] = 2] = "INDIRECT";
  ResourceFlags[ResourceFlags["STORAGE"] = 4] = "STORAGE";
  ResourceFlags[ResourceFlags["SAMPLED"] = 8] = "SAMPLED";
  ResourceFlags[ResourceFlags["COLOR_ATTACHMENT"] = 16] = "COLOR_ATTACHMENT";
  ResourceFlags[ResourceFlags["DEPTH_STENCIL_ATTACHMENT"] = 32] = "DEPTH_STENCIL_ATTACHMENT";
  ResourceFlags[ResourceFlags["INPUT_ATTACHMENT"] = 64] = "INPUT_ATTACHMENT";
  ResourceFlags[ResourceFlags["SHADING_RATE"] = 128] = "SHADING_RATE";
  ResourceFlags[ResourceFlags["TRANSFER_SRC"] = 256] = "TRANSFER_SRC";
  ResourceFlags[ResourceFlags["TRANSFER_DST"] = 512] = "TRANSFER_DST";
})(ResourceFlags || (ResourceFlags = {}));
var TaskType = {
  SYNC: 0,
  ASYNC: 1
};
var SceneFlags;
(function (SceneFlags) {
  SceneFlags[SceneFlags["NONE"] = 0] = "NONE";
  SceneFlags[SceneFlags["OPAQUE"] = 1] = "OPAQUE";
  SceneFlags[SceneFlags["MASK"] = 2] = "MASK";
  SceneFlags[SceneFlags["BLEND"] = 4] = "BLEND";
  SceneFlags[SceneFlags["OPAQUE_OBJECT"] = 1] = "OPAQUE_OBJECT";
  SceneFlags[SceneFlags["CUTOUT_OBJECT"] = 2] = "CUTOUT_OBJECT";
  SceneFlags[SceneFlags["TRANSPARENT_OBJECT"] = 4] = "TRANSPARENT_OBJECT";
  SceneFlags[SceneFlags["SHADOW_CASTER"] = 8] = "SHADOW_CASTER";
  SceneFlags[SceneFlags["UI"] = 16] = "UI";
  SceneFlags[SceneFlags["DEFAULT_LIGHTING"] = 32] = "DEFAULT_LIGHTING";
  SceneFlags[SceneFlags["VOLUMETRIC_LIGHTING"] = 64] = "VOLUMETRIC_LIGHTING";
  SceneFlags[SceneFlags["CLUSTERED_LIGHTING"] = 128] = "CLUSTERED_LIGHTING";
  SceneFlags[SceneFlags["PLANAR_SHADOW"] = 256] = "PLANAR_SHADOW";
  SceneFlags[SceneFlags["GEOMETRY"] = 512] = "GEOMETRY";
  SceneFlags[SceneFlags["PROFILER"] = 1024] = "PROFILER";
  SceneFlags[SceneFlags["DRAW_INSTANCING"] = 2048] = "DRAW_INSTANCING";
  SceneFlags[SceneFlags["DRAW_NON_INSTANCING"] = 4096] = "DRAW_NON_INSTANCING";
  SceneFlags[SceneFlags["REFLECTION_PROBE"] = 8192] = "REFLECTION_PROBE";
  SceneFlags[SceneFlags["GPU_DRIVEN"] = 16384] = "GPU_DRIVEN";
  SceneFlags[SceneFlags["NON_BUILTIN"] = 32768] = "NON_BUILTIN";
  SceneFlags[SceneFlags["ALL"] = 4294967295] = "ALL";
})(SceneFlags || (SceneFlags = {}));
var LightingMode = {
  NONE: 0,
  DEFAULT: 1,
  CLUSTERED: 2
};
var AttachmentType = {
  RENDER_TARGET: 0,
  DEPTH_STENCIL: 1,
  SHADING_RATE: 2
};
var AccessType;
(function (AccessType) {
  AccessType[AccessType["READ"] = 0] = "READ";
  AccessType[AccessType["READ_WRITE"] = 1] = "READ_WRITE";
  AccessType[AccessType["WRITE"] = 2] = "WRITE";
})(AccessType || (AccessType = {}));
var ClearValueType = {
  NONE: 0,
  FLOAT_TYPE: 1,
  INT_TYPE: 2
};
var LightInfo = function () {
  function LightInfo(light, level, culledByLight, probe) {
    if (light === void 0) {
      light = null;
    }
    if (level === void 0) {
      level = 0;
    }
    if (culledByLight === void 0) {
      culledByLight = false;
    }
    if (probe === void 0) {
      probe = null;
    }
    this.light = light;
    this.probe = probe;
    this.level = level;
    this.culledByLight = culledByLight;
  }
  var _proto = LightInfo.prototype;
  _proto.reset = function reset(light, level, culledByLight, probe) {
    this.light = light;
    this.probe = probe;
    this.level = level;
    this.culledByLight = culledByLight;
  };
  return LightInfo;
}();
var ResolveFlags = {
  NONE: 0,
  COLOR: 1,
  DEPTH: 2,
  STENCIL: 4
};
var ResolvePair = function () {
  function ResolvePair(source, target, resolveFlags, mode, mode1) {
    if (source === void 0) {
      source = '';
    }
    if (target === void 0) {
      target = '';
    }
    if (resolveFlags === void 0) {
      resolveFlags = ResolveFlags.NONE;
    }
    if (mode === void 0) {
      mode = ResolveMode.SAMPLE_ZERO;
    }
    if (mode1 === void 0) {
      mode1 = ResolveMode.SAMPLE_ZERO;
    }
    this.source = source;
    this.target = target;
    this.resolveFlags = resolveFlags;
    this.mode = mode;
    this.mode1 = mode1;
  }
  var _proto2 = ResolvePair.prototype;
  _proto2.reset = function reset(source, target, resolveFlags, mode, mode1) {
    this.source = source;
    this.target = target;
    this.resolveFlags = resolveFlags;
    this.mode = mode;
    this.mode1 = mode1;
  };
  return ResolvePair;
}();
var CopyPair = function () {
  function CopyPair(source, target, mipLevels, numSlices, sourceMostDetailedMip, sourceFirstSlice, sourcePlaneSlice, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    if (source === void 0) {
      source = '';
    }
    if (target === void 0) {
      target = '';
    }
    if (mipLevels === void 0) {
      mipLevels = 0xFFFFFFFF;
    }
    if (numSlices === void 0) {
      numSlices = 0xFFFFFFFF;
    }
    if (sourceMostDetailedMip === void 0) {
      sourceMostDetailedMip = 0;
    }
    if (sourceFirstSlice === void 0) {
      sourceFirstSlice = 0;
    }
    if (sourcePlaneSlice === void 0) {
      sourcePlaneSlice = 0;
    }
    if (targetMostDetailedMip === void 0) {
      targetMostDetailedMip = 0;
    }
    if (targetFirstSlice === void 0) {
      targetFirstSlice = 0;
    }
    if (targetPlaneSlice === void 0) {
      targetPlaneSlice = 0;
    }
    this.source = source;
    this.target = target;
    this.mipLevels = mipLevels;
    this.numSlices = numSlices;
    this.sourceMostDetailedMip = sourceMostDetailedMip;
    this.sourceFirstSlice = sourceFirstSlice;
    this.sourcePlaneSlice = sourcePlaneSlice;
    this.targetMostDetailedMip = targetMostDetailedMip;
    this.targetFirstSlice = targetFirstSlice;
    this.targetPlaneSlice = targetPlaneSlice;
  }
  var _proto3 = CopyPair.prototype;
  _proto3.reset = function reset(source, target, mipLevels, numSlices, sourceMostDetailedMip, sourceFirstSlice, sourcePlaneSlice, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    this.source = source;
    this.target = target;
    this.mipLevels = mipLevels;
    this.numSlices = numSlices;
    this.sourceMostDetailedMip = sourceMostDetailedMip;
    this.sourceFirstSlice = sourceFirstSlice;
    this.sourcePlaneSlice = sourcePlaneSlice;
    this.targetMostDetailedMip = targetMostDetailedMip;
    this.targetFirstSlice = targetFirstSlice;
    this.targetPlaneSlice = targetPlaneSlice;
  };
  return CopyPair;
}();
var UploadPair = function () {
  function UploadPair(source, target, mipLevels, numSlices, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    if (source === void 0) {
      source = new Uint8Array(0);
    }
    if (target === void 0) {
      target = '';
    }
    if (mipLevels === void 0) {
      mipLevels = 0xFFFFFFFF;
    }
    if (numSlices === void 0) {
      numSlices = 0xFFFFFFFF;
    }
    if (targetMostDetailedMip === void 0) {
      targetMostDetailedMip = 0;
    }
    if (targetFirstSlice === void 0) {
      targetFirstSlice = 0;
    }
    if (targetPlaneSlice === void 0) {
      targetPlaneSlice = 0;
    }
    this.source = source;
    this.target = target;
    this.mipLevels = mipLevels;
    this.numSlices = numSlices;
    this.targetMostDetailedMip = targetMostDetailedMip;
    this.targetFirstSlice = targetFirstSlice;
    this.targetPlaneSlice = targetPlaneSlice;
  }
  var _proto4 = UploadPair.prototype;
  _proto4.reset = function reset(target, mipLevels, numSlices, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    this.target = target;
    this.mipLevels = mipLevels;
    this.numSlices = numSlices;
    this.targetMostDetailedMip = targetMostDetailedMip;
    this.targetFirstSlice = targetFirstSlice;
    this.targetPlaneSlice = targetPlaneSlice;
  };
  return UploadPair;
}();
var MovePair = function () {
  function MovePair(source, target, mipLevels, numSlices, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    if (source === void 0) {
      source = '';
    }
    if (target === void 0) {
      target = '';
    }
    if (mipLevels === void 0) {
      mipLevels = 0xFFFFFFFF;
    }
    if (numSlices === void 0) {
      numSlices = 0xFFFFFFFF;
    }
    if (targetMostDetailedMip === void 0) {
      targetMostDetailedMip = 0;
    }
    if (targetFirstSlice === void 0) {
      targetFirstSlice = 0;
    }
    if (targetPlaneSlice === void 0) {
      targetPlaneSlice = 0;
    }
    this.source = source;
    this.target = target;
    this.mipLevels = mipLevels;
    this.numSlices = numSlices;
    this.targetMostDetailedMip = targetMostDetailedMip;
    this.targetFirstSlice = targetFirstSlice;
    this.targetPlaneSlice = targetPlaneSlice;
  }
  var _proto5 = MovePair.prototype;
  _proto5.reset = function reset(source, target, mipLevels, numSlices, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    this.source = source;
    this.target = target;
    this.mipLevels = mipLevels;
    this.numSlices = numSlices;
    this.targetMostDetailedMip = targetMostDetailedMip;
    this.targetFirstSlice = targetFirstSlice;
    this.targetPlaneSlice = targetPlaneSlice;
  };
  return MovePair;
}();
var PipelineStatistics = function () {
  function PipelineStatistics() {
    this.numRenderPasses = 0;
    this.numManagedTextures = 0;
    this.totalManagedTextures = 0;
    this.numUploadBuffers = 0;
    this.numUploadBufferViews = 0;
    this.numFreeUploadBuffers = 0;
    this.numFreeUploadBufferViews = 0;
    this.numDescriptorSets = 0;
    this.numFreeDescriptorSets = 0;
    this.numInstancingBuffers = 0;
    this.numInstancingUniformBlocks = 0;
  }
  var _proto6 = PipelineStatistics.prototype;
  _proto6.reset = function reset() {
    this.numRenderPasses = 0;
    this.numManagedTextures = 0;
    this.totalManagedTextures = 0;
    this.numUploadBuffers = 0;
    this.numUploadBufferViews = 0;
    this.numFreeUploadBuffers = 0;
    this.numFreeUploadBufferViews = 0;
    this.numDescriptorSets = 0;
    this.numFreeDescriptorSets = 0;
    this.numInstancingBuffers = 0;
    this.numInstancingUniformBlocks = 0;
  };
  return PipelineStatistics;
}();
function createPool$1(Constructor) {
  return new RecyclePool(function () {
    return new Constructor();
  }, 16);
}
var RenderCommonObjectPool = function () {
  function RenderCommonObjectPool() {
    this.li = createPool$1(LightInfo);
    this.rp = createPool$1(ResolvePair);
    this.cp = createPool$1(CopyPair);
    this.up = createPool$1(UploadPair);
    this.mp = createPool$1(MovePair);
    this.ps = createPool$1(PipelineStatistics);
  }
  var _proto7 = RenderCommonObjectPool.prototype;
  _proto7.reset = function reset() {
    this.li.reset();
    this.rp.reset();
    this.cp.reset();
    this.up.reset();
    this.mp.reset();
    this.ps.reset();
  };
  _proto7.createLightInfo = function createLightInfo(light, level, culledByLight, probe) {
    if (light === void 0) {
      light = null;
    }
    if (level === void 0) {
      level = 0;
    }
    if (culledByLight === void 0) {
      culledByLight = false;
    }
    if (probe === void 0) {
      probe = null;
    }
    var v = this.li.add();
    v.reset(light, level, culledByLight, probe);
    return v;
  };
  _proto7.createResolvePair = function createResolvePair(source, target, resolveFlags, mode, mode1) {
    if (source === void 0) {
      source = '';
    }
    if (target === void 0) {
      target = '';
    }
    if (resolveFlags === void 0) {
      resolveFlags = ResolveFlags.NONE;
    }
    if (mode === void 0) {
      mode = ResolveMode.SAMPLE_ZERO;
    }
    if (mode1 === void 0) {
      mode1 = ResolveMode.SAMPLE_ZERO;
    }
    var v = this.rp.add();
    v.reset(source, target, resolveFlags, mode, mode1);
    return v;
  };
  _proto7.createCopyPair = function createCopyPair(source, target, mipLevels, numSlices, sourceMostDetailedMip, sourceFirstSlice, sourcePlaneSlice, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    if (source === void 0) {
      source = '';
    }
    if (target === void 0) {
      target = '';
    }
    if (mipLevels === void 0) {
      mipLevels = 0xFFFFFFFF;
    }
    if (numSlices === void 0) {
      numSlices = 0xFFFFFFFF;
    }
    if (sourceMostDetailedMip === void 0) {
      sourceMostDetailedMip = 0;
    }
    if (sourceFirstSlice === void 0) {
      sourceFirstSlice = 0;
    }
    if (sourcePlaneSlice === void 0) {
      sourcePlaneSlice = 0;
    }
    if (targetMostDetailedMip === void 0) {
      targetMostDetailedMip = 0;
    }
    if (targetFirstSlice === void 0) {
      targetFirstSlice = 0;
    }
    if (targetPlaneSlice === void 0) {
      targetPlaneSlice = 0;
    }
    var v = this.cp.add();
    v.reset(source, target, mipLevels, numSlices, sourceMostDetailedMip, sourceFirstSlice, sourcePlaneSlice, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice);
    return v;
  };
  _proto7.createUploadPair = function createUploadPair(target, mipLevels, numSlices, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    if (target === void 0) {
      target = '';
    }
    if (mipLevels === void 0) {
      mipLevels = 0xFFFFFFFF;
    }
    if (numSlices === void 0) {
      numSlices = 0xFFFFFFFF;
    }
    if (targetMostDetailedMip === void 0) {
      targetMostDetailedMip = 0;
    }
    if (targetFirstSlice === void 0) {
      targetFirstSlice = 0;
    }
    if (targetPlaneSlice === void 0) {
      targetPlaneSlice = 0;
    }
    var v = this.up.add();
    v.reset(target, mipLevels, numSlices, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice);
    return v;
  };
  _proto7.createMovePair = function createMovePair(source, target, mipLevels, numSlices, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice) {
    if (source === void 0) {
      source = '';
    }
    if (target === void 0) {
      target = '';
    }
    if (mipLevels === void 0) {
      mipLevels = 0xFFFFFFFF;
    }
    if (numSlices === void 0) {
      numSlices = 0xFFFFFFFF;
    }
    if (targetMostDetailedMip === void 0) {
      targetMostDetailedMip = 0;
    }
    if (targetFirstSlice === void 0) {
      targetFirstSlice = 0;
    }
    if (targetPlaneSlice === void 0) {
      targetPlaneSlice = 0;
    }
    var v = this.mp.add();
    v.reset(source, target, mipLevels, numSlices, targetMostDetailedMip, targetFirstSlice, targetPlaneSlice);
    return v;
  };
  _proto7.createPipelineStatistics = function createPipelineStatistics() {
    var v = this.ps.add();
    v.reset();
    return v;
  };
  return RenderCommonObjectPool;
}();
function saveLightInfo(a, v) {
  a.n(v.level);
  a.b(v.culledByLight);
}
function loadLightInfo(a, v) {
  v.level = a.n();
  v.culledByLight = a.b();
}
function saveResolvePair(a, v) {
  a.s(v.source);
  a.s(v.target);
  a.n(v.resolveFlags);
  a.n(v.mode);
  a.n(v.mode1);
}
function loadResolvePair(a, v) {
  v.source = a.s();
  v.target = a.s();
  v.resolveFlags = a.n();
  v.mode = a.n();
  v.mode1 = a.n();
}
function saveCopyPair(a, v) {
  a.s(v.source);
  a.s(v.target);
  a.n(v.mipLevels);
  a.n(v.numSlices);
  a.n(v.sourceMostDetailedMip);
  a.n(v.sourceFirstSlice);
  a.n(v.sourcePlaneSlice);
  a.n(v.targetMostDetailedMip);
  a.n(v.targetFirstSlice);
  a.n(v.targetPlaneSlice);
}
function loadCopyPair(a, v) {
  v.source = a.s();
  v.target = a.s();
  v.mipLevels = a.n();
  v.numSlices = a.n();
  v.sourceMostDetailedMip = a.n();
  v.sourceFirstSlice = a.n();
  v.sourcePlaneSlice = a.n();
  v.targetMostDetailedMip = a.n();
  v.targetFirstSlice = a.n();
  v.targetPlaneSlice = a.n();
}
function saveMovePair(a, v) {
  a.s(v.source);
  a.s(v.target);
  a.n(v.mipLevels);
  a.n(v.numSlices);
  a.n(v.targetMostDetailedMip);
  a.n(v.targetFirstSlice);
  a.n(v.targetPlaneSlice);
}
function loadMovePair(a, v) {
  v.source = a.s();
  v.target = a.s();
  v.mipLevels = a.n();
  v.numSlices = a.n();
  v.targetMostDetailedMip = a.n();
  v.targetFirstSlice = a.n();
  v.targetPlaneSlice = a.n();
}
function savePipelineStatistics(a, v) {
  a.n(v.numRenderPasses);
  a.n(v.numManagedTextures);
  a.n(v.totalManagedTextures);
  a.n(v.numUploadBuffers);
  a.n(v.numUploadBufferViews);
  a.n(v.numFreeUploadBuffers);
  a.n(v.numFreeUploadBufferViews);
  a.n(v.numDescriptorSets);
  a.n(v.numFreeDescriptorSets);
  a.n(v.numInstancingBuffers);
  a.n(v.numInstancingUniformBlocks);
}
function loadPipelineStatistics(a, v) {
  v.numRenderPasses = a.n();
  v.numManagedTextures = a.n();
  v.totalManagedTextures = a.n();
  v.numUploadBuffers = a.n();
  v.numUploadBufferViews = a.n();
  v.numFreeUploadBuffers = a.n();
  v.numFreeUploadBufferViews = a.n();
  v.numDescriptorSets = a.n();
  v.numFreeDescriptorSets = a.n();
  v.numInstancingBuffers = a.n();
  v.numInstancingUniformBlocks = a.n();
}

var ED = function () {
  function ED(source, target) {
    this.source = void 0;
    this.target = void 0;
    this.source = source;
    this.target = target;
  }
  var _proto = ED.prototype;
  _proto.equals = function equals(rhs) {
    return this.source === rhs.source && this.target === rhs.target;
  };
  return ED;
}();
var OutE = function () {
  function OutE(target) {
    this.target = void 0;
    this.target = target;
  }
  var _proto3 = OutE.prototype;
  _proto3.equals = function equals(rhs) {
    return this.target === rhs.target;
  };
  return OutE;
}();
var OutEI = function () {
  function OutEI(iterator, source) {
    this.iterator = void 0;
    this.source = void 0;
    this.iterator = iterator;
    this.source = source;
  }
  var _proto5 = OutEI.prototype;
  _proto5[Symbol.iterator] = function () {
    return this;
  };
  _proto5.next = function next() {
    var res = this.iterator.next();
    if (res.done) {
      return {
        value: undefined,
        done: true
      };
    } else {
      return {
        value: new ED(this.source, res.value.target),
        done: false
      };
    }
  };
  return OutEI;
}();
var InEI = function () {
  function InEI(iterator, source) {
    this.iterator = void 0;
    this.source = void 0;
    this.iterator = iterator;
    this.source = source;
  }
  var _proto7 = InEI.prototype;
  _proto7[Symbol.iterator] = function () {
    return this;
  };
  _proto7.next = function next() {
    var res = this.iterator.next();
    if (res.done) {
      return {
        value: undefined,
        done: true
      };
    } else {
      return {
        value: new ED(res.value.target, this.source),
        done: false
      };
    }
  };
  return InEI;
}();
var AdjI = function () {
  function AdjI(graph, iterator) {
    this.graph = void 0;
    this.iterator = void 0;
    this.graph = graph;
    this.iterator = iterator;
  }
  var _proto9 = AdjI.prototype;
  _proto9[Symbol.iterator] = function () {
    return this;
  };
  _proto9.next = function next() {
    var res = this.iterator.next();
    if (res.done) {
      return {
        value: undefined,
        done: true
      };
    } else {
      return {
        value: this.graph.target(res.value),
        done: false
      };
    }
  };
  return AdjI;
}();
function getPath(g, v) {
  if (v === g.N) {
    return '';
  }
  var paths = [];
  for (; v !== g.N; v = g.getParent(v)) {
    paths.push(g.vertexName(v));
  }
  var path = '';
  for (var i = paths.length; i-- > 0;) {
    path += '/';
    path += paths[i];
  }
  return path;
}
function findRelative(g, v, path) {
  var pseudo = g.N;
  var names = path.split('/');
  if (names.length === 0) {
    return v;
  }
  var curr = v;
  var start = 0;
  if (names[0] === '') {
    curr = pseudo;
    ++start;
  }
  for (var i = start; i !== names.length; ++i) {
    var _name = names[i];
    if (_name === '') {
      continue;
    }
    if (_name === '.') {
      continue;
    }
    if (_name === '..') {
      if (curr === pseudo) {
        return pseudo;
      }
      curr = g.getParent(curr);
      continue;
    }
    curr = g.locateChild(curr, _name);
    if (curr === pseudo) {
      return pseudo;
    }
  }
  return curr;
}
var NoTermination = function () {
  function NoTermination() {}
  var _proto1 = NoTermination.prototype;
  _proto1.terminate = function terminate(v, g) {
    return false;
  };
  return NoTermination;
}();
function getDefaultStartingVertex(g) {
  var iter = g.v();
  var v = iter.next();
  if (v.done) {
    return g.N;
  } else {
    return v.value;
  }
}
var GraphColor;
(function (GraphColor) {
  GraphColor[GraphColor["WHITE"] = 0] = "WHITE";
  GraphColor[GraphColor["GRAY"] = 1] = "GRAY";
  GraphColor[GraphColor["GREEN"] = 2] = "GREEN";
  GraphColor[GraphColor["RED"] = 3] = "RED";
  GraphColor[GraphColor["BLACK"] = 4] = "BLACK";
})(GraphColor || (GraphColor = {}));
var VertexInfo = function VertexInfo(v, e, iter) {
  this.v = void 0;
  this.e = void 0;
  this.iter = void 0;
  this.v = v;
  this.e = e;
  this.iter = iter;
};
function depthFirstVisitImpl(g, u, visitor, color, func) {
  var srcE = null;
  var ei = null;
  var stack = new Array();
  color.put(u, GraphColor.GRAY);
  visitor.discoverVertex(u, g);
  ei = g.oe(u);
  if (func.terminate(u, g)) {
    stack.push(new VertexInfo(u, null, null));
  } else {
    stack.push(new VertexInfo(u, null, ei));
  }
  while (stack.length) {
    var back = stack.pop();
    u = back.v;
    srcE = back.e;
    ei = back.iter;
    if (srcE !== null) {
      visitor.finishEdge(srcE, g);
    }
    if (ei) {
      for (var ev = ei.next(); !ev.done; ev = ei.next()) {
        var _e2 = ev.value;
        var _v = _e2.target;
        visitor.examineEdge(_e2, g);
        var vColor = color.get(_v);
        if (vColor === GraphColor.WHITE) {
          visitor.treeEdge(_e2, g);
          srcE = _e2;
          stack.push(new VertexInfo(u, srcE, ei));
          u = _v;
          color.put(u, GraphColor.GRAY);
          visitor.discoverVertex(u, g);
          ei = g.oe(u);
          if (func.terminate(u, g)) {
            break;
          }
        } else {
          if (vColor === GraphColor.GRAY) {
            visitor.backEdge(_e2, g);
          } else {
            visitor.forwardOrCrossEdge(_e2, g);
          }
          visitor.finishEdge(_e2, g);
        }
      }
    }
    color.put(u, GraphColor.BLACK);
    visitor.finishVertex(u, g);
  }
}
function depthFirstSearch(g, visitor, color, startVertex) {
  if (startVertex === void 0) {
    startVertex = null;
  }
  startVertex = startVertex || getDefaultStartingVertex(g);
  if (startVertex === null || g.nv() === 0) {
    return;
  }
  for (var _iterator2 = _createForOfIteratorHelperLoose(g.v()), _step2; !(_step2 = _iterator2()).done;) {
    var _u = _step2.value;
    color.put(_u, GraphColor.WHITE);
    visitor.initializeVertex(_u, g);
  }
  var terminator = new NoTermination();
  if (startVertex !== getDefaultStartingVertex(g)) {
    visitor.startVertex(startVertex, g);
    depthFirstVisitImpl(g, startVertex, visitor, color, terminator);
  }
  for (var _iterator3 = _createForOfIteratorHelperLoose(g.v()), _step3; !(_step3 = _iterator3()).done;) {
    var _u2 = _step3.value;
    if (color.get(_u2) === GraphColor.WHITE) {
      visitor.startVertex(_u2, g);
      depthFirstVisitImpl(g, _u2, visitor, color, terminator);
    }
  }
}
var DefaultVisitor = function () {
  function DefaultVisitor() {}
  var _proto10 = DefaultVisitor.prototype;
  _proto10.initializeVertex = function initializeVertex(v, g) {};
  _proto10.startVertex = function startVertex(v, g) {};
  _proto10.discoverVertex = function discoverVertex(v, g) {};
  _proto10.examineEdge = function examineEdge(e, g) {};
  _proto10.treeEdge = function treeEdge(e, g) {};
  _proto10.backEdge = function backEdge(e, g) {};
  _proto10.forwardOrCrossEdge = function forwardOrCrossEdge(e, g) {};
  _proto10.finishEdge = function finishEdge(e, g) {};
  _proto10.finishVertex = function finishVertex(v, g) {};
  return DefaultVisitor;
}();
var ReferenceGraphView = function () {
  function ReferenceGraphView(g) {
    this.g = void 0;
    this.g = g;
    this.N = g.N;
  }
  var _proto11 = ReferenceGraphView.prototype;
  _proto11.edge = function edge(u, v) {
    return this.g.reference(u, v);
  };
  _proto11.source = function source(e) {
    return this.g.parent(e);
  };
  _proto11.target = function target(e) {
    return this.g.child(e);
  };
  _proto11.oe = function oe(v) {
    return this.g.children(v);
  };
  _proto11.od = function od(v) {
    return this.g.numChildren(v);
  };
  _proto11.v = function v() {
    return this.g.v();
  };
  _proto11.nv = function nv() {
    return this.g.nv();
  };
  return ReferenceGraphView;
}();

function resetColor(v) {
  v.x = 0;
  v.y = 0;
  v.z = 0;
  v.w = 0;
}
function resetViewport(v) {
  v.left = 0;
  v.top = 0;
  v.width = 0;
  v.height = 0;
  v.minDepth = 0;
  v.maxDepth = 1;
}
var ClearValue = function () {
  function ClearValue(x, y, z, w) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (z === void 0) {
      z = 0;
    }
    if (w === void 0) {
      w = 0;
    }
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  var _proto = ClearValue.prototype;
  _proto.reset = function reset(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  };
  return ClearValue;
}();
var RasterView = function () {
  function RasterView(slotName, accessType, attachmentType, loadOp, storeOp, clearFlags, clearColor, shaderStageFlags) {
    if (slotName === void 0) {
      slotName = '';
    }
    if (accessType === void 0) {
      accessType = AccessType.WRITE;
    }
    if (attachmentType === void 0) {
      attachmentType = AttachmentType.RENDER_TARGET;
    }
    if (loadOp === void 0) {
      loadOp = LoadOp.LOAD;
    }
    if (storeOp === void 0) {
      storeOp = StoreOp.STORE;
    }
    if (clearFlags === void 0) {
      clearFlags = ClearFlagBit.ALL;
    }
    if (clearColor === void 0) {
      clearColor = new Color();
    }
    if (shaderStageFlags === void 0) {
      shaderStageFlags = ShaderStageFlagBit.NONE;
    }
    this.slotName1 = '';
    this.slotID = 0;
    this.slotName = slotName;
    this.accessType = accessType;
    this.attachmentType = attachmentType;
    this.loadOp = loadOp;
    this.storeOp = storeOp;
    this.clearFlags = clearFlags;
    this.clearColor = clearColor;
    this.shaderStageFlags = shaderStageFlags;
  }
  var _proto2 = RasterView.prototype;
  _proto2.reset = function reset(slotName, accessType, attachmentType, loadOp, storeOp, clearFlags, shaderStageFlags) {
    this.slotName = slotName;
    this.slotName1 = '';
    this.accessType = accessType;
    this.attachmentType = attachmentType;
    this.loadOp = loadOp;
    this.storeOp = storeOp;
    this.clearFlags = clearFlags;
    resetColor(this.clearColor);
    this.slotID = 0;
    this.shaderStageFlags = shaderStageFlags;
  };
  return RasterView;
}();
var ComputeView = function () {
  function ComputeView(name, accessType, clearFlags, clearValueType, clearValue, shaderStageFlags) {
    if (name === void 0) {
      name = '';
    }
    if (accessType === void 0) {
      accessType = AccessType.READ;
    }
    if (clearFlags === void 0) {
      clearFlags = ClearFlagBit.NONE;
    }
    if (clearValueType === void 0) {
      clearValueType = ClearValueType.NONE;
    }
    if (clearValue === void 0) {
      clearValue = new ClearValue();
    }
    if (shaderStageFlags === void 0) {
      shaderStageFlags = ShaderStageFlagBit.NONE;
    }
    this.plane = 0;
    this.name = name;
    this.accessType = accessType;
    this.clearFlags = clearFlags;
    this.clearValueType = clearValueType;
    this.clearValue = clearValue;
    this.shaderStageFlags = shaderStageFlags;
  }
  var _proto3 = ComputeView.prototype;
  _proto3.reset = function reset(name, accessType, clearFlags, clearValueType, shaderStageFlags) {
    this.name = name;
    this.accessType = accessType;
    this.plane = 0;
    this.clearFlags = clearFlags;
    this.clearValueType = clearValueType;
    this.clearValue.reset(0, 0, 0, 0);
    this.shaderStageFlags = shaderStageFlags;
  };
  return ComputeView;
}();
var ResourceDesc = function () {
  function ResourceDesc() {
    this.dimension = ResourceDimension.BUFFER;
    this.alignment = 0;
    this.width = 0;
    this.height = 0;
    this.depthOrArraySize = 0;
    this.mipLevels = 0;
    this.format = Format.UNKNOWN;
    this.sampleCount = SampleCount.X1;
    this.textureFlags = TextureFlagBit.NONE;
    this.flags = ResourceFlags.NONE;
    this.viewType = TextureType.TEX2D;
  }
  var _proto4 = ResourceDesc.prototype;
  _proto4.reset = function reset() {
    this.dimension = ResourceDimension.BUFFER;
    this.alignment = 0;
    this.width = 0;
    this.height = 0;
    this.depthOrArraySize = 0;
    this.mipLevels = 0;
    this.format = Format.UNKNOWN;
    this.sampleCount = SampleCount.X1;
    this.textureFlags = TextureFlagBit.NONE;
    this.flags = ResourceFlags.NONE;
    this.viewType = TextureType.TEX2D;
  };
  return ResourceDesc;
}();
var ResourceTraits = function () {
  function ResourceTraits(residency) {
    if (residency === void 0) {
      residency = ResourceResidency.MANAGED;
    }
    this.residency = residency;
  }
  var _proto5 = ResourceTraits.prototype;
  _proto5.reset = function reset(residency) {
    this.residency = residency;
  };
  return ResourceTraits;
}();
var RenderSwapchain = function () {
  function RenderSwapchain(swapchain, isDepthStencil) {
    if (swapchain === void 0) {
      swapchain = null;
    }
    if (isDepthStencil === void 0) {
      isDepthStencil = false;
    }
    this.renderWindow = null;
    this.currentID = 0;
    this.numBackBuffers = 0;
    this.generation = 0xFFFFFFFF;
    this.swapchain = swapchain;
    this.isDepthStencil = isDepthStencil;
  }
  var _proto6 = RenderSwapchain.prototype;
  _proto6.reset = function reset(swapchain, isDepthStencil) {
    this.swapchain = swapchain;
    this.renderWindow = null;
    this.currentID = 0;
    this.numBackBuffers = 0;
    this.generation = 0xFFFFFFFF;
    this.isDepthStencil = isDepthStencil;
  };
  return RenderSwapchain;
}();
var ResourceStates = function () {
  function ResourceStates() {
    this.states = AccessFlagBit.NONE;
  }
  var _proto7 = ResourceStates.prototype;
  _proto7.reset = function reset() {
    this.states = AccessFlagBit.NONE;
  };
  return ResourceStates;
}();
var ManagedBuffer = function () {
  function ManagedBuffer(buffer) {
    if (buffer === void 0) {
      buffer = null;
    }
    this.fenceValue = 0;
    this.buffer = buffer;
  }
  var _proto8 = ManagedBuffer.prototype;
  _proto8.reset = function reset(buffer) {
    this.buffer = buffer;
    this.fenceValue = 0;
  };
  return ManagedBuffer;
}();
var PersistentBuffer = function () {
  function PersistentBuffer(buffer) {
    if (buffer === void 0) {
      buffer = null;
    }
    this.fenceValue = 0;
    this.buffer = buffer;
  }
  var _proto9 = PersistentBuffer.prototype;
  _proto9.reset = function reset(buffer) {
    this.buffer = buffer;
    this.fenceValue = 0;
  };
  return PersistentBuffer;
}();
var ManagedTexture = function () {
  function ManagedTexture(texture) {
    if (texture === void 0) {
      texture = null;
    }
    this.fenceValue = 0;
    this.texture = texture;
  }
  var _proto0 = ManagedTexture.prototype;
  _proto0.reset = function reset(texture) {
    this.texture = texture;
    this.fenceValue = 0;
  };
  return ManagedTexture;
}();
var PersistentTexture = function () {
  function PersistentTexture(texture) {
    if (texture === void 0) {
      texture = null;
    }
    this.fenceValue = 0;
    this.texture = texture;
  }
  var _proto1 = PersistentTexture.prototype;
  _proto1.reset = function reset(texture) {
    this.texture = texture;
    this.fenceValue = 0;
  };
  return PersistentTexture;
}();
var ManagedResource = function () {
  function ManagedResource() {
    this.unused = 0;
  }
  var _proto10 = ManagedResource.prototype;
  _proto10.reset = function reset() {
    this.unused = 0;
  };
  return ManagedResource;
}();
var Subpass = function () {
  function Subpass() {
    this.rasterViews = new Map();
    this.computeViews = new Map();
    this.resolvePairs = [];
  }
  var _proto11 = Subpass.prototype;
  _proto11.reset = function reset() {
    this.rasterViews.clear();
    this.computeViews.clear();
    this.resolvePairs.length = 0;
  };
  return Subpass;
}();
var SubpassGraphVertex = function SubpassGraphVertex() {
  this.o = [];
  this.i = [];
};
var SubpassGraph = function () {
  function SubpassGraph() {
    this.N = 0xFFFFFFFF;
    this.x = [];
    this._names = [];
    this._subpasses = [];
  }
  var _proto12 = SubpassGraph.prototype;
  _proto12.edge = function edge(u, v) {
    for (var _iterator = _createForOfIteratorHelperLoose(this.x[u].o), _step; !(_step = _iterator()).done;) {
      var oe = _step.value;
      if (v === oe.target) {
        return true;
      }
    }
    return false;
  };
  _proto12.source = function source(e) {
    return e.source;
  };
  _proto12.target = function target(e) {
    return e.target;
  };
  _proto12.oe = function oe(v) {
    return new OutEI(this.x[v].o.values(), v);
  };
  _proto12.od = function od(v) {
    return this.x[v].o.length;
  };
  _proto12.ie = function ie(v) {
    return new InEI(this.x[v].i.values(), v);
  };
  _proto12.id = function id(v) {
    return this.x[v].i.length;
  };
  _proto12.d = function d(v) {
    return this.od(v) + this.id(v);
  };
  _proto12.adj = function adj(v) {
    return new AdjI(this, this.oe(v));
  };
  _proto12.v = function v() {
    return this.x.keys();
  };
  _proto12.nv = function nv() {
    return this.x.length;
  };
  _proto12.ne = function ne() {
    var numEdges = 0;
    for (var _iterator2 = _createForOfIteratorHelperLoose(this.v()), _step2; !(_step2 = _iterator2()).done;) {
      var v = _step2.value;
      numEdges += this.od(v);
    }
    return numEdges;
  };
  _proto12.clear = function clear() {
    this._names.length = 0;
    this._subpasses.length = 0;
    this.x.length = 0;
  };
  _proto12.addVertex = function addVertex(name, subpass) {
    var vert = new SubpassGraphVertex();
    var v = this.x.length;
    this.x.push(vert);
    this._names.push(name);
    this._subpasses.push(subpass);
    return v;
  };
  _proto12.addEdge = function addEdge(u, v) {
    this.x[u].o.push(new OutE(v));
    this.x[v].i.push(new OutE(u));
    return new ED(u, v);
  };
  _proto12.vertexName = function vertexName(v) {
    return this._names[v];
  };
  _proto12.getName = function getName(v) {
    return this._names[v];
  };
  _proto12.setName = function setName(v, value) {
    this._names[v] = value;
  };
  _proto12.getSubpass = function getSubpass(v) {
    return this._subpasses[v];
  };
  return SubpassGraph;
}();
var RasterSubpass = function () {
  function RasterSubpass(subpassID, count, quality) {
    if (subpassID === void 0) {
      subpassID = 0xFFFFFFFF;
    }
    if (count === void 0) {
      count = 1;
    }
    if (quality === void 0) {
      quality = 0;
    }
    this.rasterViews = new Map();
    this.computeViews = new Map();
    this.resolvePairs = [];
    this.viewport = new Viewport();
    this.showStatistics = false;
    this.subpassID = subpassID;
    this.count = count;
    this.quality = quality;
  }
  var _proto13 = RasterSubpass.prototype;
  _proto13.reset = function reset(subpassID, count, quality) {
    this.rasterViews.clear();
    this.computeViews.clear();
    this.resolvePairs.length = 0;
    resetViewport(this.viewport);
    this.subpassID = subpassID;
    this.count = count;
    this.quality = quality;
    this.showStatistics = false;
  };
  return RasterSubpass;
}();
var ComputeSubpass = function () {
  function ComputeSubpass(subpassID) {
    if (subpassID === void 0) {
      subpassID = 0xFFFFFFFF;
    }
    this.rasterViews = new Map();
    this.computeViews = new Map();
    this.subpassID = subpassID;
  }
  var _proto14 = ComputeSubpass.prototype;
  _proto14.reset = function reset(subpassID) {
    this.rasterViews.clear();
    this.computeViews.clear();
    this.subpassID = subpassID;
  };
  return ComputeSubpass;
}();
var RasterPass = function () {
  function RasterPass() {
    this.rasterViews = new Map();
    this.computeViews = new Map();
    this.attachmentIndexMap = new Map();
    this.textures = new Map();
    this.subpassGraph = new SubpassGraph();
    this.width = 0;
    this.height = 0;
    this.count = 1;
    this.quality = 0;
    this.viewport = new Viewport();
    this.versionName = '';
    this.version = 0;
    this.hashValue = 0;
    this.showStatistics = false;
  }
  var _proto15 = RasterPass.prototype;
  _proto15.reset = function reset() {
    this.rasterViews.clear();
    this.computeViews.clear();
    this.attachmentIndexMap.clear();
    this.textures.clear();
    this.subpassGraph.clear();
    this.width = 0;
    this.height = 0;
    this.count = 1;
    this.quality = 0;
    resetViewport(this.viewport);
    this.versionName = '';
    this.version = 0;
    this.hashValue = 0;
    this.showStatistics = false;
  };
  return RasterPass;
}();
var PersistentRenderPassAndFramebuffer = function () {
  function PersistentRenderPassAndFramebuffer(renderPass, framebuffer) {
    if (renderPass === void 0) {
      renderPass = null;
    }
    if (framebuffer === void 0) {
      framebuffer = null;
    }
    this.clearColors = [];
    this.clearDepth = 0;
    this.clearStencil = 0;
    this.renderPass = renderPass;
    this.framebuffer = framebuffer;
  }
  var _proto16 = PersistentRenderPassAndFramebuffer.prototype;
  _proto16.reset = function reset(renderPass, framebuffer) {
    this.renderPass = renderPass;
    this.framebuffer = framebuffer;
    this.clearColors.length = 0;
    this.clearDepth = 0;
    this.clearStencil = 0;
  };
  return PersistentRenderPassAndFramebuffer;
}();
var FormatView = function () {
  function FormatView() {
    this.format = Format.UNKNOWN;
  }
  var _proto17 = FormatView.prototype;
  _proto17.reset = function reset() {
    this.format = Format.UNKNOWN;
  };
  return FormatView;
}();
var SubresourceView = function () {
  function SubresourceView() {
    this.textureView = null;
    this.format = Format.UNKNOWN;
    this.indexOrFirstMipLevel = 0;
    this.numMipLevels = 0;
    this.firstArraySlice = 0;
    this.numArraySlices = 0;
    this.firstPlane = 0;
    this.numPlanes = 0;
  }
  var _proto18 = SubresourceView.prototype;
  _proto18.reset = function reset() {
    this.textureView = null;
    this.format = Format.UNKNOWN;
    this.indexOrFirstMipLevel = 0;
    this.numMipLevels = 0;
    this.firstArraySlice = 0;
    this.numArraySlices = 0;
    this.firstPlane = 0;
    this.numPlanes = 0;
  };
  return SubresourceView;
}();
var ResourceGraphValue = {
  Managed: 0,
  ManagedBuffer: 1,
  ManagedTexture: 2,
  PersistentBuffer: 3,
  PersistentTexture: 4,
  Framebuffer: 5,
  Swapchain: 6,
  FormatView: 7,
  SubresourceView: 8
};
var ResourceGraphVertex = function ResourceGraphVertex(id, object) {
  this.o = [];
  this.i = [];
  this.t = void 0;
  this.j = void 0;
  this.id = id;
  this.object = object;
  this.t = id;
  this.j = object;
};
var ResourceGraph = function () {
  function ResourceGraph() {
    this.N = 0xFFFFFFFF;
    this.x = [];
    this._names = [];
    this._descs = [];
    this._traits = [];
    this._states = [];
    this._samplerInfo = [];
    this._valueIndex = new Map();
    this.renderPasses = new Map();
    this.nextFenceValue = 0;
    this.version = 0;
  }
  var _proto19 = ResourceGraph.prototype;
  _proto19.edge = function edge(u, v) {
    for (var _iterator3 = _createForOfIteratorHelperLoose(this.x[u].o), _step3; !(_step3 = _iterator3()).done;) {
      var oe = _step3.value;
      if (v === oe.target) {
        return true;
      }
    }
    return false;
  };
  _proto19.source = function source(e) {
    return e.source;
  };
  _proto19.target = function target(e) {
    return e.target;
  };
  _proto19.oe = function oe(v) {
    return new OutEI(this.x[v].o.values(), v);
  };
  _proto19.od = function od(v) {
    return this.x[v].o.length;
  };
  _proto19.ie = function ie(v) {
    return new InEI(this.x[v].i.values(), v);
  };
  _proto19.id = function id(v) {
    return this.x[v].i.length;
  };
  _proto19.d = function d(v) {
    return this.od(v) + this.id(v);
  };
  _proto19.adj = function adj(v) {
    return new AdjI(this, this.oe(v));
  };
  _proto19.v = function v() {
    return this.x.keys();
  };
  _proto19.nv = function nv() {
    return this.x.length;
  };
  _proto19.ne = function ne() {
    var numEdges = 0;
    for (var _iterator4 = _createForOfIteratorHelperLoose(this.v()), _step4; !(_step4 = _iterator4()).done;) {
      var v = _step4.value;
      numEdges += this.od(v);
    }
    return numEdges;
  };
  _proto19.clear = function clear() {
    this.renderPasses.clear();
    this.nextFenceValue = 0;
    this.version = 0;
    this._valueIndex.clear();
    this._names.length = 0;
    this._descs.length = 0;
    this._traits.length = 0;
    this._states.length = 0;
    this._samplerInfo.length = 0;
    this.x.length = 0;
  };
  _proto19.addVertex = function addVertex(id, object, name, desc, traits, states, sampler, u) {
    if (u === void 0) {
      u = 0xFFFFFFFF;
    }
    var vert = new ResourceGraphVertex(id, object);
    var v = this.x.length;
    this.x.push(vert);
    this._names.push(name);
    this._descs.push(desc);
    this._traits.push(traits);
    this._states.push(states);
    this._samplerInfo.push(sampler);
    this._valueIndex.set(name, v);
    if (u !== 0xFFFFFFFF) {
      this.addEdge(u, v);
    }
    return v;
  };
  _proto19.addEdge = function addEdge(u, v) {
    this.x[u].o.push(new OutE(v));
    this.x[v].i.push(new OutE(u));
    return new ED(u, v);
  };
  _proto19.vertexName = function vertexName(v) {
    return this._names[v];
  };
  _proto19.getName = function getName(v) {
    return this._names[v];
  };
  _proto19.setName = function setName(v, value) {
    this._names[v] = value;
  };
  _proto19.getDesc = function getDesc(v) {
    return this._descs[v];
  };
  _proto19.getTraits = function getTraits(v) {
    return this._traits[v];
  };
  _proto19.getStates = function getStates(v) {
    return this._states[v];
  };
  _proto19.getSampler = function getSampler(v) {
    return this._samplerInfo[v];
  };
  _proto19.h = function h(id, v) {
    return this.x[v].t === id;
  };
  _proto19.w = function w(v) {
    return this.x[v].t;
  };
  _proto19.object = function object(v) {
    return this.x[v].j;
  };
  _proto19.value = function value(id, v) {
    if (this.x[v].t === id) {
      return this.x[v].j;
    } else {
      throw Error('value id not match');
    }
  };
  _proto19.visitVertex = function visitVertex(visitor, v) {
    var vert = this.x[v];
    switch (vert.t) {
      case ResourceGraphValue.Managed:
        return visitor.managed(vert.j);
      case ResourceGraphValue.ManagedBuffer:
        return visitor.managedBuffer(vert.j);
      case ResourceGraphValue.ManagedTexture:
        return visitor.managedTexture(vert.j);
      case ResourceGraphValue.PersistentBuffer:
        return visitor.persistentBuffer(vert.j);
      case ResourceGraphValue.PersistentTexture:
        return visitor.persistentTexture(vert.j);
      case ResourceGraphValue.Framebuffer:
        return visitor.framebuffer(vert.j);
      case ResourceGraphValue.Swapchain:
        return visitor.swapchain(vert.j);
      case ResourceGraphValue.FormatView:
        return visitor.formatView(vert.j);
      case ResourceGraphValue.SubresourceView:
        return visitor.subresourceView(vert.j);
      default:
        throw Error('polymorphic type not found');
    }
  };
  _proto19.j = function j(v) {
    return this.x[v].j;
  };
  _proto19.reference = function reference(u, v) {
    for (var _iterator5 = _createForOfIteratorHelperLoose(this.x[u].o), _step5; !(_step5 = _iterator5()).done;) {
      var oe = _step5.value;
      if (v === oe.target) {
        return true;
      }
    }
    return false;
  };
  _proto19.parent = function parent(e) {
    return e.source;
  };
  _proto19.child = function child(e) {
    return e.target;
  };
  _proto19.children = function children(v) {
    return new OutEI(this.x[v].o.values(), v);
  };
  _proto19.numChildren = function numChildren(v) {
    return this.x[v].o.length;
  };
  _proto19.getParent = function getParent(v) {
    if (v === 0xFFFFFFFF) {
      return 0xFFFFFFFF;
    }
    var list = this.x[v].i;
    if (list.length === 0) {
      return 0xFFFFFFFF;
    } else {
      return list[0].target;
    }
  };
  _proto19.addReference = function addReference(u, v) {
    return this.addEdge(u, v);
  };
  _proto19.contains = function contains(key) {
    return this._valueIndex.has(key);
  };
  _proto19.vertex = function vertex(key) {
    return this._valueIndex.get(key);
  };
  _proto19.find = function find(key) {
    var v = this._valueIndex.get(key);
    if (v === undefined) return 0xFFFFFFFF;
    return v;
  };
  return ResourceGraph;
}();
var ComputePass = function () {
  function ComputePass() {
    this.computeViews = new Map();
    this.textures = new Map();
  }
  var _proto20 = ComputePass.prototype;
  _proto20.reset = function reset() {
    this.computeViews.clear();
    this.textures.clear();
  };
  return ComputePass;
}();
var ResolvePass = function () {
  function ResolvePass() {
    this.resolvePairs = [];
  }
  var _proto21 = ResolvePass.prototype;
  _proto21.reset = function reset() {
    this.resolvePairs.length = 0;
  };
  return ResolvePass;
}();
var CopyPass = function () {
  function CopyPass() {
    this.copyPairs = [];
    this.uploadPairs = [];
  }
  var _proto22 = CopyPass.prototype;
  _proto22.reset = function reset() {
    this.copyPairs.length = 0;
    this.uploadPairs.length = 0;
  };
  return CopyPass;
}();
var MovePass = function () {
  function MovePass() {
    this.movePairs = [];
  }
  var _proto23 = MovePass.prototype;
  _proto23.reset = function reset() {
    this.movePairs.length = 0;
  };
  return MovePass;
}();
var RaytracePass = function () {
  function RaytracePass() {
    this.computeViews = new Map();
  }
  var _proto24 = RaytracePass.prototype;
  _proto24.reset = function reset() {
    this.computeViews.clear();
  };
  return RaytracePass;
}();
var ClearView = function () {
  function ClearView(slotName, clearFlags, clearColor) {
    if (slotName === void 0) {
      slotName = '';
    }
    if (clearFlags === void 0) {
      clearFlags = ClearFlagBit.ALL;
    }
    if (clearColor === void 0) {
      clearColor = new Color();
    }
    this.slotName = slotName;
    this.clearFlags = clearFlags;
    this.clearColor = clearColor;
  }
  var _proto25 = ClearView.prototype;
  _proto25.reset = function reset(slotName, clearFlags) {
    this.slotName = slotName;
    this.clearFlags = clearFlags;
    resetColor(this.clearColor);
  };
  return ClearView;
}();
var RenderQueue$1 = function () {
  function RenderQueue(hint, phaseID, passLayoutID) {
    if (hint === void 0) {
      hint = QueueHint.RENDER_OPAQUE;
    }
    if (phaseID === void 0) {
      phaseID = 0xFFFFFFFF;
    }
    if (passLayoutID === void 0) {
      passLayoutID = 0xFFFFFFFF;
    }
    this.viewport = null;
    this.hint = hint;
    this.phaseID = phaseID;
    this.passLayoutID = passLayoutID;
  }
  var _proto26 = RenderQueue.prototype;
  _proto26.reset = function reset(hint, phaseID, passLayoutID) {
    this.hint = hint;
    this.phaseID = phaseID;
    this.passLayoutID = passLayoutID;
    this.viewport = null;
  };
  return RenderQueue;
}();
var CullingFlags = {
  CAMERA_FRUSTUM: 1,
  LIGHT_BOUNDS: 4
};
var SceneData = function () {
  function SceneData(scene, camera, flags, light, cullingFlags, shadingLight) {
    if (scene === void 0) {
      scene = null;
    }
    if (camera === void 0) {
      camera = null;
    }
    if (flags === void 0) {
      flags = SceneFlags.NONE;
    }
    if (light === void 0) {
      light = new LightInfo();
    }
    if (cullingFlags === void 0) {
      cullingFlags = CullingFlags.CAMERA_FRUSTUM;
    }
    if (shadingLight === void 0) {
      shadingLight = null;
    }
    this.scene = scene;
    this.camera = camera;
    this.light = light;
    this.flags = flags;
    this.cullingFlags = cullingFlags;
    this.shadingLight = shadingLight;
  }
  var _proto27 = SceneData.prototype;
  _proto27.reset = function reset(scene, camera, flags, cullingFlags, shadingLight) {
    this.scene = scene;
    this.camera = camera;
    this.light.reset(null, 0, false, null);
    this.flags = flags;
    this.cullingFlags = cullingFlags;
    this.shadingLight = shadingLight;
  };
  return SceneData;
}();
var Dispatch = function () {
  function Dispatch(material, passID, threadGroupCountX, threadGroupCountY, threadGroupCountZ) {
    if (material === void 0) {
      material = null;
    }
    if (passID === void 0) {
      passID = 0;
    }
    if (threadGroupCountX === void 0) {
      threadGroupCountX = 0;
    }
    if (threadGroupCountY === void 0) {
      threadGroupCountY = 0;
    }
    if (threadGroupCountZ === void 0) {
      threadGroupCountZ = 0;
    }
    this.material = material;
    this.passID = passID;
    this.threadGroupCountX = threadGroupCountX;
    this.threadGroupCountY = threadGroupCountY;
    this.threadGroupCountZ = threadGroupCountZ;
  }
  var _proto28 = Dispatch.prototype;
  _proto28.reset = function reset(material, passID, threadGroupCountX, threadGroupCountY, threadGroupCountZ) {
    this.material = material;
    this.passID = passID;
    this.threadGroupCountX = threadGroupCountX;
    this.threadGroupCountY = threadGroupCountY;
    this.threadGroupCountZ = threadGroupCountZ;
  };
  return Dispatch;
}();
var BlitType = {
  FULLSCREEN_QUAD: 0,
  DRAW_2D: 1,
  DRAW_PROFILE: 2,
  DRAW_3D: 3
};
var Blit = function () {
  function Blit(material, passID, sceneFlags, camera, blitType) {
    if (material === void 0) {
      material = null;
    }
    if (passID === void 0) {
      passID = 0;
    }
    if (sceneFlags === void 0) {
      sceneFlags = SceneFlags.NONE;
    }
    if (camera === void 0) {
      camera = null;
    }
    if (blitType === void 0) {
      blitType = BlitType.FULLSCREEN_QUAD;
    }
    this.models = [];
    this.material = material;
    this.passID = passID;
    this.sceneFlags = sceneFlags;
    this.camera = camera;
    this.blitType = blitType;
  }
  var _proto29 = Blit.prototype;
  _proto29.reset = function reset(material, passID, sceneFlags, camera, blitType) {
    this.material = material;
    this.passID = passID;
    this.sceneFlags = sceneFlags;
    this.camera = camera;
    this.blitType = blitType;
    this.models.length = 0;
  };
  return Blit;
}();
var RenderData = function () {
  function RenderData() {
    this.constants = new Map();
    this.buffers = new Map();
    this.textures = new Map();
    this.samplers = new Map();
    this.custom = '';
  }
  var _proto30 = RenderData.prototype;
  _proto30.reset = function reset() {
    this.constants.clear();
    this.buffers.clear();
    this.textures.clear();
    this.samplers.clear();
    this.custom = '';
  };
  return RenderData;
}();
var RenderGraphValue = {
  RasterPass: 0,
  RasterSubpass: 1,
  ComputeSubpass: 2,
  Compute: 3,
  Resolve: 4,
  Copy: 5,
  Move: 6,
  Raytrace: 7,
  Queue: 8,
  Scene: 9,
  Blit: 10,
  Dispatch: 11,
  Clear: 12,
  Viewport: 13
};
var RenderGraphVertex = function RenderGraphVertex(id, object) {
  this.o = [];
  this.i = [];
  this.c = [];
  this.p = [];
  this.t = void 0;
  this.j = void 0;
  this.id = id;
  this.object = object;
  this.t = id;
  this.j = object;
};
var RenderGraph = function () {
  function RenderGraph() {
    this.N = 0xFFFFFFFF;
    this.x = [];
    this._names = [];
    this._layoutNodes = [];
    this._data = [];
    this._valid = [];
    this.index = new Map();
    this.sortedVertices = [];
    this.globalRenderData = new RenderData();
  }
  var _proto31 = RenderGraph.prototype;
  _proto31.edge = function edge(u, v) {
    for (var _iterator6 = _createForOfIteratorHelperLoose(this.x[u].o), _step6; !(_step6 = _iterator6()).done;) {
      var oe = _step6.value;
      if (v === oe.target) {
        return true;
      }
    }
    return false;
  };
  _proto31.source = function source(e) {
    return e.source;
  };
  _proto31.target = function target(e) {
    return e.target;
  };
  _proto31.oe = function oe(v) {
    return new OutEI(this.x[v].o.values(), v);
  };
  _proto31.od = function od(v) {
    return this.x[v].o.length;
  };
  _proto31.ie = function ie(v) {
    return new InEI(this.x[v].i.values(), v);
  };
  _proto31.id = function id(v) {
    return this.x[v].i.length;
  };
  _proto31.d = function d(v) {
    return this.od(v) + this.id(v);
  };
  _proto31.adj = function adj(v) {
    return new AdjI(this, this.oe(v));
  };
  _proto31.v = function v() {
    return this.x.keys();
  };
  _proto31.nv = function nv() {
    return this.x.length;
  };
  _proto31.ne = function ne() {
    var numEdges = 0;
    for (var _iterator7 = _createForOfIteratorHelperLoose(this.v()), _step7; !(_step7 = _iterator7()).done;) {
      var v = _step7.value;
      numEdges += this.od(v);
    }
    return numEdges;
  };
  _proto31.clear = function clear() {
    this.index.clear();
    this.sortedVertices.length = 0;
    this.globalRenderData.reset();
    this._names.length = 0;
    this._layoutNodes.length = 0;
    this._data.length = 0;
    this._valid.length = 0;
    this.x.length = 0;
  };
  _proto31.addVertex = function addVertex(id, object, name, layout, data, valid, u) {
    if (u === void 0) {
      u = 0xFFFFFFFF;
    }
    var vert = new RenderGraphVertex(id, object);
    var v = this.x.length;
    this.x.push(vert);
    this._names.push(name);
    this._layoutNodes.push(layout);
    this._data.push(data);
    this._valid.push(valid);
    if (u !== 0xFFFFFFFF) {
      this.x[u].c.push(new OutE(v));
      vert.p.push(new OutE(u));
    }
    return v;
  };
  _proto31.addEdge = function addEdge(u, v) {
    this.x[u].o.push(new OutE(v));
    this.x[v].i.push(new OutE(u));
    return new ED(u, v);
  };
  _proto31.vertexName = function vertexName(v) {
    return this._names[v];
  };
  _proto31.getName = function getName(v) {
    return this._names[v];
  };
  _proto31.setName = function setName(v, value) {
    this._names[v] = value;
  };
  _proto31.getLayout = function getLayout(v) {
    return this._layoutNodes[v];
  };
  _proto31.setLayout = function setLayout(v, value) {
    this._layoutNodes[v] = value;
  };
  _proto31.getData = function getData(v) {
    return this._data[v];
  };
  _proto31.getValid = function getValid(v) {
    return this._valid[v];
  };
  _proto31.setValid = function setValid(v, value) {
    this._valid[v] = value;
  };
  _proto31.h = function h(id, v) {
    return this.x[v].t === id;
  };
  _proto31.w = function w(v) {
    return this.x[v].t;
  };
  _proto31.object = function object(v) {
    return this.x[v].j;
  };
  _proto31.value = function value(id, v) {
    if (this.x[v].t === id) {
      return this.x[v].j;
    } else {
      throw Error('value id not match');
    }
  };
  _proto31.visitVertex = function visitVertex(visitor, v) {
    var vert = this.x[v];
    switch (vert.t) {
      case RenderGraphValue.RasterPass:
        return visitor.rasterPass(vert.j);
      case RenderGraphValue.RasterSubpass:
        return visitor.rasterSubpass(vert.j);
      case RenderGraphValue.ComputeSubpass:
        return visitor.computeSubpass(vert.j);
      case RenderGraphValue.Compute:
        return visitor.compute(vert.j);
      case RenderGraphValue.Resolve:
        return visitor.resolve(vert.j);
      case RenderGraphValue.Copy:
        return visitor.copy(vert.j);
      case RenderGraphValue.Move:
        return visitor.move(vert.j);
      case RenderGraphValue.Raytrace:
        return visitor.raytrace(vert.j);
      case RenderGraphValue.Queue:
        return visitor.queue(vert.j);
      case RenderGraphValue.Scene:
        return visitor.scene(vert.j);
      case RenderGraphValue.Blit:
        return visitor.blit(vert.j);
      case RenderGraphValue.Dispatch:
        return visitor.dispatch(vert.j);
      case RenderGraphValue.Clear:
        return visitor.clear(vert.j);
      case RenderGraphValue.Viewport:
        return visitor.viewport(vert.j);
      default:
        throw Error('polymorphic type not found');
    }
  };
  _proto31.j = function j(v) {
    return this.x[v].j;
  };
  _proto31.reference = function reference(u, v) {
    for (var _iterator8 = _createForOfIteratorHelperLoose(this.x[u].c), _step8; !(_step8 = _iterator8()).done;) {
      var oe = _step8.value;
      if (v === oe.target) {
        return true;
      }
    }
    return false;
  };
  _proto31.parent = function parent(e) {
    return e.source;
  };
  _proto31.child = function child(e) {
    return e.target;
  };
  _proto31.children = function children(v) {
    return new OutEI(this.x[v].c.values(), v);
  };
  _proto31.numChildren = function numChildren(v) {
    return this.x[v].c.length;
  };
  _proto31.getParent = function getParent(v) {
    if (v === 0xFFFFFFFF) {
      return 0xFFFFFFFF;
    }
    var list = this.x[v].p;
    if (list.length === 0) {
      return 0xFFFFFFFF;
    } else {
      return list[0].target;
    }
  };
  _proto31.addReference = function addReference(u, v) {
    this.x[u].c.push(new OutE(v));
    this.x[v].p.push(new OutE(u));
    return new ED(u, v);
  };
  return RenderGraph;
}();
function createPool(Constructor) {
  return new RecyclePool(function () {
    return new Constructor();
  }, 16);
}
var RenderGraphObjectPool = function () {
  function RenderGraphObjectPool(renderCommon) {
    this.renderCommon = void 0;
    this.cv = createPool(ClearValue);
    this.rv = createPool(RasterView);
    this.cv1 = createPool(ComputeView);
    this.rd = createPool(ResourceDesc);
    this.rt = createPool(ResourceTraits);
    this.rs = createPool(RenderSwapchain);
    this.rs1 = createPool(ResourceStates);
    this.mb = createPool(ManagedBuffer);
    this.pb = createPool(PersistentBuffer);
    this.mt = createPool(ManagedTexture);
    this.pt = createPool(PersistentTexture);
    this.mr = createPool(ManagedResource);
    this.s = createPool(Subpass);
    this.sg = createPool(SubpassGraph);
    this.rs2 = createPool(RasterSubpass);
    this.cs = createPool(ComputeSubpass);
    this.rp = createPool(RasterPass);
    this.prpaf = createPool(PersistentRenderPassAndFramebuffer);
    this.fv = createPool(FormatView);
    this.sv = createPool(SubresourceView);
    this.rg = createPool(ResourceGraph);
    this.cp = createPool(ComputePass);
    this.rp1 = createPool(ResolvePass);
    this.cp1 = createPool(CopyPass);
    this.mp = createPool(MovePass);
    this.rp2 = createPool(RaytracePass);
    this.cv2 = createPool(ClearView);
    this.rq = createPool(RenderQueue$1);
    this.sd = createPool(SceneData);
    this.d = createPool(Dispatch);
    this.b = createPool(Blit);
    this.rd1 = createPool(RenderData);
    this.rg1 = createPool(RenderGraph);
    this.renderCommon = renderCommon;
  }
  var _proto32 = RenderGraphObjectPool.prototype;
  _proto32.reset = function reset() {
    this.cv.reset();
    this.rv.reset();
    this.cv1.reset();
    this.rd.reset();
    this.rt.reset();
    this.rs.reset();
    this.rs1.reset();
    this.mb.reset();
    this.pb.reset();
    this.mt.reset();
    this.pt.reset();
    this.mr.reset();
    this.s.reset();
    this.sg.reset();
    this.rs2.reset();
    this.cs.reset();
    this.rp.reset();
    this.prpaf.reset();
    this.fv.reset();
    this.sv.reset();
    this.rg.reset();
    this.cp.reset();
    this.rp1.reset();
    this.cp1.reset();
    this.mp.reset();
    this.rp2.reset();
    this.cv2.reset();
    this.rq.reset();
    this.sd.reset();
    this.d.reset();
    this.b.reset();
    this.rd1.reset();
    this.rg1.reset();
  };
  _proto32.createClearValue = function createClearValue(x, y, z, w) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (z === void 0) {
      z = 0;
    }
    if (w === void 0) {
      w = 0;
    }
    var v = this.cv.add();
    v.reset(x, y, z, w);
    return v;
  };
  _proto32.createRasterView = function createRasterView(slotName, accessType, attachmentType, loadOp, storeOp, clearFlags, shaderStageFlags) {
    if (slotName === void 0) {
      slotName = '';
    }
    if (accessType === void 0) {
      accessType = AccessType.WRITE;
    }
    if (attachmentType === void 0) {
      attachmentType = AttachmentType.RENDER_TARGET;
    }
    if (loadOp === void 0) {
      loadOp = LoadOp.LOAD;
    }
    if (storeOp === void 0) {
      storeOp = StoreOp.STORE;
    }
    if (clearFlags === void 0) {
      clearFlags = ClearFlagBit.ALL;
    }
    if (shaderStageFlags === void 0) {
      shaderStageFlags = ShaderStageFlagBit.NONE;
    }
    var v = this.rv.add();
    v.reset(slotName, accessType, attachmentType, loadOp, storeOp, clearFlags, shaderStageFlags);
    return v;
  };
  _proto32.createComputeView = function createComputeView(name, accessType, clearFlags, clearValueType, shaderStageFlags) {
    if (name === void 0) {
      name = '';
    }
    if (accessType === void 0) {
      accessType = AccessType.READ;
    }
    if (clearFlags === void 0) {
      clearFlags = ClearFlagBit.NONE;
    }
    if (clearValueType === void 0) {
      clearValueType = ClearValueType.NONE;
    }
    if (shaderStageFlags === void 0) {
      shaderStageFlags = ShaderStageFlagBit.NONE;
    }
    var v = this.cv1.add();
    v.reset(name, accessType, clearFlags, clearValueType, shaderStageFlags);
    return v;
  };
  _proto32.createResourceDesc = function createResourceDesc() {
    var v = this.rd.add();
    v.reset();
    return v;
  };
  _proto32.createResourceTraits = function createResourceTraits(residency) {
    if (residency === void 0) {
      residency = ResourceResidency.MANAGED;
    }
    var v = this.rt.add();
    v.reset(residency);
    return v;
  };
  _proto32.createRenderSwapchain = function createRenderSwapchain(swapchain, isDepthStencil) {
    if (swapchain === void 0) {
      swapchain = null;
    }
    if (isDepthStencil === void 0) {
      isDepthStencil = false;
    }
    var v = this.rs.add();
    v.reset(swapchain, isDepthStencil);
    return v;
  };
  _proto32.createResourceStates = function createResourceStates() {
    var v = this.rs1.add();
    v.reset();
    return v;
  };
  _proto32.createManagedBuffer = function createManagedBuffer(buffer) {
    if (buffer === void 0) {
      buffer = null;
    }
    var v = this.mb.add();
    v.reset(buffer);
    return v;
  };
  _proto32.createPersistentBuffer = function createPersistentBuffer(buffer) {
    if (buffer === void 0) {
      buffer = null;
    }
    var v = this.pb.add();
    v.reset(buffer);
    return v;
  };
  _proto32.createManagedTexture = function createManagedTexture(texture) {
    if (texture === void 0) {
      texture = null;
    }
    var v = this.mt.add();
    v.reset(texture);
    return v;
  };
  _proto32.createPersistentTexture = function createPersistentTexture(texture) {
    if (texture === void 0) {
      texture = null;
    }
    var v = this.pt.add();
    v.reset(texture);
    return v;
  };
  _proto32.createManagedResource = function createManagedResource() {
    var v = this.mr.add();
    v.reset();
    return v;
  };
  _proto32.createSubpass = function createSubpass() {
    var v = this.s.add();
    v.reset();
    return v;
  };
  _proto32.createSubpassGraph = function createSubpassGraph() {
    var v = this.sg.add();
    v.clear();
    return v;
  };
  _proto32.createRasterSubpass = function createRasterSubpass(subpassID, count, quality) {
    if (subpassID === void 0) {
      subpassID = 0xFFFFFFFF;
    }
    if (count === void 0) {
      count = 1;
    }
    if (quality === void 0) {
      quality = 0;
    }
    var v = this.rs2.add();
    v.reset(subpassID, count, quality);
    return v;
  };
  _proto32.createComputeSubpass = function createComputeSubpass(subpassID) {
    if (subpassID === void 0) {
      subpassID = 0xFFFFFFFF;
    }
    var v = this.cs.add();
    v.reset(subpassID);
    return v;
  };
  _proto32.createRasterPass = function createRasterPass() {
    var v = this.rp.add();
    v.reset();
    return v;
  };
  _proto32.createPersistentRenderPassAndFramebuffer = function createPersistentRenderPassAndFramebuffer(renderPass, framebuffer) {
    if (renderPass === void 0) {
      renderPass = null;
    }
    if (framebuffer === void 0) {
      framebuffer = null;
    }
    var v = this.prpaf.add();
    v.reset(renderPass, framebuffer);
    return v;
  };
  _proto32.createFormatView = function createFormatView() {
    var v = this.fv.add();
    v.reset();
    return v;
  };
  _proto32.createSubresourceView = function createSubresourceView() {
    var v = this.sv.add();
    v.reset();
    return v;
  };
  _proto32.createResourceGraph = function createResourceGraph() {
    var v = this.rg.add();
    v.clear();
    return v;
  };
  _proto32.createComputePass = function createComputePass() {
    var v = this.cp.add();
    v.reset();
    return v;
  };
  _proto32.createResolvePass = function createResolvePass() {
    var v = this.rp1.add();
    v.reset();
    return v;
  };
  _proto32.createCopyPass = function createCopyPass() {
    var v = this.cp1.add();
    v.reset();
    return v;
  };
  _proto32.createMovePass = function createMovePass() {
    var v = this.mp.add();
    v.reset();
    return v;
  };
  _proto32.createRaytracePass = function createRaytracePass() {
    var v = this.rp2.add();
    v.reset();
    return v;
  };
  _proto32.createClearView = function createClearView(slotName, clearFlags) {
    if (slotName === void 0) {
      slotName = '';
    }
    if (clearFlags === void 0) {
      clearFlags = ClearFlagBit.ALL;
    }
    var v = this.cv2.add();
    v.reset(slotName, clearFlags);
    return v;
  };
  _proto32.createRenderQueue = function createRenderQueue(hint, phaseID, passLayoutID) {
    if (hint === void 0) {
      hint = QueueHint.RENDER_OPAQUE;
    }
    if (phaseID === void 0) {
      phaseID = 0xFFFFFFFF;
    }
    if (passLayoutID === void 0) {
      passLayoutID = 0xFFFFFFFF;
    }
    var v = this.rq.add();
    v.reset(hint, phaseID, passLayoutID);
    return v;
  };
  _proto32.createSceneData = function createSceneData(scene, camera, flags, cullingFlags, shadingLight) {
    if (scene === void 0) {
      scene = null;
    }
    if (camera === void 0) {
      camera = null;
    }
    if (flags === void 0) {
      flags = SceneFlags.NONE;
    }
    if (cullingFlags === void 0) {
      cullingFlags = CullingFlags.CAMERA_FRUSTUM;
    }
    if (shadingLight === void 0) {
      shadingLight = null;
    }
    var v = this.sd.add();
    v.reset(scene, camera, flags, cullingFlags, shadingLight);
    return v;
  };
  _proto32.createDispatch = function createDispatch(material, passID, threadGroupCountX, threadGroupCountY, threadGroupCountZ) {
    if (material === void 0) {
      material = null;
    }
    if (passID === void 0) {
      passID = 0;
    }
    if (threadGroupCountX === void 0) {
      threadGroupCountX = 0;
    }
    if (threadGroupCountY === void 0) {
      threadGroupCountY = 0;
    }
    if (threadGroupCountZ === void 0) {
      threadGroupCountZ = 0;
    }
    var v = this.d.add();
    v.reset(material, passID, threadGroupCountX, threadGroupCountY, threadGroupCountZ);
    return v;
  };
  _proto32.createBlit = function createBlit(material, passID, sceneFlags, camera, blitType) {
    if (material === void 0) {
      material = null;
    }
    if (passID === void 0) {
      passID = 0;
    }
    if (sceneFlags === void 0) {
      sceneFlags = SceneFlags.NONE;
    }
    if (camera === void 0) {
      camera = null;
    }
    if (blitType === void 0) {
      blitType = BlitType.FULLSCREEN_QUAD;
    }
    var v = this.b.add();
    v.reset(material, passID, sceneFlags, camera, blitType);
    return v;
  };
  _proto32.createRenderData = function createRenderData() {
    var v = this.rd1.add();
    v.reset();
    return v;
  };
  _proto32.createRenderGraph = function createRenderGraph() {
    var v = this.rg1.add();
    v.clear();
    return v;
  };
  return RenderGraphObjectPool;
}();

var PipelineType;
(function (PipelineType) {
  PipelineType[PipelineType["BASIC"] = 0] = "BASIC";
  PipelineType[PipelineType["STANDARD"] = 1] = "STANDARD";
})(PipelineType || (PipelineType = {}));
var SubpassCapabilities;
(function (SubpassCapabilities) {
  SubpassCapabilities[SubpassCapabilities["NONE"] = 0] = "NONE";
  SubpassCapabilities[SubpassCapabilities["INPUT_DEPTH_STENCIL"] = 1] = "INPUT_DEPTH_STENCIL";
  SubpassCapabilities[SubpassCapabilities["INPUT_COLOR"] = 2] = "INPUT_COLOR";
  SubpassCapabilities[SubpassCapabilities["INPUT_COLOR_MRT"] = 4] = "INPUT_COLOR_MRT";
  SubpassCapabilities[SubpassCapabilities["HETEROGENEOUS_SAMPLE_COUNT"] = 8] = "HETEROGENEOUS_SAMPLE_COUNT";
})(SubpassCapabilities || (SubpassCapabilities = {}));
var PipelineCapabilities = function PipelineCapabilities() {
  this.subpass = SubpassCapabilities.NONE;
};

function loadUniform(ar, v) {
  v.name = ar.s();
  v.type = ar.n();
  v.count = ar.n();
}
function loadUniformBlock(ar, v) {
  v.set = ar.n();
  v.binding = ar.n();
  v.name = ar.s();
  var sz = 0;
  sz = ar.n();
  v.members.length = sz;
  for (var i = 0; i !== sz; ++i) {
    var v1 = new Uniform();
    loadUniform(ar, v1);
    v.members[i] = v1;
  }
  v.count = ar.n();
}
function loadDescriptorSetLayoutBinding(ar, v) {
  v.binding = ar.n();
  v.descriptorType = ar.n();
  v.count = ar.n();
  v.stageFlags = ar.n();
}
function loadDescriptorSetLayoutInfo(ar, v) {
  var sz = ar.n();
  v.bindings.length = sz;
  for (var i = 0; i !== sz; ++i) {
    var v1 = new DescriptorSetLayoutBinding();
    loadDescriptorSetLayoutBinding(ar, v1);
    v.bindings[i] = v1;
  }
}

function resetDescriptorSetLayoutInfo(info) {
  info.bindings.length = 0;
}
var LayoutType = {
  VULKAN: 0,
  WEBGPU: 1
};
var Layout = function Layout() {};
Layout.type = LayoutType.VULKAN;
Layout.isWebGPU = false;
var DescriptorTypeOrder = {
  UNIFORM_BUFFER: 0,
  DYNAMIC_UNIFORM_BUFFER: 1,
  SAMPLER_TEXTURE: 2,
  SAMPLER: 3,
  TEXTURE: 4,
  STORAGE_BUFFER: 5,
  DYNAMIC_STORAGE_BUFFER: 6,
  STORAGE_IMAGE: 7,
  INPUT_ATTACHMENT: 8
};
var DescriptorData = function () {
  function DescriptorData(descriptorID, type, count) {
    if (descriptorID === void 0) {
      descriptorID = 0;
    }
    if (type === void 0) {
      type = Type.UNKNOWN;
    }
    if (count === void 0) {
      count = 1;
    }
    this.descriptorID = descriptorID;
    this.type = type;
    this.count = count;
  }
  var _proto9 = DescriptorData.prototype;
  _proto9.reset = function reset(descriptorID, type, count) {
    this.descriptorID = descriptorID;
    this.type = type;
    this.count = count;
  };
  return DescriptorData;
}();
var DescriptorBlockData = function () {
  function DescriptorBlockData(type, visibility, capacity, accessType, viewDimension, sampleType, format) {
    if (type === void 0) {
      type = DescriptorTypeOrder.UNIFORM_BUFFER;
    }
    if (visibility === void 0) {
      visibility = ShaderStageFlagBit.NONE;
    }
    if (capacity === void 0) {
      capacity = 0;
    }
    if (accessType === void 0) {
      accessType = MemoryAccessBit.READ_ONLY;
    }
    if (viewDimension === void 0) {
      viewDimension = ViewDimension.UNKNOWN;
    }
    if (sampleType === void 0) {
      sampleType = SampleType.FLOAT;
    }
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    this.offset = 0;
    this.descriptors = [];
    this.type = type;
    this.visibility = visibility;
    this.capacity = capacity;
    this.accessType = accessType;
    this.viewDimension = viewDimension;
    this.sampleType = sampleType;
    this.format = format;
  }
  var _proto0 = DescriptorBlockData.prototype;
  _proto0.reset = function reset(type, visibility, capacity, accessType, viewDimension, sampleType, format) {
    this.type = type;
    this.visibility = visibility;
    this.offset = 0;
    this.capacity = capacity;
    this.accessType = accessType;
    this.viewDimension = viewDimension;
    this.sampleType = sampleType;
    this.format = format;
    this.descriptors.length = 0;
  };
  return DescriptorBlockData;
}();
var DescriptorSetLayoutData = function () {
  function DescriptorSetLayoutData(slot, capacity, descriptorBlocks, uniformBlocks, bindingMap) {
    if (slot === void 0) {
      slot = 0xFFFFFFFF;
    }
    if (capacity === void 0) {
      capacity = 0;
    }
    if (descriptorBlocks === void 0) {
      descriptorBlocks = [];
    }
    if (uniformBlocks === void 0) {
      uniformBlocks = new Map();
    }
    if (bindingMap === void 0) {
      bindingMap = new Map();
    }
    this.uniformBlockCapacity = 0;
    this.samplerTextureCapacity = 0;
    this.slot = slot;
    this.capacity = capacity;
    this.descriptorBlocks = descriptorBlocks;
    this.uniformBlocks = uniformBlocks;
    this.bindingMap = bindingMap;
  }
  var _proto1 = DescriptorSetLayoutData.prototype;
  _proto1.reset = function reset(slot, capacity) {
    this.slot = slot;
    this.capacity = capacity;
    this.uniformBlockCapacity = 0;
    this.samplerTextureCapacity = 0;
    this.descriptorBlocks.length = 0;
    this.uniformBlocks.clear();
    this.bindingMap.clear();
  };
  return DescriptorSetLayoutData;
}();
var DescriptorSetData = function () {
  function DescriptorSetData(descriptorSetLayoutData, descriptorSetLayout, descriptorSet) {
    if (descriptorSetLayoutData === void 0) {
      descriptorSetLayoutData = new DescriptorSetLayoutData();
    }
    if (descriptorSetLayout === void 0) {
      descriptorSetLayout = null;
    }
    if (descriptorSet === void 0) {
      descriptorSet = null;
    }
    this.descriptorSetLayoutInfo = new DescriptorSetLayoutInfo();
    this.descriptorSetLayoutData = descriptorSetLayoutData;
    this.descriptorSetLayout = descriptorSetLayout;
    this.descriptorSet = descriptorSet;
  }
  var _proto10 = DescriptorSetData.prototype;
  _proto10.reset = function reset(descriptorSetLayout, descriptorSet) {
    this.descriptorSetLayoutData.reset(0xFFFFFFFF, 0);
    resetDescriptorSetLayoutInfo(this.descriptorSetLayoutInfo);
    this.descriptorSetLayout = descriptorSetLayout;
    this.descriptorSet = descriptorSet;
  };
  return DescriptorSetData;
}();
var PipelineLayoutData = function () {
  function PipelineLayoutData() {
    this.descriptorSets = new Map();
    this.descriptorGroups = new Map();
  }
  var _proto11 = PipelineLayoutData.prototype;
  _proto11.reset = function reset() {
    this.descriptorSets.clear();
    this.descriptorGroups.clear();
  };
  _proto11.getSets = function getSets() {
    return Layout.isWebGPU ? this.descriptorGroups : this.descriptorSets;
  };
  _proto11.getSet = function getSet(frequency) {
    return Layout.isWebGPU ? this.descriptorGroups.get(frequency) : this.descriptorSets.get(frequency);
  };
  return PipelineLayoutData;
}();
var ShaderBindingData = function () {
  function ShaderBindingData() {
    this.descriptorBindings = new Map();
  }
  var _proto12 = ShaderBindingData.prototype;
  _proto12.reset = function reset() {
    this.descriptorBindings.clear();
  };
  return ShaderBindingData;
}();
var ShaderLayoutData = function () {
  function ShaderLayoutData() {
    this.layoutData = new Map();
    this.bindingData = new Map();
  }
  var _proto13 = ShaderLayoutData.prototype;
  _proto13.reset = function reset() {
    this.layoutData.clear();
    this.bindingData.clear();
  };
  return ShaderLayoutData;
}();
var TechniqueData = function () {
  function TechniqueData() {
    this.passes = [];
  }
  var _proto14 = TechniqueData.prototype;
  _proto14.reset = function reset() {
    this.passes.length = 0;
  };
  return TechniqueData;
}();
var EffectData = function () {
  function EffectData() {
    this.techniques = new Map();
  }
  var _proto15 = EffectData.prototype;
  _proto15.reset = function reset() {
    this.techniques.clear();
  };
  return EffectData;
}();
var ShaderProgramData = function () {
  function ShaderProgramData() {
    this.layout = new PipelineLayoutData();
    this.pipelineLayout = null;
  }
  var _proto16 = ShaderProgramData.prototype;
  _proto16.reset = function reset() {
    this.layout.reset();
    this.pipelineLayout = null;
  };
  return ShaderProgramData;
}();
var RenderStageData = function () {
  function RenderStageData() {
    this.descriptorVisibility = new Map();
  }
  var _proto17 = RenderStageData.prototype;
  _proto17.reset = function reset() {
    this.descriptorVisibility.clear();
  };
  return RenderStageData;
}();
var RenderPhaseData = function () {
  function RenderPhaseData() {
    this.rootSignature = '';
    this.shaderPrograms = [];
    this.shaderIndex = new Map();
    this.pipelineLayout = null;
  }
  var _proto18 = RenderPhaseData.prototype;
  _proto18.reset = function reset() {
    this.rootSignature = '';
    this.shaderPrograms.length = 0;
    this.shaderIndex.clear();
    this.pipelineLayout = null;
  };
  return RenderPhaseData;
}();
var LayoutGraphDataValue = {
  RenderStage: 0,
  RenderPhase: 1
};
var LayoutGraphDataVertex = function LayoutGraphDataVertex(id, object) {
  this.o = [];
  this.i = [];
  this.t = void 0;
  this.j = void 0;
  this.id = id;
  this.object = object;
  this.t = id;
  this.j = object;
};
var LayoutGraphData = function () {
  function LayoutGraphData() {
    this.N = 0xFFFFFFFF;
    this.x = [];
    this._names = [];
    this._updateFrequencies = [];
    this._layouts = [];
    this.valueNames = [];
    this.attributeIndex = new Map();
    this.constantIndex = new Map();
    this.shaderLayoutIndex = new Map();
    this.effects = new Map();
    this.constantMacros = '';
  }
  var _proto19 = LayoutGraphData.prototype;
  _proto19.edge = function edge(u, v) {
    for (var _iterator6 = _createForOfIteratorHelperLoose(this.x[u].o), _step6; !(_step6 = _iterator6()).done;) {
      var oe = _step6.value;
      if (v === oe.target) {
        return true;
      }
    }
    return false;
  };
  _proto19.source = function source(e) {
    return e.source;
  };
  _proto19.target = function target(e) {
    return e.target;
  };
  _proto19.oe = function oe(v) {
    return new OutEI(this.x[v].o.values(), v);
  };
  _proto19.od = function od(v) {
    return this.x[v].o.length;
  };
  _proto19.ie = function ie(v) {
    return new InEI(this.x[v].i.values(), v);
  };
  _proto19.id = function id(v) {
    return this.x[v].i.length;
  };
  _proto19.d = function d(v) {
    return this.od(v) + this.id(v);
  };
  _proto19.adj = function adj(v) {
    return new AdjI(this, this.oe(v));
  };
  _proto19.v = function v() {
    return this.x.keys();
  };
  _proto19.nv = function nv() {
    return this.x.length;
  };
  _proto19.ne = function ne() {
    var numEdges = 0;
    for (var _iterator7 = _createForOfIteratorHelperLoose(this.v()), _step7; !(_step7 = _iterator7()).done;) {
      var v = _step7.value;
      numEdges += this.od(v);
    }
    return numEdges;
  };
  _proto19.clear = function clear() {
    this.valueNames.length = 0;
    this.attributeIndex.clear();
    this.constantIndex.clear();
    this.shaderLayoutIndex.clear();
    this.effects.clear();
    this.constantMacros = '';
    this._names.length = 0;
    this._updateFrequencies.length = 0;
    this._layouts.length = 0;
    this.x.length = 0;
  };
  _proto19.addVertex = function addVertex(id, object, name, update, layout, u) {
    if (u === void 0) {
      u = 0xFFFFFFFF;
    }
    var vert = new LayoutGraphDataVertex(id, object);
    var v = this.x.length;
    this.x.push(vert);
    this._names.push(name);
    this._updateFrequencies.push(update);
    this._layouts.push(layout);
    if (u !== 0xFFFFFFFF) {
      this.addEdge(u, v);
    }
    return v;
  };
  _proto19.addEdge = function addEdge(u, v) {
    this.x[u].o.push(new OutE(v));
    this.x[v].i.push(new OutE(u));
    return new ED(u, v);
  };
  _proto19.vertexName = function vertexName(v) {
    return this._names[v];
  };
  _proto19.getName = function getName(v) {
    return this._names[v];
  };
  _proto19.getUpdate = function getUpdate(v) {
    return this._updateFrequencies[v];
  };
  _proto19.setUpdate = function setUpdate(v, value) {
    this._updateFrequencies[v] = value;
  };
  _proto19.getLayout = function getLayout(v) {
    return this._layouts[v];
  };
  _proto19.h = function h(id, v) {
    return this.x[v].t === id;
  };
  _proto19.w = function w(v) {
    return this.x[v].t;
  };
  _proto19.object = function object(v) {
    return this.x[v].j;
  };
  _proto19.value = function value(id, v) {
    if (this.x[v].t === id) {
      return this.x[v].j;
    } else {
      throw Error('value id not match');
    }
  };
  _proto19.visitVertex = function visitVertex(visitor, v) {
    var vert = this.x[v];
    switch (vert.t) {
      case LayoutGraphDataValue.RenderStage:
        return visitor.renderStage(vert.j);
      case LayoutGraphDataValue.RenderPhase:
        return visitor.renderPhase(vert.j);
      default:
        throw Error('polymorphic type not found');
    }
  };
  _proto19.j = function j(v) {
    return this.x[v].j;
  };
  _proto19.reference = function reference(u, v) {
    for (var _iterator8 = _createForOfIteratorHelperLoose(this.x[u].o), _step8; !(_step8 = _iterator8()).done;) {
      var oe = _step8.value;
      if (v === oe.target) {
        return true;
      }
    }
    return false;
  };
  _proto19.parent = function parent(e) {
    return e.source;
  };
  _proto19.child = function child(e) {
    return e.target;
  };
  _proto19.children = function children(v) {
    return new OutEI(this.x[v].o.values(), v);
  };
  _proto19.numChildren = function numChildren(v) {
    return this.x[v].o.length;
  };
  _proto19.getParent = function getParent(v) {
    if (v === 0xFFFFFFFF) {
      return 0xFFFFFFFF;
    }
    var list = this.x[v].i;
    if (list.length === 0) {
      return 0xFFFFFFFF;
    } else {
      return list[0].target;
    }
  };
  _proto19.addReference = function addReference(u, v) {
    return this.addEdge(u, v);
  };
  _proto19.locateChild = function locateChild(u, name) {
    if (u === 0xFFFFFFFF) {
      for (var _iterator9 = _createForOfIteratorHelperLoose(this.x.keys()), _step9; !(_step9 = _iterator9()).done;) {
        var v = _step9.value;
        var vert = this.x[v];
        if (vert.i.length === 0 && this._names[v] === name) {
          return v;
        }
      }
      return 0xFFFFFFFF;
    }
    for (var _iterator0 = _createForOfIteratorHelperLoose(this.x[u].o), _step0; !(_step0 = _iterator0()).done;) {
      var oe = _step0.value;
      var child = oe.target;
      if (name === this._names[child]) {
        return child;
      }
    }
    return 0xFFFFFFFF;
  };
  _proto19.locate = function locate(absPath) {
    return findRelative(this, 0xFFFFFFFF, absPath);
  };
  _proto19.locateRelative = function locateRelative(path, start) {
    if (start === void 0) {
      start = 0xFFFFFFFF;
    }
    return findRelative(this, start, path);
  };
  _proto19.path = function path(v) {
    return getPath(this, v);
  };
  return LayoutGraphData;
}();
function loadDescriptorData(a, v) {
  v.descriptorID = a.n();
  v.type = a.n();
  v.count = a.n();
}
function loadDescriptorBlockData(a, v) {
  v.type = a.n();
  v.visibility = a.n();
  v.offset = a.n();
  v.capacity = a.n();
  v.accessType = a.n();
  v.viewDimension = a.n();
  v.sampleType = a.n();
  v.format = a.n();
  var sz = 0;
  sz = a.n();
  v.descriptors.length = sz;
  for (var i1 = 0; i1 !== sz; ++i1) {
    var v1 = new DescriptorData();
    loadDescriptorData(a, v1);
    v.descriptors[i1] = v1;
  }
}
function loadDescriptorSetLayoutData(a, v) {
  v.slot = a.n();
  v.capacity = a.n();
  v.uniformBlockCapacity = a.n();
  v.samplerTextureCapacity = a.n();
  var sz = 0;
  sz = a.n();
  v.descriptorBlocks.length = sz;
  for (var i1 = 0; i1 !== sz; ++i1) {
    var v1 = new DescriptorBlockData();
    loadDescriptorBlockData(a, v1);
    v.descriptorBlocks[i1] = v1;
  }
  sz = a.n();
  for (var _i6 = 0; _i6 !== sz; ++_i6) {
    var k1 = a.n();
    var _v10 = new UniformBlock();
    loadUniformBlock(a, _v10);
    v.uniformBlocks.set(k1, _v10);
  }
  sz = a.n();
  for (var _i7 = 0; _i7 !== sz; ++_i7) {
    var _k6 = a.n();
    var _v11 = a.n();
    v.bindingMap.set(_k6, _v11);
  }
}
function loadDescriptorSetData(a, v) {
  loadDescriptorSetLayoutData(a, v.descriptorSetLayoutData);
  loadDescriptorSetLayoutInfo(a, v.descriptorSetLayoutInfo);
}
function loadPipelineLayoutData(a, v) {
  var sz = 0;
  sz = a.n();
  for (var i1 = 0; i1 !== sz; ++i1) {
    var k1 = a.n();
    var v1 = new DescriptorSetData();
    loadDescriptorSetData(a, v1);
    v.descriptorSets.set(k1, v1);
  }
  sz = a.n();
  for (var _i8 = 0; _i8 !== sz; ++_i8) {
    var _k8 = a.n();
    var _v13 = new DescriptorSetData();
    loadDescriptorSetData(a, _v13);
    v.descriptorGroups.set(_k8, _v13);
  }
}
function loadShaderBindingData(a, v) {
  var sz = 0;
  sz = a.n();
  for (var i1 = 0; i1 !== sz; ++i1) {
    var k1 = a.n();
    var v1 = a.n();
    v.descriptorBindings.set(k1, v1);
  }
}
function loadShaderLayoutData(a, v) {
  var sz = 0;
  sz = a.n();
  for (var i1 = 0; i1 !== sz; ++i1) {
    var k1 = a.n();
    var v1 = new DescriptorSetLayoutData();
    loadDescriptorSetLayoutData(a, v1);
    v.layoutData.set(k1, v1);
  }
  sz = a.n();
  for (var _i9 = 0; _i9 !== sz; ++_i9) {
    var _k0 = a.n();
    var _v15 = new ShaderBindingData();
    loadShaderBindingData(a, _v15);
    v.bindingData.set(_k0, _v15);
  }
}
function loadTechniqueData(a, v) {
  var sz = 0;
  sz = a.n();
  v.passes.length = sz;
  for (var i1 = 0; i1 !== sz; ++i1) {
    var v1 = new ShaderLayoutData();
    loadShaderLayoutData(a, v1);
    v.passes[i1] = v1;
  }
}
function loadEffectData(a, v) {
  var sz = 0;
  sz = a.n();
  for (var i1 = 0; i1 !== sz; ++i1) {
    var k1 = a.s();
    var v1 = new TechniqueData();
    loadTechniqueData(a, v1);
    v.techniques.set(k1, v1);
  }
}
function loadShaderProgramData(a, v) {
  loadPipelineLayoutData(a, v.layout);
}
function loadRenderStageData(a, v) {
  var sz = 0;
  sz = a.n();
  for (var i1 = 0; i1 !== sz; ++i1) {
    var k1 = a.n();
    var v1 = a.n();
    v.descriptorVisibility.set(k1, v1);
  }
}
function loadRenderPhaseData(a, v) {
  v.rootSignature = a.s();
  var sz = 0;
  sz = a.n();
  v.shaderPrograms.length = sz;
  for (var i1 = 0; i1 !== sz; ++i1) {
    var v1 = new ShaderProgramData();
    loadShaderProgramData(a, v1);
    v.shaderPrograms[i1] = v1;
  }
  sz = a.n();
  for (var _i0 = 0; _i0 !== sz; ++_i0) {
    var k1 = a.s();
    var _v17 = a.n();
    v.shaderIndex.set(k1, _v17);
  }
}
function loadLayoutGraphData(a, g) {
  var numVertices = a.n();
  a.n();
  a.n();
  a.n();
  for (var v = 0; v !== numVertices; ++v) {
    var _id2 = a.n();
    var u = a.n();
    var name = a.s();
    var update = a.n();
    var layout = new PipelineLayoutData();
    loadPipelineLayoutData(a, layout);
    switch (_id2) {
      case LayoutGraphDataValue.RenderStage:
        {
          var _renderStage2 = new RenderStageData();
          loadRenderStageData(a, _renderStage2);
          g.addVertex(LayoutGraphDataValue.RenderStage, _renderStage2, name, update, layout, u);
          break;
        }
      case LayoutGraphDataValue.RenderPhase:
        {
          var _renderPhase2 = new RenderPhaseData();
          loadRenderPhaseData(a, _renderPhase2);
          g.addVertex(LayoutGraphDataValue.RenderPhase, _renderPhase2, name, update, layout, u);
          break;
        }
    }
  }
  var sz = 0;
  sz = a.n();
  g.valueNames.length = sz;
  for (var i1 = 0; i1 !== sz; ++i1) {
    g.valueNames[i1] = a.s();
  }
  sz = a.n();
  for (var _i1 = 0; _i1 !== sz; ++_i1) {
    var k1 = a.s();
    var v1 = a.n();
    g.attributeIndex.set(k1, v1);
  }
  sz = a.n();
  for (var _i10 = 0; _i10 !== sz; ++_i10) {
    var _k12 = a.s();
    var _v23 = a.n();
    g.constantIndex.set(_k12, _v23);
  }
  sz = a.n();
  for (var _i11 = 0; _i11 !== sz; ++_i11) {
    var _k13 = a.s();
    var _v24 = a.n();
    g.shaderLayoutIndex.set(_k13, _v24);
  }
  sz = a.n();
  for (var _i12 = 0; _i12 !== sz; ++_i12) {
    var _k14 = a.s();
    var _v25 = new EffectData();
    loadEffectData(a, _v25);
    g.effects.set(_k14, _v25);
  }
}

var VectorGraphColorMap = function () {
  function VectorGraphColorMap(sz) {
    this.colors = void 0;
    this.colors = new Array(sz);
  }
  var _proto = VectorGraphColorMap.prototype;
  _proto.get = function get(u) {
    return this.colors[u];
  };
  _proto.put = function put(u, value) {
    this.colors[u] = value;
  };
  return VectorGraphColorMap;
}();

function getUBOTypeCount(type) {
  switch (type) {
    case Type.BOOL:
    case Type.INT:
    case Type.UINT:
    case Type.FLOAT:
      return 1;
    case Type.INT2:
    case Type.FLOAT2:
    case Type.UINT2:
    case Type.BOOL2:
      return 2;
    case Type.FLOAT3:
    case Type.BOOL3:
    case Type.UINT3:
    case Type.INT3:
      return 3;
    case Type.BOOL4:
    case Type.FLOAT4:
    case Type.UINT4:
    case Type.INT4:
      return 4;
    case Type.MAT2:
      return 4;
    case Type.MAT2X3:
    case Type.MAT3X2:
      return 6;
    case Type.MAT2X4:
    case Type.MAT4X2:
      return 8;
    case Type.MAT3:
      return 9;
    case Type.MAT3X4:
    case Type.MAT4X3:
      return 12;
    case Type.MAT4:
      return 16;
    default:
      return 0;
  }
}

var _rangedDirLightBoundingBox = new AABB(0.0, 0.0, 0.0, 0.5, 0.5, 0.5);
var _tmpBoundingBox = new AABB();
var AntiAliasing;
(function (AntiAliasing) {
  AntiAliasing[AntiAliasing["NONE"] = 0] = "NONE";
  AntiAliasing[AntiAliasing["FXAA"] = 1] = "FXAA";
  AntiAliasing[AntiAliasing["FXAAHQ"] = 2] = "FXAAHQ";
})(AntiAliasing || (AntiAliasing = {}));
function validPunctualLightsCulling(pipeline, camera) {
  var sceneData = pipeline.pipelineSceneData;
  var validPunctualLights = sceneData.validPunctualLights;
  validPunctualLights.length = 0;
  var _sphere = Sphere.create(0, 0, 0, 1);
  var _ref = camera.scene,
    spotLights = _ref.spotLights;
  var disableLightmap = camera.node.scene.globals.disableLightmap;
  for (var i = 0; i < spotLights.length; i++) {
    var light = spotLights[i];
    if (light.baked && !disableLightmap) {
      continue;
    }
    Sphere.set(_sphere, light.position.x, light.position.y, light.position.z, light.range);
    if (intersect.sphereFrustum(_sphere, camera.frustum)) {
      validPunctualLights.push(light);
    }
  }
  var _ref2 = camera.scene,
    sphereLights = _ref2.sphereLights;
  for (var _i = 0; _i < sphereLights.length; _i++) {
    var _light = sphereLights[_i];
    if (_light.baked && !disableLightmap) {
      continue;
    }
    Sphere.set(_sphere, _light.position.x, _light.position.y, _light.position.z, _light.range);
    if (intersect.sphereFrustum(_sphere, camera.frustum)) {
      validPunctualLights.push(_light);
    }
  }
  var _ref3 = camera.scene,
    pointLights = _ref3.pointLights;
  for (var _i2 = 0; _i2 < pointLights.length; _i2++) {
    var _light2 = pointLights[_i2];
    if (_light2.baked) {
      continue;
    }
    Sphere.set(_sphere, _light2.position.x, _light2.position.y, _light2.position.z, _light2.range);
    if (intersect.sphereFrustum(_sphere, camera.frustum)) {
      validPunctualLights.push(_light2);
    }
  }
  var _ref4 = camera.scene,
    rangedDirLights = _ref4.rangedDirLights;
  for (var _i3 = 0; _i3 < rangedDirLights.length; _i3++) {
    var _light3 = rangedDirLights[_i3];
    AABB.transform(_tmpBoundingBox, _rangedDirLightBoundingBox, _light3.node.getWorldMatrix());
    if (intersect.aabbFrustum(_tmpBoundingBox, camera.frustum)) {
      validPunctualLights.push(_light3);
    }
  }
  sceneData.validPunctualLights = validPunctualLights;
}
function getCameraUniqueID(camera) {
  return camera.cameraId;
}
function getLoadOpOfClearFlag(clearFlag, attachment) {
  var loadOp = LoadOp.CLEAR;
  if (!(clearFlag & ClearFlagBit.COLOR) && attachment === AttachmentType.RENDER_TARGET) {
    if (clearFlag & SkyBoxFlagValue.VALUE) {
      loadOp = LoadOp.CLEAR;
    } else {
      loadOp = LoadOp.LOAD;
    }
  }
  if ((clearFlag & ClearFlagBit.DEPTH_STENCIL) !== ClearFlagBit.DEPTH_STENCIL && attachment === AttachmentType.DEPTH_STENCIL) {
    if (!(clearFlag & ClearFlagBit.DEPTH)) loadOp = LoadOp.LOAD;
    if (!(clearFlag & ClearFlagBit.STENCIL)) loadOp = LoadOp.LOAD;
  }
  return loadOp;
}
function getRenderArea(camera, width, height, light, level, out) {
  if (light === void 0) {
    light = null;
  }
  if (level === void 0) {
    level = 0;
  }
  if (out === void 0) {
    out = undefined;
  }
  out = out || new Rect();
  var vp = camera ? camera.viewport : new Rect(0, 0, 1, 1);
  var w = width;
  var h = height;
  out.x = vp.x * w;
  out.y = vp.y * h;
  out.width = vp.width * w;
  out.height = vp.height * h;
  if (light) {
    switch (light.type) {
      case LightType.DIRECTIONAL:
        {
          var mainLight = light;
          if (mainLight.shadowFixedArea || mainLight.csmLevel === CSMLevel.LEVEL_1) {
            out.x = 0;
            out.y = 0;
            out.width = w;
            out.height = h;
          } else {
            var screenSpaceSignY = cclegacy.director.root.device.capabilities.screenSpaceSignY;
            out.x = level % 2 * 0.5 * w;
            if (screenSpaceSignY > 0) {
              out.y = (1 - Math.floor(level / 2)) * 0.5 * h;
            } else {
              out.y = Math.floor(level / 2) * 0.5 * h;
            }
            out.width = 0.5 * w;
            out.height = 0.5 * h;
          }
          break;
        }
      case LightType.SPOT:
        {
          out.x = 0;
          out.y = 0;
          out.width = w;
          out.height = h;
          break;
        }
    }
  }
  return out;
}
var shadowPass;
function buildShadowPass(passName, ppl, camera, light, level, width, height) {
  var fboW = width;
  var fboH = height;
  var area = getRenderArea(camera, width, height, light, level);
  width = area.width;
  height = area.height;
  var device = ppl.device;
  var shadowMapName = passName;
  if (!ppl.containsResource(shadowMapName)) {
    var format = supportsR32FloatTexture(device) ? Format.R32F : Format.RGBA8;
    ppl.addRenderTarget(shadowMapName, format, fboW, fboH, ResourceResidency.MANAGED);
    ppl.addDepthStencil(shadowMapName + "Depth", Format.DEPTH_STENCIL, fboW, fboH, ResourceResidency.MANAGED);
  }
  ppl.updateRenderTarget(shadowMapName, fboW, fboH);
  ppl.updateDepthStencil(shadowMapName + "Depth", fboW, fboH);
  if (!level) {
    shadowPass = ppl.addRenderPass(width, height, 'default');
    shadowPass.name = passName;
    shadowPass.setViewport(new Viewport(0, 0, fboW, fboH));
    shadowPass.addRenderTarget(shadowMapName, LoadOp.CLEAR, StoreOp.STORE, new Color(1, 1, 1, camera.clearColor.w));
    shadowPass.addDepthStencil(shadowMapName + "Depth", LoadOp.CLEAR, StoreOp.DISCARD, camera.clearDepth, camera.clearStencil, ClearFlagBit.DEPTH_STENCIL);
  }
  var queue = shadowPass.addQueue(QueueHint.RENDER_OPAQUE, 'shadow-caster');
  queue.addScene(camera, SceneFlags.SHADOW_CASTER | SceneFlags.OPAQUE_OBJECT | SceneFlags.MASK).useLightFrustum(light, light.type !== LightType.DIRECTIONAL ? 0 : level);
  queue.setViewport(new Viewport(area.x, area.y, area.width, area.height));
}
function buildReflectionProbePass(camera, ppl, probe, renderWindow, faceIdx) {
  var cameraName = "Camera" + faceIdx;
  var area = probe.renderArea();
  var width = area.x;
  var height = area.y;
  var probeCamera = probe.camera;
  var probePassRTName = "reflectionProbePassColor" + cameraName;
  var probePassDSName = "reflectionProbePassDS" + cameraName;
  if (!ppl.containsResource(probePassRTName)) {
    ppl.addRenderWindow(probePassRTName, Format.RGBA8, width, height, renderWindow);
    ppl.addDepthStencil(probePassDSName, Format.DEPTH_STENCIL, width, height, ResourceResidency.EXTERNAL);
  }
  ppl.updateRenderWindow(probePassRTName, renderWindow);
  ppl.updateDepthStencil(probePassDSName, width, height);
  var probePass = ppl.addRenderPass(width, height, 'default');
  probePass.name = "ReflectionProbePass" + faceIdx;
  probePass.setViewport(new Viewport(0, 0, width, height));
  probePass.addRenderTarget(probePassRTName, getLoadOpOfClearFlag(probeCamera.clearFlag, AttachmentType.RENDER_TARGET), StoreOp.STORE, new Color(probeCamera.clearColor.x, probeCamera.clearColor.y, probeCamera.clearColor.z, probeCamera.clearColor.w));
  probePass.addDepthStencil(probePassDSName, getLoadOpOfClearFlag(probeCamera.clearFlag, AttachmentType.DEPTH_STENCIL), StoreOp.STORE, probeCamera.clearDepth, probeCamera.clearStencil, probeCamera.clearFlag);
  var passBuilder = probePass.addQueue(QueueHint.RENDER_OPAQUE, 'reflect-map');
  var lightInfo = new LightInfo();
  lightInfo.probe = probe;
  passBuilder.addSceneOfCamera(camera, lightInfo, SceneFlags.REFLECTION_PROBE | SceneFlags.OPAQUE_OBJECT);
  updateCameraUBO(passBuilder, probeCamera, ppl);
}
var ShadowInfo = function () {
  function ShadowInfo() {
    this.shadowEnabled = false;
    this.mainLightShadowNames = [];
    this.spotLightShadowNames = [];
    this.validLights = [];
  }
  var _proto = ShadowInfo.prototype;
  _proto.reset = function reset() {
    this.shadowEnabled = false;
    this.mainLightShadowNames.length = 0;
    this.spotLightShadowNames.length = 0;
    this.validLights.length = 0;
  };
  return ShadowInfo;
}();
function buildShadowPasses(cameraName, camera, ppl) {
  validPunctualLightsCulling(ppl, camera);
  var pipeline = ppl;
  var shadow = pipeline.pipelineSceneData.shadows;
  var validPunctualLights = ppl.pipelineSceneData.validPunctualLights;
  shadowInfo.reset();
  var shadows = ppl.pipelineSceneData.shadows;
  if (!shadow.enabled || shadow.type !== ShadowType.ShadowMap) {
    return shadowInfo;
  }
  shadowInfo.shadowEnabled = true;
  var n = 0;
  var m = 0;
  for (; n < shadow.maxReceived && m < validPunctualLights.length;) {
    var light = validPunctualLights[m];
    if (light.type === LightType.SPOT) {
      var spotLight = light;
      if (spotLight.shadowEnabled) {
        shadowInfo.validLights.push(light);
        n++;
      }
    }
    m++;
  }
  var _ref5 = camera.scene,
    mainLight = _ref5.mainLight;
  var mapWidth = shadows.size.x;
  var mapHeight = shadows.size.y;
  if (mainLight && mainLight.shadowEnabled) {
    shadowInfo.mainLightShadowNames[0] = "MainLightShadow" + cameraName;
    if (mainLight.shadowFixedArea) {
      buildShadowPass(shadowInfo.mainLightShadowNames[0], ppl, camera, mainLight, 0, mapWidth, mapHeight);
    } else {
      var csmLevel = pipeline.pipelineSceneData.csmSupported ? mainLight.csmLevel : 1;
      shadowInfo.mainLightShadowNames[0] = "MainLightShadow" + cameraName;
      for (var i = 0; i < csmLevel; i++) {
        buildShadowPass(shadowInfo.mainLightShadowNames[0], ppl, camera, mainLight, i, mapWidth, mapHeight);
      }
    }
  }
  for (var l = 0; l < shadowInfo.validLights.length; l++) {
    var _light4 = shadowInfo.validLights[l];
    var passName = "SpotLightShadow" + l.toString() + cameraName;
    shadowInfo.spotLightShadowNames[l] = passName;
    buildShadowPass(passName, ppl, camera, _light4, 0, mapWidth, mapHeight);
  }
  return shadowInfo;
}
var shadowInfo = new ShadowInfo();
function updateCameraUBO(setter, camera, ppl) {
  var pipeline = cclegacy.director.root.pipeline;
  var sceneData = ppl.pipelineSceneData;
  var skybox = sceneData.skybox;
  setter.setMat4('cc_matView', camera.matView);
  setter.setMat4('cc_matViewInv', camera.node.worldMatrix);
  setter.setMat4('cc_matProj', camera.matProj);
  setter.setMat4('cc_matProjInv', camera.matProjInv);
  setter.setMat4('cc_matViewProj', camera.matViewProj);
  setter.setMat4('cc_matViewProjInv', camera.matViewProjInv);
  setter.setVec4('cc_cameraPos', new Vec4(camera.position.x, camera.position.y, camera.position.z, pipeline.getCombineSignY()));
  setter.setVec4('cc_surfaceTransform', new Vec4(camera.surfaceTransform, 0.0, Math.cos(toRadian(skybox.getRotationAngle())), Math.sin(toRadian(skybox.getRotationAngle()))));
  setter.setVec4('cc_screenScale', new Vec4(sceneData.shadingScale, sceneData.shadingScale, 1.0 / sceneData.shadingScale, 1.0 / sceneData.shadingScale));
  setter.setVec4('cc_exposure', new Vec4(camera.exposure, 1.0 / camera.exposure, sceneData.isHDR ? 1.0 : 0.0, 1.0 / Camera.standardExposureValue));
}
function bindDescValue(desc, binding, value) {
  if (value instanceof Buffer) {
    desc.bindBuffer(binding, value);
  } else if (value instanceof Texture) {
    desc.bindTexture(binding, value);
  } else if (value instanceof Sampler) {
    desc.bindSampler(binding, value);
  }
}
function bindGlobalDesc(desc, binding, value) {
  bindDescValue(desc, binding, value);
}
function getDescBinding(descId, descData) {
  var layoutData = descData;
  for (var _iterator = _createForOfIteratorHelperLoose(layoutData.descriptorSetLayoutData.descriptorBlocks), _step; !(_step = _iterator()).done;) {
    var block = _step.value;
    for (var i = 0; i !== block.descriptors.length; ++i) {
      if (descId === block.descriptors[i].descriptorID) {
        return block.offset + i;
      }
    }
  }
  return -1;
}
var DescBuffManager = function () {
  function DescBuffManager(bufferSize, numBuffers) {
    if (numBuffers === void 0) {
      numBuffers = 2;
    }
    this.buffers = [];
    this.currBuffIdx = 0;
    this.device = void 0;
    this.currUniform = void 0;
    this._root = void 0;
    var root = this._root = cclegacy.director.root;
    var device = root.device;
    this.device = device;
    this.currUniform = new Float32Array(bufferSize / 4);
    for (var i = 0; i < numBuffers; i++) {
      var bufferInfo = new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, bufferSize, bufferSize);
      this.buffers.push(this.device.createBuffer(bufferInfo));
    }
  }
  var _proto2 = DescBuffManager.prototype;
  _proto2.getCurrentBuffer = function getCurrentBuffer() {
    var director = cclegacy.director;
    this.currBuffIdx = director.getTotalFrames() % this.buffers.length;
    return this.buffers[this.currBuffIdx];
  };
  _proto2.updateData = function updateData(vals) {
    this.currUniform.set(vals);
  };
  _proto2.updateBuffer = function updateBuffer(bindId, setData) {
    var descriptorSet = setData.descriptorSet;
    var buffer = this.getCurrentBuffer();
    buffer.update(this.currUniform);
    bindGlobalDesc(descriptorSet, bindId, buffer);
  };
  return DescBuffManager;
}();
var buffsMap = new Map();
var currBindBuffs = new Map();
var layouts = new Map();
function getDescriptorSetDataFromLayout(layoutName) {
  var descLayout = layouts.get(layoutName);
  if (descLayout) {
    return descLayout;
  }
  var webPip = cclegacy.director.root.pipeline;
  var stageId = webPip.layoutGraph.locateChild(webPip.layoutGraph.N, layoutName);
  var layout = webPip.layoutGraph.getLayout(stageId);
  var layoutData = layout.getSet(UpdateFrequency.PER_PASS);
  layouts.set(layoutName, layoutData);
  return layoutData;
}
function updateGlobalDescBinding(data, sceneId, idxRD, layoutName) {
  if (layoutName === void 0) {
    layoutName = 'default';
  }
  updatePerPassUBO(layoutName, sceneId, idxRD, data);
}
function getUniformBlock(block, layoutName) {
  var webPip = cclegacy.director.root.pipeline;
  var lg = webPip.layoutGraph;
  var nodeId = lg.locateChild(0xFFFFFFFF, layoutName);
  var ppl = lg.getLayout(nodeId);
  var layout = ppl.getSet(UpdateFrequency.PER_PASS).descriptorSetLayoutData;
  var nameID = lg.attributeIndex.get(block);
  return layout.uniformBlocks.get(nameID);
}
function getUniformOffset(uniform, block, layout) {
  var uniformBlock = getUniformBlock(block, layout);
  if (!uniformBlock) return -1;
  var offset = 0;
  for (var _iterator6 = _createForOfIteratorHelperLoose(uniformBlock.members), _step6; !(_step6 = _iterator6()).done;) {
    var currUniform = _step6.value;
    var currCount = getUBOTypeCount(currUniform.type);
    if (currUniform.name === uniform) {
      return offset;
    }
    offset += currCount * currUniform.count;
  }
  return -1;
}
var uniformBlockMap = new Map();
var ConstantBlockInfo = function ConstantBlockInfo() {
  this.offset = -1;
  this.buffer = [];
  this.blockId = -1;
};
var constantBlockMap = new Map();
function copyToConstantBuffer(target, val, offset) {
  var isImparity = false;
  if (offset < 0 || offset > target.length) {
    return isImparity;
  }
  var length = Math.min(val.length, target.length - offset);
  for (var i = 0; i < length; i++) {
    if (target[offset + i] !== val[i]) {
      target[offset + i] = val[i];
      isImparity = true;
    }
  }
  return isImparity;
}
function addConstantBuffer(block, layout) {
  var buffers = uniformBlockMap.get(block);
  if (buffers) {
    return buffers;
  }
  buffers = [];
  var webPip = cclegacy.director.root.pipeline;
  webPip.layoutGraph;
  var currCount = 0;
  var currBlock = getUniformBlock(block, layout);
  if (!currBlock) return null;
  for (var _iterator7 = _createForOfIteratorHelperLoose(currBlock.members), _step7; !(_step7 = _iterator7()).done;) {
    var uniform = _step7.value;
    currCount += getUBOTypeCount(uniform.type) * uniform.count;
  }
  buffers.length = currCount;
  buffers.fill(0);
  uniformBlockMap.set(block, buffers);
  return buffers;
}
function updateGlobalDescBuffer(descKey, vals) {
  var currDescBuff = buffsMap.get(descKey);
  if (!currDescBuff) {
    buffsMap.set(descKey, new DescBuffManager(vals.length * 4, 2));
    currDescBuff = buffsMap.get(descKey);
  }
  currDescBuff.updateData(vals);
}
function updateConstantBlock(constantBuff, data, descriptorSetData, sceneId, idxRD) {
  var blockId = constantBuff.blockId;
  var buffer = constantBuff.buffer;
  var isImparity = copyToConstantBuffer(buffer, data, constantBuff.offset);
  var bindId = getDescBinding(blockId, descriptorSetData);
  var desc = descriptorSetData.descriptorSet;
  if (isImparity || !desc.getBuffer(bindId) && bindId !== -1) {
    var descKey = "" + blockId + bindId + idxRD + sceneId;
    currBindBuffs.set(descKey, bindId);
    updateGlobalDescBuffer(descKey, buffer);
  }
}
function updateDefaultConstantBlock(blockId, sceneId, idxRD, vals, setData) {
  var bindId = getDescBinding(blockId, setData);
  if (bindId === -1) {
    return;
  }
  var descKey = "" + blockId + bindId + idxRD + sceneId;
  currBindBuffs.set(descKey, bindId);
  updateGlobalDescBuffer(descKey, vals);
}
function updatePerPassUBO(layout, sceneId, idxRD, user) {
  var constants = user.constants,
    samplers = user.samplers,
    textures = user.textures,
    buffers = user.buffers;
  var webPip = cclegacy.director.root.pipeline;
  var lg = webPip.layoutGraph;
  var descriptorSetData = getDescriptorSetDataFromLayout(layout);
  currBindBuffs.clear();
  var _loop = function _loop() {
    var _step8$value = _step8.value,
      key = _step8$value[0],
      data = _step8$value[1];
    var constantBlock = constantBlockMap.get(key);
    if (!constantBlock) {
      var currMemKey = Array.from(lg.constantIndex).find(function (_ref6) {
        _ref6[0];
          var v = _ref6[1];
        return v === key;
      })[0];
      for (var _iterator11 = _createForOfIteratorHelperLoose(lg.attributeIndex), _step11; !(_step11 = _iterator11()).done;) {
        var _step11$value = _step11.value,
          block = _step11$value[0],
          blockId = _step11$value[1];
        var constantBuff = addConstantBuffer(block, layout);
        if (!constantBuff) continue;
        var offset = getUniformOffset(currMemKey, block, layout);
        if (offset === -1) {
          updateDefaultConstantBlock(blockId, sceneId, idxRD, constantBuff, descriptorSetData);
          continue;
        }
        constantBlockMap.set(key, new ConstantBlockInfo());
        constantBlock = constantBlockMap.get(key);
        constantBlock.buffer = constantBuff;
        constantBlock.blockId = blockId;
        constantBlock.offset = offset;
        updateConstantBlock(constantBlock, data, descriptorSetData, sceneId, idxRD);
      }
    } else {
      updateConstantBlock(constantBlock, data, descriptorSetData, sceneId, idxRD);
    }
  };
  for (var _iterator8 = _createForOfIteratorHelperLoose(constants), _step8; !(_step8 = _iterator8()).done;) {
    _loop();
  }
  var descriptorSet = descriptorSetData.descriptorSet;
  for (var _iterator9 = _createForOfIteratorHelperLoose(textures), _step9; !(_step9 = _iterator9()).done;) {
    var _step9$value = _step9.value,
      key = _step9$value[0],
      value = _step9$value[1];
    var bindId = getDescBinding(key, descriptorSetData);
    if (bindId === -1) {
      continue;
    }
    var tex = descriptorSet.getTexture(bindId);
    if (value !== tex || !tex.gpuTexture && !(tex.gpuTextureView && tex.gpuTextureView.gpuTexture)) {
      bindGlobalDesc(descriptorSet, bindId, value);
    }
  }
  for (var _iterator0 = _createForOfIteratorHelperLoose(samplers), _step0; !(_step0 = _iterator0()).done;) {
    var _step0$value = _step0.value,
      _key = _step0$value[0],
      _value = _step0$value[1];
    var _bindId = getDescBinding(_key, descriptorSetData);
    if (_bindId === -1) {
      continue;
    }
    var sampler = descriptorSet.getSampler(_bindId);
    if (sampler !== _value) {
      bindGlobalDesc(descriptorSet, _bindId, _value);
    }
  }
  for (var _iterator1 = _createForOfIteratorHelperLoose(currBindBuffs), _step1; !(_step1 = _iterator1()).done;) {
    var _step1$value = _step1.value,
      _key2 = _step1$value[0],
      _value2 = _step1$value[1];
    var buffManager = buffsMap.get(_key2);
    buffManager.updateBuffer(_value2, descriptorSetData);
  }
  for (var _iterator10 = _createForOfIteratorHelperLoose(buffers), _step10; !(_step10 = _iterator10()).done;) {
    var _step10$value = _step10.value,
      _key3 = _step10$value[0],
      _value3 = _step10$value[1];
    var _bindId2 = getDescBinding(_key3, descriptorSetData);
    if (_bindId2 === -1) {
      continue;
    }
    var buffer = descriptorSet.getBuffer(_bindId2);
    if (!buffer) {
      bindGlobalDesc(descriptorSet, _bindId2, _value3);
    }
  }
}
function hashCombineKey(val) {
  return val + "-";
}
function hashCombineStr(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
function bool(val) {
  return !!val;
}
function AlignUp(value, alignment) {
  return value + (alignment - 1) & ~(alignment - 1);
}
var kLightMeterScale = 10000;
function SetLightUBO(light, bHDR, exposure, shadowInfo, buffer, offset, elemSize) {
  var vec4Array = new Float32Array(4);
  var size = 0.0;
  var range = 0.0;
  var luminanceHDR = 0.0;
  var luminanceLDR = 0.0;
  if (light && light.type === LightType.SPHERE) {
    var sphereLight = light;
    vec4Array[0] = sphereLight.position.x;
    vec4Array[1] = sphereLight.position.y;
    vec4Array[2] = sphereLight.position.z;
    vec4Array[3] = LightType.SPHERE;
    size = sphereLight.size;
    range = sphereLight.range;
    luminanceHDR = sphereLight.luminanceHDR;
    luminanceLDR = sphereLight.luminanceLDR;
  } else if (light && light.type === LightType.SPOT) {
    var spotLight = light;
    vec4Array[0] = spotLight.position.x;
    vec4Array[1] = spotLight.position.y;
    vec4Array[2] = spotLight.position.z;
    vec4Array[3] = LightType.SPOT;
    size = spotLight.size;
    range = spotLight.range;
    luminanceHDR = spotLight.luminanceHDR;
    luminanceLDR = spotLight.luminanceLDR;
  } else if (light && light.type === LightType.POINT) {
    var pointLight = light;
    vec4Array[0] = pointLight.position.x;
    vec4Array[1] = pointLight.position.y;
    vec4Array[2] = pointLight.position.z;
    vec4Array[3] = LightType.POINT;
    size = 0.0;
    range = pointLight.range;
    luminanceHDR = pointLight.luminanceHDR;
    luminanceLDR = pointLight.luminanceLDR;
  } else if (light && light.type === LightType.RANGED_DIRECTIONAL) {
    var rangedDirLight = light;
    vec4Array[0] = rangedDirLight.position.x;
    vec4Array[1] = rangedDirLight.position.y;
    vec4Array[2] = rangedDirLight.position.z;
    vec4Array[3] = LightType.RANGED_DIRECTIONAL;
    size = 0.0;
    range = 0.0;
    luminanceHDR = rangedDirLight.illuminanceHDR;
    luminanceLDR = rangedDirLight.illuminanceLDR;
  }
  var index = offset + UBOForwardLightEnum.LIGHT_POS_OFFSET;
  buffer.set(vec4Array, index);
  index = offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET;
  vec4Array.set([size, range, 0, 0]);
  buffer.set(vec4Array, index);
  index = offset + UBOForwardLightEnum.LIGHT_COLOR_OFFSET;
  var color = light ? light.color : new Color();
  if (light && light.useColorTemperature) {
    var tempRGB = light.colorTemperatureRGB;
    buffer[index++] = color.x * tempRGB.x;
    buffer[index++] = color.y * tempRGB.y;
    buffer[index++] = color.z * tempRGB.z;
  } else {
    buffer[index++] = color.x;
    buffer[index++] = color.y;
    buffer[index++] = color.z;
  }
  if (bHDR) {
    buffer[index] = luminanceHDR * exposure * kLightMeterScale;
  } else {
    buffer[index] = luminanceLDR;
  }
  switch (light ? light.type : LightType.UNKNOWN) {
    case LightType.SPHERE:
      buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 2] = 0;
      buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 3] = 0;
      break;
    case LightType.SPOT:
      {
        var _spotLight = light;
        buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 2] = _spotLight.spotAngle;
        buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 3] = shadowInfo && shadowInfo.enabled && _spotLight.shadowEnabled && shadowInfo.type === ShadowType.ShadowMap ? 1.0 : 0.0;
        index = offset + UBOForwardLightEnum.LIGHT_DIR_OFFSET;
        var direction = _spotLight.direction;
        buffer[index++] = direction.x;
        buffer[index++] = direction.y;
        buffer[index] = direction.z;
        buffer[offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET + 0] = 0;
        buffer[offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET + 1] = 0;
        buffer[offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET + 2] = 0;
        buffer[offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET + 3] = _spotLight.angleAttenuationStrength;
      }
      break;
    case LightType.POINT:
      buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 2] = 0;
      buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 3] = 0;
      break;
    case LightType.RANGED_DIRECTIONAL:
      {
        var _rangedDirLight = light;
        var right = _rangedDirLight.right;
        buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 0] = right.x;
        buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 1] = right.y;
        buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 2] = right.z;
        buffer[offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET + 3] = 0;
        var _direction = _rangedDirLight.direction;
        buffer[offset + UBOForwardLightEnum.LIGHT_DIR_OFFSET + 0] = _direction.x;
        buffer[offset + UBOForwardLightEnum.LIGHT_DIR_OFFSET + 1] = _direction.y;
        buffer[offset + UBOForwardLightEnum.LIGHT_DIR_OFFSET + 2] = _direction.z;
        buffer[offset + UBOForwardLightEnum.LIGHT_DIR_OFFSET + 3] = 0;
        var scale = _rangedDirLight.scale;
        buffer[offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET + 0] = scale.x * 0.5;
        buffer[offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET + 1] = scale.y * 0.5;
        buffer[offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET + 2] = scale.z * 0.5;
        buffer[offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET + 3] = 0;
      }
      break;
  }
}
var RenderPassMergeInfo = function () {
  function RenderPassMergeInfo(combineHash, needBeginRP, needEndRP) {
    if (combineHash === void 0) {
      combineHash = 0;
    }
    if (needBeginRP === void 0) {
      needBeginRP = true;
    }
    if (needEndRP === void 0) {
      needEndRP = true;
    }
    this.combineHash = combineHash;
    this.needBeginRP = needBeginRP;
    this.needEndRP = needEndRP;
  }
  var _proto3 = RenderPassMergeInfo.prototype;
  _proto3.init = function init(combineHash, needBeginRP, needEndRP) {
    if (needBeginRP === void 0) {
      needBeginRP = true;
    }
    if (needEndRP === void 0) {
      needEndRP = true;
    }
    this.combineHash = combineHash;
    this.needBeginRP = needBeginRP;
    this.needEndRP = needEndRP;
  };
  return RenderPassMergeInfo;
}();
var passOrders = [];
var rpCombineMap = new Map();
var rpMergeInfos = new Map();
var rpMergeInfoPool = new RecyclePool(function () {
  return new RenderPassMergeInfo();
}, 16);
function resetPassMGState() {
  rpMergeInfoPool.reset();
  rpMergeInfos.clear();
  rpCombineMap.clear();
  passOrders.length = 0;
}
function processPassMG(pass) {
  var currCHash = rpCombineMap.get(pass);
  var currRPInfo = rpMergeInfoPool.add();
  if (!rpMergeInfos.has(pass)) {
    rpMergeInfos.set(pass, currRPInfo);
  }
  currRPInfo.init(currCHash);
  var poLen = passOrders.length;
  if (poLen !== 0) {
    var isLoadOP = false;
    for (var _iterator12 = _createForOfIteratorHelperLoose(pass.rasterViews), _step12; !(_step12 = _iterator12()).done;) {
      var _step12$value = _step12.value;
        _step12$value[0];
        var raster = _step12$value[1];
      if (raster.loadOp === LoadOp.LOAD) {
        isLoadOP = true;
        break;
      }
    }
    var prevPass = passOrders[poLen - 1];
    if (isLoadOP && rpCombineMap.get(prevPass) === currCHash) {
      var prevInfo = rpMergeInfos.get(prevPass);
      prevInfo.needEndRP = false;
      currRPInfo.needBeginRP = false;
    }
  }
  passOrders.push(pass);
}
function genHashValue(pass) {
  var hashCodeParts = [];
  var combineHashParts = [];
  for (var _iterator13 = _createForOfIteratorHelperLoose(pass.rasterViews), _step13; !(_step13 = _iterator13()).done;) {
    var _step13$value = _step13.value,
      name = _step13$value[0],
      raster = _step13$value[1];
    var commonParts = [hashCombineKey(name), hashCombineKey(raster.slotName), hashCombineKey(raster.accessType), hashCombineKey(raster.attachmentType), hashCombineKey(raster.storeOp), hashCombineKey(raster.clearFlags), hashCombineKey(raster.slotID), hashCombineKey(raster.shaderStageFlags)];
    var extraParts = [hashCombineKey(raster.loadOp), hashCombineKey(raster.clearColor.x), hashCombineKey(raster.clearColor.y), hashCombineKey(raster.clearColor.z), hashCombineKey(raster.clearColor.w)];
    var fullHash = commonParts.concat(extraParts).join('');
    var _combineHash = commonParts.join('');
    hashCodeParts.push(fullHash);
    combineHashParts.push(_combineHash);
  }
  var subpassGraph = pass.subpassGraph;
  var subpasses = subpassGraph._subpasses;
  for (var _iterator14 = _createForOfIteratorHelperLoose(subpasses), _step14; !(_step14 = _iterator14()).done;) {
    var subpass = _step14.value;
    var resolvePairs = subpass.resolvePairs;
    for (var _iterator15 = _createForOfIteratorHelperLoose(resolvePairs), _step15; !(_step15 = _iterator15()).done;) {
      var resolve = _step15.value;
      var _commonParts = [hashCombineKey(resolve.source), hashCombineKey(resolve.target)];
      var _combineHash2 = _commonParts.join('');
      combineHashParts.push(_combineHash2);
    }
  }
  pass.hashValue = hashCombineStr(hashCodeParts.join(''));
  rpCombineMap.set(pass, hashCombineStr(combineHashParts.join('')));
  processPassMG(pass);
}

var _uboVec$1 = new Vec4();
var _uboVec3 = new Vec3();
var _uboCol = new Color();
var _matView = new Mat4();
var _mulMatView = new Mat4();
function setTextureUBOView(setter, cfg, layout) {
  var skybox = cfg.skybox;
  var director = cclegacy.director;
  var root = director.root;
  var pipeline = root.pipeline;
  if (skybox.reflectionMap) {
    var texture = skybox.reflectionMap.getGFXTexture();
    var sampler = root.device.getSampler(skybox.reflectionMap.getSamplerInfo());
    setter.setTexture('cc_environment', texture);
    setter.setSampler('cc_environment', sampler);
  } else {
    var envmap = skybox.envmap ? skybox.envmap : builtinResMgr.get('default-cube-texture');
    if (envmap) {
      var _texture = envmap.getGFXTexture();
      var _sampler = root.device.getSampler(envmap.getSamplerInfo());
      setter.setTexture('cc_environment', _texture);
      setter.setSampler('cc_environment', _sampler);
    }
  }
  var diffuseMap = skybox.diffuseMap ? skybox.diffuseMap : builtinResMgr.get('default-cube-texture');
  if (diffuseMap) {
    var _texture2 = diffuseMap.getGFXTexture();
    var _sampler2 = root.device.getSampler(diffuseMap.getSamplerInfo());
    setter.setTexture('cc_diffuseMap', _texture2);
    setter.setSampler('cc_diffuseMap', _sampler2);
  }
  if (!setter.hasSampler('cc_shadowMap')) {
    setter.setSampler('cc_shadowMap', pipeline.defaultSampler);
  }
  if (!setter.hasTexture('cc_shadowMap')) {
    setter.setTexture('cc_shadowMap', pipeline.defaultShadowTexture);
  }
  if (!setter.hasSampler('cc_spotShadowMap')) {
    setter.setSampler('cc_spotShadowMap', pipeline.defaultSampler);
  }
  if (!setter.hasTexture('cc_spotShadowMap')) {
    setter.setTexture('cc_spotShadowMap', pipeline.defaultShadowTexture);
  }
}
function setCameraUBOValues(setter, camera, cfg, scene, layoutName) {
  var _skybox$envmap;
  var director = cclegacy.director;
  var root = director.root;
  var pipeline = root.pipeline;
  var shadowInfo = cfg.shadows;
  var skybox = cfg.skybox;
  var shadingScale = cfg.shadingScale;
  if (camera) {
    setter.setMat4('cc_matView', camera.matView);
    setter.setMat4('cc_matViewInv', camera.node.worldMatrix);
    setter.setMat4('cc_matProj', camera.matProj);
    setter.setMat4('cc_matProjInv', camera.matProjInv);
    setter.setMat4('cc_matViewProj', camera.matViewProj);
    setter.setMat4('cc_matViewProjInv', camera.matViewProjInv);
    _uboVec$1.set(camera.surfaceTransform, camera.cameraUsage, Math.cos(toRadian(skybox.getRotationAngle())), Math.sin(toRadian(skybox.getRotationAngle())));
    setter.setVec4('cc_surfaceTransform', _uboVec$1);
    _uboVec$1.set(camera.exposure, 1.0 / camera.exposure, cfg.isHDR ? 1.0 : 0.0, 1.0 / Camera.standardExposureValue);
    setter.setVec4('cc_exposure', _uboVec$1);
  }
  if (camera) {
    _uboVec$1.set(camera.position.x, camera.position.y, camera.position.z, pipeline.getCombineSignY());
  } else {
    _uboVec$1.set(0, 0, 0, pipeline.getCombineSignY());
  }
  setter.setVec4('cc_cameraPos', _uboVec$1);
  _uboVec$1.set(cfg.shadingScale, cfg.shadingScale, 1.0 / cfg.shadingScale, 1.0 / cfg.shadingScale);
  setter.setVec4('cc_screenScale', _uboVec$1);
  var mainLight = scene && scene.mainLight;
  if (mainLight) {
    var shadowEnable = mainLight.shadowEnabled && shadowInfo.type === ShadowType.ShadowMap ? 1.0 : 0.0;
    _uboVec$1.set(mainLight.direction.x, mainLight.direction.y, mainLight.direction.z, shadowEnable);
    setter.setVec4('cc_mainLitDir', _uboVec$1);
    var r = mainLight.color.x;
    var g = mainLight.color.y;
    var b = mainLight.color.z;
    if (mainLight.useColorTemperature) {
      r *= mainLight.colorTemperatureRGB.x;
      g *= mainLight.colorTemperatureRGB.y;
      b *= mainLight.colorTemperatureRGB.z;
    }
    var w = mainLight.illuminance;
    if (cfg.isHDR && camera) {
      w *= camera.exposure;
    }
    _uboVec$1.set(r, g, b, w);
    setter.setVec4('cc_mainLitColor', _uboVec$1);
  } else {
    _uboVec$1.set(0, 0, 1, 0);
    setter.setVec4('cc_mainLitDir', _uboVec$1);
    _uboVec$1.set(0, 0, 0, 0);
    setter.setVec4('cc_mainLitColor', _uboVec$1);
  }
  var ambient = cfg.ambient;
  var skyColor = ambient.skyColor;
  if (cfg.isHDR) {
    skyColor.w = ambient.skyIllum * (camera ? camera.exposure : 1);
  } else {
    skyColor.w = ambient.skyIllum;
  }
  _uboVec$1.set(skyColor.x, skyColor.y, skyColor.z, skyColor.w);
  setter.setVec4('cc_ambientSky', _uboVec$1);
  _uboVec$1.set(ambient.groundAlbedo.x, ambient.groundAlbedo.y, ambient.groundAlbedo.z, skybox.envmap ? (_skybox$envmap = skybox.envmap) == null ? void 0 : _skybox$envmap.mipmapLevel : 1.0);
  setter.setVec4('cc_ambientGround', _uboVec$1);
  var fog = cfg.fog;
  var colorTempRGB = fog.colorArray;
  _uboVec$1.set(colorTempRGB.x, colorTempRGB.y, colorTempRGB.z, colorTempRGB.z);
  setter.setVec4('cc_fogColor', _uboVec$1);
  _uboVec$1.set(fog.fogStart, fog.fogEnd, fog.fogDensity, 0.0);
  setter.setVec4('cc_fogBase', _uboVec$1);
  _uboVec$1.set(fog.fogTop, fog.fogRange, fog.fogAtten, 0.0);
  setter.setVec4('cc_fogAdd', _uboVec$1);
  if (camera) {
    _uboVec$1.set(camera.nearClip, camera.farClip, camera.getClipSpaceMinz(), 0.0);
    setter.setVec4('cc_nearFar', _uboVec$1);
    _uboVec$1.set(camera.viewport.x, camera.viewport.y, shadingScale * camera.window.width * camera.viewport.z, shadingScale * camera.window.height * camera.viewport.w);
    setter.setVec4('cc_viewPort', _uboVec$1);
  }
}
var DrawInstance = function () {
  function DrawInstance(subModel, priority, hash, depth, shaderID, passIndex) {
    if (subModel === void 0) {
      subModel = null;
    }
    if (priority === void 0) {
      priority = 0;
    }
    if (hash === void 0) {
      hash = 0;
    }
    if (depth === void 0) {
      depth = 0;
    }
    if (shaderID === void 0) {
      shaderID = 0;
    }
    if (passIndex === void 0) {
      passIndex = 0;
    }
    this.subModel = void 0;
    this.priority = void 0;
    this.hash = void 0;
    this.depth = void 0;
    this.shaderID = void 0;
    this.passIndex = void 0;
    this.subModel = subModel;
    this.priority = priority;
    this.hash = hash;
    this.depth = depth;
    this.shaderID = shaderID;
    this.passIndex = passIndex;
  }
  var _proto = DrawInstance.prototype;
  _proto.update = function update(subModel, priority, hash, depth, shaderID, passIndex) {
    if (subModel === void 0) {
      subModel = null;
    }
    if (priority === void 0) {
      priority = 0;
    }
    if (hash === void 0) {
      hash = 0;
    }
    if (depth === void 0) {
      depth = 0;
    }
    if (shaderID === void 0) {
      shaderID = 0;
    }
    if (passIndex === void 0) {
      passIndex = 0;
    }
    this.subModel = subModel;
    this.priority = priority;
    this.hash = hash;
    this.depth = depth;
    this.shaderID = shaderID;
    this.passIndex = passIndex;
  };
  return DrawInstance;
}();
var instancePool = new RecyclePool(function () {
  return new DrawInstance();
}, 8);
var CC_USE_RGBE_OUTPUT = 'CC_USE_RGBE_OUTPUT';
function getLayoutId(passLayout, phaseLayout) {
  var r = cclegacy.rendering;
  return r.getPhaseID(r.getPassID(passLayout), phaseLayout);
}
function getPassIndexFromLayout(subModel, phaseLayoutId) {
  var passes = subModel.passes;
  for (var k = 0; k < passes.length; k++) {
    if (passes[k].phaseID === phaseLayoutId) {
      return k;
    }
  }
  return -1;
}
var ProbeHelperQueue = function () {
  function ProbeHelperQueue() {
    this.probeMap = new Array();
    this.defaultId = getLayoutId('default', 'default');
  }
  var _proto2 = ProbeHelperQueue.prototype;
  _proto2.clear = function clear() {
    this.probeMap.length = 0;
  };
  _proto2.applyMacro = function applyMacro() {
    for (var _iterator = _createForOfIteratorHelperLoose(this.probeMap), _step; !(_step = _iterator()).done;) {
      var subModel = _step.value;
      var patches = [{
        name: CC_USE_RGBE_OUTPUT,
        value: true
      }];
      if (subModel.patches) {
        patches = patches.concat(subModel.patches);
      }
      subModel.onMacroPatchesStateChanged(patches);
    }
  };
  _proto2.removeMacro = function removeMacro() {
    for (var _iterator2 = _createForOfIteratorHelperLoose(this.probeMap), _step2; !(_step2 = _iterator2()).done;) {
      var subModel = _step2.value;
      if (!subModel.patches) continue;
      var patches = subModel.patches.filter(function (patch) {
        return patch.name !== CC_USE_RGBE_OUTPUT;
      });
      if (patches.length === 0) {
        subModel.onMacroPatchesStateChanged(null);
      } else {
        subModel.onMacroPatchesStateChanged(patches);
      }
    }
  };
  _proto2.addToProbeQueue = function addToProbeQueue(model, probeLayoutId) {
    var subModels = model.subModels;
    for (var j = 0; j < subModels.length; j++) {
      var subModel = subModels[j];
      var isTransparent = subModel.passes[0].blendState.targets[0].blend;
      if (isTransparent) {
        continue;
      }
      var passIdx = getPassIndexFromLayout(subModel, probeLayoutId);
      var bUseReflectPass = true;
      if (passIdx < 0) {
        probeLayoutId = this.defaultId;
        passIdx = getPassIndexFromLayout(subModel, probeLayoutId);
        bUseReflectPass = false;
      }
      if (passIdx < 0) {
        continue;
      }
      if (!bUseReflectPass) {
        this.probeMap.push(subModel);
      }
    }
  };
  return ProbeHelperQueue;
}();
function setShadowUBOLightView(setter, camera, light, csmLevel, layout) {
  var director = cclegacy.director;
  var pipeline = director.root.pipeline;
  var device = pipeline.device;
  var sceneData = pipeline.pipelineSceneData;
  var shadowInfo = sceneData.shadows;
  if (shadowInfo.type === ShadowType.Planar) {
    return;
  }
  var csmLayers = sceneData.csmLayers;
  var packing = supportsR32FloatTexture(device) ? 0.0 : 1.0;
  var cap = pipeline.device.capabilities;
  if (shadowInfo.enabled) {
    if (shadowInfo.type === ShadowType.ShadowMap) {
      if (light && light.node && light.type === LightType.DIRECTIONAL) {
        csmLayers.update(sceneData, camera);
      }
    }
  }
  switch (light.type) {
    case LightType.DIRECTIONAL:
      {
        var mainLight = light;
        if (shadowInfo.enabled && mainLight && mainLight.shadowEnabled) {
          if (shadowInfo.type === ShadowType.ShadowMap) {
            var near = 0.1;
            var far = 0;
            var matShadowView;
            var matShadowProj;
            var matShadowViewProj;
            var levelCount = 0;
            if (mainLight.shadowFixedArea || mainLight.csmLevel === CSMLevel.LEVEL_1) {
              matShadowView = csmLayers.specialLayer.matShadowView;
              matShadowProj = csmLayers.specialLayer.matShadowProj;
              matShadowViewProj = csmLayers.specialLayer.matShadowViewProj;
              if (mainLight.shadowFixedArea) {
                near = mainLight.shadowNear;
                far = mainLight.shadowFar;
                levelCount = 0;
              } else {
                near = 0.1;
                far = csmLayers.specialLayer.shadowCameraFar;
                levelCount = 1;
              }
              _uboVec$1.set(LightType.DIRECTIONAL, packing, mainLight.shadowNormalBias, 0);
              setter.setVec4('cc_shadowLPNNInfo', _uboVec$1);
            } else {
              var layer = csmLayers.layers[csmLevel];
              matShadowView = layer.matShadowView;
              matShadowProj = layer.matShadowProj;
              matShadowViewProj = layer.matShadowViewProj;
              near = layer.splitCameraNear;
              far = layer.splitCameraFar;
              levelCount = mainLight.csmLevel;
            }
            setter.setMat4('cc_matLightView', matShadowView);
            _uboVec$1.set(matShadowProj.m10, matShadowProj.m14, matShadowProj.m11, matShadowProj.m15);
            setter.setVec4('cc_shadowProjDepthInfo', _uboVec$1);
            _uboVec$1.set(matShadowProj.m00, matShadowProj.m05, 1.0 / matShadowProj.m00, 1.0 / matShadowProj.m05);
            setter.setVec4('cc_shadowProjInfo', _uboVec$1);
            setter.setMat4('cc_matLightViewProj', matShadowViewProj);
            _uboVec$1.set(near, far, 0, 1.0 - mainLight.shadowSaturation);
            setter.setVec4('cc_shadowNFLSInfo', _uboVec$1);
            _uboVec$1.set(LightType.DIRECTIONAL, packing, mainLight.shadowNormalBias, levelCount);
            setter.setVec4('cc_shadowLPNNInfo', _uboVec$1);
            _uboVec$1.set(shadowInfo.size.x, shadowInfo.size.y, mainLight.shadowPcf, mainLight.shadowBias);
            setter.setVec4('cc_shadowWHPBInfo', _uboVec$1);
          }
        }
        break;
      }
    case LightType.SPOT:
      {
        var spotLight = light;
        if (shadowInfo.enabled && spotLight && spotLight.shadowEnabled) {
          Mat4.invert(_matView, spotLight.node.getWorldMatrix());
          setter.setMat4('cc_matLightView', _matView);
          Mat4.perspective(_mulMatView, spotLight.angle, 1.0, 0.001, spotLight.range, true, cap.clipSpaceMinZ, cap.clipSpaceSignY, 0);
          var matShadowInvProj = _mulMatView.clone().invert();
          var _matShadowProj = _mulMatView.clone();
          Mat4.multiply(_matView, _mulMatView, _matView);
          setter.setMat4('cc_matLightViewProj', _matView);
          _uboVec$1.set(0.01, light.range, 0.0, 0.0);
          setter.setVec4('cc_shadowNFLSInfo', _uboVec$1);
          _uboVec$1.set(shadowInfo.size.x, shadowInfo.size.y, spotLight.shadowPcf, spotLight.shadowBias);
          setter.setVec4('cc_shadowWHPBInfo', _uboVec$1);
          _uboVec$1.set(LightType.SPOT, packing, spotLight.shadowNormalBias, 0.0);
          setter.setVec4('cc_shadowLPNNInfo', _uboVec$1);
          _uboVec$1.set(_matShadowProj.m10, _matShadowProj.m14, _matShadowProj.m11, _matShadowProj.m15);
          setter.setVec4('cc_shadowProjDepthInfo', _uboVec$1);
          _uboVec$1.set(matShadowInvProj.m10, matShadowInvProj.m14, matShadowInvProj.m11, matShadowInvProj.m15);
          setter.setVec4('cc_shadowInvProjDepthInfo', _uboVec$1);
          _uboVec$1.set(_matShadowProj.m00, _matShadowProj.m05, 1.0 / _matShadowProj.m00, 1.0 / _matShadowProj.m05);
          setter.setVec4('cc_shadowProjInfo', _uboVec$1);
        }
        break;
      }
    case LightType.SPHERE:
      {
        _uboVec$1.set(shadowInfo.size.x, shadowInfo.size.y, 1.0, 0.0);
        setter.setVec4('cc_shadowWHPBInfo', _uboVec$1);
        _uboVec$1.set(LightType.SPHERE, packing, 0.0, 0.0);
        setter.setVec4('cc_shadowLPNNInfo', _uboVec$1);
        break;
      }
    case LightType.POINT:
      {
        _uboVec$1.set(shadowInfo.size.x, shadowInfo.size.y, 1.0, 0.0);
        setter.setVec4('cc_shadowWHPBInfo', _uboVec$1);
        _uboVec$1.set(LightType.POINT, packing, 0.0, 0.0);
        setter.setVec4('cc_shadowLPNNInfo', _uboVec$1);
        break;
      }
  }
  _uboCol.set(shadowInfo.shadowColor.x, shadowInfo.shadowColor.y, shadowInfo.shadowColor.z, shadowInfo.shadowColor.w);
  setter.setColor('cc_shadowColor', _uboCol);
}
function getPCFRadius(shadowInfo, mainLight) {
  var shadowMapSize = shadowInfo.size.x;
  switch (mainLight.shadowPcf) {
    case PCFType.HARD:
      return 0.0;
    case PCFType.SOFT:
      return 1.0 / (shadowMapSize * 0.5);
    case PCFType.SOFT_2X:
      return 2.0 / (shadowMapSize * 0.5);
    case PCFType.SOFT_4X:
      return 3.0 / (shadowMapSize * 0.5);
  }
  return 0.0;
}
function setShadowUBOView(setter, camera, layout) {
  var director = cclegacy.director;
  var pipeline = director.root.pipeline;
  var device = pipeline.device;
  var scene = director.getScene();
  var mainLight = camera && camera.scene ? camera.scene.mainLight : scene ? scene.renderScene.mainLight : null;
  var sceneData = pipeline.pipelineSceneData;
  var shadowInfo = sceneData.shadows;
  var csmLayers = sceneData.csmLayers;
  var csmSupported = sceneData.csmSupported;
  var packing = supportsR32FloatTexture(device) ? 0.0 : 1.0;
  if (mainLight && shadowInfo.enabled) {
    if (shadowInfo.type === ShadowType.ShadowMap) {
      if (mainLight.shadowEnabled) {
        if (mainLight.shadowFixedArea || mainLight.csmLevel === CSMLevel.LEVEL_1 || !csmSupported) {
          var matShadowView = csmLayers.specialLayer.matShadowView;
          var matShadowProj = csmLayers.specialLayer.matShadowProj;
          var matShadowViewProj = csmLayers.specialLayer.matShadowViewProj;
          var near = mainLight.shadowNear;
          var far = mainLight.shadowFar;
          setter.setMat4('cc_matLightView', matShadowView);
          _uboVec$1.set(matShadowProj.m10, matShadowProj.m14, matShadowProj.m11, matShadowProj.m15);
          setter.setVec4('cc_shadowProjDepthInfo', _uboVec$1);
          _uboVec$1.set(matShadowProj.m00, matShadowProj.m05, 1.0 / matShadowProj.m00, 1.0 / matShadowProj.m05);
          setter.setVec4('cc_shadowProjInfo', _uboVec$1);
          setter.setMat4('cc_matLightViewProj', matShadowViewProj);
          _uboVec$1.set(near, far, 0, 1.0 - mainLight.shadowSaturation);
          setter.setVec4('cc_shadowNFLSInfo', _uboVec$1);
          _uboVec$1.set(LightType.DIRECTIONAL, packing, mainLight.shadowNormalBias, 0);
          setter.setVec4('cc_shadowLPNNInfo', _uboVec$1);
        } else {
          var layerThreshold = getPCFRadius(shadowInfo, mainLight);
          for (var i = 0; i < mainLight.csmLevel; i++) {
            var layer = csmLayers.layers[i];
            var _matShadowView = layer.matShadowView;
            _uboVec$1.set(_matShadowView.m00, _matShadowView.m04, _matShadowView.m08, layerThreshold);
            setter.setVec4('cc_csmViewDir0', _uboVec$1, i);
            _uboVec$1.set(_matShadowView.m01, _matShadowView.m05, _matShadowView.m09, layer.splitCameraNear);
            setter.setVec4('cc_csmViewDir1', _uboVec$1, i);
            _uboVec$1.set(_matShadowView.m02, _matShadowView.m06, _matShadowView.m10, layer.splitCameraFar);
            setter.setVec4('cc_csmViewDir2', _uboVec$1, i);
            var csmAtlas = layer.csmAtlas;
            setter.setVec4('cc_csmAtlas', csmAtlas, i);
            var _matShadowViewProj = layer.matShadowViewProj;
            setter.setMat4('cc_matCSMViewProj', _matShadowViewProj, i);
            var _matShadowProj2 = layer.matShadowProj;
            _uboVec$1.set(_matShadowProj2.m10, _matShadowProj2.m14, _matShadowProj2.m11, _matShadowProj2.m15);
            setter.setVec4('cc_csmProjDepthInfo', _uboVec$1, i);
            _uboVec$1.set(_matShadowProj2.m00, _matShadowProj2.m05, 1.0 / _matShadowProj2.m00, 1.0 / _matShadowProj2.m05);
            setter.setVec4('cc_csmProjInfo', _uboVec$1, i);
          }
          _uboVec$1.set(mainLight.csmTransitionRange, 0, 0, 0);
          setter.setVec4('cc_csmSplitsInfo', _uboVec$1);
          _uboVec$1.set(0.1, mainLight.shadowDistance, 0, 1.0 - mainLight.shadowSaturation);
          setter.setVec4('cc_shadowNFLSInfo', _uboVec$1);
          _uboVec$1.set(LightType.DIRECTIONAL, packing, mainLight.shadowNormalBias, mainLight.csmLevel);
          setter.setVec4('cc_shadowLPNNInfo', _uboVec$1);
        }
        _uboVec$1.set(shadowInfo.size.x, shadowInfo.size.y, mainLight.shadowPcf, mainLight.shadowBias);
        setter.setVec4('cc_shadowWHPBInfo', _uboVec$1);
      }
    } else {
      Vec3.normalize(_uboVec3, shadowInfo.normal);
      _uboVec$1.set(_uboVec3.x, _uboVec3.y, _uboVec3.z, -shadowInfo.distance);
      setter.setVec4('cc_planarNDInfo', _uboVec$1);
      _uboVec$1.set(0, 0, 0, shadowInfo.planeBias);
      setter.setVec4('cc_shadowWHPBInfo', _uboVec$1);
    }
    setter.setMathColor('cc_shadowColor', shadowInfo.shadowColor);
  }
}
var WebSetter = function () {
  function WebSetter(data, lg) {
    this._data = void 0;
    this._lg = void 0;
    this._vertID = -1;
    this._currBlock = void 0;
    this._currStage = '';
    this._currFrequency = UpdateFrequency.PER_PASS;
    this._currCount = void 0;
    this._currConstant = [];
    this._data = data;
    this._lg = lg;
  }
  var _proto3 = WebSetter.prototype;
  _proto3.setMat4 = function setMat4(name, mat, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    WebSetter.setMat4(this._lg, this._data, name, mat, idx);
  };
  WebSetter.setMat4 = function setMat4(lg, data, name, mat, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    var info = WebSetter.getConstantInfo(lg, data, name);
    Mat4.toArray(info.dataArr, mat, idx * 16);
    data.constants.set(info.constantID, info.dataArr);
  };
  _proto3.setQuaternion = function setQuaternion(name, quat, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    WebSetter.setQuaternion(this._lg, this._data, name, quat, idx);
  };
  WebSetter.setQuaternion = function setQuaternion(lg, data, name, quat, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    var info = WebSetter.getConstantInfo(lg, data, name);
    Quat.toArray(info.dataArr, quat, idx * 4);
    data.constants.set(info.constantID, info.dataArr);
  };
  _proto3.setColor = function setColor(name, color, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    WebSetter.setColor(this._lg, this._data, name, color, idx);
  };
  WebSetter.setColor = function setColor(lg, data, name, color, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    var info = WebSetter.getConstantInfo(lg, data, name);
    var currIdx = idx * 4;
    info.dataArr[0 + currIdx] = color.x;
    info.dataArr[1 + currIdx] = color.y;
    info.dataArr[2 + currIdx] = color.z;
    info.dataArr[3 + currIdx] = color.w;
    data.constants.set(info.constantID, info.dataArr);
  };
  _proto3.setMathColor = function setMathColor(name, color, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    WebSetter.setMathColor(this._lg, this._data, name, color, idx);
  };
  WebSetter.setMathColor = function setMathColor(lg, data, name, color, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    var info = WebSetter.getConstantInfo(lg, data, name);
    Color$1.toArray(info.dataArr, color, idx * 4);
    data.constants.set(info.constantID, info.dataArr);
  };
  WebSetter.getConstantInfo = function getConstantInfo(lg, data, name) {
    var constantID = lg.constantIndex.get(name);
    if (constantID === undefined) {
      throw new Error("Constant with name " + name + " not found.");
    }
    var dataArr = data.constants.get(constantID) || [];
    return {
      constantID: constantID,
      dataArr: dataArr
    };
  };
  _proto3.setVec4 = function setVec4(name, vec, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    WebSetter.setVec4(this._lg, this._data, name, vec, idx);
  };
  WebSetter.setVec4 = function setVec4(lg, data, name, vec, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    var info = WebSetter.getConstantInfo(lg, data, name);
    Vec4.toArray(info.dataArr, vec, idx * 4);
    data.constants.set(info.constantID, info.dataArr);
  };
  _proto3.setVec2 = function setVec2(name, vec, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    WebSetter.setVec2(this._lg, this._data, name, vec, idx);
  };
  WebSetter.setVec2 = function setVec2(lg, data, name, vec, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    var info = WebSetter.getConstantInfo(lg, data, name);
    Vec2.toArray(info.dataArr, vec, idx * 2);
    data.constants.set(info.constantID, info.dataArr);
  };
  _proto3.setFloat = function setFloat(name, v, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    WebSetter.setFloat(this._lg, this._data, name, v, idx);
  };
  WebSetter.setFloat = function setFloat(lg, data, name, v, idx) {
    if (idx === void 0) {
      idx = 0;
    }
    var info = WebSetter.getConstantInfo(lg, data, name);
    info.dataArr[0 + idx] = v;
    data.constants.set(info.constantID, info.dataArr);
  };
  _proto3.setArrayBuffer = function setArrayBuffer(name, arrayBuffer) {
    WebSetter.setArrayBuffer(this._lg, this._data, name, arrayBuffer);
  };
  WebSetter.setArrayBuffer = function setArrayBuffer(lg, data, name, arrayBuffer) {
    throw new Error('Method not implemented.');
  };
  _proto3.setBuffer = function setBuffer(name, buffer) {
    WebSetter.setBuffer(this._lg, this._data, name, buffer);
  };
  WebSetter.setBuffer = function setBuffer(lg, data, name, buffer) {
    var num = lg.attributeIndex.get(name);
    data.buffers.set(num, buffer);
  };
  _proto3.setTexture = function setTexture(name, texture) {
    WebSetter.setTexture(this._lg, this._data, name, texture);
  };
  WebSetter.setTexture = function setTexture(lg, data, name, texture) {
    var num = lg.attributeIndex.get(name);
    data.textures.set(num, texture);
  };
  _proto3.setReadWriteBuffer = function setReadWriteBuffer(name, buffer) {
    WebSetter.setReadWriteBuffer(this._lg, this._data, name, buffer);
  };
  WebSetter.setReadWriteBuffer = function setReadWriteBuffer(lg, data, name, buffer) {
    var num = lg.attributeIndex.get(name);
    data.buffers.set(num, buffer);
  };
  _proto3.setReadWriteTexture = function setReadWriteTexture(name, texture) {
    WebSetter.setReadWriteTexture(this._lg, this._data, name, texture);
  };
  WebSetter.setReadWriteTexture = function setReadWriteTexture(lg, data, name, texture) {
    var num = lg.attributeIndex.get(name);
    data.textures.set(num, texture);
  };
  _proto3.setSampler = function setSampler(name, sampler) {
    WebSetter.setSampler(this._lg, this._data, name, sampler);
  };
  WebSetter.setSampler = function setSampler(lg, data, name, sampler) {
    var num = lg.attributeIndex.get(name);
    data.samplers.set(num, sampler);
  };
  _proto3.getParentLayout = function getParentLayout() {
    var director = cclegacy.director;
    var root = director.root;
    var pipeline = root.pipeline;
    var parId = pipeline.renderGraph.getParent(this._vertID);
    var layoutName = pipeline.renderGraph.getLayout(parId);
    return layoutName;
  };
  _proto3.getCurrentLayout = function getCurrentLayout() {
    var director = cclegacy.director;
    var root = director.root;
    var pipeline = root.pipeline;
    var layoutName = pipeline.renderGraph.getLayout(this._vertID);
    return layoutName;
  };
  _proto3.setBuiltinCameraConstants = function setBuiltinCameraConstants(camera) {
    var director = cclegacy.director;
    var root = director.root;
    var pipeline = root.pipeline;
    this.getParentLayout();
    setCameraUBOValues(this, camera, pipeline.pipelineSceneData, camera.scene);
  };
  _proto3.setBuiltinDirectionalLightFrustumConstants = function setBuiltinDirectionalLightFrustumConstants(camera, light, csmLevel) {
    if (csmLevel === void 0) {
      csmLevel = 0;
    }
    setShadowUBOLightView(this, camera, light, csmLevel);
  };
  _proto3.setBuiltinSpotLightFrustumConstants = function setBuiltinSpotLightFrustumConstants(light) {
    setShadowUBOLightView(this, null, light, 0);
  };
  _proto3.setBuiltinDirectionalLightConstants = function setBuiltinDirectionalLightConstants(light, camera) {
    setShadowUBOView(this, null, this.getParentLayout());
  };
  _proto3.setBuiltinSphereLightConstants = function setBuiltinSphereLightConstants(light, camera) {
    var director = cclegacy.director;
    var pipeline = director.root.pipeline;
    var sceneData = pipeline.pipelineSceneData;
    _uboVec$1.set(light.position.x, light.position.y, light.position.z, LightType.SPHERE);
    this.setVec4('cc_lightPos', _uboVec$1);
    _uboVec$1.set(light.size, light.range, 0.0, 0.0);
    this.setVec4('cc_lightSizeRangeAngle', _uboVec$1);
    var isHDR = sceneData.isHDR;
    var lightMeterScale = 10000.0;
    _uboVec$1.set(light.color.x, light.color.y, light.color.z, 0);
    if (light.useColorTemperature) {
      var finalColor = light.finalColor;
      _uboVec$1.x = finalColor.x;
      _uboVec$1.y = finalColor.y;
      _uboVec$1.z = finalColor.z;
    }
    if (isHDR) {
      _uboVec$1.w = light.luminance * camera.exposure * lightMeterScale;
    } else {
      _uboVec$1.w = light.luminance;
    }
    this.setVec4('cc_lightColor', _uboVec$1);
  };
  _proto3.setBuiltinSpotLightConstants = function setBuiltinSpotLightConstants(light, camera) {
    var director = cclegacy.director;
    var pipeline = director.root.pipeline;
    var sceneData = pipeline.pipelineSceneData;
    var shadowInfo = sceneData.shadows;
    _uboVec$1.set(light.position.x, light.position.y, light.position.z, LightType.SPOT);
    this.setVec4('cc_lightPos', _uboVec$1);
    _uboVec$1.set(light.size, light.range, light.spotAngle, shadowInfo.enabled && light.shadowEnabled && shadowInfo.type === ShadowType.ShadowMap ? 1 : 0);
    this.setVec4('cc_lightSizeRangeAngle', _uboVec$1);
    _uboVec$1.set(light.direction.x, light.direction.y, light.direction.z, 0);
    this.setVec4('cc_lightDir', _uboVec$1);
    var isHDR = sceneData.isHDR;
    var lightMeterScale = 10000.0;
    _uboVec$1.set(light.color.x, light.color.y, light.color.z, 0);
    if (light.useColorTemperature) {
      var finalColor = light.finalColor;
      _uboVec$1.x = finalColor.x;
      _uboVec$1.y = finalColor.y;
      _uboVec$1.z = finalColor.z;
    }
    if (isHDR) {
      _uboVec$1.w = light.luminance * camera.exposure * lightMeterScale;
    } else {
      _uboVec$1.w = light.luminance;
    }
    this.setVec4('cc_lightColor', _uboVec$1);
    _uboVec$1.set(0, 0, 0, light.angleAttenuationStrength);
    this.setVec4('cc_lightBoundingSizeVS', _uboVec$1);
  };
  _proto3.setBuiltinPointLightConstants = function setBuiltinPointLightConstants(light, camera) {
    var director = cclegacy.director;
    var pipeline = director.root.pipeline;
    var sceneData = pipeline.pipelineSceneData;
    _uboVec$1.set(light.position.x, light.position.y, light.position.z, LightType.POINT);
    this.setVec4('cc_lightPos', _uboVec$1);
    _uboVec$1.set(0.0, light.range, 0.0, 0.0);
    this.setVec4('cc_lightSizeRangeAngle', _uboVec$1);
    var isHDR = sceneData.isHDR;
    var lightMeterScale = 10000.0;
    if (light.useColorTemperature) {
      var finalColor = light.finalColor;
      _uboVec$1.x = finalColor.x;
      _uboVec$1.y = finalColor.y;
      _uboVec$1.z = finalColor.z;
    }
    if (isHDR) {
      _uboVec$1.w = light.luminance * camera.exposure * lightMeterScale;
    } else {
      _uboVec$1.w = light.luminance;
    }
    _uboVec$1.set(light.color.x, light.color.y, light.color.z, 0);
    this.setVec4('cc_lightColor', _uboVec$1);
  };
  _proto3.setBuiltinRangedDirectionalLightConstants = function setBuiltinRangedDirectionalLightConstants(light, camera) {
    var director = cclegacy.director;
    var pipeline = director.root.pipeline;
    var sceneData = pipeline.pipelineSceneData;
    _uboVec$1.set(light.position.x, light.position.y, light.position.z, LightType.RANGED_DIRECTIONAL);
    this.setVec4('cc_lightPos', _uboVec$1);
    _uboVec$1.set(light.right.x, light.right.y, light.right.z, 0.0);
    this.setVec4('cc_lightSizeRangeAngle', _uboVec$1);
    _uboVec$1.set(light.direction.x, light.direction.y, light.direction.z, 0);
    this.setVec4('cc_lightDir', _uboVec$1);
    var scale = light.scale;
    _uboVec$1.set(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5, 0);
    this.setVec4('cc_lightBoundingSizeVS', _uboVec$1);
    var isHDR = sceneData.isHDR;
    _uboVec$1.set(light.color.x, light.color.y, light.color.z, 0);
    if (light.useColorTemperature) {
      var finalColor = light.finalColor;
      _uboVec$1.x = finalColor.x;
      _uboVec$1.y = finalColor.y;
      _uboVec$1.z = finalColor.z;
    }
    if (isHDR) {
      _uboVec$1.w = light.illuminance * camera.exposure;
    } else {
      _uboVec$1.w = light.illuminance;
    }
    this.setVec4('cc_lightColor', _uboVec$1);
  };
  _proto3.hasSampler = function hasSampler(name) {
    var id = this._lg.constantIndex.get(name);
    if (id === undefined) {
      return false;
    }
    return this._data.samplers.has(id);
  };
  _proto3.hasTexture = function hasTexture(name) {
    var id = this._lg.constantIndex.get(name);
    if (id === undefined) {
      return false;
    }
    return this._data.textures.has(id);
  };
  _proto3.setCustomBehavior = function setCustomBehavior(name) {
    throw new Error('Method not implemented.');
  };
  return _createClass(WebSetter, [{
    key: "name",
    get: function get() {
      return '';
    },
    set: function set(name) {}
  }]);
}();
var RenderDrawQueue = function () {
  function RenderDrawQueue() {
    this.instances = new Array();
  }
  var _proto4 = RenderDrawQueue.prototype;
  _proto4.empty = function empty() {
    return this.instances.length === 0;
  };
  _proto4.clear = function clear() {
    this.instances.length = 0;
  };
  _proto4.add = function add(model, depth, subModelIdx, passIdx) {
    var subModel = model.subModels[subModelIdx];
    var pass = subModel.passes[passIdx];
    var passPriority = pass.priority;
    var modelPriority = subModel.priority;
    var shaderId = subModel.shaders[passIdx].typedID;
    var hash = 0 << 30 | passPriority << 16 | modelPriority << 8 | passIdx;
    var priority = model.priority;
    var instance = instancePool.add();
    instance.update(subModel, priority, hash, depth, shaderId, passIdx);
    this.instances.push(instance);
  };
  _proto4.sortOpaqueOrCutout = function sortOpaqueOrCutout() {
    this.instances.sort(function (lhs, rhs) {
      if (lhs.hash !== rhs.hash) {
        return lhs.hash - rhs.hash;
      }
      if (lhs.depth !== rhs.depth) {
        return lhs.depth - rhs.depth;
      }
      return lhs.shaderID - rhs.shaderID;
    });
  };
  _proto4.sortTransparent = function sortTransparent() {
    this.instances.sort(function (lhs, rhs) {
      if (lhs.priority !== rhs.priority) {
        return lhs.priority - rhs.priority;
      }
      if (lhs.hash !== rhs.hash) {
        return lhs.hash - rhs.hash;
      }
      if (lhs.depth !== rhs.depth) {
        return rhs.depth - lhs.depth;
      }
      return lhs.shaderID - rhs.shaderID;
    });
  };
  _proto4.recordCommandBuffer = function recordCommandBuffer(device, renderPass, cmdBuffer, ds, offset, dynamicOffsets) {
    if (ds === void 0) {
      ds = null;
    }
    if (offset === void 0) {
      offset = 0;
    }
    if (dynamicOffsets === void 0) {
      dynamicOffsets = null;
    }
    for (var _iterator3 = _createForOfIteratorHelperLoose(this.instances), _step3; !(_step3 = _iterator3()).done;) {
      var instance = _step3.value;
      var subModel = instance.subModel;
      var passIdx = instance.passIndex;
      var inputAssembler = subModel.inputAssembler;
      var pass = subModel.passes[passIdx];
      var shader = subModel.shaders[passIdx];
      var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, inputAssembler);
      cmdBuffer.bindPipelineState(pso);
      cmdBuffer.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
      if (ds) {
        cmdBuffer.bindDescriptorSet(SetIndex.GLOBAL, ds, [offset]);
      }
      if (dynamicOffsets) {
        cmdBuffer.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet, dynamicOffsets);
      } else {
        cmdBuffer.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet);
      }
      cmdBuffer.bindInputAssembler(inputAssembler);
      cmdBuffer.draw(inputAssembler);
    }
  };
  return RenderDrawQueue;
}();
var RenderInstancingQueue = function () {
  function RenderInstancingQueue() {
    this.passInstances = new Map();
    this.instanceBuffers = new Array();
  }
  var _proto5 = RenderInstancingQueue.prototype;
  _proto5.empty = function empty() {
    return this.passInstances.size === 0;
  };
  _proto5.add = function add(pass, subModel, passID) {
    var iter = this.passInstances.get(pass);
    if (iter === undefined) {
      var instanceBufferID = this.passInstances.size;
      if (instanceBufferID >= this.instanceBuffers.length) {
        this.instanceBuffers.push(new InstancedBuffer(pass));
      }
      this.passInstances.set(pass, instanceBufferID);
      var instanceBuffer = this.instanceBuffers[instanceBufferID];
      instanceBuffer.pass = pass;
      instanceBuffer.instances;
    }
    var instancedBuffer = this.instanceBuffers[this.passInstances.get(pass)];
    instancedBuffer.merge(subModel, passID);
  };
  _proto5.clear = function clear() {
    this.passInstances.clear();
    var instanceBuffers = this.instanceBuffers;
    instanceBuffers.forEach(function (instance) {
      instance.clear();
    });
  };
  _proto5.sort = function sort() {
    this.instanceBuffers = this.instanceBuffers.sort(instancingCompareFn);
  };
  _proto5.uploadBuffers = function uploadBuffers(cmdBuffer) {
    for (var _iterator4 = _createForOfIteratorHelperLoose(this.passInstances.entries()), _step4; !(_step4 = _iterator4()).done;) {
      var _step4$value = _step4.value;
        _step4$value[0];
        var bufferID = _step4$value[1];
      var instanceBuffer = this.instanceBuffers[bufferID];
      if (instanceBuffer.hasPendingModels) {
        instanceBuffer.uploadBuffers(cmdBuffer);
      }
    }
  };
  _proto5.recordCommandBuffer = function recordCommandBuffer(renderPass, cmdBuffer, ds, offset, dynamicOffsets) {
    if (ds === void 0) {
      ds = null;
    }
    if (offset === void 0) {
      offset = 0;
    }
    if (dynamicOffsets === void 0) {
      dynamicOffsets = null;
    }
    var renderQueue = this.instanceBuffers;
    for (var _iterator5 = _createForOfIteratorHelperLoose(renderQueue), _step5; !(_step5 = _iterator5()).done;) {
      var instanceBuffer = _step5.value;
      if (!instanceBuffer.hasPendingModels) {
        continue;
      }
      var instances = instanceBuffer.instances;
      var drawPass = instanceBuffer.pass;
      cmdBuffer.bindDescriptorSet(SetIndex.MATERIAL, drawPass.descriptorSet);
      var lastPSO = null;
      for (var _iterator6 = _createForOfIteratorHelperLoose(instances), _step6; !(_step6 = _iterator6()).done;) {
        var instance = _step6.value;
        if (!instance.count) {
          continue;
        }
        var pso = PipelineStateManager.getOrCreatePipelineState(deviceManager.gfxDevice, drawPass, instance.shader, renderPass, instance.ia);
        if (lastPSO !== pso) {
          cmdBuffer.bindPipelineState(pso);
          lastPSO = pso;
        }
        if (ds) {
          cmdBuffer.bindDescriptorSet(SetIndex.GLOBAL, ds, [offset]);
        }
        if (dynamicOffsets) {
          cmdBuffer.bindDescriptorSet(SetIndex.LOCAL, instance.descriptorSet, dynamicOffsets);
        } else {
          cmdBuffer.bindDescriptorSet(SetIndex.LOCAL, instance.descriptorSet, instanceBuffer.dynamicOffsets);
        }
        cmdBuffer.bindInputAssembler(instance.ia);
        cmdBuffer.draw(instance.ia);
      }
    }
  };
  return RenderInstancingQueue;
}();
var RenderQueueQuery = function () {
  function RenderQueueQuery(frustumCulledResultID, lightBoundsCulledResultID, renderQueueTargetIn) {
    if (frustumCulledResultID === void 0) {
      frustumCulledResultID = 0xFFFFFFFF;
    }
    if (lightBoundsCulledResultID === void 0) {
      lightBoundsCulledResultID = 0xFFFFFFFF;
    }
    if (renderQueueTargetIn === void 0) {
      renderQueueTargetIn = 0xFFFFFFFF;
    }
    this.frustumCulledResultID = void 0;
    this.lightBoundsCulledResultID = void 0;
    this.renderQueueTarget = void 0;
    this.frustumCulledResultID = frustumCulledResultID;
    this.lightBoundsCulledResultID = lightBoundsCulledResultID;
    this.renderQueueTarget = renderQueueTargetIn;
  }
  var _proto6 = RenderQueueQuery.prototype;
  _proto6.update = function update(culledSourceIn, lightBoundsCulledResultID, renderQueueTargetIn) {
    if (culledSourceIn === void 0) {
      culledSourceIn = 0xFFFFFFFF;
    }
    if (lightBoundsCulledResultID === void 0) {
      lightBoundsCulledResultID = 0xFFFFFFFF;
    }
    if (renderQueueTargetIn === void 0) {
      renderQueueTargetIn = 0xFFFFFFFF;
    }
    this.frustumCulledResultID = culledSourceIn;
    this.lightBoundsCulledResultID = lightBoundsCulledResultID;
    this.renderQueueTarget = renderQueueTargetIn;
  };
  return RenderQueueQuery;
}();
function recordCommand(cmdBuffer, _renderPass, pass, localDesc, shader, ia) {
  var pso;
  if (shader && ia) {
    pso = PipelineStateManager.getOrCreatePipelineState(deviceManager.gfxDevice, pass, shader, _renderPass, ia);
  }
  if (pso) {
    var _ia = ia;
    cmdBuffer.bindPipelineState(pso);
    cmdBuffer.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
    cmdBuffer.bindDescriptorSet(SetIndex.LOCAL, localDesc);
    cmdBuffer.bindInputAssembler(_ia);
    cmdBuffer.draw(_ia);
  }
}
var RenderQueue = function () {
  function RenderQueue() {
    this.probeQueue = new ProbeHelperQueue();
    this.opaqueQueue = new RenderDrawQueue();
    this.transparentQueue = new RenderDrawQueue();
    this.opaqueInstancingQueue = new RenderInstancingQueue();
    this.transparentInstancingQueue = new RenderInstancingQueue();
    this.camera = null;
    this.sceneFlags = SceneFlags.NONE;
    this.lightByteOffset = 0xFFFFFFFF;
  }
  var _proto7 = RenderQueue.prototype;
  _proto7.sort = function sort() {
    this.opaqueQueue.sortOpaqueOrCutout();
    this.transparentQueue.sortTransparent();
    this.opaqueInstancingQueue.sort();
    this.transparentInstancingQueue.sort();
  };
  _proto7.update = function update() {
    this.probeQueue.clear();
    this.opaqueQueue.clear();
    this.transparentQueue.clear();
    this.opaqueInstancingQueue.clear();
    this.transparentInstancingQueue.clear();
    this.camera = null;
    this.sceneFlags = SceneFlags.NONE;
    this.lightByteOffset = 0xFFFFFFFF;
  };
  _proto7.empty = function empty() {
    return this.opaqueQueue.empty() && this.transparentQueue.empty() && this.opaqueInstancingQueue.empty() && this.transparentInstancingQueue.empty();
  };
  _proto7.recordCommands = function recordCommands(cmdBuffer, renderPass, sceneFlags) {
    var offsets = this.lightByteOffset === 0xFFFFFFFF ? null : [this.lightByteOffset];
    if (sceneFlags & (SceneFlags.OPAQUE | SceneFlags.MASK)) {
      this.opaqueQueue.recordCommandBuffer(deviceManager.gfxDevice, renderPass, cmdBuffer, null, 0, offsets);
      this.opaqueInstancingQueue.recordCommandBuffer(renderPass, cmdBuffer, null, 0, offsets);
    }
    if (sceneFlags & SceneFlags.BLEND) {
      this.transparentInstancingQueue.recordCommandBuffer(renderPass, cmdBuffer, null, 0, offsets);
      this.transparentQueue.recordCommandBuffer(deviceManager.gfxDevice, renderPass, cmdBuffer, null, 0, offsets);
    }
  };
  return RenderQueue;
}();

var INVALID_ID$1 = 0xFFFFFFFF;
var ENABLE_SUBPASS = true;
function getGfxDescriptorType(type) {
  switch (type) {
    case DescriptorTypeOrder.UNIFORM_BUFFER:
      return DescriptorType.UNIFORM_BUFFER;
    case DescriptorTypeOrder.DYNAMIC_UNIFORM_BUFFER:
      return DescriptorType.DYNAMIC_UNIFORM_BUFFER;
    case DescriptorTypeOrder.SAMPLER_TEXTURE:
      return DescriptorType.SAMPLER_TEXTURE;
    case DescriptorTypeOrder.SAMPLER:
      return DescriptorType.SAMPLER;
    case DescriptorTypeOrder.TEXTURE:
      return DescriptorType.TEXTURE;
    case DescriptorTypeOrder.STORAGE_BUFFER:
      return DescriptorType.STORAGE_BUFFER;
    case DescriptorTypeOrder.DYNAMIC_STORAGE_BUFFER:
      return DescriptorType.DYNAMIC_STORAGE_BUFFER;
    case DescriptorTypeOrder.STORAGE_IMAGE:
      return DescriptorType.STORAGE_IMAGE;
    case DescriptorTypeOrder.INPUT_ATTACHMENT:
      return DescriptorType.INPUT_ATTACHMENT;
    default:
      error('DescriptorType not found');
      return DescriptorType.INPUT_ATTACHMENT;
  }
}
function getDescriptorTypeOrder(type) {
  switch (type) {
    case DescriptorType.UNIFORM_BUFFER:
      return DescriptorTypeOrder.UNIFORM_BUFFER;
    case DescriptorType.DYNAMIC_UNIFORM_BUFFER:
      return DescriptorTypeOrder.DYNAMIC_UNIFORM_BUFFER;
    case DescriptorType.SAMPLER_TEXTURE:
      return DescriptorTypeOrder.SAMPLER_TEXTURE;
    case DescriptorType.SAMPLER:
      return DescriptorTypeOrder.SAMPLER;
    case DescriptorType.TEXTURE:
      return DescriptorTypeOrder.TEXTURE;
    case DescriptorType.STORAGE_BUFFER:
      return DescriptorTypeOrder.STORAGE_BUFFER;
    case DescriptorType.DYNAMIC_STORAGE_BUFFER:
      return DescriptorTypeOrder.DYNAMIC_STORAGE_BUFFER;
    case DescriptorType.STORAGE_IMAGE:
      return DescriptorTypeOrder.STORAGE_IMAGE;
    case DescriptorType.INPUT_ATTACHMENT:
      return DescriptorTypeOrder.INPUT_ATTACHMENT;
    case DescriptorType.UNKNOWN:
    default:
      error('DescriptorTypeOrder not found');
      return DescriptorTypeOrder.INPUT_ATTACHMENT;
  }
}
function getCustomPassID(lg, name) {
  return lg.locateChild(lg.N, name || 'default');
}
function getCustomSubpassID(lg, passID, name) {
  return lg.locateChild(passID, name);
}
function getCustomPhaseID(lg, subpassOrPassID, name) {
  if (name === undefined) {
    return lg.locateChild(subpassOrPassID, 'default');
  }
  if (typeof name === 'number') {
    return lg.locateChild(subpassOrPassID, name.toString());
  }
  return lg.locateChild(subpassOrPassID, name);
}
var DEFAULT_UNIFORM_COUNTS = new Map([['cc_lightPos', UBOForwardLightEnum.LIGHTS_PER_PASS], ['cc_lightColor', UBOForwardLightEnum.LIGHTS_PER_PASS], ['cc_lightSizeRangeAngle', UBOForwardLightEnum.LIGHTS_PER_PASS], ['cc_lightDir', UBOForwardLightEnum.LIGHTS_PER_PASS], ['cc_lightBoundingSizeVS', UBOForwardLightEnum.LIGHTS_PER_PASS]]);
function getUniformBlockSize(blockMembers) {
  var prevSize = 0;
  for (var _iterator = _createForOfIteratorHelperLoose(blockMembers), _step; !(_step = _iterator()).done;) {
    var m = _step.value;
    if (m.count) {
      prevSize += GetTypeSize(m.type) * m.count;
      continue;
    }
    var iter = DEFAULT_UNIFORM_COUNTS.get(m.name);
    if (iter !== undefined) {
      prevSize += GetTypeSize(m.type) * iter;
      continue;
    }
    if (m.name === 'cc_joints') {
      var sz = GetTypeSize(m.type) * UBOSkinning.LAYOUT.members[0].count;
      assert(sz !== UBOSkinning.SIZE);
      prevSize += sz;
      continue;
    }
    error("Invalid uniform count: " + m.name);
  }
  assert(!!prevSize);
  return prevSize;
}
function sortDescriptorBlocks(lhs, rhs) {
  var lhsIndex = JSON.parse(lhs[0]);
  var rhsIndex = JSON.parse(rhs[0]);
  var lhsValue = lhsIndex.updateFrequency * 10000 + lhsIndex.parameterType * 1000 + lhsIndex.descriptorType * 100 + lhsIndex.visibility;
  var rhsValue = rhsIndex.updateFrequency * 10000 + rhsIndex.parameterType * 1000 + rhsIndex.descriptorType * 100 + rhsIndex.visibility;
  return lhsValue - rhsValue;
}
function sortDescriptorGroupBlocks(lhs, rhs) {
  var lhsIndex = JSON.parse(lhs[0]);
  var rhsIndex = JSON.parse(rhs[0]);
  var lhsValue = lhsIndex.updateFrequency * 1000000000 + lhsIndex.parameterType * 100000000 + lhsIndex.descriptorType * 10000000 + lhsIndex.visibility * 1000000 + lhsIndex.accessType * 100000 + lhsIndex.viewDimension * 10000 + lhsIndex.sampleType * 1000 + lhsIndex.format;
  var rhsValue = rhsIndex.updateFrequency * 1000000000 + rhsIndex.parameterType * 100000000 + rhsIndex.descriptorType * 10000000 + rhsIndex.visibility * 1000000 + rhsIndex.accessType * 100000 + rhsIndex.viewDimension * 10000 + rhsIndex.sampleType * 1000 + rhsIndex.format;
  return lhsValue - rhsValue;
}
function getOrCreateDescriptorID(lg, name) {
  var nameID = lg.attributeIndex.get(name);
  if (nameID === undefined) {
    var newID = lg.valueNames.length;
    lg.attributeIndex.set(name, newID);
    lg.valueNames.push(name);
    return newID;
  }
  return nameID;
}
function createDescriptorInfo(layoutData, info) {
  info.bindings.length = 0;
  for (var i = 0; i < layoutData.descriptorBlocks.length; ++i) {
    var block = layoutData.descriptorBlocks[i];
    var slot = block.offset;
    for (var j = 0; j < block.descriptors.length; ++j) {
      var d = block.descriptors[j];
      var binding = new DescriptorSetLayoutBinding();
      binding.binding = slot;
      binding.descriptorType = getGfxDescriptorType(block.type);
      binding.count = d.count;
      binding.stageFlags = block.visibility;
      binding.access = block.accessType;
      binding.viewDimension = block.viewDimension;
      binding.sampleType = block.sampleType;
      binding.format = block.format;
      binding.immutableSamplers = [];
      info.bindings.push(binding);
      slot += d.count;
    }
  }
}
function createDescriptorSetLayout(device, layoutData) {
  var info = new DescriptorSetLayoutInfo();
  createDescriptorInfo(layoutData, info);
  if (device) {
    return device.createDescriptorSetLayout(info);
  } else {
    return null;
  }
}
function createGfxDescriptorSetsAndPipelines(device, g) {
  for (var i = 0; i < g._layouts.length; ++i) {
    var ppl = g.getLayout(i);
    var sets = ppl.getSets();
    sets.forEach(function (value, key) {
      var level = value;
      var layoutData = level.descriptorSetLayoutData;
      if (device) {
        var layout = createDescriptorSetLayout(device, layoutData);
        if (layout) {
          level.descriptorSetLayout = layout;
          level.descriptorSet = device.createDescriptorSet(new DescriptorSetInfo(layout));
        }
      } else {
        createDescriptorInfo(layoutData, level.descriptorSetLayoutInfo);
      }
    });
  }
}
function getDescriptorBlockData(map, index) {
  var key = JSON.stringify(index);
  var block = map.get(key);
  if (block) {
    return block;
  }
  var newBlock = new DescriptorBlockData(index.descriptorType, index.visibility, 0);
  map.set(key, newBlock);
  return newBlock;
}
function getDescriptorGroupBlockData(map, index) {
  var key = JSON.stringify(index);
  var block = map.get(key);
  if (block) {
    return block;
  }
  var newBlock = new DescriptorBlockData(index.descriptorType, index.visibility, 0, index.accessType, index.viewDimension, index.sampleType, index.format);
  map.set(key, newBlock);
  return newBlock;
}
function getViewDimension(type) {
  switch (type) {
    case Type.SAMPLER1D:
    case Type.TEXTURE1D:
    case Type.IMAGE1D:
      return ViewDimension.TEX1D;
    case Type.SAMPLER2D:
    case Type.TEXTURE2D:
    case Type.IMAGE2D:
      return ViewDimension.TEX2D;
    case Type.SAMPLER2D_ARRAY:
    case Type.TEXTURE2D_ARRAY:
    case Type.IMAGE2D_ARRAY:
      return ViewDimension.TEX2D_ARRAY;
    case Type.SAMPLER_CUBE:
    case Type.TEXTURE_CUBE:
    case Type.IMAGE_CUBE:
      return ViewDimension.TEXCUBE;
    case Type.SAMPLER3D:
    case Type.TEXTURE3D:
    case Type.IMAGE3D:
      return ViewDimension.TEX3D;
    default:
      return ViewDimension.UNKNOWN;
  }
}
function makeDescriptorSetLayoutData(lg, rate, set, descriptors) {
  var map = new Map();
  var uniformBlocks = new Map();
  for (var i = 0; i < descriptors.blocks.length; i++) {
    var cb = descriptors.blocks[i];
    var block = Layout.isWebGPU ? getDescriptorGroupBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.UNIFORM_BUFFER,
      visibility: cb.stageFlags,
      accessType: MemoryAccessBit.READ_ONLY,
      viewDimension: ViewDimension.BUFFER,
      sampleType: SampleType.FLOAT,
      format: Format.UNKNOWN
    }) : getDescriptorBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.UNIFORM_BUFFER,
      visibility: cb.stageFlags
    });
    var nameID = getOrCreateDescriptorID(lg, cb.name);
    block.descriptors.push(new DescriptorData(nameID, Type.UNKNOWN, 1));
    uniformBlocks.set(nameID, new UniformBlock(set, 0xFFFFFFFF, cb.name, cb.members, 1));
  }
  for (var _i = 0; _i < descriptors.samplerTextures.length; _i++) {
    var samplerTexture = descriptors.samplerTextures[_i];
    var _block = Layout.isWebGPU ? getDescriptorGroupBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.SAMPLER_TEXTURE,
      visibility: samplerTexture.stageFlags,
      accessType: MemoryAccessBit.READ_ONLY,
      viewDimension: getViewDimension(samplerTexture.type),
      sampleType: samplerTexture.sampleType,
      format: Format.UNKNOWN
    }) : getDescriptorBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.SAMPLER_TEXTURE,
      visibility: samplerTexture.stageFlags
    });
    var _nameID = getOrCreateDescriptorID(lg, samplerTexture.name);
    _block.descriptors.push(new DescriptorData(_nameID, samplerTexture.type, samplerTexture.count));
  }
  for (var _i2 = 0; _i2 < descriptors.samplers.length; _i2++) {
    var sampler = descriptors.samplers[_i2];
    var _block2 = Layout.isWebGPU ? getDescriptorGroupBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.SAMPLER,
      visibility: sampler.stageFlags,
      accessType: MemoryAccessBit.READ_ONLY,
      viewDimension: ViewDimension.UNKNOWN,
      sampleType: SampleType.FLOAT,
      format: Format.UNKNOWN
    }) : getDescriptorBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.SAMPLER,
      visibility: sampler.stageFlags
    });
    var _nameID2 = getOrCreateDescriptorID(lg, sampler.name);
    _block2.descriptors.push(new DescriptorData(_nameID2, Type.SAMPLER, sampler.count));
  }
  for (var _i3 = 0; _i3 < descriptors.textures.length; _i3++) {
    var texture = descriptors.textures[_i3];
    var _block3 = Layout.isWebGPU ? getDescriptorGroupBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.TEXTURE,
      visibility: texture.stageFlags,
      accessType: MemoryAccessBit.READ_ONLY,
      viewDimension: getViewDimension(texture.type),
      sampleType: texture.sampleType,
      format: Format.UNKNOWN
    }) : getDescriptorBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.TEXTURE,
      visibility: texture.stageFlags
    });
    var _nameID3 = getOrCreateDescriptorID(lg, texture.name);
    _block3.descriptors.push(new DescriptorData(_nameID3, texture.type, texture.count));
  }
  for (var _i4 = 0; _i4 < descriptors.buffers.length; _i4++) {
    var buffer = descriptors.buffers[_i4];
    var _block4 = Layout.isWebGPU ? getDescriptorGroupBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.STORAGE_BUFFER,
      visibility: buffer.stageFlags,
      accessType: MemoryAccessBit.READ_ONLY,
      viewDimension: ViewDimension.BUFFER,
      sampleType: SampleType.FLOAT,
      format: Format.UNKNOWN
    }) : getDescriptorBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.STORAGE_BUFFER,
      visibility: buffer.stageFlags
    });
    var _nameID4 = getOrCreateDescriptorID(lg, buffer.name);
    _block4.descriptors.push(new DescriptorData(_nameID4, Type.UNKNOWN, 1));
  }
  for (var _i5 = 0; _i5 < descriptors.images.length; _i5++) {
    var image = descriptors.images[_i5];
    var _block5 = Layout.isWebGPU ? getDescriptorGroupBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.STORAGE_IMAGE,
      visibility: image.stageFlags,
      accessType: MemoryAccessBit.READ_ONLY,
      viewDimension: getViewDimension(image.type),
      sampleType: SampleType.FLOAT,
      format: Format.UNKNOWN
    }) : getDescriptorBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.STORAGE_IMAGE,
      visibility: image.stageFlags
    });
    var _nameID5 = getOrCreateDescriptorID(lg, image.name);
    _block5.descriptors.push(new DescriptorData(_nameID5, image.type, image.count));
  }
  for (var _i6 = 0; _i6 < descriptors.subpassInputs.length; _i6++) {
    var subpassInput = descriptors.subpassInputs[_i6];
    var _block6 = Layout.isWebGPU ? getDescriptorGroupBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.INPUT_ATTACHMENT,
      visibility: subpassInput.stageFlags,
      accessType: MemoryAccessBit.READ_ONLY,
      viewDimension: ViewDimension.TEX2D,
      sampleType: SampleType.FLOAT,
      format: Format.UNKNOWN
    }) : getDescriptorBlockData(map, {
      updateFrequency: rate,
      parameterType: ParameterType.TABLE,
      descriptorType: DescriptorTypeOrder.INPUT_ATTACHMENT,
      visibility: subpassInput.stageFlags
    });
    var _nameID6 = getOrCreateDescriptorID(lg, subpassInput.name);
    _block6.descriptors.push(new DescriptorData(_nameID6, Type.UNKNOWN, subpassInput.count));
  }
  var flattenedBlocks = Layout.isWebGPU ? Array.from(map).sort(sortDescriptorGroupBlocks) : Array.from(map).sort(sortDescriptorBlocks);
  var data = new DescriptorSetLayoutData(set, 0);
  var capacity = 0;
  for (var _iterator2 = _createForOfIteratorHelperLoose(flattenedBlocks), _step2; !(_step2 = _iterator2()).done;) {
    var _step2$value = _step2.value,
      key = _step2$value[0],
      _block7 = _step2$value[1];
    var index = JSON.parse(key);
    _block7.offset = capacity;
    for (var _iterator3 = _createForOfIteratorHelperLoose(_block7.descriptors), _step3; !(_step3 = _iterator3()).done;) {
      var d = _step3.value;
      if (index.descriptorType === DescriptorTypeOrder.UNIFORM_BUFFER) {
        var ub = uniformBlocks.get(d.descriptorID);
        if (!ub) {
          error("Uniform block not found for " + d.descriptorID);
          continue;
        }
        assert(ub.binding === 0xFFFFFFFF);
        ub.binding = _block7.capacity;
        data.uniformBlocks.set(d.descriptorID, ub);
      }
      var binding = data.bindingMap.get(d.descriptorID);
      if (binding !== undefined) {
        error("Duplicated descriptor " + d.descriptorID);
      }
      data.bindingMap.set(d.descriptorID, _block7.offset + _block7.capacity);
      _block7.capacity += d.count;
    }
    capacity += _block7.capacity;
    data.capacity += _block7.capacity;
    if (index.descriptorType === DescriptorTypeOrder.UNIFORM_BUFFER || index.descriptorType === DescriptorTypeOrder.DYNAMIC_UNIFORM_BUFFER) {
      data.uniformBlockCapacity += _block7.capacity;
    } else if (index.descriptorType === DescriptorTypeOrder.SAMPLER_TEXTURE) {
      data.samplerTextureCapacity += _block7.capacity;
    }
    data.descriptorBlocks.push(_block7);
  }
  return data;
}
function initializeDescriptorSetLayoutInfo(layoutData, info) {
  info.bindings.length = 0;
  for (var i = 0; i < layoutData.descriptorBlocks.length; ++i) {
    var block = layoutData.descriptorBlocks[i];
    var slot = block.offset;
    for (var j = 0; j < block.descriptors.length; ++j) {
      var d = block.descriptors[j];
      var binding = new DescriptorSetLayoutBinding();
      binding.binding = slot;
      binding.descriptorType = getGfxDescriptorType(block.type);
      binding.count = d.count;
      binding.stageFlags = block.visibility;
      binding.access = block.accessType;
      binding.viewDimension = block.viewDimension;
      binding.sampleType = block.sampleType;
      binding.format = block.format;
      binding.immutableSamplers = [];
      info.bindings.push(binding);
      slot += d.count;
    }
  }
}
var _emptyDescriptorSetLayout;
var _emptyPipelineLayout;
function populatePipelineLayoutInfo(layout, rate, info) {
  var set = layout.getSet(rate);
  if (set && set.descriptorSetLayout) {
    info.setLayouts.push(set.descriptorSetLayout);
  } else {
    info.setLayouts.push(_emptyDescriptorSetLayout);
  }
}
function generateConstantMacros(device, constantMacros) {
  "\n  #define CC_DEVICE_SUPPORT_FLOAT_TEXTURE " + (device.getFormatFeatures(Format.RGBA32F) & (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE) ? '1' : '0') + "\n  #define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS " + device.capabilities.maxVertexUniformVectors + "\n  #define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS " + device.capabilities.maxFragmentUniformVectors + "\n  #define CC_DEVICE_CAN_BENEFIT_FROM_INPUT_ATTACHMENT " + (device.hasFeature(Feature.INPUT_ATTACHMENT_BENEFIT) ? '1' : '0') + "\n  #define CC_PLATFORM_ANDROID_AND_WEBGL 0\n  #define CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES 0\n  #define CC_JOINT_UNIFORM_CAPACITY " + UBOSkinning.JOINT_UNIFORM_CAPACITY;
}
function initializeLayoutGraphData(device, lg) {
  Layout.type = device.gfxAPI === API.WEBGPU ? LayoutType.WEBGPU : LayoutType.VULKAN;
  Layout.isWebGPU = device.gfxAPI === API.WEBGPU;
  _emptyDescriptorSetLayout = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo());
  _emptyPipelineLayout = device.createPipelineLayout(new PipelineLayoutInfo());
  for (var _iterator4 = _createForOfIteratorHelperLoose(lg.v()), _step4; !(_step4 = _iterator4()).done;) {
    var v = _step4.value;
    var layoutData = lg.getLayout(v);
    var sets = layoutData.getSets();
    for (var _iterator6 = _createForOfIteratorHelperLoose(sets), _step6; !(_step6 = _iterator6()).done;) {
      var _step6$value = _step6.value;
        _step6$value[0];
        var set = _step6$value[1];
      if (set.descriptorSetLayout !== null) {
        warn('descriptor set layout already initialized. It will be overwritten');
      }
      initializeDescriptorSetLayoutInfo(set.descriptorSetLayoutData, set.descriptorSetLayoutInfo);
      set.descriptorSetLayout = device.createDescriptorSetLayout(set.descriptorSetLayoutInfo);
    }
  }
  for (var _iterator5 = _createForOfIteratorHelperLoose(lg.v()), _step5; !(_step5 = _iterator5()).done;) {
    var _v = _step5.value;
    if (!lg.h(LayoutGraphDataValue.RenderPhase, _v)) {
      continue;
    }
    var subpassOrPassID = lg.getParent(_v);
    var phaseID = _v;
    var passLayout = lg.getLayout(subpassOrPassID);
    var phaseLayout = lg.getLayout(phaseID);
    var info = new PipelineLayoutInfo();
    populatePipelineLayoutInfo(passLayout, UpdateFrequency.PER_PASS, info);
    populatePipelineLayoutInfo(phaseLayout, UpdateFrequency.PER_PHASE, info);
    populatePipelineLayoutInfo(phaseLayout, UpdateFrequency.PER_BATCH, info);
    populatePipelineLayoutInfo(phaseLayout, UpdateFrequency.PER_INSTANCE, info);
    var phase = lg.j(phaseID);
    phase.pipelineLayout = device.createPipelineLayout(info);
  }
}
function terminateLayoutGraphData(lg) {
  for (var _iterator7 = _createForOfIteratorHelperLoose(lg.v()), _step7; !(_step7 = _iterator7()).done;) {
    var v = _step7.value;
    var layoutData = lg.getLayout(v);
    var sets = layoutData.getSets();
    for (var _iterator8 = _createForOfIteratorHelperLoose(sets), _step8; !(_step8 = _iterator8()).done;) {
      var _step8$value = _step8.value;
        _step8$value[0];
        var set = _step8$value[1];
      if (set.descriptorSetLayout !== null) {
        set.descriptorSetLayout.destroy();
      }
    }
  }
  _emptyPipelineLayout.destroy();
  _emptyDescriptorSetLayout.destroy();
}
function getEmptyDescriptorSetLayout() {
  return _emptyDescriptorSetLayout;
}
function getEmptyPipelineLayout() {
  return _emptyPipelineLayout;
}
function getOrCreateDescriptorSetLayout(lg, subpassOrPassID, phaseID, rate) {
  if (rate < UpdateFrequency.PER_PASS) {
    var phaseData = lg.getLayout(phaseID);
    var _data = phaseData.getSet(rate);
    if (_data) {
      if (!_data.descriptorSetLayout) {
        error('descriptor set layout not initialized');
        return _emptyDescriptorSetLayout;
      }
      return _data.descriptorSetLayout;
    }
    return _emptyDescriptorSetLayout;
  }
  assert(rate === UpdateFrequency.PER_PASS);
  assert(subpassOrPassID === lg.getParent(phaseID));
  var passData = lg.getLayout(subpassOrPassID);
  var data = passData.getSet(rate);
  if (data) {
    if (!data.descriptorSetLayout) {
      error('descriptor set layout not initialized');
      return _emptyDescriptorSetLayout;
    }
    return data.descriptorSetLayout;
  }
  return _emptyDescriptorSetLayout;
}
function getDescriptorSetLayout(lg, subpassOrPassID, phaseID, rate) {
  if (rate < UpdateFrequency.PER_PASS) {
    var phaseData = lg.getLayout(phaseID);
    var _data2 = phaseData.getSet(rate);
    if (_data2) {
      if (!_data2.descriptorSetLayout) {
        error('descriptor set layout not initialized');
        return null;
      }
      return _data2.descriptorSetLayout;
    }
    return null;
  }
  assert(rate === UpdateFrequency.PER_PASS);
  assert(subpassOrPassID === lg.getParent(phaseID));
  var passData = lg.getLayout(subpassOrPassID);
  var data = passData.getSet(rate);
  if (data) {
    if (!data.descriptorSetLayout) {
      error('descriptor set layout not initialized');
      return null;
    }
    return data.descriptorSetLayout;
  }
  return null;
}
function getProgramID(lg, phaseID, programName) {
  assert(phaseID !== lg.N);
  var phase = lg.j(phaseID);
  var programID = phase.shaderIndex.get(programName);
  if (programID === undefined) {
    return INVALID_ID$1;
  }
  return programID;
}
function getDescriptorNameID(lg, name) {
  var nameID = lg.attributeIndex.get(name);
  if (nameID === undefined) {
    return INVALID_ID$1;
  }
  return nameID;
}
function getDescriptorName(lg, nameID) {
  if (nameID >= lg.valueNames.length) {
    return '';
  }
  return lg.valueNames[nameID];
}

var CullingPools = function CullingPools() {
  this.frustumCullingKeyRecycle = new RecyclePool(function () {
    return new FrustumCullingKey();
  }, 8);
  this.frustumCullingsRecycle = new RecyclePool(function () {
    return new FrustumCulling();
  }, 8);
  this.lightBoundsCullingRecycle = new RecyclePool(function () {
    return new LightBoundsCulling();
  }, 8);
  this.lightBoundsCullingResultRecycle = new RecyclePool(function () {
    return new LightBoundsCullingResult();
  }, 8);
  this.lightBoundsCullingKeyRecycle = new RecyclePool(function () {
    return new LightBoundsCullingKey();
  }, 8);
  this.renderQueueRecycle = new RecyclePool(function () {
    return new RenderQueue();
  }, 8);
  this.renderQueueQueryRecycle = new RecyclePool(function () {
    return new RenderQueueQuery();
  }, 8);
};
var REFLECTION_PROBE_DEFAULT_MASK = Layers.makeMaskExclude([Layers.BitMask.UI_2D, Layers.BitMask.UI_3D, Layers.BitMask.GIZMOS, Layers.BitMask.EDITOR, Layers.BitMask.SCENE_GIZMO, Layers.BitMask.PROFILER]);
var objIdMap = new WeakMap();
var cullingKeys = '';
var objectCount = 0;
function objectID(claze) {
  if (!objIdMap.has(claze)) objIdMap.set(claze, ++objectCount);
  return objIdMap.get(claze);
}
function computeCullingKey(sceneData, castShadows, refId) {
  if (refId === void 0) {
    refId = -1;
  }
  cullingKeys = '';
  var camera = sceneData.camera;
  var light = sceneData.light.light;
  var lightLevel = sceneData.light.level;
  var reflectProbe = sceneData.light.probe;
  var shadeLight = sceneData.shadingLight;
  cullingKeys += hashCombineKey(camera ? objectID(camera) : 0);
  cullingKeys += hashCombineKey(reflectProbe ? objectID(reflectProbe) : 0);
  cullingKeys += hashCombineKey(refId === -1 && light ? objectID(light) : 0);
  cullingKeys += hashCombineKey(refId !== -1 && shadeLight ? objectID(shadeLight) : 0);
  cullingKeys += hashCombineKey(refId === -1 ? lightLevel : 0);
  cullingKeys += hashCombineKey(castShadows ? 1 : 0);
  cullingKeys += hashCombineKey(refId);
  return cullingKeys;
}
var FrustumCullingKey = function () {
  function FrustumCullingKey(sceneData, castShadows) {
    if (sceneData === void 0) {
      sceneData = null;
    }
    if (castShadows === void 0) {
      castShadows = false;
    }
    this.sceneData = null;
    this.castShadows = false;
    this.sceneData = sceneData;
    this.castShadows = castShadows;
  }
  var _proto = FrustumCullingKey.prototype;
  _proto.update = function update(sceneData, castShadows) {
    this.sceneData = sceneData;
    this.castShadows = castShadows;
  };
  return FrustumCullingKey;
}();
var LightBoundsCullingKey = function () {
  function LightBoundsCullingKey(sceneData, frustumCullingID) {
    if (sceneData === void 0) {
      sceneData = null;
    }
    if (frustumCullingID === void 0) {
      frustumCullingID = -1;
    }
    this.sceneData = null;
    this.frustumCullingID = -1;
    this.sceneData = sceneData;
    this.frustumCullingID = frustumCullingID;
  }
  var _proto2 = LightBoundsCullingKey.prototype;
  _proto2.update = function update(sceneData, frustumCullingID) {
    if (sceneData === void 0) {
      sceneData = null;
    }
    if (frustumCullingID === void 0) {
      frustumCullingID = -1;
    }
    this.sceneData = sceneData;
    this.frustumCullingID = frustumCullingID;
  };
  return LightBoundsCullingKey;
}();
var LightBoundsCulling = function () {
  function LightBoundsCulling() {
    this.resultKeyIndex = new Map();
    this.resultIndex = new Map();
  }
  var _proto3 = LightBoundsCulling.prototype;
  _proto3.update = function update() {
    this.resultIndex.clear();
    this.resultKeyIndex.clear();
  };
  return LightBoundsCulling;
}();
var LightBoundsCullingResult = function () {
  function LightBoundsCullingResult() {
    this.instances = [];
    this.lightByteOffset = 0xFFFFFFFF;
  }
  var _proto4 = LightBoundsCullingResult.prototype;
  _proto4.update = function update() {
    this.instances.length = 0;
    this.lightByteOffset = 0xFFFFFFFF;
    return this;
  };
  return LightBoundsCullingResult;
}();
function makeRenderQueueKey(frustumCulledResultID, lightBoundsCulledResultID, queueLayoutID) {
  return frustumCulledResultID + "-" + lightBoundsCulledResultID + "-" + queueLayoutID;
}
function extractRenderQueueKey(key) {
  var keys = key.split('-');
  return [parseInt(keys[0]), parseInt(keys[1]), parseInt(keys[2])];
}
var pSceneData;
var FrustumCulling = function () {
  function FrustumCulling() {
    this.resultIndex = new Map();
    this.resultKeyIndex = new Map();
  }
  var _proto5 = FrustumCulling.prototype;
  _proto5.update = function update() {
    this.resultIndex.clear();
    this.resultKeyIndex.clear();
  };
  return FrustumCulling;
}();
function isNodeVisible(node, visibility) {
  return node && (visibility & node.layer) === node.layer;
}
function isModelVisible(model, visibility) {
  return !!(visibility & model.visFlags);
}
function isVisible(model, visibility) {
  return isNodeVisible(model.node, visibility) || isModelVisible(model, visibility);
}
function isReflectProbeMask(model) {
  return bool((model.node.layer & REFLECTION_PROBE_DEFAULT_MASK) === model.node.layer || REFLECTION_PROBE_DEFAULT_MASK & model.visFlags);
}
var transWorldBounds = new AABB();
function isFrustumVisible(model, frustum, castShadow) {
  var modelWorldBounds = model.worldBounds;
  var shadows = pSceneData.shadows;
  if (castShadow && shadows.type === ShadowType.Planar) {
    AABB.transform(transWorldBounds, modelWorldBounds, shadows.matLight);
    return !intersect.aabbFrustum(transWorldBounds, frustum);
  }
  return !intersect.aabbFrustum(modelWorldBounds, frustum);
}
function isIntersectAABB(lAABB, rAABB) {
  return !intersect.aabbWithAABB(lAABB, rAABB);
}
function sceneCulling(scene, camera, camOrLightFrustum, castShadow, probe, models) {
  var skybox = pSceneData.skybox;
  var skyboxModel = skybox.model;
  var visibility = camera.visibility;
  var camSkyboxFlag = camera.clearFlag & SkyBoxFlagValue.VALUE;
  if (!castShadow && skybox && skybox.enabled && skyboxModel && camSkyboxFlag) {
    models.push(skyboxModel);
  }
  for (var _iterator = _createForOfIteratorHelperLoose(scene.models), _step; !(_step = _iterator()).done;) {
    var model = _step.value;
    if (!model.enabled || !model.node || castShadow && !model.castShadow) {
      continue;
    }
    if (scene.isCulledByLod(camera, model)) {
      continue;
    }
    var wBounds = model.worldBounds;
    if (!probe) {
      if (!isVisible(model, visibility)) {
        continue;
      }
      if (wBounds && isFrustumVisible(model, camOrLightFrustum, castShadow)) {
        continue;
      }
      models.push(model);
    } else if (probe.probeType === ProbeType.CUBE) {
      if (!isVisible(model, visibility)) {
        continue;
      }
      if (wBounds && isIntersectAABB(wBounds, probe.boundingBox)) {
        continue;
      }
      models.push(model);
    } else if (isReflectProbeMask(model)) {
      models.push(model);
    }
  }
}
var _tempVec3 = new Vec3();
function computeSortingDepth(camera, model) {
  var depth = 0;
  if (model.node) {
    Vec3.subtract(_tempVec3, model.worldBounds ? model.worldBounds.center : model.node.worldPosition, camera.position);
    depth = Vec3.dot(_tempVec3, camera.forward);
  }
  return depth;
}
function addRenderObject(phaseLayoutId, isDrawOpaqueOrMask, isDrawBlend, isDrawProbe, camera, model, queue) {
  var probeQueue = queue.probeQueue;
  if (isDrawProbe) {
    probeQueue.addToProbeQueue(model, phaseLayoutId);
  }
  var subModels = model.subModels;
  var subModelCount = subModels.length;
  var skyboxModel = pSceneData.skybox.model;
  var depth = computeSortingDepth(camera, model);
  for (var subModelIdx = 0; subModelIdx < subModelCount; ++subModelIdx) {
    var subModel = subModels[subModelIdx];
    var passes = subModel.passes;
    var passCount = passes.length;
    var probePhase = probeQueue.probeMap.includes(subModel);
    if (probePhase) phaseLayoutId = probeQueue.defaultId;
    for (var passIdx = 0; passIdx < passCount; ++passIdx) {
      if (model === skyboxModel && !subModelIdx && !passIdx && isDrawOpaqueOrMask) {
        queue.opaqueQueue.add(model, depth, subModelIdx, passIdx);
        continue;
      }
      var pass = passes[passIdx];
      var phaseAllowed = phaseLayoutId === pass.phaseID;
      if (!phaseAllowed) {
        continue;
      }
      var is_blend = pass.blendState.targets[0].blend;
      var isOpaqueOrMask = !is_blend;
      if (!isDrawBlend && is_blend) {
        continue;
      }
      if (!isDrawOpaqueOrMask && isOpaqueOrMask) {
        continue;
      }
      if (pass.batchingScheme === BatchingSchemes.INSTANCING) {
        if (is_blend) {
          queue.transparentInstancingQueue.add(pass, subModel, passIdx);
        } else {
          queue.opaqueInstancingQueue.add(pass, subModel, passIdx);
        }
      } else if (is_blend) {
        queue.transparentQueue.add(model, depth, subModelIdx, passIdx);
      } else {
        queue.opaqueQueue.add(model, depth, subModelIdx, passIdx);
      }
    }
  }
}
var rangedDirLightBoundingBox = new AABB(0, 0, 0, 0.5, 0.5, 0.5);
var lightAABB = new AABB();
var SceneCulling = function () {
  function SceneCulling() {
    this.frustumCullings = new Map();
    this.frustumCullingResults = [];
    this.lightBoundsCullings = new Map();
    this.lightBoundsCullingResults = [];
    this.renderQueueIndex = new Map();
    this.renderQueues = [];
    this.renderQueueQueryIndex = new Map();
    this.cullingPools = new CullingPools();
    this.numFrustumCulling = 0;
    this.numLightBoundsCulling = 0;
    this.numRenderQueues = 0;
    this.layoutGraph = void 0;
    this.renderGraph = void 0;
    this.enableLightCulling = true;
    this.kFilterMask = SceneFlags.SHADOW_CASTER | SceneFlags.REFLECTION_PROBE;
    this.kDrawMask = SceneFlags.OPAQUE | SceneFlags.MASK | SceneFlags.BLEND;
    this.kAllMask = this.kFilterMask | this.kDrawMask;
  }
  var _proto6 = SceneCulling.prototype;
  _proto6.resetPool = function resetPool() {
    var cullingPools = this.cullingPools;
    cullingPools.frustumCullingKeyRecycle.reset();
    cullingPools.frustumCullingsRecycle.reset();
    cullingPools.lightBoundsCullingRecycle.reset();
    cullingPools.lightBoundsCullingResultRecycle.reset();
    cullingPools.lightBoundsCullingKeyRecycle.reset();
    cullingPools.renderQueueRecycle.reset();
    cullingPools.renderQueueQueryRecycle.reset();
    instancePool.reset();
  };
  _proto6.clear = function clear() {
    this.resetPool();
    this.frustumCullings.clear();
    this.frustumCullingResults.length = 0;
    this.lightBoundsCullings.clear();
    this.lightBoundsCullingResults.length = 0;
    this.renderQueueIndex.clear();
    this.renderQueues.length = 0;
    this.renderQueueQueryIndex.clear();
    this.numLightBoundsCulling = 0;
    this.numFrustumCulling = 0;
    this.numRenderQueues = 0;
  };
  _proto6.buildRenderQueues = function buildRenderQueues(rg, lg, pplSceneData) {
    this.layoutGraph = lg;
    this.renderGraph = rg;
    pSceneData = pplSceneData;
    this.collectCullingQueries(rg);
    this.batchFrustumCulling(pplSceneData);
    this.batchLightBoundsCulling();
    this.fillRenderQueues();
  };
  _proto6.getOrCreateLightBoundsCulling = function getOrCreateLightBoundsCulling(sceneData, frustumCullingID) {
    var _sceneData$shadingLig;
    if (!(sceneData.cullingFlags & CullingFlags.LIGHT_BOUNDS)) {
      return 0xFFFFFFFF;
    }
    if (((_sceneData$shadingLig = sceneData.shadingLight) == null ? void 0 : _sceneData$shadingLig.type) === LightType.DIRECTIONAL) {
      return 0xFFFFFFFF;
    }
    if (!this.enableLightCulling) {
      return 0xFFFFFFFF;
    }
    var scene = sceneData.scene;
    var queries = this.lightBoundsCullings.get(scene);
    if (!queries) {
      var cullingQuery = this.cullingPools.lightBoundsCullingRecycle.add();
      cullingQuery.update();
      this.lightBoundsCullings.set(scene, cullingQuery);
      queries = this.lightBoundsCullings.get(scene);
    }
    var key = computeCullingKey(sceneData, false, frustumCullingID);
    var cullNum = queries.resultIndex.get(key);
    if (cullNum !== undefined) {
      return cullNum;
    }
    var lightBoundsCullingID = this.numLightBoundsCulling++;
    if (this.numLightBoundsCulling > this.lightBoundsCullingResults.length) {
      this.lightBoundsCullingResults.push(this.cullingPools.lightBoundsCullingResultRecycle.add().update());
    }
    queries.resultIndex.set(key, lightBoundsCullingID);
    var cullingKey = this.cullingPools.lightBoundsCullingKeyRecycle.add();
    cullingKey.update(sceneData, frustumCullingID);
    queries.resultKeyIndex.set(key, cullingKey);
    return lightBoundsCullingID;
  };
  _proto6.getOrCreateFrustumCulling = function getOrCreateFrustumCulling(sceneId) {
    var sceneData = this.renderGraph.j(sceneId);
    var scene = sceneData.scene;
    var queries = this.frustumCullings.get(scene);
    if (!queries) {
      var cullingQuery = this.cullingPools.frustumCullingsRecycle.add();
      cullingQuery.update();
      this.frustumCullings.set(scene, cullingQuery);
      queries = this.frustumCullings.get(scene);
    }
    var castShadow = bool(sceneData.flags & SceneFlags.SHADOW_CASTER);
    var key = computeCullingKey(sceneData, castShadow);
    var cullNum = queries.resultIndex.get(key);
    if (cullNum !== undefined) {
      return cullNum;
    }
    var frustumCulledResultID = this.numFrustumCulling++;
    if (this.numFrustumCulling > this.frustumCullingResults.length) {
      this.frustumCullingResults.push([]);
    }
    queries.resultIndex.set(key, frustumCulledResultID);
    var cullingKey = this.cullingPools.frustumCullingKeyRecycle.add();
    cullingKey.update(sceneData, castShadow);
    queries.resultKeyIndex.set(key, cullingKey);
    return frustumCulledResultID;
  };
  _proto6.getOrCreateRenderQueue = function getOrCreateRenderQueue(renderQueueKey, sceneFlags, camera) {
    var renderQueueID = this.renderQueueIndex.get(renderQueueKey);
    if (renderQueueID !== undefined) {
      var _rq = this.renderQueues[renderQueueID];
      {
        assert(_rq.camera === camera);
        assert((_rq.sceneFlags & this.kFilterMask) === (sceneFlags & this.kFilterMask));
      }
      _rq.sceneFlags |= sceneFlags & this.kDrawMask;
      return renderQueueID;
    }
    var targetID = this.numRenderQueues++;
    if (this.numRenderQueues > this.renderQueues.length) {
      var renderQueue = this.cullingPools.renderQueueRecycle.add();
      renderQueue.update();
      this.renderQueues.push(renderQueue);
    }
    var rq = this.renderQueues[targetID];
    this.renderQueueIndex.set(renderQueueKey, targetID);
    {
      assert(rq.empty());
      assert(rq.camera === null);
      assert(rq.sceneFlags === SceneFlags.NONE);
      assert(camera !== null);
      assert(this.renderQueueIndex.size === this.numRenderQueues);
    }
    rq.camera = camera;
    rq.sceneFlags = sceneFlags & this.kAllMask;
    return targetID;
  };
  _proto6.collectCullingQueries = function collectCullingQueries(rg) {
    for (var _iterator2 = _createForOfIteratorHelperLoose(rg.v()), _step2; !(_step2 = _iterator2()).done;) {
      var v = _step2.value;
      if (!rg.h(RenderGraphValue.Scene, v) || !rg.getValid(v)) {
        continue;
      }
      var sceneData = rg.j(v);
      if (!sceneData.scene) {
        continue;
      }
      var frustumCulledResultID = this.getOrCreateFrustumCulling(v);
      var lightBoundsCullingID = this.getOrCreateLightBoundsCulling(sceneData, frustumCulledResultID);
      var queueID = rg.getParent(v);
      {
        assert(queueID !== 0xFFFFFFFF);
        assert(rg.h(RenderGraphValue.Queue, queueID));
      }
      var renderQueue = rg.j(queueID);
      var phaseLayoutID = renderQueue.phaseID;
      var renderQueueKey = makeRenderQueueKey(frustumCulledResultID, lightBoundsCullingID, phaseLayoutID);
      var renderQueueID = this.getOrCreateRenderQueue(renderQueueKey, sceneData.flags, sceneData.camera);
      var renderQueueQuery = this.cullingPools.renderQueueQueryRecycle.add();
      renderQueueQuery.update(frustumCulledResultID, lightBoundsCullingID, renderQueueID);
      this.renderQueueQueryIndex.set(v, renderQueueQuery);
    }
  };
  _proto6.uploadInstancing = function uploadInstancing(cmdBuffer) {
    for (var queueID = 0; queueID !== this.numRenderQueues; ++queueID) {
      var queue = this.renderQueues[queueID];
      queue.opaqueInstancingQueue.uploadBuffers(cmdBuffer);
      queue.transparentInstancingQueue.uploadBuffers(cmdBuffer);
    }
  };
  _proto6._getPhaseIdFromScene = function _getPhaseIdFromScene(scene) {
    var rg = this.renderGraph;
    var renderQueueId = rg.getParent(scene);
    var graphRenderQueue = rg.j(renderQueueId);
    return graphRenderQueue.phaseID;
  };
  _proto6.getBuiltinShadowFrustum = function getBuiltinShadowFrustum(pplSceneData, camera, mainLight, level) {
    var csmLayers = pplSceneData.csmLayers;
    var csmLevel = mainLight.csmLevel;
    var shadows = pplSceneData.shadows;
    if (shadows.type === ShadowType.Planar) {
      return camera.frustum;
    }
    if (shadows.enabled && shadows.type === ShadowType.ShadowMap && mainLight && mainLight.node) {
      csmLayers.update(pplSceneData, camera);
    }
    if (mainLight.shadowFixedArea || csmLevel === CSMLevel.LEVEL_1) {
      return csmLayers.specialLayer.validFrustum;
    }
    return csmLayers.layers[level].validFrustum;
  };
  _proto6.batchFrustumCulling = function batchFrustumCulling(pplSceneData) {
    for (var _iterator3 = _createForOfIteratorHelperLoose(this.frustumCullings), _step3; !(_step3 = _iterator3()).done;) {
      var _step3$value = _step3.value,
        scene = _step3$value[0],
        queries = _step3$value[1];
      for (var _iterator4 = _createForOfIteratorHelperLoose(queries.resultIndex), _step4; !(_step4 = _iterator4()).done;) {
        var _step4$value = _step4.value,
          key = _step4$value[0],
          frustomCulledResultID = _step4$value[1];
        var cullingKey = queries.resultKeyIndex.get(key);
        var sceneData = cullingKey.sceneData;
        var light = sceneData.light.light;
        var level = sceneData.light.level;
        var castShadow = cullingKey.castShadows;
        var probe = sceneData.light.probe;
        var camera = probe ? probe.camera : sceneData.camera;
        var models = this.frustumCullingResults[frustomCulledResultID];
        if (probe) {
          sceneCulling(scene, camera, camera.frustum, castShadow, probe, models);
          continue;
        }
        if (light) {
          switch (light.type) {
            case LightType.SPOT:
              sceneCulling(scene, camera, light.frustum, castShadow, null, models);
              break;
            case LightType.DIRECTIONAL:
              {
                var frustum = this.getBuiltinShadowFrustum(pplSceneData, camera, light, level);
                sceneCulling(scene, camera, frustum, castShadow, null, models);
              }
              break;
          }
        } else {
          sceneCulling(scene, camera, camera.frustum, castShadow, null, models);
        }
      }
    }
  };
  _proto6.executeSphereLightCulling = function executeSphereLightCulling(light, frustumCullingResult, lightBoundsCullingResult) {
    var lightAABB = light.aabb;
    for (var _iterator5 = _createForOfIteratorHelperLoose(frustumCullingResult), _step5; !(_step5 = _iterator5()).done;) {
      var model = _step5.value;
      var modelBounds = model.worldBounds;
      if (!modelBounds || intersect.aabbWithAABB(modelBounds, lightAABB)) {
        lightBoundsCullingResult.push(model);
      }
    }
  };
  _proto6.executeSpotLightCulling = function executeSpotLightCulling(light, frustumCullingResult, lightBoundsCullingResult) {
    var lightAABB = light.aabb;
    var lightFrustum = light.frustum;
    for (var _iterator6 = _createForOfIteratorHelperLoose(frustumCullingResult), _step6; !(_step6 = _iterator6()).done;) {
      var model = _step6.value;
      var modelBounds = model.worldBounds;
      if (!modelBounds || intersect.aabbWithAABB(lightAABB, modelBounds) && intersect.aabbFrustum(modelBounds, lightFrustum)) {
        lightBoundsCullingResult.push(model);
      }
    }
  };
  _proto6.executePointLightCulling = function executePointLightCulling(light, frustumCullingResult, lightBoundsCullingResult) {
    var lightAABB = light.aabb;
    for (var _iterator7 = _createForOfIteratorHelperLoose(frustumCullingResult), _step7; !(_step7 = _iterator7()).done;) {
      var model = _step7.value;
      var modelBounds = model.worldBounds;
      if (!modelBounds || intersect.aabbWithAABB(lightAABB, modelBounds)) {
        lightBoundsCullingResult.push(model);
      }
    }
  };
  _proto6.executeRangedDirectionalLightCulling = function executeRangedDirectionalLightCulling(light, frustumCullingResult, lightBoundsCullingResult) {
    rangedDirLightBoundingBox.transform(light.node.worldMatrix, null, null, null, lightAABB);
    for (var _iterator8 = _createForOfIteratorHelperLoose(frustumCullingResult), _step8; !(_step8 = _iterator8()).done;) {
      var model = _step8.value;
      var modelBounds = model.worldBounds;
      if (!modelBounds || intersect.aabbWithAABB(lightAABB, modelBounds)) {
        lightBoundsCullingResult.push(model);
      }
    }
  };
  _proto6.batchLightBoundsCulling = function batchLightBoundsCulling() {
    for (var _iterator9 = _createForOfIteratorHelperLoose(this.lightBoundsCullings), _step9; !(_step9 = _iterator9()).done;) {
      var _step9$value = _step9.value;
        _step9$value[0];
        var queries = _step9$value[1];
      for (var _iterator0 = _createForOfIteratorHelperLoose(queries.resultIndex), _step0; !(_step0 = _iterator0()).done;) {
        var _step0$value = _step0.value,
          key = _step0$value[0],
          cullingID = _step0$value[1];
        var cullingKey = queries.resultKeyIndex.get(key);
        var sceneData = cullingKey.sceneData;
        var frustumCullingID = cullingKey.frustumCullingID;
        var frustumCullingResult = this.frustumCullingResults[frustumCullingID];
        var lightBoundsCullingResult = this.lightBoundsCullingResults[cullingID];
        switch (sceneData.shadingLight.type) {
          case LightType.SPHERE:
            {
              var light = sceneData.shadingLight;
              this.executeSphereLightCulling(light, frustumCullingResult, lightBoundsCullingResult.instances);
            }
            break;
          case LightType.SPOT:
            {
              var _light = sceneData.shadingLight;
              this.executeSpotLightCulling(_light, frustumCullingResult, lightBoundsCullingResult.instances);
            }
            break;
          case LightType.POINT:
            {
              var _light2 = sceneData.shadingLight;
              this.executePointLightCulling(_light2, frustumCullingResult, lightBoundsCullingResult.instances);
            }
            break;
          case LightType.RANGED_DIRECTIONAL:
            {
              var _light3 = sceneData.shadingLight;
              this.executeRangedDirectionalLightCulling(_light3, frustumCullingResult, lightBoundsCullingResult.instances);
            }
            break;
          case LightType.DIRECTIONAL:
          case LightType.UNKNOWN:
        }
      }
    }
  };
  _proto6._getModelsByCullingResults = function _getModelsByCullingResults(lightBoundsCullingID, frustomCulledResultID) {
    if (lightBoundsCullingID !== 0xFFFFFFFF) {
      if (lightBoundsCullingID < this.lightBoundsCullingResults.length) {
        return this.lightBoundsCullingResults[lightBoundsCullingID].instances;
      } else {
        return [];
      }
    }
    if (frustomCulledResultID < this.frustumCullingResults.length) {
      return this.frustumCullingResults[frustomCulledResultID];
    } else {
      return [];
    }
  };
  _proto6.fillRenderQueues = function fillRenderQueues() {
    for (var _iterator1 = _createForOfIteratorHelperLoose(this.renderQueueIndex), _step1; !(_step1 = _iterator1()).done;) {
      var _step1$value = _step1.value,
        key = _step1$value[0],
        targetID = _step1$value[1];
      var renderQueue = this.renderQueues[targetID];
      {
        assert(targetID < this.renderQueues.length);
        assert(renderQueue.empty());
      }
      var _extractRenderQueueKe = extractRenderQueueKey(key),
        frustomCulledResultID = _extractRenderQueueKe[0],
        lightBoundsCullingID = _extractRenderQueueKe[1],
        phaseLayoutID = _extractRenderQueueKe[2];
      var isDrawBlend = bool(renderQueue.sceneFlags & SceneFlags.BLEND);
      var isDrawOpaqueOrMask = bool(renderQueue.sceneFlags & (SceneFlags.OPAQUE | SceneFlags.MASK));
      var isDrawShadowCaster = bool(renderQueue.sceneFlags & SceneFlags.SHADOW_CASTER);
      var isDrawProbe = bool(renderQueue.sceneFlags & SceneFlags.REFLECTION_PROBE);
      if (!isDrawShadowCaster && !isDrawBlend && !isDrawOpaqueOrMask && !isDrawProbe) {
        continue;
      }
      var sourceModels = this._getModelsByCullingResults(lightBoundsCullingID, frustomCulledResultID);
      var camera = renderQueue.camera;
      for (var _iterator10 = _createForOfIteratorHelperLoose(sourceModels), _step10; !(_step10 = _iterator10()).done;) {
        var model = _step10.value;
        addRenderObject(phaseLayoutID, isDrawOpaqueOrMask, isDrawBlend, isDrawProbe, camera, model, renderQueue);
      }
      renderQueue.sort();
    }
  };
  return SceneCulling;
}();
var LightResource = function () {
  function LightResource() {
    this.cpuBuffer = void 0;
    this.programLibrary = void 0;
    this.device = null;
    this.elementSize = 0;
    this.maxNumLights = 16;
    this.binding = 0xFFFFFFFF;
    this.resized = false;
    this.lightBuffer = void 0;
    this.firstLightBufferView = null;
    this.lights = [];
    this.lightIndex = new Map();
  }
  var _proto7 = LightResource.prototype;
  _proto7.init = function init(programLib, deviceIn, maxNumLights) {
    this.device = deviceIn;
    this.programLibrary = programLib;
    var instanceLayout = this.programLibrary.localLayoutData;
    var attrID = programLib.layoutGraph.attributeIndex.get('CCForwardLight');
    var uniformBlock = instanceLayout.uniformBlocks.get(attrID);
    this.elementSize = AlignUp(getUniformBlockSize(uniformBlock.members), this.device.capabilities.uboOffsetAlignment);
    this.maxNumLights = maxNumLights;
    this.binding = programLib.localLayoutData.bindingMap.get(attrID);
    var bufferSize = this.elementSize * this.maxNumLights;
    this.lightBuffer = this.device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, bufferSize, this.elementSize));
    this.firstLightBufferView = this.device.createBuffer(new BufferViewInfo(this.lightBuffer, 0, this.elementSize));
    this.cpuBuffer = new Float32Array(bufferSize / Float32Array.BYTES_PER_ELEMENT);
    this.resized = true;
  };
  _proto7.buildLights = function buildLights(sceneCulling, bHDR, shadowInfo) {
    for (var _iterator11 = _createForOfIteratorHelperLoose(sceneCulling.lightBoundsCullings), _step11; !(_step11 = _iterator11()).done;) {
      var _step11$value = _step11.value;
        _step11$value[0];
        var lightBoundsCullings = _step11$value[1];
      for (var _iterator13 = _createForOfIteratorHelperLoose(lightBoundsCullings.resultIndex), _step13; !(_step13 = _iterator13()).done;) {
        var _step13$value = _step13.value,
          key = _step13$value[0],
          lightBoundsCullingID = _step13$value[1];
        var lightBoundsCulling = lightBoundsCullings.resultKeyIndex.get(key);
        var sceneData = lightBoundsCulling.sceneData;
        var exposure = 1.0;
        if (sceneData.camera) {
          exposure = sceneData.camera.exposure;
        } else if (sceneData.light.probe && sceneData.light.probe.camera) {
          exposure = sceneData.light.probe.camera.exposure;
        } else {
          throw new Error('Unexpected situation: No camera or probe found.');
        }
        var lightByteOffset = this.addLight(sceneData.shadingLight, bHDR, exposure, shadowInfo);
        var result = sceneCulling.lightBoundsCullingResults[lightBoundsCullingID];
        result.lightByteOffset = lightByteOffset;
      }
    }
    for (var _iterator12 = _createForOfIteratorHelperLoose(sceneCulling.renderQueueQueryIndex), _step12; !(_step12 = _iterator12()).done;) {
      var _step12$value = _step12.value;
        _step12$value[0];
        var query = _step12$value[1];
      if (query.lightBoundsCulledResultID === 0xFFFFFFFF) {
        continue;
      }
      var _lightByteOffset = sceneCulling.lightBoundsCullingResults[query.lightBoundsCulledResultID].lightByteOffset;
      sceneCulling.renderQueues[query.renderQueueTarget].lightByteOffset = _lightByteOffset;
    }
  };
  _proto7.tryUpdateRenderSceneLocalDescriptorSet = function tryUpdateRenderSceneLocalDescriptorSet(sceneCulling) {
    if (!sceneCulling.lightBoundsCullings.size) {
      return;
    }
    for (var _iterator14 = _createForOfIteratorHelperLoose(sceneCulling.frustumCullings), _step14; !(_step14 = _iterator14()).done;) {
      var _step14$value = _step14.value,
        scene = _step14$value[0];
        _step14$value[1];
      for (var _iterator15 = _createForOfIteratorHelperLoose(scene.models), _step15; !(_step15 = _iterator15()).done;) {
        var model = _step15.value;
        if (!model) {
          throw new Error('Unexpected null model.');
        }
        for (var _iterator16 = _createForOfIteratorHelperLoose(model.subModels), _step16; !(_step16 = _iterator16()).done;) {
          var submodel = _step16.value;
          var set = submodel.descriptorSet;
          var prev = set.getBuffer(this.binding);
          if (this.resized || prev !== this.firstLightBufferView) {
            set.bindBuffer(this.binding, this.firstLightBufferView);
            set.update();
          }
        }
      }
    }
    this.resized = false;
  };
  _proto7.clear = function clear() {
    if (!this.lightBuffer) return;
    this.cpuBuffer.fill(0);
    this.lights.length = 0;
    this.lightIndex.clear();
  };
  _proto7.addLight = function addLight(light, bHDR, exposure, shadowInfo) {
    var existingLightID = this.lightIndex.get(light);
    if (existingLightID !== undefined) {
      return existingLightID;
    }
    if (!this.lightBuffer) {
      var programLib = cclegacy.rendering.programLib;
      this.init(programLib, deviceManager.gfxDevice, 16);
    }
    if (this.lights.length === this.maxNumLights) {
      this.resized = true;
      this.maxNumLights *= 2;
      var bufferSize = this.elementSize * this.maxNumLights;
      this.lightBuffer.resize(bufferSize);
      this.firstLightBufferView = this.device.createBuffer(new BufferViewInfo(this.lightBuffer, 0, this.elementSize));
      var prevCpuBuffer = this.cpuBuffer;
      this.cpuBuffer = new Float32Array(bufferSize / Float32Array.BYTES_PER_ELEMENT);
      this.cpuBuffer.set(prevCpuBuffer);
    }
    var lightID = this.lights.length;
    this.lights[lightID] = light;
    this.lightIndex.set(light, lightID);
    var offset = this.elementSize / Float32Array.BYTES_PER_ELEMENT * lightID;
    SetLightUBO(light, bHDR, exposure, shadowInfo, this.cpuBuffer, offset, this.elementSize);
    return lightID * this.elementSize;
  };
  _proto7.buildLightBuffer = function buildLightBuffer(cmdBuffer) {
    if (!this.lightBuffer) return;
    cmdBuffer.updateBuffer(this.lightBuffer, this.cpuBuffer, this.lights.length * this.elementSize / Float32Array.BYTES_PER_ELEMENT);
  };
  return LightResource;
}();

var ResourceVisitor$1 = function () {
  function ResourceVisitor(resName) {
    if (resName === void 0) {
      resName = '';
    }
    this.name = void 0;
    this.name = resName;
    if (context$1) {
      var ppl = context$1.pipeline;
      ppl.resourceUses.push(resName);
    }
  }
  var _proto = ResourceVisitor.prototype;
  _proto.checkTexture = function checkTexture(name) {
    var dTex = context$1.deviceTextures.get(name);
    if (!dTex) return false;
    var _context$resourceGrap = context$1.resourceGraph.getDesc(context$1.resourceGraph.vertex(name)),
      descWidth = _context$resourceGrap.width,
      descHeight = _context$resourceGrap.height;
    var checkDimensions = function checkDimensions(actualWidth, actualHeight) {
      return actualWidth === descWidth && actualHeight === descHeight;
    };
    return dTex.texture ? checkDimensions(dTex.texture.width, dTex.texture.height) : dTex.swapchain ? checkDimensions(dTex.swapchain.width, dTex.swapchain.height) : false;
  };
  _proto.createDeviceTex = function createDeviceTex(value) {
    var dTex = context$1.deviceTextures.get(this.name);
    if (!dTex || !this.checkTexture(this.name)) {
      var _dTex;
      if ((_dTex = dTex) != null && _dTex.texture) {
        dTex.texture.destroy();
      }
      dTex = new DeviceTexture(this.name, value);
      context$1.deviceTextures.set(this.name, dTex);
    }
  };
  _proto.checkBuffer = function checkBuffer(name) {
    var dBuf = context$1.deviceBuffers.get(name);
    var resID = context$1.resourceGraph.vertex(this.name);
    var desc = context$1.resourceGraph.getDesc(resID);
    return dBuf.buffer.size >= desc.width;
  };
  _proto.createDeviceBuf = function createDeviceBuf(value) {
    var dBuf = context$1.deviceBuffers.get(this.name);
    if (!dBuf || !this.checkBuffer(this.name)) {
      var _dBuf;
      if ((_dBuf = dBuf) != null && _dBuf.buffer) {
        dBuf.buffer.destroy();
      }
      dBuf = new DeviceBuffer(this.name, value);
      context$1.deviceBuffers.set(this.name, dBuf);
    }
  };
  _proto.managed = function managed(value) {
    this.createDeviceTex(value);
  };
  _proto.managedBuffer = function managedBuffer(value) {
    this.createDeviceBuf(value);
  };
  _proto.managedTexture = function managedTexture(value) {};
  _proto.persistentBuffer = function persistentBuffer(value) {
    this.createDeviceBuf(value);
  };
  _proto.persistentTexture = function persistentTexture(value) {
    this.createDeviceTex(value);
  };
  _proto.framebuffer = function framebuffer(value) {
    this.createDeviceTex(value);
  };
  _proto.swapchain = function swapchain(value) {
    this.createDeviceTex(value);
  };
  _proto.formatView = function formatView(value) {};
  _proto.subresourceView = function subresourceView(value) {};
  return _createClass(ResourceVisitor, [{
    key: "resName",
    set: function set(value) {
      this.name = value;
    }
  }]);
}();
var context$1;
var DeviceResource = function () {
  function DeviceResource(name) {
    this._name = void 0;
    this._name = name;
  }
  return _createClass(DeviceResource, [{
    key: "name",
    get: function get() {
      return this._name;
    }
  }]);
}();
var DeviceTexture = function (_DeviceResource2) {
  function DeviceTexture(name, tex) {
    var _this;
    _this = _DeviceResource2.call(this, name) || this;
    _this._texture = null;
    _this._swapchain = null;
    _this._framebuffer = null;
    _this._desc = null;
    _this._trait = null;
    var resGraph = context$1.resourceGraph;
    var verID = resGraph.vertex(name);
    _this._desc = resGraph.getDesc(verID);
    _this._trait = resGraph.getTraits(verID);
    if (tex instanceof Texture) {
      _this._texture = tex;
    } else if (tex instanceof Framebuffer) {
      _this._framebuffer = tex;
    } else if (tex instanceof RenderSwapchain) {
      _this._swapchain = tex.swapchain;
    } else {
      _this.createTextureFromDesc(_this._desc);
    }
    return _this;
  }
  _inheritsLoose(DeviceTexture, _DeviceResource2);
  var _proto2 = DeviceTexture.prototype;
  _proto2.createTextureFromDesc = function createTextureFromDesc(desc) {
    var type = TextureType.TEX2D;
    switch (desc.dimension) {
      case ResourceDimension.TEXTURE1D:
        type = TextureType.TEX1D;
        break;
      case ResourceDimension.TEXTURE3D:
        type = TextureType.TEX3D;
        break;
    }
    var usageFlags = [[ResourceFlags.COLOR_ATTACHMENT, TextureUsageBit.COLOR_ATTACHMENT], [ResourceFlags.DEPTH_STENCIL_ATTACHMENT, TextureUsageBit.DEPTH_STENCIL_ATTACHMENT], [ResourceFlags.INPUT_ATTACHMENT, TextureUsageBit.INPUT_ATTACHMENT], [ResourceFlags.SAMPLED, TextureUsageBit.SAMPLED], [ResourceFlags.STORAGE, TextureUsageBit.STORAGE], [ResourceFlags.TRANSFER_SRC, TextureUsageBit.TRANSFER_SRC], [ResourceFlags.TRANSFER_DST, TextureUsageBit.TRANSFER_DST]].reduce(function (acc, _ref) {
      var flag = _ref[0],
        bit = _ref[1];
      return desc.flags & flag ? acc | bit : acc;
    }, TextureUsageBit.NONE);
    var texInfo = new TextureInfo(type, usageFlags, desc.format, desc.width, desc.height);
    texInfo.samples = desc.sampleCount;
    this._texture = context$1.device.createTexture(texInfo);
  };
  _proto2.getGPUTexture = function getGPUTexture() {
    var gpuTex = this._texture;
    if (this.framebuffer) {
      gpuTex = this.framebuffer.colorTextures[0];
    } else if (this.swapchain) {
      gpuTex = this.swapchain.colorTexture;
    }
    return gpuTex;
  };
  _proto2.release = function release() {
    var _this$framebuffer, _this$texture;
    (_this$framebuffer = this.framebuffer) == null ? void 0 : _this$framebuffer.destroy();
    this._framebuffer = null;
    (_this$texture = this.texture) == null ? void 0 : _this$texture.destroy();
    this._texture = null;
  };
  return _createClass(DeviceTexture, [{
    key: "texture",
    get: function get() {
      return this._texture;
    }
  }, {
    key: "framebuffer",
    get: function get() {
      return this._framebuffer;
    },
    set: function set(val) {
      this._framebuffer = val;
    }
  }, {
    key: "description",
    get: function get() {
      return this._desc;
    }
  }, {
    key: "trait",
    get: function get() {
      return this._trait;
    }
  }, {
    key: "swapchain",
    get: function get() {
      return this._swapchain;
    }
  }]);
}(DeviceResource);
function isShadowMap(scene) {
  var pSceneData = cclegacy.director.root.pipeline.pipelineSceneData;
  return !!(pSceneData.shadows.enabled && pSceneData.shadows.type === ShadowType.ShadowMap && scene && (scene.flags & SceneFlags.SHADOW_CASTER) !== 0);
}
var DeviceBuffer = function (_DeviceResource3) {
  function DeviceBuffer(name, buffer) {
    var _this2;
    _this2 = _DeviceResource3.call(this, name) || this;
    _this2._buffer = null;
    var resGraph = context$1.resourceGraph;
    var verID = resGraph.vertex(name);
    var desc = resGraph.getDesc(verID);
    var bufferInfo = new BufferInfo(_this2.calculateBufferUsage(desc.flags), MemoryUsageBit.DEVICE, desc.width);
    _this2._buffer = context$1.device.createBuffer(bufferInfo);
    return _this2;
  }
  _inheritsLoose(DeviceBuffer, _DeviceResource3);
  var _proto3 = DeviceBuffer.prototype;
  _proto3.calculateBufferUsage = function calculateBufferUsage(flags) {
    var flagToUsageMap = [[ResourceFlags.INDIRECT, BufferUsageBit.INDIRECT], [ResourceFlags.UNIFORM, BufferUsageBit.UNIFORM], [ResourceFlags.STORAGE, BufferUsageBit.STORAGE], [ResourceFlags.TRANSFER_SRC, BufferUsageBit.TRANSFER_SRC], [ResourceFlags.TRANSFER_DST, BufferUsageBit.TRANSFER_DST]];
    return flagToUsageMap.reduce(function (acc, _ref2) {
      var flag = _ref2[0],
        usage = _ref2[1];
      return flags & flag ? acc | usage : acc;
    }, BufferUsageBit.NONE);
  };
  _proto3.release = function release() {
    var _this$_buffer;
    (_this$_buffer = this._buffer) == null ? void 0 : _this$_buffer.destroy();
    this._buffer = null;
  };
  return _createClass(DeviceBuffer, [{
    key: "buffer",
    get: function get() {
      return this._buffer;
    }
  }]);
}(DeviceResource);
var _vec4Array = new Float32Array(4);
var BlitDesc = function () {
  function BlitDesc(blit) {
    this._isUpdate = false;
    this._isGatherLight = false;
    this._blit = void 0;
    this._screenQuad = null;
    this._stageDesc = void 0;
    this._lightVolumeBuffer = null;
    this._lightMeterScale = 10000.0;
    this._lightBufferData = void 0;
    this._blit = blit;
  }
  var _proto4 = BlitDesc.prototype;
  _proto4._createQuadInputAssembler = function _createQuadInputAssembler() {
    return context$1.blit.pipelineIAData;
  };
  _proto4.createScreenQuad = function createScreenQuad() {
    if (!this._screenQuad) {
      this._screenQuad = this._createQuadInputAssembler();
    }
  };
  _proto4._gatherVolumeLights = function _gatherVolumeLights(camera) {
    var _this3 = this;
    if (!camera.scene) return;
    var pipeline = context$1.pipeline;
    var cmdBuff = context$1.commandBuffer;
    var sphereLights = camera.scene.sphereLights;
    var spotLights = camera.scene.spotLights;
    var exposure = camera.exposure;
    var maxLights = UBODeferredLight.LIGHTS_PER_PASS;
    var elementLen = Vec4.length;
    var fieldLen = elementLen * maxLights;
    var _sphere = Sphere.create(0, 0, 0, 1);
    var idx = 0;
    var processLight = function processLight(light, isSpot) {
      if (idx >= maxLights) return;
      Sphere.set(_sphere, light.position.x, light.position.y, light.position.z, light.range);
      if (intersect.sphereFrustum(_sphere, camera.frustum)) {
        Vec3.toArray(_vec4Array, light.position);
        _vec4Array[3] = isSpot ? 1 : 0;
        _this3._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 0);
        Vec3.toArray(_vec4Array, light.color);
        if (light.useColorTemperature) {
          var tempRGB = light.colorTemperatureRGB;
          _vec4Array[0] *= tempRGB.x;
          _vec4Array[1] *= tempRGB.y;
          _vec4Array[2] *= tempRGB.z;
        }
        _vec4Array[3] = pipeline.pipelineSceneData.isHDR ? light.luminance * exposure * _this3._lightMeterScale : light.luminance;
        _this3._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 1);
        _vec4Array[0] = light.size;
        _vec4Array[1] = light.range;
        _vec4Array[2] = isSpot ? light.spotAngle : 0.0;
        _this3._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 2);
        if (isSpot) {
          Vec3.toArray(_vec4Array, light.direction);
          _this3._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 3);
        }
        idx++;
      }
    };
    for (var _iterator = _createForOfIteratorHelperLoose(sphereLights), _step; !(_step = _iterator()).done;) {
      var light = _step.value;
      processLight(light, false);
    }
    for (var _iterator2 = _createForOfIteratorHelperLoose(spotLights), _step2; !(_step2 = _iterator2()).done;) {
      var _light = _step2.value;
      processLight(_light, true);
    }
    var offset = fieldLen * 3 + 3;
    this._lightBufferData.set([idx], offset);
    cmdBuff.updateBuffer(this._lightVolumeBuffer, this._lightBufferData);
  };
  _proto4.update = function update() {
    if (this.blit.sceneFlags & SceneFlags.VOLUMETRIC_LIGHTING && this.blit.camera && !this._isGatherLight) {
      this._gatherVolumeLights(this.blit.camera);
      this._isGatherLight = true;
      this._isUpdate = false;
    }
    if (!this._isUpdate) {
      this._stageDesc.update();
      this._isUpdate = true;
    }
  };
  _proto4.reset = function reset() {
    this._isUpdate = false;
    this._isGatherLight = false;
  };
  _proto4.createStageDescriptor = function createStageDescriptor() {
    var blit = this.blit;
    var pass = blit.material.passes[blit.passID];
    var device = context$1.device;
    this._stageDesc = context$1.blit.stageDescs.get(pass) || device.createDescriptorSet(new DescriptorSetInfo(pass.localSetLayout));
    context$1.blit.stageDescs.set(pass, this._stageDesc);
    if (this.blit.sceneFlags & SceneFlags.VOLUMETRIC_LIGHTING) {
      this._lightVolumeBuffer = context$1.blit.lightVolumeBuffer;
      var deferredLitsBufView = context$1.blit.deferredLitsBufView;
      this._lightBufferData = context$1.blit.lightBufferData;
      this._lightBufferData.fill(0);
      this._stageDesc.bindBuffer(UBOForwardLight.BINDING, deferredLitsBufView);
    }
    this._stageDesc.bindBuffer(UBOLocal.BINDING, context$1.blit.emptyLocalUBO);
  };
  return _createClass(BlitDesc, [{
    key: "screenQuad",
    get: function get() {
      return this._screenQuad;
    }
  }, {
    key: "blit",
    get: function get() {
      return this._blit;
    },
    set: function set(blit) {
      this._blit = blit;
    }
  }, {
    key: "stageDesc",
    get: function get() {
      return this._stageDesc;
    }
  }]);
}();
var DeviceComputeQueue = function () {
  function DeviceComputeQueue() {
    this._devicePass = void 0;
    this._hint = QueueHint.NONE;
    this._phaseID = getPhaseID$1('default');
    this._renderPhase = null;
    this._descSetData = null;
    this._layoutID = -1;
    this._isUpdateUBO = false;
    this._isUploadInstance = false;
    this._isUploadBatched = false;
    this._queueId = -1;
  }
  var _proto5 = DeviceComputeQueue.prototype;
  _proto5.preRecord = function preRecord() {};
  _proto5.postRecord = function postRecord() {};
  _proto5.init = function init(devicePass, renderQueue, id) {
    this.reset();
    this.queueHint = renderQueue.hint;
    this.queueId = id;
    this._devicePass = devicePass;
    this._phaseID = cclegacy.rendering.getPhaseID(devicePass.passID, context$1.renderGraph.getLayout(id));
  };
  _proto5.reset = function reset() {
    this._isUpdateUBO = false;
    this._isUploadInstance = false;
    this._isUploadBatched = false;
  };
  _proto5.record = function record() {
    if (this._descSetData && this._descSetData.descriptorSet) {
      context$1.commandBuffer.bindDescriptorSet(SetIndex.COUNT, this._descSetData.descriptorSet);
    }
  };
  return _createClass(DeviceComputeQueue, [{
    key: "phaseID",
    get: function get() {
      return this._phaseID;
    }
  }, {
    key: "layoutID",
    get: function get() {
      return this._layoutID;
    },
    set: function set(value) {
      this._layoutID = value;
      var layoutGraph = context$1.layoutGraph;
      this._renderPhase = layoutGraph.h(LayoutGraphDataValue.RenderPhase, value) ? layoutGraph.j(value) : null;
      var layout = layoutGraph.getLayout(value);
      this._descSetData = layout.getSet(UpdateFrequency.PER_PHASE);
    }
  }, {
    key: "descSetData",
    get: function get() {
      return this._descSetData;
    }
  }, {
    key: "renderPhase",
    get: function get() {
      return this._renderPhase;
    }
  }, {
    key: "queueId",
    get: function get() {
      return this._queueId;
    },
    set: function set(val) {
      this._queueId = val;
    }
  }, {
    key: "isUpdateUBO",
    get: function get() {
      return this._isUpdateUBO;
    },
    set: function set(update) {
      this._isUpdateUBO = update;
    }
  }, {
    key: "isUploadInstance",
    get: function get() {
      return this._isUploadInstance;
    },
    set: function set(value) {
      this._isUploadInstance = value;
    }
  }, {
    key: "isUploadBatched",
    get: function get() {
      return this._isUploadBatched;
    },
    set: function set(value) {
      this._isUploadBatched = value;
    }
  }, {
    key: "queueHint",
    get: function get() {
      return this._hint;
    },
    set: function set(value) {
      this._hint = value;
    }
  }, {
    key: "devicePass",
    get: function get() {
      return this._devicePass;
    }
  }]);
}();
var DeviceRenderQueue = function () {
  function DeviceRenderQueue() {
    this._renderScenes = [];
    this._devicePass = void 0;
    this._hint = QueueHint.NONE;
    this._graphQueue = void 0;
    this._phaseID = getPhaseID$1('default');
    this._renderPhase = null;
    this._descSetData = null;
    this._viewport = null;
    this._scissor = null;
    this._layoutID = -1;
    this._isUpdateUBO = false;
    this._isUploadInstance = false;
    this._isUploadBatched = false;
    this._blitDesc = null;
    this._queueId = -1;
  }
  var _proto6 = DeviceRenderQueue.prototype;
  _proto6.init = function init(devicePass, renderQueue, id) {
    this.reset();
    this._graphQueue = renderQueue;
    this.queueHint = renderQueue.hint;
    var viewport = this._viewport = renderQueue.viewport;
    if (viewport) {
      this._scissor = new Rect(viewport.left, viewport.top, viewport.width, viewport.height);
    }
    this.queueId = id;
    this._devicePass = devicePass;
    this._phaseID = cclegacy.rendering.getPhaseID(devicePass.passID, context$1.renderGraph.getLayout(id));
  };
  _proto6.createBlitDesc = function createBlitDesc(blit) {
    if (!this._blitDesc) {
      this._blitDesc = new BlitDesc(blit);
    }
    this._blitDesc.createScreenQuad();
    this._blitDesc.createStageDescriptor();
  };
  _proto6.setScene = function setScene(sceneID, scene, blit) {
    var deviceScene = context$1.pools.addDeviceScene();
    deviceScene.init(this, sceneID, scene, blit);
    this._renderScenes.push(deviceScene);
    return deviceScene;
  };
  _proto6.reset = function reset() {
    var _this$_blitDesc;
    this._renderScenes.length = 0;
    this._isUpdateUBO = false;
    this._isUploadInstance = false;
    this._isUploadBatched = false;
    (_this$_blitDesc = this._blitDesc) == null ? void 0 : _this$_blitDesc.reset();
  };
  _proto6.preRecord = function preRecord() {};
  _proto6.record = function record() {
    if (this._descSetData && this._descSetData.descriptorSet) {
      context$1.commandBuffer.bindDescriptorSet(SetIndex.COUNT, this._descSetData.descriptorSet);
    }
    this._renderScenes.forEach(function (scene) {
      scene.record();
    });
  };
  _proto6.postRecord = function postRecord() {};
  return _createClass(DeviceRenderQueue, [{
    key: "phaseID",
    get: function get() {
      return this._phaseID;
    }
  }, {
    key: "layoutID",
    get: function get() {
      return this._layoutID;
    },
    set: function set(value) {
      this._layoutID = value;
      var layoutGraph = context$1.layoutGraph;
      this._renderPhase = layoutGraph.h(LayoutGraphDataValue.RenderPhase, value) ? layoutGraph.j(value) : null;
      var layout = layoutGraph.getLayout(value);
      this._descSetData = layout.getSet(UpdateFrequency.PER_PHASE);
    }
  }, {
    key: "descSetData",
    get: function get() {
      return this._descSetData;
    }
  }, {
    key: "renderPhase",
    get: function get() {
      return this._renderPhase;
    }
  }, {
    key: "viewport",
    get: function get() {
      return this._viewport;
    }
  }, {
    key: "scissor",
    get: function get() {
      return this._scissor;
    }
  }, {
    key: "queueId",
    get: function get() {
      return this._queueId;
    },
    set: function set(val) {
      this._queueId = val;
    }
  }, {
    key: "isUpdateUBO",
    get: function get() {
      return this._isUpdateUBO;
    },
    set: function set(update) {
      this._isUpdateUBO = update;
    }
  }, {
    key: "isUploadInstance",
    get: function get() {
      return this._isUploadInstance;
    },
    set: function set(value) {
      this._isUploadInstance = value;
    }
  }, {
    key: "isUploadBatched",
    get: function get() {
      return this._isUploadBatched;
    },
    set: function set(value) {
      this._isUploadBatched = value;
    }
  }, {
    key: "graphQueue",
    get: function get() {
      return this._graphQueue;
    }
  }, {
    key: "blitDesc",
    get: function get() {
      return this._blitDesc;
    }
  }, {
    key: "renderScenes",
    get: function get() {
      return this._renderScenes;
    }
  }, {
    key: "queueHint",
    get: function get() {
      return this._hint;
    },
    set: function set(value) {
      this._hint = value;
    }
  }, {
    key: "devicePass",
    get: function get() {
      return this._devicePass;
    }
  }]);
}();
var RenderPassLayoutInfo = function () {
  function RenderPassLayoutInfo(layoutId, vertId, input) {
    this._layoutID = 0;
    this._vertID = -1;
    this._resID = -1;
    this._stage = null;
    this._layout = void 0;
    this._inputName = void 0;
    this._descriptorSet = null;
    this._inputName = input[0];
    this._layoutID = layoutId;
    this._vertID = vertId;
    var lg = context$1.layoutGraph;
    this._stage = lg.j(layoutId);
    this._layout = lg.getLayout(layoutId);
    var layoutData = this._layout.getSet(UpdateFrequency.PER_PASS);
    if (!layoutData) {
      return;
    }
    var layoutDesc = layoutData.descriptorSet;
    var deviceTex = context$1.deviceTextures.get(this._inputName);
    var gfxTex = deviceTex == null ? void 0 : deviceTex.texture;
    var deviceBuf = context$1.deviceBuffers.get(this._inputName);
    var gfxBuf = deviceBuf == null ? void 0 : deviceBuf.buffer;
    if (!gfxTex && !gfxBuf) {
      throw Error("Could not find texture with resource name " + this._inputName);
    }
    this._resID = context$1.resourceGraph.vertex(this._inputName);
    var samplerInfo = context$1.resourceGraph.getSampler(this._resID);
    for (var _iterator3 = _createForOfIteratorHelperLoose(input[1]), _step3; !(_step3 = _iterator3()).done;) {
      var descriptor = _step3.value;
      var descriptorName = descriptor.name;
      var descriptorID = lg.attributeIndex.get(descriptorName);
      if (descriptorID === undefined) {
        continue;
      }
      this.bindDescriptor(layoutDesc, descriptorID, gfxTex, gfxBuf, samplerInfo, input[1][0].accessType);
    }
  }
  var _proto7 = RenderPassLayoutInfo.prototype;
  _proto7.bindDescriptor = function bindDescriptor(layoutDesc, descriptorID, gfxTex, gfxBuf, samplerInfo, accessType) {
    var layoutData = this._layout.getSet(UpdateFrequency.PER_PASS);
    var desc = context$1.resourceGraph.getDesc(this._resID);
    for (var _iterator4 = _createForOfIteratorHelperLoose(layoutData.descriptorSetLayoutData.descriptorBlocks), _step4; !(_step4 = _iterator4()).done;) {
      var block = _step4.value;
      for (var i = 0; i < block.descriptors.length; ++i) {
        if (descriptorID === block.descriptors[i].descriptorID) {
          var offset = block.offset;
          if (gfxTex) {
            layoutDesc.bindTexture(offset + i, gfxTex);
            var renderData = context$1.renderGraph.getData(this._vertID);
            var sampler = renderData.samplers.get(descriptorID) || context$1.device.getSampler(samplerInfo);
            layoutDesc.bindSampler(offset + i, sampler);
          } else if (desc.flags & ResourceFlags.STORAGE) {
            var access = accessType !== AccessType.READ ? AccessFlagBit.COMPUTE_SHADER_WRITE : AccessFlagBit.COMPUTE_SHADER_READ_OTHER;
            layoutDesc.bindBuffer(block.offset + i, gfxBuf, 0, access);
          } else {
            layoutDesc.bindBuffer(offset + i, gfxBuf);
          }
          if (!this._descriptorSet) {
            this._descriptorSet = layoutDesc;
          }
          break;
        }
      }
    }
  };
  return _createClass(RenderPassLayoutInfo, [{
    key: "descriptorSet",
    get: function get() {
      return this._descriptorSet;
    }
  }, {
    key: "layoutID",
    get: function get() {
      return this._layoutID;
    }
  }, {
    key: "vertID",
    get: function get() {
      return this._vertID;
    }
  }, {
    key: "stage",
    get: function get() {
      return this._stage;
    }
  }, {
    key: "layout",
    get: function get() {
      return this._layout;
    }
  }]);
}();
var profilerViewport = new Viewport();
var renderPassArea = new Rect();
var resourceVisitor = new ResourceVisitor$1();
new TextureBlit();
var DeviceRenderPass = function () {
  function DeviceRenderPass(rasterID, rasterPass) {
    this._renderPass = void 0;
    this._framebuffer = void 0;
    this._clearColor = [];
    this._deviceQueues = new Map();
    this._resolveTextures = new Map();
    this._clearDepth = 1;
    this._clearStencil = 0;
    this._passID = void 0;
    this._rasterID = void 0;
    this._rasterPass = void 0;
    this._layoutName = void 0;
    this._viewport = null;
    this._layout = null;
    this._idxOfRenderData = 0;
    this._rasterID = rasterID;
    this._rasterPass = rasterPass;
    var device = context$1.device;
    this._layoutName = context$1.renderGraph.getLayout(rasterID);
    this._passID = cclegacy.rendering.getPassID(this._layoutName);
    var depAtt = new DepthStencilAttachment();
    depAtt.format = Format.DEPTH_STENCIL;
    var colors = [];
    var colorTexs = [];
    var depthTex = null;
    var swapchain = null;
    var framebuffer = null;
    for (var _iterator5 = _createForOfIteratorHelperLoose(rasterPass.rasterViews), _step5; !(_step5 = _iterator5()).done;) {
      var _step5$value = _step5.value,
        resName = _step5$value[0],
        rasterV = _step5$value[1];
      var resTex = this._getOrCreateDeviceTex(resName);
      if (!swapchain) swapchain = resTex.swapchain;
      if (!framebuffer) framebuffer = resTex.framebuffer;
      var isLoadAttachment = rasterV.loadOp === LoadOp.LOAD;
      if (rasterV.attachmentType === AttachmentType.RENDER_TARGET) {
        if (!resTex.swapchain && !resTex.framebuffer) colorTexs.push(resTex.texture);
        var colAtt = new ColorAttachment();
        colAtt.format = resTex.description.format;
        colAtt.sampleCount = resTex.description.sampleCount;
        colAtt.loadOp = rasterV.loadOp;
        colAtt.storeOp = rasterV.storeOp;
        colAtt.barrier = device.getGeneralBarrier(new GeneralBarrierInfo(isLoadAttachment ? AccessFlagBit.COLOR_ATTACHMENT_WRITE : AccessFlagBit.NONE, rasterV.storeOp === StoreOp.STORE ? AccessFlagBit.COLOR_ATTACHMENT_WRITE : AccessFlagBit.NONE));
        var currCol = new Color();
        currCol.copy(rasterV.clearColor);
        this._clearColor.push(currCol);
        colors.push(colAtt);
      } else if (rasterV.attachmentType === AttachmentType.DEPTH_STENCIL) {
        depAtt.depthStoreOp = rasterV.storeOp;
        depAtt.stencilStoreOp = rasterV.storeOp;
        depAtt.depthLoadOp = rasterV.loadOp;
        depAtt.sampleCount = resTex.description.sampleCount;
        depAtt.stencilLoadOp = rasterV.loadOp;
        depAtt.barrier = device.getGeneralBarrier(new GeneralBarrierInfo(isLoadAttachment ? AccessFlagBit.DEPTH_STENCIL_ATTACHMENT_WRITE : AccessFlagBit.NONE, rasterV.storeOp === StoreOp.STORE ? AccessFlagBit.DEPTH_STENCIL_ATTACHMENT_WRITE : AccessFlagBit.NONE));
        if (!resTex.swapchain && !resTex.framebuffer) {
          depthTex = resTex.texture;
        } else if (resTex.swapchain) {
          depthTex = resTex.swapchain.depthStencilTexture;
        }
        this._clearDepth = rasterV.clearColor.x;
        this._clearStencil = rasterV.clearColor.y;
      }
      this._applyResolve(resName, resTex.texture);
    }
    if (colors.length === 0) {
      var colorAttachment = new ColorAttachment();
      colors.push(colorAttachment);
    }
    if (colorTexs.length === 0 && !swapchain && !framebuffer) {
      var currTex = device.createTexture(new TextureInfo());
      colorTexs.push(currTex);
    }
    var renderPassInfo = new RenderPassInfo();
    renderPassInfo.colorAttachments = colors;
    var depth = swapchain ? swapchain.depthStencilTexture : depthTex;
    if (depth) {
      renderPassInfo.depthStencilAttachment = depAtt;
    }
    this._renderPass = device.createRenderPass(renderPassInfo);
    this._createFramebuffer(framebuffer, swapchain ? [swapchain.colorTexture] : colorTexs, swapchain ? swapchain.depthStencilTexture : depthTex);
  }
  var _proto8 = DeviceRenderPass.prototype;
  _proto8._traversalResolves = function _traversalResolves(callback) {
    var subpassGraph = this._rasterPass.subpassGraph;
    var subpasses = subpassGraph._subpasses;
    for (var _iterator6 = _createForOfIteratorHelperLoose(subpasses), _step6; !(_step6 = _iterator6()).done;) {
      var subpass = _step6.value;
      var resolvePairs = subpass.resolvePairs;
      for (var _iterator7 = _createForOfIteratorHelperLoose(resolvePairs), _step7; !(_step7 = _iterator7()).done;) {
        var resolve = _step7.value;
        callback(resolve);
      }
    }
  };
  _proto8._getOrCreateDeviceTex = function _getOrCreateDeviceTex(resName) {
    var resTex = context$1.deviceTextures.get(resName);
    if (!resTex) {
      this.visitResource(resName);
      resTex = context$1.deviceTextures.get(resName);
    } else {
      var resGraph = context$1.resourceGraph;
      var resId = resGraph.vertex(resName);
      var resFbo = resGraph.object(resId);
      if (resTex.framebuffer && resFbo instanceof Framebuffer && resTex.framebuffer !== resFbo) {
        resTex.framebuffer = resFbo;
      } else if (resTex.texture) {
        var desc = resGraph.getDesc(resId);
        if (resTex.texture.width !== desc.width || resTex.texture.height !== desc.height) {
          resTex.texture.resize(desc.width, desc.height);
        }
      }
    }
    return resTex;
  };
  _proto8._applyResolve = function _applyResolve(srcName, srcTex) {
    var _this4 = this;
    if (!srcTex) {
      return;
    }
    var resolvedTexes = this._resolveTextures;
    this._traversalResolves(function (resolvePair) {
      var resolvedTex = _this4._getOrCreateDeviceTex(resolvePair.target);
      resolvedTexes.set(resolvePair.source, resolvedTex);
    });
    var currResolved = resolvedTexes.get(srcName);
    if (currResolved) {
      var gpuTex = srcTex.gpuTexture;
      gpuTex.resolveTex = currResolved.getGPUTexture().gpuTexture;
    }
  };
  _proto8.addIdxOfRD = function addIdxOfRD() {
    this._idxOfRenderData++;
  };
  _proto8.visitResource = function visitResource(resName) {
    var resourceGraph = context$1.resourceGraph;
    var vertId = resourceGraph.vertex(resName);
    resourceVisitor.resName = resName;
    resourceGraph.visitVertex(resourceVisitor, vertId);
  };
  _proto8.addQueue = function addQueue(queue) {
    this._deviceQueues.set(queue.queueId, queue);
  };
  _proto8.preRecord = function preRecord() {
    context$1.passDescriptorSet = getDescriptorSetDataFromLayout(this.layoutName).descriptorSet;
  };
  _proto8._applyRenderLayout = function _applyRenderLayout(input) {
    var stageName = context$1.renderGraph.getLayout(this._rasterID);
    if (stageName) {
      var layoutGraph = context$1.layoutGraph;
      var stageId = layoutGraph.locateChild(layoutGraph.N, stageName);
      if (stageId !== 0xFFFFFFFF) {
        this._layout = new RenderPassLayoutInfo(stageId, this._rasterID, input);
      }
    }
  };
  _proto8.getGlobalDescData = function getGlobalDescData() {
    var stageId = context$1.layoutGraph.locateChild(context$1.layoutGraph.N, 'default');
    var layout = context$1.layoutGraph.getLayout(stageId);
    var layoutData = layout.getSet(UpdateFrequency.PER_PASS);
    return layoutData;
  };
  _proto8._applyViewport = function _applyViewport(frameTex) {
    this._viewport = null;
    var viewport = this._rasterPass.viewport;
    if (viewport.left !== 0 || viewport.top !== 0 || viewport.width !== 0 || viewport.height !== 0) {
      this._viewport = viewport;
    }
  };
  _proto8.bindGlobalDesc = function bindGlobalDesc() {
    var cmdBuff = context$1.commandBuffer;
    if (context$1.passDescriptorSet) {
      cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, context$1.passDescriptorSet);
    }
  };
  _proto8.beginPass = function beginPass() {
    if (!this.passMergeInfo.needBeginRP) {
      this.bindGlobalDesc();
      return;
    }
    var cmdBuff = context$1.commandBuffer;
    var tex = this.framebuffer.colorTextures[0];
    this._applyViewport(tex);
    if (this._viewport) {
      renderPassArea.x = this._viewport.left;
      renderPassArea.y = this._viewport.top;
      renderPassArea.width = this._viewport.width;
      renderPassArea.height = this._viewport.height;
    } else {
      renderPassArea.y = renderPassArea.x = 0;
      renderPassArea.width = tex.width;
      renderPassArea.height = tex.height;
    }
    cmdBuff.beginRenderPass(this.renderPass, this.framebuffer, renderPassArea, this.clearColor, this.clearDepth, this.clearStencil);
    this.bindGlobalDesc();
  };
  _proto8.endPass = function endPass() {
    if (!this.passMergeInfo.needEndRP) return;
    var cmdBuff = context$1.commandBuffer;
    cmdBuff.endRenderPass();
  };
  _proto8.record = function record() {
    this.beginPass();
    for (var _iterator8 = _createForOfIteratorHelperLoose(this._deviceQueues.values()), _step8; !(_step8 = _iterator8()).done;) {
      var queue = _step8.value;
      queue.record();
    }
    this.endPass();
  };
  _proto8.postRecord = function postRecord() {};
  _proto8._processRenderLayout = function _processRenderLayout(pass) {
    for (var _iterator9 = _createForOfIteratorHelperLoose(pass.computeViews), _step9; !(_step9 = _iterator9()).done;) {
      var cv = _step9.value;
      this._applyRenderLayout(cv);
    }
    if (this.renderLayout && this.renderLayout.descriptorSet) {
      this.renderLayout.descriptorSet.update();
    }
  };
  _proto8.processRenderLayout = function processRenderLayout() {
    this._processRenderLayout(this._rasterPass);
  };
  _proto8._createFramebuffer = function _createFramebuffer(fbo, cols, depthTex) {
    if (!fbo && !cols.length) return;
    if (this._framebuffer && fbo !== this._framebuffer) this._framebuffer.destroy();
    this._framebuffer = fbo || context$1.device.createFramebuffer(new FramebufferInfo(this._renderPass, cols, depthTex));
  };
  _proto8.resetResource = function resetResource(id, pass) {
    var _currFramebuffer$dept, _currFramebuffer$widt, _currFramebuffer$heig, _currFramebuffer$need;
    this._rasterID = id;
    this._rasterPass = pass;
    this._layoutName = context$1.renderGraph.getLayout(id);
    this._passID = cclegacy.rendering.getPassID(this._layoutName);
    this._deviceQueues.clear();
    this._idxOfRenderData = 0;
    var framebuffer = null;
    var colTextures = [];
    var currFramebuffer = this._framebuffer;
    var currFBDepthTex = (_currFramebuffer$dept = currFramebuffer == null ? void 0 : currFramebuffer.depthStencilTexture) !== null && _currFramebuffer$dept !== void 0 ? _currFramebuffer$dept : null;
    var depTexture = currFramebuffer ? currFBDepthTex : null;
    var currentWidth = (_currFramebuffer$widt = currFramebuffer == null ? void 0 : currFramebuffer.width) !== null && _currFramebuffer$widt !== void 0 ? _currFramebuffer$widt : 0;
    var currentHeight = (_currFramebuffer$heig = currFramebuffer == null ? void 0 : currFramebuffer.height) !== null && _currFramebuffer$heig !== void 0 ? _currFramebuffer$heig : 0;
    var width = 0,
      height = 0;
    for (var _iterator0 = _createForOfIteratorHelperLoose(pass.rasterViews), _step0; !(_step0 = _iterator0()).done;) {
      var _step0$value = _step0.value,
        resName = _step0$value[0],
        rasterV = _step0$value[1];
      if (rasterV.attachmentType !== AttachmentType.SHADING_RATE) {
        var resDesc = context$1.resourceGraph.getDesc(context$1.resourceGraph.vertex(resName));
        width = resDesc.width;
        height = resDesc.height;
        break;
      }
    }
    var isInsideTexDestroy = (currFramebuffer == null ? void 0 : currFramebuffer.colorTextures.some(function (colTex) {
      return !colTex || colTex.getTextureHandle() === 0;
    })) || currFBDepthTex && currFBDepthTex.getTextureHandle() === 0;
    var needRebuild = width !== currentWidth || height !== currentHeight || ((_currFramebuffer$need = currFramebuffer == null ? void 0 : currFramebuffer.needRebuild) !== null && _currFramebuffer$need !== void 0 ? _currFramebuffer$need : false) || isInsideTexDestroy;
    for (var _iterator1 = _createForOfIteratorHelperLoose(pass.rasterViews), _step1; !(_step1 = _iterator1()).done;) {
      var _step1$value = _step1.value,
        _resName = _step1$value[0],
        _rasterV = _step1$value[1];
      var deviceTex = context$1.deviceTextures.get(_resName);
      if (!deviceTex) {
        this.visitResource(_resName);
        deviceTex = context$1.deviceTextures.get(_resName);
      }
      var resGraph = context$1.resourceGraph;
      var resId = resGraph.vertex(_resName);
      var resFbo = resGraph.object(resId);
      var _resDesc = resGraph.getDesc(resId);
      if (deviceTex.framebuffer && resFbo instanceof Framebuffer && (deviceTex.framebuffer !== resFbo || resFbo !== this._framebuffer)) {
        framebuffer = this._framebuffer = deviceTex.framebuffer = resFbo;
      } else if (deviceTex.texture && needRebuild) {
        var gfxTex = deviceTex.texture;
        gfxTex.resize(_resDesc.width, _resDesc.height);
        if (_rasterV.attachmentType === AttachmentType.RENDER_TARGET) {
          colTextures.push(gfxTex);
        } else if (_rasterV.attachmentType === AttachmentType.DEPTH_STENCIL) {
          depTexture = gfxTex;
        }
      }
      this._applyResolve(_resName, deviceTex.texture);
    }
    this._createFramebuffer(framebuffer, colTextures, depTexture);
  };
  return _createClass(DeviceRenderPass, [{
    key: "passMergeInfo",
    get: function get() {
      return rpMergeInfos.get(this._rasterPass);
    }
  }, {
    key: "indexOfRD",
    get: function get() {
      return this._idxOfRenderData;
    }
  }, {
    key: "rasterID",
    get: function get() {
      return this._rasterID;
    }
  }, {
    key: "layoutName",
    get: function get() {
      return this._layoutName;
    }
  }, {
    key: "passID",
    get: function get() {
      return this._passID;
    }
  }, {
    key: "renderLayout",
    get: function get() {
      return this._layout;
    }
  }, {
    key: "renderPass",
    get: function get() {
      return this._renderPass;
    }
  }, {
    key: "framebuffer",
    get: function get() {
      return this._framebuffer;
    }
  }, {
    key: "clearColor",
    get: function get() {
      return this._clearColor;
    }
  }, {
    key: "clearDepth",
    get: function get() {
      return this._clearDepth;
    }
  }, {
    key: "clearStencil",
    get: function get() {
      return this._clearStencil;
    }
  }, {
    key: "deviceQueues",
    get: function get() {
      return this._deviceQueues;
    }
  }, {
    key: "viewport",
    get: function get() {
      return this._viewport;
    }
  }]);
}();
var ComputePassInfo = function () {
  function ComputePassInfo() {
    this._id = void 0;
    this._pass = void 0;
  }
  var _proto9 = ComputePassInfo.prototype;
  _proto9.applyInfo = function applyInfo(id, pass) {
    this._id = id;
    this._pass = pass;
  };
  return _createClass(ComputePassInfo, [{
    key: "id",
    get: function get() {
      return this._id;
    }
  }, {
    key: "pass",
    get: function get() {
      return this._pass;
    }
  }]);
}();
var DeviceComputePass = function () {
  function DeviceComputePass(passInfo) {
    this._deviceQueues = [];
    this._passID = void 0;
    this._layoutName = void 0;
    this._viewport = null;
    this._computeInfo = void 0;
    this._layout = null;
    this._computeInfo = passInfo;
    this._layoutName = context$1.renderGraph.getLayout(passInfo.id);
    this._passID = cclegacy.rendering.getPassID(this._layoutName);
    for (var _iterator10 = _createForOfIteratorHelperLoose(passInfo.pass.computeViews), _step10; !(_step10 = _iterator10()).done;) {
      var cv = _step10.value;
      var resTex = context$1.deviceTextures.get(cv[0]);
      if (!resTex) {
        this.visitResource(cv[0]);
        resTex = context$1.deviceTextures.get(cv[0]);
      }
      this._applyRenderLayout(cv);
    }
    if (this.renderLayout && this.renderLayout.descriptorSet) {
      this.renderLayout.descriptorSet.update();
    }
  }
  var _proto0 = DeviceComputePass.prototype;
  _proto0.preRecord = function preRecord() {
    context$1.passDescriptorSet = getDescriptorSetDataFromLayout(this.layoutName).descriptorSet;
  };
  _proto0.postRecord = function postRecord() {};
  _proto0.visitResource = function visitResource(resName) {
    var resourceGraph = context$1.resourceGraph;
    var vertId = resourceGraph.vertex(resName);
    resourceVisitor.resName = resName;
    resourceGraph.visitVertex(resourceVisitor, vertId);
  };
  _proto0.addQueue = function addQueue(queue) {
    this._deviceQueues.push(queue);
  };
  _proto0._applyRenderLayout = function _applyRenderLayout(input) {
    var stageName = context$1.renderGraph.getLayout(this._computeInfo.id);
    if (stageName) {
      var layoutGraph = context$1.layoutGraph;
      var stageId = layoutGraph.locateChild(layoutGraph.N, stageName);
      if (stageId !== 0xFFFFFFFF) {
        this._layout = new RenderPassLayoutInfo(stageId, this._computeInfo.id, input);
      }
    }
  };
  _proto0.getGlobalDescData = function getGlobalDescData() {
    var stageId = context$1.layoutGraph.locateChild(context$1.layoutGraph.N, 'default');
    var layout = context$1.layoutGraph.getLayout(stageId);
    var layoutData = layout.getSet(UpdateFrequency.PER_PASS);
    return layoutData;
  };
  _proto0.record = function record() {
    var cmdBuff = context$1.commandBuffer;
    if (context$1.passDescriptorSet) {
      cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, context$1.passDescriptorSet);
    }
    for (var _iterator11 = _createForOfIteratorHelperLoose(this._deviceQueues), _step11; !(_step11 = _iterator11()).done;) {
      var queue = _step11.value;
      queue.record();
    }
    var renderData = context$1.renderGraph.getData(this._computeInfo.id);
    updateGlobalDescBinding(renderData, -1, 0, context$1.renderGraph.getLayout(this._computeInfo.id));
  };
  _proto0.resetResource = function resetResource(id, pass) {
    this._computeInfo.applyInfo(id, pass);
    this._layoutName = context$1.renderGraph.getLayout(id);
    this._passID = cclegacy.rendering.getPassID(this._layoutName);
    this._deviceQueues.length = 0;
    for (var _iterator12 = _createForOfIteratorHelperLoose(this._computeInfo.pass.computeViews), _step12; !(_step12 = _iterator12()).done;) {
      var cv = _step12.value;
      this._applyRenderLayout(cv);
    }
    if (this.renderLayout && this.renderLayout.descriptorSet) {
      this.renderLayout.descriptorSet.update();
    }
  };
  return _createClass(DeviceComputePass, [{
    key: "layoutName",
    get: function get() {
      return this._layoutName;
    }
  }, {
    key: "passID",
    get: function get() {
      return this._passID;
    }
  }, {
    key: "renderLayout",
    get: function get() {
      return this._layout;
    }
  }, {
    key: "deviceQueues",
    get: function get() {
      return this._deviceQueues;
    }
  }, {
    key: "computePassInfo",
    get: function get() {
      return this._computeInfo;
    }
  }]);
}();
var sceneViewport = new Viewport();
var DeviceRenderScene = function () {
  function DeviceRenderScene() {
    this._currentQueue = void 0;
    this._renderPass = void 0;
    this._scene = null;
    this._camera = null;
    this._sceneData = void 0;
    this._blit = void 0;
    this._sceneID = -1;
  }
  var _proto1 = DeviceRenderScene.prototype;
  _proto1.preRecord = function preRecord() {
    if (this._blit && this._blit.blitType === BlitType.FULLSCREEN_QUAD) {
      this._currentQueue.createBlitDesc(this._blit);
      this._currentQueue.blitDesc.update();
    }
  };
  _proto1.postRecord = function postRecord() {};
  _proto1.init = function init(queue, sceneID, scene, blit) {
    this._currentQueue = queue;
    this._sceneData = scene;
    this._blit = blit;
    this._sceneID = sceneID;
    this._renderPass = queue.devicePass.renderPass;
    var camera = scene && scene.camera ? scene.camera : blit && blit.camera ? blit.camera : null;
    if (camera) {
      this._scene = camera.scene;
      this._camera = camera;
    }
  };
  _proto1._record3D = function _record3D() {
    var blit = this._blit;
    var device = context$1.device;
    var cmdBuff = context$1.commandBuffer;
    for (var _iterator13 = _createForOfIteratorHelperLoose(blit.models), _step13; !(_step13 = _iterator13()).done;) {
      var model = _step13.value;
      for (var _iterator14 = _createForOfIteratorHelperLoose(model.subModels), _step14; !(_step14 = _iterator14()).done;) {
        var subModel = _step14.value;
        var inputAssembler = subModel.inputAssembler;
        var passCount = subModel.passes.length;
        for (var passId = 0; passId < passCount; ++passId) {
          var pass = subModel.passes[passId];
          var shader = subModel.shaders[passId];
          var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, this._renderPass, inputAssembler);
          cmdBuff.bindPipelineState(pso);
          cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
          cmdBuff.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet);
          cmdBuff.bindInputAssembler(inputAssembler);
          cmdBuff.draw(inputAssembler);
        }
      }
    }
  };
  _proto1._recordUI = function _recordUI() {
    var batches = this.camera.scene.batches;
    for (var i = 0; i < batches.length; i++) {
      var batch = batches[i];
      var visible = false;
      if (this.camera.visibility & batch.visFlags) {
        visible = true;
      }
      if (!visible) continue;
      var count = batch.shaders.length;
      for (var j = 0; j < count; j++) {
        var pass = batch.passes[j];
        if (pass.phaseID !== this._currentQueue.phaseID) continue;
        var shader = batch.shaders[j];
        var ia = batch.inputAssembler;
        var ds = batch.descriptorSet;
        recordCommand(context$1.commandBuffer, this._renderPass, pass, ds, shader, ia);
      }
    }
  };
  _proto1._showProfiler = function _showProfiler() {
    var rect = renderPassArea;
    var profiler = context$1.pipeline.profiler;
    if (!profiler || !profiler.enabled || !context$1.passShowStatistics) {
      return;
    }
    var profilerDesc = context$1.profilerDescriptorSet;
    var renderPass = this._renderPass;
    var cmdBuff = context$1.commandBuffer;
    var submodel = profiler.subModels[0];
    var pass = submodel.passes[0];
    var ia = submodel.inputAssembler;
    profilerViewport.width = rect.width;
    profilerViewport.height = rect.height;
    cmdBuff.setViewport(profilerViewport);
    cmdBuff.setScissor(rect);
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, profilerDesc);
    recordCommand(cmdBuff, renderPass, pass, submodel.descriptorSet, submodel.shaders[0], ia);
  };
  _proto1._recordBlit = function _recordBlit() {
    if (!this.blit) {
      return;
    }
    var blit = this.blit;
    var currMat = blit.material;
    var pass = currMat.passes[blit.passID];
    pass.update();
    var shader = pass.getShaderVariant();
    var blitDesc = this._currentQueue.blitDesc;
    var screenIa = blitDesc.screenQuad.quadIA;
    recordCommand(context$1.commandBuffer, this._renderPass, pass, blitDesc.stageDesc, shader, screenIa);
  };
  _proto1._updateGlobal = function _updateGlobal(data, sceneId) {
    var devicePass = this._currentQueue.devicePass;
    devicePass.addIdxOfRD();
    updateGlobalDescBinding(data, sceneId, devicePass.indexOfRD, context$1.renderGraph.getLayout(devicePass.rasterID));
  };
  _proto1._updateRenderData = function _updateRenderData() {
    var _context$passDescript;
    if (this._currentQueue.isUpdateUBO) return;
    var devicePass = this._currentQueue.devicePass;
    var rasterId = devicePass.rasterID;
    var passRenderData = context$1.renderGraph.getData(rasterId);
    var sceneId = this.sceneID;
    this._updateGlobal(context$1.renderGraph.globalRenderData, sceneId);
    this._updateGlobal(passRenderData, sceneId);
    var queueId = this._currentQueue.queueId;
    var queueRenderData = context$1.renderGraph.getData(queueId);
    this._updateGlobal(queueRenderData, sceneId);
    var sceneRenderData = context$1.renderGraph.getData(sceneId);
    if (sceneRenderData) this._updateGlobal(sceneRenderData, sceneId);
    devicePass.processRenderLayout();
    (_context$passDescript = context$1.passDescriptorSet) == null ? void 0 : _context$passDescript.update();
    this._currentQueue.isUpdateUBO = true;
  };
  _proto1._applyViewport = function _applyViewport() {
    var queueViewport = this._currentQueue.viewport;
    if (queueViewport) {
      context$1.commandBuffer.setViewport(queueViewport);
      context$1.commandBuffer.setScissor(this._currentQueue.scissor);
    } else if (!this._currentQueue.devicePass.viewport) {
      var texture = this._currentQueue.devicePass.framebuffer.colorTextures[0];
      var lightInfo = this.sceneData ? this.sceneData.light : null;
      var area = isShadowMap(this.sceneData) && this.sceneData && lightInfo.light ? getRenderArea(this.camera, texture.width, texture.height, lightInfo.light, lightInfo.level) : getRenderArea(this.camera, texture.width, texture.height);
      sceneViewport.left = area.x;
      sceneViewport.top = area.y;
      sceneViewport.width = area.width;
      sceneViewport.height = area.height;
      context$1.commandBuffer.setViewport(sceneViewport);
      context$1.commandBuffer.setScissor(area);
    }
  };
  _proto1.record = function record() {
    var devicePass = this._currentQueue.devicePass;
    var sceneCulling = context$1.culling;
    this._updateRenderData();
    this._applyViewport();
    if (this.blit) {
      switch (this.blit.blitType) {
        case BlitType.FULLSCREEN_QUAD:
          this._recordBlit();
          break;
        case BlitType.DRAW_2D:
          this._recordUI();
          break;
        case BlitType.DRAW_PROFILE:
          this._showProfiler();
          break;
        case BlitType.DRAW_3D:
          this._record3D();
          break;
      }
      return;
    }
    var rqQuery = sceneCulling.renderQueueQueryIndex.get(this.sceneID);
    var rq = sceneCulling.renderQueues[rqQuery.renderQueueTarget];
    var graphSceneData = this.sceneData;
    var isProbe = bool(graphSceneData.flags & SceneFlags.REFLECTION_PROBE);
    if (isProbe) rq.probeQueue.applyMacro();
    rq.recordCommands(context$1.commandBuffer, this._renderPass, graphSceneData.flags);
    if (isProbe) rq.probeQueue.removeMacro();
    if (graphSceneData.flags & SceneFlags.GEOMETRY) {
      var _geometryRenderer;
      (_geometryRenderer = this.camera.geometryRenderer) == null ? void 0 : _geometryRenderer.render(devicePass.renderPass, context$1.commandBuffer, context$1.pipeline.pipelineSceneData);
    }
  };
  return _createClass(DeviceRenderScene, [{
    key: "blit",
    get: function get() {
      return this._blit;
    }
  }, {
    key: "sceneData",
    get: function get() {
      return this._sceneData;
    }
  }, {
    key: "sceneID",
    get: function get() {
      return this._sceneID;
    }
  }, {
    key: "camera",
    get: function get() {
      return this._camera;
    }
  }]);
}();
var ExecutorPools = function () {
  function ExecutorPools() {
    this.deviceQueuePool = void 0;
    this.computeQueuePool = void 0;
    this.passPool = void 0;
    this.deviceScenePool = void 0;
    this.deviceQueuePool = new RecyclePool(function () {
      return new DeviceRenderQueue();
    }, 16);
    this.deviceScenePool = new RecyclePool(function () {
      return new DeviceRenderScene();
    }, 16);
    this.computeQueuePool = new RecyclePool(function () {
      return new DeviceComputeQueue();
    }, 16);
    this.passPool = new RecyclePool(function () {
      return {
        priority: 0,
        hash: 0,
        depth: 0,
        shaderId: 0,
        subModel: null,
        passIdx: 0
      };
    }, 64);
  }
  var _proto10 = ExecutorPools.prototype;
  _proto10.addDeviceQueue = function addDeviceQueue() {
    return this.deviceQueuePool.add();
  };
  _proto10.addComputeQueue = function addComputeQueue() {
    return this.computeQueuePool.add();
  };
  _proto10.addDeviceScene = function addDeviceScene() {
    return this.deviceScenePool.add();
  };
  _proto10.reset = function reset() {
    this.deviceQueuePool.reset();
    this.computeQueuePool.reset();
    this.deviceScenePool.reset();
  };
  return ExecutorPools;
}();
var quadRect = new Rect();
var volLightAttrCount = 5;
var BlitInfo = function () {
  function BlitInfo(context) {
    this._pipelineIAData = void 0;
    this._context = void 0;
    this._width = void 0;
    this._height = void 0;
    this._lightVolumeBuffer = void 0;
    this._lightBufferData = void 0;
    this._deferredLitsBufView = void 0;
    this._localUBO = void 0;
    this._stageDescs = new Map();
    this._context = context;
    this._width = context.width;
    this._height = context.height;
    this._pipelineIAData = this._createQuadInputAssembler();
    var vb = this._genQuadVertexData(SurfaceTransform.IDENTITY, new Rect(0, 0, context.width, context.height));
    this._pipelineIAData.quadVB.update(vb);
    this._createLightVolumes();
    var size = UBOLocalEnum.SIZE;
    this._localUBO = context.device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, size, size));
  }
  var _proto11 = BlitInfo.prototype;
  _proto11.resize = function resize(width, height) {
    if (width !== this._width || height !== this._height) {
      quadRect.y = quadRect.x = 0;
      quadRect.width = width;
      quadRect.height = height;
      var vb = this._genQuadVertexData(SurfaceTransform.IDENTITY, quadRect);
      this._pipelineIAData.quadVB.update(vb);
    }
  };
  _proto11._createLightVolumes = function _createLightVolumes() {
    var device = this._context.root.device;
    var totalSize = Float32Array.BYTES_PER_ELEMENT * volLightAttrCount * 4 * UBODeferredLight.LIGHTS_PER_PASS;
    totalSize = Math.ceil(totalSize / device.capabilities.uboOffsetAlignment) * device.capabilities.uboOffsetAlignment;
    this._lightVolumeBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, totalSize, device.capabilities.uboOffsetAlignment));
    this._deferredLitsBufView = device.createBuffer(new BufferViewInfo(this._lightVolumeBuffer, 0, totalSize));
    this._lightBufferData = new Float32Array(totalSize / Float32Array.BYTES_PER_ELEMENT);
  };
  _proto11._genQuadVertexData = function _genQuadVertexData(surfaceTransform, renderArea) {
    var minX = renderArea.x / this._context.width;
    var maxX = (renderArea.x + renderArea.width) / this._context.width;
    var minY = renderArea.y / this._context.height;
    var maxY = (renderArea.y + renderArea.height) / this._context.height;
    if (this._context.root.device.capabilities.screenSpaceSignY > 0) {
      var _ref3 = [maxY, minY];
      minY = _ref3[0];
      maxY = _ref3[1];
    }
    var vbData = new Float32Array(16);
    var fillVertices = function fillVertices(x1, y1, u1, v1, x2, y2, u2, v2, x3, y3, u3, v3, x4, y4, u4, v4) {
      vbData.set([x1, y1, u1, v1, x2, y2, u2, v2, x3, y3, u3, v3, x4, y4, u4, v4]);
    };
    switch (surfaceTransform) {
      case SurfaceTransform.IDENTITY:
        fillVertices(-1, -1, minX, maxY, 1, -1, maxX, maxY, -1, 1, minX, minY, 1, 1, maxX, minY);
        break;
      case SurfaceTransform.ROTATE_90:
        fillVertices(-1, -1, maxX, maxY, 1, -1, maxX, minY, -1, 1, minX, maxY, 1, 1, minX, minY);
        break;
      case SurfaceTransform.ROTATE_180:
        fillVertices(-1, -1, minX, minY, 1, -1, maxX, minY, -1, 1, minX, maxY, 1, 1, maxX, maxY);
        break;
      case SurfaceTransform.ROTATE_270:
        fillVertices(-1, -1, minX, minY, 1, -1, minX, maxY, -1, 1, maxX, minY, 1, 1, maxX, maxY);
        break;
    }
    return vbData;
  };
  _proto11._createQuadInputAssembler = function _createQuadInputAssembler() {
    var inputAssemblerData = new PipelineInputAssemblerData();
    var vbStride = Float32Array.BYTES_PER_ELEMENT * 4;
    var vbSize = vbStride * 4;
    var device = cclegacy.director.root.device;
    var quadVB = device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE | MemoryUsageBit.HOST, vbSize, vbStride));
    if (!quadVB) {
      return inputAssemblerData;
    }
    var ibStride = Uint16Array.BYTES_PER_ELEMENT;
    var ibSize = ibStride * 6;
    var quadIB = device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, ibSize, ibStride));
    if (!quadIB) {
      return inputAssemblerData;
    }
    var indices = new Uint16Array(6);
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 1;
    indices[4] = 3;
    indices[5] = 2;
    quadIB.update(indices.buffer);
    var attributes = new Array(2);
    attributes[0] = new Attribute('a_position', Format.RG32F);
    attributes[1] = new Attribute('a_texCoord', Format.RG32F);
    var quadIA = device.createInputAssembler(new InputAssemblerInfo(attributes, [quadVB], quadIB));
    inputAssemblerData.quadIB = quadIB;
    inputAssemblerData.quadVB = quadVB;
    inputAssemblerData.quadIA = quadIA;
    return inputAssemblerData;
  };
  return _createClass(BlitInfo, [{
    key: "pipelineIAData",
    get: function get() {
      return this._pipelineIAData;
    }
  }, {
    key: "deferredLitsBufView",
    get: function get() {
      return this._deferredLitsBufView;
    }
  }, {
    key: "lightVolumeBuffer",
    get: function get() {
      return this._lightVolumeBuffer;
    }
  }, {
    key: "lightBufferData",
    get: function get() {
      return this._lightBufferData;
    }
  }, {
    key: "stageDescs",
    get: function get() {
      return this._stageDescs;
    }
  }, {
    key: "emptyLocalUBO",
    get: function get() {
      return this._localUBO;
    }
  }]);
}();
var ExecutorContext = function () {
  function ExecutorContext(pipeline, device, resourceGraph, renderGraph, layoutGraph, width, height, descriptorSet) {
    if (descriptorSet === void 0) {
      descriptorSet = null;
    }
    this.device = void 0;
    this.pipeline = void 0;
    this.commandBuffer = void 0;
    this.pipelineSceneData = void 0;
    this.resourceGraph = void 0;
    this.devicePasses = new Map();
    this.deviceTextures = new Map();
    this.deviceBuffers = new Map();
    this.layoutGraph = void 0;
    this.root = void 0;
    this.pools = void 0;
    this.culling = void 0;
    this._blit = null;
    this.lightResource = new LightResource();
    this.renderGraph = void 0;
    this.width = void 0;
    this.height = void 0;
    this.cullCamera = void 0;
    this.passDescriptorSet = void 0;
    this.profilerDescriptorSet = void 0;
    this.passShowStatistics = false;
    this.pipeline = pipeline;
    this.device = device;
    this.commandBuffer = device.commandBuffer;
    this.pipelineSceneData = pipeline.pipelineSceneData;
    this.resourceGraph = resourceGraph;
    this.renderGraph = renderGraph;
    this.root = legacyCC.director.root;
    this.layoutGraph = layoutGraph;
    this.width = width;
    this.height = height;
    this.pools = new ExecutorPools();
    this.culling = new SceneCulling();
    this.passDescriptorSet = descriptorSet;
    this.profilerDescriptorSet = getDescriptorSetDataFromLayout('default').descriptorSet;
  }
  var _proto12 = ExecutorContext.prototype;
  _proto12.reset = function reset() {
    this.culling.clear();
    this.pools.reset();
    this.cullCamera = null;
    this.lightResource.clear();
    this.passShowStatistics = false;
  };
  _proto12.resize = function resize(width, height) {
    this.width = width;
    this.height = height;
    if (this._blit) this._blit.resize(width, height);
  };
  return _createClass(ExecutorContext, [{
    key: "blit",
    get: function get() {
      if (!this._blit) this._blit = new BlitInfo(this);
      return this._blit;
    }
  }]);
}();
var Executor = function () {
  function Executor(pipeline, device, resourceGraph, layoutGraph, width, height) {
    this._context = void 0;
    this._visitor = void 0;
    context$1 = this._context = new ExecutorContext(pipeline, device, resourceGraph, new RenderGraph(), layoutGraph, width, height);
  }
  var _proto13 = Executor.prototype;
  _proto13.resize = function resize(width, height) {
    context$1.resize(width, height);
  };
  _proto13._removeDeviceResource = function _removeDeviceResource() {
    var pipeline = context$1.pipeline;
    var resourceUses = pipeline.resourceUses;
    var deletes = [];
    var deviceTexs = context$1.deviceTextures;
    for (var _iterator15 = _createForOfIteratorHelperLoose(deviceTexs), _step15; !(_step15 = _iterator15()).done;) {
      var _step15$value = _step15.value,
        _name2 = _step15$value[0];
        _step15$value[1];
      var resId = context$1.resourceGraph.vertex(_name2);
      var trait = context$1.resourceGraph.getTraits(resId);
      if (!resourceUses.includes(_name2)) {
        switch (trait.residency) {
          case ResourceResidency.MANAGED:
            deletes.push(_name2);
            break;
        }
      }
    }
    for (var _i = 0, _deletes = deletes; _i < _deletes.length; _i++) {
      var name = _deletes[_i];
      deviceTexs.get(name).release();
      deviceTexs["delete"](name);
    }
    var deletesBuff = [];
    var deviceBuffs = context$1.deviceBuffers;
    for (var _iterator16 = _createForOfIteratorHelperLoose(deviceBuffs), _step16; !(_step16 = _iterator16()).done;) {
      var _step16$value = _step16.value,
        _name3 = _step16$value[0];
        _step16$value[1];
      var _resId = context$1.resourceGraph.vertex(_name3);
      var _trait = context$1.resourceGraph.getTraits(_resId);
      if (!resourceUses.includes(_name3)) {
        switch (_trait.residency) {
          case ResourceResidency.MANAGED:
            deletesBuff.push(_name3);
            break;
        }
      }
    }
    for (var _i2 = 0, _deletesBuff = deletesBuff; _i2 < _deletesBuff.length; _i2++) {
      var _name = _deletesBuff[_i2];
      deviceBuffs.get(_name).release();
      deviceBuffs["delete"](_name);
    }
    resourceUses.length = 0;
  };
  _proto13.execute = function execute(rg) {
    context$1.renderGraph = rg;
    context$1.reset();
    var cmdBuff = context$1.commandBuffer;
    var culling = context$1.culling;
    culling.buildRenderQueues(rg, context$1.layoutGraph, context$1.pipelineSceneData);
    context$1.lightResource.buildLights(culling, context$1.pipelineSceneData.isHDR, context$1.pipelineSceneData.shadows);
    this._removeDeviceResource();
    cmdBuff.begin();
    context$1.lightResource.buildLightBuffer(cmdBuff);
    context$1.lightResource.tryUpdateRenderSceneLocalDescriptorSet(context$1.culling);
    culling.uploadInstancing(cmdBuff);
    if (!this._visitor) this._visitor = new RenderVisitor();
    depthFirstSearch(this._visitor.graphView, this._visitor, this._visitor.colorMap);
    cmdBuff.end();
    context$1.device.queue.submit([cmdBuff]);
  };
  _proto13.release = function release() {
    context$1.devicePasses.clear();
    for (var _iterator17 = _createForOfIteratorHelperLoose(context$1.deviceTextures), _step17; !(_step17 = _iterator17()).done;) {
      var _step17$value = _step17.value;
        _step17$value[0];
        var v = _step17$value[1];
      v.release();
    }
    context$1.deviceTextures.clear();
    for (var _iterator18 = _createForOfIteratorHelperLoose(context$1.deviceBuffers), _step18; !(_step18 = _iterator18()).done;) {
      var _step18$value = _step18.value;
        _step18$value[0];
        var _v = _step18$value[1];
      _v.release();
    }
    context$1.deviceBuffers.clear();
  };
  return Executor;
}();
var BaseRenderVisitor = function () {
  function BaseRenderVisitor() {
    this.queueID = 0xFFFFFFFF;
    this.sceneID = 0xFFFFFFFF;
    this.passID = 0xFFFFFFFF;
    this.dispatchID = 0xFFFFFFFF;
    this.currPass = void 0;
    this.currQueue = void 0;
    this.rg = void 0;
    this.rg = context$1.renderGraph;
  }
  var _proto14 = BaseRenderVisitor.prototype;
  _proto14._isRasterPass = function _isRasterPass(u) {
    return context$1.renderGraph.h(RenderGraphValue.RasterPass, u);
  };
  _proto14.isComputePass = function isComputePass(u) {
    return context$1.renderGraph.h(RenderGraphValue.Compute, u);
  };
  _proto14.isDispatch = function isDispatch(u) {
    return context$1.renderGraph.h(RenderGraphValue.Dispatch, u);
  };
  _proto14._isQueue = function _isQueue(u) {
    return context$1.renderGraph.h(RenderGraphValue.Queue, u);
  };
  _proto14._isScene = function _isScene(u) {
    return context$1.renderGraph.h(RenderGraphValue.Scene, u);
  };
  _proto14._isBlit = function _isBlit(u) {
    return context$1.renderGraph.h(RenderGraphValue.Blit, u);
  };
  _proto14.applyID = function applyID(id) {
    if (this._isRasterPass(id)) {
      this.passID = id;
    } else if (this._isQueue(id)) {
      this.queueID = id;
    } else if (this._isScene(id) || this._isBlit(id)) {
      this.sceneID = id;
    } else if (this.isComputePass(id)) {
      this.passID = id;
    } else if (this.isDispatch(id)) {
      this.dispatchID = id;
    }
  };
  return BaseRenderVisitor;
}();
var PreRenderVisitor = function (_BaseRenderVisitor2) {
  function PreRenderVisitor() {
    return _BaseRenderVisitor2.call(this) || this;
  }
  _inheritsLoose(PreRenderVisitor, _BaseRenderVisitor2);
  var _proto15 = PreRenderVisitor.prototype;
  _proto15.clear = function clear(value) {};
  _proto15.viewport = function viewport(value) {};
  _proto15.rasterPass = function rasterPass(pass) {
    if (!this.rg.getValid(this.passID)) return;
    var devicePasses = context$1.devicePasses;
    var passHash = pass.hashValue;
    this.currPass = devicePasses.get(passHash);
    if (!this.currPass) {
      this.currPass = new DeviceRenderPass(this.passID, pass);
      devicePasses.set(passHash, this.currPass);
    } else {
      this.currPass.resetResource(this.passID, pass);
    }
    this.currPass.preRecord();
  };
  _proto15.rasterSubpass = function rasterSubpass(value) {};
  _proto15.computeSubpass = function computeSubpass(value) {};
  _proto15.resolve = function resolve(value) {};
  _proto15.move = function move(value) {};
  _proto15.raytrace = function raytrace(value) {};
  _proto15.compute = function compute(pass) {
    if (!this.rg.getValid(this.passID)) return;
    context$1.devicePasses;
    var computeInfo = new ComputePassInfo();
    computeInfo.applyInfo(this.passID, pass);
    this.currPass = new DeviceComputePass(computeInfo);
    this.currPass.preRecord();
    this.currPass.record();
    this.currPass.postRecord();
  };
  _proto15.copy = function copy(value) {
    if (value.uploadPairs.length) {
      for (var _iterator19 = _createForOfIteratorHelperLoose(value.uploadPairs), _step19; !(_step19 = _iterator19()).done;) {
        var upload = _step19.value;
        var resBuffers = context$1.deviceBuffers;
        var resourceGraph = context$1.resourceGraph;
        var vertId = resourceGraph.vertex(upload.target);
        resourceVisitor.resName = upload.target;
        resourceGraph.visitVertex(resourceVisitor, vertId);
        var gfxBuffer = resBuffers.get(upload.target);
        context$1.device.commandBuffer.updateBuffer(gfxBuffer.buffer, upload.source, upload.source.byteLength);
      }
    }
  };
  _proto15.queue = function queue(value) {
    if (!this.rg.getValid(this.queueID)) return;
    var deviceQueue;
    if (this.currPass instanceof DeviceRenderPass) {
      deviceQueue = context$1.pools.addDeviceQueue();
      deviceQueue.init(this.currPass, value, this.queueID);
      this.currQueue = deviceQueue;
      this.currPass.addQueue(deviceQueue);
    } else {
      deviceQueue = context$1.pools.addComputeQueue();
      deviceQueue.init(this.currPass, value, this.queueID);
      this.currQueue = deviceQueue;
      this.currPass.addQueue(deviceQueue);
    }
    var layoutName = this.rg.getLayout(this.queueID);
    if (layoutName) {
      var layoutGraph = context$1.layoutGraph;
      if (this.currPass.renderLayout) {
        var layoutId = layoutGraph.locateChild(this.currPass.renderLayout.layoutID, layoutName);
        this.currQueue.layoutID = layoutId;
      }
    }
    this.currQueue.preRecord();
  };
  _proto15.scene = function scene(value) {
    if (!this.rg.getValid(this.sceneID)) return;
    var renderQueue = this.currQueue;
    var renderScene = renderQueue.setScene(this.sceneID, value);
    renderScene.preRecord();
  };
  _proto15.blit = function blit(value) {
    if (!this.rg.getValid(this.sceneID)) return;
    var renderQueue = this.currQueue;
    var renderScene = renderQueue.setScene(this.sceneID, undefined, value);
    renderScene.preRecord();
  };
  _proto15.dispatch = function dispatch(value) {
    var _value$material;
    var pso = null;
    var devicePass = this.currPass;
    var pass = (_value$material = value.material) == null ? void 0 : _value$material.passes[value.passID];
    pass == null ? void 0 : pass.update();
    var shader = pass == null ? void 0 : pass.getShaderVariant();
    if (pass !== null && shader !== null) {
      var psoInfo = new PipelineStateInfo(shader, pass == null ? void 0 : pass.pipelineLayout);
      psoInfo.bindPoint = PipelineBindPoint.COMPUTE;
      pso = deviceManager.gfxDevice.createPipelineState(psoInfo);
    }
    var cmdBuff = context$1.commandBuffer;
    if (pso) {
      cmdBuff.bindPipelineState(pso);
      var layoutStage = devicePass.renderLayout;
      var layoutDesc = layoutStage.descriptorSet;
      cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, layoutDesc);
    }
    var gx = value.threadGroupCountX;
    var gy = value.threadGroupCountY;
    var gz = value.threadGroupCountZ;
    cmdBuff.dispatch(new DispatchInfo(gx, gy, gz));
  };
  return PreRenderVisitor;
}(BaseRenderVisitor);
var PostRenderVisitor = function (_BaseRenderVisitor3) {
  function PostRenderVisitor() {
    return _BaseRenderVisitor3.call(this) || this;
  }
  _inheritsLoose(PostRenderVisitor, _BaseRenderVisitor3);
  var _proto16 = PostRenderVisitor.prototype;
  _proto16.clear = function clear(value) {};
  _proto16.viewport = function viewport(value) {};
  _proto16.rasterPass = function rasterPass(pass) {
    var devicePasses = context$1.devicePasses;
    var passHash = pass.hashValue;
    var currPass = devicePasses.get(passHash);
    if (!currPass) return;
    this.currPass = currPass;
    context$1.passShowStatistics = pass.showStatistics;
    this.currPass.record();
    this.currPass.postRecord();
  };
  _proto16.rasterSubpass = function rasterSubpass(value) {};
  _proto16.computeSubpass = function computeSubpass(value) {};
  _proto16.resolve = function resolve(value) {};
  _proto16.compute = function compute(value) {};
  _proto16.copy = function copy(value) {};
  _proto16.move = function move(value) {};
  _proto16.raytrace = function raytrace(value) {};
  _proto16.queue = function queue(value) {};
  _proto16.scene = function scene(value) {};
  _proto16.blit = function blit(value) {};
  _proto16.dispatch = function dispatch(value) {};
  return PostRenderVisitor;
}(BaseRenderVisitor);
var RenderVisitor = function (_DefaultVisitor) {
  function RenderVisitor() {
    var _this5;
    _this5 = _DefaultVisitor.call(this) || this;
    _this5._preVisitor = void 0;
    _this5._postVisitor = void 0;
    _this5._graphView = void 0;
    _this5._colorMap = void 0;
    _this5._preVisitor = new PreRenderVisitor();
    _this5._postVisitor = new PostRenderVisitor();
    _this5._graphView = new ReferenceGraphView(context$1.renderGraph);
    _this5._colorMap = new VectorGraphColorMap(context$1.renderGraph.nv());
    return _this5;
  }
  _inheritsLoose(RenderVisitor, _DefaultVisitor);
  var _proto17 = RenderVisitor.prototype;
  _proto17.discoverVertex = function discoverVertex(u, gv) {
    var g = gv.g;
    this._preVisitor.applyID(u);
    g.visitVertex(this._preVisitor, u);
  };
  _proto17.finishVertex = function finishVertex(v, gv) {
    var g = gv.g;
    g.visitVertex(this._postVisitor, v);
  };
  return _createClass(RenderVisitor, [{
    key: "graphView",
    get: function get() {
      return this._graphView;
    }
  }, {
    key: "colorMap",
    get: function get() {
      return this._colorMap;
    }
  }]);
}(DefaultVisitor);

var readViews = new Map();
var PassVisitor = function () {
  function PassVisitor(context) {
    this.queueID = 0xFFFFFFFF;
    this.sceneID = 0xFFFFFFFF;
    this.passID = 0xFFFFFFFF;
    this.dispatchID = 0xFFFFFFFF;
    this.subpassID = 0xFFFFFFFF;
    this.resID = 0xFFFFFFFF;
    this.context = void 0;
    this._currPass = null;
    this._rasterSubpass = null;
    this._resVisitor = void 0;
    this.context = context;
    this._resVisitor = new ResourceVisitor(this.context);
  }
  var _proto = PassVisitor.prototype;
  _proto._isRasterPass = function _isRasterPass(u) {
    return this.context.renderGraph.h(RenderGraphValue.RasterPass, u);
  };
  _proto._isCopyPass = function _isCopyPass(u) {
    return this.context.renderGraph.h(RenderGraphValue.Copy, u);
  };
  _proto._isCompute = function _isCompute(u) {
    return this.context.renderGraph.h(RenderGraphValue.Compute, u);
  };
  _proto._isDispatch = function _isDispatch(u) {
    return this.context.renderGraph.h(RenderGraphValue.Dispatch, u);
  };
  _proto._isQueue = function _isQueue(u) {
    return this.context.renderGraph.h(RenderGraphValue.Queue, u);
  };
  _proto._isShadowMap = function _isShadowMap(u) {
    var sceneData = this._getSceneData(u);
    if (sceneData) {
      return sceneData.light && !!sceneData.light.light && (sceneData.flags & SceneFlags.SHADOW_CASTER) !== 0;
    }
    return false;
  };
  _proto._getSceneData = function _getSceneData(u) {
    if (!this.context.renderGraph.h(RenderGraphValue.Scene, u)) {
      return null;
    }
    return this.context.renderGraph.j(u);
  };
  _proto._isScene = function _isScene(u) {
    return this.context.renderGraph.h(RenderGraphValue.Scene, u);
  };
  _proto._isBlit = function _isBlit(u) {
    return this.context.renderGraph.h(RenderGraphValue.Blit, u);
  };
  _proto._isRasterSubpass = function _isRasterSubpass(u) {
    return this.context.renderGraph.object(u) instanceof RasterSubpass;
  };
  _proto._useResourceInfo = function _useResourceInfo(input, raster) {
    var resContext = this.context.resourceContext;
    var useContext = resContext.get(input);
    var resGraph = this.context.resourceGraph;
    if (useContext) {
      var rasters = useContext.rasters;
      var passRaster = rasters.get(this.passID);
      if (passRaster === raster) {
        return;
      }
      var computes = useContext.computes;
      for (var _iterator = _createForOfIteratorHelperLoose(rasters), _step; !(_step = _iterator()).done;) {
        var _step$value = _step.value,
          passId = _step$value[0];
          _step$value[1];
        if (passId > this.passID) ;
      }
      for (var _iterator2 = _createForOfIteratorHelperLoose(computes), _step2; !(_step2 = _iterator2()).done;) {
        var _step2$value = _step2.value,
          _passId = _step2$value[0];
        if (_passId > this.passID) {
          break;
        }
      }
      rasters.set(this.passID, raster);
    } else {
      var resId = resGraph.vertex(input);
      var trait = resGraph.getTraits(resId);
      switch (trait.residency) {
        case ResourceResidency.PERSISTENT:
          break;
      }
      var _useContext = new ResourceUseContext();
      resContext.set(input, _useContext);
      _useContext.rasters.set(this.passID, raster);
    }
  };
  _proto._fetchValidPass = function _fetchValidPass() {
    var rg = this.context.renderGraph;
    var resContext = this.context.resourceContext;
    var outputId = this.resID;
    var outputName = this.context.resourceGraph.vertexName(outputId);
    readViews.clear();
    var pass = this._currPass;
    var subpasses = pass.subpassGraph._subpasses;
    var validPass = rg.getValid(this.passID);
    for (var _iterator3 = _createForOfIteratorHelperLoose(pass.rasterViews), _step3; !(_step3 = _iterator3()).done;) {
      var _step3$value = _step3.value,
        _readName = _step3$value[0],
        _raster2 = _step3$value[1];
      var isSubpassOutput = false;
      for (var _iterator7 = _createForOfIteratorHelperLoose(subpasses), _step7; !(_step7 = _iterator7()).done;) {
        var subpass = _step7.value;
        if (isSubpassOutput) break;
        for (var _iterator8 = _createForOfIteratorHelperLoose(subpass.resolvePairs), _step8; !(_step8 = _iterator8()).done;) {
          var resolve = _step8.value;
          if (resolve.target === outputName && resolve.source === _readName) {
            isSubpassOutput = true;
            break;
          }
        }
      }
      if ((_readName === outputName || isSubpassOutput) && _raster2.accessType !== AccessType.READ) {
        this._useResourceInfo(_readName, _raster2);
        rg.setValid(this.passID, true);
        rg.setValid(this.queueID, true);
        rg.setValid(this.sceneID, true);
        continue;
      }
      if (_raster2.accessType !== AccessType.WRITE) {
        readViews.set(_readName, _raster2);
      }
    }
    if (validPass) return;
    if (rg.getValid(this.sceneID)) {
      for (var _iterator4 = _createForOfIteratorHelperLoose(pass.rasterViews), _step4; !(_step4 = _iterator4()).done;) {
        var _step4$value = _step4.value,
          readName = _step4$value[0];
          _step4$value[1];
        context.pipeline.resourceUses.push(readName);
      }
      var resourceGraph;
      var vertID;
      for (var _iterator5 = _createForOfIteratorHelperLoose(readViews), _step5; !(_step5 = _iterator5()).done;) {
        var _step5$value = _step5.value,
          rasterName = _step5$value[0];
          _step5$value[1];
        resourceGraph = this.context.resourceGraph;
        vertID = resourceGraph.find(rasterName);
        if (vertID !== 0xFFFFFFFF) {
          this._resVisitor.resID = vertID;
          resourceGraph.visitVertex(this._resVisitor, vertID);
        }
      }
      for (var _iterator6 = _createForOfIteratorHelperLoose(pass.computeViews), _step6; !(_step6 = _iterator6()).done;) {
        var _step6$value = _step6.value,
          computeName = _step6$value[0],
          cViews = _step6$value[1];
        var resUseContext = resContext.get(computeName);
        if (!resUseContext) {
          resUseContext = new ResourceUseContext();
          resContext.set(computeName, resUseContext);
        }
        var computes = resUseContext.computes;
        var currUseComputes = computes.get(this.passID);
        if (currUseComputes) {
          currUseComputes.push(cViews);
        } else {
          computes.set(this.passID, [cViews]);
        }
        resourceGraph = this.context.resourceGraph;
        vertID = resourceGraph.find(computeName);
        if (vertID !== 0xFFFFFFFF) {
          this._resVisitor.resID = vertID;
          resourceGraph.visitVertex(this._resVisitor, vertID);
        }
      }
      genHashValue(pass);
    }
  };
  _proto.applyID = function applyID(id, resId) {
    this.resID = resId;
    if (this._isRasterPass(id) || this._isCopyPass(id) || this._isCompute(id)) {
      this.passID = id;
    } else if (this._isQueue(id)) {
      this.queueID = id;
    } else if (this._isRasterSubpass(id)) {
      this.subpassID = id;
    } else if (this._isScene(id) || this._isBlit(id)) {
      this.sceneID = id;
    } else if (this._isDispatch(id)) {
      this.dispatchID = id;
    }
  };
  _proto.rasterPass = function rasterPass(pass) {
    this._currPass = pass;
  };
  _proto.rasterSubpass = function rasterSubpass(value) {
    this._rasterSubpass = value;
  };
  _proto.computeSubpass = function computeSubpass(value) {};
  _proto.compute = function compute(value) {
    this._currPass = value;
    var rg = context.renderGraph;
    rg.setValid(this.passID, true);
  };
  _proto.resolve = function resolve(value) {};
  _proto.copy = function copy(value) {
    var rg = context.renderGraph;
    if (rg.getValid(this.passID)) {
      return;
    }
    var resourceGraph = this.context.resourceGraph;
    this._currPass = value;
    var outputId = this.resID;
    var outputName = resourceGraph.vertexName(outputId);
    var vertID;
    for (var _iterator9 = _createForOfIteratorHelperLoose(value.copyPairs), _step9; !(_step9 = _iterator9()).done;) {
      var pair = _step9.value;
      if (pair.target === outputName) {
        rg.setValid(this.passID, true);
        vertID = resourceGraph.find(pair.source);
        if (vertID !== 0xFFFFFFFF) {
          this._resVisitor.resID = vertID;
          resourceGraph.visitVertex(this._resVisitor, vertID);
        }
      }
    }
  };
  _proto.move = function move(value) {};
  _proto.raytrace = function raytrace(value) {};
  _proto.queue = function queue(value) {};
  _proto.scene = function scene(value) {
    this._fetchValidPass();
  };
  _proto.blit = function blit(value) {
    this._fetchValidPass();
  };
  _proto.dispatch = function dispatch(value) {
    var rg = this.context.renderGraph;
    rg.setValid(this.queueID, true);
    rg.setValid(this.dispatchID, true);
  };
  _proto.clear = function clear(value) {};
  _proto.viewport = function viewport(value) {};
  return PassVisitor;
}();
var PassManagerVisitor = function (_DefaultVisitor) {
  function PassManagerVisitor(context, resId) {
    var _this;
    _this = _DefaultVisitor.call(this) || this;
    _this._colorMap = void 0;
    _this._graphView = void 0;
    _this._passVisitor = void 0;
    _this._resId = 0xFFFFFFFF;
    _this._resId = resId;
    _this._passVisitor = new PassVisitor(context);
    _this._graphView = new ReferenceGraphView(context.renderGraph);
    _this._colorMap = new VectorGraphColorMap(context.renderGraph.nv());
    return _this;
  }
  _inheritsLoose(PassManagerVisitor, _DefaultVisitor);
  var _proto2 = PassManagerVisitor.prototype;
  _proto2.discoverVertex = function discoverVertex(u, gv) {
    var g = gv.g;
    this._passVisitor.applyID(u, this.resId);
    g.visitVertex(this._passVisitor, u);
  };
  return _createClass(PassManagerVisitor, [{
    key: "resId",
    get: function get() {
      return this._resId;
    },
    set: function set(value) {
      this._resId = value;
      this._colorMap.colors.length = context.renderGraph.nv();
    }
  }, {
    key: "graphView",
    get: function get() {
      return this._graphView;
    }
  }, {
    key: "colorMap",
    get: function get() {
      return this._colorMap;
    }
  }]);
}(DefaultVisitor);
var ResourceVisitor = function () {
  function ResourceVisitor(context) {
    this._context = void 0;
    this.resID = 0xFFFFFFFF;
    this._passManagerVis = void 0;
    this._context = context;
  }
  var _proto3 = ResourceVisitor.prototype;
  _proto3.managedBuffer = function managedBuffer(value) {};
  _proto3.managedTexture = function managedTexture(value) {};
  _proto3.managed = function managed(value) {
    this.dependency();
  };
  _proto3.persistentBuffer = function persistentBuffer(value) {};
  _proto3.dependency = function dependency() {
    if (!this._passManagerVis) {
      this._passManagerVis = new PassManagerVisitor(this._context, this.resID);
    } else {
      this._passManagerVis.resId = this.resID;
    }
    depthFirstSearch(this._passManagerVis.graphView, this._passManagerVis, this._passManagerVis.colorMap);
  };
  _proto3.persistentTexture = function persistentTexture(value) {
    this.dependency();
  };
  _proto3.framebuffer = function framebuffer(value) {
    this.dependency();
  };
  _proto3.swapchain = function swapchain(value) {
    this.dependency();
  };
  _proto3.formatView = function formatView(value) {};
  _proto3.subresourceView = function subresourceView(value) {};
  return ResourceVisitor;
}();
var ResourceUseContext = function ResourceUseContext() {
  this.rasters = new Map();
  this.computes = new Map();
};
var CompilerContext = function () {
  function CompilerContext() {
    this.resourceGraph = void 0;
    this.pipeline = void 0;
    this.renderGraph = void 0;
    this.layoutGraph = void 0;
    this.resourceContext = void 0;
  }
  var _proto4 = CompilerContext.prototype;
  _proto4.set = function set(pipeline, resGraph, renderGraph, layoutGraph) {
    this.pipeline = pipeline;
    this.resourceGraph = resGraph;
    this.renderGraph = renderGraph;
    this.layoutGraph = layoutGraph;
    if (!this.resourceContext) {
      this.resourceContext = new Map();
    }
    this.resourceContext.clear();
  };
  return CompilerContext;
}();
var Compiler = function () {
  function Compiler(pipeline, renderGraph, resGraph, layoutGraph) {
    this._resourceGraph = void 0;
    this._pipeline = void 0;
    this._layoutGraph = void 0;
    this._visitor = void 0;
    this._pipeline = pipeline;
    this._resourceGraph = resGraph;
    this._layoutGraph = layoutGraph;
    context.set(this._pipeline, this._resourceGraph, renderGraph, this._layoutGraph);
    this._visitor = new ResourceManagerVisitor(context);
  }
  var _proto5 = Compiler.prototype;
  _proto5.compile = function compile(rg) {
    context.set(this._pipeline, this._resourceGraph, rg, this._layoutGraph);
    context.pipeline.resourceUses.length = 0;
    this._visitor.colorMap.colors.length = context.resourceGraph.nv();
    depthFirstSearch(this._resourceGraph, this._visitor, this._visitor.colorMap);
  };
  return Compiler;
}();
var context = new CompilerContext();
var ResourceManagerVisitor = function (_DefaultVisitor2) {
  function ResourceManagerVisitor(context) {
    var _this2;
    _this2 = _DefaultVisitor2.call(this) || this;
    _this2._colorMap = void 0;
    _this2._resourceGraph = void 0;
    _this2._resVisitor = void 0;
    _this2._colorMap = new VectorGraphColorMap(context.resourceGraph.nv());
    _this2._resourceGraph = context.resourceGraph;
    _this2._resVisitor = new ResourceVisitor(context);
    return _this2;
  }
  _inheritsLoose(ResourceManagerVisitor, _DefaultVisitor2);
  var _proto6 = ResourceManagerVisitor.prototype;
  _proto6.discoverVertex = function discoverVertex(u, gv) {
    var traits = this._resourceGraph.getTraits(u);
    if (traits.residency === ResourceResidency.MANAGED || traits.residency === ResourceResidency.MEMORYLESS) {
      return;
    }
    this._resVisitor.resID = u;
    this._resourceGraph.visitVertex(this._resVisitor, u);
  };
  return _createClass(ResourceManagerVisitor, [{
    key: "colorMap",
    get: function get() {
      return this._colorMap;
    }
  }]);
}(DefaultVisitor);

var _uboVec = new Vec4();
var _samplerPointInfo = new SamplerInfo(Filter.POINT, Filter.POINT, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP);
var PipelinePool = function () {
  function PipelinePool() {
    var _this = this;
    this.renderData = new RenderData();
    this.layoutGraph = new LayoutGraphData();
    this.rg = new RenderGraph();
    this.vertId = -1;
    this.sceneData = new SceneData();
    this.resourceGraph = new ResourceGraph();
    this.computePass = new ComputePass();
    this.rasterPass = new RasterPass();
    this.rasterSubpass = new RasterSubpass();
    this.renderQueue = new RenderQueue$1();
    this.resolvePair = new RecyclePool(function () {
      return new ResolvePair();
    }, 16);
    this.sceneBuilder = new RecyclePool(function () {
      return new WebSceneBuilder(_this.renderData, _this.layoutGraph, _this.rg, _this.vertId, _this.sceneData);
    }, 16);
    this.renderPassBuilder = new RecyclePool(function () {
      return new WebRenderPassBuilder(_this.renderData, _this.rg, _this.layoutGraph, _this.resourceGraph, _this.vertId, _this.rasterPass, _this.getPipelineSceneData());
    }, 16);
    this.computeQueueBuilder = new RecyclePool(function () {
      return new WebComputeQueueBuilder(_this.renderData, _this.rg, _this.layoutGraph, _this.vertId, _this.renderQueue, _this.getPipelineSceneData());
    }, 16);
    this.renderQueueBuilder = new RecyclePool(function () {
      return new WebRenderQueueBuilder(_this.renderData, _this.rg, _this.layoutGraph, _this.vertId, _this.renderQueue, _this.getPipelineSceneData());
    }, 16);
    this.renderSubpassBuilder = new RecyclePool(function () {
      return new WebRenderSubpassBuilder(_this.renderData, _this.rg, _this.layoutGraph, _this.vertId, _this.rasterSubpass, _this.getPipelineSceneData());
    }, 16);
    this.computePassBuilder = new RecyclePool(function () {
      return new WebComputePassBuilder(_this.renderData, _this.rg, _this.layoutGraph, _this.resourceGraph, _this.vertId, _this.computePass, _this.getPipelineSceneData());
    }, 16);
    this.samplerInfo = new RecyclePool(function () {
      return new SamplerInfo();
    }, 16);
    this.color = new RecyclePool(function () {
      return new Color();
    }, 16);
    this.renderCommonObjectPool = new RenderCommonObjectPool();
    this.renderGraphPool = new RenderGraphObjectPool(this.renderCommonObjectPool);
    this.viewport = new RecyclePool(function () {
      return new Viewport();
    }, 16);
  }
  var _proto = PipelinePool.prototype;
  _proto.getPipelineSceneData = function getPipelineSceneData() {
    return legacyCC.director.root.pipeline.pipelineSceneData;
  };
  _proto.createColor = function createColor(x, y, z, w) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (z === void 0) {
      z = 0;
    }
    if (w === void 0) {
      w = 0;
    }
    var color = this.color.add();
    color.set(x, y, z, w);
    return color;
  };
  _proto.createSamplerInfo = function createSamplerInfo(minFilter, magFilter, mipFilter, addressU, addressV, addressW, maxAnisotropy, cmpFunc) {
    if (minFilter === void 0) {
      minFilter = Filter.LINEAR;
    }
    if (magFilter === void 0) {
      magFilter = Filter.LINEAR;
    }
    if (mipFilter === void 0) {
      mipFilter = Filter.NONE;
    }
    if (addressU === void 0) {
      addressU = Address.WRAP;
    }
    if (addressV === void 0) {
      addressV = Address.WRAP;
    }
    if (addressW === void 0) {
      addressW = Address.WRAP;
    }
    if (maxAnisotropy === void 0) {
      maxAnisotropy = 0;
    }
    if (cmpFunc === void 0) {
      cmpFunc = ComparisonFunc.ALWAYS;
    }
    var samplerInfo = this.samplerInfo.add();
    samplerInfo.minFilter = minFilter;
    samplerInfo.magFilter = magFilter;
    samplerInfo.mipFilter = mipFilter;
    samplerInfo.addressU = addressU;
    samplerInfo.addressV = addressV;
    samplerInfo.addressW = addressW;
    samplerInfo.maxAnisotropy = maxAnisotropy;
    samplerInfo.cmpFunc = cmpFunc;
    return samplerInfo;
  };
  _proto.reset = function reset() {
    this.sceneBuilder.reset();
    this.renderPassBuilder.reset();
    this.computePassBuilder.reset();
    this.computeQueueBuilder.reset();
    this.renderCommonObjectPool.reset();
    this.renderGraphPool.reset();
    this.viewport.reset();
    this.resolvePair.reset();
    this.samplerInfo.reset();
    this.color.reset();
    this.renderQueueBuilder.reset();
    this.renderSubpassBuilder.reset();
  };
  return PipelinePool;
}();
var pipelinePool;
var renderGraphPool;
function setComputeConstants(setter, layoutName) {
  var director = cclegacy.director;
  var root = director.root;
  root.pipeline;
}
function getTextureType(dimension, arraySize) {
  switch (dimension) {
    case ResourceDimension.TEXTURE1D:
      return arraySize > 1 ? TextureType.TEX1D_ARRAY : TextureType.TEX1D;
    case ResourceDimension.TEXTURE2D:
      return arraySize > 1 ? TextureType.TEX2D_ARRAY : TextureType.TEX2D;
    case ResourceDimension.TEXTURE3D:
      return TextureType.TEX3D;
    case ResourceDimension.BUFFER:
      return TextureType.TEX2D;
  }
  return TextureType.TEX2D;
}
function getResourceDimension(type) {
  switch (type) {
    case TextureType.TEX1D:
    case TextureType.TEX1D_ARRAY:
      return ResourceDimension.TEXTURE1D;
    case TextureType.TEX2D:
    case TextureType.TEX2D_ARRAY:
    case TextureType.CUBE:
      return ResourceDimension.TEXTURE2D;
    case TextureType.TEX3D:
      return ResourceDimension.TEXTURE3D;
  }
  return ResourceDimension.TEXTURE2D;
}
var emptyMaterial = new Material();
var emptyRenderData = new RenderData();
var WebSceneBuilder = function (_WebSetter) {
  function WebSceneBuilder(data, layoutGraph, rg, sceneId, scene) {
    var _this2;
    _this2 = _WebSetter.call(this, data, layoutGraph) || this;
    _this2._renderGraph = void 0;
    _this2._scene = void 0;
    _this2._renderGraph = rg;
    _this2._scene = scene;
    _this2._vertID = sceneId;
    return _this2;
  }
  _inheritsLoose(WebSceneBuilder, _WebSetter);
  var _proto2 = WebSceneBuilder.prototype;
  _proto2.update = function update(data, layoutGraph, rg, sceneId, scene) {
    this._data = data;
    this._lg = layoutGraph;
    this._renderGraph = rg;
    this._scene = scene;
    this._vertID = sceneId;
  };
  _proto2.useLightFrustum = function useLightFrustum(light, csmLevel, optCamera) {
    if (csmLevel === void 0) {
      csmLevel = 0;
    }
    if (optCamera === void 0) {
      optCamera = undefined;
    }
    this._scene.light.light = light;
    this._scene.light.level = csmLevel;
    this._scene.light.culledByLight = true;
    if (optCamera) {
      this._scene.camera = optCamera;
    }
    if (this._scene.flags & SceneFlags.NON_BUILTIN) {
      return;
    }
    var queueId = this._renderGraph.getParent(this._vertID);
    var passId = this._renderGraph.getParent(queueId);
    this._renderGraph.getLayout(passId);
    setShadowUBOLightView(this, this._scene.camera, light, csmLevel);
  };
  return WebSceneBuilder;
}(WebSetter);
var WebRenderQueueBuilder = function (_WebSetter2) {
  function WebRenderQueueBuilder(data, renderGraph, layoutGraph, vertID, queue, pipeline) {
    var _this3;
    _this3 = _WebSetter2.call(this, data, layoutGraph) || this;
    _this3._renderGraph = void 0;
    _this3._queue = void 0;
    _this3._pipeline = void 0;
    _this3._renderGraph = renderGraph;
    _this3._vertID = vertID;
    _this3._queue = queue;
    _this3._pipeline = pipeline;
    return _this3;
  }
  _inheritsLoose(WebRenderQueueBuilder, _WebSetter2);
  var _proto3 = WebRenderQueueBuilder.prototype;
  _proto3.update = function update(data, renderGraph, layoutGraph, vertID, queue, pipeline) {
    this._data = data;
    this._lg = layoutGraph;
    this._renderGraph = renderGraph;
    this._vertID = vertID;
    this._queue = queue;
    this._pipeline = pipeline;
  };
  _proto3.setArrayBuffer = function setArrayBuffer(name, arrayBuffer) {
    throw new Error('Method not implemented.');
  };
  _proto3.addSceneOfCamera = function addSceneOfCamera(camera, light, sceneFlags, name) {
    if (sceneFlags === void 0) {
      sceneFlags = SceneFlags.NONE;
    }
    var lightTarget = light.light;
    this.addScene(camera, sceneFlags, lightTarget);
  };
  _proto3.addScene = function addScene(camera, sceneFlags, light, scene) {
    if (sceneFlags === void 0) {
      sceneFlags = SceneFlags.NONE;
    }
    if (light === void 0) {
      light = null;
    }
    if (scene === void 0) {
      scene = undefined;
    }
    var sceneData = renderGraphPool.createSceneData(scene || camera.scene, camera, sceneFlags, light && !(sceneFlags & SceneFlags.SHADOW_CASTER) ? CullingFlags.CAMERA_FRUSTUM | CullingFlags.LIGHT_BOUNDS : CullingFlags.CAMERA_FRUSTUM, light);
    var renderData = renderGraphPool.createRenderData();
    var sceneId = this._renderGraph.addVertex(RenderGraphValue.Scene, sceneData, 'Scene', '', renderData, false, this._vertID);
    if (!(sceneFlags & SceneFlags.NON_BUILTIN)) {
      this.getParentLayout();
      setCameraUBOValues(this, camera, this._pipeline, scene || camera.scene);
      if (light && light.type !== LightType.DIRECTIONAL) setShadowUBOLightView(this, camera, light, 0);else if (!(sceneFlags & SceneFlags.SHADOW_CASTER)) setShadowUBOView(this, camera);
    }
    var passOrSubpassId = this._renderGraph.getParent(this._vertID);
    if (sceneFlags & SceneFlags.UI) {
      var queueId = this._renderGraph.addVertex(RenderGraphValue.Queue, this._queue, 'UI Queue', 'default', this._data, false, passOrSubpassId);
      this._renderGraph.addVertex(RenderGraphValue.Blit, renderGraphPool.createBlit(emptyMaterial, this._renderGraph.N, SceneFlags.NONE, camera, BlitType.DRAW_2D), 'UI', '', emptyRenderData, false, queueId);
    }
    if (sceneFlags & SceneFlags.PROFILER) {
      this.addProfiler(camera);
    }
    var sceneBuilder = pipelinePool.sceneBuilder.add();
    sceneBuilder.update(renderData, this._lg, this._renderGraph, sceneId, sceneData);
    return sceneBuilder;
  };
  _proto3.addFullscreenQuad = function addFullscreenQuad(material, passID, sceneFlags, name) {
    if (sceneFlags === void 0) {
      sceneFlags = SceneFlags.NONE;
    }
    if (name === void 0) {
      name = 'Quad';
    }
    this._renderGraph.addVertex(RenderGraphValue.Blit, renderGraphPool.createBlit(material, passID, sceneFlags, null), name, '', renderGraphPool.createRenderData(), false, this._vertID);
    this.getParentLayout();
    var scene = cclegacy.director.getScene();
    setCameraUBOValues(this, null, this._pipeline, scene ? scene.renderScene : null);
    if (sceneFlags & SceneFlags.SHADOW_CASTER) ; else {
      setShadowUBOView(this, null);
    }
  };
  _proto3.addCameraQuad = function addCameraQuad(camera, material, passID, sceneFlags) {
    if (sceneFlags === void 0) {
      sceneFlags = SceneFlags.NONE;
    }
    this._renderGraph.addVertex(RenderGraphValue.Blit, renderGraphPool.createBlit(material, passID, sceneFlags, camera), 'CameraQuad', '', renderGraphPool.createRenderData(), false, this._vertID);
    this.getParentLayout();
    var scene = cclegacy.director.getScene();
    setCameraUBOValues(this, camera, this._pipeline, camera.scene || (scene ? scene.renderScene : null));
    if (sceneFlags & SceneFlags.SHADOW_CASTER) ; else {
      setShadowUBOView(this, camera);
    }
  };
  _proto3.addDraw3D = function addDraw3D(camera, models, sceneFlags) {
    if (sceneFlags === void 0) {
      sceneFlags = SceneFlags.NON_BUILTIN;
    }
    var blit = renderGraphPool.createBlit(emptyMaterial, this._renderGraph.N, SceneFlags.NONE, camera, BlitType.DRAW_3D);
    for (var _iterator = _createForOfIteratorHelperLoose(models), _step; !(_step = _iterator()).done;) {
      var model = _step.value;
      blit.models.push(model);
    }
    this._renderGraph.addVertex(RenderGraphValue.Blit, blit, 'Draw3D', '', renderGraphPool.createRenderData(), false, this._vertID);
    if (!(sceneFlags & SceneFlags.NON_BUILTIN)) {
      this.getParentLayout();
      setCameraUBOValues(this, camera, this._pipeline, camera.scene);
      if (!(sceneFlags & SceneFlags.SHADOW_CASTER)) setShadowUBOView(this, camera);
    }
  };
  _proto3.addDraw2D = function addDraw2D(camera) {
    this.getParentLayout();
    setCameraUBOValues(this, camera, this._pipeline, camera.scene);
    this._renderGraph.addVertex(RenderGraphValue.Blit, renderGraphPool.createBlit(emptyMaterial, this._renderGraph.N, SceneFlags.NONE, camera, BlitType.DRAW_2D), 'Draw2D', '', emptyRenderData, false, this._vertID);
  };
  _proto3.addProfiler = function addProfiler(camera) {
    var passOrSubpassId = this._renderGraph.getParent(this._vertID);
    var queueId = this._renderGraph.addVertex(RenderGraphValue.Queue, this._queue, 'UI Queue', 'default', this._data, false, passOrSubpassId);
    var blitID = this._renderGraph.addVertex(RenderGraphValue.Blit, renderGraphPool.createBlit(emptyMaterial, this._renderGraph.N, SceneFlags.NONE, camera, BlitType.DRAW_PROFILE), 'Profiler', '', emptyRenderData, false, queueId);
    var data = this._renderGraph.getData(blitID);
    WebSetter.setMat4(this._lg, data, 'cc_matProj', camera.matProj);
  };
  _proto3.clearRenderTarget = function clearRenderTarget(name, color) {
    if (color === void 0) {
      color = new Color();
    }
    var clearView = renderGraphPool.createClearView(name, ClearFlagBit.COLOR);
    clearView.clearColor.copy(color);
    this._renderGraph.addVertex(RenderGraphValue.Clear, [clearView], 'ClearRenderTarget', '', renderGraphPool.createRenderData(), false, this._vertID);
  };
  _proto3.setViewport = function setViewport(viewport) {
    var currViewport = pipelinePool.viewport.add();
    this._queue.viewport = currViewport.copy(viewport);
  };
  _proto3.addCustomCommand = function addCustomCommand(customBehavior) {
    throw new Error('Method not implemented.');
  };
  return _createClass(WebRenderQueueBuilder, [{
    key: "name",
    get: function get() {
      return this._renderGraph.getName(this._vertID);
    },
    set: function set(name) {
      this._renderGraph.setName(this._vertID, name);
    }
  }]);
}(WebSetter);
var WebRenderSubpassBuilder = function (_WebSetter3) {
  function WebRenderSubpassBuilder(data, renderGraph, layoutGraph, vertID, subpass, pipeline) {
    var _this4;
    _this4 = _WebSetter3.call(this, data, layoutGraph) || this;
    _this4._renderGraph = void 0;
    _this4._layoutID = void 0;
    _this4._subpass = void 0;
    _this4._pipeline = void 0;
    _this4._renderGraph = renderGraph;
    _this4._vertID = vertID;
    _this4._subpass = subpass;
    _this4._pipeline = pipeline;
    var layoutName = _this4._renderGraph.getLayout(_this4._vertID);
    _this4._layoutID = layoutGraph.locateChild(layoutGraph.N, layoutName);
    return _this4;
  }
  _inheritsLoose(WebRenderSubpassBuilder, _WebSetter3);
  var _proto4 = WebRenderSubpassBuilder.prototype;
  _proto4.update = function update(data, renderGraph, layoutGraph, vertID, subpass, pipeline) {
    this._data = data;
    this._lg = layoutGraph;
    this._renderGraph = renderGraph;
    this._vertID = vertID;
    this._subpass = subpass;
    this._pipeline = pipeline;
    var layoutName = this._renderGraph.getLayout(this._vertID);
    this._layoutID = layoutGraph.locateChild(layoutGraph.N, layoutName);
  };
  _proto4.addRenderTarget = function addRenderTarget(name, accessType, slotName, loadOp, storeOp, color) {
    throw new Error('Method not implemented.');
  };
  _proto4.setCustomShaderStages = function setCustomShaderStages(name, stageFlags) {
    throw new Error('Method not implemented.');
  };
  _proto4.setArrayBuffer = function setArrayBuffer(name, arrayBuffer) {
    throw new Error('Method not implemented.');
  };
  _proto4.addDepthStencil = function addDepthStencil(name, accessType, depthSlotName, stencilSlotName, loadOp, storeOp, depth, stencil, clearFlag) {
    if (loadOp === void 0) {
      loadOp = LoadOp.CLEAR;
    }
    if (storeOp === void 0) {
      storeOp = StoreOp.STORE;
    }
    if (clearFlag === void 0) {
      clearFlag = ClearFlagBit.DEPTH_STENCIL;
    }
    throw new Error('Method not implemented.');
  };
  _proto4.addTexture = function addTexture(name, slotName, sampler) {
    throw new Error('Method not implemented.');
  };
  _proto4.addStorageBuffer = function addStorageBuffer(name, accessType, slotName) {
    throw new Error('Method not implemented.');
  };
  _proto4.addStorageImage = function addStorageImage(name, accessType, slotName) {
    throw new Error('Method not implemented.');
  };
  _proto4.setViewport = function setViewport(viewport) {
    throw new Error('Method not implemented.');
  };
  _proto4.addQueue = function addQueue(hint, layoutName, passName) {
    if (hint === void 0) {
      hint = QueueHint.RENDER_OPAQUE;
    }
    if (layoutName === void 0) {
      layoutName = 'default';
    }
    var layoutId = this._lg.locateChild(this._layoutID, layoutName);
    var queue = renderGraphPool.createRenderQueue(hint, layoutId);
    var data = renderGraphPool.createRenderData();
    var queueID = this._renderGraph.addVertex(RenderGraphValue.Queue, queue, '', layoutName, data, false, this._vertID);
    var queueBuilder = pipelinePool.renderQueueBuilder.add();
    queueBuilder.update(data, this._renderGraph, this._lg, queueID, queue, this._pipeline);
    return queueBuilder;
  };
  return _createClass(WebRenderSubpassBuilder, [{
    key: "name",
    get: function get() {
      return this._renderGraph.getName(this._vertID);
    },
    set: function set(name) {
      this._renderGraph.setName(this._vertID, name);
    }
  }, {
    key: "showStatistics",
    get: function get() {
      return this._subpass.showStatistics;
    },
    set: function set(enable) {
      this._subpass.showStatistics = enable;
    }
  }, {
    key: "subpassID",
    get: function get() {
      return this._vertID;
    }
  }, {
    key: "subpassLayoutID",
    get: function get() {
      return this._layoutID;
    }
  }]);
}(WebSetter);
var WebRenderPassBuilder = function (_WebSetter4) {
  function WebRenderPassBuilder(data, renderGraph, layoutGraph, resourceGraph, vertID, pass, pipeline) {
    var _this5;
    _this5 = _WebSetter4.call(this, data, layoutGraph) || this;
    _this5._renderGraph = void 0;
    _this5._layoutID = void 0;
    _this5._subpassID = void 0;
    _this5._pass = void 0;
    _this5._pipeline = void 0;
    _this5._resourceGraph = void 0;
    _this5._renderGraph = renderGraph;
    _this5._resourceGraph = resourceGraph;
    _this5._vertID = vertID;
    _this5._subpassID = -1;
    _this5._pass = pass;
    _this5._pipeline = pipeline;
    var layoutName = _this5._renderGraph.getLayout(_this5._vertID);
    _this5._layoutID = layoutGraph.locateChild(layoutGraph.N, layoutName);
    return _this5;
  }
  _inheritsLoose(WebRenderPassBuilder, _WebSetter4);
  var _proto5 = WebRenderPassBuilder.prototype;
  _proto5.update = function update(data, renderGraph, layoutGraph, resourceGraph, vertID, pass, pipeline) {
    this._renderGraph = renderGraph;
    this._lg = layoutGraph;
    this._resourceGraph = resourceGraph;
    this._vertID = vertID;
    this._pass = pass;
    this._pipeline = pipeline;
    this._data = data;
    var layoutName = this._renderGraph.getLayout(this._vertID);
    this._layoutID = layoutGraph.locateChild(layoutGraph.N, layoutName);
  };
  _proto5.setCustomShaderStages = function setCustomShaderStages(name, stageFlags) {
    throw new Error('Method not implemented.');
  };
  _proto5.setArrayBuffer = function setArrayBuffer(name, arrayBuffer) {
    throw new Error('Method not implemented.');
  };
  _proto5.setVersion = function setVersion(name, version) {
    this._pass.versionName = name;
    this._pass.version = version;
  };
  _proto5.addRenderTarget = function addRenderTarget(name, loadOp, storeOp, clearColor) {
    if (loadOp === void 0) {
      loadOp = LoadOp.CLEAR;
    }
    if (storeOp === void 0) {
      storeOp = StoreOp.STORE;
    }
    if (clearColor === void 0) {
      clearColor = new Color();
    }
    var clearFlag = ClearFlagBit.COLOR;
    if (loadOp === LoadOp.LOAD) {
      clearFlag = ClearFlagBit.NONE;
    }
    var view = renderGraphPool.createRasterView('', AccessType.WRITE, AttachmentType.RENDER_TARGET, loadOp, storeOp, clearFlag);
    view.clearColor.copy(clearColor);
    this._pass.rasterViews.set(name, view);
  };
  _proto5.addDepthStencil = function addDepthStencil(name, loadOp, storeOp, depth, stencil, clearFlag) {
    if (loadOp === void 0) {
      loadOp = LoadOp.CLEAR;
    }
    if (storeOp === void 0) {
      storeOp = StoreOp.STORE;
    }
    if (depth === void 0) {
      depth = 1;
    }
    if (stencil === void 0) {
      stencil = 0;
    }
    if (clearFlag === void 0) {
      clearFlag = ClearFlagBit.DEPTH_STENCIL;
    }
    var view = renderGraphPool.createRasterView('', AccessType.WRITE, AttachmentType.DEPTH_STENCIL, loadOp, storeOp, clearFlag);
    view.clearColor.set(depth, stencil, 0, 0);
    this._pass.rasterViews.set(name, view);
  };
  _proto5.resolveRenderTarget = function resolveRenderTarget(source, target) {
    assert(this._subpassID !== -1);
    var nodeId = this._vertID;
    var rasterPass = this._renderGraph.object(nodeId);
    var subpass = this._renderGraph.object(this._subpassID);
    var subpassData = rasterPass.subpassGraph.getSubpass(subpass.subpassID);
    var resolve = pipelinePool.resolvePair.add();
    resolve.reset(source, target, ResolveFlags.COLOR, ResolveMode.AVERAGE, ResolveMode.NONE);
    subpass.resolvePairs.push(resolve);
    subpassData.resolvePairs.push(resolve);
  };
  _proto5.resolveDepthStencil = function resolveDepthStencil(source, target, depthMode, stencilMode) {
    assert(this._subpassID !== -1);
    var subpass = this._renderGraph.object(this._subpassID);
    var flags = ResolveFlags.NONE;
    if (depthMode !== ResolveMode.NONE) {
      flags |= ResolveFlags.DEPTH;
    }
    if (stencilMode !== ResolveMode.NONE) {
      flags |= ResolveFlags.STENCIL;
    }
    var pass = this._renderGraph.object(this._vertID);
    var subpassData = pass.subpassGraph.getSubpass(subpass.subpassID);
    var resolve = pipelinePool.resolvePair.add();
    resolve.reset(source, target, flags, depthMode, stencilMode);
    subpass.resolvePairs.push(resolve);
    subpassData.resolvePairs.push(resolve);
  };
  _proto5._addComputeResource = function _addComputeResource(name, accessType, slotName) {
    var view = renderGraphPool.createComputeView(slotName);
    view.accessType = accessType;
    if (this._pass.computeViews.has(name)) {
      var _this$_pass$computeVi;
      (_this$_pass$computeVi = this._pass.computeViews.get(name)) == null ? void 0 : _this$_pass$computeVi.push(view);
    } else {
      this._pass.computeViews.set(name, [view]);
    }
  };
  _proto5.addTexture = function addTexture(name, slotName, sampler) {
    if (sampler === void 0) {
      sampler = null;
    }
    this._addComputeResource(name, AccessType.READ, slotName);
    if (sampler) {
      var descriptorID = this._lg.attributeIndex.get(slotName);
      this._data.samplers.set(descriptorID, sampler);
    }
  };
  _proto5.addStorageBuffer = function addStorageBuffer(name, accessType, slotName) {
    this._addComputeResource(name, accessType, slotName);
  };
  _proto5.addStorageImage = function addStorageImage(name, accessType, slotName) {
    this._addComputeResource(name, accessType, slotName);
  };
  _proto5.addRenderSubpass = function addRenderSubpass(layoutName) {
    if (layoutName === void 0) {
      layoutName = '';
    }
    var name = 'Raster';
    var subpassID = this._pass.subpassGraph.nv();
    this._pass.subpassGraph.addVertex(name, renderGraphPool.createSubpass());
    var subpass = renderGraphPool.createRasterSubpass(subpassID, 1, 0);
    var data = renderGraphPool.createRenderData();
    var vertID = this._renderGraph.addVertex(RenderGraphValue.RasterSubpass, subpass, name, layoutName, data, false);
    this._subpassID = vertID;
    var result = pipelinePool.renderSubpassBuilder.add();
    result.update(data, this._renderGraph, this._lg, vertID, subpass, this._pipeline);
    return result;
  };
  _proto5.addQueue = function addQueue(hint, layoutName, passName) {
    if (hint === void 0) {
      hint = QueueHint.RENDER_OPAQUE;
    }
    if (layoutName === void 0) {
      layoutName = 'default';
    }
    var layoutId = this._lg.locateChild(this._layoutID, layoutName);
    var queue = renderGraphPool.createRenderQueue(hint, layoutId);
    var data = renderGraphPool.createRenderData();
    var queueID = this._renderGraph.addVertex(RenderGraphValue.Queue, queue, '', layoutName, data, false, this._vertID);
    var result = pipelinePool.renderQueueBuilder.add();
    result.update(data, this._renderGraph, this._lg, queueID, queue, this._pipeline);
    return result;
  };
  _proto5.addFullscreenQuad = function addFullscreenQuad(material, passID, sceneFlags, name) {
    if (sceneFlags === void 0) {
      sceneFlags = SceneFlags.NONE;
    }
    if (name === void 0) {
      name = 'FullscreenQuad';
    }
    var queue = renderGraphPool.createRenderQueue(QueueHint.RENDER_TRANSPARENT);
    var queueId = this._renderGraph.addVertex(RenderGraphValue.Queue, queue, 'Queue', '', renderGraphPool.createRenderData(), false, this._vertID);
    this._renderGraph.addVertex(RenderGraphValue.Blit, renderGraphPool.createBlit(material, passID, sceneFlags, null), name, '', renderGraphPool.createRenderData(), false, queueId);
  };
  _proto5.addCameraQuad = function addCameraQuad(camera, material, passID, sceneFlags, name) {
    if (name === void 0) {
      name = 'CameraQuad';
    }
    var queue = renderGraphPool.createRenderQueue(QueueHint.RENDER_TRANSPARENT);
    var queueId = this._renderGraph.addVertex(RenderGraphValue.Queue, queue, 'Queue', '', renderGraphPool.createRenderData(), false, this._vertID);
    this._renderGraph.addVertex(RenderGraphValue.Blit, renderGraphPool.createBlit(material, passID, sceneFlags, camera), name, '', renderGraphPool.createRenderData(), false, queueId);
  };
  _proto5.setViewport = function setViewport(viewport) {
    this._pass.viewport.copy(viewport);
  };
  return _createClass(WebRenderPassBuilder, [{
    key: "name",
    get: function get() {
      return this._renderGraph.getName(this._vertID);
    },
    set: function set(name) {
      this._renderGraph.setName(this._vertID, name);
    }
  }, {
    key: "passID",
    get: function get() {
      return this._vertID;
    }
  }, {
    key: "passLayoutID",
    get: function get() {
      return this._layoutID;
    }
  }, {
    key: "showStatistics",
    get: function get() {
      return this._pass.showStatistics;
    },
    set: function set(enable) {
      this._pass.showStatistics = enable;
    }
  }]);
}(WebSetter);
var WebComputeQueueBuilder = function (_WebSetter5) {
  function WebComputeQueueBuilder(data, renderGraph, layoutGraph, vertID, queue, pipeline) {
    var _this6;
    _this6 = _WebSetter5.call(this, data, layoutGraph) || this;
    _this6._renderGraph = void 0;
    _this6._queue = void 0;
    _this6._pipeline = void 0;
    _this6._renderGraph = renderGraph;
    _this6._vertID = vertID;
    _this6._queue = queue;
    _this6._pipeline = pipeline;
    return _this6;
  }
  _inheritsLoose(WebComputeQueueBuilder, _WebSetter5);
  var _proto6 = WebComputeQueueBuilder.prototype;
  _proto6.update = function update(data, renderGraph, layoutGraph, vertID, queue, pipeline) {
    this._data = data;
    this._lg = layoutGraph;
    this._renderGraph = renderGraph;
    this._vertID = vertID;
    this._queue = queue;
    this._pipeline = pipeline;
  };
  _proto6.setArrayBuffer = function setArrayBuffer(name, arrayBuffer) {
    throw new Error('Method not implemented.');
  };
  _proto6.addDispatch = function addDispatch(threadGroupCountX, threadGroupCountY, threadGroupCountZ, material, passID, name) {
    if (material === void 0) {
      material = null;
    }
    if (passID === void 0) {
      passID = 0;
    }
    if (name === void 0) {
      name = 'Dispatch';
    }
    this._renderGraph.addVertex(RenderGraphValue.Dispatch, renderGraphPool.createDispatch(material, passID, threadGroupCountX, threadGroupCountY, threadGroupCountZ), name, '', renderGraphPool.createRenderData(), false, this._vertID);
  };
  return _createClass(WebComputeQueueBuilder, [{
    key: "name",
    get: function get() {
      return this._renderGraph.getName(this._vertID);
    },
    set: function set(name) {
      this._renderGraph.setName(this._vertID, name);
    }
  }]);
}(WebSetter);
var WebComputePassBuilder = function (_WebSetter6) {
  function WebComputePassBuilder(data, renderGraph, layoutGraph, resourceGraph, vertID, pass, pipeline) {
    var _this7;
    _this7 = _WebSetter6.call(this, data, layoutGraph) || this;
    _this7._renderGraph = void 0;
    _this7._resourceGraph = void 0;
    _this7._layoutID = void 0;
    _this7._pass = void 0;
    _this7._pipeline = void 0;
    _this7._renderGraph = renderGraph;
    _this7._resourceGraph = resourceGraph;
    _this7._vertID = vertID;
    _this7._pass = pass;
    _this7._pipeline = pipeline;
    var layoutName = _this7._renderGraph.getLayout(_this7._vertID);
    _this7._layoutID = layoutGraph.locateChild(layoutGraph.N, layoutName);
    return _this7;
  }
  _inheritsLoose(WebComputePassBuilder, _WebSetter6);
  var _proto7 = WebComputePassBuilder.prototype;
  _proto7.update = function update(data, renderGraph, layoutGraph, resourceGraph, vertID, pass, pipeline) {
    this._data = data;
    this._renderGraph = renderGraph;
    this._lg = layoutGraph;
    this._resourceGraph = resourceGraph;
    this._vertID = vertID;
    this._pass = pass;
    this._pipeline = pipeline;
    var layoutName = this._renderGraph.getLayout(this._vertID);
    this._layoutID = layoutGraph.locateChild(layoutGraph.N, layoutName);
  };
  _proto7.setCustomShaderStages = function setCustomShaderStages(name, stageFlags) {
    throw new Error('Method not implemented.');
  };
  _proto7.setArrayBuffer = function setArrayBuffer(name, arrayBuffer) {
    throw new Error('Method not implemented.');
  };
  _proto7.addTexture = function addTexture(name, slotName, sampler) {
    throw new Error('Method not implemented.');
  };
  _proto7.addStorageBuffer = function addStorageBuffer(name, accessType, slotName) {
    this._addComputeResource(name, accessType, slotName);
  };
  _proto7.addStorageImage = function addStorageImage(name, accessType, slotName) {
    this._addComputeResource(name, accessType, slotName);
  };
  _proto7.addMaterialTexture = function addMaterialTexture(resourceName, flags) {
    throw new Error('Method not implemented.');
  };
  _proto7.addQueue = function addQueue(layoutName, passName) {
    if (layoutName === void 0) {
      layoutName = 'default';
    }
    var layoutId = this._lg.locateChild(this._layoutID, layoutName);
    var queue = renderGraphPool.createRenderQueue(QueueHint.RENDER_OPAQUE, layoutId);
    var data = renderGraphPool.createRenderData();
    var queueID = this._renderGraph.addVertex(RenderGraphValue.Queue, queue, '', layoutName, data, false, this._vertID);
    var computeQueueBuilder = pipelinePool.computeQueueBuilder.add();
    computeQueueBuilder.update(data, this._renderGraph, this._lg, queueID, queue, this._pipeline);
    return computeQueueBuilder;
  };
  _proto7._addComputeResource = function _addComputeResource(name, accessType, slotName) {
    var view = renderGraphPool.createComputeView(slotName);
    view.accessType = accessType;
    if (this._pass.computeViews.has(name)) {
      var _this$_pass$computeVi2;
      (_this$_pass$computeVi2 = this._pass.computeViews.get(name)) == null ? void 0 : _this$_pass$computeVi2.push(view);
    } else {
      this._pass.computeViews.set(name, [view]);
    }
  };
  return _createClass(WebComputePassBuilder, [{
    key: "name",
    get: function get() {
      return this._renderGraph.getName(this._vertID);
    },
    set: function set(name) {
      this._renderGraph.setName(this._vertID, name);
    }
  }]);
}(WebSetter);
(function () {
  function WebMovePassBuilder(renderGraph, vertID, pass) {
    this._renderGraph = void 0;
    this._vertID = void 0;
    this._pass = void 0;
    this._renderGraph = renderGraph;
    this._vertID = vertID;
    this._pass = pass;
  }
  var _proto8 = WebMovePassBuilder.prototype;
  _proto8.setCustomBehavior = function setCustomBehavior(name) {
    throw new Error('Method not implemented.');
  };
  _proto8.addPair = function addPair(pair) {
    this._pass.movePairs.push(pair);
  };
  return _createClass(WebMovePassBuilder, [{
    key: "name",
    get: function get() {
      return this._renderGraph.getName(this._vertID);
    },
    set: function set(name) {
      this._renderGraph.setName(this._vertID, name);
    }
  }]);
})();
(function () {
  function WebCopyPassBuilder(renderGraph, vertID, pass) {
    this._renderGraph = void 0;
    this._vertID = void 0;
    this._pass = void 0;
    this._renderGraph = renderGraph;
    this._vertID = vertID;
    this._pass = pass;
  }
  var _proto9 = WebCopyPassBuilder.prototype;
  _proto9.addPair = function addPair(pair) {
    throw new Error('Method not implemented.');
  };
  _proto9.setCustomBehavior = function setCustomBehavior(name) {
    throw new Error('Method not implemented.');
  };
  return _createClass(WebCopyPassBuilder, [{
    key: "name",
    get: function get() {
      return this._renderGraph.getName(this._vertID);
    },
    set: function set(name) {
      this._renderGraph.setName(this._vertID, name);
    }
  }]);
})();
var WebPipeline = function (_WebSetter7) {
  function WebPipeline(layoutGraph) {
    var _this8;
    _this8 = _WebSetter7.call(this, new RenderData(), layoutGraph) || this;
    _this8.globalDSManager = void 0;
    _this8.descriptorSetLayout = void 0;
    _this8.descriptorSet = void 0;
    _this8._width = 0;
    _this8._height = 0;
    _this8._usesDeferredPipeline = false;
    _this8._copyPassMat = new Material();
    _this8._device = void 0;
    _this8._defaultSampler = void 0;
    _this8._profilerDescriptorSet = null;
    _this8._macros = {};
    _this8._pipelineSceneData = new PipelineSceneData();
    _this8._constantMacros = '';
    _this8._lightingMode = LightingMode.DEFAULT;
    _this8._profiler = null;
    _this8._cameras = [];
    _this8._resourceUses = [];
    _this8._resourceGraph = new ResourceGraph();
    _this8._renderGraph = null;
    _this8._compiler = null;
    _this8._executor = null;
    _this8._customPipelineName = '';
    _this8._globalDescSetData = void 0;
    _this8._combineSignY = 0;
    _this8._renderGraph = new RenderGraph();
    _this8._data = _this8._renderGraph.globalRenderData;
    return _this8;
  }
  _inheritsLoose(WebPipeline, _WebSetter7);
  var _proto0 = WebPipeline.prototype;
  _proto0.addCustomBuffer = function addCustomBuffer(name, info, type) {
    throw new Error('Method not implemented.');
  };
  _proto0.addCustomTexture = function addCustomTexture(name, info, type) {
    throw new Error('Method not implemented.');
  };
  _proto0.tryAddRenderWindowDepthStencil = function tryAddRenderWindowDepthStencil(width, height, depthStencilName, swapchain) {
    if (!depthStencilName) {
      return;
    }
    if (swapchain) {
      this.addDepthStencilImpl(depthStencilName, swapchain.depthStencilTexture.format, width, height, ResourceResidency.BACKBUFFER, swapchain);
    } else {
      this.addDepthStencilImpl(depthStencilName, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
    }
  };
  _proto0.addRenderWindow = function addRenderWindow(name, format, width, height, renderWindow, depthStencilName) {
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.updateRenderWindow(name, renderWindow, depthStencilName);
      return resID;
    }
    this.tryAddRenderWindowDepthStencil(width, height, depthStencilName, renderWindow.swapchain);
    var desc = new ResourceDesc();
    desc.dimension = ResourceDimension.TEXTURE2D;
    desc.width = width;
    desc.height = height;
    desc.depthOrArraySize = 1;
    desc.mipLevels = 1;
    desc.format = renderWindow.framebuffer.colorTextures[0].format;
    desc.flags = ResourceFlags.COLOR_ATTACHMENT;
    if (!renderWindow.swapchain) {
      desc.sampleCount = renderWindow.framebuffer.colorTextures[0].info.samples;
      return this._resourceGraph.addVertex(ResourceGraphValue.Framebuffer, renderWindow.framebuffer, name, desc, new ResourceTraits(ResourceResidency.EXTERNAL), new ResourceStates(), new SamplerInfo());
    } else {
      return this._resourceGraph.addVertex(ResourceGraphValue.Swapchain, new RenderSwapchain(renderWindow.swapchain), name, desc, new ResourceTraits(ResourceResidency.BACKBUFFER), new ResourceStates(), new SamplerInfo());
    }
  };
  _proto0.updateRenderWindow = function updateRenderWindow(name, renderWindow, depthStencilName) {
    var resId = this.resourceGraph.vertex(name);
    var desc = this.resourceGraph.getDesc(resId);
    desc.width = renderWindow.width;
    desc.height = renderWindow.height;
    var currFbo = this.resourceGraph.object(resId);
    if (currFbo !== renderWindow.framebuffer) {
      this.resourceGraph.x[resId].j = renderWindow.framebuffer;
    }
    this.tryAddRenderWindowDepthStencil(renderWindow.width, renderWindow.height, depthStencilName, renderWindow.swapchain);
  };
  _proto0.updateStorageBuffer = function updateStorageBuffer(name, size, format) {
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    var resId = this.resourceGraph.vertex(name);
    var desc = this.resourceGraph.getDesc(resId);
    desc.width = size;
    if (format !== Format.UNKNOWN) {
      desc.format = format;
    }
  };
  _proto0.updateRenderTarget = function updateRenderTarget(name, width, height, format) {
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    var resId = this.resourceGraph.vertex(name);
    var desc = this.resourceGraph.getDesc(resId);
    desc.width = width;
    desc.height = height;
    if (format !== Format.UNKNOWN) desc.format = format;
  };
  _proto0.updateDepthStencil = function updateDepthStencil(name, width, height, format) {
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    var resId = this.resourceGraph.find(name);
    if (resId === 0xFFFFFFFF) {
      return;
    }
    this.updateDepthStencilImpl(resId, width, height, format);
  };
  _proto0.updateStorageTexture = function updateStorageTexture(name, width, height, format) {
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    var resId = this.resourceGraph.vertex(name);
    var desc = this.resourceGraph.getDesc(resId);
    desc.width = width;
    desc.height = height;
    if (format !== Format.UNKNOWN) {
      desc.format = format;
    }
  };
  _proto0.updateShadingRateTexture = function updateShadingRateTexture(name, width, height) {
    var resId = this.resourceGraph.vertex(name);
    var desc = this.resourceGraph.getDesc(resId);
    desc.width = width;
    desc.height = height;
  };
  _proto0.addBuffer = function addBuffer(name, size, flags, residency) {
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.updateBuffer(name, size);
      return resID;
    }
    var desc = new ResourceDesc();
    desc.dimension = ResourceDimension.BUFFER;
    desc.width = size;
    desc.flags = flags;
    return this._resourceGraph.addVertex(ResourceGraphValue.Managed, new ManagedResource(), name, desc, new ResourceTraits(residency), new ResourceStates(), new SamplerInfo(Filter.LINEAR, Filter.LINEAR, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP));
  };
  _proto0.updateBuffer = function updateBuffer(name, size) {
    this.updateResource(name, Format.UNKNOWN, size, 0, 0, 0, 0, SampleCount.X1);
  };
  _proto0.addExternalTexture = function addExternalTexture(name, texture, flags) {
    throw new Error('Method not implemented.');
  };
  _proto0.updateExternalTexture = function updateExternalTexture(name, texture) {
    throw new Error('Method not implemented.');
  };
  _proto0.addTexture = function addTexture(name, textureType, format, width, height, depth, arraySize, mipLevels, sampleCount, flags, residency) {
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.updateTexture(name, format, width, height, depth, arraySize, mipLevels, sampleCount);
      return resID;
    }
    var desc = new ResourceDesc();
    desc.dimension = getResourceDimension(textureType);
    desc.width = width;
    desc.height = height;
    desc.depthOrArraySize = desc.dimension === ResourceDimension.TEXTURE3D ? depth : arraySize;
    desc.mipLevels = mipLevels;
    desc.format = format;
    desc.sampleCount = sampleCount;
    desc.flags = flags;
    desc.viewType = textureType;
    return this._resourceGraph.addVertex(ResourceGraphValue.Managed, new ManagedResource(), name, desc, new ResourceTraits(residency), new ResourceStates(), new SamplerInfo(Filter.LINEAR, Filter.LINEAR, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP));
  };
  _proto0.updateTexture = function updateTexture(name, format, width, height, depth, arraySize, mipLevels, sampleCount) {
    this.updateResource(name, format, width, height, depth, arraySize, mipLevels, sampleCount);
  };
  _proto0.addResource = function addResource(name, dimension, format, width, height, depth, arraySize, mipLevels, sampleCount, flags, residency) {
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.updateResource(name, format, width, height, depth, arraySize, mipLevels, sampleCount);
      return resID;
    }
    if (dimension === ResourceDimension.BUFFER) {
      return this.addBuffer(name, width, flags, residency);
    } else {
      return this.addTexture(name, getTextureType(dimension, arraySize), format, width, height, depth, arraySize, mipLevels, sampleCount, flags, residency);
    }
  };
  _proto0.updateResource = function updateResource(name, format, width, height, depth, arraySize, mipLevels, sampleCount) {
    var resId = this.resourceGraph.vertex(name);
    var desc = this.resourceGraph.getDesc(resId);
    desc.width = width;
    desc.height = height;
    desc.depthOrArraySize = desc.dimension === ResourceDimension.TEXTURE3D ? depth : arraySize;
    desc.mipLevels = mipLevels;
    if (format !== Format.UNKNOWN) {
      desc.format = format;
    }
    desc.sampleCount = sampleCount;
  };
  _proto0.containsResource = function containsResource(name) {
    return this._resourceGraph.contains(name);
  };
  _proto0.addResolvePass = function addResolvePass(resolvePairs) {
    throw new Error('Method not implemented.');
  };
  _proto0.addComputePass = function addComputePass(passName) {
    var name = 'Compute';
    var pass = renderGraphPool.createComputePass();
    var data = renderGraphPool.createRenderData();
    var vertID = this._renderGraph.addVertex(RenderGraphValue.Compute, pass, name, passName, data, false);
    var result = pipelinePool.computePassBuilder.add();
    result.update(data, this._renderGraph, this._lg, this._resourceGraph, vertID, pass, this._pipelineSceneData);
    setComputeConstants();
    return result;
  };
  _proto0.addUploadPass = function addUploadPass(uploadPairs) {
    var name = 'UploadPass';
    var pass = renderGraphPool.createCopyPass();
    for (var _iterator2 = _createForOfIteratorHelperLoose(uploadPairs), _step2; !(_step2 = _iterator2()).done;) {
      var up = _step2.value;
      pass.uploadPairs.push(up);
    }
    this._renderGraph.addVertex(RenderGraphValue.Copy, pass, name, '', renderGraphPool.createRenderData(), false);
  };
  _proto0.addCopyPass = function addCopyPass(copyPairs) {
    for (var _iterator3 = _createForOfIteratorHelperLoose(copyPairs), _step3; !(_step3 = _iterator3()).done;) {
      var pair = _step3.value;
      var targetName = pair.target;
      var tarVerId = this.resourceGraph.find(targetName);
      var resDesc = this.resourceGraph.getDesc(tarVerId);
      var currRaster = this.addRenderPass(resDesc.width, resDesc.height, 'copy-pass');
      currRaster.addRenderTarget(targetName, LoadOp.CLEAR, StoreOp.STORE, pipelinePool.createColor());
      currRaster.setFloat('flip', this.getCombineSignY());
      currRaster.addTexture(pair.source, 'outputResultMap');
      currRaster.addQueue(QueueHint.NONE).addFullscreenQuad(this._copyPassMat, 0, SceneFlags.NONE);
    }
  };
  _proto0._generateConstantMacros = function _generateConstantMacros(clusterEnabled) {
    var str = '';
    str += "#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE " + (this._device.getFormatFeatures(Format.RGBA32F) & (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE) ? 1 : 0) + "\n";
    str += "#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS " + this._device.capabilities.maxVertexUniformVectors + "\n";
    str += "#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS " + this._device.capabilities.maxFragmentUniformVectors + "\n";
    str += "#define CC_DEVICE_CAN_BENEFIT_FROM_INPUT_ATTACHMENT " + (this._device.hasFeature(Feature.INPUT_ATTACHMENT_BENEFIT) ? 1 : 0) + "\n";
    str += "#define CC_PLATFORM_ANDROID_AND_WEBGL " + (systemInfo.os === OS.ANDROID && systemInfo.isBrowser ? 1 : 0) + "\n";
    str += "#define CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES " + (macro.ENABLE_WEBGL_HIGHP_STRUCT_VALUES ? 1 : 0) + "\n";
    var jointUniformCapacity = UBOSkinning.JOINT_UNIFORM_CAPACITY;
    str += "#define CC_JOINT_UNIFORM_CAPACITY " + jointUniformCapacity + "\n";
    this._constantMacros = str;
    this._lg.constantMacros = this._constantMacros;
  };
  _proto0.setCustomPipelineName = function setCustomPipelineName(name) {
    this._customPipelineName = name;
    if (this._customPipelineName === 'Deferred') {
      this._usesDeferredPipeline = true;
    }
  };
  _proto0.getGlobalDescriptorSetData = function getGlobalDescriptorSetData() {
    var stageId = this.layoutGraph.locateChild(this.layoutGraph.N, 'default');
    var layout = this.layoutGraph.getLayout(stageId);
    var layoutData = layout.getSet(UpdateFrequency.PER_PASS);
    return layoutData;
  };
  _proto0._initCombineSignY = function _initCombineSignY() {
    var device = this._device;
    this._combineSignY = device.capabilities.screenSpaceSignY * 0.5 + 0.5 << 1 | device.capabilities.clipSpaceSignY * 0.5 + 0.5;
  };
  _proto0.getCombineSignY = function getCombineSignY() {
    return this._combineSignY;
  };
  _proto0._compileMaterial = function _compileMaterial() {
    this._copyPassMat.initialize({
      effectName: 'pipeline/copy-pass'
    });
    for (var i = 0; i < this._copyPassMat.passes.length; ++i) {
      this._copyPassMat.passes[i].tryCompile();
    }
  };
  _proto0.activate = function activate(swapchain) {
    this._device = deviceManager.gfxDevice;
    pipelinePool = new PipelinePool();
    renderGraphPool = pipelinePool.renderGraphPool;
    createGfxDescriptorSetsAndPipelines(this._device, this._lg);
    this._compileMaterial();
    this.setMacroBool('CC_USE_HDR', this._pipelineSceneData.isHDR);
    this.setMacroBool('CC_USE_FLOAT_OUTPUT', macro.ENABLE_FLOAT_OUTPUT && supportsRGBA16HalfFloatTexture(this._device));
    this._generateConstantMacros(false);
    this._pipelineSceneData.activate(this._device);
    this._initCombineSignY();
    var isFloat = supportsR32FloatTexture(this._device) ? 0 : 1;
    this.setMacroInt('CC_SHADOWMAP_FORMAT', isFloat);
    var isLinear = this._device.gfxAPI === API.WEBGL ? 1 : 0;
    this.setMacroInt('CC_SHADOWMAP_USE_LINEAR_DEPTH', isLinear);
    var director = cclegacy.director;
    var root = director.root;
    this._defaultSampler = root.device.getSampler(_samplerPointInfo);
    this.pipelineSceneData.csmSupported = this.device.capabilities.maxFragmentUniformVectors >= WebPipeline.CSM_UNIFORM_VECTORS + WebPipeline.GLOBAL_UNIFORM_VECTORS;
    this.setMacroBool('CC_SUPPORT_CASCADED_SHADOW_MAP', this.pipelineSceneData.csmSupported);
    this.setMacroInt('CC_SHADOW_TYPE', 0);
    this.setMacroInt('CC_DIR_SHADOW_PCF_TYPE', PCFType.HARD);
    this.setMacroInt('CC_DIR_LIGHT_SHADOW_TYPE', 0);
    this.setMacroBool('CC_CASCADED_LAYERS_TRANSITION', false);
    if (this.usesDeferredPipeline) {
      this.setMacroInt('CC_PIPELINE_TYPE', 1);
    }
    return true;
  };
  _proto0.destroy = function destroy() {
    var _this$_pipelineSceneD;
    (_this$_pipelineSceneD = this._pipelineSceneData) == null ? void 0 : _this$_pipelineSceneD.destroy();
    return true;
  };
  _proto0.getMacroString = function getMacroString(name) {
    var str = this._macros[name];
    if (str === undefined) {
      return '';
    }
    return str;
  };
  _proto0.getMacroInt = function getMacroInt(name) {
    var value = this._macros[name];
    if (value === undefined) {
      return 0;
    }
    return value;
  };
  _proto0.getMacroBool = function getMacroBool(name) {
    var value = this._macros[name];
    if (value === undefined) {
      return false;
    }
    return value;
  };
  _proto0.getSamplerInfo = function getSamplerInfo(name) {
    if (this.containsResource(name)) {
      var verId = this._resourceGraph.vertex(name);
      return this._resourceGraph.getSampler(verId);
    }
    return null;
  };
  _proto0.setMacroString = function setMacroString(name, value) {
    this._macros[name] = value;
  };
  _proto0.setMacroInt = function setMacroInt(name, value) {
    this._macros[name] = value;
  };
  _proto0.setMacroBool = function setMacroBool(name, value) {
    this._macros[name] = value;
  };
  _proto0.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {
    var builder = cclegacy.rendering.getCustomPipeline(macro.CUSTOM_PIPELINE_NAME);
    if (builder) {
      if (typeof builder.onGlobalPipelineStateChanged === 'function') {
        builder.onGlobalPipelineStateChanged();
      }
      cclegacy.rendering.forceResizeAllWindows();
    }
  };
  _proto0.beginSetup = function beginSetup() {
    if (!this._renderGraph) {
      this._renderGraph = new RenderGraph();
      this._data = this._renderGraph.globalRenderData;
    }
    pipelinePool.reset();
  };
  _proto0.endSetup = function endSetup() {
    this.compile();
  };
  _proto0.addStorageBuffer = function addStorageBuffer(name, format, size, residency) {
    if (residency === void 0) {
      residency = ResourceResidency.MANAGED;
    }
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.updateStorageBuffer(name, size, format);
      return resID;
    }
    var desc = new ResourceDesc();
    desc.dimension = ResourceDimension.BUFFER;
    desc.width = size;
    desc.height = 1;
    desc.depthOrArraySize = 1;
    desc.mipLevels = 1;
    desc.format = format;
    desc.flags = ResourceFlags.STORAGE;
    if (residency === ResourceResidency.PERSISTENT) {
      return this._resourceGraph.addVertex(ResourceGraphValue.PersistentBuffer, new PersistentBuffer(), name, desc, new ResourceTraits(ResourceResidency.PERSISTENT), new ResourceStates(), new SamplerInfo());
    }
    return this._resourceGraph.addVertex(ResourceGraphValue.ManagedBuffer, new ManagedBuffer(), name, desc, new ResourceTraits(residency), new ResourceStates(), new SamplerInfo());
  };
  _proto0.addRenderTarget = function addRenderTarget(name, format, width, height, residency) {
    if (residency === void 0) {
      residency = ResourceResidency.MANAGED;
    }
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.updateRenderTarget(name, width, height, format);
      return resID;
    }
    var desc = new ResourceDesc();
    desc.dimension = ResourceDimension.TEXTURE2D;
    desc.width = width;
    desc.height = height;
    desc.depthOrArraySize = 1;
    desc.mipLevels = 1;
    desc.format = format;
    desc.sampleCount = SampleCount.X1;
    desc.flags = ResourceFlags.COLOR_ATTACHMENT | ResourceFlags.SAMPLED;
    return this._resourceGraph.addVertex(ResourceGraphValue.Managed, new ManagedResource(), name, desc, new ResourceTraits(residency), new ResourceStates(), new SamplerInfo(Filter.LINEAR, Filter.LINEAR, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP));
  };
  _proto0.updateDepthStencilImpl = function updateDepthStencilImpl(resId, width, height, format, swapchain) {
    var desc = this.resourceGraph.getDesc(resId);
    desc.width = width;
    desc.height = height;
    if (swapchain) {
      var sc = this.resourceGraph.j(resId);
      sc.swapchain = swapchain;
      desc.format = sc.swapchain.depthStencilTexture.format;
    } else if (format !== Format.UNKNOWN) {
      desc.format = format;
    }
  };
  _proto0.addDepthStencilImpl = function addDepthStencilImpl(name, format, width, height, residency, swapchain) {
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.updateDepthStencilImpl(resID, width, height, format, swapchain);
      return resID;
    }
    var desc = new ResourceDesc();
    desc.dimension = ResourceDimension.TEXTURE2D;
    desc.width = width;
    desc.height = height;
    desc.depthOrArraySize = 1;
    desc.mipLevels = 1;
    desc.format = format;
    desc.sampleCount = SampleCount.X1;
    desc.flags = ResourceFlags.DEPTH_STENCIL_ATTACHMENT | ResourceFlags.SAMPLED;
    if (swapchain) {
      return this._resourceGraph.addVertex(ResourceGraphValue.Swapchain, new RenderSwapchain(swapchain, true), name, desc, new ResourceTraits(residency), new ResourceStates(), new SamplerInfo(Filter.POINT, Filter.POINT, Filter.NONE));
    } else {
      return this._resourceGraph.addVertex(ResourceGraphValue.Managed, new ManagedResource(), name, desc, new ResourceTraits(residency), new ResourceStates(), new SamplerInfo(Filter.POINT, Filter.POINT, Filter.NONE));
    }
  };
  _proto0.addDepthStencil = function addDepthStencil(name, format, width, height, residency) {
    if (residency === void 0) {
      residency = ResourceResidency.MANAGED;
    }
    return this.addDepthStencilImpl(name, format, width, height, residency);
  };
  _proto0.addStorageTexture = function addStorageTexture(name, format, width, height, residency) {
    if (residency === void 0) {
      residency = ResourceResidency.MANAGED;
    }
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.updateStorageTexture(name, width, height, format);
      return resID;
    }
    var desc = new ResourceDesc();
    desc.dimension = ResourceDimension.TEXTURE2D;
    desc.width = width;
    desc.height = height;
    desc.depthOrArraySize = 1;
    desc.mipLevels = 1;
    desc.format = format;
    desc.flags = ResourceFlags.STORAGE | ResourceFlags.SAMPLED;
    return this._resourceGraph.addVertex(ResourceGraphValue.Managed, new ManagedResource(), name, desc, new ResourceTraits(residency), new ResourceStates(), new SamplerInfo(Filter.POINT, Filter.POINT, Filter.NONE));
  };
  _proto0.addShadingRateTexture = function addShadingRateTexture(name, width, height, residency) {
    if (residency === void 0) {
      residency = ResourceResidency.MANAGED;
    }
    var resID = this._resourceGraph.find(name);
    if (resID !== 0xFFFFFFFF) {
      this.addShadingRateTexture(name, width, height);
      return resID;
    }
    var desc = new ResourceDesc();
    desc.dimension = ResourceDimension.TEXTURE2D;
    desc.width = width;
    desc.height = height;
    desc.depthOrArraySize = 1;
    desc.mipLevels = 1;
    desc.format = Format.R8UI;
    desc.flags = ResourceFlags.SHADING_RATE | ResourceFlags.STORAGE | ResourceFlags.SAMPLED;
    return this._resourceGraph.addVertex(ResourceGraphValue.Managed, new ManagedResource(), name, desc, new ResourceTraits(residency), new ResourceStates(), new SamplerInfo(Filter.LINEAR, Filter.LINEAR, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP));
  };
  _proto0.beginFrame = function beginFrame() {
    var director = cclegacy.director;
    director.buildRenderPipeline();
  };
  _proto0.update = function update(camera) {};
  _proto0.endFrame = function endFrame() {
    var _this$renderGraph;
    (_this$renderGraph = this.renderGraph) == null ? void 0 : _this$renderGraph.clear();
  };
  _proto0.compile = function compile() {
    if (!this._renderGraph) {
      throw new Error('RenderGraph cannot be built without being created');
    }
    resetPassMGState();
    {
      if (!this._compiler) {
        this._compiler = new Compiler(this, this._renderGraph, this._resourceGraph, this._lg);
      }
      this._compiler.compile(this._renderGraph);
    }
  };
  _proto0.execute = function execute() {
    if (!this._renderGraph) {
      throw new Error('Cannot run without creating rendergraph');
    }
    if (!this._executor) {
      this._executor = new Executor(this, this._device, this._resourceGraph, this.layoutGraph, this.width, this.height);
    }
    this._executor.resize(this.width, this.height);
    this._executor.execute(this._renderGraph);
  };
  _proto0._applySize = function _applySize(cameras) {
    var _this9 = this;
    var newWidth = this._width;
    var newHeight = this._height;
    cameras.forEach(function (camera) {
      var window = camera.window;
      newWidth = Math.max(window.width, newWidth);
      newHeight = Math.max(window.height, newHeight);
      if (!_this9._cameras.includes(camera)) {
        _this9._cameras.push(camera);
      }
    });
    if (newWidth !== this._width || newHeight !== this._height) {
      this._width = newWidth;
      this._height = newHeight;
    }
  };
  _proto0.render = function render(cameras) {
    if (cameras.length === 0) {
      return;
    }
    this._applySize(cameras);
    decideProfilerCamera(cameras);
    this.beginFrame();
    this.execute();
    this.endFrame();
  };
  _proto0.addBuiltinReflectionProbePass = function addBuiltinReflectionProbePass(camera) {
    var reflectionProbeManager = cclegacy.internal.reflectionProbeManager;
    if (!reflectionProbeManager) return;
    var probes = reflectionProbeManager.getProbes();
    if (probes.length === 0) return;
    for (var i = 0; i < probes.length; i++) {
      var probe = probes[i];
      if (probe.needRender) {
        if (probes[i].probeType === ProbeType.PLANAR) {
          buildReflectionProbePass(camera, this, probe, probe.realtimePlanarTexture.window, 0);
        }
      }
    }
  };
  _proto0.addRenderPassImpl = function addRenderPassImpl(width, height, layoutName, count, quality) {
    if (count === void 0) {
      count = 1;
    }
    if (quality === void 0) {
      quality = 0;
    }
    var name = 'Raster';
    var pass = renderGraphPool.createRasterPass();
    pass.viewport.width = width;
    pass.viewport.height = height;
    pass.count = count;
    pass.quality = quality;
    var data = renderGraphPool.createRenderData();
    var vertID = this._renderGraph.addVertex(RenderGraphValue.RasterPass, pass, name, layoutName, data, false);
    var result = pipelinePool.renderPassBuilder.add();
    result.update(data, this._renderGraph, this._lg, this._resourceGraph, vertID, pass, this._pipelineSceneData);
    this._updateRasterPassConstants(result, width, height, layoutName);
    setTextureUBOView(result, this._pipelineSceneData);
    return result;
  };
  _proto0.addRenderPass = function addRenderPass(width, height, layoutName) {
    if (layoutName === void 0) {
      layoutName = 'default';
    }
    return this.addRenderPassImpl(width, height, layoutName);
  };
  _proto0.addMultisampleRenderPass = function addMultisampleRenderPass(width, height, count, quality, layoutName) {
    if (layoutName === void 0) {
      layoutName = 'default';
    }
    var rasterPassBuilder = this.addRenderPassImpl(width, height, layoutName, count, quality);
    rasterPassBuilder.addRenderSubpass();
    return rasterPassBuilder;
  };
  _proto0.getDescriptorSetLayout = function getDescriptorSetLayout(shaderName, freq) {
    var lg = this._lg;
    var phaseID = lg.shaderLayoutIndex.get(shaderName);
    var pplLayout = lg.getLayout(phaseID);
    var setLayout = pplLayout.getSet(freq);
    return setLayout.descriptorSetLayout;
  };
  _proto0._updateRasterPassConstants = function _updateRasterPassConstants(setter, width, height, layoutName) {
    var director = cclegacy.director;
    var root = director.root;
    var shadingWidth = width;
    var shadingHeight = height;
    var pipeline = root.pipeline;
    pipeline.layoutGraph;
    _uboVec.set(root.cumulativeTime, root.frameTime, director.getTotalFrames());
    setter.setVec4('cc_time', _uboVec);
    _uboVec.set(shadingWidth, shadingHeight, 1.0 / shadingWidth, 1.0 / shadingHeight);
    setter.setVec4('cc_screenSize', _uboVec);
    _uboVec.set(shadingWidth, shadingHeight, 1.0 / shadingWidth, 1.0 / shadingHeight);
    setter.setVec4('cc_nativeSize', _uboVec);
    var debugView = root.debugView;
    _uboVec.set(0.0, 0.0, 0.0, 0.0);
    if (debugView) {
      var debugPackVec = [debugView.singleMode, 0.0, 0.0, 0.0];
      for (var i = DebugViewCompositeType.DIRECT_DIFFUSE; i < DebugViewCompositeType.MAX_BIT_COUNT; i++) {
        var idx = i >> 3;
        var bit = i % 8;
        debugPackVec[idx + 1] += (debugView.isCompositeModeEnabled(i) ? 1.0 : 0.0) * Math.pow(10.0, bit);
      }
      debugPackVec[3] += (debugView.lightingWithAlbedo ? 1.0 : 0.0) * Math.pow(10.0, 6.0);
      debugPackVec[3] += (debugView.csmLayerColoration ? 1.0 : 0.0) * Math.pow(10.0, 7.0);
      _uboVec.set(debugPackVec[0], debugPackVec[1], debugPackVec[2], debugPackVec[3]);
    }
    setter.setVec4('cc_debug_view_mode', _uboVec);
  };
  return _createClass(WebPipeline, [{
    key: "type",
    get: function get() {
      return PipelineType.BASIC;
    }
  }, {
    key: "capabilities",
    get: function get() {
      return new PipelineCapabilities();
    }
  }, {
    key: "enableCpuLightCulling",
    get: function get() {
      if (!this._executor) {
        return true;
      }
      return this._executor._context.culling.enableLightCulling;
    },
    set: function set(enable) {
      if (!this._executor) {
        return;
      }
      this._executor._context.culling.enableLightCulling = enable;
    }
  }, {
    key: "name",
    get: function get() {
      return 'WebPipeline';
    }
  }, {
    key: "globalDescriptorSetData",
    get: function get() {
      return this._globalDescSetData;
    }
  }, {
    key: "defaultSampler",
    get: function get() {
      return this._defaultSampler;
    }
  }, {
    key: "defaultShadowTexture",
    get: function get() {
      return getDefaultShadowTexture(this.device);
    }
  }, {
    key: "device",
    get: function get() {
      return this._device;
    }
  }, {
    key: "lightingMode",
    get: function get() {
      return this._lightingMode;
    },
    set: function set(mode) {
      this._lightingMode = mode;
    }
  }, {
    key: "usesDeferredPipeline",
    get: function get() {
      return this._usesDeferredPipeline;
    }
  }, {
    key: "macros",
    get: function get() {
      return this._macros;
    }
  }, {
    key: "profilerDescriptorSet",
    get: function get() {
      return this._profilerDescriptorSet;
    }
  }, {
    key: "commandBuffers",
    get: function get() {
      return [this._device.commandBuffer];
    }
  }, {
    key: "pipelineSceneData",
    get: function get() {
      return this._pipelineSceneData;
    }
  }, {
    key: "constantMacros",
    get: function get() {
      return this._constantMacros;
    }
  }, {
    key: "profiler",
    get: function get() {
      return this._profiler;
    },
    set: function set(profiler) {
      this._profiler = profiler;
    }
  }, {
    key: "geometryRenderer",
    get: function get() {
      throw new Error('Method not implemented.');
    }
  }, {
    key: "shadingScale",
    get: function get() {
      return this._pipelineSceneData.shadingScale;
    },
    set: function set(scale) {
      this._pipelineSceneData.shadingScale = scale;
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
  }, {
    key: "renderGraph",
    get: function get() {
      return this._renderGraph;
    }
  }, {
    key: "resourceGraph",
    get: function get() {
      return this._resourceGraph;
    }
  }, {
    key: "layoutGraph",
    get: function get() {
      return this._lg;
    }
  }, {
    key: "resourceUses",
    get: function get() {
      return this._resourceUses;
    }
  }]);
}(WebSetter);
WebPipeline.MAX_BLOOM_FILTER_PASS_NUM = 6;
WebPipeline.CSM_UNIFORM_VECTORS = 61;
WebPipeline.GLOBAL_UNIFORM_VECTORS = 64;

(function () {
  function BinaryOutputArchive() {
    this.capacity = 0;
    this.size = 0;
    this.buffer = void 0;
    this.dataView = void 0;
    this.capacity = 4096;
    this.buffer = new Uint8Array(this.capacity);
    this.dataView = new DataView(this.buffer.buffer);
  }
  var _proto = BinaryOutputArchive.prototype;
  _proto.b = function b(value) {
    var newSize = this.size + 1;
    if (newSize > this.capacity) {
      this.reserve(newSize);
    }
    this.dataView.setUint8(this.size, value ? 1 : 0);
    this.size = newSize;
  };
  _proto.n = function n(value) {
    var newSize = this.size + 8;
    if (newSize > this.capacity) {
      this.reserve(newSize);
    }
    this.dataView.setFloat64(this.size, value, true);
    this.size = newSize;
  };
  _proto.s = function s(value) {
    this.n(value.length);
    var newSize = this.size + value.length;
    if (newSize > this.capacity) {
      this.reserve(newSize);
    }
    for (var i = 0; i < value.length; i++) {
      this.dataView.setUint8(this.size + i, value.charCodeAt(i));
    }
    this.size = newSize;
  };
  _proto.reserve = function reserve(requiredSize) {
    var newCapacity = Math.max(requiredSize, this.capacity * 2);
    var prevBuffer = this.buffer;
    this.buffer = new Uint8Array(newCapacity);
    this.buffer.set(prevBuffer);
    this.dataView = new DataView(this.buffer.buffer);
    this.capacity = newCapacity;
  };
  return _createClass(BinaryOutputArchive, [{
    key: "data",
    get: function get() {
      return this.buffer.buffer.slice(0, this.size);
    }
  }]);
})();
var BinaryInputArchive = function () {
  function BinaryInputArchive(data, byteOffset) {
    this.offset = 0;
    this.dataView = void 0;
    this.dataView = new DataView(data, byteOffset);
  }
  var _proto2 = BinaryInputArchive.prototype;
  _proto2.b = function b() {
    return this.dataView.getUint8(this.offset++) !== 0;
  };
  _proto2.n = function n() {
    var value = this.dataView.getFloat64(this.offset, true);
    this.offset += 8;
    return value;
  };
  _proto2.s = function s() {
    var length = this.n();
    var str = String.fromCharCode.apply(null, Array.from(new Uint8Array(this.dataView.buffer, this.offset, length)));
    this.offset += length;
    return str;
  };
  return BinaryInputArchive;
}();

var ProgramInfo = function ProgramInfo(programInfo, shaderInfo, attributes, blockSizes, handleMap) {
  this.programInfo = programInfo;
  this.shaderInfo = shaderInfo;
  this.attributes = attributes;
  this.blockSizes = blockSizes;
  this.handleMap = handleMap;
};
var ProgramGroup = function ProgramGroup() {
  this.programInfos = new Map();
  this.programProxies = new Map();
};

var _setIndex = [2, 1, 3, 0];
function makeProgramInfo(effectName, shader) {
  var programInfo = _extends({}, shader);
  programInfo.effectName = effectName;
  populateMacros(programInfo);
  return programInfo;
}
function findBinding(shaderInfo, name) {
  for (var _iterator = _createForOfIteratorHelperLoose(shaderInfo.blocks), _step; !(_step = _iterator()).done;) {
    var v = _step.value;
    if (v.name === name) {
      return {
        set: v.set,
        binding: v.binding
      };
    }
  }
  for (var _iterator2 = _createForOfIteratorHelperLoose(shaderInfo.buffers), _step2; !(_step2 = _iterator2()).done;) {
    var _v = _step2.value;
    if (_v.name === name) {
      return {
        set: _v.set,
        binding: _v.binding
      };
    }
  }
  for (var _iterator3 = _createForOfIteratorHelperLoose(shaderInfo.samplerTextures), _step3; !(_step3 = _iterator3()).done;) {
    var _v2 = _step3.value;
    if (_v2.name === name) {
      return {
        set: _v2.set,
        binding: _v2.binding
      };
    }
  }
  for (var _iterator4 = _createForOfIteratorHelperLoose(shaderInfo.samplers), _step4; !(_step4 = _iterator4()).done;) {
    var _v3 = _step4.value;
    if (_v3.name === name) {
      return {
        set: _v3.set,
        binding: _v3.binding
      };
    }
  }
  for (var _iterator5 = _createForOfIteratorHelperLoose(shaderInfo.textures), _step5; !(_step5 = _iterator5()).done;) {
    var _v4 = _step5.value;
    if (_v4.name === name) {
      return {
        set: _v4.set,
        binding: _v4.binding
      };
    }
  }
  for (var _iterator6 = _createForOfIteratorHelperLoose(shaderInfo.images), _step6; !(_step6 = _iterator6()).done;) {
    var _v5 = _step6.value;
    if (_v5.name === name) {
      return {
        set: _v5.set,
        binding: _v5.binding
      };
    }
  }
  for (var _iterator7 = _createForOfIteratorHelperLoose(shaderInfo.subpassInputs), _step7; !(_step7 = _iterator7()).done;) {
    var _v6 = _step7.value;
    if (_v6.name === name) {
      return {
        set: _v6.set,
        binding: _v6.binding
      };
    }
  }
  throw error('binding not found in shaderInfo!');
}
function overwriteShaderSourceBinding(shaderInfo, source) {
  var code = source;
  var samplerExp = /layout\s*\(([^)])+\)\s+uniform\s+(\b\w+\b\s+)?sampler(\w+)\s+(\b\w+\b)/g;
  var samplerIter = samplerExp.exec(code);
  while (samplerIter) {
    var name = samplerIter[4];
    var _findBinding = findBinding(shaderInfo, name),
      set = _findBinding.set,
      binding = _findBinding.binding;
    var precStr = samplerIter[2] ? samplerIter[2] : '';
    var replaceStr = "layout(set = " + set + ", binding = " + binding + ") uniform " + precStr + " sampler" + samplerIter[3] + " " + samplerIter[4];
    code = code.replace(samplerIter[0], replaceStr);
    samplerIter = samplerExp.exec(code);
  }
  var blockExp = /layout\s*\(([^)]+)\)\s*(readonly|writeonly)?\s*\b((uniform\s*|buffer\s*|image2D\s*){1,2})\b\s*(\b\w+\b)\s*[{;]/g;
  var blockIter = blockExp.exec(code);
  while (blockIter) {
    var _name = blockIter[5];
    var _findBinding2 = findBinding(shaderInfo, _name),
      _set = _findBinding2.set,
      _binding = _findBinding2.binding;
    var accessStr = blockIter[2] ? blockIter[2] : '';
    var endStr = ' {';
    if (blockIter[3].includes('image')) {
      endStr = ";";
    }
    var desc = blockIter[1];
    desc = desc.replace(/set\s*=\s*\d+/g, "set = " + _set);
    desc = desc.replace(/binding\s*=\s*\d+/g, "binding = " + _binding);
    var _replaceStr = "layout(" + desc + ") " + accessStr + " " + blockIter[3] + " " + blockIter[5] + endStr;
    code = code.replace(blockIter[0], _replaceStr);
    blockIter = blockExp.exec(code);
  }
  return code;
}
function overwriteShaderProgramBinding(shaderInfo, programInfo) {
  var version = getDeviceShaderVersion(deviceManager.gfxDevice);
  if (version !== 'glsl4') {
    return;
  }
  if (programInfo.glsl4.vert) {
    programInfo.glsl4.vert = overwriteShaderSourceBinding(shaderInfo, programInfo.glsl4.vert);
  }
  if (programInfo.glsl4.frag) {
    programInfo.glsl4.frag = overwriteShaderSourceBinding(shaderInfo, programInfo.glsl4.frag);
  }
  if (programInfo.glsl4.compute) {
    programInfo.glsl4.compute = overwriteShaderSourceBinding(shaderInfo, programInfo.glsl4.compute);
  }
}
function overwriteProgramBlockInfo(shaderInfo, programInfo) {
  overwriteShaderProgramBinding(shaderInfo, programInfo);
  var set = _setIndex[UpdateFrequency.PER_BATCH];
  for (var _iterator8 = _createForOfIteratorHelperLoose(programInfo.blocks), _step8; !(_step8 = _iterator8()).done;) {
    var block = _step8.value;
    var found = false;
    for (var _iterator9 = _createForOfIteratorHelperLoose(shaderInfo.blocks), _step9; !(_step9 = _iterator9()).done;) {
      var src = _step9.value;
      if (src.set !== set) {
        continue;
      }
      if (src.name === block.name) {
        block.binding = src.binding;
        found = true;
        break;
      }
    }
    if (!found) {
      error("Block " + block.name + " not found in shader " + shaderInfo.name);
    }
  }
}
function populateGroupedShaderInfo(layout, descriptorInfo, set, shaderInfo, blockSizes) {
  for (var _iterator0 = _createForOfIteratorHelperLoose(layout.descriptorBlocks), _step0; !(_step0 = _iterator0()).done;) {
    var descriptorBlock = _step0.value;
    var visibility = descriptorBlock.visibility;
    var binding = descriptorBlock.offset;
    switch (descriptorBlock.type) {
      case DescriptorTypeOrder.UNIFORM_BUFFER:
        for (var _iterator1 = _createForOfIteratorHelperLoose(descriptorInfo.blocks), _step1; !(_step1 = _iterator1()).done;) {
          var block = _step1.value;
          if (block.stageFlags !== visibility) {
            continue;
          }
          blockSizes.push(getSize(block.members));
          shaderInfo.blocks.push(new UniformBlock(set, binding, block.name, block.members.map(function (m) {
            return new Uniform(m.name, m.type, m.count);
          }), 1));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.DYNAMIC_UNIFORM_BUFFER:
        break;
      case DescriptorTypeOrder.SAMPLER_TEXTURE:
        for (var _iterator10 = _createForOfIteratorHelperLoose(descriptorInfo.samplerTextures), _step10; !(_step10 = _iterator10()).done;) {
          var tex = _step10.value;
          if (tex.stageFlags !== visibility) {
            continue;
          }
          shaderInfo.samplerTextures.push(new UniformSamplerTexture(set, binding, tex.name, tex.type, tex.count));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.SAMPLER:
        for (var _iterator11 = _createForOfIteratorHelperLoose(descriptorInfo.samplers), _step11; !(_step11 = _iterator11()).done;) {
          var sampler = _step11.value;
          if (sampler.stageFlags !== visibility) {
            continue;
          }
          shaderInfo.samplers.push(new UniformSampler(set, binding, sampler.name, sampler.count));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.TEXTURE:
        for (var _iterator12 = _createForOfIteratorHelperLoose(descriptorInfo.textures), _step12; !(_step12 = _iterator12()).done;) {
          var texture = _step12.value;
          if (texture.stageFlags !== visibility) {
            continue;
          }
          shaderInfo.textures.push(new UniformTexture(set, binding, texture.name, texture.type, texture.count));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.STORAGE_BUFFER:
        for (var _iterator13 = _createForOfIteratorHelperLoose(descriptorInfo.buffers), _step13; !(_step13 = _iterator13()).done;) {
          var buffer = _step13.value;
          if (buffer.stageFlags !== visibility) {
            continue;
          }
          shaderInfo.buffers.push(new UniformStorageBuffer(set, binding, buffer.name, 1, buffer.memoryAccess));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.DYNAMIC_STORAGE_BUFFER:
        break;
      case DescriptorTypeOrder.STORAGE_IMAGE:
        for (var _iterator14 = _createForOfIteratorHelperLoose(descriptorInfo.images), _step14; !(_step14 = _iterator14()).done;) {
          var image = _step14.value;
          if (image.stageFlags !== visibility) {
            continue;
          }
          shaderInfo.images.push(new UniformStorageImage(set, binding, image.name, image.type, image.count, image.memoryAccess));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.INPUT_ATTACHMENT:
        for (var _iterator15 = _createForOfIteratorHelperLoose(descriptorInfo.subpassInputs), _step15; !(_step15 = _iterator15()).done;) {
          var subpassInput = _step15.value;
          if (subpassInput.stageFlags !== visibility) {
            continue;
          }
          shaderInfo.subpassInputs.push(new UniformInputAttachment(set, subpassInput.binding, subpassInput.name, subpassInput.count));
          ++binding;
        }
        break;
    }
  }
}
function populateMergedShaderInfo(valueNames, layout, set, shaderInfo, blockSizes) {
  for (var _iterator16 = _createForOfIteratorHelperLoose(layout.descriptorBlocks), _step16; !(_step16 = _iterator16()).done;) {
    var descriptorBlock = _step16.value;
    var binding = descriptorBlock.offset;
    switch (descriptorBlock.type) {
      case DescriptorTypeOrder.UNIFORM_BUFFER:
        for (var _iterator17 = _createForOfIteratorHelperLoose(descriptorBlock.descriptors), _step17; !(_step17 = _iterator17()).done;) {
          var block = _step17.value;
          var uniformBlock = layout.uniformBlocks.get(block.descriptorID);
          if (uniformBlock === undefined) {
            error("Failed to find uniform block " + block.descriptorID + " in layout");
            continue;
          }
          blockSizes.push(getSize(uniformBlock.members));
          shaderInfo.blocks.push(new UniformBlock(set, binding, valueNames[block.descriptorID], uniformBlock.members.map(function (m) {
            return new Uniform(m.name, m.type, m.count);
          }), 1));
          ++binding;
        }
        if (binding !== descriptorBlock.offset + descriptorBlock.capacity) {
          error("Uniform buffer binding mismatch for set " + set);
        }
        break;
      case DescriptorTypeOrder.DYNAMIC_UNIFORM_BUFFER:
        break;
      case DescriptorTypeOrder.SAMPLER_TEXTURE:
        for (var _iterator18 = _createForOfIteratorHelperLoose(descriptorBlock.descriptors), _step18; !(_step18 = _iterator18()).done;) {
          var tex = _step18.value;
          shaderInfo.samplerTextures.push(new UniformSamplerTexture(set, binding, valueNames[tex.descriptorID], tex.type, tex.count));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.SAMPLER:
        for (var _iterator19 = _createForOfIteratorHelperLoose(descriptorBlock.descriptors), _step19; !(_step19 = _iterator19()).done;) {
          var sampler = _step19.value;
          shaderInfo.samplers.push(new UniformSampler(set, binding, valueNames[sampler.descriptorID], sampler.count));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.TEXTURE:
        for (var _iterator20 = _createForOfIteratorHelperLoose(descriptorBlock.descriptors), _step20; !(_step20 = _iterator20()).done;) {
          var texture = _step20.value;
          shaderInfo.textures.push(new UniformTexture(set, binding, valueNames[texture.descriptorID], texture.type, texture.count));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.STORAGE_BUFFER:
        for (var _iterator21 = _createForOfIteratorHelperLoose(descriptorBlock.descriptors), _step21; !(_step21 = _iterator21()).done;) {
          var buffer = _step21.value;
          shaderInfo.buffers.push(new UniformStorageBuffer(set, binding, valueNames[buffer.descriptorID], 1, MemoryAccessBit.READ_WRITE));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.DYNAMIC_STORAGE_BUFFER:
        break;
      case DescriptorTypeOrder.STORAGE_IMAGE:
        for (var _iterator22 = _createForOfIteratorHelperLoose(descriptorBlock.descriptors), _step22; !(_step22 = _iterator22()).done;) {
          var image = _step22.value;
          shaderInfo.images.push(new UniformStorageImage(set, binding, valueNames[image.descriptorID], image.type, image.count, MemoryAccessBit.READ_WRITE));
          ++binding;
        }
        break;
      case DescriptorTypeOrder.INPUT_ATTACHMENT:
        for (var _iterator23 = _createForOfIteratorHelperLoose(descriptorBlock.descriptors), _step23; !(_step23 = _iterator23()).done;) {
          var subpassInput = _step23.value;
          shaderInfo.subpassInputs.push(new UniformInputAttachment(set, binding, valueNames[subpassInput.descriptorID], subpassInput.count));
          ++binding;
        }
        break;
    }
  }
}
function populateLocalShaderInfo(target, source, shaderInfo, blockSizes) {
  var set = _setIndex[UpdateFrequency.PER_INSTANCE];
  var _loop = function _loop() {
    var block = target.blocks[i];
    var info = source.layouts[block.name];
    var binding = info && source.bindings.find(function (bd) {
      return bd.binding === info.binding;
    });
    if (!info || !binding || !(binding.descriptorType & DESCRIPTOR_BUFFER_TYPE)) {
      console.warn("builtin UBO '" + block.name + "' not available!");
      return 1;
    }
    blockSizes.push(getSize(block.members));
    shaderInfo.blocks.push(new UniformBlock(set, binding.binding, block.name, block.members.map(function (m) {
      return new Uniform(m.name, m.type, m.count);
    }), 1));
  };
  for (var i = 0; i < target.blocks.length; i++) {
    if (_loop()) continue;
  }
  var _loop2 = function _loop2() {
    var samplerTexture = target.samplerTextures[_i7];
    var info = source.layouts[samplerTexture.name];
    var binding = info && source.bindings.find(function (bd) {
      return bd.binding === info.binding;
    });
    if (!info || !binding || !(binding.descriptorType & DESCRIPTOR_SAMPLER_TYPE)) {
      console.warn("builtin samplerTexture '" + samplerTexture.name + "' not available!");
      return 1;
    }
    shaderInfo.samplerTextures.push(new UniformSamplerTexture(set, binding.binding, samplerTexture.name, samplerTexture.type, samplerTexture.count));
  };
  for (var _i7 = 0; _i7 < target.samplerTextures.length; _i7++) {
    if (_loop2()) continue;
  }
}
function getIDescriptorSetLayoutInfoUniformBlockCapacity(info) {
  var capacity = 0;
  for (var _iterator24 = _createForOfIteratorHelperLoose(info.bindings), _step24; !(_step24 = _iterator24()).done;) {
    var binding = _step24.value;
    if (binding.descriptorType === DescriptorType.UNIFORM_BUFFER || binding.descriptorType === DescriptorType.DYNAMIC_UNIFORM_BUFFER) {
      capacity += binding.count;
    }
  }
  return capacity;
}
function getIDescriptorSetLayoutInfoSamplerTextureCapacity(info) {
  var capacity = 0;
  for (var _iterator25 = _createForOfIteratorHelperLoose(info.bindings), _step25; !(_step25 = _iterator25()).done;) {
    var binding = _step25.value;
    if (binding.descriptorType !== DescriptorType.UNIFORM_BUFFER && binding.descriptorType !== DescriptorType.DYNAMIC_UNIFORM_BUFFER) {
      capacity += binding.count;
    }
  }
  return capacity;
}
function setFlattenedUniformBlockBinding(setOffsets, descriptors) {
  for (var _iterator26 = _createForOfIteratorHelperLoose(descriptors), _step26; !(_step26 = _iterator26()).done;) {
    var d = _step26.value;
    d.flattened = setOffsets[d.set] + d.binding;
  }
}
function setFlattenedSamplerTextureBinding(setOffsets, uniformBlockCapacities, descriptors) {
  for (var _iterator27 = _createForOfIteratorHelperLoose(descriptors), _step27; !(_step27 = _iterator27()).done;) {
    var d = _step27.value;
    d.flattened = setOffsets[d.set] + d.binding - uniformBlockCapacities[d.set];
  }
}
function calculateFlattenedBinding(descriptorSets, fixedInstanceDescriptorSetLayout, shaderInfo) {
  var uniformBlockCapacities = new Array(4);
  {
    var _descriptorSets$Updat, _descriptorSets$Updat2, _descriptorSets$Updat3, _descriptorSets$Updat4;
    var passCapacity = ((_descriptorSets$Updat = descriptorSets[UpdateFrequency.PER_PASS]) == null ? void 0 : _descriptorSets$Updat.uniformBlockCapacity) || 0;
    var phaseCapacity = ((_descriptorSets$Updat2 = descriptorSets[UpdateFrequency.PER_PHASE]) == null ? void 0 : _descriptorSets$Updat2.uniformBlockCapacity) || 0;
    var batchCapacity = ((_descriptorSets$Updat3 = descriptorSets[UpdateFrequency.PER_BATCH]) == null ? void 0 : _descriptorSets$Updat3.uniformBlockCapacity) || 0;
    var instanceCapacity = fixedInstanceDescriptorSetLayout ? getIDescriptorSetLayoutInfoUniformBlockCapacity(fixedInstanceDescriptorSetLayout) : ((_descriptorSets$Updat4 = descriptorSets[UpdateFrequency.PER_INSTANCE]) == null ? void 0 : _descriptorSets$Updat4.uniformBlockCapacity) || 0;
    uniformBlockCapacities[_setIndex[UpdateFrequency.PER_PASS]] = passCapacity;
    uniformBlockCapacities[_setIndex[UpdateFrequency.PER_PHASE]] = phaseCapacity;
    uniformBlockCapacities[_setIndex[UpdateFrequency.PER_BATCH]] = batchCapacity;
    uniformBlockCapacities[_setIndex[UpdateFrequency.PER_INSTANCE]] = instanceCapacity;
    var passOffset = 0;
    var phaseOffset = passOffset + passCapacity;
    var instanceOffset = phaseOffset + phaseCapacity;
    var batchOffset = instanceOffset + instanceCapacity;
    var uniformBlockOffsets = new Array(4);
    uniformBlockOffsets[_setIndex[UpdateFrequency.PER_PASS]] = passOffset;
    uniformBlockOffsets[_setIndex[UpdateFrequency.PER_PHASE]] = phaseOffset;
    uniformBlockOffsets[_setIndex[UpdateFrequency.PER_BATCH]] = batchOffset;
    uniformBlockOffsets[_setIndex[UpdateFrequency.PER_INSTANCE]] = instanceOffset;
    setFlattenedUniformBlockBinding(uniformBlockOffsets, shaderInfo.blocks);
  }
  {
    var _descriptorSets$Updat5, _descriptorSets$Updat6, _descriptorSets$Updat7;
    var _passCapacity = ((_descriptorSets$Updat5 = descriptorSets[UpdateFrequency.PER_PASS]) == null ? void 0 : _descriptorSets$Updat5.samplerTextureCapacity) || 0;
    var _phaseCapacity = ((_descriptorSets$Updat6 = descriptorSets[UpdateFrequency.PER_PHASE]) == null ? void 0 : _descriptorSets$Updat6.samplerTextureCapacity) || 0;
    var _instanceCapacity = fixedInstanceDescriptorSetLayout ? getIDescriptorSetLayoutInfoSamplerTextureCapacity(fixedInstanceDescriptorSetLayout) : ((_descriptorSets$Updat7 = descriptorSets[UpdateFrequency.PER_INSTANCE]) == null ? void 0 : _descriptorSets$Updat7.samplerTextureCapacity) || 0;
    var _passOffset = 0;
    var _phaseOffset = _passOffset + _passCapacity;
    var _instanceOffset = _phaseOffset + _phaseCapacity;
    var _batchOffset = _instanceOffset + _instanceCapacity;
    var samplerTextureOffsets = new Array(4);
    samplerTextureOffsets[_setIndex[UpdateFrequency.PER_PASS]] = _passOffset;
    samplerTextureOffsets[_setIndex[UpdateFrequency.PER_PHASE]] = _phaseOffset;
    samplerTextureOffsets[_setIndex[UpdateFrequency.PER_BATCH]] = _batchOffset;
    samplerTextureOffsets[_setIndex[UpdateFrequency.PER_INSTANCE]] = _instanceOffset;
    setFlattenedSamplerTextureBinding(samplerTextureOffsets, uniformBlockCapacities, shaderInfo.samplerTextures);
  }
}
function makeShaderInfo(lg, passLayouts, phaseLayouts, srcShaderInfo, programData, fixedLocal) {
  var descriptorSets = [null, null, null, null];
  var fixedInstanceDescriptorSetLayout = null;
  var shaderInfo = new ShaderInfo();
  var blockSizes = [];
  {
    var passLayout = passLayouts.getSet(UpdateFrequency.PER_PASS);
    if (passLayout) {
      descriptorSets[UpdateFrequency.PER_PASS] = passLayout.descriptorSetLayoutData;
      populateMergedShaderInfo(lg.valueNames, passLayout.descriptorSetLayoutData, _setIndex[UpdateFrequency.PER_PASS], shaderInfo, blockSizes);
    }
  }
  {
    var phaseLayout = phaseLayouts.getSet(UpdateFrequency.PER_PHASE);
    if (phaseLayout) {
      descriptorSets[UpdateFrequency.PER_PHASE] = phaseLayout.descriptorSetLayoutData;
      populateMergedShaderInfo(lg.valueNames, phaseLayout.descriptorSetLayoutData, _setIndex[UpdateFrequency.PER_PHASE], shaderInfo, blockSizes);
    }
  }
  {
    var batchInfo = srcShaderInfo.descriptors[UpdateFrequency.PER_BATCH];
    if (programData) {
      var perBatch = programData.layout.getSet(UpdateFrequency.PER_BATCH);
      if (perBatch) {
        descriptorSets[UpdateFrequency.PER_BATCH] = perBatch.descriptorSetLayoutData;
        populateMergedShaderInfo(lg.valueNames, perBatch.descriptorSetLayoutData, _setIndex[UpdateFrequency.PER_BATCH], shaderInfo, blockSizes);
      }
    } else {
      var batchLayout = phaseLayouts.getSet(UpdateFrequency.PER_BATCH);
      if (batchLayout) {
        descriptorSets[UpdateFrequency.PER_BATCH] = batchLayout.descriptorSetLayoutData;
        populateGroupedShaderInfo(batchLayout.descriptorSetLayoutData, batchInfo, _setIndex[UpdateFrequency.PER_BATCH], shaderInfo, blockSizes);
      }
    }
  }
  {
    var instanceInfo = srcShaderInfo.descriptors[UpdateFrequency.PER_INSTANCE];
    if (programData) {
      if (fixedLocal) {
        fixedInstanceDescriptorSetLayout = localDescriptorSetLayout;
        populateLocalShaderInfo(instanceInfo, localDescriptorSetLayout, shaderInfo, blockSizes);
      } else {
        var perInstance = programData.layout.getSet(UpdateFrequency.PER_INSTANCE);
        if (perInstance) {
          descriptorSets[UpdateFrequency.PER_INSTANCE] = perInstance.descriptorSetLayoutData;
          populateMergedShaderInfo(lg.valueNames, perInstance.descriptorSetLayoutData, _setIndex[UpdateFrequency.PER_INSTANCE], shaderInfo, blockSizes);
        }
      }
    } else {
      var instanceLayout = phaseLayouts.getSet(UpdateFrequency.PER_INSTANCE);
      if (instanceLayout) {
        descriptorSets[UpdateFrequency.PER_INSTANCE] = instanceLayout.descriptorSetLayoutData;
        populateGroupedShaderInfo(instanceLayout.descriptorSetLayoutData, instanceInfo, _setIndex[UpdateFrequency.PER_INSTANCE], shaderInfo, blockSizes);
      }
    }
  }
  calculateFlattenedBinding(descriptorSets, fixedInstanceDescriptorSetLayout, shaderInfo);
  shaderInfo.stages.push(new ShaderStage(ShaderStageFlagBit.VERTEX, ''));
  shaderInfo.stages.push(new ShaderStage(ShaderStageFlagBit.FRAGMENT, ''));
  return [shaderInfo, blockSizes];
}
var WebProgramProxy = function () {
  function WebProgramProxy(shader, pipelineStateIn) {
    if (pipelineStateIn === void 0) {
      pipelineStateIn = null;
    }
    this.shader = void 0;
    this.pipelineState = null;
    this.shader = shader;
    this.pipelineState = pipelineStateIn;
  }
  return _createClass(WebProgramProxy, [{
    key: "name",
    get: function get() {
      return this.shader.name;
    }
  }]);
}();
function getDescriptorNameAndType(source, binding) {
  for (var name in source.layouts) {
    var v = source.layouts[name];
    if (v.binding === binding) {
      assert(v.name === name);
      var type = Type.UNKNOWN;
      if (v instanceof UniformSamplerTexture) {
        type = v.type;
      } else if (v instanceof UniformStorageImage) {
        type = v.type;
      }
      return [v.name, type];
    }
  }
  error('descriptor not found');
  return ['', Type.UNKNOWN];
}
function makeLocalDescriptorSetLayoutData(lg, source) {
  var data = new DescriptorSetLayoutData();
  for (var _iterator28 = _createForOfIteratorHelperLoose(source.bindings), _step28; !(_step28 = _iterator28()).done;) {
    var b = _step28.value;
    var _getDescriptorNameAnd = getDescriptorNameAndType(source, b.binding),
      name = _getDescriptorNameAnd[0],
      type = _getDescriptorNameAnd[1];
    var nameID = getOrCreateDescriptorID(lg, name);
    var order = getDescriptorTypeOrder(b.descriptorType);
    var block = new DescriptorBlockData(order, b.stageFlags, b.count, b.access, b.viewDimension, b.sampleType, b.format);
    block.offset = b.binding;
    block.descriptors.push(new DescriptorData(nameID, type, b.count));
    data.descriptorBlocks.push(block);
    var binding = data.bindingMap.get(nameID);
    if (binding !== undefined) {
      error("duplicate descriptor name '" + name + "'");
    }
    data.bindingMap.set(nameID, b.binding);
    var v = source.layouts[name];
    if (v instanceof UniformBlock) {
      data.uniformBlocks.set(nameID, v);
    }
  }
  return data;
}
function buildProgramData(programName, srcShaderInfo, lg, phase, programData, fixedLocal) {
  var programSets = programData.layout.getSets();
  {
    var perBatch = makeDescriptorSetLayoutData(lg, UpdateFrequency.PER_BATCH, _setIndex[UpdateFrequency.PER_BATCH], srcShaderInfo.descriptors[UpdateFrequency.PER_BATCH]);
    var setData = new DescriptorSetData(perBatch);
    initializeDescriptorSetLayoutInfo(setData.descriptorSetLayoutData, setData.descriptorSetLayoutInfo);
    programSets.set(UpdateFrequency.PER_BATCH, setData);
  }
  if (fixedLocal) {
    var perInstance = makeLocalDescriptorSetLayoutData(lg, localDescriptorSetLayout);
    var _setData = new DescriptorSetData(perInstance);
    initializeDescriptorSetLayoutInfo(_setData.descriptorSetLayoutData, _setData.descriptorSetLayoutInfo);
    if (localDescriptorSetLayout.bindings.length !== _setData.descriptorSetLayoutInfo.bindings.length) {
      error('local descriptor set layout inconsistent');
    } else {
      for (var k = 0; k !== localDescriptorSetLayout.bindings.length; ++k) {
        var b = localDescriptorSetLayout.bindings[k];
        var b2 = _setData.descriptorSetLayoutInfo.bindings[k];
        if (b.binding !== b2.binding || b.descriptorType !== b2.descriptorType || b.count !== b2.count || b.stageFlags !== b2.stageFlags) {
          error('local descriptor set layout inconsistent');
        }
      }
    }
    programSets.set(UpdateFrequency.PER_INSTANCE, _setData);
  } else {
    var _perInstance = makeDescriptorSetLayoutData(lg, UpdateFrequency.PER_INSTANCE, _setIndex[UpdateFrequency.PER_INSTANCE], srcShaderInfo.descriptors[UpdateFrequency.PER_INSTANCE]);
    var _setData2 = new DescriptorSetData(_perInstance);
    initializeDescriptorSetLayoutInfo(_setData2.descriptorSetLayoutData, _setData2.descriptorSetLayoutInfo);
    programSets.set(UpdateFrequency.PER_INSTANCE, _setData2);
  }
  var shaderID = phase.shaderPrograms.length;
  phase.shaderIndex.set(programName, shaderID);
  phase.shaderPrograms.push(programData);
}
function getOrCreateProgramDescriptorSetLayout(device, lg, phaseID, programName, rate) {
  assert(rate < UpdateFrequency.PER_PHASE);
  var phase = lg.j(phaseID);
  var programID = phase.shaderIndex.get(programName);
  if (programID === undefined) {
    return getEmptyDescriptorSetLayout();
  }
  var programData = phase.shaderPrograms[programID];
  var layout = programData.layout.getSet(rate);
  if (layout === undefined) {
    return getEmptyDescriptorSetLayout();
  }
  if (layout.descriptorSetLayout) {
    return layout.descriptorSetLayout;
  }
  layout.descriptorSetLayout = device.createDescriptorSetLayout(layout.descriptorSetLayoutInfo);
  return layout.descriptorSetLayout;
}
function getProgramDescriptorSetLayout(device, lg, phaseID, programName, rate) {
  assert(rate < UpdateFrequency.PER_PHASE);
  var phase = lg.j(phaseID);
  var programID = phase.shaderIndex.get(programName);
  if (programID === undefined) {
    return null;
  }
  var programData = phase.shaderPrograms[programID];
  var layout = programData.layout.getSet(rate);
  if (layout === undefined) {
    return null;
  }
  if (layout.descriptorSetLayout) {
    return layout.descriptorSetLayout;
  }
  layout.descriptorSetLayout = device.createDescriptorSetLayout(layout.descriptorSetLayoutInfo);
  return layout.descriptorSetLayout;
}
function getEffectShader(lg, effect, pass) {
  var programName = pass.program;
  var passID = getCustomPassID(lg, pass.pass);
  if (passID === INVALID_ID$1) {
    error("Invalid render pass, program: " + programName);
    return [INVALID_ID$1, INVALID_ID$1, INVALID_ID$1, null, INVALID_ID$1];
  }
  var enableSubpass = pass.subpass && pass.subpass !== '' && ENABLE_SUBPASS;
  var subpassID = enableSubpass ? getCustomSubpassID(lg, passID, pass.subpass) : INVALID_ID$1;
  if (enableSubpass && subpassID === INVALID_ID$1) {
    error("Invalid render subpass, program: " + programName);
    return [INVALID_ID$1, INVALID_ID$1, INVALID_ID$1, null, INVALID_ID$1];
  }
  var phaseID = getCustomPhaseID(lg, subpassID === INVALID_ID$1 ? passID : subpassID, pass.phase);
  if (phaseID === INVALID_ID$1) {
    error("Invalid render phase, program: " + programName);
    return [INVALID_ID$1, INVALID_ID$1, INVALID_ID$1, null, INVALID_ID$1];
  }
  var srcShaderInfo = null;
  var shaderID = INVALID_ID$1;
  for (var i = 0; i < effect.shaders.length; ++i) {
    var shaderInfo = effect.shaders[i];
    if (shaderInfo.name === programName) {
      srcShaderInfo = shaderInfo;
      shaderID = i;
      break;
    }
  }
  return [passID, subpassID, phaseID, srcShaderInfo, shaderID];
}
function validateShaderInfo(srcShaderInfo) {
  if (srcShaderInfo.descriptors === undefined) {
    error("No descriptors in shader: " + srcShaderInfo.name + ", please reimport ALL effects");
    return 1;
  }
  return 0;
}
var WebProgramLibrary = function () {
  function WebProgramLibrary(lg) {
    this.layoutGraph = void 0;
    this.phases = new Map();
    this.mergeHighFrequency = false;
    this.fixedLocal = true;
    this.localLayoutData = new DescriptorSetLayoutData();
    this.localDescriptorSetLayout = null;
    this.pipeline = null;
    this.device = null;
    this.layoutGraph = lg;
    for (var _iterator29 = _createForOfIteratorHelperLoose(lg.v()), _step29; !(_step29 = _iterator29()).done;) {
      var v = _step29.value;
      if (lg.h(LayoutGraphDataValue.RenderPhase, v)) {
        this.phases.set(v, new ProgramGroup());
      }
    }
  }
  var _proto = WebProgramLibrary.prototype;
  _proto.init = function init(deviceIn) {
    if (this.device === deviceIn) {
      return;
    }
    this.device = deviceIn;
    var maxJoints = Math.floor((this.device.capabilities.maxVertexUniformVectors - 38) / 3);
    maxJoints = maxJoints < 256 ? maxJoints : 256;
    UBOSkinning.initLayout(maxJoints);
    var lg = this.layoutGraph;
    for (var _iterator30 = _createForOfIteratorHelperLoose(lg.v()), _step30; !(_step30 = _iterator30()).done;) {
      var v = _step30.value;
      var layout = lg.getLayout(v);
      var sets = layout.getSets();
      for (var _iterator34 = _createForOfIteratorHelperLoose(sets), _step34; !(_step34 = _iterator34()).done;) {
        var _step34$value = _step34.value;
          _step34$value[0];
          var set = _step34$value[1];
        initializeDescriptorSetLayoutInfo(set.descriptorSetLayoutData, set.descriptorSetLayoutInfo);
        set.descriptorSetLayout = this.device.createDescriptorSetLayout(set.descriptorSetLayoutInfo);
        assert(!!set.descriptorSetLayout);
        set.descriptorSet = this.device.createDescriptorSet(new DescriptorSetInfo(set.descriptorSetLayout));
        assert(!!set.descriptorSet);
      }
    }
    for (var _iterator31 = _createForOfIteratorHelperLoose(lg.v()), _step31; !(_step31 = _iterator31()).done;) {
      var _v7 = _step31.value;
      if (!lg.h(LayoutGraphDataValue.RenderPhase, _v7)) {
        continue;
      }
      var phaseID = _v7;
      var subpassOrPassID = lg.getParent(phaseID);
      var passLayout = lg.getLayout(subpassOrPassID);
      var phaseLayout = lg.getLayout(phaseID);
      var _info = new PipelineLayoutInfo();
      populatePipelineLayoutInfo(passLayout, UpdateFrequency.PER_PASS, _info);
      populatePipelineLayoutInfo(phaseLayout, UpdateFrequency.PER_PHASE, _info);
      populatePipelineLayoutInfo(phaseLayout, UpdateFrequency.PER_BATCH, _info);
      populatePipelineLayoutInfo(phaseLayout, UpdateFrequency.PER_INSTANCE, _info);
      var phase = lg.j(phaseID);
      phase.pipelineLayout = this.device.createPipelineLayout(_info);
    }
    {
      var localSetLayout = localDescriptorSetLayout;
      this.localLayoutData = makeLocalDescriptorSetLayoutData(lg, localSetLayout);
      var info = new DescriptorSetLayoutInfo();
      initializeDescriptorSetLayoutInfo(this.localLayoutData, info);
      this.localDescriptorSetLayout = this.device.createDescriptorSetLayout(info);
      assert(!!this.localDescriptorSetLayout);
      var numUniformBuffers = 0;
      for (var _iterator32 = _createForOfIteratorHelperLoose(this.localLayoutData.descriptorBlocks), _step32; !(_step32 = _iterator32()).done;) {
        var block = _step32.value;
        if (block.type !== DescriptorTypeOrder.UNIFORM_BUFFER && block.type !== DescriptorTypeOrder.DYNAMIC_UNIFORM_BUFFER) {
          continue;
        }
        for (var _iterator33 = _createForOfIteratorHelperLoose(block.descriptors), _step33; !(_step33 = _iterator33()).done;) {
          var d = _step33.value;
          numUniformBuffers += d.count;
        }
      }
      assert(numUniformBuffers === 7);
    }
    generateConstantMacros(this.device, this.layoutGraph.constantMacros);
  };
  _proto.addEffect = function addEffect(effect) {
    var _this = this;
    var lg = this.layoutGraph;
    for (var _iterator35 = _createForOfIteratorHelperLoose(effect.techniques), _step35; !(_step35 = _iterator35()).done;) {
      var tech = _step35.value;
      var _loop3 = function _loop3() {
        var pass = _step36.value;
        var programName = pass.program;
        var _getEffectShader = getEffectShader(lg, effect, pass),
          passID = _getEffectShader[0],
          subpassID = _getEffectShader[1],
          phaseID = _getEffectShader[2],
          srcShaderInfo = _getEffectShader[3];
        if (srcShaderInfo === null || validateShaderInfo(srcShaderInfo)) {
          error("program: " + programName + " not found");
          return 1;
        }
        assert(passID !== INVALID_ID$1 && phaseID !== INVALID_ID$1);
        var subpassOrPassID = subpassID === INVALID_ID$1 ? passID : subpassID;
        var passLayout = lg.getLayout(subpassOrPassID);
        var phaseLayout = lg.getLayout(phaseID);
        var group = _this.phases.get(phaseID);
        if (group === undefined) {
          group = new ProgramGroup();
          _this.phases.set(phaseID, group);
        }
        var phasePrograms = group.programInfos;
        var programInfo = makeProgramInfo(effect.name, srcShaderInfo);
        var programData = null;
        if (!_this.mergeHighFrequency) {
          var phase = lg.j(phaseID);
          programData = new ShaderProgramData();
          buildProgramData(programName, srcShaderInfo, lg, phase, programData, _this.fixedLocal);
        }
        var _makeShaderInfo = makeShaderInfo(lg, passLayout, phaseLayout, srcShaderInfo, programData, _this.fixedLocal),
          shaderInfo = _makeShaderInfo[0],
          blockSizes = _makeShaderInfo[1];
        overwriteProgramBlockInfo(shaderInfo, programInfo);
        var handleMap = genHandles(shaderInfo);
        var attributes = [];
        programInfo.attributes.forEach(function (attr) {
          attributes.push(new Attribute(attr.name, attr.format, attr.isNormalized, 0, attr.isInstanced, attr.location));
        });
        var info = new ProgramInfo(programInfo, shaderInfo, attributes, blockSizes, handleMap);
        phasePrograms.set(srcShaderInfo.name, info);
      };
      for (var _iterator36 = _createForOfIteratorHelperLoose(tech.passes), _step36; !(_step36 = _iterator36()).done;) {
        if (_loop3()) continue;
      }
    }
  };
  _proto.precompileEffect = function precompileEffect(device, effect) {
    var _this2 = this;
    var lg = this.layoutGraph;
    for (var _iterator37 = _createForOfIteratorHelperLoose(effect.techniques), _step37; !(_step37 = _iterator37()).done;) {
      var tech = _step37.value;
      var _loop4 = function _loop4() {
          var pass = _step38.value;
          var programName = pass.program;
          var _getEffectShader2 = getEffectShader(lg, effect, pass),
            passID = _getEffectShader2[0];
            _getEffectShader2[1];
            var phaseID = _getEffectShader2[2],
            srcShaderInfo = _getEffectShader2[3],
            shaderID = _getEffectShader2[4];
          if (srcShaderInfo === null || validateShaderInfo(srcShaderInfo)) {
            error("program: " + programName + " not valid");
            return 0;
          }
          assert(passID !== INVALID_ID$1 && phaseID !== INVALID_ID$1 && shaderID !== INVALID_ID$1);
          var combination = effect.combinations[shaderID];
          if (!combination) {
            return 0;
          }
          var defines = getCombinationDefines(combination);
          defines.forEach(function (defines) {
            return _this2.getProgramVariant(device, phaseID, programName, defines);
          });
        },
        _ret;
      for (var _iterator38 = _createForOfIteratorHelperLoose(tech.passes), _step38; !(_step38 = _iterator38()).done;) {
        _ret = _loop4();
        if (_ret === 0) continue;
      }
    }
  };
  _proto.getProgramInfo = function getProgramInfo(phaseID, programName) {
    assert(phaseID !== INVALID_ID$1);
    var group = this.phases.get(phaseID);
    var info = group.programInfos.get(programName);
    return info.programInfo;
  };
  _proto.getShaderInfo = function getShaderInfo(phaseID, programName) {
    assert(phaseID !== INVALID_ID$1);
    var group = this.phases.get(phaseID);
    var info = group.programInfos.get(programName);
    return info.shaderInfo;
  };
  _proto.getKey = function getKey(phaseID, programName, defines) {
    assert(phaseID !== INVALID_ID$1);
    var group = this.phases.get(phaseID);
    if (group === undefined) {
      error("Invalid render phase, program: " + programName);
      return '';
    }
    var info = group.programInfos.get(programName);
    if (info === undefined) {
      error("Invalid program, program: " + programName);
      return '';
    }
    return getVariantKey(info.programInfo, defines);
  };
  _proto.getProgramVariant = function getProgramVariant(device, phaseID, name, defines, key) {
    var _this$pipeline;
    if (key === void 0) {
      key = null;
    }
    Object.assign(defines, (_this$pipeline = this.pipeline) == null ? void 0 : _this$pipeline.macros);
    assert(phaseID !== INVALID_ID$1);
    var group = this.phases.get(phaseID);
    if (group === undefined) {
      error("Invalid render phase, program: " + name);
      return null;
    }
    var info = group.programInfos.get(name);
    if (info === undefined) {
      error("Invalid program, program: " + name);
      return null;
    }
    var programInfo = info.programInfo;
    if (key === null) {
      key = getVariantKey(programInfo, defines);
    }
    var programHosts = group.programProxies;
    var programHost = programHosts.get(key);
    if (programHost !== undefined) {
      return programHost;
    }
    var macroArray = prepareDefines(defines, programInfo.defines);
    var prefix = this.layoutGraph.constantMacros + programInfo.constantMacros + macroArray.reduce(function (acc, cur) {
      return acc + "#define " + cur.name + " " + cur.value + "\n";
    }, '');
    var src = programInfo.glsl3;
    var deviceShaderVersion = getDeviceShaderVersion(device);
    if (deviceShaderVersion) {
      src = programInfo[deviceShaderVersion];
    } else {
      errorID(16346);
    }
    var shaderInfo = info.shaderInfo;
    if (src.compute) {
      shaderInfo.stages[0].source = prefix + src.compute;
      shaderInfo.stages[0].stage = ShaderStageFlagBit.COMPUTE;
      shaderInfo.stages.length = 1;
    } else {
      shaderInfo.stages[0].source = prefix + src.vert;
      shaderInfo.stages[1].source = prefix + src.frag;
    }
    shaderInfo.attributes = getActiveAttributes(programInfo, info.attributes, defines);
    shaderInfo.name = getShaderInstanceName(name, macroArray);
    var shader = device.createShader(shaderInfo);
    var host = new WebProgramProxy(shader);
    programHosts.set(key, host);
    return host;
  };
  _proto.getMaterialDescriptorSetLayout = function getMaterialDescriptorSetLayout(device, phaseID, programName) {
    if (this.mergeHighFrequency) {
      assert(phaseID !== INVALID_ID$1);
      var subpassOrPassID = this.layoutGraph.getParent(phaseID);
      return getOrCreateDescriptorSetLayout(this.layoutGraph, subpassOrPassID, phaseID, UpdateFrequency.PER_BATCH);
    }
    return getOrCreateProgramDescriptorSetLayout(device, this.layoutGraph, phaseID, programName, UpdateFrequency.PER_BATCH);
  };
  _proto.getLocalDescriptorSetLayout = function getLocalDescriptorSetLayout(device, phaseID, programName) {
    if (this.mergeHighFrequency) {
      assert(phaseID !== INVALID_ID$1);
      var subpassOrPassID = this.layoutGraph.getParent(phaseID);
      return getOrCreateDescriptorSetLayout(this.layoutGraph, subpassOrPassID, phaseID, UpdateFrequency.PER_INSTANCE);
    }
    return getOrCreateProgramDescriptorSetLayout(device, this.layoutGraph, phaseID, programName, UpdateFrequency.PER_INSTANCE);
  };
  _proto.getBlockSizes = function getBlockSizes(phaseID, programName) {
    assert(phaseID !== INVALID_ID$1);
    var group = this.phases.get(phaseID);
    if (!group) {
      error("Invalid render phase, program: " + programName);
      return [];
    }
    var info = group.programInfos.get(programName);
    if (!info) {
      error("Invalid program, program: " + programName);
      return [];
    }
    return info.blockSizes;
  };
  _proto.getHandleMap = function getHandleMap(phaseID, programName) {
    assert(phaseID !== INVALID_ID$1);
    var group = this.phases.get(phaseID);
    if (!group) {
      error("Invalid render phase, program: " + programName);
      return {};
    }
    var info = group.programInfos.get(programName);
    if (!info) {
      error("Invalid program, program: " + programName);
      return {};
    }
    return info.handleMap;
  };
  _proto.getPipelineLayout = function getPipelineLayout(device, phaseID, programName) {
    if (this.mergeHighFrequency) {
      assert(phaseID !== INVALID_ID$1);
      var layout = this.layoutGraph.j(phaseID);
      return layout.pipelineLayout;
    }
    var lg = this.layoutGraph;
    var phase = lg.j(phaseID);
    var programID = phase.shaderIndex.get(programName);
    if (programID === undefined) {
      return getEmptyPipelineLayout();
    }
    var programData = phase.shaderPrograms[programID];
    if (programData.pipelineLayout) {
      return programData.pipelineLayout;
    }
    var subpassOrPassID = lg.getParent(phaseID);
    if (subpassOrPassID === INVALID_ID$1) {
      return getEmptyPipelineLayout();
    }
    var info = new PipelineLayoutInfo();
    var passSet = getDescriptorSetLayout(this.layoutGraph, subpassOrPassID, phaseID, UpdateFrequency.PER_PASS);
    if (passSet) {
      info.setLayouts.push(passSet);
    }
    var phaseSet = getDescriptorSetLayout(this.layoutGraph, subpassOrPassID, phaseID, UpdateFrequency.PER_PHASE);
    if (phaseSet) {
      info.setLayouts.push(phaseSet);
    }
    var batchSet = getProgramDescriptorSetLayout(device, lg, phaseID, programName, UpdateFrequency.PER_BATCH);
    if (batchSet) {
      info.setLayouts.push(batchSet);
    }
    var instanceSet = getProgramDescriptorSetLayout(device, lg, phaseID, programName, UpdateFrequency.PER_INSTANCE);
    if (instanceSet) {
      info.setLayouts.push(instanceSet);
    }
    programData.pipelineLayout = device.createPipelineLayout(info);
    return programData.pipelineLayout;
  };
  _proto.getProgramID = function getProgramID$1(phaseID, programName) {
    return getProgramID(this.layoutGraph, phaseID, programName);
  };
  _proto.getDescriptorNameID = function getDescriptorNameID$1(name) {
    return getDescriptorNameID(this.layoutGraph, name);
  };
  _proto.getDescriptorName = function getDescriptorName$1(nameID) {
    return getDescriptorName(this.layoutGraph, nameID);
  };
  return WebProgramLibrary;
}();

var editorPipelineSettings = null;
var forceResize = false;
function setEditorPipelineSettings(settings) {
  editorPipelineSettings = settings;
  forceResize = true;
}
function getEditorPipelineSettings() {
  return editorPipelineSettings;
}
function forceResizeAllWindows() {
  forceResize = true;
}
function defaultWindowResize(ppl, window, width, height) {
  ppl.addRenderWindow(window.colorName, Format.BGRA8, width, height, window);
  ppl.addDepthStencil(window.depthStencilName, Format.DEPTH_STENCIL, width, height);
  var id = window.renderWindowId;
  var shadowFormat = supportsR32FloatTexture(ppl.device) ? Format.R32F : Format.RGBA8;
  var shadowSize = ppl.pipelineSceneData.shadows.size;
  ppl.addRenderTarget("ShadowMap" + id, shadowFormat, shadowSize.x, shadowSize.y);
  ppl.addDepthStencil("ShadowDepth" + id, Format.DEPTH_STENCIL, shadowSize.x, shadowSize.y);
}
var _resizedWindows = [];
function dispatchResizeEvents(cameras, builder, ppl) {
  if (!builder.windowResize) {
    return;
  }
  for (var _iterator = _createForOfIteratorHelperLoose(cameras), _step; !(_step = _iterator()).done;) {
    var camera = _step.value;
    if (!camera.window.isRenderWindowResized() && !forceResize) {
      continue;
    }
    var width = Math.max(Math.floor(camera.window.width), 1);
    var height = Math.max(Math.floor(camera.window.height), 1);
    builder.windowResize(ppl, camera.window, camera, width, height);
    _resizedWindows.push(camera.window);
  }
  for (var _iterator2 = _createForOfIteratorHelperLoose(_resizedWindows), _step2; !(_step2 = _iterator2()).done;) {
    var window = _step2.value;
    window.setRenderWindowResizeHandled();
  }
  _resizedWindows.length = 0;
  forceResize = false;
}

var INVALID_ID = 0xFFFFFFFF;
var defaultLayoutGraph = new LayoutGraphData();
var LAYOUT_HEADER_SIZE = 8;
var enableEffectImport = true;
var programLib = new WebProgramLibrary(defaultLayoutGraph);
function createCustomPipeline() {
  var layoutGraph = defaultLayoutGraph;
  var ppl = new WebPipeline(layoutGraph);
  var pplName = macro.CUSTOM_PIPELINE_NAME;
  ppl.setCustomPipelineName(pplName);
  programLib.pipeline = ppl;
  return ppl;
}
var customPipelineBuilderMap = new Map();
function setCustomPipeline(name, builder) {
  customPipelineBuilderMap.set(name, builder);
  forceResizeAllWindows();
}
function getCustomPipeline(name) {
  var builder = customPipelineBuilderMap.get(name);
  if (!builder) {
    builder = customPipelineBuilderMap.get('Forward');
  }
  return builder;
}
function init(device, arrayBuffer) {
  if (arrayBuffer && arrayBuffer.byteLength >= LAYOUT_HEADER_SIZE) {
    var uint8Array = new Uint8Array(arrayBuffer);
    var header = new DataView(uint8Array.buffer, uint8Array.byteOffset, LAYOUT_HEADER_SIZE);
    if (header.getUint32(0) === INVALID_ID) {
      var inflator = new _p.Inflate(new Uint8Array(uint8Array.buffer, uint8Array.byteOffset + LAYOUT_HEADER_SIZE));
      var decompressed = inflator.decompress();
      var readBinaryData = new BinaryInputArchive(decompressed.buffer, decompressed.byteOffset);
      loadLayoutGraphData(readBinaryData, defaultLayoutGraph);
    } else {
      var _readBinaryData = new BinaryInputArchive(uint8Array.buffer, uint8Array.byteOffset);
      loadLayoutGraphData(_readBinaryData, defaultLayoutGraph);
    }
  }
  initializeLayoutGraphData(device, defaultLayoutGraph);
}
function destroy() {
  terminateLayoutGraphData(defaultLayoutGraph);
}
function getPassID(name) {
  return getCustomPassID(defaultLayoutGraph, name);
}
function getSubpassID(passID, name) {
  return getCustomSubpassID(defaultLayoutGraph, passID, name);
}
function getPhaseID(passID, name) {
  return getCustomPhaseID(defaultLayoutGraph, passID, name);
}
function completePhaseName(name) {
  if (typeof name === 'number') {
    return name.toString();
  } else if (typeof name === 'string') {
    return name;
  } else {
    return 'default';
  }
}

var rendering = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get AccessType () { return AccessType; },
    AttachmentType: AttachmentType,
    ClearValueType: ClearValueType,
    CopyPair: CopyPair,
    INVALID_ID: INVALID_ID,
    LightInfo: LightInfo,
    LightingMode: LightingMode,
    MovePair: MovePair,
    ParameterType: ParameterType,
    PipelineCapabilities: PipelineCapabilities,
    PipelineStatistics: PipelineStatistics,
    get PipelineType () { return PipelineType; },
    get QueueHint () { return QueueHint; },
    RenderCommonObjectPool: RenderCommonObjectPool,
    ResolveFlags: ResolveFlags,
    ResolvePair: ResolvePair,
    get ResourceDimension () { return ResourceDimension; },
    get ResourceFlags () { return ResourceFlags; },
    get ResourceResidency () { return ResourceResidency; },
    get SceneFlags () { return SceneFlags; },
    get SubpassCapabilities () { return SubpassCapabilities; },
    TaskType: TaskType,
    get UpdateFrequency () { return UpdateFrequency; },
    UploadPair: UploadPair,
    completePhaseName: completePhaseName,
    createCustomPipeline: createCustomPipeline,
    customPipelineBuilderMap: customPipelineBuilderMap,
    defaultWindowResize: defaultWindowResize,
    destroy: destroy,
    dispatchResizeEvents: dispatchResizeEvents,
    enableEffectImport: enableEffectImport,
    forceResizeAllWindows: forceResizeAllWindows,
    getCustomPipeline: getCustomPipeline,
    getEditorPipelineSettings: getEditorPipelineSettings,
    getPassID: getPassID,
    getPhaseID: getPhaseID,
    getSubpassID: getSubpassID,
    init: init,
    loadCopyPair: loadCopyPair,
    loadLightInfo: loadLightInfo,
    loadMovePair: loadMovePair,
    loadPipelineStatistics: loadPipelineStatistics,
    loadResolvePair: loadResolvePair,
    packRGBE: packRGBE,
    programLib: programLib,
    saveCopyPair: saveCopyPair,
    saveLightInfo: saveLightInfo,
    saveMovePair: saveMovePair,
    savePipelineStatistics: savePipelineStatistics,
    saveResolvePair: saveResolvePair,
    setCustomPipeline: setCustomPipeline,
    setEditorPipelineSettings: setEditorPipelineSettings
});

export { LightInfo as L, QueueHint as Q, ResourceResidency as R, SceneFlags as S, getCameraUniqueID as a, buildShadowPasses as b, getRenderArea as g, rendering as r, setCustomPipeline as s };
//# sourceMappingURL=index-ihqn3EMi.js.map
