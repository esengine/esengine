import { _ as _inheritsLoose, a as _createClass, e as warn, n as EventTarget, E as Enum, x as ccenum, m as setClassAlias, d as CCObjectFlags, k as errorID, l as _createForOfIteratorHelperLoose, ah as setPropertyEnumType, b as _applyDecoratedDescriptor, R as RecyclePool } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import * as dragonbonesJs from '@cocos/dragonbones-js';
import { BaseObject, TextureAtlasData, TextureData, BinaryOffset, BoneType, Slot, DisplayData, BaseFactory, Armature, Animation, DragonBones, Matrix, EventObject } from '@cocos/dragonbones-js';
import { c as ccclass$8, m as Rect, M as Mat4, C as Color, f as Vec3, H as Scheduler, a2 as SystemPriority, b as applyDecoratedInitializer, s as serializable$3, t as type$2, S as System, L as override$1 } from './index-uXI1_UMk.js';
import './2d.js';
import { S as SpriteFrame } from './sprite-frame-DHXMUUT-.js';
import './prefab-DYg_oxpo.js';
import { N as Node, i as Texture2D, M as MaterialInstance, d as builtinResMgr, b as Material } from './scene-vWcxM1_c.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { A as Asset } from './node-event-Ccvtv8bJ.js';
import { g as game, G as Game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import './debug-view-BuNhRPv_.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { j as RenderDrawInfo, f as RenderEntity, h as RenderEntityType, U as UIRenderer, a as StaticVBAccessor, v as vfmtPosUvColor, l as RenderData } from './ui-renderer-JpGcj-VM.js';
import './deprecated-n0w4kK7g.js';
import './device-manager-CBXP-ttm.js';
import { ag as BlendFactor } from './buffer-barrier-BlQXg9Aa.js';
import './batcher-2d-DWdWoCVz.js';
import './deprecated-CN-RjLP6.js';
import './sprite-BKXaVEzt.js';
import './label-B6xdfUV_.js';
import './mask.js';
import './graphics-B_abEIjK.js';
import './rich-text.js';
import './sprite-renderer-C7_6H1N4.js';
import './camera-component-BFt9vSC_.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './touch-BKrZ-fxl.js';
import './create-mesh-CfKC5EQd.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './sorting-layers-BHqhkSbY.js';

function _mergeNamespaces(n, m) {
    m.forEach(function (e) {
        e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
            if (k !== 'default' && !(k in n)) {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    });
    return Object.freeze(n);
}

var _dec$7, _class$7, _dec2$2, _class2$3;
var ccclass$7 = ccclass$8;
var CCTextureAtlasData = (_dec$7 = ccclass$7('dragonBones.CCTextureAtlasData'), _dec$7(_class$7 = function (_TextureAtlasData) {
  function CCTextureAtlasData() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _TextureAtlasData.call.apply(_TextureAtlasData, [this].concat(args)) || this;
    _this._renderTexture = null;
    return _this;
  }
  _inheritsLoose(CCTextureAtlasData, _TextureAtlasData);
  CCTextureAtlasData.toString = function toString() {
    return '[class dragonBones.CCTextureAtlasData]';
  };
  var _proto = CCTextureAtlasData.prototype;
  _proto.createTexture = function createTexture() {
    return BaseObject.borrowObject(CCTextureData);
  };
  _proto._onClear = function _onClear() {
    _TextureAtlasData.prototype._onClear.call(this);
    this.renderTexture = null;
  };
  return _createClass(CCTextureAtlasData, [{
    key: "renderTexture",
    get: function get() {
      return this._renderTexture;
    },
    set: function set(value) {
      this._renderTexture = value;
      if (value) {
        for (var k in this.textures) {
          var textureData = this.textures[k];
          if (!textureData.spriteFrame) {
            var rect = null;
            if (textureData.rotated) {
              rect = new Rect(textureData.region.x, textureData.region.y, textureData.region.height, textureData.region.width);
            } else {
              rect = new Rect(textureData.region.x, textureData.region.y, textureData.region.width, textureData.region.height);
              textureData.spriteFrame = new SpriteFrame();
              textureData.spriteFrame.texture = value;
              textureData.spriteFrame.rect = rect;
            }
          }
        }
      } else {
        for (var _k in this.textures) {
          var _textureData = this.textures[_k];
          _textureData.spriteFrame = null;
        }
      }
    }
  }]);
}(TextureAtlasData)) || _class$7);
var CCTextureData = (_dec2$2 = ccclass$7('dragonBones.CCTextureData'), _dec2$2(_class2$3 = function (_TextureData) {
  function CCTextureData() {
    var _this2;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    _this2 = _TextureData.call.apply(_TextureData, [this].concat(args)) || this;
    _this2.spriteFrame = null;
    return _this2;
  }
  _inheritsLoose(CCTextureData, _TextureData);
  CCTextureData.toString = function toString() {
    return '[class dragonBones.CCTextureData]';
  };
  var _proto2 = CCTextureData.prototype;
  _proto2._onClear = function _onClear() {
    _TextureData.prototype._onClear.call(this);
    this.spriteFrame = null;
  };
  return CCTextureData;
}(TextureData)) || _class2$3);

var _dec$6, _class$6;
var ccclass$6 = ccclass$8;
var CCSlot = (_dec$6 = ccclass$6('dragonBones.CCSlot'), _dec$6(_class$6 = function (_Slot) {
  function CCSlot() {
    var _this;
    _this = _Slot.call(this) || this;
    _this._localVertices = void 0;
    _this._indices = void 0;
    _this._matrix = void 0;
    _this._worldMatrix = void 0;
    _this._worldMatrixDirty = void 0;
    _this._color = void 0;
    _this._localVertices = [];
    _this._indices = [];
    _this._matrix = new Mat4();
    _this._worldMatrix = new Mat4();
    _this._worldMatrixDirty = true;
    _this._visible = false;
    _this._color = new Color();
    return _this;
  }
  _inheritsLoose(CCSlot, _Slot);
  CCSlot.toString = function toString() {
    return '[class dragonBones.CCSlot]';
  };
  var _proto = CCSlot.prototype;
  _proto.getTexture = function getTexture() {
    if (this._textureData) {
      var sp = this._textureData.spriteFrame;
      var tex = sp.texture;
      return tex;
    }
    return null;
  };
  _proto.calculWorldMatrix = function calculWorldMatrix() {
    var parent = this._armature._parent;
    if (parent) {
      this._mulMat(this._worldMatrix, parent._worldMatrix, this._matrix);
    } else {
      Mat4.copy(this._worldMatrix, this._matrix);
    }
    this._worldMatrixDirty = false;
  };
  _proto._onClear = function _onClear() {
    _Slot.prototype._onClear.call(this);
    this._localVertices.length = 0;
    this._indices.length = 0;
    Mat4.identity(this._matrix);
    Mat4.identity(this._worldMatrix);
    this._worldMatrixDirty = true;
    this._color = new Color();
    this._visible = false;
  };
  _proto._onUpdateDisplay = function _onUpdateDisplay() {};
  _proto._initDisplay = function _initDisplay(value) {};
  _proto._addDisplay = function _addDisplay() {
    this._visible = true;
  };
  _proto._replaceDisplay = function _replaceDisplay(value) {};
  _proto._removeDisplay = function _removeDisplay() {
    this._visible = false;
  };
  _proto._disposeDisplay = function _disposeDisplay(object) {};
  _proto._updateVisible = function _updateVisible() {
    this._visible = this.parent.visible;
  };
  _proto._updateGlueMesh = function _updateGlueMesh() {};
  _proto._updateZOrder = function _updateZOrder() {};
  _proto._updateBlendMode = function _updateBlendMode() {
    if (this._childArmature) {
      var childSlots = this._childArmature.getSlots();
      for (var i = 0, l = childSlots.length; i < l; i++) {
        var slot = childSlots[i];
        slot._blendMode = this._blendMode;
        slot._updateBlendMode();
      }
    }
  };
  _proto._updateColor = function _updateColor() {
    var c = this._color;
    c.r = this._colorTransform.redMultiplier * 255;
    c.g = this._colorTransform.greenMultiplier * 255;
    c.b = this._colorTransform.blueMultiplier * 255;
    c.a = this._colorTransform.alphaMultiplier * 255;
  };
  _proto._updateFrame = function _updateFrame() {
    this._indices.length = 0;
    var indices = this._indices;
    var localVertices = this._localVertices;
    var indexOffset = 0;
    var vfOffset = 0;
    var currentTextureData = this._textureData;
    if (!this._display || this._displayIndex < 0 || !currentTextureData || !currentTextureData.spriteFrame) return;
    var texture = currentTextureData.spriteFrame.texture;
    var textureAtlasWidth = texture.width;
    var textureAtlasHeight = texture.height;
    var region = currentTextureData.region;
    if (textureAtlasWidth === 0 || textureAtlasHeight === 0) {
      console.error("SpriteFrame " + currentTextureData.spriteFrame.name + " incorrect size " + textureAtlasWidth + " x " + textureAtlasHeight);
      return;
    }
    var currentVerticesData = this._deformVertices !== null && this._display === this._meshDisplay ? this._deformVertices.verticesData : null;
    if (currentVerticesData) {
      var data = currentVerticesData.data;
      var intArray = data.intArray;
      var floatArray = data.floatArray;
      var vertexCount = intArray[currentVerticesData.offset + BinaryOffset.MeshVertexCount];
      var triangleCount = intArray[currentVerticesData.offset + BinaryOffset.MeshTriangleCount];
      var vertexOffset = intArray[currentVerticesData.offset + BinaryOffset.MeshFloatOffset];
      if (vertexOffset < 0) {
        vertexOffset += 65536;
      }
      var uvOffset = vertexOffset + vertexCount * 2;
      var scale = this._armature._armatureData.scale;
      for (var i = 0, l = vertexCount * 2; i < l; i += 2) {
        localVertices[vfOffset++] = floatArray[vertexOffset + i] * scale;
        localVertices[vfOffset++] = -floatArray[vertexOffset + i + 1] * scale;
        if (currentVerticesData.rotated) {
          localVertices[vfOffset++] = (region.x + (1.0 - floatArray[uvOffset + i]) * region.width) / textureAtlasWidth;
          localVertices[vfOffset++] = (region.y + floatArray[uvOffset + i + 1] * region.height) / textureAtlasHeight;
        } else {
          localVertices[vfOffset++] = (region.x + floatArray[uvOffset + i] * region.width) / textureAtlasWidth;
          localVertices[vfOffset++] = (region.y + floatArray[uvOffset + i + 1] * region.height) / textureAtlasHeight;
        }
      }
      for (var _i = 0; _i < triangleCount * 3; ++_i) {
        indices[indexOffset++] = intArray[currentVerticesData.offset + BinaryOffset.MeshVertexIndices + _i];
      }
      localVertices.length = vfOffset;
      indices.length = indexOffset;
      var isSkinned = !!currentVerticesData.weight;
      if (isSkinned) {
        this._identityTransform();
      }
    } else {
      var _l = region.x / textureAtlasWidth;
      var b = (region.y + region.height) / textureAtlasHeight;
      var r = (region.x + region.width) / textureAtlasWidth;
      var t = region.y / textureAtlasHeight;
      localVertices[vfOffset++] = 0;
      localVertices[vfOffset++] = 0;
      localVertices[vfOffset++] = _l;
      localVertices[vfOffset++] = b;
      localVertices[vfOffset++] = region.width;
      localVertices[vfOffset++] = 0;
      localVertices[vfOffset++] = r;
      localVertices[vfOffset++] = b;
      localVertices[vfOffset++] = 0;
      localVertices[vfOffset++] = region.height;
      localVertices[vfOffset++] = _l;
      localVertices[vfOffset++] = t;
      localVertices[vfOffset++] = region.width;
      localVertices[vfOffset++] = region.height;
      localVertices[vfOffset++] = r;
      localVertices[vfOffset++] = t;
      indices[0] = 0;
      indices[1] = 1;
      indices[2] = 2;
      indices[3] = 1;
      indices[4] = 3;
      indices[5] = 2;
      localVertices.length = vfOffset;
      indices.length = 6;
    }
    this._visibleDirty = true;
    this._blendModeDirty = true;
    this._colorDirty = true;
  };
  _proto._updateMesh = function _updateMesh() {
    var scale = this._armature._armatureData.scale;
    var deformVertices = this._deformVertices.vertices;
    var bones = this._deformVertices.bones;
    var verticesData = this._deformVertices.verticesData;
    var weightData = verticesData.weight;
    var hasDeform = deformVertices.length > 0 && verticesData.inheritDeform;
    var localVertices = this._localVertices;
    if (weightData) {
      var data = verticesData.data;
      var intArray = data.intArray;
      var floatArray = data.floatArray;
      var vertexCount = intArray[verticesData.offset + BinaryOffset.MeshVertexCount];
      var weightFloatOffset = intArray[weightData.offset + BinaryOffset.WeigthFloatOffset];
      if (weightFloatOffset < 0) {
        weightFloatOffset += 65536;
      }
      for (var i = 0, iB = weightData.offset + BinaryOffset.WeigthBoneIndices + bones.length, iV = weightFloatOffset, iF = 0, lvi = 0; i < vertexCount; i++, lvi += 4) {
        var boneCount = intArray[iB++];
        var xG = 0.0;
        var yG = 0.0;
        for (var j = 0; j < boneCount; ++j) {
          var boneIndex = intArray[iB++];
          var bone = bones[boneIndex];
          if (bone !== null) {
            var matrix = bone.globalTransformMatrix;
            var weight = floatArray[iV++];
            var xL = floatArray[iV++] * scale;
            var yL = floatArray[iV++] * scale;
            if (hasDeform) {
              xL += deformVertices[iF++];
              yL += deformVertices[iF++];
            }
            xG += (matrix.a * xL + matrix.c * yL + matrix.tx) * weight;
            yG += (matrix.b * xL + matrix.d * yL + matrix.ty) * weight;
          }
        }
        localVertices[lvi] = xG;
        localVertices[lvi + 1] = -yG;
      }
    } else if (hasDeform) {
      var isSurface = this._parent._boneData.type !== BoneType.Bone;
      var _data = verticesData.data;
      var _intArray = _data.intArray;
      var _floatArray = _data.floatArray;
      var _vertexCount = _intArray[verticesData.offset + BinaryOffset.MeshVertexCount];
      var vertexOffset = _intArray[verticesData.offset + BinaryOffset.MeshFloatOffset];
      if (vertexOffset < 0) {
        vertexOffset += 65536;
      }
      for (var _i2 = 0, l = _vertexCount, _lvi = 0; _i2 < l; _i2++, _lvi += 4) {
        var x = _floatArray[vertexOffset + _i2 * 2] * scale + deformVertices[_i2 * 2];
        var y = _floatArray[vertexOffset + _i2 * 2 + 1] * scale + deformVertices[_i2 * 2 + 1];
        if (isSurface) {
          var _matrix = this._parent._getGlobalTransformMatrix(x, y);
          localVertices[_lvi] = _matrix.a * x + _matrix.c * y + _matrix.tx;
          localVertices[_lvi + 1] = -_matrix.b * x + _matrix.d * y + _matrix.ty;
        } else {
          localVertices[_lvi] = x;
          localVertices[_lvi + 1] = -y;
        }
      }
    }
    if (weightData) {
      this._identityTransform();
    }
  };
  _proto._identityTransform = function _identityTransform() {
    var m = this._matrix;
    m.m00 = 1.0;
    m.m01 = 0.0;
    m.m04 = -0;
    m.m05 = -1;
    m.m12 = 0.0;
    m.m13 = 0.0;
    this._worldMatrixDirty = true;
  };
  _proto._updateTransform = function _updateTransform() {
    var m = this._matrix;
    m.m00 = this.globalTransformMatrix.a;
    m.m01 = this.globalTransformMatrix.b;
    m.m04 = -this.globalTransformMatrix.c;
    m.m05 = -this.globalTransformMatrix.d;
    if (this._childArmature) {
      m.m12 = this.globalTransformMatrix.tx;
      m.m13 = this.globalTransformMatrix.ty;
    } else {
      m.m12 = this.globalTransformMatrix.tx - (this.globalTransformMatrix.a * this._pivotX - this.globalTransformMatrix.c * this._pivotY);
      m.m13 = this.globalTransformMatrix.ty - (this.globalTransformMatrix.b * this._pivotX - this.globalTransformMatrix.d * this._pivotY);
    }
    this._worldMatrixDirty = true;
  };
  _proto.updateWorldMatrix = function updateWorldMatrix() {
    if (!this._armature) return;
    var parentSlot = this._armature._parent;
    if (parentSlot) {
      parentSlot.updateWorldMatrix();
    }
    if (this._worldMatrixDirty) {
      this.calculWorldMatrix();
      var childArmature = this.childArmature;
      if (!childArmature) return;
      var slots = childArmature.getSlots();
      for (var i = 0, n = slots.length; i < n; i++) {
        var slot = slots[i];
        if (slot) {
          slot._worldMatrixDirty = true;
        }
      }
    }
  };
  _proto._mulMat = function _mulMat(out, a, b) {
    var aa = a.m00;
    var ab = a.m01;
    var ac = a.m04;
    var ad = a.m05;
    var atx = a.m12;
    var aty = a.m13;
    var ba = b.m00;
    var bb = b.m01;
    var bc = b.m04;
    var bd = b.m05;
    var btx = b.m12;
    var bty = b.m13;
    if (ab !== 0 || ac !== 0) {
      out.m00 = ba * aa + bb * ac;
      out.m01 = ba * ab + bb * ad;
      out.m04 = bc * aa + bd * ac;
      out.m05 = bc * ab + bd * ad;
      out.m12 = aa * btx + ac * bty + atx;
      out.m13 = ab * btx + ad * bty + aty;
    } else {
      out.m00 = ba * aa;
      out.m01 = bb * ad;
      out.m04 = bc * aa;
      out.m05 = bd * ad;
      out.m12 = aa * btx + atx;
      out.m13 = ad * bty + aty;
    }
  };
  return CCSlot;
}(Slot)) || _class$6);

var _dec$5, _class$5;
var ccclass$5 = ccclass$8;
var CCArmatureDisplay = (_dec$5 = ccclass$5('dragonBones.CCArmatureDisplay'), _dec$5(_class$5 = function (_DisplayData) {
  function CCArmatureDisplay() {
    var _this;
    _this = _DisplayData.call(this) || this;
    _this.shouldAdvanced = false;
    _this._ccNode = null;
    _this._ccComponent = null;
    _this._eventTarget = void 0;
    _this._armature = null;
    _this._eventTarget = new EventTarget();
    return _this;
  }
  _inheritsLoose(CCArmatureDisplay, _DisplayData);
  var _proto = CCArmatureDisplay.prototype;
  _proto.hasEvent = function hasEvent(type) {
    warn('Method not implemented.');
    return false;
  };
  _proto.addEvent = function addEvent(type, listener, thisObject) {
    warn('Method not implemented.');
  };
  _proto.removeEvent = function removeEvent(type, listener, thisObject) {
    warn('Method not implemented.');
  };
  _proto.setEventTarget = function setEventTarget(eventTarget) {
    this._eventTarget = eventTarget;
  };
  _proto.getRootDisplay = function getRootDisplay() {
    var parentSlot = this._armature._parent;
    if (!parentSlot) {
      return this;
    }
    var slot;
    while (parentSlot) {
      slot = parentSlot;
      parentSlot = parentSlot._armature._parent;
    }
    return slot._armature.display;
  };
  _proto.convertToRootSpace = function convertToRootSpace(pos) {
    var slot = this._armature._parent;
    if (!slot) {
      return pos;
    }
    slot.updateWorldMatrix();
    var worldMatrix = slot._worldMatrix;
    var newPos = new Vec3(0, 0);
    newPos.x = pos.x * worldMatrix.m00 + pos.y * worldMatrix.m04 + worldMatrix.m12;
    newPos.y = pos.x * worldMatrix.m01 + pos.y * worldMatrix.m05 + worldMatrix.m13;
    return newPos;
  };
  _proto.convertToWorldSpace = function convertToWorldSpace(point) {
    var _ccNode$_getUITransfo;
    var newPos = this.convertToRootSpace(point);
    var ccNode = this.getRootNode();
    return ccNode == null ? void 0 : (_ccNode$_getUITransfo = ccNode._getUITransformComp()) == null ? void 0 : _ccNode$_getUITransfo.convertToWorldSpaceAR(newPos);
  };
  _proto.getRootNode = function getRootNode() {
    var rootDisplay = this.getRootDisplay();
    return rootDisplay && rootDisplay._ccNode;
  };
  _proto.dbInit = function dbInit(armature) {
    this._armature = armature;
  };
  _proto.dbClear = function dbClear() {
    this._armature = null;
  };
  _proto.dbUpdate = function dbUpdate() {
    if (this._ccComponent) {
      this._ccComponent._markForUpdateRenderData();
    }
  };
  _proto.advanceTimeBySelf = function advanceTimeBySelf(on) {
    this.shouldAdvanced = !!on;
  };
  _proto.hasDBEventListener = function hasDBEventListener(type) {
    return this._eventTarget.hasEventListener(type);
  };
  _proto.addDBEventListener = function addDBEventListener(type, listener, target) {
    this._eventTarget.on(type, listener, target);
  };
  _proto.removeDBEventListener = function removeDBEventListener(type, listener, target) {
    this._eventTarget.off(type, listener, target);
  };
  _proto.dispatchDBEvent = function dispatchDBEvent(type, eventObject) {
    this._eventTarget.emit(type, eventObject);
  };
  return _createClass(CCArmatureDisplay, [{
    key: "node",
    get: function get() {
      return this;
    }
  }]);
}(DisplayData)) || _class$5);

var _dec$4, _class$4, _CCFactory;
var ccclass$4 = ccclass$8;
var CCFactory = (_dec$4 = ccclass$4('CCFactory'), _dec$4(_class$4 = (_CCFactory = function (_BaseFactory) {
  function CCFactory() {
    var _this;
    _this = _BaseFactory.call(this) || this;
    _this.id = void 0;
    _this.uuid = void 0;
    _this._slots = void 0;
    var eventManager = new CCArmatureDisplay();
    _this._dragonBones = new DragonBones(eventManager);
    if (director.getScheduler()) {
      game.on(Game.EVENT_RESTART, _this.onRestart, _this);
      _this.initUpdate();
    }
    _this.id = _this.uuid = 'CCFactory';
    return _this;
  }
  _inheritsLoose(CCFactory, _BaseFactory);
  CCFactory.getInstance = function getInstance() {
    if (!CCFactory._factory) {
      CCFactory._factory = new CCFactory();
    }
    return CCFactory._factory;
  };
  var _proto = CCFactory.prototype;
  _proto.onRestart = function onRestart() {
    CCFactory._factory = null;
  };
  _proto.initUpdate = function initUpdate(dt) {
    Scheduler.enableForTarget(this);
    director.getScheduler().scheduleUpdate(this, SystemPriority.HIGH, false);
  };
  _proto.update = function update(dt) {
    this._dragonBones.advanceTime(dt);
  };
  _proto.getDragonBonesDataByRawData = function getDragonBonesDataByRawData(rawData) {
    var dataParser = rawData instanceof ArrayBuffer ? BaseFactory._binaryParser : this._dataParser;
    return dataParser.parseDragonBonesData(rawData, 1.0);
  };
  _proto.buildArmatureDisplay = function buildArmatureDisplay(armatureName, dragonBonesName, skinName, textureAtlasName) {
    var armature = this.buildArmature(armatureName, dragonBonesName, skinName, textureAtlasName);
    return armature ? armature._display : null;
  };
  _proto.createArmatureNode = function createArmatureNode(comp, armatureName, node) {
    node = node || new Node();
    var display = node.getComponent('dragonBones.ArmatureDisplay');
    if (!display) {
      display = node.addComponent('dragonBones.ArmatureDisplay');
    }
    node.name = armatureName;
    display._armatureName = armatureName;
    display._dragonAsset = comp.dragonAsset;
    display._dragonAtlasAsset = comp.dragonAtlasAsset;
    display._init();
    return display;
  };
  _proto._buildTextureAtlasData = function _buildTextureAtlasData(textureAtlasData, textureAtlas) {
    if (textureAtlasData) {
      textureAtlasData.renderTexture = textureAtlas;
    } else {
      textureAtlasData = BaseObject.borrowObject(CCTextureAtlasData);
    }
    return textureAtlasData;
  };
  _proto._sortSlots = function _sortSlots() {
    var slots = this._slots;
    var sortedSlots = [];
    for (var i = 0, l = slots.length; i < l; i++) {
      var slot = slots[i];
      var zOrder = slot._zOrder;
      var inserted = false;
      for (var j = sortedSlots.length - 1; j >= 0; j--) {
        if (zOrder >= sortedSlots[j]._zOrder) {
          sortedSlots.splice(j + 1, 0, slot);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        sortedSlots.unshift(slot);
      }
    }
    this._slots = sortedSlots;
  };
  _proto._buildArmature = function _buildArmature(dataPackage) {
    var armature = BaseObject.borrowObject(Armature);
    armature._skinData = dataPackage.skin;
    armature._animation = BaseObject.borrowObject(Animation);
    armature._animation._armature = armature;
    armature._animation.animations = dataPackage.armature.animations;
    armature._isChildArmature = false;
    var display = new CCArmatureDisplay();
    armature.init(dataPackage.armature, display, display, this._dragonBones);
    return armature;
  };
  _proto._buildSlot = function _buildSlot(dataPackage, slotData, displays) {
    var slot = BaseObject.borrowObject(CCSlot);
    var display = slot;
    slot.init(slotData, displays, display, display);
    return slot;
  };
  _proto.getDragonBonesDataByUUID = function getDragonBonesDataByUUID(uuid) {
    for (var name in this._dragonBonesDataMap) {
      if (name.indexOf(uuid) !== -1) {
        return this._dragonBonesDataMap[name];
      }
    }
    return null;
  };
  _proto.removeDragonBonesDataByUUID = function removeDragonBonesDataByUUID(uuid, disposeData) {
    if (disposeData === undefined) {
      disposeData = true;
    }
    for (var name in this._dragonBonesDataMap) {
      if (name.indexOf(uuid) === -1) continue;
      if (disposeData) {
        this._dragonBones.bufferObject(this._dragonBonesDataMap[name]);
      }
      delete this._dragonBonesDataMap[name];
    }
  };
  return CCFactory;
}(BaseFactory), _CCFactory._factory = null, _CCFactory)) || _class$4);

var _ArmatureCache;
var MaxCacheTime = 30;
var FrameTime = 1 / 60;
var _vertices = [];
var _indices = [];
var _boneInfoOffset = 0;
var _indexOffset$1 = 0;
var _vfOffset = 0;
var _preTexUrl = null;
var _preBlendMode = null;
var _segVCount = 0;
var _segICount = 0;
var _segOffset = 0;
var _colorOffset = 0;
var _preColor = 0;
var _x;
var _y;
var PER_VERTEX_SIZE$1 = 5;
var EXPORT_VERTEX_SIZE = 9;
var AnimationCache = function () {
  function AnimationCache() {
    this.maxVertexCount = 0;
    this.maxIndexCount = 0;
    this._privateMode = false;
    this._inited = false;
    this._invalid = true;
    this._enableCacheAttachedInfo = false;
    this.frames = [];
    this.totalTime = 0;
    this.isCompleted = false;
    this._frameIdx = -1;
    this._armatureInfo = null;
    this._animationName = null;
    this._tempSegments = null;
    this._tempColors = null;
    this._tempBoneInfos = null;
  }
  var _proto = AnimationCache.prototype;
  _proto.init = function init(armatureInfo, animationName) {
    this._inited = true;
    this._armatureInfo = armatureInfo;
    this._animationName = animationName;
  };
  _proto.clear = function clear() {
    this._inited = false;
    for (var i = 0, n = this.frames.length; i < n; i++) {
      var frame = this.frames[i];
      frame.segments.length = 0;
    }
    this.invalidAllFrame();
  };
  _proto.begin = function begin() {
    if (!this._invalid) return;
    var armatureInfo = this._armatureInfo;
    var curAnimationCache = armatureInfo.curAnimationCache;
    if (curAnimationCache && curAnimationCache !== this) {
      if (this._privateMode) {
        curAnimationCache.invalidAllFrame();
      } else {
        curAnimationCache.updateToFrame();
      }
    }
    var armature = armatureInfo.armature;
    var animation = armature.animation;
    animation.play(this._animationName, 1);
    armatureInfo.curAnimationCache = this;
    this._invalid = false;
    this._frameIdx = -1;
    this.totalTime = 0;
    this.isCompleted = false;
  };
  _proto.end = function end() {
    if (!this._needToUpdate()) {
      this._armatureInfo.curAnimationCache = null;
      this.frames.length = this._frameIdx + 1;
      this.isCompleted = true;
    }
  };
  _proto._needToUpdate = function _needToUpdate(toFrameIdx) {
    var armatureInfo = this._armatureInfo;
    var armature = armatureInfo.armature;
    var animation = armature.animation;
    return !animation.isCompleted && this.totalTime < MaxCacheTime && (toFrameIdx === undefined || this._frameIdx < toFrameIdx);
  };
  _proto.updateToFrame = function updateToFrame(toFrameIdx) {
    if (!this._inited) return;
    this.begin();
    if (!this._needToUpdate(toFrameIdx)) return;
    var armatureInfo = this._armatureInfo;
    var armature = armatureInfo.armature;
    do {
      armature.advanceTime(FrameTime);
      this._frameIdx++;
      this.updateFrame(armature, this._frameIdx);
      this.totalTime += FrameTime;
    } while (this._needToUpdate(toFrameIdx));
    this.end();
  };
  _proto.isInited = function isInited() {
    return this._inited;
  };
  _proto.isInvalid = function isInvalid() {
    return this._invalid;
  };
  _proto.invalidAllFrame = function invalidAllFrame() {
    this.isCompleted = false;
    this._invalid = true;
  };
  _proto.updateAllFrame = function updateAllFrame() {
    this.invalidAllFrame();
    this.updateToFrame();
  };
  _proto.enableCacheAttachedInfo = function enableCacheAttachedInfo() {
    if (!this._enableCacheAttachedInfo) {
      this._enableCacheAttachedInfo = true;
      this.invalidAllFrame();
    }
  };
  _proto.updateFrame = function updateFrame(armature, index) {
    _vfOffset = 0;
    _boneInfoOffset = 0;
    _indexOffset$1 = 0;
    _preTexUrl = null;
    _preBlendMode = null;
    _segVCount = 0;
    _segICount = 0;
    _segOffset = 0;
    _colorOffset = 0;
    _preColor = 0;
    this.frames[index] = this.frames[index] || {
      segments: [],
      colors: [],
      boneInfos: [],
      vertices: new Float32Array(),
      uintVert: new Uint32Array(),
      indices: new Uint16Array()
    };
    var frame = this.frames[index];
    var segments = this._tempSegments = frame.segments;
    var colors = this._tempColors = frame.colors;
    var boneInfos = this._tempBoneInfos = frame.boneInfos;
    this._traverseArmature(armature, 1.0);
    if (_colorOffset > 0) {
      colors[_colorOffset - 1].vfOffset = _vfOffset;
    }
    colors.length = _colorOffset;
    boneInfos.length = _boneInfoOffset;
    var preSegOffset = _segOffset - 1;
    if (preSegOffset >= 0) {
      if (_segICount > 0) {
        var preSegInfo = segments[preSegOffset];
        preSegInfo.indexCount = _segICount;
        preSegInfo.vfCount = _segVCount * EXPORT_VERTEX_SIZE;
        preSegInfo.vertexCount = _segVCount;
        segments.length = _segOffset;
      } else {
        segments.length = _segOffset - 1;
      }
    }
    if (segments.length === 0) return;
    var vertices = frame.vertices;
    var vertexCount = _vfOffset / PER_VERTEX_SIZE$1;
    var copyOutVerticeSize = vertexCount * EXPORT_VERTEX_SIZE;
    if (!vertices || vertices.length < _vfOffset) {
      vertices = frame.vertices = new Float32Array(copyOutVerticeSize);
    }
    var colorI32;
    for (var i = 0, j = 0; i < copyOutVerticeSize;) {
      vertices[i] = _vertices[j++];
      vertices[i + 1] = _vertices[j++];
      vertices[i + 3] = _vertices[j++];
      vertices[i + 4] = _vertices[j++];
      colorI32 = _vertices[j++];
      vertices[i + 5] = (colorI32 & 0xff) / 255.0;
      vertices[i + 6] = (colorI32 >> 8 & 0xff) / 255.0;
      vertices[i + 7] = (colorI32 >> 16 & 0xff) / 255.0;
      vertices[i + 8] = (colorI32 >> 24 & 0xff) / 255.0;
      i += EXPORT_VERTEX_SIZE;
    }
    var indices = frame.indices;
    if (!indices || indices.length < _indexOffset$1) {
      indices = frame.indices = new Uint16Array(_indexOffset$1);
    }
    for (var _i = 0; _i < _indexOffset$1; _i++) {
      indices[_i] = _indices[_i];
    }
    frame.vertices = vertices;
    frame.indices = indices;
    this.maxVertexCount = vertexCount > this.maxVertexCount ? vertexCount : this.maxVertexCount;
    this.maxIndexCount = indices.length > this.maxIndexCount ? indices.length : this.maxIndexCount;
  };
  _proto._traverseArmature = function _traverseArmature(armature, parentOpacity) {
    var colors = this._tempColors;
    var segments = this._tempSegments;
    var boneInfos = this._tempBoneInfos;
    var slots = armature._slots;
    var slotVertices;
    var slotIndices;
    var slot;
    var slotMatrix;
    var slotColor;
    var colorVal;
    var texture;
    var preSegOffset;
    var preSegInfo;
    var bones = armature._bones;
    if (this._enableCacheAttachedInfo) {
      for (var i = 0, l = bones.length; i < l; i++, _boneInfoOffset++) {
        var bone = bones[i];
        var boneInfo = boneInfos[_boneInfoOffset];
        if (!boneInfo) {
          boneInfo = boneInfos[_boneInfoOffset] = {
            globalTransformMatrix: new Matrix()
          };
        }
        var boneMat = bone.globalTransformMatrix;
        var cacheBoneMat = boneInfo.globalTransformMatrix;
        cacheBoneMat.copyFrom(boneMat);
      }
    }
    for (var _i2 = 0, _l = slots.length; _i2 < _l; _i2++) {
      slot = slots[_i2];
      if (!slot._visible || !slot._displayData) continue;
      slot.updateWorldMatrix();
      slotColor = slot._color;
      if (slot.childArmature) {
        this._traverseArmature(slot.childArmature, parentOpacity * slotColor.a / 255);
        continue;
      }
      texture = slot.getTexture();
      if (!texture) continue;
      if (_preTexUrl !== texture.nativeUrl || _preBlendMode !== slot._blendMode) {
        _preTexUrl = texture.nativeUrl;
        _preBlendMode = slot._blendMode;
        preSegOffset = _segOffset - 1;
        if (preSegOffset >= 0) {
          if (_segICount > 0) {
            preSegInfo = segments[preSegOffset];
            preSegInfo.indexCount = _segICount;
            preSegInfo.vertexCount = _segVCount;
            preSegInfo.vfCount = _segVCount * EXPORT_VERTEX_SIZE;
          } else {
            _segOffset--;
          }
        }
        segments[_segOffset] = {
          tex: texture,
          blendMode: slot._blendMode,
          indexCount: 0,
          vertexCount: 0,
          vfCount: 0
        };
        _segOffset++;
        _segICount = 0;
        _segVCount = 0;
      }
      colorVal = (slotColor.a * parentOpacity << 24 >>> 0) + (slotColor.b << 16) + (slotColor.g << 8) + slotColor.r;
      if (_preColor !== colorVal) {
        _preColor = colorVal;
        if (_colorOffset > 0) {
          colors[_colorOffset - 1].vfOffset = _vfOffset;
        }
        colors[_colorOffset++] = {
          r: slotColor.r,
          g: slotColor.g,
          b: slotColor.b,
          a: slotColor.a * parentOpacity,
          vfOffset: 0
        };
      }
      slotVertices = slot._localVertices;
      slotIndices = slot._indices;
      slotMatrix = slot._worldMatrix;
      for (var j = 0, vl = slotVertices.length; j < vl;) {
        _x = slotVertices[j++];
        _y = slotVertices[j++];
        _vertices[_vfOffset++] = _x * slotMatrix.m00 + _y * slotMatrix.m04 + slotMatrix.m12;
        _vertices[_vfOffset++] = _x * slotMatrix.m01 + _y * slotMatrix.m05 + slotMatrix.m13;
        _vertices[_vfOffset++] = slotVertices[j++];
        _vertices[_vfOffset++] = slotVertices[j++];
        _vertices[_vfOffset++] = colorVal;
      }
      for (var ii = 0, il = slotIndices.length; ii < il; ii++) {
        _indices[_indexOffset$1++] = _segVCount + slotIndices[ii];
      }
      _segICount += slotIndices.length;
      _segVCount += slotVertices.length / 4;
    }
  };
  return AnimationCache;
}();
var ArmatureCache = function () {
  function ArmatureCache() {
    this._privateMode = false;
    this._animationPool = {};
    this._armatureCache = {};
  }
  var _proto2 = ArmatureCache.prototype;
  _proto2.enablePrivateMode = function enablePrivateMode() {
    this._privateMode = true;
  };
  _proto2.dispose = function dispose() {
    for (var key in this._armatureCache) {
      var armatureInfo = this._armatureCache[key];
      if (armatureInfo) {
        var armature = armatureInfo.armature;
        if (armature) armature.dispose();
      }
    }
    this._armatureCache = {};
    this._animationPool = {};
  };
  _proto2._removeArmature = function _removeArmature(armatureKey) {
    var armatureInfo = this._armatureCache[armatureKey];
    var animationsCache = armatureInfo.animationsCache;
    for (var aniKey in animationsCache) {
      var animationCache = animationsCache[aniKey];
      if (!animationCache) continue;
      this._animationPool[armatureKey + "#" + aniKey] = animationCache;
      animationCache.clear();
    }
    var armature = armatureInfo.armature;
    if (armature) armature.dispose();
    delete this._armatureCache[armatureKey];
  };
  _proto2.resetArmature = function resetArmature(uuid) {
    for (var armatureKey in this._armatureCache) {
      if (armatureKey.indexOf(uuid) === -1) continue;
      this._removeArmature(armatureKey);
    }
  };
  _proto2.getArmatureCache = function getArmatureCache(armatureName, armatureKey, atlasUUID) {
    var armatureInfo = this._armatureCache[armatureKey];
    var armature;
    if (!armatureInfo) {
      var factory = CCFactory.getInstance();
      var proxy = factory.buildArmatureDisplay(armatureName, armatureKey, '', atlasUUID);
      if (!proxy || !proxy._armature) return null;
      armature = proxy._armature;
      if (!ArmatureCache.canCache(armature)) {
        armature.dispose();
        return null;
      }
      this._armatureCache[armatureKey] = {
        armature: armature,
        animationsCache: {},
        curAnimationCache: null
      };
    } else {
      armature = armatureInfo.armature;
    }
    return armature;
  };
  _proto2.getAnimationCache = function getAnimationCache(armatureKey, animationName) {
    var armatureInfo = this._armatureCache[armatureKey];
    if (!armatureInfo) return null;
    var animationsCache = armatureInfo.animationsCache;
    return animationsCache[animationName];
  };
  _proto2.initAnimationCache = function initAnimationCache(armatureKey, animationName) {
    if (!animationName) return null;
    var armatureInfo = this._armatureCache[armatureKey];
    var armature = armatureInfo && armatureInfo.armature;
    if (!armature) return null;
    var animation = armature.animation;
    var hasAni = animation.hasAnimation(animationName);
    if (!hasAni) return null;
    var animationsCache = armatureInfo.animationsCache;
    var animationCache = animationsCache[animationName];
    if (!animationCache) {
      var poolKey = armatureKey + "#" + animationName;
      animationCache = this._animationPool[poolKey];
      if (animationCache) {
        delete this._animationPool[poolKey];
      } else {
        animationCache = new AnimationCache();
        animationCache._privateMode = this._privateMode;
      }
      animationCache.init(armatureInfo, animationName);
      animationsCache[animationName] = animationCache;
    }
    return animationCache;
  };
  _proto2.invalidAnimationCache = function invalidAnimationCache(armatureKey) {
    var armatureInfo = this._armatureCache[armatureKey];
    var armature = armatureInfo && armatureInfo.armature;
    if (!armature) return;
    var animationsCache = armatureInfo.animationsCache;
    for (var aniKey in animationsCache) {
      var animationCache = animationsCache[aniKey];
      animationCache.invalidAllFrame();
    }
  };
  _proto2.updateAnimationCache = function updateAnimationCache(armatureKey, animationName) {
    if (animationName) {
      var animationCache = this.initAnimationCache(armatureKey, animationName);
      if (!animationCache) return;
      animationCache.updateAllFrame();
    } else {
      var armatureInfo = this._armatureCache[armatureKey];
      var armature = armatureInfo && armatureInfo.armature;
      if (!armature) return;
      var animationsCache = armatureInfo.animationsCache;
      for (var aniKey in animationsCache) {
        var _animationCache = animationsCache[aniKey];
        _animationCache.updateAllFrame();
      }
    }
  };
  ArmatureCache.canCache = function canCache(armature) {
    var slots = armature._slots;
    for (var i = 0, l = slots.length; i < l; i++) {
      var slot = slots[i];
      if (slot.childArmature) {
        return false;
      }
    }
    return true;
  };
  return ArmatureCache;
}();
_ArmatureCache = ArmatureCache;
ArmatureCache.FrameTime = FrameTime;
ArmatureCache.sharedCache = new _ArmatureCache();

var _dec$3, _class$3, _class2$2, _initializer$2;
var ccclass$3 = ccclass$8,
  serializable$2 = serializable$3;
var DragonBonesAsset = (_dec$3 = ccclass$3('dragonBones.DragonBonesAsset'), _dec$3(_class$3 = (_class2$2 = function (_Asset) {
  function DragonBonesAsset(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this._dragonBonesJson = _initializer$2 && _initializer$2();
    _this._factory = null;
    _this._dragonBonesJsonData = void 0;
    _this._armaturesEnum = null;
    _this.reset();
    return _this;
  }
  _inheritsLoose(DragonBonesAsset, _Asset);
  var _proto = DragonBonesAsset.prototype;
  _proto.createNode = function createNode(callback) {
    var node = new Node(this.name);
    var armatureDisplay = node.addComponent('dragonBones.ArmatureDisplay');
    armatureDisplay.dragonAsset = this;
    return callback(null, node);
  };
  _proto.reset = function reset() {
    this._clear();
  };
  _proto.init = function init(factory, atlasUUID) {
    this._factory = factory || CCFactory.getInstance();
    if (!this._dragonBonesJsonData && this.dragonBonesJson) {
      this._dragonBonesJsonData = JSON.parse(this.dragonBonesJson);
    }
    var rawData = null;
    if (this._dragonBonesJsonData) {
      rawData = this._dragonBonesJsonData;
    } else {
      rawData = this._nativeAsset;
    }
    if (!this._uuid) {
      var dbData = this._factory.getDragonBonesDataByRawData(rawData);
      if (dbData) {
        this._uuid = dbData.name;
      } else {
        warn('dragonbones name is empty');
      }
    }
    var armatureKey = this._uuid + "#" + atlasUUID;
    var dragonBonesData = this._factory.getDragonBonesData(armatureKey);
    if (dragonBonesData) return armatureKey;
    this._factory.parseDragonBonesData(rawData instanceof ArrayBuffer ? rawData : rawData.buffer instanceof ArrayBuffer ? rawData.buffer : rawData, armatureKey);
    return armatureKey;
  };
  _proto.getArmatureEnum = function getArmatureEnum() {
    if (this._armaturesEnum) {
      return this._armaturesEnum;
    }
    this.init();
    var dragonBonesData = this._factory.getDragonBonesDataByUUID(this._uuid);
    if (dragonBonesData) {
      var armatureNames = dragonBonesData.armatureNames;
      var enumDef = {};
      for (var i = 0; i < armatureNames.length; i++) {
        var name = armatureNames[i];
        enumDef[name] = i;
      }
      return this._armaturesEnum = Enum(enumDef);
    }
    return null;
  };
  _proto.getAnimsEnum = function getAnimsEnum(armatureName) {
    this.init();
    var dragonBonesData = this._factory.getDragonBonesDataByUUID(this._uuid);
    if (dragonBonesData) {
      var armature = dragonBonesData.getArmature(armatureName);
      if (!armature) {
        return null;
      }
      var enumDef = {
        '<None>': 0
      };
      var anims = armature.animations;
      var i = 0;
      for (var animName in anims) {
        if (anims.hasOwnProperty(animName)) {
          enumDef[animName] = i + 1;
          i++;
        }
      }
      return Enum(enumDef);
    }
    return null;
  };
  _proto.destroy = function destroy() {
    this._clear();
    return _Asset.prototype.destroy.call(this);
  };
  _proto._clear = function _clear() {
    if (this._factory) {
      ArmatureCache.sharedCache.resetArmature(this._uuid);
      this._factory.removeDragonBonesDataByUUID(this._uuid, true);
    }
  };
  return _createClass(DragonBonesAsset, [{
    key: "dragonBonesJson",
    get: function get() {
      return this._dragonBonesJson;
    },
    set: function set(value) {
      this._dragonBonesJson = value;
      this._dragonBonesJsonData = JSON.parse(value);
      this.reset();
    }
  }]);
}(Asset), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_dragonBonesJson", [serializable$2], function () {
  return '';
}), _class2$2)) || _class$3);
cclegacy.internal.DragonBonesAsset = DragonBonesAsset;

