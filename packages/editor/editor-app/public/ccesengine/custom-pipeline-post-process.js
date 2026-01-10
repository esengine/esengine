import { S as SceneFlags, L as LightInfo, g as getRenderArea, R as ResourceResidency, Q as QueueHint, a as getCameraUniqueID, b as buildShadowPasses, s as setCustomPipeline } from './index-ihqn3EMi.js';
import { E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';
import { S as SkyBoxFlagValue, R as RenderTexture, x as DebugViewSingleType, v as DebugViewCompositeType, C as CameraProjection, P as PipelineEventType } from './debug-view-BuNhRPv_.js';
import './deprecated-n0w4kK7g.js';
import { b as Material, y as ShadowType, M as MaterialInstance, d as builtinResMgr, i as Texture2D, P as PixelFormat, I as ImageAsset, j as TextureFilter, W as WrapMode, F as FOG_TYPE_NONE } from './scene-vWcxM1_c.js';
import './device-manager-CBXP-ttm.js';
import { C as ClearFlagBit, ac as Color, ad as Rect, bo as Viewport, F as Format, aQ as LoadOp, a8 as StoreOp, ae as SamplerInfo, a4 as Filter, af as Address } from './buffer-barrier-BlQXg9Aa.js';
import { _ as Sphere, J as AABB, g as Vec4, F as intersect, c as ccclass, r as requireComponent, d as disallowMultiple, b as applyDecoratedInitializer, s as serializable, p as property, V as Vec2, M as Mat4, t as type, a as clamp, h as toRadian, f as Vec3, u as v3 } from './index-uXI1_UMk.js';
import { a as _createClass, G as macro, _ as _inheritsLoose, l as _createForOfIteratorHelperLoose, b as _applyDecoratedDescriptor, e as warn, q as CCFloat, C as CCBoolean, p as CCInteger, w as warnID } from './gc-object-CShF5lzx.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import { F as supportsRGBA16HalfFloatTexture } from './pipeline-state-manager-C5U4ouGL.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { g as game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import './prefab-DYg_oxpo.js';
import { P as PostProcess, C as Camera } from './camera-component-BFt9vSC_.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './deprecated-CN-RjLP6.js';
import './zlib.min-3VC1ush6.js';
import './render-types-D3qsZZI9.js';
import './touch-BKrZ-fxl.js';

var sphere = Sphere.create(0, 0, 0, 1);
var boundingBox = new AABB();
var rangedDirLightBoundingBox = new AABB(0.0, 0.0, 0.0, 0.5, 0.5, 0.5);
var PassContext = function () {
  function PassContext() {
    this.clearFlag = ClearFlagBit.COLOR;
    this.clearColor = new Color();
    this.clearDepthColor = new Color();
    this.ppl = void 0;
    this.camera = void 0;
    this.material = void 0;
    this.pass = void 0;
    this.rasterWidth = 0;
    this.rasterHeight = 0;
    this.layoutName = '';
    this.shadingScale = 1;
    this.viewport = new Rect();
    this.passViewport = new Rect();
    this.passPathName = '';
    this.passVersion = 0;
    this.isFinalCamera = false;
    this.isFinalPass = false;
    this.depthSlotName = '';
    this.shadowPass = undefined;
    this.forwardPass = undefined;
    this.postProcess = void 0;
    this.maxSpotLights = 0xFFFFFFFF;
    this.maxSphereLights = 0xFFFFFFFF;
    this.maxPointLights = 0xFFFFFFFF;
    this.maxRangedDirLights = 0xFFFFFFFF;
  }
  var _proto = PassContext.prototype;
  _proto.setClearFlag = function setClearFlag(clearFlag) {
    this.clearFlag = clearFlag;
    return this;
  };
  _proto.setClearColor = function setClearColor(x, y, z, w) {
    Vec4.set(this.clearColor, x, y, z, w);
    return this;
  };
  _proto.setClearDepthColor = function setClearDepthColor(x, y, z, w) {
    Vec4.set(this.clearDepthColor, x, y, z, w);
    return this;
  };
  _proto.version = function version() {
    {
      this.passPathName += "_" + this.pass.name + "_" + this.layoutName;
      this.pass.setVersion(this.passPathName, this.passVersion);
    }
    return this;
  };
  _proto.clearBlack = function clearBlack() {
    this.clearFlag = ClearFlagBit.COLOR;
    Vec4.set(passContext.clearColor, 0, 0, 0, 1);
  };
  _proto.addRenderPass = function addRenderPass(layoutName, passName) {
    var passViewport = this.passViewport;
    var pass = this.ppl.addRenderPass(passViewport.width, passViewport.height, layoutName);
    pass.name = passName;
    this.pass = pass;
    this.layoutName = layoutName;
    this.rasterWidth = passViewport.width;
    this.rasterHeight = passViewport.height;
    pass.setViewport(new Viewport(passViewport.x, passViewport.y, passViewport.width, passViewport.height));
    return this;
  };
  _proto.addSceneLights = function addSceneLights(queue, camera, flags) {
    if (flags === void 0) {
      flags = SceneFlags.BLEND;
    }
    if (this.maxPointLights === 0 && this.maxSphereLights === 0 && this.maxSpotLights === 0 && this.maxRangedDirLights === 0) {
      return;
    }
    var scene = camera.scene;
    var spotLights = scene.spotLights;
    var sphereLights = scene.sphereLights;
    var pointLights = scene.pointLights;
    var rangedDirLights = scene.rangedDirLights;
    var numSpotLights = Math.min(spotLights.length, this.maxSpotLights);
    var numSphereLights = Math.min(sphereLights.length, this.maxSphereLights);
    var numPointLights = Math.min(pointLights.length, this.maxPointLights);
    var numRangedDirLights = Math.min(rangedDirLights.length, this.maxRangedDirLights);
    for (var i = 0; i < numSpotLights; i++) {
      var light = spotLights[i];
      if (light.baked) {
        continue;
      }
      Sphere.set(sphere, light.position.x, light.position.y, light.position.z, light.range);
      if (intersect.sphereFrustum(sphere, camera.frustum)) {
        queue.addSceneOfCamera(camera, new LightInfo(light), flags);
      }
    }
    for (var _i = 0; _i < numSphereLights; _i++) {
      var _light = sphereLights[_i];
      if (_light.baked) {
        continue;
      }
      Sphere.set(sphere, _light.position.x, _light.position.y, _light.position.z, _light.range);
      if (intersect.sphereFrustum(sphere, camera.frustum)) {
        queue.addSceneOfCamera(camera, new LightInfo(_light), flags);
      }
    }
    for (var _i2 = 0; _i2 < numPointLights; _i2++) {
      var _light2 = pointLights[_i2];
      if (_light2.baked) {
        continue;
      }
      Sphere.set(sphere, _light2.position.x, _light2.position.y, _light2.position.z, _light2.range);
      if (intersect.sphereFrustum(sphere, camera.frustum)) {
        queue.addSceneOfCamera(camera, new LightInfo(_light2), flags);
      }
    }
    for (var _i3 = 0; _i3 < numRangedDirLights; _i3++) {
      var _light3 = rangedDirLights[_i3];
      AABB.transform(boundingBox, rangedDirLightBoundingBox, _light3.node.getWorldMatrix());
      if (intersect.aabbFrustum(boundingBox, camera.frustum)) {
        queue.addSceneOfCamera(camera, new LightInfo(_light3), flags);
      }
    }
  };
  _proto.updateViewPort = function updateViewPort() {
    var camera = this.camera;
    if (!camera) {
      return;
    }
    var shadingScale = 1;
    if (this.postProcess && (!EDITOR)) {
      shadingScale *= this.postProcess.shadingScale;
    }
    this.shadingScale = shadingScale;
    var area = getRenderArea(camera, camera.window.width * shadingScale, camera.window.height * shadingScale, null, 0, this.viewport);
    area.width = Math.floor(area.width);
    area.height = Math.floor(area.height);
  };
  _proto.updatePassViewPort = function updatePassViewPort(shadingScale, offsetScale) {
    if (shadingScale === void 0) {
      shadingScale = 1;
    }
    if (offsetScale === void 0) {
      offsetScale = 0;
    }
    this.passViewport.width = this.viewport.width * shadingScale;
    this.passViewport.height = this.viewport.height * shadingScale;
    this.passViewport.x = this.viewport.x * offsetScale;
    this.passViewport.y = this.viewport.y * offsetScale;
    return this;
  };
  _proto.addRasterView = function addRasterView(name, format, offscreen, residency) {
    if (offscreen === void 0) {
      offscreen = true;
    }
    if (residency === void 0) {
      residency = ResourceResidency.MANAGED;
    }
    var ppl = this.ppl;
    var camera = this.camera;
    var pass = this.pass;
    if (!ppl || !camera || !pass) {
      return this;
    }
    if (!ppl.containsResource(name)) {
      if (format === Format.DEPTH_STENCIL) {
        ppl.addDepthStencil(name, format, this.rasterWidth, this.rasterHeight, ResourceResidency.MANAGED);
      } else if (offscreen) {
        ppl.addRenderTarget(name, format, this.rasterWidth, this.rasterHeight, residency || ResourceResidency.MANAGED);
      } else {
        ppl.addRenderWindow(name, format, this.rasterWidth, this.rasterHeight, camera.window);
      }
    }
    if (format !== Format.DEPTH_STENCIL) {
      if (!offscreen) {
        ppl.updateRenderWindow(name, camera.window);
      } else {
        ppl.updateRenderTarget(name, this.rasterWidth, this.rasterHeight);
      }
    } else {
      ppl.updateDepthStencil(name, this.rasterWidth, this.rasterHeight);
    }
    if (format === Format.DEPTH_STENCIL) {
      var clearFlag = this.clearFlag & ClearFlagBit.DEPTH_STENCIL;
      var loadOp = LoadOp.CLEAR;
      if (clearFlag === ClearFlagBit.NONE) {
        loadOp = LoadOp.LOAD;
      }
      pass.addDepthStencil(name, loadOp, StoreOp.STORE, this.clearDepthColor.x, this.clearDepthColor.y, clearFlag);
    } else {
      var clearColor = new Color();
      clearColor.copy(this.clearColor);
      var _clearFlag = this.clearFlag & ClearFlagBit.COLOR;
      var _loadOp = LoadOp.CLEAR;
      if (_clearFlag === ClearFlagBit.NONE && !(this.clearFlag & SkyBoxFlagValue.VALUE)) {
        _loadOp = LoadOp.LOAD;
      } else if (this.clearFlag & SkyBoxFlagValue.VALUE) {
        clearColor.set(0, 0, 0, 1);
      }
      pass.addRenderTarget(name, _loadOp, StoreOp.STORE, clearColor);
    }
    return this;
  };
  _proto.setPassInput = function setPassInput(inputName, shaderName) {
    if (this.ppl.containsResource(inputName)) {
      this.pass.addTexture(inputName, shaderName);
    }
    return this;
  };
  _proto.blitScreen = function blitScreen(passIdx) {
    if (passIdx === void 0) {
      passIdx = 0;
    }
    this.pass.addQueue(QueueHint.RENDER_TRANSPARENT).addCameraQuad(this.camera, this.material, passIdx, SceneFlags.NONE);
    return this;
  };
  return PassContext;
}();
var passContext = new PassContext();

var _BasePassID = 0;
var _pointSampler = null;
var _samplerPointInfo = new SamplerInfo(Filter.POINT, Filter.POINT, Filter.NONE, Address.CLAMP, Address.CLAMP, Address.CLAMP);
function getRTFormatBeforeToneMapping(ppl) {
  var useFloatOutput = ppl.getMacroBool('CC_USE_FLOAT_OUTPUT');
  return ppl.pipelineSceneData.isHDR && useFloatOutput && supportsRGBA16HalfFloatTexture(ppl.device) ? Format.RGBA16F : Format.RGBA8;
}
function forceEnableFloatOutput(ppl) {
  var enabled = ppl.getMacroBool('CC_USE_FLOAT_OUTPUT');
  if (ppl.pipelineSceneData.isHDR && !enabled) {
    var supportFloatOutput = supportsRGBA16HalfFloatTexture(ppl.device);
    ppl.setMacroBool('CC_USE_FLOAT_OUTPUT', supportFloatOutput);
    macro.ENABLE_FLOAT_OUTPUT = supportFloatOutput;
    enabled = supportFloatOutput;
  }
  return enabled;
}
function disablePostProcessForDebugView() {
  var debugView = cclegacy.director.root.debugView;
  return debugView.singleMode > 0;
}
function getShadowMapSampler() {
  if (!_pointSampler) {
    var director = cclegacy.director;
    var pipeline = director.root.pipeline;
    var device = pipeline.device;
    _pointSampler = device.getSampler(_samplerPointInfo);
  }
  return _pointSampler || undefined;
}
var BasePass = function () {
  function BasePass() {
    this.name = void 0;
    this.effectName = 'pipeline/post-process/blit-screen';
    this._id = 0;
    this.context = passContext;
    this.getCameraUniqueID = getCameraUniqueID;
    this._material = void 0;
    this.enable = true;
    this.outputNames = [];
    this.lastPass = void 0;
    this.enableInAllEditorCamera = false;
    this._id = _BasePassID++;
  }
  var _proto = BasePass.prototype;
  _proto.slotName = function slotName(camera, index) {
    if (index === void 0) {
      index = 0;
    }
    var name = this.outputNames[index] + this.name;
    return name + "_" + this._id + "_" + getCameraUniqueID(camera);
  };
  _proto.checkEnable = function checkEnable(camera) {
    return this.enable;
  };
  _proto.renderProfiler = function renderProfiler(camera) {
    if (passContext.isFinalCamera && !EDITOR) {
      passContext.pass.showStatistics = true;
    }
  };
  return _createClass(BasePass, [{
    key: "material",
    get: function get() {
      var effectReloaded = false;
      if (!this._material || effectReloaded) {
        var mat = new Material();
        mat._uuid = this.name + "-" + this.effectName + "-material";
        mat.initialize({
          effectName: this.effectName
        });
        this._material = mat;
      }
      var material;
      return material || this._material;
    }
  }]);
}();

var ForwardFinalPass = function (_BasePass) {
  function ForwardFinalPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BasePass.call.apply(_BasePass, [this].concat(args)) || this;
    _this.name = 'ForwardFinalPass';
    _this.outputNames = ['ForwardFinalColor'];
    _this.enableInAllEditorCamera = true;
    return _this;
  }
  _inheritsLoose(ForwardFinalPass, _BasePass);
  var _proto = ForwardFinalPass.prototype;
  _proto.render = function render(camera, ppl) {
    if (!this.lastPass) {
      return;
    }
    passContext.clearFlag = camera.clearFlag & ClearFlagBit.COLOR | camera.clearFlag & SkyBoxFlagValue.VALUE;
    Vec4.set(passContext.clearColor, camera.clearColor.x, camera.clearColor.y, camera.clearColor.z, camera.clearColor.w);
    passContext.material = this.material;
    var cameraID = getCameraUniqueID(camera);
    var input0 = this.lastPass.slotName(camera, 0);
    var slot0 = this.slotName(camera, 0);
    var isOffScreen = false;
    var fb = camera.window.framebuffer;
    var ct = fb && fb.colorTextures[0];
    var format = ct ? ct.format : Format.RGBA8;
    var shadingScale = passContext.shadingScale;
    passContext.updatePassViewPort(1 / shadingScale, 1 / shadingScale).addRenderPass('post-process', "" + this.name + cameraID).setPassInput(input0, 'inputTexture').addRasterView(slot0, format, isOffScreen).blitScreen(0);
    this.renderProfiler(camera);
  };
  return ForwardFinalPass;
}(BasePass);

var ForwardPass = function (_BasePass) {
  function ForwardPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BasePass.call.apply(_BasePass, [this].concat(args)) || this;
    _this.name = 'ForwardPass';
    _this.outputNames = ['ForwardColor', 'ForwardDS'];
    _this.enableInAllEditorCamera = true;
    _this.depthBufferShadingScale = 1;
    return _this;
  }
  _inheritsLoose(ForwardPass, _BasePass);
  var _proto = ForwardPass.prototype;
  _proto.calcDepthSlot = function calcDepthSlot(camera) {
    var depthSlotName = !!passContext.depthSlotName;
    var canUsePrevDepth = !(camera.clearFlag & ClearFlagBit.DEPTH_STENCIL);
    canUsePrevDepth = canUsePrevDepth && passContext.shadingScale === this.depthBufferShadingScale;
    if (canUsePrevDepth) {
      if (!depthSlotName) passContext.depthSlotName = _BasePass.prototype.slotName.call(this, camera, 1);
      return;
    }
    this.depthBufferShadingScale = passContext.shadingScale;
    passContext.depthSlotName = _BasePass.prototype.slotName.call(this, camera, 1);
  };
  _proto.slotName = function slotName(camera, index) {
    if (index === void 0) {
      index = 0;
    }
    if (index === 1) {
      return passContext.depthSlotName;
    }
    return _BasePass.prototype.slotName.call(this, camera, index);
  };
  _proto.render = function render(camera, ppl) {
    var _camera$scene;
    passContext.clearFlag = ClearFlagBit.COLOR | camera.clearFlag & ClearFlagBit.DEPTH_STENCIL | camera.clearFlag & SkyBoxFlagValue.VALUE;
    Vec4.set(passContext.clearColor, 0, 0, 0, 0);
    Vec4.set(passContext.clearDepthColor, camera.clearDepth, camera.clearStencil, 0, 0);
    this.calcDepthSlot(camera);
    var slot0 = this.slotName(camera, 0);
    var slot1 = this.slotName(camera, 1);
    var cameraID = getCameraUniqueID(camera);
    var isOffScreen = true;
    passContext.updatePassViewPort().addRenderPass('default', this.name + "_" + cameraID).addRasterView(slot0, getRTFormatBeforeToneMapping(ppl), isOffScreen).addRasterView(slot1, Format.DEPTH_STENCIL, isOffScreen).version();
    var pass = passContext.pass;
    var shadowPass = passContext.shadowPass;
    if (shadowPass) {
      for (var _iterator = _createForOfIteratorHelperLoose(shadowPass.mainLightShadows), _step; !(_step = _iterator()).done;) {
        var dirShadowName = _step.value;
        if (ppl.containsResource(dirShadowName)) {
          pass.addTexture(dirShadowName, 'cc_shadowMap', getShadowMapSampler());
        }
      }
      for (var _iterator2 = _createForOfIteratorHelperLoose(shadowPass.spotLightShadows), _step2; !(_step2 = _iterator2()).done;) {
        var spotShadowName = _step2.value;
        if (ppl.containsResource(spotShadowName)) {
          pass.addTexture(spotShadowName, 'cc_spotShadowMap', getShadowMapSampler());
        }
      }
    }
    var forwardQueue = pass.addQueue(QueueHint.RENDER_OPAQUE);
    forwardQueue.addSceneOfCamera(camera, new LightInfo(), SceneFlags.OPAQUE_OBJECT | SceneFlags.CUTOUT_OBJECT | SceneFlags.GEOMETRY);
    var forwardAddQueue = pass.addQueue(QueueHint.RENDER_TRANSPARENT, 'forward-add');
    passContext.addSceneLights(forwardAddQueue, camera);
    var shadowInfo = ppl.pipelineSceneData.shadows;
    if ((_camera$scene = camera.scene) != null && _camera$scene.mainLight && shadowInfo.enabled && shadowInfo.type === ShadowType.Planar) {
      var _camera$scene2;
      pass.addQueue(QueueHint.RENDER_TRANSPARENT, 'planar-shadow').addSceneOfCamera(camera, new LightInfo((_camera$scene2 = camera.scene) == null ? void 0 : _camera$scene2.mainLight), SceneFlags.TRANSPARENT_OBJECT | SceneFlags.SHADOW_CASTER | SceneFlags.GEOMETRY);
    }
    passContext.forwardPass = this;
  };
  return ForwardPass;
}(BasePass);

