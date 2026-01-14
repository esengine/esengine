import { D as DEV, S as SUPPORT_JIT, T as TEST, E as EDITOR, P as PREVIEW } from './_virtual_internal_constants-DWlew7Dp.js';
import { a as ccwindow, l as legacyCC } from './global-exports-DnCP_14L.js';

function _applyDecoratedDescriptor(i, e, r, n, l) {
  var a = {};
  return Object.keys(n).forEach(function (i) {
    a[i] = n[i];
  }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = true), a = r.slice().reverse().reduce(function (r, n) {
    return n(i, e, r) || r;
  }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a;
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _construct(t, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t.bind.apply(t, o))();
  return r && _setPrototypeOf(p, r.prototype), p;
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _createForOfIteratorHelperLoose(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (t) return (t = t.call(r)).next.bind(t);
  if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
    t && (r = t);
    var o = 0;
    return function () {
      return o >= r.length ? {
        done: true
      } : {
        done: false,
        value: r[o++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}
function _inheritsLoose(t, o) {
  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}
function _initializerDefineProperty(e, i, r, l) {
  r && Object.defineProperty(e, i, {
    enumerable: r.enumerable,
    configurable: r.configurable,
    writable: r.writable,
    value: r.initializer ? r.initializer.call(l) : void 0
  });
}
function _isNativeFunction(t) {
  try {
    return -1 !== Function.toString.call(t).indexOf("[native code]");
  } catch (n) {
    return "function" == typeof t;
  }
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function () {
    return !!t;
  })();
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return _regeneratorDefine(u, "_invoke", function (r, n, o) {
      var i,
        c,
        u,
        f = 0,
        p = o || [],
        y = false,
        G = {
          p: 0,
          n: 0,
          v: e,
          a: d,
          f: d.bind(e, 4),
          d: function (t, r) {
            return i = t, c = 0, u = e, G.n = r, a;
          }
        };
      function d(r, n) {
        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
          var o,
            i = p[t],
            d = G.p,
            l = i[2];
          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
        }
        if (o || r > 1) return a;
        throw y = true, n;
      }
      return function (o, p, l) {
        if (f > 1) throw TypeError("Generator is already running");
        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
          try {
            if (f = 2, i) {
              if (c || (o = "next"), t = i[o]) {
                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u = t.value, c < 2 && (c = 0);
              } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
              i = e;
            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
          } catch (t) {
            i = e, c = 1, u = t;
          } finally {
            f = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r, o, i), true), u;
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
      return this;
    }), t),
    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
    return this;
  }), _regeneratorDefine(u, "toString", function () {
    return "[object Generator]";
  }), (_regenerator = function () {
    return {
      w: i,
      m: f
    };
  })();
}
function _regeneratorDefine(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  _regeneratorDefine = function (e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r ? i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
  }, _regeneratorDefine(e, r, n, t);
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (String )(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _wrapNativeSuper(t) {
  var r = "function" == typeof Map ? new Map() : void 0;
  return _wrapNativeSuper = function (t) {
    if (null === t || !_isNativeFunction(t)) return t;
    if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== r) {
      if (r.has(t)) return r.get(t);
      r.set(t, Wrapper);
    }
    function Wrapper() {
      return _construct(t, arguments, _getPrototypeOf(this).constructor);
    }
    return Wrapper.prototype = Object.create(t.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    }), _setPrototypeOf(Wrapper, t);
  }, _wrapNativeSuper(t);
}

var debugInfos = {
	"1006": "[Action step]. override me",
	"1007": "[Action update]. override me",
	"1008": "[Action reverse]. override me",
	"1031": "Set `setter` to boolean is deprecated. Please don not use like this again.",
	"1100": "Expected 'data' dict, but not found. Config file: %s",
	"1101": "Please load the resource first : %s",
	"1102": "Effect settings not found, effects will not be imported.",
	"1103": "Success to load scene: %s",
	"1200": "cocos2d: Director: Error in gettimeofday",
	"1204": "Running scene should not be null",
	"1205": "The scene should not be null",
	"1206": "loadScene: The scene index to load (%s) is out of range.",
	"1207": "loadScene: Unknown name type to load: '%s'",
	"1208": "loadScene: Failed to load scene '%s' because '%s' is already being loaded.",
	"1209": "loadScene: Can not load the scene '%s' because it was not in the build settings before playing.",
	"1210": "Failed to preload '%s', %s",
	"1211": "loadScene: The scene index to load (%s) is out of range.",
	"1212": "loadScene: Unknown name type to load: '%s'",
	"1213": "loadScene: Failed to load scene '%s' because '%s' is already loading",
	"1214": "loadScene: Can not load the scene '%s' because it was not in the build settings before playing.",
	"1215": "Failed to preload '%s', %s",
	"1216": "Director.runSceneImmediate: scene is not valid",
	"1217": "Director._initOnEngineInitialized: renderer root initialization failed",
	"1218": "Forward render pipeline initialized.",
	"1219": "Deferred render pipeline initialized. Note that non-transparent materials with no lighting will not be rendered, such as builtin-unlit.",
	"1220": "Failed to set shading scale, pipelineSceneData is invalid.",
	"1221": "Setting orientation is not supported yet.",
	"1222": "Failed to initialize render pipeline.",
	"1223": "Custom pipeline and legacy pipeline are all culled.",
	"1300": "%s is not in the model pool and cannot be destroyed by destroyModel.",
	"1400": "'%s' is deprecated, please use '%s' instead.",
	"1404": "cc.spriteFrameCache is removed, please use cc.loader to load and cache sprite frames of atlas format.",
	"1406": "'%s.%s' is removed",
	"1408": "'%s' is removed",
	"1409": "element type is wrong!",
	"1502": "cc.scheduler.scheduleCallbackForTarget(): target should be non-null.",
	"1503": "cc.Scheduler.pauseTarget():target should be non-null",
	"1504": "cc.Scheduler.resumeTarget():target should be non-null",
	"1505": "cc.Scheduler.isTargetPaused():target should be non-null",
	"1506": "warning: you CANNOT change update priority in scheduled function",
	"1507": "scheduler#scheduleSelector. Selector already scheduled. Updating interval from: %.4f to %.4f",
	"1508": "Argument callback must not be empty",
	"1509": "Argument target must be non-nullptr",
	"1510": "cc.Scheduler: Illegal target which doesn't have id, you should do Scheduler.enableForTarget(target) before all scheduler API usage on target",
	"1511": "cc.Scheduler: pause state of the scheduled task doesn't match the element pause state in Scheduler, the given paused state will be ignored.",
	"1513": "cc.Scheduler: scheduler stopped using `__instanceId` as id since v2.0, you should do Scheduler.enableForTarget(target) before all scheduler API usage on target",
	"1514": "since v3.8.0, `Scheduler.schedule(target, callback, interval)` is deprecated, please use `Scheduler.schedule(callback, target, interval)` instead.",
	"1607": "removeFromParentAndCleanup is deprecated. Use removeFromParent instead",
	"1619": "callback function must be non-null",
	"1620": "interval must be positive",
	"1623": "Set '%s' to normal node (not persist root node).",
	"1624": "Replacing with the same sgNode",
	"1625": "The replacement sgNode should not contain any child.",
	"1626": "Should not set alpha via 'color', set 'opacity' please.",
	"1627": "Not support for asynchronous creating node in SG",
	"1632": "Node name can not include '/'.",
	"1633": "Internal error, should not remove unknown node from parent.",
	"1635": "reorderChild: this child is not in children list.",
	"1636": "Node's zIndex value can't be greater than cc.macro.MAX_ZINDEX, setting to the maximum value",
	"1637": "Node's zIndex value can't be smaller than cc.macro.MIN_ZINDEX, setting to the minimum value",
	"1638": "Private node's zIndex can't be set, it will keep cc.macro.MIN_ZINDEX as its value",
	"1640": "Node %s(%s) has not attached to a scene.",
	"1800": "cc._EventListenerKeyboard.checkAvailable(): Invalid EventListenerKeyboard!",
	"1801": "cc._EventListenerTouchOneByOne.checkAvailable(): Invalid EventListenerTouchOneByOne!",
	"1802": "cc._EventListenerTouchAllAtOnce.checkAvailable(): Invalid EventListenerTouchAllAtOnce!",
	"1803": "cc._EventListenerAcceleration.checkAvailable():_onAccelerationEvent must be non-nil",
	"1900": "Invalid parameter.",
	"2104": "Layer collision. The name of layer (%s) is collided with the name or value of some layer",
	"2200": "Design resolution not valid",
	"2201": "should set resolutionPolicy",
	"2300": "The touches is more than MAX_TOUCHES.",
	"2301": "Cannot create the same touch object.",
	"2302": "The touches is more than MAX_TOUCHES, release touch id %s.",
	"2402": "Forward pipeline startup failed!",
	"3103": "cc.Texture.addImage(): path should be non-null",
	"3119": "Lazy init texture with image element failed due to image loading failure: %s",
	"3120": "Loading texture with unsupported type: '%s'. Add '%s' into 'cc.macro.SUPPORT_TEXTURE_FORMATS' please.",
	"3121": "Can't find a texture format supported by the current platform! Please add a fallback format in the editor.",
	"3122": "Error Texture in %s.",
	"3123": "Set same texture %s.",
	"3124": "Texture: setMipRange failed because base level is larger than max level",
	"3300": "Rect width exceeds maximum margin: %s",
	"3301": "Rect height exceeds maximum margin: %s",
	"3500": "0 priority is forbidden for fixed priority since it's used for scene graph based priority.",
	"3501": "Invalid listener type!",
	"3502": "Can't set fixed priority with scene graph based listener.",
	"3503": "Invalid parameters.",
	"3504": "listener must be a cc.EventListener object when adding a fixed priority listener",
	"3505": "The listener has been registered, please don't register it again.",
	"3506": "Unsupported listener target.",
	"3507": "Invalid scene graph priority!",
	"3508": "If program goes here, there should be event in dispatch.",
	"3509": "_inDispatch should be 1 here.",
	"3510": "%s's scene graph node not contains in the parent's children",
	"3511": "event is undefined",
	"3512": "Event manager only support scene graph priority for ui nodes which contain UIComponent",
	"3520": "Device Motion Event request permission: %s",
	"3521": "Device Motion Event request permission failed: %s",
	"3601": "The editor property 'playOnFocus' should be used with 'executeInEditMode' in class '%s'",
	"3602": "Unknown editor property '%s' in class '%s'.",
	"3603": "Use 'cc.Float' or 'cc.Integer' instead of 'cc.Number' please.",
	"3604": "Can only indicate one type attribute for %s.",
	"3605": "The default value of %s is not instance of %s.",
	"3606": "No needs to indicate the '%s' attribute for %s, which its default value is type of %s.",
	"3607": "The default value of %s must be an empty string.",
	"3608": "The type of %s must be CCString, not String.",
	"3609": "The type of %s must be CCBoolean, not Boolean.",
	"3610": "The type of %s must be CCFloat or CCInteger, not Number.",
	"3611": "Can not indicate the '%s' attribute for %s, which its default value is type of %s.",
	"3612": "%s Just set the default value to 'new %s()' and it will be handled properly.",
	"3613": "'No need to use 'serializable: false' or 'editorOnly: true' for the getter of '%s.%s', every getter is actually non-serialized.",
	"3614": "Should not define constructor for cc.Component %s.",
	"3615": "Each script can have at most one Component.",
	"3616": "Should not specify class name %s for Component which defines in project.",
	"3618": "ctor of '%s' can not be another CCClass",
	"3623": "Can not use 'editor' attribute, '%s' not inherits from Components.",
	"3625": "[isChildClassOf] superclass should be function type, not",
	"3626": "Can't remove '%s' because '%s' depends on it.",
	"3627": "Should not add renderer component (%s) to a Canvas node.",
	"3628": "Should not add %s to a node which size is already used by its other component.",
	"3633": "Properties function of '%s' should return an object!",
	"3634": "Disallow to use '.' in property name",
	"3637": "Can not declare %s.%s, it is already defined in the prototype of %s",
	"3639": "Can not apply the specified attribute to the getter of '%s.%s', attribute index: %s",
	"3640": "'%s': the setter of '%s' is already defined!",
	"3641": "Can not construct %s because it contains object property.",
	"3644": "Please define 'type' parameter of %s.%s as the actual constructor.",
	"3645": "Please define 'type' parameter of %s.%s as the constructor of %s.",
	"3646": "Unknown 'type' parameter of %s.%s：%s",
	"3647": "The length of range array must be equal or greater than 2",
	"3648": "Can not declare %s.%s method, it is already defined in the properties of %s.",
	"3652": "Failed to `new %s()` under the hood, %s\nIt is used for getting default values declared in TypeScript in the first place.\nPlease ensure the constructor can be called during the script's initialization.",
	"3653": "Please do not specify \"default\" attribute in decorator of \"%s\" property in \"%s\" class.\nDefault value must be initialized at their declaration:\n\n \n// Before:\n@property({\n  type: cc.SpriteFrame\n  default: null  // <--\n})\nmyProp;\n// After:\n@property({\n  type: cc.SpriteFrame\n})\nmyProp = null;   // <--",
	"3654": "Please specify a default value for \"%s.%s\" property at its declaration:\n\n \n// Before:\n@property(...)\nmyProp;\n// After:\n@property(...)\nmyProp = 0;",
	"3655": "Can not specify \"get\" or \"set\"  attribute in decorator for \"%s\" property in \"%s\" class.\nPlease use:\n\n \n@property(...)\nget %s () {\n    ...\n}\n@property\nset %s (value) {\n    ...\n}",
	"3659": "Violation error: extending enumerations shall have non-overlaped member names or member values",
	"3660": "You are explicitly specifying `undefined` type to cc property \"%s\" of cc class \"%s\".\nIs this intended? If not, this may indicate a circular reference.\nFor example:\n\n \n// foo.ts\nimport { _decorator } from 'cc';\nimport { Bar } from './bar';  // Given that './bar' also reference 'foo.ts'.\n                              // When importing './bar', execution of './bar' is hung on to wait execution of 'foo.ts',\n                              // the `Bar` imported here is `undefined` until './bar' finish its execution.\n                              // It leads to that\n@_decorator.ccclass           //  ↓\nexport class Foo {            //  ↓\n    @_decorator.type(Bar)     //  → is equivalent to `@_decorator.type(undefined)`\n    public bar: Bar;          // To eliminate this error, either:\n                              // - Refactor your module structure(recommended), or\n                              // - specify the type as cc class name: `@_decorator.type('Bar'/* or any name you specified for `Bar` */)`\n}",
	"3700": "internal error: _prefab is undefined",
	"3701": "Failed to load prefab asset for node '%s'",
	"3702": "The json file of asset %s is empty or missing.",
	"3800": "The target can not be made persist because it's not a cc.Node or it doesn't have _id property.",
	"3801": "The node can not be made persist because it's not under root node.",
	"3802": "The node can not be made persist because it's not in current scene.",
	"3803": "The target can not be made persist because it's not a cc.Node or it doesn't have _id property.",
	"3804": "getComponent: Type must be non-nil",
	"3805": "Can't add component '%s' because %s already contains the same component.",
	"3806": "Can't add component '%s' to %s because it conflicts with the existing '%s' derived component.",
	"3807": "addComponent: Failed to get class '%s'",
	"3808": "addComponent: Should not add component ('%s') when the scripts are still loading.",
	"3809": "addComponent: The component to add must be a constructor",
	"3810": "addComponent: The component to add must be child class of cc.Component",
	"3811": "_addComponentAt: The component to add must be a constructor",
	"3812": "_addComponentAt: Index out of range",
	"3813": "removeComponent: Component must be non-nil",
	"3814": "Argument must be non-nil",
	"3815": "Component not owned by this entity",
	"3816": "Node '%s' is already activating",
	"3817": "Sorry, the component of '%s' which with an index of %s is corrupted! It has been removed.",
	"3818": "Failed to read or parse project.json",
	"3819": "Warning: target element is not a DIV or CANVAS",
	"3820": "The renderer doesn't support the renderMode %s",
	"3821": "Cannot change hierarchy while activating or deactivating the parent.",
	"3822": "addComponent: Cannot add any component to the scene.",
	"3823": "The enabled component (id: %s, name: %s) doesn't have a valid node",
	"3900": "Invalid clip to add",
	"3901": "Invalid clip to remove",
	"3902": "clip is defaultClip, set force to true to force remove clip and animation state",
	"3903": "animation state is playing, set force to true to force stop and remove clip and animation state",
	"3904": "motion path of target [%s] in prop [%s] frame [%s] is not valid",
	"3905": "sprite frames must be an Array.",
	"3906": "Can't find easing type [%s]",
	"3907": "Animation state is not playing or already removed",
	"3912": "already-playing",
	"3920": "Current context does not allow root motion.",
	"3921": "You provided a ill-formed track path. The last component of track path should be property key, or the setter should not be empty.",
	"3923": "Root motion is ignored since root bone could not be located in animation.",
	"3924": "Root motion is ignored since the root bone could not be located in scene.",
	"3925": "Target of hierarchy path should be of type Node.",
	"3926": "Node \"%s\" has no path \"%s\".",
	"3927": "Target of component path should be of type Node.",
	"3928": "Node \"%s\" has no component \"%s\".",
	"3929": "Target object has no property \"%s\".",
	"3930": "Can not decide type for untyped track: runtime binding does not provide a getter.",
	"3931": "Can not decide type for untyped track: got a unsupported value from runtime binding.",
	"3932": "Common targets should only target Vectors/`Size`/`Color`.",
	"3933": "Each curve that has common target should be numeric curve and targets string property.",
	"3934": "Misconfigured legacy curve: the first keyframe value is number but others aren't.",
	"3935": "We don't currently support conversion of \\`CubicSplineQuatValue\\`.",
	"3936": "Instancing/Batching enabled for non-baked skinning model or used AnimationController '%s', this may result in unexpected rendering artifacts. Consider turning it off in the material if you do not intend to do this.",
	"3937": "Previous error occurred when instantiating animation clip %s on node %s.",
	"3938": "'%s' is not found from '%s'. It's specified as the root node to play animation clip '%s'.",
	"3940": "Error when animation attempted to bind material uniform target: target %s is not a material.",
	"3941": "Error when animation attempted to bind material uniform target: material %s has no recorded pass %s.",
	"3942": "Error when animation attempted to bind material uniform target: material %s at pass %s has no recorded uniform %s.",
	"3943": "Error when animation attempted to bind material uniform target: material %s at pass %s's uniform %s has no recorded channel %s.",
	"4003": "Label font size can't be shirnked less than 0!",
	"4004": "force notify all fonts loaded!",
	"4011": "Property spriteFrame of Font '%s' is invalid. Using system font instead.",
	"4012": "The texture of Font '%s' must be already loaded on JSB. Using system font instead.",
	"4013": "Sorry, lineHeight of system font not supported on JSB.",
	"4200": "MaskType: IMAGE_STENCIL only support WebGL mode.",
	"4201": "The alphaThreshold invalid in Canvas Mode.",
	"4202": "The inverted invalid in Canvas Mode.",
	"4300": "Can not found the %s page.",
	"4301": "Can not add a page without UITransform.",
	"4302": "Can not set the scroll view content when it hasn't UITransform or its parent hasn't UITransform.",
	"4303": "The %s scrollBar on the '%s' node is not available, please check it.",
	"4400": "Invalid RichText img tag! The sprite frame name can't be found in the ImageAtlas!",
	"4500": "Graphics: There is no model in %s.",
	"4501": "Graphics feature is not enabled in 'Project Settings -> Feature Cropping', %s",
	"4600": "Script attached to '%s' is missing or invalid.",
	"4601": "Failed to load wasm module, WebAssembly is not supported on this platform, but as a fallback Asm.js module is culled by mistake.",
	"4700": "The dom control is not created!",
	"4800": "unknown asset type",
	"4901": "loadRes: should not specify the extname in %s %s",
	"4902": "No need to release non-cached asset.",
	"4914": "Resources url '%s' does not exist.",
	"4915": "Pack indices and data do not match in size",
	"4916": "Failed to download package for %s",
	"4921": "Invalid pipe or invalid index provided!",
	"4922": "The pipe to be inserted is already in the pipeline!",
	"4923": "Uuid Loader: Parse asset [ %s ] failed : %s",
	"4924": "JSON Loader: Input item doesn't contain string content",
	"4925": "Uuid Loader: Deserialize asset [ %s ] failed : %s",
	"4926": "Audio Downloader: no web audio context.",
	"4927": "Audio Downloader: audio not supported on this browser!",
	"4928": "Load %s failed!",
	"4929": "Load Webp ( %s ) failed",
	"4930": "Load image ( %s ) failed",
	"4932": "Since v1.10, for any atlas (\"%s\") in the \"resources\" directory, it is not possible to find the contained SpriteFrames via `loadRes`, `getRes` or `releaseRes`. Load the SpriteAtlas first and then use `spriteAtlas.getSpriteFrame(name)` instead please.",
	"4933": "Download Font [ %s ] failed, using Arial or system default font instead",
	"4934": "Please assure that the full path of sub asset is correct!",
	"4935": "Failed to skip prefab asset while deserializing PrefabInfo",
	"5000": "You are trying to destroy a object twice or more.",
	"5001": "object not yet destroyed",
	"5100": "Not a plist file!",
	"5200": "Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option",
	"5201": "browser don't support web audio",
	"5202": "This feature supports WebGL render mode only.",
	"5203": "Audio buffer cache %s has not been added.",
	"5204": "Audio buffer %s has been cached.",
	"5300": "Type of target to deserialize not matched with data: target is %s, data is %s",
	"5301": "Can not find script '%s'",
	"5302": "Can not find class '%s'",
	"5303": "Failed to deserialize %s, missing _deserialize function.",
	"5304": "Unable to deserialize version %s data.",
	"5402": "cc.js.addon called on non-object:",
	"5403": "cc.js.mixin: arguments must be type object:",
	"5404": "The base class to extend from must be non-nil",
	"5405": "The class to extend must be non-nil",
	"5406": "Class should be extended before assigning any prototype members.",
	"5500": "'notify' can not be used in 'get/set' !",
	"5501": "'notify' must be used with 'default' !",
	"5507": "The 'default' attribute of '%s.%s' must be an array",
	"5508": "Invalid type of %s.%s",
	"5510": "The 'type' attribute of '%s.%s' can not be 'Number', use cc.Float or cc.Integer instead please.",
	"5511": "The 'type' attribute of '%s.%s' is undefined when loading script",
	"5512": "Can not serialize '%s.%s' because the specified type is anonymous, please provide a class name or set the 'serializable' attribute of '%s.%s' to 'false'.",
	"5513": "The 'default' value of '%s.%s' should not be used with a 'get' function.",
	"5514": "The 'default' value of '%s.%s' should not be used with a 'set' function.",
	"5515": "The 'default' value of '%s.%s' can not be an constructor. Set default to null please.",
	"5517": "'%s.%s' hides inherited property '%s.%s'. To make the current property override that implementation, add the `override: true` attribute please.",
	"5601": "Can not get current scene.",
	"5602": "Scene is destroyed",
	"5603": "reference node is destroyed",
	"5700": "no %s or %s on %s",
	"5800": "%s.lerp not yet implemented.",
	"5801": "%s.clone not yet implemented.",
	"5802": "%s.equals not yet implemented.",
	"5900": "MotionStreak only support WebGL mode.",
	"5901": "cc.MotionStreak.getOpacity has not been supported.",
	"5902": "cc.MotionStreak.setOpacity has not been supported.",
	"6000": "Custom should not be false if file is not specified.",
	"6001": "The new %s must not be NaN",
	"6017": "Incomplete or corrupt PNG file",
	"6018": "Invalid filter algorithm: %s",
	"6019": "Invalid byte order value.",
	"6020": "You forgot your towel!",
	"6021": "Unknown Field Tag: %s",
	"6022": "Too many bits requested",
	"6023": "No bits requested",
	"6024": "Cannot recover from missing StripByteCounts",
	"6025": "Cannot handle sub-byte bits per sample",
	"6026": "Cannot handle sub-byte bits per pixel",
	"6027": "Palette image missing color map",
	"6028": "Unknown Photometric Interpretation: %s",
	"6029": "Unkown error",
	"6030": "cc.ParticleSystem: error decoding or ungzipping textureImageData",
	"6031": "cc.ParticleSystem: unknown image format with Data",
	"6032": "cc.ParticleSystem.initWithDictionary() : error loading the texture",
	"6033": "cc.ParticleSystem: not allowing create to be invoked twice with different particle system",
	"6034": "cc.ParticleSystem: shouldn't be initialized repetitively, otherwise there will be potential leak",
	"6035": "cc.ParticleSystem: change material failed, please use proper particle material",
	"6036": "cc.ParticleSystem: life time should bigger than 1 or buffer will be insufficient",
	"6400": "asset.url is not usable in core process",
	"6402": "AssetLibrary has already been initialized!",
	"6500": "Widget target must be one of the parent nodes of it",
	"6600": "collider not added or already removed",
	"6601": "Can't find testFunc for (%s, $s).",
	"6700": "Can't init canvas '%s' because it conflicts with the existing '%s', the scene should only have one active canvas at the same time.",
	"6705": "Argument must be non-nil",
	"6706": "Priority can't be set in RenderRoot2D node",
	"6800": "Callback of event must be non-nil",
	"6801": "The message must be provided",
	"6900": "The thing you want to instantiate must be an object",
	"6901": "The thing you want to instantiate is nil",
	"6902": "The thing you want to instantiate is destroyed",
	"6903": "The instantiate method for given asset do not implemented",
	"6904": "Can not instantiate array",
	"6905": "Can not instantiate DOM element",
	"7100": "%s already defined in Enum.",
	"7101": "Sorry, 'cc.Enum' not available on this platform, please report this error here: <https://github.com/cocos-creator/engine/issues/new>",
	"7200": "Method 'initWithTMXFile' is no effect now, please set property 'tmxAsset' instead.",
	"7201": "Method 'initWithXML' is no effect now, please set property 'tmxAsset' instead.",
	"7202": "Add component TiledLayer into node failed.",
	"7203": "Property 'mapLoaded' is unused now. Please write the logic to the callback 'start'.",
	"7210": "TMX Hexa zOrder not supported",
	"7211": "TMX invalid value",
	"7215": "cocos2d: Warning: TMX Layer %s has no tiles",
	"7216": "cocos2d: TMXFormat: Unsupported TMX version: %s",
	"7217": "cocos2d: TMXFomat: Unsupported orientation: %s",
	"7218": "cc.TMXMapInfo.parseXMLFile(): unsupported compression method",
	"7219": "cc.TMXMapInfo.parseXMLFile(): Only base64 and/or gzip/zlib maps are supported",
	"7221": "cc.TMXMapInfo.parseXMLFile(): Texture '%s' not found.",
	"7222": "Parse %s failed.",
	"7236": "cc.TMXLayer.getTileAt(): TMXLayer: the tiles map has been released",
	"7237": "cc.TMXLayer.getTileGIDAt(): TMXLayer: the tiles map has been released",
	"7238": "cc.TMXLayer.setTileGID(): TMXLayer: the tiles map has been released",
	"7239": "cc.TMXLayer.setTileGID(): invalid gid: %s",
	"7240": "cc.TMXLayer.getTileFlagsAt(): TMXLayer: the tiles map has been released",
	"7241": "cc.TiledMap.initWithXML(): Map not found. Please check the filename.",
	"7242": "TiledLayer.addUserNode node has been added.",
	"7243": "TiledLayer.removeUserNode node is not exist",
	"7401": "Failed to set _defaultArmatureIndex for '%s' because the index is out of range.",
	"7402": "Failed to set _animationIndex for '%s' because the index is out of range.",
	"7501": "Failed to set _defaultSkinIndex for '%s' because the index is out of range.",
	"7502": "Failed to set _animationIndex for '%s' because its skeletonData is invalid.",
	"7503": "Failed to set _animationIndex for '%s' because the index is out of range.",
	"7504": "Can not render dynamic created SkeletonData",
	"7506": "Failed to load spine atlas '$s'",
	"7507": "Please re-import '%s' because its textures is not initialized! (This workflow will be improved in the future.)",
	"7508": "The atlas asset of '%s' is not exists!",
	"7509": "Spine: Animation not found: %s",
	"7510": "Spine: Animation not found: %s",
	"7511": "Spine: Invalid input!",
	"7600": "The context of RenderTexture is invalid.",
	"7601": "cc.RenderTexture._initWithWidthAndHeightForWebGL() : only RGB and RGBA formats are valid for a render texture;",
	"7602": "Could not attach texture to the framebuffer",
	"7603": "clearDepth isn't supported on Cocos2d-Html5",
	"7604": "saveToFile isn't supported on Cocos2d-Html5",
	"7605": "newCCImage isn't supported on Cocos2d-Html5",
	"7606": "GFXTexture is null",
	"7607": "readPixels buffer size smaller than %d",
	"7700": "On the web is always keep the aspect ratio",
	"7701": "Can't know status",
	"7702": "Video player's duration is not ready to get now!",
	"7703": "Video Downloader: video not supported on this browser!",
	"7800": "Web does not support loading",
	"7801": "Web does not support query history",
	"7802": "Web does not support query history",
	"7803": "The current browser does not support the GoBack",
	"7804": "The current browser does not support the GoForward",
	"7805": "Web does not support zoom",
	"7900": "cc.math.Matrix3.assign(): current matrix equals matIn",
	"7901": "cc.math.mat4Assign(): pOut equals pIn",
	"7902": "cc.mat.Matrix4.assignFrom(): mat4 equals current matrix",
	"7903": "cc.math.Matrix4 equal: pMat1 and pMat2 are same object.",
	"7904": "cc.math.Matrix4.extractPlane: Invalid plane index",
	"7905": "cc.math.mat4Assign(): pOut equals pIn",
	"7906": "cc.mat.Matrix4.assignFrom(): mat4 equals current matrix",
	"7907": "cc.math.Matrix4 equals: pMat1 and pMat2 are same object.",
	"7908": "Invalid matrix mode specified",
	"7909": "current quaternion is an invalid value",
	"8000": "Can't handle this field type or size",
	"8001": "No bytes requested",
	"8002": "Too many bytes requested",
	"8003": "Missing StripByteCounts!",
	"8100": "cocos2d: ERROR: Failed to compile shader:\n %s",
	"8101": "cocos2d: ERROR: Failed to compile vertex shader",
	"8102": "cocos2d: ERROR: Failed to compile fragment shader",
	"8103": "cc.GLProgram.link(): Cannot link invalid program",
	"8104": "cocos2d: ERROR: Failed to link program: %s",
	"8105": "cocos2d: cc.shaderCache._loadDefaultShader, error shader type",
	"8106": "Please load the resource firset : %s",
	"8107": "cc.GLProgram.getUniformLocationForName(): uniform name should be non-null",
	"8108": "cc.GLProgram.getUniformLocationForName(): Invalid operation. Cannot get uniform location when program is not initialized",
	"8109": "modelView matrix is undefined.",
	"8200": "Please set node's active instead of rigidbody's enabled.",
	"8300": "Should only one camera exists, please check your project.",
	"8301": "Camera does not support Canvas Mode.",
	"8302": "Camera.viewport is deprecated, please use setViewportInOrientedSpace instead.",
	"8400": "Wrong type arguments, 'filePath' must be a String.",
	"9000": "Stencil manager does not support level bigger than %d in this device.",
	"9001": "Stencil manager is already empty, cannot pop any mask",
	"9002": "Failed to request any buffer from a mesh buffer without accessor",
	"9003": "The internal state of LinearBufferAccessor have severe issue and irreversible, please check the reason",
	"9004": "Failed to allocate chunk in StaticVBAccessor, the requested buffer might be too large: %d bytes",
	"9005": "BATCHER2D_MEM_INCREMENT is too large, the Max value for BATCHER2D_MEM_INCREMENT is 2303KB (smaller than 65536 *9* 4 / 1024 = 2304KB)",
	"9006": "QuadRenderData is removed, please use MeshRenderData instead.",
	"9007": "Since v3.6, Because mask changes the inheritance relationship, you can directly manipulate the rendering components under the same node to complete the operation.",
	"9008": "request fullscreen is not supported on this platform.",
	"9009": "exit fullscreen is not supported on this platform.",
	"9100": "texture size exceeds current device limits %d/%d",
	"9101": "The length of the TypedArrayBuffer must be an integer.",
	"9201": "Cannot access game frame or container.",
	"9202": "Setting window size is not supported.",
	"9300": "The current buffer beyond the limit in ui static component, please reduce the amount",
	"9301": "The UI has not been initialized",
	"9302": "Can't getGFXSampler with out device",
	"9600": "[Physics]: please check to see if physics modules are included",
	"9610": "[Physics]: cannon.js physics system doesn't support capsule collider",
	"9611": "[Physics]: builtin physics system doesn't support mesh collider",
	"9612": "[Physics]: builtin physics system doesn't support cylinder collider",
	"9613": "[Physics]: cannon.js physics system doesn't support hinge drive and angular limit",
	"9620": "[Physics][Ammo]: changing the mesh is not supported after the initialization is completed",
	"9630": "[Physics]: A dynamic rigid body can not have the following collider shapes: Terrain, Plane and Non-convex Mesh. Node name: %s",
	"9640": "[Physics][builtin]: sweep functions are not supported in builtin",
	"9641": "[Physics][cannon.js]: sweep functions are not supported in cannon.js",
	"9642": "[Physics] PhysicsSystem initDefaultMaterial() Failed to load builtinMaterial.",
	"9643": "[Physics] Failed to load user customized default physics material: %s, will fallback to built-in default physics material",
	"9644": "[Physics] Failed to find ear. There might be self-intersection in the polygon.",
	"10001": "The sub-mesh contains %d vertices, which beyonds the capability (%d vertices most) of renderer of your platform.",
	"10002": "Sub-mesh may include at most %d morph targets, but you specified %d.",
	"11000": "WebGL context lost.",
	"12001": "BlendFactors are disabled when using custom material, please modify the blend state in the material instead.",
	"12002": "Can't add renderable component to this node because it already have one.",
	"12004": "SubModel can only support %d passes.",
	"12005": "Material already initialized, request aborted.",
	"12006": "Pass already destroyed.",
	"12007": "This is old usage, please swap the parameters.",
	"12008": "GeometryRenderer: too many lines.",
	"12009": "GeometryRenderer: too many triangles.",
	"12010": "PassUtils: illegal uniform handle, accessing uniform at offset %d",
	"12011": "Pass: setUniform is invoked with incompatible uniform data type for binding %d, expected type is %s",
	"12012": "Can't set a material instance to a sharedMaterial slot",
	"12100": "The font size is too big to be fitted into texture atlas. Please switch to other label cache modes or choose a smaller font size.",
	"12101": "The asset %s has been destroyed!",
	"12102": "Base pass cannot override states, please use pass instance instead.",
	"12103": "Custom pipeline create shader %s failed. Please reimport all effects (Menu->Developer->Refresh All Effect) and restart creator.",
	"12104": "Create shader %s failed.",
	"12105": "Pass resources incomplete.",
	"12106": "Cannot patch non-builtin macros.",
	"12107": "Custom pipeline invalid render pass, program: %s. Please reimport all effects (Menu->Developer->Refresh All Effect) and restart creator.",
	"12108": "Custom pipeline invalid render phase, program: %s. Please reimport all effects (Menu->Developer->Refresh All Effect) and restart creator.",
	"12109": "custom-pipeline module not available.",
	"12110": "MaterialPass passID in legacy pipeline is wrongly initialized.",
	"13100": "Incorrect CCON magic.",
	"13101": "Unknown CCON version number: %d.",
	"13102": "CCON Format error.",
	"13103": "Can not encode CCON binary: lack of text encoder.",
	"13104": "Can not decode CCON binary: lack of text decoder.",
	"14000": "State machine matched too many transitions(greater than %s) during this frame: %s.",
	"14100": "Pool.destroy no longer take a function as parameter, Please specify destruct function in the construction of Pool instead",
	"14200": "Can not update a static mesh.",
	"14201": "The primitiveIndex is out of range.",
	"14202": "meshopt asm decoder initialized",
	"14203": "meshopt wasm decoder initialized",
	"14204": "meshopt decoder error: %d",
	"14300": "Can not keep world transform due to the zero scaling of parent node",
	"14400": "Spline error: less than 2 knots.",
	"14401": "Spline error: less than 4 knots or not a multiple of 4.\n\n<!-- Rendering algorithm reserved: 15000 - 16000 -->",
	"15000": "Can not find corresponding diffuse map for environment lighting, use hemisphere diffuse instead, change environment lighting type to regenerate diffuse map",
	"15001": "Can not find environment map, disable IBL lighting",
	"15002": "Diffuse map resource is missing, please change environment lighting type to regenerate resource",
	"15003": "The shadow visible distance is so small that CSM stratification is not effective, Please change the value of shadowDistance so that it is 10 times greater than 0.1",
	"15004": "The native folder may be generated from older versions, please refer <https://docs.cocos.com/creator/manual/en/release-notes/> to upgrade.",
	"15100": "Camera '%s' clear flag is skybox, but skybox is disabled,  may cause strange background effect, please set camera clear flag to solid color.",
	"16000": "'%s' is deprecated since v%s.",
	"16001": "'%s' is deprecated since v%s, please use '%s' instead.",
	"16002": "'%s' is removed since v%s.",
	"16003": "'%s' is removed since v%s, please use '%s' instead.",
	"16101": "The effect('%s') you are looking for does not exist, please confirm the effect name in the editor. NOTE: Since 3.6, the name of the built-in effect has been changed to its name in the editor, please check it out. More information please refer to <https://docs.cocos.com/creator/manual/en/shader/effect-inspector.html>",
	"16201": "The asset replacing failed, can not found override asset('%s') for '%s'",
	"16300": "node '%s' doesn't have any UIRenderer component, this component will not work. please add UIRenderer component first",
	"16301": "node '%s' doesn't have any ModelRenderer component, this component will not work. please add ModelRenderer component first",
	"16302": "There is no reflection probe in the scene or no probe is near the current object. No reflection probe will take effect on this object. Please create a new reflection probe or move existing ones closer.",
	"16303": "Skin material needs floating-point render target, please check ENABLE_FLOAT_OUTPUT define in Project Settings--Macro",
	"16304": "Skin material may need more accurate calculations, please select a head model of standard size, check the isGlobalStandardSkinObject option in the MeshRender component.",
	"16305": "failed to stop accelerometer",
	"16306": "The data must have positions field",
	"16307": "please change type to sprite_stencil first",
	"16308": "illegal index count!",
	"16309": "Unsupported Format, convert to WebGL internal format failed.",
	"16310": "Unsupported Format, convert to WebGL format failed.",
	"16311": "Unsupported GLType, convert to GL type failed.",
	"16312": "Unsupported GLType, convert to TypedArrayConstructor failed.",
	"16313": "Unsupported GLType, convert to Type failed.",
	"16314": "Unsupported GLType, get type failed.",
	"16315": "Unsupported BufferType, create buffer failed.",
	"16316": "Unsupported BufferType, update buffer failed.",
	"16317": "Unsupported TextureType, create texture failed.",
	"16318": "glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_ATTACHMENT",
	"16319": "glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT",
	"16320": "glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_DIMENSIONS",
	"16321": "glCheckFramebufferStatus() - FRAMEBUFFER_UNSUPPORTED",
	"16322": "Unsupported ShaderType.",
	"16323": "%s in '%s' compilation failed.",
	"16324": "Shader source dump: %s",
	"16325": "Shader '%s' compilation succeeded.",
	"16326": "Failed to link shader: %s",
	"16327": "Unsupported GL texture type, copy buffer to texture failed.",
	"16328": "Command 'draw' must be recorded inside a render pass.",
	"16329": "Command 'updateBuffer' must be recorded outside a render pass.",
	"16330": "Command 'copyBufferToTexture' must be recorded outside a render pass.",
	"16331": "InputAssemblerInfo.vertexBuffers is null.",
	"16332": "Illegal index buffer stride.",
	"16333": "This device does not support WebGL.",
	"16334": "A Class already exists with the same %s : %s. %s",
	"16335": "\"%s\" has already been set as name or alias of another class.",
	"16336": "\"%s\" has already been set as id or alias of another class.",
	"16337": "can not support canvas rendering in 3D",
	"16338": "The '_$erialized' prop in MissingScript is missing. Please contact jare.",
	"16339": "Error props: ['%s']",
	"16340": "Error when checking MissingScript 5, %s",
	"16341": "The '_$erialized' prop of MissingScript is missing. Will force the raw data to be save.",
	"16342": "Error props: ['%s']. Please contact jare.",
	"16343": "Unable to stash previously serialized data. %s",
	"16344": "Error when checking MissingScript 6, %s",
	"16345": "uniform '%s' must have a count",
	"16346": "Invalid GFX API!",
	"16347": "The number of mipmaps of each face is different.",
	"16348": "builtin UBO '%s' not available!",
	"16349": "builtin samplerTexture '%s' not available!",
	"16350": "The asset %s is missing!",
	"16351": "the native asset of %s is missing!",
	"16352": "The asset %s is invalid for some reason, detail message: %s, stack: %s",
	"16353": "Can't find letter in this bitmap-font",
	"16354": "Can't find letter definition in texture atlas %s for letter:%s",
	"16355": "Can't find letter definition in font family %s for letter: %s",
	"16356": "wrong format of version when compare version",
	"16357": "should use Vec3.multiply for vector * vector operation",
	"16358": "should use Vec3.scale for vector * scalar operation",
	"16359": "should use Vec2.multiply for vector * vector operation",
	"16360": "should use Vec2.scale for vector * scalar operation",
	"16361": "should use Vec4.multiply for vector * vector operation",
	"16362": "should use Vec4.scale for vector * scalar operation",
	"16363": "Unable to get device",
	"16364": "bitNum can't be undefined",
	"16365": "maximum layers reached.",
	"16366": "do not change buildin layers.",
	"16367": "name can't be undefined",
	"16368": "Unable to access unknown layer.",
	"16369": "unknown define type '%s'",
	"16370": "Shaders in material asset '%s' cannot be modified at runtime, please instantiate the material first.",
	"16371": "Pipeline states in material asset '%s' cannot be modified at runtime, please instantiate the material first.",
	"16372": "illegal pass index: %s.",
	"16373": "illegal property name: %s.",
	"16374": "Unexpected attribute!",
	"16375": "Unexpected: failed to create morph texture?",
	"16376": "The fnt config is not exists!",
	"16377": "SpriteAtlas is null.",
	"16378": "node '%s' doesn't have any renderable component",
	"16379": "cannot resize buffer views!",
	"16380": "cannot update through buffer views!",
	"16381": "Profiler._stats is deprecated, please use Profiler.stats instead.",
	"16382": "reverse: could not reverse a non-relative action",
	"16383": "Need 'clone' for custom prop '%s'",
	"16384": "Need 'add' for custom prop '%s'",
	"16385": "Need 'sub' for custom prop '%s' in reverse mode",
	"16386": "TweenAction: '%s' can't be converted to number",
	"16387": "Wrong return type for 'progress', number or string needed",
	"16388": "reverse: current tween could not be reversed, empty actions",
	"16389": "pause: tween wasn't started, can't pause",
	"16390": "resume: tween wasn't started, can't resume",
	"16391": "reverse: could not find action id %s",
	"16392": "Please set target to tween first",
	"16393": "start: no actions in Tween",
	"16394": "repeatForever: the last action is not ActionInterval",
	"16395": "reverseTime: the last action is not ActionInterval",
	"16396": "tweenUtil' is deprecated, please use 'tween' instead",
	"16397": "ProgressBar FILLED mode only works when barSprite's Type is FILLED!",
	"16398": "ProgressBar non-FILLED mode only works when barSprite's Type is non-FILLED!",
	"16399": "CopyTextureToBuffers: not supported texture target.",
	"16400": "Limit values to be greater than 0",
	"16401": "beginRenderPass: Only primary command buffer is supported.",
	"16402": "execute is not supported.",
	"16403": "GPU memory alias is not supported",
	"16404": "Block '%s' does not bound",
	"16405": "This device does not support WebGL2",
	"16406": "Can't find the spriteFrame of tilesets %s",
	"16407": "Spline error: invalid mode",
	"16408": "[Physics2D] b2PolygonShape failed to decompose polygon into convex polygons, node name: %s",
	"16409": "setVertexEffectDelegate is deprecated since spine 4.2.",
	"16410": "Debug bones or slots is invalid in cached mode.",
	"16411": "Slots visible range can not be modified in cached mode.",
	"16412": "Track index can not greater than 0 in cached mode.",
	"16413": "Track index can not greater than 0 in cached mode.",
	"16414": "'getCurrent' interface can not be invoked in cached mode.",
	"16415": "cached mode not support setMix!!!",
	"16416": "'clearTracks' interface can not be invoked in cached mode.",
	"16417": "'clearTrack' interface can not be invoked in cached mode.",
	"16418": "Debug bones or slots is invalid in cached mode.",
	"16419": "Spine version not supported.",
	"0100": "%s not yet implemented.",
	"0200": "You should specify a valid DOM canvas element."
};

var ccdocument = ccwindow.document;
var logList = null;
var ccLog = console.log.bind(console);
var ccWarn = ccLog;
var ccError = ccLog;
var ccAssert = function ccAssert(condition, message) {
  if (!condition) {
    for (var _len = arguments.length, optionalParams = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      optionalParams[_key - 2] = arguments[_key];
    }
    console.log("ASSERT: " + formatString.apply(void 0, [message].concat(optionalParams)));
  }
};
var ccDebug = ccLog;
function formatString() {
  for (var _len2 = arguments.length, data = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    data[_key2] = arguments[_key2];
  }
  return legacyCC.js.formatStr.apply(null, data);
}
function log() {
  return ccLog.apply(void 0, arguments);
}
function warn() {
  return ccWarn.apply(void 0, arguments);
}
function error() {
  return ccError.apply(void 0, arguments);
}
function assert(condition, message) {
  for (var _len3 = arguments.length, optionalParams = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    optionalParams[_key3 - 2] = arguments[_key3];
  }
  return ccAssert.apply(void 0, [condition, message].concat(optionalParams));
}
function debug() {
  return ccDebug.apply(void 0, arguments);
}
function _resetDebugSetting(mode) {
  ccLog = ccWarn = ccError = ccAssert = ccDebug = function ccDebug() {};
  if (mode === DebugMode.NONE) {
    return;
  }
  if (mode > DebugMode.ERROR) {
    var logToWebPage = function logToWebPage(msg) {
      if (!legacyCC.game.canvas) {
        return;
      }
      if (!logList) {
        var logDiv = ccdocument.createElement('Div');
        logDiv.setAttribute('id', 'logInfoDiv');
        logDiv.setAttribute('width', '200');
        var height = legacyCC.game.canvas.height;
        logDiv.setAttribute('height', "" + height);
        var logDivStyle = logDiv.style;
        logDivStyle.zIndex = '99999';
        logDivStyle.position = 'absolute';
        logDivStyle.top = logDivStyle.left = '0';
        logList = ccdocument.createElement('textarea');
        logList.setAttribute('rows', '20');
        logList.setAttribute('cols', '30');
        logList.setAttribute('disabled', 'true');
        var logListStyle = logList.style;
        logListStyle.backgroundColor = 'transparent';
        logListStyle.borderBottom = '1px solid #cccccc';
        logListStyle.borderTopWidth = logListStyle.borderLeftWidth = logListStyle.borderRightWidth = '0px';
        logListStyle.borderTopStyle = logListStyle.borderLeftStyle = logListStyle.borderRightStyle = 'none';
        logListStyle.padding = '0px';
        logListStyle.margin = '0px';
        logDiv.appendChild(logList);
        legacyCC.game.canvas.parentNode.appendChild(logDiv);
      }
      logList.value = logList.value + msg + "\r\n";
      logList.scrollTop = logList.scrollHeight;
    };
    ccError = function ccError() {
      logToWebPage("ERROR :  " + formatString.apply(void 0, arguments));
    };
    ccAssert = function ccAssert(condition, message) {
      if (!condition) {
        for (var _len4 = arguments.length, optionalParams = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          optionalParams[_key4 - 2] = arguments[_key4];
        }
        logToWebPage("ASSERT: " + formatString.apply(void 0, [message].concat(optionalParams)));
      }
    };
    if (mode !== DebugMode.ERROR_FOR_WEB_PAGE) {
      ccWarn = function ccWarn() {
        logToWebPage("WARN :  " + formatString.apply(void 0, arguments));
      };
    }
    if (mode === DebugMode.INFO_FOR_WEB_PAGE) {
      ccLog = function ccLog() {
        logToWebPage(formatString.apply(void 0, arguments));
      };
    }
  } else if (console) {
    if (!console.error) {
      console.error = console.log;
    }
    if (!console.warn) {
      console.warn = console.log;
    }
    if (console.error.bind) {
      ccError = console.error.bind(console);
    } else {
      ccError = function () {
        for (var _len5 = arguments.length, data = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          data[_key5] = arguments[_key5];
        }
        return console.error.apply(console, data);
      };
    }
    ccAssert = function ccAssert(condition, message) {
      if (!condition) {
        for (var _len6 = arguments.length, optionalParams = new Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
          optionalParams[_key6 - 2] = arguments[_key6];
        }
        var errorText = formatString.apply(void 0, [message].concat(optionalParams));
        {
          console.error(errorText);
        }
      }
    };
  }
  if (mode !== DebugMode.ERROR) {
    if (console.warn.bind) {
      ccWarn = console.warn.bind(console);
    } else {
      ccWarn = function () {
        for (var _len7 = arguments.length, data = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
          data[_key7] = arguments[_key7];
        }
        return console.warn.apply(console, data);
      };
    }
  }
  if (mode <= DebugMode.INFO) {
    if (console.log.bind) {
      ccLog = console.log.bind(console);
    } else {
      ccLog = function ccLog() {
        for (var _len8 = arguments.length, data = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
          data[_key8] = arguments[_key8];
        }
        return console.log.apply(console, data);
      };
    }
  }
  if (mode <= DebugMode.VERBOSE) {
    if (typeof console.debug === 'function') {
      var vendorDebug = console.debug.bind(console);
      ccDebug = function ccDebug() {
        return vendorDebug.apply(void 0, arguments);
      };
    }
  }
}
function _throw(error_) {
  {
    var stack = error_.stack;
    if (stack) {
      error(stack);
    } else {
      error(error_);
    }
    return undefined;
  }
}
function getTypedFormatter(type) {
  return function (id) {
    var msg = debugInfos[id] || 'unknown id' ;
    for (var _len9 = arguments.length, args = new Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
      args[_key9 - 1] = arguments[_key9];
    }
    if (args.length === 0) {
      return msg;
    }
    return formatString.apply(void 0, [msg].concat(args)) ;
  };
}
var logFormatter = getTypedFormatter();
function logID(id) {
  for (var _len0 = arguments.length, optionalParams = new Array(_len0 > 1 ? _len0 - 1 : 0), _key0 = 1; _key0 < _len0; _key0++) {
    optionalParams[_key0 - 1] = arguments[_key0];
  }
  log(logFormatter.apply(void 0, [id].concat(optionalParams)));
}
var debugFormatter = getTypedFormatter();
function debugID(id) {
  for (var _len1 = arguments.length, optionalParams = new Array(_len1 > 1 ? _len1 - 1 : 0), _key1 = 1; _key1 < _len1; _key1++) {
    optionalParams[_key1 - 1] = arguments[_key1];
  }
  debug(debugFormatter.apply(void 0, [id].concat(optionalParams)));
}
var warnFormatter = getTypedFormatter();
function warnID(id) {
  for (var _len10 = arguments.length, optionalParams = new Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
    optionalParams[_key10 - 1] = arguments[_key10];
  }
  warn(warnFormatter.apply(void 0, [id].concat(optionalParams)));
}
var errorFormatter = getTypedFormatter();
function errorID(id) {
  for (var _len11 = arguments.length, optionalParams = new Array(_len11 > 1 ? _len11 - 1 : 0), _key11 = 1; _key11 < _len11; _key11++) {
    optionalParams[_key11 - 1] = arguments[_key11];
  }
  error(errorFormatter.apply(void 0, [id].concat(optionalParams)));
}
var assertFormatter = getTypedFormatter();
function assertID(condition, id) {
  if (condition) {
    return;
  }
  for (var _len12 = arguments.length, optionalParams = new Array(_len12 > 2 ? _len12 - 2 : 0), _key12 = 2; _key12 < _len12; _key12++) {
    optionalParams[_key12 - 2] = arguments[_key12];
  }
  assert(false, assertFormatter.apply(void 0, [id].concat(optionalParams)));
}
var DebugMode;
(function (DebugMode) {
  DebugMode[DebugMode["NONE"] = 0] = "NONE";
  DebugMode[DebugMode["VERBOSE"] = 1] = "VERBOSE";
  DebugMode[DebugMode["INFO"] = 2] = "INFO";
  DebugMode[DebugMode["WARN"] = 3] = "WARN";
  DebugMode[DebugMode["ERROR"] = 4] = "ERROR";
  DebugMode[DebugMode["INFO_FOR_WEB_PAGE"] = 5] = "INFO_FOR_WEB_PAGE";
  DebugMode[DebugMode["WARN_FOR_WEB_PAGE"] = 6] = "WARN_FOR_WEB_PAGE";
  DebugMode[DebugMode["ERROR_FOR_WEB_PAGE"] = 7] = "ERROR_FOR_WEB_PAGE";
})(DebugMode || (DebugMode = {}));
function getError(errorId) {
  for (var _len13 = arguments.length, param = new Array(_len13 > 1 ? _len13 - 1 : 0), _key13 = 1; _key13 < _len13; _key13++) {
    param[_key13 - 1] = arguments[_key13];
  }
  return errorFormatter.apply(void 0, [errorId].concat(param));
}
function isDisplayStats() {
  return legacyCC.profiler ? legacyCC.profiler.isShowingStats() : false;
}
function setDisplayStats(displayStats) {
  if (legacyCC.profiler) {
    displayStats ? legacyCC.profiler.showStats() : legacyCC.profiler.hideStats();
  }
}

var debug$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get DebugMode () { return DebugMode; },
  _resetDebugSetting: _resetDebugSetting,
  _throw: _throw,
  assert: assert,
  assertID: assertID,
  debug: debug,
  debugID: debugID,
  error: error,
  errorID: errorID,
  getError: getError,
  isDisplayStats: isDisplayStats,
  log: log,
  logID: logID,
  setDisplayStats: setDisplayStats,
  warn: warn,
  warnID: warnID
});