var _dec$2, _dec2$1, _class$2, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4$1;
var ccclass$2 = ccclass$8,
  serializable$1 = serializable$3,
  type$1 = type$2;
var DragonBonesAtlasAsset = (_dec$2 = ccclass$2('dragonBones.DragonBonesAtlasAsset'), _dec2$1 = type$1(Texture2D), _dec$2(_class$2 = (_class2$1 = function (_Asset) {
  function DragonBonesAtlasAsset() {
    var _this;
    _this = _Asset.call(this) || this;
    _this._atlasJson = _initializer$1 && _initializer$1();
    _this._texture = _initializer2$1 && _initializer2$1();
    _this._atlasJsonData = _initializer3$1 && _initializer3$1();
    _this._factory = null;
    _this._textureAtlasData = _initializer4$1 && _initializer4$1();
    _this._clear();
    return _this;
  }
  _inheritsLoose(DragonBonesAtlasAsset, _Asset);
  var _proto = DragonBonesAtlasAsset.prototype;
  _proto.createNode = function createNode(callback) {
    var node = new Node(this.name);
    var armatureDisplay = node.addComponent('dragonBones.ArmatureDisplay');
    armatureDisplay.dragonAtlasAsset = this;
    return callback(null, node);
  };
  _proto.init = function init(factory) {
    this._factory = factory;
    if (!this._atlasJsonData) {
      this._atlasJsonData = JSON.parse(this.atlasJson);
    }
    var atlasJsonObj = this._atlasJsonData;
    this._uuid = this._uuid || atlasJsonObj.name;
    if (this._textureAtlasData) {
      factory.addTextureAtlasData(this._textureAtlasData, this._uuid);
    } else {
      this._textureAtlasData = factory.parseTextureAtlasData(atlasJsonObj, this.texture, this._uuid);
    }
  };
  _proto.destroy = function destroy() {
    this._clear();
    return _Asset.prototype.destroy.call(this);
  };
  _proto._clear = function _clear() {
    if (this._factory) {
      ArmatureCache.sharedCache.resetArmature(this._uuid);
      this._factory.removeTextureAtlasData(this._uuid, true);
      this._factory.removeDragonBonesDataByUUID(this._uuid, true);
    }
    this._textureAtlasData = null;
  };
  return _createClass(DragonBonesAtlasAsset, [{
    key: "atlasJson",
    get: function get() {
      return this._atlasJson;
    },
    set: function set(value) {
      this._atlasJson = value;
      this._atlasJsonData = JSON.parse(this.atlasJson);
      this._clear();
    }
  }, {
    key: "texture",
    get: function get() {
      return this._texture;
    },
    set: function set(value) {
      this._texture = value;
      this._clear();
    }
  }]);
}(Asset), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_atlasJson", [serializable$1], function () {
  return '';
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_texture", [serializable$1, _dec2$1], function () {
  return null;
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "_atlasJsonData", [serializable$1], function () {
  return {};
}), _initializer4$1 = applyDecoratedInitializer(_class2$1.prototype, "_textureAtlasData", [serializable$1], function () {
  return null;
}), _class2$1)) || _class$2);
cclegacy.internal.DragonBonesAtlasAsset = DragonBonesAtlasAsset;

