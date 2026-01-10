import { c as ccclass, d as disallowMultiple, l as executionOrder, r as requireComponent, f as Vec3, t as type, N as visibleRect, o as screen, b as applyDecoratedInitializer, s as serializable, j as removeProperty, i as replaceProperty, C as Color, G as markAsWarning, V as Vec2 } from './index-uXI1_UMk.js';
import { _ as _inheritsLoose, a as _createClass, b as _applyDecoratedDescriptor, m as setClassAlias } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import { i as UITransform, b as Stage, U as UIRenderer } from './ui-renderer-JpGcj-VM.js';
import { a as CameraEvent, C as Camera } from './camera-component-BFt9vSC_.js';
import { v as view } from './deprecated-Dswa7XeN.js';
import { T as TransformBit, d as builtinResMgr } from './scene-vWcxM1_c.js';
import { M as Model } from './deprecated-n0w4kK7g.js';
import { M as ModelLocalBindings } from './pipeline-state-manager-C5U4ouGL.js';
import './debug-view-BuNhRPv_.js';
import { S as SpriteFrame } from './sprite-frame-DHXMUUT-.js';
import './deprecated-CzzdLkmW.js';
import { M as ModelRenderer } from './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';

var _dec$3, _dec2$3, _dec3$3, _class$3;
var RenderRoot2D = (_dec$3 = ccclass('cc.RenderRoot2D'), _dec2$3 = executionOrder(100), _dec3$3 = requireComponent(UITransform), _dec$3(_class$3 = _dec2$3(_class$3 = _dec3$3(_class$3 = disallowMultiple(_class$3 = function (_Component) {
  function RenderRoot2D() {
    return _Component.apply(this, arguments) || this;
  }
  _inheritsLoose(RenderRoot2D, _Component);
  var _proto = RenderRoot2D.prototype;
  _proto.onEnable = function onEnable() {
    cclegacy.director.root.batcher2D.addScreen(this);
  };
  _proto.onDisable = function onDisable() {
    cclegacy.director.root.batcher2D.removeScreen(this);
  };
  _proto.onDestroy = function onDestroy() {
    cclegacy.director.root.batcher2D.removeScreen(this);
  };
  return RenderRoot2D;
}(Component)) || _class$3) || _class$3) || _class$3) || _class$3);

