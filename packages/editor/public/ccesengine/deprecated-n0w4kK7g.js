import { a as _createClass, k as errorID, _ as _inheritsLoose, o as assertIsTrue, l as _createForOfIteratorHelperLoose, Y as Orientation, aq as _asyncToGenerator, ar as _regenerator, g as getError, G as macro } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { B as BatchingSchemes, y as ShadowType, e as getPipelineSceneData, d as builtinResMgr, A as Ambient, S as Shadows, v as PCFType, C as CSMLevel, q as CSMOptimizationMode, T as TransformBit, k as assetManager, al as resources, an as dependUtil, m as downloader, ao as parser, ap as setDefaultProgressCallback, ak as AssetManager, r as releaseManager, aq as parseLoadResArgs, n as factory } from './scene-vWcxM1_c.js';
import { R as RenderPriority, s as UBOSHEnum, t as INST_MAT_WORLD, u as INST_SH, L as Layers, U as UBOLocalEnum, v as UNIFORM_LIGHTMAP_TEXTURE_BINDING, w as UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING, x as UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING, y as UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING, d as UBOWorldBound } from './pipeline-state-manager-C5U4ouGL.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { a5 as DescriptorSetInfo, aa as Feature, x as FormatInfos, A as Attribute, a3 as getTypedArrayConstructor, ae as SamplerInfo, a4 as Filter, af as Address, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, bc as SurfaceTransform, z as TextureInfo, E as TextureType, H as TextureUsageBit, a0 as TextureFlagBit, F as Format, aK as FramebufferInfo } from './buffer-barrier-BlQXg9Aa.js';
import { M as Mat4, E as EPSILON, g as Vec4, J as AABB, z as v4, u as v3, f as Vec3, Q as Quat, b2 as Frustum, O as screenAdapter, i as replaceProperty, j as removeProperty } from './index-uXI1_UMk.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { o as ProbeType, l as Light, L as LightType, t as nt2lm, C as CameraProjection } from './debug-view-BuNhRPv_.js';
import { f as pipeline, h as fetchPipeline, e as extname, i as assets, k as Cache, t as transform, B as BuiltinBundleName, a as changeExtname, A as Asset, l as getUuidFromURL, n as bundles, d as dirname, b as basename } from './node-event-Ccvtv8bJ.js';

var _dsInfo = new DescriptorSetInfo(null);
var MAX_PASS_COUNT = 8;
var SubModel = function () {
  function SubModel() {
    this._device = null;
    this._passes = null;
    this._shaders = null;
    this._subMesh = null;
    this._patches = null;
    this._priority = RenderPriority.DEFAULT;
    this._inputAssembler = null;
    this._descriptorSet = null;
    this._worldBoundDescriptorSet = null;
    this._instancedAttributeBlock = {
      buffer: null,
      views: [],
      attributes: []
    };
    this._instancedWorldMatrixIndex = -1;
    this._instancedSHIndex = -1;
    this._useReflectionProbeType = 0;
  }
  var _proto = SubModel.prototype;
  _proto.initialize = function initialize(subMesh, passes, patches) {
    if (patches === void 0) {
      patches = null;
    }
    cclegacy.director.root;
    this._device = deviceManager.gfxDevice;
    _dsInfo.layout = passes[0].localSetLayout;
    this._inputAssembler = this._device.createInputAssembler(subMesh.iaInfo);
    this._descriptorSet = this._device.createDescriptorSet(_dsInfo);
    var pipeline = cclegacy.director.root.pipeline;
    var occlusionPass = pipeline.pipelineSceneData.getOcclusionQueryPass();
    if (occlusionPass) {
      var occlusionDSInfo = new DescriptorSetInfo(null);
      occlusionDSInfo.layout = occlusionPass.localSetLayout;
      this._worldBoundDescriptorSet = this._device.createDescriptorSet(occlusionDSInfo);
    }
    this._subMesh = subMesh;
    this._patches = patches ? patches.sort() : null;
    this._passes = passes;
    this._flushPassInfo();
    this.priority = RenderPriority.DEFAULT;
  };
  _proto.destroy = function destroy() {
    this._descriptorSet.destroy();
    this._descriptorSet = null;
    this._inputAssembler.destroy();
    this._inputAssembler = null;
    if (this._worldBoundDescriptorSet) {
      this._worldBoundDescriptorSet.destroy();
    }
    this._worldBoundDescriptorSet = null;
    this.priority = RenderPriority.DEFAULT;
    this._patches = null;
    this._subMesh = null;
    this._passes = null;
    this._shaders = null;
  };
  _proto.update = function update() {
    for (var i = 0; i < this._passes.length; ++i) {
      var pass = this._passes[i];
      pass.update();
    }
    this._descriptorSet.update();
    if (this._worldBoundDescriptorSet) this._worldBoundDescriptorSet.update();
  };
  _proto._updatePasses = function _updatePasses() {
    var passes = this._passes;
    if (!passes) {
      return;
    }
    passes.forEach(function (pass) {
      pass.beginChangeStatesSilently();
      pass.tryCompile();
      pass.endChangeStatesSilently();
    });
    this._flushPassInfo();
  };
  _proto.onPipelineStateChanged = function onPipelineStateChanged() {
    this._updatePasses();
  };
  _proto.onMacroPatchesStateChanged = function onMacroPatchesStateChanged(patches) {
    if (!patches && !this._patches) {
      return;
    } else if (patches) {
      patches = patches.sort();
      if (this._patches && patches.length === this._patches.length) {
        var patchesStateUnchanged = JSON.stringify(patches) === JSON.stringify(this._patches);
        if (patchesStateUnchanged) return;
      }
    }
    this._patches = patches;
    this._updatePasses();
  };
  _proto.onGeometryChanged = function onGeometryChanged() {
    if (!this._subMesh) {
      return;
    }
    var drawInfo = this._subMesh.drawInfo;
    if (this._inputAssembler && drawInfo) {
      var dirtyDrawInfo = this._inputAssembler.drawInfo;
      Object.keys(drawInfo).forEach(function (key) {
        dirtyDrawInfo[key] = drawInfo[key];
      });
      this._inputAssembler.drawInfo = dirtyDrawInfo;
    }
  };
  _proto.getInstancedAttributeIndex = function getInstancedAttributeIndex(name) {
    var attributes = this.instancedAttributeBlock.attributes;
    for (var i = 0; i < attributes.length; i++) {
      if (attributes[i].name === name) {
        return i;
      }
    }
    return -1;
  };
  _proto.updateInstancedWorldMatrix = function updateInstancedWorldMatrix(mat, idx) {
    var attrs = this.instancedAttributeBlock.views;
    var v1 = attrs[idx];
    var v2 = attrs[idx + 1];
    var v3 = attrs[idx + 2];
    v1[0] = mat.m00;
    v1[1] = mat.m01;
    v1[2] = mat.m02;
    v1[3] = mat.m12;
    v2[0] = mat.m04;
    v2[1] = mat.m05;
    v2[2] = mat.m06;
    v2[3] = mat.m13;
    v3[0] = mat.m08;
    v3[1] = mat.m09;
    v3[2] = mat.m10;
    v3[3] = mat.m14;
  };
  _proto.updateInstancedSH = function updateInstancedSH(data, idx) {
    var attrs = this.instancedAttributeBlock.views;
    var count = (UBOSHEnum.SH_QUADRATIC_R_OFFSET - UBOSHEnum.SH_LINEAR_CONST_R_OFFSET) / 4;
    var offset = 0;
    for (var i = idx; i < idx + count; i++) {
      for (var k = 0; k < 4; k++) {
        attrs[i][k] = data[offset++];
      }
    }
  };
  _proto.UpdateInstancedAttributes = function UpdateInstancedAttributes(attributes) {
    this.instancedWorldMatrixIndex = -1;
    this.instancedSHIndex = -1;
    var pass = this.passes[0];
    if (!pass.device.hasFeature(Feature.INSTANCED_ARRAYS)) {
      return;
    }
    var size = 0;
    for (var j = 0; j < attributes.length; j++) {
      var attribute = attributes[j];
      if (!attribute.isInstanced) {
        continue;
      }
      size += FormatInfos[attribute.format].size;
    }
    var attrs = this.instancedAttributeBlock;
    attrs.buffer = new Uint8Array(size);
    attrs.views.length = attrs.attributes.length = 0;
    var offset = 0;
    for (var _j = 0; _j < attributes.length; _j++) {
      var _attribute = attributes[_j];
      if (!_attribute.isInstanced) {
        continue;
      }
      var attr = new Attribute();
      attr.format = _attribute.format;
      attr.name = _attribute.name;
      attr.isNormalized = _attribute.isNormalized;
      attr.location = _attribute.location;
      attrs.attributes.push(attr);
      var info = FormatInfos[_attribute.format];
      var typeViewArray = new (getTypedArrayConstructor(info))(attrs.buffer.buffer, offset, info.count);
      attrs.views.push(typeViewArray);
      offset += info.size;
    }
    if (pass.batchingScheme === BatchingSchemes.INSTANCING) {
      pass.getInstancedBuffer().destroy();
    }
    this.instancedWorldMatrixIndex = this.getInstancedAttributeIndex(INST_MAT_WORLD);
    this.instancedSHIndex = this.getInstancedAttributeIndex(INST_SH);
  };
  _proto._flushPassInfo = function _flushPassInfo() {
    var passes = this._passes;
    if (!passes) {
      return;
    }
    if (!this._shaders) {
      this._shaders = [];
    }
    this._shaders.length = passes.length;
    for (var i = 0, len = passes.length; i < len; i++) {
      this._shaders[i] = passes[i].getShaderVariant(this.patches);
    }
  };
  return _createClass(SubModel, [{
    key: "passes",
    get: function get() {
      return this._passes;
    },
    set: function set(passes) {
      var passLengh = passes.length;
      if (passLengh > MAX_PASS_COUNT) {
        errorID(12004, MAX_PASS_COUNT);
        return;
      }
      this._passes = passes;
      this._flushPassInfo();
      if (this._descriptorSet) {
        this._descriptorSet.destroy();
        _dsInfo.layout = passes[0].localSetLayout;
        this._descriptorSet = this._device.createDescriptorSet(_dsInfo);
      }
    }
  }, {
    key: "shaders",
    get: function get() {
      return this._shaders;
    }
  }, {
    key: "subMesh",
    get: function get() {
      return this._subMesh;
    },
    set: function set(subMesh) {
      this._inputAssembler.destroy();
      this._inputAssembler = this._device.createInputAssembler(subMesh.iaInfo);
      this._subMesh = subMesh;
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    },
    set: function set(val) {
      this._priority = val;
    }
  }, {
    key: "inputAssembler",
    get: function get() {
      return this._inputAssembler;
    }
  }, {
    key: "descriptorSet",
    get: function get() {
      return this._descriptorSet;
    }
  }, {
    key: "worldBoundDescriptorSet",
    get: function get() {
      return this._worldBoundDescriptorSet;
    }
  }, {
    key: "patches",
    get: function get() {
      return this._patches;
    }
  }, {
    key: "instancedAttributeBlock",
    get: function get() {
      return this._instancedAttributeBlock;
    }
  }, {
    key: "instancedWorldMatrixIndex",
    get: function get() {
      return this._instancedWorldMatrixIndex;
    },
    set: function set(val) {
      this._instancedWorldMatrixIndex = val;
    }
  }, {
    key: "instancedSHIndex",
    get: function get() {
      return this._instancedSHIndex;
    },
    set: function set(val) {
      this._instancedSHIndex = val;
    }
  }, {
    key: "useReflectionProbeType",
    get: function get() {
      return this._useReflectionProbeType;
    },
    set: function set(val) {
      this._useReflectionProbeType = val;
    }
  }]);
}();

var ReflectionProbeType;
(function (ReflectionProbeType) {
  ReflectionProbeType[ReflectionProbeType["NONE"] = 0] = "NONE";
  ReflectionProbeType[ReflectionProbeType["BAKED_CUBEMAP"] = 1] = "BAKED_CUBEMAP";
  ReflectionProbeType[ReflectionProbeType["PLANAR_REFLECTION"] = 2] = "PLANAR_REFLECTION";
  ReflectionProbeType[ReflectionProbeType["BLEND_PROBES"] = 3] = "BLEND_PROBES";
  ReflectionProbeType[ReflectionProbeType["BLEND_PROBES_AND_SKYBOX"] = 4] = "BLEND_PROBES_AND_SKYBOX";
})(ReflectionProbeType || (ReflectionProbeType = {}));

