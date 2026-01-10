import { c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';
import { f as Vec3, _ as Sphere, J as AABB, F as intersect, M as Mat4, g as Vec4, C as Color, h as toRadian, c as ccclass, b as applyDecoratedInitializer, s as serializable, t as type, G as markAsWarning, I as nextPow2, b3 as packRGBE } from './index-uXI1_UMk.js';
import { P as Pool, w as warnID, a as _createClass, _ as _inheritsLoose, $ as systemInfo, a4 as OS, G as macro, l as _createForOfIteratorHelperLoose, x as ccenum, j as CCString, J as CachedArray, k as errorID } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { S as SkyBoxFlagValue, j as CameraUsage, v as DebugViewCompositeType, f as Camera, L as LightType, P as PipelineEventType, h as PipelineEventProcessor, R as RenderTexture, o as ProbeType, u as PipelineSceneData } from './debug-view-BuNhRPv_.js';
import { c as UBOShadowEnum, J as globalDescriptorSetLayout, K as PipelineGlobalBindings, N as UBOShadow, a as UBOGlobalEnum, b as UBOCameraEnum, O as UBOCSMEnum, z as supportsR32FloatTexture, i as isEnableEffect, Q as UBOGlobal, T as UBOCamera, V as UBOCSM, W as UNIFORM_SHADOWMAP_BINDING, G as getDefaultShadowTexture, X as UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, n as UBOSkinning, Y as getPassPool, P as PipelineStateManager, S as SetIndex, A as UBOForwardLightEnum, B as UBOForwardLight, L as Layers, Z as PIPELINE_FLOW_FORWARD, _ as PIPELINE_FLOW_SHADOW, U as UBOLocalEnum, E as UBODeferredLight, $ as PIPELINE_FLOW_MAIN } from './pipeline-state-manager-C5U4ouGL.js';
import { y as ShadowType, q as CSMOptimizationMode, v as PCFType, C as CSMLevel, as as decideProfilerCamera, b as Material, g as getPhaseID, ar as instancingCompareFn, B as BatchingSchemes, aF as renderProfiler, aG as SRGBToLinear, d as builtinResMgr } from './scene-vWcxM1_c.js';
import { A as Asset } from './node-event-Ccvtv8bJ.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { ae as SamplerInfo, a4 as Filter, af as Address, az as DescriptorSetLayoutInfo, a5 as DescriptorSetInfo, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, ad as Rect, bo as Viewport, a6 as ColorAttachment, a7 as DepthStencilAttachment, a8 as StoreOp, C as ClearFlagBit, aQ as LoadOp, aM as GeneralBarrierInfo, al as AccessFlagBit, a9 as RenderPassInfo, m as murmurhash2_32_gc, aK as FramebufferInfo, bc as SurfaceTransform, A as Attribute, F as Format, I as InputAssemblerInfo, _ as FormatFeatureBit, aa as Feature, z as TextureInfo, E as TextureType, H as TextureUsageBit, ap as BufferViewInfo, ac as Color$1, $ as API } from './buffer-barrier-BlQXg9Aa.js';
import { P as PipelineInputAssemblerData } from './render-types-D3qsZZI9.js';
import './touch-BKrZ-fxl.js';

var _tempVec3$1 = new Vec3();
var _sphere = Sphere.create(0, 0, 0, 1);
var _rangedDirLightBoundingBox$2 = new AABB(0.0, 0.0, 0.0, 0.5, 0.5, 0.5);
var _tmpBoundingBox$2 = new AABB();
var roPool = new Pool(function () {
  return {
    model: null,
    depth: 0
  };
}, 128);
function getRenderObject(model, camera) {
  var depth = 0;
  if (model.node) {
    Vec3.subtract(_tempVec3$1, model.worldBounds ? model.worldBounds.center : model.node.worldPosition, camera.position);
    depth = Vec3.dot(_tempVec3$1, camera.forward);
  }
  var ro = roPool.alloc();
  ro.model = model;
  ro.depth = depth;
  return ro;
}
function validPunctualLightsCulling(sceneData, camera) {
  var validPunctualLights = sceneData.validPunctualLights;
  validPunctualLights.length = 0;
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
    AABB.transform(_tmpBoundingBox$2, _rangedDirLightBoundingBox$2, _light3.node.getWorldMatrix());
    if (intersect.aabbFrustum(_tmpBoundingBox$2, camera.frustum)) {
      validPunctualLights.push(_light3);
    }
  }
  sceneData.validPunctualLights = validPunctualLights;
}
function shadowCulling(camera, sceneData, layer) {
  var scene = camera.scene;
  var mainLight = scene.mainLight;
  var csmLayers = sceneData.csmLayers;
  var csmLayerObjects = csmLayers.layerObjects;
  var dirLightFrustum = layer.validFrustum;
  var dirShadowObjects = layer.shadowObjects;
  dirShadowObjects.length = 0;
  var visibility = camera.visibility;
  for (var i = csmLayerObjects.length - 1; i >= 0; i--) {
    var obj = csmLayerObjects.array[i];
    if (!obj) {
      csmLayerObjects.fastRemove(i);
      continue;
    }
    var model = obj.model;
    if (!model || !model.enabled || !model.node) {
      csmLayerObjects.fastRemove(i);
      continue;
    }
    if ((visibility & model.node.layer) !== model.node.layer && !(visibility & model.visFlags)) {
      csmLayerObjects.fastRemove(i);
      continue;
    }
    if (!model.worldBounds || !model.castShadow) {
      csmLayerObjects.fastRemove(i);
      continue;
    }
    var accurate = intersect.aabbFrustum(model.worldBounds, dirLightFrustum);
    if (!accurate) {
      continue;
    }
    dirShadowObjects.push(obj);
    if (layer.level < mainLight.csmLevel) {
      if (mainLight.csmOptimizationMode === CSMOptimizationMode.RemoveDuplicates && intersect.aabbFrustumCompletelyInside(model.worldBounds, dirLightFrustum)) {
        csmLayerObjects.fastRemove(i);
      }
    }
  }
}
function sceneCulling(sceneData, pipelineUBO, camera) {
  var scene = camera.scene;
  var mainLight = scene.mainLight;
  var shadows = sceneData.shadows;
  var skybox = sceneData.skybox;
  var csmLayers = sceneData.csmLayers;
  var renderObjects = sceneData.renderObjects;
  roPool.freeArray(renderObjects);
  renderObjects.length = 0;
  var castShadowObjects = csmLayers.castShadowObjects;
  castShadowObjects.length = 0;
  var csmLayerObjects = csmLayers.layerObjects;
  csmLayerObjects.clear();
  if (shadows.enabled) {
    pipelineUBO.updateShadowUBORange(UBOShadowEnum.SHADOW_COLOR_OFFSET, shadows.shadowColor);
    if (shadows.type === ShadowType.ShadowMap) {
      if (mainLight && mainLight.node) {
        csmLayers.update(sceneData, camera);
      }
    }
  }
  if (camera.clearFlag & SkyBoxFlagValue.VALUE) {
    if (skybox.enabled && skybox.model) {
      renderObjects.push(getRenderObject(skybox.model, camera));
    } else if (camera.cameraUsage !== CameraUsage.EDITOR && camera.cameraUsage !== CameraUsage.SCENE_VIEW) {
      warnID(15100, camera.name);
    }
  }
  var models = scene.models;
  var visibility = camera.visibility;
  function enqueueRenderObject(model) {
    if (model.enabled) {
      if (scene.isCulledByLod(camera, model)) {
        return;
      }
      if (model.castShadow) {
        castShadowObjects.push(getRenderObject(model, camera));
        csmLayerObjects.push(getRenderObject(model, camera));
      }
      if (model.node && (visibility & model.node.layer) === model.node.layer || visibility & model.visFlags) {
        if (model.worldBounds && !intersect.aabbFrustum(model.worldBounds, camera.frustum)) {
          return;
        }
        renderObjects.push(getRenderObject(model, camera));
      }
    }
  }
  for (var i = 0; i < models.length; i++) {
    enqueueRenderObject(models[i]);
  }
}

var _samplerLinearInfo = new SamplerInfo(Filter.LINEAR, Filter.LINEAR, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP);
var _samplerPointInfo = new SamplerInfo(Filter.POINT, Filter.POINT, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP);
var GlobalDSManager = function () {
  function GlobalDSManager(device) {
    this._descriptorSetMap = new Map();
    this._device = device;
    this._linearSampler = this._device.getSampler(_samplerLinearInfo);
    this._pointSampler = this._device.getSampler(_samplerPointInfo);
    var layoutInfo = new DescriptorSetLayoutInfo(globalDescriptorSetLayout.bindings);
    this._descriptorSetLayout = this._device.createDescriptorSetLayout(layoutInfo);
    this._globalDescriptorSet = this._device.createDescriptorSet(new DescriptorSetInfo(this._descriptorSetLayout));
  }
  var _proto = GlobalDSManager.prototype;
  _proto.regenLayout = function regenLayout() {
    var layoutInfo = new DescriptorSetLayoutInfo(globalDescriptorSetLayout.bindings);
    this._descriptorSetLayout = this._device.createDescriptorSetLayout(layoutInfo);
    this._globalDescriptorSet = this._device.createDescriptorSet(new DescriptorSetInfo(this._descriptorSetLayout));
  };
  _proto.bindBuffer = function bindBuffer(binding, buffer) {
    this._globalDescriptorSet.bindBuffer(binding, buffer);
    var it = this._descriptorSetMap.values();
    var res = it.next();
    while (!res.done) {
      var descriptorSet = res.value;
      descriptorSet.bindBuffer(binding, buffer);
      res = it.next();
    }
  };
  _proto.bindSampler = function bindSampler(binding, sampler) {
    this._globalDescriptorSet.bindSampler(binding, sampler);
    var it = this._descriptorSetMap.values();
    var res = it.next();
    while (!res.done) {
      var descriptorSet = res.value;
      descriptorSet.bindSampler(binding, sampler);
      res = it.next();
    }
  };
  _proto.bindTexture = function bindTexture(binding, texture) {
    this._globalDescriptorSet.bindTexture(binding, texture);
    var it = this._descriptorSetMap.values();
    var res = it.next();
    while (!res.done) {
      var descriptorSet = res.value;
      descriptorSet.bindTexture(binding, texture);
      res = it.next();
    }
  };
  _proto.update = function update() {
    this._globalDescriptorSet.update();
    var it = this._descriptorSetMap.values();
    var res = it.next();
    while (!res.done) {
      var descriptorSet = res.value;
      descriptorSet.update();
      res = it.next();
    }
  };
  _proto.getOrCreateDescriptorSet = function getOrCreateDescriptorSet(light) {
    var device = this._device;
    if (!this._descriptorSetMap.has(light)) {
      var globalDescriptorSet = this._globalDescriptorSet;
      var descriptorSet = device.createDescriptorSet(new DescriptorSetInfo(this._descriptorSetLayout));
      this._descriptorSetMap.set(light, descriptorSet);
      for (var i = PipelineGlobalBindings.UBO_GLOBAL; i < PipelineGlobalBindings.COUNT; i++) {
        descriptorSet.bindBuffer(i, globalDescriptorSet.getBuffer(i));
        descriptorSet.bindSampler(i, globalDescriptorSet.getSampler(i));
        descriptorSet.bindTexture(i, globalDescriptorSet.getTexture(i));
      }
      var shadowUBO = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOShadowEnum.SIZE, UBOShadowEnum.SIZE));
      descriptorSet.bindBuffer(UBOShadow.BINDING, shadowUBO);
      descriptorSet.update();
    }
    return this._descriptorSetMap.get(light);
  };
  _proto.destroy = function destroy() {
    this._descriptorSetLayout.destroy();
  };
  return _createClass(GlobalDSManager, [{
    key: "descriptorSetMap",
    get: function get() {
      return this._descriptorSetMap;
    }
  }, {
    key: "linearSampler",
    get: function get() {
      return this._linearSampler;
    }
  }, {
    key: "pointSampler",
    get: function get() {
      return this._pointSampler;
    }
  }, {
    key: "descriptorSetLayout",
    get: function get() {
      return this._descriptorSetLayout;
    }
  }, {
    key: "globalDescriptorSet",
    get: function get() {
      return this._globalDescriptorSet;
    },
    set: function set(val) {
      this._globalDescriptorSet = val;
    }
  }]);
}();

var _matShadowView$1 = new Mat4();
var _matShadowProj = new Mat4();
var _matShadowViewProj$1 = new Mat4();
var _vec4ShadowInfo = new Vec4();
var _lightDir = new Vec4(0.0, 0.0, 1.0, 0.0);
var _tempVec3 = new Vec3();
var mat4ToArray = Mat4.toArray;
var vec4ToArray = Vec4.toArray;
var colorToArray = Color.toArray;
var PipelineUBO = function () {
  function PipelineUBO() {
    this._globalUBO = new Float32Array(UBOGlobalEnum.COUNT);
    this._cameraUBO = new Float32Array(UBOCameraEnum.COUNT);
    this._shadowUBO = new Float32Array(UBOShadowEnum.COUNT);
    this._csmUBO = new Float32Array(UBOCSMEnum.COUNT);
  }
  PipelineUBO.updateGlobalUBOView = function updateGlobalUBOView(window, bufferView) {
    var director = cclegacy.director;
    var root = director.root;
    var fv = bufferView;
    var shadingWidth = Math.floor(window.width);
    var shadingHeight = Math.floor(window.height);
    fv[UBOGlobalEnum.TIME_OFFSET] = root.cumulativeTime;
    fv[UBOGlobalEnum.TIME_OFFSET + 1] = root.frameTime;
    fv[UBOGlobalEnum.TIME_OFFSET + 2] = director.getTotalFrames();
    fv[UBOGlobalEnum.TIME_OFFSET + 3] = root.cumulativeTime - Math.floor(root.frameTime);
    fv[UBOGlobalEnum.SCREEN_SIZE_OFFSET] = shadingWidth;
    fv[UBOGlobalEnum.SCREEN_SIZE_OFFSET + 1] = shadingHeight;
    fv[UBOGlobalEnum.SCREEN_SIZE_OFFSET + 2] = 1.0 / shadingWidth;
    fv[UBOGlobalEnum.SCREEN_SIZE_OFFSET + 3] = 1.0 / shadingHeight;
    fv[UBOGlobalEnum.NATIVE_SIZE_OFFSET] = shadingWidth;
    fv[UBOGlobalEnum.NATIVE_SIZE_OFFSET + 1] = shadingHeight;
    fv[UBOGlobalEnum.NATIVE_SIZE_OFFSET + 2] = 1.0 / fv[UBOGlobalEnum.NATIVE_SIZE_OFFSET];
    fv[UBOGlobalEnum.NATIVE_SIZE_OFFSET + 3] = 1.0 / fv[UBOGlobalEnum.NATIVE_SIZE_OFFSET + 1];
    if (cclegacy.internal.reflectionProbeManager) {
      fv[UBOGlobalEnum.PROBE_INFO_OFFSET] = cclegacy.internal.reflectionProbeManager.getMaxProbeId() + 1;
    }
    var debugView = root.debugView;
    for (var i = 0; i <= 3; i++) {
      fv[UBOGlobalEnum.DEBUG_VIEW_MODE_OFFSET + i] = 0.0;
    }
    if (debugView.isEnabled()) {
      fv[UBOGlobalEnum.DEBUG_VIEW_MODE_OFFSET] = debugView.singleMode;
      for (var _i = DebugViewCompositeType.DIRECT_DIFFUSE; _i < DebugViewCompositeType.MAX_BIT_COUNT; _i++) {
        var offset = _i >> 3;
        var bit = _i % 8;
        fv[UBOGlobalEnum.DEBUG_VIEW_MODE_OFFSET + 1 + offset] += (debugView.isCompositeModeEnabled(_i) ? 1.0 : 0.0) * Math.pow(10.0, bit);
      }
      fv[UBOGlobalEnum.DEBUG_VIEW_MODE_OFFSET + 3] += (debugView.lightingWithAlbedo ? 1.0 : 0.0) * Math.pow(10.0, 6.0);
      fv[UBOGlobalEnum.DEBUG_VIEW_MODE_OFFSET + 3] += (debugView.csmLayerColoration ? 1.0 : 0.0) * Math.pow(10.0, 7.0);
    }
  };
  PipelineUBO.updateCameraUBOView = function updateCameraUBOView(pipeline, bufferView, camera) {
    var _skybox$envmap;
    var scene = camera.scene ? camera.scene : cclegacy.director.getScene().renderScene;
    var mainLight = scene.mainLight;
    var sceneData = pipeline.pipelineSceneData;
    var ambient = sceneData.ambient;
    var skybox = sceneData.skybox;
    var fog = sceneData.fog;
    var shadowInfo = sceneData.shadows;
    var cv = bufferView;
    var exposure = camera.exposure;
    var isHDR = sceneData.isHDR;
    cv[UBOCameraEnum.SCREEN_SCALE_OFFSET] = sceneData.shadingScale;
    cv[UBOCameraEnum.SCREEN_SCALE_OFFSET + 1] = sceneData.shadingScale;
    cv[UBOCameraEnum.SCREEN_SCALE_OFFSET + 2] = 1.0 / cv[UBOCameraEnum.SCREEN_SCALE_OFFSET];
    cv[UBOCameraEnum.SCREEN_SCALE_OFFSET + 3] = 1.0 / cv[UBOCameraEnum.SCREEN_SCALE_OFFSET + 1];
    cv[UBOCameraEnum.EXPOSURE_OFFSET] = exposure;
    cv[UBOCameraEnum.EXPOSURE_OFFSET + 1] = 1.0 / exposure;
    cv[UBOCameraEnum.EXPOSURE_OFFSET + 2] = isHDR ? 1.0 : 0.0;
    cv[UBOCameraEnum.EXPOSURE_OFFSET + 3] = 1.0 / Camera.standardExposureValue;
    if (mainLight) {
      var shadowEnable = mainLight.shadowEnabled && shadowInfo.type === ShadowType.ShadowMap ? 1.0 : 0.0;
      var mainLightDir = mainLight.direction;
      _lightDir.set(mainLightDir.x, mainLightDir.y, mainLightDir.z, shadowEnable);
      vec4ToArray(cv, _lightDir, UBOCameraEnum.MAIN_LIT_DIR_OFFSET);
      Vec3.toArray(cv, mainLight.color, UBOCameraEnum.MAIN_LIT_COLOR_OFFSET);
      if (mainLight.useColorTemperature) {
        var _colorTempRGB = mainLight.colorTemperatureRGB;
        cv[UBOCameraEnum.MAIN_LIT_COLOR_OFFSET] *= _colorTempRGB.x;
        cv[UBOCameraEnum.MAIN_LIT_COLOR_OFFSET + 1] *= _colorTempRGB.y;
        cv[UBOCameraEnum.MAIN_LIT_COLOR_OFFSET + 2] *= _colorTempRGB.z;
      }
      if (isHDR) {
        cv[UBOCameraEnum.MAIN_LIT_COLOR_OFFSET + 3] = mainLight.illuminance * exposure;
      } else {
        cv[UBOCameraEnum.MAIN_LIT_COLOR_OFFSET + 3] = mainLight.illuminance;
      }
    } else {
      _lightDir.set(0, 0, 1, 0);
      vec4ToArray(cv, _lightDir, UBOCameraEnum.MAIN_LIT_DIR_OFFSET);
      vec4ToArray(cv, Vec4.ZERO, UBOCameraEnum.MAIN_LIT_COLOR_OFFSET);
    }
    var skyColor = ambient.skyColor;
    if (isHDR) {
      skyColor.w = ambient.skyIllum * exposure;
    } else {
      skyColor.w = ambient.skyIllum;
    }
    cv[UBOCameraEnum.AMBIENT_SKY_OFFSET + 0] = skyColor.x;
    cv[UBOCameraEnum.AMBIENT_SKY_OFFSET + 1] = skyColor.y;
    cv[UBOCameraEnum.AMBIENT_SKY_OFFSET + 2] = skyColor.z;
    cv[UBOCameraEnum.AMBIENT_SKY_OFFSET + 3] = skyColor.w;
    cv[UBOCameraEnum.AMBIENT_GROUND_OFFSET + 0] = ambient.groundAlbedo.x;
    cv[UBOCameraEnum.AMBIENT_GROUND_OFFSET + 1] = ambient.groundAlbedo.y;
    cv[UBOCameraEnum.AMBIENT_GROUND_OFFSET + 2] = ambient.groundAlbedo.z;
    cv[UBOCameraEnum.AMBIENT_GROUND_OFFSET + 3] = skybox.envmap ? (_skybox$envmap = skybox.envmap) == null ? void 0 : _skybox$envmap.mipmapLevel : 1.0;
    mat4ToArray(cv, camera.matView, UBOCameraEnum.MAT_VIEW_OFFSET);
    mat4ToArray(cv, camera.node.worldMatrix, UBOCameraEnum.MAT_VIEW_INV_OFFSET);
    Vec3.toArray(cv, camera.position, UBOCameraEnum.CAMERA_POS_OFFSET);
    mat4ToArray(cv, camera.matProj, UBOCameraEnum.MAT_PROJ_OFFSET);
    mat4ToArray(cv, camera.matProjInv, UBOCameraEnum.MAT_PROJ_INV_OFFSET);
    mat4ToArray(cv, camera.matViewProj, UBOCameraEnum.MAT_VIEW_PROJ_OFFSET);
    mat4ToArray(cv, camera.matViewProjInv, UBOCameraEnum.MAT_VIEW_PROJ_INV_OFFSET);
    cv[UBOCameraEnum.CAMERA_POS_OFFSET + 3] = this.getCombineSignY();
    cv[UBOCameraEnum.SURFACE_TRANSFORM_OFFSET] = camera.surfaceTransform;
    cv[UBOCameraEnum.SURFACE_TRANSFORM_OFFSET + 1] = camera.cameraUsage;
    cv[UBOCameraEnum.SURFACE_TRANSFORM_OFFSET + 2] = Math.cos(toRadian(sceneData.skybox.getRotationAngle()));
    cv[UBOCameraEnum.SURFACE_TRANSFORM_OFFSET + 3] = Math.sin(toRadian(sceneData.skybox.getRotationAngle()));
    var colorTempRGB = fog.colorArray;
    cv[UBOCameraEnum.GLOBAL_FOG_COLOR_OFFSET] = colorTempRGB.x;
    cv[UBOCameraEnum.GLOBAL_FOG_COLOR_OFFSET + 1] = colorTempRGB.y;
    cv[UBOCameraEnum.GLOBAL_FOG_COLOR_OFFSET + 2] = colorTempRGB.z;
    cv[UBOCameraEnum.GLOBAL_FOG_COLOR_OFFSET + 3] = colorTempRGB.z;
    cv[UBOCameraEnum.GLOBAL_FOG_BASE_OFFSET] = fog.fogStart;
    cv[UBOCameraEnum.GLOBAL_FOG_BASE_OFFSET + 1] = fog.fogEnd;
    cv[UBOCameraEnum.GLOBAL_FOG_BASE_OFFSET + 2] = fog.fogDensity;
    cv[UBOCameraEnum.GLOBAL_FOG_ADD_OFFSET] = fog.fogTop;
    cv[UBOCameraEnum.GLOBAL_FOG_ADD_OFFSET + 1] = fog.fogRange;
    cv[UBOCameraEnum.GLOBAL_FOG_ADD_OFFSET + 2] = fog.fogAtten;
    cv[UBOCameraEnum.NEAR_FAR_OFFSET] = camera.nearClip;
    cv[UBOCameraEnum.NEAR_FAR_OFFSET + 1] = camera.farClip;
    cv[UBOCameraEnum.NEAR_FAR_OFFSET + 2] = camera.getClipSpaceMinz();
    cv[UBOCameraEnum.VIEW_PORT_OFFSET] = sceneData.shadingScale * camera.window.width * camera.viewport.x;
    cv[UBOCameraEnum.VIEW_PORT_OFFSET + 1] = sceneData.shadingScale * camera.window.height * camera.viewport.y;
    cv[UBOCameraEnum.VIEW_PORT_OFFSET + 2] = sceneData.shadingScale * camera.window.width * camera.viewport.z;
    cv[UBOCameraEnum.VIEW_PORT_OFFSET + 3] = sceneData.shadingScale * camera.window.height * camera.viewport.w;
  };
  PipelineUBO.getPCFRadius = function getPCFRadius(shadowInfo, mainLight) {
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
  };
  PipelineUBO.updatePlanarNormalAndDistance = function updatePlanarNormalAndDistance(shadowInfo, shadowUBO) {
    Vec3.normalize(_tempVec3, shadowInfo.normal);
    shadowUBO[UBOShadowEnum.PLANAR_NORMAL_DISTANCE_INFO_OFFSET + 0] = _tempVec3.x;
    shadowUBO[UBOShadowEnum.PLANAR_NORMAL_DISTANCE_INFO_OFFSET + 1] = _tempVec3.y;
    shadowUBO[UBOShadowEnum.PLANAR_NORMAL_DISTANCE_INFO_OFFSET + 2] = _tempVec3.z;
    shadowUBO[UBOShadowEnum.PLANAR_NORMAL_DISTANCE_INFO_OFFSET + 3] = -shadowInfo.distance;
  };
  PipelineUBO.updateShadowUBOView = function updateShadowUBOView(pipeline, shadowBufferView, csmBufferView, camera) {
    var device = pipeline.device;
    var mainLight = camera.scene.mainLight;
    var sceneData = pipeline.pipelineSceneData;
    var shadowInfo = sceneData.shadows;
    var csmLayers = sceneData.csmLayers;
    var sv = shadowBufferView;
    var cv = csmBufferView;
    var csmSupported = sceneData.csmSupported;
    var packing = supportsR32FloatTexture(device) ? 0.0 : 1.0;
    if (mainLight && shadowInfo.enabled) {
      if (shadowInfo.type === ShadowType.ShadowMap) {
        if (mainLight.shadowEnabled) {
          if (mainLight.shadowFixedArea || mainLight.csmLevel === CSMLevel.LEVEL_1 || !csmSupported) {
            var matShadowView = csmLayers.specialLayer.matShadowView;
            var matShadowProj = csmLayers.specialLayer.matShadowProj;
            var matShadowViewProj = csmLayers.specialLayer.matShadowViewProj;
            var near = 0.1;
            var far = 0;
            var levelCount = 0;
            if (mainLight.shadowFixedArea) {
              near = mainLight.shadowNear;
              far = mainLight.shadowFar;
              levelCount = 0;
            } else {
              far = csmLayers.specialLayer.shadowCameraFar;
              levelCount = 1;
            }
            mat4ToArray(sv, matShadowView, UBOShadowEnum.MAT_LIGHT_VIEW_OFFSET);
            sv[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 0] = matShadowProj.m10;
            sv[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 1] = matShadowProj.m14;
            sv[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 2] = matShadowProj.m11;
            sv[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 3] = matShadowProj.m15;
            sv[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 0] = matShadowProj.m00;
            sv[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 1] = matShadowProj.m05;
            sv[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 2] = 1.0 / matShadowProj.m00;
            sv[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 3] = 1.0 / matShadowProj.m05;
            mat4ToArray(sv, matShadowViewProj, UBOShadowEnum.MAT_LIGHT_VIEW_PROJ_OFFSET);
            _vec4ShadowInfo.set(near, far, 0, 1.0 - mainLight.shadowSaturation);
            vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET);
            _vec4ShadowInfo.set(LightType.DIRECTIONAL, packing, mainLight.shadowNormalBias, levelCount);
            vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET);
          } else {
            var layerThreshold = this.getPCFRadius(shadowInfo, mainLight);
            for (var i = 0; i < mainLight.csmLevel; i++) {
              var layer = csmLayers.layers[i];
              var _matShadowView2 = layer.matShadowView;
              _vec4ShadowInfo.set(_matShadowView2.m00, _matShadowView2.m04, _matShadowView2.m08, layerThreshold);
              vec4ToArray(cv, _vec4ShadowInfo, UBOCSMEnum.CSM_VIEW_DIR_0_OFFSET + 4 * i);
              _vec4ShadowInfo.set(_matShadowView2.m01, _matShadowView2.m05, _matShadowView2.m09, layer.splitCameraNear);
              vec4ToArray(cv, _vec4ShadowInfo, UBOCSMEnum.CSM_VIEW_DIR_1_OFFSET + 4 * i);
              _vec4ShadowInfo.set(_matShadowView2.m02, _matShadowView2.m06, _matShadowView2.m10, layer.splitCameraFar);
              vec4ToArray(cv, _vec4ShadowInfo, UBOCSMEnum.CSM_VIEW_DIR_2_OFFSET + 4 * i);
              var csmAtlas = layer.csmAtlas;
              vec4ToArray(cv, csmAtlas, UBOCSMEnum.CSM_ATLAS_OFFSET + 4 * i);
              var _matShadowViewProj2 = layer.matShadowViewProj;
              mat4ToArray(cv, _matShadowViewProj2, UBOCSMEnum.MAT_CSM_VIEW_PROJ_OFFSET + 16 * i);
              var _matShadowProj2 = layer.matShadowProj;
              cv[UBOCSMEnum.CSM_PROJ_DEPTH_INFO_OFFSET + 0 + 4 * i] = _matShadowProj2.m10;
              cv[UBOCSMEnum.CSM_PROJ_DEPTH_INFO_OFFSET + 1 + 4 * i] = _matShadowProj2.m14;
              cv[UBOCSMEnum.CSM_PROJ_DEPTH_INFO_OFFSET + 2 + 4 * i] = _matShadowProj2.m11;
              cv[UBOCSMEnum.CSM_PROJ_DEPTH_INFO_OFFSET + 3 + 4 * i] = _matShadowProj2.m15;
              cv[UBOCSMEnum.CSM_PROJ_INFO_OFFSET + 0 + 4 * i] = _matShadowProj2.m00;
              cv[UBOCSMEnum.CSM_PROJ_INFO_OFFSET + 1 + 4 * i] = _matShadowProj2.m05;
              cv[UBOCSMEnum.CSM_PROJ_INFO_OFFSET + 2 + 4 * i] = 1.0 / _matShadowProj2.m00;
              cv[UBOCSMEnum.CSM_PROJ_INFO_OFFSET + 3 + 4 * i] = 1.0 / _matShadowProj2.m05;
            }
            _vec4ShadowInfo.set(mainLight.csmTransitionRange, 0, 0, 0);
            vec4ToArray(cv, _vec4ShadowInfo, UBOCSMEnum.CSM_SPLITS_INFO_OFFSET);
            _vec4ShadowInfo.set(0.1, mainLight.shadowDistance, 0, 1.0 - mainLight.shadowSaturation);
            vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET);
            _vec4ShadowInfo.set(LightType.DIRECTIONAL, packing, mainLight.shadowNormalBias, mainLight.csmLevel);
            vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET);
          }
          _vec4ShadowInfo.set(shadowInfo.size.x, shadowInfo.size.y, mainLight.shadowPcf, mainLight.shadowBias);
          vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET);
        }
      } else {
        PipelineUBO.updatePlanarNormalAndDistance(shadowInfo, sv);
        _vec4ShadowInfo.set(0, 0, 0, shadowInfo.planeBias);
        vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET);
      }
      colorToArray(sv, shadowInfo.shadowColor, UBOShadowEnum.SHADOW_COLOR_OFFSET);
    }
  };
  PipelineUBO.updateShadowUBOLightView = function updateShadowUBOLightView(pipeline, shadowBufferView, light, level) {
    var device = pipeline.device;
    var sceneData = pipeline.pipelineSceneData;
    var shadowInfo = sceneData.shadows;
    var csmLayers = sceneData.csmLayers;
    var sv = shadowBufferView;
    var packing = supportsR32FloatTexture(device) ? 0.0 : 1.0;
    var cap = pipeline.device.capabilities;
    var csmSupported = sceneData.csmSupported;
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
              if (mainLight.shadowFixedArea || mainLight.csmLevel === CSMLevel.LEVEL_1 || !csmSupported) {
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
                _vec4ShadowInfo.set(LightType.DIRECTIONAL, packing, mainLight.shadowNormalBias, 0);
                vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET);
              } else {
                var layer = csmLayers.layers[level];
                matShadowView = layer.matShadowView;
                matShadowProj = layer.matShadowProj;
                matShadowViewProj = layer.matShadowViewProj;
                near = layer.splitCameraNear;
                far = layer.splitCameraFar;
                levelCount = mainLight.csmLevel;
              }
              mat4ToArray(sv, matShadowView, UBOShadowEnum.MAT_LIGHT_VIEW_OFFSET);
              sv[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 0] = matShadowProj.m10;
              sv[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 1] = matShadowProj.m14;
              sv[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 2] = matShadowProj.m11;
              sv[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 3] = matShadowProj.m15;
              sv[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 0] = matShadowProj.m00;
              sv[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 1] = matShadowProj.m05;
              sv[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 2] = 1.0 / matShadowProj.m00;
              sv[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 3] = 1.0 / matShadowProj.m05;
              mat4ToArray(sv, matShadowViewProj, UBOShadowEnum.MAT_LIGHT_VIEW_PROJ_OFFSET);
              _vec4ShadowInfo.set(near, far, 0, 1.0 - mainLight.shadowSaturation);
              vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET);
              _vec4ShadowInfo.set(LightType.DIRECTIONAL, packing, mainLight.shadowNormalBias, levelCount);
              vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET);
              _vec4ShadowInfo.set(shadowInfo.size.x, shadowInfo.size.y, mainLight.shadowPcf, mainLight.shadowBias);
              vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET);
            }
          }
          break;
        }
      case LightType.SPOT:
        {
          var spotLight = light;
          if (shadowInfo.enabled && spotLight && spotLight.shadowEnabled) {
            Mat4.invert(_matShadowView$1, light.node.getWorldMatrix());
            mat4ToArray(sv, _matShadowView$1, UBOShadowEnum.MAT_LIGHT_VIEW_OFFSET);
            Mat4.perspective(_matShadowProj, spotLight.angle, 1.0, 0.001, spotLight.range, true, cap.clipSpaceMinZ, cap.clipSpaceSignY, 0);
            Mat4.multiply(_matShadowViewProj$1, _matShadowProj, _matShadowView$1);
            mat4ToArray(sv, _matShadowViewProj$1, UBOShadowEnum.MAT_LIGHT_VIEW_PROJ_OFFSET);
            _vec4ShadowInfo.set(0.01, light.range, 0.0, 0.0);
            vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET);
            _vec4ShadowInfo.set(shadowInfo.size.x, shadowInfo.size.y, spotLight.shadowPcf, spotLight.shadowBias);
            vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET);
            _vec4ShadowInfo.set(LightType.SPOT, packing, spotLight.shadowNormalBias, 0.0);
            vec4ToArray(sv, _vec4ShadowInfo, UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET);
          }
          break;
        }
    }
    colorToArray(sv, shadowInfo.shadowColor, UBOShadowEnum.SHADOW_COLOR_OFFSET);
  };
  PipelineUBO.getCombineSignY = function getCombineSignY() {
    return PipelineUBO._combineSignY;
  };
  var _proto = PipelineUBO.prototype;
  _proto._initCombineSignY = function _initCombineSignY() {
    var device = this._device;
    PipelineUBO._combineSignY = device.capabilities.screenSpaceSignY * 0.5 + 0.5 << 1 | device.capabilities.clipSpaceSignY * 0.5 + 0.5;
  };
  _proto.activate = function activate(device, pipeline) {
    this._device = device;
    this._pipeline = pipeline;
    var ds = this._pipeline.descriptorSet;
    if (isEnableEffect()) {
      return;
    }
    this._initCombineSignY();
    var globalUBO = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOGlobalEnum.SIZE, UBOGlobalEnum.SIZE));
    ds.bindBuffer(UBOGlobal.BINDING, globalUBO);
    var cameraUBO = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOCameraEnum.SIZE, UBOCameraEnum.SIZE));
    ds.bindBuffer(UBOCamera.BINDING, cameraUBO);
    var shadowUBO = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOShadowEnum.SIZE, UBOShadowEnum.SIZE));
    ds.bindBuffer(UBOShadow.BINDING, shadowUBO);
    var csmUBO = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOCSMEnum.SIZE, UBOCSMEnum.SIZE));
    ds.bindBuffer(UBOCSM.BINDING, csmUBO);
  };
  _proto.updateGlobalUBO = function updateGlobalUBO(window) {
    var globalDSManager = this._pipeline.globalDSManager;
    var ds = this._pipeline.descriptorSet;
    var cmdBuffer = this._pipeline.commandBuffers;
    ds.update();
    PipelineUBO.updateGlobalUBOView(window, this._globalUBO);
    cmdBuffer[0].updateBuffer(ds.getBuffer(UBOGlobal.BINDING), this._globalUBO);
    globalDSManager.bindBuffer(UBOGlobal.BINDING, ds.getBuffer(UBOGlobal.BINDING));
    globalDSManager.update();
  };
  _proto.updateCameraUBO = function updateCameraUBO(camera) {
    var globalDSManager = this._pipeline.globalDSManager;
    var ds = this._pipeline.descriptorSet;
    var cmdBuffer = this._pipeline.commandBuffers;
    PipelineUBO.updateCameraUBOView(this._pipeline, this._cameraUBO, camera);
    cmdBuffer[0].updateBuffer(ds.getBuffer(UBOCamera.BINDING), this._cameraUBO);
    globalDSManager.bindBuffer(UBOCamera.BINDING, ds.getBuffer(UBOCamera.BINDING));
    globalDSManager.update();
  };
  _proto.updateShadowUBO = function updateShadowUBO(camera) {
    var sceneData = this._pipeline.pipelineSceneData;
    var shadowInfo = sceneData.shadows;
    if (!shadowInfo.enabled) return;
    var globalDSManager = this._pipeline.globalDSManager;
    var ds = this._pipeline.descriptorSet;
    var cmdBuffer = this._pipeline.commandBuffers;
    var shadowFrameBufferMap = sceneData.shadowFrameBufferMap;
    var mainLight = camera.scene.mainLight;
    if (mainLight && shadowFrameBufferMap.has(mainLight)) {
      globalDSManager.bindTexture(UNIFORM_SHADOWMAP_BINDING, shadowFrameBufferMap.get(mainLight).colorTextures[0]);
    }
    PipelineUBO.updateShadowUBOView(this._pipeline, this._shadowUBO, this._csmUBO, camera);
    globalDSManager.update();
    cmdBuffer[0].updateBuffer(ds.getBuffer(UBOShadow.BINDING), this._shadowUBO);
    cmdBuffer[0].updateBuffer(ds.getBuffer(UBOCSM.BINDING), this._csmUBO);
  };
  _proto.updateShadowUBOLight = function updateShadowUBOLight(globalDS, light, level) {
    if (level === void 0) {
      level = 0;
    }
    PipelineUBO.updateShadowUBOLightView(this._pipeline, this._shadowUBO, light, level);
    globalDS.bindTexture(UNIFORM_SHADOWMAP_BINDING, getDefaultShadowTexture(this._pipeline.device));
    globalDS.bindTexture(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, getDefaultShadowTexture(this._pipeline.device));
    globalDS.update();
    this._pipeline.commandBuffers[0].updateBuffer(globalDS.getBuffer(UBOShadow.BINDING), this._shadowUBO);
  };
  _proto.updateShadowUBORange = function updateShadowUBORange(offset, data) {
    if (data instanceof Mat4) {
      mat4ToArray(this._shadowUBO, data, offset);
    } else if (data instanceof Color) {
      colorToArray(this._shadowUBO, data, offset);
    }
  };
  _proto.destroy = function destroy() {};
  return PipelineUBO;
}();
PipelineUBO._combineSignY = 0;

