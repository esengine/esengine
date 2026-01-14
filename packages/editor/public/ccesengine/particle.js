import { _ as _inheritsLoose, a as _createClass, b as _applyDecoratedDescriptor, ac as CCClass, E as Enum, ah as setPropertyEnumType, aD as sign, Q as error, e as warn, l as _createForOfIteratorHelperLoose, R as RecyclePool, k as errorID, w as warnID, P as Pool, az as INT_MAX, q as CCFloat, p as CCInteger, C as CCBoolean, m as setClassAlias } from './gc-object-CShF5lzx.js';
import { c as ccclass$1, t as type$1, C as Color, h as toRadian, Y as toDegree, b as applyDecoratedInitializer, s as serializable$1, g as Vec4, f as Vec3, ab as lerp, A as approx, E as EPSILON, b7 as constructLegacyCurveAndConvert, b8 as AnimationCurve, aE as RealCurve, aN as Gradient, L as override, V as Vec2, Q as Quat, M as Mat4, ad as randomRange, X as random, ae as randomRangeInt, af as pseudoRandom, ai as repeat, k as formerlySerializedAs, aj as pingPong, a as clamp, u as v3, J as AABB, F as intersect, l as executionOrder, j as removeProperty, i as replaceProperty } from './index-uXI1_UMk.js';
import { E as EDITOR, a as EDITOR_NOT_IN_PREVIEW } from './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { b as Material, d as builtinResMgr, i as Texture2D, I as ImageAsset, P as PixelFormat, j as TextureFilter, W as WrapMode, M as MaterialInstance, K as getBindingFromHandle, T as TransformBit, N as Node } from './scene-vWcxM1_c.js';
import { M as Model, d as ModelType } from './deprecated-n0w4kK7g.js';
import './prefab-DYg_oxpo.js';
import { _ as _createMesh } from './create-mesh-CfKC5EQd.js';
import { g as RenderingSubMesh } from './debug-view-BuNhRPv_.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { A as Attribute, y as PrimitiveMode, a as AttributeName, F as Format, x as FormatInfos, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, aa as Feature, $ as API, _ as FormatFeatureBit } from './buffer-barrier-BlQXg9Aa.js';
import './deprecated-CN-RjLP6.js';
import './deprecated-CzzdLkmW.js';
import './camera-component-BFt9vSC_.js';
import { M as ModelRenderer } from './model-renderer-BBapFDY7.js';
import { R as Renderer } from './renderer-C7HM72NY.js';
import './3d.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import { M as Mesh } from './mesh-XWfHgs1t.js';
import './util-Cxn5lV0H.js';
import './skeleton-CBhmWmEt.js';
import { i as instantiate } from './instantiate-DAIJ1YBG.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './touch-BKrZ-fxl.js';
import './mesh-renderer-CdPG3X-W.js';
import './deprecated-BJz7DUMw.js';
import './deprecated-Dswa7XeN.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './capsule-9D-8tsOp.js';

var _dec$g, _dec2$f, _dec3$d, _class$g, _class2$f, _initializer$f, _initializer2$f, _initializer3$e, _initializer4$e, _initializer5$d;
var Billboard = (_dec$g = ccclass$1('cc.Billboard'), _dec2$f = type$1(Texture2D), _dec3$d = type$1(Texture2D), _dec$g(_class$g = (_class2$f = function (_Component) {
  function Billboard() {
    var _this;
    _this = _Component.call(this) || this;
    _this._texture = _initializer$f && _initializer$f();
    _this._height = _initializer2$f && _initializer2$f();
    _this._width = _initializer3$e && _initializer3$e();
    _this._rotation = _initializer4$e && _initializer4$e();
    _this._techIndex = _initializer5$d && _initializer5$d();
    _this._model = null;
    _this._mesh = null;
    _this._material = null;
    _this._uniform = new Vec4(1, 1, 0, 0);
    return _this;
  }
  _inheritsLoose(Billboard, _Component);
  var _proto = Billboard.prototype;
  _proto.updateTexture = function updateTexture() {
    if (this._material) {
      this._material.setProperty('mainTexture', this._texture);
    }
  };
  _proto.updateHeight = function updateHeight() {
    if (this._material) {
      this._uniform.y = this._height;
      this._material.setProperty('cc_size_rotation', this._uniform);
    }
  };
  _proto.updateWidth = function updateWidth() {
    if (this._material) {
      this._uniform.x = this._width;
      this._material.setProperty('cc_size_rotation', this._uniform);
    }
  };
  _proto.updateRotation = function updateRotation() {
    if (this._material) {
      this._uniform.z = this._rotation;
      this._material.setProperty('cc_size_rotation', this._uniform);
    }
  };
  _proto.updateTechnique = function updateTechnique() {
    if (this._model && this._mesh && this._material && this._material.technique !== this._techIndex) {
      this.detachFromScene();
      this._model.destroy();
      this._model = null;
      this._material.destroy();
      this._material = null;
      this._mesh.destroy();
      this._mesh = null;
      this.createModel();
      this.updateWidth();
      this.updateHeight();
      this.updateRotation();
      this.updateTexture();
      if (this.enabled) {
        this.attachToScene();
        this._model.enabled = true;
      } else {
        this._model.enabled = false;
      }
    }
  };
  _proto.onLoad = function onLoad() {
    this.createModel();
  };
  _proto.onEnable = function onEnable() {
    this.attachToScene();
    this._model.enabled = true;
    this.updateWidth();
    this.updateHeight();
    this.updateRotation();
    this.updateTexture();
    this.updateTechnique();
  };
  _proto.onDisable = function onDisable() {
    this.detachFromScene();
  };
  _proto.attachToScene = function attachToScene() {
    if (this._model && this.node && this.node.scene) {
      if (this._model.scene) {
        this.detachFromScene();
      }
      this._getRenderScene().addModel(this._model);
    }
  };
  _proto.detachFromScene = function detachFromScene() {
    if (this._model && this._model.scene) {
      this._model.scene.removeModel(this._model);
    }
  };
  _proto.createModel = function createModel() {
    this._mesh = _createMesh({
      primitiveMode: PrimitiveMode.TRIANGLE_LIST,
      positions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      uvs: [0, 0, 1, 0, 0, 1, 1, 1],
      colors: [Color.WHITE.r, Color.WHITE.g, Color.WHITE.b, Color.WHITE.a, Color.WHITE.r, Color.WHITE.g, Color.WHITE.b, Color.WHITE.a, Color.WHITE.r, Color.WHITE.g, Color.WHITE.b, Color.WHITE.a, Color.WHITE.r, Color.WHITE.g, Color.WHITE.b, Color.WHITE.a],
      attributes: [new Attribute(AttributeName.ATTR_POSITION, Format.RGB32F), new Attribute(AttributeName.ATTR_TEX_COORD, Format.RG32F), new Attribute(AttributeName.ATTR_COLOR, Format.RGBA8UI, true)],
      indices: [0, 1, 2, 1, 2, 3]
    }, undefined, {
      calculateBounds: false
    });
    var model = this._model = cclegacy.director.root.createModel(Model);
    model.node = model.transform = this.node;
    if (this._material == null) {
      this._material = new Material();
      this._material.copy(builtinResMgr.get('default-billboard-material'), {
        technique: this._techIndex
      });
    }
    model.initSubModel(0, this._mesh.renderingSubMeshes[0], this._material);
  };
  return _createClass(Billboard, [{
    key: "texture",
    get: function get() {
      return this._texture;
    },
    set: function set(val) {
      this._texture = val;
      this.updateTexture();
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(val) {
      this._height = val;
      this.updateHeight();
    }
  }, {
    key: "width",
    get: function get() {
      return this._width;
    },
    set: function set(val) {
      this._width = val;
      this.updateWidth();
    }
  }, {
    key: "rotation",
    get: function get() {
      return Math.round(toDegree(this._rotation) * 100) / 100;
    },
    set: function set(val) {
      this._rotation = toRadian(val);
      this.updateRotation();
    }
  }, {
    key: "technique",
    get: function get() {
      return this._techIndex;
    },
    set: function set(val) {
      var _this$_material, _this$_material$effec;
      val = Math.floor(val);
      var techs = (_this$_material = this._material) == null ? void 0 : (_this$_material$effec = _this$_material.effectAsset) == null ? void 0 : _this$_material$effec.techniques;
      if (techs && val >= techs.length) {
        val = techs.length - 1;
      }
      if (val < 0) {
        val = 0;
      }
      this._techIndex = val;
      this.updateTechnique();
    }
  }]);
}(Component), _initializer$f = applyDecoratedInitializer(_class2$f.prototype, "_texture", [_dec2$f], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$f.prototype, "texture", [_dec3$d], Object.getOwnPropertyDescriptor(_class2$f.prototype, "texture"), _class2$f.prototype), _initializer2$f = applyDecoratedInitializer(_class2$f.prototype, "_height", [serializable$1], function () {
  return 0;
}), _initializer3$e = applyDecoratedInitializer(_class2$f.prototype, "_width", [serializable$1], function () {
  return 0;
}), _initializer4$e = applyDecoratedInitializer(_class2$f.prototype, "_rotation", [serializable$1], function () {
  return 0;
}), _initializer5$d = applyDecoratedInitializer(_class2$f.prototype, "_techIndex", [serializable$1], function () {
  return 0;
}), _class2$f)) || _class$g);

var _vertex_attrs$1 = [new Attribute(AttributeName.ATTR_POSITION, Format.RGB32F), new Attribute(AttributeName.ATTR_TEX_COORD, Format.RGBA32F), new Attribute(AttributeName.ATTR_TEX_COORD1, Format.RGB32F), new Attribute(AttributeName.ATTR_COLOR, Format.RGBA8, true)];
var _temp_v1 = new Vec3();
var _temp_v2 = new Vec3();
var LineModel = function (_scene$Model) {
  function LineModel() {
    var _this;
    _this = _scene$Model.call(this) || this;
    _this._capacity = void 0;
    _this._vertSize = 0;
    _this._vBuffer = null;
    _this._vertAttrsFloatCount = 0;
    _this._vdataF32 = null;
    _this._vdataUint32 = null;
    _this._subMeshData = null;
    _this._vertCount = 0;
    _this._indexCount = 0;
    _this._material = null;
    _this._iaVertCount = 0;
    _this._iaIndexCount = 0;
    _this.type = ModelType.LINE;
    _this._capacity = 100;
    return _this;
  }
  _inheritsLoose(LineModel, _scene$Model);
  var _proto = LineModel.prototype;
  _proto.setCapacity = function setCapacity(capacity) {
    this._capacity = capacity;
    this.createBuffer();
  };
  _proto.createBuffer = function createBuffer() {
    this._vertSize = 0;
    for (var _i = 0, _vertex_attrs2 = _vertex_attrs$1; _i < _vertex_attrs2.length; _i++) {
      var a = _vertex_attrs2[_i];
      a.offset = this._vertSize;
      this._vertSize += FormatInfos[a.format].size;
    }
    this._vertAttrsFloatCount = this._vertSize / 4;
    this._vBuffer = this.createSubMeshData();
    this._vdataF32 = new Float32Array(this._vBuffer);
    this._vdataUint32 = new Uint32Array(this._vBuffer);
  };
  _proto.updateMaterial = function updateMaterial(mat) {
    this._material = mat;
    _scene$Model.prototype.setSubModelMaterial.call(this, 0, mat);
  };
  _proto.createSubMeshData = function createSubMeshData() {
    if (this._subMeshData) {
      this.destroySubMeshData();
    }
    this._vertCount = 2;
    this._indexCount = 6;
    var vertexBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, this._vertSize * this._capacity * this._vertCount, this._vertSize));
    var vBuffer = new ArrayBuffer(this._vertSize * this._capacity * this._vertCount);
    vertexBuffer.update(vBuffer);
    var indices = new Uint16Array((this._capacity - 1) * this._indexCount);
    var dst = 0;
    for (var i = 0; i < this._capacity - 1; ++i) {
      var baseIdx = 2 * i;
      indices[dst++] = baseIdx;
      indices[dst++] = baseIdx + 1;
      indices[dst++] = baseIdx + 2;
      indices[dst++] = baseIdx + 3;
      indices[dst++] = baseIdx + 2;
      indices[dst++] = baseIdx + 1;
    }
    var indexBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, (this._capacity - 1) * this._indexCount * Uint16Array.BYTES_PER_ELEMENT, Uint16Array.BYTES_PER_ELEMENT));
    indexBuffer.update(indices);
    this._iaVertCount = this._capacity * this._vertCount;
    this._iaIndexCount = (this._capacity - 1) * this._indexCount;
    this._subMeshData = new RenderingSubMesh([vertexBuffer], _vertex_attrs$1, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
    this.initSubModel(0, this._subMeshData, this._material);
    return vBuffer;
  };
  _proto.addLineVertexData = function addLineVertexData(positions, width, color) {
    if (positions.length > 1) {
      var offset = 0;
      Vec3.subtract(_temp_v1, positions[1], positions[0]);
      this._vdataF32[offset++] = positions[0].x;
      this._vdataF32[offset++] = positions[0].y;
      this._vdataF32[offset++] = positions[0].z;
      this._vdataF32[offset++] = 0;
      this._vdataF32[offset++] = width.evaluate(0, 1);
      this._vdataF32[offset++] = 0;
      this._vdataF32[offset++] = 0;
      this._vdataF32[offset++] = _temp_v1.x;
      this._vdataF32[offset++] = _temp_v1.y;
      this._vdataF32[offset++] = _temp_v1.z;
      this._vdataUint32[offset++] = Color.toUint32(color.evaluate(0, 1));
      this._vdataF32[offset++] = positions[0].x;
      this._vdataF32[offset++] = positions[0].y;
      this._vdataF32[offset++] = positions[0].z;
      this._vdataF32[offset++] = 1;
      this._vdataF32[offset++] = width.evaluate(0, 1);
      this._vdataF32[offset++] = 0;
      this._vdataF32[offset++] = 1;
      this._vdataF32[offset++] = _temp_v1.x;
      this._vdataF32[offset++] = _temp_v1.y;
      this._vdataF32[offset++] = _temp_v1.z;
      this._vdataUint32[offset++] = Color.toUint32(color.evaluate(0, 1));
      for (var i = 1; i < positions.length - 1; i++) {
        Vec3.subtract(_temp_v1, positions[i - 1], positions[i]);
        Vec3.subtract(_temp_v2, positions[i + 1], positions[i]);
        Vec3.subtract(_temp_v2, _temp_v2, _temp_v1);
        var seg = i / positions.length;
        this._vdataF32[offset++] = positions[i].x;
        this._vdataF32[offset++] = positions[i].y;
        this._vdataF32[offset++] = positions[i].z;
        this._vdataF32[offset++] = 0;
        this._vdataF32[offset++] = width.evaluate(seg, 1);
        this._vdataF32[offset++] = seg;
        this._vdataF32[offset++] = 0;
        this._vdataF32[offset++] = _temp_v2.x;
        this._vdataF32[offset++] = _temp_v2.y;
        this._vdataF32[offset++] = _temp_v2.z;
        this._vdataUint32[offset++] = Color.toUint32(color.evaluate(seg, 1));
        this._vdataF32[offset++] = positions[i].x;
        this._vdataF32[offset++] = positions[i].y;
        this._vdataF32[offset++] = positions[i].z;
        this._vdataF32[offset++] = 1;
        this._vdataF32[offset++] = width.evaluate(seg, 1);
        this._vdataF32[offset++] = seg;
        this._vdataF32[offset++] = 1;
        this._vdataF32[offset++] = _temp_v2.x;
        this._vdataF32[offset++] = _temp_v2.y;
        this._vdataF32[offset++] = _temp_v2.z;
        this._vdataUint32[offset++] = Color.toUint32(color.evaluate(seg, 1));
      }
      Vec3.subtract(_temp_v1, positions[positions.length - 1], positions[positions.length - 2]);
      this._vdataF32[offset++] = positions[positions.length - 1].x;
      this._vdataF32[offset++] = positions[positions.length - 1].y;
      this._vdataF32[offset++] = positions[positions.length - 1].z;
      this._vdataF32[offset++] = 0;
      this._vdataF32[offset++] = width.evaluate(1, 1);
      this._vdataF32[offset++] = 1;
      this._vdataF32[offset++] = 0;
      this._vdataF32[offset++] = _temp_v1.x;
      this._vdataF32[offset++] = _temp_v1.y;
      this._vdataF32[offset++] = _temp_v1.z;
      this._vdataUint32[offset++] = Color.toUint32(color.evaluate(1, 1));
      this._vdataF32[offset++] = positions[positions.length - 1].x;
      this._vdataF32[offset++] = positions[positions.length - 1].y;
      this._vdataF32[offset++] = positions[positions.length - 1].z;
      this._vdataF32[offset++] = 1;
      this._vdataF32[offset++] = width.evaluate(1, 1);
      this._vdataF32[offset++] = 1;
      this._vdataF32[offset++] = 1;
      this._vdataF32[offset++] = _temp_v1.x;
      this._vdataF32[offset++] = _temp_v1.y;
      this._vdataF32[offset++] = _temp_v1.z;
      this._vdataUint32[offset++] = Color.toUint32(color.evaluate(1, 1));
    }
    this.updateIA(Math.max(0, positions.length - 1));
  };
  _proto.updateIA = function updateIA(count) {
    var ia = this._subModels[0].inputAssembler;
    ia.vertexBuffers[0].update(this._vdataF32);
    ia.firstIndex = 0;
    ia.indexCount = this._indexCount * count;
    ia.vertexCount = this._iaVertCount;
  };
  _proto.destroySubMeshData = function destroySubMeshData() {
    if (this._subMeshData) {
      this._subMeshData.destroy();
      this._subMeshData = null;
    }
  };
  return LineModel;
}(Model);

var _dec$f, _class$f, _CurveRange;
var setClassAttr = CCClass.Attr.setClassAttr;
var SerializableTable$1 = [['mode', 'constant', 'multiplier'], ['mode', 'spline', 'multiplier'], ['mode', 'splineMin', 'splineMax', 'multiplier'], ['mode', 'constantMin', 'constantMax', 'multiplier']];
var Mode$2 = Enum({
  Constant: 0,
  Curve: 1,
  TwoCurves: 2,
  TwoConstants: 3
});
var CurveRange = (_dec$f = ccclass$1('cc.CurveRange'), _dec$f(_class$f = (_CurveRange = function () {
  function CurveRange() {
    this.constant = 0;
    this.constantMin = 0;
    this.constantMax = 0;
    this.multiplier = 1;
    this._mode = Mode$2.Constant;
  }
  var _proto = CurveRange.prototype;
  _proto.evaluate = function evaluate(time, rndRatio) {
    switch (this._mode) {
      default:
      case Mode$2.Constant:
        return this.constant;
      case Mode$2.Curve:
        return this.spline.evaluate(time) * this.multiplier;
      case Mode$2.TwoCurves:
        return lerp(this.splineMin.evaluate(time), this.splineMax.evaluate(time), rndRatio) * this.multiplier;
      case Mode$2.TwoConstants:
        return lerp(this.constantMin, this.constantMax, rndRatio);
    }
  };
  _proto.getMax = function getMax() {
    switch (this._mode) {
      default:
      case Mode$2.Constant:
        return this.constant;
      case Mode$2.Curve:
        return this.multiplier;
      case Mode$2.TwoConstants:
        return this.constantMax;
      case Mode$2.TwoCurves:
        return this.multiplier;
    }
  };
  _proto.isZero = function isZero() {
    switch (this._mode) {
      default:
      case Mode$2.Constant:
        return approx(this.constant, 0.0, EPSILON);
      case Mode$2.Curve:
        return approx(this.multiplier, 0.0, EPSILON);
      case Mode$2.TwoConstants:
        return approx(Math.max(Math.abs(this.constantMax), Math.abs(this.constantMin)), 0.0, EPSILON);
      case Mode$2.TwoCurves:
        return approx(this.multiplier, 0.0, EPSILON);
    }
  };
  _proto._onBeforeSerialize = function _onBeforeSerialize(props) {
    return SerializableTable$1[this._mode];
  };
  return _createClass(CurveRange, [{
    key: "mode",
    get: function get() {
      return this._mode;
    },
    set: function set(mode) {
      this._mode = mode;
      switch (mode) {
        case Mode$2.Constant:
          break;
        case Mode$2.TwoConstants:
          break;
        case Mode$2.Curve:
          if (!this.spline) this.spline = constructLegacyCurveAndConvert();
          break;
        case Mode$2.TwoCurves:
          if (!this.splineMax) this.splineMax = constructLegacyCurveAndConvert();
          if (!this.splineMin) this.splineMin = constructLegacyCurveAndConvert();
          break;
      }
    }
  }, {
    key: "curve",
    get: function get() {
      var _this$_curve;
      return (_this$_curve = this._curve) !== null && _this$_curve !== void 0 ? _this$_curve : this._curve = new AnimationCurve(this.spline);
    },
    set: function set(value) {
      this._curve = value;
      this.spline = value._internalCurve;
    }
  }, {
    key: "curveMin",
    get: function get() {
      var _this$_curveMin;
      return (_this$_curveMin = this._curveMin) !== null && _this$_curveMin !== void 0 ? _this$_curveMin : this._curveMin = new AnimationCurve(this.splineMin);
    },
    set: function set(value) {
      this._curveMin = value;
      this.splineMin = value._internalCurve;
    }
  }, {
    key: "curveMax",
    get: function get() {
      var _this$_curveMax;
      return (_this$_curveMax = this._curveMax) !== null && _this$_curveMax !== void 0 ? _this$_curveMax : this._curveMax = new AnimationCurve(this.splineMax);
    },
    set: function set(value) {
      this._curveMax = value;
      this.splineMax = value._internalCurve;
    }
  }]);
}(), _CurveRange.Mode = Mode$2, _CurveRange)) || _class$f);
CCClass.fastDefine('cc.CurveRange', CurveRange, {
  multiplier: 1,
  constantMax: 0,
  constantMin: 0,
  constant: 0,
  mode: Mode$2.Constant,
  splineMax: Object.freeze(constructLegacyCurveAndConvert()),
  splineMin: Object.freeze(constructLegacyCurveAndConvert()),
  spline: Object.freeze(constructLegacyCurveAndConvert())
});
setClassAttr(CurveRange, 'multiplier', 'visible', true);
setClassAttr(CurveRange, 'constantMax', 'visible', true);
setClassAttr(CurveRange, 'constantMin', 'visible', true);
setClassAttr(CurveRange, 'constant', 'visible', true);
setPropertyEnumType(CurveRange, 'mode', Mode$2);
setClassAttr(CurveRange, 'mode', 'visible', true);
setClassAttr(CurveRange, 'splineMax', 'type', 'Object');
setClassAttr(CurveRange, 'splineMax', 'ctor', RealCurve);
setClassAttr(CurveRange, 'splineMax', 'visible', true);
setClassAttr(CurveRange, 'splineMin', 'type', 'Object');
setClassAttr(CurveRange, 'splineMin', 'ctor', RealCurve);
setClassAttr(CurveRange, 'splineMin', 'visible', true);
setClassAttr(CurveRange, 'spline', 'type', 'Object');
setClassAttr(CurveRange, 'spline', 'ctor', RealCurve);
setClassAttr(CurveRange, 'spline', 'visible', true);
function evaluateCurve(cr, time, index) {
  switch (cr.mode) {
    case Mode$2.Constant:
      return cr.constant;
    case Mode$2.Curve:
      return cr.spline.evaluate(time) * cr.multiplier;
    case Mode$2.TwoCurves:
      return index === 0 ? cr.splineMin.evaluate(time) * cr.multiplier : cr.splineMax.evaluate(time) * cr.multiplier;
    case Mode$2.TwoConstants:
      return index === 0 ? cr.constantMin : cr.constantMax;
    default:
      return 0;
  }
}
function evaluateHeight$1(cr) {
  switch (cr.mode) {
    case Mode$2.TwoConstants:
      return 2;
    case Mode$2.TwoCurves:
      return 2;
    default:
      return 1;
  }
}
function packTexture(data, width, height) {
  var image = new ImageAsset({
    width: width,
    height: height,
    _data: data,
    _compressed: false,
    format: PixelFormat.RGBA32F
  });
  var texture = new Texture2D();
  texture.setFilters(TextureFilter.NEAREST, TextureFilter.NEAREST);
  texture.setMipFilter(TextureFilter.NONE);
  texture.setWrapMode(WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE);
  texture.image = image;
  return texture;
}
function updateTexture(tex, data, width, height) {
  if (tex === null || width !== tex.width || height !== tex.height) {
    if (tex) {
      tex.destroy();
    }
    tex = packTexture(data, width, height);
  } else {
    tex.uploadData(data);
  }
  return tex;
}
function packCurveRangeZ(tex, data, samples, cr, discrete) {
  var height = evaluateHeight$1(cr);
  var len = samples * height * 4;
  if (data === null || data.length !== len) {
    data = new Float32Array(samples * height * 4);
  }
  var interval = 1.0 / (samples - 1);
  var offset = 0;
  for (var h = 0; h < height; h++) {
    for (var j = 0; j < samples; j++) {
      var value = evaluateCurve(cr, interval * j, h);
      data[offset + 2] = value;
      offset += 4;
    }
  }
  return {
    texture: updateTexture(tex, data, samples, height),
    texdata: data
  };
}
function packCurveRangeN(tex, data, samples, cr, discrete) {
  var height = evaluateHeight$1(cr);
  var len = samples * height * 4;
  if (data === null || data.length !== len) {
    data = new Float32Array(samples * height * 4);
  }
  var interval = 1.0 / (samples - 1);
  var average = 0;
  var offset = 0;
  for (var h = 0; h < height; h++) {
    for (var j = 0; j < samples; j++) {
      var value = evaluateCurve(cr, interval * j, h);
      {
        average = value;
      }
      data[offset] = average;
      data[offset + 1] = average;
      data[offset + 2] = average;
      offset += 4;
    }
  }
  return {
    texture: updateTexture(tex, data, samples, height),
    texdata: data
  };
}
function packCurveRangeXY(tex, data, samples, x, y, discrete) {
  var height = Math.max(evaluateHeight$1(x), evaluateHeight$1(y));
  var len = samples * height * 4;
  if (data === null || data.length !== len) {
    data = new Float32Array(samples * height * 4);
  }
  var curves = [x, y];
  var interval = 1.0 / (samples - 1);
  for (var h = 0; h < height; h++) {
    for (var i = 0; i < 2; i++) {
      var cr = curves[i];
      var average = 0;
      for (var j = 0; j < samples; j++) {
        var value = evaluateCurve(cr, interval * j, h);
        {
          average = value;
        }
        data[(h * samples + j) * 4 + i] = average;
      }
    }
  }
  return {
    texture: updateTexture(tex, data, samples, height),
    texdata: data
  };
}
function packCurveRangeXYZ(tex, data, samples, x, y, z, discrete) {
  var height = Math.max(evaluateHeight$1(x), evaluateHeight$1(y), evaluateHeight$1(z));
  var len = samples * height * 4;
  if (data === null || data.length !== len) {
    data = new Float32Array(samples * height * 4);
  }
  var curves = [x, y, z];
  var interval = 1.0 / (samples - 1);
  for (var h = 0; h < height; h++) {
    for (var i = 0; i < 3; i++) {
      var cr = curves[i];
      var sum = 0;
      var average = 0;
      for (var j = 0; j < samples; j++) {
        var value = evaluateCurve(cr, interval * j, h);
        if (discrete) {
          average = value;
        } else {
          sum += value;
          average = sum / (j + 1);
        }
        data[(h * samples + j) * 4 + i] = average;
      }
    }
  }
  return {
    texture: updateTexture(tex, data, samples, height),
    texdata: data
  };
}
function packCurveRangeXYZW(tex, data, samples, x, y, z, w, discrete) {
  var height = Math.max(evaluateHeight$1(x), evaluateHeight$1(y), evaluateHeight$1(z), evaluateHeight$1(w));
  var len = samples * height * 4;
  if (data === null || data.length !== len) {
    data = new Float32Array(samples * height * 4);
  }
  var curves = [x, y, z, w];
  var interval = 1.0 / (samples - 1);
  for (var h = 0; h < height; h++) {
    for (var i = 0; i < 4; i++) {
      var cr = curves[i];
      var sum = 0;
      var average = 0;
      for (var j = 0; j < samples; j++) {
        var value = evaluateCurve(cr, interval * j, h);
        {
          sum += value;
          average = sum / (j + 1);
        }
        data[(h * samples + j) * 4 + i] = average;
      }
    }
  }
  return {
    texture: updateTexture(tex, data, samples, height),
    texdata: data
  };
}

var _dec$e, _dec2$e, _dec3$c, _dec4$c, _dec5$b, _dec6$9, _class$e, _class2$e, _initializer$e, _initializer2$e, _initializer3$d, _initializer4$d, _initializer5$c, _initializer6$a, _initializer7$8, _GradientRange;
var SerializableTable = EDITOR;
var Mode$1 = Enum({
  Color: 0,
  Gradient: 1,
  TwoColors: 2,
  TwoGradients: 3,
  RandomColor: 4
});
var tempColor = new Color();
var tempColor2 = new Color();
var GradientRange = (_dec$e = ccclass$1('cc.GradientRange'), _dec2$e = type$1(Mode$1), _dec3$c = type$1(Gradient), _dec4$c = type$1(Gradient), _dec5$b = type$1(Gradient), _dec6$9 = type$1(Mode$1), _dec$e(_class$e = (_class2$e = (_GradientRange = function () {
  function GradientRange() {
    this.color = _initializer$e && _initializer$e();
    this.colorMin = _initializer2$e && _initializer2$e();
    this.colorMax = _initializer3$d && _initializer3$d();
    this.gradient = _initializer4$d && _initializer4$d();
    this.gradientMin = _initializer5$c && _initializer5$c();
    this.gradientMax = _initializer6$a && _initializer6$a();
    this._mode = _initializer7$8 && _initializer7$8();
    this._color = Color.WHITE.clone();
  }
  var _proto = GradientRange.prototype;
  _proto.evaluate = function evaluate(time, rndRatio) {
    switch (this._mode) {
      case Mode$1.Color:
        return this.color;
      case Mode$1.TwoColors:
        Color.lerp(this._color, this.colorMin, this.colorMax, rndRatio);
        return this._color;
      case Mode$1.RandomColor:
        return this.gradient.getRandomColor(this._color);
      case Mode$1.Gradient:
        return this.gradient.evaluateFast(this._color, time);
      case Mode$1.TwoGradients:
        Color.lerp(this._color, this.gradientMin.evaluateFast(tempColor, time), this.gradientMax.evaluateFast(tempColor2, time), rndRatio);
        return this._color;
      default:
        return this.color;
    }
  };
  _proto._onBeforeSerialize = function _onBeforeSerialize(props) {
    return SerializableTable[this._mode];
  };
  return _createClass(GradientRange, [{
    key: "mode",
    get: function get() {
      return this._mode;
    },
    set: function set(m) {
      this._mode = m;
    }
  }]);
}(), _GradientRange.Mode = Mode$1, _GradientRange), _applyDecoratedDescriptor(_class2$e.prototype, "mode", [_dec2$e], Object.getOwnPropertyDescriptor(_class2$e.prototype, "mode"), _class2$e.prototype), _initializer$e = applyDecoratedInitializer(_class2$e.prototype, "color", [serializable$1], function () {
  return Color.WHITE.clone();
}), _initializer2$e = applyDecoratedInitializer(_class2$e.prototype, "colorMin", [serializable$1], function () {
  return Color.WHITE.clone();
}), _initializer3$d = applyDecoratedInitializer(_class2$e.prototype, "colorMax", [serializable$1], function () {
  return Color.WHITE.clone();
}), _initializer4$d = applyDecoratedInitializer(_class2$e.prototype, "gradient", [_dec3$c], function () {
  return new Gradient();
}), _initializer5$c = applyDecoratedInitializer(_class2$e.prototype, "gradientMin", [_dec4$c], function () {
  return new Gradient();
}), _initializer6$a = applyDecoratedInitializer(_class2$e.prototype, "gradientMax", [_dec5$b], function () {
  return new Gradient();
}), _initializer7$8 = applyDecoratedInitializer(_class2$e.prototype, "_mode", [_dec6$9], function () {
  return Mode$1.Color;
}), _class2$e)) || _class$e);
function evaluateGradient(gr, time, index) {
  switch (gr.mode) {
    case Mode$1.Color:
      return gr.color;
    case Mode$1.TwoColors:
      return index === 0 ? gr.colorMin : gr.colorMax;
    case Mode$1.RandomColor:
      return gr.gradient.getRandomColor(tempColor);
    case Mode$1.Gradient:
      return gr.gradient.evaluateFast(tempColor, time);
    case Mode$1.TwoGradients:
      return index === 0 ? gr.gradientMin.evaluateFast(tempColor, time) : gr.gradientMax.evaluateFast(tempColor, time);
    default:
      return gr.color;
  }
}
function evaluateHeight(gr) {
  switch (gr.mode) {
    case Mode$1.TwoColors:
      return 2;
    case Mode$1.TwoGradients:
      return 2;
    default:
      return 1;
  }
}
function packGradientRange(tex, data, samples, gr) {
  var height = evaluateHeight(gr);
  var len = samples * height * 4;
  if (data === null || data.length !== len) {
    data = new Uint8Array(samples * height * 4);
  }
  var interval = 1.0 / (samples - 1);
  var offset = 0;
  for (var h = 0; h < height; h++) {
    for (var j = 0; j < samples; j++) {
      var color = evaluateGradient(gr, interval * j, h);
      data[offset] = color.r;
      data[offset + 1] = color.g;
      data[offset + 2] = color.b;
      data[offset + 3] = color.a;
      offset += 4;
    }
  }
  if (tex === null || samples !== tex.width || height !== tex.height) {
    if (tex) {
      tex.destroy();
    }
    tex = new Texture2D();
    tex.create(samples, height, PixelFormat.RGBA8888);
    tex.setFilters(TextureFilter.LINEAR, TextureFilter.LINEAR);
    tex.setWrapMode(WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE);
  }
  tex.uploadData(data);
  return {
    texture: tex,
    texdata: data
  };
}