var _dec$2, _dec2$2, _dec3$2, _dec4, _class$2, _class2$1, _initializer$1, _initializer2$1;
var _worldPos = new Vec3();
var CanvasRenderMode;
(function (CanvasRenderMode) {
  CanvasRenderMode[CanvasRenderMode["OVERLAY"] = 0] = "OVERLAY";
  CanvasRenderMode[CanvasRenderMode["INTERSPERSE"] = 1] = "INTERSPERSE";
})(CanvasRenderMode || (CanvasRenderMode = {}));
var Canvas = (_dec$2 = ccclass('cc.Canvas'), _dec2$2 = executionOrder(100), _dec3$2 = type(Camera), _dec4 = type(Camera), _dec$2(_class$2 = _dec2$2(_class$2 = disallowMultiple(_class$2 = (_class2$1 = function (_RenderRoot2D) {
  function Canvas() {
    var _this;
    _this = _RenderRoot2D.call(this) || this;
    _this._cameraComponent = _initializer$1 && _initializer$1();
    _this._alignCanvasWithScreen = _initializer2$1 && _initializer2$1();
    _this._pos = new Vec3();
    _this._renderMode = CanvasRenderMode.OVERLAY;
    _this._thisOnCameraResized = _this._onResizeCamera.bind(_this);
    return _this;
  }
  _inheritsLoose(Canvas, _RenderRoot2D);
  var _proto = Canvas.prototype;
  _proto.__preload = function __preload() {
    var widget = this.getComponent('cc.Widget');
    if (widget) {
      widget.updateAlignment();
    }
    {
      if (this._cameraComponent) {
        this._cameraComponent._createCamera();
        this._cameraComponent.node.on(CameraEvent.TARGET_TEXTURE_CHANGE, this._thisOnCameraResized);
      }
    }
    this._onResizeCamera();
    {
      view.on('canvas-resize', this._thisOnCameraResized, this);
      view.on('design-resolution-changed', this._thisOnCameraResized, this);
    }
  };
  _proto.onEnable = function onEnable() {
    _RenderRoot2D.prototype.onEnable.call(this);
    if (this._cameraComponent) {
      this._cameraComponent.node.on(CameraEvent.TARGET_TEXTURE_CHANGE, this._thisOnCameraResized);
    }
  };
  _proto.onDisable = function onDisable() {
    _RenderRoot2D.prototype.onDisable.call(this);
    if (this._cameraComponent) {
      this._cameraComponent.node.off(CameraEvent.TARGET_TEXTURE_CHANGE, this._thisOnCameraResized);
    }
  };
  _proto.onDestroy = function onDestroy() {
    _RenderRoot2D.prototype.onDestroy.call(this);
    view.off('canvas-resize', this._thisOnCameraResized, this);
    view.off('design-resolution-changed', this._thisOnCameraResized, this);
  };
  _proto._onResizeCamera = function _onResizeCamera() {
    if (this._cameraComponent && this._alignCanvasWithScreen) {
      if (this._cameraComponent.targetTexture) {
        this._cameraComponent.orthoHeight = visibleRect.height / 2;
      } else {
        var size = screen.windowSize;
        this._cameraComponent.orthoHeight = size.height / view.getScaleY() / 2;
      }
      this.node.getWorldPosition(_worldPos);
      this._cameraComponent.node.setWorldPosition(_worldPos.x, _worldPos.y, 1000);
    }
  };
  _proto._getViewPriority = function _getViewPriority() {
    if (this._cameraComponent) {
      var _this$cameraComponent;
      var priority = (_this$cameraComponent = this.cameraComponent) == null ? void 0 : _this$cameraComponent.priority;
      priority = this._renderMode === CanvasRenderMode.OVERLAY ? priority | 1 << 30 : priority & -1073741825;
      return priority;
    }
    return 0;
  };
  return _createClass(Canvas, [{
    key: "renderMode",
    get: function get() {
      return this._renderMode;
    },
    set: function set(val) {
      this._renderMode = val;
      if (this._cameraComponent) {
        this._cameraComponent.priority = this._getViewPriority();
      }
    }
  }, {
    key: "cameraComponent",
    get: function get() {
      return this._cameraComponent;
    },
    set: function set(value) {
      if (this._cameraComponent === value) {
        return;
      }
      this._cameraComponent = value;
      this._onResizeCamera();
    }
  }, {
    key: "alignCanvasWithScreen",
    get: function get() {
      return this._alignCanvasWithScreen;
    },
    set: function set(value) {
      this._alignCanvasWithScreen = value;
      this._onResizeCamera();
    }
  }]);
}(RenderRoot2D), _applyDecoratedDescriptor(_class2$1.prototype, "cameraComponent", [_dec3$2], Object.getOwnPropertyDescriptor(_class2$1.prototype, "cameraComponent"), _class2$1.prototype), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_cameraComponent", [_dec4], function () {
  return null;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_alignCanvasWithScreen", [serializable], function () {
  return true;
}), _class2$1)) || _class$2) || _class$2) || _class$2);
cclegacy.Canvas = Canvas;

var _dec$1, _dec2$1, _dec3$1, _class$1;
var UIComponent = (_dec$1 = ccclass('cc.UIComponent'), _dec2$1 = requireComponent(UITransform), _dec3$1 = executionOrder(110), _dec$1(_class$1 = _dec2$1(_class$1 = _dec3$1(_class$1 = disallowMultiple(_class$1 = function (_Component) {
  function UIComponent() {
    var _this;
    _this = _Component.call(this) || this;
    _this._lastParent = null;
    _this.stencilStage = Stage.DISABLED;
    return _this;
  }
  _inheritsLoose(UIComponent, _Component);
  var _proto = UIComponent.prototype;
  _proto.__preload = function __preload() {
    this.node._uiProps.uiComp = this;
  };
  _proto.onEnable = function onEnable() {};
  _proto.onDisable = function onDisable() {};
  _proto.onDestroy = function onDestroy() {
    var uiProps = this.node._uiProps;
    if (uiProps.uiComp === this) {
      uiProps.uiComp = null;
    }
  };
  _proto.postUpdateAssembler = function postUpdateAssembler(render) {};
  _proto.markForUpdateRenderData = function markForUpdateRenderData(enable) {
  };
  _proto.setNodeDirty = function setNodeDirty() {};
  _proto.setTextureDirty = function setTextureDirty() {};
  return UIComponent;
}(Component)) || _class$1) || _class$1) || _class$1) || _class$1);

