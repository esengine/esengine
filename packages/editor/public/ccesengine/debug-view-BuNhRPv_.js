import { a as _createClass, w as warnID, _ as _inheritsLoose, k as errorID, J as CachedArray, n as EventTarget } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { C as ClearFlagBit, bc as SurfaceTransform, ac as Color, a6 as ColorAttachment, F as Format, a7 as DepthStencilAttachment, a9 as RenderPassInfo, a0 as TextureFlagBit, aM as GeneralBarrierInfo, al as AccessFlagBit, J as BufferTextureCopy, ab as FormatType, x as FormatInfos, A as Attribute, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, a as AttributeName, I as InputAssemblerInfo } from './buffer-barrier-BlQXg9Aa.js';
import { u as v3, w as mat4, m as Rect, M as Mat4, q as preTransforms, f as Vec3, R as Ray, ab as lerp, g as Vec4, h as toRadian, y as rect, b2 as Frustum, c as ccclass, a as clamp, J as AABB, V as Vec2, Q as Quat, C as Color$1, a6 as quat, j as removeProperty, i as replaceProperty, n as sys, K as halfToFloat, b as applyDecoratedInitializer, s as serializable } from './index-uXI1_UMk.js';
import { C as CAMERA_DEFAULT_MASK } from './pipeline-state-manager-C5U4ouGL.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { f as TextureBase, T as TransformBit, l as Scene, q as CSMOptimizationMode, C as CSMLevel, b as Material, t as Fog, A as Ambient, z as Skybox, S as Shadows, w as PostSettings } from './scene-vWcxM1_c.js';
import { A as Asset } from './node-event-Ccvtv8bJ.js';

