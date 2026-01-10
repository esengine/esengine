import { a as _createClass, _ as _inheritsLoose, s as settings, S as SettingsCategory, d as CCObjectFlags, w as warnID } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { M as MeshRenderer } from './mesh-renderer-CdPG3X-W.js';
import './prefab-DYg_oxpo.js';
import { _ as _createMesh } from './create-mesh-CfKC5EQd.js';
import './debug-view-BuNhRPv_.js';
import { N as Node, b as Material } from './scene-vWcxM1_c.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { z as TextureInfo, E as TextureType, H as TextureUsageBit, F as Format, J as BufferTextureCopy } from './buffer-barrier-BlQXg9Aa.js';
import { L as Layers } from './pipeline-state-manager-C5U4ouGL.js';
import './node-event-Ccvtv8bJ.js';
import { c as ccclass, q as preTransforms, n as sys, S as System, C as Color } from './index-uXI1_UMk.js';
import { c as cclegacy, a as ccwindow } from './global-exports-DnCP_14L.js';
import { G as Game, g as game } from './deprecated-Dswa7XeN.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './deprecated-n0w4kK7g.js';
import './deprecated-CN-RjLP6.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './touch-BKrZ-fxl.js';

var Counter = function () {
  function Counter(id, opts, now) {
    this._total = 0;
    this._value = 0;
    this._averageValue = 0;
    this._accumValue = 0;
    this._accumSamples = 0;
    this._id = id;
    this._opts = opts;
    this._accumStart = now;
  }
  var _proto = Counter.prototype;
  _proto.sample = function sample(now) {
    this._average(this._value, now);
  };
  _proto.human = function human() {
    var _this$_opts = this._opts,
      average = _this$_opts.average,
      isInteger = _this$_opts.isInteger;
    var v = average ? this._averageValue : this._value;
    return isInteger ? Math.round(v) : Math.round(v * 100) / 100;
  };
  _proto.alarm = function alarm() {
    if (this._opts.below !== undefined && this._value < this._opts.below) {
      return true;
    }
    if (this._opts.over !== undefined && this._value > this._opts.over) {
      return true;
    }
    return false;
  };
  _proto._average = function _average(v, now) {
    if (now === void 0) {
      now = 0;
    }
    if (this._opts.average) {
      this._accumValue += v;
      ++this._accumSamples;
      var t = now;
      if (t - this._accumStart >= this._opts.average) {
        this._averageValue = this._accumValue / this._accumSamples;
        this._accumValue = 0;
        this._accumStart = t;
        this._accumSamples = 0;
      }
    }
  };
  return _createClass(Counter, [{
    key: "value",
    get: function get() {
      return this._value;
    },
    set: function set(val) {
      this._value = val;
    }
  }]);
}();

var _dec, _class;
var PerfCounter = (_dec = ccclass('cc.PerfCounter'), _dec(_class = function (_Counter) {
  function PerfCounter(id, opts, now) {
    var _this;
    _this = _Counter.call(this, id, opts, now) || this;
    _this._time = now;
    return _this;
  }
  _inheritsLoose(PerfCounter, _Counter);
  var _proto = PerfCounter.prototype;
  _proto.start = function start(now) {
    if (now === void 0) {
      now = 0;
    }
    this._time = now;
  };
  _proto.end = function end(now) {
    if (now === void 0) {
      now = 0;
    }
    this._value = now - this._time;
    this._average(this._value);
  };
  _proto.tick = function tick() {
    this.end();
    this.start();
  };
  _proto.frame = function frame(now) {
    var t = now;
    var e = t - this._time;
    this._total++;
    var avg = this._opts.average || 1000;
    if (e > avg) {
      this._value = this._total * 1000 / e;
      this._total = 0;
      this._time = t;
      this._average(this._value);
    }
  };
  return PerfCounter;
}(Counter)) || _class);