var _dec$g, _class$g, _class2$a, _initializer$a, _initializer2$5, _initializer3$2;
var RenderStage = (_dec$g = ccclass('RenderStage'), _dec$g(_class$g = (_class2$a = function () {
  function RenderStage() {
    this._name = _initializer$a && _initializer$a();
    this._priority = _initializer2$5 && _initializer2$5();
    this._enabled = true;
    this._tag = _initializer3$2 && _initializer3$2();
    this._pipeline = void 0;
    this._flow = void 0;
  }
  var _proto = RenderStage.prototype;
  _proto.initialize = function initialize(info) {
    this._name = info.name;
    this._priority = info.priority;
    if (info.tag) {
      this._tag = info.tag;
    }
    return true;
  };
  _proto.activate = function activate(pipeline, flow) {
    this._pipeline = pipeline;
    this._flow = flow;
  };
  return _createClass(RenderStage, [{
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    }
  }, {
    key: "tag",
    get: function get() {
      return this._tag;
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
}(), _initializer$a = applyDecoratedInitializer(_class2$a.prototype, "_name", [serializable], function () {
  return '';
}), _initializer2$5 = applyDecoratedInitializer(_class2$a.prototype, "_priority", [serializable], function () {
  return 0;
}), _initializer3$2 = applyDecoratedInitializer(_class2$a.prototype, "_tag", [serializable], function () {
  return 0;
}), _class2$a)) || _class$g);
cclegacy.RenderStage = RenderStage;

var _dec$f, _dec2$9, _class$f, _class2$9, _initializer$9, _initializer2$4, _initializer3$1, _initializer4$1;
var RenderFlow = (_dec$f = ccclass('RenderFlow'), _dec2$9 = type([RenderStage]), _dec$f(_class$f = (_class2$9 = function () {
  function RenderFlow() {
    this._name = _initializer$9 && _initializer$9();
    this._priority = _initializer2$4 && _initializer2$4();
    this._tag = _initializer3$1 && _initializer3$1();
    this._stages = _initializer4$1 && _initializer4$1();
    this._pipeline = void 0;
  }
  var _proto = RenderFlow.prototype;
  _proto.initialize = function initialize(info) {
    this._name = info.name;
    this._priority = info.priority;
    this._stages = info.stages;
    if (info.tag) {
      this._tag = info.tag;
    }
    return true;
  };
  _proto.activate = function activate(pipeline) {
    this._pipeline = pipeline;
    this._stages.sort(function (a, b) {
      return a.priority - b.priority;
    });
    for (var i = 0, len = this._stages.length; i < len; i++) {
      this._stages[i].activate(pipeline, this);
    }
  };
  _proto.render = function render(camera) {
    for (var i = 0, len = this._stages.length; i < len; i++) {
      if (this._stages[i].enabled) this._stages[i].render(camera);
    }
  };
  _proto.destroy = function destroy() {
    for (var i = 0, len = this._stages.length; i < len; i++) {
      this._stages[i].destroy();
    }
    this._stages.length = 0;
  };
  return _createClass(RenderFlow, [{
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    }
  }, {
    key: "tag",
    get: function get() {
      return this._tag;
    }
  }, {
    key: "stages",
    get: function get() {
      return this._stages;
    }
  }, {
    key: "pipeline",
    get: function get() {
      return this._pipeline;
    }
  }]);
}(), _initializer$9 = applyDecoratedInitializer(_class2$9.prototype, "_name", [serializable], function () {
  return '';
}), _initializer2$4 = applyDecoratedInitializer(_class2$9.prototype, "_priority", [serializable], function () {
  return 0;
}), _initializer3$1 = applyDecoratedInitializer(_class2$9.prototype, "_tag", [serializable], function () {
  return 0;
}), _initializer4$1 = applyDecoratedInitializer(_class2$9.prototype, "_stages", [_dec2$9, serializable], function () {
  return [];
}), _class2$9)) || _class$f);
cclegacy.RenderFlow = RenderFlow;

var _dec$e, _dec2$8, _class$e, _class2$8, _initializer$8, _initializer2$3;
var MAX_BLOOM_FILTER_PASS_NUM = 6;
var tmpRect = new Rect();
var tmpViewport = new Viewport();
var BloomRenderData = function BloomRenderData() {
  this.renderPass = null;
  this.sampler = null;
  this.prefiterTex = null;
  this.downsampleTexs = [];
  this.upsampleTexs = [];
  this.combineTex = null;
  this.prefilterFramebuffer = null;
  this.downsampleFramebuffers = [];
  this.upsampleFramebuffers = [];
  this.combineFramebuffer = null;
};
var PipelineRenderData = function PipelineRenderData() {
  this.outputFrameBuffer = null;
  this.outputRenderTargets = [];
  this.outputDepth = null;
  this.sampler = null;
  this.bloom = null;
};
function hashFrameBuffer(fbo) {
  var hash = 666;
  for (var _iterator = _createForOfIteratorHelperLoose(fbo.colorTextures), _step; !(_step = _iterator()).done;) {
    var color = _step.value;
    var _info = color == null ? void 0 : color.info;
    var _hashStr = _info.type + "_" + _info.usage + "_" + _info.format + "_" + _info.width + "_" + _info.height + "_" + _info.flags + "_\n            " + _info.layerCount + "_" + _info.levelCount + "_" + _info.samples + "_" + _info.depth + "_" + _info.externalRes;
    hash = murmurhash2_32_gc(_hashStr, hash);
  }
  if (fbo.depthStencilTexture) {
    var info = fbo.depthStencilTexture.info;
    var hashStr = info.type + "_" + info.usage + "_" + info.format + "_" + info.width + "_" + info.height + "_" + info.flags + "_\n            " + info.layerCount + "_" + info.levelCount + "_" + info.samples + "_" + info.depth + "_" + info.externalRes;
    hash = murmurhash2_32_gc(hashStr, hash);
  }
  return hash;
}
var RenderPipeline = (_dec$e = ccclass('cc.RenderPipeline'), _dec2$8 = type([RenderFlow]), _dec$e(_class$e = (_class2$8 = function (_Asset) {
  function RenderPipeline(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this._tag = _initializer$8 && _initializer$8();
    _this._flows = _initializer2$3 && _initializer2$3();
    _this._quadIB = null;
    _this._quadVBOnscreen = null;
    _this._quadVBOffscreen = null;
    _this._quadIAOnscreen = null;
    _this._quadIAOffscreen = null;
    _this._eventProcessor = new PipelineEventProcessor();
    _this._device = void 0;
    _this._globalDSManager = void 0;
    _this._descriptorSet = void 0;
    _this._commandBuffers = [];
    _this._pipelineUBO = new PipelineUBO();
    _this._macros = {};
    _this._constantMacros = '';
    _this._profiler = null;
    _this._geometryRenderer = null;
    _this._pipelineRenderData = null;
    _this._renderPasses = new Map();
    _this._width = 0;
    _this._height = 0;
    _this._lastUsedRenderArea = new Rect();
    _this._clusterEnabled = false;
    _this._bloomEnabled = false;
    return _this;
  }
  _inheritsLoose(RenderPipeline, _Asset);
  var _proto = RenderPipeline.prototype;
  _proto.getPipelineRenderData = function getPipelineRenderData() {
    return this._pipelineRenderData;
  };
  _proto.initialize = function initialize(info) {
    this._flows = info.flows;
    if (info.tag) {
      this._tag = info.tag;
    }
    return true;
  };
  _proto.createRenderPass = function createRenderPass(clearFlags, colorFmt, depthFmt) {
    var device = this._device;
    var colorAttachment = new ColorAttachment();
    var depthStencilAttachment = new DepthStencilAttachment();
    colorAttachment.format = colorFmt;
    depthStencilAttachment.format = depthFmt;
    depthStencilAttachment.stencilStoreOp = StoreOp.DISCARD;
    depthStencilAttachment.depthStoreOp = StoreOp.DISCARD;
    if (!(clearFlags & ClearFlagBit.COLOR)) {
      if (clearFlags & SkyBoxFlagValue.VALUE) {
        colorAttachment.loadOp = LoadOp.CLEAR;
      } else {
        colorAttachment.loadOp = LoadOp.LOAD;
        colorAttachment.barrier = device.getGeneralBarrier(new GeneralBarrierInfo(AccessFlagBit.COLOR_ATTACHMENT_WRITE, AccessFlagBit.COLOR_ATTACHMENT_WRITE));
      }
    }
    if ((clearFlags & ClearFlagBit.DEPTH_STENCIL) !== ClearFlagBit.DEPTH_STENCIL) {
      if (!(clearFlags & ClearFlagBit.DEPTH)) depthStencilAttachment.depthLoadOp = LoadOp.LOAD;
      if (!(clearFlags & ClearFlagBit.STENCIL)) depthStencilAttachment.stencilLoadOp = LoadOp.LOAD;
    }
    depthStencilAttachment.barrier = device.getGeneralBarrier(new GeneralBarrierInfo(AccessFlagBit.DEPTH_STENCIL_ATTACHMENT_WRITE, AccessFlagBit.DEPTH_STENCIL_ATTACHMENT_WRITE));
    var renderPassInfo = new RenderPassInfo([colorAttachment], depthStencilAttachment);
    return device.createRenderPass(renderPassInfo);
  };
  _proto.getRenderPass = function getRenderPass(clearFlags, fbo) {
    var fbHash = hashFrameBuffer(fbo);
    var hash = murmurhash2_32_gc(fbHash + "_" + clearFlags, 666);
    var renderPass = this._renderPasses.get(hash);
    if (renderPass) {
      return renderPass;
    }
    renderPass = this.createRenderPass(clearFlags, fbo.colorTextures[0].format, fbo.depthStencilTexture.format);
    this._renderPasses.set(hash, renderPass);
    return renderPass;
  };
  _proto.newFramebufferByRatio = function newFramebufferByRatio(dyingFramebuffer) {
    var sceneData = this.pipelineSceneData;
    var width = this._width * sceneData.shadingScale;
    var height = this._height * sceneData.shadingScale;
    var colorTexArr = dyingFramebuffer.colorTextures;
    for (var i = 0; i < colorTexArr.length; i++) {
      colorTexArr[i].resize(width, height);
    }
    if (dyingFramebuffer.depthStencilTexture) {
      dyingFramebuffer.depthStencilTexture.resize(width, height);
    }
    var newFramebuffer = this._device.createFramebuffer(new FramebufferInfo(dyingFramebuffer.renderPass, colorTexArr, dyingFramebuffer.depthStencilTexture));
    dyingFramebuffer.destroy();
    return newFramebuffer;
  };
  _proto.generateRenderArea = function generateRenderArea(camera, out) {
    var vp = camera.viewport;
    var w = camera.window.width;
    var h = camera.window.height;
    out.x = vp.x * w;
    out.y = vp.y * h;
    out.width = vp.width * w;
    out.height = vp.height * h;
  };
  _proto.generateViewport = function generateViewport(camera, out) {
    this.generateRenderArea(camera, tmpRect);
    if (!out) out = tmpViewport;
    var shadingScale = this.pipelineSceneData.shadingScale;
    out.left = tmpRect.x * shadingScale;
    out.top = tmpRect.y * shadingScale;
    out.width = tmpRect.width * shadingScale;
    out.height = tmpRect.height * shadingScale;
    return out;
  };
  _proto.generateScissor = function generateScissor(camera, out) {
    if (!out) out = tmpRect;
    this.generateRenderArea(camera, out);
    var shadingScale = this.pipelineSceneData.shadingScale;
    out.x *= shadingScale;
    out.y *= shadingScale;
    out.width *= shadingScale;
    out.height *= shadingScale;
    return out;
  };
  _proto.getMacroString = function getMacroString(name) {
    var str = this._macros[name];
    if (str === undefined) {
      return '';
    }
    return str;
  };
  _proto.getMacroInt = function getMacroInt(name) {
    var value = this._macros[name];
    if (value === undefined) {
      return 0;
    }
    return value;
  };
  _proto.getMacroBool = function getMacroBool(name) {
    var value = this._macros[name];
    if (value === undefined) {
      return false;
    }
    return value;
  };
  _proto.setMacroString = function setMacroString(name, value) {
    this._macros[name] = value;
  };
  _proto.setMacroInt = function setMacroInt(name, value) {
    this._macros[name] = value;
  };
  _proto.setMacroBool = function setMacroBool(name, value) {
    this._macros[name] = value;
  };
  _proto.activate = function activate(swapchain) {
    this._device = deviceManager.gfxDevice;
    this._generateConstantMacros();
    this._globalDSManager = new GlobalDSManager(this._device);
    this._descriptorSet = this._globalDSManager.globalDescriptorSet;
    this._pipelineUBO.activate(this._device, this);
    this._macros.CC_USE_HDR = this._pipelineSceneData.isHDR;
    this._macros.CC_USE_DEBUG_VIEW = 0;
    this._generateConstantMacros();
    this._pipelineSceneData.activate(this._device);
    for (var i = 0; i < this._flows.length; i++) {
      this._flows[i].activate(this);
    }
    return true;
  };
  _proto._ensureEnoughSize = function _ensureEnoughSize(cameras) {};
  _proto.render = function render(cameras) {
    if (cameras.length === 0) {
      return;
    }
    this.updateGeometryRenderer(cameras);
    this._commandBuffers[0].begin();
    this.emit(PipelineEventType.RENDER_FRAME_BEGIN, cameras);
    this._ensureEnoughSize(cameras);
    decideProfilerCamera(cameras);
    for (var i = 0; i < cameras.length; i++) {
      var camera = cameras[i];
      if (camera.scene) {
        this.emit(PipelineEventType.RENDER_CAMERA_BEGIN, camera);
        validPunctualLightsCulling(this.pipelineSceneData, camera);
        sceneCulling(this.pipelineSceneData, this.pipelineUBO, camera);
        this._pipelineUBO.updateGlobalUBO(camera.window);
        this._pipelineUBO.updateCameraUBO(camera);
        for (var j = 0; j < this._flows.length; j++) {
          this._flows[j].render(camera);
        }
        this.emit(PipelineEventType.RENDER_CAMERA_END, camera);
      }
    }
    this.emit(PipelineEventType.RENDER_FRAME_END, cameras);
    this._commandBuffers[0].end();
    this._device.queue.submit(this._commandBuffers);
  };
  _proto._destroyQuadInputAssembler = function _destroyQuadInputAssembler() {
    if (this._quadIB) {
      this._quadIB.destroy();
      this._quadIB = null;
    }
    if (this._quadVBOnscreen) {
      this._quadVBOnscreen.destroy();
      this._quadVBOnscreen = null;
    }
    if (this._quadVBOffscreen) {
      this._quadVBOffscreen.destroy();
      this._quadVBOffscreen = null;
    }
    if (this._quadIAOnscreen) {
      this._quadIAOnscreen.destroy();
      this._quadIAOnscreen = null;
    }
    if (this._quadIAOffscreen) {
      this._quadIAOffscreen.destroy();
      this._quadIAOffscreen = null;
    }
  };
  _proto._destroyBloomData = function _destroyBloomData() {
    var _bloom$renderPass;
    var bloom = this._pipelineRenderData.bloom;
    if (bloom === null) return;
    if (bloom.prefiterTex) bloom.prefiterTex.destroy();
    if (bloom.prefilterFramebuffer) bloom.prefilterFramebuffer.destroy();
    for (var i = 0; i < bloom.downsampleTexs.length; ++i) {
      bloom.downsampleTexs[i].destroy();
      bloom.downsampleFramebuffers[i].destroy();
    }
    bloom.downsampleTexs.length = 0;
    bloom.downsampleFramebuffers.length = 0;
    for (var _i = 0; _i < bloom.upsampleTexs.length; ++_i) {
      bloom.upsampleTexs[_i].destroy();
      bloom.upsampleFramebuffers[_i].destroy();
    }
    bloom.upsampleTexs.length = 0;
    bloom.upsampleFramebuffers.length = 0;
    if (bloom.combineTex) bloom.combineTex.destroy();
    if (bloom.combineFramebuffer) bloom.combineFramebuffer.destroy();
    (_bloom$renderPass = bloom.renderPass) == null ? void 0 : _bloom$renderPass.destroy();
    this._pipelineRenderData.bloom = null;
  };
  _proto._genQuadVertexData = function _genQuadVertexData(surfaceTransform, renderArea) {
    var vbData = new Float32Array(4 * 4);
    var minX = renderArea.x / this._width;
    var maxX = (renderArea.x + renderArea.width) / this._width;
    var minY = renderArea.y / this._height;
    var maxY = (renderArea.y + renderArea.height) / this._height;
    if (this.device.capabilities.screenSpaceSignY > 0) {
      var temp = maxY;
      maxY = minY;
      minY = temp;
    }
    var n = 0;
    switch (surfaceTransform) {
      case SurfaceTransform.IDENTITY:
        n = 0;
        vbData[n++] = -1;
        vbData[n++] = -1;
        vbData[n++] = minX;
        vbData[n++] = maxY;
        vbData[n++] = 1.0;
        vbData[n++] = -1;
        vbData[n++] = maxX;
        vbData[n++] = maxY;
        vbData[n++] = -1;
        vbData[n++] = 1.0;
        vbData[n++] = minX;
        vbData[n++] = minY;
        vbData[n++] = 1.0;
        vbData[n++] = 1.0;
        vbData[n++] = maxX;
        vbData[n++] = minY;
        break;
      case SurfaceTransform.ROTATE_90:
        n = 0;
        vbData[n++] = -1;
        vbData[n++] = -1;
        vbData[n++] = maxX;
        vbData[n++] = maxY;
        vbData[n++] = 1.0;
        vbData[n++] = -1;
        vbData[n++] = maxX;
        vbData[n++] = minY;
        vbData[n++] = -1;
        vbData[n++] = 1.0;
        vbData[n++] = minX;
        vbData[n++] = maxY;
        vbData[n++] = 1.0;
        vbData[n++] = 1.0;
        vbData[n++] = minX;
        vbData[n++] = minY;
        break;
      case SurfaceTransform.ROTATE_180:
        n = 0;
        vbData[n++] = -1;
        vbData[n++] = -1;
        vbData[n++] = minX;
        vbData[n++] = minY;
        vbData[n++] = 1.0;
        vbData[n++] = -1;
        vbData[n++] = maxX;
        vbData[n++] = minY;
        vbData[n++] = -1;
        vbData[n++] = 1.0;
        vbData[n++] = minX;
        vbData[n++] = maxY;
        vbData[n++] = 1.0;
        vbData[n++] = 1.0;
        vbData[n++] = maxX;
        vbData[n++] = maxY;
        break;
      case SurfaceTransform.ROTATE_270:
        n = 0;
        vbData[n++] = -1;
        vbData[n++] = -1;
        vbData[n++] = minX;
        vbData[n++] = minY;
        vbData[n++] = 1.0;
        vbData[n++] = -1;
        vbData[n++] = minX;
        vbData[n++] = maxY;
        vbData[n++] = -1;
        vbData[n++] = 1.0;
        vbData[n++] = maxX;
        vbData[n++] = minY;
        vbData[n++] = 1.0;
        vbData[n++] = 1.0;
        vbData[n++] = maxX;
        vbData[n++] = maxY;
        break;
    }
    return vbData;
  };
  _proto._createQuadInputAssembler = function _createQuadInputAssembler() {
    var inputAssemblerData = new PipelineInputAssemblerData();
    var vbStride = Float32Array.BYTES_PER_ELEMENT * 4;
    var vbSize = vbStride * 4;
    var quadVB = this._device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE | MemoryUsageBit.HOST, vbSize, vbStride));
    if (!quadVB) {
      return inputAssemblerData;
    }
    var ibStride = Uint8Array.BYTES_PER_ELEMENT;
    var ibSize = ibStride * 6;
    var quadIB = this._device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, ibSize, ibStride));
    if (!quadIB) {
      return inputAssemblerData;
    }
    var indices = new Uint8Array(6);
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 1;
    indices[4] = 3;
    indices[5] = 2;
    quadIB.update(indices);
    var attributes = new Array(2);
    attributes[0] = new Attribute('a_position', Format.RG32F);
    attributes[1] = new Attribute('a_texCoord', Format.RG32F);
    var quadIA = this._device.createInputAssembler(new InputAssemblerInfo(attributes, [quadVB], quadIB));
    inputAssemblerData.quadIB = quadIB;
    inputAssemblerData.quadVB = quadVB;
    inputAssemblerData.quadIA = quadIA;
    return inputAssemblerData;
  };
  _proto.updateQuadVertexData = function updateQuadVertexData(renderArea, window) {
    var cachedArea = this._lastUsedRenderArea;
    if (cachedArea.x === renderArea.x && cachedArea.y === renderArea.y && cachedArea.width === renderArea.width && cachedArea.height === renderArea.height) {
      return;
    }
    var offData = this._genQuadVertexData(SurfaceTransform.IDENTITY, renderArea);
    this._quadVBOffscreen.update(offData);
    var onData = this._genQuadVertexData(window.swapchain && window.swapchain.surfaceTransform || SurfaceTransform.IDENTITY, renderArea);
    this._quadVBOnscreen.update(onData);
    cachedArea.copy(renderArea);
  };
  _proto.destroy = function destroy() {
    var _this$_globalDSManage, _this$_pipelineSceneD;
    for (var i = 0; i < this._flows.length; i++) {
      this._flows[i].destroy();
    }
    this._flows.length = 0;
    if (this._descriptorSet) {
      this._descriptorSet.destroy();
    }
    (_this$_globalDSManage = this._globalDSManager) == null ? void 0 : _this$_globalDSManage.destroy();
    for (var _i2 = 0; _i2 < this._commandBuffers.length; _i2++) {
      this._commandBuffers[_i2].destroy();
    }
    this._commandBuffers.length = 0;
    this._pipelineUBO.destroy();
    (_this$_pipelineSceneD = this._pipelineSceneData) == null ? void 0 : _this$_pipelineSceneD.destroy();
    return _Asset.prototype.destroy.call(this);
  };
  _proto.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {};
  _proto._generateConstantMacros = function _generateConstantMacros() {
    var str = '';
    str += "#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE " + (this.device.getFormatFeatures(Format.RGBA32F) & (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE) ? 1 : 0) + "\n";
    str += "#define CC_ENABLE_CLUSTERED_LIGHT_CULLING " + (this._clusterEnabled ? 1 : 0) + "\n";
    str += "#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS " + this.device.capabilities.maxVertexUniformVectors + "\n";
    str += "#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS " + this.device.capabilities.maxFragmentUniformVectors + "\n";
    str += "#define CC_DEVICE_CAN_BENEFIT_FROM_INPUT_ATTACHMENT " + (this.device.hasFeature(Feature.INPUT_ATTACHMENT_BENEFIT) ? 1 : 0) + "\n";
    str += "#define CC_PLATFORM_ANDROID_AND_WEBGL " + (systemInfo.os === OS.ANDROID && systemInfo.isBrowser ? 1 : 0) + "\n";
    str += "#define CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES " + (macro.ENABLE_WEBGL_HIGHP_STRUCT_VALUES ? 1 : 0) + "\n";
    var jointUniformCapacity = UBOSkinning.JOINT_UNIFORM_CAPACITY;
    str += "#define CC_JOINT_UNIFORM_CAPACITY " + jointUniformCapacity + "\n";
    this._constantMacros = str;
  };
  _proto.updateGeometryRenderer = function updateGeometryRenderer(cameras) {
    if (this._geometryRenderer) {
      return;
    }
    for (var i = 0; i < cameras.length; i++) {
      var camera = cameras[i];
      if (camera && camera.window && camera.window.swapchain) {
        camera.initGeometryRenderer();
        this._geometryRenderer = camera.geometryRenderer;
        return;
      }
    }
  };
  _proto.generateBloomRenderData = function generateBloomRenderData() {
    if (this._pipelineRenderData.bloom != null) return;
    var bloom = this._pipelineRenderData.bloom = new BloomRenderData();
    var device = this.device;
    var colorAttachment = new ColorAttachment();
    colorAttachment.format = Format.RGBA8;
    colorAttachment.loadOp = LoadOp.CLEAR;
    colorAttachment.storeOp = StoreOp.STORE;
    colorAttachment.barrier = device.getGeneralBarrier(new GeneralBarrierInfo(AccessFlagBit.NONE, AccessFlagBit.COLOR_ATTACHMENT_WRITE));
    bloom.renderPass = device.createRenderPass(new RenderPassInfo([colorAttachment]));
    var curWidth = this._width;
    var curHeight = this._height;
    bloom.prefiterTex = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED, Format.RGBA8, curWidth >> 1, curHeight >> 1));
    bloom.prefilterFramebuffer = device.createFramebuffer(new FramebufferInfo(bloom.renderPass, [bloom.prefiterTex]));
    curWidth >>= 1;
    curHeight >>= 1;
    for (var i = 0; i < MAX_BLOOM_FILTER_PASS_NUM; ++i) {
      bloom.downsampleTexs.push(device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED, Format.RGBA8, curWidth >> 1, curHeight >> 1)));
      bloom.downsampleFramebuffers[i] = device.createFramebuffer(new FramebufferInfo(bloom.renderPass, [bloom.downsampleTexs[i]]));
      bloom.upsampleTexs.push(device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED, Format.RGBA8, curWidth, curHeight)));
      bloom.upsampleFramebuffers[i] = device.createFramebuffer(new FramebufferInfo(bloom.renderPass, [bloom.upsampleTexs[i]]));
      curWidth >>= 1;
      curHeight >>= 1;
    }
    bloom.combineTex = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED, Format.RGBA8, this._width, this._height));
    bloom.combineFramebuffer = device.createFramebuffer(new FramebufferInfo(bloom.renderPass, [bloom.combineTex]));
    bloom.sampler = this.globalDSManager.linearSampler;
  };
  _proto.on = function on(type, callback, target, once) {
    return this._eventProcessor.on(type, callback, target, once);
  };
  _proto.once = function once(type, callback, target) {
    return this._eventProcessor.once(type, callback, target);
  };
  _proto.off = function off(type, callback, target) {
    this._eventProcessor.off(type, callback, target);
  };
  _proto.emit = function emit(type, arg0, arg1, arg2, arg3, arg4) {
    this._eventProcessor.emit(type, arg0, arg1, arg2, arg3, arg4);
  };
  _proto.targetOff = function targetOff(typeOrTarget) {
    this._eventProcessor.targetOff(typeOrTarget);
  };
  _proto.removeAll = function removeAll(typeOrTarget) {
    this._eventProcessor.removeAll(typeOrTarget);
  };
  _proto.hasEventListener = function hasEventListener(type, callback, target) {
    return this._eventProcessor.hasEventListener(type, callback, target);
  };
  return _createClass(RenderPipeline, [{
    key: "tag",
    get: function get() {
      return this._tag;
    }
  }, {
    key: "flows",
    get: function get() {
      return this._flows;
    }
  }, {
    key: "quadIAOnscreen",
    get: function get() {
      return this._quadIAOnscreen;
    }
  }, {
    key: "quadIAOffscreen",
    get: function get() {
      return this._quadIAOffscreen;
    }
  }, {
    key: "constantMacros",
    get: function get() {
      return this._constantMacros;
    }
  }, {
    key: "macros",
    get: function get() {
      return this._macros;
    }
  }, {
    key: "device",
    get: function get() {
      return this._device;
    }
  }, {
    key: "globalDSManager",
    get: function get() {
      return this._globalDSManager;
    }
  }, {
    key: "descriptorSetLayout",
    get: function get() {
      return this._globalDSManager.descriptorSetLayout;
    }
  }, {
    key: "descriptorSet",
    get: function get() {
      return this._descriptorSet;
    }
  }, {
    key: "commandBuffers",
    get: function get() {
      return this._commandBuffers;
    }
  }, {
    key: "pipelineUBO",
    get: function get() {
      return this._pipelineUBO;
    }
  }, {
    key: "pipelineSceneData",
    get: function get() {
      return this._pipelineSceneData;
    }
  }, {
    key: "profiler",
    get: function get() {
      return this._profiler;
    },
    set: function set(value) {
      this._profiler = value;
    }
  }, {
    key: "geometryRenderer",
    get: function get() {
      return this._geometryRenderer;
    }
  }, {
    key: "clusterEnabled",
    get: function get() {
      return this._clusterEnabled;
    },
    set: function set(value) {
      this._clusterEnabled = value;
    }
  }, {
    key: "bloomEnabled",
    get: function get() {
      return this._bloomEnabled;
    },
    set: function set(value) {
      this._bloomEnabled = value;
    }
  }, {
    key: "shadingScale",
    get: function get() {
      return this._pipelineSceneData.shadingScale;
    },
    set: function set(val) {
      if (this._pipelineSceneData.shadingScale !== val) {
        this._pipelineSceneData.shadingScale = val;
        this.emit(PipelineEventType.ATTACHMENT_SCALE_CAHNGED, val);
      }
    }
  }]);
}(Asset), _initializer$8 = applyDecoratedInitializer(_class2$8.prototype, "_tag", [serializable], function () {
  return 0;
}), _initializer2$3 = applyDecoratedInitializer(_class2$8.prototype, "_flows", [_dec2$8, serializable], function () {
  return [];
}), _class2$8)) || _class$e);
cclegacy.RenderPipeline = RenderPipeline;