var INT_BITS = 32;
var INT_MAX = 0x7fffffff;
var INT_MIN = -1 << INT_BITS - 1;
function sign(v) {
  return (v > 0) - (v < 0);
}
function abs(v) {
  var mask = v >> INT_BITS - 1;
  return (v ^ mask) - mask;
}
function min(x, y) {
  return y ^ (x ^ y) & -(x < y);
}
function max(x, y) {
  return x ^ (x ^ y) & -(x < y);
}
function isPow2(v) {
  return !(v & v - 1) && !!v;
}
function log2(v) {
  var r;
  var shift;
  r = (v > 0xFFFF) << 4;
  v >>>= r;
  shift = (v > 0xFF) << 3;
  v >>>= shift;
  r |= shift;
  shift = (v > 0xF) << 2;
  v >>>= shift;
  r |= shift;
  shift = (v > 0x3) << 1;
  v >>>= shift;
  r |= shift;
  return r | v >> 1;
}
function log10(v) {
  return v >= 1000000000 ? 9 : v >= 100000000 ? 8 : v >= 10000000 ? 7 : v >= 1000000 ? 6 : v >= 100000 ? 5 : v >= 10000 ? 4 : v >= 1000 ? 3 : v >= 100 ? 2 : v >= 10 ? 1 : 0;
}
function popCount(v) {
  v -= v >>> 1 & 0x55555555;
  v = (v & 0x33333333) + (v >>> 2 & 0x33333333);
  return (v + (v >>> 4) & 0xF0F0F0F) * 0x1010101 >>> 24;
}
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) {
    c--;
  }
  if (v & 0x0000FFFF) {
    c -= 16;
  }
  if (v & 0x00FF00FF) {
    c -= 8;
  }
  if (v & 0x0F0F0F0F) {
    c -= 4;
  }
  if (v & 0x33333333) {
    c -= 2;
  }
  if (v & 0x55555555) {
    c -= 1;
  }
  return c;
}
function nextPow2(v) {
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}
function prevPow2(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v >>> 1);
}
function parity(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return 0x6996 >>> v & 1;
}
var REVERSE_TABLE = new Array(256);
(function (tab) {
  for (var i = 0; i < 256; ++i) {
    var v = i;
    var r = i;
    var s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = r << s & 0xff;
  }
})(REVERSE_TABLE);
function reverse(v) {
  return REVERSE_TABLE[v & 0xff] << 24 | REVERSE_TABLE[v >>> 8 & 0xff] << 16 | REVERSE_TABLE[v >>> 16 & 0xff] << 8 | REVERSE_TABLE[v >>> 24 & 0xff];
}
function interleave2(x, y) {
  x &= 0xFFFF;
  x = (x | x << 8) & 0x00FF00FF;
  x = (x | x << 4) & 0x0F0F0F0F;
  x = (x | x << 2) & 0x33333333;
  x = (x | x << 1) & 0x55555555;
  y &= 0xFFFF;
  y = (y | y << 8) & 0x00FF00FF;
  y = (y | y << 4) & 0x0F0F0F0F;
  y = (y | y << 2) & 0x33333333;
  y = (y | y << 1) & 0x55555555;
  return x | y << 1;
}
function deinterleave2(v, n) {
  v = v >>> n & 0x55555555;
  v = (v | v >>> 1) & 0x33333333;
  v = (v | v >>> 2) & 0x0F0F0F0F;
  v = (v | v >>> 4) & 0x00FF00FF;
  v = (v | v >>> 16) & 0x000FFFF;
  return v << 16 >> 16;
}
function interleave3(x, y, z) {
  x &= 0x3FF;
  x = (x | x << 16) & 4278190335;
  x = (x | x << 8) & 251719695;
  x = (x | x << 4) & 3272356035;
  x = (x | x << 2) & 1227133513;
  y &= 0x3FF;
  y = (y | y << 16) & 4278190335;
  y = (y | y << 8) & 251719695;
  y = (y | y << 4) & 3272356035;
  y = (y | y << 2) & 1227133513;
  x |= y << 1;
  z &= 0x3FF;
  z = (z | z << 16) & 4278190335;
  z = (z | z << 8) & 251719695;
  z = (z | z << 4) & 3272356035;
  z = (z | z << 2) & 1227133513;
  return x | z << 2;
}
function deinterleave3(v, n) {
  v = v >>> n & 1227133513;
  v = (v | v >>> 2) & 3272356035;
  v = (v | v >>> 4) & 251719695;
  v = (v | v >>> 8) & 4278190335;
  v = (v | v >>> 16) & 0x3FF;
  return v << 22 >> 22;
}
function nextCombination(v) {
  var t = v | v - 1;
  return t + 1 | (~t & -~t) - 1 >>> countTrailingZeros(v) + 1;
}

