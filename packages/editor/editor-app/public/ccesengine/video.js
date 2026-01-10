import { m as downloader, n as factory } from './scene-vWcxM1_c.js';
import { _ as _inheritsLoose, a as _createClass, L as log, E as Enum, Q as error, B as BrowserType, e as warn, a4 as OS, X as contains, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import { c as ccclass, b as applyDecoratedInitializer, s as serializable, w as mat4, n as sys, o as screen, N as visibleRect, O as screenAdapter, t as type, a as clamp, r as requireComponent, i as replaceProperty } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { a as ccwindow, l as legacyCC } from './global-exports-DnCP_14L.js';
import './debug-view-BuNhRPv_.js';
import { A as Asset, E as EventHandler, C as Component } from './node-event-Ccvtv8bJ.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './sprite-renderer-C7_6H1N4.js';
import { i as UITransform } from './ui-renderer-JpGcj-VM.js';
import { g as game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import './device-manager-CBXP-ttm.js';
import { C as ClearFlagBit } from './buffer-barrier-BlQXg9Aa.js';
import './touch-BKrZ-fxl.js';
import './camera-component-BFt9vSC_.js';
import './deprecated-n0w4kK7g.js';
import './sprite-frame-DHXMUUT-.js';
import './create-mesh-CfKC5EQd.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './sorting-layers-BHqhkSbY.js';

var _dec$1, _class$1, _class2$1, _initializer$1;
var VideoClip = (_dec$1 = ccclass('cc.VideoClip'), _dec$1(_class$1 = (_class2$1 = function (_Asset) {
  function VideoClip() {
    var _this;
    _this = _Asset.call(this) || this;
    _this._duration = _initializer$1 && _initializer$1();
    _this._video = null;
    return _this;
  }
  _inheritsLoose(VideoClip, _Asset);
  return _createClass(VideoClip, [{
    key: "_nativeAsset",
    get: function get() {
      return this._video;
    },
    set: function set(clip) {
      this._video = clip;
      if (clip) {
        this._duration = clip.duration;
      } else {
        this._duration = 0;
      }
    }
  }]);
}(Asset), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_duration", [serializable], function () {
  return 0;
}), _class2$1)) || _class$1);

var ccdocument$1 = ccwindow.document;
function downloadVideo(url, options, onComplete) {
  var video = ccdocument$1.createElement('video');
  var source = ccdocument$1.createElement('source');
  video.appendChild(source);
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.responseType = 'blob';
  req.onload = function onload() {
    if (this.status === 200 || this.status === 0) {
      source.src = URL.createObjectURL(this.response);
      onComplete(null, video);
    } else {
      onComplete(new Error(req.status + "(no response)"));
    }
  };
  req.onerror = function onerror() {
    var message = "load video failure - " + url;
    log(message);
    onComplete(new Error(message));
  };
  req.send();
}
function createVideoClip(id, data, options, onComplete) {
  var out = new VideoClip();
  out._nativeUrl = id;
  out._nativeAsset = data;
  onComplete(null, out);
}
downloader.register({
  '.mp4': downloadVideo,
  '.avi': downloadVideo,
  '.mov': downloadVideo,
  '.mpg': downloadVideo,
  '.mpeg': downloadVideo,
  '.rm': downloadVideo,
  '.rmvb': downloadVideo
});
factory.register({
  '.mp4': createVideoClip,
  '.avi': createVideoClip,
  '.mov': createVideoClip,
  '.mpg': createVideoClip,
  '.mpeg': createVideoClip,
  '.rm': createVideoClip,
  '.rmvb': createVideoClip
});

var ResourceType = Enum({
  REMOTE: 0,
  LOCAL: 1
});
var VideoPlayerEventType;
(function (VideoPlayerEventType) {
  VideoPlayerEventType["NONE"] = "none";
  VideoPlayerEventType["PLAYING"] = "playing";
  VideoPlayerEventType["PAUSED"] = "paused";
  VideoPlayerEventType["STOPPED"] = "stopped";
  VideoPlayerEventType["COMPLETED"] = "completed";
  VideoPlayerEventType["META_LOADED"] = "meta-loaded";
  VideoPlayerEventType["READY_TO_PLAY"] = "ready-to-play";
  VideoPlayerEventType["ERROR"] = "error";
  VideoPlayerEventType["CLICKED"] = "clicked";
})(VideoPlayerEventType || (VideoPlayerEventType = {}));
var READY_STATE;
(function (READY_STATE) {
  READY_STATE[READY_STATE["HAVE_NOTHING"] = 0] = "HAVE_NOTHING";
  READY_STATE[READY_STATE["HAVE_METADATA"] = 1] = "HAVE_METADATA";
  READY_STATE[READY_STATE["HAVE_CURRENT_DATA"] = 2] = "HAVE_CURRENT_DATA";
  READY_STATE[READY_STATE["HAVE_FUTURE_DATA"] = 3] = "HAVE_FUTURE_DATA";
  READY_STATE[READY_STATE["HAVE_ENOUGH_DATA"] = 4] = "HAVE_ENOUGH_DATA";
})(READY_STATE || (READY_STATE = {}));