var _dec$9, _dec2$7, _class$9;
var PostProcessSetting = (_dec$9 = ccclass('cc.PostProcessSetting'), _dec2$7 = requireComponent(PostProcess), _dec$9(_class$9 = _dec2$7(_class$9 = function (_Component) {
  function PostProcessSetting() {
    return _Component.apply(this, arguments) || this;
  }
  _inheritsLoose(PostProcessSetting, _Component);
  var _proto = PostProcessSetting.prototype;
  _proto.onEnable = function onEnable() {
    var pp = this.getComponent(PostProcess);
    pp == null ? void 0 : pp.addSetting(this);
  };
  _proto.onDisable = function onDisable() {
    var pp = this.getComponent(PostProcess);
    pp == null ? void 0 : pp.removeSetting(this);
  };
  return PostProcessSetting;
}(Component)) || _class$9) || _class$9);

var _dec$8, _class$8, _class2$7, _initializer$7, _initializer2$5;
var TAA = (_dec$8 = ccclass('cc.TAA'), _dec$8(_class$8 = disallowMultiple(_class$8 = (_class2$7 = function (_PostProcessSetting) {
  function TAA() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PostProcessSetting.call.apply(_PostProcessSetting, [this].concat(args)) || this;
    _this._sampleScale = _initializer$7 && _initializer$7();
    _this._feedback = _initializer2$5 && _initializer2$5();
    return _this;
  }
  _inheritsLoose(TAA, _PostProcessSetting);
  return _createClass(TAA, [{
    key: "sampleScale",
    get: function get() {
      return this._sampleScale;
    },
    set: function set(v) {
      this._sampleScale = v;
    }
  }, {
    key: "feedback",
    get: function get() {
      return this._feedback;
    },
    set: function set(v) {
      this._feedback = v;
    }
  }]);
}(PostProcessSetting), _initializer$7 = applyDecoratedInitializer(_class2$7.prototype, "_sampleScale", [serializable], function () {
  return 1;
}), _applyDecoratedDescriptor(_class2$7.prototype, "sampleScale", [property], Object.getOwnPropertyDescriptor(_class2$7.prototype, "sampleScale"), _class2$7.prototype), _initializer2$5 = applyDecoratedInitializer(_class2$7.prototype, "_feedback", [serializable], function () {
  return 0.95;
}), _applyDecoratedDescriptor(_class2$7.prototype, "feedback", [property], Object.getOwnPropertyDescriptor(_class2$7.prototype, "feedback"), _class2$7.prototype), _class2$7)) || _class$8) || _class$8);

var _dec$7, _dec2$6, _class$7, _class2$6, _initializer$6;
var TAAMask = (_dec$7 = ccclass('TAAMask'), _dec2$6 = property(Camera), _dec$7(_class$7 = (_class2$6 = function (_Component) {
  function TAAMask() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.maskCamera = _initializer$6 && _initializer$6();
    _this._mask = void 0;
    return _this;
  }
  _inheritsLoose(TAAMask, _Component);
  var _proto = TAAMask.prototype;
  _proto.start = function start() {
    if (!this.maskCamera) {
      warn('Can not find a Camera for TAAMask');
      return;
    }
    var tex = new RenderTexture();
    tex.reset({
      width: game.canvas.width,
      height: game.canvas.height
    });
    this._mask = tex;
    this.maskCamera.targetTexture = tex;
  };
  return _createClass(TAAMask, [{
    key: "mask",
    get: function get() {
      if (!this.maskCamera || !this.maskCamera.enabledInHierarchy) {
        return undefined;
      }
      if (!this.enabledInHierarchy) {
        return undefined;
      }
      return this._mask;
    }
  }]);
}(Component), _initializer$6 = applyDecoratedInitializer(_class2$6.prototype, "maskCamera", [_dec2$6], null), _class2$6)) || _class$7);

function getSetting(settingClass) {
  var cls = settingClass;
  var setting = passContext.postProcess && passContext.postProcess.getSetting(cls);
  return setting;
}
var SettingPass = function (_BasePass) {
  function SettingPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BasePass.call.apply(_BasePass, [this].concat(args)) || this;
    _this.getSetting = getSetting;
    return _this;
  }
  _inheritsLoose(SettingPass, _BasePass);
  var _proto = SettingPass.prototype;
  _proto.checkEnable = function checkEnable(camera) {
    var enable = _BasePass.prototype.checkEnable.call(this, camera);
    var setting = this.setting;
    return enable && !!setting && setting.enabledInHierarchy;
  };
  return _createClass(SettingPass, [{
    key: "setting",
    get: function get() {
      return this.getSetting(PostProcessSetting);
    }
  }]);
}(BasePass);