var bits = /*#__PURE__*/Object.freeze({
  __proto__: null,
  INT_BITS: INT_BITS,
  INT_MAX: INT_MAX,
  INT_MIN: INT_MIN,
  abs: abs,
  countTrailingZeros: countTrailingZeros,
  deinterleave2: deinterleave2,
  deinterleave3: deinterleave3,
  interleave2: interleave2,
  interleave3: interleave3,
  isPow2: isPow2,
  log10: log10,
  log2: log2,
  max: max,
  min: min,
  nextCombination: nextCombination,
  nextPow2: nextPow2,
  parity: parity,
  popCount: popCount,
  prevPow2: prevPow2,
  reverse: reverse,
  sign: sign
});

var MutableForwardIterator = function () {
  function MutableForwardIterator(array) {
    this.i = 0;
    this.array = array;
  }
  var _proto = MutableForwardIterator.prototype;
  _proto.remove = function remove(value) {
    var index = this.array.indexOf(value);
    if (index >= 0) {
      this.removeAt(index);
    }
  };
  _proto.removeAt = function removeAt(i) {
    this.array.splice(i, 1);
    if (i <= this.i) {
      --this.i;
    }
  };
  _proto.fastRemove = function fastRemove(value) {
    var index = this.array.indexOf(value);
    if (index >= 0) {
      this.fastRemoveAt(index);
    }
  };
  _proto.fastRemoveAt = function fastRemoveAt(i) {
    var array = this.array;
    array[i] = array[array.length - 1];
    --array.length;
    if (i <= this.i) {
      --this.i;
    }
  };
  _proto.push = function push(item) {
    this.array.push(item);
  };
  return _createClass(MutableForwardIterator, [{
    key: "length",
    get: function get() {
      return this.array.length;
    },
    set: function set(value) {
      this.array.length = value;
      if (this.i >= value) {
        this.i = value - 1;
      }
    }
  }]);
}();
function removeAt(array, index) {
  array.splice(index, 1);
}
function fastRemoveAt$1(array, index) {
  var length = array.length;
  if (index < 0 || index >= length) {
    return;
  }
  array[index] = array[length - 1];
  array.length = length - 1;
}
function remove(array, value) {
  var index = array.indexOf(value);
  if (index >= 0) {
    removeAt(array, index);
    return true;
  } else {
    return false;
  }
}
function fastRemove(array, value) {
  var index = array.indexOf(value);
  if (index >= 0) {
    array[index] = array[array.length - 1];
    --array.length;
  }
}
function removeIf(array, predicate) {
  var index = array.findIndex(predicate);
  if (index >= 0) {
    var value = array[index];
    removeAt(array, index);
    return value;
  }
  return undefined;
}
function verifyType(array, type) {
  if (array && array.length > 0) {
    for (var _iterator = _createForOfIteratorHelperLoose(array), _step; !(_step = _iterator()).done;) {
      var item = _step.value;
      if (!(item instanceof type)) {
        logID(1300);
        return false;
      }
    }
  }
  return true;
}
function removeArray(array, removals) {
  for (var i = 0, l = removals.length; i < l; i++) {
    remove(array, removals[i]);
  }
}
function appendObjectsAt(array, objects, index) {
  array.splice.apply(array, [index, 0].concat(objects));
  return array;
}
function contains$1(array, value) {
  return array.indexOf(value) >= 0;
}
function copy(array) {
  var len = array.length;
  var cloned = new Array(len);
  for (var i = 0; i < len; i += 1) {
    cloned[i] = array[i];
  }
  return cloned;
}
function fillItems(array) {
  for (var i = 0, len = arguments.length <= 1 ? 0 : arguments.length - 1; i < len; ++i) {
    array[i] = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
  }
}

