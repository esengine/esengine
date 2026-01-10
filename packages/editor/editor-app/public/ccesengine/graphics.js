import './base.js';
import { L as LineJoin, a as LineCap, P as Point, b as PointFlags, G as Graphics } from './graphics-B_abEIjK.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { C as Color, f as Vec3 } from './index-uXI1_UMk.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import './gc-object-CShF5lzx.js';
import './node-event-Ccvtv8bJ.js';
import './debug-view-BuNhRPv_.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './scene-vWcxM1_c.js';
import './touch-BKrZ-fxl.js';
import './deprecated-n0w4kK7g.js';
import './deprecated-CN-RjLP6.js';
import './render-types-D3qsZZI9.js';
import './prefab-DYg_oxpo.js';
import './deprecated-CzzdLkmW.js';
import './camera-component-BFt9vSC_.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './deprecated-Dswa7XeN.js';
import './director-F7e_Lqjg.js';
import './instantiate-DAIJ1YBG.js';
import './move-DnXMCCeG.js';
import './ui-renderer-JpGcj-VM.js';
import './sorting-layers-BHqhkSbY.js';

var Aim = function Aim(i, x, y) {
  this.prev = null;
  this.next = null;
  this.z = null;
  this.prevZ = null;
  this.nextZ = null;
  this.steiner = false;
  this.i = i;
  this.x = x;
  this.y = y;
};
function linkedList(datas, start, end, dim, clockwise) {
  var i = 0;
  var last = null;
  if (clockwise === signedArea(datas, start, end, dim) > 0) {
    for (i = start; i < end; i += dim) {
      last = insertNode(i, datas[i], datas[i + 1], last);
    }
  } else {
    for (i = end - dim; i >= start; i -= dim) {
      last = insertNode(i, datas[i], datas[i + 1], last);
    }
  }
  if (last && equals(last, last.next)) {
    removeNode(last);
    last = last.next;
  }
  return last;
}
function filterPoints(start, end) {
  if (end === void 0) {
    end = null;
  }
  if (!start) {
    return start;
  }
  if (!end) {
    end = start;
  }
  var p = start;
  var again = false;
  do {
    again = false;
    if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
      removeNode(p);
      p = end = p.prev;
      if (p === p.next) {
        return null;
      }
      again = true;
    } else {
      p = p.next;
    }
  } while (again || p !== end);
  return end;
}
function earcutLinked(ear, triangles, dim, minX, minY, size, pass) {
  if (pass === void 0) {
    pass = 0;
  }
  if (!ear) {
    return;
  }
  if (!pass && size) {
    indexCurve(ear, minX, minY, size);
  }
  var stop = ear;
  var prev = null;
  var next = null;
  while (ear.prev !== ear.next) {
    prev = ear.prev;
    next = ear.next;
    if (size ? isEarHashed(ear, minX, minY, size) : isEar(ear)) {
      triangles.push(prev.i / dim);
      triangles.push(ear.i / dim);
      triangles.push(next.i / dim);
      removeNode(ear);
      ear = next.next;
      stop = next.next;
      continue;
    }
    ear = next;
    if (ear === stop) {
      if (!pass) {
        earcutLinked(filterPoints(ear), triangles, dim, minX, minY, size, 1);
      } else if (pass === 1) {
        ear = cureLocalIntersections(ear, triangles, dim);
        earcutLinked(ear, triangles, dim, minX, minY, size, 2);
      } else if (pass === 2) {
        splitEarcut(ear, triangles, dim, minX, minY, size);
      }
      break;
    }
  }
}
function isEar(ear) {
  var a = ear.prev;
  var b = ear;
  var c = ear.next;
  if (area(a, b, c) >= 0) {
    return false;
  }
  var p = ear.next.next;
  while (p !== ear.prev) {
    if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) {
      return false;
    }
    p = p.next;
  }
  return true;
}
function isEarHashed(ear, minX, minY, size) {
  var a = ear.prev;
  var b = ear;
  var c = ear.next;
  if (area(a, b, c) >= 0) {
    return false;
  }
  var minTX = a.x < b.x ? a.x < c.x ? a.x : c.x : b.x < c.x ? b.x : c.x;
  var minTY = a.y < b.y ? a.y < c.y ? a.y : c.y : b.y < c.y ? b.y : c.y;
  var maxTX = a.x > b.x ? a.x > c.x ? a.x : c.x : b.x > c.x ? b.x : c.x;
  var maxTY = a.y > b.y ? a.y > c.y ? a.y : c.y : b.y > c.y ? b.y : c.y;
  var minZ = zOrder(minTX, minTY, minX, minY, size);
  var maxZ = zOrder(maxTX, maxTY, minX, minY, size);
  var p = ear.nextZ;
  while (p && p.z <= maxZ) {
    if (p !== ear.prev && p !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) {
      return false;
    }
    p = p.nextZ;
  }
  p = ear.prevZ;
  while (p && p.z >= minZ) {
    if (p !== ear.prev && p !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) {
      return false;
    }
    p = p.prevZ;
  }
  return true;
}
function cureLocalIntersections(start, triangles, dim) {
  var p = start;
  do {
    var a = p.prev;
    var b = p.next.next;
    if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
      triangles.push(a.i / dim);
      triangles.push(p.i / dim);
      triangles.push(b.i / dim);
      removeNode(p);
      removeNode(p.next);
      p = start = b;
    }
    p = p.next;
  } while (p !== start);
  return p;
}
function splitEarcut(start, triangles, dim, minX, minY, size) {
  var a = start;
  do {
    var b = a.next.next;
    while (b !== a.prev) {
      if (a.i !== b.i && isValidDiagonal(a, b)) {
        var c = splitPolygon(a, b);
        a = filterPoints(a, a.next);
        c = filterPoints(c, c.next);
        earcutLinked(a, triangles, dim, minX, minY, size);
        earcutLinked(c, triangles, dim, minX, minY, size);
        return;
      }
      b = b.next;
    }
    a = a.next;
  } while (a !== start);
}
function indexCurve(start, minX, minY, size) {
  var p = start;
  do {
    if (p.z === null) {
      p.z = zOrder(p.x, p.y, minX, minY, size);
    }
    p.prevZ = p.prev;
    p.nextZ = p.next;
    p = p.next;
  } while (p !== start);
  p.prevZ.nextZ = null;
  p.prevZ = null;
  sortLinked(p);
}
function sortLinked(list) {
  var i = 0;
  var p = null;
  var q = null;
  var e = null;
  var tail = null;
  var numMerges = 0;
  var pSize = 0;
  var qSize = 0;
  var inSize = 1;
  do {
    p = list;
    list = null;
    tail = null;
    numMerges = 0;
    while (p) {
      numMerges++;
      q = p;
      pSize = 0;
      for (i = 0; i < inSize; i++) {
        pSize++;
        q = q.nextZ;
        if (!q) {
          break;
        }
      }
      qSize = inSize;
      while (pSize > 0 || qSize > 0 && q) {
        if (pSize === 0) {
          e = q;
          q = q.nextZ;
          qSize--;
        } else if (qSize === 0 || !q) {
          e = p;
          p = p.nextZ;
          pSize--;
        } else if (p.z <= q.z) {
          e = p;
          p = p.nextZ;
          pSize--;
        } else {
          e = q;
          q = q.nextZ;
          qSize--;
        }
        if (tail) {
          tail.nextZ = e;
        } else {
          list = e;
        }
        e.prevZ = tail;
        tail = e;
      }
      p = q;
    }
    tail.nextZ = null;
    inSize *= 2;
  } while (numMerges > 1);
  return list;
}
function zOrder(x, y, minX, minY, size) {
  x = 32767 * (x - minX) / size;
  y = 32767 * (y - minY) / size;
  x = (x | x << 8) & 0x00FF00FF;
  x = (x | x << 4) & 0x0F0F0F0F;
  x = (x | x << 2) & 0x33333333;
  x = (x | x << 1) & 0x55555555;
  y = (y | y << 8) & 0x00FF00FF;
  y = (y | y << 4) & 0x0F0F0F0F;
  y = (y | y << 2) & 0x33333333;
  y = (y | y << 1) & 0x55555555;
  return x | y << 1;
}
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
  return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 && (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 && (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}
function isValidDiagonal(a, b) {
  return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
}
function area(p, q, r) {
  return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}
function equals(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}
function intersects(p1, q1, p2, q2) {
  if (equals(p1, q1) && equals(p2, q2) || equals(p1, q2) && equals(p2, q1)) {
    return true;
  }
  return area(p1, q1, p2) > 0 !== area(p1, q1, q2) > 0 && area(p2, q2, p1) > 0 !== area(p2, q2, q1) > 0;
}
function intersectsPolygon(a, b) {
  var p = a;
  do {
    if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) {
      return true;
    }
    p = p.next;
  } while (p !== a);
  return false;
}
function locallyInside(a, b) {
  return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}