markAsWarning(RenderPipeline.prototype, 'RenderPipeline.prototype', [{
  name: 'geometryRenderer',
  suggest: 'please use camera.geometryRenderer instead.'
}]);

var CommonStagePriority;
(function (CommonStagePriority) {
  CommonStagePriority[CommonStagePriority["BLOOM"] = 18] = "BLOOM";
  CommonStagePriority[CommonStagePriority["POST_PROCESS"] = 19] = "POST_PROCESS";
  CommonStagePriority[CommonStagePriority["UI"] = 20] = "UI";
})(CommonStagePriority || (CommonStagePriority = {}));
var ForwardStagePriority;
(function (ForwardStagePriority) {
  ForwardStagePriority[ForwardStagePriority["AR"] = 5] = "AR";
  ForwardStagePriority[ForwardStagePriority["FORWARD"] = 10] = "FORWARD";
})(ForwardStagePriority || (ForwardStagePriority = {}));
var ForwardFlowPriority;
(function (ForwardFlowPriority) {
  ForwardFlowPriority[ForwardFlowPriority["SHADOW"] = 0] = "SHADOW";
  ForwardFlowPriority[ForwardFlowPriority["FORWARD"] = 1] = "FORWARD";
  ForwardFlowPriority[ForwardFlowPriority["UI"] = 10] = "UI";
})(ForwardFlowPriority || (ForwardFlowPriority = {}));
var DeferredStagePriority;
(function (DeferredStagePriority) {
  DeferredStagePriority[DeferredStagePriority["GBUFFER"] = 10] = "GBUFFER";
  DeferredStagePriority[DeferredStagePriority["LIGHTING"] = 15] = "LIGHTING";
  DeferredStagePriority[DeferredStagePriority["TRANSPARENT"] = 18] = "TRANSPARENT";
})(DeferredStagePriority || (DeferredStagePriority = {}));
var DeferredFlowPriority;
(function (DeferredFlowPriority) {
  DeferredFlowPriority[DeferredFlowPriority["SHADOW"] = 0] = "SHADOW";
  DeferredFlowPriority[DeferredFlowPriority["MAIN"] = 1] = "MAIN";
  DeferredFlowPriority[DeferredFlowPriority["UI"] = 10] = "UI";
})(DeferredFlowPriority || (DeferredFlowPriority = {}));

var _dec$d, _dec2$7, _dec3$2, _dec4, _class$d, _class2$7, _initializer$7, _initializer2$2, _initializer3, _initializer4, _initializer5, _initializer6, _dec5, _dec6, _class3, _class4, _initializer7, _initializer8, _dec7, _dec8, _class5, _class6, _initializer9, _initializer0, _dec9, _dec0, _dec1, _class7, _class8, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class9, _class0, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _class1, _class10, _initializer20, _initializer21, _initializer22, _initializer23, _initializer24, _initializer25, _initializer26, _initializer27, _dec24, _dec25, _dec26, _class11, _class12, _initializer28, _initializer29, _initializer30, _dec27, _dec28, _dec29, _class13, _class14, _initializer31, _initializer32, _initializer33;
ccenum(TextureType);
ccenum(TextureUsageBit);
ccenum(StoreOp);
ccenum(LoadOp);
ccenum(AccessFlagBit);
ccenum(Format);
var RenderFlowTag;
(function (RenderFlowTag) {
  RenderFlowTag[RenderFlowTag["SCENE"] = 0] = "SCENE";
  RenderFlowTag[RenderFlowTag["POSTPROCESS"] = 1] = "POSTPROCESS";
  RenderFlowTag[RenderFlowTag["UI"] = 2] = "UI";
})(RenderFlowTag || (RenderFlowTag = {}));
ccenum(RenderFlowTag);
(_dec$d = ccclass('RenderTextureDesc'), _dec2$7 = type(TextureType), _dec3$2 = type(TextureUsageBit), _dec4 = type(Format), _dec$d(_class$d = (_class2$7 = function RenderTextureDesc() {
  this.name = _initializer$7 && _initializer$7();
  this.type = _initializer2$2 && _initializer2$2();
  this.usage = _initializer3 && _initializer3();
  this.format = _initializer4 && _initializer4();
  this.width = _initializer5 && _initializer5();
  this.height = _initializer6 && _initializer6();
}, _initializer$7 = applyDecoratedInitializer(_class2$7.prototype, "name", [serializable], function () {
  return '';
}), _initializer2$2 = applyDecoratedInitializer(_class2$7.prototype, "type", [_dec2$7], function () {
  return TextureType.TEX2D;
}), _initializer3 = applyDecoratedInitializer(_class2$7.prototype, "usage", [_dec3$2], function () {
  return TextureUsageBit.COLOR_ATTACHMENT;
}), _initializer4 = applyDecoratedInitializer(_class2$7.prototype, "format", [_dec4], function () {
  return Format.UNKNOWN;
}), _initializer5 = applyDecoratedInitializer(_class2$7.prototype, "width", [serializable], function () {
  return -1;
}), _initializer6 = applyDecoratedInitializer(_class2$7.prototype, "height", [serializable], function () {
  return -1;
}), _class2$7)) || _class$d);
var RenderTextureConfig = (_dec5 = ccclass('RenderTextureConfig'), _dec6 = type(RenderTexture), _dec5(_class3 = (_class4 = function RenderTextureConfig() {
  this.name = _initializer7 && _initializer7();
  this.texture = _initializer8 && _initializer8();
}, _initializer7 = applyDecoratedInitializer(_class4.prototype, "name", [serializable], function () {
  return '';
}), _initializer8 = applyDecoratedInitializer(_class4.prototype, "texture", [_dec6], function () {
  return null;
}), _class4)) || _class3);
(_dec7 = ccclass('MaterialConfig'), _dec8 = type(Material), _dec7(_class5 = (_class6 = function MaterialConfig() {
  this.name = _initializer9 && _initializer9();
  this.material = _initializer0 && _initializer0();
}, _initializer9 = applyDecoratedInitializer(_class6.prototype, "name", [serializable], function () {
  return '';
}), _initializer0 = applyDecoratedInitializer(_class6.prototype, "material", [_dec8], function () {
  return null;
}), _class6)) || _class5);
(_dec9 = ccclass('FrameBufferDesc'), _dec0 = type([CCString]), _dec1 = type(RenderTexture), _dec9(_class7 = (_class8 = function FrameBufferDesc() {
  this.name = _initializer1 && _initializer1();
  this.renderPass = _initializer10 && _initializer10();
  this.colorTextures = _initializer11 && _initializer11();
  this.depthStencilTexture = _initializer12 && _initializer12();
  this.texture = _initializer13 && _initializer13();
}, _initializer1 = applyDecoratedInitializer(_class8.prototype, "name", [serializable], function () {
  return '';
}), _initializer10 = applyDecoratedInitializer(_class8.prototype, "renderPass", [serializable], function () {
  return 0;
}), _initializer11 = applyDecoratedInitializer(_class8.prototype, "colorTextures", [_dec0], function () {
  return [];
}), _initializer12 = applyDecoratedInitializer(_class8.prototype, "depthStencilTexture", [serializable], function () {
  return '';
}), _initializer13 = applyDecoratedInitializer(_class8.prototype, "texture", [_dec1], function () {
  return null;
}), _class8)) || _class7);
var ColorDesc = (_dec10 = ccclass('ColorDesc'), _dec11 = type(Format), _dec12 = type(LoadOp), _dec13 = type(StoreOp), _dec14 = type(AccessFlagBit), _dec15 = type(AccessFlagBit), _dec10(_class9 = (_class0 = function ColorDesc() {
  this.format = _initializer14 && _initializer14();
  this.loadOp = _initializer15 && _initializer15();
  this.storeOp = _initializer16 && _initializer16();
  this.sampleCount = _initializer17 && _initializer17();
  this.beginAccesses = _initializer18 && _initializer18();
  this.endAccesses = _initializer19 && _initializer19();
}, _initializer14 = applyDecoratedInitializer(_class0.prototype, "format", [_dec11], function () {
  return Format.UNKNOWN;
}), _initializer15 = applyDecoratedInitializer(_class0.prototype, "loadOp", [_dec12], function () {
  return LoadOp.CLEAR;
}), _initializer16 = applyDecoratedInitializer(_class0.prototype, "storeOp", [_dec13], function () {
  return StoreOp.STORE;
}), _initializer17 = applyDecoratedInitializer(_class0.prototype, "sampleCount", [serializable], function () {
  return 1;
}), _initializer18 = applyDecoratedInitializer(_class0.prototype, "beginAccesses", [_dec14], function () {
  return AccessFlagBit.NONE;
}), _initializer19 = applyDecoratedInitializer(_class0.prototype, "endAccesses", [_dec15], function () {
  return AccessFlagBit.COLOR_ATTACHMENT_WRITE;
}), _class0)) || _class9);
var DepthStencilDesc = (_dec16 = ccclass('DepthStencilDesc'), _dec17 = type(Format), _dec18 = type(LoadOp), _dec19 = type(StoreOp), _dec20 = type(LoadOp), _dec21 = type(StoreOp), _dec22 = type(AccessFlagBit), _dec23 = type(AccessFlagBit), _dec16(_class1 = (_class10 = function DepthStencilDesc() {
  this.format = _initializer20 && _initializer20();
  this.depthLoadOp = _initializer21 && _initializer21();
  this.depthStoreOp = _initializer22 && _initializer22();
  this.stencilLoadOp = _initializer23 && _initializer23();
  this.stencilStoreOp = _initializer24 && _initializer24();
  this.sampleCount = _initializer25 && _initializer25();
  this.beginAccesses = _initializer26 && _initializer26();
  this.endAccesses = _initializer27 && _initializer27();
}, _initializer20 = applyDecoratedInitializer(_class10.prototype, "format", [_dec17], function () {
  return Format.UNKNOWN;
}), _initializer21 = applyDecoratedInitializer(_class10.prototype, "depthLoadOp", [_dec18], function () {
  return LoadOp.CLEAR;
}), _initializer22 = applyDecoratedInitializer(_class10.prototype, "depthStoreOp", [_dec19], function () {
  return StoreOp.STORE;
}), _initializer23 = applyDecoratedInitializer(_class10.prototype, "stencilLoadOp", [_dec20], function () {
  return LoadOp.CLEAR;
}), _initializer24 = applyDecoratedInitializer(_class10.prototype, "stencilStoreOp", [_dec21], function () {
  return StoreOp.STORE;
}), _initializer25 = applyDecoratedInitializer(_class10.prototype, "sampleCount", [serializable], function () {
  return 1;
}), _initializer26 = applyDecoratedInitializer(_class10.prototype, "beginAccesses", [_dec22], function () {
  return AccessFlagBit.NONE;
}), _initializer27 = applyDecoratedInitializer(_class10.prototype, "endAccesses", [_dec23], function () {
  return AccessFlagBit.DEPTH_STENCIL_ATTACHMENT_WRITE;
}), _class10)) || _class1);
(_dec24 = ccclass('RenderPassDesc'), _dec25 = type([ColorDesc]), _dec26 = type(DepthStencilDesc), _dec24(_class11 = (_class12 = function RenderPassDesc() {
  this.index = _initializer28 && _initializer28();
  this.colorAttachments = _initializer29 && _initializer29();
  this.depthStencilAttachment = _initializer30 && _initializer30();
}, _initializer28 = applyDecoratedInitializer(_class12.prototype, "index", [serializable], function () {
  return -1;
}), _initializer29 = applyDecoratedInitializer(_class12.prototype, "colorAttachments", [_dec25], function () {
  return [];
}), _initializer30 = applyDecoratedInitializer(_class12.prototype, "depthStencilAttachment", [_dec26], function () {
  return new DepthStencilDesc();
}), _class12)) || _class11);
var RenderQueueSortMode;
(function (RenderQueueSortMode) {
  RenderQueueSortMode[RenderQueueSortMode["FRONT_TO_BACK"] = 0] = "FRONT_TO_BACK";
  RenderQueueSortMode[RenderQueueSortMode["BACK_TO_FRONT"] = 1] = "BACK_TO_FRONT";
})(RenderQueueSortMode || (RenderQueueSortMode = {}));
ccenum(RenderQueueSortMode);
var RenderQueueDesc = (_dec27 = ccclass('RenderQueueDesc'), _dec28 = type(RenderQueueSortMode), _dec29 = type([CCString]), _dec27(_class13 = (_class14 = function RenderQueueDesc() {
  this.isTransparent = _initializer31 && _initializer31();
  this.sortMode = _initializer32 && _initializer32();
  this.stages = _initializer33 && _initializer33();
}, _initializer31 = applyDecoratedInitializer(_class14.prototype, "isTransparent", [serializable], function () {
  return false;
}), _initializer32 = applyDecoratedInitializer(_class14.prototype, "sortMode", [_dec28], function () {
  return RenderQueueSortMode.FRONT_TO_BACK;
}), _initializer33 = applyDecoratedInitializer(_class14.prototype, "stages", [_dec29], function () {
  return [];
}), _class14)) || _class13);