var array = /*#__PURE__*/Object.freeze({
  __proto__: null,
  MutableForwardIterator: MutableForwardIterator,
  appendObjectsAt: appendObjectsAt,
  contains: contains$1,
  copy: copy,
  fastRemove: fastRemove,
  fastRemoveAt: fastRemoveAt$1,
  fillItems: fillItems,
  remove: remove,
  removeArray: removeArray,
  removeAt: removeAt,
  removeIf: removeIf,
  verifyType: verifyType
});

var ScalableContainer = function () {
  function ScalableContainer() {
    this._poolHandle = -1;
    scalableContainerManager.addContainer(this);
  }
  var _proto = ScalableContainer.prototype;
  _proto.destroy = function destroy() {
    scalableContainerManager.removeContainer(this);
  };
  return ScalableContainer;
}();
var ScalableContainerManager = function () {
  function ScalableContainerManager() {
    this._pools = [];
    this._lastShrinkPassed = 0;
    this.shrinkTimeSpan = 5;
  }
  var _proto2 = ScalableContainerManager.prototype;
  _proto2.addContainer = function addContainer(pool) {
    if (pool._poolHandle !== -1) return;
    pool._poolHandle = this._pools.length;
    this._pools.push(pool);
  };
  _proto2.removeContainer = function removeContainer(pool) {
    if (pool._poolHandle === -1) return;
    this._pools[this._pools.length - 1]._poolHandle = pool._poolHandle;
    fastRemoveAt$1(this._pools, pool._poolHandle);
    pool._poolHandle = -1;
  };
  _proto2.tryShrink = function tryShrink() {
    for (var i = 0; i < this._pools.length; i++) {
      this._pools[i].tryShrink();
    }
  };
  _proto2.update = function update(dt) {
    this._lastShrinkPassed += dt;
    if (this._lastShrinkPassed > this.shrinkTimeSpan) {
      this.tryShrink();
      this._lastShrinkPassed -= this.shrinkTimeSpan;
    }
  };
  return ScalableContainerManager;
}();
var scalableContainerManager = new ScalableContainerManager();

var Pool$1 = function (_ScalableContainer) {
  function Pool(ctor, elementsPerBatch, dtor, shrinkThreshold) {
    var _this;
    _this = _ScalableContainer.call(this) || this;
    _this._freePool = [];
    _this._ctor = ctor;
    _this._dtor = dtor || null;
    _this._elementsPerBatch = Math.max(elementsPerBatch, 1);
    _this._shrinkThreshold = shrinkThreshold ? max(shrinkThreshold, 1) : _this._elementsPerBatch;
    _this._nextAvail = _this._elementsPerBatch - 1;
    for (var i = 0; i < _this._elementsPerBatch; ++i) {
      _this._freePool.push(ctor());
    }
    return _this;
  }
  _inheritsLoose(Pool, _ScalableContainer);
  var _proto = Pool.prototype;
  _proto.alloc = function alloc() {
    if (this._nextAvail < 0) {
      this._freePool.length = this._elementsPerBatch;
      for (var i = 0; i < this._elementsPerBatch; i++) {
        this._freePool[i] = this._ctor();
      }
      this._nextAvail = this._elementsPerBatch - 1;
    }
    return this._freePool[this._nextAvail--];
  };
  _proto.free = function free(obj) {
    this._freePool[++this._nextAvail] = obj;
  };
  _proto.freeArray = function freeArray(objs) {
    this._freePool.length = this._nextAvail + 1;
    Array.prototype.push.apply(this._freePool, objs);
    this._nextAvail += objs.length;
  };
  _proto.tryShrink = function tryShrink() {
    var freeObjectNumber = this._nextAvail + 1;
    if (freeObjectNumber <= this._shrinkThreshold) {
      return;
    }
    var objectNumberToShrink = 0;
    if (freeObjectNumber >> 1 >= this._shrinkThreshold) {
      objectNumberToShrink = freeObjectNumber >> 1;
    } else {
      objectNumberToShrink = Math.floor((freeObjectNumber - this._shrinkThreshold + 1) / 2);
    }
    if (this._dtor) {
      for (var i = this._nextAvail - objectNumberToShrink + 1; i <= this._nextAvail; ++i) {
        this._dtor(this._freePool[i]);
      }
    }
    this._nextAvail -= objectNumberToShrink;
    this._freePool.length = this._nextAvail + 1;
  };
  _proto.destroy = function destroy() {
    var dtor = arguments.length > 0 ? arguments[0] : null;
    if (dtor) {
      warnID(14100);
    }
    var readDtor = dtor || this._dtor;
    if (readDtor) {
      for (var i = 0; i <= this._nextAvail; i++) {
        readDtor(this._freePool[i]);
      }
    }
    this._freePool.length = 0;
    this._nextAvail = -1;
    _ScalableContainer.prototype.destroy.call(this);
  };
  return Pool;
}(ScalableContainer);

var RecyclePool = function (_ScalableContainer) {
  function RecyclePool(fn, size, dtor) {
    var _this;
    _this = _ScalableContainer.call(this) || this;
    _this._count = 0;
    _this._fn = fn;
    _this._dtor = dtor || null;
    _this._data = new Array(size);
    _this._initSize = size;
    for (var i = 0; i < size; ++i) {
      _this._data[i] = fn();
    }
    return _this;
  }
  _inheritsLoose(RecyclePool, _ScalableContainer);
  var _proto = RecyclePool.prototype;
  _proto.reset = function reset() {
    this._count = 0;
  };
  _proto.resize = function resize(size) {
    if (size > this._data.length) {
      for (var i = this._data.length; i < size; ++i) {
        this._data[i] = this._fn();
      }
    }
  };
  _proto.add = function add() {
    if (this._count >= this._data.length) {
      this.resize(this._data.length << 1);
    }
    return this._data[this._count++];
  };
  _proto.destroy = function destroy() {
    if (this._dtor) {
      for (var i = 0; i < this._data.length; i++) {
        this._dtor(this._data[i]);
      }
    }
    this._data.length = 0;
    this._count = 0;
    _ScalableContainer.prototype.destroy.call(this);
  };
  _proto.tryShrink = function tryShrink() {
    if (this._data.length >> 2 > this._count) {
      var length = Math.max(this._initSize, this._data.length >> 1);
      if (this._dtor) {
        for (var i = length; i < this._data.length; i++) {
          this._dtor(this._data[i]);
        }
      }
      this._data.length = length;
    }
  };
  _proto.removeAt = function removeAt(idx) {
    if (idx >= this._count) {
      return;
    }
    var last = this._count - 1;
    var tmp = this._data[idx];
    this._data[idx] = this._data[last];
    this._data[last] = tmp;
    this._count -= 1;
  };
  return _createClass(RecyclePool, [{
    key: "length",
    get: function get() {
      return this._count;
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    }
  }]);
}(ScalableContainer);

var CachedArray = function (_ScalableContainer) {
  function CachedArray(length, compareFn) {
    var _this;
    _this = _ScalableContainer.call(this) || this;
    _this.length = 0;
    _this._initSize = 0;
    _this.array = new Array(length);
    _this._initSize = length;
    _this._compareFn = compareFn;
    return _this;
  }
  _inheritsLoose(CachedArray, _ScalableContainer);
  var _proto = CachedArray.prototype;
  _proto.push = function push(item) {
    this.array[this.length++] = item;
  };
  _proto.pop = function pop() {
    return this.array[--this.length];
  };
  _proto.get = function get(idx) {
    return this.array[idx];
  };
  _proto.clear = function clear() {
    this.length = 0;
  };
  _proto.destroy = function destroy() {
    this.length = 0;
    this.array.length = 0;
    _ScalableContainer.prototype.destroy.call(this);
  };
  _proto.tryShrink = function tryShrink() {
    if (this.array.length >> 2 > this.length) {
      this.array.length = Math.max(this._initSize, this.array.length >> 1);
    }
  };
  _proto.sort = function sort() {
    this.array.length = this.length;
    this.array.sort(this._compareFn);
  };
  _proto.concat = function concat(array) {
    for (var i = 0; i < array.length; ++i) {
      this.array[this.length++] = array[i];
    }
  };
  _proto.fastRemove = function fastRemove(idx) {
    if (idx >= this.length || idx < 0) {
      return;
    }
    var last = --this.length;
    this.array[idx] = this.array[last];
  };
  _proto.indexOf = function indexOf(val) {
    for (var i = 0, len = this.length; i < len; ++i) {
      if (this.array[i] === val) {
        return i;
      }
    }
    return -1;
  };
  return CachedArray;
}(ScalableContainer);

var _IDGenerator;
var NonUuidMark = '.';
var IDGenerator = function () {
  function IDGenerator(category) {
    this.id = 0 | Math.random() * 998;
    this.prefix = category ? category + NonUuidMark : '';
  }
  var _proto = IDGenerator.prototype;
  _proto.getNewId = function getNewId() {
    return this.prefix + (++this.id).toString();
  };
  return IDGenerator;
}();
_IDGenerator = IDGenerator;
IDGenerator.global = new _IDGenerator('global');

var tempCIDGenerator = new IDGenerator('TmpCId.');
var aliasesTag = typeof Symbol === 'undefined' ? '__aliases__' : Symbol('[[Aliases]]');
var classNameTag = '__classname__';
var classIdTag = '__cid__';
function isNumber(object) {
  return typeof object === 'number' || object instanceof Number;
}
function isString(object) {
  return typeof object === 'string' || object instanceof String;
}
function isEmptyObject(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}
var value = function () {
  var descriptor = {
    value: undefined,
    enumerable: false,
    writable: false,
    configurable: true
  };
  return function (object, propertyName, value_, writable, enumerable) {
    descriptor.value = value_;
    descriptor.writable = writable;
    descriptor.enumerable = enumerable;
    Object.defineProperty(object, propertyName, descriptor);
    descriptor.value = undefined;
  };
}();
var getset = function () {
  var descriptor = {
    get: undefined,
    set: undefined,
    enumerable: false
  };
  return function (object, propertyName, getter, setter, enumerable, configurable) {
    if (enumerable === void 0) {
      enumerable = false;
    }
    if (configurable === void 0) {
      configurable = false;
    }
    if (typeof setter === 'boolean') {
      logID(1031);
      enumerable = setter;
      setter = undefined;
    }
    descriptor.get = getter;
    descriptor.set = setter;
    descriptor.enumerable = enumerable;
    descriptor.configurable = configurable;
    Object.defineProperty(object, propertyName, descriptor);
    descriptor.get = undefined;
    descriptor.set = undefined;
  };
}();
var get = function () {
  var descriptor = {
    get: undefined,
    enumerable: false,
    configurable: false
  };
  return function (object, propertyName, getter, enumerable, configurable) {
    descriptor.get = getter;
    descriptor.enumerable = enumerable;
    descriptor.configurable = configurable;
    Object.defineProperty(object, propertyName, descriptor);
    descriptor.get = undefined;
  };
}();
var set = function () {
  var descriptor = {
    set: undefined,
    enumerable: false,
    configurable: false
  };
  return function (object, propertyName, setter, enumerable, configurable) {
    descriptor.set = setter;
    descriptor.enumerable = enumerable;
    descriptor.configurable = configurable;
    Object.defineProperty(object, propertyName, descriptor);
    descriptor.set = undefined;
  };
}();
function createMap(forceDictMode) {
  var map = Object.create(null);
  if (forceDictMode) {
    var INVALID_IDENTIFIER_1 = '.';
    var INVALID_IDENTIFIER_2 = '/';
    map[INVALID_IDENTIFIER_1] = 1;
    map[INVALID_IDENTIFIER_2] = 1;
    delete map[INVALID_IDENTIFIER_1];
    delete map[INVALID_IDENTIFIER_2];
  }
  return map;
}
function getClassName(objOrCtor) {
  if (typeof objOrCtor === 'function') {
    var prototype = objOrCtor.prototype;
    if (prototype && prototype.hasOwnProperty(classNameTag) && prototype[classNameTag]) {
      return prototype[classNameTag];
    }
    var ret = '';
    if (objOrCtor.name) {
      ret = objOrCtor.name;
    } else if (objOrCtor.toString) {
      var arr;
      var str = objOrCtor.toString();
      if (str.charAt(0) === '[') {
        arr = /\[\w+\s*(\w+)\]/.exec(str);
      } else {
        arr = /^function\s*(\w+)/.exec(str);
      }
      if (arr && arr.length === 2) {
        ret = arr[1];
      }
    }
    return ret !== 'Object' ? ret : '';
  } else if (objOrCtor && objOrCtor.constructor) {
    return getClassName(objOrCtor.constructor);
  }
  return '';
}
function obsolete(object, obsoleted, newExpr, writable) {
  var extractPropName = /([^.]+)$/;
  var oldProp = extractPropName.exec(obsoleted)[0];
  var newProp = extractPropName.exec(newExpr)[0];
  function getter() {
    {
      warnID(5400, obsoleted, newExpr);
    }
    return this[newProp];
  }
  function setter(value_) {
    {
      warnID(5401, obsoleted, newExpr);
    }
    this[newProp] = value_;
  }
  if (writable) {
    getset(object, oldProp, getter, setter);
  } else {
    get(object, oldProp, getter);
  }
}
function obsoletes(obj, objName, props, writable) {
  for (var obsoleted in props) {
    var newName = props[obsoleted];
    obsolete(obj, objName + "." + obsoleted, newName, writable);
  }
}
var REGEXP_NUM_OR_STR = /(%d)|(%s)/;
var REGEXP_STR = /%s/;
function formatStr(msg) {
  for (var _len = arguments.length, subst = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    subst[_key - 1] = arguments[_key];
  }
  if (arguments.length === 0) {
    return '';
  }
  if (subst.length === 0) {
    return "" + msg;
  }
  var hasSubstitution = typeof msg === 'string' && REGEXP_NUM_OR_STR.test(msg);
  if (hasSubstitution) {
    for (var _iterator = _createForOfIteratorHelperLoose(subst), _step; !(_step = _iterator()).done;) {
      var arg = _step.value;
      var regExpToTest = typeof arg === 'number' ? REGEXP_NUM_OR_STR : REGEXP_STR;
      if (regExpToTest.test(msg)) {
        var notReplaceFunction = "" + arg;
        msg = msg.replace(regExpToTest, notReplaceFunction);
      } else {
        msg += " " + arg;
      }
    }
  } else {
    for (var _iterator2 = _createForOfIteratorHelperLoose(subst), _step2; !(_step2 = _iterator2()).done;) {
      var _arg = _step2.value;
      msg += " " + _arg;
    }
  }
  return msg;
}
function shiftArguments() {
  var len = arguments.length - 1;
  var args = new Array(len);
  for (var i = 0; i < len; ++i) {
    args[i] = arguments[i + 1];
  }
  return args;
}
function getPropertyDescriptor(object, propertyName) {
  while (object) {
    var pd = Object.getOwnPropertyDescriptor(object, propertyName);
    if (pd) {
      return pd;
    }
    object = Object.getPrototypeOf(object);
  }
  return null;
}
function _copyProp(name, source, target) {
  var pd = getPropertyDescriptor(source, name);
  if (pd) {
    Object.defineProperty(target, name, pd);
  }
}
function copyAllProperties(source, target, excepts) {
  var propertyNames = Object.getOwnPropertyNames(source);
  for (var i = 0, len = propertyNames.length; i < len; ++i) {
    var propertyName = propertyNames[i];
    if (excepts.indexOf(propertyName) !== -1) {
      continue;
    }
    _copyProp(propertyName, source, target);
  }
}
function addon(object) {
  object = object || {};
  for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); ++i) {
    var source = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
    if (source) {
      if (typeof source !== 'object') {
        errorID(5402, source);
        continue;
      }
      for (var name in source) {
        if (!(name in object)) {
          _copyProp(name, source, object);
        }
      }
    }
  }
  return object;
}
function mixin(object) {
  object = object || {};
  for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); ++i) {
    var source = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
    if (source) {
      if (typeof source !== 'object') {
        errorID(5403, source);
        continue;
      }
      for (var name in source) {
        _copyProp(name, source, object);
      }
    }
  }
  return object;
}
function extend(cls, base) {
  {
    if (!base) {
      errorID(5404);
      return;
    }
    if (!cls) {
      errorID(5405);
      return;
    }
    if (Object.keys(cls.prototype).length > 0) {
      errorID(5406);
    }
  }
  for (var p in base) {
    if (base.hasOwnProperty(p)) {
      cls[p] = base[p];
    }
  }
  cls.prototype = Object.create(base.prototype, {
    constructor: {
      value: cls,
      writable: true,
      configurable: true
    }
  });
  return cls;
}
function getSuper(constructor) {
  var proto = constructor.prototype;
  var dunderProto = proto && Object.getPrototypeOf(proto);
  return dunderProto && dunderProto.constructor;
}
function isChildClassOf(subclass, superclass) {
  if (subclass && superclass) {
    if (typeof subclass !== 'function') {
      return false;
    }
    if (typeof superclass !== 'function') {
      {
        warnID(3625, superclass);
      }
      return false;
    }
    if (subclass === superclass) {
      return true;
    }
    for (;;) {
      subclass = getSuper(subclass);
      if (!subclass) {
        return false;
      }
      if (subclass === superclass) {
        return true;
      }
    }
  }
  return false;
}
function clear(object) {
  for (var _i = 0, _Object$keys = Object.keys(object); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    delete object[key];
  }
}
function isTempClassId(id) {
  return typeof id !== 'string' || id.startsWith(tempCIDGenerator.prefix);
}
var _idToClass = createMap(true);
var _nameToClass = createMap(true);
function setup(tag, table, allowExist) {
  return function (id, constructor) {
    if (constructor.prototype.hasOwnProperty(tag)) {
      delete table[constructor.prototype[tag]];
    }
    value(constructor.prototype, tag, id);
    if (id) {
      var registered = table[id];
      if (!allowExist && registered && registered !== constructor) {
        var detail = '';
        errorID(16334, tag, id, detail);
      } else {
        table[id] = constructor;
      }
    }
  };
}
var _setClassId = setup('__cid__', _idToClass, false);
var doSetClassName = setup('__classname__', _nameToClass, true);
function setClassName(className, constructor) {
  doSetClassName(className, constructor);
  if (!constructor.prototype.hasOwnProperty(classIdTag)) {
    var id = className || tempCIDGenerator.getNewId();
    if (id) {
      _setClassId(id, constructor);
    }
  }
}
function setClassAlias(target, alias) {
  var nameRegistry = _nameToClass[alias];
  var idRegistry = _idToClass[alias];
  var ok = true;
  if (nameRegistry && nameRegistry !== target) {
    errorID(16335, alias);
    ok = false;
  }
  if (idRegistry && idRegistry !== target) {
    errorID(16336, alias);
    ok = false;
  }
  if (ok) {
    var classAliases = target[aliasesTag];
    if (!classAliases) {
      classAliases = [];
      target[aliasesTag] = classAliases;
    }
    classAliases.push(alias);
    _nameToClass[alias] = target;
    _idToClass[alias] = target;
  }
}
function unregisterClass() {
  for (var _len2 = arguments.length, constructors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    constructors[_key2] = arguments[_key2];
  }
  for (var _i2 = 0, _constructors = constructors; _i2 < _constructors.length; _i2++) {
    var constructor = _constructors[_i2];
    var p = constructor.prototype;
    var classId = p[classIdTag];
    if (classId) {
      delete _idToClass[classId];
    }
    var classname = p[classNameTag];
    if (classname) {
      delete _nameToClass[classname];
    }
    var aliases = p[aliasesTag];
    if (aliases) {
      for (var iAlias = 0; iAlias < aliases.length; ++iAlias) {
        var alias = aliases[iAlias];
        delete _nameToClass[alias];
        delete _idToClass[alias];
      }
    }
  }
}
function _getClassById(classId) {
  return getClassById(classId);
}
function getClassById(classId) {
  return _idToClass[classId];
}
function getClassByName(classname) {
  return _nameToClass[classname];
}
function _getClassId(obj, allowTempId) {
  return getClassId(obj, allowTempId);
}
function getClassId(obj, allowTempId) {
  allowTempId = typeof allowTempId !== 'undefined' ? allowTempId : true;
  var res;
  if (typeof obj === 'function' && obj.prototype.hasOwnProperty(classIdTag)) {
    res = obj.prototype[classIdTag];
    if (!allowTempId && (DEV) && isTempClassId(res)) {
      return '';
    }
    return res;
  }
  if (obj && obj.constructor) {
    var prototype = obj.constructor.prototype;
    if (prototype && prototype.hasOwnProperty(classIdTag)) {
      res = obj[classIdTag];
      if (!allowTempId && (DEV) && isTempClassId(res)) {
        return '';
      }
      return res;
    }
  }
  return '';
}

