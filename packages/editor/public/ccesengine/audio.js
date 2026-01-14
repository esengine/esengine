import { a as _createClass, $ as systemInfo, a4 as OS, B as BrowserType, b as _applyDecoratedDescriptor, n as EventTarget, w as warnID, e as warn, _ as _inheritsLoose, M as fastRemoveAt, m as setClassAlias } from './gc-object-CShF5lzx.js';
import { a as clamp, U as clamp01, c as ccclass, b as applyDecoratedInitializer, s as serializable, L as override, t as type, i as replaceProperty, G as markAsWarning } from './index-uXI1_UMk.js';
import { g as game, G as Game } from './deprecated-Dswa7XeN.js';
import './director-F7e_Lqjg.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { A as Asset, C as Component } from './node-event-Ccvtv8bJ.js';
import { m as downloader, n as factory } from './scene-vWcxM1_c.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './touch-BKrZ-fxl.js';
import './debug-view-BuNhRPv_.js';
import './deprecated-n0w4kK7g.js';

var AudioEvent;
(function (AudioEvent) {
  AudioEvent["PLAYED"] = "play";
  AudioEvent["PAUSED"] = "pause";
  AudioEvent["STOPPED"] = "stop";
  AudioEvent["SEEKED"] = "seeked";
  AudioEvent["ENDED"] = "ended";
  AudioEvent["INTERRUPTION_BEGIN"] = "interruptionBegin";
  AudioEvent["INTERRUPTION_END"] = "interruptionEnd";
  AudioEvent["USER_GESTURE"] = "on_gesture";
})(AudioEvent || (AudioEvent = {}));
var AudioType;
(function (AudioType) {
  AudioType[AudioType["DOM_AUDIO"] = 0] = "DOM_AUDIO";
  AudioType[AudioType["WEB_AUDIO"] = 1] = "WEB_AUDIO";
  AudioType[AudioType["MINIGAME_AUDIO"] = 2] = "MINIGAME_AUDIO";
  AudioType[AudioType["NATIVE_AUDIO"] = 3] = "NATIVE_AUDIO";
  AudioType[AudioType["UNKNOWN_AUDIO"] = 4] = "UNKNOWN_AUDIO";
})(AudioType || (AudioType = {}));
var AudioState;
(function (AudioState) {
  AudioState[AudioState["INIT"] = 0] = "INIT";
  AudioState[AudioState["PLAYING"] = 1] = "PLAYING";
  AudioState[AudioState["PAUSED"] = 2] = "PAUSED";
  AudioState[AudioState["STOPPED"] = 3] = "STOPPED";
  AudioState[AudioState["INTERRUPTED"] = 4] = "INTERRUPTED";
})(AudioState || (AudioState = {}));
var AudioPCMDataView = function () {
  function AudioPCMDataView() {
    this._bufferView = void 0;
    this._normalizeFactor = 1;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 2) {
      this._bufferView = args[0];
      this._normalizeFactor = args[1];
    } else {
      var _arrayBuffer = args[0];
      var _Ctor = args[1];
      var _normalizeFactor = args[2];
      this._bufferView = new _Ctor(_arrayBuffer);
      this._normalizeFactor = _normalizeFactor;
    }
  }
  var _proto = AudioPCMDataView.prototype;
  _proto.getData = function getData(offset) {
    return this._bufferView[offset] * this._normalizeFactor;
  };
  return _createClass(AudioPCMDataView, [{
    key: "length",
    get: function get() {
      return this._bufferView.length;
    }
  }]);
}();

function removeUnneededCalls(instance) {
  var size = instance._operationQueue.length;
  var tmpQueue = instance._operationQueue.slice();
  var reserveOps = [];
  var seekSearched = false;
  for (var i = size - 1; i >= 0; i--) {
    var opInfo = tmpQueue[i];
    if (opInfo.op === 'stop') {
      reserveOps.push(opInfo);
      break;
    } else if (opInfo.op === 'seek') {
      if (!seekSearched) {
        reserveOps.push(opInfo);
        seekSearched = true;
      }
    } else if (seekSearched) {
      reserveOps.push(opInfo);
      break;
    } else if (reserveOps.length === 0) {
      reserveOps.push(opInfo);
    }
  }
  instance._operationQueue = reserveOps.reverse();
}
var operationId = 0;
function _tryCallingRecursively(target, opInfo) {
  var _opInfo$func;
  if (opInfo.invoking) {
    return;
  }
  opInfo.invoking = true;
  (_opInfo$func = opInfo.func).call.apply(_opInfo$func, [target].concat(opInfo.args)).then(function () {
    opInfo.invoking = false;
    target._operationQueue.shift();
    target._eventTarget.emit(opInfo.id.toString());
    target._eventTarget.off(opInfo.id.toString());
    removeUnneededCalls(target);
    var nextOpInfo = target._operationQueue[0];
    if (nextOpInfo) {
      _tryCallingRecursively(target, nextOpInfo);
    }
  })["catch"](function (e) {});
}
function enqueueOperation(target, propertyKey, descriptor) {
  var originalOperation = descriptor.value;
  descriptor.value = function () {
    var _this = this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return new Promise(function (resolve) {
      var id = operationId++;
      var instance = _this;
      instance._operationQueue.push({
        op: propertyKey,
        id: id,
        func: originalOperation,
        args: args,
        invoking: false
      });
      instance._eventTarget.once(id.toString(), resolve);
      var opInfo = instance._operationQueue[0];
      _tryCallingRecursively(instance, opInfo);
    });
  };
}

