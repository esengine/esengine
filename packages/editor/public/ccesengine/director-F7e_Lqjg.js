import { s as settings, S as SettingsCategory, k as errorID, L as log, G as macro, P as Pool, w as warnID, a as _createClass, l as _createForOfIteratorHelperLoose, I as assert, M as fastRemoveAt, F as fastRemove, _ as _inheritsLoose, K as isValid, N as assertID, d as CCObjectFlags, O as CCObject, Q as error, T as scalableContainerManager, n as EventTarget } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { L as LightType, h as PipelineEventProcessor, D as DebugView, f as Camera, T as TrackingType, e as CameraType, i as SceneAsset } from './debug-view-BuNhRPv_.js';
import { H as Scheduler, S as System } from './index-uXI1_UMk.js';
import { i as input, C as ComponentScheduler, N as NodeActivator } from './prefab-DYg_oxpo.js';
import { a as RenderScene, c as RenderWindow } from './deprecated-n0w4kK7g.js';
import { e as getPipelineSceneData, k as assetManager, l as Scene, r as releaseManager, N as Node } from './scene-vWcxM1_c.js';
import { d as deviceManager, L as LegacyRenderMode } from './device-manager-CBXP-ttm.js';
import { a6 as ColorAttachment, a7 as DepthStencilAttachment, a8 as StoreOp, a9 as RenderPassInfo } from './buffer-barrier-BlQXg9Aa.js';
import { a as UBOGlobalEnum, b as UBOCameraEnum, c as UBOShadowEnum, U as UBOLocalEnum, d as UBOWorldBound, l as localDescriptorSetLayout_ResizeMaxJoints } from './pipeline-state-manager-C5U4ouGL.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { N as NodeEventType } from './node-event-Ccvtv8bJ.js';

var XREye;
(function (XREye) {
  XREye[XREye["NONE"] = -1] = "NONE";
  XREye[XREye["LEFT"] = 0] = "LEFT";
  XREye[XREye["RIGHT"] = 1] = "RIGHT";
})(XREye || (XREye = {}));
var XRConfigKey;
(function (XRConfigKey) {
  XRConfigKey[XRConfigKey["SESSION_RUNNING"] = 2] = "SESSION_RUNNING";
  XRConfigKey[XRConfigKey["VIEW_COUNT"] = 6] = "VIEW_COUNT";
  XRConfigKey[XRConfigKey["SWAPCHAIN_WIDTH"] = 7] = "SWAPCHAIN_WIDTH";
  XRConfigKey[XRConfigKey["SWAPCHAIN_HEIGHT"] = 8] = "SWAPCHAIN_HEIGHT";
  XRConfigKey[XRConfigKey["DEVICE_IPD"] = 37] = "DEVICE_IPD";
  XRConfigKey[XRConfigKey["SPLIT_AR_GLASSES"] = 42] = "SPLIT_AR_GLASSES";
})(XRConfigKey || (XRConfigKey = {}));
var XRPoseType;
(function (XRPoseType) {
  XRPoseType[XRPoseType["VIEW_LEFT"] = 0] = "VIEW_LEFT";
  XRPoseType[XRPoseType["HAND_LEFT"] = 1] = "HAND_LEFT";
  XRPoseType[XRPoseType["AIM_LEFT"] = 2] = "AIM_LEFT";
  XRPoseType[XRPoseType["VIEW_RIGHT"] = 3] = "VIEW_RIGHT";
  XRPoseType[XRPoseType["HAND_RIGHT"] = 4] = "HAND_RIGHT";
  XRPoseType[XRPoseType["AIM_RIGHT"] = 5] = "AIM_RIGHT";
  XRPoseType[XRPoseType["HEAD_MIDDLE"] = 6] = "HEAD_MIDDLE";
})(XRPoseType || (XRPoseType = {}));