var tempVec4$1 = new Vec4();
var halton8 = [new Vec2(0.5, 1.0 / 3), new Vec2(0.25, 2.0 / 3), new Vec2(0.75, 1.0 / 9), new Vec2(0.125, 4.0 / 9), new Vec2(0.625, 7.0 / 9), new Vec2(0.375, 2.0 / 9), new Vec2(0.875, 5.0 / 9), new Vec2(0.0625, 8.0 / 9)];
halton8.forEach(function (v) {
  v.x -= 0.5;
  v.y -= 0.5;
});
var SampleOffsets = {
  x2: [new Vec2(-4 / 16.0, -4 / 16.0), new Vec2(4.0 / 16.0, 4.0 / 16.0)],
  x3: [new Vec2(-2 / 3.0, -2 / 3.0), new Vec2(2 / 3, 0 / 3), new Vec2(0 / 3, 2 / 3)],
  x4: [new Vec2(-2 / 16, -6 / 16), new Vec2(6 / 16, -2 / 16), new Vec2(2 / 16, 6 / 16), new Vec2(-6 / 16, 2 / 16)],
  x5: [new Vec2(0, -1 / 2), new Vec2(1 / 2, 0), new Vec2(0, 1 / 2), new Vec2(-1 / 2, 0)],
  halton8: halton8
};
var TAAPass = function (_SettingPass) {
  function TAAPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'TAAPass';
    _this.effectName = 'pipeline/post-process/taa';
    _this.outputNames = ['TAA_First', 'TAA_Second'];
    _this.prevMatViewProj = new Mat4();
    _this.taaTextureIndex = -2;
    _this.samples = SampleOffsets.halton8;
    _this.sampleIndex = -1;
    _this.sampleOffset = new Vec2();
    _this.forceRender = true;
    _this.dirty = false;
    _this.taaMaskMaterial = void 0;
    _this.firstRender = true;
    return _this;
  }
  _inheritsLoose(TAAPass, _SettingPass);
  var _proto = TAAPass.prototype;
  _proto.checkEnable = function checkEnable(camera) {
    var enable = _SettingPass.prototype.checkEnable.call(this, camera);
    if (disablePostProcessForDebugView()) {
      enable = false;
    }
    return enable;
  };
  _proto.slotName = function slotName(camera, index) {
    if (index === void 0) {
      index = 0;
    }
    if (!this.checkEnable(camera)) {
      return this.lastPass.slotName(camera, index);
    }
    if (this.taaTextureIndex < 0) {
      return _SettingPass.prototype.slotName.call(this, camera, 0);
    }
    return _SettingPass.prototype.slotName.call(this, camera, (this.taaTextureIndex + 1) % 2);
  };
  _proto.applyCameraJitter = function applyCameraJitter(camera) {
    camera._isProjDirty = true;
    camera.update(true);
    camera.matProj.m12 += this.sampleOffset.x;
    camera.matProj.m13 += this.sampleOffset.y;
    Mat4.invert(camera.matProjInv, camera.matProj);
    Mat4.multiply(camera.matViewProj, camera.matProj, camera.matView);
    Mat4.invert(camera.matViewProjInv, camera.matViewProj);
    camera.frustum.update(camera.matViewProj, camera.matViewProjInv);
  };
  _proto.updateSample = function updateSample() {
    if (this.dirty || this.forceRender) {
      this.sampleIndex++;
      this.taaTextureIndex++;
      this.dirty = false;
    }
    var offset = this.samples[this.sampleIndex % this.samples.length];
    if (this.sampleIndex === -1) {
      offset = Vec2.ZERO;
    }
    var setting = this.setting;
    this.sampleOffset.x = offset.x * setting.sampleScale / game.canvas.width;
    this.sampleOffset.y = offset.y * setting.sampleScale / game.canvas.height;
  };
  _proto.render = function render(camera, ppl) {
    var cameraID = getCameraUniqueID(camera);
    passContext.clearFlag = ClearFlagBit.COLOR;
    Vec4.set(passContext.clearColor, 0, 0, 0, 1);
    var firstRender = this.firstRender;
    if (firstRender) {
      this.prevMatViewProj.set(camera.matViewProj);
      this.firstRender = false;
    }
    var setting = this.setting;
    passContext.updatePassViewPort();
    var width = passContext.passViewport.width;
    var height = passContext.passViewport.height;
    var material = this.material;
    var taaMask = camera.node.getComponent(TAAMask);
    var maskTex;
    if (taaMask && taaMask.enabledInHierarchy) {
      maskTex = taaMask.mask;
    }
    if (maskTex) {
      if (!this.taaMaskMaterial) {
        var mi = new MaterialInstance({
          parent: material
        });
        mi.recompileShaders({
          USE_TAA_MASK: !EDITOR
        });
        this.taaMaskMaterial = mi;
      }
      material = this.taaMaskMaterial;
      material.setProperty('motionMaskTex', maskTex);
    } else {
      var black = builtinResMgr.get('black-texture');
      maskTex = black;
      material.setProperty('motionMaskTex', maskTex);
    }
    material.setProperty('taaParams1', tempVec4$1.set(this.sampleOffset.x, this.sampleOffset.y, setting.feedback, 0));
    material.setProperty('taaTextureSize', tempVec4$1.set(1 / width, 1 / height, 1 / width, 1 / height));
    material.setProperty('taaPrevViewProj', this.prevMatViewProj);
    this.prevMatViewProj.set(camera.matViewProj);
    passContext.material = material;
    var input0 = this.lastPass.slotName(camera, 0);
    var historyTexture = _SettingPass.prototype.slotName.call(this, camera, this.taaTextureIndex % 2);
    if (firstRender) {
      historyTexture = input0;
    }
    var slot0 = this.slotName(camera, 0);
    var depthTex = passContext.depthSlotName;
    var layoutName = "DeferredTAA" + (this.taaTextureIndex < 0 ? -1 : this.taaTextureIndex % 2);
    passContext.addRenderPass(layoutName, "CameraTAAPass" + cameraID).setPassInput(input0, 'inputTexture').setPassInput(depthTex, 'depthTex').setPassInput(historyTexture, 'taaPrevTexture').addRasterView(slot0, Format.RGBA16F, true, ResourceResidency.PERSISTENT).blitScreen(0).version();
  };
  return _createClass(TAAPass, [{
    key: "setting",
    get: function get() {
      return getSetting(TAA);
    }
  }]);
}(SettingPass);

var _dec$6, _dec2$5, _class$6, _class2$5, _initializer$5;
var FSR = (_dec$6 = ccclass('cc.FSR'), _dec2$5 = type(CCFloat), _dec$6(_class$6 = disallowMultiple(_class$6 = (_class2$5 = function (_PostProcessSetting) {
  function FSR() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PostProcessSetting.call.apply(_PostProcessSetting, [this].concat(args)) || this;
    _this._sharpness = _initializer$5 && _initializer$5();
    return _this;
  }
  _inheritsLoose(FSR, _PostProcessSetting);
  return _createClass(FSR, [{
    key: "sharpness",
    get: function get() {
      return this._sharpness;
    },
    set: function set(v) {
      this._sharpness = v;
    }
  }]);
}(PostProcessSetting), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "_sharpness", [serializable], function () {
  return 0.8;
}), _applyDecoratedDescriptor(_class2$5.prototype, "sharpness", [_dec2$5], Object.getOwnPropertyDescriptor(_class2$5.prototype, "sharpness"), _class2$5.prototype), _class2$5)) || _class$6) || _class$6);

var tempVec4 = new Vec4();
var FSRPass = function (_SettingPass) {
  function FSRPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'FSRPass';
    _this.effectName = 'pipeline/post-process/fsr';
    _this.outputNames = ['FSRColor'];
    return _this;
  }
  _inheritsLoose(FSRPass, _SettingPass);
  var _proto = FSRPass.prototype;
  _proto.checkEnable = function checkEnable(camera) {
    var enable = _SettingPass.prototype.checkEnable.call(this, camera);
    return enable;
  };
  _proto.render = function render(camera, ppl) {
    var cameraID = getCameraUniqueID(camera);
    passContext.material = this.material;
    passContext.clearBlack();
    passContext.updatePassViewPort(1 / passContext.shadingScale, 0);
    var inputWidth = Math.floor(passContext.passViewport.width * passContext.shadingScale);
    var inputHeight = Math.floor(passContext.passViewport.height * passContext.shadingScale);
    var outWidth = Math.floor(passContext.passViewport.width);
    var outHeight = Math.floor(passContext.passViewport.height);
    var setting = this.setting;
    this.material.setProperty('fsrParams', tempVec4.set(clamp(1.0 - setting.sharpness, 0.02, 0.98), 0, 0, 0));
    this.material.setProperty('texSize', tempVec4.set(inputWidth, inputHeight, outWidth, outHeight));
    var input0 = this.lastPass.slotName(camera, 0);
    var easu = "FSR_EASU" + cameraID;
    passContext.addRenderPass('post-process', "CameraFSR_EASU_Pass" + cameraID).setPassInput(input0, 'outputResultMap').addRasterView(easu, Format.RGBA8).blitScreen(0).version();
    var slot0 = this.slotName(camera, 0);
    passContext.addRenderPass('post-process', "CameraFSR_RCAS_Pass" + cameraID).setPassInput(easu, 'outputResultMap').addRasterView(slot0, Format.RGBA8).blitScreen(1).version();
  };
  return _createClass(FSRPass, [{
    key: "setting",
    get: function get() {
      return getSetting(FSR);
    }
  }]);
}(SettingPass);

var _dec$5, _dec2$4, _dec3$4, _dec4$3, _class$5, _class2$4, _initializer$4, _initializer2$4, _dec5$2, _dec6$2, _dec7, _dec8, _dec9, _class3, _class4, _initializer3$3, _initializer4$2;
var BlitScreenMaterial = (_dec$5 = ccclass('cc.BlitScreenMaterial'), _dec2$4 = property(Material), _dec3$4 = property(Material), _dec4$3 = property({
  serializable: true
}), _dec$5(_class$5 = (_class2$4 = function () {
  function BlitScreenMaterial() {
    this._material = _initializer$4 && _initializer$4();
    this.enable = _initializer2$4 && _initializer2$4();
  }
  return _createClass(BlitScreenMaterial, [{
    key: "material",
    get: function get() {
      return this._material;
    },
    set: function set(v) {
      this._material = v;
    }
  }]);
}(), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "_material", [_dec2$4, serializable], null), _applyDecoratedDescriptor(_class2$4.prototype, "material", [_dec3$4], Object.getOwnPropertyDescriptor(_class2$4.prototype, "material"), _class2$4.prototype), _initializer2$4 = applyDecoratedInitializer(_class2$4.prototype, "enable", [_dec4$3], function () {
  return true;
}), _class2$4)) || _class$5);
var BlitScreen = (_dec5$2 = ccclass('cc.BlitScreen'), _dec6$2 = property(Material), _dec7 = property({
  type: Material,
  visible: false
}), _dec8 = property(BlitScreenMaterial), _dec9 = property(BlitScreenMaterial), _dec5$2(_class3 = disallowMultiple(_class3 = (_class4 = function (_PostProcessSetting) {
  function BlitScreen() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PostProcessSetting.call.apply(_PostProcessSetting, [this].concat(args)) || this;
    _this._activeMaterials = _initializer3$3 && _initializer3$3();
    _this._materials = _initializer4$2 && _initializer4$2();
    return _this;
  }
  _inheritsLoose(BlitScreen, _PostProcessSetting);
  var _proto = BlitScreen.prototype;
  _proto.updateActiveMaterials = function updateActiveMaterials() {
    var materials = this._materials;
    this._activeMaterials.length = 0;
    for (var i = 0; i < materials.length; i++) {
      var m = materials[i];
      if (m.enable && m.material) {
        this._activeMaterials.push(m.material);
      }
    }
  };
  _proto.onLoad = function onLoad() {
    this.updateActiveMaterials();
  };
  return _createClass(BlitScreen, [{
    key: "activeMaterials",
    get: function get() {
      return this._activeMaterials;
    },
    set: function set(v) {
      this._activeMaterials = v;
      for (var i = 0; i < this._materials.length; i++) {
        for (var j = 0; j < v.length; j++) {
          if (this._materials[i] && v[j]) {
            var _this$_materials$i$ma;
            if (((_this$_materials$i$ma = this._materials[i].material) == null ? void 0 : _this$_materials$i$ma.uuid) === v[j].uuid) {
              this._materials[i].material = v[j];
            }
          }
        }
      }
    }
  }, {
    key: "materials",
    get: function get() {
      return this._materials;
    },
    set: function set(v) {
      this._materials = v;
      this.updateActiveMaterials();
    }
  }]);
}(PostProcessSetting), _initializer3$3 = applyDecoratedInitializer(_class4.prototype, "_activeMaterials", [_dec6$2, serializable], function () {
  return [];
}), _applyDecoratedDescriptor(_class4.prototype, "activeMaterials", [_dec7], Object.getOwnPropertyDescriptor(_class4.prototype, "activeMaterials"), _class4.prototype), _initializer4$2 = applyDecoratedInitializer(_class4.prototype, "_materials", [_dec8, serializable], function () {
  return [];
}), _applyDecoratedDescriptor(_class4.prototype, "materials", [_dec9], Object.getOwnPropertyDescriptor(_class4.prototype, "materials"), _class4.prototype), _class4)) || _class3) || _class3);

var outputNames = ['BlitScreenColor0', 'BlitScreenColor1'];
var BlitScreenPass = function (_SettingPass) {
  function BlitScreenPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'BlitScreenPass';
    _this.effectName = 'pipeline/post-process/blit-screen';
    _this.outputName = outputNames[0];
    return _this;
  }
  _inheritsLoose(BlitScreenPass, _SettingPass);
  var _proto = BlitScreenPass.prototype;
  _proto.slotName = function slotName(camera, index) {
    return this.outputName;
  };
  _proto.checkEnable = function checkEnable(camera) {
    var enable = _SettingPass.prototype.checkEnable.call(this, camera);
    var setting = this.setting;
    return enable && setting.activeMaterials.length > 0;
  };
  _proto.render = function render(camera, ppl) {
    var cameraID = getCameraUniqueID(camera);
    passContext.clearBlack();
    var input0 = this.lastPass.slotName(camera, 0);
    var slotIdx = 0;
    var materials = this.setting.activeMaterials;
    for (var i = 0; i < materials.length; i++) {
      var material = materials[i];
      passContext.material = material;
      var slotName = "" + outputNames[slotIdx] + cameraID;
      slotIdx = ++slotIdx % 2;
      passContext.updatePassViewPort().addRenderPass('post-process', "" + this.name + cameraID + slotIdx).setPassInput(input0, 'inputTexture').addRasterView(slotName, Format.RGBA8).blitScreen(0).version();
      input0 = slotName;
    }
    this.outputName = input0;
  };
  return _createClass(BlitScreenPass, [{
    key: "setting",
    get: function get() {
      return getSetting(BlitScreen);
    }
  }]);
}(SettingPass);