var _dec$1, _class$1;
var _tempMat4 = new Mat4();
var ccclass$1 = ccclass$8;
var AttachUtil = (_dec$1 = ccclass$1('dragonBones.AttachUtil'), _dec$1(_class$1 = function () {
  function AttachUtil() {
    this._inited = false;
    this._armature = null;
    this._armatureNode = null;
    this._armatureDisplay = null;
  }
  var _proto = AttachUtil.prototype;
  _proto.init = function init(armatureDisplay) {
    this._inited = true;
    this._armature = armatureDisplay._armature;
    this._armatureNode = armatureDisplay.node;
    this._armatureDisplay = armatureDisplay;
  };
  _proto.reset = function reset() {
    this._inited = false;
    this._armature = null;
    this._armatureNode = null;
    this._armatureDisplay = null;
  };
  _proto._syncAttachedNode = function _syncAttachedNode() {
    if (!this._inited) return;
    this._armatureNode.worldMatrix;
    var boneInfos = null;
    var isCached = this._armatureDisplay.isAnimationCached();
    if (isCached && this._armatureDisplay) {
      boneInfos = this._armatureDisplay._curFrame && this._armatureDisplay._curFrame.boneInfos;
      if (!boneInfos) return;
    }
    var sockets = this._armatureDisplay.sockets;
    var socketNodes = this._armatureDisplay.socketNodes;
    var matrixHandle = function matrixHandle(node, boneMat) {
      var tm = _tempMat4;
      tm.m00 = boneMat.a;
      tm.m01 = boneMat.b;
      tm.m04 = -boneMat.c;
      tm.m05 = -boneMat.d;
      tm.m12 = boneMat.tx;
      tm.m13 = boneMat.ty;
      node.matrix = _tempMat4;
    };
    var bones = this._armature.getBones();
    for (var l = sockets.length - 1; l >= 0; l--) {
      var sock = sockets[l];
      var boneNode = sock.target;
      if (!boneNode) continue;
      if (!boneNode.isValid) {
        socketNodes["delete"](sock.path);
        sockets.splice(l, 1);
        continue;
      }
      var bone = isCached ? boneInfos[sock.boneIndex] : bones[sock.boneIndex];
      if (!bone) continue;
      matrixHandle(boneNode, bone.globalTransformMatrix);
    }
  };
  return AttachUtil;
}()) || _class$1);

