import { _ as _inheritsLoose, w as warnID, F as fastRemove, G as macro, a as _createClass, k as errorID, H as fillItems, u as getClassId } from './gc-object-CShF5lzx.js';
import { S as System, u as v3, w as mat4, f as Vec3, c as ccclass, m as Rect, v as v2, x as size, y as rect, z as v4 } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy, a as ccwindow } from './global-exports-DnCP_14L.js';
import { A as Asset } from './node-event-Ccvtv8bJ.js';
import { P as PixelFormat, i as Texture2D, I as ImageAsset } from './scene-vWcxM1_c.js';
import './device-manager-CBXP-ttm.js';
import { J as BufferTextureCopy, a4 as Filter, A as Attribute, y as PrimitiveMode, a as AttributeName, F as Format } from './buffer-barrier-BlQXg9Aa.js';
import './deprecated-Dswa7XeN.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import './prefab-DYg_oxpo.js';
import { _ as _createMesh } from './create-mesh-CfKC5EQd.js';
import './debug-view-BuNhRPv_.js';

var space = 2;
function drawTextureAt(texture, image, x, y) {
  texture.drawTextureAt(image, x, y);
}
var Atlas = function () {
  function Atlas(width, height) {
    this._innerTextureInfos = {};
    this._innerSpriteFrames = [];
    this._count = 0;
    var texture = new DynamicAtlasTexture();
    texture.initWithSize(width, height);
    this._texture = texture;
    this._width = width;
    this._height = height;
    this._x = space;
    this._y = space;
    this._nextY = space;
  }
  var _proto = Atlas.prototype;
  _proto.insertSpriteFrame = function insertSpriteFrame(spriteFrame) {
    var rect = spriteFrame.rect;
    var texture = spriteFrame.texture;
    var info = this._innerTextureInfos[texture.getId()];
    var sx = rect.x;
    var sy = rect.y;
    if (info) {
      sx += info.x;
      sy += info.y;
    } else {
      var width = texture.width;
      var height = texture.height;
      if (this._x + width + space > this._width) {
        this._x = space;
        this._y = this._nextY;
      }
      if (this._y + height + space > this._nextY) {
        this._nextY = this._y + height + space;
      }
      if (this._nextY > this._height) {
        return null;
      }
      var thisTexture = this._texture;
      var image = texture.image;
      if (cclegacy.internal.dynamicAtlasManager.textureBleeding) {
        if (width <= 8 || height <= 8) {
          drawTextureAt(thisTexture, image, this._x - 1, this._y - 1);
          drawTextureAt(thisTexture, image, this._x - 1, this._y + 1);
          drawTextureAt(thisTexture, image, this._x + 1, this._y - 1);
          drawTextureAt(thisTexture, image, this._x + 1, this._y + 1);
        }
        drawTextureAt(thisTexture, image, this._x - 1, this._y);
        drawTextureAt(thisTexture, image, this._x + 1, this._y);
        drawTextureAt(thisTexture, image, this._x, this._y - 1);
        drawTextureAt(thisTexture, image, this._x, this._y + 1);
      }
      drawTextureAt(thisTexture, image, this._x, this._y);
      this._innerTextureInfos[texture.getId()] = {
        x: this._x,
        y: this._y,
        texture: texture
      };
      this._count++;
      sx += this._x;
      sy += this._y;
      this._x += width + space;
    }
    var frame = {
      x: sx,
      y: sy,
      texture: this._texture
    };
    this._innerSpriteFrames.push(spriteFrame);
    return frame;
  };
  _proto.removeSpriteFrame = function removeSpriteFrame(spriteFrame) {
    fastRemove(this._innerSpriteFrames, spriteFrame);
  };
  _proto.deleteInnerTexture = function deleteInnerTexture(texture) {
    if (texture && this._innerTextureInfos[texture.getId()]) {
      delete this._innerTextureInfos[texture.getId()];
      this._count--;
    }
  };
  _proto.isEmpty = function isEmpty() {
    return this._count <= 0;
  };
  _proto.reset = function reset() {
    this._x = space;
    this._y = space;
    this._nextY = space;
    var frames = this._innerSpriteFrames;
    for (var i = 0, l = frames.length; i < l; i++) {
      var frame = frames[i];
      if (!frame.isValid) {
        continue;
      }
      frame._resetDynamicAtlasFrame();
    }
    this._innerSpriteFrames.length = 0;
    this._innerTextureInfos = {};
  };
  _proto.destroy = function destroy() {
    this.reset();
    this._texture.destroy();
  };
  return Atlas;
}();
var DynamicAtlasTexture = function (_Texture2D) {
  function DynamicAtlasTexture() {
    return _Texture2D.apply(this, arguments) || this;
  }
  _inheritsLoose(DynamicAtlasTexture, _Texture2D);
  var _proto2 = DynamicAtlasTexture.prototype;
  _proto2.initWithSize = function initWithSize(width, height, format) {
    if (format === void 0) {
      format = PixelFormat.RGBA8888;
    }
    this.reset({
      width: width,
      height: height,
      format: format
    });
  };
  _proto2.drawTextureAt = function drawTextureAt(image, x, y) {
    var gfxTexture = this.getGFXTexture();
    if (!image || !gfxTexture) {
      return;
    }
    var gfxDevice = this._getGFXDevice();
    if (!gfxDevice) {
      warnID(16363);
      return;
    }
    var region = new BufferTextureCopy();
    region.texOffset.x = x;
    region.texOffset.y = y;
    region.texExtent.width = image.width;
    region.texExtent.height = image.height;
    gfxDevice.copyTexImagesToTexture([image.data], gfxTexture, [region]);
  };
  return DynamicAtlasTexture;
}(Texture2D);