var Pool = function () {
  function Pool(_0, _1) {
    this.count = 0;
    var size = _1 === undefined ? _0 : _1;
    var cleanupFunc = _1 === undefined ? null : _0;
    this._pool = new Array(size);
    this._cleanup = cleanupFunc;
  }
  var _proto = Pool.prototype;
  _proto.get = function get() {
    return this._get();
  };
  _proto._get = function _get() {
    if (this.count > 0) {
      --this.count;
      var cache = this._pool[this.count];
      this._pool[this.count] = null;
      return cache;
    }
    return null;
  };
  _proto.put = function put(obj) {
    var pool = this._pool;
    if (this.count < pool.length) {
      if (this._cleanup && this._cleanup(obj) === false) {
        return;
      }
      pool[this.count] = obj;
      ++this.count;
    }
  };
  _proto.resize = function resize(length) {
    if (length >= 0) {
      this._pool.length = length;
      if (this.count > length) {
        this.count = length;
      }
    }
  };
  return Pool;
}();

var js = {
  IDGenerator: IDGenerator,
  Pool: Pool,
  array: array,
  isNumber: isNumber,
  isString: isString,
  isEmptyObject: isEmptyObject,
  getPropertyDescriptor: getPropertyDescriptor,
  addon: addon,
  mixin: mixin,
  extend: extend,
  getSuper: getSuper,
  isChildClassOf: isChildClassOf,
  clear: clear,
  value: value,
  getset: getset,
  get: get,
  set: set,
  unregisterClass: unregisterClass,
  getClassName: getClassName,
  setClassName: setClassName,
  setClassAlias: setClassAlias,
  getClassByName: getClassByName,
  getClassById: getClassById,
  get _registeredClassNames() {
    return _extends({}, _nameToClass);
  },
  set _registeredClassNames(value) {
    clear(_nameToClass);
    Object.assign(_nameToClass, value);
  },
  get _registeredClassIds() {
    return _extends({}, _idToClass);
  },
  set _registeredClassIds(value) {
    clear(_idToClass);
    Object.assign(_idToClass, value);
  },
  _getClassId: _getClassId,
  getClassId: getClassId,
  _setClassId: _setClassId,
  _getClassById: _getClassById,
  obsolete: obsolete,
  obsoletes: obsoletes,
  formatStr: formatStr,
  shiftArguments: shiftArguments,
  createMap: createMap
};
legacyCC.js = js;

var js$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  IDGenerator: IDGenerator,
  Pool: Pool,
  _getClassById: _getClassById,
  _getClassId: _getClassId,
  _idToClass: _idToClass,
  _nameToClass: _nameToClass,
  _setClassId: _setClassId,
  addon: addon,
  array: array,
  clear: clear,
  copyAllProperties: copyAllProperties,
  createMap: createMap,
  extend: extend,
  formatStr: formatStr,
  get: get,
  getClassById: getClassById,
  getClassByName: getClassByName,
  getClassId: getClassId,
  getClassName: getClassName,
  getPropertyDescriptor: getPropertyDescriptor,
  getSuper: getSuper,
  getset: getset,
  isChildClassOf: isChildClassOf,
  isEmptyObject: isEmptyObject,
  isNumber: isNumber,
  isString: isString,
  js: js,
  mixin: mixin,
  obsolete: obsolete,
  obsoletes: obsoletes,
  set: set,
  setClassAlias: setClassAlias,
  setClassName: setClassName,
  shiftArguments: shiftArguments,
  unregisterClass: unregisterClass,
  value: value
});

function BitMask(obj) {
  if ('__bitmask__' in obj) {
    return obj;
  }
  value(obj, '__bitmask__', null, true);
  var lastIndex = -1;
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = obj[key];
    if (val === -1) {
      val = ++lastIndex;
      obj[key] = val;
    } else if (typeof val === 'number') {
      lastIndex = val;
    } else if (typeof val === 'string' && Number.isInteger(parseFloat(key))) {
      continue;
    }
    var reverseKey = "" + val;
    if (key !== reverseKey) {
      value(obj, reverseKey, key);
    }
  }
  return obj;
}
BitMask.isBitMask = function (BitMaskType) {
  return BitMaskType && Object.prototype.hasOwnProperty.call(BitMaskType, '__bitmask__');
};
BitMask.getList = function (BitMaskDef) {
  if (BitMaskDef.__bitmask__) {
    return BitMaskDef.__bitmask__;
  }
  return BitMask.update(BitMaskDef);
};
BitMask.update = function (BitMaskDef) {
  if (!Array.isArray(BitMaskDef.__bitmask__)) {
    BitMaskDef.__bitmask__ = [];
  }
  var bitList = BitMaskDef.__bitmask__;
  bitList.length = 0;
  for (var name in BitMaskDef) {
    var v = BitMaskDef[name];
    if (Number.isInteger(v)) {
      bitList.push({
        name: name,
        value: v
      });
    }
  }
  bitList.sort(function (a, b) {
    return a.value - b.value;
  });
  return bitList;
};
legacyCC.BitMask = BitMask;

function assertIsNonNullable(expr, message) {
  assertIsTrue(!(expr === null || expr === undefined), message);
}
function assertIsTrue(expr, message) {
  if (!expr) {
    throw new Error("Assertion failed: " + (message !== null && message !== void 0 ? message : '<no-message>'));
  }
}
function assertsArrayIndex(array, index) {
  assertIsTrue(index >= 0 && index < array.length, "Array index " + index + " out of bounds: [0, " + array.length + ")");
}

var hasOwnPropertyProto = Object.prototype.hasOwnProperty;
function Enum(obj) {
  if ('__enums__' in obj) {
    return obj;
  }
  value(obj, '__enums__', null, true);
  return Enum.update(obj);
}
Enum.update = function (obj) {
  var lastIndex = -1;
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = obj[key];
    if (val === -1) {
      val = ++lastIndex;
      obj[key] = val;
    } else if (typeof val === 'number') {
      lastIndex = val;
    } else if (typeof val === 'string' && Number.isInteger(parseFloat(key))) {
      continue;
    }
    var reverseKey = "" + val;
    if (key !== reverseKey) {
      value(obj, reverseKey, key);
    }
  }
  if (Array.isArray(obj.__enums__)) {
    updateList(obj);
  }
  return obj;
};
(function (_Enum) {})(Enum || (Enum = {}));
Enum.isEnum = function (enumType) {
  return enumType && hasOwnPropertyProto.call(enumType, '__enums__');
};
function assertIsEnum(enumType) {
  assertIsTrue(hasOwnPropertyProto.call(enumType, '__enums__'));
}
Enum.getList = function (enumType) {
  assertIsEnum(enumType);
  if (enumType.__enums__) {
    return enumType.__enums__;
  }
  return updateList(enumType);
};
function updateList(enumType) {
  assertIsEnum(enumType);
  var enums = enumType.__enums__ || [];
  enums.length = 0;
  var isAllInteger = true;
  for (var name in enumType) {
    var v = enumType[name];
    var isIntegerValue = Number.isInteger(v);
    if (!isIntegerValue) {
      isAllInteger = false;
    }
    if (isIntegerValue || typeof v === 'string' && enumType[v] !== Number.parseInt(name)) {
      enums.push({
        name: name,
        value: v
      });
    }
  }
  if (isAllInteger) {
    enums.sort(function (a, b) {
      return a.value - b.value;
    });
  }
  enumType.__enums__ = enums;
  return enums;
}
Enum.sortList = function (enumType, compareFn) {
  assertIsEnum(enumType);
  if (!Array.isArray(enumType.__enums__)) {
    return;
  }
  enumType.__enums__.sort(compareFn);
};
{
  var _TestEnum = Enum({
    ZERO: -1,
    ONE: -1,
    TWO: -1,
    THREE: -1
  });
  if (_TestEnum.ZERO !== 0 || _TestEnum.ONE !== 1 || _TestEnum.THREE !== 3) {
    errorID(7101);
  }
}
function ccenum(enumType) {
  if (!('__enums__' in enumType)) {
    value(enumType, '__enums__', null, true);
  }
}
legacyCC.Enum = Enum;

var ValueType = function () {
  function ValueType() {}
  var _proto = ValueType.prototype;
  _proto.clone = function clone() {
    errorID(100, getClassName(this) + ".clone");
    return this;
  };
  _proto.equals = function equals(other) {
    return false;
  };
  _proto.set = function set(other) {
    errorID(100, getClassName(this) + ".set");
  };
  _proto.toString = function toString() {
    return "";
  };
  return ValueType;
}();
setClassName('cc.ValueType', ValueType);
legacyCC.ValueType = ValueType;

var SettingsCategory;
(function (SettingsCategory) {
  SettingsCategory["PATH"] = "path";
  SettingsCategory["ENGINE"] = "engine";
  SettingsCategory["ASSETS"] = "assets";
  SettingsCategory["SCRIPTING"] = "scripting";
  SettingsCategory["PHYSICS"] = "physics";
  SettingsCategory["RENDERING"] = "rendering";
  SettingsCategory["LAUNCH"] = "launch";
  SettingsCategory["SCREEN"] = "screen";
  SettingsCategory["SPLASH_SCREEN"] = "splashScreen";
  SettingsCategory["ANIMATION"] = "animation";
  SettingsCategory["PROFILING"] = "profiling";
  SettingsCategory["PLUGINS"] = "plugins";
  SettingsCategory["XR"] = "xr";
})(SettingsCategory || (SettingsCategory = {}));
var Settings = function () {
  function Settings() {
    this._settings = {};
    this._override = {};
  }
  var _proto = Settings.prototype;
  _proto.init = function init(path, overrides) {
    var _this = this;
    if (path === void 0) {
      path = '';
    }
    if (overrides === void 0) {
      overrides = {};
    }
    for (var categoryName in overrides) {
      var category = overrides[categoryName];
      if (category) {
        for (var name in category) {
          this.overrideSettings(categoryName, name, category[name]);
        }
      }
    }
    if (!path) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path);
        xhr.responseType = 'text';
        xhr.onload = function () {
          _this._settings = JSON.parse(xhr.response);
          resolve();
        };
        xhr.onerror = function () {
          reject(new Error('request settings failed!'));
        };
        xhr.send(null);
      }
    });
  };
  _proto.overrideSettings = function overrideSettings(category, name, value) {
    if (!(category in this._override)) {
      this._override[category] = {};
    }
    this._override[category][name] = value;
  };
  _proto.querySettings = function querySettings(category, name) {
    if (category in this._override) {
      var categorySettings = this._override[category];
      if (categorySettings && name in categorySettings) {
        return categorySettings[name];
      }
    }
    if (category in this._settings) {
      var _categorySettings = this._settings[category];
      if (_categorySettings && name in _categorySettings) {
        return _categorySettings[name];
      }
    }
    return null;
  };
  return Settings;
}();
Settings.Category = SettingsCategory;
var settings = new Settings();
legacyCC.settings = settings;

var Orientation;
(function (Orientation) {
  Orientation[Orientation["PORTRAIT"] = 1] = "PORTRAIT";
  Orientation[Orientation["PORTRAIT_UPSIDE_DOWN"] = 2] = "PORTRAIT_UPSIDE_DOWN";
  Orientation[Orientation["LANDSCAPE_LEFT"] = 4] = "LANDSCAPE_LEFT";
  Orientation[Orientation["LANDSCAPE_RIGHT"] = 8] = "LANDSCAPE_RIGHT";
  Orientation[Orientation["LANDSCAPE"] = 12] = "LANDSCAPE";
  Orientation[Orientation["AUTO"] = 13] = "AUTO";
})(Orientation || (Orientation = {}));

var SUPPORT_TEXTURE_FORMATS = ['.astc', '.pkm', '.pvr', '.webp', '.jpg', '.jpeg', '.bmp', '.png'];
var KEY = {
  none: 0,
  back: 6,
  menu: 18,
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  pause: 19,
  capslock: 20,
  escape: 27,
  space: 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  select: 41,
  insert: 45,
  Delete: 46,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  num0: 96,
  num1: 97,
  num2: 98,
  num3: 99,
  num4: 100,
  num5: 101,
  num6: 102,
  num7: 103,
  num8: 104,
  num9: 105,
  '*': 106,
  '+': 107,
  '-': 109,
  numdel: 110,
  '/': 111,
  f1: 112,
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123,
  numlock: 144,
  scrolllock: 145,
  ';': 186,
  semicolon: 186,
  equal: 187,
  '=': 187,
  ',': 188,
  comma: 188,
  dash: 189,
  '.': 190,
  period: 190,
  forwardslash: 191,
  grave: 192,
  '[': 219,
  openbracket: 219,
  backslash: 220,
  ']': 221,
  closebracket: 221,
  quote: 222,
  dpadLeft: 1000,
  dpadRight: 1001,
  dpadUp: 1003,
  dpadDown: 1004,
  dpadCenter: 1005
};
var macro = {
  SUPPORT_TEXTURE_FORMATS: SUPPORT_TEXTURE_FORMATS,
  KEY: KEY,
  RAD: Math.PI / 180,
  DEG: 180 / Math.PI,
  REPEAT_FOREVER: Number.MAX_VALUE - 1,
  FLT_EPSILON: 0.0000001192092896,
  ORIENTATION_PORTRAIT: Orientation.PORTRAIT,
  ORIENTATION_PORTRAIT_UPSIDE_DOWN: Orientation.PORTRAIT_UPSIDE_DOWN,
  ORIENTATION_LANDSCAPE: Orientation.LANDSCAPE,
  ORIENTATION_LANDSCAPE_LEFT: Orientation.LANDSCAPE_LEFT,
  ORIENTATION_LANDSCAPE_RIGHT: Orientation.LANDSCAPE_RIGHT,
  ORIENTATION_AUTO: Orientation.AUTO,
  ENABLE_TILEDMAP_CULLING: true,
  TOUCH_TIMEOUT: 5000,
  ENABLE_TRANSPARENT_CANVAS: false,
  ENABLE_WEBGL_ANTIALIAS: true,
  ENABLE_FLOAT_OUTPUT: false,
  CLEANUP_IMAGE_CACHE: false,
  ENABLE_MULTI_TOUCH: true,
  MAX_LABEL_CANVAS_POOL_SIZE: 20,
  ENABLE_WEBGL_HIGHP_STRUCT_VALUES: false,
  BATCHER2D_MEM_INCREMENT: 144,
  CUSTOM_PIPELINE_NAME: 'Builtin',
  init: function init() {
    var defaultValues = settings.querySettings(SettingsCategory.ENGINE, 'macros');
    if (defaultValues) {
      for (var key in defaultValues) {
        macro[key] = defaultValues[key];
      }
    }
    {
      this.ENABLE_WEBGL_ANTIALIAS = true;
    }
  }
};
legacyCC.macro = macro;

function setTimeoutRAF(callback, delay) {
  var _globalThis$__globalX;
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  var start = performance.now();
  var raf = requestAnimationFrame || window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
  if (raf === undefined || (_globalThis$__globalX = globalThis.__globalXR) != null && _globalThis$__globalX.isWebXR) {
    return setTimeout.apply(void 0, [callback, delay].concat(args));
  }
  var _handleRAF = function handleRAF() {
    if (performance.now() - start < delay) {
      raf(_handleRAF);
    } else {
      callback.apply(void 0, args);
    }
  };
  return raf(_handleRAF);
}

var BUILTIN_CLASSID_RE = /^(?:cc|dragonBones|sp|ccsg)\..+/;
var BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var values = new Array(123);
for (var i = 0; i < 123; ++i) {
  values[i] = 64;
}
for (var _i = 0; _i < 64; ++_i) {
  values[BASE64_KEYS.charCodeAt(_i)] = _i;
}
var BASE64_VALUES = values;
function propertyDefine(ctor, sameNameGetSets, diffNameGetSets) {
  function define(np, propName, getter, setter) {
    var pd = Object.getOwnPropertyDescriptor(np, propName);
    if (pd) {
      if (pd.get && getter) {
        np[getter] = pd.get;
      }
      if (pd.set && setter) {
        np[setter] = pd.set;
      }
    } else {
      var getterFunc = np[getter];
      if (!getterFunc) {
        var clsName = legacyCC.Class._isCCClass(ctor) && getClassName(ctor) || ctor.name || '(anonymous class)';
        warnID(5700, propName, getter, clsName);
      } else {
        getset(np, propName, getterFunc, np[setter]);
      }
    }
  }
  var propName;
  var np = ctor.prototype;
  for (var _i2 = 0, len = sameNameGetSets.length; _i2 < len; ++_i2) {
    propName = sameNameGetSets[_i2];
    var suffix = propName[0].toUpperCase() + propName.slice(1);
    define(np, propName, "get" + suffix, "set" + suffix);
  }
  for (propName in diffNameGetSets) {
    var gs = diffNameGetSets[propName];
    define(np, propName, gs[0], gs[1]);
  }
}
function pushToMap(map, key, value, pushFront) {
  var exists = map[key];
  if (exists) {
    if (Array.isArray(exists)) {
      if (pushFront) {
        exists.push(exists[0]);
        exists[0] = value;
      } else {
        exists.push(value);
      }
    } else {
      map[key] = pushFront ? [value, exists] : [exists, value];
    }
  } else {
    map[key] = value;
  }
}
function contains(refNode, otherNode) {
  if (typeof refNode.contains === 'function') {
    return refNode.contains(otherNode);
  } else if (typeof refNode.compareDocumentPosition === 'function') {
    return !!(refNode.compareDocumentPosition(otherNode) & 16);
  } else {
    var node = otherNode.parentNode;
    if (node) {
      do {
        if (node === refNode) {
          return true;
        } else {
          node = node.parentNode;
        }
      } while (node !== null);
    }
    return false;
  }
}
function isDomNode(node) {
  if (typeof window === 'object' && typeof Node === 'function') {
    return node instanceof Node;
  } else {
    return !!node && typeof node === 'object' && typeof node.nodeType === 'number' && typeof node.nodeName === 'string';
  }
}
function callInNextTick(callback) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  if (callback) {
    setTimeoutRAF(function () {
      callback.apply(void 0, args);
    }, 0);
  }
}
function tryCatchFunctor_EDITOR(funcName) {
  return Function('target', "" + ('try {\n' + '  target.') + funcName + "();\n" + "}\n" + "catch (e) {\n" + "  cc._throw(e);\n" + "}");
}
function isPlainEmptyObj_DEV(obj) {
  if (!obj || obj.constructor !== Object) {
    return false;
  }
  return isEmptyObject(obj);
}
function clampf(value, min_inclusive, max_inclusive) {
  if (min_inclusive > max_inclusive) {
    var temp = min_inclusive;
    min_inclusive = max_inclusive;
    max_inclusive = temp;
  }
  return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
}
function degreesToRadians(angle) {
  return angle * macro.RAD;
}
function radiansToDegrees(angle) {
  return angle * macro.DEG;
}
legacyCC.misc = {
  BUILTIN_CLASSID_RE: BUILTIN_CLASSID_RE,
  BASE64_VALUES: BASE64_VALUES,
  propertyDefine: propertyDefine,
  pushToMap: pushToMap,
  contains: contains,
  isDomNode: isDomNode,
  callInNextTick: callInNextTick,
  isPlainEmptyObj_DEV: isPlainEmptyObj_DEV,
  clampf: clampf,
  degreesToRadians: degreesToRadians,
  radiansToDegrees: radiansToDegrees
};