var CameraFOVAxis;
(function (CameraFOVAxis) {
  CameraFOVAxis[CameraFOVAxis["VERTICAL"] = 0] = "VERTICAL";
  CameraFOVAxis[CameraFOVAxis["HORIZONTAL"] = 1] = "HORIZONTAL";
})(CameraFOVAxis || (CameraFOVAxis = {}));
var CameraProjection;
(function (CameraProjection) {
  CameraProjection[CameraProjection["ORTHO"] = 0] = "ORTHO";
  CameraProjection[CameraProjection["PERSPECTIVE"] = 1] = "PERSPECTIVE";
})(CameraProjection || (CameraProjection = {}));
var CameraAperture;
(function (CameraAperture) {
  CameraAperture[CameraAperture["F1_8"] = 0] = "F1_8";
  CameraAperture[CameraAperture["F2_0"] = 1] = "F2_0";
  CameraAperture[CameraAperture["F2_2"] = 2] = "F2_2";
  CameraAperture[CameraAperture["F2_5"] = 3] = "F2_5";
  CameraAperture[CameraAperture["F2_8"] = 4] = "F2_8";
  CameraAperture[CameraAperture["F3_2"] = 5] = "F3_2";
  CameraAperture[CameraAperture["F3_5"] = 6] = "F3_5";
  CameraAperture[CameraAperture["F4_0"] = 7] = "F4_0";
  CameraAperture[CameraAperture["F4_5"] = 8] = "F4_5";
  CameraAperture[CameraAperture["F5_0"] = 9] = "F5_0";
  CameraAperture[CameraAperture["F5_6"] = 10] = "F5_6";
  CameraAperture[CameraAperture["F6_3"] = 11] = "F6_3";
  CameraAperture[CameraAperture["F7_1"] = 12] = "F7_1";
  CameraAperture[CameraAperture["F8_0"] = 13] = "F8_0";
  CameraAperture[CameraAperture["F9_0"] = 14] = "F9_0";
  CameraAperture[CameraAperture["F10_0"] = 15] = "F10_0";
  CameraAperture[CameraAperture["F11_0"] = 16] = "F11_0";
  CameraAperture[CameraAperture["F13_0"] = 17] = "F13_0";
  CameraAperture[CameraAperture["F14_0"] = 18] = "F14_0";
  CameraAperture[CameraAperture["F16_0"] = 19] = "F16_0";
  CameraAperture[CameraAperture["F18_0"] = 20] = "F18_0";
  CameraAperture[CameraAperture["F20_0"] = 21] = "F20_0";
  CameraAperture[CameraAperture["F22_0"] = 22] = "F22_0";
})(CameraAperture || (CameraAperture = {}));
var CameraISO;
(function (CameraISO) {
  CameraISO[CameraISO["ISO100"] = 0] = "ISO100";
  CameraISO[CameraISO["ISO200"] = 1] = "ISO200";
  CameraISO[CameraISO["ISO400"] = 2] = "ISO400";
  CameraISO[CameraISO["ISO800"] = 3] = "ISO800";
})(CameraISO || (CameraISO = {}));
var CameraShutter;
(function (CameraShutter) {
  CameraShutter[CameraShutter["D1"] = 0] = "D1";
  CameraShutter[CameraShutter["D2"] = 1] = "D2";
  CameraShutter[CameraShutter["D4"] = 2] = "D4";
  CameraShutter[CameraShutter["D8"] = 3] = "D8";
  CameraShutter[CameraShutter["D15"] = 4] = "D15";
  CameraShutter[CameraShutter["D30"] = 5] = "D30";
  CameraShutter[CameraShutter["D60"] = 6] = "D60";
  CameraShutter[CameraShutter["D125"] = 7] = "D125";
  CameraShutter[CameraShutter["D250"] = 8] = "D250";
  CameraShutter[CameraShutter["D500"] = 9] = "D500";
  CameraShutter[CameraShutter["D1000"] = 10] = "D1000";
  CameraShutter[CameraShutter["D2000"] = 11] = "D2000";
  CameraShutter[CameraShutter["D4000"] = 12] = "D4000";
})(CameraShutter || (CameraShutter = {}));
var CameraType;
(function (CameraType) {
  CameraType[CameraType["DEFAULT"] = -1] = "DEFAULT";
  CameraType[CameraType["LEFT_EYE"] = 0] = "LEFT_EYE";
  CameraType[CameraType["RIGHT_EYE"] = 1] = "RIGHT_EYE";
  CameraType[CameraType["MAIN"] = 2] = "MAIN";
})(CameraType || (CameraType = {}));
var TrackingType;
(function (TrackingType) {
  TrackingType[TrackingType["NO_TRACKING"] = 0] = "NO_TRACKING";
  TrackingType[TrackingType["POSITION_AND_ROTATION"] = 1] = "POSITION_AND_ROTATION";
  TrackingType[TrackingType["POSITION"] = 2] = "POSITION";
  TrackingType[TrackingType["ROTATION"] = 3] = "ROTATION";
})(TrackingType || (TrackingType = {}));
var CameraUsage;
(function (CameraUsage) {
  CameraUsage[CameraUsage["EDITOR"] = 0] = "EDITOR";
  CameraUsage[CameraUsage["GAME_VIEW"] = 1] = "GAME_VIEW";
  CameraUsage[CameraUsage["SCENE_VIEW"] = 2] = "SCENE_VIEW";
  CameraUsage[CameraUsage["PREVIEW"] = 3] = "PREVIEW";
  CameraUsage[CameraUsage["GAME"] = 100] = "GAME";
})(CameraUsage || (CameraUsage = {}));
var FSTOPS = [1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0, 10.0, 11.0, 13.0, 14.0, 16.0, 18.0, 20.0, 22.0];
var SHUTTERS = [1.0, 1.0 / 2.0, 1.0 / 4.0, 1.0 / 8.0, 1.0 / 15.0, 1.0 / 30.0, 1.0 / 60.0, 1.0 / 125.0, 1.0 / 250.0, 1.0 / 500.0, 1.0 / 1000.0, 1.0 / 2000.0, 1.0 / 4000.0];
var ISOS = [100.0, 200.0, 400.0, 800.0];
var v_a = v3();
var v_b = v3();
var _tempMat1 = mat4();
var SkyBoxFlagValue;
(function (SkyBoxFlagValue) {
  SkyBoxFlagValue[SkyBoxFlagValue["VALUE"] = ClearFlagBit.STENCIL << 1] = "VALUE";
})(SkyBoxFlagValue || (SkyBoxFlagValue = {}));
var SKYBOX_FLAG = SkyBoxFlagValue.VALUE;
var correctionMatrices = [];
var _cameraCount = 0;
var Camera = function () {
  function Camera(device) {
    this.isWindowSize = true;
    this.screenScale = 1;
    this.postProcess = null;
    this.usePostProcess = false;
    this.pipeline = '';
    this.pipelineSettings = null;
    this._scene = null;
    this._node = null;
    this._name = null;
    this._enabled = false;
    this._proj = -1;
    this._aspect = 1;
    this._orthoHeight = 10.0;
    this._fovAxis = CameraFOVAxis.VERTICAL;
    this._fov = toRadian(45);
    this._nearClip = 1.0;
    this._farClip = 1000.0;
    this._clearColor = new Color(0.2, 0.2, 0.2, 1);
    this._viewport = rect(0, 0, 1, 1);
    this._orientedViewport = rect(0, 0, 1, 1);
    this._curTransform = SurfaceTransform.IDENTITY;
    this._isProjDirty = true;
    this._matView = mat4();
    this._matProj = mat4();
    this._matProjInv = mat4();
    this._matViewProj = mat4();
    this._matViewProjInv = mat4();
    this._frustum = new Frustum();
    this._forward = v3();
    this._position = v3();
    this._priority = 0;
    this._aperture = CameraAperture.F16_0;
    this._shutter = CameraShutter.D125;
    this._shutterValue = 0.0;
    this._iso = CameraISO.ISO100;
    this._isoValue = 0.0;
    this._window = null;
    this._width = 1;
    this._height = 1;
    this._clearFlag = ClearFlagBit.NONE;
    this._clearDepth = 1.0;
    this._visibility = CAMERA_DEFAULT_MASK;
    this._exposure = 0;
    this._clearStencil = 0;
    this._geometryRenderer = null;
    this._windowId = 0;
    this._cameraType = CameraType.DEFAULT;
    this._trackingType = TrackingType.NO_TRACKING;
    this._usage = CameraUsage.GAME;
    this._cameraId = _cameraCount++;
    this._device = device;
    this._apertureValue = FSTOPS[this._aperture];
    this._shutterValue = SHUTTERS[this._shutter];
    this._isoValue = ISOS[this._iso];
    this._frustum.accurate = true;
    if (!correctionMatrices.length) {
      var ySign = device.capabilities.clipSpaceSignY;
      correctionMatrices[SurfaceTransform.IDENTITY] = new Mat4(1, 0, 0, 0, 0, ySign);
      correctionMatrices[SurfaceTransform.ROTATE_90] = new Mat4(0, 1, 0, 0, -ySign, 0);
      correctionMatrices[SurfaceTransform.ROTATE_180] = new Mat4(-1, 0, 0, 0, 0, -ySign);
      correctionMatrices[SurfaceTransform.ROTATE_270] = new Mat4(0, -1, 0, 0, ySign, 0);
    }
  }
  var _proto = Camera.prototype;
  _proto._updateAspect = function _updateAspect(oriented) {
    if (oriented === void 0) {
      oriented = true;
    }
    this._aspect = this.window.width * this._viewport.width / (this.window.height * this._viewport.height);
    if (oriented) {
      var swapchain = this.window.swapchain;
      var orientation = swapchain && swapchain.surfaceTransform || SurfaceTransform.IDENTITY;
      if (orientation % 2) this._aspect = 1 / this._aspect;
    }
    this._isProjDirty = true;
  };
  _proto.initialize = function initialize(info) {
    if (info.usage !== undefined) {
      this._usage = info.usage;
    } else {
      this.setDefaultUsage();
    }
    if (info.trackingType !== undefined) {
      this._trackingType = info.trackingType;
    }
    if (info.cameraType !== undefined) {
      this._cameraType = info.cameraType;
    }
    this.node = info.node;
    this._width = 1;
    this._height = 1;
    this.clearFlag = ClearFlagBit.NONE;
    this.clearDepth = 1.0;
    this.visibility = CAMERA_DEFAULT_MASK;
    this._name = info.name;
    this._proj = info.projection;
    this._priority = info.priority || 0;
    this._aspect = this.screenScale = 1;
    this.updateExposure();
    this.changeTargetWindow(info.window);
  };
  _proto.destroy = function destroy() {
    var _this$_geometryRender;
    this._node = null;
    this.detachFromScene();
    if (this._window) {
      this._window.detachCamera(this);
      this.window = null;
    }
    this._name = null;
    (_this$_geometryRender = this._geometryRenderer) == null ? void 0 : _this$_geometryRender.destroy();
  };
  _proto.attachToScene = function attachToScene(scene) {
    this._enabled = true;
    this._scene = scene;
  };
  _proto.detachFromScene = function detachFromScene() {
    this._enabled = false;
    this._scene = null;
  };
  _proto.resize = function resize(width, height) {
    if (!this._window) return;
    this._width = width;
    this._height = height;
    this._aspect = width * this._viewport.width / (height * this._viewport.height);
    this._isProjDirty = true;
  };
  _proto.setFixedSize = function setFixedSize(width, height) {
    this._width = width;
    this._height = height;
    this._updateAspect();
    this.isWindowSize = false;
  };
  _proto.syncCameraEditor = function syncCameraEditor(camera) {
  };
  _proto.update = function update(forceUpdate) {
    var _this$window;
    if (forceUpdate === void 0) {
      forceUpdate = false;
    }
    if (!this._node) return;
    var viewProjDirty = false;
    var xr = globalThis.__globalXR;
    {
      if (xr && xr.isWebXR && xr.webXRWindowMap && xr.updateViewport) {
        var x = xr.webXRMatProjs ? 1 / xr.webXRMatProjs.length : 1;
        var wndXREye = xr.webXRWindowMap.get(this._window);
        this.setViewportInOrientedSpace(new Rect(x * wndXREye, 0, x, 1));
      }
    }
    var forward = this._forward;
    var matView = this._matView;
    var matProj = this._matProj;
    if (this._node.hasChangedFlags || forceUpdate) {
      Mat4.invert(matView, this._node.worldMatrix);
      forward.x = -matView.m02;
      forward.y = -matView.m06;
      forward.z = -matView.m10;
      Mat4.multiply(matView, new Mat4().scale(this._node.worldScale), matView);
      this._node.getWorldPosition(this._position);
      viewProjDirty = true;
    }
    var swapchain = (_this$window = this.window) == null ? void 0 : _this$window.swapchain;
    var orientation = swapchain && swapchain.surfaceTransform || SurfaceTransform.IDENTITY;
    if (this._isProjDirty || this._curTransform !== orientation) {
      this._curTransform = orientation;
      var projectionSignY = this._device.capabilities.clipSpaceSignY;
      if (this._proj === CameraProjection.PERSPECTIVE) {
        if (xr && xr.isWebXR && xr.webXRWindowMap && xr.webXRMatProjs) {
          var _wndXREye = xr.webXRWindowMap.get(this._window);
          matProj.set(xr.webXRMatProjs[_wndXREye]);
        } else {
          Mat4.perspective(matProj, this._fov, this._aspect, this._nearClip, this._farClip, this._fovAxis === CameraFOVAxis.VERTICAL, this._device.capabilities.clipSpaceMinZ, projectionSignY, orientation);
        }
      } else {
        var _x = this._orthoHeight * this._aspect;
        var y = this._orthoHeight;
        Mat4.ortho(matProj, -_x, _x, -y, y, this._nearClip, this._farClip, this._device.capabilities.clipSpaceMinZ, projectionSignY, orientation);
      }
      Mat4.invert(this._matProjInv, matProj);
      viewProjDirty = true;
      this._isProjDirty = false;
    }
    if (viewProjDirty) {
      Mat4.multiply(this._matViewProj, matProj, matView);
      Mat4.invert(this._matViewProjInv, this._matViewProj);
      this._frustum.update(this._matViewProj, this._matViewProjInv);
    }
  };
  _proto.setViewportInOrientedSpace = function setViewportInOrientedSpace(val) {
    var _this$window2;
    var x = val.x,
      width = val.width,
      height = val.height;
    var y = this._device.capabilities.screenSpaceSignY < 0 ? 1 - val.y - height : val.y;
    var swapchain = (_this$window2 = this.window) == null ? void 0 : _this$window2.swapchain;
    var orientation = swapchain && swapchain.surfaceTransform || SurfaceTransform.IDENTITY;
    switch (orientation) {
      case SurfaceTransform.ROTATE_90:
        this._viewport.x = 1 - y - height;
        this._viewport.y = x;
        this._viewport.width = height;
        this._viewport.height = width;
        break;
      case SurfaceTransform.ROTATE_180:
        this._viewport.x = 1 - x - width;
        this._viewport.y = 1 - y - height;
        this._viewport.width = width;
        this._viewport.height = height;
        break;
      case SurfaceTransform.ROTATE_270:
        this._viewport.x = y;
        this._viewport.y = 1 - x - width;
        this._viewport.width = height;
        this._viewport.height = width;
        break;
      case SurfaceTransform.IDENTITY:
        this._viewport.x = x;
        this._viewport.y = y;
        this._viewport.width = width;
        this._viewport.height = height;
        break;
    }
    this._orientedViewport.x = x;
    this._orientedViewport.y = y;
    this._orientedViewport.width = width;
    this._orientedViewport.height = height;
    this.resize(this.width, this.height);
  };
  _proto.initGeometryRenderer = function initGeometryRenderer() {
    if (!this._geometryRenderer) {
      var _this$_geometryRender2;
      var GeometryRenderer = cclegacy.internal.GeometryRenderer;
      this._geometryRenderer = GeometryRenderer ? new GeometryRenderer() : null;
      (_this$_geometryRender2 = this._geometryRenderer) == null ? void 0 : _this$_geometryRender2.activate(this._device);
    }
  };
  _proto.changeTargetWindow = function changeTargetWindow(window) {
    if (window === void 0) {
      window = null;
    }
    if (this._window) {
      this._window.detachCamera(this);
    }
    var win = window || cclegacy.director.root.mainWindow;
    if (win) {
      win.attachCamera(this);
      this.window = win;
      var swapchain = win.swapchain;
      var orientation = swapchain && swapchain.surfaceTransform || SurfaceTransform.IDENTITY;
      if (orientation % 2) this.resize(win.height, win.width);else this.resize(win.width, win.height);
    }
  };
  _proto.detachCamera = function detachCamera() {
    if (this._window) {
      this._window.detachCamera(this);
    }
  };
  _proto.screenPointToRay = function screenPointToRay(out, x, y) {
    if (!this._node) return null;
    var width = this.width;
    var height = this.height;
    var cx = this._orientedViewport.x * width;
    var cy = this._orientedViewport.y * height;
    var cw = this._orientedViewport.width * width;
    var ch = this._orientedViewport.height * height;
    var isProj = this._proj === CameraProjection.PERSPECTIVE;
    var ySign = this._device.capabilities.clipSpaceSignY;
    var preTransform = preTransforms[this._curTransform];
    Vec3.set(v_a, (x - cx) / cw * 2 - 1, (y - cy) / ch * 2 - 1, isProj ? 1 : -1);
    var ox = v_a.x,
      oy = v_a.y;
    v_a.x = ox * preTransform[0] + oy * preTransform[2] * ySign;
    v_a.y = ox * preTransform[1] + oy * preTransform[3] * ySign;
    Vec3.transformMat4(isProj ? v_a : out.o, v_a, this._matViewProjInv);
    if (isProj) {
      this._node.getWorldPosition(v_b);
      Ray.fromPoints(out, v_b, v_a);
    } else {
      Vec3.transformQuat(out.d, Vec3.FORWARD, this._node.worldRotation);
    }
    return out;
  };
  _proto.screenToWorld = function screenToWorld(out, screenPos) {
    var width = this.width;
    var height = this.height;
    var cx = this._orientedViewport.x * width;
    var cy = this._orientedViewport.y * height;
    var cw = this._orientedViewport.width * width;
    var ch = this._orientedViewport.height * height;
    var ySign = this._device.capabilities.clipSpaceSignY;
    var preTransform = preTransforms[this._curTransform];
    if (this._proj === CameraProjection.PERSPECTIVE) {
      Vec3.set(out, (screenPos.x - cx) / cw * 2 - 1, (screenPos.y - cy) / ch * 2 - 1, 1.0);
      var x = out.x,
        y = out.y;
      out.x = x * preTransform[0] + y * preTransform[2] * ySign;
      out.y = x * preTransform[1] + y * preTransform[3] * ySign;
      Vec3.transformMat4(out, out, this._matViewProjInv);
      if (this._node) {
        this._node.getWorldPosition(v_a);
      }
      Vec3.lerp(out, v_a, out, lerp(this._nearClip / this._farClip, 1, screenPos.z));
    } else {
      Vec3.set(out, (screenPos.x - cx) / cw * 2 - 1, (screenPos.y - cy) / ch * 2 - 1, screenPos.z * 2 - 1);
      var _x2 = out.x,
        _y = out.y;
      out.x = _x2 * preTransform[0] + _y * preTransform[2] * ySign;
      out.y = _x2 * preTransform[1] + _y * preTransform[3] * ySign;
      Vec3.transformMat4(out, out, this._matViewProjInv);
    }
    return out;
  };
  _proto.worldToScreen = function worldToScreen(out, worldPos) {
    var ySign = this._device.capabilities.clipSpaceSignY;
    var preTransform = preTransforms[this._curTransform];
    Vec3.transformMat4(out, worldPos, this._matViewProj);
    var x = out.x,
      y = out.y;
    out.x = x * preTransform[0] + y * preTransform[2] * ySign;
    out.y = x * preTransform[1] + y * preTransform[3] * ySign;
    var width = this.width;
    var height = this.height;
    var cx = this._orientedViewport.x * width;
    var cy = this._orientedViewport.y * height;
    var cw = this._orientedViewport.width * width;
    var ch = this._orientedViewport.height * height;
    out.x = cx + (out.x + 1) * 0.5 * cw;
    out.y = cy + (out.y + 1) * 0.5 * ch;
    out.z = out.z * 0.5 + 0.5;
    return out;
  };
  _proto.worldMatrixToScreen = function worldMatrixToScreen(out, worldMatrix, width, height) {
    Mat4.multiply(out, this._matViewProj, worldMatrix);
    Mat4.multiply(out, correctionMatrices[this._curTransform], out);
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    Mat4.identity(_tempMat1);
    Mat4.transform(_tempMat1, _tempMat1, Vec3.set(v_a, halfWidth, halfHeight, 0));
    Mat4.scale(_tempMat1, _tempMat1, Vec3.set(v_a, halfWidth, halfHeight, 1));
    Mat4.multiply(out, _tempMat1, out);
    return out;
  };
  _proto.calculateObliqueMat = function calculateObliqueMat(viewSpacePlane) {
    var clipFar = new Vec4(Math.sign(viewSpacePlane.x), Math.sign(viewSpacePlane.y), 1.0, 1.0);
    var viewFar = clipFar.transformMat4(this._matProjInv);
    var m4 = new Vec4(this._matProj.m03, this._matProj.m07, this._matProj.m11, this._matProj.m15);
    var scale = 2.0 / Vec4.dot(viewSpacePlane, viewFar);
    var newViewSpaceNearPlane = viewSpacePlane.multiplyScalar(scale);
    var m3 = newViewSpaceNearPlane.subtract(m4);
    this._matProj.m02 = m3.x;
    this._matProj.m06 = m3.y;
    this._matProj.m10 = m3.z;
    this._matProj.m14 = m3.w;
  };
  _proto.getClipSpaceMinz = function getClipSpaceMinz() {
    return this._device.capabilities.clipSpaceMinZ;
  };
  _proto.setExposure = function setExposure(ev100) {
    this._exposure = 0.833333 / Math.pow(2.0, ev100);
  };
  _proto.updateExposure = function updateExposure() {
    var ev100 = Math.log2(this._apertureValue * this._apertureValue / this._shutterValue * 100.0 / this._isoValue);
    this.setExposure(ev100);
  };
  _proto.setDefaultUsage = function setDefaultUsage() {
    {
      this._usage = CameraUsage.GAME;
    }
  };
  return _createClass(Camera, [{
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "scene",
    get: function get() {
      return this._scene;
    }
  }, {
    key: "node",
    get: function get() {
      return this._node;
    },
    set: function set(val) {
      this._node = val;
    }
  }, {
    key: "systemWindowId",
    get: function get() {
      return this._windowId;
    }
  }, {
    key: "window",
    get: function get() {
      return this._window;
    },
    set: function set(val) {
      this._window = val;
    }
  }, {
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
    }
  }, {
    key: "visibility",
    get: function get() {
      return this._visibility;
    },
    set: function set(vis) {
      this._visibility = vis;
    }
  }, {
    key: "priority",
    get: function get() {
      return this._priority;
    },
    set: function set(val) {
      this._priority = val;
    }
  }, {
    key: "width",
    get: function get() {
      return this._width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    }
  }, {
    key: "position",
    get: function get() {
      return this._position;
    },
    set: function set(val) {
      this._position = val;
    }
  }, {
    key: "forward",
    get: function get() {
      return this._forward;
    },
    set: function set(val) {
      this._forward = val;
    }
  }, {
    key: "aperture",
    get: function get() {
      return this._aperture;
    },
    set: function set(val) {
      this._aperture = val;
      this._apertureValue = FSTOPS[this._aperture];
      this.updateExposure();
    }
  }, {
    key: "apertureValue",
    get: function get() {
      return this._apertureValue;
    }
  }, {
    key: "shutter",
    get: function get() {
      return this._shutter;
    },
    set: function set(val) {
      this._shutter = val;
      this._shutterValue = SHUTTERS[this._shutter];
      this.updateExposure();
    }
  }, {
    key: "shutterValue",
    get: function get() {
      return this._shutterValue;
    }
  }, {
    key: "iso",
    get: function get() {
      return this._iso;
    },
    set: function set(val) {
      this._iso = val;
      this._isoValue = ISOS[this._iso];
      this.updateExposure();
    }
  }, {
    key: "isoValue",
    get: function get() {
      return this._isoValue;
    }
  }, {
    key: "exposure",
    get: function get() {
      return this._exposure;
    }
  }, {
    key: "clearFlag",
    get: function get() {
      return this._clearFlag;
    },
    set: function set(flag) {
      this._clearFlag = flag;
    }
  }, {
    key: "clearColor",
    get: function get() {
      return this._clearColor;
    },
    set: function set(val) {
      this._clearColor.x = val.x;
      this._clearColor.y = val.y;
      this._clearColor.z = val.z;
      this._clearColor.w = val.w;
    }
  }, {
    key: "clearDepth",
    get: function get() {
      return this._clearDepth;
    },
    set: function set(depth) {
      this._clearDepth = depth;
    }
  }, {
    key: "clearStencil",
    get: function get() {
      return this._clearStencil;
    },
    set: function set(stencil) {
      this._clearStencil = stencil;
    }
  }, {
    key: "projectionType",
    get: function get() {
      return this._proj;
    },
    set: function set(val) {
      this._proj = val;
      this._isProjDirty = true;
    }
  }, {
    key: "aspect",
    get: function get() {
      return this._aspect;
    }
  }, {
    key: "orthoHeight",
    get: function get() {
      return this._orthoHeight;
    },
    set: function set(val) {
      this._orthoHeight = val;
      this._isProjDirty = true;
    }
  }, {
    key: "fovAxis",
    get: function get() {
      return this._fovAxis;
    },
    set: function set(axis) {
      this._fovAxis = axis;
      this._isProjDirty = true;
    }
  }, {
    key: "fov",
    get: function get() {
      return this._fov;
    },
    set: function set(fov) {
      this._fov = fov;
      this._isProjDirty = true;
    }
  }, {
    key: "nearClip",
    get: function get() {
      return this._nearClip;
    },
    set: function set(nearClip) {
      this._nearClip = nearClip;
      this._isProjDirty = true;
    }
  }, {
    key: "farClip",
    get: function get() {
      return this._farClip;
    },
    set: function set(farClip) {
      this._farClip = farClip;
      this._isProjDirty = true;
    }
  }, {
    key: "viewport",
    get: function get() {
      return this._viewport;
    },
    set: function set(val) {
      warnID(8302);
      this.setViewportInOrientedSpace(val);
    }
  }, {
    key: "frustum",
    get: function get() {
      return this._frustum;
    },
    set: function set(val) {
      this._frustum = val;
    }
  }, {
    key: "matView",
    get: function get() {
      return this._matView;
    }
  }, {
    key: "matProj",
    get: function get() {
      return this._matProj;
    }
  }, {
    key: "matProjInv",
    get: function get() {
      return this._matProjInv;
    }
  }, {
    key: "matViewProj",
    get: function get() {
      return this._matViewProj;
    }
  }, {
    key: "matViewProjInv",
    get: function get() {
      return this._matViewProjInv;
    }
  }, {
    key: "cameraId",
    get: function get() {
      return this._cameraId;
    }
  }, {
    key: "surfaceTransform",
    get: function get() {
      return this._curTransform;
    }
  }, {
    key: "geometryRenderer",
    get: function get() {
      return this._geometryRenderer;
    }
  }, {
    key: "cameraType",
    get: function get() {
      return this._cameraType;
    },
    set: function set(type) {
      this._cameraType = type;
    }
  }, {
    key: "trackingType",
    get: function get() {
      return this._trackingType;
    },
    set: function set(type) {
      this._trackingType = type;
    }
  }, {
    key: "cameraUsage",
    get: function get() {
      return this._usage;
    },
    set: function set(usage) {
      this._usage = usage;
    }
  }], [{
    key: "standardExposureValue",
    get: function get() {
      return 1.0 / 38400.0;
    }
  }, {
    key: "standardLightMeterScale",
    get: function get() {
      return 10000.0;
    }
  }]);
}();

