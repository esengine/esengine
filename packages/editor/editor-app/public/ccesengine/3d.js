import { f as find } from './prefab-DYg_oxpo.js';
import { M as MeshUtils, _ as _createMesh, r as readMesh } from './create-mesh-CfKC5EQd.js';
import { m as mapBuffer, r as readBuffer, w as writeBuffer, L as LightType, l as Light$1, f as Camera, t as nt2lm, o as ProbeType, n as ProbeClearFlag, p as ReflectionProbe$1 } from './debug-view-BuNhRPv_.js';
import { c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';
import { M as MeshRenderer } from './mesh-renderer-CdPG3X-W.js';
import { M as Mesh } from './mesh-XWfHgs1t.js';
import { M as Mat4, j as removeProperty, f as Vec3, c as ccclass$2, b as applyDecoratedInitializer, s as serializable$2, t as type$2, C as Color, p as property$2, a as clamp, k as formerlySerializedAs$2, h as toRadian, i as replaceProperty, F as intersect, u as v3, o as screen } from './index-uXI1_UMk.js';
import { a as absolute } from './util-Cxn5lV0H.js';
export { S as Skeleton } from './skeleton-CBhmWmEt.js';
import { m as setClassAlias, E as Enum, a as _createClass, _ as _inheritsLoose, b as _applyDecoratedDescriptor, w as warnID, s as settings, S as SettingsCategory, p as CCInteger, C as CCBoolean, q as CCFloat, Q as error, e as warn, l as _createForOfIteratorHelperLoose, d as CCObjectFlags } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { C as Component, N as NodeEventType } from './node-event-Ccvtv8bJ.js';
import { D as DirectionalLight$1, g as SphereLight$1, S as SpotLight$1, P as PointLight$1, f as RangedDirectionalLight$1, L as LODData, e as LODGroup$1, R as ReflectionProbeType } from './deprecated-n0w4kK7g.js';
import { e as getPipelineSceneData, S as Shadows, C as CSMLevel, v as PCFType, q as CSMOptimizationMode, I as ImageAsset, P as PixelFormat, i as Texture2D, j as TextureFilter, W as WrapMode, T as TransformBit, N as Node, aj as TextureCube } from './scene-vWcxM1_c.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './deprecated-CN-RjLP6.js';
import { L as Layers, C as CAMERA_DEFAULT_MASK } from './pipeline-state-manager-C5U4ouGL.js';
export { h as BatchedSkinningModelComponent, h as SkinnedMeshBatchRenderer, b as SkinnedMeshRenderer, i as SkinnedMeshUnit, b as SkinningModelComponent, i as SkinningModelUnit } from './deprecated-BJz7DUMw.js';
import { C as Camera$1 } from './camera-component-BFt9vSC_.js';
import './touch-BKrZ-fxl.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './wasm-web-BpK36a26.js';
import './deprecated-Dswa7XeN.js';
import './director-F7e_Lqjg.js';
import './zlib.min-3VC1ush6.js';
import './capsule-9D-8tsOp.js';

function toPPM(buffer, w, h) {
  return "P3 " + w + " " + h + " 255\n" + buffer.filter(function (e, i) {
    return i % 4 < 3;
  }).toString() + "\n";
}

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MeshUtils: MeshUtils,
    createMesh: _createMesh,
    find: find,
    mapBuffer: mapBuffer,
    readBuffer: readBuffer,
    readMesh: readMesh,
    toPPM: toPPM,
    writeBuffer: writeBuffer
});

function checkMaterialisSame(comp1, comp2) {
  var matNum = comp1.sharedMaterials.length;
  if (matNum !== comp2.sharedMaterials.length) {
    return false;
  }
  for (var i = 0; i < matNum; i++) {
    if (comp1.getRenderMaterial(i) !== comp2.getRenderMaterial(i)) {
      return false;
    }
  }
  return true;
}
var BatchingUtility = function () {
  function BatchingUtility() {}
  BatchingUtility.batchStaticModel = function batchStaticModel(staticModelRoot, batchedRoot) {
    var models = staticModelRoot.getComponentsInChildren(MeshRenderer);
    if (models.length < 2) {
      console.error('the number of static models to batch is less than 2,it needn\'t batch.');
      return false;
    }
    for (var i = 1; i < models.length; i++) {
      if (!models[0].mesh.validateMergingMesh(models[i].mesh)) {
        console.error("the meshes of " + models[0].node.name + " and " + models[i].node.name + " can't be merged");
        return false;
      }
      if (!checkMaterialisSame(models[0], models[i])) {
        console.error("the materials of " + models[0].node.name + " and " + models[i].node.name + " can't be merged");
        return false;
      }
    }
    var batchedMesh = new Mesh();
    var worldMat = new Mat4();
    var rootWorldMatInv = new Mat4();
    staticModelRoot.getWorldMatrix(rootWorldMatInv);
    Mat4.invert(rootWorldMatInv, rootWorldMatInv);
    for (var _i = 0; _i < models.length; _i++) {
      var comp = models[_i];
      comp.node.getWorldMatrix(worldMat);
      Mat4.multiply(worldMat, rootWorldMatInv, worldMat);
      batchedMesh.merge(models[_i].mesh, worldMat);
      comp.enabled = false;
    }
    var batchedModel = batchedRoot.addComponent(MeshRenderer);
    batchedModel.mesh = batchedMesh;
    batchedModel.sharedMaterials = models[0].sharedMaterials;
    return true;
  };
  BatchingUtility.unbatchStaticModel = function unbatchStaticModel(staticModelRoot, batchedRoot) {
    var models = staticModelRoot.getComponentsInChildren(MeshRenderer);
    for (var i = 0; i < models.length; i++) {
      var comp = models[i];
      comp.enabled = true;
    }
    var batchedModel = batchedRoot.getComponent(MeshRenderer);
    if (batchedModel) {
      if (batchedModel.mesh) {
        batchedModel.mesh.destroyRenderingMesh();
      }
      batchedModel.destroy();
    }
    return true;
  };
  return BatchingUtility;
}();

removeProperty(MeshRenderer.prototype, 'MeshRenderer.prototype', [{
  name: 'enableDynamicBatching'
}, {
  name: 'recieveShadows'
}]);
cclegacy.ModelComponent = MeshRenderer;
setClassAlias(MeshRenderer, 'cc.ModelComponent');

var _dec$7, _class$7, _class2$7, _initializer$7, _initializer2$7, _initializer3$6, _dec2$7, _dec3$7, _dec4$6, _class3$1, _class4$1, _initializer4$6, _initializer5$5, _initializer6$3, _initializer7$3, _initializer8$3, _Light;
var _color_tmp = new Vec3();
var PhotometricTerm = Enum({
  LUMINOUS_FLUX: 0,
  LUMINANCE: 1
});
var StaticLightSettings = (_dec$7 = ccclass$2('cc.StaticLightSettings'), _dec$7(_class$7 = (_class2$7 = function () {
  function StaticLightSettings() {
    this._baked = _initializer$7 && _initializer$7();
    this._editorOnly = _initializer2$7 && _initializer2$7();
    this._castShadow = _initializer3$6 && _initializer3$6();
  }
  return _createClass(StaticLightSettings, [{
    key: "editorOnly",
    get: function get() {
      return this._editorOnly;
    },
    set: function set(val) {
      this._editorOnly = val;
    }
  }, {
    key: "baked",
    get: function get() {
      return this._baked;
    },
    set: function set(val) {
      this._baked = val;
    }
  }, {
    key: "castShadow",
    get: function get() {
      return this._castShadow;
    },
    set: function set(val) {
      this._castShadow = val;
    }
  }]);
}(), _initializer$7 = applyDecoratedInitializer(_class2$7.prototype, "_baked", [serializable$2], function () {
  return false;
}), _initializer2$7 = applyDecoratedInitializer(_class2$7.prototype, "_editorOnly", [serializable$2], function () {
  return false;
}), _initializer3$6 = applyDecoratedInitializer(_class2$7.prototype, "_castShadow", [serializable$2], function () {
  return false;
}), _class2$7)) || _class$7);
var Light = (_dec2$7 = ccclass$2('cc.Light'), _dec3$7 = type$2(StaticLightSettings), _dec4$6 = type$2(Layers.BitMask), _dec2$7(_class3$1 = (_class4$1 = (_Light = function (_Component) {
  function Light() {
    var _this;
    _this = _Component.call(this) || this;
    _this._color = _initializer4$6 && _initializer4$6();
    _this._useColorTemperature = _initializer5$5 && _initializer5$5();
    _this._colorTemperature = _initializer6$3 && _initializer6$3();
    _this._staticSettings = _initializer7$3 && _initializer7$3();
    _this._visibility = _initializer8$3 && _initializer8$3();
    _this._type = LightType.UNKNOWN;
    _this._lightType = void 0;
    _this._light = null;
    _this._lightType = Light$1;
    return _this;
  }
  _inheritsLoose(Light, _Component);
  var _proto = Light.prototype;
  _proto.onLoad = function onLoad() {
    this._createLight();
  };
  _proto.onEnable = function onEnable() {
    this._attachToScene();
  };
  _proto.onDisable = function onDisable() {
    this._detachFromScene();
  };
  _proto.onDestroy = function onDestroy() {
    this._destroyLight();
  };
  _proto._createLight = function _createLight() {
    if (!this._light) {
      this._light = cclegacy.director.root.createLight(this._lightType);
    }
    this.color = this._color;
    this.useColorTemperature = this._useColorTemperature;
    this.colorTemperature = this._colorTemperature;
    this._light.node = this.node;
    this._light.baked = this.baked;
    this._light.visibility = this.visibility;
  };
  _proto._destroyLight = function _destroyLight() {
    if (this._light) {
      cclegacy.director.root.recycleLight(this._light);
      this._light = null;
    }
  };
  _proto._attachToScene = function _attachToScene() {
    this._detachFromScene();
    if (this._light && !this._light.scene && this.node.scene) {
      var renderScene = this._getRenderScene();
      switch (this._type) {
        case LightType.DIRECTIONAL:
          renderScene.addDirectionalLight(this._light);
          renderScene.setMainLight(this._light);
          break;
        case LightType.SPHERE:
          renderScene.addSphereLight(this._light);
          break;
        case LightType.SPOT:
          renderScene.addSpotLight(this._light);
          break;
        case LightType.POINT:
          renderScene.addPointLight(this._light);
          break;
        case LightType.RANGED_DIRECTIONAL:
          renderScene.addRangedDirLight(this._light);
          break;
      }
    }
  };
  _proto._detachFromScene = function _detachFromScene() {
    if (this._light && this._light.scene) {
      var renderScene = this._light.scene;
      switch (this._type) {
        case LightType.DIRECTIONAL:
          renderScene.removeDirectionalLight(this._light);
          renderScene.unsetMainLight(this._light);
          break;
        case LightType.SPHERE:
          renderScene.removeSphereLight(this._light);
          break;
        case LightType.SPOT:
          renderScene.removeSpotLight(this._light);
          break;
        case LightType.POINT:
          renderScene.removePointLight(this._light);
          break;
        case LightType.RANGED_DIRECTIONAL:
          renderScene.removeRangedDirLight(this._light);
          break;
      }
    }
  };
  _proto._onUpdateReceiveDirLight = function _onUpdateReceiveDirLight() {};
  return _createClass(Light, [{
    key: "color",
    get: function get() {
      return this._color;
    },
    set: function set(val) {
      this._color = val.clone();
      if (this._light) {
        _color_tmp.x = val.r / 255.0;
        _color_tmp.y = val.g / 255.0;
        _color_tmp.z = val.b / 255.0;
        this._light.color = _color_tmp;
      }
    }
  }, {
    key: "useColorTemperature",
    get: function get() {
      return this._useColorTemperature;
    },
    set: function set(enable) {
      this._useColorTemperature = enable;
      if (this._light) {
        this._light.useColorTemperature = enable;
      }
    }
  }, {
    key: "colorTemperature",
    get: function get() {
      return this._colorTemperature;
    },
    set: function set(val) {
      this._colorTemperature = val;
      if (this._light) {
        this._light.colorTemperature = val;
      }
    }
  }, {
    key: "staticSettings",
    get: function get() {
      return this._staticSettings;
    },
    set: function set(val) {
      this._staticSettings = val;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    }
  }, {
    key: "baked",
    get: function get() {
      return this.staticSettings.baked;
    },
    set: function set(val) {
      this.staticSettings.baked = val;
      if (this._light !== null) {
        this._light.baked = val;
      }
    }
  }, {
    key: "visibility",
    get: function get() {
      return this._visibility;
    },
    set: function set(vis) {
      this._visibility = vis;
      if (this._light) {
        this._light.visibility = vis;
      }
      this._onUpdateReceiveDirLight();
    }
  }]);
}(Component), _Light.Type = LightType, _Light.PhotometricTerm = PhotometricTerm, _Light), _initializer4$6 = applyDecoratedInitializer(_class4$1.prototype, "_color", [serializable$2], function () {
  return Color.WHITE.clone();
}), _initializer5$5 = applyDecoratedInitializer(_class4$1.prototype, "_useColorTemperature", [serializable$2], function () {
  return false;
}), _initializer6$3 = applyDecoratedInitializer(_class4$1.prototype, "_colorTemperature", [serializable$2], function () {
  return 6550;
}), _initializer7$3 = applyDecoratedInitializer(_class4$1.prototype, "_staticSettings", [serializable$2], function () {
  return new StaticLightSettings();
}), _initializer8$3 = applyDecoratedInitializer(_class4$1.prototype, "_visibility", [serializable$2], function () {
  return CAMERA_DEFAULT_MASK;
}), _applyDecoratedDescriptor(_class4$1.prototype, "staticSettings", [_dec3$7], Object.getOwnPropertyDescriptor(_class4$1.prototype, "staticSettings"), _class4$1.prototype), _applyDecoratedDescriptor(_class4$1.prototype, "visibility", [_dec4$6], Object.getOwnPropertyDescriptor(_class4$1.prototype, "visibility"), _class4$1.prototype), _class4$1)) || _class3$1);