var misc = /*#__PURE__*/Object.freeze({
  __proto__: null,
  BASE64_VALUES: BASE64_VALUES,
  BUILTIN_CLASSID_RE: BUILTIN_CLASSID_RE,
  callInNextTick: callInNextTick,
  clampf: clampf,
  contains: contains,
  degreesToRadians: degreesToRadians,
  isDomNode: isDomNode,
  isPlainEmptyObj_DEV: isPlainEmptyObj_DEV,
  propertyDefine: propertyDefine,
  pushToMap: pushToMap,
  radiansToDegrees: radiansToDegrees,
  tryCatchFunctor_EDITOR: tryCatchFunctor_EDITOR
});

var DELIMETER$1 = '$_$';
function createAttrsSingle(owner, superAttrs) {
  var attrs = superAttrs ? Object.create(superAttrs) : {};
  value(owner, '__attrs__', attrs);
  return attrs;
}
function createAttrs(subclass) {
  if (typeof subclass !== 'function') {
    var instance = subclass;
    return createAttrsSingle(instance, getClassAttrs(instance.constructor));
  }
  var superClass;
  var chains = legacyCC.Class.getInheritanceChain(subclass);
  for (var i = chains.length - 1; i >= 0; i--) {
    var cls = chains[i];
    var attrs = cls.hasOwnProperty('__attrs__') && cls.__attrs__;
    if (!attrs) {
      superClass = chains[i + 1];
      createAttrsSingle(cls, superClass && superClass.__attrs__);
    }
  }
  superClass = chains[0];
  createAttrsSingle(subclass, superClass && superClass.__attrs__);
  return subclass.__attrs__;
}
function attr(constructor, propertyName) {
  var attrs = getClassAttrs(constructor);
  var prefix = propertyName + DELIMETER$1;
  var ret = {};
  for (var key in attrs) {
    if (key.startsWith(prefix)) {
      ret[key.slice(prefix.length)] = attrs[key];
    }
  }
  return ret;
}
function getClassAttrs(constructor) {
  return constructor.hasOwnProperty('__attrs__') && constructor.__attrs__ || createAttrs(constructor);
}
function setClassAttr(ctor, propName, key, value) {
  getClassAttrs(ctor)[propName + DELIMETER$1 + key] = value;
}
var PrimitiveType = function () {
  function PrimitiveType(name, defaultValue) {
    this.name = name;
    this["default"] = defaultValue;
  }
  var _proto = PrimitiveType.prototype;
  _proto.toString = function toString() {
    return this.name;
  };
  return PrimitiveType;
}();
var CCInteger = new PrimitiveType('Integer', 0);
legacyCC.Integer = CCInteger;
legacyCC.CCInteger = CCInteger;
var CCFloat = new PrimitiveType('Float', 0.0);
legacyCC.Float = CCFloat;
legacyCC.CCFloat = CCFloat;
var CCBoolean = new PrimitiveType('Boolean', false);
legacyCC.Boolean = CCBoolean;
legacyCC.CCBoolean = CCBoolean;
var CCString = new PrimitiveType('String', '');
legacyCC.String = CCString;
legacyCC.CCString = CCString;
function getTypeChecker_ET(type, attributeName) {
  return function (constructor, mainPropertyName) {
    var propInfo = "\"" + getClassName(constructor) + "." + mainPropertyName + "\"";
    var mainPropAttrs = attr(constructor, mainPropertyName);
    var mainPropAttrsType = mainPropAttrs.type;
    if (mainPropAttrsType === CCInteger || mainPropAttrsType === CCFloat) {
      mainPropAttrsType = 'Number';
    } else if (mainPropAttrsType === CCString || mainPropAttrsType === CCBoolean) {
      mainPropAttrsType = "" + mainPropAttrsType;
    }
    if (mainPropAttrsType !== type) {
      warnID(3604, propInfo);
      return;
    }
    if (!mainPropAttrs.hasOwnProperty('default')) {
      return;
    }
    var defaultVal = mainPropAttrs["default"];
    if (typeof defaultVal === 'undefined') {
      return;
    }
    var isContainer = Array.isArray(defaultVal) || isPlainEmptyObj_DEV(defaultVal);
    if (isContainer) {
      return;
    }
    var defaultType = typeof defaultVal;
    var type_lowerCase = type.toLowerCase();
    if (defaultType === type_lowerCase) {
      if (type_lowerCase === 'object') {
        if (defaultVal && !(defaultVal instanceof mainPropAttrs.ctor)) {
          warnID(3605, propInfo, getClassName(mainPropAttrs.ctor));
        } else {
          return;
        }
      } else if (type !== 'Number') {
        warnID(3606, attributeName, propInfo, type);
      }
    } else if (defaultType !== 'function') {
      if (type === CCString["default"] && defaultVal == null) {
        warnID(3607, propInfo);
      } else {
        warnID(3611, attributeName, propInfo, defaultType);
      }
    } else {
      return;
    }
    delete mainPropAttrs.type;
  };
}
function getObjTypeChecker_ET(typeCtor) {
  return function (classCtor, mainPropName) {
    getTypeChecker_ET('Object', 'type')(classCtor, mainPropName);
    var defaultDef = getClassAttrs(classCtor)[mainPropName + DELIMETER$1 + "default"];
    var defaultVal = legacyCC.Class.getDefault(defaultDef);
    if (!Array.isArray(defaultVal) && isChildClassOf(typeCtor, legacyCC.ValueType)) {
      var typename = getClassName(typeCtor);
      var info = formatStr('No need to specify the "type" of "%s.%s" because %s is a child class of ValueType.', getClassName(classCtor), mainPropName, typename);
      if (defaultDef) {
        log(info);
      } else {
        warnID(3612, info, typename, getClassName(classCtor), mainPropName, typename);
      }
    }
  };
}

var attributeUtils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  CCBoolean: CCBoolean,
  CCFloat: CCFloat,
  CCInteger: CCInteger,
  CCString: CCString,
  DELIMETER: DELIMETER$1,
  PrimitiveType: PrimitiveType,
  attr: attr,
  createAttrs: createAttrs,
  createAttrsSingle: createAttrsSingle,
  getClassAttrs: getClassAttrs,
  getObjTypeChecker_ET: getObjTypeChecker_ET,
  getTypeChecker_ET: getTypeChecker_ET,
  setClassAttr: setClassAttr
});

function parseType(val, type, className, propName) {
  if (Array.isArray(type)) {
    if (type.length > 0) {
      val.type = type = type[0];
    } else {
      return errorID(5508, className, propName);
    }
  }
  if (typeof type === 'function') {
    if (type === String) {
      val.type = legacyCC.String;
    } else if (type === Boolean) {
      val.type = legacyCC.Boolean;
    } else if (type === Number) {
      val.type = legacyCC.Float;
    }
  }
}
function getBaseClassWherePropertyDefined_DEV(propName, cls) {
  {
    var res;
    for (; cls && cls.__props__ && cls.__props__.indexOf(propName) !== -1; cls = cls.$super) {
      res = cls;
    }
    if (!res) {
      error('unknown error');
    }
    return res;
  }
}
function _wrapOptions(isGetset, _default, type) {
  var res = isGetset || typeof _default === 'undefined' ? {
    _short: true
  } : {
    _short: true,
    "default": _default
  };
  if (type) {
    res.type = type;
  }
  return res;
}
function getFullFormOfProperty(options, isGetset) {
  var isLiteral = options && options.constructor === Object;
  if (!isLiteral) {
    if (Array.isArray(options) && options.length > 0) {
      return _wrapOptions(isGetset, [], options);
    } else if (typeof options === 'function') {
      var type = options;
      return _wrapOptions(isGetset, isChildClassOf(type, legacyCC.ValueType) ? new type() : null, type);
    } else if (options instanceof PrimitiveType) {
      return _wrapOptions(isGetset, undefined, options);
    } else {
      return _wrapOptions(isGetset, options);
    }
  }
  return null;
}
function preprocessAttrs(properties, className, cls) {
  for (var propName in properties) {
    var val = properties[propName];
    var fullForm = getFullFormOfProperty(val, false);
    if (fullForm) {
      val = properties[propName] = fullForm;
    }
    if (val) {
      if (!val.override && cls.__props__.indexOf(propName) !== -1) {
        var baseClass = getClassName(getBaseClassWherePropertyDefined_DEV(propName, cls));
        warnID(5517, className, propName, baseClass, propName);
      }
      var notify = val.notify;
      if (notify) {
        {
          error('not yet support notify attributes.');
        }
      }
      if ('type' in val) {
        parseType(val, val.type, className, propName);
      }
    }
  }
}
var CALL_SUPER_DESTROY_REG_DEV = /\b\._super\b|destroy.*\.call\s*\(\s*\w+\s*[,|)]/;
function doValidateMethodWithProps_DEV(func, funcName, className, cls, base) {
  if (cls.__props__ && cls.__props__.indexOf(funcName) >= 0) {
    var baseClassName = getClassName(getBaseClassWherePropertyDefined_DEV(funcName, cls));
    errorID(3648, className, funcName, baseClassName);
    return false;
  }
  if (funcName === 'destroy' && isChildClassOf(base, legacyCC.Component) && !CALL_SUPER_DESTROY_REG_DEV.test(func)) {
    error("Overwriting '" + funcName + "' function in '" + className + "' class without calling super is not allowed. Call the super function in '" + funcName + "' please.");
  }
}

var requiringFrames = [];
function push(module, uuid, script, importMeta) {
  if (script === undefined) {
    script = uuid;
    uuid = '';
  }
  requiringFrames.push({
    uuid: uuid,
    script: script,
    module: module,
    exports: module.exports,
    beh: null,
    importMeta: importMeta
  });
}
function pop() {
  var frameInfo = requiringFrames.pop();
  var module = frameInfo.module;
  var exports$1 = module.exports;
  if (exports$1 === frameInfo.exports) {
    for (var anykey in exports$1) {
      return;
    }
    module.exports = exports$1 = frameInfo.cls;
  }
}
function peek() {
  return requiringFrames[requiringFrames.length - 1];
}
legacyCC._RF = {
  push: push,
  pop: pop,
  peek: peek
};

var PropertyStashInternalFlag;
(function (PropertyStashInternalFlag) {
  PropertyStashInternalFlag[PropertyStashInternalFlag["STANDALONE"] = 1] = "STANDALONE";
  PropertyStashInternalFlag[PropertyStashInternalFlag["IMPLICIT_VISIBLE"] = 2] = "IMPLICIT_VISIBLE";
  PropertyStashInternalFlag[PropertyStashInternalFlag["IMPLICIT_SERIALIZABLE"] = 4] = "IMPLICIT_SERIALIZABLE";
})(PropertyStashInternalFlag || (PropertyStashInternalFlag = {}));

function setPropertyEnumType(objectOrConstructor, propertyName, enumType) {
  setPropertyEnumTypeOnAttrs(getClassAttrs(objectOrConstructor), propertyName, enumType);
}
function setPropertyEnumTypeOnAttrs(attrs, propertyName, enumType) {
  attrs["" + propertyName + DELIMETER$1 + "type"] = 'Enum';
  attrs["" + propertyName + DELIMETER$1 + "enumList"] = Enum.getList(enumType);
}

