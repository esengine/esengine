import { _ as _inheritsLoose, E as Enum, a as _createClass, n as EventTarget, b as _applyDecoratedDescriptor, o as assertIsTrue, w as warnID, s as settings, S as SettingsCategory, p as CCInteger, C as CCBoolean, q as CCFloat } from './gc-object-CShF5lzx.js';
import { c as ccclass$1, t as type$1, b as applyDecoratedInitializer, s as serializable$1, g as Vec4, k as formerlySerializedAs$1, l as executionOrder$1 } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { M as Mesh } from './mesh-XWfHgs1t.js';
import './debug-view-BuNhRPv_.js';
import { M as Model, R as ReflectionProbeType } from './deprecated-n0w4kK7g.js';
import { g as getPhaseID, c as MobilityMode, T as TransformBit, d as builtinResMgr, e as getPipelineSceneData } from './scene-vWcxM1_c.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './deprecated-CN-RjLP6.js';
import { M as ModelRenderer } from './model-renderer-BBapFDY7.js';
import { N as NodeEventType } from './node-event-Ccvtv8bJ.js';
import { i as isEnableEffect } from './pipeline-state-manager-C5U4ouGL.js';

var MorphModel = function (_Model) {
  function MorphModel() {
    var _this;
    _this = _Model.call(this) || this;
    _this._morphRenderingInstance = null;
    _this._usedMaterials = new Set();
    return _this;
  }
  _inheritsLoose(MorphModel, _Model);
  var _proto = MorphModel.prototype;
  _proto.getMacroPatches = function getMacroPatches(subModelIndex) {
    var superMacroPatches = _Model.prototype.getMacroPatches.call(this, subModelIndex);
    if (this._morphRenderingInstance) {
      var morphInstanceMacroPatches = this._morphRenderingInstance.requiredPatches(subModelIndex);
      if (morphInstanceMacroPatches) {
        return morphInstanceMacroPatches.concat(superMacroPatches !== null && superMacroPatches !== void 0 ? superMacroPatches : []);
      }
    }
    return superMacroPatches;
  };
  _proto.initSubModel = function initSubModel(subModelIndex, subMeshData, material) {
    return _Model.prototype.initSubModel.call(this, subModelIndex, subMeshData, this._launderMaterial(material));
  };
  _proto.destroy = function destroy() {
    _Model.prototype.destroy.call(this);
    this._morphRenderingInstance = null;
  };
  _proto.setSubModelMaterial = function setSubModelMaterial(subModelIndex, material) {
    return _Model.prototype.setSubModelMaterial.call(this, subModelIndex, this._launderMaterial(material));
  };
  _proto.setMorphRendering = function setMorphRendering(morphRendering) {
    this._morphRenderingInstance = morphRendering;
  };
  _proto._updateLocalDescriptors = function _updateLocalDescriptors(submodelIdx, descriptorSet) {
    _Model.prototype._updateLocalDescriptors.call(this, submodelIdx, descriptorSet);
    if (this._morphRenderingInstance) {
      this._morphRenderingInstance.adaptPipelineState(submodelIdx, descriptorSet);
    }
  };
  _proto._launderMaterial = function _launderMaterial(material) {
    return material;
  };
  return MorphModel;
}(Model);

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _ModelBakeSettings, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _class3, _class4, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _MeshRenderer;
var ccclass = ccclass$1,
  executionOrder = executionOrder$1,
  type = type$1,
  formerlySerializedAs = formerlySerializedAs$1,
  serializable = serializable$1;
