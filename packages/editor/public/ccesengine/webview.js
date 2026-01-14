import { a as _createClass, _ as _inheritsLoose, X as contains, Q as error, e as warn } from './gc-object-CShF5lzx.js';
import { w as mat4, O as screenAdapter, c as ccclass, t as type, b as applyDecoratedInitializer, s as serializable, r as requireComponent } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { l as legacyCC, a as ccwindow } from './global-exports-DnCP_14L.js';
import './sprite-renderer-C7_6H1N4.js';
import { i as UITransform } from './ui-renderer-JpGcj-VM.js';
import './prefab-DYg_oxpo.js';
import './scene-vWcxM1_c.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { E as EventHandler, C as Component } from './node-event-Ccvtv8bJ.js';
import { d as director } from './director-F7e_Lqjg.js';
import { g as game } from './deprecated-Dswa7XeN.js';
import './camera-component-BFt9vSC_.js';
import './debug-view-BuNhRPv_.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
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
import './touch-BKrZ-fxl.js';

var WebViewEventType;
(function (WebViewEventType) {
  WebViewEventType["NONE"] = "none";
  WebViewEventType["LOADING"] = "loading";
  WebViewEventType["LOADED"] = "loaded";
  WebViewEventType["ERROR"] = "error";
})(WebViewEventType || (WebViewEventType = {}));

var WebViewImpl = function () {
  function WebViewImpl(component) {
    this._componentEventList = new Map();
    this._state = WebViewEventType.NONE;
    this._wrapper = void 0;
    this._webview = null;
    this._loaded = false;
    this._forceUpdate = false;
    this._component = null;
    this._uiTrans = null;
    this._node = null;
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
    this.reset();
    this.createWebView();
  }
  var _proto = WebViewImpl.prototype;
  _proto.reset = function reset() {
    this._wrapper = null;
    this._webview = null;
    this._loaded = false;
    this._w = 0;
    this._h = 0;
    this._m00 = 0;
    this._m01 = 0;
    this._m04 = 0;
    this._m05 = 0;
    this._m12 = 0;
    this._m13 = 0;
    this._state = WebViewEventType.NONE;
    this._forceUpdate = false;
  };
  _proto.dispatchEvent = function dispatchEvent(key) {
    var callback = this._componentEventList.get(key);
    if (callback) {
      this._state = key;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      callback.call(this, args);
    }
  };
  _proto.destroy = function destroy() {
    this.removeWebView();
    this._wrapper = null;
    this._webview = null;
    this._loaded = false;
    this._component = null;
    this._uiTrans = null;
    this._forceUpdate = false;
    this._componentEventList.clear();
  };
  return _createClass(WebViewImpl, [{
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
    key: "webview",
    get: function get() {
      return this._webview;
    }
  }, {
    key: "state",
    get: function get() {
      return this._state;
    }
  }, {
    key: "UICamera",
    get: function get() {
      return director.root.batcher2D.getFirstRenderCamera(this._node);
    }
  }]);
}();
legacyCC.internal.WebViewImpl = WebViewImpl;

var ccdocument = ccwindow.document;
var _mat4_temp = mat4();
var WebViewImplWeb = function (_WebViewImpl) {
  function WebViewImplWeb(component) {
    return _WebViewImpl.call(this, component) || this;
  }
  _inheritsLoose(WebViewImplWeb, _WebViewImpl);
  var _proto = WebViewImplWeb.prototype;
  _proto._bindDomEvent = function _bindDomEvent() {
    var _this = this;
    if (!this.webview) {
      return;
    }
    var onLoaded = function onLoaded(e) {
      _this._forceUpdate = true;
      _this.dispatchEvent(WebViewEventType.LOADED);
      var iframe = e.target;
      var body = iframe.contentDocument && iframe.contentDocument.body;
      if (body && body.innerHTML.includes('404')) {
        _this.dispatchEvent(WebViewEventType.ERROR, body.innerHTML);
      }
    };
    this.webview.addEventListener('load', onLoaded);
  };
  _proto.loadURL = function loadURL(url) {
    if (this.webview) {
      this.webview.src = url;
      this.dispatchEvent(WebViewEventType.LOADING);
    }
  };
  _proto.createWebView = function createWebView() {
    var wrapper = ccdocument.createElement('div');
    this._wrapper = wrapper;
    wrapper.id = 'webview-wrapper';
    var wrapperStyle = wrapper.style;
    wrapperStyle['-webkit-overflow'] = 'auto';
    wrapperStyle['-webkit-overflow-scrolling'] = 'touch';
    wrapperStyle.position = 'absolute';
    wrapperStyle.bottom = '0px';
    wrapperStyle.left = '0px';
    wrapperStyle.transformOrigin = '0px 100% 0px';
    wrapperStyle['-webkit-transform-origin'] = '0px 100% 0px';
    game.container.appendChild(wrapper);
    var webview = ccdocument.createElement('iframe');
    this._webview = webview;
    var webviewStyle = webview.style;
    webview.id = 'webview';
    webviewStyle.border = 'none';
    webviewStyle.width = '100%';
    webviewStyle.height = '100%';
    wrapper.appendChild(webview);
    this._bindDomEvent();
  };
  _proto.removeWebView = function removeWebView() {
    var wrapper = this._wrapper;
    if (contains(game.container, wrapper)) {
      game.container.removeChild(wrapper);
    }
    this.reset();
  };
  _proto.enable = function enable() {
    if (this._wrapper) {
      this._wrapper.style.visibility = 'visible';
    }
  };
  _proto.disable = function disable() {
    if (this._wrapper) {
      this._wrapper.style.visibility = 'hidden';
    }
  };
  _proto.evaluateJS = function evaluateJS(str) {
    if (this.webview) {
      var win = this.webview.contentWindow;
      if (win) {
        try {
          win.eval(str);
        } catch (e) {
          this.dispatchEvent(WebViewEventType.ERROR, e);
          error(e);
        }
      }
    }
  };
  _proto.setOnJSCallback = function setOnJSCallback(callback) {
    warn('The platform does not support');
  };
  _proto.setJavascriptInterfaceScheme = function setJavascriptInterfaceScheme(scheme) {
    warn('The platform does not support');
  };
  _proto.syncMatrix = function syncMatrix() {
    if (!this._wrapper || !this._uiTrans || !this._component || this._wrapper.style.visibility === 'hidden') return;
    var camera = this.UICamera;
    if (!camera) {
      return;
    }
    this._component.node.getWorldMatrix(_mat4_temp);
    camera.update(true);
    camera.worldMatrixToScreen(_mat4_temp, _mat4_temp, game.canvas.width, game.canvas.height);
    var _this$_uiTrans$conten = this._uiTrans.contentSize,
      width = _this$_uiTrans$conten.width,
      height = _this$_uiTrans$conten.height;
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
    this._wrapper.style.width = width + "px";
    this._wrapper.style.height = height + "px";
    var w = this._w * scaleX;
    var h = this._h * scaleY;
    var appx = w * _mat4_temp.m00 * this._uiTrans.anchorX;
    var appy = h * _mat4_temp.m05 * this._uiTrans.anchorY;
    var offsetX = container && container.style.paddingLeft ? parseInt(container.style.paddingLeft) : 0;
    var offsetY = container && container.style.paddingBottom ? parseInt(container.style.paddingBottom) : 0;
    var tx = _mat4_temp.m12 * scaleX - appx + offsetX;
    var ty = _mat4_temp.m13 * scaleY - appy + offsetY;
    var matrix = "matrix(" + sx + "," + -b + "," + -c + "," + sy + "," + tx + "," + -ty + ")";
    this._wrapper.style.transform = matrix;
    this._wrapper.style['-webkit-transform'] = matrix;
    this._forceUpdate = false;
  };
  return WebViewImplWeb;
}(WebViewImpl);