var _dec$d, _dec2$d, _dec3$b, _dec4$b, _dec5$a, _dec6$8, _dec7$6, _dec8$5, _dec9$4, _dec0$2, _class$d, _class2$d, _initializer$d, _initializer2$d, _initializer3$c, _initializer4$c, _initializer5$b, _initializer6$9, _initializer7$7, _initializer8$7;
var CC_USE_WORLD_SPACE$2 = 'CC_USE_WORLD_SPACE';
var define = {
  CC_USE_WORLD_SPACE: false,
  CC_USE_WORLD_SCALE: true
};
var Line = (_dec$d = ccclass$1('cc.Line'), _dec2$d = type$1(Texture2D), _dec3$b = type$1(Texture2D), _dec4$b = type$1(Material), _dec5$a = type$1([Vec3]), _dec6$8 = type$1([Vec3]), _dec7$6 = type$1(CurveRange), _dec8$5 = type$1(GradientRange), _dec9$4 = type$1(Vec2), _dec0$2 = type$1(Vec2), _dec$d(_class$d = (_class2$d = function (_ModelRenderer) {
  function Line() {
    var _this;
    _this = _ModelRenderer.call(this) || this;
    _this._texture = _initializer$d && _initializer$d();
    _this._material = _initializer2$d && _initializer2$d();
    _this._worldSpace = _initializer3$c && _initializer3$c();
    _this._positions = _initializer4$c && _initializer4$c();
    _this._width = _initializer5$b && _initializer5$b();
    _this._color = _initializer6$9 && _initializer6$9();
    _this._tile = _initializer7$7 && _initializer7$7();
    _this._tile_offset = new Vec4();
    _this._offset = _initializer8$7 && _initializer8$7();
    return _this;
  }
  _inheritsLoose(Line, _ModelRenderer);
  var _proto = Line.prototype;
  _proto.onLoad = function onLoad() {
    var model = cclegacy.director.root.createModel(LineModel);
    if (this._models.length === 0) {
      this._models.push(model);
    } else {
      this._models[0] = model;
    }
    model.node = model.transform = this.node;
    if (this._material) {
      this.lineMaterial = this._material;
      this._material = null;
    }
    if (this.lineMaterial === null) {
      var mat = builtinResMgr.get('default-trail-material');
      this.material = mat;
    }
    var matIns = this.getMaterialInstance(0);
    if (matIns) {
      define[CC_USE_WORLD_SPACE$2] = this.worldSpace;
      matIns.recompileShaders(define);
      model.updateMaterial(matIns);
    }
    model.setCapacity(100);
  };
  _proto.onEnable = function onEnable() {
    _ModelRenderer.prototype.onEnable.call(this);
    if (this._models.length === 0 || !this._models[0]) {
      return;
    }
    this._attachToScene();
    this.texture = this._texture;
    this.tile = this._tile;
    this.offset = this._offset;
    var lineModel = this._models[0];
    lineModel.addLineVertexData(this._positions, this.width, this.color);
  };
  _proto.onDisable = function onDisable() {
    if (this._models.length > 0 && this._models[0]) {
      this._detachFromScene();
    }
  };
  _proto._attachToScene = function _attachToScene() {
    _ModelRenderer.prototype._attachToScene.call(this);
    if (this._models.length > 0 && this._models[0] && this.node && this.node.scene) {
      var lineModel = this._models[0];
      if (lineModel.scene) {
        this._detachFromScene();
      }
      this._getRenderScene().addModel(lineModel);
    }
  };
  _proto._detachFromScene = function _detachFromScene() {
    _ModelRenderer.prototype._detachFromScene.call(this);
    if (this._models.length > 0 && this._models[0]) {
      var lineModel = this._models[0];
      if (lineModel.scene) {
        lineModel.scene.removeModel(lineModel);
      }
    }
  };
  _proto._onMaterialModified = function _onMaterialModified(index, material) {
    _ModelRenderer.prototype._onMaterialModified.call(this, index, material);
    var matIns = this.getMaterialInstance(0);
    if (matIns) {
      define[CC_USE_WORLD_SPACE$2] = this.worldSpace;
      matIns.recompileShaders(define);
      if (this._models[0]) {
        var lineModel = this._models[0];
        lineModel.updateMaterial(matIns);
      }
    }
  };
  return _createClass(Line, [{
    key: "texture",
    get: function get() {
      return this._texture;
    },
    set: function set(val) {
      this._texture = val;
      if (this.material) {
        this.material.setProperty('mainTexture', val);
      }
    }
  }, {
    key: "lineMaterial",
    get: function get() {
      return this.getSharedMaterial(0);
    },
    set: function set(val) {
      this.setSharedMaterial(val, 0);
    }
  }, {
    key: "sharedMaterials",
    get: function get() {
      return _ModelRenderer.prototype.sharedMaterials;
    },
    set: function set(val) {
      this.sharedMaterials = val;
    }
  }, {
    key: "worldSpace",
    get: function get() {
      return this._worldSpace;
    },
    set: function set(val) {
      this._worldSpace = val;
      var matIns = this.getMaterialInstance(0);
      if (matIns) {
        define[CC_USE_WORLD_SPACE$2] = this.worldSpace;
        matIns.recompileShaders(define);
        if (this._models[0]) {
          this._models[0].setSubModelMaterial(0, matIns);
        }
      }
    }
  }, {
    key: "positions",
    get: function get() {
      return this._positions;
    },
    set: function set(val) {
      this._positions = val;
      if (this._models[0]) {
        var lineModel = this._models[0];
        lineModel.addLineVertexData(this._positions, this.width, this.color);
      }
    }
  }, {
    key: "width",
    get: function get() {
      return this._width;
    },
    set: function set(val) {
      this._width = val;
      if (this._models[0]) {
        var lineModel = this._models[0];
        lineModel.addLineVertexData(this._positions, this._width, this._color);
      }
    }
  }, {
    key: "color",
    get: function get() {
      return this._color;
    },
    set: function set(val) {
      this._color = val;
      if (this._models[0]) {
        var lineModel = this._models[0];
        lineModel.addLineVertexData(this._positions, this._width, this._color);
      }
    }
  }, {
    key: "tile",
    get: function get() {
      return this._tile;
    },
    set: function set(val) {
      this._tile.set(val);
      if (this.material) {
        this._tile_offset.x = this._tile.x;
        this._tile_offset.y = this._tile.y;
        this.material.setProperty('mainTiling_Offset', this._tile_offset);
      }
    }
  }, {
    key: "offset",
    get: function get() {
      return this._offset;
    },
    set: function set(val) {
      this._offset.set(val);
      if (this.material) {
        this._tile_offset.z = this._offset.x;
        this._tile_offset.w = this._offset.y;
        this.material.setProperty('mainTiling_Offset', this._tile_offset);
      }
    }
  }]);
}(ModelRenderer), _initializer$d = applyDecoratedInitializer(_class2$d.prototype, "_texture", [_dec2$d], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$d.prototype, "texture", [_dec3$b], Object.getOwnPropertyDescriptor(_class2$d.prototype, "texture"), _class2$d.prototype), _initializer2$d = applyDecoratedInitializer(_class2$d.prototype, "_material", [serializable$1], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$d.prototype, "lineMaterial", [_dec4$b], Object.getOwnPropertyDescriptor(_class2$d.prototype, "lineMaterial"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "sharedMaterials", [override, serializable$1], Object.getOwnPropertyDescriptor(_class2$d.prototype, "sharedMaterials"), _class2$d.prototype), _initializer3$c = applyDecoratedInitializer(_class2$d.prototype, "_worldSpace", [serializable$1], function () {
  return false;
}), _initializer4$c = applyDecoratedInitializer(_class2$d.prototype, "_positions", [_dec5$a], function () {
  return [];
}), _applyDecoratedDescriptor(_class2$d.prototype, "positions", [_dec6$8], Object.getOwnPropertyDescriptor(_class2$d.prototype, "positions"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "width", [_dec7$6], Object.getOwnPropertyDescriptor(_class2$d.prototype, "width"), _class2$d.prototype), _initializer5$b = applyDecoratedInitializer(_class2$d.prototype, "_width", [serializable$1], function () {
  return new CurveRange();
}), _applyDecoratedDescriptor(_class2$d.prototype, "color", [_dec8$5], Object.getOwnPropertyDescriptor(_class2$d.prototype, "color"), _class2$d.prototype), _initializer6$9 = applyDecoratedInitializer(_class2$d.prototype, "_color", [serializable$1], function () {
  return new GradientRange();
}), _initializer7$7 = applyDecoratedInitializer(_class2$d.prototype, "_tile", [serializable$1], function () {
  return new Vec2(1, 1);
}), _applyDecoratedDescriptor(_class2$d.prototype, "tile", [_dec9$4], Object.getOwnPropertyDescriptor(_class2$d.prototype, "tile"), _class2$d.prototype), _initializer8$7 = applyDecoratedInitializer(_class2$d.prototype, "_offset", [serializable$1], function () {
  return new Vec2(0, 0);
}), _applyDecoratedDescriptor(_class2$d.prototype, "offset", [_dec0$2], Object.getOwnPropertyDescriptor(_class2$d.prototype, "offset"), _class2$d.prototype), _class2$d)) || _class$d);

var Particle = function () {
  function Particle(particleSystem) {
    this.particleSystem = void 0;
    this.position = void 0;
    this.velocity = void 0;
    this.animatedVelocity = void 0;
    this.ultimateVelocity = void 0;
    this.angularVelocity = void 0;
    this.axisOfRotation = void 0;
    this.rotation = void 0;
    this.startEuler = void 0;
    this.startRotation = void 0;
    this.startRotated = void 0;
    this.deltaQuat = void 0;
    this.deltaMat = void 0;
    this.localMat = void 0;
    this.startSize = void 0;
    this.size = void 0;
    this.startColor = void 0;
    this.color = void 0;
    this.randomSeed = void 0;
    this.remainingLifetime = void 0;
    this.loopCount = void 0;
    this.lastLoop = void 0;
    this.trailDelay = void 0;
    this.startLifetime = void 0;
    this.emitAccumulator0 = void 0;
    this.emitAccumulator1 = void 0;
    this.frameIndex = void 0;
    this.startRow = void 0;
    this.particleSystem = particleSystem;
    this.position = new Vec3(0, 0, 0);
    this.velocity = new Vec3(0, 0, 0);
    this.animatedVelocity = new Vec3(0, 0, 0);
    this.ultimateVelocity = new Vec3(0, 0, 0);
    this.angularVelocity = new Vec3(0, 0, 0);
    this.axisOfRotation = new Vec3(0, 0, 0);
    this.rotation = new Vec3(0, 0, 0);
    this.startEuler = new Vec3(0, 0, 0);
    this.startRotation = new Quat();
    this.startRotated = false;
    this.deltaQuat = new Quat();
    this.deltaMat = new Mat4();
    this.localMat = new Mat4();
    this.startSize = new Vec3(0, 0, 0);
    this.size = new Vec3(0, 0, 0);
    this.startColor = Color.WHITE.clone();
    this.color = Color.WHITE.clone();
    this.randomSeed = 0;
    this.remainingLifetime = 0.0;
    this.loopCount = 0;
    this.lastLoop = 0;
    this.trailDelay = 0;
    this.startLifetime = 0.0;
    this.emitAccumulator0 = 0.0;
    this.emitAccumulator1 = 0.0;
    this.frameIndex = 0.0;
    this.startRow = 0;
  }
  var _proto = Particle.prototype;
  _proto.reset = function reset() {
    this.rotation.set(0, 0, 0);
    this.startEuler.set(0, 0, 0);
    this.startRotation.set(0, 0, 0, 1);
    this.startRotated = false;
    this.deltaQuat.set(0, 0, 0, 1);
    this.deltaMat.identity();
    this.localMat.identity();
  };
  return Particle;
}();
Particle.INDENTIFY_NEG_QUAT = 10;
Particle.R2D = 180.0 / Math.PI;
var PARTICLE_MODULE_NAME = {
  COLOR: 'colorModule',
  FORCE: 'forceModule',
  LIMIT: 'limitModule',
  ROTATION: 'rotationModule',
  SIZE: 'sizeModule',
  VELOCITY: 'velocityModule',
  TEXTURE: 'textureModule',
  NOISE: 'noiseModule'
};
var PARTICLE_MODULE_ORDER = ['sizeModule', 'colorModule', 'forceModule', 'velocityModule', 'limitModule', 'rotationModule', 'textureModule', 'noiseModule'];
var PARTICLE_MODULE_PROPERTY = ['_colorOverLifetimeModule', '_shapeModule', '_sizeOvertimeModule', '_velocityOvertimeModule', '_forceOvertimeModule', '_limitVelocityOvertimeModule', '_rotationOvertimeModule', '_textureAnimationModule', '_noiseModule', '_trailModule'];
var ParticleModuleBase = function () {
  function ParticleModuleBase() {
    this.target = null;
    this.needUpdate = false;
    this.needAnimate = true;
    this.name = void 0;
  }
  var _proto2 = ParticleModuleBase.prototype;
  _proto2.bindTarget = function bindTarget(target) {
    this.target = target;
  };
  _proto2.update = function update(space, trans) {};
  return ParticleModuleBase;
}();

var ParticleSpace;
(function (ParticleSpace) {
  ParticleSpace[ParticleSpace["World"] = 0] = "World";
  ParticleSpace[ParticleSpace["Local"] = 1] = "Local";
  ParticleSpace[ParticleSpace["Custom"] = 2] = "Custom";
})(ParticleSpace || (ParticleSpace = {}));
Enum(ParticleSpace);
var ParticleCullingMode;
(function (ParticleCullingMode) {
  ParticleCullingMode[ParticleCullingMode["Pause"] = 0] = "Pause";
  ParticleCullingMode[ParticleCullingMode["PauseAndCatchup"] = 1] = "PauseAndCatchup";
  ParticleCullingMode[ParticleCullingMode["AlwaysSimulate"] = 2] = "AlwaysSimulate";
})(ParticleCullingMode || (ParticleCullingMode = {}));
Enum(ParticleCullingMode);
var ParticleAlignmentSpace;
(function (ParticleAlignmentSpace) {
  ParticleAlignmentSpace[ParticleAlignmentSpace["World"] = 0] = "World";
  ParticleAlignmentSpace[ParticleAlignmentSpace["Local"] = 1] = "Local";
  ParticleAlignmentSpace[ParticleAlignmentSpace["View"] = 2] = "View";
})(ParticleAlignmentSpace || (ParticleAlignmentSpace = {}));
Enum(ParticleAlignmentSpace);
var ParticleRenderMode;
(function (ParticleRenderMode) {
  ParticleRenderMode[ParticleRenderMode["Billboard"] = 0] = "Billboard";
  ParticleRenderMode[ParticleRenderMode["StrecthedBillboard"] = 1] = "StrecthedBillboard";
  ParticleRenderMode[ParticleRenderMode["HorizontalBillboard"] = 2] = "HorizontalBillboard";
  ParticleRenderMode[ParticleRenderMode["VerticalBillboard"] = 3] = "VerticalBillboard";
  ParticleRenderMode[ParticleRenderMode["Mesh"] = 4] = "Mesh";
})(ParticleRenderMode || (ParticleRenderMode = {}));
Enum(ParticleRenderMode);
var ParticleShapeType;
(function (ParticleShapeType) {
  ParticleShapeType[ParticleShapeType["Box"] = 0] = "Box";
  ParticleShapeType[ParticleShapeType["Circle"] = 1] = "Circle";
  ParticleShapeType[ParticleShapeType["Cone"] = 2] = "Cone";
  ParticleShapeType[ParticleShapeType["Sphere"] = 3] = "Sphere";
  ParticleShapeType[ParticleShapeType["Hemisphere"] = 4] = "Hemisphere";
})(ParticleShapeType || (ParticleShapeType = {}));
Enum(ParticleShapeType);
var ParticleEmitLocation;
(function (ParticleEmitLocation) {
  ParticleEmitLocation[ParticleEmitLocation["Base"] = 0] = "Base";
  ParticleEmitLocation[ParticleEmitLocation["Edge"] = 1] = "Edge";
  ParticleEmitLocation[ParticleEmitLocation["Shell"] = 2] = "Shell";
  ParticleEmitLocation[ParticleEmitLocation["Volume"] = 3] = "Volume";
})(ParticleEmitLocation || (ParticleEmitLocation = {}));
Enum(ParticleEmitLocation);
var ParticleArcMode;
(function (ParticleArcMode) {
  ParticleArcMode[ParticleArcMode["Random"] = 0] = "Random";
  ParticleArcMode[ParticleArcMode["Loop"] = 1] = "Loop";
  ParticleArcMode[ParticleArcMode["PingPong"] = 2] = "PingPong";
})(ParticleArcMode || (ParticleArcMode = {}));
Enum(ParticleArcMode);
var ParticleTrailMode;
(function (ParticleTrailMode) {
  ParticleTrailMode[ParticleTrailMode["Particles"] = 0] = "Particles";
})(ParticleTrailMode || (ParticleTrailMode = {}));
Enum(ParticleTrailMode);
var ParticleTextureMode;
(function (ParticleTextureMode) {
  ParticleTextureMode[ParticleTextureMode["Stretch"] = 0] = "Stretch";
})(ParticleTextureMode || (ParticleTextureMode = {}));
Enum(ParticleTextureMode);
var ParticleModuleRandSeed;
(function (ParticleModuleRandSeed) {
  ParticleModuleRandSeed[ParticleModuleRandSeed["LIMIT"] = 23541] = "LIMIT";
  ParticleModuleRandSeed[ParticleModuleRandSeed["SIZE"] = 39825] = "SIZE";
  ParticleModuleRandSeed[ParticleModuleRandSeed["TEXTURE"] = 90794] = "TEXTURE";
  ParticleModuleRandSeed[ParticleModuleRandSeed["COLOR"] = 91041] = "COLOR";
  ParticleModuleRandSeed[ParticleModuleRandSeed["FORCE"] = 212165] = "FORCE";
  ParticleModuleRandSeed[ParticleModuleRandSeed["ROTATION"] = 125292] = "ROTATION";
  ParticleModuleRandSeed[ParticleModuleRandSeed["VELOCITY_X"] = 197866] = "VELOCITY_X";
  ParticleModuleRandSeed[ParticleModuleRandSeed["VELOCITY_Y"] = 156497] = "VELOCITY_Y";
  ParticleModuleRandSeed[ParticleModuleRandSeed["VELOCITY_Z"] = 984136] = "VELOCITY_Z";
})(ParticleModuleRandSeed || (ParticleModuleRandSeed = {}));

var particleEmitZAxis = new Vec3(0, 0, -1);
function calculateTransform(systemSpace, moduleSpace, worldTransform, outQuat) {
  if (moduleSpace !== systemSpace) {
    if (systemSpace === ParticleSpace.World) {
      Mat4.getRotation(outQuat, worldTransform);
    } else {
      Mat4.invert(worldTransform, worldTransform);
      Mat4.getRotation(outQuat, worldTransform);
    }
    return true;
  } else {
    Quat.set(outQuat, 0, 0, 0, 1);
    return false;
  }
}
function fixedAngleUnitVector2(out, theta) {
  Vec2.set(out, Math.cos(theta), Math.sin(theta));
}
function randomUnitVector(out) {
  var z = randomRange(-1, 1);
  var a = randomRange(0, 2 * Math.PI);
  var r = Math.sqrt(1 - z * z);
  var x = r * Math.cos(a);
  var y = r * Math.sin(a);
  Vec3.set(out, x, y, z);
}
function randomPointBetweenSphere(out, minRadius, maxRadius) {
  randomUnitVector(out);
  Vec3.multiplyScalar(out, out, minRadius + (maxRadius - minRadius) * random());
}
function randomPointBetweenCircleAtFixedAngle(out, minRadius, maxRadius, theta) {
  fixedAngleUnitVector2(out, theta);
  out.z = 0;
  Vec3.multiplyScalar(out, out, minRadius + (maxRadius - minRadius) * random());
}
function randomPointInCube(out, extents) {
  Vec3.set(out, randomRange(-extents.x, extents.x), randomRange(-extents.y, extents.y), randomRange(-extents.z, extents.z));
}
function randomSortArray(arr) {
  for (var i = 0; i < arr.length; i++) {
    var transpose = i + randomRangeInt(0, arr.length - i);
    var val = arr[transpose];
    arr[transpose] = arr[i];
    arr[i] = val;
  }
}
function randomSign() {
  var sgn = randomRange(-1, 1);
  if (sgn === 0) {
    sgn++;
  }
  return sign(sgn);
}
function isCurveTwoValues(curve) {
  var Mode = CurveRange.Mode;
  switch (curve.mode) {
    case Mode.TwoCurves:
    case Mode.TwoConstants:
      return true;
    default:
      return false;
  }
}
function isGradientTwoValues(color) {
  var Mode = GradientRange.Mode;
  switch (color.mode) {
    case Mode.TwoGradients:
    case Mode.TwoColors:
      return true;
    default:
      return false;
  }
}

var _dec$c, _dec2$c, _class$c, _class2$c, _initializer$c, _initializer2$c;
var COLOR_OVERTIME_RAND_OFFSET = ParticleModuleRandSeed.COLOR;
var ColorOvertimeModule = (_dec$c = ccclass$1('cc.ColorOvertimeModule'), _dec2$c = type$1(GradientRange), _dec$c(_class$c = (_class2$c = function (_ParticleModuleBase) {
  function ColorOvertimeModule() {
    var _this;
    _this = _ParticleModuleBase.call(this) || this;
    _this._enable = _initializer$c && _initializer$c();
    _this.color = _initializer2$c && _initializer2$c();
    _this.name = PARTICLE_MODULE_NAME.COLOR;
    return _this;
  }
  _inheritsLoose(ColorOvertimeModule, _ParticleModuleBase);
  var _proto = ColorOvertimeModule.prototype;
  _proto.animate = function animate(particle) {
    particle.color.set(particle.startColor);
    var rand = isGradientTwoValues(this.color) ? pseudoRandom(particle.randomSeed + COLOR_OVERTIME_RAND_OFFSET) : 0;
    particle.color.multiply(this.color.evaluate(1.0 - particle.remainingLifetime / particle.startLifetime, rand));
  };
  return _createClass(ColorOvertimeModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (this._enable === val) return;
      this._enable = val;
      if (!this.target) return;
      this.target.enableModule(this.name, val, this);
    }
  }]);
}(ParticleModuleBase), _initializer$c = applyDecoratedInitializer(_class2$c.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$c = applyDecoratedInitializer(_class2$c.prototype, "color", [_dec2$c, serializable$1], function () {
  return new GradientRange();
}), _class2$c)) || _class$c);

var _dec$b, _dec2$b, _dec3$a, _dec4$a, _dec5$9, _class$b, _class2$b, _initializer$b, _initializer2$b, _initializer3$b, _initializer4$b, _initializer5$a;
var FORCE_OVERTIME_RAND_OFFSET = ParticleModuleRandSeed.FORCE;
var _temp_v3$2 = new Vec3();
var ForceOvertimeModule = (_dec$b = ccclass$1('cc.ForceOvertimeModule'), _dec2$b = type$1(CurveRange), _dec3$a = type$1(CurveRange), _dec4$a = type$1(CurveRange), _dec5$9 = type$1(ParticleSpace), _dec$b(_class$b = (_class2$b = function (_ParticleModuleBase) {
  function ForceOvertimeModule() {
    var _this;
    _this = _ParticleModuleBase.call(this) || this;
    _this._enable = _initializer$b && _initializer$b();
    _this.x = _initializer2$b && _initializer2$b();
    _this.y = _initializer3$b && _initializer3$b();
    _this.z = _initializer4$b && _initializer4$b();
    _this.space = _initializer5$a && _initializer5$a();
    _this.randomized = false;
    _this.rotation = void 0;
    _this.needTransform = void 0;
    _this.name = PARTICLE_MODULE_NAME.FORCE;
    _this.rotation = new Quat();
    _this.needTransform = false;
    _this.needUpdate = true;
    return _this;
  }
  _inheritsLoose(ForceOvertimeModule, _ParticleModuleBase);
  var _proto = ForceOvertimeModule.prototype;
  _proto.update = function update(space, worldTransform) {
    this.needTransform = calculateTransform(space, this.space, worldTransform, this.rotation);
  };
  _proto.animate = function animate(p, dt) {
    var normalizedTime = 1 - p.remainingLifetime / p.startLifetime;
    var randX = isCurveTwoValues(this.x) ? pseudoRandom(p.randomSeed + FORCE_OVERTIME_RAND_OFFSET) : 0;
    var randY = isCurveTwoValues(this.y) ? pseudoRandom(p.randomSeed + FORCE_OVERTIME_RAND_OFFSET) : 0;
    var randZ = isCurveTwoValues(this.z) ? pseudoRandom(p.randomSeed + FORCE_OVERTIME_RAND_OFFSET) : 0;
    var force = Vec3.set(_temp_v3$2, this.x.evaluate(normalizedTime, randX), this.y.evaluate(normalizedTime, randY), this.z.evaluate(normalizedTime, randZ));
    if (this.needTransform) {
      Vec3.transformQuat(force, force, this.rotation);
    }
    Vec3.scaleAndAdd(p.velocity, p.velocity, force, dt);
    Vec3.copy(p.ultimateVelocity, p.velocity);
  };
  return _createClass(ForceOvertimeModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (this._enable === val) return;
      this._enable = val;
      if (!this.target) return;
      this.target.enableModule(this.name, val, this);
    }
  }]);
}(ParticleModuleBase), _initializer$b = applyDecoratedInitializer(_class2$b.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$b = applyDecoratedInitializer(_class2$b.prototype, "x", [_dec2$b, serializable$1], function () {
  return new CurveRange();
}), _initializer3$b = applyDecoratedInitializer(_class2$b.prototype, "y", [_dec3$a, serializable$1], function () {
  return new CurveRange();
}), _initializer4$b = applyDecoratedInitializer(_class2$b.prototype, "z", [_dec4$a, serializable$1], function () {
  return new CurveRange();
}), _initializer5$a = applyDecoratedInitializer(_class2$b.prototype, "space", [_dec5$9, serializable$1], function () {
  return ParticleSpace.Local;
}), _class2$b)) || _class$b);

var _dec$a, _dec2$a, _dec3$9, _dec4$9, _dec5$8, _dec6$7, _class$a, _class2$a, _initializer$a, _initializer2$a, _initializer3$a, _initializer4$a, _initializer5$9, _initializer6$8, _initializer7$6, _initializer8$6;
var LIMIT_VELOCITY_RAND_OFFSET = ParticleModuleRandSeed.LIMIT;
var _temp_v3$1 = new Vec3();
var _temp_v3_1 = new Vec3();
var LimitVelocityOvertimeModule = (_dec$a = ccclass$1('cc.LimitVelocityOvertimeModule'), _dec2$a = type$1(CurveRange), _dec3$9 = type$1(CurveRange), _dec4$9 = type$1(CurveRange), _dec5$8 = type$1(CurveRange), _dec6$7 = type$1(ParticleSpace), _dec$a(_class$a = (_class2$a = function (_ParticleModuleBase) {
  function LimitVelocityOvertimeModule() {
    var _this;
    _this = _ParticleModuleBase.call(this) || this;
    _this._enable = _initializer$a && _initializer$a();
    _this.limitX = _initializer2$a && _initializer2$a();
    _this.limitY = _initializer3$a && _initializer3$a();
    _this.limitZ = _initializer4$a && _initializer4$a();
    _this.limit = _initializer5$9 && _initializer5$9();
    _this.dampen = _initializer6$8 && _initializer6$8();
    _this.separateAxes = _initializer7$6 && _initializer7$6();
    _this.space = _initializer8$6 && _initializer8$6();
    _this.drag = null;
    _this.multiplyDragByParticleSize = false;
    _this.multiplyDragByParticleVelocity = false;
    _this.name = PARTICLE_MODULE_NAME.LIMIT;
    _this.rotation = void 0;
    _this.needTransform = void 0;
    _this.rotation = new Quat();
    _this.needTransform = false;
    _this.needUpdate = true;
    return _this;
  }
  _inheritsLoose(LimitVelocityOvertimeModule, _ParticleModuleBase);
  var _proto = LimitVelocityOvertimeModule.prototype;
  _proto.update = function update(space, worldTransform) {
    this.needTransform = calculateTransform(space, this.space, worldTransform, this.rotation);
  };
  _proto.animate = function animate(p, dt) {
    var normalizedTime = 1 - p.remainingLifetime / p.startLifetime;
    var dampedVel = _temp_v3$1;
    if (this.separateAxes) {
      var randX = isCurveTwoValues(this.limitX) ? pseudoRandom(p.randomSeed + LIMIT_VELOCITY_RAND_OFFSET) : 0;
      var randY = isCurveTwoValues(this.limitY) ? pseudoRandom(p.randomSeed + LIMIT_VELOCITY_RAND_OFFSET) : 0;
      var randZ = isCurveTwoValues(this.limitZ) ? pseudoRandom(p.randomSeed + LIMIT_VELOCITY_RAND_OFFSET) : 0;
      Vec3.set(_temp_v3_1, this.limitX.evaluate(normalizedTime, randX), this.limitY.evaluate(normalizedTime, randY), this.limitZ.evaluate(normalizedTime, randZ));
      if (this.needTransform) {
        Vec3.transformQuat(_temp_v3_1, _temp_v3_1, this.rotation);
      }
      Vec3.set(dampedVel, dampenBeyondLimit(p.ultimateVelocity.x, _temp_v3_1.x, this.dampen), dampenBeyondLimit(p.ultimateVelocity.y, _temp_v3_1.y, this.dampen), dampenBeyondLimit(p.ultimateVelocity.z, _temp_v3_1.z, this.dampen));
    } else {
      Vec3.normalize(dampedVel, p.ultimateVelocity);
      var rand = isCurveTwoValues(this.limit) ? pseudoRandom(p.randomSeed + LIMIT_VELOCITY_RAND_OFFSET) : 0;
      Vec3.multiplyScalar(dampedVel, dampedVel, dampenBeyondLimit(p.ultimateVelocity.length(), this.limit.evaluate(normalizedTime, rand), this.dampen));
    }
    Vec3.copy(p.ultimateVelocity, dampedVel);
    Vec3.copy(p.velocity, p.ultimateVelocity);
  };
  return _createClass(LimitVelocityOvertimeModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (this._enable === val) return;
      this._enable = val;
      if (!this.target) return;
      this.target.enableModule(this.name, val, this);
    }
  }]);
}(ParticleModuleBase), _initializer$a = applyDecoratedInitializer(_class2$a.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$a = applyDecoratedInitializer(_class2$a.prototype, "limitX", [_dec2$a, serializable$1], function () {
  return new CurveRange();
}), _initializer3$a = applyDecoratedInitializer(_class2$a.prototype, "limitY", [_dec3$9, serializable$1], function () {
  return new CurveRange();
}), _initializer4$a = applyDecoratedInitializer(_class2$a.prototype, "limitZ", [_dec4$9, serializable$1], function () {
  return new CurveRange();
}), _initializer5$9 = applyDecoratedInitializer(_class2$a.prototype, "limit", [_dec5$8, serializable$1], function () {
  return new CurveRange();
}), _initializer6$8 = applyDecoratedInitializer(_class2$a.prototype, "dampen", [serializable$1], function () {
  return 3;
}), _initializer7$6 = applyDecoratedInitializer(_class2$a.prototype, "separateAxes", [serializable$1], function () {
  return false;
}), _initializer8$6 = applyDecoratedInitializer(_class2$a.prototype, "space", [_dec6$7, serializable$1], function () {
  return ParticleSpace.Local;
}), _class2$a)) || _class$a);
function dampenBeyondLimit(vel, limit, dampen) {
  var sgn = Math.sign(vel);
  var abs = Math.abs(vel);
  if (abs > limit) {
    var absToGive = abs - abs * dampen;
    if (absToGive > limit) {
      abs = absToGive;
    } else {
      abs = limit;
    }
  }
  return abs * sgn;
}

var _dec$9, _dec2$9, _dec3$8, _dec4$8, _class$9, _class2$9, _initializer$9, _initializer2$9, _initializer3$9, _initializer4$9, _initializer5$8;
var ROTATION_OVERTIME_RAND_OFFSET = ParticleModuleRandSeed.ROTATION;
var RotationOvertimeModule = (_dec$9 = ccclass$1('cc.RotationOvertimeModule'), _dec2$9 = type$1(CurveRange), _dec3$8 = type$1(CurveRange), _dec4$8 = type$1(CurveRange), _dec$9(_class$9 = (_class2$9 = function (_ParticleModuleBase) {
  function RotationOvertimeModule() {
    var _this;
    _this = _ParticleModuleBase.call(this) || this;
    _this._enable = _initializer$9 && _initializer$9();
    _this._separateAxes = _initializer2$9 && _initializer2$9();
    _this.x = _initializer3$9 && _initializer3$9();
    _this.y = _initializer4$9 && _initializer4$9();
    _this.z = _initializer5$8 && _initializer5$8();
    _this.name = PARTICLE_MODULE_NAME.ROTATION;
    _this._startMat = new Mat4();
    _this._matRot = new Mat4();
    _this._quatRot = new Quat();
    _this._otherEuler = new Vec3();
    return _this;
  }
  _inheritsLoose(RotationOvertimeModule, _ParticleModuleBase);
  var _proto = RotationOvertimeModule.prototype;
  _proto._processRotation = function _processRotation(p, r2d) {
    var renderMode = p.particleSystem.processor.getInfo().renderMode;
    if (renderMode !== ParticleRenderMode.Mesh) {
      if (renderMode === ParticleRenderMode.StrecthedBillboard) {
        this._quatRot.set(0, 0, 0, 1);
      }
    }
    Quat.normalize(this._quatRot, this._quatRot);
    if (this._quatRot.w < 0.0) {
      this._quatRot.x += Particle.INDENTIFY_NEG_QUAT;
    }
  };
  _proto.animate = function animate(p, dt) {
    var normalizedTime = 1 - p.remainingLifetime / p.startLifetime;
    var randZ = isCurveTwoValues(this.z) ? pseudoRandom(p.randomSeed + ROTATION_OVERTIME_RAND_OFFSET) : 0;
    var renderMode = p.particleSystem.processor.getInfo().renderMode;
    if (!this._separateAxes || renderMode === ParticleRenderMode.VerticalBillboard || renderMode === ParticleRenderMode.HorizontalBillboard) {
      Quat.fromEuler(p.deltaQuat, 0, 0, this.z.evaluate(normalizedTime, randZ) * dt * Particle.R2D);
    } else {
      var randX = isCurveTwoValues(this.x) ? pseudoRandom(p.randomSeed + ROTATION_OVERTIME_RAND_OFFSET) : 0;
      var randY = isCurveTwoValues(this.y) ? pseudoRandom(p.randomSeed + ROTATION_OVERTIME_RAND_OFFSET) : 0;
      Quat.fromEuler(p.deltaQuat, this.x.evaluate(normalizedTime, randX) * dt * Particle.R2D, this.y.evaluate(normalizedTime, randY) * dt * Particle.R2D, this.z.evaluate(normalizedTime, randZ) * dt * Particle.R2D);
    }
    p.deltaMat = Mat4.fromQuat(p.deltaMat, p.deltaQuat);
    p.localMat = p.localMat.multiply(p.deltaMat);
    if (!p.startRotated) {
      if (renderMode !== ParticleRenderMode.Mesh) {
        if (renderMode === ParticleRenderMode.StrecthedBillboard) {
          p.startEuler.set(0, 0, 0);
        } else if (renderMode !== ParticleRenderMode.Billboard) {
          p.startEuler.set(0, 0, p.startEuler.z);
        }
      }
      Quat.fromEuler(p.startRotation, p.startEuler.x * Particle.R2D, p.startEuler.y * Particle.R2D, p.startEuler.z * Particle.R2D);
      p.startRotated = true;
    }
    this._startMat = Mat4.fromQuat(this._startMat, p.startRotation);
    this._matRot = this._startMat.multiply(p.localMat);
    Mat4.getRotation(this._quatRot, this._matRot);
    this._processRotation(p, Particle.R2D);
    p.rotation.set(this._quatRot.x, this._quatRot.y, this._quatRot.z);
  };
  return _createClass(RotationOvertimeModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (this._enable === val) return;
      this._enable = val;
      if (!this.target) return;
      this.target.enableModule(this.name, val, this);
    }
  }, {
    key: "separateAxes",
    get: function get() {
      return this._separateAxes;
    },
    set: function set(val) {
      this._separateAxes = val;
    }
  }]);
}(ParticleModuleBase), _initializer$9 = applyDecoratedInitializer(_class2$9.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$9 = applyDecoratedInitializer(_class2$9.prototype, "_separateAxes", [serializable$1], function () {
  return false;
}), _initializer3$9 = applyDecoratedInitializer(_class2$9.prototype, "x", [_dec2$9, serializable$1], function () {
  return new CurveRange();
}), _initializer4$9 = applyDecoratedInitializer(_class2$9.prototype, "y", [_dec3$8, serializable$1], function () {
  return new CurveRange();
}), _initializer5$8 = applyDecoratedInitializer(_class2$9.prototype, "z", [_dec4$8, serializable$1], function () {
  return new CurveRange();
}), _class2$9)) || _class$9);

