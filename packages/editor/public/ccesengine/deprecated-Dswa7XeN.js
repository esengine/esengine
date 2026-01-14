import { x as size, o as screen, N as visibleRect, O as screenAdapter, B as Size, V as Vec2, S as System, m as Rect, y as rect, M as Mat4, n as sys, U as clamp01, W as cubicOut, q as preTransforms, G as markAsWarning, j as removeProperty, i as replaceProperty } from './index-uXI1_UMk.js';
import { d as director, X as XREye, D as DirectorEvent, a as Director } from './director-F7e_Lqjg.js';
import { a as _createClass, o as assertIsTrue, Y as Orientation, G as macro, _ as _inheritsLoose, s as settings, S as SettingsCategory, k as errorID, I as assert, Z as Eventify, $ as systemInfo, a0 as DebugMode, a1 as _resetDebugSetting, a2 as garbageCollectionManager, L as log, W as logID, n as EventTarget, a3 as AsyncDelegate } from './gc-object-CShF5lzx.js';
import { a as EDITOR_NOT_IN_PREVIEW } from './_virtual_internal_constants-DWlew7Dp.js';
import { b as Material, k as assetManager, d as builtinResMgr } from './scene-vWcxM1_c.js';
import { i as input } from './prefab-DYg_oxpo.js';
import { d as deviceManager, L as LegacyRenderMode } from './device-manager-CBXP-ttm.js';
import { ac as Color, ad as Rect$1, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, A as Attribute, F as Format, I as InputAssemblerInfo, ae as SamplerInfo, af as Address, z as TextureInfo, E as TextureType, H as TextureUsageBit, J as BufferTextureCopy } from './buffer-barrier-BlQXg9Aa.js';
import { P as PipelineStateManager, S as SetIndex, k as bindingMappingInfo, L as Layers } from './pipeline-state-manager-C5U4ouGL.js';
import './debug-view-BuNhRPv_.js';
import { c as cclegacy, a as ccwindow, l as legacyCC, e as engineVersion } from './global-exports-DnCP_14L.js';
import './node-event-Ccvtv8bJ.js';
import './deprecated-n0w4kK7g.js';

