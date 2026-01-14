import { D as DrawBatch2D, f as fillMeshVertices3D, B as Batcher2D } from './batcher-2d-DWdWoCVz.js';
import { S as SpriteFrame, d as dynamicAtlasManager } from './sprite-frame-DHXMUUT-.js';
export { A as Atlas, D as DynamicAtlasManager, a as SpriteFrameEvent } from './sprite-frame-DHXMUUT-.js';
import { S as Sprite } from './sprite-BKXaVEzt.js';
export { b as SpriteAtlas } from './sprite-BKXaVEzt.js';
import { L as Label, C as CanvasPool, s as shareLabelInfo, O as Overflow$1, a as BASELINE_RATIO, b as safeMeasureText, f as fragmentText, H as HorizontalTextAlignment, V as VerticalTextAlignment, g as getSymbolLength, c as getSymbolAt, i as isUnicodeSpace, d as getSymbolCodeAt, e as isUnicodeCJK, h as getBaselineOffset, j as LetterAtlas, F as FontAtlas, k as CacheMode, l as computeHash, B as BitmapFont } from './label-B6xdfUV_.js';
export { n as Font, o as HtmlTextParser, p as LRUCache, m as LabelAtlas, M as MIDDLE_RATIO, T as TTFFont, t as getEnglishWordPartAtFirst, u as getEnglishWordPartAtLast, q as isEnglishWordPartAtFirst, r as isEnglishWordPartAtLast } from './label-B6xdfUV_.js';
import { _ as _inheritsLoose, w as warnID, a as _createClass, I as assert, o as assertIsTrue, b as _applyDecoratedDescriptor, m as setClassAlias, W as logID, k as errorID, au as remove, ax as removeAt, d as CCObjectFlags } from './gc-object-CShF5lzx.js';
import { c as ccclass, l as executionOrder, r as requireComponent, L as override, d as disallowMultiple, a as clamp, b as applyDecoratedInitializer, s as serializable, i as replaceProperty, G as markAsWarning, m as Rect, V as Vec2, C as Color, A as approx, M as Mat4, j as removeProperty } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { R as RenderPriority } from './pipeline-state-manager-C5U4ouGL.js';
import { b as Stage, f as RenderEntity, h as RenderEntityType, U as UIRenderer, o as MeshBuffer, M as MeshRenderData, l as RenderData } from './ui-renderer-JpGcj-VM.js';
export { B as BaseRenderData, I as InstanceMaterialType, S as StencilManager, i as UITransform, i as UITransformComponent, p as UIVertexFormat } from './ui-renderer-JpGcj-VM.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import { u as uiRendererManager, d as director } from './director-F7e_Lqjg.js';
import { v as view } from './deprecated-Dswa7XeN.js';
import { Mask, MaskType } from './mask.js';
import { RichText } from './rich-text.js';
import { G as Graphics } from './graphics-B_abEIjK.js';
import { W as WrapMode, aH as NodeEventProcessor, aI as DispatcherEventType } from './scene-vWcxM1_c.js';
import { E as EventDispatcherPriority, i as input } from './prefab-DYg_oxpo.js';
import { I as InputEventType, d as EventTouch } from './touch-BKrZ-fxl.js';
export { C as Canvas, C as CanvasComponent, R as RenderRoot2D, S as SpriteRenderer, U as UIComponent } from './sprite-renderer-C7_6H1N4.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './debug-view-BuNhRPv_.js';
import './deprecated-n0w4kK7g.js';
import './deprecated-CN-RjLP6.js';
import './create-mesh-CfKC5EQd.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './renderer-C7HM72NY.js';
import './sorting-layers-BHqhkSbY.js';
import './camera-component-BFt9vSC_.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';

var _dec$4, _dec2$4, _class$4;
var UIMeshRenderer = (_dec$4 = ccclass('cc.UIMeshRenderer'), _dec2$4 = executionOrder(110), _dec$4(_class$4 = _dec2$4(_class$4 = function (_Component) {
  function UIMeshRenderer() {
    var _this;
    _this = _Component.call(this) || this;
    _this._modelComponent = null;
    _this._dirtyVersion = -1;
    _this._internalId = -1;
    _this.stencilStage = Stage.DISABLED;
    _this._renderData = null;
    _this._renderEntity = new RenderEntity(RenderEntityType.DYNAMIC);
    return _this;
  }
  _inheritsLoose(UIMeshRenderer, _Component);
  var _proto = UIMeshRenderer.prototype;
  _proto.__preload = function __preload() {
    this.node._uiProps.uiComp = this;
  };
  _proto.onEnable = function onEnable() {
    uiRendererManager.addRenderer(this);
    this._markForUpdateRenderData();
  };
  _proto.onDisable = function onDisable() {
    uiRendererManager.removeRenderer(this);
    this.renderEntity.enabled = this._canRender();
  };
  _proto.onLoad = function onLoad() {
    if (!this.node._getUITransformComp()) {
      this.node.addComponent('cc.UITransform');
    }
    this._modelComponent = this.getComponent('cc.ModelRenderer');
    if (!this._modelComponent) {
      warnID(16378, this.node ? this.node.name : '');
      return;
    }
    this.renderEntity.setNode(this.node);
  };
  _proto.onDestroy = function onDestroy() {
    this.renderEntity.setNode(null);
    if (this.node._uiProps.uiComp === this) {
      this.node._uiProps.uiComp = null;
    }
    this._modelComponent = this.getComponent('cc.ModelRenderer');
    if (!this._modelComponent) {
      return;
    }
    this._modelComponent._sceneGetter = null;
  };
  _proto._render = function _render(render) {
    if (this._modelComponent) {
      var models = this._modelComponent._collectModels();
      this._modelComponent._detachFromScene();
      for (var i = 0; i < models.length; i++) {
        if (models[i].enabled) {
          render.commitModel(this, models[i], this._modelComponent.material);
        }
      }
      return true;
    }
    return false;
  };
  _proto.fillBuffers = function fillBuffers(render) {
    if (this.enabled) {
      this._render(render);
    }
  };
  _proto.updateRenderer = function updateRenderer() {
  };
  _proto._uploadRenderData = function _uploadRenderData(index) {
  };
  _proto.postUpdateAssembler = function postUpdateAssembler(render) {};
  _proto.update = function update() {
    this._fitUIRenderQueue();
  };
  _proto._fitUIRenderQueue = function _fitUIRenderQueue() {
    if (!this._modelComponent) {
      return;
    }
    var matNum = this._modelComponent.sharedMaterials.length;
    for (var i = 0; i < matNum; i++) {
      var material = this._modelComponent.getMaterialInstance(i);
      if (material == null) {
        continue;
      }
      var passes = material.passes;
      var passNum = passes.length;
      for (var j = 0; j < passNum; j++) {
        var pass = passes[j];
        pass.setPriority(RenderPriority.MAX - 11);
        material.recompileShaders({
          CC_FORCE_FORWARD_SHADING: true
        }, j);
      }
    }
  };
  _proto.markForUpdateRenderData = function markForUpdateRenderData(enable) {
    if (enable === void 0) {
      enable = true;
    }
    this._markForUpdateRenderData(enable);
  };
  _proto._markForUpdateRenderData = function _markForUpdateRenderData(enable) {
    uiRendererManager.markDirtyRenderer(this);
  };
  _proto.setNodeDirty = function setNodeDirty() {};
  _proto.setTextureDirty = function setTextureDirty() {};
  _proto._canRender = function _canRender() {
    return this.enabled && this._modelComponent !== null;
  };
  return _createClass(UIMeshRenderer, [{
    key: "modelComponent",
    get: function get() {
      return this._modelComponent;
    }
  }, {
    key: "renderEntity",
    get: function get() {
      {
        assert(Boolean(this._renderEntity), 'this._renderEntity should not be invalid');
      }
      return this._renderEntity;
    }
  }, {
    key: "renderData",
    get: function get() {
      return this._renderData;
    }
  }]);
}(Component)) || _class$4) || _class$4);
cclegacy.UIMeshRenderer = UIMeshRenderer;

var _dec$3, _dec2$3, _dec3$1, _class$3;
var LabelOutline = (_dec$3 = ccclass('cc.LabelOutline'), _dec2$3 = executionOrder(110), _dec3$1 = requireComponent(Label), _dec$3(_class$3 = _dec2$3(_class$3 = _dec3$1(_class$3 = function (_Component) {
  function LabelOutline() {
    return _Component.apply(this, arguments) || this;
  }
  _inheritsLoose(LabelOutline, _Component);
  var _proto = LabelOutline.prototype;
  _proto.onEnable = function onEnable() {
    var label = this.node.getComponent(Label);
    assertIsTrue(label);
    label.enableOutline = true;
  };
  _proto.onDisable = function onDisable() {
    var label = this.node.getComponent(Label);
    assertIsTrue(label);
    label.enableOutline = false;
  };
  return _createClass(LabelOutline, [{
    key: "color",
    get: function get() {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      return label.outlineColor;
    },
    set: function set(value) {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      label.outlineColor = value;
    }
  }, {
    key: "width",
    get: function get() {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      return label.outlineWidth;
    },
    set: function set(value) {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      label.outlineWidth = value;
    }
  }]);
}(Component)) || _class$3) || _class$3) || _class$3);
cclegacy.LabelOutline = LabelOutline;

var _dec$2, _dec2$2, _class$2, _class2$1;
var UIStaticBatch = (_dec$2 = ccclass('cc.UIStaticBatch'), _dec2$2 = executionOrder(110), _dec$2(_class$2 = _dec2$2(_class$2 = (_class2$1 = function (_UIRenderer) {
  function UIStaticBatch() {
    var _this;
    _this = _UIRenderer.call(this) || this;
    _this._init = false;
    _this._bufferAccessor = null;
    _this._dirty = true;
    _this._uiDrawBatchList = [];
    return _this;
  }
  _inheritsLoose(UIStaticBatch, _UIRenderer);
  var _proto = UIStaticBatch.prototype;
  _proto.postUpdateAssembler = function postUpdateAssembler(render) {};
  _proto.markAsDirty = function markAsDirty() {};
  _proto._requireDrawBatch = function _requireDrawBatch() {
    var batch = new DrawBatch2D();
    batch.isStatic = true;
    this._uiDrawBatchList.push(batch);
    return batch;
  };
  _proto._clearData = function _clearData() {
    if (this._bufferAccessor) {
      this._bufferAccessor.reset();
      var ui = this._getBatcher();
      for (var i = 0; i < this._uiDrawBatchList.length; i++) {
        var element = this._uiDrawBatchList[i];
        element.destroy(ui);
      }
    }
    this._uiDrawBatchList.length = 0;
    this._init = false;
  };
  _proto._getBatcher = function _getBatcher() {
    if (director.root && director.root.batcher2D) {
      return director.root.batcher2D;
    }
    warnID(9301);
    return null;
  };
  return _createClass(UIStaticBatch, [{
    key: "color",
    get: function get() {
      return this._color;
    },
    set: function set(value) {
      if (this._color === value) {
        return;
      }
      this._color.set(value);
    }
  }, {
    key: "drawBatchList",
    get: function get() {
      return this._uiDrawBatchList;
    }
  }]);
}(UIRenderer), _applyDecoratedDescriptor(_class2$1.prototype, "color", [override], Object.getOwnPropertyDescriptor(_class2$1.prototype, "color"), _class2$1.prototype), _class2$1)) || _class$2) || _class$2);

var _dec$1, _dec2$1, _dec3, _class$1;
var LabelShadow = (_dec$1 = ccclass('cc.LabelShadow'), _dec2$1 = executionOrder(110), _dec3 = requireComponent(Label), _dec$1(_class$1 = _dec2$1(_class$1 = _dec3(_class$1 = function (_Component) {
  function LabelShadow() {
    return _Component.apply(this, arguments) || this;
  }
  _inheritsLoose(LabelShadow, _Component);
  var _proto = LabelShadow.prototype;
  _proto.onEnable = function onEnable() {
    var label = this.node.getComponent(Label);
    assertIsTrue(label);
    label.enableShadow = true;
  };
  _proto.onDisable = function onDisable() {
    var label = this.node.getComponent(Label);
    assertIsTrue(label);
    label.enableShadow = false;
  };
  return _createClass(LabelShadow, [{
    key: "color",
    get: function get() {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      return label.shadowColor;
    },
    set: function set(value) {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      label.shadowColor = value;
    }
  }, {
    key: "offset",
    get: function get() {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      return label.shadowOffset;
    },
    set: function set(value) {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      label.shadowOffset = value;
    }
  }, {
    key: "blur",
    get: function get() {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      return label.shadowBlur;
    },
    set: function set(value) {
      var label = this.node.getComponent(Label);
      assertIsTrue(label);
      label.shadowBlur = value;
    }
  }]);
}(Component)) || _class$1) || _class$1) || _class$1);

var _dec, _dec2, _class, _class2, _initializer;
var UIOpacity = (_dec = ccclass('cc.UIOpacity'), _dec2 = executionOrder(110), _dec(_class = _dec2(_class = disallowMultiple(_class = (_class2 = function (_Component) {
  function UIOpacity() {
    var _this;
    _this = _Component.call(this) || this;
    _this._opacity = _initializer && _initializer();
    return _this;
  }
  _inheritsLoose(UIOpacity, _Component);
  var _proto = UIOpacity.prototype;
  _proto.onEnable = function onEnable() {
    this._syncLocalOpacity(this._opacity / 255);
  };
  _proto.onDisable = function onDisable() {
    this._syncLocalOpacity(1);
  };
  _proto._syncLocalOpacity = function _syncLocalOpacity(localOpacity) {
    this.node._uiProps.localOpacity = localOpacity;
  };
  return _createClass(UIOpacity, [{
    key: "opacity",
    get: function get() {
      return this._opacity;
    },
    set: function set(value) {
      if (this._opacity === value) {
        return;
      }
      value = clamp(value, 0, 255);
      this._opacity = value;
      this._syncLocalOpacity(value / 255);
    }
  }]);
}(Component), _initializer = applyDecoratedInitializer(_class2.prototype, "_opacity", [serializable], function () {
  return 255;
}), _class2)) || _class) || _class) || _class);

cclegacy.MaskComponent = Mask;
setClassAlias(Mask, 'cc.MaskComponent');
cclegacy.LabelComponent = Label;
setClassAlias(Label, 'cc.LabelComponent');
cclegacy.LabelOutlineComponent = LabelOutline;
setClassAlias(LabelOutline, 'cc.LabelOutlineComponent');
cclegacy.RichTextComponent = RichText;
setClassAlias(RichText, 'cc.RichTextComponent');
cclegacy.SpriteComponent = Sprite;
setClassAlias(Sprite, 'cc.SpriteComponent');
cclegacy.UIModelComponent = UIMeshRenderer;
setClassAlias(UIMeshRenderer, 'cc.UIModelComponent');
cclegacy.GraphicsComponent = Graphics;
setClassAlias(Graphics, 'cc.GraphicsComponent');
setClassAlias(UIStaticBatch, 'cc.UIStaticBatchComponent');
setClassAlias(UIOpacity, 'cc.UIOpacityComponent');
replaceProperty(Mask.prototype, 'Mask', [{
  name: 'graphics',
  newName: 'subComp',
  target: Mask.prototype,
  targetName: 'Mask'
}]);
replaceProperty(MaskType, 'MaskType', [{
  name: 'RECT',
  newName: 'GRAPHICS_RECT',
  target: MaskType,
  targetName: 'MaskType'
}, {
  name: 'ELLIPSE',
  newName: 'GRAPHICS_ELLIPSE',
  target: MaskType,
  targetName: 'MaskType'
}, {
  name: 'IMAGE_STENCIL',
  newName: 'SPRITE_STENCIL',
  target: MaskType,
  targetName: 'MaskType'
}]);
markAsWarning(LabelOutline.prototype, 'LabelOutline', [{
  name: 'width',
  suggest: 'Please use Label.outlineWidth instead.'
}, {
  name: 'color',
  suggest: 'Please use Label.outlineColor instead.'
}]);
markAsWarning(LabelShadow.prototype, 'LabelShadow', [{
  name: 'color',
  suggest: 'Please use Label.shadowColor instead.'
}, {
  name: 'offset',
  suggest: 'Please use Label.shadowOffset instead.'
}, {
  name: 'blur',
  suggest: 'Please use Label.shadowBlur instead.'
}]);