function opaqueCompareFn(a, b) {
  return a.hash - b.hash || a.depth - b.depth || a.shaderId - b.shaderId;
}
function transparentCompareFn(a, b) {
  return a.priority - b.priority || a.hash - b.hash || b.depth - a.depth || a.shaderId - b.shaderId;
}
var RenderQueue = function () {
  function RenderQueue(desc) {
    this._passDesc = desc;
    this._passPool = getPassPool();
    this.queue = new CachedArray(64, this._passDesc.sortFunc);
  }
  var _proto = RenderQueue.prototype;
  _proto.clear = function clear() {
    this.queue.clear();
    this._passPool.reset();
  };
  _proto.insertRenderPass = function insertRenderPass(renderObj, subModelIdx, passIdx) {
    var subModel = renderObj.model.subModels[subModelIdx];
    var pass = subModel.passes[passIdx];
    var shader = subModel.shaders[passIdx];
    var isTransparent = pass.blendState.targets[0].blend;
    if (isTransparent !== this._passDesc.isTransparent || !(pass.phase & this._passDesc.phases)) {
      return false;
    }
    var hash = 0 << 30 | pass.priority << 16 | subModel.priority << 8 | passIdx;
    var rp = this._passPool.add();
    rp.priority = renderObj.model.priority;
    rp.hash = hash;
    rp.depth = renderObj.depth || 0;
    rp.shaderId = shader.typedID;
    rp.subModel = subModel;
    rp.passIdx = passIdx;
    this.queue.push(rp);
    return true;
  };
  _proto.sort = function sort() {
    this.queue.sort();
  };
  _proto.recordCommandBuffer = function recordCommandBuffer(device, renderPass, cmdBuff) {
    for (var i = 0; i < this.queue.length; ++i) {
      var _this$queue$array$i = this.queue.array[i],
        subModel = _this$queue$array$i.subModel,
        passIdx = _this$queue$array$i.passIdx;
      var inputAssembler = subModel.inputAssembler;
      var pass = subModel.passes[passIdx];
      var shader = subModel.shaders[passIdx];
      var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, inputAssembler);
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
      cmdBuff.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet);
      cmdBuff.bindInputAssembler(inputAssembler);
      cmdBuff.draw(inputAssembler);
    }
  };
  return RenderQueue;
}();
function convertRenderQueue(desc) {
  var phase = 0;
  for (var j = 0; j < desc.stages.length; j++) {
    phase |= getPhaseID(desc.stages[j]);
  }
  var sortFunc = opaqueCompareFn;
  switch (desc.sortMode) {
    case RenderQueueSortMode.BACK_TO_FRONT:
      sortFunc = transparentCompareFn;
      break;
    case RenderQueueSortMode.FRONT_TO_BACK:
      sortFunc = opaqueCompareFn;
      break;
  }
  return new RenderQueue({
    isTransparent: desc.isTransparent,
    phases: phase,
    sortFunc: sortFunc
  });
}
function renderQueueClearFunc(rq) {
  rq.clear();
}
function renderQueueSortFunc(rq) {
  rq.sort();
}

var RenderInstancedQueue = function () {
  function RenderInstancedQueue() {
    this.queue = new Set();
    this._renderQueue = [];
  }
  var _proto = RenderInstancedQueue.prototype;
  _proto.clear = function clear() {
    var it = this.queue.values();
    var res = it.next();
    while (!res.done) {
      res.value.clear();
      res = it.next();
    }
    this._renderQueue.length = 0;
    this.queue.clear();
  };
  _proto.sort = function sort() {
    var _this = this;
    var sortedArray = Array.from(this.queue).sort(instancingCompareFn);
    sortedArray.forEach(function (item) {
      var _item$pass$blendState;
      if (!((_item$pass$blendState = item.pass.blendState.targets[0]) != null && _item$pass$blendState.blend)) {
        _this._renderQueue.push(item);
      }
    });
    sortedArray.forEach(function (item) {
      var _item$pass$blendState2;
      if ((_item$pass$blendState2 = item.pass.blendState.targets[0]) != null && _item$pass$blendState2.blend) {
        _this._renderQueue.push(item);
      }
    });
  };
  _proto.uploadBuffers = function uploadBuffers(cmdBuff) {
    var it = this.queue.values();
    var res = it.next();
    while (!res.done) {
      if (res.value.hasPendingModels) res.value.uploadBuffers(cmdBuff);
      res = it.next();
    }
  };
  _proto.recordCommandBuffer = function recordCommandBuffer(device, renderPass, cmdBuff, descriptorSet, dynamicOffsets) {
    if (descriptorSet === void 0) {
      descriptorSet = null;
    }
    var it = this._renderQueue.length === 0 ? this.queue.values() : this._renderQueue[Symbol.iterator]();
    var res = it.next();
    while (!res.done) {
      var _res$value = res.value,
        instances = _res$value.instances,
        pass = _res$value.pass,
        hasPendingModels = _res$value.hasPendingModels;
      if (hasPendingModels) {
        cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
        var lastPSO = null;
        for (var b = 0; b < instances.length; ++b) {
          var instance = instances[b];
          if (!instance.count) {
            continue;
          }
          var shader = instance.shader;
          var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, instance.ia);
          if (lastPSO !== pso) {
            cmdBuff.bindPipelineState(pso);
            lastPSO = pso;
          }
          if (descriptorSet) cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, descriptorSet);
          if (dynamicOffsets) {
            cmdBuff.bindDescriptorSet(SetIndex.LOCAL, instance.descriptorSet, dynamicOffsets);
          } else {
            cmdBuff.bindDescriptorSet(SetIndex.LOCAL, instance.descriptorSet, res.value.dynamicOffsets);
          }
          cmdBuff.bindInputAssembler(instance.ia);
          cmdBuff.draw(instance.ia);
        }
      }
      res = it.next();
    }
  };
  return RenderInstancedQueue;
}();

var _lightPassPool = new Pool(function () {
  return {
    subModel: null,
    passIdx: -1,
    dynamicOffsets: [],
    lights: []
  };
}, 16);
var _v3$1 = new Vec3();
var _vec4Array = new Float32Array(4);
var _dynamicOffsets = [];
var _lightIndices = [];
var _matShadowView = new Mat4();
var _matShadowViewProj = new Mat4();
var _rangedDirLightBoundingBox$1 = new AABB(0.0, 0.0, 0.0, 0.5, 0.5, 0.5);
var _tmpBoundingBox$1 = new AABB();
function cullSphereLight(light, model) {
  return !!(model.worldBounds && !intersect.aabbWithAABB(model.worldBounds, light.aabb));
}
function cullSpotLight(light, model) {
  return !!(model.worldBounds && (!intersect.aabbWithAABB(model.worldBounds, light.aabb) || !intersect.aabbFrustum(model.worldBounds, light.frustum)));
}
function cullPointLight(light, model) {
  return !!(model.worldBounds && !intersect.aabbWithAABB(model.worldBounds, light.aabb));
}
function cullRangedDirLight(light, model) {
  AABB.transform(_tmpBoundingBox$1, _rangedDirLightBoundingBox$1, light.node.getWorldMatrix());
  return !!(model.worldBounds && !intersect.aabbWithAABB(model.worldBounds, _tmpBoundingBox$1));
}
var phaseName = 'forward-add';
var _phaseID$3 = getPhaseID(phaseName);
var _lightPassIndices = [];
function getLightPassIndices(subModels, lightPassIndices, passLayout) {
  if (passLayout === void 0) {
    passLayout = 'default';
  }
  var r = cclegacy.rendering;
  if (isEnableEffect()) {
    _phaseID$3 = r.getPhaseID(r.getPassID(passLayout), phaseName);
  }
  lightPassIndices.length = 0;
  var hasValidLightPass = false;
  for (var j = 0; j < subModels.length; j++) {
    var passes = subModels[j].passes;
    var lightPassIndex = -1;
    for (var k = 0; k < passes.length; k++) {
      if ((!r || !r.enableEffectImport) && passes[k].phase === _phaseID$3 || isEnableEffect() && passes[k].phaseID === _phaseID$3) {
        lightPassIndex = k;
        hasValidLightPass = true;
        break;
      }
    }
    lightPassIndices.push(lightPassIndex);
  }
  return hasValidLightPass;
}
var RenderAdditiveLightQueue = function () {
  function RenderAdditiveLightQueue(pipeline) {
    this._lightPasses = [];
    this._instancedLightPassPool = _lightPassPool.alloc();
    this._shadowUBO = new Float32Array(UBOShadowEnum.COUNT);
    this._lightBufferCount = 16;
    this._instancedQueues = [];
    this._lightMeterScale = 10000.0;
    this._pipeline = pipeline;
    this._device = pipeline.device;
    var alignment = this._device.capabilities.uboOffsetAlignment;
    this._lightBufferStride = Math.ceil(UBOForwardLightEnum.SIZE / alignment) * alignment;
    this._lightBufferElementCount = this._lightBufferStride / Float32Array.BYTES_PER_ELEMENT;
    this._lightBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, this._lightBufferStride * this._lightBufferCount, this._lightBufferStride));
    this._firstLightBufferView = this._device.createBuffer(new BufferViewInfo(this._lightBuffer, 0, UBOForwardLightEnum.SIZE));
    this._lightBufferData = new Float32Array(this._lightBufferElementCount * this._lightBufferCount);
  }
  var _proto = RenderAdditiveLightQueue.prototype;
  _proto.clear = function clear() {
    this._instancedQueues.forEach(function (instancedQueue) {
      instancedQueue.clear();
    });
    this._instancedQueues.length = 0;
    for (var i = 0; i < this._lightPasses.length; i++) {
      var lp = this._lightPasses[i];
      lp.dynamicOffsets.length = 0;
      lp.lights.length = 0;
    }
    _lightPassPool.freeArray(this._lightPasses);
    this._lightPasses.length = 0;
    this._instancedLightPassPool.dynamicOffsets.length = 0;
    this._instancedLightPassPool.lights.length = 0;
  };
  _proto.destroy = function destroy() {
    var descriptorSetMap = this._pipeline.globalDSManager.descriptorSetMap;
    var keys = descriptorSetMap.keys;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var descriptorSet = descriptorSetMap.get(key);
      if (descriptorSet) {
        descriptorSet.getBuffer(UBOShadow.BINDING).destroy();
        descriptorSet.getTexture(UNIFORM_SHADOWMAP_BINDING).destroy();
        descriptorSet.getTexture(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING).destroy();
        descriptorSet.destroy();
      }
      descriptorSetMap["delete"](key);
    }
  };
  _proto._bindForwardAddLight = function _bindForwardAddLight(validPunctualLights, passLayout) {
    if (passLayout === void 0) {
      passLayout = 'default';
    }
    var renderObjects = this._pipeline.pipelineSceneData.renderObjects;
    for (var i = 0; i < renderObjects.length; i++) {
      var ro = renderObjects[i];
      var model = ro.model;
      var subModels = model.subModels;
      if (!getLightPassIndices(subModels, _lightPassIndices, passLayout)) {
        continue;
      }
      _lightIndices.length = 0;
      this._lightCulling(model, validPunctualLights);
      if (!_lightIndices.length && validPunctualLights.length > 0) {
        continue;
      }
      for (var j = 0; j < subModels.length; j++) {
        var lightPassIdx = _lightPassIndices[j];
        if (lightPassIdx < 0) {
          continue;
        }
        var subModel = subModels[j];
        var pass = subModel.passes[lightPassIdx];
        var isTransparent = subModel.passes[0].blendState.targets[0].blend;
        if (isTransparent) {
          continue;
        }
        subModel.descriptorSet.bindBuffer(UBOForwardLight.BINDING, this._firstLightBufferView);
        subModel.descriptorSet.update();
        this._addRenderQueue(pass, subModel, model, lightPassIdx);
      }
    }
  };
  _proto.gatherLightPasses = function gatherLightPasses(camera, cmdBuff, passLayout) {
    if (passLayout === void 0) {
      passLayout = 'default';
    }
    this.clear();
    var validPunctualLights = this._pipeline.pipelineSceneData.validPunctualLights;
    if (!validPunctualLights.length) {
      this._bindForwardAddLight(validPunctualLights, passLayout);
      return;
    }
    this._updateUBOs(camera, cmdBuff);
    this._updateLightDescriptorSet(camera, cmdBuff);
    this._bindForwardAddLight(validPunctualLights, passLayout);
    for (var l = 0; l < validPunctualLights.length; l++) {
      var light = validPunctualLights[l];
      this._instancedLightPassPool.lights.push(light);
      this._instancedLightPassPool.dynamicOffsets.push(this._lightBufferStride * l);
    }
    this._instancedQueues.forEach(function (instancedQueue) {
      instancedQueue.uploadBuffers(cmdBuff);
    });
  };
  _proto.recordCommandBuffer = function recordCommandBuffer(device, renderPass, cmdBuff) {
    var globalDSManager = this._pipeline.globalDSManager;
    for (var j = 0; j < this._instancedQueues.length; ++j) {
      var light = this._instancedLightPassPool.lights[j];
      _dynamicOffsets[0] = this._instancedLightPassPool.dynamicOffsets[j];
      var descriptorSet = globalDSManager.getOrCreateDescriptorSet(light);
      this._instancedQueues[j].recordCommandBuffer(device, renderPass, cmdBuff, descriptorSet, _dynamicOffsets);
    }
    for (var i = 0; i < this._lightPasses.length; i++) {
      var _this$_lightPasses$i = this._lightPasses[i],
        subModel = _this$_lightPasses$i.subModel,
        passIdx = _this$_lightPasses$i.passIdx,
        dynamicOffsets = _this$_lightPasses$i.dynamicOffsets,
        lights = _this$_lightPasses$i.lights;
      var pass = subModel.passes[passIdx];
      var shader = subModel.shaders[passIdx];
      var ia = subModel.inputAssembler;
      var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, ia);
      var matDS = pass.descriptorSet;
      var localDS = subModel.descriptorSet;
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, matDS);
      cmdBuff.bindInputAssembler(ia);
      for (var _j = 0; _j < dynamicOffsets.length; ++_j) {
        var _light = lights[_j];
        var _descriptorSet = globalDSManager.getOrCreateDescriptorSet(_light);
        _dynamicOffsets[0] = dynamicOffsets[_j];
        cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, _descriptorSet);
        cmdBuff.bindDescriptorSet(SetIndex.LOCAL, localDS, _dynamicOffsets);
        cmdBuff.draw(ia);
      }
    }
  };
  _proto._lightCulling = function _lightCulling(model, validPunctualLights) {
    var isCulled = false;
    for (var l = 0; l < validPunctualLights.length; l++) {
      var light = validPunctualLights[l];
      switch (light.type) {
        case LightType.SPHERE:
          isCulled = cullSphereLight(light, model);
          break;
        case LightType.SPOT:
          isCulled = cullSpotLight(light, model);
          break;
        case LightType.POINT:
          isCulled = cullPointLight(light, model);
          break;
        case LightType.RANGED_DIRECTIONAL:
          isCulled = cullRangedDirLight(light, model);
          break;
      }
      if (!isCulled) {
        _lightIndices.push(l);
      }
    }
  };
  _proto._addRenderQueue = function _addRenderQueue(pass, subModel, model, lightPassIdx) {
    var validPunctualLights = this._pipeline.pipelineSceneData.validPunctualLights;
    var batchingScheme = pass.batchingScheme;
    var lp = null;
    if (batchingScheme === BatchingSchemes.NONE) {
      lp = _lightPassPool.alloc();
      lp.subModel = subModel;
      lp.passIdx = lightPassIdx;
    }
    for (var l = 0; l < _lightIndices.length; l++) {
      var lightIdx = _lightIndices[l];
      var light = validPunctualLights[lightIdx];
      var visibility = light.visibility;
      if ((visibility & model.node.layer) === model.node.layer) {
        switch (batchingScheme) {
          case BatchingSchemes.INSTANCING:
            {
              var buffer = pass.getInstancedBuffer(l);
              buffer.merge(subModel, lightPassIdx);
              buffer.dynamicOffsets[0] = this._lightBufferStride;
              if (!this._instancedQueues[l]) {
                this._instancedQueues[l] = new RenderInstancedQueue();
              }
              this._instancedQueues[l].queue.add(buffer);
            }
            break;
          default:
            lp.lights.push(light);
            lp.dynamicOffsets.push(this._lightBufferStride * lightIdx);
        }
      }
    }
    if (batchingScheme === BatchingSchemes.NONE) {
      this._lightPasses.push(lp);
    }
  };
  _proto._updateLightDescriptorSet = function _updateLightDescriptorSet(camera, cmdBuff) {
    var device = this._pipeline.device;
    var sceneData = this._pipeline.pipelineSceneData;
    var shadowInfo = sceneData.shadows;
    var shadowFrameBufferMap = sceneData.shadowFrameBufferMap;
    var mainLight = camera.scene.mainLight;
    var packing = supportsR32FloatTexture(device) ? 0.0 : 1.0;
    var globalDSManager = this._pipeline.globalDSManager;
    var validPunctualLights = sceneData.validPunctualLights;
    var cap = this._pipeline.device.capabilities;
    for (var i = 0; i < validPunctualLights.length; i++) {
      var light = validPunctualLights[i];
      var descriptorSet = globalDSManager.getOrCreateDescriptorSet(light);
      if (!descriptorSet) {
        continue;
      }
      var matShadowProj = void 0;
      var matShadowInvProj = void 0;
      switch (light.type) {
        case LightType.SPHERE:
          {
            if (mainLight) {
              PipelineUBO.updatePlanarNormalAndDistance(shadowInfo, this._shadowUBO);
            }
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 0] = shadowInfo.size.x;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 1] = shadowInfo.size.y;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 2] = 1.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 3] = 0.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 0] = LightType.SPHERE;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 1] = packing;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 2] = 0.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 3] = 0.0;
            Color.toArray(this._shadowUBO, shadowInfo.shadowColor, UBOShadowEnum.SHADOW_COLOR_OFFSET);
            break;
          }
        case LightType.SPOT:
          {
            var spotLight = light;
            if (mainLight) {
              PipelineUBO.updatePlanarNormalAndDistance(shadowInfo, this._shadowUBO);
            }
            Mat4.invert(_matShadowView, light.node.getWorldMatrix());
            Mat4.perspective(_matShadowViewProj, light.angle, 1.0, 0.001, light.range, true, cap.clipSpaceMinZ, cap.clipSpaceSignY, 0);
            matShadowProj = _matShadowViewProj.clone();
            matShadowInvProj = _matShadowViewProj.clone().invert();
            Mat4.multiply(_matShadowViewProj, _matShadowViewProj, _matShadowView);
            Mat4.toArray(this._shadowUBO, _matShadowView, UBOShadowEnum.MAT_LIGHT_VIEW_OFFSET);
            Mat4.toArray(this._shadowUBO, _matShadowViewProj, UBOShadowEnum.MAT_LIGHT_VIEW_PROJ_OFFSET);
            this._shadowUBO[UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET + 0] = 0.01;
            this._shadowUBO[UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET + 1] = light.range;
            this._shadowUBO[UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET + 2] = 0.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_NEAR_FAR_LINEAR_SATURATION_INFO_OFFSET + 3] = 0.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 0] = shadowInfo.size.x;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 1] = shadowInfo.size.y;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 2] = spotLight.shadowPcf;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 3] = spotLight.shadowBias;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 0] = LightType.SPOT;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 1] = packing;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 2] = spotLight.shadowNormalBias;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 3] = 0.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 0] = matShadowProj.m10;
            this._shadowUBO[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 1] = matShadowProj.m14;
            this._shadowUBO[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 2] = matShadowProj.m11;
            this._shadowUBO[UBOShadowEnum.SHADOW_PROJ_DEPTH_INFO_OFFSET + 3] = matShadowProj.m15;
            this._shadowUBO[UBOShadowEnum.SHADOW_INV_PROJ_DEPTH_INFO_OFFSET + 0] = matShadowInvProj.m10;
            this._shadowUBO[UBOShadowEnum.SHADOW_INV_PROJ_DEPTH_INFO_OFFSET + 1] = matShadowInvProj.m14;
            this._shadowUBO[UBOShadowEnum.SHADOW_INV_PROJ_DEPTH_INFO_OFFSET + 2] = matShadowInvProj.m11;
            this._shadowUBO[UBOShadowEnum.SHADOW_INV_PROJ_DEPTH_INFO_OFFSET + 3] = matShadowInvProj.m15;
            this._shadowUBO[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 0] = matShadowProj.m00;
            this._shadowUBO[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 1] = matShadowProj.m05;
            this._shadowUBO[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 2] = 1.0 / matShadowProj.m00;
            this._shadowUBO[UBOShadowEnum.SHADOW_PROJ_INFO_OFFSET + 3] = 1.0 / matShadowProj.m05;
            Color.toArray(this._shadowUBO, shadowInfo.shadowColor, UBOShadowEnum.SHADOW_COLOR_OFFSET);
            if (shadowFrameBufferMap.has(light)) {
              var _shadowFrameBufferMap;
              var texture = (_shadowFrameBufferMap = shadowFrameBufferMap.get(light)) == null ? void 0 : _shadowFrameBufferMap.colorTextures[0];
              if (texture) {
                globalDSManager.bindTexture(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, texture);
              }
            }
            break;
          }
        case LightType.POINT:
          {
            if (mainLight) {
              PipelineUBO.updatePlanarNormalAndDistance(shadowInfo, this._shadowUBO);
            }
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 0] = shadowInfo.size.x;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 1] = shadowInfo.size.y;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 2] = 1.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_WIDTH_HEIGHT_PCF_BIAS_INFO_OFFSET + 3] = 0.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 0] = LightType.POINT;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 1] = packing;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 2] = 0.0;
            this._shadowUBO[UBOShadowEnum.SHADOW_LIGHT_PACKING_NBIAS_NULL_INFO_OFFSET + 3] = 0.0;
            Color.toArray(this._shadowUBO, shadowInfo.shadowColor, UBOShadowEnum.SHADOW_COLOR_OFFSET);
            break;
          }
      }
      globalDSManager.update();
      cmdBuff.updateBuffer(descriptorSet.getBuffer(UBOShadow.BINDING), this._shadowUBO);
    }
  };
  _proto._updateUBOs = function _updateUBOs(camera, cmdBuff) {
    var exposure = camera.exposure;
    var sceneData = this._pipeline.pipelineSceneData;
    var isHDR = sceneData.isHDR;
    var shadowInfo = sceneData.shadows;
    var validPunctualLights = sceneData.validPunctualLights;
    if (validPunctualLights.length > this._lightBufferCount) {
      this._firstLightBufferView.destroy();
      this._lightBufferCount = nextPow2(validPunctualLights.length);
      this._lightBuffer.resize(this._lightBufferStride * this._lightBufferCount);
      this._lightBufferData = new Float32Array(this._lightBufferElementCount * this._lightBufferCount);
      this._firstLightBufferView = deviceManager.gfxDevice.createBuffer(new BufferViewInfo(this._lightBuffer, 0, UBOForwardLightEnum.SIZE));
    }
    for (var l = 0, offset = 0; l < validPunctualLights.length; l++, offset += this._lightBufferElementCount) {
      var light = validPunctualLights[l];
      switch (light.type) {
        case LightType.SPHERE:
          Vec3.toArray(_vec4Array, light.position);
          _vec4Array[3] = LightType.SPHERE;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_POS_OFFSET);
          _vec4Array[0] = light.size;
          _vec4Array[1] = light.range;
          _vec4Array[2] = 0.0;
          _vec4Array[3] = 0.0;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET);
          Vec3.toArray(_vec4Array, light.color);
          if (light.useColorTemperature) {
            var finalColor = light.finalColor;
            _vec4Array[0] = finalColor.x;
            _vec4Array[1] = finalColor.y;
            _vec4Array[2] = finalColor.z;
          }
          if (isHDR) {
            _vec4Array[3] = light.luminance * exposure * this._lightMeterScale;
          } else {
            _vec4Array[3] = light.luminance;
          }
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_COLOR_OFFSET);
          break;
        case LightType.SPOT:
          Vec3.toArray(_vec4Array, light.position);
          _vec4Array[3] = LightType.SPOT;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_POS_OFFSET);
          _vec4Array[0] = light.size;
          _vec4Array[1] = light.range;
          _vec4Array[2] = light.spotAngle;
          _vec4Array[3] = shadowInfo.enabled && light.shadowEnabled && shadowInfo.type === ShadowType.ShadowMap ? 1 : 0;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET);
          Vec3.toArray(_vec4Array, light.direction);
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_DIR_OFFSET);
          Vec3.toArray(_vec4Array, light.color);
          if (light.useColorTemperature) {
            var _finalColor = light.finalColor;
            _vec4Array[0] = _finalColor.x;
            _vec4Array[1] = _finalColor.y;
            _vec4Array[2] = _finalColor.z;
          }
          if (isHDR) {
            _vec4Array[3] = light.luminance * exposure * this._lightMeterScale;
          } else {
            _vec4Array[3] = light.luminance;
          }
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_COLOR_OFFSET);
          _vec4Array[0] = 0;
          _vec4Array[1] = 0;
          _vec4Array[2] = 0;
          _vec4Array[3] = light.angleAttenuationStrength;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET);
          break;
        case LightType.POINT:
          Vec3.toArray(_vec4Array, light.position);
          _vec4Array[3] = LightType.POINT;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_POS_OFFSET);
          _vec4Array[0] = 0.0;
          _vec4Array[1] = light.range;
          _vec4Array[2] = 0.0;
          _vec4Array[3] = 0.0;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET);
          Vec3.toArray(_vec4Array, light.color);
          if (light.useColorTemperature) {
            var _finalColor2 = light.finalColor;
            _vec4Array[0] = _finalColor2.x;
            _vec4Array[1] = _finalColor2.y;
            _vec4Array[2] = _finalColor2.z;
          }
          if (isHDR) {
            _vec4Array[3] = light.luminance * exposure * this._lightMeterScale;
          } else {
            _vec4Array[3] = light.luminance;
          }
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_COLOR_OFFSET);
          break;
        case LightType.RANGED_DIRECTIONAL:
          Vec3.toArray(_vec4Array, light.position);
          _vec4Array[3] = LightType.RANGED_DIRECTIONAL;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_POS_OFFSET);
          Vec3.toArray(_vec4Array, light.right);
          _vec4Array[3] = 0;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_SIZE_RANGE_ANGLE_OFFSET);
          Vec3.toArray(_vec4Array, light.direction);
          _vec4Array[3] = 0;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_DIR_OFFSET);
          var scale = light.scale;
          _v3$1.set(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5);
          Vec3.toArray(_vec4Array, _v3$1);
          _vec4Array[3] = 0;
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_BOUNDING_SIZE_VS_OFFSET);
          Vec3.toArray(_vec4Array, light.color);
          if (light.useColorTemperature) {
            var _finalColor3 = light.finalColor;
            _vec4Array[0] = _finalColor3.x;
            _vec4Array[1] = _finalColor3.y;
            _vec4Array[2] = _finalColor3.z;
          }
          if (isHDR) {
            _vec4Array[3] = light.illuminance * exposure;
          } else {
            _vec4Array[3] = light.illuminance;
          }
          this._lightBufferData.set(_vec4Array, offset + UBOForwardLightEnum.LIGHT_COLOR_OFFSET);
          break;
      }
    }
    cmdBuff.updateBuffer(this._lightBuffer, this._lightBufferData);
  };
  return RenderAdditiveLightQueue;
}();