var VideoPlayerImpl = function () {
  function VideoPlayerImpl(component) {
    var _this = this;
    this._componentEventList = new Map();
    this._state = VideoPlayerEventType.NONE;
    this._video = null;
    this._onInterruptedBegin = void 0;
    this._onInterruptedEnd = void 0;
    this._interrupted = false;
    this._loaded = false;
    this._loadedMeta = false;
    this._ignorePause = false;
    this._fullScreenOnAwake = false;
    this._visible = true;
    this._playing = false;
    this._cachedCurrentTime = -1;
    this._waitingFullscreen = false;
    this._waitingPlay = false;
    this._keepAspectRatio = false;
    this._component = null;
    this._uiTrans = null;
    this._node = null;
    this._stayOnBottom = false;
    this._dirty = false;
    this._forceUpdate = false;
    this._w = 0;
    this._h = 0;
    this._m00 = 0;
    this._m01 = 0;
    this._m04 = 0;
    this._m05 = 0;
    this._m12 = 0;
    this._m13 = 0;
    this._component = component;
    this._node = component.node;
    this._uiTrans = component.node.getComponent(UITransform);
    this._onInterruptedBegin = function () {
      if (!_this.video || _this._state !== VideoPlayerEventType.PLAYING) {
        return;
      }
      _this.video.pause();
      _this._interrupted = true;
    };
    this._onInterruptedEnd = function () {
      if (!_this._interrupted || !_this.video) {
        return;
      }
      _this.video.play();
      _this._interrupted = false;
    };
    legacyCC.game.on(legacyCC.Game.EVENT_PAUSE, this._onInterruptedBegin);
    legacyCC.game.on(legacyCC.Game.EVENT_RESUME, this._onInterruptedEnd);
  }
  var _proto = VideoPlayerImpl.prototype;
  _proto.onLoadedMetadata = function onLoadedMetadata(e) {
    this._loadedMeta = true;
    this._forceUpdate = true;
    if (this._visible) {
      this.enable();
    } else {
      this.disable();
    }
    this.dispatchEvent(VideoPlayerEventType.META_LOADED);
    var video = e.target;
    if (this._keepAspectRatio && video) {
      this.syncUITransform(video.videoWidth, video.videoHeight);
    }
    this.delayedFullScreen();
    this.delayedPlay();
  };
  _proto.onCanPlay = function onCanPlay(e) {
    this._loaded = true;
    this.dispatchEvent(VideoPlayerEventType.READY_TO_PLAY);
  };
  _proto.onPlay = function onPlay(e) {
    this._playing = true;
    this.dispatchEvent(VideoPlayerEventType.PLAYING);
  };
  _proto.onPlaying = function onPlaying(e) {
    this.dispatchEvent(VideoPlayerEventType.PLAYING);
  };
  _proto.onPause = function onPause(e) {
    this._playing = false;
    if (this._ignorePause) {
      this._ignorePause = false;
      return;
    }
    this.dispatchEvent(VideoPlayerEventType.PAUSED);
  };
  _proto.onStoped = function onStoped(e) {
    this._playing = false;
    this._ignorePause = false;
    this.dispatchEvent(VideoPlayerEventType.STOPPED);
  };
  _proto.onEnded = function onEnded(e) {
    this._playing = false;
    this.dispatchEvent(VideoPlayerEventType.COMPLETED);
  };
  _proto.onClick = function onClick(e) {
    this.dispatchEvent(VideoPlayerEventType.CLICKED);
  };
  _proto.onError = function onError(e) {
    this.dispatchEvent(VideoPlayerEventType.ERROR);
    var video = e.target;
    if (video && video.error) {
      error("Error " + video.error.code + "; details: " + video.error.message);
    }
  };
  _proto.play = function play() {
    if (this._loadedMeta || this._loaded) {
      this.canPlay();
    } else {
      this._waitingPlay = true;
    }
  };
  _proto.delayedPlay = function delayedPlay() {
    if (this._waitingPlay) {
      this.canPlay();
      this._waitingPlay = false;
    }
  };
  _proto.syncFullScreenOnAwake = function syncFullScreenOnAwake(enabled) {
    this._fullScreenOnAwake = enabled;
    if (this._loadedMeta || this._loaded) {
      this.canFullScreen(enabled);
    } else {
      this._waitingFullscreen = true;
    }
  };
  _proto.delayedFullScreen = function delayedFullScreen() {
    if (this._waitingFullscreen) {
      this.canFullScreen(this._fullScreenOnAwake);
      this._waitingFullscreen = false;
    }
  };
  _proto.dispatchEvent = function dispatchEvent(key) {
    var callback = this._componentEventList.get(key);
    if (callback) {
      this._state = key;
      callback.call(this);
    }
  };
  _proto.syncUITransform = function syncUITransform(width, height) {
    var uiTrans = this._uiTrans;
    if (uiTrans) {
      uiTrans.width = width;
      uiTrans.height = height;
    }
  };
  _proto.syncCurrentTime = function syncCurrentTime() {
    if (!this.video) {
      return;
    }
    if (this._cachedCurrentTime !== -1 && this.video.currentTime !== this._cachedCurrentTime) {
      this.seekTo(this._cachedCurrentTime);
      this._cachedCurrentTime = -1;
    }
  };
  _proto.destroy = function destroy() {
    this.removeVideoPlayer();
    this._componentEventList.clear();
    legacyCC.game.off(legacyCC.Game.EVENT_PAUSE, this._onInterruptedBegin);
    legacyCC.game.off(legacyCC.Game.EVENT_RESUME, this._onInterruptedEnd);
  };
  return _createClass(VideoPlayerImpl, [{
    key: "fullScreenOnAwake",
    get: function get() {
      return this._fullScreenOnAwake;
    }
  }, {
    key: "loaded",
    get: function get() {
      return this._loaded;
    }
  }, {
    key: "componentEventList",
    get: function get() {
      return this._componentEventList;
    }
  }, {
    key: "video",
    get: function get() {
      return this._video;
    }
  }, {
    key: "state",
    get: function get() {
      return this._state;
    }
  }, {
    key: "isPlaying",
    get: function get() {
      return this._playing;
    }
  }, {
    key: "UICamera",
    get: function get() {
      return director.root.batcher2D.getFirstRenderCamera(this._node);
    }
  }]);
}();
legacyCC.internal.VideoPlayerImpl = VideoPlayerImpl;

