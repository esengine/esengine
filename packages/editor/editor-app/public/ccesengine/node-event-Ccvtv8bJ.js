import { $ as systemInfo, a4 as OS, t as createMap, a as _createClass, w as warnID, am as BASE64_VALUES, l as _createForOfIteratorHelperLoose, Q as error, _ as _inheritsLoose, D as debug, g as getError, Z as Eventify, O as CCObject, b as _applyDecoratedDescriptor, d as CCObjectFlags, N as assertID, an as getClassName, v as value, ao as IDGenerator } from './gc-object-CShF5lzx.js';
import { c as ccclass$1, b as applyDecoratedInitializer, s as serializable$1, p as property$1, t as type } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';

var EXTNAME_RE = /(\.[^./?\\]*)(\?.*)?$/;
var DIRNAME_RE = /((.*)(\/|\\|\\\\))?(.*?\..*$)?/;
var NORMALIZE_RE = /[^./]+\/\.\.\//;
function join() {
  var result = '';
  for (var _len = arguments.length, segments = new Array(_len), _key = 0; _key < _len; _key++) {
    segments[_key] = arguments[_key];
  }
  segments.forEach(function (segment) {
    result = (result + (result === '' ? '' : '/') + segment).replace(/(\/|\\\\)$/, '');
  });
  return result;
}
function extname(path) {
  var temp = EXTNAME_RE.exec(path);
  return temp ? temp[1] : '';
}
function mainFileName(fileName) {
  if (fileName) {
    var idx = fileName.lastIndexOf('.');
    if (idx !== -1) {
      return fileName.substring(0, idx);
    }
  }
  return fileName;
}
function basename(path, extName) {
  var index = path.indexOf('?');
  if (index > 0) {
    path = path.substring(0, index);
  }
  var reg = /(\/|\\)([^/\\]+)$/g;
  var result = reg.exec(path.replace(/(\/|\\)$/, ''));
  if (!result) {
    return path;
  }
  var baseName = result[2];
  if (extName && path.substring(path.length - extName.length).toLowerCase() === extName.toLowerCase()) {
    return baseName.substring(0, baseName.length - extName.length);
  }
  return baseName;
}
function dirname(path) {
  var temp = DIRNAME_RE.exec(path);
  return temp ? temp[2] : '';
}
function changeExtname(path, extName) {
  extName = extName || '';
  var index = path.indexOf('?');
  var tempStr = '';
  if (index > 0) {
    tempStr = path.substring(index);
    path = path.substring(0, index);
  }
  index = path.lastIndexOf('.');
  if (index < 0) {
    return path + extName + tempStr;
  }
  return path.substring(0, index) + extName + tempStr;
}
function changeBasename(path, newBaseName, keepExt) {
  if (newBaseName.indexOf('.') === 0) {
    return changeExtname(path, newBaseName);
  }
  var index = path.indexOf('?');
  var tempStr = '';
  var ext = keepExt ? extname(path) : '';
  if (index > 0) {
    tempStr = path.substring(index);
    path = path.substring(0, index);
  }
  index = path.lastIndexOf('/');
  index = index <= 0 ? 0 : index + 1;
  return path.substring(0, index) + newBaseName + ext + tempStr;
}
function _normalize(url) {
  var oldUrl = url = String(url);
  do {
    oldUrl = url;
    url = url.replace(NORMALIZE_RE, '');
  } while (oldUrl.length !== url.length);
  return url;
}
function stripSep(path) {
  return path.replace(/[/\\]$/, '');
}
function getSeperator() {
  return systemInfo.os === OS.WINDOWS ? '\\' : '/';
}

var path = /*#__PURE__*/Object.freeze({
    __proto__: null,
    _normalize: _normalize,
    basename: basename,
    changeBasename: changeBasename,
    changeExtname: changeExtname,
    dirname: dirname,
    extname: extname,
    getSeperator: getSeperator,
    join: join,
    mainFileName: mainFileName,
    stripSep: stripSep
});