var Alignment = ['left', 'center', 'right'];
var MAX_SIZE = 2048;
var _BASELINE_OFFSET = getBaselineOffset();
var _invisibleAlpha = (1 / 255).toFixed(3);
var MAX_CALCULATION_NUM = 3;
var LetterInfo = function LetterInfo() {
  this["char"] = '';
  this.valid = true;
  this.x = 0;
  this.y = 0;
  this.line = 0;
  this.hash = '';
};
var TextProcessing = function () {
  function TextProcessing() {
    this._context = null;
    this._canvas = null;
    this._canvasData = null;
    this._lettersInfo = [];
    this._tmpRect = new Rect();
    this._maxFontSize = 100;
    this._fontScale = 1;
    var canvasData = this._canvasData = CanvasPool.getInstance().get();
    this._canvas = canvasData.canvas;
    this._context = canvasData.context;
  }
  var _proto = TextProcessing.prototype;
  _proto.destroy = function destroy() {
    CanvasPool.getInstance().put(this._canvasData);
    this._canvasData = null;
    this._canvas = null;
    this._context = null;
    this._lettersInfo.length = 0;
  };
  _proto.processingString = function processingString(isBmFont, style, layout, outputLayoutData, inputString, out) {
    if (!isBmFont) {
      var loopTime = 0;
      this._fontScale = this._getStyleFontScale(style.fontSize, style.fontScale);
      this._updatePaddingRect(style, outputLayoutData);
      this._calculateLabelFont(style, layout, outputLayoutData, inputString);
      while ((outputLayoutData.canvasSize.width > MAX_SIZE || outputLayoutData.canvasSize.height > MAX_SIZE) && loopTime <= MAX_CALCULATION_NUM) {
        loopTime++;
        if (loopTime > MAX_CALCULATION_NUM) {
          this._fontScale = 1;
        } else {
          var maxValue = Math.max(outputLayoutData.canvasSize.width, outputLayoutData.canvasSize.height);
          var canvasScaleToMaxSizeRatio = MAX_SIZE / maxValue;
          this._fontScale *= canvasScaleToMaxSizeRatio;
          this._fontScale = Math.max(1, this._fontScale);
        }
        this._updatePaddingRect(style, outputLayoutData);
        this._calculateLabelFont(style, layout, outputLayoutData, inputString);
      }
    } else {
      if (!style.fntConfig) {
        this._fontScale = this._getStyleFontScale(style.originFontSize, style.fontScale);
      } else {
        this._fontScale = 1;
      }
      shareLabelInfo.fontScale = this._fontScale;
      this._setupBMFontOverflowMetrics(layout, outputLayoutData);
      this._updateFontScale(style);
      this._computeHorizontalKerningForText(style, layout, inputString);
      this._alignText(style, layout, outputLayoutData, inputString);
    }
    if (out) {
      out = outputLayoutData.parsedString;
    }
  };
  _proto.generateRenderInfo = function generateRenderInfo(isBmFont, style, layout, outputLayoutData, outputRenderData, inputString, callback) {
    if (!isBmFont) {
      this._updateLabelDimensions(style, layout, outputLayoutData);
      this._updateTexture(style, layout, outputLayoutData, outputRenderData);
      this.generateVertexData(isBmFont, style, layout, outputLayoutData, outputRenderData, inputString, callback);
    } else {
      this._computeAlignmentOffset(style, layout, outputLayoutData);
      this.generateVertexData(isBmFont, style, layout, outputLayoutData, outputRenderData, inputString, callback);
    }
  };
  _proto.setCanvasUsed = function setCanvasUsed(canvas, content) {
    this._canvas = canvas;
    this._context = content;
  };
  _proto._getStyleFontScale = function _getStyleFontScale(fontSize, fontScale) {
    var scale = fontScale;
    var maxFontSize = this._maxFontSize;
    if (scale * fontSize > maxFontSize && fontSize < maxFontSize) {
      scale = maxFontSize / fontSize;
    }
    if (scale < 1) {
      scale = 1;
    }
    return scale;
  };
  _proto._calculateLabelFont = function _calculateLabelFont(style, layout, outputLayoutData, inputString) {
    if (!this._context) {
      return;
    }
    style.actualFontSize = style.fontSize * this._fontScale;
    var paragraphedStrings = inputString.split('\n');
    var _splitStrings = outputLayoutData.parsedString = paragraphedStrings;
    var _fontDesc = this._getFontDesc(style.actualFontSize, style.fontFamily, style.isBold, style.isItalic);
    this._context.font = style.fontDesc = _fontDesc;
    var canvasSize = outputLayoutData.canvasSize,
      nodeContentSize = outputLayoutData.nodeContentSize,
      canvasPadding = outputLayoutData.canvasPadding,
      contentSizeExtend = outputLayoutData.contentSizeExtend;
    var fontScale = this._fontScale;
    switch (layout.overFlow) {
      case Overflow$1.NONE:
        {
          var canvasSizeX = 0;
          var canvasSizeY = 0;
          for (var i = 0; i < paragraphedStrings.length; ++i) {
            var paraLength = safeMeasureText(this._context, paragraphedStrings[i], _fontDesc);
            canvasSizeX = canvasSizeX > paraLength ? canvasSizeX : paraLength;
          }
          canvasSizeY = (_splitStrings.length + BASELINE_RATIO) * this._getLineHeight(layout.lineHeight, style.actualFontSize, style.fontSize);
          var rawWidth = canvasSizeX;
          var rawHeight = canvasSizeY;
          canvasSize.width = rawWidth + canvasPadding.width * fontScale;
          canvasSize.height = rawHeight + canvasPadding.height * fontScale;
          nodeContentSize.width = (rawWidth + contentSizeExtend.width * fontScale) / fontScale;
          nodeContentSize.height = (rawHeight + contentSizeExtend.height * fontScale) / fontScale;
          break;
        }
      case Overflow$1.SHRINK:
        {
          this._calculateShrinkFont(paragraphedStrings, style, layout, outputLayoutData);
          this._calculateWrapText(paragraphedStrings, style, layout, outputLayoutData);
          canvasSize.width = nodeContentSize.width * fontScale;
          canvasSize.height = nodeContentSize.height * fontScale;
          break;
        }
      case Overflow$1.CLAMP:
        {
          this._calculateWrapText(paragraphedStrings, style, layout, outputLayoutData);
          canvasSize.width = nodeContentSize.width * fontScale;
          canvasSize.height = nodeContentSize.height * fontScale;
          break;
        }
      case Overflow$1.RESIZE_HEIGHT:
        {
          this._calculateWrapText(paragraphedStrings, style, layout, outputLayoutData);
          var _rawHeight = (outputLayoutData.parsedString.length + BASELINE_RATIO) * this._getLineHeight(layout.lineHeight, style.actualFontSize, style.fontSize);
          canvasSize.width = nodeContentSize.width * fontScale;
          canvasSize.height = _rawHeight + canvasPadding.height * fontScale;
          nodeContentSize.height = (_rawHeight + contentSizeExtend.height * fontScale) / fontScale;
          break;
        }
    }
  };
  _proto._getFontDesc = function _getFontDesc(fontSize, fontFamily, isBold, isItalic) {
    var fontDesc = fontSize.toString() + "px ";
    fontDesc += fontFamily;
    if (isBold) {
      fontDesc = "bold " + fontDesc;
    }
    if (isItalic) {
      fontDesc = "italic " + fontDesc;
    }
    return fontDesc;
  };
  _proto._getLineHeight = function _getLineHeight(lineHeight, fontSize, drawFontsize) {
    var nodeSpacingY = lineHeight;
    if (nodeSpacingY === 0) {
      nodeSpacingY = fontSize;
    } else {
      nodeSpacingY = nodeSpacingY * fontSize / drawFontsize;
    }
    return nodeSpacingY;
  };
  _proto._calculateShrinkFont = function _calculateShrinkFont(paragraphedStrings, style, layout, outputLayoutData) {
    if (!this._context) return;
    var _fontDesc = this._getFontDesc(style.actualFontSize, style.fontFamily, style.isBold, style.isItalic);
    this._context.font = _fontDesc;
    var paragraphLength = this._calculateParagraphLength(paragraphedStrings, this._context, _fontDesc);
    var i = 0;
    var totalHeight = 0;
    var maxLength = 0;
    var _fontSize = style.actualFontSize;
    var canvasSize = outputLayoutData.canvasSize,
      nodeContentSize = outputLayoutData.nodeContentSize,
      canvasPadding = outputLayoutData.canvasPadding;
    var fontScale = this._fontScale;
    if (layout.wrapping) {
      var canvasWidthNoMargin = nodeContentSize.width * fontScale;
      var canvasHeightNoMargin = nodeContentSize.height * fontScale;
      if (canvasWidthNoMargin < 0 || canvasHeightNoMargin < 0) {
        return;
      }
      totalHeight = canvasHeightNoMargin + 1;
      var actualFontSize = style.actualFontSize + 1;
      var textFragment = [];
      var left = 0;
      var right = actualFontSize | 0;
      var mid = 0;
      while (left < right) {
        mid = left + right + 1 >> 1;
        if (mid <= 0) {
          logID(4003);
          break;
        }
        _fontSize = mid;
        _fontDesc = this._getFontDesc(_fontSize, style.fontFamily, style.isBold, style.isItalic);
        this._context.font = _fontDesc;
        var lineHeight = this._getLineHeight(layout.lineHeight, _fontSize, style.fontSize);
        totalHeight = 0;
        for (i = 0; i < paragraphedStrings.length; ++i) {
          var allWidth = safeMeasureText(this._context, paragraphedStrings[i], _fontDesc);
          textFragment = fragmentText(paragraphedStrings[i], allWidth, canvasWidthNoMargin, this._measureText(this._context, _fontDesc));
          totalHeight += textFragment.length * lineHeight;
        }
        if (totalHeight > canvasHeightNoMargin) {
          right = mid - 1;
        } else {
          left = mid;
        }
      }
      if (left === 0) {
        logID(4003);
      } else {
        _fontSize = left;
        _fontDesc = this._getFontDesc(_fontSize, style.fontFamily, style.isBold, style.isItalic);
        this._context.font = _fontDesc;
      }
    } else {
      totalHeight = paragraphedStrings.length * this._getLineHeight(layout.lineHeight, _fontSize, style.fontSize);
      for (i = 0; i < paragraphedStrings.length; ++i) {
        if (maxLength < paragraphLength[i]) {
          maxLength = paragraphLength[i];
        }
      }
      var scaleX = (canvasSize.width - canvasPadding.width) * fontScale / maxLength;
      var scaleY = canvasSize.height * fontScale / totalHeight;
      _fontSize = style.actualFontSize * Math.min(1, scaleX, scaleY) | 0;
      _fontDesc = this._getFontDesc(_fontSize, style.fontFamily, style.isBold, style.isItalic);
      this._context.font = _fontDesc;
    }
    style.actualFontSize = _fontSize;
    style.fontDesc = _fontDesc;
  };
  _proto._calculateWrapText = function _calculateWrapText(paragraphedStrings, style, layout, outputLayoutData) {
    if (!layout.wrapping || !this._context) return;
    var _splitStrings = [];
    var canvasWidthNoMargin = outputLayoutData.nodeContentSize.width * this._fontScale;
    var _fontDesc = this._getFontDesc(style.actualFontSize, style.fontFamily, style.isBold, style.isItalic);
    this._context.font = _fontDesc;
    for (var i = 0; i < paragraphedStrings.length; ++i) {
      var allWidth = safeMeasureText(this._context, paragraphedStrings[i], _fontDesc);
      var textFragment = fragmentText(paragraphedStrings[i], allWidth, canvasWidthNoMargin, this._measureText(this._context, _fontDesc));
      _splitStrings = _splitStrings.concat(textFragment);
    }
    outputLayoutData.parsedString = _splitStrings;
    style.fontDesc = _fontDesc;
  };
  _proto._measureText = function _measureText(ctx, fontDesc) {
    return function (str) {
      return safeMeasureText(ctx, str, fontDesc);
    };
  };
  _proto._calculateParagraphLength = function _calculateParagraphLength(paragraphedStrings, ctx, fontDesc) {
    return paragraphedStrings.map(function (para) {
      return safeMeasureText(ctx, para, fontDesc);
    });
  };
  _proto._updatePaddingRect = function _updatePaddingRect(style, outputLayoutData) {
    var top = 0;
    var bottom = 0;
    var left = 0;
    var right = 0;
    var outlineWidth = 0;
    var contentSizeExtend = outputLayoutData.contentSizeExtend,
      canvasPadding = outputLayoutData.canvasPadding;
    contentSizeExtend.width = contentSizeExtend.height = 0;
    if (style.isOutlined) {
      outlineWidth = style.outlineWidth;
      top = bottom = left = right = outlineWidth;
      contentSizeExtend.width = contentSizeExtend.height = outlineWidth * 2;
    }
    if (style.hasShadow) {
      var shadowWidth = style.shadowBlur + outlineWidth;
      var offsetX = style.shadowOffsetX;
      var offsetY = style.shadowOffsetY;
      left = Math.max(left, -offsetX + shadowWidth);
      right = Math.max(right, offsetX + shadowWidth);
      top = Math.max(top, offsetY + shadowWidth);
      bottom = Math.max(bottom, -offsetY + shadowWidth);
    }
    if (style.isItalic) {
      var offset = style.fontSize * Math.tan(12 * 0.0174532925);
      right += offset;
      contentSizeExtend.width += offset;
    }
    canvasPadding.x = left;
    canvasPadding.y = top;
    canvasPadding.width = left + right;
    canvasPadding.height = top + bottom;
  };
  _proto._updateLabelDimensions = function _updateLabelDimensions(style, layout, outputLayoutData) {
    var canvasSize = outputLayoutData.canvasSize;
    canvasSize.width = Math.min(canvasSize.width, MAX_SIZE);
    canvasSize.height = Math.min(canvasSize.height, MAX_SIZE);
    var canvas = this._canvas;
    var context = this._context;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    context.font = style.fontDesc;
    context.textAlign = Alignment[layout.horizontalAlign];
    context.textBaseline = 'alphabetic';
  };
  _proto._calculateFillTextStartPosition = function _calculateFillTextStartPosition(style, layout, outputLayoutData) {
    var labelX = 0;
    var canvasSize = outputLayoutData.canvasSize,
      canvasPadding = outputLayoutData.canvasPadding;
    if (layout.horizontalAlign === HorizontalTextAlignment.RIGHT) {
      labelX = canvasSize.width - canvasPadding.width;
    } else if (layout.horizontalAlign === HorizontalTextAlignment.CENTER) {
      labelX = (canvasSize.width - canvasPadding.width) / 2;
    }
    var lineHeight = this._getLineHeight(layout.lineHeight, style.actualFontSize, style.fontSize);
    var drawStartY = lineHeight * (outputLayoutData.parsedString.length - 1);
    var firstLinelabelY = style.actualFontSize * (1 - BASELINE_RATIO / 2);
    if (layout.verticalAlign !== VerticalTextAlignment.TOP) {
      var blank = drawStartY + canvasPadding.height + style.actualFontSize - canvasSize.height;
      if (layout.verticalAlign === VerticalTextAlignment.BOTTOM) {
        blank += BASELINE_RATIO / 2 * style.actualFontSize;
        firstLinelabelY -= blank;
      } else {
        firstLinelabelY -= blank / 2;
      }
    }
    firstLinelabelY += _BASELINE_OFFSET * style.actualFontSize;
    outputLayoutData.startPosition.set(labelX + canvasPadding.x, firstLinelabelY + canvasPadding.y);
  };
  _proto._updateTexture = function _updateTexture(style, layout, outputLayoutData, outputRenderData) {
    var context = this._context;
    var canvas = this._canvas;
    if (!context || !canvas) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = style.fontDesc;
    this._calculateFillTextStartPosition(style, layout, outputLayoutData);
    var lineHeight = this._getLineHeight(layout.lineHeight, style.actualFontSize, style.fontSize);
    context.lineJoin = 'round';
    if (style.isOutlined) {
      context.fillStyle = "rgba(" + style.outlineColor.r + ", " + style.outlineColor.g + ", " + style.outlineColor.b + ", " + _invisibleAlpha + ")";
      context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      context.fillStyle = "rgba(" + style.color.r + ", " + style.color.g + ", " + style.color.b + ", " + _invisibleAlpha + ")";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.fillStyle = "rgb(" + style.color.r + ", " + style.color.g + ", " + style.color.b + ")";
    var startPosition = outputLayoutData.startPosition;
    var tempPos = new Vec2(startPosition.x, startPosition.y);
    var drawTextPosX = tempPos.x;
    var drawTextPosY = 0;
    this._drawTextEffect(tempPos, lineHeight, style, layout, outputLayoutData);
    var parsedString = outputLayoutData.parsedString;
    for (var i = 0; i < parsedString.length; ++i) {
      drawTextPosY = tempPos.y + i * lineHeight;
      if (style.hasShadow) {
        this._setupShadow(style);
        context.fillText(parsedString[i], drawTextPosX, drawTextPosY);
      }
      if (style.isOutlined) {
        this._setupOutline(style);
        context.strokeText(parsedString[i], drawTextPosX, drawTextPosY);
      }
      if (!style.hasShadow || style.isOutlined) {
        context.fillText(parsedString[i], drawTextPosX, drawTextPosY);
      }
    }
    if (style.hasShadow) {
      context.shadowColor = 'transparent';
    }
    this._uploadTexture(outputRenderData);
  };
  _proto._uploadTexture = function _uploadTexture(outputRenderData) {
    var canvas = this._canvas;
    if (outputRenderData.texture && canvas) {
      var tex;
      if (outputRenderData.texture instanceof SpriteFrame) {
        tex = outputRenderData.texture.texture;
      } else {
        tex = outputRenderData.texture;
      }
      var uploadAgain = canvas.width !== 0 && canvas.height !== 0;
      if (uploadAgain) {
        tex.getGFXTexture();
        tex.getGFXSampler();
        tex.reset({
          width: canvas.width,
          height: canvas.height,
          mipmapLevel: 1
        });
        tex.uploadData(canvas);
        tex.setWrapMode(WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE);
        if (outputRenderData.texture instanceof SpriteFrame) {
          outputRenderData.texture.rect = new Rect(0, 0, canvas.width, canvas.height);
          outputRenderData.texture._calculateUV();
        }
        if (cclegacy.director.root && cclegacy.director.root.batcher2D) {
          {
            cclegacy.director.root.batcher2D._releaseDescriptorSetCache(tex.getHash());
          }
        }
      }
    }
  };
  _proto._drawTextEffect = function _drawTextEffect(startPosition, lineHeight, style, layout, outputLayoutData) {
    if (!style.hasShadow && !style.isOutlined && !style.isUnderline) return;
    var context = this._context;
    var parsedString = outputLayoutData.parsedString;
    var isMultiple = parsedString.length > 1 && style.hasShadow;
    var measureText = this._measureText(this._context, style.fontDesc);
    var drawTextPosX = 0;
    var drawTextPosY = 0;
    for (var i = 0; i < parsedString.length; ++i) {
      drawTextPosX = startPosition.x;
      drawTextPosY = startPosition.y + i * lineHeight;
      if (isMultiple) {
        if (style.hasShadow) {
          this._setupShadow(style);
          context.fillText(parsedString[i], drawTextPosX, drawTextPosY);
        }
        if (style.isOutlined) {
          this._setupOutline(style);
          context.strokeText(parsedString[i], drawTextPosX, drawTextPosY);
        }
        if (!style.hasShadow || style.isOutlined) {
          context.fillText(parsedString[i], drawTextPosX, drawTextPosY);
        }
      }
      if (style.isUnderline) {
        var _drawUnderlineWidth = measureText(parsedString[i]);
        var _drawUnderlinePos = new Vec2();
        if (layout.horizontalAlign === HorizontalTextAlignment.RIGHT) {
          _drawUnderlinePos.x = startPosition.x - _drawUnderlineWidth;
        } else if (layout.horizontalAlign === HorizontalTextAlignment.CENTER) {
          _drawUnderlinePos.x = startPosition.x - _drawUnderlineWidth / 2;
        } else {
          _drawUnderlinePos.x = startPosition.x;
        }
        _drawUnderlinePos.y = drawTextPosY + style.actualFontSize / 8;
        context.fillRect(_drawUnderlinePos.x, _drawUnderlinePos.y, _drawUnderlineWidth, style.underlineHeight * this._fontScale);
      }
    }
    if (isMultiple) {
      context.shadowColor = 'transparent';
    }
  };
  _proto._setupOutline = function _setupOutline(style) {
    var context = this._context;
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.strokeStyle = "rgba(" + style.outlineColor.r + ", " + style.outlineColor.g + ", " + style.outlineColor.b + ", " + style.outlineColor.a / 255 + ")";
    context.lineWidth = style.outlineWidth * 2 * this._fontScale;
  };
  _proto._setupShadow = function _setupShadow(style) {
    var context = this._context;
    var fontScale = this._fontScale;
    context.shadowColor = "rgba(" + style.shadowColor.r + ", " + style.shadowColor.g + ", " + style.shadowColor.b + ", " + style.shadowColor.a / 255 + ")";
    context.shadowBlur = style.shadowBlur * fontScale;
    context.shadowOffsetX = style.shadowOffsetX * fontScale;
    context.shadowOffsetY = -style.shadowOffsetY * fontScale;
  };
  _proto.generateVertexData = function generateVertexData(isBmFont, style, layout, outputLayoutData, outputRenderData, inputString, callback) {
    if (!isBmFont) {
      this.updateQuatCount(outputRenderData);
      callback(style, outputLayoutData, outputRenderData);
    } else {
      this._updateQuads(style, layout, outputLayoutData, outputRenderData, inputString, callback);
    }
  };
  _proto.updateQuatCount = function updateQuatCount(outputRenderData) {
    var data = outputRenderData.vertexBuffer;
    var count = outputRenderData.quadCount;
    if (data.length !== count) {
      for (var i = data.length; i < count; i++) {
        data.push({
          x: 0,
          y: 0,
          z: 0,
          u: 0,
          v: 0,
          color: Color.WHITE.clone()
        });
      }
      data.length = count;
    }
  };
  _proto._setupBMFontOverflowMetrics = function _setupBMFontOverflowMetrics(layout, outputLayoutData) {
    var nodeContentSize = outputLayoutData.nodeContentSize;
    var newWidth = nodeContentSize.width;
    var newHeight = nodeContentSize.height;
    if (layout.overFlow === Overflow$1.RESIZE_HEIGHT) {
      newHeight = 0;
    }
    if (layout.overFlow === Overflow$1.NONE) {
      newWidth = 0;
      newHeight = 0;
    }
    layout.textWidthTemp = newWidth;
    layout.textHeightTemp = newHeight;
    layout.textDimensions.width = newWidth;
    layout.textDimensions.height = newHeight;
    layout.maxLineWidth = newWidth;
  };
  _proto._updateFontScale = function _updateFontScale(style) {
    style.bmfontScale = style.actualFontSize / (style.originFontSize * this._fontScale);
  };
  _proto._computeHorizontalKerningForText = function _computeHorizontalKerningForText(style, layout, inputString) {
    var string = inputString;
    var stringLen = string.length;
    if (!style.fntConfig) return;
    var kerningDict = style.fntConfig.kerningDict;
    var horizontalKerning = layout.horizontalKerning;
    if (!kerningDict || kerningDict.length === 0) {
      return;
    }
    var prev = -1;
    for (var i = 0; i < stringLen; ++i) {
      var key = string.charCodeAt(i);
      var kerningAmount = kerningDict[prev << 16 | key & 0xffff] || 0;
      if (i < stringLen - 1) {
        horizontalKerning[i] = kerningAmount;
      } else {
        horizontalKerning[i] = 0;
      }
      prev = key;
    }
  };
  _proto._alignText = function _alignText(style, layout, outputLayoutData, inputString) {
    this._multilineTextWrap(style, layout, outputLayoutData, inputString, this._getFirstWordLen);
    if (layout.overFlow === Overflow$1.SHRINK) {
      if (style.fontSize > 0 && this._isVerticalClamp(style, layout, outputLayoutData, inputString, this)) {
        this._shrinkLabelToContentSize(style, layout, outputLayoutData, inputString, this._isVerticalClamp);
      }
      if (style.fontSize > 0 && this._isHorizontalNeedShrink(layout, outputLayoutData)) {
        this._shrinkLabelToContentSize(style, layout, outputLayoutData, inputString, this._isHorizontalClamp);
      }
    }
    this._parsedString(outputLayoutData, inputString);
  };
  _proto._parsedString = function _parsedString(outputLayoutData, inputString) {
    var _splitStrings = [];
    var textFragment = '';
    var length = getSymbolLength(inputString);
    for (var i = 0, line = 0, l = length; i < l; ++i) {
      var letterInfo = this._lettersInfo[i];
      if (!letterInfo.valid) {
        continue;
      }
      if (line === letterInfo.line) {
        textFragment += letterInfo["char"];
      } else {
        _splitStrings = _splitStrings.concat(textFragment);
        line = letterInfo.line;
        textFragment = '';
      }
    }
    _splitStrings = _splitStrings.concat(textFragment);
    outputLayoutData.parsedString = _splitStrings;
  };
  _proto._multilineTextWrap = function _multilineTextWrap(style, layout, outputLayoutData, inputString, nextTokenFunc) {
    layout.linesWidth.length = 0;
    var _string = inputString;
    var textLen = _string.length;
    var lineIndex = 0;
    var nextTokenX = 0;
    var nextTokenY = 0;
    var longestLine = 0;
    var letterRight = 0;
    var highestY = 0;
    var lowestY = 0;
    var letterDef = null;
    var _lineSpacing = 0;
    for (var index = 0; index < textLen;) {
      var character = getSymbolAt(_string, index);
      if (character === '\n') {
        layout.linesWidth.push(letterRight);
        letterRight = 0;
        lineIndex++;
        nextTokenX = 0;
        nextTokenY -= layout.lineHeight * this._getFontScale(style, layout) + _lineSpacing;
        this._recordPlaceholderInfo(index, character);
        index++;
        continue;
      }
      var tokenLen = nextTokenFunc(style, layout, _string, index, textLen);
      var tokenHighestY = highestY;
      var tokenLowestY = lowestY;
      var tokenRight = letterRight;
      var nextLetterX = nextTokenX;
      var newLine = false;
      var letterPosition = new Vec2();
      for (var tmp = 0; tmp < tokenLen; ++tmp) {
        var letterIndex = index + tmp;
        character = getSymbolAt(_string, letterIndex);
        if (character === '\r') {
          this._recordPlaceholderInfo(letterIndex, character);
          continue;
        }
        letterDef = shareLabelInfo.fontAtlas.getLetterDefinitionForChar(character, shareLabelInfo);
        if (!letterDef) {
          this._recordPlaceholderInfo(letterIndex, character);
          if (style.fntConfig != null) {
            logID(16354, style.fntConfig.atlasName, character);
          } else {
            logID(16355, style.fontFamily, character);
          }
          continue;
        }
        var letterX = nextLetterX + letterDef.offsetX * style.bmfontScale - shareLabelInfo.margin;
        if (layout.wrapping && layout.maxLineWidth > 0 && nextTokenX > 0 && letterX + letterDef.w * style.bmfontScale > layout.maxLineWidth && !isUnicodeSpace(character)) {
          layout.linesWidth.push(letterRight);
          letterRight = 0;
          lineIndex++;
          nextTokenX = 0;
          nextTokenY -= layout.lineHeight * this._getFontScale(style, layout) + _lineSpacing;
          newLine = true;
          break;
        } else {
          letterPosition.x = letterX;
        }
        letterPosition.y = nextTokenY - letterDef.offsetY * style.bmfontScale;
        this._recordLetterInfo(letterPosition, character, letterIndex, lineIndex);
        if (letterIndex + 1 < layout.horizontalKerning.length && letterIndex < textLen - 1) {
          nextLetterX += layout.horizontalKerning[letterIndex + 1] * style.bmfontScale;
        }
        nextLetterX += letterDef.xAdvance * style.bmfontScale + layout.spacingX;
        tokenRight = letterPosition.x + letterDef.w * style.bmfontScale;
        if (tokenHighestY < letterPosition.y) {
          tokenHighestY = letterPosition.y;
        }
        if (tokenLowestY > letterPosition.y - letterDef.h * style.bmfontScale) {
          tokenLowestY = letterPosition.y - letterDef.h * style.bmfontScale;
        }
      }
      if (newLine) {
        continue;
      }
      nextTokenX = nextLetterX;
      letterRight = tokenRight;
      if (highestY < tokenHighestY) {
        highestY = tokenHighestY;
      }
      if (lowestY > tokenLowestY) {
        lowestY = tokenLowestY;
      }
      if (longestLine < letterRight) {
        longestLine = letterRight;
      }
      index += tokenLen;
    }
    layout.linesWidth.push(letterRight);
    layout.numberOfLines = lineIndex + 1;
    layout.textDesiredHeight = layout.numberOfLines * layout.lineHeight * this._getFontScale(style, layout);
    if (layout.numberOfLines > 1) {
      layout.textDesiredHeight += (layout.numberOfLines - 1) * _lineSpacing;
    }
    var nodeContentSize = outputLayoutData.nodeContentSize;
    nodeContentSize.width = layout.textWidthTemp;
    nodeContentSize.height = layout.textHeightTemp;
    if (layout.textWidthTemp <= 0) {
      nodeContentSize.width = parseFloat(longestLine.toFixed(2)) + shareLabelInfo.margin * 2;
    }
    if (layout.textHeightTemp <= 0) {
      nodeContentSize.height = parseFloat(layout.textDesiredHeight.toFixed(2)) + shareLabelInfo.margin * 2;
    }
    layout.tailoredTopY = nodeContentSize.height;
    layout.tailoredBottomY = 0;
    if (highestY > 0) {
      layout.tailoredTopY = nodeContentSize.height + highestY;
    }
    if (lowestY < -layout.textDesiredHeight) {
      layout.tailoredBottomY = layout.textDesiredHeight + lowestY;
    }
    return true;
  };
  _proto._recordPlaceholderInfo = function _recordPlaceholderInfo(letterIndex, _char) {
    var lettersInfo = this._lettersInfo;
    if (letterIndex >= lettersInfo.length) {
      var tmpInfo = new LetterInfo();
      lettersInfo.push(tmpInfo);
    }
    lettersInfo[letterIndex]["char"] = _char;
    lettersInfo[letterIndex].hash = "" + getSymbolCodeAt(_char, 0) + shareLabelInfo.hash;
    lettersInfo[letterIndex].valid = false;
  };
  _proto._recordLetterInfo = function _recordLetterInfo(letterPosition, character, letterIndex, lineIndex) {
    var lettersInfo = this._lettersInfo;
    if (letterIndex >= lettersInfo.length) {
      var tmpInfo = new LetterInfo();
      lettersInfo.push(tmpInfo);
    }
    var _char2 = getSymbolCodeAt(character, 0);
    var key = "" + _char2 + shareLabelInfo.hash;
    lettersInfo[letterIndex].line = lineIndex;
    lettersInfo[letterIndex]["char"] = character;
    lettersInfo[letterIndex].hash = key;
    lettersInfo[letterIndex].valid = shareLabelInfo.fontAtlas.getLetter(key).valid;
    lettersInfo[letterIndex].x = letterPosition.x;
    lettersInfo[letterIndex].y = letterPosition.y;
  };
  _proto._getFirstWordLen = function _getFirstWordLen(style, layout, text, startIndex, textLen) {
    var character = getSymbolAt(text, startIndex);
    if (isUnicodeCJK(character) || character === '\n' || isUnicodeSpace(character)) {
      return 1;
    }
    var fontAtlas = shareLabelInfo.fontAtlas;
    var len = 1;
    var letterDef = fontAtlas.getLetterDefinitionForChar(character, shareLabelInfo);
    if (!letterDef) {
      return len;
    }
    var nextLetterX = letterDef.xAdvance * style.bmfontScale + layout.spacingX;
    var letterX = 0;
    for (var index = startIndex + 1; index < textLen; ++index) {
      character = getSymbolAt(text, index);
      letterDef = fontAtlas.getLetterDefinitionForChar(character, shareLabelInfo);
      if (!letterDef) {
        break;
      }
      letterX = nextLetterX + letterDef.offsetX * style.bmfontScale;
      if (letterX + letterDef.w * style.bmfontScale > layout.maxLineWidth && !isUnicodeSpace(character) && layout.maxLineWidth > 0) {
        return len;
      }
      nextLetterX += letterDef.xAdvance * style.bmfontScale + layout.spacingX;
      if (character === '\n' || isUnicodeSpace(character) || isUnicodeCJK(character)) {
        break;
      }
      len++;
    }
    return len;
  };
  _proto._computeAlignmentOffset = function _computeAlignmentOffset(style, layout, outputLayoutData) {
    var nodeContentSize = outputLayoutData.nodeContentSize;
    layout.linesOffsetX.length = 0;
    layout.letterOffsetY = 0;
    switch (layout.horizontalAlign) {
      case HorizontalTextAlignment.LEFT:
        for (var i = 0; i < layout.numberOfLines; ++i) {
          layout.linesOffsetX.push(0);
        }
        break;
      case HorizontalTextAlignment.CENTER:
        for (var _i = 0, l = layout.linesWidth.length; _i < l; _i++) {
          layout.linesOffsetX.push((nodeContentSize.width - layout.linesWidth[_i]) / 2);
        }
        break;
      case HorizontalTextAlignment.RIGHT:
        for (var _i2 = 0, _l = layout.linesWidth.length; _i2 < _l; _i2++) {
          layout.linesOffsetX.push(nodeContentSize.width - layout.linesWidth[_i2]);
        }
        break;
    }
    layout.letterOffsetY = nodeContentSize.height;
    if (layout.verticalAlign !== VerticalTextAlignment.TOP) {
      var blank = nodeContentSize.height - layout.textDesiredHeight + layout.lineHeight * this._getFontScale(style, layout) - style.originFontSize * this._fontScale * style.bmfontScale;
      if (layout.verticalAlign === VerticalTextAlignment.BOTTOM) {
        layout.letterOffsetY -= blank;
      } else {
        layout.letterOffsetY -= blank / 2;
      }
    }
  };
  _proto._getFontScale = function _getFontScale(style, layout) {
    return layout.overFlow === Overflow$1.SHRINK ? style.bmfontScale : 1;
  };
  _proto._isVerticalClamp = function _isVerticalClamp(style, layout, outputLayoutData, inputString, process) {
    if (layout.textDesiredHeight > outputLayoutData.nodeContentSize.height) {
      return true;
    } else {
      return false;
    }
  };
  _proto._isHorizontalClamp = function _isHorizontalClamp(style, layout, outputLayoutData, inputString, process) {
    var letterClamp = false;
    var _string = inputString;
    var _length = getSymbolLength(_string);
    for (var ctr = 0, l = _length; ctr < l; ++ctr) {
      var letterInfo = process._lettersInfo[ctr];
      if (letterInfo.valid) {
        var letterDef = shareLabelInfo.fontAtlas.getLetterDefinitionForChar(letterInfo["char"], shareLabelInfo);
        if (!letterDef) {
          continue;
        }
        var px = letterInfo.x + letterDef.w * style.bmfontScale;
        var lineIndex = letterInfo.line;
        if (layout.textWidthTemp > 0) {
          var nodeContentSize = outputLayoutData.nodeContentSize;
          if (!layout.wrapping) {
            if (px > nodeContentSize.width) {
              letterClamp = true;
              break;
            }
          } else {
            var wordWidth = layout.linesWidth[lineIndex];
            if (wordWidth > nodeContentSize.width && (px > nodeContentSize.width || px < 0)) {
              letterClamp = true;
              break;
            }
          }
        }
      }
    }
    return letterClamp;
  };
  _proto._isHorizontalNeedShrink = function _isHorizontalNeedShrink(layout, outputLayoutData) {
    var wordWidth = 0;
    for (var ctr = 0, l = layout.linesWidth.length; ctr < l; ++ctr) {
      wordWidth = layout.linesWidth[ctr];
      if (wordWidth > outputLayoutData.nodeContentSize.width) return true;
    }
    return false;
  };
  _proto._shrinkLabelToContentSize = function _shrinkLabelToContentSize(style, layout, outputLayoutData, inputString, lambda) {
    var fontSize = style.actualFontSize;
    var left = 0;
    var right = fontSize | 0;
    var mid = 0;
    while (left < right) {
      mid = left + right + 1 >> 1;
      var newFontSize = mid;
      if (newFontSize <= 0) {
        break;
      }
      style.bmfontScale = newFontSize / (style.originFontSize * this._fontScale);
      this._multilineTextWrap(style, layout, outputLayoutData, inputString, this._getFirstWordLen);
      this._computeAlignmentOffset(style, layout, outputLayoutData);
      if (lambda(style, layout, outputLayoutData, inputString, this)) {
        right = mid - 1;
      } else {
        left = mid;
      }
    }
    if (left >= 0) {
      this._scaleFontSizeDown(style, layout, outputLayoutData, inputString, left);
    }
  };
  _proto._scaleFontSizeDown = function _scaleFontSizeDown(style, layout, outputLayoutData, inputString, fontSize) {
    var shouldUpdateContent = true;
    if (!fontSize) {
      fontSize = 0.1;
      shouldUpdateContent = false;
    }
    style.actualFontSize = fontSize;
    if (shouldUpdateContent) {
      this._updateFontScale(style);
      this._multilineTextWrap(style, layout, outputLayoutData, inputString, this._getFirstWordLen);
    }
  };
  _proto._updateQuads = function _updateQuads(style, layout, outputLayoutData, outputRenderData, inputString, callback) {
    var fontAtlas = shareLabelInfo.fontAtlas;
    var texture = style.spriteFrame ? style.spriteFrame.texture : fontAtlas.getTexture();
    var nodeContentSize = outputLayoutData.nodeContentSize;
    var appX = outputRenderData.uiTransAnchorX * nodeContentSize.width;
    var appY = outputRenderData.uiTransAnchorY * nodeContentSize.height;
    var ret = true;
    var _length = getSymbolLength(inputString);
    for (var ctr = 0, l = _length; ctr < l; ++ctr) {
      var letterInfo = this._lettersInfo[ctr];
      if (!letterInfo.valid) {
        continue;
      }
      var letterDef = fontAtlas.getLetter(letterInfo.hash);
      if (!letterDef) {
        warnID(16353);
        continue;
      }
      var tmpRect = this._tmpRect;
      tmpRect.height = letterDef.h;
      tmpRect.width = letterDef.w;
      tmpRect.x = letterDef.u;
      tmpRect.y = letterDef.v;
      var py = letterInfo.y + layout.letterOffsetY;
      if (layout.textHeightTemp > 0) {
        if (py > layout.tailoredTopY) {
          var clipTop = py - layout.tailoredTopY;
          tmpRect.y += clipTop;
          tmpRect.height -= clipTop;
          py -= clipTop;
        }
        if (py - tmpRect.height * style.bmfontScale < layout.tailoredBottomY && layout.overFlow === Overflow$1.CLAMP) {
          tmpRect.height = py < layout.tailoredBottomY ? 0 : (py - layout.tailoredBottomY) / style.bmfontScale;
        }
      }
      var lineIndex = letterInfo.line;
      var px = letterInfo.x + letterDef.w / 2 * style.bmfontScale + layout.linesOffsetX[lineIndex];
      if (layout.textWidthTemp > 0) {
        if (this._isHorizontalClamped(layout, outputLayoutData, px, lineIndex)) {
          if (layout.overFlow === Overflow$1.CLAMP) {
            tmpRect.width = 0;
          }
        }
      }
      if (tmpRect.height > 0 && tmpRect.width > 0) {
        var isRotated = this._determineRect(style);
        var letterPositionX = letterInfo.x + layout.linesOffsetX[letterInfo.line];
        var offset = outputRenderData.quadCount;
        outputRenderData.quadCount += 4;
        this.updateQuatCount(outputRenderData);
        callback(style, outputLayoutData, outputRenderData, offset, texture, tmpRect, isRotated, letterPositionX - appX, py - appY);
      }
    }
    return ret;
  };
  _proto._isHorizontalClamped = function _isHorizontalClamped(layout, outputLayoutData, px, lineIndex) {
    var nodeContentSize = outputLayoutData.nodeContentSize;
    var wordWidth = layout.linesWidth[lineIndex];
    var letterOverClamp = px > nodeContentSize.width || px < 0;
    if (!layout.wrapping) {
      return letterOverClamp;
    } else {
      return wordWidth > nodeContentSize.width && letterOverClamp;
    }
  };
  _proto._determineRect = function _determineRect(style) {
    var _spriteFrame = style.spriteFrame;
    if (!_spriteFrame) return false;
    var isRotated = _spriteFrame.isRotated();
    var originalSize = _spriteFrame.getOriginalSize();
    var rect = _spriteFrame.getRect();
    var offset = _spriteFrame.getOffset();
    var trimmedLeft = offset.x + (originalSize.width - rect.width) / 2;
    var trimmedTop = offset.y - (originalSize.height - rect.height) / 2;
    var tmpRect = this._tmpRect;
    if (!isRotated) {
      tmpRect.x += rect.x - trimmedLeft;
      tmpRect.y += rect.y + trimmedTop;
    } else {
      var originalX = tmpRect.x;
      tmpRect.x = rect.x + rect.height - tmpRect.y - tmpRect.height - trimmedTop;
      tmpRect.y = originalX + rect.y - trimmedLeft;
      if (tmpRect.y < 0) {
        tmpRect.height += trimmedTop;
      }
    }
    return isRotated;
  };
  return TextProcessing;
}();
TextProcessing.instance = void 0;
TextProcessing.instance = new TextProcessing();

var _defaultLetterAtlas = new LetterAtlas(64, 64);
var _defaultFontAtlas = new FontAtlas(null);
var _comp = null;
var _uiTrans = null;
var _fntConfig = null;
var _spriteFrame = null;
var QUAD_INDICES$3 = null;
var BmfontUtils = function () {
  function BmfontUtils() {}
  var _proto = BmfontUtils.prototype;
  _proto.updateProcessingData = function updateProcessingData(style, layout, outputLayoutData, outputRenderData, comp, trans) {
    style.fontSize = comp.fontSize;
    style.actualFontSize = comp.fontSize;
    style.originFontSize = _fntConfig ? _fntConfig.fontSize : comp.fontSize;
    layout.horizontalAlign = comp.horizontalAlign;
    layout.verticalAlign = comp.verticalAlign;
    layout.spacingX = comp.spacingX;
    var overflow = comp.overflow;
    layout.overFlow = overflow;
    layout.lineHeight = comp.lineHeight;
    var nodeContentSize = outputLayoutData.nodeContentSize;
    nodeContentSize.width = trans.width;
    nodeContentSize.height = trans.height;
    if (overflow === Overflow$1.NONE) {
      layout.wrapping = false;
      nodeContentSize.width += shareLabelInfo.margin * 2;
      nodeContentSize.height += shareLabelInfo.margin * 2;
    } else if (overflow === Overflow$1.RESIZE_HEIGHT) {
      layout.wrapping = true;
      nodeContentSize.height += shareLabelInfo.margin * 2;
    } else {
      layout.wrapping = comp.enableWrapText;
    }
    outputRenderData.uiTransAnchorX = trans.anchorX;
    outputRenderData.uiTransAnchorY = trans.anchorY;
    shareLabelInfo.lineHeight = comp.lineHeight;
    shareLabelInfo.fontSize = comp.fontSize;
    style.spriteFrame = _spriteFrame;
    style.fntConfig = _fntConfig;
    style.fontFamily = shareLabelInfo.fontFamily;
    style.color.set(comp.color);
  };
  _proto.updateRenderData = function updateRenderData(comp) {
    if (!comp.renderData) {
      return;
    }
    if (_comp === comp) {
      return;
    }
    if (comp.renderData.vertDirty) {
      _comp = comp;
      _uiTrans = _comp.node._getUITransformComp();
      var renderData = comp.renderData;
      var processing = TextProcessing.instance;
      var style = comp.textStyle;
      var layout = comp.textLayout;
      var outputLayoutData = comp.textLayoutData;
      var outputRenderData = comp.textRenderData;
      style.fontScale = view.getScaleX();
      this._updateFontFamily(comp);
      this.updateProcessingData(style, layout, outputLayoutData, outputRenderData, comp, _uiTrans);
      this._updateLabelInfo(comp);
      style.fontDesc = shareLabelInfo.fontDesc;
      processing.processingString(true, style, layout, outputLayoutData, comp.string);
      outputRenderData.quadCount = 0;
      processing.generateRenderInfo(true, style, layout, outputLayoutData, outputRenderData, comp.string, this.generateVertexData);
      if (renderData.dataLength !== outputRenderData.quadCount) {
        this.resetRenderData(comp);
        renderData.dataLength = outputRenderData.quadCount;
        renderData.resize(renderData.dataLength, renderData.dataLength / 2 * 3);
      }
      var datalist = renderData.data;
      for (var i = 0, l = outputRenderData.quadCount; i < l; i++) {
        datalist[i] = outputRenderData.vertexBuffer[i];
      }
      var indexCount = renderData.indexCount;
      this.createQuadIndices(indexCount);
      renderData.chunk.setIndexBuffer(QUAD_INDICES$3);
      _comp.actualFontSize = style.actualFontSize;
      _uiTrans.setContentSize(outputLayoutData.nodeContentSize);
      this.updateUVs(comp);
      renderData.vertDirty = false;
      _comp = null;
      this._resetProperties();
    }
    if (comp.spriteFrame) {
      var _renderData = comp.renderData;
      _renderData.updateRenderData(comp, comp.spriteFrame);
    }
  };
  _proto.updateUVs = function updateUVs(label) {
    var renderData = label.renderData;
    if (!renderData) return;
    var vData = renderData.chunk.vb;
    var vertexCount = renderData.vertexCount;
    var stride = renderData.floatStride;
    var dataList = renderData.data;
    var vertexOffset = 3;
    for (var i = 0; i < vertexCount; i++) {
      var vert = dataList[i];
      vData[vertexOffset] = vert.u;
      vData[vertexOffset + 1] = vert.v;
      vertexOffset += stride;
    }
  };
  _proto.updateColor = function updateColor(label) {
    label.renderData;
  };
  _proto.resetRenderData = function resetRenderData(comp) {
    var renderData = comp.renderData;
    if (!renderData) return;
    renderData.dataLength = 0;
    renderData.resize(0, 0);
  };
  _proto.generateVertexData = function generateVertexData(style, outputLayoutData, outputRenderData, offset, spriteFrame, rect, rotated, x, y) {
    var dataOffset = offset;
    var scale = style.bmfontScale;
    var dataList = outputRenderData.vertexBuffer;
    var texW = spriteFrame.width;
    var texH = spriteFrame.height;
    var rectWidth = rect.width;
    var rectHeight = rect.height;
    var l = 0;
    var b = 0;
    var t = 0;
    var r = 0;
    if (!rotated) {
      l = rect.x / texW;
      r = (rect.x + rectWidth) / texW;
      b = (rect.y + rectHeight) / texH;
      t = rect.y / texH;
      dataList[dataOffset].u = l;
      dataList[dataOffset].v = b;
      dataList[dataOffset + 1].u = r;
      dataList[dataOffset + 1].v = b;
      dataList[dataOffset + 2].u = l;
      dataList[dataOffset + 2].v = t;
      dataList[dataOffset + 3].u = r;
      dataList[dataOffset + 3].v = t;
    } else {
      l = rect.x / texW;
      r = (rect.x + rectHeight) / texW;
      b = (rect.y + rectWidth) / texH;
      t = rect.y / texH;
      dataList[dataOffset].u = l;
      dataList[dataOffset].v = t;
      dataList[dataOffset + 1].u = l;
      dataList[dataOffset + 1].v = b;
      dataList[dataOffset + 2].u = r;
      dataList[dataOffset + 2].v = t;
      dataList[dataOffset + 3].u = r;
      dataList[dataOffset + 3].v = b;
    }
    dataList[dataOffset].x = x;
    dataList[dataOffset].y = y - rectHeight * scale;
    dataList[dataOffset + 1].x = x + rectWidth * scale;
    dataList[dataOffset + 1].y = y - rectHeight * scale;
    dataList[dataOffset + 2].x = x;
    dataList[dataOffset + 2].y = y;
    dataList[dataOffset + 3].x = x + rectWidth * scale;
    dataList[dataOffset + 3].y = y;
  };
  _proto._updateFontFamily = function _updateFontFamily(comp) {
    var fontAsset = comp.font;
    _spriteFrame = fontAsset.spriteFrame;
    _fntConfig = fontAsset.fntConfig;
    shareLabelInfo.fontAtlas = fontAsset.fontDefDictionary;
    if (!shareLabelInfo.fontAtlas) {
      if (comp.cacheMode === CacheMode.CHAR) {
        shareLabelInfo.fontAtlas = _defaultLetterAtlas;
      } else {
        shareLabelInfo.fontAtlas = _defaultFontAtlas;
      }
    }
    dynamicAtlasManager.packToDynamicAtlas(comp, _spriteFrame);
  };
  _proto._updateLabelInfo = function _updateLabelInfo(comp) {
    shareLabelInfo.hash = '';
    shareLabelInfo.margin = 0;
  };
  _proto._resetProperties = function _resetProperties() {
    _fntConfig = null;
    _spriteFrame = null;
    shareLabelInfo.hash = '';
    shareLabelInfo.margin = 0;
  };
  _proto.createQuadIndices = function createQuadIndices(indexCount) {
    if (indexCount % 6 !== 0) {
      errorID(16308);
      return;
    }
    var quadCount = indexCount / 6;
    QUAD_INDICES$3 = new Uint16Array(indexCount);
    var offset = 0;
    for (var i = 0; i < quadCount; i++) {
      QUAD_INDICES$3[offset++] = 0 + i * 4;
      QUAD_INDICES$3[offset++] = 1 + i * 4;
      QUAD_INDICES$3[offset++] = 2 + i * 4;
      QUAD_INDICES$3[offset++] = 1 + i * 4;
      QUAD_INDICES$3[offset++] = 3 + i * 4;
      QUAD_INDICES$3[offset++] = 2 + i * 4;
    }
  };
  return BmfontUtils;
}();

var tempColor$1 = new Color(255, 255, 255, 255);
var Bmfont = function (_BmfontUtils) {
  function Bmfont() {
    return _BmfontUtils.apply(this, arguments) || this;
  }
  _inheritsLoose(Bmfont, _BmfontUtils);
  var _proto = Bmfont.prototype;
  _proto.createData = function createData(comp) {
    var renderData = comp.requestRenderData();
    renderData.resize(0, 0);
    return renderData;
  };
  _proto.fillBuffers = function fillBuffers(comp, renderer) {
    var node = comp.node;
    tempColor$1.set(comp.color);
    tempColor$1.a = node._uiProps.opacity * 255;
    fillMeshVertices3D(node, renderer, comp.renderData, tempColor$1);
  };
  return Bmfont;
}(BmfontUtils);
var bmfont = new Bmfont();

var _atlasWidth = 1024;
var _atlasHeight = 1024;
var _shareAtlas = null;
var LetterFont = function (_BmfontUtils) {
  function LetterFont() {
    return _BmfontUtils.apply(this, arguments) || this;
  }
  _inheritsLoose(LetterFont, _BmfontUtils);
  var _proto = LetterFont.prototype;
  _proto.getAssemblerData = function getAssemblerData() {
    if (!_shareAtlas) {
      _shareAtlas = new LetterAtlas(_atlasWidth, _atlasHeight);
    }
    return _shareAtlas.getTexture();
  };
  _proto._updateFontFamily = function _updateFontFamily(comp) {
    shareLabelInfo.fontAtlas = _shareAtlas;
    shareLabelInfo.fontFamily = this._getFontFamily(comp);
    var isOutlined = comp.enableOutline && comp.outlineWidth > 0;
    if (isOutlined) {
      shareLabelInfo.isOutlined = true;
      shareLabelInfo.margin = comp.outlineWidth;
      shareLabelInfo.out = comp.outlineColor.clone();
      shareLabelInfo.out.a = comp.outlineColor.a * comp.color.a / 255.0;
    } else {
      shareLabelInfo.isOutlined = false;
      shareLabelInfo.margin = 0;
    }
  };
  _proto._getFontFamily = function _getFontFamily(comp) {
    var fontFamily = 'Arial';
    if (!comp.useSystemFont) {
      if (comp.font) {
        fontFamily = comp.font._nativeAsset || 'Arial';
      }
    } else {
      fontFamily = comp.fontFamily || 'Arial';
    }
    return fontFamily;
  };
  _proto._updateLabelInfo = function _updateLabelInfo(comp) {
    shareLabelInfo.fontDesc = this._getFontDesc();
    shareLabelInfo.color.set(comp.color);
    shareLabelInfo.hash = computeHash(shareLabelInfo);
  };
  _proto._getFontDesc = function _getFontDesc() {
    var fontDesc = shareLabelInfo.fontSize.toString() + "px ";
    fontDesc += shareLabelInfo.fontFamily;
    return fontDesc;
  };
  return LetterFont;
}(BmfontUtils);

var tempColor = new Color(255, 255, 255, 255);
var Letter = function (_LetterFont) {
  function Letter() {
    return _LetterFont.apply(this, arguments) || this;
  }
  _inheritsLoose(Letter, _LetterFont);
  var _proto = Letter.prototype;
  _proto.createData = function createData(comp) {
    var renderData = comp.requestRenderData();
    renderData.resize(0, 0);
    return renderData;
  };
  _proto.fillBuffers = function fillBuffers(comp, renderer) {
    if (!comp.renderData) {
      return;
    }
    var node = comp.node;
    tempColor.a = node._uiProps.opacity * 255;
    fillMeshVertices3D(node, renderer, comp.renderData, tempColor);
  };
  _proto.updateColor = function updateColor(label) {
    label.renderData;
  };
  return Letter;
}(LetterFont);
var letter = new Letter();

var Overflow = Label.Overflow;
var TTFUtils = function () {
  function TTFUtils() {}
  var _proto = TTFUtils.prototype;
  _proto.updateProcessingData = function updateProcessingData(style, layout, outputLayoutData, outputRenderData, comp, trans) {
    style.isSystemFontUsed = comp.useSystemFont;
    style.fontSize = comp.fontSize;
    outputLayoutData.nodeContentSize.width = outputLayoutData.canvasSize.width = trans.width;
    outputLayoutData.nodeContentSize.height = outputLayoutData.canvasSize.height = trans.height;
    layout.lineHeight = comp.lineHeight;
    layout.overFlow = comp.overflow;
    if (comp.overflow === Overflow.NONE) {
      layout.wrapping = false;
    } else if (comp.overflow === Overflow.RESIZE_HEIGHT) {
      layout.wrapping = true;
    } else {
      layout.wrapping = comp.enableWrapText;
    }
    style.isBold = comp.isBold;
    style.isItalic = comp.isItalic;
    style.isUnderline = comp.isUnderline;
    style.underlineHeight = comp.underlineHeight;
    var isOutlined = comp.enableOutline && comp.outlineWidth > 0;
    if (isOutlined) {
      style.isOutlined = true;
      style.outlineColor.set(comp.outlineColor);
      style.outlineWidth = comp.outlineWidth;
    } else {
      style.isOutlined = false;
    }
    var isShadow = comp.enableShadow && (comp.shadowBlur > 0 || !approx(comp.shadowOffset.x, 0) || !approx(comp.shadowOffset.y, 0));
    if (isShadow) {
      style.hasShadow = true;
      style.shadowColor.set(comp.shadowColor);
      style.shadowBlur = comp.shadowBlur;
      style.shadowOffsetX = comp.shadowOffset.x;
      style.shadowOffsetY = comp.shadowOffset.y;
    } else {
      style.hasShadow = false;
    }
    style.color.set(comp.color);
    outputRenderData.texture = comp.spriteFrame;
    outputRenderData.uiTransAnchorX = trans.anchorX;
    outputRenderData.uiTransAnchorY = trans.anchorY;
    layout.horizontalAlign = comp.horizontalAlign;
    layout.verticalAlign = comp.verticalAlign;
  };
  _proto.getAssemblerData = function getAssemblerData() {
    var sharedLabelData = Label._canvasPool.get();
    sharedLabelData.canvas.width = sharedLabelData.canvas.height = 1;
    return sharedLabelData;
  };
  _proto.resetAssemblerData = function resetAssemblerData(assemblerData) {
    if (assemblerData) {
      Label._canvasPool.put(assemblerData);
    }
  };
  _proto.updateRenderData = function updateRenderData(comp) {
    var renderData = comp.renderData;
    if (!renderData) {
      return;
    }
    if (renderData.vertDirty) {
      var trans = comp.node._getUITransformComp();
      var processing = TextProcessing.instance;
      var style = comp.textStyle;
      var layout = comp.textLayout;
      var outputLayoutData = comp.textLayoutData;
      var outputRenderData = comp.textRenderData;
      style.fontScale = view.getScaleX();
      this.updateProcessingData(style, layout, outputLayoutData, outputRenderData, comp, trans);
      processing.setCanvasUsed(comp.assemblerData.canvas, comp.assemblerData.context);
      style.fontFamily = this._updateFontFamily(comp);
      this._resetDynamicAtlas(comp);
      processing.processingString(false, style, layout, outputLayoutData, comp.string);
      processing.generateRenderInfo(false, style, layout, outputLayoutData, outputRenderData, comp.string, this.generateVertexData);
      renderData.textureDirty = true;
      this._calDynamicAtlas(comp, outputLayoutData);
      comp.actualFontSize = style.actualFontSize;
      trans.setContentSize(outputLayoutData.nodeContentSize);
      var datalist = renderData.data;
      var vertexBuffer = outputRenderData.vertexBuffer;
      datalist[0] = vertexBuffer[0];
      datalist[1] = vertexBuffer[1];
      datalist[2] = vertexBuffer[2];
      datalist[3] = vertexBuffer[3];
      this.updateUVs(comp);
      renderData.vertDirty = false;
      comp.contentWidth = outputLayoutData.nodeContentSize.width;
    }
    if (comp.spriteFrame) {
      var _renderData = comp.renderData;
      _renderData.updateRenderData(comp, comp.spriteFrame);
    }
  };
  _proto.generateVertexData = function generateVertexData(style, outputLayoutData, outputRenderData) {
    var data = outputRenderData.vertexBuffer;
    var nodeContentSize = outputLayoutData.nodeContentSize;
    var width = nodeContentSize.width;
    var height = nodeContentSize.height;
    var appX = outputRenderData.uiTransAnchorX * width;
    var appY = outputRenderData.uiTransAnchorY * height;
    data[0].x = -appX;
    data[0].y = -appY;
    data[1].x = width - appX;
    data[1].y = -appY;
    data[2].x = -appX;
    data[2].y = height - appY;
    data[3].x = width - appX;
    data[3].y = height - appY;
  };
  _proto.updateVertexData = function updateVertexData(comp) {};
  _proto.updateUVs = function updateUVs(comp) {};
  _proto._updateFontFamily = function _updateFontFamily(comp) {
    var _fontFamily = '';
    if (!comp.useSystemFont) {
      if (comp.font) {
        _fontFamily = comp.font._nativeAsset || 'Arial';
      } else {
        _fontFamily = 'Arial';
      }
    } else {
      _fontFamily = comp.fontFamily || 'Arial';
    }
    return _fontFamily;
  };
  _proto._calDynamicAtlas = function _calDynamicAtlas(comp, outputLayoutData) {
    if (comp.cacheMode !== CacheMode.BITMAP || outputLayoutData.canvasSize.width <= 0 || outputLayoutData.canvasSize.height <= 0) return;
    var frame = comp.ttfSpriteFrame;
    dynamicAtlasManager.packToDynamicAtlas(comp, frame);
  };
  _proto._resetDynamicAtlas = function _resetDynamicAtlas(comp) {
    if (comp.cacheMode !== CacheMode.BITMAP) return;
    var frame = comp.ttfSpriteFrame;
    dynamicAtlasManager.deleteAtlasSpriteFrame(frame);
    frame._resetDynamicAtlasFrame();
  };
  return TTFUtils;
}();

var WHITE = Color.WHITE.clone();
var QUAD_INDICES$2 = Uint16Array.from([0, 1, 2, 1, 3, 2]);
var TTF = function (_TTFUtils) {
  function TTF() {
    return _TTFUtils.apply(this, arguments) || this;
  }
  _inheritsLoose(TTF, _TTFUtils);
  var _proto = TTF.prototype;
  _proto.createData = function createData(comp) {
    var renderData = comp.requestRenderData();
    renderData.dataLength = 4;
    renderData.resize(4, 6);
    comp.textRenderData.quadCount = 4;
    var vData = renderData.chunk.vb;
    var stride = renderData.floatStride;
    var uvs = [{
      u: 0,
      v: 1
    }, {
      u: 1,
      v: 1
    }, {
      u: 0,
      v: 0
    }, {
      u: 1,
      v: 0
    }];
    var uvOffset = 3;
    for (var i = 0, len = renderData.dataLength; i < len; ++i) {
      vData[uvOffset] = uvs[i].u;
      vData[uvOffset + 1] = uvs[i].v;
      uvOffset += stride;
    }
    var offset = 5;
    for (var _i = 0; _i < renderData.dataLength; _i++) {
      Color.toArray(vData, WHITE, offset);
      offset += stride;
    }
    renderData.chunk.setIndexBuffer(QUAD_INDICES$2);
    return renderData;
  };
  _proto.fillBuffers = function fillBuffers(comp, renderer) {
    var renderData = comp.renderData;
    if (!renderData) return;
    var chunk = renderData.chunk;
    var dataList = renderData.data;
    var node = comp.node;
    var vData = chunk.vb;
    var m = node.worldMatrix;
    var stride = renderData.floatStride;
    var offset = 0;
    var length = dataList.length;
    for (var i = 0; i < length; i++) {
      var curData = dataList[i];
      var x = curData.x;
      var y = curData.y;
      var rhw = m.m03 * x + m.m07 * y + m.m15;
      rhw = rhw ? 1 / rhw : 1;
      offset = i * stride;
      vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
      vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
      vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;
    }
    var vid = chunk.vertexOffset;
    var meshBuffer = chunk.meshBuffer;
    var ib = chunk.meshBuffer.iData;
    var indexOffset = meshBuffer.indexOffset;
    ib[indexOffset++] = vid;
    ib[indexOffset++] = vid + 1;
    ib[indexOffset++] = vid + 2;
    ib[indexOffset++] = vid + 2;
    ib[indexOffset++] = vid + 1;
    ib[indexOffset++] = vid + 3;
    meshBuffer.indexOffset += 6;
  };
  _proto.updateVertexData = function updateVertexData(comp) {
    var renderData = comp.renderData;
    if (!renderData) {
      return;
    }
    var uiTrans = comp.node._getUITransformComp();
    var width = uiTrans.width;
    var height = uiTrans.height;
    var appX = uiTrans.anchorX * width;
    var appY = uiTrans.anchorY * height;
    var data = renderData.data;
    data[0].x = -appX;
    data[0].y = -appY;
    data[1].x = width - appX;
    data[1].y = -appY;
    data[2].x = -appX;
    data[2].y = height - appY;
    data[3].x = width - appX;
    data[3].y = height - appY;
  };
  _proto.updateUVs = function updateUVs(comp) {
    var renderData = comp.renderData;
    if (!renderData || !comp.ttfSpriteFrame) {
      return;
    }
    var vData = renderData.chunk.vb;
    var uv = comp.ttfSpriteFrame.uv;
    var stride = renderData.floatStride;
    var uvOffset = 3;
    for (var i = 0; i < renderData.dataLength; ++i) {
      var index = i * 2;
      vData[uvOffset] = uv[index];
      vData[uvOffset + 1] = uv[index + 1];
      uvOffset += stride;
    }
  };
  _proto.updateColor = function updateColor(comp) {};
  return TTF;
}(TTFUtils);
var ttf = new TTF();

var labelAssembler = {
  getAssembler: function getAssembler(comp) {
    var assembler = ttf;
    if (comp.font instanceof BitmapFont) {
      assembler = bmfont;
    } else if (comp.cacheMode === CacheMode.CHAR) {
      assembler = letter;
    }
    return assembler;
  }
};
Label.Assembler = labelAssembler;

var FillType$1 = Sprite.FillType;
var m$2 = new Mat4();
var QUAD_INDICES$1 = Uint16Array.from([0, 1, 2, 1, 3, 2]);
var BarFilled = function () {
  function BarFilled() {}
  var _proto = BarFilled.prototype;
  _proto.updateRenderData = function updateRenderData(sprite) {
    var frame = sprite.spriteFrame;
    dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
    var renderData = sprite.renderData;
    if (renderData && frame) {
      var vertDirty = renderData.vertDirty;
      if (!vertDirty) {
        return;
      }
      var fillStart = sprite.fillStart;
      var fillRange = sprite.fillRange;
      if (fillRange < 0) {
        fillStart += fillRange;
        fillRange = -fillRange;
      }
      fillRange = fillStart + fillRange;
      fillStart = fillStart > 1.0 ? 1.0 : fillStart;
      fillStart = fillStart < 0.0 ? 0.0 : fillStart;
      fillRange = fillRange > 1.0 ? 1.0 : fillRange;
      fillRange = fillRange < 0.0 ? 0.0 : fillRange;
      fillRange -= fillStart;
      fillRange = fillRange < 0 ? 0 : fillRange;
      var fillEnd = fillStart + fillRange;
      fillEnd = fillEnd > 1 ? 1 : fillEnd;
      this.updateUVs(sprite, fillStart, fillEnd);
      this.updateVertexData(sprite, fillStart, fillEnd);
      renderData.updateRenderData(sprite, frame);
    }
  };
  _proto.updateUVs = function updateUVs(sprite, fillStart, fillEnd) {
    var spriteFrame = sprite.spriteFrame;
    var renderData = sprite.renderData;
    if (!renderData) return;
    var vData = renderData.chunk.vb;
    var atlasWidth = spriteFrame.width;
    var atlasHeight = spriteFrame.height;
    var textureRect = spriteFrame.rect;
    var ul = 0;
    var vb = 0;
    var ur = 0;
    var vt = 0;
    var quadUV0 = 0;
    var quadUV1 = 0;
    var quadUV2 = 0;
    var quadUV3 = 0;
    var quadUV4 = 0;
    var quadUV5 = 0;
    var quadUV6 = 0;
    var quadUV7 = 0;
    if (spriteFrame.isRotated()) {
      ul = textureRect.x / atlasWidth;
      vb = (textureRect.y + textureRect.width) / atlasHeight;
      ur = (textureRect.x + textureRect.height) / atlasWidth;
      vt = textureRect.y / atlasHeight;
      quadUV0 = quadUV2 = ul;
      quadUV4 = quadUV6 = ur;
      quadUV3 = quadUV7 = vb;
      quadUV1 = quadUV5 = vt;
    } else {
      ul = textureRect.x / atlasWidth;
      vb = (textureRect.y + textureRect.height) / atlasHeight;
      ur = (textureRect.x + textureRect.width) / atlasWidth;
      vt = textureRect.y / atlasHeight;
      quadUV0 = quadUV4 = ul;
      quadUV2 = quadUV6 = ur;
      quadUV1 = quadUV3 = vb;
      quadUV5 = quadUV7 = vt;
    }
    var stride = renderData.floatStride;
    var uvOffset = 3;
    switch (sprite.fillType) {
      case FillType$1.HORIZONTAL:
        vData[uvOffset] = quadUV0 + (quadUV2 - quadUV0) * fillStart;
        vData[uvOffset + 1] = quadUV1 + (quadUV3 - quadUV1) * fillStart;
        uvOffset += stride;
        vData[uvOffset] = quadUV0 + (quadUV2 - quadUV0) * fillEnd;
        vData[uvOffset + 1] = quadUV1 + (quadUV3 - quadUV1) * fillEnd;
        uvOffset += stride;
        vData[uvOffset] = quadUV4 + (quadUV6 - quadUV4) * fillStart;
        vData[uvOffset + 1] = quadUV5 + (quadUV7 - quadUV5) * fillStart;
        uvOffset += stride;
        vData[uvOffset] = quadUV4 + (quadUV6 - quadUV4) * fillEnd;
        vData[uvOffset + 1] = quadUV5 + (quadUV7 - quadUV5) * fillEnd;
        break;
      case FillType$1.VERTICAL:
        vData[uvOffset] = quadUV0 + (quadUV4 - quadUV0) * fillStart;
        vData[uvOffset + 1] = quadUV1 + (quadUV5 - quadUV1) * fillStart;
        uvOffset += stride;
        vData[uvOffset] = quadUV2 + (quadUV6 - quadUV2) * fillStart;
        vData[uvOffset + 1] = quadUV3 + (quadUV7 - quadUV3) * fillStart;
        uvOffset += stride;
        vData[uvOffset] = quadUV0 + (quadUV4 - quadUV0) * fillEnd;
        vData[uvOffset + 1] = quadUV1 + (quadUV5 - quadUV1) * fillEnd;
        uvOffset += stride;
        vData[uvOffset] = quadUV2 + (quadUV6 - quadUV2) * fillEnd;
        vData[uvOffset + 1] = quadUV3 + (quadUV7 - quadUV3) * fillEnd;
        break;
      default:
        errorID(2626);
        break;
    }
  };
  _proto.updateVertexData = function updateVertexData(sprite, fillStart, fillEnd) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var dataList = renderData.data;
    var uiTrans = sprite.node._getUITransformComp();
    var width = uiTrans.width;
    var height = uiTrans.height;
    var appX = uiTrans.anchorX * width;
    var appY = uiTrans.anchorY * height;
    var l = -appX;
    var b = -appY;
    var r = width - appX;
    var t = height - appY;
    var progressStart = 0;
    var progressEnd = 0;
    switch (sprite.fillType) {
      case FillType$1.HORIZONTAL:
        progressStart = l + (r - l) * fillStart;
        progressEnd = l + (r - l) * fillEnd;
        l = progressStart;
        r = progressEnd;
        break;
      case FillType$1.VERTICAL:
        progressStart = b + (t - b) * fillStart;
        progressEnd = b + (t - b) * fillEnd;
        b = progressStart;
        t = progressEnd;
        break;
      default:
        errorID(2626);
        break;
    }
    dataList[0].x = l;
    dataList[0].y = b;
    dataList[1].x = r;
    dataList[1].y = b;
    dataList[2].x = l;
    dataList[2].y = t;
    dataList[3].x = r;
    dataList[3].y = t;
  };
  _proto.createData = function createData(sprite) {
    var renderData = sprite.requestRenderData();
    renderData.dataLength = 4;
    renderData.resize(4, 6);
    renderData.chunk.setIndexBuffer(QUAD_INDICES$1);
    renderData.data.forEach(function (data) {
      data.z = 0;
    });
    return renderData;
  };
  _proto.updateWorldVertexData = function updateWorldVertexData(sprite, chunk) {
    var node = sprite.node;
    node.getWorldMatrix(m$2);
    var renderData = sprite.renderData;
    if (!renderData) return;
    var stride = renderData.floatStride;
    var dataList = sprite.renderData.data;
    var vData = chunk.vb;
    var offset = 0;
    for (var i = 0; i < 4; i++) {
      var local = dataList[i];
      var x = local.x;
      var y = local.y;
      var rhw = m$2.m03 * x + m$2.m07 * y + m$2.m15;
      rhw = rhw ? 1 / rhw : 1;
      offset = i * stride;
      vData[offset] = (m$2.m00 * x + m$2.m04 * y + m$2.m12) * rhw;
      vData[offset + 1] = (m$2.m01 * x + m$2.m05 * y + m$2.m13) * rhw;
      vData[offset + 2] = (m$2.m02 * x + m$2.m06 * y + m$2.m14) * rhw;
    }
  };
  _proto.fillBuffers = function fillBuffers(sprite, renderer) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var chunk = renderData.chunk;
    if (sprite._flagChangedVersion !== sprite.node.flagChangedVersion || renderData.vertDirty) {
      this.updateWorldVertexData(sprite, chunk);
      renderData.vertDirty = false;
      sprite._flagChangedVersion = sprite.node.flagChangedVersion;
    }
    chunk.bufferId;
    var vid = chunk.vertexOffset;
    var meshBuffer = chunk.meshBuffer;
    var ib = chunk.meshBuffer.iData;
    var indexOffset = meshBuffer.indexOffset;
    ib[indexOffset++] = vid;
    ib[indexOffset++] = vid + 1;
    ib[indexOffset++] = vid + 2;
    ib[indexOffset++] = vid + 2;
    ib[indexOffset++] = vid + 1;
    ib[indexOffset++] = vid + 3;
    meshBuffer.indexOffset += 6;
  };
  _proto.updateColor = function updateColor(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var vData = renderData.chunk.vb;
    var stride = renderData.floatStride;
    var colorOffset = 5;
    var color = sprite.color;
    var colorR = color.r / 255;
    var colorG = color.g / 255;
    var colorB = color.b / 255;
    var colorA = sprite.node._uiProps.opacity;
    for (var i = 0; i < 4; i++) {
      vData[colorOffset] = colorR;
      vData[colorOffset + 1] = colorG;
      vData[colorOffset + 2] = colorB;
      vData[colorOffset + 3] = colorA;
      colorOffset += stride;
    }
  };
  return BarFilled;
}();
var barFilled = new BarFilled();