function findCanvas() {
  var frame = document.querySelector('#GameDiv');
  var container = document.querySelector('#Cocos3dGameContainer');
  var canvas = document.querySelector('#GameCanvas');
  return {
    frame: frame,
    container: container,
    canvas: canvas
  };
}
function loadJsFile(path) {
  return new Promise(function (resolve, reject) {
    var err;
    function windowErrorListener(evt) {
      if (evt.filename === path) {
        err = evt.error;
      }
    }
    window.addEventListener('error', windowErrorListener);
    var script = document.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('error', function () {
      window.removeEventListener('error', windowErrorListener);
      reject(Error("Error loading " + path));
    });
    script.addEventListener('load', function () {
      window.removeEventListener('error', windowErrorListener);
      document.head.removeChild(script);
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    script.src = path.replace('#', '%23');
    document.head.appendChild(script);
  });
}

var Pacer = function () {
  function Pacer() {
    var _this = this;
    this._stHandle = 0;
    this._onTick = null;
    this._targetFrameRate = 60;
    this._frameTime = 0;
    this._startTime = 0;
    this._isPlaying = false;
    this._frameCount = 0;
    this._callback = null;
    this._rAF = void 0;
    this._cAF = void 0;
    this._handleRAF = function (stamp) {
      var currTime = performance.now();
      var elapseTime = currTime - _this._startTime;
      var elapseFrame = Math.floor(elapseTime / _this._frameTime);
      if (elapseFrame < 0) {
        _this._startTime = currTime;
        _this._frameCount = 0;
      }
      if (elapseFrame < _this._frameCount) {
        _this._stHandle = _this._rAF.call(window, _this._handleRAF);
      } else {
        _this._frameCount = elapseFrame + 1;
        if (_this._callback) {
          _this._callback();
        }
      }
    };
    this._frameTime = 1000 / this._targetFrameRate;
    this._rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
    this._cAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.ocancelAnimationFrame;
  }
  var _proto = Pacer.prototype;
  _proto.start = function start() {
    var _globalThis$__globalX,
      _this2 = this;
    if (this._isPlaying) return;
    var recordStartTime = this._rAF === undefined || ((_globalThis$__globalX = globalThis.__globalXR) == null ? void 0 : _globalThis$__globalX.isWebXR);
    var _updateCallback = function updateCallback() {
      if (recordStartTime) _this2._startTime = performance.now();
      if (_this2._isPlaying) {
        _this2._stHandle = _this2._stTime(_updateCallback);
      }
      if (_this2._onTick) {
        _this2._onTick();
      }
    };
    this._startTime = performance.now();
    this._stHandle = this._stTime(_updateCallback);
    this._isPlaying = true;
    this._frameCount = 0;
  };
  _proto.stop = function stop() {
    if (!this._isPlaying) return;
    this._ctTime(this._stHandle);
    this._stHandle = 0;
    this._isPlaying = false;
    this._frameCount = 0;
  };
  _proto._stTime = function _stTime(callback) {
    var _globalThis$__globalX2;
    if (this._rAF === undefined || (_globalThis$__globalX2 = globalThis.__globalXR) != null && _globalThis$__globalX2.isWebXR) {
      var currTime = performance.now();
      var elapseTime = Math.max(0, currTime - this._startTime);
      var timeToCall = Math.max(0, this._frameTime - elapseTime);
      return setTimeout(callback, timeToCall);
    }
    this._callback = callback;
    return this._rAF.call(window, this._handleRAF);
  };
  _proto._ctTime = function _ctTime(id) {
    var _globalThis$__globalX3;
    if (this._cAF === undefined || (_globalThis$__globalX3 = globalThis.__globalXR) != null && _globalThis$__globalX3.isWebXR) {
      clearTimeout(id);
    } else if (id) {
      this._cAF.call(window, id);
    }
  };
  return _createClass(Pacer, [{
    key: "targetFrameRate",
    get: function get() {
      return this._targetFrameRate;
    },
    set: function set(val) {
      if (this._targetFrameRate !== val) {
        assertIsTrue(val > 0);
        this._targetFrameRate = val;
        this._frameTime = 1000 / this._targetFrameRate;
        if (this._isPlaying) {
          this.stop();
          this.start();
        }
      }
    }
  }, {
    key: "onTick",
    get: function get() {
      return this._onTick;
    },
    set: function set(val) {
      this._onTick = val;
    }
  }]);
}();

var _orientationMap;
var localWinSize = size();
var orientationMap = (_orientationMap = {}, _orientationMap[macro.ORIENTATION_AUTO] = Orientation.AUTO, _orientationMap[macro.ORIENTATION_LANDSCAPE] = Orientation.LANDSCAPE, _orientationMap[macro.ORIENTATION_PORTRAIT] = Orientation.PORTRAIT, _orientationMap);
var View = function (_Eventify) {
  function View() {
    var _this;
    _this = _Eventify.call(this) || this;
    _this._designResolutionSize = size(0, 0);
    _this._scaleX = 1;
    _this._scaleY = 1;
    _this._viewportRect = rect();
    _this._visibleRect = rect();
    _this._autoFullScreen = false;
    _this._retinaEnabled = false;
    _this._resizeCallback = null;
    var _strategyer = ContainerStrategy;
    var _strategy = ContentStrategy;
    _this._rpExactFit = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.EXACT_FIT);
    _this._rpShowAll = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.SHOW_ALL);
    _this._rpNoBorder = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.NO_BORDER);
    _this._rpFixedHeight = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_HEIGHT);
    _this._rpFixedWidth = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_WIDTH);
    _this._resolutionPolicy = _this._rpShowAll;
    return _this;
  }
  _inheritsLoose(View, _Eventify);
  var _proto = View.prototype;
  _proto.init = function init() {
    var windowSize = screen.windowSize;
    var w = windowSize.width;
    var h = windowSize.height;
    this._designResolutionSize.width = w;
    this._designResolutionSize.height = h;
    this._viewportRect.width = w;
    this._viewportRect.height = h;
    this._visibleRect.width = w;
    this._visibleRect.height = h;
    localWinSize.width = this._visibleRect.width;
    localWinSize.height = this._visibleRect.height;
    if (visibleRect) {
      visibleRect.init(this._visibleRect);
    }
    {
      this.resizeWithBrowserSize(true);
      var designResolution = settings.querySettings(SettingsCategory.SCREEN, 'designResolution');
      if (designResolution) {
        this.setDesignResolutionSize(Number(designResolution.width), Number(designResolution.height), designResolution.policy || ResolutionPolicy.FIXED_HEIGHT);
      }
    }
    screen.on('window-resize', this._updateAdaptResult, this);
    screen.on('fullscreen-change', this._updateAdaptResult, this);
  };
  _proto.resizeWithBrowserSize = function resizeWithBrowserSize(enabled) {
    screenAdapter.handleResizeEvent = enabled;
  };
  _proto.setResizeCallback = function setResizeCallback(callback) {
    if (typeof callback === 'function' || callback == null) {
      this._resizeCallback = callback;
    }
  };
  _proto.setOrientation = function setOrientation(orientation) {
    screenAdapter.orientation = orientationMap[orientation];
  };
  _proto.adjustViewportMeta = function adjustViewportMeta(enabled) {};
  _proto.enableRetina = function enableRetina(enabled) {
    this._retinaEnabled = !!enabled;
  };
  _proto.isRetinaEnabled = function isRetinaEnabled() {
    return this._retinaEnabled;
  };
  _proto.enableAutoFullScreen = function enableAutoFullScreen(enabled) {
    if (enabled === this._autoFullScreen) {
      return;
    }
    this._autoFullScreen = enabled;
    if (enabled) {
      screen.requestFullScreen()["catch"](function (e) {});
    }
  };
  _proto.isAutoFullScreenEnabled = function isAutoFullScreenEnabled() {
    return this._autoFullScreen;
  };
  _proto.setCanvasSize = function setCanvasSize(width, height) {
    screenAdapter.resolutionScale = 1;
    var dpr = screenAdapter.devicePixelRatio;
    var windowSize = new Size(width * dpr, height * dpr);
    screen.windowSize = windowSize;
  };
  _proto.getCanvasSize = function getCanvasSize() {
    return screen.windowSize;
  };
  _proto.getFrameSize = function getFrameSize() {
    var dpr = screenAdapter.devicePixelRatio;
    var sizeInCssPixels = screen.windowSize;
    sizeInCssPixels.width /= dpr;
    sizeInCssPixels.height /= dpr;
    return sizeInCssPixels;
  };
  _proto.setFrameSize = function setFrameSize(width, height) {
    var dpr = screenAdapter.devicePixelRatio;
    screen.windowSize = new Size(width * dpr, height * dpr);
  };
  _proto.getVisibleSize = function getVisibleSize() {
    return new Size(this._visibleRect.width, this._visibleRect.height);
  };
  _proto.getVisibleSizeInPixel = function getVisibleSizeInPixel() {
    return new Size(this._visibleRect.width * this._scaleX, this._visibleRect.height * this._scaleY);
  };
  _proto.getVisibleOrigin = function getVisibleOrigin() {
    return new Vec2(this._visibleRect.x, this._visibleRect.y);
  };
  _proto.getVisibleOriginInPixel = function getVisibleOriginInPixel() {
    return new Vec2(this._visibleRect.x * this._scaleX, this._visibleRect.y * this._scaleY);
  };
  _proto.getResolutionPolicy = function getResolutionPolicy() {
    return this._resolutionPolicy;
  };
  _proto._updateResolutionPolicy = function _updateResolutionPolicy(resolutionPolicy) {
    if (resolutionPolicy instanceof ResolutionPolicy) {
      this._resolutionPolicy = resolutionPolicy;
    } else {
      var _locPolicy = ResolutionPolicy;
      if (resolutionPolicy === _locPolicy.EXACT_FIT) {
        this._resolutionPolicy = this._rpExactFit;
      }
      if (resolutionPolicy === _locPolicy.SHOW_ALL) {
        this._resolutionPolicy = this._rpShowAll;
      }
      if (resolutionPolicy === _locPolicy.NO_BORDER) {
        this._resolutionPolicy = this._rpNoBorder;
      }
      if (resolutionPolicy === _locPolicy.FIXED_HEIGHT) {
        this._resolutionPolicy = this._rpFixedHeight;
      }
      if (resolutionPolicy === _locPolicy.FIXED_WIDTH) {
        this._resolutionPolicy = this._rpFixedWidth;
      }
    }
  };
  _proto.setResolutionPolicy = function setResolutionPolicy(resolutionPolicy) {
    this._updateResolutionPolicy(resolutionPolicy);
    var designedResolution = view.getDesignResolutionSize();
    view.setDesignResolutionSize(designedResolution.width, designedResolution.height, resolutionPolicy);
  };
  _proto.setDesignResolutionSize = function setDesignResolutionSize(width, height, resolutionPolicy) {
    if (!(width > 0 && height > 0)) {
      errorID(2200);
      return;
    }
    this._updateResolutionPolicy(resolutionPolicy);
    var policy = this._resolutionPolicy;
    if (policy) {
      policy.preApply(this);
    }
    this._designResolutionSize.width = width;
    this._designResolutionSize.height = height;
    var result = policy.apply(this, this._designResolutionSize);
    if (result.scale && result.scale.length === 2) {
      this._scaleX = result.scale[0];
      this._scaleY = result.scale[1];
    }
    if (result.viewport) {
      var vp = this._viewportRect;
      var vb = this._visibleRect;
      var rv = result.viewport;
      vp.x = rv.x;
      vp.y = rv.y;
      vp.width = rv.width;
      vp.height = rv.height;
      vb.x = 0;
      vb.y = 0;
      vb.width = rv.width / this._scaleX;
      vb.height = rv.height / this._scaleY;
    }
    policy.postApply(this);
    localWinSize.width = this._visibleRect.width;
    localWinSize.height = this._visibleRect.height;
    if (visibleRect) {
      visibleRect.init(this._visibleRect);
    }
    this.emit('design-resolution-changed');
  };
  _proto.getDesignResolutionSize = function getDesignResolutionSize() {
    return new Size(this._designResolutionSize.width, this._designResolutionSize.height);
  };
  _proto.setRealPixelResolution = function setRealPixelResolution(width, height, resolutionPolicy) {
    {
      document.documentElement.style.width = width + "px";
      document.body.style.width = width + "px";
      document.body.style.left = '0px';
      document.body.style.top = '0px';
    }
    this.setDesignResolutionSize(width, height, resolutionPolicy);
  };
  _proto.getViewportRect = function getViewportRect() {
    return this._viewportRect;
  };
  _proto.getScaleX = function getScaleX() {
    return this._scaleX;
  };
  _proto.getScaleY = function getScaleY() {
    return this._scaleY;
  };
  _proto.getDevicePixelRatio = function getDevicePixelRatio() {
    return screenAdapter.devicePixelRatio;
  };
  _proto.convertToLocationInView = function convertToLocationInView(tx, ty, relatedPos, out) {
    if (out === void 0) {
      out = new Vec2();
    }
    var x = screenAdapter.devicePixelRatio * (tx - relatedPos.left);
    var y = screenAdapter.devicePixelRatio * (relatedPos.top + relatedPos.height - ty);
    if (screenAdapter.isFrameRotated) {
      out.x = screen.windowSize.width - y;
      out.y = x;
    } else {
      out.x = x;
      out.y = y;
    }
    return out;
  };
  _proto._convertToUISpace = function _convertToUISpace(point) {
    var viewport = this._viewportRect;
    point.x = (point.x - viewport.x) / this._scaleX;
    point.y = (point.y - viewport.y) / this._scaleY;
  };
  _proto._updateAdaptResult = function _updateAdaptResult(width, height, windowId) {
    cclegacy.director.root.resize(width, height, windowId === undefined || windowId === 0 ? 1 : windowId);
    var designResolutionSize = this._designResolutionSize;
    var w = designResolutionSize.width;
    var h = designResolutionSize.height;
    if (width > 0 && height > 0) {
      this.setDesignResolutionSize(w, h, this._resolutionPolicy);
    } else {
      assert(false, '_updateAdaptResult Invalid size.');
    }
    this.emit('canvas-resize');
    if (this._resizeCallback) this._resizeCallback();
  };
  return View;
}(Eventify(System));
View.instance = void 0;
var ContainerStrategy = function () {
  function ContainerStrategy() {
    this.name = 'ContainerStrategy';
  }
  var _proto2 = ContainerStrategy.prototype;
  _proto2.preApply = function preApply(_view) {};
  _proto2.apply = function apply(_view, designedResolution) {};
  _proto2.postApply = function postApply(_view) {};
  _proto2._setupCanvas = function _setupCanvas() {
    var locCanvas = cclegacy.game.canvas;
    if (locCanvas) {
      var windowSize = screen.windowSize;
      if (locCanvas.width !== windowSize.width) {
        locCanvas.width = windowSize.width;
      }
      if (locCanvas.height !== windowSize.height) {
        locCanvas.height = windowSize.height;
      }
    }
  };
  return ContainerStrategy;
}();
ContainerStrategy.EQUAL_TO_FRAME = void 0;
ContainerStrategy.PROPORTION_TO_FRAME = void 0;
var ContentStrategy = function () {
  function ContentStrategy() {
    this.name = 'ContentStrategy';
    this._result = {
      scale: [1, 1],
      viewport: null
    };
    this._strategy = ResolutionPolicy.UNKNOWN;
  }
  var _proto3 = ContentStrategy.prototype;
  _proto3.preApply = function preApply(_view) {};
  _proto3.apply = function apply(_view, designedResolution) {
    return {
      scale: [1, 1]
    };
  };
  _proto3.postApply = function postApply(_view) {};
  _proto3._buildResult = function _buildResult(containerW, containerH, contentW, contentH, scaleX, scaleY) {
    if (Math.abs(containerW - contentW) < 2) {
      contentW = containerW;
    }
    if (Math.abs(containerH - contentH) < 2) {
      contentH = containerH;
    }
    var viewport = new Rect(Math.round((containerW - contentW) / 2), Math.round((containerH - contentH) / 2), contentW, contentH);
    var result = this._result;
    result.scale = [scaleX, scaleY];
    result.viewport = viewport;
    return result;
  };
  return _createClass(ContentStrategy, [{
    key: "strategy",
    get: function get() {
      return this._strategy;
    }
  }]);
}();
var EqualToFrame = function (_ContainerStrategy2) {
  function EqualToFrame() {
    var _this2;
    _this2 = _ContainerStrategy2.call(this) || this;
    _this2.name = 'EqualToFrame';
    return _this2;
  }
  _inheritsLoose(EqualToFrame, _ContainerStrategy2);
  var _proto4 = EqualToFrame.prototype;
  _proto4.apply = function apply(_view, designedResolution) {
    screenAdapter.isProportionalToFrame = false;
    this._setupCanvas();
  };
  return EqualToFrame;
}(ContainerStrategy);
var ProportionalToFrame = function (_ContainerStrategy3) {
  function ProportionalToFrame() {
    var _this3;
    _this3 = _ContainerStrategy3.call(this) || this;
    _this3.name = 'ProportionalToFrame';
    return _this3;
  }
  _inheritsLoose(ProportionalToFrame, _ContainerStrategy3);
  var _proto5 = ProportionalToFrame.prototype;
  _proto5.apply = function apply(_view, designedResolution) {
    screenAdapter.isProportionalToFrame = true;
    this._setupCanvas();
  };
  return ProportionalToFrame;
}(ContainerStrategy);
ContainerStrategy.EQUAL_TO_FRAME = new EqualToFrame();
ContainerStrategy.PROPORTION_TO_FRAME = new ProportionalToFrame();
var ExactFit = function (_ContentStrategy2) {
  function ExactFit() {
    var _this4;
    _this4 = _ContentStrategy2.call(this) || this;
    _this4.name = 'ExactFit';
    _this4._strategy = ResolutionPolicy.EXACT_FIT;
    return _this4;
  }
  _inheritsLoose(ExactFit, _ContentStrategy2);
  var _proto6 = ExactFit.prototype;
  _proto6.apply = function apply(_view, designedResolution) {
    var windowSize = screen.windowSize;
    var containerW = windowSize.width;
    var containerH = windowSize.height;
    var scaleX = containerW / designedResolution.width;
    var scaleY = containerH / designedResolution.height;
    return this._buildResult(containerW, containerH, containerW, containerH, scaleX, scaleY);
  };
  return ExactFit;
}(ContentStrategy);
var ShowAll = function (_ContentStrategy3) {
  function ShowAll() {
    var _this5;
    _this5 = _ContentStrategy3.call(this) || this;
    _this5.name = 'ShowAll';
    _this5._strategy = ResolutionPolicy.SHOW_ALL;
    return _this5;
  }
  _inheritsLoose(ShowAll, _ContentStrategy3);
  var _proto7 = ShowAll.prototype;
  _proto7.apply = function apply(_view, designedResolution) {
    var windowSize = screen.windowSize;
    var containerW = windowSize.width;
    var containerH = windowSize.height;
    var designW = designedResolution.width;
    var designH = designedResolution.height;
    var scaleX = containerW / designW;
    var scaleY = containerH / designH;
    var scale = 0;
    var contentW;
    var contentH;
    if (scaleX < scaleY) {
      scale = scaleX;
      contentW = containerW;
      contentH = designH * scale;
    } else {
      scale = scaleY;
      contentW = designW * scale;
      contentH = containerH;
    }
    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
  };
  return ShowAll;
}(ContentStrategy);
var NoBorder = function (_ContentStrategy4) {
  function NoBorder() {
    var _this6;
    _this6 = _ContentStrategy4.call(this) || this;
    _this6.name = 'NoBorder';
    _this6._strategy = ResolutionPolicy.NO_BORDER;
    return _this6;
  }
  _inheritsLoose(NoBorder, _ContentStrategy4);
  var _proto8 = NoBorder.prototype;
  _proto8.apply = function apply(_view, designedResolution) {
    var windowSize = screen.windowSize;
    var containerW = windowSize.width;
    var containerH = windowSize.height;
    var designW = designedResolution.width;
    var designH = designedResolution.height;
    var scaleX = containerW / designW;
    var scaleY = containerH / designH;
    var scale;
    var contentW;
    var contentH;
    if (scaleX < scaleY) {
      scale = scaleY;
      contentW = designW * scale;
      contentH = containerH;
    } else {
      scale = scaleX;
      contentW = containerW;
      contentH = designH * scale;
    }
    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
  };
  return NoBorder;
}(ContentStrategy);
var FixedHeight = function (_ContentStrategy5) {
  function FixedHeight() {
    var _this7;
    _this7 = _ContentStrategy5.call(this) || this;
    _this7.name = 'FixedHeight';
    _this7._strategy = ResolutionPolicy.FIXED_HEIGHT;
    return _this7;
  }
  _inheritsLoose(FixedHeight, _ContentStrategy5);
  var _proto9 = FixedHeight.prototype;
  _proto9.apply = function apply(_view, designedResolution) {
    var windowSize = screen.windowSize;
    var containerW = windowSize.width;
    var containerH = windowSize.height;
    var designH = designedResolution.height;
    var scale = containerH / designH;
    var contentW = containerW;
    var contentH = containerH;
    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
  };
  return FixedHeight;
}(ContentStrategy);
var FixedWidth = function (_ContentStrategy6) {
  function FixedWidth() {
    var _this8;
    _this8 = _ContentStrategy6.call(this) || this;
    _this8.name = 'FixedWidth';
    _this8._strategy = ResolutionPolicy.FIXED_WIDTH;
    return _this8;
  }
  _inheritsLoose(FixedWidth, _ContentStrategy6);
  var _proto0 = FixedWidth.prototype;
  _proto0.apply = function apply(_view, designedResolution) {
    var windowSize = screen.windowSize;
    var containerW = windowSize.width;
    var containerH = windowSize.height;
    var designW = designedResolution.width;
    var scale = containerW / designW;
    var contentW = containerW;
    var contentH = containerH;
    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
  };
  return FixedWidth;
}(ContentStrategy);
var ResolutionPolicy = function () {
  function ResolutionPolicy(containerStg, contentStg) {
    this.name = 'ResolutionPolicy';
    this._containerStrategy = containerStg;
    this._contentStrategy = contentStg;
  }
  var _proto1 = ResolutionPolicy.prototype;
  _proto1.preApply = function preApply(_view) {
    this._contentStrategy.preApply(_view);
  };
  _proto1.apply = function apply(_view, designedResolution) {
    this._containerStrategy.apply(_view, designedResolution);
    return this._contentStrategy.apply(_view, designedResolution);
  };
  _proto1.postApply = function postApply(_view) {
    this._contentStrategy.postApply(_view);
  };
  _proto1.setContainerStrategy = function setContainerStrategy(containerStg) {
    this._containerStrategy = containerStg;
  };
  _proto1.setContentStrategy = function setContentStrategy(contentStg) {
    this._contentStrategy = contentStg;
  };
  _proto1.getContentStrategy = function getContentStrategy() {
    return this._contentStrategy;
  };
  return _createClass(ResolutionPolicy, [{
    key: "canvasSize",
    get: function get() {
      return screen.windowSize;
    }
  }]);
}();
ResolutionPolicy.EXACT_FIT = 0;
ResolutionPolicy.NO_BORDER = 1;
ResolutionPolicy.SHOW_ALL = 2;
ResolutionPolicy.FIXED_HEIGHT = 3;
ResolutionPolicy.FIXED_WIDTH = 4;
ResolutionPolicy.UNKNOWN = 5;
ResolutionPolicy.ContainerStrategy = ContainerStrategy;
ResolutionPolicy.ContentStrategy = ContentStrategy;
cclegacy.ResolutionPolicy = ResolutionPolicy;
ContentStrategy.EXACT_FIT = new ExactFit();
ContentStrategy.SHOW_ALL = new ShowAll();
ContentStrategy.NO_BORDER = new NoBorder();
ContentStrategy.FIXED_HEIGHT = new FixedHeight();
ContentStrategy.FIXED_WIDTH = new FixedWidth();
var view = View.instance = cclegacy.view = new View();
director.registerSystem('view', view, 0);
cclegacy.winSize = localWinSize;