var Cache = function () {
  function Cache(map) {
    this._map = null;
    this._count = 0;
    if (map) {
      this._map = map;
      this._count = Object.keys(map).length;
    } else {
      this._map = createMap(true);
      this._count = 0;
    }
  }
  var _proto = Cache.prototype;
  _proto.add = function add(key, val) {
    if (!(key in this._map)) {
      this._count++;
    }
    return this._map[key] = val;
  };
  _proto.get = function get(key) {
    return this._map[key];
  };
  _proto.has = function has(key) {
    return key in this._map;
  };
  _proto.remove = function remove(key) {
    var out = this._map[key];
    if (key in this._map) {
      delete this._map[key];
      this._count--;
    }
    return out;
  };
  _proto.clear = function clear() {
    if (this._count !== 0) {
      this._map = createMap(true);
      this._count = 0;
    }
  };
  _proto.forEach = function forEach(func) {
    for (var _key in this._map) {
      func(this._map[_key], _key);
    }
  };
  _proto.find = function find(predicate) {
    for (var _key2 in this._map) {
      if (predicate(this._map[_key2], _key2)) {
        return this._map[_key2];
      }
    }
    return null;
  };
  _proto.destroy = function destroy() {
    this._map = null;
  };
  return _createClass(Cache, [{
    key: "map",
    get: function get() {
      return this._map;
    }
  }, {
    key: "count",
    get: function get() {
      return this._count;
    }
  }]);
}();

var Pipeline = function () {
  function Pipeline(name, funcs) {
    this.id = Pipeline._pipelineId++;
    this.name = '';
    this.pipes = [];
    this.name = name;
    for (var i = 0, l = funcs.length; i < l; i++) {
      this.pipes.push(funcs[i]);
    }
  }
  var _proto = Pipeline.prototype;
  _proto.insert = function insert(func, index) {
    if (index > this.pipes.length) {
      warnID(4921);
      return this;
    }
    this.pipes.splice(index, 0, func);
    return this;
  };
  _proto.append = function append(func) {
    this.pipes.push(func);
    return this;
  };
  _proto.remove = function remove(index) {
    this.pipes.splice(index, 1);
    return this;
  };
  _proto.sync = function sync(task) {
    var pipes = this.pipes;
    if (pipes.length === 0) {
      return null;
    }
    task.isFinished = false;
    for (var i = 0, l = pipes.length; i < l;) {
      var pipe = pipes[i];
      var result = pipe(task);
      if (result) {
        task.isFinished = true;
        return result;
      }
      i++;
      if (i !== l) {
        task.input = task.output;
        task.output = null;
      }
    }
    task.isFinished = true;
    return task.output;
  };
  _proto.async = function async(task) {
    var pipes = this.pipes;
    if (pipes.length === 0) {
      return;
    }
    task.isFinished = false;
    this._flow(0, task);
  };
  _proto._flow = function _flow(index, task) {
    var _this = this;
    var pipe = this.pipes[index];
    pipe(task, function (result) {
      if (result) {
        task.isFinished = true;
        task.dispatch('complete', result);
      } else {
        index++;
        if (index < _this.pipes.length) {
          task.input = task.output;
          task.output = null;
          _this._flow(index, task);
        } else {
          task.isFinished = true;
          task.dispatch('complete', result, task.output);
        }
      }
    });
  };
  return Pipeline;
}();
Pipeline._pipelineId = 0;