var _dec$6, _dec2$6, _dec3$6, _dec4$5, _dec5$5, _dec6$5, _dec7$4, _dec8$3, _dec9$2, _dec0$2, _dec1$1, _dec10$1, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _class$6, _class2$6, _initializer$6, _initializer2$6, _initializer3$5, _initializer4$5, _initializer5$4, _initializer6$2, _initializer7$2, _initializer8$2, _initializer9$2, _initializer0$2, _initializer1$1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17;
var ccclass$1 = ccclass$2,
  property$1 = property$2,
  serializable$1 = serializable$2,
  formerlySerializedAs$1 = formerlySerializedAs$2,
  type$1 = type$2;
var DirectionalLight = (_dec$6 = ccclass$1('cc.DirectionalLight'), _dec2$6 = formerlySerializedAs$1('_illuminance'), _dec3$6 = type$1(CCInteger), _dec4$5 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 1
  }
}), _dec5$5 = type$1(CCBoolean), _dec6$5 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 5
  }
}), _dec7$4 = type$1(PCFType), _dec8$3 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 6
  }
}), _dec9$2 = type$1(CCFloat), _dec0$2 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 7
  }
}), _dec1$1 = type$1(CCFloat), _dec10$1 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 8
  }
}), _dec11 = type$1(CCFloat), _dec12 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 9
  }
}), _dec13 = type$1(CCFloat), _dec14 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 22
  }
}), _dec15 = type$1(CCFloat), _dec16 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 10
  }
}), _dec17 = type$1(CSMLevel), _dec18 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 11
  }
}), _dec19 = type$1(CCBoolean), _dec20 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 12
  }
}), _dec21 = type$1(CCFloat), _dec22 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 13
  }
}), _dec23 = type$1(CSMOptimizationMode), _dec24 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 14
  }
}), _dec25 = type$1(CCBoolean), _dec26 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 15
  }
}), _dec27 = type$1(CCFloat), _dec28 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 16
  }
}), _dec29 = type$1(CCFloat), _dec30 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 17
  }
}), _dec31 = type$1(CCFloat), _dec32 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 19
  }
}), _dec33 = type$1(CCBoolean), _dec34 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 20
  }
}), _dec35 = type$1(CCBoolean), _dec36 = property$1({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 21
  }
}), _dec37 = type$1(CCFloat), _dec$6(_class$6 = (_class2$6 = function (_Light) {
  function DirectionalLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._illuminanceHDR = _initializer$6 && _initializer$6();
    _this._illuminanceLDR = _initializer2$6 && _initializer2$6();
    _this._shadowEnabled = _initializer3$5 && _initializer3$5();
    _this._shadowPcf = _initializer4$5 && _initializer4$5();
    _this._shadowBias = _initializer5$4 && _initializer5$4();
    _this._shadowNormalBias = _initializer6$2 && _initializer6$2();
    _this._shadowSaturation = _initializer7$2 && _initializer7$2();
    _this._shadowDistance = _initializer8$2 && _initializer8$2();
    _this._shadowInvisibleOcclusionRange = _initializer9$2 && _initializer9$2();
    _this._csmLevel = _initializer0$2 && _initializer0$2();
    _this._csmLayerLambda = _initializer1$1 && _initializer1$1();
    _this._csmOptimizationMode = _initializer10 && _initializer10();
    _this._csmAdvancedOptions = _initializer11 && _initializer11();
    _this._csmLayersTransition = _initializer12 && _initializer12();
    _this._csmTransitionRange = _initializer13 && _initializer13();
    _this._shadowFixedArea = _initializer14 && _initializer14();
    _this._shadowNear = _initializer15 && _initializer15();
    _this._shadowFar = _initializer16 && _initializer16();
    _this._shadowOrthoSize = _initializer17 && _initializer17();
    _this._lightType = DirectionalLight$1;
    var highQualityMode = settings.querySettings(SettingsCategory.RENDERING, 'highQualityMode');
    if (highQualityMode) {
      _this._shadowPcf = PCFType.SOFT_2X;
      _this._shadowDistance = 50;
      _this.enableCSM = true;
      _this.staticSettings.castShadow = true;
    }
    return _this;
  }
  _inheritsLoose(DirectionalLight, _Light);
  var _proto = DirectionalLight.prototype;
  _proto._createLight = function _createLight() {
    _Light.prototype._createLight.call(this);
    this._type = LightType.DIRECTIONAL;
    if (this._light) {
      var dirLight = this._light;
      dirLight.illuminanceHDR = this._illuminanceHDR;
      dirLight.illuminanceLDR = this._illuminanceLDR;
      dirLight.shadowEnabled = this._shadowEnabled;
      dirLight.shadowPcf = this._shadowPcf;
      dirLight.shadowBias = this._shadowBias;
      dirLight.shadowNormalBias = this._shadowNormalBias;
      dirLight.shadowSaturation = this._shadowSaturation;
      dirLight.shadowDistance = this._shadowDistance;
      dirLight.shadowInvisibleOcclusionRange = this._shadowInvisibleOcclusionRange;
      dirLight.shadowFixedArea = this._shadowFixedArea;
      dirLight.shadowNear = this._shadowNear;
      dirLight.shadowFar = this._shadowFar;
      dirLight.shadowOrthoSize = this._shadowOrthoSize;
      dirLight.csmLevel = this._csmLevel;
      dirLight.csmLayerLambda = this._csmLayerLambda;
      dirLight.csmOptimizationMode = this._csmOptimizationMode;
      dirLight.csmLayersTransition = this._csmLayersTransition;
      dirLight.csmTransitionRange = this._csmTransitionRange;
    }
  };
  _proto._onUpdateReceiveDirLight = function _onUpdateReceiveDirLight() {
    if (!this._light) {
      return;
    }
    _Light.prototype._onUpdateReceiveDirLight.call(this);
    var scene = this.node.scene;
    if (!scene || !scene.renderScene) {
      return;
    }
    if (scene.renderScene.mainLight !== this._light) {
      return;
    }
    var models = scene.renderScene.models;
    for (var i = 0; i < models.length; i++) {
      var model = models[i];
      if (!model.node) continue;
      var meshRender = model.node.getComponent(MeshRenderer);
      if (!meshRender) continue;
      meshRender.onUpdateReceiveDirLight(this._visibility);
    }
  };
  return _createClass(DirectionalLight, [{
    key: "illuminance",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._illuminanceHDR;
      } else {
        return this._illuminanceLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._illuminanceHDR = val;
        this._light && (this._light.illuminanceHDR = this._illuminanceHDR);
      } else {
        this._illuminanceLDR = val;
        this._light && (this._light.illuminanceLDR = this._illuminanceLDR);
      }
    }
  }, {
    key: "shadowEnabled",
    get: function get() {
      return this._shadowEnabled;
    },
    set: function set(val) {
      this._shadowEnabled = val;
      if (this._light) {
        this._light.shadowEnabled = this._shadowEnabled;
      }
    }
  }, {
    key: "shadowPcf",
    get: function get() {
      return this._shadowPcf;
    },
    set: function set(val) {
      this._shadowPcf = val;
      if (this._light) {
        this._light.shadowPcf = this._shadowPcf;
      }
    }
  }, {
    key: "shadowBias",
    get: function get() {
      return this._shadowBias;
    },
    set: function set(val) {
      this._shadowBias = val;
      if (this._light) {
        this._light.shadowBias = this._shadowBias;
      }
    }
  }, {
    key: "shadowNormalBias",
    get: function get() {
      return this._shadowNormalBias;
    },
    set: function set(val) {
      this._shadowNormalBias = val;
      if (this._light) {
        this._light.shadowNormalBias = this._shadowNormalBias;
      }
    }
  }, {
    key: "shadowSaturation",
    get: function get() {
      return this._shadowSaturation;
    },
    set: function set(val) {
      this._shadowSaturation = clamp(val, 0.0, 1.0);
      if (this._light) {
        this._light.shadowSaturation = this._shadowSaturation;
      }
    }
  }, {
    key: "shadowDistance",
    get: function get() {
      return this._shadowDistance;
    },
    set: function set(val) {
      this._shadowDistance = Math.min(val, Shadows.MAX_FAR);
      if (this._shadowDistance / 0.1 < 10.0) {
        warnID(15003, this._shadowDistance);
      }
      if (this._light) {
        this._light.shadowDistance = this._shadowDistance;
        this._light.csmNeedUpdate = true;
      }
    }
  }, {
    key: "shadowInvisibleOcclusionRange",
    get: function get() {
      return this._shadowInvisibleOcclusionRange;
    },
    set: function set(val) {
      this._shadowInvisibleOcclusionRange = Math.min(val, Shadows.MAX_FAR);
      if (this._light) {
        this._light.shadowInvisibleOcclusionRange = this._shadowInvisibleOcclusionRange;
      }
    }
  }, {
    key: "csmLevel",
    get: function get() {
      return this._csmLevel;
    },
    set: function set(val) {
      this._csmLevel = val;
      if (this._light) {
        this._light.csmLevel = this._csmLevel;
        this._light.csmNeedUpdate = true;
      }
    }
  }, {
    key: "enableCSM",
    get: function get() {
      return this._csmLevel > CSMLevel.LEVEL_1;
    },
    set: function set(val) {
      this._csmLevel = val ? CSMLevel.LEVEL_4 : CSMLevel.LEVEL_1;
      if (this._light) {
        this._light.csmLevel = this._csmLevel;
        this._light.csmNeedUpdate = true;
      }
    }
  }, {
    key: "csmLayerLambda",
    get: function get() {
      return this._csmLayerLambda;
    },
    set: function set(val) {
      this._csmLayerLambda = val;
      if (this._light) {
        this._light.csmLayerLambda = this._csmLayerLambda;
        this._light.csmNeedUpdate = true;
      }
    }
  }, {
    key: "csmOptimizationMode",
    get: function get() {
      return this._csmOptimizationMode;
    },
    set: function set(val) {
      this._csmOptimizationMode = val;
      if (this._light) {
        this._light.csmOptimizationMode = this._csmOptimizationMode;
      }
    }
  }, {
    key: "shadowFixedArea",
    get: function get() {
      return this._shadowFixedArea;
    },
    set: function set(val) {
      this._shadowFixedArea = val;
      if (this._light) {
        this._light.shadowFixedArea = this._shadowFixedArea;
      }
    }
  }, {
    key: "shadowNear",
    get: function get() {
      return this._shadowNear;
    },
    set: function set(val) {
      this._shadowNear = val;
      if (this._light) {
        this._light.shadowNear = this._shadowNear;
      }
    }
  }, {
    key: "shadowFar",
    get: function get() {
      return this._shadowFar;
    },
    set: function set(val) {
      this._shadowFar = Math.min(val, Shadows.MAX_FAR);
      if (this._light) {
        this._light.shadowFar = this._shadowFar;
      }
    }
  }, {
    key: "shadowOrthoSize",
    get: function get() {
      return this._shadowOrthoSize;
    },
    set: function set(val) {
      this._shadowOrthoSize = val;
      if (this._light) {
        this._light.shadowOrthoSize = this._shadowOrthoSize;
      }
    }
  }, {
    key: "csmAdvancedOptions",
    get: function get() {
      return this._csmAdvancedOptions;
    },
    set: function set(val) {
      this._csmAdvancedOptions = val;
    }
  }, {
    key: "csmLayersTransition",
    get: function get() {
      return this._csmLayersTransition;
    },
    set: function set(val) {
      this._csmLayersTransition = val;
      if (this._light) {
        this._light.csmLayersTransition = val;
      }
    }
  }, {
    key: "csmTransitionRange",
    get: function get() {
      return this._csmTransitionRange;
    },
    set: function set(val) {
      this._csmTransitionRange = val;
      if (this._light) {
        this._light.csmTransitionRange = val;
      }
    }
  }]);
}(Light), _initializer$6 = applyDecoratedInitializer(_class2$6.prototype, "_illuminanceHDR", [property$1, _dec2$6], function () {
  return 65000;
}), _initializer2$6 = applyDecoratedInitializer(_class2$6.prototype, "_illuminanceLDR", [serializable$1], function () {
  return 65000 * Camera.standardExposureValue;
}), _initializer3$5 = applyDecoratedInitializer(_class2$6.prototype, "_shadowEnabled", [serializable$1], function () {
  return false;
}), _initializer4$5 = applyDecoratedInitializer(_class2$6.prototype, "_shadowPcf", [serializable$1], function () {
  return PCFType.HARD;
}), _initializer5$4 = applyDecoratedInitializer(_class2$6.prototype, "_shadowBias", [serializable$1], function () {
  return 0.00001;
}), _initializer6$2 = applyDecoratedInitializer(_class2$6.prototype, "_shadowNormalBias", [serializable$1], function () {
  return 0.0;
}), _initializer7$2 = applyDecoratedInitializer(_class2$6.prototype, "_shadowSaturation", [serializable$1], function () {
  return 1.0;
}), _initializer8$2 = applyDecoratedInitializer(_class2$6.prototype, "_shadowDistance", [serializable$1], function () {
  return 50;
}), _initializer9$2 = applyDecoratedInitializer(_class2$6.prototype, "_shadowInvisibleOcclusionRange", [serializable$1], function () {
  return 200;
}), _initializer0$2 = applyDecoratedInitializer(_class2$6.prototype, "_csmLevel", [serializable$1], function () {
  return CSMLevel.LEVEL_4;
}), _initializer1$1 = applyDecoratedInitializer(_class2$6.prototype, "_csmLayerLambda", [serializable$1], function () {
  return 0.75;
}), _initializer10 = applyDecoratedInitializer(_class2$6.prototype, "_csmOptimizationMode", [serializable$1], function () {
  return CSMOptimizationMode.RemoveDuplicates;
}), _initializer11 = applyDecoratedInitializer(_class2$6.prototype, "_csmAdvancedOptions", [serializable$1], function () {
  return false;
}), _initializer12 = applyDecoratedInitializer(_class2$6.prototype, "_csmLayersTransition", [serializable$1], function () {
  return false;
}), _initializer13 = applyDecoratedInitializer(_class2$6.prototype, "_csmTransitionRange", [serializable$1], function () {
  return 0.05;
}), _initializer14 = applyDecoratedInitializer(_class2$6.prototype, "_shadowFixedArea", [serializable$1], function () {
  return false;
}), _initializer15 = applyDecoratedInitializer(_class2$6.prototype, "_shadowNear", [serializable$1], function () {
  return 0.1;
}), _initializer16 = applyDecoratedInitializer(_class2$6.prototype, "_shadowFar", [serializable$1], function () {
  return 10.0;
}), _initializer17 = applyDecoratedInitializer(_class2$6.prototype, "_shadowOrthoSize", [serializable$1], function () {
  return 5;
}), _applyDecoratedDescriptor(_class2$6.prototype, "illuminance", [_dec3$6], Object.getOwnPropertyDescriptor(_class2$6.prototype, "illuminance"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowEnabled", [_dec4$5, _dec5$5], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowEnabled"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowPcf", [_dec6$5, _dec7$4], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowPcf"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowBias", [_dec8$3, _dec9$2], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowBias"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowNormalBias", [_dec0$2, _dec1$1], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowNormalBias"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowSaturation", [_dec10$1, _dec11], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowSaturation"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowDistance", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowDistance"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowInvisibleOcclusionRange", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowInvisibleOcclusionRange"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "csmLevel", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2$6.prototype, "csmLevel"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "enableCSM", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2$6.prototype, "enableCSM"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "csmLayerLambda", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2$6.prototype, "csmLayerLambda"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "csmOptimizationMode", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2$6.prototype, "csmOptimizationMode"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowFixedArea", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowFixedArea"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowNear", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowNear"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowFar", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowFar"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "shadowOrthoSize", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2$6.prototype, "shadowOrthoSize"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "csmAdvancedOptions", [_dec32, _dec33], Object.getOwnPropertyDescriptor(_class2$6.prototype, "csmAdvancedOptions"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "csmLayersTransition", [_dec34, _dec35], Object.getOwnPropertyDescriptor(_class2$6.prototype, "csmLayersTransition"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "csmTransitionRange", [_dec36, _dec37], Object.getOwnPropertyDescriptor(_class2$6.prototype, "csmTransitionRange"), _class2$6.prototype), _class2$6)) || _class$6);