var _dec$1, _class$1;
var _colorAttachment = new ColorAttachment();
_colorAttachment.format = Format.RGBA8;
var _depthStencilAttachment = new DepthStencilAttachment();
_depthStencilAttachment.format = Format.DEPTH_STENCIL;
var passInfo = new RenderPassInfo([_colorAttachment], _depthStencilAttachment);
var _windowInfo = {
  width: 1,
  height: 1,
  renderPassInfo: passInfo
};
var RenderTexture = (_dec$1 = ccclass('cc.RenderTexture'), _dec$1(_class$1 = function (_TextureBase) {
  function RenderTexture(name) {
    var _this;
    _this = _TextureBase.call(this, name) || this;
    _this._window = null;
    return _this;
  }
  _inheritsLoose(RenderTexture, _TextureBase);
  var _proto = RenderTexture.prototype;
  _proto.initialize = function initialize(info) {
    this._name = info.name || '';
    this._width = info.width;
    this._height = info.height;
    this._initWindow(info);
  };
  _proto.reset = function reset(info) {
    this.initialize(info);
  };
  _proto.destroy = function destroy() {
    if (this._window) {
      var root = cclegacy.director.root;
      root == null ? void 0 : root.destroyWindow(this._window);
      this._window = null;
    }
    return _TextureBase.prototype.destroy.call(this);
  };
  _proto.resize = function resize(width, height) {
    this._width = Math.floor(clamp(width, 1, 2048));
    this._height = Math.floor(clamp(height, 1, 2048));
    if (this._window) {
      this._window.resize(this._width, this._height);
    }
    this.emit('resize', this._window);
  };
  _proto._serialize = function _serialize(ctxForExporting) {
    return {};
  };
  _proto._deserialize = function _deserialize(serializedData, handle) {
    var data = serializedData;
    this._width = data.w;
    this._height = data.h;
    this._name = data.n;
    _TextureBase.prototype._deserialize.call(this, data.base, handle);
  };
  _proto.getGFXTexture = function getGFXTexture() {
    return this._window && this._window.framebuffer.colorTextures[0];
  };
  _proto.onLoaded = function onLoaded() {
    this._initWindow();
  };
  _proto._initWindow = function _initWindow(info) {
    var root = cclegacy.director.root;
    _windowInfo.title = this._name;
    _windowInfo.width = this._width;
    _windowInfo.height = this._height;
    _windowInfo.renderPassInfo = info && info.passInfo ? info.passInfo : passInfo;
    _windowInfo.externalResLow = info && info.externalResLow ? info.externalResLow : 0;
    _windowInfo.externalResHigh = info && info.externalResHigh ? info.externalResHigh : 0;
    _windowInfo.externalFlag = info && info.externalFlag ? info.externalFlag : TextureFlagBit.NONE;
    _windowInfo.renderPassInfo.colorAttachments.forEach(function (colorAttachment) {
      colorAttachment.format = root.device.swapchainFormat;
    });
    _colorAttachment.barrier = deviceManager.gfxDevice.getGeneralBarrier(new GeneralBarrierInfo(AccessFlagBit.FRAGMENT_SHADER_READ_TEXTURE, AccessFlagBit.FRAGMENT_SHADER_READ_TEXTURE));
    if (this._window) {
      this._window.destroy();
      this._window.initialize(deviceManager.gfxDevice, _windowInfo);
    } else {
      this._window = root.createWindow(_windowInfo);
    }
  };
  _proto.initDefault = function initDefault(uuid) {
    _TextureBase.prototype.initDefault.call(this, uuid);
    this._width = this._height = 1;
    this._initWindow();
  };
  _proto.validate = function validate() {
    return this.width >= 1 && this.width <= 2048 && this.height >= 1 && this.height <= 2048;
  };
  _proto.readPixels = function readPixels(x, y, width, height, buffer) {
    x = x || 0;
    y = y || 0;
    width = width || this.width;
    height = height || this.height;
    var gfxTexture = this.getGFXTexture();
    if (!gfxTexture) {
      errorID(7606);
      return null;
    }
    var needSize = 4 * width * height;
    if (buffer === undefined) {
      buffer = new Uint8Array(needSize);
    } else if (buffer.length < needSize) {
      errorID(7607, needSize);
      return null;
    }
    var gfxDevice = this._getGFXDevice();
    var bufferViews = [];
    var regions = [];
    var region0 = new BufferTextureCopy();
    region0.texOffset.x = x;
    region0.texOffset.y = y;
    region0.texExtent.width = width;
    region0.texExtent.height = height;
    regions.push(region0);
    bufferViews.push(buffer);
    gfxDevice == null ? void 0 : gfxDevice.copyTextureToBuffers(gfxTexture, bufferViews, regions);
    return buffer;
  };
  return _createClass(RenderTexture, [{
    key: "window",
    get: function get() {
      return this._window;
    }
  }]);
}(TextureBase)) || _class$1);
cclegacy.RenderTexture = RenderTexture;