var _ab = new AABB();
var _phaseID$2 = getPhaseID('planar-shadow');
function getPlanarShadowPassIndex(subModel) {
  var passes = subModel.passes;
  var r = cclegacy.rendering;
  if (isEnableEffect()) _phaseID$2 = r.getPhaseID(r.getPassID('default'), 'planar-shadow');
  for (var k = 0; k < passes.length; k++) {
    if ((!r || !r.enableEffectImport) && passes[k].phase === _phaseID$2 || isEnableEffect() && passes[k].phaseID === _phaseID$2) {
      return k;
    }
  }
  return -1;
}
var PlanarShadowQueue = function () {
  function PlanarShadowQueue(pipeline) {
    this._subModelArray = [];
    this._shaderArray = [];
    this._passArray = [];
    this._castModels = [];
    this._instancedQueue = new RenderInstancedQueue();
    this._pipeline = void 0;
    this._pipeline = pipeline;
  }
  var _proto = PlanarShadowQueue.prototype;
  _proto.clear = function clear() {
    this._subModelArray.length = 0;
    this._shaderArray.length = 0;
    this._passArray.length = 0;
    this._instancedQueue.clear();
    this._castModels.length = 0;
  };
  _proto.gatherShadowPasses = function gatherShadowPasses(camera, cmdBuff) {
    this.clear();
    var pipelineSceneData = this._pipeline.pipelineSceneData;
    var shadows = pipelineSceneData.shadows;
    if (!shadows.enabled || shadows.type !== ShadowType.Planar || shadows.normal.length() < 0.000001) {
      return;
    }
    var scene = camera.scene;
    var frustum = camera.frustum;
    var shadowVisible = (camera.visibility & Layers.BitMask.DEFAULT) !== 0;
    if (!scene.mainLight || !shadowVisible) {
      return;
    }
    var models = scene.models;
    var visibility = camera.visibility;
    for (var i = 0; i < models.length; i++) {
      var model = models[i];
      if (scene.isCulledByLod(camera, model)) {
        continue;
      }
      if (model.enabled && model.node && model.castShadow && model.node && (visibility & model.node.layer) === model.node.layer) {
        this._castModels.push(model);
      }
    }
    for (var _i = 0; _i < this._castModels.length; _i++) {
      var _model = this._castModels[_i];
      if (_model.worldBounds) {
        AABB.transform(_ab, _model.worldBounds, shadows.matLight);
        if (!intersect.aabbFrustum(_ab, frustum)) {
          continue;
        }
      }
      var subModels = _model.subModels;
      for (var j = 0; j < subModels.length; j++) {
        var subModel = subModels[j];
        var shadowPassIdx = getPlanarShadowPassIndex(subModel);
        if (shadowPassIdx < 0) {
          this._subModelArray.push(subModel);
          var planarShader = shadows.getPlanarShader(subModel.patches);
          if (!planarShader) {
            continue;
          }
          this._shaderArray.push(planarShader);
          this._passArray.push(shadows.material.passes[0]);
          continue;
        }
        var pass = subModel.passes[shadowPassIdx];
        var batchingScheme = pass.batchingScheme;
        if (batchingScheme === BatchingSchemes.INSTANCING) {
          var buffer = pass.getInstancedBuffer();
          buffer.merge(subModel, shadowPassIdx);
          this._instancedQueue.queue.add(buffer);
        } else {
          var shader = subModel.shaders[shadowPassIdx];
          this._subModelArray.push(subModel);
          if (shader) this._shaderArray.push(shader);
          this._passArray.push(pass);
        }
      }
    }
    this._instancedQueue.uploadBuffers(cmdBuff);
  };
  _proto.recordCommandBuffer = function recordCommandBuffer(device, renderPass, cmdBuff) {
    var shadows = this._pipeline.pipelineSceneData.shadows;
    if (!shadows.enabled || shadows.type !== ShadowType.Planar) {
      return;
    }
    this._instancedQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    for (var i = 0; i < this._subModelArray.length; ++i) {
      var subModel = this._subModelArray[i];
      var shader = this._shaderArray[i];
      var pass = this._passArray[i];
      var ia = subModel.inputAssembler;
      var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, ia);
      var descriptorSet = pass.descriptorSet;
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, descriptorSet);
      cmdBuff.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet);
      cmdBuff.bindInputAssembler(ia);
      cmdBuff.draw(ia);
    }
  };
  return PlanarShadowQueue;
}();

var UIPhase = function () {
  function UIPhase() {
    this._phaseID = getPhaseID('default');
    var r = cclegacy.rendering;
    if (isEnableEffect()) this._phaseID = r.getPhaseID(r.getPassID('default'), 'default');
  }
  var _proto = UIPhase.prototype;
  _proto.activate = function activate(pipeline) {
    this._pipeline = pipeline;
  };
  _proto.render = function render(camera, renderPass) {
    var pipeline = this._pipeline;
    var device = pipeline.device;
    var cmdBuff = pipeline.commandBuffers[0];
    var scene = camera.scene;
    var batches = scene.batches;
    for (var i = 0; i < batches.length; i++) {
      var batch = batches[i];
      var visible = false;
      if (camera.visibility & batch.visFlags) {
        visible = true;
      }
      if (!visible) continue;
      var count = batch.shaders.length;
      for (var j = 0; j < count; j++) {
        var pass = batch.passes[j];
        if (pass.phase !== this._phaseID) continue;
        if (pass.passID !== 0xFFFFFFFF) continue;
        var shader = batch.shaders[j];
        var inputAssembler = batch.inputAssembler;
        var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, inputAssembler);
        cmdBuff.bindPipelineState(pso);
        cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
        var ds = batch.descriptorSet;
        cmdBuff.bindDescriptorSet(SetIndex.LOCAL, ds);
        cmdBuff.bindInputAssembler(inputAssembler);
        cmdBuff.draw(inputAssembler);
      }
    }
  };
  return UIPhase;
}();

var _dec$c, _dec2$6, _class$c, _class2$6, _initializer$6, _ForwardStage;
var colors$6 = [new Color$1(0, 0, 0, 1)];
var ForwardStage = (_dec$c = ccclass('ForwardStage'), _dec2$6 = type([RenderQueueDesc]), _dec$c(_class$c = (_class2$6 = (_ForwardStage = function (_RenderStage) {
  function ForwardStage() {
    var _this;
    _this = _RenderStage.call(this) || this;
    _this.renderQueues = _initializer$6 && _initializer$6();
    _this._renderQueues = [];
    _this._renderArea = new Rect();
    _this._instancedQueue = new RenderInstancedQueue();
    _this._phaseID = getPhaseID('default');
    _this._clearFlag = 0xffffffff;
    _this._uiPhase = new UIPhase();
    _this.additiveInstanceQueues = [];
    return _this;
  }
  _inheritsLoose(ForwardStage, _RenderStage);
  var _proto = ForwardStage.prototype;
  _proto.addRenderInstancedQueue = function addRenderInstancedQueue(queue) {
    if (this.additiveInstanceQueues.includes(queue)) {
      return;
    }
    this.additiveInstanceQueues.push(queue);
  };
  _proto.removeRenderInstancedQueue = function removeRenderInstancedQueue(queue) {
    var index = this.additiveInstanceQueues.indexOf(queue);
    if (index > -1) {
      this.additiveInstanceQueues.splice(index, 1);
    }
  };
  _proto.initialize = function initialize(info) {
    _RenderStage.prototype.initialize.call(this, info);
    if (info.renderQueues) {
      this.renderQueues = info.renderQueues;
    }
    return true;
  };
  _proto.activate = function activate(pipeline, flow) {
    _RenderStage.prototype.activate.call(this, pipeline, flow);
    for (var i = 0; i < this.renderQueues.length; i++) {
      this._renderQueues[i] = convertRenderQueue(this.renderQueues[i]);
    }
    this._additiveLightQueue = new RenderAdditiveLightQueue(this._pipeline);
    this._planarQueue = new PlanarShadowQueue(this._pipeline);
    this._uiPhase.activate(pipeline);
  };
  _proto.destroy = function destroy() {};
  _proto.render = function render(camera) {
    var _camera$geometryRende;
    var pipeline = this._pipeline;
    var device = pipeline.device;
    this._instancedQueue.clear();
    this._renderQueues.forEach(renderQueueClearFunc);
    var renderObjects = pipeline.pipelineSceneData.renderObjects;
    var m = 0;
    var p = 0;
    var k = 0;
    for (var i = 0; i < renderObjects.length; ++i) {
      var ro = renderObjects[i];
      var subModels = ro.model.subModels;
      for (m = 0; m < subModels.length; ++m) {
        var subModel = subModels[m];
        var passes = subModel.passes;
        for (p = 0; p < passes.length; ++p) {
          var pass = passes[p];
          if (pass.phase !== this._phaseID) continue;
          if (pass.passID !== 0xFFFFFFFF) continue;
          var batchingScheme = pass.batchingScheme;
          if (batchingScheme === BatchingSchemes.INSTANCING) {
            var instancedBuffer = pass.getInstancedBuffer();
            instancedBuffer.merge(subModel, p);
            this._instancedQueue.queue.add(instancedBuffer);
          } else {
            for (k = 0; k < this._renderQueues.length; k++) {
              this._renderQueues[k].insertRenderPass(ro, m, p);
            }
          }
        }
      }
    }
    this._instancedQueue.sort();
    this._renderQueues.forEach(renderQueueSortFunc);
    var cmdBuff = pipeline.commandBuffers[0];
    pipeline.pipelineUBO.updateShadowUBO(camera);
    for (var _i = 0; _i < this.additiveInstanceQueues.length; _i++) {
      this.additiveInstanceQueues[_i].uploadBuffers(cmdBuff);
    }
    this._instancedQueue.uploadBuffers(cmdBuff);
    this._additiveLightQueue.gatherLightPasses(camera, cmdBuff);
    this._planarQueue.gatherShadowPasses(camera, cmdBuff);
    if (camera.clearFlag & ClearFlagBit.COLOR) {
      colors$6[0].x = camera.clearColor.x;
      colors$6[0].y = camera.clearColor.y;
      colors$6[0].z = camera.clearColor.z;
      colors$6[0].w = camera.clearColor.w;
    }
    pipeline.generateRenderArea(camera, this._renderArea);
    var framebuffer = camera.window.framebuffer;
    var renderPass = pipeline.getRenderPass(camera.clearFlag & this._clearFlag, framebuffer);
    cmdBuff.beginRenderPass(renderPass, framebuffer, this._renderArea, colors$6, camera.clearDepth, camera.clearStencil);
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);
    this._renderQueues[0].recordCommandBuffer(device, renderPass, cmdBuff);
    for (var _i2 = 0; _i2 < this.additiveInstanceQueues.length; _i2++) {
      this.additiveInstanceQueues[_i2].recordCommandBuffer(device, renderPass, cmdBuff);
    }
    this._instancedQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    this._additiveLightQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);
    this._planarQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    this._renderQueues[1].recordCommandBuffer(device, renderPass, cmdBuff);
    (_camera$geometryRende = camera.geometryRenderer) == null ? void 0 : _camera$geometryRende.render(renderPass, cmdBuff, pipeline.pipelineSceneData);
    this._uiPhase.render(camera, renderPass);
    renderProfiler(device, renderPass, cmdBuff, pipeline.profiler, camera);
    cmdBuff.endRenderPass();
  };
  return ForwardStage;
}(RenderStage), _ForwardStage.initInfo = {
  name: 'ForwardStage',
  priority: ForwardStagePriority.FORWARD,
  tag: 0,
  renderQueues: [{
    isTransparent: false,
    sortMode: RenderQueueSortMode.FRONT_TO_BACK,
    stages: ['default']
  }, {
    isTransparent: true,
    sortMode: RenderQueueSortMode.BACK_TO_FRONT,
    stages: ['default', 'planarShadow']
  }]
}, _ForwardStage), _initializer$6 = applyDecoratedInitializer(_class2$6.prototype, "renderQueues", [_dec2$6, serializable], function () {
  return [];
}), _class2$6)) || _class$c);

var _dec$b, _class$b, _ForwardFlow;
var ForwardFlow = (_dec$b = ccclass('ForwardFlow'), _dec$b(_class$b = (_ForwardFlow = function (_RenderFlow) {
  function ForwardFlow() {
    return _RenderFlow.apply(this, arguments) || this;
  }
  _inheritsLoose(ForwardFlow, _RenderFlow);
  var _proto = ForwardFlow.prototype;
  _proto.initialize = function initialize(info) {
    _RenderFlow.prototype.initialize.call(this, info);
    if (this._stages.length === 0) {
      var forwardStage = new ForwardStage();
      forwardStage.initialize(ForwardStage.initInfo);
      this._stages.push(forwardStage);
    }
    return true;
  };
  _proto.activate = function activate(pipeline) {
    _RenderFlow.prototype.activate.call(this, pipeline);
  };
  _proto.render = function render(camera) {
    _RenderFlow.prototype.render.call(this, camera);
  };
  _proto.destroy = function destroy() {
    _RenderFlow.prototype.destroy.call(this);
  };
  return ForwardFlow;
}(RenderFlow), _ForwardFlow.initInfo = {
  name: PIPELINE_FLOW_FORWARD,
  priority: ForwardFlowPriority.FORWARD,
  stages: []
}, _ForwardFlow)) || _class$b);

var _phaseID$1 = getPhaseID('shadow-caster');
function getShadowPassIndex(subModel) {
  var passes = subModel.passes;
  var r = cclegacy.rendering;
  if (isEnableEffect()) _phaseID$1 = r.getPhaseID(r.getPassID('default'), 'shadow-caster');
  for (var k = 0; k < passes.length; k++) {
    if ((!r || !r.enableEffectImport) && passes[k].phase === _phaseID$1 || isEnableEffect() && passes[k].phaseID === _phaseID$1) {
      return k;
    }
  }
  return -1;
}
var RenderShadowMapBatchedQueue = function () {
  function RenderShadowMapBatchedQueue(pipeline) {
    this._subModelsArray = [];
    this._passArray = [];
    this._shaderArray = [];
    this._instancedQueue = new RenderInstancedQueue();
    this._pipeline = pipeline;
  }
  var _proto = RenderShadowMapBatchedQueue.prototype;
  _proto.gatherLightPasses = function gatherLightPasses(camera, light, cmdBuff, level) {
    if (level === void 0) {
      level = 0;
    }
    this.clear();
    var sceneData = this._pipeline.pipelineSceneData;
    var shadowInfo = sceneData.shadows;
    if (light && shadowInfo.enabled && shadowInfo.type === ShadowType.ShadowMap) {
      switch (light.type) {
        case LightType.DIRECTIONAL:
          var dirLight = light;
          if (dirLight.shadowEnabled) {
            var csmLayers = sceneData.csmLayers;
            var layer;
            if (dirLight.shadowFixedArea) {
              layer = csmLayers.specialLayer;
            } else {
              layer = csmLayers.layers[level];
            }
            shadowCulling(camera, sceneData, layer);
            var dirShadowObjects = layer.shadowObjects;
            for (var i = 0; i < dirShadowObjects.length; i++) {
              var ro = dirShadowObjects[i];
              var model = ro.model;
              this.add(model, level);
            }
          }
          break;
        case LightType.SPOT:
          var spotLight = light;
          if (spotLight.shadowEnabled) {
            var visibility = spotLight.visibility;
            var castShadowObjects = sceneData.csmLayers.castShadowObjects;
            for (var _i = 0; _i < castShadowObjects.length; _i++) {
              var _ro = castShadowObjects[_i];
              var _model = _ro.model;
              if (_model.worldBounds) {
                if ((visibility & _model.node.layer) !== _model.node.layer || !intersect.aabbFrustum(_model.worldBounds, spotLight.frustum)) {
                  continue;
                }
              }
              this.add(_model, level);
            }
          }
          break;
      }
      this._instancedQueue.uploadBuffers(cmdBuff);
    }
  };
  _proto.clear = function clear() {
    this._subModelsArray.length = 0;
    this._shaderArray.length = 0;
    this._passArray.length = 0;
    this._instancedQueue.clear();
  };
  _proto.add = function add(model, level) {
    var subModels = model.subModels;
    for (var j = 0; j < subModels.length; j++) {
      var subModel = subModels[j];
      var shadowPassIdx = getShadowPassIndex(subModel);
      if (shadowPassIdx < 0) {
        continue;
      }
      var pass = subModel.passes[shadowPassIdx];
      var batchingScheme = pass.batchingScheme;
      if (batchingScheme === BatchingSchemes.INSTANCING) {
        var buffer = pass.getInstancedBuffer(level);
        buffer.merge(subModel, shadowPassIdx);
        this._instancedQueue.queue.add(buffer);
      } else {
        var shader = subModel.shaders[shadowPassIdx];
        this._subModelsArray.push(subModel);
        if (shader) this._shaderArray.push(shader);
        this._passArray.push(pass);
      }
    }
  };
  _proto.recordCommandBuffer = function recordCommandBuffer(device, renderPass, cmdBuff) {
    this._instancedQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    for (var i = 0; i < this._subModelsArray.length; ++i) {
      var subModel = this._subModelsArray[i];
      var shader = this._shaderArray[i];
      var pass = this._passArray[i];
      var ia = subModel.inputAssembler;
      var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, ia);
      var descriptorSet = pass.descriptorSet;
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, descriptorSet);
      cmdBuff.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet);
      cmdBuff.bindInputAssembler(ia);
      cmdBuff.draw(ia);
    }
  };
  return RenderShadowMapBatchedQueue;
}();

var _dec$a, _class$a, _ShadowStage;
var colors$5 = [new Color$1(1, 1, 1, 1)];
var ShadowStage = (_dec$a = ccclass('ShadowStage'), _dec$a(_class$a = (_ShadowStage = function (_RenderStage) {
  function ShadowStage() {
    var _this;
    _this = _RenderStage.call(this) || this;
    _this._additiveShadowQueue = void 0;
    _this._shadowFrameBuffer = null;
    _this._renderArea = new Rect();
    _this._light = null;
    _this._globalDS = null;
    _this._level = 0;
    _this._isShadowMapCleared = false;
    return _this;
  }
  _inheritsLoose(ShadowStage, _RenderStage);
  var _proto = ShadowStage.prototype;
  _proto.setUsage = function setUsage(globalDS, light, shadowFrameBuffer, level) {
    if (level === void 0) {
      level = 0;
    }
    this._globalDS = globalDS;
    this._light = light;
    this._shadowFrameBuffer = shadowFrameBuffer;
    this._level = level;
  };
  _proto.destroy = function destroy() {
    var _this$_additiveShadow;
    this._shadowFrameBuffer = null;
    this._globalDS = null;
    this._light = null;
    (_this$_additiveShadow = this._additiveShadowQueue) == null ? void 0 : _this$_additiveShadow.clear();
  };
  _proto.clearFramebuffer = function clearFramebuffer(camera) {
    if (!this._light || !this._shadowFrameBuffer || this._isShadowMapCleared) {
      return;
    }
    colors$5[0].w = camera.clearColor.w;
    var pipeline = this._pipeline;
    var pipelineSceneData = pipeline.pipelineSceneData;
    var shadingScale = pipelineSceneData.shadingScale;
    var shadowInfo = pipelineSceneData.shadows;
    var vp = camera.viewport;
    var shadowMapSize = shadowInfo.size;
    this._renderArea.x = vp.x * shadowMapSize.x;
    this._renderArea.y = vp.y * shadowMapSize.y;
    this._renderArea.width = vp.width * shadowMapSize.x * shadingScale;
    this._renderArea.height = vp.height * shadowMapSize.y * shadingScale;
    var cmdBuff = pipeline.commandBuffers[0];
    var renderPass = this._shadowFrameBuffer.renderPass;
    cmdBuff.beginRenderPass(renderPass, this._shadowFrameBuffer, this._renderArea, colors$5, camera.clearDepth, camera.clearStencil);
    cmdBuff.endRenderPass();
    this._isShadowMapCleared = true;
  };
  _proto.render = function render(camera) {
    var pipeline = this._pipeline;
    var pipelineSceneData = pipeline.pipelineSceneData;
    var shadowInfo = pipelineSceneData.shadows;
    var descriptorSet = this._globalDS;
    var cmdBuff = pipeline.commandBuffers[0];
    var level = this._level;
    var device = pipeline.device;
    if (!this._light || !this._shadowFrameBuffer) {
      return;
    }
    this._pipeline.pipelineUBO.updateShadowUBOLight(descriptorSet, this._light, level);
    this._additiveShadowQueue.gatherLightPasses(camera, this._light, cmdBuff, level);
    var shadowMapSize = shadowInfo.size;
    switch (this._light.type) {
      case LightType.DIRECTIONAL:
        {
          var mainLight = this._light;
          if (mainLight.shadowFixedArea || mainLight.csmLevel === CSMLevel.LEVEL_1 || !pipelineSceneData.csmSupported) {
            this._renderArea.x = 0;
            this._renderArea.y = 0;
            this._renderArea.width = shadowMapSize.x;
            this._renderArea.height = shadowMapSize.y;
          } else {
            var screenSpaceSignY = device.capabilities.screenSpaceSignY;
            this._renderArea.x = level % 2 * 0.5 * shadowMapSize.x;
            if (screenSpaceSignY > 0.0) {
              this._renderArea.y = (1 - Math.floor(level / 2)) * 0.5 * shadowMapSize.y;
            } else {
              this._renderArea.y = Math.floor(level / 2) * 0.5 * shadowMapSize.y;
            }
            this._renderArea.width = 0.5 * shadowMapSize.x;
            this._renderArea.height = 0.5 * shadowMapSize.y;
          }
          break;
        }
      case LightType.SPOT:
        {
          this._renderArea.x = 0;
          this._renderArea.y = 0;
          this._renderArea.width = shadowMapSize.x;
          this._renderArea.height = shadowMapSize.y;
          break;
        }
    }
    var renderPass = this._shadowFrameBuffer.renderPass;
    cmdBuff.beginRenderPass(renderPass, this._shadowFrameBuffer, this._renderArea, colors$5, camera.clearDepth, camera.clearStencil);
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, descriptorSet);
    this._additiveShadowQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    cmdBuff.endRenderPass();
    this._isShadowMapCleared = false;
  };
  _proto.activate = function activate(pipeline, flow) {
    _RenderStage.prototype.activate.call(this, pipeline, flow);
    this._additiveShadowQueue = new RenderShadowMapBatchedQueue(pipeline);
    this._isShadowMapCleared = false;
  };
  return ShadowStage;
}(RenderStage), _ShadowStage.initInfo = {
  name: 'ShadowStage',
  priority: ForwardStagePriority.FORWARD,
  tag: 0
}, _ShadowStage)) || _class$a);