var PI_2 = Math.PI * 2;
var EPSILON = 1e-6;
var m$1 = new Mat4();
var _vertPos = [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
var _vertices = new Array(4);
var _uvs = new Array(8);
var _intersectPoint_1 = [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
var _intersectPoint_2 = [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
var _center = new Vec2();
var _triangles = [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
function _calcIntersectedPoints(left, right, bottom, top, center, angle, intersectPoints) {
  var sinAngle = Math.sin(angle);
  sinAngle = Math.abs(sinAngle) > EPSILON ? sinAngle : 0;
  var cosAngle = Math.cos(angle);
  cosAngle = Math.abs(cosAngle) > EPSILON ? cosAngle : 0;
  var tanAngle = 0;
  var cotAngle = 0;
  if (cosAngle !== 0) {
    tanAngle = sinAngle / cosAngle;
    if ((left - center.x) * cosAngle > 0) {
      var yLeft = center.y + tanAngle * (left - center.x);
      intersectPoints[0].x = left;
      intersectPoints[0].y = yLeft;
    }
    if ((right - center.x) * cosAngle > 0) {
      var yRight = center.y + tanAngle * (right - center.x);
      intersectPoints[2].x = right;
      intersectPoints[2].y = yRight;
    }
  }
  if (sinAngle !== 0) {
    cotAngle = cosAngle / sinAngle;
    if ((top - center.y) * sinAngle > 0) {
      var xTop = center.x + cotAngle * (top - center.y);
      intersectPoints[3].x = xTop;
      intersectPoints[3].y = top;
    }
    if ((bottom - center.y) * sinAngle > 0) {
      var xBottom = center.x + cotAngle * (bottom - center.y);
      intersectPoints[1].x = xBottom;
      intersectPoints[1].y = bottom;
    }
  }
}
function _calculateVertices(sprite) {
  var uiTrans = sprite.node._getUITransformComp();
  var width = uiTrans.width;
  var height = uiTrans.height;
  var appX = uiTrans.anchorX * width;
  var appY = uiTrans.anchorY * height;
  var l = -appX;
  var b = -appY;
  var r = width - appX;
  var t = height - appY;
  var vertices = _vertices;
  vertices[0] = l;
  vertices[1] = b;
  vertices[2] = r;
  vertices[3] = t;
  var fillCenter = sprite.fillCenter;
  var cx = _center.x = Math.min(Math.max(0, fillCenter.x), 1) * (r - l) + l;
  var cy = _center.y = Math.min(Math.max(0, fillCenter.y), 1) * (t - b) + b;
  _vertPos[0].x = _vertPos[3].x = l;
  _vertPos[1].x = _vertPos[2].x = r;
  _vertPos[0].y = _vertPos[1].y = b;
  _vertPos[2].y = _vertPos[3].y = t;
  _triangles.forEach(function (num) {
    Vec2.set(num, 0, 0);
  });
  if (cx !== vertices[0]) {
    Vec2.set(_triangles[0], 3, 0);
  }
  if (cx !== vertices[2]) {
    Vec2.set(_triangles[2], 1, 2);
  }
  if (cy !== vertices[1]) {
    Vec2.set(_triangles[1], 0, 1);
  }
  if (cy !== vertices[3]) {
    Vec2.set(_triangles[3], 2, 3);
  }
}
function _calculateUVs(spriteFrame) {
  var atlasWidth = spriteFrame.width;
  var atlasHeight = spriteFrame.height;
  var textureRect = spriteFrame.getRect();
  var u0 = 0;
  var u1 = 0;
  var v0 = 0;
  var v1 = 0;
  var uvs = _uvs;
  if (spriteFrame.isRotated()) {
    u0 = textureRect.x / atlasWidth;
    u1 = (textureRect.x + textureRect.height) / atlasWidth;
    v0 = textureRect.y / atlasHeight;
    v1 = (textureRect.y + textureRect.width) / atlasHeight;
    uvs[0] = uvs[2] = u0;
    uvs[4] = uvs[6] = u1;
    uvs[3] = uvs[7] = v1;
    uvs[1] = uvs[5] = v0;
  } else {
    u0 = textureRect.x / atlasWidth;
    u1 = (textureRect.x + textureRect.width) / atlasWidth;
    v0 = textureRect.y / atlasHeight;
    v1 = (textureRect.y + textureRect.height) / atlasHeight;
    uvs[0] = uvs[4] = u0;
    uvs[2] = uvs[6] = u1;
    uvs[1] = uvs[3] = v1;
    uvs[5] = uvs[7] = v0;
  }
}
function _getVertAngle(start, end) {
  var placementX = end.x - start.x;
  var placementY = end.y - start.y;
  if (placementX === 0 && placementY === 0) {
    return 0;
  } else if (placementX === 0) {
    if (placementY > 0) {
      return Math.PI * 0.5;
    } else {
      return Math.PI * 1.5;
    }
  } else {
    var angle = Math.atan(placementY / placementX);
    if (placementX < 0) {
      angle += Math.PI;
    }
    return angle;
  }
}
function _generateTriangle(dataList, offset, vert0, vert1, vert2) {
  var vertices = _vertices;
  var v0x = vertices[0];
  var v0y = vertices[1];
  var v1x = vertices[2];
  var v1y = vertices[3];
  dataList[offset].x = vert0.x;
  dataList[offset].y = vert0.y;
  dataList[offset + 1].x = vert1.x;
  dataList[offset + 1].y = vert1.y;
  dataList[offset + 2].x = vert2.x;
  dataList[offset + 2].y = vert2.y;
  var progressX = 0;
  var progressY = 0;
  progressX = (vert0.x - v0x) / (v1x - v0x);
  progressY = (vert0.y - v0y) / (v1y - v0y);
  _generateUV(progressX, progressY, dataList, offset);
  progressX = (vert1.x - v0x) / (v1x - v0x);
  progressY = (vert1.y - v0y) / (v1y - v0y);
  _generateUV(progressX, progressY, dataList, offset + 1);
  progressX = (vert2.x - v0x) / (v1x - v0x);
  progressY = (vert2.y - v0y) / (v1y - v0y);
  _generateUV(progressX, progressY, dataList, offset + 2);
}
function _generateUV(progressX, progressY, data, offset) {
  var uvs = _uvs;
  var px1 = uvs[0] + (uvs[2] - uvs[0]) * progressX;
  var px2 = uvs[4] + (uvs[6] - uvs[4]) * progressX;
  var py1 = uvs[1] + (uvs[3] - uvs[1]) * progressX;
  var py2 = uvs[5] + (uvs[7] - uvs[5]) * progressX;
  var uv = data[offset];
  uv.u = px1 + (px2 - px1) * progressY;
  uv.v = py1 + (py2 - py1) * progressY;
}
var RadialFilled = function () {
  function RadialFilled() {}
  var _proto = RadialFilled.prototype;
  _proto.createData = function createData(sprite) {
    return sprite.requestRenderData();
  };
  _proto.updateRenderData = function updateRenderData(sprite) {
    var frame = sprite.spriteFrame;
    dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
    this.updateUVs(sprite);
    var renderData = sprite.renderData;
    if (renderData && frame) {
      if (!renderData.vertDirty) {
        return;
      }
      var dataList = renderData.data;
      var fillStart = sprite.fillStart;
      var fillRange = sprite.fillRange;
      if (fillRange < 0) {
        fillStart += fillRange;
        fillRange = -fillRange;
      }
      while (fillStart >= 1.0) {
        fillStart -= 1.0;
      }
      while (fillStart < 0.0) {
        fillStart += 1.0;
      }
      fillStart *= PI_2;
      fillRange *= PI_2;
      var fillEnd = fillStart + fillRange;
      _calculateVertices(sprite);
      _calculateUVs(frame);
      _calcIntersectedPoints(_vertices[0], _vertices[2], _vertices[1], _vertices[3], _center, fillStart, _intersectPoint_1);
      _calcIntersectedPoints(_vertices[0], _vertices[2], _vertices[1], _vertices[3], _center, fillStart + fillRange, _intersectPoint_2);
      var offset = 0;
      for (var triangleIndex = 0; triangleIndex < 4; ++triangleIndex) {
        var triangle = _triangles[triangleIndex];
        if (!triangle) {
          continue;
        }
        if (fillRange >= PI_2) {
          renderData.dataLength = offset + 3;
          _generateTriangle(dataList, offset, _center, _vertPos[triangle.x], _vertPos[triangle.y]);
          offset += 3;
          continue;
        }
        var startAngle = _getVertAngle(_center, _vertPos[triangle.x]);
        var endAngle = _getVertAngle(_center, _vertPos[triangle.y]);
        if (endAngle < startAngle) {
          endAngle += PI_2;
        }
        startAngle -= PI_2;
        endAngle -= PI_2;
        for (var testIndex = 0; testIndex < 3; ++testIndex) {
          if (startAngle >= fillEnd) ; else if (startAngle >= fillStart) {
            renderData.dataLength = offset + 3;
            if (endAngle >= fillEnd) {
              _generateTriangle(dataList, offset, _center, _vertPos[triangle.x], _intersectPoint_2[triangleIndex]);
            } else {
              _generateTriangle(dataList, offset, _center, _vertPos[triangle.x], _vertPos[triangle.y]);
            }
            offset += 3;
          } else if (endAngle > fillStart) {
            if (endAngle <= fillEnd) {
              renderData.dataLength = offset + 3;
              _generateTriangle(dataList, offset, _center, _intersectPoint_1[triangleIndex], _vertPos[triangle.y]);
              offset += 3;
            } else {
              renderData.dataLength = offset + 3;
              _generateTriangle(dataList, offset, _center, _intersectPoint_1[triangleIndex], _intersectPoint_2[triangleIndex]);
              offset += 3;
            }
          }
          startAngle += PI_2;
          endAngle += PI_2;
        }
      }
      if (offset === 0) {
        renderData.dataLength = 0;
      }
      renderData.resize(offset, offset);
      renderData.updateRenderData(sprite, frame);
    }
  };
  _proto.createQuadIndices = function createQuadIndices(indexCount) {
    return;
  };
  _proto.fillBuffers = function fillBuffers(comp, renderer) {
    var node = comp.node;
    var renderData = comp.renderData;
    if (!renderData) return;
    var chunk = renderData.chunk;
    if (comp._flagChangedVersion !== node.flagChangedVersion || renderData.vertDirty) {
      this.updateWorldVertexAndUVData(comp, chunk);
      renderData.vertDirty = false;
      comp._flagChangedVersion = node.flagChangedVersion;
    }
    this.updateColorLate(comp);
    chunk.bufferId;
    var vid = chunk.vertexOffset;
    var meshBuffer = chunk.meshBuffer;
    var ib = chunk.meshBuffer.iData;
    var indexOffset = meshBuffer.indexOffset;
    for (var i = 0; i < renderData.indexCount; i++) {
      ib[indexOffset + i] = vid + i;
    }
    meshBuffer.indexOffset += renderData.indexCount;
    meshBuffer.setDirty();
  };
  _proto.updateWorldUVData = function updateWorldUVData(sprite) {
    return;
  };
  _proto.updateWorldVertexAndUVData = function updateWorldVertexAndUVData(sprite, chunk) {
    var node = sprite.node;
    node.getWorldMatrix(m$1);
    var renderData = sprite.renderData;
    if (!renderData) return;
    var stride = renderData.floatStride;
    var dataList = sprite.renderData.data;
    var vData = chunk.vb;
    var vertexCount = renderData.vertexCount;
    var vertexOffset = 0;
    for (var i = 0; i < vertexCount; i++) {
      var vert = dataList[i];
      var x = vert.x;
      var y = vert.y;
      var rhw = m$1.m03 * x + m$1.m07 * y + m$1.m15;
      rhw = rhw ? 1 / rhw : 1;
      vData[vertexOffset + 0] = (m$1.m00 * x + m$1.m04 * y + m$1.m12) * rhw;
      vData[vertexOffset + 1] = (m$1.m01 * x + m$1.m05 * y + m$1.m13) * rhw;
      vData[vertexOffset + 2] = (m$1.m02 * x + m$1.m06 * y + m$1.m14) * rhw;
      vData[vertexOffset + 3] = vert.u;
      vData[vertexOffset + 4] = vert.v;
      vertexOffset += stride;
    }
  };
  _proto.updateUVs = function updateUVs(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    renderData.vertDirty = true;
    sprite._markForUpdateRenderData();
  };
  _proto.updateColorLate = function updateColorLate(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var vData = renderData.chunk.vb;
    var stride = renderData.floatStride;
    var vertexCount = renderData.vertexCount;
    var colorOffset = 5;
    var color = sprite.color;
    var colorR = color.r / 255;
    var colorG = color.g / 255;
    var colorB = color.b / 255;
    var colorA = sprite.node._uiProps.opacity;
    for (var i = 0; i < vertexCount; i++) {
      vData[colorOffset] = colorR;
      vData[colorOffset + 1] = colorG;
      vData[colorOffset + 2] = colorB;
      vData[colorOffset + 3] = colorA;
      colorOffset += stride;
    }
  };
  _proto.updateColor = function updateColor(sprite) {};
  return RadialFilled;
}();
var radialFilled = new RadialFilled();

var QUAD_INDICES = Uint16Array.from([0, 1, 2, 1, 3, 2]);
var Simple = function () {
  function Simple() {}
  var _proto = Simple.prototype;
  _proto.createData = function createData(sprite) {
    var renderData = sprite.requestRenderData();
    renderData.dataLength = 4;
    renderData.resize(4, 6);
    renderData.chunk.setIndexBuffer(QUAD_INDICES);
    return renderData;
  };
  _proto.updateRenderData = function updateRenderData(sprite) {
    var frame = sprite.spriteFrame;
    dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
    this.updateUVs(sprite);
    var renderData = sprite.renderData;
    if (renderData && frame) {
      if (renderData.vertDirty) {
        this.updateVertexData(sprite);
      }
      renderData.updateRenderData(sprite, frame);
    }
  };
  _proto.updateWorldVerts = function updateWorldVerts(sprite, chunk) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var vData = chunk.vb;
    var dataList = renderData.data;
    var node = sprite.node;
    var m = node.worldMatrix;
    var m00 = m.m00;
    var m01 = m.m01;
    var m02 = m.m02;
    var m03 = m.m03;
    var m04 = m.m04;
    var m05 = m.m05;
    var m06 = m.m06;
    var m07 = m.m07;
    var m12 = m.m12;
    var m13 = m.m13;
    var m14 = m.m14;
    var m15 = m.m15;
    var stride = renderData.floatStride;
    var offset = 0;
    var length = dataList.length;
    for (var i = 0; i < length; ++i) {
      var curData = dataList[i];
      var x = curData.x;
      var y = curData.y;
      var rhw = m03 * x + m07 * y + m15;
      rhw = rhw ? 1 / rhw : 1;
      offset = i * stride;
      vData[offset + 0] = (m00 * x + m04 * y + m12) * rhw;
      vData[offset + 1] = (m01 * x + m05 * y + m13) * rhw;
      vData[offset + 2] = (m02 * x + m06 * y + m14) * rhw;
    }
  };
  _proto.fillBuffers = function fillBuffers(sprite, renderer) {
    if (sprite === null) {
      return;
    }
    var renderData = sprite.renderData;
    if (!renderData) return;
    var chunk = renderData.chunk;
    if (sprite._flagChangedVersion !== sprite.node.flagChangedVersion || renderData.vertDirty) {
      this.updateWorldVerts(sprite, chunk);
      renderData.vertDirty = false;
      sprite._flagChangedVersion = sprite.node.flagChangedVersion;
    }
    var vidOrigin = chunk.vertexOffset;
    var meshBuffer = chunk.meshBuffer;
    var ib = chunk.meshBuffer.iData;
    var indexOffset = meshBuffer.indexOffset;
    var vid = vidOrigin;
    ib[indexOffset++] = vid;
    ib[indexOffset++] = vid + 1;
    ib[indexOffset++] = vid + 2;
    ib[indexOffset++] = vid + 1;
    ib[indexOffset++] = vid + 3;
    ib[indexOffset++] = vid + 2;
    meshBuffer.indexOffset += 6;
  };
  _proto.updateVertexData = function updateVertexData(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) {
      return;
    }
    var uiTrans = sprite.node._getUITransformComp();
    var dataList = renderData.data;
    var cw = uiTrans.width;
    var ch = uiTrans.height;
    var appX = uiTrans.anchorX * cw;
    var appY = uiTrans.anchorY * ch;
    var l = 0;
    var b = 0;
    var r = 0;
    var t = 0;
    if (sprite.trim) {
      l = -appX;
      b = -appY;
      r = cw - appX;
      t = ch - appY;
    } else {
      var frame = sprite.spriteFrame;
      var originSize = frame.originalSize;
      var ow = originSize.width;
      var oh = originSize.height;
      var scaleX = cw / ow;
      var scaleY = ch / oh;
      var trimmedBorder = frame.trimmedBorder;
      l = trimmedBorder.x * scaleX - appX;
      b = trimmedBorder.z * scaleY - appY;
      r = cw + trimmedBorder.y * scaleX - appX;
      t = ch + trimmedBorder.w * scaleY - appY;
    }
    dataList[0].x = l;
    dataList[0].y = b;
    dataList[1].x = r;
    dataList[1].y = b;
    dataList[2].x = l;
    dataList[2].y = t;
    dataList[3].x = r;
    dataList[3].y = t;
    renderData.vertDirty = true;
  };
  _proto.updateUVs = function updateUVs(sprite) {
    var renderData = sprite.renderData;
    if (!sprite.spriteFrame || !renderData) return;
    var vData = renderData.chunk.vb;
    var uv = sprite.spriteFrame.uv;
    var stride = renderData.floatStride;
    var uvOffset = 3;
    for (var i = 0; i < renderData.dataLength; ++i) {
      var index = i * 2;
      vData[uvOffset] = uv[index];
      vData[uvOffset + 1] = uv[index + 1];
      uvOffset += stride;
    }
  };
  _proto.updateColor = function updateColor(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var vData = renderData.chunk.vb;
    var colorOffset = 5;
    var color = sprite.color;
    var colorR = color.r / 255;
    var colorG = color.g / 255;
    var colorB = color.b / 255;
    var colorA = color.a / 255;
    for (var i = 0; i < 4; i++, colorOffset += renderData.floatStride) {
      vData[colorOffset] = colorR;
      vData[colorOffset + 1] = colorG;
      vData[colorOffset + 2] = colorB;
      vData[colorOffset + 3] = colorA;
    }
  };
  return Simple;
}();
var simple = new Simple();

var tempRenderData$1 = [];
for (var i = 0; i < 4; i++) {
  tempRenderData$1.push({
    x: 0,
    y: 0,
    z: 0,
    u: 0,
    v: 0,
    color: new Color()
  });
}
var Sliced = function () {
  function Sliced() {
    this.QUAD_INDICES = void 0;
  }
  var _proto = Sliced.prototype;
  _proto.createData = function createData(sprite) {
    var renderData = sprite.requestRenderData();
    renderData.dataLength = 16;
    renderData.resize(16, 54);
    var quadIndices = this.QUAD_INDICES = new Uint16Array(54);
    this.createQuadIndices(4, 4);
    renderData.chunk.setIndexBuffer(quadIndices);
    return renderData;
  };
  _proto.createQuadIndices = function createQuadIndices(vertexRow, vertexCol) {
    var offset = 0;
    var quadIndices = this.QUAD_INDICES;
    for (var curRow = 0; curRow < vertexRow - 1; curRow++) {
      for (var curCol = 0; curCol < vertexCol - 1; curCol++) {
        var vid = curRow * vertexCol + curCol;
        quadIndices[offset++] = vid;
        quadIndices[offset++] = vid + 1;
        quadIndices[offset++] = vid + vertexCol;
        quadIndices[offset++] = vid + 1;
        quadIndices[offset++] = vid + 1 + vertexCol;
        quadIndices[offset++] = vid + vertexCol;
      }
    }
  };
  _proto.updateRenderData = function updateRenderData(sprite) {
    var frame = sprite.spriteFrame;
    dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
    this.updateUVs(sprite);
    var renderData = sprite.renderData;
    if (renderData && frame) {
      var vertDirty = renderData.vertDirty;
      if (vertDirty) {
        this.updateVertexData(sprite);
      }
      renderData.updateRenderData(sprite, frame);
    }
  };
  _proto.updateVertexData = function updateVertexData(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var dataList = renderData.data;
    var uiTrans = sprite.node._getUITransformComp();
    var width = uiTrans.width;
    var height = uiTrans.height;
    var appX = uiTrans.anchorX * width;
    var appY = uiTrans.anchorY * height;
    var frame = sprite.spriteFrame;
    var leftWidth = frame.insetLeft;
    var rightWidth = frame.insetRight;
    var topHeight = frame.insetTop;
    var bottomHeight = frame.insetBottom;
    var sizableWidth = width - leftWidth - rightWidth;
    var sizableHeight = height - topHeight - bottomHeight;
    var xScale = width / (leftWidth + rightWidth);
    var yScale = height / (topHeight + bottomHeight);
    xScale = Number.isNaN(xScale) || xScale > 1 ? 1 : xScale;
    yScale = Number.isNaN(yScale) || yScale > 1 ? 1 : yScale;
    sizableWidth = sizableWidth < 0 ? 0 : sizableWidth;
    sizableHeight = sizableHeight < 0 ? 0 : sizableHeight;
    tempRenderData$1[0].x = -appX;
    tempRenderData$1[0].y = -appY;
    tempRenderData$1[1].x = leftWidth * xScale - appX;
    tempRenderData$1[1].y = bottomHeight * yScale - appY;
    tempRenderData$1[2].x = tempRenderData$1[1].x + sizableWidth;
    tempRenderData$1[2].y = tempRenderData$1[1].y + sizableHeight;
    tempRenderData$1[3].x = width - appX;
    tempRenderData$1[3].y = height - appY;
    for (var curRow = 0; curRow < 4; curRow++) {
      for (var curCol = 0; curCol < 4; curCol++) {
        var curIndex = curRow * 4 + curCol;
        if (curIndex < renderData.dataLength && curRow < tempRenderData$1.length && curCol < tempRenderData$1.length) {
          dataList[curIndex].x = tempRenderData$1[curCol].x;
          dataList[curIndex].y = tempRenderData$1[curRow].y;
        }
      }
    }
  };
  _proto.fillBuffers = function fillBuffers(sprite, renderer) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var chunk = renderData.chunk;
    if (sprite._flagChangedVersion !== sprite.node.flagChangedVersion || renderData.vertDirty) {
      this.updateWorldVertexData(sprite, chunk);
      renderData.vertDirty = false;
      sprite._flagChangedVersion = sprite.node.flagChangedVersion;
    }
    chunk.bufferId;
    var vid = chunk.vertexOffset;
    var meshBuffer = chunk.meshBuffer;
    var ib = chunk.meshBuffer.iData;
    var indexOffset = meshBuffer.indexOffset;
    for (var r = 0; r < 3; ++r) {
      for (var c = 0; c < 3; ++c) {
        var start = vid + r * 4 + c;
        ib[indexOffset++] = start;
        ib[indexOffset++] = start + 1;
        ib[indexOffset++] = start + 4;
        ib[indexOffset++] = start + 1;
        ib[indexOffset++] = start + 5;
        ib[indexOffset++] = start + 4;
      }
    }
    meshBuffer.indexOffset = indexOffset;
  };
  _proto.updateWorldVertexData = function updateWorldVertexData(sprite, chunk) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var stride = renderData.floatStride;
    var dataList = renderData.data;
    var vData = chunk.vb;
    var node = sprite.node;
    var m = node.worldMatrix;
    var m00 = m.m00;
    var m01 = m.m01;
    var m02 = m.m02;
    var m03 = m.m03;
    var m04 = m.m04;
    var m05 = m.m05;
    var m06 = m.m06;
    var m07 = m.m07;
    var m12 = m.m12;
    var m13 = m.m13;
    var m14 = m.m14;
    var m15 = m.m15;
    var offset = 0;
    for (var row = 0; row < 4; ++row) {
      var rowD = dataList[row * 4];
      for (var col = 0; col < 4; ++col) {
        var colD = dataList[col];
        var x = colD.x;
        var y = rowD.y;
        var rhw = m03 * x + m07 * y + m15;
        rhw = rhw ? 1 / rhw : 1;
        offset = (row * 4 + col) * stride;
        vData[offset + 0] = (m00 * x + m04 * y + m12) * rhw;
        vData[offset + 1] = (m01 * x + m05 * y + m13) * rhw;
        vData[offset + 2] = (m02 * x + m06 * y + m14) * rhw;
      }
    }
  };
  _proto.updateUVs = function updateUVs(sprite) {
    var renderData = sprite.renderData;
    if (!sprite.spriteFrame || !renderData) return;
    var vData = renderData.chunk.vb;
    var stride = renderData.floatStride;
    var uv = sprite.spriteFrame.uvSliced;
    var uvOffset = 3;
    for (var _i = 0; _i < 16; _i++) {
      vData[uvOffset] = uv[_i].u;
      vData[uvOffset + 1] = uv[_i].v;
      uvOffset += stride;
    }
  };
  _proto.updateColor = function updateColor(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var vData = renderData.chunk.vb;
    var stride = renderData.floatStride;
    var colorOffset = 5;
    var color = sprite.color;
    var colorR = color.r / 255;
    var colorG = color.g / 255;
    var colorB = color.b / 255;
    var colorA = sprite.node._uiProps.opacity;
    for (var _i2 = 0; _i2 < 16; _i2++) {
      vData[colorOffset] = colorR;
      vData[colorOffset + 1] = colorG;
      vData[colorOffset + 2] = colorB;
      vData[colorOffset + 3] = colorA;
      colorOffset += stride;
    }
  };
  return Sliced;
}();
var sliced = new Sliced();