var _phaseID = getPhaseID('specular-pass');
function getSkinPassIndex(subModel) {
  var passes = subModel.passes;
  var r = cclegacy.rendering;
  if (isEnableEffect()) _phaseID = r.getPhaseID(r.getPassID('specular-pass'), 'default');
  for (var k = 0; k < passes.length; k++) {
    if ((!r || !r.enableEffectImport) && passes[k].phase === _phaseID || isEnableEffect() && passes[k].phaseID === _phaseID) {
      return k;
    }
  }
  return -1;
}
var ModelShadowCastingMode = Enum({
  OFF: 0,
  ON: 1
});
var ModelShadowReceivingMode = Enum({
  OFF: 0,
  ON: 1
});
var ModelBakeSettingsEvent;
(function (ModelBakeSettingsEvent) {
  ModelBakeSettingsEvent["USE_LIGHT_PROBE_CHANGED"] = "use_light_probe_changed";
  ModelBakeSettingsEvent["REFLECTION_PROBE_CHANGED"] = "reflection_probe_changed";
  ModelBakeSettingsEvent["BAKE_TO_REFLECTION_PROBE_CHANGED"] = "bake_to_reflection_probe_changed";
})(ModelBakeSettingsEvent || (ModelBakeSettingsEvent = {}));
var ModelBakeSettings = (_dec = ccclass('cc.ModelBakeSettings'), _dec2 = formerlySerializedAs('_recieveShadow'), _dec3 = type(CCInteger), _dec4 = type(CCBoolean), _dec5 = type(CCBoolean), _dec6 = type(Enum(ReflectionProbeType)), _dec7 = type(CCBoolean), _dec(_class = (_class2 = (_ModelBakeSettings = function (_EventTarget) {
  function ModelBakeSettings() {
    var _this;
    _this = _EventTarget.call(this) || this;
    _this.texture = _initializer && _initializer();
    _this.uvParam = _initializer2 && _initializer2();
    _this._bakeable = _initializer3 && _initializer3();
    _this._castShadow = _initializer4 && _initializer4();
    _this._receiveShadow = _initializer5 && _initializer5();
    _this._lightmapSize = _initializer6 && _initializer6();
    _this._useLightProbe = _initializer7 && _initializer7();
    _this._bakeToLightProbe = _initializer8 && _initializer8();
    _this._reflectionProbeType = _initializer9 && _initializer9();
    _this._bakeToReflectionProbe = _initializer0 && _initializer0();
    _this.probeCubemap = null;
    _this.probeBlendCubemap = null;
    _this.probePlanarmap = null;
    return _this;
  }
  _inheritsLoose(ModelBakeSettings, _EventTarget);
  return _createClass(ModelBakeSettings, [{
    key: "bakeable",
    get: function get() {
      return this._bakeable;
    },
    set: function set(val) {
      this._bakeable = val;
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
    key: "receiveShadow",
    get: function get() {
      return this._receiveShadow;
    },
    set: function set(val) {
      this._receiveShadow = val;
    }
  }, {
    key: "lightmapSize",
    get: function get() {
      return this._lightmapSize;
    },
    set: function set(val) {
      this._lightmapSize = val;
    }
  }, {
    key: "useLightProbe",
    get: function get() {
      return this._useLightProbe;
    },
    set: function set(val) {
      this._useLightProbe = val;
      this.emit(ModelBakeSettingsEvent.USE_LIGHT_PROBE_CHANGED);
    }
  }, {
    key: "bakeToLightProbe",
    get: function get() {
      return this._bakeToLightProbe;
    },
    set: function set(val) {
      this._bakeToLightProbe = val;
    }
  }, {
    key: "reflectionProbe",
    get: function get() {
      return this._reflectionProbeType;
    },
    set: function set(val) {
      this._reflectionProbeType = val;
      this.emit(ModelBakeSettingsEvent.REFLECTION_PROBE_CHANGED);
    }
  }, {
    key: "bakeToReflectionProbe",
    get: function get() {
      return this._bakeToReflectionProbe;
    },
    set: function set(val) {
      this._bakeToReflectionProbe = val;
      this.emit(ModelBakeSettingsEvent.BAKE_TO_REFLECTION_PROBE_CHANGED);
    }
  }]);
}(EventTarget), _ModelBakeSettings.USE_LIGHT_PROBE_CHANGED = ModelBakeSettingsEvent.USE_LIGHT_PROBE_CHANGED, _ModelBakeSettings.REFLECTION_PROBE_CHANGED = ModelBakeSettingsEvent.REFLECTION_PROBE_CHANGED, _ModelBakeSettings.BAKE_TO_REFLECTION_PROBE_CHANGED = ModelBakeSettingsEvent.BAKE_TO_REFLECTION_PROBE_CHANGED, _ModelBakeSettings), _initializer = applyDecoratedInitializer(_class2.prototype, "texture", [serializable], function () {
  return null;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "uvParam", [serializable], function () {
  return new Vec4();
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_bakeable", [serializable], function () {
  return false;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_castShadow", [serializable], function () {
  return false;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_receiveShadow", [_dec2], function () {
  return false;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_lightmapSize", [serializable], function () {
  return 64;
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "_useLightProbe", [serializable], function () {
  return false;
}), _initializer8 = applyDecoratedInitializer(_class2.prototype, "_bakeToLightProbe", [serializable], function () {
  return true;
}), _initializer9 = applyDecoratedInitializer(_class2.prototype, "_reflectionProbeType", [serializable], function () {
  return ReflectionProbeType.NONE;
}), _initializer0 = applyDecoratedInitializer(_class2.prototype, "_bakeToReflectionProbe", [serializable], function () {
  return true;
}), _applyDecoratedDescriptor(_class2.prototype, "lightmapSize", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "lightmapSize"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "useLightProbe", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "useLightProbe"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "bakeToLightProbe", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "bakeToLightProbe"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "reflectionProbe", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "reflectionProbe"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "bakeToReflectionProbe", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "bakeToReflectionProbe"), _class2.prototype), _class2)) || _class);
var MeshRenderer = (_dec8 = ccclass('cc.MeshRenderer'), _dec9 = executionOrder(100), _dec0 = type(CCFloat), _dec1 = type(CCFloat), _dec10 = type(ModelShadowCastingMode), _dec11 = type(ModelShadowReceivingMode), _dec12 = type(Mesh), _dec13 = type(CCBoolean), _dec8(_class3 = _dec9(_class3 = (_class4 = (_MeshRenderer = function (_ModelRenderer) {
  function MeshRenderer() {
    var _this2;
    _this2 = _ModelRenderer.call(this) || this;
    _this2.bakeSettings = _initializer1 && _initializer1();
    _this2._mesh = _initializer10 && _initializer10();
    _this2._shadowCastingMode = _initializer11 && _initializer11();
    _this2._shadowReceivingMode = _initializer12 && _initializer12();
    _this2._shadowBias = _initializer13 && _initializer13();
    _this2._shadowNormalBias = _initializer14 && _initializer14();
    _this2._reflectionProbeId = _initializer15 && _initializer15();
    _this2._reflectionProbeBlendId = _initializer16 && _initializer16();
    _this2._reflectionProbeBlendWeight = _initializer17 && _initializer17();
    _this2._enabledGlobalStandardSkinObject = _initializer18 && _initializer18();
    _this2._reflectionProbeDataMap = null;
    _this2._subMeshShapesWeights = [];
    _this2._modelType = Model;
    _this2._model = null;
    _this2._morphInstance = null;
    _this2._enableMorph = _initializer19 && _initializer19();
    var highQualityMode = settings.querySettings(SettingsCategory.RENDERING, 'highQualityMode');
    if (highQualityMode) {
      _this2._shadowCastingMode = ModelShadowCastingMode.ON;
      _this2.bakeSettings.castShadow = true;
      _this2.bakeSettings.receiveShadow = true;
    }
    return _this2;
  }
  _inheritsLoose(MeshRenderer, _ModelRenderer);
  var _proto = MeshRenderer.prototype;
  _proto.onUpdateReceiveDirLight = function onUpdateReceiveDirLight(visibility, forceClose) {
    if (forceClose === void 0) {
      forceClose = false;
    }
    if (!this._model) {
      return;
    }
    if (forceClose) {
      this._model.receiveDirLight = false;
      return;
    }
    if (this.node && (visibility & this.node.layer) === this.node.layer || visibility & this._model.visFlags) {
      this._model.receiveDirLight = true;
    } else {
      this._model.receiveDirLight = false;
    }
  };
  _proto.clearGlobalStandardSkinObjectFlag = function clearGlobalStandardSkinObjectFlag() {
    this._enabledGlobalStandardSkinObject = false;
  };
  _proto.onLoad = function onLoad() {
    if (this._mesh) {
      this._mesh.initialize();
    }
    if (!this._validateShapeWeights()) {
      this._initSubMeshShapesWeights();
    }
    this._watchMorphInMesh();
    this._updateModels();
    this._updateCastShadow();
    this._updateReceiveShadow();
    this._updateShadowBias();
    this._updateShadowNormalBias();
    this._updateUseLightProbe();
    this._updateBakeToReflectionProbe();
    this._updateUseReflectionProbe();
    this._updateReceiveDirLight();
    this._updateStandardSkin();
  };
  _proto.onRestore = function onRestore() {
    this._updateModels();
    if (this.enabledInHierarchy) {
      this._attachToScene();
    }
    this._updateCastShadow();
    this._updateReceiveShadow();
    this._updateShadowBias();
    this._updateShadowNormalBias();
    this._updateUseLightProbe();
    this._updateBakeToReflectionProbe();
    this._updateUseReflectionProbe();
    this._updateReceiveDirLight();
    this._updateStandardSkin();
  };
  _proto.onEnable = function onEnable() {
    _ModelRenderer.prototype.onEnable.call(this);
    this.node.on(NodeEventType.MOBILITY_CHANGED, this.onMobilityChanged, this);
    this.node.on(NodeEventType.LIGHT_PROBE_BAKING_CHANGED, this.onLightProbeBakingChanged, this);
    this.bakeSettings.on(ModelBakeSettingsEvent.USE_LIGHT_PROBE_CHANGED, this.onUseLightProbeChanged, this);
    this.bakeSettings.on(ModelBakeSettingsEvent.REFLECTION_PROBE_CHANGED, this.onReflectionProbeChanged, this);
    this.bakeSettings.on(ModelBakeSettingsEvent.BAKE_TO_REFLECTION_PROBE_CHANGED, this.onBakeToReflectionProbeChanged, this);
    if (!this._model) {
      this._updateModels();
    }
    this._model.onGlobalPipelineStateChanged();
    this._updateCastShadow();
    this._updateReceiveShadow();
    this._updateShadowBias();
    this._updateShadowNormalBias();
    this._updateBakeToReflectionProbe();
    this._updateUseReflectionProbe();
    this._onUpdateLocalShadowBiasAndProbeId();
    this._updateUseLightProbe();
    this._updateReceiveDirLight();
    this._onUpdateReflectionProbeDataMap();
    this._onUpdateLocalReflectionProbeData();
    this._updateStandardSkin();
    this._attachToScene();
  };
  _proto.onDisable = function onDisable() {
    if (this._model) {
      this._detachFromScene();
    }
    this.node.off(NodeEventType.MOBILITY_CHANGED, this.onMobilityChanged, this);
    this.node.off(NodeEventType.LIGHT_PROBE_BAKING_CHANGED, this.onLightProbeBakingChanged, this);
    this.bakeSettings.off(ModelBakeSettingsEvent.USE_LIGHT_PROBE_CHANGED, this.onUseLightProbeChanged, this);
    this.bakeSettings.off(ModelBakeSettingsEvent.REFLECTION_PROBE_CHANGED, this.onReflectionProbeChanged, this);
    this.bakeSettings.off(ModelBakeSettingsEvent.BAKE_TO_REFLECTION_PROBE_CHANGED, this.onBakeToReflectionProbeChanged, this);
  };
  _proto.onDestroy = function onDestroy() {
    if (this._model) {
      cclegacy.director.root.destroyModel(this._model);
      this._model = null;
      this._models.length = 0;
    }
    if (this._morphInstance) {
      this._morphInstance.destroy();
    }
  };
  _proto.onGeometryChanged = function onGeometryChanged() {
    if (this._model && this._mesh) {
      var meshStruct = this._mesh.struct;
      this._model.createBoundingShape(meshStruct.minPosition, meshStruct.maxPosition);
      this._model.updateWorldBound();
      this._model.onGeometryChanged();
    }
  };
  _proto.getWeight = function getWeight(subMeshIndex, shapeIndex) {
    var subMeshShapesWeights = this._subMeshShapesWeights;
    assertIsTrue(subMeshIndex < subMeshShapesWeights.length);
    var shapeWeights = this._subMeshShapesWeights[subMeshIndex];
    assertIsTrue(shapeIndex < shapeWeights.length);
    return shapeWeights[shapeIndex];
  };
  _proto.setWeights = function setWeights(weights, subMeshIndex) {
    var subMeshShapesWeights = this._subMeshShapesWeights;
    if (subMeshIndex >= subMeshShapesWeights.length) {
      return;
    }
    var shapeWeights = subMeshShapesWeights[subMeshIndex];
    if (shapeWeights.length !== weights.length) {
      return;
    }
    subMeshShapesWeights[subMeshIndex] = weights.slice(0);
    this._uploadSubMeshShapesWeights(subMeshIndex);
  };
  _proto.setWeight = function setWeight(weight, subMeshIndex, shapeIndex) {
    var subMeshShapesWeights = this._subMeshShapesWeights;
    if (subMeshIndex >= subMeshShapesWeights.length) {
      return;
    }
    var shapeWeights = subMeshShapesWeights[subMeshIndex];
    if (shapeIndex >= shapeWeights.length) {
      return;
    }
    shapeWeights[shapeIndex] = weight;
    this._uploadSubMeshShapesWeights(subMeshIndex);
  };
  _proto.setInstancedAttribute = function setInstancedAttribute(name, value) {
    if (!this.model) {
      return;
    }
    {
      var subModels = this.model.subModels;
      for (var i = 0; i < subModels.length; i++) {
        var subModel = subModels[i];
        var _subModel$instancedAt = subModel.instancedAttributeBlock,
          attributes = _subModel$instancedAt.attributes,
          views = _subModel$instancedAt.views;
        for (var _i = 0; _i < attributes.length; _i++) {
          if (attributes[_i].name === name) {
            views[_i].set(value);
            break;
          }
        }
      }
    }
  };
  _proto._updateLightmap = function _updateLightmap(lightmap, uOff, vOff, scale, lum) {
    this.bakeSettings.texture = lightmap;
    this.bakeSettings.uvParam.x = uOff;
    this.bakeSettings.uvParam.y = vOff;
    this.bakeSettings.uvParam.z = scale;
    this.bakeSettings.uvParam.w = lum;
    this._onUpdateLightingmap();
    this._updateReceiveDirLight();
  };
  _proto.updateProbeCubemap = function updateProbeCubemap(cubeMap) {
    if (this.bakeSettings.probeCubemap && this.bakeSettings.probeCubemap === cubeMap) {
      return;
    }
    this.bakeSettings.probeCubemap = cubeMap;
    if (this.model !== null) {
      this.model.updateReflectionProbeCubemap(this.bakeSettings.probeCubemap);
    }
  };
  _proto.updateProbeBlendCubemap = function updateProbeBlendCubemap(cubeMap) {
    if (this.bakeSettings.probeBlendCubemap && this.bakeSettings.probeBlendCubemap === cubeMap) {
      return;
    }
    this.bakeSettings.probeBlendCubemap = cubeMap;
    if (this.model !== null) {
      this.model.updateReflectionProbeBlendCubemap(this.bakeSettings.probeBlendCubemap);
    }
  };
  _proto.updateProbePlanarMap = function updateProbePlanarMap(planarMap) {
    if (this.bakeSettings.probePlanarmap === planarMap) {
      return;
    }
    this.bakeSettings.probePlanarmap = planarMap;
    if (this.model !== null) {
      this.model.updateReflectionProbePlanarMap(this.bakeSettings.probePlanarmap);
    }
  };
  _proto.updateReflectionProbeDataMap = function updateReflectionProbeDataMap(dataMap) {
    this._reflectionProbeDataMap = dataMap;
    if (this.model !== null) {
      this.model.updateReflectionProbeDataMap(dataMap);
    }
  };
  _proto.updateReflectionProbeId = function updateReflectionProbeId(probeId) {
    this._reflectionProbeId = probeId;
    if (this.model) {
      this.model.reflectionProbeId = probeId;
    }
    this._onUpdateLocalShadowBiasAndProbeId();
  };
  _proto.updateReflectionProbeBlendId = function updateReflectionProbeBlendId(blendProbeId) {
    this._reflectionProbeBlendId = blendProbeId;
    if (this.model) {
      this.model.reflectionProbeBlendId = blendProbeId;
    }
    this._onUpdateLocalShadowBiasAndProbeId();
  };
  _proto.updateReflectionProbeBlendWeight = function updateReflectionProbeBlendWeight(weight) {
    this._reflectionProbeBlendWeight = weight;
    if (this.model) {
      this.model.reflectionProbeBlendWeight = weight;
    }
    this._onUpdateLocalReflectionProbeData();
  };
  _proto._updateReflectionProbeTexture = function _updateReflectionProbeTexture() {
    if (!this.model) return;
    var bakeSettings = this.bakeSettings;
    var reflectionProbe = bakeSettings.reflectionProbe;
    var probeBlendCubemap = bakeSettings.probeBlendCubemap;
    var probePlanarMap = bakeSettings.probePlanarmap;
    var probeCubeMap = bakeSettings.probeCubemap;
    if (reflectionProbe === ReflectionProbeType.BAKED_CUBEMAP) {
      this.model.updateReflectionProbeCubemap(probeCubeMap);
      this.model.updateReflectionProbePlanarMap(null);
      this.model.updateReflectionProbeBlendCubemap(null);
    } else if (reflectionProbe === ReflectionProbeType.BLEND_PROBES || reflectionProbe === ReflectionProbeType.BLEND_PROBES_AND_SKYBOX) {
      this.model.updateReflectionProbeCubemap(probeCubeMap);
      this.model.updateReflectionProbeBlendCubemap(probeBlendCubemap);
      this.model.updateReflectionProbePlanarMap(null);
    } else if (reflectionProbe === ReflectionProbeType.PLANAR_REFLECTION) {
      this.model.updateReflectionProbePlanarMap(probePlanarMap);
      this.model.updateReflectionProbeCubemap(null);
      this.model.updateReflectionProbeBlendCubemap(null);
    } else {
      this.model.updateReflectionProbeCubemap(null);
      this.model.updateReflectionProbePlanarMap(null);
      this.model.updateReflectionProbeBlendCubemap(null);
    }
  };
  _proto._updateModels = function _updateModels() {
    if (!this.enabledInHierarchy) {
      return;
    }
    var model = this._model;
    if (model) {
      model.destroy();
      model.initialize();
      model.node = model.transform = this.node;
    } else {
      this._createModel();
    }
    if (this._model) {
      if (this._mesh) {
        var meshStruct = this._mesh.struct;
        this._model.createBoundingShape(meshStruct.minPosition, meshStruct.maxPosition);
        this._model.updateWorldBound();
      }
      this._model.initLightingmap(this.bakeSettings.texture, this.bakeSettings.uvParam);
      this._updateUseLightProbe();
      this._updateUseReflectionProbeType();
      this._updateModelParams();
      this._onUpdateLightingmap();
      this._onUpdateLocalShadowBiasAndProbeId();
      this._updateUseReflectionProbe();
      this._updateReceiveDirLight();
      this._onUpdateReflectionProbeDataMap();
      this._onUpdateLocalReflectionProbeData();
    }
  };
  _proto._updateReceiveDirLight = function _updateReceiveDirLight() {
    if (!this._model) {
      return;
    }
    var scene = this.node.scene;
    if (!scene || !scene.renderScene) {
      return;
    }
    var mainLight = scene.renderScene.mainLight;
    if (!mainLight) {
      return;
    }
    var visibility = mainLight.visibility;
    if (!mainLight.node) {
      return;
    }
    if (mainLight.node.mobility === MobilityMode.Static) {
      var sceneGlobals = this.node.scene.globals;
      var lightProbeInfoData = sceneGlobals.lightProbeInfo.data;
      var forceClose = false;
      if (this.bakeSettings.texture && !sceneGlobals.disableLightmap) {
        forceClose = true;
      }
      if (lightProbeInfoData && lightProbeInfoData.hasCoefficients() && this._model.useLightProbe) {
        forceClose = true;
      }
      this.onUpdateReceiveDirLight(visibility, forceClose);
    } else {
      this.onUpdateReceiveDirLight(visibility);
    }
  };
  _proto._createModel = function _createModel() {
    var preferMorphOverPlain = !!this._morphInstance;
    var modelType = preferMorphOverPlain && this._modelType === Model ? MorphModel : this._modelType;
    var model = this._model = cclegacy.director.root.createModel(modelType);
    model.visFlags = this.visibility;
    model.node = model.transform = this.node;
    this._models.length = 0;
    this._models.push(model);
    if (this._morphInstance && model instanceof MorphModel) {
      model.setMorphRendering(this._morphInstance);
    }
  };
  _proto._attachToScene = function _attachToScene() {
    if (!this.node.scene || !this._model) {
      return;
    }
    var renderScene = this._getRenderScene();
    if (this._model.scene !== null) {
      this._detachFromScene();
    }
    renderScene.addModel(this._model);
  };
  _proto._detachFromScene = function _detachFromScene() {
    if (this._model && this._model.scene) {
      this._model.scene.removeModel(this._model);
    }
  };
  _proto._updateModelParams = function _updateModelParams() {
    if (!this._mesh || !this._model) {
      return;
    }
    this.node.hasChangedFlags |= TransformBit.POSITION;
    this._model.transform.hasChangedFlags |= TransformBit.POSITION;
    this._model.isDynamicBatching = this._isBatchingEnabled();
    var meshCount = this._mesh ? this._mesh.renderingSubMeshes.length : 0;
    var renderingMesh = this._mesh.renderingSubMeshes;
    if (renderingMesh) {
      for (var i = 0; i < meshCount; ++i) {
        var material = this.getRenderMaterial(i);
        if (material && !material.isValid) {
          material = null;
        }
        var subMeshData = renderingMesh[i];
        if (subMeshData) {
          this._model.initSubModel(i, subMeshData, material || this._getBuiltinMaterial());
        }
      }
    }
    this._model.enabled = true;
  };
  _proto._onUpdateLightingmap = function _onUpdateLightingmap() {
    if (this.model !== null) {
      this.model.updateLightingmap(this.bakeSettings.texture, this.bakeSettings.uvParam);
    }
    this.setInstancedAttribute('a_lightingMapUVParam', [this.bakeSettings.uvParam.x, this.bakeSettings.uvParam.y, this.bakeSettings.uvParam.z, this.bakeSettings.uvParam.w]);
  };
  _proto._onUpdateLocalShadowBiasAndProbeId = function _onUpdateLocalShadowBiasAndProbeId() {
    if (this.model !== null) {
      this.model.updateLocalShadowBias();
      this.model.updateReflectionProbeId();
    }
    this.setInstancedAttribute('a_localShadowBiasAndProbeId', [this._shadowBias, this._shadowNormalBias, this._reflectionProbeId, this._reflectionProbeBlendId]);
  };
  _proto._onUpdateLocalReflectionProbeData = function _onUpdateLocalReflectionProbeData() {
    if (this.bakeSettings.reflectionProbe === ReflectionProbeType.BAKED_CUBEMAP || this.bakeSettings.reflectionProbe === ReflectionProbeType.BLEND_PROBES || this.bakeSettings.reflectionProbe === ReflectionProbeType.BLEND_PROBES_AND_SKYBOX) {
      if (this.model !== null) {
        this.model.updateReflectionProbeId();
      }
      this.setInstancedAttribute('a_reflectionProbeData', [this._reflectionProbeBlendWeight, 0.0, 0.0, 0.0]);
    }
  };
  _proto._onUpdateReflectionProbeDataMap = function _onUpdateReflectionProbeDataMap() {
    if (this.model !== null) {
      this.model.updateReflectionProbeDataMap(this._reflectionProbeDataMap);
    }
  };
  _proto._onMaterialModified = function _onMaterialModified(idx, material) {
    if (!this._model || !this._model.inited) {
      return;
    }
    this._onRebuildPSO(idx, material || this._getBuiltinMaterial());
    this._updateStandardSkin();
  };
  _proto._onRebuildPSO = function _onRebuildPSO(idx, material) {
    if (!this._model || !this._model.inited) {
      return;
    }
    this._model.isDynamicBatching = this._isBatchingEnabled();
    this._model.setSubModelMaterial(idx, material);
    this._onUpdateLightingmap();
    this._onUpdateLocalShadowBiasAndProbeId();
    this._updateReflectionProbeTexture();
    this._onUpdateReflectionProbeDataMap();
    this._onUpdateLocalReflectionProbeData();
  };
  _proto._onMeshChanged = function _onMeshChanged(old) {};
  _proto._clearMaterials = function _clearMaterials() {
    if (!this._model) {
      return;
    }
    var subModels = this._model.subModels;
    for (var i = 0; i < subModels.length; ++i) {
      this._onMaterialModified(i, null);
    }
  };
  _proto._getBuiltinMaterial = function _getBuiltinMaterial() {
    return builtinResMgr.get('missing-material');
  };
  _proto._onVisibilityChange = function _onVisibilityChange(val) {
    if (!this._model) {
      return;
    }
    this._model.visFlags = val;
  };
  _proto._updateShadowBias = function _updateShadowBias() {
    if (!this._model) {
      return;
    }
    this._model.shadowBias = this._shadowBias;
  };
  _proto._updateShadowNormalBias = function _updateShadowNormalBias() {
    if (!this._model) {
      return;
    }
    this._model.shadowNormalBias = this._shadowNormalBias;
  };
  _proto._updateCastShadow = function _updateCastShadow() {
    if (!this._model) {
      return;
    }
    if (this._shadowCastingMode === ModelShadowCastingMode.OFF) {
      this._model.castShadow = false;
    } else {
      assertIsTrue(this._shadowCastingMode === ModelShadowCastingMode.ON, "ShadowCastingMode " + this._shadowCastingMode + " is not supported.");
      this._model.castShadow = true;
    }
  };
  _proto._updateReceiveShadow = function _updateReceiveShadow() {
    if (!this._model) {
      return;
    }
    if (this._shadowReceivingMode === ModelShadowReceivingMode.OFF) {
      this._model.receiveShadow = false;
    } else {
      this._model.receiveShadow = true;
    }
  };
  _proto.onMobilityChanged = function onMobilityChanged() {
    this._updateUseLightProbe();
    this._updateReceiveDirLight();
  };
  _proto.onLightProbeBakingChanged = function onLightProbeBakingChanged() {
    this._updateReceiveDirLight();
  };
  _proto.onUseLightProbeChanged = function onUseLightProbeChanged() {
    this._updateUseLightProbe();
  };
  _proto.onReflectionProbeChanged = function onReflectionProbeChanged() {
    this._updateUseReflectionProbe();
    this._onUpdateLocalShadowBiasAndProbeId();
    var reflectionProbeManager = cclegacy.internal.reflectionProbeManager;
    var model = this._model;
    if (this.bakeSettings.reflectionProbe === ReflectionProbeType.BAKED_CUBEMAP || this.bakeSettings.reflectionProbe === ReflectionProbeType.BLEND_PROBES || this.bakeSettings.reflectionProbe === ReflectionProbeType.BLEND_PROBES_AND_SKYBOX) {
      reflectionProbeManager.selectReflectionProbe(model);
      if (!reflectionProbeManager.getUsedReflectionProbe(model, false)) {
        warnID(16302);
      }
    } else if (this.bakeSettings.reflectionProbe === ReflectionProbeType.PLANAR_REFLECTION) {
      reflectionProbeManager.selectPlanarReflectionProbe(model);
      if (!reflectionProbeManager.getUsedReflectionProbe(model, true)) {
        warnID(16302);
      }
    }
  };
  _proto.onBakeToReflectionProbeChanged = function onBakeToReflectionProbeChanged() {
    this._updateBakeToReflectionProbe();
  };
  _proto._updateUseLightProbe = function _updateUseLightProbe() {
    if (!this._model) {
      return;
    }
    var node = this.node;
    if (this._mesh && node && node.mobility === MobilityMode.Movable && this.bakeSettings.useLightProbe) {
      this._model.useLightProbe = true;
    } else {
      this._model.useLightProbe = false;
    }
  };
  _proto._isBatchingEnabled = function _isBatchingEnabled() {
    for (var i = 0; i < this._materials.length; ++i) {
      var mat = this._materials[i];
      if (!mat) {
        continue;
      }
      for (var p = 0; p < mat.passes.length; ++p) {
        var pass = mat.passes[p];
        if (pass.batchingScheme) {
          return true;
        }
      }
    }
    return false;
  };
  _proto._updateUseReflectionProbe = function _updateUseReflectionProbe() {
    if (!this._model) return;
    this._model.reflectionProbeType = this.bakeSettings.reflectionProbe;
    this._updateReflectionProbeTexture();
  };
  _proto._updateUseReflectionProbeType = function _updateUseReflectionProbeType() {
    if (!this._model) return;
    this._model.reflectionProbeType = this.bakeSettings.reflectionProbe;
  };
  _proto._updateBakeToReflectionProbe = function _updateBakeToReflectionProbe() {
    if (!this._model) {
      return;
    }
    this._model.bakeToReflectionProbe = this.bakeSettings.bakeToReflectionProbe;
  };
  _proto._watchMorphInMesh = function _watchMorphInMesh() {
    if (this._morphInstance) {
      this._morphInstance.destroy();
      this._morphInstance = null;
    }
    if (!this._enableMorph) {
      return;
    }
    if (!this._mesh || !this._mesh.struct.morph || !this._mesh.morphRendering) {
      return;
    }
    this._morphInstance = this._mesh.morphRendering.createInstance();
    var nSubMeshes = this._mesh.struct.primitives.length;
    for (var iSubMesh = 0; iSubMesh < nSubMeshes; ++iSubMesh) {
      this._uploadSubMeshShapesWeights(iSubMesh);
    }
    if (this._model && this._model instanceof MorphModel) {
      this._model.setMorphRendering(this._morphInstance);
    }
  };
  _proto._initSubMeshShapesWeights = function _initSubMeshShapesWeights() {
    var mesh = this._mesh;
    this._subMeshShapesWeights.length = 0;
    if (!mesh) {
      return;
    }
    var morph = mesh.struct.morph;
    if (!morph) {
      return;
    }
    var commonWeights = morph.weights;
    this._subMeshShapesWeights = morph.subMeshMorphs.map(function (subMeshMorph) {
      if (!subMeshMorph) {
        return [];
      } else if (subMeshMorph.weights) {
        return subMeshMorph.weights.slice(0);
      } else if (commonWeights) {
        assertIsTrue(commonWeights.length === subMeshMorph.targets.length);
        return commonWeights.slice(0);
      } else {
        return new Array(subMeshMorph.targets.length).fill(0.0);
      }
    });
  };
  _proto._validateShapeWeights = function _validateShapeWeights() {
    var mesh = this._mesh,
      subMeshShapesWeights = this._subMeshShapesWeights;
    if (!mesh || !mesh.struct.morph) {
      return subMeshShapesWeights.length === 0;
    }
    var morph = mesh.struct.morph;
    if (morph.subMeshMorphs.length !== subMeshShapesWeights.length) {
      return false;
    }
    return subMeshShapesWeights.every(function (_ref, subMeshIndex) {
      var _morph$subMeshMorphs$, _morph$subMeshMorphs$2;
      var shapeCount = _ref.length;
      return ((_morph$subMeshMorphs$ = (_morph$subMeshMorphs$2 = morph.subMeshMorphs[subMeshIndex]) == null ? void 0 : _morph$subMeshMorphs$2.targets.length) !== null && _morph$subMeshMorphs$ !== void 0 ? _morph$subMeshMorphs$ : 0) === shapeCount;
    });
  };
  _proto._uploadSubMeshShapesWeights = function _uploadSubMeshShapesWeights(subMeshIndex) {
    var _this$_morphInstance;
    (_this$_morphInstance = this._morphInstance) == null ? void 0 : _this$_morphInstance.setWeights(subMeshIndex, this._subMeshShapesWeights[subMeshIndex]);
  };
  _proto._updateStandardSkin = function _updateStandardSkin() {
    var pipelineSceneData = getPipelineSceneData();
    if (this._enabledGlobalStandardSkinObject) {
      pipelineSceneData.standardSkinMeshRenderer = this;
      pipelineSceneData.standardSkinModel = this.model;
    }
    if (!pipelineSceneData.skinMaterialModel && this._model) {
      var subModels = this._model.subModels;
      for (var j = 0; j < subModels.length; j++) {
        var subModel = subModels[j];
        var skinPassIdx = getSkinPassIndex(subModel);
        if (skinPassIdx < 0) {
          continue;
        }
        pipelineSceneData.skinMaterialModel = this._model;
        return;
      }
    }
  };
  return _createClass(MeshRenderer, [{
    key: "shadowBias",
    get: function get() {
      return this._shadowBias;
    },
    set: function set(val) {
      this._shadowBias = val;
      this._updateShadowBias();
      this._onUpdateLocalShadowBiasAndProbeId();
    }
  }, {
    key: "shadowNormalBias",
    get: function get() {
      return this._shadowNormalBias;
    },
    set: function set(val) {
      this._shadowNormalBias = val;
      this._updateShadowNormalBias();
      this._onUpdateLocalShadowBiasAndProbeId();
    }
  }, {
    key: "shadowCastingMode",
    get: function get() {
      return this._shadowCastingMode;
    },
    set: function set(val) {
      this._shadowCastingMode = val;
      this._updateCastShadow();
    }
  }, {
    key: "shadowCastingModeForInspector",
    get: function get() {
      return this.shadowCastingMode === ModelShadowCastingMode.ON;
    },
    set: function set(val) {
      this.shadowCastingMode = val === true ? ModelShadowCastingMode.ON : ModelShadowCastingMode.OFF;
    }
  }, {
    key: "receiveShadow",
    get: function get() {
      return this._shadowReceivingMode;
    },
    set: function set(val) {
      this._shadowReceivingMode = val;
      this._updateReceiveShadow();
    }
  }, {
    key: "receiveShadowForInspector",
    get: function get() {
      return this._shadowReceivingMode === ModelShadowReceivingMode.ON;
    },
    set: function set(val) {
      this._shadowReceivingMode = val === true ? ModelShadowReceivingMode.ON : ModelShadowReceivingMode.OFF;
      this._updateReceiveShadow();
    }
  }, {
    key: "mesh",
    get: function get() {
      return this._mesh;
    },
    set: function set(val) {
      var old = this._mesh;
      var mesh = this._mesh = val;
      mesh == null ? void 0 : mesh.initialize();
      this._initSubMeshShapesWeights();
      this._watchMorphInMesh();
      this._onMeshChanged(old);
      this._updateModels();
      if (this.enabledInHierarchy) {
        this._attachToScene();
      }
      this._updateCastShadow();
      this._updateReceiveShadow();
      this._updateUseLightProbe();
      this._updateUseReflectionProbe();
      this._updateReceiveDirLight();
    }
  }, {
    key: "model",
    get: function get() {
      return this._model;
    }
  }, {
    key: "enableMorph",
    get: function get() {
      return this._enableMorph;
    },
    set: function set(value) {
      this._enableMorph = value;
    }
  }, {
    key: "isGlobalStandardSkinObject",
    get: function get() {
      return this._enabledGlobalStandardSkinObject;
    },
    set: function set(val) {
      getPipelineSceneData().standardSkinMeshRenderer = val ? this : null;
      this._enabledGlobalStandardSkinObject = val;
    }
  }]);
}(ModelRenderer), _MeshRenderer.ShadowCastingMode = ModelShadowCastingMode, _MeshRenderer.ShadowReceivingMode = ModelShadowReceivingMode, _MeshRenderer), _initializer1 = applyDecoratedInitializer(_class4.prototype, "bakeSettings", [serializable], function () {
  return new ModelBakeSettings();
}), _initializer10 = applyDecoratedInitializer(_class4.prototype, "_mesh", [serializable], function () {
  return null;
}), _initializer11 = applyDecoratedInitializer(_class4.prototype, "_shadowCastingMode", [serializable], function () {
  return ModelShadowCastingMode.OFF;
}), _initializer12 = applyDecoratedInitializer(_class4.prototype, "_shadowReceivingMode", [serializable], function () {
  return ModelShadowReceivingMode.ON;
}), _initializer13 = applyDecoratedInitializer(_class4.prototype, "_shadowBias", [serializable], function () {
  return 0;
}), _initializer14 = applyDecoratedInitializer(_class4.prototype, "_shadowNormalBias", [serializable], function () {
  return 0;
}), _initializer15 = applyDecoratedInitializer(_class4.prototype, "_reflectionProbeId", [serializable], function () {
  return -1;
}), _initializer16 = applyDecoratedInitializer(_class4.prototype, "_reflectionProbeBlendId", [serializable], function () {
  return -1;
}), _initializer17 = applyDecoratedInitializer(_class4.prototype, "_reflectionProbeBlendWeight", [serializable], function () {
  return 0;
}), _initializer18 = applyDecoratedInitializer(_class4.prototype, "_enabledGlobalStandardSkinObject", [serializable], function () {
  return false;
}), _applyDecoratedDescriptor(_class4.prototype, "shadowBias", [_dec0], Object.getOwnPropertyDescriptor(_class4.prototype, "shadowBias"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "shadowNormalBias", [_dec1], Object.getOwnPropertyDescriptor(_class4.prototype, "shadowNormalBias"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "shadowCastingMode", [_dec10], Object.getOwnPropertyDescriptor(_class4.prototype, "shadowCastingMode"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "receiveShadow", [_dec11], Object.getOwnPropertyDescriptor(_class4.prototype, "receiveShadow"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "mesh", [_dec12], Object.getOwnPropertyDescriptor(_class4.prototype, "mesh"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "isGlobalStandardSkinObject", [_dec13], Object.getOwnPropertyDescriptor(_class4.prototype, "isGlobalStandardSkinObject"), _class4.prototype), _initializer19 = applyDecoratedInitializer(_class4.prototype, "_enableMorph", [serializable], function () {
  return true;
}), _class4)) || _class3) || _class3);

export { MeshRenderer as M, MorphModel as a };
//# sourceMappingURL=mesh-renderer-CdPG3X-W.js.map