var ArmatureSystem = function (_System) {
  function ArmatureSystem() {
    var _this;
    _this = _System.call(this) || this;
    _this._armatures = new Set();
    return _this;
  }
  _inheritsLoose(ArmatureSystem, _System);
  ArmatureSystem.getInstance = function getInstance() {
    if (!ArmatureSystem._instance) {
      ArmatureSystem._instance = new ArmatureSystem();
      director.registerSystem(ArmatureSystem.ID, ArmatureSystem._instance, SystemPriority.HIGH);
    }
    return ArmatureSystem._instance;
  };
  var _proto = ArmatureSystem.prototype;
  _proto.add = function add(armature) {
    if (!armature) return;
    if (!this._armatures.has(armature)) {
      this._armatures.add(armature);
    }
  };
  _proto.remove = function remove(armature) {
    if (!armature) return;
    if (this._armatures.has(armature)) {
      this._armatures["delete"](armature);
    }
  };
  _proto.postUpdate = function postUpdate(dt) {
    if (!this._armatures) {
      return;
    }
    this._armatures.forEach(function (armature) {
      armature.updateAnimation(dt);
      armature.syncAttachedNode();
    });
  };
  _proto.prepareRenderData = function prepareRenderData() {
    if (!this._armatures) {
      return;
    }
    this._armatures.forEach(function (armature) {
      armature._markForUpdateRenderData();
    });
  };
  return ArmatureSystem;
}(System);
ArmatureSystem.ID = 'ARMATURE';
ArmatureSystem._instance = void 0;
cclegacy.internal.ArmatureSystem = ArmatureSystem;