var ccdocument = ccwindow.document;
var MIN_ZINDEX = -Math.pow(2, 15);
var _mat4_temp = mat4();
var VideoPlayerImplWeb = function (_VideoPlayerImpl) {
  function VideoPlayerImplWeb(component) {
    var _this;
    _this = _VideoPlayerImpl.call(this, component) || this;
    _this._eventList = new Map();
    _this._clearColorA = -1;
    _this._clearFlag = void 0;
    return _this;
  }
  _inheritsLoose(VideoPlayerImplWeb, _VideoPlayerImpl);
  var _proto = VideoPlayerImplWeb.prototype;
  _proto.addListener = function addListener(type, handler) {
    if (!this._video) {
      return;
    }
    this._eventList.set(type, handler);
    this._video.addEventListener(type, handler);
  };
  _proto.removeAllListeners = function removeAllListeners() {
    var _this2 = this;
    this._eventList.forEach(function (handler, type) {
      if (!_this2._video) {
        return;
      }
      _this2._video.removeEventListener(type, handler);
    });
    this._eventList.clear();
  };
  _proto.canPlay = function canPlay() {
    var _this3 = this;
    if (this.video) {
      var promise = this.video.play();
      if (ccwindow.Promise && promise instanceof Promise) {
        promise["catch"](function (error) {}).then(function () {
          _this3.syncCurrentTime();
        });
      }
    }
  };
  _proto.pause = function pause() {
    if (this.video) {
      this.video.pause();
      this._cachedCurrentTime = this.video.currentTime;
    }
  };
  _proto.resume = function resume() {
    this.play();
  };
  _proto.stop = function stop() {
    var _this4 = this;
    if (this.video) {
      this._ignorePause = true;
      this.video.currentTime = 0;
      this.video.pause();
      this._cachedCurrentTime = 0;
      setTimeout(function () {
        _this4._ignorePause = false;
        _this4.dispatchEvent(VideoPlayerEventType.STOPPED);
      }, 0);
    }
  };
  _proto.syncClip = function syncClip(clip) {
    this.removeVideoPlayer();
    if (!clip) {
      return;
    }
    this.createVideoPlayer(clip.nativeUrl);
  };
  _proto.syncURL = function syncURL(url) {
    this.removeVideoPlayer();
    if (!url) {
      return;
    }
    this.createVideoPlayer(url);
  };
  _proto.syncPlaybackRate = function syncPlaybackRate(val) {
    if (sys.browserType === BrowserType.UC) {
      warn('playbackRate is not supported by the uc mobile browser.');
      return;
    }
    if (this.video) {
      this.video.playbackRate = val;
    }
  };
  _proto.syncVolume = function syncVolume(val) {
    if (this.video) {
      this.video.volume = val;
    }
  };
  _proto.syncMute = function syncMute(enabled) {
    if (this.video) {
      this.video.muted = enabled;
    }
  };
  _proto.syncLoop = function syncLoop(enabled) {
    if (this.video) {
      this.video.loop = enabled;
    }
  };
  _proto.getDuration = function getDuration() {
    if (!this.video) {
      return 0;
    }
    return this.video.duration;
  };
  _proto.getCurrentTime = function getCurrentTime() {
    if (this.video) {
      return this.video.currentTime;
    }
    return -1;
  };
  _proto.seekTo = function seekTo(val) {
    if (this.video) {
      this.video.currentTime = val;
      this._cachedCurrentTime = this.video.currentTime;
    }
  };
  _proto.canFullScreen = function canFullScreen(enabled) {
    var _this5 = this;
    var video = this._video;
    if (!video || video.readyState !== READY_STATE.HAVE_ENOUGH_DATA) {
      return;
    }
    if (sys.os === OS.IOS && sys.isBrowser) {
      if (enabled) {
        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } else if (video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      }
      this._fullScreenOnAwake = video.webkitDisplayingFullscreen;
      return;
    }
    if (!screen.supportsFullScreen) {
      this._fullScreenOnAwake = enabled;
      this._forceUpdate = true;
      this.syncMatrix();
      return;
    }
    if (enabled) {
      if (sys.browserType === BrowserType.IE) {
        video.style.transform = '';
      }
      video.setAttribute('x5-video-player-fullscreen', 'true');
      screen.requestFullScreen(video, function (document) {
        var fullscreenElement = sys.browserType === BrowserType.IE ? document.msFullscreenElement : document.fullscreenElement;
        _this5._fullScreenOnAwake = fullscreenElement === video;
      }, function () {
        _this5._fullScreenOnAwake = false;
      });
    } else {
      video.removeAttribute('x5-video-player-fullscreen');
      screen.exitFullScreen();
    }
  };
  _proto.syncStayOnBottom = function syncStayOnBottom(enabled) {
    if (this._video) {
      this._video.style['z-index'] = enabled ? MIN_ZINDEX : 0;
      this._stayOnBottom = enabled;
    }
    this._dirty = true;
  };
  _proto.syncKeepAspectRatio = function syncKeepAspectRatio(enabled) {
    this._keepAspectRatio = enabled;
    if (enabled && this._loadedMeta && this._video) {
      this.syncUITransform(this._video.videoWidth, this._video.videoHeight);
    }
  };
  _proto.removeVideoPlayer = function removeVideoPlayer() {
    var video = this._video;
    if (video) {
      if (contains(game.container, video)) {
        game.container.removeChild(video);
        this.removeAllListeners();
      }
    }
    this._cachedCurrentTime = 0;
    this._playing = false;
    this._loaded = false;
    this._loadedMeta = false;
    this._video = null;
  };
  _proto.createVideoPlayer = function createVideoPlayer(url) {
    var video = this._video = ccdocument.createElement('video');
    video.className = 'cocosVideo';
    video.style.visibility = 'hidden';
    video.style.position = 'absolute';
    video.style.bottom = '0px';
    video.style.left = '0px';
    video.style['transform-origin'] = '0px 100% 0px';
    video.style['-webkit-transform-origin'] = '0px 100% 0px';
    video.setAttribute('preload', 'auto');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('x5-playsinline', '');
    video.setAttribute('playsinline', '');
    this._bindDomEvent();
    game.container.appendChild(video);
    var source = ccdocument.createElement('source');
    video.appendChild(source);
    source.src = url;
  };
  _proto._bindDomEvent = function _bindDomEvent() {
    this._video;
    this.addListener('loadedmetadata', this.onLoadedMetadata.bind(this));
    this.addListener('canplay', this.onCanPlay.bind(this));
    this.addListener('canplaythrough', this.onCanPlay.bind(this));
    this.addListener('play', this.onPlay.bind(this));
    this.addListener('playing', this.onPlaying.bind(this));
    this.addListener('pause', this.onPause.bind(this));
    this.addListener('click', this.onClick.bind(this));
    this.addListener('ended', this.onEnded.bind(this));
    this.addListener('error', this.onError.bind(this));
  };
  _proto.onCanPlay = function onCanPlay(e) {
    var video = e.target;
    if (this._loaded && video) {
      return;
    }
    switch (video.readyState) {
      case READY_STATE.HAVE_METADATA:
      case READY_STATE.HAVE_ENOUGH_DATA:
        {
          _VideoPlayerImpl.prototype.onCanPlay.call(this, e);
          break;
        }
    }
  };
  _proto.enable = function enable() {
    if (this._video) {
      this._visible = true;
      if (this._video.style.visibility === 'visible') {
        return;
      }
      this._video.style.visibility = 'visible';
    }
  };
  _proto.disable = function disable(noPause) {
    if (this._video) {
      if (!noPause && this._playing) {
        this._video.pause();
      }
      this._visible = false;
      if (this._video.style.visibility === 'hidden') {
        return;
      }
      this._video.style.visibility = 'hidden';
    }
  };
  _proto.syncMatrix = function syncMatrix() {
    if (!this._video || !this._visible || !this._component) return;
    var camera = this.UICamera;
    if (!camera) {
      return;
    }
    if (this._dirty) {
      this._dirty = false;
      if (this._stayOnBottom) {
        this._clearColorA = camera.clearColor.w;
        this._clearFlag = camera.clearFlag;
        camera.clearColor.w = 0;
        camera.clearFlag = ClearFlagBit.ALL;
      } else if (this._clearFlag) {
        camera.clearColor.w = this._clearColorA;
        camera.clearFlag = this._clearFlag;
        this._clearColorA = -1;
        this._clearFlag = null;
      }
    }
    this._component.node.getWorldMatrix(_mat4_temp);
    camera.update(true);
    camera.worldMatrixToScreen(_mat4_temp, _mat4_temp, game.canvas.width, game.canvas.height);
    var width = 0;
    var height = 0;
    if (this._fullScreenOnAwake) {
      width = visibleRect.width;
      height = visibleRect.height;
    } else {
      width = this._uiTrans.contentSize.width;
      height = this._uiTrans.contentSize.height;
    }
    if (!this._forceUpdate && this._m00 === _mat4_temp.m00 && this._m01 === _mat4_temp.m01 && this._m04 === _mat4_temp.m04 && this._m05 === _mat4_temp.m05 && this._m12 === _mat4_temp.m12 && this._m13 === _mat4_temp.m13 && this._w === width && this._h === height) {
      return;
    }
    this._m00 = _mat4_temp.m00;
    this._m01 = _mat4_temp.m01;
    this._m04 = _mat4_temp.m04;
    this._m05 = _mat4_temp.m05;
    this._m12 = _mat4_temp.m12;
    this._m13 = _mat4_temp.m13;
    this._w = width;
    this._h = height;
    var dpr = screenAdapter.devicePixelRatio;
    var scaleX = 1 / dpr;
    var scaleY = 1 / dpr;
    var container = game.container;
    var sx = _mat4_temp.m00 * scaleX;
    var b = _mat4_temp.m01;
    var c = _mat4_temp.m04;
    var sy = _mat4_temp.m05 * scaleY;
    this._video.style.width = this._w + "px";
    this._video.style.height = this._h + "px";
    if (sys.browserType !== BrowserType.MOBILE_QQ) {
      this._video.style.objectFit = this._keepAspectRatio ? 'none' : 'fill';
    } else {
      warn('keepAspectRatio is not supported by the qq mobile browser.');
    }
    var w = this._w * scaleX;
    var h = this._h * scaleY;
    var _anchorPoint = this._uiTrans.anchorPoint,
      x = _anchorPoint.x,
      y = _anchorPoint.y;
    var appx = w * _mat4_temp.m00 * x;
    var appy = h * _mat4_temp.m05 * y;
    var offsetX = container && container.style.paddingLeft ? parseInt(container.style.paddingLeft) : 0;
    var offsetY = container && container.style.paddingBottom ? parseInt(container.style.paddingBottom) : 0;
    var tx = _mat4_temp.m12 * scaleX - appx + offsetX;
    var ty = _mat4_temp.m13 * scaleY - appy + offsetY;
    var matrix = "matrix(" + sx + "," + -b + "," + -c + "," + sy + "," + tx + "," + -ty + ")";
    this._video.style.transform = matrix;
    this._video.style['-webkit-transform'] = matrix;
    if (sys.browserType !== BrowserType.IE) {
      this._forceUpdate = false;
    }
  };
  return VideoPlayerImplWeb;
}(VideoPlayerImpl);