var assets = new Cache();
var files = new Cache();
var parsed = new Cache();
var bundles = new Cache();
var pipeline = new Pipeline('normal load', []);
var fetchPipeline = new Pipeline('fetch', []);
var transformPipeline = new Pipeline('transform url', []);
var references = null;
var assetsOverrideMap = new Map();
var RequestType;
(function (RequestType) {
  RequestType["UUID"] = "uuid";
  RequestType["PATH"] = "path";
  RequestType["DIR"] = "dir";
  RequestType["URL"] = "url";
  RequestType["SCENE"] = "scene";
})(RequestType || (RequestType = {}));
var presets = {
  "default": {
    priority: 0
  },
  preload: {
    maxConcurrency: 6,
    maxRequestsPerFrame: 2,
    priority: -1
  },
  scene: {
    maxConcurrency: 20,
    maxRequestsPerFrame: 20,
    priority: 1
  },
  bundle: {
    maxConcurrency: 20,
    maxRequestsPerFrame: 20,
    priority: 2
  },
  remote: {
    maxRetryCount: 4
  }
};
var BuiltinBundleName;
(function (BuiltinBundleName) {
  BuiltinBundleName["INTERNAL"] = "internal";
  BuiltinBundleName["RESOURCES"] = "resources";
  BuiltinBundleName["MAIN"] = "main";
  BuiltinBundleName["START_SCENE"] = "start-scene";
})(BuiltinBundleName || (BuiltinBundleName = {}));

var Task = function () {
  function Task(options) {
    this.id = Task._taskId++;
    this.onComplete = null;
    this.onProgress = null;
    this.onError = null;
    this.source = null;
    this.output = null;
    this.input = null;
    this.progress = null;
    this.options = null;
    this.isFinished = true;
    this.set(options);
  }
  Task.create = function create(options) {
    var out;
    if (Task._deadPool.length !== 0) {
      out = Task._deadPool.pop();
      out.set(options);
    } else {
      out = new Task(options);
    }
    return out;
  };
  var _proto = Task.prototype;
  _proto.set = function set(options) {
    if (options === void 0) {
      options = Object.create(null);
    }
    this.onComplete = options.onComplete || null;
    this.onProgress = options.onProgress || null;
    this.onError = options.onError || null;
    this.source = this.input = options.input;
    this.output = null;
    this.progress = options.progress;
    this.options = options.options || Object.create(null);
  };
  _proto.dispatch = function dispatch(event, param1, param2, param3, param4) {
    switch (event) {
      case 'complete':
        if (this.onComplete) {
          this.onComplete(param1, param2);
        }
        break;
      case 'progress':
        if (this.onProgress) {
          this.onProgress(param1, param2, param3, param4);
        }
        break;
      case 'error':
        if (this.onError) {
          this.onError(param1, param2, param3, param4);
        }
        break;
      default:
        {
          var str = "on" + event[0].toUpperCase() + event.substring(1);
          if (typeof this[str] === 'function') {
            this[str](param1, param2, param3, param4);
          }
          break;
        }
    }
  };
  _proto.recycle = function recycle() {
    if (Task._deadPool.length === Task.MAX_DEAD_NUM) {
      return;
    }
    this.onComplete = null;
    this.onProgress = null;
    this.onError = null;
    this.source = this.output = this.input = null;
    this.progress = null;
    this.options = null;
    Task._deadPool.push(this);
  };
  return _createClass(Task, [{
    key: "isFinish",
    get: function get() {
      return this.isFinished;
    },
    set: function set(val) {
      this.isFinished = val;
    }
  }]);
}();
Task.MAX_DEAD_NUM = 500;
Task._taskId = 0;
Task._deadPool = [];

var separator = '@';
var HexChars = '0123456789abcdef'.split('');
var _t = ['', '', '', ''];
var UuidTemplate = _t.concat(_t, '-', _t, '-', _t, '-', _t, '-', _t, _t, _t);
var Indices = UuidTemplate.map(function (x, i) {
  return x === '-' ? NaN : i;
}).filter(Number.isFinite);
function decodeUuid$1(base64) {
  var strs = base64.split(separator);
  var uuid = strs[0];
  if (uuid.length !== 22) {
    return base64;
  }
  UuidTemplate[0] = base64[0];
  UuidTemplate[1] = base64[1];
  for (var i = 2, j = 2; i < 22; i += 2) {
    var lhs = BASE64_VALUES[base64.charCodeAt(i)];
    var rhs = BASE64_VALUES[base64.charCodeAt(i + 1)];
    UuidTemplate[Indices[j++]] = HexChars[lhs >> 2];
    UuidTemplate[Indices[j++]] = HexChars[(lhs & 3) << 2 | rhs >> 4];
    UuidTemplate[Indices[j++]] = HexChars[rhs & 0xF];
  }
  return base64.replace(uuid, UuidTemplate.join(''));
}