function middleInside(a, b) {
  var p = a;
  var inside = false;
  var px = (a.x + b.x) / 2;
  var py = (a.y + b.y) / 2;
  do {
    if (p.y > py !== p.next.y > py && px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x) {
      inside = !inside;
    }
    p = p.next;
  } while (p !== a);
  return inside;
}
function splitPolygon(a, b) {
  var a2 = new Aim(a.i, a.x, a.y);
  var b2 = new Aim(b.i, b.x, b.y);
  var an = a.next;
  var bp = b.prev;
  a.next = b;
  b.prev = a;
  a2.next = an;
  an.prev = a2;
  b2.next = a2;
  a2.prev = b2;
  bp.next = b2;
  b2.prev = bp;
  return b2;
}
function insertNode(i, x, y, last) {
  var p = new Aim(i, x, y);
  if (!last) {
    p.prev = p;
    p.next = p;
  } else {
    p.next = last.next;
    p.prev = last;
    last.next.prev = p;
    last.next = p;
  }
  return p;
}
function removeNode(p) {
  p.next.prev = p.prev;
  p.prev.next = p.next;
  if (p.prevZ) {
    p.prevZ.nextZ = p.nextZ;
  }
  if (p.nextZ) {
    p.nextZ.prevZ = p.prevZ;
  }
}
function signedArea(datas, start, end, dim) {
  var sum = 0;
  for (var i = start, j = end - dim; i < end; i += dim) {
    sum += (datas[j] - datas[i]) * (datas[i + 1] + datas[j + 1]);
    j = i;
  }
  return sum;
}
function earcut(datas, holeIndices, dim) {
  dim = dim || 3;
  var outerLen = datas.length;
  var outerNode = linkedList(datas, 0, outerLen, dim, true);
  var triangles = [];
  if (!outerNode) {
    return triangles;
  }
  var minX = 0;
  var minY = 0;
  var maxX = 0;
  var maxY = 0;
  var x = 0;
  var y = 0;
  var size = 0;
  if (datas.length > 80 * dim) {
    minX = maxX = datas[0];
    minY = maxY = datas[1];
    for (var i = dim; i < outerLen; i += dim) {
      x = datas[i];
      y = datas[i + 1];
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }
    size = Math.max(maxX - minX, maxY - minY);
  }
  earcutLinked(outerNode, triangles, dim, minX, minY, size);
  return triangles;
}

