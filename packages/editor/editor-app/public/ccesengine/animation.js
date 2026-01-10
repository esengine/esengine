import { _ as _inheritsLoose, a as _createClass, k as errorID, e as warn, aN as getClassByName, w as warnID, b as _applyDecoratedDescriptor, l as _createForOfIteratorHelperLoose, aU as _initializerDefineProperty, o as assertIsTrue, aF as _wrapNativeSuper, au as remove, aH as isChildClassOf, Q as error, aV as _objectWithoutPropertiesLoose, aG as getSuper, x as ccenum, aR as PropertyStashInternalFlag, ax as removeAt, U as assertIsNonNullable, aA as removeIf, P as Pool, z as _extends, J as CachedArray, aw as MutableForwardIterator } from './gc-object-CShF5lzx.js';
import { c as ccclass$g, aD as EditorExtendable, b as applyDecoratedInitializer, s as serializable$d, aE as RealCurve, b9 as _float, f as Vec3, Q as Quat, e as editorExtrasTag, M as Mat4, E as EPSILON, ab as lerp, ba as getOrCreatePropertyStash, a as clamp, b4 as WrapModeMask, t as type$2, V as Vec2, A as approx, b6 as editorOnly, a$ as binarySearchEpsilon, U as clamp01, C as Color, k as formerlySerializedAs$1, S as System, a2 as SystemPriority } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { l as legacyCC, c as cclegacy } from './global-exports-DnCP_14L.js';
import { C as CLASS_NAME_PREFIX_ANIM, A as AnimationState, c as createEvalSymbol, b as Channel, T as Track, i as invokeComponentMethodsEngagedInAnimationEvent, d as additiveSettingsTag, e as exoticAnimationTag, U as UntypedTrack, t as trackBindingTag, n as normalizedFollowTag, f as isTrsPropertyName, W as WrappedInfo, h as AnimationClip, j as ColorTrack, k as ComponentPath, l as CubicSplineNumberValue, m as CubicSplineQuatValue, o as CubicSplineVec2Value, p as CubicSplineVec3Value, q as CubicSplineVec4Value, H as HierarchyPath, O as ObjectTrack, Q as QuatTrack, R as RealTrack, S as SizeTrack, r as TrackPath, V as VectorTrack, s as isCustomPath, u as isPropertyPath } from './animation-component-DyCWmzfU.js';
export { w as AnimCurve, a as Animation, a as AnimationComponent, E as EventInfo, v as RatioSampler, y as computeRatioByType, x as sampleAnimationCurve } from './animation-component-DyCWmzfU.js';
import { b as Material, U as getStringFromType, O as getDefaultFromType, d as builtinResMgr, K as getBindingFromHandle, f as TextureBase, V as getTypeFromHandle, N as Node } from './scene-vWcxM1_c.js';
import './deprecated-n0w4kK7g.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { W as Type, y as PrimitiveMode } from './buffer-barrier-BlQXg9Aa.js';
import { i as instantiate } from './instantiate-DAIJ1YBG.js';
import { A as Asset, C as Component } from './node-event-Ccvtv8bJ.js';
import { s as shift } from './move-DnXMCCeG.js';
import './3d.js';
import './prefab-DYg_oxpo.js';
import { _ as _createMesh } from './create-mesh-CfKC5EQd.js';
import './debug-view-BuNhRPv_.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { M as MeshRenderer } from './mesh-renderer-CdPG3X-W.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import { c as getWorldMatrix, d as deleteTransform, e as getTransform } from './deprecated-BJz7DUMw.js';
export { f as getPathFromRoot, g as getWorldTransformUntilRoot } from './deprecated-BJz7DUMw.js';
import './touch-BKrZ-fxl.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './deprecated-Dswa7XeN.js';
import './zlib.min-3VC1ush6.js';
import './util-Cxn5lV0H.js';
import './capsule-9D-8tsOp.js';
import './skeleton-CBhmWmEt.js';
import './deprecated-CN-RjLP6.js';
import './camera-component-BFt9vSC_.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';

var _dec$V, _class$W, _class2$N, _initializer$G, _initializer2$s, _initializer3$f, _initializer4$a;
(_dec$V = ccclass$g(CLASS_NAME_PREFIX_ANIM + "EmbeddedPlayer"), _dec$V(_class$W = (_class2$N = function (_EditorExtendable) {
  function EmbeddedPlayer() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _EditorExtendable.call.apply(_EditorExtendable, [this].concat(args)) || this;
    _this.begin = _initializer$G && _initializer$G();
    _this.end = _initializer2$s && _initializer2$s();
    _this.reconciledSpeed = _initializer3$f && _initializer3$f();
    _this.playable = _initializer4$a && _initializer4$a();
    return _this;
  }
  _inheritsLoose(EmbeddedPlayer, _EditorExtendable);
  return EmbeddedPlayer;
}(EditorExtendable), _initializer$G = applyDecoratedInitializer(_class2$N.prototype, "begin", [serializable$d], function () {
  return 0.0;
}), _initializer2$s = applyDecoratedInitializer(_class2$N.prototype, "end", [serializable$d], function () {
  return 0.0;
}), _initializer3$f = applyDecoratedInitializer(_class2$N.prototype, "reconciledSpeed", [serializable$d], function () {
  return false;
}), _initializer4$a = applyDecoratedInitializer(_class2$N.prototype, "playable", [serializable$d], function () {
  return null;
}), _class2$N)) || _class$W);
var EmbeddedPlayable = function EmbeddedPlayable() {};
var EmbeddedPlayableState = function () {
  function EmbeddedPlayableState(randomAccess) {
    this._randomAccess = randomAccess;
  }
  var _proto = EmbeddedPlayableState.prototype;
  _proto.setTime = function setTime(_time) {};
  return _createClass(EmbeddedPlayableState, [{
    key: "randomAccess",
    get: function get() {
      return this._randomAccess;
    }
  }]);
}();

var _dec$U, _class$V, _class2$M, _initializer$F, _initializer2$r;
(_dec$U = ccclass$g(CLASS_NAME_PREFIX_ANIM + "EmbeddedAnimationClipPlayable"), _dec$U(_class$V = (_class2$M = function (_EmbeddedPlayable) {
  function EmbeddedAnimationClipPlayable() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _EmbeddedPlayable.call.apply(_EmbeddedPlayable, [this].concat(args)) || this;
    _this.path = _initializer$F && _initializer$F();
    _this.clip = _initializer2$r && _initializer2$r();
    return _this;
  }
  _inheritsLoose(EmbeddedAnimationClipPlayable, _EmbeddedPlayable);
  var _proto = EmbeddedAnimationClipPlayable.prototype;
  _proto.instantiate = function instantiate(root) {
    var clip = this.clip,
      path = this.path;
    if (!clip) {
      return null;
    }
    var clipRoot = root.getChildByPath(path);
    if (!clipRoot) {
      errorID(3938, path, root.getPathInHierarchy(), clip.name);
      return null;
    }
    var state = new AnimationState(clip);
    state.initialize(clipRoot);
    return new EmbeddedAnimationClipPlayableState(state);
  };
  return EmbeddedAnimationClipPlayable;
}(EmbeddedPlayable), _initializer$F = applyDecoratedInitializer(_class2$M.prototype, "path", [serializable$d], function () {
  return '';
}), _initializer2$r = applyDecoratedInitializer(_class2$M.prototype, "clip", [serializable$d], function () {
  return null;
}), _class2$M)) || _class$V);
var EmbeddedAnimationClipPlayableState = function (_EmbeddedPlayableStat) {
  function EmbeddedAnimationClipPlayableState(animationState) {
    var _this2;
    _this2 = _EmbeddedPlayableStat.call(this, true) || this;
    _this2._animationState = void 0;
    _this2._animationState = animationState;
    return _this2;
  }
  _inheritsLoose(EmbeddedAnimationClipPlayableState, _EmbeddedPlayableStat);
  var _proto2 = EmbeddedAnimationClipPlayableState.prototype;
  _proto2.destroy = function destroy() {
    this._animationState.destroy();
  };
  _proto2.play = function play() {
    this._animationState.play();
  };
  _proto2.pause = function pause() {
    this._animationState.pause();
  };
  _proto2.stop = function stop() {
    this._animationState.stop();
  };
  _proto2.setSpeed = function setSpeed(speed) {
    this._animationState.speed = speed;
  };
  _proto2.setTime = function setTime(time) {
    this._animationState.time = time;
  };
  return EmbeddedAnimationClipPlayableState;
}(EmbeddedPlayableState);

var _dec$T, _class$U, _class2$L, _initializer$E;
(_dec$T = ccclass$g(CLASS_NAME_PREFIX_ANIM + "EmbeddedParticleSystemPlayable"), _dec$T(_class$U = (_class2$L = function (_EmbeddedPlayable) {
  function EmbeddedParticleSystemPlayable() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _EmbeddedPlayable.call.apply(_EmbeddedPlayable, [this].concat(args)) || this;
    _this.path = _initializer$E && _initializer$E();
    return _this;
  }
  _inheritsLoose(EmbeddedParticleSystemPlayable, _EmbeddedPlayable);
  var _proto = EmbeddedParticleSystemPlayable.prototype;
  _proto.instantiate = function instantiate(root) {
    var node = root.getChildByPath(this.path);
    if (!node) {
      warn("Hierarchy path " + this.path + " does not exists.");
      return null;
    }
    var ParticleSystemConstructor = getClassByName("cc.ParticleSystem");
    if (!ParticleSystemConstructor) {
      warn("Particle system is required for embedded particle system player.");
      return null;
    }
    var particleSystem = node.getComponent(ParticleSystemConstructor);
    if (!particleSystem) {
      warn(this.path + " does not includes a particle system component.");
      return null;
    }
    return new EmbeddedParticleSystemPlayableState(particleSystem);
  };
  return EmbeddedParticleSystemPlayable;
}(EmbeddedPlayable), _initializer$E = applyDecoratedInitializer(_class2$L.prototype, "path", [serializable$d], function () {
  return '';
}), _class2$L)) || _class$U);
var EmbeddedParticleSystemPlayableState = function (_EmbeddedPlayableStat) {
  function EmbeddedParticleSystemPlayableState(particleSystem) {
    var _this2;
    _this2 = _EmbeddedPlayableStat.call(this, false) || this;
    _this2._particleSystem = void 0;
    _this2._particleSystem = particleSystem;
    return _this2;
  }
  _inheritsLoose(EmbeddedParticleSystemPlayableState, _EmbeddedPlayableStat);
  var _proto2 = EmbeddedParticleSystemPlayableState.prototype;
  _proto2.destroy = function destroy() {};
  _proto2.play = function play() {
    this._particleSystem.play();
  };
  _proto2.pause = function pause() {
    this._particleSystem.stopEmitting();
  };
  _proto2.stop = function stop() {
    this._particleSystem.stopEmitting();
  };
  _proto2.setSpeed = function setSpeed(speed) {
    this._particleSystem.simulationSpeed = speed;
  };
  return EmbeddedParticleSystemPlayableState;
}(EmbeddedPlayableState);

var _dec$S, _class$T, _class2$K, _initializer$D;
var ccclass$f = ccclass$g,
  serializable$c = serializable$d;
(_dec$S = ccclass$f(CLASS_NAME_PREFIX_ANIM + "RealArrayTrack"), _dec$S(_class$T = (_class2$K = function (_Track) {
  function RealArrayTrack() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Track.call.apply(_Track, [this].concat(args)) || this;
    _this._channels = _initializer$D && _initializer$D();
    return _this;
  }
  _inheritsLoose(RealArrayTrack, _Track);
  var _proto = RealArrayTrack.prototype;
  _proto.channels = function channels() {
    return this._channels;
  };
  _proto[createEvalSymbol] = function () {
    return new RealArrayTrackEval(this._channels.map(function (_ref) {
      var curve = _ref.curve;
      return curve;
    }));
  };
  return _createClass(RealArrayTrack, [{
    key: "elementCount",
    get: function get() {
      return this._channels.length;
    },
    set: function set(value) {
      var channels = this._channels;
      var nChannels = channels.length;
      if (value < nChannels) {
        this._channels.splice(value);
      } else if (value > nChannels) {
        var _this$_channels;
        (_this$_channels = this._channels).push.apply(_this$_channels, Array.from({
          length: value - nChannels
        }, function () {
          return new Channel(new RealCurve());
        }));
      }
    }
  }]);
}(Track), _initializer$D = applyDecoratedInitializer(_class2$K.prototype, "_channels", [serializable$c], function () {
  return [];
}), _class2$K)) || _class$T);
var RealArrayTrackEval = function () {
  function RealArrayTrackEval(_curves) {
    this._curves = _curves;
    this._result = new Array(_curves.length).fill(0.0);
  }
  var _proto2 = RealArrayTrackEval.prototype;
  _proto2.evaluate = function evaluate(time) {
    var result = this._result;
    var nElements = result.length;
    for (var iElement = 0; iElement < nElements; ++iElement) {
      result[iElement] = this._curves[iElement].evaluate(time);
    }
    return this._result;
  };
  return _createClass(RealArrayTrackEval, [{
    key: "requiresDefault",
    get: function get() {
      return false;
    }
  }]);
}();

var _dec$R, _class$S, _class2$J, _initializer$C, _initializer2$q, _descriptor$b;
var UniformProxyFactory = (_dec$R = ccclass$g('cc.animation.UniformProxyFactory'), _dec$R(_class$S = (_class2$J = function () {
  function UniformProxyFactory(uniformName, passIndex) {
    this.passIndex = _initializer$C && _initializer$C();
    this.uniformName = _initializer2$q && _initializer2$q();
    _initializerDefineProperty(this, "channelIndex", _descriptor$b, this);
    this.passIndex = passIndex || 0;
    this.uniformName = uniformName || '';
  }
  var _proto = UniformProxyFactory.prototype;
  _proto.forTarget = function forTarget(target) {
    if (!(target instanceof Material)) {
      warnID(3940, target);
      return undefined;
    }
    var passIndex = this.passIndex,
      uniformName = this.uniformName,
      channelIndex = this.channelIndex;
    if (passIndex < 0 || passIndex >= target.passes.length) {
      warnID(3941, target.name, passIndex);
      return undefined;
    }
    var pass = target.passes[passIndex];
    var handle = pass.getHandle(uniformName);
    if (!handle) {
      warnID(3942, target.name, passIndex, uniformName);
      return undefined;
    }
    var type = getTypeFromHandle(handle);
    if (type < Type.SAMPLER1D) {
      var realHandle = channelIndex === undefined ? handle : pass.getHandle(uniformName, channelIndex, Type.FLOAT);
      if (!realHandle) {
        warnID(3943, target.name, passIndex, uniformName, channelIndex);
        return undefined;
      }
      if (isUniformArray(pass, uniformName)) {
        return {
          set: function set(value) {
            pass.setUniformArray(realHandle, value);
          }
        };
      }
      return {
        set: function set(value) {
          pass.setUniform(realHandle, value);
        }
      };
    } else {
      var binding = getBindingFromHandle(handle);
      var prop = pass.properties[uniformName];
      var texName = prop && prop.value ? "" + prop.value + getStringFromType(prop.type) : getDefaultFromType(prop.type);
      var dftTex = builtinResMgr.get(texName);
      if (!dftTex) {
        warn("Illegal texture default value: " + texName + ".");
        dftTex = builtinResMgr.get('default-texture');
      }
      return {
        set: function set(value) {
          if (!value) {
            value = dftTex;
          }
          var texture = value.getGFXTexture();
          if (!texture || !texture.width || !texture.height) {
            return;
          }
          pass.bindTexture(binding, texture);
          if (value instanceof TextureBase) {
            pass.bindSampler(binding, deviceManager.gfxDevice.getSampler(value.getSamplerInfo()));
          }
        }
      };
    }
  };
  return UniformProxyFactory;
}(), _initializer$C = applyDecoratedInitializer(_class2$J.prototype, "passIndex", [serializable$d], function () {
  return 0;
}), _initializer2$q = applyDecoratedInitializer(_class2$J.prototype, "uniformName", [serializable$d], function () {
  return '';
}), _descriptor$b = _applyDecoratedDescriptor(_class2$J.prototype, "channelIndex", [_float], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return undefined;
  }
}), _class2$J)) || _class$S);
function isUniformArray(pass, name) {
  for (var _iterator = _createForOfIteratorHelperLoose(pass.shaderInfo.blocks), _step; !(_step = _iterator()).done;) {
    var block = _step.value;
    for (var _iterator2 = _createForOfIteratorHelperLoose(block.members), _step2; !(_step2 = _iterator2()).done;) {
      var uniform = _step2.value;
      if (uniform.name === name) {
        return uniform.count > 1;
      }
    }
  }
  return false;
}

var _dec$Q, _class$R, _class2$I, _initializer$B, _initializer2$p, _dec2$B, _class3$c, _class4$c, _initializer3$e, _dec3$p, _class5$3;
var MorphWeightValueProxy = (_dec$Q = ccclass$g('cc.animation.MorphWeightValueProxy'), _dec$Q(_class$R = (_class2$I = function () {
  function MorphWeightValueProxy() {
    this.subMeshIndex = _initializer$B && _initializer$B();
    this.shapeIndex = _initializer2$p && _initializer2$p();
  }
  var _proto = MorphWeightValueProxy.prototype;
  _proto.forTarget = function forTarget(target) {
    var _this = this;
    return {
      set: function set(value) {
        target.setWeight(value, _this.subMeshIndex, _this.shapeIndex);
      }
    };
  };
  return MorphWeightValueProxy;
}(), _initializer$B = applyDecoratedInitializer(_class2$I.prototype, "subMeshIndex", [serializable$d], function () {
  return 0;
}), _initializer2$p = applyDecoratedInitializer(_class2$I.prototype, "shapeIndex", [serializable$d], function () {
  return 0;
}), _class2$I)) || _class$R);
var MorphWeightsValueProxy = (_dec2$B = ccclass$g('cc.animation.MorphWeightsValueProxy'), _dec2$B(_class3$c = (_class4$c = function () {
  function MorphWeightsValueProxy() {
    this.subMeshIndex = _initializer3$e && _initializer3$e();
  }
  var _proto2 = MorphWeightsValueProxy.prototype;
  _proto2.forTarget = function forTarget(target) {
    var _this2 = this;
    return {
      set: function set(value) {
        target.setWeights(value, _this2.subMeshIndex);
      }
    };
  };
  return MorphWeightsValueProxy;
}(), _initializer3$e = applyDecoratedInitializer(_class4$c.prototype, "subMeshIndex", [serializable$d], function () {
  return 0;
}), _class4$c)) || _class3$c);
var MorphWeightsAllValueProxy = (_dec3$p = ccclass$g('cc.animation.MorphWeightsAllValueProxy'), _dec3$p(_class5$3 = function () {
  function MorphWeightsAllValueProxy() {}
  var _proto3 = MorphWeightsAllValueProxy.prototype;
  _proto3.forTarget = function forTarget(target) {
    return {
      set: function set(value) {
        var _target$mesh$struct$p, _target$mesh;
        var nSubMeshes = (_target$mesh$struct$p = (_target$mesh = target.mesh) == null ? void 0 : _target$mesh.struct.primitives.length) !== null && _target$mesh$struct$p !== void 0 ? _target$mesh$struct$p : 0;
        for (var iSubMesh = 0; iSubMesh < nSubMeshes; ++iSubMesh) {
          target.setWeights(value, iSubMesh);
        }
      }
    };
  };
  return MorphWeightsAllValueProxy;
}()) || _class5$3);

var ownerSymbol = Symbol('[[Owner]]');
function assertsOwnedBy(mastered, owner) {
  assertIsTrue(mastered[ownerSymbol] === owner);
}
function own(mastered, owner) {
  {
    mastered[ownerSymbol] = owner;
  }
}
function markAsDangling(mastered) {
  {
    mastered[ownerSymbol] = undefined;
  }
}

var VariableType;
(function (VariableType) {
  VariableType[VariableType["FLOAT"] = 0] = "FLOAT";
  VariableType[VariableType["BOOLEAN"] = 1] = "BOOLEAN";
  VariableType[VariableType["TRIGGER"] = 2] = "TRIGGER";
  VariableType[VariableType["INTEGER"] = 3] = "INTEGER";
  VariableType[VariableType["VEC3_experimental"] = 4] = "VEC3_experimental";
  VariableType[VariableType["QUAT_experimental"] = 5] = "QUAT_experimental";
})(VariableType || (VariableType = {}));
var createInstanceTag = Symbol('CreateInstance');
var VarInstanceBase = function () {
  function VarInstanceBase(type) {
    this._refs = [];
    this.type = type;
  }
  var _proto = VarInstanceBase.prototype;
  _proto.bind = function bind(fn, thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    this._refs.push({
      fn: fn,
      thisArg: thisArg,
      args: args
    });
    return this.getValue();
  };
  return _createClass(VarInstanceBase, [{
    key: "value",
    get: function get() {
      return this.getValue();
    },
    set: function set(value) {
      this.setValue(value);
      for (var _iterator = _createForOfIteratorHelperLoose(this._refs), _step; !(_step = _iterator()).done;) {
        var _step$value = _step.value,
          fn = _step$value.fn,
          thisArg = _step$value.thisArg,
          args = _step$value.args;
        fn.call.apply(fn, [thisArg, value].concat(args));
      }
    }
  }]);
}();

var _dec$P, _class$Q, _class2$H, _initializer$A, _initializer2$o;
var PlainVariable = (_dec$P = ccclass$g('cc.animation.PlainVariable'), _dec$P(_class$Q = (_class2$H = function () {
  function PlainVariable(type) {
    this._type = _initializer$A && _initializer$A();
    this._value = _initializer2$o && _initializer2$o();
    if (typeof type === 'undefined') {
      return;
    }
    this._type = type;
    switch (type) {
      default:
        break;
      case VariableType.FLOAT:
        this._value = 0.0;
        break;
      case VariableType.INTEGER:
        this._value = 0;
        break;
      case VariableType.BOOLEAN:
        this._value = false;
        break;
    }
  }
  var _proto = PlainVariable.prototype;
  _proto[createInstanceTag] = function () {
    return new VarInstancePrimitive(this._type, this._value);
  };
  return _createClass(PlainVariable, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      {
        switch (this._type) {
          default:
            break;
          case VariableType.FLOAT:
            assertIsTrue(typeof value === 'number');
            break;
          case VariableType.INTEGER:
            assertIsTrue(Number.isInteger(value));
            break;
          case VariableType.BOOLEAN:
            assertIsTrue(typeof value === 'boolean');
            break;
        }
      }
      this._value = value;
    }
  }]);
}(), _initializer$A = applyDecoratedInitializer(_class2$H.prototype, "_type", [serializable$d], function () {
  return VariableType.FLOAT;
}), _initializer2$o = applyDecoratedInitializer(_class2$H.prototype, "_value", [serializable$d], function () {
  return 0.0;
}), _class2$H)) || _class$Q);
var VarInstancePrimitive = function (_VarInstanceBase) {
  function VarInstancePrimitive(type, value) {
    var _this;
    _this = _VarInstanceBase.call(this, type) || this;
    _this._value = void 0;
    _this._value = value;
    return _this;
  }
  _inheritsLoose(VarInstancePrimitive, _VarInstanceBase);
  var _proto2 = VarInstancePrimitive.prototype;
  _proto2.getValue = function getValue() {
    return this._value;
  };
  _proto2.setValue = function setValue(value) {
    this._value = value;
  };
  return VarInstancePrimitive;
}(VarInstanceBase);

var _dec$O, _class$P, _class2$G, _initializer$z;
var TriggerResetMode;
(function (TriggerResetMode) {
  TriggerResetMode[TriggerResetMode["AFTER_CONSUMED"] = 0] = "AFTER_CONSUMED";
  TriggerResetMode[TriggerResetMode["NEXT_FRAME_OR_AFTER_CONSUMED"] = 1] = "NEXT_FRAME_OR_AFTER_CONSUMED";
})(TriggerResetMode || (TriggerResetMode = {}));
var TRIGGER_VARIABLE_FLAG_VALUE_START = 0;
var TRIGGER_VARIABLE_FLAG_VALUE_MASK = 1;
var TRIGGER_VARIABLE_FLAG_RESET_MODE_START = 1;
var TRIGGER_VARIABLE_FLAG_RESET_MODE_MASK = 6;
var TRIGGER_VARIABLE_DEFAULT_FLAGS = 0;
assertIsTrue((0 << TRIGGER_VARIABLE_FLAG_VALUE_START | TriggerResetMode.AFTER_CONSUMED << TRIGGER_VARIABLE_FLAG_RESET_MODE_START) === TRIGGER_VARIABLE_DEFAULT_FLAGS);
var TriggerVariable = (_dec$O = ccclass$g('cc.animation.TriggerVariable'), _dec$O(_class$P = (_class2$G = function () {
  function TriggerVariable() {
    this._flags = _initializer$z && _initializer$z();
  }
  var _proto = TriggerVariable.prototype;
  _proto[createInstanceTag] = function () {
    return new VarInstanceTrigger(this.value, this.resetMode);
  };
  return _createClass(TriggerVariable, [{
    key: "type",
    get: function get() {
      return VariableType.TRIGGER;
    }
  }, {
    key: "value",
    get: function get() {
      return !!((this._flags & TRIGGER_VARIABLE_FLAG_VALUE_MASK) >> TRIGGER_VARIABLE_FLAG_VALUE_START);
    },
    set: function set(value) {
      if (value) {
        this._flags |= 1 << TRIGGER_VARIABLE_FLAG_VALUE_START;
      } else {
        this._flags &= -2;
      }
    }
  }, {
    key: "resetMode",
    get: function get() {
      return (this._flags & TRIGGER_VARIABLE_FLAG_RESET_MODE_MASK) >> TRIGGER_VARIABLE_FLAG_RESET_MODE_START;
    },
    set: function set(value) {
      this._flags &= ~TRIGGER_VARIABLE_FLAG_RESET_MODE_MASK;
      this._flags |= value << TRIGGER_VARIABLE_FLAG_RESET_MODE_START;
    }
  }]);
}(), _initializer$z = applyDecoratedInitializer(_class2$G.prototype, "_flags", [serializable$d], function () {
  return TRIGGER_VARIABLE_DEFAULT_FLAGS;
}), _class2$G)) || _class$P);
var VarInstanceTrigger = function (_VarInstanceBase) {
  function VarInstanceTrigger(value, resetMode) {
    var _this;
    _this = _VarInstanceBase.call(this, VariableType.TRIGGER) || this;
    _this.resetMode = TriggerResetMode.AFTER_CONSUMED;
    _this._value = void 0;
    _this.resetMode = resetMode;
    _this._value = value;
    return _this;
  }
  _inheritsLoose(VarInstanceTrigger, _VarInstanceBase);
  var _proto2 = VarInstanceTrigger.prototype;
  _proto2.getValue = function getValue() {
    return this._value;
  };
  _proto2.setValue = function setValue(value) {
    this._value = value;
  };
  return VarInstanceTrigger;
}(VarInstanceBase);

var _dec$N, _class$O, _class2$F, _initializer$y;
var Vec3Variable = (_dec$N = ccclass$g('cc.animation.Vec3Variable'), _dec$N(_class$O = (_class2$F = function () {
  function Vec3Variable() {
    this._value = _initializer$y && _initializer$y();
  }
  var _proto = Vec3Variable.prototype;
  _proto[createInstanceTag] = function () {
    return new VarInstanceVec3(this.value);
  };
  return _createClass(Vec3Variable, [{
    key: "type",
    get: function get() {
      return VariableType.VEC3_experimental;
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      Vec3.copy(this._value, value);
    }
  }]);
}(), _initializer$y = applyDecoratedInitializer(_class2$F.prototype, "_value", [serializable$d], function () {
  return new Vec3();
}), _class2$F)) || _class$O);
var VarInstanceVec3 = function (_VarInstanceBase) {
  function VarInstanceVec3(value) {
    var _this;
    _this = _VarInstanceBase.call(this, VariableType.VEC3_experimental) || this;
    _this._value = new Vec3();
    Vec3.copy(_this._value, value);
    return _this;
  }
  _inheritsLoose(VarInstanceVec3, _VarInstanceBase);
  var _proto2 = VarInstanceVec3.prototype;
  _proto2.getValue = function getValue() {
    return this._value;
  };
  _proto2.setValue = function setValue(value) {
    assertIsTrue(value instanceof Vec3);
    Vec3.copy(this._value, value);
  };
  return VarInstanceVec3;
}(VarInstanceBase);

var _dec$M, _class$N, _class2$E, _initializer$x;
var QuatVariable = (_dec$M = ccclass$g('cc.animation.QuatVariable'), _dec$M(_class$N = (_class2$E = function () {
  function QuatVariable() {
    this._value = _initializer$x && _initializer$x();
  }
  var _proto = QuatVariable.prototype;
  _proto[createInstanceTag] = function () {
    return new VarInstanceQuat(this._value);
  };
  return _createClass(QuatVariable, [{
    key: "type",
    get: function get() {
      return VariableType.QUAT_experimental;
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      Quat.copy(this._value, value);
    }
  }]);
}(), _initializer$x = applyDecoratedInitializer(_class2$E.prototype, "_value", [serializable$d], function () {
  return new Quat();
}), _class2$E)) || _class$N);
var VarInstanceQuat = function (_VarInstanceBase) {
  function VarInstanceQuat(value) {
    var _this;
    _this = _VarInstanceBase.call(this, VariableType.QUAT_experimental) || this;
    _this._value = new Quat();
    Quat.copy(_this._value, value);
    return _this;
  }
  _inheritsLoose(VarInstanceQuat, _VarInstanceBase);
  var _proto2 = VarInstanceQuat.prototype;
  _proto2.getValue = function getValue() {
    return this._value;
  };
  _proto2.setValue = function setValue(value) {
    assertIsTrue(value instanceof Quat);
    Quat.copy(this._value, value);
  };
  return VarInstanceQuat;
}(VarInstanceBase);

function createVariable(type, initialValue) {
  var variable;
  switch (type) {
    case VariableType.FLOAT:
    case VariableType.INTEGER:
    case VariableType.BOOLEAN:
      variable = new PlainVariable(type);
      break;
    case VariableType.TRIGGER:
      variable = new TriggerVariable();
      break;
    case VariableType.VEC3_experimental:
      variable = new Vec3Variable();
      break;
    case VariableType.QUAT_experimental:
      variable = new QuatVariable();
      break;
    default:
      throw new Error("Unknown variable type " + type);
  }
  if (typeof initialValue !== 'undefined') {
    variable.value = initialValue;
  }
  return variable;
}

var InvalidTransitionError = function (_Error) {
  function InvalidTransitionError(type) {
    var _this;
    _this = _Error.call(this, type + " transition is invalid") || this;
    _this.name = 'TransitionRejectError';
    return _this;
  }
  _inheritsLoose(InvalidTransitionError, _Error);
  return InvalidTransitionError;
}(_wrapNativeSuper(Error));
var VariableNotDefinedError = function (_Error2) {
  function VariableNotDefinedError(name) {
    return _Error2.call(this, "Graph variable " + name + " is not defined") || this;
  }
  _inheritsLoose(VariableNotDefinedError, _Error2);
  return VariableNotDefinedError;
}(_wrapNativeSuper(Error));
var VariableTypeMismatchedError = function (_Error3) {
  function VariableTypeMismatchedError(name, expected, received) {
    return _Error3.call(this, "Expect graph variable " + name + " to have type '" + expected + "' instead of received '" + (received !== null && received !== void 0 ? received : typeof received) + "'") || this;
  }
  _inheritsLoose(VariableTypeMismatchedError, _Error3);
  return VariableTypeMismatchedError;
}(_wrapNativeSuper(Error));

function cloneAnimationGraphEditorExtrasFrom(object) {
  var editorExtras = object[editorExtrasTag];
  if (typeof editorExtras === 'object' && editorExtras) {
    var maybeCloneableEditorExtras = editorExtras;
    return maybeCloneableEditorExtras.clone == null ? void 0 : maybeCloneableEditorExtras.clone(object);
  }
  return undefined;
}

var _dec$L, _class$M, _class2$D, _initializer$w, _dec2$A, _class3$b, _class4$b, _initializer2$n;
var outgoingsSymbol = Symbol('[[Outgoing transitions]]');
var incomingsSymbol = Symbol('[[Incoming transitions]]');
var ccclass$e = ccclass$g,
  serializable$b = serializable$d;
var State = (_dec$L = ccclass$e('cc.animation.State'), _dec$L(_class$M = (_class2$D = function (_EditorExtendable) {
  function State() {
    var _this;
    _this = _EditorExtendable.call(this) || this;
    _this.name = _initializer$w && _initializer$w();
    _this[outgoingsSymbol] = [];
    _this[incomingsSymbol] = [];
    return _this;
  }
  _inheritsLoose(State, _EditorExtendable);
  var _proto = State.prototype;
  _proto.copyTo = function copyTo(that) {
    that.name = this.name;
    that[editorExtrasTag] = cloneAnimationGraphEditorExtrasFrom(this);
  };
  return State;
}(EditorExtendable), _initializer$w = applyDecoratedInitializer(_class2$D.prototype, "name", [serializable$b], function () {
  return '';
}), _class2$D)) || _class$M);
var InteractiveState = (_dec2$A = ccclass$e(CLASS_NAME_PREFIX_ANIM + "InteractiveState"), _dec2$A(_class3$b = (_class4$b = function (_State2) {
  function InteractiveState() {
    var _this2;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this2 = _State2.call.apply(_State2, [this].concat(args)) || this;
    _this2._components = _initializer2$n && _initializer2$n();
    return _this2;
  }
  _inheritsLoose(InteractiveState, _State2);
  var _proto2 = InteractiveState.prototype;
  _proto2.addComponent = function addComponent(constructor) {
    var component = new constructor();
    this._components.push(component);
    return component;
  };
  _proto2.removeComponent = function removeComponent(component) {
    remove(this._components, component);
  };
  _proto2.instantiateComponents = function instantiateComponents() {
    var instantiatedComponents = this._components.map(function (component) {
      var instantiated = instantiate(component);
      return instantiated;
    });
    return instantiatedComponents;
  };
  _proto2.copyTo = function copyTo(that) {
    _State2.prototype.copyTo.call(this, that);
    that._components = this.instantiateComponents();
  };
  return _createClass(InteractiveState, [{
    key: "components",
    get: function get() {
      return this._components;
    }
  }]);
}(State), _initializer2$n = applyDecoratedInitializer(_class4$b.prototype, "_components", [serializable$b], function () {
  return [];
}), _class4$b)) || _class3$b);

var _dec$K, _class$L, _class2$C, _initializer$v;
var AnimationGraphEventBinding = (_dec$K = ccclass$g(CLASS_NAME_PREFIX_ANIM + "AnimationGraphEventBinding"), _dec$K(_class$L = (_class2$C = function () {
  function AnimationGraphEventBinding() {
    this.methodName = _initializer$v && _initializer$v();
  }
  var _proto = AnimationGraphEventBinding.prototype;
  _proto.emit = function emit(origin) {
    if (!this.methodName) {
      return;
    }
    invokeComponentMethodsEngagedInAnimationEvent(origin, this.methodName, []);
  };
  _proto.copyTo = function copyTo(that) {
    that.methodName = this.methodName;
    return this;
  };
  return _createClass(AnimationGraphEventBinding, [{
    key: "isBound",
    get: function get() {
      return !!this.methodName;
    }
  }]);
}(), _initializer$v = applyDecoratedInitializer(_class2$C.prototype, "methodName", [serializable$d], function () {
  return '';
}), _class2$C)) || _class$L);

var _dec$J, _class$K, _class2$B, _initializer$u, _initializer2$m, _initializer3$d, _initializer4$9, _initializer5$5, _initializer6$2;
var MotionState = (_dec$J = ccclass$g('cc.animation.Motion'), _dec$J(_class$K = (_class2$B = function (_InteractiveState) {
  function MotionState() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _InteractiveState.call.apply(_InteractiveState, [this].concat(args)) || this;
    _this.motion = _initializer$u && _initializer$u();
    _this.speed = _initializer2$m && _initializer2$m();
    _this.speedMultiplier = _initializer3$d && _initializer3$d();
    _this.speedMultiplierEnabled = _initializer4$9 && _initializer4$9();
    _this.transitionInEventBinding = _initializer5$5 && _initializer5$5();
    _this.transitionOutEventBinding = _initializer6$2 && _initializer6$2();
    return _this;
  }
  _inheritsLoose(MotionState, _InteractiveState);
  var _proto = MotionState.prototype;
  _proto.__callOnAfterDeserializeRecursive = function __callOnAfterDeserializeRecursive() {
    var _this$motion;
    (_this$motion = this.motion) == null ? void 0 : _this$motion.__callOnAfterDeserializeRecursive();
  };
  _proto.copyTo = function copyTo(that) {
    var _this$motion$clone, _this$motion2;
    _InteractiveState.prototype.copyTo.call(this, that);
    that.motion = (_this$motion$clone = (_this$motion2 = this.motion) == null ? void 0 : _this$motion2.clone()) !== null && _this$motion$clone !== void 0 ? _this$motion$clone : null;
    that.speed = this.speed;
    that.speedMultiplier = this.speedMultiplier;
    that.speedMultiplierEnabled = this.speedMultiplierEnabled;
    this.transitionInEventBinding.copyTo(that.transitionInEventBinding);
    this.transitionOutEventBinding.copyTo(that.transitionOutEventBinding);
    return this;
  };
  return MotionState;
}(InteractiveState), _initializer$u = applyDecoratedInitializer(_class2$B.prototype, "motion", [serializable$d], function () {
  return null;
}), _initializer2$m = applyDecoratedInitializer(_class2$B.prototype, "speed", [serializable$d], function () {
  return 1.0;
}), _initializer3$d = applyDecoratedInitializer(_class2$B.prototype, "speedMultiplier", [serializable$d], function () {
  return '';
}), _initializer4$9 = applyDecoratedInitializer(_class2$B.prototype, "speedMultiplierEnabled", [serializable$d], function () {
  return false;
}), _initializer5$5 = applyDecoratedInitializer(_class2$B.prototype, "transitionInEventBinding", [serializable$d], function () {
  return new AnimationGraphEventBinding();
}), _initializer6$2 = applyDecoratedInitializer(_class2$B.prototype, "transitionOutEventBinding", [serializable$d], function () {
  return new AnimationGraphEventBinding();
}), _class2$B)) || _class$K);

var onAfterDeserializedTag = Symbol('[[OnAfterDeserialized]]');

var _dec$I, _class$J;
var AnimationGraphLike = (_dec$I = ccclass$g(CLASS_NAME_PREFIX_ANIM + "AnimationGraphLike"), _dec$I(_class$J = function (_Asset) {
  function AnimationGraphLike() {
    return _Asset.apply(this, arguments) || this;
  }
  _inheritsLoose(AnimationGraphLike, _Asset);
  return AnimationGraphLike;
}(Asset)) || _class$J);

function renameObjectProperty(object, originalPropertyKey, newPropertyKey) {
  var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
  if (!propertyIsEnumerable.call(object, originalPropertyKey)) {
    return object;
  }
  if (newPropertyKey in object) {
    return object;
  }
  var result = {};
  if (typeof originalPropertyKey === 'symbol') {
    Object.entries(object).forEach(function (_ref) {
      var k = _ref[0],
        v = _ref[1];
      result[k] = v;
    });
    Object.getOwnPropertySymbols(object).forEach(function (k) {
      if (!propertyIsEnumerable.call(object, k)) {
        return;
      }
      result[k === originalPropertyKey ? newPropertyKey : k] = object[k];
    });
  } else {
    Object.entries(object).forEach(function (_ref2) {
      var k = _ref2[0],
        v = _ref2[1];
      result[k === originalPropertyKey ? newPropertyKey : k] = v;
    });
    Object.getOwnPropertySymbols(object).forEach(function (k) {
      if (!propertyIsEnumerable.call(object, k)) {
        return;
      }
      result[k] = object[k];
    });
  }
  return result;
}
var createInstanceofProxy = function () {
  var isSymbolHasInstanceAvailable = false;
  try {
    var Array1 = function () {
      function Array1() {}
      Array1[Symbol.hasInstance] = function (instance) {
        return Array.isArray(instance);
      };
      return Array1;
    }();
    isSymbolHasInstanceAvailable = [] instanceof Array1;
  } catch (_unused) {
    isSymbolHasInstanceAvailable = false;
  }
  if (!isSymbolHasInstanceAvailable) {
    return function (constructor) {
      return constructor;
    };
  }
  return function (constructor) {
    function InstanceOfProxy() {
      throw new Error("This function can not be called as a constructor.");
    }
    Object.defineProperty(InstanceOfProxy, Symbol.hasInstance, {
      value: function value(instance) {
        return instance instanceof constructor;
      }
    });
    return InstanceOfProxy;
  };
}();

var _dec$H, _class$I, _class2$A, _initializer$t, _dec2$z, _class3$a, _class4$a, _initializer2$l, _initializer3$c, _initializer4$8;
var PoseGraphNodeShell = (_dec$H = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseGraphNodeShell"), _dec$H(_class$I = (_class2$A = function (_EditorExtendable) {
  function PoseGraphNodeShell() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _EditorExtendable.call.apply(_EditorExtendable, [this].concat(args)) || this;
    _this._bindings = _initializer$t && _initializer$t();
    return _this;
  }
  _inheritsLoose(PoseGraphNodeShell, _EditorExtendable);
  var _proto = PoseGraphNodeShell.prototype;
  _proto.getBindings = function getBindings() {
    return this._bindings;
  };
  _proto.addBinding = function addBinding(inputPath, producer, outputIndex) {
    this._emplaceBinding(new PoseGraphNodeInputBinding(inputPath, producer, outputIndex));
  };
  _proto.deleteBinding = function deleteBinding(inputPath) {
    var index = this._findBindingIndex(inputPath);
    if (index >= 0) {
      this._bindings.splice(index, 1);
    }
  };
  _proto.moveArrayElementBindingForward = function moveArrayElementBindingForward(propertyKey, firstIndex, forward) {
    var bindings = this._bindings;
    var oldBindings = [];
    for (var iBinding = 0; iBinding < bindings.length; ++iBinding) {
      var binding = bindings[iBinding];
      var _binding$inputPath = binding.inputPath,
        consumerPropertyKey = _binding$inputPath[0],
        _binding$inputPath$ = _binding$inputPath[1],
        consumerElementIndex = _binding$inputPath$ === void 0 ? -1 : _binding$inputPath$;
      if (consumerPropertyKey === propertyKey && consumerElementIndex >= firstIndex) {
        oldBindings.push(binding);
        bindings.splice(iBinding, 1);
      }
    }
    for (var _i = 0, _oldBindings = oldBindings; _i < _oldBindings.length; _i++) {
      var oldBinding = _oldBindings[_i];
      var _oldBinding$inputPath = oldBinding.inputPath,
        _consumerPropertyKey = _oldBinding$inputPath[0],
        _oldBinding$inputPath2 = _oldBinding$inputPath[1],
        _consumerElementIndex = _oldBinding$inputPath2 === void 0 ? -1 : _oldBinding$inputPath2;
      this.addBinding([_consumerPropertyKey, _consumerElementIndex + (forward ? -1 : 1)], oldBinding.producer, oldBinding.outputIndex);
    }
  };
  _proto.deleteBindingTo = function deleteBindingTo(producer) {
    var bindings = this._bindings;
    for (var iBinding = 0; iBinding < bindings.length; ++iBinding) {
      var binding = bindings[iBinding];
      if (binding.producer === producer) {
        bindings.splice(iBinding, 1);
      }
    }
  };
  _proto.findBinding = function findBinding(inputPath) {
    var bindingIndex = this._findBindingIndex(inputPath);
    return bindingIndex >= 0 ? this._bindings[bindingIndex] : undefined;
  };
  _proto._findBindingIndex = function _findBindingIndex(inputPath) {
    return this._bindings.findIndex(function (searchElement) {
      return isEqualNodeInputPath(searchElement.inputPath, inputPath);
    });
  };
  _proto._emplaceBinding = function _emplaceBinding(binding) {
    var index = this._bindings.findIndex(function (searchElement) {
      return isEqualNodeInputPath(searchElement.inputPath, binding.inputPath);
    });
    if (index >= 0) {
      this._bindings[index] = binding;
    } else {
      this._bindings.push(binding);
    }
  };
  return PoseGraphNodeShell;
}(EditorExtendable), _initializer$t = applyDecoratedInitializer(_class2$A.prototype, "_bindings", [serializable$d], function () {
  return [];
}), _class2$A)) || _class$I);
function isEqualNodeInputPath(lhs, rhs) {
  var lhsPropertyKey = lhs[0],
    lhsElementIndex = lhs[1];
  var rhsPropertyKey = rhs[0],
    rhsElementIndex = rhs[1];
  return lhsPropertyKey === rhsPropertyKey && lhsElementIndex === rhsElementIndex;
}
var PoseGraphNodeInputBinding = (_dec2$z = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseGraphNodeInputBinding"), _dec2$z(_class3$a = (_class4$a = function () {
  function PoseGraphNodeInputBinding(inputPath, producer, outputIndex) {
    this._inputPath = _initializer2$l && _initializer2$l();
    this._producer = _initializer3$c && _initializer3$c();
    this._outputIndex = _initializer4$8 && _initializer4$8();
    this._inputPath = inputPath;
    this._producer = producer;
    if (typeof outputIndex !== 'undefined') {
      this._outputIndex = outputIndex;
    }
  }
  return _createClass(PoseGraphNodeInputBinding, [{
    key: "inputPath",
    get: function get() {
      return this._inputPath;
    }
  }, {
    key: "producer",
    get: function get() {
      return this._producer;
    }
  }, {
    key: "outputIndex",
    get: function get() {
      return this._outputIndex;
    }
  }]);
}(), _initializer2$l = applyDecoratedInitializer(_class4$a.prototype, "_inputPath", [serializable$d], null), _initializer3$c = applyDecoratedInitializer(_class4$a.prototype, "_producer", [serializable$d], null), _initializer4$8 = applyDecoratedInitializer(_class4$a.prototype, "_outputIndex", [serializable$d], function () {
  return 0;
}), _class4$a)) || _class3$a);

var AddNonFreestandingNodeError = function (_Error) {
  function AddNonFreestandingNodeError(node) {
    return _Error.call(this, "Can not add the specified " + node.toString() + " since it has already been added into another graph.") || this;
  }
  _inheritsLoose(AddNonFreestandingNodeError, _Error);
  return AddNonFreestandingNodeError;
}(_wrapNativeSuper(Error));
var OperationOnFreestandingNodeError = function (_Error2) {
  function OperationOnFreestandingNodeError(node) {
    return _Error2.call(this, "Can not perform specified operation on " + node.toString() + " since it has not been added in to graph.") || this;
  }
  _inheritsLoose(OperationOnFreestandingNodeError, _Error2);
  return OperationOnFreestandingNodeError;
}(_wrapNativeSuper(Error));

var PoseGraphType;
(function (PoseGraphType) {
  PoseGraphType[PoseGraphType["FLOAT"] = 0] = "FLOAT";
  PoseGraphType[PoseGraphType["INTEGER"] = 1] = "INTEGER";
  PoseGraphType[PoseGraphType["BOOLEAN"] = 2] = "BOOLEAN";
  PoseGraphType[PoseGraphType["VEC3"] = 3] = "VEC3";
  PoseGraphType[PoseGraphType["QUAT"] = 4] = "QUAT";
  PoseGraphType[PoseGraphType["POSE"] = 5] = "POSE";
})(PoseGraphType || (PoseGraphType = {}));

var PoseGraphNode = function (_EditorExtendable) {
  function PoseGraphNode() {
    return _EditorExtendable.apply(this, arguments) || this;
  }
  _inheritsLoose(PoseGraphNode, _EditorExtendable);
  return PoseGraphNode;
}(EditorExtendable);

var nodeEditorMetadataMap = new WeakMap();
function getOrCreateNodeEditorMetadata(constructor) {
  var existing = nodeEditorMetadataMap.get(constructor);
  if (existing) {
    return existing;
  } else {
    var metadata = {};
    nodeEditorMetadataMap.set(constructor, metadata);
    return metadata;
  }
}

function makeNodeEditorMetadataModifier(edit) {
  return function (target) {
    if (!checkDecoratingClass(target)) {
      return;
    }
    var metadata = getOrCreateNodeEditorMetadata(target);
    edit(metadata);
  };
}
var poseGraphNodeCategory = function poseGraphNodeCategory(category) {
  return makeNodeEditorMetadataModifier(function (metadata) {
    metadata.category = category;
  });
};
var poseGraphCreateNodeFactory = function poseGraphCreateNodeFactory(factory) {
  return makeNodeEditorMetadataModifier(function (metadata) {
    metadata.factory = factory;
  });
};
var poseGraphNodeHide = function poseGraphNodeHide(hide) {
  if (hide === void 0) {
    hide = true;
  }
  return makeNodeEditorMetadataModifier(function (metadata) {
    metadata.hide = hide;
  });
};
var poseGraphNodeAppearance = function poseGraphNodeAppearance(appearance) {
  return makeNodeEditorMetadataModifier(function (metadata) {
    var _metadata$appearance;
    Object.assign((_metadata$appearance = metadata.appearance) !== null && _metadata$appearance !== void 0 ? _metadata$appearance : metadata.appearance = {}, appearance);
  });
};
function checkDecoratingClass(fn) {
  if (!isChildClassOf(fn, PoseGraphNode)) {
    error("This kind of decorator should only be applied to pose graph node classes.");
    return false;
  }
  return true;
}

var _excluded = ["arraySyncGroup"];
var PoseGraphNodeInputManager = function () {
  function PoseGraphNodeInputManager() {
    this._classInputMap = new WeakMap();
  }
  var _proto = PoseGraphNodeInputManager.prototype;
  _proto.setPropertyNodeInputRecord = function setPropertyNodeInputRecord(constructor, propertyKey, options) {
    var classInputRecord = this._classInputMap.get(constructor);
    if (!classInputRecord) {
      classInputRecord = {
        properties: {}
      };
      this._classInputMap.set(constructor, classInputRecord);
    }
    options.arraySyncGroup;
      var unchanged = _objectWithoutPropertiesLoose(options, _excluded);
    var record = unchanged;
    var arraySyncGroupName = options.arraySyncGroup;
    if (arraySyncGroupName) {
      var _classInputRecord$arr, _classInputRecord$arr2;
      if (!classInputRecord.arraySyncGroups) {
        classInputRecord.arraySyncGroups = {};
      }
      var group = (_classInputRecord$arr2 = (_classInputRecord$arr = classInputRecord.arraySyncGroups)[arraySyncGroupName]) !== null && _classInputRecord$arr2 !== void 0 ? _classInputRecord$arr2 : _classInputRecord$arr[arraySyncGroupName] = {
        members: []
      };
      if (!group.members.includes(propertyKey)) {
        group.members.push(propertyKey);
      }
      record.arraySyncGroup = group;
    }
    classInputRecord.properties[propertyKey] = Object.freeze(record);
  };
  _proto.getInputKeys = function getInputKeys(object) {
    var _this = this;
    var result = [];
    var _getInputKeysRecurse = function getInputKeysRecurse(constructor) {
      if (!constructor) {
        return;
      }
      _getInputKeysRecurse(getSuper(constructor));
      var record = _this._classInputMap.get(constructor);
      if (!record) {
        return;
      }
      var _loop = function _loop() {
        var _Object$entries$_i = _Object$entries[_i],
          propertyKey = _Object$entries$_i[0];
        if (result.findIndex(function (_ref) {
          var subClassPropertyKey = _ref[0];
          return propertyKey === subClassPropertyKey;
        }) >= 0) {
          return 1;
        }
        var field = object[propertyKey];
        if (Array.isArray(field)) {
          for (var iElement = 0; iElement < field.length; ++iElement) {
            result.push([propertyKey, iElement]);
          }
        } else {
          result.push([propertyKey]);
        }
      };
      for (var _i = 0, _Object$entries = Object.entries(record.properties); _i < _Object$entries.length; _i++) {
        if (_loop()) continue;
      }
    };
    _getInputKeysRecurse(object.constructor);
    return result;
  };
  _proto.isPoseInput = function isPoseInput(object, key) {
    var propertyKey = key[0];
    var propertyInputRecord = this._getPropertyNodeInputRecord(object.constructor, propertyKey);
    if (!propertyInputRecord) {
      return false;
    }
    return propertyInputRecord.type === PoseGraphType.POSE;
  };
  _proto.getInputMetadata = function getInputMetadata(object, key) {
    var propertyKey = key[0],
      _key$ = key[1],
      elementIndex = _key$ === void 0 ? -1 : _key$;
    var propertyInputRecord = this._getPropertyNodeInputRecord(object.constructor, propertyKey);
    if (!propertyInputRecord) {
      return undefined;
    }
    var field = object[propertyKey];
    if (Array.isArray(field)) {
      if (elementIndex < 0 || elementIndex >= field.length) {
        return undefined;
      } else {
        var _propertyInputRecord$, _propertyInputRecord$2;
        var displayName = (_propertyInputRecord$ = (_propertyInputRecord$2 = propertyInputRecord.getArrayElementDisplayName) == null ? void 0 : _propertyInputRecord$2.call(object, elementIndex)) !== null && _propertyInputRecord$ !== void 0 ? _propertyInputRecord$ : propertyInputRecord.displayName;
        return {
          type: propertyInputRecord.type,
          displayName: displayName,
          deletable: !(propertyInputRecord.arraySyncGroup && propertyInputRecord.arraySyncGroupFollower),
          insertPoint: true
        };
      }
    }
    return {
      type: propertyInputRecord.type,
      displayName: propertyInputRecord.displayName
    };
  };
  _proto.hasInput = function hasInput(object, key) {
    var propertyKey = key[0],
      _key$2 = key[1],
      elementIndex = _key$2 === void 0 ? -1 : _key$2;
    var record = this._getPropertyNodeInputRecord(object.constructor, propertyKey);
    if (!record) {
      return false;
    }
    var field = object[propertyKey];
    if (Array.isArray(field)) {
      if (elementIndex < 0 || elementIndex >= field.length) {
        return false;
      }
    }
    return true;
  };
  _proto.getInputInsertInfos = function getInputInsertInfos(object) {
    var result = {};
    for (var constructor = object.constructor; constructor; constructor = getSuper(constructor)) {
      var classInputRecord = this._classInputMap.get(constructor);
      if (!classInputRecord) {
        continue;
      }
      for (var propertyKey in classInputRecord.properties) {
        var propertyInputRecord = classInputRecord.properties[propertyKey];
        var property = object[propertyKey];
        if (Array.isArray(property)) {
          if (propertyInputRecord.arraySyncGroup && propertyInputRecord.arraySyncGroupFollower) {
            continue;
          }
          result[propertyKey] = {
            displayName: propertyKey
          };
        }
      }
    }
    return result;
  };
  _proto.deleteInput = function deleteInput(graph, node, key) {
    var propertyKey = key[0],
      _key$3 = key[1],
      elementIndex = _key$3 === void 0 ? -1 : _key$3;
    var propertyInputRecord = this._getPropertyNodeInputRecord(node.constructor, propertyKey);
    if (!propertyInputRecord) {
      return;
    }
    var property = node[propertyKey];
    if (!Array.isArray(property)) {
      return;
    }
    if (elementIndex < 0 || elementIndex >= property.length) {
      return;
    }
    {
      var arraySyncGroup = propertyInputRecord.arraySyncGroup;
      if (arraySyncGroup) {
        this._deleteInputInArraySyncGroup(graph, node, arraySyncGroup, property.length, elementIndex);
        return;
      }
    }
    deletePoseGraphNodeArrayElement(graph, node, key);
  };
  _proto.insertInput = function insertInput(graph, node, insertId) {
    var propertyKey = insertId;
    var propertyInputRecord = this._getPropertyNodeInputRecord(node.constructor, propertyKey);
    if (!propertyInputRecord) {
      return;
    }
    var property = node[propertyKey];
    if (!Array.isArray(property)) {
      return;
    }
    var hint = property.length;
    {
      var arraySyncGroup = propertyInputRecord.arraySyncGroup;
      if (arraySyncGroup) {
        this._insertInputInArraySyncGroup(graph, node, arraySyncGroup, property.length, hint);
        return;
      }
    }
    insertPoseGraphNodeArrayElement(graph, node, [propertyKey, hint], createDefaultInputValueByType(propertyInputRecord.type));
  };
  _proto._getPropertyNodeInputRecord = function _getPropertyNodeInputRecord(constructor, propertyKey) {
    if (!constructor) {
      return undefined;
    }
    var classInputRecord = this._classInputMap.get(constructor);
    if (classInputRecord) {
      var record = classInputRecord.properties[propertyKey];
      if (record) {
        return record;
      }
    }
    return this._getPropertyNodeInputRecord(getSuper(constructor), propertyKey);
  };
  _proto._insertInputInArraySyncGroup = function _insertInputInArraySyncGroup(graph, node, syncGroup, expectedOriginalSyncLength, insertHint) {
    for (var iGroupMember = 0; iGroupMember < syncGroup.members.length; ++iGroupMember) {
      var syncedPropertyKey = syncGroup.members[iGroupMember];
      var syncedPropertyInputRecord = this._getPropertyNodeInputRecord(node.constructor, syncedPropertyKey);
      assertIsTrue(syncedPropertyInputRecord);
      var syncedProperty = node[syncedPropertyKey];
      if (!Array.isArray(syncedProperty) || syncedProperty.length !== expectedOriginalSyncLength) {
        continue;
      }
      insertPoseGraphNodeArrayElement(graph, node, [syncedPropertyKey, insertHint], createDefaultInputValueByType(syncedPropertyInputRecord.type));
    }
  };
  _proto._deleteInputInArraySyncGroup = function _deleteInputInArraySyncGroup(graph, node, syncGroup, expectedOriginalSyncLength, index) {
    for (var iGroupMember = 0; iGroupMember < syncGroup.members.length; ++iGroupMember) {
      var syncedPropertyKey = syncGroup.members[iGroupMember];
      var syncedPropertyInputRecord = this._getPropertyNodeInputRecord(node.constructor, syncedPropertyKey);
      assertIsTrue(syncedPropertyInputRecord);
      var syncedProperty = node[syncedPropertyKey];
      if (!Array.isArray(syncedProperty) || syncedProperty.length !== expectedOriginalSyncLength) {
        continue;
      }
      deletePoseGraphNodeArrayElement(graph, node, [syncedPropertyKey, index]);
    }
  };
  return PoseGraphNodeInputManager;
}();
function insertPoseGraphNodeArrayElement(graph, node, inputKey, value) {
  var shell = graph.getShell(node);
  if (!shell) {
    throw new OperationOnFreestandingNodeError(node);
  }
  var propertyKey = inputKey[0],
    _inputKey$ = inputKey[1],
    elementIndex = _inputKey$ === void 0 ? -1 : _inputKey$;
  var property = node[propertyKey];
  if (!Array.isArray(property)) {
    return;
  }
  property.splice(elementIndex, 0, value);
  shell.moveArrayElementBindingForward(propertyKey, elementIndex + 1, false);
}
function deletePoseGraphNodeArrayElement(graph, node, inputKey) {
  var shell = graph.getShell(node);
  if (!shell) {
    throw new OperationOnFreestandingNodeError(node);
  }
  var propertyKey = inputKey[0],
    _inputKey$2 = inputKey[1],
    elementIndex = _inputKey$2 === void 0 ? -1 : _inputKey$2;
  var property = node[propertyKey];
  if (!Array.isArray(property)) {
    return;
  }
  if (elementIndex < 0 || elementIndex >= property.length) {
    return;
  }
  shell.deleteBinding(inputKey);
  property.splice(elementIndex, 1);
  shell.moveArrayElementBindingForward(propertyKey, elementIndex + 1, true);
}
function createDefaultInputValueByType(type) {
  switch (type) {
    default:
      assertIsTrue(false);
    case PoseGraphType.FLOAT:
    case PoseGraphType.INTEGER:
      return 0;
    case PoseGraphType.BOOLEAN:
      return false;
    case PoseGraphType.POSE:
      return null;
    case PoseGraphType.VEC3:
      return new Vec3();
    case PoseGraphType.QUAT:
      return new Quat();
  }
}
var globalPoseGraphNodeInputManager = new PoseGraphNodeInputManager();

var _Transform;
var CACHE_VECTOR_A = new Vec3();
var CACHE_VECTOR_B = new Vec3();
var CACHE_QUAT_A = new Quat();
new Quat();
var Transform = function () {
  function Transform() {
    this._position = new Vec3();
    this._rotation = new Quat();
    this._scale = Vec3.clone(Vec3.ONE);
  }
  Transform.clone = function clone(src) {
    var transform = new Transform();
    Transform.copy(transform, src);
    return transform;
  };
  Transform.setIdentity = function setIdentity(out) {
    Vec3.copy(out._position, Vec3.ZERO);
    Quat.copy(out._rotation, Quat.IDENTITY);
    Vec3.copy(out._scale, Vec3.ONE);
    return out;
  };
  Transform.copy = function copy(out, src) {
    Vec3.copy(out._position, src._position);
    Quat.copy(out._rotation, src._rotation);
    Vec3.copy(out._scale, src._scale);
    return out;
  };
  Transform.equals = function equals(a, b, epsilon) {
    return Vec3.equals(a._position, b._position, epsilon) && Quat.equals(a._rotation, b._rotation, epsilon) && Vec3.equals(a._scale, b._scale, epsilon);
  };
  Transform.strictEquals = function strictEquals(a, b) {
    return Vec3.strictEquals(a._position, b._position) && Quat.strictEquals(a._rotation, b._rotation) && Vec3.strictEquals(a._scale, b._scale);
  };
  Transform.lerp = function lerp(out, from, to, t) {
    if (t === 0.0) {
      return Transform.copy(out, from);
    }
    if (t === 1.0) {
      return Transform.copy(out, to);
    }
    Vec3.lerp(out._position, from._position, to._position, t);
    Quat.slerp(out._rotation, from._rotation, to._rotation, t);
    Vec3.lerp(out._scale, from._scale, to._scale, t);
    return out;
  };
  Transform.multiply = function multiply(out, second, first) {
    var cacheRotation = Quat.multiply(CACHE_QUAT_A, second._rotation, first._rotation);
    var cacheScale = Vec3.multiply(CACHE_VECTOR_A, first._scale, second._scale);
    var cachePosition = Vec3.multiply(CACHE_VECTOR_B, first._position, second._scale);
    Vec3.transformQuat(cachePosition, cachePosition, second._rotation);
    Vec3.add(cachePosition, cachePosition, second._position);
    Vec3.copy(out._position, cachePosition);
    Quat.copy(out._rotation, cacheRotation);
    Vec3.copy(out._scale, cacheScale);
    return out;
  };
  Transform.invert = function invert(out, transform) {
    var invRotation = out._rotation,
      invScale = out._scale,
      invPosition = out._position;
    Quat.invert(invRotation, transform._rotation);
    invScaleOrZero(invScale, transform._scale, EPSILON);
    Vec3.negate(invPosition, transform._position);
    Vec3.multiply(invPosition, invPosition, invScale);
    Vec3.transformQuat(invPosition, invPosition, invRotation);
    return out;
  };
  Transform.fromMatrix = function fromMatrix(out, matrix) {
    Mat4.toSRT(matrix, out._rotation, out._position, out._scale);
    return out;
  };
  Transform.toMatrix = function toMatrix(out, transform) {
    return Mat4.fromSRT(out, transform._rotation, transform._position, transform._scale);
  };
  return _createClass(Transform, [{
    key: "position",
    get: function get() {
      return this._position;
    },
    set: function set(value) {
      Vec3.copy(this._position, value);
    }
  }, {
    key: "rotation",
    get: function get() {
      return this._rotation;
    },
    set: function set(value) {
      Quat.copy(this._rotation, value);
    }
  }, {
    key: "scale",
    get: function get() {
      return this._scale;
    },
    set: function set(value) {
      Vec3.copy(this._scale, value);
    }
  }]);
}();
_Transform = Transform;
Transform.IDENTITY = Object.freeze(new _Transform());
Transform.ZERO = Object.freeze(function () {
  var transform = new _Transform();
  Vec3.copy(transform._position, Vec3.ZERO);
  Quat.set(transform._rotation, 0.0, 0.0, 0.0, 0.0);
  Vec3.copy(transform._scale, Vec3.ZERO);
  return transform;
}());
Transform.calculateRelative = function () {
  var cacheInvRotation = new Quat();
  var cacheInvScale = new Vec3();
  return function (out, first, second) {
    var invSecondRotation = Quat.invert(cacheInvRotation, second._rotation);
    var invScale = invScaleOrZero(cacheInvScale, second._scale, EPSILON);
    var cachePosition = Vec3.subtract(CACHE_VECTOR_B, first._position, second._position);
    Vec3.transformQuat(cachePosition, cachePosition, invSecondRotation);
    Vec3.multiply(cachePosition, cachePosition, invScale);
    Vec3.copy(out._position, cachePosition);
    Quat.multiply(out._rotation, invSecondRotation, first._rotation);
    Vec3.multiply(out._scale, first._scale, invScale);
    return out;
  };
}();
function invScaleOrZero(out, scale, epsilon) {
  var x = scale.x,
    y = scale.y,
    z = scale.z;
  return Vec3.set(out, Math.abs(x) <= epsilon ? 0.0 : 1.0 / x, Math.abs(y) <= epsilon ? 0.0 : 1.0 / y, Math.abs(z) <= epsilon ? 0.0 : 1.0 / z);
}
function __calculateDeltaTransform(out, target, base) {
  Vec3.subtract(out.position, target.position, base.position);
  deltaQuat(out.rotation, base.rotation, target.rotation);
  Vec3.subtract(out.scale, target.scale, base.scale);
  return out;
}
var __applyDeltaTransform = function () {
  var cacheQuat = new Quat();
  return function (out, base, delta, alpha) {
    Vec3.scaleAndAdd(out.position, base.position, delta.position, alpha);
    var weightedDeltaRotation = Quat.slerp(cacheQuat, Quat.IDENTITY, delta.rotation, alpha);
    Quat.multiply(out.rotation, weightedDeltaRotation, base.rotation);
    Vec3.scaleAndAdd(out.scale, base.scale, delta.scale, alpha);
    return out;
  };
}();
var deltaQuat = function () {
  var quatMultiInvInverseCache = new Quat();
  return function (out, from, to) {
    var fromInv = Quat.invert(quatMultiInvInverseCache, from);
    return Quat.multiply(out, to, fromInv);
  };
}();
var ZERO_DELTA_TRANSFORM = Object.freeze(function () {
  var transform = new Transform();
  transform.position = Vec3.ZERO;
  transform.rotation = Quat.IDENTITY;
  transform.scale = Vec3.ZERO;
  return transform;
}());

var Pose = function () {
  function Pose(transforms, auxiliaryCurves) {
    this.transforms = void 0;
    this.auxiliaryCurves = void 0;
    this._poseTransformSpace = PoseTransformSpace.LOCAL;
    this.transforms = transforms;
    this.auxiliaryCurves = auxiliaryCurves;
  }
  Pose._create = function _create(transforms, auxiliaryCurves) {
    return new Pose(transforms, auxiliaryCurves);
  };
  return Pose;
}();
var PoseTransformSpace;
(function (PoseTransformSpace) {
  PoseTransformSpace[PoseTransformSpace["LOCAL"] = 0] = "LOCAL";
  PoseTransformSpace[PoseTransformSpace["COMPONENT"] = 1] = "COMPONENT";
})(PoseTransformSpace || (PoseTransformSpace = {}));
var TransformFilter = function () {
  function TransformFilter(involvedTransforms) {
    {
      assertIsTrue(involvedTransforms.every(function (transformIndex) {
        return transformIndex < Math.pow(2, 16);
      }), 'The number of transforms exceeds the max allowed(2 ** 16)');
    }
    this._involvedTransforms = new Uint16Array(involvedTransforms);
  }
  return _createClass(TransformFilter, [{
    key: "involvedTransforms",
    get: function get() {
      return this._involvedTransforms;
    }
  }]);
}();
function blendPoseInto(target, source, alpha, transformFilter) {
  if (transformFilter === void 0) {
    transformFilter = undefined;
  }
  blendTransformsInto(target.transforms, source.transforms, alpha, transformFilter);
  blendAuxiliaryCurvesInto(target.auxiliaryCurves, source.auxiliaryCurves, alpha);
}
function blendTransformsInto(target, source, alpha, transformFilter) {
  if (transformFilter === void 0) {
    transformFilter = undefined;
  }
  var nTransforms = target.length;
  assertIsTrue(nTransforms === target.length);
  if (alpha === 0) {
    return;
  } else if (alpha === 1) {
    if (!transformFilter) {
      target.set(source);
    } else {
      copyTransformsWithFilter(target, source, transformFilter);
    }
    return;
  }
  if (!transformFilter) {
    for (var iTransform = 0; iTransform < nTransforms; ++iTransform) {
      blendIntoTransformArrayAt(target, source, alpha, iTransform);
    }
  } else {
    for (var index = 0; index < transformFilter.involvedTransforms.length; ++index) {
      var involvedTransformIndex = transformFilter.involvedTransforms[index];
      blendIntoTransformArrayAt(target, source, alpha, involvedTransformIndex);
    }
  }
}
function copyTransformsWithFilter(target, source, filter) {
  var nTransforms = target.length;
  assertIsTrue(nTransforms === target.length);
  for (var index = 0; index < filter.involvedTransforms.length; ++index) {
    var involvedTransformIndex = filter.involvedTransforms[index];
    target.copyRange(involvedTransformIndex, source, involvedTransformIndex, 1);
  }
}
var blendIntoTransformArrayAt = function () {
  var cacheTransformSource = new Transform();
  var cacheTransformTarget = new Transform();
  return function (target, source, alpha, transformIndex) {
    var transformTarget = target.getTransform(transformIndex, cacheTransformTarget);
    var transformSource = source.getTransform(transformIndex, cacheTransformSource);
    Transform.lerp(transformTarget, transformTarget, transformSource, alpha);
    target.setTransform(transformIndex, transformTarget);
  };
}();
function blendAuxiliaryCurvesInto(target, source, alpha) {
  var nValues = source.length;
  assertIsTrue(nValues === target.length);
  for (var iValue = 0; iValue < nValues; ++iValue) {
    target[iValue] = lerp(target[iValue], source[iValue], alpha);
  }
}
function calculateDeltaPose(target, base) {
  calculateDeltaTransforms(target.transforms, base.transforms);
  calculateDeltaAuxiliaryCurves(target.auxiliaryCurves, base.auxiliaryCurves);
}
var calculateDeltaTransformArrayAt = function () {
  var cacheTransformBase = new Transform();
  var cacheTransformTarget = new Transform();
  return function (target, base, transformIndex) {
    var baseTransform = base.getTransform(transformIndex, cacheTransformBase);
    var targetTransform = target.getTransform(transformIndex, cacheTransformTarget);
    __calculateDeltaTransform(targetTransform, targetTransform, baseTransform);
    target.setTransform(transformIndex, targetTransform);
  };
}();
function calculateDeltaTransforms(target, base) {
  var nTransforms = target.length;
  assertIsTrue(nTransforms === base.length);
  for (var iTransform = 0; iTransform < nTransforms; ++iTransform) {
    calculateDeltaTransformArrayAt(target, base, iTransform);
  }
}
function calculateDeltaAuxiliaryCurves(target, base) {
  var nAuxiliaryCurves = target.length;
  assertIsTrue(nAuxiliaryCurves === base.length);
  for (var i = 0; i < target.length; ++i) {
    target[i] -= base[i];
  }
}
function applyDeltaPose(target, base, alpha, transformFilter) {
  if (transformFilter === void 0) {
    transformFilter = undefined;
  }
  applyDeltaTransforms(target.transforms, base.transforms, alpha, transformFilter);
  applyDeltaAuxiliaryCurves(target.auxiliaryCurves, base.auxiliaryCurves, alpha);
}
var applyDeltaTransformArrayAt = function () {
  var cacheTransformDelta = new Transform();
  var cacheTransformTarget = new Transform();
  return function (target, delta, alpha, transformIndex) {
    var deltaTransform = delta.getTransform(transformIndex, cacheTransformDelta);
    var targetTransform = target.getTransform(transformIndex, cacheTransformTarget);
    __applyDeltaTransform(targetTransform, targetTransform, deltaTransform, alpha);
    target.setTransform(transformIndex, targetTransform);
  };
}();
function applyDeltaTransforms(target, delta, alpha, transformFilter) {
  if (transformFilter === void 0) {
    transformFilter = undefined;
  }
  var nTransforms = target.length;
  assertIsTrue(nTransforms === delta.length);
  if (!transformFilter) {
    for (var iTransform = 0; iTransform < nTransforms; ++iTransform) {
      applyDeltaTransformArrayAt(target, delta, alpha, iTransform);
    }
  } else {
    for (var index = 0; index < transformFilter.involvedTransforms.length; ++index) {
      var _transformIndex = transformFilter.involvedTransforms[index];
      applyDeltaTransformArrayAt(target, delta, alpha, _transformIndex);
    }
  }
}
function applyDeltaAuxiliaryCurves(target, delta, alpha) {
  var nAuxiliaryCurves = target.length;
  assertIsTrue(nAuxiliaryCurves === delta.length);
  for (var i = 0; i < target.length; ++i) {
    target[i] += delta[i] * alpha;
  }
}

var _dec$G, _class$H;
var PoseTransformSpaceRequirement;
(function (PoseTransformSpaceRequirement) {
  PoseTransformSpaceRequirement[PoseTransformSpaceRequirement["NO"] = 0] = "NO";
  PoseTransformSpaceRequirement[PoseTransformSpaceRequirement["LOCAL"] = 1] = "LOCAL";
  PoseTransformSpaceRequirement[PoseTransformSpaceRequirement["COMPONENT"] = 2] = "COMPONENT";
})(PoseTransformSpaceRequirement || (PoseTransformSpaceRequirement = {}));
ccenum(PoseTransformSpaceRequirement);
var PoseNode = (_dec$G = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNode"), _dec$G(_class$H = function (_PoseGraphNode) {
  function PoseNode() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseGraphNode.call.apply(_PoseGraphNode, [this].concat(args)) || this;
    _this._dependencyEvaluation = undefined;
    return _this;
  }
  _inheritsLoose(PoseNode, _PoseGraphNode);
  var _proto = PoseNode.prototype;
  _proto.update = function update(context) {
    var _this$_dependencyEval;
    (_this$_dependencyEval = this._dependencyEvaluation) == null ? void 0 : _this$_dependencyEval.evaluate();
    this.doUpdate(context);
  };
  _proto.evaluate = function evaluate(context, poseTransformSpaceRequirement) {
    var pose = this.doEvaluate(context);
    var currentSpace = pose._poseTransformSpace;
    switch (poseTransformSpaceRequirement) {
      default:
        assertIsTrue(false);
      case PoseTransformSpaceRequirement.NO:
        break;
      case PoseTransformSpaceRequirement.LOCAL:
        {
          if (currentSpace === PoseTransformSpace.COMPONENT) {
            context._poseTransformsSpaceComponentToLocal(pose);
          }
          assertIsTrue(pose._poseTransformSpace === PoseTransformSpace.LOCAL);
          break;
        }
      case PoseTransformSpaceRequirement.COMPONENT:
        {
          if (currentSpace === PoseTransformSpace.LOCAL) {
            context._poseTransformsSpaceLocalToComponent(pose);
          }
          assertIsTrue(pose._poseTransformSpace === PoseTransformSpace.COMPONENT);
          break;
        }
    }
    return pose;
  };
  PoseNode.evaluateDefaultPose = function evaluateDefaultPose(context, poseTransformSpaceRequirement) {
    switch (poseTransformSpaceRequirement) {
      default:
        assertIsTrue(false);
      case PoseTransformSpaceRequirement.NO:
      case PoseTransformSpaceRequirement.LOCAL:
        return context.pushDefaultedPose();
      case PoseTransformSpaceRequirement.COMPONENT:
        return context.pushDefaultedPoseInComponentSpace();
    }
  };
  _proto._setDependencyEvaluation = function _setDependencyEvaluation(dependency) {
    this._dependencyEvaluation = dependency;
  };
  _proto._forceEvaluateEvaluation = function _forceEvaluateEvaluation() {
    var _this$_dependencyEval2;
    (_this$_dependencyEval2 = this._dependencyEvaluation) == null ? void 0 : _this$_dependencyEval2.evaluate();
  };
  return PoseNode;
}(PoseGraphNode)) || _class$H);

var PureValueNode = function (_PoseGraphNode) {
  function PureValueNode(outputTypes) {
    var _this;
    _this = _PoseGraphNode.call(this) || this;
    _this._outputTypes = [];
    _this._outputTypes = outputTypes;
    return _this;
  }
  _inheritsLoose(PureValueNode, _PoseGraphNode);
  var _proto = PureValueNode.prototype;
  _proto.getOutputType = function getOutputType(outputIndex) {
    return this._outputTypes[outputIndex];
  };
  _proto.link = function link(context) {};
  return _createClass(PureValueNode, [{
    key: "outputCount",
    get: function get() {
      return this._outputTypes.length;
    }
  }]);
}(PoseGraphNode);
var SingleOutputPVNode = function (_PureValueNode2) {
  function SingleOutputPVNode(outputType) {
    return _PureValueNode2.call(this, [outputType]) || this;
  }
  _inheritsLoose(SingleOutputPVNode, _PureValueNode2);
  var _proto2 = SingleOutputPVNode.prototype;
  _proto2.selfEvaluate = function selfEvaluate(outputs) {
    outputs[0] = this.selfEvaluateDefaultOutput();
  };
  return SingleOutputPVNode;
}(PureValueNode);

function input(options) {
  return function (target, propertyKey) {
    var targetConstructor = target.constructor;
    if (options.type === PoseGraphType.POSE) {
      if (!isChildClassOf(targetConstructor, PoseNode)) {
        error("@input specifying pose input can be only applied to fields of subclasses of PoseNode.");
        return;
      }
    }
    if (!isChildClassOf(targetConstructor, PoseNode) && !isChildClassOf(targetConstructor, PureValueNode)) {
      error("@input can be only applied to fields of subclasses of PoseNode or PureValueNode.");
      return;
    }
    inputUnchecked(options)(target, propertyKey);
  };
}
function inputUnchecked(options) {
  return function (target, propertyKey) {
    if (typeof propertyKey !== 'string') {
      error("@input can be only applied to string-named fields.");
      return;
    }
    var targetConstructor = target.constructor;
    globalPoseGraphNodeInputManager.setPropertyNodeInputRecord(targetConstructor, propertyKey, options);
    var propertyStash = getOrCreatePropertyStash(target, propertyKey);
    propertyStash.__internalFlags |= PropertyStashInternalFlag.STANDALONE | PropertyStashInternalFlag.IMPLICIT_VISIBLE;
  };
}

var _dec$F, _dec2$y, _dec3$o, _class$G, _class2$z, _descriptor$a;
var PoseGraphOutputNode = (_dec$F = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseGraphOutputNode"), _dec2$y = poseGraphNodeAppearance({
  themeColor: '#CD3A58',
  inline: true
}), _dec3$o = inputUnchecked({
  type: PoseGraphType.POSE
}), _dec$F(_class$G = _dec2$y(_class$G = (_class2$z = function (_PoseGraphNode) {
  function PoseGraphOutputNode() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseGraphNode.call.apply(_PoseGraphNode, [this].concat(args)) || this;
    _initializerDefineProperty(_this, "pose", _descriptor$a, _this);
    return _this;
  }
  _inheritsLoose(PoseGraphOutputNode, _PoseGraphNode);
  return PoseGraphOutputNode;
}(PoseGraphNode), _descriptor$a = _applyDecoratedDescriptor(_class2$z.prototype, "pose", [serializable$d, _dec3$o], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return null;
  }
}), _class2$z)) || _class$G) || _class$G);

var _dec$E, _class$F, _class2$y, _initializer$s, _initializer2$k, _initializer3$b, _initializer4$7;
var PoseGraph = (_dec$E = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseGraph"), _dec$E(_class$F = (_class2$y = function (_EditorExtendable) {
  function PoseGraph() {
    var _this;
    _this = _EditorExtendable.call(this) || this;
    _this._outputNode = _initializer$s && _initializer$s();
    _this._nodes = _initializer2$k && _initializer2$k();
    _this._shells = _initializer3$b && _initializer3$b();
    _this._shellMap = _initializer4$7 && _initializer4$7();
    _this.addNode(_this._outputNode);
    return _this;
  }
  _inheritsLoose(PoseGraph, _EditorExtendable);
  var _proto = PoseGraph.prototype;
  _proto.__callOnAfterDeserializeRecursive = function __callOnAfterDeserializeRecursive() {
    assertIsTrue(this._nodes.length === this._shells.length);
    for (var iNode = 0; iNode < this._nodes.length; ++iNode) {
      var node = this._nodes[iNode];
      var shell = this._shells[iNode];
      this._shellMap.set(node, shell);
      node.__callOnAfterDeserializeRecursive == null ? void 0 : node.__callOnAfterDeserializeRecursive();
    }
  };
  _proto.nodes = function nodes() {
    return this._nodes.values();
  };
  _proto.addNode = function addNode(node) {
    if (this._shellMap.has(node)) {
      throw new AddNonFreestandingNodeError(node);
    }
    var shell = new PoseGraphNodeShell();
    this._shells.push(shell);
    this._nodes.push(node);
    this._shellMap.set(node, shell);
    return node;
  };
  _proto.removeNode = function removeNode(removal) {
    if (removal === this._outputNode) {
      error("Can not remove the output node.");
      return;
    }
    var nodeIndex = this._nodes.indexOf(removal);
    if (nodeIndex < 0) {
      return;
    }
    assertIsTrue(this._shellMap.has(removal));
    for (var _iterator = _createForOfIteratorHelperLoose(this._shells), _step; !(_step = _iterator()).done;) {
      var shell = _step.value;
      shell.deleteBindingTo(removal);
    }
    removeAt(this._shells, nodeIndex);
    removeAt(this._nodes, nodeIndex);
    this._shellMap["delete"](removal);
  };
  _proto.getShell = function getShell(node) {
    return this._shellMap.get(node);
  };
  return _createClass(PoseGraph, [{
    key: "outputNode",
    get: function get() {
      return this._outputNode;
    }
  }]);
}(EditorExtendable), _initializer$s = applyDecoratedInitializer(_class2$y.prototype, "_outputNode", [serializable$d], function () {
  return new PoseGraphOutputNode();
}), _initializer2$k = applyDecoratedInitializer(_class2$y.prototype, "_nodes", [serializable$d], function () {
  return [];
}), _initializer3$b = applyDecoratedInitializer(_class2$y.prototype, "_shells", [serializable$d], function () {
  return [];
}), _initializer4$7 = applyDecoratedInitializer(_class2$y.prototype, "_shellMap", [serializable$d], function () {
  return new Map();
}), _class2$y)) || _class$F);

var _dec$D, _class$E, _class2$x, _initializer$r, _initializer2$j, _initializer3$a, _dec2$x, _class3$9, _class4$9, _initializer4$6, _initializer5$4, _initializer6$1, _initializer7$1, _dec3$n, _class5$2, _class6$2, _initializer8$1, _initializer9, _initializer0, _initializer1, _dec4$g, _class7$1, _dec5$b, _class8, _class9, _initializer10, _dec6$8, _class0, _class1, _initializer11, _initializer12, _initializer13, _dec7$5, _class10, _class11, _initializer14, _dec8$3, _class12, _class13, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _dec9$2, _class14, _class15, _initializer20, _dec0$1, _class16, _class17, _initializer21, _dec1$1, _class18, _class19, _initializer22, _initializer23, _initializer24, _initializer25, _initializer26, _initializer27, _dec10$1, _class20, _class21, _initializer28, _initializer29;
var Transition = (_dec$D = ccclass$g(CLASS_NAME_PREFIX_ANIM + "Transition"), _dec$D(_class$E = (_class2$x = function (_EditorExtendable) {
  function Transition(from, to, conditions) {
    var _this;
    _this = _EditorExtendable.call(this) || this;
    _this.from = _initializer$r && _initializer$r();
    _this.to = _initializer2$j && _initializer2$j();
    _this.conditions = _initializer3$a && _initializer3$a();
    _this[ownerSymbol] = void 0;
    _this.from = from;
    _this.to = to;
    if (conditions) {
      _this.conditions = conditions;
    }
    return _this;
  }
  _inheritsLoose(Transition, _EditorExtendable);
  var _proto = Transition.prototype;
  _proto.copyTo = function copyTo(that) {
    that.conditions = this.conditions.map(function (condition) {
      return condition.clone();
    });
  };
  return Transition;
}(EditorExtendable), _initializer$r = applyDecoratedInitializer(_class2$x.prototype, "from", [serializable$d], null), _initializer2$j = applyDecoratedInitializer(_class2$x.prototype, "to", [serializable$d], null), _initializer3$a = applyDecoratedInitializer(_class2$x.prototype, "conditions", [serializable$d], function () {
  return [];
}), _class2$x)) || _class$E);
var DurationalTransition = (_dec2$x = ccclass$g(CLASS_NAME_PREFIX_ANIM + "DurationalTransition"), _dec2$x(_class3$9 = (_class4$9 = function (_Transition2) {
  function DurationalTransition() {
    var _this2;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this2 = _Transition2.call.apply(_Transition2, [this].concat(args)) || this;
    _this2.destinationStart = _initializer4$6 && _initializer4$6();
    _this2.relativeDestinationStart = _initializer5$4 && _initializer5$4();
    _this2.startEventBinding = _initializer6$1 && _initializer6$1();
    _this2.endEventBinding = _initializer7$1 && _initializer7$1();
    _this2[ownerSymbol] = void 0;
    return _this2;
  }
  _inheritsLoose(DurationalTransition, _Transition2);
  var _proto2 = DurationalTransition.prototype;
  _proto2.copyTo = function copyTo(that) {
    _Transition2.prototype.copyTo.call(this, that);
    that.destinationStart = this.destinationStart;
    that.relativeDestinationStart = this.relativeDestinationStart;
    this.startEventBinding.copyTo(that.startEventBinding);
    this.endEventBinding.copyTo(that.endEventBinding);
  };
  return DurationalTransition;
}(Transition), _initializer4$6 = applyDecoratedInitializer(_class4$9.prototype, "destinationStart", [serializable$d], function () {
  return 0.0;
}), _initializer5$4 = applyDecoratedInitializer(_class4$9.prototype, "relativeDestinationStart", [serializable$d], function () {
  return false;
}), _initializer6$1 = applyDecoratedInitializer(_class4$9.prototype, "startEventBinding", [serializable$d], function () {
  return new AnimationGraphEventBinding();
}), _initializer7$1 = applyDecoratedInitializer(_class4$9.prototype, "endEventBinding", [serializable$d], function () {
  return new AnimationGraphEventBinding();
}), _class4$9)) || _class3$9);
var AnimationTransition = (_dec3$n = ccclass$g(CLASS_NAME_PREFIX_ANIM + "AnimationTransition"), _dec3$n(_class5$2 = (_class6$2 = function (_DurationalTransition2) {
  function AnimationTransition() {
    var _this3;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    _this3 = _DurationalTransition2.call.apply(_DurationalTransition2, [this].concat(args)) || this;
    _this3.duration = _initializer8$1 && _initializer8$1();
    _this3.relativeDuration = _initializer9 && _initializer9();
    _this3.exitConditionEnabled = _initializer0 && _initializer0();
    _this3._exitCondition = _initializer1 && _initializer1();
    return _this3;
  }
  _inheritsLoose(AnimationTransition, _DurationalTransition2);
  var _proto3 = AnimationTransition.prototype;
  _proto3.copyTo = function copyTo(that) {
    _DurationalTransition2.prototype.copyTo.call(this, that);
    that.duration = this.duration;
    that.relativeDuration = this.relativeDuration;
    that.exitConditionEnabled = this.exitConditionEnabled;
    that.exitCondition = this.exitCondition;
  };
  return _createClass(AnimationTransition, [{
    key: "exitCondition",
    get: function get() {
      return this._exitCondition;
    },
    set: function set(value) {
      assertIsTrue(value >= 0.0);
      this._exitCondition = value;
    }
  }]);
}(DurationalTransition), _initializer8$1 = applyDecoratedInitializer(_class6$2.prototype, "duration", [serializable$d], function () {
  return 0.3;
}), _initializer9 = applyDecoratedInitializer(_class6$2.prototype, "relativeDuration", [serializable$d], function () {
  return false;
}), _initializer0 = applyDecoratedInitializer(_class6$2.prototype, "exitConditionEnabled", [serializable$d], function () {
  return true;
}), _initializer1 = applyDecoratedInitializer(_class6$2.prototype, "_exitCondition", [serializable$d], function () {
  return 1.0;
}), _class6$2)) || _class5$2);
function isAnimationTransition(transition) {
  return transition instanceof AnimationTransition;
}
var EmptyState = (_dec4$g = ccclass$g(CLASS_NAME_PREFIX_ANIM + "EmptyState"), _dec4$g(_class7$1 = function (_State) {
  function EmptyState() {
    return _State.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyState, _State);
  return EmptyState;
}(State)) || _class7$1);
var EmptyStateTransition = (_dec5$b = ccclass$g(CLASS_NAME_PREFIX_ANIM + "EmptyStateTransition"), _dec5$b(_class8 = (_class9 = function (_DurationalTransition3) {
  function EmptyStateTransition() {
    var _this4;
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    _this4 = _DurationalTransition3.call.apply(_DurationalTransition3, [this].concat(args)) || this;
    _this4.duration = _initializer10 && _initializer10();
    return _this4;
  }
  _inheritsLoose(EmptyStateTransition, _DurationalTransition3);
  var _proto4 = EmptyStateTransition.prototype;
  _proto4.copyTo = function copyTo(that) {
    _DurationalTransition3.prototype.copyTo.call(this, that);
    that.duration = this.duration;
  };
  return EmptyStateTransition;
}(DurationalTransition), _initializer10 = applyDecoratedInitializer(_class9.prototype, "duration", [serializable$d], function () {
  return 0.3;
}), _class9)) || _class8);
var ProceduralPoseState = (_dec6$8 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "ProceduralPoseState"), _dec6$8(_class0 = (_class1 = function (_State2) {
  function ProceduralPoseState() {
    var _this5;
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    _this5 = _State2.call.apply(_State2, [this].concat(args)) || this;
    _this5.graph = _initializer11 && _initializer11();
    _this5.transitionInEventBinding = _initializer12 && _initializer12();
    _this5.transitionOutEventBinding = _initializer13 && _initializer13();
    return _this5;
  }
  _inheritsLoose(ProceduralPoseState, _State2);
  var _proto5 = ProceduralPoseState.prototype;
  _proto5.__callOnAfterDeserializeRecursive = function __callOnAfterDeserializeRecursive() {
    this.graph.__callOnAfterDeserializeRecursive();
  };
  _proto5.copyTo = function copyTo(that) {
    _State2.prototype.copyTo.call(this, that);
    this.transitionInEventBinding.copyTo(that.transitionInEventBinding);
    this.transitionOutEventBinding.copyTo(that.transitionOutEventBinding);
    return this;
  };
  return ProceduralPoseState;
}(State), _initializer11 = applyDecoratedInitializer(_class1.prototype, "graph", [serializable$d], function () {
  return new PoseGraph();
}), _initializer12 = applyDecoratedInitializer(_class1.prototype, "transitionInEventBinding", [serializable$d], function () {
  return new AnimationGraphEventBinding();
}), _initializer13 = applyDecoratedInitializer(_class1.prototype, "transitionOutEventBinding", [serializable$d], function () {
  return new AnimationGraphEventBinding();
}), _class1)) || _class0);
var ProceduralPoseState_ = createInstanceofProxy(ProceduralPoseState);
var ProceduralPoseTransition = (_dec7$5 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "ProceduralPoseTransition"), _dec7$5(_class10 = (_class11 = function (_DurationalTransition4) {
  function ProceduralPoseTransition() {
    var _this6;
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }
    _this6 = _DurationalTransition4.call.apply(_DurationalTransition4, [this].concat(args)) || this;
    _this6.duration = _initializer14 && _initializer14();
    return _this6;
  }
  _inheritsLoose(ProceduralPoseTransition, _DurationalTransition4);
  var _proto6 = ProceduralPoseTransition.prototype;
  _proto6.copyTo = function copyTo(that) {
    _DurationalTransition4.prototype.copyTo.call(this, that);
    that.duration = this.duration;
  };
  return ProceduralPoseTransition;
}(DurationalTransition), _initializer14 = applyDecoratedInitializer(_class11.prototype, "duration", [serializable$d], function () {
  return 0.3;
}), _class11)) || _class10);
var ProceduralPoseTransition_ = createInstanceofProxy(ProceduralPoseTransition);
var StateMachine = (_dec8$3 = ccclass$g('cc.animation.StateMachine'), _dec8$3(_class12 = (_class13 = function (_EditorExtendable2) {
  function StateMachine(allowEmptyStates) {
    var _this7;
    _this7 = _EditorExtendable2.call(this) || this;
    _this7._states = _initializer15 && _initializer15();
    _this7._transitions = _initializer16 && _initializer16();
    _this7._entryState = _initializer17 && _initializer17();
    _this7._exitState = _initializer18 && _initializer18();
    _this7._anyState = _initializer19 && _initializer19();
    _this7._allowEmptyStates = true;
    _this7._allowEmptyStates = allowEmptyStates !== null && allowEmptyStates !== void 0 ? allowEmptyStates : false;
    _this7._entryState = _this7._addState(new State());
    _this7._entryState.name = 'Entry';
    _this7._exitState = _this7._addState(new State());
    _this7._exitState.name = 'Exit';
    _this7._anyState = _this7._addState(new State());
    _this7._anyState.name = 'Any';
    return _this7;
  }
  _inheritsLoose(StateMachine, _EditorExtendable2);
  var _proto7 = StateMachine.prototype;
  _proto7.__callOnAfterDeserializeRecursive = function __callOnAfterDeserializeRecursive() {
    this[onAfterDeserializedTag]();
    var nStates = this._states.length;
    for (var iState = 0; iState < nStates; ++iState) {
      var state = this._states[iState];
      if (state instanceof SubStateMachine) {
        state.stateMachine.__callOnAfterDeserializeRecursive();
      } else if (state instanceof ProceduralPoseState) {
        state.__callOnAfterDeserializeRecursive();
      } else if (state instanceof MotionState) {
        state.__callOnAfterDeserializeRecursive();
      }
    }
  };
  _proto7[onAfterDeserializedTag] = function () {
    var _this8 = this;
    this._states.forEach(function (state) {
      return own(state, _this8);
    });
    this._transitions.forEach(function (transition) {
      transition.from[outgoingsSymbol].push(transition);
      transition.to[incomingsSymbol].push(transition);
    });
  };
  _proto7.states = function states() {
    return this._states;
  };
  _proto7.transitions = function transitions() {
    return this._transitions;
  };
  _proto7.getTransitionsBetween = function getTransitionsBetween(from, to) {
    assertsOwnedBy(from, this);
    assertsOwnedBy(to, this);
    return from[outgoingsSymbol].filter(function (transition) {
      return transition.to === to;
    });
  };
  _proto7.getOutgoings = function getOutgoings(from) {
    assertsOwnedBy(from, this);
    return from[outgoingsSymbol];
  };
  _proto7.getIncomings = function getIncomings(to) {
    assertsOwnedBy(to, this);
    return to[incomingsSymbol];
  };
  _proto7.addMotion = function addMotion() {
    return this._addState(new MotionState());
  };
  _proto7.addSubStateMachine = function addSubStateMachine() {
    return this._addState(new SubStateMachine(this._allowEmptyStates));
  };
  _proto7.addEmpty = function addEmpty() {
    if (!this._allowEmptyStates) {
      throw new Error("Empty states are now allowed in this state machine.");
    }
    return this._addState(new EmptyState());
  };
  _proto7.addProceduralPoseState = function addProceduralPoseState() {
    return this._addState(new ProceduralPoseState());
  };
  _proto7.remove = function remove$1(state) {
    assertsOwnedBy(state, this);
    if (state === this.entryState || state === this.exitState || state === this.anyState) {
      return;
    }
    this.eraseTransitionsIncludes(state);
    remove(this._states, state);
    markAsDangling(state);
  };
  _proto7.connect = function connect(from, to, conditions) {
    assertsOwnedBy(from, this);
    assertsOwnedBy(to, this);
    if (to === this.entryState) {
      throw new InvalidTransitionError('to-entry');
    }
    if (to === this.anyState) {
      throw new InvalidTransitionError('to-any');
    }
    if (from === this.exitState) {
      throw new InvalidTransitionError('from-exit');
    }
    var transition = from instanceof MotionState || from === this._anyState ? new AnimationTransition(from, to, conditions) : from instanceof EmptyState ? new EmptyStateTransition(from, to, conditions) : from instanceof ProceduralPoseState ? new ProceduralPoseTransition(from, to, conditions) : new Transition(from, to, conditions);
    own(transition, this);
    this._transitions.push(transition);
    from[outgoingsSymbol].push(transition);
    to[incomingsSymbol].push(transition);
    return transition;
  };
  _proto7.disconnect = function disconnect(from, to) {
    assertsOwnedBy(from, this);
    assertsOwnedBy(to, this);
    var oTransitions = from[outgoingsSymbol];
    var iTransitions = to[incomingsSymbol];
    var transitions = this._transitions;
    var oTransitionsToRemove = oTransitions.filter(function (oTransition) {
      return oTransition.to === to;
    });
    var nOTransitionToRemove = oTransitionsToRemove.length;
    var _loop = function _loop() {
      var oTransition = oTransitionsToRemove[iOTransitionToRemove];
      remove(oTransitions, oTransition);
      assertIsTrue(remove(transitions, oTransition));
      assertIsNonNullable(removeIf(iTransitions, function (transition) {
        return transition === oTransition;
      }));
      markAsDangling(oTransition);
    };
    for (var iOTransitionToRemove = 0; iOTransitionToRemove < nOTransitionToRemove; ++iOTransitionToRemove) {
      _loop();
    }
  };
  _proto7.removeTransition = function removeTransition(removal) {
    assertIsTrue(remove(this._transitions, removal));
    assertIsNonNullable(removeIf(removal.from[outgoingsSymbol], function (transition) {
      return transition === removal;
    }));
    assertIsNonNullable(removeIf(removal.to[incomingsSymbol], function (transition) {
      return transition === removal;
    }));
    markAsDangling(removal);
  };
  _proto7.eraseOutgoings = function eraseOutgoings(from) {
    var _this9 = this;
    assertsOwnedBy(from, this);
    var oTransitions = from[outgoingsSymbol];
    var _loop2 = function _loop2() {
      var oTransition = oTransitions[iOTransition];
      var to = oTransition.to;
      assertIsTrue(remove(_this9._transitions, oTransition));
      assertIsNonNullable(removeIf(to[incomingsSymbol], function (transition) {
        return transition === oTransition;
      }));
      markAsDangling(oTransition);
    };
    for (var iOTransition = 0; iOTransition < oTransitions.length; ++iOTransition) {
      _loop2();
    }
    oTransitions.length = 0;
  };
  _proto7.eraseIncomings = function eraseIncomings(to) {
    var _this0 = this;
    assertsOwnedBy(to, this);
    var iTransitions = to[incomingsSymbol];
    var _loop3 = function _loop3() {
      var iTransition = iTransitions[iITransition];
      var from = iTransition.from;
      assertIsTrue(remove(_this0._transitions, iTransition));
      assertIsNonNullable(removeIf(from[outgoingsSymbol], function (transition) {
        return transition === iTransition;
      }));
      markAsDangling(iTransition);
    };
    for (var iITransition = 0; iITransition < iTransitions.length; ++iITransition) {
      _loop3();
    }
    iTransitions.length = 0;
  };
  _proto7.eraseTransitionsIncludes = function eraseTransitionsIncludes(state) {
    this.eraseIncomings(state);
    this.eraseOutgoings(state);
  };
  _proto7.adjustTransitionPriority = function adjustTransitionPriority(adjusting, diff) {
    var from = adjusting.from;
    if (diff === 0) {
      return;
    }
    var outgoings = from[outgoingsSymbol];
    var iAdjusting = outgoings.indexOf(adjusting);
    assertIsTrue(iAdjusting >= 0);
    var iNew = clamp(iAdjusting + diff, 0, outgoings.length - 1);
    {
      var globalTransitions = this._transitions;
      var adjustingIndexInGlobal = globalTransitions.indexOf(adjusting);
      assertIsTrue(adjustingIndexInGlobal >= 0);
      var lastPlaceholder = adjustingIndexInGlobal;
      if (iNew > iAdjusting) {
        for (var iOutgoing = iAdjusting + 1; iOutgoing <= iNew; ++iOutgoing) {
          var outgoing = outgoings[iOutgoing];
          var indexInGlobal = globalTransitions.indexOf(outgoing);
          assertIsTrue(indexInGlobal >= 0);
          globalTransitions[lastPlaceholder] = outgoing;
          lastPlaceholder = indexInGlobal;
        }
      } else if (iAdjusting > iNew) {
        for (var _iOutgoing = iAdjusting - 1; _iOutgoing >= iNew; --_iOutgoing) {
          var _outgoing = outgoings[_iOutgoing];
          var _indexInGlobal = globalTransitions.indexOf(_outgoing);
          assertIsTrue(_indexInGlobal >= 0);
          globalTransitions[lastPlaceholder] = _outgoing;
          lastPlaceholder = _indexInGlobal;
        }
      }
      globalTransitions[lastPlaceholder] = adjusting;
    }
    {
      shift(outgoings, iAdjusting, iNew);
    }
  };
  _proto7.copyTo = function copyTo(that) {
    var thatStatesOld = that._states.filter(function (state) {
      switch (state) {
        case that._entryState:
        case that._exitState:
        case that._anyState:
          return true;
        default:
          return false;
      }
    });
    for (var _iterator = _createForOfIteratorHelperLoose(thatStatesOld), _step; !(_step = _iterator()).done;) {
      var thatStateOld = _step.value;
      that.remove(thatStateOld);
    }
    var stateMap = new Map();
    for (var _iterator2 = _createForOfIteratorHelperLoose(this._states), _step2; !(_step2 = _iterator2()).done;) {
      var state = _step2.value;
      switch (state) {
        case this._entryState:
          stateMap.set(state, that._entryState);
          break;
        case this._exitState:
          stateMap.set(state, that._exitState);
          break;
        case this._anyState:
          stateMap.set(state, that._anyState);
          break;
        default:
          if (state instanceof MotionState || state instanceof SubStateMachine || state instanceof EmptyState || state instanceof ProceduralPoseState) {
            if (state instanceof EmptyState && !that._allowEmptyStates) {
              continue;
            }
            var thatState = instantiate(state);
            that._addState(thatState);
            stateMap.set(state, thatState);
          } else {
            assertIsTrue(false);
          }
          break;
      }
    }
    for (var _iterator3 = _createForOfIteratorHelperLoose(this._transitions), _step3; !(_step3 = _iterator3()).done;) {
      var transition = _step3.value;
      if (!that._allowEmptyStates) {
        if (transition.from instanceof EmptyState || transition.to instanceof EmptyState) {
          continue;
        }
      }
      var thatFrom = stateMap.get(transition.from);
      var thatTo = stateMap.get(transition.to);
      assertIsTrue(thatFrom && thatTo);
      var thatTransition = that.connect(thatFrom, thatTo);
      thatTransition.conditions = transition.conditions.map(function (condition) {
        return condition.clone();
      });
      if (thatTransition instanceof AnimationTransition) {
        assertIsTrue(transition instanceof AnimationTransition);
        transition.copyTo(thatTransition);
      } else if (thatTransition instanceof EmptyStateTransition) {
        assertIsTrue(transition instanceof EmptyStateTransition);
        transition.copyTo(thatTransition);
      } else if (thatTransition instanceof ProceduralPoseState) {
        assertIsTrue(transition instanceof ProceduralPoseState);
        transition.copyTo(thatTransition);
      } else {
        transition.copyTo(thatTransition);
      }
    }
  };
  _proto7.clone = function clone() {
    var that = new StateMachine(this._allowEmptyStates);
    this.copyTo(that);
    return that;
  };
  _proto7._addState = function _addState(state) {
    own(state, this);
    this._states.push(state);
    return state;
  };
  return _createClass(StateMachine, [{
    key: "allowEmptyStates",
    get: function get() {
      return this._allowEmptyStates;
    }
  }, {
    key: "entryState",
    get: function get() {
      return this._entryState;
    }
  }, {
    key: "exitState",
    get: function get() {
      return this._exitState;
    }
  }, {
    key: "anyState",
    get: function get() {
      return this._anyState;
    }
  }]);
}(EditorExtendable), _initializer15 = applyDecoratedInitializer(_class13.prototype, "_states", [serializable$d], function () {
  return [];
}), _initializer16 = applyDecoratedInitializer(_class13.prototype, "_transitions", [serializable$d], function () {
  return [];
}), _initializer17 = applyDecoratedInitializer(_class13.prototype, "_entryState", [serializable$d], null), _initializer18 = applyDecoratedInitializer(_class13.prototype, "_exitState", [serializable$d], null), _initializer19 = applyDecoratedInitializer(_class13.prototype, "_anyState", [serializable$d], null), _class13)) || _class12);
var SubStateMachine = (_dec9$2 = ccclass$g('cc.animation.SubStateMachine'), _dec9$2(_class14 = (_class15 = function (_InteractiveState) {
  function SubStateMachine(allowEmptyStates) {
    var _this1;
    _this1 = _InteractiveState.call(this) || this;
    _this1._stateMachine = _initializer20 && _initializer20();
    _this1._stateMachine = new StateMachine(allowEmptyStates);
    return _this1;
  }
  _inheritsLoose(SubStateMachine, _InteractiveState);
  var _proto8 = SubStateMachine.prototype;
  _proto8.copyTo = function copyTo(that) {
    _InteractiveState.prototype.copyTo.call(this, that);
    this._stateMachine.copyTo(that._stateMachine);
  };
  return _createClass(SubStateMachine, [{
    key: "stateMachine",
    get: function get() {
      return this._stateMachine;
    }
  }]);
}(InteractiveState), _initializer20 = applyDecoratedInitializer(_class15.prototype, "_stateMachine", [serializable$d], null), _class15)) || _class14);
var PoseGraphStash = (_dec0$1 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseGraphStash"), _dec0$1(_class16 = (_class17 = function (_EditorExtendable3) {
  function PoseGraphStash() {
    var _this10;
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }
    _this10 = _EditorExtendable3.call.apply(_EditorExtendable3, [this].concat(args)) || this;
    _this10.graph = _initializer21 && _initializer21();
    return _this10;
  }
  _inheritsLoose(PoseGraphStash, _EditorExtendable3);
  return PoseGraphStash;
}(EditorExtendable), _initializer21 = applyDecoratedInitializer(_class17.prototype, "graph", [serializable$d], function () {
  return new PoseGraph();
}), _class17)) || _class16);
var Layer = (_dec1$1 = ccclass$g('cc.animation.Layer'), _dec1$1(_class18 = (_class19 = function () {
  function Layer() {
    this[ownerSymbol] = void 0;
    this._stateMachine = _initializer22 && _initializer22();
    this.name = _initializer23 && _initializer23();
    this.weight = _initializer24 && _initializer24();
    this.mask = _initializer25 && _initializer25();
    this.additive = _initializer26 && _initializer26();
    this._stashes = _initializer27 && _initializer27();
    this._stateMachine = new StateMachine(true);
  }
  var _proto9 = Layer.prototype;
  _proto9.__callOnAfterDeserializeRecursive = function __callOnAfterDeserializeRecursive() {
    this.stateMachine._allowEmptyStates = true;
    this.stateMachine.__callOnAfterDeserializeRecursive();
    for (var stashId in this._stashes) {
      var stash = this._stashes[stashId];
      stash.graph.__callOnAfterDeserializeRecursive();
    }
  };
  _proto9.stashes = function stashes() {
    return Object.entries(this._stashes);
  };
  _proto9.getStash = function getStash(id) {
    return this._stashes[id];
  };
  _proto9.addStash = function addStash(id) {
    return this._stashes[id] = new PoseGraphStash();
  };
  _proto9.removeStash = function removeStash(id) {
    delete this._stashes[id];
  };
  _proto9.renameStash = function renameStash(id, newId) {
    this._stashes = renameObjectProperty(this._stashes, id, newId);
  };
  return _createClass(Layer, [{
    key: "stateMachine",
    get: function get() {
      return this._stateMachine;
    }
  }]);
}(), _initializer22 = applyDecoratedInitializer(_class19.prototype, "_stateMachine", [serializable$d], null), _initializer23 = applyDecoratedInitializer(_class19.prototype, "name", [serializable$d], function () {
  return '';
}), _initializer24 = applyDecoratedInitializer(_class19.prototype, "weight", [serializable$d], function () {
  return 1.0;
}), _initializer25 = applyDecoratedInitializer(_class19.prototype, "mask", [serializable$d], function () {
  return null;
}), _initializer26 = applyDecoratedInitializer(_class19.prototype, "additive", [serializable$d], function () {
  return false;
}), _initializer27 = applyDecoratedInitializer(_class19.prototype, "_stashes", [serializable$d], function () {
  return {};
}), _class19)) || _class18);
var LayerBlending;
(function (LayerBlending) {
  LayerBlending[LayerBlending["override"] = 0] = "override";
  LayerBlending[LayerBlending["additive"] = 1] = "additive";
})(LayerBlending || (LayerBlending = {}));
var AnimationGraph = (_dec10$1 = ccclass$g('cc.animation.AnimationGraph'), _dec10$1(_class20 = (_class21 = function (_AnimationGraphLike) {
  function AnimationGraph() {
    var _this11;
    _this11 = _AnimationGraphLike.call(this) || this;
    _this11._layers = _initializer28 && _initializer28();
    _this11._variables = _initializer29 && _initializer29();
    return _this11;
  }
  _inheritsLoose(AnimationGraph, _AnimationGraphLike);
  var _proto0 = AnimationGraph.prototype;
  _proto0.onLoaded = function onLoaded() {
    var layers = this._layers;
    var nLayers = layers.length;
    for (var iLayer = 0; iLayer < nLayers; ++iLayer) {
      layers[iLayer].__callOnAfterDeserializeRecursive();
    }
  };
  _proto0.addLayer = function addLayer() {
    var layer = new Layer();
    this._layers.push(layer);
    return layer;
  };
  _proto0.removeLayer = function removeLayer(index) {
    removeAt(this._layers, index);
  };
  _proto0.moveLayer = function moveLayer(index, newIndex) {
    shift(this._layers, index, newIndex);
  };
  _proto0.addVariable = function addVariable(name, type, initialValue) {
    var variable = createVariable(type, initialValue);
    this._variables[name] = variable;
    return variable;
  };
  _proto0.removeVariable = function removeVariable(name) {
    delete this._variables[name];
  };
  _proto0.getVariable = function getVariable(name) {
    return this._variables[name];
  };
  _proto0.renameVariable = function renameVariable(name, newName) {
    this._variables = renameObjectProperty(this._variables, name, newName);
  };
  return _createClass(AnimationGraph, [{
    key: "layers",
    get: function get() {
      return this._layers;
    }
  }, {
    key: "variables",
    get: function get() {
      return Object.entries(this._variables);
    }
  }]);
}(AnimationGraphLike), _initializer28 = applyDecoratedInitializer(_class21.prototype, "_layers", [serializable$d], function () {
  return [];
}), _initializer29 = applyDecoratedInitializer(_class21.prototype, "_variables", [serializable$d], function () {
  return {};
}), _class21)) || _class20);

var createEval = Symbol('[[createEval]]');

var _dec$C, _class$D;
var Motion = (_dec$C = ccclass$g(CLASS_NAME_PREFIX_ANIM + "MotionBase"), _dec$C(_class$D = function (_EditorExtendable) {
  function Motion() {
    return _EditorExtendable.apply(this, arguments) || this;
  }
  _inheritsLoose(Motion, _EditorExtendable);
  var _proto = Motion.prototype;
  _proto.__callOnAfterDeserializeRecursive = function __callOnAfterDeserializeRecursive() {};
  return Motion;
}(EditorExtendable)) || _class$D);

function wrap(elapsedTime, duration, wrapMode, repeatCount, negativeSpeed, info) {
  if (duration === 0.0) {
    info.time = 0.0;
    info.ratio = 0.0;
    info.direction = 1.0;
    info.stopped = !!Number.isFinite(repeatCount);
    info.iterations = 0.0;
    return info;
  }
  var stopped = false;
  var currentIterations = elapsedTime > 0 ? elapsedTime / duration : -(elapsedTime / duration);
  if (currentIterations >= repeatCount) {
    currentIterations = repeatCount;
    stopped = true;
    var tempRatio = repeatCount - (repeatCount | 0);
    if (tempRatio === 0) {
      tempRatio = 1;
    }
    elapsedTime = tempRatio * duration * (elapsedTime > 0 ? 1 : -1);
  }
  if (elapsedTime > duration) {
    var tempTime = elapsedTime % duration;
    elapsedTime = tempTime === 0 ? duration : tempTime;
  } else if (elapsedTime < 0) {
    elapsedTime %= duration;
    if (elapsedTime !== 0) {
      elapsedTime += duration;
    }
  }
  var needReverse = false;
  var shouldWrap = wrapMode & WrapModeMask.ShouldWrap;
  if (shouldWrap) {
    needReverse = isReverseIteration(wrapMode, currentIterations);
  }
  var direction = needReverse ? -1 : 1;
  if (shouldWrap && needReverse) {
    elapsedTime = duration - elapsedTime;
  }
  info.time = elapsedTime;
  info.ratio = info.time / duration;
  info.direction = direction;
  info.stopped = stopped;
  info.iterations = currentIterations;
  return info;
}
function isReverseIteration(wrapMode, currentIterations) {
  var needReverse = false;
  if ((wrapMode & WrapModeMask.PingPong) === WrapModeMask.PingPong) {
    var isEnd = currentIterations - (currentIterations | 0) === 0;
    if (isEnd && currentIterations > 0) {
      currentIterations -= 1;
    }
    var isOddIteration = currentIterations & 1;
    if (isOddIteration) {
      needReverse = !needReverse;
    }
  }
  if ((wrapMode & WrapModeMask.Reverse) === WrapModeMask.Reverse) {
    needReverse = !needReverse;
  }
  return needReverse;
}

var CACHE_VEC3_GET_VALUE = new Vec3();
var CACHE_QUAT_GET_VALUE = new Quat();
var PoseBindingBase = function () {
  function PoseBindingBase(transformHandle) {
    this._transformHandle = transformHandle;
  }
  var _proto = PoseBindingBase.prototype;
  _proto.destroy = function destroy() {
    this._transformHandle.destroy();
  };
  return PoseBindingBase;
}();
var PosePositionBinding = function (_PoseBindingBase) {
  function PosePositionBinding() {
    return _PoseBindingBase.apply(this, arguments) || this;
  }
  _inheritsLoose(PosePositionBinding, _PoseBindingBase);
  var _proto2 = PosePositionBinding.prototype;
  _proto2.setValue = function setValue(value, pose) {
    pose.transforms.setPosition(this._transformHandle.index, value);
  };
  _proto2.getValue = function getValue(pose) {
    return pose.transforms.getPosition(this._transformHandle.index, CACHE_VEC3_GET_VALUE);
  };
  return PosePositionBinding;
}(PoseBindingBase);
var PoseRotationBinding = function (_PoseBindingBase2) {
  function PoseRotationBinding() {
    return _PoseBindingBase2.apply(this, arguments) || this;
  }
  _inheritsLoose(PoseRotationBinding, _PoseBindingBase2);
  var _proto3 = PoseRotationBinding.prototype;
  _proto3.setValue = function setValue(value, pose) {
    pose.transforms.setRotation(this._transformHandle.index, value);
  };
  _proto3.getValue = function getValue(pose) {
    return pose.transforms.getRotation(this._transformHandle.index, CACHE_QUAT_GET_VALUE);
  };
  return PoseRotationBinding;
}(PoseBindingBase);
var PoseEulerAnglesBinding = function (_PoseBindingBase3) {
  function PoseEulerAnglesBinding() {
    return _PoseBindingBase3.apply(this, arguments) || this;
  }
  _inheritsLoose(PoseEulerAnglesBinding, _PoseBindingBase3);
  var _proto4 = PoseEulerAnglesBinding.prototype;
  _proto4.setValue = function setValue(value, pose) {
    var quat = Quat.fromEuler(PoseEulerAnglesBinding._EULER_TO_QUAT_CACHE, value.x, value.y, value.z);
    pose.transforms.setRotation(this._transformHandle.index, quat);
  };
  _proto4.getValue = function getValue(pose) {
    var q = pose.transforms.getRotation(this._transformHandle.index, CACHE_QUAT_GET_VALUE);
    return Quat.toEuler(CACHE_VEC3_GET_VALUE, q);
  };
  return PoseEulerAnglesBinding;
}(PoseBindingBase);
PoseEulerAnglesBinding._EULER_TO_QUAT_CACHE = new Quat();
var PoseScaleBinding = function (_PoseBindingBase4) {
  function PoseScaleBinding() {
    return _PoseBindingBase4.apply(this, arguments) || this;
  }
  _inheritsLoose(PoseScaleBinding, _PoseBindingBase4);
  var _proto5 = PoseScaleBinding.prototype;
  _proto5.setValue = function setValue(value, pose) {
    pose.transforms.setScale(this._transformHandle.index, value);
  };
  _proto5.getValue = function getValue(pose) {
    return pose.transforms.getScale(this._transformHandle.index, CACHE_VEC3_GET_VALUE);
  };
  return PoseScaleBinding;
}(PoseBindingBase);
var AuxiliaryCurveBinding = function () {
  function AuxiliaryCurveBinding(_handle) {
    this._handle = _handle;
  }
  var _proto6 = AuxiliaryCurveBinding.prototype;
  _proto6.destroy = function destroy() {
    this._handle.destroy();
  };
  _proto6.setValue = function setValue(value, pose) {
    pose.auxiliaryCurves[this._handle.index] = value;
  };
  _proto6.getValue = function getValue(pose) {
    return pose.auxiliaryCurves[this._handle.index];
  };
  return AuxiliaryCurveBinding;
}();
function bindPoseTransform(transformHandle, propertyKey) {
  switch (propertyKey) {
    case 'position':
      return new PosePositionBinding(transformHandle);
    case 'rotation':
      return new PoseRotationBinding(transformHandle);
    case 'eulerAngles':
      return new PoseEulerAnglesBinding(transformHandle);
    case 'scale':
      return new PoseScaleBinding(transformHandle);
    default:
      assertIsTrue(false);
  }
}
var NonTransformPoseBinding = function () {
  function NonTransformPoseBinding(binding) {
    this.binding = binding;
  }
  var _proto7 = NonTransformPoseBinding.prototype;
  _proto7.destroy = function destroy() {};
  _proto7.setValue = function setValue(value, _pose) {
    this.binding.setValue(value);
  };
  _proto7.getValue = function getValue(pose) {
    var _this$binding$getValu, _this$binding$getValu2, _this$binding;
    return (_this$binding$getValu = (_this$binding$getValu2 = (_this$binding = this.binding).getValue) == null ? void 0 : _this$binding$getValu2.call(_this$binding)) !== null && _this$binding$getValu !== void 0 ? _this$binding$getValu : undefined;
  };
  return NonTransformPoseBinding;
}();
var AGTrackEvaluation = function () {
  function AGTrackEvaluation(binding, trackEvaluation) {
    this._binding = void 0;
    this._trackSampler = void 0;
    this._binding = binding;
    this._trackSampler = trackEvaluation;
  }
  var _proto8 = AGTrackEvaluation.prototype;
  _proto8.destroy = function destroy() {
    this._binding.destroy();
  };
  _proto8.evaluate = function evaluate(time, pose) {
    var trackSampler = this._trackSampler,
      binding = this._binding;
    var defaultValue = trackSampler.requiresDefault ? binding.getValue(pose) : undefined;
    var value = trackSampler.evaluate(time, defaultValue);
    binding.setValue(value, pose);
  };
  return AGTrackEvaluation;
}();
function bindTrackAG(animationClip, track, bindContext) {
  var trackBinding = track[trackBindingTag];
  var trackTarget = createRuntimeBindingAG(trackBinding, bindContext);
  if (!trackTarget) {
    warnID(3937, animationClip.name, bindContext.origin.name);
  }
  return trackTarget !== null && trackTarget !== void 0 ? trackTarget : undefined;
}
function createRuntimeBindingAG(track, bindContext) {
  var origin = bindContext.origin;
  var path = track.path,
    proxy = track.proxy;
  var nPaths = path.length;
  var iLastPath = nPaths - 1;
  if (nPaths !== 0 && (path.isPropertyAt(iLastPath) || path.isElementAt(iLastPath)) && !proxy) {
    var lastPropertyKey = path.isPropertyAt(iLastPath) ? path.parsePropertyAt(iLastPath) : path.parseElementAt(iLastPath);
    var resultTarget = path[normalizedFollowTag](origin, 0, nPaths - 1);
    if (resultTarget === null) {
      return null;
    }
    if (resultTarget instanceof Node && isTrsPropertyName(lastPropertyKey)) {
      var transformPath = function () {
        var segments = [];
        var node = resultTarget;
        for (; node && node !== origin; node = node.parent) {
          segments.unshift(node.name);
        }
        if (node === origin) {
          return segments.join('/');
        } else {
          return undefined;
        }
      }();
      if (typeof transformPath === 'string') {
        var transformHandle = bindContext.bindTransform(transformPath);
        if (!transformHandle) {
          return undefined;
        }
        return bindPoseTransform(transformHandle, lastPropertyKey);
      }
    }
  }
  {
    var nonTransformBinding = track.createRuntimeBinding(bindContext.origin, undefined, false);
    if (!nonTransformBinding) {
      return null;
    }
    return new NonTransformPoseBinding(nonTransformBinding);
  }
}
var AuxiliaryCurveEvaluation = function () {
  function AuxiliaryCurveEvaluation(_binding, _curve) {
    this._binding = _binding;
    this._curve = _curve;
  }
  var _proto9 = AuxiliaryCurveEvaluation.prototype;
  _proto9.evaluate = function evaluate(time, context) {
    var curve = this._curve,
      binding = this._binding;
    var pose = context;
    var value = curve.evaluate(time);
    binding.setValue(value, pose);
  };
  return AuxiliaryCurveEvaluation;
}();
function createAnimationAGEvaluation(clip, context) {
  if (clip.isAdditive_experimental) {
    return new AnimationClipAGEvaluationAdditive(clip, context);
  } else {
    return new AnimationClipAGEvaluationRegular(clip, context);
  }
}
var AnimationClipAGEvaluationRegular = function () {
  function AnimationClipAGEvaluationRegular(clip, context) {
    this._trackEvaluations = [];
    this._exoticAnimationEvaluation = void 0;
    this._auxiliaryCurveEvaluations = [];
    clip._trySyncLegacyData();
    var trackEvaluations = [];
    var exoticAnimationEvaluation;
    var auxiliaryCurveEvaluations = [];
    var tracks = clip.tracks;
    var exoticAnimation = clip[exoticAnimationTag];
    for (var _iterator = _createForOfIteratorHelperLoose(tracks), _step; !(_step = _iterator()).done;) {
      var track = _step.value;
      if (track instanceof UntypedTrack) {
        continue;
      }
      if (Array.from(track.channels()).every(function (_ref) {
        var curve = _ref.curve;
        return curve.keyFramesCount === 0;
      })) {
        continue;
      }
      var trackRuntimeBinding = bindTrackAG(clip, track, context);
      if (!trackRuntimeBinding) {
        continue;
      }
      var trackSampler = track[createEvalSymbol]();
      var trackEvaluation = new AGTrackEvaluation(trackRuntimeBinding, trackSampler);
      trackEvaluations.push(trackEvaluation);
    }
    if (exoticAnimation) {
      exoticAnimationEvaluation = exoticAnimation.createEvaluatorForAnimationGraph(context);
    }
    var auxiliaryCurveNames = clip.getAuxiliaryCurveNames_experimental();
    var nAuxiliaryCurves = auxiliaryCurveNames.length;
    for (var iAuxiliaryCurve = 0; iAuxiliaryCurve < nAuxiliaryCurves; ++iAuxiliaryCurve) {
      var _curveName = auxiliaryCurveNames[iAuxiliaryCurve];
      var curve = clip.getAuxiliaryCurve_experimental(_curveName);
      var handle = context.bindAuxiliaryCurve(_curveName);
      var _binding2 = new AuxiliaryCurveBinding(handle);
      auxiliaryCurveEvaluations.push(new AuxiliaryCurveEvaluation(_binding2, curve));
    }
    this._trackEvaluations = trackEvaluations;
    this._exoticAnimationEvaluation = exoticAnimationEvaluation;
    this._auxiliaryCurveEvaluations = auxiliaryCurveEvaluations;
  }
  var _proto0 = AnimationClipAGEvaluationRegular.prototype;
  _proto0.destroy = function destroy() {
    var _this$_exoticAnimatio;
    (_this$_exoticAnimatio = this._exoticAnimationEvaluation) == null ? void 0 : _this$_exoticAnimatio.destroy();
    var trackEvaluations = this._trackEvaluations;
    var nTrackEvaluations = trackEvaluations.length;
    for (var iNodeEvaluation = 0; iNodeEvaluation < nTrackEvaluations; ++iNodeEvaluation) {
      trackEvaluations[iNodeEvaluation].destroy();
    }
  };
  _proto0.evaluate = function evaluate(time, context) {
    var trackEvaluations = this._trackEvaluations,
      exoticAnimationEvaluation = this._exoticAnimationEvaluation,
      auxiliaryCurveEvaluations = this._auxiliaryCurveEvaluations;
    var pose = context.pushDefaultedPose();
    var nTrackEvaluations = trackEvaluations.length;
    for (var iNodeEvaluation = 0; iNodeEvaluation < nTrackEvaluations; ++iNodeEvaluation) {
      trackEvaluations[iNodeEvaluation].evaluate(time, pose);
    }
    if (exoticAnimationEvaluation) {
      exoticAnimationEvaluation.evaluate(time, pose);
    }
    var nAuxiliaryCurveEvaluations = auxiliaryCurveEvaluations.length;
    for (var iAuxiliaryCurveEvaluation = 0; iAuxiliaryCurveEvaluation < nAuxiliaryCurveEvaluations; ++iAuxiliaryCurveEvaluation) {
      auxiliaryCurveEvaluations[iAuxiliaryCurveEvaluation].evaluate(time, pose);
    }
    return pose;
  };
  return AnimationClipAGEvaluationRegular;
}();
var AnimationClipAGEvaluationAdditive = function () {
  function AnimationClipAGEvaluationAdditive(clip, context) {
    this._clipEval = void 0;
    this._refClipEval = void 0;
    this._clipEval = new AnimationClipAGEvaluationRegular(clip, context);
    var refClip = clip[additiveSettingsTag].refClip;
    if (refClip && refClip !== clip) {
      this._refClipEval = new AnimationClipAGEvaluationRegular(refClip, context);
    }
  }
  var _proto1 = AnimationClipAGEvaluationAdditive.prototype;
  _proto1.destroy = function destroy() {
    var _this$_refClipEval;
    this._clipEval.destroy();
    (_this$_refClipEval = this._refClipEval) == null ? void 0 : _this$_refClipEval.destroy();
  };
  _proto1.evaluate = function evaluate(time, context) {
    var pose = this._clipEval.evaluate(time, context);
    var refPose;
    if (this._refClipEval) {
      var refClipTime = 0.0;
      refPose = this._refClipEval.evaluate(refClipTime, context);
    } else {
      refPose = this._clipEval.evaluate(0.0, context);
    }
    calculateDeltaPose(pose, refPose);
    context.popPose();
    return pose;
  };
  return AnimationClipAGEvaluationAdditive;
}();

var _dec$B, _dec2$w, _class$C, _class2$w, _initializer$q;
var ccclass$d = ccclass$g,
  type$1 = type$2;
var ClipMotion = (_dec$B = ccclass$d('cc.animation.ClipMotion'), _dec2$w = type$1(AnimationClip), _dec$B(_class$C = (_class2$w = function (_Motion) {
  function ClipMotion() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Motion.call.apply(_Motion, [this].concat(args)) || this;
    _this.clip = _initializer$q && _initializer$q();
    return _this;
  }
  _inheritsLoose(ClipMotion, _Motion);
  var _proto = ClipMotion.prototype;
  _proto[createEval] = function (context, ignoreEmbeddedPlayers) {
    if (!this.clip) {
      return null;
    }
    var clipMotionEval = new ClipMotionEval(context, this.clip, ignoreEmbeddedPlayers);
    return clipMotionEval;
  };
  _proto.clone = function clone() {
    var that = new ClipMotion();
    that.clip = this.clip;
    that[editorExtrasTag] = cloneAnimationGraphEditorExtrasFrom(this);
    return that;
  };
  return ClipMotion;
}(Motion), _initializer$q = applyDecoratedInitializer(_class2$w.prototype, "clip", [_dec2$w, serializable$d], function () {
  return null;
}), _class2$w)) || _class$C);
var evaluatePortTag = Symbol('EvaluatePort');
var ClipMotionEval = function () {
  function ClipMotionEval(context, clip, ignoreEmbeddedPlayers) {
    var _context$clipOverride, _context$clipOverride2;
    this._clipEmbeddedPlayerEval = null;
    this._frameEventEval = null;
    this._wrapInfo = new WrappedInfo();
    this._duration = 0.0;
    this._ignoreEmbeddedPlayers = void 0;
    this._originalClip = clip;
    this._ignoreEmbeddedPlayers = ignoreEmbeddedPlayers;
    var overriding = (_context$clipOverride = (_context$clipOverride2 = context.clipOverrides) == null ? void 0 : _context$clipOverride2.get(clip)) !== null && _context$clipOverride !== void 0 ? _context$clipOverride : clip;
    this._setClip(overriding, context);
  }
  var _proto2 = ClipMotionEval.prototype;
  _proto2.createPort = function createPort() {
    return new ClipMotionPort(this);
  };
  _proto2.getClipStatuses = function getClipStatuses(baseWeight) {
    var _this2 = this;
    var got = false;
    return {
      next: function next() {
        if (got) {
          return {
            done: true,
            value: undefined
          };
        } else {
          got = true;
          return {
            done: false,
            value: {
              __DEBUG_ID__: _this2.__DEBUG__ID__,
              clip: _this2._clip,
              weight: baseWeight
            }
          };
        }
      }
    };
  };
  _proto2[evaluatePortTag] = function (progress, context) {
    var _this$_frameEventEval, _this$_clipEmbeddedPl;
    var duration = this._duration,
      clipDuration = this._clip.duration,
      clipEval = this._clipEval;
    var elapsedTime = duration * progress;
    var wrapMode = this._clip.wrapMode;
    var repeatCount = (wrapMode & WrapModeMask.Loop) === WrapModeMask.Loop ? Infinity : 1;
    var wrapInfo = wrap(elapsedTime, duration, wrapMode, repeatCount, false, this._wrapInfo);
    var clipTime = wrapInfo.ratio * clipDuration;
    var pose = clipEval.evaluate(clipTime, context);
    (_this$_frameEventEval = this._frameEventEval) == null ? void 0 : _this$_frameEventEval.sample(wrapInfo.ratio, wrapInfo.direction, wrapInfo.iterations);
    (_this$_clipEmbeddedPl = this._clipEmbeddedPlayerEval) == null ? void 0 : _this$_clipEmbeddedPl.evaluate(clipTime, Math.trunc(wrapInfo.iterations));
    return pose;
  };
  _proto2.overrideClips = function overrideClips(context) {
    var _context$clipOverride3;
    var originalClip = this._originalClip;
    var overriding = (_context$clipOverride3 = context.clipOverrides) == null ? void 0 : _context$clipOverride3.get(originalClip);
    if (overriding) {
      this._setClip(overriding, context);
    }
  };
  _proto2.reenter = function reenter() {
    var _this$_frameEventEval2;
    (_this$_frameEventEval2 = this._frameEventEval) == null ? void 0 : _this$_frameEventEval2.reset();
  };
  _proto2._setClip = function _setClip(clip, context) {
    var _this$_clipEval;
    (_this$_clipEval = this._clipEval) == null ? void 0 : _this$_clipEval.destroy();
    this._frameEventEval = null;
    if (this._clipEmbeddedPlayerEval) {
      this._clipEmbeddedPlayerEval.destroy();
      this._clipEmbeddedPlayerEval = null;
    }
    this._clip = clip;
    this._duration = clip.speed === 0.0 ? 0.0 : clip.duration / clip.speed;
    this._clipEval = createAnimationAGEvaluation(clip, context);
    this._frameEventEval = clip.createEventEvaluator(context.origin);
    if (!this._ignoreEmbeddedPlayers && clip.containsAnyEmbeddedPlayer()) {
      this._clipEmbeddedPlayerEval = clip.createEmbeddedPlayerEvaluator(context.origin);
    }
  };
  return _createClass(ClipMotionEval, [{
    key: "duration",
    get: function get() {
      return this._duration;
    }
  }]);
}();
var ClipMotionPort = function () {
  function ClipMotionPort(host) {
    this._eval = void 0;
    this._eval = host;
  }
  var _proto3 = ClipMotionPort.prototype;
  _proto3.evaluate = function evaluate(progress, context) {
    return this._eval[evaluatePortTag](progress, context);
  };
  _proto3.reenter = function reenter() {
    this._eval.reenter();
  };
  return ClipMotionPort;
}();

var _dec$A, _class$B, _class2$v, _initializer$p, _dec2$v, _class3$8, _class4$8, _initializer2$i;
var ccclass$c = ccclass$g,
  serializable$a = serializable$d;
var AnimationBlendItem = (_dec$A = ccclass$c(CLASS_NAME_PREFIX_ANIM + "AnimationBlendItem"), _dec$A(_class$B = (_class2$v = function () {
  function AnimationBlendItem() {
    this.motion = _initializer$p && _initializer$p();
  }
  var _proto = AnimationBlendItem.prototype;
  _proto.clone = function clone() {
    var that = new AnimationBlendItem();
    this._copyTo(that);
    return that;
  };
  _proto._copyTo = function _copyTo(that) {
    var _this$motion$clone, _this$motion;
    that.motion = (_this$motion$clone = (_this$motion = this.motion) == null ? void 0 : _this$motion.clone()) !== null && _this$motion$clone !== void 0 ? _this$motion$clone : null;
    return that;
  };
  return AnimationBlendItem;
}(), _initializer$p = applyDecoratedInitializer(_class2$v.prototype, "motion", [serializable$a], function () {
  return null;
}), _class2$v)) || _class$B);
var AnimationBlend = (_dec2$v = ccclass$c(CLASS_NAME_PREFIX_ANIM + "AnimationBlend"), _dec2$v(_class3$8 = (_class4$8 = function (_Motion) {
  function AnimationBlend() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Motion.call.apply(_Motion, [this].concat(args)) || this;
    _this.name = _initializer2$i && _initializer2$i();
    return _this;
  }
  _inheritsLoose(AnimationBlend, _Motion);
  var _proto2 = AnimationBlend.prototype;
  _proto2.copyTo = function copyTo(that) {
    that.name = this.name;
    that[editorExtrasTag] = cloneAnimationGraphEditorExtrasFrom(this);
  };
  return AnimationBlend;
}(Motion), _initializer2$i = applyDecoratedInitializer(_class4$8.prototype, "name", [serializable$a], function () {
  return '';
}), _class4$8)) || _class3$8);
var AnimationBlendEval = function () {
  function AnimationBlendEval(context, ignoreEmbeddedPlayers, base, children, inputs) {
    this._childEvaluators = children.map(function (child) {
      var _child$motion$createE, _child$motion;
      return (_child$motion$createE = (_child$motion = child.motion) == null ? void 0 : _child$motion[createEval](context, ignoreEmbeddedPlayers)) !== null && _child$motion$createE !== void 0 ? _child$motion$createE : null;
    });
    this._weights = new Array(this._childEvaluators.length).fill(0);
    this._inputs = [].concat(inputs);
  }
  var _proto3 = AnimationBlendEval.prototype;
  _proto3.createPort = function createPort() {
    return new AnimationBlendPort(this, this._childEvaluators.map(function (childEval) {
      var _childEval$createPort;
      return (_childEval$createPort = childEval == null ? void 0 : childEval.createPort()) !== null && _childEval$createPort !== void 0 ? _childEval$createPort : null;
    }));
  };
  _proto3.getChildWeight = function getChildWeight(childIndex) {
    return this._weights[childIndex];
  };
  _proto3.getChildMotionEval = function getChildMotionEval(childIndex) {
    return this._childEvaluators[childIndex];
  };
  _proto3.getClipStatuses = function getClipStatuses(baseWeight) {
    var children = this._childEvaluators,
      weights = this._weights;
    var nChildren = children.length;
    var iChild = 0;
    var currentChildIterator;
    return {
      next: function next() {
        while (true) {
          if (currentChildIterator) {
            var result = currentChildIterator.next();
            if (!result.done) {
              return result;
            }
          }
          if (iChild >= nChildren) {
            return {
              done: true,
              value: undefined
            };
          } else {
            var child = children[iChild];
            currentChildIterator = child == null ? void 0 : child.getClipStatuses(baseWeight * weights[iChild]);
            ++iChild;
          }
        }
      }
    };
  };
  _proto3.__evaluatePort = function __evaluatePort(port, progress, context) {
    var nChild = this._childEvaluators.length;
    var sumWeight = 0.0;
    var finalPose = null;
    for (var iChild = 0; iChild < nChild; ++iChild) {
      var _port$childPorts$iChi;
      var childWeight = this._weights[iChild];
      if (!childWeight) {
        continue;
      }
      var childOutput = (_port$childPorts$iChi = port.childPorts[iChild]) == null ? void 0 : _port$childPorts$iChi.evaluate(progress, context);
      if (!childOutput) {
        continue;
      }
      sumWeight += childWeight;
      if (!finalPose) {
        finalPose = childOutput;
      } else {
        if (sumWeight) {
          var t = childWeight / sumWeight;
          blendPoseInto(finalPose, childOutput, t);
        }
        context.popPose();
      }
    }
    if (finalPose) {
      return finalPose;
    }
    return context.pushDefaultedPose();
  };
  _proto3.overrideClips = function overrideClips(context) {
    for (var iChild = 0; iChild < this._childEvaluators.length; ++iChild) {
      var _this$_childEvaluator;
      (_this$_childEvaluator = this._childEvaluators[iChild]) == null ? void 0 : _this$_childEvaluator.overrideClips(context);
    }
  };
  _proto3.setInput = function setInput(value, index) {
    this._inputs[index] = value;
    this.doEval();
  };
  _proto3.doEval = function doEval() {
    this.eval(this._weights, this._inputs);
  };
  return _createClass(AnimationBlendEval, [{
    key: "childCount",
    get: function get() {
      return this._weights.length;
    }
  }, {
    key: "duration",
    get: function get() {
      var uniformDuration = 0.0;
      for (var iChild = 0; iChild < this._childEvaluators.length; ++iChild) {
        var _this$_childEvaluator2, _this$_childEvaluator3;
        uniformDuration += ((_this$_childEvaluator2 = (_this$_childEvaluator3 = this._childEvaluators[iChild]) == null ? void 0 : _this$_childEvaluator3.duration) !== null && _this$_childEvaluator2 !== void 0 ? _this$_childEvaluator2 : 0.0) * this._weights[iChild];
      }
      return uniformDuration;
    }
  }]);
}();
var AnimationBlendPort = function () {
  function AnimationBlendPort(host, childPorts) {
    this.childPorts = [];
    this._host = void 0;
    this._host = host;
    this.childPorts = childPorts;
  }
  var _proto4 = AnimationBlendPort.prototype;
  _proto4.evaluate = function evaluate(progress, context) {
    return this._host.__evaluatePort(this, progress, context);
  };
  _proto4.reenter = function reenter() {
    var childPorts = this.childPorts;
    var nChildPorts = childPorts.length;
    for (var iChild = 0; iChild < nChildPorts; ++iChild) {
      var _childPorts$iChild;
      (_childPorts$iChild = childPorts[iChild]) == null ? void 0 : _childPorts$iChild.reenter();
    }
  };
  return AnimationBlendPort;
}();

var _dec$z, _class$A, _class2$u, _initializer$o, _initializer2$h, _dec2$u, _class3$7, _class4$7, _initializer3$9, _initializer4$5;
var ccclass$b = ccclass$g,
  serializable$9 = serializable$d;
var BindableNumber = (_dec$z = ccclass$b(CLASS_NAME_PREFIX_ANIM + "BindableNumber"), _dec$z(_class$A = (_class2$u = function () {
  function BindableNumber(value) {
    if (value === void 0) {
      value = 0.0;
    }
    this.variable = _initializer$o && _initializer$o();
    this.value = _initializer2$h && _initializer2$h();
    this.value = value;
  }
  var _proto = BindableNumber.prototype;
  _proto.clone = function clone() {
    var that = new BindableNumber();
    that.value = this.value;
    that.variable = this.variable;
    return that;
  };
  return BindableNumber;
}(), _initializer$o = applyDecoratedInitializer(_class2$u.prototype, "variable", [serializable$9], function () {
  return '';
}), _initializer2$h = applyDecoratedInitializer(_class2$u.prototype, "value", [serializable$9], function () {
  return 0.0;
}), _class2$u)) || _class$A);
var BindableBoolean = (_dec2$u = ccclass$b(CLASS_NAME_PREFIX_ANIM + "BindableBoolean"), _dec2$u(_class3$7 = (_class4$7 = function () {
  function BindableBoolean(value) {
    if (value === void 0) {
      value = false;
    }
    this.variable = _initializer3$9 && _initializer3$9();
    this.value = _initializer4$5 && _initializer4$5();
    this.value = value;
  }
  var _proto2 = BindableBoolean.prototype;
  _proto2.clone = function clone() {
    var that = new BindableBoolean();
    that.value = this.value;
    that.variable = this.variable;
    return that;
  };
  return BindableBoolean;
}(), _initializer3$9 = applyDecoratedInitializer(_class4$7.prototype, "variable", [serializable$9], function () {
  return '';
}), _initializer4$5 = applyDecoratedInitializer(_class4$7.prototype, "value", [serializable$9], function () {
  return false;
}), _class4$7)) || _class3$7);
function bindOr(context, bindable, type, callback, thisArg) {
  var variable = bindable.variable,
    value = bindable.value;
  if (!variable) {
    return value;
  }
  var varInstance = context.getVar(variable);
  if (!validateVariableExistence(varInstance, variable)) {
    return value;
  }
  if (varInstance.type !== type) {
    throw new VariableTypeMismatchedError(variable, 'number');
  }
  for (var _len = arguments.length, args = new Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
    args[_key - 5] = arguments[_key];
  }
  var initialValue = varInstance.bind.apply(varInstance, [callback, thisArg].concat(args));
  return initialValue;
}
function validateVariableExistence(varInstance, name) {
  if (!varInstance) {
    throw new VariableNotDefinedError(name);
  } else {
    return true;
  }
}
function validateVariableType(type, expected, name) {
  if (type !== expected) {
    throw new VariableTypeMismatchedError(name, 'number');
  }
}
function validateVariableTypeTriggerLike(type, name) {
  if (type !== VariableType.TRIGGER) {
    throw new VariableTypeMismatchedError(name, 'trigger');
  }
}

function blend1D(weights, thresholds, value) {
  weights.fill(0.0);
  if (thresholds.length === 0) ; else if (value <= thresholds[0]) {
    weights[0] = 1;
  } else if (value >= thresholds[thresholds.length - 1]) {
    weights[weights.length - 1] = 1;
  } else {
    var iUpper = 0;
    for (var iThresholds = 1; iThresholds < thresholds.length; ++iThresholds) {
      if (thresholds[iThresholds] > value) {
        iUpper = iThresholds;
        break;
      }
    }
    var lower = thresholds[iUpper - 1];
    var upper = thresholds[iUpper];
    var dVal = upper - lower;
    weights[iUpper - 1] = (upper - value) / dVal;
    weights[iUpper] = (value - lower) / dVal;
  }
}

var _dec$y, _class$z, _class2$t, _initializer$n, _dec2$t, _class3$6, _class4$6, _initializer2$g, _initializer3$8, _AnimationBlend1D;
var ccclass$a = ccclass$g,
  serializable$8 = serializable$d;
var AnimationBlend1DItem = (_dec$y = ccclass$a(CLASS_NAME_PREFIX_ANIM + "AnimationBlend1DItem"), _dec$y(_class$z = (_class2$t = function (_AnimationBlendItem) {
  function AnimationBlend1DItem() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _AnimationBlendItem.call.apply(_AnimationBlendItem, [this].concat(args)) || this;
    _this.threshold = _initializer$n && _initializer$n();
    return _this;
  }
  _inheritsLoose(AnimationBlend1DItem, _AnimationBlendItem);
  var _proto = AnimationBlend1DItem.prototype;
  _proto.clone = function clone() {
    var that = new AnimationBlend1DItem();
    this._copyTo(that);
    return that;
  };
  _proto._copyTo = function _copyTo(that) {
    _AnimationBlendItem.prototype._copyTo.call(this, that);
    that.threshold = this.threshold;
    return that;
  };
  return AnimationBlend1DItem;
}(AnimationBlendItem), _initializer$n = applyDecoratedInitializer(_class2$t.prototype, "threshold", [serializable$8], function () {
  return 0.0;
}), _class2$t)) || _class$z);
var AnimationBlend1D = (_dec2$t = ccclass$a('cc.animation.AnimationBlend1D'), _dec2$t(_class3$6 = (_class4$6 = (_AnimationBlend1D = function (_AnimationBlend) {
  function AnimationBlend1D() {
    var _this2;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    _this2 = _AnimationBlend.call.apply(_AnimationBlend, [this].concat(args)) || this;
    _this2._items = _initializer2$g && _initializer2$g();
    _this2.param = _initializer3$8 && _initializer3$8();
    return _this2;
  }
  _inheritsLoose(AnimationBlend1D, _AnimationBlend);
  var _proto2 = AnimationBlend1D.prototype;
  _proto2.clone = function clone() {
    var that = new AnimationBlend1D();
    this.copyTo(that);
    that._items = this._items.map(function (item) {
      return item.clone();
    });
    that.param = this.param.clone();
    return that;
  };
  _proto2[createEval] = function (context, ignoreEmbeddedPlayers) {
    var evaluation = new AnimationBlend1DEval(context, ignoreEmbeddedPlayers, this, this._items, this._items.map(function (_ref) {
      var threshold = _ref.threshold;
      return threshold;
    }), 0.0);
    var initialValue = bindOr(context, this.param, VariableType.FLOAT, evaluation.setInput, evaluation, 0);
    evaluation.setInput(initialValue, 0);
    return evaluation;
  };
  return _createClass(AnimationBlend1D, [{
    key: "items",
    get: function get() {
      return this._items;
    },
    set: function set(value) {
      this._items = Array.from(value).sort(function (_ref2, _ref3) {
        var lhs = _ref2.threshold;
        var rhs = _ref3.threshold;
        return lhs - rhs;
      });
    }
  }]);
}(AnimationBlend), _AnimationBlend1D.Item = AnimationBlend1DItem, _AnimationBlend1D), _initializer2$g = applyDecoratedInitializer(_class4$6.prototype, "_items", [serializable$8], function () {
  return [];
}), _initializer3$8 = applyDecoratedInitializer(_class4$6.prototype, "param", [serializable$8], function () {
  return new BindableNumber();
}), _class4$6)) || _class3$6);
var AnimationBlend1DEval = function (_AnimationBlendEval) {
  function AnimationBlend1DEval(context, ignoreEmbeddedPlayers, base, items, thresholds, input) {
    var _this3;
    _this3 = _AnimationBlendEval.call(this, context, ignoreEmbeddedPlayers, base, items, [input]) || this;
    _this3._thresholds = thresholds;
    _this3.doEval();
    return _this3;
  }
  _inheritsLoose(AnimationBlend1DEval, _AnimationBlendEval);
  var _proto3 = AnimationBlend1DEval.prototype;
  _proto3.eval = function _eval(weights, _ref4) {
    var value = _ref4[0];
    blend1D(weights, this._thresholds, value);
  };
  return AnimationBlend1DEval;
}(AnimationBlendEval);

var blendSimpleDirectional = function () {
  var CACHE_NORMALIZED_SAMPLE = new Vec2();
  var CACHE_BARYCENTRIC_SOLUTIONS = {
    wA: 0,
    wB: 0
  };
  return function blendSimpleDirectional(weights, samples, input) {
    assertIsTrue(weights.length === samples.length);
    if (samples.length === 0) {
      return;
    }
    if (samples.length === 1) {
      weights[0] = 1.0;
      return;
    }
    if (Vec2.strictEquals(input, Vec2.ZERO)) {
      var _iCenter = samples.findIndex(function (sample) {
        return Vec2.strictEquals(sample, Vec2.ZERO);
      });
      if (_iCenter >= 0) {
        weights[_iCenter] = 1.0;
      } else {
        weights.fill(1.0 / samples.length);
      }
      return;
    }
    var iSectorStart = -1;
    var iSectorEnd = -1;
    var iCenter = -1;
    var lhsCosAngle = Number.NEGATIVE_INFINITY;
    var rhsCosAngle = Number.NEGATIVE_INFINITY;
    var inputX = input.x,
      inputY = input.y;
    for (var iSample = 0; iSample < samples.length; ++iSample) {
      var sample = samples[iSample];
      if (Vec2.equals(sample, Vec2.ZERO)) {
        iCenter = iSample;
        continue;
      }
      var sampleNormalized = Vec2.normalize(CACHE_NORMALIZED_SAMPLE, sample);
      var cosAngle = Vec2.dot(sampleNormalized, input);
      var sign = sampleNormalized.x * inputY - sampleNormalized.y * inputX;
      if (sign > 0) {
        if (cosAngle >= rhsCosAngle) {
          rhsCosAngle = cosAngle;
          iSectorStart = iSample;
        }
      } else if (cosAngle >= lhsCosAngle) {
        lhsCosAngle = cosAngle;
        iSectorEnd = iSample;
      }
    }
    var centerWeight = 0.0;
    if (iSectorStart < 0 || iSectorEnd < 0) {
      centerWeight = 1.0;
    } else {
      var _solveBarycentric = solveBarycentric(samples[iSectorStart], samples[iSectorEnd], input, CACHE_BARYCENTRIC_SOLUTIONS),
        wA = _solveBarycentric.wA,
        wB = _solveBarycentric.wB;
      var w1 = 0.0;
      var w2 = 0.0;
      var sum = wA + wB;
      if (sum > 1) {
        w1 = wA / sum;
        w2 = wB / sum;
      } else if (sum < 0) {
        w1 = 0.0;
        w2 = 0.0;
        centerWeight = 1.0;
      } else {
        w1 = wA;
        w2 = wB;
        centerWeight = 1.0 - sum;
      }
      weights[iSectorStart] = w1;
      weights[iSectorEnd] = w2;
    }
    if (centerWeight > 0.0) {
      if (iCenter >= 0) {
        weights[iCenter] = centerWeight;
      } else {
        var average = centerWeight / weights.length;
        for (var i = 0; i < weights.length; ++i) {
          weights[i] += average;
        }
      }
    }
  };
}();
function sampleFreeformCartesian(weights, thresholds, value) {
  sampleFreeform(weights, thresholds, value, getGradientBandCartesianCoords);
}
function sampleFreeform(weights, samples, value, getGradientBandCoords) {
  weights.fill(0.0);
  var pIpInput = new Vec2(0, 0);
  var pIJ = new Vec2(0, 0);
  var sumInfluence = 0.0;
  var nSamples = samples.length;
  for (var iSample = 0; iSample < nSamples; ++iSample) {
    var influence = Number.MAX_VALUE;
    var outsideHull = false;
    for (var jSample = 0; jSample < nSamples; ++jSample) {
      if (iSample === jSample) {
        continue;
      }
      getGradientBandCoords(samples[iSample], samples[jSample], value, pIpInput, pIJ);
      var t = 1 - Vec2.dot(pIpInput, pIJ) / Vec2.lengthSqr(pIJ);
      if (t < 0) {
        outsideHull = true;
        break;
      }
      influence = Math.min(influence, t);
    }
    if (!outsideHull) {
      weights[iSample] = influence;
      sumInfluence += influence;
    }
  }
  if (sumInfluence > 0) {
    weights.forEach(function (influence, index) {
      return weights[index] = influence / sumInfluence;
    });
  }
}
function solveBarycentric(a, b, p, resolutions) {
  var det = Vec2.cross(a, b);
  if (!det) {
    resolutions.wA = 0.0;
    resolutions.wB = 0.0;
  } else {
    resolutions.wA = Vec2.cross(p, b) / det;
    resolutions.wB = Vec2.cross(p, a) / -det;
  }
  return resolutions;
}
var getGradientBandCartesianCoords = function getGradientBandCartesianCoords(pI, pJ, input, pIpInput, pIpJ) {
  Vec2.subtract(pIpInput, input, pI);
  Vec2.subtract(pIpJ, pJ, pI);
};
var PRECOMPUTED_VIJ_DATA_STRIDE = 3;
var PolarSpaceGradientBandInterpolator2D = function () {
  function PolarSpaceGradientBandInterpolator2D(examples) {
    var angleMultiplier = PolarSpaceGradientBandInterpolator2D._ANGLE_MULTIPLIER;
    var nExamples = examples.length;
    var exampleMagnitudes = this._exampleMagnitudes = new Array(nExamples).fill(0.0);
    var exampleDirections = this._exampleDirections = examples.map(function (example, iExample) {
      var direction = Vec2.copy(new Vec2(), example);
      var magnitude = Vec2.len(direction);
      exampleMagnitudes[iExample] = magnitude;
      if (!approx(magnitude, 0.0, 1e-5)) {
        Vec2.multiplyScalar(direction, direction, 1.0 / magnitude);
      }
      return direction;
    });
    var precomputedVIJs = this._precomputedVIJs = new Float32Array(PRECOMPUTED_VIJ_DATA_STRIDE * nExamples * nExamples);
    for (var iExample = 0; iExample < nExamples; ++iExample) {
      var magnitudeI = exampleMagnitudes[iExample];
      var directionI = exampleDirections[iExample];
      for (var jExample = 0; jExample < nExamples; ++jExample) {
        if (iExample === jExample) {
          continue;
        }
        var magnitudeJ = exampleMagnitudes[jExample];
        var directionJ = exampleDirections[jExample];
        var averagedMagnitude = (magnitudeI + magnitudeJ) / 2;
        var pOutput = PRECOMPUTED_VIJ_DATA_STRIDE * (nExamples * iExample + jExample);
        precomputedVIJs[pOutput + 0] = (magnitudeJ - magnitudeI) / averagedMagnitude;
        precomputedVIJs[pOutput + 1] = signedAngle(directionI, directionJ) * angleMultiplier;
        precomputedVIJs[pOutput + 2] = averagedMagnitude;
      }
    }
    this._cacheVIXAngles = new Float32Array(nExamples);
  }
  var _proto = PolarSpaceGradientBandInterpolator2D.prototype;
  _proto.interpolate = function interpolate(weights, input) {
    var exampleDirections = this._exampleDirections,
      exampleMagnitudes = this._exampleMagnitudes,
      precomputedVIJs = this._precomputedVIJs,
      cacheVIXAngles = this._cacheVIXAngles;
    var cacheInputDirection = PolarSpaceGradientBandInterpolator2D._CACHE_INPUT_DIRECTION,
      cacheVIJ = PolarSpaceGradientBandInterpolator2D._CACHE_VIJ,
      cacheVIX = PolarSpaceGradientBandInterpolator2D._CACHE_VIX,
      angleMultiplier = PolarSpaceGradientBandInterpolator2D._ANGLE_MULTIPLIER;
    var nExamples = exampleDirections.length;
    assertIsTrue(weights.length === nExamples);
    if (nExamples === 0) {
      return;
    } else if (nExamples === 1) {
      weights[0] = 1.0;
      return;
    }
    var vX = input;
    var magnitudeX = Vec2.len(vX);
    var vIXAngles = cacheVIXAngles;
    if (Vec2.equals(vX, Vec2.ZERO)) {
      for (var iExample = 0; iExample < nExamples; ++iExample) {
        vIXAngles[iExample] = 0.0;
      }
    } else {
      var directionX = Vec2.multiplyScalar(cacheInputDirection, vX, 1.0 / magnitudeX);
      for (var _iExample = 0; _iExample < nExamples; ++_iExample) {
        var directionI = exampleDirections[_iExample];
        if (Vec2.equals(directionI, Vec2.ZERO)) {
          vIXAngles[_iExample] = 0.0;
        } else {
          vIXAngles[_iExample] = signedAngle(directionI, directionX) * angleMultiplier;
        }
      }
    }
    var totalWeight = 0.0;
    for (var _iExample2 = 0; _iExample2 < nExamples; ++_iExample2) {
      var magnitudeI = exampleMagnitudes[_iExample2];
      var _directionI = exampleDirections[_iExample2];
      var minInfluence = Number.POSITIVE_INFINITY;
      for (var jExample = 0; jExample < nExamples; ++jExample) {
        if (_iExample2 === jExample) {
          continue;
        }
        var directionJ = exampleDirections[jExample];
        var precomputedDataIndex = PRECOMPUTED_VIJ_DATA_STRIDE * (nExamples * _iExample2 + jExample);
        var vIJMag = precomputedVIJs[precomputedDataIndex + 0],
          vIJAnglePrecomputed = precomputedVIJs[precomputedDataIndex + 1],
          averagedMagnitude = precomputedVIJs[precomputedDataIndex + 2];
        var vIJAngle = vIJAnglePrecomputed;
        var vIXAngle = vIXAngles[_iExample2];
        if (Vec2.equals(_directionI, Vec2.ZERO)) {
          vIJAngle = vIXAngles[jExample];
        } else if (Vec2.equals(directionJ, Vec2.ZERO)) {
          vIJAngle = vIXAngles[_iExample2];
        } else if (Vec2.equals(vX, Vec2.ZERO)) {
          vIXAngle = vIJAngle;
        }
        var vIJ = Vec2.set(cacheVIJ, vIJMag, vIJAngle);
        var vIX = Vec2.set(cacheVIX, (magnitudeX - magnitudeI) / averagedMagnitude, vIXAngle);
        var influence = 1.0 - Vec2.dot(vIX, vIJ) / Vec2.lengthSqr(vIJ);
        if (influence <= 0) {
          minInfluence = 0.0;
          break;
        }
        minInfluence = Math.min(minInfluence, influence);
      }
      weights[_iExample2] = minInfluence;
      totalWeight += minInfluence;
    }
    if (totalWeight > 0) {
      for (var _iExample3 = 0; _iExample3 < nExamples; ++_iExample3) {
        weights[_iExample3] /= totalWeight;
      }
    } else {
      var averaged = 1.0 / nExamples;
      for (var _iExample4 = 0; _iExample4 < nExamples; ++_iExample4) {
        weights[_iExample4] = averaged;
      }
    }
  };
  return PolarSpaceGradientBandInterpolator2D;
}();
PolarSpaceGradientBandInterpolator2D._CACHE_INPUT_DIRECTION = new Vec2();
PolarSpaceGradientBandInterpolator2D._CACHE_VIJ = new Vec2();
PolarSpaceGradientBandInterpolator2D._CACHE_VIX = new Vec2();
PolarSpaceGradientBandInterpolator2D._ANGLE_MULTIPLIER = 1.0;
function signedAngle(v1, v2) {
  var angle = Vec2.angle(v1, v2);
  var determinate = v1.x * v2.y - v1.y * v2.x;
  return determinate < 0 ? -angle : angle;
}

var _dec$x, _class$y, _class2$s, _initializer$m, _dec2$s, _class3$5, _class4$5, _initializer2$f, _initializer3$7, _initializer4$4, _initializer5$3, _AnimationBlend2D;
var ccclass$9 = ccclass$g,
  serializable$7 = serializable$d;
var Algorithm;
(function (Algorithm) {
  Algorithm[Algorithm["SIMPLE_DIRECTIONAL"] = 0] = "SIMPLE_DIRECTIONAL";
  Algorithm[Algorithm["FREEFORM_CARTESIAN"] = 1] = "FREEFORM_CARTESIAN";
  Algorithm[Algorithm["FREEFORM_DIRECTIONAL"] = 2] = "FREEFORM_DIRECTIONAL";
})(Algorithm || (Algorithm = {}));
ccenum(Algorithm);
var AnimationBlend2DItem = (_dec$x = ccclass$9(CLASS_NAME_PREFIX_ANIM + "AnimationBlend2DItem"), _dec$x(_class$y = (_class2$s = function (_AnimationBlendItem) {
  function AnimationBlend2DItem() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _AnimationBlendItem.call.apply(_AnimationBlendItem, [this].concat(args)) || this;
    _this.threshold = _initializer$m && _initializer$m();
    return _this;
  }
  _inheritsLoose(AnimationBlend2DItem, _AnimationBlendItem);
  var _proto = AnimationBlend2DItem.prototype;
  _proto.clone = function clone() {
    var that = new AnimationBlend2DItem();
    this._copyTo(that);
    return that;
  };
  _proto._copyTo = function _copyTo(that) {
    _AnimationBlendItem.prototype._copyTo.call(this, that);
    Vec2.copy(that.threshold, this.threshold);
    return that;
  };
  return AnimationBlend2DItem;
}(AnimationBlendItem), _initializer$m = applyDecoratedInitializer(_class2$s.prototype, "threshold", [serializable$7], function () {
  return new Vec2();
}), _class2$s)) || _class$y);
var AnimationBlend2D = (_dec2$s = ccclass$9('cc.animation.AnimationBlend2D'), _dec2$s(_class3$5 = (_class4$5 = (_AnimationBlend2D = function (_AnimationBlend) {
  function AnimationBlend2D() {
    var _this2;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    _this2 = _AnimationBlend.call.apply(_AnimationBlend, [this].concat(args)) || this;
    _this2._items = _initializer2$f && _initializer2$f();
    _this2.paramX = _initializer3$7 && _initializer3$7();
    _this2.paramY = _initializer4$4 && _initializer4$4();
    _this2._algorithm = _initializer5$3 && _initializer5$3();
    _this2._polarSpaceGBI = undefined;
    return _this2;
  }
  _inheritsLoose(AnimationBlend2D, _AnimationBlend);
  var _proto2 = AnimationBlend2D.prototype;
  _proto2.__callOnAfterDeserializeRecursive = function __callOnAfterDeserializeRecursive() {
    this._tryReconstructPolarSpaceInterpolator();
  };
  _proto2.clone = function clone() {
    var that = new AnimationBlend2D();
    this.copyTo(that);
    that._items = this._items.map(function (item) {
      var _item$clone;
      return (_item$clone = item == null ? void 0 : item.clone()) !== null && _item$clone !== void 0 ? _item$clone : null;
    });
    that.paramX = this.paramX.clone();
    that.paramY = this.paramY.clone();
    that.algorithm = this._algorithm;
    return that;
  };
  _proto2[createEval] = function (context, ignoreEmbeddedPlayers) {
    var algorithm = this.algorithm;
    var evaluation;
    switch (algorithm) {
      case Algorithm.FREEFORM_DIRECTIONAL:
        assertIsTrue(this._polarSpaceGBI, "The polar space interpolator is not setup correctly!");
        evaluation = new PolarSpaceGradientBandBlend2DEval(context, ignoreEmbeddedPlayers, this, this._items, this._polarSpaceGBI, [0.0, 0.0]);
        break;
      default:
        assertIsTrue(false);
      case Algorithm.SIMPLE_DIRECTIONAL:
      case Algorithm.FREEFORM_CARTESIAN:
        evaluation = new AnimationBlend2DEval(context, ignoreEmbeddedPlayers, this, this._items, this._items.map(function (_ref) {
          var threshold = _ref.threshold;
          return threshold;
        }), algorithm, [0.0, 0.0]);
        break;
    }
    var initialValueX = bindOr(context, this.paramX, VariableType.FLOAT, evaluation.setInput, evaluation, 0);
    var initialValueY = bindOr(context, this.paramY, VariableType.FLOAT, evaluation.setInput, evaluation, 1);
    evaluation.setInput(initialValueX, 0);
    evaluation.setInput(initialValueY, 1);
    return evaluation;
  };
  _proto2._tryReconstructPolarSpaceInterpolator = function _tryReconstructPolarSpaceInterpolator() {
    if (this._algorithm === Algorithm.FREEFORM_DIRECTIONAL) {
      this._polarSpaceGBI = new PolarSpaceGradientBandInterpolator2D(this._items.map(function (item) {
        return item.threshold;
      }));
    } else {
      this._polarSpaceGBI = undefined;
    }
  };
  return _createClass(AnimationBlend2D, [{
    key: "algorithm",
    get: function get() {
      return this._algorithm;
    },
    set: function set(value) {
      if (value === this._algorithm) {
        return;
      }
      this._algorithm = value;
      this._tryReconstructPolarSpaceInterpolator();
    }
  }, {
    key: "items",
    get: function get() {
      return this._items;
    },
    set: function set(items) {
      this._items = Array.from(items);
      this._tryReconstructPolarSpaceInterpolator();
    }
  }]);
}(AnimationBlend), _AnimationBlend2D.Algorithm = Algorithm, _AnimationBlend2D.Item = AnimationBlend2DItem, _AnimationBlend2D), _initializer2$f = applyDecoratedInitializer(_class4$5.prototype, "_items", [serializable$7], function () {
  return [];
}), _initializer3$7 = applyDecoratedInitializer(_class4$5.prototype, "paramX", [serializable$7], function () {
  return new BindableNumber();
}), _initializer4$4 = applyDecoratedInitializer(_class4$5.prototype, "paramY", [serializable$7], function () {
  return new BindableNumber();
}), _initializer5$3 = applyDecoratedInitializer(_class4$5.prototype, "_algorithm", [serializable$7], function () {
  return Algorithm.SIMPLE_DIRECTIONAL;
}), _class4$5)) || _class3$5);
var AnimationBlend2DEval = function (_AnimationBlendEval) {
  function AnimationBlend2DEval(context, ignoreEmbeddedPlayers, base, items, thresholds, algorithm, inputs) {
    var _this3;
    _this3 = _AnimationBlendEval.call(this, context, ignoreEmbeddedPlayers, base, items, inputs) || this;
    _this3._thresholds = void 0;
    _this3._algorithm = void 0;
    _this3._value = new Vec2();
    _this3._thresholds = thresholds;
    _this3._algorithm = algorithm;
    _this3.doEval();
    return _this3;
  }
  _inheritsLoose(AnimationBlend2DEval, _AnimationBlendEval);
  var _proto3 = AnimationBlend2DEval.prototype;
  _proto3.eval = function _eval(weights, _ref2) {
    var x = _ref2[0],
      y = _ref2[1];
    Vec2.set(this._value, x, y);
    weights.fill(0);
    switch (this._algorithm) {
      case Algorithm.SIMPLE_DIRECTIONAL:
        blendSimpleDirectional(weights, this._thresholds, this._value);
        break;
      case Algorithm.FREEFORM_CARTESIAN:
        sampleFreeformCartesian(weights, this._thresholds, this._value);
        break;
    }
  };
  return AnimationBlend2DEval;
}(AnimationBlendEval);
var PolarSpaceGradientBandBlend2DEval = function (_AnimationBlendEval2) {
  function PolarSpaceGradientBandBlend2DEval(context, ignoreEmbeddedPlayers, base, items, interpolator, inputs) {
    var _this4;
    _this4 = _AnimationBlendEval2.call(this, context, ignoreEmbeddedPlayers, base, items, inputs) || this;
    _this4._interpolator = void 0;
    _this4._value = new Vec2();
    _this4._interpolator = interpolator;
    _this4.doEval();
    return _this4;
  }
  _inheritsLoose(PolarSpaceGradientBandBlend2DEval, _AnimationBlendEval2);
  var _proto4 = PolarSpaceGradientBandBlend2DEval.prototype;
  _proto4.eval = function _eval(weights, _ref3) {
    var x = _ref3[0],
      y = _ref3[1];
    Vec2.set(this._value, x, y);
    weights.fill(0);
    this._interpolator.interpolate(weights, this._value);
  };
  return PolarSpaceGradientBandBlend2DEval;
}(AnimationBlendEval);

var _dec$w, _class$x, _class2$r, _initializer$l, _dec2$r, _class3$4, _class4$4, _initializer2$e, _AnimationBlendDirect;
var ccclass$8 = ccclass$g,
  serializable$6 = serializable$d;
var AnimationBlendDirectItem = (_dec$w = ccclass$8(CLASS_NAME_PREFIX_ANIM + "AnimationBlendDirectItem"), _dec$w(_class$x = (_class2$r = function (_AnimationBlendItem) {
  function AnimationBlendDirectItem() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _AnimationBlendItem.call.apply(_AnimationBlendItem, [this].concat(args)) || this;
    _this.weight = _initializer$l && _initializer$l();
    return _this;
  }
  _inheritsLoose(AnimationBlendDirectItem, _AnimationBlendItem);
  var _proto = AnimationBlendDirectItem.prototype;
  _proto.clone = function clone() {
    var that = new AnimationBlendDirectItem();
    this._copyTo(that);
    return that;
  };
  _proto._copyTo = function _copyTo(that) {
    _AnimationBlendItem.prototype._copyTo.call(this, that);
    that.weight = this.weight;
    return that;
  };
  return AnimationBlendDirectItem;
}(AnimationBlendItem), _initializer$l = applyDecoratedInitializer(_class2$r.prototype, "weight", [serializable$6], function () {
  return new BindableNumber(0.0);
}), _class2$r)) || _class$x);
(_dec2$r = ccclass$8('cc.animation.AnimationBlendDirect'), _dec2$r(_class3$4 = (_class4$4 = (_AnimationBlendDirect = function (_AnimationBlend) {
  function AnimationBlendDirect() {
    var _this2;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    _this2 = _AnimationBlend.call.apply(_AnimationBlend, [this].concat(args)) || this;
    _this2._items = _initializer2$e && _initializer2$e();
    return _this2;
  }
  _inheritsLoose(AnimationBlendDirect, _AnimationBlend);
  var _proto2 = AnimationBlendDirect.prototype;
  _proto2.clone = function clone() {
    var that = new AnimationBlendDirect();
    this.copyTo(that);
    that._items = this._items.map(function (item) {
      var _item$clone;
      return (_item$clone = item == null ? void 0 : item.clone()) !== null && _item$clone !== void 0 ? _item$clone : null;
    });
    return that;
  };
  _proto2[createEval] = function (context, ignoreEmbeddedPlayers) {
    var myEval = new AnimationBlendDirectEval(context, ignoreEmbeddedPlayers, this, this._items, new Array(this._items.length).fill(0.0));
    for (var iItem = 0; iItem < this._items.length; ++iItem) {
      var item = this._items[iItem];
      var initialValue = bindOr(context, item.weight, VariableType.FLOAT, myEval.setInput, myEval, iItem);
      myEval.setInput(initialValue, iItem);
    }
    return myEval;
  };
  return _createClass(AnimationBlendDirect, [{
    key: "items",
    get: function get() {
      return this._items;
    },
    set: function set(value) {
      this._items = Array.from(value);
    }
  }]);
}(AnimationBlend), _AnimationBlendDirect.Item = AnimationBlendDirectItem, _AnimationBlendDirect), _initializer2$e = applyDecoratedInitializer(_class4$4.prototype, "_items", [serializable$6], function () {
  return [];
}), _class4$4)) || _class3$4);
var AnimationBlendDirectEval = function (_AnimationBlendEval) {
  function AnimationBlendDirectEval() {
    var _this3;
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    _this3 = _AnimationBlendEval.call.apply(_AnimationBlendEval, [this].concat(args)) || this;
    _this3.doEval();
    return _this3;
  }
  _inheritsLoose(AnimationBlendDirectEval, _AnimationBlendEval);
  var _proto3 = AnimationBlendDirectEval.prototype;
  _proto3.eval = function _eval(weights, inputs) {
    var nChildren = weights.length;
    for (var iChild = 0; iChild < nChildren; ++iChild) {
      weights[iChild] = inputs[iChild];
    }
  };
  return AnimationBlendDirectEval;
}(AnimationBlendEval);

var _dec$v, _class$w, _class2$q, _initializer$k, _initializer2$d, _dec2$q, _dec3$m, _class3$3, _class4$3, _initializer3$6;
var JointMask = (_dec$v = ccclass$g('cc.JointMask'), _dec$v(_class$w = (_class2$q = function JointMask() {
  this.path = _initializer$k && _initializer$k();
  this.enabled = _initializer2$d && _initializer2$d();
}, _initializer$k = applyDecoratedInitializer(_class2$q.prototype, "path", [serializable$d], function () {
  return '';
}), _initializer2$d = applyDecoratedInitializer(_class2$q.prototype, "enabled", [serializable$d], function () {
  return true;
}), _class2$q)) || _class$w);
var AnimationMask = (_dec2$q = ccclass$g(CLASS_NAME_PREFIX_ANIM + "AnimationMask"), _dec3$m = type$2(JointMask), _dec2$q(_class3$3 = (_class4$3 = function (_Asset) {
  function AnimationMask() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Asset.call.apply(_Asset, [this].concat(args)) || this;
    _this._jointMasks = _initializer3$6 && _initializer3$6();
    return _this;
  }
  _inheritsLoose(AnimationMask, _Asset);
  var _proto = AnimationMask.prototype;
  _proto.addJoint = function addJoint(path, enabled) {
    this.removeJoint(path);
    var info = new JointMask();
    info.path = path;
    info.enabled = enabled;
    this._jointMasks.push(info);
  };
  _proto.removeJoint = function removeJoint(removal) {
    removeIf(this._jointMasks, function (_ref) {
      var path = _ref.path;
      return path === removal;
    });
  };
  _proto.clear = function clear() {
    this._jointMasks.length = 0;
  };
  _proto.filterDisabledNodes = function filterDisabledNodes(root) {
    var jointMasks = this._jointMasks;
    var nJointMasks = jointMasks.length;
    var disabledNodes = new Set();
    for (var iJointMask = 0; iJointMask < nJointMasks; ++iJointMask) {
      var _jointMasks$iJointMas = jointMasks[iJointMask],
        path = _jointMasks$iJointMas.path,
        enabled = _jointMasks$iJointMas.enabled;
      if (enabled) {
        continue;
      }
      var node = root.getChildByPath(path);
      if (node) {
        disabledNodes.add(node);
      }
    }
    return disabledNodes;
  };
  _proto.isExcluded = function isExcluded(path) {
    var _this$_jointMasks$fin, _this$_jointMasks$fin2;
    return !((_this$_jointMasks$fin = (_this$_jointMasks$fin2 = this._jointMasks.find(function (_ref2) {
      var p = _ref2.path;
      return p === path;
    })) == null ? void 0 : _this$_jointMasks$fin2.enabled) !== null && _this$_jointMasks$fin !== void 0 ? _this$_jointMasks$fin : true);
  };
  return _createClass(AnimationMask, [{
    key: "joints",
    get: function get() {
      return this._jointMasks;
    },
    set: function set(value) {
      this.clear();
      for (var _iterator = _createForOfIteratorHelperLoose(value), _step; !(_step = _iterator()).done;) {
        var joint = _step.value;
        this.addJoint(joint.path, joint.enabled);
      }
    }
  }]);
}(Asset), _initializer3$6 = applyDecoratedInitializer(_class4$3.prototype, "_jointMasks", [serializable$d], function () {
  return [];
}), _applyDecoratedDescriptor(_class4$3.prototype, "joints", [_dec3$m], Object.getOwnPropertyDescriptor(_class4$3.prototype, "joints"), _class4$3.prototype), _class4$3)) || _class3$3);

var _dec$u, _class$v, _class2$p, _initializer$j, _initializer2$c, _dec2$p, _dec3$l, _class3$2, _class4$2, _initializer3$5, _initializer4$3, _dec4$f, _class5$1, _class6$1, _initializer5$2;
var ClipOverrideEntry = (_dec$u = ccclass$g(CLASS_NAME_PREFIX_ANIM + "ClipOverrideEntry"), _dec$u(_class$v = (_class2$p = function ClipOverrideEntry() {
  this.original = _initializer$j && _initializer$j();
  this.substitution = _initializer2$c && _initializer2$c();
}, _initializer$j = applyDecoratedInitializer(_class2$p.prototype, "original", [serializable$d], function () {
  return null;
}), _initializer2$c = applyDecoratedInitializer(_class2$p.prototype, "substitution", [serializable$d], function () {
  return null;
}), _class2$p)) || _class$v);
var AnimationGraphVariant = (_dec2$p = ccclass$g(CLASS_NAME_PREFIX_ANIM + "AnimationGraphVariant"), _dec3$l = type$2(AnimationGraph), _dec2$p(_class3$2 = (_class4$2 = function (_AnimationGraphLike) {
  function AnimationGraphVariant() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _AnimationGraphLike.call.apply(_AnimationGraphLike, [this].concat(args)) || this;
    _this._graph = _initializer3$5 && _initializer3$5();
    _this._clipOverrides = _initializer4$3 && _initializer4$3();
    return _this;
  }
  _inheritsLoose(AnimationGraphVariant, _AnimationGraphLike);
  return _createClass(AnimationGraphVariant, [{
    key: "original",
    get: function get() {
      return this._graph;
    },
    set: function set(value) {
      this._graph = value;
    }
  }, {
    key: "clipOverrides",
    get: function get() {
      return this._clipOverrides;
    }
  }]);
}(AnimationGraphLike), _applyDecoratedDescriptor(_class4$2.prototype, "original", [_dec3$l], Object.getOwnPropertyDescriptor(_class4$2.prototype, "original"), _class4$2.prototype), _initializer3$5 = applyDecoratedInitializer(_class4$2.prototype, "_graph", [serializable$d], function () {
  return null;
}), _initializer4$3 = applyDecoratedInitializer(_class4$2.prototype, "_clipOverrides", [serializable$d], function () {
  return new ClipOverrideMap();
}), _class4$2)) || _class3$2);
var ClipOverrideMap = (_dec4$f = ccclass$g(CLASS_NAME_PREFIX_ANIM + "ClipOverrideMap"), _dec4$f(_class5$1 = (_class6$1 = function () {
  function ClipOverrideMap() {
    this._entries = _initializer5$2 && _initializer5$2();
  }
  var _proto = ClipOverrideMap.prototype;
  _proto[Symbol.iterator] = function () {
    return this._entries[Symbol.iterator]();
  };
  _proto.has = function has(original) {
    return !!this._entries.find(function (_ref) {
      var o = _ref.original;
      return o === original;
    });
  };
  _proto.get = function get(original) {
    var entry = this._entries.find(function (_ref2) {
      var o = _ref2.original;
      return o === original;
    });
    return entry == null ? void 0 : entry.substitution;
  };
  _proto.set = function set(original, substitution) {
    var entry = this._entries.find(function (_ref3) {
      var o = _ref3.original;
      return o === original;
    });
    if (entry) {
      entry.substitution = substitution;
    } else {
      var newEntry = new ClipOverrideEntry();
      newEntry.original = original;
      newEntry.substitution = substitution;
      this._entries.push(newEntry);
    }
  };
  _proto["delete"] = function _delete(original) {
    removeIf(this._entries, function (_ref4) {
      var o = _ref4.original;
      return o === original;
    });
  };
  _proto.clear = function clear() {
    this._entries.length = 0;
  };
  return _createClass(ClipOverrideMap, [{
    key: "size",
    get: function get() {
      return this._entries.length;
    }
  }]);
}(), _initializer5$2 = applyDecoratedInitializer(_class6$1.prototype, "_entries", [serializable$d], function () {
  return [];
}), _class6$1)) || _class5$1);

var POSE_GRAPH_NODE_MENU_PREFIX_POSE = "i18n:ENGINE.animation_graph.pose_graph_node_sub_categories.pose_nodes/";
var POSE_GRAPH_NODE_MENU_PREFIX_POSE_BLEND = POSE_GRAPH_NODE_MENU_PREFIX_POSE + "/" + "i18n:ENGINE.animation_graph.pose_graph_node_sub_categories.pose_nodes_blend/";

var _dec$t, _dec2$o, _dec3$k, _dec4$e, _class$u, _class2$o, _initializer$i;
var createNodeFactory$1 = {
  listEntries: function listEntries(context) {
    return [].concat(context.animationGraph.layers[context.layerIndex].stashes()).map(function (_ref) {
      var stashId = _ref[0];
      return {
        arg: stashId,
        menu: stashId
      };
    });
  },
  create: function create(arg) {
    var node = new PoseNodeUseStashedPose();
    node.stashName = arg;
    return node;
  }
};
var PoseNodeUseStashedPose = (_dec$t = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeUseStashedPose"), _dec2$o = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE), _dec3$k = poseGraphCreateNodeFactory(createNodeFactory$1), _dec4$e = poseGraphNodeAppearance({
  inline: true
}), _dec$t(_class$u = _dec2$o(_class$u = _dec3$k(_class$u = _dec4$e(_class$u = (_class2$o = function (_PoseNode) {
  function PoseNodeUseStashedPose() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNode.call.apply(_PoseNode, [this].concat(args)) || this;
    _this.stashName = _initializer$i && _initializer$i();
    _this._runtimeStash = undefined;
    return _this;
  }
  _inheritsLoose(PoseNodeUseStashedPose, _PoseNode);
  var _proto = PoseNodeUseStashedPose.prototype;
  _proto.bind = function bind(context) {
    var stashName = this.stashName;
    if (!stashName) {
      return;
    }
    var runtimeStash = context.stashView.bindStash(stashName);
    this._runtimeStash = runtimeStash;
  };
  _proto.settle = function settle(context) {};
  _proto.reenter = function reenter() {
    var _this$_runtimeStash;
    (_this$_runtimeStash = this._runtimeStash) == null ? void 0 : _this$_runtimeStash.reenter();
  };
  _proto.doUpdate = function doUpdate(context) {
    var _this$_runtimeStash2;
    (_this$_runtimeStash2 = this._runtimeStash) == null ? void 0 : _this$_runtimeStash2.requestUpdate(context);
  };
  _proto.doEvaluate = function doEvaluate(context) {
    var _this$_runtimeStash$e, _this$_runtimeStash3;
    return (_this$_runtimeStash$e = (_this$_runtimeStash3 = this._runtimeStash) == null ? void 0 : _this$_runtimeStash3.evaluate(context)) !== null && _this$_runtimeStash$e !== void 0 ? _this$_runtimeStash$e : context.pushDefaultedPose();
  };
  return PoseNodeUseStashedPose;
}(PoseNode), _initializer$i = applyDecoratedInitializer(_class2$o.prototype, "stashName", [serializable$d], function () {
  return '';
}), _class2$o)) || _class$u) || _class$u) || _class$u) || _class$u);

var _dec$s, _class$t, _class2$n, _initializer$h, _initializer2$b, _UnaryCondition;
var ccclass$7 = ccclass$g,
  serializable$5 = serializable$d;
var UnaryOperator;
(function (UnaryOperator) {
  UnaryOperator[UnaryOperator["TRUTHY"] = 0] = "TRUTHY";
  UnaryOperator[UnaryOperator["FALSY"] = 1] = "FALSY";
})(UnaryOperator || (UnaryOperator = {}));
(_dec$s = ccclass$7(CLASS_NAME_PREFIX_ANIM + "UnaryCondition"), _dec$s(_class$t = (_class2$n = (_UnaryCondition = function () {
  function UnaryCondition() {
    this.operator = _initializer$h && _initializer$h();
    this.operand = _initializer2$b && _initializer2$b();
  }
  var _proto = UnaryCondition.prototype;
  _proto.clone = function clone() {
    var that = new UnaryCondition();
    that.operator = this.operator;
    that.operand = this.operand.clone();
    return that;
  };
  _proto[createEval] = function (context) {
    var operator = this.operator,
      operand = this.operand;
    var evaluation = new UnaryConditionEval(operator, false);
    var value = bindOr(context, operand, VariableType.BOOLEAN, evaluation.setOperand, evaluation);
    evaluation.reset(value);
    return evaluation;
  };
  return UnaryCondition;
}(), _UnaryCondition.Operator = UnaryOperator, _UnaryCondition), _initializer$h = applyDecoratedInitializer(_class2$n.prototype, "operator", [serializable$5], function () {
  return UnaryOperator.TRUTHY;
}), _initializer2$b = applyDecoratedInitializer(_class2$n.prototype, "operand", [serializable$5], function () {
  return new BindableBoolean();
}), _class2$n)) || _class$t);
var UnaryConditionEval = function () {
  function UnaryConditionEval(operator, operand) {
    this._operator = operator;
    this._operand = operand;
    this._eval();
  }
  var _proto2 = UnaryConditionEval.prototype;
  _proto2.reset = function reset(value) {
    this.setOperand(value);
  };
  _proto2.setOperand = function setOperand(value) {
    this._operand = value;
    this._eval();
  };
  _proto2.eval = function _eval() {
    return this._result;
  };
  _proto2._eval = function _eval() {
    var operand = this._operand;
    switch (this._operator) {
      default:
      case UnaryOperator.TRUTHY:
        this._result = !!operand;
        break;
      case UnaryOperator.FALSY:
        this._result = !operand;
        break;
    }
  };
  return UnaryConditionEval;
}();

var TCBindingValueType;
(function (TCBindingValueType) {
  TCBindingValueType[TCBindingValueType["FLOAT"] = 0] = "FLOAT";
  TCBindingValueType[TCBindingValueType["INTEGER"] = 3] = "INTEGER";
})(TCBindingValueType || (TCBindingValueType = {}));
var TCBinding = function TCBinding() {};

var provide = function provide() {
  for (var _len = arguments.length, valueTypes = new Array(_len), _key = 0; _key < _len; _key++) {
    valueTypes[_key] = arguments[_key];
  }
  return function () {} ;
};
var TCBindingTransitionSourceFilter;
(function (TCBindingTransitionSourceFilter) {
  TCBindingTransitionSourceFilter[TCBindingTransitionSourceFilter["MOTION"] = 1] = "MOTION";
  TCBindingTransitionSourceFilter[TCBindingTransitionSourceFilter["POSE"] = 2] = "POSE";
  TCBindingTransitionSourceFilter[TCBindingTransitionSourceFilter["EMPTY"] = 4] = "EMPTY";
  TCBindingTransitionSourceFilter[TCBindingTransitionSourceFilter["WEIGHTED"] = 7] = "WEIGHTED";
})(TCBindingTransitionSourceFilter || (TCBindingTransitionSourceFilter = {}));
var support = function support(transitionSourceFilter) {
  return function () {} ;
};

var _dec$r, _dec2$n, _class$s, _class2$m, _initializer$g, _initializer2$a;
var ccclass$6 = ccclass$g,
  serializable$4 = serializable$d;
var TCVariableBinding = (_dec$r = ccclass$6(CLASS_NAME_PREFIX_ANIM + "TCVariableBinding"), _dec2$n = provide(TCBindingValueType.FLOAT, TCBindingValueType.INTEGER), _dec$r(_class$s = _dec2$n(_class$s = (_class2$m = function (_TCBinding) {
  function TCVariableBinding() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _TCBinding.call.apply(_TCBinding, [this].concat(args)) || this;
    _this.type = _initializer$g && _initializer$g();
    _this.variableName = _initializer2$a && _initializer2$a();
    return _this;
  }
  _inheritsLoose(TCVariableBinding, _TCBinding);
  var _proto = TCVariableBinding.prototype;
  _proto.getValueType = function getValueType() {
    return this.type;
  };
  _proto.bind = function bind(context) {
    var varInstance = context.getVar(this.variableName);
    if (!varInstance) {
      return undefined;
    }
    return new TCVariableBindingEvaluation(varInstance);
  };
  return TCVariableBinding;
}(TCBinding), _initializer$g = applyDecoratedInitializer(_class2$m.prototype, "type", [serializable$4, editorOnly], function () {
  return TCBindingValueType.FLOAT;
}), _initializer2$a = applyDecoratedInitializer(_class2$m.prototype, "variableName", [serializable$4], function () {
  return '';
}), _class2$m)) || _class$s) || _class$s);
var TCVariableBindingEvaluation = function () {
  function TCVariableBindingEvaluation(_varInstance) {
    this._varInstance = _varInstance;
  }
  var _proto2 = TCVariableBindingEvaluation.prototype;
  _proto2.evaluate = function evaluate() {
    return this._varInstance.value;
  };
  return TCVariableBindingEvaluation;
}();

var _dec$q, _dec2$m, _class$r, _class2$l, _initializer$f;
var ccclass$5 = ccclass$g,
  serializable$3 = serializable$d;
(_dec$q = ccclass$5(CLASS_NAME_PREFIX_ANIM + "TCAuxiliaryCurveBinding"), _dec2$m = provide(TCBindingValueType.FLOAT), _dec$q(_class$r = _dec2$m(_class$r = (_class2$l = function (_TCBinding) {
  function TCAuxiliaryCurveBinding() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _TCBinding.call.apply(_TCBinding, [this].concat(args)) || this;
    _this.curveName = _initializer$f && _initializer$f();
    return _this;
  }
  _inheritsLoose(TCAuxiliaryCurveBinding, _TCBinding);
  var _proto = TCAuxiliaryCurveBinding.prototype;
  _proto.getValueType = function getValueType() {
    return TCBindingValueType.FLOAT;
  };
  _proto.bind = function bind(context) {
    var view = context.getEvaluationTimeAuxiliaryCurveView();
    return new TCAuxiliaryCurveBindingEvaluation(view, this.curveName);
  };
  return TCAuxiliaryCurveBinding;
}(TCBinding), _initializer$f = applyDecoratedInitializer(_class2$l.prototype, "curveName", [serializable$3], function () {
  return '';
}), _class2$l)) || _class$r) || _class$r);
var TCAuxiliaryCurveBindingEvaluation = function () {
  function TCAuxiliaryCurveBindingEvaluation(_view, _curveName) {
    this._view = _view;
    this._curveName = _curveName;
  }
  var _proto2 = TCAuxiliaryCurveBindingEvaluation.prototype;
  _proto2.evaluate = function evaluate() {
    return this._view.get(this._curveName);
  };
  return TCAuxiliaryCurveBindingEvaluation;
}();

var _dec$p, _dec2$l, _dec3$j, _class$q;
var ccclass$4 = ccclass$g;
(_dec$p = ccclass$4(CLASS_NAME_PREFIX_ANIM + "TCStateWeightBinding"), _dec2$l = provide(TCBindingValueType.FLOAT), _dec3$j = support(TCBindingTransitionSourceFilter.WEIGHTED), _dec$p(_class$q = _dec2$l(_class$q = _dec3$j(_class$q = function (_TCBinding) {
  function TCStateWeightBinding() {
    return _TCBinding.apply(this, arguments) || this;
  }
  _inheritsLoose(TCStateWeightBinding, _TCBinding);
  var _proto = TCStateWeightBinding.prototype;
  _proto.getValueType = function getValueType() {
    return TCBindingValueType.FLOAT;
  };
  _proto.bind = function bind(_context) {
    return new TCStateWeightBindingEvaluation();
  };
  return TCStateWeightBinding;
}(TCBinding)) || _class$q) || _class$q) || _class$q);
var TCStateWeightBindingEvaluation = function () {
  function TCStateWeightBindingEvaluation() {}
  var _proto2 = TCStateWeightBindingEvaluation.prototype;
  _proto2.evaluate = function evaluate(context) {
    return context.sourceStateWeight;
  };
  return TCStateWeightBindingEvaluation;
}();

var _dec$o, _dec2$k, _dec3$i, _class$p;
var ccclass$3 = ccclass$g;
(_dec$o = ccclass$3(CLASS_NAME_PREFIX_ANIM + "TCStateMotionTimeBinding"), _dec2$k = provide(TCBindingValueType.FLOAT), _dec3$i = support(TCBindingTransitionSourceFilter.POSE), _dec$o(_class$p = _dec2$k(_class$p = _dec3$i(_class$p = function (_TCBinding) {
  function TCStateMotionTimeBinding() {
    return _TCBinding.apply(this, arguments) || this;
  }
  _inheritsLoose(TCStateMotionTimeBinding, _TCBinding);
  var _proto = TCStateMotionTimeBinding.prototype;
  _proto.getValueType = function getValueType() {
    return TCBindingValueType.FLOAT;
  };
  _proto.bind = function bind(_context) {
    return new TCStateMotionTimeBindingEvaluation();
  };
  return TCStateMotionTimeBinding;
}(TCBinding)) || _class$p) || _class$p) || _class$p);
var TCStateMotionTimeBindingEvaluation = function () {
  function TCStateMotionTimeBindingEvaluation() {}
  var _proto2 = TCStateMotionTimeBindingEvaluation.prototype;
  _proto2.evaluate = function evaluate(context) {
    return context.sourceStateMotionTimeNormalized;
  };
  return TCStateMotionTimeBindingEvaluation;
}();

var _dec$n, _class$o, _class2$k, _initializer$e, _initializer2$9, _initializer3$4, _initializer4$2, _BinaryCondition;
var ccclass$2 = ccclass$g,
  serializable$2 = serializable$d;
var BinaryOperator;
(function (BinaryOperator) {
  BinaryOperator[BinaryOperator["EQUAL_TO"] = 0] = "EQUAL_TO";
  BinaryOperator[BinaryOperator["NOT_EQUAL_TO"] = 1] = "NOT_EQUAL_TO";
  BinaryOperator[BinaryOperator["LESS_THAN"] = 2] = "LESS_THAN";
  BinaryOperator[BinaryOperator["LESS_THAN_OR_EQUAL_TO"] = 3] = "LESS_THAN_OR_EQUAL_TO";
  BinaryOperator[BinaryOperator["GREATER_THAN"] = 4] = "GREATER_THAN";
  BinaryOperator[BinaryOperator["GREATER_THAN_OR_EQUAL_TO"] = 5] = "GREATER_THAN_OR_EQUAL_TO";
})(BinaryOperator || (BinaryOperator = {}));
(_dec$n = ccclass$2(CLASS_NAME_PREFIX_ANIM + "BinaryCondition"), _dec$n(_class$o = (_class2$k = (_BinaryCondition = function () {
  function BinaryCondition() {
    this.operator = _initializer$e && _initializer$e();
    this.lhs = _initializer2$9 && _initializer2$9();
    this.lhsBinding = _initializer3$4 && _initializer3$4();
    this.rhs = _initializer4$2 && _initializer4$2();
  }
  var _proto = BinaryCondition.prototype;
  _proto.clone = function clone() {
    var that = new BinaryCondition();
    that.operator = this.operator;
    that.lhs = this.lhs;
    that.lhsBinding = instantiate(this.lhsBinding);
    that.rhs = this.rhs;
    return that;
  };
  _proto[createEval] = function (context) {
    var _this$lhsBinding;
    var lhsBindingEvaluation = (_this$lhsBinding = this.lhsBinding) == null ? void 0 : _this$lhsBinding.bind(context);
    var binaryConditionEval = new BinaryConditionEval(this.operator, this.lhs, this.rhs, lhsBindingEvaluation);
    return binaryConditionEval;
  };
  return BinaryCondition;
}(), _BinaryCondition.Operator = BinaryOperator, _BinaryCondition), _initializer$e = applyDecoratedInitializer(_class2$k.prototype, "operator", [serializable$2], function () {
  return BinaryOperator.EQUAL_TO;
}), _initializer2$9 = applyDecoratedInitializer(_class2$k.prototype, "lhs", [serializable$2], function () {
  return 0.0;
}), _initializer3$4 = applyDecoratedInitializer(_class2$k.prototype, "lhsBinding", [serializable$2], function () {
  return new TCVariableBinding();
}), _initializer4$2 = applyDecoratedInitializer(_class2$k.prototype, "rhs", [serializable$2], function () {
  return 0.0;
}), _class2$k)) || _class$o);
var BinaryConditionEval = function () {
  function BinaryConditionEval(_operator, lhsValue, rhsValue, _lhsBindingEvaluation) {
    this._operator = _operator;
    this._lhsBindingEvaluation = _lhsBindingEvaluation;
    this._lhsValue = lhsValue;
    this._rhsValue = rhsValue;
  }
  var _proto2 = BinaryConditionEval.prototype;
  _proto2.eval = function _eval(context) {
    var _this$_lhsBindingEval, _this$_lhsBindingEval2;
    var lhsValue = (_this$_lhsBindingEval = (_this$_lhsBindingEval2 = this._lhsBindingEvaluation) == null ? void 0 : _this$_lhsBindingEval2.evaluate(context)) !== null && _this$_lhsBindingEval !== void 0 ? _this$_lhsBindingEval : this._lhsValue;
    var rhsValue = this._rhsValue;
    switch (this._operator) {
      default:
      case BinaryOperator.EQUAL_TO:
        return lhsValue === rhsValue;
      case BinaryOperator.NOT_EQUAL_TO:
        return lhsValue !== rhsValue;
      case BinaryOperator.LESS_THAN:
        return lhsValue < rhsValue;
      case BinaryOperator.LESS_THAN_OR_EQUAL_TO:
        return lhsValue <= rhsValue;
      case BinaryOperator.GREATER_THAN:
        return lhsValue > rhsValue;
      case BinaryOperator.GREATER_THAN_OR_EQUAL_TO:
        return lhsValue >= rhsValue;
    }
  };
  return BinaryConditionEval;
}();

var _dec$m, _class$n, _class2$j, _initializer$d;
var ccclass$1 = ccclass$g,
  serializable$1 = serializable$d;
var TriggerCondition = (_dec$m = ccclass$1(CLASS_NAME_PREFIX_ANIM + "TriggerCondition"), _dec$m(_class$n = (_class2$j = function () {
  function TriggerCondition() {
    this.trigger = _initializer$d && _initializer$d();
  }
  var _proto = TriggerCondition.prototype;
  _proto.clone = function clone() {
    var that = new TriggerCondition();
    that.trigger = this.trigger;
    return that;
  };
  _proto[createEval] = function (context) {
    var evaluation = new TriggerConditionEval(false);
    var triggerInstance = context.getVar(this.trigger);
    if (validateVariableExistence(triggerInstance, this.trigger)) {
      validateVariableTypeTriggerLike(triggerInstance.type, this.trigger);
      evaluation.setTrigger(triggerInstance.bind(evaluation.setTrigger, evaluation));
    }
    return evaluation;
  };
  return TriggerCondition;
}(), _initializer$d = applyDecoratedInitializer(_class2$j.prototype, "trigger", [serializable$1], function () {
  return '';
}), _class2$j)) || _class$n);
var TriggerConditionEval = function () {
  function TriggerConditionEval(triggered) {
    this._triggered = false;
    this._triggered = triggered;
  }
  var _proto2 = TriggerConditionEval.prototype;
  _proto2.setTrigger = function setTrigger(trigger) {
    this._triggered = trigger;
  };
  _proto2.eval = function _eval() {
    return this._triggered;
  };
  return TriggerConditionEval;
}();

var _dec$l, _class$m;
var StateMachineComponent = (_dec$l = ccclass$g(CLASS_NAME_PREFIX_ANIM + "StateMachineComponent"), _dec$l(_class$m = function () {
  function StateMachineComponent() {}
  var _proto = StateMachineComponent.prototype;
  _proto.onMotionStateEnter = function onMotionStateEnter(controller, motionStateStatus) {};
  _proto.onMotionStateExit = function onMotionStateExit(controller, motionStateStatus) {};
  _proto.onMotionStateUpdate = function onMotionStateUpdate(controller, motionStateStatus) {};
  _proto.onStateMachineEnter = function onStateMachineEnter(controller) {};
  _proto.onStateMachineExit = function onStateMachineExit(controller) {};
  return StateMachineComponent;
}()) || _class$m);

var TRANSFORM_STRIDE_IN_FLOATS = 10;
var TRANSFORM_STRIDE_IN_BYTES = Float64Array.BYTES_PER_ELEMENT * TRANSFORM_STRIDE_IN_FLOATS;
var ROTATION_OFFSET = 3;
var SCALE_OFFSET = ROTATION_OFFSET + 4;
var vec3FromArray = Vec3.fromArray;
var vec3ToArray = Vec3.toArray;
var quatFromArray = Quat.fromArray;
var quatToArray = Quat.toArray;
var TransformArray = function () {
  function TransformArray(bufferOrLength, byteOffset, length_) {
    this._data = void 0;
    if (typeof bufferOrLength === 'undefined') {
      this._data = new Float64Array();
    } else if (typeof bufferOrLength === 'number') {
      this._data = new Float64Array(TRANSFORM_STRIDE_IN_FLOATS * bufferOrLength);
    } else {
      this._data = new Float64Array(bufferOrLength, byteOffset, typeof length_ === 'number' ? TRANSFORM_STRIDE_IN_FLOATS * length_ : undefined);
    }
  }
  var _proto = TransformArray.prototype;
  _proto.getTransform = function getTransform(index, out) {
    var data = this._data;
    var position = out.position,
      rotation = out.rotation,
      scale = out.scale;
    var baseOffset = TRANSFORM_STRIDE_IN_FLOATS * index;
    vec3FromArray(position, data, baseOffset);
    quatFromArray(rotation, data, baseOffset + ROTATION_OFFSET);
    vec3FromArray(scale, data, baseOffset + SCALE_OFFSET);
    return out;
  };
  _proto.getPosition = function getPosition(index, out) {
    var data = this._data;
    var baseOffset = TRANSFORM_STRIDE_IN_FLOATS * index;
    vec3FromArray(out, data, baseOffset);
    return out;
  };
  _proto.getRotation = function getRotation(index, out) {
    var data = this._data;
    var baseOffset = TRANSFORM_STRIDE_IN_FLOATS * index;
    quatFromArray(out, data, baseOffset + ROTATION_OFFSET);
    return out;
  };
  _proto.getScale = function getScale(index, out) {
    var data = this._data;
    var baseOffset = TRANSFORM_STRIDE_IN_FLOATS * index;
    vec3FromArray(out, data, baseOffset + SCALE_OFFSET);
    return out;
  };
  _proto.setTransform = function setTransform(index, value) {
    var data = this._data;
    var position = value.position,
      rotation = value.rotation,
      scale = value.scale;
    var baseOffset = TRANSFORM_STRIDE_IN_FLOATS * index;
    vec3ToArray(data, position, baseOffset);
    quatToArray(data, rotation, baseOffset + ROTATION_OFFSET);
    vec3ToArray(data, scale, baseOffset + SCALE_OFFSET);
  };
  _proto.setPosition = function setPosition(index, value) {
    var data = this._data;
    var baseOffset = TRANSFORM_STRIDE_IN_FLOATS * index;
    vec3ToArray(data, value, baseOffset);
  };
  _proto.setRotation = function setRotation(index, value) {
    var data = this._data;
    var baseOffset = TRANSFORM_STRIDE_IN_FLOATS * index;
    quatToArray(data, value, baseOffset + ROTATION_OFFSET);
  };
  _proto.setScale = function setScale(index, value) {
    var data = this._data;
    var baseOffset = TRANSFORM_STRIDE_IN_FLOATS * index;
    vec3ToArray(data, value, baseOffset + SCALE_OFFSET);
  };
  _proto.copyWithin = function copyWithin(target, start, end) {
    this._data.copyWithin(target * TRANSFORM_STRIDE_IN_FLOATS, start * TRANSFORM_STRIDE_IN_FLOATS, typeof end === 'number' ? end * TRANSFORM_STRIDE_IN_FLOATS : undefined);
  };
  _proto.fill = function fill(value, start, end) {
    var _start, _end;
    var length = this.length;
    (_start = start) !== null && _start !== void 0 ? _start : start = 0;
    (_end = end) !== null && _end !== void 0 ? _end : end = length;
    if (start >= length) {
      return;
    }
    this.setTransform(start, value);
    for (var i = start + 1; i < end; ++i) {
      this.copyWithin(i, start, start + 1);
    }
  };
  _proto.fillZero = function fillZero(start, end) {
    this._data.fill(0.0, typeof start === 'number' ? start * TRANSFORM_STRIDE_IN_FLOATS : undefined, typeof end === 'number' ? end * TRANSFORM_STRIDE_IN_FLOATS : undefined);
  };
  _proto.set = function set(transformArray, targetOffset) {
    this._data.set(transformArray._data, typeof targetOffset === 'number' ? targetOffset * TRANSFORM_STRIDE_IN_FLOATS : undefined);
  };
  _proto.slice = function slice(start, end) {
    var dataSliced = this._data.slice(typeof start === 'number' ? start * TRANSFORM_STRIDE_IN_FLOATS : undefined, typeof end === 'number' ? end * TRANSFORM_STRIDE_IN_FLOATS : undefined);
    return new TransformArray(dataSliced.buffer, dataSliced.byteOffset, dataSliced.length / TRANSFORM_STRIDE_IN_FLOATS);
  };
  _proto.copyRange = function copyRange(targetOffset, source, sourceOffset, size) {
    var sizeInFloats = TRANSFORM_STRIDE_IN_FLOATS * size;
    var targetFloats = this._data;
    var targetStartInFloats = TRANSFORM_STRIDE_IN_FLOATS * targetOffset;
    var sourceFloats = source._data;
    var sourceStartInFloats = TRANSFORM_STRIDE_IN_FLOATS * sourceOffset;
    for (var i = 0; i < sizeInFloats; ++i) {
      targetFloats[targetStartInFloats + i] = sourceFloats[sourceStartInFloats + i];
    }
  };
  return _createClass(TransformArray, [{
    key: "buffer",
    get: function get() {
      return this._data.buffer;
    }
  }, {
    key: "byteLength",
    get: function get() {
      return this._data.byteLength;
    }
  }, {
    key: "byteOffset",
    get: function get() {
      return this._data.byteOffset;
    }
  }, {
    key: "length",
    get: function get() {
      return this._data.length / TRANSFORM_STRIDE_IN_FLOATS;
    }
  }], [{
    key: "BYTES_PER_ELEMENT",
    get: function get() {
      return TRANSFORM_STRIDE_IN_BYTES;
    }
  }]);
}();

var allocatorPageCountTag = Symbol('[[The count of pages used by this allocator.]]' );
var onStackPurgedTag = Symbol("[[Notify that theres is no allocator on the stack anymore.]]" );
var SharedMemoryPage = function SharedMemoryPage(byteLength) {
  this.buffer = void 0;
  this.useCount = 0;
  this.buffer = new ArrayBuffer(byteLength);
};
var PagedStack = function () {
  function PagedStack(_manager, _pageSize) {
    this._locking = false;
    this._pages = [];
    this._allocatorCount = 0;
    this._manager = _manager;
    this._pageSize = _pageSize;
  }
  var _proto = PagedStack.prototype;
  _proto.debugLock = function debugLock() {
    assertIsTrue(!this._locking, "The memory is locking.");
    this._locking = true;
  };
  _proto.debugUnlock = function debugUnlock() {
    assertIsTrue(this._locking, "Wrong execution logic: the memory is not locking.");
    this._locking = false;
  };
  _proto.getPageMemory = function getPageMemory(index) {
    assertIsTrue(index >= 0 && index < this._pages.length, "Page index out of range");
    return this._pages[index].buffer;
  };
  _proto.pushPage = function pushPage(allocator) {
    var oldAllocatorPageCount = allocator[allocatorPageCountTag];
    assertIsTrue(oldAllocatorPageCount <= this._pages.length);
    if (oldAllocatorPageCount === this._pages.length) {
      this._pushNewPage();
    }
    assertIsTrue(oldAllocatorPageCount < this._pages.length);
    var page = this._pages[oldAllocatorPageCount];
    ++page.useCount;
    ++allocator[allocatorPageCountTag];
    return page;
  };
  _proto.popPage = function popPage(allocator) {
    var allocatorPageCount = allocator[allocatorPageCountTag];
    assertIsTrue(allocatorPageCount > 0);
    var allocatorLastPageIndex = allocatorPageCount - 1;
    var lastPage = this._pages[allocatorLastPageIndex];
    assertIsTrue(lastPage.useCount > 0);
    --lastPage.useCount;
    --allocator[allocatorPageCountTag];
    if (lastPage.useCount === 0) {
      assertIsTrue(allocatorLastPageIndex === this._pages.length - 1);
      this._pages.pop();
    }
  };
  _proto.createAllocator = function createAllocator(sliceSize) {
    var allocator = new SharedStackBasedAllocator(this, sliceSize);
    ++this._allocatorCount;
    return allocator;
  };
  _proto.destroyAllocator = function destroyAllocator(allocator) {
    var allocatorPageCount = allocator[allocatorPageCountTag];
    for (var iPage = 0; iPage < allocatorPageCount; ++iPage) {
      var page = this._pages[iPage];
      assertIsTrue(page.useCount > 0);
      --page.useCount;
    }
    assertIsTrue(this._allocatorCount > 0);
    --this._allocatorCount;
    if (this._allocatorCount === 0) {
      this._manager[onStackPurgedTag](this);
    }
  };
  _proto._pushNewPage = function _pushNewPage() {
    var newPage = new SharedMemoryPage(this._pageSize);
    this._pages.push(newPage);
  };
  return _createClass(PagedStack, [{
    key: "pageSize",
    get: function get() {
      return this._pageSize;
    }
  }, {
    key: "debugLocking",
    get: function get() {
      return this._locking;
    }
  }, {
    key: "allocatorCount",
    get: function get() {
      return this._allocatorCount;
    }
  }]);
}();
var SharedMemorySlice = function SharedMemorySlice(buffer, byteOffset) {
  this.buffer = buffer;
  this.byteOffset = byteOffset;
};
var SharedStackBasedAllocator = function () {
  function SharedStackBasedAllocator(_resource, _sliceSize) {
    this[allocatorPageCountTag] = 0;
    this._slicesPerPage = 0;
    this._slices = [];
    this._resource = _resource;
    this._sliceSize = _sliceSize;
    var slicesPerPage = Math.floor(this._resource.pageSize / _sliceSize);
    assertIsTrue(slicesPerPage > 0);
    this._slicesPerPage = slicesPerPage;
  }
  var _proto2 = SharedStackBasedAllocator.prototype;
  _proto2.destroy = function destroy() {
    assertIsTrue(this._slices.length === 0, "Can not destroy the allocator since it's not empty.");
    assertIsTrue(!this._resource.debugLocking, "Can not destroy the allocator since it's locking.");
    this._resource.destroyAllocator(this);
  };
  _proto2.debugLock = function debugLock() {
    this._resource.debugLock();
  };
  _proto2.debugUnlock = function debugUnlock() {
    this._resource.debugUnlock();
  };
  _proto2.push = function push() {
    var sliceLength = this._sliceSize,
      slices = this._slices,
      slicesPerPage = this._slicesPerPage;
    var desiredSliceIndex = slices.length;
    var newSliceIndexInPage = 0;
    var newSlicePageIndex = 0;
    if (sliceLength === 0) {
      if (this[allocatorPageCountTag] === 0) {
        this._resource.pushPage(this);
      }
      assertIsTrue(this[allocatorPageCountTag] === 1);
    } else {
      var capacity = slicesPerPage * this[allocatorPageCountTag];
      assertIsTrue(desiredSliceIndex <= capacity);
      if (desiredSliceIndex === capacity) {
        this._resource.pushPage(this);
        assertIsTrue(desiredSliceIndex < slicesPerPage * this[allocatorPageCountTag]);
      }
      newSliceIndexInPage = desiredSliceIndex % slicesPerPage;
      newSlicePageIndex = (desiredSliceIndex - newSliceIndexInPage) / slicesPerPage;
      assertIsTrue(this[allocatorPageCountTag] * slicesPerPage >= desiredSliceIndex);
    }
    var pageMemory = this._resource.getPageMemory(newSlicePageIndex);
    var newSlice = new SharedMemorySlice(pageMemory, sliceLength * newSliceIndexInPage);
    this._slices.push(newSlice);
    return newSlice;
  };
  _proto2.pop = function pop() {
    var slices = this._slices,
      slicesPerPage = this._slicesPerPage;
    var allocatedCount = slices.length;
    assertIsTrue(allocatedCount > 0);
    var removingSliceIndex = allocatedCount - 1;
    if (this._sliceSize === 0) {
      assertIsTrue(this[allocatorPageCountTag] === 1);
      if (removingSliceIndex === 0) {
        this._resource.popPage(this);
      }
    } else {
      var removingSliceIndexInPage = removingSliceIndex % slicesPerPage;
      if (removingSliceIndexInPage === 0) {
        this._resource.popPage(this);
      }
    }
    this._slices.pop();
  };
  return _createClass(SharedStackBasedAllocator, [{
    key: "isEmpty",
    get: function get() {
      return this._slices.length === 0;
    }
  }]);
}();
var SharedStackBasedAllocatorManager = function () {
  function SharedStackBasedAllocatorManager(_thresholds) {
    this._stacks = new Map();
    this._thresholds = _thresholds;
    assertIsTrue(_thresholds.every(function (v, i, arr) {
      return i === 0 || v > arr[i - 1];
    }));
  }
  var _proto3 = SharedStackBasedAllocatorManager.prototype;
  _proto3.createAllocator = function createAllocator(pageSize) {
    var allocationPageSize = pageSize;
    var stackPageSize = this._selectStackPageSize(allocationPageSize);
    var stack = this._stacks.get(stackPageSize);
    if (!stack) {
      stack = new PagedStack(this, stackPageSize);
      this._stacks.set(stackPageSize, stack);
    }
    return stack.createAllocator(allocationPageSize);
  };
  _proto3[onStackPurgedTag] = function (stack) {
    var stackFound = false;
    for (var _iterator = _createForOfIteratorHelperLoose(this._stacks), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        k = _step$value[0],
        v = _step$value[1];
      if (v === stack) {
        this._stacks["delete"](k);
        stackFound = true;
        break;
      }
    }
    if (!stackFound) {
      assertIsTrue(false, "Given allocator is not of mime.");
    }
  };
  _proto3._selectStackPageSize = function _selectStackPageSize(allocationPageSize) {
    var thresholdIndex = binarySearchEpsilon(this._thresholds, allocationPageSize);
    var stackPageSize = allocationPageSize;
    if (thresholdIndex >= 0) {
      stackPageSize = this._thresholds[thresholdIndex];
    } else {
      thresholdIndex = ~thresholdIndex;
      if (thresholdIndex === this._thresholds.length) ; else {
        assertIsTrue(thresholdIndex >= 0 && thresholdIndex < this._thresholds.length);
        stackPageSize = this._thresholds[thresholdIndex];
      }
    }
    return stackPageSize;
  };
  return _createClass(SharedStackBasedAllocatorManager, [{
    key: "isEmpty",
    get: function get() {
      return this._stacks.size === 0;
    }
  }]);
}();

var PoseStackAllocator = function () {
  function PoseStackAllocator(transformCount, auxiliaryCurveCount) {
    this._poses = [];
    this._allocatedCount = 0;
    this._memoryAllocator = void 0;
    this._transformCount = transformCount;
    this._auxiliaryCurveCount = auxiliaryCurveCount;
    var poseBytes = calculateRequiredBytes(transformCount, auxiliaryCurveCount, 1);
    this._memoryAllocator = globalPosePageMemoryAllocatorManager.createAllocator(poseBytes);
  }
  var _proto = PoseStackAllocator.prototype;
  _proto.destroy = function destroy() {
    assertIsTrue(this._allocatedCount === 0, "Can not destroy the allocator since it's not empty.");
    for (var iPose = 0; iPose < this._poses.length; ++iPose) {
      this._memoryAllocator.pop();
    }
    this._poses.length = 0;
    return this._memoryAllocator.destroy();
  };
  _proto.push = function push() {
    if (this._allocatedCount === 0) {
      this._memoryAllocator.debugLock();
    }
    if (this._allocatedCount === this._poses.length) {
      this._allocateNewPose();
      assertIsTrue(this._allocatedCount < this._poses.length);
    }
    var pose = this._poses[this._allocatedCount];
    ++this._allocatedCount;
    return pose;
  };
  _proto.pop = function pop() {
    assertIsTrue(this._allocatedCount > 0, "PoseStackAllocator: push/pop does not match.");
    --this._allocatedCount;
    if (this._allocatedCount === 0) {
      this._memoryAllocator.debugUnlock();
    }
  };
  _proto._allocateNewPose = function _allocateNewPose() {
    var slice = this._memoryAllocator.push();
    var transformsByteLength = TransformArray.BYTES_PER_ELEMENT * this._transformCount;
    var baseOffset = slice.byteOffset;
    var transforms = new TransformArray(slice.buffer, baseOffset, this._transformCount);
    var auxiliaryCurves = new Float64Array(slice.buffer, baseOffset + transformsByteLength, this._auxiliaryCurveCount);
    var pose = Pose._create(transforms, auxiliaryCurves);
    this._poses.push(pose);
  };
  return _createClass(PoseStackAllocator, [{
    key: "allocatedCount",
    get: function get() {
      return this._allocatedCount;
    }
  }, {
    key: "top",
    get: function get() {
      assertIsTrue(this._allocatedCount > 0);
      return this._poses[this._allocatedCount - 1];
    }
  }]);
}();
function calculateRequiredBytes(transformCount, auxiliaryCurveCount, capacity) {
  return (TransformArray.BYTES_PER_ELEMENT * transformCount + Float64Array.BYTES_PER_ELEMENT * auxiliaryCurveCount) * capacity;
}
var PAGE_SIZE = calculateRequiredBytes(128, 10, 4);
var globalPosePageMemoryAllocatorManager = new SharedStackBasedAllocatorManager([PAGE_SIZE]);

function partition(array, predicate) {
  var nElements = array.length;
  var iFirstGroup2Element = 0;
  for (; iFirstGroup2Element < nElements; ++iFirstGroup2Element) {
    var element = array[iFirstGroup2Element];
    if (!predicate(element, iFirstGroup2Element, array)) {
      break;
    }
  }
  if (iFirstGroup2Element === nElements) {
    return nElements;
  }
  var nGroup1 = iFirstGroup2Element;
  for (var iElement = iFirstGroup2Element + 1; iElement < nElements; ++iElement) {
    var _element = array[iElement];
    var isFirstGroupElement = predicate(_element, iElement, array);
    if (isFirstGroupElement) {
      var t = _element;
      array[iElement] = array[nGroup1];
      array[nGroup1] = t;
      ++nGroup1;
    }
  }
  return nGroup1;
}

var TransformSpace;
(function (TransformSpace) {
  TransformSpace[TransformSpace["WORLD"] = 0] = "WORLD";
  TransformSpace[TransformSpace["COMPONENT"] = 1] = "COMPONENT";
  TransformSpace[TransformSpace["PARENT"] = 2] = "PARENT";
  TransformSpace[TransformSpace["LOCAL"] = 3] = "LOCAL";
})(TransformSpace || (TransformSpace = {}));
ccenum(TransformSpace);

var MAX_POSE_PER_PAGE = 8;
var allocationInfoTag = Symbol('PoseHeapAllocator');
function isPagedPose(pose) {
  return allocationInfoTag in pose;
}
var PoseHeapAllocator = function () {
  function PoseHeapAllocator(transformCount, metaValueCount) {
    this._transformCount = 0;
    this._metaValueCount = 0;
    this._pages = [];
    this._allocatedCount = 0;
    this._foremostPossibleFreePage = 0;
    this._transformCount = transformCount;
    this._metaValueCount = metaValueCount;
  }
  var _proto = PoseHeapAllocator.prototype;
  _proto.allocatePose = function allocatePose() {
    ++this._allocatedCount;
    var pages = this._pages;
    var nPages = pages.length;
    for (var _iPage = this._foremostPossibleFreePage; _iPage < nPages; ++_iPage) {
      var _page = pages[_iPage];
      var _pose = _page.tryAllocate();
      if (_pose) {
        _pose[allocationInfoTag].pageIndex = _iPage;
        if (_page.freeCount === 0) {
          ++this._foremostPossibleFreePage;
        }
        return _pose;
      }
    }
    var pose = this._allocatePoseInNewPage();
    this._foremostPossibleFreePage = pose[allocationInfoTag].pageIndex;
    return pose;
  };
  _proto.destroyPose = function destroyPose(pose) {
    assertIsTrue(isPagedPose(pose));
    var pages = this._pages;
    var nPages = pages.length;
    var pageIndex = pose[allocationInfoTag].pageIndex;
    assertIsTrue(pageIndex >= 0 && pageIndex < nPages);
    var page = pages[pageIndex];
    page.deallocate(pose);
    --this._allocatedCount;
    if (pageIndex < this._foremostPossibleFreePage) {
      assertIsTrue(page.freeCount > 0);
      this._foremostPossibleFreePage = pageIndex;
    }
  };
  _proto._allocatePoseInNewPage = function _allocatePoseInNewPage() {
    var page = new PosePage(this._transformCount, this._metaValueCount, 4);
    var pageIndex = this._pages.length;
    this._pages.push(page);
    var pose = page.tryAllocate();
    assertIsTrue(pose);
    pose[allocationInfoTag].pageIndex = pageIndex;
    return pose;
  };
  return _createClass(PoseHeapAllocator, [{
    key: "allocatedCount",
    get: function get() {
      return this._allocatedCount;
    }
  }]);
}();
var AllocationInfo = function () {
  function AllocationInfo() {
    this._id = -1;
  }
  return _createClass(AllocationInfo, [{
    key: "pageIndex",
    get: function get() {
      return this._id >> POSE_INDEX_BITS;
    },
    set: function set(value) {
      this._id &= POSE_INDEX_MASK;
      this._id |= value << POSE_INDEX_BITS;
    }
  }, {
    key: "poseIndex",
    get: function get() {
      return this._id & POSE_INDEX_MASK;
    },
    set: function set(value) {
      this._id &= ~POSE_INDEX_MASK;
      this._id |= value;
    }
  }]);
}();
var POSE_INDEX_MASK = 7;
var POSE_INDEX_BITS = 3;
assertIsTrue(POSE_INDEX_MASK + 1 >= MAX_POSE_PER_PAGE);
var PosePage = function () {
  function PosePage(_transformCount, _metaValueCount, _capacity) {
    this._buffer = void 0;
    this._idleFlags = 0xF;
    this._poses = void 0;
    this._freeCount = 0;
    this._transformCount = _transformCount;
    this._metaValueCount = _metaValueCount;
    this._capacity = _capacity;
    var byteLength = (TransformArray.BYTES_PER_ELEMENT * _transformCount + Float64Array.BYTES_PER_ELEMENT * _metaValueCount) * _capacity;
    this._buffer = new ArrayBuffer(byteLength);
    this._poses = new Array(_capacity).fill(null);
    this._freeCount = _capacity;
  }
  var _proto2 = PosePage.prototype;
  _proto2.tryAllocate = function tryAllocate() {
    var _poses$idlePoseIndex;
    var poses = this._poses,
      idleFlags = this._idleFlags,
      capacity = this._capacity;
    var idlePoseIndex = findRightmostSetBit(idleFlags);
    if (idlePoseIndex >= capacity) {
      return null;
    }
    assertIsTrue(idlePoseIndex >= 0 && idlePoseIndex < poses.length);
    var pose = (_poses$idlePoseIndex = poses[idlePoseIndex]) !== null && _poses$idlePoseIndex !== void 0 ? _poses$idlePoseIndex : poses[idlePoseIndex] = this._createPose(idlePoseIndex);
    pose[allocationInfoTag].poseIndex = idlePoseIndex;
    this._idleFlags &= ~(1 << idlePoseIndex);
    assertIsTrue(this._freeCount > 0);
    --this._freeCount;
    return pose;
  };
  _proto2.deallocate = function deallocate(pose) {
    var poses = this._poses;
    var poseIndex = pose[allocationInfoTag].poseIndex;
    assertIsTrue(poseIndex >= 0 && poseIndex < poses.length);
    assertIsTrue(poses[poseIndex] === pose);
    this._idleFlags |= 1 << poseIndex;
    assertIsTrue(this._freeCount < this._capacity);
    ++this._freeCount;
  };
  _proto2._createPose = function _createPose(index) {
    var transformsByteLength = TransformArray.BYTES_PER_ELEMENT * this._transformCount;
    var baseOffset = (transformsByteLength + Float64Array.BYTES_PER_ELEMENT * this._metaValueCount) * index;
    var transforms = new TransformArray(this._buffer, baseOffset, this._transformCount);
    var metaValues = new Float64Array(this._buffer, baseOffset + transformsByteLength, this._metaValueCount);
    var pose = Pose._create(transforms, metaValues);
    pose[allocationInfoTag] = new AllocationInfo();
    return pose;
  };
  return _createClass(PosePage, [{
    key: "capacity",
    get: function get() {
      return this._capacity;
    }
  }, {
    key: "freeCount",
    get: function get() {
      return this._freeCount;
    }
  }]);
}();
function findRightmostSetBit(bits) {
  return bits === 0 ? Infinity : Math.log2(bits & -bits);
}

var _dec$k, _dec2$j, _dec3$h, _dec4$d, _dec5$a, _dec6$7, _dec7$4, _class$l;
function findBoneByNameRecursively(from, name) {
  if (from.name === name) {
    return from;
  }
  var nChildren = from.children.length;
  for (var iChild = 0; iChild < nChildren; ++iChild) {
    var found = findBoneByNameRecursively(from.children[iChild], name);
    if (found) {
      return found;
    }
  }
  return null;
}
var AnimationGraphBindingContext = function () {
  function AnimationGraphBindingContext(origin, poseLayoutMaintainer, varRegistry, _controller) {
    var _this = this;
    this._origin = void 0;
    this._layoutMaintainer = void 0;
    this._varRegistry = void 0;
    this._additiveFlagStack = [];
    this._triggerResetter = function (name) {
      return _this._resetTrigger(name);
    };
    this._isLayerWideContextPropertiesSet = false;
    this._stashView = void 0;
    this._motionSyncManager = void 0;
    this._clipOverrides = undefined;
    this._controller = _controller;
    this._origin = origin;
    this._layoutMaintainer = poseLayoutMaintainer;
    this._varRegistry = varRegistry;
    this._additiveFlagStack = [false];
  }
  var _proto = AnimationGraphBindingContext.prototype;
  _proto.bindTransform = function bindTransform(bone) {
    var boneNode = this._origin.getChildByPath(bone);
    if (!boneNode) {
      return null;
    }
    return this._layoutMaintainer.getOrCreateTransformBinding(boneNode);
  };
  _proto.bindTransformByName = function bindTransformByName(bone) {
    var boneNode = findBoneByNameRecursively(this._origin, bone);
    if (!boneNode) {
      return null;
    }
    return this._layoutMaintainer.getOrCreateTransformBinding(boneNode);
  };
  _proto.getBoneChildren = function getBoneChildren(bone) {
    var boneNode = findBoneByNameRecursively(this._origin, bone);
    if (!boneNode) {
      return [];
    }
    return boneNode.children.map(function (childNode) {
      return childNode.name;
    });
  };
  _proto.getParentBoneNameByName = function getParentBoneNameByName(bone) {
    var _boneNode$parent;
    var boneNode = findBoneByNameRecursively(this._origin, bone);
    if (!boneNode) {
      return null;
    }
    return boneNode === this._origin ? '' : (_boneNode$parent = boneNode.parent) == null ? void 0 : _boneNode$parent.name;
  };
  _proto.bindAuxiliaryCurve = function bindAuxiliaryCurve(name) {
    return this._layoutMaintainer.getOrCreateAuxiliaryCurveBinding(name);
  };
  _proto.getEvaluationTimeAuxiliaryCurveView = function getEvaluationTimeAuxiliaryCurveView() {
    return this._layoutMaintainer.auxiliaryCurveRegistry;
  };
  _proto.getVar = function getVar(id) {
    return this._varRegistry[id];
  };
  _proto._pushAdditiveFlag = function _pushAdditiveFlag(additive) {
    this._additiveFlagStack.push(additive);
  };
  _proto._popAdditiveFlag = function _popAdditiveFlag() {
    assertIsTrue(this._additiveFlagStack.length > 1);
    this._additiveFlagStack.pop();
  };
  _proto._integrityCheck = function _integrityCheck() {
    return this._additiveFlagStack.length === 1;
  };
  _proto._setLayerWideContextProperties = function _setLayerWideContextProperties(stashView, motionSyncManager) {
    assertIsTrue(!this._isLayerWideContextPropertiesSet);
    this._isLayerWideContextPropertiesSet = true;
    this._stashView = stashView;
    this._motionSyncManager = motionSyncManager;
  };
  _proto._unsetLayerWideContextProperties = function _unsetLayerWideContextProperties() {
    assertIsTrue(this._isLayerWideContextPropertiesSet);
    this._isLayerWideContextPropertiesSet = false;
    this._stashView = undefined;
    this._motionSyncManager = undefined;
  };
  _proto._setClipOverrides = function _setClipOverrides(clipOverrides) {
    this._clipOverrides = clipOverrides;
  };
  _proto._resetTrigger = function _resetTrigger(triggerName) {
    var varInstance = this._varRegistry[triggerName];
    if (!varInstance) {
      return;
    }
    varInstance.value = false;
  };
  return _createClass(AnimationGraphBindingContext, [{
    key: "origin",
    get: function get() {
      return this._origin;
    }
  }, {
    key: "controller",
    get: function get() {
      return this._controller;
    }
  }, {
    key: "triggerResetter",
    get: function get() {
      return this._triggerResetter;
    }
  }, {
    key: "clipOverrides",
    get: function get() {
      return this._clipOverrides;
    }
  }, {
    key: "additive",
    get: function get() {
      var additiveFlagStack = this._additiveFlagStack;
      return additiveFlagStack[additiveFlagStack.length - 1];
    }
  }, {
    key: "stashView",
    get: function get() {
      assertIsTrue(this._stashView);
      return this._stashView;
    }
  }, {
    key: "motionSyncManager",
    get: function get() {
      assertIsTrue(this._motionSyncManager);
      return this._motionSyncManager;
    }
  }]);
}();
var cacheTransform$2 = new Transform();
var AuxiliaryCurveRegistry = function () {
  function AuxiliaryCurveRegistry() {
    this._namedCurves = new Map();
  }
  var _proto2 = AuxiliaryCurveRegistry.prototype;
  _proto2.names = function names() {
    return this._namedCurves.keys();
  };
  _proto2.has = function has(name) {
    return this._namedCurves.has(name);
  };
  _proto2.get = function get(name) {
    var _this$_namedCurves$ge;
    return (_this$_namedCurves$ge = this._namedCurves.get(name)) !== null && _this$_namedCurves$ge !== void 0 ? _this$_namedCurves$ge : 0.0;
  };
  _proto2.set = function set(name, value) {
    this._namedCurves.set(name, value);
  };
  return AuxiliaryCurveRegistry;
}();
var LayoutChangeFlag;
(function (LayoutChangeFlag) {
  LayoutChangeFlag[LayoutChangeFlag["TRANSFORM_COUNT"] = 1] = "TRANSFORM_COUNT";
  LayoutChangeFlag[LayoutChangeFlag["TRANSFORM_ORDER"] = 2] = "TRANSFORM_ORDER";
  LayoutChangeFlag[LayoutChangeFlag["AUXILIARY_CURVE_COUNT"] = 4] = "AUXILIARY_CURVE_COUNT";
})(LayoutChangeFlag || (LayoutChangeFlag = {}));
var checkBindStatus = function checkBindStatus(bindStarted) {
  if (bindStarted === void 0) {
    bindStarted = false;
  }
  return function (_, _propertyKey, descriptor) {
    var vendor = descriptor.value;
    if (vendor) {
      descriptor.value = function () {
        assertIsTrue(this._bindStarted === bindStarted, bindStarted ? "The operation is invalid since bind has not been started." : "The operation is invalid since bind has already been started.");
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return vendor.call.apply(vendor, [this].concat(args));
      };
    }
  };
};
var AnimationGraphPoseLayoutMaintainer = (_dec$k = checkBindStatus(true), _dec2$j = checkBindStatus(true), _dec3$h = checkBindStatus(true), _dec4$d = checkBindStatus(true), _dec5$a = checkBindStatus(true), _dec6$7 = checkBindStatus(false), _dec7$4 = checkBindStatus(true), _class$l = function () {
  function AnimationGraphPoseLayoutMaintainer(origin, auxiliaryCurveRegistry) {
    this._origin = void 0;
    this._auxiliaryCurveRegistry = void 0;
    this._auxiliaryCurveRecords = [];
    this._transformRecords = [];
    this._parentTable = [];
    this._bindStarted = false;
    this._transformCountBeforeBind = -1;
    this._auxiliaryCurveCountBeforeBind = -1;
    this._origin = origin;
    this._auxiliaryCurveRegistry = auxiliaryCurveRegistry;
  }
  var _proto3 = AnimationGraphPoseLayoutMaintainer.prototype;
  _proto3.getOrCreateTransformBinding = function getOrCreateTransformBinding(node) {
    var origin = this._origin;
    var debugIntegrityCheckLengthOfPathToOrigin = 0;
    var isValidNode = false;
    for (var current = node; current; current = current.parent) {
      if (current === origin) {
        isValidNode = true;
        break;
      }
      {
        ++debugIntegrityCheckLengthOfPathToOrigin;
      }
    }
    if (!isValidNode) {
      return null;
    }
    var handle = this._getOrCreateTransformBinding(node);
    if (node !== origin) {
      {
        --debugIntegrityCheckLengthOfPathToOrigin;
        assertIsTrue(debugIntegrityCheckLengthOfPathToOrigin >= 0);
      }
      for (var parent = node.parent; parent !== origin; parent = parent.parent) {
        assertIsTrue(parent);
        void this._getOrCreateTransformBinding(parent);
        {
          --debugIntegrityCheckLengthOfPathToOrigin;
          assertIsTrue(debugIntegrityCheckLengthOfPathToOrigin >= 0);
        }
      }
    }
    {
      assertIsTrue(debugIntegrityCheckLengthOfPathToOrigin === 0);
    }
    return handle;
  };
  _proto3._getOrCreateTransformBinding = function _getOrCreateTransformBinding(node) {
    var transformRecords = this._transformRecords;
    var transformIndex = transformRecords.findIndex(function (transformRecord) {
      return transformRecord.node === node;
    });
    if (transformIndex >= 0) {
      var _transformRecord = transformRecords[transformIndex];
      ++_transformRecord.refCount;
      return _transformRecord.handle;
    }
    var newNodeIndex = 0;
    var _loop = function _loop(parent) {
      var parentIndex = transformRecords.findIndex(function (transformRecord) {
        return transformRecord.node === parent;
      });
      if (parentIndex >= 0) {
        newNodeIndex = parentIndex + 1;
        return 1;
      }
    };
    for (var parent = node.parent; parent; parent = parent.parent) {
      if (_loop(parent)) break;
    }
    for (var _transformIndex = newNodeIndex; _transformIndex < transformRecords.length; ++_transformIndex) {
      ++transformRecords[_transformIndex].handle.index;
    }
    var transformRecord = new TransformRecord(new TransformHandleInternal(this, newNodeIndex), node);
    transformRecords.splice(newNodeIndex, 0, transformRecord);
    return transformRecord.handle;
  };
  _proto3.getOrCreateAuxiliaryCurveBinding = function getOrCreateAuxiliaryCurveBinding(name) {
    var auxiliaryCurveRecords = this._auxiliaryCurveRecords;
    var auxiliaryCurveIndex = auxiliaryCurveRecords.findIndex(function (record) {
      return record.name === name;
    });
    if (auxiliaryCurveIndex >= 0) {
      var auxiliaryCurveRecord = auxiliaryCurveRecords[auxiliaryCurveIndex];
      ++auxiliaryCurveRecord.refCount;
      return auxiliaryCurveRecord.handle;
    } else {
      var newAuxiliaryCurveIndex = auxiliaryCurveRecords.length;
      var _auxiliaryCurveRecord = new AuxiliaryCurveRecord(new AuxiliaryCurveHandleInternal(this, newAuxiliaryCurveIndex), name);
      auxiliaryCurveRecords.push(_auxiliaryCurveRecord);
      return _auxiliaryCurveRecord.handle;
    }
  };
  _proto3.createEvaluationContext = function createEvaluationContext() {
    assertIsTrue(!this._bindStarted);
    return new AnimationGraphEvaluationContext(this.transformCount, this.auxiliaryCurveCount, this._parentTable.slice(), this._origin);
  };
  _proto3.resetPoseStashAllocator = function resetPoseStashAllocator(allocator) {
    assertIsTrue(!this._bindStarted);
    allocator._reset(this.transformCount, this.auxiliaryCurveCount);
  };
  _proto3.createTransformFilter = function createTransformFilter(mask) {
    var origin = this._origin;
    var involvedTransformIndices = [];
    for (var _iterator = _createForOfIteratorHelperLoose(this._transformRecords), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        node = _step$value.node,
        handle = _step$value.handle;
      var path = countPath(origin, node);
      if (typeof path === 'undefined') {
        error(node.getPathInHierarchy() + " is not a child of " + origin.getPathInHierarchy());
      } else if (mask.isExcluded(path)) {
        continue;
      }
      involvedTransformIndices.push(handle.index);
    }
    involvedTransformIndices.sort();
    var poseFilter = new TransformFilter(involvedTransformIndices);
    return poseFilter;
    function countPath(from, to) {
      var path = [];
      for (var node = to; node; node = node.parent) {
        if (node === from) {
          return path.join('/');
        } else {
          path.unshift(node.name);
        }
      }
      return undefined;
    }
  };
  _proto3.fetchDefaultTransforms = function fetchDefaultTransforms(transforms) {
    var nTransforms = this._transformRecords.length;
    assertIsTrue(transforms.length === nTransforms);
    for (var iTransform = 0; iTransform < nTransforms; ++iTransform) {
      var defaultTransform = this._transformRecords[iTransform].defaultTransform;
      transforms.setTransform(iTransform, defaultTransform);
    }
  };
  _proto3.apply = function apply(pose) {
    var transforms = pose.transforms,
      auxiliaryCurves = pose.auxiliaryCurves;
    var nTransforms = this._transformRecords.length;
    assertIsTrue(transforms.length === nTransforms);
    for (var iTransform = 0; iTransform < nTransforms; ++iTransform) {
      var transform = transforms.getTransform(iTransform, cacheTransform$2);
      var node = this._transformRecords[iTransform].node;
      node.setRTS(transform.rotation, transform.position, transform.scale);
    }
    var nAuxiliaryCurves = this._auxiliaryCurveRecords.length;
    for (var iAuxiliaryCurve = 0; iAuxiliaryCurve < nAuxiliaryCurves; ++iAuxiliaryCurve) {
      var _curveName = this._auxiliaryCurveRecords[iAuxiliaryCurve].name;
      var curveValue = auxiliaryCurves[iAuxiliaryCurve];
      this._auxiliaryCurveRegistry.set(_curveName, curveValue);
    }
  };
  _proto3._destroyTransformHandle = function _destroyTransformHandle(index) {
    assertIsTrue(index >= 0 && index < this._transformRecords.length, "Invalid transform handle.");
    var record = this._transformRecords[index];
    assertIsTrue(record.refCount > 0, "Something work wrong: refCount mismatch.");
    --record.refCount;
  };
  _proto3._destroyAuxiliaryCurveHandle = function _destroyAuxiliaryCurveHandle(index) {
    assertIsTrue(index >= 0 && index < this._auxiliaryCurveRecords.length, "Invalid auxiliary value handle.");
    var record = this._auxiliaryCurveRecords[index];
    assertIsTrue(record.refCount > 0, "Something work wrong: refCount mismatch.");
    --record.refCount;
  };
  _proto3.startBind = function startBind() {
    this._bindStarted = true;
    this._transformCountBeforeBind = this._transformRecords.length;
    this._auxiliaryCurveCountBeforeBind = this._auxiliaryCurveRecords.length;
  };
  _proto3.endBind = function endBind() {
    var transformRecords = this._transformRecords,
      auxiliaryCurveRecords = this._auxiliaryCurveRecords;
    var changeFlags = 0;
    trimRecords(transformRecords);
    if (transformRecords.length !== this._transformCountBeforeBind) {
      changeFlags |= LayoutChangeFlag.TRANSFORM_COUNT;
      var nRecords = transformRecords.length;
      for (var iRecord = 0; iRecord < nRecords; ++iRecord) {
        var record = transformRecords[iRecord];
        record.order = iRecord;
      }
    } else {
      var _nRecords = transformRecords.length;
      var orderChanged = false;
      for (var _iRecord = 0; _iRecord < _nRecords; ++_iRecord) {
        var _record = transformRecords[_iRecord];
        if (_record.order !== _iRecord) {
          orderChanged = true;
          _record.order = _iRecord;
        }
      }
      if (orderChanged) {
        changeFlags |= LayoutChangeFlag.TRANSFORM_ORDER;
      }
    }
    trimRecords(auxiliaryCurveRecords);
    if (auxiliaryCurveRecords.length !== this._auxiliaryCurveCountBeforeBind) {
      changeFlags |= LayoutChangeFlag.AUXILIARY_CURVE_COUNT;
    }
    var parentTable = this._parentTable,
      origin = this._origin;
    parentTable.length = transformRecords.length;
    var _loop2 = function _loop2() {
      var node = transformRecords[iTransform].node;
      if (node === origin) {
        parentTable[iTransform] = -1;
        return 1;
      }
      var parent = node.parent;
      if (parent === origin) {
        var parentIndex = transformRecords.findIndex(function (record) {
          return record.node === parent;
        });
        parentTable[iTransform] = parentIndex >= 0 ? parentIndex : -1;
      } else {
        var _parentIndex = transformRecords.findIndex(function (record) {
          return record.node === parent;
        });
        assertIsTrue(_parentIndex >= 0, "Parent node is not bound!");
        assertIsTrue(_parentIndex < iTransform);
        parentTable[iTransform] = _parentIndex;
      }
    };
    for (var iTransform = 0; iTransform < transformRecords.length; ++iTransform) {
      if (_loop2()) continue;
    }
    this._bindStarted = false;
    {
      transformRecords.forEach(function (transformRecord, index, transformRecords) {
        assertIsTrue(transformRecord.handle.index === index, "Bad transform handle.");
        assertIsTrue(transformRecord.order === index, "Bad transform order field.");
        var _loop3 = function _loop3(parent) {
          var parentIndex = transformRecords.findIndex(function (r) {
            return r.node === parent;
          });
          if (parentIndex >= 0) {
            assertIsTrue(parentIndex < index, "Bad transform order.");
          }
        };
        for (var parent = transformRecord.node.parent; parent; parent = parent.parent) {
          _loop3(parent);
        }
      });
      this._transformCountBeforeBind = -1;
      this._auxiliaryCurveCountBeforeBind = -1;
    }
    return changeFlags;
  };
  return _createClass(AnimationGraphPoseLayoutMaintainer, [{
    key: "transformCount",
    get: function get() {
      return this._transformRecords.length;
    }
  }, {
    key: "auxiliaryCurveCount",
    get: function get() {
      return this._auxiliaryCurveRecords.length;
    }
  }, {
    key: "auxiliaryCurveRegistry",
    get: function (_get) {
      function get() {
        return _get.apply(this, arguments);
      }
      get.toString = function () {
        return _get.toString();
      };
      return get;
    }(function () {
      return this._auxiliaryCurveRegistry;
    })
  }]);
}(), _applyDecoratedDescriptor(_class$l.prototype, "getOrCreateTransformBinding", [_dec$k], Object.getOwnPropertyDescriptor(_class$l.prototype, "getOrCreateTransformBinding"), _class$l.prototype), _applyDecoratedDescriptor(_class$l.prototype, "_getOrCreateTransformBinding", [_dec2$j], Object.getOwnPropertyDescriptor(_class$l.prototype, "_getOrCreateTransformBinding"), _class$l.prototype), _applyDecoratedDescriptor(_class$l.prototype, "getOrCreateAuxiliaryCurveBinding", [_dec3$h], Object.getOwnPropertyDescriptor(_class$l.prototype, "getOrCreateAuxiliaryCurveBinding"), _class$l.prototype), _applyDecoratedDescriptor(_class$l.prototype, "_destroyTransformHandle", [_dec4$d], Object.getOwnPropertyDescriptor(_class$l.prototype, "_destroyTransformHandle"), _class$l.prototype), _applyDecoratedDescriptor(_class$l.prototype, "_destroyAuxiliaryCurveHandle", [_dec5$a], Object.getOwnPropertyDescriptor(_class$l.prototype, "_destroyAuxiliaryCurveHandle"), _class$l.prototype), _applyDecoratedDescriptor(_class$l.prototype, "startBind", [_dec6$7], Object.getOwnPropertyDescriptor(_class$l.prototype, "startBind"), _class$l.prototype), _applyDecoratedDescriptor(_class$l.prototype, "endBind", [_dec7$4], Object.getOwnPropertyDescriptor(_class$l.prototype, "endBind"), _class$l.prototype), _class$l);
var TransformRecord = function TransformRecord(handle, node) {
  this.order = -1;
  this.refCount = 1;
  this.handle = void 0;
  this.node = void 0;
  this.defaultTransform = void 0;
  this.handle = handle;
  this.node = node;
  var defaultTransform = new Transform();
  defaultTransform.position = node.position;
  defaultTransform.rotation = node.rotation;
  defaultTransform.scale = node.scale;
  this.defaultTransform = defaultTransform;
};
var AuxiliaryCurveRecord = function AuxiliaryCurveRecord(handle, name) {
  this.refCount = 1;
  this.handle = void 0;
  this.name = void 0;
  this.handle = handle;
  this.name = name;
};
function trimRecords(records) {
  var nUsedRecords = partition(records, function (record) {
    assertIsTrue(record.refCount >= 0);
    return record.refCount > 0;
  });
  assertIsTrue(nUsedRecords <= records.length);
  if (nUsedRecords === records.length) {
    return;
  }
  for (var iRecord = 0; iRecord < nUsedRecords; ++iRecord) {
    records[iRecord].handle.index = iRecord;
  }
  {
    records.slice(nUsedRecords).forEach(function (record) {
      return record.refCount = -1;
    });
  }
  records.splice(nUsedRecords, records.length - nUsedRecords);
}
var defaultTransformsTag = Symbol('[[DefaultTransforms]]');
var AnimationGraphSettleContext = function () {
  function AnimationGraphSettleContext(_layoutMaintainer) {
    this._layoutMaintainer = _layoutMaintainer;
  }
  var _proto4 = AnimationGraphSettleContext.prototype;
  _proto4.createTransformFilter = function createTransformFilter(mask) {
    return this._layoutMaintainer.createTransformFilter(mask);
  };
  return _createClass(AnimationGraphSettleContext, [{
    key: "transformCount",
    get: function get() {
      return this._layoutMaintainer.transformCount;
    }
  }]);
}();
var cacheTransform_spaceConversion$1 = new Transform();
var cacheParentTransform_spaceConversion$1 = new Transform();
var AnimationGraphEvaluationContext = function () {
  function AnimationGraphEvaluationContext(transformCount, metaValueCount, parentTable, componentNode) {
    this[defaultTransformsTag] = void 0;
    this._poseAllocator = void 0;
    this._parentTable = void 0;
    this._componentNode = void 0;
    this._cacheComponentToWorldTransform = new Transform();
    {
      assertIsTrue(transformCount === parentTable.length);
      assertIsTrue(parentTable.every(function (parentIndex, currentIndex) {
        if (parentIndex < 0) {
          return true;
        }
        return parentIndex < currentIndex;
      }));
    }
    this._poseAllocator = new PoseStackAllocator(transformCount, metaValueCount);
    this._parentTable = parentTable;
    this._componentNode = componentNode;
    this[defaultTransformsTag] = new TransformArray(transformCount);
  }
  var _proto5 = AnimationGraphEvaluationContext.prototype;
  _proto5.destroy = function destroy() {
    this._poseAllocator.destroy();
  };
  _proto5.pushDefaultedPose = function pushDefaultedPose() {
    var pose = this._poseAllocator.push();
    pose.transforms.set(this[defaultTransformsTag]);
    pose._poseTransformSpace = PoseTransformSpace.LOCAL;
    pose.auxiliaryCurves.fill(0.0);
    return pose;
  };
  _proto5.pushDefaultedPoseInComponentSpace = function pushDefaultedPoseInComponentSpace() {
    var pose = this.pushDefaultedPose();
    this._poseTransformsSpaceLocalToComponent(pose);
    return pose;
  };
  _proto5.pushZeroDeltaPose = function pushZeroDeltaPose() {
    var pose = this._poseAllocator.push();
    pose.transforms.fill(ZERO_DELTA_TRANSFORM);
    pose._poseTransformSpace = PoseTransformSpace.LOCAL;
    pose.auxiliaryCurves.fill(0.0);
    return pose;
  };
  _proto5.pushDuplicatedPose = function pushDuplicatedPose(src) {
    var pose = this._poseAllocator.push();
    pose.transforms.set(src.transforms);
    pose._poseTransformSpace = src._poseTransformSpace;
    pose.auxiliaryCurves.set(src.auxiliaryCurves);
    return pose;
  };
  _proto5.popPose = function popPose() {
    this._poseAllocator.pop();
  };
  _proto5._isStackTopPose_debugging = function _isStackTopPose_debugging(pose) {
    return pose === this._poseAllocator.top;
  };
  _proto5._poseTransformsSpaceLocalToComponent = function _poseTransformsSpaceLocalToComponent(pose) {
    var transforms = pose.transforms;
    var nTransforms = transforms.length;
    for (var iTransform = 0; iTransform < nTransforms; ++iTransform) {
      var parentTransformIndex = this._parentTable[iTransform];
      if (parentTransformIndex < 0) {
        continue;
      }
      var transform = transforms.getTransform(iTransform, cacheTransform_spaceConversion$1);
      var parentTransform = transforms.getTransform(parentTransformIndex, cacheParentTransform_spaceConversion$1);
      Transform.multiply(transform, parentTransform, transform);
      transforms.setTransform(iTransform, transform);
    }
    pose._poseTransformSpace = PoseTransformSpace.COMPONENT;
  };
  _proto5._poseTransformsSpaceComponentToLocal = function _poseTransformsSpaceComponentToLocal(pose) {
    var transforms = pose.transforms;
    var nTransforms = transforms.length;
    for (var iTransform = nTransforms - 1; iTransform >= 0; --iTransform) {
      var parentTransformIndex = this._parentTable[iTransform];
      if (parentTransformIndex < 0) {
        continue;
      }
      var transform = transforms.getTransform(iTransform, cacheTransform_spaceConversion$1);
      var parentTransform = transforms.getTransform(parentTransformIndex, cacheParentTransform_spaceConversion$1);
      Transform.calculateRelative(transform, transform, parentTransform);
      transforms.setTransform(iTransform, transform);
    }
    pose._poseTransformSpace = PoseTransformSpace.LOCAL;
  };
  _proto5._convertPoseSpaceTransformToTargetSpace = function _convertPoseSpaceTransformToTargetSpace(transform, outTransformSpace, pose, poseTransformIndex) {
    var poseSpace = pose._poseTransformSpace;
    switch (outTransformSpace) {
      default:
        {
          assertIsTrue(false);
        }
        break;
      case TransformSpace.WORLD:
        if (poseSpace === PoseTransformSpace.COMPONENT) {
          Transform.multiply(transform, this._getComponentToWorldTransform(), transform);
        } else {
          assertIsTrue(poseSpace === PoseTransformSpace.LOCAL);
          Transform.multiply(transform, this._getLocalToWorldTransform(cacheParentTransform_spaceConversion$1, pose, poseTransformIndex), transform);
        }
        break;
      case TransformSpace.COMPONENT:
        if (poseSpace === PoseTransformSpace.COMPONENT) ; else {
          assertIsTrue(poseSpace === PoseTransformSpace.LOCAL);
          Transform.multiply(transform, this._getLocalToComponentTransform(cacheParentTransform_spaceConversion$1, pose, poseTransformIndex), transform);
        }
        break;
      case TransformSpace.PARENT:
        {
          if (poseSpace === PoseTransformSpace.COMPONENT) {
            var parentTransformIndex = this._parentTable[poseTransformIndex];
            if (parentTransformIndex >= 0) {
              var parentComponentTransform = pose.transforms.getTransform(parentTransformIndex, cacheParentTransform_spaceConversion$1);
              var invParentComponentTransform = Transform.invert(parentComponentTransform, parentComponentTransform);
              Transform.multiply(transform, invParentComponentTransform, transform);
            }
          } else {
            assertIsTrue(poseSpace === PoseTransformSpace.LOCAL);
          }
          break;
        }
      case TransformSpace.LOCAL:
        {
          assertIsTrue(poseSpace === PoseTransformSpace.COMPONENT || poseSpace === PoseTransformSpace.LOCAL);
          var boneTransform = pose.transforms.getTransform(poseTransformIndex, cacheParentTransform_spaceConversion$1);
          var invBoneTransform = Transform.invert(boneTransform, boneTransform);
          Transform.multiply(transform, invBoneTransform, transform);
          break;
        }
    }
    return transform;
  };
  _proto5._convertTransformToPoseTransformSpace = function _convertTransformToPoseTransformSpace(transform, transformSpace, pose, poseTransformIndex) {
    var poseSpace = pose._poseTransformSpace;
    switch (transformSpace) {
      default:
        {
          assertIsTrue(false);
        }
        break;
      case TransformSpace.WORLD:
        if (poseSpace === PoseTransformSpace.COMPONENT) {
          var worldToComponent = Transform.invert(cacheParentTransform_spaceConversion$1, this._getComponentToWorldTransform());
          Transform.multiply(transform, worldToComponent, transform);
        } else {
          assertIsTrue(poseSpace === PoseTransformSpace.LOCAL);
          var localToWorld = this._getLocalToWorldTransform(cacheParentTransform_spaceConversion$1, pose, poseTransformIndex);
          var worldToLocal = Transform.invert(localToWorld, localToWorld);
          Transform.multiply(transform, worldToLocal, transform);
        }
        break;
      case TransformSpace.COMPONENT:
        if (poseSpace === PoseTransformSpace.COMPONENT) ; else {
          assertIsTrue(poseSpace === PoseTransformSpace.LOCAL);
          var localToComponent = this._getLocalToComponentTransform(cacheParentTransform_spaceConversion$1, pose, poseTransformIndex);
          var componentToLocal = Transform.invert(localToComponent, localToComponent);
          Transform.multiply(transform, componentToLocal, transform);
        }
        break;
      case TransformSpace.PARENT:
        {
          if (poseSpace === PoseTransformSpace.COMPONENT) {
            var parentTransformIndex = this._parentTable[poseTransformIndex];
            if (parentTransformIndex >= 0) {
              var parentTransform = pose.transforms.getTransform(parentTransformIndex, cacheParentTransform_spaceConversion$1);
              Transform.multiply(transform, parentTransform, transform);
            }
          }
          break;
        }
      case TransformSpace.LOCAL:
        {
          assertIsTrue(poseSpace === PoseTransformSpace.COMPONENT || poseSpace === PoseTransformSpace.LOCAL);
          var currentTransform = pose.transforms.getTransform(poseTransformIndex, cacheParentTransform_spaceConversion$1);
          Transform.multiply(transform, currentTransform, transform);
          break;
        }
    }
    return transform;
  };
  _proto5._getComponentToWorldTransform = function _getComponentToWorldTransform() {
    var result = this._cacheComponentToWorldTransform;
    var componentNode = this._componentNode;
    result.position = componentNode.worldPosition;
    result.rotation = componentNode.worldRotation;
    result.scale = componentNode.worldScale;
    return result;
  };
  _proto5._getLocalToComponentTransform = function _getLocalToComponentTransform(out, pose, transformIndex) {
    var parentTable = this._parentTable;
    Transform.setIdentity(out);
    for (var iTransform = parentTable[transformIndex]; iTransform >= 0; iTransform = parentTable[iTransform]) {
      var localTransform = pose.transforms.getTransform(iTransform, cacheTransform_spaceConversion$1);
      Transform.multiply(out, localTransform, out);
    }
    return out;
  };
  _proto5._getLocalToWorldTransform = function _getLocalToWorldTransform(out, pose, transformIndex) {
    this._getLocalToComponentTransform(out, pose, transformIndex);
    Transform.multiply(out, this._getComponentToWorldTransform(), out);
    return out;
  };
  return _createClass(AnimationGraphEvaluationContext, [{
    key: "allocatedPoseCount",
    get: function get() {
      return this._poseAllocator.allocatedCount;
    }
  }, {
    key: "parentTable",
    get: function get() {
      return this._parentTable;
    }
  }, {
    key: "_stackSize_debugging",
    get: function get() {
      return this._poseAllocator.allocatedCount;
    }
  }]);
}();
var TransformHandleInternal = function () {
  function TransformHandleInternal(host, index) {
    this.index = -1;
    this._host = void 0;
    this._host = host;
    this.index = index;
  }
  var _proto6 = TransformHandleInternal.prototype;
  _proto6.destroy = function destroy() {
    this._host._destroyTransformHandle(this.index);
  };
  return TransformHandleInternal;
}();
var AuxiliaryCurveHandleInternal = function () {
  function AuxiliaryCurveHandleInternal(host, index) {
    this.index = -1;
    this._host = void 0;
    this._host = host;
    this.index = index;
  }
  var _proto7 = AuxiliaryCurveHandleInternal.prototype;
  _proto7.destroy = function destroy() {
    this._host._destroyAuxiliaryCurveHandle(this.index);
  };
  return AuxiliaryCurveHandleInternal;
}();
var AnimationGraphUpdateContextGenerator = function () {
  function AnimationGraphUpdateContextGenerator() {
    this._context = {
      deltaTime: 0.0,
      indicativeWeight: 0.0
    };
  }
  var _proto8 = AnimationGraphUpdateContextGenerator.prototype;
  _proto8.generate = function generate(deltaTime, indicativeWeight) {
    this._context.deltaTime = deltaTime;
    this._context.indicativeWeight = indicativeWeight;
    return this._context;
  };
  _proto8.forkSubWeight = function forkSubWeight(base, subWeight) {
    this._context.deltaTime = base.deltaTime;
    this._context.indicativeWeight = base.indicativeWeight * subWeight;
  };
  return AnimationGraphUpdateContextGenerator;
}();
var DeferredPoseStashAllocator = function () {
  function DeferredPoseStashAllocator() {
    this._allocator = null;
  }
  var _proto9 = DeferredPoseStashAllocator.prototype;
  _proto9._reset = function _reset(transformCount, auxiliaryCurveCount) {
    this._allocator = new PoseHeapAllocator(transformCount, auxiliaryCurveCount);
  };
  _proto9.allocatePose = function allocatePose() {
    assertIsTrue(this._allocator);
    var pose = this._allocator.allocatePose();
    return pose;
  };
  _proto9.destroyPose = function destroyPose(pose) {
    assertIsTrue(this._allocator);
    return this._allocator.destroyPose(pose);
  };
  return _createClass(DeferredPoseStashAllocator, [{
    key: "allocatedPoseCount",
    get: function get() {
      assertIsTrue(this._allocator);
      return this._allocator.allocatedCount;
    }
  }]);
}();

var _dec$j, _class$k, _class2$i, _initializer$c;
var MotionSyncInfo = (_dec$j = ccclass$g(CLASS_NAME_PREFIX_ANIM + "MotionSyncInfo"), _dec$j(_class$k = (_class2$i = function MotionSyncInfo() {
  this.group = _initializer$c && _initializer$c();
}, _initializer$c = applyDecoratedInitializer(_class2$i.prototype, "group", [serializable$d], function () {
  return '';
}), _class2$i)) || _class$k);

function makeCreateNodeFactory(create_) {
  return {
    listEntries: function listEntries(context) {
      return [{
        arg: {
          type: 'clip-motion'
        },
        menu: 'i18n:ENGINE.animation_graph.pose_graph_node_sub_menus.play_or_sample_clip_motion'
      }, {
        arg: {
          type: 'animation-blend-1d'
        },
        menu: 'i18n:ENGINE.animation_graph.pose_graph_node_sub_menus.play_or_sample_animation_blend_1d'
      }, {
        arg: {
          type: 'animation-blend-2d'
        },
        menu: 'i18n:ENGINE.animation_graph.pose_graph_node_sub_menus.play_or_sample_animation_blend_2d'
      }];
    },
    create: function create(arg) {
      var motion = null;
      switch (arg.type) {
        case 'clip-motion':
          motion = new ClipMotion();
          break;
        case 'animation-blend-1d':
          motion = new AnimationBlend1D();
          break;
        case 'animation-blend-2d':
          motion = new AnimationBlend2D();
          break;
      }
      return create_(motion);
    }
  };
}

var _dec$i, _dec2$i, _dec3$g, _dec4$c, _dec5$9, _dec6$6, _class$j, _class2$h, _initializer$b, _initializer2$8, _descriptor$9, _descriptor2$4;
var ZERO_DURATION_THRESHOLD = 1e-5;
var PoseNodePlayMotion = (_dec$i = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodePlayMotion"), _dec2$i = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE), _dec3$g = poseGraphCreateNodeFactory(makeCreateNodeFactory(function (motion) {
  var node = new PoseNodePlayMotion();
  node.motion = motion;
  return node;
})), _dec4$c = poseGraphNodeAppearance({
  themeColor: '#227F9B'
}), _dec5$9 = input({
  type: PoseGraphType.FLOAT
}), _dec6$6 = input({
  type: PoseGraphType.FLOAT
}), _dec$i(_class$j = _dec2$i(_class$j = _dec3$g(_class$j = _dec4$c(_class$j = (_class2$h = function (_PoseNode) {
  function PoseNodePlayMotion() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNode.call.apply(_PoseNode, [this].concat(args)) || this;
    _this.motion = _initializer$b && _initializer$b();
    _this.syncInfo = _initializer2$8 && _initializer2$8();
    _initializerDefineProperty(_this, "startTime", _descriptor$9, _this);
    _initializerDefineProperty(_this, "speedMultiplier", _descriptor2$4, _this);
    _this._workspace = null;
    _this._runtimeSyncRecord = undefined;
    return _this;
  }
  _inheritsLoose(PoseNodePlayMotion, _PoseNode);
  var _proto = PoseNodePlayMotion.prototype;
  _proto.bind = function bind(context) {
    var motion = this.motion;
    if (!motion) {
      return;
    }
    var motionEval = motion[createEval](context, false);
    if (!motionEval) {
      return;
    }
    this._workspace = new Workspace$2(motionEval, motionEval.createPort());
    if (this.syncInfo.group) {
      this._runtimeSyncRecord = context.motionSyncManager.register(this.syncInfo);
    }
  };
  _proto.settle = function settle(context) {};
  _proto.reenter = function reenter() {
    if (this._workspace) {
      var runtimeSyncRecord = this._runtimeSyncRecord,
        duration = this._workspace.motionEval.duration;
      this._forceEvaluateEvaluation();
      var startTimeNormalized = duration < ZERO_DURATION_THRESHOLD ? 0.0 : clamp01(this.startTime / duration);
      if (runtimeSyncRecord) {
        runtimeSyncRecord.notifyRenter(startTimeNormalized);
      } else {
        this._workspace.normalizedTime = startTimeNormalized;
      }
      this._workspace.lastIndicativeWeight = 0.0;
    }
  };
  _proto.doUpdate = function doUpdate(context) {
    if (this._workspace) {
      var deltaTime = context.deltaTime;
      var runtimeSyncRecord = this._runtimeSyncRecord;
      var duration = this._workspace.motionEval.duration;
      var normalizedDeltaTime = 0.0;
      if (duration > ZERO_DURATION_THRESHOLD) {
        normalizedDeltaTime = deltaTime * this.speedMultiplier / duration;
      }
      if (runtimeSyncRecord) {
        runtimeSyncRecord.notifyUpdate(normalizedDeltaTime, context.indicativeWeight);
      } else {
        this._workspace.normalizedTime += normalizedDeltaTime;
      }
      this._workspace.lastIndicativeWeight = context.indicativeWeight;
    }
  };
  _proto.doEvaluate = function doEvaluate(context) {
    if (!this._workspace) {
      return context.pushDefaultedPose();
    } else {
      var normalizedTime = this._runtimeSyncRecord ? this._runtimeSyncRecord.getSyncedEnterTime() : this._workspace.normalizedTime;
      return this._workspace.motionEvalPort.evaluate(normalizedTime, context);
    }
  };
  return _createClass(PoseNodePlayMotion, [{
    key: "lastIndicativeWeight",
    get: function get() {
      var _this$_workspace$last, _this$_workspace;
      return (_this$_workspace$last = (_this$_workspace = this._workspace) == null ? void 0 : _this$_workspace.lastIndicativeWeight) !== null && _this$_workspace$last !== void 0 ? _this$_workspace$last : 0.0;
    }
  }, {
    key: "elapsedMotionTime",
    get: function get() {
      var _this$_workspace$norm, _this$_workspace2;
      return (_this$_workspace$norm = (_this$_workspace2 = this._workspace) == null ? void 0 : _this$_workspace2.normalizedTime) !== null && _this$_workspace$norm !== void 0 ? _this$_workspace$norm : 0.0;
    }
  }]);
}(PoseNode), _initializer$b = applyDecoratedInitializer(_class2$h.prototype, "motion", [serializable$d], function () {
  return new ClipMotion();
}), _initializer2$8 = applyDecoratedInitializer(_class2$h.prototype, "syncInfo", [serializable$d], function () {
  return new MotionSyncInfo();
}), _descriptor$9 = _applyDecoratedDescriptor(_class2$h.prototype, "startTime", [serializable$d, _dec5$9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return 0.0;
  }
}), _descriptor2$4 = _applyDecoratedDescriptor(_class2$h.prototype, "speedMultiplier", [serializable$d, _dec6$6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return 1.0;
  }
}), _class2$h)) || _class$j) || _class$j) || _class$j) || _class$j);
var Workspace$2 = function Workspace(motionEval, motionEvalPort) {
  this.normalizedTime = 0.0;
  this.lastIndicativeWeight = 0.0;
  this.motionEval = motionEval;
  this.motionEvalPort = motionEvalPort;
};

function isEvaluatableNode(node) {
  return node instanceof PoseNode || node instanceof PureValueNode;
}
var InstantiatedPoseGraph = function () {
  function InstantiatedPoseGraph(_rootPoseNode, _countingPlayMotionNodes) {
    this._rootPoseNode = _rootPoseNode;
    this._countingPlayMotionNodes = _countingPlayMotionNodes;
  }
  var _proto = InstantiatedPoseGraph.prototype;
  _proto.bind = function bind(context) {
    var _this$_rootPoseNode;
    (_this$_rootPoseNode = this._rootPoseNode) == null ? void 0 : _this$_rootPoseNode.bind(context);
  };
  _proto.settle = function settle(context) {
    var _this$_rootPoseNode2;
    (_this$_rootPoseNode2 = this._rootPoseNode) == null ? void 0 : _this$_rootPoseNode2.settle(context);
  };
  _proto.reenter = function reenter() {
    var _this$_rootPoseNode3;
    (_this$_rootPoseNode3 = this._rootPoseNode) == null ? void 0 : _this$_rootPoseNode3.reenter();
  };
  _proto.update = function update(context) {
    var _this$_rootPoseNode4;
    (_this$_rootPoseNode4 = this._rootPoseNode) == null ? void 0 : _this$_rootPoseNode4.update(context);
  };
  _proto.evaluate = function evaluate(context) {
    var _this$_rootPoseNode$e, _this$_rootPoseNode5;
    return (_this$_rootPoseNode$e = (_this$_rootPoseNode5 = this._rootPoseNode) == null ? void 0 : _this$_rootPoseNode5.evaluate(context, PoseTransformSpaceRequirement.LOCAL)) !== null && _this$_rootPoseNode$e !== void 0 ? _this$_rootPoseNode$e : null;
  };
  _proto.countMotionTime = function countMotionTime() {
    var playMotionNodes = this._countingPlayMotionNodes;
    if (!playMotionNodes) {
      {
        assertIsTrue(false, "Should not call countMotionTime() on this pose graph " + "since \"mayCountMotionTime\" was not passed to instantiatePoseGraph()");
      }
      return 0.0;
    }
    var maxWeightedTime = 0.0;
    var maxWeight = Number.NEGATIVE_INFINITY;
    for (var iPlayMotionNode = 0; iPlayMotionNode < playMotionNodes.length; ++iPlayMotionNode) {
      var _playMotionNodes$iPla = playMotionNodes[iPlayMotionNode],
        elapsedMotionTime = _playMotionNodes$iPla.elapsedMotionTime,
        lastIndicativeWeight = _playMotionNodes$iPla.lastIndicativeWeight;
      if (lastIndicativeWeight > maxWeight) {
        maxWeight = lastIndicativeWeight;
        maxWeightedTime = elapsedMotionTime;
      }
    }
    return maxWeightedTime;
  };
  return InstantiatedPoseGraph;
}();
function instantiatePoseGraph(graph, linkContext, mayCountMotionTime) {
  if (mayCountMotionTime === void 0) {
    mayCountMotionTime = false;
  }
  var outputNode = graph.outputNode;
  var outputNodeShell = graph.getShell(outputNode);
  assertIsTrue(outputNodeShell);
  var bindings = outputNodeShell.getBindings();
  assertIsTrue(bindings.length < 2);
  if (bindings.length === 0) {
    return new InstantiatedPoseGraph(undefined, mayCountMotionTime ? [] : undefined);
  }
  var binding = bindings[0];
  assertIsTrue(binding.outputIndex === 0);
  assertIsTrue(binding.producer instanceof PoseNode);
  var instantiationMap = new Map();
  var mainRecord = instantiateNode(graph, binding.producer, instantiationMap, linkContext);
  assertIsTrue(mainRecord instanceof PoseNode);
  return new InstantiatedPoseGraph(mainRecord, mayCountMotionTime ? Array.from(instantiationMap.values()).filter(function (node) {
    return node instanceof PoseNodePlayMotion;
  }) : undefined);
}
function instantiateNode(graph, node, instantiationMap, linkContext) {
  var shell = graph.getShell(node);
  assertIsTrue(shell, "Want to instantiate an unbound graph?");
  var existing = instantiationMap.get(node);
  if (existing) {
    return existing;
  }
  var instantiated = instantiate(node);
  if ('__callOnAfterDeserializeRecursive' in instantiated) {
    instantiated.__callOnAfterDeserializeRecursive();
  }
  if (instantiated instanceof PureValueNode) {
    instantiated.link(linkContext);
  }
  var consumerNode = instantiated;
  var runtimePVNodePropertyBindings = [];
  for (var _iterator = _createForOfIteratorHelperLoose(shell.getBindings()), _step; !(_step = _iterator()).done;) {
    var _step$value = _step.value,
      producerNode = _step$value.producer,
      producerOutputIndex = _step$value.outputIndex,
      consumerInputPath = _step$value.inputPath;
    if (!isEvaluatableNode(producerNode)) {
      warn("There's a input bound to a node with unrecognized type.");
      continue;
    }
    var producer = instantiateNode(graph, producerNode, instantiationMap, linkContext);
    if (producer instanceof PoseNode) {
      assertIsTrue(consumerNode instanceof PoseNode);
      linkPoseNode(consumerNode, consumerInputPath, producer, producerOutputIndex);
    } else {
      var runtimePVNodePropertyBinding = linkPVNode(consumerNode, consumerInputPath, producer, producerOutputIndex);
      if (runtimePVNodePropertyBinding) {
        runtimePVNodePropertyBindings.push(runtimePVNodePropertyBinding);
      }
    }
  }
  var dependencyEvaluation = new DependencyEvaluation(runtimePVNodePropertyBindings);
  var evaluation;
  if (consumerNode instanceof PoseNode) {
    consumerNode._setDependencyEvaluation(dependencyEvaluation);
    evaluation = consumerNode;
  } else {
    var pureValueNodeEvaluation = new RuntimePVNodeEvaluation(consumerNode, dependencyEvaluation);
    evaluation = pureValueNodeEvaluation;
  }
  instantiationMap.set(node, evaluation);
  return evaluation;
}
var DependencyEvaluation = function () {
  function DependencyEvaluation(bindingEvaluations) {
    this._bindingEvaluations = void 0;
    this._bindingEvaluations = bindingEvaluations;
  }
  var _proto2 = DependencyEvaluation.prototype;
  _proto2.evaluate = function evaluate() {
    var bindingEvaluations = this._bindingEvaluations;
    for (var _iterator2 = _createForOfIteratorHelperLoose(bindingEvaluations), _step2; !(_step2 = _iterator2()).done;) {
      var binding = _step2.value;
      binding.evaluate();
    }
  };
  return DependencyEvaluation;
}();
var RuntimePVNodeEvaluation = function () {
  function RuntimePVNodeEvaluation(_node, _dependency) {
    this._outputs = void 0;
    this._node = _node;
    this._dependency = _dependency;
    this._outputs = new Array(_node.outputCount);
  }
  var _proto3 = RuntimePVNodeEvaluation.prototype;
  _proto3.getDefaultOutput = function getDefaultOutput() {
    return this.getOutput(0);
  };
  _proto3.getOutput = function getOutput(outputIndex) {
    return this._outputs[outputIndex];
  };
  _proto3.evaluate = function evaluate() {
    var node = this._node,
      dependency = this._dependency;
    dependency.evaluate();
    node.selfEvaluate(this._outputs);
  };
  return _createClass(RuntimePVNodeEvaluation, [{
    key: "node",
    get: function get() {
      return this._node;
    }
  }, {
    key: "outputCount",
    get: function get() {
      return this._outputs.length;
    }
  }]);
}();
function linkPoseNode(consumerNode, consumerInputPath, producerNode, producerOutputIndex) {
  var consumerPropertyKey = consumerInputPath[0],
    _consumerInputPath$ = consumerInputPath[1],
    consumerElementIndex = _consumerInputPath$ === void 0 ? -1 : _consumerInputPath$;
  if (!(consumerPropertyKey in consumerNode)) {
    warn("Invalid binding: consumer node has no property " + consumerPropertyKey);
    return;
  }
  if (producerOutputIndex !== 0) {
    warn("Node " + producerNode.toString() + " does not have specified output " + producerOutputIndex + ".");
    return;
  }
  var consumerProperty = consumerNode[consumerPropertyKey];
  if (consumerElementIndex < 0) {
    if (consumerProperty !== null) {
      warn("Invalid binding: consumer node's input " + consumerPropertyKey + " should be leaved as evaluation before evaluation.");
      return;
    }
    consumerNode[consumerPropertyKey] = producerNode;
    return;
  }
  if (!Array.isArray(consumerProperty)) {
    warn("Invalid binding: consumer node's input " + consumerPropertyKey + " should be an array.");
    return;
  }
  if (consumerElementIndex >= consumerProperty.length) {
    warn("Invalid binding: consumer node's input " + consumerPropertyKey + " " + ("have length " + consumerProperty.length + " but the binding specified " + consumerElementIndex));
    return;
  }
  if (consumerProperty[consumerElementIndex] !== null) {
    warn("Invalid binding: consumer node's input " + consumerPropertyKey + "[" + consumerElementIndex + "] should be leaved as null before evaluation");
    return;
  }
  consumerProperty[consumerElementIndex] = producerNode;
}
var RuntimePVNodePlainPropertyBinding = function () {
  function RuntimePVNodePlainPropertyBinding(_consumerNode, _consumerPropertyKey, _producerRecord, _producerOutputIndex) {
    this._consumerNode = _consumerNode;
    this._consumerPropertyKey = _consumerPropertyKey;
    this._producerRecord = _producerRecord;
    this._producerOutputIndex = _producerOutputIndex;
  }
  var _proto4 = RuntimePVNodePlainPropertyBinding.prototype;
  _proto4.evaluate = function evaluate() {
    this._producerRecord.evaluate();
    this._consumerNode[this._consumerPropertyKey] = this._producerRecord.getOutput(this._producerOutputIndex);
  };
  return RuntimePVNodePlainPropertyBinding;
}();
var RuntimePVNodeArrayElementPropertyBinding = function () {
  function RuntimePVNodeArrayElementPropertyBinding(_consumerNode, _consumerPropertyKey, _consumerElementIndex, _producerRecord, _producerOutputIndex) {
    this._consumerNode = _consumerNode;
    this._consumerPropertyKey = _consumerPropertyKey;
    this._consumerElementIndex = _consumerElementIndex;
    this._producerRecord = _producerRecord;
    this._producerOutputIndex = _producerOutputIndex;
  }
  var _proto5 = RuntimePVNodeArrayElementPropertyBinding.prototype;
  _proto5.evaluate = function evaluate() {
    this._producerRecord.evaluate();
    this._consumerNode[this._consumerPropertyKey][this._consumerElementIndex] = this._producerRecord.getOutput(this._producerOutputIndex);
  };
  return RuntimePVNodeArrayElementPropertyBinding;
}();
function linkPVNode(consumerNode, consumerInputPath, producerRecord, producerOutputIndex) {
  var consumerPropertyKey = consumerInputPath[0],
    _consumerInputPath$2 = consumerInputPath[1],
    consumerElementIndex = _consumerInputPath$2 === void 0 ? -1 : _consumerInputPath$2;
  if (!(consumerPropertyKey in consumerNode)) {
    warn("Invalid binding: consumer node has no property " + consumerPropertyKey);
    return undefined;
  }
  var consumerProperty = consumerNode[consumerPropertyKey];
  if (consumerElementIndex < 0) {
    return new RuntimePVNodePlainPropertyBinding(consumerNode, consumerPropertyKey, producerRecord, producerOutputIndex);
  }
  if (!Array.isArray(consumerProperty)) {
    warn("Invalid binding: consumer node's input " + consumerPropertyKey + " should be an array.");
    return undefined;
  }
  if (consumerElementIndex >= consumerProperty.length) {
    warn("Invalid binding: consumer node's input " + consumerPropertyKey + " " + ("have length " + consumerProperty.length + " but the binding specified " + consumerElementIndex));
    return undefined;
  }
  return new RuntimePVNodeArrayElementPropertyBinding(consumerNode, consumerPropertyKey, consumerElementIndex, producerRecord, producerOutputIndex);
}

var _emptyClipStatusesIte;
var MAX_TRANSITIONS_PER_FRAME = 16;
var TopLevelStateMachineEvaluation = function () {
  function TopLevelStateMachineEvaluation(stateMachine, name, context) {
    this.passthroughWeight = 1.0;
    this._motionStates = [];
    this._proceduralPoseStates = [];
    this._topLevelEntry = void 0;
    this._topLevelExit = void 0;
    this._currentNode = void 0;
    this._pendingTransitionPath = [];
    this._activatedTransitions = [];
    this._activatedTransitionPool = ActivatedTransition.createPool(4);
    this._updateContextGenerator = new AnimationGraphUpdateContextGenerator();
    this._conditionEvaluationContext = new ConditionEvaluationContextImpl();
    this._additive = false;
    this._additive = context.additive;
    this.name = name;
    this._controller = context.controller;
    var _this$_addStateMachin = this._addStateMachine(stateMachine, null, context, name),
      entry = _this$_addStateMachin.entry,
      exit = _this$_addStateMachin.exit;
    this._topLevelEntry = entry;
    this._topLevelExit = exit;
    this._currentNode = entry;
    entry.increaseActiveReference();
    this._resetTrigger = context.triggerResetter;
  }
  var _proto = TopLevelStateMachineEvaluation.prototype;
  _proto.settle = function settle(context) {
    var proceduralPoseStates = this._proceduralPoseStates;
    var nProceduralPoseStates = proceduralPoseStates.length;
    for (var iState = 0; iState < nProceduralPoseStates; ++iState) {
      var state = proceduralPoseStates[iState];
      state.settle(context);
    }
  };
  _proto.reenter = function reenter() {
    for (var _iterator = _createForOfIteratorHelperLoose(this._activatedTransitions), _step; !(_step = _iterator()).done;) {
      var transition = _step.value;
      transition.destination.decreaseActiveReference();
      this._activatedTransitionPool.free(transition);
    }
    this._activatedTransitions.length = 0;
    this._topLevelEntry.increaseActiveReference();
    this._currentNode.decreaseActiveReference();
    this._currentNode = this._topLevelEntry;
  };
  _proto.update = function update(context) {
    assertIsTrue(!this.exited);
    this._loopMatchTransitions();
    this._resetStateTickFlagsAndWeights();
    this._updateActivatedTransitions(context.deltaTime);
    this._commitStateUpdates(context);
  };
  _proto.evaluate = function evaluate(context) {
    var sampled = this._sample(context);
    if (sampled) {
      return sampled;
    }
    return this._pushNullishPose(context);
  };
  _proto.getCurrentStateStatus = function getCurrentStateStatus() {
    var currentNode = this._currentNode;
    if (currentNode.kind === NodeKind.animation) {
      return currentNode.getStatus();
    } else if (currentNode.kind === NodeKind.procedural) {
      return currentNode.getStatus();
    } else {
      return null;
    }
  };
  _proto.getCurrentClipStatuses = function getCurrentClipStatuses() {
    var currentNode = this._currentNode;
    if (currentNode.kind === NodeKind.animation) {
      return currentNode.getClipStatuses(currentNode.absoluteWeight);
    } else {
      return emptyClipStatusesIterable;
    }
  };
  _proto.getCurrentTransition = function getCurrentTransition(transitionStatus) {
    var activatedTransitions = this._activatedTransitions;
    if (activatedTransitions.length === 0) {
      return false;
    }
    var lastActivatedTransition = activatedTransitions[activatedTransitions.length - 1];
    var baseDurationState = activatedTransitions.length === 1 ? this._currentNode : activatedTransitions[activatedTransitions.length - 2].destination;
    var absoluteDuration = lastActivatedTransition.getAbsoluteDuration(baseDurationState);
    transitionStatus.duration = absoluteDuration;
    transitionStatus.time = lastActivatedTransition.normalizedElapsedTime * absoluteDuration;
    return true;
  };
  _proto.getNextStateStatus = function getNextStateStatus() {
    var activatedTransitions = this._activatedTransitions;
    if (activatedTransitions.length === 0) {
      return null;
    }
    var lastState = activatedTransitions[activatedTransitions.length - 1].destination;
    switch (lastState.kind) {
      default:
        break;
      case NodeKind.procedural:
        return lastState.getStatus();
      case NodeKind.animation:
        return lastState.getStatus();
    }
    return null;
  };
  _proto.getNextClipStatuses = function getNextClipStatuses() {
    var _lastState$getClipSta;
    var activatedTransitions = this._activatedTransitions;
    if (activatedTransitions.length === 0) {
      return emptyClipStatusesIterable;
    }
    var lastActivatedTransition = activatedTransitions[activatedTransitions.length - 1];
    var lastState = lastActivatedTransition.destination;
    switch (lastState.kind) {
      default:
        return emptyClipStatusesIterable;
      case NodeKind.animation:
        return (_lastState$getClipSta = lastState.getClipStatuses(lastActivatedTransition.destination.absoluteWeight)) !== null && _lastState$getClipSta !== void 0 ? _lastState$getClipSta : emptyClipStatusesIterable;
    }
  };
  _proto.overrideClips = function overrideClips(context) {
    var motionStates = this._motionStates;
    var nMotionStates = motionStates.length;
    for (var iMotionState = 0; iMotionState < nMotionStates; ++iMotionState) {
      var node = motionStates[iMotionState];
      node.overrideClips(context);
    }
  };
  _proto._addStateMachine = function _addStateMachine(graph, parentStateMachineInfo, context, __DEBUG_ID__) {
    var _this = this;
    var nodes = Array.from(graph.states());
    var entryEval;
    var anyNode;
    var exitEval;
    var nodeEvaluations = nodes.map(function (node) {
      if (node instanceof MotionState) {
        var motionStateEval = new VMSMEval(node, context);
        _this._motionStates.push(motionStateEval);
        return motionStateEval;
      } else if (node === graph.entryState) {
        return entryEval = new SpecialStateEval(node, NodeKind.entry, node.name);
      } else if (node === graph.exitState) {
        return exitEval = new SpecialStateEval(node, NodeKind.exit, node.name);
      } else if (node === graph.anyState) {
        return anyNode = new SpecialStateEval(node, NodeKind.any, node.name);
      } else if (node instanceof EmptyState) {
        return new EmptyStateEval(node);
      } else if (node instanceof ProceduralPoseState_) {
        var stateEval = new ProceduralPoseStateEval(node, context);
        _this._proceduralPoseStates.push(stateEval);
        return stateEval;
      } else {
        assertIsTrue(node instanceof SubStateMachine);
        return null;
      }
    });
    assertIsNonNullable(entryEval, 'Entry node is missing');
    assertIsNonNullable(exitEval, 'Exit node is missing');
    assertIsNonNullable(anyNode, 'Any node is missing');
    var stateMachineInfo = {
      components: null,
      parent: parentStateMachineInfo,
      entry: entryEval,
      exit: exitEval,
      any: anyNode
    };
    for (var iNode = 0; iNode < nodes.length; ++iNode) {
      var nodeEval = nodeEvaluations[iNode];
      if (nodeEval) {
        nodeEval.stateMachine = stateMachineInfo;
      }
    }
    var subStateMachineInfos = nodes.map(function (node) {
      if (node instanceof SubStateMachine) {
        var subStateMachineInfo = _this._addStateMachine(node.stateMachine, stateMachineInfo, context, __DEBUG_ID__ + "/" + node.name);
        subStateMachineInfo.components = new InstantiatedComponents(node);
        return subStateMachineInfo;
      } else {
        return null;
      }
    });
    {
      for (var _iterator2 = _createForOfIteratorHelperLoose(nodeEvaluations), _step2; !(_step2 = _iterator2()).done;) {
        var _nodeEval = _step2.value;
        if (_nodeEval) {
          _nodeEval.setPrefix_debug(__DEBUG_ID__ + "/");
        }
      }
    }
    for (var _iNode = 0; _iNode < nodes.length; ++_iNode) {
      var node = nodes[_iNode];
      var outgoingTemplates = graph.getOutgoings(node);
      var fromNode = void 0;
      if (node instanceof SubStateMachine) {
        var subStateMachineInfo = subStateMachineInfos[_iNode];
        assertIsNonNullable(subStateMachineInfo);
        fromNode = subStateMachineInfo.exit;
      } else {
        var _nodeEval2 = nodeEvaluations[_iNode];
        assertIsNonNullable(_nodeEval2);
        fromNode = _nodeEval2;
      }
      var _loop = function _loop() {
        var outgoing = _step3.value;
        var outgoingNode = outgoing.to;
        var iOutgoingNode = nodes.findIndex(function (nodeTemplate) {
          return nodeTemplate === outgoing.to;
        });
        if (iOutgoingNode < 0) {
          assertIsTrue(false, 'Bad animation data');
        }
        var toNode;
        if (outgoingNode instanceof SubStateMachine) {
          var _subStateMachineInfo = subStateMachineInfos[iOutgoingNode];
          assertIsNonNullable(_subStateMachineInfo);
          toNode = _subStateMachineInfo.entry;
        } else {
          var _nodeEval3 = nodeEvaluations[iOutgoingNode];
          assertIsNonNullable(_nodeEval3);
          if (_nodeEval3 instanceof VMSMEval) {
            toNode = _nodeEval3.entry;
          } else {
            toNode = _nodeEval3;
          }
        }
        var conditions = outgoing.conditions.map(function (condition) {
          return condition[createEval](context);
        });
        var transitionEval = {
          conditions: conditions,
          to: toNode,
          triggers: undefined,
          duration: 0.0,
          normalizedDuration: false,
          destinationStart: 0.0,
          relativeDestinationStart: false,
          exitCondition: 0.0,
          exitConditionEnabled: false,
          activated: false,
          startEventBinding: undefined,
          endEventBinding: undefined
        };
        if (isAnimationTransition(outgoing) || outgoing instanceof EmptyStateTransition || outgoing instanceof ProceduralPoseTransition_) {
          transitionEval.duration = outgoing.duration;
          transitionEval.destinationStart = outgoing.destinationStart;
          transitionEval.relativeDestinationStart = outgoing.relativeDestinationStart;
          if (outgoing.startEventBinding.isBound) {
            transitionEval.startEventBinding = outgoing.startEventBinding;
          }
          if (outgoing.endEventBinding.isBound) {
            transitionEval.endEventBinding = outgoing.endEventBinding;
          }
          if (isAnimationTransition(outgoing)) {
            transitionEval.normalizedDuration = outgoing.relativeDuration;
            transitionEval.exitConditionEnabled = outgoing.exitConditionEnabled;
            transitionEval.exitCondition = outgoing.exitCondition;
          }
        }
        transitionEval.conditions.forEach(function (conditionEval, iCondition) {
          var condition = outgoing.conditions[iCondition];
          if (condition instanceof TriggerCondition && condition.trigger) {
            var _transitionEval$trigg;
            ((_transitionEval$trigg = transitionEval.triggers) !== null && _transitionEval$trigg !== void 0 ? _transitionEval$trigg : transitionEval.triggers = []).push(condition.trigger);
          }
        });
        fromNode.addTransition(transitionEval);
      };
      for (var _iterator3 = _createForOfIteratorHelperLoose(outgoingTemplates), _step3; !(_step3 = _iterator3()).done;) {
        _loop();
      }
    }
    return stateMachineInfo;
  };
  _proto._loopMatchTransitions = function _loopMatchTransitions() {
    var pendingTransitionPath = this._pendingTransitionPath,
      activatedTransitions = this._activatedTransitions;
    assertIsTrue(pendingTransitionPath.length === 0);
    var matchingSource = activatedTransitions.length === 0 ? this._currentNode : activatedTransitions[activatedTransitions.length - 1].destination;
    for (var iterations = 0;; ++iterations) {
      if (iterations >= MAX_TRANSITIONS_PER_FRAME) {
        var prettyPath = '';
        {
          var lastDestination = activatedTransitions[activatedTransitions.length - 1].destination;
          var loopFormPosition = -1;
          for (var i = activatedTransitions.length - 2; i >= 0; --i) {
            if (activatedTransitions[i].destination === lastDestination) {
              loopFormPosition = i;
              break;
            }
          }
          prettyPath = this._currentNode.name + " --> ... --> ";
          var pathToPrint = loopFormPosition < 0 ? activatedTransitions.slice(-MAX_TRANSITIONS_PER_FRAME) : activatedTransitions.slice(loopFormPosition);
          prettyPath += "" + pathToPrint.map(function (t) {
            return t.destination.name;
          }).join(' --> ');
        }
        warnID(14000, MAX_TRANSITIONS_PER_FRAME, prettyPath);
        break;
      }
      var transition = this._matchNextTransition(matchingSource);
      if (!transition) {
        break;
      }
      var destinationState = transition.to;
      var currentMatchingSource = matchingSource;
      matchingSource = destinationState;
      if (!isRealState(destinationState)) {
        pendingTransitionPath.push(transition);
        continue;
      }
      if (destinationState === currentMatchingSource) {
        break;
      }
      this._activateTransition(pendingTransitionPath, transition);
      pendingTransitionPath.length = 0;
    }
    pendingTransitionPath.length = 0;
  };
  _proto._resetStateTickFlagsAndWeights = function _resetStateTickFlagsAndWeights() {
    var currentNode = this._currentNode,
      activatedTransitions = this._activatedTransitions;
    currentNode.resetTickFlagsAndWeight();
    for (var iTransition = 0; iTransition < activatedTransitions.length; ++iTransition) {
      var destination = activatedTransitions[iTransition].destination;
      destination.resetTickFlagsAndWeight();
    }
  };
  _proto._commitStateUpdates = function _commitStateUpdates(parentContext) {
    var currentNode = this._currentNode,
      activatedTransitions = this._activatedTransitions;
      this._updateContextGenerator;
    this._commitStateUpdate(currentNode, parentContext);
    for (var iTransition = 0; iTransition < activatedTransitions.length; ++iTransition) {
      var transition = activatedTransitions[iTransition];
      var destination = transition.destination;
      this._commitStateUpdate(destination, parentContext);
    }
  };
  _proto._commitStateUpdate = function _commitStateUpdate(state, parentContext) {
    var updateContextGenerator = this._updateContextGenerator;
    if (state.testTickFlag(StateTickFlag.UPDATED)) {
      return;
    }
    state.setTickFlag(StateTickFlag.UPDATED);
    if (state.kind === NodeKind.animation) {
      state.update(parentContext.deltaTime, this._controller);
    } else if (state.kind === NodeKind.procedural) {
      var updateContext = updateContextGenerator.generate(parentContext.deltaTime, parentContext.indicativeWeight * state.absoluteWeight);
      state.update(updateContext);
    }
  };
  _proto._sample = function _sample(context) {
    var currentNode = this._currentNode,
      activatedTransitions = this._activatedTransitions;
    var passthroughWeight = 1.0;
    var finalPose = null;
    var sumActualBlendedWeight = 0.0;
    if (currentNode.kind === NodeKind.animation) {
      var _currentNode$evaluate;
      finalPose = (_currentNode$evaluate = currentNode.evaluate(context)) !== null && _currentNode$evaluate !== void 0 ? _currentNode$evaluate : this._pushNullishPose(context);
    } else if (currentNode.kind === NodeKind.procedural) {
      var _currentNode$evaluate2;
      finalPose = (_currentNode$evaluate2 = currentNode.evaluate(context)) !== null && _currentNode$evaluate2 !== void 0 ? _currentNode$evaluate2 : this._pushNullishPose(context);
    } else {
      passthroughWeight -= currentNode.absoluteWeight;
      finalPose = null;
    }
    if (finalPose) {
      sumActualBlendedWeight = currentNode.absoluteWeight;
    }
    currentNode.setTickFlag(StateTickFlag.EVALUATED);
    for (var iTransition = 0; iTransition < activatedTransitions.length; ++iTransition) {
      var transition = activatedTransitions[iTransition];
      var destination = transition.destination;
      if (destination.testTickFlag(StateTickFlag.EVALUATED)) {
        continue;
      }
      destination.setTickFlag(StateTickFlag.EVALUATED);
      var destAbsoluteWeight = destination.absoluteWeight;
      var destPose = void 0;
      if (destination.kind === NodeKind.empty) {
        passthroughWeight -= destAbsoluteWeight;
        destPose = null;
      } else {
        var _destination$evaluate;
        destPose = (_destination$evaluate = destination.evaluate(context)) !== null && _destination$evaluate !== void 0 ? _destination$evaluate : this._pushNullishPose(context);
      }
      if (!destPose) {
        continue;
      }
      if (!finalPose) {
        finalPose = destPose;
      } else {
        sumActualBlendedWeight += destAbsoluteWeight;
        if (sumActualBlendedWeight) {
          var t = destAbsoluteWeight / sumActualBlendedWeight;
          blendPoseInto(finalPose, destPose, t);
          context.popPose();
        } else {
          finalPose = destPose;
        }
      }
    }
    this.passthroughWeight = passthroughWeight;
    return finalPose;
  };
  _proto._pushNullishPose = function _pushNullishPose(context) {
    return this._additive ? context.pushZeroDeltaPose() : context.pushDefaultedPose();
  };
  _proto._matchNextTransition = function _matchNextTransition(sourceState) {
    var transition = this._matchTransition(sourceState, sourceState);
    if (transition) {
      return transition;
    }
    if (sourceState.kind === NodeKind.animation || sourceState.kind === NodeKind.procedural) {
      var _transition = this._matchAnyScoped(sourceState);
      if (_transition) {
        return _transition;
      }
    }
    return null;
  };
  _proto._matchAnyScoped = function _matchAnyScoped(realNode) {
    for (var ancestor = realNode.stateMachine; ancestor !== null; ancestor = ancestor.parent) {
      var transition = this._matchTransition(ancestor.any, realNode);
      if (transition) {
        return transition;
      }
    }
    return null;
  };
  _proto._matchTransition = function _matchTransition(node, realNode) {
    assertIsTrue(node === realNode || node.kind === NodeKind.any);
    var conditionEvaluationContext = this._conditionEvaluationContext;
    conditionEvaluationContext.set(realNode);
    var outgoingTransitions = node.outgoingTransitions;
    var nTransitions = outgoingTransitions.length;
    for (var iTransition = 0; iTransition < nTransitions; ++iTransition) {
      var transition = outgoingTransitions[iTransition];
      if (transition.activated) {
        continue;
      }
      var conditions = transition.conditions;
      var nConditions = conditions.length;
      if (nConditions === 0) {
        if (node.kind === NodeKind.entry || node.kind === NodeKind.exit) {
          {
            conditionEvaluationContext.unset();
          }
          return transition;
        }
        if (!transition.exitConditionEnabled) {
          continue;
        }
      }
      if (realNode.kind === NodeKind.animation && transition.exitConditionEnabled) {
        var exitTime = realNode.duration * transition.exitCondition;
        var currentStateTime = realNode.time;
        if (currentStateTime < exitTime) {
          break;
        }
      }
      var satisfied = true;
      for (var iCondition = 0; iCondition < nConditions; ++iCondition) {
        var condition = conditions[iCondition];
        if (!condition.eval(this._conditionEvaluationContext)) {
          satisfied = false;
          break;
        }
      }
      if (!satisfied) {
        continue;
      }
      {
        conditionEvaluationContext.unset();
      }
      return transition;
    }
    {
      conditionEvaluationContext.unset();
    }
    return null;
  };
  _proto._activateTransition = function _activateTransition(prefix, lastTransition) {
    var destinationState = lastTransition.to;
    assertIsTrue(isRealState(destinationState));
    var activatedTransition = this._activatedTransitionPool.alloc();
    activatedTransition.reset(prefix, lastTransition);
    this._activatedTransitions.push(activatedTransition);
    var nTransitions = activatedTransition.path.length;
    for (var iTransition = 0; iTransition < nTransitions; ++iTransition) {
      var transition = activatedTransition.path[iTransition];
      this._resetTriggersOnTransition(transition);
    }
    for (var iDetailedTransition = 0; iDetailedTransition < activatedTransition.path.length; ++iDetailedTransition) {
      var detailedTransition = activatedTransition.path[iDetailedTransition];
      this._callEnterMethods(detailedTransition.to);
    }
    assertIsTrue(this._activatedTransitions.length > 0);
    var previousState = this._activatedTransitions.length === 1 ? this._currentNode : this._activatedTransitions[this._activatedTransitions.length - 2].destination;
    if (previousState instanceof EventifiedStateEval) {
      if (previousState.transitionOutEventBinding) {
        this._emit(previousState.transitionOutEventBinding);
      }
    }
    if (lastTransition.startEventBinding) {
      this._emit(lastTransition.startEventBinding);
    }
    if (destinationState instanceof EventifiedStateEval) {
      if (destinationState.transitionInEventBinding) {
        this._emit(destinationState.transitionInEventBinding);
      }
    }
  };
  _proto._updateActivatedTransitions = function _updateActivatedTransitions(deltaTime) {
    var activatedTransitions = this._activatedTransitions;
    var iTransition = activatedTransitions.length - 1;
    var remainingWeight = 1.0;
    var lastTransitionIndex = iTransition;
    for (; iTransition >= 0; --iTransition) {
      var transition = activatedTransitions[iTransition];
      var sourceState = iTransition === 0 ? this._currentNode : activatedTransitions[iTransition - 1].destination;
      transition.update(deltaTime, sourceState);
      if (transition.done) {
        this._dropActivatedTransitions(lastTransitionIndex);
        break;
      }
      var destinationWeight = transition.normalizedElapsedTime * remainingWeight;
      transition.destination.increaseAbsoluteWeight(destinationWeight);
      remainingWeight *= 1.0 - transition.normalizedElapsedTime;
      lastTransitionIndex = iTransition - 1;
    }
    this._currentNode.increaseAbsoluteWeight(remainingWeight);
  };
  _proto._dropActivatedTransitions = function _dropActivatedTransitions(lastTransitionIndex) {
    var activatedTransition = this._activatedTransitions,
      activatedTransitionPool = this._activatedTransitionPool;
    assertIsTrue(lastTransitionIndex >= 0 && lastTransitionIndex < activatedTransition.length);
    var lenSubpath = lastTransitionIndex + 1;
    var lastTransition = activatedTransition[lastTransitionIndex];
    var newCurrentState = lastTransition.destination;
    {
      assertIsTrue(lastTransition.path.length !== 0);
      var lastRealTransition = lastTransition.path[lastTransition.path.length - 1];
      if (lastRealTransition.endEventBinding) {
        this._emit(lastRealTransition.endEventBinding);
      }
    }
    this._callExitMethods(this._currentNode);
    for (var iTransition = 0; iTransition <= lastTransitionIndex; ++iTransition) {
      var transition = activatedTransition[iTransition];
      if (iTransition !== lastTransitionIndex) {
        transition.destination.decreaseActiveReference();
      }
      var iLastExitingDetailedTransition = iTransition === lastTransitionIndex ? transition.path.length - 1 : transition.path.length;
      for (var iDetailedTransition = 0; iDetailedTransition < iLastExitingDetailedTransition; ++iDetailedTransition) {
        var detailedTransition = transition.path[iDetailedTransition];
        this._callExitMethods(detailedTransition.to);
      }
      activatedTransitionPool.free(transition);
    }
    if (lastTransitionIndex === activatedTransition.length - 1) {
      activatedTransition.length = 0;
    } else {
      for (var _iTransition = lastTransitionIndex + 1; _iTransition < activatedTransition.length; ++_iTransition) {
        activatedTransition[_iTransition - lenSubpath] = activatedTransition[_iTransition];
      }
      activatedTransition.length -= lenSubpath;
    }
    this._currentNode.decreaseActiveReference();
    this._currentNode = newCurrentState;
  };
  _proto._resetTriggersOnTransition = function _resetTriggersOnTransition(transition) {
    var triggers = transition.triggers;
    if (triggers) {
      var nTriggers = triggers.length;
      for (var iTrigger = 0; iTrigger < nTriggers; ++iTrigger) {
        var trigger = triggers[iTrigger];
        this._resetTrigger(trigger);
      }
    }
  };
  _proto._resetTrigger = function _resetTrigger(name) {
    var triggerResetFn = this._triggerReset;
    triggerResetFn(name);
  };
  _proto._callEnterMethods = function _callEnterMethods(node) {
    var _node$stateMachine$co;
    var controller = this._controller;
    switch (node.kind) {
      default:
        break;
      case NodeKind.animation:
        {
          node.components.callMotionStateEnterMethods(controller, node.getStatus());
          break;
        }
      case NodeKind.entry:
        (_node$stateMachine$co = node.stateMachine.components) == null ? void 0 : _node$stateMachine$co.callStateMachineEnterMethods(controller);
        break;
    }
  };
  _proto._callExitMethods = function _callExitMethods(node) {
    var _node$stateMachine$co2;
    var controller = this._controller;
    switch (node.kind) {
      default:
        break;
      case NodeKind.animation:
        {
          node.components.callMotionStateExitMethods(controller, node.getStatus());
          break;
        }
      case NodeKind.exit:
        (_node$stateMachine$co2 = node.stateMachine.components) == null ? void 0 : _node$stateMachine$co2.callStateMachineExitMethods(controller);
        break;
    }
  };
  _proto._emit = function _emit(eventBinding) {
    eventBinding.emit(this._controller.node);
  };
  return _createClass(TopLevelStateMachineEvaluation, [{
    key: "exited",
    get: function get() {
      return this._currentNode === this._topLevelExit;
    }
  }]);
}();
function isRealState(stateEval) {
  return stateEval.kind === NodeKind.animation || stateEval.kind === NodeKind.empty || stateEval.kind === NodeKind.procedural;
}
function createStateStatusCache() {
  return {
    progress: 0.0
  };
}
var emptyClipStatusesIterator = {
  next: function next() {
    return {
      done: true,
      value: undefined
    };
  }
};
var emptyClipStatusesIterable = (_emptyClipStatusesIte = {}, _emptyClipStatusesIte[Symbol.iterator] = function () {
  return emptyClipStatusesIterator;
}, _emptyClipStatusesIte);
var NodeKind;
(function (NodeKind) {
  NodeKind[NodeKind["entry"] = 0] = "entry";
  NodeKind[NodeKind["exit"] = 1] = "exit";
  NodeKind[NodeKind["any"] = 2] = "any";
  NodeKind[NodeKind["animation"] = 3] = "animation";
  NodeKind[NodeKind["empty"] = 4] = "empty";
  NodeKind[NodeKind["procedural"] = 5] = "procedural";
})(NodeKind || (NodeKind = {}));
var StateEval = function () {
  function StateEval(node) {
    this.name = void 0;
    this.outgoingTransitions = [];
    this._activeReferenceCount = 0;
    this._tickFlags = 0;
    this._absoluteWeight = 0.0;
    this.name = node.name;
  }
  var _proto2 = StateEval.prototype;
  _proto2.setPrefix_debug = function setPrefix_debug(prefix) {
    this.__DEBUG_ID__ = "" + prefix + this.name;
  };
  _proto2.addTransition = function addTransition(transition) {
    this.outgoingTransitions.push(transition);
  };
  _proto2.increaseActiveReference = function increaseActiveReference() {
    if (this._activeReferenceCount === 0) {
      this._absoluteWeight = 0.0;
      this._tickFlags = 0;
    }
    ++this._activeReferenceCount;
  };
  _proto2.decreaseActiveReference = function decreaseActiveReference() {
    {
      this._checkActivated();
    }
    --this._activeReferenceCount;
  };
  _proto2.resetTickFlagsAndWeight = function resetTickFlagsAndWeight() {
    this._checkActivated();
    this._absoluteWeight = 0.0;
    this._tickFlags = 0;
  };
  _proto2.increaseAbsoluteWeight = function increaseAbsoluteWeight(weight) {
    this._absoluteWeight += weight;
  };
  _proto2.testTickFlag = function testTickFlag(flag) {
    {
      this._checkActivated();
    }
    return !!(this._tickFlags & flag);
  };
  _proto2.setTickFlag = function setTickFlag(flag) {
    {
      this._checkActivated();
    }
    assertIsTrue(!this.testTickFlag(flag), "Can not set " + StateTickFlag[flag] + " since it has been set!");
    this._tickFlags |= flag;
  };
  _proto2._checkActivated = function _checkActivated() {
    assertIsTrue(this._activeReferenceCount > 0, "The state has not been activated");
  };
  return _createClass(StateEval, [{
    key: "absoluteWeight",
    get: function get() {
      return this._absoluteWeight;
    }
  }, {
    key: "activeReferenceCount",
    get: function get() {
      return this._activeReferenceCount;
    }
  }]);
}();
var EventifiedStateEval = function (_StateEval2) {
  function EventifiedStateEval(state) {
    var _this2;
    _this2 = _StateEval2.call(this, state) || this;
    _this2.transitionInEventBinding = undefined;
    _this2.transitionOutEventBinding = undefined;
    if (state.transitionInEventBinding.isBound) {
      _this2.transitionInEventBinding = state.transitionInEventBinding;
    }
    if (state.transitionOutEventBinding.isBound) {
      _this2.transitionOutEventBinding = state.transitionOutEventBinding;
    }
    return _this2;
  }
  _inheritsLoose(EventifiedStateEval, _StateEval2);
  return EventifiedStateEval;
}(StateEval);
var StateTickFlag;
(function (StateTickFlag) {
  StateTickFlag[StateTickFlag["UPDATED"] = 1] = "UPDATED";
  StateTickFlag[StateTickFlag["EVALUATED"] = 2] = "EVALUATED";
})(StateTickFlag || (StateTickFlag = {}));
var InstantiatedComponents = function () {
  function InstantiatedComponents(node) {
    this._components = node.instantiateComponents();
  }
  var _proto3 = InstantiatedComponents.prototype;
  _proto3.callMotionStateEnterMethods = function callMotionStateEnterMethods(controller, status) {
    this._callMotionStateCallbackIfNonDefault('onMotionStateEnter', controller, status);
  };
  _proto3.callMotionStateUpdateMethods = function callMotionStateUpdateMethods(controller, status) {
    this._callMotionStateCallbackIfNonDefault('onMotionStateUpdate', controller, status);
  };
  _proto3.callMotionStateExitMethods = function callMotionStateExitMethods(controller, status) {
    this._callMotionStateCallbackIfNonDefault('onMotionStateExit', controller, status);
  };
  _proto3.callStateMachineEnterMethods = function callStateMachineEnterMethods(controller) {
    this._callStateMachineCallbackIfNonDefault('onStateMachineEnter', controller);
  };
  _proto3.callStateMachineExitMethods = function callStateMachineExitMethods(controller) {
    this._callStateMachineCallbackIfNonDefault('onStateMachineExit', controller);
  };
  _proto3._callMotionStateCallbackIfNonDefault = function _callMotionStateCallbackIfNonDefault(methodName, controller, status) {
    var components = this._components;
    var nComponents = components.length;
    for (var iComponent = 0; iComponent < nComponents; ++iComponent) {
      var component = components[iComponent];
      if (component[methodName] !== StateMachineComponent.prototype[methodName]) {
        component[methodName](controller, status);
      }
    }
  };
  _proto3._callStateMachineCallbackIfNonDefault = function _callStateMachineCallbackIfNonDefault(methodName, controller) {
    var components = this._components;
    var nComponents = components.length;
    for (var iComponent = 0; iComponent < nComponents; ++iComponent) {
      var component = components[iComponent];
      if (component[methodName] !== StateMachineComponent.prototype[methodName]) {
        component[methodName](controller);
      }
    }
  };
  return InstantiatedComponents;
}();
var VMSMEval = function () {
  function VMSMEval(state, context) {
    var _state$motion$createE, _state$motion;
    this._source = null;
    this._baseSpeed = 1.0;
    this._speed = 1.0;
    this._publicState = void 0;
    this._privateState = void 0;
    var name = state.name;
    this._baseSpeed = state.speed;
    this._setSpeedMultiplier(1.0);
    if (state.speedMultiplierEnabled && state.speedMultiplier) {
      var speedMultiplierVarName = state.speedMultiplier;
      var varInstance = context.getVar(speedMultiplierVarName);
      if (validateVariableExistence(varInstance, speedMultiplierVarName)) {
        validateVariableType(varInstance.type, VariableType.FLOAT, speedMultiplierVarName);
        varInstance.bind(this._setSpeedMultiplier, this);
        var initialSpeedMultiplier = varInstance.value;
        this._setSpeedMultiplier(initialSpeedMultiplier);
      }
    }
    var sourceEval = (_state$motion$createE = (_state$motion = state.motion) == null ? void 0 : _state$motion[createEval](context, false)) !== null && _state$motion$createE !== void 0 ? _state$motion$createE : null;
    if (sourceEval) {
      Object.defineProperty(sourceEval, '__DEBUG_ID__', {
        value: name
      });
    }
    this._source = sourceEval;
    this._publicState = new VMSMInternalState(this, state, sourceEval == null ? void 0 : sourceEval.createPort());
    this._privateState = new VMSMInternalState(this, state, sourceEval == null ? void 0 : sourceEval.createPort());
    this.components = new InstantiatedComponents(state);
  }
  var _proto4 = VMSMEval.prototype;
  _proto4.setPrefix_debug = function setPrefix_debug(prefix) {
    this._publicState.setPrefix_debug(prefix);
    this._privateState.setPrefix_debug(prefix);
  };
  _proto4.addTransition = function addTransition(transition) {
    if (transition.to === this._publicState) {
      this._publicState.addTransition(_extends({}, transition, {
        to: this._privateState
      }));
    } else {
      this._publicState.addTransition(transition);
    }
    this._privateState.addTransition(transition);
  };
  _proto4.getClipStatuses = function getClipStatuses(baseWeight) {
    var source = this._source;
    if (!source) {
      return emptyClipStatusesIterable;
    } else {
      var _ref;
      return _ref = {}, _ref[Symbol.iterator] = function () {
        return source.getClipStatuses(baseWeight);
      }, _ref;
    }
  };
  _proto4.overrideClips = function overrideClips(context) {
    var _this$_source;
    (_this$_source = this._source) == null ? void 0 : _this$_source.overrideClips(context);
  };
  _proto4._setSpeedMultiplier = function _setSpeedMultiplier(value) {
    this._speed = this._baseSpeed * value;
  };
  return _createClass(VMSMEval, [{
    key: "duration",
    get: function get() {
      var _this$_source$duratio, _this$_source2;
      return (_this$_source$duratio = (_this$_source2 = this._source) == null ? void 0 : _this$_source2.duration) !== null && _this$_source$duratio !== void 0 ? _this$_source$duratio : 0.0;
    }
  }, {
    key: "speed",
    get: function get() {
      return this._speed;
    }
  }, {
    key: "entry",
    get: function get() {
      return this._publicState;
    }
  }, {
    key: "stateMachine",
    get: function get() {
      return this._stateMachine;
    },
    set: function set(value) {
      this._stateMachine = value;
      this._publicState.stateMachine = value;
      this._privateState.stateMachine = value;
    }
  }]);
}();
var VMSMInternalState = function (_EventifiedStateEval2) {
  function VMSMInternalState(container, containerState, port) {
    var _this3;
    _this3 = _EventifiedStateEval2.call(this, containerState) || this;
    _this3.kind = NodeKind.animation;
    _this3._container = void 0;
    _this3._progress = 0.0;
    _this3._port = void 0;
    _this3._statusCache = createStateStatusCache();
    _this3._container = container;
    _this3._port = port;
    return _this3;
  }
  _inheritsLoose(VMSMInternalState, _EventifiedStateEval2);
  var _proto5 = VMSMInternalState.prototype;
  _proto5.reenter = function reenter(initialTimeNormalized) {
    var _this$_port;
    this._progress = initialTimeNormalized;
    (_this$_port = this._port) == null ? void 0 : _this$_port.reenter();
  };
  _proto5.getStatus = function getStatus() {
    var stateStatus = this._statusCache;
    {
      stateStatus.__DEBUG_ID__ = this.name;
    }
    stateStatus.progress = normalizeProgress(this._progress);
    return stateStatus;
  };
  _proto5.getClipStatuses = function getClipStatuses(baseWeight) {
    return this._container.getClipStatuses(baseWeight);
  };
  _proto5.update = function update(deltaTime, controller) {
    this._progress = calcProgressUpdate(this._progress, this.duration, deltaTime * this._container.speed);
    this._container.components.callMotionStateUpdateMethods(controller, this.getStatus());
  };
  _proto5.evaluate = function evaluate(context) {
    var _this$_port$evaluate, _this$_port2;
    return (_this$_port$evaluate = (_this$_port2 = this._port) == null ? void 0 : _this$_port2.evaluate(this._progress, context)) !== null && _this$_port$evaluate !== void 0 ? _this$_port$evaluate : null;
  };
  return _createClass(VMSMInternalState, [{
    key: "duration",
    get: function get() {
      return this._container.duration;
    }
  }, {
    key: "components",
    get: function get() {
      return this._container.components;
    }
  }, {
    key: "normalizedTime",
    get: function get() {
      return this._progress;
    }
  }, {
    key: "time",
    get: function get() {
      return this._progress * this._container.duration;
    }
  }]);
}(EventifiedStateEval);
function calcProgressUpdate(currentProgress, duration, deltaTime) {
  if (duration === 0.0) {
    return 0.0;
  }
  var progress = currentProgress + deltaTime / duration;
  return progress;
}
function normalizeProgress(progress) {
  var signedFrac = progress - Math.trunc(progress);
  return signedFrac >= 0.0 ? signedFrac : 1.0 + signedFrac;
}
var SpecialStateEval = function (_StateEval3) {
  function SpecialStateEval(node, kind, name) {
    var _this4;
    _this4 = _StateEval3.call(this, node) || this;
    _this4.kind = void 0;
    _this4.kind = kind;
    return _this4;
  }
  _inheritsLoose(SpecialStateEval, _StateEval3);
  return SpecialStateEval;
}(StateEval);
var EmptyStateEval = function (_StateEval4) {
  function EmptyStateEval(node) {
    var _this5;
    _this5 = _StateEval4.call(this, node) || this;
    _this5.kind = NodeKind.empty;
    return _this5;
  }
  _inheritsLoose(EmptyStateEval, _StateEval4);
  return EmptyStateEval;
}(StateEval);
var ProceduralPoseStateEval = function (_EventifiedStateEval3) {
  function ProceduralPoseStateEval(state, context) {
    var _this6;
    _this6 = _EventifiedStateEval3.call(this, state) || this;
    _this6.kind = NodeKind.procedural;
    _this6.elapsedTime = 0.0;
    _this6.statusCache = createStateStatusCache();
    _this6._instantiatedPoseGraph = void 0;
    _this6._statusCache = createStateStatusCache();
    _this6._elapsedTime = 0.0;
    var instantiatedPoseGraph = instantiatePoseGraph(state.graph, context, true);
    instantiatedPoseGraph.bind(context);
    _this6._instantiatedPoseGraph = instantiatedPoseGraph;
    {
      _this6._statusCache.__DEBUG_ID__ = state.name;
    }
    _this6._statusCache.progress = 0.0;
    return _this6;
  }
  _inheritsLoose(ProceduralPoseStateEval, _EventifiedStateEval3);
  var _proto6 = ProceduralPoseStateEval.prototype;
  _proto6.settle = function settle(context) {
    this._instantiatedPoseGraph.settle(context);
  };
  _proto6.reenter = function reenter() {
    this._statusCache.progress = 0.0;
    this._instantiatedPoseGraph.reenter();
  };
  _proto6.update = function update(context) {
    this._elapsedTime += context.deltaTime;
    this._instantiatedPoseGraph.update(context);
  };
  _proto6.evaluate = function evaluate(context) {
    var _this$_instantiatedPo;
    return (_this$_instantiatedPo = this._instantiatedPoseGraph.evaluate(context)) !== null && _this$_instantiatedPo !== void 0 ? _this$_instantiatedPo : null;
  };
  _proto6.getStatus = function getStatus() {
    this._statusCache.progress = normalizeProgress(this._elapsedTime);
    return this._statusCache;
  };
  _proto6.countMotionTime = function countMotionTime() {
    return this._instantiatedPoseGraph.countMotionTime();
  };
  return ProceduralPoseStateEval;
}(EventifiedStateEval);
var ConditionEvaluationContextImpl = function () {
  function ConditionEvaluationContextImpl() {
    this.sourceStateWeight = 0.0;
    this._sourceState = undefined;
  }
  var _proto7 = ConditionEvaluationContextImpl.prototype;
  _proto7.set = function set(sourceState) {
    this._sourceState = sourceState;
    if (isRealState(sourceState)) {
      assertIsTrue(sourceState.activeReferenceCount);
      this.sourceStateWeight = sourceState.absoluteWeight;
    } else {
      this.sourceStateWeight = 0.0;
    }
  };
  _proto7.unset = function unset() {
    this._sourceState = undefined;
    this.sourceStateWeight = 0.0;
  };
  return _createClass(ConditionEvaluationContextImpl, [{
    key: "sourceStateMotionTimeNormalized",
    get: function get() {
      var sourceState = this._sourceState;
      assertIsTrue(sourceState && (sourceState.kind === NodeKind.animation || sourceState.kind === NodeKind.procedural) && sourceState.activeReferenceCount, "State motion time is only defined on activated motion states and procedural pose states.");
      switch (sourceState.kind) {
        case NodeKind.animation:
          return sourceState.normalizedTime;
        case NodeKind.procedural:
          return sourceState.countMotionTime();
        default:
          return 0.0;
      }
    }
  }]);
}();
var ActivatedTransition = function () {
  function ActivatedTransition() {
    this.normalizedElapsedTime = 0.0;
    this.path = [];
    this._durationMultiplier = 1.0;
  }
  var _proto8 = ActivatedTransition.prototype;
  _proto8.getAbsoluteDuration = function getAbsoluteDuration(baseDurationState) {
    return this._getAbsoluteDurationUnscaled(baseDurationState) * this._durationMultiplier;
  };
  _proto8.update = function update(deltaTime, fromState) {
    if (!isRealState(fromState)) {
      this.normalizedElapsedTime = 1.0;
      return;
    }
    var transitionDurationAbsolute = this.getAbsoluteDuration(fromState);
    var contrib = 0.0;
    if (transitionDurationAbsolute <= 0.0) {
      contrib = 0.0;
      this.normalizedElapsedTime = 1.0;
    } else {
      var elapsedTransitionTime = this.normalizedElapsedTime * transitionDurationAbsolute;
      var remainTransitionTime = transitionDurationAbsolute - elapsedTransitionTime;
      assertIsTrue(remainTransitionTime >= 0.0);
      contrib = Math.min(remainTransitionTime, deltaTime);
      var newTransitionProgress = clamp01((elapsedTransitionTime + contrib) / transitionDurationAbsolute);
      this.normalizedElapsedTime = newTransitionProgress;
      assertIsTrue(newTransitionProgress >= 0.0 && newTransitionProgress <= 1.0);
    }
  };
  ActivatedTransition.createPool = function createPool(initialCapacity) {
    var destructor = function (transitionInstance) {
      transitionInstance.normalizedElapsedTime = Number.NaN;
    };
    var pool = new Pool(function () {
      return new ActivatedTransition();
    }, initialCapacity, destructor);
    return pool;
  };
  _proto8.reset = function reset(prefix, lastTransition) {
    var destinationState = lastTransition.to;
    assertIsTrue(isRealState(destinationState));
    this.normalizedElapsedTime = 0.0;
    this.destination = destinationState;
    this.path = [].concat(prefix, [lastTransition]);
    var previousActiveReferenceCount = destinationState.activeReferenceCount;
    destinationState.increaseActiveReference();
    if (previousActiveReferenceCount === 0) {
      if (destinationState.kind === NodeKind.animation) {
        var _this$path$ = this.path[0],
          destinationStart = _this$path$.destinationStart,
          isRelativeDestinationStart = _this$path$.relativeDestinationStart;
        var destinationStartRatio = isRelativeDestinationStart ? destinationStart : destinationState.duration === 0 ? 0.0 : destinationStart / destinationState.duration;
        destinationState.reenter(destinationStartRatio);
      } else if (destinationState.kind === NodeKind.procedural) {
        destinationState.reenter();
      }
    }
    assertIsTrue(destinationState.activeReferenceCount > 0);
    this._durationMultiplier = 1.0 - destinationState.absoluteWeight;
  };
  _proto8._getAbsoluteDurationUnscaled = function _getAbsoluteDurationUnscaled(baseDurationState) {
    assertIsTrue(this.path.length !== 0);
    var _this$path$2 = this.path[0],
      duration = _this$path$2.duration,
      normalizedDuration = _this$path$2.normalizedDuration;
    if (!normalizedDuration) {
      return duration;
    }
    var baseDuration = baseDurationState.kind === NodeKind.animation ? baseDurationState.duration : 1.0;
    return baseDuration * duration;
  };
  return _createClass(ActivatedTransition, [{
    key: "done",
    get: function get() {
      return approx(this.normalizedElapsedTime, 1.0, 1e-6);
    }
  }]);
}();

var _dec$h, _dec2$h, _dec3$f, _class$i, _class2$g, _initializer$a, _initializer2$7;
(_dec$h = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeStateMachine"), _dec2$h = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE), _dec3$f = poseGraphNodeAppearance({
  themeColor: '#CCCCCC',
  inline: true
}), _dec$h(_class$i = _dec2$h(_class$i = _dec3$f(_class$i = (_class2$g = function (_PoseNode) {
  function PoseNodeStateMachine() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNode.call.apply(_PoseNode, [this].concat(args)) || this;
    _this.name = _initializer$a && _initializer$a();
    _this.stateMachine = _initializer2$7 && _initializer2$7();
    _this._stateMachineEval = void 0;
    return _this;
  }
  _inheritsLoose(PoseNodeStateMachine, _PoseNode);
  var _proto = PoseNodeStateMachine.prototype;
  _proto.__callOnAfterDeserializeRecursive = function __callOnAfterDeserializeRecursive() {
    this.stateMachine._allowEmptyStates = false;
    this.stateMachine.__callOnAfterDeserializeRecursive();
  };
  _proto.bind = function bind(context) {
    assertIsTrue(!this._stateMachineEval);
    this._stateMachineEval = new TopLevelStateMachineEvaluation(this.stateMachine, '', context);
  };
  _proto.settle = function settle(context) {
    var _this$_stateMachineEv;
    (_this$_stateMachineEv = this._stateMachineEval) == null ? void 0 : _this$_stateMachineEv.settle(context);
  };
  _proto.reenter = function reenter() {
    var _this$_stateMachineEv2;
    (_this$_stateMachineEv2 = this._stateMachineEval) == null ? void 0 : _this$_stateMachineEv2.reenter();
  };
  _proto.doUpdate = function doUpdate(context) {
    var stateMachineEval = this._stateMachineEval;
    assertIsTrue(stateMachineEval);
    stateMachineEval.update(context);
    assertIsTrue(stateMachineEval.passthroughWeight > 1.0 - 1e-5);
  };
  _proto.doEvaluate = function doEvaluate(context) {
    var stateMachineEval = this._stateMachineEval;
    assertIsTrue(stateMachineEval);
    var stateMachinePose = stateMachineEval.evaluate(context);
    assertIsTrue(stateMachineEval.passthroughWeight > 1.0 - 1e-5);
    return stateMachinePose;
  };
  return PoseNodeStateMachine;
}(PoseNode), _initializer$a = applyDecoratedInitializer(_class2$g.prototype, "name", [serializable$d], function () {
  return '';
}), _initializer2$7 = applyDecoratedInitializer(_class2$g.prototype, "stateMachine", [serializable$d], function () {
  return new StateMachine(false);
}), _class2$g)) || _class$i) || _class$i) || _class$i);

var _dec$g, _dec2$g, _dec3$e, _dec4$b, _dec5$8, _class$h, _class2$f, _initializer$9, _descriptor$8, _initializer2$6;
var PoseNodeSampleMotion = (_dec$g = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeSampleMotion"), _dec2$g = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE), _dec3$e = poseGraphCreateNodeFactory(makeCreateNodeFactory(function (motion) {
  var node = new PoseNodeSampleMotion();
  node.motion = motion;
  return node;
})), _dec4$b = poseGraphNodeAppearance({
  themeColor: '#D97721'
}), _dec5$8 = input({
  type: PoseGraphType.FLOAT
}), _dec$g(_class$h = _dec2$g(_class$h = _dec3$e(_class$h = _dec4$b(_class$h = (_class2$f = function (_PoseNode) {
  function PoseNodeSampleMotion() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNode.call.apply(_PoseNode, [this].concat(args)) || this;
    _this.motion = _initializer$9 && _initializer$9();
    _initializerDefineProperty(_this, "time", _descriptor$8, _this);
    _this.useNormalizedTime = _initializer2$6 && _initializer2$6();
    _this._workspace = null;
    return _this;
  }
  _inheritsLoose(PoseNodeSampleMotion, _PoseNode);
  var _proto = PoseNodeSampleMotion.prototype;
  _proto.bind = function bind(context) {
    var motion = this.motion;
    if (!motion) {
      return;
    }
    var motionEval = motion[createEval](context, true);
    if (!motionEval) {
      return;
    }
    var workspace = new SampleMotionWorkspace(motionEval, motionEval.createPort());
    this._workspace = workspace;
  };
  _proto.settle = function settle(context) {};
  _proto.reenter = function reenter() {};
  _proto.doUpdate = function doUpdate(context) {};
  _proto.doEvaluate = function doEvaluate(context) {
    var workspace = this._workspace;
    if (!workspace) {
      return context.pushDefaultedPose();
    }
    var time = this.time;
    var normalizedTime = this.useNormalizedTime ? time : time / workspace.motionEval.duration;
    return workspace.motionEvalPort.evaluate(clamp01(normalizedTime), context);
  };
  return PoseNodeSampleMotion;
}(PoseNode), _initializer$9 = applyDecoratedInitializer(_class2$f.prototype, "motion", [serializable$d], function () {
  return new ClipMotion();
}), _descriptor$8 = _applyDecoratedDescriptor(_class2$f.prototype, "time", [serializable$d, _dec5$8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return 0.0;
  }
}), _initializer2$6 = applyDecoratedInitializer(_class2$f.prototype, "useNormalizedTime", [serializable$d], function () {
  return false;
}), _class2$f)) || _class$h) || _class$h) || _class$h) || _class$h);
var SampleMotionWorkspace = function SampleMotionWorkspace(motionEval, motionEvalPort) {
  this.motionEval = motionEval;
  this.motionEvalPort = motionEvalPort;
};

var _dec$f, _dec2$f, _dec3$d, _dec4$a, _dec5$7, _dec6$5, _class$g, _class2$e, _descriptor$7, _descriptor2$3, _descriptor3$1;
(_dec$f = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeAdditivelyBlend"), _dec2$f = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE_BLEND), _dec3$d = poseGraphNodeAppearance({
  themeColor: '#72A869'
}), _dec4$a = input({
  type: PoseGraphType.POSE
}), _dec5$7 = input({
  type: PoseGraphType.POSE
}), _dec6$5 = input({
  type: PoseGraphType.FLOAT
}), _dec$f(_class$g = _dec2$f(_class$g = _dec3$d(_class$g = (_class2$e = function (_PoseNode) {
  function PoseNodeAdditivelyBlend() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNode.call.apply(_PoseNode, [this].concat(args)) || this;
    _initializerDefineProperty(_this, "basePose", _descriptor$7, _this);
    _initializerDefineProperty(_this, "additivePose", _descriptor2$3, _this);
    _initializerDefineProperty(_this, "ratio", _descriptor3$1, _this);
    return _this;
  }
  _inheritsLoose(PoseNodeAdditivelyBlend, _PoseNode);
  var _proto = PoseNodeAdditivelyBlend.prototype;
  _proto.bind = function bind(context) {
    var _this$basePose, _this$additivePose;
    (_this$basePose = this.basePose) == null ? void 0 : _this$basePose.bind(context);
    context._pushAdditiveFlag(true);
    (_this$additivePose = this.additivePose) == null ? void 0 : _this$additivePose.bind(context);
    context._popAdditiveFlag();
  };
  _proto.settle = function settle(context) {
    var _this$basePose2, _this$additivePose2;
    (_this$basePose2 = this.basePose) == null ? void 0 : _this$basePose2.settle(context);
    (_this$additivePose2 = this.additivePose) == null ? void 0 : _this$additivePose2.settle(context);
  };
  _proto.reenter = function reenter() {
    var _this$basePose3, _this$additivePose3;
    (_this$basePose3 = this.basePose) == null ? void 0 : _this$basePose3.reenter();
    (_this$additivePose3 = this.additivePose) == null ? void 0 : _this$additivePose3.reenter();
  };
  _proto.doUpdate = function doUpdate(context) {
    var _this$basePose4, _this$additivePose4;
    (_this$basePose4 = this.basePose) == null ? void 0 : _this$basePose4.update(context);
    (_this$additivePose4 = this.additivePose) == null ? void 0 : _this$additivePose4.update(context);
  };
  _proto.doEvaluate = function doEvaluate(context) {
    var _this$basePose$evalua, _this$basePose5;
    var basePose = (_this$basePose$evalua = (_this$basePose5 = this.basePose) == null ? void 0 : _this$basePose5.evaluate(context, PoseTransformSpaceRequirement.LOCAL)) !== null && _this$basePose$evalua !== void 0 ? _this$basePose$evalua : context.pushDefaultedPose();
    if (!this.additivePose) {
      return basePose;
    }
    var additionalPose = this.additivePose.evaluate(context, PoseTransformSpaceRequirement.LOCAL);
    applyDeltaPose(basePose, additionalPose, this.ratio);
    context.popPose();
    return basePose;
  };
  return PoseNodeAdditivelyBlend;
}(PoseNode), _descriptor$7 = _applyDecoratedDescriptor(_class2$e.prototype, "basePose", [serializable$d, _dec4$a], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return null;
  }
}), _descriptor2$3 = _applyDecoratedDescriptor(_class2$e.prototype, "additivePose", [serializable$d, _dec5$7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return null;
  }
}), _descriptor3$1 = _applyDecoratedDescriptor(_class2$e.prototype, "ratio", [serializable$d, _dec6$5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return 1.0;
  }
}), _class2$e)) || _class$g) || _class$g) || _class$g);

function isIgnorableWeight(weight) {
  return weight < 1e-5;
}

var _dec$e, _dec2$e, _dec3$c, _dec4$9, _dec5$6, _class$f, _class2$d, _descriptor$6, _descriptor2$2;
(_dec$e = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeBlendInProportion"), _dec2$e = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE_BLEND), _dec3$c = poseGraphNodeAppearance({
  themeColor: '#72A869'
}), _dec4$9 = input({
  type: PoseGraphType.POSE,
  arraySyncGroup: 'blend-item'
}), _dec5$6 = input({
  type: PoseGraphType.FLOAT,
  arraySyncGroup: 'blend-item',
  arraySyncGroupFollower: true
}), _dec$e(_class$f = _dec2$e(_class$f = _dec3$c(_class$f = (_class2$d = function (_PoseNode) {
  function PoseNodeBlendInProportion() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNode.call.apply(_PoseNode, [this].concat(args)) || this;
    _initializerDefineProperty(_this, "poses", _descriptor$6, _this);
    _initializerDefineProperty(_this, "proportions", _descriptor2$2, _this);
    _this._updateContextGenerator = new AnimationGraphUpdateContextGenerator();
    return _this;
  }
  _inheritsLoose(PoseNodeBlendInProportion, _PoseNode);
  var _proto = PoseNodeBlendInProportion.prototype;
  _proto.bind = function bind(context) {
    for (var _iterator = _createForOfIteratorHelperLoose(this.poses), _step; !(_step = _iterator()).done;) {
      var pose = _step.value;
      pose == null ? void 0 : pose.bind(context);
    }
  };
  _proto.settle = function settle(context) {
    for (var _iterator2 = _createForOfIteratorHelperLoose(this.poses), _step2; !(_step2 = _iterator2()).done;) {
      var pose = _step2.value;
      pose == null ? void 0 : pose.settle(context);
    }
  };
  _proto.reenter = function reenter() {
    for (var _iterator3 = _createForOfIteratorHelperLoose(this.poses), _step3; !(_step3 = _iterator3()).done;) {
      var pose = _step3.value;
      pose == null ? void 0 : pose.reenter();
    }
  };
  _proto.doUpdate = function doUpdate(context) {
    var updateContextGenerator = this._updateContextGenerator;
    var nInputPoses = this.poses.length;
    for (var iInputPose = 0; iInputPose < nInputPoses; ++iInputPose) {
      var _this$poses$iInputPos;
      var inputPoseWeight = this.proportions[iInputPose];
      if (isIgnorableWeight(inputPoseWeight)) {
        continue;
      }
      var inputPoseUpdateContext = updateContextGenerator.generate(context.deltaTime, context.indicativeWeight * inputPoseWeight);
      (_this$poses$iInputPos = this.poses[iInputPose]) == null ? void 0 : _this$poses$iInputPos.update(inputPoseUpdateContext);
    }
  };
  _proto.doEvaluate = function doEvaluate(context) {
    var nInputPoses = this.poses.length;
    var sumWeight = 0.0;
    var finalPose = null;
    for (var iInputPose = 0; iInputPose < nInputPoses; ++iInputPose) {
      var _this$poses$iInputPos2;
      var inputPoseWeight = this.proportions[iInputPose];
      if (isIgnorableWeight(inputPoseWeight)) {
        continue;
      }
      var inputPose = (_this$poses$iInputPos2 = this.poses[iInputPose]) == null ? void 0 : _this$poses$iInputPos2.evaluate(context, PoseTransformSpaceRequirement.LOCAL);
      if (!inputPose) {
        continue;
      }
      sumWeight += inputPoseWeight;
      if (!finalPose) {
        finalPose = inputPose;
      } else {
        if (sumWeight) {
          var t = inputPoseWeight / sumWeight;
          blendPoseInto(finalPose, inputPose, t);
        }
        context.popPose();
      }
    }
    if (finalPose) {
      return finalPose;
    }
    return context.pushDefaultedPose();
  };
  return PoseNodeBlendInProportion;
}(PoseNode), _descriptor$6 = _applyDecoratedDescriptor(_class2$d.prototype, "poses", [serializable$d, _dec4$9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return [];
  }
}), _descriptor2$2 = _applyDecoratedDescriptor(_class2$d.prototype, "proportions", [serializable$d, _dec5$6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return [];
  }
}), _class2$d)) || _class$f) || _class$f) || _class$f);

var _dec$d, _dec2$d, _dec3$b, _dec4$8, _dec5$5, _class$e, _class2$c, _descriptor$5, _descriptor2$1, _descriptor3;
var PoseNodeBlendTwoPoseBase = (_dec$d = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeBlendTwoPoseBase"), _dec2$d = poseGraphNodeHide(true), _dec3$b = input({
  type: PoseGraphType.POSE
}), _dec4$8 = input({
  type: PoseGraphType.POSE
}), _dec5$5 = input({
  type: PoseGraphType.FLOAT
}), _dec$d(_class$e = _dec2$d(_class$e = (_class2$c = function (_PoseNode) {
  function PoseNodeBlendTwoPoseBase() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNode.call.apply(_PoseNode, [this].concat(args)) || this;
    _initializerDefineProperty(_this, "pose0", _descriptor$5, _this);
    _initializerDefineProperty(_this, "pose1", _descriptor2$1, _this);
    _initializerDefineProperty(_this, "ratio", _descriptor3, _this);
    _this._updateContextGenerator = new AnimationGraphUpdateContextGenerator();
    return _this;
  }
  _inheritsLoose(PoseNodeBlendTwoPoseBase, _PoseNode);
  var _proto = PoseNodeBlendTwoPoseBase.prototype;
  _proto.bind = function bind(context) {
    var _this$pose, _this$pose2;
    (_this$pose = this.pose0) == null ? void 0 : _this$pose.bind(context);
    (_this$pose2 = this.pose1) == null ? void 0 : _this$pose2.bind(context);
  };
  _proto.settle = function settle(context) {
    var _this$pose3, _this$pose4;
    (_this$pose3 = this.pose0) == null ? void 0 : _this$pose3.settle(context);
    (_this$pose4 = this.pose1) == null ? void 0 : _this$pose4.settle(context);
  };
  _proto.reenter = function reenter() {
    var _this$pose5, _this$pose6;
    (_this$pose5 = this.pose0) == null ? void 0 : _this$pose5.reenter();
    (_this$pose6 = this.pose1) == null ? void 0 : _this$pose6.reenter();
  };
  _proto.doUpdate = function doUpdate(context) {
    var pose0 = this.pose0,
      pose1 = this.pose1,
      updateContextGenerator = this._updateContextGenerator,
      ratio = this.ratio;
    {
      var updateContext = updateContextGenerator.generate(context.deltaTime, context.indicativeWeight * (1.0 - ratio));
      pose0 == null ? void 0 : pose0.update(updateContext);
    }
    {
      var _updateContext = updateContextGenerator.generate(context.deltaTime, context.indicativeWeight * ratio);
      pose1 == null ? void 0 : pose1.update(_updateContext);
    }
  };
  _proto.doEvaluate = function doEvaluate(context) {
    var _this$pose0$evaluate, _this$pose7, _this$pose1$evaluate, _this$pose8;
    var spaceRequirement = PoseTransformSpaceRequirement.LOCAL;
    if (!this.pose0 || !this.pose1) {
      return PoseNodeBlendTwoPoseBase.evaluateDefaultPose(context, spaceRequirement);
    }
    var pose0 = (_this$pose0$evaluate = (_this$pose7 = this.pose0) == null ? void 0 : _this$pose7.evaluate(context, spaceRequirement)) !== null && _this$pose0$evaluate !== void 0 ? _this$pose0$evaluate : PoseNodeBlendTwoPoseBase.evaluateDefaultPose(context, spaceRequirement);
    var pose1 = (_this$pose1$evaluate = (_this$pose8 = this.pose1) == null ? void 0 : _this$pose8.evaluate(context, spaceRequirement)) !== null && _this$pose1$evaluate !== void 0 ? _this$pose1$evaluate : PoseNodeBlendTwoPoseBase.evaluateDefaultPose(context, spaceRequirement);
    this.doBlend(pose0, pose1, this.ratio);
    context.popPose();
    return pose0;
  };
  return PoseNodeBlendTwoPoseBase;
}(PoseNode), _descriptor$5 = _applyDecoratedDescriptor(_class2$c.prototype, "pose0", [serializable$d, _dec3$b], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return null;
  }
}), _descriptor2$1 = _applyDecoratedDescriptor(_class2$c.prototype, "pose1", [serializable$d, _dec4$8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return null;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class2$c.prototype, "ratio", [serializable$d, _dec5$5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return 1.0;
  }
}), _class2$c)) || _class$e) || _class$e);

var _dec$c, _dec2$c, _dec3$a, _class$d;
(_dec$c = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeBlendTwoPose"), _dec2$c = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE_BLEND), _dec3$a = poseGraphNodeAppearance({
  themeColor: '#72A869'
}), _dec$c(_class$d = _dec2$c(_class$d = _dec3$a(_class$d = function (_PoseNodeBlendTwoPose) {
  function PoseNodeBlendTwoPose() {
    return _PoseNodeBlendTwoPose.apply(this, arguments) || this;
  }
  _inheritsLoose(PoseNodeBlendTwoPose, _PoseNodeBlendTwoPose);
  var _proto = PoseNodeBlendTwoPose.prototype;
  _proto.doBlend = function doBlend(pose0, pose1, ratio) {
    return blendPoseInto(pose0, pose1, ratio);
  };
  return PoseNodeBlendTwoPose;
}(PoseNodeBlendTwoPoseBase)) || _class$d) || _class$d) || _class$d);

var _dec$b, _dec2$b, _dec3$9, _dec4$7, _class$c, _class2$b, _initializer$8;
(_dec$b = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeFilteringBlend"), _dec2$b = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE_BLEND), _dec3$9 = poseGraphNodeAppearance({
  themeColor: '#72A869'
}), _dec4$7 = type$2(AnimationMask), _dec$b(_class$c = _dec2$b(_class$c = _dec3$9(_class$c = (_class2$b = function (_PoseNodeBlendTwoPose) {
  function PoseNodeFilteringBlend() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNodeBlendTwoPose.call.apply(_PoseNodeBlendTwoPose, [this].concat(args)) || this;
    _this.mask = _initializer$8 && _initializer$8();
    _this._transformFilter = undefined;
    return _this;
  }
  _inheritsLoose(PoseNodeFilteringBlend, _PoseNodeBlendTwoPose);
  var _proto = PoseNodeFilteringBlend.prototype;
  _proto.settle = function settle(context) {
    _PoseNodeBlendTwoPose.prototype.settle.call(this, context);
    if (this.mask) {
      var transformFilter = context.createTransformFilter(this.mask);
      this._transformFilter = transformFilter;
    }
  };
  _proto.doBlend = function doBlend(pose0, pose1, ratio) {
    blendPoseInto(pose0, pose1, ratio, this._transformFilter);
  };
  return PoseNodeFilteringBlend;
}(PoseNodeBlendTwoPoseBase), _initializer$8 = applyDecoratedInitializer(_class2$b.prototype, "mask", [serializable$d, _dec4$7], function () {
  return null;
}), _class2$b)) || _class$c) || _class$c) || _class$c);

var POSE_GRAPH_NODE_MENU_PREFIX_CHOOSE = POSE_GRAPH_NODE_MENU_PREFIX_POSE + "/" + "i18n:ENGINE.animation_graph.pose_graph_node_sub_categories.pose_nodes_choose/";

var _dec$a, _dec2$a, _class$b, _class2$a, _initializer$7, _initializer2$5;
var ZERO_ALTERING_DURATION_THRESHOLD = 1e-5;
var PoseNodeChoosePoseBase = (_dec$a = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeChoosePoseBase"), _dec2$a = poseGraphNodeHide(), _dec$a(_class$b = _dec2$a(_class$b = (_class2$a = function (_PoseNode) {
  function PoseNodeChoosePoseBase(initialChoiceCount) {
    var _this;
    if (initialChoiceCount === void 0) {
      initialChoiceCount = 0;
    }
    _this = _PoseNode.call(this) || this;
    _this._poses = _initializer$7 && _initializer$7();
    _this._fadeInDurations = _initializer2$5 && _initializer2$5();
    _this._updateContextGenerator = new AnimationGraphUpdateContextGenerator();
    _this._evaluationRecord = undefined;
    _this._poses.length = initialChoiceCount;
    _this._poses.fill(null);
    _this._fadeInDurations.length = initialChoiceCount;
    _this._fadeInDurations.fill(0.0);
    return _this;
  }
  _inheritsLoose(PoseNodeChoosePoseBase, _PoseNode);
  var _proto = PoseNodeChoosePoseBase.prototype;
  _proto.bind = function bind(context) {
    for (var _iterator = _createForOfIteratorHelperLoose(this._poses), _step; !(_step = _iterator()).done;) {
      var pose = _step.value;
      pose == null ? void 0 : pose.bind(context);
    }
    var evaluationRecord = new EvaluationRecord(this._poses.length, this.getChosenIndex());
    this._evaluationRecord = evaluationRecord;
  };
  _proto.settle = function settle(context) {
    for (var _iterator2 = _createForOfIteratorHelperLoose(this._poses), _step2; !(_step2 = _iterator2()).done;) {
      var pose = _step2.value;
      pose == null ? void 0 : pose.settle(context);
    }
  };
  _proto.reenter = function reenter() {
    for (var _iterator3 = _createForOfIteratorHelperLoose(this._poses), _step3; !(_step3 = _iterator3()).done;) {
      var pose = _step3.value;
      pose == null ? void 0 : pose.reenter();
    }
  };
  _proto.doUpdate = function doUpdate(context) {
    var poses = this._poses,
      evaluationRecord = this._evaluationRecord;
    assertIsTrue(evaluationRecord);
    evaluationRecord.update(context.deltaTime, this.getChosenIndex(), this._fadeInDurations);
    if (evaluationRecord.allWeightsAreZero()) {
      return;
    }
    var nPoses = poses.length;
    var items = evaluationRecord.items;
    assertIsTrue(items.length === nPoses);
    for (var iPose = 0; iPose < nPoses; ++iPose) {
      var weight = items[iPose].weight;
      if (isIgnorableWeight(weight)) {
        continue;
      }
      var pose = poses[iPose];
      var itemUpdateContext = this._updateContextGenerator.generate(context.deltaTime, context.indicativeWeight * weight);
      pose == null ? void 0 : pose.update(itemUpdateContext);
    }
  };
  _proto.doEvaluate = function doEvaluate(context) {
    var poses = this._poses,
      evaluationRecord = this._evaluationRecord;
    assertIsTrue(evaluationRecord);
    var spaceRequirement = PoseTransformSpaceRequirement.LOCAL;
    var nPoses = poses.length;
    var items = evaluationRecord.items;
    assertIsTrue(items.length === poses.length);
    var finalPose = null;
    if (!evaluationRecord.allWeightsAreZero()) {
      var sumWeight = 0.0;
      for (var iInputPose = 0; iInputPose < nPoses; ++iInputPose) {
        var _poses$iInputPose;
        var inputPoseWeight = evaluationRecord.items[iInputPose].weight;
        if (isIgnorableWeight(inputPoseWeight)) {
          continue;
        }
        var inputPose = (_poses$iInputPose = poses[iInputPose]) == null ? void 0 : _poses$iInputPose.evaluate(context, PoseTransformSpaceRequirement.LOCAL);
        if (!inputPose) {
          continue;
        }
        sumWeight += inputPoseWeight;
        if (!finalPose) {
          finalPose = inputPose;
        } else {
          if (sumWeight) {
            var t = inputPoseWeight / sumWeight;
            blendPoseInto(finalPose, inputPose, t);
          }
          context.popPose();
        }
      }
    }
    if (finalPose) {
      return finalPose;
    }
    return PoseNodeChoosePoseBase.evaluateDefaultPose(context, spaceRequirement);
  };
  _proto.getChosenIndex = function getChosenIndex() {
    return 0;
  };
  return PoseNodeChoosePoseBase;
}(PoseNode), _initializer$7 = applyDecoratedInitializer(_class2$a.prototype, "_poses", [serializable$d], function () {
  return [];
}), _initializer2$5 = applyDecoratedInitializer(_class2$a.prototype, "_fadeInDurations", [serializable$d], function () {
  return [];
}), _class2$a)) || _class$b) || _class$b);
var EvaluationRecord = function () {
  function EvaluationRecord(itemCount, initialChosenIndex) {
    this._items = void 0;
    this._chosenPoseIndex = -1;
    this._elapsedTransitionTime = 0.0;
    this._blendingDuration = 0.0;
    var items = Array.from({
      length: itemCount
    }, function () {
      return new ItemEvaluationRecord();
    });
    if (initialChosenIndex >= 0 && initialChosenIndex < itemCount) {
      items[initialChosenIndex].selfSourceWeight = 1.0;
      items[initialChosenIndex].selfTargetWeight = 1.0;
      items[initialChosenIndex].weight = 1.0;
    }
    this._items = items;
  }
  var _proto2 = EvaluationRecord.prototype;
  _proto2.allWeightsAreZero = function allWeightsAreZero() {
    return this._chosenPoseIndex < 0;
  };
  _proto2.update = function update(deltaTime, newChoseIndex, fadeInDurations) {
    assertIsTrue(deltaTime >= 0.0);
    this._checkAlternation(newChoseIndex, fadeInDurations);
    if (this._chosenPoseIndex < 0) {
      return;
    }
    var elapsedTransitionTime = this._elapsedTransitionTime,
      blendingDuration = this._blendingDuration,
      items = this._items;
    if (elapsedTransitionTime >= blendingDuration) {
      return;
    }
    var nPoses = items.length;
    var sumWeight = 0.0;
    var newUniformTransformRatio = 0.0;
    var remain = blendingDuration - elapsedTransitionTime;
    if (deltaTime > remain) {
      this._elapsedTransitionTime = blendingDuration;
      newUniformTransformRatio = 1.0;
    } else {
      this._elapsedTransitionTime += deltaTime;
      newUniformTransformRatio = this._elapsedTransitionTime / blendingDuration;
    }
    assertIsTrue(newUniformTransformRatio >= 0.0 && newUniformTransformRatio <= 1.0);
    for (var iPose = 0; iPose < nPoses; ++iPose) {
      var item = items[iPose];
      var selfWeight = lerp(item.selfSourceWeight, item.selfTargetWeight, newUniformTransformRatio);
      sumWeight += selfWeight;
      item.weight = selfWeight;
    }
    if (!isIgnorableWeight(sumWeight)) {
      for (var _iPose = 0; _iPose < nPoses; ++_iPose) {
        var _item = items[_iPose];
        _item.weight /= sumWeight;
      }
    } else {
      assertIsTrue(items.every(function (item) {
        return item.weight === 0.0;
      }));
    }
  };
  _proto2._checkAlternation = function _checkAlternation(newChoseIndex, fadeInDurations) {
    var items = this._items,
      oldChoseIndex = this._chosenPoseIndex;
    var nPoses = items.length;
    if (!nPoses) {
      return;
    }
    if (newChoseIndex === oldChoseIndex) {
      return;
    }
    if (newChoseIndex < 0 || newChoseIndex >= nPoses) {
      return;
    }
    var newFadeInDuration = Math.max(fadeInDurations[newChoseIndex], 0.0);
    if (newFadeInDuration < ZERO_ALTERING_DURATION_THRESHOLD) {
      for (var iPose = 0; iPose < nPoses; ++iPose) {
        var item = items[iPose];
        if (iPose === newChoseIndex) {
          item.selfSourceWeight = 1.0;
          item.selfTargetWeight = 1.0;
          item.weight = 1.0;
        } else {
          item.selfSourceWeight = 0.0;
          item.selfTargetWeight = 0.0;
          item.weight = 0.0;
        }
      }
    } else {
      var oldUniformTransitionRatio = this._blendingDuration < ZERO_ALTERING_DURATION_THRESHOLD ? 1.0 : this._elapsedTransitionTime / this._blendingDuration;
      for (var _iPose2 = 0; _iPose2 < nPoses; ++_iPose2) {
        var _item2 = items[_iPose2];
        _item2.selfSourceWeight = lerp(_item2.selfSourceWeight, _item2.selfTargetWeight, oldUniformTransitionRatio);
        if (_iPose2 === newChoseIndex) {
          _item2.selfTargetWeight = 1.0;
        } else {
          _item2.selfTargetWeight = 0.0;
        }
      }
    }
    this._chosenPoseIndex = newChoseIndex;
    this._elapsedTransitionTime = 0.0;
    this._blendingDuration = newFadeInDuration;
  };
  return _createClass(EvaluationRecord, [{
    key: "items",
    get: function get() {
      return this._items;
    }
  }]);
}();
var ItemEvaluationRecord = function ItemEvaluationRecord() {
  this.selfSourceWeight = 0.0;
  this.selfTargetWeight = 0.0;
  this.weight = 0.0;
};

var _dec$9, _dec2$9, _dec3$8, _dec4$6, _dec5$4, _dec6$4, _dec7$3, _dec8$2, _class$a, _class2$9, _descriptor$4;
(_dec$9 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeChoosePoseByBoolean"), _dec2$9 = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_CHOOSE), _dec3$8 = poseGraphNodeAppearance({
  themeColor: '#D07979'
}), _dec4$6 = input({
  type: PoseGraphType.POSE
}), _dec5$4 = input({
  type: PoseGraphType.POSE
}), _dec6$4 = input({
  type: PoseGraphType.FLOAT
}), _dec7$3 = input({
  type: PoseGraphType.FLOAT
}), _dec8$2 = input({
  type: PoseGraphType.BOOLEAN
}), _dec$9(_class$a = _dec2$9(_class$a = _dec3$8(_class$a = (_class2$9 = function (_PoseNodeChoosePoseBa) {
  function PoseNodeChoosePoseByBoolean() {
    var _this;
    _this = _PoseNodeChoosePoseBa.call(this, 2) || this;
    _initializerDefineProperty(_this, "choice", _descriptor$4, _this);
    return _this;
  }
  _inheritsLoose(PoseNodeChoosePoseByBoolean, _PoseNodeChoosePoseBa);
  var _proto = PoseNodeChoosePoseByBoolean.prototype;
  _proto.getChosenIndex = function getChosenIndex() {
    return this.choice ? 0 : 1;
  };
  return _createClass(PoseNodeChoosePoseByBoolean, [{
    key: "truePose",
    get: function get() {
      return this._poses[0];
    },
    set: function set(value) {
      this._poses[0] = value;
    }
  }, {
    key: "falsePose",
    get: function get() {
      return this._poses[1];
    },
    set: function set(value) {
      this._poses[1] = value;
    }
  }, {
    key: "trueFadeInDuration",
    get: function get() {
      return this._fadeInDurations[0];
    },
    set: function set(value) {
      this._fadeInDurations[0] = value;
    }
  }, {
    key: "falseFadeInDuration",
    get: function get() {
      return this._fadeInDurations[1];
    },
    set: function set(value) {
      this._fadeInDurations[1] = value;
    }
  }]);
}(PoseNodeChoosePoseBase), _applyDecoratedDescriptor(_class2$9.prototype, "truePose", [_dec4$6], Object.getOwnPropertyDescriptor(_class2$9.prototype, "truePose"), _class2$9.prototype), _applyDecoratedDescriptor(_class2$9.prototype, "falsePose", [_dec5$4], Object.getOwnPropertyDescriptor(_class2$9.prototype, "falsePose"), _class2$9.prototype), _applyDecoratedDescriptor(_class2$9.prototype, "trueFadeInDuration", [_dec6$4], Object.getOwnPropertyDescriptor(_class2$9.prototype, "trueFadeInDuration"), _class2$9.prototype), _applyDecoratedDescriptor(_class2$9.prototype, "falseFadeInDuration", [_dec7$3], Object.getOwnPropertyDescriptor(_class2$9.prototype, "falseFadeInDuration"), _class2$9.prototype), _descriptor$4 = _applyDecoratedDescriptor(_class2$9.prototype, "choice", [serializable$d, _dec8$2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return true;
  }
}), _class2$9)) || _class$a) || _class$a) || _class$a);

var _dec$8, _dec2$8, _dec3$7, _dec4$5, _dec5$3, _dec6$3, _class$9, _class2$8, _descriptor$3;
(_dec$8 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeChoosePoseByIndex"), _dec2$8 = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_CHOOSE), _dec3$7 = poseGraphNodeAppearance({
  themeColor: '#D07979'
}), _dec4$5 = input({
  type: PoseGraphType.POSE,
  arraySyncGroup: 'choose-item'
}), _dec5$3 = input({
  type: PoseGraphType.FLOAT,
  arraySyncGroup: 'choose-item',
  arraySyncGroupFollower: true
}), _dec6$3 = input({
  type: PoseGraphType.INTEGER
}), _dec$8(_class$9 = _dec2$8(_class$9 = _dec3$7(_class$9 = (_class2$8 = function (_PoseNodeChoosePoseBa) {
  function PoseNodeChoosePoseByIndex() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNodeChoosePoseBa.call.apply(_PoseNodeChoosePoseBa, [this].concat(args)) || this;
    _initializerDefineProperty(_this, "choice", _descriptor$3, _this);
    return _this;
  }
  _inheritsLoose(PoseNodeChoosePoseByIndex, _PoseNodeChoosePoseBa);
  var _proto = PoseNodeChoosePoseByIndex.prototype;
  _proto.getChosenIndex = function getChosenIndex() {
    return this.choice;
  };
  return _createClass(PoseNodeChoosePoseByIndex, [{
    key: "poses",
    get: function get() {
      return this._poses;
    },
    set: function set(value) {
      this._poses = value;
    }
  }, {
    key: "fadeInDurations",
    get: function get() {
      return this._fadeInDurations;
    },
    set: function set(value) {
      this._fadeInDurations = value;
    }
  }]);
}(PoseNodeChoosePoseBase), _applyDecoratedDescriptor(_class2$8.prototype, "poses", [_dec4$5], Object.getOwnPropertyDescriptor(_class2$8.prototype, "poses"), _class2$8.prototype), _applyDecoratedDescriptor(_class2$8.prototype, "fadeInDurations", [_dec5$3], Object.getOwnPropertyDescriptor(_class2$8.prototype, "fadeInDurations"), _class2$8.prototype), _descriptor$3 = _applyDecoratedDescriptor(_class2$8.prototype, "choice", [serializable$d, _dec6$3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return 0;
  }
}), _class2$8)) || _class$9) || _class$9) || _class$9);

var _dec$7, _dec2$7, _class$8, _class2$7, _initializer$6, _initializer2$4, _initializer3$3;
var IntensityType;
(function (IntensityType) {
  IntensityType[IntensityType["VALUE"] = 0] = "VALUE";
  IntensityType[IntensityType["AUXILIARY_CURVE"] = 1] = "AUXILIARY_CURVE";
})(IntensityType || (IntensityType = {}));
ccenum(IntensityType);
var IntensitySpecification = (_dec$7 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "IntensitySpecification"), _dec2$7 = type$2(IntensityType), _dec$7(_class$8 = (_class2$7 = function () {
  function IntensitySpecification() {
    this.type = _initializer$6 && _initializer$6();
    this.value = _initializer2$4 && _initializer2$4();
    this.auxiliaryCurveName = _initializer3$3 && _initializer3$3();
    this._handle = undefined;
  }
  var _proto = IntensitySpecification.prototype;
  _proto.bind = function bind(context) {
    if (this.type === IntensityType.AUXILIARY_CURVE && this.auxiliaryCurveName) {
      var handle = context.bindAuxiliaryCurve(this.auxiliaryCurveName);
      this._handle = handle;
    }
  };
  _proto.evaluate = function evaluate(pose) {
    if (this.type === IntensityType.AUXILIARY_CURVE && this._handle) {
      var value = pose.auxiliaryCurves[this._handle.index];
      return value;
    }
    return this.value;
  };
  return IntensitySpecification;
}(), _initializer$6 = applyDecoratedInitializer(_class2$7.prototype, "type", [_dec2$7, serializable$d], function () {
  return IntensityType.VALUE;
}), _initializer2$4 = applyDecoratedInitializer(_class2$7.prototype, "value", [serializable$d], function () {
  return 1.0;
}), _initializer3$3 = applyDecoratedInitializer(_class2$7.prototype, "auxiliaryCurveName", [serializable$d], function () {
  return '';
}), _class2$7)) || _class$8);

var _dec$6, _dec2$6, _dec3$6, _class$7, _class2$6, _descriptor$2;
var TransformModification = function TransformModification() {
  this.transformIndex = -1;
  this.transform = new Transform();
};
var TransformModificationQueue = function () {
  function TransformModificationQueue() {
    this._pool = new Pool(function () {
      return new TransformModification();
    }, 3);
    this._array = new CachedArray(3);
    this._debugLastTransformIndex = -1;
  }
  var _proto = TransformModificationQueue.prototype;
  _proto.push = function push(transformIndex, transform) {
    {
      assertIsTrue(transformIndex > this._debugLastTransformIndex, "Unexpected transform modification order");
      this._debugLastTransformIndex = transformIndex;
    }
    var mod = this._pool.alloc();
    mod.transformIndex = transformIndex;
    Transform.copy(mod.transform, transform);
    this._array.push(mod);
  };
  _proto.clear = function clear() {
    var length = this._array.length;
    for (var iMod = 0; iMod < length; ++iMod) {
      var mod = this._array.get(iMod);
      assertIsTrue(mod);
      this._pool.free(mod);
    }
    this._array.clear();
    {
      this._debugLastTransformIndex = -1;
    }
  };
  return _createClass(TransformModificationQueue, [{
    key: "length",
    get: function get() {
      return this._array.length;
    }
  }, {
    key: "array",
    get: function get() {
      return this._array.array;
    }
  }]);
}();
var PoseTransformSpaceFlagTable = function () {
  function PoseTransformSpaceFlagTable(nTransforms) {
    this._transformFlags = [];
    this._transformFlags = new Array(nTransforms);
  }
  var _proto2 = PoseTransformSpaceFlagTable.prototype;
  _proto2.clear = function clear() {
    this._transformFlags.fill(false);
  };
  _proto2.test = function test(transformIndex) {
    return this._transformFlags[transformIndex];
  };
  _proto2.set = function set(transformIndex) {
    this._transformFlags[transformIndex] = true;
  };
  _proto2.unset = function unset(transformIndex) {
    this._transformFlags[transformIndex] = false;
  };
  return PoseTransformSpaceFlagTable;
}();
var cacheTransform_spaceConversion = new Transform();
var cacheParentTransform_spaceConversion = new Transform();
function applyTransformModificationQueue(context, pose, queue, spaceFlagTable) {
  var nMods = queue.length;
  if (nMods === 0) {
    return;
  }
  {
    var debugLastModTransformIndex = -1;
    for (var iMod = 0; iMod < nMods; ++iMod) {
      var transformIndex = queue.array[iMod].transformIndex;
      assertIsTrue(transformIndex > debugLastModTransformIndex);
      debugLastModTransformIndex = transformIndex;
    }
  }
  if (pose._poseTransformSpace === PoseTransformSpace.LOCAL) {
    for (var _iMod = 0; _iMod < nMods; ++_iMod) {
      var _queue$array$_iMod = queue.array[_iMod],
        _transformIndex = _queue$array$_iMod.transformIndex,
        transform = _queue$array$_iMod.transform;
      pose.transforms.setTransform(_transformIndex, transform);
    }
    return;
  }
  assertIsTrue(pose._poseTransformSpace === PoseTransformSpace.COMPONENT);
  spaceFlagTable.clear();
  var firstTransformToConvert = queue.array[0].transformIndex;
  var lastTransformToConvert = firstTransformToConvert;
  for (var _iMod2 = 0; _iMod2 < nMods; ++_iMod2) {
    var _transformIndex2 = queue.array[_iMod2].transformIndex;
    spaceFlagTable.set(_transformIndex2);
    lastTransformToConvert = _transformIndex2;
  }
  for (var _transformIndex3 = firstTransformToConvert; _transformIndex3 < pose.transforms.length; ++_transformIndex3) {
    var parentTransformIndex = context.parentTable[_transformIndex3];
    if (parentTransformIndex < 0) {
      continue;
    }
    if (spaceFlagTable.test(parentTransformIndex)) {
      spaceFlagTable.set(_transformIndex3);
      lastTransformToConvert = _transformIndex3;
    }
  }
  for (var _transformIndex4 = lastTransformToConvert; _transformIndex4 >= firstTransformToConvert; --_transformIndex4) {
    if (spaceFlagTable.test(_transformIndex4)) {
      var _parentTransformIndex = context.parentTable[_transformIndex4];
      if (_parentTransformIndex >= 0) {
        var _transform = pose.transforms.getTransform(_transformIndex4, cacheTransform_spaceConversion);
        var parentTransform = pose.transforms.getTransform(_parentTransformIndex, cacheParentTransform_spaceConversion);
        Transform.calculateRelative(_transform, _transform, parentTransform);
        pose.transforms.setTransform(_transformIndex4, _transform);
      }
    }
  }
  for (var _iMod3 = 0; _iMod3 < nMods; ++_iMod3) {
    var _queue$array$_iMod2 = queue.array[_iMod3],
      _transformIndex5 = _queue$array$_iMod2.transformIndex,
      _transform2 = _queue$array$_iMod2.transform;
    pose.transforms.setTransform(_transformIndex5, _transform2);
    spaceFlagTable.unset(_transformIndex5);
  }
  for (var _transformIndex6 = firstTransformToConvert; _transformIndex6 <= lastTransformToConvert; ++_transformIndex6) {
    if (spaceFlagTable.test(_transformIndex6)) {
      var _parentTransformIndex2 = context.parentTable[_transformIndex6];
      assertIsTrue(_parentTransformIndex2 >= 0);
      var _transform3 = pose.transforms.getTransform(_transformIndex6, cacheTransform_spaceConversion);
      var _parentTransform = pose.transforms.getTransform(_parentTransformIndex2, cacheParentTransform_spaceConversion);
      Transform.multiply(_transform3, _parentTransform, _transform3);
      pose.transforms.setTransform(_transformIndex6, _transform3);
    }
  }
}
var PoseNodeModifyPoseBase = (_dec$6 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeModifyPoseBase"), _dec2$6 = poseGraphNodeHide(), _dec3$6 = input({
  type: PoseGraphType.POSE
}), _dec$6(_class$7 = _dec2$6(_class$7 = (_class2$6 = function (_PoseNode) {
  function PoseNodeModifyPoseBase() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNode.call.apply(_PoseNode, [this].concat(args)) || this;
    _initializerDefineProperty(_this, "pose", _descriptor$2, _this);
    _this._modificationQueue = new TransformModificationQueue();
    _this._spaceFlagTable = new PoseTransformSpaceFlagTable(0);
    return _this;
  }
  _inheritsLoose(PoseNodeModifyPoseBase, _PoseNode);
  var _proto3 = PoseNodeModifyPoseBase.prototype;
  _proto3.settle = function settle(context) {
    var _this$pose;
    (_this$pose = this.pose) == null ? void 0 : _this$pose.settle(context);
    this._spaceFlagTable = new PoseTransformSpaceFlagTable(context.transformCount);
  };
  _proto3.reenter = function reenter() {
    var _this$pose2;
    (_this$pose2 = this.pose) == null ? void 0 : _this$pose2.reenter();
  };
  _proto3.bind = function bind(context) {
    var _this$pose3;
    (_this$pose3 = this.pose) == null ? void 0 : _this$pose3.bind(context);
  };
  _proto3.doUpdate = function doUpdate(context) {
    var _this$pose4;
    (_this$pose4 = this.pose) == null ? void 0 : _this$pose4.update(context);
  };
  _proto3.doEvaluate = function doEvaluate(context) {
    var _this$pose$evaluate, _this$pose5;
    var poseTransformSpaceRequirement = this.getPoseTransformSpaceRequirement();
    var inputPose = (_this$pose$evaluate = (_this$pose5 = this.pose) == null ? void 0 : _this$pose5.evaluate(context, poseTransformSpaceRequirement)) !== null && _this$pose$evaluate !== void 0 ? _this$pose$evaluate : PoseNode.evaluateDefaultPose(context, poseTransformSpaceRequirement);
    var modificationQueue = this._modificationQueue;
    assertIsTrue(modificationQueue.length === 0);
    this.modifyPose(context, inputPose, modificationQueue);
    applyTransformModificationQueue(context, inputPose, modificationQueue, this._spaceFlagTable);
    modificationQueue.clear();
    return inputPose;
  };
  return PoseNodeModifyPoseBase;
}(PoseNode), _descriptor$2 = _applyDecoratedDescriptor(_class2$6.prototype, "pose", [serializable$d, _dec3$6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return null;
  }
}), _class2$6)) || _class$7) || _class$7);

var _dec$5, _dec2$5, _dec3$5, _dec4$4, _dec5$2, _dec6$2, _dec7$2, _dec8$1, _dec9$1, _class$6, _class2$5, _initializer$5, _initializer2$3, _descriptor$1, _initializer3$2, _descriptor2, _initializer4$1, _initializer5$1;
var TransformOperation;
(function (TransformOperation) {
  TransformOperation[TransformOperation["LEAVE_UNCHANGED"] = 0] = "LEAVE_UNCHANGED";
  TransformOperation[TransformOperation["REPLACE"] = 1] = "REPLACE";
  TransformOperation[TransformOperation["ADD"] = 2] = "ADD";
})(TransformOperation || (TransformOperation = {}));
ccenum(TransformOperation);
var APPLY_INTENSITY_EPSILON = 1e-5;
var cacheTransform$1 = new Transform();
(_dec$5 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeApplyTransform"), _dec2$5 = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE), _dec3$5 = poseGraphNodeAppearance({
  themeColor: '#72A869'
}), _dec4$4 = type$2(TransformOperation), _dec5$2 = input({
  type: PoseGraphType.VEC3
}), _dec6$2 = type$2(TransformOperation), _dec7$2 = input({
  type: PoseGraphType.QUAT
}), _dec8$1 = type$2(TransformSpace), _dec9$1 = input({
  type: PoseGraphType.FLOAT
}), _dec$5(_class$6 = _dec2$5(_class$6 = _dec3$5(_class$6 = (_class2$5 = function (_PoseNodeModifyPoseBa) {
  function PoseNodeApplyTransform() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNodeModifyPoseBa.call.apply(_PoseNodeModifyPoseBa, [this].concat(args)) || this;
    _this.node = _initializer$5 && _initializer$5();
    _this.positionOperation = _initializer2$3 && _initializer2$3();
    _initializerDefineProperty(_this, "position", _descriptor$1, _this);
    _this.rotationOperation = _initializer3$2 && _initializer3$2();
    _initializerDefineProperty(_this, "rotation", _descriptor2, _this);
    _this.intensity = _initializer4$1 && _initializer4$1();
    _this.transformSpace = _initializer5$1 && _initializer5$1();
    _this._transformHandle = null;
    return _this;
  }
  _inheritsLoose(PoseNodeApplyTransform, _PoseNodeModifyPoseBa);
  var _proto = PoseNodeApplyTransform.prototype;
  _proto.bind = function bind(context) {
    var nodeName = this.node;
    _PoseNodeModifyPoseBa.prototype.bind.call(this, context);
    if (!nodeName) {
      return;
    }
    var transformHandle = context.bindTransformByName(nodeName);
    if (!transformHandle) {
      error("Failed to bind transform " + nodeName);
      return;
    }
    this._transformHandle = transformHandle;
    this.intensity.bind(context);
  };
  _proto.getPoseTransformSpaceRequirement = function getPoseTransformSpaceRequirement() {
    return PoseTransformSpaceRequirement.NO;
  };
  _proto.modifyPose = function modifyPose(context, inputPose, modificationQueue) {
    var transformHandle = this._transformHandle;
    if (!transformHandle) {
      return inputPose;
    }
    var intensity = this.intensity.evaluate(inputPose);
    if (intensity < APPLY_INTENSITY_EPSILON) {
      return inputPose;
    }
    var fullIntensity = approx(intensity, 1.0, APPLY_INTENSITY_EPSILON);
    var transformIndex = transformHandle.index;
    var nodeTransform = inputPose.transforms.getTransform(transformIndex, cacheTransform$1);
    var rotationOperation = this.rotationOperation;
    if (rotationOperation !== TransformOperation.LEAVE_UNCHANGED) {
      var rotation = this.rotation,
        rotationSpace = this.transformSpace;
      context._convertPoseSpaceTransformToTargetSpace(nodeTransform, rotationSpace, inputPose, transformIndex);
      switch (rotationOperation) {
        default:
        case TransformOperation.REPLACE:
          replaceRotation(nodeTransform, rotation, intensity, fullIntensity);
          break;
        case TransformOperation.ADD:
          addRotation(nodeTransform, rotation, intensity, fullIntensity);
          break;
      }
      context._convertTransformToPoseTransformSpace(nodeTransform, rotationSpace, inputPose, transformIndex);
    }
    var positionOperation = this.positionOperation;
    if (positionOperation !== TransformOperation.LEAVE_UNCHANGED) {
      var position = this.position,
        positionSpace = this.transformSpace;
      context._convertPoseSpaceTransformToTargetSpace(nodeTransform, positionSpace, inputPose, transformIndex);
      switch (positionOperation) {
        default:
        case TransformOperation.REPLACE:
          replacePosition(nodeTransform, position, intensity, fullIntensity);
          break;
        case TransformOperation.ADD:
          addPosition(nodeTransform, position, intensity, fullIntensity);
          break;
      }
      context._convertTransformToPoseTransformSpace(nodeTransform, positionSpace, inputPose, transformIndex);
    }
    modificationQueue.push(transformIndex, nodeTransform);
    return inputPose;
  };
  return _createClass(PoseNodeApplyTransform, [{
    key: "intensityValue",
    get: function get() {
      return this.intensity.value;
    },
    set: function set(value) {
      this.intensity.value = value;
    }
  }]);
}(PoseNodeModifyPoseBase), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "node", [serializable$d], function () {
  return '';
}), _initializer2$3 = applyDecoratedInitializer(_class2$5.prototype, "positionOperation", [serializable$d, _dec4$4], function () {
  return TransformOperation.LEAVE_UNCHANGED;
}), _descriptor$1 = _applyDecoratedDescriptor(_class2$5.prototype, "position", [serializable$d, _dec5$2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return new Vec3();
  }
}), _initializer3$2 = applyDecoratedInitializer(_class2$5.prototype, "rotationOperation", [serializable$d, _dec6$2], function () {
  return TransformOperation.LEAVE_UNCHANGED;
}), _descriptor2 = _applyDecoratedDescriptor(_class2$5.prototype, "rotation", [serializable$d, _dec7$2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return new Quat();
  }
}), _initializer4$1 = applyDecoratedInitializer(_class2$5.prototype, "intensity", [serializable$d], function () {
  return new IntensitySpecification();
}), _initializer5$1 = applyDecoratedInitializer(_class2$5.prototype, "transformSpace", [serializable$d, _dec8$1], function () {
  return TransformSpace.WORLD;
}), _applyDecoratedDescriptor(_class2$5.prototype, "intensityValue", [_dec9$1], Object.getOwnPropertyDescriptor(_class2$5.prototype, "intensityValue"), _class2$5.prototype), _class2$5)) || _class$6) || _class$6) || _class$6);
var _ref = function () {
    var cacheInput = new Vec3();
    var cacheResult = new Vec3();
    return {
      replace: replace,
      add: add
    };
    function replace(transform, value, intensity, fullIntensity) {
      if (fullIntensity) {
        transform.position = value;
      } else {
        var inputPosition = Vec3.copy(cacheInput, transform.position);
        Vec3.lerp(inputPosition, inputPosition, value, intensity);
        transform.position = inputPosition;
      }
    }
    function add(transform, value, intensity, fullIntensity) {
      var result = cacheResult;
      if (fullIntensity) {
        Vec3.copy(result, value);
      } else {
        Vec3.slerp(result, Vec3.ZERO, value, intensity);
      }
      Vec3.add(result, transform.position, result);
      transform.position = result;
    }
  }(),
  replacePosition = _ref.replace,
  addPosition = _ref.add;
var _ref2 = function () {
    var cacheInput = new Quat();
    var cacheResult = new Quat();
    return {
      replace: replace,
      add: add
    };
    function replace(transform, value, intensity, fullIntensity) {
      if (fullIntensity) {
        transform.rotation = value;
      } else {
        var inputRotation = Quat.copy(cacheInput, transform.rotation);
        Quat.slerp(inputRotation, inputRotation, value, intensity);
        transform.rotation = inputRotation;
      }
    }
    function add(transform, value, intensity, fullIntensity) {
      var inputRotation = Quat.copy(cacheInput, transform.rotation);
      var resultRotation = cacheResult;
      if (fullIntensity) {
        Quat.copy(resultRotation, value);
      } else {
        Quat.slerp(resultRotation, Quat.IDENTITY, value, intensity);
      }
      Quat.multiply(resultRotation, resultRotation, inputRotation);
      transform.rotation = resultRotation;
    }
  }(),
  replaceRotation = _ref2.replace,
  addRotation = _ref2.add;

var _dec$4, _dec2$4, _dec3$4, _dec4$3, _class$5, _class2$4, _initializer$4, _initializer2$2, _initializer3$1;
var cacheTransform = new Transform();
var CopySpace;
(function (CopySpace) {
  CopySpace[CopySpace["LOCAL"] = 0] = "LOCAL";
  CopySpace[CopySpace["COMPONENT"] = 1] = "COMPONENT";
})(CopySpace || (CopySpace = {}));
ccenum(CopySpace);
(_dec$4 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeCopyTransform"), _dec2$4 = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE), _dec3$4 = poseGraphNodeAppearance({
  themeColor: '#72A869'
}), _dec4$3 = type$2(CopySpace), _dec$4(_class$5 = _dec2$4(_class$5 = _dec3$4(_class$5 = (_class2$4 = function (_PoseNodeModifyPoseBa) {
  function PoseNodeCopyTransform() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNodeModifyPoseBa.call.apply(_PoseNodeModifyPoseBa, [this].concat(args)) || this;
    _this.sourceNodeName = _initializer$4 && _initializer$4();
    _this.targetNodeName = _initializer2$2 && _initializer2$2();
    _this.space = _initializer3$1 && _initializer3$1();
    _this._workspace = undefined;
    return _this;
  }
  _inheritsLoose(PoseNodeCopyTransform, _PoseNodeModifyPoseBa);
  var _proto = PoseNodeCopyTransform.prototype;
  _proto.bind = function bind(context) {
    _PoseNodeModifyPoseBa.prototype.bind.call(this, context);
    var sourceTransformHandle = context.bindTransformByName(this.sourceNodeName);
    var targetTransformHandle = context.bindTransformByName(this.targetNodeName);
    if (!sourceTransformHandle || !targetTransformHandle) {
      sourceTransformHandle == null ? void 0 : sourceTransformHandle.destroy();
      targetTransformHandle == null ? void 0 : targetTransformHandle.destroy();
      return;
    }
    this._workspace = new Workspace$1(sourceTransformHandle, targetTransformHandle);
  };
  _proto.modifyPose = function modifyPose(context, inputPose) {
    var workspace = this._workspace;
    if (!workspace) {
      return;
    }
    var sourceTransformIndex = workspace.hSource.index,
      targetTransformIndex = workspace.hTarget.index;
    var transform = inputPose.transforms.getTransform(sourceTransformIndex, cacheTransform);
    inputPose.transforms.setTransform(targetTransformIndex, transform);
  };
  _proto.getPoseTransformSpaceRequirement = function getPoseTransformSpaceRequirement() {
    return this.space === CopySpace.COMPONENT ? PoseTransformSpaceRequirement.COMPONENT : PoseTransformSpaceRequirement.LOCAL;
  };
  return PoseNodeCopyTransform;
}(PoseNodeModifyPoseBase), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "sourceNodeName", [serializable$d], function () {
  return '';
}), _initializer2$2 = applyDecoratedInitializer(_class2$4.prototype, "targetNodeName", [serializable$d], function () {
  return '';
}), _initializer3$1 = applyDecoratedInitializer(_class2$4.prototype, "space", [serializable$d, _dec4$3], function () {
  return CopySpace.COMPONENT;
}), _class2$4)) || _class$5) || _class$5) || _class$5);
var Workspace$1 = function Workspace(hSource, hTarget) {
  this.hSource = hSource;
  this.hTarget = hTarget;
};

var _dec$3, _dec2$3, _dec3$3, _dec4$2, _class$4, _class2$3, _initializer$3, _descriptor, _initializer2$1;
var SetAuxiliaryCurveFlag;
(function (SetAuxiliaryCurveFlag) {
  SetAuxiliaryCurveFlag[SetAuxiliaryCurveFlag["LEAVE_UNCHANGED"] = 0] = "LEAVE_UNCHANGED";
  SetAuxiliaryCurveFlag[SetAuxiliaryCurveFlag["REPLACE"] = 1] = "REPLACE";
  SetAuxiliaryCurveFlag[SetAuxiliaryCurveFlag["ADD"] = 2] = "ADD";
})(SetAuxiliaryCurveFlag || (SetAuxiliaryCurveFlag = {}));
ccenum(SetAuxiliaryCurveFlag);
(_dec$3 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeSetAuxiliaryCurve"), _dec2$3 = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_POSE), _dec3$3 = input({
  type: PoseGraphType.FLOAT
}), _dec4$2 = type$2(SetAuxiliaryCurveFlag), _dec$3(_class$4 = _dec2$3(_class$4 = (_class2$3 = function (_PoseNodeModifyPoseBa) {
  function PoseNodeSetAuxiliaryCurve() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNodeModifyPoseBa.call.apply(_PoseNodeModifyPoseBa, [this].concat(args)) || this;
    _this.curveName = _initializer$3 && _initializer$3();
    _initializerDefineProperty(_this, "curveValue", _descriptor, _this);
    _this.flag = _initializer2$1 && _initializer2$1();
    _this._handle = undefined;
    return _this;
  }
  _inheritsLoose(PoseNodeSetAuxiliaryCurve, _PoseNodeModifyPoseBa);
  var _proto = PoseNodeSetAuxiliaryCurve.prototype;
  _proto.bind = function bind(context) {
    _PoseNodeModifyPoseBa.prototype.bind.call(this, context);
    if (this.curveName) {
      this._handle = context.bindAuxiliaryCurve(this.curveName);
    }
  };
  _proto.getPoseTransformSpaceRequirement = function getPoseTransformSpaceRequirement() {
    return PoseTransformSpaceRequirement.NO;
  };
  _proto.modifyPose = function modifyPose(context, inputPose) {
    var handle = this._handle;
    if (!handle) {
      return;
    }
    switch (this.flag) {
      case SetAuxiliaryCurveFlag.REPLACE:
        inputPose.auxiliaryCurves[handle.index] = this.curveValue;
        break;
      case SetAuxiliaryCurveFlag.ADD:
        inputPose.auxiliaryCurves[handle.index] += this.curveValue;
        break;
      case SetAuxiliaryCurveFlag.LEAVE_UNCHANGED:
    }
  };
  return PoseNodeSetAuxiliaryCurve;
}(PoseNodeModifyPoseBase), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "curveName", [serializable$d], function () {
  return '';
}), _descriptor = _applyDecoratedDescriptor(_class2$3.prototype, "curveValue", [serializable$d, _dec3$3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return 0.0;
  }
}), _initializer2$1 = applyDecoratedInitializer(_class2$3.prototype, "flag", [serializable$d, _dec4$2], function () {
  return SetAuxiliaryCurveFlag.REPLACE;
}), _class2$3)) || _class$4) || _class$4);

var TwoBoneIKDebugger = function () {
  function TwoBoneIKDebugger() {
    this._node = void 0;
    this._meshRenderer = void 0;
    var node = new Node();
    legacyCC.director.getScene().addChild(node);
    var meshRenderer = node.addComponent(MeshRenderer);
    meshRenderer.material = function () {
      var material = new Material();
      material.reset({
        effectName: 'builtin-unlit',
        states: {
          primitive: PrimitiveMode.LINE_LIST
        },
        defines: {
          USE_VERTEX_COLOR: true
        }
      });
      return material;
    }();
    this._node = node;
    this._meshRenderer = meshRenderer;
  }
  var _proto = TwoBoneIKDebugger.prototype;
  _proto.draw = function draw(a, b, c) {
    var color1 = Color.RED;
    var color2 = Color.BLUE;
    var positions = [a.x, a.y, a.z, b.x, b.y, b.z, b.x, b.y, b.z, c.x, c.y, c.z];
    var colors = [color1.x, color1.y, color1.z, color1.w, color1.x, color1.y, color1.z, color1.w, color2.x, color2.y, color2.z, color2.w, color2.x, color2.y, color2.z, color2.w];
    var mesh = _createMesh({
      positions: positions,
      colors: colors,
      primitiveMode: PrimitiveMode.LINE_LIST
    });
    this._meshRenderer.mesh = mesh;
  };
  return TwoBoneIKDebugger;
}();
var debuggerMap = new WeakMap();
function debugTwoBoneIKDraw(key, a, b, c) {
  if (typeof key !== 'object' || !key) {
    return;
  }
  var ikDebugger = debuggerMap.get(key);
  if (!ikDebugger) {
    ikDebugger = new TwoBoneIKDebugger();
    debuggerMap.set(key, ikDebugger);
  }
  ikDebugger.draw(a, b, c);
}

var TwoBoneIKPositionSanityChecker = function () {
  function TwoBoneIKPositionSanityChecker() {
    this._a = new Vec3();
  }
  var _proto = TwoBoneIKPositionSanityChecker.prototype;
  _proto.reset = function reset(a, b, c) {
    Vec3.copy(this._a, a);
    this._dAB = Vec3.distance(a, b);
    this._dBC = Vec3.distance(b, c);
  };
  _proto.check = function check(_a, _b, _c) {
    var CHECK_EPSILON = 1e-3;
    var dAB = Vec3.distance(_a, _b);
    var dBC = Vec3.distance(_b, _c);
    if (!approx(Vec3.distance(_a, this._a), 0.0, CHECK_EPSILON)) {
      debugger;
      return false;
    }
    if (!approx(dAB, this._dAB, CHECK_EPSILON)) {
      debugger;
      return false;
    }
    if (!approx(dBC, this._dBC, CHECK_EPSILON)) {
      debugger;
      return false;
    }
    return true;
  };
  return TwoBoneIKPositionSanityChecker;
}();
var solveTwoBoneIK = function () {
  var cacheQuat = new Quat();
  var cacheHint = new Vec3();
  var cacheBSolved = new Vec3();
  var cacheCSolved = new Vec3();
  var calculateRotationBetweenRays = function () {
    var cacheVec3_1 = new Vec3();
    var cacheVec3_2 = new Vec3();
    return function (out, sourceOrigin, sourceDestination, targetOrigin, targetDestination) {
      return Quat.rotationTo(out, Vec3.subtract(cacheVec3_1, sourceDestination, sourceOrigin).normalize(), Vec3.subtract(cacheVec3_2, targetDestination, targetOrigin).normalize());
    };
  }();
  return function (root, middle, end, target, middlePositionHint, debugKey) {
    var hint = Vec3.copy(cacheHint, middlePositionHint !== null && middlePositionHint !== void 0 ? middlePositionHint : middle.position);
    var pA = root.position;
    var pB = middle.position;
    var pC = end.position;
    end.rotation;
    {
      if (typeof debugKey !== undefined) {
        debugTwoBoneIKDraw(debugKey, pA, pB, pC);
      }
    }
    var bSolved = cacheBSolved;
    var cSolved = cacheCSolved;
    solveTwoBoneIKPositions(pA, pB, pC, target, hint, bSolved, cSolved);
    var qA = calculateRotationBetweenRays(cacheQuat, pA, pB, pA, bSolved);
    Quat.multiply(qA, qA, root.rotation);
    root.rotation = qA;
    var qB = calculateRotationBetweenRays(cacheQuat, pB, pC, bSolved, cSolved);
    Quat.multiply(qB, qB, middle.rotation);
    middle.rotation = qB;
    middle.position = bSolved;
    end.position = cSolved;
  };
}();
var solveTwoBoneIKPositions = function () {
  var cacheDirAT = new Vec3();
  var cacheDirAB = new Vec3();
  var cacheDirHeightLine = new Vec3();
  var cacheSanityChecker = new TwoBoneIKPositionSanityChecker() ;
  return function (a, b, c, target, middleTarget, bSolved, cSolved) {
    var sanityCheck = cacheSanityChecker ? function () {
      cacheSanityChecker == null ? void 0 : cacheSanityChecker.reset(a, b, c);
      return function () {
        return cacheSanityChecker.check(a, bSolved, cSolved);
      };
    }() : undefined;
    var dAB = Vec3.distance(a, b);
    var dBC = Vec3.distance(b, c);
    var dAT = Vec3.distance(a, target);
    var dirAT = Vec3.subtract(cacheDirAT, target, a);
    dirAT.normalize();
    var chainLength = dAB + dBC;
    if (dAT >= chainLength) {
      Vec3.scaleAndAdd(bSolved, a, dirAT, dAB);
      Vec3.scaleAndAdd(cSolved, a, dirAT, chainLength);
      sanityCheck == null ? void 0 : sanityCheck();
      return;
    }
    Vec3.copy(cSolved, target);
    var cosḂAT = clamp((dAB * dAB + dAT * dAT - dBC * dBC) / (2 * dAB * dAT), -1, 1.0);
    var dirAB = Vec3.subtract(cacheDirAB, middleTarget, a);
    var dirHeightLine = Vec3.projectOnPlane(cacheDirHeightLine, dirAB, dirAT);
    dirHeightLine.normalize();
    var dAD = dAB * cosḂAT;
    var hSqr = dAB * dAB - dAD * dAD;
    if (hSqr < 0) {
      debugger;
    }
    var h = Math.sqrt(hSqr);
    Vec3.scaleAndAdd(bSolved, a, dirAT, dAD);
    Vec3.scaleAndAdd(bSolved, bSolved, dirHeightLine, h);
    sanityCheck == null ? void 0 : sanityCheck();
  };
}();

var POSE_GRAPH_NODE_MENU_PREFIX_IK = POSE_GRAPH_NODE_MENU_PREFIX_POSE + "/" + "i18n:ENGINE.animation_graph.pose_graph_node_sub_categories.pose_nodes_ik/";

var _dec$2, _dec2$2, _dec3$2, _class$3, _class2$2, _initializer$2, _initializer2, _initializer3, _initializer4, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _class3$1, _class4$1, _initializer5, _initializer6, _initializer7, _initializer8;
var cacheRootTransform = new Transform();
var cacheMiddleTransform = new Transform();
var cacheEndEffectorTransform = new Transform();
var cacheEndEffectorTargetPosition = new Vec3();
var cachePoleTargetPosition = new Vec3();
var cacheTransform_evaluateTarget = new Transform();
var TargetSpecificationType;
(function (TargetSpecificationType) {
  TargetSpecificationType[TargetSpecificationType["NONE"] = 0] = "NONE";
  TargetSpecificationType[TargetSpecificationType["VALUE"] = 1] = "VALUE";
  TargetSpecificationType[TargetSpecificationType["BONE"] = 2] = "BONE";
})(TargetSpecificationType || (TargetSpecificationType = {}));
ccenum(TargetSpecificationType);
var TargetSpecification = (_dec$2 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeTwoBoneIKSolver.TargetSpecification"), _dec2$2 = type$2(TargetSpecificationType), _dec3$2 = type$2(TransformSpace), _dec$2(_class$3 = (_class2$2 = function () {
  function TargetSpecification(type) {
    this.type = _initializer$2 && _initializer$2();
    this.targetPosition = _initializer2 && _initializer2();
    this.targetPositionSpace = _initializer3 && _initializer3();
    this.targetBone = _initializer4 && _initializer4();
    this._sourceBoneHandle = undefined;
    this._targetBoneHandle = undefined;
    if (typeof type !== 'undefined') {
      this.type = type;
    }
  }
  var _proto = TargetSpecification.prototype;
  _proto.bind = function bind(context, sourceBoneHandle) {
    this._sourceBoneHandle = sourceBoneHandle;
    if (this.type === TargetSpecificationType.BONE && this.targetBone) {
      var _context$bindTransfor;
      this._targetBoneHandle = (_context$bindTransfor = context.bindTransformByName(this.targetBone)) !== null && _context$bindTransfor !== void 0 ? _context$bindTransfor : undefined;
    }
  };
  _proto.evaluate = function evaluate(outTargetPosition, pose, context) {
    assertIsTrue(this._sourceBoneHandle);
    if (this._targetBoneHandle) {
      pose.transforms.getPosition(this._targetBoneHandle.index, outTargetPosition);
    } else if (this.type === TargetSpecificationType.NONE) {
      pose.transforms.getPosition(this._sourceBoneHandle.index, outTargetPosition);
    } else {
      var targetTransform = Transform.setIdentity(cacheTransform_evaluateTarget);
      targetTransform.position = this.targetPosition;
      context._convertTransformToPoseTransformSpace(targetTransform, this.targetPositionSpace, pose, this._sourceBoneHandle.index);
      Vec3.copy(outTargetPosition, targetTransform.position);
    }
    return outTargetPosition;
  };
  return TargetSpecification;
}(), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "type", [serializable$d, _dec2$2], function () {
  return TargetSpecificationType.VALUE;
}), _initializer2 = applyDecoratedInitializer(_class2$2.prototype, "targetPosition", [serializable$d], function () {
  return new Vec3();
}), _initializer3 = applyDecoratedInitializer(_class2$2.prototype, "targetPositionSpace", [serializable$d, _dec3$2], function () {
  return TransformSpace.WORLD;
}), _initializer4 = applyDecoratedInitializer(_class2$2.prototype, "targetBone", [serializable$d], function () {
  return '';
}), _class2$2)) || _class$3);
(_dec4$1 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PoseNodeTwoBoneIKSolver"), _dec5$1 = poseGraphNodeCategory(POSE_GRAPH_NODE_MENU_PREFIX_IK), _dec6$1 = input({
  type: PoseGraphType.VEC3
}), _dec7$1 = input({
  type: PoseGraphType.VEC3
}), _dec4$1(_class3$1 = _dec5$1(_class3$1 = (_class4$1 = function (_PoseNodeModifyPoseBa) {
  function PoseNodeTwoBoneIKSolver() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PoseNodeModifyPoseBa.call.apply(_PoseNodeModifyPoseBa, [this].concat(args)) || this;
    _this.debug = _initializer5 && _initializer5();
    _this.endEffectorBoneName = _initializer6 && _initializer6();
    _this.endEffectorTarget = _initializer7 && _initializer7();
    _this.poleTarget = _initializer8 && _initializer8();
    _this._workspace = undefined;
    return _this;
  }
  _inheritsLoose(PoseNodeTwoBoneIKSolver, _PoseNodeModifyPoseBa);
  var _proto2 = PoseNodeTwoBoneIKSolver.prototype;
  _proto2.bind = function bind(context) {
    _PoseNodeModifyPoseBa.prototype.bind.call(this, context);
    if (this.endEffectorBoneName) {
      var parentBoneName = context.getParentBoneNameByName(this.endEffectorBoneName);
      var ikRootBoneName = parentBoneName ? context.getParentBoneNameByName(parentBoneName) : '';
      if (parentBoneName && ikRootBoneName) {
        var _hEndEffector = context.bindTransformByName(this.endEffectorBoneName);
        var _hMiddle = context.bindTransformByName(parentBoneName);
        var hIKRoot = context.bindTransformByName(ikRootBoneName);
        if (!_hEndEffector || !_hMiddle || !hIKRoot) {
          _hEndEffector == null ? void 0 : _hEndEffector.destroy();
          _hMiddle == null ? void 0 : _hMiddle.destroy();
          hIKRoot == null ? void 0 : hIKRoot.destroy();
        } else {
          this.endEffectorTarget.bind(context, _hEndEffector);
          this.poleTarget.bind(context, _hMiddle);
          this._workspace = new Workspace(_hEndEffector, _hMiddle, hIKRoot);
        }
      }
    }
  };
  _proto2.getPoseTransformSpaceRequirement = function getPoseTransformSpaceRequirement() {
    return PoseTransformSpaceRequirement.COMPONENT;
  };
  _proto2.modifyPose = function modifyPose(context, inputPose, modificationQueue) {
    var workspace = this._workspace;
    if (!workspace) {
      return;
    }
    var iRootTransform = workspace.hRoot.index,
      iMiddleTransform = workspace.hMiddle.index,
      iEndEffectorTransform = workspace.hEndEffector.index;
    var rootTransform = inputPose.transforms.getTransform(iRootTransform, cacheRootTransform);
    var middleTransform = inputPose.transforms.getTransform(iMiddleTransform, cacheMiddleTransform);
    var endEffectorTransform = inputPose.transforms.getTransform(iEndEffectorTransform, cacheEndEffectorTransform);
    var endEffectorTargetPosition = this.endEffectorTarget.evaluate(cacheEndEffectorTargetPosition, inputPose, context);
    var poleTargetPosition = this.poleTarget.evaluate(cachePoleTargetPosition, inputPose, context);
    solveTwoBoneIK(rootTransform, middleTransform, endEffectorTransform, endEffectorTargetPosition, poleTargetPosition, this.debug ? this : undefined);
    modificationQueue.push(iRootTransform, rootTransform);
    modificationQueue.push(iMiddleTransform, middleTransform);
    modificationQueue.push(iEndEffectorTransform, endEffectorTransform);
  };
  return _createClass(PoseNodeTwoBoneIKSolver, [{
    key: "endEffectorTargetPosition",
    get: function get() {
      return this.endEffectorTarget.targetPosition;
    },
    set: function set(value) {
      Vec3.copy(this.endEffectorTarget.targetPosition, value);
    }
  }, {
    key: "poleTargetPosition",
    get: function get() {
      return this.poleTarget.targetPosition;
    },
    set: function set(value) {
      Vec3.copy(this.poleTarget.targetPosition, value);
    }
  }]);
}(PoseNodeModifyPoseBase), _initializer5 = applyDecoratedInitializer(_class4$1.prototype, "debug", [serializable$d], function () {
  return false;
}), _initializer6 = applyDecoratedInitializer(_class4$1.prototype, "endEffectorBoneName", [serializable$d], function () {
  return '';
}), _initializer7 = applyDecoratedInitializer(_class4$1.prototype, "endEffectorTarget", [serializable$d], function () {
  return new TargetSpecification(TargetSpecificationType.VALUE);
}), _applyDecoratedDescriptor(_class4$1.prototype, "endEffectorTargetPosition", [_dec6$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "endEffectorTargetPosition"), _class4$1.prototype), _initializer8 = applyDecoratedInitializer(_class4$1.prototype, "poleTarget", [serializable$d], function () {
  return new TargetSpecification(TargetSpecificationType.NONE);
}), _applyDecoratedDescriptor(_class4$1.prototype, "poleTargetPosition", [_dec7$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "poleTargetPosition"), _class4$1.prototype), _class4$1)) || _class3$1) || _class3$1);
var Workspace = function Workspace(hEndEffector, hMiddle, hRoot) {
  this.hEndEffector = hEndEffector;
  this.hMiddle = hMiddle;
  this.hRoot = hRoot;
};

var _dec$1, _dec2$1, _class$2, _class2$1, _initializer$1, _dec3$1, _dec4, _dec5, _class3, _dec6, _dec7, _dec8, _class4, _dec9, _dec0, _dec1, _class5, _dec10, _dec11, _dec12, _class6, _dec13, _dec14, _dec15, _class7;
var createNodeFactory = {
  listEntries: function listEntries(context) {
    var entries = [];
    for (var _iterator = _createForOfIteratorHelperLoose(context.animationGraph.variables), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        variableName = _step$value[0],
        type = _step$value[1].type;
      if (type === VariableType.TRIGGER) {
        continue;
      }
      var poseGraphType = void 0;
      switch (type) {
        default:
          break;
        case VariableType.FLOAT:
          poseGraphType = PoseGraphType.FLOAT;
          break;
        case VariableType.INTEGER:
          poseGraphType = PoseGraphType.INTEGER;
          break;
        case VariableType.BOOLEAN:
          poseGraphType = PoseGraphType.BOOLEAN;
          break;
        case VariableType.VEC3_experimental:
          poseGraphType = PoseGraphType.VEC3;
          break;
        case VariableType.QUAT_experimental:
          poseGraphType = PoseGraphType.QUAT;
          break;
      }
      if (typeof poseGraphType === 'undefined') {
        continue;
      }
      entries.push({
        arg: {
          name: variableName,
          type: poseGraphType
        },
        menu: variableName
      });
    }
    return entries;
  },
  create: function create(arg) {
    var node;
    switch (arg.type) {
      default:
        throw new Error("Bad create node arg: " + PoseGraphType[arg.type]);
      case PoseGraphType.FLOAT:
        node = new PVNodeGetVariableFloat();
        break;
      case PoseGraphType.INTEGER:
        node = new PVNodeGetVariableInteger();
        break;
      case PoseGraphType.BOOLEAN:
        node = new PVNodeGetVariableBoolean();
        break;
      case PoseGraphType.VEC3:
        node = new PVNodeGetVariableVec3();
        break;
      case PoseGraphType.QUAT:
        node = new PVNodeGetVariableQuat();
        break;
    }
    node.variableName = arg.name;
    return node;
  }
};
var PVNodeGetVariableBase = (_dec$1 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PVNodeGetVariableBase"), _dec2$1 = poseGraphCreateNodeFactory(createNodeFactory), _dec$1(_class$2 = _dec2$1(_class$2 = (_class2$1 = function (_SingleOutputPVNode) {
  function PVNodeGetVariableBase() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _SingleOutputPVNode.call.apply(_SingleOutputPVNode, [this].concat(args)) || this;
    _this.variableName = _initializer$1 && _initializer$1();
    _this._varInstance = undefined;
    return _this;
  }
  _inheritsLoose(PVNodeGetVariableBase, _SingleOutputPVNode);
  var _proto = PVNodeGetVariableBase.prototype;
  _proto.link = function link(context) {
    this._varInstance = context.getVar(this.variableName);
  };
  return PVNodeGetVariableBase;
}(SingleOutputPVNode), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "variableName", [serializable$d], function () {
  return '';
}), _class2$1)) || _class$2) || _class$2);
var PVNodeGetVariableFloat = (_dec3$1 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PVNodeGetVariableFloat"), _dec4 = poseGraphNodeHide(), _dec5 = poseGraphNodeAppearance({
  inline: true,
  themeColor: '#8471CF'
}), _dec3$1(_class3 = _dec4(_class3 = _dec5(_class3 = function (_PVNodeGetVariableBas) {
  function PVNodeGetVariableFloat() {
    return _PVNodeGetVariableBas.call(this, PoseGraphType.FLOAT) || this;
  }
  _inheritsLoose(PVNodeGetVariableFloat, _PVNodeGetVariableBas);
  var _proto2 = PVNodeGetVariableFloat.prototype;
  _proto2.selfEvaluateDefaultOutput = function selfEvaluateDefaultOutput() {
    var _this$_varInstance;
    return (_this$_varInstance = this._varInstance) == null ? void 0 : _this$_varInstance.value;
  };
  return PVNodeGetVariableFloat;
}(PVNodeGetVariableBase)) || _class3) || _class3) || _class3);
var PVNodeGetVariableInteger = (_dec6 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PVNodeGetVariableInteger"), _dec7 = poseGraphNodeHide(), _dec8 = poseGraphNodeAppearance({
  inline: true,
  themeColor: '#2A90DC'
}), _dec6(_class4 = _dec7(_class4 = _dec8(_class4 = function (_PVNodeGetVariableBas2) {
  function PVNodeGetVariableInteger() {
    return _PVNodeGetVariableBas2.call(this, PoseGraphType.INTEGER) || this;
  }
  _inheritsLoose(PVNodeGetVariableInteger, _PVNodeGetVariableBas2);
  var _proto3 = PVNodeGetVariableInteger.prototype;
  _proto3.selfEvaluateDefaultOutput = function selfEvaluateDefaultOutput() {
    var _this$_varInstance2;
    return (_this$_varInstance2 = this._varInstance) == null ? void 0 : _this$_varInstance2.value;
  };
  return PVNodeGetVariableInteger;
}(PVNodeGetVariableBase)) || _class4) || _class4) || _class4);
var PVNodeGetVariableBoolean = (_dec9 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PVNodeGetVariableBoolean"), _dec0 = poseGraphNodeHide(), _dec1 = poseGraphNodeAppearance({
  inline: true,
  themeColor: '#D07979'
}), _dec9(_class5 = _dec0(_class5 = _dec1(_class5 = function (_PVNodeGetVariableBas3) {
  function PVNodeGetVariableBoolean() {
    return _PVNodeGetVariableBas3.call(this, PoseGraphType.BOOLEAN) || this;
  }
  _inheritsLoose(PVNodeGetVariableBoolean, _PVNodeGetVariableBas3);
  var _proto4 = PVNodeGetVariableBoolean.prototype;
  _proto4.selfEvaluateDefaultOutput = function selfEvaluateDefaultOutput() {
    var _this$_varInstance3;
    return (_this$_varInstance3 = this._varInstance) == null ? void 0 : _this$_varInstance3.value;
  };
  return PVNodeGetVariableBoolean;
}(PVNodeGetVariableBase)) || _class5) || _class5) || _class5);
var PVNodeGetVariableVec3 = (_dec10 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PVNodeGetVariableVec3"), _dec11 = poseGraphNodeHide(), _dec12 = poseGraphNodeAppearance({
  inline: true,
  themeColor: '#D97721'
}), _dec10(_class6 = _dec11(_class6 = _dec12(_class6 = function (_PVNodeGetVariableBas4) {
  function PVNodeGetVariableVec3() {
    return _PVNodeGetVariableBas4.call(this, PoseGraphType.VEC3) || this;
  }
  _inheritsLoose(PVNodeGetVariableVec3, _PVNodeGetVariableBas4);
  var _proto5 = PVNodeGetVariableVec3.prototype;
  _proto5.selfEvaluateDefaultOutput = function selfEvaluateDefaultOutput() {
    var _this$_varInstance4;
    return (_this$_varInstance4 = this._varInstance) == null ? void 0 : _this$_varInstance4.value;
  };
  return PVNodeGetVariableVec3;
}(PVNodeGetVariableBase)) || _class6) || _class6) || _class6);
var PVNodeGetVariableQuat = (_dec13 = ccclass$g(CLASS_NAME_PREFIX_ANIM + "PVNodeGetVariableQuat"), _dec14 = poseGraphNodeHide(), _dec15 = poseGraphNodeAppearance({
  inline: true,
  themeColor: '#B169C4'
}), _dec13(_class7 = _dec14(_class7 = _dec15(_class7 = function (_PVNodeGetVariableBas5) {
  function PVNodeGetVariableQuat() {
    return _PVNodeGetVariableBas5.call(this, PoseGraphType.QUAT) || this;
  }
  _inheritsLoose(PVNodeGetVariableQuat, _PVNodeGetVariableBas5);
  var _proto6 = PVNodeGetVariableQuat.prototype;
  _proto6.selfEvaluateDefaultOutput = function selfEvaluateDefaultOutput() {
    var _this$_varInstance5;
    return (_this$_varInstance5 = this._varInstance) == null ? void 0 : _this$_varInstance5.value;
  };
  return PVNodeGetVariableQuat;
}(PVNodeGetVariableBase)) || _class7) || _class7) || _class7);

var MAX_ANIMATION_LAYER = 32;

var RuntimeMotionSyncManager = function () {
  function RuntimeMotionSyncManager() {
    this._groups = [];
  }
  var _proto = RuntimeMotionSyncManager.prototype;
  _proto.register = function register(syncInfo) {
    var groupName = syncInfo.group;
    var group = this._groups.find(function (group) {
      return group.name === groupName;
    });
    if (!group) {
      group = new Group(groupName);
      this._groups.push(group);
    }
    return group.addMember();
  };
  _proto.sync = function sync() {
    for (var _iterator = _createForOfIteratorHelperLoose(this._groups), _step; !(_step = _iterator()).done;) {
      var group = _step.value;
      group.sync();
    }
  };
  return RuntimeMotionSyncManager;
}();
var Group = function () {
  function Group(name) {
    this._lastLeader = undefined;
    this._records = [];
    this.name = name;
  }
  var _proto2 = Group.prototype;
  _proto2.addMember = function addMember() {
    var record = new RuntimeMotionSyncRecordImpl();
    this._records.push(record);
    return record;
  };
  _proto2.sync = function sync() {
    var records = this._records;
    var nRecords = records.length;
    assertIsTrue(nRecords > 0);
    var lastLeader = this._lastLeader;
    this._lastLeader = undefined;
    if (records.every(function (r) {
      return !r.active;
    })) {
      return;
    }
    records.sort(function (a, b) {
      var kA = a.active ? a.weight : -1;
      var kB = b.active ? b.weight : -1;
      return kB - kA;
    });
    {
      var firstInactiveRecord = records.findIndex(function (r) {
        return !r.active;
      });
      assertIsTrue((firstInactiveRecord < 0 ? [] : records.slice(firstInactiveRecord)).every(function (r) {
        return !r.active;
      }));
    }
    var leaderIndex = 0;
    var leaderWeight = records[0].weight;
    if (records[leaderIndex] !== lastLeader) {
      for (var iRecord = 0; iRecord < nRecords; ++iRecord) {
        var record = records[iRecord];
        if (!record.active || !approx(record.weight, leaderWeight, 1e-6)) {
          break;
        }
        if (record === lastLeader) {
          leaderIndex = iRecord;
          break;
        }
      }
    }
    assertIsTrue(records[leaderIndex].active);
    this._lastLeader = records[leaderIndex];
    var leaderNormalizedTime = records[leaderIndex].normalizedTime;
    for (var _iRecord = 0; _iRecord < nRecords; ++_iRecord) {
      var _record = records[_iRecord];
      if (!_record.active) {
        break;
      }
      _record.normalizedTime = leaderNormalizedTime;
      _record.reset();
    }
  };
  return Group;
}();
var RuntimeMotionSyncRecordImpl = function () {
  function RuntimeMotionSyncRecordImpl() {
    this.normalizedTime = 0.0;
    this.weight = 0.0;
    this.active = false;
  }
  var _proto3 = RuntimeMotionSyncRecordImpl.prototype;
  _proto3.notifyRenter = function notifyRenter(normalizedTime) {
    this.reset();
    this.normalizedTime = normalizedTime;
  };
  _proto3.notifyUpdate = function notifyUpdate(normalizedDeltaTime, weight) {
    this.normalizedTime += normalizedDeltaTime;
    if (this.active) {
      this.weight += weight;
    } else {
      this.active = true;
      this.weight = weight;
    }
  };
  _proto3.reset = function reset() {
    this.active = false;
    this.weight = 0.0;
  };
  _proto3.getSyncedEnterTime = function getSyncedEnterTime() {
    return this.normalizedTime;
  };
  return RuntimeMotionSyncRecordImpl;
}();

var StashRecordState;
(function (StashRecordState) {
  StashRecordState[StashRecordState["UNINITIALIZED"] = 0] = "UNINITIALIZED";
  StashRecordState[StashRecordState["UNSETTLED"] = 1] = "UNSETTLED";
  StashRecordState[StashRecordState["SETTLED"] = 2] = "SETTLED";
  StashRecordState[StashRecordState["UP_TO_DATE"] = 3] = "UP_TO_DATE";
  StashRecordState[StashRecordState["OUTDATED"] = 4] = "OUTDATED";
  StashRecordState[StashRecordState["UPDATING"] = 5] = "UPDATING";
  StashRecordState[StashRecordState["UPDATED"] = 6] = "UPDATED";
  StashRecordState[StashRecordState["EVALUATING"] = 7] = "EVALUATING";
  StashRecordState[StashRecordState["EVALUATED"] = 8] = "EVALUATED";
})(StashRecordState || (StashRecordState = {}));
var RuntimeStashRecord = function () {
  function RuntimeStashRecord(_allocator) {
    this._state = StashRecordState.UNINITIALIZED;
    this._instantiatedPoseGraph = undefined;
    this._maxRequestedUpdateTime = 0.0;
    this._evaluationCache = null;
    this._updateContextGenerator = new AnimationGraphUpdateContextGenerator();
    this._allocator = _allocator;
  }
  var _proto = RuntimeStashRecord.prototype;
  _proto.set = function set(stash, context) {
    assertIsTrue(this._state === StashRecordState.UNINITIALIZED, "The stash has already been set.");
    var instantiatedPoseGraph = instantiatePoseGraph(stash.graph, context);
    instantiatedPoseGraph.bind(context);
    this._instantiatedPoseGraph = instantiatedPoseGraph;
    this._state = StashRecordState.UNSETTLED;
  };
  _proto.settle = function settle(context) {
    assertIsTrue(this._state === StashRecordState.UNSETTLED || this._state === StashRecordState.SETTLED);
    assertIsTrue(this._instantiatedPoseGraph);
    this._instantiatedPoseGraph.settle(context);
    this._state = StashRecordState.SETTLED;
  };
  _proto.reset = function reset() {
    switch (this._state) {
      case StashRecordState.SETTLED:
      case StashRecordState.OUTDATED:
        break;
      case StashRecordState.UP_TO_DATE:
        this._state = StashRecordState.OUTDATED;
        break;
      case StashRecordState.UPDATED:
      case StashRecordState.EVALUATED:
        if (this._evaluationCache) {
          this._allocator.destroyPose(this._evaluationCache);
          this._evaluationCache = null;
        }
        this._maxRequestedUpdateTime = 0.0;
        this._state = StashRecordState.UP_TO_DATE;
        break;
      case StashRecordState.UNINITIALIZED:
      default:
        assertIsTrue(false, "Unexpected stash state");
    }
  };
  _proto.reenter = function reenter() {
    switch (this._state) {
      default:
        assertIsTrue(false, "Unexpected stash state " + this._state + " when reenter().");
        break;
      case StashRecordState.UP_TO_DATE:
      case StashRecordState.UPDATED:
        break;
      case StashRecordState.SETTLED:
      case StashRecordState.OUTDATED:
        {
          this._state = StashRecordState.UP_TO_DATE;
          assertIsTrue(this._instantiatedPoseGraph);
          this._instantiatedPoseGraph.reenter();
          break;
        }
    }
  };
  _proto.requestUpdate = function requestUpdate(context) {
    var deltaTime = context.deltaTime;
    assertIsTrue(this._state === StashRecordState.OUTDATED || this._state === StashRecordState.UP_TO_DATE || this._state === StashRecordState.UPDATING || this._state === StashRecordState.UPDATED);
    assertIsTrue(this._instantiatedPoseGraph);
    if (this._state === StashRecordState.UPDATING) {
      return;
    }
    var diffDeltaTime = Math.max(0.0, deltaTime - this._maxRequestedUpdateTime);
    if (this._state === StashRecordState.UPDATED) {
      if (approx(diffDeltaTime, 0.0, 1e-8)) {
        return;
      } else {
        {
          error("Arrived here indicates a violent of PR #14990. Please report the BUG.");
          return;
        }
      }
    }
    this._state = StashRecordState.UPDATING;
    this._maxRequestedUpdateTime = Math.max(deltaTime, this._maxRequestedUpdateTime);
    var updateContext = this._updateContextGenerator.generate(diffDeltaTime, context.indicativeWeight);
    this._instantiatedPoseGraph.update(updateContext);
    this._state = StashRecordState.UPDATED;
  };
  _proto.evaluate = function evaluate(context) {
    switch (this._state) {
      default:
        assertIsTrue(false, "Unexpected stash state " + this._state + " when evaluate().");
        break;
      case StashRecordState.EVALUATING:
        this._state = StashRecordState.EVALUATED;
        break;
      case StashRecordState.EVALUATED:
        break;
      case StashRecordState.UPDATED:
        {
          var _this$_instantiatedPo;
          assertIsTrue(!this._evaluationCache);
          this._state = StashRecordState.EVALUATING;
          var _pose = (_this$_instantiatedPo = this._instantiatedPoseGraph) == null ? void 0 : _this$_instantiatedPo.evaluate(context);
          this._state = StashRecordState.EVALUATED;
          if (_pose) {
            var heapPose = this._allocator.allocatePose();
            heapPose.transforms.set(_pose.transforms);
            heapPose.auxiliaryCurves.set(_pose.auxiliaryCurves);
            this._evaluationCache = heapPose;
            context.popPose();
          }
          this._state = StashRecordState.EVALUATED;
          break;
        }
    }
    assertIsTrue(this._state === StashRecordState.EVALUATED);
    assertIsTrue(this._instantiatedPoseGraph);
    return this._evaluationCache ? context.pushDuplicatedPose(this._evaluationCache) : null;
  };
  return RuntimeStashRecord;
}();
var RuntimeStashManager = function () {
  function RuntimeStashManager(allocator) {
    this._allocator = void 0;
    this._stashEvaluations = {};
    this._allocator = allocator;
  }
  var _proto2 = RuntimeStashManager.prototype;
  _proto2.bindStash = function bindStash(id) {
    return this._stashEvaluations[id];
  };
  _proto2.getStash = function getStash(id) {
    return this._stashEvaluations[id];
  };
  _proto2.addStash = function addStash(id) {
    this._stashEvaluations[id] = new RuntimeStashRecord(this._allocator);
  };
  _proto2.setStash = function setStash(id, stash, context) {
    assertIsTrue(id in this._stashEvaluations);
    this._stashEvaluations[id].set(stash, context);
  };
  _proto2.reset = function reset() {
    for (var stashId in this._stashEvaluations) {
      var record = this._stashEvaluations[stashId];
      record.reset();
    }
  };
  _proto2.settle = function settle(context) {
    for (var stashId in this._stashEvaluations) {
      var record = this._stashEvaluations[stashId];
      record.settle(context);
    }
  };
  return RuntimeStashManager;
}();

var DefaultTopLevelPoseNode = function (_PoseNode) {
  function DefaultTopLevelPoseNode(graph, bindingContext, poseStashAllocator) {
    var _this;
    _this = _PoseNode.call(this) || this;
    _this._layerRecords = void 0;
    var layerEvaluationRecords = graph.layers.map(function (layer) {
      var record = new LayerEvaluationRecord(layer, bindingContext, poseStashAllocator);
      return record;
    });
    _this._layerRecords = layerEvaluationRecords;
    return _this;
  }
  _inheritsLoose(DefaultTopLevelPoseNode, _PoseNode);
  var _proto = DefaultTopLevelPoseNode.prototype;
  _proto.reenter = function reenter() {};
  _proto.bind = function bind(_context) {};
  _proto.settle = function settle(context) {
    var layerRecords = this._layerRecords;
    var nLayers = layerRecords.length;
    for (var iLayer = 0; iLayer < nLayers; ++iLayer) {
      layerRecords[iLayer].settle(context);
    }
  };
  _proto.getLayerWeight = function getLayerWeight(layerIndex) {
    assertIsTrue(layerIndex >= 0 && layerIndex < this._layerRecords.length, "Invalid layer index");
    return this._layerRecords[layerIndex].weight;
  };
  _proto.setLayerWeight = function setLayerWeight(layerIndex, weight) {
    assertIsTrue(layerIndex >= 0 && layerIndex < this._layerRecords.length, "Invalid layer index");
    this._layerRecords[layerIndex].weight = weight;
  };
  _proto.getLayerTopLevelStateMachineEvaluation = function getLayerTopLevelStateMachineEvaluation(layerIndex) {
    return this._layerRecords[layerIndex].stateMachineEvaluation;
  };
  _proto.overrideClips = function overrideClips(context) {
    var layerRecords = this._layerRecords;
    var nLayers = layerRecords.length;
    for (var iLayer = 0; iLayer < nLayers; ++iLayer) {
      var layerRecord = layerRecords[iLayer];
      context._pushAdditiveFlag(layerRecord.additive);
      layerRecord.stateMachineEvaluation.overrideClips(context);
      context._popAdditiveFlag();
    }
  };
  _proto.doUpdate = function doUpdate(context) {
    var layerRecords = this._layerRecords;
    var nLayers = layerRecords.length;
    for (var iLayer = 0; iLayer < nLayers; ++iLayer) {
      layerRecords[iLayer].update(context);
    }
  };
  _proto.doEvaluate = function doEvaluate(context) {
    var finalPose = context.pushDefaultedPose();
    var layerRecords = this._layerRecords;
    var nLayers = layerRecords.length;
    for (var iLayer = 0; iLayer < nLayers; ++iLayer) {
      var layer = layerRecords[iLayer];
      var layerPose = layer.stateMachineEvaluation.evaluate(context);
      var layerActualWeight = layer.weight * layer.stateMachineEvaluation.passthroughWeight;
      var transformFilter = layer.transformFilter;
      if (layer.additive) {
        applyDeltaPose(finalPose, layerPose, layerActualWeight, transformFilter);
      } else {
        blendPoseInto(finalPose, layerPose, layerActualWeight, transformFilter);
      }
      context.popPose();
      layer.postEvaluate();
    }
    return finalPose;
  };
  return _createClass(DefaultTopLevelPoseNode, [{
    key: "layerCount",
    get: function get() {
      return this._layerRecords.length;
    }
  }]);
}(PoseNode);
var LayerEvaluationRecord = function () {
  function LayerEvaluationRecord(layer, bindingContext, poseStashAllocator) {
    var _layer$mask;
    this.additive = false;
    this.weight = 0.0;
    this._topLevelStateMachineEval = void 0;
    this._stashManager = void 0;
    this._motionSyncManager = void 0;
    this._mask = undefined;
    this.transformFilter = undefined;
    var stashManager = new RuntimeStashManager(poseStashAllocator);
    for (var _iterator = _createForOfIteratorHelperLoose(layer.stashes()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        stashId = _step$value[0];
        _step$value[1];
      stashManager.addStash(stashId);
    }
    this._stashManager = stashManager;
    var motionSyncManager = new RuntimeMotionSyncManager();
    this._motionSyncManager = motionSyncManager;
    bindingContext._setLayerWideContextProperties(stashManager, motionSyncManager);
    for (var _iterator2 = _createForOfIteratorHelperLoose(layer.stashes()), _step2; !(_step2 = _iterator2()).done;) {
      var _step2$value = _step2.value,
        _stashId = _step2$value[0],
        stash = _step2$value[1];
      stashManager.setStash(_stashId, stash, bindingContext);
    }
    this.weight = layer.weight;
    var additive = this.additive = layer.additive;
    this._mask = (_layer$mask = layer.mask) !== null && _layer$mask !== void 0 ? _layer$mask : undefined;
    bindingContext._pushAdditiveFlag(additive);
    this._topLevelStateMachineEval = new TopLevelStateMachineEvaluation(layer.stateMachine, layer.name, bindingContext);
    bindingContext._popAdditiveFlag();
    bindingContext._unsetLayerWideContextProperties();
  }
  var _proto2 = LayerEvaluationRecord.prototype;
  _proto2.settle = function settle(context) {
    if (this._mask) {
      this.transformFilter = context.createTransformFilter(this._mask);
    }
    this._stashManager.settle(context);
    this._topLevelStateMachineEval.settle(context);
  };
  _proto2.update = function update(context) {
    this.stateMachineEvaluation.update(context);
    this._motionSyncManager.sync();
  };
  _proto2.postEvaluate = function postEvaluate() {
    this._stashManager.reset();
  };
  return _createClass(LayerEvaluationRecord, [{
    key: "stateMachineEvaluation",
    get: function get() {
      return this._topLevelStateMachineEval;
    }
  }]);
}();

var AnimationGraphEval = function () {
  function AnimationGraphEval(graph, root, controller, clipOverrides) {
    this._currentTransitionCache = {
      duration: 0.0,
      time: 0.0
    };
    this._rootPoseNode = void 0;
    this._varInstances = {};
    this._hasAutoTrigger = false;
    this._auxiliaryCurveRegistry = new AuxiliaryCurveRegistry();
    this._poseLayoutMaintainer = void 0;
    this._bindingContext = void 0;
    this._settleContext = void 0;
    this._rootUpdateContextGenerator = new AnimationGraphUpdateContextGenerator();
    {
      if (graph.layers.length >= MAX_ANIMATION_LAYER) {
        throw new Error("Max layer count exceeds. " + ("Allowed: " + MAX_ANIMATION_LAYER + ", actual: " + graph.layers.length));
      }
    }
    for (var _iterator = _createForOfIteratorHelperLoose(graph.variables), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        name = _step$value[0],
        variable = _step$value[1];
      var varInstance = variable[createInstanceTag]();
      this._varInstances[name] = varInstance;
      if (varInstance instanceof VarInstanceTrigger) {
        if (varInstance.resetMode === TriggerResetMode.NEXT_FRAME_OR_AFTER_CONSUMED) {
          this._hasAutoTrigger = true;
        }
      }
    }
    var poseLayoutMaintainer = new AnimationGraphPoseLayoutMaintainer(root, this._auxiliaryCurveRegistry);
    this._poseLayoutMaintainer = poseLayoutMaintainer;
    var bindingContext = new AnimationGraphBindingContext(root, poseLayoutMaintainer, this._varInstances, controller);
    bindingContext._setClipOverrides(clipOverrides !== null && clipOverrides !== void 0 ? clipOverrides : undefined);
    this._bindingContext = bindingContext;
    var settleContext = new AnimationGraphSettleContext(poseLayoutMaintainer);
    this._settleContext = settleContext;
    poseLayoutMaintainer.startBind();
    var poseStashAllocator = new DeferredPoseStashAllocator();
    this._poseStashAllocator = poseStashAllocator;
    this._rootPoseNode = new DefaultTopLevelPoseNode(graph, bindingContext, poseStashAllocator);
    this._root = root;
    this._initializeContexts();
  }
  var _proto = AnimationGraphEval.prototype;
  _proto.destroy = function destroy() {
    this._evaluationContext.destroy();
  };
  _proto._destroyAfterException_debugging = function _destroyAfterException_debugging() {
    var stackSize = this._evaluationContext._stackSize_debugging;
    if (stackSize !== 0) {
      for (var i = 0; i < stackSize; ++i) {
        this._evaluationContext.popPose();
      }
    }
    this._evaluationContext.destroy();
  };
  _proto.update = function update(deltaTime) {
    var evaluationContext = this._evaluationContext,
      poseLayoutMaintainer = this._poseLayoutMaintainer,
      rootUpdateContextGenerator = this._rootUpdateContextGenerator,
      rootPoseNode = this._rootPoseNode;
    var updateContext = rootUpdateContextGenerator.generate(deltaTime, 1.0);
    rootPoseNode.update(updateContext);
    var finalPose = rootPoseNode.evaluate(evaluationContext, PoseTransformSpaceRequirement.LOCAL);
    if (this._hasAutoTrigger) {
      var varInstances = this._varInstances;
      for (var varName in varInstances) {
        var varInstance = varInstances[varName];
        if (varInstance instanceof VarInstanceTrigger && varInstance.resetMode === TriggerResetMode.NEXT_FRAME_OR_AFTER_CONSUMED) {
          varInstance.value = false;
        }
      }
    }
    poseLayoutMaintainer.apply(finalPose);
    evaluationContext.popPose();
    {
      assertIsTrue(evaluationContext.allocatedPoseCount === 0, "Pose leaked.");
      assertIsTrue(this._poseStashAllocator.allocatedPoseCount === 0, "Pose leaked.");
    }
  };
  _proto.getVariables = function getVariables() {
    return Object.entries(this._varInstances);
  };
  _proto.getCurrentStateStatus = function getCurrentStateStatus(layer) {
    return this._rootPoseNode.getLayerTopLevelStateMachineEvaluation(layer).getCurrentStateStatus();
  };
  _proto.getCurrentClipStatuses = function getCurrentClipStatuses(layer) {
    return this._rootPoseNode.getLayerTopLevelStateMachineEvaluation(layer).getCurrentClipStatuses();
  };
  _proto.getCurrentTransition = function getCurrentTransition(layer) {
    var currentTransition = this._currentTransitionCache;
    var isInTransition = this._rootPoseNode.getLayerTopLevelStateMachineEvaluation(layer).getCurrentTransition(currentTransition);
    return isInTransition ? currentTransition : null;
  };
  _proto.getNextStateStatus = function getNextStateStatus(layer) {
    return this._rootPoseNode.getLayerTopLevelStateMachineEvaluation(layer).getNextStateStatus();
  };
  _proto.getNextClipStatuses = function getNextClipStatuses(layer) {
    return this._rootPoseNode.getLayerTopLevelStateMachineEvaluation(layer).getNextClipStatuses();
  };
  _proto.getValue = function getValue(name) {
    var varInstance = this._varInstances[name];
    if (!varInstance) {
      return undefined;
    } else {
      return varInstance.value;
    }
  };
  _proto.setValue = function setValue(name, value) {
    var varInstance = this._varInstances[name];
    if (!varInstance) {
      return;
    }
    varInstance.value = value;
  };
  _proto.getLayerWeight = function getLayerWeight(layerIndex) {
    return this._rootPoseNode.getLayerWeight(layerIndex);
  };
  _proto.setLayerWeight = function setLayerWeight(layerIndex, weight) {
    this._rootPoseNode.setLayerWeight(layerIndex, weight);
  };
  _proto.overrideClips = function overrideClips(overrides) {
    var poseLayoutMaintainer = this._poseLayoutMaintainer;
    poseLayoutMaintainer.startBind();
    this._bindingContext._setClipOverrides(overrides);
    this._rootPoseNode.overrideClips(this._bindingContext);
    this._updateAfterPossiblePoseLayoutChange();
  };
  _proto.getAuxiliaryCurveValue = function getAuxiliaryCurveValue(curveName) {
    return this._auxiliaryCurveRegistry.get(curveName);
  };
  _proto._initializeContexts = function _initializeContexts() {
    var poseLayoutMaintainer = this._poseLayoutMaintainer;
    void poseLayoutMaintainer.endBind();
    this._createOrUpdateTransformFilters();
    var evaluationContext = poseLayoutMaintainer.createEvaluationContext();
    this._evaluationContext = evaluationContext;
    poseLayoutMaintainer.fetchDefaultTransforms(evaluationContext[defaultTransformsTag]);
    poseLayoutMaintainer.resetPoseStashAllocator(this._poseStashAllocator);
  };
  _proto._updateAfterPossiblePoseLayoutChange = function _updateAfterPossiblePoseLayoutChange() {
    var poseLayoutMaintainer = this._poseLayoutMaintainer;
    var layoutChangeFlags = poseLayoutMaintainer.endBind();
    if (layoutChangeFlags === 0) {
      return;
    }
    if (layoutChangeFlags & LayoutChangeFlag.TRANSFORM_COUNT || layoutChangeFlags & LayoutChangeFlag.TRANSFORM_ORDER) {
      this._createOrUpdateTransformFilters();
    }
    var evaluationContextRecreated = false;
    if (layoutChangeFlags & LayoutChangeFlag.TRANSFORM_COUNT || layoutChangeFlags & LayoutChangeFlag.AUXILIARY_CURVE_COUNT) {
      var evaluationContext = poseLayoutMaintainer.createEvaluationContext();
      this._evaluationContext.destroy();
      this._evaluationContext = evaluationContext;
      evaluationContextRecreated = true;
      poseLayoutMaintainer.resetPoseStashAllocator(this._poseStashAllocator);
    }
    if (evaluationContextRecreated || layoutChangeFlags & LayoutChangeFlag.TRANSFORM_COUNT || layoutChangeFlags & LayoutChangeFlag.TRANSFORM_ORDER) {
      poseLayoutMaintainer.fetchDefaultTransforms(this._evaluationContext[defaultTransformsTag]);
    }
  };
  _proto._createOrUpdateTransformFilters = function _createOrUpdateTransformFilters() {
    this._rootPoseNode.settle(this._settleContext);
  };
  return _createClass(AnimationGraphEval, [{
    key: "layerCount",
    get: function get() {
      return this._rootPoseNode.layerCount;
    }
  }]);
}();

var _dec, _dec2, _dec3, _class$1, _class2, _initializer;
var ccclass = ccclass$g,
  type = type$2,
  serializable = serializable$d,
  formerlySerializedAs = formerlySerializedAs$1;
var AnimationController = (_dec = ccclass('cc.animation.AnimationController'), _dec2 = type(AnimationGraphLike), _dec3 = formerlySerializedAs('graph'), _dec(_class$1 = (_class2 = function (_Component) {
  function AnimationController() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this._graph = _initializer && _initializer();
    _this._graphEval = null;
    return _this;
  }
  _inheritsLoose(AnimationController, _Component);
  var _proto = AnimationController.prototype;
  _proto.__preload = function __preload() {
    var graph = this.graph;
    if (graph) {
      var originalGraph;
      var clipOverrides = null;
      if (graph instanceof AnimationGraphVariant) {
        if (!graph.original) {
          return;
        }
        originalGraph = graph.original;
        clipOverrides = graph.clipOverrides;
      } else {
        assertIsTrue(graph instanceof AnimationGraph);
        originalGraph = graph;
      }
      var graphEval = new AnimationGraphEval(originalGraph, this.node, this, clipOverrides);
      this._graphEval = graphEval;
    }
  };
  _proto.onDestroy = function onDestroy() {
    var _this$_graphEval;
    (_this$_graphEval = this._graphEval) == null ? void 0 : _this$_graphEval.destroy();
  };
  _proto.update = function update(deltaTime) {
    var _this$_graphEval2;
    (_this$_graphEval2 = this._graphEval) == null ? void 0 : _this$_graphEval2.update(deltaTime);
  };
  _proto.getVariables = function getVariables() {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.getVariables();
  };
  _proto.setValue = function setValue(name, value) {
    return this.setValue_experimental(name, value);
  };
  _proto.setValue_experimental = function setValue_experimental(name, value) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    graphEval.setValue(name, value);
  };
  _proto.getValue = function getValue(name) {
    var value = this.getValue_experimental(name);
    if (typeof value === 'object') {
      {
        warn("Obtaining variable \"" + name + "\" is not of primitive type, " + "which is currently supported experimentally and should be explicitly obtained through this.getValue_experimental()");
      }
      return undefined;
    } else {
      return value;
    }
  };
  _proto.getValue_experimental = function getValue_experimental(name) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.getValue(name);
  };
  _proto.getCurrentStateStatus = function getCurrentStateStatus(layer) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.getCurrentStateStatus(layer);
  };
  _proto.getCurrentClipStatuses = function getCurrentClipStatuses(layer) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.getCurrentClipStatuses(layer);
  };
  _proto.getCurrentTransition = function getCurrentTransition(layer) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.getCurrentTransition(layer);
  };
  _proto.getNextStateStatus = function getNextStateStatus(layer) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.getNextStateStatus(layer);
  };
  _proto.getNextClipStatuses = function getNextClipStatuses(layer) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.getNextClipStatuses(layer);
  };
  _proto.getLayerWeight = function getLayerWeight(layer) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.getLayerWeight(layer);
  };
  _proto.setLayerWeight = function setLayerWeight(layer, weight) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    return graphEval.setLayerWeight(layer, weight);
  };
  _proto.overrideClips_experimental = function overrideClips_experimental(overrides) {
    var graphEval = this._graphEval;
    assertIsNonNullable(graphEval);
    graphEval.overrideClips(overrides);
  };
  _proto.getAuxiliaryCurveValue_experimental = function getAuxiliaryCurveValue_experimental(curveName) {
    var graphEval = this._graphEval;
    if (!graphEval) {
      return 0.0;
    }
    return graphEval.getAuxiliaryCurveValue(curveName);
  };
  return _createClass(AnimationController, [{
    key: "graph",
    get: function get() {
      return this._graph;
    },
    set: function set(value) {
      this._graph = value;
    }
  }, {
    key: "layerCount",
    get: function get() {
      var _this$_graphEval$laye, _this$_graphEval3;
      return (_this$_graphEval$laye = (_this$_graphEval3 = this._graphEval) == null ? void 0 : _this$_graphEval3.layerCount) !== null && _this$_graphEval$laye !== void 0 ? _this$_graphEval$laye : 0;
    }
  }]);
}(Component), _applyDecoratedDescriptor(_class2.prototype, "graph", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "graph"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_graph", [serializable, _dec3], function () {
  return null;
}), _class2)) || _class$1);

var animation = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AnimationController: AnimationController,
    ColorTrack: ColorTrack,
    ComponentPath: ComponentPath,
    CubicSplineNumberValue: CubicSplineNumberValue,
    CubicSplineQuatValue: CubicSplineQuatValue,
    CubicSplineVec2Value: CubicSplineVec2Value,
    CubicSplineVec3Value: CubicSplineVec3Value,
    CubicSplineVec4Value: CubicSplineVec4Value,
    HierarchyPath: HierarchyPath,
    MorphWeightValueProxy: MorphWeightValueProxy,
    MorphWeightsAllValueProxy: MorphWeightsAllValueProxy,
    MorphWeightsValueProxy: MorphWeightsValueProxy,
    ObjectTrack: ObjectTrack,
    QuatTrack: QuatTrack,
    RealTrack: RealTrack,
    SizeTrack: SizeTrack,
    StateMachineComponent: StateMachineComponent,
    Track: Track,
    TrackPath: TrackPath,
    UniformProxyFactory: UniformProxyFactory,
    get VariableType () { return VariableType; },
    VectorTrack: VectorTrack,
    isCustomPath: isCustomPath,
    isPropertyPath: isPropertyPath
});

var BlendStateBuffer = function () {
  function BlendStateBuffer() {
    this._nodeBlendStates = new Map();
  }
  var _proto = BlendStateBuffer.prototype;
  _proto.createWriter = function createWriter(node, property, host, constants) {
    var propertyBlendState = this.ref(node, property);
    return new BlendStateWriterInternal(node, property, propertyBlendState, host, constants);
  };
  _proto.destroyWriter = function destroyWriter(writer) {
    var internal = writer;
    this.deRef(internal.node, internal.property);
  };
  _proto.ref = function ref(node, property) {
    var nodeBlendState = this._nodeBlendStates.get(node);
    if (!nodeBlendState) {
      nodeBlendState = this.createNodeBlendState();
      this._nodeBlendStates.set(node, nodeBlendState);
    }
    var propertyBlendState = nodeBlendState.refProperty(node, property);
    return propertyBlendState;
  };
  _proto.deRef = function deRef(node, property) {
    var nodeBlendState = this._nodeBlendStates.get(node);
    if (!nodeBlendState) {
      return;
    }
    nodeBlendState.deRefProperty(property);
    if (nodeBlendState.empty) {
      this._nodeBlendStates["delete"](node);
    }
  };
  _proto.apply = function apply() {
    this._nodeBlendStates.forEach(function (nodeBlendState, node) {
      nodeBlendState.apply(node);
    });
  };
  return BlendStateBuffer;
}();
var BlendStateWriterInternal = function () {
  function BlendStateWriterInternal(_node, _property, _propertyBlendState, _host, _constants) {
    this._node = _node;
    this._property = _property;
    this._propertyBlendState = _propertyBlendState;
    this._host = _host;
    this._constants = _constants;
  }
  var _proto2 = BlendStateWriterInternal.prototype;
  _proto2.getValue = function getValue() {
    return this._node[this._property];
  };
  _proto2.setValue = function setValue(value) {
    var propertyBlendState = this._propertyBlendState,
      host = this._host;
    var weight = host.weight;
    propertyBlendState.blend(value, weight);
  };
  return _createClass(BlendStateWriterInternal, [{
    key: "node",
    get: function get() {
      return this._node;
    }
  }, {
    key: "property",
    get: function get() {
      return this._property;
    }
  }]);
}();
var TransformApplyFlag;
(function (TransformApplyFlag) {
  TransformApplyFlag[TransformApplyFlag["POSITION"] = 1] = "POSITION";
  TransformApplyFlag[TransformApplyFlag["ROTATION"] = 2] = "ROTATION";
  TransformApplyFlag[TransformApplyFlag["SCALE"] = 4] = "SCALE";
  TransformApplyFlag[TransformApplyFlag["EULER_ANGLES"] = 8] = "EULER_ANGLES";
})(TransformApplyFlag || (TransformApplyFlag = {}));
TransformApplyFlag.POSITION | TransformApplyFlag.ROTATION | TransformApplyFlag.SCALE | TransformApplyFlag.EULER_ANGLES;
var LegacyVec3PropertyBlendState = function () {
  function LegacyVec3PropertyBlendState() {
    this.refCount = 0;
    this.accumulatedWeight = 0.0;
    this.result = new Vec3();
  }
  var _proto3 = LegacyVec3PropertyBlendState.prototype;
  _proto3.blend = function blend(value, weight) {
    this.accumulatedWeight = mixAveragedVec3(this.result, this.result, this.accumulatedWeight, value, weight);
  };
  _proto3.reset = function reset() {
    this.accumulatedWeight = 0.0;
    Vec3.zero(this.result);
  };
  return LegacyVec3PropertyBlendState;
}();
var LegacyQuatPropertyBlendState = function () {
  function LegacyQuatPropertyBlendState() {
    this.refCount = 0;
    this.accumulatedWeight = 0.0;
    this.result = new Quat();
  }
  var _proto4 = LegacyQuatPropertyBlendState.prototype;
  _proto4.blend = function blend(value, weight) {
    this.accumulatedWeight = mixAveragedQuat(this.result, this.result, this.accumulatedWeight, value, weight);
  };
  _proto4.reset = function reset() {
    this.accumulatedWeight = 0.0;
    Quat.identity(this.result);
  };
  return LegacyQuatPropertyBlendState;
}();
var NodeBlendState = function () {
  function NodeBlendState() {
    this._transformApplyFlags = 0;
    this._properties = {};
  }
  var _proto5 = NodeBlendState.prototype;
  _proto5.refProperty = function refProperty(node, property) {
    var _properties$property, _properties$property2;
    var properties = this._properties;
    var propertyBlendState;
    switch (property) {
      default:
      case 'position':
      case 'scale':
      case 'eulerAngles':
        propertyBlendState = (_properties$property = properties[property]) !== null && _properties$property !== void 0 ? _properties$property : properties[property] = this._createVec3BlendState(node[property]);
        break;
      case 'rotation':
        propertyBlendState = (_properties$property2 = properties[property]) !== null && _properties$property2 !== void 0 ? _properties$property2 : properties[property] = this._createQuatBlendState(node.rotation);
        break;
    }
    ++propertyBlendState.refCount;
    return propertyBlendState;
  };
  _proto5.deRefProperty = function deRefProperty(property) {
    var properties = this._properties;
    var propertyBlendState = properties[property];
    if (!propertyBlendState) {
      return;
    }
    --propertyBlendState.refCount;
    if (propertyBlendState.refCount > 0) {
      return;
    }
    delete properties[property];
  };
  _proto5.apply = function apply(node) {
    var transformApplyFlags = this._transformApplyFlags,
      _this$_properties = this._properties,
      position = _this$_properties.position,
      scale = _this$_properties.scale,
      rotation = _this$_properties.rotation,
      eulerAngles = _this$_properties.eulerAngles;
    if (!transformApplyFlags) {
      return;
    }
    var t;
    var s;
    var r;
    if (position && transformApplyFlags & TransformApplyFlag.POSITION) {
      t = position.result;
    }
    if (scale && transformApplyFlags & TransformApplyFlag.SCALE) {
      s = scale.result;
    }
    if (eulerAngles && transformApplyFlags & TransformApplyFlag.EULER_ANGLES) {
      r = eulerAngles.result;
    }
    if (rotation && transformApplyFlags & TransformApplyFlag.ROTATION) {
      r = rotation.result;
    }
    if (r || t || s) {
      node.setRTS(r, t, s);
    }
    this._transformApplyFlags = 0;
  };
  return _createClass(NodeBlendState, [{
    key: "empty",
    get: function get() {
      var properties = this._properties;
      return !properties.position && !properties.rotation && !properties.eulerAngles && !properties.scale;
    }
  }]);
}();
var LegacyNodeBlendState = function (_NodeBlendState2) {
  function LegacyNodeBlendState() {
    return _NodeBlendState2.apply(this, arguments) || this;
  }
  _inheritsLoose(LegacyNodeBlendState, _NodeBlendState2);
  var _proto6 = LegacyNodeBlendState.prototype;
  _proto6.apply = function apply(node) {
    var _this$_properties2 = this._properties,
      position = _this$_properties2.position,
      scale = _this$_properties2.scale,
      rotation = _this$_properties2.rotation,
      eulerAngles = _this$_properties2.eulerAngles;
    if (position && position.accumulatedWeight) {
      this._transformApplyFlags |= TransformApplyFlag.POSITION;
      if (position.accumulatedWeight < 1.0) {
        position.blend(node.position, 1.0 - position.accumulatedWeight);
      }
    }
    if (scale && scale.accumulatedWeight) {
      this._transformApplyFlags |= TransformApplyFlag.SCALE;
      if (scale.accumulatedWeight < 1.0) {
        scale.blend(node.scale, 1.0 - scale.accumulatedWeight);
      }
    }
    if (eulerAngles && eulerAngles.accumulatedWeight) {
      this._transformApplyFlags |= TransformApplyFlag.EULER_ANGLES;
      if (eulerAngles.accumulatedWeight < 1.0) {
        eulerAngles.blend(node.eulerAngles, 1.0 - eulerAngles.accumulatedWeight);
      }
    }
    if (rotation && rotation.accumulatedWeight) {
      this._transformApplyFlags |= TransformApplyFlag.ROTATION;
      if (rotation.accumulatedWeight < 1.0) {
        rotation.blend(node.rotation, 1.0 - rotation.accumulatedWeight);
      }
    }
    _NodeBlendState2.prototype.apply.call(this, node);
    position == null ? void 0 : position.reset();
    scale == null ? void 0 : scale.reset();
    rotation == null ? void 0 : rotation.reset();
    eulerAngles == null ? void 0 : eulerAngles.reset();
  };
  _proto6._createVec3BlendState = function _createVec3BlendState(_currentValue) {
    return new LegacyVec3PropertyBlendState();
  };
  _proto6._createQuatBlendState = function _createQuatBlendState(_currentValue) {
    return new LegacyQuatPropertyBlendState();
  };
  return LegacyNodeBlendState;
}(NodeBlendState);
var LegacyBlendStateBuffer = function (_BlendStateBuffer2) {
  function LegacyBlendStateBuffer() {
    return _BlendStateBuffer2.apply(this, arguments) || this;
  }
  _inheritsLoose(LegacyBlendStateBuffer, _BlendStateBuffer2);
  var _proto7 = LegacyBlendStateBuffer.prototype;
  _proto7.createNodeBlendState = function createNodeBlendState() {
    return new LegacyNodeBlendState();
  };
  return LegacyBlendStateBuffer;
}(BlendStateBuffer);
function mixAveragedVec3(result, previous, accumulatedWeight, input, weight) {
  var newSum = accumulatedWeight + weight;
  if (weight === 1.0 && !accumulatedWeight) {
    Vec3.copy(result, input);
  } else if (newSum) {
    var t = weight / newSum;
    Vec3.lerp(result, result, input, t);
  }
  return newSum;
}
function mixAveragedQuat(result, previous, accumulatedWeight, input, weight) {
  var newSum = accumulatedWeight + weight;
  if (weight === 1.0 && !accumulatedWeight) {
    Quat.copy(result, input);
  } else if (newSum) {
    var t = weight / newSum;
    Quat.slerp(result, previous, input, t);
  }
  return newSum;
}

var _class, _AnimationManager;
var AnimationManager = ccclass$g(_class = (_AnimationManager = function (_System) {
  function AnimationManager() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _System.call.apply(_System, [this].concat(args)) || this;
    _this._anims = new MutableForwardIterator([]);
    _this._crossFades = new MutableForwardIterator([]);
    _this._delayEvents = [];
    _this._blendStateBuffer = new LegacyBlendStateBuffer();
    _this._sockets = [];
    return _this;
  }
  _inheritsLoose(AnimationManager, _System);
  var _proto = AnimationManager.prototype;
  _proto.addCrossFade = function addCrossFade(crossFade) {
    var index = this._crossFades.array.indexOf(crossFade);
    if (index === -1) {
      this._crossFades.push(crossFade);
    }
  };
  _proto.removeCrossFade = function removeCrossFade(crossFade) {
    var index = this._crossFades.array.indexOf(crossFade);
    if (index >= 0) {
      this._crossFades.fastRemoveAt(index);
    } else {
      errorID(3907);
    }
  };
  _proto.update = function update(dt) {
    var _delayEvents = this._delayEvents,
      crossFadesIter = this._crossFades,
      _sockets = this._sockets;
    {
      var crossFades = crossFadesIter.array;
      for (crossFadesIter.i = 0; crossFadesIter.i < crossFades.length; ++crossFadesIter.i) {
        var crossFade = crossFades[crossFadesIter.i];
        crossFade.update(dt);
      }
    }
    var iterator = this._anims;
    var array = iterator.array;
    for (iterator.i = 0; iterator.i < array.length; ++iterator.i) {
      var anim = array[iterator.i];
      if (!anim.isMotionless) {
        anim.update(dt);
      }
    }
    this._blendStateBuffer.apply();
    var stamp = director.getTotalFrames();
    for (var i = 0, l = _sockets.length; i < l; i++) {
      var _sockets$i = _sockets[i],
        target = _sockets$i.target,
        transform = _sockets$i.transform;
      target.matrix = getWorldMatrix(transform, stamp);
    }
    for (var _i = 0, _l = _delayEvents.length; _i < _l; _i++) {
      var event = _delayEvents[_i];
      event.fn.apply(event.thisArg, event.args);
    }
    _delayEvents.length = 0;
  };
  _proto.destruct = function destruct() {};
  _proto.addAnimation = function addAnimation(anim) {
    var index = this._anims.array.indexOf(anim);
    if (index === -1) {
      this._anims.push(anim);
    }
  };
  _proto.removeAnimation = function removeAnimation(anim) {
    var index = this._anims.array.indexOf(anim);
    if (index >= 0) {
      this._anims.fastRemoveAt(index);
    } else {
      errorID(3907);
    }
  };
  _proto.pushDelayEvent = function pushDelayEvent(fn, thisArg, args) {
    this._delayEvents.push({
      fn: fn,
      thisArg: thisArg,
      args: args
    });
  };
  _proto.addSockets = function addSockets(root, sockets) {
    var _this2 = this;
    var _loop = function _loop() {
      var socket = sockets[i];
      if (_this2._sockets.find(function (s) {
        return s.target === socket.target;
      })) {
        return 1;
      }
      var targetNode = root.getChildByPath(socket.path);
      var transform = socket.target && targetNode && getTransform(targetNode, root);
      if (transform) {
        _this2._sockets.push({
          target: socket.target,
          transform: transform
        });
      }
    };
    for (var i = 0; i < sockets.length; ++i) {
      if (_loop()) continue;
    }
  };
  _proto.removeSockets = function removeSockets(root, sockets) {
    for (var i = 0; i < sockets.length; ++i) {
      var socketToRemove = sockets[i];
      for (var j = 0; j < this._sockets.length; ++j) {
        var socket = this._sockets[j];
        if (socket.target === socketToRemove.target) {
          deleteTransform(socket.transform.node);
          this._sockets[j] = this._sockets[this._sockets.length - 1];
          this._sockets.length--;
          break;
        }
      }
    }
  };
  return _createClass(AnimationManager, [{
    key: "blendState",
    get: function get() {
      return this._blendStateBuffer;
    }
  }, {
    key: "animationStates",
    get: function get() {
      return this._anims.array;
    }
  }]);
}(System), _AnimationManager.ID = 'animation', _AnimationManager)) || _class;
director.on(DirectorEvent.INIT, function () {
  var animationManager = new AnimationManager();
  director.registerSystem(AnimationManager.ID, animationManager, SystemPriority.HIGH);
});
cclegacy.AnimationManager = AnimationManager;

export { AnimationClip, AnimationManager, AnimationState, animation };
//# sourceMappingURL=animation.js.map