var _uuidRegex = /.*[/\\][0-9a-fA-F]{2}[/\\]([0-9a-fA-F-@]{8,}).*/;
function decodeUuid(base64) {
  return decodeUuid$1(base64);
}
function getUuidFromURL(url) {
  var matches = _uuidRegex.exec(url);
  if (matches) {
    return matches[1];
  }
  return '';
}
function getUrlWithUuid(uuid, options) {
  options = options || Object.create(null);
  options.__isNative__ = options.isNative;
  if (options.nativeExt) {
    options.ext = options.nativeExt;
  }
  var bundle = bundles.find(function (b) {
    return !!b.getAssetInfo(uuid);
  });
  if (bundle) {
    options.bundle = bundle.name;
  }
  return transform(uuid, options);
}
function isScene(asset) {
  return !!asset && (asset instanceof cclegacy.SceneAsset || asset instanceof cclegacy.Scene);
}
function normalize(url) {
  if (url) {
    if (url.charCodeAt(0) === 46 && url.charCodeAt(1) === 47) {
      url = url.slice(2);
    } else if (url.charCodeAt(0) === 47) {
      url = url.slice(1);
    }
  }
  return url;
}
function transform(input, options) {
  var subTask = Task.create({
    input: input,
    options: options
  });
  var urls = [];
  try {
    var result = transformPipeline.sync(subTask);
    for (var _iterator = _createForOfIteratorHelperLoose(result), _step; !(_step = _iterator()).done;) {
      var requestItem = _step.value;
      var url = requestItem.url;
      requestItem.recycle();
      urls.push(url);
    }
  } catch (e) {
    for (var _iterator2 = _createForOfIteratorHelperLoose(subTask.output), _step2; !(_step2 = _iterator2()).done;) {
      var item = _step2.value;
      item.recycle();
    }
    error(e.message, e.stack);
  }
  subTask.recycle();
  return urls.length > 1 ? urls : urls[0];
}

var helper = /*#__PURE__*/Object.freeze({
    __proto__: null,
    decodeUuid: decodeUuid,
    getUrlWithUuid: getUrlWithUuid,
    getUuidFromURL: getUuidFromURL,
    isScene: isScene,
    normalize: normalize,
    transform: transform
});

var _dec$3, _class$3, _class2$3, _initializer$2;
var ccclass = ccclass$1,
  serializable = serializable$1,
  property = property$1;
