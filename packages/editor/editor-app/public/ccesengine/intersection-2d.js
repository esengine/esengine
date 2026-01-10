import { V as Vec2 } from './index-uXI1_UMk.js';
import './global-exports-DnCP_14L.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './gc-object-CShF5lzx.js';

function lineLine(a1, a2, b1, b2) {
  var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
  var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
  var u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
  if (u_b !== 0) {
    var ua = ua_t / u_b;
    var ub = ub_t / u_b;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return true;
    }
  }
  return false;
}
var tempR1 = new Vec2();
var tempR2 = new Vec2();
var tempR3 = new Vec2();
var tempR4 = new Vec2();
function lineRect(a1, a2, b) {
  var r0 = tempR1.set(b.x, b.y);
  var r1 = tempR2.set(b.x, b.yMax);
  var r2 = tempR3.set(b.xMax, b.yMax);
  var r3 = tempR4.set(b.xMax, b.y);
  if (lineLine(a1, a2, r0, r1)) return true;
  if (lineLine(a1, a2, r1, r2)) return true;
  if (lineLine(a1, a2, r2, r3)) return true;
  if (lineLine(a1, a2, r3, r0)) return true;
  return false;
}
function linePolygon(a1, a2, b) {
  var length = b.length;
  for (var i = 0; i < length; ++i) {
    var b1 = b[i];
    var b2 = b[(i + 1) % length];
    if (lineLine(a1, a2, b1, b2)) return true;
  }
  return false;
}
function rectRect(a, b) {
  var a_min_x = a.x;
  var a_min_y = a.y;
  var a_max_x = a.x + a.width;
  var a_max_y = a.y + a.height;
  var b_min_x = b.x;
  var b_min_y = b.y;
  var b_max_x = b.x + b.width;
  var b_max_y = b.y + b.height;
  return a_min_x <= b_max_x && a_max_x >= b_min_x && a_min_y <= b_max_y && a_max_y >= b_min_y;
}
function rectPolygon(a, b) {
  var r0 = tempR1.set(a.x, a.y);
  var r1 = tempR2.set(a.x, a.yMax);
  var r2 = tempR3.set(a.xMax, a.yMax);
  var r3 = tempR4.set(a.xMax, a.y);
  if (linePolygon(r0, r1, b)) return true;
  if (linePolygon(r1, r2, b)) return true;
  if (linePolygon(r2, r3, b)) return true;
  if (linePolygon(r3, r0, b)) return true;
  for (var i = 0, l = b.length; i < l; ++i) {
    if (a.contains(b[i])) return true;
  }
  if (pointInPolygon(r0, b)) return true;
  if (pointInPolygon(r1, b)) return true;
  if (pointInPolygon(r2, b)) return true;
  if (pointInPolygon(r3, b)) return true;
  return false;
}
function polygonPolygon(a, b) {
  var i;
  var l;
  for (i = 0, l = a.length; i < l; ++i) {
    var a1 = a[i];
    var a2 = a[(i + 1) % l];
    if (linePolygon(a1, a2, b)) return true;
  }
  for (i = 0, l = b.length; i < l; ++i) {
    if (pointInPolygon(b[i], a)) return true;
  }
  for (i = 0, l = a.length; i < l; ++i) {
    if (pointInPolygon(a[i], b)) return true;
  }
  return false;
}
function circleCircle(c1p, c1r, c2p, c2r) {
  var distance = Vec2.distance(c1p, c2p);
  return distance < c1r + c2r;
}
function polygonCircle(polygon, cp, cr) {
  var position = cp;
  if (pointInPolygon(position, polygon)) {
    return true;
  }
  for (var i = 0, l = polygon.length; i < l; i++) {
    var start = i === 0 ? polygon[polygon.length - 1] : polygon[i - 1];
    var end = polygon[i];
    if (pointLineDistance(position, start, end, true) < cr) {
      return true;
    }
  }
  return false;
}
function rectCircle(rect, cp, cr) {
  var cx = cp.x;
  var cy = cp.y;
  var rx = rect.x;
  var ry = rect.y;
  var rw = rect.width;
  var rh = rect.height;
  var testX = cx;
  var testY = cy;
  if (cx < rx) testX = rx;else if (cx > rx + rw) testX = rx + rw;
  if (cy < ry) testY = ry;else if (cy > ry + rh) testY = ry + rh;
  var distX = cx - testX;
  var distY = cy - testY;
  var distance = Math.sqrt(distX * distX + distY * distY);
  if (distance <= cr) {
    return true;
  }
  return false;
}
function pointInPolygon(point, polygon) {
  var inside = false;
  var x = point.x;
  var y = point.y;
  var length = polygon.length;
  for (var i = 0, j = length - 1; i < length; j = i++) {
    var xi = polygon[i].x;
    var yi = polygon[i].y;
    var xj = polygon[j].x;
    var yj = polygon[j].y;
    var intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function pointLineDistance(point, start, end, isSegment) {
  var dx = end.x - start.x;
  var dy = end.y - start.y;
  var d = dx * dx + dy * dy;
  var t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / d;
  var p;
  if (!isSegment) {
    p = tempR1.set(start.x + t * dx, start.y + t * dy);
  } else if (d) {
    if (t < 0) p = start;else if (t > 1) p = end;else p = tempR1.set(start.x + t * dx, start.y + t * dy);
  } else {
    p = start;
  }
  dx = point.x - p.x;
  dy = point.y - p.y;
  return Math.sqrt(dx * dx + dy * dy);
}
var Intersection2D = function Intersection2D() {};
Intersection2D.lineLine = lineLine;
Intersection2D.lineRect = lineRect;
Intersection2D.linePolygon = linePolygon;
Intersection2D.rectRect = rectRect;
Intersection2D.rectPolygon = rectPolygon;
Intersection2D.rectCircle = rectCircle;
Intersection2D.polygonPolygon = polygonPolygon;
Intersection2D.circleCircle = circleCircle;
Intersection2D.polygonCircle = polygonCircle;
Intersection2D.pointInPolygon = pointInPolygon;
Intersection2D.pointLineDistance = pointLineDistance;

export { Intersection2D };
//# sourceMappingURL=intersection-2d.js.map