var _dec$5, _dec2$5, _dec3$5, _dec4$4, _dec5$4, _dec6$4, _dec7$3, _class$5, _class2$5, _initializer$5, _initializer2$5, _initializer3$4, _initializer4$4, _initializer5$3;
var SphereLight = (_dec$5 = ccclass$2('cc.SphereLight'), _dec2$5 = formerlySerializedAs$2('_luminance'), _dec3$5 = type$2(CCInteger), _dec4$4 = type$2(CCInteger), _dec5$4 = type$2(PhotometricTerm), _dec6$4 = type$2(CCFloat), _dec7$3 = type$2(CCFloat), _dec$5(_class$5 = (_class2$5 = function (_Light) {
  function SphereLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._size = _initializer$5 && _initializer$5();
    _this._luminanceHDR = _initializer2$5 && _initializer2$5();
    _this._luminanceLDR = _initializer3$4 && _initializer3$4();
    _this._term = _initializer4$4 && _initializer4$4();
    _this._range = _initializer5$3 && _initializer5$3();
    _this._lightType = SphereLight$1;
    return _this;
  }
  _inheritsLoose(SphereLight, _Light);
  var _proto = SphereLight.prototype;
  _proto._createLight = function _createLight() {
    _Light.prototype._createLight.call(this);
    this._type = LightType.SPHERE;
    this.size = this._size;
    this.range = this._range;
    if (this._light) {
      this._light.luminanceHDR = this._luminanceHDR;
      this._light.luminanceLDR = this._luminanceLDR;
    }
  };
  return _createClass(SphereLight, [{
    key: "luminousFlux",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._luminanceHDR * nt2lm(this._size);
      } else {
        return this._luminanceLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      var result = 0;
      if (isHDR) {
        this._luminanceHDR = val / nt2lm(this._size);
        result = this._luminanceHDR;
      } else {
        this._luminanceLDR = val;
        result = this._luminanceLDR;
      }
      this._light && (this._light.luminance = result);
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
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._luminanceHDR = val;
        this._light && (this._light.luminanceHDR = this._luminanceHDR);
      } else {
        this._luminanceLDR = val;
        this._light && (this._light.luminanceLDR = this._luminanceLDR);
      }
    }
  }, {
    key: "term",
    get: function get() {
      return this._term;
    },
    set: function set(val) {
      this._term = val;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(val) {
      this._size = val;
      if (this._light) {
        this._light.size = val;
      }
    }
  }, {
    key: "range",
    get: function get() {
      return this._range;
    },
    set: function set(val) {
      this._range = val;
      if (this._light) {
        this._light.range = val;
      }
    }
  }]);
}(Light), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "_size", [serializable$2], function () {
  return 0.15;
}), _initializer2$5 = applyDecoratedInitializer(_class2$5.prototype, "_luminanceHDR", [serializable$2, _dec2$5], function () {
  return 1700 / nt2lm(0.15);
}), _initializer3$4 = applyDecoratedInitializer(_class2$5.prototype, "_luminanceLDR", [serializable$2], function () {
  return 1700 / nt2lm(0.15) * Camera.standardExposureValue * Camera.standardLightMeterScale;
}), _initializer4$4 = applyDecoratedInitializer(_class2$5.prototype, "_term", [serializable$2], function () {
  return PhotometricTerm.LUMINOUS_FLUX;
}), _initializer5$3 = applyDecoratedInitializer(_class2$5.prototype, "_range", [serializable$2], function () {
  return 1;
}), _applyDecoratedDescriptor(_class2$5.prototype, "luminousFlux", [_dec3$5], Object.getOwnPropertyDescriptor(_class2$5.prototype, "luminousFlux"), _class2$5.prototype), _applyDecoratedDescriptor(_class2$5.prototype, "luminance", [_dec4$4], Object.getOwnPropertyDescriptor(_class2$5.prototype, "luminance"), _class2$5.prototype), _applyDecoratedDescriptor(_class2$5.prototype, "term", [_dec5$4], Object.getOwnPropertyDescriptor(_class2$5.prototype, "term"), _class2$5.prototype), _applyDecoratedDescriptor(_class2$5.prototype, "size", [_dec6$4], Object.getOwnPropertyDescriptor(_class2$5.prototype, "size"), _class2$5.prototype), _applyDecoratedDescriptor(_class2$5.prototype, "range", [_dec7$3], Object.getOwnPropertyDescriptor(_class2$5.prototype, "range"), _class2$5.prototype), _class2$5)) || _class$5);

var _dec$4, _dec2$4, _dec3$4, _dec4$3, _dec5$3, _dec6$3, _dec7$2, _dec8$2, _dec9$1, _dec0$1, _dec1, _dec10, _class$4, _class2$4, _initializer$4, _initializer2$4, _initializer3$3, _initializer4$3, _initializer5$2, _initializer6$1, _initializer7$1, _initializer8$1, _initializer9$1, _initializer0$1, _initializer1;
var ccclass = ccclass$2,
  type = type$2,
  serializable = serializable$2,
  formerlySerializedAs = formerlySerializedAs$2,
  property = property$2;
