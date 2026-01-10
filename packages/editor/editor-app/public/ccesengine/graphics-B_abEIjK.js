import { x as ccenum, _ as _inheritsLoose, w as warnID, a as _createClass, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import { V as Vec2, C as Color, c as ccclass, t as type, L as override, b as applyDecoratedInitializer, s as serializable, l as executionOrder } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { d as builtinResMgr } from './scene-vWcxM1_c.js';
import { M as Model } from './deprecated-n0w4kK7g.js';
import { M as MeshRenderData, d as vfmtPosColor, e as getComponentPerVertex, g as getAttributeStride, f as RenderEntity, h as RenderEntityType, U as UIRenderer, I as InstanceMaterialType } from './ui-renderer-JpGcj-VM.js';
import { d as director } from './director-F7e_Lqjg.js';
import { g as RenderingSubMesh } from './debug-view-BuNhRPv_.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { A as Attribute, F as Format, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, y as PrimitiveMode } from './buffer-barrier-BlQXg9Aa.js';
import './deprecated-CN-RjLP6.js';
import './node-event-Ccvtv8bJ.js';

var LineCap;
(function (LineCap) {
  LineCap[LineCap["BUTT"] = 0] = "BUTT";
  LineCap[LineCap["ROUND"] = 1] = "ROUND";
  LineCap[LineCap["SQUARE"] = 2] = "SQUARE";
})(LineCap || (LineCap = {}));
ccenum(LineCap);
var LineJoin;
(function (LineJoin) {
  LineJoin[LineJoin["BEVEL"] = 0] = "BEVEL";
  LineJoin[LineJoin["ROUND"] = 1] = "ROUND";
  LineJoin[LineJoin["MITER"] = 2] = "MITER";
})(LineJoin || (LineJoin = {}));
ccenum(LineJoin);
var PointFlags;
(function (PointFlags) {
  PointFlags[PointFlags["PT_CORNER"] = 1] = "PT_CORNER";
  PointFlags[PointFlags["PT_LEFT"] = 2] = "PT_LEFT";
  PointFlags[PointFlags["PT_BEVEL"] = 4] = "PT_BEVEL";
  PointFlags[PointFlags["PT_INNERBEVEL"] = 8] = "PT_INNERBEVEL";
})(PointFlags || (PointFlags = {}));
ccenum(PointFlags);

var PI = Math.PI;
var min = Math.min;
var max = Math.max;
var cos = Math.cos;
var sin = Math.sin;
var abs = Math.abs;
var sign = Math.sign;
var KAPPA90 = 0.5522847493;
function arc(ctx, cx, cy, r, startAngle, endAngle, counterclockwise) {
  counterclockwise = counterclockwise || false;
  var a = 0;
  var da = 0;
  var hda = 0;
  var kappa = 0;
  var dx = 0;
  var dy = 0;
  var x = 0;
  var y = 0;
  var tanx = 0;
  var tany = 0;
  var px = 0;
  var py = 0;
  var ptanx = 0;
  var ptany = 0;
  var i = 0;
  var ndivs = 0;
  da = endAngle - startAngle;
  if (counterclockwise) {
    if (abs(da) >= PI * 2) {
      da = PI * 2;
    } else {
      while (da < 0) {
        da += PI * 2;
      }
    }
  } else if (abs(da) >= PI * 2) {
    da = -PI * 2;
  } else {
    while (da > 0) {
      da -= PI * 2;
    }
  }
  ndivs = max(1, min(abs(da) / (PI * 0.5) + 0.5, 5)) | 0;
  hda = da / ndivs / 2.0;
  kappa = abs(4.0 / 3.0 * (1 - cos(hda)) / sin(hda));
  if (!counterclockwise) {
    kappa = -kappa;
  }
  for (i = 0; i <= ndivs; i++) {
    a = startAngle + da * (i / ndivs);
    dx = cos(a);
    dy = sin(a);
    x = cx + dx * r;
    y = cy + dy * r;
    tanx = -dy * r * kappa;
    tany = dx * r * kappa;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.bezierCurveTo(px + ptanx, py + ptany, x - tanx, y - tany, x, y);
    }
    px = x;
    py = y;
    ptanx = tanx;
    ptany = tany;
  }
}
function ellipse(ctx, cx, cy, rx, ry) {
  ctx.moveTo(cx - rx, cy);
  ctx.bezierCurveTo(cx - rx, cy + ry * KAPPA90, cx - rx * KAPPA90, cy + ry, cx, cy + ry);
  ctx.bezierCurveTo(cx + rx * KAPPA90, cy + ry, cx + rx, cy + ry * KAPPA90, cx + rx, cy);
  ctx.bezierCurveTo(cx + rx, cy - ry * KAPPA90, cx + rx * KAPPA90, cy - ry, cx, cy - ry);
  ctx.bezierCurveTo(cx - rx * KAPPA90, cy - ry, cx - rx, cy - ry * KAPPA90, cx - rx, cy);
  ctx.close();
}
function roundRect(ctx, x, y, w, h, r) {
  if (r < 0.1) {
    ctx.rect(x, y, w, h);
  } else {
    var rx = min(r, abs(w) * 0.5) * sign(w);
    var ry = min(r, abs(h) * 0.5) * sign(h);
    ctx.moveTo(x, y + ry);
    ctx.lineTo(x, y + h - ry);
    ctx.bezierCurveTo(x, y + h - ry * (1 - KAPPA90), x + rx * (1 - KAPPA90), y + h, x + rx, y + h);
    ctx.lineTo(x + w - rx, y + h);
    ctx.bezierCurveTo(x + w - rx * (1 - KAPPA90), y + h, x + w, y + h - ry * (1 - KAPPA90), x + w, y + h - ry);
    ctx.lineTo(x + w, y + ry);
    ctx.bezierCurveTo(x + w, y + ry * (1 - KAPPA90), x + w - rx * (1 - KAPPA90), y, x + w - rx, y);
    ctx.lineTo(x + rx, y);
    ctx.bezierCurveTo(x + rx * (1 - KAPPA90), y, x, y + ry * (1 - KAPPA90), x, y + ry);
    ctx.close();
  }
}
function tesselateBezier(ctx, x1, y1, x2, y2, x3, y3, x4, y4, level, type) {
  var x12 = 0;
  var y12 = 0;
  var x23 = 0;
  var y23 = 0;
  var x34 = 0;
  var y34 = 0;
  var x123 = 0;
  var y123 = 0;
  var x234 = 0;
  var y234 = 0;
  var x1234 = 0;
  var y1234 = 0;
  var dx = 0;
  var dy = 0;
  var d2 = 0;
  var d3 = 0;
  if (level > 10) {
    return;
  }
  x12 = (x1 + x2) * 0.5;
  y12 = (y1 + y2) * 0.5;
  x23 = (x2 + x3) * 0.5;
  y23 = (y2 + y3) * 0.5;
  x34 = (x3 + x4) * 0.5;
  y34 = (y3 + y4) * 0.5;
  x123 = (x12 + x23) * 0.5;
  y123 = (y12 + y23) * 0.5;
  dx = x4 - x1;
  dy = y4 - y1;
  d2 = abs((x2 - x4) * dy - (y2 - y4) * dx);
  d3 = abs((x3 - x4) * dy - (y3 - y4) * dx);
  if ((d2 + d3) * (d2 + d3) < ctx.tessTol * (dx * dx + dy * dy)) {
    ctx.addPoint(x4, y4, type === 0 ? type | PointFlags.PT_BEVEL : type);
    return;
  }
  x234 = (x23 + x34) * 0.5;
  y234 = (y23 + y34) * 0.5;
  x1234 = (x123 + x234) * 0.5;
  y1234 = (y123 + y234) * 0.5;
  tesselateBezier(ctx, x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1, 0);
  tesselateBezier(ctx, x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1, type);
}