var ShadowPass = function (_BasePass) {
  function ShadowPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BasePass.call.apply(_BasePass, [this].concat(args)) || this;
    _this.name = 'ShadowPass';
    _this.mainLightShadows = [];
    _this.spotLightShadows = [];
    return _this;
  }
  _inheritsLoose(ShadowPass, _BasePass);
  var _proto = ShadowPass.prototype;
  _proto.render = function render(camera, ppl) {
    passContext.shadowPass = this;
    var cameraID = getCameraUniqueID(camera);
    var cameraName = "Camera" + cameraID;
    var shadowInfo = buildShadowPasses(cameraName, camera, ppl);
    this.mainLightShadows = shadowInfo.mainLightShadowNames;
    this.spotLightShadows = shadowInfo.spotLightShadowNames;
  };
  return ShadowPass;
}(BasePass);

var _dec$4, _dec2$3, _dec3$3, _class$4, _class2$3, _initializer$3, _initializer2$3;
var ColorGrading = (_dec$4 = ccclass('cc.ColorGrading'), _dec2$3 = type(CCFloat), _dec3$3 = type(Texture2D), _dec$4(_class$4 = disallowMultiple(_class$4 = (_class2$3 = function (_PostProcessSetting) {
  function ColorGrading() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PostProcessSetting.call.apply(_PostProcessSetting, [this].concat(args)) || this;
    _this._contribute = _initializer$3 && _initializer$3();
    _this._colorGradingMap = _initializer2$3 && _initializer2$3();
    return _this;
  }
  _inheritsLoose(ColorGrading, _PostProcessSetting);
  return _createClass(ColorGrading, [{
    key: "contribute",
    get: function get() {
      return this._contribute;
    },
    set: function set(value) {
      this._contribute = value;
    }
  }, {
    key: "colorGradingMap",
    get: function get() {
      return this._colorGradingMap;
    },
    set: function set(val) {
      this._colorGradingMap = val;
    }
  }]);
}(PostProcessSetting), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "_contribute", [serializable], function () {
  return 0.0;
}), _initializer2$3 = applyDecoratedInitializer(_class2$3.prototype, "_colorGradingMap", [serializable], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$3.prototype, "contribute", [_dec2$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "contribute"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "colorGradingMap", [_dec3$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "colorGradingMap"), _class2$3.prototype), _class2$3)) || _class$4) || _class$4);