var Asset = (_dec$3 = ccclass('cc.Asset'), _dec$3(_class$3 = (_class2$3 = function (_Eventify) {
  function Asset(name) {
    var _this;
    _this = _Eventify.call(this, name) || this;
    _this.loaded = true;
    _this._native = _initializer$2 && _initializer$2();
    _this._nativeUrl = '';
    _this._file = null;
    _this._ref = 0;
    Object.defineProperty(_this, '_uuid', {
      value: '',
      writable: true
    });
    {
      Object.defineProperty(_this, 'isDefault', {
        value: false,
        writable: true
      });
    }
    return _this;
  }
  _inheritsLoose(Asset, _Eventify);
  Asset.deserialize = function deserialize(data) {
    return cclegacy.deserialize(data);
  };
  var _proto = Asset.prototype;
  _proto.toString = function toString() {
    return this.nativeUrl;
  };
  _proto.serialize = function serialize() {};
  _proto._setRawAsset = function _setRawAsset(filename, inLibrary) {
    if (inLibrary === void 0) {
      inLibrary = true;
    }
    if (inLibrary !== false) {
      this._native = filename || '';
    } else {
      this._native = "/" + filename;
    }
  };
  _proto.addRef = function addRef() {
    this._ref++;
    return this;
  };
  _proto.decRef = function decRef(autoRelease) {
    if (autoRelease === void 0) {
      autoRelease = true;
    }
    if (this._ref > 0) {
      this._ref--;
    }
    if (autoRelease) {
      cclegacy.assetManager.getReleaseManager().tryRelease(this);
    }
    return this;
  };
  _proto.onLoaded = function onLoaded() {};
  _proto.initDefault = function initDefault(uuid) {
    if (uuid) {
      this._uuid = uuid;
    }
    this.isDefault = true;
  };
  _proto.validate = function validate() {
    return true;
  };
  _proto.destroy = function destroy() {
    debug(getError(12101, this._uuid));
    return _Eventify.prototype.destroy.call(this);
  };
  return _createClass(Asset, [{
    key: "nativeUrl",
    get: function get() {
      if (!this._nativeUrl) {
        if (!this._native) return '';
        var name = this._native;
        if (name.charCodeAt(0) === 47) {
          return name.slice(1);
        }
        if (name.charCodeAt(0) === 46) {
          this._nativeUrl = getUrlWithUuid(this._uuid, {
            nativeExt: name,
            isNative: true
          });
        } else {
          this._nativeUrl = getUrlWithUuid(this._uuid, {
            __nativeName__: name,
            nativeExt: extname(name),
            isNative: true
          });
        }
      }
      return this._nativeUrl;
    }
  }, {
    key: "uuid",
    get: function get() {
      return this._uuid;
    }
  }, {
    key: "_nativeAsset",
    get: function get() {
      return this._file;
    },
    set: function set(obj) {
      this._file = obj;
    }
  }, {
    key: "nativeAsset",
    get: function get() {
      return this._file;
    }
  }, {
    key: "_nativeDep",
    get: function get() {
      if (this._native) {
        return {
          __isNative__: true,
          uuid: this._uuid,
          ext: this._native
        };
      }
      return undefined;
    }
  }, {
    key: "refCount",
    get: function get() {
      return this._ref;
    }
  }]);
}(Eventify(CCObject)), _initializer$2 = applyDecoratedInitializer(_class2$3.prototype, "_native", [serializable], function () {
  return '';
}), _applyDecoratedDescriptor(_class2$3.prototype, "_nativeAsset", [property], Object.getOwnPropertyDescriptor(_class2$3.prototype, "_nativeAsset"), _class2$3.prototype), _class2$3)) || _class$3);
Asset.prototype.createNode = null;
cclegacy.Asset = Asset;

var _dec$2, _class$2, _dec2$1, _class2$2, _dec3, _class3;
var Script = (_dec$2 = ccclass$1('cc.Script'), _dec$2(_class$2 = function (_Asset) {
  function Script(name) {
    return _Asset.call(this, name) || this;
  }
  _inheritsLoose(Script, _Asset);
  return Script;
}(Asset)) || _class$2);
cclegacy._Script = Script;
var JavaScript = (_dec2$1 = ccclass$1('cc.JavaScript'), _dec2$1(_class2$2 = function (_Script) {
  function JavaScript(name) {
    return _Script.call(this, name) || this;
  }
  _inheritsLoose(JavaScript, _Script);
  return JavaScript;
}(Script)) || _class2$2);
cclegacy._JavaScript = JavaScript;
var TypeScript = (_dec3 = ccclass$1('cc.TypeScript'), _dec3(_class3 = function (_Script2) {
  function TypeScript(name) {
    return _Script2.call(this, name) || this;
  }
  _inheritsLoose(TypeScript, _Script2);
  return TypeScript;
}(Script)) || _class3);
cclegacy._TypeScript = TypeScript;