var _characters = '0123456789. ';
var _average = 500;
var _string2offset = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  '.': 10
};
var _profileInfo = {
  fps: {
    desc: "Framerate (FPS)",
    below: 30,
    average: _average,
    isInteger: true
  },
  draws: {
    desc: 'Draw call',
    isInteger: true
  },
  frame: {
    desc: 'Frame time (ms)',
    min: 0,
    max: 50,
    average: _average
  },
  instances: {
    desc: 'Instance Count',
    isInteger: true
  },
  tricount: {
    desc: 'Triangle',
    isInteger: true
  },
  logic: {
    desc: 'Game Logic (ms)',
    min: 0,
    max: 50,
    average: _average,
    color: '#080'
  },
  physics: {
    desc: 'Physics (ms)',
    min: 0,
    max: 50,
    average: _average
  },
  render: {
    desc: 'Renderer (ms)',
    min: 0,
    max: 50,
    average: _average,
    color: '#f90'
  },
  present: {
    desc: 'Present (ms)',
    min: 0,
    max: 50,
    average: _average,
    color: '#f90'
  },
  textureMemory: {
    desc: 'GFX Texture Mem(M)'
  },
  bufferMemory: {
    desc: 'GFX Buffer Mem(M)'
  }
};
var _constants = {
  fontSize: 23,
  quadHeight: 0.4,
  segmentsPerLine: 8,
  textureWidth: 280,
  textureHeight: 280
};
var Profiler = function (_System) {
  function Profiler() {
    var _this;
    _this = _System.call(this) || this;
    _this._profilerStats = null;
    _this._showFPS = false;
    _this._rootNode = null;
    _this._device = null;
    _this._swapchain = null;
    _this._meshRenderer = null;
    _this._canvas = null;
    _this._ctx = null;
    _this._texture = null;
    _this._region = new BufferTextureCopy();
    _this._canvasArr = [];
    _this._regionArr = [_this._region];
    _this.digitsData = null;
    _this.offsetData = null;
    _this.pass = null;
    _this._canvasDone = false;
    _this._statsDone = false;
    _this._inited = false;
    _this._lineHeight = _constants.textureHeight / (Object.keys(_profileInfo).length + 1);
    _this._wordHeight = 0;
    _this._eachNumWidth = 0;
    _this._totalLines = 0;
    _this.lastTime = 0;
    _this._backgroundColor = new Color(150, 150, 150, 100);
    _this._fontColor = Color.WHITE.clone();
    return _this;
  }
  _inheritsLoose(Profiler, _System);
  var _proto = Profiler.prototype;
  _proto.init = function init() {
    var showFPS = !!settings.querySettings(SettingsCategory.PROFILING, 'showFPS');
    if (showFPS) {
      this.showStats();
    } else {
      this.hideStats();
    }
  };
  _proto.setBackgroundColor = function setBackgroundColor(color) {
    if (this._backgroundColor.equals(color)) {
      return;
    }
    this._backgroundColor.set(color);
    if (this._showFPS) {
      this.hideStats();
      this.showStats();
    }
  };
  _proto.setFontColor = function setFontColor(color) {
    if (this._fontColor.equals(color)) {
      return;
    }
    this._fontColor.set(color);
    if (this._showFPS) {
      this.hideStats();
      this.showStats();
    }
  };
  _proto.isShowingStats = function isShowingStats() {
    return this._showFPS;
  };
  _proto.hideStats = function hideStats() {
    var self = this;
    if (self._showFPS) {
      self._profilerStats = null;
      if (self._rootNode) {
        self._rootNode.destroy();
        self._rootNode = null;
      }
      self._device = null;
      self._swapchain = null;
      var meshRenderer = self._meshRenderer;
      if (meshRenderer) {
        var _meshRenderer$sharedM, _meshRenderer$mesh;
        (_meshRenderer$sharedM = meshRenderer.sharedMaterial) == null ? void 0 : _meshRenderer$sharedM.destroy();
        (_meshRenderer$mesh = meshRenderer.mesh) == null ? void 0 : _meshRenderer$mesh.destroy();
        meshRenderer.destroy();
        self._meshRenderer = null;
      }
      self._canvas = null;
      self._ctx = null;
      if (self._texture) {
        self._texture.destroy();
        self._texture = null;
      }
      self._canvasArr.length = 0;
      self.digitsData = null;
      self.offsetData = null;
      self.pass = null;
      self._canvasDone = false;
      self._statsDone = false;
      self._inited = false;
      self._wordHeight = 0;
      self._eachNumWidth = 0;
      self._totalLines = 0;
      self.lastTime = 0;
      director.off(DirectorEvent.BEFORE_UPDATE, self.beforeUpdate, self);
      director.off(DirectorEvent.AFTER_UPDATE, self.afterUpdate, self);
      director.off(DirectorEvent.BEFORE_PHYSICS, self.beforePhysics, self);
      director.off(DirectorEvent.AFTER_PHYSICS, self.afterPhysics, self);
      director.off(DirectorEvent.BEFORE_DRAW, self.beforeDraw, self);
      director.off(DirectorEvent.AFTER_RENDER, self.afterRender, self);
      director.off(DirectorEvent.AFTER_DRAW, self.afterPresent, self);
      self._showFPS = false;
      director.root.pipeline.profiler = null;
      cclegacy.game.config.showFPS = false;
    }
  };
  _proto.showStats = function showStats() {
    var game = cclegacy.game;
    if (!this._showFPS) {
      this._canvas = ccwindow.document.createElement('canvas');
      this._ctx = this._canvas.getContext('2d');
      this._canvasArr.push(this._canvas);
      if (!this._device) {
        var root = cclegacy.director.root;
        this._device = deviceManager.gfxDevice;
        this._swapchain = root.mainWindow.swapchain;
      }
      this.generateCanvas();
      this.generateStats();
      game.once(Game.EVENT_ENGINE_INITED, this.generateNode, this);
      game.on(Game.EVENT_RESTART, this.generateNode, this);
      if (this._rootNode) {
        this._rootNode.active = true;
      }
      director.on(DirectorEvent.BEFORE_UPDATE, this.beforeUpdate, this);
      director.on(DirectorEvent.AFTER_UPDATE, this.afterUpdate, this);
      director.on(DirectorEvent.BEFORE_PHYSICS, this.beforePhysics, this);
      director.on(DirectorEvent.AFTER_PHYSICS, this.afterPhysics, this);
      director.on(DirectorEvent.BEFORE_DRAW, this.beforeDraw, this);
      director.on(DirectorEvent.AFTER_RENDER, this.afterRender, this);
      director.on(DirectorEvent.AFTER_DRAW, this.afterPresent, this);
      this._showFPS = true;
      this._canvasDone = true;
      this._statsDone = true;
      game.config.showFPS = true;
    }
  };
  _proto.generateCanvas = function generateCanvas() {
    if (this._canvasDone) {
      return;
    }
    var textureWidth = _constants.textureWidth,
      textureHeight = _constants.textureHeight;
    var canvas = this._canvas;
    var ctx = this._ctx;
    if (!ctx || !canvas) {
      return;
    }
    canvas.width = textureWidth;
    canvas.height = textureHeight;
    canvas.style.width = "" + canvas.width;
    canvas.style.height = "" + canvas.height;
    ctx.font = _constants.fontSize + "px Arial";
    ctx.textBaseline = 'top';
    var fontColor = this._fontColor;
    ctx.fillStyle = "rgba(" + fontColor.r + ", " + fontColor.g + ", " + fontColor.b + ", " + fontColor.a / 255 + ")";
    this._texture = this._device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.SAMPLED | TextureUsageBit.TRANSFER_DST, Format.RGBA8, textureWidth, textureHeight));
    var texExtent = this._region.texExtent;
    texExtent.width = textureWidth;
    texExtent.height = textureHeight;
  };
  _proto.generateStats = function generateStats() {
    var canvas = this._canvas;
    var ctx = this._ctx;
    if (this._statsDone || !ctx || !canvas) {
      return;
    }
    this._profilerStats = null;
    var now = performance.now();
    ctx.textAlign = 'left';
    var i = 0;
    for (var id in _profileInfo) {
      var element = _profileInfo[id];
      ctx.fillText(element.desc, 0, i * this._lineHeight);
      element.counter = new PerfCounter(id, element, now);
      i++;
    }
    this._totalLines = i;
    this._wordHeight = this._totalLines * this._lineHeight / canvas.height;
    var j = 0;
    for (j = 0; j < _characters.length; ++j) {
      var offset = ctx.measureText(_characters[j]).width;
      this._eachNumWidth = Math.max(this._eachNumWidth, offset);
    }
    for (j = 0; j < _characters.length; ++j) {
      ctx.fillText(_characters[j], j * this._eachNumWidth, this._totalLines * this._lineHeight);
    }
    var bgColor = this._backgroundColor;
    ctx.fillStyle = "rgba(" + bgColor.r + ", " + bgColor.g + ", " + bgColor.b + ", " + bgColor.a / 255 + ")";
    ctx.fillRect(canvas.width - 4, canvas.height - 4, 4, 4);
    this._eachNumWidth /= canvas.width;
    this._profilerStats = _profileInfo;
    this._canvasArr[0] = canvas;
    this._device.copyTexImagesToTexture(this._canvasArr, this._texture, this._regionArr);
  };
  _proto.generateNode = function generateNode() {
    if (this._rootNode && this._rootNode.isValid) {
      return;
    }
    var canvas = this._canvas;
    this._rootNode = new Node('PROFILER_NODE');
    this._rootNode._objFlags = CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
    game.addPersistRootNode(this._rootNode);
    var managerNode = new Node('Profiler_Root');
    managerNode.parent = this._rootNode;
    var height = _constants.quadHeight;
    var rowHeight = height / this._totalLines;
    var lWidth = height / this._wordHeight;
    var scale = rowHeight / _constants.fontSize;
    var columnWidth = this._eachNumWidth * canvas.width * scale;
    var bgRight = lWidth + _constants.segmentsPerLine * columnWidth;
    var bgPadding = columnWidth;
    var vertexPos = [-bgPadding, height + bgPadding, 0, bgRight + bgPadding, height + bgPadding, 0, bgRight + bgPadding, -bgPadding, 0, -bgPadding, -bgPadding, 0];
    var vertexindices = [0, 2, 1, 0, 3, 2];
    var bgUvOriginX = (canvas.width - 3) / canvas.width;
    var bgUvOriginY = (canvas.height - 3) / canvas.height;
    var bgUvRight = (canvas.width - 1) / canvas.width;
    var bgUvTop = (canvas.height - 1) / canvas.width;
    var vertexUV = [bgUvOriginX, bgUvOriginY, -1, 0, bgUvRight, bgUvOriginY, -1, 0, bgUvRight, bgUvTop, -1, 0, bgUvOriginX, bgUvTop, -1, 0];
    vertexPos.push(0, height, 0, lWidth, height, 0, lWidth, 0, 0, 0, 0, 0);
    vertexindices.push(4, 6, 5, 4, 7, 6);
    vertexUV.push(0, 0, -1, 0, 1, 0, -1, 0, 1, this._wordHeight, -1, 0, 0, this._wordHeight, -1, 0);
    var offset = 0;
    for (var i = 0; i < this._totalLines; i++) {
      for (var j = 0; j < _constants.segmentsPerLine; j++) {
        vertexPos.push(lWidth + j * columnWidth, height - i * rowHeight, 0);
        vertexPos.push(lWidth + (j + 1) * columnWidth, height - i * rowHeight, 0);
        vertexPos.push(lWidth + (j + 1) * columnWidth, height - (i + 1) * rowHeight, 0);
        vertexPos.push(lWidth + j * columnWidth, height - (i + 1) * rowHeight, 0);
        offset = (i * _constants.segmentsPerLine + j + 2) * 4;
        vertexindices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
        var idx = i * _constants.segmentsPerLine + j;
        var z = Math.floor(idx / 4);
        var w = idx - z * 4;
        vertexUV.push(0, this._wordHeight, z, w);
        vertexUV.push(this._eachNumWidth, this._wordHeight, z, w);
        vertexUV.push(this._eachNumWidth, 1, z, w);
        vertexUV.push(0, 1, z, w);
      }
    }
    this._meshRenderer = managerNode.addComponent(MeshRenderer);
    this._meshRenderer.mesh = _createMesh({
      positions: vertexPos,
      indices: vertexindices,
      colors: vertexUV
    });
    var _material = new Material();
    _material.initialize({
      effectName: 'util/profiler'
    });
    var pass = this.pass = _material.passes[0];
    var hTexture = pass.getBinding('mainTexture');
    var bDigits = pass.getBinding('digits');
    var bOffset = pass.getBinding('offset');
    pass.bindTexture(hTexture, this._texture);
    this.digitsData = pass.blocks[bDigits];
    this.offsetData = pass.blocks[bOffset];
    this.offsetData[3] = -1;
    this._meshRenderer.material = _material;
    this._meshRenderer.node.layer = Layers.Enum.PROFILER;
    this._inited = true;
  };
  _proto.beforeUpdate = function beforeUpdate() {
    var profilerStats = this._profilerStats;
    if (!profilerStats) {
      return;
    }
    var now = performance.now();
    profilerStats.frame.counter.start(now);
    profilerStats.logic.counter.start(now);
  };
  _proto.afterUpdate = function afterUpdate() {
    var profilerStats = this._profilerStats;
    if (!profilerStats) {
      return;
    }
    var now = performance.now();
    if (director.isPaused()) {
      profilerStats.frame.counter.start(now);
    } else {
      profilerStats.logic.counter.end(now);
    }
  };
  _proto.beforePhysics = function beforePhysics() {
    if (!this._profilerStats) {
      return;
    }
    var now = performance.now();
    this._profilerStats.physics.counter.start(now);
  };
  _proto.afterPhysics = function afterPhysics() {
    if (!this._profilerStats) {
      return;
    }
    var now = performance.now();
    this._profilerStats.physics.counter.end(now);
  };
  _proto.beforeDraw = function beforeDraw() {
    if (!this._profilerStats || !this._inited) {
      return;
    }
    var surfaceTransform = this._swapchain.surfaceTransform;
    var clipSpaceSignY = this._device.capabilities.clipSpaceSignY;
    if (surfaceTransform !== this.offsetData[3]) {
      var preTransform = preTransforms[surfaceTransform];
      var x = -0.9;
      var y = -0.9 * clipSpaceSignY;
      if (sys.isXR) {
        x = -0.5;
        y = -0.5 * clipSpaceSignY;
      }
      this.offsetData[0] = x * preTransform[0] + y * preTransform[2];
      this.offsetData[1] = x * preTransform[1] + y * preTransform[3];
      this.offsetData[2] = this._eachNumWidth;
      this.offsetData[3] = surfaceTransform;
    }
    this.pass.setRootBufferDirty(true);
    if (this._meshRenderer.model) {
      director.root.pipeline.profiler = this._meshRenderer.model;
    } else {
      director.root.pipeline.profiler = null;
    }
    var now = performance.now();
    this._profilerStats.render.counter.start(now);
  };
  _proto.afterRender = function afterRender() {
    var profilerStats = this._profilerStats;
    if (!profilerStats || !this._inited) {
      return;
    }
    var now = performance.now();
    profilerStats.render.counter.end(now);
    profilerStats.present.counter.start(now);
  };
  _proto.afterPresent = function afterPresent() {
    var profilerStats = this._profilerStats;
    if (!profilerStats || !this._inited) {
      return;
    }
    var now = performance.now();
    profilerStats.frame.counter.end(now);
    profilerStats.fps.counter.frame(now);
    profilerStats.present.counter.end(now);
    if (now - this.lastTime < _average) {
      return;
    }
    this.lastTime = now;
    var device = this._device;
    profilerStats.draws.counter.value = device.numDrawCalls;
    profilerStats.instances.counter.value = device.numInstances;
    profilerStats.bufferMemory.counter.value = device.memoryStatus.bufferSize / (1024 * 1024);
    profilerStats.textureMemory.counter.value = device.memoryStatus.textureSize / (1024 * 1024);
    profilerStats.tricount.counter.value = device.numTris;
    var i = 0;
    var view = this.digitsData;
    var segmentsPerLine = _constants.segmentsPerLine;
    for (var id in profilerStats) {
      var stat = profilerStats[id];
      stat.counter.sample(now);
      var result = stat.counter.human().toString();
      for (var j = segmentsPerLine - 1; j >= 0; j--) {
        var index = i * segmentsPerLine + j;
        var character = result[result.length - (segmentsPerLine - j)];
        var offset = _string2offset[character];
        if (offset === undefined) {
          offset = 11;
        }
        view[index] = offset;
      }
      i++;
    }
  };
  return _createClass(Profiler, [{
    key: "_stats",
    get: function get() {
      warnID(16381);
      return this._profilerStats;
    }
  }, {
    key: "stats",
    get: function get() {
      return this._profilerStats;
    }
  }]);
}(System);
var profiler = new Profiler();
director.registerSystem('profiler', profiler, 0);
cclegacy.profiler = profiler;

export { Profiler, profiler };
//# sourceMappingURL=profiler.js.map