var _dec$8, _dec2$8, _dec3$7, _dec4$7, _dec5$7, _class$8, _class2$8, _initializer$8, _initializer2$8, _initializer3$8, _initializer4$8, _initializer5$7, _initializer6$7;
var SIZE_OVERTIME_RAND_OFFSET = ParticleModuleRandSeed.SIZE;
var SizeOvertimeModule = (_dec$8 = ccclass$1('cc.SizeOvertimeModule'), _dec2$8 = type$1(CurveRange), _dec3$7 = type$1(CurveRange), _dec4$7 = type$1(CurveRange), _dec5$7 = type$1(CurveRange), _dec$8(_class$8 = (_class2$8 = function (_ParticleModuleBase) {
  function SizeOvertimeModule() {
    var _this;
    _this = _ParticleModuleBase.call(this) || this;
    _this._enable = _initializer$8 && _initializer$8();
    _this.separateAxes = _initializer2$8 && _initializer2$8();
    _this.size = _initializer3$8 && _initializer3$8();
    _this.x = _initializer4$8 && _initializer4$8();
    _this.y = _initializer5$7 && _initializer5$7();
    _this.z = _initializer6$7 && _initializer6$7();
    _this.name = PARTICLE_MODULE_NAME.SIZE;
    return _this;
  }
  _inheritsLoose(SizeOvertimeModule, _ParticleModuleBase);
  var _proto = SizeOvertimeModule.prototype;
  _proto.animate = function animate(particle, dt) {
    if (!this.separateAxes) {
      var rand = isCurveTwoValues(this.size) ? pseudoRandom(particle.randomSeed + SIZE_OVERTIME_RAND_OFFSET) : 0;
      Vec3.multiplyScalar(particle.size, particle.startSize, this.size.evaluate(1 - particle.remainingLifetime / particle.startLifetime, rand));
    } else {
      var currLifetime = 1 - particle.remainingLifetime / particle.startLifetime;
      var randX = isCurveTwoValues(this.x) ? pseudoRandom(particle.randomSeed + SIZE_OVERTIME_RAND_OFFSET) : 0;
      var randY = isCurveTwoValues(this.y) ? pseudoRandom(particle.randomSeed + SIZE_OVERTIME_RAND_OFFSET) : 0;
      var randZ = isCurveTwoValues(this.z) ? pseudoRandom(particle.randomSeed + SIZE_OVERTIME_RAND_OFFSET) : 0;
      particle.size.x = particle.startSize.x * this.x.evaluate(currLifetime, randX);
      particle.size.y = particle.startSize.y * this.y.evaluate(currLifetime, randY);
      particle.size.z = particle.startSize.z * this.z.evaluate(currLifetime, randZ);
    }
  };
  return _createClass(SizeOvertimeModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (this._enable === val) return;
      this._enable = val;
      if (!this.target) return;
      this.target.enableModule(this.name, val, this);
    }
  }]);
}(ParticleModuleBase), _initializer$8 = applyDecoratedInitializer(_class2$8.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$8 = applyDecoratedInitializer(_class2$8.prototype, "separateAxes", [serializable$1], function () {
  return false;
}), _initializer3$8 = applyDecoratedInitializer(_class2$8.prototype, "size", [_dec2$8, serializable$1], function () {
  return new CurveRange();
}), _initializer4$8 = applyDecoratedInitializer(_class2$8.prototype, "x", [_dec3$7, serializable$1], function () {
  return new CurveRange();
}), _initializer5$7 = applyDecoratedInitializer(_class2$8.prototype, "y", [_dec4$7, serializable$1], function () {
  return new CurveRange();
}), _initializer6$7 = applyDecoratedInitializer(_class2$8.prototype, "z", [_dec5$7, serializable$1], function () {
  return new CurveRange();
}), _class2$8)) || _class$8);

var _dec$7, _dec2$7, _dec3$6, _dec4$6, _dec5$6, _dec6$6, _dec7$5, _dec8$4, _class$7, _class2$7, _initializer$7, _initializer2$7, _initializer3$7, _initializer4$7, _initializer5$6, _initializer6$6, _initializer7$5, _initializer8$5, _initializer9$5, _initializer0$4, _initializer1$4, _initializer10$4, _initializer11$4;
var TEXTURE_ANIMATION_RAND_OFFSET = ParticleModuleRandSeed.TEXTURE;
var Mode = Enum({
  Grid: 0
});
var Animation = Enum({
  WholeSheet: 0,
  SingleRow: 1
});
var TextureAnimationModule = (_dec$7 = ccclass$1('cc.TextureAnimationModule'), _dec2$7 = formerlySerializedAs('numTilesX'), _dec3$6 = formerlySerializedAs('numTilesY'), _dec4$6 = type$1(Mode), _dec5$6 = type$1(Mode), _dec6$6 = type$1(Animation), _dec7$5 = type$1(CurveRange), _dec8$4 = type$1(CurveRange), _dec$7(_class$7 = (_class2$7 = function (_ParticleModuleBase) {
  function TextureAnimationModule() {
    var _this;
    _this = _ParticleModuleBase.call(this) || this;
    _this._enable = _initializer$7 && _initializer$7();
    _this._numTilesX = _initializer2$7 && _initializer2$7();
    _this._numTilesY = _initializer3$7 && _initializer3$7();
    _this._mode = _initializer4$7 && _initializer4$7();
    _this.animation = _initializer5$6 && _initializer5$6();
    _this.frameOverTime = _initializer6$6 && _initializer6$6();
    _this.startFrame = _initializer7$5 && _initializer7$5();
    _this.cycleCount = _initializer8$5 && _initializer8$5();
    _this._flipU = _initializer9$5 && _initializer9$5();
    _this._flipV = _initializer0$4 && _initializer0$4();
    _this._uvChannelMask = _initializer1$4 && _initializer1$4();
    _this.randomRow = _initializer10$4 && _initializer10$4();
    _this.rowIndex = _initializer11$4 && _initializer11$4();
    _this.name = PARTICLE_MODULE_NAME.TEXTURE;
    return _this;
  }
  _inheritsLoose(TextureAnimationModule, _ParticleModuleBase);
  var _proto = TextureAnimationModule.prototype;
  _proto.init = function init(p) {
    p.startRow = Math.floor(random() * this.numTilesY);
  };
  _proto.animate = function animate(p, dt) {
    var normalizedTime = 1 - p.remainingLifetime / p.startLifetime;
    var randStart = isCurveTwoValues(this.startFrame) ? pseudoRandom(p.randomSeed + TEXTURE_ANIMATION_RAND_OFFSET) : 0;
    var randFrame = isCurveTwoValues(this.frameOverTime) ? pseudoRandom(p.randomSeed + TEXTURE_ANIMATION_RAND_OFFSET) : 0;
    var startFrame = this.startFrame.evaluate(normalizedTime, randStart) / (this.numTilesX * this.numTilesY);
    if (this.animation === Animation.WholeSheet) {
      p.frameIndex = repeat(this.cycleCount * (this.frameOverTime.evaluate(normalizedTime, randFrame) + startFrame), 1);
    } else if (this.animation === Animation.SingleRow) {
      var rowLength = 1 / this.numTilesY;
      if (this.randomRow) {
        var f = repeat(this.cycleCount * (this.frameOverTime.evaluate(normalizedTime, randFrame) + startFrame), 1);
        var from = p.startRow * rowLength;
        var to = from + rowLength;
        p.frameIndex = lerp(from, to, f);
      } else {
        var _from = this.rowIndex * rowLength;
        var _to = _from + rowLength;
        p.frameIndex = lerp(_from, _to, repeat(this.cycleCount * (this.frameOverTime.evaluate(normalizedTime, randFrame) + startFrame), 1));
      }
    }
  };
  _proto.scaleNumTilesXY = function scaleNumTilesXY(scale) {
    this._numTilesX *= scale;
    this._numTilesY *= scale;
  };
  return _createClass(TextureAnimationModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (this._enable === val) return;
      this._enable = val;
      if (!this.target) return;
      this.target.updateMaterialParams();
      this.target.enableModule(this.name, val, this);
    }
  }, {
    key: "mode",
    get: function get() {
      return this._mode;
    },
    set: function set(val) {
      if (val !== Mode.Grid) {
        error('particle texture animation\'s sprites is not supported!');
      }
    }
  }, {
    key: "numTilesX",
    get: function get() {
      return this._numTilesX;
    },
    set: function set(val) {
      if (this._numTilesX !== val) {
        this._numTilesX = val;
        this.target.updateMaterialParams();
      }
    }
  }, {
    key: "numTilesY",
    get: function get() {
      return this._numTilesY;
    },
    set: function set(val) {
      if (this._numTilesY !== val) {
        this._numTilesY = val;
        this.target.updateMaterialParams();
      }
    }
  }, {
    key: "flipU",
    get: function get() {
      return this._flipU;
    },
    set: function set(val) {
      error('particle texture animation\'s flipU is not supported!');
    }
  }, {
    key: "flipV",
    get: function get() {
      return this._flipV;
    },
    set: function set(val) {
      error('particle texture animation\'s flipV is not supported!');
    }
  }, {
    key: "uvChannelMask",
    get: function get() {
      return this._uvChannelMask;
    },
    set: function set(val) {
      error('particle texture animation\'s uvChannelMask is not supported!');
    }
  }]);
}(ParticleModuleBase), _initializer$7 = applyDecoratedInitializer(_class2$7.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$7 = applyDecoratedInitializer(_class2$7.prototype, "_numTilesX", [_dec2$7], function () {
  return 0;
}), _initializer3$7 = applyDecoratedInitializer(_class2$7.prototype, "_numTilesY", [_dec3$6], function () {
  return 0;
}), _initializer4$7 = applyDecoratedInitializer(_class2$7.prototype, "_mode", [_dec4$6], function () {
  return Mode.Grid;
}), _applyDecoratedDescriptor(_class2$7.prototype, "mode", [_dec5$6], Object.getOwnPropertyDescriptor(_class2$7.prototype, "mode"), _class2$7.prototype), _initializer5$6 = applyDecoratedInitializer(_class2$7.prototype, "animation", [_dec6$6, serializable$1], function () {
  return Animation.WholeSheet;
}), _initializer6$6 = applyDecoratedInitializer(_class2$7.prototype, "frameOverTime", [_dec7$5, serializable$1], function () {
  return new CurveRange();
}), _initializer7$5 = applyDecoratedInitializer(_class2$7.prototype, "startFrame", [_dec8$4, serializable$1], function () {
  return new CurveRange();
}), _initializer8$5 = applyDecoratedInitializer(_class2$7.prototype, "cycleCount", [serializable$1], function () {
  return 0;
}), _initializer9$5 = applyDecoratedInitializer(_class2$7.prototype, "_flipU", [serializable$1], function () {
  return 0;
}), _initializer0$4 = applyDecoratedInitializer(_class2$7.prototype, "_flipV", [serializable$1], function () {
  return 0;
}), _initializer1$4 = applyDecoratedInitializer(_class2$7.prototype, "_uvChannelMask", [serializable$1], function () {
  return -1;
}), _initializer10$4 = applyDecoratedInitializer(_class2$7.prototype, "randomRow", [serializable$1], function () {
  return false;
}), _initializer11$4 = applyDecoratedInitializer(_class2$7.prototype, "rowIndex", [serializable$1], function () {
  return 0;
}), _class2$7)) || _class$7);

var _dec$6, _dec2$6, _dec3$5, _dec4$5, _dec5$5, _dec6$5, _class$6, _class2$6, _initializer$6, _initializer2$6, _initializer3$6, _initializer4$6, _initializer5$5, _initializer6$5;
var VELOCITY_X_OVERTIME_RAND_OFFSET = ParticleModuleRandSeed.VELOCITY_X;
var VELOCITY_Y_OVERTIME_RAND_OFFSET = ParticleModuleRandSeed.VELOCITY_Y;
var VELOCITY_Z_OVERTIME_RAND_OFFSET = ParticleModuleRandSeed.VELOCITY_Z;
var _temp_v3 = new Vec3();
var VelocityOvertimeModule = (_dec$6 = ccclass$1('cc.VelocityOvertimeModule'), _dec2$6 = type$1(CurveRange), _dec3$5 = type$1(CurveRange), _dec4$5 = type$1(CurveRange), _dec5$5 = type$1(CurveRange), _dec6$5 = type$1(ParticleSpace), _dec$6(_class$6 = (_class2$6 = function (_ParticleModuleBase) {
  function VelocityOvertimeModule() {
    var _this;
    _this = _ParticleModuleBase.call(this) || this;
    _this._enable = _initializer$6 && _initializer$6();
    _this.x = _initializer2$6 && _initializer2$6();
    _this.y = _initializer3$6 && _initializer3$6();
    _this.z = _initializer4$6 && _initializer4$6();
    _this.speedModifier = _initializer5$5 && _initializer5$5();
    _this.space = _initializer6$5 && _initializer6$5();
    _this.rotation = void 0;
    _this.needTransform = void 0;
    _this.name = PARTICLE_MODULE_NAME.VELOCITY;
    _this.rotation = new Quat();
    _this.speedModifier.constant = 1;
    _this.needTransform = false;
    _this.needUpdate = true;
    return _this;
  }
  _inheritsLoose(VelocityOvertimeModule, _ParticleModuleBase);
  var _proto = VelocityOvertimeModule.prototype;
  _proto.update = function update(space, worldTransform) {
    this.needTransform = calculateTransform(space, this.space, worldTransform, this.rotation);
  };
  _proto.animate = function animate(p, dt) {
    var normalizedTime = 1 - p.remainingLifetime / p.startLifetime;
    var randX = isCurveTwoValues(this.x) ? pseudoRandom(p.randomSeed ^ VELOCITY_X_OVERTIME_RAND_OFFSET) : 0;
    var randY = isCurveTwoValues(this.y) ? pseudoRandom(p.randomSeed ^ VELOCITY_Y_OVERTIME_RAND_OFFSET) : 0;
    var randZ = isCurveTwoValues(this.z) ? pseudoRandom(p.randomSeed ^ VELOCITY_Z_OVERTIME_RAND_OFFSET) : 0;
    var randSpeed = isCurveTwoValues(this.speedModifier) ? pseudoRandom(p.randomSeed + VELOCITY_X_OVERTIME_RAND_OFFSET) : 0;
    var vel = Vec3.set(_temp_v3, this.x.evaluate(normalizedTime, randX), this.y.evaluate(normalizedTime, randY), this.z.evaluate(normalizedTime, randZ));
    if (this.needTransform) {
      Vec3.transformQuat(vel, vel, this.rotation);
    }
    Vec3.add(p.animatedVelocity, p.animatedVelocity, vel);
    Vec3.add(p.ultimateVelocity, p.velocity, p.animatedVelocity);
    Vec3.multiplyScalar(p.ultimateVelocity, p.ultimateVelocity, this.speedModifier.evaluate(1 - p.remainingLifetime / p.startLifetime, randSpeed));
  };
  return _createClass(VelocityOvertimeModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (this._enable === val) return;
      this._enable = val;
      if (!this.target) return;
      this.target.enableModule(this.name, val, this);
    }
  }]);
}(ParticleModuleBase), _initializer$6 = applyDecoratedInitializer(_class2$6.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$6 = applyDecoratedInitializer(_class2$6.prototype, "x", [_dec2$6, serializable$1], function () {
  return new CurveRange();
}), _initializer3$6 = applyDecoratedInitializer(_class2$6.prototype, "y", [_dec3$5, serializable$1], function () {
  return new CurveRange();
}), _initializer4$6 = applyDecoratedInitializer(_class2$6.prototype, "z", [_dec4$5, serializable$1], function () {
  return new CurveRange();
}), _initializer5$5 = applyDecoratedInitializer(_class2$6.prototype, "speedModifier", [_dec5$5, serializable$1], function () {
  return new CurveRange();
}), _initializer6$5 = applyDecoratedInitializer(_class2$6.prototype, "space", [_dec6$5, serializable$1], function () {
  return ParticleSpace.Local;
}), _class2$6)) || _class$6);

var _dec$5, _dec2$5, _class$5, _class2$5, _initializer$5, _initializer2$5, _initializer3$5, _initializer4$5;
var Burst = (_dec$5 = ccclass$1('cc.Burst'), _dec2$5 = type$1(CurveRange), _dec$5(_class$5 = (_class2$5 = function () {
  function Burst() {
    this._time = _initializer$5 && _initializer$5();
    this._repeatCount = _initializer2$5 && _initializer2$5();
    this.repeatInterval = _initializer3$5 && _initializer3$5();
    this.count = _initializer4$5 && _initializer4$5();
    this._remainingCount = 0;
    this._curTime = 0.0;
  }
  var _proto = Burst.prototype;
  _proto.update = function update(psys, dt) {
    if (this._remainingCount === 0) {
      this._remainingCount = this._repeatCount;
      this._curTime = this._time;
    }
    if (this._remainingCount > 0) {
      var preFrameTime = repeat(psys.time - psys.startDelay.evaluate(0, 1), psys.duration) - dt;
      preFrameTime = preFrameTime > 0.0 ? preFrameTime : 0.0;
      var curFrameTime = repeat(psys.time - psys.startDelay.evaluate(0, 1), psys.duration);
      if (this._curTime >= preFrameTime && this._curTime < curFrameTime) {
        psys.emit(this.count.evaluate(this._curTime / psys.duration, 1), dt - (curFrameTime - this._curTime));
        this._curTime += this.repeatInterval;
        --this._remainingCount;
      }
    }
  };
  _proto.reset = function reset() {
    this._remainingCount = 0;
    this._curTime = 0.0;
  };
  _proto.getMaxCount = function getMaxCount(psys) {
    return this.count.getMax() * Math.min(Math.ceil(psys.duration / this.repeatInterval), this.repeatCount);
  };
  return _createClass(Burst, [{
    key: "time",
    get: function get() {
      return this._time;
    },
    set: function set(val) {
      this._time = val;
      this._curTime = val;
    }
  }, {
    key: "repeatCount",
    get: function get() {
      return this._repeatCount;
    },
    set: function set(val) {
      this._repeatCount = val;
      this._remainingCount = val;
    }
  }]);
}(), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "_time", [serializable$1], function () {
  return 0;
}), _initializer2$5 = applyDecoratedInitializer(_class2$5.prototype, "_repeatCount", [serializable$1], function () {
  return 1;
}), _initializer3$5 = applyDecoratedInitializer(_class2$5.prototype, "repeatInterval", [serializable$1], function () {
  return 1;
}), _initializer4$5 = applyDecoratedInitializer(_class2$5.prototype, "count", [_dec2$5, serializable$1], function () {
  return new CurveRange();
}), _class2$5)) || _class$5);

var _dec$4, _dec2$4, _dec3$4, _dec4$4, _dec5$4, _dec6$4, _dec7$4, _class$4, _class2$4, _initializer$4, _initializer2$4, _initializer3$4, _initializer4$4, _initializer5$4, _initializer6$4, _initializer7$4, _initializer8$4, _initializer9$4, _initializer0$3, _initializer1$3, _initializer10$3, _initializer11$3, _initializer12$2, _initializer13$1, _initializer14$1, _initializer15$1, _initializer16$1, _initializer17$1;
var _intermediVec = new Vec3(0, 0, 0);
var _intermediArr = [0, 0, 0];
var _unitBoxExtent = new Vec3(0.5, 0.5, 0.5);
var ShapeModule = (_dec$4 = ccclass$1('cc.ShapeModule'), _dec2$4 = type$1(ParticleShapeType), _dec3$4 = formerlySerializedAs('shapeType'), _dec4$4 = type$1(ParticleShapeType), _dec5$4 = type$1(ParticleEmitLocation), _dec6$4 = type$1(ParticleArcMode), _dec7$4 = type$1(CurveRange), _dec$4(_class$4 = (_class2$4 = function () {
  function ShapeModule() {
    this._enable = _initializer$4 && _initializer$4();
    this._shapeType = _initializer2$4 && _initializer2$4();
    this.emitFrom = _initializer3$4 && _initializer3$4();
    this.alignToDirection = _initializer4$4 && _initializer4$4();
    this.randomDirectionAmount = _initializer5$4 && _initializer5$4();
    this.sphericalDirectionAmount = _initializer6$4 && _initializer6$4();
    this.randomPositionAmount = _initializer7$4 && _initializer7$4();
    this.radius = _initializer8$4 && _initializer8$4();
    this.radiusThickness = _initializer9$4 && _initializer9$4();
    this.arcMode = _initializer0$3 && _initializer0$3();
    this.arcSpread = _initializer1$3 && _initializer1$3();
    this.arcSpeed = _initializer10$3 && _initializer10$3();
    this.length = _initializer11$3 && _initializer11$3();
    this.boxThickness = _initializer12$2 && _initializer12$2();
    this._position = _initializer13$1 && _initializer13$1();
    this._rotation = _initializer14$1 && _initializer14$1();
    this._scale = _initializer15$1 && _initializer15$1();
    this._arc = _initializer16$1 && _initializer16$1();
    this._angle = _initializer17$1 && _initializer17$1();
    this.mat = new Mat4();
    this.quat = new Quat();
    this.particleSystem = null;
    this.lastTime = 0;
    this.totalAngle = 0;
  }
  var _proto = ShapeModule.prototype;
  _proto.onInit = function onInit(ps) {
    this.particleSystem = ps;
    this.constructMat();
    this.lastTime = this.particleSystem.time;
  };
  _proto.emit = function emit(p) {
    switch (this.shapeType) {
      case ParticleShapeType.Box:
        boxEmit(this.emitFrom, this.boxThickness, p.position, p.velocity);
        break;
      case ParticleShapeType.Circle:
        circleEmit(this.radius, this.radiusThickness, this.generateArcAngle(), p.position, p.velocity);
        break;
      case ParticleShapeType.Cone:
        coneEmit(this.emitFrom, this.radius, this.radiusThickness, this.generateArcAngle(), this._angle, this.length, p.position, p.velocity);
        break;
      case ParticleShapeType.Sphere:
        sphereEmit(this.emitFrom, this.radius, this.radiusThickness, p.position, p.velocity);
        break;
      case ParticleShapeType.Hemisphere:
        hemisphereEmit(this.emitFrom, this.radius, this.radiusThickness, p.position, p.velocity);
        break;
      default:
        warn(this.shapeType + " shapeType is not supported by ShapeModule.");
    }
    if (this.randomPositionAmount > 0) {
      p.position.x += randomRange(-this.randomPositionAmount, this.randomPositionAmount);
      p.position.y += randomRange(-this.randomPositionAmount, this.randomPositionAmount);
      p.position.z += randomRange(-this.randomPositionAmount, this.randomPositionAmount);
    }
    Vec3.transformQuat(p.velocity, p.velocity, this.quat);
    Vec3.transformMat4(p.position, p.position, this.mat);
    if (this.sphericalDirectionAmount > 0) {
      var sphericalVel = Vec3.normalize(_intermediVec, p.position);
      Vec3.lerp(p.velocity, p.velocity, sphericalVel, this.sphericalDirectionAmount);
    }
    this.lastTime = this.particleSystem.time;
  };
  _proto.constructMat = function constructMat() {
    Quat.fromEuler(this.quat, this._rotation.x, this._rotation.y, this._rotation.z);
    Mat4.fromRTS(this.mat, this.quat, this._position, this._scale);
  };
  _proto.generateArcAngle = function generateArcAngle() {
    if (this.arcMode === ParticleArcMode.Random) {
      return randomRange(0, this._arc);
    }
    var angle = this.totalAngle + 2 * Math.PI * this.arcSpeed.evaluate(this.particleSystem.time, 1) * (this.particleSystem.time - this.lastTime);
    this.totalAngle = angle;
    if (this.arcSpread !== 0) {
      angle = Math.floor(angle / (this._arc * this.arcSpread)) * this._arc * this.arcSpread;
    }
    switch (this.arcMode) {
      case ParticleArcMode.Loop:
        return repeat(angle, this._arc);
      case ParticleArcMode.PingPong:
        return pingPong(angle, this._arc);
      default:
        return repeat(angle, this._arc);
    }
  };
  return _createClass(ShapeModule, [{
    key: "position",
    get: function get() {
      return this._position;
    },
    set: function set(val) {
      this._position = val;
      this.constructMat();
    }
  }, {
    key: "rotation",
    get: function get() {
      return this._rotation;
    },
    set: function set(val) {
      this._rotation = val;
      this.constructMat();
    }
  }, {
    key: "scale",
    get: function get() {
      return this._scale;
    },
    set: function set(val) {
      this._scale = val;
      this.constructMat();
    }
  }, {
    key: "arc",
    get: function get() {
      return toDegree(this._arc);
    },
    set: function set(val) {
      this._arc = toRadian(val);
    }
  }, {
    key: "angle",
    get: function get() {
      return Math.round(toDegree(this._angle) * 100) / 100;
    },
    set: function set(val) {
      this._angle = toRadian(val);
    }
  }, {
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      this._enable = val;
    }
  }, {
    key: "shapeType",
    get: function get() {
      return this._shapeType;
    },
    set: function set(val) {
      this._shapeType = val;
      switch (this._shapeType) {
        case ParticleShapeType.Box:
          if (this.emitFrom === ParticleEmitLocation.Base) {
            this.emitFrom = ParticleEmitLocation.Volume;
          }
          break;
        case ParticleShapeType.Cone:
          if (this.emitFrom === ParticleEmitLocation.Edge) {
            this.emitFrom = ParticleEmitLocation.Base;
          }
          break;
        case ParticleShapeType.Sphere:
        case ParticleShapeType.Hemisphere:
          if (this.emitFrom === ParticleEmitLocation.Base || this.emitFrom === ParticleEmitLocation.Edge) {
            this.emitFrom = ParticleEmitLocation.Volume;
          }
          break;
      }
    }
  }]);
}(), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$4 = applyDecoratedInitializer(_class2$4.prototype, "_shapeType", [_dec2$4, _dec3$4], function () {
  return ParticleShapeType.Cone;
}), _applyDecoratedDescriptor(_class2$4.prototype, "shapeType", [_dec4$4], Object.getOwnPropertyDescriptor(_class2$4.prototype, "shapeType"), _class2$4.prototype), _initializer3$4 = applyDecoratedInitializer(_class2$4.prototype, "emitFrom", [_dec5$4, serializable$1], function () {
  return ParticleEmitLocation.Volume;
}), _initializer4$4 = applyDecoratedInitializer(_class2$4.prototype, "alignToDirection", [serializable$1], function () {
  return false;
}), _initializer5$4 = applyDecoratedInitializer(_class2$4.prototype, "randomDirectionAmount", [serializable$1], function () {
  return 0;
}), _initializer6$4 = applyDecoratedInitializer(_class2$4.prototype, "sphericalDirectionAmount", [serializable$1], function () {
  return 0;
}), _initializer7$4 = applyDecoratedInitializer(_class2$4.prototype, "randomPositionAmount", [serializable$1], function () {
  return 0;
}), _initializer8$4 = applyDecoratedInitializer(_class2$4.prototype, "radius", [serializable$1], function () {
  return 1;
}), _initializer9$4 = applyDecoratedInitializer(_class2$4.prototype, "radiusThickness", [serializable$1], function () {
  return 1;
}), _initializer0$3 = applyDecoratedInitializer(_class2$4.prototype, "arcMode", [_dec6$4, serializable$1], function () {
  return ParticleArcMode.Random;
}), _initializer1$3 = applyDecoratedInitializer(_class2$4.prototype, "arcSpread", [serializable$1], function () {
  return 0;
}), _initializer10$3 = applyDecoratedInitializer(_class2$4.prototype, "arcSpeed", [_dec7$4, serializable$1], function () {
  return new CurveRange();
}), _initializer11$3 = applyDecoratedInitializer(_class2$4.prototype, "length", [serializable$1], function () {
  return 5;
}), _initializer12$2 = applyDecoratedInitializer(_class2$4.prototype, "boxThickness", [serializable$1], function () {
  return new Vec3(0, 0, 0);
}), _initializer13$1 = applyDecoratedInitializer(_class2$4.prototype, "_position", [serializable$1], function () {
  return new Vec3(0, 0, 0);
}), _initializer14$1 = applyDecoratedInitializer(_class2$4.prototype, "_rotation", [serializable$1], function () {
  return new Vec3(0, 0, 0);
}), _initializer15$1 = applyDecoratedInitializer(_class2$4.prototype, "_scale", [serializable$1], function () {
  return new Vec3(1, 1, 1);
}), _initializer16$1 = applyDecoratedInitializer(_class2$4.prototype, "_arc", [serializable$1], function () {
  return toRadian(360);
}), _initializer17$1 = applyDecoratedInitializer(_class2$4.prototype, "_angle", [serializable$1], function () {
  return toRadian(25);
}), _class2$4)) || _class$4);
function sphereEmit(emitFrom, radius, radiusThickness, pos, dir) {
  switch (emitFrom) {
    case ParticleEmitLocation.Volume:
      randomPointBetweenSphere(pos, radius * (1 - radiusThickness), radius);
      Vec3.normalize(dir, pos);
      break;
    case ParticleEmitLocation.Shell:
      randomUnitVector(pos);
      Vec3.multiplyScalar(pos, pos, radius);
      Vec3.normalize(dir, pos);
      break;
    default:
      warn(emitFrom + " is not supported for sphere emitter.");
  }
}
function hemisphereEmit(emitFrom, radius, radiusThickness, pos, dir) {
  switch (emitFrom) {
    case ParticleEmitLocation.Volume:
      randomPointBetweenSphere(pos, radius * (1 - radiusThickness), radius);
      if (pos.z > 0) {
        pos.z *= -1;
      }
      Vec3.normalize(dir, pos);
      break;
    case ParticleEmitLocation.Shell:
      randomUnitVector(pos);
      Vec3.multiplyScalar(pos, pos, radius);
      if (pos.z > 0) {
        pos.z *= -1;
      }
      Vec3.normalize(dir, pos);
      break;
    default:
      warn(emitFrom + " is not supported for hemisphere emitter.");
  }
}
function coneEmit(emitFrom, radius, radiusThickness, theta, angle, length, pos, dir) {
  switch (emitFrom) {
    case ParticleEmitLocation.Base:
      randomPointBetweenCircleAtFixedAngle(pos, radius * (1 - radiusThickness), radius, theta);
      Vec2.multiplyScalar(dir, pos, Math.sin(angle));
      dir.z = -Math.cos(angle) * radius;
      Vec3.normalize(dir, dir);
      pos.z = 0;
      break;
    case ParticleEmitLocation.Shell:
      fixedAngleUnitVector2(pos, theta);
      Vec2.multiplyScalar(dir, pos, Math.sin(angle));
      dir.z = -Math.cos(angle);
      Vec3.normalize(dir, dir);
      Vec2.multiplyScalar(pos, pos, radius);
      pos.z = 0;
      break;
    case ParticleEmitLocation.Volume:
      randomPointBetweenCircleAtFixedAngle(pos, radius * (1 - radiusThickness), radius, theta);
      Vec2.multiplyScalar(dir, pos, Math.sin(angle));
      dir.z = -Math.cos(angle) * radius;
      Vec3.normalize(dir, dir);
      pos.z = 0;
      Vec3.add(pos, pos, Vec3.multiplyScalar(_intermediVec, dir, length * random() / -dir.z));
      break;
    default:
      warn(emitFrom + " is not supported for cone emitter.");
  }
}
function boxEmit(emitFrom, boxThickness, pos, dir) {
  switch (emitFrom) {
    case ParticleEmitLocation.Volume:
      randomPointInCube(pos, _unitBoxExtent);
      break;
    case ParticleEmitLocation.Shell:
      _intermediArr[0] = randomRange(-0.5, 0.5);
      _intermediArr[1] = randomRange(-0.5, 0.5);
      _intermediArr[2] = randomSign() * 0.5;
      randomSortArray(_intermediArr);
      applyBoxThickness(_intermediArr, boxThickness);
      Vec3.set(pos, _intermediArr[0], _intermediArr[1], _intermediArr[2]);
      break;
    case ParticleEmitLocation.Edge:
      _intermediArr[0] = randomRange(-0.5, 0.5);
      _intermediArr[1] = randomSign() * 0.5;
      _intermediArr[2] = randomSign() * 0.5;
      randomSortArray(_intermediArr);
      applyBoxThickness(_intermediArr, boxThickness);
      Vec3.set(pos, _intermediArr[0], _intermediArr[1], _intermediArr[2]);
      break;
    default:
      warn(emitFrom + " is not supported for box emitter.");
  }
  Vec3.copy(dir, particleEmitZAxis);
}
function circleEmit(radius, radiusThickness, theta, pos, dir) {
  randomPointBetweenCircleAtFixedAngle(pos, radius * (1 - radiusThickness), radius, theta);
  Vec3.normalize(dir, pos);
}
function applyBoxThickness(pos, thickness) {
  if (thickness.x > 0) {
    pos[0] += 0.5 * randomRange(-thickness.x, thickness.x);
    pos[0] = clamp(pos[0], -0.5, 0.5);
  }
  if (thickness.y > 0) {
    pos[1] += 0.5 * randomRange(-thickness.y, thickness.y);
    pos[1] = clamp(pos[1], -0.5, 0.5);
  }
  if (thickness.z > 0) {
    pos[2] += 0.5 * randomRange(-thickness.z, thickness.z);
    pos[2] = clamp(pos[2], -0.5, 0.5);
  }
}