var ProbeClearFlag;
(function (ProbeClearFlag) {
  ProbeClearFlag[ProbeClearFlag["SKYBOX"] = SkyBoxFlagValue.VALUE | ClearFlagBit.DEPTH_STENCIL] = "SKYBOX";
  ProbeClearFlag[ProbeClearFlag["SOLID_COLOR"] = ClearFlagBit.ALL] = "SOLID_COLOR";
})(ProbeClearFlag || (ProbeClearFlag = {}));
var ProbeType;
(function (ProbeType) {
  ProbeType[ProbeType["CUBE"] = 0] = "CUBE";
  ProbeType[ProbeType["PLANAR"] = 1] = "PLANAR";
})(ProbeType || (ProbeType = {}));
var cameraDir = [v3(0, -90, 0), v3(0, 90, 0), v3(90, 0, 0), v3(-90, 0, 0), v3(0, 0, 0), v3(0, 180, 0)];
var tempVec3 = v3();
var ReflectionProbe = function () {
  function ReflectionProbe(id) {
    this.bakedCubeTextures = [];
    this.realtimePlanarTexture = null;
    this._resolution = 256;
    this._clearFlag = ProbeClearFlag.SKYBOX;
    this._backgroundColor = new Color$1(0, 0, 0, 255);
    this._visibility = CAMERA_DEFAULT_MASK;
    this._probeType = ProbeType.CUBE;
    this._cubemap = null;
    this._size = v3(1, 1, 1);
    this._camera = null;
    this._probeId = 0;
    this._needRefresh = false;
    this._needRender = false;
    this._node = null;
    this._cameraNode = null;
    this._boundingBox = null;
    this._cameraWorldPos = v3();
    this._cameraWorldRotation = quat();
    this._forward = v3();
    this._up = v3();
    this._previewSphere = null;
    this._previewPlane = null;
    this._probeId = id;
  }
  var _proto = ReflectionProbe.prototype;
  _proto.initialize = function initialize(node, cameraNode) {
    this._node = node;
    this._cameraNode = cameraNode;
    this.node.getWorldPosition(tempVec3);
    var size = this._size;
    this._boundingBox = AABB.create(tempVec3.x, tempVec3.y, tempVec3.z, size.x, size.y, size.z);
    this._createCamera(cameraNode);
  };
  _proto.initBakedTextures = function initBakedTextures() {
    if (this.bakedCubeTextures.length === 0) {
      for (var i = 0; i < 6; i++) {
        var renderTexture = this._createTargetTexture(this._resolution, this._resolution);
        this.bakedCubeTextures.push(renderTexture);
      }
    }
  };
  _proto.captureCubemap = function captureCubemap() {
    this.initBakedTextures();
    this._resetCameraParams();
    this._needRender = true;
  };
  _proto.renderPlanarReflection = function renderPlanarReflection(sourceCamera) {
    if (!sourceCamera) return;
    if (!this.realtimePlanarTexture) {
      var canvasSize = cclegacy.view.getDesignResolutionSize();
      this.realtimePlanarTexture = this._createTargetTexture(canvasSize.width, canvasSize.height);
      cclegacy.internal.reflectionProbeManager.updatePlanarMap(this, this.realtimePlanarTexture.getGFXTexture());
    }
    this._syncCameraParams(sourceCamera);
    this._transformReflectionCamera(sourceCamera);
    this._needRender = true;
  };
  _proto.switchProbeType = function switchProbeType(type, sourceCamera) {
    if (type === ProbeType.CUBE) {
      this._needRender = false;
    } else if (sourceCamera !== null) {
      this.renderPlanarReflection(sourceCamera);
    }
  };
  _proto.getProbeId = function getProbeId() {
    return this._probeId;
  };
  _proto.updateProbeId = function updateProbeId(id) {
    this._probeId = id;
  };
  _proto.renderArea = function renderArea() {
    if (this._probeType === ProbeType.PLANAR) {
      return new Vec2(this.realtimePlanarTexture.width, this.realtimePlanarTexture.height);
    } else {
      return new Vec2(this.resolution, this.resolution);
    }
  };
  _proto.isFinishedRendering = function isFinishedRendering() {
    return true;
  };
  _proto.validate = function validate() {
    return this.cubemap !== null;
  };
  _proto.destroy = function destroy() {
    if (this._camera) {
      this._camera.destroy();
      this._camera = null;
    }
    for (var i = 0; i < this.bakedCubeTextures.length; i++) {
      this.bakedCubeTextures[i].destroy();
    }
    this.bakedCubeTextures = [];
    if (this.realtimePlanarTexture) {
      this.realtimePlanarTexture.destroy();
      this.realtimePlanarTexture = null;
    }
  };
  _proto.enable = function enable() {};
  _proto.disable = function disable() {};
  _proto.updateCameraDir = function updateCameraDir(faceIdx) {
    this.cameraNode.setRotationFromEuler(cameraDir[faceIdx]);
    this.camera.update(true);
  };
  _proto.updateBoundingBox = function updateBoundingBox() {
    if (this.node) {
      this.node.getWorldPosition(tempVec3);
      var size = this._size;
      AABB.set(this._boundingBox, tempVec3.x, tempVec3.y, tempVec3.z, size.x, size.y, size.z);
    }
  };
  _proto.hasFrameBuffer = function hasFrameBuffer(framebuffer) {
    if (this.probeType === ProbeType.PLANAR) {
      var _this$realtimePlanarT;
      if (!this.realtimePlanarTexture) return false;
      if (((_this$realtimePlanarT = this.realtimePlanarTexture.window) == null ? void 0 : _this$realtimePlanarT.framebuffer) === framebuffer) {
        return true;
      }
    } else {
      if (this.bakedCubeTextures.length === 0) return false;
      for (var i = 0; i < this.bakedCubeTextures.length; i++) {
        var _rt$window;
        var rt = this.bakedCubeTextures[i];
        if (((_rt$window = rt.window) == null ? void 0 : _rt$window.framebuffer) === framebuffer) {
          return true;
        }
      }
    }
    return false;
  };
  _proto.isRGBE = function isRGBE() {
    return true;
  };
  _proto._syncCameraParams = function _syncCameraParams(camera) {
    this.camera.projectionType = camera.projectionType;
    this.camera.orthoHeight = camera.orthoHeight;
    this.camera.nearClip = camera.nearClip;
    this.camera.farClip = camera.farClip;
    this.camera.fov = camera.fov;
    this.camera.clearFlag = camera.clearFlag;
    this.camera.clearColor = camera.clearColor;
    this.camera.priority = camera.priority - 1;
    this.camera.resize(camera.width, camera.height);
  };
  _proto._createCamera = function _createCamera(cameraNode) {
    var root = cclegacy.director.root;
    if (!this._camera) {
      this._camera = root.createCamera();
      if (!this._camera) return null;
      this._camera.initialize({
        name: cameraNode.name,
        node: cameraNode,
        projection: CameraProjection.PERSPECTIVE,
        window: root && root.tempWindow,
        priority: 0,
        cameraType: CameraType.DEFAULT,
        trackingType: TrackingType.NO_TRACKING
      });
    }
    this._camera.setViewportInOrientedSpace(new Rect(0, 0, 1, 1));
    this._camera.fovAxis = CameraFOVAxis.VERTICAL;
    this._camera.fov = toRadian(90);
    this._camera.orthoHeight = 10;
    this._camera.nearClip = 1;
    this._camera.farClip = 1000;
    this._camera.clearColor = this._backgroundColor;
    this._camera.clearDepth = 1.0;
    this._camera.clearStencil = 0.0;
    this._camera.clearFlag = this._clearFlag;
    this._camera.visibility = this._visibility;
    this._camera.aperture = CameraAperture.F16_0;
    this._camera.shutter = CameraShutter.D125;
    this._camera.iso = CameraISO.ISO100;
    return this._camera;
  };
  _proto._resetCameraParams = function _resetCameraParams() {
    this.camera.projectionType = CameraProjection.PERSPECTIVE;
    this.camera.orthoHeight = 10;
    this.camera.nearClip = 1;
    this.camera.farClip = 1000;
    this.camera.fov = toRadian(90);
    this.camera.priority = 0;
    this.camera.resize(this.resolution, this.resolution);
    this.camera.visibility = this._visibility;
    this.camera.clearFlag = this._clearFlag;
    this.camera.clearColor = this._backgroundColor;
    this.cameraNode.worldPosition = this.node.worldPosition;
    this.cameraNode.worldRotation = this.node.worldRotation;
    this.camera.update(true);
  };
  _proto._createTargetTexture = function _createTargetTexture(width, height) {
    var rt = new RenderTexture();
    rt.reset({
      width: width,
      height: height
    });
    return rt;
  };
  _proto._transformReflectionCamera = function _transformReflectionCamera(sourceCamera) {
    var offset = Vec3.dot(this.node.worldPosition, this.node.up);
    this._reflect(this._cameraWorldPos, sourceCamera.node.worldPosition, this.node.up, offset);
    this.cameraNode.worldPosition = this._cameraWorldPos;
    Vec3.transformQuat(this._forward, Vec3.FORWARD, sourceCamera.node.worldRotation);
    this._reflect(this._forward, this._forward, this.node.up, 0);
    this._forward.normalize();
    this._forward.negative();
    Vec3.transformQuat(this._up, Vec3.UP, sourceCamera.node.worldRotation);
    this._reflect(this._up, this._up, this.node.up, 0);
    this._up.normalize();
    Quat.fromViewUp(this._cameraWorldRotation, this._forward, this._up);
    this.cameraNode.worldRotation = this._cameraWorldRotation;
    this.camera.update(true);
    var viewSpaceProbe = new Vec4(this.node.up.x, this.node.up.y, this.node.up.z, -Vec3.dot(this.node.up, this.node.worldPosition));
    viewSpaceProbe.transformMat4(this.camera.matView.clone().invert().transpose());
    this.camera.calculateObliqueMat(viewSpaceProbe);
  };
  _proto._reflect = function _reflect(out, point, normal, offset) {
    var n = Vec3.clone(normal);
    n.normalize();
    var dist = Vec3.dot(n, point) - offset;
    n.multiplyScalar(2.0 * dist);
    Vec3.subtract(out, point, n);
    return out;
  };
  return _createClass(ReflectionProbe, [{
    key: "probeType",
    get: function get() {
      return this._probeType;
    },
    set: function set(value) {
      this._probeType = value;
    }
  }, {
    key: "resolution",
    get: function get() {
      return this._resolution;
    },
    set: function set(value) {
      if (value !== this._resolution) {
        this.bakedCubeTextures.forEach(function (rt, idx) {
          rt.resize(value, value);
        });
      }
      this._resolution = value;
    }
  }, {
    key: "clearFlag",
    get: function get() {
      return this._clearFlag;
    },
    set: function set(value) {
      this._clearFlag = value;
      this.camera.clearFlag = this._clearFlag;
    }
  }, {
    key: "backgroundColor",
    get: function get() {
      return this._backgroundColor;
    },
    set: function set(val) {
      this._backgroundColor = val;
      this.camera.clearColor = this._backgroundColor;
    }
  }, {
    key: "visibility",
    get: function get() {
      return this._visibility;
    },
    set: function set(val) {
      this._visibility = val;
      this._camera.visibility = this._visibility;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(value) {
      this._size.set(value);
      this.node.getWorldPosition(tempVec3);
      AABB.set(this._boundingBox, tempVec3.x, tempVec3.y, tempVec3.z, value.x, value.y, value.z);
    }
  }, {
    key: "cubemap",
    get: function get() {
      return this._cubemap;
    },
    set: function set(val) {
      this._cubemap = val;
    }
  }, {
    key: "node",
    get: function get() {
      return this._node;
    }
  }, {
    key: "camera",
    get: function get() {
      return this._camera;
    }
  }, {
    key: "needRefresh",
    get: function get() {
      return this._needRefresh;
    },
    set: function set(value) {
      this._needRefresh = value;
    }
  }, {
    key: "needRender",
    get: function get() {
      return this._needRender;
    },
    set: function set(value) {
      this._needRender = value;
    }
  }, {
    key: "boundingBox",
    get: function get() {
      return this._boundingBox;
    }
  }, {
    key: "cameraNode",
    get: function get() {
      return this._cameraNode;
    },
    set: function set(node) {
      this._cameraNode = node;
    }
  }, {
    key: "previewSphere",
    get: function get() {
      return this._previewSphere;
    },
    set: function set(val) {
      this._previewSphere = val;
    }
  }, {
    key: "previewPlane",
    get: function get() {
      return this._previewPlane;
    },
    set: function set(val) {
      this._previewPlane = val;
    }
  }]);
}();

var Octree = function () {
  function Octree() {
    this._enabled = false;
    this._minPos = new Vec3(0, 0, 0);
    this._maxPos = new Vec3(0, 0, 0);
    this._depth = 0;
  }
  var _proto = Octree.prototype;
  _proto.initialize = function initialize(octreeInfo) {
    this._enabled = octreeInfo.enabled;
    this._minPos = octreeInfo.minPos;
    this._maxPos = octreeInfo.maxPos;
    this._depth = octreeInfo.depth;
  };
  return _createClass(Octree, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
    }
  }, {
    key: "minPos",
    get: function get() {
      return this._minPos;
    },
    set: function set(val) {
      this._minPos = val;
    }
  }, {
    key: "maxPos",
    get: function get() {
      return this._maxPos;
    },
    set: function set(val) {
      this._maxPos = val;
    }
  }, {
    key: "depth",
    get: function get() {
      return this._depth;
    },
    set: function set(val) {
      this._depth = val;
    }
  }]);
}();

var Skin = function () {
  function Skin() {
    this._enabled = true;
    this._blurRadius = 0.01;
    this._sssIntensity = 3.0;
  }
  var _proto = Skin.prototype;
  _proto.initialize = function initialize(skinInfo) {
    this._enabled = skinInfo.enabled;
    this._blurRadius = skinInfo.blurRadius;
    this._sssIntensity = skinInfo.sssIntensity;
  };
  return _createClass(Skin, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(val) {
      this._enabled = val;
    }
  }, {
    key: "blurRadius",
    get: function get() {
      return this._blurRadius;
    },
    set: function set(val) {
      this._blurRadius = val;
    }
  }, {
    key: "sssIntensity",
    get: function get() {
      return this._sssIntensity;
    },
    set: function set(val) {
      this._sssIntensity = val;
    }
  }]);
}();