var m4_1 = new Mat4();
var shadowMapPatches = [{
  name: 'CC_RECEIVE_SHADOW',
  value: true
}];
var staticLightMapPatches = [{
  name: 'CC_USE_LIGHTMAP',
  value: 1
}];
var stationaryLightMapPatches = [{
  name: 'CC_USE_LIGHTMAP',
  value: 2
}];
var highpLightMapPatches = [{
  name: 'CC_LIGHT_MAP_VERSION',
  value: 2
}];
var lightProbePatches = [{
  name: 'CC_USE_LIGHT_PROBE',
  value: true
}];
var CC_USE_REFLECTION_PROBE = 'CC_USE_REFLECTION_PROBE';
var CC_DISABLE_DIRECTIONAL_LIGHT = 'CC_DISABLE_DIRECTIONAL_LIGHT';
var ModelType;
(function (ModelType) {
  ModelType[ModelType["DEFAULT"] = 0] = "DEFAULT";
  ModelType[ModelType["SKINNING"] = 1] = "SKINNING";
  ModelType[ModelType["BAKED_SKINNING"] = 2] = "BAKED_SKINNING";
  ModelType[ModelType["BATCH_2D"] = 3] = "BATCH_2D";
  ModelType[ModelType["PARTICLE_BATCH"] = 4] = "PARTICLE_BATCH";
  ModelType[ModelType["LINE"] = 5] = "LINE";
})(ModelType || (ModelType = {}));
var lightmapSamplerHash = new SamplerInfo(Filter.LINEAR, Filter.LINEAR, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP);
var lightmapSamplerWithMipHash = new SamplerInfo(Filter.LINEAR, Filter.LINEAR, Filter.LINEAR, Address.CLAMP, Address.CLAMP, Address.CLAMP);
var Model = function () {
  function Model() {
    this.type = ModelType.DEFAULT;
    this.scene = null;
    this.isDynamicBatching = false;
    this._worldBounds = null;
    this._modelBounds = null;
    this._subModels = [];
    this._node = null;
    this._transform = null;
    this._inited = false;
    this._descriptorSetCount = 1;
    this._updateStamp = -1;
    this._localDataUpdated = true;
    this._localData = new Float32Array(UBOLocalEnum.COUNT);
    this._localBuffer = null;
    this._localSHData = null;
    this._localSHBuffer = null;
    this._lightmap = null;
    this._lightmapUVParam = v4();
    this._tetrahedronIndex = -1;
    this._lastWorldBoundCenter = v3(Infinity, Infinity, Infinity);
    this._useLightProbe = false;
    this._worldBoundBuffer = null;
    this._receiveShadow = false;
    this._castShadow = false;
    this._receiveDirLight = true;
    this._shadowBias = 0;
    this._shadowNormalBias = 0;
    this._reflectionProbeId = -1;
    this._reflectionProbeBlendId = -1;
    this._reflectionProbeBlendWeight = 0;
    this._enabled = true;
    this._visFlags = Layers.Enum.NONE;
    this._priority = 0;
    this._bakeToReflectionProbe = true;
    this._reflectionProbeType = ReflectionProbeType.NONE;
    this._device = deviceManager.gfxDevice;
  }
  var _proto = Model.prototype;
  _proto.initialize = function initialize() {
    if (this._inited) {
      return;
    }
    this._receiveShadow = true;
    this.castShadow = false;
    this.enabled = true;
    this.visFlags = Layers.Enum.NONE;
    this._inited = true;
    this._bakeToReflectionProbe = true;
    this._reflectionProbeType = ReflectionProbeType.NONE;
  };
  _proto.destroy = function destroy() {
    var subModels = this._subModels;
    for (var i = 0; i < subModels.length; i++) {
      this._subModels[i].destroy();
    }
    if (this._localBuffer) {
      this._localBuffer.destroy();
      this._localBuffer = null;
    }
    if (this._localSHBuffer) {
      this._localSHBuffer.destroy();
      this._localSHBuffer = null;
    }
    if (this._worldBoundBuffer) {
      this._worldBoundBuffer.destroy();
      this._worldBoundBuffer = null;
    }
    this._worldBounds = null;
    this._modelBounds = null;
    this._subModels.length = 0;
    this._inited = false;
    this._localDataUpdated = true;
    this._transform = null;
    this._node = null;
    this.isDynamicBatching = false;
  };
  _proto.attachToScene = function attachToScene(scene) {
    this.scene = scene;
    this._localDataUpdated = true;
  };
  _proto.detachFromScene = function detachFromScene() {
    this.scene = null;
  };
  _proto.updateTransform = function updateTransform(stamp) {
    var node = this.transform;
    if (node.hasChangedFlags || node.isTransformDirty()) {
      node.updateWorldTransform();
      this._localDataUpdated = true;
      var worldBounds = this._worldBounds;
      if (this._modelBounds && worldBounds) {
        this._modelBounds.transform(node._mat, node._pos, node._rot, node._scale, worldBounds);
      }
    }
  };
  _proto.updateWorldBound = function updateWorldBound() {
    var node = this.transform;
    if (node !== null) {
      node.updateWorldTransform();
      this._localDataUpdated = true;
      var worldBounds = this._worldBounds;
      if (this._modelBounds && worldBounds) {
        this._modelBounds.transform(node._mat, node._pos, node._rot, node._scale, worldBounds);
      }
    }
  };
  _proto.updateUBOs = function updateUBOs(stamp) {
    var subModels = this._subModels;
    for (var i = 0; i < subModels.length; i++) {
      subModels[i].update();
    }
    this._updateStamp = stamp;
    this.updateSHUBOs();
    var shadows = this.node.scene.globals.shadows;
    var forceUpdateUBO = shadows.enabled && shadows.type === ShadowType.Planar;
    if (!this._localDataUpdated) {
      return;
    }
    this._localDataUpdated = false;
    var worldMatrix = this.transform._mat;
    var hasNonInstancingPass = false;
    for (var _i = 0; _i < subModels.length; _i++) {
      var subModel = subModels[_i];
      var idx = subModel.instancedWorldMatrixIndex;
      if (idx >= 0) {
        subModel.updateInstancedWorldMatrix(worldMatrix, idx);
      } else {
        hasNonInstancingPass = true;
      }
    }
    if ((hasNonInstancingPass || forceUpdateUBO) && this._localBuffer) {
      Mat4.toArray(this._localData, worldMatrix, UBOLocalEnum.MAT_WORLD_OFFSET);
      Mat4.invert(m4_1, worldMatrix);
      Mat4.transpose(m4_1, m4_1);
      Mat4.toArray(this._localData, m4_1, UBOLocalEnum.MAT_WORLD_IT_OFFSET);
      this._localBuffer.update(this._localData);
    }
  };
  _proto.invalidateLocalData = function invalidateLocalData() {
    this._localDataUpdated = true;
  };
  _proto.showTetrahedron = function showTetrahedron() {
    return this.isLightProbeAvailable();
  };
  _proto.isLightProbeAvailable = function isLightProbeAvailable() {
    if (!this._useLightProbe) {
      return false;
    }
    var lightProbes = getPipelineSceneData().lightProbes;
    if (!lightProbes || lightProbes.empty()) {
      return false;
    }
    if (!this._worldBounds) {
      return false;
    }
    return true;
  };
  _proto.updateSHBuffer = function updateSHBuffer() {
    if (!this._localSHData) {
      return;
    }
    var subModels = this._subModels;
    var hasNonInstancingPass = false;
    for (var i = 0; i < subModels.length; i++) {
      var subModel = subModels[i];
      var idx = subModel.instancedSHIndex;
      if (idx >= 0) {
        subModel.updateInstancedSH(this._localSHData, idx);
      } else {
        hasNonInstancingPass = true;
      }
    }
    if (hasNonInstancingPass && this._localSHBuffer) {
      this._localSHBuffer.update(this._localSHData);
    }
  };
  _proto.clearSHUBOs = function clearSHUBOs() {
    if (!this._localSHData) {
      return;
    }
    for (var i = 0; i < UBOSHEnum.COUNT; i++) {
      this._localSHData[i] = 0.0;
    }
    this.updateSHBuffer();
  };
  _proto.updateSHUBOs = function updateSHUBOs() {
    if (!this.isLightProbeAvailable()) {
      return;
    }
    var center = this._worldBounds.center;
    if (center.equals(this._lastWorldBoundCenter, EPSILON)) {
      return;
    }
    var coefficients = [];
    var weights = new Vec4();
    var lightProbes = cclegacy.director.root.pipeline.pipelineSceneData.lightProbes;
    this._lastWorldBoundCenter.set(center);
    this._tetrahedronIndex = lightProbes.data.getInterpolationWeights(center, this._tetrahedronIndex, weights);
    var result = lightProbes.data.getInterpolationSHCoefficients(this._tetrahedronIndex, weights, coefficients);
    if (!result) {
      return;
    }
    if (!this._localSHData) {
      return;
    }
    var SHCls = cclegacy.internal.SH;
    SHCls.reduceRinging(coefficients, lightProbes.reduceRinging);
    SHCls.updateUBOData(this._localSHData, UBOSHEnum.SH_LINEAR_CONST_R_OFFSET, coefficients);
    this.updateSHBuffer();
  };
  _proto.createBoundingShape = function createBoundingShape(minPos, maxPos) {
    if (!minPos || !maxPos) {
      return;
    }
    if (!this._modelBounds) {
      this._modelBounds = AABB.create();
    }
    if (!this._worldBounds) {
      this._worldBounds = AABB.create();
    }
    AABB.fromPoints(this._modelBounds, minPos, maxPos);
    this._worldBounds.copy(this._modelBounds);
  };
  _proto._createSubModel = function _createSubModel() {
    return new SubModel();
  };
  _proto.initSubModel = function initSubModel(idx, subMeshData, mat) {
    this.initialize();
    if (this._subModels[idx] == null) {
      this._subModels[idx] = this._createSubModel();
    } else {
      this._subModels[idx].destroy();
    }
    this._subModels[idx].initialize(subMeshData, mat.passes, this.getMacroPatches(idx));
    this._updateAttributesAndBinding(idx);
  };
  _proto.setSubModelMesh = function setSubModelMesh(idx, subMesh) {
    if (!this._subModels[idx]) {
      return;
    }
    this._subModels[idx].subMesh = subMesh;
  };
  _proto.setSubModelMaterial = function setSubModelMaterial(idx, mat) {
    if (!this._subModels[idx]) {
      return;
    }
    this._subModels[idx].passes = mat.passes;
    this._updateAttributesAndBinding(idx);
  };
  _proto.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {
    var subModels = this._subModels;
    for (var i = 0; i < subModels.length; i++) {
      subModels[i].onPipelineStateChanged();
    }
  };
  _proto.onMacroPatchesStateChanged = function onMacroPatchesStateChanged() {
    var subModels = this._subModels;
    for (var i = 0; i < subModels.length; i++) {
      subModels[i].onMacroPatchesStateChanged(this.getMacroPatches(i));
    }
  };
  _proto.onGeometryChanged = function onGeometryChanged() {
    var subModels = this._subModels;
    for (var i = 0; i < subModels.length; i++) {
      subModels[i].onGeometryChanged();
    }
  };
  _proto.initLightingmap = function initLightingmap(texture, uvParam) {
    this._lightmap = texture;
    this._lightmapUVParam = uvParam;
  };
  _proto.updateLightingmap = function updateLightingmap(texture, uvParam) {
    Vec4.toArray(this._localData, uvParam, UBOLocalEnum.LIGHTINGMAP_UVPARAM);
    this._localDataUpdated = true;
    this._lightmap = texture;
    this._lightmapUVParam = uvParam;
    this.onMacroPatchesStateChanged();
    if (!texture) {
      texture = builtinResMgr.get('empty-texture');
    }
    var gfxTexture = texture.getGFXTexture();
    if (gfxTexture) {
      var sampler = this._device.getSampler(texture.mipmaps.length > 1 ? lightmapSamplerWithMipHash : lightmapSamplerHash);
      var subModels = this._subModels;
      for (var i = 0; i < subModels.length; i++) {
        var descriptorSet = subModels[i].descriptorSet;
        descriptorSet.bindTexture(UNIFORM_LIGHTMAP_TEXTURE_BINDING, gfxTexture);
        descriptorSet.bindSampler(UNIFORM_LIGHTMAP_TEXTURE_BINDING, sampler);
        descriptorSet.update();
      }
    }
  };
  _proto.updateReflectionProbeCubemap = function updateReflectionProbeCubemap(texture) {
    this._localDataUpdated = true;
    this.onMacroPatchesStateChanged();
    if (!texture) {
      texture = builtinResMgr.get('default-cube-texture');
    }
    var gfxTexture = texture.getGFXTexture();
    if (gfxTexture) {
      var reflectionSampler = this._device.getSampler(texture.getSamplerInfo());
      var subModels = this._subModels;
      for (var i = 0; i < subModels.length; i++) {
        var descriptorSet = subModels[i].descriptorSet;
        if (descriptorSet) {
          descriptorSet.bindSampler(UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING, reflectionSampler);
          descriptorSet.bindTexture(UNIFORM_REFLECTION_PROBE_CUBEMAP_BINDING, gfxTexture);
          descriptorSet.update();
        }
      }
    }
  };
  _proto.updateReflectionProbeBlendCubemap = function updateReflectionProbeBlendCubemap(texture) {
    {
      return;
    }
  };
  _proto.updateReflectionProbePlanarMap = function updateReflectionProbePlanarMap(texture) {
    this._localDataUpdated = true;
    this.onMacroPatchesStateChanged();
    var sampler = this._device.getSampler(new SamplerInfo(Filter.LINEAR, Filter.LINEAR, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP));
    if (!texture) {
      texture = builtinResMgr.get('empty-texture').getGFXTexture();
    }
    if (texture) {
      var subModels = this._subModels;
      for (var i = 0; i < subModels.length; i++) {
        var descriptorSet = subModels[i].descriptorSet;
        if (descriptorSet) {
          descriptorSet.bindTexture(UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING, texture);
          descriptorSet.bindSampler(UNIFORM_REFLECTION_PROBE_TEXTURE_BINDING, sampler);
          descriptorSet.update();
        }
      }
    }
  };
  _proto.updateReflectionProbeDataMap = function updateReflectionProbeDataMap(texture) {
    this._localDataUpdated = true;
    this.onMacroPatchesStateChanged();
    if (!texture) {
      texture = builtinResMgr.get('empty-texture');
    }
    var gfxTexture = texture.getGFXTexture();
    if (gfxTexture) {
      var subModels = this._subModels;
      for (var i = 0; i < subModels.length; i++) {
        var descriptorSet = subModels[i].descriptorSet;
        if (descriptorSet) {
          descriptorSet.bindTexture(UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING, gfxTexture);
          descriptorSet.bindSampler(UNIFORM_REFLECTION_PROBE_DATA_MAP_BINDING, texture.getGFXSampler());
          descriptorSet.update();
        }
      }
    }
  };
  _proto.updateLocalShadowBias = function updateLocalShadowBias() {
    var sv = this._localData;
    sv[UBOLocalEnum.LOCAL_SHADOW_BIAS + 0] = this._shadowBias;
    sv[UBOLocalEnum.LOCAL_SHADOW_BIAS + 1] = this._shadowNormalBias;
    this._localDataUpdated = true;
  };
  _proto.updateReflectionProbeId = function updateReflectionProbeId() {
    var sv = this._localData;
    sv[UBOLocalEnum.LOCAL_SHADOW_BIAS + 2] = this._reflectionProbeId;
    sv[UBOLocalEnum.LOCAL_SHADOW_BIAS + 3] = this._reflectionProbeBlendId;
    var probe = null;
    var blendProbe = null;
    if (cclegacy.internal.reflectionProbeManager) {
      probe = cclegacy.internal.reflectionProbeManager.getProbeById(this._reflectionProbeId);
      blendProbe = cclegacy.internal.reflectionProbeManager.getProbeById(this._reflectionProbeBlendId);
    }
    if (probe) {
      if (probe.probeType === ProbeType.PLANAR) {
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA1] = probe.node.up.x;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA1 + 1] = probe.node.up.y;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA1 + 2] = probe.node.up.z;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA1 + 3] = 1.0;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA2] = 1.0;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA2 + 1] = 0.0;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA2 + 2] = 0.0;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA2 + 3] = 1.0;
      } else {
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA1] = probe.node.worldPosition.x;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA1 + 1] = probe.node.worldPosition.y;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA1 + 2] = probe.node.worldPosition.z;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA1 + 3] = 0.0;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA2] = probe.size.x;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA2 + 1] = probe.size.y;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA2 + 2] = probe.size.z;
        var mipAndUseRGBE = probe.isRGBE() ? 1000 : 0;
        sv[UBOLocalEnum.REFLECTION_PROBE_DATA2 + 3] = probe.cubemap ? probe.cubemap.mipmapLevel + mipAndUseRGBE : 1.0 + mipAndUseRGBE;
      }
      if (this._reflectionProbeType === ReflectionProbeType.BLEND_PROBES || this._reflectionProbeType === ReflectionProbeType.BLEND_PROBES_AND_SKYBOX) {
        if (blendProbe) {
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA1] = blendProbe.node.worldPosition.x;
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA1 + 1] = blendProbe.node.worldPosition.y;
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA1 + 2] = blendProbe.node.worldPosition.z;
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA1 + 3] = this.reflectionProbeBlendWeight;
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA2] = blendProbe.size.x;
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA2 + 1] = blendProbe.size.y;
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA2 + 2] = blendProbe.size.z;
          var _mipAndUseRGBE = blendProbe.isRGBE() ? 1000 : 0;
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA2 + 3] = blendProbe.cubemap ? blendProbe.cubemap.mipmapLevel + _mipAndUseRGBE : 1.0 + _mipAndUseRGBE;
        } else if (this._reflectionProbeType === ReflectionProbeType.BLEND_PROBES_AND_SKYBOX) {
          sv[UBOLocalEnum.REFLECTION_PROBE_BLEND_DATA1 + 3] = this.reflectionProbeBlendWeight;
        }
      }
    }
    this._localDataUpdated = true;
  };
  _proto.getMacroPatches = function getMacroPatches(subModelIndex) {
    var patches = this.receiveShadow ? shadowMapPatches : null;
    if (this._lightmap != null && this.node && this.node.scene) {
      var sceneGlobals = this.node.scene.globals;
      if (!sceneGlobals.disableLightmap) {
        var mainLightIsStationary = sceneGlobals.bakedWithStationaryMainLight;
        var lightmapPathes = mainLightIsStationary ? stationaryLightMapPatches : staticLightMapPatches;
        patches = patches ? patches.concat(lightmapPathes) : lightmapPathes;
        if (sceneGlobals.bakedWithHighpLightmap) {
          patches = patches.concat(highpLightMapPatches);
        }
      }
    }
    if (this._useLightProbe) {
      patches = patches ? patches.concat(lightProbePatches) : lightProbePatches;
    }
    var reflectionProbePatches = [{
      name: CC_USE_REFLECTION_PROBE,
      value: this._reflectionProbeType
    }];
    patches = patches ? patches.concat(reflectionProbePatches) : reflectionProbePatches;
    var receiveDirLightPatches = [{
      name: CC_DISABLE_DIRECTIONAL_LIGHT,
      value: !this._receiveDirLight
    }];
    patches = patches ? patches.concat(receiveDirLightPatches) : receiveDirLightPatches;
    return patches;
  };
  _proto._updateAttributesAndBinding = function _updateAttributesAndBinding(subModelIndex) {
    var subModel = this._subModels[subModelIndex];
    if (!subModel) {
      return;
    }
    this._initLocalDescriptors(subModelIndex);
    this._updateLocalDescriptors(subModelIndex, subModel.descriptorSet);
    this._initLocalSHDescriptors(subModelIndex);
    this._updateLocalSHDescriptors(subModelIndex, subModel.descriptorSet);
    this._initWorldBoundDescriptors(subModelIndex);
    if (subModel.worldBoundDescriptorSet) {
      this._updateWorldBoundDescriptors(subModelIndex, subModel.worldBoundDescriptorSet);
    }
    var attributes = [];
    var attributeSet = new Set();
    subModel.passes.forEach(function (pass) {
      var shader = pass.getShaderVariant(subModel.patches);
      shader.attributes.forEach(function (attr) {
        if (!attributeSet.has(attr.name)) {
          attributes.push(attr);
          attributeSet.add(attr.name);
        }
      });
    });
    this._updateInstancedAttributes(attributes, subModel);
  };
  _proto._updateInstancedAttributes = function _updateInstancedAttributes(attributes, subModel) {
    subModel.UpdateInstancedAttributes(attributes);
    this._localDataUpdated = true;
  };
  _proto._initLocalDescriptors = function _initLocalDescriptors(subModelIndex) {
    if (!this._localBuffer) {
      this._localBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, UBOLocalEnum.SIZE, UBOLocalEnum.SIZE));
    }
  };
  _proto._initLocalSHDescriptors = function _initLocalSHDescriptors(subModelIndex) {
    if (!this._useLightProbe) {
      return;
    }
    if (!this._localSHData) {
      this._localSHData = new Float32Array(UBOSHEnum.COUNT);
    }
    if (!this._localSHBuffer) {
      this._localSHBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, UBOSHEnum.SIZE, UBOSHEnum.SIZE));
    }
  };
  _proto._initWorldBoundDescriptors = function _initWorldBoundDescriptors(subModelIndex) {
    if (!this._worldBoundBuffer) {
      this._worldBoundBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, UBOWorldBound.SIZE, UBOWorldBound.SIZE));
    }
  };
  _proto._updateLocalDescriptors = function _updateLocalDescriptors(subModelIndex, descriptorSet) {
    if (this._localBuffer) descriptorSet.bindBuffer(UBOLocalEnum.BINDING, this._localBuffer);
  };
  _proto._updateLocalSHDescriptors = function _updateLocalSHDescriptors(subModelIndex, descriptorSet) {
    if (this._localSHBuffer) descriptorSet.bindBuffer(UBOSHEnum.BINDING, this._localSHBuffer);
  };
  _proto._updateWorldBoundDescriptors = function _updateWorldBoundDescriptors(subModelIndex, descriptorSet) {
    if (this._worldBoundBuffer) descriptorSet.bindBuffer(UBOWorldBound.BINDING, this._worldBoundBuffer);
  };
  return _createClass(Model, [{
    key: "subModels",
    get: function get() {
      return this._subModels;
    }
  }, {
    key: "inited",
    get: function get() {
      return this._inited;
    }
  }, {
    key: "worldBounds",
    get: function get() {
      return this._worldBounds;
    }
  }, {
    key: "modelBounds",
    get: function get() {
      return this._modelBounds;
    }
  }, {
    key: "localBuffer",
    get: function get() {
      return this._localBuffer;
    }
  }, {
    key: "localSHBuffer",
    get: function get() {
      return this._localSHBuffer;
    }
  }, {
    key: "worldBoundBuffer",
    get: function get() {
      return this._worldBoundBuffer;
    }
  }, {
    key: "updateStamp",
    get: function get() {
      return this._updateStamp;
    }
  }, {
    key: "useLightProbe",
    get: function get() {
      return this._useLightProbe;
    },
    set: function set(val) {
      this._useLightProbe = val;
      this.onMacroPatchesStateChanged();
    }
  }, {
    key: "tetrahedronIndex",
    get: function get() {
      return this._tetrahedronIndex;
    },
    set: function set(index) {
      this._tetrahedronIndex = index;
    }
  }, {
    key: "shadowBias",
    get: function get() {
      return this._shadowBias;
    },
    set: function set(val) {
      this._shadowBias = val;
    }
  }, {
    key: "shadowNormalBias",
    get: function get() {
      return this._shadowNormalBias;
    },
    set: function set(val) {
      this._shadowNormalBias = val;
    }
  }, {
    key: "receiveShadow",
    get: function get() {
      return this._receiveShadow;
    },
    set: function set(val) {
      this._receiveShadow = val;
      this.onMacroPatchesStateChanged();
    }
  }, {
    key: "castShadow",
    get: function get() {
      return this._castShadow;
    },
    set: function set(val) {
      this._castShadow = val;
    }
  }, {
    key: "receiveDirLight",
    get: function get() {
      return this._receiveDirLight;
    },
    set: function set(val) {
      this._receiveDirLight = val;
      this.onMacroPatchesStateChanged();
    }
  }, {
    key: "node",
    get: function get() {
      return this._node;
    },
    set: function set(n) {
      this._node = n;
    }
  }, {
    key: "transform",
    get: function get() {
      return this._transform;
    },
    set: function set(n) {
      this._transform = n;
    }
  }, {
    key: "visFlags",
    get: function get() {
      return this._visFlags;
    },
    set: function set(val) {
      this._visFlags = val;
    }
  }, {
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    },
    set: function set(val) {
      this._priority = val;
    }
  }, {
    key: "bakeToReflectionProbe",
    get: function get() {
      return this._bakeToReflectionProbe;
    },
    set: function set(val) {
      this._bakeToReflectionProbe = val;
    }
  }, {
    key: "reflectionProbeType",
    get: function get() {
      return this._reflectionProbeType;
    },
    set: function set(val) {
      this._reflectionProbeType = val;
      var subModels = this._subModels;
      for (var i = 0; i < subModels.length; i++) {
        subModels[i].useReflectionProbeType = val;
      }
      this.onMacroPatchesStateChanged();
    }
  }, {
    key: "reflectionProbeId",
    get: function get() {
      return this._reflectionProbeId;
    },
    set: function set(val) {
      this._reflectionProbeId = val;
    }
  }, {
    key: "reflectionProbeBlendId",
    get: function get() {
      return this._reflectionProbeBlendId;
    },
    set: function set(val) {
      this._reflectionProbeBlendId = val;
    }
  }, {
    key: "reflectionProbeBlendWeight",
    get: function get() {
      return this._reflectionProbeBlendWeight;
    },
    set: function set(val) {
      this._reflectionProbeBlendWeight = val;
    }
  }]);
}();