var _dec, _dec2, _class, _class2, _initializer, _initializer2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class3, _class4, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _ArmatureDisplay;
var DefaultArmaturesEnum;
(function (DefaultArmaturesEnum) {
  DefaultArmaturesEnum[DefaultArmaturesEnum["default"] = -1] = "default";
})(DefaultArmaturesEnum || (DefaultArmaturesEnum = {}));
ccenum(DefaultArmaturesEnum);
var DefaultAnimsEnum;
(function (DefaultAnimsEnum) {
  DefaultAnimsEnum[DefaultAnimsEnum["<None>"] = 0] = "<None>";
})(DefaultAnimsEnum || (DefaultAnimsEnum = {}));
ccenum(DefaultAnimsEnum);
var DefaultCacheMode;
(function (DefaultCacheMode) {
  DefaultCacheMode[DefaultCacheMode["REALTIME"] = 0] = "REALTIME";
})(DefaultCacheMode || (DefaultCacheMode = {}));
ccenum(DefaultCacheMode);
var timeScale = 1;
var AnimationCacheMode;
(function (AnimationCacheMode) {
  AnimationCacheMode[AnimationCacheMode["REALTIME"] = 0] = "REALTIME";
  AnimationCacheMode[AnimationCacheMode["SHARED_CACHE"] = 1] = "SHARED_CACHE";
  AnimationCacheMode[AnimationCacheMode["PRIVATE_CACHE"] = 2] = "PRIVATE_CACHE";
})(AnimationCacheMode || (AnimationCacheMode = {}));
ccenum(AnimationCacheMode);
var ccclass = ccclass$8,
  serializable = serializable$3,
  type = type$2,
  override = override$1;