var m = new Mat4();
var origin;
var leftInner;
var rightInner;
var rightOuter;
var bottomInner;
var topInner;
var topOuter;
var tempRenderDataLength = 0;
var tempRenderData = [];
function has9SlicedOffsetVertexCount(spriteFrame) {
  if (spriteFrame) {
    if (spriteFrame.insetTop > 0 || spriteFrame.insetBottom > 0 || spriteFrame.insetLeft > 0 || spriteFrame.insetRight > 0) {
      return 2;
    }
  }
  return 0;
}
var Tiled = function () {
  function Tiled() {}
  var _proto = Tiled.prototype;
  _proto.createData = function createData(sprite) {
    return sprite.requestRenderData();
  };
  _proto.updateRenderData = function updateRenderData(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var frame = sprite.spriteFrame;
    if (!frame || !renderData) {
      return;
    }
    dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
    if (!renderData.vertDirty) {
      return;
    }
    var uiTrans = sprite.node._getUITransformComp();
    var contentWidth = Math.abs(uiTrans.width);
    var contentHeight = Math.abs(uiTrans.height);
    var rect = frame.getRect();
    var leftWidth = frame.insetLeft;
    var rightWidth = frame.insetRight;
    var centerWidth = rect.width - leftWidth - rightWidth;
    var topHeight = frame.insetTop;
    var bottomHeight = frame.insetBottom;
    var centerHeight = rect.height - topHeight - bottomHeight;
    var sizableWidth = contentWidth - leftWidth - rightWidth;
    var sizableHeight = contentHeight - topHeight - bottomHeight;
    sizableWidth = sizableWidth > 0 ? sizableWidth : 0;
    sizableHeight = sizableHeight > 0 ? sizableHeight : 0;
    var hRepeat = centerWidth === 0 ? sizableWidth : sizableWidth / centerWidth;
    var vRepeat = centerHeight === 0 ? sizableHeight : sizableHeight / centerHeight;
    var offsetVertexCount = has9SlicedOffsetVertexCount(frame);
    var row = Math.ceil(vRepeat + offsetVertexCount);
    var col = Math.ceil(hRepeat + offsetVertexCount);
    renderData.dataLength = row * 2 * (col * 2);
    this.updateVerts(sprite, sizableWidth, sizableHeight, row, col);
    renderData.resize(row * col * 4, row * col * 6);
    renderData.updateRenderData(sprite, frame);
  };
  _proto.createQuadIndices = function createQuadIndices(indexCount) {
    return;
  };
  _proto.updateUVs = function updateUVs(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    renderData.vertDirty = true;
    sprite._markForUpdateRenderData();
  };
  _proto.fillBuffers = function fillBuffers(sprite, renderer) {
    var node = sprite.node;
    var renderData = sprite.renderData;
    if (!renderData) return;
    var chunk = renderData.chunk;
    if (chunk === null) {
      return;
    }
    if (sprite._flagChangedVersion !== node.flagChangedVersion || renderData.vertDirty) {
      this.updateWorldVertexAndUVData(sprite, chunk);
      renderData.vertDirty = false;
      sprite._flagChangedVersion = node.flagChangedVersion;
    }
    this.updateColorLate(sprite);
    chunk.bufferId;
    var vid = chunk.vertexOffset;
    var meshBuffer = chunk.meshBuffer;
    var ib = chunk.meshBuffer.iData;
    var indexOffset = meshBuffer.indexOffset;
    for (var i = 0; i < renderData.indexCount; i += 6) {
      ib[indexOffset++] = vid;
      ib[indexOffset++] = vid + 1;
      ib[indexOffset++] = vid + 2;
      ib[indexOffset++] = vid + 1;
      ib[indexOffset++] = vid + 3;
      ib[indexOffset++] = vid + 2;
      vid += 4;
      meshBuffer.indexOffset += 6;
    }
    meshBuffer.setDirty();
  };
  _proto.updateWorldUVData = function updateWorldUVData(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var stride = renderData.floatStride;
    var dataList = renderData.data;
    var vData = renderData.chunk.vb;
    for (var i = 0; i < dataList.length; i++) {
      var offset = i * stride;
      vData[offset + 3] = dataList[i].u;
      vData[offset + 4] = dataList[i].v;
    }
  };
  _proto.updateWorldVertexAndUVData = function updateWorldVertexAndUVData(sprite, chunk) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var node = sprite.node;
    node.getWorldMatrix(m);
    var stride = renderData.floatStride;
    var dataList = renderData.data;
    var vData = chunk.vb;
    var length = dataList.length;
    for (var i = 0; i < length; i++) {
      var x = dataList[i].x;
      var y = dataList[i].y;
      var z = dataList[i].z;
      var rhw = m.m03 * x + m.m07 * y + m.m11 * z + m.m15;
      rhw = rhw ? 1 / rhw : 1;
      var offset = i * stride;
      vData[offset] = (m.m00 * x + m.m04 * y + m.m08 * z + m.m12) * rhw;
      vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m09 * z + m.m13) * rhw;
      vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m10 * z + m.m14) * rhw;
    }
    this.updateWorldUVData(sprite);
  };
  _proto.updateVerts = function updateVerts(sprite, sizableWidth, sizableHeight, row, col) {
    var uiTrans = sprite.node._getUITransformComp();
    var renderData = sprite.renderData;
    if (!renderData) return;
    var dataList = renderData.data;
    var frame = sprite.spriteFrame;
    var rect = frame.rect;
    var contentWidth = Math.abs(uiTrans.width);
    var contentHeight = Math.abs(uiTrans.height);
    var appx = uiTrans.anchorX * contentWidth;
    var appy = uiTrans.anchorY * contentHeight;
    var leftWidth = frame.insetLeft;
    var rightWidth = frame.insetRight;
    var centerWidth = rect.width - leftWidth - rightWidth;
    var topHeight = frame.insetTop;
    var bottomHeight = frame.insetBottom;
    var centerHeight = rect.height - topHeight - bottomHeight;
    var xScale = uiTrans.width / (leftWidth + rightWidth) > 1 ? 1 : uiTrans.width / (leftWidth + rightWidth);
    var yScale = uiTrans.height / (topHeight + bottomHeight) > 1 ? 1 : uiTrans.height / (topHeight + bottomHeight);
    var offsetWidth = 0;
    var offsetHeight = 0;
    if (centerWidth > 0) {
      offsetWidth = Math.floor(sizableWidth * 1000) / 1000 % centerWidth === 0 ? centerWidth : sizableWidth % centerWidth;
    } else {
      offsetWidth = sizableWidth;
    }
    if (centerHeight > 0) {
      offsetHeight = Math.floor(sizableHeight * 1000) / 1000 % centerHeight === 0 ? centerHeight : sizableHeight % centerHeight;
    } else {
      offsetHeight = sizableHeight;
    }
    tempRenderData.length = 0;
    tempRenderDataLength = Math.max(row + 1, col + 1);
    for (var i = 0; i < tempRenderDataLength; i++) {
      tempRenderData.push({
        x: 0,
        y: 0,
        z: 0,
        u: 0,
        v: 0,
        color: new Color()
      });
    }
    var offsetVertexCount = has9SlicedOffsetVertexCount(frame);
    if (offsetVertexCount === 0) {
      for (var _i = 0; _i < tempRenderDataLength; _i++) {
        if (_i >= col) {
          tempRenderData[_i].x = contentWidth - appx;
        } else {
          tempRenderData[_i].x = -appx + _i * centerWidth;
        }
        if (_i >= row) {
          tempRenderData[_i].y = contentHeight - appy;
        } else {
          tempRenderData[_i].y = -appy + _i * centerHeight;
        }
      }
    } else {
      for (var _i2 = 0; _i2 < tempRenderDataLength; _i2++) {
        if (_i2 === 0) {
          tempRenderData[_i2].x = -appx;
        } else if (_i2 === 1) {
          tempRenderData[_i2].x = -appx + leftWidth * xScale;
        } else if (_i2 > 1 && _i2 < col - 1) {
          if (centerWidth > 0) {
            tempRenderData[_i2].x = -appx + leftWidth * xScale + centerWidth * (_i2 - 1);
          } else {
            tempRenderData[_i2].x = leftWidth + sizableWidth - appx;
          }
        } else if (_i2 === col - 1) {
          tempRenderData[_i2].x = -appx + leftWidth * xScale + offsetWidth + centerWidth * (_i2 - 2);
        } else if (_i2 >= col) {
          tempRenderData[_i2].x = Math.min(leftWidth + sizableWidth + rightWidth, contentWidth) - appx;
        }
        if (_i2 === 0) {
          tempRenderData[_i2].y = -appy;
        } else if (_i2 === 1) {
          tempRenderData[_i2].y = -appy + bottomHeight * yScale;
        } else if (_i2 > 1 && _i2 < row - 1) {
          if (centerHeight > 0) {
            tempRenderData[_i2].y = -appy + bottomHeight * yScale + centerHeight * (_i2 - 1);
          } else {
            tempRenderData[_i2].y = bottomHeight + sizableHeight - appy;
          }
        } else if (_i2 === row - 1) {
          tempRenderData[_i2].y = -appy + bottomHeight * yScale + offsetHeight + centerHeight * (_i2 - 2);
        } else if (_i2 >= row) {
          tempRenderData[_i2].y = Math.min(bottomHeight + sizableHeight + topHeight, contentHeight) - appy;
        }
      }
    }
    var x = 0;
    var x1 = 0;
    var y = 0;
    var y1 = 0;
    for (var yIndex = 0; yIndex < row; ++yIndex) {
      y = tempRenderData[yIndex].y;
      y1 = tempRenderData[yIndex + 1].y;
      for (var xIndex = 0; xIndex < col; ++xIndex) {
        x = tempRenderData[xIndex].x;
        x1 = tempRenderData[xIndex + 1].x;
        var curIndex = 4 * (yIndex * col + xIndex);
        dataList[curIndex].x = x;
        dataList[curIndex].y = y;
        dataList[curIndex + 1].x = x1;
        dataList[curIndex + 1].y = y;
        dataList[curIndex + 2].x = x;
        dataList[curIndex + 2].y = y1;
        dataList[curIndex + 3].x = x1;
        dataList[curIndex + 3].y = y1;
      }
    }
    var rotated = frame.rotated;
    frame.uv;
    var uvSliced = frame.uvSliced;
    origin = uvSliced[0];
    leftInner = uvSliced[1];
    rightInner = uvSliced[2];
    rightOuter = uvSliced[3];
    bottomInner = uvSliced[4];
    topInner = uvSliced[8];
    topOuter = uvSliced[12];
    var coefU = 0;
    var coefV = 0;
    var hRepeat = centerWidth === 0 ? sizableWidth : sizableWidth / centerWidth;
    var vRepeat = centerHeight === 0 ? sizableHeight : sizableHeight / centerHeight;
    var tempXVerts = [];
    var tempYVerts = [];
    for (var yIndexUV = 0; yIndexUV < row; ++yIndexUV) {
      if (sizableHeight > centerHeight) {
        var curYRectCount = offsetVertexCount > 0 ? yIndexUV : yIndexUV + 1;
        if (sizableHeight >= curYRectCount * centerHeight) {
          coefV = 1;
        } else {
          coefV = vRepeat % 1;
        }
      } else {
        coefV = vRepeat;
      }
      for (var xIndexUV = 0; xIndexUV < col; ++xIndexUV) {
        if (sizableWidth > centerWidth) {
          var curXRectCount = offsetVertexCount > 0 ? xIndexUV : xIndexUV + 1;
          if (sizableWidth >= curXRectCount * centerWidth) {
            coefU = 1;
          } else {
            coefU = hRepeat % 1;
          }
        } else {
          coefU = hRepeat;
        }
        if (rotated) {
          if (offsetVertexCount === 0) {
            tempXVerts[0] = bottomInner.u;
            tempXVerts[1] = bottomInner.u;
            tempXVerts[2] = bottomInner.u + (topInner.u - bottomInner.u) * coefV;
            tempYVerts[0] = leftInner.v;
            tempYVerts[1] = leftInner.v + (rightInner.v - leftInner.v) * coefU;
            tempYVerts[2] = leftInner.v;
          } else {
            if (yIndexUV === 0) {
              tempXVerts[0] = origin.u;
              tempXVerts[1] = origin.u;
              tempXVerts[2] = bottomInner.u;
            } else if (yIndexUV < row - 1) {
              tempXVerts[0] = bottomInner.u;
              tempXVerts[1] = bottomInner.u;
              tempXVerts[2] = bottomInner.u + (topInner.u - bottomInner.u) * coefV;
            } else if (yIndexUV === row - 1) {
              tempXVerts[0] = topInner.u;
              tempXVerts[1] = topInner.u;
              tempXVerts[2] = topOuter.u;
            }
            if (xIndexUV === 0) {
              tempYVerts[0] = origin.v;
              tempYVerts[1] = leftInner.v;
              tempYVerts[2] = origin.v;
            } else if (xIndexUV < col - 1) {
              tempYVerts[0] = leftInner.v;
              tempYVerts[1] = leftInner.v + (rightInner.v - leftInner.v) * coefU;
              tempYVerts[2] = leftInner.v;
            } else if (xIndexUV === col - 1) {
              tempYVerts[0] = rightInner.v;
              tempYVerts[1] = rightOuter.v;
              tempYVerts[2] = rightInner.v;
            }
          }
          tempXVerts[3] = tempXVerts[2];
          tempYVerts[3] = tempYVerts[1];
        } else {
          if (offsetVertexCount === 0) {
            tempXVerts[0] = leftInner.u;
            tempXVerts[1] = leftInner.u + (rightInner.u - leftInner.u) * coefU;
            tempXVerts[2] = leftInner.u;
            tempYVerts[0] = bottomInner.v;
            tempYVerts[1] = bottomInner.v;
            tempYVerts[2] = bottomInner.v + (topInner.v - bottomInner.v) * coefV;
          } else {
            if (xIndexUV === 0) {
              tempXVerts[0] = origin.u;
              tempXVerts[1] = leftInner.u;
              tempXVerts[2] = origin.u;
            } else if (xIndexUV < col - 1) {
              tempXVerts[0] = leftInner.u;
              tempXVerts[1] = leftInner.u + (rightInner.u - leftInner.u) * coefU;
              tempXVerts[2] = leftInner.u;
            } else if (xIndexUV === col - 1) {
              tempXVerts[0] = rightInner.u;
              tempXVerts[1] = rightOuter.u;
              tempXVerts[2] = rightInner.u;
            }
            if (yIndexUV === 0) {
              tempYVerts[0] = origin.v;
              tempYVerts[1] = origin.v;
              tempYVerts[2] = bottomInner.v;
            } else if (yIndexUV < row - 1) {
              tempYVerts[0] = bottomInner.v;
              tempYVerts[1] = bottomInner.v;
              tempYVerts[2] = bottomInner.v + (topInner.v - bottomInner.v) * coefV;
            } else if (yIndexUV === row - 1) {
              tempYVerts[0] = topInner.v;
              tempYVerts[1] = topInner.v;
              tempYVerts[2] = topOuter.v;
            }
          }
          tempXVerts[3] = tempXVerts[1];
          tempYVerts[3] = tempYVerts[2];
        }
        var _curIndex = 4 * (yIndexUV * col + xIndexUV);
        dataList[_curIndex].u = tempXVerts[0];
        dataList[_curIndex].v = tempYVerts[0];
        dataList[_curIndex + 1].u = tempXVerts[1];
        dataList[_curIndex + 1].v = tempYVerts[1];
        dataList[_curIndex + 2].u = tempXVerts[2];
        dataList[_curIndex + 2].v = tempYVerts[2];
        dataList[_curIndex + 3].u = tempXVerts[3];
        dataList[_curIndex + 3].v = tempYVerts[3];
      }
    }
  };
  _proto.updateColorLate = function updateColorLate(sprite) {
    var renderData = sprite.renderData;
    if (!renderData) return;
    var vData = renderData.chunk.vb;
    var stride = renderData.floatStride;
    var vertexCount = renderData.vertexCount;
    var colorOffset = 5;
    var color = sprite.color;
    var colorR = color.r / 255;
    var colorG = color.g / 255;
    var colorB = color.b / 255;
    var colorA = sprite.node._uiProps.opacity;
    for (var i = 0; i < vertexCount; i++) {
      vData[colorOffset] = colorR;
      vData[colorOffset + 1] = colorG;
      vData[colorOffset + 2] = colorB;
      vData[colorOffset + 3] = colorA;
      colorOffset += stride;
    }
  };
  _proto.updateColor = function updateColor(sprite) {};
  return Tiled;
}();
var tiled = new Tiled();