var _forward$2 = new Vec3(0, 0, -1);
var _v3 = new Vec3();
var DirectionalLight = function (_Light) {
  function DirectionalLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._dir = new Vec3(1.0, -1, -1);
    _this._illuminanceHDR = Ambient.SUN_ILLUM;
    _this._illuminanceLDR = 1.0;
    _this._shadowEnabled = false;
    _this._shadowPcf = PCFType.HARD;
    _this._shadowBias = 0.00001;
    _this._shadowNormalBias = 0.0;
    _this._shadowSaturation = 1.0;
    _this._shadowDistance = 50;
    _this._shadowInvisibleOcclusionRange = 200;
    _this._csmLevel = CSMLevel.LEVEL_4;
    _this._csmNeedUpdate = false;
    _this._csmLayerLambda = 0.75;
    _this._csmOptimizationMode = CSMOptimizationMode.DisableRotationFix;
    _this._csmLayersTransition = false;
    _this._csmTransitionRange = 0.05;
    _this._shadowFixedArea = false;
    _this._shadowNear = 0.1;
    _this._shadowFar = 10.0;
    _this._shadowOrthoSize = 5;
    _this._type = LightType.DIRECTIONAL;
    return _this;
  }
  _inheritsLoose(DirectionalLight, _Light);
  var _proto = DirectionalLight.prototype;
  _proto.initialize = function initialize() {
    _Light.prototype.initialize.call(this);
    this.illuminance = Ambient.SUN_ILLUM;
    this.direction = new Vec3(1.0, -1, -1);
  };
  _proto.update = function update() {
    if (this._node && this._node.hasChangedFlags) {
      this.direction = Vec3.transformQuat(_v3, _forward$2, this._node.worldRotation);
    }
  };
  _proto.activate = function activate() {
    var root = cclegacy.director.root;
    var pipeline = root.pipeline;
    if (this._shadowEnabled) {
      if (this._shadowFixedArea || !pipeline.pipelineSceneData.csmSupported) {
        pipeline.macros.CC_DIR_LIGHT_SHADOW_TYPE = 1;
      } else if (this.csmLevel > 1 && pipeline.pipelineSceneData.csmSupported) {
        pipeline.macros.CC_DIR_LIGHT_SHADOW_TYPE = 2;
        pipeline.macros.CC_CASCADED_LAYERS_TRANSITION = this._csmLayersTransition;
      } else {
        pipeline.macros.CC_DIR_LIGHT_SHADOW_TYPE = 1;
      }
      pipeline.macros.CC_DIR_SHADOW_PCF_TYPE = this._shadowPcf;
    } else {
      pipeline.macros.CC_DIR_LIGHT_SHADOW_TYPE = 0;
    }
    root.onGlobalPipelineStateChanged();
  };
  return _createClass(DirectionalLight, [{
    key: "direction",
    get: function get() {
      return this._dir;
    },
    set: function set(dir) {
      Vec3.normalize(this._dir, dir);
    }
  }, {
    key: "illuminance",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._illuminanceHDR;
      } else {
        return this._illuminanceLDR;
      }
    },
    set: function set(value) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this.illuminanceHDR = value;
      } else {
        this.illuminanceLDR = value;
      }
    }
  }, {
    key: "illuminanceHDR",
    get: function get() {
      return this._illuminanceHDR;
    },
    set: function set(value) {
      this._illuminanceHDR = value;
    }
  }, {
    key: "illuminanceLDR",
    get: function get() {
      return this._illuminanceLDR;
    },
    set: function set(value) {
      this._illuminanceLDR = value;
    }
  }, {
    key: "shadowEnabled",
    get: function get() {
      return this._shadowEnabled;
    },
    set: function set(val) {
      this._shadowEnabled = val;
      this.activate();
    }
  }, {
    key: "shadowPcf",
    get: function get() {
      return this._shadowPcf;
    },
    set: function set(val) {
      this._shadowPcf = val;
      this.activate();
    }
  }, {
    key: "shadowBias",
    get: function get() {
      return this._shadowBias;
    },
    set: function set(val) {
      this._shadowBias = val;
    }
  }, {
    key: "shadowNormalBias",
    get: function get() {
      return this._shadowNormalBias;
    },
    set: function set(val) {
      this._shadowNormalBias = val;
    }
  }, {
    key: "shadowSaturation",
    get: function get() {
      return this._shadowSaturation;
    },
    set: function set(val) {
      this._shadowSaturation = val;
    }
  }, {
    key: "shadowDistance",
    get: function get() {
      return this._shadowDistance;
    },
    set: function set(val) {
      this._shadowDistance = Math.min(val, Shadows.MAX_FAR);
    }
  }, {
    key: "shadowInvisibleOcclusionRange",
    get: function get() {
      return this._shadowInvisibleOcclusionRange;
    },
    set: function set(val) {
      this._shadowInvisibleOcclusionRange = Math.min(val, Shadows.MAX_FAR);
    }
  }, {
    key: "csmLevel",
    get: function get() {
      return this._csmLevel;
    },
    set: function set(val) {
      this._csmLevel = val;
      this.activate();
    }
  }, {
    key: "csmNeedUpdate",
    get: function get() {
      return this._csmNeedUpdate;
    },
    set: function set(val) {
      this._csmNeedUpdate = val;
    }
  }, {
    key: "csmLayerLambda",
    get: function get() {
      return this._csmLayerLambda;
    },
    set: function set(val) {
      this._csmLayerLambda = val;
    }
  }, {
    key: "csmOptimizationMode",
    get: function get() {
      return this._csmOptimizationMode;
    },
    set: function set(val) {
      this._csmOptimizationMode = val;
    }
  }, {
    key: "shadowFixedArea",
    get: function get() {
      return this._shadowFixedArea;
    },
    set: function set(val) {
      this._shadowFixedArea = val;
      this.activate();
    }
  }, {
    key: "shadowNear",
    get: function get() {
      return this._shadowNear;
    },
    set: function set(val) {
      this._shadowNear = val;
    }
  }, {
    key: "shadowFar",
    get: function get() {
      return this._shadowFar;
    },
    set: function set(val) {
      this._shadowFar = Math.min(val, Shadows.MAX_FAR);
    }
  }, {
    key: "shadowOrthoSize",
    get: function get() {
      return this._shadowOrthoSize;
    },
    set: function set(val) {
      this._shadowOrthoSize = val;
    }
  }, {
    key: "csmLayersTransition",
    get: function get() {
      return this._csmLayersTransition;
    },
    set: function set(val) {
      this._csmLayersTransition = val;
      this.activate();
    }
  }, {
    key: "csmTransitionRange",
    get: function get() {
      return this._csmTransitionRange;
    },
    set: function set(val) {
      this._csmTransitionRange = val;
    }
  }]);
}(Light);