var _uvs$1 = [0, 0, 1, 0, 0, 1, 1, 1];
var _uvs_ins = [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0];
var ParticleBatchModel = function (_scene$Model) {
  function ParticleBatchModel() {
    var _this;
    _this = _scene$Model.call(this) || this;
    _this._capacity = void 0;
    _this._bufferSize = void 0;
    _this._vertAttrs = void 0;
    _this._vertAttribSize = void 0;
    _this._vBuffer = void 0;
    _this._vertAttrsFloatCount = void 0;
    _this._vdataF32 = void 0;
    _this._vdataUint32 = void 0;
    _this._subMeshData = void 0;
    _this._mesh = void 0;
    _this._vertCount = 0;
    _this._indexCount = 0;
    _this._startTimeOffset = 0;
    _this._lifeTimeOffset = 0;
    _this._material = null;
    _this._vertAttribSizeStatic = void 0;
    _this._vertStaticAttrsFloatCount = void 0;
    _this._insBuffers = void 0;
    _this._insIndices = void 0;
    _this._useInstance = void 0;
    _this._iaVertCount = 0;
    _this._iaIndexCount = 0;
    _this.type = ModelType.PARTICLE_BATCH;
    _this._capacity = 0;
    _this._bufferSize = 16;
    _this._vertAttrs = null;
    _this._vertAttribSize = 0;
    _this._vBuffer = null;
    _this._vertAttrsFloatCount = 0;
    _this._vdataF32 = null;
    _this._vdataUint32 = null;
    _this._vertAttribSizeStatic = 0;
    _this._vertStaticAttrsFloatCount = 0;
    _this._insBuffers = [];
    _this._insIndices = null;
    if (!deviceManager.gfxDevice.hasFeature(Feature.INSTANCED_ARRAYS)) {
      _this._useInstance = false;
    } else {
      _this._useInstance = true;
    }
    _this._subMeshData = null;
    _this._mesh = null;
    return _this;
  }
  _inheritsLoose(ParticleBatchModel, _scene$Model);
  var _proto = ParticleBatchModel.prototype;
  _proto.setCapacity = function setCapacity(capacity) {
    var capChanged = this._capacity !== capacity;
    this._capacity = capacity;
    this._bufferSize = Math.max(this._capacity, 16);
    if (this._subMeshData && capChanged) {
      this.rebuild();
    }
  };
  _proto.setVertexAttributes = function setVertexAttributes(mesh, attrs) {
    if (!this._useInstance) {
      if (this._mesh === mesh && this._vertAttrs === attrs) {
        return;
      }
      this._mesh = mesh;
      this._vertAttrs = attrs;
      this._vertAttribSize = 0;
      for (var _iterator = _createForOfIteratorHelperLoose(this._vertAttrs), _step; !(_step = _iterator()).done;) {
        var a = _step.value;
        a.offset = this._vertAttribSize;
        this._vertAttribSize += FormatInfos[a.format].size;
      }
      this._vertAttrsFloatCount = this._vertAttribSize / 4;
      this.rebuild();
    } else {
      this.setVertexAttributesIns(mesh, attrs);
    }
  };
  _proto.setVertexAttributesIns = function setVertexAttributesIns(mesh, attrs) {
    if (this._mesh === mesh && this._vertAttrs === attrs) {
      return;
    }
    this._mesh = mesh;
    this._vertAttrs = attrs;
    this._vertAttribSize = 0;
    this._vertAttribSizeStatic = 0;
    for (var _iterator2 = _createForOfIteratorHelperLoose(this._vertAttrs), _step2; !(_step2 = _iterator2()).done;) {
      var a = _step2.value;
      if (a.stream === 0) {
        a.offset = this._vertAttribSize;
        this._vertAttribSize += FormatInfos[a.format].size;
      } else if (a.stream === 1) {
        a.offset = this._vertAttribSizeStatic;
        this._vertAttribSizeStatic += FormatInfos[a.format].size;
      }
    }
    this._vertAttrsFloatCount = this._vertAttribSize / 4;
    this._vertStaticAttrsFloatCount = this._vertAttribSizeStatic / 4;
    this.rebuild();
  };
  _proto.createSubMeshData = function createSubMeshData() {
    this.destroySubMeshData();
    this._vertCount = 4;
    this._indexCount = 6;
    if (this._mesh) {
      this._vertCount = this._mesh.struct.vertexBundles[this._mesh.struct.primitives[0].vertexBundelIndices[0]].view.count;
      this._indexCount = this._mesh.struct.primitives[0].indexView.count;
    }
    var vertexBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, this._vertAttribSize * this._bufferSize * this._vertCount, this._vertAttribSize));
    var vBuffer = new ArrayBuffer(this._vertAttribSize * this._bufferSize * this._vertCount);
    if (this._mesh && this._capacity > 0) {
      var vOffset = this._vertAttrs[this._vertAttrs.findIndex(function (val) {
        return val.name === AttributeName.ATTR_TEX_COORD;
      })].offset;
      this._mesh.copyAttribute(0, AttributeName.ATTR_TEX_COORD, vBuffer, this._vertAttribSize, vOffset);
      var vIdx = this._vertAttrs.findIndex(function (val) {
        return val.name === AttributeName.ATTR_TEX_COORD3;
      });
      vOffset = this._vertAttrs[vIdx++].offset;
      this._mesh.copyAttribute(0, AttributeName.ATTR_POSITION, vBuffer, this._vertAttribSize, vOffset);
      vOffset = this._vertAttrs[vIdx++].offset;
      this._mesh.copyAttribute(0, AttributeName.ATTR_NORMAL, vBuffer, this._vertAttribSize, vOffset);
      vOffset = this._vertAttrs[vIdx++].offset;
      if (!this._mesh.copyAttribute(0, AttributeName.ATTR_COLOR, vBuffer, this._vertAttribSize, vOffset)) {
        var vb = new Uint32Array(vBuffer);
        for (var iVertex = 0; iVertex < this._vertCount; ++iVertex) {
          vb[iVertex * this._vertAttrsFloatCount + vOffset / 4] = Color.toUint32(Color.WHITE);
        }
      }
      var vbFloatArray = new Float32Array(vBuffer);
      for (var i = 1; i < this._capacity; i++) {
        vbFloatArray.copyWithin(i * this._vertAttribSize * this._vertCount / 4, 0, this._vertAttribSize * this._vertCount / 4);
      }
    }
    vertexBuffer.update(vBuffer);
    var indices = new Uint16Array(this._bufferSize * this._indexCount);
    if (this._mesh && this._capacity > 0) {
      this._mesh.copyIndices(0, indices);
      for (var _i = 1; _i < this._capacity; _i++) {
        for (var j = 0; j < this._indexCount; j++) {
          indices[_i * this._indexCount + j] = indices[j] + _i * this._vertCount;
        }
      }
    } else {
      var dst = 0;
      for (var _i2 = 0; _i2 < this._capacity; ++_i2) {
        var baseIdx = 4 * _i2;
        indices[dst++] = baseIdx;
        indices[dst++] = baseIdx + 1;
        indices[dst++] = baseIdx + 2;
        indices[dst++] = baseIdx + 3;
        indices[dst++] = baseIdx + 2;
        indices[dst++] = baseIdx + 1;
      }
    }
    var indexBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, this._bufferSize * this._indexCount * Uint16Array.BYTES_PER_ELEMENT, Uint16Array.BYTES_PER_ELEMENT));
    indexBuffer.update(indices);
    this._iaVertCount = this._capacity * this._vertCount;
    this._iaIndexCount = this._capacity * this._indexCount;
    this._subMeshData = new RenderingSubMesh([vertexBuffer], this._vertAttrs, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
    this.initSubModel(0, this._subMeshData, this._material);
    return vBuffer;
  };
  _proto.createSubMeshDataInsDynamic = function createSubMeshDataInsDynamic() {
    this._insBuffers.length = 0;
    this.destroySubMeshData();
    var vertexBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, this._vertAttribSize * this._bufferSize, this._vertAttribSize));
    var vBuffer = new ArrayBuffer(this._vertAttribSize * this._bufferSize);
    vertexBuffer.update(vBuffer);
    this._insBuffers.push(vertexBuffer);
    return vBuffer;
  };
  _proto.createSubMeshDataInsStatic = function createSubMeshDataInsStatic() {
    this._vertCount = 4;
    this._indexCount = 6;
    if (this._mesh) {
      this._vertCount = this._mesh.struct.vertexBundles[this._mesh.struct.primitives[0].vertexBundelIndices[0]].view.count;
      this._indexCount = this._mesh.struct.primitives[0].indexView.count;
    }
    var vertexBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, this._vertAttribSizeStatic * this._vertCount, this._vertAttribSizeStatic));
    var vBuffer = new ArrayBuffer(this._vertAttribSizeStatic * this._vertCount);
    if (this._mesh) {
      var vIdx = this._vertAttrs.findIndex(function (val) {
        return val.name === AttributeName.ATTR_TEX_COORD;
      });
      var vOffset = this._vertAttrs[vIdx].offset;
      this._mesh.copyAttribute(0, AttributeName.ATTR_TEX_COORD, vBuffer, this._vertAttribSizeStatic, vOffset);
      vIdx = this._vertAttrs.findIndex(function (val) {
        return val.name === AttributeName.ATTR_TEX_COORD3;
      });
      vOffset = this._vertAttrs[vIdx++].offset;
      this._mesh.copyAttribute(0, AttributeName.ATTR_POSITION, vBuffer, this._vertAttribSizeStatic, vOffset);
      vOffset = this._vertAttrs[vIdx++].offset;
      this._mesh.copyAttribute(0, AttributeName.ATTR_NORMAL, vBuffer, this._vertAttribSizeStatic, vOffset);
      vOffset = this._vertAttrs[vIdx++].offset;
      if (!this._mesh.copyAttribute(0, AttributeName.ATTR_COLOR, vBuffer, this._vertAttribSizeStatic, vOffset)) {
        var vb = new Uint32Array(vBuffer);
        for (var iVertex = 0; iVertex < this._vertCount; ++iVertex) {
          vb[iVertex * this._vertStaticAttrsFloatCount + vOffset / 4] = Color.toUint32(Color.WHITE);
        }
      }
    } else {
      var vbFloatArray = new Float32Array(vBuffer);
      for (var i = 0; i < _uvs_ins.length; ++i) {
        vbFloatArray[i] = _uvs_ins[i];
      }
    }
    vertexBuffer.update(vBuffer);
    var indices = new Uint16Array(this._indexCount);
    if (this._mesh) {
      this._mesh.copyIndices(0, indices);
    } else {
      indices[0] = 0;
      indices[1] = 1;
      indices[2] = 2;
      indices[3] = 3;
      indices[4] = 2;
      indices[5] = 1;
    }
    var indexBuffer = this._device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, this._indexCount * Uint16Array.BYTES_PER_ELEMENT, Uint16Array.BYTES_PER_ELEMENT));
    indexBuffer.update(indices);
    this._insIndices = indexBuffer;
    this._iaVertCount = this._vertCount;
    this._iaIndexCount = this._indexCount;
    this._insBuffers.push(vertexBuffer);
  };
  _proto.createInsSubmesh = function createInsSubmesh() {
    this._subMeshData = new RenderingSubMesh(this._insBuffers, this._vertAttrs, PrimitiveMode.TRIANGLE_LIST, this._insIndices);
    this.initSubModel(0, this._subMeshData, this._material);
  };
  _proto.updateMaterial = function updateMaterial(mat) {
    this._material = mat;
    this.setSubModelMaterial(0, mat);
  };
  _proto.addParticleVertexData = function addParticleVertexData(index, pvdata) {
    if (!this._useInstance) {
      if (!this._mesh) {
        var offset = index * this._vertAttrsFloatCount;
        this._vdataF32[offset++] = pvdata.position.x;
        this._vdataF32[offset++] = pvdata.position.y;
        this._vdataF32[offset++] = pvdata.position.z;
        this._vdataF32[offset++] = pvdata.texcoord.x;
        this._vdataF32[offset++] = pvdata.texcoord.y;
        this._vdataF32[offset++] = pvdata.texcoord.z;
        this._vdataF32[offset++] = pvdata.size.x;
        this._vdataF32[offset++] = pvdata.size.y;
        this._vdataF32[offset++] = pvdata.size.z;
        this._vdataF32[offset++] = pvdata.rotation.x;
        this._vdataF32[offset++] = pvdata.rotation.y;
        this._vdataF32[offset++] = pvdata.rotation.z;
        this._vdataUint32[offset++] = pvdata.color;
        if (pvdata.velocity) {
          this._vdataF32[offset++] = pvdata.velocity.x;
          this._vdataF32[offset++] = pvdata.velocity.y;
          this._vdataF32[offset++] = pvdata.velocity.z;
        }
      } else {
        for (var i = 0; i < this._vertCount; i++) {
          var _offset = (index * this._vertCount + i) * this._vertAttrsFloatCount;
          this._vdataF32[_offset++] = pvdata.position.x;
          this._vdataF32[_offset++] = pvdata.position.y;
          this._vdataF32[_offset++] = pvdata.position.z;
          _offset += 2;
          this._vdataF32[_offset++] = pvdata.texcoord.z;
          this._vdataF32[_offset++] = pvdata.size.x;
          this._vdataF32[_offset++] = pvdata.size.y;
          this._vdataF32[_offset++] = pvdata.size.z;
          this._vdataF32[_offset++] = pvdata.rotation.x;
          this._vdataF32[_offset++] = pvdata.rotation.y;
          this._vdataF32[_offset++] = pvdata.rotation.z;
          this._vdataUint32[_offset++] = pvdata.color;
        }
      }
    } else {
      this.addParticleVertexDataIns(index, pvdata);
    }
  };
  _proto.addParticleVertexDataIns = function addParticleVertexDataIns(index, pvdata) {
    var offset = index * this._vertAttrsFloatCount;
    if (!this._mesh) {
      this._vdataF32[offset++] = pvdata.position.x;
      this._vdataF32[offset++] = pvdata.position.y;
      this._vdataF32[offset++] = pvdata.position.z;
      this._vdataF32[offset++] = pvdata.texcoord.z;
      this._vdataF32[offset++] = pvdata.size.x;
      this._vdataF32[offset++] = pvdata.size.y;
      this._vdataF32[offset++] = pvdata.size.z;
      this._vdataF32[offset++] = pvdata.rotation.x;
      this._vdataF32[offset++] = pvdata.rotation.y;
      this._vdataF32[offset++] = pvdata.rotation.z;
      this._vdataUint32[offset++] = pvdata.color;
      if (pvdata.velocity) {
        this._vdataF32[offset++] = pvdata.velocity.x;
        this._vdataF32[offset++] = pvdata.velocity.y;
        this._vdataF32[offset++] = pvdata.velocity.z;
      }
    } else {
      this._vdataF32[offset++] = pvdata.position.x;
      this._vdataF32[offset++] = pvdata.position.y;
      this._vdataF32[offset++] = pvdata.position.z;
      this._vdataF32[offset++] = pvdata.texcoord.z;
      this._vdataF32[offset++] = pvdata.size.x;
      this._vdataF32[offset++] = pvdata.size.y;
      this._vdataF32[offset++] = pvdata.size.z;
      this._vdataF32[offset++] = pvdata.rotation.x;
      this._vdataF32[offset++] = pvdata.rotation.y;
      this._vdataF32[offset++] = pvdata.rotation.z;
      this._vdataUint32[offset++] = pvdata.color;
    }
  };
  _proto.addGPUParticleVertexData = function addGPUParticleVertexData(p, num, time) {
    if (!this._useInstance) {
      var offset = num * this._vertAttrsFloatCount * this._vertCount;
      for (var i = 0; i < this._vertCount; i++) {
        var idx = offset;
        this._vdataF32[idx++] = p.position.x;
        this._vdataF32[idx++] = p.position.y;
        this._vdataF32[idx++] = p.position.z;
        this._vdataF32[idx++] = time;
        this._vdataF32[idx++] = p.startSize.x;
        this._vdataF32[idx++] = p.startSize.y;
        this._vdataF32[idx++] = p.startSize.z;
        this._vdataF32[idx++] = _uvs$1[2 * i];
        this._vdataF32[idx++] = p.rotation.x;
        this._vdataF32[idx++] = p.rotation.y;
        this._vdataF32[idx++] = p.rotation.z;
        this._vdataF32[idx++] = _uvs$1[2 * i + 1];
        this._vdataF32[idx++] = p.startColor.r / 255.0;
        this._vdataF32[idx++] = p.startColor.g / 255.0;
        this._vdataF32[idx++] = p.startColor.b / 255.0;
        this._vdataF32[idx++] = p.startColor.a / 255.0;
        this._vdataF32[idx++] = p.velocity.x;
        this._vdataF32[idx++] = p.velocity.y;
        this._vdataF32[idx++] = p.velocity.z;
        this._vdataF32[idx++] = p.startLifetime;
        this._vdataF32[idx++] = p.randomSeed;
        offset += this._vertAttrsFloatCount;
      }
    } else {
      this.addGPUParticleVertexDataIns(p, num, time);
    }
  };
  _proto.addGPUParticleVertexDataIns = function addGPUParticleVertexDataIns(p, num, time) {
    var offset = num * this._vertAttrsFloatCount;
    var idx = offset;
    this._vdataF32[idx++] = p.position.x;
    this._vdataF32[idx++] = p.position.y;
    this._vdataF32[idx++] = p.position.z;
    this._vdataF32[idx++] = time;
    this._vdataF32[idx++] = p.startSize.x;
    this._vdataF32[idx++] = p.startSize.y;
    this._vdataF32[idx++] = p.startSize.z;
    this._vdataF32[idx++] = p.frameIndex;
    this._vdataF32[idx++] = p.rotation.x;
    this._vdataF32[idx++] = p.rotation.y;
    this._vdataF32[idx++] = p.rotation.z;
    this._vdataF32[idx++] = p.startColor.r / 255.0;
    this._vdataF32[idx++] = p.startColor.g / 255.0;
    this._vdataF32[idx++] = p.startColor.b / 255.0;
    this._vdataF32[idx++] = p.startColor.a / 255.0;
    this._vdataF32[idx++] = p.velocity.x;
    this._vdataF32[idx++] = p.velocity.y;
    this._vdataF32[idx++] = p.velocity.z;
    this._vdataF32[idx++] = p.startLifetime;
    this._vdataF32[idx++] = p.randomSeed;
    offset += this._vertAttrsFloatCount;
  };
  _proto.updateGPUParticles = function updateGPUParticles(num, time, dt) {
    if (!this._useInstance) {
      var pSize = this._vertAttrsFloatCount * this._vertCount;
      var pBaseIndex = 0;
      var startTime = 0;
      var lifeTime = 0;
      var lastBaseIndex = 0;
      var interval = 0;
      for (var i = 0; i < num; ++i) {
        pBaseIndex = i * pSize;
        startTime = this._vdataF32[pBaseIndex + this._startTimeOffset];
        lifeTime = this._vdataF32[pBaseIndex + this._lifeTimeOffset];
        interval = time - startTime;
        if (lifeTime - interval < dt) {
          lastBaseIndex = --num * pSize;
          this._vdataF32.copyWithin(pBaseIndex, lastBaseIndex, lastBaseIndex + pSize);
          i--;
        }
      }
      return num;
    } else {
      return this.updateGPUParticlesIns(num, time, dt);
    }
  };
  _proto.updateGPUParticlesIns = function updateGPUParticlesIns(num, time, dt) {
    var pSize = this._vertAttrsFloatCount;
    var pBaseIndex = 0;
    var startTime = 0;
    var lifeTime = 0;
    var lastBaseIndex = 0;
    var interval = 0;
    for (var i = 0; i < num; ++i) {
      pBaseIndex = i * pSize;
      startTime = this._vdataF32[pBaseIndex + this._startTimeOffset];
      lifeTime = this._vdataF32[pBaseIndex + this._lifeTimeOffset];
      interval = time - startTime;
      if (lifeTime - interval < dt) {
        lastBaseIndex = --num * pSize;
        this._vdataF32.copyWithin(pBaseIndex, lastBaseIndex, lastBaseIndex + pSize);
        i--;
      }
    }
    return num;
  };
  _proto.constructAttributeIndex = function constructAttributeIndex() {
    if (!this._vertAttrs) {
      return;
    }
    var vIdx = this._vertAttrs.findIndex(function (val) {
      return val.name === 'a_position_starttime';
    });
    var vOffset = this._vertAttrs[vIdx].offset;
    this._startTimeOffset = vOffset / 4 + 3;
    vIdx = this._vertAttrs.findIndex(function (val) {
      return val.name === 'a_dir_life';
    });
    vOffset = this._vertAttrs[vIdx].offset;
    this._lifeTimeOffset = vOffset / 4 + 3;
  };
  _proto.updateIA = function updateIA(count) {
    if (!this._useInstance) {
      if (count <= 0) {
        return;
      }
      var ia = this._subModels[0].inputAssembler;
      ia.vertexBuffers[0].update(this._vdataF32);
      ia.firstIndex = 0;
      ia.indexCount = this._indexCount * count;
      ia.vertexCount = this._iaVertCount;
    } else {
      this.updateIAIns(count);
    }
  };
  _proto.updateIAIns = function updateIAIns(count) {
    if (count <= 0) {
      return;
    }
    var ia = this._subModels[0].inputAssembler;
    ia.vertexBuffers[0].update(this._vdataF32);
    ia.instanceCount = count;
    ia.firstIndex = 0;
    ia.indexCount = this._indexCount;
    ia.instanceCount = count;
    ia.vertexCount = this._iaVertCount;
  };
  _proto.clear = function clear() {
    if (!this._useInstance) {
      this._subModels[0].inputAssembler.indexCount = 0;
    } else {
      this.clearIns();
    }
  };
  _proto.clearIns = function clearIns() {
    this._subModels[0].inputAssembler.instanceCount = 0;
  };
  _proto.destroy = function destroy() {
    _scene$Model.prototype.destroy.call(this);
    this.doDestroy();
  };
  _proto.doDestroy = function doDestroy() {
    this._vBuffer = null;
    this._vdataF32 = null;
    this._vdataUint32 = null;
    this._insBuffers = [];
    this._insIndices = null;
    this._vertAttrs = null;
    this._material = null;
    this._mesh = null;
    this.destroySubMeshData();
  };
  _proto.rebuild = function rebuild() {
    if (!this._useInstance) {
      this._vBuffer = this.createSubMeshData();
      this._vdataF32 = new Float32Array(this._vBuffer);
      this._vdataUint32 = new Uint32Array(this._vBuffer);
    } else {
      this.rebuildIns();
    }
  };
  _proto.rebuildIns = function rebuildIns() {
    this._vBuffer = this.createSubMeshDataInsDynamic();
    this._vdataF32 = new Float32Array(this._vBuffer);
    this._vdataUint32 = new Uint32Array(this._vBuffer);
    this.createSubMeshDataInsStatic();
    this.createInsSubmesh();
  };
  _proto.destroySubMeshData = function destroySubMeshData() {
    if (this._subMeshData) {
      this._subMeshData.destroy();
      this._subMeshData = null;
    }
  };
  return _createClass(ParticleBatchModel, [{
    key: "useInstance",
    get: function get() {
      return this._useInstance;
    },
    set: function set(value) {
      if (this._useInstance !== value) {
        this._useInstance = value;
      }
    }
  }]);
}(Model);

var ParticleSystemRendererBase = function () {
  function ParticleSystemRendererBase(info) {
    this._particleSystem = null;
    this._model = null;
    this._renderInfo = null;
    this._vertAttrs = [];
    this._useInstance = void 0;
    this._renderInfo = info;
    if (!deviceManager.gfxDevice.hasFeature(Feature.INSTANCED_ARRAYS)) {
      this._useInstance = false;
    } else {
      this._useInstance = true;
    }
  }
  var _proto = ParticleSystemRendererBase.prototype;
  _proto.getUseInstance = function getUseInstance() {
    return this._useInstance;
  };
  _proto.getInfo = function getInfo() {
    return this._renderInfo;
  };
  _proto.onInit = function onInit(ps) {
    this._particleSystem = ps;
  };
  _proto.onEnable = function onEnable() {
    if (!this._particleSystem) {
      return;
    }
    this.attachToScene();
    var model = this._model;
    if (model) {
      model.node = model.transform = this._particleSystem.node;
    }
  };
  _proto.onDisable = function onDisable() {
    this.detachFromScene();
  };
  _proto.onDestroy = function onDestroy() {
    if (this._model) {
      cclegacy.director.root.destroyModel(this._model);
      this._model = null;
    }
  };
  _proto.attachToScene = function attachToScene() {
    if (this._model) {
      var _this$_particleSystem;
      if (this._model.scene) {
        this.detachFromScene();
      }
      (_this$_particleSystem = this._particleSystem) == null ? void 0 : _this$_particleSystem._getRenderScene().addModel(this._model);
    }
  };
  _proto.detachFromScene = function detachFromScene() {
    if (this._model && this._model.scene) {
      this._model.scene.removeModel(this._model);
    }
  };
  _proto.setVertexAttributes = function setVertexAttributes() {
    if (this._model) {
      this.updateVertexAttrib();
      this._model.setVertexAttributes(this._renderInfo.renderMode === ParticleRenderMode.Mesh ? this._renderInfo.mesh : null, this._vertAttrs);
    }
  };
  _proto.clear = function clear() {
    if (this._model) this._model.enabled = false;
  };
  _proto.getModel = function getModel() {
    return this._model;
  };
  _proto._initModel = function _initModel() {
    if (!this._model && this._particleSystem) {
      this._model = cclegacy.director.root.createModel(ParticleBatchModel);
      this._model.setCapacity(this._particleSystem.capacity);
      this._model.visFlags = this._particleSystem.visibility;
    }
  };
  _proto.updateTrailMaterial = function updateTrailMaterial() {};
  _proto.getDefaultTrailMaterial = function getDefaultTrailMaterial() {
    return null;
  };
  return _createClass(ParticleSystemRendererBase, [{
    key: "model",
    get: function get() {
      return this._model;
    }
  }]);
}();

var ParticleNoise = function () {
  function ParticleNoise(permutation) {
    this.permutation = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
    this.accSpeed = new Vec3();
    this.noiseSpeed = new Vec3();
    this.noiseFrequency = 0.0;
    this.noiseAbs = new Vec3();
    this.noiseAmplitude = new Vec3();
    this.octaves = new Vec3();
    this.dt = 0.0;
    this.point = new Vec3();
    this.result = new Vec3();
    this.mixOut = new Vec2();
    if (permutation) {
      this.permutation = permutation;
    }
  }
  var _proto = ParticleNoise.prototype;
  _proto.noise = function noise(x, y, z, min, max) {
    if (min === void 0) {
      min = 0;
    }
    if (max === void 0) {
      max = 1;
    }
    var p = new Array(512);
    for (var i = 0; i < 256; i++) {
      p[256 + i] = p[i] = this.permutation[i];
    }
    var X = Math.floor(x) & 255;
    var Y = Math.floor(y) & 255;
    var Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    var u = this.fade(x);
    var v = this.fade(y);
    var w = this.fade(z);
    var A = p[X] + Y;
    var AA = p[A] + Z;
    var AB = p[A + 1] + Z;
    var B = p[X + 1] + Y;
    var BA = p[B] + Z;
    var BB = p[B + 1] + Z;
    var val = this.scale(this.lerp(w, this.lerp(v, this.lerp(u, this.grad(p[AA], x, y, z), this.grad(p[BA], x - 1, y, z)), this.lerp(u, this.grad(p[AB], x, y - 1, z), this.grad(p[BB], x - 1, y - 1, z))), this.lerp(v, this.lerp(u, this.grad(p[AA + 1], x, y, z - 1), this.grad(p[BA + 1], x - 1, y, z - 1)), this.lerp(u, this.grad(p[AB + 1], x, y - 1, z - 1), this.grad(p[BB + 1], x - 1, y - 1, z - 1)))));
    return min + val * (max - min);
  };
  _proto.fade = function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  };
  _proto.lerp = function lerp(t, a, b) {
    return a + t * (b - a);
  };
  _proto.grad = function grad(hash, x, y, z) {
    var h = hash & 15;
    var u = h < 8 ? x : y;
    var v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  _proto.scale = function scale(n) {
    return (1 + n) / 2;
  };
  _proto.setSpeed = function setSpeed(x, y, z) {
    this.noiseSpeed.set(x, y, z);
  };
  _proto.setFrequency = function setFrequency(f) {
    this.noiseFrequency = f;
  };
  _proto.setAbs = function setAbs(x, y, z) {
    this.noiseAbs.set(x, y, z);
  };
  _proto.setAmplititude = function setAmplititude(x, y, z) {
    this.noiseAmplitude.set(x, y, z);
  };
  _proto.setOctaves = function setOctaves(x, y, z) {
    this.octaves.set(x, y, z);
  };
  _proto.setTime = function setTime(t) {
    this.dt = t;
  };
  _proto.setSamplePoint = function setSamplePoint(p) {
    this.point.set(p);
  };
  _proto.getResult = function getResult() {
    return this.result;
  };
  _proto.getNoise = function getNoise(sx, sy, sz, time, offset, noiseFrequency, octaves) {
    var frequency = noiseFrequency;
    var sum = 0.0;
    sum += this.noise(sx * frequency, sy * frequency, sz * frequency, -1, 1.0);
    if (octaves.x === 1) {
      return sum;
    }
    var amplitude = 1.0;
    var range = 1.0;
    for (var i = 1; i < octaves.x; ++i) {
      amplitude *= octaves.y;
      frequency *= octaves.z;
      range += amplitude;
      sum += this.noise(sx * frequency, sy * frequency, sz * frequency, -1, 1.0) * amplitude;
    }
    return sum / range;
  };
  _proto.getNoiseMix = function getNoiseMix(out, point, time, offSpeed, noiseFrequency, octaves) {
    out.x = this.getNoise(point.x, point.y, point.z, time, offSpeed, noiseFrequency, octaves);
    out.y = this.getNoise(point.y, point.z, point.x, time, offSpeed, noiseFrequency, octaves);
  };
  _proto.getNoiseParticle = function getNoiseParticle() {
    this.accSpeed.set(this.noiseSpeed.x * this.dt, this.noiseSpeed.y * this.dt, this.noiseSpeed.z * this.dt);
    var axisOffset = 1000.0;
    var sampX = this.getNoise(this.point.z + this.accSpeed.x, this.point.y, this.point.x, this.dt, this.accSpeed, this.noiseFrequency, this.octaves);
    var sampY = this.getNoise(this.point.x + axisOffset, this.point.z + this.accSpeed.y, this.point.y, this.dt, this.accSpeed, this.noiseFrequency, this.octaves);
    var sampZ = this.getNoise(this.point.y, this.point.x + axisOffset, this.point.z + this.accSpeed.z, this.dt, this.accSpeed, this.noiseFrequency, this.octaves);
    this.result.set(sampX * this.noiseAmplitude.x, sampY * this.noiseAmplitude.y, sampZ * this.noiseAmplitude.z);
  };
  _proto.getPreview = function getPreview(out, width, height) {
    for (var h = 0; h < height; ++h) {
      for (var w = 0; w < width; ++w) {
        var sampx = (w - width * 0.5) / width + this.noiseSpeed.x * this.dt;
        var sampy = (h - height * 0.5) / height + this.noiseSpeed.y * this.dt;
        var pix = this.getNoise(sampx, sampy, 0.0, this.dt, this.accSpeed, this.noiseFrequency, this.octaves);
        out[h * width + w] = (pix + 1.0) * 0.5;
      }
    }
  };
  return ParticleNoise;
}();