removeProperty(UIComponent.prototype, 'UIComponent', [{
  name: '_visibility'
}, {
  name: 'setVisibility'
}]);
replaceProperty(Canvas.prototype, 'Canvas.prototype', [{
  name: 'camera',
  newName: 'cameraComponent.camera',
  customGetter: function customGetter() {
    var _this$_cameraComponen;
    return (_this$_cameraComponen = this._cameraComponent) == null ? void 0 : _this$_cameraComponen.camera;
  }
}, {
  name: 'clearFlag',
  newName: 'cameraComponent.clearFlags',
  customGetter: function customGetter() {
    return this._cameraComponent ? this._cameraComponent.clearFlags : 0;
  },
  customSetter: function customSetter(val) {
    if (this._cameraComponent) this._cameraComponent.clearFlags = val;
  }
}, {
  name: 'color',
  newName: 'cameraComponent.clearColor',
  customGetter: function customGetter() {
    return this._cameraComponent ? this._cameraComponent.clearColor : Color.BLACK;
  },
  customSetter: function customSetter(val) {
    if (this._cameraComponent) this._cameraComponent.clearColor = val;
  }
}, {
  name: 'priority',
  newName: 'cameraComponent.priority',
  customGetter: function customGetter() {
    return this._cameraComponent ? this._cameraComponent.priority : 0;
  },
  customSetter: function customSetter(val) {
    if (this._cameraComponent) this._cameraComponent.priority = val;
  }
}, {
  name: 'targetTexture',
  newName: 'cameraComponent.targetTexture',
  customGetter: function customGetter() {
    return this._cameraComponent ? this._cameraComponent.targetTexture : null;
  },
  customSetter: function customSetter(value) {
    if (this._cameraComponent) this._cameraComponent.targetTexture = value;
  }
}, {
  name: 'visibility',
  newName: 'cameraComponent.visibility',
  customGetter: function customGetter() {
    return this._cameraComponent ? this._cameraComponent.visibility : 0;
  }
}]);
markAsWarning(UITransform.prototype, 'UITransform.prototype', [{
  name: 'priority',
  suggest: "Please use setSiblingIndex to change index of the current node in its parent's children array."
}]);
cclegacy.UITransformComponent = UITransform;
setClassAlias(UITransform, 'cc.UITransformComponent');
setClassAlias(UIRenderer, 'cc.RenderComponent');
cclegacy.CanvasComponent = Canvas;
setClassAlias(Canvas, 'cc.CanvasComponent');
cclegacy.internal.Renderable2D = UIRenderer;
setClassAlias(UIRenderer, 'cc.Renderable2D');