var _dec$3, _dec2$2, _dec3$2, _dec4$2, _dec5$1, _dec6$1, _class$3, _class2$2, _initializer$2, _initializer2$2, _initializer3$2, _initializer4$1, _initializer5$1;
var Bloom = (_dec$3 = ccclass('cc.Bloom'), _dec2$2 = type(CCBoolean), _dec3$2 = type(CCBoolean), _dec4$2 = type(CCFloat), _dec5$1 = type(CCInteger), _dec6$1 = type(CCFloat), _dec$3(_class$3 = disallowMultiple(_class$3 = (_class2$2 = function (_PostProcessSetting) {
  function Bloom() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PostProcessSetting.call.apply(_PostProcessSetting, [this].concat(args)) || this;
    _this._enableAlphaMask = _initializer$2 && _initializer$2();
    _this._useHdrIlluminance = _initializer2$2 && _initializer2$2();
    _this._threshold = _initializer3$2 && _initializer3$2();
    _this._iterations = _initializer4$1 && _initializer4$1();
    _this._intensity = _initializer5$1 && _initializer5$1();
    return _this;
  }
  _inheritsLoose(Bloom, _PostProcessSetting);
  return _createClass(Bloom, [{
    key: "enableAlphaMask",
    get: function get() {
      return this._enableAlphaMask;
    },
    set: function set(value) {
      this._enableAlphaMask = value;
    }
  }, {
    key: "useHdrIlluminance",
    get: function get() {
      return this._useHdrIlluminance;
    },
    set: function set(value) {
      this._useHdrIlluminance = value;
    }
  }, {
    key: "threshold",
    get: function get() {
      return this._threshold;
    },
    set: function set(value) {
      this._threshold = value;
    }
  }, {
    key: "iterations",
    get: function get() {
      return this._iterations;
    },
    set: function set(value) {
      this._iterations = value;
    }
  }, {
    key: "intensity",
    get: function get() {
      return this._intensity;
    },
    set: function set(value) {
      this._intensity = value;
    }
  }]);
}(PostProcessSetting), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_enableAlphaMask", [serializable], function () {
  return false;
}), _initializer2$2 = applyDecoratedInitializer(_class2$2.prototype, "_useHdrIlluminance", [serializable], function () {
  return false;
}), _initializer3$2 = applyDecoratedInitializer(_class2$2.prototype, "_threshold", [serializable], function () {
  return 0.8;
}), _initializer4$1 = applyDecoratedInitializer(_class2$2.prototype, "_iterations", [serializable], function () {
  return 3;
}), _initializer5$1 = applyDecoratedInitializer(_class2$2.prototype, "_intensity", [serializable], function () {
  return 2.3;
}), _applyDecoratedDescriptor(_class2$2.prototype, "enableAlphaMask", [_dec2$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "enableAlphaMask"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "useHdrIlluminance", [_dec3$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "useHdrIlluminance"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "threshold", [_dec4$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "threshold"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "iterations", [_dec5$1], Object.getOwnPropertyDescriptor(_class2$2.prototype, "iterations"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "intensity", [_dec6$1], Object.getOwnPropertyDescriptor(_class2$2.prototype, "intensity"), _class2$2.prototype), _class2$2)) || _class$3) || _class$3);

var _dec$2, _dec2$1, _dec3$1, _dec4$1, _dec5, _dec6, _class$2, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4, _initializer5;
var HBAO = (_dec$2 = ccclass('cc.HBAO'), _dec2$1 = type(CCFloat), _dec3$1 = type(CCFloat), _dec4$1 = type(CCInteger), _dec5 = type(CCFloat), _dec6 = type(CCBoolean), _dec$2(_class$2 = disallowMultiple(_class$2 = (_class2$1 = function (_PostProcessSetting) {
  function HBAO() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PostProcessSetting.call.apply(_PostProcessSetting, [this].concat(args)) || this;
    _this._radiusScale = _initializer$1 && _initializer$1();
    _this._angleBiasDegree = _initializer2$1 && _initializer2$1();
    _this._blurSharpness = _initializer3$1 && _initializer3$1();
    _this._aoSaturation = _initializer4 && _initializer4();
    _this._needBlur = _initializer5 && _initializer5();
    return _this;
  }
  _inheritsLoose(HBAO, _PostProcessSetting);
  return _createClass(HBAO, [{
    key: "radiusScale",
    get: function get() {
      return this._radiusScale;
    },
    set: function set(value) {
      this._radiusScale = value;
    }
  }, {
    key: "angleBiasDegree",
    get: function get() {
      return this._angleBiasDegree;
    },
    set: function set(value) {
      this._angleBiasDegree = value;
    }
  }, {
    key: "blurSharpness",
    get: function get() {
      return this._blurSharpness;
    },
    set: function set(value) {
      this._blurSharpness = value;
    }
  }, {
    key: "aoSaturation",
    get: function get() {
      return this._aoSaturation;
    },
    set: function set(value) {
      this._aoSaturation = value;
    }
  }, {
    key: "needBlur",
    get: function get() {
      return this._needBlur;
    },
    set: function set(value) {
      this._needBlur = value;
    }
  }]);
}(PostProcessSetting), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_radiusScale", [serializable], function () {
  return 1.0;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_angleBiasDegree", [serializable], function () {
  return 10.0;
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "_blurSharpness", [serializable], function () {
  return 3;
}), _initializer4 = applyDecoratedInitializer(_class2$1.prototype, "_aoSaturation", [serializable], function () {
  return 1.0;
}), _initializer5 = applyDecoratedInitializer(_class2$1.prototype, "_needBlur", [serializable], function () {
  return true;
}), _applyDecoratedDescriptor(_class2$1.prototype, "radiusScale", [_dec2$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "radiusScale"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "angleBiasDegree", [_dec3$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "angleBiasDegree"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "blurSharpness", [_dec4$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "blurSharpness"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "aoSaturation", [_dec5], Object.getOwnPropertyDescriptor(_class2$1.prototype, "aoSaturation"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "needBlur", [_dec6], Object.getOwnPropertyDescriptor(_class2$1.prototype, "needBlur"), _class2$1.prototype), _class2$1)) || _class$2) || _class$2);

var _dec$1, _dec2, _dec3, _dec4, _class$1, _class2, _initializer, _initializer2, _initializer3;
var DOF = (_dec$1 = ccclass('cc.DOF'), _dec2 = type(CCFloat), _dec3 = type(CCFloat), _dec4 = type(CCFloat), _dec$1(_class$1 = disallowMultiple(_class$1 = (_class2 = function (_PostProcessSetting) {
  function DOF() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PostProcessSetting.call.apply(_PostProcessSetting, [this].concat(args)) || this;
    _this._focusDistance = _initializer && _initializer();
    _this._focusRange = _initializer2 && _initializer2();
    _this._bokehRadius = _initializer3 && _initializer3();
    return _this;
  }
  _inheritsLoose(DOF, _PostProcessSetting);
  return _createClass(DOF, [{
    key: "focusDistance",
    get: function get() {
      return this._focusDistance;
    },
    set: function set(value) {
      this._focusDistance = value;
    }
  }, {
    key: "focusRange",
    get: function get() {
      return this._focusRange;
    },
    set: function set(value) {
      this._focusRange = value;
    }
  }, {
    key: "bokehRadius",
    get: function get() {
      return this._bokehRadius;
    },
    set: function set(value) {
      this._bokehRadius = value;
    }
  }]);
}(PostProcessSetting), _initializer = applyDecoratedInitializer(_class2.prototype, "_focusDistance", [serializable], function () {
  return 0.0;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_focusRange", [serializable], function () {
  return 0.0;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_bokehRadius", [serializable], function () {
  return 1.0;
}), _applyDecoratedDescriptor(_class2.prototype, "focusDistance", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "focusDistance"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "focusRange", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "focusRange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "bokehRadius", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "bokehRadius"), _class2.prototype), _class2)) || _class$1) || _class$1);

var vec2 = new Vec2();
var HBAOParams = function () {
  function HBAOParams() {
    this._uvDepthToEyePosParams = new Vec4();
    this._radiusParam = new Vec4();
    this._miscParam = new Vec4();
    this._blurParam = new Vec4();
    this._depthTexFullResolution = new Vec2(1024);
    this._depthTexResolution = new Vec2(1024);
    this._sceneScale = 1.0;
    this._cameraFov = toRadian(45.0);
    this._radiusScale = 1.0;
    this._angleBiasDegree = 10.0;
    this._aoStrength = 1.0;
    this._blurSharpness = 8;
    this._aoSaturation = 1.0;
    this._randomDirAndJitter = [238, 91, 87, 255, 251, 44, 119, 255, 247, 64, 250, 255, 232, 5, 225, 255, 253, 177, 140, 255, 250, 51, 84, 255, 243, 76, 97, 255, 252, 36, 232, 255, 235, 100, 24, 255, 252, 36, 158, 255, 254, 20, 142, 255, 245, 135, 124, 255, 251, 43, 121, 255, 253, 31, 145, 255, 235, 98, 160, 255, 240, 146, 198, 255];
    this._init();
    this.update();
  }
  var _proto = HBAOParams.prototype;
  _proto._init = function _init() {
    var width = 4;
    var height = 4;
    var pixelFormat = PixelFormat.RGBA8888;
    var arrayBuffer = new Uint8Array(width * height * 4);
    for (var i = 0; i < this._randomDirAndJitter.length; i++) {
      arrayBuffer[i] = this._randomDirAndJitter[i];
    }
    var image = new ImageAsset({
      width: width,
      height: height,
      _data: arrayBuffer,
      _compressed: false,
      format: pixelFormat
    });
    this.randomTexture = new Texture2D();
    this.randomTexture.setFilters(TextureFilter.NEAREST, TextureFilter.NEAREST);
    this.randomTexture.setMipFilter(TextureFilter.NONE);
    this.randomTexture.setWrapMode(WrapMode.REPEAT, WrapMode.REPEAT, WrapMode.REPEAT);
    this.randomTexture.image = image;
  };
  _proto.update = function update() {
    var HALF_KERNEL_RADIUS = 4;
    var INV_LN2 = 1.44269504;
    var SQRT_LN2 = 0.8325546;
    var gR = this._radiusScale * this._sceneScale;
    var gR2 = gR * gR;
    var gNegInvR2 = -1 / gR2;
    var gMaxRadiusPixels = 0.1 * Math.min(this._depthTexFullResolution.x, this._depthTexFullResolution.y);
    this._radiusParam.set(gR, gR2, gNegInvR2, gMaxRadiusPixels);
    var vec2 = new Vec2(this._depthTexResolution.y / this._depthTexResolution.x, 1.0);
    var gFocalLen = new Vec2(vec2.x / Math.tan(this._cameraFov * 0.5), vec2.y / Math.tan(this._cameraFov * 0.5));
    var gTanAngleBias = Math.tan(toRadian(this._angleBiasDegree));
    var gStrength = this._aoStrength;
    this._miscParam.set(gFocalLen.x, gFocalLen.y, gTanAngleBias, gStrength);
    var gUVToViewA = new Vec2(2.0 / gFocalLen.x, -2 / gFocalLen.y);
    var gUVToViewB = new Vec2(-1 / gFocalLen.x, 1.0 / gFocalLen.y);
    this._uvDepthToEyePosParams.set(gUVToViewA.x, gUVToViewA.y, gUVToViewB.x, gUVToViewB.y);
    var BlurSigma = (HALF_KERNEL_RADIUS + 1.0) * 0.5;
    var gBlurFallOff = INV_LN2 / (2.0 * BlurSigma * BlurSigma);
    var gBlurDepthThreshold = 2.0 * SQRT_LN2 * (this._sceneScale / this._blurSharpness);
    this._blurParam.set(gBlurFallOff, gBlurDepthThreshold, this._blurSharpness / 8.0, this._aoSaturation);
  };
  return _createClass(HBAOParams, [{
    key: "uvDepthToEyePosParams",
    get: function get() {
      return this._uvDepthToEyePosParams;
    }
  }, {
    key: "radiusParam",
    get: function get() {
      return this._radiusParam;
    }
  }, {
    key: "miscParam",
    get: function get() {
      return this._miscParam;
    }
  }, {
    key: "blurParam",
    get: function get() {
      return this._blurParam;
    }
  }, {
    key: "depthTexFullResolution",
    set: function set(val) {
      this._depthTexFullResolution.set(val);
    }
  }, {
    key: "depthTexResolution",
    set: function set(val) {
      this._depthTexResolution.set(val);
    }
  }, {
    key: "sceneScale",
    set: function set(val) {
      this._sceneScale = val;
    }
  }, {
    key: "cameraFov",
    set: function set(val) {
      this._cameraFov = val;
    }
  }, {
    key: "radiusScale",
    set: function set(val) {
      this._radiusScale = val;
    }
  }, {
    key: "angleBiasDegree",
    set: function set(val) {
      this._angleBiasDegree = val;
    }
  }, {
    key: "aoStrength",
    set: function set(val) {
      this._aoStrength = val;
    }
  }, {
    key: "blurSharpness",
    set: function set(val) {
      this._blurSharpness = val;
    }
  }, {
    key: "aoSaturation",
    set: function set(val) {
      this._aoSaturation = val;
    }
  }]);
}();
var HBAOPass = function (_SettingPass) {
  function HBAOPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.HBAO_PASS_INDEX = 0;
    _this.HBAO_BLUR_X_PASS_INDEX = 1;
    _this.HBAO_BLUR_Y_PASS_INDEX = 2;
    _this.HBAO_COMBINED_PASS_INDEX = 3;
    _this._hbaoParams = null;
    _this._initialize = false;
    _this.averageObjectSize = new Map();
    _this.name = 'HBAOPass';
    _this.effectName = 'pipeline/post-process/hbao';
    _this.outputNames = ['hbaoRTName', 'hbaoBluredRTName'];
    return _this;
  }
  _inheritsLoose(HBAOPass, _SettingPass);
  var _proto2 = HBAOPass.prototype;
  _proto2.checkEnable = function checkEnable(camera) {
    var enable = _SettingPass.prototype.checkEnable.call(this, camera);
    return enable;
  };
  _proto2.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {
    passContext.material = this.material;
    var passes = passContext.material.passes;
    for (var i = 0; i < passes.length; i++) {
      var pass = passes[i];
      pass.beginChangeStatesSilently();
      pass.tryCompile();
      pass.endChangeStatesSilently();
    }
  };
  _proto2.getSceneScale = function getSceneScale(camera) {
    var sceneScale = camera.nearClip;
    if (!this.averageObjectSize.has(camera.node.scene)) {
      this._calculateObjectSize(camera.node.scene, camera.visibility);
    }
    if (this.averageObjectSize.has(camera.node.scene)) {
      var objectSize = this.averageObjectSize.get(camera.node.scene);
      sceneScale = objectSize * 0.1;
    }
    return sceneScale;
  };
  _proto2.render = function render(camera, ppl) {
    passContext.updatePassViewPort();
    var width = passContext.passViewport.width;
    var height = passContext.passViewport.height;
    if (!this._hbaoParams) {
      this._hbaoParams = new HBAOParams();
    }
    var setting = this.setting;
    if (!this._initialize) {
      passContext.material = this.material;
      this.material.setProperty('RandomTex', this._hbaoParams.randomTexture, 0);
    }
    var aoStrength = 1.0;
    var sceneScale = this.getSceneScale(camera);
    this._hbaoParams.depthTexFullResolution = vec2.set(width, height);
    this._hbaoParams.depthTexResolution = vec2.set(width, height);
    this._hbaoParams.sceneScale = sceneScale;
    this._hbaoParams.cameraFov = camera.fov;
    this._hbaoParams.radiusScale = setting.radiusScale;
    this._hbaoParams.angleBiasDegree = setting.angleBiasDegree;
    this._hbaoParams.aoStrength = aoStrength;
    this._hbaoParams.blurSharpness = setting.blurSharpness;
    this._hbaoParams.aoSaturation = setting.aoSaturation;
    this._hbaoParams.update();
    var director = cclegacy.director;
    var root = director.root;
    if (root.debugView) {
      if (root.debugView.isEnabled() && (root.debugView.singleMode !== DebugViewSingleType.NONE && root.debugView.singleMode !== DebugViewSingleType.AO || !root.debugView.isCompositeModeEnabled(DebugViewCompositeType.AO))) {
        return;
      }
    }
    var inputRT = this.lastPass.slotName(camera, 0);
    var inputDS = this.lastPass.slotName(camera, 1);
    var hbaoInfo = this._renderHBAOPass(camera, inputDS);
    var hbaoCombinedInputRTName = hbaoInfo.rtName;
    if (this.setting.needBlur) {
      var haboBlurInfoX = this._renderHBAOBlurPass(camera, hbaoInfo.rtName, inputDS, false);
      var haboBlurInfoY = this._renderHBAOBlurPass(camera, haboBlurInfoX.rtName, inputDS, true);
      hbaoCombinedInputRTName = haboBlurInfoY.rtName;
    }
    this._renderHBAOCombinedPass(camera, hbaoCombinedInputRTName, inputRT);
  };
  _proto2._renderHBAOPass = function _renderHBAOPass(camera, inputDS) {
    var cameraID = getCameraUniqueID(camera);
    var passIdx = this.HBAO_PASS_INDEX;
    this.material.setProperty('uvDepthToEyePosParams', this._hbaoParams.uvDepthToEyePosParams, passIdx);
    this.material.setProperty('radiusParam', this._hbaoParams.radiusParam, passIdx);
    this.material.setProperty('miscParam', this._hbaoParams.miscParam, passIdx);
    this.material.setProperty('randomTexSize', new Vec4(this._hbaoParams.randomTexture.width, this._hbaoParams.randomTexture.height, 1.0 / this._hbaoParams.randomTexture.width, 1.0 / this._hbaoParams.randomTexture.height), passIdx);
    this.material.setProperty('blurParam', this._hbaoParams.blurParam, passIdx);
    passContext.clearBlack();
    var outputRT = _SettingPass.prototype.slotName.call(this, camera, 0);
    var layoutName = 'hbao-pass';
    var passName = "CameraHBAOPass" + cameraID;
    passContext.addRenderPass(layoutName, passName).setPassInput(inputDS, 'DepthTex').addRasterView(outputRT, Format.RGBA8).blitScreen(passIdx).version();
    return {
      rtName: outputRT,
      dsName: inputDS
    };
  };
  _proto2._renderHBAOBlurPass = function _renderHBAOBlurPass(camera, inputRT, inputDS, isYPass) {
    var cameraID = getCameraUniqueID(camera);
    passContext.clearBlack();
    var passIdx = isYPass ? this.HBAO_BLUR_Y_PASS_INDEX : this.HBAO_BLUR_X_PASS_INDEX;
    passContext.material = this.material;
    this.material.setProperty('uvDepthToEyePosParams', this._hbaoParams.uvDepthToEyePosParams, passIdx);
    this.material.setProperty('radiusParam', this._hbaoParams.radiusParam, passIdx);
    this.material.setProperty('miscParam', this._hbaoParams.miscParam, passIdx);
    this.material.setProperty('randomTexSize', new Vec4(this._hbaoParams.randomTexture.width, this._hbaoParams.randomTexture.height, 1.0 / this._hbaoParams.randomTexture.width, 1.0 / this._hbaoParams.randomTexture.height), passIdx);
    this.material.setProperty('blurParam', this._hbaoParams.blurParam, passIdx);
    var outputRT = _SettingPass.prototype.slotName.call(this, camera, 1);
    var layoutName = 'blurx-pass';
    var passName = "CameraHBAOBluredXPass" + cameraID;
    if (isYPass) {
      outputRT = _SettingPass.prototype.slotName.call(this, camera, 0);
      layoutName = 'blury-pass';
      passName = "CameraHBAOBluredYPass" + cameraID;
    }
    passContext.addRenderPass(layoutName, passName).setPassInput(inputRT, 'AOTexNearest').setPassInput(inputDS, 'DepthTex').addRasterView(outputRT, Format.RGBA8).blitScreen(passIdx).version();
    return {
      rtName: outputRT,
      dsName: inputDS
    };
  };
  _proto2._renderHBAOCombinedPass = function _renderHBAOCombinedPass(camera, inputRT, outputRT) {
    var cameraID = getCameraUniqueID(camera);
    var passIdx = this.HBAO_COMBINED_PASS_INDEX;
    passContext.material = this.material;
    this.material.setProperty('uvDepthToEyePosParams', this._hbaoParams.uvDepthToEyePosParams, passIdx);
    this.material.setProperty('radiusParam', this._hbaoParams.radiusParam, passIdx);
    this.material.setProperty('miscParam', this._hbaoParams.miscParam, passIdx);
    this.material.setProperty('randomTexSize', new Vec4(this._hbaoParams.randomTexture.width, this._hbaoParams.randomTexture.height, 1.0 / this._hbaoParams.randomTexture.width, 1.0 / this._hbaoParams.randomTexture.height), passIdx);
    this.material.setProperty('blurParam', this._hbaoParams.blurParam, passIdx);
    passContext.clearFlag = ClearFlagBit.NONE;
    var layoutName = 'combine-pass';
    var passName = "CameraHBAOCombinedPass" + cameraID;
    passContext.addRenderPass(layoutName, passName).setPassInput(inputRT, 'AOTexNearest').addRasterView(outputRT, Format.RGBA8).blitScreen(passIdx).version();
  };
  _proto2._calculateObjectSize = function _calculateObjectSize(scene, visibility) {
    if (!scene || !scene.renderScene) {
      return;
    }
    var sumSize = new Vec3(0);
    var modelCount = 0;
    var models = scene.renderScene.models;
    for (var i = 0; i < models.length; i++) {
      var model = models[i];
      if (!model.node || !model.worldBounds) continue;
      if (model.node.layer & visibility) {
        sumSize.add(model.worldBounds.halfExtents);
        modelCount++;
      }
    }
    if (modelCount > 0) {
      sumSize.divide(v3(modelCount));
      var scale = Math.min(sumSize.x, sumSize.y, sumSize.z);
      this.averageObjectSize.set(scene, scale);
    }
  };
  _proto2.slotName = function slotName(camera, index) {
    if (index === void 0) {
      index = 0;
    }
    return this.lastPass.slotName(camera, index);
  };
  return _createClass(HBAOPass, [{
    key: "setting",
    get: function get() {
      return getSetting(HBAO);
    }
  }]);
}(SettingPass);

var ColorGradingPass = function (_SettingPass) {
  function ColorGradingPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'ColorGradingPass';
    _this.effectName = 'pipeline/post-process/color-grading';
    _this.outputNames = ['ColorGrading'];
    return _this;
  }
  _inheritsLoose(ColorGradingPass, _SettingPass);
  var _proto = ColorGradingPass.prototype;
  _proto.checkEnable = function checkEnable(camera) {
    var enable = _SettingPass.prototype.checkEnable.call(this, camera);
    if (disablePostProcessForDebugView()) {
      enable = false;
    }
    return enable;
  };
  _proto.render = function render(camera, ppl) {
    var cameraID = getCameraUniqueID(camera);
    passContext.clearFlag = ClearFlagBit.COLOR;
    Vec4.set(passContext.clearColor, 0, 0, 0, 1);
    passContext.material = this.material;
    var setting = this.setting;
    this.material.setProperty('colorGradingMap', setting.colorGradingMap);
    this.material.setProperty('contribute', setting.contribute);
    var textureSize = setting.colorGradingMap ? new Vec2(setting.colorGradingMap.width, setting.colorGradingMap.height) : new Vec2(1.0, 1.0);
    this.material.setProperty('lutTextureSize', textureSize);
    var input = this.lastPass.slotName(camera, 0);
    var slot = this.slotName(camera, 0);
    var isSquareMap = setting.colorGradingMap && setting.colorGradingMap.width === setting.colorGradingMap.height;
    var passName = isSquareMap ? 'color-grading-8x8' : 'color-grading-nx1';
    var passIndx = isSquareMap ? 1 : 0;
    passContext.updatePassViewPort().addRenderPass(passName, "color-grading" + cameraID).setPassInput(input, 'sceneColorMap').addRasterView(slot, Format.RGBA8).blitScreen(passIndx).version();
  };
  return _createClass(ColorGradingPass, [{
    key: "setting",
    get: function get() {
      return getSetting(ColorGrading);
    }
  }]);
}(SettingPass);

var MAX_BLOOM_FILTER_PASS_NUM = 6;
var BLOOM_DOWNSAMPLEPASS_INDEX = 1;
var BLOOM_UPSAMPLEPASS_INDEX = BLOOM_DOWNSAMPLEPASS_INDEX + MAX_BLOOM_FILTER_PASS_NUM;
var BLOOM_COMBINEPASS_INDEX = BLOOM_UPSAMPLEPASS_INDEX + MAX_BLOOM_FILTER_PASS_NUM;
var BloomPass = function (_SettingPass) {
  function BloomPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'BloomPass';
    _this.effectName = 'pipeline/post-process/bloom';
    _this.outputNames = ['BloomColor'];
    _this._hdrInputName = '';
    return _this;
  }
  _inheritsLoose(BloomPass, _SettingPass);
  var _proto = BloomPass.prototype;
  _proto.checkEnable = function checkEnable(camera) {
    var enable = _SettingPass.prototype.checkEnable.call(this, camera);
    if (disablePostProcessForDebugView()) {
      enable = false;
    }
    return enable;
  };
  _proto.render = function render(camera, ppl) {
    var cameraID = getCameraUniqueID(camera);
    var cameraName = "Camera" + cameraID;
    var passViewport = passContext.passViewport;
    passContext.clearBlack();
    passContext.material = this.material;
    var setting = this.setting;
    var input = this.lastPass.slotName(camera, 0);
    var output = "BLOOM_PREFILTER_COLOR" + cameraID;
    var shadingScale = 1 / 2;
    var enableAlphaMask = setting.enableAlphaMask;
    var useHDRIntensity = setting.useHdrIlluminance;
    passContext.material.setProperty('texSize', new Vec4(useHDRIntensity, 0, setting.threshold, enableAlphaMask), 0);
    passContext.updatePassViewPort(shadingScale).addRenderPass('bloom-prefilter', "bloom-prefilter" + cameraID).setPassInput(input, 'outputResultMap').setPassInput(this._hdrInputName, 'hdrInputMap').addRasterView(output, Format.RGBA8).blitScreen(0).version();
    for (var i = 0; i < setting.iterations; ++i) {
      var texSize = new Vec4(passViewport.width, passViewport.height, 0, 0);
      var bloomPassDownSampleRTName = "dsBloomPassDownSampleColor" + cameraName + i;
      var downSamplerInput = i === 0 ? output : "dsBloomPassDownSampleColor" + cameraName + (i - 1);
      passContext.material.setProperty('texSize', texSize, BLOOM_DOWNSAMPLEPASS_INDEX + i);
      shadingScale /= 2;
      passContext.updatePassViewPort(shadingScale).addRenderPass("bloom-upsample" + i, "bloom-upsample" + i + cameraID).setPassInput(downSamplerInput, 'bloomTexture').addRasterView(bloomPassDownSampleRTName, Format.RGBA8).blitScreen(BLOOM_DOWNSAMPLEPASS_INDEX + i).version();
    }
    for (var _i = 0; _i < setting.iterations; ++_i) {
      var _texSize = new Vec4(passViewport.width, passViewport.height, 0, 0);
      var bloomPassUpSampleRTName = "dsBloomPassUpSampleColor" + cameraName + (setting.iterations - 1 - _i);
      var upSamplerInput = _i === 0 ? "dsBloomPassDownSampleColor" + cameraName + (setting.iterations - 1) : "dsBloomPassUpSampleColor" + cameraName + (setting.iterations - _i);
      passContext.material.setProperty('texSize', _texSize, BLOOM_UPSAMPLEPASS_INDEX + _i);
      shadingScale *= 2;
      passContext.updatePassViewPort(shadingScale).addRenderPass("bloom-downsample" + _i, "bloom-downsample" + _i + cameraID).setPassInput(upSamplerInput, 'bloomTexture').addRasterView(bloomPassUpSampleRTName, Format.RGBA8).blitScreen(BLOOM_UPSAMPLEPASS_INDEX + _i).version();
    }
    passContext.material.setProperty('texSize', new Vec4(0, 0, 0, setting.intensity), BLOOM_COMBINEPASS_INDEX);
    passContext.updatePassViewPort().addRenderPass("bloom-combine", "bloom-combine" + cameraID).setPassInput(input, 'outputResultMap').setPassInput("dsBloomPassUpSampleColor" + cameraName + 0, 'bloomTexture').addRasterView(this.slotName(camera, 0), Format.RGBA8).blitScreen(BLOOM_COMBINEPASS_INDEX).version();
  };
  return _createClass(BloomPass, [{
    key: "setting",
    get: function get() {
      return getSetting(Bloom);
    }
  }, {
    key: "hdrInputName",
    set: function set(name) {
      this._hdrInputName = name;
    }
  }]);
}(SettingPass);

var _dec, _class;
var FXAA = (_dec = ccclass('cc.FXAA'), _dec(_class = disallowMultiple(_class = function (_PostProcessSetting) {
  function FXAA() {
    return _PostProcessSetting.apply(this, arguments) || this;
  }
  _inheritsLoose(FXAA, _PostProcessSetting);
  return FXAA;
}(PostProcessSetting)) || _class) || _class);

var FxaaPass = function (_SettingPass) {
  function FxaaPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'FxaaPass';
    _this.effectName = 'pipeline/post-process/fxaa-hq';
    _this.outputNames = ['FxaaColor'];
    return _this;
  }
  _inheritsLoose(FxaaPass, _SettingPass);
  var _proto = FxaaPass.prototype;
  _proto.render = function render(camera, ppl) {
    var cameraID = getCameraUniqueID(camera);
    passContext.clearBlack();
    passContext.material = this.material;
    this.setting;
    var input = this.lastPass.slotName(camera, 0);
    var output = this.slotName(camera);
    passContext.updatePassViewPort();
    var width = passContext.passViewport.width;
    var height = passContext.passViewport.height;
    passContext.material.setProperty('texSize', new Vec4(width, height, 1.0 / width, 1.0 / height), 0);
    passContext.addRenderPass('fxaa', "fxaa" + cameraID).setPassInput(input, 'sceneColorMap').addRasterView(output, Format.RGBA8).blitScreen(0).version();
  };
  return _createClass(FxaaPass, [{
    key: "setting",
    get: function get() {
      return getSetting(FXAA);
    }
  }]);
}(SettingPass);

var FloatOutputProcessPass = function (_SettingPass) {
  function FloatOutputProcessPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'FloatOutputProcessPass';
    _this.effectName = 'pipeline/float-output-process';
    _this.outputNames = ['FloatOutputProcess'];
    _this.hdrInputName = '';
    _this.enableInAllEditorCamera = true;
    _this.enable = true;
    return _this;
  }
  _inheritsLoose(FloatOutputProcessPass, _SettingPass);
  var _proto = FloatOutputProcessPass.prototype;
  _proto.checkEnable = function checkEnable(camera) {
    var ppl = cclegacy.director.root.pipeline;
    return ppl.getMacroBool('CC_USE_FLOAT_OUTPUT');
  };
  _proto.getHDRInputName = function getHDRInputName() {
    return this.hdrInputName;
  };
  _proto.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {
    passContext.material = this.material;
    var passes = passContext.material.passes;
    for (var i = 0; i < passes.length; i++) {
      var pass = passes[i];
      pass.beginChangeStatesSilently();
      pass.tryCompile();
      pass.endChangeStatesSilently();
    }
  };
  _proto.needDepthInput = function needDepthInput(ppl) {
    return ppl.pipelineSceneData.fog.type !== FOG_TYPE_NONE;
  };
  _proto.render = function render(camera, ppl) {
    var cameraID = getCameraUniqueID(camera);
    passContext.material = this.material;
    var copyDS = '';
    var passIndx = 0;
    var inputDS = passContext.depthSlotName;
    if (this.needDepthInput(ppl)) {
      copyDS = 'floatOutputProcessCopyDS';
      var copyInputDSPassLayoutName = 'copy-pass';
      var copyInputDSPass = "floatOutputProcessCopyDS-pass" + cameraID;
      passContext.updatePassViewPort().addRenderPass(copyInputDSPassLayoutName, copyInputDSPass).setClearFlag(ClearFlagBit.COLOR).setClearColor(1.0, 0, 0, 0).setPassInput(inputDS, 'depthRaw').addRasterView(copyDS, Format.RGBA8).blitScreen(passIndx).version();
    }
    passIndx = 1;
    this.hdrInputName = this.lastPass.slotName(camera, 0);
    var output = this.slotName(camera, 0);
    var layoutName = 'tone-mapping';
    var passName = "tone-mapping" + cameraID;
    passContext.clearFlag = ClearFlagBit.COLOR;
    Vec4.set(passContext.clearColor, camera.clearColor.x, camera.clearColor.y, camera.clearColor.z, camera.clearColor.w);
    passContext.updatePassViewPort().addRenderPass(layoutName, passName).setPassInput(this.hdrInputName, 'u_texSampler').setPassInput(copyDS, 'DepthTex').addRasterView(output, Format.RGBA8).blitScreen(passIndx).version();
  };
  return FloatOutputProcessPass;
}(SettingPass);

var ForwardTransparencyPass = function (_BasePass) {
  function ForwardTransparencyPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BasePass.call.apply(_BasePass, [this].concat(args)) || this;
    _this.name = 'ForwardTransparencyPass';
    _this.enableInAllEditorCamera = true;
    _this.depthBufferShadingScale = 1;
    return _this;
  }
  _inheritsLoose(ForwardTransparencyPass, _BasePass);
  var _proto = ForwardTransparencyPass.prototype;
  _proto.slotName = function slotName(camera, index) {
    if (index === void 0) {
      index = 0;
    }
    return this.lastPass.slotName(camera, index);
  };
  _proto.render = function render(camera, ppl) {
    passContext.clearFlag = ClearFlagBit.NONE;
    var output = this.lastPass.slotName(camera, 0);
    var outputDS = passContext.depthSlotName;
    var cameraID = getCameraUniqueID(camera);
    var isOffScreen = true;
    passContext.updatePassViewPort().addRenderPass('default', this.name + "_" + cameraID).addRasterView(output, getRTFormatBeforeToneMapping(ppl), isOffScreen).addRasterView(outputDS, Format.DEPTH_STENCIL, isOffScreen).version();
    var pass = passContext.pass;
    var shadowPass = passContext.shadowPass;
    if (shadowPass) {
      for (var _iterator = _createForOfIteratorHelperLoose(shadowPass.mainLightShadows), _step; !(_step = _iterator()).done;) {
        var dirShadowName = _step.value;
        if (ppl.containsResource(dirShadowName)) {
          pass.addTexture(dirShadowName, 'cc_shadowMap', getShadowMapSampler());
        }
      }
      for (var _iterator2 = _createForOfIteratorHelperLoose(shadowPass.spotLightShadows), _step2; !(_step2 = _iterator2()).done;) {
        var spotShadowName = _step2.value;
        if (ppl.containsResource(spotShadowName)) {
          pass.addTexture(spotShadowName, 'cc_spotShadowMap', getShadowMapSampler());
        }
      }
    }
    pass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(), SceneFlags.UI | SceneFlags.TRANSPARENT_OBJECT | SceneFlags.GEOMETRY);
  };
  return ForwardTransparencyPass;
}(BasePass);