var _dec$9, _class$9, _ShadowFlow;
var _validLights = [];
var ShadowFlow = (_dec$9 = ccclass('ShadowFlow'), _dec$9(_class$9 = (_ShadowFlow = function (_RenderFlow) {
  function ShadowFlow() {
    var _this;
    _this = _RenderFlow.call(this) || this;
    _this._shadowRenderPass = null;
    return _this;
  }
  _inheritsLoose(ShadowFlow, _RenderFlow);
  var _proto = ShadowFlow.prototype;
  _proto.initialize = function initialize(info) {
    _RenderFlow.prototype.initialize.call(this, info);
    if (this._stages.length === 0) {
      var shadowMapStage = new ShadowStage();
      shadowMapStage.initialize(ShadowStage.initInfo);
      this._stages.push(shadowMapStage);
    }
    return true;
  };
  _proto.activate = function activate(pipeline) {
    _RenderFlow.prototype.activate.call(this, pipeline);
    var isRGBE = supportsR32FloatTexture(pipeline.device) ? 0 : 1;
    pipeline.macros.CC_SHADOWMAP_FORMAT = isRGBE;
    var isLinear = pipeline.device.gfxAPI === API.WEBGL ? 1 : 0;
    pipeline.macros.CC_SHADOWMAP_USE_LINEAR_DEPTH = isLinear;
    pipeline.pipelineSceneData.csmSupported = pipeline.device.capabilities.maxFragmentUniformVectors >= (UBOGlobalEnum.COUNT + UBOCameraEnum.COUNT + UBOShadowEnum.COUNT + UBOCSMEnum.COUNT) / 4;
    pipeline.macros.CC_SUPPORT_CASCADED_SHADOW_MAP = pipeline.pipelineSceneData.csmSupported;
    pipeline.macros.CC_SHADOW_TYPE = 0;
    pipeline.macros.CC_DIR_SHADOW_PCF_TYPE = PCFType.HARD;
    pipeline.macros.CC_DIR_LIGHT_SHADOW_TYPE = 0;
    pipeline.macros.CC_CASCADED_LAYERS_TRANSITION = 0;
    pipeline.onGlobalPipelineStateChanged();
  };
  _proto.render = function render(camera) {
    var pipeline = this._pipeline;
    var shadowInfo = pipeline.pipelineSceneData.shadows;
    var csmLayers = pipeline.pipelineSceneData.csmLayers;
    var shadowFrameBufferMap = pipeline.pipelineSceneData.shadowFrameBufferMap;
    var castShadowObjects = csmLayers.castShadowObjects;
    var validPunctualLights = this._pipeline.pipelineSceneData.validPunctualLights;
    if (!shadowInfo.enabled || shadowInfo.type !== ShadowType.ShadowMap) {
      return;
    }
    var n = 0;
    var m = 0;
    for (; n < shadowInfo.maxReceived && m < validPunctualLights.length;) {
      var light = validPunctualLights[m];
      if (light.type === LightType.SPOT) {
        var spotLight = light;
        if (spotLight.shadowEnabled) {
          _validLights.push(light);
          n++;
        }
      }
      m++;
    }
    if (castShadowObjects.length === 0) {
      this.clearShadowMap(_validLights, camera);
      return;
    }
    if (shadowInfo.shadowMapDirty) {
      this.resizeShadowMap();
    }
    var _ref = camera.scene,
      mainLight = _ref.mainLight;
    if (mainLight && mainLight.shadowEnabled) {
      var globalDS = pipeline.descriptorSet;
      if (!shadowFrameBufferMap.has(mainLight)) {
        this._initShadowFrameBuffer(pipeline, mainLight, camera.window.swapchain);
      }
      var shadowFrameBuffer = shadowFrameBufferMap.get(mainLight);
      if (mainLight.shadowFixedArea) {
        this._renderStage(camera, mainLight, shadowFrameBuffer, globalDS);
      } else {
        var csmLevel = pipeline.pipelineSceneData.csmSupported ? mainLight.csmLevel : 1;
        for (var i = 0; i < csmLevel; i++) {
          this._renderStage(camera, mainLight, shadowFrameBuffer, globalDS, i);
        }
      }
    }
    for (var l = 0; l < _validLights.length; l++) {
      var _light = _validLights[l];
      var ds = pipeline.globalDSManager.getOrCreateDescriptorSet(_light);
      if (!shadowFrameBufferMap.has(_light)) {
        this._initShadowFrameBuffer(pipeline, _light, camera.window.swapchain);
      }
      var _shadowFrameBuffer = shadowFrameBufferMap.get(_light);
      this._renderStage(camera, _light, _shadowFrameBuffer, ds);
    }
    _validLights.length = 0;
  };
  _proto.destroy = function destroy() {
    _RenderFlow.prototype.destroy.call(this);
    if (this._pipeline) {
      var shadowFrameBufferMap = this._pipeline.pipelineSceneData.shadowFrameBufferMap;
      var shadowFrameBuffers = Array.from(shadowFrameBufferMap.values());
      for (var i = 0; i < shadowFrameBuffers.length; i++) {
        var frameBuffer = shadowFrameBuffers[i];
        if (!frameBuffer) {
          continue;
        }
        var renderTargets = frameBuffer.colorTextures;
        for (var j = 0; j < renderTargets.length; j++) {
          var renderTarget = renderTargets[j];
          if (renderTarget) {
            renderTarget.destroy();
          }
        }
        renderTargets.length = 0;
        var depth = frameBuffer.depthStencilTexture;
        if (depth) {
          depth.destroy();
        }
        frameBuffer.destroy();
      }
      shadowFrameBufferMap.clear();
    }
    if (this._shadowRenderPass) {
      this._shadowRenderPass.destroy();
    }
  };
  _proto._initShadowFrameBuffer = function _initShadowFrameBuffer(pipeline, light, swapchain) {
    var device = pipeline.device;
    var shadows = pipeline.pipelineSceneData.shadows;
    var shadowMapSize = shadows.size;
    var shadowFrameBufferMap = pipeline.pipelineSceneData.shadowFrameBufferMap;
    var format = supportsR32FloatTexture(device) ? Format.R32F : Format.RGBA8;
    if (!this._shadowRenderPass) {
      var colorAttachment = new ColorAttachment();
      colorAttachment.format = format;
      colorAttachment.loadOp = LoadOp.CLEAR;
      colorAttachment.storeOp = StoreOp.STORE;
      colorAttachment.sampleCount = 1;
      var depthStencilAttachment = new DepthStencilAttachment();
      depthStencilAttachment.format = Format.DEPTH_STENCIL;
      depthStencilAttachment.depthLoadOp = LoadOp.CLEAR;
      depthStencilAttachment.depthStoreOp = StoreOp.DISCARD;
      depthStencilAttachment.stencilLoadOp = LoadOp.CLEAR;
      depthStencilAttachment.stencilStoreOp = StoreOp.DISCARD;
      depthStencilAttachment.sampleCount = 1;
      var renderPassInfo = new RenderPassInfo([colorAttachment], depthStencilAttachment);
      this._shadowRenderPass = device.createRenderPass(renderPassInfo);
    }
    var shadowRenderTargets = [];
    shadowRenderTargets.push(device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED, format, shadowMapSize.x, shadowMapSize.y)));
    var depth = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.DEPTH_STENCIL_ATTACHMENT, Format.DEPTH_STENCIL, shadowMapSize.x, shadowMapSize.y));
    var shadowFrameBuffer = device.createFramebuffer(new FramebufferInfo(this._shadowRenderPass, shadowRenderTargets, depth));
    shadowFrameBufferMap.set(light, shadowFrameBuffer);
  };
  _proto._renderStage = function _renderStage(camera, light, shadowFrameBuffer, globalDS, level) {
    if (level === void 0) {
      level = 0;
    }
    for (var i = 0; i < this._stages.length; i++) {
      var shadowStage = this._stages[i];
      shadowStage.setUsage(globalDS, light, shadowFrameBuffer, level);
      shadowStage.render(camera);
    }
  };
  _proto.clearShadowMap = function clearShadowMap(validLights, camera) {
    var pipeline = this._pipeline;
    var scene = pipeline.pipelineSceneData;
    var _ref2 = camera.scene,
      mainLight = _ref2.mainLight;
    if (mainLight) {
      var globalDS = this._pipeline.descriptorSet;
      if (!scene.shadowFrameBufferMap.has(mainLight)) {
        this._initShadowFrameBuffer(this._pipeline, mainLight, camera.window.swapchain);
      }
      var shadowFrameBuffer = scene.shadowFrameBufferMap.get(mainLight);
      for (var i = 0; i < this._stages.length; i++) {
        var shadowStage = this._stages[i];
        shadowStage.setUsage(globalDS, mainLight, shadowFrameBuffer);
        shadowStage.clearFramebuffer(camera);
      }
    }
    for (var l = 0; l < validLights.length; l++) {
      var light = validLights[l];
      var ds = pipeline.globalDSManager.getOrCreateDescriptorSet(light);
      if (!scene.shadowFrameBufferMap.has(light)) {
        this._initShadowFrameBuffer(this._pipeline, light, camera.window.swapchain);
      }
      var _shadowFrameBuffer2 = scene.shadowFrameBufferMap.get(light);
      for (var _i = 0; _i < this._stages.length; _i++) {
        var _shadowStage = this._stages[_i];
        _shadowStage.setUsage(ds, light, _shadowFrameBuffer2);
        _shadowStage.clearFramebuffer(camera);
      }
    }
  };
  _proto.resizeShadowMap = function resizeShadowMap() {
    var shadows = this._pipeline.pipelineSceneData.shadows;
    var shadowMapSize = shadows.size;
    var pipeline = this._pipeline;
    var device = pipeline.device;
    var shadowFrameBufferMap = pipeline.pipelineSceneData.shadowFrameBufferMap;
    var format = supportsR32FloatTexture(device) ? Format.R32F : Format.RGBA8;
    for (var _iterator = _createForOfIteratorHelperLoose(shadowFrameBufferMap.keys()), _step; !(_step = _iterator()).done;) {
      var key = _step.value;
      var frameBuffer = shadowFrameBufferMap.get(key);
      if (!frameBuffer) {
        continue;
      }
      var renderTargets = [];
      renderTargets.push(pipeline.device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED, format, shadowMapSize.x, shadowMapSize.y)));
      var depth = frameBuffer.depthStencilTexture;
      if (depth) {
        depth.resize(shadowMapSize.x, shadowMapSize.y);
      }
      var shadowRenderPass = frameBuffer.renderPass;
      frameBuffer.destroy();
      var newFrameBuffer = device.createFramebuffer(new FramebufferInfo(shadowRenderPass, renderTargets, depth));
      shadowFrameBufferMap.set(key, newFrameBuffer);
    }
    shadows.shadowMapDirty = false;
  };
  return ShadowFlow;
}(RenderFlow), _ShadowFlow.initInfo = {
  name: PIPELINE_FLOW_SHADOW,
  priority: ForwardFlowPriority.SHADOW,
  tag: RenderFlowTag.SCENE,
  stages: []
}, _ShadowFlow)) || _class$9);

var CC_USE_RGBE_OUTPUT = 'CC_USE_RGBE_OUTPUT';
var _phaseID = getPhaseID('default');
var _phaseReflectMapID = getPhaseID('reflect-map');
function getPassIndex(subModel) {
  var passes = subModel.passes;
  var r = cclegacy.rendering;
  if (isEnableEffect()) _phaseID = r.getPhaseID(r.getPassID('default'), 'default');
  for (var k = 0; k < passes.length; k++) {
    if ((!r || !r.enableEffectImport) && passes[k].phase === _phaseID || isEnableEffect() && passes[k].phaseID === _phaseID) {
      return k;
    }
  }
  return -1;
}
function getReflectMapPassIndex(subModel) {
  var passes = subModel.passes;
  var r = cclegacy.rendering;
  if (isEnableEffect()) _phaseReflectMapID = r.getPhaseID(r.getPassID('default'), 'reflect-map');
  for (var k = 0; k < passes.length; k++) {
    if ((!r || !r.enableEffectImport) && passes[k].phase === _phaseReflectMapID || isEnableEffect() && passes[k].phaseID === _phaseReflectMapID) {
      return k;
    }
  }
  return -1;
}
var RenderReflectionProbeQueue = function () {
  function RenderReflectionProbeQueue(pipeline) {
    this._subModelsArray = [];
    this._passArray = [];
    this._shaderArray = [];
    this._rgbeSubModelsArray = [];
    this._instancedQueue = new RenderInstancedQueue();
    this._patches = [];
    this._pipeline = pipeline;
  }
  var _proto = RenderReflectionProbeQueue.prototype;
  _proto.gatherRenderObjects = function gatherRenderObjects(probe, camera, cmdBuff) {
    this.clear();
    var scene = camera.scene;
    var sceneData = this._pipeline.pipelineSceneData;
    var skybox = sceneData.skybox;
    if (skybox.enabled && skybox.model && probe.camera.clearFlag & SkyBoxFlagValue.VALUE) {
      this.add(skybox.model);
    }
    var models = scene.models;
    var visibility = probe.visibility;
    for (var i = 0; i < models.length; i++) {
      var model = models[i];
      if (!model.node || scene.isCulledByLod(camera, model)) {
        continue;
      }
      if ((visibility & model.node.layer) !== model.node.layer && !(visibility & model.visFlags)) {
        continue;
      }
      if (model.enabled && model.worldBounds && model.bakeToReflectionProbe) {
        if (probe.probeType === ProbeType.CUBE) {
          if (intersect.aabbWithAABB(model.worldBounds, probe.boundingBox)) {
            this.add(model);
          }
        } else if (intersect.aabbFrustum(model.worldBounds, probe.camera.frustum)) {
          this.add(model);
        }
      }
    }
    this._instancedQueue.uploadBuffers(cmdBuff);
  };
  _proto.clear = function clear() {
    this._subModelsArray.length = 0;
    this._shaderArray.length = 0;
    this._passArray.length = 0;
    this._instancedQueue.clear();
    this._rgbeSubModelsArray.length = 0;
  };
  _proto.add = function add(model) {
    var subModels = model.subModels;
    for (var j = 0; j < subModels.length; j++) {
      var subModel = subModels[j];
      var isTransparent = subModel.passes[0].blendState.targets[0].blend;
      if (isTransparent) {
        continue;
      }
      var passIdx = getReflectMapPassIndex(subModel);
      var bUseReflectPass = true;
      if (passIdx < 0) {
        passIdx = getPassIndex(subModel);
        bUseReflectPass = false;
      }
      if (passIdx < 0) {
        continue;
      }
      var pass = subModel.passes[passIdx];
      var batchingScheme = pass.batchingScheme;
      if (!bUseReflectPass) {
        this._patches = [];
        this._patches = this._patches.concat(subModel.patches);
        var useRGBEPatchs = [{
          name: CC_USE_RGBE_OUTPUT,
          value: true
        }];
        this._patches = this._patches.concat(useRGBEPatchs);
        subModel.onMacroPatchesStateChanged(this._patches);
        this._rgbeSubModelsArray.push(subModel);
      }
      if (batchingScheme === BatchingSchemes.INSTANCING) {
        var buffer = pass.getInstancedBuffer();
        buffer.merge(subModel, passIdx);
        this._instancedQueue.queue.add(buffer);
      } else {
        var shader = subModel.shaders[passIdx];
        this._subModelsArray.push(subModel);
        if (shader) this._shaderArray.push(shader);
        this._passArray.push(pass);
      }
    }
  };
  _proto.recordCommandBuffer = function recordCommandBuffer(device, renderPass, cmdBuff) {
    this._instancedQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    for (var i = 0; i < this._subModelsArray.length; ++i) {
      var subModel = this._subModelsArray[i];
      var shader = this._shaderArray[i];
      var pass = this._passArray[i];
      var ia = subModel.inputAssembler;
      var pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, ia);
      var descriptorSet = pass.descriptorSet;
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, descriptorSet);
      cmdBuff.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet);
      cmdBuff.bindInputAssembler(ia);
      cmdBuff.draw(ia);
    }
    this.resetRGBEMacro();
    this._instancedQueue.clear();
  };
  _proto.resetRGBEMacro = function resetRGBEMacro() {
    for (var i = 0; i < this._rgbeSubModelsArray.length; i++) {
      this._patches = [];
      var subModel = this._rgbeSubModelsArray[i];
      this._patches = this._patches.concat(subModel.patches);
      if (!this._patches) continue;
      for (var j = 0; j < this._patches.length; j++) {
        var patch = this._patches[j];
        if (patch.name === CC_USE_RGBE_OUTPUT) {
          this._patches.splice(j, 1);
          break;
        }
      }
      subModel.onMacroPatchesStateChanged(this._patches);
    }
  };
  return RenderReflectionProbeQueue;
}();

var _dec$8, _class$8, _ReflectionProbeStage;
var colors$4 = [new Color$1(1, 1, 1, 1)];
var ReflectionProbeStage = (_dec$8 = ccclass('ReflectionProbeStage'), _dec$8(_class$8 = (_ReflectionProbeStage = function (_RenderStage) {
  function ReflectionProbeStage() {
    var _this;
    _this = _RenderStage.call(this) || this;
    _this._frameBuffer = null;
    _this._renderArea = new Rect();
    _this._probe = null;
    _this._probeRenderQueue = void 0;
    _this._rgbeColor = new Vec3();
    return _this;
  }
  _inheritsLoose(ReflectionProbeStage, _RenderStage);
  var _proto = ReflectionProbeStage.prototype;
  _proto.setUsageInfo = function setUsageInfo(probe, frameBuffer) {
    this._probe = probe;
    this._frameBuffer = frameBuffer;
  };
  _proto.destroy = function destroy() {
    var _this$_probeRenderQue;
    this._frameBuffer = null;
    (_this$_probeRenderQue = this._probeRenderQueue) == null ? void 0 : _this$_probeRenderQue.clear();
  };
  _proto.clearFramebuffer = function clearFramebuffer(camera) {
    if (!this._frameBuffer) {
      return;
    }
    colors$4[0].w = camera.clearColor.w;
    var pipeline = this._pipeline;
    var pipelineSceneData = pipeline.pipelineSceneData;
    var shadingScale = pipelineSceneData.shadingScale;
    var vp = camera.viewport;
    var size = this._probe.resolution;
    this._renderArea.x = vp.x * size;
    this._renderArea.y = vp.y * size;
    this._renderArea.width = vp.width * size * shadingScale;
    this._renderArea.height = vp.height * size * shadingScale;
    var cmdBuff = pipeline.commandBuffers[0];
    var renderPass = this._frameBuffer.renderPass;
    cmdBuff.beginRenderPass(renderPass, this._frameBuffer, this._renderArea, colors$4, camera.clearDepth, camera.clearStencil);
    cmdBuff.endRenderPass();
  };
  _proto.render = function render(camera) {
    var pipeline = this._pipeline;
    var cmdBuff = pipeline.commandBuffers[0];
    this._probeRenderQueue.gatherRenderObjects(this._probe, camera, cmdBuff);
    pipeline.pipelineUBO.updateCameraUBO(this._probe.camera);
    this._renderArea.x = 0;
    this._renderArea.y = 0;
    this._renderArea.width = this._probe.renderArea().x;
    this._renderArea.height = this._probe.renderArea().y;
    var renderPass = this._frameBuffer.renderPass;
    if (this._probe.camera.clearFlag & ClearFlagBit.COLOR) {
      this._rgbeColor.x = this._probe.camera.clearColor.x;
      this._rgbeColor.y = this._probe.camera.clearColor.y;
      this._rgbeColor.z = this._probe.camera.clearColor.z;
      var rgbe = packRGBE(this._rgbeColor);
      colors$4[0].x = rgbe.x;
      colors$4[0].y = rgbe.y;
      colors$4[0].z = rgbe.z;
      colors$4[0].w = rgbe.w;
    }
    var device = pipeline.device;
    cmdBuff.beginRenderPass(renderPass, this._frameBuffer, this._renderArea, colors$4, this._probe.camera.clearDepth, this._probe.camera.clearStencil);
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);
    this._probeRenderQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    cmdBuff.endRenderPass();
    pipeline.pipelineUBO.updateCameraUBO(camera);
  };
  _proto.activate = function activate(pipeline, flow) {
    _RenderStage.prototype.activate.call(this, pipeline, flow);
    this._probeRenderQueue = new RenderReflectionProbeQueue(pipeline);
  };
  return ReflectionProbeStage;
}(RenderStage), _ReflectionProbeStage.initInfo = {
  name: 'ReflectionProbeStage',
  priority: ForwardStagePriority.FORWARD,
  tag: 0
}, _ReflectionProbeStage)) || _class$8);

var _dec$7, _class$7, _ReflectionProbeFlow;
var ReflectionProbeFlow = (_dec$7 = ccclass('ReflectionProbeFlow'), _dec$7(_class$7 = (_ReflectionProbeFlow = function (_RenderFlow) {
  function ReflectionProbeFlow() {
    return _RenderFlow.apply(this, arguments) || this;
  }
  _inheritsLoose(ReflectionProbeFlow, _RenderFlow);
  var _proto = ReflectionProbeFlow.prototype;
  _proto.initialize = function initialize(info) {
    _RenderFlow.prototype.initialize.call(this, info);
    if (this._stages.length === 0) {
      var probeStage = new ReflectionProbeStage();
      probeStage.initialize(ReflectionProbeStage.initInfo);
      this._stages.push(probeStage);
    }
    return true;
  };
  _proto.activate = function activate(pipeline) {
    _RenderFlow.prototype.activate.call(this, pipeline);
  };
  _proto.render = function render(camera) {
    if (!cclegacy.internal.reflectionProbeManager) {
      return;
    }
    var probes = cclegacy.internal.reflectionProbeManager.getProbes();
    for (var i = 0; i < probes.length; i++) {
      if (probes[i].needRender) {
        if (probes[i].probeType === ProbeType.PLANAR) {
          this._renderStage(camera, probes[i]);
        }
      }
    }
  };
  _proto.destroy = function destroy() {
    _RenderFlow.prototype.destroy.call(this);
  };
  _proto._renderStage = function _renderStage(camera, probe) {
    for (var i = 0; i < this._stages.length; i++) {
      var probeStage = this._stages[i];
      if (probe.probeType === ProbeType.PLANAR) {
        cclegacy.internal.reflectionProbeManager.updatePlanarMap(probe, null);
        probeStage.setUsageInfo(probe, probe.realtimePlanarTexture.window.framebuffer);
        probeStage.render(camera);
        cclegacy.internal.reflectionProbeManager.updatePlanarMap(probe, probe.realtimePlanarTexture.getGFXTexture());
      } else {
        for (var faceIdx = 0; faceIdx < 6; faceIdx++) {
          var renderTexture = probe.bakedCubeTextures[faceIdx];
          if (!renderTexture) return;
          probe.updateCameraDir(faceIdx);
          probeStage.setUsageInfo(probe, renderTexture.window.framebuffer);
          probeStage.render(camera);
        }
        probe.needRender = false;
      }
    }
  };
  return ReflectionProbeFlow;
}(RenderFlow), _ReflectionProbeFlow.initInfo = {
  name: 'PIPELINE_FLOW_RELECTION_PROBE',
  priority: 0,
  tag: RenderFlowTag.SCENE,
  stages: []
}, _ReflectionProbeFlow)) || _class$7);

var _dec$6, _dec2$5, _class$6, _class2$5, _initializer$5;
var PIPELINE_TYPE$1 = 0;
function createDefaultPipeline() {
  var rppl = new ForwardPipeline();
  rppl.initialize({
    flows: []
  });
  return rppl;
}
var ForwardPipeline = (_dec$6 = ccclass('ForwardPipeline'), _dec2$5 = type([RenderTextureConfig]), _dec$6(_class$6 = (_class2$5 = function (_RenderPipeline) {
  function ForwardPipeline() {
    var _this;
    _this = _RenderPipeline.call(this) || this;
    _this.renderTextures = _initializer$5 && _initializer$5();
    _this._postRenderPass = null;
    return _this;
  }
  _inheritsLoose(ForwardPipeline, _RenderPipeline);
  var _proto = ForwardPipeline.prototype;
  _proto.initialize = function initialize(info) {
    _RenderPipeline.prototype.initialize.call(this, info);
    if (this._flows.length === 0) {
      var shadowFlow = new ShadowFlow();
      shadowFlow.initialize(ShadowFlow.initInfo);
      this._flows.push(shadowFlow);
      var reflectionFlow = new ReflectionProbeFlow();
      reflectionFlow.initialize(ReflectionProbeFlow.initInfo);
      this._flows.push(reflectionFlow);
      var forwardFlow = new ForwardFlow();
      forwardFlow.initialize(ForwardFlow.initInfo);
      this._flows.push(forwardFlow);
    }
    return true;
  };
  _proto.activate = function activate(swapchain) {
    this._macros = {
      CC_PIPELINE_TYPE: PIPELINE_TYPE$1
    };
    this._pipelineSceneData = new PipelineSceneData();
    if (!_RenderPipeline.prototype.activate.call(this, swapchain)) {
      return false;
    }
    if (!this._activeRenderer(swapchain)) {
      errorID(2402);
      return false;
    }
    return true;
  };
  _proto._ensureEnoughSize = function _ensureEnoughSize(cameras) {
    var newWidth = this._width;
    var newHeight = this._height;
    for (var i = 0; i < cameras.length; ++i) {
      var window = cameras[i].window;
      newWidth = Math.max(window.width, newWidth);
      newHeight = Math.max(window.height, newHeight);
    }
    if (newWidth !== this._width || newHeight !== this._height) {
      this._width = newWidth;
      this._height = newHeight;
    }
  };
  _proto.destroy = function destroy() {
    this._destroyUBOs();
    this._destroyQuadInputAssembler();
    var rpIter = this._renderPasses.values();
    var rpRes = rpIter.next();
    while (!rpRes.done) {
      rpRes.value.destroy();
      rpRes = rpIter.next();
    }
    this._commandBuffers.length = 0;
    return _RenderPipeline.prototype.destroy.call(this);
  };
  _proto._activeRenderer = function _activeRenderer(swapchain) {
    var device = this.device;
    this._commandBuffers.push(device.commandBuffer);
    var descriptorSet = this._descriptorSet;
    var shadowMapSampler = this.globalDSManager.pointSampler;
    descriptorSet.bindSampler(UNIFORM_SHADOWMAP_BINDING, shadowMapSampler);
    descriptorSet.bindTexture(UNIFORM_SHADOWMAP_BINDING, getDefaultShadowTexture(this.device));
    descriptorSet.bindSampler(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, shadowMapSampler);
    descriptorSet.bindTexture(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, getDefaultShadowTexture(this.device));
    descriptorSet.update();
    return true;
  };
  _proto._destroyUBOs = function _destroyUBOs() {
    var descriptorSet = this._descriptorSet;
    if (descriptorSet) {
      descriptorSet.getBuffer(UBOGlobal.BINDING).destroy();
      descriptorSet.getBuffer(UBOShadow.BINDING).destroy();
      descriptorSet.getBuffer(UBOCamera.BINDING).destroy();
      descriptorSet.getTexture(UNIFORM_SHADOWMAP_BINDING).destroy();
      descriptorSet.getTexture(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING).destroy();
    }
  };
  return _createClass(ForwardPipeline, [{
    key: "postRenderPass",
    get: function get() {
      return this._postRenderPass;
    }
  }]);
}(RenderPipeline), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "renderTextures", [_dec2$5, serializable], function () {
  return [];
}), _class2$5)) || _class$6);