var SpriteType = Sprite.Type;
var FillType = Sprite.FillType;
var spriteAssembler = {
  getAssembler: function getAssembler(spriteComp) {
    var util = simple;
    var comp = spriteComp;
    switch (comp.type) {
      case SpriteType.SLICED:
        util = sliced;
        break;
      case SpriteType.TILED:
        util = tiled;
        break;
      case SpriteType.FILLED:
        if (comp.fillType === FillType.RADIAL) {
          util = radialFilled;
        } else {
          util = barFilled;
        }
        break;
    }
    return util;
  }
};
Sprite.Assembler = spriteAssembler;

var mouseEvents = [InputEventType.MOUSE_DOWN, InputEventType.MOUSE_MOVE, InputEventType.MOUSE_UP, InputEventType.MOUSE_WHEEL, InputEventType.MOUSE_LEAVE, InputEventType.MOUSE_ENTER];
var touchEvents = [InputEventType.TOUCH_START, InputEventType.TOUCH_MOVE, InputEventType.TOUCH_END, InputEventType.TOUCH_CANCEL];
var isDestroy = function isDestroy(node) {
  return !!(node._objFlags & CCObjectFlags.Destroying || node._objFlags & CCObjectFlags.Destroyed);
};
var PointerEventDispatcher = function () {
  function PointerEventDispatcher() {
    this.priority = EventDispatcherPriority.UI;
    this._isListDirty = false;
    this._inDispatchCount = 0;
    this._pointerEventProcessorList = [];
    this._processorListToAdd = [];
    this._processorListToRemove = [];
    input._registerEventDispatcher(this);
    var callbacksInvoker = NodeEventProcessor.callbacksInvoker;
    callbacksInvoker.on(DispatcherEventType.ADD_POINTER_EVENT_PROCESSOR, this.addPointerEventProcessor, this);
    callbacksInvoker.on(DispatcherEventType.REMOVE_POINTER_EVENT_PROCESSOR, this.removePointerEventProcessor, this);
    callbacksInvoker.on(DispatcherEventType.MARK_LIST_DIRTY, this._markListDirty, this);
  }
  var _proto = PointerEventDispatcher.prototype;
  _proto.onThrowException = function onThrowException() {
    this._inDispatchCount = 0;
  };
  _proto.dispatchEvent = function dispatchEvent(event) {
    var eventType = event.type;
    if (touchEvents.includes(eventType)) {
      return this.dispatchEventTouch(event);
    } else if (mouseEvents.includes(eventType)) {
      return this.dispatchEventMouse(event);
    }
    return true;
  };
  _proto.addPointerEventProcessor = function addPointerEventProcessor(pointerEventProcessor) {
    if (this._inDispatchCount === 0) {
      if (!this._pointerEventProcessorList.includes(pointerEventProcessor)) {
        this._pointerEventProcessorList.push(pointerEventProcessor);
        this._isListDirty = true;
      }
    } else if (!this._processorListToAdd.includes(pointerEventProcessor)) {
      this._processorListToAdd.push(pointerEventProcessor);
    }
    remove(this._processorListToRemove, pointerEventProcessor);
  };
  _proto.removePointerEventProcessor = function removePointerEventProcessor(pointerEventProcessor) {
    if (this._inDispatchCount === 0) {
      remove(this._pointerEventProcessorList, pointerEventProcessor);
      this._isListDirty = true;
    } else if (!this._processorListToRemove.includes(pointerEventProcessor)) {
      this._processorListToRemove.push(pointerEventProcessor);
    }
    remove(this._processorListToAdd, pointerEventProcessor);
  };
  _proto.dispatchEventMouse = function dispatchEventMouse(eventMouse) {
    this._inDispatchCount++;
    this._sortPointerEventProcessorList();
    var pointerEventProcessorList = this._pointerEventProcessorList;
    var length = pointerEventProcessorList.length;
    var dispatchToNextEventDispatcher = true;
    for (var i = 0; i < length; ++i) {
      var pointerEventProcessor = pointerEventProcessorList[i];
      if (pointerEventProcessor.isEnabled && pointerEventProcessor.shouldHandleEventMouse && pointerEventProcessor._handleEventMouse(eventMouse)) {
        dispatchToNextEventDispatcher = false;
        if (!eventMouse.preventSwallow) {
          break;
        } else {
          eventMouse.preventSwallow = false;
        }
      }
    }
    if (--this._inDispatchCount <= 0) {
      this._updatePointerEventProcessorList();
    }
    return dispatchToNextEventDispatcher;
  };
  _proto.dispatchEventTouch = function dispatchEventTouch(eventTouch) {
    this._inDispatchCount++;
    this._sortPointerEventProcessorList();
    var pointerEventProcessorList = this._pointerEventProcessorList;
    var length = pointerEventProcessorList.length;
    var touch = eventTouch.touch;
    var dispatchToNextEventDispatcher = true;
    for (var i = 0; i < length; ++i) {
      var pointerEventProcessor = pointerEventProcessorList[i];
      if (pointerEventProcessor.isEnabled && pointerEventProcessor.shouldHandleEventTouch) {
        if (eventTouch.type === InputEventType.TOUCH_START) {
          if (pointerEventProcessor._handleEventTouch(eventTouch)) {
            if (pointerEventProcessor.isEnabled) {
              pointerEventProcessor.claimedTouchIdList.push(touch.getID());
            } else {
              var cancelEvent = new EventTouch([eventTouch.touch], true, InputEventType.TOUCH_CANCEL);
              cancelEvent.touch = eventTouch.touch;
              pointerEventProcessor.dispatchEvent(cancelEvent);
              pointerEventProcessor.claimedTouchIdList.length = 0;
            }
            dispatchToNextEventDispatcher = false;
            if (!eventTouch.preventSwallow) {
              break;
            } else {
              eventTouch.preventSwallow = false;
            }
          }
        } else if (pointerEventProcessor.claimedTouchIdList.length > 0) {
          var index = pointerEventProcessor.claimedTouchIdList.indexOf(touch.getID());
          if (index !== -1) {
            pointerEventProcessor._handleEventTouch(eventTouch);
            if (eventTouch.type === InputEventType.TOUCH_END || eventTouch.type === InputEventType.TOUCH_CANCEL) {
              removeAt(pointerEventProcessor.claimedTouchIdList, index);
              if (!eventTouch.preventSwallow) {
                this._removeClaimedTouch(i + 1, touch.getID());
              }
            }
            dispatchToNextEventDispatcher = false;
            if (!eventTouch.preventSwallow) {
              break;
            } else {
              eventTouch.preventSwallow = false;
            }
          }
        }
      }
    }
    if (--this._inDispatchCount <= 0) {
      this._updatePointerEventProcessorList();
    }
    return dispatchToNextEventDispatcher;
  };
  _proto._removeClaimedTouch = function _removeClaimedTouch(eventProcessorIndex, touchID) {
    var pointerEventProcessorList = this._pointerEventProcessorList;
    var length = pointerEventProcessorList.length;
    for (var i = eventProcessorIndex; i < length; ++i) {
      var pointerEventProcessor = pointerEventProcessorList[i];
      var touchIndex = pointerEventProcessor.claimedTouchIdList.indexOf(touchID);
      if (touchIndex !== -1) {
        removeAt(pointerEventProcessor.claimedTouchIdList, touchIndex);
      }
    }
  };
  _proto._updatePointerEventProcessorList = function _updatePointerEventProcessorList() {
    var listToAdd = this._processorListToAdd;
    var addLength = listToAdd.length;
    for (var i = 0; i < addLength; ++i) {
      this.addPointerEventProcessor(listToAdd[i]);
    }
    listToAdd.length = 0;
    var listToRemove = this._processorListToRemove;
    var removeLength = listToRemove.length;
    for (var _i = 0; _i < removeLength; ++_i) {
      this.removePointerEventProcessor(listToRemove[_i]);
    }
    listToRemove.length = 0;
  };
  _proto._sortPointerEventProcessorList = function _sortPointerEventProcessorList() {
    if (!this._isListDirty) {
      return;
    }
    var pointerEventProcessorList = this._pointerEventProcessorList;
    var length = pointerEventProcessorList.length;
    for (var i = 0; i < length; ++i) {
      var pointerEventProcessor = pointerEventProcessorList[i];
      var node = pointerEventProcessor.node;
      if (node._uiProps) {
        var trans = node._getUITransformComp();
        pointerEventProcessor.cachedCameraPriority = trans.cameraPriority;
      }
    }
    pointerEventProcessorList.sort(this._sortByPriority);
    this._isListDirty = false;
  };
  _proto._sortByPriority = function _sortByPriority(p1, p2) {
    var node1 = p1.node;
    var node2 = p2.node;
    if (!p2 || !node2 || isDestroy(node2) || !node2.activeInHierarchy || !node2._getUITransformComp()) {
      return -1;
    } else if (!p1 || !node1 || isDestroy(node1) || !node1.activeInHierarchy || !node1._getUITransformComp()) {
      return 1;
    }
    if (p1.cachedCameraPriority !== p2.cachedCameraPriority) {
      return p2.cachedCameraPriority - p1.cachedCameraPriority;
    }
    var n1 = node1;
    var n2 = node2;
    var ex = false;
    while (((_parent = n1.parent) == null ? void 0 : _parent.uuid) !== ((_parent2 = n2.parent) == null ? void 0 : _parent2.uuid)) {
      var _parent, _parent2, _n, _n$parent, _n2, _n2$parent;
      n1 = ((_n = n1) == null ? void 0 : (_n$parent = _n.parent) == null ? void 0 : _n$parent.parent) === null ? (ex = true) && node2 : n1 && n1.parent;
      n2 = ((_n2 = n2) == null ? void 0 : (_n2$parent = _n2.parent) == null ? void 0 : _n2$parent.parent) === null ? (ex = true) && node1 : n2 && n2.parent;
    }
    if (n1.uuid === n2.uuid) {
      if (n1.uuid === node2.uuid) {
        return -1;
      }
      if (n1.uuid === node1.uuid) {
        return 1;
      }
    }
    var priority1 = n1 ? n1.siblingIndex : 0;
    var priority2 = n2 ? n2.siblingIndex : 0;
    return ex ? priority1 - priority2 : priority2 - priority1;
  };
  _proto._markListDirty = function _markListDirty() {
    this._isListDirty = true;
  };
  return PointerEventDispatcher;
}();
new PointerEventDispatcher();