var _class$3;
function ensurePlaying(domAudio) {
  return new Promise(function (resolve) {
    var promise = domAudio.play();
    if (promise === undefined) {
      return resolve();
    }
    promise.then(resolve)["catch"](function () {
      var _onGesture = function onGesture() {
        domAudio.play().then(function () {
          canvas == null ? void 0 : canvas.removeEventListener('touchend', _onGesture, {
            capture: true
          });
          canvas == null ? void 0 : canvas.removeEventListener('mouseup', _onGesture, {
            capture: true
          });
        })["catch"](function (e) {});
        resolve();
      };
      var canvas = document.getElementById('GameCanvas');
      canvas == null ? void 0 : canvas.addEventListener('touchend', _onGesture, {
        capture: true
      });
      canvas == null ? void 0 : canvas.addEventListener('mouseup', _onGesture, {
        capture: true
      });
    });
    return null;
  });
}
var OneShotAudioDOM = function () {
  function OneShotAudioDOM(nativeAudio, volume) {
    this._domAudio = void 0;
    this._onPlayCb = void 0;
    this._onEndCb = void 0;
    this._domAudio = nativeAudio;
    nativeAudio.volume = volume;
  }
  var _proto = OneShotAudioDOM.prototype;
  _proto.play = function play() {
    var _this = this;
    ensurePlaying(this._domAudio).then(function () {
      _this.onPlay == null ? void 0 : _this.onPlay();
    })["catch"](function (e) {});
  };
  _proto.stop = function stop() {
    this._domAudio.pause();
  };
  return _createClass(OneShotAudioDOM, [{
    key: "onPlay",
    get: function get() {
      return this._onPlayCb;
    },
    set: function set(cb) {
      this._onPlayCb = cb;
    }
  }, {
    key: "onEnd",
    get: function get() {
      return this._onEndCb;
    },
    set: function set(cb) {
      if (this._onEndCb) {
        this._domAudio.removeEventListener('ended', this._onEndCb);
      }
      this._onEndCb = cb;
      if (cb) {
        this._domAudio.addEventListener('ended', cb);
      }
    }
  }]);
}();
var AudioPlayerDOM = (_class$3 = function () {
  function AudioPlayerDOM(nativeAudio) {
    var _this2 = this;
    this._domAudio = void 0;
    this._state = AudioState.INIT;
    this._onEnded = void 0;
    this._eventTarget = new EventTarget();
    this._operationQueue = [];
    this._domAudio = nativeAudio;
    game.on(Game.EVENT_PAUSE, this._onInterruptedBegin, this);
    game.on(Game.EVENT_RESUME, this._onInterruptedEnd, this);
    this._onEnded = function () {
      _this2.seek(0)["catch"](function (e) {});
      _this2._state = AudioState.INIT;
      _this2._eventTarget.emit(AudioEvent.ENDED);
    };
    this._domAudio.addEventListener('ended', this._onEnded);
  }
  var _proto2 = AudioPlayerDOM.prototype;
  _proto2.destroy = function destroy() {
    game.off(Game.EVENT_PAUSE, this._onInterruptedBegin, this);
    game.off(Game.EVENT_RESUME, this._onInterruptedEnd, this);
    this._domAudio.removeEventListener('ended', this._onEnded);
    this._domAudio = null;
  };
  AudioPlayerDOM.load = function load(url) {
    return new Promise(function (resolve, reject) {
      AudioPlayerDOM.loadNative(url).then(function (domAudio) {
        resolve(new AudioPlayerDOM(domAudio));
      })["catch"](reject);
    });
  };
  AudioPlayerDOM.loadNative = function loadNative(url) {
    return new Promise(function (resolve, reject) {
      var domAudio = document.createElement('audio');
      var loadedEvent = 'canplaythrough';
      if (systemInfo.os === OS.IOS) {
        loadedEvent = 'loadedmetadata';
      } else if (systemInfo.browserType === BrowserType.FIREFOX) {
        loadedEvent = 'canplay';
      }
      var timer = setTimeout(function () {
        if (domAudio.readyState === 0) {
          failure();
        } else {
          success();
        }
      }, 8000);
      var clearEvent = function clearEvent() {
        clearTimeout(timer);
        domAudio.removeEventListener(loadedEvent, success, false);
        domAudio.removeEventListener('error', failure, false);
      };
      var success = function success() {
        clearEvent();
        resolve(domAudio);
      };
      var failure = function failure() {
        clearEvent();
        var message = "load audio failure - " + url;
        reject(new Error(message));
      };
      domAudio.addEventListener(loadedEvent, success, false);
      domAudio.addEventListener('error', failure, false);
      domAudio.src = url;
    });
  };
  AudioPlayerDOM.loadOneShotAudio = function loadOneShotAudio(url, volume) {
    return new Promise(function (resolve, reject) {
      AudioPlayerDOM.loadNative(url).then(function (domAudio) {
        var oneShotAudio = new OneShotAudioDOM(domAudio, volume);
        resolve(oneShotAudio);
      })["catch"](reject);
    });
  };
  _proto2._onInterruptedBegin = function _onInterruptedBegin() {
    var _this3 = this;
    if (this._state === AudioState.PLAYING) {
      this.pause().then(function () {
        _this3._state = AudioState.INTERRUPTED;
        _this3._eventTarget.emit(AudioEvent.INTERRUPTION_BEGIN);
      })["catch"](function (e) {});
    }
  };
  _proto2._onInterruptedEnd = function _onInterruptedEnd() {
    var _this4 = this;
    if (this._state === AudioState.INTERRUPTED) {
      this.play().then(function () {
        _this4._eventTarget.emit(AudioEvent.INTERRUPTION_END);
      })["catch"](function (e) {});
    }
  };
  _proto2.getPCMData = function getPCMData(channelIndex) {
    return undefined;
  };
  _proto2.seek = function seek(time) {
    time = clamp(time, 0, this.duration);
    this._domAudio.currentTime = time;
    return Promise.resolve();
  };
  _proto2.play = function play() {
    var _this5 = this;
    return new Promise(function (resolve) {
      ensurePlaying(_this5._domAudio).then(function () {
        _this5._state = AudioState.PLAYING;
        resolve();
      })["catch"](function (e) {});
    });
  };
  _proto2.pause = function pause() {
    this._domAudio.pause();
    this._state = AudioState.PAUSED;
    return Promise.resolve();
  };
  _proto2.stop = function stop() {
    var _this6 = this;
    return new Promise(function (resolve) {
      _this6._domAudio.pause();
      _this6._domAudio.currentTime = 0;
      _this6._state = AudioState.STOPPED;
      resolve();
    });
  };
  _proto2.onInterruptionBegin = function onInterruptionBegin(cb) {
    this._eventTarget.on(AudioEvent.INTERRUPTION_BEGIN, cb);
  };
  _proto2.offInterruptionBegin = function offInterruptionBegin(cb) {
    this._eventTarget.off(AudioEvent.INTERRUPTION_BEGIN, cb);
  };
  _proto2.onInterruptionEnd = function onInterruptionEnd(cb) {
    this._eventTarget.on(AudioEvent.INTERRUPTION_END, cb);
  };
  _proto2.offInterruptionEnd = function offInterruptionEnd(cb) {
    this._eventTarget.off(AudioEvent.INTERRUPTION_END, cb);
  };
  _proto2.onEnded = function onEnded(cb) {
    this._eventTarget.on(AudioEvent.ENDED, cb);
  };
  _proto2.offEnded = function offEnded(cb) {
    this._eventTarget.off(AudioEvent.ENDED, cb);
  };
  return _createClass(AudioPlayerDOM, [{
    key: "src",
    get: function get() {
      return this._domAudio ? this._domAudio.src : '';
    }
  }, {
    key: "type",
    get: function get() {
      return AudioType.DOM_AUDIO;
    }
  }, {
    key: "state",
    get: function get() {
      return this._state;
    }
  }, {
    key: "loop",
    get: function get() {
      return this._domAudio.loop;
    },
    set: function set(val) {
      this._domAudio.loop = val;
    }
  }, {
    key: "volume",
    get: function get() {
      return this._domAudio.volume;
    },
    set: function set(val) {
      val = clamp01(val);
      this._domAudio.volume = val;
    }
  }, {
    key: "duration",
    get: function get() {
      return this._domAudio.duration;
    }
  }, {
    key: "currentTime",
    get: function get() {
      return this._domAudio.currentTime;
    }
  }, {
    key: "sampleRate",
    get: function get() {
      return 0;
    }
  }]);
}(), _applyDecoratedDescriptor(_class$3.prototype, "seek", [enqueueOperation], Object.getOwnPropertyDescriptor(_class$3.prototype, "seek"), _class$3.prototype), _applyDecoratedDescriptor(_class$3.prototype, "play", [enqueueOperation], Object.getOwnPropertyDescriptor(_class$3.prototype, "play"), _class$3.prototype), _applyDecoratedDescriptor(_class$3.prototype, "pause", [enqueueOperation], Object.getOwnPropertyDescriptor(_class$3.prototype, "pause"), _class$3.prototype), _applyDecoratedDescriptor(_class$3.prototype, "stop", [enqueueOperation], Object.getOwnPropertyDescriptor(_class$3.prototype, "stop"), _class$3.prototype), _class$3);