var SphereLight = function (_Light) {
  function SphereLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._needUpdate = false;
    _this._size = 0.15;
    _this._range = 1.0;
    _this._luminanceHDR = 0;
    _this._luminanceLDR = 0;
    _this._pos = new Vec3();
    _this._aabb = AABB.create();
    _this._type = LightType.SPHERE;
    return _this;
  }
  _inheritsLoose(SphereLight, _Light);
  var _proto = SphereLight.prototype;
  _proto.initialize = function initialize() {
    _Light.prototype.initialize.call(this);
    var size = 0.15;
    this.size = size;
    this.range = 1.0;
    this.luminanceHDR = 1700 / nt2lm(size);
    this.luminanceLDR = 1.0;
  };
  _proto.update = function update() {
    if (this._node && (this._node.hasChangedFlags || this._needUpdate)) {
      this._node.getWorldPosition(this._pos);
      var range = this._range;
      AABB.set(this._aabb, this._pos.x, this._pos.y, this._pos.z, range, range, range);
      this._needUpdate = false;
    }
  };
  return _createClass(SphereLight, [{
    key: "position",
    get: function get() {
      return this._pos;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(size) {
      this._size = size;
    }
  }, {
    key: "range",
    get: function get() {
      return this._range;
    },
    set: function set(range) {
      this._range = range;
      this._needUpdate = true;
    }
  }, {
    key: "luminance",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._luminanceHDR;
      } else {
        return this._luminanceLDR;
      }
    },
    set: function set(value) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this.luminanceHDR = value;
      } else {
        this.luminanceLDR = value;
      }
    }
  }, {
    key: "luminanceHDR",
    get: function get() {
      return this._luminanceHDR;
    },
    set: function set(value) {
      this._luminanceHDR = value;
    }
  }, {
    key: "luminanceLDR",
    set: function set(value) {
      this._luminanceLDR = value;
    }
  }, {
    key: "aabb",
    get: function get() {
      return this._aabb;
    }
  }]);
}(Light);

var _forward$1 = new Vec3(0, 0, -1);
var _qt = new Quat();
var _matView = new Mat4();
var _matProj = new Mat4();
var _matViewProj = new Mat4();
var _matViewProjInv = new Mat4();
var SpotLight = function (_Light) {
  function SpotLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._dir = new Vec3(1.0, -1, -1);
    _this._range = 5.0;
    _this._spotAngle = Math.cos(Math.PI / 6);
    _this._angleAttenuationStrength = 0;
    _this._pos = new Vec3();
    _this._aabb = AABB.create();
    _this._frustum = Frustum.create();
    _this._angle = 0;
    _this._needUpdate = false;
    _this._size = 0.15;
    _this._luminanceHDR = 0;
    _this._luminanceLDR = 0;
    _this._shadowEnabled = false;
    _this._shadowPcf = PCFType.HARD;
    _this._shadowBias = 0.00001;
    _this._shadowNormalBias = 0.0;
    _this._type = LightType.SPOT;
    return _this;
  }
  _inheritsLoose(SpotLight, _Light);
  var _proto = SpotLight.prototype;
  _proto.initialize = function initialize() {
    _Light.prototype.initialize.call(this);
    var size = 0.15;
    this.size = size;
    this.luminanceHDR = 1700 / nt2lm(size);
    this.luminanceLDR = 1.0;
    this.range = Math.cos(Math.PI / 6);
    this._dir.set(new Vec3(1.0, -1, -1));
  };
  _proto.update = function update() {
    if (this._node && (this._node.hasChangedFlags || this._needUpdate)) {
      this._node.getWorldPosition(this._pos);
      Vec3.transformQuat(this._dir, _forward$1, this._node.getWorldRotation(_qt));
      Vec3.normalize(this._dir, this._dir);
      AABB.set(this._aabb, this._pos.x, this._pos.y, this._pos.z, this._range, this._range, this._range);
      this._node.getWorldRT(_matView);
      Mat4.invert(_matView, _matView);
      Mat4.perspective(_matProj, this._angle, 1.0, 0.001, this._range);
      Mat4.multiply(_matViewProj, _matProj, _matView);
      this._frustum.update(_matViewProj, _matViewProjInv);
      this._needUpdate = false;
    }
  };
  return _createClass(SpotLight, [{
    key: "position",
    get: function get() {
      return this._pos;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(size) {
      this._size = size;
    }
  }, {
    key: "range",
    get: function get() {
      return this._range;
    },
    set: function set(range) {
      this._range = range;
      this._needUpdate = true;
    }
  }, {
    key: "luminance",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._luminanceHDR;
      } else {
        return this._luminanceLDR;
      }
    },
    set: function set(value) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this.luminanceHDR = value;
      } else {
        this.luminanceLDR = value;
      }
    }
  }, {
    key: "luminanceHDR",
    get: function get() {
      return this._luminanceHDR;
    },
    set: function set(value) {
      this._luminanceHDR = value;
    }
  }, {
    key: "luminanceLDR",
    get: function get() {
      return this._luminanceLDR;
    },
    set: function set(value) {
      this._luminanceLDR = value;
    }
  }, {
    key: "direction",
    get: function get() {
      return this._dir;
    }
  }, {
    key: "spotAngle",
    get: function get() {
      return this._spotAngle;
    },
    set: function set(val) {
      this._angle = val;
      this._spotAngle = Math.cos(val * 0.5);
      this._needUpdate = true;
    }
  }, {
    key: "angleAttenuationStrength",
    get: function get() {
      return this._angleAttenuationStrength;
    },
    set: function set(val) {
      this._angleAttenuationStrength = val;
      this._needUpdate = true;
    }
  }, {
    key: "angle",
    get: function get() {
      return this._angle;
    }
  }, {
    key: "aabb",
    get: function get() {
      return this._aabb;
    }
  }, {
    key: "frustum",
    get: function get() {
      return this._frustum;
    }
  }, {
    key: "shadowEnabled",
    get: function get() {
      return this._shadowEnabled;
    },
    set: function set(val) {
      this._shadowEnabled = val;
    }
  }, {
    key: "shadowPcf",
    get: function get() {
      return this._shadowPcf;
    },
    set: function set(val) {
      this._shadowPcf = val;
    }
  }, {
    key: "shadowBias",
    get: function get() {
      return this._shadowBias;
    },
    set: function set(val) {
      this._shadowBias = val;
    }
  }, {
    key: "shadowNormalBias",
    get: function get() {
      return this._shadowNormalBias;
    },
    set: function set(val) {
      this._shadowNormalBias = val;
    }
  }]);
}(Light);