var UIDrawBatch = function (_DrawBatch2D) {
  function UIDrawBatch() {
    return _DrawBatch2D.apply(this, arguments) || this;
  }
  _inheritsLoose(UIDrawBatch, _DrawBatch2D);
  return UIDrawBatch;
}(DrawBatch2D);
markAsWarning(MeshBuffer.prototype, 'MeshBuffer', ['byteStart', 'vertexStart', 'indicesStart', 'request'].map(function (item) {
  return {
    name: item,
    suggest: "please use meshBuffer.accessor." + item + " instead"
  };
}));
replaceProperty(MeshBuffer.prototype, 'MeshBuffer', [{
  name: 'indicesOffset',
  newName: 'indexOffset'
}]);
removeProperty(MeshBuffer.prototype, 'MeshBuffer', [{
  name: 'vertexBuffers'
}, {
  name: 'indexBuffer'
}]);
replaceProperty(Batcher2D.prototype, 'Batcher2D', [{
  name: 'currBufferBatch',
  newName: 'currBufferAccessor'
}, {
  name: 'acquireBufferBatch',
  newName: 'switchBufferAccessor'
}]);
removeProperty(MeshRenderData.prototype, 'MeshRenderData', [{
  name: 'formatByte'
}, {
  name: 'byteStart'
}, {
  name: 'byteCount'
}]);
replaceProperty(MeshRenderData.prototype, 'MeshRenderData', [{
  name: 'indicesStart',
  newName: 'indexStart'
}]);
var QuadRenderData = function (_MeshRenderData) {
  function QuadRenderData(vertexFormat) {
    var _this;
    _this = _MeshRenderData.call(this, vertexFormat) || this;
    warnID(9006);
    return _this;
  }
  _inheritsLoose(QuadRenderData, _MeshRenderData);
  return QuadRenderData;
}(MeshRenderData);