var AudioTimer = function () {
  function AudioTimer(nativeAudio) {
    this._nativeAudio = void 0;
    this._startTime = 0;
    this._startOffset = 0;
    this._isPaused = true;
    this._nativeAudio = nativeAudio;
  }
  var _proto = AudioTimer.prototype;
  _proto.destroy = function destroy() {
    this._nativeAudio = undefined;
  };
  _proto._now = function _now() {
    return performance.now() / 1000;
  };
  _proto._calculateCurrentTime = function _calculateCurrentTime() {
    var timePassed = this._now() - this._startTime;
    var currentTime = this._startOffset + timePassed;
    if (currentTime >= this.duration) {
      this._startTime = this._now();
      this._startOffset = 0;
    }
    return currentTime % this.duration;
  };
  _proto.start = function start() {
    this._isPaused = false;
    this._startTime = this._now();
  };
  _proto.pause = function pause() {
    if (this._isPaused) {
      return;
    }
    this._isPaused = true;
    this._startOffset = this._calculateCurrentTime();
  };
  _proto.stop = function stop() {
    this._isPaused = true;
    this._startOffset = 0;
  };
  _proto.seek = function seek(time) {
    this._startTime = this._now();
    this._startOffset = clamp(time, 0, this.duration);
  };
  return _createClass(AudioTimer, [{
    key: "duration",
    get: function get() {
      return this._nativeAudio.duration;
    }
  }, {
    key: "currentTime",
    get: function get() {
      if (this._isPaused) {
        return this._startOffset;
      } else {
        return this._calculateCurrentTime();
      }
    }
  }]);
}();

var AudioBufferManager = function () {
  function AudioBufferManager() {
    this._audioBufferDataMap = {};
  }
  var _proto = AudioBufferManager.prototype;
  _proto.addCache = function addCache(url, audioBuffer) {
    var audioBufferData = this._audioBufferDataMap[url];
    if (audioBufferData) {
      warnID(5204, url);
      return;
    }
    this._audioBufferDataMap[url] = {
      usedCount: 1,
      audioBuffer: audioBuffer
    };
  };
  _proto.retainCache = function retainCache(url) {
    var audioBufferData = this._audioBufferDataMap[url];
    if (!audioBufferData) {
      warnID(5203, url);
      return;
    }
    audioBufferData.usedCount++;
  };
  _proto.getCache = function getCache(url) {
    var audioBufferData = this._audioBufferDataMap[url];
    return audioBufferData == null ? void 0 : audioBufferData.audioBuffer;
  };
  _proto.tryReleasingCache = function tryReleasingCache(url) {
    var audioBufferData = this._audioBufferDataMap[url];
    if (!audioBufferData) {
      warnID(5203, url);
      return;
    }
    if (--audioBufferData.usedCount <= 0) {
      delete this._audioBufferDataMap[url];
    }
  };
  return AudioBufferManager;
}();
var audioBufferManager = new AudioBufferManager();