var _tempNodeScale$1 = new Vec4();
var _tempAttribUV = v3();
var _tempWorldTrans$1 = new Mat4();
var _tempParentInverse = new Mat4();
var _node_rot$1 = new Quat();
var _animModule$1 = ['_colorOverLifetimeModule', '_sizeOvertimeModule', '_velocityOvertimeModule', '_forceOvertimeModule', '_limitVelocityOvertimeModule', '_rotationOvertimeModule', '_textureAnimationModule', '_noiseModule'];
var _uvs = [0, 0, 1, 0, 0, 1, 1, 1];
var CC_USE_WORLD_SPACE$1 = 'CC_USE_WORLD_SPACE';
var CC_USE_EMBEDDED_ALPHA$1 = 'CC_USE_EMBEDDED_ALPHA';
var CC_RENDER_MODE$1 = 'CC_RENDER_MODE';
var ROTATION_OVER_TIME_MODULE_ENABLE$1 = 'ROTATION_OVER_TIME_MODULE_ENABLE';
var INSTANCE_PARTICLE$1 = 'CC_INSTANCE_PARTICLE';
var RENDER_MODE_BILLBOARD$1 = 0;
var RENDER_MODE_STRETCHED_BILLBOARD$1 = 1;
var RENDER_MODE_HORIZONTAL_BILLBOARD$1 = 2;
var RENDER_MODE_VERTICAL_BILLBOARD$1 = 3;
var RENDER_MODE_MESH$1 = 4;
var ATTR_POSITION = AttributeName.ATTR_POSITION;
var ATTR_NORMAL = AttributeName.ATTR_NORMAL;
var ATTR_COLOR = AttributeName.ATTR_COLOR;
var ATTR_COLOR1 = AttributeName.ATTR_COLOR1;
var ATTR_TEX_COORD = AttributeName.ATTR_TEX_COORD;
var ATTR_TEX_COORD1 = AttributeName.ATTR_TEX_COORD1;
var ATTR_TEX_COORD2 = AttributeName.ATTR_TEX_COORD2;
var ATTR_TEX_COORD3 = AttributeName.ATTR_TEX_COORD3;
var ATTR_TEX_COORD4 = AttributeName.ATTR_TEX_COORD4;
function createAttribute(name, format, isNormalized, stream, isInstanced, location) {
  if (isNormalized === void 0) {
    isNormalized = false;
  }
  if (stream === void 0) {
    stream = 0;
  }
  if (isInstanced === void 0) {
    isInstanced = false;
  }
  if (location === void 0) {
    location = 0;
  }
  return new Attribute(name, format, isNormalized, stream, isInstanced, location);
}
var _vertex_attrs = [createAttribute(ATTR_POSITION, Format.RGB32F), createAttribute(ATTR_TEX_COORD, Format.RGB32F), createAttribute(ATTR_TEX_COORD1, Format.RGB32F), createAttribute(ATTR_TEX_COORD2, Format.RGB32F), createAttribute(ATTR_COLOR, Format.RGBA8, true)];
var _vertex_attrs_stretch = [createAttribute(ATTR_POSITION, Format.RGB32F), createAttribute(ATTR_TEX_COORD, Format.RGB32F), createAttribute(ATTR_TEX_COORD1, Format.RGB32F), createAttribute(ATTR_TEX_COORD2, Format.RGB32F), createAttribute(ATTR_COLOR, Format.RGBA8, true), createAttribute(ATTR_COLOR1, Format.RGB32F)];
var _vertex_attrs_mesh = [createAttribute(ATTR_POSITION, Format.RGB32F), createAttribute(ATTR_TEX_COORD, Format.RGB32F), createAttribute(ATTR_TEX_COORD1, Format.RGB32F), createAttribute(ATTR_TEX_COORD2, Format.RGB32F), createAttribute(ATTR_COLOR, Format.RGBA8, true), createAttribute(ATTR_TEX_COORD3, Format.RGB32F), createAttribute(ATTR_NORMAL, Format.RGB32F), createAttribute(ATTR_COLOR1, Format.RGBA8, true)];
var _vertex_attrs_ins = [createAttribute(ATTR_TEX_COORD4, Format.RGBA32F, false, 0, true), createAttribute(ATTR_TEX_COORD1, Format.RGB32F, false, 0, true), createAttribute(ATTR_TEX_COORD2, Format.RGB32F, false, 0, true), createAttribute(ATTR_COLOR, Format.RGBA8, true, 0, true), createAttribute(ATTR_TEX_COORD, Format.RGB32F, false, 1)];
var _vertex_attrs_stretch_ins = [createAttribute(ATTR_TEX_COORD4, Format.RGBA32F, false, 0, true), createAttribute(ATTR_TEX_COORD1, Format.RGB32F, false, 0, true), createAttribute(ATTR_TEX_COORD2, Format.RGB32F, false, 0, true), createAttribute(ATTR_COLOR, Format.RGBA8, true, 0, true), createAttribute(ATTR_COLOR1, Format.RGB32F, false, 0, true), createAttribute(ATTR_TEX_COORD, Format.RGB32F, false, 1)];
var _vertex_attrs_mesh_ins = [createAttribute(ATTR_TEX_COORD4, Format.RGBA32F, false, 0, true), createAttribute(ATTR_TEX_COORD1, Format.RGB32F, false, 0, true), createAttribute(ATTR_TEX_COORD2, Format.RGB32F, false, 0, true), createAttribute(ATTR_COLOR, Format.RGBA8, true, 0, true), createAttribute(ATTR_TEX_COORD, Format.RGB32F, false, 1), createAttribute(ATTR_TEX_COORD3, Format.RGB32F, false, 1), createAttribute(ATTR_NORMAL, Format.RGB32F, false, 1), createAttribute(ATTR_COLOR1, Format.RGBA8, true, 1)];
var _matInsInfo$1 = {
  parent: null,
  owner: null,
  subModelIdx: 0
};
var PVData = function PVData() {
  this.position = void 0;
  this.texcoord = void 0;
  this.size = void 0;
  this.rotation = void 0;
  this.color = void 0;
  this.velocity = void 0;
  this.position = v3();
  this.texcoord = v3();
  this.size = v3();
  this.rotation = v3();
  this.color = 0;
  this.velocity = null;
};
var ParticleSystemRendererCPU = function (_ParticleSystemRender) {
  function ParticleSystemRendererCPU(info) {
    var _this;
    _this = _ParticleSystemRender.call(this, info) || this;
    _this._defines = void 0;
    _this._trailDefines = void 0;
    _this._frameTile_velLenScale = void 0;
    _this._tmp_velLenScale = void 0;
    _this._defaultMat = null;
    _this._node_scale = void 0;
    _this._particleVertexData = void 0;
    _this._particles = null;
    _this._defaultTrailMat = null;
    _this._updateList = new Map();
    _this._animateList = new Map();
    _this._runAnimateList = [];
    _this._fillDataFunc = null;
    _this._uScaleHandle = 0;
    _this._uLenHandle = 0;
    _this._uNodeRotHandle = 0;
    _this._alignSpace = ParticleAlignmentSpace.View;
    _this._inited = false;
    _this._localMat = new Mat4();
    _this._gravity = new Vec4();
    _this.noise = new ParticleNoise();
    _this._model = null;
    _this._frameTile_velLenScale = new Vec4(1, 1, 0, 0);
    _this._tmp_velLenScale = _this._frameTile_velLenScale.clone();
    _this._node_scale = v3();
    _this._particleVertexData = new PVData();
    _this._defines = {
      CC_USE_WORLD_SPACE: true,
      CC_USE_BILLBOARD: true,
      CC_USE_STRETCHED_BILLBOARD: false,
      CC_USE_HORIZONTAL_BILLBOARD: false,
      CC_USE_VERTICAL_BILLBOARD: false
    };
    _this._trailDefines = {
      CC_USE_WORLD_SPACE: true
    };
    return _this;
  }
  _inheritsLoose(ParticleSystemRendererCPU, _ParticleSystemRender);
  var _proto = ParticleSystemRendererCPU.prototype;
  _proto.onInit = function onInit(ps) {
    var _this2 = this;
    _ParticleSystemRender.prototype.onInit.call(this, ps);
    this._particles = new RecyclePool(function () {
      return new Particle(_this2);
    }, 16);
    this._setVertexAttrib();
    this._setFillFunc();
    this._initModuleList();
    this._initModel();
    this.updateMaterialParams();
    this.updateTrailMaterial();
    this.setVertexAttributes();
    this._inited = true;
  };
  _proto.clear = function clear() {
    _ParticleSystemRender.prototype.clear.call(this);
    this._particles.reset();
    if (this._particleSystem && this._particleSystem._trailModule) {
      this._particleSystem._trailModule.clear();
    }
    this.updateRenderData();
    this._model.enabled = false;
  };
  _proto.updateRenderMode = function updateRenderMode() {
    this._setVertexAttrib();
    this._setFillFunc();
    this.updateMaterialParams();
    this.setVertexAttributes();
  };
  _proto.onDestroy = function onDestroy() {
    var _this$_particles;
    (_this$_particles = this._particles) == null ? void 0 : _this$_particles.destroy();
    _ParticleSystemRender.prototype.onDestroy.call(this);
  };
  _proto.getFreeParticle = function getFreeParticle() {
    if (this._particleSystem && this._particles.length >= this._particleSystem.capacity) {
      return null;
    }
    return this._particles.add();
  };
  _proto.getDefaultTrailMaterial = function getDefaultTrailMaterial() {
    return this._defaultTrailMat;
  };
  _proto.setNewParticle = function setNewParticle(p) {};
  _proto._initModuleList = function _initModuleList() {
    var _this3 = this;
    _animModule$1.forEach(function (val) {
      if (!_this3._particleSystem) {
        return;
      }
      var pm = _this3._particleSystem[val];
      if (pm && pm.enable) {
        if (pm.needUpdate) {
          _this3._updateList.set(pm.name, pm);
        }
        if (pm.needAnimate) {
          _this3._animateList.set(pm.name, pm);
        }
      }
    });
    this._runAnimateList.length = 0;
    for (var i = 0, len = PARTICLE_MODULE_ORDER.length; i < len; i++) {
      var p = this._animateList.get(PARTICLE_MODULE_ORDER[i]);
      if (p) {
        this._runAnimateList.push(p);
      }
    }
  };
  _proto.enableModule = function enableModule(name, val, pm) {
    if (val) {
      if (pm.needUpdate) {
        this._updateList.set(pm.name, pm);
      }
      if (pm.needAnimate) {
        this._animateList.set(pm.name, pm);
      }
    } else {
      this._animateList["delete"](name);
      this._updateList["delete"](name);
    }
    this._runAnimateList.length = 0;
    for (var i = 0, len = PARTICLE_MODULE_ORDER.length; i < len; i++) {
      var p = this._animateList.get(PARTICLE_MODULE_ORDER[i]);
      if (p) {
        this._runAnimateList.push(p);
      }
    }
    this.updateMaterialParams();
  };
  _proto.updateAlignSpace = function updateAlignSpace(space) {
    this._alignSpace = space;
  };
  _proto.getDefaultMaterial = function getDefaultMaterial() {
    return this._defaultMat;
  };
  _proto.updateRotation = function updateRotation(pass) {
    if (pass) {
      this.doUpdateRotation(pass);
    }
  };
  _proto.doUpdateRotation = function doUpdateRotation(pass) {
    var mode = this._renderInfo.renderMode;
    if (mode !== ParticleRenderMode.Mesh && this._alignSpace === ParticleAlignmentSpace.View) {
      return;
    }
    if (this._alignSpace === ParticleAlignmentSpace.Local) {
      var _this$_particleSystem;
      (_this$_particleSystem = this._particleSystem) == null ? void 0 : _this$_particleSystem.node.getRotation(_node_rot$1);
    } else if (this._alignSpace === ParticleAlignmentSpace.World) {
      var _this$_particleSystem2;
      (_this$_particleSystem2 = this._particleSystem) == null ? void 0 : _this$_particleSystem2.node.getWorldRotation(_node_rot$1);
    } else if (this._alignSpace === ParticleAlignmentSpace.View) {
      var _this$_particleSystem3, _this$_particleSystem4;
      _node_rot$1.set(0.0, 0.0, 0.0, 1.0);
      var cameraLst = (_this$_particleSystem3 = this._particleSystem) == null ? void 0 : (_this$_particleSystem4 = _this$_particleSystem3.node.scene.renderScene) == null ? void 0 : _this$_particleSystem4.cameras;
      if (cameraLst !== undefined) {
        for (var i = 0; i < (cameraLst == null ? void 0 : cameraLst.length); ++i) {
          var camera = cameraLst[i];
          var checkCamera = (camera.visibility & this._particleSystem.node.layer) === this._particleSystem.node.layer ;
          if (checkCamera) {
            Quat.fromViewUp(_node_rot$1, camera.forward);
            break;
          }
        }
      }
    } else {
      _node_rot$1.set(0.0, 0.0, 0.0, 1.0);
    }
    pass.setUniform(this._uNodeRotHandle, _node_rot$1);
  };
  _proto.updateScale = function updateScale(pass) {
    if (pass) {
      this.doUpdateScale(pass);
    }
  };
  _proto.doUpdateScale = function doUpdateScale(pass) {
    var _this$_particleSystem5, _this$_particleSystem6, _this$_particleSystem7;
    var nodeScale = this._node_scale;
    switch ((_this$_particleSystem5 = this._particleSystem) == null ? void 0 : _this$_particleSystem5.scaleSpace) {
      case ParticleSpace.Local:
        (_this$_particleSystem6 = this._particleSystem) == null ? void 0 : _this$_particleSystem6.node.getScale(nodeScale);
        break;
      case ParticleSpace.World:
        (_this$_particleSystem7 = this._particleSystem) == null ? void 0 : _this$_particleSystem7.node.getWorldScale(nodeScale);
        break;
    }
    pass.setUniform(this._uScaleHandle, _tempNodeScale$1.set(nodeScale.x, nodeScale.y, nodeScale.z));
  };
  _proto.updateParticles = function updateParticles(dt) {
    var _this4 = this;
    var ps = this._particleSystem;
    if (!ps) {
      return this._particles.length;
    }
    ps.node.getWorldMatrix(_tempWorldTrans$1);
    var mat = ps.getMaterialInstance(0) || this._defaultMat;
    var pass = mat.passes[0];
    this.doUpdateScale(pass);
    this.doUpdateRotation(pass);
    this._updateList.forEach(function (value, key) {});
    var trailModule = ps._trailModule;
    var trailEnable = trailModule && trailModule.enable;
    if (trailEnable) {
      trailModule.update();
    }
    var useGravity = !ps.gravityModifier.isZero();
    if (useGravity) {
      if (ps.simulationSpace === ParticleSpace.Local) {
        var r = ps.node.getRotation();
        Mat4.fromQuat(this._localMat, r);
        this._localMat.transpose();
      }
      if (ps.node.parent) {
        var _r = ps.node.parent.worldRotation;
        Mat4.fromQuat(_tempParentInverse, _r);
        _tempParentInverse.transpose();
      }
    }
    var _loop = function _loop() {
      var p = _this4._particles.data[i];
      p.remainingLifetime -= dt;
      Vec3.set(p.animatedVelocity, 0, 0, 0);
      if (p.remainingLifetime < 0.0) {
        if (trailEnable) {
          trailModule.removeParticle(p);
        }
        _this4._particles.removeAt(i);
        return 1;
      }
      if (useGravity) {
        var rand = isCurveTwoValues(ps.gravityModifier) ? pseudoRandom(p.randomSeed) : 0;
        if (ps.simulationSpace === ParticleSpace.Local) {
          var time = 1 - p.remainingLifetime / p.startLifetime;
          var gravityFactor = -ps.gravityModifier.evaluate(time, rand) * 9.8 * dt;
          _this4._gravity.x = 0.0;
          _this4._gravity.y = gravityFactor;
          _this4._gravity.z = 0.0;
          _this4._gravity.w = 1.0;
          if (!approx(gravityFactor, 0.0, EPSILON)) {
            if (ps.node.parent) {
              _this4._gravity = _this4._gravity.transformMat4(_tempParentInverse);
            }
            _this4._gravity = _this4._gravity.transformMat4(_this4._localMat);
            p.velocity.x += _this4._gravity.x;
            p.velocity.y += _this4._gravity.y;
            p.velocity.z += _this4._gravity.z;
          }
        } else {
          p.velocity.y -= ps.gravityModifier.evaluate(1 - p.remainingLifetime / p.startLifetime, rand) * 9.8 * dt;
        }
      }
      Vec3.copy(p.ultimateVelocity, p.velocity);
      _this4._runAnimateList.forEach(function (value) {
        value.animate(p, dt);
      });
      Vec3.scaleAndAdd(p.position, p.position, p.ultimateVelocity, dt);
      if (trailEnable) {
        trailModule.animate(p, dt);
      }
    };
    for (var i = this._particles.length - 1; i >= 0; i--) {
      if (_loop()) continue;
    }
    this._model.enabled = this._particles.length > 0;
    return this._particles.length;
  };
  _proto.getNoisePreview = function getNoisePreview(out, width, height) {
    var _this5 = this;
    this._runAnimateList.forEach(function (value) {
      if (value.name === PARTICLE_MODULE_NAME.NOISE) {
        var m = value;
        m.getNoisePreview(out, _this5._particleSystem, width, height);
      }
    });
  };
  _proto.updateRenderData = function updateRenderData() {
    var idx = 0;
    for (var i = 0; i < this._particles.length; ++i) {
      var p = this._particles.data[i];
      var fi = 0;
      var textureModule = this._particleSystem._textureAnimationModule;
      if (textureModule && textureModule.enable) {
        fi = p.frameIndex;
      }
      idx = i * 4;
      this._fillDataFunc(p, idx, fi);
    }
  };
  _proto.beforeRender = function beforeRender() {
    this._model.updateIA(this._particles.length);
  };
  _proto.getParticleCount = function getParticleCount() {
    return this._particles.length;
  };
  _proto.onMaterialModified = function onMaterialModified(index, material) {
    if (!this._inited) {
      return;
    }
    if (index === 0) {
      this.updateMaterialParams();
    } else {
      this.updateTrailMaterial();
    }
  };
  _proto.onRebuildPSO = function onRebuildPSO(index, material) {
    if (this._model && index === 0) {
      this._model.setSubModelMaterial(0, material);
    }
    var trailModule = this._particleSystem._trailModule;
    var trailModel = trailModule == null ? void 0 : trailModule.getModel();
    if (trailModel && index === 1) {
      trailModel.setSubModelMaterial(0, material);
    }
  };
  _proto._setFillFunc = function _setFillFunc() {
    if (this._renderInfo.renderMode === ParticleRenderMode.Mesh) {
      this._fillDataFunc = this._fillMeshData;
    } else if (this._renderInfo.renderMode === ParticleRenderMode.StrecthedBillboard) {
      this._fillDataFunc = this._fillStrecthedData;
    } else {
      this._fillDataFunc = this._fillNormalData;
    }
  };
  _proto._fillMeshData = function _fillMeshData(p, idx, fi) {
    var particleVertexData = this._particleVertexData;
    var i = idx / 4;
    Vec3.copy(particleVertexData.position, p.position);
    _tempAttribUV.z = fi;
    Vec3.copy(particleVertexData.texcoord, _tempAttribUV);
    Vec3.copy(particleVertexData.size, p.size);
    Vec3.copy(particleVertexData.rotation, p.rotation);
    particleVertexData.color = Color.toUint32(p.color);
    this._model.addParticleVertexData(i, particleVertexData);
  };
  _proto._fillStrecthedData = function _fillStrecthedData(p, idx, fi) {
    var particleVertexData = this._particleVertexData;
    if (!this._useInstance) {
      for (var j = 0; j < 4; ++j) {
        Vec3.copy(particleVertexData.position, p.position);
        _tempAttribUV.x = _uvs[2 * j];
        _tempAttribUV.y = _uvs[2 * j + 1];
        _tempAttribUV.z = fi;
        Vec3.copy(particleVertexData.texcoord, _tempAttribUV);
        Vec3.copy(particleVertexData.size, p.size);
        Vec3.copy(particleVertexData.rotation, p.rotation);
        particleVertexData.color = Color.toUint32(p.color);
        particleVertexData.velocity = p.ultimateVelocity;
        this._model.addParticleVertexData(idx++, particleVertexData);
      }
    } else {
      this._fillStrecthedDataIns(p, idx, fi);
    }
  };
  _proto._fillStrecthedDataIns = function _fillStrecthedDataIns(p, idx, fi) {
    var particleVertexData = this._particleVertexData;
    var i = idx / 4;
    Vec3.copy(particleVertexData.position, p.position);
    _tempAttribUV.z = fi;
    Vec3.copy(particleVertexData.texcoord, _tempAttribUV);
    Vec3.copy(particleVertexData.size, p.size);
    Vec3.copy(particleVertexData.rotation, p.rotation);
    particleVertexData.color = Color.toUint32(p.color);
    particleVertexData.velocity = p.ultimateVelocity;
    this._model.addParticleVertexData(i, particleVertexData);
  };
  _proto._fillNormalData = function _fillNormalData(p, idx, fi) {
    var particleVertexData = this._particleVertexData;
    if (!this._useInstance) {
      for (var j = 0; j < 4; ++j) {
        Vec3.copy(particleVertexData.position, p.position);
        _tempAttribUV.x = _uvs[2 * j];
        _tempAttribUV.y = _uvs[2 * j + 1];
        _tempAttribUV.z = fi;
        Vec3.copy(particleVertexData.texcoord, _tempAttribUV);
        Vec3.copy(particleVertexData.size, p.size);
        Vec3.copy(particleVertexData.rotation, p.rotation);
        this._particleVertexData.color = Color.toUint32(p.color);
        this._model.addParticleVertexData(idx++, particleVertexData);
      }
    } else {
      this._fillNormalDataIns(p, idx, fi);
    }
  };
  _proto._fillNormalDataIns = function _fillNormalDataIns(p, idx, fi) {
    var particleVertexData = this._particleVertexData;
    var i = idx / 4;
    Vec3.copy(particleVertexData.position, p.position);
    _tempAttribUV.z = fi;
    Vec3.copy(particleVertexData.texcoord, _tempAttribUV);
    Vec3.copy(particleVertexData.size, p.size);
    Vec3.copy(particleVertexData.rotation, p.rotation);
    this._particleVertexData.color = Color.toUint32(p.color);
    this._model.addParticleVertexData(i, particleVertexData);
  };
  _proto.updateVertexAttrib = function updateVertexAttrib() {
    if (this._renderInfo.renderMode !== ParticleRenderMode.Mesh) {
      return;
    }
    if (this._renderInfo.mesh) {
      var format = this._renderInfo.mesh.readAttributeFormat(0, AttributeName.ATTR_COLOR);
      if (format) {
        var type = Format.RGBA8;
        for (var i = 0; i < FormatInfos.length; ++i) {
          if (FormatInfos[i].name === format.name) {
            type = i;
            break;
          }
        }
        this._vertAttrs[7] = createAttribute(ATTR_COLOR1, type, true, !this._useInstance ? 0 : 1);
      } else {
        var _type = Format.RGBA8;
        this._vertAttrs[7] = createAttribute(ATTR_COLOR1, _type, true, !this._useInstance ? 0 : 1);
      }
    }
  };
  _proto._setVertexAttrib = function _setVertexAttrib() {
    if (!this._useInstance) {
      switch (this._renderInfo.renderMode) {
        case ParticleRenderMode.StrecthedBillboard:
          this._vertAttrs = _vertex_attrs_stretch.slice();
          break;
        case ParticleRenderMode.Mesh:
          this._vertAttrs = _vertex_attrs_mesh.slice();
          break;
        default:
          this._vertAttrs = _vertex_attrs.slice();
      }
    } else {
      this._setVertexAttribIns();
    }
  };
  _proto._setVertexAttribIns = function _setVertexAttribIns() {
    switch (this._renderInfo.renderMode) {
      case ParticleRenderMode.StrecthedBillboard:
        this._vertAttrs = _vertex_attrs_stretch_ins.slice();
        break;
      case ParticleRenderMode.Mesh:
        this._vertAttrs = _vertex_attrs_mesh_ins.slice();
        break;
      default:
        this._vertAttrs = _vertex_attrs_ins.slice();
    }
  };
  _proto.updateMaterialParams = function updateMaterialParams() {
    if (!this._particleSystem) {
      return;
    }
    var ps = this._particleSystem;
    var shareMaterial = ps.sharedMaterial;
    if (shareMaterial != null) {
      this._renderInfo.mainTexture = shareMaterial.getProperty('mainTexture', 0);
    }
    if (ps.sharedMaterial == null && this._defaultMat == null) {
      _matInsInfo$1.parent = builtinResMgr.get('default-particle-material');
      _matInsInfo$1.owner = this._particleSystem;
      _matInsInfo$1.subModelIdx = 0;
      this._defaultMat = new MaterialInstance(_matInsInfo$1);
      _matInsInfo$1.parent = null;
      _matInsInfo$1.owner = null;
      _matInsInfo$1.subModelIdx = 0;
      if (this._renderInfo.mainTexture !== null) {
        this._defaultMat.setProperty('mainTexture', this._renderInfo.mainTexture);
      }
    }
    var mat = ps.getMaterialInstance(0) || this._defaultMat;
    if (ps.simulationSpace === ParticleSpace.World) {
      this._defines[CC_USE_WORLD_SPACE$1] = true;
    } else {
      this._defines[CC_USE_WORLD_SPACE$1] = false;
    }
    var pass = mat.passes[0];
    this._uScaleHandle = pass.getHandle('scale');
    this._uLenHandle = pass.getHandle('frameTile_velLenScale');
    this._uNodeRotHandle = pass.getHandle('nodeRotation');
    var renderMode = this._renderInfo.renderMode;
    var vlenScale = this._frameTile_velLenScale;
    if (renderMode === ParticleRenderMode.Billboard) {
      this._defines[CC_RENDER_MODE$1] = RENDER_MODE_BILLBOARD$1;
    } else if (renderMode === ParticleRenderMode.StrecthedBillboard) {
      this._defines[CC_RENDER_MODE$1] = RENDER_MODE_STRETCHED_BILLBOARD$1;
      vlenScale.z = this._renderInfo.velocityScale;
      vlenScale.w = this._renderInfo.lengthScale;
    } else if (renderMode === ParticleRenderMode.HorizontalBillboard) {
      this._defines[CC_RENDER_MODE$1] = RENDER_MODE_HORIZONTAL_BILLBOARD$1;
    } else if (renderMode === ParticleRenderMode.VerticalBillboard) {
      this._defines[CC_RENDER_MODE$1] = RENDER_MODE_VERTICAL_BILLBOARD$1;
    } else if (renderMode === ParticleRenderMode.Mesh) {
      this._defines[CC_RENDER_MODE$1] = RENDER_MODE_MESH$1;
    } else {
      warn("particle system renderMode " + renderMode + " not support.");
    }
    var textureModule = ps._textureAnimationModule;
    if (textureModule && textureModule.enable) {
      var texture = mat.getProperty('mainTexture', 0);
      if (texture && texture.isAlphaAtlas) {
        textureModule.scaleNumTilesXY(2);
        this._defines[CC_USE_EMBEDDED_ALPHA$1] = true;
      }
      Vec4.copy(this._tmp_velLenScale, vlenScale);
      Vec2.set(this._tmp_velLenScale, textureModule.numTilesX, textureModule.numTilesY);
      pass.setUniform(this._uLenHandle, this._tmp_velLenScale);
    } else {
      pass.setUniform(this._uLenHandle, vlenScale);
    }
    var enable = false;
    var roationModule = this._particleSystem._rotationOvertimeModule;
    enable = roationModule ? roationModule.enable : false;
    this._defines[ROTATION_OVER_TIME_MODULE_ENABLE$1] = enable;
    this._defines[INSTANCE_PARTICLE$1] = this._useInstance;
    mat.recompileShaders(this._defines);
    if (this._model) {
      this._model.updateMaterial(mat);
    }
  };
  _proto.updateTrailMaterial = function updateTrailMaterial() {
    if (!this._particleSystem) {
      return;
    }
    var ps = this._particleSystem;
    var trailModule = ps._trailModule;
    if (trailModule && trailModule.enable) {
      if (ps.simulationSpace === ParticleSpace.World || trailModule.space === ParticleSpace.World) {
        this._trailDefines[CC_USE_WORLD_SPACE$1] = true;
      } else {
        this._trailDefines[CC_USE_WORLD_SPACE$1] = false;
      }
      var mat = ps.getMaterialInstance(1);
      if (mat === null && this._defaultTrailMat === null) {
        _matInsInfo$1.parent = builtinResMgr.get('default-trail-material');
        _matInsInfo$1.owner = this._particleSystem;
        _matInsInfo$1.subModelIdx = 1;
        this._defaultTrailMat = new MaterialInstance(_matInsInfo$1);
        _matInsInfo$1.parent = null;
        _matInsInfo$1.owner = null;
        _matInsInfo$1.subModelIdx = 0;
      }
      mat = mat || this._defaultTrailMat;
      var texture = mat.getProperty('mainTexture', 0);
      if (texture && texture.isAlphaAtlas) {
        this._trailDefines[CC_USE_EMBEDDED_ALPHA$1] = true;
      }
      mat.recompileShaders(this._trailDefines);
      trailModule.updateMaterial();
    }
  };
  _proto.setUseInstance = function setUseInstance(value) {
    if (this._useInstance === value) {
      return;
    }
    this._useInstance = value;
    if (this._model) {
      this._model.useInstance = value;
      this._model.doDestroy();
    }
    this.updateRenderMode();
  };
  return ParticleSystemRendererCPU;
}(ParticleSystemRendererBase);

var _tempNodeScale = new Vec4();
var _tempWorldTrans = new Mat4();
var _tempVec4 = new Vec4();
var _world_rot = new Quat();
var _node_rot = new Quat();
new Vec3();
var _sample_num = 32;
var _sample_interval = 1.0 / _sample_num;
var CC_USE_WORLD_SPACE = 'CC_USE_WORLD_SPACE';
var CC_USE_EMBEDDED_ALPHA = 'CC_USE_EMBEDDED_ALPHA';
var CC_RENDER_MODE = 'CC_RENDER_MODE';
var RENDER_MODE_BILLBOARD = 0;
var RENDER_MODE_STRETCHED_BILLBOARD = 1;
var RENDER_MODE_HORIZONTAL_BILLBOARD = 2;
var RENDER_MODE_VERTICAL_BILLBOARD = 3;
var RENDER_MODE_MESH = 4;
var COLOR_OVER_TIME_MODULE_ENABLE = 'COLOR_OVER_TIME_MODULE_ENABLE';
var ROTATION_OVER_TIME_MODULE_ENABLE = 'ROTATION_OVER_TIME_MODULE_ENABLE';
var SIZE_OVER_TIME_MODULE_ENABLE = 'SIZE_OVER_TIME_MODULE_ENABLE';
var VELOCITY_OVER_TIME_MODULE_ENABLE = 'VELOCITY_OVER_TIME_MODULE_ENABLE';
var FORCE_OVER_TIME_MODULE_ENABLE = 'FORCE_OVER_TIME_MODULE_ENABLE';
var TEXTURE_ANIMATION_MODULE_ENABLE = 'TEXTURE_ANIMATION_MODULE_ENABLE';
var USE_VK_SHADER = 'USE_VK_SHADER';
var INSTANCE_PARTICLE = 'CC_INSTANCE_PARTICLE';
var _vert_attr_name = {
  POSITION_STARTTIME: 'a_position_starttime',
  VERT_SIZE_UV: 'a_size_uv',
  VERT_ROTATION_UV: 'a_rotation_uv',
  COLOR: 'a_color',
  DIR_LIFE: 'a_dir_life',
  RANDOM_SEED: 'a_rndSeed',
  VERT_SIZE_FID: 'a_size_fid',
  VERT_ROTATION: 'a_rotation',
  VERT_UV: 'a_uv'
};
var _gpu_vert_attr = [new Attribute(_vert_attr_name.POSITION_STARTTIME, Format.RGBA32F), new Attribute(_vert_attr_name.VERT_SIZE_UV, Format.RGBA32F), new Attribute(_vert_attr_name.VERT_ROTATION_UV, Format.RGBA32F), new Attribute(_vert_attr_name.COLOR, Format.RGBA32F), new Attribute(_vert_attr_name.DIR_LIFE, Format.RGBA32F), new Attribute(_vert_attr_name.RANDOM_SEED, Format.R32F)];
var _gpu_vert_attr_mesh = [new Attribute(_vert_attr_name.POSITION_STARTTIME, Format.RGBA32F), new Attribute(_vert_attr_name.VERT_SIZE_UV, Format.RGBA32F), new Attribute(_vert_attr_name.VERT_ROTATION_UV, Format.RGBA32F), new Attribute(_vert_attr_name.COLOR, Format.RGBA32F), new Attribute(_vert_attr_name.DIR_LIFE, Format.RGBA32F), new Attribute(_vert_attr_name.RANDOM_SEED, Format.R32F), new Attribute(AttributeName.ATTR_TEX_COORD, Format.RGB32F), new Attribute(AttributeName.ATTR_TEX_COORD3, Format.RGB32F), new Attribute(AttributeName.ATTR_NORMAL, Format.RGB32F), new Attribute(AttributeName.ATTR_COLOR1, Format.RGBA8, true)];
var _gpu_vert_attr_ins = [new Attribute(_vert_attr_name.POSITION_STARTTIME, Format.RGBA32F, false, 0, true), new Attribute(_vert_attr_name.VERT_SIZE_FID, Format.RGBA32F, false, 0, true), new Attribute(_vert_attr_name.VERT_ROTATION, Format.RGB32F, false, 0, true), new Attribute(_vert_attr_name.COLOR, Format.RGBA32F, false, 0, true), new Attribute(_vert_attr_name.DIR_LIFE, Format.RGBA32F, false, 0, true), new Attribute(_vert_attr_name.RANDOM_SEED, Format.R32F, false, 0, true), new Attribute(_vert_attr_name.VERT_UV, Format.RGB32F, false, 1)];
var _gpu_vert_attr_mesh_ins = [new Attribute(_vert_attr_name.POSITION_STARTTIME, Format.RGBA32F, false, 0, true), new Attribute(_vert_attr_name.VERT_SIZE_FID, Format.RGBA32F, false, 0, true), new Attribute(_vert_attr_name.VERT_ROTATION, Format.RGB32F, false, 0, true), new Attribute(_vert_attr_name.COLOR, Format.RGBA32F, false, 0, true), new Attribute(_vert_attr_name.DIR_LIFE, Format.RGBA32F, false, 0, true), new Attribute(_vert_attr_name.RANDOM_SEED, Format.R32F, false, 0, true), new Attribute(AttributeName.ATTR_TEX_COORD, Format.RGB32F, false, 1), new Attribute(AttributeName.ATTR_TEX_COORD3, Format.RGB32F, false, 1), new Attribute(AttributeName.ATTR_NORMAL, Format.RGB32F, false, 1), new Attribute(AttributeName.ATTR_COLOR1, Format.RGBA8, true, 1)];
var _matInsInfo = {
  parent: null,
  owner: null,
  subModelIdx: 0
};
var ParticleSystemRendererGPU = function (_ParticleSystemRender) {
  function ParticleSystemRendererGPU(info) {
    var _this;
    _this = _ParticleSystemRender.call(this, info) || this;
    _this._defines = void 0;
    _this._frameTile_velLenScale = void 0;
    _this._unifrom_velLenScale = void 0;
    _this._tmp_velLenScale = void 0;
    _this._node_scale = void 0;
    _this._vertAttrs = [];
    _this._defaultMat = null;
    _this._particleNum = 0;
    _this._tempParticle = null;
    _this._colorTexture = null;
    _this._forceTexture = null;
    _this._velocityTexture = null;
    _this._rotationTexture = null;
    _this._sizeTexture = null;
    _this._animTexture = null;
    _this._colorData = null;
    _this._forceData = null;
    _this._velocityData = null;
    _this._rotationData = null;
    _this._sizeData = null;
    _this._animData = null;
    _this._uTimeHandle = 0;
    _this._uRotHandle = 0;
    _this._uNodeRotHandle = 0;
    _this._alignSpace = ParticleAlignmentSpace.View;
    _this._inited = false;
    _this._frameTile_velLenScale = new Vec4(1, 1, 0, 0);
    _this._unifrom_velLenScale = _this._frameTile_velLenScale.clone();
    _this._tmp_velLenScale = _this._frameTile_velLenScale.clone();
    _this._node_scale = new Vec3();
    _this._defines = {
      CC_USE_WORLD_SPACE: true,
      CC_USE_BILLBOARD: true,
      CC_USE_STRETCHED_BILLBOARD: false,
      CC_USE_HORIZONTAL_BILLBOARD: false,
      CC_USE_VERTICAL_BILLBOARD: false,
      COLOR_OVER_TIME_MODULE_ENABLE: false
    };
    _this._tempParticle = new Particle(null);
    _this._particleNum = 0;
    return _this;
  }
  _inheritsLoose(ParticleSystemRendererGPU, _ParticleSystemRender);
  var _proto = ParticleSystemRendererGPU.prototype;
  _proto.onInit = function onInit(ps) {
    _ParticleSystemRender.prototype.onInit.call(this, ps);
    this._setVertexAttrib();
    this._initModel();
    this.updateMaterialParams();
    this.setVertexAttributes();
    this._inited = true;
  };
  _proto.updateRenderMode = function updateRenderMode() {
    this._setVertexAttrib();
    this.updateMaterialParams();
    this.setVertexAttributes();
  };
  _proto.setVertexAttributes = function setVertexAttributes() {
    _ParticleSystemRender.prototype.setVertexAttributes.call(this);
    this._model.constructAttributeIndex();
  };
  _proto.clear = function clear() {
    _ParticleSystemRender.prototype.clear.call(this);
    this._particleNum = 0;
    this.updateRenderData();
  };
  _proto.onDestroy = function onDestroy() {
    _ParticleSystemRender.prototype.onDestroy.call(this);
    if (this._forceTexture) this._forceTexture.destroy();
    if (this._velocityTexture) this._velocityTexture.destroy();
    if (this._colorTexture) this._colorTexture.destroy();
    if (this._sizeTexture) this._sizeTexture.destroy();
    if (this._rotationTexture) this._rotationTexture.destroy();
    if (this._animTexture) this._animTexture.destroy();
    this._forceData = null;
    this._velocityData = null;
    this._colorData = null;
    this._sizeData = null;
    this._rotationData = null;
    this._animData = null;
  };
  _proto.enableModule = function enableModule(name, val, pm) {
    var _this$_particleSystem;
    var mat = ((_this$_particleSystem = this._particleSystem) == null ? void 0 : _this$_particleSystem.getMaterialInstance(0)) || this._defaultMat;
    if (!mat) {
      return;
    }
    this.initShaderUniform(mat);
    mat.recompileShaders(this._defines);
    if (this._model) {
      this._model.setSubModelMaterial(0, mat);
    }
  };
  _proto.getFreeParticle = function getFreeParticle() {
    var _this$_particleSystem2;
    if (this._particleSystem && this._particleNum >= ((_this$_particleSystem2 = this._particleSystem) == null ? void 0 : _this$_particleSystem2.capacity)) {
      return null;
    }
    return this._tempParticle;
  };
  _proto.setNewParticle = function setNewParticle(p) {
    if (!this._particleSystem) {
      return;
    }
    this._model.addGPUParticleVertexData(p, this._particleNum, this._particleSystem.time);
    this._particleNum++;
  };
  _proto.getDefaultMaterial = function getDefaultMaterial() {
    return this._defaultMat;
  };
  _proto.updateRotation = function updateRotation(pass) {
    if (pass) {
      this.doUpdateRotation(pass);
    }
  };
  _proto.doUpdateRotation = function doUpdateRotation(pass) {
    var mode = this._renderInfo.renderMode;
    if (mode !== ParticleRenderMode.Mesh && this._alignSpace === ParticleAlignmentSpace.View) {
      return;
    }
    if (this._alignSpace === ParticleAlignmentSpace.Local) {
      var _this$_particleSystem3;
      (_this$_particleSystem3 = this._particleSystem) == null ? void 0 : _this$_particleSystem3.node.getRotation(_node_rot);
    } else if (this._alignSpace === ParticleAlignmentSpace.World) {
      var _this$_particleSystem4;
      (_this$_particleSystem4 = this._particleSystem) == null ? void 0 : _this$_particleSystem4.node.getWorldRotation(_node_rot);
    } else if (this._alignSpace === ParticleAlignmentSpace.View) {
      var _this$_particleSystem5, _this$_particleSystem6;
      _node_rot.set(0.0, 0.0, 0.0, 1.0);
      var cameraLst = (_this$_particleSystem5 = this._particleSystem) == null ? void 0 : (_this$_particleSystem6 = _this$_particleSystem5.node.scene.renderScene) == null ? void 0 : _this$_particleSystem6.cameras;
      if (cameraLst !== undefined && this._particleSystem) {
        for (var i = 0; i < (cameraLst == null ? void 0 : cameraLst.length); ++i) {
          var camera = cameraLst[i];
          var checkCamera = (camera.visibility & this._particleSystem.node.layer) === this._particleSystem.node.layer ;
          if (checkCamera) {
            Quat.fromViewUp(_node_rot, camera.forward);
            break;
          }
        }
      }
    } else {
      _node_rot.set(0.0, 0.0, 0.0, 1.0);
    }
    pass.setUniform(this._uNodeRotHandle, _node_rot);
  };
  _proto.updateScale = function updateScale(pass) {
    if (pass) {
      this.doUpdateScale(pass);
    }
  };
  _proto.doUpdateScale = function doUpdateScale(pass) {
    var _this$_particleSystem7;
    var nodeScale = this._node_scale;
    switch ((_this$_particleSystem7 = this._particleSystem) == null ? void 0 : _this$_particleSystem7.scaleSpace) {
      case ParticleSpace.Local:
        this._particleSystem.node.getScale(nodeScale);
        break;
      case ParticleSpace.World:
        this._particleSystem.node.getWorldScale(nodeScale);
        break;
    }
    pass.setUniform(pass.getHandle('scale'), _tempNodeScale.set(nodeScale.x, nodeScale.y, nodeScale.z));
  };
  _proto.updateParticles = function updateParticles(dt) {
    if (!this._particleSystem) {
      return this._particleNum;
    }
    this._particleNum = this._model.updateGPUParticles(this._particleNum, this._particleSystem.time, dt);
    this.updateShaderUniform(dt);
    this._model.enabled = this._particleNum > 0;
    return this._particleNum;
  };
  _proto.updateRenderData = function updateRenderData() {};
  _proto.beforeRender = function beforeRender() {
    this._model.updateIA(this._particleNum);
  };
  _proto.updateAlignSpace = function updateAlignSpace(space) {
    this._alignSpace = space;
  };
  _proto.updateShaderUniform = function updateShaderUniform(dt) {
    if (!this._particleSystem) {
      return;
    }
    var mat = this._particleSystem.getMaterialInstance(0) || this._defaultMat;
    if (!mat) {
      return;
    }
    var pass = mat.passes[0];
    _tempVec4.x = this._particleSystem.time;
    _tempVec4.y = dt;
    pass.setUniform(this._uTimeHandle, _tempVec4);
    this._particleSystem.node.getWorldRotation(_world_rot);
    pass.setUniform(this._uRotHandle, _world_rot);
    this.doUpdateRotation(pass);
  };
  _proto.initShaderUniform = function initShaderUniform(mat) {
    var _this$_particleSystem8, _this$_particleSystem9, _this$_particleSystem0, _this$_particleSystem1, _this$_particleSystem10, _this$_particleSystem11;
    var pass = mat.passes[0];
    this._uTimeHandle = pass.getHandle('u_timeDelta');
    this._uRotHandle = pass.getHandle('u_worldRot');
    this._uNodeRotHandle = pass.getHandle('nodeRotation');
    this.doUpdateScale(pass);
    pass.setUniform(pass.getHandle('frameTile_velLenScale'), this._unifrom_velLenScale);
    _tempVec4.x = _sample_num;
    _tempVec4.y = _sample_interval;
    pass.setUniform(pass.getHandle('u_sampleInfo'), _tempVec4);
    var enable = false;
    var forceModule = (_this$_particleSystem8 = this._particleSystem) == null ? void 0 : _this$_particleSystem8._forceOvertimeModule;
    enable = forceModule ? forceModule.enable : false;
    this._defines[FORCE_OVER_TIME_MODULE_ENABLE] = enable;
    if (enable) {
      var packed = packCurveRangeXYZ(this._forceTexture, this._forceData, _sample_num, forceModule.x, forceModule.y, forceModule.z);
      this._forceTexture = packed.texture;
      this._forceData = packed.texdata;
      var handle = pass.getHandle('force_over_time_tex0');
      var binding = getBindingFromHandle(handle);
      pass.bindSampler(binding, this._forceTexture.getGFXSampler());
      pass.bindTexture(binding, this._forceTexture.getGFXTexture());
      var spaceHandle = pass.getHandle('u_force_space');
      pass.setUniform(spaceHandle, forceModule.space);
      var modeHandle = pass.getHandle('u_force_mode');
      pass.setUniform(modeHandle, this._forceTexture.height);
    }
    var velocityModule = (_this$_particleSystem9 = this._particleSystem) == null ? void 0 : _this$_particleSystem9._velocityOvertimeModule;
    enable = velocityModule ? velocityModule.enable : false;
    this._defines[VELOCITY_OVER_TIME_MODULE_ENABLE] = enable;
    if (enable) {
      var _packed = packCurveRangeXYZW(this._velocityTexture, this._velocityData, _sample_num, velocityModule.x, velocityModule.y, velocityModule.z, velocityModule.speedModifier);
      this._velocityTexture = _packed.texture;
      this._velocityData = _packed.texdata;
      var _handle = pass.getHandle('velocity_over_time_tex0');
      var _binding = getBindingFromHandle(_handle);
      pass.bindSampler(_binding, this._velocityTexture.getGFXSampler());
      pass.bindTexture(_binding, this._velocityTexture.getGFXTexture());
      var _spaceHandle = pass.getHandle('u_velocity_space');
      pass.setUniform(_spaceHandle, velocityModule.space);
      var _modeHandle = pass.getHandle('u_velocity_mode');
      pass.setUniform(_modeHandle, this._velocityTexture.height);
    }
    var colorModule = (_this$_particleSystem0 = this._particleSystem) == null ? void 0 : _this$_particleSystem0._colorOverLifetimeModule;
    enable = colorModule ? colorModule.enable : false;
    this._defines[COLOR_OVER_TIME_MODULE_ENABLE] = enable;
    if (enable) {
      var _packed2 = packGradientRange(this._colorTexture, this._colorData, _sample_num, colorModule.color);
      this._colorTexture = _packed2.texture;
      this._colorData = _packed2.texdata;
      var _handle2 = pass.getHandle('color_over_time_tex0');
      var _binding2 = getBindingFromHandle(_handle2);
      pass.bindSampler(_binding2, this._colorTexture.getGFXSampler());
      pass.bindTexture(_binding2, this._colorTexture.getGFXTexture());
      var _modeHandle2 = pass.getHandle('u_color_mode');
      pass.setUniform(_modeHandle2, this._colorTexture.height);
    }
    var roationModule = (_this$_particleSystem1 = this._particleSystem) == null ? void 0 : _this$_particleSystem1._rotationOvertimeModule;
    enable = roationModule ? roationModule.enable : false;
    this._defines[ROTATION_OVER_TIME_MODULE_ENABLE] = enable;
    if (enable) {
      var _packed3;
      if (roationModule.separateAxes) {
        _packed3 = packCurveRangeXYZ(this._rotationTexture, this._rotationData, _sample_num, roationModule.x, roationModule.y, roationModule.z);
      } else {
        _packed3 = packCurveRangeZ(this._rotationTexture, this._rotationData, _sample_num, roationModule.z);
      }
      this._rotationTexture = _packed3.texture;
      this._rotationData = _packed3.texdata;
      if (this._rotationTexture) {
        var _handle3 = pass.getHandle('rotation_over_time_tex0');
        var _binding3 = getBindingFromHandle(_handle3);
        pass.bindSampler(_binding3, this._rotationTexture.getGFXSampler());
        pass.bindTexture(_binding3, this._rotationTexture.getGFXTexture());
        var _modeHandle3 = pass.getHandle('u_rotation_mode');
        pass.setUniform(_modeHandle3, this._rotationTexture.height);
      }
    }
    var sizeModule = (_this$_particleSystem10 = this._particleSystem) == null ? void 0 : _this$_particleSystem10._sizeOvertimeModule;
    enable = sizeModule ? sizeModule.enable : false;
    this._defines[SIZE_OVER_TIME_MODULE_ENABLE] = enable;
    if (enable) {
      var _packed4;
      if (sizeModule.separateAxes) {
        _packed4 = packCurveRangeXYZ(this._sizeTexture, this._sizeData, _sample_num, sizeModule.x, sizeModule.y, sizeModule.z, true);
      } else {
        _packed4 = packCurveRangeN(this._sizeTexture, this._sizeData, _sample_num, sizeModule.size);
      }
      this._sizeTexture = _packed4.texture;
      this._sizeData = _packed4.texdata;
      if (this._sizeTexture) {
        var _handle4 = pass.getHandle('size_over_time_tex0');
        var _binding4 = getBindingFromHandle(_handle4);
        pass.bindSampler(_binding4, this._sizeTexture.getGFXSampler());
        pass.bindTexture(_binding4, this._sizeTexture.getGFXTexture());
        var _modeHandle4 = pass.getHandle('u_size_mode');
        pass.setUniform(_modeHandle4, this._sizeTexture.height);
      }
    }
    var textureModule = (_this$_particleSystem11 = this._particleSystem) == null ? void 0 : _this$_particleSystem11._textureAnimationModule;
    enable = textureModule ? textureModule.enable : false;
    this._defines[TEXTURE_ANIMATION_MODULE_ENABLE] = enable;
    if (enable) {
      var _packed5 = packCurveRangeXY(this._animTexture, this._animData, _sample_num, textureModule.startFrame, textureModule.frameOverTime);
      this._animTexture = _packed5.texture;
      this._animData = _packed5.texdata;
      var _handle5 = pass.getHandle('texture_animation_tex0');
      var _binding5 = getBindingFromHandle(_handle5);
      pass.bindSampler(_binding5, this._animTexture.getGFXSampler());
      pass.bindTexture(_binding5, this._animTexture.getGFXTexture());
      var infoHandle = pass.getHandle('u_anim_info');
      _tempVec4.x = this._animTexture.height;
      _tempVec4.y = textureModule.numTilesX * textureModule.numTilesY;
      _tempVec4.z = textureModule.cycleCount;
      pass.setUniform(infoHandle, _tempVec4);
    }
    this._defines[USE_VK_SHADER] = deviceManager.gfxDevice.gfxAPI === API.VULKAN;
    this._defines[INSTANCE_PARTICLE] = this._useInstance;
  };
  _proto.getParticleCount = function getParticleCount() {
    return this._particleNum;
  };
  _proto.onMaterialModified = function onMaterialModified(index, material) {
    if (!this._inited) {
      return;
    }
    this.updateMaterialParams();
  };
  _proto.onRebuildPSO = function onRebuildPSO(index, material) {
    if (this._model && index === 0) {
      this._model.setSubModelMaterial(0, material);
    }
  };
  _proto.updateVertexAttrib = function updateVertexAttrib() {
    if (this._renderInfo.renderMode !== ParticleRenderMode.Mesh) {
      return;
    }
    if (this._renderInfo.mesh) {
      var format = this._renderInfo.mesh.readAttributeFormat(0, AttributeName.ATTR_COLOR);
      if (format) {
        var type = Format.RGBA8;
        for (var i = 0; i < FormatInfos.length; ++i) {
          if (FormatInfos[i].name === format.name) {
            type = i;
            break;
          }
        }
        this._vertAttrs[9] = new Attribute(AttributeName.ATTR_COLOR1, type, true, !this._useInstance ? 0 : 1);
      } else {
        var _type = Format.RGBA8;
        this._vertAttrs[9] = new Attribute(AttributeName.ATTR_COLOR1, _type, true, !this._useInstance ? 0 : 1);
      }
    }
  };
  _proto._setVertexAttrib = function _setVertexAttrib() {
    if (!this._useInstance) {
      switch (this._renderInfo.renderMode) {
        case ParticleRenderMode.StrecthedBillboard:
          this._vertAttrs = _gpu_vert_attr.slice();
          break;
        case ParticleRenderMode.Mesh:
          this._vertAttrs = _gpu_vert_attr_mesh.slice();
          break;
        default:
          this._vertAttrs = _gpu_vert_attr.slice();
      }
    } else {
      this._setVertexAttribIns();
    }
  };
  _proto._setVertexAttribIns = function _setVertexAttribIns() {
    switch (this._renderInfo.renderMode) {
      case ParticleRenderMode.StrecthedBillboard:
        this._vertAttrs = _gpu_vert_attr_ins.slice();
        break;
      case ParticleRenderMode.Mesh:
        this._vertAttrs = _gpu_vert_attr_mesh_ins.slice();
        break;
      default:
        this._vertAttrs = _gpu_vert_attr_ins.slice();
    }
  };
  _proto.updateMaterialParams = function updateMaterialParams() {
    if (!this._particleSystem) {
      return;
    }
    var ps = this._particleSystem;
    var shareMaterial = ps.sharedMaterial;
    if (shareMaterial !== null) {
      this._renderInfo.mainTexture = shareMaterial.getProperty('mainTexture', 0);
    }
    if (ps.sharedMaterial == null && this._defaultMat == null) {
      _matInsInfo.parent = builtinResMgr.get('default-particle-gpu-material');
      _matInsInfo.owner = ps;
      _matInsInfo.subModelIdx = 0;
      this._defaultMat = new MaterialInstance(_matInsInfo);
      _matInsInfo.parent = null;
      _matInsInfo.owner = null;
      _matInsInfo.subModelIdx = 0;
      if (this._renderInfo.mainTexture !== null) {
        this._defaultMat.setProperty('mainTexture', this._renderInfo.mainTexture);
      }
    }
    var mat = ps.getMaterialInstance(0) || this._defaultMat;
    ps.node.getWorldMatrix(_tempWorldTrans);
    if (ps.simulationSpace === ParticleSpace.World) {
      this._defines[CC_USE_WORLD_SPACE] = true;
    } else {
      this._defines[CC_USE_WORLD_SPACE] = false;
    }
    var renderMode = this._renderInfo.renderMode;
    if (renderMode === ParticleRenderMode.Billboard) {
      this._defines[CC_RENDER_MODE] = RENDER_MODE_BILLBOARD;
    } else if (renderMode === ParticleRenderMode.StrecthedBillboard) {
      this._defines[CC_RENDER_MODE] = RENDER_MODE_STRETCHED_BILLBOARD;
      this._frameTile_velLenScale.z = this._renderInfo.velocityScale;
      this._frameTile_velLenScale.w = this._renderInfo.lengthScale;
    } else if (renderMode === ParticleRenderMode.HorizontalBillboard) {
      this._defines[CC_RENDER_MODE] = RENDER_MODE_HORIZONTAL_BILLBOARD;
    } else if (renderMode === ParticleRenderMode.VerticalBillboard) {
      this._defines[CC_RENDER_MODE] = RENDER_MODE_VERTICAL_BILLBOARD;
    } else if (renderMode === ParticleRenderMode.Mesh) {
      this._defines[CC_RENDER_MODE] = RENDER_MODE_MESH;
    } else {
      warn("particle system renderMode " + renderMode + " not support.");
    }
    var textureModule = ps._textureAnimationModule;
    if (textureModule && textureModule.enable) {
      var texture = mat.getProperty('mainTexture', 0);
      if (texture && texture.isAlphaAtlas) {
        textureModule.scaleNumTilesXY(2);
        this._defines[CC_USE_EMBEDDED_ALPHA] = true;
      }
      Vec2.set(this._frameTile_velLenScale, textureModule.numTilesX, textureModule.numTilesY);
      Vec4.copy(this._unifrom_velLenScale, this._frameTile_velLenScale);
    } else {
      this._tmp_velLenScale.z = this._frameTile_velLenScale.z;
      this._tmp_velLenScale.w = this._frameTile_velLenScale.w;
      Vec4.copy(this._unifrom_velLenScale, this._tmp_velLenScale);
    }
    this.initShaderUniform(mat);
    mat.recompileShaders(this._defines);
    if (this._model) {
      this._model.updateMaterial(mat);
    }
  };
  _proto.setUseInstance = function setUseInstance(value) {
    if (this._useInstance === value) {
      return;
    }
    this._useInstance = value;
    if (this._model) {
      this._model.useInstance = value;
      this._model.doDestroy();
    }
    this.updateRenderMode();
  };
  _proto.getNoisePreview = function getNoisePreview(out, width, height) {};
  return ParticleSystemRendererGPU;
}(ParticleSystemRendererBase);