var SpotLight = (_dec$4 = ccclass('cc.SpotLight'), _dec2$4 = formerlySerializedAs('_luminance'), _dec3$4 = type(PhotometricTerm), _dec4$3 = type(CCFloat), _dec5$3 = property({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 1
  }
}), _dec6$3 = type(CCBoolean), _dec7$2 = property({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 2
  }
}), _dec8$2 = type(PCFType), _dec9$1 = property({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 3
  }
}), _dec0$1 = type(CCFloat), _dec1 = property({
  group: {
    name: 'DynamicShadowSettings',
    displayOrder: 4
  }
}), _dec10 = type(CCFloat), _dec$4(_class$4 = (_class2$4 = function (_Light) {
  function SpotLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._size = _initializer$4 && _initializer$4();
    _this._luminanceHDR = _initializer2$4 && _initializer2$4();
    _this._luminanceLDR = _initializer3$3 && _initializer3$3();
    _this._term = _initializer4$3 && _initializer4$3();
    _this._range = _initializer5$2 && _initializer5$2();
    _this._spotAngle = _initializer6$1 && _initializer6$1();
    _this._angleAttenuationStrength = _initializer7$1 && _initializer7$1();
    _this._shadowEnabled = _initializer8$1 && _initializer8$1();
    _this._shadowPcf = _initializer9$1 && _initializer9$1();
    _this._shadowBias = _initializer0$1 && _initializer0$1();
    _this._shadowNormalBias = _initializer1 && _initializer1();
    _this._lightType = SpotLight$1;
    return _this;
  }
  _inheritsLoose(SpotLight, _Light);
  var _proto = SpotLight.prototype;
  _proto._createLight = function _createLight() {
    _Light.prototype._createLight.call(this);
    this._type = LightType.SPOT;
    this.size = this._size;
    this.range = this._range;
    this.spotAngle = this._spotAngle;
    this.angleAttenuationStrength = this._angleAttenuationStrength;
    if (this._light) {
      var spotLight = this._light;
      spotLight.luminanceHDR = this._luminanceHDR;
      spotLight.luminanceLDR = this._luminanceLDR;
      spotLight.shadowEnabled = this._shadowEnabled;
      spotLight.shadowPcf = this._shadowPcf;
      spotLight.shadowBias = this._shadowBias;
      spotLight.shadowNormalBias = this._shadowNormalBias;
    }
  };
  return _createClass(SpotLight, [{
    key: "luminousFlux",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._luminanceHDR * nt2lm(this._size);
      } else {
        return this._luminanceLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      var result = 0;
      if (isHDR) {
        this._luminanceHDR = val / nt2lm(this._size);
        result = this._luminanceHDR;
      } else {
        this._luminanceLDR = val;
        result = this._luminanceLDR;
      }
      this._light && (this._light.luminance = result);
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
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._luminanceHDR = val;
        this._light && (this._light.luminanceHDR = this._luminanceHDR);
      } else {
        this._luminanceLDR = val;
        this._light && (this._light.luminanceLDR = this._luminanceLDR);
      }
    }
  }, {
    key: "term",
    get: function get() {
      return this._term;
    },
    set: function set(val) {
      this._term = val;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(val) {
      this._size = val;
      if (this._light) {
        this._light.size = val;
      }
    }
  }, {
    key: "range",
    get: function get() {
      return this._range;
    },
    set: function set(val) {
      this._range = val;
      if (this._light) {
        this._light.range = val;
      }
    }
  }, {
    key: "spotAngle",
    get: function get() {
      return this._spotAngle;
    },
    set: function set(val) {
      this._spotAngle = val;
      if (this._light) {
        this._light.spotAngle = toRadian(val);
      }
    }
  }, {
    key: "angleAttenuationStrength",
    get: function get() {
      return this._angleAttenuationStrength;
    },
    set: function set(val) {
      this._angleAttenuationStrength = val;
      if (this._light) {
        this._light.angleAttenuationStrength = val;
      }
    }
  }, {
    key: "shadowEnabled",
    get: function get() {
      return this._shadowEnabled;
    },
    set: function set(val) {
      this._shadowEnabled = val;
      if (this._light) {
        this._light.shadowEnabled = val;
      }
    }
  }, {
    key: "shadowPcf",
    get: function get() {
      return this._shadowPcf;
    },
    set: function set(val) {
      this._shadowPcf = val;
      if (this._light) {
        this._light.shadowPcf = val;
      }
    }
  }, {
    key: "shadowBias",
    get: function get() {
      return this._shadowBias;
    },
    set: function set(val) {
      this._shadowBias = val;
      if (this._light) {
        this._light.shadowBias = val;
      }
    }
  }, {
    key: "shadowNormalBias",
    get: function get() {
      return this._shadowNormalBias;
    },
    set: function set(val) {
      this._shadowNormalBias = val;
      if (this._light) {
        this._light.shadowNormalBias = val;
      }
    }
  }]);
}(Light), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "_size", [serializable], function () {
  return 0.15;
}), _initializer2$4 = applyDecoratedInitializer(_class2$4.prototype, "_luminanceHDR", [serializable, _dec2$4], function () {
  return 1700 / nt2lm(0.15);
}), _initializer3$3 = applyDecoratedInitializer(_class2$4.prototype, "_luminanceLDR", [serializable], function () {
  return 1700 / nt2lm(0.15) * Camera.standardExposureValue * Camera.standardLightMeterScale;
}), _initializer4$3 = applyDecoratedInitializer(_class2$4.prototype, "_term", [serializable], function () {
  return PhotometricTerm.LUMINOUS_FLUX;
}), _initializer5$2 = applyDecoratedInitializer(_class2$4.prototype, "_range", [serializable], function () {
  return 1;
}), _initializer6$1 = applyDecoratedInitializer(_class2$4.prototype, "_spotAngle", [serializable], function () {
  return 60;
}), _initializer7$1 = applyDecoratedInitializer(_class2$4.prototype, "_angleAttenuationStrength", [serializable], function () {
  return 0;
}), _initializer8$1 = applyDecoratedInitializer(_class2$4.prototype, "_shadowEnabled", [serializable], function () {
  return false;
}), _initializer9$1 = applyDecoratedInitializer(_class2$4.prototype, "_shadowPcf", [serializable], function () {
  return PCFType.HARD;
}), _initializer0$1 = applyDecoratedInitializer(_class2$4.prototype, "_shadowBias", [serializable], function () {
  return 0.00001;
}), _initializer1 = applyDecoratedInitializer(_class2$4.prototype, "_shadowNormalBias", [serializable], function () {
  return 0.0;
}), _applyDecoratedDescriptor(_class2$4.prototype, "term", [_dec3$4], Object.getOwnPropertyDescriptor(_class2$4.prototype, "term"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "size", [_dec4$3], Object.getOwnPropertyDescriptor(_class2$4.prototype, "size"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "shadowEnabled", [_dec5$3, _dec6$3], Object.getOwnPropertyDescriptor(_class2$4.prototype, "shadowEnabled"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "shadowPcf", [_dec7$2, _dec8$2], Object.getOwnPropertyDescriptor(_class2$4.prototype, "shadowPcf"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "shadowBias", [_dec9$1, _dec0$1], Object.getOwnPropertyDescriptor(_class2$4.prototype, "shadowBias"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "shadowNormalBias", [_dec1, _dec10], Object.getOwnPropertyDescriptor(_class2$4.prototype, "shadowNormalBias"), _class2$4.prototype), _class2$4)) || _class$4);

var _dec$3, _dec2$3, _dec3$3, _dec4$2, _dec5$2, _dec6$2, _class$3, _class2$3, _initializer$3, _initializer2$3, _initializer3$2, _initializer4$2;
var PointLight = (_dec$3 = ccclass$2('cc.PointLight'), _dec2$3 = formerlySerializedAs$2('_luminance'), _dec3$3 = type$2(CCInteger), _dec4$2 = type$2(CCInteger), _dec5$2 = type$2(PhotometricTerm), _dec6$2 = type$2(CCFloat), _dec$3(_class$3 = (_class2$3 = function (_Light) {
  function PointLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._luminanceHDR = _initializer$3 && _initializer$3();
    _this._luminanceLDR = _initializer2$3 && _initializer2$3();
    _this._term = _initializer3$2 && _initializer3$2();
    _this._range = _initializer4$2 && _initializer4$2();
    _this._lightType = PointLight$1;
    return _this;
  }
  _inheritsLoose(PointLight, _Light);
  var _proto = PointLight.prototype;
  _proto._createLight = function _createLight() {
    _Light.prototype._createLight.call(this);
    this._type = LightType.POINT;
    this.range = this._range;
    if (this._light) {
      this._light.luminanceHDR = this._luminanceHDR;
      this._light.luminanceLDR = this._luminanceLDR;
    }
  };
  return _createClass(PointLight, [{
    key: "luminousFlux",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._luminanceHDR * nt2lm(1.0);
      } else {
        return this._luminanceLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      var result = 0;
      if (isHDR) {
        this._luminanceHDR = val / nt2lm(1.0);
        result = this._luminanceHDR;
      } else {
        this._luminanceLDR = val;
        result = this._luminanceLDR;
      }
      this._light && (this._light.luminance = result);
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
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._luminanceHDR = val;
        this._light && (this._light.luminanceHDR = this._luminanceHDR);
      } else {
        this._luminanceLDR = val;
        this._light && (this._light.luminanceLDR = this._luminanceLDR);
      }
    }
  }, {
    key: "term",
    get: function get() {
      return this._term;
    },
    set: function set(val) {
      this._term = val;
    }
  }, {
    key: "range",
    get: function get() {
      return this._range;
    },
    set: function set(val) {
      this._range = val;
      if (this._light) {
        this._light.range = val;
      }
    }
  }]);
}(Light), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "_luminanceHDR", [serializable$2, _dec2$3], function () {
  return 1700 / nt2lm(0.15);
}), _initializer2$3 = applyDecoratedInitializer(_class2$3.prototype, "_luminanceLDR", [serializable$2], function () {
  return 1700 / nt2lm(0.15) * Camera.standardExposureValue * Camera.standardLightMeterScale;
}), _initializer3$2 = applyDecoratedInitializer(_class2$3.prototype, "_term", [serializable$2], function () {
  return PhotometricTerm.LUMINOUS_FLUX;
}), _initializer4$2 = applyDecoratedInitializer(_class2$3.prototype, "_range", [serializable$2], function () {
  return 1;
}), _applyDecoratedDescriptor(_class2$3.prototype, "luminousFlux", [_dec3$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "luminousFlux"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "luminance", [_dec4$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "luminance"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "term", [_dec5$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "term"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "range", [_dec6$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "range"), _class2$3.prototype), _class2$3)) || _class$3);

var _dec$2, _dec2$2, _dec3$2, _class$2, _class2$2, _initializer$2, _initializer2$2;
var RangedDirectionalLight = (_dec$2 = ccclass$2('cc.RangedDirectionalLight'), _dec2$2 = formerlySerializedAs$2('_illuminance'), _dec3$2 = type$2(CCInteger), _dec$2(_class$2 = (_class2$2 = function (_Light) {
  function RangedDirectionalLight() {
    var _this;
    _this = _Light.call(this) || this;
    _this._illuminanceHDR = _initializer$2 && _initializer$2();
    _this._illuminanceLDR = _initializer2$2 && _initializer2$2();
    _this._lightType = RangedDirectionalLight$1;
    return _this;
  }
  _inheritsLoose(RangedDirectionalLight, _Light);
  var _proto = RangedDirectionalLight.prototype;
  _proto._createLight = function _createLight() {
    _Light.prototype._createLight.call(this);
    this._type = LightType.RANGED_DIRECTIONAL;
    if (this._light) {
      this._light.illuminanceHDR = this._illuminanceHDR;
      this._light.illuminanceLDR = this._illuminanceLDR;
    }
  };
  return _createClass(RangedDirectionalLight, [{
    key: "illuminance",
    get: function get() {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        return this._illuminanceHDR;
      } else {
        return this._illuminanceLDR;
      }
    },
    set: function set(val) {
      var isHDR = getPipelineSceneData().isHDR;
      if (isHDR) {
        this._illuminanceHDR = val;
        this._light && (this._light.illuminanceHDR = this._illuminanceHDR);
      } else {
        this._illuminanceLDR = val;
        this._light && (this._light.illuminanceLDR = this._illuminanceLDR);
      }
    }
  }]);
}(Light), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_illuminanceHDR", [property$2, _dec2$2], function () {
  return 65000;
}), _initializer2$2 = applyDecoratedInitializer(_class2$2.prototype, "_illuminanceLDR", [serializable$2], function () {
  return 65000 * Camera.standardExposureValue;
}), _applyDecoratedDescriptor(_class2$2.prototype, "illuminance", [_dec3$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "illuminance"), _class2$2.prototype), _class2$2)) || _class$2);

cclegacy.LightComponent = Light;
setClassAlias(Light, 'cc.LightComponent');
cclegacy.DirectionalLightComponent = DirectionalLight;
setClassAlias(DirectionalLight, 'cc.DirectionalLightComponent');
cclegacy.SphereLightComponent = SphereLight;
setClassAlias(SphereLight, 'cc.SphereLightComponent');
cclegacy.SpotLightComponent = SpotLight;
setClassAlias(SpotLight, 'cc.SpotLightComponent');
replaceProperty(SpotLight.prototype, 'SpotLight.prototype', [{
  name: 'luminousPower',
  newName: 'luminousFlux',
  customGetter: function customGetter() {
    return this.luminousFlux;
  },
  customSetter: function customSetter(value) {
    this.luminousFlux = value;
  }
}]);
replaceProperty(SphereLight.prototype, 'SphereLight.prototype', [{
  name: 'luminousPower',
  newName: 'luminousFlux',
  customGetter: function customGetter() {
    return this.luminousFlux;
  },
  customSetter: function customSetter(value) {
    this.luminousFlux = value;
  }
}]);
replaceProperty(Light.PhotometricTerm, 'Light.PhotometricTerm', [{
  name: 'LUMINOUS_POWER',
  newName: 'LUMINOUS_FLUX'
}]);