var DragonBoneSocket = (_dec = ccclass('dragonBones.ArmatureDisplay.DragonBoneSocket'), _dec2 = type(Node), _dec(_class = (_class2 = function DragonBoneSocket(path, target) {
  if (path === void 0) {
    path = '';
  }
  if (target === void 0) {
    target = null;
  }
  this.path = _initializer && _initializer();
  this.target = _initializer2 && _initializer2();
  this.boneIndex = null;
  this.path = path;
  this.target = target;
}, _initializer = applyDecoratedInitializer(_class2.prototype, "path", [serializable], function () {
  return '';
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "target", [_dec2, serializable], function () {
  return null;
}), _class2)) || _class);
setClassAlias(DragonBoneSocket, 'dragonBones.ArmatureDisplay.DragonBoneSocket');
var ArmatureDisplay = (_dec3 = ccclass('dragonBones.ArmatureDisplay'), _dec4 = type(DragonBonesAsset), _dec5 = type(DragonBonesAtlasAsset), _dec6 = type(DefaultArmaturesEnum), _dec7 = type(DefaultAnimsEnum), _dec8 = type([DragonBoneSocket]), _dec9 = type(Material), _dec3(_class3 = (_class4 = (_ArmatureDisplay = function (_UIRenderer) {
  function ArmatureDisplay() {
    var _this;
    _this = _UIRenderer.call(this) || this;
    _this.playTimes = _initializer3 && _initializer3();
    _this.premultipliedAlpha = _initializer4 && _initializer4();
    _this._armature = null;
    _this.attachUtil = void 0;
    _this._defaultArmatureIndexValue = _initializer5 && _initializer5();
    _this._dragonAsset = _initializer6 && _initializer6();
    _this._dragonAtlasAsset = _initializer7 && _initializer7();
    _this._armatureName = _initializer8 && _initializer8();
    _this._animationName = _initializer9 && _initializer9();
    _this._animationIndexValue = _initializer0 && _initializer0();
    _this._preCacheMode = -1;
    _this._cacheMode = AnimationCacheMode.REALTIME;
    _this._defaultCacheModeValue = _initializer1 && _initializer1();
    _this._timeScale = _initializer10 && _initializer10();
    _this._playTimes = _initializer11 && _initializer11();
    _this._debugBones = _initializer12 && _initializer12();
    _this._enableBatch = _initializer13 && _initializer13();
    _this._debugDraw = null;
    _this._armatureKey = '';
    _this._accTime = 0;
    _this._playCount = 0;
    _this._frameCache = null;
    _this._curFrame = null;
    _this._playing = false;
    _this._armatureCache = null;
    _this._eventTarget = void 0;
    _this._factory = null;
    _this._displayProxy = null;
    _this._drawIdx = 0;
    _this._drawList = new RecyclePool(function () {
      return {
        material: null,
        texture: null,
        indexOffset: 0,
        indexCount: 0
      };
    }, 1);
    _this.maxVertexCount = 0;
    _this.maxIndexCount = 0;
    _this._materialCache = {};
    _this._enumArmatures = Enum({});
    _this._enumAnimations = Enum({});
    _this._socketNodes = new Map();
    _this._cachedSockets = new Map();
    _this._sockets = _initializer14 && _initializer14();
    _this._inited = void 0;
    _this._drawInfoList = [];
    _this._cacheModeEnum = void 0;
    _this._eventTarget = new EventTarget();
    _this._inited = false;
    _this.attachUtil = new AttachUtil();
    _this.initFactory();
    setPropertyEnumType(_this, '_animationIndex', _this._enumAnimations);
    setPropertyEnumType(_this, '_defaultArmatureIndex', _this._enumArmatures);
    _this._useVertexOpacity = true;
    return _this;
  }
  _inheritsLoose(ArmatureDisplay, _UIRenderer);
  var _proto = ArmatureDisplay.prototype;
  _proto.requestDrawInfo = function requestDrawInfo(idx) {
    if (!this._drawInfoList[idx]) {
      this._drawInfoList[idx] = new RenderDrawInfo();
    }
    return this._drawInfoList[idx];
  };
  _proto.initFactory = function initFactory() {
    this._factory = CCFactory.getInstance();
  };
  _proto.onLoad = function onLoad() {
    _UIRenderer.prototype.onLoad.call(this);
  };
  _proto._requestDrawData = function _requestDrawData(material, texture, indexOffset, indexCount) {
    var draw = this._drawList.add();
    draw.material = material;
    draw.texture = texture;
    draw.indexOffset = indexOffset;
    draw.indexCount = indexCount;
    return draw;
  };
  _proto.destroyRenderData = function destroyRenderData() {
    this._drawList.reset();
    _UIRenderer.prototype.destroyRenderData.call(this);
  };
  _proto.getMaterialTemplate = function getMaterialTemplate() {
    if (this.customMaterial !== null) return this.customMaterial;
    if (this.material) return this.material;
    this.updateMaterial();
    return this.material;
  };
  _proto.getMaterialForBlend = function getMaterialForBlend(src, dst) {
    var key = src + "/" + dst;
    var inst = this._materialCache[key];
    if (inst) {
      return inst;
    }
    var material = this.getMaterialTemplate();
    var matInfo = {
      parent: material,
      subModelIdx: 0,
      owner: this
    };
    inst = new MaterialInstance(matInfo);
    inst.recompileShaders({
      TWO_COLORED: false,
      USE_LOCAL: false
    });
    this._materialCache[key] = inst;
    inst.overridePipelineStates({
      blendState: {
        targets: [{
          blendSrc: src,
          blendDst: dst
        }]
      }
    });
    return inst;
  };
  _proto._updateBuiltinMaterial = function _updateBuiltinMaterial() {
    var material = builtinResMgr.get('default-spine-material');
    return material;
  };
  _proto.updateMaterial = function updateMaterial() {
    var mat;
    if (this._customMaterial) mat = this._customMaterial;else mat = this._updateBuiltinMaterial();
    this.setSharedMaterial(mat, 0);
    this._cleanMaterialCache();
  };
  _proto._render = function _render(batcher) {
    var indicesCount = 0;
    if (this.renderData && this._drawList) {
      var rd = this.renderData;
      var chunk = rd.chunk;
      var accessor = chunk.vertexAccessor;
      var meshBuffer = rd.getMeshBuffer();
      var origin = meshBuffer.indexOffset;
      for (var i = 0; i < this._drawList.length; i++) {
        this._drawIdx = i;
        var dc = this._drawList.data[i];
        if (dc.texture) {
          batcher.commitMiddleware(this, meshBuffer, origin + dc.indexOffset, dc.indexCount, dc.texture, dc.material, this._enableBatch);
        }
        indicesCount += dc.indexCount;
      }
      var subIndices = rd.indices.subarray(0, indicesCount);
      accessor.appendIndices(chunk.bufferId, subIndices);
    }
  };
  _proto.__preload = function __preload() {
    _UIRenderer.prototype.__preload.call(this);
    this._init();
  };
  _proto._init = function _init() {
    this._cacheMode = this._defaultCacheMode;
    if (this._inited) return;
    this._inited = true;
    this._parseDragonAtlasAsset();
    this._refresh();
    var children = this.node.children;
    for (var i = 0, n = children.length; i < n; i++) {
      var child = children[i];
      if (child && child.name === 'DEBUG_DRAW_NODE') {
        child.destroy();
      }
    }
    this._updateDebugDraw();
    this._indexBoneSockets();
    this._updateSocketBindings();
  };
  _proto.getArmatureKey = function getArmatureKey() {
    return this._armatureKey;
  };
  _proto.setAnimationCacheMode = function setAnimationCacheMode(cacheMode) {
    if (this._preCacheMode !== cacheMode) {
      this._cacheMode = cacheMode;
      this._buildArmature();
      if (this._armature && !this.isAnimationCached()) {
        this._factory._dragonBones.clock.add(this._armature);
      }
      this._updateSocketBindings();
      this._markForUpdateRenderData();
    }
  };
  _proto.isAnimationCached = function isAnimationCached() {
    return this._cacheMode !== AnimationCacheMode.REALTIME;
  };
  _proto.onEnable = function onEnable() {
    _UIRenderer.prototype.onEnable.call(this);
    if (this._armature && !this.isAnimationCached()) {
      this._factory._dragonBones.clock.add(this._armature);
    }
    this._flushAssembler();
    ArmatureSystem.getInstance().add(this);
  };
  _proto.onDisable = function onDisable() {
    _UIRenderer.prototype.onDisable.call(this);
    if (this._armature && !this.isAnimationCached()) {
      this._factory._dragonBones.clock.remove(this._armature);
    }
    ArmatureSystem.getInstance().remove(this);
  };
  _proto._emitCacheCompleteEvent = function _emitCacheCompleteEvent() {
    this._eventTarget.emit(EventObject.LOOP_COMPLETE);
    this._eventTarget.emit(EventObject.COMPLETE);
  };
  _proto.updateAnimation = function updateAnimation(dt) {
    this._markForUpdateRenderData();
    if (!this.isAnimationCached()) return;
    if (!this._frameCache) return;
    var frameCache = this._frameCache;
    if (!frameCache.isInited()) {
      return;
    }
    var frames = frameCache.frames;
    if (!this._playing) {
      if (frameCache.isInvalid()) {
        frameCache.updateToFrame();
        this._curFrame = frames[frames.length - 1];
        if (this.renderData && (this.renderData.vertexCount < frameCache.maxVertexCount || this.renderData.indexCount < frameCache.maxIndexCount)) {
          this.maxVertexCount = frameCache.maxVertexCount > this.maxVertexCount ? frameCache.maxVertexCount : this.maxVertexCount;
          this.maxIndexCount = frameCache.maxIndexCount > this.maxIndexCount ? frameCache.maxIndexCount : this.maxIndexCount;
          this.renderData.resize(this.maxVertexCount, this.maxIndexCount);
          if (!this.renderData.indices || this.maxIndexCount > this.renderData.indices.length) {
            this.renderData.indices = new Uint16Array(this.maxIndexCount);
          }
        }
      }
      return;
    }
    var frameTime = ArmatureCache.FrameTime;
    if (this._accTime === 0 && this._playCount === 0) {
      this._eventTarget.emit(EventObject.START);
    }
    var globalTimeScale = timeScale;
    this._accTime += dt * this.timeScale * globalTimeScale;
    var frameIdx = Math.floor(this._accTime / frameTime);
    if (!frameCache.isCompleted) {
      frameCache.updateToFrame(frameIdx);
      if (this.renderData && (this.renderData.vertexCount < frameCache.maxVertexCount || this.renderData.indexCount < frameCache.maxIndexCount)) {
        this.maxVertexCount = frameCache.maxVertexCount > this.maxVertexCount ? frameCache.maxVertexCount : this.maxVertexCount;
        this.maxIndexCount = frameCache.maxIndexCount > this.maxIndexCount ? frameCache.maxIndexCount : this.maxIndexCount;
        this.renderData.resize(this.maxVertexCount, this.maxIndexCount);
        if (!this.renderData.indices || this.maxIndexCount > this.renderData.indices.length) {
          this.renderData.indices = new Uint16Array(this.maxIndexCount);
        }
      }
    }
    if (frameCache.isCompleted && frameIdx >= frames.length) {
      this._playCount++;
      if (this.playTimes > 0 && this._playCount >= this.playTimes) {
        this._curFrame = frames[frames.length - 1];
        this._accTime = 0;
        this._playing = false;
        this._playCount = 0;
        this._emitCacheCompleteEvent();
        this.attachUtil._syncAttachedNode();
        return;
      }
      this._accTime = 0;
      frameIdx = 0;
      this._emitCacheCompleteEvent();
    }
    this._curFrame = frames[frameIdx];
    this.attachUtil._syncAttachedNode();
  };
  _proto.onDestroy = function onDestroy() {
    this._materialInstances = this._materialInstances.filter(function (instance) {
      return !!instance;
    });
    this._inited = false;
    {
      if (this._cacheMode === AnimationCacheMode.PRIVATE_CACHE) {
        this._armatureCache.dispose();
        this._armatureCache = null;
        this._armature = null;
      } else if (this._cacheMode === AnimationCacheMode.SHARED_CACHE) {
        this._armatureCache = null;
        this._armature = null;
      } else if (this._armature) {
        this._armature.dispose();
        this._armature = null;
      }
    }
    this._drawList.destroy();
    _UIRenderer.prototype.onDestroy.call(this);
  };
  _proto._updateDebugDraw = function _updateDebugDraw() {
    if (this.debugBones) {
      if (!this._debugDraw) {
        var debugDrawNode = new Node('DEBUG_DRAW_NODE');
        debugDrawNode.hideFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
        var debugDraw;
        try {
          debugDraw = debugDrawNode.addComponent('cc.Graphics');
          debugDraw.lineWidth = 1;
          debugDraw.strokeColor = new Color(255, 0, 0, 255);
          this._debugDraw = debugDraw;
          this._debugDraw.node.parent = this.node;
        } catch (e) {
          errorID(4501, e.message);
          debugDrawNode.destroy();
          debugDrawNode = null;
        }
      }
    } else if (this._debugDraw) {
      this._debugDraw.node.parent = null;
    }
    this._markForUpdateRenderData();
  };
  _proto._updateBatch = function _updateBatch() {
    this._cleanMaterialCache();
    this._markForUpdateRenderData();
  };
  _proto._buildArmature = function _buildArmature() {
    if (!this.dragonAsset || !this.dragonAtlasAsset || !this.armatureName) return;
    if (this._armature) {
      {
        if (this._preCacheMode === AnimationCacheMode.PRIVATE_CACHE) {
          this._armatureCache.dispose();
        } else if (this._preCacheMode === AnimationCacheMode.REALTIME) {
          this._armature.dispose();
        }
      }
      this._armatureCache = null;
      this._armature = null;
      this._displayProxy = null;
      this._frameCache = null;
      this._curFrame = null;
      this._playing = false;
      this._preCacheMode = -1;
    }
    {
      if (this._cacheMode === AnimationCacheMode.SHARED_CACHE) {
        this._armatureCache = ArmatureCache.sharedCache;
      } else if (this._cacheMode === AnimationCacheMode.PRIVATE_CACHE) {
        this._armatureCache = new ArmatureCache();
        this._armatureCache.enablePrivateMode();
      }
    }
    var atlasUUID = this.dragonAtlasAsset._uuid;
    this._armatureKey = this.dragonAsset.init(this._factory, atlasUUID);
    if (this.isAnimationCached()) {
      this._armature = this._armatureCache.getArmatureCache(this.armatureName, this._armatureKey, atlasUUID);
      if (!this._armature) {
        this._cacheMode = AnimationCacheMode.REALTIME;
      }
    }
    this._preCacheMode = this._cacheMode;
    if (this._cacheMode === AnimationCacheMode.REALTIME) {
      this._displayProxy = this._factory.buildArmatureDisplay(this.armatureName, this._armatureKey, '', atlasUUID);
      if (!this._displayProxy) return;
      this._displayProxy._ccNode = this.node;
      this._displayProxy._ccComponent = this;
      this._displayProxy.setEventTarget(this._eventTarget);
      this._armature = this._displayProxy._armature;
      this._armature.animation.timeScale = this.timeScale;
    }
    if (this._cacheMode !== AnimationCacheMode.REALTIME && this.debugBones) {
      warn('Debug bones is invalid in cached mode');
    }
    if (this._armature) {
      var armatureData = this._armature.armatureData;
      var aabb = armatureData.aabb;
      this.node._getUITransformComp().setContentSize(aabb.width, aabb.height);
    }
    this.attachUtil.init(this);
    if (this.animationName) {
      this.playAnimation(this.animationName, this.playTimes);
    }
    this._flushAssembler();
  };
  _proto.querySockets = function querySockets() {
    if (!this._armature) {
      return [];
    }
    if (this._cachedSockets.size === 0) {
      this._indexBoneSockets();
    }
    return Array.from(this._cachedSockets.keys()).sort();
  };
  _proto.querySocketPathByName = function querySocketPathByName(name) {
    var ret = [];
    for (var _iterator = _createForOfIteratorHelperLoose(this._cachedSockets.keys()), _step; !(_step = _iterator()).done;) {
      var key = _step.value;
      if (key.endsWith(name)) {
        ret.push(key);
      }
    }
    return ret;
  };
  _proto._parseDragonAtlasAsset = function _parseDragonAtlasAsset() {
    if (this.dragonAtlasAsset) {
      this.dragonAtlasAsset.init(this._factory);
    }
  };
  _proto._refresh = function _refresh() {
    this._buildArmature();
    this._indexBoneSockets();
    this._markForUpdateRenderData();
  };
  _proto._updateCacheModeEnum = function _updateCacheModeEnum() {
    this._cacheModeEnum = Enum({});
    if (this._armature) {
      Object.assign(this._cacheModeEnum, AnimationCacheMode);
    } else {
      Object.assign(this._cacheModeEnum, DefaultCacheMode);
    }
    setPropertyEnumType(this, '_defaultCacheMode', this._cacheModeEnum);
  };
  _proto._updateAnimEnum = function _updateAnimEnum() {
    var animEnum;
    if (this.dragonAsset) {
      animEnum = this.dragonAsset.getAnimsEnum(this.armatureName);
    } else {
      animEnum = DefaultAnimsEnum;
    }
    this._enumAnimations = Enum({});
    Object.assign(this._enumAnimations, animEnum || DefaultAnimsEnum);
    Enum.update(this._enumAnimations);
    setPropertyEnumType(this, '_animationIndex', this._enumAnimations);
  };
  _proto._updateArmatureEnum = function _updateArmatureEnum() {
    var armatureEnum;
    if (this.dragonAsset) {
      armatureEnum = this.dragonAsset.getArmatureEnum();
    } else {
      armatureEnum = DefaultArmaturesEnum;
    }
    this._enumArmatures = Enum({});
    Object.assign(this._enumArmatures, armatureEnum || DefaultArmaturesEnum);
    Enum.update(this._enumArmatures);
    setPropertyEnumType(this, '_defaultArmatureIndex', this._enumArmatures);
  };
  _proto._indexBoneSockets = function _indexBoneSockets() {
    if (!this._armature) {
      return;
    }
    this._cachedSockets.clear();
    var nameToBone = this._cachedSockets;
    var _cacheBoneName = function cacheBoneName(bi, bones, cache) {
      if (cache.has(bi)) {
        return cache.get(bi);
      }
      var bone = bones[bi];
      if (!bone.parent) {
        cache.set(bi, bone.name);
        bone.path = bone.name;
        return bone.name;
      }
      var name = _cacheBoneName(bone.parent._boneIndex, bones, cache) + "/" + bone.name;
      cache.set(bi, name);
      bone.path = name;
      return name;
    };
    var _walkArmature = function walkArmature(prefix, armature) {
      var bones = armature.getBones();
      var boneToName = new Map();
      for (var i = 0; i < bones.length; i++) {
        bones[i]._boneIndex = i;
      }
      for (var _i = 0; _i < bones.length; _i++) {
        _cacheBoneName(_i, bones, boneToName);
      }
      for (var _iterator2 = _createForOfIteratorHelperLoose(boneToName.keys()), _step2; !(_step2 = _iterator2()).done;) {
        var bone = _step2.value;
        nameToBone.set("" + prefix + boneToName.get(bone), bone);
      }
      var slots = armature.getSlots();
      for (var _i2 = 0; _i2 < slots.length; _i2++) {
        if (slots[_i2].childArmature) {
          _walkArmature(slots[_i2].name, slots[_i2].childArmature);
        }
      }
    };
    _walkArmature('', this._armature);
  };
  _proto.playAnimation = function playAnimation(animName, playTimes) {
    this.playTimes = playTimes === undefined ? -1 : playTimes;
    this.animationName = animName;
    if (this.isAnimationCached()) {
      var cache = this._armatureCache.getAnimationCache(this._armatureKey, animName);
      if (!cache) {
        cache = this._armatureCache.initAnimationCache(this._armatureKey, animName);
      }
      if (cache) {
        this._accTime = 0;
        this._playCount = 0;
        this._frameCache = cache;
        if (this._sockets.length > 0) {
          this._frameCache.enableCacheAttachedInfo();
        }
        this._frameCache.updateToFrame(0);
        this._playing = true;
        this._curFrame = this._frameCache.frames[0];
      }
    } else if (this._armature) {
      return this._armature.animation.play(animName, this.playTimes);
    }
    this._markForUpdateRenderData();
    return null;
  };
  _proto.updateAnimationCache = function updateAnimationCache(animName) {
    if (!this.isAnimationCached()) return;
    this._armatureCache.updateAnimationCache(this._armatureKey, animName);
  };
  _proto.invalidAnimationCache = function invalidAnimationCache() {
    if (!this.isAnimationCached()) return;
    this._armatureCache.invalidAnimationCache(this._armatureKey);
  };
  _proto.getArmatureNames = function getArmatureNames() {
    var dragonBonesData = this._factory.getDragonBonesData(this._armatureKey);
    return dragonBonesData && dragonBonesData.armatureNames || [];
  };
  _proto.getAnimationNames = function getAnimationNames(armatureName) {
    var ret = [];
    var dragonBonesData = this._factory.getDragonBonesData(this._armatureKey);
    if (dragonBonesData) {
      var armatureData = dragonBonesData.getArmature(armatureName);
      if (armatureData) {
        for (var animName in armatureData.animations) {
          if (armatureData.animations.hasOwnProperty(animName)) {
            ret.push(animName);
          }
        }
      }
    }
    return ret;
  };
  _proto.on = function on(eventType, listener, target) {
    this.addEventListener(eventType, listener, target);
  };
  _proto.off = function off(eventType, listener, target) {
    this.removeEventListener(eventType, listener, target);
  };
  _proto.once = function once(eventType, listener, target) {
    this._eventTarget.once(eventType, listener, target);
  };
  _proto.addEventListener = function addEventListener(eventType, listener, target) {
    this._eventTarget.on(eventType, listener, target);
  };
  _proto.removeEventListener = function removeEventListener(eventType, listener, target) {
    this._eventTarget.off(eventType, listener, target);
  };
  _proto.buildArmature = function buildArmature(armatureName, node) {
    return this._factory.createArmatureNode(this, armatureName, node);
  };
  _proto.armature = function armature() {
    return this._armature;
  };
  _proto._flushAssembler = function _flushAssembler() {
    var assembler = ArmatureDisplay.Assembler.getAssembler(this);
    if (this._assembler !== assembler) {
      this._assembler = assembler;
    }
    if (this._armature && this._assembler) {
      this._renderData = this._assembler.createData(this);
      if (this._renderData) {
        this.maxVertexCount = this._renderData.vertexCount;
        this.maxIndexCount = this._renderData.indexCount;
      }
      this._markForUpdateRenderData();
      this._updateColor();
    }
  };
  _proto._updateSocketBindings = function _updateSocketBindings() {
    if (!this._armature) return;
    this._socketNodes.clear();
    for (var i = 0, l = this._sockets.length; i < l; i++) {
      var socket = this._sockets[i];
      if (socket.path && socket.target) {
        var bone = this._cachedSockets.get(socket.path);
        if (!bone) {
          console.error("Skeleton data does not contain path " + socket.path);
          continue;
        }
        socket.boneIndex = bone;
        this._socketNodes.set(socket.path, socket.target);
      }
    }
  };
  _proto._verifySockets = function _verifySockets(sockets) {
    for (var i = 0, l = sockets.length; i < l; i++) {
      var target = sockets[i].target;
      if (target) {
        if (!target.parent || target.parent !== this.node) {
          console.error("Target node " + target.name + " is expected to be a direct child of " + this.node.name);
          continue;
        }
      }
    }
  };
  _proto._cleanMaterialCache = function _cleanMaterialCache() {
    for (var val in this._materialCache) {
      this._materialCache[val].destroy();
    }
    this._materialCache = {};
  };
  _proto.createRenderEntity = function createRenderEntity() {
    var renderEntity = new RenderEntity(RenderEntityType.DYNAMIC);
    renderEntity.setUseLocal(false);
    return renderEntity;
  };
  _proto.markForUpdateRenderData = function markForUpdateRenderData(enable) {
    if (enable === void 0) {
      enable = true;
    }
    _UIRenderer.prototype._markForUpdateRenderData.call(this, enable);
    if (this._debugDraw) {
      this._debugDraw._markForUpdateRenderData(enable);
    }
  };
  _proto.syncAttachedNode = function syncAttachedNode() {
    this.attachUtil._syncAttachedNode();
  };
  return _createClass(ArmatureDisplay, [{
    key: "dragonAsset",
    get: function get() {
      return this._dragonAsset;
    },
    set: function set(value) {
      this._dragonAsset = value;
      this.destroyRenderData();
      this._refresh();
    }
  }, {
    key: "dragonAtlasAsset",
    get: function get() {
      return this._dragonAtlasAsset;
    },
    set: function set(value) {
      this._dragonAtlasAsset = value;
      this._parseDragonAtlasAsset();
      this._refresh();
    }
  }, {
    key: "armatureName",
    get: function get() {
      return this._armatureName;
    },
    set: function set(name) {
      this._armatureName = name;
      var animNames = this.getAnimationNames(this._armatureName);
      if (!this.animationName || animNames.indexOf(this.animationName) < 0) {
        {
          this.animationName = '';
        }
      }
      if (this._armature && !this.isAnimationCached()) {
        this._factory._dragonBones.clock.remove(this._armature);
      }
      this._refresh();
      if (this._armature && !this.isAnimationCached()) {
        this._factory._dragonBones.clock.add(this._armature);
      }
    }
  }, {
    key: "animationName",
    get: function get() {
      return this._animationName;
    },
    set: function set(value) {
      this._animationName = value;
    }
  }, {
    key: "_defaultArmatureIndex",
    get: function get() {
      return this._defaultArmatureIndexValue;
    },
    set: function set(value) {
      this._defaultArmatureIndexValue = value;
      var armatureName = '';
      if (this.dragonAsset) {
        var armaturesEnum;
        if (this.dragonAsset) {
          armaturesEnum = this.dragonAsset.getArmatureEnum();
        }
        if (!armaturesEnum) {
          errorID(7400, this.name);
          return;
        }
        armatureName = armaturesEnum[this._defaultArmatureIndex];
      }
      if (armatureName !== undefined) {
        this.armatureName = armatureName;
      } else {
        errorID(7401, this.name);
      }
      this._markForUpdateRenderData();
    }
  }, {
    key: "_animationIndex",
    get: function get() {
      return this._animationIndexValue;
    },
    set: function set(value) {
      this._animationIndexValue = value;
      if (this._animationIndex === 0) {
        this.animationName = '';
        return;
      }
      var animsEnum;
      if (this.dragonAsset) {
        animsEnum = this.dragonAsset.getAnimsEnum(this.armatureName);
      }
      if (!animsEnum) {
        return;
      }
      var animName = animsEnum[this._animationIndex];
      if (animName !== undefined) {
        this.playAnimation(animName, this.playTimes);
      } else {
        errorID(7402, this.name);
      }
    }
  }, {
    key: "_defaultCacheMode",
    get: function get() {
      return this._defaultCacheModeValue;
    },
    set: function set(value) {
      this._defaultCacheModeValue = value;
      if (this._defaultCacheMode !== AnimationCacheMode.REALTIME) {
        if (this._armature && !ArmatureCache.canCache(this._armature)) {
          this._defaultCacheMode = AnimationCacheMode.REALTIME;
          warn('Animation cache mode doesn\'t support skeletal nesting');
          return;
        }
      }
      this.setAnimationCacheMode(this._defaultCacheMode);
    }
  }, {
    key: "timeScale",
    get: function get() {
      return this._timeScale;
    },
    set: function set(value) {
      this._timeScale = value;
      if (this._armature && !this.isAnimationCached()) {
        this._armature.animation.timeScale = this.timeScale;
      }
    }
  }, {
    key: "debugBones",
    get: function get() {
      return this._debugBones;
    },
    set: function set(value) {
      this._debugBones = value;
      this._updateDebugDraw();
    }
  }, {
    key: "enableBatch",
    get: function get() {
      return this._enableBatch;
    },
    set: function set(value) {
      if (value !== this._enableBatch) {
        this._enableBatch = value;
        this._updateBatch();
      }
    }
  }, {
    key: "sockets",
    get: function get() {
      return this._sockets;
    },
    set: function set(val) {
      this._verifySockets(val);
      this._sockets = val;
      this._updateSocketBindings();
      if (val.length > 0 && this._frameCache) {
        this._frameCache.enableCacheAttachedInfo();
      }
    }
  }, {
    key: "socketNodes",
    get: function get() {
      return this._socketNodes;
    }
  }, {
    key: "drawList",
    get: function get() {
      return this._drawList;
    }
  }, {
    key: "customMaterial",
    get: function get() {
      return this._customMaterial;
    },
    set: function set(val) {
      this._customMaterial = val;
      this.updateMaterial();
      this._markForUpdateRenderData();
    }
  }]);
}(UIRenderer), _ArmatureDisplay.AnimationCacheMode = AnimationCacheMode, _ArmatureDisplay), _applyDecoratedDescriptor(_class4.prototype, "dragonAsset", [_dec4], Object.getOwnPropertyDescriptor(_class4.prototype, "dragonAsset"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "dragonAtlasAsset", [_dec5], Object.getOwnPropertyDescriptor(_class4.prototype, "dragonAtlasAsset"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "_defaultArmatureIndex", [_dec6], Object.getOwnPropertyDescriptor(_class4.prototype, "_defaultArmatureIndex"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "_animationIndex", [_dec7], Object.getOwnPropertyDescriptor(_class4.prototype, "_animationIndex"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "timeScale", [serializable], Object.getOwnPropertyDescriptor(_class4.prototype, "timeScale"), _class4.prototype), _initializer3 = applyDecoratedInitializer(_class4.prototype, "playTimes", [serializable], function () {
  return -1;
}), _initializer4 = applyDecoratedInitializer(_class4.prototype, "premultipliedAlpha", [serializable], function () {
  return false;
}), _applyDecoratedDescriptor(_class4.prototype, "sockets", [_dec8], Object.getOwnPropertyDescriptor(_class4.prototype, "sockets"), _class4.prototype), _initializer5 = applyDecoratedInitializer(_class4.prototype, "_defaultArmatureIndexValue", [serializable], function () {
  return DefaultArmaturesEnum["default"];
}), _initializer6 = applyDecoratedInitializer(_class4.prototype, "_dragonAsset", [serializable], function () {
  return null;
}), _initializer7 = applyDecoratedInitializer(_class4.prototype, "_dragonAtlasAsset", [serializable], function () {
  return null;
}), _initializer8 = applyDecoratedInitializer(_class4.prototype, "_armatureName", [serializable], function () {
  return '';
}), _initializer9 = applyDecoratedInitializer(_class4.prototype, "_animationName", [serializable], function () {
  return '';
}), _initializer0 = applyDecoratedInitializer(_class4.prototype, "_animationIndexValue", [serializable], function () {
  return 0;
}), _initializer1 = applyDecoratedInitializer(_class4.prototype, "_defaultCacheModeValue", [serializable], function () {
  return AnimationCacheMode.REALTIME;
}), _initializer10 = applyDecoratedInitializer(_class4.prototype, "_timeScale", [serializable], function () {
  return 1;
}), _initializer11 = applyDecoratedInitializer(_class4.prototype, "_playTimes", [serializable], function () {
  return -1;
}), _initializer12 = applyDecoratedInitializer(_class4.prototype, "_debugBones", [serializable], function () {
  return false;
}), _initializer13 = applyDecoratedInitializer(_class4.prototype, "_enableBatch", [serializable], function () {
  return false;
}), _initializer14 = applyDecoratedInitializer(_class4.prototype, "_sockets", [serializable], function () {
  return [];
}), _applyDecoratedDescriptor(_class4.prototype, "customMaterial", [override, _dec9], Object.getOwnPropertyDescriptor(_class4.prototype, "customMaterial"), _class4.prototype), _class4)) || _class3);
cclegacy.internal.ArmatureDisplay = ArmatureDisplay;

var NEED_COLOR = 0x01;
var _boneColor = new Color(255, 0, 0, 255);
var _slotColor = new Color(0, 0, 255, 255);
var _originColor = new Color(0, 255, 0, 255);
var _nodeR;
var _nodeG;
var _nodeB;
var _nodeA;
var _premultipliedAlpha;
var _mustFlush;
var _renderData;
var _ibuf;
var _vbuf;
var _comp;
var _vertexFloatCount = 0;
var _vertexCount = 0;
var _vertexOffset = 0;
var _vertexFloatOffset = 0;
var _indexCount = 0;
var _indexOffset = 0;
var _actualVCount = 0;
var _actualICount = 0;
var _prevDrawIndexOffset = 0;
var LOCAL_FLOAT_PER_VERTEX = 4;
var PER_VERTEX_SIZE = 3 + 2 + 4;
var _c = new Float32Array(4);
var _handleVal;
var _tempVecPos = new Vec3(0, 0, 0);
var _slotMat = new Mat4();
var _currentMaterial = null;
var _currentTexture = null;
function _getSlotMaterial(tex, blendMode) {
  if (!tex) return null;
  var src;
  var dst;
  switch (blendMode) {
    case 1:
      src = _premultipliedAlpha ? BlendFactor.ONE : BlendFactor.SRC_ALPHA;
      dst = BlendFactor.ONE;
      break;
    case 10:
      src = BlendFactor.DST_COLOR;
      dst = BlendFactor.ONE_MINUS_SRC_ALPHA;
      break;
    case 12:
      src = BlendFactor.ONE;
      dst = BlendFactor.ONE_MINUS_SRC_COLOR;
      break;
    case 0:
    default:
      src = _premultipliedAlpha ? BlendFactor.ONE : BlendFactor.SRC_ALPHA;
      dst = BlendFactor.ONE_MINUS_SRC_ALPHA;
      break;
  }
  return _comp.getMaterialForBlend(src, dst);
}
function _handleColor(color, parentOpacity) {
  var _a = color.a * parentOpacity * _nodeA;
  var _multiply = _premultipliedAlpha ? _a / 255.0 : 1.0;
  var _r = color.r * _nodeR * _multiply / 255.0;
  var _g = color.g * _nodeG * _multiply / 255.0;
  var _b = color.b * _nodeB * _multiply / 255.0;
  _c[0] = _r;
  _c[1] = _g;
  _c[2] = _b;
  _c[3] = _premultipliedAlpha ? 1.0 : _a / 255.0;
}
var _accessor = null;
var Simple = function () {
  function Simple() {
    this.accessor = _accessor;
    this.vCount = 32767;
  }
  var _proto = Simple.prototype;
  _proto.ensureAccessor = function ensureAccessor() {
    if (!_accessor) {
      var device = director.root.device;
      var batcher = director.root.batcher2D;
      var attributes = vfmtPosUvColor;
      this.accessor = _accessor = new StaticVBAccessor(device, attributes, this.vCount);
      batcher.registerBufferAccessor(Number.parseInt('DRAGONBONES', 36), _accessor);
    }
    return this.accessor;
  };
  _proto.createData = function createData(comp) {
    var rd = comp.renderData;
    if (!rd) {
      this.ensureAccessor();
      var slots = comp._armature._slots;
      var vCount = 0;
      var iCount = 0;
      for (var i = 0; i < slots.length; ++i) {
        var slot = slots[i];
        var remainder = slot._localVertices.length % 4;
        if (remainder === 0) {
          vCount += slot._localVertices.length / LOCAL_FLOAT_PER_VERTEX;
        } else {
          vCount += (slot._localVertices.length - remainder) / LOCAL_FLOAT_PER_VERTEX + 1;
        }
        iCount += slot._indices.length;
      }
      rd = RenderData.add(vfmtPosUvColor, this.accessor);
      rd.resize(vCount, iCount);
      if (!rd.indices || iCount !== rd.indices.length) {
        rd.indices = new Uint16Array(iCount);
      }
    }
    return rd;
  };
  _proto.updateRenderData = function updateRenderData(comp) {
    _comp = comp;
    var armature = comp._armature;
    if (armature) {
      updateComponentRenderData(comp);
    }
  };
  _proto.updateColor = function updateColor(comp) {
    if (!comp) return;
    _comp = comp;
    _comp._markForUpdateRenderData();
  };
  return Simple;
}();
var simple = new Simple();
function realTimeTraverse(armature, parentOpacity, worldMat) {
  var rd = _renderData;
  if (!rd) return;
  _vbuf = rd.chunk.vb;
  _ibuf = rd.indices;
  var slots = armature._slots;
  var material;
  var vertices;
  var indices;
  var slotColor;
  var slot;
  var cumulatedCount = 0;
  for (var i = 0, l = slots.length; i < l; i++) {
    slot = slots[i];
    slotColor = slot._color;
    if (!slot._visible || !slot._displayData) continue;
    if (worldMat) {
      Mat4.multiply(slot._worldMatrix, worldMat, slot._matrix);
    } else {
      Mat4.copy(slot._worldMatrix, slot._matrix);
    }
    if (slot.childArmature) {
      realTimeTraverse(slot.childArmature, slotColor.a / 255, slot._worldMatrix);
      continue;
    }
    material = _getSlotMaterial(slot.getTexture(), slot._blendMode);
    if (!material) {
      continue;
    }
    if (!_currentMaterial) _currentMaterial = material;
    var texture = slot.getTexture();
    if (_mustFlush || material.hash !== _currentMaterial.hash || texture && _currentTexture !== texture) {
      _mustFlush = false;
      var _cumulatedCount = _indexOffset - _prevDrawIndexOffset;
      if (_cumulatedCount > 0) {
        _comp._requestDrawData(_currentMaterial, _currentTexture, _prevDrawIndexOffset, _cumulatedCount);
        _prevDrawIndexOffset = _indexOffset;
      }
      _currentTexture = texture;
      _currentMaterial = material;
    }
    _handleColor(slotColor, parentOpacity);
    _slotMat.set(slot._worldMatrix);
    vertices = slot._localVertices;
    _vertexCount = vertices.length / LOCAL_FLOAT_PER_VERTEX;
    _vertexFloatCount = _vertexCount * PER_VERTEX_SIZE;
    indices = slot._indices;
    _indexCount = indices.length;
    var isResize = false;
    if (_vertexOffset + _vertexCount > _actualVCount) {
      _actualVCount = _vertexOffset + _vertexCount;
      isResize = true;
    }
    if (_indexOffset + _indexCount > _actualICount) {
      _actualICount = _indexOffset + _indexCount;
      isResize = true;
    }
    if (isResize) {
      var oldIndices = _ibuf;
      var oldChunkOffset = rd.chunk.vertexOffset;
      rd.resizeAndCopy(_actualVCount, _actualICount > rd.indexCount ? _actualICount : rd.indexCount);
      _vbuf = rd.chunk.vb;
      if (_actualICount > _ibuf.length) {
        _ibuf = rd.indices = new Uint16Array(_actualICount);
      }
      var correction = rd.chunk.vertexOffset - oldChunkOffset;
      for (var _i = 0; _i < _indexOffset; ++_i) {
        _ibuf[_i] = oldIndices[_i] + correction;
      }
    }
    for (var vi = 0, vl = vertices.length, v = _vertexFloatOffset; vi < vl; v += PER_VERTEX_SIZE) {
      _tempVecPos.x = vertices[vi++];
      _tempVecPos.y = vertices[vi++];
      _tempVecPos.z = 0;
      _tempVecPos.transformMat4(_slotMat);
      _vbuf[v] = _tempVecPos.x;
      _vbuf[v + 1] = _tempVecPos.y;
      _vbuf[v + 2] = _tempVecPos.z;
      _vbuf[v + 3] = vertices[vi++];
      _vbuf[v + 4] = vertices[vi++];
      _vbuf.set(_c, v + 5);
    }
    var chunkOffset = rd.chunk.vertexOffset;
    for (var _i2 = 0, il = indices.length, ii = _indexOffset; _i2 < il; _i2++, ii++) {
      _ibuf[ii] = _vertexOffset + indices[_i2] + chunkOffset;
    }
    _vertexFloatOffset += _vertexFloatCount;
    _vertexOffset += _vertexCount;
    _indexOffset += _indexCount;
    _vertexCount = 0;
    _indexCount = 0;
  }
  cumulatedCount = _indexOffset - _prevDrawIndexOffset;
  if (_currentTexture && cumulatedCount > 0) {
    _comp._requestDrawData(_currentMaterial, _currentTexture, _prevDrawIndexOffset, cumulatedCount);
    _prevDrawIndexOffset = _indexOffset;
  }
  if (_comp.maxIndexCount < _actualICount) {
    _comp.maxIndexCount = _actualICount;
  }
  if (_comp.maxVertexCount < _actualVCount) {
    _comp.maxVertexCount = _actualVCount;
  }
}
function cacheTraverse(frame, parentMat) {
  if (!frame) return;
  var segments = frame.segments;
  var rd = _renderData;
  if (segments.length === 0 || !rd) return;
  var material = null;
  var vertices = frame.vertices;
  var indices = frame.indices;
  var chunkOffset = 0;
  var frameVFOffset = 0;
  var frameIndexOffset = 0;
  var segVFCount = 0;
  var colorOffset = 0;
  var colors = frame.colors;
  var nowColor = colors[colorOffset++];
  var maxVFOffset = nowColor.vfOffset;
  _handleColor(nowColor, 1.0);
  var vbuf = rd.chunk.vb;
  var ibuf = rd.indices;
  for (var i = 0, n = segments.length; i < n; i++) {
    var segInfo = segments[i];
    material = _getSlotMaterial(segInfo.tex, segInfo.blendMode);
    if (!material) continue;
    if (!_currentMaterial) _currentMaterial = material;
    if (_mustFlush || material.hash !== _currentMaterial.hash || segInfo.tex && segInfo.tex !== _currentTexture) {
      _mustFlush = false;
      var _cumulatedCount2 = _indexOffset - _prevDrawIndexOffset;
      if (_cumulatedCount2 > 0) {
        _comp._requestDrawData(_currentMaterial, _currentTexture, _prevDrawIndexOffset, _cumulatedCount2);
        _prevDrawIndexOffset = _indexOffset;
      }
      _currentMaterial = material;
      _currentTexture = segInfo.tex;
    }
    _vertexCount = segInfo.vertexCount;
    _indexCount = segInfo.indexCount;
    chunkOffset = rd.chunk.vertexOffset;
    for (var ii = _indexOffset, il = _indexOffset + _indexCount; ii < il; ii++) {
      ibuf[ii] = chunkOffset + _vertexOffset + indices[frameIndexOffset++];
    }
    segVFCount = segInfo.vfCount;
    var subArray = vertices.subarray(frameVFOffset, segVFCount);
    vbuf.set(subArray, frameVFOffset);
    var offset = 0;
    if (parentMat) {
      for (var _ii = 0, _il = _vertexCount; _ii < _il; _ii++) {
        _tempVecPos.x = vbuf[offset];
        _tempVecPos.y = vbuf[offset + 1];
        _tempVecPos.z = 0;
        _tempVecPos.transformMat4(parentMat);
        vbuf[offset] = _tempVecPos.x;
        vbuf[offset + 1] = _tempVecPos.y;
        vbuf[offset + 2] = _tempVecPos.z;
        offset += PER_VERTEX_SIZE;
      }
    }
    if (_handleVal & NEED_COLOR) {
      var frameColorOffset = frameVFOffset / 9 * 5;
      for (var _ii2 = frameVFOffset, iEnd = frameVFOffset + segVFCount; _ii2 < iEnd; _ii2 += PER_VERTEX_SIZE, frameColorOffset += 5) {
        if (frameColorOffset >= maxVFOffset) {
          nowColor = colors[colorOffset++];
          _handleColor(nowColor, 1.0);
          maxVFOffset = nowColor.vfOffset;
        }
        vbuf.set(_c, _ii2 + 5);
      }
    }
    frameVFOffset += segVFCount;
    _vertexOffset += _vertexCount;
    _indexOffset += _indexCount;
    _vertexCount = 0;
    _indexCount = 0;
  }
  var cumulatedCount = _indexOffset - _prevDrawIndexOffset;
  if (_currentTexture && cumulatedCount > 0) {
    _comp._requestDrawData(_currentMaterial, _currentTexture, _prevDrawIndexOffset, cumulatedCount);
  }
}
function updateComponentRenderData(comp) {
  var armature = comp._armature;
  if (!armature || comp.renderData === null) return;
  _mustFlush = true;
  _premultipliedAlpha = comp.premultipliedAlpha;
  comp.drawList.reset();
  _comp = comp;
  comp.node;
  _renderData = comp.renderData;
  _comp = comp;
  _handleVal = 0;
  _currentMaterial = null;
  var nodeColor = comp.color;
  _nodeR = nodeColor.r / 255;
  _nodeG = nodeColor.g / 255;
  _nodeB = nodeColor.b / 255;
  _nodeA = comp.node._uiProps.opacity;
  if (Color.toUint32(nodeColor) !== 0xffffffff) {
    _handleVal |= NEED_COLOR;
  }
  var worldMat = comp.node.getWorldMatrix();
  _vertexFloatCount = 0;
  _vertexOffset = 0;
  _vertexFloatOffset = 0;
  _indexCount = 0;
  _indexOffset = 0;
  _prevDrawIndexOffset = 0;
  _actualVCount = _comp.maxVertexCount;
  _actualICount = _comp.maxIndexCount;
  if (comp.isAnimationCached()) {
    cacheTraverse(comp._curFrame, worldMat);
  } else {
    realTimeTraverse(armature, 1.0, worldMat);
    var graphics = comp._debugDraw;
    if (comp.debugBones && graphics) {
      graphics.clear();
      graphics.lineWidth = 5;
      graphics.strokeColor = _boneColor;
      graphics.fillColor = _slotColor;
      var bones = armature.getBones();
      for (var i = 0, l = bones.length; i < l; i++) {
        var bone = bones[i];
        var boneLength = Math.max(bone.boneData.length, 5);
        var startX = bone.globalTransformMatrix.tx;
        var startY = bone.globalTransformMatrix.ty;
        var endX = startX + bone.globalTransformMatrix.a * boneLength;
        var endY = startY + bone.globalTransformMatrix.b * boneLength;
        graphics.moveTo(startX, startY);
        graphics.lineTo(endX, endY);
        graphics.stroke();
        graphics.circle(startX, startY, Math.PI * 2);
        graphics.fill();
        if (i === 0) {
          graphics.fillColor = _originColor;
        }
      }
    }
  }
  _accessor.getMeshBuffer(_renderData.chunk.bufferId).setDirty();
  _comp = undefined;
}
cclegacy.internal.DragonBonesAssembler = simple;

var simpleDragonBoneAssembler = {
  getAssembler: function getAssembler() {
    return simple;
  }
};
ArmatureDisplay.Assembler = simpleDragonBoneAssembler;

var ExtensionType;
(function (ExtensionType) {
  ExtensionType[ExtensionType["FFD"] = 0] = "FFD";
  ExtensionType[ExtensionType["AdjustColor"] = 10] = "AdjustColor";
  ExtensionType[ExtensionType["BevelFilter"] = 11] = "BevelFilter";
  ExtensionType[ExtensionType["BlurFilter"] = 12] = "BlurFilter";
  ExtensionType[ExtensionType["DropShadowFilter"] = 13] = "DropShadowFilter";
  ExtensionType[ExtensionType["GlowFilter"] = 14] = "GlowFilter";
  ExtensionType[ExtensionType["GradientBevelFilter"] = 15] = "GradientBevelFilter";
  ExtensionType[ExtensionType["GradientGlowFilter"] = 16] = "GradientGlowFilter";
})(ExtensionType || (ExtensionType = {}));
var DragonBonesEventType;
(function (DragonBonesEventType) {
  DragonBonesEventType[DragonBonesEventType["Frame"] = 0] = "Frame";
  DragonBonesEventType[DragonBonesEventType["Sound"] = 1] = "Sound";
})(DragonBonesEventType || (DragonBonesEventType = {}));
var EventType = DragonBonesEventType;
var AnimationFadeOutMode;
(function (AnimationFadeOutMode) {
  AnimationFadeOutMode[AnimationFadeOutMode["None"] = 0] = "None";
  AnimationFadeOutMode[AnimationFadeOutMode["SameLayer"] = 1] = "SameLayer";
  AnimationFadeOutMode[AnimationFadeOutMode["SameGroup"] = 2] = "SameGroup";
  AnimationFadeOutMode[AnimationFadeOutMode["SameLayerAndGroup"] = 3] = "SameLayerAndGroup";
  AnimationFadeOutMode[AnimationFadeOutMode["All"] = 4] = "All";
})(AnimationFadeOutMode || (AnimationFadeOutMode = {}));

var index = /*#__PURE__*/_mergeNamespaces({
    __proto__: null,
    AnimationCache: AnimationCache,
    get AnimationCacheMode () { return AnimationCacheMode; },
    get AnimationFadeOutMode () { return AnimationFadeOutMode; },
    ArmatureCache: ArmatureCache,
    ArmatureDisplay: ArmatureDisplay,
    AttachUtil: AttachUtil,
    CCArmatureDisplay: CCArmatureDisplay,
    CCFactory: CCFactory,
    CCSlot: CCSlot,
    CCTextureAtlasData: CCTextureAtlasData,
    CCTextureData: CCTextureData,
    DragonBoneSocket: DragonBoneSocket,
    DragonBonesAsset: DragonBonesAsset,
    DragonBonesAtlasAsset: DragonBonesAtlasAsset,
    get DragonBonesEventType () { return DragonBonesEventType; },
    EventType: EventType,
    get ExtensionType () { return ExtensionType; },
    simpleDragonBoneAssembler: simpleDragonBoneAssembler,
    timeScale: timeScale
}, [dragonbonesJs]);

export { index as dragonBones };
//# sourceMappingURL=dragon-bones.js.map