var v2_0 = new Vec2();
function setMaterialProperty(mat, key, value, passIdx) {
  mat.setProperty(key, value, passIdx);
}
var SplashScreen = function () {
  function SplashScreen() {
    this.settings = void 0;
    this._curTime = 0;
    this.device = void 0;
    this.swapchain = void 0;
    this.shader = void 0;
    this.sampler = void 0;
    this.cmdBuff = void 0;
    this.quadAssmebler = void 0;
    this.vertexBuffers = void 0;
    this.indicesBuffers = void 0;
    this.renderArea = void 0;
    this.clearColors = void 0;
    this.projection = void 0;
    this.isMobile = false;
    this.bgMat = void 0;
    this.bgImage = void 0;
    this.bgTexture = void 0;
    this.logoMat = void 0;
    this.logoImage = void 0;
    this.logoTexture = void 0;
    this.watermarkMat = void 0;
    this.watermarkTexture = void 0;
    this.bgWidth = 1920;
    this.bgHeight = 1080;
    this.logoWidthTemp = 140;
    this.logoHeightTemp = 200;
    this.logoWidth = 0;
    this.logoHeight = 0;
    this.logoXTrans = 1 / 2;
    this.logoYTrans = 1 / 6 + 2.5 / 6;
    this.textSize = 24;
    this.textHeight = 24;
    this.textXTrans = 1 / 2;
    this.textYExtraTrans = 32;
    this.textExpandSize = 4;
    this.scaleSize = 1;
  }
  var _proto = SplashScreen.prototype;
  _proto.init = function init() {
    var _policy,
      _settings$querySettin,
      _settings$querySettin2,
      _settings$querySettin3,
      _settings$querySettin4,
      _settings$querySettin5,
      _settings$querySettin6,
      _this = this;
    var policy = ResolutionPolicy.SHOW_ALL;
    {
      var designResolution = settings.querySettings(SettingsCategory.SCREEN, 'designResolution');
      if (designResolution !== null) {
        policy = designResolution.policy;
      }
    }
    this.settings = {
      policy: (_policy = policy) !== null && _policy !== void 0 ? _policy : ResolutionPolicy.SHOW_ALL,
      displayRatio: (_settings$querySettin = settings.querySettings(SettingsCategory.SPLASH_SCREEN, 'displayRatio')) !== null && _settings$querySettin !== void 0 ? _settings$querySettin : 0.4,
      totalTime: (_settings$querySettin2 = settings.querySettings(SettingsCategory.SPLASH_SCREEN, 'totalTime')) !== null && _settings$querySettin2 !== void 0 ? _settings$querySettin2 : 3000,
      watermarkLocation: (_settings$querySettin3 = settings.querySettings(SettingsCategory.SPLASH_SCREEN, 'watermarkLocation')) !== null && _settings$querySettin3 !== void 0 ? _settings$querySettin3 : 'default',
      autoFit: (_settings$querySettin4 = settings.querySettings(SettingsCategory.SPLASH_SCREEN, 'autoFit')) !== null && _settings$querySettin4 !== void 0 ? _settings$querySettin4 : true,
      logo: (_settings$querySettin5 = settings.querySettings(SettingsCategory.SPLASH_SCREEN, 'logo')) !== null && _settings$querySettin5 !== void 0 ? _settings$querySettin5 : undefined,
      background: (_settings$querySettin6 = settings.querySettings(SettingsCategory.SPLASH_SCREEN, 'background')) !== null && _settings$querySettin6 !== void 0 ? _settings$querySettin6 : undefined
    };
    this._curTime = 0;
    if (this.settings.totalTime <= 0 || this.settings.logo === undefined || this.settings.background === undefined) {
      this.settings.totalTime = 0;
    } else {
      this.device = cclegacy.director.root.device;
      this.swapchain = cclegacy.director.root.mainWindow.swapchain;
      this.preInit();
      this.initLayout();
      if (this.settings.logo.type === 'default') {
        this.initWaterMark();
      }
      var bgPromise = Promise.resolve();
      var logoPromise = Promise.resolve();
      if (this.settings.background.type === 'custom') {
        bgPromise = new Promise(function (resolve, reject) {
          _this.bgImage = new ccwindow.Image();
          _this.bgImage.onload = function () {
            _this.initBG();
            resolve();
          };
          _this.bgImage.onerror = function () {
            reject();
          };
          _this.bgImage.src = _this.settings.background.base64;
        });
      }
      if (this.settings.logo.type !== 'none') {
        logoPromise = new Promise(function (resolve, reject) {
          _this.logoImage = new ccwindow.Image();
          _this.logoImage.onload = function () {
            _this.initLogo();
            resolve();
          };
          _this.logoImage.onerror = function () {
            reject();
          };
          _this.logoImage.src = _this.settings.logo.base64;
        });
      }
      return Promise.all([bgPromise, logoPromise]);
    }
    return Promise.resolve([]);
  };
  _proto.preInit = function preInit() {
    var _this$settings$backgr;
    var clearColor = (_this$settings$backgr = this.settings.background) == null ? void 0 : _this$settings$backgr.color;
    this.clearColors = clearColor ? [new Color(clearColor.x, clearColor.y, clearColor.z, clearColor.w)] : [new Color(0, 0, 0, 1)];
    var device = this.device,
      swapchain = this.swapchain;
    var capabilities = device.capabilities;
    this.renderArea = new Rect$1(0, 0, swapchain.width, swapchain.height);
    this.cmdBuff = device.commandBuffer;
    var verts = new Float32Array([0.5, 0.5, 1, 0, -0.5, 0.5, 0, 0, 0.5, -0.5, 1, 1, -0.5, -0.5, 0, 1]);
    var vbStride = Float32Array.BYTES_PER_ELEMENT * 4;
    var vbSize = vbStride * 4;
    this.vertexBuffers = device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, vbSize, vbStride));
    this.vertexBuffers.update(verts);
    var indices = new Uint16Array([0, 1, 2, 1, 3, 2]);
    var ibStride = Uint16Array.BYTES_PER_ELEMENT;
    var ibSize = ibStride * 6;
    this.indicesBuffers = device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, ibSize, ibStride));
    this.indicesBuffers.update(indices);
    var attributes = [new Attribute('a_position', Format.RG32F), new Attribute('a_texCoord', Format.RG32F)];
    var IAInfo = new InputAssemblerInfo(attributes, [this.vertexBuffers], this.indicesBuffers);
    this.quadAssmebler = device.createInputAssembler(IAInfo);
    this.projection = new Mat4();
    Mat4.ortho(this.projection, -1, 1, -1, 1, -1, 1, capabilities.clipSpaceMinZ, capabilities.clipSpaceSignY, swapchain.surfaceTransform);
    this.isMobile = sys.isMobile;
  };
  _proto.initLayout = function initLayout() {
    if (this.isMobile) {
      this.bgWidth = 812;
      this.bgHeight = 375;
      this.logoWidthTemp = 70;
      this.logoHeightTemp = 100;
      this.textSize = 12;
      this.textHeight = this.textSize + this.textExpandSize;
      this.textXTrans = 1 / 2;
      this.textYExtraTrans = 16;
    } else {
      this.bgWidth = 1920;
      this.bgHeight = 1080;
      this.logoWidthTemp = 140;
      this.logoHeightTemp = 200;
      this.textSize = 24;
      this.textHeight = this.textSize + this.textExpandSize;
      this.textXTrans = 1 / 2;
      this.textYExtraTrans = 32;
    }
    this.logoXTrans = 1 / 2;
    this.logoYTrans = 1 / 6 + 2.5 / 6;
    this.initScale();
  };
  _proto.initScale = function initScale() {
    var dw = this.swapchain.width;
    var dh = this.swapchain.height;
    var desiredWidth = this.isMobile ? 375 : 1080;
    var desiredHeight = this.isMobile ? 812 : 1920;
    if (dw > dh) {
      var temp = desiredHeight;
      desiredHeight = desiredWidth;
      desiredWidth = temp;
    }
    if (dw / dh > 16 / 9) {
      this.scaleSize = dh / desiredHeight;
    } else {
      this.scaleSize = dw / desiredWidth;
    }
  };
  _proto.update = function update(deltaTime) {
    var settings = this.settings;
    var device = this.device,
      swapchain = this.swapchain;
    var capabilities = device.capabilities;
    Mat4.ortho(this.projection, -1, 1, -1, 1, -1, 1, capabilities.clipSpaceMinZ, capabilities.clipSpaceSignY, swapchain.surfaceTransform);
    var dw = swapchain.width;
    var dh = swapchain.height;
    this.initScale();
    this._curTime += deltaTime * 1000;
    var percent = clamp01(this._curTime / settings.totalTime);
    var u_p = cubicOut(percent);
    var scaleX = 1;
    var scaleY = 1;
    var bgImage = this.bgImage;
    if (settings.background.type === 'custom') {
      if (settings.policy === ResolutionPolicy.FIXED_WIDTH) {
        scaleX = dw;
        scaleY = dw / bgImage.width * bgImage.height;
      } else if (settings.policy === ResolutionPolicy.FIXED_HEIGHT) {
        scaleX = dh / bgImage.height * bgImage.width;
        scaleY = dh;
      } else if (settings.policy === ResolutionPolicy.SHOW_ALL) {
        if (bgImage.width / this.bgHeight > dw / dh) {
          scaleX = dw;
          scaleY = dw / bgImage.width * bgImage.height;
        } else {
          scaleX = dh / bgImage.height * bgImage.width;
          scaleY = dh;
        }
      } else if (settings.policy === ResolutionPolicy.NO_BORDER) {
        if (bgImage.width / bgImage.height > dw / dh) {
          scaleX = dh / bgImage.height * bgImage.width;
          scaleY = dh;
        } else {
          scaleX = dw;
          scaleY = dw / bgImage.width * bgImage.height;
        }
      } else {
        scaleX = dw;
        scaleY = dh;
      }
      var bgMat = this.bgMat;
      setMaterialProperty(bgMat, 'resolution', v2_0.set(dw, dh), 0);
      setMaterialProperty(bgMat, 'scale', v2_0.set(scaleX, scaleY), 0);
      setMaterialProperty(bgMat, 'translate', v2_0.set(dw * 0.5, dh * 0.5), 0);
      setMaterialProperty(bgMat, 'percent', 1.0);
      setMaterialProperty(bgMat, 'u_projection', this.projection);
      bgMat.passes[0].update();
    }
    var logoYTrans = dh * this.logoYTrans;
    if (this.settings.logo.type !== 'none') {
      scaleY = dh * 0.185 * settings.displayRatio;
      scaleX = this.logoWidth * (dh * 0.185 / this.logoHeight) * settings.displayRatio;
      var logoMat = this.logoMat;
      setMaterialProperty(logoMat, 'resolution', v2_0.set(dw, dh), 0);
      setMaterialProperty(logoMat, 'scale', v2_0.set(scaleX, scaleY), 0);
      setMaterialProperty(logoMat, 'translate', v2_0.set(dw * this.logoXTrans, logoYTrans), 0);
      setMaterialProperty(logoMat, 'percent', u_p);
      setMaterialProperty(logoMat, 'u_projection', this.projection);
      logoMat.passes[0].update();
    }
    if (this.settings.logo.type === 'default' && this.watermarkMat) {
      var watermarkTW = this.watermarkTexture.width;
      var watermarkTH = this.watermarkTexture.height;
      scaleX = watermarkTW;
      scaleY = watermarkTH;
      var textYTrans = logoYTrans - (this.logoHeight * 0.5 * settings.displayRatio + this.textYExtraTrans) * this.scaleSize - watermarkTH * 0.5;
      var watermarkMat = this.watermarkMat;
      setMaterialProperty(watermarkMat, 'resolution', v2_0.set(dw, dh), 0);
      setMaterialProperty(watermarkMat, 'scale', v2_0.set(scaleX, scaleY), 0);
      setMaterialProperty(watermarkMat, 'translate', v2_0.set(dw * this.textXTrans, textYTrans), 0);
      setMaterialProperty(watermarkMat, 'percent', u_p);
      setMaterialProperty(watermarkMat, 'u_projection', this.projection);
      watermarkMat.passes[0].update();
    }
    this.frame();
  };
  _proto.initBG = function initBG() {
    var device = this.device;
    this.bgMat = new Material();
    this.bgMat.initialize({
      effectName: 'util/splash-screen'
    });
    var samplerInfo = new SamplerInfo();
    samplerInfo.addressU = Address.CLAMP;
    samplerInfo.addressV = Address.CLAMP;
    samplerInfo.addressW = Address.CLAMP;
    this.sampler = device.getSampler(samplerInfo);
    this.bgTexture = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, Format.RGBA8, this.bgImage.width, this.bgImage.height));
    var pass = this.bgMat.passes[0];
    var binding = pass.getBinding('mainTexture');
    pass.bindTexture(binding, this.bgTexture);
    this.shader = pass.getShaderVariant();
    var descriptorSet = pass.descriptorSet;
    descriptorSet.bindSampler(binding, this.sampler);
    descriptorSet.update();
    var region = new BufferTextureCopy();
    var regionTexExtent = region.texExtent;
    regionTexExtent.width = this.bgImage.width;
    regionTexExtent.height = this.bgImage.height;
    regionTexExtent.depth = 1;
    device.copyTexImagesToTexture([this.bgImage], this.bgTexture, [region]);
  };
  _proto.initLogo = function initLogo() {
    var device = this.device;
    this.logoMat = new Material();
    this.logoMat.initialize({
      effectName: 'util/splash-screen'
    });
    var samplerInfo = new SamplerInfo();
    samplerInfo.addressU = Address.CLAMP;
    samplerInfo.addressV = Address.CLAMP;
    samplerInfo.addressW = Address.CLAMP;
    this.sampler = device.getSampler(samplerInfo);
    this.logoTexture = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, Format.RGBA8, this.logoImage.width, this.logoImage.height));
    var pass = this.logoMat.passes[0];
    var binding = pass.getBinding('mainTexture');
    pass.bindTexture(binding, this.logoTexture);
    this.shader = pass.getShaderVariant();
    var descriptorSet = pass.descriptorSet;
    descriptorSet.bindSampler(binding, this.sampler);
    descriptorSet.update();
    var region = new BufferTextureCopy();
    var regionTexExtent = region.texExtent;
    regionTexExtent.width = this.logoImage.width;
    regionTexExtent.height = this.logoImage.height;
    regionTexExtent.depth = 1;
    device.copyTexImagesToTexture([this.logoImage], this.logoTexture, [region]);
    var logoRatio = this.logoImage.width / this.logoImage.height;
    if (logoRatio < 1) {
      this.logoWidth = this.logoWidthTemp;
      this.logoHeight = this.logoWidthTemp / logoRatio;
    } else {
      this.logoWidth = this.logoHeightTemp * logoRatio;
      this.logoHeight = this.logoHeightTemp;
    }
  };
  _proto.initWaterMark = function initWaterMark() {
    var watermarkImg = ccwindow.document.createElement('canvas');
    watermarkImg.height = this.textHeight * this.scaleSize;
    watermarkImg.style.width = "" + watermarkImg.width;
    watermarkImg.style.height = "" + watermarkImg.height;
    var text = 'Created with Cocos';
    var ctx = watermarkImg.getContext('2d');
    ctx.font = this.textSize * this.scaleSize + "px Arial";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#707070';
    var textLength = ctx.measureText(text).width + 10;
    watermarkImg.width = textLength;
    ctx.font = this.textSize * this.scaleSize + "px Arial";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#707070';
    ctx.fillText(text, watermarkImg.width / 2, 0);
    var region = new BufferTextureCopy();
    var regionTexExtent = region.texExtent;
    regionTexExtent.width = watermarkImg.width;
    regionTexExtent.height = watermarkImg.height;
    regionTexExtent.depth = 1;
    this.watermarkTexture = this.device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, Format.RGBA8, watermarkImg.width, watermarkImg.height));
    this.device.copyTexImagesToTexture([watermarkImg], this.watermarkTexture, [region]);
    this.watermarkMat = new Material();
    this.watermarkMat.initialize({
      effectName: 'util/splash-screen'
    });
    var pass = this.watermarkMat.passes[0];
    var binding = pass.getBinding('mainTexture');
    pass.bindTexture(binding, this.watermarkTexture);
    pass.descriptorSet.update();
  };
  _proto.frame = function frame() {
    var device = this.device,
      swapchain = this.swapchain,
      projection = this.projection,
      bgMat = this.bgMat,
      logoMat = this.logoMat,
      watermarkMat = this.watermarkMat,
      settings = this.settings,
      quadAssmebler = this.quadAssmebler;
    var capabilities = device.capabilities;
    if (!sys.isXR || xr.entry.isRenderAllowable()) {
      var renderSize = sys.isXR ? 2 : 1;
      for (var xrEye = 0; xrEye < renderSize; xrEye++) {
        if (sys.isXR) {
          xr.entry.renderLoopStart(xrEye);
          var xrFov = xr.entry.getEyeFov(xrEye);
          var radioLeft = 1.0;
          var radioRight = 1.0;
          if (xrEye === XREye.LEFT) {
            radioLeft = Math.abs(Math.tan(xrFov[0])) / Math.abs(Math.tan(xrFov[1]));
          } else if (xrEye === XREye.RIGHT) {
            radioRight = Math.abs(Math.tan(xrFov[1])) / Math.abs(Math.tan(xrFov[0]));
          }
          Mat4.ortho(projection, -radioLeft, radioRight, -1, 1, -1, 1, capabilities.clipSpaceMinZ, capabilities.clipSpaceSignY, swapchain.surfaceTransform);
          projection.m00 = preTransforms[swapchain.surfaceTransform][0];
          projection.m05 = preTransforms[swapchain.surfaceTransform][3] * capabilities.clipSpaceSignY;
          if (settings.background.type === 'custom') {
            setMaterialProperty(bgMat, 'u_projection', projection);
            bgMat.passes[0].update();
          }
          if (settings.logo.type !== 'none') {
            setMaterialProperty(logoMat, 'u_projection', projection);
            logoMat.passes[0].update();
          }
          if (settings.logo.type === 'default' && watermarkMat) {
            setMaterialProperty(watermarkMat, 'u_projection', projection);
            watermarkMat.passes[0].update();
          }
        }
        device.enableAutoBarrier(true);
        device.acquire([swapchain]);
        var cmdBuff = this.cmdBuff;
        var framebuffer = cclegacy.director.root.mainWindow.framebuffer;
        var renderArea = this.renderArea;
        renderArea.width = swapchain.width;
        renderArea.height = swapchain.height;
        cmdBuff.begin();
        cmdBuff.beginRenderPass(framebuffer.renderPass, framebuffer, renderArea, this.clearColors, 1.0, 0);
        cclegacy.director.root.pipeline;
        if (settings.background.type === 'custom') {
          var bgPass = bgMat.passes[0];
          var bgPso = PipelineStateManager.getOrCreatePipelineState(device, bgPass, this.shader, framebuffer.renderPass, quadAssmebler);
          cmdBuff.bindPipelineState(bgPso);
          cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, bgPass.descriptorSet);
          cmdBuff.bindInputAssembler(quadAssmebler);
          cmdBuff.draw(quadAssmebler);
        }
        if (settings.logo.type !== 'none') {
          var logoPass = logoMat.passes[0];
          var logoPso = PipelineStateManager.getOrCreatePipelineState(device, logoPass, this.shader, framebuffer.renderPass, quadAssmebler);
          cmdBuff.bindPipelineState(logoPso);
          cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, logoPass.descriptorSet);
          cmdBuff.bindInputAssembler(quadAssmebler);
          cmdBuff.draw(quadAssmebler);
        }
        if (settings.logo.type === 'default' && watermarkMat) {
          var wartermarkPass = this.watermarkMat.passes[0];
          var watermarkPso = PipelineStateManager.getOrCreatePipelineState(device, wartermarkPass, this.shader, framebuffer.renderPass, quadAssmebler);
          cmdBuff.bindPipelineState(watermarkPso);
          cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, wartermarkPass.descriptorSet);
          cmdBuff.bindInputAssembler(quadAssmebler);
          cmdBuff.draw(quadAssmebler);
        }
        cmdBuff.endRenderPass();
        cmdBuff.end();
        device.flushCommands([cmdBuff]);
        device.queue.submit([cmdBuff]);
        device.present();
        device.enableAutoBarrier(!legacyCC.rendering);
        if (sys.isXR) {
          xr.entry.renderLoopEnd(xrEye);
        }
      }
    }
  };
  _proto.destroy = function destroy() {
    this.device = null;
    this.swapchain = null;
    this.clearColors = null;
    if (this.bgImage) {
      if (this.bgImage.destroy) this.bgImage.destroy();
      this.bgImage = null;
    }
    if (this.bgMat) {
      this.bgMat.destroy();
      this.bgMat = null;
    }
    if (this.bgTexture) {
      this.bgTexture.destroy();
      this.bgTexture = null;
    }
    if (this.logoImage) {
      if (this.logoImage.destroy) this.logoImage.destroy();
      this.logoImage = null;
    }
    if (this.logoMat) {
      this.logoMat.destroy();
      this.logoMat = null;
    }
    if (this.logoTexture) {
      this.logoTexture.destroy();
      this.logoTexture = null;
    }
    this.renderArea = null;
    this.cmdBuff = null;
    this.shader = null;
    if (this.quadAssmebler) {
      this.quadAssmebler.destroy();
      this.quadAssmebler = null;
    }
    if (this.vertexBuffers) {
      this.vertexBuffers.destroy();
      this.vertexBuffers = null;
    }
    if (this.indicesBuffers) {
      this.indicesBuffers.destroy();
      this.indicesBuffers = null;
    }
    this.sampler = null;
    if (this.watermarkMat) {
      this.watermarkMat.destroy();
      this.watermarkMat = null;
    }
    if (this.watermarkTexture) {
      this.watermarkTexture.destroy();
      this.watermarkTexture = null;
    }
    this.settings = null;
  };
  SplashScreen.createInstance = function createInstance() {
    SplashScreen._ins = new SplashScreen();
    return SplashScreen._ins;
  };
  SplashScreen.releaseInstance = function releaseInstance() {
    if (SplashScreen._ins) {
      SplashScreen._ins.destroy();
      SplashScreen._ins = null;
    }
  };
  return _createClass(SplashScreen, [{
    key: "isFinished",
    get: function get() {
      return this._curTime >= this.settings.totalTime;
    }
  }, {
    key: "curTime",
    get: function get() {
      return this._curTime;
    },
    set: function set(val) {
      this._curTime = val;
    }
  }], [{
    key: "instance",
    get: function get() {
      return SplashScreen._ins;
    }
  }]);
}();
SplashScreen._ins = null;
cclegacy.internal.SplashScreen = SplashScreen;