var _class$2;
var AudioContextClass = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
var _contextRunningEvent = 'on-context-running';
var AudioContextAgent = function () {
  function AudioContextAgent() {
    var _this = this;
    this._eventTarget = void 0;
    this._context = void 0;
    this._isRunning = false;
    this._context = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
    this._eventTarget = new EventTarget();
    this._context.onstatechange = function () {
      if (_this._context.state === 'running') {
        _this._isRunning = true;
        _this._eventTarget.emit(_contextRunningEvent);
      } else {
        _this._isRunning = false;
      }
    };
  }
  var _proto = AudioContextAgent.prototype;
  _proto.onceRunning = function onceRunning(cb, target) {
    this._eventTarget.once(_contextRunningEvent, cb, target);
  };
  _proto.offRunning = function offRunning(cb, target) {
    this._eventTarget.off(_contextRunningEvent, cb, target);
  };
  _proto.decodeAudioData = function decodeAudioData(audioData) {
    var _this2 = this;
    return new Promise(function (resolve, reject) {
      var promise = _this2._context.decodeAudioData(audioData, function (audioBuffer) {
        resolve(audioBuffer);
      }, function (err) {
        console.error('failed to load Web Audio', err);
      });
      promise == null ? void 0 : promise["catch"](reject);
    });
  };
  _proto.runContext = function runContext() {
    var _this3 = this;
    return new Promise(function (resolve) {
      if (_this3.isRunning) {
        resolve();
        return;
      }
      var context = _this3._context;
      if (!context.resume) {
        resolve();
        return;
      }
      if (context.state === 'suspended') {
        context.resume()["catch"](function (e) {
          warn('runContext error', e);
        });
      } else if (context.state === 'running') {
        resolve();
        return;
      }
      var canvas = document.getElementById('GameCanvas');
      var _onGesture = function onGesture() {
        context.resume().then(function () {
          canvas == null ? void 0 : canvas.removeEventListener('touchend', _onGesture, {
            capture: true
          });
          canvas == null ? void 0 : canvas.removeEventListener('mouseup', _onGesture, {
            capture: true
          });
          resolve();
        })["catch"](function (e) {
          warn('onGesture resume error', e);
        });
      };
      canvas == null ? void 0 : canvas.addEventListener('touchend', _onGesture, {
        capture: true
      });
      canvas == null ? void 0 : canvas.addEventListener('mouseup', _onGesture, {
        capture: true
      });
    });
  };
  _proto.createBufferSource = function createBufferSource(audioBuffer, loop) {
    var sourceBufferNode = this._context.createBufferSource();
    if (audioBuffer !== undefined) {
      sourceBufferNode.buffer = audioBuffer;
    }
    if (loop !== undefined) {
      sourceBufferNode.loop = loop;
    }
    return sourceBufferNode;
  };
  _proto.createGain = function createGain(volume) {
    if (volume === void 0) {
      volume = 1;
    }
    var gainNode = this._context.createGain();
    this.setGainValue(gainNode, volume);
    return gainNode;
  };
  _proto.setGainValue = function setGainValue(gain, volume) {
    if (gain.gain.setTargetAtTime) {
      try {
        gain.gain.setTargetAtTime(volume, this._context.currentTime, 0);
      } catch (e) {
        gain.gain.setTargetAtTime(volume, this._context.currentTime, 0.01);
      }
    } else {
      gain.gain.value = volume;
    }
  };
  _proto.connectContext = function connectContext(audioNode) {
    if (!this._context) {
      return;
    }
    audioNode.connect(this._context.destination);
  };
  return _createClass(AudioContextAgent, [{
    key: "isRunning",
    get: function get() {
      return this._isRunning;
    }
  }, {
    key: "currentTime",
    get: function get() {
      return this._context.currentTime;
    }
  }]);
}();
AudioContextAgent.support = !!AudioContextClass;
var audioContextAgent;
if (AudioContextAgent.support) {
  audioContextAgent = new AudioContextAgent();
}
var OneShotAudioWeb = function () {
  function OneShotAudioWeb(audioBuffer, volume, url) {
    this._duration = void 0;
    this._bufferSourceNode = void 0;
    this._onPlayCb = void 0;
    this._currentTimer = 0;
    this._url = void 0;
    this._onEndCb = void 0;
    this._duration = audioBuffer.duration;
    this._url = url;
    this._bufferSourceNode = audioContextAgent.createBufferSource(audioBuffer, false);
    var gainNode = audioContextAgent.createGain(volume);
    this._bufferSourceNode.connect(gainNode);
    audioContextAgent.connectContext(gainNode);
  }
  var _proto2 = OneShotAudioWeb.prototype;
  _proto2.play = function play() {
    var _this4 = this;
    this._bufferSourceNode.start();
    audioContextAgent.runContext().then(function () {
      _this4.onPlay == null ? void 0 : _this4.onPlay();
      _this4._currentTimer = window.setTimeout(function () {
        audioBufferManager.tryReleasingCache(_this4._url);
        _this4.onEnd == null ? void 0 : _this4.onEnd();
      }, _this4._duration * 1000);
    })["catch"](function (e) {
      warn('play error', e);
    });
  };
  _proto2.stop = function stop() {
    clearTimeout(this._currentTimer);
    audioBufferManager.tryReleasingCache(this._url);
    this._bufferSourceNode.stop();
    this._bufferSourceNode.disconnect();
    this._bufferSourceNode.buffer = null;
  };
  return _createClass(OneShotAudioWeb, [{
    key: "onPlay",
    get: function get() {
      return this._onPlayCb;
    },
    set: function set(cb) {
      this._onPlayCb = cb;
    }
  }, {
    key: "onEnd",
    get: function get() {
      return this._onEndCb;
    },
    set: function set(cb) {
      this._onEndCb = cb;
    }
  }]);
}();
var AudioPlayerWeb = (_class$2 = function () {
  function AudioPlayerWeb(audioBuffer, url) {
    this._src = void 0;
    this._audioBuffer = void 0;
    this._sourceNode = void 0;
    this._gainNode = void 0;
    this._currentTimer = 0;
    this._volume = 1;
    this._loop = false;
    this._state = AudioState.INIT;
    this._audioTimer = void 0;
    this._runningCallback = void 0;
    this._eventTarget = new EventTarget();
    this._operationQueue = [];
    this._audioBuffer = audioBuffer;
    this._audioTimer = new AudioTimer(audioBuffer);
    this._gainNode = audioContextAgent.createGain();
    audioContextAgent.connectContext(this._gainNode);
    this._src = url;
    game.on(Game.EVENT_PAUSE, this._onInterruptedBegin, this);
    game.on(Game.EVENT_RESUME, this._onInterruptedEnd, this);
  }
  var _proto3 = AudioPlayerWeb.prototype;
  _proto3.destroy = function destroy() {
    window.clearTimeout(this._currentTimer);
    this._audioTimer.destroy();
    if (this._audioBuffer) {
      this._audioBuffer = null;
    }
    audioBufferManager.tryReleasingCache(this._src);
    game.off(Game.EVENT_PAUSE, this._onInterruptedBegin, this);
    game.off(Game.EVENT_RESUME, this._onInterruptedEnd, this);
    this.offRunning();
  };
  AudioPlayerWeb.load = function load(url) {
    return new Promise(function (resolve, reject) {
      AudioPlayerWeb.loadNative(url).then(function (audioBuffer) {
        resolve(new AudioPlayerWeb(audioBuffer, url));
      })["catch"](reject);
    });
  };
  AudioPlayerWeb.loadNative = function loadNative(url) {
    return new Promise(function (resolve, reject) {
      var cachedAudioBuffer = audioBufferManager.getCache(url);
      if (cachedAudioBuffer) {
        audioBufferManager.retainCache(url);
        resolve(cachedAudioBuffer);
        return;
      }
      var xhr = new XMLHttpRequest();
      var errInfo = "load audio failed: " + url + ", status: ";
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 0) {
          audioContextAgent.decodeAudioData(xhr.response).then(function (decodedAudioBuffer) {
            audioBufferManager.addCache(url, decodedAudioBuffer);
            resolve(decodedAudioBuffer);
          })["catch"](function (e) {
            warn('loadNative error', url, e);
          });
        } else {
          reject(new Error("" + errInfo + xhr.status + "(no response)"));
        }
      };
      xhr.onerror = function () {
        reject(new Error("" + errInfo + xhr.status + "(error)"));
      };
      xhr.ontimeout = function () {
        reject(new Error("" + errInfo + xhr.status + "(time out)"));
      };
      xhr.onabort = function () {
        reject(new Error("" + errInfo + xhr.status + "(abort)"));
      };
      xhr.send(null);
    });
  };
  AudioPlayerWeb.loadOneShotAudio = function loadOneShotAudio(url, volume) {
    return new Promise(function (resolve, reject) {
      AudioPlayerWeb.loadNative(url).then(function (audioBuffer) {
        var oneShotAudio = new OneShotAudioWeb(audioBuffer, volume, url);
        resolve(oneShotAudio);
      })["catch"](reject);
    });
  };
  _proto3.getPCMData = function getPCMData(channelIndex) {
    return new AudioPCMDataView(this._audioBuffer.getChannelData(channelIndex), 1);
  };
  _proto3._onInterruptedBegin = function _onInterruptedBegin() {
    var _this5 = this;
    if (this._state === AudioState.PLAYING) {
      this.pause().then(function () {
        _this5._state = AudioState.INTERRUPTED;
        _this5._eventTarget.emit(AudioEvent.INTERRUPTION_BEGIN);
      })["catch"](function (e) {
        warn('_onInterruptedBegin error', e);
      });
    }
  };
  _proto3._onInterruptedEnd = function _onInterruptedEnd() {
    var _this6 = this;
    if (this._state === AudioState.INTERRUPTED) {
      this.play().then(function () {
        _this6._eventTarget.emit(AudioEvent.INTERRUPTION_END);
      })["catch"](function (e) {
        warn('_onInterruptedEnd error', e);
      });
    }
  };
  _proto3.offRunning = function offRunning() {
    if (this._runningCallback) {
      audioContextAgent.offRunning(this._runningCallback);
      this._runningCallback = undefined;
    }
  };
  _proto3.seek = function seek(time) {
    var _this7 = this;
    return new Promise(function (resolve) {
      _this7.offRunning();
      _this7._audioTimer.seek(time);
      if (_this7._state === AudioState.PLAYING) {
        _this7._doPlay().then(resolve)["catch"](function (e) {
          warn('seek error', e);
        });
      } else {
        resolve();
      }
    });
  };
  _proto3.play = function play() {
    this.offRunning();
    return this._doPlay();
  };
  _proto3._doPlay = function _doPlay() {
    var _this8 = this;
    return new Promise(function (resolve) {
      if (audioContextAgent.isRunning) {
        _this8._startSourceNode();
        resolve();
      } else {
        _this8.offRunning();
        _this8._runningCallback = function () {
          _this8._startSourceNode();
          resolve();
        };
        audioContextAgent.onceRunning(_this8._runningCallback);
        audioContextAgent.runContext()["catch"](function (e) {
          warn('doPlay error', e);
        });
      }
    });
  };
  _proto3._startSourceNode = function _startSourceNode() {
    var _this9 = this;
    this._stopSourceNode();
    this._sourceNode = audioContextAgent.createBufferSource(this._audioBuffer, this.loop);
    this._sourceNode.connect(this._gainNode);
    this._sourceNode.loop = this._loop;
    this._sourceNode.start(0, this._audioTimer.currentTime);
    this._state = AudioState.PLAYING;
    this._audioTimer.start();
    var _checkEnded = function checkEnded() {
      if (_this9.loop) {
        _this9._currentTimer = window.setTimeout(_checkEnded, _this9._audioBuffer.duration * 1000);
      } else {
        _this9._audioTimer.stop();
        _this9._eventTarget.emit(AudioEvent.ENDED);
        _this9._state = AudioState.INIT;
      }
    };
    window.clearTimeout(this._currentTimer);
    this._currentTimer = window.setTimeout(_checkEnded, (this._audioBuffer.duration - this._audioTimer.currentTime) * 1000);
  };
  _proto3._stopSourceNode = function _stopSourceNode() {
    try {
      if (this._sourceNode) {
        this._sourceNode.stop();
        this._sourceNode.disconnect();
        this._sourceNode.buffer = null;
        this._sourceNode = undefined;
      }
    } catch (e) {}
  };
  _proto3.pause = function pause() {
    this.offRunning();
    if (this._state !== AudioState.PLAYING || !this._sourceNode) {
      return Promise.resolve();
    }
    this._audioTimer.pause();
    this._state = AudioState.PAUSED;
    window.clearTimeout(this._currentTimer);
    this._stopSourceNode();
    return Promise.resolve();
  };
  _proto3.stop = function stop() {
    this.offRunning();
    if (!this._sourceNode) {
      this._audioTimer.stop();
      this._state = AudioState.STOPPED;
      return Promise.resolve();
    }
    this._audioTimer.stop();
    this._state = AudioState.STOPPED;
    window.clearTimeout(this._currentTimer);
    this._stopSourceNode();
    return Promise.resolve();
  };
  _proto3.onInterruptionBegin = function onInterruptionBegin(cb) {
    this._eventTarget.on(AudioEvent.INTERRUPTION_BEGIN, cb);
  };
  _proto3.offInterruptionBegin = function offInterruptionBegin(cb) {
    this._eventTarget.off(AudioEvent.INTERRUPTION_BEGIN, cb);
  };
  _proto3.onInterruptionEnd = function onInterruptionEnd(cb) {
    this._eventTarget.on(AudioEvent.INTERRUPTION_END, cb);
  };
  _proto3.offInterruptionEnd = function offInterruptionEnd(cb) {
    this._eventTarget.off(AudioEvent.INTERRUPTION_END, cb);
  };
  _proto3.onEnded = function onEnded(cb) {
    this._eventTarget.on(AudioEvent.ENDED, cb);
  };
  _proto3.offEnded = function offEnded(cb) {
    this._eventTarget.off(AudioEvent.ENDED, cb);
  };
  return _createClass(AudioPlayerWeb, [{
    key: "sampleRate",
    get: function get() {
      return this._audioBuffer.sampleRate;
    }
  }, {
    key: "src",
    get: function get() {
      return this._src;
    }
  }, {
    key: "type",
    get: function get() {
      return AudioType.WEB_AUDIO;
    }
  }, {
    key: "state",
    get: function get() {
      return this._state;
    }
  }, {
    key: "loop",
    get: function get() {
      return this._loop;
    },
    set: function set(val) {
      this._loop = val;
      if (this._sourceNode) {
        this._sourceNode.loop = val;
      }
    }
  }, {
    key: "volume",
    get: function get() {
      return this._volume;
    },
    set: function set(val) {
      val = clamp01(val);
      this._volume = val;
      audioContextAgent.setGainValue(this._gainNode, val);
    }
  }, {
    key: "duration",
    get: function get() {
      return this._audioBuffer.duration;
    }
  }, {
    key: "currentTime",
    get: function get() {
      return this._audioTimer.currentTime;
    }
  }]);
}(), _applyDecoratedDescriptor(_class$2.prototype, "seek", [enqueueOperation], Object.getOwnPropertyDescriptor(_class$2.prototype, "seek"), _class$2.prototype), _applyDecoratedDescriptor(_class$2.prototype, "play", [enqueueOperation], Object.getOwnPropertyDescriptor(_class$2.prototype, "play"), _class$2.prototype), _applyDecoratedDescriptor(_class$2.prototype, "pause", [enqueueOperation], Object.getOwnPropertyDescriptor(_class$2.prototype, "pause"), _class$2.prototype), _applyDecoratedDescriptor(_class$2.prototype, "stop", [enqueueOperation], Object.getOwnPropertyDescriptor(_class$2.prototype, "stop"), _class$2.prototype), _class$2);