var _dec, _dec2, _dec3, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6;
var SpriteMode;
(function (SpriteMode) {
  SpriteMode[SpriteMode["SIMPLE"] = 0] = "SIMPLE";
  SpriteMode[SpriteMode["SLICED"] = 1] = "SLICED";
  SpriteMode[SpriteMode["TILED"] = 2] = "TILED";
})(SpriteMode || (SpriteMode = {}));
var SpriteRenderer = (_dec = ccclass('cc.SpriteRenderer'), _dec2 = executionOrder(100), _dec3 = type(SpriteFrame), _dec(_class = _dec2(_class = (_class2 = function (_ModelRenderer) {
  function SpriteRenderer() {
    var _this;
    _this = _ModelRenderer.call(this) || this;
    _this._spriteFrame = _initializer && _initializer();
    _this._mode = _initializer2 && _initializer2();
    _this._color = _initializer3 && _initializer3();
    _this._flipX = _initializer4 && _initializer4();
    _this._flipY = _initializer5 && _initializer5();
    _this._size = _initializer6 && _initializer6();
    _this._model = null;
    return _this;
  }
  _inheritsLoose(SpriteRenderer, _ModelRenderer);
  var _proto = SpriteRenderer.prototype;
  _proto.onLoad = function onLoad() {
    if (this._spriteFrame) {
      if (!this._spriteFrame.mesh) {
        this._spriteFrame.ensureMeshData();
      }
      this._spriteFrame.mesh.initialize();
    }
    this._updateModels();
  };
  _proto.onRestore = function onRestore() {
    this._updateModels();
    if (this.enabledInHierarchy) {
      this._attachToScene();
    }
  };
  _proto.onEnable = function onEnable() {
    _ModelRenderer.prototype.onEnable.call(this);
    if (!this._model) {
      this._updateModels();
    }
    this._attachToScene();
  };
  _proto.onDisable = function onDisable() {
    if (this._model) {
      this._detachFromScene();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._model) {
      cclegacy.director.root.destroyModel(this._model);
      this._model = null;
      this._models.length = 0;
    }
  };
  _proto._updateModels = function _updateModels() {
    if (!this._spriteFrame) {
      return;
    }
    var model = this._model;
    if (model) {
      model.destroy();
      model.initialize();
      model.node = model.transform = this.node;
    } else {
      this._createModel();
    }
    if (this._model) {
      var mesh = this._spriteFrame.mesh;
      this._model.createBoundingShape(mesh.struct.minPosition, mesh.struct.maxPosition);
      this._updateModelParams();
      this._onUpdateLocalDescriptorSet();
    }
  };
  _proto._createModel = function _createModel() {
    var model = this._model = cclegacy.director.root.createModel(Model);
    model.visFlags = this.visibility;
    model.node = model.transform = this.node;
    this._models.length = 0;
    this._models.push(this._model);
  };
  _proto._updateModelParams = function _updateModelParams() {
    if (!this._spriteFrame || !this._model) {
      return;
    }
    this._spriteFrame.ensureMeshData();
    var mesh = this._spriteFrame.mesh;
    this.node.hasChangedFlags |= TransformBit.POSITION;
    this._model.transform.hasChangedFlags |= TransformBit.POSITION;
    var renderingMesh = mesh ? mesh.renderingSubMeshes : null;
    if (renderingMesh) {
      var meshCount = renderingMesh.length;
      for (var i = 0; i < meshCount; ++i) {
        var material = this.getRenderMaterial(i);
        if (material && !material.isValid) {
          material = null;
        }
        var subMeshData = renderingMesh[i];
        if (subMeshData) {
          this._model.initSubModel(i, subMeshData, material || this._getBuiltinMaterial());
        }
      }
    }
    this._model.enabled = true;
  };
  _proto._getBuiltinMaterial = function _getBuiltinMaterial() {
    return builtinResMgr.get('missing-material');
  };
  _proto._onMaterialModified = function _onMaterialModified(idx, material) {
    _ModelRenderer.prototype._onMaterialModified.call(this, idx, material);
    if (!this._spriteFrame || !this._model || !this._model.inited) {
      return;
    }
    this._onRebuildPSO(idx, material || this._getBuiltinMaterial());
  };
  _proto._onRebuildPSO = function _onRebuildPSO(idx, material) {
    if (!this._model || !this._model.inited) {
      return;
    }
    this._model.setSubModelMaterial(idx, material);
    this._onUpdateLocalDescriptorSet();
  };
  _proto._onUpdateLocalDescriptorSet = function _onUpdateLocalDescriptorSet() {
    if (!this._spriteFrame || !this._model || !this._model.inited) {
      return;
    }
    var texture = this._spriteFrame.getGFXTexture();
    var sampler = this._spriteFrame.getGFXSampler();
    var subModels = this._model.subModels;
    var binding = ModelLocalBindings.SAMPLER_SPRITE;
    for (var i = 0; i < subModels.length; i++) {
      var descriptorSet = subModels[i].descriptorSet;
      descriptorSet.bindTexture(binding, texture);
      descriptorSet.bindSampler(binding, sampler);
      descriptorSet.update();
    }
  };
  _proto._attachToScene = function _attachToScene() {
    if (!this.node.scene || !this._model) {
      return;
    }
    var renderScene = this._getRenderScene();
    if (this._model.scene !== null) {
      this._detachFromScene();
    }
    renderScene.addModel(this._model);
  };
  _proto._detachFromScene = function _detachFromScene() {
    if (this._model && this._model.scene) {
      this._model.scene.removeModel(this._model);
    }
  };
  return _createClass(SpriteRenderer, [{
    key: "spriteFrame",
    get: function get() {
      return this._spriteFrame;
    },
    set: function set(value) {
      if (this._spriteFrame === value) {
        return;
      }
      this._spriteFrame;
      this._spriteFrame = value;
      if (this._spriteFrame) {
        this._spriteFrame.ensureMeshData();
        var mesh = this._spriteFrame.mesh;
        mesh.initialize();
      }
      this._updateModels();
      if (this.enabledInHierarchy) {
        this._attachToScene();
      }
    }
  }, {
    key: "model",
    get: function get() {
      return this._model;
    }
  }]);
}(ModelRenderer), _applyDecoratedDescriptor(_class2.prototype, "spriteFrame", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "spriteFrame"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_spriteFrame", [serializable], function () {
  return null;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_mode", [serializable], function () {
  return SpriteMode.SIMPLE;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_color", [serializable], function () {
  return Color.WHITE.clone();
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_flipX", [serializable], function () {
  return false;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_flipY", [serializable], function () {
  return false;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_size", [serializable], function () {
  return new Vec2();
}), _class2)) || _class) || _class);

export { Canvas as C, RenderRoot2D as R, SpriteRenderer as S, UIComponent as U };
//# sourceMappingURL=sprite-renderer-C7_6H1N4.js.map