var MAX_VERTEX = 65535;
var MAX_INDICES = MAX_VERTEX * 2;
var PI = Math.PI;
var min = Math.min;
var max = Math.max;
var ceil = Math.ceil;
var acos = Math.acos;
var cos = Math.cos;
var sin = Math.sin;
var atan2 = Math.atan2;
var attrBytes = 8;
var _renderData = null;
var _impl = null;
var _curColor = new Color();
var vec3_temps = [];
for (var i = 0; i < 4; i++) {
  vec3_temps.push(new Vec3());
}
function curveDivs(r, arc, tol) {
  var da = acos(r / (r + tol)) * 2.0;
  return max(2, ceil(arc / da));
}
function clamp(v, minNum, maxNum) {
  if (v < minNum) {
    return minNum;
  } else if (v > maxNum) {
    return maxNum;
  }
  return v;
}
var GraphicsAssembler = function () {
  function GraphicsAssembler() {}
  var _proto = GraphicsAssembler.prototype;
  _proto.updateRenderData = function updateRenderData(graphics) {
  };
  _proto.getRenderData = function getRenderData(graphics, vertexCount) {
    if (!_impl) {
      return null;
    }
    var renderDataList = _impl.getRenderDataList();
    var renderData = renderDataList[_impl.dataOffset];
    if (!renderData) {
      return null;
    }
    var meshBuffer = renderData;
    var maxVertexCount = meshBuffer ? meshBuffer.vertexStart + vertexCount : 0;
    if (maxVertexCount > MAX_VERTEX || maxVertexCount * 3 > MAX_INDICES) {
      ++_impl.dataOffset;
      if (_impl.dataOffset < renderDataList.length) {
        renderData = renderDataList[_impl.dataOffset];
      } else {
        renderData = _impl.requestRenderData();
        renderDataList[_impl.dataOffset] = renderData;
      }
      meshBuffer = renderData;
    }
    if (meshBuffer && meshBuffer.vertexCount < maxVertexCount) {
      meshBuffer.request(vertexCount, vertexCount * 3);
    }
    return renderData;
  };
  _proto.stroke = function stroke(graphics) {
    Color.copy(_curColor, graphics.strokeColor);
    if (!graphics.impl) {
      return;
    }
    this._flattenPaths(graphics.impl);
    this._expandStroke(graphics);
    graphics.impl.updatePathOffset = true;
    this.end(graphics);
  };
  _proto.fill = function fill(graphics) {
    Color.copy(_curColor, graphics.fillColor);
    this._expandFill(graphics);
    if (graphics.impl) {
      graphics.impl.updatePathOffset = true;
    }
    this.end(graphics);
  };
  _proto.end = function end(graphics) {
    graphics._markForUpdateRenderData();
  };
  _proto._expandStroke = function _expandStroke(graphics) {
    var w = graphics.lineWidth * 0.5;
    var lineCap = graphics.lineCap;
    var lineJoin = graphics.lineJoin;
    var miterLimit = graphics.miterLimit;
    _impl = graphics.impl;
    if (!_impl) {
      return;
    }
    var nCap = curveDivs(w, PI, _impl.tessTol);
    this._calculateJoins(_impl, w, lineJoin, miterLimit);
    var paths = _impl.paths;
    var vertexCount = 0;
    for (var _i = _impl.pathOffset, l = _impl.pathLength; _i < l; _i++) {
      var path = paths[_i];
      var pointsLength = path.points.length;
      if (lineJoin === LineJoin.ROUND) {
        vertexCount += (pointsLength + path.bevel * (nCap + 2) + 1) * 2;
      } else {
        vertexCount += (pointsLength + path.bevel * 5 + 1) * 2;
      }
      if (!path.closed) {
        if (lineCap === LineCap.ROUND) {
          vertexCount += (nCap * 2 + 2) * 2;
        } else {
          vertexCount += (3 + 3) * 2;
        }
      }
    }
    var meshBuffer = _renderData = this.getRenderData(graphics, vertexCount);
    if (!meshBuffer) {
      return;
    }
    var vData = meshBuffer.vData;
    var iData = meshBuffer.iData;
    for (var _i2 = _impl.pathOffset, _l = _impl.pathLength; _i2 < _l; _i2++) {
      var _path = paths[_i2];
      var pts = _path.points;
      var _pointsLength = pts.length;
      var offset = meshBuffer.vertexStart;
      var p0 = void 0;
      var p1 = void 0;
      var start = 0;
      var end = 0;
      var loop = _path.closed;
      if (loop) {
        p0 = pts[_pointsLength - 1];
        p1 = pts[0];
        start = 0;
        end = _pointsLength;
      } else {
        p0 = pts[0];
        p1 = pts[1];
        start = 1;
        end = _pointsLength - 1;
      }
      p1 = p1 || p0;
      if (!loop) {
        var dPos = new Point(p1.x, p1.y);
        dPos.subtract(p0);
        dPos.normalize();
        var dx = dPos.x;
        var dy = dPos.y;
        if (lineCap === LineCap.BUTT) {
          this._buttCapStart(p0, dx, dy, w, 0);
        } else if (lineCap === LineCap.SQUARE) {
          this._buttCapStart(p0, dx, dy, w, w);
        } else if (lineCap === LineCap.ROUND) {
          this._roundCapStart(p0, dx, dy, w, nCap);
        }
      }
      for (var j = start; j < end; ++j) {
        if (lineJoin === LineJoin.ROUND) {
          this._roundJoin(p0, p1, w, w, nCap);
        } else if ((p1.flags & (PointFlags.PT_BEVEL | PointFlags.PT_INNERBEVEL)) !== 0) {
          this._bevelJoin(p0, p1, w, w);
        } else {
          this._vSet(p1.x + p1.dmx * w, p1.y + p1.dmy * w, 1);
          this._vSet(p1.x - p1.dmx * w, p1.y - p1.dmy * w, -1);
        }
        p0 = p1;
        p1 = pts[j + 1];
      }
      if (loop) {
        var vDataOffset = offset * attrBytes;
        this._vSet(vData[vDataOffset], vData[vDataOffset + 1], 1);
        this._vSet(vData[vDataOffset + attrBytes], vData[vDataOffset + attrBytes + 1], -1);
      } else {
        var _dPos = new Point(p1.x, p1.y);
        _dPos.subtract(p0);
        _dPos.normalize();
        var _dx = _dPos.x;
        var _dy = _dPos.y;
        if (lineCap === LineCap.BUTT) {
          this._buttCapEnd(p1, _dx, _dy, w, 0);
        } else if (lineCap === LineCap.SQUARE) {
          this._buttCapEnd(p1, _dx, _dy, w, w);
        } else if (lineCap === LineCap.ROUND) {
          this._roundCapEnd(p1, _dx, _dy, w, nCap);
        }
      }
      var indicesOffset = meshBuffer.indexStart;
      for (var begin = offset + 2, over = meshBuffer.vertexStart; begin < over; begin++) {
        iData[indicesOffset++] = begin - 2;
        iData[indicesOffset++] = begin - 1;
        iData[indicesOffset++] = begin;
      }
      meshBuffer.indexStart = indicesOffset;
    }
    _renderData = null;
    _impl = null;
  };
  _proto._expandFill = function _expandFill(graphics) {
    _impl = graphics.impl;
    if (!_impl) {
      return;
    }
    var paths = _impl.paths;
    var vertexCount = 0;
    for (var _i3 = _impl.pathOffset, l = _impl.pathLength; _i3 < l; _i3++) {
      var path = paths[_i3];
      var pointsLength = path.points.length;
      vertexCount += pointsLength;
    }
    var renderData = _renderData = this.getRenderData(graphics, vertexCount);
    if (!renderData) {
      return;
    }
    var meshBuffer = renderData;
    var vData = meshBuffer.vData;
    var iData = meshBuffer.iData;
    for (var _i4 = _impl.pathOffset, _l2 = _impl.pathLength; _i4 < _l2; _i4++) {
      var _path2 = paths[_i4];
      var pts = _path2.points;
      var _pointsLength2 = pts.length;
      if (_pointsLength2 === 0) {
        continue;
      }
      var vertexOffset = renderData.vertexStart;
      for (var j = 0; j < _pointsLength2; ++j) {
        this._vSet(pts[j].x, pts[j].y);
      }
      var indicesOffset = renderData.indexStart;
      if (_path2.complex) {
        var earcutData = [];
        for (var _j = vertexOffset, end = renderData.vertexStart; _j < end; _j++) {
          var vDataOffset = _j * attrBytes;
          earcutData.push(vData[vDataOffset++]);
          earcutData.push(vData[vDataOffset++]);
          earcutData.push(vData[vDataOffset++]);
        }
        var newIndices = earcut(earcutData, null, 3);
        if (!newIndices || newIndices.length === 0) {
          continue;
        }
        for (var _j2 = 0, nIndices = newIndices.length; _j2 < nIndices; _j2++) {
          iData[indicesOffset++] = newIndices[_j2] + vertexOffset;
        }
      } else {
        var first = vertexOffset;
        for (var start = vertexOffset + 2, _end = meshBuffer.vertexStart; start < _end; start++) {
          iData[indicesOffset++] = first;
          iData[indicesOffset++] = start - 1;
          iData[indicesOffset++] = start;
        }
      }
      meshBuffer.indexStart = indicesOffset;
    }
    _renderData = null;
    _impl = null;
  };
  _proto._calculateJoins = function _calculateJoins(impl, w, lineJoin, miterLimit) {
    var iw = 0.0;
    if (w > 0.0) {
      iw = 1 / w;
    }
    var paths = impl.paths;
    for (var _i5 = impl.pathOffset, l = impl.pathLength; _i5 < l; _i5++) {
      var path = paths[_i5];
      var pts = path.points;
      var ptsLength = pts.length;
      var p0 = pts[ptsLength - 1];
      var p1 = pts[0];
      path.bevel = 0;
      for (var j = 0; j < ptsLength; j++) {
        var dmr2 = 0;
        var cross = 0;
        var limit = 0;
        var dlx0 = p0.dy;
        var dly0 = -p0.dx;
        var dlx1 = p1.dy;
        var dly1 = -p1.dx;
        p1.dmx = (dlx0 + dlx1) * 0.5;
        p1.dmy = (dly0 + dly1) * 0.5;
        dmr2 = p1.dmx * p1.dmx + p1.dmy * p1.dmy;
        if (dmr2 > 0.000001) {
          var scale = 1 / dmr2;
          if (scale > 600) {
            scale = 600;
          }
          p1.dmx *= scale;
          p1.dmy *= scale;
        }
        cross = p1.dx * p0.dy - p0.dx * p1.dy;
        if (cross > 0) {
          p1.flags |= PointFlags.PT_LEFT;
        }
        limit = max(11, min(p0.len, p1.len) * iw);
        if (dmr2 * limit * limit < 1) {
          p1.flags |= PointFlags.PT_INNERBEVEL;
        }
        if (p1.flags & PointFlags.PT_CORNER) {
          if (dmr2 * miterLimit * miterLimit < 1 || lineJoin === LineJoin.BEVEL || lineJoin === LineJoin.ROUND) {
            p1.flags |= PointFlags.PT_BEVEL;
          }
        }
        if ((p1.flags & (PointFlags.PT_BEVEL | PointFlags.PT_INNERBEVEL)) !== 0) {
          path.bevel++;
        }
        p0 = p1;
        p1 = pts[j + 1];
      }
    }
  };
  _proto._flattenPaths = function _flattenPaths(impl) {
    var paths = impl.paths;
    for (var _i6 = impl.pathOffset, l = impl.pathLength; _i6 < l; _i6++) {
      var path = paths[_i6];
      var pts = path.points;
      var p0 = pts[pts.length - 1];
      var p1 = pts[0];
      if (pts.length > 2 && p0.equals(p1)) {
        path.closed = true;
        pts.pop();
        p0 = pts[pts.length - 1];
      }
      for (var j = 0, size = pts.length; j < size; j++) {
        var dPos = new Point(p1.x, p1.y);
        dPos.subtract(p0);
        p0.len = dPos.length();
        if (dPos.x || dPos.y) {
          dPos.normalize();
        }
        p0.dx = dPos.x;
        p0.dy = dPos.y;
        p0 = p1;
        p1 = pts[j + 1];
      }
    }
  };
  _proto._chooseBevel = function _chooseBevel(bevel, p0, p1, w) {
    var x = p1.x;
    var y = p1.y;
    var x0 = 0;
    var y0 = 0;
    var x1 = 0;
    var y1 = 0;
    if (bevel !== 0) {
      x0 = x + p0.dy * w;
      y0 = y - p0.dx * w;
      x1 = x + p1.dy * w;
      y1 = y - p1.dx * w;
    } else {
      x0 = x1 = x + p1.dmx * w;
      y0 = y1 = y + p1.dmy * w;
    }
    return [x0, y0, x1, y1];
  };
  _proto._buttCapStart = function _buttCapStart(p, dx, dy, w, d) {
    var px = p.x - dx * d;
    var py = p.y - dy * d;
    var dlx = dy;
    var dly = -dx;
    this._vSet(px + dlx * w, py + dly * w, 1);
    this._vSet(px - dlx * w, py - dly * w, -1);
  };
  _proto._buttCapEnd = function _buttCapEnd(p, dx, dy, w, d) {
    var px = p.x + dx * d;
    var py = p.y + dy * d;
    var dlx = dy;
    var dly = -dx;
    this._vSet(px + dlx * w, py + dly * w, 1);
    this._vSet(px - dlx * w, py - dly * w, -1);
  };
  _proto._roundCapStart = function _roundCapStart(p, dx, dy, w, nCap) {
    var px = p.x;
    var py = p.y;
    var dlx = dy;
    var dly = -dx;
    for (var _i7 = 0; _i7 < nCap; _i7++) {
      var a = _i7 / (nCap - 1) * PI;
      var ax = cos(a) * w;
      var ay = sin(a) * w;
      this._vSet(px - dlx * ax - dx * ay, py - dly * ax - dy * ay, 1);
      this._vSet(px, py, 0);
    }
    this._vSet(px + dlx * w, py + dly * w, 1);
    this._vSet(px - dlx * w, py - dly * w, -1);
  };
  _proto._roundCapEnd = function _roundCapEnd(p, dx, dy, w, nCap) {
    var px = p.x;
    var py = p.y;
    var dlx = dy;
    var dly = -dx;
    this._vSet(px + dlx * w, py + dly * w, 1);
    this._vSet(px - dlx * w, py - dly * w, -1);
    for (var _i8 = 0; _i8 < nCap; _i8++) {
      var a = _i8 / (nCap - 1) * PI;
      var ax = cos(a) * w;
      var ay = sin(a) * w;
      this._vSet(px, py, 0);
      this._vSet(px - dlx * ax + dx * ay, py - dly * ax + dy * ay, 1);
    }
  };
  _proto._roundJoin = function _roundJoin(p0, p1, lw, rw, nCap) {
    var dlx0 = p0.dy;
    var dly0 = -p0.dx;
    var dlx1 = p1.dy;
    var dly1 = -p1.dx;
    var p1x = p1.x;
    var p1y = p1.y;
    if ((p1.flags & PointFlags.PT_LEFT) !== 0) {
      var out = this._chooseBevel(p1.flags & PointFlags.PT_INNERBEVEL, p0, p1, lw);
      var lx0 = out[0];
      var ly0 = out[1];
      var lx1 = out[2];
      var ly1 = out[3];
      var a0 = atan2(-dly0, -dlx0);
      var a1 = atan2(-dly1, -dlx1);
      if (a1 > a0) {
        a1 -= PI * 2;
      }
      this._vSet(lx0, ly0, 1);
      this._vSet(p1x - dlx0 * rw, p1.y - dly0 * rw, -1);
      var n = clamp(ceil((a0 - a1) / PI) * nCap, 2, nCap);
      for (var _i9 = 0; _i9 < n; _i9++) {
        var u = _i9 / (n - 1);
        var a = a0 + u * (a1 - a0);
        var rx = p1x + cos(a) * rw;
        var ry = p1y + sin(a) * rw;
        this._vSet(p1x, p1y, 0);
        this._vSet(rx, ry, -1);
      }
      this._vSet(lx1, ly1, 1);
      this._vSet(p1x - dlx1 * rw, p1y - dly1 * rw, -1);
    } else {
      var _out = this._chooseBevel(p1.flags & PointFlags.PT_INNERBEVEL, p0, p1, -rw);
      var rx0 = _out[0];
      var ry0 = _out[1];
      var rx1 = _out[2];
      var ry1 = _out[3];
      var _a = atan2(dly0, dlx0);
      var _a2 = atan2(dly1, dlx1);
      if (_a2 < _a) {
        _a2 += PI * 2;
      }
      this._vSet(p1x + dlx0 * rw, p1y + dly0 * rw, 1);
      this._vSet(rx0, ry0, -1);
      var _n = clamp(ceil((_a2 - _a) / PI) * nCap, 2, nCap);
      for (var _i0 = 0; _i0 < _n; _i0++) {
        var _u = _i0 / (_n - 1);
        var _a3 = _a + _u * (_a2 - _a);
        var lx = p1x + cos(_a3) * lw;
        var ly = p1y + sin(_a3) * lw;
        this._vSet(lx, ly, 1);
        this._vSet(p1x, p1y, 0);
      }
      this._vSet(p1x + dlx1 * rw, p1y + dly1 * rw, 1);
      this._vSet(rx1, ry1, -1);
    }
  };
  _proto._bevelJoin = function _bevelJoin(p0, p1, lw, rw) {
    var rx0 = 0;
    var ry0 = 0;
    var rx1 = 0;
    var ry1 = 0;
    var lx0 = 0;
    var ly0 = 0;
    var lx1 = 0;
    var ly1 = 0;
    var dlx0 = p0.dy;
    var dly0 = -p0.dx;
    var dlx1 = p1.dy;
    var dly1 = -p1.dx;
    if (p1.flags & PointFlags.PT_LEFT) {
      var out = this._chooseBevel(p1.flags & PointFlags.PT_INNERBEVEL, p0, p1, lw);
      lx0 = out[0];
      ly0 = out[1];
      lx1 = out[2];
      ly1 = out[3];
      this._vSet(lx0, ly0, 1);
      this._vSet(p1.x - dlx0 * rw, p1.y - dly0 * rw, -1);
      this._vSet(lx1, ly1, 1);
      this._vSet(p1.x - dlx1 * rw, p1.y - dly1 * rw, -1);
    } else {
      var _out2 = this._chooseBevel(p1.flags & PointFlags.PT_INNERBEVEL, p0, p1, -rw);
      rx0 = _out2[0];
      ry0 = _out2[1];
      rx1 = _out2[2];
      ry1 = _out2[3];
      this._vSet(p1.x + dlx0 * lw, p1.y + dly0 * lw, 1);
      this._vSet(rx0, ry0, -1);
      this._vSet(p1.x + dlx1 * lw, p1.y + dly1 * lw, 1);
      this._vSet(rx1, ry1, -1);
    }
  };
  _proto._vSet = function _vSet(x, y, distance) {
    if (distance === void 0) {
      distance = 0;
    }
    if (!_renderData) {
      return;
    }
    var meshBuffer = _renderData;
    var dataOffset = meshBuffer.vertexStart * attrBytes;
    var vData = meshBuffer.vData;
    vData[dataOffset++] = x;
    vData[dataOffset++] = y;
    vData[dataOffset++] = 0;
    Color.toArray(vData, _curColor, dataOffset);
    dataOffset += 4;
    vData[dataOffset++] = distance;
    meshBuffer.vertexStart++;
  };
  return GraphicsAssembler;
}();
var graphicsAssembler = new GraphicsAssembler();

var graphicsAssemblerManager = {
  getAssembler: function getAssembler(sprite) {
    return graphicsAssembler;
  }
};
Graphics.Assembler = graphicsAssemblerManager;

cclegacy.UI.graphicsAssembler = graphicsAssemblerManager;

export { Graphics, graphicsAssemblerManager as graphicsAssembler };
//# sourceMappingURL=graphics.js.map