var ForwardTransparencySimplePass = function (_BasePass) {
  function ForwardTransparencySimplePass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BasePass.call.apply(_BasePass, [this].concat(args)) || this;
    _this.name = 'ForwardTransparencySimplePass';
    return _this;
  }
  _inheritsLoose(ForwardTransparencySimplePass, _BasePass);
  var _proto = ForwardTransparencySimplePass.prototype;
  _proto.slotName = function slotName(camera, index) {
    if (index === void 0) {
      index = 0;
    }
    return passContext.forwardPass.slotName(camera, index);
  };
  _proto.render = function render(camera, ppl) {
    var pass = passContext.pass;
    pass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(), SceneFlags.UI | SceneFlags.TRANSPARENT_OBJECT | SceneFlags.GEOMETRY);
  };
  return ForwardTransparencySimplePass;
}(BasePass);

var COPY_INPUT_DS_PASS_INDEX = 0;
var SSSS_BLUR_X_PASS_INDEX = 1;
var SSSS_BLUR_Y_PASS_INDEX = 2;
function hasSkinObject(ppl) {
  var sceneData = ppl.pipelineSceneData;
  return sceneData.skin.enabled && sceneData.skinMaterialModel !== null;
}
var _varianceArray = [0.0484, 0.187, 0.567, 1.99, 7.41];
var _strengthParameterArray = [0.100, 0.118, 0.113, 0.358, 0.078];
var _vec3Temp = new Vec3();
var _vec3Temp2 = new Vec3();
var _vec4Temp = new Vec4();
var _vec4Temp2 = new Vec4();
var EXPONENT = 2.0;
var I_SAMPLES_COUNT = 25;
var SSSSBlurData = function () {
  function SSSSBlurData() {
    this._v3SSSSStrength = new Vec3(0.48, 0.41, 0.28);
    this._v3SSSSFallOff = new Vec3(1.0, 0.37, 0.3);
    this._kernel = [];
    this._init();
  }
  var _proto = SSSSBlurData.prototype;
  _proto._gaussian = function _gaussian(out, variance, r) {
    var xx = r / (0.001 + this._v3SSSSFallOff.x);
    out.x = Math.exp(-(xx * xx) / (2.0 * variance)) / (2.0 * 3.14 * variance);
    var yy = r / (0.001 + this._v3SSSSFallOff.y);
    out.y = Math.exp(-(yy * yy) / (2.0 * variance)) / (2.0 * 3.14 * variance);
    var zz = r / (0.001 + this._v3SSSSFallOff.z);
    out.z = Math.exp(-(zz * zz) / (2.0 * variance)) / (2.0 * 3.14 * variance);
  };
  _proto._profile = function _profile(out, val) {
    for (var i = 0; i < 5; i++) {
      this._gaussian(_vec3Temp2, _varianceArray[i], val);
      _vec3Temp2.multiplyScalar(_strengthParameterArray[i]);
      out.add(_vec3Temp2);
    }
  };
  _proto._updateSampleCount = function _updateSampleCount() {
    var strength = this._v3SSSSStrength;
    var nSamples = I_SAMPLES_COUNT;
    var range = 3.0 ;
    var step = 2.0 * range / (nSamples - 1);
    for (var i = 0; i < nSamples; i++) {
      var o = -range + i * step;
      var sign = o < 0.0 ? -1 : 1.0;
      this._kernel[i].w = range * sign * Math.abs(Math.pow(o, EXPONENT)) / Math.pow(range, EXPONENT);
    }
    for (var _i = 0; _i < nSamples; _i++) {
      var w0 = _i > 0 ? Math.abs(this._kernel[_i].w - this._kernel[_i - 1].w) : 0.0;
      var w1 = _i < nSamples - 1 ? Math.abs(this._kernel[_i].w - this._kernel[_i + 1].w) : 0.0;
      var area = (w0 + w1) / 2.0;
      _vec3Temp.set(0);
      this._profile(_vec3Temp, this._kernel[_i].w);
      _vec3Temp.multiplyScalar(area);
      this._kernel[_i].x = _vec3Temp.x;
      this._kernel[_i].y = _vec3Temp.y;
      this._kernel[_i].z = _vec3Temp.z;
    }
    var remainder = nSamples % 2;
    _vec4Temp.set(this._kernel[(nSamples - remainder) / 2]);
    for (var _i2 = (nSamples - remainder) / 2; _i2 > 0; _i2--) {
      _vec4Temp2.set(this._kernel[_i2 - 1]);
      this._kernel[_i2].set(_vec4Temp2);
    }
    this._kernel[0].set(_vec4Temp);
    _vec3Temp.set(0.0);
    for (var _i3 = 0; _i3 < nSamples; _i3++) {
      _vec3Temp.add3f(this._kernel[_i3].x, this._kernel[_i3].y, this._kernel[_i3].z);
    }
    for (var _i4 = 0; _i4 < nSamples; _i4++) {
      this._kernel[_i4].x /= _vec3Temp.x;
      this._kernel[_i4].y /= _vec3Temp.y;
      this._kernel[_i4].z /= _vec3Temp.z;
    }
    this._kernel[0].x = (1.0 - strength.x) * 1.0 + strength.x * this._kernel[0].x;
    this._kernel[0].y = (1.0 - strength.y) * 1.0 + strength.y * this._kernel[0].y;
    this._kernel[0].z = (1.0 - strength.z) * 1.0 + strength.z * this._kernel[0].z;
    for (var _i5 = 1; _i5 < nSamples; _i5++) {
      this._kernel[_i5].x *= strength.x;
      this._kernel[_i5].y *= strength.y;
      this._kernel[_i5].z *= strength.z;
    }
  };
  _proto._init = function _init() {
    for (var i = 0; i < I_SAMPLES_COUNT; i++) {
      this._kernel[i] = new Vec4();
    }
    this._updateSampleCount();
  };
  return _createClass(SSSSBlurData, [{
    key: "ssssStrength",
    get: function get() {
      return this._v3SSSSStrength;
    },
    set: function set(val) {
      this._v3SSSSStrength = val;
      this._updateSampleCount();
    }
  }, {
    key: "ssssFallOff",
    get: function get() {
      return this._v3SSSSFallOff;
    },
    set: function set(val) {
      this._v3SSSSFallOff = val;
      this._updateSampleCount();
    }
  }, {
    key: "kernel",
    get: function get() {
      return this._kernel;
    }
  }]);
}();
var SkinPass = function (_SettingPass) {
  function SkinPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'SkinPass';
    _this.effectName = 'pipeline/ssss-blur';
    _this.outputNames = ['SSSSBlur', 'SSSSBlurDS'];
    _this.ssssBlurData = new SSSSBlurData();
    _this._activate = false;
    _this.enableInAllEditorCamera = true;
    return _this;
  }
  _inheritsLoose(SkinPass, _SettingPass);
  var _proto2 = SkinPass.prototype;
  _proto2.checkEnable = function checkEnable(camera) {
    var ppl = cclegacy.director.root.pipeline;
    var enable = hasSkinObject(ppl);
    if (enable) {
      if (!this._activate) {
        if (!ppl.getMacroBool('CC_USE_FLOAT_OUTPUT')) {
          warnID(16303);
        }
        if (!ppl.pipelineSceneData.standardSkinModel) {
          warnID(16304);
        }
        this._activate = true;
      }
      enable = forceEnableFloatOutput(ppl);
    }
    return enable;
  };
  _proto2.render = function render(camera, ppl) {
    var _this$lastPass;
    passContext.material = this.material;
    var inputRT = (_this$lastPass = this.lastPass) == null ? void 0 : _this$lastPass.slotName(camera, 0);
    var inputDS = passContext.depthSlotName;
    this._buildSSSSBlurPass(camera, ppl, inputRT, inputDS);
    this._buildSpecularPass(camera, ppl, inputRT, inputDS);
  };
  _proto2._buildSSSSBlurPass = function _buildSSSSBlurPass(camera, ppl, inputRT, inputDS) {
    var cameraID = getCameraUniqueID(camera);
    var pipelineSceneData = ppl.pipelineSceneData;
    var halfExtents = new Vec3(0.2, 0.2, 0.2);
    var standardSkinModel = pipelineSceneData.standardSkinModel;
    var skinMaterialModel = pipelineSceneData.skinMaterialModel;
    if (standardSkinModel && standardSkinModel.worldBounds) {
      halfExtents = standardSkinModel.worldBounds.halfExtents;
    } else if (skinMaterialModel && skinMaterialModel.worldBounds) {
      halfExtents = skinMaterialModel.worldBounds.halfExtents;
    }
    var boundingBox = Math.min(halfExtents.x, halfExtents.y, halfExtents.z) * 2.0;
    var skin = pipelineSceneData.skin;
    var ssssBlurRTName = _SettingPass.prototype.slotName.call(this, camera, 0);
    var ssssBlurDSName = _SettingPass.prototype.slotName.call(this, camera, 1);
    var copyInputDSPassLayoutName = 'copy-pass';
    var copyInputDSPass = "copyDS-pass" + cameraID;
    var passIdx = COPY_INPUT_DS_PASS_INDEX;
    passContext.updatePassViewPort().addRenderPass(copyInputDSPassLayoutName, copyInputDSPass).setClearFlag(ClearFlagBit.COLOR).setClearColor(1.0, 0, 0, 0).setPassInput(inputDS, 'depthRaw').addRasterView(ssssBlurDSName, Format.RGBA8).blitScreen(passIdx).version();
    passIdx = SSSS_BLUR_X_PASS_INDEX;
    var ssssblurXPassLayoutName = 'ssss-blurX';
    var ssssblurXPassPassName = "ssss-blurX" + cameraID;
    this.material.setProperty('blurInfo', new Vec4(camera.fov, skin.blurRadius, boundingBox, skin.sssIntensity), passIdx);
    this.material.setProperty('kernel', this.ssssBlurData.kernel, passIdx);
    passContext.updatePassViewPort().addRenderPass(ssssblurXPassLayoutName, ssssblurXPassPassName).setPassInput(inputRT, 'colorTex').setPassInput(ssssBlurDSName, 'depthTex').setClearFlag(ClearFlagBit.COLOR).setClearColor(0, 0, 0, 1).addRasterView(ssssBlurRTName, getRTFormatBeforeToneMapping(ppl)).blitScreen(passIdx).version();
    passIdx = SSSS_BLUR_Y_PASS_INDEX;
    var ssssblurYPassLayoutName = 'ssss-blurY';
    var ssssblurYPassPassName = "ssss-blurY" + cameraID;
    this.material.setProperty('blurInfo', new Vec4(camera.fov, skin.blurRadius, boundingBox, skin.sssIntensity), passIdx);
    this.material.setProperty('kernel', this.ssssBlurData.kernel, passIdx);
    passContext.updatePassViewPort().addRenderPass(ssssblurYPassLayoutName, ssssblurYPassPassName).setPassInput(ssssBlurRTName, 'colorTex').setPassInput(ssssBlurDSName, 'depthTex').setClearFlag(ClearFlagBit.NONE).setClearColor(0, 0, 0, 1).addRasterView(inputRT, getRTFormatBeforeToneMapping(ppl)).blitScreen(passIdx).version();
  };
  _proto2._buildSpecularPass = function _buildSpecularPass(camera, ppl, inputRT, inputDS) {
    var cameraID = getCameraUniqueID(camera);
    var layoutName = 'specular-pass';
    var passName = "specular-pass" + cameraID;
    passContext.updatePassViewPort().addRenderPass(layoutName, passName).setClearFlag(ClearFlagBit.NONE).setClearColor(0, 0, 0, 1).addRasterView(inputRT, getRTFormatBeforeToneMapping(ppl), true).setClearFlag(ClearFlagBit.NONE).setClearDepthColor(camera.clearDepth, camera.clearStencil, 0, 1).addRasterView(inputDS, Format.DEPTH_STENCIL, true).version();
    var pass = passContext.pass;
    var shadowPass = passContext.shadowPass;
    if (shadowPass) {
      for (var _iterator = _createForOfIteratorHelperLoose(shadowPass.mainLightShadows), _step; !(_step = _iterator()).done;) {
        var dirShadowName = _step.value;
        if (ppl.containsResource(dirShadowName)) {
          pass.addTexture(dirShadowName, 'cc_shadowMap', getShadowMapSampler());
        }
      }
      for (var _iterator2 = _createForOfIteratorHelperLoose(shadowPass.spotLightShadows), _step2; !(_step2 = _iterator2()).done;) {
        var spotShadowName = _step2.value;
        if (ppl.containsResource(spotShadowName)) {
          pass.addTexture(spotShadowName, 'cc_spotShadowMap', getShadowMapSampler());
        }
      }
    }
    pass.addQueue(QueueHint.RENDER_OPAQUE, 'default').addSceneOfCamera(camera, new LightInfo(), SceneFlags.TRANSPARENT_OBJECT | SceneFlags.CUTOUT_OBJECT);
    pass.addQueue(QueueHint.RENDER_TRANSPARENT, 'forward-add').addSceneOfCamera(camera, new LightInfo(), SceneFlags.TRANSPARENT_OBJECT | SceneFlags.CUTOUT_OBJECT);
  };
  _proto2.slotName = function slotName(camera, index) {
    if (index === void 0) {
      index = 0;
    }
    return this.lastPass.slotName(camera, index);
  };
  return SkinPass;
}(SettingPass);