function ColorTemperatureToRGB(rgb, kelvin) {
  if (kelvin < 1000.0) {
    kelvin = 1000.0;
  } else if (kelvin > 15000.0) {
    kelvin = 15000.0;
  }
  var kSqr = kelvin * kelvin;
  var u = (0.860117757 + 1.54118254e-4 * kelvin + 1.28641212e-7 * kSqr) / (1.0 + 8.42420235e-4 * kelvin + 7.08145163e-7 * kSqr);
  var v = (0.317398726 + 4.22806245e-5 * kelvin + 4.20481691e-8 * kSqr) / (1.0 - 2.89741816e-5 * kelvin + 1.61456053e-7 * kSqr);
  var d = 2.0 * u - 8.0 * v + 4.0;
  var x = 3.0 * u / d;
  var y = 2.0 * v / d;
  var z = 1.0 - x - y;
  var X = 1.0 / y * x;
  var Z = 1.0 / y * z;
  rgb.x = 3.2404542 * X + -1.5371385 + -0.4985314 * Z;
  rgb.y = -0.969266 * X + 1.8760108 + 0.0415560 * Z;
  rgb.z = 0.0556434 * X + -0.2040259 + 1.0572252 * Z;
}
var LightType;
(function (LightType) {
  LightType[LightType["DIRECTIONAL"] = 0] = "DIRECTIONAL";
  LightType[LightType["SPHERE"] = 1] = "SPHERE";
  LightType[LightType["SPOT"] = 2] = "SPOT";
  LightType[LightType["POINT"] = 3] = "POINT";
  LightType[LightType["RANGED_DIRECTIONAL"] = 4] = "RANGED_DIRECTIONAL";
  LightType[LightType["UNKNOWN"] = 5] = "UNKNOWN";
})(LightType || (LightType = {}));
var nt2lm = function nt2lm(size) {
  return 4 * Math.PI * Math.PI * size * size;
};
var Light = function () {
  function Light() {
    this._baked = false;
    this._color = v3(1, 1, 1);
    this._colorTemp = 6550.0;
    this._colorTempRGB = v3(1, 1, 1);
    this._finalColor = v3(1, 1, 1);
    this._scene = null;
    this._node = null;
    this._name = null;
    this._useColorTemperature = false;
    this._type = LightType.UNKNOWN;
    this._visibility = CAMERA_DEFAULT_MASK;
  }
  var _proto = Light.prototype;
  _proto.initialize = function initialize() {
    this.color = v3(1, 1, 1);
    this.colorTemperature = 6550.0;
  };
  _proto.attachToScene = function attachToScene(scene) {
    this._scene = scene;
  };
  _proto.detachFromScene = function detachFromScene() {
    this._scene = null;
  };
  _proto.destroy = function destroy() {
    this._name = null;
    this._node = null;
  };
  _proto.update = function update() {};
  return _createClass(Light, [{
    key: "baked",
    get: function get() {
      return this._baked;
    },
    set: function set(val) {
      this._baked = val;
    }
  }, {
    key: "color",
    get: function get() {
      return this._color;
    },
    set: function set(color) {
      this._color.set(color);
      if (this._useColorTemperature) {
        Vec3.multiply(this._finalColor, this._color, this._colorTempRGB);
      }
    }
  }, {
    key: "useColorTemperature",
    get: function get() {
      return this._useColorTemperature;
    },
    set: function set(enable) {
      this._useColorTemperature = enable;
      if (enable) {
        Vec3.multiply(this._finalColor, this._color, this._colorTempRGB);
      }
    }
  }, {
    key: "colorTemperature",
    get: function get() {
      return this._colorTemp;
    },
    set: function set(val) {
      this._colorTemp = val;
      ColorTemperatureToRGB(this._colorTempRGB, this._colorTemp);
      if (this._useColorTemperature) {
        Vec3.multiply(this._finalColor, this._color, this._colorTempRGB);
      }
    }
  }, {
    key: "colorTemperatureRGB",
    get: function get() {
      return this._colorTempRGB;
    }
  }, {
    key: "finalColor",
    get: function get() {
      return this._finalColor;
    }
  }, {
    key: "visibility",
    get: function get() {
      return this._visibility;
    },
    set: function set(vis) {
      this._visibility = vis;
    }
  }, {
    key: "node",
    get: function get() {
      return this._node;
    },
    set: function set(n) {
      this._node = n;
      if (this._node) {
        this._node.hasChangedFlags |= TransformBit.ROTATION;
      }
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(n) {
      this._name = n;
    }
  }, {
    key: "scene",
    get: function get() {
      return this._scene;
    }
  }]);
}();

removeProperty(TextureBase.prototype, 'TextureBase.prototype', [{
  name: 'hasPremultipliedAlpha'
}, {
  name: 'setPremultiplyAlpha'
}, {
  name: 'setFlipY'
}]);
replaceProperty(RenderTexture.prototype, 'RenderTexture.prototype', [{
  name: 'getGFXWindow',
  customFunction: function customFunction() {
    return this.window;
  }
}]);

var _typeMap2;
var _typeMap = (_typeMap2 = {}, _typeMap2[FormatType.UNORM] = 'Uint', _typeMap2[FormatType.SNORM] = 'Int', _typeMap2[FormatType.UINT] = 'Uint', _typeMap2[FormatType.INT] = 'Int', _typeMap2[FormatType.UFLOAT] = 'Float', _typeMap2[FormatType.FLOAT] = 'Float', _typeMap2["default"] = 'Uint', _typeMap2);
function _getDataViewType(info) {
  var type = _typeMap[info.type] || _typeMap["default"];
  var bytes = info.size / info.count * 8;
  return "" + type + bytes;
}
function writeBuffer(target, data, format, offset, stride) {
  if (format === void 0) {
    format = Format.R32F;
  }
  if (offset === void 0) {
    offset = 0;
  }
  if (stride === void 0) {
    stride = 0;
  }
  var info = FormatInfos[format];
  if (!stride) {
    stride = info.size;
  }
  var writer = "set" + _getDataViewType(info);
  var componentBytesLength = info.size / info.count;
  var nSeg = Math.floor(data.length / info.count);
  var isLittleEndian = sys.isLittleEndian;
  for (var iSeg = 0; iSeg < nSeg; ++iSeg) {
    var x = offset + stride * iSeg;
    for (var iComponent = 0; iComponent < info.count; ++iComponent) {
      var y = x + componentBytesLength * iComponent;
      target[writer](y, data[info.count * iSeg + iComponent], isLittleEndian);
    }
  }
}
function readBuffer(target, format, offset, length, stride, out) {
  if (format === void 0) {
    format = Format.R32F;
  }
  if (offset === void 0) {
    offset = 0;
  }
  if (length === void 0) {
    length = target.byteLength - offset;
  }
  if (stride === void 0) {
    stride = 0;
  }
  if (out === void 0) {
    out = [];
  }
  var info = FormatInfos[format];
  if (!stride) {
    stride = info.size;
  }
  var reader = "get" + _getDataViewType(info);
  var componentBytesLength = info.size / info.count;
  var nSeg = Math.floor(length / stride);
  var isLittleEndian = sys.isLittleEndian;
  for (var iSeg = 0; iSeg < nSeg; ++iSeg) {
    var x = offset + stride * iSeg;
    for (var iComponent = 0; iComponent < info.count; ++iComponent) {
      var y = x + componentBytesLength * iComponent;
      out[info.count * iSeg + iComponent] = target[reader](y, isLittleEndian);
    }
  }
  return out;
}
function mapBuffer(target, callback, format, offset, length, stride, out) {
  if (format === void 0) {
    format = Format.R32F;
  }
  if (offset === void 0) {
    offset = 0;
  }
  if (length === void 0) {
    length = target.byteLength - offset;
  }
  if (stride === void 0) {
    stride = 0;
  }
  if (!out) {
    out = new DataView(target.buffer.slice(target.byteOffset, target.byteOffset + target.byteLength));
  }
  var info = FormatInfos[format];
  if (!stride) {
    stride = info.size;
  }
  var writer = "set" + _getDataViewType(info);
  var reader = "get" + _getDataViewType(info);
  var componentBytesLength = info.size / info.count;
  var nSeg = Math.floor(length / stride);
  var isLittleEndian = sys.isLittleEndian;
  for (var iSeg = 0; iSeg < nSeg; ++iSeg) {
    var x = offset + stride * iSeg;
    for (var iComponent = 0; iComponent < info.count; ++iComponent) {
      var y = x + componentBytesLength * iComponent;
      var cur = target[reader](y, isLittleEndian);
      out[writer](y, callback(cur, iComponent, target), isLittleEndian);
    }
  }
  return out;
}

var EMPTY_GEOMETRIC_INFO = {
  positions: new Float32Array(),
  indices: new Uint8Array(),
  boundingBox: {
    min: Vec3.ZERO,
    max: Vec3.ZERO
  }
};
var RenderingSubMesh = function () {
  function RenderingSubMesh(vertexBuffers, attributes, primitiveMode, indexBuffer, indirectBuffer, isOwnerOfIndexBuffer) {
    if (indexBuffer === void 0) {
      indexBuffer = null;
    }
    if (indirectBuffer === void 0) {
      indirectBuffer = null;
    }
    if (isOwnerOfIndexBuffer === void 0) {
      isOwnerOfIndexBuffer = true;
    }
    this.mesh = void 0;
    this.subMeshIdx = void 0;
    this._flatBuffers = [];
    this._jointMappedBuffers = void 0;
    this._jointMappedBufferIndices = void 0;
    this._vertexIdChannel = void 0;
    this._geometricInfo = void 0;
    this._vertexBuffers = void 0;
    this._drawInfo = null;
    this._attributes = attributes;
    this._vertexBuffers = vertexBuffers;
    this._indexBuffer = indexBuffer;
    this._indirectBuffer = indirectBuffer;
    this._primitiveMode = primitiveMode;
    this._iaInfo = new InputAssemblerInfo(attributes, vertexBuffers, indexBuffer, indirectBuffer);
    this._isOwnerOfIndexBuffer = isOwnerOfIndexBuffer;
  }
  var _proto = RenderingSubMesh.prototype;
  _proto.invalidateGeometricInfo = function invalidateGeometricInfo() {
    this._geometricInfo = undefined;
  };
  _proto.genFlatBuffers = function genFlatBuffers() {
    if (this._flatBuffers.length || !this.mesh || this.subMeshIdx === undefined) {
      return;
    }
    var mesh = this.mesh;
    var idxCount = 0;
    var prim = mesh.struct.primitives[this.subMeshIdx];
    if (prim.indexView) {
      idxCount = prim.indexView.count;
    }
    for (var i = 0; i < prim.vertexBundelIndices.length; i++) {
      var bundleIdx = prim.vertexBundelIndices[i];
      var vertexBundle = mesh.struct.vertexBundles[bundleIdx];
      var vbCount = prim.indexView ? prim.indexView.count : vertexBundle.view.count;
      var vbStride = vertexBundle.view.stride;
      var vbSize = vbStride * vbCount;
      var view = new Uint8Array(mesh.data.buffer, vertexBundle.view.offset, vertexBundle.view.length);
      var sharedView = new Uint8Array(prim.indexView ? vbSize : vertexBundle.view.length);
      if (!prim.indexView) {
        sharedView.set(mesh.data.subarray(vertexBundle.view.offset, vertexBundle.view.offset + vertexBundle.view.length));
        this._flatBuffers.push({
          stride: vbStride,
          count: vbCount,
          buffer: sharedView
        });
        continue;
      }
      var ibView = mesh.readIndices(this.subMeshIdx);
      for (var n = 0; n < idxCount; ++n) {
        var idx = ibView[n];
        var offset = n * vbStride;
        var srcOffset = idx * vbStride;
        for (var m = 0; m < vbStride; ++m) {
          sharedView[offset + m] = view[srcOffset + m];
        }
      }
      this._flatBuffers.push({
        stride: vbStride,
        count: vbCount,
        buffer: sharedView
      });
    }
  };
  _proto.destroy = function destroy() {
    for (var i = 0; i < this.vertexBuffers.length; i++) {
      this.vertexBuffers[i].destroy();
    }
    this.vertexBuffers.length = 0;
    if (this._indexBuffer) {
      if (this._isOwnerOfIndexBuffer) {
        this._indexBuffer.destroy();
      }
      this._indexBuffer = null;
    }
    if (this._jointMappedBuffers && this._jointMappedBufferIndices) {
      for (var _i = 0; _i < this._jointMappedBufferIndices.length; _i++) {
        this._jointMappedBuffers[this._jointMappedBufferIndices[_i]].destroy();
      }
      this._jointMappedBuffers = undefined;
      this._jointMappedBufferIndices = undefined;
    }
    if (this._indirectBuffer) {
      this._indirectBuffer.destroy();
      this._indirectBuffer = null;
    }
  };
  _proto.enableVertexIdChannel = function enableVertexIdChannel(device) {
    if (this._vertexIdChannel) {
      return;
    }
    var streamIndex = this.vertexBuffers.length;
    var attributeIndex = this.attributes.length;
    var vertexIdBuffer = this._allocVertexIdBuffer(device);
    this._vertexBuffers.push(vertexIdBuffer);
    this._attributes.push(new Attribute('a_vertexId', Format.R32F, false, streamIndex));
    this._iaInfo.attributes = this._attributes;
    this._iaInfo.vertexBuffers = this._vertexBuffers;
    this._vertexIdChannel = {
      stream: streamIndex,
      index: attributeIndex
    };
  };
  _proto._allocVertexIdBuffer = function _allocVertexIdBuffer(device) {
    var vertexCount = this.vertexBuffers.length === 0 || this.vertexBuffers[0].stride === 0 ? 0 : this.vertexBuffers[0].size / this.vertexBuffers[0].stride;
    var vertexIds = new Float32Array(vertexCount);
    for (var iVertex = 0; iVertex < vertexCount; ++iVertex) {
      vertexIds[iVertex] = iVertex + 0.5;
    }
    var vertexIdBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, vertexIds.byteLength, vertexIds.BYTES_PER_ELEMENT));
    vertexIdBuffer.update(vertexIds);
    return vertexIdBuffer;
  };
  return _createClass(RenderingSubMesh, [{
    key: "attributes",
    get: function get() {
      return this._attributes;
    }
  }, {
    key: "vertexBuffers",
    get: function get() {
      return this._vertexBuffers;
    }
  }, {
    key: "indexBuffer",
    get: function get() {
      return this._indexBuffer;
    }
  }, {
    key: "indirectBuffer",
    get: function get() {
      return this._indirectBuffer;
    }
  }, {
    key: "primitiveMode",
    get: function get() {
      return this._primitiveMode;
    }
  }, {
    key: "geometricInfo",
    get: function get() {
      if (this._geometricInfo) {
        return this._geometricInfo;
      }
      if (this.mesh === undefined) {
        return EMPTY_GEOMETRIC_INFO;
      }
      if (this.subMeshIdx === undefined) {
        return EMPTY_GEOMETRIC_INFO;
      }
      var mesh = this.mesh;
      var index = this.subMeshIdx;
      var pAttri = this.attributes.find(function (element) {
        return element.name === AttributeName.ATTR_POSITION;
      });
      if (!pAttri) {
        return EMPTY_GEOMETRIC_INFO;
      }
      var positions;
      switch (pAttri.format) {
        case Format.RG32F:
        case Format.RGB32F:
          {
            positions = mesh.readAttribute(index, AttributeName.ATTR_POSITION);
            if (!positions) {
              return EMPTY_GEOMETRIC_INFO;
            }
            break;
          }
        case Format.RGBA32F:
          {
            var data = mesh.readAttribute(index, AttributeName.ATTR_POSITION);
            if (!data) {
              return EMPTY_GEOMETRIC_INFO;
            }
            var count = data.length / 4;
            positions = new Float32Array(count * 3);
            for (var i = 0; i < count; ++i) {
              var dstPtr = i * 3;
              var srcPtr = i * 4;
              positions[dstPtr] = data[srcPtr];
              positions[dstPtr + 1] = data[srcPtr + 1];
              positions[dstPtr + 2] = data[srcPtr + 2];
            }
            break;
          }
        case Format.RG16F:
        case Format.RGB16F:
          {
            var _data = mesh.readAttribute(index, AttributeName.ATTR_POSITION);
            if (!_data) {
              return EMPTY_GEOMETRIC_INFO;
            }
            positions = new Float32Array(_data.length);
            for (var _i2 = 0; _i2 < _data.length; ++_i2) {
              positions[_i2] = halfToFloat(_data[_i2]);
            }
            break;
          }
        case Format.RGBA16F:
          {
            var _data2 = mesh.readAttribute(index, AttributeName.ATTR_POSITION);
            if (!_data2) {
              return EMPTY_GEOMETRIC_INFO;
            }
            var _count = _data2.length / 4;
            positions = new Float32Array(_count * 3);
            for (var _i3 = 0; _i3 < _count; ++_i3) {
              var _dstPtr = _i3 * 3;
              var _srcPtr = _i3 * 4;
              positions[_dstPtr] = halfToFloat(_data2[_srcPtr]);
              positions[_dstPtr + 1] = halfToFloat(_data2[_srcPtr + 1]);
              positions[_dstPtr + 2] = halfToFloat(_data2[_srcPtr + 2]);
            }
            break;
          }
        default:
          return EMPTY_GEOMETRIC_INFO;
      }
      var indices = mesh.readIndices(index) || undefined;
      var max = new Vec3();
      var min = new Vec3();
      var conut = FormatInfos[pAttri.format].count;
      if (conut === 2) {
        max.set(positions[0], positions[1], 0);
        min.set(positions[0], positions[1], 0);
      } else {
        max.set(positions[0], positions[1], positions[2]);
        min.set(positions[0], positions[1], positions[2]);
      }
      for (var _i4 = 0; _i4 < positions.length; _i4 += conut) {
        if (conut === 2) {
          max.x = positions[_i4] > max.x ? positions[_i4] : max.x;
          max.y = positions[_i4 + 1] > max.y ? positions[_i4 + 1] : max.y;
          min.x = positions[_i4] < min.x ? positions[_i4] : min.x;
          min.y = positions[_i4 + 1] < min.y ? positions[_i4 + 1] : min.y;
        } else {
          max.x = positions[_i4] > max.x ? positions[_i4] : max.x;
          max.y = positions[_i4 + 1] > max.y ? positions[_i4 + 1] : max.y;
          max.z = positions[_i4 + 2] > max.z ? positions[_i4 + 2] : max.z;
          min.x = positions[_i4] < min.x ? positions[_i4] : min.x;
          min.y = positions[_i4 + 1] < min.y ? positions[_i4 + 1] : min.y;
          min.z = positions[_i4 + 2] < min.z ? positions[_i4 + 2] : min.z;
        }
      }
      this._geometricInfo = {
        positions: positions,
        indices: indices,
        boundingBox: {
          max: max,
          min: min
        }
      };
      return this._geometricInfo;
    }
  }, {
    key: "drawInfo",
    get: function get() {
      return this._drawInfo;
    },
    set: function set(info) {
      this._drawInfo = info;
    }
  }, {
    key: "flatBuffers",
    get: function get() {
      return this._flatBuffers;
    }
  }, {
    key: "jointMappedBuffers",
    get: function get() {
      var _this = this;
      if (this._jointMappedBuffers) {
        return this._jointMappedBuffers;
      }
      var buffers = this._jointMappedBuffers = [];
      var indices = this._jointMappedBufferIndices = [];
      if (!this.mesh || this.subMeshIdx === undefined) {
        return this._jointMappedBuffers = this.vertexBuffers;
      }
      var struct = this.mesh.struct;
      var prim = struct.primitives[this.subMeshIdx];
      if (!struct.jointMaps || prim.jointMapIndex === undefined || !struct.jointMaps[prim.jointMapIndex]) {
        return this._jointMappedBuffers = this.vertexBuffers;
      }
      var jointFormat;
      var jointOffset;
      var _ref = cclegacy.director.root,
        device = _ref.device;
      var _loop = function _loop() {
        var bundle = struct.vertexBundles[prim.vertexBundelIndices[i]];
        jointOffset = 0;
        jointFormat = Format.UNKNOWN;
        for (var j = 0; j < bundle.attributes.length; j++) {
          var attr = bundle.attributes[j];
          if (attr.name === AttributeName.ATTR_JOINTS) {
            jointFormat = attr.format;
            break;
          }
          jointOffset += FormatInfos[attr.format].size;
        }
        if (jointFormat) {
          var data = new Uint8Array(_this.mesh.data.buffer, bundle.view.offset, bundle.view.length);
          var dataView = new DataView(data.slice().buffer);
          var idxMap = struct.jointMaps[prim.jointMapIndex];
          mapBuffer(dataView, function (cur) {
            return idxMap.indexOf(cur);
          }, jointFormat, jointOffset, bundle.view.length, bundle.view.stride, dataView);
          var buffer = device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, bundle.view.length, bundle.view.stride));
          buffer.update(dataView.buffer);
          buffers.push(buffer);
          indices.push(i);
        } else {
          buffers.push(_this.vertexBuffers[prim.vertexBundelIndices[i]]);
        }
      };
      for (var i = 0; i < prim.vertexBundelIndices.length; i++) {
        _loop();
      }
      if (this._vertexIdChannel) {
        buffers.push(this._allocVertexIdBuffer(device));
      }
      return buffers;
    }
  }, {
    key: "iaInfo",
    get: function get() {
      return this._iaInfo;
    }
  }]);
}();