var _dec$3, _dec2$3, _dec3$3, _dec4$3, _dec5$3, _dec6$3, _dec7$3, _dec8$3, _dec9$3, _class$3, _class2$3, _initializer$3, _initializer2$3, _initializer3$3, _initializer4$3, _initializer5$3, _initializer6$3, _initializer7$3, _initializer8$3, _initializer9$3, _ParticleSystemRenderer;
function isSupportGPUParticle() {
  var device = director.root.device;
  if (device.capabilities.maxVertexTextureUnits >= 8 && device.getFormatFeatures(Format.RGBA32F) & (FormatFeatureBit.RENDER_TARGET | FormatFeatureBit.SAMPLED_TEXTURE)) {
    return true;
  }
  cclegacy.warn('Maybe the device has restrictions on vertex textures or does not support float textures.');
  return false;
}
var ParticleSystemRenderer = (_dec$3 = ccclass$1('cc.ParticleSystemRenderer'), _dec2$3 = type$1(ParticleRenderMode), _dec3$3 = type$1(ParticleRenderMode), _dec4$3 = type$1(Mesh), _dec5$3 = type$1(Material), _dec6$3 = type$1(Material), _dec7$3 = type$1(Material), _dec8$3 = type$1(Material), _dec9$3 = type$1(ParticleAlignmentSpace), _dec$3(_class$3 = (_class2$3 = (_ParticleSystemRenderer = function () {
  function ParticleSystemRenderer() {
    this._renderMode = _initializer$3 && _initializer$3();
    this._velocityScale = _initializer2$3 && _initializer2$3();
    this._lengthScale = _initializer3$3 && _initializer3$3();
    this._mesh = _initializer4$3 && _initializer4$3();
    this._cpuMaterial = _initializer5$3 && _initializer5$3();
    this._gpuMaterial = _initializer6$3 && _initializer6$3();
    this._mainTexture = _initializer7$3 && _initializer7$3();
    this._useGPU = _initializer8$3 && _initializer8$3();
    this._alignSpace = _initializer9$3 && _initializer9$3();
    this._particleSystem = null;
  }
  var _proto = ParticleSystemRenderer.prototype;
  _proto.create = function create(ps) {
    if (this._particleSystem === null) {
      this._particleSystem = ps;
    } else if (this._particleSystem !== ps) {
      errorID(6033);
    }
  };
  _proto.onInit = function onInit(ps) {
    this.create(ps);
    var useGPU = this._useGPU && isSupportGPUParticle();
    if (!this._particleSystem.processor) {
      this._particleSystem.processor = useGPU ? new ParticleSystemRendererGPU(this) : new ParticleSystemRendererCPU(this);
      this._particleSystem.processor.updateAlignSpace(this.alignSpace);
      this._particleSystem.processor.onInit(ps);
    } else {
      errorID(6034);
    }
    if (!useGPU) {
      if (this.particleMaterial && this.particleMaterial.effectName.indexOf('particle-gpu') !== -1) {
        this.particleMaterial = null;
        warnID(6035);
      }
      this.cpuMaterial = this.particleMaterial;
    } else {
      this.gpuMaterial = this.particleMaterial;
    }
  };
  _proto._switchProcessor = function _switchProcessor() {
    if (!this._particleSystem) {
      return;
    }
    if (this._particleSystem.processor) {
      this._particleSystem.processor.detachFromScene();
      this._particleSystem.processor.clear();
      this._particleSystem.processor = null;
    }
    var useGPU = this._useGPU && isSupportGPUParticle();
    this.particleMaterial = useGPU ? this.gpuMaterial : this.cpuMaterial;
    this._particleSystem.processor = useGPU ? new ParticleSystemRendererGPU(this) : new ParticleSystemRendererCPU(this);
    this._particleSystem.processor.updateAlignSpace(this.alignSpace);
    this._particleSystem.processor.onInit(this._particleSystem);
    this._particleSystem.processor.onEnable();
    this._particleSystem.bindModule();
  };
  return _createClass(ParticleSystemRenderer, [{
    key: "renderMode",
    get: function get() {
      return this._renderMode;
    },
    set: function set(val) {
      if (this._renderMode === val) {
        return;
      }
      this._renderMode = val;
      if (this._particleSystem) {
        this._particleSystem.processor.updateRenderMode();
      }
    }
  }, {
    key: "velocityScale",
    get: function get() {
      return this._velocityScale;
    },
    set: function set(val) {
      this._velocityScale = val;
      if (this._particleSystem) {
        this._particleSystem.processor.updateMaterialParams();
      }
    }
  }, {
    key: "lengthScale",
    get: function get() {
      return this._lengthScale;
    },
    set: function set(val) {
      this._lengthScale = val;
      if (this._particleSystem) {
        this._particleSystem.processor.updateMaterialParams();
      }
    }
  }, {
    key: "mesh",
    get: function get() {
      return this._mesh;
    },
    set: function set(val) {
      this._mesh = val;
      if (this._particleSystem) {
        this._particleSystem.processor.setVertexAttributes();
      }
    }
  }, {
    key: "particleMaterial",
    get: function get() {
      if (!this._particleSystem) {
        return null;
      }
      return this._particleSystem.getSharedMaterial(0);
    },
    set: function set(val) {
      if (this._particleSystem) {
        this._particleSystem.setSharedMaterial(val, 0);
      }
    }
  }, {
    key: "cpuMaterial",
    get: function get() {
      return this._cpuMaterial;
    },
    set: function set(val) {
      if (val) {
        var effectName = val.effectName;
        if (effectName.indexOf('particle') === -1 || effectName.indexOf('particle-gpu') !== -1) {
          warnID(6035);
          return;
        }
      }
      this._cpuMaterial = val;
      this.particleMaterial = this._cpuMaterial;
    }
  }, {
    key: "gpuMaterial",
    get: function get() {
      return this._gpuMaterial;
    },
    set: function set(val) {
      if (val) {
        var effectName = val.effectName;
        if (effectName.indexOf('particle-gpu') === -1) {
          warnID(6035);
          return;
        }
      }
      this._gpuMaterial = val;
      this.particleMaterial = this._gpuMaterial;
    }
  }, {
    key: "trailMaterial",
    get: function get() {
      if (!this._particleSystem) {
        return null;
      }
      return this._particleSystem.getSharedMaterial(1);
    },
    set: function set(val) {
      if (this._particleSystem) {
        this._particleSystem.setSharedMaterial(val, 1);
      }
    }
  }, {
    key: "mainTexture",
    get: function get() {
      return this._mainTexture;
    },
    set: function set(val) {
      this._mainTexture = val;
    }
  }, {
    key: "useGPU",
    get: function get() {
      return this._useGPU;
    },
    set: function set(val) {
      if (this._useGPU === val) {
        return;
      }
      if (!isSupportGPUParticle()) {
        this._useGPU = false;
      } else {
        this._useGPU = val;
      }
      this._switchProcessor();
    }
  }, {
    key: "alignSpace",
    get: function get() {
      return this._alignSpace;
    },
    set: function set(val) {
      this._alignSpace = val;
      this._particleSystem.processor.updateAlignSpace(this._alignSpace);
    }
  }]);
}(), _ParticleSystemRenderer.AlignmentSpace = ParticleAlignmentSpace, _ParticleSystemRenderer), _applyDecoratedDescriptor(_class2$3.prototype, "renderMode", [_dec2$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "renderMode"), _class2$3.prototype), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "_renderMode", [_dec3$3, serializable$1], function () {
  return ParticleRenderMode.Billboard;
}), _initializer2$3 = applyDecoratedInitializer(_class2$3.prototype, "_velocityScale", [serializable$1], function () {
  return 1;
}), _initializer3$3 = applyDecoratedInitializer(_class2$3.prototype, "_lengthScale", [serializable$1], function () {
  return 1;
}), _initializer4$3 = applyDecoratedInitializer(_class2$3.prototype, "_mesh", [serializable$1], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$3.prototype, "mesh", [_dec4$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "mesh"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "particleMaterial", [_dec5$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "particleMaterial"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "cpuMaterial", [_dec6$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "cpuMaterial"), _class2$3.prototype), _initializer5$3 = applyDecoratedInitializer(_class2$3.prototype, "_cpuMaterial", [serializable$1], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$3.prototype, "gpuMaterial", [_dec7$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "gpuMaterial"), _class2$3.prototype), _initializer6$3 = applyDecoratedInitializer(_class2$3.prototype, "_gpuMaterial", [serializable$1], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$3.prototype, "trailMaterial", [_dec8$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "trailMaterial"), _class2$3.prototype), _initializer7$3 = applyDecoratedInitializer(_class2$3.prototype, "_mainTexture", [serializable$1], function () {
  return null;
}), _initializer8$3 = applyDecoratedInitializer(_class2$3.prototype, "_useGPU", [serializable$1], function () {
  return false;
}), _applyDecoratedDescriptor(_class2$3.prototype, "alignSpace", [_dec9$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "alignSpace"), _class2$3.prototype), _initializer9$3 = applyDecoratedInitializer(_class2$3.prototype, "_alignSpace", [serializable$1], function () {
  return ParticleAlignmentSpace.View;
}), _class2$3)) || _class$3);

var _dec$2, _dec2$2, _dec3$2, _dec4$2, _dec5$2, _dec6$2, _dec7$2, _dec8$2, _dec9$2, _class$2, _class2$2, _initializer$2, _initializer2$2, _initializer3$2, _initializer4$2, _initializer5$2, _initializer6$2, _initializer7$2, _initializer8$2, _initializer9$2, _initializer0$2, _initializer1$2, _initializer10$2, _initializer11$2;
var PRE_TRIANGLE_INDEX = 1;
var NEXT_TRIANGLE_INDEX = 1 << 2;
var DIRECTION_THRESHOLD = Math.cos(toRadian(100));
var _temp_trailEle = {
  position: new Vec3(),
  velocity: new Vec3()
};
var _temp_quat = new Quat();
var _temp_vec3 = new Vec3();
var _temp_vec3_1 = new Vec3();
var _temp_color = new Color();
var TrailSegment = function () {
  function TrailSegment(maxTrailElementNum) {
    this.start = void 0;
    this.end = void 0;
    this.trailElements = void 0;
    this.start = -1;
    this.end = -1;
    this.trailElements = [];
    while (maxTrailElementNum--) {
      this.trailElements.push({
        position: new Vec3(),
        lifetime: 0,
        width: 0,
        velocity: new Vec3(),
        direction: 0,
        color: new Color()
      });
    }
  }
  var _proto = TrailSegment.prototype;
  _proto.getElement = function getElement(idx) {
    if (this.start === -1) {
      return null;
    }
    if (idx < 0) {
      idx = (idx + this.trailElements.length) % this.trailElements.length;
    }
    if (idx >= this.trailElements.length) {
      idx %= this.trailElements.length;
    }
    return this.trailElements[idx];
  };
  _proto.addElement = function addElement() {
    if (this.trailElements.length === 0) {
      return null;
    }
    if (this.start === -1) {
      this.start = 0;
      this.end = 1;
      return this.trailElements[0];
    }
    if (this.start === this.end) {
      this.trailElements.splice(this.end, 0, {
        position: new Vec3(),
        lifetime: 0,
        width: 0,
        velocity: new Vec3(),
        direction: 0,
        color: new Color()
      });
      this.start++;
      this.start %= this.trailElements.length;
    }
    var newEleLoc = this.end++;
    this.end %= this.trailElements.length;
    return this.trailElements[newEleLoc];
  };
  _proto.iterateElement = function iterateElement(target, f, p, dt) {
    var end = this.start >= this.end ? this.end + this.trailElements.length : this.end;
    for (var i = this.start; i < end; i++) {
      if (f(target, this.trailElements[i % this.trailElements.length], p, dt)) {
        this.start++;
        this.start %= this.trailElements.length;
      }
    }
    if (this.start === end) {
      this.start = -1;
      this.end = -1;
    }
  };
  _proto.count = function count() {
    if (this.start < this.end) {
      return this.end - this.start;
    } else {
      return this.trailElements.length + this.end - this.start;
    }
  };
  _proto.clear = function clear() {
    this.start = -1;
    this.end = -1;
  };
  return TrailSegment;
}();
var TrailModule = (_dec$2 = ccclass$1('cc.TrailModule'), _dec2$2 = type$1(ParticleTrailMode), _dec3$2 = type$1(CurveRange), _dec4$2 = type$1(ParticleSpace), _dec5$2 = type$1(ParticleTextureMode), _dec6$2 = type$1(CurveRange), _dec7$2 = type$1(GradientRange), _dec8$2 = type$1(GradientRange), _dec9$2 = type$1(ParticleSpace), _dec$2(_class$2 = (_class2$2 = function () {
  function TrailModule() {
    this._enable = _initializer$2 && _initializer$2();
    this.mode = _initializer2$2 && _initializer2$2();
    this.lifeTime = _initializer3$2 && _initializer3$2();
    this._minParticleDistance = _initializer4$2 && _initializer4$2();
    this.existWithParticles = _initializer5$2 && _initializer5$2();
    this.textureMode = _initializer6$2 && _initializer6$2();
    this.widthFromParticle = _initializer7$2 && _initializer7$2();
    this.widthRatio = _initializer8$2 && _initializer8$2();
    this.colorFromParticle = _initializer9$2 && _initializer9$2();
    this.colorOverTrail = _initializer0$2 && _initializer0$2();
    this.colorOvertime = _initializer1$2 && _initializer1$2();
    this._space = _initializer10$2 && _initializer10$2();
    this._particleSystem = _initializer11$2 && _initializer11$2();
    this._minSquaredDistance = 0;
    this._vertSize = void 0;
    this._trailNum = 0;
    this._trailLifetime = 0;
    this.vbOffset = 0;
    this.ibOffset = 0;
    this._trailSegments = null;
    this._particleTrail = void 0;
    this._trailModel = null;
    this._subMeshData = null;
    this._vertAttrs = void 0;
    this._vbF32 = null;
    this._vbUint32 = null;
    this._iBuffer = null;
    this._needTransform = false;
    this._material = null;
    this._psTransform = new Mat4();
    this._iaVertCount = 0;
    this._iaIndexCount = 0;
    this._vertAttrs = [new Attribute(AttributeName.ATTR_POSITION, Format.RGB32F), new Attribute(AttributeName.ATTR_TEX_COORD, Format.RGBA32F), new Attribute(AttributeName.ATTR_TEX_COORD1, Format.RGB32F), new Attribute(AttributeName.ATTR_COLOR, Format.RGBA8, true)];
    this._vertSize = this._vertAttrs.reduce(function (size, attr) {
      return size + FormatInfos[attr.format].size;
    }, 0);
    this._particleTrail = new Map();
    this._inited = false;
  }
  var _proto2 = TrailModule.prototype;
  _proto2.getModel = function getModel() {
    return this._trailModel;
  };
  _proto2.onInit = function onInit(ps) {
    this._particleSystem = ps;
    this.minParticleDistance = this._minParticleDistance;
    var burstCount = 0;
    var psTime = ps.startLifetime.getMax();
    var psRate = ps.rateOverTime.getMax();
    var duration = ps.duration;
    for (var i = 0, len = ps.bursts.length; i < len; i++) {
      var b = ps.bursts[i];
      burstCount += b.getMaxCount(ps) * Math.ceil(psTime / duration);
    }
    if (this.lifeTime.getMax() < 1.0) {
      warnID(6036);
    }
    this._trailNum = Math.ceil(psTime * Math.ceil(this.lifeTime.getMax()) * 60 * (psRate * duration + burstCount));
    this._trailSegments = new Pool(function () {
      return new TrailSegment(10);
    }, Math.ceil(psRate * duration), function (obj) {
      obj.trailElements.length = 0;
    });
    if (this._enable) {
      this.enable = this._enable;
    }
    this._inited = true;
  };
  _proto2.onEnable = function onEnable() {
    this._attachToScene();
  };
  _proto2.onDisable = function onDisable() {
    this._particleTrail.clear();
    this._detachFromScene();
  };
  _proto2._attachToScene = function _attachToScene() {
    if (this._trailModel) {
      if (this._trailModel.scene) {
        this._detachFromScene();
      }
      this._particleSystem._getRenderScene().addModel(this._trailModel);
    }
  };
  _proto2._detachFromScene = function _detachFromScene() {
    if (this._trailModel && this._trailModel.scene) {
      this._trailModel.scene.removeModel(this._trailModel);
    }
  };
  _proto2.destroy = function destroy() {
    this.destroySubMeshData();
    if (this._trailModel) {
      director.root.destroyModel(this._trailModel);
      this._trailModel = null;
    }
    if (this._trailSegments) {
      this._trailSegments.destroy();
      this._trailSegments = null;
    }
  };
  _proto2.play = function play() {
    if (this._trailModel && this._enable) {
      this._trailModel.enabled = true;
    }
  };
  _proto2.clear = function clear() {
    if (this.enable) {
      var trailIter = this._particleTrail.values();
      var trail = trailIter.next();
      while (!trail.done) {
        trail.value.clear();
        trail = trailIter.next();
      }
      this._particleTrail.clear();
      this.updateRenderData();
      if (this._trailModel) this._trailModel.enabled = false;
    }
  };
  _proto2.updateMaterial = function updateMaterial() {
    if (this._particleSystem) {
      this._material = this._particleSystem.getMaterialInstance(1) || this._particleSystem.processor.getDefaultTrailMaterial();
      if (this._trailModel) {
        this._trailModel.setSubModelMaterial(0, this._material);
      }
    }
  };
  _proto2.update = function update() {
    this._trailLifetime = this.lifeTime.evaluate(this._particleSystem.time, 1);
    if (this.space === ParticleSpace.World && this._particleSystem.simulationSpace === ParticleSpace.Local) {
      this._needTransform = true;
      this._particleSystem.node.getWorldMatrix(this._psTransform);
      this._particleSystem.node.getWorldRotation(_temp_quat);
    } else {
      this._needTransform = false;
    }
  };
  _proto2.animate = function animate(p, scaledDt) {
    if (!this._trailSegments) {
      return;
    }
    if (p.loopCount > p.lastLoop) {
      if (p.trailDelay > 1) {
        p.lastLoop = p.loopCount;
        p.trailDelay = 0;
      } else {
        p.trailDelay++;
      }
      return;
    }
    var trail = this._particleTrail.get(p);
    if (!trail) {
      trail = this._trailSegments.alloc();
      this._particleTrail.set(p, trail);
      return;
    }
    var lastSeg = trail.getElement(trail.end - 1);
    if (this._needTransform) {
      Vec3.transformMat4(_temp_vec3, p.position, this._psTransform);
    } else {
      Vec3.copy(_temp_vec3, p.position);
    }
    if (lastSeg) {
      trail.iterateElement(this, this._updateTrailElement, p, scaledDt);
      if (Vec3.squaredDistance(lastSeg.position, _temp_vec3) < this._minSquaredDistance) {
        return;
      }
    }
    lastSeg = trail.addElement();
    if (!lastSeg) {
      return;
    }
    Vec3.copy(lastSeg.position, _temp_vec3);
    lastSeg.lifetime = 0;
    if (this.widthFromParticle) {
      lastSeg.width = p.size.x * this.widthRatio.evaluate(0, 1);
    } else {
      lastSeg.width = this.widthRatio.evaluate(0, 1);
    }
    var trailNum = trail.count();
    if (trailNum === 2) {
      var lastSecondTrail = trail.getElement(trail.end - 2);
      Vec3.subtract(lastSecondTrail.velocity, lastSeg.position, lastSecondTrail.position);
    } else if (trailNum > 2) {
      var _lastSecondTrail = trail.getElement(trail.end - 2);
      var lastThirdTrail = trail.getElement(trail.end - 3);
      Vec3.subtract(_temp_vec3, lastThirdTrail.position, _lastSecondTrail.position);
      Vec3.subtract(_temp_vec3_1, lastSeg.position, _lastSecondTrail.position);
      Vec3.subtract(_lastSecondTrail.velocity, _temp_vec3_1, _temp_vec3);
      if (Vec3.equals(Vec3.ZERO, _lastSecondTrail.velocity)) {
        Vec3.copy(_lastSecondTrail.velocity, _temp_vec3);
      }
      Vec3.normalize(_lastSecondTrail.velocity, _lastSecondTrail.velocity);
      this._checkDirectionReverse(_lastSecondTrail, lastThirdTrail);
    }
    if (this.colorFromParticle) {
      lastSeg.color.set(p.color);
    } else {
      lastSeg.color.set(this.colorOvertime.evaluate(0, 1));
    }
  };
  _proto2.removeParticle = function removeParticle(p) {
    var trail = this._particleTrail.get(p);
    if (trail && this._trailSegments) {
      trail.clear();
      this._trailSegments.free(trail);
      this._particleTrail["delete"](p);
    }
  };
  _proto2.updateRenderData = function updateRenderData() {
    this.vbOffset = 0;
    this.ibOffset = 0;
    for (var _iterator = _createForOfIteratorHelperLoose(this._particleTrail.keys()), _step; !(_step = _iterator()).done;) {
      var p = _step.value;
      var trailSeg = this._particleTrail.get(p);
      if (trailSeg.start === -1) {
        continue;
      }
      var indexOffset = this.vbOffset * 4 / this._vertSize;
      var end = trailSeg.start >= trailSeg.end ? trailSeg.end + trailSeg.trailElements.length : trailSeg.end;
      var trailNum = end - trailSeg.start;
      var textCoordSeg = 1 / trailNum;
      var startSegEle = trailSeg.trailElements[trailSeg.start];
      this._fillVertexBuffer(startSegEle, this.colorOverTrail.evaluate(1, 1), indexOffset, 1, 0, NEXT_TRIANGLE_INDEX);
      for (var i = trailSeg.start + 1; i < end; i++) {
        var segEle = trailSeg.trailElements[i % trailSeg.trailElements.length];
        var j = i - trailSeg.start;
        this._fillVertexBuffer(segEle, this.colorOverTrail.evaluate(1 - j / trailNum, 1), indexOffset, 1 - j * textCoordSeg, j, PRE_TRIANGLE_INDEX | NEXT_TRIANGLE_INDEX);
      }
      if (this._needTransform) {
        Vec3.transformMat4(_temp_trailEle.position, p.position, this._psTransform);
      } else {
        Vec3.copy(_temp_trailEle.position, p.position);
      }
      var trailModel = this._trailModel;
      if (trailModel) {
        trailModel.node.invalidateChildren(TransformBit.POSITION);
      }
      if (trailNum === 1 || trailNum === 2) {
        var lastSecondTrail = trailSeg.getElement(trailSeg.end - 1);
        Vec3.subtract(lastSecondTrail.velocity, _temp_trailEle.position, lastSecondTrail.position);
        var vbF32 = this._vbF32;
        var vbOffset = this.vbOffset;
        var vertSizeDiv4 = this._vertSize / 4;
        var lastSecondTrailVelocity = lastSecondTrail.velocity;
        vbF32[vbOffset - vertSizeDiv4 - 4] = lastSecondTrailVelocity.x;
        vbF32[vbOffset - vertSizeDiv4 - 3] = lastSecondTrailVelocity.y;
        vbF32[vbOffset - vertSizeDiv4 - 2] = lastSecondTrailVelocity.z;
        vbF32[vbOffset - 4] = lastSecondTrailVelocity.x;
        vbF32[vbOffset - 3] = lastSecondTrailVelocity.y;
        vbF32[vbOffset - 2] = lastSecondTrailVelocity.z;
        Vec3.subtract(_temp_trailEle.velocity, _temp_trailEle.position, lastSecondTrail.position);
        this._checkDirectionReverse(_temp_trailEle, lastSecondTrail);
      } else if (trailNum > 2) {
        var _lastSecondTrail2 = trailSeg.getElement(trailSeg.end - 1);
        var lastThirdTrail = trailSeg.getElement(trailSeg.end - 2);
        Vec3.subtract(_temp_vec3, lastThirdTrail.position, _lastSecondTrail2.position);
        Vec3.subtract(_temp_vec3_1, _temp_trailEle.position, _lastSecondTrail2.position);
        Vec3.normalize(_temp_vec3, _temp_vec3);
        Vec3.normalize(_temp_vec3_1, _temp_vec3_1);
        Vec3.subtract(_lastSecondTrail2.velocity, _temp_vec3_1, _temp_vec3);
        Vec3.normalize(_lastSecondTrail2.velocity, _lastSecondTrail2.velocity);
        this._checkDirectionReverse(_lastSecondTrail2, lastThirdTrail);
        this.vbOffset -= this._vertSize / 4 * 2;
        this.ibOffset -= 6;
        this._fillVertexBuffer(_lastSecondTrail2, this.colorOverTrail.evaluate(textCoordSeg, 1), indexOffset, textCoordSeg, trailNum - 1, PRE_TRIANGLE_INDEX | NEXT_TRIANGLE_INDEX);
        Vec3.subtract(_temp_trailEle.velocity, _temp_trailEle.position, _lastSecondTrail2.position);
        Vec3.normalize(_temp_trailEle.velocity, _temp_trailEle.velocity);
        this._checkDirectionReverse(_temp_trailEle, _lastSecondTrail2);
      }
      if (this.widthFromParticle) {
        _temp_trailEle.width = p.size.x * this.widthRatio.evaluate(0, 1);
      } else {
        _temp_trailEle.width = this.widthRatio.evaluate(0, 1);
      }
      _temp_trailEle.color = p.color;
      if (Vec3.equals(_temp_trailEle.velocity, Vec3.ZERO)) {
        this.ibOffset -= 3;
      } else {
        this._fillVertexBuffer(_temp_trailEle, this.colorOverTrail.evaluate(0, 1), indexOffset, 0, trailNum, PRE_TRIANGLE_INDEX);
      }
    }
    if (this._trailModel) {
      this._trailModel.enabled = this.ibOffset > 0;
    }
  };
  _proto2.updateIA = function updateIA(count) {
    var subModels = this._trailModel && this._trailModel.subModels;
    if (subModels && subModels.length > 0) {
      var subModel = subModels[0];
      subModel.inputAssembler.vertexBuffers[0].update(this._vbF32);
      subModel.inputAssembler.indexBuffer.update(this._iBuffer);
      subModel.inputAssembler.firstIndex = 0;
      subModel.inputAssembler.indexCount = count;
      subModel.inputAssembler.vertexCount = this._iaVertCount;
    }
  };
  _proto2.beforeRender = function beforeRender() {
    this.updateIA(this.ibOffset);
  };
  _proto2._createModel = function _createModel() {
    if (this._trailModel) {
      return;
    }
    this._trailModel = cclegacy.director.root.createModel(Model);
  };
  _proto2.rebuild = function rebuild() {
    var self = this;
    var device = director.root.device;
    var vertexBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, self._vertSize * (self._trailNum + 1) * 2, self._vertSize));
    var vBuffer = new ArrayBuffer(self._vertSize * (self._trailNum + 1) * 2);
    self._vbF32 = new Float32Array(vBuffer);
    self._vbUint32 = new Uint32Array(vBuffer);
    vertexBuffer.update(vBuffer);
    var indexBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, Math.max(1, self._trailNum) * 6 * Uint16Array.BYTES_PER_ELEMENT, Uint16Array.BYTES_PER_ELEMENT));
    self._iBuffer = new Uint16Array(Math.max(1, self._trailNum) * 6);
    indexBuffer.update(self._iBuffer);
    self._iaVertCount = (self._trailNum + 1) * 2;
    self._iaIndexCount = self._trailNum * 6;
    self._subMeshData = new RenderingSubMesh([vertexBuffer], self._vertAttrs, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
    var trailModel = self._trailModel;
    if (trailModel && self._material) {
      trailModel.node = trailModel.transform = self._particleSystem.node;
      trailModel.visFlags = self._particleSystem.visibility;
      trailModel.initSubModel(0, self._subMeshData, self._material);
      trailModel.enabled = true;
    }
  };
  _proto2._updateTrailElement = function _updateTrailElement(module, trailEle, p, dt) {
    trailEle.lifetime += dt;
    if (module.colorFromParticle) {
      trailEle.color.set(p.color);
      trailEle.color.multiply(module.colorOvertime.evaluate(1.0 - p.remainingLifetime / p.startLifetime, 1));
    } else {
      trailEle.color.set(module.colorOvertime.evaluate(1.0 - p.remainingLifetime / p.startLifetime, 1));
    }
    if (module.widthFromParticle) {
      trailEle.width = p.size.x * module.widthRatio.evaluate(trailEle.lifetime / module._trailLifetime, 1);
    } else {
      trailEle.width = module.widthRatio.evaluate(trailEle.lifetime / module._trailLifetime, 1);
    }
    return trailEle.lifetime > module._trailLifetime;
  };
  _proto2._fillVertexBuffer = function _fillVertexBuffer(trailSeg, colorModifer, indexOffset, xTexCoord, trailEleIdx, indexSet) {
    this._vbF32[this.vbOffset++] = trailSeg.position.x;
    this._vbF32[this.vbOffset++] = trailSeg.position.y;
    this._vbF32[this.vbOffset++] = trailSeg.position.z;
    this._vbF32[this.vbOffset++] = trailSeg.direction;
    this._vbF32[this.vbOffset++] = trailSeg.width;
    this._vbF32[this.vbOffset++] = xTexCoord;
    this._vbF32[this.vbOffset++] = 0;
    this._vbF32[this.vbOffset++] = trailSeg.velocity.x;
    this._vbF32[this.vbOffset++] = trailSeg.velocity.y;
    this._vbF32[this.vbOffset++] = trailSeg.velocity.z;
    _temp_color.set(trailSeg.color);
    _temp_color.multiply(colorModifer);
    this._vbUint32[this.vbOffset++] = Color.toUint32(_temp_color);
    this._vbF32[this.vbOffset++] = trailSeg.position.x;
    this._vbF32[this.vbOffset++] = trailSeg.position.y;
    this._vbF32[this.vbOffset++] = trailSeg.position.z;
    this._vbF32[this.vbOffset++] = 1 - trailSeg.direction;
    this._vbF32[this.vbOffset++] = trailSeg.width;
    this._vbF32[this.vbOffset++] = xTexCoord;
    this._vbF32[this.vbOffset++] = 1;
    this._vbF32[this.vbOffset++] = trailSeg.velocity.x;
    this._vbF32[this.vbOffset++] = trailSeg.velocity.y;
    this._vbF32[this.vbOffset++] = trailSeg.velocity.z;
    this._vbUint32[this.vbOffset++] = Color.toUint32(_temp_color);
    if (indexSet & PRE_TRIANGLE_INDEX) {
      this._iBuffer[this.ibOffset++] = indexOffset + 2 * trailEleIdx;
      this._iBuffer[this.ibOffset++] = indexOffset + 2 * trailEleIdx - 1;
      this._iBuffer[this.ibOffset++] = indexOffset + 2 * trailEleIdx + 1;
    }
    if (indexSet & NEXT_TRIANGLE_INDEX) {
      this._iBuffer[this.ibOffset++] = indexOffset + 2 * trailEleIdx;
      this._iBuffer[this.ibOffset++] = indexOffset + 2 * trailEleIdx + 1;
      this._iBuffer[this.ibOffset++] = indexOffset + 2 * trailEleIdx + 2;
    }
  };
  _proto2._checkDirectionReverse = function _checkDirectionReverse(currElement, prevElement) {
    if (Vec3.dot(currElement.velocity, prevElement.velocity) < DIRECTION_THRESHOLD) {
      currElement.direction = 1 - prevElement.direction;
    } else {
      currElement.direction = prevElement.direction;
    }
  };
  _proto2.destroySubMeshData = function destroySubMeshData() {
    if (this._subMeshData) {
      this._subMeshData.destroy();
      this._subMeshData = null;
    }
  };
  return _createClass(TrailModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (val === this._enable && this._trailModel) {
        return;
      }
      if (val && !this._enable) {
        this._enable = val;
        if (this._particleSystem.processor) this._particleSystem.processor.updateTrailMaterial();
      }
      if (val && !this._trailModel) {
        this._createModel();
        this.rebuild();
      }
      this._enable = val;
      if (this._trailModel) {
        this._trailModel.enabled = val;
      }
      if (val) this.onEnable();else this.onDisable();
    }
  }, {
    key: "minParticleDistance",
    get: function get() {
      return this._minParticleDistance;
    },
    set: function set(val) {
      this._minParticleDistance = val;
      this._minSquaredDistance = val * val;
    }
  }, {
    key: "space",
    get: function get() {
      return this._space;
    },
    set: function set(val) {
      this._space = val;
      var ps = this._particleSystem;
      if (ps && ps.processor) {
        ps.processor.updateTrailMaterial();
      }
    }
  }, {
    key: "inited",
    get: function get() {
      return this._inited;
    }
  }]);
}(), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_enable", [serializable$1], function () {
  return false;
}), _initializer2$2 = applyDecoratedInitializer(_class2$2.prototype, "mode", [_dec2$2, serializable$1], function () {
  return ParticleTrailMode.Particles;
}), _initializer3$2 = applyDecoratedInitializer(_class2$2.prototype, "lifeTime", [_dec3$2, serializable$1], function () {
  return new CurveRange();
}), _initializer4$2 = applyDecoratedInitializer(_class2$2.prototype, "_minParticleDistance", [serializable$1], function () {
  return 0.1;
}), _applyDecoratedDescriptor(_class2$2.prototype, "space", [_dec4$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "space"), _class2$2.prototype), _initializer5$2 = applyDecoratedInitializer(_class2$2.prototype, "existWithParticles", [serializable$1], function () {
  return true;
}), _initializer6$2 = applyDecoratedInitializer(_class2$2.prototype, "textureMode", [_dec5$2, serializable$1], function () {
  return ParticleTextureMode.Stretch;
}), _initializer7$2 = applyDecoratedInitializer(_class2$2.prototype, "widthFromParticle", [serializable$1], function () {
  return true;
}), _initializer8$2 = applyDecoratedInitializer(_class2$2.prototype, "widthRatio", [_dec6$2, serializable$1], function () {
  return new CurveRange();
}), _initializer9$2 = applyDecoratedInitializer(_class2$2.prototype, "colorFromParticle", [serializable$1], function () {
  return false;
}), _initializer0$2 = applyDecoratedInitializer(_class2$2.prototype, "colorOverTrail", [_dec7$2, serializable$1], function () {
  return new GradientRange();
}), _initializer1$2 = applyDecoratedInitializer(_class2$2.prototype, "colorOvertime", [_dec8$2, serializable$1], function () {
  return new GradientRange();
}), _initializer10$2 = applyDecoratedInitializer(_class2$2.prototype, "_space", [_dec9$2], function () {
  return ParticleSpace.World;
}), _initializer11$2 = applyDecoratedInitializer(_class2$2.prototype, "_particleSystem", [serializable$1], function () {
  return null;
}), _class2$2)) || _class$2);

