import { J as JointTexturePool, a as JointAnimationInfo, S as SkelAnimDataHub, b as SkinnedMeshRenderer, g as getWorldTransformUntilRoot } from './deprecated-BJz7DUMw.js';
import { M as Mat4, f as Vec3, Q as Quat, c as ccclass, t as type, b as applyDecoratedInitializer, s as serializable, l as executionOrder } from './index-uXI1_UMk.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { _ as _inheritsLoose, m as setClassAlias, e as warn, o as assertIsTrue, a as _createClass, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { A as AnimationState, g as getGlobalAnimationManager, a as Animation } from './animation-component-DyCWmzfU.js';
import { N as Node } from './scene-vWcxM1_c.js';
import './skeleton-CBhmWmEt.js';
import './node-event-Ccvtv8bJ.js';
import './buffer-barrier-BlQXg9Aa.js';
import './mesh-renderer-CdPG3X-W.js';
import './mesh-XWfHgs1t.js';
import './debug-view-BuNhRPv_.js';
import './device-manager-CBXP-ttm.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './wasm-web-BpK36a26.js';
import './deprecated-Dswa7XeN.js';
import './director-F7e_Lqjg.js';
import './prefab-DYg_oxpo.js';
import './touch-BKrZ-fxl.js';
import './deprecated-n0w4kK7g.js';
import './zlib.min-3VC1ush6.js';
import './deprecated-CN-RjLP6.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';

var DataPoolManager = function () {
  function DataPoolManager(device) {
    this.jointTexturePool = void 0;
    this.jointAnimationInfo = void 0;
    this.jointTexturePool = new JointTexturePool(device);
    this.jointAnimationInfo = new JointAnimationInfo(device);
  }
  var _proto = DataPoolManager.prototype;
  _proto.releaseSkeleton = function releaseSkeleton(skeleton) {
    this.jointTexturePool.releaseSkeleton(skeleton);
  };
  _proto.releaseAnimationClip = function releaseAnimationClip(clip) {
    this.jointTexturePool.releaseAnimationClip(clip);
  };
  _proto.clear = function clear() {
    this.jointTexturePool.clear();
    this.jointAnimationInfo.clear();
  };
  return DataPoolManager;
}();
cclegacy.internal.DataPoolManager = DataPoolManager;