var _dec, _class, _class2, _initializer;
var SceneAsset = (_dec = ccclass('cc.SceneAsset'), _dec(_class = (_class2 = function (_Asset) {
  function SceneAsset(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this.scene = _initializer && _initializer();
    return _this;
  }
  _inheritsLoose(SceneAsset, _Asset);
  var _proto = SceneAsset.prototype;
  _proto.initDefault = function initDefault(uuid) {
    _Asset.prototype.initDefault.call(this, uuid);
    this.scene = new Scene('New Scene');
  };
  _proto.validate = function validate() {
    return !!this.scene;
  };
  return SceneAsset;
}(Asset), _initializer = applyDecoratedInitializer(_class2.prototype, "scene", [serializable], function () {
  return null;
}), _class2)) || _class);
cclegacy.SceneAsset = SceneAsset;

var _mat4Trans = new Mat4();
var _matShadowTrans = new Mat4();
var _matShadowView = new Mat4();
var _matShadowProj = new Mat4();
var _matShadowViewProj = new Mat4();
var _matShadowViewProjArbitaryPos = new Mat4();
var _matShadowViewProjArbitaryPosInv = new Mat4();
var _focus = new Vec3(0, 0, 0);
var _projPos = new Vec3();
var _texelSize = new Vec2();
var _projSnap = new Vec3();
var _snap = new Vec3();
var _maxVec3 = new Vec3(10000000, 10000000, 10000000);
var _minVec3 = new Vec3(-1e7, -1e7, -1e7);
var _shadowPos = new Vec3();
var _maxLayerPosz = 0.0;
var _maxLayerFarPlane = 0.0;
var ShadowLayerVolume = function () {
  function ShadowLayerVolume(level) {
    this._shadowObjects = [];
    this._shadowCameraFar = 0;
    this._matShadowView = new Mat4();
    this._matShadowProj = new Mat4();
    this._matShadowViewProj = new Mat4();
    this._validFrustum = new Frustum();
    this._splitFrustum = new Frustum();
    this._lightViewFrustum = new Frustum();
    this._castLightViewBoundingBox = new AABB();
    this._level = level;
    this._validFrustum.accurate = true;
    this._splitFrustum.accurate = true;
    this._lightViewFrustum.accurate = true;
  }
  var _proto = ShadowLayerVolume.prototype;
  _proto.copyToValidFrustum = function copyToValidFrustum(validFrustum) {
    Frustum.copy(this._validFrustum, validFrustum);
  };
  _proto.calculateValidFrustumOrtho = function calculateValidFrustumOrtho(width, height, near, far, transform) {
    Frustum.createOrtho(this._validFrustum, width, height, near, far, transform);
  };
  _proto.calculateSplitFrustum = function calculateSplitFrustum(camera, m, start, end) {
    this._splitFrustum.split(start, end, camera.aspect, camera.fov, m);
  };
  _proto.destroy = function destroy() {
    this._shadowObjects.length = 0;
  };
  _proto.createMatrix = function createMatrix(dirLight, shadowMapWidth, onlyForCulling) {
    var device = cclegacy.director.root.device;
    var invisibleOcclusionRange = dirLight.shadowInvisibleOcclusionRange;
    Frustum.copy(this._lightViewFrustum, this._splitFrustum);
    Mat4.fromRT(_matShadowTrans, dirLight.node.rotation, _focus);
    Mat4.invert(_matShadowView, _matShadowTrans);
    var shadowViewArbitaryPos = _matShadowView.clone();
    this._lightViewFrustum.transform(_matShadowView);
    AABB.fromPoints(this._castLightViewBoundingBox, _maxVec3, _minVec3);
    this._castLightViewBoundingBox.mergeFrustum(this._lightViewFrustum);
    var orthoSizeWidth;
    var orthoSizeHeight;
    if (dirLight.csmOptimizationMode === CSMOptimizationMode.DisableRotationFix) {
      orthoSizeWidth = this._castLightViewBoundingBox.halfExtents.x * 2.0;
      orthoSizeHeight = this._castLightViewBoundingBox.halfExtents.y * 2.0;
    } else {
      orthoSizeWidth = orthoSizeHeight = Vec3.distance(this._lightViewFrustum.vertices[0], this._lightViewFrustum.vertices[6]);
    }
    var csmLevel = cclegacy.director.root.pipeline.pipelineSceneData.csmSupported ? dirLight.csmLevel : 1;
    if (csmLevel > 1 && dirLight.csmOptimizationMode === CSMOptimizationMode.RemoveDuplicates) {
      if (this._level >= csmLevel - 1) {
        _maxLayerFarPlane = this._castLightViewBoundingBox.halfExtents.z;
        _maxLayerPosz = this._castLightViewBoundingBox.center.z;
      } else {
        var alignFarPlaneDist = Math.abs(this._castLightViewBoundingBox.center.z - _maxLayerPosz) + _maxLayerFarPlane;
        this._castLightViewBoundingBox.halfExtents.z = Math.max(this._castLightViewBoundingBox.center.z, alignFarPlaneDist);
      }
    }
    var r = this._castLightViewBoundingBox.halfExtents.z;
    this._shadowCameraFar = r * 2 + invisibleOcclusionRange;
    var center = this._castLightViewBoundingBox.center;
    _shadowPos.set(center.x, center.y, center.z + r + invisibleOcclusionRange);
    Vec3.transformMat4(_shadowPos, _shadowPos, _matShadowTrans);
    Mat4.fromRT(_matShadowTrans, dirLight.node.rotation, _shadowPos);
    Mat4.invert(_matShadowView, _matShadowTrans);
    if (!onlyForCulling) {
      var halfOrthoSizeWidth = orthoSizeWidth * 0.5;
      var halfOrthoSizeHeight = orthoSizeHeight * 0.5;
      Mat4.ortho(_matShadowProj, -halfOrthoSizeWidth, halfOrthoSizeWidth, -halfOrthoSizeHeight, halfOrthoSizeHeight, 0.1, this._shadowCameraFar, device.capabilities.clipSpaceMinZ, device.capabilities.clipSpaceSignY);
      Mat4.multiply(_matShadowViewProjArbitaryPos, _matShadowProj, shadowViewArbitaryPos);
      Vec3.transformMat4(_projPos, _shadowPos, _matShadowViewProjArbitaryPos);
      var invActualSize = 2.0 / shadowMapWidth;
      _texelSize.set(invActualSize, invActualSize);
      var modX = _projPos.x % _texelSize.x;
      var modY = _projPos.y % _texelSize.y;
      _projSnap.set(_projPos.x - modX, _projPos.y - modY, _projPos.z);
      Mat4.invert(_matShadowViewProjArbitaryPosInv, _matShadowViewProjArbitaryPos);
      Vec3.transformMat4(_snap, _projSnap, _matShadowViewProjArbitaryPosInv);
      Mat4.fromRT(_matShadowTrans, dirLight.node.rotation, _snap);
      Mat4.invert(_matShadowView, _matShadowTrans);
      Mat4.multiply(_matShadowViewProj, _matShadowProj, _matShadowView);
      Mat4.copy(this._matShadowView, _matShadowView);
      Mat4.copy(this._matShadowProj, _matShadowProj);
      Mat4.copy(this._matShadowViewProj, _matShadowViewProj);
    }
    Frustum.createOrtho(this._validFrustum, orthoSizeWidth, orthoSizeHeight, 0.1, this._shadowCameraFar, _matShadowTrans);
  };
  return _createClass(ShadowLayerVolume, [{
    key: "level",
    get: function get() {
      return this._level;
    }
  }, {
    key: "shadowObjects",
    get: function get() {
      return this._shadowObjects;
    }
  }, {
    key: "shadowCameraFar",
    get: function get() {
      return this._shadowCameraFar;
    },
    set: function set(val) {
      this._shadowCameraFar = val;
    }
  }, {
    key: "matShadowView",
    get: function get() {
      return this._matShadowView;
    },
    set: function set(val) {
      this._matShadowView = val;
    }
  }, {
    key: "matShadowProj",
    get: function get() {
      return this._matShadowProj;
    },
    set: function set(val) {
      this._matShadowProj = val;
    }
  }, {
    key: "matShadowViewProj",
    get: function get() {
      return this._matShadowViewProj;
    },
    set: function set(val) {
      this._matShadowViewProj = val;
    }
  }, {
    key: "validFrustum",
    get: function get() {
      return this._validFrustum;
    }
  }, {
    key: "splitFrustum",
    get: function get() {
      return this._splitFrustum;
    }
  }, {
    key: "lightViewFrustum",
    get: function get() {
      return this._lightViewFrustum;
    }
  }, {
    key: "castLightViewBoundingBox",
    get: function get() {
      return this._castLightViewBoundingBox;
    }
  }]);
}();
var CSMShadowLayer = function (_ShadowLayerVolume2) {
  function CSMShadowLayer(level) {
    var _this;
    _this = _ShadowLayerVolume2.call(this, level) || this;
    _this._splitCameraNear = 0;
    _this._splitCameraFar = 0;
    _this._csmAtlas = new Vec4();
    _this._calculateAtlas(level);
    return _this;
  }
  _inheritsLoose(CSMShadowLayer, _ShadowLayerVolume2);
  var _proto2 = CSMShadowLayer.prototype;
  _proto2.destroy = function destroy() {
    _ShadowLayerVolume2.prototype.destroy.call(this);
  };
  _proto2._calculateAtlas = function _calculateAtlas(level) {
    var clipSpaceSignY = cclegacy.director.root.device.capabilities.clipSpaceSignY;
    var x = level % 2 - 0.5;
    var y = (0.5 - Math.floor(level / 2)) * clipSpaceSignY;
    this._csmAtlas.set(0.5, 0.5, x, y);
  };
  return _createClass(CSMShadowLayer, [{
    key: "splitCameraNear",
    get: function get() {
      return this._splitCameraNear;
    },
    set: function set(val) {
      this._splitCameraNear = val;
    }
  }, {
    key: "splitCameraFar",
    get: function get() {
      return this._splitCameraFar;
    },
    set: function set(val) {
      this._splitCameraFar = val;
    }
  }, {
    key: "csmAtlas",
    get: function get() {
      return this._csmAtlas;
    },
    set: function set(val) {
      this._csmAtlas = val;
    }
  }]);
}(ShadowLayerVolume);
var CSMLayers = function () {
  function CSMLayers() {
    this._castShadowObjects = [];
    this._layerObjects = new CachedArray(64);
    this._layers = [];
    this._levelCount = 0;
    this._specialLayer = new ShadowLayerVolume(1);
    this._shadowDistance = 0;
    for (var i = 0; i < CSMLevel.LEVEL_4; i++) {
      this._layers[i] = new CSMShadowLayer(i);
    }
  }
  var _proto3 = CSMLayers.prototype;
  _proto3.update = function update(sceneData, camera) {
    var scene = camera.scene;
    var dirLight = scene.mainLight;
    if (dirLight === null) {
      return;
    }
    var shadowInfo = sceneData.shadows;
    var levelCount = cclegacy.director.root.pipeline.pipelineSceneData.csmSupported ? dirLight.csmLevel : 1;
    var shadowDistance = dirLight.shadowDistance;
    if (!shadowInfo.enabled || !dirLight.shadowEnabled) {
      return;
    }
    if (dirLight.shadowFixedArea) {
      this._updateFixedArea(dirLight);
    } else {
      if (dirLight.csmNeedUpdate || this._levelCount !== levelCount || this._shadowDistance !== shadowDistance) {
        this._splitFrustumLevels(dirLight);
        this._levelCount = levelCount;
        this._shadowDistance = shadowDistance;
      }
      this._calculateCSM(camera, dirLight, shadowInfo);
    }
  };
  _proto3.destroy = function destroy() {
    this._castShadowObjects.length = 0;
    for (var i = 0; i < this._layers.length; i++) {
      this._layers[i].destroy();
    }
    this._layers.length = 0;
  };
  _proto3._updateFixedArea = function _updateFixedArea(dirLight) {
    var device = cclegacy.director.root.device;
    var x = dirLight.shadowOrthoSize;
    var y = dirLight.shadowOrthoSize;
    var near = dirLight.shadowNear;
    var far = dirLight.shadowFar;
    Mat4.fromRT(_matShadowTrans, dirLight.node.worldRotation, dirLight.node.worldPosition);
    Mat4.invert(_matShadowView, _matShadowTrans);
    Mat4.ortho(_matShadowProj, -x, x, -y, y, near, far, device.capabilities.clipSpaceMinZ, device.capabilities.clipSpaceSignY);
    Mat4.multiply(_matShadowViewProj, _matShadowProj, _matShadowView);
    this._specialLayer.matShadowView = _matShadowView;
    this._specialLayer.matShadowProj = _matShadowProj;
    this._specialLayer.matShadowViewProj = _matShadowViewProj;
    this._specialLayer.calculateValidFrustumOrtho(x * 2.0, y * 2.0, near, far, _matShadowTrans);
  };
  _proto3._splitFrustumLevels = function _splitFrustumLevels(dirLight) {
    var nd = 0.1;
    var fd = dirLight.shadowDistance;
    var ratio = fd / nd;
    var level = cclegacy.director.root.pipeline.pipelineSceneData.csmSupported ? dirLight.csmLevel : 1;
    var lambda = dirLight.csmLayerLambda;
    this._layers[0].splitCameraNear = nd;
    for (var i = 1; i < level; i++) {
      var si = i / level;
      var preNear = lambda * (nd * Math.pow(ratio, si)) + (1 - lambda) * (nd + (fd - nd) * si);
      var nextFar = preNear * 1.005;
      this._layers[i].splitCameraNear = preNear;
      this._layers[i - 1].splitCameraFar = nextFar;
    }
    this._layers[level - 1].splitCameraFar = fd;
    dirLight.csmNeedUpdate = false;
  };
  _proto3._calculateCSM = function _calculateCSM(camera, dirLight, shadowInfo) {
    var level = cclegacy.director.root.pipeline.pipelineSceneData.csmSupported ? dirLight.csmLevel : 1;
    var shadowMapWidth = level > 1 ? shadowInfo.size.x * 0.5 : shadowInfo.size.x;
    if (shadowMapWidth < 0.0) {
      return;
    }
    this._getCameraWorldMatrix(_mat4Trans, camera);
    for (var i = level - 1; i >= 0; i--) {
      var csmLayer = this._layers[i];
      var near = csmLayer.splitCameraNear;
      var far = csmLayer.splitCameraFar;
      csmLayer.calculateSplitFrustum(camera, _mat4Trans, near, far);
      csmLayer.createMatrix(dirLight, shadowMapWidth, false);
    }
    if (level === CSMLevel.LEVEL_1) {
      this._specialLayer.shadowCameraFar = this._layers[0].shadowCameraFar;
      Mat4.copy(this._specialLayer.matShadowView, this._layers[0].matShadowView);
      Mat4.copy(this._specialLayer.matShadowProj, this._layers[0].matShadowProj);
      Mat4.copy(this._specialLayer.matShadowViewProj, this._layers[0].matShadowViewProj);
      this._specialLayer.copyToValidFrustum(this._layers[0].validFrustum);
    } else {
      this._specialLayer.calculateSplitFrustum(camera, _mat4Trans, 0.1, dirLight.shadowDistance);
      this._specialLayer.createMatrix(dirLight, shadowMapWidth, true);
    }
  };
  _proto3._getCameraWorldMatrix = function _getCameraWorldMatrix(out, camera) {
    if (!camera.node) {
      return;
    }
    var cameraNode = camera.node;
    var position = cameraNode.worldPosition;
    var rotation = cameraNode.worldRotation;
    Mat4.fromRT(out, rotation, position);
  };
  return _createClass(CSMLayers, [{
    key: "castShadowObjects",
    get: function get() {
      return this._castShadowObjects;
    }
  }, {
    key: "layerObjects",
    get: function get() {
      return this._layerObjects;
    }
  }, {
    key: "layers",
    get: function get() {
      return this._layers;
    }
  }, {
    key: "specialLayer",
    get: function get() {
      return this._specialLayer;
    }
  }]);
}();