cclegacy.UI = {
  MeshBuffer: MeshBuffer,
  spriteAssembler: spriteAssembler,
  labelAssembler: labelAssembler,
  RenderData: RenderData,
  MeshRenderData: MeshRenderData
};

export { BASELINE_RATIO, BitmapFont, CacheMode, Graphics as GraphicsComponent, HorizontalTextAlignment, Label, Label as LabelComponent, LabelOutline, LabelOutline as LabelOutlineComponent, LabelShadow, Mask as MaskComponent, MeshBuffer, MeshRenderData, Overflow$1 as Overflow, QuadRenderData, UIRenderer as RenderComponent, RenderData, UIRenderer as Renderable2D, RichText as RichTextComponent, Sprite, Sprite as SpriteComponent, SpriteFrame, Batcher2D as UI, UIDrawBatch, UIMeshRenderer, UIMeshRenderer as UIModelComponent, UIOpacity, UIOpacity as UIOpacityComponent, UIRenderer as UIRenderable, UIRenderer, UIStaticBatch, UIStaticBatch as UIStaticBatchComponent, VerticalTextAlignment, dynamicAtlasManager, fragmentText, getBaselineOffset, getSymbolAt, getSymbolCodeAt, getSymbolLength, isUnicodeCJK, isUnicodeSpace, labelAssembler, safeMeasureText, spriteAssembler };
//# sourceMappingURL=2d.js.map
