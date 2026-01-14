import { _ as _inheritsLoose, a as _createClass, b as _applyDecoratedDescriptor, E as Enum } from './gc-object-CShF5lzx.js';
import { c as ccclass, d as disallowMultiple, b as applyDecoratedInitializer, p as property, s as serializable, f as Vec3, t as type, R as Ray, h as toRadian, C as Color, m as Rect } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { C as CameraProjection, a as CameraFOVAxis, b as CameraAperture, c as CameraShutter, d as CameraISO, S as SkyBoxFlagValue, e as CameraType, T as TrackingType, R as RenderTexture } from './debug-view-BuNhRPv_.js';
import './prefab-DYg_oxpo.js';
import { T as TransformBit } from './scene-vWcxM1_c.js';
import { L as Layers, C as CAMERA_DEFAULT_MASK } from './pipeline-state-manager-C5U4ouGL.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import './device-manager-CBXP-ttm.js';
import { C as ClearFlagBit } from './buffer-barrier-BlQXg9Aa.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';

var _dec$1, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _PostProcess;
var PostProcess = (_dec$1 = ccclass('cc.PostProcess'), _dec$1(_class$1 = disallowMultiple(_class$1 = (_class2$1 = (_PostProcess = function (_Component) {
  function PostProcess() {
    var _this;
    _this = _Component.call(this) || this;
    _this.global = _initializer$1 && _initializer$1();
    _this._shadingScale = _initializer2$1 && _initializer2$1();
    _this.enableShadingScaleInEditor = _initializer3$1 && _initializer3$1();
    _this.settings = new Map();
    return _this;
  }
  _inheritsLoose(PostProcess, _Component);
  var _proto = PostProcess.prototype;
  _proto.addSetting = function addSetting(setting) {
    this.settings.set(setting.constructor, setting);
  };
  _proto.removeSetting = function removeSetting(setting) {
    this.settings["delete"](setting.constructor);
  };
  _proto.getSetting = function getSetting(ctor) {
    return this.settings.get(ctor);
  };
  _proto.onEnable = function onEnable() {
    PostProcess.all.push(this);
  };
  _proto.onDisable = function onDisable() {
    var idx = PostProcess.all.indexOf(this);
    if (idx !== -1) {
      PostProcess.all.splice(idx, 1);
    }
  };
  return _createClass(PostProcess, [{
    key: "shadingScale",
    get: function get() {
      return this._shadingScale;
    },
    set: function set(v) {
      this._shadingScale = v;
    }
  }]);
}(Component), _PostProcess.all = [], _PostProcess), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "global", [property, serializable], function () {
  return true;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_shadingScale", [serializable], function () {
  return 1;
}), _applyDecoratedDescriptor(_class2$1.prototype, "shadingScale", [property], Object.getOwnPropertyDescriptor(_class2$1.prototype, "shadingScale"), _class2$1.prototype), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "enableShadingScaleInEditor", [property, serializable], function () {
  return false;
}), _class2$1)) || _class$1) || _class$1);

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _initializer20, _Camera;
var _temp_vec3_1 = new Vec3();
var ProjectionType = Enum(CameraProjection);
var FOVAxis = Enum(CameraFOVAxis);
var Aperture = Enum(CameraAperture);
var Shutter = Enum(CameraShutter);
var ISO = Enum(CameraISO);
var ClearFlag = Enum({
  SKYBOX: SkyBoxFlagValue.VALUE | ClearFlagBit.DEPTH_STENCIL,
  SOLID_COLOR: ClearFlagBit.ALL,
  DEPTH_ONLY: ClearFlagBit.DEPTH_STENCIL,
  DONT_CLEAR: ClearFlagBit.NONE
});
var CameraEvent;
(function (CameraEvent) {
  CameraEvent["TARGET_TEXTURE_CHANGE"] = "tex-change";
})(CameraEvent || (CameraEvent = {}));
var Camera = (_dec = ccclass('cc.Camera'), _dec2 = type(Layers.BitMask), _dec3 = type(ClearFlag), _dec4 = type(ProjectionType), _dec5 = type(FOVAxis), _dec6 = type(Aperture), _dec7 = type(Shutter), _dec8 = type(ISO), _dec9 = type(RenderTexture), _dec0 = type(PostProcess), _dec(_class = (_class2 = (_Camera = function (_Component) {
  function Camera() {
    var _this;
    _this = _Component.call(this) || this;
    _this._projection = _initializer && _initializer();
    _this._priority = _initializer2 && _initializer2();
    _this._fov = _initializer3 && _initializer3();
    _this._fovAxis = _initializer4 && _initializer4();
    _this._orthoHeight = _initializer5 && _initializer5();
    _this._near = _initializer6 && _initializer6();
    _this._far = _initializer7 && _initializer7();
    _this._color = _initializer8 && _initializer8();
    _this._depth = _initializer9 && _initializer9();
    _this._stencil = _initializer0 && _initializer0();
    _this._clearFlags = _initializer1 && _initializer1();
    _this._rect = _initializer10 && _initializer10();
    _this._aperture = _initializer11 && _initializer11();
    _this._shutter = _initializer12 && _initializer12();
    _this._iso = _initializer13 && _initializer13();
    _this._screenScale = _initializer14 && _initializer14();
    _this._visibility = _initializer15 && _initializer15();
    _this._targetTexture = _initializer16 && _initializer16();
    _this._postProcess = _initializer17 && _initializer17();
    _this._usePostProcess = _initializer18 && _initializer18();
    _this._camera = null;
    _this._inEditorMode = false;
    _this._flows = undefined;
    _this._cameraType = _initializer19 && _initializer19();
    _this._trackingType = _initializer20 && _initializer20();
    return _this;
  }
  _inheritsLoose(Camera, _Component);
  var _proto = Camera.prototype;
  _proto.onLoad = function onLoad() {
    this._createCamera();
  };
  _proto.onEnable = function onEnable() {
    this.node.hasChangedFlags |= TransformBit.POSITION;
    if (this._camera) {
      this._attachToScene();
    }
  };
  _proto.onDisable = function onDisable() {
    if (this._camera) {
      this._detachFromScene();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._camera) {
      this._camera.destroy();
      this._camera = null;
    }
    if (this._targetTexture) {
      this._targetTexture.off('resize');
    }
  };
  _proto.screenPointToRay = function screenPointToRay(x, y, out) {
    if (!out) {
      out = Ray.create();
    }
    if (this._camera) {
      this._camera.screenPointToRay(out, x, y);
    }
    return out;
  };
  _proto.worldToScreen = function worldToScreen(worldPos, out) {
    if (!out) {
      out = new Vec3();
    }
    if (this._camera) {
      this._camera.worldToScreen(out, worldPos);
    }
    return out;
  };
  _proto.screenToWorld = function screenToWorld(screenPos, out) {
    if (!out) {
      out = this.node.getWorldPosition();
    }
    if (this._camera) {
      this._camera.screenToWorld(out, screenPos);
    }
    return out;
  };
  _proto.convertToUINode = function convertToUINode(wpos, uiNode, out) {
    if (!out) {
      out = new Vec3();
    }
    if (!this._camera) {
      return out;
    }
    this.worldToScreen(wpos, _temp_vec3_1);
    var cmp = uiNode.getComponent('cc.UITransform');
    var view = cclegacy.view;
    var designSize = view.getVisibleSize();
    var xoffset = _temp_vec3_1.x - this._camera.width * 0.5;
    var yoffset = _temp_vec3_1.y - this._camera.height * 0.5;
    _temp_vec3_1.x = xoffset / view.getScaleX() + designSize.width * 0.5;
    _temp_vec3_1.y = yoffset / view.getScaleY() + designSize.height * 0.5;
    if (cmp) {
      cmp.convertToNodeSpaceAR(_temp_vec3_1, out);
    }
    return out;
  };
  _proto._createCamera = function _createCamera() {
    if (!this._camera) {
      this._camera = cclegacy.director.root.createCamera();
      this._camera.initialize({
        name: this.node.name,
        node: this.node,
        projection: this._projection,
        window: this._inEditorMode ? cclegacy.director.root && cclegacy.director.root.mainWindow : cclegacy.director.root && cclegacy.director.root.tempWindow,
        priority: this._priority,
        cameraType: this.cameraType,
        trackingType: this.trackingType
      });
      this._camera.setViewportInOrientedSpace(this._rect);
      this._camera.fovAxis = this._fovAxis;
      this._camera.fov = toRadian(this._fov);
      this._camera.orthoHeight = this._orthoHeight;
      this._camera.nearClip = this._near;
      this._camera.farClip = this._far;
      this._camera.clearColor = this._color;
      this._camera.clearDepth = this._depth;
      this._camera.clearStencil = this._stencil;
      this._camera.clearFlag = this._clearFlags;
      this._camera.visibility = this._visibility;
      this._camera.aperture = this._aperture;
      this._camera.shutter = this._shutter;
      this._camera.iso = this._iso;
      this._camera.postProcess = this._postProcess;
      this._camera.usePostProcess = this._usePostProcess;
      this._camera.update();
    }
    this._updateTargetTexture();
  };
  _proto._attachToScene = function _attachToScene() {
    if (!this.node.scene || !this._camera) {
      return;
    }
    if (this._camera && this._camera.scene) {
      this._camera.scene.removeCamera(this._camera);
    }
    var rs = this._getRenderScene();
    rs.addCamera(this._camera);
  };
  _proto._detachFromScene = function _detachFromScene() {
    if (this._camera && this._camera.scene) {
      this._camera.scene.removeCamera(this._camera);
    }
  };
  _proto._checkTargetTextureEvent = function _checkTargetTextureEvent(old) {
    var _this2 = this;
    if (old) {
      old.off('resize');
    }
    if (this._targetTexture) {
      this._targetTexture.on('resize', function (window) {
        if (_this2._camera) {
          _this2._camera.setFixedSize(window.width, window.height);
        }
      }, this);
    }
  };
  _proto._updateTargetTexture = function _updateTargetTexture() {
    if (!this._camera) {
      return;
    }
    if (this._targetTexture) {
      var window = this._targetTexture.window;
      this._camera.changeTargetWindow(window);
      this._camera.setFixedSize(window.width, window.height);
    }
  };
  return _createClass(Camera, [{
    key: "camera",
    get: function get() {
      return this._camera;
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    },
    set: function set(val) {
      this._priority = val;
      if (this._camera) {
        this._camera.priority = val;
      }
    }
  }, {
    key: "visibility",
    get: function get() {
      return this._visibility;
    },
    set: function set(val) {
      this._visibility = val;
      if (this._camera) {
        this._camera.visibility = val;
      }
    }
  }, {
    key: "clearFlags",
    get: function get() {
      return this._clearFlags;
    },
    set: function set(val) {
      this._clearFlags = val;
      if (this._camera) {
        this._camera.clearFlag = val;
      }
    }
  }, {
    key: "clearColor",
    get: function get() {
      return this._color;
    },
    set: function set(val) {
      this._color.set(val);
      if (this._camera) {
        this._camera.clearColor = this._color;
      }
    }
  }, {
    key: "clearDepth",
    get: function get() {
      return this._depth;
    },
    set: function set(val) {
      this._depth = val;
      if (this._camera) {
        this._camera.clearDepth = val;
      }
    }
  }, {
    key: "clearStencil",
    get: function get() {
      return this._stencil;
    },
    set: function set(val) {
      this._stencil = val;
      if (this._camera) {
        this._camera.clearStencil = val;
      }
    }
  }, {
    key: "projection",
    get: function get() {
      return this._projection;
    },
    set: function set(val) {
      this._projection = val;
      if (this._camera) {
        this._camera.projectionType = val;
      }
    }
  }, {
    key: "fovAxis",
    get: function get() {
      return this._fovAxis;
    },
    set: function set(val) {
      if (val === this._fovAxis) {
        return;
      }
      this._fovAxis = val;
      if (this._camera) {
        this._camera.fovAxis = val;
        if (val === CameraFOVAxis.VERTICAL) {
          this.fov = this._fov * this._camera.aspect;
        } else {
          this.fov = this._fov / this._camera.aspect;
        }
      }
    }
  }, {
    key: "fov",
    get: function get() {
      return this._fov;
    },
    set: function set(val) {
      this._fov = val;
      if (this._camera) {
        this._camera.fov = toRadian(val);
      }
    }
  }, {
    key: "orthoHeight",
    get: function get() {
      return this._orthoHeight;
    },
    set: function set(val) {
      this._orthoHeight = val;
      if (this._camera) {
        this._camera.orthoHeight = val;
      }
    }
  }, {
    key: "near",
    get: function get() {
      return this._near;
    },
    set: function set(val) {
      this._near = val;
      if (this._camera) {
        this._camera.nearClip = val;
      }
    }
  }, {
    key: "far",
    get: function get() {
      return this._far;
    },
    set: function set(val) {
      this._far = val;
      if (this._camera) {
        this._camera.farClip = val;
      }
    }
  }, {
    key: "aperture",
    get: function get() {
      return this._aperture;
    },
    set: function set(val) {
      this._aperture = val;
      if (this._camera) {
        this._camera.aperture = val;
      }
    }
  }, {
    key: "shutter",
    get: function get() {
      return this._shutter;
    },
    set: function set(val) {
      this._shutter = val;
      if (this._camera) {
        this._camera.shutter = val;
      }
    }
  }, {
    key: "iso",
    get: function get() {
      return this._iso;
    },
    set: function set(val) {
      this._iso = val;
      if (this._camera) {
        this._camera.iso = val;
      }
    }
  }, {
    key: "rect",
    get: function get() {
      return this._rect;
    },
    set: function set(val) {
      this._rect = val;
      if (this._camera) {
        this._camera.setViewportInOrientedSpace(val);
      }
    }
  }, {
    key: "targetTexture",
    get: function get() {
      return this._targetTexture;
    },
    set: function set(value) {
      if (this._targetTexture === value) {
        return;
      }
      var old = this._targetTexture;
      this._targetTexture = value;
      this._checkTargetTextureEvent(old);
      this._updateTargetTexture();
      if (!value && this._camera) {
        this._camera.changeTargetWindow(null);
        this._camera.isWindowSize = true;
      }
      this.node.emit(CameraEvent.TARGET_TEXTURE_CHANGE, this);
    }
  }, {
    key: "usePostProcess",
    get: function get() {
      return this._usePostProcess;
    },
    set: function set(v) {
      this._usePostProcess = v;
      if (this._camera) {
        this._camera.usePostProcess = v;
      }
    }
  }, {
    key: "postProcess",
    get: function get() {
      return this._postProcess;
    },
    set: function set(v) {
      this._postProcess = v;
      if (this._camera) {
        this._camera.postProcess = v;
      }
    }
  }, {
    key: "screenScale",
    get: function get() {
      return this._screenScale;
    },
    set: function set(val) {
      this._screenScale = val;
      if (this._camera) {
        this._camera.screenScale = val;
      }
    }
  }, {
    key: "inEditorMode",
    get: function get() {
      return this._inEditorMode;
    },
    set: function set(value) {
      this._inEditorMode = value;
      if (this._camera) {
        var root = cclegacy.director.root;
        this._camera.changeTargetWindow(value ? root && root.mainWindow : root && root.tempWindow);
      }
    }
  }, {
    key: "cameraType",
    get: function get() {
      return this._cameraType;
    },
    set: function set(val) {
      if (this._cameraType === val) {
        return;
      }
      this._cameraType = val;
      if (this.camera) {
        this.camera.cameraType = val;
      }
    }
  }, {
    key: "trackingType",
    get: function get() {
      return this._trackingType;
    },
    set: function set(val) {
      if (this._trackingType === val) {
        return;
      }
      this._trackingType = val;
      if (this.camera) {
        this.camera.trackingType = val;
      }
    }
  }]);
}(Component), _Camera.ProjectionType = ProjectionType, _Camera.FOVAxis = FOVAxis, _Camera.ClearFlag = ClearFlag, _Camera.Aperture = Aperture, _Camera.Shutter = Shutter, _Camera.ISO = ISO, _Camera.TARGET_TEXTURE_CHANGE = CameraEvent.TARGET_TEXTURE_CHANGE, _Camera), _initializer = applyDecoratedInitializer(_class2.prototype, "_projection", [serializable], function () {
  return ProjectionType.PERSPECTIVE;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_priority", [serializable], function () {
  return 0;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_fov", [serializable], function () {
  return 45;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_fovAxis", [serializable], function () {
  return FOVAxis.VERTICAL;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_orthoHeight", [serializable], function () {
  return 10;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_near", [serializable], function () {
  return 1;
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "_far", [serializable], function () {
  return 1000;
}), _initializer8 = applyDecoratedInitializer(_class2.prototype, "_color", [serializable], function () {
  return new Color('#333333');
}), _initializer9 = applyDecoratedInitializer(_class2.prototype, "_depth", [serializable], function () {
  return 1;
}), _initializer0 = applyDecoratedInitializer(_class2.prototype, "_stencil", [serializable], function () {
  return 0;
}), _initializer1 = applyDecoratedInitializer(_class2.prototype, "_clearFlags", [serializable], function () {
  return ClearFlag.SOLID_COLOR;
}), _initializer10 = applyDecoratedInitializer(_class2.prototype, "_rect", [serializable], function () {
  return new Rect(0, 0, 1, 1);
}), _initializer11 = applyDecoratedInitializer(_class2.prototype, "_aperture", [serializable], function () {
  return Aperture.F16_0;
}), _initializer12 = applyDecoratedInitializer(_class2.prototype, "_shutter", [serializable], function () {
  return Shutter.D125;
}), _initializer13 = applyDecoratedInitializer(_class2.prototype, "_iso", [serializable], function () {
  return ISO.ISO100;
}), _initializer14 = applyDecoratedInitializer(_class2.prototype, "_screenScale", [serializable], function () {
  return 1;
}), _initializer15 = applyDecoratedInitializer(_class2.prototype, "_visibility", [serializable], function () {
  return CAMERA_DEFAULT_MASK;
}), _initializer16 = applyDecoratedInitializer(_class2.prototype, "_targetTexture", [serializable], function () {
  return null;
}), _initializer17 = applyDecoratedInitializer(_class2.prototype, "_postProcess", [serializable], function () {
  return null;
}), _initializer18 = applyDecoratedInitializer(_class2.prototype, "_usePostProcess", [serializable], function () {
  return false;
}), _initializer19 = applyDecoratedInitializer(_class2.prototype, "_cameraType", [serializable], function () {
  return CameraType.DEFAULT;
}), _initializer20 = applyDecoratedInitializer(_class2.prototype, "_trackingType", [serializable], function () {
  return TrackingType.NO_TRACKING;
}), _applyDecoratedDescriptor(_class2.prototype, "visibility", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "visibility"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "clearFlags", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "clearFlags"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "projection", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "projection"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "fovAxis", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "fovAxis"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "aperture", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "aperture"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "shutter", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "shutter"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "iso", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "iso"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "targetTexture", [_dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "targetTexture"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "usePostProcess", [property], Object.getOwnPropertyDescriptor(_class2.prototype, "usePostProcess"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "postProcess", [_dec0], Object.getOwnPropertyDescriptor(_class2.prototype, "postProcess"), _class2.prototype), _class2)) || _class);
cclegacy.Camera = Camera;

export { Camera as C, PostProcess as P, CameraEvent as a };
//# sourceMappingURL=camera-component-BFt9vSC_.js.map