var GEOMETRY_RENDERER_TECHNIQUE_COUNT = 6;
var PipelineSceneData = function () {
  function PipelineSceneData() {
    this.fog = new Fog();
    this.ambient = new Ambient();
    this.skybox = new Skybox();
    this.shadows = new Shadows();
    this.csmLayers = new CSMLayers();
    this.octree = new Octree();
    this.skin = new Skin();
    this.postSettings = new PostSettings();
    this.lightProbes = cclegacy.internal.LightProbes ? new cclegacy.internal.LightProbes() : null;
    this.validPunctualLights = [];
    this.renderObjects = [];
    this.shadowFrameBufferMap = new Map();
    this._geometryRendererMaterials = [];
    this._geometryRendererPasses = [];
    this._geometryRendererShaders = [];
    this._occlusionQueryVertexBuffer = null;
    this._occlusionQueryIndicesBuffer = null;
    this._occlusionQueryInputAssembler = null;
    this._occlusionQueryMaterial = null;
    this._occlusionQueryShader = null;
    this._isHDR = true;
    this._shadingScale = 1.0;
    this._csmSupported = true;
    this._standardSkinMeshRenderer = null;
    this._standardSkinModel = null;
    this._skinMaterialModel = null;
    this._shadingScale = 1.0;
  }
  var _proto = PipelineSceneData.prototype;
  _proto.activate = function activate(device) {
    this._device = device;
    this.initGeometryRendererMaterials();
    this.initOcclusionQuery();
    return true;
  };
  _proto.initGeometryRendererMaterials = function initGeometryRendererMaterials() {
    var offset = 0;
    var geometryRendererMaterials = this._geometryRendererMaterials;
    for (var tech = 0; tech < GEOMETRY_RENDERER_TECHNIQUE_COUNT; tech++) {
      geometryRendererMaterials[tech] = new Material();
      geometryRendererMaterials[tech]._uuid = "geometry-renderer-material-" + tech;
      geometryRendererMaterials[tech].initialize({
        effectName: 'internal/builtin-geometry-renderer',
        technique: tech
      });
      var passes = geometryRendererMaterials[tech].passes;
      for (var pass = 0; pass < passes.length; ++pass) {
        this._geometryRendererPasses[offset] = passes[pass];
        this._geometryRendererShaders[offset] = passes[pass].getShaderVariant();
        offset++;
      }
    }
  };
  _proto.initOcclusionQuery = function initOcclusionQuery() {
    if (!this._occlusionQueryInputAssembler) {
      this._occlusionQueryInputAssembler = this._createOcclusionQueryIA();
    }
    if (!this._occlusionQueryMaterial) {
      var mat = new Material();
      mat._uuid = 'default-occlusion-query-material';
      mat.initialize({
        effectName: 'internal/builtin-occlusion-query'
      });
      this._occlusionQueryMaterial = mat;
      if (mat.passes.length > 0) {
        this._occlusionQueryShader = mat.passes[0].getShaderVariant();
      }
    }
  };
  _proto.getOcclusionQueryPass = function getOcclusionQueryPass() {
    if (this._occlusionQueryMaterial && this._occlusionQueryMaterial.passes.length > 0) {
      return this._occlusionQueryMaterial.passes[0];
    }
    return null;
  };
  _proto.updatePipelineSceneData = function updatePipelineSceneData() {};
  _proto.destroy = function destroy() {
    var _this$_occlusionQuery, _this$_occlusionQuery2, _this$_occlusionQuery3;
    this.shadows.destroy();
    this.csmLayers.destroy();
    this.validPunctualLights.length = 0;
    (_this$_occlusionQuery = this._occlusionQueryInputAssembler) == null ? void 0 : _this$_occlusionQuery.destroy();
    this._occlusionQueryInputAssembler = null;
    (_this$_occlusionQuery2 = this._occlusionQueryVertexBuffer) == null ? void 0 : _this$_occlusionQuery2.destroy();
    this._occlusionQueryVertexBuffer = null;
    (_this$_occlusionQuery3 = this._occlusionQueryIndicesBuffer) == null ? void 0 : _this$_occlusionQuery3.destroy();
    this._occlusionQueryIndicesBuffer = null;
    this._standardSkinMeshRenderer = null;
    this._standardSkinModel = null;
    this._skinMaterialModel = null;
  };
  _proto._createOcclusionQueryIA = function _createOcclusionQueryIA() {
    var device = this._device;
    var vertices = new Float32Array([-1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1]);
    var vbStride = Float32Array.BYTES_PER_ELEMENT * 3;
    var vbSize = vbStride * 8;
    this._occlusionQueryVertexBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, vbSize, vbStride));
    this._occlusionQueryVertexBuffer.update(vertices);
    var indices = new Uint16Array([0, 2, 1, 1, 2, 3, 4, 5, 6, 5, 7, 6, 1, 3, 7, 1, 7, 5, 0, 4, 6, 0, 6, 2, 0, 1, 5, 0, 5, 4, 2, 6, 7, 2, 7, 3]);
    var ibStride = Uint16Array.BYTES_PER_ELEMENT;
    var ibSize = ibStride * 36;
    this._occlusionQueryIndicesBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, ibSize, ibStride));
    this._occlusionQueryIndicesBuffer.update(indices);
    var attributes = [new Attribute('a_position', Format.RGB32F)];
    var info = new InputAssemblerInfo(attributes, [this._occlusionQueryVertexBuffer], this._occlusionQueryIndicesBuffer);
    var inputAssembler = device.createInputAssembler(info);
    return inputAssembler;
  };
  return _createClass(PipelineSceneData, [{
    key: "isHDR",
    get: function get() {
      return this._isHDR;
    },
    set: function set(val) {
      this._isHDR = val;
    }
  }, {
    key: "shadingScale",
    get: function get() {
      return this._shadingScale;
    },
    set: function set(val) {
      this._shadingScale = val;
    }
  }, {
    key: "csmSupported",
    get: function get() {
      return this._csmSupported;
    },
    set: function set(val) {
      this._csmSupported = val;
    }
  }, {
    key: "standardSkinModel",
    get: function get() {
      return this._standardSkinModel;
    },
    set: function set(val) {
      this._standardSkinModel = val;
    }
  }, {
    key: "standardSkinMeshRenderer",
    get: function get() {
      return this._standardSkinMeshRenderer;
    },
    set: function set(val) {
      if (this._standardSkinMeshRenderer && this._standardSkinMeshRenderer !== val) {
        this._standardSkinMeshRenderer.clearGlobalStandardSkinObjectFlag();
      }
      this._standardSkinMeshRenderer = val;
      this.standardSkinModel = val ? val.model : null;
    }
  }, {
    key: "skinMaterialModel",
    get: function get() {
      return this._skinMaterialModel;
    },
    set: function set(val) {
      this._skinMaterialModel = val;
    }
  }, {
    key: "geometryRendererPasses",
    get: function get() {
      return this._geometryRendererPasses;
    }
  }, {
    key: "geometryRendererShaders",
    get: function get() {
      return this._geometryRendererShaders;
    }
  }]);
}();