var PostFinalPass = function (_BasePass) {
  function PostFinalPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BasePass.call.apply(_BasePass, [this].concat(args)) || this;
    _this.name = 'PostFinalPass';
    _this.outputNames = ['PostFinalColor'];
    _this.effectName = 'pipeline/post-process/post-final';
    _this.enableInAllEditorCamera = true;
    return _this;
  }
  _inheritsLoose(PostFinalPass, _BasePass);
  var _proto = PostFinalPass.prototype;
  _proto.render = function render(camera, ppl) {
    if (!this.lastPass) {
      return;
    }
    passContext.clearFlag = camera.clearFlag & ClearFlagBit.COLOR;
    Vec4.set(passContext.clearColor, camera.clearColor.x, camera.clearColor.y, camera.clearColor.z, camera.clearColor.w);
    passContext.material = this.material;
    var cameraID = getCameraUniqueID(camera);
    var input0 = this.lastPass.slotName(camera, 0);
    var slot0 = this.slotName(camera, 0);
    var isOffScreen = false;
    var fb = camera.window.framebuffer;
    var ct = fb && fb.colorTextures[0];
    var format = ct ? ct.format : Format.RGBA8;
    var shadingScale = passContext.shadingScale;
    passContext.updatePassViewPort(1 / shadingScale, 1 / shadingScale).addRenderPass('post-final', "" + this.name + cameraID).setPassInput(input0, 'inputTexture').addRasterView(slot0, format, isOffScreen).blitScreen(0);
    this.renderProfiler(camera);
  };
  return PostFinalPass;
}(BasePass);