var PointLight = function (_Light) {
  function PointLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._needUpdate = false;
    _this._range = 1.0;
    _this._luminanceHDR = 0;
    _this._luminanceLDR = 0;
    _this._pos = v3();
    _this._aabb = AABB.create();
    _this._type = LightType.POINT;
    return _this;
  }
  _inheritsLoose(PointLight, _Light);
  var _proto = PointLight.prototype;
  _proto.initialize = function initialize() {
    _Light.prototype.initialize.call(this);
    this.range = 1.0;
    this.luminanceHDR = 1700 / nt2lm(1.0);
    this.luminanceLDR = 1.0;
  };
  _proto.update = function update() {
    if (this._node && (this._node.hasChangedFlags || this._needUpdate)) {
      this._node.getWorldPosition(this._pos);
      var range = this._range;
      AABB.set(this._aabb, this._pos.x, this._pos.y, this._pos.z, range, range, range);
      this._needUpdate = false;
    }
  };
  return _createClass(PointLight, [{
    key: "position",
    get: function get() {
      return this._pos;
    }
  }, {
    key: "range",
    get: function get() {
      return this._range;
    },
    set: function set(range) {
      this._range = range;
      this._needUpdate = true;
    }
  }, {
    key: "luminance",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._luminanceHDR;
      } else {
        return this._luminanceLDR;
      }
    },
    set: function set(value) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this.luminanceHDR = value;
      } else {
        this.luminanceLDR = value;
      }
    }
  }, {
    key: "luminanceHDR",
    get: function get() {
      return this._luminanceHDR;
    },
    set: function set(value) {
      this._luminanceHDR = value;
    }
  }, {
    key: "luminanceLDR",
    set: function set(value) {
      this._luminanceLDR = value;
    }
  }, {
    key: "aabb",
    get: function get() {
      return this._aabb;
    }
  }]);
}(Light);

var _forward = new Vec3(0, 0, -1);
var RangedDirectionalLight = function (_Light) {
  function RangedDirectionalLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._dir = new Vec3(0, 0, -1);
    _this._pos = new Vec3(0, 0, 0);
    _this._scale = new Vec3(1, 1, 1);
    _this._right = new Vec3(1, 0, 0);
    _this._illuminanceHDR = Ambient.SUN_ILLUM;
    _this._illuminanceLDR = 1.0;
    _this._type = LightType.RANGED_DIRECTIONAL;
    return _this;
  }
  _inheritsLoose(RangedDirectionalLight, _Light);
  var _proto = RangedDirectionalLight.prototype;
  _proto.initialize = function initialize() {
    _Light.prototype.initialize.call(this);
    this.illuminance = Ambient.SUN_ILLUM;
  };
  _proto.update = function update() {
    if (this._node && this._node.hasChangedFlags) {
      this._node.getWorldPosition(this._pos);
      this._node.getWorldScale(this._scale);
      Vec3.transformQuat(this._dir, _forward, this._node.worldRotation);
      Vec3.transformQuat(this._right, Vec3.RIGHT, this._node.worldRotation);
    }
  };
  return _createClass(RangedDirectionalLight, [{
    key: "direction",
    get: function get() {
      return this._dir;
    }
  }, {
    key: "right",
    get: function get() {
      return this._right;
    }
  }, {
    key: "position",
    get: function get() {
      return this._pos;
    }
  }, {
    key: "scale",
    get: function get() {
      return this._scale;
    }
  }, {
    key: "illuminance",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._illuminanceHDR;
      } else {
        return this._illuminanceLDR;
      }
    },
    set: function set(value) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this.illuminanceHDR = value;
      } else {
        this.illuminanceLDR = value;
      }
    }
  }, {
    key: "illuminanceHDR",
    get: function get() {
      return this._illuminanceHDR;
    },
    set: function set(value) {
      this._illuminanceHDR = value;
    }
  }, {
    key: "illuminanceLDR",
    get: function get() {
      return this._illuminanceLDR;
    },
    set: function set(value) {
      this._illuminanceLDR = value;
    }
  }]);
}(Light);

var LODData = function () {
  function LODData() {
    this.screenUsagePercentage = 1.0;
    this._models = [];
  }
  var _proto = LODData.prototype;
  _proto.addModel = function addModel(model) {
    this._models.splice(0, 0, model);
  };
  _proto.eraseModel = function eraseModel(model) {
    var removeIndex = this._models.indexOf(model);
    if (removeIndex >= 0) {
      this._models.splice(removeIndex, 1);
    }
  };
  _proto.clearModels = function clearModels() {
    this._models.length = 0;
  };
  return _createClass(LODData, [{
    key: "models",
    get: function get() {
      return this._models;
    }
  }]);
}();
var LODGroup = function () {
  function LODGroup() {
    this.scene = void 0;
    this.node = null;
    this.enabled = true;
    this._localBoundaryCenter = v3(0, 0, 0);
    this._objectSize = 1;
    this._lodDataArray = [];
    this._lockedLODLevelVec = [];
    this._isLockLevelChanged = false;
    this._device = deviceManager.gfxDevice;
  }
  var _proto2 = LODGroup.prototype;
  _proto2.attachToScene = function attachToScene(scene) {
    this.scene = scene;
  };
  _proto2.detachFromScene = function detachFromScene() {
    this.scene = null;
  };
  _proto2.lockLODLevels = function lockLODLevels(lockLev) {
    if (lockLev.length !== this._lockedLODLevelVec.length) {
      this._isLockLevelChanged = true;
    } else {
      var size = lockLev.length;
      var index = 0;
      for (; index < size; index++) {
        if (lockLev[index] !== this._lockedLODLevelVec[index]) {
          this._isLockLevelChanged = true;
          break;
        }
      }
    }
    this._lockedLODLevelVec = lockLev.slice();
  };
  _proto2.isLockLevelChanged = function isLockLevelChanged() {
    return this._isLockLevelChanged;
  };
  _proto2.resetLockChangeFlag = function resetLockChangeFlag() {
    this._isLockLevelChanged = false;
  };
  _proto2.getLockedLODLevels = function getLockedLODLevels() {
    return this._lockedLODLevelVec;
  };
  _proto2.clearLODs = function clearLODs() {
    this._lodDataArray.length = 0;
  };
  _proto2.insertLOD = function insertLOD(index, lod) {
    this._lodDataArray.splice(index, 0, lod);
  };
  _proto2.updateLOD = function updateLOD(index, lod) {
    this._lodDataArray[index] = lod;
  };
  _proto2.eraseLOD = function eraseLOD(index) {
    this._lodDataArray.splice(index, 1);
  };
  _proto2.getVisibleLODLevel = function getVisibleLODLevel(camera) {
    var screenUsagePercentage = this.getScreenUsagePercentage(camera);
    var lodIndex = -1;
    for (var i = 0; i < this.lodCount; ++i) {
      var lod = this.lodDataArray[i];
      if (screenUsagePercentage >= lod.screenUsagePercentage) {
        lodIndex = i;
        break;
      }
    }
    return lodIndex;
  };
  _proto2.getScreenUsagePercentage = function getScreenUsagePercentage(camera) {
    if (!this.node) return 0;
    var distance;
    if (camera.projectionType === CameraProjection.PERSPECTIVE) {
      distance = Vec3.len(this.localBoundaryCenter.transformMat4(this.node.worldMatrix).subtract(camera.node.worldPosition));
    }
    return this.distanceToScreenUsagePercentage(camera, distance, this.getWorldSpaceSize());
  };
  _proto2.distanceToScreenUsagePercentage = function distanceToScreenUsagePercentage(camera, distance, size) {
    if (camera.projectionType === CameraProjection.PERSPECTIVE) {
      assertIsTrue(typeof distance === 'number', 'distance must be present for perspective projection');
      return size * camera.matProj.m05 / (distance * 2.0);
    } else {
      return size * camera.matProj.m05 * 0.5;
    }
  };
  _proto2.getWorldSpaceSize = function getWorldSpaceSize() {
    var scale = this.node.scale;
    var maxScale = Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z));
    return maxScale * this.objectSize;
  };
  return _createClass(LODGroup, [{
    key: "localBoundaryCenter",
    get: function get() {
      return this._localBoundaryCenter.clone();
    },
    set: function set(val) {
      this._localBoundaryCenter.set(val);
    }
  }, {
    key: "lodCount",
    get: function get() {
      return this._lodDataArray.length;
    }
  }, {
    key: "objectSize",
    get: function get() {
      return this._objectSize;
    },
    set: function set(val) {
      this._objectSize = val;
    }
  }, {
    key: "lodDataArray",
    get: function get() {
      return this._lodDataArray;
    }
  }]);
}();