var _dec$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _class$1, _class2$1, _initializer$1, _initializer2$1, _dec6$1, _dec7$1, _dec8$1, _class3, _class4, _initializer3$1, _initializer4$1, _initializer5$1;
var DEFAULT_SCREEN_OCCUPATION = [0.25, 0.125, 0.01];
var LOD = (_dec$1 = ccclass$2('cc.LOD'), _dec2$1 = type$2([MeshRenderer]), _dec3$1 = type$2(CCFloat), _dec4$1 = type$2([MeshRenderer]), _dec5$1 = type$2([CCInteger]), _dec$1(_class$1 = (_class2$1 = function () {
  function LOD() {
    this._screenUsagePercentage = _initializer$1 && _initializer$1();
    this._renderers = _initializer2$1 && _initializer2$1();
    this._LODData = new LODData();
    this._modelAddedCallback = void 0;
    this._LODData.screenUsagePercentage = this._screenUsagePercentage;
    this._modelAddedCallback = null;
  }
  var _proto = LOD.prototype;
  _proto.insertRenderer = function insertRenderer(index, renderer) {
    if (index < 0 || index > this._renderers.length) {
      index = this._renderers.length;
    }
    this._renderers.splice(index, 0, renderer);
    var modelAdded = false;
    if (renderer.model) {
      modelAdded = true;
      this._LODData.addModel(renderer.model);
    }
    if (this._modelAddedCallback && modelAdded) {
      this._modelAddedCallback();
    }
    return renderer;
  };
  _proto.deleteRenderer = function deleteRenderer(index) {
    var _renders$;
    var renders = this._renderers.splice(index, 1);
    var model = renders.length > 0 ? (_renders$ = renders[0]) == null ? void 0 : _renders$.model : null;
    if (model) {
      this._LODData.eraseModel(model);
    }
    return renders[0];
  };
  _proto.getRenderer = function getRenderer(index) {
    return this._renderers[index] || null;
  };
  _proto.setRenderer = function setRenderer(index, renderer) {
    if (index < 0 || index >= this.rendererCount) {
      error('setRenderer to LOD error, index out of range');
      return;
    }
    this.deleteRenderer(index);
    this.insertRenderer(index, renderer);
  };
  return _createClass(LOD, [{
    key: "screenUsagePercentage",
    get: function get() {
      return this._screenUsagePercentage;
    },
    set: function set(val) {
      this._screenUsagePercentage = val;
      this._LODData.screenUsagePercentage = val;
    }
  }, {
    key: "renderers",
    get: function get() {
      return this._renderers;
    },
    set: function set(meshList) {
      if (meshList === this._renderers) return;
      var modelAdded = false;
      this._renderers.length = 0;
      this._LODData.clearModels();
      for (var i = 0; i < meshList.length; i++) {
        var _meshList$i;
        this._renderers[i] = meshList[i];
        var model = (_meshList$i = meshList[i]) == null ? void 0 : _meshList$i.model;
        if (model) {
          modelAdded = true;
          this._LODData.addModel(model);
        }
      }
      if (this._modelAddedCallback && modelAdded) {
        this._modelAddedCallback();
      }
    }
  }, {
    key: "triangleCount",
    get: function get() {
      var tris = [];
      this._renderers.forEach(function (meshRenderer) {
        var count = 0;
        if (meshRenderer && meshRenderer.mesh) {
          var primitives = meshRenderer.mesh.struct.primitives;
          primitives == null ? void 0 : primitives.forEach(function (subMesh) {
            if (subMesh && subMesh.indexView) {
              count += subMesh.indexView.count;
            }
          });
        }
        tris.push(count / 3);
      });
      return tris;
    }
  }, {
    key: "rendererCount",
    get: function get() {
      return this._renderers.length;
    }
  }, {
    key: "lodData",
    get: function get() {
      return this._LODData;
    }
  }, {
    key: "modelAddedCallback",
    set: function set(callback) {
      this._modelAddedCallback = callback;
    }
  }]);
}(), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_screenUsagePercentage", [serializable$2], function () {
  return 1.0;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_renderers", [_dec2$1, serializable$2], function () {
  return [];
}), _applyDecoratedDescriptor(_class2$1.prototype, "screenUsagePercentage", [_dec3$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "screenUsagePercentage"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "renderers", [_dec4$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "renderers"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "triangleCount", [_dec5$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "triangleCount"), _class2$1.prototype), _class2$1)) || _class$1);
var LODGroup = (_dec6$1 = ccclass$2('cc.LODGroup'), _dec7$1 = type$2(CCFloat), _dec8$1 = type$2([LOD]), _dec6$1(_class3 = (_class4 = function (_Component) {
  function LODGroup() {
    var _this;
    _this = _Component.call(this) || this;
    _this._localBoundaryCenter = _initializer3$1 && _initializer3$1();
    _this._objectSize = _initializer4$1 && _initializer4$1();
    _this._LODs = _initializer5$1 && _initializer5$1();
    _this._lodGroup = new LODGroup$1();
    _this._eventRegistered = false;
    _this._forceUsedLevels = [];
    return _this;
  }
  _inheritsLoose(LODGroup, _Component);
  var _proto2 = LODGroup.prototype;
  _proto2.onLodModelAddedCallback = function onLodModelAddedCallback() {
    if (this.objectSize === 0) {
      this.recalculateBounds();
    }
  };
  _proto2.insertLOD = function insertLOD(index, screenUsagePercentage, lod) {
    if (index < 0 || index > this.lodCount) {
      index = this.lodCount;
    }
    if (!lod) {
      lod = new LOD();
    }
    lod.modelAddedCallback = this.onLodModelAddedCallback.bind(this);
    if (!screenUsagePercentage) {
      var preLod = this.getLOD(index - 1);
      var nextLod = this.getLOD(index);
      if (preLod && nextLod) {
        screenUsagePercentage = (preLod.screenUsagePercentage + nextLod.screenUsagePercentage) / 2;
      } else if (preLod && !nextLod) {
        screenUsagePercentage = preLod.screenUsagePercentage / 2;
        if (screenUsagePercentage > 0.01) {
          screenUsagePercentage = 0.01;
        }
      } else if (nextLod && !preLod) {
        screenUsagePercentage = nextLod.screenUsagePercentage;
        var curNextLOD = this.getLOD(index + 1);
        nextLod.screenUsagePercentage = (screenUsagePercentage + (curNextLOD ? curNextLOD.screenUsagePercentage : 0)) / 2;
      } else {
        screenUsagePercentage = DEFAULT_SCREEN_OCCUPATION[0];
      }
    }
    lod.screenUsagePercentage = screenUsagePercentage;
    this._LODs.splice(index, 0, lod);
    this._lodGroup.insertLOD(index, lod.lodData);
    this._updateDataToScene();
    if (this.node) {
      this._emitChangeNode(this.node);
    }
    return lod;
  };
  _proto2.eraseLOD = function eraseLOD(index) {
    if (index < 0 || index >= this.lodCount) {
      warn('eraseLOD error, index out of range');
      return null;
    }
    var lod = this._LODs[index];
    if (!lod) {
      warn('eraseLOD error, LOD not exist at specified index.');
      return null;
    }
    this._LODs.splice(index, 1);
    this._lodGroup.eraseLOD(index);
    this._updateDataToScene();
    this._emitChangeNode(this.node);
    return lod;
  };
  _proto2.getLOD = function getLOD(index) {
    if (index < 0 || index >= this.lodCount) {
      warn('getLOD error, index out of range');
      return null;
    }
    return this._LODs[index];
  };
  _proto2.setLOD = function setLOD(index, lod) {
    if (index < 0 || index >= this.lodCount) {
      warn('setLOD error, index out of range');
      return;
    }
    this._LODs[index] = lod;
    lod.modelAddedCallback = this.onLodModelAddedCallback.bind(this);
    this.lodGroup.updateLOD(index, lod.lodData);
    this._updateDataToScene();
  };
  _proto2.recalculateBounds = function recalculateBounds() {
    function getTransformedBoundary(c, e, transform) {
      var minPos;
      var maxPos;
      var pts = new Array(new Vec3(c.x - e.x, c.y - e.y, c.z - e.z), new Vec3(c.x - e.x, c.y + e.y, c.z - e.z), new Vec3(c.x + e.x, c.y + e.y, c.z - e.z), new Vec3(c.x + e.x, c.y - e.y, c.z - e.z), new Vec3(c.x - e.x, c.y - e.y, c.z + e.z), new Vec3(c.x - e.x, c.y + e.y, c.z + e.z), new Vec3(c.x + e.x, c.y + e.y, c.z + e.z), new Vec3(c.x + e.x, c.y - e.y, c.z + e.z));
      minPos = pts[0].transformMat4(transform);
      maxPos = minPos.clone();
      for (var i = 1; i < 8; ++i) {
        var pt = pts[i].transformMat4(transform);
        minPos = Vec3.min(minPos, minPos, pt);
        maxPos = Vec3.max(maxPos, maxPos, pt);
      }
      return [minPos, maxPos];
    }
    var minPos = new Vec3();
    var maxPos = new Vec3();
    var boundsMin = null;
    var boundsMax = new Vec3();
    for (var i = 0; i < this.lodCount; ++i) {
      var lod = this.getLOD(i);
      if (lod) {
        for (var j = 0; j < lod.rendererCount; ++j) {
          var _renderer$model, _renderer$model2;
          var renderer = lod.getRenderer(j);
          if (!renderer) {
            continue;
          }
          (_renderer$model = renderer.model) == null ? void 0 : _renderer$model.updateWorldBound();
          var worldBounds = (_renderer$model2 = renderer.model) == null ? void 0 : _renderer$model2.worldBounds;
          if (worldBounds) {
            worldBounds.getBoundary(minPos, maxPos);
            if (boundsMin) {
              Vec3.min(boundsMin, boundsMin, minPos);
              Vec3.max(boundsMax, boundsMax, maxPos);
            } else {
              boundsMin = minPos.clone();
              boundsMax = maxPos.clone();
            }
          }
        }
      }
    }
    if (boundsMin) {
      var boundsMin2 = boundsMin;
      var c = new Vec3((boundsMax.x + boundsMin2.x) * 0.5, (boundsMax.y + boundsMin2.y) * 0.5, (boundsMax.z + boundsMin2.z) * 0.5);
      var e = new Vec3((boundsMax.x - boundsMin2.x) * 0.5, (boundsMax.y - boundsMin2.y) * 0.5, (boundsMax.z - boundsMin2.z) * 0.5);
      var _getTransformedBounda = getTransformedBoundary(c, e, this.node.worldMatrix.clone().invert()),
        _minPos = _getTransformedBounda[0],
        _maxPos = _getTransformedBounda[1];
      c.set((_maxPos.x + _minPos.x) * 0.5, (_maxPos.y + _minPos.y) * 0.5, (_maxPos.z + _minPos.z) * 0.5);
      e.set((_maxPos.x - _minPos.x) * 0.5, (_maxPos.y - _minPos.y) * 0.5, (_maxPos.z - _minPos.z) * 0.5);
      this.localBoundaryCenter = c;
      this.objectSize = Math.max(e.x, e.y, e.z) * 2.0;
    } else {
      this.localBoundaryCenter = new Vec3(0, 0, 0);
      this.objectSize = 0;
    }
    this._emitChangeNode(this.node);
  };
  _proto2.resetObjectSize = function resetObjectSize() {
    if (this.objectSize === 1.0) return;
    if (this.objectSize === 0) {
      this.objectSize = 1.0;
    }
    var scale = 1.0 / this.objectSize;
    this.objectSize = 1.0;
    for (var i = 0; i < this.lodCount; ++i) {
      var lod = this.getLOD(i);
      if (lod) {
        lod.screenUsagePercentage *= scale;
      }
    }
    this._emitChangeNode(this.node);
  };
  _proto2.forceLOD = function forceLOD(lodLevel) {
    this._forceUsedLevels = lodLevel < 0 ? [] : [lodLevel];
    this.lodGroup.lockLODLevels(this._forceUsedLevels);
  };
  _proto2.forceLODs = function forceLODs(lodIndexArray) {
  };
  _proto2.onLoad = function onLoad() {
    this._lodGroup.node = this.node;
    this._lodGroup.objectSize = this._objectSize;
    this._lodGroup.localBoundaryCenter = this._localBoundaryCenter;
    if (!this._eventRegistered) {
      this.node.on(NodeEventType.COMPONENT_REMOVED, this._onRemove, this);
      this._eventRegistered = true;
    }
    this._constructLOD();
  };
  _proto2._onRemove = function _onRemove(comp) {
    if (comp === this) {
      this.onDisable();
    }
  };
  _proto2._constructLOD = function _constructLOD() {
    if (this.lodCount < 1) {
      var size = DEFAULT_SCREEN_OCCUPATION.length;
      for (var i = 0; i < size; i++) {
        this.insertLOD(i, DEFAULT_SCREEN_OCCUPATION[i]);
      }
    }
  };
  _proto2.onRestore = function onRestore() {
    this._constructLOD();
    if (this.enabledInHierarchy) {
      this._attachToScene();
    }
  };
  _proto2.onEnable = function onEnable() {
    var _this2 = this;
    this._attachToScene();
    if (this.objectSize === 0) {
      this.recalculateBounds();
    }
    this.lodGroup.lockLODLevels(this._forceUsedLevels);
    if (this.lodCount > 0 && this._lodGroup.lodCount < 1) {
      this._LODs.forEach(function (lod, index) {
        lod.lodData.screenUsagePercentage = lod.screenUsagePercentage;
        var renderers = lod.renderers;
        if (renderers !== null && renderers.length > 0) {
          for (var i = 0; i < renderers.length; i++) {
            var lodInstance = lod.lodData;
            var renderer = renderers[i];
            if (lodInstance && renderer && renderer.model) {
              lodInstance.addModel(renderer.model);
            }
          }
        }
        _this2._lodGroup.insertLOD(index, lod.lodData);
      });
    }
  };
  _proto2.onDisable = function onDisable() {
    this._detachFromScene();
    this.lodGroup.lockLODLevels([]);
  };
  _proto2._attachToScene = function _attachToScene() {
    if (this.node && this.node.scene) {
      var renderScene = this._getRenderScene();
      if (this._lodGroup.scene) {
        this._detachFromScene();
      }
      renderScene.addLODGroup(this._lodGroup);
    }
  };
  _proto2._detachFromScene = function _detachFromScene() {
    if (this._lodGroup.scene) {
      this._lodGroup.scene.removeLODGroup(this._lodGroup);
    }
  };
  _proto2._emitChangeNode = function _emitChangeNode(node) {
  };
  _proto2._updateDataToScene = function _updateDataToScene() {
    this._detachFromScene();
    this._attachToScene();
  };
  return _createClass(LODGroup, [{
    key: "localBoundaryCenter",
    get: function get() {
      return this._localBoundaryCenter.clone();
    },
    set: function set(val) {
      this._localBoundaryCenter.set(val);
      this._lodGroup.localBoundaryCenter = val;
    }
  }, {
    key: "lodCount",
    get: function get() {
      return this._LODs.length;
    }
  }, {
    key: "objectSize",
    get: function get() {
      return this._objectSize;
    },
    set: function set(val) {
      this._objectSize = val;
      this._lodGroup.objectSize = val;
    }
  }, {
    key: "LODs",
    get: function get() {
      return this._LODs;
    },
    set: function set(valArray) {
      var _this3 = this;
      if (valArray === this._LODs) {
        this._updateDataToScene();
        return;
      }
      this._LODs.length = 0;
      this.lodGroup.clearLODs();
      valArray.forEach(function (lod, index) {
        _this3.lodGroup.insertLOD(index, lod.lodData);
        _this3._LODs[index] = lod;
        lod.modelAddedCallback = _this3.onLodModelAddedCallback.bind(_this3);
      });
      this._updateDataToScene();
    }
  }, {
    key: "lodGroup",
    get: function get() {
      return this._lodGroup;
    }
  }]);
}(Component), _initializer3$1 = applyDecoratedInitializer(_class4.prototype, "_localBoundaryCenter", [serializable$2], function () {
  return new Vec3(0, 0, 0);
}), _initializer4$1 = applyDecoratedInitializer(_class4.prototype, "_objectSize", [serializable$2], function () {
  return 0;
}), _initializer5$1 = applyDecoratedInitializer(_class4.prototype, "_LODs", [serializable$2], function () {
  return [];
}), _applyDecoratedDescriptor(_class4.prototype, "objectSize", [_dec7$1], Object.getOwnPropertyDescriptor(_class4.prototype, "objectSize"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "LODs", [_dec8$1], Object.getOwnPropertyDescriptor(_class4.prototype, "LODs"), _class4.prototype), _class4)) || _class3);

var REFLECTION_PROBE_DEFAULT_MASK = Layers.makeMaskExclude([Layers.BitMask.UI_2D, Layers.BitMask.UI_3D, Layers.BitMask.GIZMOS, Layers.BitMask.EDITOR, Layers.BitMask.SCENE_GIZMO, Layers.BitMask.PROFILER, Layers.Enum.IGNORE_RAYCAST]);
var ReflectionProbeManager = function () {
  function ReflectionProbeManager() {
    this._probes = [];
    this._useCubeModels = new Map();
    this._usePlanarModels = new Map();
    this._updateForRuntime = true;
    this._dataTexture = null;
    this._registeredEvent = false;
  }
  var _proto = ReflectionProbeManager.prototype;
  _proto.registerEvent = function registerEvent() {
    if (!this._registeredEvent) {
      cclegacy.director.on(cclegacy.DirectorEvent.BEFORE_UPDATE, this.onUpdateProbes, this);
      this._registeredEvent = true;
    }
  };
  _proto.onUpdateProbes = function onUpdateProbes() {
    if (this._probes.length === 0) return;
    var scene = cclegacy.director.getScene();
    if (!scene || !scene.renderScene) {
      return;
    }
    var models = scene.renderScene.models;
    for (var i = 0; i < models.length; i++) {
      var model = models[i];
      if (!model.node) continue;
      if (model.node.layer & REFLECTION_PROBE_DEFAULT_MASK) {
        if (model.reflectionProbeType === ReflectionProbeType.BAKED_CUBEMAP || this._isUsedBlending(model)) {
          this.selectReflectionProbe(model);
        } else if (model.reflectionProbeType === ReflectionProbeType.PLANAR_REFLECTION) {
          this.selectPlanarReflectionProbe(model);
        }
      }
    }
  };
  _proto.filterModelsForPlanarReflection = function filterModelsForPlanarReflection() {
    if (this._probes.length === 0) return;
    var scene = cclegacy.director.getScene();
    if (!scene || !scene.renderScene) {
      return;
    }
    var models = scene.renderScene.models;
    for (var i = 0; i < models.length; i++) {
      var model = models[i];
      if (!model.node) continue;
      if (model.node.layer & REFLECTION_PROBE_DEFAULT_MASK && model.reflectionProbeType === ReflectionProbeType.PLANAR_REFLECTION) {
        this.selectPlanarReflectionProbe(model);
      }
    }
  };
  _proto.clearPlanarReflectionMap = function clearPlanarReflectionMap(probe) {
    for (var _iterator = _createForOfIteratorHelperLoose(this._usePlanarModels.entries()), _step; !(_step = _iterator()).done;) {
      var entry = _step.value;
      if (entry[1] === probe) {
        this._updatePlanarMapOfModel(entry[0], null, null);
      }
    }
  };
  _proto.register = function register(probe) {
    var index = this._probes.indexOf(probe);
    if (index === -1) {
      this._probes.push(probe);
      this.updateProbeData();
    }
  };
  _proto.unregister = function unregister(probe) {
    for (var i = 0; i < this._probes.length; i++) {
      if (this._probes[i] === probe) {
        var del = this._probes.splice(i, 1);
        if (del[0]) {
          this._removeDependentModels(del[0]);
        }
        break;
      }
    }
    this.updateProbeData();
  };
  _proto.exists = function exists(probeId) {
    if (this._probes.length === 0) return false;
    for (var i = 0; i < this._probes.length; i++) {
      if (this._probes[i].getProbeId() === probeId) {
        return true;
      }
    }
    return false;
  };
  _proto.getNewReflectionProbeId = function getNewReflectionProbeId() {
    var probeId = 0;
    while (true) {
      if (this.exists(probeId)) {
        probeId++;
      } else {
        return probeId;
      }
    }
  };
  _proto.getProbes = function getProbes() {
    return this._probes;
  };
  _proto.getProbeById = function getProbeById(probeId) {
    for (var i = 0; i < this._probes.length; i++) {
      if (this._probes[i].getProbeId() === probeId) {
        return this._probes[i];
      }
    }
    return null;
  };
  _proto.clearAll = function clearAll() {
    this._probes = [];
  };
  _proto.getProbeByCamera = function getProbeByCamera(camera) {
    for (var i = 0; i < this._probes.length; i++) {
      if (this._probes[i].camera === camera) {
        return this._probes[i];
      }
    }
    return null;
  };
  _proto.updateBakedCubemap = function updateBakedCubemap(probe) {
    var models = this._getModelsByProbe(probe);
    if (!probe.cubemap) return;
    for (var i = 0; i < models.length; i++) {
      var model = models[i];
      this._updateCubemapOfModel(model, probe);
    }
    probe.needRefresh = false;
    if (models.length === 0) {
      for (var _iterator2 = _createForOfIteratorHelperLoose(this._useCubeModels.entries()), _step2; !(_step2 = _iterator2()).done;) {
        var entry = _step2.value;
        if (entry[0].reflectionProbeBlendId === probe.getProbeId()) {
          this._updateBlendCubemap(entry[0], probe);
        }
      }
    }
  };
  _proto.updatePlanarMap = function updatePlanarMap(probe, texture) {
    if (!probe.node || !probe.node.scene) return;
    var models = this._getModelsByProbe(probe);
    for (var i = 0; i < models.length; i++) {
      this._updatePlanarMapOfModel(models[i], texture, probe);
    }
    if (probe.previewPlane) {
      var meshRender = probe.previewPlane.getComponent(MeshRenderer);
      if (meshRender) {
        meshRender.updateProbePlanarMap(texture);
      }
    }
  };
  _proto.selectPlanarReflectionProbe = function selectPlanarReflectionProbe(model) {
    if (!model.node || !model.worldBounds || model.reflectionProbeType !== ReflectionProbeType.PLANAR_REFLECTION) return;
    for (var i = 0; i < this._probes.length; i++) {
      var probe = this._probes[i];
      if (probe.probeType !== ProbeType.PLANAR) continue;
      if (model.node.layer & REFLECTION_PROBE_DEFAULT_MASK) {
        model.updateWorldBound();
        if (intersect.aabbWithAABB(model.worldBounds, probe.boundingBox)) {
          this._usePlanarModels.set(model, probe);
        } else if (this._usePlanarModels.has(model)) {
          var old = this._usePlanarModels.get(model);
          if (old === probe) {
            this._usePlanarModels["delete"](model);
            this._updatePlanarMapOfModel(model, null, null);
          }
        }
      }
    }
    for (var _i = 0; _i < this._probes.length; _i++) {
      if (this._probes[_i].probeType === ProbeType.PLANAR) {
        if (!this._probes[_i].realtimePlanarTexture) {
          this.updatePlanarMap(this._probes[_i], null);
        } else {
          this.updatePlanarMap(this._probes[_i], this._probes[_i].realtimePlanarTexture.getGFXTexture());
        }
      }
    }
  };
  _proto.selectReflectionProbe = function selectReflectionProbe(model) {
    if (model.node && model.worldBounds && model.node.layer & REFLECTION_PROBE_DEFAULT_MASK) {
      model.updateWorldBound();
      var nearest = this._getNearestProbe(model);
      if (!nearest) {
        this._updateCubemapOfModel(model, null);
        this._useCubeModels["delete"](model);
      } else if (this._useCubeModels.has(model)) {
        var old = this._useCubeModels.get(model);
        if (old !== nearest) {
          this._useCubeModels.set(model, nearest);
        }
        nearest.needRefresh = true;
      } else {
        this._useCubeModels.set(model, nearest);
        nearest.needRefresh = true;
      }
    }
    for (var i = 0; i < this._probes.length; i++) {
      if (this._probes[i].needRefresh && this._probes[i].probeType === ProbeType.CUBE || this._isUsedBlending(model)) {
        this.updateBakedCubemap(this._probes[i]);
      }
    }
  };
  _proto.updatePreviewSphere = function updatePreviewSphere(probe) {
    if (!probe || !probe.previewSphere) return;
    var meshRender = probe.previewSphere.getComponent(MeshRenderer);
    if (meshRender) {
      meshRender.updateProbeCubemap(probe.cubemap);
      meshRender.updateReflectionProbeId(probe.getProbeId());
    }
  };
  _proto.updatePreviewPlane = function updatePreviewPlane(probe) {
    if (!probe || !probe.previewPlane) return;
    var meshRender = probe.previewPlane.getComponent(MeshRenderer);
    if (meshRender) {
      if (probe.realtimePlanarTexture) {
        this.updatePlanarMap(probe, probe.realtimePlanarTexture.getGFXTexture());
      }
    }
  };
  _proto.updateProbeData = function updateProbeData() {
    if (this._probes.length === 0) return;
    var maxId = this.getMaxProbeId();
    var height = maxId + 1;
    var dataWidth = 3;
    if (this._dataTexture) {
      this._dataTexture.destroy();
    }
    var buffer = new Float32Array(4 * dataWidth * height);
    var bufferOffset = 0;
    for (var i = 0; i <= maxId; i++) {
      var probe = this.getProbeById(i);
      if (!probe) {
        bufferOffset += 4 * dataWidth;
        continue;
      }
      if (probe.probeType === ProbeType.CUBE) {
        buffer[bufferOffset] = probe.node.worldPosition.x;
        buffer[bufferOffset + 1] = probe.node.worldPosition.y;
        buffer[bufferOffset + 2] = probe.node.worldPosition.z;
        buffer[bufferOffset + 3] = 0.0;
        buffer[bufferOffset + 4] = probe.size.x;
        buffer[bufferOffset + 5] = probe.size.y;
        buffer[bufferOffset + 6] = probe.size.z;
        buffer[bufferOffset + 7] = 0.0;
        var mipAndUseRGBE = probe.isRGBE() ? 1000 : 0;
        buffer[bufferOffset + 8] = probe.cubemap ? probe.cubemap.mipmapLevel + mipAndUseRGBE : 1.0 + mipAndUseRGBE;
      } else {
        buffer[bufferOffset] = probe.node.up.x;
        buffer[bufferOffset + 1] = probe.node.up.y;
        buffer[bufferOffset + 2] = probe.node.up.z;
        buffer[bufferOffset + 3] = 1.0;
        buffer[bufferOffset + 4] = 1.0;
        buffer[bufferOffset + 5] = 1.0;
        buffer[bufferOffset + 6] = 0.0;
        buffer[bufferOffset + 7] = 0.0;
        buffer[bufferOffset + 8] = 1.0;
      }
      bufferOffset += 4 * dataWidth;
    }
    var updateView = new Uint8Array(buffer.buffer);
    var image = new ImageAsset({
      _data: updateView,
      _compressed: false,
      width: dataWidth * 4,
      height: height,
      format: PixelFormat.RGBA8888
    });
    this._dataTexture = new Texture2D();
    this._dataTexture.setFilters(TextureFilter.NONE, TextureFilter.NONE);
    this._dataTexture.setMipFilter(TextureFilter.NONE);
    this._dataTexture.setWrapMode(WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE);
    this._dataTexture.image = image;
    this._dataTexture.uploadData(updateView);
    for (var _i2 = 0; _i2 < this._probes.length; _i2++) {
      var _probe = this._probes[_i2];
      var models = this._getModelsByProbe(_probe);
      for (var j = 0; j < models.length; j++) {
        var meshRender = models[j].node.getComponent(MeshRenderer);
        if (meshRender) {
          meshRender.updateReflectionProbeDataMap(this._dataTexture);
        }
      }
    }
  };
  _proto.getMaxProbeId = function getMaxProbeId() {
    if (this._probes.length === 0) {
      return -1;
    }
    if (this._probes.length === 1) {
      return this._probes[0].getProbeId();
    }
    this._probes.sort(function (a, b) {
      return a.getProbeId() - b.getProbeId();
    });
    return this._probes[this._probes.length - 1].getProbeId();
  };
  _proto.getUsedReflectionProbe = function getUsedReflectionProbe(model, planarReflection) {
    if (planarReflection) {
      if (this._usePlanarModels.has(model)) {
        return this._usePlanarModels.get(model);
      }
    } else if (this._useCubeModels.has(model)) {
      return this._useCubeModels.get(model);
    }
    return null;
  };
  _proto.setReflectionProbe = function setReflectionProbe(model, probe, blendProbe) {
    if (blendProbe === void 0) {
      blendProbe = null;
    }
    if (!probe) return;
    this._useCubeModels.set(model, probe);
    this._updateCubemapOfModel(model, probe);
    if (blendProbe) {
      this._updateBlendProbeInfo(model, probe, blendProbe);
    }
  };
  _proto.updateProbeOfModels = function updateProbeOfModels() {
    if (this._probes.length === 0) return;
    var scene = cclegacy.director.getScene();
    if (!scene || !scene.renderScene) {
      return;
    }
    var models = scene.renderScene.models;
    for (var i = 0; i < models.length; i++) {
      var model = models[i];
      if (!model.node) continue;
      if (model.node.layer & REFLECTION_PROBE_DEFAULT_MASK) {
        if (model.reflectionProbeType === ReflectionProbeType.BAKED_CUBEMAP || model.reflectionProbeType === ReflectionProbeType.PLANAR_REFLECTION || this._isUsedBlending(model)) {
          model.updateReflectionProbeId();
        }
      }
    }
  };
  _proto._getNearestProbe = function _getNearestProbe(model) {
    if (!model.node || !model.worldBounds || this._probes.length === 0) return null;
    var nearestProbe = null;
    var minDistance = Infinity;
    for (var _iterator3 = _createForOfIteratorHelperLoose(this._probes), _step3; !(_step3 = _iterator3()).done;) {
      var probe = _step3.value;
      if (probe.probeType !== ProbeType.CUBE || !probe.validate() || !intersect.aabbWithAABB(model.worldBounds, probe.boundingBox)) {
        continue;
      }
      var distance = Vec3.distance(model.node.worldPosition, probe.node.worldPosition);
      if (distance < minDistance) {
        minDistance = distance;
        nearestProbe = probe;
      }
    }
    return nearestProbe;
  };
  _proto._getBlendProbe = function _getBlendProbe(model) {
    if (!model || !model.node || !model.worldBounds || this._probes.length < 2) {
      return null;
    }
    var temp = [];
    for (var i = 0; i < this._probes.length; i++) {
      if (this._probes[i].probeType !== ProbeType.CUBE || !this._probes[i].validate() || !intersect.aabbWithAABB(model.worldBounds, this._probes[i].boundingBox)) {
        continue;
      }
      temp.push(this._probes[i]);
    }
    temp.sort(function (a, b) {
      var aDistance = Vec3.distance(model.node.worldPosition, a.node.worldPosition);
      var bDistance = Vec3.distance(model.node.worldPosition, b.node.worldPosition);
      return aDistance - bDistance;
    });
    return temp.length > 1 ? temp[1] : null;
  };
  _proto._getModelsByProbe = function _getModelsByProbe(probe) {
    var models = [];
    var useModels = this._useCubeModels;
    if (probe.probeType === ProbeType.PLANAR) {
      useModels = this._usePlanarModels;
    }
    for (var _iterator4 = _createForOfIteratorHelperLoose(useModels.entries()), _step4; !(_step4 = _iterator4()).done;) {
      var entry = _step4.value;
      if (entry[1] === probe) {
        models.push(entry[0]);
      }
    }
    return models;
  };
  _proto._removeDependentModels = function _removeDependentModels(probe) {
    for (var _iterator5 = _createForOfIteratorHelperLoose(this._useCubeModels.keys()), _step5; !(_step5 = _iterator5()).done;) {
      var key = _step5.value;
      var p = this._useCubeModels.get(key);
      if (p !== undefined && p === probe) {
        this._useCubeModels["delete"](key);
        this.selectReflectionProbe(key);
      }
    }
    for (var _iterator6 = _createForOfIteratorHelperLoose(this._usePlanarModels.keys()), _step6; !(_step6 = _iterator6()).done;) {
      var _key = _step6.value;
      var _p = this._usePlanarModels.get(_key);
      if (_p !== undefined && _p === probe) {
        this._usePlanarModels["delete"](_key);
        this.selectPlanarReflectionProbe(_key);
      }
    }
  };
  _proto._updateCubemapOfModel = function _updateCubemapOfModel(model, probe) {
    var node = model.node;
    if (!node) {
      return;
    }
    var meshRender = node.getComponent(MeshRenderer);
    if (!meshRender) {
      return;
    }
    meshRender.updateProbeCubemap(probe ? probe.cubemap : null);
    meshRender.updateReflectionProbeId(probe && probe.cubemap ? probe.getProbeId() : -1);
    if (probe) {
      meshRender.updateReflectionProbeDataMap(this._dataTexture);
      if (this._isUsedBlending(model)) {
        var blendProbe = this._getBlendProbe(model);
        this._updateBlendProbeInfo(model, probe, blendProbe);
      }
    }
  };
  _proto._updatePlanarMapOfModel = function _updatePlanarMapOfModel(model, texture, probe) {
    var meshRender = model.node.getComponent(MeshRenderer);
    if (meshRender) {
      meshRender.updateProbePlanarMap(texture);
      if (probe) {
        meshRender.updateReflectionProbeId(probe.getProbeId());
        meshRender.updateReflectionProbeDataMap(this._dataTexture);
      } else {
        meshRender.updateReflectionProbeId(-1);
      }
    }
  };
  _proto._isUsedBlending = function _isUsedBlending(model) {
    if (model.reflectionProbeType === ReflectionProbeType.BLEND_PROBES || model.reflectionProbeType === ReflectionProbeType.BLEND_PROBES_AND_SKYBOX) {
      return true;
    }
    return false;
  };
  _proto._updateBlendProbeInfo = function _updateBlendProbeInfo(model, probe, blendProbe) {
    var node = model.node;
    if (!node) {
      return;
    }
    var meshRender = node.getComponent(MeshRenderer);
    if (!meshRender) {
      return;
    }
    {
      meshRender.updateReflectionProbeBlendId(-1);
      if (model.reflectionProbeType === ReflectionProbeType.BLEND_PROBES_AND_SKYBOX) {
        meshRender.updateReflectionProbeBlendWeight(this._calculateBlendWeight(model, probe, blendProbe));
      }
    }
  };
  _proto._updateBlendCubemap = function _updateBlendCubemap(model, probe) {
    var node = model.node;
    if (!node) {
      return;
    }
    if (!this._isUsedBlending(model)) {
      return;
    }
    var meshRender = node.getComponent(MeshRenderer);
    if (meshRender) {
      meshRender.updateProbeBlendCubemap(probe.cubemap);
    }
  };
  _proto._calculateBlendWeight = function _calculateBlendWeight(model, probe, blendProbe) {
    if (blendProbe) {
      var d1 = Vec3.distance(model.node.worldPosition, probe.node.worldPosition);
      var d2 = Vec3.distance(model.node.worldPosition, blendProbe.node.worldPosition);
      return 1.0 - d2 / (d1 + d2);
    }
    if (model.reflectionProbeType === ReflectionProbeType.BLEND_PROBES) {
      return 0.0;
    } else if (model.reflectionProbeType === ReflectionProbeType.BLEND_PROBES_AND_SKYBOX) {
      return this._calculateBlendOfSkybox(model.worldBounds, probe.boundingBox);
    }
    return 0.0;
  };
  _proto._calculateBlendOfSkybox = function _calculateBlendOfSkybox(aabb1, aabb2) {
    if (!aabb1) return 1.0;
    var aMin = new Vec3();
    var aMax = new Vec3();
    var bMin = new Vec3();
    var bMax = new Vec3();
    Vec3.subtract(aMin, aabb1.center, aabb1.halfExtents);
    Vec3.add(aMax, aabb1.center, aabb1.halfExtents);
    Vec3.subtract(bMin, aabb2.center, aabb2.halfExtents);
    Vec3.add(bMax, aabb2.center, aabb2.halfExtents);
    var inside = aMin.x <= bMax.x && aMax.x >= bMin.x && aMin.y <= bMax.y && aMax.y >= bMin.y && aMin.z <= bMax.z && aMax.z >= bMin.z;
    if (inside) {
      var fullSize = new Vec3();
      Vec3.multiplyScalar(fullSize, aabb1.halfExtents, 2.0);
      var boundaryXAdd = aMin.x + fullSize.x <= bMax.x && aMax.x + fullSize.x >= bMin.x;
      var boundaryXSub = aMin.x - fullSize.x <= bMax.x && aMax.x - fullSize.x >= bMin.x;
      var boundaryYAdd = aMin.y + fullSize.y <= bMax.y && aMax.y + fullSize.y >= bMin.y;
      var boundaryYSub = aMin.y - fullSize.y <= bMax.y && aMax.y - fullSize.y >= bMin.y;
      var boundaryZAdd = aMin.z + fullSize.z <= bMax.z && aMax.z + fullSize.z >= bMin.z;
      var boundaryZSub = aMin.z - fullSize.z <= bMax.z && aMax.z - fullSize.z >= bMin.z;
      var weights = [];
      if (!boundaryXAdd) {
        var offset = aMax.x - bMax.x;
        weights.push(offset / fullSize.x);
      }
      if (!boundaryXSub) {
        var _offset = Math.abs(aMin.x - bMin.x);
        weights.push(_offset / fullSize.x);
      }
      if (!boundaryYAdd) {
        var _offset2 = aMax.y - bMax.y;
        weights.push(_offset2 / fullSize.y);
      }
      if (!boundaryYSub) {
        var _offset3 = Math.abs(aMin.y - bMin.y);
        weights.push(_offset3 / fullSize.y);
      }
      if (!boundaryZAdd) {
        var _offset4 = aMax.z - bMax.z;
        weights.push(_offset4 / fullSize.z);
      }
      if (!boundaryZSub) {
        var _offset5 = Math.abs(aMin.z - bMin.z);
        weights.push(_offset5 / fullSize.z);
      }
      if (weights.length > 0) {
        weights.sort(function (a, b) {
          return b - a;
        });
        return weights[0];
      } else {
        return 0.0;
      }
    }
    return 1.0;
  };
  return _createClass(ReflectionProbeManager, [{
    key: "updateForRuntime",
    get: function get() {
      return this._updateForRuntime;
    },
    set: function set(val) {
      this._updateForRuntime = val;
    }
  }]);
}();
ReflectionProbeManager.probeManager = void 0;
ReflectionProbeManager.probeManager = new ReflectionProbeManager();
cclegacy.internal.reflectionProbeManager = ReflectionProbeManager.probeManager;

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _ReflectionProbe;
var tmpVec3 = v3();
var ProbeResolution;
(function (ProbeResolution) {
  ProbeResolution[ProbeResolution["Low_256x256"] = 256] = "Low_256x256";
  ProbeResolution[ProbeResolution["Medium_512x512"] = 512] = "Medium_512x512";
  ProbeResolution[ProbeResolution["High_768x768"] = 768] = "High_768x768";
})(ProbeResolution || (ProbeResolution = {}));
var ReflectionProbe = (_dec = ccclass$2('cc.ReflectionProbe'), _dec2 = type$2(Vec3), _dec3 = type$2(Enum(ProbeType)), _dec4 = type$2(Enum(ProbeResolution)), _dec5 = type$2(Enum(ProbeClearFlag)), _dec6 = type$2(Color), _dec7 = type$2(Layers.BitMask), _dec8 = type$2(Camera$1), _dec9 = type$2(CCBoolean), _dec0 = type$2(TextureCube), _dec(_class = (_class2 = (_ReflectionProbe = function (_Component) {
  function ReflectionProbe() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this._lastSize = v3();
    _this._resolution = _initializer && _initializer();
    _this._clearFlag = _initializer2 && _initializer2();
    _this._backgroundColor = _initializer3 && _initializer3();
    _this._visibility = _initializer4 && _initializer4();
    _this._probeType = _initializer5 && _initializer5();
    _this._cubemap = _initializer6 && _initializer6();
    _this._size = _initializer7 && _initializer7();
    _this._sourceCamera = _initializer8 && _initializer8();
    _this._probeId = _initializer9 && _initializer9();
    _this._fastBake = _initializer0 && _initializer0();
    _this._probe = null;
    _this._previewSphere = null;
    _this._previewPlane = null;
    _this._sourceCameraPos = v3();
    _this._position = v3();
    return _this;
  }
  _inheritsLoose(ReflectionProbe, _Component);
  var _proto = ReflectionProbe.prototype;
  _proto.onLoad = function onLoad() {
    this._createProbe();
  };
  _proto._handleResize$ = function _handleResize$() {
    if (this.probe && this.sourceCamera && this.probeType === ProbeType.PLANAR) {
      this.probe.renderPlanarReflection(this.sourceCamera.camera);
    }
  };
  _proto.onEnable = function onEnable() {
    if (this._probe) {
      var probe = ReflectionProbeManager.probeManager.getProbeById(this._probeId);
      if (probe !== null && probe !== this._probe) {
        this._probeId = ReflectionProbeManager.probeManager.getNewReflectionProbeId();
        this._probe.updateProbeId(this._probeId);
      }
      ReflectionProbeManager.probeManager.register(this._probe);
      ReflectionProbeManager.probeManager.onUpdateProbes();
      this._probe.enable();
    }
    screen.on('window-resize', this._handleResize$, this);
    screen.on('fullscreen-change', this._handleResize$, this);
  };
  _proto.onDisable = function onDisable() {
    if (this._probe) {
      ReflectionProbeManager.probeManager.unregister(this._probe);
      this._probe.disable();
    }
    screen.off('window-resize', this._handleResize$, this);
    screen.off('fullscreen-change', this._handleResize$, this);
  };
  _proto.start = function start() {
    if (this._sourceCamera && this.probeType === ProbeType.PLANAR) {
      this.probe.renderPlanarReflection(this.sourceCamera.camera);
      ReflectionProbeManager.probeManager.filterModelsForPlanarReflection();
    }
    ReflectionProbeManager.probeManager.updateProbeData();
    this.node.getWorldPosition(this._position);
  };
  _proto.onDestroy = function onDestroy() {
    if (this.probe) {
      this.probe.destroy();
    }
  };
  _proto.update = function update(dt) {
    if (!this.probe) return;
    if (this.probeType === ProbeType.PLANAR && this.sourceCamera) {
      if (this.sourceCamera.node.hasChangedFlags & TransformBit.TRS || !this._sourceCameraPos.equals(this.sourceCamera.node.getWorldPosition())) {
        this._sourceCameraPos = this.sourceCamera.node.getWorldPosition();
        this.probe.renderPlanarReflection(this.sourceCamera.camera);
      }
    }
    if (this.node.hasChangedFlags & TransformBit.POSITION) {
      this.probe.updateBoundingBox();
      ReflectionProbeManager.probeManager.onUpdateProbes();
      ReflectionProbeManager.probeManager.updateProbeData();
    }
    {
      this.node.getWorldPosition(tmpVec3);
      if (!this._position.equals(tmpVec3)) {
        this._position.set(tmpVec3);
        this.probe.updateBoundingBox();
        ReflectionProbeManager.probeManager.updateProbeData();
        ReflectionProbeManager.probeManager.updateProbeOfModels();
      }
    }
  };
  _proto.clearBakedCubemap = function clearBakedCubemap() {
    this.cubemap = null;
    ReflectionProbeManager.probeManager.updateBakedCubemap(this.probe);
    ReflectionProbeManager.probeManager.updatePreviewSphere(this.probe);
  };
  _proto._createProbe = function _createProbe() {
    if (this._probeId === -1 || ReflectionProbeManager.probeManager.exists(this._probeId)) {
      this._probeId = ReflectionProbeManager.probeManager.getNewReflectionProbeId();
    }
    this._probe = new ReflectionProbe$1(this._probeId);
    if (this._probe) {
      var cameraNode = new Node('ReflectionProbeCamera');
      cameraNode.hideFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
      this.node.scene.addChild(cameraNode);
      this._probe.initialize(this.node, cameraNode);
      if (this.enabled) {
        ReflectionProbeManager.probeManager.register(this._probe);
      }
      this._probe.resolution = this._resolution;
      this._probe.clearFlag = this._clearFlag;
      this._probe.backgroundColor = this._backgroundColor;
      this._probe.visibility = this._visibility;
      this._probe.probeType = this._probeType;
      this._probe.size = this._size;
      this._probe.cubemap = this._cubemap;
    }
  };
  return _createClass(ReflectionProbe, [{
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(value) {
      this._size.set(value);
      absolute(this._size);
      this.probe.size = this._size;
      if (this.probe) {
        this.probe.updateBoundingBox();
        ReflectionProbeManager.probeManager.onUpdateProbes();
        ReflectionProbeManager.probeManager.updateProbeData();
        ReflectionProbeManager.probeManager.updateProbeOfModels();
      }
    }
  }, {
    key: "probeType",
    get: function get() {
      return this._probeType;
    },
    set: function set(value) {
      this.probe.probeType = value;
      if (value !== this._probeType) {
        var lastSize = this._size.clone();
        var lastSizeIsNoExist = Vec3.equals(this._lastSize, Vec3.ZERO);
        this._probeType = value;
        if (this._probeType === ProbeType.CUBE) {
          if (lastSizeIsNoExist) {
            this._size.set(ReflectionProbe.DEFAULT_CUBE_SIZE);
          }
          this.probe.switchProbeType(value, null);
          ReflectionProbeManager.probeManager.clearPlanarReflectionMap(this.probe);
        } else {
          if (lastSizeIsNoExist) {
            this._size.set(ReflectionProbe.DEFAULT_PLANER_SIZE);
          }
          if (!this._sourceCamera) {
            warn('the reflection camera is invalid, please set the reflection camera');
          } else {
            this.probe.switchProbeType(value, this._sourceCamera.camera);
          }
        }
        if (!lastSizeIsNoExist) {
          this._size.set(this._lastSize);
        }
        this._lastSize.set(lastSize);
        this.size = this._size;
      }
    }
  }, {
    key: "resolution",
    get: function get() {
      return this._resolution;
    },
    set: function set(value) {
      this._resolution = value;
      this.probe.resolution = value;
    }
  }, {
    key: "clearFlag",
    get: function get() {
      return this._clearFlag;
    },
    set: function set(value) {
      this._clearFlag = value;
      this.probe.clearFlag = this._clearFlag;
    }
  }, {
    key: "backgroundColor",
    get: function get() {
      return this._backgroundColor;
    },
    set: function set(val) {
      this._backgroundColor = val;
      this.probe.backgroundColor = this._backgroundColor;
    }
  }, {
    key: "visibility",
    get: function get() {
      return this._visibility;
    },
    set: function set(val) {
      this._visibility = val;
      this.probe.visibility = this._visibility;
    }
  }, {
    key: "sourceCamera",
    get: function get() {
      return this._sourceCamera;
    },
    set: function set(camera) {
      this._sourceCamera = camera;
      if (camera) {
        this.visibility = camera.visibility;
        this.clearFlag = camera.clearFlags;
        this.backgroundColor = camera.clearColor;
        if (this.probeType === ProbeType.PLANAR) {
          this.probe.switchProbeType(this.probeType, camera.camera);
        }
      }
    }
  }, {
    key: "fastBake",
    get: function get() {
      return this._fastBake;
    },
    set: function set(val) {
      this._fastBake = val;
    }
  }, {
    key: "cubemap",
    get: function get() {
      return this._cubemap;
    },
    set: function set(val) {
      this._cubemap = val;
      this.probe.cubemap = val;
      ReflectionProbeManager.probeManager.onUpdateProbes();
    }
  }, {
    key: "probe",
    get: function get() {
      return this._probe;
    }
  }, {
    key: "previewSphere",
    get: function get() {
      return this._previewSphere;
    },
    set: function set(val) {
      this._previewSphere = val;
      if (this.probe) {
        this.probe.previewSphere = val;
        if (this._previewSphere) {
          ReflectionProbeManager.probeManager.updatePreviewSphere(this.probe);
        }
      }
    }
  }, {
    key: "previewPlane",
    get: function get() {
      return this._previewPlane;
    },
    set: function set(val) {
      this._previewPlane = val;
      if (this.probe) {
        this.probe.previewPlane = val;
        if (this._previewPlane) {
          ReflectionProbeManager.probeManager.updatePreviewPlane(this.probe);
        }
      }
    }
  }]);
}(Component), _ReflectionProbe.DEFAULT_CUBE_SIZE = v3(1, 1, 1), _ReflectionProbe.DEFAULT_PLANER_SIZE = v3(5, 0.5, 5), _ReflectionProbe), _initializer = applyDecoratedInitializer(_class2.prototype, "_resolution", [serializable$2], function () {
  return 256;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_clearFlag", [serializable$2], function () {
  return ProbeClearFlag.SKYBOX;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_backgroundColor", [serializable$2], function () {
  return new Color(0, 0, 0, 255);
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_visibility", [serializable$2], function () {
  return CAMERA_DEFAULT_MASK;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_probeType", [serializable$2], function () {
  return ProbeType.CUBE;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_cubemap", [serializable$2], function () {
  return null;
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "_size", [serializable$2], function () {
  return v3(1, 1, 1);
}), _initializer8 = applyDecoratedInitializer(_class2.prototype, "_sourceCamera", [serializable$2], function () {
  return null;
}), _initializer9 = applyDecoratedInitializer(_class2.prototype, "_probeId", [serializable$2], function () {
  return -1;
}), _initializer0 = applyDecoratedInitializer(_class2.prototype, "_fastBake", [serializable$2], function () {
  return false;
}), _applyDecoratedDescriptor(_class2.prototype, "size", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "size"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "probeType", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "probeType"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "resolution", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "resolution"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "clearFlag", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "clearFlag"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "backgroundColor", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "backgroundColor"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "visibility", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "visibility"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "sourceCamera", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "sourceCamera"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "fastBake", [_dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "fastBake"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "cubemap", [_dec0], Object.getOwnPropertyDescriptor(_class2.prototype, "cubemap"), _class2.prototype), _class2)) || _class);

legacyCC.utils = utils;

export { BatchingUtility, DirectionalLight, DirectionalLight as DirectionalLightComponent, LOD, LODGroup, Light, Light as LightComponent, Mesh, MeshRenderer, MeshRenderer as ModelComponent, PointLight, RangedDirectionalLight, ReflectionProbe, ReflectionProbeManager, ReflectionProbeType, SphereLight, SphereLight as SphereLightComponent, SpotLight, SpotLight as SpotLightComponent, utils };
//# sourceMappingURL=3d.js.map