var Point = function (_Vec) {
  function Point(x, y) {
    var _this;
    _this = _Vec.call(this, x, y) || this;
    _this.dx = 0;
    _this.dy = 0;
    _this.dmx = 0;
    _this.dmy = 0;
    _this.flags = 0;
    _this.len = 0;
    return _this;
  }
  _inheritsLoose(Point, _Vec);
  var _proto = Point.prototype;
  _proto.reset = function reset() {
    this.dx = 0;
    this.dy = 0;
    this.dmx = 0;
    this.dmy = 0;
    this.flags = 0;
    this.len = 0;
  };
  return Point;
}(Vec2);
var Path = function () {
  function Path() {
    this.closed = false;
    this.bevel = 0;
    this.complex = true;
    this.points = [];
  }
  var _proto2 = Path.prototype;
  _proto2.reset = function reset() {
    this.closed = false;
    this.bevel = 0;
    this.complex = true;
    this.points.length = 0;
  };
  return Path;
}();
var Impl = function () {
  function Impl(comp) {
    this.dataOffset = 0;
    this.updatePathOffset = false;
    this.pathLength = 0;
    this.pathOffset = 0;
    this.paths = [];
    this.tessTol = 0.25;
    this.distTol = 0.01;
    this.fillColor = Color.WHITE.clone();
    this.lineCap = LineCap.BUTT;
    this.strokeColor = Color.BLACK.clone();
    this.lineJoin = LineJoin.MITER;
    this.lineWidth = 0;
    this.pointsOffset = 0;
    this._commandX = 0;
    this._commandY = 0;
    this._points = [];
    this._renderDataList = [];
    this._curPath = null;
    this._comp = comp;
  }
  var _proto3 = Impl.prototype;
  _proto3.moveTo = function moveTo(x, y) {
    if (this.updatePathOffset) {
      this.pathOffset = this.pathLength;
      this.updatePathOffset = false;
    }
    this._addPath();
    this.addPoint(x, y, PointFlags.PT_CORNER);
    this._commandX = x;
    this._commandY = y;
  };
  _proto3.lineTo = function lineTo(x, y) {
    this.addPoint(x, y, PointFlags.PT_CORNER);
    this._commandX = x;
    this._commandY = y;
  };
  _proto3.bezierCurveTo = function bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
    var path = this._curPath;
    var last = path.points[path.points.length - 1];
    if (!last) {
      return;
    }
    if (last.x === c1x && last.y === c1y && c2x === x && c2y === y) {
      this.lineTo(x, y);
      return;
    }
    tesselateBezier(this, last.x, last.y, c1x, c1y, c2x, c2y, x, y, 0, PointFlags.PT_CORNER);
    this._commandX = x;
    this._commandY = y;
  };
  _proto3.quadraticCurveTo = function quadraticCurveTo(cx, cy, x, y) {
    var x0 = this._commandX;
    var y0 = this._commandY;
    this.bezierCurveTo(x0 + 2.0 / 3.0 * (cx - x0), y0 + 2.0 / 3.0 * (cy - y0), x + 2.0 / 3.0 * (cx - x), y + 2.0 / 3.0 * (cy - y), x, y);
  };
  _proto3.arc = function arc$1(cx, cy, r, startAngle, endAngle, counterclockwise) {
    arc(this, cx, cy, r, startAngle, endAngle, counterclockwise);
  };
  _proto3.ellipse = function ellipse$1(cx, cy, rx, ry) {
    ellipse(this, cx, cy, rx, ry);
    this._curPath.complex = false;
  };
  _proto3.circle = function circle(cx, cy, r) {
    ellipse(this, cx, cy, r, r);
    this._curPath.complex = false;
  };
  _proto3.rect = function rect(x, y, w, h) {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.close();
    this._curPath.complex = false;
  };
  _proto3.roundRect = function roundRect$1(x, y, w, h, r) {
    roundRect(this, x, y, w, h, r);
    this._curPath.complex = false;
  };
  _proto3.clear = function clear() {
    this.pathLength = 0;
    this.pathOffset = 0;
    this.pointsOffset = 0;
    this.dataOffset = 0;
    this._curPath = null;
    this.paths.length = 0;
    this._points.length = 0;
    var dataList = this._renderDataList;
    for (var i = 0, l = dataList.length; i < l; i++) {
      var data = dataList[i];
      if (!data) {
        continue;
      }
      MeshRenderData.remove(data);
    }
    this._renderDataList.length = 0;
  };
  _proto3.close = function close() {
    this._curPath.closed = true;
  };
  _proto3.requestRenderData = function requestRenderData() {
    var renderData = MeshRenderData.add();
    this._renderDataList.push(renderData);
    return renderData;
  };
  _proto3.getRenderDataList = function getRenderDataList() {
    if (this._renderDataList.length === 0) {
      this.requestRenderData();
    }
    return this._renderDataList;
  };
  _proto3.addPoint = function addPoint(x, y, flags) {
    var path = this._curPath;
    if (!path) {
      return;
    }
    var points = this._points;
    var pathPoints = path.points;
    var offset = this.pointsOffset++;
    var pt = points[offset];
    if (!pt) {
      pt = new Point(x, y);
      points.push(pt);
    } else {
      pt.x = x;
      pt.y = y;
    }
    pt.flags = flags;
    pathPoints.push(pt);
  };
  _proto3._addPath = function _addPath() {
    var offset = this.pathLength;
    var path = this.paths[offset];
    if (!path) {
      path = new Path();
      this.paths.push(path);
    } else {
      path.reset();
    }
    this.pathLength++;
    this._curPath = path;
    return path;
  };
  return Impl;
}();