var DynamicAtlasManager = function (_System) {
  function DynamicAtlasManager() {
    var _this;
    _this = _System.call(this) || this;
    _this._atlases = [];
    _this._atlasIndex = -1;
    _this._maxAtlasCount = 5;
    _this._textureSize = 2048;
    _this._maxFrameSize = 512;
    _this._textureBleeding = true;
    _this._enabled = false;
    return _this;
  }
  _inheritsLoose(DynamicAtlasManager, _System);
  var _proto = DynamicAtlasManager.prototype;
  _proto.newAtlas = function newAtlas() {
    var atlas = this._atlases[++this._atlasIndex];
    if (!atlas && this._atlasIndex < this.maxAtlasCount) {
      atlas = new Atlas(this._textureSize, this._textureSize);
      this._atlases.push(atlas);
    }
    return atlas;
  };
  _proto.beforeSceneLoad = function beforeSceneLoad() {
    this.reset();
  };
  _proto.init = function init() {
    this.enabled = !macro.CLEANUP_IMAGE_CACHE;
  };
  _proto.insertSpriteFrame = function insertSpriteFrame(spriteFrame) {
    if (!this._enabled || this._atlasIndex >= this._maxAtlasCount || !spriteFrame || spriteFrame.original) return null;
    if (!spriteFrame.packable) return null;
    var sampler = spriteFrame.texture.getSamplerInfo();
    if (sampler.minFilter !== Filter.LINEAR || sampler.magFilter !== Filter.LINEAR || sampler.mipFilter !== Filter.NONE) {
      return null;
    }
    var atlas = this._atlases[this._atlasIndex];
    if (!atlas) {
      atlas = this.newAtlas();
    }
    var frame = atlas ? atlas.insertSpriteFrame(spriteFrame) : null;
    if (!frame && this._atlasIndex < this._maxAtlasCount) {
      atlas = this.newAtlas();
      return atlas ? atlas.insertSpriteFrame(spriteFrame) : null;
    }
    return frame;
  };
  _proto.reset = function reset() {
    for (var i = 0, l = this._atlases.length; i < l; i++) {
      this._atlases[i].destroy();
    }
    this._atlases.length = 0;
    this._atlasIndex = -1;
  };
  _proto.deleteAtlasSpriteFrame = function deleteAtlasSpriteFrame(spriteFrame) {
    if (!spriteFrame.original) return;
    var atlas;
    for (var i = this._atlases.length - 1; i >= 0; i--) {
      atlas = this._atlases[i];
      atlas.removeSpriteFrame(spriteFrame);
    }
    var texture = spriteFrame.original._texture;
    this.deleteAtlasTexture(texture);
  };
  _proto.deleteAtlasTexture = function deleteAtlasTexture(texture) {
    if (texture) {
      for (var i = this._atlases.length - 1; i >= 0; i--) {
        this._atlases[i].deleteInnerTexture(texture);
        if (this._atlases[i].isEmpty()) {
          this._atlases[i].destroy();
          this._atlases.splice(i, 1);
          this._atlasIndex--;
        }
      }
    }
  };
  _proto.packToDynamicAtlas = function packToDynamicAtlas(comp, frame) {
    if (!this._enabled) return;
    if (frame && !frame.original && frame.packable && frame.texture && frame.texture.width > 0 && frame.texture.height > 0) {
      var packedFrame = this.insertSpriteFrame(frame);
      if (packedFrame) {
        frame._setDynamicAtlasFrame(packedFrame);
      }
    }
  };
  return _createClass(DynamicAtlasManager, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(value) {
      if (this._enabled === value) return;
      if (value) {
        this.reset();
        director.on(DirectorEvent.BEFORE_SCENE_LAUNCH, this.beforeSceneLoad, this);
      } else {
        this.reset();
        director.off(DirectorEvent.BEFORE_SCENE_LAUNCH, this.beforeSceneLoad, this);
      }
      this._enabled = value;
    }
  }, {
    key: "maxAtlasCount",
    get: function get() {
      return this._maxAtlasCount;
    },
    set: function set(value) {
      this._maxAtlasCount = value;
    }
  }, {
    key: "atlasCount",
    get: function get() {
      return this._atlases.length;
    }
  }, {
    key: "textureBleeding",
    get: function get() {
      return this._textureBleeding;
    },
    set: function set(enable) {
      this._textureBleeding = enable;
    }
  }, {
    key: "textureSize",
    get: function get() {
      return this._textureSize;
    },
    set: function set(value) {
      this._textureSize = value;
    }
  }, {
    key: "maxFrameSize",
    get: function get() {
      return this._maxFrameSize;
    },
    set: function set(value) {
      this._maxFrameSize = value;
    }
  }]);
}(System);
DynamicAtlasManager.instance = void 0;
var dynamicAtlasManager = DynamicAtlasManager.instance = new DynamicAtlasManager();
director.registerSystem('dynamicAtlasManager', dynamicAtlasManager, 0);
cclegacy.internal.dynamicAtlasManager = dynamicAtlasManager;