var m4_1$1 = new Mat4();
var m4_2$1 = new Mat4();
var SkeletalAnimationState = function (_AnimationState) {
  function SkeletalAnimationState(clip, name) {
    var _this;
    if (name === void 0) {
      name = '';
    }
    _this = _AnimationState.call(this, clip, name) || this;
    _this._frames = 1;
    _this._bakedDuration = 0;
    _this._animInfo = null;
    _this._sockets = [];
    _this._animInfoMgr = void 0;
    _this._parent = null;
    _this._curvesInited = false;
    _this._animInfoMgr = cclegacy.director.root.dataPoolManager.jointAnimationInfo;
    return _this;
  }
  _inheritsLoose(SkeletalAnimationState, _AnimationState);
  var _proto = SkeletalAnimationState.prototype;
  _proto.initialize = function initialize(root) {
    if (this._curveLoaded) {
      return;
    }
    this._parent = root.getComponent('cc.SkeletalAnimation');
    var baked = this._parent.useBakedAnimation;
    this._doNotCreateEval = baked;
    _AnimationState.prototype.initialize.call(this, root);
    this._curvesInited = !baked;
    var _SkelAnimDataHub$getO = SkelAnimDataHub.getOrExtract(this.clip),
      frames = _SkelAnimDataHub$getO.frames,
      samples = _SkelAnimDataHub$getO.samples;
    this._frames = frames - 1;
    this._animInfo = this._animInfoMgr.getData(root.uuid);
    this._bakedDuration = this._frames / samples;
    this.setUseBaked(baked);
  };
  _proto.onPlay = function onPlay() {
    var _this2 = this;
    _AnimationState.prototype.onPlay.call(this);
    var baked = this._parent.useBakedAnimation;
    if (baked) {
      this._animInfoMgr.switchClip(this._animInfo, this.clip);
      var users = this._parent.getUsers();
      users.forEach(function (user) {
        user.uploadAnimation(_this2.clip);
      });
    }
  };
  _proto.setUseBaked = function setUseBaked(useBaked) {
    if (useBaked) {
      this._sampleCurves = this._sampleCurvesBaked;
      this.duration = this._bakedDuration;
    } else {
      this._sampleCurves = _AnimationState.prototype._sampleCurves;
      this.duration = this.clip.duration;
      if (!this._curvesInited) {
        this._curveLoaded = false;
        _AnimationState.prototype.initialize.call(this, this._targetNode);
        this._curvesInited = true;
      }
    }
  };
  _proto.rebuildSocketCurves = function rebuildSocketCurves(sockets) {
    this._sockets.length = 0;
    if (!this._targetNode) {
      return;
    }
    var root = this._targetNode;
    for (var i = 0; i < sockets.length; ++i) {
      var socket = sockets[i];
      var targetNode = root.getChildByPath(socket.path);
      if (!socket.target) {
        continue;
      }
      var clipData = SkelAnimDataHub.getOrExtract(this.clip);
      var animPath = socket.path;
      var source = clipData.joints[animPath];
      var animNode = targetNode;
      var downstream = void 0;
      while (!source) {
        var idx = animPath.lastIndexOf('/');
        animPath = animPath.substring(0, idx);
        source = clipData.joints[animPath];
        if (animNode) {
          if (!downstream) {
            downstream = Mat4.identity(m4_2$1);
          }
          Mat4.fromRTS(m4_1$1, animNode.rotation, animNode.position, animNode.scale);
          Mat4.multiply(downstream, m4_1$1, downstream);
          animNode = animNode.parent;
        }
        if (idx < 0) {
          break;
        }
      }
      var curveData = source && source.transforms;
      var frames = clipData.frames;
      var transforms = [];
      for (var f = 0; f < frames; f++) {
        var mat = void 0;
        if (curveData && downstream) {
          mat = Mat4.multiply(m4_1$1, curveData[f], downstream);
        } else if (curveData) {
          mat = curveData[f];
        } else if (downstream) {
          mat = downstream;
        } else {
          mat = new Mat4();
        }
        var tfm = {
          pos: new Vec3(),
          rot: new Quat(),
          scale: new Vec3()
        };
        Mat4.toSRT(mat, tfm.rot, tfm.pos, tfm.scale);
        transforms.push(tfm);
      }
      this._sockets.push({
        target: socket.target,
        frames: transforms
      });
    }
  };
  _proto._sampleCurvesBaked = function _sampleCurvesBaked(time) {
    var ratio = time / this.duration;
    var info = this._animInfo;
    var clip = this.clip;
    if (info.currentClip !== clip) {
      this._animInfoMgr.switchClip(this._animInfo, clip);
      var users = this._parent.getUsers();
      users.forEach(function (user) {
        user.uploadAnimation(clip);
      });
      info.data[0] = -1;
    }
    var curFrame = ratio * this._frames + 0.5 | 0;
    if (curFrame === info.data[0]) {
      return;
    }
    info.data[0] = curFrame;
    info.dirty = true;
    for (var i = 0; i < this._sockets.length; ++i) {
      var _this$_sockets$i = this._sockets[i],
        target = _this$_sockets$i.target,
        frames = _this$_sockets$i.frames;
      var _frames$curFrame = frames[curFrame],
        pos = _frames$curFrame.pos,
        rot = _frames$curFrame.rot,
        scale = _frames$curFrame.scale;
      target.setRTS(rot, pos, scale);
    }
  };
  return SkeletalAnimationState;
}(AnimationState);