var _dec$5, _dec2$4, _class$5, _class2$4, _initializer$4, _GbufferStage;
var colors$3 = [new Color$1(0, 0, 0, 0), new Color$1(0, 0, 0, 0), new Color$1(0, 0, 0, 0)];
var GbufferStage = (_dec$5 = ccclass('GbufferStage'), _dec2$4 = type([RenderQueueDesc]), _dec$5(_class$5 = (_class2$4 = (_GbufferStage = function (_RenderStage) {
  function GbufferStage() {
    var _this;
    _this = _RenderStage.call(this) || this;
    _this.renderQueues = _initializer$4 && _initializer$4();
    _this._renderQueues = [];
    _this._renderArea = new Rect();
    _this._instancedQueue = new RenderInstancedQueue();
    _this._phaseID = getPhaseID('default');
    return _this;
  }
  _inheritsLoose(GbufferStage, _RenderStage);
  var _proto = GbufferStage.prototype;
  _proto.initialize = function initialize(info) {
    _RenderStage.prototype.initialize.call(this, info);
    if (info.renderQueues) {
      this.renderQueues = info.renderQueues;
    }
    return true;
  };
  _proto.activate = function activate(pipeline, flow) {
    _RenderStage.prototype.activate.call(this, pipeline, flow);
    for (var i = 0; i < this.renderQueues.length; i++) {
      this._renderQueues[i] = convertRenderQueue(this.renderQueues[i]);
    }
  };
  _proto.destroy = function destroy() {};
  _proto.render = function render(camera) {
    this._instancedQueue.clear();
    var pipeline = this._pipeline;
    var device = pipeline.device;
    this._renderQueues.forEach(renderQueueClearFunc);
    pipeline.generateRenderArea(camera, this._renderArea);
    pipeline.updateQuadVertexData(this._renderArea, camera.window);
    var renderObjects = pipeline.pipelineSceneData.renderObjects;
    var m = 0;
    var p = 0;
    var k = 0;
    for (var i = 0; i < renderObjects.length; ++i) {
      var ro = renderObjects[i];
      var subModels = ro.model.subModels;
      for (m = 0; m < subModels.length; ++m) {
        var subModel = subModels[m];
        var passes = subModel.passes;
        for (p = 0; p < passes.length; ++p) {
          var pass = passes[p];
          if (pass.phase !== this._phaseID) continue;
          var batchingScheme = pass.batchingScheme;
          if (batchingScheme === BatchingSchemes.INSTANCING) {
            var instancedBuffer = pass.getInstancedBuffer();
            instancedBuffer.merge(subModel, p);
            this._instancedQueue.queue.add(instancedBuffer);
          } else {
            for (k = 0; k < this._renderQueues.length; k++) {
              this._renderQueues[k].insertRenderPass(ro, m, p);
            }
          }
        }
      }
    }
    this._renderQueues.forEach(renderQueueSortFunc);
    var cmdBuff = pipeline.commandBuffers[0];
    this._instancedQueue.uploadBuffers(cmdBuff);
    if (camera.clearFlag & ClearFlagBit.COLOR) {
      if (pipeline.pipelineSceneData.isHDR) {
        SRGBToLinear(colors$3[0], camera.clearColor);
      } else {
        colors$3[0].x = camera.clearColor.x;
        colors$3[0].y = camera.clearColor.y;
        colors$3[0].z = camera.clearColor.z;
      }
    }
    colors$3[0].w = camera.clearColor.w;
    var deferredData = pipeline.getPipelineRenderData();
    var framebuffer = deferredData.gbufferFrameBuffer;
    var renderPass = framebuffer.renderPass;
    cmdBuff.beginRenderPass(renderPass, framebuffer, this._renderArea, colors$3, camera.clearDepth, camera.clearStencil);
    cmdBuff.setScissor(pipeline.generateScissor(camera));
    cmdBuff.setViewport(pipeline.generateViewport(camera));
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);
    for (var _i = 0; _i < this.renderQueues.length; _i++) {
      this._renderQueues[_i].recordCommandBuffer(device, renderPass, cmdBuff);
    }
    this._instancedQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    cmdBuff.endRenderPass();
  };
  return GbufferStage;
}(RenderStage), _GbufferStage.initInfo = {
  name: 'GbufferStage',
  priority: DeferredStagePriority.GBUFFER,
  tag: 0,
  renderQueues: [{
    isTransparent: false,
    sortMode: RenderQueueSortMode.FRONT_TO_BACK,
    stages: ['default']
  }, {
    isTransparent: true,
    sortMode: RenderQueueSortMode.BACK_TO_FRONT,
    stages: ['default']
  }]
}, _GbufferStage), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "renderQueues", [_dec2$4, serializable], function () {
  return [];
}), _class2$4)) || _class$5);

var _dec$4, _dec2$3, _dec3$1, _class$4, _class2$3, _initializer$3, _initializer2$1, _LightingStage;
var _v3 = new Vec3();
var _rangedDirLightBoundingBox = new AABB(0.0, 0.0, 0.0, 0.5, 0.5, 0.5);
var _tmpBoundingBox = new AABB();
var colors$2 = [new Color$1(0, 0, 0, 1)];
var LightingStage = (_dec$4 = ccclass('LightingStage'), _dec2$3 = type(Material), _dec3$1 = type([RenderQueueDesc]), _dec$4(_class$4 = (_class2$3 = (_LightingStage = function (_RenderStage) {
  function LightingStage() {
    var _this;
    _this = _RenderStage.call(this) || this;
    _this._deferredLitsBufs = null;
    _this._maxDeferredLights = UBODeferredLight.LIGHTS_PER_PASS;
    _this._lightBufferData = null;
    _this._lightMeterScale = 10000.0;
    _this._descriptorSet = null;
    _this._renderArea = new Rect();
    _this._planarQueue = null;
    _this._uiPhase = new UIPhase();
    _this._deferredMaterial = _initializer$3 && _initializer$3();
    _this.renderQueues = _initializer2$1 && _initializer2$1();
    _this._phaseID = getPhaseID('default');
    _this._renderQueues = [];
    return _this;
  }
  _inheritsLoose(LightingStage, _RenderStage);
  var _proto = LightingStage.prototype;
  _proto.initialize = function initialize(info) {
    _RenderStage.prototype.initialize.call(this, info);
    return true;
  };
  _proto.gatherLights = function gatherLights(camera) {
    var pipeline = this._pipeline;
    var isHDR = pipeline.pipelineSceneData.isHDR;
    var cmdBuff = pipeline.commandBuffers[0];
    var sphereLights = camera.scene.sphereLights;
    var spotLights = camera.scene.spotLights;
    var pointLights = camera.scene.pointLights;
    var rangedDirLights = camera.scene.rangedDirLights;
    var _sphere = Sphere.create(0, 0, 0, 1);
    var _vec4Array = new Float32Array(4);
    var exposure = camera.exposure;
    var idx = 0;
    var elementLen = Vec4.length;
    var fieldLen = elementLen * this._maxDeferredLights;
    for (var i = 0; i < sphereLights.length && idx < this._maxDeferredLights; i++, ++idx) {
      var light = sphereLights[i];
      Sphere.set(_sphere, light.position.x, light.position.y, light.position.z, light.range);
      if (intersect.sphereFrustum(_sphere, camera.frustum)) {
        Vec3.toArray(_vec4Array, light.position);
        _vec4Array[3] = LightType.SPHERE;
        this._lightBufferData.set(_vec4Array, idx * elementLen);
        Vec3.toArray(_vec4Array, light.color);
        if (light.useColorTemperature) {
          var finalColor = light.finalColor;
          _vec4Array[0] = finalColor.x;
          _vec4Array[1] = finalColor.y;
          _vec4Array[2] = finalColor.z;
        }
        if (isHDR) {
          _vec4Array[3] = light.luminance * exposure * this._lightMeterScale;
        } else {
          _vec4Array[3] = light.luminance;
        }
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 1);
        _vec4Array[0] = light.size;
        _vec4Array[1] = light.range;
        _vec4Array[2] = 0.0;
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 2);
      }
    }
    for (var _i = 0; _i < spotLights.length && idx < this._maxDeferredLights; _i++, ++idx) {
      var _light = spotLights[_i];
      Sphere.set(_sphere, _light.position.x, _light.position.y, _light.position.z, _light.range);
      if (intersect.sphereFrustum(_sphere, camera.frustum)) {
        Vec3.toArray(_vec4Array, _light.position);
        _vec4Array[3] = LightType.SPOT;
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 0);
        Vec3.toArray(_vec4Array, _light.color);
        if (_light.useColorTemperature) {
          var _finalColor = _light.finalColor;
          _vec4Array[0] = _finalColor.x;
          _vec4Array[1] = _finalColor.y;
          _vec4Array[2] = _finalColor.z;
        }
        if (isHDR) {
          _vec4Array[3] = _light.luminance * exposure * this._lightMeterScale;
        } else {
          _vec4Array[3] = _light.luminance;
        }
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 1);
        _vec4Array[0] = _light.size;
        _vec4Array[1] = _light.range;
        _vec4Array[2] = _light.spotAngle;
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 2);
        Vec3.toArray(_vec4Array, _light.direction);
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 3);
      }
    }
    for (var _i2 = 0; _i2 < pointLights.length && idx < this._maxDeferredLights; _i2++, ++idx) {
      var _light2 = pointLights[_i2];
      Sphere.set(_sphere, _light2.position.x, _light2.position.y, _light2.position.z, _light2.range);
      if (intersect.sphereFrustum(_sphere, camera.frustum)) {
        Vec3.toArray(_vec4Array, _light2.position);
        _vec4Array[3] = LightType.POINT;
        this._lightBufferData.set(_vec4Array, idx * elementLen);
        Vec3.toArray(_vec4Array, _light2.color);
        if (_light2.useColorTemperature) {
          var _finalColor2 = _light2.finalColor;
          _vec4Array[0] = _finalColor2.x;
          _vec4Array[1] = _finalColor2.y;
          _vec4Array[2] = _finalColor2.z;
        }
        if (isHDR) {
          _vec4Array[3] = _light2.luminance * exposure * this._lightMeterScale;
        } else {
          _vec4Array[3] = _light2.luminance;
        }
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 1);
        _vec4Array[0] = 0.0;
        _vec4Array[1] = _light2.range;
        _vec4Array[2] = 0.0;
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 2);
      }
    }
    for (var _i3 = 0; _i3 < rangedDirLights.length && idx < this._maxDeferredLights; _i3++, ++idx) {
      var _light3 = rangedDirLights[_i3];
      AABB.transform(_tmpBoundingBox, _rangedDirLightBoundingBox, _light3.node.getWorldMatrix());
      if (intersect.aabbFrustum(_tmpBoundingBox, camera.frustum)) {
        Vec3.toArray(_vec4Array, _light3.position);
        _vec4Array[3] = LightType.RANGED_DIRECTIONAL;
        this._lightBufferData.set(_vec4Array, idx * elementLen);
        Vec3.toArray(_vec4Array, _light3.color);
        if (_light3.useColorTemperature) {
          var _finalColor3 = _light3.finalColor;
          _vec4Array[0] = _finalColor3.x;
          _vec4Array[1] = _finalColor3.y;
          _vec4Array[2] = _finalColor3.z;
        }
        if (isHDR) {
          _vec4Array[3] = _light3.illuminance * exposure;
        } else {
          _vec4Array[3] = _light3.illuminance;
        }
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 1);
        Vec3.toArray(_vec4Array, _light3.right);
        _vec4Array[3] = 0;
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 2);
        Vec3.toArray(_vec4Array, _light3.direction);
        _vec4Array[3] = 0;
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 3);
        var scale = _light3.scale;
        _v3.set(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5);
        Vec3.toArray(_vec4Array, _v3);
        _vec4Array[3] = 0;
        this._lightBufferData.set(_vec4Array, idx * elementLen + fieldLen * 4);
      }
    }
    var offset = fieldLen * 3 + 3;
    this._lightBufferData.set([idx], offset);
    cmdBuff.updateBuffer(this._deferredLitsBufs, this._lightBufferData);
  };
  _proto._createStageDescriptor = function _createStageDescriptor(pass) {
    var device = this._pipeline.device;
    var totalSize = Float32Array.BYTES_PER_ELEMENT * 4 * 4 * this._maxDeferredLights;
    totalSize = Math.ceil(totalSize / device.capabilities.uboOffsetAlignment) * device.capabilities.uboOffsetAlignment;
    this._deferredLitsBufs = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, totalSize, device.capabilities.uboOffsetAlignment));
    var deferredLitsBufView = device.createBuffer(new BufferViewInfo(this._deferredLitsBufs, 0, totalSize));
    this._lightBufferData = new Float32Array(totalSize / Float32Array.BYTES_PER_ELEMENT);
    this._descriptorSet = device.createDescriptorSet(new DescriptorSetInfo(pass.localSetLayout));
    this._descriptorSet.bindBuffer(UBOForwardLight.BINDING, deferredLitsBufView);
    var _localUBO = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, UBOLocalEnum.SIZE, UBOLocalEnum.SIZE));
    this._descriptorSet.bindBuffer(UBOLocalEnum.BINDING, _localUBO);
  };
  _proto.activate = function activate(pipeline, flow) {
    _RenderStage.prototype.activate.call(this, pipeline, flow);
    this._uiPhase.activate(pipeline);
    for (var i = 0; i < this.renderQueues.length; i++) {
      this._renderQueues[i] = convertRenderQueue(this.renderQueues[i]);
    }
    this._planarQueue = new PlanarShadowQueue(this._pipeline);
    if (this._deferredMaterial) {
      pipeline.pipelineSceneData.deferredLightingMaterial = this._deferredMaterial;
    }
  };
  _proto.destroy = function destroy() {
    var _this$_deferredLitsBu;
    (_this$_deferredLitsBu = this._deferredLitsBufs) == null ? void 0 : _this$_deferredLitsBu.destroy();
    this._deferredLitsBufs = null;
    this._descriptorSet = null;
  };
  _proto.render = function render(camera) {
    var _camera$geometryRende;
    var pipeline = this._pipeline;
    var device = pipeline.device;
    var cmdBuff = pipeline.commandBuffers[0];
    var sceneData = pipeline.pipelineSceneData;
    var renderObjects = sceneData.renderObjects;
    this._planarQueue.gatherShadowPasses(camera, cmdBuff);
    pipeline.generateRenderArea(camera, this._renderArea);
    var deferredData = pipeline.getPipelineRenderData();
    var lightingMat = sceneData.deferredLightingMaterial;
    var pass = lightingMat.passes[0];
    var shader = pass.getShaderVariant();
    for (var i = 0; i < 3; ++i) {
      pass.descriptorSet.bindTexture(i, deferredData.gbufferRenderTargets[i]);
      pass.descriptorSet.bindSampler(i, deferredData.sampler);
    }
    pass.descriptorSet.bindTexture(3, deferredData.outputDepth);
    pass.descriptorSet.bindSampler(3, deferredData.sampler);
    pass.descriptorSet.update();
    if (!this._descriptorSet) {
      this._createStageDescriptor(pass);
    }
    this.gatherLights(camera);
    if (camera.clearFlag & ClearFlagBit.COLOR) {
      colors$2[0].x = camera.clearColor.x;
      colors$2[0].y = camera.clearColor.y;
      colors$2[0].z = camera.clearColor.z;
    }
    colors$2[0].w = 0;
    var framebuffer = deferredData.outputFrameBuffer;
    var renderPass = framebuffer.renderPass;
    pipeline.pipelineUBO.updateShadowUBO(camera);
    cmdBuff.beginRenderPass(renderPass, framebuffer, this._renderArea, colors$2, camera.clearDepth, camera.clearStencil);
    cmdBuff.setScissor(pipeline.generateScissor(camera));
    cmdBuff.setViewport(pipeline.generateViewport(camera));
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);
    var inputAssembler = pipeline.quadIAOffscreen;
    var pso = null;
    if (pass != null && shader != null && inputAssembler != null) {
      pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, inputAssembler);
    }
    if (pso != null) {
      this._descriptorSet.update();
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
      cmdBuff.bindDescriptorSet(SetIndex.LOCAL, this._descriptorSet);
      cmdBuff.bindInputAssembler(inputAssembler);
      cmdBuff.draw(inputAssembler);
    }
    this._renderQueues.forEach(renderQueueClearFunc);
    var m = 0;
    var p = 0;
    var k = 0;
    for (var _i4 = 0; _i4 < renderObjects.length; ++_i4) {
      var ro = renderObjects[_i4];
      var subModels = ro.model.subModels;
      for (m = 0; m < subModels.length; ++m) {
        var subModel = subModels[m];
        var passes = subModel.passes;
        for (p = 0; p < passes.length; ++p) {
          var _pass = passes[p];
          if (_pass.phase !== this._phaseID) continue;
          for (k = 0; k < this._renderQueues.length; k++) {
            this._renderQueues[k].insertRenderPass(ro, m, p);
          }
        }
      }
    }
    if (renderObjects.length > 0) {
      this._renderQueues.forEach(renderQueueSortFunc);
      for (var _i5 = 0; _i5 < this._renderQueues.length; _i5++) {
        this._renderQueues[_i5].recordCommandBuffer(device, renderPass, cmdBuff);
      }
      this._planarQueue.recordCommandBuffer(device, renderPass, cmdBuff);
    }
    (_camera$geometryRende = camera.geometryRenderer) == null ? void 0 : _camera$geometryRende.render(renderPass, cmdBuff, pipeline.pipelineSceneData);
    this._uiPhase.render(camera, renderPass);
    cmdBuff.endRenderPass();
  };
  return LightingStage;
}(RenderStage), _LightingStage.initInfo = {
  name: 'LightingStage',
  priority: DeferredStagePriority.LIGHTING,
  tag: 0
}, _LightingStage), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "_deferredMaterial", [_dec2$3, serializable], function () {
  return null;
}), _initializer2$1 = applyDecoratedInitializer(_class2$3.prototype, "renderQueues", [_dec3$1, serializable], function () {
  return [];
}), _class2$3)) || _class$4);

var _dec$3, _dec2$2, _dec3, _class$3, _class2$2, _initializer$2, _initializer2, _PostProcessStage;
var colors$1 = [new Color$1(0, 0, 0, 1)];
var PostProcessStage = (_dec$3 = ccclass('PostProcessStage'), _dec2$2 = type(Material), _dec3 = type([RenderQueueDesc]), _dec$3(_class$3 = (_class2$2 = (_PostProcessStage = function (_RenderStage) {
  function PostProcessStage() {
    var _this;
    _this = _RenderStage.call(this) || this;
    _this._postProcessMaterial = _initializer$2 && _initializer$2();
    _this.renderQueues = _initializer2 && _initializer2();
    _this._renderArea = new Rect();
    _this._stageDesc = null;
    _this._localUBO = null;
    _this._uiPhase = new UIPhase();
    return _this;
  }
  _inheritsLoose(PostProcessStage, _RenderStage);
  var _proto = PostProcessStage.prototype;
  _proto.initialize = function initialize(info) {
    _RenderStage.prototype.initialize.call(this, info);
    return true;
  };
  _proto.activate = function activate(pipeline, flow) {
    _RenderStage.prototype.activate.call(this, pipeline, flow);
    if (this._postProcessMaterial) {
      pipeline.pipelineSceneData.postprocessMaterial = this._postProcessMaterial;
    }
    this._uiPhase.activate(pipeline);
  };
  _proto.destroy = function destroy() {};
  _proto.render = function render(camera) {
    var pipeline = this._pipeline;
    var device = pipeline.device;
    var sceneData = pipeline.pipelineSceneData;
    var cmdBuff = pipeline.commandBuffers[0];
    pipeline.pipelineUBO.updateCameraUBO(camera);
    var vp = camera.viewport;
    this._renderArea.x = vp.x * camera.window.width;
    this._renderArea.y = vp.y * camera.window.height;
    this._renderArea.width = vp.width * camera.window.width;
    this._renderArea.height = vp.height * camera.window.height;
    var renderData = pipeline.getPipelineRenderData();
    var framebuffer = camera.window.framebuffer;
    var renderPass = pipeline.getRenderPass(camera.clearFlag, framebuffer);
    if (camera.clearFlag & ClearFlagBit.COLOR) {
      colors$1[0].x = camera.clearColor.x;
      colors$1[0].y = camera.clearColor.y;
      colors$1[0].z = camera.clearColor.z;
    }
    colors$1[0].w = camera.clearColor.w;
    cmdBuff.beginRenderPass(renderPass, framebuffer, this._renderArea, colors$1, camera.clearDepth, camera.clearStencil);
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);
    var builtinPostProcess = sceneData.postprocessMaterial;
    var pass = builtinPostProcess.passes[0];
    var shader = pass.getShaderVariant();
    if (pipeline.bloomEnabled) {
      pass.descriptorSet.bindTexture(0, renderData.bloom.combineTex);
    } else {
      pass.descriptorSet.bindTexture(0, renderData.outputRenderTargets[0]);
    }
    pass.descriptorSet.bindSampler(0, renderData.sampler);
    pass.descriptorSet.update();
    var inputAssembler = camera.window.swapchain ? pipeline.quadIAOnscreen : pipeline.quadIAOffscreen;
    var pso = null;
    if (pass != null && shader != null && inputAssembler != null) {
      pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, inputAssembler);
    }
    var renderObjects = pipeline.pipelineSceneData.renderObjects;
    if (pso != null && renderObjects.length > 0) {
      if (!this._stageDesc) {
        this._stageDesc = device.createDescriptorSet(new DescriptorSetInfo(pass.localSetLayout));
        this._localUBO = device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, UBOLocalEnum.SIZE, UBOLocalEnum.SIZE));
        this._stageDesc.bindBuffer(UBOLocalEnum.BINDING, this._localUBO);
      }
      this._stageDesc.update();
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
      cmdBuff.bindDescriptorSet(SetIndex.LOCAL, this._stageDesc);
      cmdBuff.bindInputAssembler(inputAssembler);
      cmdBuff.draw(inputAssembler);
    }
    this._uiPhase.render(camera, renderPass);
    renderProfiler(device, renderPass, cmdBuff, pipeline.profiler, camera);
    cmdBuff.endRenderPass();
  };
  return PostProcessStage;
}(RenderStage), _PostProcessStage.initInfo = {
  name: 'PostProcessStage',
  priority: CommonStagePriority.POST_PROCESS,
  tag: 0
}, _PostProcessStage), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_postProcessMaterial", [_dec2$2, serializable], function () {
  return null;
}), _initializer2 = applyDecoratedInitializer(_class2$2.prototype, "renderQueues", [_dec3, serializable], function () {
  return [];
}), _class2$2)) || _class$3);

var DeferredAntiAliasing;
(function (DeferredAntiAliasing) {
  DeferredAntiAliasing[DeferredAntiAliasing["NONE"] = 0] = "NONE";
  DeferredAntiAliasing[DeferredAntiAliasing["FXAA"] = 1] = "FXAA";
})(DeferredAntiAliasing || (DeferredAntiAliasing = {}));
var BLOOM_PREFILTERPASS_INDEX = 0;
var BLOOM_DOWNSAMPLEPASS_INDEX = 1;
var BLOOM_UPSAMPLEPASS_INDEX = BLOOM_DOWNSAMPLEPASS_INDEX + MAX_BLOOM_FILTER_PASS_NUM;
var BLOOM_COMBINEPASS_INDEX = BLOOM_UPSAMPLEPASS_INDEX + MAX_BLOOM_FILTER_PASS_NUM;
var DeferredPipelineSceneData = function (_PipelineSceneData) {
  function DeferredPipelineSceneData() {
    var _this;
    _this = _PipelineSceneData.call(this) || this;
    _this._antiAliasing = DeferredAntiAliasing.NONE;
    return _this;
  }
  _inheritsLoose(DeferredPipelineSceneData, _PipelineSceneData);
  var _proto = DeferredPipelineSceneData.prototype;
  _proto.updatePipelineSceneData = function updatePipelineSceneData() {
    this.updatePipelinePassInfo();
  };
  _proto.updateBloomPass = function updateBloomPass() {
    if (!this._bloomMaterial) return;
    var prefilterPass = this._bloomMaterial.passes[BLOOM_PREFILTERPASS_INDEX];
    prefilterPass.beginChangeStatesSilently();
    prefilterPass.tryCompile();
    prefilterPass.endChangeStatesSilently();
    for (var i = 0; i < MAX_BLOOM_FILTER_PASS_NUM; ++i) {
      var downsamplePass = this._bloomMaterial.passes[BLOOM_DOWNSAMPLEPASS_INDEX + i];
      downsamplePass.beginChangeStatesSilently();
      downsamplePass.tryCompile();
      downsamplePass.endChangeStatesSilently();
      var upsamplePass = this._bloomMaterial.passes[BLOOM_UPSAMPLEPASS_INDEX + i];
      upsamplePass.beginChangeStatesSilently();
      upsamplePass.tryCompile();
      upsamplePass.endChangeStatesSilently();
    }
    var combinePass = this._bloomMaterial.passes[BLOOM_COMBINEPASS_INDEX];
    combinePass.beginChangeStatesSilently();
    combinePass.tryCompile();
    combinePass.endChangeStatesSilently();
  };
  _proto.updatePostProcessPass = function updatePostProcessPass() {
    if (!this.postprocessMaterial) return;
    var passPost = this.postprocessMaterial.passes[0];
    passPost.beginChangeStatesSilently();
    passPost.tryCompile();
    passPost.endChangeStatesSilently();
  };
  _proto.initPipelinePassInfo = function initPipelinePassInfo() {
    var deferredMat = new Material();
    deferredMat._uuid = 'builtin-deferred-material';
    deferredMat.initialize({
      effectName: 'pipeline/deferred-lighting'
    });
    for (var i = 0; i < deferredMat.passes.length; ++i) {
      deferredMat.passes[i].tryCompile();
    }
    this._deferredLightingMaterial = deferredMat;
    var bloomMat = new Material();
    bloomMat._uuid = 'builtin-bloom-material';
    bloomMat.initialize({
      effectName: 'pipeline/bloom'
    });
    for (var _i = 0; _i < bloomMat.passes.length; ++_i) {
      bloomMat.passes[_i].tryCompile();
    }
    this._bloomMaterial = bloomMat;
    var postMat = new Material();
    postMat._uuid = 'builtin-post-process-material';
    postMat.initialize({
      effectName: 'pipeline/post-process',
      defines: {
        ANTIALIAS_TYPE: this._antiAliasing
      }
    });
    for (var _i2 = 0; _i2 < postMat.passes.length; ++_i2) {
      postMat.passes[_i2].tryCompile();
    }
    this._postprocessMaterial = postMat;
    this.updatePipelinePassInfo();
  };
  _proto.updatePipelinePassInfo = function updatePipelinePassInfo() {
    this.updateBloomPass();
    this.updatePostProcessPass();
    this.updateDeferredPassInfo();
  };
  _proto.activate = function activate(device) {
    _PipelineSceneData.prototype.activate.call(this, device);
    this.initPipelinePassInfo();
    return true;
  };
  _proto.updateDeferredPassInfo = function updateDeferredPassInfo() {
    this.updateDeferredLightPass();
  };
  _proto.updateDeferredLightPass = function updateDeferredLightPass() {
    if (!this._deferredLightingMaterial) return;
    legacyCC.director.root.pipeline.macros.CC_RECEIVE_SHADOW = 1;
    var passLit = this._deferredLightingMaterial.passes[0];
    passLit.beginChangeStatesSilently();
    passLit.tryCompile();
    passLit.endChangeStatesSilently();
  };
  return _createClass(DeferredPipelineSceneData, [{
    key: "antiAliasing",
    get: function get() {
      return this._antiAliasing;
    },
    set: function set(value) {
      this._antiAliasing = value;
      if (this._postprocessMaterial) {
        var defines = this._postprocessMaterial.passes[0].defines;
        Object.assign(defines, {
          ANTIALIAS_TYPE: value
        });
        var renderMat = new Material();
        renderMat.initialize({
          effectAsset: this._postprocessMaterial.effectAsset,
          defines: defines
        });
        for (var i = 0; i < renderMat.passes.length; ++i) {
          renderMat.passes[i].tryCompile();
        }
        this._postprocessMaterial = renderMat;
      }
    }
  }, {
    key: "bloomMaterial",
    get: function get() {
      return this._bloomMaterial;
    },
    set: function set(mat) {
      if (this._bloomMaterial === mat || !mat) return;
      this._bloomMaterial = mat;
      this.updatePipelinePassInfo();
    }
  }, {
    key: "postprocessMaterial",
    get: function get() {
      return this._postprocessMaterial;
    },
    set: function set(mat) {
      if (this._postprocessMaterial === mat || !mat) return;
      this._postprocessMaterial = mat;
      this.updatePipelinePassInfo();
    }
  }, {
    key: "deferredLightingMaterial",
    get: function get() {
      return this._deferredLightingMaterial;
    },
    set: function set(mat) {
      if (this._deferredLightingMaterial === mat || !mat) return;
      this._deferredLightingMaterial = mat;
      this.updatePipelinePassInfo();
    }
  }]);
}(PipelineSceneData);