var RenderScene = function () {
  function RenderScene(root) {
    this._name = '';
    this._cameras = [];
    this._models = [];
    this._lodGroups = [];
    this._batches = [];
    this._directionalLights = [];
    this._sphereLights = [];
    this._spotLights = [];
    this._pointLights = [];
    this._rangedDirLights = [];
    this._mainLight = null;
    this._modelId = 0;
    this._lodStateCache = null;
    this._root = root;
  }
  RenderScene.registerCreateFunc = function registerCreateFunc(root) {
    root._createSceneFun = function (_root) {
      return new RenderScene(_root);
    };
  };
  var _proto = RenderScene.prototype;
  _proto.initialize = function initialize(info) {
    this._name = info.name;
    this._lodStateCache = new LodStateCache(this);
    return true;
  };
  _proto.update = function update(stamp) {
    var mainLight = this._mainLight;
    if (mainLight) {
      mainLight.update();
    }
    var sphereLights = this._sphereLights;
    for (var i = 0; i < sphereLights.length; i++) {
      var light = sphereLights[i];
      light.update();
    }
    var spotLights = this._spotLights;
    for (var _i = 0; _i < spotLights.length; _i++) {
      var _light = spotLights[_i];
      _light.update();
    }
    var pointLights = this._pointLights;
    for (var _i2 = 0; _i2 < pointLights.length; _i2++) {
      var _light2 = pointLights[_i2];
      _light2.update();
    }
    var rangedDirLights = this._rangedDirLights;
    for (var _i3 = 0; _i3 < rangedDirLights.length; _i3++) {
      var _light3 = rangedDirLights[_i3];
      _light3.update();
    }
    var models = this._models;
    for (var _i4 = 0; _i4 < models.length; _i4++) {
      var model = models[_i4];
      if (model.enabled) {
        model.updateTransform(stamp);
        model.updateUBOs(stamp);
      }
    }
    this._lodStateCache.updateLodState();
  };
  _proto.destroy = function destroy() {
    this.removeCameras();
    this.removeSphereLights();
    this.removeSpotLights();
    this.removeRangedDirLights();
    this.removeModels();
    this.removeLODGroups();
    this._lodStateCache.clearCache();
  };
  _proto.isCulledByLod = function isCulledByLod(camera, model) {
    return this._lodStateCache.isLodModelCulled(camera, model);
  };
  _proto.addCamera = function addCamera(cam) {
    cam.attachToScene(this);
    this._cameras.push(cam);
    this._lodStateCache.addCamera(cam);
  };
  _proto.removeCamera = function removeCamera(camera) {
    for (var i = 0; i < this._cameras.length; ++i) {
      if (this._cameras[i] === camera) {
        this._cameras.splice(i, 1);
        camera.detachFromScene();
        this._lodStateCache.removeCamera(camera);
        return;
      }
    }
  };
  _proto.removeCameras = function removeCameras() {
    var _this = this;
    this._cameras.forEach(function (camera) {
      camera.detachFromScene();
      _this._lodStateCache.removeCamera(camera);
    });
    this._cameras.length = 0;
  };
  _proto.setMainLight = function setMainLight(dl) {
    this._mainLight = dl;
    if (this._mainLight) this._mainLight.activate();
  };
  _proto.unsetMainLight = function unsetMainLight(dl) {
    if (this._mainLight === dl) {
      var dlList = this._directionalLights;
      if (dlList.length) {
        this.setMainLight(dlList[dlList.length - 1]);
        if (this._mainLight.node) {
          this._mainLight.node.hasChangedFlags |= TransformBit.ROTATION;
        }
        return;
      }
      this.setMainLight(null);
    }
  };
  _proto.addDirectionalLight = function addDirectionalLight(dl) {
    dl.attachToScene(this);
    this._directionalLights.push(dl);
  };
  _proto.removeDirectionalLight = function removeDirectionalLight(dl) {
    for (var i = 0; i < this._directionalLights.length; ++i) {
      if (this._directionalLights[i] === dl) {
        dl.detachFromScene();
        this._directionalLights.splice(i, 1);
        return;
      }
    }
  };
  _proto.addSphereLight = function addSphereLight(pl) {
    pl.attachToScene(this);
    this._sphereLights.push(pl);
  };
  _proto.removeSphereLight = function removeSphereLight(pl) {
    for (var i = 0; i < this._sphereLights.length; ++i) {
      if (this._sphereLights[i] === pl) {
        pl.detachFromScene();
        this._sphereLights.splice(i, 1);
        return;
      }
    }
  };
  _proto.addSpotLight = function addSpotLight(sl) {
    sl.attachToScene(this);
    this._spotLights.push(sl);
  };
  _proto.removeSpotLight = function removeSpotLight(sl) {
    for (var i = 0; i < this._spotLights.length; ++i) {
      if (this._spotLights[i] === sl) {
        sl.detachFromScene();
        this._spotLights.splice(i, 1);
        return;
      }
    }
  };
  _proto.removeSphereLights = function removeSphereLights() {
    for (var i = 0; i < this._sphereLights.length; ++i) {
      this._sphereLights[i].detachFromScene();
    }
    this._sphereLights.length = 0;
  };
  _proto.removeSpotLights = function removeSpotLights() {
    for (var i = 0; i < this._spotLights.length; ++i) {
      this._spotLights[i].detachFromScene();
    }
    this._spotLights.length = 0;
  };
  _proto.addPointLight = function addPointLight(pl) {
    pl.attachToScene(this);
    this._pointLights.push(pl);
  };
  _proto.removePointLight = function removePointLight(pl) {
    for (var i = 0; i < this._pointLights.length; ++i) {
      if (this._pointLights[i] === pl) {
        pl.detachFromScene();
        this._pointLights.splice(i, 1);
        return;
      }
    }
  };
  _proto.removePointLights = function removePointLights() {
    for (var i = 0; i < this._pointLights.length; ++i) {
      this._pointLights[i].detachFromScene();
    }
    this._pointLights.length = 0;
  };
  _proto.addRangedDirLight = function addRangedDirLight(l) {
    l.attachToScene(this);
    this._rangedDirLights.push(l);
  };
  _proto.removeRangedDirLight = function removeRangedDirLight(l) {
    for (var i = 0; i < this._rangedDirLights.length; ++i) {
      if (this._rangedDirLights[i] === l) {
        l.detachFromScene();
        this._rangedDirLights.splice(i, 1);
        return;
      }
    }
  };
  _proto.removeRangedDirLights = function removeRangedDirLights() {
    for (var i = 0; i < this._rangedDirLights.length; ++i) {
      this._rangedDirLights[i].detachFromScene();
    }
    this._rangedDirLights.length = 0;
  };
  _proto.addModel = function addModel(m) {
    m.attachToScene(this);
    this._models.push(m);
  };
  _proto.removeModel = function removeModel(model) {
    for (var i = 0; i < this._models.length; ++i) {
      if (this._models[i] === model) {
        this._lodStateCache.removeModel(model);
        model.detachFromScene();
        this._models.splice(i, 1);
        return;
      }
    }
  };
  _proto.removeModels = function removeModels() {
    var _this2 = this;
    this._models.forEach(function (m) {
      _this2._lodStateCache.removeModel(m);
      m.detachFromScene();
      m.destroy();
    });
    this._models.length = 0;
  };
  _proto.addBatch = function addBatch(batch) {
    this._batches.push(batch);
  };
  _proto.removeBatch = function removeBatch(batch) {
    for (var i = 0; i < this._batches.length; ++i) {
      if (this._batches[i] === batch) {
        this._batches.splice(i, 1);
        return;
      }
    }
  };
  _proto.removeBatches = function removeBatches() {
    this._batches.length = 0;
  };
  _proto.addLODGroup = function addLODGroup(lodGroup) {
    this._lodGroups.push(lodGroup);
    lodGroup.attachToScene(this);
    this._lodStateCache.addLodGroup(lodGroup);
  };
  _proto.removeLODGroup = function removeLODGroup(lodGroup) {
    var index = this._lodGroups.indexOf(lodGroup);
    if (index >= 0) {
      this._lodGroups.splice(index, 1);
      lodGroup.detachFromScene();
      this._lodStateCache.removeLodGroup(lodGroup);
    }
  };
  _proto.removeLODGroups = function removeLODGroups() {
    var _this3 = this;
    this._lodGroups.forEach(function (group) {
      _this3._lodStateCache.removeLodGroup(group);
    });
    this._lodGroups.length = 0;
  };
  _proto.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {
    this._models.forEach(function (m) {
      m.onGlobalPipelineStateChanged();
    });
  };
  _proto.generateModelId = function generateModelId() {
    return this._modelId++;
  };
  return _createClass(RenderScene, [{
    key: "root",
    get: function get() {
      return this._root;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "cameras",
    get: function get() {
      return this._cameras;
    }
  }, {
    key: "mainLight",
    get: function get() {
      return this._mainLight;
    }
  }, {
    key: "sphereLights",
    get: function get() {
      return this._sphereLights;
    }
  }, {
    key: "spotLights",
    get: function get() {
      return this._spotLights;
    }
  }, {
    key: "pointLights",
    get: function get() {
      return this._pointLights;
    }
  }, {
    key: "rangedDirLights",
    get: function get() {
      return this._rangedDirLights;
    }
  }, {
    key: "models",
    get: function get() {
      return this._models;
    }
  }, {
    key: "batches",
    get: function get() {
      return this._batches;
    }
  }, {
    key: "lodGroups",
    get: function get() {
      return this._lodGroups;
    }
  }]);
}();
var LODInfo = function LODInfo() {
  this.usedLevel = -1;
  this.lastUsedLevel = -1;
  this.transformDirty = true;
};
var LodStateCache = function () {
  function LodStateCache(scene) {
    this._renderScene = null;
    this._modelsInLODGroup = new Map();
    this._lodStateInCamera = new Map();
    this._newAddedLodGroupVec = [];
    this._levelModels = new Map();
    this._renderScene = scene;
  }
  var _proto2 = LodStateCache.prototype;
  _proto2.addCamera = function addCamera(camera) {
    var lodGroups = this._renderScene.lodGroups;
    for (var i = 0; i < lodGroups.length; i++) {
      var lodGroup = lodGroups[i];
      var layer = lodGroup.node.layer;
      if ((camera.visibility & layer) === layer) {
        if (!this._lodStateInCamera.has(camera)) {
          this._lodStateInCamera.set(camera, new Map());
        }
        break;
      }
    }
  };
  _proto2.removeCamera = function removeCamera(camera) {
    if (this._lodStateInCamera.has(camera)) {
      this._lodStateInCamera["delete"](camera);
    }
  };
  _proto2.addLodGroup = function addLodGroup(lodGroup) {
    this._newAddedLodGroupVec.push(lodGroup);
    var cameras = this._renderScene.cameras;
    for (var i = 0; i < cameras.length; i++) {
      var camera = cameras[i];
      if (this._lodStateInCamera.has(camera)) {
        continue;
      }
      var layer = lodGroup.node.layer;
      if ((camera.visibility & layer) === layer) {
        this._lodStateInCamera.set(camera, new Map());
      }
    }
  };
  _proto2.removeLodGroup = function removeLodGroup(lodGroup) {
    var _this4 = this;
    for (var index = 0; index < lodGroup.lodCount; index++) {
      var lod = lodGroup.lodDataArray[index];
      lod.models.forEach(function (model) {
        _this4._modelsInLODGroup["delete"](model);
      });
    }
    for (var _iterator = _createForOfIteratorHelperLoose(this._lodStateInCamera), _step; !(_step = _iterator()).done;) {
      var visibleCamera = _step.value;
      visibleCamera[1]["delete"](lodGroup);
    }
    this._levelModels["delete"](lodGroup);
  };
  _proto2.removeModel = function removeModel(model) {
    if (this._modelsInLODGroup.has(model)) {
      this._modelsInLODGroup["delete"](model);
    }
  };
  _proto2.updateLodState = function updateLodState() {
    var _this5 = this;
    this._newAddedLodGroupVec.forEach(function (addedLodGroup) {
      var levelModels = _this5._levelModels.get(addedLodGroup);
      if (!levelModels) {
        levelModels = new Map();
        _this5._levelModels.set(addedLodGroup, levelModels);
      }
      for (var i = 0; i < addedLodGroup.lodCount; i++) {
        var lodModels = levelModels.get(i);
        if (!lodModels) {
          lodModels = [];
        }
        var models = addedLodGroup.lodDataArray[i].models;
        for (var j = 0; j < models.length; j++) {
          var model = models[j];
          var modelInfo = _this5._modelsInLODGroup.get(model);
          if (!modelInfo) {
            modelInfo = new Map();
          }
          _this5._modelsInLODGroup.set(model, modelInfo);
          lodModels.push(model);
        }
        levelModels.set(i, lodModels);
      }
    });
    this._newAddedLodGroupVec.length = 0;
    var lodGroups = this._renderScene.lodGroups;
    var _loop = function _loop() {
        var lodGroup = lodGroups[i];
        if (lodGroup.enabled) {
          var lodLevels = lodGroup.getLockedLODLevels();
          var count = lodLevels.length;
          if (count > 0) {
            if (lodGroup.node.hasChangedFlags > 0) {
              for (var _iterator2 = _createForOfIteratorHelperLoose(_this5._lodStateInCamera), _step2; !(_step2 = _iterator2()).done;) {
                var visibleCamera = _step2.value;
                var lodInfo = visibleCamera[1].get(lodGroup);
                if (!lodInfo) {
                  lodInfo = new LODInfo();
                  visibleCamera[1].set(lodGroup, lodInfo);
                }
                lodInfo.transformDirty = true;
              }
            }
            if (lodGroup.isLockLevelChanged()) {
              lodGroup.resetLockChangeFlag();
              var _lodModels = _this5._levelModels.get(lodGroup);
              if (_lodModels) {
                _lodModels.forEach(function (vecArray, index) {
                  vecArray.forEach(function (model) {
                    var modelInfo = _this5._modelsInLODGroup.get(model);
                    if (modelInfo) {
                      modelInfo.clear();
                    }
                  });
                });
                lodLevels.forEach(function (visibleIndex) {
                  var vecModels = _lodModels.get(visibleIndex);
                  if (vecModels) {
                    vecModels.forEach(function (model) {
                      var modelInfo = _this5._modelsInLODGroup.get(model);
                      if (modelInfo && model.node && model.node.active) {
                        for (var _iterator3 = _createForOfIteratorHelperLoose(_this5._lodStateInCamera), _step3; !(_step3 = _iterator3()).done;) {
                          var _visibleCamera = _step3.value;
                          modelInfo.set(_visibleCamera[0], true);
                        }
                      }
                    });
                  }
                });
              }
            }
            return 0;
          }
          var hasUpdated = false;
          for (var _iterator4 = _createForOfIteratorHelperLoose(_this5._lodStateInCamera), _step4; !(_step4 = _iterator4()).done;) {
            var _visibleCamera2 = _step4.value;
            var _lodInfo = _visibleCamera2[1].get(lodGroup);
            if (!_lodInfo) {
              _lodInfo = new LODInfo();
              _visibleCamera2[1].set(lodGroup, _lodInfo);
            }
            var cameraChangeFlags = _visibleCamera2[0].node.hasChangedFlags;
            var lodChangeFlags = lodGroup.node.hasChangedFlags;
            if (cameraChangeFlags > 0 || lodChangeFlags > 0 || _lodInfo.transformDirty) {
              if (_lodInfo.transformDirty) {
                _lodInfo.transformDirty = false;
              }
              var index = lodGroup.getVisibleLODLevel(_visibleCamera2[0]);
              if (index !== _lodInfo.usedLevel) {
                _lodInfo.lastUsedLevel = _lodInfo.usedLevel;
                _lodInfo.usedLevel = index;
                hasUpdated = true;
              }
            }
          }
          var lodModels = _this5._levelModels.get(lodGroup);
          if (!lodModels) {
            return 0;
          }
          if (lodGroup.isLockLevelChanged()) {
            lodGroup.resetLockChangeFlag();
            lodModels.forEach(function (vecArray, index) {
              vecArray.forEach(function (model) {
                var modelInfo = _this5._modelsInLODGroup.get(model);
                if (modelInfo) {
                  modelInfo.clear();
                }
              });
            });
            hasUpdated = true;
          } else if (hasUpdated) {
            _this5._lodStateInCamera.forEach(function (lodState, camera) {
              var lodInfo = lodState.get(lodGroup);
              if (lodInfo && lodInfo.usedLevel !== lodInfo.lastUsedLevel) {
                var vecModels = lodModels.get(lodInfo.lastUsedLevel);
                if (vecModels) {
                  vecModels.forEach(function (model) {
                    var modelInfo = _this5._modelsInLODGroup.get(model);
                    if (modelInfo) {
                      modelInfo.clear();
                    }
                  });
                }
              }
            });
          }
          if (hasUpdated) {
            _this5._lodStateInCamera.forEach(function (lodState, camera) {
              var lodInfo = lodState.get(lodGroup);
              if (lodInfo) {
                var usedLevel = lodInfo.usedLevel;
                var vecModels = lodModels.get(usedLevel);
                if (vecModels) {
                  vecModels.forEach(function (model) {
                    var modelInfo = _this5._modelsInLODGroup.get(model);
                    if (modelInfo && model.node && model.node.active) {
                      modelInfo.set(camera, true);
                    }
                  });
                }
              }
            });
          }
        }
      },
      _ret;
    for (var i = 0; i < lodGroups.length; i++) {
      _ret = _loop();
      if (_ret === 0) continue;
    }
  };
  _proto2.isLodModelCulled = function isLodModelCulled(camera, model) {
    var modelInfo = this._modelsInLODGroup.get(model);
    if (!modelInfo) {
      return false;
    }
    return !modelInfo.has(camera);
  };
  _proto2.clearCache = function clearCache() {
    this._levelModels.clear();
    this._modelsInLODGroup.clear();
    this._lodStateInCamera.clear();
    this._newAddedLodGroupVec.length = 0;
  };
  _proto2.isLodGroupVisibleByCamera = function isLodGroupVisibleByCamera(lodGroup, camera) {
    var layer = lodGroup.node.layer;
    return (camera.visibility & layer) === layer;
  };
  return LodStateCache;
}();

var _orientationMap;
var orientationMap = (_orientationMap = {}, _orientationMap[Orientation.PORTRAIT] = SurfaceTransform.IDENTITY, _orientationMap[Orientation.LANDSCAPE_RIGHT] = SurfaceTransform.ROTATE_90, _orientationMap[Orientation.PORTRAIT_UPSIDE_DOWN] = SurfaceTransform.ROTATE_180, _orientationMap[Orientation.LANDSCAPE_LEFT] = SurfaceTransform.ROTATE_270, _orientationMap);
var _windowCount = 0;
var RenderWindow = function () {
  function RenderWindow(root) {
    this._title = '';
    this._width = 1;
    this._height = 1;
    this._swapchain = null;
    this._renderPass = null;
    this._colorTextures = [];
    this._depthStencilTexture = null;
    this._cameras = [];
    this._hasOnScreenAttachments = false;
    this._hasOffScreenAttachments = false;
    this._framebuffer = null;
    this._device = null;
    this._renderWindowId = _windowCount++;
    this._isResized = true;
    this._colorName = "Color" + this._renderWindowId;
    this._depthStencilName = "DepthStencil" + this._renderWindowId;
  }
  var _proto = RenderWindow.prototype;
  _proto.isRenderWindowResized = function isRenderWindowResized() {
    return this._isResized;
  };
  _proto.setRenderWindowResizeHandled = function setRenderWindowResizeHandled() {
    this._isResized = false;
  };
  RenderWindow.registerCreateFunc = function registerCreateFunc(root) {
    root._createWindowFun = function (_root) {
      return new RenderWindow();
    };
  };
  _proto.initialize = function initialize(device, info) {
    if (info.title !== undefined) {
      this._title = info.title;
    }
    if (info.swapchain !== undefined) {
      this._swapchain = info.swapchain;
    }
    this._width = info.width;
    this._height = info.height;
    this._device = device;
    this._renderPass = device.createRenderPass(info.renderPassInfo);
    if (info.swapchain) {
      this._swapchain = info.swapchain;
      this._colorTextures.push(info.swapchain.colorTexture);
      this._depthStencilTexture = info.swapchain.depthStencilTexture;
    } else {
      for (var i = 0; i < info.renderPassInfo.colorAttachments.length; i++) {
        var textureInfo = new TextureInfo(TextureType.TEX2D, TextureUsageBit.COLOR_ATTACHMENT | TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_SRC, info.renderPassInfo.colorAttachments[i].format, this._width, this._height);
        if (info.externalFlag && (info.externalFlag & TextureFlagBit.EXTERNAL_NORMAL || info.externalFlag & TextureFlagBit.EXTERNAL_OES)) {
          textureInfo.flags |= info.externalFlag;
          textureInfo.externalRes = info.externalResLow ? info.externalResLow : 0;
        }
        this._colorTextures.push(device.createTexture(textureInfo));
      }
      if (info.renderPassInfo.depthStencilAttachment && info.renderPassInfo.depthStencilAttachment.format !== Format.UNKNOWN) {
        this._depthStencilTexture = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED, info.renderPassInfo.depthStencilAttachment.format, this._width, this._height));
        this._hasOffScreenAttachments = true;
      }
    }
    this._framebuffer = device.createFramebuffer(new FramebufferInfo(this._renderPass, this._colorTextures, this._depthStencilTexture));
    return true;
  };
  _proto.destroy = function destroy() {
    this.clearCameras();
    if (this._framebuffer) {
      this._framebuffer.destroy();
      this._framebuffer = null;
    }
    if (this._depthStencilTexture) {
      this._depthStencilTexture.destroy();
      this._depthStencilTexture = null;
    }
    for (var i = 0; i < this._colorTextures.length; i++) {
      var colorTexture = this._colorTextures[i];
      if (colorTexture) {
        colorTexture.destroy();
      }
    }
    this._colorTextures.length = 0;
    this._device = null;
  };
  _proto.resize = function resize(width, height) {
    if (this._swapchain) {
      this._swapchain.resize(width, height, orientationMap[screenAdapter.orientation]);
      this._width = this._swapchain.width;
      this._height = this._swapchain.height;
    } else {
      for (var i = 0; i < this._colorTextures.length; i++) {
        this._colorTextures[i].resize(width, height);
      }
      if (this._depthStencilTexture) {
        this._depthStencilTexture.resize(width, height);
      }
      this._width = width;
      this._height = height;
    }
    if (this.framebuffer) {
      this.framebuffer.destroy();
      this._framebuffer = this._device.createFramebuffer(new FramebufferInfo(this._renderPass, this._colorTextures, this._depthStencilTexture));
    }
    this._cameras.forEach(function (camera) {
      camera.resize(width, height);
    });
    this._isResized = true;
  };
  _proto.extractRenderCameras = function extractRenderCameras(cameras) {
    for (var j = 0; j < this._cameras.length; j++) {
      var camera = this._cameras[j];
      if (camera.enabled) {
        camera.update();
        cameras.push(camera);
      }
    }
  };
  _proto.attachCamera = function attachCamera(camera) {
    for (var i = 0; i < this._cameras.length; i++) {
      if (this._cameras[i] === camera) {
        return;
      }
    }
    this._cameras.push(camera);
    this.sortCameras();
    this._isResized = true;
  };
  _proto.detachCamera = function detachCamera(camera) {
    for (var i = 0; i < this._cameras.length; ++i) {
      if (this._cameras[i] === camera) {
        this._cameras.splice(i, 1);
        return;
      }
    }
  };
  _proto.clearCameras = function clearCameras() {
    this._cameras.length = 0;
  };
  _proto.sortCameras = function sortCameras() {
    this._cameras.sort(function (a, b) {
      return a.priority - b.priority;
    });
  };
  return _createClass(RenderWindow, [{
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
    key: "swapchain",
    get: function get() {
      return this._swapchain;
    }
  }, {
    key: "framebuffer",
    get: function get() {
      return this._framebuffer;
    }
  }, {
    key: "cameras",
    get: function get() {
      return this._cameras;
    }
  }, {
    key: "renderWindowId",
    get: function get() {
      return this._renderWindowId;
    }
  }, {
    key: "colorName",
    get: function get() {
      return this._colorName;
    }
  }, {
    key: "depthStencilName",
    get: function get() {
      return this._depthStencilName;
    }
  }]);
}();