var _nodeMat = new Mat4();
var _nodeParentInv = new Mat4();
var _nodeRol = new Quat();
var _nodeScale = new Vec3();
var _animModule = ['_colorOverLifetimeModule', '_sizeOvertimeModule', '_velocityOvertimeModule', '_forceOvertimeModule', '_limitVelocityOvertimeModule', '_rotationOvertimeModule', '_textureAnimationModule'];
var ParticleCuller = function () {
  function ParticleCuller(ps) {
    this._particleSystem = void 0;
    this._processor = void 0;
    this._node = void 0;
    this._particlesAll = void 0;
    this._updateList = new Map();
    this._animateList = new Map();
    this._runAnimateList = [];
    this._localMat = new Mat4();
    this._gravity = new Vec4();
    this.minPos = new Vec3();
    this.maxPos = new Vec3();
    this._nodePos = new Vec3();
    this._nodeSize = new Vec3();
    this._particleSystem = ps;
    this._processor = this._particleSystem.processor;
    this._node = ps.node;
    this._particlesAll = [];
    this._initModuleList();
  }
  var _proto = ParticleCuller.prototype;
  _proto._updateBoundingNode = function _updateBoundingNode() {
    this._nodeSize.set(this.maxPos.x - this.minPos.x, this.maxPos.y - this.minPos.y, this.maxPos.z - this.minPos.z);
    this._nodePos.set(this.minPos.x + this._nodeSize.x * 0.5, this.minPos.y + this._nodeSize.y * 0.5, this.minPos.z + this._nodeSize.z * 0.5);
  };
  _proto.setBoundingBoxSize = function setBoundingBoxSize(halfExt) {
    this.maxPos.x = this._nodePos.x + halfExt.x;
    this.maxPos.y = this._nodePos.y + halfExt.y;
    this.maxPos.z = this._nodePos.z + halfExt.z;
    this.minPos.x = this._nodePos.x - halfExt.x;
    this.minPos.y = this._nodePos.y - halfExt.y;
    this.minPos.z = this._nodePos.z - halfExt.z;
    this._updateBoundingNode();
  };
  _proto.setBoundingBoxCenter = function setBoundingBoxCenter(px, py, pz) {
    this.maxPos.x = px + this._nodeSize.x * 0.5;
    this.maxPos.y = py + this._nodeSize.y * 0.5;
    this.maxPos.z = pz + this._nodeSize.z * 0.5;
    this.minPos.x = px - this._nodeSize.x * 0.5;
    this.minPos.y = py - this._nodeSize.y * 0.5;
    this.minPos.z = pz - this._nodeSize.z * 0.5;
    this._updateBoundingNode();
  };
  _proto._initModuleList = function _initModuleList() {
    var _this = this;
    _animModule.forEach(function (val) {
      var pm = _this._particleSystem[val];
      if (pm && pm.enable) {
        if (pm.needUpdate) {
          _this._updateList.set(pm.name, pm);
        }
        if (pm.needAnimate) {
          _this._animateList.set(pm.name, pm);
        }
      }
    });
    this._runAnimateList.length = 0;
    for (var i = 0, len = PARTICLE_MODULE_ORDER.length; i < len; i++) {
      var p = this._animateList.get(PARTICLE_MODULE_ORDER[i]);
      if (p) {
        this._runAnimateList.push(p);
      }
    }
  };
  _proto._emit = function _emit(count, dt, particleLst) {
    var ps = this._particleSystem;
    var node = this._node;
    var loopDelta = ps.time % ps.duration / ps.duration;
    node.invalidateChildren(TransformBit.POSITION);
    if (ps.simulationSpace === ParticleSpace.World) {
      node.getWorldMatrix(_nodeMat);
      node.getWorldRotation(_nodeRol);
    }
    for (var i = 0; i < count; ++i) {
      var particle = new Particle(ps);
      particle.particleSystem = ps;
      particle.reset();
      var rand = pseudoRandom(randomRangeInt(0, INT_MAX));
      if (ps._shapeModule && ps._shapeModule.enable) {
        ps._shapeModule.emit(particle);
      } else {
        Vec3.set(particle.position, 0, 0, 0);
        Vec3.copy(particle.velocity, particleEmitZAxis);
      }
      if (ps._textureAnimationModule && ps._textureAnimationModule.enable) {
        ps._textureAnimationModule.init(particle);
      }
      var curveStartSpeed = ps.startSpeed.evaluate(loopDelta, rand);
      Vec3.multiplyScalar(particle.velocity, particle.velocity, curveStartSpeed);
      if (ps.simulationSpace === ParticleSpace.World) {
        Vec3.transformMat4(particle.position, particle.position, _nodeMat);
        Vec3.transformQuat(particle.velocity, particle.velocity, _nodeRol);
      }
      Vec3.copy(particle.ultimateVelocity, particle.velocity);
      Vec3.set(particle.rotation, 0, 0, 0);
      if (ps.startSize3D) {
        Vec3.set(particle.startSize, ps.startSizeX.evaluate(loopDelta, rand), ps.startSizeY.evaluate(loopDelta, rand), ps.startSizeZ.evaluate(loopDelta, rand));
      } else {
        Vec3.set(particle.startSize, ps.startSizeX.evaluate(loopDelta, rand), 1, 1);
        particle.startSize.y = particle.startSize.x;
      }
      Vec3.copy(particle.size, particle.startSize);
      particle.startLifetime = ps.startLifetime.evaluate(loopDelta, rand) + dt;
      particle.remainingLifetime = particle.startLifetime;
      particleLst.push(particle);
    }
  };
  _proto._updateParticles = function _updateParticles(dt, particleLst) {
    var _this2 = this;
    var ps = this._particleSystem;
    ps.node.getWorldMatrix(_nodeMat);
    switch (ps.scaleSpace) {
      case ParticleSpace.Local:
        ps.node.getScale(_nodeScale);
        break;
      case ParticleSpace.World:
        ps.node.getWorldScale(_nodeScale);
        break;
    }
    this._updateList.forEach(function (value, key) {});
    if (ps.simulationSpace === ParticleSpace.Local) {
      var r = ps.node.getRotation();
      Mat4.fromQuat(this._localMat, r);
      this._localMat.transpose();
    }
    if (ps.node.parent) {
      ps.node.parent.getWorldMatrix(_nodeParentInv);
      _nodeParentInv.invert();
    }
    var _loop = function _loop() {
      var p = particleLst[i];
      p.remainingLifetime -= dt;
      Vec3.set(p.animatedVelocity, 0, 0, 0);
      var useGravity = ps.gravityModifier.mode !== Mode$2.Constant || ps.gravityModifier.constant !== 0;
      if (useGravity) {
        var rand = isCurveTwoValues(ps.gravityModifier) ? pseudoRandom(p.randomSeed) : 0;
        if (ps.simulationSpace === ParticleSpace.Local) {
          var gravityFactor = -ps.gravityModifier.evaluate(1 - p.remainingLifetime / p.startLifetime, rand) * 9.8 * dt;
          _this2._gravity.x = 0.0;
          _this2._gravity.y = gravityFactor;
          _this2._gravity.z = 0.0;
          _this2._gravity.w = 1.0;
          if (!approx(gravityFactor, 0.0, EPSILON)) {
            if (ps.node.parent) {
              _this2._gravity = _this2._gravity.transformMat4(_nodeParentInv);
            }
            _this2._gravity = _this2._gravity.transformMat4(_this2._localMat);
            p.velocity.x += _this2._gravity.x;
            p.velocity.y += _this2._gravity.y;
            p.velocity.z += _this2._gravity.z;
          }
        } else {
          p.velocity.y -= ps.gravityModifier.evaluate(1 - p.remainingLifetime / p.startLifetime, rand) * 9.8 * dt;
        }
      }
      Vec3.copy(p.ultimateVelocity, p.velocity);
      _this2._runAnimateList.forEach(function (value) {
        value.animate(p, dt);
      });
      Vec3.scaleAndAdd(p.position, p.position, p.ultimateVelocity, dt);
    };
    for (var i = 0; i < particleLst.length; ++i) {
      _loop();
    }
  };
  _proto._calculateBounding = function _calculateBounding(isInit) {
    var size = new Vec3();
    var position = new Vec3();
    var subPos = new Vec3();
    var addPos = new Vec3();
    var meshSize = new Vec3(1.0, 1.0, 1.0);
    if (this._processor.getInfo().renderMode === ParticleRenderMode.Mesh) {
      var mesh = this._processor.getInfo().mesh;
      if (mesh && mesh.struct.minPosition && mesh.struct.maxPosition) {
        var meshAABB = new AABB();
        AABB.fromPoints(meshAABB, mesh.struct.minPosition, mesh.struct.maxPosition);
        var meshMax = Math.max(meshAABB.halfExtents.x, meshAABB.halfExtents.y, meshAABB.halfExtents.z);
        meshSize.set(meshMax, meshMax, meshMax);
      }
    }
    var worldMat = this._particleSystem.node.worldMatrix;
    for (var i = 0; i < this._particlesAll.length; ++i) {
      var p = this._particlesAll[i];
      Vec3.multiply(size, _nodeScale, p.size);
      Vec3.multiply(size, size, meshSize);
      position.set(p.position);
      if (this._particleSystem.simulationSpace !== ParticleSpace.World) {
        Vec3.transformMat4(position, position, worldMat);
      }
      if (isInit && i === 0) {
        Vec3.subtract(this.minPos, position, size);
        Vec3.add(this.maxPos, position, size);
      } else {
        Vec3.subtract(subPos, position, size);
        Vec3.add(addPos, position, size);
        Vec3.min(this.minPos, this.minPos, subPos);
        Vec3.max(this.maxPos, this.maxPos, addPos);
      }
    }
  };
  _proto.calculatePositions = function calculatePositions() {
    this._emit(this._particleSystem.capacity, 0, this._particlesAll);
    var rand = isCurveTwoValues(this._particleSystem.startLifetime) ? pseudoRandom(randomRangeInt(0, INT_MAX)) : 0;
    this._updateParticles(0, this._particlesAll);
    this._calculateBounding(true);
    this._updateParticles(this._particleSystem.startLifetime.evaluate(0, rand), this._particlesAll);
    this._calculateBounding(false);
    this._updateBoundingNode();
  };
  _proto.clear = function clear() {
    this._particlesAll.length = 0;
  };
  _proto.destroy = function destroy() {};
  return ParticleCuller;
}();

var _dec$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _dec8$1, _dec9$1, _dec0$1, _dec1$1, _dec10$1, _dec11$1, _dec12$1, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4$1, _initializer5$1, _initializer6$1, _initializer7$1, _initializer8$1, _initializer9$1, _initializer0$1, _initializer1$1, _initializer10$1, _initializer11$1, _initializer12$1;
var ccclass = ccclass$1,
  serializable = serializable$1,
  type = type$1;