var Root = function () {
  function Root(device) {
    var _this = this;
    this._createSceneFun = null;
    this._createWindowFun = null;
    this._windows = [];
    this._mainWindow = null;
    this._curWindow = null;
    this._tempWindow = null;
    this._usesCustomPipeline = true;
    this._pipeline = null;
    this._pipelineEvent = new PipelineEventProcessor();
    this._classicPipeline = null;
    this._customPipeline = null;
    this._batcher = null;
    this._scenes = [];
    this._modelPools = new Map();
    this._cameraPool = null;
    this._lightPools = new Map();
    this._debugView = new DebugView();
    this._fpsTime = 0;
    this._frameCount = 0;
    this._fps = 0;
    this._fixedFPS = 0;
    this._useDeferredPipeline = false;
    this._cumulativeTime = 0;
    this._frameTime = 0;
    this._cameraList = [];
    this._device = device;
    this._dataPoolMgr = cclegacy.internal.DataPoolManager && new cclegacy.internal.DataPoolManager(device);
    RenderScene.registerCreateFunc(this);
    RenderWindow.registerCreateFunc(this);
    this._cameraPool = new Pool(function () {
      return new Camera(_this._device);
    }, 4, function (cam) {
      return cam.destroy();
    });
  }
  var _proto = Root.prototype;
  _proto.initialize = function initialize(info) {
    var _this$_dataPoolMgr;
    var swapchain = deviceManager.swapchain;
    var colorAttachment = new ColorAttachment();
    colorAttachment.format = swapchain.colorTexture.format;
    var depthStencilAttachment = new DepthStencilAttachment();
    depthStencilAttachment.format = swapchain.depthStencilTexture.format;
    depthStencilAttachment.depthStoreOp = StoreOp.DISCARD;
    depthStencilAttachment.stencilStoreOp = StoreOp.DISCARD;
    var renderPassInfo = new RenderPassInfo([colorAttachment], depthStencilAttachment);
    this._mainWindow = this.createWindow({
      title: 'rootMainWindow',
      width: swapchain.width,
      height: swapchain.height,
      renderPassInfo: renderPassInfo,
      swapchain: swapchain
    });
    this._curWindow = this._mainWindow;
    var customJointTextureLayouts = settings.querySettings(SettingsCategory.ANIMATION, 'customJointTextureLayouts') || [];
    (_this$_dataPoolMgr = this._dataPoolMgr) == null ? void 0 : _this$_dataPoolMgr.jointTexturePool.registerCustomTextureLayouts(customJointTextureLayouts);
    this._resizeMaxJointForDS();
  };
  _proto.destroy = function destroy() {
    this.destroyScenes();
    if (this._pipeline) {
      this._pipeline.destroy();
      this._pipeline = null;
      this._pipelineEvent = null;
    }
    if (this._batcher) {
      this._batcher.destroy();
      this._batcher = null;
    }
    this._curWindow = null;
    this._mainWindow = null;
    this.dataPoolManager.clear();
    if (cclegacy.rendering) {
      cclegacy.rendering.destroy();
    }
  };
  _proto.resize = function resize(width, height, windowId) {
    this._windows.forEach(function (window) {
      if (window.swapchain) {
        window.resize(width, height);
      }
    });
  };
  _proto.setRenderPipeline = function setRenderPipeline(useCustomPipeline) {
    var internal = cclegacy.internal,
      director = cclegacy.director,
      rendering = cclegacy.rendering,
      legacy_rendering = cclegacy.legacy_rendering;
    if (rendering === undefined && legacy_rendering === undefined) {
      errorID(1223);
      return false;
    }
    var isCreateDefaultPipeline = false;
    if (useCustomPipeline) {
      this._customPipeline = rendering.createCustomPipeline();
      isCreateDefaultPipeline = true;
      this._pipeline = this._customPipeline;
      log("Using custom pipeline: " + macro.CUSTOM_PIPELINE_NAME);
    } else {
      var rppl = legacy_rendering.createDefaultPipeline();
      isCreateDefaultPipeline = true;
      log("Using legacy pipeline");
      this._classicPipeline = rppl;
      this._pipeline = this._classicPipeline;
      this._pipelineEvent = this._classicPipeline;
      this._usesCustomPipeline = false;
    }
    var renderMode = settings.querySettings(SettingsCategory.RENDERING, 'renderMode');
    if (renderMode !== LegacyRenderMode.HEADLESS || this._classicPipeline) {
      if (!this._pipeline.activate(this._mainWindow.swapchain)) {
        if (isCreateDefaultPipeline) {
          this._pipeline.destroy();
        }
        this._classicPipeline = null;
        this._customPipeline = null;
        this._pipeline = null;
        this._pipelineEvent = null;
        return false;
      }
    }
    var scene = director.getScene();
    if (scene) {
      scene.globals.activate();
    }
    this.onGlobalPipelineStateChanged();
    if (!this._batcher && internal.Batcher2D) {
      this._batcher = new internal.Batcher2D(this);
      if (!this._batcher.initialize()) {
        this.destroy();
        return false;
      }
    }
    return true;
  };
  _proto.onGlobalPipelineStateChanged = function onGlobalPipelineStateChanged() {
    for (var i = 0; i < this._scenes.length; i++) {
      this._scenes[i].onGlobalPipelineStateChanged();
    }
    if (getPipelineSceneData().skybox.enabled) {
      getPipelineSceneData().skybox.model.onGlobalPipelineStateChanged();
    }
    this._pipeline.onGlobalPipelineStateChanged();
  };
  _proto.activeWindow = function activeWindow(window) {
    this._curWindow = window;
  };
  _proto.resetCumulativeTime = function resetCumulativeTime() {
    this._cumulativeTime = 0;
  };
  _proto.frameMove = function frameMove(deltaTime) {
    var _globalThis$__globalX;
    this._frameTime = deltaTime;
    ++this._frameCount;
    this._cumulativeTime += deltaTime;
    this._fpsTime += deltaTime;
    if (this._fpsTime > 1.0) {
      this._fps = this._frameCount;
      this._frameCount = 0;
      this._fpsTime = 0.0;
    }
    if ((_globalThis$__globalX = globalThis.__globalXR) != null && _globalThis$__globalX.isWebXR) {
      this._doWebXRFrameMove();
    } else {
      this._frameMoveBegin();
      this._frameMoveProcess();
      this._frameMoveEnd();
    }
  };
  _proto.createWindow = function createWindow(info) {
    var window = this._createWindowFun(this);
    window.initialize(this.device, info);
    this._windows.push(window);
    return window;
  };
  _proto.destroyWindow = function destroyWindow(window) {
    for (var i = 0; i < this._windows.length; ++i) {
      if (this._windows[i] === window) {
        window.destroy();
        this._windows.splice(i, 1);
        return;
      }
    }
  };
  _proto.destroyWindows = function destroyWindows() {
    this._windows.forEach(function (window) {
      window.destroy();
    });
    this._windows.length = 0;
  };
  _proto.createScene = function createScene(info) {
    var scene = this._createSceneFun(this);
    scene.initialize(info);
    this._scenes.push(scene);
    return scene;
  };
  _proto.destroyScene = function destroyScene(scene) {
    for (var i = 0; i < this._scenes.length; ++i) {
      if (this._scenes[i] === scene) {
        scene.destroy();
        this._scenes.splice(i, 1);
        return;
      }
    }
  };
  _proto.destroyScenes = function destroyScenes() {
    this._scenes.forEach(function (scene) {
      scene.destroy();
    });
    this._scenes.length = 0;
  };
  _proto.createModel = function createModel(ModelCtor) {
    var p = this._modelPools.get(ModelCtor);
    if (!p) {
      this._modelPools.set(ModelCtor, new Pool(function () {
        return new ModelCtor();
      }, 10, function (obj) {
        return obj.destroy();
      }));
      p = this._modelPools.get(ModelCtor);
    }
    var model = p.alloc();
    model.initialize();
    return model;
  };
  _proto.destroyModel = function destroyModel(m) {
    var p = this._modelPools.get(m.constructor);
    if (p) {
      p.free(m);
      if (m.scene) {
        m.scene.removeModel(m);
      }
    } else {
      warnID(1300, m.constructor.name);
    }
    m.destroy();
  };
  _proto.createCamera = function createCamera() {
    return this._cameraPool.alloc();
  };
  _proto.createLight = function createLight(LightCtor) {
    var l = this._lightPools.get(LightCtor);
    if (!l) {
      this._lightPools.set(LightCtor, new Pool(function () {
        return new LightCtor();
      }, 4, function (obj) {
        return obj.destroy();
      }));
      l = this._lightPools.get(LightCtor);
    }
    var light = l.alloc();
    light.initialize();
    return light;
  };
  _proto.destroyLight = function destroyLight(l) {
    if (l.scene) {
      switch (l.type) {
        case LightType.DIRECTIONAL:
          l.scene.removeDirectionalLight(l);
          break;
        case LightType.SPHERE:
          l.scene.removeSphereLight(l);
          break;
        case LightType.SPOT:
          l.scene.removeSpotLight(l);
          break;
        case LightType.POINT:
          l.scene.removePointLight(l);
          break;
        case LightType.RANGED_DIRECTIONAL:
          l.scene.removeRangedDirLight(l);
          break;
      }
    }
    l.destroy();
  };
  _proto.recycleLight = function recycleLight(l) {
    var p = this._lightPools.get(l.constructor);
    if (p) {
      p.free(l);
      if (l.scene) {
        switch (l.type) {
          case LightType.DIRECTIONAL:
            l.scene.removeDirectionalLight(l);
            break;
          case LightType.SPHERE:
            l.scene.removeSphereLight(l);
            break;
          case LightType.SPOT:
            l.scene.removeSpotLight(l);
            break;
          case LightType.POINT:
            l.scene.removePointLight(l);
            break;
          case LightType.RANGED_DIRECTIONAL:
            l.scene.removeRangedDirLight(l);
            break;
        }
      }
    }
  };
  _proto._doWebXRFrameMove = function _doWebXRFrameMove() {
    var _this2 = this;
    var xr = globalThis.__globalXR;
    if (!xr) {
      return;
    }
    var windows = this._windows;
    var cameraList = this._cameraList;
    var viewCount = xr.webXRMatProjs ? xr.webXRMatProjs.length : 1;
    if (!xr.webXRWindowMap) {
      xr.webXRWindowMap = new Map();
    }
    var allCameras = [];
    var webxrHmdPoseInfos = xr.webxrHmdPoseInfos;
    var _loop = function _loop() {
      for (var _iterator = _createForOfIteratorHelperLoose(windows), _step; !(_step = _iterator()).done;) {
        var window = _step.value;
        allCameras = allCameras.concat(window.cameras);
        if (window.swapchain) {
          xr.webXRWindowMap.set(window, xrEye);
        }
      }
      if (webxrHmdPoseInfos) {
        var cameraPosition = [0, 0, 0];
        for (var i = 0; i < webxrHmdPoseInfos.length; i++) {
          var info = webxrHmdPoseInfos[i];
          if (info.code === XRPoseType.VIEW_LEFT && xrEye === XREye.LEFT || info.code === XRPoseType.VIEW_RIGHT && xrEye === XREye.RIGHT) {
            cameraPosition[0] = info.position.x;
            cameraPosition[1] = info.position.y;
            cameraPosition[2] = info.position.z;
            break;
          }
        }
        allCameras.forEach(function (cam) {
          if (cam.trackingType !== TrackingType.NO_TRACKING && cam.node) {
            var isTrackingRotation = cam.trackingType === TrackingType.ROTATION;
            if (isTrackingRotation) {
              cameraPosition = [0, 0, 0];
            }
            cam.node.setPosition(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
          }
        });
      }
      allCameras.length = 0;
      _this2._frameMoveBegin();
      _this2._frameMoveProcess();
      for (var _i = cameraList.length - 1; _i >= 0; _i--) {
        var camera = cameraList[_i];
        var isMismatchedCam = xrEye === XREye.LEFT && camera.cameraType === CameraType.RIGHT_EYE || xrEye === XREye.RIGHT && camera.cameraType === CameraType.LEFT_EYE;
        if (isMismatchedCam) {
          cameraList.splice(_i, 1);
        }
      }
      _this2._frameMoveEnd();
    };
    for (var xrEye = 0; xrEye < viewCount; xrEye++) {
      _loop();
    }
  };
  _proto._frameMoveBegin = function _frameMoveBegin() {
    for (var i = 0; i < this._scenes.length; ++i) {
      this._scenes[i].removeBatches();
    }
    this._cameraList.length = 0;
  };
  _proto._frameMoveProcess = function _frameMoveProcess() {
    var director = cclegacy.director;
    var windows = this._windows;
    var cameraList = this._cameraList;
    for (var i = 0; i < windows.length; i++) {
      var window = windows[i];
      window.extractRenderCameras(cameraList);
    }
    if (this._pipeline && cameraList.length > 0) {
      this._device.acquire([deviceManager.swapchain]);
      var scenes = this._scenes;
      var stamp = director.getTotalFrames();
      if (this._batcher) {
        this._batcher.update();
        this._batcher.uploadBuffers();
      }
      for (var _i2 = 0; _i2 < scenes.length; _i2++) {
        scenes[_i2].update(stamp);
      }
    }
  };
  _proto._frameMoveEnd = function _frameMoveEnd() {
    var director = cclegacy.director,
      Director = cclegacy.Director;
    var cameraList = this._cameraList;
    if (this._pipeline && cameraList.length > 0) {
      director.emit(Director.EVENT_BEFORE_COMMIT);
      cameraList.sort(function (a, b) {
        return a.priority - b.priority;
      });
      for (var i = 0; i < cameraList.length; ++i) {
        var _cameraList$i$geometr;
        (_cameraList$i$geometr = cameraList[i].geometryRenderer) == null ? void 0 : _cameraList$i$geometr.update();
      }
      director.emit(Director.EVENT_BEFORE_RENDER);
      this._pipeline.render(cameraList);
      director.emit(Director.EVENT_AFTER_RENDER);
      this._device.present();
    }
    if (this._batcher) this._batcher.reset();
  };
  _proto._resizeMaxJointForDS = function _resizeMaxJointForDS() {
    var usedUBOVectorCount = Math.max((UBOGlobalEnum.COUNT + UBOCameraEnum.COUNT + UBOShadowEnum.COUNT + UBOLocalEnum.COUNT + UBOWorldBound.COUNT) / 4, 100);
    var maxJoints = Math.floor((deviceManager.gfxDevice.capabilities.maxVertexUniformVectors - usedUBOVectorCount) / 3);
    maxJoints = maxJoints < 256 ? maxJoints : 256;
    localDescriptorSetLayout_ResizeMaxJoints(maxJoints);
  };
  return _createClass(Root, [{
    key: "device",
    get: function get() {
      return this._device;
    }
  }, {
    key: "mainWindow",
    get: function get() {
      return this._mainWindow;
    }
  }, {
    key: "curWindow",
    get: function get() {
      return this._curWindow;
    },
    set: function set(window) {
      this._curWindow = window;
    }
  }, {
    key: "tempWindow",
    get: function get() {
      return this._tempWindow;
    },
    set: function set(window) {
      this._tempWindow = window;
    }
  }, {
    key: "windows",
    get: function get() {
      return this._windows;
    }
  }, {
    key: "usesCustomPipeline",
    get: function get() {
      return this._usesCustomPipeline;
    }
  }, {
    key: "pipeline",
    get: function get() {
      return this._pipeline;
    }
  }, {
    key: "customPipeline",
    get: function get() {
      return this._customPipeline;
    }
  }, {
    key: "pipelineEvent",
    get: function get() {
      return this._pipelineEvent;
    }
  }, {
    key: "batcher2D",
    get: function get() {
      return this._batcher;
    }
  }, {
    key: "scenes",
    get: function get() {
      return this._scenes;
    }
  }, {
    key: "debugView",
    get: function get() {
      return this._debugView;
    }
  }, {
    key: "cumulativeTime",
    get: function get() {
      return this._cumulativeTime;
    }
  }, {
    key: "frameTime",
    get: function get() {
      return this._frameTime;
    }
  }, {
    key: "frameCount",
    get: function get() {
      return this._frameCount;
    }
  }, {
    key: "fps",
    get: function get() {
      return this._fps;
    }
  }, {
    key: "fixedFPS",
    get: function get() {
      return this._fixedFPS;
    },
    set: function set(fps) {
      if (fps > 0) {
        this._fixedFPS = fps;
      }
    }
  }, {
    key: "dataPoolManager",
    get: function get() {
      return this._dataPoolMgr;
    }
  }, {
    key: "useDeferredPipeline",
    get: function get() {
      return this._useDeferredPipeline;
    }
  }, {
    key: "cameraList",
    get: function get() {
      return this._cameraList;
    }
  }]);
}();
cclegacy.Root = Root;

var UIRendererManager = function () {
  function UIRendererManager() {
    this._allRenderers = [];
    this._dirtyRenderers = [];
    this._dirtyVersion = 0;
  }
  var _proto = UIRendererManager.prototype;
  _proto.addRenderer = function addRenderer(uiRenderer) {
    if (uiRenderer._internalId === -1) {
      uiRenderer._internalId = this._allRenderers.length;
      this._allRenderers.push(uiRenderer);
    }
  };
  _proto.removeRenderer = function removeRenderer(uiRenderer) {
    if (uiRenderer._internalId !== -1) {
      {
        assert(this._allRenderers[uiRenderer._internalId] === uiRenderer);
      }
      var id = uiRenderer._internalId;
      this._allRenderers[this._allRenderers.length - 1]._internalId = id;
      fastRemoveAt(this._allRenderers, id);
      uiRenderer._internalId = -1;
      if (uiRenderer._dirtyVersion === this._dirtyVersion) {
        fastRemove(this._dirtyRenderers, uiRenderer);
        uiRenderer._dirtyVersion = -1;
      }
    }
  };
  _proto.markDirtyRenderer = function markDirtyRenderer(uiRenderer) {
    if (uiRenderer._dirtyVersion !== this._dirtyVersion && uiRenderer._internalId !== -1) {
      this._dirtyRenderers.push(uiRenderer);
      uiRenderer._dirtyVersion = this._dirtyVersion;
    }
  };
  _proto.updateAllDirtyRenderers = function updateAllDirtyRenderers() {
    var dirtyRenderers = this._dirtyRenderers;
    for (var i = 0; i < this._dirtyRenderers.length; i++) {
      {
        assert(dirtyRenderers[i]._internalId !== -1);
      }
      dirtyRenderers[i].updateRenderer();
    }
    this._dirtyRenderers.length = 0;
    this._dirtyVersion++;
  };
  return UIRendererManager;
}();
var uiRendererManager = new UIRendererManager();

var DirectorEvent;
(function (DirectorEvent) {
  DirectorEvent["INIT"] = "director_init";
  DirectorEvent["RESET"] = "director_reset";
  DirectorEvent["BEFORE_SCENE_LOADING"] = "director_before_scene_loading";
  DirectorEvent["BEFORE_SCENE_LAUNCH"] = "director_before_scene_launch";
  DirectorEvent["AFTER_SCENE_LAUNCH"] = "director_after_scene_launch";
  DirectorEvent["BEFORE_UPDATE"] = "director_before_update";
  DirectorEvent["AFTER_UPDATE"] = "director_after_update";
  DirectorEvent["BEFORE_DRAW"] = "director_before_draw";
  DirectorEvent["AFTER_DRAW"] = "director_after_draw";
  DirectorEvent["BEFORE_COMMIT"] = "director_before_commit";
  DirectorEvent["BEFORE_RENDER"] = "director_before_render";
  DirectorEvent["AFTER_RENDER"] = "director_after_render";
  DirectorEvent["BEFORE_PHYSICS"] = "director_before_physics";
  DirectorEvent["AFTER_PHYSICS"] = "director_after_physics";
  DirectorEvent["BEGIN_FRAME"] = "director_begin_frame";
  DirectorEvent["END_FRAME"] = "director_end_frame";
})(DirectorEvent || (DirectorEvent = {}));
var Director = function (_EventTarget) {
  function Director() {
    var _this;
    _this = _EventTarget.call(this) || this;
    _this._compScheduler = new ComponentScheduler();
    _this._nodeActivator = new NodeActivator();
    _this._invalid = false;
    _this._paused = false;
    _this._root = null;
    _this._loadingScene = '';
    _this._scene = null;
    _this._totalFrames = 0;
    _this._scheduler = new Scheduler();
    _this._systems = [];
    _this._persistRootNodes = {};
    return _this;
  }
  _inheritsLoose(Director, _EventTarget);
  var _proto = Director.prototype;
  _proto.end = function end() {
    var _this2 = this;
    this.once(DirectorEvent.END_FRAME, function () {
      _this2.purgeDirector();
    });
  };
  _proto.pause = function pause() {
    this._paused = true;
  };
  _proto.purgeDirector = function purgeDirector() {
    this._scheduler.unscheduleAll();
    this._compScheduler.unscheduleAll();
    this._nodeActivator.reset();
    {
      if (isValid(this._scene)) {
        this._scene.destroy();
      }
      this._scene = null;
    }
    this.stopAnimation();
    assetManager.releaseAll();
  };
  _proto.reset = function reset() {
    this.purgeDirector();
    for (var id in this._persistRootNodes) {
      this.removePersistRootNode(this._persistRootNodes[id]);
    }
    var scene = this.getScene();
    if (scene) {
      scene.destroy();
    }
    this.emit(DirectorEvent.RESET);
    this.startAnimation();
  };
  _proto.runSceneImmediate = function runSceneImmediate(scene, onBeforeLoadScene, onLaunched) {
    var _this3 = this;
    if (scene instanceof SceneAsset) scene = scene.scene;
    assertID(scene instanceof Scene, 1216);
    scene._load();
    var persistNodeList = Object.keys(this._persistRootNodes).map(function (x) {
      return _this3._persistRootNodes[x];
    });
    for (var i = 0; i < persistNodeList.length; i++) {
      var node = persistNodeList[i];
      node.emit(NodeEventType.SCENE_CHANGED_FOR_PERSISTS, scene.renderScene);
      var existNode = scene.uuid === node._originalSceneId && scene.getChildByUuid(node.uuid);
      if (existNode) {
        var index = existNode.siblingIndex;
        node.hideFlags &= ~CCObjectFlags.DontSave;
        node.hideFlags |= CCObjectFlags.DontSave & existNode.hideFlags;
        existNode._destroyImmediate();
        scene.insertChild(node, index);
      } else {
        node.hideFlags |= CCObjectFlags.DontSave;
        node.parent = scene;
      }
    }
    var oldScene = this._scene;
    if (isValid(oldScene)) {
      oldScene.destroy();
    }
    {
      releaseManager._autoRelease(oldScene, scene, this._persistRootNodes);
    }
    this._scene = null;
    CCObject._deferredDestroy();
    if (onBeforeLoadScene) {
      onBeforeLoadScene();
    }
    this.emit(DirectorEvent.BEFORE_SCENE_LAUNCH, scene);
    this._scene = scene;
    scene._activate();
    if (this._root) {
      this._root.resetCumulativeTime();
    }
    this.startAnimation();
    if (onLaunched) {
      onLaunched(null, scene);
    }
    this.emit(DirectorEvent.AFTER_SCENE_LAUNCH, scene);
  };
  _proto.runScene = function runScene(scene, onBeforeLoadScene, onLaunched) {
    var _this4 = this;
    if (scene instanceof SceneAsset) scene = scene.scene;
    assertID(Boolean(scene), 1205);
    assertID(scene instanceof Scene, 1216);
    this.once(DirectorEvent.END_FRAME, function () {
      _this4.runSceneImmediate(scene, onBeforeLoadScene, onLaunched);
    });
  };
  _proto.loadScene = function loadScene(sceneName, onLaunched, onUnloaded) {
    var _this5 = this;
    if (this._loadingScene) {
      warnID(1208, sceneName, this._loadingScene);
      return false;
    }
    var bundle = assetManager.bundles.find(function (bundle) {
      return !!bundle.getSceneInfo(sceneName);
    });
    if (bundle) {
      this.emit(DirectorEvent.BEFORE_SCENE_LOADING, sceneName);
      this._loadingScene = sceneName;
      console.time("LoadScene " + sceneName);
      bundle.loadScene(sceneName, function (err, scene) {
        console.timeEnd("LoadScene " + sceneName);
        _this5._loadingScene = '';
        if (err) {
          error(err);
          if (onLaunched) {
            onLaunched(err);
          }
        } else {
          _this5.runSceneImmediate(scene, onUnloaded, onLaunched);
        }
      });
      return true;
    } else {
      errorID(1209, sceneName);
      return false;
    }
  };
  _proto.preloadScene = function preloadScene(sceneName, onProgress, onLoaded) {
    var bundle = assetManager.bundles.find(function (bundle) {
      return !!bundle.getSceneInfo(sceneName);
    });
    if (bundle) {
      bundle.preloadScene(sceneName, null, onProgress, onLoaded);
    } else {
      var _err = "Can not preload the scene \"" + sceneName + "\" because it is not in the build settings.";
      if (onLoaded) {
        onLoaded(new Error(_err));
      }
      error("preloadScene: " + _err);
    }
  };
  _proto.resume = function resume() {
    this._paused = false;
  };
  _proto.getScene = function getScene() {
    return this._scene;
  };
  _proto.getDeltaTime = function getDeltaTime() {
    return cclegacy.game.deltaTime;
  };
  _proto.getTotalTime = function getTotalTime() {
    return cclegacy.game.totalTime;
  };
  _proto.getCurrentTime = function getCurrentTime() {
    return cclegacy.game.frameStartTime;
  };
  _proto.getTotalFrames = function getTotalFrames() {
    return this._totalFrames;
  };
  _proto.isPaused = function isPaused() {
    return this._paused;
  };
  _proto.getScheduler = function getScheduler() {
    return this._scheduler;
  };
  _proto.setScheduler = function setScheduler(scheduler) {
    if (this._scheduler !== scheduler) {
      this.unregisterSystem(this._scheduler);
      this._scheduler = scheduler;
      this.registerSystem(Scheduler.ID, scheduler, 200);
    }
  };
  _proto.registerSystem = function registerSystem(name, sys, priority) {
    sys.id = name;
    sys.priority = priority;
    this._systems.push(sys);
    this._systems.sort(System.sortByPriority);
  };
  _proto.unregisterSystem = function unregisterSystem(sys) {
    fastRemove(this._systems, sys);
    this._systems.sort(System.sortByPriority);
  };
  _proto.getSystem = function getSystem(name) {
    return this._systems.find(function (sys) {
      return sys.id === name;
    });
  };
  _proto.getAnimationManager = function getAnimationManager() {
    return this.getSystem(cclegacy.AnimationManager.ID);
  };
  _proto.startAnimation = function startAnimation() {
    this._invalid = false;
  };
  _proto.stopAnimation = function stopAnimation() {
    this._invalid = true;
  };
  _proto.mainLoop = function mainLoop(now) {
    var dt;
    {
      dt = cclegacy.game._calculateDT(false);
    }
    this.tick(dt);
  };
  _proto.tick = function tick(dt) {
    if (!this._invalid) {
      this.emit(DirectorEvent.BEGIN_FRAME);
      {
        input._frameDispatchEvents();
      }
      if (!this._paused) {
        this.emit(DirectorEvent.BEFORE_UPDATE);
        this._compScheduler.startPhase();
        this._compScheduler.updatePhase(dt);
        for (var i = 0; i < this._systems.length; ++i) {
          this._systems[i].update(dt);
        }
        this._compScheduler.lateUpdatePhase(dt);
        this.emit(DirectorEvent.AFTER_UPDATE);
        CCObject._deferredDestroy();
        for (var _i = 0; _i < this._systems.length; ++_i) {
          this._systems[_i].postUpdate(dt);
        }
      }
      this.emit(DirectorEvent.BEFORE_DRAW);
      uiRendererManager.updateAllDirtyRenderers();
      this._root.frameMove(dt);
      this.emit(DirectorEvent.AFTER_DRAW);
      Node.resetHasChangedFlags();
      Node.clearNodeArray();
      scalableContainerManager.update(dt);
      this.emit(DirectorEvent.END_FRAME);
      this._totalFrames++;
    }
  };
  _proto.buildRenderPipeline = function buildRenderPipeline() {
    if (!this._root) {
      return;
    }
    var ppl = this._root.customPipeline;
    var cameras = this._root.cameraList;
    ppl.beginSetup();
    var builder = cclegacy.rendering.getCustomPipeline(macro.CUSTOM_PIPELINE_NAME);
    cclegacy.rendering.dispatchResizeEvents(cameras, builder, ppl);
    builder.setup(cameras, ppl);
    ppl.endSetup();
  };
  _proto.setupRenderPipelineBuilder = function setupRenderPipelineBuilder() {
    if (macro.CUSTOM_PIPELINE_NAME !== '' && cclegacy.rendering && this._root && this._root.usesCustomPipeline) {
      this.on(DirectorEvent.BEFORE_SCENE_LAUNCH, cclegacy.rendering.forceResizeAllWindows, cclegacy.rendering);
    }
  };
  _proto.init = function init() {
    this._totalFrames = 0;
    this._paused = false;
    this.registerSystem(Scheduler.ID, this._scheduler, 200);
    this._root = new Root(deviceManager.gfxDevice);
    var rootInfo = {};
    this._root.initialize(rootInfo);
    this.setupRenderPipelineBuilder();
    for (var i = 0; i < this._systems.length; i++) {
      this._systems[i].init();
    }
    this.emit(DirectorEvent.INIT);
  };
  _proto.addPersistRootNode = function addPersistRootNode(node) {
    if (!Node.isNode(node) || !node.uuid) {
      warnID(3800);
      return;
    }
    var id = node.uuid;
    if (!this._persistRootNodes[id]) {
      var _scene = this._scene;
      if (isValid(_scene)) {
        if (!node.parent) {
          node.parent = _scene;
          node._originalSceneId = _scene.uuid;
        } else if (!(node.parent instanceof Scene)) {
          warnID(3801);
          return;
        } else if (node.parent !== _scene) {
          warnID(3802);
          return;
        } else {
          node._originalSceneId = _scene.uuid;
        }
      }
      this._persistRootNodes[id] = node;
      node._persistNode = true;
      releaseManager._addPersistNodeRef(node);
    }
  };
  _proto.removePersistRootNode = function removePersistRootNode(node) {
    var id = node.uuid || '';
    if (node === this._persistRootNodes[id]) {
      delete this._persistRootNodes[id];
      node._persistNode = false;
      node._originalSceneId = '';
      releaseManager._removePersistNodeRef(node);
    }
  };
  _proto.isPersistRootNode = function isPersistRootNode(node) {
    return !!node._persistNode;
  };
  return _createClass(Director, [{
    key: "root",
    get: function get() {
      return this._root;
    }
  }]);
}(EventTarget);
Director.EVENT_INIT = DirectorEvent.INIT;
Director.EVENT_RESET = DirectorEvent.RESET;
Director.EVENT_BEFORE_SCENE_LOADING = DirectorEvent.BEFORE_SCENE_LOADING;
Director.EVENT_BEFORE_SCENE_LAUNCH = DirectorEvent.BEFORE_SCENE_LAUNCH;
Director.EVENT_AFTER_SCENE_LAUNCH = DirectorEvent.AFTER_SCENE_LAUNCH;
Director.EVENT_BEFORE_UPDATE = DirectorEvent.BEFORE_UPDATE;
Director.EVENT_AFTER_UPDATE = DirectorEvent.AFTER_UPDATE;
Director.EVENT_BEFORE_DRAW = DirectorEvent.BEFORE_DRAW;
Director.EVENT_AFTER_DRAW = DirectorEvent.AFTER_DRAW;
Director.EVENT_BEFORE_COMMIT = DirectorEvent.BEFORE_COMMIT;
Director.EVENT_BEFORE_RENDER = DirectorEvent.BEFORE_RENDER;
Director.EVENT_AFTER_RENDER = DirectorEvent.AFTER_RENDER;
Director.EVENT_BEFORE_PHYSICS = DirectorEvent.BEFORE_PHYSICS;
Director.EVENT_AFTER_PHYSICS = DirectorEvent.AFTER_PHYSICS;
Director.EVENT_BEGIN_FRAME = DirectorEvent.BEGIN_FRAME;
Director.EVENT_END_FRAME = DirectorEvent.END_FRAME;
Director.instance = void 0;
cclegacy.Director = Director;
cclegacy.DirectorEvent = DirectorEvent;
var director = Director.instance = cclegacy.director = new Director();

export { DirectorEvent as D, Root as R, XREye as X, Director as a, director as d, uiRendererManager as u };
//# sourceMappingURL=director-F7e_Lqjg.js.map