var OneShotAudio = function () {
  function OneShotAudio(audio) {
    this._audio = void 0;
    this._audio = audio;
  }
  var _proto = OneShotAudio.prototype;
  _proto.play = function play() {
    this._audio.play();
  };
  _proto.stop = function stop() {
    this._audio.stop();
  };
  return _createClass(OneShotAudio, [{
    key: "onPlay",
    get: function get() {
      return this._audio.onPlay;
    },
    set: function set(v) {
      this._audio.onPlay = v;
    }
  }, {
    key: "onEnd",
    get: function get() {
      return this._audio.onEnd;
    },
    set: function set(v) {
      this._audio.onEnd = v;
    }
  }]);
}();
var AudioPlayer = function () {
  function AudioPlayer(player) {
    this._player = void 0;
    this._player = player;
  }
  AudioPlayer.load = function load(url, opts) {
    return new Promise(function (resolve, reject) {
      if ((opts == null ? void 0 : opts.audioLoadMode) === AudioType.DOM_AUDIO || !AudioContextAgent.support) {
        if (!AudioContextAgent.support) {
          warnID(5201);
        }
        AudioPlayerDOM.load(url).then(function (domPlayer) {
          resolve(new AudioPlayer(domPlayer));
        })["catch"](reject);
      } else {
        AudioPlayerWeb.load(url).then(function (webPlayer) {
          resolve(new AudioPlayer(webPlayer));
        })["catch"](reject);
      }
    });
  };
  var _proto2 = AudioPlayer.prototype;
  _proto2.destroy = function destroy() {
    this._player.destroy();
  };
  AudioPlayer.loadNative = function loadNative(url, opts) {
    if ((opts == null ? void 0 : opts.audioLoadMode) === AudioType.DOM_AUDIO || !AudioContextAgent.support) {
      if (!AudioContextAgent.support) {
        warnID(5201);
      }
      return AudioPlayerDOM.loadNative(url);
    }
    return AudioPlayerWeb.loadNative(url);
  };
  AudioPlayer.loadOneShotAudio = function loadOneShotAudio(url, volume, opts) {
    return new Promise(function (resolve, reject) {
      if ((opts == null ? void 0 : opts.audioLoadMode) === AudioType.DOM_AUDIO || !AudioContextAgent.support) {
        if (!AudioContextAgent.support) {
          warnID(5201);
        }
        AudioPlayerDOM.loadOneShotAudio(url, volume).then(function (oneShotAudioDOM) {
          resolve(new OneShotAudio(oneShotAudioDOM));
        })["catch"](reject);
      } else {
        AudioPlayerWeb.loadOneShotAudio(url, volume).then(function (oneShotAudioWeb) {
          resolve(new OneShotAudio(oneShotAudioWeb));
        })["catch"](reject);
      }
    });
  };
  _proto2.getPCMData = function getPCMData(channelIndex) {
    return this._player.getPCMData(channelIndex);
  };
  _proto2.seek = function seek(time) {
    return this._player.seek(time);
  };
  _proto2.play = function play() {
    return this._player.play();
  };
  _proto2.pause = function pause() {
    return this._player.pause();
  };
  _proto2.stop = function stop() {
    return this._player.stop();
  };
  _proto2.onInterruptionBegin = function onInterruptionBegin(cb) {
    this._player.onInterruptionBegin(cb);
  };
  _proto2.offInterruptionBegin = function offInterruptionBegin(cb) {
    this._player.offInterruptionBegin(cb);
  };
  _proto2.onInterruptionEnd = function onInterruptionEnd(cb) {
    this._player.onInterruptionEnd(cb);
  };
  _proto2.offInterruptionEnd = function offInterruptionEnd(cb) {
    this._player.offInterruptionEnd(cb);
  };
  _proto2.onEnded = function onEnded(cb) {
    this._player.onEnded(cb);
  };
  _proto2.offEnded = function offEnded(cb) {
    this._player.offEnded(cb);
  };
  return _createClass(AudioPlayer, [{
    key: "src",
    get: function get() {
      return this._player.src;
    }
  }, {
    key: "type",
    get: function get() {
      return this._player.type;
    }
  }, {
    key: "state",
    get: function get() {
      return this._player.state;
    }
  }, {
    key: "loop",
    get: function get() {
      return this._player.loop;
    },
    set: function set(val) {
      this._player.loop = val;
    }
  }, {
    key: "volume",
    get: function get() {
      return this._player.volume;
    },
    set: function set(val) {
      this._player.volume = val;
    }
  }, {
    key: "duration",
    get: function get() {
      return this._player.duration;
    }
  }, {
    key: "currentTime",
    get: function get() {
      return this._player.currentTime;
    }
  }, {
    key: "sampleRate",
    get: function get() {
      return this._player.sampleRate;
    }
  }]);
}();
AudioPlayer.maxAudioChannel = 24;