var _dec, _dec2, _dec3, _dec4, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _Graphics;
var attributes = vfmtPosColor.concat([new Attribute('a_dist', Format.R32F)]);
var componentPerVertex = getComponentPerVertex(attributes);
var stride = getAttributeStride(attributes);
var Graphics = (_dec = ccclass('cc.Graphics'), _dec2 = executionOrder(110), _dec3 = type(LineJoin), _dec4 = type(LineCap), _dec(_class = _dec2(_class = (_class2 = (_Graphics = function (_UIRenderer) {
  function Graphics() {
    var _this;
    _this = _UIRenderer.call(this) || this;
    _this.impl = null;
    _this.model = null;
    _this._lineWidth = _initializer && _initializer();
    _this._strokeColor = _initializer2 && _initializer2();
    _this._lineJoin = _initializer3 && _initializer3();
    _this._lineCap = _initializer4 && _initializer4();
    _this._fillColor = _initializer5 && _initializer5();
    _this._miterLimit = _initializer6 && _initializer6();
    _this._isDrawing = false;
    _this._isNeedUploadData = true;
    _this._graphicsUseSubMeshes = [];
    _this._instanceMaterialType = InstanceMaterialType.ADD_COLOR;
    _this.impl = new Impl(_this);
    return _this;
  }
  _inheritsLoose(Graphics, _UIRenderer);
  var _proto = Graphics.prototype;
  _proto.onRestore = function onRestore() {
    if (!this.impl) {
      this._flushAssembler();
    }
  };
  _proto.onLoad = function onLoad() {
    _UIRenderer.prototype.onLoad.call(this);
    {
      this.model = director.root.createModel(Model);
      this.model.node = this.model.transform = this.node;
    }
    this._flushAssembler();
  };
  _proto.onEnable = function onEnable() {
    _UIRenderer.prototype.onEnable.call(this);
    this._updateMtlForGraphics();
  };
  _proto.onDestroy = function onDestroy() {
    this._sceneGetter = null;
    {
      if (this.model) {
        director.root.destroyModel(this.model);
        this.model = null;
      }
      var subMeshLength = this._graphicsUseSubMeshes.length;
      if (subMeshLength > 0) {
        for (var i = 0; i < subMeshLength; ++i) {
          this._graphicsUseSubMeshes[i].destroy();
        }
        this._graphicsUseSubMeshes.length = 0;
      }
    }
    if (this.impl) {
      this._isDrawing = false;
      this.impl.clear();
      this.impl = null;
    }
    _UIRenderer.prototype.onDestroy.call(this);
  };
  _proto.moveTo = function moveTo(x, y) {
    if (!this.impl) {
      return;
    }
    this.impl.moveTo(x, y);
  };
  _proto.lineTo = function lineTo(x, y) {
    if (!this.impl) {
      return;
    }
    this.impl.lineTo(x, y);
  };
  _proto.bezierCurveTo = function bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
    if (!this.impl) {
      return;
    }
    this.impl.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
  };
  _proto.quadraticCurveTo = function quadraticCurveTo(cx, cy, x, y) {
    if (!this.impl) {
      return;
    }
    this.impl.quadraticCurveTo(cx, cy, x, y);
  };
  _proto.arc = function arc(cx, cy, r, startAngle, endAngle, counterclockwise) {
    if (!this.impl) {
      return;
    }
    this.impl.arc(cx, cy, r, startAngle, endAngle, counterclockwise);
  };
  _proto.ellipse = function ellipse(cx, cy, rx, ry) {
    if (!this.impl) {
      return;
    }
    this.impl.ellipse(cx, cy, rx, ry);
  };
  _proto.circle = function circle(cx, cy, r) {
    if (!this.impl) {
      return;
    }
    this.impl.circle(cx, cy, r);
  };
  _proto.rect = function rect(x, y, w, h) {
    if (!this.impl) {
      return;
    }
    this.impl.rect(x, y, w, h);
  };
  _proto.roundRect = function roundRect(x, y, w, h, r) {
    if (!this.impl) {
      return;
    }
    this.impl.roundRect(x, y, w, h, r);
  };
  _proto.fillRect = function fillRect(x, y, w, h) {
    this.rect(x, y, w, h);
    this.fill();
  };
  _proto.clear = function clear() {
    if (!this.impl) {
      return;
    }
    this.impl.clear();
    this._isDrawing = false;
    if (this.model) {
      for (var i = 0; i < this.model.subModels.length; i++) {
        var subModel = this.model.subModels[i];
        var ia = subModel.inputAssembler;
        ia.indexCount = 0;
        ia.vertexCount = 0;
      }
    }
    this._markForUpdateRenderData();
  };
  _proto.close = function close() {
    if (!this.impl) {
      return;
    }
    this.impl.close();
  };
  _proto.stroke = function stroke() {
    if (!this._assembler) {
      this._flushAssembler();
    }
    this._isDrawing = true;
    this._isNeedUploadData = true;
    this._assembler.stroke(this);
  };
  _proto.fill = function fill() {
    if (!this._assembler) {
      this._flushAssembler();
    }
    this._isDrawing = true;
    this._isNeedUploadData = true;
    this._assembler.fill(this);
  };
  _proto._updateMtlForGraphics = function _updateMtlForGraphics() {
    var mat;
    if (this._customMaterial) {
      mat = this.getMaterialInstance(0);
    } else {
      mat = builtinResMgr.get('ui-graphics-material');
      this.setSharedMaterial(mat, 0);
      mat = this.getMaterialInstance(0);
      mat.recompileShaders({
        USE_LOCAL: true
      });
    }
  };
  _proto.activeSubModel = function activeSubModel(idx) {
    if (!this.model) {
      warnID(4500, this.node.name);
      return;
    }
    if (this.model.subModels.length <= idx) {
      var gfxDevice = deviceManager.gfxDevice;
      var vertexBuffer = gfxDevice.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, 65535 * stride, stride));
      var indexBuffer = gfxDevice.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, 65535 * Uint16Array.BYTES_PER_ELEMENT * 2, Uint16Array.BYTES_PER_ELEMENT));
      var renderMesh = new RenderingSubMesh([vertexBuffer], attributes, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
      renderMesh.subMeshIdx = 0;
      this.model.initSubModel(idx, renderMesh, this.getMaterialInstance(0));
      this._graphicsUseSubMeshes.push(renderMesh);
    }
  };
  _proto._uploadData = function _uploadData() {
    var impl = this.impl;
    if (!impl) {
      return;
    }
    var renderDataList = impl && impl.getRenderDataList();
    if (renderDataList.length <= 0 || !this.model) {
      return;
    }
    var subModelList = this.model.subModels;
    for (var i = 0; i < renderDataList.length; i++) {
      var renderData = renderDataList[i];
      var ia = subModelList[i].inputAssembler;
      if (renderData.lastFilledVertex === renderData.vertexStart) {
        continue;
      }
      var vb = new Float32Array(renderData.vData.buffer, 0, renderData.vertexStart * componentPerVertex);
      ia.vertexBuffers[0].update(vb);
      ia.vertexCount = renderData.vertexStart;
      var ib = new Uint16Array(renderData.iData.buffer, 0, renderData.indexStart);
      ia.indexBuffer.update(ib);
      ia.indexCount = renderData.indexStart;
      renderData.lastFilledVertex = renderData.vertexStart;
      renderData.lastFilledIndex = renderData.indexStart;
    }
    this._isNeedUploadData = false;
  };
  _proto._render = function _render(render) {
    if (this._isNeedUploadData) {
      if (this.impl) {
        var renderDataList = this.impl.getRenderDataList();
        var len = this.model.subModels.length;
        if (renderDataList.length > len) {
          for (var i = len; i < renderDataList.length; i++) {
            this.activeSubModel(i);
          }
        }
      }
      this._uploadData();
    }
    render.commitModel(this, this.model, this.getMaterialInstance(0));
  };
  _proto._flushAssembler = function _flushAssembler() {
    var assembler = Graphics.Assembler.getAssembler(this);
    if (this._assembler !== assembler) {
      this._assembler = assembler;
    }
  };
  _proto._canRender = function _canRender() {
    if (!_UIRenderer.prototype._canRender.call(this)) {
      return false;
    }
    {
      return !!this.model && this._isDrawing;
    }
  };
  _proto.updateRenderer = function updateRenderer() {
    _UIRenderer.prototype.updateRenderer.call(this);
  };
  _proto.createRenderEntity = function createRenderEntity() {
    return new RenderEntity(RenderEntityType.DYNAMIC);
  };
  return _createClass(Graphics, [{
    key: "lineWidth",
    get: function get() {
      return this._lineWidth;
    },
    set: function set(value) {
      this._lineWidth = value;
      if (!this.impl) {
        return;
      }
      this.impl.lineWidth = value;
    }
  }, {
    key: "lineJoin",
    get: function get() {
      return this._lineJoin;
    },
    set: function set(value) {
      this._lineJoin = value;
      if (!this.impl) {
        return;
      }
      this.impl.lineJoin = value;
    }
  }, {
    key: "lineCap",
    get: function get() {
      return this._lineCap;
    },
    set: function set(value) {
      this._lineCap = value;
      if (!this.impl) {
        return;
      }
      this.impl.lineCap = value;
    }
  }, {
    key: "strokeColor",
    get: function get() {
      return this._strokeColor;
    },
    set: function set(value) {
      if (!this.impl) {
        return;
      }
      this._strokeColor.set(value);
      this.impl.strokeColor = this._strokeColor;
    }
  }, {
    key: "fillColor",
    get: function get() {
      return this._fillColor;
    },
    set: function set(value) {
      if (!this.impl) {
        return;
      }
      this._fillColor.set(value);
      this.impl.fillColor = this._fillColor;
    }
  }, {
    key: "miterLimit",
    get: function get() {
      return this._miterLimit;
    },
    set: function set(value) {
      this._miterLimit = value;
    }
  }, {
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
    key: "graphicsNativeProxy",
    get: function get() {
      return this._graphicsNativeProxy;
    }
  }]);
}(UIRenderer), _Graphics.LineJoin = LineJoin, _Graphics.LineCap = LineCap, _Graphics), _applyDecoratedDescriptor(_class2.prototype, "lineJoin", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "lineJoin"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "lineCap", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "lineCap"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "color", [override], Object.getOwnPropertyDescriptor(_class2.prototype, "color"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_lineWidth", [serializable], function () {
  return 1;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_strokeColor", [serializable], function () {
  return Color.BLACK.clone();
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_lineJoin", [serializable], function () {
  return LineJoin.MITER;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_lineCap", [serializable], function () {
  return LineCap.BUTT;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_fillColor", [serializable], function () {
  return Color.WHITE.clone();
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_miterLimit", [serializable], function () {
  return 10;
}), _class2)) || _class) || _class);
cclegacy.Graphics = Graphics;

export { Graphics as G, LineJoin as L, Point as P, LineCap as a, PointFlags as b };
//# sourceMappingURL=graphics-B_abEIjK.js.map