{
  var cache = {};
  var resolveMap = {};
  var replaceExtension = function replaceExtension(task, done) {
    task.output = task.input;
    _asyncToGenerator(_regenerator().m(function _callee() {
      var i, item, extension;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            i = 0;
          case 1:
            if (!(i < task.input.length)) {
              _context.n = 6;
              break;
            }
            item = task.input[i];
            if (!(!item.uuid || item.isNative)) {
              _context.n = 2;
              break;
            }
            return _context.a(3, 5);
          case 2:
            _context.p = 2;
            _context.n = 3;
            return queryExtension(item.overrideUuid || item.uuid);
          case 3:
            extension = _context.v;
            if (extension) {
              item.ext = extension;
              item.url = item.url.replace('.json', extension);
            }
            _context.n = 5;
            break;
          case 4:
            _context.p = 4;
            _context.v;
            return _context.a(3, 5);
          case 5:
            i++;
            _context.n = 1;
            break;
          case 6:
            return _context.a(2);
        }
      }, _callee, null, [[2, 4]]);
    }))().then(function () {
      done(null, null);
    })["catch"](function (reason) {
      done(reason, null);
    });
  };
  var fetchText = function fetchText(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        if (xhr.status !== 200) {
          reject();
          return;
        }
        resolve(xhr.response);
      };
      xhr.onabort = xhr.ontimeout = xhr.onerror = function () {
        reject();
      };
      xhr.send(null);
    });
  };
  var queryExtension = function () {
    var _ref2 = _asyncToGenerator(_regenerator().m(function _callee2(uuid) {
      var text, info, useAssetDB, requestUrl, _globalThis$AssetDB$q, meta, previewServer, _t2, _t3;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (!(uuid in cache)) {
              _context2.n = 2;
              break;
            }
            if (!(cache[uuid] !== null)) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2, cache[uuid]);
          case 1:
            return _context2.a(2, new Promise(function (resolve) {
              resolveMap[uuid] = resolveMap[uuid] || [];
              resolveMap[uuid].push(resolve);
            }));
          case 2:
            cache[uuid] = null;
            _context2.p = 3;
            text = '';
            {
              _context2.n = 5;
              break;
            }
          case 4:
            info = _context2.v;
            if (info && info.library['.bin'] && Object.keys(info.library).length === 1) {
              text = '.cconb';
            }
            _context2.n = 14;
            break;
          case 5:
            {
              _context2.n = 12;
              break;
            }
          case 7:
            text = _context2.v;
            useAssetDB = false;
            _context2.n = 9;
            break;
          case 8:
            _context2.p = 8;
            _t2 = _context2.v;
            console.warn("Failed to get file type from URL: " + requestUrl + ". Error: " + _t2);
            text = '';
          case 9:
            if (!(useAssetDB && globalThis.AssetDB)) {
              _context2.n = 11;
              break;
            }
            _context2.n = 10;
            return (_globalThis$AssetDB$q = globalThis.AssetDB.queryAsset(uuid)) == null ? void 0 : _globalThis$AssetDB$q.meta;
          case 10:
            meta = _context2.v;
            if (meta && meta.files.length === 1 && meta.files[0] === '.bin') {
              text = '.cconb';
            }
          case 11:
            _context2.n = 14;
            break;
          case 12:
            previewServer = '';
            _context2.n = 13;
            return fetchText(previewServer + "/query-extname/" + uuid);
          case 13:
            text = _context2.v;
          case 14:
            cache[uuid] = text;
            if (resolveMap[uuid]) {
              resolveMap[uuid].forEach(function (func) {
                return func(text);
              });
              resolveMap[uuid] = [];
            }
            return _context2.a(2, text);
          case 15:
            _context2.p = 15;
            _t3 = _context2.v;
            console.error(_t3);
            cache[uuid] = '';
            return _context2.a(2, '');
        }
      }, _callee2, null, [[6, 8], [3, 15]]);
    }));
    return function queryExtension(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  pipeline.insert(replaceExtension, 1);
  fetchPipeline.insert(replaceExtension, 1);
}