var _dec$1, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4, _initializer5;
var EventHandler = (_dec$1 = ccclass$1('cc.ClickEvent'), _dec$1(_class$1 = (_class2$1 = function () {
  function EventHandler() {
    this.target = _initializer$1 && _initializer$1();
    this.component = _initializer2$1 && _initializer2$1();
    this._componentId = _initializer3$1 && _initializer3$1();
    this.handler = _initializer4 && _initializer4();
    this.customEventData = _initializer5 && _initializer5();
  }
  EventHandler.emitEvents = function emitEvents(events) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    for (var i = 0, l = events.length; i < l; i++) {
      var event = events[i];
      if (!(event instanceof EventHandler)) {
        continue;
      }
      event.emit(args);
    }
  };
  var _proto = EventHandler.prototype;
  _proto.emit = function emit(params) {
    var target = this.target;
    if (!legacyCC.isValid(target)) {
      return;
    }
    this._genCompIdIfNeeded();
    var compType = legacyCC.js.getClassById(this._componentId);
    var comp = target.getComponent(compType);
    if (!legacyCC.isValid(comp)) {
      return;
    }
    var handler = comp[this.handler];
    if (typeof handler !== 'function') {
      return;
    }
    if (this.customEventData != null && this.customEventData !== '') {
      params = params.slice();
      params.push(this.customEventData);
    }
    handler.apply(comp, params);
  };
  _proto._compName2Id = function _compName2Id(compName) {
    var comp = legacyCC.js.getClassByName(compName);
    return legacyCC.js.getClassId(comp);
  };
  _proto._compId2Name = function _compId2Name(compId) {
    var comp = legacyCC.js.getClassById(compId);
    return legacyCC.js.getClassName(comp);
  };
  _proto._genCompIdIfNeeded = function _genCompIdIfNeeded() {
    if (!this._componentId) {
      this._componentName = this.component;
      this.component = '';
    }
  };
  return _createClass(EventHandler, [{
    key: "_componentName",
    get: function get() {
      this._genCompIdIfNeeded();
      return this._compId2Name(this._componentId);
    },
    set: function set(value) {
      this._componentId = this._compName2Id(value);
    }
  }]);
}(), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "target", [serializable$1], function () {
  return null;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "component", [serializable$1], function () {
  return '';
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "_componentId", [serializable$1], function () {
  return '';
}), _initializer4 = applyDecoratedInitializer(_class2$1.prototype, "handler", [serializable$1], function () {
  return '';
}), _initializer5 = applyDecoratedInitializer(_class2$1.prototype, "customEventData", [serializable$1], function () {
  return '';
}), _class2$1)) || _class$1);