var DELIMETER = DELIMETER$1;
var CCCLASS_TAG = '__ctors__';
var ENUM_TAG = 'Enum';
var BITMASK_TAG = 'BitMask';
function pushUnique(array, item) {
  if (array.indexOf(item) < 0) {
    array.push(item);
  }
}
function appendProp(cls, name) {
  {
    if (name.indexOf('.') !== -1) {
      errorID(3634);
      return;
    }
  }
  pushUnique(cls.__props__, name);
}
function defineProp(cls, className, propName, val) {
  {
    if (CCClass.getInheritanceChain(cls).some(function (x) {
      return x.prototype.hasOwnProperty(propName);
    })) {
      errorID(3637, className, propName, className);
      return;
    }
  }
  appendProp(cls, propName);
  parseAttributes(cls, val, className, propName, false);
}
function defineGetSet(cls, name, propName, val) {
  var getter = val.get;
  var setter = val.set;
  if (getter) {
    parseAttributes(cls, val, name, propName, true);
    setClassAttr(cls, propName, 'serializable', false);
    {
      appendProp(cls, propName);
    }
    {
      setClassAttr(cls, propName, 'hasGetter', true);
    }
  }
  if (setter) {
    {
      setClassAttr(cls, propName, 'hasSetter', true);
    }
  }
}
function getDefault(defaultVal) {
  if (typeof defaultVal === 'function') {
    {
      return defaultVal();
    }
  }
  return defaultVal;
}
function doDefine(className, baseClass, options) {
  var ctor = options.ctor;
  {
    if (CCClass._isCCClass(ctor)) {
      errorID(3618, className);
    }
  }
  value(ctor, CCCLASS_TAG, true, true);
  ctor.prototype;
  if (baseClass) {
    ctor.$super = baseClass;
  }
  setClassName(className, ctor);
  return ctor;
}
function define(className, baseClass, options) {
  var Component = legacyCC.Component;
  var frame = peek();
  if (frame && isChildClassOf(baseClass, Component)) {
    if (isChildClassOf(frame.cls, Component)) {
      errorID(3615);
      return null;
    }
    if (frame.uuid && className) ;
    className = className || frame.script;
  }
  var cls = doDefine(className, baseClass, options);
  if (frame) {
    if (isChildClassOf(baseClass, Component)) {
      var uuid = frame.uuid;
      if (uuid) {
        _setClassId(uuid, cls);
      }
      frame.cls = cls;
    } else if (!isChildClassOf(frame.cls, Component)) {
      frame.cls = cls;
    }
  }
  return cls;
}
function escapeForJS(s) {
  return JSON.stringify(s).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
var IDENTIFIER_RE = /^[A-Za-z_$][0-9A-Za-z_$]*$/;
function declareProperties(cls, className, properties, baseClass) {
  cls.__props__ = [];
  if (baseClass && baseClass.__props__) {
    cls.__props__ = baseClass.__props__.slice();
  }
  if (properties) {
    preprocessAttrs(properties, className, cls);
    for (var propName in properties) {
      var val = properties[propName];
      if (!val.get && !val.set) {
        defineProp(cls, className, propName, val);
      } else {
        defineGetSet(cls, className, propName, val);
      }
    }
  }
  var attrs = getClassAttrs(cls);
  cls.__values__ = cls.__props__.filter(function (prop) {
    return attrs["" + prop + DELIMETER + "serializable"] !== false;
  });
}
function CCClass(options) {
  var name = options.name;
  var base = options["extends"];
  var cls = define(name, base, options);
  if (!name) {
    name = legacyCC.js.getClassName(cls);
  }
  cls._sealed = true;
  if (base) {
    base._sealed = false;
  }
  var properties = options.properties;
  declareProperties(cls, name, properties, base);
  var editor = options.editor;
  if (editor) {
    if (isChildClassOf(base, legacyCC.Component)) {
      legacyCC.Component._registerEditorProps(cls, editor);
    } else {
      warnID(3623, name);
    }
  }
  return cls;
}
CCClass._isCCClass = function isCCClass(constructor) {
  return constructor == null ? void 0 : constructor.hasOwnProperty == null ? void 0 : constructor.hasOwnProperty(CCCLASS_TAG);
};
CCClass.fastDefine = function (className, constructor, serializableFields) {
  setClassName(className, constructor);
  var props = constructor.__props__ = constructor.__values__ = Object.keys(serializableFields);
  var attrs = getClassAttrs(constructor);
  for (var i = 0; i < props.length; i++) {
    var key = props[i];
    attrs[key + DELIMETER + "visible"] = false;
    attrs[key + DELIMETER + "default"] = serializableFields[key];
  }
};
CCClass.Attr = attributeUtils;
CCClass.attr = attr;
function isCCClassOrFastDefined(constructor) {
  return constructor == null ? void 0 : constructor.hasOwnProperty == null ? void 0 : constructor.hasOwnProperty('__values__');
}
CCClass.isCCClassOrFastDefined = isCCClassOrFastDefined;
function getInheritanceChain(constructor) {
  var chain = [];
  for (;;) {
    constructor = getSuper(constructor);
    if (!constructor) {
      break;
    }
    if (constructor !== Object) {
      chain.push(constructor);
    }
  }
  return chain;
}
CCClass.getInheritanceChain = getInheritanceChain;
var PrimitiveTypes = {
  Integer: 'Number',
  Float: 'Number',
  Boolean: 'Boolean',
  String: 'String'
};
function parseAttributes(constructor, attributes, className, propertyName, usedInGetter) {
  var ERR_Type = 'The %s of %s must be type %s' ;
  var attrs = null;
  var propertyNamePrefix = '';
  function initAttrs() {
    propertyNamePrefix = propertyName + DELIMETER;
    return attrs = getClassAttrs(constructor);
  }
  if ('type' in attributes && typeof attributes.type === 'undefined') {
    warnID(3660, propertyName, className);
  }
  var type = attributes.type;
  if (type) {
    var primitiveType = PrimitiveTypes[type];
    if (primitiveType) {
      (attrs || initAttrs())[propertyNamePrefix + "type"] = type;
    } else if (type === 'Object') {
      {
        errorID(3644, className, propertyName);
      }
    } else if (typeof type === 'object') {
      if (Enum.isEnum(type)) {
        setPropertyEnumTypeOnAttrs(attrs || initAttrs(), propertyName, type);
      } else if (BitMask.isBitMask(type)) {
        (attrs || initAttrs())[propertyNamePrefix + "type"] = BITMASK_TAG;
        attrs[propertyNamePrefix + "bitmaskList"] = BitMask.getList(type);
      } else {
        errorID(3645, className, propertyName, type);
      }
    } else if (typeof type === 'function') {
      (attrs || initAttrs())[propertyNamePrefix + "type"] = 'Object';
      attrs[propertyNamePrefix + "ctor"] = type;
    } else {
      errorID(3646, className, propertyName, type);
    }
  }
  if ('default' in attributes) {
    (attrs || initAttrs())[propertyNamePrefix + "default"] = attributes["default"];
  }
  var parseSimpleAttribute = function parseSimpleAttribute(attributeName, expectType) {
    if (attributeName in attributes) {
      var val = attributes[attributeName];
      if (typeof val === expectType) {
        (attrs || initAttrs())[propertyNamePrefix + attributeName] = val;
      } else {
        error(ERR_Type, attributeName, className, propertyName, expectType);
      }
    }
  };
  if (attributes.editorOnly) {
    if (usedInGetter) {
      errorID(3613, 'editorOnly', className, propertyName);
    } else {
      (attrs || initAttrs())[propertyNamePrefix + "editorOnly"] = true;
    }
  }
  {
    parseSimpleAttribute('displayName', 'string');
    parseSimpleAttribute('displayOrder', 'number');
    parseSimpleAttribute('multiline', 'boolean');
    parseSimpleAttribute('radian', 'boolean');
    if (attributes.readonly) {
      (attrs || initAttrs())[propertyNamePrefix + "readonly"] = attributes.readonly;
    }
    parseSimpleAttribute('tooltip', 'string');
    if (attributes.group) {
      (attrs || initAttrs())[propertyNamePrefix + "group"] = attributes.group;
    }
    parseSimpleAttribute('slide', 'boolean');
    parseSimpleAttribute('unit', 'string');
    parseSimpleAttribute('radioGroup', 'boolean');
  }
  var isStandaloneMode = attributes.__internalFlags & PropertyStashInternalFlag.STANDALONE;
  var normalizedSerializable;
  if (isStandaloneMode) {
    normalizedSerializable = attributes.serializable === true || (attributes.__internalFlags & PropertyStashInternalFlag.IMPLICIT_SERIALIZABLE) !== 0;
  } else if (attributes.serializable === false) {
    normalizedSerializable = false;
    if (usedInGetter) {
      errorID(3613, 'serializable', className, propertyName);
    }
  }
  if (typeof normalizedSerializable !== 'undefined') {
    (attrs || initAttrs())[propertyNamePrefix + "serializable"] = normalizedSerializable;
  }
  parseSimpleAttribute('formerlySerializedAs', 'string');
  {
    if ('animatable' in attributes) {
      (attrs || initAttrs())[propertyNamePrefix + "animatable"] = attributes.animatable;
    }
  }
  {
    var visible = attributes.visible;
    var normalizedVisible;
    switch (typeof visible) {
      case 'boolean':
      case 'function':
        normalizedVisible = visible;
        break;
      default:
        {
          if (isStandaloneMode) {
            normalizedVisible = (attributes.__internalFlags & PropertyStashInternalFlag.IMPLICIT_VISIBLE) !== 0;
          } else {
            var startsWithUS = propertyName.charCodeAt(0) === 95;
            if (startsWithUS) {
              normalizedVisible = false;
            }
          }
        }
    }
    if (typeof normalizedVisible !== 'undefined') {
      (attrs || initAttrs())[propertyNamePrefix + "visible"] = normalizedVisible;
    }
  }
  var range = attributes.range;
  if (range) {
    if (Array.isArray(range)) {
      if (range.length >= 2) {
        (attrs || initAttrs())[propertyNamePrefix + "min"] = range[0];
        attrs[propertyNamePrefix + "max"] = range[1];
        if (range.length > 2) {
          attrs[propertyNamePrefix + "step"] = range[2];
        }
      } else {
        errorID(3647);
      }
    } else {
      error(ERR_Type, 'range', className, propertyName, 'array');
    }
  }
  {
    var parseReturnNumberFuncAttribute = function parseReturnNumberFuncAttribute(attributeName) {
      var value = attributes[attributeName];
      if (value === undefined) {
        return;
      }
      if (typeof value === 'number' || typeof value === 'function') {
        (attrs || initAttrs())["" + propertyNamePrefix + attributeName] = value;
      } else {
        error(ERR_Type, attributeName, className, propertyName, 'number | function');
      }
    };
    parseReturnNumberFuncAttribute('min');
    parseReturnNumberFuncAttribute('max');
  }
  parseSimpleAttribute('step', 'number');
  parseSimpleAttribute('userData', 'object');
}
CCClass.isArray = function (defaultVal) {
  defaultVal = getDefault(defaultVal);
  return Array.isArray(defaultVal);
};
CCClass.getDefault = getDefault;
CCClass.escapeForJS = escapeForJS;
CCClass.IDENTIFIER_RE = IDENTIFIER_RE;
CCClass.getNewValueTypeCode = SUPPORT_JIT;
legacyCC.Class = CCClass;

var CCObjectFlags;
(function (CCObjectFlags) {
  CCObjectFlags[CCObjectFlags["Destroyed"] = 1] = "Destroyed";
  CCObjectFlags[CCObjectFlags["RealDestroyed"] = 2] = "RealDestroyed";
  CCObjectFlags[CCObjectFlags["ToDestroy"] = 4] = "ToDestroy";
  CCObjectFlags[CCObjectFlags["DontSave"] = 8] = "DontSave";
  CCObjectFlags[CCObjectFlags["EditorOnly"] = 16] = "EditorOnly";
  CCObjectFlags[CCObjectFlags["Dirty"] = 32] = "Dirty";
  CCObjectFlags[CCObjectFlags["DontDestroy"] = 64] = "DontDestroy";
  CCObjectFlags[CCObjectFlags["Destroying"] = 128] = "Destroying";
  CCObjectFlags[CCObjectFlags["Deactivating"] = 256] = "Deactivating";
  CCObjectFlags[CCObjectFlags["LockedInEditor"] = 512] = "LockedInEditor";
  CCObjectFlags[CCObjectFlags["HideInHierarchy"] = 1024] = "HideInHierarchy";
  CCObjectFlags[CCObjectFlags["IsOnEnableCalled"] = 2048] = "IsOnEnableCalled";
  CCObjectFlags[CCObjectFlags["IsEditorOnEnableCalled"] = 4096] = "IsEditorOnEnableCalled";
  CCObjectFlags[CCObjectFlags["IsPreloadStarted"] = 8192] = "IsPreloadStarted";
  CCObjectFlags[CCObjectFlags["IsOnLoadCalled"] = 16384] = "IsOnLoadCalled";
  CCObjectFlags[CCObjectFlags["IsOnLoadStarted"] = 32768] = "IsOnLoadStarted";
  CCObjectFlags[CCObjectFlags["IsStartCalled"] = 65536] = "IsStartCalled";
  CCObjectFlags[CCObjectFlags["IsRotationLocked"] = 131072] = "IsRotationLocked";
  CCObjectFlags[CCObjectFlags["IsScaleLocked"] = 262144] = "IsScaleLocked";
  CCObjectFlags[CCObjectFlags["IsAnchorLocked"] = 524288] = "IsAnchorLocked";
  CCObjectFlags[CCObjectFlags["IsSizeLocked"] = 1048576] = "IsSizeLocked";
  CCObjectFlags[CCObjectFlags["IsPositionLocked"] = 2097152] = "IsPositionLocked";
  CCObjectFlags[CCObjectFlags["IsSkipTransformUpdate"] = 16777216] = "IsSkipTransformUpdate";
  CCObjectFlags[CCObjectFlags["PersistentMask"] = -4192741] = "PersistentMask";
  CCObjectFlags[CCObjectFlags["AllHideMasks"] = 1560] = "AllHideMasks";
})(CCObjectFlags || (CCObjectFlags = {}));
var objectsToDestroy = [];
function compileDestruct(obj, ctor) {
  var shouldSkipId = obj instanceof legacyCC.Node || obj instanceof legacyCC.Component;
  var idToSkip = shouldSkipId ? '_id' : null;
  var key;
  var propsToReset = {};
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (key === idToSkip) {
        continue;
      }
      switch (typeof obj[key]) {
        case 'string':
          propsToReset[key] = '';
          break;
        case 'object':
        case 'function':
          propsToReset[key] = null;
          break;
      }
    }
  }
  if (CCClass._isCCClass(ctor)) {
    var attrs = legacyCC.Class.Attr.getClassAttrs(ctor);
    var propList = ctor.__props__;
    for (var i = 0; i < propList.length; i++) {
      key = propList[i];
      var attrKey = "" + key;
      if (attrKey in attrs) {
        if (shouldSkipId && key === '_id') {
          continue;
        }
        switch (typeof attrs[attrKey]) {
          case 'string':
            propsToReset[key] = '';
            break;
          case 'object':
          case 'function':
            propsToReset[key] = null;
            break;
          case 'undefined':
            propsToReset[key] = undefined;
            break;
        }
      }
    }
  }
  {
    return function (o) {
      for (var _key in propsToReset) {
        o[_key] = propsToReset[_key];
      }
    };
  }
}
var CCObject = function () {
  function CCObject(name) {
    if (name === void 0) {
      name = '';
    }
    this._objFlags = 0;
    this._name = name;
  }
  CCObject._deferredDestroy = function _deferredDestroy() {
    var deleteCount = objectsToDestroy.length;
    for (var i = 0; i < deleteCount; ++i) {
      var obj = objectsToDestroy[i];
      if (!(obj._objFlags & CCObjectFlags.Destroyed)) {
        obj._destroyImmediate();
      }
    }
    if (deleteCount === objectsToDestroy.length) {
      objectsToDestroy.length = 0;
    } else {
      objectsToDestroy.splice(0, deleteCount);
    }
  };
  var _proto = CCObject.prototype;
  _proto.destroy = function destroy() {
    if (this._objFlags & CCObjectFlags.Destroyed) {
      warnID(5000);
      return false;
    }
    if (this._objFlags & CCObjectFlags.ToDestroy) {
      return false;
    }
    this._objFlags |= CCObjectFlags.ToDestroy;
    objectsToDestroy.push(this);
    return true;
  };
  _proto._destruct = function _destruct() {
    var ctor = this.constructor;
    var destruct;
    if (Object.prototype.hasOwnProperty.call(ctor, '__destruct__')) {
      destruct = ctor.__destruct__;
    } else {
      destruct = compileDestruct(this, ctor);
      value(ctor, '__destruct__', destruct, true);
    }
    destruct(this);
  };
  _proto._destroyImmediate = function _destroyImmediate() {
    var _onPreDestroy, _ref;
    if (this._objFlags & CCObjectFlags.Destroyed) {
      errorID(5000);
      return;
    }
    (_onPreDestroy = (_ref = this)._onPreDestroy) == null ? void 0 : _onPreDestroy.call(_ref);
    {
      this._destruct();
    }
    this._objFlags |= CCObjectFlags.Destroyed;
  };
  return _createClass(CCObject, [{
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(value) {
      this._name = value;
    }
  }, {
    key: "hideFlags",
    get: function get() {
      return this._objFlags & CCObjectFlags.AllHideMasks;
    },
    set: function set(hideFlags) {
      var flags = hideFlags & CCObjectFlags.AllHideMasks;
      this._objFlags = this._objFlags & ~CCObjectFlags.AllHideMasks | flags;
    }
  }, {
    key: "isValid",
    get: function get() {
      return !(this._objFlags & CCObjectFlags.Destroyed);
    }
  }]);
}();
var prototype = CCObject.prototype;
prototype._deserialize = null;
{
  CCClass.fastDefine('cc.Object', CCObject, {
    _name: '',
    _objFlags: 0
  });
}
var CCObjectFlagsEnum = {};
for (var key in CCObjectFlags) {
  if (typeof key === 'string' && typeof CCObjectFlags[key] === 'number') {
    CCObjectFlagsEnum[key] = CCObjectFlags[key];
  }
}
value(CCObject, 'Flags', CCObjectFlagsEnum);
function isCCObject(object) {
  return object instanceof CCObject;
}
function isValid(value, strictMode) {
  if (typeof value === 'object') {
    return !!value && !(value._objFlags & (strictMode ? CCObjectFlags.Destroyed | CCObjectFlags.ToDestroy : CCObjectFlags.Destroyed));
  } else {
    return typeof value !== 'undefined';
  }
}
legacyCC.isValid = isValid;
legacyCC.Object = CCObject;

var fastRemoveAt = fastRemoveAt$1;
function empty() {}
var CallbackInfo = function () {
  function CallbackInfo() {
    this.callback = empty;
    this.target = undefined;
    this.once = false;
  }
  var _proto = CallbackInfo.prototype;
  _proto.set = function set(callback, target, once) {
    this.callback = callback || empty;
    this.target = target;
    this.once = !!once;
  };
  _proto.reset = function reset() {
    this.target = undefined;
    this.callback = empty;
    this.once = false;
  };
  _proto.check = function check() {
    if (isCCObject(this.target) && !isValid(this.target, true)) {
      return false;
    } else {
      return true;
    }
  };
  return CallbackInfo;
}();
var callbackInfoPool = new Pool$1(function () {
  return new CallbackInfo();
}, 32);
var CallbackList = function () {
  function CallbackList() {
    this.callbackInfos = [];
    this.isInvoking = false;
    this.containCanceled = false;
  }
  var _proto2 = CallbackList.prototype;
  _proto2.removeByCallback = function removeByCallback(cb) {
    for (var i = 0; i < this.callbackInfos.length; ++i) {
      var info = this.callbackInfos[i];
      if (info && info.callback === cb) {
        info.reset();
        callbackInfoPool.free(info);
        fastRemoveAt(this.callbackInfos, i);
        --i;
      }
    }
  };
  _proto2.removeByTarget = function removeByTarget(target) {
    for (var i = 0; i < this.callbackInfos.length; ++i) {
      var info = this.callbackInfos[i];
      if (info && info.target === target) {
        info.reset();
        callbackInfoPool.free(info);
        fastRemoveAt(this.callbackInfos, i);
        --i;
      }
    }
  };
  _proto2.cancel = function cancel(index) {
    var info = this.callbackInfos[index];
    if (info) {
      info.reset();
      if (this.isInvoking) {
        this.callbackInfos[index] = null;
      } else {
        fastRemoveAt(this.callbackInfos, index);
      }
      callbackInfoPool.free(info);
    }
    this.containCanceled = true;
  };
  _proto2.cancelAll = function cancelAll() {
    for (var i = 0; i < this.callbackInfos.length; i++) {
      var info = this.callbackInfos[i];
      if (info) {
        info.reset();
        callbackInfoPool.free(info);
        this.callbackInfos[i] = null;
      }
    }
    this.containCanceled = true;
  };
  _proto2.purgeCanceled = function purgeCanceled() {
    for (var i = this.callbackInfos.length - 1; i >= 0; --i) {
      var info = this.callbackInfos[i];
      if (!info) {
        fastRemoveAt(this.callbackInfos, i);
      }
    }
    this.containCanceled = false;
  };
  _proto2.clear = function clear() {
    this.cancelAll();
    this.callbackInfos.length = 0;
    this.isInvoking = false;
    this.containCanceled = false;
  };
  return CallbackList;
}();
var MAX_SIZE = 16;
var callbackListPool = new Pool$1(function () {
  return new CallbackList();
}, MAX_SIZE);
var CallbacksInvoker = function () {
  function CallbacksInvoker() {
    this._callbackTable = createMap(true);
    this._offCallback = void 0;
  }
  var _proto3 = CallbacksInvoker.prototype;
  _proto3.on = function on(key, callback, target, once) {
    if (!this.hasEventListener(key, callback, target)) {
      var list = this._callbackTable[key];
      if (!list) {
        list = this._callbackTable[key] = callbackListPool.alloc();
      }
      var info = callbackInfoPool.alloc();
      info.set(callback, target, once);
      list.callbackInfos.push(info);
    }
    return callback;
  };
  _proto3.hasEventListener = function hasEventListener(key, callback, target) {
    var list = this._callbackTable && this._callbackTable[key];
    if (!list) {
      return false;
    }
    var infos = list.callbackInfos;
    if (!callback) {
      if (list.isInvoking) {
        for (var i = 0; i < infos.length; ++i) {
          if (infos[i]) {
            return true;
          }
        }
        return false;
      } else {
        return infos.length > 0;
      }
    }
    for (var _i = 0; _i < infos.length; ++_i) {
      var info = infos[_i];
      if (info && info.check() && info.callback === callback && info.target === target) {
        return true;
      }
    }
    return false;
  };
  _proto3.removeAll = function removeAll(keyOrTarget) {
    var type = typeof keyOrTarget;
    if (type === 'string' || type === 'number') {
      var list = this._callbackTable && this._callbackTable[keyOrTarget];
      if (list) {
        if (list.isInvoking) {
          list.cancelAll();
        } else {
          list.clear();
          callbackListPool.free(list);
          delete this._callbackTable[keyOrTarget];
        }
      }
    } else if (keyOrTarget) {
      for (var key in this._callbackTable) {
        var _list = this._callbackTable[key];
        if (_list.isInvoking) {
          var infos = _list.callbackInfos;
          for (var i = 0; i < infos.length; ++i) {
            var info = infos[i];
            if (info && info.target === keyOrTarget) {
              _list.cancel(i);
            }
          }
        } else {
          _list.removeByTarget(keyOrTarget);
        }
      }
    }
  };
  _proto3.off = function off(key, callback, target) {
    var _this$_offCallback;
    var list = this._callbackTable && this._callbackTable[key];
    if (list) {
      var infos = list.callbackInfos;
      if (callback) {
        for (var i = 0; i < infos.length; ++i) {
          var info = infos[i];
          if (info && info.callback === callback && info.target === target) {
            list.cancel(i);
            break;
          }
        }
      } else {
        this.removeAll(key);
      }
    }
    (_this$_offCallback = this._offCallback) == null ? void 0 : _this$_offCallback.call(this);
  };
  _proto3.emit = function emit(key, arg0, arg1, arg2, arg3, arg4) {
    var list = this._callbackTable && this._callbackTable[key];
    if (list) {
      var rootInvoker = !list.isInvoking;
      list.isInvoking = true;
      var infos = list.callbackInfos;
      for (var i = 0, len = infos.length; i < len; ++i) {
        var info = infos[i];
        if (info) {
          var callback = info.callback;
          var target = info.target;
          if (info.once) {
            this.off(key, callback, target);
          }
          if (!info.check()) {
            this.off(key, callback, target);
          } else if (target) {
            callback.call(target, arg0, arg1, arg2, arg3, arg4);
          } else {
            callback(arg0, arg1, arg2, arg3, arg4);
          }
        }
      }
      if (rootInvoker) {
        list.isInvoking = false;
        if (list.containCanceled) {
          list.purgeCanceled();
        }
      }
    }
  };
  _proto3.clear = function clear() {
    for (var key in this._callbackTable) {
      var list = this._callbackTable[key];
      if (list) {
        list.clear();
        callbackListPool.free(list);
        delete this._callbackTable[key];
      }
    }
  };
  _proto3._registerOffCallback = function _registerOffCallback(cb) {
    this._offCallback = cb;
  };
  return CallbacksInvoker;
}();

function Eventify(base) {
  var Eventified = function (_ref) {
    function Eventified() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ref.call.apply(_ref, [this].concat(args)) || this;
      _this._callbackTable = createMap(true);
      return _this;
    }
    _inheritsLoose(Eventified, _ref);
    var _proto = Eventified.prototype;
    _proto.once = function once(type, callback, target) {
      return this.on(type, callback, target, true);
    };
    _proto.targetOff = function targetOff(typeOrTarget) {
      this.removeAll(typeOrTarget);
    };
    return Eventified;
  }(base);
  var callbacksInvokerPrototype = CallbacksInvoker.prototype;
  var propertyKeys = Object.getOwnPropertyNames(callbacksInvokerPrototype).concat(Object.getOwnPropertySymbols(callbacksInvokerPrototype));
  for (var iPropertyKey = 0; iPropertyKey < propertyKeys.length; ++iPropertyKey) {
    var propertyKey = propertyKeys[iPropertyKey];
    if (!(propertyKey in Eventified.prototype)) {
      var propertyDescriptor = Object.getOwnPropertyDescriptor(callbacksInvokerPrototype, propertyKey);
      if (propertyDescriptor) {
        Object.defineProperty(Eventified.prototype, propertyKey, propertyDescriptor);
      }
    }
  }
  return Eventified;
}

var Empty = function Empty() {};
var EventTarget = Eventify(Empty);
legacyCC.EventTarget = EventTarget;

var AsyncDelegate = function () {
  function AsyncDelegate() {
    this._delegates = [];
  }
  var _proto = AsyncDelegate.prototype;
  _proto.add = function add(callback) {
    if (!this._delegates.includes(callback)) {
      this._delegates.push(callback);
    }
  };
  _proto.hasListener = function hasListener(callback) {
    return this._delegates.includes(callback);
  };
  _proto.remove = function remove(callback) {
    fastRemove(this._delegates, callback);
  };
  _proto.dispatch = function dispatch() {
    var _arguments = arguments;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return Promise.all(this._delegates.map(function (func) {
      return func.apply(void 0, _arguments);
    }).filter(Boolean));
  };
  return AsyncDelegate;
}();

var BrowserType;
(function (BrowserType) {
  BrowserType["UNKNOWN"] = "unknown";
  BrowserType["WECHAT"] = "wechat";
  BrowserType["ANDROID"] = "androidbrowser";
  BrowserType["IE"] = "ie";
  BrowserType["EDGE"] = "edge";
  BrowserType["QQ"] = "qqbrowser";
  BrowserType["MOBILE_QQ"] = "mqqbrowser";
  BrowserType["UC"] = "ucbrowser";
  BrowserType["UCBS"] = "ucbs";
  BrowserType["BROWSER_360"] = "360browser";
  BrowserType["BAIDU_APP"] = "baiduboxapp";
  BrowserType["BAIDU"] = "baidubrowser";
  BrowserType["MAXTHON"] = "maxthon";
  BrowserType["OPERA"] = "opera";
  BrowserType["OUPENG"] = "oupeng";
  BrowserType["MIUI"] = "miuibrowser";
  BrowserType["FIREFOX"] = "firefox";
  BrowserType["SAFARI"] = "safari";
  BrowserType["CHROME"] = "chrome";
  BrowserType["LIEBAO"] = "liebao";
  BrowserType["QZONE"] = "qzone";
  BrowserType["SOUGOU"] = "sogou";
  BrowserType["HUAWEI"] = "huawei";
})(BrowserType || (BrowserType = {}));

