import { E as Enum, y as BitMask, z as _extends, s as settings, S as SettingsCategory, w as warnID, o as assertIsTrue, g as getError, v as value, A as log2, a as _createClass, R as RecyclePool } from './gc-object-CShF5lzx.js';
import { l as legacyCC, c as cclegacy } from './global-exports-DnCP_14L.js';
import './index-uXI1_UMk.js';
import './device-manager-CBXP-ttm.js';
import { K as BindingMappingInfo, L as DescriptorSetLayoutBinding, N as DescriptorType, O as ShaderStageFlagBit, U as UniformBlock, V as Uniform, W as Type, X as UniformSamplerTexture, Y as MemoryAccessBit, Z as ViewDimension, F as Format, _ as FormatFeatureBit, $ as API, z as TextureInfo, E as TextureType, H as TextureUsageBit, a0 as TextureFlagBit, a1 as SampleCount, a2 as InputState, P as PipelineStateInfo } from './buffer-barrier-BlQXg9Aa.js';

var layerList = {
  NONE: 0,
  IGNORE_RAYCAST: 1 << 20,
  GIZMOS: 1 << 21,
  EDITOR: 1 << 22,
  UI_3D: 1 << 23,
  SCENE_GIZMO: 1 << 24,
  UI_2D: 1 << 25,
  PROFILER: 1 << 28,
  DEFAULT: 1 << 30,
  ALL: 0xffffffff
};
var Layers = function () {
  function Layers() {}
  Layers.init = function init() {
    var userLayers = settings.querySettings(SettingsCategory.ENGINE, 'customLayers');
    if (!userLayers) return;
    for (var i = 0; i < userLayers.length; i++) {
      var layer = userLayers[i];
      Layers.addLayer(layer.name, layer.bit);
    }
  };
  Layers.makeMaskInclude = function makeMaskInclude(includes) {
    return includes.reduce(function (mask, inc) {
      return mask | inc;
    }, 0);
  };
  Layers.makeMaskExclude = function makeMaskExclude(excludes) {
    return ~Layers.makeMaskInclude(excludes);
  };
  Layers.addLayer = function addLayer(name, bitNum) {
    if (bitNum === undefined) {
      warnID(16364);
      return;
    }
    if (bitNum > 19 || bitNum < 0) {
      warnID(16365);
      return;
    }
    var val = 1 << bitNum;
    assertIsTrue(!Layers.Enum[name], getError(2104, name));
    Layers.Enum[name] = val;
    value(Layers.Enum, String(val), name);
    Layers.BitMask[name] = val;
    value(Layers.BitMask, String(val), name);
    BitMask.update(Layers.BitMask);
    Enum.update(Layers.Enum);
  };
  Layers.deleteLayer = function deleteLayer(bitNum) {
    if (bitNum > 19 || bitNum < 0) {
      warnID(16366);
      return;
    }
    var val = 1 << bitNum;
    delete Layers.Enum[Layers.Enum[val]];
    delete Layers.Enum[val];
    delete Layers.BitMask[Layers.BitMask[val]];
    delete Layers.BitMask[val];
    BitMask.update(Layers.BitMask);
    Enum.update(Layers.Enum);
  };
  Layers.nameToLayer = function nameToLayer(name) {
    if (name === undefined) {
      warnID(16367);
      return -1;
    }
    return log2(Layers.Enum[name]);
  };
  Layers.layerToName = function layerToName(bitNum) {
    if (bitNum > 31 || bitNum < 0) {
      warnID(16368);
      return '';
    }
    return Layers.Enum[1 << bitNum];
  };
  return Layers;
}();
Layers.Enum = Enum(layerList);
Layers.BitMask = BitMask(_extends({}, layerList));
legacyCC.Layers = Layers;