var _dec, _class, _SpriteFrame;
var INSET_LEFT = 0;
var INSET_TOP = 1;
var INSET_RIGHT = 2;
var INSET_BOTTOM = 3;
var temp_vec3 = v3();
var temp_matrix = mat4();
var vec3TransformMat4 = Vec3.transformMat4;
var vec3ToArray = Vec3.toArray;
var MeshType;
(function (MeshType) {
  MeshType[MeshType["RECT"] = 0] = "RECT";
  MeshType[MeshType["POLYGON"] = 1] = "POLYGON";
})(MeshType || (MeshType = {}));
var temp_uvs = [{
  u: 0,
  v: 0
}, {
  u: 0,
  v: 0
}, {
  u: 0,
  v: 0
}, {
  u: 0,
  v: 0
}];
var SpriteFrameEvent;
(function (SpriteFrameEvent) {
  SpriteFrameEvent["UV_UPDATED"] = "uv_updated";
})(SpriteFrameEvent || (SpriteFrameEvent = {}));
var SpriteFrame = (_dec = ccclass('cc.SpriteFrame'), _dec(_class = (_SpriteFrame = function (_Asset) {
  function SpriteFrame(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this.vertices = null;
    _this.uv = [];
    _this.unbiasUV = [];
    _this.uvSliced = [];
    _this._rect = rect();
    _this._trimmedBorder = v4();
    _this._offset = v2();
    _this._originalSize = size();
    _this._rotated = false;
    _this._capInsets = [0, 0, 0, 0];
    _this._atlasUuid = '';
    _this._texture = void 0;
    _this._isFlipUVY = false;
    _this._isFlipUVX = false;
    _this._original = null;
    _this._packable = true;
    _this._pixelsToUnit = 100;
    _this._pivot = v2(0.5, 0.5);
    _this._meshType = MeshType.RECT;
    _this._extrude = 0;
    _this._customOutLine = [];
    _this._mesh = null;
    _this._minPos = v3();
    _this._maxPos = v3();
    return _this;
  }
  _inheritsLoose(SpriteFrame, _Asset);
  SpriteFrame.createWithImage = function createWithImage(imageSourceOrImageAsset) {
    var img = imageSourceOrImageAsset instanceof ImageAsset ? imageSourceOrImageAsset : new ImageAsset(imageSourceOrImageAsset);
    var tex = new Texture2D();
    tex.image = img;
    var spf = new SpriteFrame();
    spf.texture = tex;
    return spf;
  };
  var _proto = SpriteFrame.prototype;
  _proto.textureLoaded = function textureLoaded() {
    return !!this.texture;
  };
  _proto.isRotated = function isRotated() {
    return this._rotated;
  };
  _proto.setRotated = function setRotated(rotated) {
    this.rotated = rotated;
  };
  _proto.getRect = function getRect(out) {
    if (out) {
      out.set(this._rect);
      return out;
    }
    return this._rect.clone();
  };
  _proto.setRect = function setRect(rect) {
    this.rect = rect;
  };
  _proto.getOriginalSize = function getOriginalSize(out) {
    if (out) {
      out.set(this._originalSize);
      return out;
    }
    return this._originalSize.clone();
  };
  _proto.setOriginalSize = function setOriginalSize(size) {
    this.originalSize = size;
  };
  _proto.getOffset = function getOffset(out) {
    if (out) {
      out.set(this._offset);
      return out;
    }
    return this._offset.clone();
  };
  _proto.setOffset = function setOffset(offset) {
    this.offset = offset;
  };
  _proto.getGFXTexture = function getGFXTexture() {
    return this._texture.getGFXTexture();
  };
  _proto.getGFXSampler = function getGFXSampler() {
    return this._texture.getGFXSampler();
  };
  _proto.getHash = function getHash() {
    return this._texture.getHash();
  };
  _proto.getSamplerInfo = function getSamplerInfo() {
    return this._texture.getSamplerInfo();
  };
  _proto.reset = function reset(info, clearData) {
    if (clearData === void 0) {
      clearData = false;
    }
    var self = this;
    var calUV = false;
    if (clearData) {
      self._originalSize.set(0, 0);
      self._rect.set(0, 0, 0, 0);
      self._offset.set(0, 0);
      self._capInsets = [0, 0, 0, 0];
      self._rotated = false;
      calUV = true;
    }
    if (info) {
      if (info.texture) {
        self._rect.set(0, 0, info.texture.width, info.texture.height);
        self._refreshTexture(info.texture);
        self.checkRect(self._texture);
      }
      if (info.originalSize) {
        self._originalSize.set(info.originalSize);
      }
      if (info.rect) {
        self._rect.set(info.rect);
      }
      if (info.offset) {
        self._offset.set(info.offset);
      }
      var thisCapInsets = self._capInsets;
      if (info.borderTop !== undefined) {
        thisCapInsets[INSET_TOP] = info.borderTop;
      }
      if (info.borderBottom !== undefined) {
        thisCapInsets[INSET_BOTTOM] = info.borderBottom;
      }
      if (info.borderLeft !== undefined) {
        thisCapInsets[INSET_LEFT] = info.borderLeft;
      }
      if (info.borderRight !== undefined) {
        thisCapInsets[INSET_RIGHT] = info.borderRight;
      }
      if (info.isRotate !== undefined) {
        self._rotated = !!info.isRotate;
      }
      if (info.isFlipUv !== undefined) {
        self._isFlipUVY = !!info.isFlipUv;
      }
      calUV = true;
    }
    if (calUV && self.texture) {
      self._calculateUV();
    }
    self._calcTrimmedBorder();
  };
  _proto.checkRect = function checkRect(texture) {
    var rect = this._rect;
    var maxX = rect.x;
    var maxY = rect.y;
    if (this._rotated) {
      maxX += rect.height;
      maxY += rect.width;
    } else {
      maxX += rect.width;
      maxY += rect.height;
    }
    if (maxX > texture.width) {
      errorID(3300, this.name + "/" + texture.name, maxX, texture.width);
      return false;
    }
    if (maxY > texture.height) {
      errorID(3301, this.name + "/" + texture.name, maxY, texture.height);
      return false;
    }
    return true;
  };
  _proto._calcTrimmedBorder = function _calcTrimmedBorder() {
    var self = this;
    var ow = self._originalSize.width;
    var oh = self._originalSize.height;
    var rw = self._rect.width;
    var rh = self._rect.height;
    var halfTrimmedWidth = (ow - rw) * 0.5;
    var halfTrimmedHeight = (oh - rh) * 0.5;
    var thisOffset = self._offset;
    var thisTrimmedBorder = self._trimmedBorder;
    thisTrimmedBorder.x = thisOffset.x + halfTrimmedWidth;
    thisTrimmedBorder.y = thisOffset.x - halfTrimmedWidth;
    thisTrimmedBorder.z = thisOffset.y + halfTrimmedHeight;
    thisTrimmedBorder.w = thisOffset.y - halfTrimmedHeight;
  };
  _proto.ensureMeshData = function ensureMeshData() {
    if (this._mesh) return;
    this._initVertices();
    this._createMesh();
  };
  _proto.destroy = function destroy() {
    if (this._packable && dynamicAtlasManager) {
      dynamicAtlasManager.deleteAtlasSpriteFrame(this);
    }
    return _Asset.prototype.destroy.call(this);
  };
  _proto._calculateSlicedUV = function _calculateSlicedUV() {
    var self = this;
    var rect = self._rect;
    var tex = self.texture;
    var capInsets = self._capInsets;
    var atlasWidth = tex.width;
    var atlasHeight = tex.height;
    var leftWidth = capInsets[INSET_LEFT];
    var rightWidth = capInsets[INSET_RIGHT];
    var centerWidth = rect.width - leftWidth - rightWidth;
    var topHeight = capInsets[INSET_TOP];
    var bottomHeight = capInsets[INSET_BOTTOM];
    var centerHeight = rect.height - topHeight - bottomHeight;
    var uvSliced = self.uvSliced;
    uvSliced.length = 0;
    if (self._rotated) {
      temp_uvs[0].u = rect.x / atlasWidth;
      temp_uvs[1].u = (rect.x + bottomHeight) / atlasWidth;
      temp_uvs[2].u = (rect.x + bottomHeight + centerHeight) / atlasWidth;
      temp_uvs[3].u = (rect.x + rect.height) / atlasWidth;
      temp_uvs[3].v = rect.y / atlasHeight;
      temp_uvs[2].v = (rect.y + leftWidth) / atlasHeight;
      temp_uvs[1].v = (rect.y + leftWidth + centerWidth) / atlasHeight;
      temp_uvs[0].v = (rect.y + rect.width) / atlasHeight;
      for (var row = 0; row < 4; ++row) {
        var rowD = temp_uvs[row];
        for (var col = 0; col < 4; ++col) {
          var colD = temp_uvs[3 - col];
          uvSliced.push({
            u: rowD.u,
            v: colD.v
          });
        }
      }
    } else {
      temp_uvs[0].u = rect.x / atlasWidth;
      temp_uvs[1].u = (rect.x + leftWidth) / atlasWidth;
      temp_uvs[2].u = (rect.x + leftWidth + centerWidth) / atlasWidth;
      temp_uvs[3].u = (rect.x + rect.width) / atlasWidth;
      temp_uvs[3].v = rect.y / atlasHeight;
      temp_uvs[2].v = (rect.y + topHeight) / atlasHeight;
      temp_uvs[1].v = (rect.y + topHeight + centerHeight) / atlasHeight;
      temp_uvs[0].v = (rect.y + rect.height) / atlasHeight;
      for (var _row = 0; _row < 4; ++_row) {
        var _rowD = temp_uvs[_row];
        for (var _col = 0; _col < 4; ++_col) {
          var _colD = temp_uvs[_col];
          uvSliced.push({
            u: _colD.u,
            v: _rowD.v
          });
        }
      }
    }
    this.emit(SpriteFrameEvent.UV_UPDATED, this);
  };
  _proto._calculateUV = function _calculateUV() {
    var arrayFill = fillItems;
    var self = this;
    var rect = self._rect;
    var uv = self.uv;
    var unbiasUV = self.unbiasUV;
    var tex = self.texture;
    var texw = tex.width;
    var texh = tex.height;
    if (self._rotated) {
      var l = texw === 0 ? 0 : rect.x / texw;
      var r = texw === 0 ? 1 : (rect.x + rect.height) / texw;
      var t = texh === 0 ? 0 : rect.y / texh;
      var b = texh === 0 ? 1 : (rect.y + rect.width) / texh;
      if (self._isFlipUVX && self._isFlipUVY) {
        arrayFill(uv, r, b, r, t, l, b, l, t);
      } else if (self._isFlipUVX) {
        arrayFill(uv, r, t, r, b, l, t, l, b);
      } else if (self._isFlipUVY) {
        arrayFill(uv, l, b, l, t, r, b, r, t);
      } else {
        arrayFill(uv, l, t, l, b, r, t, r, b);
      }
      var ul = texw === 0 ? 0 : rect.x / texw;
      var ur = texw === 0 ? 1 : (rect.x + rect.height) / texw;
      var ut = texh === 0 ? 0 : rect.y / texh;
      var ub = texh === 0 ? 1 : (rect.y + rect.width) / texh;
      if (self._isFlipUVX && self._isFlipUVY) {
        arrayFill(unbiasUV, ur, ub, ur, ut, ul, ub, ul, ut);
      } else if (self._isFlipUVX) {
        arrayFill(unbiasUV, ur, ut, ur, ub, ul, ut, ul, ub);
      } else if (self._isFlipUVY) {
        arrayFill(unbiasUV, ul, ub, ul, ut, ur, ub, ur, ut);
      } else {
        arrayFill(unbiasUV, ul, ut, ul, ub, ur, ut, ur, ub);
      }
    } else {
      var _l = texw === 0 ? 0 : rect.x / texw;
      var _r = texw === 0 ? 1 : (rect.x + rect.width) / texw;
      var _b = texh === 0 ? 1 : (rect.y + rect.height) / texh;
      var _t = texh === 0 ? 0 : rect.y / texh;
      if (self._isFlipUVX && self._isFlipUVY) {
        arrayFill(uv, _r, _t, _l, _t, _r, _b, _l, _b);
      } else if (self._isFlipUVX) {
        arrayFill(uv, _r, _b, _l, _b, _r, _t, _l, _t);
      } else if (self._isFlipUVY) {
        arrayFill(uv, _l, _t, _r, _t, _l, _b, _r, _b);
      } else {
        arrayFill(uv, _l, _b, _r, _b, _l, _t, _r, _t);
      }
      var _ul = texw === 0 ? 0 : rect.x / texw;
      var _ur = texw === 0 ? 1 : (rect.x + rect.width) / texw;
      var _ub = texh === 0 ? 1 : (rect.y + rect.height) / texh;
      var _ut = texh === 0 ? 0 : rect.y / texh;
      if (self._isFlipUVX && self._isFlipUVY) {
        arrayFill(unbiasUV, _ur, _ut, _ul, _ut, _ur, _ub, _ul, _ub);
      } else if (self._isFlipUVX) {
        arrayFill(unbiasUV, _ur, _ub, _ul, _ub, _ur, _ut, _ul, _ut);
      } else if (self._isFlipUVY) {
        arrayFill(unbiasUV, _ul, _ut, _ur, _ut, _ul, _ub, _ur, _ub);
      } else {
        arrayFill(unbiasUV, _ul, _ub, _ur, _ub, _ul, _ut, _ur, _ut);
      }
    }
    self._calculateSlicedUV();
  };
  _proto._setDynamicAtlasFrame = function _setDynamicAtlasFrame(frame) {
    if (!frame) return;
    this._original = {
      _texture: this._texture,
      _x: this._rect.x,
      _y: this._rect.y
    };
    this._texture = frame.texture;
    this._rect.x = frame.x;
    this._rect.y = frame.y;
    this._calculateUV();
  };
  _proto._resetDynamicAtlasFrame = function _resetDynamicAtlasFrame() {
    if (!this._original) return;
    this._rect.x = this._original._x;
    this._rect.y = this._original._y;
    this._texture = this._original._texture;
    this._original = null;
    this._calculateUV();
  };
  _proto._checkPackable = function _checkPackable() {
    var dynamicAtlas = dynamicAtlasManager;
    if (!dynamicAtlas) return;
    var texture = this._texture;
    if (!(texture instanceof Texture2D) || texture.isCompressed) {
      this._packable = false;
      return;
    }
    var w = this.width;
    var h = this.height;
    if (!texture.image || w > dynamicAtlas.maxFrameSize || h > dynamicAtlas.maxFrameSize) {
      this._packable = false;
      return;
    }
    var CanvasElement = ccwindow.HTMLCanvasElement;
    if (texture.image && texture.image instanceof CanvasElement) {
      this._packable = true;
    }
  };
  _proto._serialize = function _serialize(ctxForExporting) {
    return null;
  };
  _proto._deserialize = function _deserialize(serializeData, handle) {
    var self = this;
    var data = serializeData;
    var rect = data.rect;
    if (rect) {
      self._rect = new Rect(rect.x, rect.y, rect.width, rect.height);
    }
    var offset = data.offset;
    if (data.offset) {
      self._offset = v2(offset.x, offset.y);
    }
    var originalSize = data.originalSize;
    if (data.originalSize) {
      self._originalSize = size(originalSize.width, originalSize.height);
    }
    self._rotated = !!data.rotated;
    self._name = data.name;
    self._packable = !!data.packable;
    self._pixelsToUnit = data.pixelsToUnit;
    var pivot = data.pivot;
    if (pivot) {
      self._pivot = v2(pivot.x, pivot.y);
    }
    self._meshType = data.meshType;
    var capInsets = data.capInsets;
    if (capInsets) {
      var thisCapInsets = self._capInsets;
      thisCapInsets[INSET_LEFT] = capInsets[INSET_LEFT];
      thisCapInsets[INSET_TOP] = capInsets[INSET_TOP];
      thisCapInsets[INSET_RIGHT] = capInsets[INSET_RIGHT];
      thisCapInsets[INSET_BOTTOM] = capInsets[INSET_BOTTOM];
    }
    {
      if (data.texture) {
        handle.result.push(self, '_textureSource', data.texture, getClassId(Texture2D));
      }
    }
    var vertices = data.vertices;
    if (vertices) {
      if (!self.vertices) {
        self.vertices = {
          rawPosition: [],
          positions: [],
          indexes: vertices.indexes,
          uv: vertices.uv,
          nuv: vertices.nuv,
          minPos: v3(vertices.minPos.x, vertices.minPos.y, vertices.minPos.z),
          maxPos: v3(vertices.maxPos.x, vertices.maxPos.y, vertices.maxPos.z)
        };
      }
      self.vertices.rawPosition.length = 0;
      var rawPosition = vertices.rawPosition;
      for (var i = 0; i < rawPosition.length; i += 3) {
        self.vertices.rawPosition.push(v3(rawPosition[i], rawPosition[i + 1], rawPosition[i + 2]));
      }
      self._updateMeshVertices();
    }
  };
  _proto.clone = function clone() {
    var _sp$uv, _sp$unbiasUV, _sp$uvSliced, _sp$_capInsets, _sp$_customOutLine;
    var self = this;
    var sp = new SpriteFrame();
    var v = self.vertices;
    sp.vertices = v ? {
      rawPosition: v.rawPosition.slice(0),
      positions: v.positions.slice(0),
      indexes: v.indexes.slice(0),
      uv: v.uv.slice(0),
      nuv: v.nuv.slice(0),
      minPos: v.minPos.clone(),
      maxPos: v.maxPos.clone()
    } : null;
    (_sp$uv = sp.uv).splice.apply(_sp$uv, [0, sp.uv.length].concat(self.uv));
    (_sp$unbiasUV = sp.unbiasUV).splice.apply(_sp$unbiasUV, [0, sp.unbiasUV.length].concat(self.unbiasUV));
    (_sp$uvSliced = sp.uvSliced).splice.apply(_sp$uvSliced, [0, sp.uvSliced.length].concat(self.uvSliced));
    sp._rect.set(self._rect);
    sp._trimmedBorder.set(self._trimmedBorder);
    sp._offset.set(self._offset);
    sp._originalSize.set(self._originalSize);
    sp._rotated = self._rotated;
    (_sp$_capInsets = sp._capInsets).splice.apply(_sp$_capInsets, [0, sp._capInsets.length].concat(self._capInsets));
    sp._atlasUuid = self._atlasUuid;
    sp._texture = self._texture;
    sp._isFlipUVX = self._isFlipUVX;
    sp._isFlipUVY = self._isFlipUVY;
    if (self._original) {
      sp._original = {
        _texture: self._original._texture,
        _x: self._original._x,
        _y: self._original._y
      };
    } else {
      sp._original = null;
    }
    sp._packable = self._packable;
    sp._pixelsToUnit = self._pixelsToUnit;
    sp._pivot.set(self._pivot);
    sp._meshType = self._meshType;
    sp._extrude = self._extrude;
    (_sp$_customOutLine = sp._customOutLine).splice.apply(_sp$_customOutLine, [0, sp._customOutLine.length].concat(self._customOutLine));
    sp._minPos = self._minPos;
    sp._maxPos = self._maxPos;
    if (self._mesh) {
      sp._createMesh();
    }
    return sp;
  };
  _proto._refreshTexture = function _refreshTexture(texture) {
    var self = this;
    self._texture = texture;
    var tex = self._texture;
    var config = {};
    var isReset = false;
    if (self._rect.width === 0 || self._rect.height === 0 || !self.checkRect(tex)) {
      config.rect = rect(0, 0, tex.width, tex.height);
      isReset = true;
    }
    if (self._originalSize.width === 0 || self._originalSize.height === 0 || isReset) {
      config.originalSize = size(tex.width, tex.height);
      isReset = true;
    }
    if (isReset) {
      self.reset(config);
    }
    self._checkPackable();
    if (self._mesh) {
      self._updateMesh();
    }
  };
  _proto.onLoaded = function onLoaded() {
    this._calcTrimmedBorder();
  };
  _proto.initDefault = function initDefault(uuid) {
    _Asset.prototype.initDefault.call(this, uuid);
    var texture = new Texture2D();
    texture.initDefault();
    this._refreshTexture(texture);
    this._calculateUV();
  };
  _proto.validate = function validate() {
    return this._texture && this._rect && this._rect.width !== 0 && this._rect.height !== 0;
  };
  _proto._initVertices = function _initVertices() {
    var self = this;
    if (!self.vertices) {
      self.vertices = {
        rawPosition: [],
        positions: [],
        indexes: [],
        uv: [],
        nuv: [],
        minPos: v3(),
        maxPos: v3()
      };
    } else {
      var vertices = self.vertices;
      vertices.rawPosition.length = 0;
      vertices.positions.length = 0;
      vertices.indexes.length = 0;
      vertices.uv.length = 0;
      vertices.nuv.length = 0;
      vertices.minPos.set(0, 0, 0);
      vertices.maxPos.set(0, 0, 0);
    }
    var thisVertices = self.vertices;
    if (self._meshType === MeshType.POLYGON) ; else {
      var tex = self.texture;
      var texw = tex.width;
      var texh = tex.height;
      var _rect2 = self.rect;
      var width = _rect2.width;
      var height = _rect2.height;
      var rectX = _rect2.x;
      var rectY = texh - _rect2.y - height;
      var halfWidth = width / 2;
      var halfHeight = height / 2;
      var l = texw === 0 ? 0 : rectX / texw;
      var r = texw === 0 ? 1 : (rectX + width) / texw;
      var t = texh === 0 ? 1 : (rectY + height) / texh;
      var b = texh === 0 ? 0 : rectY / texh;
      var uv = thisVertices.uv;
      var nuv = thisVertices.nuv;
      var rawPosition = thisVertices.rawPosition;
      var indexes = thisVertices.indexes;
      temp_vec3.set(-halfWidth, -halfHeight, 0);
      rawPosition.push(temp_vec3.clone());
      uv.push(rectX, rectY + height);
      nuv.push(l, b);
      thisVertices.minPos.set(temp_vec3);
      temp_vec3.set(halfWidth, -halfHeight, 0);
      rawPosition.push(temp_vec3.clone());
      uv.push(rectX + width, rectY + height);
      nuv.push(r, b);
      temp_vec3.set(-halfWidth, halfHeight, 0);
      rawPosition.push(temp_vec3.clone());
      uv.push(rectX, rectY);
      nuv.push(l, t);
      temp_vec3.set(halfWidth, halfHeight, 0);
      rawPosition.push(temp_vec3.clone());
      uv.push(rectX + width, rectY);
      nuv.push(r, t);
      thisVertices.maxPos.set(temp_vec3);
      indexes.push(0, 1, 2, 2, 1, 3);
    }
    this._updateMeshVertices();
  };
  _proto._updateMeshVertices = function _updateMeshVertices() {
    temp_matrix.identity();
    var units = 1 / this._pixelsToUnit;
    var PosX = -(this._pivot.x - 0.5) * this.rect.width * units;
    var PosY = -(this._pivot.y - 0.5) * this.rect.height * units;
    var temp_vec3 = v3(PosX, PosY, 0);
    temp_matrix.transform(temp_vec3);
    temp_vec3.set(units, units, 1);
    temp_matrix.scale(temp_vec3);
    var vertices = this.vertices;
    for (var i = 0; i < vertices.rawPosition.length; i++) {
      var pos = vertices.rawPosition[i];
      vec3TransformMat4(temp_vec3, pos, temp_matrix);
      vec3ToArray(vertices.positions, temp_vec3, 3 * i);
    }
    vec3TransformMat4(this._minPos, vertices.minPos, temp_matrix);
    vec3TransformMat4(this._maxPos, vertices.maxPos, temp_matrix);
  };
  _proto._createMesh = function _createMesh$1() {
    this._mesh = _createMesh({
      primitiveMode: PrimitiveMode.TRIANGLE_LIST,
      positions: this.vertices.positions,
      uvs: this.vertices.nuv,
      indices: this.vertices.indexes,
      minPos: this._minPos,
      maxPos: this._maxPos,
      attributes: [new Attribute(AttributeName.ATTR_POSITION, Format.RGB32F), new Attribute(AttributeName.ATTR_TEX_COORD, Format.RG32F)]
    });
  };
  _proto._updateMesh = function _updateMesh() {
    if (this._mesh) {
      this._mesh.destroy();
    }
    this._initVertices();
    this._createMesh();
  };
  return _createClass(SpriteFrame, [{
    key: "insetTop",
    get: function get() {
      return this._capInsets[INSET_TOP];
    },
    set: function set(value) {
      if (this._capInsets[INSET_TOP] === value) {
        return;
      }
      this._capInsets[INSET_TOP] = value;
      if (this._texture) {
        this._calculateSlicedUV();
      }
    }
  }, {
    key: "insetBottom",
    get: function get() {
      return this._capInsets[INSET_BOTTOM];
    },
    set: function set(value) {
      if (this._capInsets[INSET_BOTTOM] === value) {
        return;
      }
      this._capInsets[INSET_BOTTOM] = value;
      if (this._texture) {
        this._calculateSlicedUV();
      }
    }
  }, {
    key: "insetLeft",
    get: function get() {
      return this._capInsets[INSET_LEFT];
    },
    set: function set(value) {
      if (this._capInsets[INSET_LEFT] === value) {
        return;
      }
      this._capInsets[INSET_LEFT] = value;
      if (this._texture) {
        this._calculateSlicedUV();
      }
    }
  }, {
    key: "insetRight",
    get: function get() {
      return this._capInsets[INSET_RIGHT];
    },
    set: function set(value) {
      if (this._capInsets[INSET_RIGHT] === value) {
        return;
      }
      this._capInsets[INSET_RIGHT] = value;
      if (this._texture) {
        this._calculateSlicedUV();
      }
    }
  }, {
    key: "rect",
    get: function get() {
      return this._rect;
    },
    set: function set(value) {
      if (this._rect.equals(value)) {
        return;
      }
      this._rect.set(value);
      if (this._texture) {
        this._calculateUV();
      }
      this._calcTrimmedBorder();
    }
  }, {
    key: "originalSize",
    get: function get() {
      return this._originalSize;
    },
    set: function set(value) {
      if (this._originalSize.equals(value)) {
        return;
      }
      this._originalSize.set(value);
      if (this._texture) {
        this._calculateUV();
      }
      this._calcTrimmedBorder();
    }
  }, {
    key: "offset",
    get: function get() {
      return this._offset;
    },
    set: function set(value) {
      this._offset.set(value);
      this._calcTrimmedBorder();
    }
  }, {
    key: "rotated",
    get: function get() {
      return this._rotated;
    },
    set: function set(rotated) {
      if (this._rotated === rotated) {
        return;
      }
      this._rotated = rotated;
      if (this._texture) {
        this._calculateUV();
      }
    }
  }, {
    key: "texture",
    get: function get() {
      return this._texture;
    },
    set: function set(value) {
      if (!value) {
        warnID(3122, this.name);
        return;
      }
      if (value === this._texture) {
        return;
      }
      this.reset({
        texture: value
      }, true);
    }
  }, {
    key: "atlasUuid",
    get: function get() {
      return this._atlasUuid;
    },
    set: function set(value) {
      this._atlasUuid = value;
    }
  }, {
    key: "width",
    get: function get() {
      return this._texture.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._texture.height;
    }
  }, {
    key: "_textureSource",
    set: function set(value) {
      if (globalThis.Build) {
        this._texture = value;
        return;
      }
      if (value) {
        this._refreshTexture(value);
        this._calculateUV();
      }
    }
  }, {
    key: "flipUVX",
    get: function get() {
      return this._isFlipUVX;
    },
    set: function set(value) {
      this._isFlipUVX = value;
      this._calculateUV();
    }
  }, {
    key: "flipUVY",
    get: function get() {
      return this._isFlipUVY;
    },
    set: function set(value) {
      this._isFlipUVY = value;
      this._calculateUV();
    }
  }, {
    key: "packable",
    get: function get() {
      return this._packable;
    },
    set: function set(value) {
      this._packable = value;
    }
  }, {
    key: "original",
    get: function get() {
      return this._original;
    }
  }, {
    key: "pixelsToUnit",
    get: function get() {
      return this._pixelsToUnit;
    }
  }, {
    key: "pivot",
    get: function get() {
      return this._pivot;
    }
  }, {
    key: "mesh",
    get: function get() {
      return this._mesh;
    }
  }, {
    key: "trimmedBorder",
    get: function get() {
      return this._trimmedBorder;
    }
  }]);
}(Asset), _SpriteFrame.EVENT_UV_UPDATED = SpriteFrameEvent.UV_UPDATED, _SpriteFrame.MeshType = MeshType, _SpriteFrame)) || _class);
cclegacy.SpriteFrame = SpriteFrame;

export { Atlas as A, DynamicAtlasManager as D, SpriteFrame as S, SpriteFrameEvent as a, dynamicAtlasManager as d };
//# sourceMappingURL=sprite-frame-DHXMUUT-.js.map