var ImageFmts = ['.png', '.jpg', '.bmp', '.jpeg', '.gif', '.ico', '.tiff', '.webp', '.image', '.pvr', '.pkm', '.astc'];
var AudioFmts = ['.mp3', '.ogg', '.wav', '.m4a'];
function GetTrue() {
  return true;
}
var md5Pipe = {
  transformURL: function transformURL(url) {
    var uuid = getUuidFromURL(url);
    if (!uuid) {
      return url;
    }
    var bundle = bundles.find(function (b) {
      return !!b.getAssetInfo(uuid);
    });
    if (!bundle) {
      return url;
    }
    var hashValue = '';
    var info = bundle.getAssetInfo(uuid);
    if (url.startsWith(bundle.base + bundle.config.nativeBase)) {
      hashValue = info.nativeVer || '';
    } else {
      hashValue = info.ver || '';
    }
    if (!hashValue || url.indexOf(hashValue) !== -1) {
      return url;
    }
    var hashPatchInFolder = false;
    if (extname(url) === '.ttf') {
      hashPatchInFolder = true;
    }
    if (hashPatchInFolder) {
      var dirname$1 = dirname(url);
      var basename$1 = basename(url);
      url = dirname$1 + "." + hashValue + "/" + basename$1;
    } else {
      url = url.replace(/.*[/\\][0-9a-fA-F]{2}[/\\]([0-9a-fA-F-@]{8,})/, function (match, uuid) {
        return match + "." + hashValue;
      });
    }
    return url;
  }
};
var CCLoader = function () {
  function CCLoader() {
    this._autoReleaseSetting = Object.create(null);
    this._parseLoadResArgs = parseLoadResArgs;
  }
  var _proto = CCLoader.prototype;
  _proto.load = function load(res, progressCallback, completeCallback) {
    if (completeCallback === undefined) {
      if (progressCallback !== undefined) {
        completeCallback = progressCallback;
        progressCallback = null;
      }
    }
    var requests = Array.isArray(res) ? res : [res];
    for (var i = 0; i < requests.length; i++) {
      var _item = requests[i];
      if (typeof _item === 'string') {
        requests[i] = {
          url: _item,
          __isNative__: true
        };
      } else {
        if (_item.type) {
          _item.ext = "." + _item.type;
          _item.type = undefined;
        }
        if (_item.url) {
          _item.__isNative__ = true;
        }
      }
    }
    var images = [];
    var audios = [];
    assetManager.loadAny(requests, null, function (finish, total, item) {
      if (item.content) {
        if (ImageFmts.includes(item.ext)) {
          images.push(item.content);
        } else if (AudioFmts.includes(item.ext)) {
          audios.push(item.content);
        }
      }
      if (progressCallback) {
        progressCallback(finish, total, item);
      }
    }, function (err, _native) {
      var out = null;
      if (!err) {
        _native = Array.isArray(_native) ? _native : [_native];
        var _loop = function _loop(_i) {
          var item = _native[_i];
          if (!(item instanceof Asset)) {
            var _asset = item;
            var _url = requests[_i].url;
            if (images.includes(_asset)) {
              factory.create(_url, item, '.png', {}, function (err, image) {
                _asset = _native[_i] = image;
              });
            } else if (audios.includes(_asset)) {
              factory.create(_url, item, '.mp3', {}, function (err, audio) {
                _asset = _native[_i] = audio;
              });
            }
            assets.add(_url, _asset);
          }
        };
        for (var _i = 0; _i < _native.length; _i++) {
          _loop(_i);
        }
        if (_native.length > 1) {
          var map = Object.create(null);
          _native.forEach(function (asset) {
            map[asset._uuid] = asset;
          });
          out = {
            isCompleted: GetTrue,
            _map: map
          };
        } else {
          out = _native[0];
        }
      }
      if (completeCallback) {
        completeCallback(err, out);
      }
    });
  };
  _proto.getXMLHttpRequest = function getXMLHttpRequest() {
    return new XMLHttpRequest();
  };
  _proto.getItem = function getItem(id) {
    return assetManager.assets.has(id) ? {
      content: assetManager.assets.get(id)
    } : null;
  };
  _proto.loadRes = function loadRes(url, type, progressCallback, completeCallback) {
    var _this$_parseLoadResAr = this._parseLoadResArgs(type, progressCallback, completeCallback),
      _type = _this$_parseLoadResAr.type,
      onProgress = _this$_parseLoadResAr.onProgress,
      onComplete = _this$_parseLoadResAr.onComplete;
    var extname$1 = extname(url);
    if (extname$1 && !resources.getInfoWithPath(url, _type)) {
      url = url.slice(0, -extname$1.length);
    }
    resources.load(url, _type, onProgress, onComplete);
  };
  _proto.loadResArray = function loadResArray(urls, type, progressCallback, completeCallback) {
    var _this$_parseLoadResAr2 = this._parseLoadResArgs(type, progressCallback, completeCallback),
      _type = _this$_parseLoadResAr2.type,
      onProgress = _this$_parseLoadResAr2.onProgress,
      onComplete = _this$_parseLoadResAr2.onComplete;
    urls.forEach(function (url, i) {
      var extname$1 = extname(url);
      if (extname$1 && !resources.getInfoWithPath(url, _type)) {
        urls[i] = url.slice(0, -extname$1.length);
      }
    });
    resources.load(urls, _type, onProgress, onComplete);
  };
  _proto.loadResDir = function loadResDir(url, type, progressCallback, completeCallback) {
    var _this$_parseLoadResAr3 = this._parseLoadResArgs(type, progressCallback, completeCallback),
      _type = _this$_parseLoadResAr3.type,
      onProgress = _this$_parseLoadResAr3.onProgress,
      onComplete = _this$_parseLoadResAr3.onComplete;
    resources.loadDir(url, _type, onProgress, function (err, out) {
      var urls = [];
      if (!err) {
        var infos = resources.getDirWithPath(url, _type);
        urls = infos.map(function (info) {
          return info.path;
        });
      }
      if (onComplete) {
        onComplete(err, out, urls);
      }
    });
  };
  _proto.getRes = function getRes(url, type) {
    return assets.has(url) ? assets.get(url) : resources.get(url, type);
  };
  _proto.getResCount = function getResCount() {
    return assets.count;
  };
  _proto.getDependsRecursively = function getDependsRecursively(owner) {
    if (!owner) {
      return [];
    }
    var uuid = typeof owner === 'string' ? owner : owner._uuid;
    return dependUtil.getDepsRecursively(uuid).concat([uuid]);
  };
  _proto.addDownloadHandlers = function addDownloadHandlers(extMap) {
    var handler = Object.create(null);
    var _loop2 = function _loop2() {
      var func = extMap[_type2];
      handler["." + _type2] = function (url, options, onComplete) {
        func({
          url: url
        }, onComplete);
      };
    };
    for (var _type2 in extMap) {
      _loop2();
    }
    downloader.register(handler);
  };
  _proto.addLoadHandlers = function addLoadHandlers(extMap) {
    var handler = Object.create(null);
    var _loop3 = function _loop3() {
      var func = extMap[_type3];
      handler["." + _type3] = function (file, options, onComplete) {
        func({
          content: file
        }, onComplete);
      };
    };
    for (var _type3 in extMap) {
      _loop3();
    }
    parser.register(handler);
  };
  _proto.release = function release(asset) {
    if (Array.isArray(asset)) {
      for (var i = 0; i < asset.length; i++) {
        var key = asset[i];
        if (typeof key === 'string') {
          key = assets.get(key);
        }
        assetManager.releaseAsset(key);
      }
    } else if (asset) {
      if (typeof asset === 'string') {
        asset = assets.get(asset);
      }
      assetManager.releaseAsset(asset);
    }
  };
  _proto.releaseAsset = function releaseAsset(asset) {
    assetManager.releaseAsset(asset);
  };
  _proto.releaseRes = function releaseRes(res, type) {
    resources.release(res, type);
  };
  _proto.releaseAll = function releaseAll() {
    assetManager.releaseAll();
    assets.clear();
  };
  _proto.removeItem = function removeItem(id) {
    return !!assets.remove(id);
  };
  _proto.setAutoRelease = function setAutoRelease(asset, autoRelease) {
    if (typeof asset === 'object') {
      asset = asset._uuid;
    }
    this._autoReleaseSetting[asset] = !!autoRelease;
  };
  _proto.setAutoReleaseRecursively = function setAutoReleaseRecursively(asset, autoRelease) {
    if (typeof asset === 'object') {
      asset = asset._uuid;
    }
    autoRelease = !!autoRelease;
    this._autoReleaseSetting[asset] = autoRelease;
    var depends = dependUtil.getDepsRecursively(asset);
    for (var i = 0; i < depends.length; i++) {
      this._autoReleaseSetting[depends[i]] = autoRelease;
    }
  };
  _proto.isAutoRelease = function isAutoRelease(asset) {
    if (typeof asset === 'object') {
      asset = asset._uuid;
    }
    return !!this._autoReleaseSetting[asset];
  };
  return _createClass(CCLoader, [{
    key: "onProgress",
    set: function set(val) {
      setDefaultProgressCallback(val);
    }
  }, {
    key: "_cache",
    get: function get() {
      if (assets instanceof Cache) {
        return assets.map;
      } else {
        var map = {};
        assets.forEach(function (val, key) {
          map[key] = val;
        });
        return map;
      }
    }
  }, {
    key: "md5Pipe",
    get: function get() {
      return md5Pipe;
    }
  }, {
    key: "downloader",
    get: function get() {
      return downloader;
    }
  }, {
    key: "loader",
    get: function get() {
      return assetManager.parser;
    }
  }]);
}();
var loader = new CCLoader();
var AssetLibrary = {
  init: function init(options) {
    options.importBase = options.libraryPath;
    options.nativeBase = options.libraryPath;
    assetManager.init(options);
    if (options.rawAssets) {
      resources.init({
        base: '',
        deps: [],
        scenes: {},
        redirect: [],
        debug: true,
        packs: {},
        types: [],
        versions: {
          "import": [],
          "native": []
        },
        name: BuiltinBundleName.RESOURCES,
        importBase: options.importBase,
        nativeBase: options.nativeBase,
        paths: options.rawAssets.assets,
        uuids: Object.keys(options.rawAssets.assets),
        extensionMap: {}
      });
    }
  },
  loadAsset: function loadAsset(uuid, callback, options) {
    assetManager.loadAny(uuid, callback);
  }
};
var url = {};
replaceProperty(url, 'url', [{
  name: 'normalize',
  target: assetManager.utils,
  targetName: 'assetManager.utils',
  newName: 'normalize'
}, {
  name: 'raw',
  targetName: 'Asset.prototype',
  newName: 'nativeUrl',
  customFunction: function customFunction(url) {
    if (url.startsWith('resources/')) {
      return transform({
        path: changeExtname(url.substring(10)),
        bundle: BuiltinBundleName.RESOURCES,
        __isNative__: true,
        ext: extname(url)
      });
    }
    return '';
  }
}]);
removeProperty(AssetLibrary, 'AssetLibrary', [{
  name: 'getLibUrlNoExt',
  suggest: 'AssetLibrary.getLibUrlNoExt was removed, if you want to transform url, please use assetManager.utils.getUrlWithUuid instead'
}, {
  name: 'queryAssetInfo',
  suggest: 'AssetLibrary.queryAssetInfo was removed'
}]);
removeProperty(loader, 'loader', [{
  name: 'releaseResDir',
  suggest: 'loader.releaseResDir was removed, please use assetManager.releaseAsset instead'
}, {
  name: 'flowInDeps',
  suggest: 'loader.flowInDeps was removed'
}, {
  name: 'assetLoader',
  suggest: 'loader.assetLoader was removed, assetLoader and md5Pipe were merged into assetManager.transformPipeline'
}]);
replaceProperty(cclegacy, 'cc', [{
  name: 'loader',
  newName: 'assetManager',
  logTimes: 1,
  customGetter: function customGetter() {
    return loader;
  }
}, {
  name: 'AssetLibrary',
  newName: 'assetManager',
  logTimes: 1,
  customGetter: function customGetter() {
    return AssetLibrary;
  }
}, {
  name: 'Pipeline',
  target: AssetManager,
  targetName: 'AssetManager',
  newName: 'Pipeline',
  logTimes: 1
}, {
  name: 'url',
  targetName: 'assetManager',
  newName: 'utils',
  logTimes: 1,
  customGetter: function customGetter() {
    return url;
  }
}]);
removeProperty(cclegacy, 'cc', [{
  name: 'LoadingItems',
  suggest: getError(1400, 'LoadingItems', 'AssetManager.Task')
}]);
replaceProperty(macro, 'macro', [{
  name: 'DOWNLOAD_MAX_CONCURRENT',
  target: downloader,
  targetName: 'assetManager.downloader',
  newName: 'maxConcurrency'
}]);
var _autoRelease = releaseManager._autoRelease;
releaseManager._autoRelease = function (oldScene, newScene, persistNodes) {
  _autoRelease.call(releaseManager, oldScene, newScene, persistNodes);
  var releaseSettings = loader._autoReleaseSetting;
  var keys = Object.keys(releaseSettings);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (releaseSettings[key] === true) {
      var _asset2 = assets.get(key);
      if (_asset2) {
        releaseManager.tryRelease(_asset2);
      }
    }
  }
};

export { AssetLibrary as A, CCLoader as C, DirectionalLight as D, LODData as L, Model as M, PointLight as P, ReflectionProbeType as R, SpotLight as S, RenderScene as a, SubModel as b, RenderWindow as c, ModelType as d, LODGroup as e, RangedDirectionalLight as f, SphereLight as g, loader as l, url as u };
//# sourceMappingURL=deprecated-n0w4kK7g.js.map
