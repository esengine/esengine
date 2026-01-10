import { _ as _inheritsLoose, t as createMap, u as getClassId, x as ccenum, w as warnID, a as _createClass, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import { c as ccclass, b as applyDecoratedInitializer, s as serializable, t as type, a as clamp, V as Vec2, l as executionOrder } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { R as RenderTexture } from './debug-view-BuNhRPv_.js';
import { A as Asset } from './node-event-Ccvtv8bJ.js';
import { f as TextureBase, P as PixelFormat, d as builtinResMgr, b as Material } from './scene-vWcxM1_c.js';
import { S as SpriteFrame, a as SpriteFrameEvent } from './sprite-frame-DHXMUUT-.js';
import { I as InstanceMaterialType, U as UIRenderer } from './ui-renderer-JpGcj-VM.js';

var _dec$1, _class$1, _class2$1, _initializer$1;
var SpriteAtlas = (_dec$1 = ccclass('cc.SpriteAtlas'), _dec$1(_class$1 = (_class2$1 = function (_Asset) {
  function SpriteAtlas(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this.spriteFrames = _initializer$1 && _initializer$1();
    return _this;
  }
  _inheritsLoose(SpriteAtlas, _Asset);
  var _proto = SpriteAtlas.prototype;
  _proto.getTexture = function getTexture() {
    var keys = Object.keys(this.spriteFrames);
    if (keys.length > 0) {
      var spriteFrame = this.spriteFrames[keys[0]];
      return spriteFrame && spriteFrame.texture;
    } else {
      return null;
    }
  };
  _proto.getSpriteFrame = function getSpriteFrame(key) {
    var sf = this.spriteFrames[key];
    if (!sf) {
      return null;
    }
    if (!sf.name) {
      sf.name = key;
    }
    return sf;
  };
  _proto.getSpriteFrames = function getSpriteFrames() {
    var frames = [];
    var spriteFrames = this.spriteFrames;
    for (var _key in spriteFrames) {
      frames.push(spriteFrames[_key]);
    }
    return frames;
  };
  _proto._serialize = function _serialize(ctxForExporting) {
    return null;
  };
  _proto._deserialize = function _deserialize(serializeData, handle) {
    var data = serializeData;
    this._name = data.name;
    var frames = data.spriteFrames;
    this.spriteFrames = createMap();
    for (var i = 0; i < frames.length; i += 2) {
      handle.result.push(this.spriteFrames, frames[i], frames[i + 1], getClassId(SpriteFrame));
    }
  };
  return SpriteAtlas;
}(Asset), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "spriteFrames", [serializable], function () {
  return createMap();
}), _class2$1)) || _class$1);
cclegacy.SpriteAtlas = SpriteAtlas;

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _Sprite;
var SpriteType;
(function (SpriteType) {
  SpriteType[SpriteType["SIMPLE"] = 0] = "SIMPLE";
  SpriteType[SpriteType["SLICED"] = 1] = "SLICED";
  SpriteType[SpriteType["TILED"] = 2] = "TILED";
  SpriteType[SpriteType["FILLED"] = 3] = "FILLED";
})(SpriteType || (SpriteType = {}));
ccenum(SpriteType);
var FillType;
(function (FillType) {
  FillType[FillType["HORIZONTAL"] = 0] = "HORIZONTAL";
  FillType[FillType["VERTICAL"] = 1] = "VERTICAL";
  FillType[FillType["RADIAL"] = 2] = "RADIAL";
})(FillType || (FillType = {}));
ccenum(FillType);
var SizeMode;
(function (SizeMode) {
  SizeMode[SizeMode["CUSTOM"] = 0] = "CUSTOM";
  SizeMode[SizeMode["TRIMMED"] = 1] = "TRIMMED";
  SizeMode[SizeMode["RAW"] = 2] = "RAW";
})(SizeMode || (SizeMode = {}));
ccenum(SizeMode);
var SpriteEventType;
(function (SpriteEventType) {
  SpriteEventType["SPRITE_FRAME_CHANGED"] = "spriteframe-changed";
})(SpriteEventType || (SpriteEventType = {}));
var Sprite = (_dec = ccclass('cc.Sprite'), _dec2 = executionOrder(110), _dec3 = type(SpriteAtlas), _dec4 = type(SpriteFrame), _dec5 = type(SpriteType), _dec6 = type(FillType), _dec7 = type(SizeMode), _dec(_class = _dec2(_class = (_class2 = (_Sprite = function (_UIRenderer) {
  function Sprite() {
    var _this;
    _this = _UIRenderer.call(this) || this;
    _this._spriteFrame = _initializer && _initializer();
    _this._type = _initializer2 && _initializer2();
    _this._fillType = _initializer3 && _initializer3();
    _this._sizeMode = _initializer4 && _initializer4();
    _this._fillCenter = _initializer5 && _initializer5();
    _this._fillStart = _initializer6 && _initializer6();
    _this._fillRange = _initializer7 && _initializer7();
    _this._isTrimmedMode = _initializer8 && _initializer8();
    _this._useGrayscale = _initializer9 && _initializer9();
    _this._atlas = _initializer0 && _initializer0();
    return _this;
  }
  _inheritsLoose(Sprite, _UIRenderer);
  var _proto = Sprite.prototype;
  _proto.__preload = function __preload() {
    this.changeMaterialForDefine();
    _UIRenderer.prototype.__preload.call(this);
  };
  _proto.onEnable = function onEnable() {
    _UIRenderer.prototype.onEnable.call(this);
    this._activateMaterial();
    var spriteFrame = this._spriteFrame;
    if (spriteFrame) {
      this._updateUVs();
      if (this._type === SpriteType.SLICED) {
        spriteFrame.on(SpriteFrameEvent.UV_UPDATED, this._updateUVs, this);
      }
    }
  };
  _proto.onDisable = function onDisable() {
    _UIRenderer.prototype.onDisable.call(this);
    if (this._spriteFrame && this._type === SpriteType.SLICED) {
      this._spriteFrame.off(SpriteFrameEvent.UV_UPDATED, this._updateUVs, this);
    }
  };
  _proto.onDestroy = function onDestroy() {
    _UIRenderer.prototype.onDestroy.call(this);
  };
  _proto.changeSpriteFrameFromAtlas = function changeSpriteFrameFromAtlas(name) {
    if (!this._atlas) {
      warnID(16377);
      return;
    }
    var sprite = this._atlas.getSpriteFrame(name);
    this.spriteFrame = sprite;
  };
  _proto.changeMaterialForDefine = function changeMaterialForDefine() {
    var texture;
    var lastInstanceMaterialType = this._instanceMaterialType;
    if (this._spriteFrame) {
      texture = this._spriteFrame.texture;
    }
    var value = false;
    if (texture instanceof TextureBase) {
      var format = texture.getPixelFormat();
      value = format === PixelFormat.RGBA_ETC1 || format === PixelFormat.RGB_A_PVRTC_4BPPV1 || format === PixelFormat.RGB_A_PVRTC_2BPPV1;
    }
    if (value && this.grayscale) {
      this._instanceMaterialType = InstanceMaterialType.USE_ALPHA_SEPARATED_AND_GRAY;
    } else if (value) {
      this._instanceMaterialType = InstanceMaterialType.USE_ALPHA_SEPARATED;
    } else if (this.grayscale) {
      this._instanceMaterialType = InstanceMaterialType.GRAYSCALE;
    } else {
      this._instanceMaterialType = InstanceMaterialType.ADD_COLOR_AND_TEXTURE;
    }
    if (lastInstanceMaterialType !== this._instanceMaterialType) {
      this.updateMaterial();
    }
  };
  _proto._updateBuiltinMaterial = function _updateBuiltinMaterial() {
    var mat = _UIRenderer.prototype._updateBuiltinMaterial.call(this);
    if (this.spriteFrame && this.spriteFrame.texture instanceof RenderTexture) {
      var rtMatName = "rt-" + mat.name;
      var rtMat = builtinResMgr.get(rtMatName);
      if (!rtMat) {
        rtMat = new Material(rtMatName);
        rtMat.copy(mat, {
          defines: {
            SAMPLE_FROM_RT: true
          }
        });
        builtinResMgr.addAsset(rtMatName, rtMat);
      }
      mat = rtMat;
    }
    return mat;
  };
  _proto._render = function _render(render) {
    render.commitComp(this, this.renderData, this._spriteFrame, this._assembler, null);
  };
  _proto._canRender = function _canRender() {
    if (!_UIRenderer.prototype._canRender.call(this)) {
      return false;
    }
    var spriteFrame = this._spriteFrame;
    if (!spriteFrame || !spriteFrame.texture) {
      return false;
    }
    return true;
  };
  _proto._flushAssembler = function _flushAssembler() {
    var self = this;
    var assembler = Sprite.Assembler.getAssembler(self);
    if (self._assembler !== assembler) {
      self.destroyRenderData();
      self._assembler = assembler;
    }
    if (!self._renderData) {
      if (assembler && assembler.createData) {
        var rd = self._renderData = assembler.createData(self);
        rd.material = self.getRenderMaterial(0);
        self._markForUpdateRenderData();
        if (self.spriteFrame) {
          assembler.updateUVs(self);
        }
        self._updateColor();
      }
    }
    var spriteFrame = self._spriteFrame;
    if (spriteFrame) {
      if (self._type === SpriteType.SLICED) {
        spriteFrame.on(SpriteFrameEvent.UV_UPDATED, self._updateUVs, self);
      } else {
        spriteFrame.off(SpriteFrameEvent.UV_UPDATED, self._updateUVs, self);
      }
    }
  };
  _proto._applySpriteSize = function _applySpriteSize() {
    var self = this;
    var spriteFrame = self._spriteFrame;
    if (spriteFrame) {
      if (!spriteFrame.isDefault) {
        var uiProps = self.node._uiProps;
        if (SizeMode.RAW === self._sizeMode) {
          var size = spriteFrame.originalSize;
          uiProps.uiTransformComp.setContentSize(size);
        } else if (SizeMode.TRIMMED === self._sizeMode) {
          var rect = spriteFrame.rect;
          uiProps.uiTransformComp.setContentSize(rect.width, rect.height);
        }
      }
    }
  };
  _proto._resized = function _resized() {
    {
      return;
    }
  };
  _proto._activateMaterial = function _activateMaterial() {
    var spriteFrame = this._spriteFrame;
    var material = this.getRenderMaterial(0);
    if (spriteFrame) {
      if (material) {
        this._markForUpdateRenderData();
      }
    }
    if (this.renderData) {
      this.renderData.material = material;
    }
  };
  _proto._updateUVs = function _updateUVs() {
    if (this._assembler) {
      this._assembler.updateUVs(this);
    }
  };
  _proto._applySpriteFrame = function _applySpriteFrame(oldFrame) {
    var self = this;
    var spriteFrame = self._spriteFrame;
    if (oldFrame && self._type === SpriteType.SLICED) {
      oldFrame.off(SpriteFrameEvent.UV_UPDATED, self._updateUVs, self);
    }
    var textureChanged = false;
    if (spriteFrame) {
      if (!oldFrame || oldFrame.texture !== spriteFrame.texture) {
        textureChanged = true;
      }
      if (textureChanged) {
        if (self.renderData) self.renderData.textureDirty = true;
        var oldIsRT = oldFrame ? oldFrame.texture instanceof RenderTexture : false;
        var newIsRT = spriteFrame.texture instanceof RenderTexture;
        if (oldIsRT !== newIsRT) {
          self._instanceMaterialType = -1;
        }
        self.changeMaterialForDefine();
      }
      self._applySpriteSize();
      if (self._type === SpriteType.SLICED) {
        spriteFrame.on(SpriteFrameEvent.UV_UPDATED, self._updateUVs, self);
      }
    }
  };
  return _createClass(Sprite, [{
    key: "spriteAtlas",
    get: function get() {
      return this._atlas;
    },
    set: function set(value) {
      if (this._atlas === value) {
        return;
      }
      this._atlas = value;
    }
  }, {
    key: "spriteFrame",
    get: function get() {
      return this._spriteFrame;
    },
    set: function set(value) {
      if (this._spriteFrame === value) {
        return;
      }
      var lastSprite = this._spriteFrame;
      this._spriteFrame = value;
      this._markForUpdateRenderData();
      this._applySpriteFrame(lastSprite);
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(value) {
      if (this._type !== value) {
        this._type = value;
        this._flushAssembler();
      }
    }
  }, {
    key: "fillType",
    get: function get() {
      return this._fillType;
    },
    set: function set(value) {
      if (this._fillType !== value) {
        if (value === FillType.RADIAL || this._fillType === FillType.RADIAL) {
          this.destroyRenderData();
        } else if (this.renderData) {
          this._markForUpdateRenderData(true);
        }
      }
      this._fillType = value;
      this._flushAssembler();
    }
  }, {
    key: "fillCenter",
    get: function get() {
      return this._fillCenter;
    },
    set: function set(value) {
      this._fillCenter.x = value.x;
      this._fillCenter.y = value.y;
      if (this._type === SpriteType.FILLED && this.renderData) {
        this._markForUpdateRenderData();
      }
    }
  }, {
    key: "fillStart",
    get: function get() {
      return this._fillStart;
    },
    set: function set(value) {
      this._fillStart = clamp(value, 0, 1);
      if (this._type === SpriteType.FILLED && this.renderData) {
        this._markForUpdateRenderData();
        this._updateUVs();
      }
    }
  }, {
    key: "fillRange",
    get: function get() {
      return this._fillRange;
    },
    set: function set(value) {
      this._fillRange = clamp(value, -1, 1);
      if (this._type === SpriteType.FILLED && this.renderData) {
        this._markForUpdateRenderData();
        this._updateUVs();
      }
    }
  }, {
    key: "trim",
    get: function get() {
      return this._isTrimmedMode;
    },
    set: function set(value) {
      if (this._isTrimmedMode === value) {
        return;
      }
      this._isTrimmedMode = value;
      if (this._type === SpriteType.SIMPLE && this.renderData) {
        this._markForUpdateRenderData(true);
      }
    }
  }, {
    key: "grayscale",
    get: function get() {
      return this._useGrayscale;
    },
    set: function set(value) {
      if (this._useGrayscale === value) {
        return;
      }
      this._useGrayscale = value;
      this.changeMaterialForDefine();
      this.updateMaterial();
    }
  }, {
    key: "sizeMode",
    get: function get() {
      return this._sizeMode;
    },
    set: function set(value) {
      if (this._sizeMode === value) {
        return;
      }
      this._sizeMode = value;
      if (value !== SizeMode.CUSTOM) {
        this._applySpriteSize();
      }
    }
  }]);
}(UIRenderer), _Sprite.FillType = FillType, _Sprite.Type = SpriteType, _Sprite.SizeMode = SizeMode, _Sprite.EventType = SpriteEventType, _Sprite), _applyDecoratedDescriptor(_class2.prototype, "spriteAtlas", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "spriteAtlas"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "spriteFrame", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "spriteFrame"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "type", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "type"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "fillType", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "fillType"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "sizeMode", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "sizeMode"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_spriteFrame", [serializable], function () {
  return null;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_type", [serializable], function () {
  return SpriteType.SIMPLE;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_fillType", [serializable], function () {
  return FillType.HORIZONTAL;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_sizeMode", [serializable], function () {
  return SizeMode.TRIMMED;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_fillCenter", [serializable], function () {
  return new Vec2(0, 0);
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_fillStart", [serializable], function () {
  return 0;
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "_fillRange", [serializable], function () {
  return 0;
}), _initializer8 = applyDecoratedInitializer(_class2.prototype, "_isTrimmedMode", [serializable], function () {
  return true;
}), _initializer9 = applyDecoratedInitializer(_class2.prototype, "_useGrayscale", [serializable], function () {
  return false;
}), _initializer0 = applyDecoratedInitializer(_class2.prototype, "_atlas", [serializable], function () {
  return null;
}), _class2)) || _class) || _class);
cclegacy.Sprite = Sprite;

export { Sprite as S, SpriteEventType as a, SpriteAtlas as b };
//# sourceMappingURL=sprite-BKXaVEzt.js.map