var _dec, _dec2, _class, _class2, _initializer, _initializer2, _initializer3, _Component;
var idGenerator = new IDGenerator('Comp');
var IsOnLoadCalled = CCObjectFlags.IsOnLoadCalled;
var NullNode = null;
var Component = (_dec = ccclass$1('cc.Component'), _dec2 = type(Script), _dec(_class = (_class2 = (_Component = function (_CCObject) {
  function Component() {
    var _this;
    _this = _CCObject.call(this) || this;
    _this.node = _initializer && _initializer();
    _this._enabled = _initializer2 && _initializer2();
    _this.__prefab = _initializer3 && _initializer3();
    _this._sceneGetter = null;
    _this._id = idGenerator.getNewId();
    return _this;
  }
  _inheritsLoose(Component, _CCObject);
  var _proto = Component.prototype;
  _proto._getRenderScene = function _getRenderScene() {
    if (this._sceneGetter) {
      return this._sceneGetter();
    }
    return this.node.scene.renderScene;
  };
  _proto.addComponent = function addComponent(typeOrClassName) {
    return this.node.addComponent(typeOrClassName);
  };
  _proto.getComponent = function getComponent(typeOrClassName) {
    return this.node.getComponent(typeOrClassName);
  };
  _proto.getComponents = function getComponents(typeOrClassName) {
    return this.node.getComponents(typeOrClassName);
  };
  _proto.getComponentInChildren = function getComponentInChildren(typeOrClassName) {
    return this.node.getComponentInChildren(typeOrClassName);
  };
  _proto.getComponentsInChildren = function getComponentsInChildren(typeOrClassName) {
    return this.node.getComponentsInChildren(typeOrClassName);
  };
  _proto.destroy = function destroy() {
    if (_CCObject.prototype.destroy.call(this)) {
      if (this._enabled && this.node.activeInHierarchy) {
        legacyCC.director._compScheduler.disableComp(this);
      }
      return true;
    }
    return false;
  };
  _proto._onPreDestroy = function _onPreDestroy() {
    this.unscheduleAllCallbacks();
    legacyCC.director._nodeActivator.destroyComp(this);
    this.node._removeComponent(this);
  };
  _proto._instantiate = function _instantiate(cloned) {
    if (!cloned) {
      cloned = legacyCC.instantiate._clone(this, this);
    }
    if (cloned) {
      cloned.node = NullNode;
    }
    return cloned;
  };
  _proto.schedule = function schedule(callback, interval, repeat, delay) {
    if (interval === void 0) {
      interval = 0;
    }
    if (repeat === void 0) {
      repeat = legacyCC.macro.REPEAT_FOREVER;
    }
    if (delay === void 0) {
      delay = 0;
    }
    assertID(Boolean(callback), 1619);
    interval = interval || 0;
    assertID(interval >= 0, 1620);
    repeat = Number.isNaN(repeat) ? legacyCC.macro.REPEAT_FOREVER : repeat;
    delay = delay || 0;
    var scheduler = legacyCC.director.getScheduler();
    var paused = scheduler.isTargetPaused(this);
    scheduler.schedule(callback, this, interval, repeat, delay, paused);
  };
  _proto.scheduleOnce = function scheduleOnce(callback, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    this.schedule(callback, 0, 0, delay);
  };
  _proto.unschedule = function unschedule(callback_fn) {
    if (!callback_fn) {
      return;
    }
    legacyCC.director.getScheduler().unschedule(callback_fn, this);
  };
  _proto.unscheduleAllCallbacks = function unscheduleAllCallbacks() {
    legacyCC.director.getScheduler().unscheduleAllForTarget(this);
  };
  return _createClass(Component, [{
    key: "name",
    get: function get() {
      if (this._name) {
        return this._name;
      }
      var className = getClassName(this);
      var trimLeft = className.lastIndexOf('.');
      if (trimLeft >= 0) {
        className = className.slice(trimLeft + 1);
      }
      if (this.node) {
        return this.node.name + "<" + className + ">";
      } else {
        return className;
      }
    },
    set: function set(value) {
      this._name = value;
    }
  }, {
    key: "uuid",
    get: function get() {
      return this._id;
    }
  }, {
    key: "__scriptAsset",
    get: function get() {
      return null;
    }
  }, {
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(value) {
      if (this._enabled !== value) {
        this._enabled = value;
        if (this.node.activeInHierarchy) {
          var compScheduler = legacyCC.director._compScheduler;
          if (value) {
            compScheduler.enableComp(this);
          } else {
            compScheduler.disableComp(this);
          }
        }
      }
    }
  }, {
    key: "enabledInHierarchy",
    get: function get() {
      return this._enabled && this.node && this.node.activeInHierarchy;
    }
  }, {
    key: "_isOnLoadCalled",
    get: function get() {
      return this._objFlags & IsOnLoadCalled;
    }
  }, {
    key: "internalUpdate",
    get: function get() {
      return this.update;
    }
  }, {
    key: "internalLateUpdate",
    get: function get() {
      return this.lateUpdate;
    }
  }, {
    key: "internalPreload",
    get: function get() {
      return this.__preload;
    }
  }, {
    key: "internalOnLoad",
    get: function get() {
      return this.onLoad;
    }
  }, {
    key: "internalStart",
    get: function get() {
      return this.start;
    }
  }, {
    key: "internalOnEnable",
    get: function get() {
      return this.onEnable;
    }
  }, {
    key: "internalOnDisable",
    get: function get() {
      return this.onDisable;
    }
  }, {
    key: "internalOnDestroy",
    get: function get() {
      return this.onDestroy;
    }
  }]);
}(CCObject), _Component.EventHandler = EventHandler, _Component._executionOrder = 0, _Component._requireComponent = null, _Component.system = null, _Component), _applyDecoratedDescriptor(_class2.prototype, "__scriptAsset", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "__scriptAsset"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "node", [serializable$1], function () {
  return NullNode;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_enabled", [serializable$1], function () {
  return true;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "__prefab", [serializable$1], function () {
  return null;
}), _class2)) || _class);
value(Component, '_registerEditorProps', function (cls, props) {
  var reqComp = props.requireComponent;
  if (reqComp) {
    if (Array.isArray(reqComp)) {
      reqComp = reqComp.filter(Boolean);
    }
    cls._requireComponent = reqComp;
  }
  var order = props.executionOrder;
  if (order && typeof order === 'number') {
    cls._executionOrder = order;
  }
});
legacyCC.Component = Component;

var NodeEventType;
(function (NodeEventType) {
  NodeEventType["TOUCH_START"] = "touch-start";
  NodeEventType["TOUCH_MOVE"] = "touch-move";
  NodeEventType["TOUCH_END"] = "touch-end";
  NodeEventType["TOUCH_CANCEL"] = "touch-cancel";
  NodeEventType["MOUSE_DOWN"] = "mouse-down";
  NodeEventType["MOUSE_MOVE"] = "mouse-move";
  NodeEventType["MOUSE_UP"] = "mouse-up";
  NodeEventType["MOUSE_WHEEL"] = "mouse-wheel";
  NodeEventType["MOUSE_ENTER"] = "mouse-enter";
  NodeEventType["MOUSE_LEAVE"] = "mouse-leave";
  NodeEventType["KEY_DOWN"] = "keydown";
  NodeEventType["KEY_UP"] = "keyup";
  NodeEventType["DEVICEMOTION"] = "devicemotion";
  NodeEventType["TRANSFORM_CHANGED"] = "transform-changed";
  NodeEventType["MOBILITY_CHANGED"] = "mobility-changed";
  NodeEventType["SCENE_CHANGED_FOR_PERSISTS"] = "scene-changed-for-persists";
  NodeEventType["SIZE_CHANGED"] = "size-changed";
  NodeEventType["ANCHOR_CHANGED"] = "anchor-changed";
  NodeEventType["COLOR_CHANGED"] = "color-changed";
  NodeEventType["CHILD_ADDED"] = "child-added";
  NodeEventType["CHILD_REMOVED"] = "child-removed";
  NodeEventType["PARENT_CHANGED"] = "parent-changed";
  NodeEventType["NODE_DESTROYED"] = "node-destroyed";
  NodeEventType["LAYER_CHANGED"] = "layer-changed";
  NodeEventType["SIBLING_ORDER_CHANGED"] = "sibling-order-changed";
  NodeEventType["CHILDREN_ORDER_CHANGED"] = "sibling-order-changed";
  NodeEventType["ACTIVE_IN_HIERARCHY_CHANGED"] = "active-in-hierarchy-changed";
  NodeEventType["COMPONENT_ADDED"] = "component-added";
  NodeEventType["COMPONENT_REMOVED"] = "component-removed";
  NodeEventType["LIGHT_PROBE_CHANGED"] = "light-probe-changed";
  NodeEventType["LIGHT_PROBE_BAKING_CHANGED"] = "light-probe-baking-changed";
  NodeEventType["ACTIVE_CHANGED"] = "active-changed";
})(NodeEventType || (NodeEventType = {}));

export { Asset as A, BuiltinBundleName as B, Component as C, helper as D, EventHandler as E, references as F, JavaScript as J, NodeEventType as N, Pipeline as P, RequestType as R, Script as S, TypeScript as T, _normalize as _, changeExtname as a, basename as b, changeBasename as c, dirname as d, extname as e, pipeline as f, getSeperator as g, fetchPipeline as h, assets as i, join as j, Cache as k, getUuidFromURL as l, mainFileName as m, bundles as n, decodeUuid as o, path as p, parsed as q, files as r, stripSep as s, transform as t, normalize as u, isScene as v, Task as w, transformPipeline as x, presets as y, assetsOverrideMap as z };
//# sourceMappingURL=node-event-Ccvtv8bJ.js.map