var Language;
(function (Language) {
  Language["UNKNOWN"] = "unknown";
  Language["ENGLISH"] = "en";
  Language["CHINESE"] = "zh";
  Language["FRENCH"] = "fr";
  Language["ITALIAN"] = "it";
  Language["GERMAN"] = "de";
  Language["SPANISH"] = "es";
  Language["DUTCH"] = "du";
  Language["RUSSIAN"] = "ru";
  Language["KOREAN"] = "ko";
  Language["JAPANESE"] = "ja";
  Language["HUNGARIAN"] = "hu";
  Language["PORTUGUESE"] = "pt";
  Language["ARABIC"] = "ar";
  Language["NORWEGIAN"] = "no";
  Language["POLISH"] = "pl";
  Language["TURKISH"] = "tr";
  Language["UKRAINIAN"] = "uk";
  Language["ROMANIAN"] = "ro";
  Language["BULGARIAN"] = "bg";
  Language["HINDI"] = "hi";
})(Language || (Language = {}));

var NetworkType;
(function (NetworkType) {
  NetworkType[NetworkType["NONE"] = 0] = "NONE";
  NetworkType[NetworkType["LAN"] = 1] = "LAN";
  NetworkType[NetworkType["WWAN"] = 2] = "WWAN";
})(NetworkType || (NetworkType = {}));

var OS;
(function (OS) {
  OS["UNKNOWN"] = "Unknown";
  OS["IOS"] = "iOS";
  OS["ANDROID"] = "Android";
  OS["WINDOWS"] = "Windows";
  OS["LINUX"] = "Linux";
  OS["OSX"] = "OS X";
  OS["OHOS"] = "OHOS";
  OS["OPENHARMONY"] = "OpenHarmony";
})(OS || (OS = {}));

var Platform;
(function (Platform) {
  Platform["UNKNOWN"] = "UNKNOWN";
  Platform["EDITOR_PAGE"] = "EDITOR_PAGE";
  Platform["EDITOR_CORE"] = "EDITOR_CORE";
  Platform["NODEJS_PAGE"] = "NODEJS_PAGE";
  Platform["MOBILE_BROWSER"] = "MOBILE_BROWSER";
  Platform["DESKTOP_BROWSER"] = "DESKTOP_BROWSER";
  Platform["WIN32"] = "WIN32";
  Platform["ANDROID"] = "ANDROID";
  Platform["IOS"] = "IOS";
  Platform["MACOS"] = "MACOS";
  Platform["OHOS"] = "OHOS";
  Platform["OPENHARMONY"] = "OPENHARMONY";
  Platform["WECHAT_GAME"] = "WECHAT_GAME";
  Platform["WECHAT_MINI_PROGRAM"] = "WECHAT_MINI_PROGRAM";
  Platform["XIAOMI_QUICK_GAME"] = "XIAOMI_QUICK_GAME";
  Platform["ALIPAY_MINI_GAME"] = "ALIPAY_MINI_GAME";
  Platform["TAOBAO_CREATIVE_APP"] = "TAOBAO_CREATIVE_APP";
  Platform["TAOBAO_MINI_GAME"] = "TAOBAO_MINI_GAME";
  Platform["BYTEDANCE_MINI_GAME"] = "BYTEDANCE_MINI_GAME";
  Platform["OPPO_MINI_GAME"] = "OPPO_MINI_GAME";
  Platform["VIVO_MINI_GAME"] = "VIVO_MINI_GAME";
  Platform["HUAWEI_QUICK_GAME"] = "HUAWEI_QUICK_GAME";
  Platform["MIGU_MINI_GAME"] = "MIGU_MINI_GAME";
  Platform["HONOR_MINI_GAME"] = "HONOR_MINI_GAME";
  Platform["SUD_MINI_GAME"] = "SUD_MINI_GAME";
})(Platform || (Platform = {}));

var Feature;
(function (Feature) {
  Feature["WEBP"] = "WEBP";
  Feature["IMAGE_BITMAP"] = "IMAGE_BITMAP";
  Feature["WEB_VIEW"] = "WEB_VIEW";
  Feature["VIDEO_PLAYER"] = "VIDEO_PLAYER";
  Feature["SAFE_AREA"] = "SAFE_AREA";
  Feature["HPE"] = "HPE";
  Feature["INPUT_TOUCH"] = "INPUT_TOUCH";
  Feature["EVENT_KEYBOARD"] = "EVENT_KEYBOARD";
  Feature["EVENT_MOUSE"] = "EVENT_MOUSE";
  Feature["EVENT_TOUCH"] = "EVENT_TOUCH";
  Feature["EVENT_ACCELEROMETER"] = "EVENT_ACCELEROMETER";
  Feature["EVENT_GAMEPAD"] = "EVENT_GAMEPAD";
  Feature["EVENT_HANDLE"] = "EVENT_HANDLE";
  Feature["EVENT_HMD"] = "EVENT_HMD";
  Feature["EVENT_HANDHELD"] = "EVENT_HANDHELD";
  Feature["WASM"] = "WASM";
})(Feature || (Feature = {}));

var SystemInfo = function (_EventTarget) {
  function SystemInfo() {
    var _this$_featureMap;
    var _this;
    _this = _EventTarget.call(this) || this;
    _this._battery = null;
    _this._initPromise = [];
    var nav = window.navigator;
    var ua = nav.userAgent.toLowerCase();
    nav.getBattery == null ? void 0 : nav.getBattery().then(function (battery) {
      _this._battery = battery;
    });
    _this.networkType = NetworkType.LAN;
    _this.isNative = false;
    _this.isBrowser = true;
    {
      _this.isMobile = /mobile|android|iphone|ipad/.test(ua);
      _this.platform = _this.isMobile ? Platform.MOBILE_BROWSER : Platform.DESKTOP_BROWSER;
    }
    _this.isLittleEndian = function () {
      var buffer = new ArrayBuffer(2);
      new DataView(buffer).setInt16(0, 256, true);
      return new Int16Array(buffer)[0] === 256;
    }();
    var currLanguage = nav.language;
    _this.nativeLanguage = currLanguage.toLowerCase();
    currLanguage = currLanguage || nav.browserLanguage;
    currLanguage = currLanguage ? currLanguage.split('-')[0] : Language.ENGLISH;
    _this.language = currLanguage;
    var isAndroid = false;
    var iOS = false;
    var osVersion = '';
    var osMajorVersion = 0;
    var uaResult = /android\s*(\d+(?:\.\d+)*)/i.exec(ua) || /android\s*(\d+(?:\.\d+)*)/i.exec(nav.platform);
    if (uaResult) {
      isAndroid = true;
      osVersion = uaResult[1] || '';
      osMajorVersion = parseInt(osVersion) || 0;
    }
    uaResult = /(iPad|iPhone|iPod).*OS ((\d+_?){2,3})/i.exec(ua);
    if (uaResult) {
      iOS = true;
      osVersion = uaResult[2] || '';
      osMajorVersion = parseInt(osVersion) || 0;
    } else if (/(iPhone|iPad|iPod)/.exec(nav.platform) || nav.platform === 'MacIntel' && nav.maxTouchPoints && nav.maxTouchPoints > 1) {
      iOS = true;
      osVersion = '';
      osMajorVersion = 0;
    }
    var osName = OS.UNKNOWN;
    if (nav.appVersion.indexOf('Win') !== -1) {
      osName = OS.WINDOWS;
    } else if (iOS) {
      osName = OS.IOS;
    } else if (nav.appVersion.indexOf('Mac') !== -1) {
      osName = OS.OSX;
    } else if (nav.appVersion.indexOf('X11') !== -1 && nav.appVersion.indexOf('Linux') === -1) {
      osName = OS.LINUX;
    } else if (isAndroid) {
      osName = OS.ANDROID;
    } else if (nav.appVersion.indexOf('Linux') !== -1 || ua.indexOf('ubuntu') !== -1) {
      osName = OS.LINUX;
    }
    _this.os = osName;
    _this.osVersion = osVersion;
    _this.osMainVersion = osMajorVersion;
    _this.browserType = BrowserType.UNKNOWN;
    var typeReg0 = /wechat|weixin|micromessenger/i;
    var typeReg1 = /mqqbrowser|micromessenger|qqbrowser|sogou|qzone|liebao|maxthon|ucbs|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|mxbrowser|miuibrowser/i;
    var typeReg2 = /qq|qqbrowser|ucbrowser|ubrowser|edge|HuaweiBrowser/i;
    var typeReg3 = /chrome|safari|firefox|trident|opera|opr\/|oupeng/i;
    var browserTypes = typeReg0.exec(ua) || typeReg1.exec(ua) || typeReg2.exec(ua) || typeReg3.exec(ua);
    var browserType = browserTypes ? browserTypes[0].toLowerCase() : OS.UNKNOWN;
    if (browserType === 'safari' && isAndroid) {
      browserType = BrowserType.ANDROID;
    } else if (browserType === 'qq' && /android.*applewebkit/i.test(ua)) {
      browserType = BrowserType.ANDROID;
    }
    var typeMap = {
      micromessenger: BrowserType.WECHAT,
      wechat: BrowserType.WECHAT,
      weixin: BrowserType.WECHAT,
      trident: BrowserType.IE,
      edge: BrowserType.EDGE,
      '360 aphone': BrowserType.BROWSER_360,
      mxbrowser: BrowserType.MAXTHON,
      'opr/': BrowserType.OPERA,
      ubrowser: BrowserType.UC,
      huaweibrowser: BrowserType.HUAWEI
    };
    _this.browserType = typeMap[browserType] || browserType;
    _this.browserVersion = '';
    var versionReg1 = /(mqqbrowser|micromessenger|qqbrowser|sogou|qzone|liebao|maxthon|uc|ucbs|360 aphone|360|baiduboxapp|baidu|maxthon|mxbrowser|miui(?:.hybrid)?)(mobile)?(browser)?\/?([\d.]+)/i;
    var versionReg2 = /(qq|chrome|safari|firefox|trident|opera|opr\/|oupeng)(mobile)?(browser)?\/?([\d.]+)/i;
    var tmp = versionReg1.exec(ua);
    if (!tmp) {
      tmp = versionReg2.exec(ua);
    }
    _this.browserVersion = tmp ? tmp[4] : '';
    _this.isXR = false;
    var _tmpCanvas1 = document.createElement('canvas');
    !!_tmpCanvas1.getContext('2d');
    var supportWebp;
    try {
      supportWebp = TEST ? false : _tmpCanvas1.toDataURL('image/webp').startsWith('data:image/webp');
    } catch (e) {
      supportWebp = false;
    }
    if (_this.os === OS.IOS) {
      var _exec;
      var result = (_exec = / applewebkit\/(\d+)/.exec(ua)) == null ? void 0 : _exec[1];
      if (typeof result === 'string') {
        if (Number.parseInt(result) >= 604) {
          supportWebp = true;
        }
      }
    } else if (_this.browserType === BrowserType.SAFARI) {
      var _exec2;
      var _result = (_exec2 = / version\/(\d+)/.exec(ua)) == null ? void 0 : _exec2[1];
      if (typeof _result === 'string') {
        if (Number.parseInt(_result) >= 14) {
          supportWebp = true;
        }
      }
    }
    var supportTouch = document.documentElement.ontouchstart !== undefined || document.ontouchstart !== undefined || EDITOR;
    var supportMouse = document.documentElement.onmouseup !== undefined || EDITOR;
    var supportXR = typeof navigator.xr !== 'undefined';
    var supportWasm = function () {
      var isSafari_15_4 = (_this.os === OS.IOS || _this.os === OS.OSX) && /(OS 15_4)|(Version\/15.4)/.test(window.navigator.userAgent);
      if (isSafari_15_4) {
        return false;
      }
      try {
        if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
          var module = new WebAssembly.Module(new Uint8Array([0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]));
          if (module instanceof WebAssembly.Module) {
            return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
          }
        }
      } catch (e) {
        return false;
      }
      return false;
    }();
    _this._featureMap = (_this$_featureMap = {}, _this$_featureMap[Feature.WEBP] = supportWebp, _this$_featureMap[Feature.IMAGE_BITMAP] = false, _this$_featureMap[Feature.WEB_VIEW] = true, _this$_featureMap[Feature.VIDEO_PLAYER] = true, _this$_featureMap[Feature.SAFE_AREA] = false, _this$_featureMap[Feature.HPE] = false, _this$_featureMap[Feature.INPUT_TOUCH] = supportTouch, _this$_featureMap[Feature.EVENT_KEYBOARD] = document.documentElement.onkeyup !== undefined || EDITOR, _this$_featureMap[Feature.EVENT_MOUSE] = supportMouse, _this$_featureMap[Feature.EVENT_TOUCH] = supportTouch || supportMouse, _this$_featureMap[Feature.EVENT_ACCELEROMETER] = window.DeviceMotionEvent !== undefined || window.DeviceOrientationEvent !== undefined, _this$_featureMap[Feature.EVENT_GAMEPAD] = navigator.getGamepads !== undefined || navigator.webkitGetGamepads !== undefined || supportXR, _this$_featureMap[Feature.EVENT_HANDLE] = PREVIEW, _this$_featureMap[Feature.EVENT_HMD] = supportXR, _this$_featureMap[Feature.EVENT_HANDHELD] = supportXR, _this$_featureMap[Feature.WASM] = supportWasm, _this$_featureMap);
    _this._initPromise.push(_this._supportsImageBitmapPromise());
    _this._registerEvent();
    return _this;
  }
  _inheritsLoose(SystemInfo, _EventTarget);
  var _proto = SystemInfo.prototype;
  _proto._supportsImageBitmapPromise = function _supportsImageBitmapPromise() {
    var _this2 = this;
    if (typeof createImageBitmap !== 'undefined' && typeof Blob !== 'undefined') {
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 2;
      var promise = createImageBitmap(canvas);
      if (promise instanceof Promise) {
        return promise.then(function (imageBitmap) {
          if (imageBitmap && imageBitmap.close) {
            _this2._setFeature(Feature.IMAGE_BITMAP, true);
            imageBitmap.close();
          }
        });
      } else {
        warn('The return value of createImageBitmap is not Promise.');
      }
    }
    return Promise.resolve();
  };
  _proto._registerEvent = function _registerEvent() {
    var _this3 = this;
    var hiddenPropName;
    if (typeof document.hidden !== 'undefined') {
      hiddenPropName = 'hidden';
    } else if (typeof document.mozHidden !== 'undefined') {
      hiddenPropName = 'mozHidden';
    } else if (typeof document.msHidden !== 'undefined') {
      hiddenPropName = 'msHidden';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hiddenPropName = 'webkitHidden';
    } else {
      hiddenPropName = 'hidden';
    }
    var hidden = false;
    var onHidden = function onHidden() {
      if (!hidden) {
        hidden = true;
        _this3.emit('hide');
      }
    };
    var onShown = function onShown(arg0, arg1, arg2, arg3, arg4) {
      if (hidden) {
        hidden = false;
        _this3.emit('show', arg0, arg1, arg2, arg3, arg4);
      }
    };
    if (hiddenPropName) {
      var changeList = ['visibilitychange', 'mozvisibilitychange', 'msvisibilitychange', 'webkitvisibilitychange', 'qbrowserVisibilityChange'];
      for (var i = 0; i < changeList.length; i++) {
        document.addEventListener(changeList[i], function (event) {
          var visible = document[hiddenPropName];
          visible = visible || event.hidden;
          if (visible) {
            onHidden();
          } else {
            onShown();
          }
        });
      }
    } else {
      window.addEventListener('blur', onHidden);
      window.addEventListener('focus', onShown);
    }
    if (window.navigator.userAgent.indexOf('MicroMessenger') > -1) {
      window.onfocus = onShown;
    }
    if ('onpageshow' in window && 'onpagehide' in window) {
      window.addEventListener('pagehide', onHidden);
      window.addEventListener('pageshow', onShown);
      document.addEventListener('pagehide', onHidden);
      document.addEventListener('pageshow', onShown);
    }
  };
  _proto._setFeature = function _setFeature(feature, value) {
    return this._featureMap[feature] = value;
  };
  _proto.init = function init() {
    return Promise.all(this._initPromise);
  };
  _proto.hasFeature = function hasFeature(feature) {
    return this._featureMap[feature];
  };
  _proto.getBatteryLevel = function getBatteryLevel() {
    if (this._battery) {
      return this._battery.level;
    } else {
      {
        warn('getBatteryLevel is not supported');
      }
      return 1;
    }
  };
  _proto.triggerGC = function triggerGC() {
    {
      warn('triggerGC is not supported.');
    }
  };
  _proto.openURL = function openURL(url) {
    window.open(url);
  };
  _proto.now = function now() {
    if (Date.now) {
      return Date.now();
    }
    return +new Date();
  };
  _proto.restartJSVM = function restartJSVM() {
    {
      warn('restartJSVM is not supported.');
    }
  };
  _proto.exit = function exit() {
    window.close();
  };
  _proto.close = function close() {
    this.emit('close');
  };
  return SystemInfo;
}(EventTarget);
var systemInfo = new SystemInfo();

var GarbageCollectionManager = function () {
  function GarbageCollectionManager() {
    this._finalizationRegistry = null;
    this._gcObjects = new WeakMap();
  }
  var _proto = GarbageCollectionManager.prototype;
  _proto.registerGCObject = function registerGCObject(gcObject) {
    {
      return gcObject;
    }
  };
  _proto.init = function init() {};
  _proto.finalizationRegistryCallback = function finalizationRegistryCallback(token) {
    return;
  };
  _proto.destroy = function destroy() {};
  return GarbageCollectionManager;
}();
var garbageCollectionManager = new GarbageCollectionManager();

var GCObject = function () {
  function GCObject() {
    return garbageCollectionManager.registerGCObject(this);
  }
  var _proto = GCObject.prototype;
  _proto.destroy = function destroy() {};
  return GCObject;
}();

export { systemInfo as $, log2 as A, BrowserType as B, CCBoolean as C, debug as D, Enum as E, fastRemove as F, macro as G, fillItems as H, assert as I, CachedArray as J, isValid as K, log as L, fastRemoveAt$1 as M, assertID as N, CCObject as O, Pool$1 as P, error as Q, RecyclePool as R, SettingsCategory as S, scalableContainerManager as T, assertIsNonNullable as U, ValueType as V, logID as W, contains as X, Orientation as Y, Eventify as Z, _inheritsLoose as _, _createClass as a, DebugMode as a0, _resetDebugSetting as a1, garbageCollectionManager as a2, AsyncDelegate as a3, OS as a4, Pool as a5, _assertThisInitialized as a6, _throw as a7, debug$1 as a8, bits as a9, removeIf as aA, contains$1 as aB, degreesToRadians as aC, sign as aD, getClassById as aE, _wrapNativeSuper as aF, getSuper as aG, isChildClassOf as aH, BUILTIN_CLASSID_RE as aI, Platform as aJ, callInNextTick as aK, addon as aL, get as aM, getClassByName as aN, Language as aO, NetworkType as aP, doValidateMethodWithProps_DEV as aQ, PropertyStashInternalFlag as aR, getFullFormOfProperty as aS, popCount as aT, _initializerDefineProperty as aU, _objectWithoutPropertiesLoose as aV, js$1 as aa, misc as ab, CCClass as ac, debugID as ad, isDisplayStats as ae, setDisplayStats as af, GCObject as ag, setPropertyEnumType as ah, setPropertyEnumTypeOnAttrs as ai, ENUM_TAG as aj, BITMASK_TAG as ak, CallbacksInvoker as al, BASE64_VALUES as am, getClassName as an, IDGenerator as ao, mixin as ap, _asyncToGenerator as aq, _regenerator as ar, getset as as, nextPow2 as at, remove as au, Feature as av, MutableForwardIterator as aw, removeAt as ax, obsolete as ay, INT_MAX as az, _applyDecoratedDescriptor as b, assertsArrayIndex as c, CCObjectFlags as d, warn as e, isDomNode as f, getError as g, isCCClassOrFastDefined as h, isCCObject as i, CCString as j, errorID as k, _createForOfIteratorHelperLoose as l, setClassAlias as m, EventTarget as n, assertIsTrue as o, CCInteger as p, CCFloat as q, Settings as r, settings as s, createMap as t, getClassId as u, value as v, warnID as w, ccenum as x, BitMask as y, _extends as z };
//# sourceMappingURL=gc-object-CShF5lzx.js.map