var _UBOGlobal, _UBOCamera, _UBOShadow, _UBOCSM, _UBOLocal, _UBOWorldBound, _UBOLocalBatched, _UBOForwardLight, _UBOSkinningTexture, _UBOSkinningAnimation, _UBOSkinning, _UBOMorph, _UBOUILocal, _UBOSH;
var PIPELINE_FLOW_MAIN = 'MainFlow';
var PIPELINE_FLOW_FORWARD = 'ForwardFlow';
var PIPELINE_FLOW_SHADOW = 'ShadowFlow';
var PIPELINE_FLOW_SMAA = 'SMAAFlow';
var PIPELINE_FLOW_TONEMAP = 'ToneMapFlow';
var RenderPassStage;
(function (RenderPassStage) {
  RenderPassStage[RenderPassStage["DEFAULT"] = 100] = "DEFAULT";
  RenderPassStage[RenderPassStage["UI"] = 200] = "UI";
})(RenderPassStage || (RenderPassStage = {}));
cclegacy.RenderPassStage = RenderPassStage;
var RenderPriority;
(function (RenderPriority) {
  RenderPriority[RenderPriority["MIN"] = 0] = "MIN";
  RenderPriority[RenderPriority["MAX"] = 255] = "MAX";
  RenderPriority[RenderPriority["DEFAULT"] = 128] = "DEFAULT";
})(RenderPriority || (RenderPriority = {}));
var globalDescriptorSetLayout = {
  bindings: [],
  layouts: {}
};
var localDescriptorSetLayout = {
  bindings: [],
  layouts: {}
};
var PipelineGlobalBindings;
(function (PipelineGlobalBindings) {
  PipelineGlobalBindings[PipelineGlobalBindings["UBO_GLOBAL"] = 0] = "UBO_GLOBAL";
  PipelineGlobalBindings[PipelineGlobalBindings["UBO_CAMERA"] = 1] = "UBO_CAMERA";
  PipelineGlobalBindings[PipelineGlobalBindings["UBO_SHADOW"] = 2] = "UBO_SHADOW";
  PipelineGlobalBindings[PipelineGlobalBindings["UBO_CSM"] = 3] = "UBO_CSM";
  PipelineGlobalBindings[PipelineGlobalBindings["SAMPLER_SHADOWMAP"] = 4] = "SAMPLER_SHADOWMAP";
  PipelineGlobalBindings[PipelineGlobalBindings["SAMPLER_ENVIRONMENT"] = 5] = "SAMPLER_ENVIRONMENT";
  PipelineGlobalBindings[PipelineGlobalBindings["SAMPLER_SPOT_SHADOW_MAP"] = 6] = "SAMPLER_SPOT_SHADOW_MAP";
  PipelineGlobalBindings[PipelineGlobalBindings["SAMPLER_DIFFUSEMAP"] = 7] = "SAMPLER_DIFFUSEMAP";
  PipelineGlobalBindings[PipelineGlobalBindings["COUNT"] = 8] = "COUNT";
})(PipelineGlobalBindings || (PipelineGlobalBindings = {}));
var GLOBAL_UBO_COUNT = PipelineGlobalBindings.SAMPLER_SHADOWMAP;
var GLOBAL_SAMPLER_COUNT = PipelineGlobalBindings.COUNT - GLOBAL_UBO_COUNT;
var ModelLocalBindings;
(function (ModelLocalBindings) {
  ModelLocalBindings[ModelLocalBindings["UBO_LOCAL"] = 0] = "UBO_LOCAL";
  ModelLocalBindings[ModelLocalBindings["UBO_FORWARD_LIGHTS"] = 1] = "UBO_FORWARD_LIGHTS";
  ModelLocalBindings[ModelLocalBindings["UBO_SKINNING_ANIMATION"] = 2] = "UBO_SKINNING_ANIMATION";
  ModelLocalBindings[ModelLocalBindings["UBO_SKINNING_TEXTURE"] = 3] = "UBO_SKINNING_TEXTURE";
  ModelLocalBindings[ModelLocalBindings["UBO_MORPH"] = 4] = "UBO_MORPH";
  ModelLocalBindings[ModelLocalBindings["UBO_UI_LOCAL"] = 5] = "UBO_UI_LOCAL";
  ModelLocalBindings[ModelLocalBindings["UBO_SH"] = 6] = "UBO_SH";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_JOINTS"] = 7] = "SAMPLER_JOINTS";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_MORPH_POSITION"] = 8] = "SAMPLER_MORPH_POSITION";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_MORPH_NORMAL"] = 9] = "SAMPLER_MORPH_NORMAL";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_MORPH_TANGENT"] = 10] = "SAMPLER_MORPH_TANGENT";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_LIGHTMAP"] = 11] = "SAMPLER_LIGHTMAP";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_SPRITE"] = 12] = "SAMPLER_SPRITE";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_REFLECTION_PROBE_CUBE"] = 13] = "SAMPLER_REFLECTION_PROBE_CUBE";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_REFLECTION_PROBE_PLANAR"] = 14] = "SAMPLER_REFLECTION_PROBE_PLANAR";
  ModelLocalBindings[ModelLocalBindings["SAMPLER_REFLECTION_PROBE_DATA_MAP"] = 15] = "SAMPLER_REFLECTION_PROBE_DATA_MAP";
  ModelLocalBindings[ModelLocalBindings["COUNT"] = 16] = "COUNT";
})(ModelLocalBindings || (ModelLocalBindings = {}));
var LOCAL_UBO_COUNT = ModelLocalBindings.SAMPLER_JOINTS;
var LOCAL_SAMPLER_COUNT = ModelLocalBindings.COUNT - LOCAL_UBO_COUNT;
var LOCAL_STORAGE_IMAGE_COUNT = ModelLocalBindings.COUNT - LOCAL_UBO_COUNT - LOCAL_SAMPLER_COUNT;
var SetIndex;
(function (SetIndex) {
  SetIndex[SetIndex["GLOBAL"] = 0] = "GLOBAL";
  SetIndex[SetIndex["MATERIAL"] = 1] = "MATERIAL";
  SetIndex[SetIndex["LOCAL"] = 2] = "LOCAL";
  SetIndex[SetIndex["COUNT"] = 3] = "COUNT";
})(SetIndex || (SetIndex = {}));
var bindingMappingInfo = new BindingMappingInfo([GLOBAL_UBO_COUNT, 0, LOCAL_UBO_COUNT, 0], [GLOBAL_SAMPLER_COUNT, 0, LOCAL_SAMPLER_COUNT, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, LOCAL_STORAGE_IMAGE_COUNT, 0], [0, 0, 0, 0], [0, 2, 1, 3]);
var UBOGlobalEnum;
(function (UBOGlobalEnum) {
  UBOGlobalEnum[UBOGlobalEnum["TIME_OFFSET"] = 0] = "TIME_OFFSET";
  UBOGlobalEnum[UBOGlobalEnum["SCREEN_SIZE_OFFSET"] = 4] = "SCREEN_SIZE_OFFSET";
  UBOGlobalEnum[UBOGlobalEnum["NATIVE_SIZE_OFFSET"] = 8] = "NATIVE_SIZE_OFFSET";
  UBOGlobalEnum[UBOGlobalEnum["PROBE_INFO_OFFSET"] = 12] = "PROBE_INFO_OFFSET";
  UBOGlobalEnum[UBOGlobalEnum["DEBUG_VIEW_MODE_OFFSET"] = 16] = "DEBUG_VIEW_MODE_OFFSET";
  UBOGlobalEnum[UBOGlobalEnum["COUNT"] = 20] = "COUNT";
  UBOGlobalEnum[UBOGlobalEnum["SIZE"] = 80] = "SIZE";
})(UBOGlobalEnum || (UBOGlobalEnum = {}));
var UBOGlobal = function UBOGlobal() {};
_UBOGlobal = UBOGlobal;
UBOGlobal.TIME_OFFSET = UBOGlobalEnum.TIME_OFFSET;
UBOGlobal.SCREEN_SIZE_OFFSET = UBOGlobalEnum.SCREEN_SIZE_OFFSET;
UBOGlobal.NATIVE_SIZE_OFFSET = UBOGlobalEnum.NATIVE_SIZE_OFFSET;
UBOGlobal.PROBE_INFO_OFFSET = UBOGlobalEnum.PROBE_INFO_OFFSET;
UBOGlobal.DEBUG_VIEW_MODE_OFFSET = UBOGlobalEnum.DEBUG_VIEW_MODE_OFFSET;
UBOGlobal.COUNT = UBOGlobalEnum.COUNT;
UBOGlobal.SIZE = UBOGlobalEnum.SIZE;
UBOGlobal.NAME = 'CCGlobal';
UBOGlobal.BINDING = PipelineGlobalBindings.UBO_GLOBAL;
UBOGlobal.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOGlobal.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.ALL);
UBOGlobal.LAYOUT = new UniformBlock(SetIndex.GLOBAL, _UBOGlobal.BINDING, _UBOGlobal.NAME, [new Uniform('cc_time', Type.FLOAT4, 1), new Uniform('cc_screenSize', Type.FLOAT4, 1), new Uniform('cc_nativeSize', Type.FLOAT4, 1), new Uniform('cc_probeInfo', Type.FLOAT4, 1), new Uniform('cc_debug_view_mode', Type.FLOAT4, 1)], 1);
globalDescriptorSetLayout.layouts[UBOGlobal.NAME] = UBOGlobal.LAYOUT;
globalDescriptorSetLayout.bindings[UBOGlobal.BINDING] = UBOGlobal.DESCRIPTOR;
var UBOCameraEnum;
(function (UBOCameraEnum) {
  UBOCameraEnum[UBOCameraEnum["MAT_VIEW_OFFSET"] = 0] = "MAT_VIEW_OFFSET";
  UBOCameraEnum[UBOCameraEnum["MAT_VIEW_INV_OFFSET"] = 16] = "MAT_VIEW_INV_OFFSET";
  UBOCameraEnum[UBOCameraEnum["MAT_PROJ_OFFSET"] = 32] = "MAT_PROJ_OFFSET";
  UBOCameraEnum[UBOCameraEnum["MAT_PROJ_INV_OFFSET"] = 48] = "MAT_PROJ_INV_OFFSET";
  UBOCameraEnum[UBOCameraEnum["MAT_VIEW_PROJ_OFFSET"] = 64] = "MAT_VIEW_PROJ_OFFSET";
  UBOCameraEnum[UBOCameraEnum["MAT_VIEW_PROJ_INV_OFFSET"] = 80] = "MAT_VIEW_PROJ_INV_OFFSET";
  UBOCameraEnum[UBOCameraEnum["CAMERA_POS_OFFSET"] = 96] = "CAMERA_POS_OFFSET";
  UBOCameraEnum[UBOCameraEnum["SURFACE_TRANSFORM_OFFSET"] = 100] = "SURFACE_TRANSFORM_OFFSET";
  UBOCameraEnum[UBOCameraEnum["SCREEN_SCALE_OFFSET"] = 104] = "SCREEN_SCALE_OFFSET";
  UBOCameraEnum[UBOCameraEnum["EXPOSURE_OFFSET"] = 108] = "EXPOSURE_OFFSET";
  UBOCameraEnum[UBOCameraEnum["MAIN_LIT_DIR_OFFSET"] = 112] = "MAIN_LIT_DIR_OFFSET";
  UBOCameraEnum[UBOCameraEnum["MAIN_LIT_COLOR_OFFSET"] = 116] = "MAIN_LIT_COLOR_OFFSET";
  UBOCameraEnum[UBOCameraEnum["AMBIENT_SKY_OFFSET"] = 120] = "AMBIENT_SKY_OFFSET";
  UBOCameraEnum[UBOCameraEnum["AMBIENT_GROUND_OFFSET"] = 124] = "AMBIENT_GROUND_OFFSET";
  UBOCameraEnum[UBOCameraEnum["GLOBAL_FOG_COLOR_OFFSET"] = 128] = "GLOBAL_FOG_COLOR_OFFSET";
  UBOCameraEnum[UBOCameraEnum["GLOBAL_FOG_BASE_OFFSET"] = 132] = "GLOBAL_FOG_BASE_OFFSET";
  UBOCameraEnum[UBOCameraEnum["GLOBAL_FOG_ADD_OFFSET"] = 136] = "GLOBAL_FOG_ADD_OFFSET";
  UBOCameraEnum[UBOCameraEnum["NEAR_FAR_OFFSET"] = 140] = "NEAR_FAR_OFFSET";
  UBOCameraEnum[UBOCameraEnum["VIEW_PORT_OFFSET"] = 144] = "VIEW_PORT_OFFSET";
  UBOCameraEnum[UBOCameraEnum["COUNT"] = 148] = "COUNT";
  UBOCameraEnum[UBOCameraEnum["SIZE"] = 592] = "SIZE";
})(UBOCameraEnum || (UBOCameraEnum = {}));
var UBOCamera = function UBOCamera() {};
_UBOCamera = UBOCamera;
UBOCamera.MAT_VIEW_OFFSET = UBOCameraEnum.MAT_VIEW_OFFSET;
UBOCamera.MAT_VIEW_INV_OFFSET = UBOCameraEnum.MAT_VIEW_INV_OFFSET;
UBOCamera.MAT_PROJ_OFFSET = UBOCameraEnum.MAT_PROJ_OFFSET;
UBOCamera.MAT_PROJ_INV_OFFSET = UBOCameraEnum.MAT_PROJ_INV_OFFSET;
UBOCamera.MAT_VIEW_PROJ_OFFSET = UBOCameraEnum.MAT_VIEW_PROJ_OFFSET;
UBOCamera.MAT_VIEW_PROJ_INV_OFFSET = UBOCameraEnum.MAT_VIEW_PROJ_INV_OFFSET;
UBOCamera.CAMERA_POS_OFFSET = UBOCameraEnum.CAMERA_POS_OFFSET;
UBOCamera.SURFACE_TRANSFORM_OFFSET = UBOCameraEnum.SURFACE_TRANSFORM_OFFSET;
UBOCamera.SCREEN_SCALE_OFFSET = UBOCameraEnum.SCREEN_SCALE_OFFSET;
UBOCamera.EXPOSURE_OFFSET = UBOCameraEnum.EXPOSURE_OFFSET;
UBOCamera.MAIN_LIT_DIR_OFFSET = UBOCameraEnum.MAIN_LIT_DIR_OFFSET;
UBOCamera.MAIN_LIT_COLOR_OFFSET = UBOCameraEnum.MAIN_LIT_COLOR_OFFSET;
UBOCamera.AMBIENT_SKY_OFFSET = UBOCameraEnum.AMBIENT_SKY_OFFSET;
UBOCamera.AMBIENT_GROUND_OFFSET = UBOCameraEnum.AMBIENT_GROUND_OFFSET;
UBOCamera.GLOBAL_FOG_COLOR_OFFSET = UBOCameraEnum.GLOBAL_FOG_COLOR_OFFSET;
UBOCamera.GLOBAL_FOG_BASE_OFFSET = UBOCameraEnum.GLOBAL_FOG_BASE_OFFSET;
UBOCamera.GLOBAL_FOG_ADD_OFFSET = UBOCameraEnum.GLOBAL_FOG_ADD_OFFSET;
UBOCamera.NEAR_FAR_OFFSET = UBOCameraEnum.NEAR_FAR_OFFSET;
UBOCamera.VIEW_PORT_OFFSET = UBOCameraEnum.VIEW_PORT_OFFSET;
UBOCamera.COUNT = UBOCameraEnum.COUNT;
UBOCamera.SIZE = UBOCameraEnum.SIZE;
UBOCamera.NAME = 'CCCamera';
UBOCamera.BINDING = PipelineGlobalBindings.UBO_CAMERA;
UBOCamera.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOCamera.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.ALL);
UBOCamera.LAYOUT = new UniformBlock(SetIndex.GLOBAL, _UBOCamera.BINDING, _UBOCamera.NAME, [new Uniform('cc_matView', Type.MAT4, 1), new Uniform('cc_matViewInv', Type.MAT4, 1), new Uniform('cc_matProj', Type.MAT4, 1), new Uniform('cc_matProjInv', Type.MAT4, 1), new Uniform('cc_matViewProj', Type.MAT4, 1), new Uniform('cc_matViewProjInv', Type.MAT4, 1), new Uniform('cc_cameraPos', Type.FLOAT4, 1), new Uniform('cc_surfaceTransform', Type.FLOAT4, 1), new Uniform('cc_screenScale', Type.FLOAT4, 1), new Uniform('cc_exposure', Type.FLOAT4, 1), new Uniform('cc_mainLitDir', Type.FLOAT4, 1), new Uniform('cc_mainLitColor', Type.FLOAT4, 1), new Uniform('cc_ambientSky', Type.FLOAT4, 1), new Uniform('cc_ambientGround', Type.FLOAT4, 1), new Uniform('cc_fogColor', Type.FLOAT4, 1), new Uniform('cc_fogBase', Type.FLOAT4, 1), new Uniform('cc_fogAdd', Type.FLOAT4, 1), new Uniform('cc_nearFar', Type.FLOAT4, 1), new Uniform('cc_viewPort', Type.FLOAT4, 1)], 1);
globalDescriptorSetLayout.layouts[UBOCamera.NAME] = UBOCamera.LAYOUT;
globalDescriptorSetLayout.bindings[UBOCamera.BINDING] = UBOCamera.DESCRIPTOR;
var UBOShadowEnum;
(function (UBOShadowEnum) {
  UBOShadowEnum[UBOShadowEnum["MAT_LIGHT_VIEW_OFFSET"] = 0] = "MAT_LIGHT_VIEW_OFFSET";
  UBOShadowEnum[UBOShadowEnum["MAT_LIGHT_VIEW_PROJ_OFFSET"] = 16] = "MAT_LIGHT_VIEW_PROJ_OFFSET";
  UBOShadowEnum[UBOShadowEnum["SHADOW_INV_PROJ_DEPTH_INFO_OFFSET"] = 32] = "SHADOW_INV_PROJ_DEPTH_INFO_OFFSET";
  UBOShadowEnum[UBOShadowEnum["SHADOW_PROJ_DEPTH_INFO_OFFSET"] = 36] = "SHADOW_PROJ_DEPTH_INFO_OFFSET";
  UBOShadowEnum[UBOShadowEnum["SHADOW_PROJ_INFO_OFFSET"] = 40] = "SHADOW_PROJ_INFO_OFFSET";
  UBOShadowEnum[UBOShadowEnum["SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET"] = 44] = "SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET";
  UBOShadowEnum[UBOShadowEnum["SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET"] = 48] = "SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET";
  UBOShadowEnum[UBOShadowEnum["SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET"] = 52] = "SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET";
  UBOShadowEnum[UBOShadowEnum["SHADOW_COLOR_OFFSET"] = 56] = "SHADOW_COLOR_OFFSET";
  UBOShadowEnum[UBOShadowEnum["PLANAR_NORMAL_DISTANCE_INFO_OFFSET"] = 60] = "PLANAR_NORMAL_DISTANCE_INFO_OFFSET";
  UBOShadowEnum[UBOShadowEnum["COUNT"] = 64] = "COUNT";
  UBOShadowEnum[UBOShadowEnum["SIZE"] = 256] = "SIZE";
})(UBOShadowEnum || (UBOShadowEnum = {}));
var UBOShadow = function UBOShadow() {};
_UBOShadow = UBOShadow;
UBOShadow.MAT_LIGHT_VIEW_OFFSET = UBOShadowEnum.MAT_LIGHT_VIEW_OFFSET;
UBOShadow.MAT_LIGHT_VIEW_PROJ_OFFSET = UBOShadowEnum.MAT_LIGHT_VIEW_PROJ_OFFSET;
UBOShadow.SHADOW_INV_PROJ_DEPTH_INFO_OFFSET = UBOShadowEnum.SHADOW_INV_PROJ_DEPTH_INFO_OFFSET;
UBOShadow.SHADOW_PROJ_DEPTH_INFO_OFFSET = UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET;
UBOShadow.SHADOW_PROJ_INFO_OFFSET = UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET;
UBOShadow.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET = UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET;
UBOShadow.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET = UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET;
UBOShadow.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET = UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET;
UBOShadow.SHADOW_COLOR_OFFSET = UBOShadowEnum.SHADOW_COLOR_OFFSET;
UBOShadow.PLANAR_NORMAL_DISTANCE_INFO_OFFSET = UBOShadowEnum.PLANAR_NORMAL_DISTANCE_INFO_OFFSET;
UBOShadow.COUNT = UBOShadowEnum.COUNT;
UBOShadow.SIZE = UBOShadowEnum.SIZE;
UBOShadow.NAME = 'CCShadow';
UBOShadow.BINDING = PipelineGlobalBindings.UBO_SHADOW;
UBOShadow.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOShadow.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.ALL);
UBOShadow.LAYOUT = new UniformBlock(SetIndex.GLOBAL, _UBOShadow.BINDING, _UBOShadow.NAME, [new Uniform('cc_matLightView', Type.MAT4, 1), new Uniform('cc_matLightViewProj', Type.MAT4, 1), new Uniform('cc_shadowInvProjDepthInfo', Type.FLOAT4, 1), new Uniform('cc_shadowProjDepthInfo', Type.FLOAT4, 1), new Uniform('cc_shadowProjInfo', Type.FLOAT4, 1), new Uniform('cc_shadowNFLSInfo', Type.FLOAT4, 1), new Uniform('cc_shadowWHPBInfo', Type.FLOAT4, 1), new Uniform('cc_shadowLPNNInfo', Type.FLOAT4, 1), new Uniform('cc_shadowColor', Type.FLOAT4, 1), new Uniform('cc_planarNDInfo', Type.FLOAT4, 1)], 1);
globalDescriptorSetLayout.layouts[UBOShadow.NAME] = UBOShadow.LAYOUT;
globalDescriptorSetLayout.bindings[UBOShadow.BINDING] = UBOShadow.DESCRIPTOR;
var UBOCSMEnum;
(function (UBOCSMEnum) {
  UBOCSMEnum[UBOCSMEnum["CSM_LEVEL_COUNT"] = 4] = "CSM_LEVEL_COUNT";
  UBOCSMEnum[UBOCSMEnum["CSM_VIEW_DIR_0_OFFSET"] = 0] = "CSM_VIEW_DIR_0_OFFSET";
  UBOCSMEnum[UBOCSMEnum["CSM_VIEW_DIR_1_OFFSET"] = 16] = "CSM_VIEW_DIR_1_OFFSET";
  UBOCSMEnum[UBOCSMEnum["CSM_VIEW_DIR_2_OFFSET"] = 32] = "CSM_VIEW_DIR_2_OFFSET";
  UBOCSMEnum[UBOCSMEnum["CSM_ATLAS_OFFSET"] = 48] = "CSM_ATLAS_OFFSET";
  UBOCSMEnum[UBOCSMEnum["MAT_CSM_VIEW_PROJ_OFFSET"] = 64] = "MAT_CSM_VIEW_PROJ_OFFSET";
  UBOCSMEnum[UBOCSMEnum["CSM_PROJ_DEPTH_INFO_OFFSET"] = 128] = "CSM_PROJ_DEPTH_INFO_OFFSET";
  UBOCSMEnum[UBOCSMEnum["CSM_PROJ_INFO_OFFSET"] = 144] = "CSM_PROJ_INFO_OFFSET";
  UBOCSMEnum[UBOCSMEnum["CSM_SPLITS_INFO_OFFSET"] = 160] = "CSM_SPLITS_INFO_OFFSET";
  UBOCSMEnum[UBOCSMEnum["COUNT"] = 164] = "COUNT";
  UBOCSMEnum[UBOCSMEnum["SIZE"] = 656] = "SIZE";
})(UBOCSMEnum || (UBOCSMEnum = {}));
var UBOCSM = function UBOCSM() {};
_UBOCSM = UBOCSM;
UBOCSM.CSM_LEVEL_COUNT = UBOCSMEnum.CSM_LEVEL_COUNT;
UBOCSM.CSM_VIEW_DIR_0_OFFSET = UBOCSMEnum.CSM_VIEW_DIR_0_OFFSET;
UBOCSM.CSM_VIEW_DIR_1_OFFSET = UBOCSMEnum.CSM_VIEW_DIR_1_OFFSET;
UBOCSM.CSM_VIEW_DIR_2_OFFSET = UBOCSMEnum.CSM_VIEW_DIR_2_OFFSET;
UBOCSM.CSM_ATLAS_OFFSET = UBOCSMEnum.CSM_ATLAS_OFFSET;
UBOCSM.MAT_CSM_VIEW_PROJ_OFFSET = UBOCSMEnum.MAT_CSM_VIEW_PROJ_OFFSET;
UBOCSM.CSM_PROJ_DEPTH_INFO_OFFSET = UBOCSMEnum.CSM_PROJ_DEPTH_INFO_OFFSET;
UBOCSM.CSM_PROJ_INFO_OFFSET = UBOCSMEnum.CSM_PROJ_INFO_OFFSET;
UBOCSM.CSM_SPLITS_INFO_OFFSET = UBOCSMEnum.CSM_SPLITS_INFO_OFFSET;
UBOCSM.COUNT = UBOCSMEnum.COUNT;
UBOCSM.SIZE = UBOCSMEnum.SIZE;
UBOCSM.NAME = 'CCCSM';
UBOCSM.BINDING = PipelineGlobalBindings.UBO_CSM;
UBOCSM.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOCSM.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.FRAGMENT);
UBOCSM.LAYOUT = new UniformBlock(SetIndex.GLOBAL, _UBOCSM.BINDING, _UBOCSM.NAME, [new Uniform('cc_csmViewDir0', Type.FLOAT4, _UBOCSM.CSM_LEVEL_COUNT), new Uniform('cc_csmViewDir1', Type.FLOAT4, _UBOCSM.CSM_LEVEL_COUNT), new Uniform('cc_csmViewDir2', Type.FLOAT4, _UBOCSM.CSM_LEVEL_COUNT), new Uniform('cc_csmAtlas', Type.FLOAT4, _UBOCSM.CSM_LEVEL_COUNT), new Uniform('cc_matCSMViewProj', Type.MAT4, _UBOCSM.CSM_LEVEL_COUNT), new Uniform('cc_csmProjDepthInfo', Type.FLOAT4, _UBOCSM.CSM_LEVEL_COUNT), new Uniform('cc_csmProjInfo', Type.FLOAT4, _UBOCSM.CSM_LEVEL_COUNT), new Uniform('cc_csmSplitsInfo', Type.FLOAT4, 1)], 1);
globalDescriptorSetLayout.layouts[UBOCSM.NAME] = UBOCSM.LAYOUT;
globalDescriptorSetLayout.bindings[UBOCSM.BINDING] = UBOCSM.DESCRIPTOR;
var UNIFORM_SHADOWMAP_NAME = 'cc_shadowMap';
var UNIFORM_SHADOWMAP_BINDING = PipelineGlobalBindings.SAMPLER_SHADOWMAP;
var UNIFORM_SHADOWMAP_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_SHADOWMAP_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT);
var UNIFORM_SHADOWMAP_LAYOUT = new UniformSamplerTexture(SetIndex.GLOBAL, UNIFORM_SHADOWMAP_BINDING, UNIFORM_SHADOWMAP_NAME, Type.SAMPLER2D, 1);
globalDescriptorSetLayout.layouts[UNIFORM_SHADOWMAP_NAME] = UNIFORM_SHADOWMAP_LAYOUT;
globalDescriptorSetLayout.bindings[UNIFORM_SHADOWMAP_BINDING] = UNIFORM_SHADOWMAP_DESCRIPTOR;
var UNIFORM_ENVIRONMENT_NAME = 'cc_environment';
var UNIFORM_ENVIRONMENT_BINDING = PipelineGlobalBindings.SAMPLER_ENVIRONMENT;
var UNIFORM_ENVIRONMENT_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_ENVIRONMENT_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT);
var UNIFORM_ENVIRONMENT_LAYOUT = new UniformSamplerTexture(SetIndex.GLOBAL, UNIFORM_ENVIRONMENT_BINDING, UNIFORM_ENVIRONMENT_NAME, Type.SAMPLER_CUBE, 1);
globalDescriptorSetLayout.layouts[UNIFORM_ENVIRONMENT_NAME] = UNIFORM_ENVIRONMENT_LAYOUT;
globalDescriptorSetLayout.bindings[UNIFORM_ENVIRONMENT_BINDING] = UNIFORM_ENVIRONMENT_DESCRIPTOR;
var UNIFORM_DIFFUSEMAP_NAME = 'cc_diffuseMap';
var UNIFORM_DIFFUSEMAP_BINDING = PipelineGlobalBindings.SAMPLER_DIFFUSEMAP;
var UNIFORM_DIFFUSEMAP_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_DIFFUSEMAP_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT);
var UNIFORM_DIFFUSEMAP_LAYOUT = new UniformSamplerTexture(SetIndex.GLOBAL, UNIFORM_DIFFUSEMAP_BINDING, UNIFORM_DIFFUSEMAP_NAME, Type.SAMPLER_CUBE, 1);
globalDescriptorSetLayout.layouts[UNIFORM_DIFFUSEMAP_NAME] = UNIFORM_DIFFUSEMAP_LAYOUT;
globalDescriptorSetLayout.bindings[UNIFORM_DIFFUSEMAP_BINDING] = UNIFORM_DIFFUSEMAP_DESCRIPTOR;
var UNIFORM_SPOT_SHADOW_MAP_TEXTURE_NAME = 'cc_spotShadowMap';
var UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING = PipelineGlobalBindings.SAMPLER_SPOT_SHADOW_MAP;
var UNIFORM_SPOT_SHADOW_MAP_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT);
var UNIFORM_SPOT_SHADOW_MAP_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.GLOBAL, UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, UNIFORM_SPOT_SHADOW_MAP_TEXTURE_NAME, Type.SAMPLER2D, 1);
globalDescriptorSetLayout.layouts[UNIFORM_SPOT_SHADOW_MAP_TEXTURE_NAME] = UNIFORM_SPOT_SHADOW_MAP_TEXTURE_LAYOUT;
globalDescriptorSetLayout.bindings[UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING] = UNIFORM_SPOT_SHADOW_MAP_TEXTURE_DESCRIPTOR;
var UBOLocalEnum;
(function (UBOLocalEnum) {
  UBOLocalEnum[UBOLocalEnum["MAT_WORLD_OFFSET"] = 0] = "MAT_WORLD_OFFSET";
  UBOLocalEnum[UBOLocalEnum["MAT_WORLD_IT_OFFSET"] = 16] = "MAT_WORLD_IT_OFFSET";
  UBOLocalEnum[UBOLocalEnum["LIGHTINGMAP_UVPARAM"] = 32] = "LIGHTINGMAP_UVPARAM";
  UBOLocalEnum[UBOLocalEnum["LOCAL_SHADOW_BIAS"] = 36] = "LOCAL_SHADOW_BIAS";
  UBOLocalEnum[UBOLocalEnum["REFLECTION_PROBE_DATA1"] = 40] = "REFLECTION_PROBE_DATA1";
  UBOLocalEnum[UBOLocalEnum["REFLECTION_PROBE_DATA2"] = 44] = "REFLECTION_PROBE_DATA2";
  UBOLocalEnum[UBOLocalEnum["REFLECTION_PROBE_BLEND_DATA1"] = 48] = "REFLECTION_PROBE_BLEND_DATA1";
  UBOLocalEnum[UBOLocalEnum["REFLECTION_PROBE_BLEND_DATA2"] = 52] = "REFLECTION_PROBE_BLEND_DATA2";
  UBOLocalEnum[UBOLocalEnum["COUNT"] = 56] = "COUNT";
  UBOLocalEnum[UBOLocalEnum["SIZE"] = 224] = "SIZE";
  UBOLocalEnum[UBOLocalEnum["BINDING"] = ModelLocalBindings.UBO_LOCAL] = "BINDING";
})(UBOLocalEnum || (UBOLocalEnum = {}));
var UBOLocal = function UBOLocal() {};
_UBOLocal = UBOLocal;
UBOLocal.MAT_WORLD_OFFSET = UBOLocalEnum.MAT_WORLD_OFFSET;
UBOLocal.MAT_WORLD_IT_OFFSET = UBOLocalEnum.MAT_WORLD_IT_OFFSET;
UBOLocal.LIGHTINGMAP_UVPARAM = UBOLocalEnum.LIGHTINGMAP_UVPARAM;
UBOLocal.LOCAL_SHADOW_BIAS = UBOLocalEnum.LOCAL_SHADOW_BIAS;
UBOLocal.REFLECTION_PROBE_DATA1 = UBOLocalEnum.REFLECTION_PROBE_DATA1;
UBOLocal.REFLECTION_PROBE_DATA2 = UBOLocalEnum.REFLECTION_PROBE_DATA2;
UBOLocal.REFLECTION_PROBE_BLEND_DATA1 = UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA1;
UBOLocal.REFLECTION_PROBE_BLEND_DATA2 = UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA2;
UBOLocal.COUNT = UBOLocalEnum.COUNT;
UBOLocal.SIZE = UBOLocalEnum.SIZE;
UBOLocal.NAME = 'CCLocal';
UBOLocal.BINDING = UBOLocalEnum.BINDING;
UBOLocal.DESCRIPTOR = new DescriptorSetLayoutBinding(UBOLocalEnum.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX | ShaderStageFlagBit.FRAGMENT | ShaderStageFlagBit.COMPUTE, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOLocal.LAYOUT = new UniformBlock(SetIndex.LOCAL, UBOLocalEnum.BINDING, _UBOLocal.NAME, [new Uniform('cc_matWorld', Type.MAT4, 1), new Uniform('cc_matWorldIT', Type.MAT4, 1), new Uniform('cc_lightingMapUVParam', Type.FLOAT4, 1), new Uniform('cc_localShadowBias', Type.FLOAT4, 1), new Uniform('cc_reflectionProbeData1', Type.FLOAT4, 1), new Uniform('cc_reflectionProbeData2', Type.FLOAT4, 1), new Uniform('cc_reflectionProbeBlendData1', Type.FLOAT4, 1), new Uniform('cc_reflectionProbeBlendData2', Type.FLOAT4, 1)], 1);
localDescriptorSetLayout.layouts[UBOLocal.NAME] = UBOLocal.LAYOUT;
localDescriptorSetLayout.bindings[UBOLocalEnum.BINDING] = UBOLocal.DESCRIPTOR;
var UBOWorldBound = function UBOWorldBound() {};
_UBOWorldBound = UBOWorldBound;
UBOWorldBound.WORLD_BOUND_CENTER = 0;
UBOWorldBound.WORLD_BOUND_HALF_EXTENTS = _UBOWorldBound.WORLD_BOUND_CENTER + 4;
UBOWorldBound.COUNT = _UBOWorldBound.WORLD_BOUND_HALF_EXTENTS + 4;
UBOWorldBound.SIZE = _UBOWorldBound.COUNT * 4;
UBOWorldBound.NAME = 'CCWorldBound';
UBOWorldBound.BINDING = ModelLocalBindings.UBO_LOCAL;
UBOWorldBound.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOWorldBound.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX | ShaderStageFlagBit.COMPUTE, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOWorldBound.LAYOUT = new UniformBlock(SetIndex.LOCAL, _UBOWorldBound.BINDING, _UBOWorldBound.NAME, [new Uniform('cc_worldBoundCenter', Type.FLOAT4, 1), new Uniform('cc_worldBoundHalfExtents', Type.FLOAT4, 1)], 1);
localDescriptorSetLayout.layouts[UBOWorldBound.NAME] = UBOWorldBound.LAYOUT;
localDescriptorSetLayout.bindings[UBOWorldBound.BINDING] = UBOWorldBound.DESCRIPTOR;
var INST_MAT_WORLD = 'a_matWorld0';
var INST_SH = 'a_sh_linear_const_r';
var UBOLocalBatched = function UBOLocalBatched() {};
_UBOLocalBatched = UBOLocalBatched;
UBOLocalBatched.BATCHING_COUNT = 10;
UBOLocalBatched.MAT_WORLDS_OFFSET = 0;
UBOLocalBatched.COUNT = 16 * _UBOLocalBatched.BATCHING_COUNT;
UBOLocalBatched.SIZE = _UBOLocalBatched.COUNT * 4;
UBOLocalBatched.NAME = 'CCLocalBatched';
UBOLocalBatched.BINDING = ModelLocalBindings.UBO_LOCAL;
UBOLocalBatched.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOLocalBatched.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX | ShaderStageFlagBit.COMPUTE, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOLocalBatched.LAYOUT = new UniformBlock(SetIndex.LOCAL, _UBOLocalBatched.BINDING, _UBOLocalBatched.NAME, [new Uniform('cc_matWorlds', Type.MAT4, _UBOLocalBatched.BATCHING_COUNT)], 1);
localDescriptorSetLayout.layouts[UBOLocalBatched.NAME] = UBOLocalBatched.LAYOUT;
localDescriptorSetLayout.bindings[UBOLocalBatched.BINDING] = UBOLocalBatched.DESCRIPTOR;
var UBOForwardLightEnum;
(function (UBOForwardLightEnum) {
  UBOForwardLightEnum[UBOForwardLightEnum["LIGHTS_PER_PASS"] = 1] = "LIGHTS_PER_PASS";
  UBOForwardLightEnum[UBOForwardLightEnum["LIGHT_POS_OFFSET"] = 0] = "LIGHT_POS_OFFSET";
  UBOForwardLightEnum[UBOForwardLightEnum["LIGHT_COLOR_OFFSET"] = 4] = "LIGHT_COLOR_OFFSET";
  UBOForwardLightEnum[UBOForwardLightEnum["LIGHT_SIZE_RANGE_ANGLE_OFFSET"] = 8] = "LIGHT_SIZE_RANGE_ANGLE_OFFSET";
  UBOForwardLightEnum[UBOForwardLightEnum["LIGHT_DIR_OFFSET"] = 12] = "LIGHT_DIR_OFFSET";
  UBOForwardLightEnum[UBOForwardLightEnum["LIGHT_BOUNDING_SIZE_VS_OFFSET"] = 16] = "LIGHT_BOUNDING_SIZE_VS_OFFSET";
  UBOForwardLightEnum[UBOForwardLightEnum["COUNT"] = 20] = "COUNT";
  UBOForwardLightEnum[UBOForwardLightEnum["SIZE"] = 80] = "SIZE";
})(UBOForwardLightEnum || (UBOForwardLightEnum = {}));
var UBOForwardLight = function UBOForwardLight() {};
_UBOForwardLight = UBOForwardLight;
UBOForwardLight.LIGHTS_PER_PASS = UBOForwardLightEnum.LIGHTS_PER_PASS;
UBOForwardLight.LIGHT_POS_OFFSET = UBOForwardLightEnum.LIGHT_POS_OFFSET;
UBOForwardLight.LIGHT_COLOR_OFFSET = UBOForwardLightEnum.LIGHT_COLOR_OFFSET;
UBOForwardLight.LIGHT_SIZE_RANGE_ANGLE_OFFSET = UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET;
UBOForwardLight.LIGHT_DIR_OFFSET = UBOForwardLightEnum.LIGHT_DIR_OFFSET;
UBOForwardLight.LIGHT_BOUNDING_SIZE_VS_OFFSET = UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET;
UBOForwardLight.COUNT = UBOForwardLightEnum.COUNT;
UBOForwardLight.SIZE = UBOForwardLightEnum.SIZE;
UBOForwardLight.NAME = 'CCForwardLight';
UBOForwardLight.BINDING = ModelLocalBindings.UBO_FORWARD_LIGHTS;
UBOForwardLight.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOForwardLight.BINDING, DescriptorType.DYNAMIC_UNIFORM_BUFFER, 1, ShaderStageFlagBit.FRAGMENT, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOForwardLight.LAYOUT = new UniformBlock(SetIndex.LOCAL, _UBOForwardLight.BINDING, _UBOForwardLight.NAME, [new Uniform('cc_lightPos', Type.FLOAT4, UBOForwardLightEnum.LIGHTS_PER_PASS), new Uniform('cc_lightColor', Type.FLOAT4, UBOForwardLightEnum.LIGHTS_PER_PASS), new Uniform('cc_lightSizeRangeAngle', Type.FLOAT4, UBOForwardLightEnum.LIGHTS_PER_PASS), new Uniform('cc_lightDir', Type.FLOAT4, UBOForwardLightEnum.LIGHTS_PER_PASS), new Uniform('cc_lightBoundingSizeVS', Type.FLOAT4, UBOForwardLightEnum.LIGHTS_PER_PASS)], 1);
localDescriptorSetLayout.layouts[UBOForwardLight.NAME] = UBOForwardLight.LAYOUT;
localDescriptorSetLayout.bindings[UBOForwardLight.BINDING] = UBOForwardLight.DESCRIPTOR;
var UBODeferredLight = function UBODeferredLight() {};
UBODeferredLight.LIGHTS_PER_PASS = 10;
var JOINT_UNIFORM_CAPACITY = 30;
var UBOSkinningTexture = function UBOSkinningTexture() {};
_UBOSkinningTexture = UBOSkinningTexture;
UBOSkinningTexture.JOINTS_TEXTURE_INFO_OFFSET = 0;
UBOSkinningTexture.COUNT = _UBOSkinningTexture.JOINTS_TEXTURE_INFO_OFFSET + 4;
UBOSkinningTexture.SIZE = _UBOSkinningTexture.COUNT * 4;
UBOSkinningTexture.NAME = 'CCSkinningTexture';
UBOSkinningTexture.BINDING = ModelLocalBindings.UBO_SKINNING_TEXTURE;
UBOSkinningTexture.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOSkinningTexture.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOSkinningTexture.LAYOUT = new UniformBlock(SetIndex.LOCAL, _UBOSkinningTexture.BINDING, _UBOSkinningTexture.NAME, [new Uniform('cc_jointTextureInfo', Type.FLOAT4, 1)], 1);
localDescriptorSetLayout.layouts[UBOSkinningTexture.NAME] = UBOSkinningTexture.LAYOUT;
localDescriptorSetLayout.bindings[UBOSkinningTexture.BINDING] = UBOSkinningTexture.DESCRIPTOR;
var UBOSkinningAnimation = function UBOSkinningAnimation() {};
_UBOSkinningAnimation = UBOSkinningAnimation;
UBOSkinningAnimation.JOINTS_ANIM_INFO_OFFSET = 0;
UBOSkinningAnimation.COUNT = _UBOSkinningAnimation.JOINTS_ANIM_INFO_OFFSET + 4;
UBOSkinningAnimation.SIZE = _UBOSkinningAnimation.COUNT * 4;
UBOSkinningAnimation.NAME = 'CCSkinningAnimation';
UBOSkinningAnimation.BINDING = ModelLocalBindings.UBO_SKINNING_ANIMATION;
UBOSkinningAnimation.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOSkinningAnimation.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOSkinningAnimation.LAYOUT = new UniformBlock(SetIndex.LOCAL, _UBOSkinningAnimation.BINDING, _UBOSkinningAnimation.NAME, [new Uniform('cc_jointAnimInfo', Type.FLOAT4, 1)], 1);
localDescriptorSetLayout.layouts[UBOSkinningAnimation.NAME] = UBOSkinningAnimation.LAYOUT;
localDescriptorSetLayout.bindings[UBOSkinningAnimation.BINDING] = UBOSkinningAnimation.DESCRIPTOR;
var INST_JOINT_ANIM_INFO = 'a_jointAnimInfo';
var UBOSkinning = function () {
  function UBOSkinning() {}
  UBOSkinning.initLayout = function initLayout(capacity) {
    UBOSkinning._jointUniformCapacity = capacity;
    UBOSkinning._count = capacity * 12;
    UBOSkinning._size = UBOSkinning._count * 4;
    UBOSkinning.LAYOUT.members[0].count = capacity * 3;
  };
  return _createClass(UBOSkinning, null, [{
    key: "JOINT_UNIFORM_CAPACITY",
    get: function get() {
      return UBOSkinning._jointUniformCapacity;
    }
  }, {
    key: "COUNT",
    get: function get() {
      return UBOSkinning._count;
    }
  }, {
    key: "SIZE",
    get: function get() {
      return UBOSkinning._size;
    }
  }]);
}();
_UBOSkinning = UBOSkinning;
UBOSkinning._jointUniformCapacity = 0;
UBOSkinning._count = 0;
UBOSkinning._size = 0;
UBOSkinning.NAME = 'CCSkinning';
UBOSkinning.BINDING = ModelLocalBindings.UBO_SKINNING_TEXTURE;
UBOSkinning.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOSkinning.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOSkinning.LAYOUT = new UniformBlock(SetIndex.LOCAL, _UBOSkinning.BINDING, _UBOSkinning.NAME, [new Uniform('cc_joints', Type.FLOAT4, 1)], 1);
function localDescriptorSetLayout_ResizeMaxJoints(maxCount) {
  UBOSkinning.initLayout(maxCount);
  localDescriptorSetLayout.layouts[UBOSkinning.NAME] = UBOSkinning.LAYOUT;
  localDescriptorSetLayout.bindings[UBOSkinning.BINDING] = UBOSkinning.DESCRIPTOR;
}
var UBOMorphEnum;
(function (UBOMorphEnum) {
  UBOMorphEnum[UBOMorphEnum["MAX_MORPH_TARGET_COUNT"] = 60] = "MAX_MORPH_TARGET_COUNT";
  UBOMorphEnum[UBOMorphEnum["OFFSET_OF_WEIGHTS"] = 0] = "OFFSET_OF_WEIGHTS";
  UBOMorphEnum[UBOMorphEnum["OFFSET_OF_DISPLACEMENT_TEXTURE_WIDTH"] = 240] = "OFFSET_OF_DISPLACEMENT_TEXTURE_WIDTH";
  UBOMorphEnum[UBOMorphEnum["OFFSET_OF_DISPLACEMENT_TEXTURE_HEIGHT"] = 244] = "OFFSET_OF_DISPLACEMENT_TEXTURE_HEIGHT";
  UBOMorphEnum[UBOMorphEnum["OFFSET_OF_VERTICES_COUNT"] = 248] = "OFFSET_OF_VERTICES_COUNT";
  UBOMorphEnum[UBOMorphEnum["COUNT_BASE_4_BYTES"] = 64] = "COUNT_BASE_4_BYTES";
  UBOMorphEnum[UBOMorphEnum["SIZE"] = 256] = "SIZE";
})(UBOMorphEnum || (UBOMorphEnum = {}));
var UBOMorph = function UBOMorph() {};
_UBOMorph = UBOMorph;
UBOMorph.MAX_MORPH_TARGET_COUNT = UBOMorphEnum.MAX_MORPH_TARGET_COUNT;
UBOMorph.OFFSET_OF_WEIGHTS = UBOMorphEnum.OFFSET_OF_WEIGHTS;
UBOMorph.OFFSET_OF_DISPLACEMENT_TEXTURE_WIDTH = UBOMorphEnum.OFFSET_OF_DISPLACEMENT_TEXTURE_WIDTH;
UBOMorph.OFFSET_OF_DISPLACEMENT_TEXTURE_HEIGHT = UBOMorphEnum.OFFSET_OF_DISPLACEMENT_TEXTURE_HEIGHT;
UBOMorph.OFFSET_OF_VERTICES_COUNT = UBOMorphEnum.OFFSET_OF_VERTICES_COUNT;
UBOMorph.COUNT_BASE_4_BYTES = UBOMorphEnum.COUNT_BASE_4_BYTES;
UBOMorph.SIZE = UBOMorphEnum.SIZE;
UBOMorph.NAME = 'CCMorph';
UBOMorph.BINDING = ModelLocalBindings.UBO_MORPH;
UBOMorph.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOMorph.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOMorph.LAYOUT = new UniformBlock(SetIndex.LOCAL, _UBOMorph.BINDING, _UBOMorph.NAME, [new Uniform('cc_displacementWeights', Type.FLOAT4, UBOMorphEnum.MAX_MORPH_TARGET_COUNT / 4), new Uniform('cc_displacementTextureInfo', Type.FLOAT4, 1)], 1);
localDescriptorSetLayout.layouts[UBOMorph.NAME] = UBOMorph.LAYOUT;
localDescriptorSetLayout.bindings[UBOMorph.BINDING] = UBOMorph.DESCRIPTOR;
var UBOUILocal = function UBOUILocal() {};
_UBOUILocal = UBOUILocal;
UBOUILocal.NAME = 'CCUILocal';
UBOUILocal.BINDING = ModelLocalBindings.UBO_UI_LOCAL;
UBOUILocal.DESCRIPTOR = new DescriptorSetLayoutBinding(_UBOUILocal.BINDING, DescriptorType.DYNAMIC_UNIFORM_BUFFER, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOUILocal.LAYOUT = new UniformBlock(SetIndex.LOCAL, _UBOUILocal.BINDING, _UBOUILocal.NAME, [new Uniform('cc_local_data', Type.FLOAT4, 1)], 1);
localDescriptorSetLayout.layouts[UBOUILocal.NAME] = UBOUILocal.LAYOUT;
localDescriptorSetLayout.bindings[UBOUILocal.BINDING] = UBOUILocal.DESCRIPTOR;
var UBOSHEnum;
(function (UBOSHEnum) {
  UBOSHEnum[UBOSHEnum["SH_LINEAR_CONST_R_OFFSET"] = 0] = "SH_LINEAR_CONST_R_OFFSET";
  UBOSHEnum[UBOSHEnum["SH_LINEAR_CONST_G_OFFSET"] = 4] = "SH_LINEAR_CONST_G_OFFSET";
  UBOSHEnum[UBOSHEnum["SH_LINEAR_CONST_B_OFFSET"] = 8] = "SH_LINEAR_CONST_B_OFFSET";
  UBOSHEnum[UBOSHEnum["SH_QUADRATIC_R_OFFSET"] = 12] = "SH_QUADRATIC_R_OFFSET";
  UBOSHEnum[UBOSHEnum["SH_QUADRATIC_G_OFFSET"] = 16] = "SH_QUADRATIC_G_OFFSET";
  UBOSHEnum[UBOSHEnum["SH_QUADRATIC_B_OFFSET"] = 20] = "SH_QUADRATIC_B_OFFSET";
  UBOSHEnum[UBOSHEnum["SH_QUADRATIC_A_OFFSET"] = 24] = "SH_QUADRATIC_A_OFFSET";
  UBOSHEnum[UBOSHEnum["COUNT"] = 28] = "COUNT";
  UBOSHEnum[UBOSHEnum["SIZE"] = 112] = "SIZE";
  UBOSHEnum[UBOSHEnum["BINDING"] = ModelLocalBindings.UBO_SH] = "BINDING";
})(UBOSHEnum || (UBOSHEnum = {}));
var UBOSH = function UBOSH() {};
_UBOSH = UBOSH;
UBOSH.SH_LINEAR_CONST_R_OFFSET = UBOSHEnum.SH_LINEAR_CONST_R_OFFSET;
UBOSH.SH_LINEAR_CONST_G_OFFSET = UBOSHEnum.SH_LINEAR_CONST_G_OFFSET;
UBOSH.SH_LINEAR_CONST_B_OFFSET = UBOSHEnum.SH_LINEAR_CONST_B_OFFSET;
UBOSH.SH_QUADRATIC_R_OFFSET = UBOSHEnum.SH_QUADRATIC_R_OFFSET;
UBOSH.SH_QUADRATIC_G_OFFSET = UBOSHEnum.SH_QUADRATIC_G_OFFSET;
UBOSH.SH_QUADRATIC_B_OFFSET = UBOSHEnum.SH_QUADRATIC_B_OFFSET;
UBOSH.SH_QUADRATIC_A_OFFSET = UBOSHEnum.SH_QUADRATIC_A_OFFSET;
UBOSH.COUNT = UBOSHEnum.COUNT;
UBOSH.SIZE = UBOSHEnum.SIZE;
UBOSH.NAME = 'CCSH';
UBOSH.BINDING = UBOSHEnum.BINDING;
UBOSH.DESCRIPTOR = new DescriptorSetLayoutBinding(UBOSHEnum.BINDING, DescriptorType.UNIFORM_BUFFER, 1, ShaderStageFlagBit.FRAGMENT, MemoryAccessBit.READ_ONLY, ViewDimension.BUFFER);
UBOSH.LAYOUT = new UniformBlock(SetIndex.LOCAL, UBOSHEnum.BINDING, _UBOSH.NAME, [new Uniform('cc_sh_linear_const_r', Type.FLOAT4, 1), new Uniform('cc_sh_linear_const_g', Type.FLOAT4, 1), new Uniform('cc_sh_linear_const_b', Type.FLOAT4, 1), new Uniform('cc_sh_quadratic_r', Type.FLOAT4, 1), new Uniform('cc_sh_quadratic_g', Type.FLOAT4, 1), new Uniform('cc_sh_quadratic_b', Type.FLOAT4, 1), new Uniform('cc_sh_quadratic_a', Type.FLOAT4, 1)], 1);
localDescriptorSetLayout.layouts[UBOSH.NAME] = UBOSH.LAYOUT;
localDescriptorSetLayout.bindings[UBOSHEnum.BINDING] = UBOSH.DESCRIPTOR;
var UNIFORM_JOINT_TEXTURE_NAME = 'cc_jointTexture';
var UNIFORM_JOINT_TEXTURE_BINDING = ModelLocalBindings.SAMPLER_JOINTS;
var UNIFORM_JOINT_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_JOINT_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_JOINT_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_JOINT_TEXTURE_BINDING, UNIFORM_JOINT_TEXTURE_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_JOINT_TEXTURE_NAME] = UNIFORM_JOINT_TEXTURE_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_JOINT_TEXTURE_BINDING] = UNIFORM_JOINT_TEXTURE_DESCRIPTOR;
var UNIFORM_REALTIME_JOINT_TEXTURE_NAME = 'cc_realtimeJoint';
var UNIFORM_REALTIME_JOINT_TEXTURE_BINDING = ModelLocalBindings.SAMPLER_JOINTS;
var UNIFORM_REALTIME_JOINT_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_REALTIME_JOINT_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_REALTIME_JOINT_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_REALTIME_JOINT_TEXTURE_BINDING, UNIFORM_REALTIME_JOINT_TEXTURE_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_REALTIME_JOINT_TEXTURE_NAME] = UNIFORM_REALTIME_JOINT_TEXTURE_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_REALTIME_JOINT_TEXTURE_BINDING] = UNIFORM_REALTIME_JOINT_TEXTURE_DESCRIPTOR;
var UNIFORM_POSITION_MORPH_TEXTURE_NAME = 'cc_PositionDisplacements';
var UNIFORM_POSITION_MORPH_TEXTURE_BINDING = ModelLocalBindings.SAMPLER_MORPH_POSITION;
var UNIFORM_POSITION_MORPH_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_POSITION_MORPH_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_POSITION_MORPH_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_POSITION_MORPH_TEXTURE_BINDING, UNIFORM_POSITION_MORPH_TEXTURE_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_POSITION_MORPH_TEXTURE_NAME] = UNIFORM_POSITION_MORPH_TEXTURE_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_POSITION_MORPH_TEXTURE_BINDING] = UNIFORM_POSITION_MORPH_TEXTURE_DESCRIPTOR;
var UNIFORM_NORMAL_MORPH_TEXTURE_NAME = 'cc_NormalDisplacements';
var UNIFORM_NORMAL_MORPH_TEXTURE_BINDING = ModelLocalBindings.SAMPLER_MORPH_NORMAL;
var UNIFORM_NORMAL_MORPH_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_NORMAL_MORPH_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_NORMAL_MORPH_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_NORMAL_MORPH_TEXTURE_BINDING, UNIFORM_NORMAL_MORPH_TEXTURE_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_NORMAL_MORPH_TEXTURE_NAME] = UNIFORM_NORMAL_MORPH_TEXTURE_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_NORMAL_MORPH_TEXTURE_BINDING] = UNIFORM_NORMAL_MORPH_TEXTURE_DESCRIPTOR;
var UNIFORM_TANGENT_MORPH_TEXTURE_NAME = 'cc_TangentDisplacements';
var UNIFORM_TANGENT_MORPH_TEXTURE_BINDING = ModelLocalBindings.SAMPLER_MORPH_TANGENT;
var UNIFORM_TANGENT_MORPH_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_TANGENT_MORPH_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.VERTEX, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_TANGENT_MORPH_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_TANGENT_MORPH_TEXTURE_BINDING, UNIFORM_TANGENT_MORPH_TEXTURE_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_TANGENT_MORPH_TEXTURE_NAME] = UNIFORM_TANGENT_MORPH_TEXTURE_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_TANGENT_MORPH_TEXTURE_BINDING] = UNIFORM_TANGENT_MORPH_TEXTURE_DESCRIPTOR;
var UNIFORM_LIGHTMAP_TEXTURE_NAME = 'cc_lightingMap';
var UNIFORM_LIGHTMAP_TEXTURE_BINDING = ModelLocalBindings.SAMPLER_LIGHTMAP;
var UNIFORM_LIGHTMAP_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_LIGHTMAP_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_LIGHTMAP_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_LIGHTMAP_TEXTURE_BINDING, UNIFORM_LIGHTMAP_TEXTURE_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_LIGHTMAP_TEXTURE_NAME] = UNIFORM_LIGHTMAP_TEXTURE_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_LIGHTMAP_TEXTURE_BINDING] = UNIFORM_LIGHTMAP_TEXTURE_DESCRIPTOR;
var UNIFORM_SPRITE_TEXTURE_NAME = 'cc_spriteTexture';
var UNIFORM_SPRITE_TEXTURE_BINDING = ModelLocalBindings.SAMPLER_SPRITE;
var UNIFORM_SPRITE_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_SPRITE_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_SPRITE_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_SPRITE_TEXTURE_BINDING, UNIFORM_SPRITE_TEXTURE_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_SPRITE_TEXTURE_NAME] = UNIFORM_SPRITE_TEXTURE_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_SPRITE_TEXTURE_BINDING] = UNIFORM_SPRITE_TEXTURE_DESCRIPTOR;
var UNIFORM_REFLECTION_PROBE_CUBEMAP_NAME = 'cc_reflectionProbeCubemap';
var UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING = ModelLocalBindings.SAMPLER_REFLECTION_PROBE_CUBE;
var UNIFORM_REFLECTION_PROBE_CUBEMAP_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT, MemoryAccessBit.READ_ONLY, ViewDimension.TEXCUBE);
var UNIFORM_REFLECTION_PROBE_CUBEMAP_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING, UNIFORM_REFLECTION_PROBE_CUBEMAP_NAME, Type.SAMPLER_CUBE, 1);
localDescriptorSetLayout.layouts[UNIFORM_REFLECTION_PROBE_CUBEMAP_NAME] = UNIFORM_REFLECTION_PROBE_CUBEMAP_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING] = UNIFORM_REFLECTION_PROBE_CUBEMAP_DESCRIPTOR;
var UNIFORM_REFLECTION_PROBE_TEXTURE_NAME = 'cc_reflectionProbePlanarMap';
var UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING = ModelLocalBindings.SAMPLER_REFLECTION_PROBE_PLANAR;
var UNIFORM_REFLECTION_PROBE_TEXTURE_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_REFLECTION_PROBE_TEXTURE_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING, UNIFORM_REFLECTION_PROBE_TEXTURE_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_REFLECTION_PROBE_TEXTURE_NAME] = UNIFORM_REFLECTION_PROBE_TEXTURE_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING] = UNIFORM_REFLECTION_PROBE_TEXTURE_DESCRIPTOR;
var UNIFORM_REFLECTION_PROBE_DATA_MAP_NAME = 'cc_reflectionProbeDataMap';
var UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING = ModelLocalBindings.SAMPLER_REFLECTION_PROBE_DATA_MAP;
var UNIFORM_REFLECTION_PROBE_DATA_MAP_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT, MemoryAccessBit.READ_ONLY, ViewDimension.TEX2D);
var UNIFORM_REFLECTION_PROBE_DATA_MAP_LAYOUT = new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING, UNIFORM_REFLECTION_PROBE_DATA_MAP_NAME, Type.SAMPLER2D, 1);
localDescriptorSetLayout.layouts[UNIFORM_REFLECTION_PROBE_DATA_MAP_NAME] = UNIFORM_REFLECTION_PROBE_DATA_MAP_LAYOUT;
localDescriptorSetLayout.bindings[UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING] = UNIFORM_REFLECTION_PROBE_DATA_MAP_DESCRIPTOR;
var UNIFORM_REFLECTION_PROBE_BLEND_CUBEMAP_NAME = 'cc_reflectionProbeBlendCubemap';
var UNIFORM_REFLECTION_PROBE_BLEND_CUBEMAP_BINDING = ModelLocalBindings.SAMPLER_REFLECTION_PROBE_DATA_MAP + 1;
new DescriptorSetLayoutBinding(UNIFORM_REFLECTION_PROBE_BLEND_CUBEMAP_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT, MemoryAccessBit.READ_ONLY, ViewDimension.TEXCUBE);
new UniformSamplerTexture(SetIndex.LOCAL, UNIFORM_REFLECTION_PROBE_BLEND_CUBEMAP_BINDING, UNIFORM_REFLECTION_PROBE_BLEND_CUBEMAP_NAME, Type.SAMPLER_CUBE, 1);
var ENABLE_PROBE_BLEND = false;
var CAMERA_DEFAULT_MASK = Layers.makeMaskExclude([Layers.BitMask.UI_2D, Layers.BitMask.GIZMOS, Layers.BitMask.EDITOR, Layers.BitMask.SCENE_GIZMO, Layers.BitMask.PROFILER]);
var CAMERA_EDITOR_MASK = Layers.makeMaskExclude([Layers.BitMask.UI_2D, Layers.BitMask.PROFILER]);
var MODEL_ALWAYS_MASK = Layers.Enum.ALL;
function supportsR16HalfFloatTexture(device) {
  return (device.getFormatFeatures(Format.R16F) & (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE)) === (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE);
}
var dftShadowTexture;
function getDefaultShadowTexture(device) {
  if (dftShadowTexture) return dftShadowTexture;
  var texInfo = new TextureInfo(TextureType.TEX2D, TextureUsageBit.NONE, supportsR32FloatTexture(device) ? Format.R32F : Format.RGBA8, 16, 16, TextureFlagBit.NONE, 1, 1, SampleCount.X1, 1);
  dftShadowTexture = device.createTexture(texInfo);
  return dftShadowTexture;
}
function supportsR32FloatTexture(device) {
  return (device.getFormatFeatures(Format.R32F) & (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE)) === (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE) && !(device.gfxAPI === API.WEBGL);
}
function supportsRGBA16HalfFloatTexture(device) {
  return (device.getFormatFeatures(Format.RGBA16F) & (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE)) === (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE);
}
function supportsRGBA32FloatTexture(device) {
  return (device.getFormatFeatures(Format.RGBA32F) & (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE)) === (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE);
}
function isEnableEffect() {
  return !!(cclegacy.rendering && cclegacy.rendering.enableEffectImport);
}
function getPassPool() {
  return new RecyclePool(function () {
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

var define = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CAMERA_DEFAULT_MASK: CAMERA_DEFAULT_MASK,
    CAMERA_EDITOR_MASK: CAMERA_EDITOR_MASK,
    ENABLE_PROBE_BLEND: ENABLE_PROBE_BLEND,
    INST_JOINT_ANIM_INFO: INST_JOINT_ANIM_INFO,
    INST_MAT_WORLD: INST_MAT_WORLD,
    INST_SH: INST_SH,
    JOINT_UNIFORM_CAPACITY: JOINT_UNIFORM_CAPACITY,
    MODEL_ALWAYS_MASK: MODEL_ALWAYS_MASK,
    get ModelLocalBindings () { return ModelLocalBindings; },
    PIPELINE_FLOW_FORWARD: PIPELINE_FLOW_FORWARD,
    PIPELINE_FLOW_MAIN: PIPELINE_FLOW_MAIN,
    PIPELINE_FLOW_SHADOW: PIPELINE_FLOW_SHADOW,
    PIPELINE_FLOW_SMAA: PIPELINE_FLOW_SMAA,
    PIPELINE_FLOW_TONEMAP: PIPELINE_FLOW_TONEMAP,
    get PipelineGlobalBindings () { return PipelineGlobalBindings; },
    get RenderPassStage () { return RenderPassStage; },
    get RenderPriority () { return RenderPriority; },
    get SetIndex () { return SetIndex; },
    UBOCSM: UBOCSM,
    get UBOCSMEnum () { return UBOCSMEnum; },
    UBOCamera: UBOCamera,
    get UBOCameraEnum () { return UBOCameraEnum; },
    UBODeferredLight: UBODeferredLight,
    UBOForwardLight: UBOForwardLight,
    get UBOForwardLightEnum () { return UBOForwardLightEnum; },
    UBOGlobal: UBOGlobal,
    get UBOGlobalEnum () { return UBOGlobalEnum; },
    UBOLocal: UBOLocal,
    UBOLocalBatched: UBOLocalBatched,
    get UBOLocalEnum () { return UBOLocalEnum; },
    UBOMorph: UBOMorph,
    get UBOMorphEnum () { return UBOMorphEnum; },
    UBOSH: UBOSH,
    get UBOSHEnum () { return UBOSHEnum; },
    UBOShadow: UBOShadow,
    get UBOShadowEnum () { return UBOShadowEnum; },
    UBOSkinning: UBOSkinning,
    UBOSkinningAnimation: UBOSkinningAnimation,
    UBOSkinningTexture: UBOSkinningTexture,
    UBOUILocal: UBOUILocal,
    UBOWorldBound: UBOWorldBound,
    UNIFORM_DIFFUSEMAP_BINDING: UNIFORM_DIFFUSEMAP_BINDING,
    UNIFORM_ENVIRONMENT_BINDING: UNIFORM_ENVIRONMENT_BINDING,
    UNIFORM_JOINT_TEXTURE_BINDING: UNIFORM_JOINT_TEXTURE_BINDING,
    UNIFORM_LIGHTMAP_TEXTURE_BINDING: UNIFORM_LIGHTMAP_TEXTURE_BINDING,
    UNIFORM_NORMAL_MORPH_TEXTURE_BINDING: UNIFORM_NORMAL_MORPH_TEXTURE_BINDING,
    UNIFORM_POSITION_MORPH_TEXTURE_BINDING: UNIFORM_POSITION_MORPH_TEXTURE_BINDING,
    UNIFORM_REALTIME_JOINT_TEXTURE_BINDING: UNIFORM_REALTIME_JOINT_TEXTURE_BINDING,
    UNIFORM_REFLECTION_PROBE_BLEND_CUBEMAP_BINDING: UNIFORM_REFLECTION_PROBE_BLEND_CUBEMAP_BINDING,
    UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING: UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING,
    UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING: UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING,
    UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING: UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING,
    UNIFORM_SHADOWMAP_BINDING: UNIFORM_SHADOWMAP_BINDING,
    UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING: UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING,
    UNIFORM_SPRITE_TEXTURE_BINDING: UNIFORM_SPRITE_TEXTURE_BINDING,
    UNIFORM_TANGENT_MORPH_TEXTURE_BINDING: UNIFORM_TANGENT_MORPH_TEXTURE_BINDING,
    bindingMappingInfo: bindingMappingInfo,
    getDefaultShadowTexture: getDefaultShadowTexture,
    getPassPool: getPassPool,
    globalDescriptorSetLayout: globalDescriptorSetLayout,
    isEnableEffect: isEnableEffect,
    localDescriptorSetLayout: localDescriptorSetLayout,
    localDescriptorSetLayout_ResizeMaxJoints: localDescriptorSetLayout_ResizeMaxJoints,
    supportsR16HalfFloatTexture: supportsR16HalfFloatTexture,
    supportsR32FloatTexture: supportsR32FloatTexture,
    supportsRGBA16HalfFloatTexture: supportsRGBA16HalfFloatTexture,
    supportsRGBA32FloatTexture: supportsRGBA32FloatTexture
});

var PipelineStateManager = function () {
  function PipelineStateManager() {}
  PipelineStateManager.getOrCreatePipelineState = function getOrCreatePipelineState(device, pass, shader, renderPass, ia) {
    var hash1 = pass.hash;
    var hash2 = renderPass.hash;
    var hash3 = ia.attributesHash;
    var hash4 = shader.typedID;
    var newHash = hash1 ^ hash2 ^ hash3 ^ hash4;
    var pso = this._PSOHashMap.get(newHash);
    if (!pso) {
      var pipelineLayout = pass.pipelineLayout;
      var inputState = new InputState(ia.attributes);
      var psoInfo = new PipelineStateInfo(shader, pipelineLayout, renderPass, inputState, pass.rasterizerState, pass.depthStencilState, pass.blendState, pass.primitive, pass.dynamicStates);
      pso = device.createPipelineState(psoInfo);
      this._PSOHashMap.set(newHash, pso);
    }
    return pso;
  };
  return PipelineStateManager;
}();
PipelineStateManager._PSOHashMap = new Map();

export { PIPELINE_FLOW_MAIN as $, UBOForwardLightEnum as A, UBOForwardLight as B, CAMERA_DEFAULT_MASK as C, UBOLocal as D, UBODeferredLight as E, supportsRGBA16HalfFloatTexture as F, getDefaultShadowTexture as G, localDescriptorSetLayout as H, INST_JOINT_ANIM_INFO as I, globalDescriptorSetLayout as J, PipelineGlobalBindings as K, Layers as L, ModelLocalBindings as M, UBOShadow as N, UBOCSMEnum as O, PipelineStateManager as P, UBOGlobal as Q, RenderPriority as R, SetIndex as S, UBOCamera as T, UBOLocalEnum as U, UBOCSM as V, UNIFORM_SHADOWMAP_BINDING as W, UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING as X, getPassPool as Y, PIPELINE_FLOW_FORWARD as Z, PIPELINE_FLOW_SHADOW as _, UBOGlobalEnum as a, RenderPassStage as a0, UNIFORM_ENVIRONMENT_BINDING as a1, UNIFORM_DIFFUSEMAP_BINDING as a2, UBOCameraEnum as b, UBOShadowEnum as c, UBOWorldBound as d, UBOMorphEnum as e, UBOMorph as f, UNIFORM_TANGENT_MORPH_TEXTURE_BINDING as g, UNIFORM_NORMAL_MORPH_TEXTURE_BINDING as h, isEnableEffect as i, UNIFORM_POSITION_MORPH_TEXTURE_BINDING as j, bindingMappingInfo as k, localDescriptorSetLayout_ResizeMaxJoints as l, UBOSkinningAnimation as m, UBOSkinning as n, UNIFORM_REALTIME_JOINT_TEXTURE_BINDING as o, UBOSkinningTexture as p, UNIFORM_JOINT_TEXTURE_BINDING as q, define as r, UBOSHEnum as s, INST_MAT_WORLD as t, INST_SH as u, UNIFORM_LIGHTMAP_TEXTURE_BINDING as v, UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING as w, UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING as x, UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING as y, supportsR32FloatTexture as z };
//# sourceMappingURL=pipeline-state-manager-C5U4ouGL.js.map