var _dec, _dec2, _class, _class2, _initializer, _initializer2, _dec3, _dec4, _dec5, _dec6, _class3, _class4, _initializer3, _initializer4, _SkeletalAnimation;
var Socket = (_dec = ccclass('cc.SkeletalAnimation.Socket'), _dec2 = type(Node), _dec(_class = (_class2 = function Socket(path, target) {
  if (path === void 0) {
    path = '';
  }
  if (target === void 0) {
    target = null;
  }
  this.path = _initializer && _initializer();
  this.target = _initializer2 && _initializer2();
  this.path = path;
  this.target = target;
}, _initializer = applyDecoratedInitializer(_class2.prototype, "path", [serializable], function () {
  return '';
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "target", [_dec2], function () {
  return null;
}), _class2)) || _class);
setClassAlias(Socket, 'cc.SkeletalAnimationComponent.Socket');
var m4_1 = new Mat4();
var m4_2 = new Mat4();
function collectRecursively(node, prefix, out) {
  if (prefix === void 0) {
    prefix = '';
  }
  if (out === void 0) {
    out = [];
  }
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    if (!child) {
      continue;
    }
    var path = prefix ? prefix + "/" + child.name : child.name;
    out.push(path);
    collectRecursively(child, path, out);
  }
  return out;
}
var SkeletalAnimation = (_dec3 = ccclass('cc.SkeletalAnimation'), _dec4 = executionOrder(99), _dec5 = type([Socket]), _dec6 = type([Socket]), _dec3(_class3 = _dec4(_class3 = (_class4 = (_SkeletalAnimation = function (_Animation) {
  function SkeletalAnimation() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Animation.call.apply(_Animation, [this].concat(args)) || this;
    _this._useBakedAnimation = _initializer3 && _initializer3();
    _this._sockets = _initializer4 && _initializer4();
    _this._users = new Set();
    _this._currentBakedState = null;
    return _this;
  }
  _inheritsLoose(SkeletalAnimation, _Animation);
  var _proto = SkeletalAnimation.prototype;
  _proto.onLoad = function onLoad() {
    _Animation.prototype.onLoad.call(this);
    var comps = this.node.getComponentsInChildren(SkinnedMeshRenderer);
    for (var i = 0; i < comps.length; ++i) {
      var comp = comps[i];
      if (comp.skinningRoot === this.node) {
        this.notifySkinnedMeshAdded(comp);
      }
    }
  };
  _proto.onDestroy = function onDestroy() {
    _Animation.prototype.onDestroy.call(this);
    cclegacy.director.root.dataPoolManager.jointAnimationInfo.destroy(this.node.uuid);
    getGlobalAnimationManager().removeSockets(this.node, this._sockets);
    this._removeAllUsers();
  };
  _proto.onEnable = function onEnable() {
    var _this$_currentBakedSt;
    _Animation.prototype.onEnable.call(this);
    (_this$_currentBakedSt = this._currentBakedState) == null ? void 0 : _this$_currentBakedSt.resume();
  };
  _proto.onDisable = function onDisable() {
    var _this$_currentBakedSt2;
    _Animation.prototype.onDisable.call(this);
    (_this$_currentBakedSt2 = this._currentBakedState) == null ? void 0 : _this$_currentBakedSt2.pause();
  };
  _proto.start = function start() {
    this.sockets = this._sockets;
    this._applyBakeFlagChange();
    _Animation.prototype.start.call(this);
  };
  _proto.pause = function pause() {
    if (!this._useBakedEffectively) {
      _Animation.prototype.pause.call(this);
    } else {
      var _this$_currentBakedSt3;
      (_this$_currentBakedSt3 = this._currentBakedState) == null ? void 0 : _this$_currentBakedSt3.pause();
    }
  };
  _proto.resume = function resume() {
    if (!this._useBakedEffectively) {
      _Animation.prototype.resume.call(this);
    } else {
      var _this$_currentBakedSt4;
      (_this$_currentBakedSt4 = this._currentBakedState) == null ? void 0 : _this$_currentBakedSt4.resume();
    }
  };
  _proto.stop = function stop() {
    if (!this._useBakedEffectively) {
      _Animation.prototype.stop.call(this);
    } else if (this._currentBakedState) {
      this._currentBakedState.stop();
      this._currentBakedState = null;
    }
  };
  _proto.querySockets = function querySockets() {
    var animPaths = this._defaultClip && Object.keys(SkelAnimDataHub.getOrExtract(this._defaultClip).joints).sort().reduce(function (acc, cur) {
      return cur.startsWith(acc[acc.length - 1] + "/") ? acc : (acc.push(cur), acc);
    }, []) || [];
    if (!animPaths.length) {
      return ['please specify a valid default animation clip first'];
    }
    var out = [];
    for (var i = 0; i < animPaths.length; i++) {
      var path = animPaths[i];
      var node = this.node.getChildByPath(path);
      if (!node) {
        continue;
      }
      out.push(path);
      collectRecursively(node, path, out);
    }
    return out;
  };
  _proto.rebuildSocketAnimations = function rebuildSocketAnimations() {
    var _this2 = this;
    this._sockets.forEach(function (socket) {
      var joint = _this2.node.getChildByPath(socket.path);
      var target = socket.target;
      if (joint && target) {
        target.name = socket.path.substring(socket.path.lastIndexOf('/') + 1) + " Socket";
        target.parent = _this2.node;
        getWorldTransformUntilRoot(joint, _this2.node, m4_1);
        Mat4.fromRTS(m4_2, target.rotation, target.position, target.scale);
        if (!Mat4.equals(m4_2, m4_1)) {
          target.matrix = m4_1;
        }
      }
    });
    for (var stateName in this._nameToState) {
      var state = this._nameToState[stateName];
      state.rebuildSocketCurves(this._sockets);
    }
  };
  _proto.createSocket = function createSocket(path) {
    var socket = this._sockets.find(function (s) {
      return s.path === path;
    });
    if (socket) {
      return socket.target;
    }
    var joint = this.node.getChildByPath(path);
    if (!joint) {
      warn('illegal socket path');
      return null;
    }
    var target = new Node();
    target.parent = this.node;
    this._sockets.push(new Socket(path, target));
    this.rebuildSocketAnimations();
    return target;
  };
  _proto.notifySkinnedMeshAdded = function notifySkinnedMeshAdded(skinnedMeshRenderer) {
    var _useBakedEffectively = this._useBakedEffectively;
    var formerBound = skinnedMeshRenderer.associatedAnimation;
    if (formerBound) {
      formerBound._users["delete"](skinnedMeshRenderer);
    }
    skinnedMeshRenderer.associatedAnimation = this;
    skinnedMeshRenderer.setUseBakedAnimation(_useBakedEffectively, true);
    if (_useBakedEffectively) {
      var playingState = this._currentBakedState;
      if (playingState) {
        skinnedMeshRenderer.uploadAnimation(playingState.clip);
      }
    }
    this._users.add(skinnedMeshRenderer);
  };
  _proto.notifySkinnedMeshRemoved = function notifySkinnedMeshRemoved(skinnedMeshRenderer) {
    assertIsTrue(skinnedMeshRenderer.associatedAnimation === this || skinnedMeshRenderer.associatedAnimation === null);
    skinnedMeshRenderer.setUseBakedAnimation(false);
    skinnedMeshRenderer.associatedAnimation = null;
    this._users["delete"](skinnedMeshRenderer);
  };
  _proto.getUsers = function getUsers() {
    return this._users;
  };
  _proto._createState = function _createState(clip, name) {
    return new SkeletalAnimationState(clip, name);
  };
  _proto._doCreateState = function _doCreateState(clip, name) {
    var state = _Animation.prototype._doCreateState.call(this, clip, name);
    state.rebuildSocketCurves(this._sockets);
    return state;
  };
  _proto.doPlayOrCrossFade = function doPlayOrCrossFade(state, duration) {
    if (this._useBakedEffectively) {
      if (this._currentBakedState) {
        this._currentBakedState.stop();
      }
      var skeletalAnimationState = state;
      this._currentBakedState = skeletalAnimationState;
      skeletalAnimationState.play();
    } else {
      _Animation.prototype.doPlayOrCrossFade.call(this, state, duration);
    }
  };
  _proto._removeAllUsers = function _removeAllUsers() {
    var _this3 = this;
    Array.from(this._users).forEach(function (user) {
      _this3.notifySkinnedMeshRemoved(user);
    });
  };
  _proto._applyBakeFlagChange = function _applyBakeFlagChange() {
    var useBakedEffectively = this._useBakedEffectively;
    for (var stateName in this._nameToState) {
      var state = this._nameToState[stateName];
      state.setUseBaked(useBakedEffectively);
    }
    this._users.forEach(function (user) {
      user.setUseBakedAnimation(useBakedEffectively);
    });
    if (useBakedEffectively) {
      getGlobalAnimationManager().removeSockets(this.node, this._sockets);
    } else {
      getGlobalAnimationManager().addSockets(this.node, this._sockets);
      this._currentBakedState = null;
    }
    this._setSkeletonTransformEnabled(!useBakedEffectively);
  };
  _proto._setSkeletonTransformEnabled = function _setSkeletonTransformEnabled(enabled) {
    var _this4 = this;
    this.node.children.forEach(function (child) {
      if (!_this4._sockets.find(function (socket) {
        return socket.target === child;
      })) {
        child.isSkipTransformUpdate = !enabled;
      }
    });
  };
  return _createClass(SkeletalAnimation, [{
    key: "sockets",
    get: function get() {
      return this._sockets;
    },
    set: function set(val) {
      if (!this._useBakedEffectively) {
        var animMgr = getGlobalAnimationManager();
        animMgr.removeSockets(this.node, this._sockets);
        animMgr.addSockets(this.node, val);
      }
      this._sockets = val;
      this.rebuildSocketAnimations();
    }
  }, {
    key: "useBakedAnimation",
    get: function get() {
      return this._useBakedAnimation;
    },
    set: function set(value) {
      this._useBakedAnimation = value;
      this._applyBakeFlagChange();
    }
  }, {
    key: "_useBakedEffectively",
    get: function get() {
      {
        return this._useBakedAnimation;
      }
    }
  }]);
}(Animation), _SkeletalAnimation.Socket = Socket, _SkeletalAnimation), _applyDecoratedDescriptor(_class4.prototype, "sockets", [_dec5], Object.getOwnPropertyDescriptor(_class4.prototype, "sockets"), _class4.prototype), _initializer3 = applyDecoratedInitializer(_class4.prototype, "_useBakedAnimation", [serializable], function () {
  return true;
}), _initializer4 = applyDecoratedInitializer(_class4.prototype, "_sockets", [_dec6], function () {
  return [];
}), _class4)) || _class3) || _class3);

cclegacy.SkeletalAnimationComponent = SkeletalAnimation;
setClassAlias(SkeletalAnimation, 'cc.SkeletalAnimationComponent');

export { SkelAnimDataHub, SkeletalAnimation, SkeletalAnimation as SkeletalAnimationComponent, SkeletalAnimationState, Socket };
//# sourceMappingURL=skeletal-animation.js.map