var VideoPlayerImplManager = function () {
  function VideoPlayerImplManager() {}
  VideoPlayerImplManager.getImpl = function getImpl(component) {
    return new VideoPlayerImplWeb(component);
  };
  return VideoPlayerImplManager;
}();
legacyCC.internal.VideoPlayerImplManager = VideoPlayerImplManager;

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _VideoPlayer;
var VideoPlayer = (_dec = ccclass('cc.VideoPlayer'), _dec2 = requireComponent(UITransform), _dec3 = type(VideoClip), _dec4 = type(ResourceType), _dec5 = type(VideoClip), _dec6 = type([EventHandler]), _dec(_class = _dec2(_class = (_class2 = (_VideoPlayer = function (_Component) {
  function VideoPlayer() {
    var _this;
    _this = _Component.call(this) || this;
    _this._resourceType = _initializer && _initializer();
    _this._remoteURL = _initializer2 && _initializer2();
    _this._clip = _initializer3 && _initializer3();
    _this._playOnAwake = _initializer4 && _initializer4();
    _this._volume = _initializer5 && _initializer5();
    _this._mute = _initializer6 && _initializer6();
    _this._playbackRate = _initializer7 && _initializer7();
    _this._loop = _initializer8 && _initializer8();
    _this._fullScreenOnAwake = _initializer9 && _initializer9();
    _this._stayOnBottom = _initializer0 && _initializer0();
    _this._keepAspectRatio = _initializer1 && _initializer1();
    _this._impl = null;
    _this._cachedCurrentTime = 0;
    _this.videoPlayerEvent = _initializer10 && _initializer10();
    return _this;
  }
  _inheritsLoose(VideoPlayer, _Component);
  var _proto = VideoPlayer.prototype;
  _proto.syncSource = function syncSource() {
    var impl = this._impl;
    if (!impl) {
      return;
    }
    if (this._resourceType === ResourceType.REMOTE) {
      impl.syncURL(this._remoteURL);
    } else {
      impl.syncClip(this._clip);
    }
    this._cachedCurrentTime = 0;
    impl.syncLoop(this._loop);
    impl.syncVolume(this._volume);
    impl.syncMute(this._mute);
    impl.seekTo(this._cachedCurrentTime);
    impl.syncPlaybackRate(this._playbackRate);
    impl.syncStayOnBottom(this._stayOnBottom);
    impl.syncKeepAspectRatio(this._keepAspectRatio);
    impl.syncFullScreenOnAwake(this._fullScreenOnAwake);
  };
  _proto.__preload = function __preload() {
    this._impl = VideoPlayerImplManager.getImpl(this);
    this.syncSource();
    var componentEventList = this._impl.componentEventList;
    componentEventList.set(VideoPlayerEventType.META_LOADED, this.onMetaLoaded.bind(this));
    componentEventList.set(VideoPlayerEventType.READY_TO_PLAY, this.onReadyToPlay.bind(this));
    componentEventList.set(VideoPlayerEventType.PLAYING, this.onPlaying.bind(this));
    componentEventList.set(VideoPlayerEventType.PAUSED, this.onPaused.bind(this));
    componentEventList.set(VideoPlayerEventType.STOPPED, this.onStopped.bind(this));
    componentEventList.set(VideoPlayerEventType.COMPLETED, this.onCompleted.bind(this));
    componentEventList.set(VideoPlayerEventType.ERROR, this.onError.bind(this));
    componentEventList.set(VideoPlayerEventType.CLICKED, this.onClicked.bind(this));
    if (this._playOnAwake && this._impl.loaded) {
      this.play();
    }
  };
  _proto.onEnable = function onEnable() {
    if (this._impl) {
      this._impl.enable();
    }
  };
  _proto.onDisable = function onDisable() {
    if (this._impl) {
      this._impl.disable();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._impl) {
      this._impl.destroy();
      this._impl = null;
    }
  };
  _proto.update = function update(dt) {
    if (this._impl) {
      this._impl.syncMatrix();
    }
  };
  _proto.onMetaLoaded = function onMetaLoaded() {
    EventHandler.emitEvents(this.videoPlayerEvent, this, VideoPlayerEventType.META_LOADED);
    this.node.emit('meta-loaded', this);
  };
  _proto.onReadyToPlay = function onReadyToPlay() {
    if (this._playOnAwake && !this.isPlaying) {
      this.play();
    }
    EventHandler.emitEvents(this.videoPlayerEvent, this, VideoPlayerEventType.READY_TO_PLAY);
    this.node.emit(VideoPlayerEventType.READY_TO_PLAY, this);
  };
  _proto.onPlaying = function onPlaying() {
    EventHandler.emitEvents(this.videoPlayerEvent, this, VideoPlayerEventType.PLAYING);
    this.node.emit(VideoPlayerEventType.PLAYING, this);
  };
  _proto.onPaused = function onPaused() {
    EventHandler.emitEvents(this.videoPlayerEvent, this, VideoPlayerEventType.PAUSED);
    this.node.emit(VideoPlayerEventType.PAUSED, this);
  };
  _proto.onStopped = function onStopped() {
    EventHandler.emitEvents(this.videoPlayerEvent, this, VideoPlayerEventType.STOPPED);
    this.node.emit(VideoPlayerEventType.STOPPED, this);
  };
  _proto.onCompleted = function onCompleted() {
    EventHandler.emitEvents(this.videoPlayerEvent, this, VideoPlayerEventType.COMPLETED);
    this.node.emit(VideoPlayerEventType.COMPLETED, this);
  };
  _proto.onError = function onError() {
    EventHandler.emitEvents(this.videoPlayerEvent, this, VideoPlayerEventType.ERROR);
    this.node.emit(VideoPlayerEventType.ERROR, this);
  };
  _proto.onClicked = function onClicked() {
    EventHandler.emitEvents(this.videoPlayerEvent, this, VideoPlayerEventType.CLICKED);
    this.node.emit(VideoPlayerEventType.CLICKED, this);
  };
  _proto.play = function play() {
    if (this._impl) {
      this._impl.play();
    }
  };
  _proto.resume = function resume() {
    if (this._impl) {
      this._impl.resume();
    }
  };
  _proto.pause = function pause() {
    if (this._impl) {
      this._impl.pause();
    }
  };
  _proto.stop = function stop() {
    if (this._impl) {
      this._impl.stop();
    }
  };
  return _createClass(VideoPlayer, [{
    key: "resourceType",
    get: function get() {
      return this._resourceType;
    },
    set: function set(val) {
      if (this._resourceType !== val) {
        this._resourceType = val;
        this.syncSource();
      }
    }
  }, {
    key: "remoteURL",
    get: function get() {
      return this._remoteURL;
    },
    set: function set(val) {
      if (this._remoteURL !== val) {
        this._remoteURL = val;
        this.syncSource();
      }
    }
  }, {
    key: "clip",
    get: function get() {
      return this._clip;
    },
    set: function set(val) {
      if (this._clip !== val) {
        this._clip = val;
        this.syncSource();
      }
    }
  }, {
    key: "playOnAwake",
    get: function get() {
      return this._playOnAwake;
    },
    set: function set(value) {
      this._playOnAwake = value;
    }
  }, {
    key: "playbackRate",
    get: function get() {
      return this._playbackRate;
    },
    set: function set(value) {
      this._playbackRate = value;
      if (this._impl) {
        this._impl.syncPlaybackRate(value);
      }
    }
  }, {
    key: "volume",
    get: function get() {
      return this._volume;
    },
    set: function set(value) {
      this._volume = value;
      if (this._impl) {
        this._impl.syncVolume(value);
      }
    }
  }, {
    key: "mute",
    get: function get() {
      return this._mute;
    },
    set: function set(value) {
      this._mute = value;
      if (this._impl) {
        this._impl.syncMute(value);
      }
    }
  }, {
    key: "loop",
    get: function get() {
      return this._loop;
    },
    set: function set(value) {
      this._loop = value;
      if (this._impl) {
        this._impl.syncLoop(value);
      }
    }
  }, {
    key: "keepAspectRatio",
    get: function get() {
      return this._keepAspectRatio;
    },
    set: function set(value) {
      if (this._keepAspectRatio !== value) {
        this._keepAspectRatio = value;
        if (this._impl) {
          this._impl.syncKeepAspectRatio(value);
        }
      }
    }
  }, {
    key: "fullScreenOnAwake",
    get: function get() {
      {
        if (this._impl) {
          this._fullScreenOnAwake = this._impl.fullScreenOnAwake;
          return this._fullScreenOnAwake;
        }
      }
      return this._fullScreenOnAwake;
    },
    set: function set(value) {
      if (this._fullScreenOnAwake !== value) {
        this._fullScreenOnAwake = value;
        if (this._impl) {
          this._impl.syncFullScreenOnAwake(value);
        }
      }
    }
  }, {
    key: "stayOnBottom",
    get: function get() {
      return this._stayOnBottom;
    },
    set: function set(value) {
      if (this._stayOnBottom !== value) {
        this._stayOnBottom = value;
        if (this._impl) {
          this._impl.syncStayOnBottom(value);
        }
      }
    }
  }, {
    key: "nativeVideo",
    get: function get() {
      return this._impl && this._impl.video || null;
    }
  }, {
    key: "currentTime",
    get: function get() {
      if (!this._impl) {
        return this._cachedCurrentTime;
      }
      return this._impl.getCurrentTime();
    },
    set: function set(val) {
      if (Number.isNaN(val)) {
        warn("illegal video time! value:" + val);
        return;
      }
      val = clamp(val, 0, this.duration);
      this._cachedCurrentTime = val;
      if (this._impl) {
        this._impl.seekTo(val);
      }
    }
  }, {
    key: "duration",
    get: function get() {
      if (!this._impl) {
        return 0;
      }
      return this._impl.getDuration();
    }
  }, {
    key: "state",
    get: function get() {
      if (!this._impl) {
        return VideoPlayerEventType.NONE;
      }
      return this._impl.state;
    }
  }, {
    key: "isPlaying",
    get: function get() {
      if (!this._impl) {
        return false;
      }
      return this._impl.isPlaying;
    }
  }]);
}(Component), _VideoPlayer.EventType = VideoPlayerEventType, _VideoPlayer.ResourceType = ResourceType, _VideoPlayer), _initializer = applyDecoratedInitializer(_class2.prototype, "_resourceType", [serializable], function () {
  return ResourceType.LOCAL;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_remoteURL", [serializable], function () {
  return '';
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_clip", [_dec3, serializable], function () {
  return null;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_playOnAwake", [serializable], function () {
  return true;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_volume", [serializable], function () {
  return 1.0;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_mute", [serializable], function () {
  return false;
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "_playbackRate", [serializable], function () {
  return 1;
}), _initializer8 = applyDecoratedInitializer(_class2.prototype, "_loop", [serializable], function () {
  return false;
}), _initializer9 = applyDecoratedInitializer(_class2.prototype, "_fullScreenOnAwake", [serializable], function () {
  return false;
}), _initializer0 = applyDecoratedInitializer(_class2.prototype, "_stayOnBottom", [serializable], function () {
  return false;
}), _initializer1 = applyDecoratedInitializer(_class2.prototype, "_keepAspectRatio", [serializable], function () {
  return true;
}), _applyDecoratedDescriptor(_class2.prototype, "resourceType", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "resourceType"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "clip", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "clip"), _class2.prototype), _initializer10 = applyDecoratedInitializer(_class2.prototype, "videoPlayerEvent", [serializable, _dec6], function () {
  return [];
}), _class2)) || _class) || _class);
legacyCC.internal.VideoPlayer = VideoPlayer;

replaceProperty(VideoPlayer.prototype, 'VideoPlayer.prototype', [{
  name: 'onPasued',
  newName: 'onPaused'
}]);

export { VideoClip, VideoPlayer };
//# sourceMappingURL=video.js.map