var EffectSettings = function () {
  function EffectSettings() {
    this._data = null;
  }
  var _proto = EffectSettings.prototype;
  _proto.init = function init(path) {
    var _this = this;
    if (path === void 0) {
      path = '';
    }
    if (!legacyCC.rendering || !legacyCC.rendering.enableEffectImport || !path) {
      return Promise.resolve();
    }
    return new Promise(function (resolve, reject) {
      {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
          _this._data = xhr.response;
          resolve();
        };
        xhr.onerror = function () {
          reject(new Error('request effect settings failed!'));
        };
        xhr.send(null);
      }
    });
  };
  return _createClass(EffectSettings, [{
    key: "data",
    get: function get() {
      return this._data;
    }
  }]);
}();
var effectSettings = new EffectSettings();
legacyCC.effectSettings = effectSettings;

var querySettings = settings.querySettings.bind(settings);
var Game = function (_EventTarget) {
  function Game() {
    var _this;
    _this = _EventTarget.call(this) || this;
    _this.frame = null;
    _this.container = null;
    _this.canvas = null;
    _this.renderType = -1;
    _this.eventTargetOn = _EventTarget.prototype.on;
    _this.eventTargetOnce = _EventTarget.prototype.once;
    _this.config = {};
    _this.onStart = null;
    _this.frameTime = 1000 / 60;
    _this._isCloning = false;
    _this._inited = false;
    _this._engineInited = false;
    _this._rendererInitialized = false;
    _this._paused = true;
    _this._pausedByEngine = false;
    _this._frameRate = 60;
    _this._pacer = null;
    _this._initTime = 0;
    _this._startTime = 0;
    _this._deltaTime = 0.0;
    _this._useFixedDeltaTime = false;
    _this._shouldLoadLaunchScene = true;
    _this.onPreBaseInitDelegate = new AsyncDelegate();
    _this.onPostBaseInitDelegate = new AsyncDelegate();
    _this.onPreInfrastructureInitDelegate = new AsyncDelegate();
    _this.onPostInfrastructureInitDelegate = new AsyncDelegate();
    _this.onPreSubsystemInitDelegate = new AsyncDelegate();
    _this.onPostSubsystemInitDelegate = new AsyncDelegate();
    _this.onPreProjectInitDelegate = new AsyncDelegate();
    _this.onPostProjectInitDelegate = new AsyncDelegate();
    return _this;
  }
  _inheritsLoose(Game, _EventTarget);
  var _proto = Game.prototype;
  _proto.setFrameRate = function setFrameRate(frameRate) {
    this.frameRate = frameRate;
  };
  _proto.getFrameRate = function getFrameRate() {
    return this.frameRate;
  };
  _proto.step = function step() {
    director.tick(this._calculateDT(true));
  };
  _proto.pauseByEngine = function pauseByEngine() {
    if (this._paused) {
      return;
    }
    this._pausedByEngine = true;
    this.pause();
  };
  _proto.resumeByEngine = function resumeByEngine() {
    if (this._pausedByEngine) {
      this.resume();
      this._pausedByEngine = false;
    }
  };
  _proto.pause = function pause() {
    var _this$_pacer;
    if (this._paused) {
      return;
    }
    this._paused = true;
    (_this$_pacer = this._pacer) == null ? void 0 : _this$_pacer.stop();
    this.emit(Game.EVENT_PAUSE);
  };
  _proto.resume = function resume() {
    var _this$_pacer2;
    if (!this._paused) {
      return;
    }
    input._clearEvents();
    this._paused = false;
    (_this$_pacer2 = this._pacer) == null ? void 0 : _this$_pacer2.start();
    this.emit(Game.EVENT_RESUME);
  };
  _proto.isPaused = function isPaused() {
    return this._paused;
  };
  _proto.restart = function restart() {
    var _this2 = this;
    var endFramePromise = new Promise(function (resolve) {
      director.once(DirectorEvent.END_FRAME, function () {
        return resolve();
      });
    });
    return endFramePromise.then(function () {
      director.reset();
      cclegacy.Object._deferredDestroy();
      _this2.pause();
      _this2.resume();
      _this2._shouldLoadLaunchScene = true;
    }).then(function () {
      {
        return SplashScreen.createInstance().init();
      }
    }).then(function () {
      _this2._safeEmit(Game.EVENT_RESTART);
    });
  };
  _proto.end = function end() {
    systemInfo.close();
  };
  _proto.on = function on(type, callback, target, once) {
    if (this.canRegisterEvent(type)) {
      callback.call(target);
    }
    return this.eventTargetOn(type, callback, target, once);
  };
  _proto.once = function once(type, callback, target) {
    if (this.canRegisterEvent(type)) {
      return callback.call(target);
    }
    return this.eventTargetOnce(type, callback, target);
  };
  _proto.canRegisterEvent = function canRegisterEvent(type) {
    return this._engineInited && type === Game.EVENT_ENGINE_INITED || this._inited && type === Game.EVENT_GAME_INITED || this._rendererInitialized && type === Game.EVENT_RENDERER_INITED;
  };
  _proto.init = function init(config) {
    var _this3 = this;
    this._compatibleWithOldParams(config);
    return Promise.resolve().then(function () {
      _this3.emit(Game.EVENT_PRE_BASE_INIT);
      return _this3.onPreBaseInitDelegate.dispatch();
    }).then(function () {
      {
        console.time('Init Base');
      }
      var debugMode = config.debugMode || DebugMode.NONE;
      _resetDebugSetting(debugMode);
    }).then(function () {
      return sys.init();
    }).then(function () {
      _this3._initEvents();
    }).then(function () {
      return settings.init(config.settingsPath, config.overrideSettings);
    }).then(function () {
      {
        console.timeEnd('Init Base');
      }
      _this3.emit(Game.EVENT_POST_BASE_INIT);
      return _this3.onPostBaseInitDelegate.dispatch();
    }).then(function () {
      _this3.emit(Game.EVENT_PRE_INFRASTRUCTURE_INIT);
      return _this3.onPreInfrastructureInitDelegate.dispatch();
    }).then(function () {
      {
        console.time('Init Infrastructure');
      }
      macro.init();
      _this3._initXR();
      var adapter = findCanvas();
      if (adapter) {
        _this3.canvas = adapter.canvas;
        _this3.frame = adapter.frame;
        _this3.container = adapter.container;
      }
      screen.init();
      garbageCollectionManager.init();
      return deviceManager.init(_this3.canvas, bindingMappingInfo);
    }).then(function () {
      var usesCustomPipeline = querySettings(SettingsCategory.RENDERING, 'customPipeline');
      if (usesCustomPipeline) {
        if (!cclegacy.rendering) {
          errorID(12109);
          return;
        }
        if (!macro.CUSTOM_PIPELINE_NAME) {
          macro.CUSTOM_PIPELINE_NAME = 'Builtin';
        }
      } else {
        cclegacy.rendering = undefined;
      }
      assetManager.init();
      builtinResMgr.init();
      Layers.init();
      _this3.initPacer();
      {
        console.timeEnd('Init Infrastructure');
      }
    }).then(function () {
      _this3.emit(Game.EVENT_POST_INFRASTRUCTURE_INIT);
      return _this3.onPostInfrastructureInitDelegate.dispatch();
    }).then(function () {
      _this3.emit(Game.EVENT_PRE_SUBSYSTEM_INIT);
      return _this3.onPreSubsystemInitDelegate.dispatch();
    }).then(function () {
      return effectSettings.init(querySettings(SettingsCategory.RENDERING, 'effectSettingsPath'));
    }).then(function () {
      if (!cclegacy.rendering || !cclegacy.rendering.enableEffectImport) {
        return;
      }
      var renderMode = querySettings(SettingsCategory.RENDERING, 'renderMode');
      if (renderMode === LegacyRenderMode.HEADLESS) {
        cclegacy.rendering.init(deviceManager.gfxDevice, null);
        return;
      }
      var data = effectSettings.data;
      if (data === null) {
        errorID(1102);
        return;
      }
      cclegacy.rendering.init(deviceManager.gfxDevice, data);
    }).then(function () {
      var scriptPackages = querySettings(SettingsCategory.SCRIPTING, 'scriptPackages');
      if (scriptPackages) {
        return Promise.all(scriptPackages.map(function (pack) {
          return import(pack);
        }));
      }
      return Promise.resolve([]);
    }).then(function () {
      {
        console.time('Init SubSystem');
      }
      director.init();
      return builtinResMgr.loadBuiltinAssets();
    }).then(function () {
      {
        console.timeEnd('Init SubSystem');
      }
      _this3.emit(Game.EVENT_POST_SUBSYSTEM_INIT);
      return _this3.onPostSubsystemInitDelegate.dispatch();
    }).then(function () {
      log("Cocos Creator v" + engineVersion);
      _this3.emit(Game.EVENT_ENGINE_INITED);
      _this3._engineInited = true;
    }).then(function () {
      _this3.emit(Game.EVENT_PRE_PROJECT_INIT);
      return _this3.onPreProjectInitDelegate.dispatch();
    }).then(function () {
      {
        console.time('Init Project');
      }
      var jsList = querySettings(SettingsCategory.PLUGINS, 'jsList');
      var promise = Promise.resolve();
      if (jsList) {
        jsList.forEach(function (jsListFile) {
          promise = promise.then(function () {
            return loadJsFile(('plugins' ) + "/" + jsListFile);
          });
        });
      }
      return promise;
    }).then(function () {
      return _this3._loadProjectBundles();
    }).then(function () {
      return _this3._loadCCEScripts();
    }).then(function () {
      return _this3._setupRenderPipeline();
    }).then(function () {
      return _this3._loadPreloadAssets();
    }).then(function () {
      builtinResMgr.compileBuiltinMaterial();
      return SplashScreen.createInstance().init();
    }).then(function () {
      {
        console.timeEnd('Init Project');
      }
      _this3.emit(Game.EVENT_POST_PROJECT_INIT);
      return _this3.onPostProjectInitDelegate.dispatch();
    }).then(function () {
      _this3._inited = true;
      _this3._safeEmit(Game.EVENT_GAME_INITED);
    });
  };
  _proto._initXR = function _initXR() {
    var _querySettings;
    if (typeof globalThis.__globalXR === 'undefined') {
      globalThis.__globalXR = {};
    }
    var globalXR = globalThis.__globalXR;
    globalXR.webxrCompatible = (_querySettings = querySettings(SettingsCategory.XR, 'webxrCompatible')) !== null && _querySettings !== void 0 ? _querySettings : false;
    if (sys.isXR) {
      var _querySettings2, _querySettings3;
      xr.entry = xr.XrEntry.getInstance();
      var xrMSAA = (_querySettings2 = querySettings(SettingsCategory.RENDERING, 'msaa')) !== null && _querySettings2 !== void 0 ? _querySettings2 : 1;
      var xrRenderingScale = (_querySettings3 = querySettings(SettingsCategory.RENDERING, 'renderingScale')) !== null && _querySettings3 !== void 0 ? _querySettings3 : 1.0;
      xr.entry.setMultisamplesRTT(xrMSAA);
      xr.entry.setRenderingScale(xrRenderingScale);
    }
  };
  _proto._compatibleWithOldParams = function _compatibleWithOldParams(config) {
    var overrideSettings = config.overrideSettings = config.overrideSettings || {};
    if ('showFPS' in config) {
      overrideSettings.profiling = overrideSettings.profiling || {};
      overrideSettings.profiling.showFPS = config.showFPS;
    }
    if ('frameRate' in config) {
      overrideSettings.screen = overrideSettings.screen || {};
      overrideSettings.screen.frameRate = config.frameRate;
    }
    if ('renderMode' in config) {
      overrideSettings.rendering = overrideSettings.rendering || {};
      overrideSettings.rendering.renderMode = config.renderMode;
    }
    if ('renderPipeline' in config) {
      overrideSettings.rendering = overrideSettings.rendering || {};
      overrideSettings.rendering.renderPipeline = config.renderPipeline;
    }
    if ('assetOptions' in config) {
      overrideSettings.assets = overrideSettings.assets || {};
      Object.assign(overrideSettings.assets, config.assetOptions);
    }
    if ('customJointTextureLayouts' in config) {
      overrideSettings.animation = overrideSettings.animation || {};
      overrideSettings.animation.customJointTextureLayouts = config.customJointTextureLayouts;
    }
    if ('physics' in config) {
      overrideSettings.physics = overrideSettings.physics || {};
      Object.assign(overrideSettings.physics, config.physics);
    }
    if ('orientation' in config) {
      overrideSettings.screen = overrideSettings.screen || {};
      overrideSettings.screen.orientation = config.orientation;
    }
    if ('exactFitScreen' in config) {
      overrideSettings.screen = overrideSettings.screen || {};
      overrideSettings.screen.exactFitScreen = config.exactFitScreen;
    }
  };
  _proto._loadPreloadAssets = function _loadPreloadAssets() {
    var preloadAssets = querySettings(SettingsCategory.ASSETS, 'preloadAssets');
    if (!preloadAssets) return Promise.resolve([]);
    return Promise.all(preloadAssets.map(function (uuid) {
      return new Promise(function (resolve, reject) {
        assetManager.loadAny(uuid, function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }));
  };
  _proto._loadCCEScripts = function _loadCCEScripts() {
    return new Promise(function (resolve, reject) {
      {
        var bundleName = 'cce:/internal/x/prerequisite-imports';
        import(bundleName).then(function () {
          return resolve();
        }, function (reason) {
          return reject(reason);
        });
      }
    });
  };
  _proto._loadProjectBundles = function _loadProjectBundles() {
    var preloadBundles = querySettings(SettingsCategory.ASSETS, 'preloadBundles');
    if (!preloadBundles) return Promise.resolve([]);
    return Promise.all(preloadBundles.map(function (_ref) {
      var bundle = _ref.bundle,
        version = _ref.version;
      return new Promise(function (resolve, reject) {
        var opts = {};
        if (version) opts.version = version;
        assetManager.loadBundle(bundle, opts, function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }));
  };
  _proto.run = function run(onStart) {
    if (onStart) {
      this.onStart = onStart;
    }
    if (!this._inited || EDITOR_NOT_IN_PREVIEW) {
      return;
    }
    this.resume();
  };
  _proto._calculateDT = function _calculateDT(useFixedDeltaTime) {
    this._useFixedDeltaTime = useFixedDeltaTime;
    if (useFixedDeltaTime) {
      this._startTime = performance.now();
      return this.frameTime / 1000;
    }
    var now = performance.now();
    this._deltaTime = now > this._startTime ? (now - this._startTime) / 1000 : 0;
    if (this._deltaTime > Game.DEBUG_DT_THRESHOLD) {
      this._deltaTime = this.frameTime / 1000;
    }
    this._startTime = now;
    return this._deltaTime;
  };
  _proto._updateCallback = function _updateCallback() {
    var _this4 = this;
    if (!this._inited) return;
    if (SplashScreen.instance && !SplashScreen.instance.isFinished) {
      SplashScreen.instance.update(this._calculateDT(false));
    } else if (this._shouldLoadLaunchScene) {
      {
        SplashScreen.releaseInstance();
      }
      this._shouldLoadLaunchScene = false;
      var launchScene = querySettings(SettingsCategory.LAUNCH, 'launchScene');
      if (launchScene) {
        director.loadScene(launchScene, function () {
          logID(1103, launchScene);
          _this4._initTime = performance.now();
          director.startAnimation();
          _this4.onStart == null ? void 0 : _this4.onStart();
        });
      } else {
        var _this$onStart;
        this._initTime = performance.now();
        director.startAnimation();
        (_this$onStart = this.onStart) == null ? void 0 : _this$onStart.call(this);
      }
    } else {
      director.tick(this._calculateDT(false));
    }
  };
  _proto.initPacer = function initPacer() {
    var _querySettings4;
    var frameRate = (_querySettings4 = querySettings(SettingsCategory.SCREEN, 'frameRate')) !== null && _querySettings4 !== void 0 ? _querySettings4 : 60;
    assert(typeof frameRate === 'number');
    this._pacer = new Pacer();
    this._pacer.onTick = this._updateCallback.bind(this);
    this.frameRate = frameRate;
  };
  _proto._initEvents = function _initEvents() {
    systemInfo.on('show', this._onShow, this);
    systemInfo.on('hide', this._onHide, this);
    systemInfo.on('close', this._onClose, this);
  };
  _proto._onHide = function _onHide() {
    this.emit(Game.EVENT_HIDE);
    this.pauseByEngine();
  };
  _proto._onShow = function _onShow() {
    this.emit(Game.EVENT_SHOW);
    this.resumeByEngine();
  };
  _proto._onClose = function _onClose() {
    this.emit(Game.EVENT_CLOSE);
    systemInfo.exit();
  };
  _proto.addPersistRootNode = function addPersistRootNode(node) {
    director.addPersistRootNode(node);
  };
  _proto.removePersistRootNode = function removePersistRootNode(node) {
    director.removePersistRootNode(node);
  };
  _proto.isPersistRootNode = function isPersistRootNode(node) {
    return director.isPersistRootNode(node);
  };
  _proto._setupRenderPipeline = function _setupRenderPipeline() {
    var usesCustomPipeline = querySettings(SettingsCategory.RENDERING, 'customPipeline');
    return this._setRenderPipeline(!!usesCustomPipeline);
  };
  _proto._setRenderPipeline = function _setRenderPipeline(customPipeline) {
    if (!director.root.setRenderPipeline(customPipeline)) {
      errorID(1222);
      return;
    }
    this._rendererInitialized = true;
    this._safeEmit(Game.EVENT_RENDERER_INITED);
  };
  _proto._safeEmit = function _safeEmit(event) {
    {
      this.emit(event);
    }
  };
  return _createClass(Game, [{
    key: "inited",
    get: function get() {
      return this._inited;
    }
  }, {
    key: "frameRate",
    get: function get() {
      return this._frameRate;
    },
    set: function set(frameRate) {
      if (typeof frameRate !== 'number') {
        frameRate = parseInt(frameRate, 10);
        if (Number.isNaN(frameRate)) {
          frameRate = 60;
        }
      }
      this._frameRate = frameRate;
      this.frameTime = 1000 / frameRate;
      if (this._pacer) this._pacer.targetFrameRate = this._frameRate;
    }
  }, {
    key: "deltaTime",
    get: function get() {
      return this._useFixedDeltaTime ? this.frameTime / 1000 : this._deltaTime;
    }
  }, {
    key: "totalTime",
    get: function get() {
      return performance.now() - this._initTime;
    }
  }, {
    key: "frameStartTime",
    get: function get() {
      return this._startTime;
    }
  }]);
}(EventTarget);
Game.EVENT_HIDE = 'game_on_hide';
Game.EVENT_SHOW = 'game_on_show';
Game.EVENT_LOW_MEMORY = 'game_on_low_memory';
Game.EVENT_GAME_INITED = 'game_inited';
Game.EVENT_ENGINE_INITED = 'engine_inited';
Game.EVENT_RENDERER_INITED = 'renderer_inited';
Game.EVENT_PRE_BASE_INIT = 'pre_base_init';
Game.EVENT_POST_BASE_INIT = 'post_base_init';
Game.EVENT_PRE_INFRASTRUCTURE_INIT = 'pre_infrastructure_init';
Game.EVENT_POST_INFRASTRUCTURE_INIT = 'post_infrastructure_init';
Game.EVENT_PRE_SUBSYSTEM_INIT = 'pre_subsystem_init';
Game.EVENT_POST_SUBSYSTEM_INIT = 'post_subsystem_init';
Game.EVENT_PRE_PROJECT_INIT = 'pre_project_init';
Game.EVENT_POST_PROJECT_INIT = 'post_project_init';
Game.EVENT_RESTART = 'game_on_restart';
Game.EVENT_PAUSE = 'game_on_pause';
Game.EVENT_RESUME = 'game_on_resume';
Game.EVENT_CLOSE = 'game_on_close';
Game.RENDER_TYPE_CANVAS = 0;
Game.RENDER_TYPE_WEBGL = 1;
Game.RENDER_TYPE_OPENGL = 2;
Game.RENDER_TYPE_HEADLESS = 3;
Game.DEBUG_DT_THRESHOLD = 1;
cclegacy.Game = Game;
var game = cclegacy.game = new Game();

markAsWarning(Director.prototype, 'director', [{
  name: 'calculateDeltaTime'
}, {
  name: 'getDeltaTime',
  suggest: 'Use game.deltaTime instead'
}, {
  name: 'getTotalTime',
  suggest: 'Use game.totalTime instead'
}, {
  name: 'getCurrentTime',
  suggest: 'Use game.frameStartTime instead'
}]);
removeProperty(Director.prototype, 'director', [{
  name: 'setAnimationInterval',
  suggest: 'please use game.frameRate instead'
}, {
  name: 'getAnimationInterval',
  suggest: 'please use game.frameRate instead'
}, {
  name: 'getRunningScene',
  suggest: 'please use getScene instead'
}, {
  name: 'setDepthTest',
  suggest: 'please use camera API instead'
}, {
  name: 'setClearColor',
  suggest: 'please use camera API instead'
}, {
  name: 'getWinSize',
  suggest: 'please use view.getVisibleSize instead'
}, {
  name: 'getWinSizeInPixels'
}, {
  name: 'purgeCachedData',
  suggest: 'please use assetManager.releaseAll instead'
}, {
  name: 'convertToGL'
}, {
  name: 'convertToUI'
}]);
replaceProperty(director, 'director', [{
  name: '_getSceneUuid',
  targetName: 'assetManager.main',
  newName: 'getSceneInfo',
  customFunction: function customFunction(sceneName) {
    if (assetManager.main) {
      var _assetManager$main$ge;
      return (_assetManager$main$ge = assetManager.main.getSceneInfo(sceneName)) == null ? void 0 : _assetManager$main$ge.uuid;
    }
    return '';
  }
}]);
markAsWarning(game, 'game', [{
  name: 'collisionMatrix'
}, {
  name: 'groupList'
}]);
replaceProperty(game, 'game', [{
  name: '_sceneInfos',
  targetName: 'assetManager.main',
  newName: 'getSceneInfo',
  customGetter: function customGetter() {
    var scenes = [];
    if (assetManager.main) {
      assetManager.main.config.scenes.forEach(function (val) {
        scenes.push(val);
      });
    }
    return scenes;
  }
}]);

export { Game as G, ResolutionPolicy as R, View as V, game as g, view as v };
//# sourceMappingURL=deprecated-Dswa7XeN.js.map