var NoiseModule = (_dec$1 = ccclass('cc.NoiseModule'), _dec2$1 = type(CCFloat), _dec3$1 = type(CCFloat), _dec4$1 = type(CCFloat), _dec5$1 = type(CCFloat), _dec6$1 = type(CCFloat), _dec7$1 = type(CCFloat), _dec8$1 = type(CCFloat), _dec9$1 = type(CCFloat), _dec0$1 = type(CCFloat), _dec1$1 = type(CCFloat), _dec10$1 = type(CCInteger), _dec11$1 = type(CCFloat), _dec12$1 = type(CCFloat), _dec$1(_class$1 = (_class2$1 = function (_ParticleModuleBase) {
  function NoiseModule() {
    var _this;
    _this = _ParticleModuleBase.call(this) || this;
    _this._enable = _initializer$1 && _initializer$1();
    _this._strengthX = _initializer2$1 && _initializer2$1();
    _this._strengthY = _initializer3$1 && _initializer3$1();
    _this._strengthZ = _initializer4$1 && _initializer4$1();
    _this._noiseSpeedX = _initializer5$1 && _initializer5$1();
    _this._noiseSpeedY = _initializer6$1 && _initializer6$1();
    _this._noiseSpeedZ = _initializer7$1 && _initializer7$1();
    _this._noiseFrequency = _initializer8$1 && _initializer8$1();
    _this._remapX = _initializer9$1 && _initializer9$1();
    _this._remapY = _initializer0$1 && _initializer0$1();
    _this._remapZ = _initializer1$1 && _initializer1$1();
    _this._octaves = _initializer10$1 && _initializer10$1();
    _this._octaveMultiplier = _initializer11$1 && _initializer11$1();
    _this._octaveScale = _initializer12$1 && _initializer12$1();
    _this.name = PARTICLE_MODULE_NAME.NOISE;
    _this.noise = new ParticleNoise();
    _this.samplePosition = new Vec3();
    return _this;
  }
  _inheritsLoose(NoiseModule, _ParticleModuleBase);
  var _proto = NoiseModule.prototype;
  _proto.animate = function animate(particle, dt) {
    this.noise.setTime(particle.particleSystem.time);
    this.noise.setSpeed(this.noiseSpeedX, this.noiseSpeedY, this.noiseSpeedZ);
    this.noise.setFrequency(this.noiseFrequency);
    this.noise.setAbs(this.remapX, this.remapY, this.remapZ);
    this.noise.setAmplititude(this.strengthX, this.strengthY, this.strengthZ);
    this.noise.setOctaves(this.octaves, this.octaveMultiplier, this.octaveScale);
    this.samplePosition.set(particle.position);
    this.samplePosition.add3f(random() * 1.0, random() * 1.0, random() * 1.0);
    this.noise.setSamplePoint(this.samplePosition);
    this.noise.getNoiseParticle();
    var noisePosition = this.noise.getResult();
    noisePosition.multiply3f(random(), random(), random());
    Vec3.add(particle.position, particle.position, noisePosition.multiplyScalar(dt));
  };
  _proto.getNoisePreview = function getNoisePreview(out, ps, width, height) {
    this.noise.setTime(ps.time);
    this.noise.setSpeed(this.noiseSpeedX, this.noiseSpeedY, this.noiseSpeedZ);
    this.noise.setFrequency(this.noiseFrequency);
    this.noise.setAbs(this.remapX, this.remapY, this.remapZ);
    this.noise.setAmplititude(this.strengthX, this.strengthY, this.strengthZ);
    this.noise.setOctaves(this.octaves, this.octaveMultiplier, this.octaveScale);
    this.noise.getNoiseParticle();
    this.noise.getPreview(out, width, height);
  };
  return _createClass(NoiseModule, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(val) {
      if (this._enable === val) return;
      this._enable = val;
      if (!this.target) return;
      this.target.enableModule(this.name, val, this);
    }
  }, {
    key: "strengthX",
    get: function get() {
      return this._strengthX;
    },
    set: function set(value) {
      this._strengthX = value;
    }
  }, {
    key: "strengthY",
    get: function get() {
      return this._strengthY;
    },
    set: function set(value) {
      this._strengthY = value;
    }
  }, {
    key: "strengthZ",
    get: function get() {
      return this._strengthZ;
    },
    set: function set(value) {
      this._strengthZ = value;
    }
  }, {
    key: "noiseSpeedX",
    get: function get() {
      return this._noiseSpeedX;
    },
    set: function set(value) {
      this._noiseSpeedX = value;
    }
  }, {
    key: "noiseSpeedY",
    get: function get() {
      return this._noiseSpeedY;
    },
    set: function set(value) {
      this._noiseSpeedY = value;
    }
  }, {
    key: "noiseSpeedZ",
    get: function get() {
      return this._noiseSpeedZ;
    },
    set: function set(value) {
      this._noiseSpeedZ = value;
    }
  }, {
    key: "noiseFrequency",
    get: function get() {
      return this._noiseFrequency;
    },
    set: function set(value) {
      this._noiseFrequency = value;
    }
  }, {
    key: "remapX",
    get: function get() {
      return this._remapX;
    },
    set: function set(value) {
      this._remapX = value;
    }
  }, {
    key: "remapY",
    get: function get() {
      return this._remapY;
    },
    set: function set(value) {
      this._remapY = value;
    }
  }, {
    key: "remapZ",
    get: function get() {
      return this._remapZ;
    },
    set: function set(value) {
      this._remapZ = value;
    }
  }, {
    key: "octaves",
    get: function get() {
      return this._octaves;
    },
    set: function set(value) {
      this._octaves = value;
    }
  }, {
    key: "octaveMultiplier",
    get: function get() {
      return this._octaveMultiplier;
    },
    set: function set(value) {
      this._octaveMultiplier = value;
    }
  }, {
    key: "octaveScale",
    get: function get() {
      return this._octaveScale;
    },
    set: function set(value) {
      this._octaveScale = value;
    }
  }]);
}(ParticleModuleBase), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_enable", [serializable], function () {
  return false;
}), _applyDecoratedDescriptor(_class2$1.prototype, "strengthX", [_dec2$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "strengthX"), _class2$1.prototype), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_strengthX", [serializable], function () {
  return 10;
}), _applyDecoratedDescriptor(_class2$1.prototype, "strengthY", [_dec3$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "strengthY"), _class2$1.prototype), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "_strengthY", [serializable], function () {
  return 10;
}), _applyDecoratedDescriptor(_class2$1.prototype, "strengthZ", [_dec4$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "strengthZ"), _class2$1.prototype), _initializer4$1 = applyDecoratedInitializer(_class2$1.prototype, "_strengthZ", [serializable], function () {
  return 10;
}), _applyDecoratedDescriptor(_class2$1.prototype, "noiseSpeedX", [_dec5$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "noiseSpeedX"), _class2$1.prototype), _initializer5$1 = applyDecoratedInitializer(_class2$1.prototype, "_noiseSpeedX", [serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$1.prototype, "noiseSpeedY", [_dec6$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "noiseSpeedY"), _class2$1.prototype), _initializer6$1 = applyDecoratedInitializer(_class2$1.prototype, "_noiseSpeedY", [serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$1.prototype, "noiseSpeedZ", [_dec7$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "noiseSpeedZ"), _class2$1.prototype), _initializer7$1 = applyDecoratedInitializer(_class2$1.prototype, "_noiseSpeedZ", [serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$1.prototype, "noiseFrequency", [_dec8$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "noiseFrequency"), _class2$1.prototype), _initializer8$1 = applyDecoratedInitializer(_class2$1.prototype, "_noiseFrequency", [serializable], function () {
  return 1;
}), _applyDecoratedDescriptor(_class2$1.prototype, "remapX", [_dec9$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "remapX"), _class2$1.prototype), _initializer9$1 = applyDecoratedInitializer(_class2$1.prototype, "_remapX", [serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$1.prototype, "remapY", [_dec0$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "remapY"), _class2$1.prototype), _initializer0$1 = applyDecoratedInitializer(_class2$1.prototype, "_remapY", [serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$1.prototype, "remapZ", [_dec1$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "remapZ"), _class2$1.prototype), _initializer1$1 = applyDecoratedInitializer(_class2$1.prototype, "_remapZ", [serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$1.prototype, "octaves", [_dec10$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "octaves"), _class2$1.prototype), _initializer10$1 = applyDecoratedInitializer(_class2$1.prototype, "_octaves", [serializable], function () {
  return 1;
}), _applyDecoratedDescriptor(_class2$1.prototype, "octaveMultiplier", [_dec11$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "octaveMultiplier"), _class2$1.prototype), _initializer11$1 = applyDecoratedInitializer(_class2$1.prototype, "_octaveMultiplier", [serializable], function () {
  return 0.5;
}), _applyDecoratedDescriptor(_class2$1.prototype, "octaveScale", [_dec12$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "octaveScale"), _class2$1.prototype), _initializer12$1 = applyDecoratedInitializer(_class2$1.prototype, "_octaveScale", [serializable], function () {
  return 2;
}), _class2$1)) || _class$1);

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _initializer20, _initializer21, _initializer22, _initializer23, _initializer24, _initializer25, _initializer26, _initializer27, _initializer28, _initializer29, _initializer30, _initializer31, _initializer32, _initializer33, _initializer34, _initializer35, _initializer36, _initializer37, _initializer38, _initializer39, _ParticleSystem;
var _world_mat = new Mat4();
var _world_rol = new Quat();
var superMaterials = Object.getOwnPropertyDescriptor(Renderer.prototype, 'sharedMaterials');
var ParticleSystem = (_dec = ccclass$1('cc.ParticleSystem'), _dec2 = executionOrder(99), _dec3 = type$1(GradientRange), _dec4 = type$1(ParticleSpace), _dec5 = formerlySerializedAs('startSize'), _dec6 = type$1(CurveRange), _dec7 = type$1(CurveRange), _dec8 = type$1(CurveRange), _dec9 = type$1(CurveRange), _dec0 = type$1(CurveRange), _dec1 = type$1(CurveRange), _dec10 = type$1(CurveRange), _dec11 = formerlySerializedAs('startRotation'), _dec12 = type$1(CurveRange), _dec13 = type$1(CurveRange), _dec14 = type$1(ParticleSpace), _dec15 = type$1(CurveRange), _dec16 = type$1(CurveRange), _dec17 = type$1(CurveRange), _dec18 = type$1([Burst]), _dec19 = type$1(CCBoolean), _dec20 = type$1(ParticleCullingMode), _dec21 = type$1(CCFloat), _dec22 = type$1(CCFloat), _dec23 = type$1(CCFloat), _dec24 = formerlySerializedAs('enableCulling'), _dec25 = type$1(ColorOvertimeModule), _dec26 = type$1(ColorOvertimeModule), _dec27 = type$1(ShapeModule), _dec28 = type$1(ShapeModule), _dec29 = type$1(SizeOvertimeModule), _dec30 = type$1(SizeOvertimeModule), _dec31 = type$1(VelocityOvertimeModule), _dec32 = type$1(VelocityOvertimeModule), _dec33 = type$1(ForceOvertimeModule), _dec34 = type$1(ForceOvertimeModule), _dec35 = type$1(LimitVelocityOvertimeModule), _dec36 = type$1(LimitVelocityOvertimeModule), _dec37 = type$1(RotationOvertimeModule), _dec38 = type$1(RotationOvertimeModule), _dec39 = type$1(TextureAnimationModule), _dec40 = type$1(TextureAnimationModule), _dec41 = type$1(NoiseModule), _dec42 = type$1(NoiseModule), _dec43 = type$1(TrailModule), _dec44 = type$1(TrailModule), _dec45 = type$1(ParticleSystemRenderer), _dec(_class = _dec2(_class = (_class2 = (_ParticleSystem = function (_ModelRenderer) {
  function ParticleSystem() {
    var _this;
    _this = _ModelRenderer.call(this) || this;
    _this.startColor = _initializer && _initializer();
    _this.scaleSpace = _initializer2 && _initializer2();
    _this.startSize3D = _initializer3 && _initializer3();
    _this.startSizeX = _initializer4 && _initializer4();
    _this.startSizeY = _initializer5 && _initializer5();
    _this.startSizeZ = _initializer6 && _initializer6();
    _this.startSpeed = _initializer7 && _initializer7();
    _this.startRotation3D = _initializer8 && _initializer8();
    _this.startRotationX = _initializer9 && _initializer9();
    _this.startRotationY = _initializer0 && _initializer0();
    _this.startRotationZ = _initializer1 && _initializer1();
    _this.startDelay = _initializer10 && _initializer10();
    _this.startLifetime = _initializer11 && _initializer11();
    _this.duration = _initializer12 && _initializer12();
    _this.loop = _initializer13 && _initializer13();
    _this.simulationSpeed = _initializer14 && _initializer14();
    _this.playOnAwake = _initializer15 && _initializer15();
    _this.gravityModifier = _initializer16 && _initializer16();
    _this.rateOverTime = _initializer17 && _initializer17();
    _this.rateOverDistance = _initializer18 && _initializer18();
    _this.bursts = _initializer19 && _initializer19();
    _this._renderCulling = _initializer20 && _initializer20();
    _this._cullingMode = _initializer21 && _initializer21();
    _this._aabbHalfX = _initializer22 && _initializer22();
    _this._aabbHalfY = _initializer23 && _initializer23();
    _this._aabbHalfZ = _initializer24 && _initializer24();
    _this._dataCulling = _initializer25 && _initializer25();
    _this._colorOverLifetimeModule = _initializer26 && _initializer26();
    _this._shapeModule = _initializer27 && _initializer27();
    _this._sizeOvertimeModule = _initializer28 && _initializer28();
    _this._velocityOvertimeModule = _initializer29 && _initializer29();
    _this._forceOvertimeModule = _initializer30 && _initializer30();
    _this._limitVelocityOvertimeModule = _initializer31 && _initializer31();
    _this._rotationOvertimeModule = _initializer32 && _initializer32();
    _this._textureAnimationModule = _initializer33 && _initializer33();
    _this._noiseModule = _initializer34 && _initializer34();
    _this._trailModule = _initializer35 && _initializer35();
    _this.renderer = _initializer36 && _initializer36();
    _this._prewarm = _initializer37 && _initializer37();
    _this._capacity = _initializer38 && _initializer38();
    _this._simulationSpace = _initializer39 && _initializer39();
    _this.processor = null;
    var self = _this;
    self.rateOverTime.constant = 10;
    self.startLifetime.constant = 5;
    self.startSizeX.constant = 1;
    self.startSpeed.constant = 5;
    self._isPlaying = false;
    self._isPaused = false;
    self._isStopped = true;
    self._isEmitting = false;
    self._needToRestart = false;
    self._needRefresh = true;
    self._needAttach = false;
    self._time = 0.0;
    self._emitRateTimeCounter = 0.0;
    self._emitRateDistanceCounter = 0.0;
    self._oldWPos = new Vec3();
    self._curWPos = new Vec3();
    self._boundingBox = null;
    self._culler = null;
    self._oldPos = null;
    self._curPos = null;
    self._isCulled = false;
    self._isSimulating = true;
    self._customData1 = new Vec2();
    self._customData2 = new Vec2();
    self._subEmitters = [];
    return _this;
  }
  _inheritsLoose(ParticleSystem, _ModelRenderer);
  var _proto = ParticleSystem.prototype;
  _proto.onFocusInEditor = function onFocusInEditor() {
    this.renderer.create(this);
  };
  _proto.onLoad = function onLoad() {
    this.renderer.onInit(this);
    if (this._shapeModule) this._shapeModule.onInit(this);
    if (this._trailModule && !this.renderer.useGPU && this._trailModule.enable) {
      this._trailModule.onInit(this);
    }
    this.bindModule();
    this._resetPosition();
  };
  _proto._onMaterialModified = function _onMaterialModified(index, material) {
    if (this.processor !== null) {
      this.processor.onMaterialModified(index, material);
    }
  };
  _proto._onRebuildPSO = function _onRebuildPSO(index, material) {
    this.processor.onRebuildPSO(index, material);
  };
  _proto._collectModels = function _collectModels() {
    this._models.length = 0;
    this._models.push(this.processor.model);
    if (this._trailModule && this._trailModule.enable && this._trailModule.getModel()) {
      this._models.push(this._trailModule.getModel());
    }
    return this._models;
  };
  _proto._attachToScene = function _attachToScene() {
    this.processor.attachToScene();
    if (this._trailModule && this._trailModule.enable) {
      this._trailModule._attachToScene();
    }
  };
  _proto._detachFromScene = function _detachFromScene() {
    this.processor.detachFromScene();
    if (this._trailModule && this._trailModule.enable) {
      this._trailModule._detachFromScene();
    }
    if (this._boundingBox) {
      this._boundingBox = null;
    }
    if (this._culler) {
      this._culler.clear();
      this._culler.destroy();
      this._culler = null;
    }
  };
  _proto.bindModule = function bindModule() {
    if (this._colorOverLifetimeModule) this._colorOverLifetimeModule.bindTarget(this.processor);
    if (this._sizeOvertimeModule) this._sizeOvertimeModule.bindTarget(this.processor);
    if (this._rotationOvertimeModule) this._rotationOvertimeModule.bindTarget(this.processor);
    if (this._forceOvertimeModule) this._forceOvertimeModule.bindTarget(this.processor);
    if (this._limitVelocityOvertimeModule) this._limitVelocityOvertimeModule.bindTarget(this.processor);
    if (this._velocityOvertimeModule) this._velocityOvertimeModule.bindTarget(this.processor);
    if (this._textureAnimationModule) this._textureAnimationModule.bindTarget(this.processor);
    if (this._noiseModule) this._noiseModule.bindTarget(this.processor);
  };
  _proto.play = function play() {
    if (this._needToRestart) {
      this.reset();
      this._needToRestart = false;
    }
    if (this._isPaused) {
      this._isPaused = false;
    }
    if (this._isStopped) {
      this._isStopped = false;
    }
    this._isPlaying = true;
    this._isEmitting = true;
    this._resetPosition();
    if (this._prewarm) {
      this._prewarmSystem();
    }
    if (this._trailModule) {
      this._trailModule.play();
    }
    if (this.processor) {
      var model = this.processor.getModel();
      if (model) {
        model.enabled = this.enabledInHierarchy;
      }
    }
  };
  _proto.pause = function pause() {
    if (this._isStopped) {
      warn('pause(): particle system is already stopped.');
      return;
    }
    if (this._isPlaying) {
      this._isPlaying = false;
    }
    this._isPaused = true;
  };
  _proto.stopEmitting = function stopEmitting() {
    this._isEmitting = false;
    this._needToRestart = true;
  };
  _proto.stop = function stop() {
    if (this._isPlaying || this._isPaused) {
      this.clear();
    }
    if (this._isPlaying) {
      this._isPlaying = false;
    }
    if (this._isPaused) {
      this._isPaused = false;
    }
    if (this._isEmitting) {
      this._isEmitting = false;
    }
    this._isStopped = true;
    this._needRefresh = true;
    this.reset();
  };
  _proto.reset = function reset() {
    this._time = 0.0;
    this._emitRateTimeCounter = 0.0;
    this._emitRateDistanceCounter = 0.0;
    this._resetPosition();
    this.bursts.forEach(function (burst) {
      burst.reset();
    });
  };
  _proto.clear = function clear() {
    if (this.enabledInHierarchy) {
      this.processor.clear();
      if (this._trailModule) this._trailModule.clear();
    }
    this._calculateBounding(false);
  };
  _proto.getParticleCount = function getParticleCount() {
    if (this.processor) {
      return this.processor.getParticleCount();
    } else {
      return 0;
    }
  };
  _proto.setCustomData1 = function setCustomData1(x, y) {
    Vec2.set(this._customData1, x, y);
  };
  _proto.setCustomData2 = function setCustomData2(x, y) {
    Vec2.set(this._customData2, x, y);
  };
  _proto.onDestroy = function onDestroy() {
    var _this$processor$getMo;
    this.stop();
    if ((_this$processor$getMo = this.processor.getModel()) != null && _this$processor$getMo.scene) {
      this.processor.detachFromScene();
      if (this._trailModule && this._trailModule.enable) {
        this._trailModule._detachFromScene();
      }
    }
    director.off(DirectorEvent.BEFORE_COMMIT, this.beforeRender, this);
    this.processor.onDestroy();
    if (this._trailModule) this._trailModule.destroy();
    if (this._culler) {
      this._culler.clear();
      this._culler.destroy();
      this._culler = null;
    }
  };
  _proto.onEnable = function onEnable() {
    _ModelRenderer.prototype.onEnable.call(this);
    director.on(DirectorEvent.BEFORE_COMMIT, this.beforeRender, this);
    if (this.playOnAwake && !EDITOR_NOT_IN_PREVIEW) {
      this.play();
    }
    this.processor.onEnable();
    if (this._trailModule) this._trailModule.onEnable();
  };
  _proto.onDisable = function onDisable() {
    director.off(DirectorEvent.BEFORE_COMMIT, this.beforeRender, this);
    this.processor.onDisable();
    if (this._trailModule) this._trailModule.onDisable();
    if (this._boundingBox) {
      this._boundingBox = null;
    }
    this._oldPos = null;
    if (this._culler) {
      this._culler.clear();
      this._culler.destroy();
      this._culler = null;
    }
  };
  _proto._calculateBounding = function _calculateBounding(forceRefresh) {
    var self = this;
    if (self._boundingBox) {
      if (!self._culler) {
        self._culler = new ParticleCuller(self);
      }
      self._culler.calculatePositions();
      AABB.fromPoints(self._boundingBox, self._culler.minPos, self._culler.maxPos);
      if (forceRefresh) {
        self.aabbHalfX = self._boundingBox.halfExtents.x;
        self.aabbHalfY = self._boundingBox.halfExtents.y;
        self.aabbHalfZ = self._boundingBox.halfExtents.z;
      } else {
        if (self.aabbHalfX) {
          self.setBoundingX(self.aabbHalfX);
        } else {
          self.aabbHalfX = self._boundingBox.halfExtents.x;
        }
        if (self.aabbHalfY) {
          self.setBoundingY(self.aabbHalfY);
        } else {
          self.aabbHalfY = self._boundingBox.halfExtents.y;
        }
        if (self.aabbHalfZ) {
          self.setBoundingZ(self.aabbHalfZ);
        } else {
          self.aabbHalfZ = self._boundingBox.halfExtents.z;
        }
      }
      self._culler.clear();
    }
  };
  _proto.update = function update(dt) {
    var self = this;
    var thisProcessor = self.processor;
    var thisTrailModule = self.trailModule;
    var scaledDeltaTime = dt * self.simulationSpeed;
    if (!self.renderCulling) {
      if (self._boundingBox) {
        self._boundingBox = null;
      }
      if (self._culler) {
        self._culler.clear();
        self._culler.destroy();
        self._culler = null;
      }
      self._isSimulating = true;
    } else {
      if (!self._boundingBox) {
        self._boundingBox = new AABB();
        self._calculateBounding(false);
      }
      if (!self._curPos) {
        self._curPos = new Vec3();
      }
      self.node.getWorldPosition(self._curPos);
      if (!self._oldPos) {
        self._oldPos = new Vec3();
        self._oldPos.set(self._curPos);
      }
      var thisCurPos = self._curPos;
      var thisOldPos = self._oldPos;
      if (!thisCurPos.equals(thisOldPos) && self._boundingBox && self._culler) {
        var dx = thisCurPos.x - thisOldPos.x;
        var dy = thisCurPos.y - thisOldPos.y;
        var dz = thisCurPos.z - thisOldPos.z;
        var center = self._boundingBox.center;
        center.x += dx;
        center.y += dy;
        center.z += dz;
        self._culler.setBoundingBoxCenter(center.x, center.y, center.z);
        thisOldPos.set(thisCurPos);
      }
      var renderScene = self.node.scene.renderScene;
      var cameraLst = renderScene ? renderScene.cameras : undefined;
      var culled = true;
      if (cameraLst !== undefined && self._boundingBox) {
        for (var i = 0; i < cameraLst.length; ++i) {
          var camera = cameraLst[i];
          var visibility = camera.visibility;
          if ((visibility & self.node.layer) === self.node.layer) {
            if (intersect.aabbFrustum(self._boundingBox, camera.frustum)) {
              culled = false;
              break;
            }
          }
        }
      }
      if (culled) {
        if (self._cullingMode !== ParticleCullingMode.AlwaysSimulate) {
          self._isSimulating = false;
        }
        if (!self._isCulled) {
          thisProcessor.detachFromScene();
          self._isCulled = true;
        }
        if (thisTrailModule && thisTrailModule.enable) {
          thisTrailModule._detachFromScene();
        }
        if (self._cullingMode === ParticleCullingMode.PauseAndCatchup) {
          self._time += scaledDeltaTime;
        }
        if (self._cullingMode !== ParticleCullingMode.AlwaysSimulate) {
          return;
        }
      } else {
        if (self._isCulled) {
          self._attachToScene();
          self._isCulled = false;
        }
        if (!self._isSimulating) {
          self._isSimulating = true;
        }
      }
      if (!self._isSimulating) {
        return;
      }
    }
    if (self._isPlaying) {
      self._time += scaledDeltaTime;
      self._emit(scaledDeltaTime);
      if (thisProcessor.updateParticles(scaledDeltaTime) === 0 && !self._isEmitting) {
        self.stop();
      }
    } else {
      var mat = self.getMaterialInstance(0) || thisProcessor.getDefaultMaterial();
      var pass = mat.passes[0];
      thisProcessor.updateRotation(pass);
      thisProcessor.updateScale(pass);
    }
    if (self._needAttach) {
      if (self.getParticleCount() > 0) {
        if (!self._isCulled) {
          var _thisProcessor$getMod;
          if (!((_thisProcessor$getMod = thisProcessor.getModel()) != null && _thisProcessor$getMod.scene)) {
            thisProcessor.attachToScene();
          }
          if (thisTrailModule && thisTrailModule.enable) {
            var _thisTrailModule$getM;
            if (!((_thisTrailModule$getM = thisTrailModule.getModel()) != null && _thisTrailModule$getM.scene)) {
              thisTrailModule._attachToScene();
            }
          }
          self._needAttach = false;
        }
      }
    }
    if (!self.renderer.useGPU && thisTrailModule && thisTrailModule.enable) {
      if (!thisTrailModule.inited) {
        thisTrailModule.clear();
        thisTrailModule.destroy();
        thisTrailModule.onInit(this);
        thisTrailModule.enable = false;
        thisTrailModule.enable = true;
      }
    }
  };
  _proto.beforeRender = function beforeRender() {
    var _thisProcessor$getMod3;
    var self = this;
    var thisProcessor = self.processor;
    var thisTrailModule = self.trailModule;
    if (self.getParticleCount() <= 0) {
      var _thisProcessor$getMod2;
      if ((_thisProcessor$getMod2 = thisProcessor.getModel()) != null && _thisProcessor$getMod2.scene) {
        thisProcessor.detachFromScene();
        if (thisTrailModule && thisTrailModule.enable) {
          thisTrailModule._detachFromScene();
        }
        self._needAttach = false;
      }
    } else if (!((_thisProcessor$getMod3 = thisProcessor.getModel()) != null && _thisProcessor$getMod3.scene)) {
      self._needAttach = true;
    }
    if (!self._isPlaying) return;
    thisProcessor.updateRenderData();
    thisProcessor.beforeRender();
    if (thisTrailModule && thisTrailModule.enable) {
      thisTrailModule.updateRenderData();
      thisTrailModule.beforeRender();
    }
  };
  _proto._onVisibilityChange = function _onVisibilityChange(val) {
    if (this.processor.model) {
      this.processor.model.visFlags = val;
    }
  };
  _proto.emit = function emit(count, dt) {
    var self = this;
    var node = self.node;
    var loopDelta = self._time % self.duration / self.duration;
    if (self._needRefresh) {
      node.invalidateChildren(TransformBit.POSITION);
      self._needRefresh = false;
    }
    if (self._simulationSpace === ParticleSpace.World) {
      node.getWorldMatrix(_world_mat);
      node.getWorldRotation(_world_rol);
    }
    for (var i = 0; i < count; ++i) {
      var particle = self.processor.getFreeParticle();
      if (particle === null) {
        return;
      }
      particle.particleSystem = self;
      particle.reset();
      var rand = pseudoRandom(randomRangeInt(0, INT_MAX));
      if (self._shapeModule && self._shapeModule.enable) {
        self._shapeModule.emit(particle);
      } else {
        Vec3.set(particle.position, 0, 0, 0);
        Vec3.copy(particle.velocity, particleEmitZAxis);
      }
      if (self._textureAnimationModule && self._textureAnimationModule.enable) {
        self._textureAnimationModule.init(particle);
      }
      var curveStartSpeed = self.startSpeed.evaluate(loopDelta, rand);
      Vec3.multiplyScalar(particle.velocity, particle.velocity, curveStartSpeed);
      if (self._simulationSpace === ParticleSpace.World) {
        Vec3.transformMat4(particle.position, particle.position, _world_mat);
        Vec3.transformQuat(particle.velocity, particle.velocity, _world_rol);
      }
      Vec3.copy(particle.ultimateVelocity, particle.velocity);
      if (self.startRotation3D) {
        particle.startEuler.set(self.startRotationX.evaluate(loopDelta, rand), self.startRotationY.evaluate(loopDelta, rand), self.startRotationZ.evaluate(loopDelta, rand));
      } else {
        particle.startEuler.set(0, 0, self.startRotationZ.evaluate(loopDelta, rand));
      }
      particle.rotation.set(particle.startEuler);
      if (self.startSize3D) {
        Vec3.set(particle.startSize, self.startSizeX.evaluate(loopDelta, rand), self.startSizeY.evaluate(loopDelta, rand), self.startSizeZ.evaluate(loopDelta, rand));
      } else {
        Vec3.set(particle.startSize, self.startSizeX.evaluate(loopDelta, rand), 1, 1);
        particle.startSize.y = particle.startSize.x;
      }
      Vec3.copy(particle.size, particle.startSize);
      particle.startColor.set(self.startColor.evaluate(loopDelta, rand));
      particle.color.set(particle.startColor);
      particle.startLifetime = self.startLifetime.evaluate(loopDelta, rand) + dt;
      particle.remainingLifetime = particle.startLifetime;
      particle.randomSeed = randomRangeInt(0, 233280);
      particle.loopCount++;
      self.processor.setNewParticle(particle);
    }
  };
  _proto._prewarmSystem = function _prewarmSystem() {
    this.startDelay.mode = Mode$2.Constant;
    this.startDelay.constant = 0;
    var dt = 1.0;
    var cnt = this.duration / dt;
    for (var i = 0; i < cnt; ++i) {
      this._time += dt;
      this._emit(dt);
      this.processor.updateParticles(dt);
    }
  };
  _proto._emit = function _emit(dt) {
    var self = this;
    var startDelay = self.startDelay.evaluate(0, 1);
    if (self._time > startDelay) {
      var timeLeft = self._time - (self.duration + startDelay);
      if (timeLeft > dt) {
        if (!self.loop) {
          self._isEmitting = false;
        }
      }
      if (!self._isEmitting) return;
      self._emitRateTimeCounter += self.rateOverTime.evaluate(self._time / self.duration, 1) * dt;
      if (self._emitRateTimeCounter > 1) {
        var emitNum = Math.floor(self._emitRateTimeCounter);
        self._emitRateTimeCounter -= emitNum;
        self.emit(emitNum, dt);
      }
      var rateOverDistance = self.rateOverDistance.evaluate(self._time / self.duration, 1);
      if (rateOverDistance > 0) {
        Vec3.copy(self._oldWPos, self._curWPos);
        self.node.getWorldPosition(self._curWPos);
        var distance = Vec3.distance(self._curWPos, self._oldWPos);
        self._emitRateDistanceCounter += distance * rateOverDistance;
      }
      if (self._emitRateDistanceCounter > 1) {
        var _emitNum = Math.floor(self._emitRateDistanceCounter);
        self._emitRateDistanceCounter -= _emitNum;
        self.emit(_emitNum, dt);
      }
      if (timeLeft <= 0 || self.loop) {
        for (var _iterator = _createForOfIteratorHelperLoose(self.bursts), _step; !(_step = _iterator()).done;) {
          var burst = _step.value;
          burst.update(self, dt);
        }
      }
    }
  };
  _proto._resetPosition = function _resetPosition() {
    this.node.getWorldPosition(this._oldWPos);
    Vec3.copy(this._curWPos, this._oldWPos);
  };
  _proto.addSubEmitter = function addSubEmitter(subEmitter) {
    this._subEmitters.push(subEmitter);
  };
  _proto.removeSubEmitter = function removeSubEmitter(idx) {
    this._subEmitters.splice(this._subEmitters.indexOf(idx), 1);
  };
  _proto.addBurst = function addBurst(burst) {
    this.bursts.push(burst);
  };
  _proto.removeBurst = function removeBurst(burst) {
    var i = this.bursts.indexOf(burst);
    if (i > -1) {
      this.bursts.splice(i, 1);
    }
  };
  _proto.getBoundingX = function getBoundingX() {
    return this._aabbHalfX;
  };
  _proto.getBoundingY = function getBoundingY() {
    return this._aabbHalfY;
  };
  _proto.getBoundingZ = function getBoundingZ() {
    return this._aabbHalfZ;
  };
  _proto.setBoundingX = function setBoundingX(value) {
    if (this._boundingBox && this._culler) {
      this._boundingBox.halfExtents.x = value;
      this._culler.setBoundingBoxSize(this._boundingBox.halfExtents);
      this._aabbHalfX = value;
    }
  };
  _proto.setBoundingY = function setBoundingY(value) {
    if (this._boundingBox && this._culler) {
      this._boundingBox.halfExtents.y = value;
      this._culler.setBoundingBoxSize(this._boundingBox.halfExtents);
      this._aabbHalfY = value;
    }
  };
  _proto.setBoundingZ = function setBoundingZ(value) {
    if (this._boundingBox && this._culler) {
      this._boundingBox.halfExtents.z = value;
      this._culler.setBoundingBoxSize(this._boundingBox.halfExtents);
      this._aabbHalfZ = value;
    }
  };
  _proto._onBeforeSerialize = function _onBeforeSerialize(props) {
    var _this2 = this;
    return this.dataCulling ? props.filter(function (p) {
      return !PARTICLE_MODULE_PROPERTY.includes(p) || _this2[p] && _this2[p].enable;
    }) : props;
  };
  _proto.getNoisePreview = function getNoisePreview(width, height) {
    var out = [];
    if (this.processor) {
      this.processor.getNoisePreview(out, width, height);
    }
    return out;
  };
  return _createClass(ParticleSystem, [{
    key: "capacity",
    get: function get() {
      return this._capacity;
    },
    set: function set(val) {
      this._capacity = Math.floor(val > 0 ? val : 0);
      if (this.processor && this.processor.model) {
        this.processor.model.setCapacity(this._capacity);
      }
    }
  }, {
    key: "prewarm",
    get: function get() {
      return this._prewarm;
    },
    set: function set(val) {
      if (val === true && this.loop === false) ;
      this._prewarm = val;
    }
  }, {
    key: "simulationSpace",
    get: function get() {
      return this._simulationSpace;
    },
    set: function set(val) {
      if (val !== this._simulationSpace) {
        this._simulationSpace = val;
        if (this.processor) {
          this.processor.updateMaterialParams();
          this.processor.updateTrailMaterial();
        }
      }
    }
  }, {
    key: "renderCulling",
    get: function get() {
      return this._renderCulling;
    },
    set: function set(value) {
      this._renderCulling = value;
      if (value) {
        if (!this._boundingBox) {
          this._boundingBox = new AABB();
          this._calculateBounding(false);
        }
      }
    }
  }, {
    key: "cullingMode",
    get: function get() {
      return this._cullingMode;
    },
    set: function set(value) {
      this._cullingMode = value;
    }
  }, {
    key: "aabbHalfX",
    get: function get() {
      var res = this.getBoundingX();
      if (res) {
        return res;
      } else {
        return 0;
      }
    },
    set: function set(value) {
      this.setBoundingX(value);
    }
  }, {
    key: "aabbHalfY",
    get: function get() {
      var res = this.getBoundingY();
      if (res) {
        return res;
      } else {
        return 0;
      }
    },
    set: function set(value) {
      this.setBoundingY(value);
    }
  }, {
    key: "aabbHalfZ",
    get: function get() {
      var res = this.getBoundingZ();
      if (res) {
        return res;
      } else {
        return 0;
      }
    },
    set: function set(value) {
      this.setBoundingZ(value);
    }
  }, {
    key: "dataCulling",
    get: function get() {
      return this._dataCulling;
    },
    set: function set(value) {
      this._dataCulling = value;
    }
  }, {
    key: "sharedMaterials",
    get: function get() {
      return superMaterials.get.call(this);
    },
    set: function set(val) {
      superMaterials.set.call(this, val);
    }
  }, {
    key: "colorOverLifetimeModule",
    get: function get() {
      return this._colorOverLifetimeModule;
    },
    set: function set(val) {
      if (!val) return;
      this._colorOverLifetimeModule = val;
    }
  }, {
    key: "shapeModule",
    get: function get() {
      return this._shapeModule;
    },
    set: function set(val) {
      if (!val) return;
      this._shapeModule = val;
    }
  }, {
    key: "sizeOvertimeModule",
    get: function get() {
      return this._sizeOvertimeModule;
    },
    set: function set(val) {
      if (!val) return;
      this._sizeOvertimeModule = val;
    }
  }, {
    key: "velocityOvertimeModule",
    get: function get() {
      return this._velocityOvertimeModule;
    },
    set: function set(val) {
      if (!val) return;
      this._velocityOvertimeModule = val;
    }
  }, {
    key: "forceOvertimeModule",
    get: function get() {
      return this._forceOvertimeModule;
    },
    set: function set(val) {
      if (!val) return;
      this._forceOvertimeModule = val;
    }
  }, {
    key: "limitVelocityOvertimeModule",
    get: function get() {
      return this._limitVelocityOvertimeModule;
    },
    set: function set(val) {
      if (!val) return;
      this._limitVelocityOvertimeModule = val;
    }
  }, {
    key: "rotationOvertimeModule",
    get: function get() {
      return this._rotationOvertimeModule;
    },
    set: function set(val) {
      if (!val) return;
      this._rotationOvertimeModule = val;
    }
  }, {
    key: "textureAnimationModule",
    get: function get() {
      return this._textureAnimationModule;
    },
    set: function set(val) {
      if (!val) return;
      this._textureAnimationModule = val;
    }
  }, {
    key: "noiseModule",
    get: function get() {
      return this._noiseModule;
    },
    set: function set(val) {
      if (!val) return;
      this._noiseModule = val;
    }
  }, {
    key: "trailModule",
    get: function get() {
      return this._trailModule;
    },
    set: function set(val) {
      if (!val) return;
      this._trailModule = val;
    }
  }, {
    key: "isPlaying",
    get: function get() {
      return this._isPlaying;
    }
  }, {
    key: "isPaused",
    get: function get() {
      return this._isPaused;
    }
  }, {
    key: "isStopped",
    get: function get() {
      return this._isStopped;
    }
  }, {
    key: "isEmitting",
    get: function get() {
      return this._isEmitting;
    }
  }, {
    key: "time",
    get: function get() {
      return this._time;
    }
  }]);
}(ModelRenderer), _ParticleSystem.CullingMode = ParticleCullingMode, _ParticleSystem), _initializer = applyDecoratedInitializer(_class2.prototype, "startColor", [_dec3, serializable$1], function () {
  return new GradientRange();
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "scaleSpace", [_dec4, serializable$1], function () {
  return ParticleSpace.Local;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "startSize3D", [serializable$1], function () {
  return false;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "startSizeX", [_dec5, _dec6], function () {
  return new CurveRange();
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "startSizeY", [_dec7, serializable$1], function () {
  return new CurveRange();
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "startSizeZ", [_dec8, serializable$1], function () {
  return new CurveRange();
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "startSpeed", [_dec9, serializable$1], function () {
  return new CurveRange();
}), _initializer8 = applyDecoratedInitializer(_class2.prototype, "startRotation3D", [serializable$1], function () {
  return false;
}), _initializer9 = applyDecoratedInitializer(_class2.prototype, "startRotationX", [_dec0, serializable$1], function () {
  return new CurveRange();
}), _initializer0 = applyDecoratedInitializer(_class2.prototype, "startRotationY", [_dec1, serializable$1], function () {
  return new CurveRange();
}), _initializer1 = applyDecoratedInitializer(_class2.prototype, "startRotationZ", [_dec10, _dec11], function () {
  return new CurveRange();
}), _initializer10 = applyDecoratedInitializer(_class2.prototype, "startDelay", [_dec12, serializable$1], function () {
  return new CurveRange();
}), _initializer11 = applyDecoratedInitializer(_class2.prototype, "startLifetime", [_dec13, serializable$1], function () {
  return new CurveRange();
}), _initializer12 = applyDecoratedInitializer(_class2.prototype, "duration", [serializable$1], function () {
  return 5.0;
}), _initializer13 = applyDecoratedInitializer(_class2.prototype, "loop", [serializable$1], function () {
  return true;
}), _applyDecoratedDescriptor(_class2.prototype, "simulationSpace", [_dec14, serializable$1], Object.getOwnPropertyDescriptor(_class2.prototype, "simulationSpace"), _class2.prototype), _initializer14 = applyDecoratedInitializer(_class2.prototype, "simulationSpeed", [serializable$1], function () {
  return 1.0;
}), _initializer15 = applyDecoratedInitializer(_class2.prototype, "playOnAwake", [serializable$1], function () {
  return true;
}), _initializer16 = applyDecoratedInitializer(_class2.prototype, "gravityModifier", [_dec15, serializable$1], function () {
  return new CurveRange();
}), _initializer17 = applyDecoratedInitializer(_class2.prototype, "rateOverTime", [_dec16, serializable$1], function () {
  return new CurveRange();
}), _initializer18 = applyDecoratedInitializer(_class2.prototype, "rateOverDistance", [_dec17, serializable$1], function () {
  return new CurveRange();
}), _initializer19 = applyDecoratedInitializer(_class2.prototype, "bursts", [_dec18, serializable$1], function () {
  return [];
}), _applyDecoratedDescriptor(_class2.prototype, "renderCulling", [_dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "renderCulling"), _class2.prototype), _initializer20 = applyDecoratedInitializer(_class2.prototype, "_renderCulling", [serializable$1], function () {
  return false;
}), _applyDecoratedDescriptor(_class2.prototype, "cullingMode", [_dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "cullingMode"), _class2.prototype), _initializer21 = applyDecoratedInitializer(_class2.prototype, "_cullingMode", [serializable$1], function () {
  return ParticleCullingMode.Pause;
}), _applyDecoratedDescriptor(_class2.prototype, "aabbHalfX", [_dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "aabbHalfX"), _class2.prototype), _initializer22 = applyDecoratedInitializer(_class2.prototype, "_aabbHalfX", [serializable$1], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2.prototype, "aabbHalfY", [_dec22], Object.getOwnPropertyDescriptor(_class2.prototype, "aabbHalfY"), _class2.prototype), _initializer23 = applyDecoratedInitializer(_class2.prototype, "_aabbHalfY", [serializable$1], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2.prototype, "aabbHalfZ", [_dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "aabbHalfZ"), _class2.prototype), _initializer24 = applyDecoratedInitializer(_class2.prototype, "_aabbHalfZ", [serializable$1], function () {
  return 0;
}), _initializer25 = applyDecoratedInitializer(_class2.prototype, "_dataCulling", [serializable$1, _dec24], function () {
  return false;
}), _applyDecoratedDescriptor(_class2.prototype, "sharedMaterials", [override, serializable$1], Object.getOwnPropertyDescriptor(_class2.prototype, "sharedMaterials"), _class2.prototype), _initializer26 = applyDecoratedInitializer(_class2.prototype, "_colorOverLifetimeModule", [_dec25], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "colorOverLifetimeModule", [_dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "colorOverLifetimeModule"), _class2.prototype), _initializer27 = applyDecoratedInitializer(_class2.prototype, "_shapeModule", [_dec27], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "shapeModule", [_dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "shapeModule"), _class2.prototype), _initializer28 = applyDecoratedInitializer(_class2.prototype, "_sizeOvertimeModule", [_dec29], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "sizeOvertimeModule", [_dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "sizeOvertimeModule"), _class2.prototype), _initializer29 = applyDecoratedInitializer(_class2.prototype, "_velocityOvertimeModule", [_dec31], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "velocityOvertimeModule", [_dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "velocityOvertimeModule"), _class2.prototype), _initializer30 = applyDecoratedInitializer(_class2.prototype, "_forceOvertimeModule", [_dec33], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "forceOvertimeModule", [_dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "forceOvertimeModule"), _class2.prototype), _initializer31 = applyDecoratedInitializer(_class2.prototype, "_limitVelocityOvertimeModule", [_dec35], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "limitVelocityOvertimeModule", [_dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "limitVelocityOvertimeModule"), _class2.prototype), _initializer32 = applyDecoratedInitializer(_class2.prototype, "_rotationOvertimeModule", [_dec37], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "rotationOvertimeModule", [_dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "rotationOvertimeModule"), _class2.prototype), _initializer33 = applyDecoratedInitializer(_class2.prototype, "_textureAnimationModule", [_dec39], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "textureAnimationModule", [_dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "textureAnimationModule"), _class2.prototype), _initializer34 = applyDecoratedInitializer(_class2.prototype, "_noiseModule", [_dec41], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "noiseModule", [_dec42], Object.getOwnPropertyDescriptor(_class2.prototype, "noiseModule"), _class2.prototype), _initializer35 = applyDecoratedInitializer(_class2.prototype, "_trailModule", [_dec43], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "trailModule", [_dec44], Object.getOwnPropertyDescriptor(_class2.prototype, "trailModule"), _class2.prototype), _initializer36 = applyDecoratedInitializer(_class2.prototype, "renderer", [_dec45, serializable$1], function () {
  return new ParticleSystemRenderer();
}), _initializer37 = applyDecoratedInitializer(_class2.prototype, "_prewarm", [serializable$1], function () {
  return false;
}), _initializer38 = applyDecoratedInitializer(_class2.prototype, "_capacity", [serializable$1], function () {
  return 100;
}), _initializer39 = applyDecoratedInitializer(_class2.prototype, "_simulationSpace", [serializable$1], function () {
  return ParticleSpace.Local;
}), _class2)) || _class) || _class);

var ParticleUtils = function () {
  function ParticleUtils() {}
  ParticleUtils.instantiate = function instantiate$1(prefab) {
    if (!this.registeredSceneEvent) {
      director.on(DirectorEvent.BEFORE_SCENE_LAUNCH, this.onSceneUnload, this);
      this.registeredSceneEvent = true;
    }
    var uuid = prefab._uuid;
    if (!this.particleSystemPool.has(uuid)) {
      var ps = new Pool(function () {
        return instantiate(prefab) || new Node();
      }, 1, function (prefab) {
        return prefab.destroy();
      });
      this.particleSystemPool.set(uuid, ps);
    }
    return this.particleSystemPool.get(uuid).alloc();
  };
  ParticleUtils.destroy = function destroy(prefab) {
    var _prefab$prefab, _prefab$prefab$asset;
    var uuid = (_prefab$prefab = prefab.prefab) == null ? void 0 : (_prefab$prefab$asset = _prefab$prefab.asset) == null ? void 0 : _prefab$prefab$asset.uuid;
    if (uuid && this.particleSystemPool.has(uuid)) {
      this.stop(prefab);
      this.particleSystemPool.get(uuid).free(prefab);
    }
  };
  ParticleUtils.play = function play(rootNode) {
    for (var _iterator = _createForOfIteratorHelperLoose(rootNode.getComponentsInChildren(ParticleSystem)), _step; !(_step = _iterator()).done;) {
      var ps = _step.value;
      ps.play();
    }
  };
  ParticleUtils.stop = function stop(rootNode) {
    for (var _iterator2 = _createForOfIteratorHelperLoose(rootNode.getComponentsInChildren(ParticleSystem)), _step2; !(_step2 = _iterator2()).done;) {
      var ps = _step2.value;
      ps.stop();
    }
  };
  ParticleUtils.onSceneUnload = function onSceneUnload() {
    this.particleSystemPool.forEach(function (value) {
      return value.destroy();
    });
    this.particleSystemPool.clear();
  };
  return ParticleUtils;
}();
ParticleUtils.particleSystemPool = new Map();
ParticleUtils.registeredSceneEvent = false;

removeProperty(Burst.prototype, 'Burst.prototype', [{
  name: 'minCount'
}, {
  name: 'maxCount'
}]);
replaceProperty(ParticleSystem.prototype, 'ParticleSystem.prototype', [{
  name: 'enableCulling',
  newName: 'dataCulling'
}]);
cclegacy.ParticleSystemComponent = ParticleSystem;
setClassAlias(ParticleSystem, 'cc.ParticleSystemComponent');
cclegacy.BillboardComponent = Billboard;
setClassAlias(Billboard, 'cc.BillboardComponent');
cclegacy.LineComponent = Line;
setClassAlias(Line, 'cc.LineComponent');

cclegacy.ParticleUtils = ParticleUtils;

export { Billboard, Billboard as BillboardComponent, Burst, CurveRange, GradientRange, Line, Line as LineComponent, ParticleSystem, ParticleSystem as ParticleSystemComponent, ParticleUtils };
//# sourceMappingURL=particle.js.map