var DofPass = function (_SettingPass) {
  function DofPass() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SettingPass.call.apply(_SettingPass, [this].concat(args)) || this;
    _this.name = 'DOFPass';
    _this.effectName = 'pipeline/post-process/dof';
    _this.outputNames = ['DOFColor'];
    return _this;
  }
  _inheritsLoose(DofPass, _SettingPass);
  var _proto = DofPass.prototype;
  _proto.checkEnable = function checkEnable(camera) {
    var enable = _SettingPass.prototype.checkEnable.call(this, camera);
    if (disablePostProcessForDebugView()) {
      enable = false;
    }
    return enable;
  };
  _proto.render = function render(camera, ppl) {
    var cameraID = getCameraUniqueID(camera);
    passContext.clearFlag = ClearFlagBit.COLOR;
    Vec4.set(passContext.clearColor, 0, 0, 0, 1);
    var passViewport = passContext.passViewport;
    passContext.material = this.material;
    var setting = this.setting;
    var width = passViewport.width;
    var height = passViewport.height;
    var cocParams = new Vec4(setting.focusDistance, setting.focusRange, setting.bokehRadius, 0.0);
    var mainTexTexelSize = new Vec4(1.0 / width, 1.0 / height, width, height);
    this.material.setProperty('cocParams', cocParams);
    this.material.setProperty('mainTexTexelSize', mainTexTexelSize);
    var slot = this.slotName(camera, 0);
    var colorTex = this.lastPass.slotName(camera, 0);
    var depthTex = this.lastPass.slotName(camera, 1);
    var outputCOC = "DOF_CIRCLE_OF_CONFUSION" + cameraID;
    passContext.updatePassViewPort().addRenderPass('dof-coc', "dof-coc" + cameraID).setPassInput(depthTex, 'DepthTex').addRasterView(outputCOC, Format.RGBA8).blitScreen(0).version();
    var outputPrefilter = "DOF_PREFILTER" + cameraID;
    passContext.updatePassViewPort(0.5).addRenderPass('dof-prefilter', "dof-prefilter" + cameraID).setPassInput(colorTex, 'colorTex').setPassInput(outputCOC, 'cocTex').addRasterView(outputPrefilter, Format.RGBA8).blitScreen(1).version();
    var outputBokeh = "DOF_BOKEH" + cameraID;
    passContext.updatePassViewPort(0.5).addRenderPass('dof-bokeh', "dof-bokeh" + cameraID).setPassInput(outputPrefilter, 'prefilterTex').addRasterView(outputBokeh, Format.RGBA8).blitScreen(2).version();
    var outputFilter = "DOF_FILTER" + cameraID;
    passContext.updatePassViewPort(0.5).addRenderPass('dof-filter', "dof-filter" + cameraID).setPassInput(outputBokeh, 'bokehTex').addRasterView(outputFilter, Format.RGBA8).blitScreen(3).version();
    passContext.updatePassViewPort().addRenderPass('dof-combine', "dof-combine" + cameraID).setPassInput(outputFilter, 'filterTex').setPassInput(outputCOC, 'cocTex').setPassInput(colorTex, 'colorTex').addRasterView(slot, Format.RGBA8).blitScreen(4).version();
  };
  return _createClass(DofPass, [{
    key: "setting",
    get: function get() {
      return getSetting(DOF);
    }
  }]);
}(SettingPass);

var PostProcessBuilder = function () {
  function PostProcessBuilder() {
    this.pipelines = new Map();
    this.init();
  }
  var _proto = PostProcessBuilder.prototype;
  _proto.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {
    var passes = this.pipelines.get('forward');
    if (passes !== undefined) {
      for (var i = 0; i < passes.length; i++) {
        var pass = passes[i];
        if (typeof pass.onGlobalPipelineStateChanged === 'function') {
          pass.onGlobalPipelineStateChanged();
        }
      }
    }
  };
  _proto.init = function init() {
    var forward = new ForwardPass();
    var forwardFinal = new ForwardFinalPass();
    var shadowPass = new ShadowPass();
    this.addPass(shadowPass, 'default');
    this.addPass(forward, 'default');
    this.addPass(new ForwardTransparencySimplePass(), 'default');
    this.addPass(forwardFinal, 'default');
    this.addPass(shadowPass);
    this.addPass(forward);
    this.addPass(new SkinPass());
    this.addPass(new HBAOPass());
    this.addPass(new FloatOutputProcessPass());
    this.addPass(new ForwardTransparencyPass());
    this.addPass(new DofPass());
    this.addPass(new TAAPass());
    this.addPass(new FxaaPass());
    this.addPass(new ColorGradingPass());
    this.addPass(new BlitScreenPass());
    this.addPass(new BloomPass());
    this.addPass(new FSRPass());
    this.addPass(new PostFinalPass());
  };
  _proto.getPass = function getPass(passClass, pipelineName) {
    if (pipelineName === void 0) {
      pipelineName = 'forward';
    }
    var pp = this.pipelines.get(pipelineName);
    return pp && pp.find(function (p) {
      return p instanceof passClass;
    });
  };
  _proto.addPass = function addPass(pass, pipelineName) {
    if (pipelineName === void 0) {
      pipelineName = 'forward';
    }
    var pp = this.pipelines.get(pipelineName);
    if (!pp) {
      pp = [];
      this.pipelines.set(pipelineName, pp);
    }
    var oldIdx = pp.findIndex(function (p) {
      return p.name === pass.name;
    });
    if (oldIdx !== -1) {
      pp.splice(oldIdx, 1);
    }
    pp.push(pass);
  };
  _proto.insertPass = function insertPass(pass, passClass, pipelineName) {
    if (pipelineName === void 0) {
      pipelineName = 'forward';
    }
    var pp = this.pipelines.get(pipelineName);
    if (pp) {
      var oldIdx = pp.findIndex(function (p) {
        return p.name === pass.name;
      });
      if (oldIdx !== -1) {
        pp.splice(oldIdx, 1);
      }
      var idx = pp.findIndex(function (p) {
        return p instanceof passClass;
      });
      if (idx !== -1) {
        pp.splice(idx + 1, 0, pass);
      }
    }
  };
  _proto.initEditor = function initEditor() {
    director.root.cameraList.forEach(function (cam) {
      if (cam.name === 'Editor Camera') {
        cam.usePostProcess = cam.projectionType === CameraProjection.PERSPECTIVE;
      }
    });
  };
  _proto.applyPreviewCamera = function applyPreviewCamera(camera) {
    if (!camera.node.parent) return;
    var camComp = camera.node.parent.getComponent(Camera);
    var oriCamera = camComp && camComp.camera;
    if (oriCamera) {
      camera.postProcess = oriCamera.postProcess;
      camera.usePostProcess = oriCamera.usePostProcess;
    }
  };
  _proto.resortEditorCameras = function resortEditorCameras(cameras) {
    var newCameras = [];
    for (var i = 0; i < cameras.length; i++) {
      var c = cameras[i];
      if (c.name === 'Editor Camera' || c.name === 'Editor UIGizmoCamera' || c.name === 'Scene Gizmo Camera') {
        newCameras.push(c);
      }
    }
    for (var _i = 0; _i < cameras.length; _i++) {
      var _c = cameras[_i];
      if (newCameras.indexOf(_c) === -1) {
        newCameras.push(_c);
      }
    }
    return newCameras;
  };
  _proto.setup = function setup(cameras, ppl) {
    passContext.ppl = ppl;
    passContext.shadowPass = undefined;
    passContext.forwardPass = undefined;
    passContext.depthSlotName = '';
    passContext.isFinalCamera = false;
    passContext.isFinalPass = false;
    var globalPP;
    for (var i = 0; i < PostProcess.all.length; i++) {
      var pp = PostProcess.all[i];
      if (pp.global) {
        globalPP = pp;
      }
    }
    for (var _i2 = 0; _i2 < cameras.length; _i2++) {
      var camera = cameras[_i2];
      if (!camera.scene) {
        continue;
      }
      ppl.update(camera);
      if (_i2 === cameras.length - 1) {
        passContext.isFinalCamera = true;
      }
      ppl.addBuiltinReflectionProbePass(camera);
      passContext.postProcess = camera.postProcess || globalPP;
      director.root.pipelineEvent.emit(PipelineEventType.RENDER_CAMERA_BEGIN, camera);
      this.renderCamera(camera, ppl);
    }
  };
  _proto.getCameraPipelineName = function getCameraPipelineName(camera) {
    var pipelineName = camera.pipeline;
    if (!pipelineName && camera.usePostProcess) {
      pipelineName = 'forward';
    } else {
      pipelineName = 'default';
    }
    return pipelineName;
  };
  _proto.getCameraPasses = function getCameraPasses(camera) {
    var pipelineName = this.getCameraPipelineName(camera);
    return this.pipelines.get(pipelineName) || [];
  };
  _proto.renderCamera = function renderCamera(camera, ppl) {
    passContext.passPathName = "" + getCameraUniqueID(camera);
    passContext.camera = camera;
    passContext.updateViewPort();
    var passes = this.getCameraPasses(camera);
    var taaPass = passes.find(function (p) {
      return p instanceof TAAPass;
    });
    if (taaPass && taaPass.checkEnable(camera)) {
      taaPass.applyCameraJitter(camera);
      taaPass.updateSample();
    }
    var floatOutputPass = passes.find(function (p) {
      return p instanceof FloatOutputProcessPass;
    });
    var lastPass;
    for (var i = 0; i < passes.length; i++) {
      var pass = passes[i];
      if (!pass.checkEnable(camera)) {
        continue;
      }
      if (i === passes.length - 1) {
        passContext.isFinalPass = true;
      }
      if (pass.name === 'BloomPass') {
        pass.hdrInputName = floatOutputPass === undefined || floatOutputPass === null ? '' : floatOutputPass.getHDRInputName();
      }
      pass.lastPass = lastPass;
      pass.render(camera, ppl);
      lastPass = pass;
    }
  };
  return PostProcessBuilder;
}();

setCustomPipeline('Forward', new PostProcessBuilder());
setCustomPipeline('Custom', new PostProcessBuilder());

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BasePass: BasePass,
    BlitScreen: BlitScreen,
    BlitScreenPass: BlitScreenPass,
    Bloom: Bloom,
    BloomPass: BloomPass,
    COPY_INPUT_DS_PASS_INDEX: COPY_INPUT_DS_PASS_INDEX,
    ColorGrading: ColorGrading,
    ColorGradingPass: ColorGradingPass,
    DOF: DOF,
    DofPass: DofPass,
    EXPONENT: EXPONENT,
    FSR: FSR,
    FSRPass: FSRPass,
    FloatOutputProcessPass: FloatOutputProcessPass,
    ForwardFinalPass: ForwardFinalPass,
    ForwardPass: ForwardPass,
    ForwardTransparencyPass: ForwardTransparencyPass,
    ForwardTransparencySimplePass: ForwardTransparencySimplePass,
    FxaaPass: FxaaPass,
    HBAO: HBAO,
    I_SAMPLES_COUNT: I_SAMPLES_COUNT,
    PostFinalPass: PostFinalPass,
    PostProcess: PostProcess,
    PostProcessBuilder: PostProcessBuilder,
    PostProcessSetting: PostProcessSetting,
    SSSSBlurData: SSSSBlurData,
    SSSS_BLUR_X_PASS_INDEX: SSSS_BLUR_X_PASS_INDEX,
    SSSS_BLUR_Y_PASS_INDEX: SSSS_BLUR_Y_PASS_INDEX,
    SettingPass: SettingPass,
    ShadowPass: ShadowPass,
    SkinPass: SkinPass,
    TAA: TAA,
    TAAPass: TAAPass,
    disablePostProcessForDebugView: disablePostProcessForDebugView,
    forceEnableFloatOutput: forceEnableFloatOutput,
    getRTFormatBeforeToneMapping: getRTFormatBeforeToneMapping,
    getShadowMapSampler: getShadowMapSampler
});

export { index as postProcess };
//# sourceMappingURL=custom-pipeline-post-process.js.map