var _dec$1, _class$1, _class2$1, _initializer$1, _AudioClip;
var AudioClip = (_dec$1 = ccclass('cc.AudioClip'), _dec$1(_class$1 = (_class2$1 = (_AudioClip = function (_Asset) {
  function AudioClip(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this._duration = _initializer$1 && _initializer$1();
    _this._loadMode = AudioType.UNKNOWN_AUDIO;
    _this._meta = null;
    _this._player = null;
    return _this;
  }
  _inheritsLoose(AudioClip, _Asset);
  var _proto = AudioClip.prototype;
  _proto.destroy = function destroy() {
    var _this$_player;
    var destroyResult = _Asset.prototype.destroy.call(this);
    (_this$_player = this._player) == null ? void 0 : _this$_player.destroy();
    this._player = null;
    if (this._meta) {
      this._meta.player = null;
    }
    return destroyResult;
  };
  _proto.validate = function validate() {
    return !!this._meta;
  };
  _proto.getDuration = function getDuration() {
    if (this._duration) {
      return this._duration;
    }
    return this._meta ? this._meta.duration : 0;
  };
  _proto.getCurrentTime = function getCurrentTime() {
    return this._player ? this._player.currentTime : 0;
  };
  _proto.getVolume = function getVolume() {
    return this._player ? this._player.volume : 0;
  };
  _proto.getLoop = function getLoop() {
    return this._player ? this._player.loop : false;
  };
  _proto.setCurrentTime = function setCurrentTime(time) {
    var _this$_player2;
    (_this$_player2 = this._player) == null ? void 0 : _this$_player2.seek(time)["catch"](function (e) {});
  };
  _proto.setVolume = function setVolume(volume) {
    if (this._player) {
      this._player.volume = volume;
    }
  };
  _proto.setLoop = function setLoop(loop) {
    if (this._player) {
      this._player.loop = loop;
    }
  };
  _proto.play = function play() {
    var _this$_player3;
    (_this$_player3 = this._player) == null ? void 0 : _this$_player3.play()["catch"](function (e) {});
  };
  _proto.pause = function pause() {
    var _this$_player4;
    (_this$_player4 = this._player) == null ? void 0 : _this$_player4.pause()["catch"](function (e) {});
  };
  _proto.stop = function stop() {
    var _this$_player5;
    (_this$_player5 = this._player) == null ? void 0 : _this$_player5.stop()["catch"](function (e) {});
  };
  _proto.playOneShot = function playOneShot(volume) {
    if (volume === void 0) {
      volume = 1;
    }
    if (this._nativeAsset) {
      AudioPlayer.loadOneShotAudio(this._nativeAsset.url, volume).then(function (oneShotAudio) {
        oneShotAudio.play();
      })["catch"](function (e) {});
    }
  };
  return _createClass(AudioClip, [{
    key: "duration",
    set: function set(v) {
      this._duration = v;
    }
  }, {
    key: "_nativeAsset",
    get: function get() {
      return this._meta;
    },
    set: function set(meta) {
      this._meta = meta;
      if (meta) {
        this._loadMode = meta.type;
        this._player = meta.player;
      } else {
        this._meta = null;
        this._loadMode = AudioType.UNKNOWN_AUDIO;
        this._duration = 0;
      }
    }
  }, {
    key: "_nativeDep",
    get: function get() {
      return {
        uuid: this._uuid,
        audioLoadMode: this.loadMode,
        ext: this._native,
        __isNative__: true
      };
    }
  }, {
    key: "loadMode",
    get: function get() {
      return this._loadMode;
    }
  }, {
    key: "state",
    get: function get() {
      return this._player ? this._player.state : AudioState.INIT;
    }
  }]);
}(Asset), _AudioClip.AudioType = AudioType, _AudioClip), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_duration", [serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$1.prototype, "_nativeDep", [override], Object.getOwnPropertyDescriptor(_class2$1.prototype, "_nativeDep"), _class2$1.prototype), _class2$1)) || _class$1);
cclegacy.AudioClip = AudioClip;

function loadAudioPlayer(url, options, onComplete) {
  AudioPlayer.load(url, {
    audioLoadMode: options.audioLoadMode
  }).then(function (player) {
    var audioMeta = {
      player: player,
      url: url,
      duration: player.duration,
      type: player.type
    };
    onComplete(null, audioMeta);
  })["catch"](function (err) {
    onComplete(err);
  });
}
function createAudioClip(id, data, options, onComplete) {
  var out = new AudioClip();
  out._nativeUrl = id;
  out._nativeAsset = data;
  out.duration = data.duration;
  onComplete(null, out);
}
downloader.register({
  '.mp3': loadAudioPlayer,
  '.ogg': loadAudioPlayer,
  '.wav': loadAudioPlayer,
  '.m4a': loadAudioPlayer
});
factory.register({
  '.mp3': createAudioClip,
  '.ogg': createAudioClip,
  '.wav': createAudioClip,
  '.m4a': createAudioClip
});

var AudioManager = function () {
  function AudioManager() {
    this._oneShotAudioInfoList = [];
    this._audioPlayerInfoList = [];
  }
  var _proto = AudioManager.prototype;
  _proto._findIndex = function _findIndex(audioInfoList, audio) {
    return audioInfoList.findIndex(function (item) {
      return item.audio === audio;
    });
  };
  _proto._tryAddPlaying = function _tryAddPlaying(audioInfoList, audio) {
    var idx = this._findIndex(audioInfoList, audio);
    if (idx > -1) {
      audioInfoList[idx].playTime = performance.now();
      return false;
    }
    var audioInfo = {
      audio: audio,
      playTime: performance.now()
    };
    audioInfoList.push(audioInfo);
    return true;
  };
  _proto.addPlaying = function addPlaying(audio) {
    if (audio instanceof AudioPlayer) {
      this._tryAddPlaying(this._audioPlayerInfoList, audio);
    } else {
      this._tryAddPlaying(this._oneShotAudioInfoList, audio);
    }
  };
  _proto._tryRemovePlaying = function _tryRemovePlaying(audioInfoList, audio) {
    var idx = this._findIndex(audioInfoList, audio);
    if (idx === -1) {
      return false;
    }
    fastRemoveAt(audioInfoList, idx);
    return true;
  };
  _proto.removePlaying = function removePlaying(audio) {
    if (audio instanceof AudioPlayer) {
      this._tryRemovePlaying(this._audioPlayerInfoList, audio);
    } else {
      this._tryRemovePlaying(this._oneShotAudioInfoList, audio);
    }
  };
  _proto.discardOnePlayingIfNeeded = function discardOnePlayingIfNeeded() {
    if (this._audioPlayerInfoList.length + this._oneShotAudioInfoList.length < AudioPlayer.maxAudioChannel) {
      return;
    }
    var audioInfoToDiscard;
    if (this._oneShotAudioInfoList.length > 0) {
      this._oneShotAudioInfoList.forEach(function (audioInfo) {
        if (!audioInfoToDiscard || audioInfo.playTime < audioInfoToDiscard.playTime) {
          audioInfoToDiscard = audioInfo;
        }
      });
    } else {
      this._audioPlayerInfoList.forEach(function (audioInfo) {
        if (!audioInfoToDiscard || audioInfo.playTime < audioInfoToDiscard.playTime) {
          audioInfoToDiscard = audioInfo;
        }
      });
    }
    if (audioInfoToDiscard) {
      audioInfoToDiscard.audio.stop();
      this.removePlaying(audioInfoToDiscard.audio);
    }
  };
  _proto.pause = function pause() {
    this._oneShotAudioInfoList.forEach(function (info) {
      info.audio.stop();
    });
    this._audioPlayerInfoList.forEach(function (info) {
      info.audio.pause()["catch"](function (e) {});
    });
  };
  _proto.resume = function resume() {
    this._audioPlayerInfoList.forEach(function (info) {
      info.audio.play()["catch"](function (e) {});
    });
  };
  return AudioManager;
}();
var audioManager = new AudioManager();

var _dec, _dec2, _dec3, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _AudioSource;
var _LOADED_EVENT = 'audiosource-loaded';
var AudioSourceEventType;
(function (AudioSourceEventType) {
  AudioSourceEventType["STARTED"] = "started";
  AudioSourceEventType["ENDED"] = "ended";
})(AudioSourceEventType || (AudioSourceEventType = {}));
var AudioOperationType;
(function (AudioOperationType) {
  AudioOperationType["PLAY"] = "play";
  AudioOperationType["STOP"] = "stop";
  AudioOperationType["PAUSE"] = "pause";
  AudioOperationType["SEEK"] = "seek";
})(AudioOperationType || (AudioOperationType = {}));
var AudioSource = (_dec = ccclass('cc.AudioSource'), _dec2 = type(AudioClip), _dec3 = type(AudioClip), _dec(_class = (_class2 = (_AudioSource = function (_Component) {
  function AudioSource() {
    var _this;
    _this = _Component.call(this) || this;
    _this._clip = _initializer && _initializer();
    _this._player = null;
    _this._hasRegisterListener = false;
    _this._loop = _initializer2 && _initializer2();
    _this._playOnAwake = _initializer3 && _initializer3();
    _this._volume = _initializer4 && _initializer4();
    _this._cachedCurrentTime = -1;
    _this._operationsBeforeLoading = [];
    _this._isLoaded = false;
    _this._lastSetClip = null;
    return _this;
  }
  _inheritsLoose(AudioSource, _Component);
  var _proto = AudioSource.prototype;
  _proto._resetPlayer = function _resetPlayer() {
    if (this._player) {
      audioManager.removePlaying(this._player);
      this._unregisterListener();
      this._player.destroy();
      this._player = null;
    }
  };
  _proto._syncPlayer = function _syncPlayer() {
    var _this2 = this;
    var clip = this._clip;
    if (this._lastSetClip === clip) {
      return;
    }
    if (!clip) {
      this._lastSetClip = null;
      this._resetPlayer();
      return;
    }
    if (!clip._nativeAsset) {
      console.error('Invalid audio clip');
      return;
    }
    this._isLoaded = false;
    this._lastSetClip = clip;
    this._operationsBeforeLoading.length = 0;
    AudioPlayer.load(clip._nativeAsset.url, {
      audioLoadMode: clip.loadMode
    }).then(function (player) {
      var _this2$node;
      if (_this2._lastSetClip !== clip) {
        player.destroy();
        return;
      }
      _this2._isLoaded = true;
      _this2._resetPlayer();
      _this2._player = player;
      _this2._syncStates();
      (_this2$node = _this2.node) == null ? void 0 : _this2$node.emit(_LOADED_EVENT);
    })["catch"](function (e) {});
  };
  _proto._registerListener = function _registerListener() {
    var _this3 = this;
    if (!this._hasRegisterListener && this._player) {
      var player = this._player;
      player.onEnded(function () {
        var _this3$node;
        audioManager.removePlaying(player);
        (_this3$node = _this3.node) == null ? void 0 : _this3$node.emit(AudioSourceEventType.ENDED, _this3);
      });
      player.onInterruptionBegin(function () {
        audioManager.removePlaying(player);
      });
      player.onInterruptionEnd(function () {
        if (_this3._player === player) {
          audioManager.addPlaying(player);
        }
      });
      this._hasRegisterListener = true;
    }
  };
  _proto._unregisterListener = function _unregisterListener() {
    if (this._player && this._hasRegisterListener) {
      this._player.offEnded();
      this._player.offInterruptionBegin();
      this._player.offInterruptionEnd();
      this._hasRegisterListener = false;
    }
  };
  _proto.onLoad = function onLoad() {
    this._syncPlayer();
  };
  _proto.onEnable = function onEnable() {
    if (this._playOnAwake && !this.playing) {
      this.play();
    }
  };
  _proto.onDisable = function onDisable() {
    var rootNode = this._getRootNode();
    if (rootNode != null && rootNode._persistNode) {
      return;
    }
    this.pause();
  };
  _proto.onDestroy = function onDestroy() {
    this.stop();
    this.clip = null;
  };
  _proto.getPCMData = function getPCMData(channelIndex) {
    var _this4 = this;
    return new Promise(function (resolve) {
      if (channelIndex !== 0 && channelIndex !== 1) {
        warn('Only support channel index 0 or 1 to get buffer');
        resolve(undefined);
        return;
      }
      if (_this4._player) {
        resolve(_this4._player.getPCMData(channelIndex));
      } else {
        var _this4$node;
        (_this4$node = _this4.node) == null ? void 0 : _this4$node.once(_LOADED_EVENT, function () {
          var _this4$_player;
          resolve((_this4$_player = _this4._player) == null ? void 0 : _this4$_player.getPCMData(channelIndex));
        });
      }
    });
  };
  _proto.getSampleRate = function getSampleRate() {
    var _this5 = this;
    return new Promise(function (resolve) {
      if (_this5._player) {
        resolve(_this5._player.sampleRate);
      } else {
        var _this5$node;
        (_this5$node = _this5.node) == null ? void 0 : _this5$node.once(_LOADED_EVENT, function () {
          resolve(_this5._player.sampleRate);
        });
      }
    });
  };
  _proto._getRootNode = function _getRootNode() {
    var _currentNode, _currentNode$parent;
    var currentNode = this.node;
    var currentGrandparentNode = (_currentNode = currentNode) == null ? void 0 : (_currentNode$parent = _currentNode.parent) == null ? void 0 : _currentNode$parent.parent;
    while (currentGrandparentNode) {
      var _currentNode2, _currentNode3, _currentNode3$parent;
      currentNode = (_currentNode2 = currentNode) == null ? void 0 : _currentNode2.parent;
      currentGrandparentNode = (_currentNode3 = currentNode) == null ? void 0 : (_currentNode3$parent = _currentNode3.parent) == null ? void 0 : _currentNode3$parent.parent;
    }
    return currentNode;
  };
  _proto.play = function play() {
    var _this6 = this;
    if (!this._isLoaded && this.clip) {
      this._operationsBeforeLoading.push({
        op: AudioOperationType.PLAY,
        params: null
      });
      return;
    }
    this._registerListener();
    audioManager.discardOnePlayingIfNeeded();
    if (this.state === AudioState.PLAYING) {
      var _this$_player;
      (_this$_player = this._player) == null ? void 0 : _this$_player.stop()["catch"](function (e) {});
    }
    var player = this._player;
    if (player) {
      player.play().then(function () {
        var _this6$node;
        (_this6$node = _this6.node) == null ? void 0 : _this6$node.emit(AudioSourceEventType.STARTED, _this6);
      })["catch"](function (e) {
        audioManager.removePlaying(player);
      });
      audioManager.addPlaying(player);
    }
  };
  _proto.pause = function pause() {
    var _this$_player2;
    if (!this._isLoaded && this.clip) {
      this._operationsBeforeLoading.push({
        op: AudioOperationType.PAUSE,
        params: null
      });
      return;
    }
    (_this$_player2 = this._player) == null ? void 0 : _this$_player2.pause()["catch"](function (e) {});
  };
  _proto.stop = function stop() {
    if (!this._isLoaded && this.clip) {
      this._operationsBeforeLoading.push({
        op: AudioOperationType.STOP,
        params: null
      });
      return;
    }
    if (this._player) {
      this._player.stop()["catch"](function (e) {});
      audioManager.removePlaying(this._player);
    }
  };
  _proto.playOneShot = function playOneShot(clip, volumeScale) {
    if (volumeScale === void 0) {
      volumeScale = 1;
    }
    if (!clip._nativeAsset) {
      console.error('Invalid audio clip');
      return;
    }
    var player;
    AudioPlayer.loadOneShotAudio(clip._nativeAsset.url, this._volume * volumeScale, {
      audioLoadMode: clip.loadMode
    }).then(function (oneShotAudio) {
      player = oneShotAudio;
      audioManager.discardOnePlayingIfNeeded();
      oneShotAudio.onEnd = function () {
        audioManager.removePlaying(oneShotAudio);
      };
      oneShotAudio.play();
      audioManager.addPlaying(oneShotAudio);
    })["catch"](function (e) {
      if (player) {
        audioManager.removePlaying(player);
      }
    });
  };
  _proto._syncStates = function _syncStates() {
    var _this7 = this;
    if (this._player) {
      this._player.loop = this._loop;
      this._player.volume = this._volume;
      this._operationsBeforeLoading.forEach(function (opInfo) {
        if (opInfo.op === AudioOperationType.SEEK) {
          _this7._cachedCurrentTime = opInfo.params && opInfo.params[0];
          if (_this7._player) {
            _this7._player.seek(_this7._cachedCurrentTime)["catch"](function (e) {});
          }
        } else {
          var _this7$opInfo$op;
          (_this7$opInfo$op = _this7[opInfo.op]) == null ? void 0 : _this7$opInfo$op.call(_this7);
        }
      });
      this._operationsBeforeLoading.length = 0;
    }
  };
  return _createClass(AudioSource, [{
    key: "clip",
    get: function get() {
      return this._clip;
    },
    set: function set(val) {
      if (val === this._clip) {
        return;
      }
      this._clip = val;
      this._syncPlayer();
    }
  }, {
    key: "loop",
    get: function get() {
      return this._loop;
    },
    set: function set(val) {
      this._loop = val;
      if (this._player) {
        this._player.loop = val;
      }
    }
  }, {
    key: "playOnAwake",
    get: function get() {
      return this._playOnAwake;
    },
    set: function set(val) {
      this._playOnAwake = val;
    }
  }, {
    key: "volume",
    get: function get() {
      return this._volume;
    },
    set: function set(val) {
      if (Number.isNaN(val)) {
        warn('illegal audio volume!');
        return;
      }
      val = clamp(val, 0, 1);
      if (this._player) {
        this._player.volume = val;
        this._volume = this._player.volume;
      } else {
        this._volume = val;
      }
    }
  }, {
    key: "currentTime",
    get: function get() {
      return this._player ? this._player.currentTime : this._cachedCurrentTime < 0 ? 0 : this._cachedCurrentTime;
    },
    set: function set(num) {
      var _this$_player3;
      if (Number.isNaN(num)) {
        warn('illegal audio time!');
        return;
      }
      num = clamp(num, 0, this.duration);
      if (!this._isLoaded && this.clip) {
        this._operationsBeforeLoading.push({
          op: AudioOperationType.SEEK,
          params: [num]
        });
        return;
      }
      this._cachedCurrentTime = num;
      (_this$_player3 = this._player) == null ? void 0 : _this$_player3.seek(this._cachedCurrentTime)["catch"](function (e) {});
    }
  }, {
    key: "duration",
    get: function get() {
      var _this$_clip$getDurati, _this$_clip;
      return (_this$_clip$getDurati = (_this$_clip = this._clip) == null ? void 0 : _this$_clip.getDuration()) !== null && _this$_clip$getDurati !== void 0 ? _this$_clip$getDurati : this._player ? this._player.duration : 0;
    }
  }, {
    key: "state",
    get: function get() {
      return this._player ? this._player.state : AudioState.INIT;
    }
  }, {
    key: "playing",
    get: function get() {
      return this.state === AudioSource.AudioState.PLAYING;
    }
  }], [{
    key: "maxAudioChannel",
    get: function get() {
      return AudioPlayer.maxAudioChannel;
    }
  }]);
}(Component), _AudioSource.AudioState = AudioState, _AudioSource.EventType = AudioSourceEventType, _AudioSource), _initializer = applyDecoratedInitializer(_class2.prototype, "_clip", [_dec2], function () {
  return null;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_loop", [serializable], function () {
  return false;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_playOnAwake", [serializable], function () {
  return true;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_volume", [serializable], function () {
  return 1;
}), _applyDecoratedDescriptor(_class2.prototype, "clip", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "clip"), _class2.prototype), _class2)) || _class);

replaceProperty(AudioClip, 'AudioClip', [{
  name: 'PlayingState',
  newName: 'AudioState',
  target: AudioSource,
  targetName: 'AudioSource'
}]);
markAsWarning(AudioClip.prototype, 'AudioClip.prototype', ['state', 'play', 'pause', 'stop', 'playOneShot', 'setCurrentTime', 'setVolume', 'setLoop', 'getCurrentTime', 'getVolume', 'getLoop'].map(function (item) {
  return {
    name: item,
    suggest: "please use AudioSource.prototype." + item + " instead"
  };
}));

cclegacy.AudioSourceComponent = AudioSource;
setClassAlias(AudioSource, 'cc.AudioSourceComponent');

export { AudioClip, AudioPCMDataView, AudioSource, AudioSource as AudioSourceComponent };
//# sourceMappingURL=audio.js.map