var WebViewImplManager = function () {
  function WebViewImplManager() {}
  WebViewImplManager.getImpl = function getImpl(component) {
    return new WebViewImplWeb(component);
  };
  return WebViewImplManager;
}();
legacyCC.internal.WebViewImplManager = WebViewImplManager;

var _dec, _dec2, _dec3, _class, _class2, _initializer, _initializer2, _WebView;
var WebView = (_dec = ccclass('cc.WebView'), _dec2 = requireComponent(UITransform), _dec3 = type([EventHandler]), _dec(_class = _dec2(_class = (_class2 = (_WebView = function (_Component) {
  function WebView() {
    var _this;
    _this = _Component.call(this) || this;
    _this._url = _initializer && _initializer();
    _this._impl = null;
    _this.webviewEvents = _initializer2 && _initializer2();
    return _this;
  }
  _inheritsLoose(WebView, _Component);
  var _proto = WebView.prototype;
  _proto.setJavascriptInterfaceScheme = function setJavascriptInterfaceScheme(scheme) {
    if (this._impl) {
      this._impl.setJavascriptInterfaceScheme(scheme);
    }
  };
  _proto.setOnJSCallback = function setOnJSCallback(callback) {
    if (this._impl) {
      this._impl.setOnJSCallback(callback);
    }
  };
  _proto.evaluateJS = function evaluateJS(str) {
    if (this._impl) {
      this._impl.evaluateJS(str);
    }
  };
  _proto.__preload = function __preload() {
    this._impl = WebViewImplManager.getImpl(this);
    var componentEventList = this._impl.componentEventList;
    componentEventList.set(WebViewEventType.LOADING, this.onLoading.bind(this));
    componentEventList.set(WebViewEventType.LOADED, this.onLoaded.bind(this));
    componentEventList.set(WebViewEventType.ERROR, this.onError.bind(this));
    this._impl.loadURL(this._url);
  };
  _proto.onLoading = function onLoading() {
    EventHandler.emitEvents(this.webviewEvents, this, WebViewEventType.LOADING);
    this.node.emit(WebViewEventType.LOADING, this);
  };
  _proto.onLoaded = function onLoaded() {
    EventHandler.emitEvents(this.webviewEvents, this, WebViewEventType.LOADED);
    this.node.emit(WebViewEventType.LOADED, this);
  };
  _proto.onError = function onError() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    EventHandler.emitEvents(this.webviewEvents, this, WebViewEventType.ERROR, args);
    this.node.emit(WebViewEventType.ERROR, this, args);
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
  return _createClass(WebView, [{
    key: "url",
    get: function get() {
      return this._url;
    },
    set: function set(val) {
      this._url = val;
      if (this._impl) {
        this._impl.loadURL(val);
      }
    }
  }, {
    key: "nativeWebView",
    get: function get() {
      return this._impl && this._impl.webview || null;
    }
  }, {
    key: "state",
    get: function get() {
      if (!this._impl) {
        return WebViewEventType.NONE;
      }
      return this._impl.state;
    }
  }]);
}(Component), _WebView.EventType = WebViewEventType, _WebView), _initializer = applyDecoratedInitializer(_class2.prototype, "_url", [serializable], function () {
  return 'https://cocos.com';
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "webviewEvents", [serializable, _dec3], function () {
  return [];
}), _class2)) || _class) || _class);
legacyCC.internal.WebView = WebView;

export { WebView };
//# sourceMappingURL=webview.js.map