var _UBOBloom, _dec$2, _dec2$1, _class$2, _class2$1, _initializer$1, _BloomStage;
var colors = [new Color$1(0, 0, 0, 1)];
var UBOBloom = function UBOBloom() {};
_UBOBloom = UBOBloom;
UBOBloom.TEXTURE_SIZE_OFFSET = 0;
UBOBloom.COUNT = _UBOBloom.TEXTURE_SIZE_OFFSET + 4;
UBOBloom.SIZE = _UBOBloom.COUNT * 4;
var BloomStage = (_dec$2 = ccclass('BloomStage'), _dec2$1 = type(Material), _dec$2(_class$2 = (_class2$1 = (_BloomStage = function (_RenderStage) {
  function BloomStage() {
    var _this;
    _this = _RenderStage.call(this) || this;
    _this.threshold = 1.0;
    _this.intensity = 0.8;
    _this.iterations = 2;
    _this._bloomMaterial = _initializer$1 && _initializer$1();
    _this._renderArea = new Rect();
    _this._bloomUBO = [];
    return _this;
  }
  _inheritsLoose(BloomStage, _RenderStage);
  var _proto = BloomStage.prototype;
  _proto.initialize = function initialize(info) {
    _RenderStage.prototype.initialize.call(this, info);
    return true;
  };
  _proto.activate = function activate(pipeline, flow) {
    _RenderStage.prototype.activate.call(this, pipeline, flow);
    if (this._bloomMaterial) {
      pipeline.pipelineSceneData.bloomMaterial = this._bloomMaterial;
    }
  };
  _proto.destroy = function destroy() {};
  _proto.render = function render(camera) {
    var _camera$window;
    var pipeline = this._pipeline;
    pipeline.generateBloomRenderData();
    if (!((_camera$window = camera.window) != null && _camera$window.swapchain) && !pipeline.macros.CC_PIPELINE_TYPE) {
      return;
    }
    if (!pipeline.bloomEnabled || pipeline.pipelineSceneData.renderObjects.length === 0) return;
    if (this._bloomUBO.length === 0) {
      var passNumber = MAX_BLOOM_FILTER_PASS_NUM * 2 + 2;
      for (var i = 0; i < passNumber; ++i) {
        this._bloomUBO[i] = pipeline.device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOBloom.SIZE, UBOBloom.SIZE));
      }
    }
    if (camera.clearFlag & ClearFlagBit.COLOR) {
      colors[0].x = camera.clearColor.x;
      colors[0].y = camera.clearColor.y;
      colors[0].z = camera.clearColor.z;
    }
    colors[0].w = camera.clearColor.w;
    this._prefilterPass(camera, pipeline);
    this._downsamplePass(camera, pipeline);
    this._upsamplePass(camera, pipeline);
    this._combinePass(camera, pipeline);
  };
  _proto._prefilterPass = function _prefilterPass(camera, pipeline) {
    pipeline.generateRenderArea(camera, this._renderArea);
    this._renderArea.width >>= 1;
    this._renderArea.height >>= 1;
    var cmdBuff = pipeline.commandBuffers[0];
    var sceneData = pipeline.pipelineSceneData;
    var builtinBloomProcess = sceneData.bloomMaterial;
    var pass = builtinBloomProcess.passes[BLOOM_PREFILTERPASS_INDEX];
    var renderData = pipeline.getPipelineRenderData();
    var bloomData = renderData.bloom;
    var textureSize = new Float32Array(UBOBloom.COUNT);
    textureSize[UBOBloom.TEXTURE_SIZE_OFFSET + 2] = this.threshold;
    cmdBuff.updateBuffer(this._bloomUBO[0], textureSize);
    cmdBuff.beginRenderPass(bloomData.renderPass, bloomData.prefilterFramebuffer, this._renderArea, colors, 0, 0);
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);
    pass.descriptorSet.bindBuffer(0, this._bloomUBO[0]);
    pass.descriptorSet.bindTexture(1, renderData.outputRenderTargets[0]);
    pass.descriptorSet.bindSampler(1, bloomData.sampler);
    pass.descriptorSet.update();
    cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
    var inputAssembler = camera.window.swapchain ? pipeline.quadIAOffscreen : pipeline.quadIAOnscreen;
    var pso = null;
    var shader = pass.getShaderVariant();
    if (pass != null && shader != null && inputAssembler != null) {
      pso = PipelineStateManager.getOrCreatePipelineState(pipeline.device, pass, shader, bloomData.renderPass, inputAssembler);
    }
    if (pso != null) {
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindInputAssembler(inputAssembler);
      cmdBuff.draw(inputAssembler);
    }
    cmdBuff.endRenderPass();
  };
  _proto._downsamplePass = function _downsamplePass(camera, pipeline) {
    pipeline.generateRenderArea(camera, this._renderArea);
    this._renderArea.width >>= 1;
    this._renderArea.height >>= 1;
    var cmdBuff = pipeline.commandBuffers[0];
    var sceneData = pipeline.pipelineSceneData;
    var builtinBloomProcess = sceneData.bloomMaterial;
    var bloomData = pipeline.getPipelineRenderData().bloom;
    var textureSize = new Float32Array(UBOBloom.COUNT);
    for (var i = 0; i < this.iterations; ++i) {
      textureSize[UBOBloom.TEXTURE_SIZE_OFFSET + 0] = this._renderArea.width;
      textureSize[UBOBloom.TEXTURE_SIZE_OFFSET + 1] = this._renderArea.height;
      cmdBuff.updateBuffer(this._bloomUBO[i + 1], textureSize);
      this._renderArea.width >>= 1;
      this._renderArea.height >>= 1;
      cmdBuff.beginRenderPass(bloomData.renderPass, bloomData.downsampleFramebuffers[i], this._renderArea, colors, 0, 0);
      var pass = builtinBloomProcess.passes[BLOOM_DOWNSAMPLEPASS_INDEX + i];
      var shader = pass.getShaderVariant();
      pass.descriptorSet.bindBuffer(0, this._bloomUBO[i + 1]);
      if (i === 0) {
        pass.descriptorSet.bindTexture(1, bloomData.prefiterTex);
      } else {
        pass.descriptorSet.bindTexture(1, bloomData.downsampleTexs[i - 1]);
      }
      pass.descriptorSet.bindSampler(1, bloomData.sampler);
      pass.descriptorSet.update();
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
      var inputAssembler = camera.window.swapchain ? pipeline.quadIAOffscreen : pipeline.quadIAOnscreen;
      var pso = null;
      if (pass != null && shader != null && inputAssembler != null) {
        pso = PipelineStateManager.getOrCreatePipelineState(pipeline.device, pass, shader, bloomData.renderPass, inputAssembler);
      }
      if (pso != null) {
        cmdBuff.bindPipelineState(pso);
        cmdBuff.bindInputAssembler(inputAssembler);
        cmdBuff.draw(inputAssembler);
      }
      cmdBuff.endRenderPass();
    }
  };
  _proto._upsamplePass = function _upsamplePass(camera, pipeline) {
    var bloomData = pipeline.getPipelineRenderData().bloom;
    pipeline.generateRenderArea(camera, this._renderArea);
    this._renderArea.width >>= this.iterations + 1;
    this._renderArea.height >>= this.iterations + 1;
    var cmdBuff = pipeline.commandBuffers[0];
    var sceneData = pipeline.pipelineSceneData;
    var builtinBloomProcess = sceneData.bloomMaterial;
    var textureSize = new Float32Array(UBOBloom.COUNT);
    for (var i = 0; i < this.iterations; ++i) {
      var index = i + MAX_BLOOM_FILTER_PASS_NUM + 1;
      textureSize[UBOBloom.TEXTURE_SIZE_OFFSET + 0] = this._renderArea.width;
      textureSize[UBOBloom.TEXTURE_SIZE_OFFSET + 1] = this._renderArea.height;
      cmdBuff.updateBuffer(this._bloomUBO[index], textureSize);
      this._renderArea.width <<= 1;
      this._renderArea.height <<= 1;
      cmdBuff.beginRenderPass(bloomData.renderPass, bloomData.upsampleFramebuffers[this.iterations - 1 - i], this._renderArea, colors, 0, 0);
      var pass = builtinBloomProcess.passes[BLOOM_UPSAMPLEPASS_INDEX + i];
      var shader = pass.getShaderVariant();
      pass.descriptorSet.bindBuffer(0, this._bloomUBO[index]);
      if (i === 0) {
        pass.descriptorSet.bindTexture(1, bloomData.downsampleTexs[this.iterations - 1]);
      } else {
        pass.descriptorSet.bindTexture(1, bloomData.upsampleTexs[this.iterations - i]);
      }
      pass.descriptorSet.bindSampler(1, bloomData.sampler);
      pass.descriptorSet.update();
      cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
      var inputAssembler = camera.window.swapchain ? pipeline.quadIAOffscreen : pipeline.quadIAOnscreen;
      var pso = null;
      if (pass != null && shader != null && inputAssembler != null) {
        pso = PipelineStateManager.getOrCreatePipelineState(pipeline.device, pass, shader, bloomData.renderPass, inputAssembler);
      }
      if (pso != null) {
        cmdBuff.bindPipelineState(pso);
        cmdBuff.bindInputAssembler(inputAssembler);
        cmdBuff.draw(inputAssembler);
      }
      cmdBuff.endRenderPass();
    }
  };
  _proto._combinePass = function _combinePass(camera, pipeline) {
    pipeline.generateRenderArea(camera, this._renderArea);
    var cmdBuff = pipeline.commandBuffers[0];
    var sceneData = pipeline.pipelineSceneData;
    var builtinBloomProcess = sceneData.bloomMaterial;
    var deferredData = pipeline.getPipelineRenderData();
    var bloomData = deferredData.bloom;
    var uboIndex = MAX_BLOOM_FILTER_PASS_NUM * 2 + 1;
    var textureSize = new Float32Array(UBOBloom.COUNT);
    textureSize[UBOBloom.TEXTURE_SIZE_OFFSET + 3] = this.intensity;
    cmdBuff.updateBuffer(this._bloomUBO[uboIndex], textureSize);
    cmdBuff.beginRenderPass(bloomData.renderPass, bloomData.combineFramebuffer, this._renderArea, colors, 0, 0);
    cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);
    var pass = builtinBloomProcess.passes[BLOOM_COMBINEPASS_INDEX];
    pass.descriptorSet.bindBuffer(0, this._bloomUBO[uboIndex]);
    pass.descriptorSet.bindTexture(1, deferredData.outputRenderTargets[0]);
    pass.descriptorSet.bindTexture(2, bloomData.upsampleTexs[0]);
    pass.descriptorSet.bindSampler(1, bloomData.sampler);
    pass.descriptorSet.bindSampler(2, bloomData.sampler);
    pass.descriptorSet.update();
    cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, pass.descriptorSet);
    var inputAssembler = camera.window.swapchain ? pipeline.quadIAOffscreen : pipeline.quadIAOnscreen;
    var pso = null;
    var shader = pass.getShaderVariant();
    if (pass != null && shader != null && inputAssembler != null) {
      pso = PipelineStateManager.getOrCreatePipelineState(pipeline.device, pass, shader, bloomData.renderPass, inputAssembler);
    }
    if (pso != null) {
      cmdBuff.bindPipelineState(pso);
      cmdBuff.bindInputAssembler(inputAssembler);
      cmdBuff.draw(inputAssembler);
    }
    cmdBuff.endRenderPass();
  };
  return BloomStage;
}(RenderStage), _BloomStage.initInfo = {
  name: 'BloomStage',
  priority: CommonStagePriority.BLOOM,
  tag: 0
}, _BloomStage), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_bloomMaterial", [_dec2$1, serializable], function () {
  return null;
}), _class2$1)) || _class$2);

var _dec$1, _class$1, _MainFlow;
var MainFlow = (_dec$1 = ccclass('MainFlow'), _dec$1(_class$1 = (_MainFlow = function (_RenderFlow) {
  function MainFlow() {
    return _RenderFlow.apply(this, arguments) || this;
  }
  _inheritsLoose(MainFlow, _RenderFlow);
  var _proto = MainFlow.prototype;
  _proto.initialize = function initialize(info) {
    _RenderFlow.prototype.initialize.call(this, info);
    if (this._stages.length === 0) {
      var gbufferStage = new GbufferStage();
      gbufferStage.initialize(GbufferStage.initInfo);
      this._stages.push(gbufferStage);
      var lightingStage = new LightingStage();
      lightingStage.initialize(LightingStage.initInfo);
      this._stages.push(lightingStage);
      var bloomStage = new BloomStage();
      bloomStage.initialize(BloomStage.initInfo);
      this._stages.push(bloomStage);
      var postProcessStage = new PostProcessStage();
      postProcessStage.initialize(PostProcessStage.initInfo);
      this._stages.push(postProcessStage);
    }
    return true;
  };
  _proto.activate = function activate(pipeline) {
    _RenderFlow.prototype.activate.call(this, pipeline);
  };
  _proto.render = function render(camera) {
    _RenderFlow.prototype.render.call(this, camera);
  };
  _proto.destroy = function destroy() {
    _RenderFlow.prototype.destroy.call(this);
  };
  return MainFlow;
}(RenderFlow), _MainFlow.initInfo = {
  name: PIPELINE_FLOW_MAIN,
  priority: DeferredFlowPriority.MAIN,
  stages: []
}, _MainFlow)) || _class$1);

var _dec, _dec2, _class, _class2, _initializer;
var PIPELINE_TYPE = 1;
var DeferredRenderData = function (_PipelineRenderData) {
  function DeferredRenderData() {
    var _this;
    _this = _PipelineRenderData.call(this) || this;
    _this.gbufferFrameBuffer = null;
    _this.gbufferRenderTargets = [];
    return _this;
  }
  _inheritsLoose(DeferredRenderData, _PipelineRenderData);
  return DeferredRenderData;
}(PipelineRenderData);
var DeferredPipeline = (_dec = ccclass('DeferredPipeline'), _dec2 = type([RenderTextureConfig]), _dec(_class = (_class2 = function (_RenderPipeline) {
  function DeferredPipeline() {
    var _this2;
    _this2 = _RenderPipeline.call(this) || this;
    _this2._gbufferRenderPass = null;
    _this2._lightingRenderPass = null;
    _this2.renderTextures = _initializer && _initializer();
    return _this2;
  }
  _inheritsLoose(DeferredPipeline, _RenderPipeline);
  var _proto = DeferredPipeline.prototype;
  _proto.initialize = function initialize(info) {
    _RenderPipeline.prototype.initialize.call(this, info);
    if (this._flows.length === 0) {
      var shadowFlow = new ShadowFlow();
      shadowFlow.initialize(ShadowFlow.initInfo);
      this._flows.push(shadowFlow);
      var mainFlow = new MainFlow();
      mainFlow.initialize(MainFlow.initInfo);
      this._flows.push(mainFlow);
    }
    return true;
  };
  _proto.activate = function activate(swapchain) {
    this._macros = {
      CC_PIPELINE_TYPE: PIPELINE_TYPE
    };
    this._pipelineSceneData = new DeferredPipelineSceneData();
    if (!_RenderPipeline.prototype.activate.call(this, swapchain)) {
      return false;
    }
    if (!this._activeRenderer(swapchain)) {
      errorID(2402);
      return false;
    }
    return true;
  };
  _proto.destroy = function destroy() {
    this._destroyUBOs();
    this._destroyQuadInputAssembler();
    this._destroyDeferredData();
    var rpIter = this._renderPasses.values();
    var rpRes = rpIter.next();
    while (!rpRes.done) {
      rpRes.value.destroy();
      rpRes = rpIter.next();
    }
    this._commandBuffers.length = 0;
    return _RenderPipeline.prototype.destroy.call(this);
  };
  _proto.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {
    this.pipelineSceneData.updatePipelineSceneData();
  };
  _proto.getPipelineRenderData = function getPipelineRenderData() {
    if (!this._pipelineRenderData) {
      this._generateDeferredRenderData();
    }
    return this._pipelineRenderData;
  };
  _proto._activeRenderer = function _activeRenderer(swapchain) {
    var device = this.device;
    this._commandBuffers.push(device.commandBuffer);
    var sampler = this.globalDSManager.pointSampler;
    this._descriptorSet.bindSampler(UNIFORM_SHADOWMAP_BINDING, sampler);
    this._descriptorSet.bindTexture(UNIFORM_SHADOWMAP_BINDING, builtinResMgr.get('default-texture').getGFXTexture());
    this._descriptorSet.bindSampler(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, sampler);
    this._descriptorSet.bindTexture(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING, builtinResMgr.get('default-texture').getGFXTexture());
    this._descriptorSet.update();
    var inputAssemblerDataOffscreen = new PipelineInputAssemblerData();
    inputAssemblerDataOffscreen = this._createQuadInputAssembler();
    if (!inputAssemblerDataOffscreen.quadIB || !inputAssemblerDataOffscreen.quadVB || !inputAssemblerDataOffscreen.quadIA) {
      return false;
    }
    this._quadIB = inputAssemblerDataOffscreen.quadIB;
    this._quadVBOffscreen = inputAssemblerDataOffscreen.quadVB;
    this._quadIAOffscreen = inputAssemblerDataOffscreen.quadIA;
    var inputAssemblerDataOnscreen = this._createQuadInputAssembler();
    if (!inputAssemblerDataOnscreen.quadIB || !inputAssemblerDataOnscreen.quadVB || !inputAssemblerDataOnscreen.quadIA) {
      return false;
    }
    this._quadVBOnscreen = inputAssemblerDataOnscreen.quadVB;
    this._quadIAOnscreen = inputAssemblerDataOnscreen.quadIA;
    if (!this._gbufferRenderPass) {
      var colorAttachment0 = new ColorAttachment();
      colorAttachment0.format = Format.RGBA16F;
      colorAttachment0.loadOp = LoadOp.CLEAR;
      colorAttachment0.storeOp = StoreOp.STORE;
      var colorAttachment1 = new ColorAttachment();
      colorAttachment1.format = Format.RGBA16F;
      colorAttachment1.loadOp = LoadOp.CLEAR;
      colorAttachment1.storeOp = StoreOp.STORE;
      var colorAttachment2 = new ColorAttachment();
      colorAttachment2.format = Format.RGBA16F;
      colorAttachment2.loadOp = LoadOp.CLEAR;
      colorAttachment2.storeOp = StoreOp.STORE;
      var depthStencilAttachment = new DepthStencilAttachment();
      depthStencilAttachment.format = Format.DEPTH_STENCIL;
      depthStencilAttachment.depthLoadOp = LoadOp.CLEAR;
      depthStencilAttachment.depthStoreOp = StoreOp.STORE;
      depthStencilAttachment.stencilLoadOp = LoadOp.CLEAR;
      depthStencilAttachment.stencilStoreOp = StoreOp.STORE;
      var renderPassInfo = new RenderPassInfo([colorAttachment0, colorAttachment1, colorAttachment2], depthStencilAttachment);
      this._gbufferRenderPass = device.createRenderPass(renderPassInfo);
    }
    if (!this._lightingRenderPass) {
      var colorAttachment = new ColorAttachment();
      colorAttachment.format = Format.RGBA8;
      colorAttachment.loadOp = LoadOp.CLEAR;
      colorAttachment.storeOp = StoreOp.STORE;
      colorAttachment.barrier = device.getGeneralBarrier(new GeneralBarrierInfo(AccessFlagBit.NONE, AccessFlagBit.COLOR_ATTACHMENT_WRITE));
      var _depthStencilAttachment = new DepthStencilAttachment();
      _depthStencilAttachment.format = Format.DEPTH_STENCIL;
      _depthStencilAttachment.depthLoadOp = LoadOp.LOAD;
      _depthStencilAttachment.depthStoreOp = StoreOp.DISCARD;
      _depthStencilAttachment.stencilLoadOp = LoadOp.LOAD;
      _depthStencilAttachment.stencilStoreOp = StoreOp.DISCARD;
      colorAttachment.barrier = device.getGeneralBarrier(new GeneralBarrierInfo(AccessFlagBit.DEPTH_STENCIL_ATTACHMENT_WRITE, AccessFlagBit.DEPTH_STENCIL_ATTACHMENT_WRITE));
      var _renderPassInfo = new RenderPassInfo([colorAttachment], _depthStencilAttachment);
      this._lightingRenderPass = device.createRenderPass(_renderPassInfo);
    }
    this._width = swapchain.width;
    this._height = swapchain.height;
    this._generateDeferredRenderData();
    return true;
  };
  _proto._destroyUBOs = function _destroyUBOs() {
    if (this._descriptorSet) {
      this._descriptorSet.getBuffer(UBOGlobal.BINDING).destroy();
      this._descriptorSet.getBuffer(UBOShadow.BINDING).destroy();
      this._descriptorSet.getBuffer(UBOCamera.BINDING).destroy();
      this._descriptorSet.getTexture(UNIFORM_SHADOWMAP_BINDING).destroy();
      this._descriptorSet.getTexture(UNIFORM_SPOT_SHADOW_MAP_TEXTURE_BINDING).destroy();
    }
  };
  _proto._destroyDeferredData = function _destroyDeferredData() {
    var deferredData = this._pipelineRenderData;
    if (deferredData) {
      if (deferredData.gbufferFrameBuffer) deferredData.gbufferFrameBuffer.destroy();
      if (deferredData.outputFrameBuffer) deferredData.outputFrameBuffer.destroy();
      if (deferredData.outputDepth) deferredData.outputDepth.destroy();
      for (var i = 0; i < deferredData.gbufferRenderTargets.length; i++) {
        deferredData.gbufferRenderTargets[i].destroy();
      }
      deferredData.gbufferRenderTargets.length = 0;
      for (var _i = 0; _i < deferredData.outputRenderTargets.length; _i++) {
        deferredData.outputRenderTargets[_i].destroy();
      }
      deferredData.outputRenderTargets.length = 0;
      this._destroyBloomData();
    }
    this._pipelineRenderData = null;
  };
  _proto._ensureEnoughSize = function _ensureEnoughSize(cameras) {
    var newWidth = this._width;
    var newHeight = this._height;
    for (var i = 0; i < cameras.length; ++i) {
      var window = cameras[i].window;
      newWidth = Math.max(window.width, newWidth);
      newHeight = Math.max(window.height, newHeight);
    }
    if (newWidth !== this._width || newHeight !== this._height) {
      this._width = newWidth;
      this._height = newHeight;
      this._destroyDeferredData();
      this._generateDeferredRenderData();
    }
  };
  _proto._generateDeferredRenderData = function _generateDeferredRenderData() {
    var _this3 = this;
    var device = this.device;
    var data = this._pipelineRenderData = new DeferredRenderData();
    var sceneData = this.pipelineSceneData;
    for (var i = 0; i < 3; ++i) {
      data.gbufferRenderTargets.push(device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED, Format.RGBA16F, this._width * sceneData.shadingScale, this._height * sceneData.shadingScale)));
    }
    data.outputDepth = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED, Format.DEPTH_STENCIL, this._width * sceneData.shadingScale, this._height * sceneData.shadingScale));
    data.gbufferFrameBuffer = device.createFramebuffer(new FramebufferInfo(this._gbufferRenderPass, data.gbufferRenderTargets, data.outputDepth));
    data.outputRenderTargets.push(device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED, Format.RGBA16F, this._width * sceneData.shadingScale, this._height * sceneData.shadingScale)));
    data.outputFrameBuffer = device.createFramebuffer(new FramebufferInfo(this._lightingRenderPass, data.outputRenderTargets, null));
    data.sampler = this.globalDSManager.pointSampler;
    this.on(PipelineEventType.ATTACHMENT_SCALE_CAHNGED, function (val) {
      data.sampler = val < 1 ? _this3.globalDSManager.pointSampler : _this3.globalDSManager.linearSampler;
      data.gbufferFrameBuffer = _this3.newFramebufferByRatio(data.gbufferFrameBuffer);
      data.gbufferFrameBuffer = _this3.newFramebufferByRatio(data.outputFrameBuffer);
    });
  };
  return DeferredPipeline;
}(RenderPipeline), _initializer = applyDecoratedInitializer(_class2.prototype, "renderTextures", [_dec2, serializable], function () {
  return [];
}), _class2)) || _class);

var legacy_rendering = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BloomStage: BloomStage,
    DeferredPipeline: DeferredPipeline,
    ForwardFlow: ForwardFlow,
    ForwardPipeline: ForwardPipeline,
    ForwardStage: ForwardStage,
    GbufferStage: GbufferStage,
    LightingStage: LightingStage,
    MainFlow: MainFlow,
    PostProcessStage: PostProcessStage,
    ReflectionProbeFlow: ReflectionProbeFlow,
    ReflectionProbeStage: ReflectionProbeStage,
    RenderFlow: RenderFlow,
    RenderPipeline: RenderPipeline,
    RenderStage: RenderStage,
    ShadowFlow: ShadowFlow,
    ShadowStage: ShadowStage,
    createDefaultPipeline: createDefaultPipeline
});

legacyCC.legacy_rendering = legacy_rendering;

export { BloomStage, DeferredPipeline, ForwardFlow, ForwardPipeline, ForwardStage, GbufferStage, LightingStage, MainFlow, PostProcessStage, ReflectionProbeFlow, ReflectionProbeStage, RenderFlow, RenderPipeline, RenderStage, ShadowFlow, ShadowStage, createDefaultPipeline };
//# sourceMappingURL=legacy-pipeline.js.map