var PipelineEventType;
(function (PipelineEventType) {
  PipelineEventType["RENDER_FRAME_BEGIN"] = "render-frame-begin";
  PipelineEventType["RENDER_FRAME_END"] = "render-frame-end";
  PipelineEventType["RENDER_CAMERA_BEGIN"] = "render-camera-begin";
  PipelineEventType["RENDER_CAMERA_END"] = "render-camera-end";
  PipelineEventType["ATTACHMENT_SCALE_CAHNGED"] = "attachment-scale-changed";
})(PipelineEventType || (PipelineEventType = {}));
var PipelineEventProcessor = function (_EventTarget) {
  function PipelineEventProcessor() {
    var _this;
    _this = _EventTarget.call(this) || this;
    _this.eventTargetOn = _EventTarget.prototype.on;
    _this.eventTargetOnce = _EventTarget.prototype.once;
    return _this;
  }
  _inheritsLoose(PipelineEventProcessor, _EventTarget);
  var _proto = PipelineEventProcessor.prototype;
  _proto.on = function on(type, callback, target, once) {
    return this.eventTargetOn(type, callback, target, once);
  };
  _proto.once = function once(type, callback, target) {
    return this.eventTargetOnce(type, callback, target);
  };
  return PipelineEventProcessor;
}(EventTarget);

var RenderingDebugViewType = {
  NONE: 0,
  SINGLE: 1,
  COMPOSITE_AND_MISC: 2
};
var DebugViewSingleType = {
  NONE: 0,
  AO: 32};
var DebugViewCompositeType = {
  DIRECT_DIFFUSE: 0,
  AO: 7,
  MAX_BIT_COUNT: 17
};
var DebugView = function () {
  function DebugView() {
    this._singleMode = DebugViewSingleType.NONE;
    this._compositeModeValue = 0;
    this._lightingWithAlbedo = true;
    this._csmLayerColoration = false;
    this._activate();
  }
  var _proto = DebugView.prototype;
  _proto.isCompositeModeEnabled = function isCompositeModeEnabled(val) {
    var mode = this._compositeModeValue & 1 << val;
    return mode !== 0;
  };
  _proto.enableCompositeMode = function enableCompositeMode(val, enable) {
    this._enableCompositeMode(val, enable);
    this._updatePipeline();
  };
  _proto.enableAllCompositeMode = function enableAllCompositeMode(enable) {
    this._enableAllCompositeMode(enable);
    this._updatePipeline();
  };
  _proto.isEnabled = function isEnabled() {
    return this._getType() !== RenderingDebugViewType.NONE;
  };
  _proto.reset = function reset() {
    this._activate();
    this._updatePipeline();
  };
  _proto._activate = function _activate() {
    this._singleMode = DebugViewSingleType.NONE;
    this._enableAllCompositeMode(true);
    this._lightingWithAlbedo = true;
    this._csmLayerColoration = false;
  };
  _proto._updatePipeline = function _updatePipeline() {
    var root = cclegacy.director.root;
    var pipeline = root.pipeline;
    var useDebugView = this._getType();
    if (pipeline.macros.CC_USE_DEBUG_VIEW !== useDebugView) {
      pipeline.macros.CC_USE_DEBUG_VIEW = useDebugView;
      root.onGlobalPipelineStateChanged();
    }
  };
  _proto._enableCompositeMode = function _enableCompositeMode(val, enable) {
    if (enable) {
      this._compositeModeValue |= 1 << val;
    } else {
      this._compositeModeValue &= ~(1 << val);
    }
  };
  _proto._enableAllCompositeMode = function _enableAllCompositeMode(enable) {
    for (var i = 0; i < DebugViewCompositeType.MAX_BIT_COUNT; i++) {
      if (enable) {
        this._compositeModeValue |= 1 << i;
      } else {
        this._compositeModeValue &= ~(1 << i);
      }
    }
  };
  _proto._getType = function _getType() {
    if (this._singleMode !== DebugViewSingleType.NONE) {
      return RenderingDebugViewType.SINGLE;
    } else if (this._lightingWithAlbedo !== true || this._csmLayerColoration !== false) {
      return RenderingDebugViewType.COMPOSITE_AND_MISC;
    } else {
      for (var i = 0; i < DebugViewCompositeType.MAX_BIT_COUNT; i++) {
        if (!this.isCompositeModeEnabled(i)) {
          return RenderingDebugViewType.COMPOSITE_AND_MISC;
        }
      }
    }
    return RenderingDebugViewType.NONE;
  };
  return _createClass(DebugView, [{
    key: "singleMode",
    get: function get() {
      return this._singleMode;
    },
    set: function set(val) {
      this._singleMode = val;
      this._updatePipeline();
    }
  }, {
    key: "lightingWithAlbedo",
    get: function get() {
      return this._lightingWithAlbedo;
    },
    set: function set(val) {
      this._lightingWithAlbedo = val;
      this._updatePipeline();
    }
  }, {
    key: "csmLayerColoration",
    get: function get() {
      return this._csmLayerColoration;
    },
    set: function set(val) {
      this._csmLayerColoration = val;
      this._updatePipeline();
    }
  }, {
    key: "debugViewType",
    get: function get() {
      return this._getType();
    }
  }]);
}();

export { CameraProjection as C, DebugView as D, LightType as L, Octree as O, PipelineEventType as P, RenderTexture as R, SkyBoxFlagValue as S, TrackingType as T, CameraFOVAxis as a, CameraAperture as b, CameraShutter as c, CameraISO as d, CameraType as e, Camera as f, RenderingSubMesh as g, PipelineEventProcessor as h, SceneAsset as i, CameraUsage as j, ColorTemperatureToRGB as k, Light as l, mapBuffer as m, ProbeClearFlag as n, ProbeType as o, ReflectionProbe as p, SKYBOX_FLAG as q, readBuffer as r, Skin as s, nt2lm as t, PipelineSceneData as u, DebugViewCompositeType as v, writeBuffer as w, DebugViewSingleType as x };
//# sourceMappingURL=debug-view-BuNhRPv_.js.map
