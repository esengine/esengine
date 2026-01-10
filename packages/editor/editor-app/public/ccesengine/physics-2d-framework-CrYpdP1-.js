import { V as Vec2, a2 as SystemPriority, S as System, c as ccclass$e, t as type$3, b as applyDecoratedInitializer, s as serializable, m as Rect, B as Size, f as Vec3, Q as Quat, Y as toDegree } from './index-uXI1_UMk.js';
import { W as logID, E as Enum, k as errorID, L as log, _ as _inheritsLoose, a as _createClass, Z as Eventify, s as settings, S as SettingsCategory, b as _applyDecoratedDescriptor, C as CCBoolean, q as CCFloat } from './gc-object-CShF5lzx.js';
import { E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';
import { C as CollisionMatrix, P as PhysicsGroup$1 } from './collision-matrix-55yq71jP.js';
import './deprecated-Dswa7XeN.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import './prefab-DYg_oxpo.js';
import './scene-vWcxM1_c.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';

function At(i, vertices) {
  var s = vertices.length;
  return vertices[i < 0 ? s - -i % s : i % s];
}
function Copy(i, j, vertices) {
  var p = [];
  while (j < i) j += vertices.length;
  for (; i <= j; ++i) {
    p.push(At(i, vertices));
  }
  return p;
}
function ConvexPartition$1(vertices) {
  ForceCounterClockWise$1(vertices);
  var list = [];
  var d = 0;
  var lowerDist = 0;
  var upperDist = 0;
  var p;
  var lowerInt = new Vec2();
  var upperInt = new Vec2();
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerPoly;
  var upperPoly;
  for (var i = 0; i < vertices.length; ++i) {
    if (Reflex(i, vertices)) {
      lowerDist = upperDist = 10e7;
      for (var j = 0; j < vertices.length; ++j) {
        if (Left(At(i - 1, vertices), At(i, vertices), At(j, vertices)) && RightOn(At(i - 1, vertices), At(i, vertices), At(j - 1, vertices))) {
          p = LineIntersect(At(i - 1, vertices), At(i, vertices), At(j, vertices), At(j - 1, vertices));
          if (Right(At(i + 1, vertices), At(i, vertices), p)) {
            d = SquareDist(At(i, vertices), p);
            if (d < lowerDist) {
              lowerDist = d;
              lowerInt = p;
              lowerIndex = j;
            }
          }
        }
        if (Left(At(i + 1, vertices), At(i, vertices), At(j + 1, vertices)) && RightOn(At(i + 1, vertices), At(i, vertices), At(j, vertices))) {
          p = LineIntersect(At(i + 1, vertices), At(i, vertices), At(j, vertices), At(j + 1, vertices));
          if (Left(At(i - 1, vertices), At(i, vertices), p)) {
            d = SquareDist(At(i, vertices), p);
            if (d < upperDist) {
              upperDist = d;
              upperIndex = j;
              upperInt = p;
            }
          }
        }
      }
      if (lowerIndex == (upperIndex + 1) % vertices.length) {
        var sp = lowerInt.add(upperInt).multiplyScalar(1 / 2);
        lowerPoly = Copy(i, upperIndex, vertices);
        lowerPoly.push(sp);
        upperPoly = Copy(lowerIndex, i, vertices);
        upperPoly.push(sp);
      } else {
        var highestScore = 0;
        var bestIndex = lowerIndex;
        while (upperIndex < lowerIndex) {
          upperIndex += vertices.length;
        }
        for (var _j = lowerIndex; _j <= upperIndex; ++_j) {
          if (CanSee(i, _j, vertices)) {
            var score = 1 / (SquareDist(At(i, vertices), At(_j, vertices)) + 1);
            if (Reflex(_j, vertices)) {
              if (RightOn(At(_j - 1, vertices), At(_j, vertices), At(i, vertices)) && LeftOn(At(_j + 1, vertices), At(_j, vertices), At(i, vertices))) {
                score += 3;
              } else {
                score += 2;
              }
            } else {
              score += 1;
            }
            if (score > highestScore) {
              bestIndex = _j;
              highestScore = score;
            }
          }
        }
        lowerPoly = Copy(i, bestIndex, vertices);
        upperPoly = Copy(bestIndex, i, vertices);
      }
      list = list.concat(ConvexPartition$1(lowerPoly));
      list = list.concat(ConvexPartition$1(upperPoly));
      return list;
    }
  }
  list.push(vertices);
  for (var _i = list.length - 1; _i >= 0; _i--) {
    if (list[_i].length == 0) list.splice(_i, 0);
  }
  return list;
}
function CanSee(i, j, vertices) {
  if (Reflex(i, vertices)) {
    if (LeftOn(At(i, vertices), At(i - 1, vertices), At(j, vertices)) && RightOn(At(i, vertices), At(i + 1, vertices), At(j, vertices))) return false;
  } else if (RightOn(At(i, vertices), At(i + 1, vertices), At(j, vertices)) || LeftOn(At(i, vertices), At(i - 1, vertices), At(j, vertices))) return false;
  if (Reflex(j, vertices)) {
    if (LeftOn(At(j, vertices), At(j - 1, vertices), At(i, vertices)) && RightOn(At(j, vertices), At(j + 1, vertices), At(i, vertices))) return false;
  } else if (RightOn(At(j, vertices), At(j + 1, vertices), At(i, vertices)) || LeftOn(At(j, vertices), At(j - 1, vertices), At(i, vertices))) return false;
  for (var k = 0; k < vertices.length; ++k) {
    if ((k + 1) % vertices.length == i || k == i || (k + 1) % vertices.length == j || k == j) {
      continue;
    }
    var intersectionPoint = new Vec2();
    if (LineIntersect2(At(i, vertices), At(j, vertices), At(k, vertices), At(k + 1, vertices), intersectionPoint)) {
      return false;
    }
  }
  return true;
}
function Reflex(i, vertices) {
  return Right(i, vertices);
}
function Right(a, b, c) {
  if (typeof c === 'undefined') {
    var i = a;
    var vertices = b;
    a = At(i - 1, vertices);
    b = At(i, vertices);
    c = At(i + 1, vertices);
    if (typeof a === 'undefined') {
      a = b;
    }
    if (typeof c === 'undefined') {
      c = b;
    }
  }
  return Area(a, b, c) < 0;
}
function Left(a, b, c) {
  return Area(a, b, c) > 0;
}
function LeftOn(a, b, c) {
  return Area(a, b, c) >= 0;
}
function RightOn(a, b, c) {
  return Area(a, b, c) <= 0;
}
function SquareDist(a, b) {
  var dx = b.x - a.x;
  var dy = b.y - a.y;
  return dx * dx + dy * dy;
}
function ForceCounterClockWise$1(vertices) {
  if (!IsCounterClockWise(vertices)) {
    vertices.reverse();
  }
}
function IsCounterClockWise(vertices) {
  if (vertices.length < 3) return true;
  return GetSignedArea(vertices) > 0;
}
function GetSignedArea(vertices) {
  var i;
  var area = 0;
  for (i = 0; i < vertices.length; i++) {
    var j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[i].y * vertices[j].x;
  }
  area /= 2;
  return area;
}
function LineIntersect(p1, p2, q1, q2) {
  var i = new Vec2();
  var a1 = p2.y - p1.y;
  var b1 = p1.x - p2.x;
  var c1 = a1 * p1.x + b1 * p1.y;
  var a2 = q2.y - q1.y;
  var b2 = q1.x - q2.x;
  var c2 = a2 * q1.x + b2 * q1.y;
  var det = a1 * b2 - a2 * b1;
  if (!FloatEquals(det, 0)) {
    i.x = (b2 * c1 - b1 * c2) / det;
    i.y = (a1 * c2 - a2 * c1) / det;
  }
  return i;
}
function LineIntersect2(a0, a1, b0, b1, intersectionPoint) {
  if (a0 == b0 || a0 == b1 || a1 == b0 || a1 == b1) return false;
  var x1 = a0.x;
  var y1 = a0.y;
  var x2 = a1.x;
  var y2 = a1.y;
  var x3 = b0.x;
  var y3 = b0.y;
  var x4 = b1.x;
  var y4 = b1.y;
  if (Math.max(x1, x2) < Math.min(x3, x4) || Math.max(x3, x4) < Math.min(x1, x2)) return false;
  if (Math.max(y1, y2) < Math.min(y3, y4) || Math.max(y3, y4) < Math.min(y1, y2)) return false;
  var ua = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  var ub = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
  var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 10e-7) {
    return false;
  }
  ua /= denom;
  ub /= denom;
  if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
    intersectionPoint.x = x1 + ua * (x2 - x1);
    intersectionPoint.y = y1 + ua * (y2 - y1);
    return true;
  }
  return false;
}
function FloatEquals(value1, value2) {
  return Math.abs(value1 - value2) <= 10e-7;
}
function Area(a, b, c) {
  return a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
}

var PolygonSeparator = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ConvexPartition: ConvexPartition$1,
    ForceCounterClockWise: ForceCounterClockWise$1,
    IsCounterClockWise: IsCounterClockWise
});

function ConvexPartition(polygon) {
  ForceCounterClockWise(polygon);
  var convex = true;
  for (var i = 0, len = polygon.length; i < len; ++i) {
    if (!isConvex(polygon[(i + len - 1) % len], polygon[i], polygon[(i + 1) % len])) {
      convex = false;
      break;
    }
  }
  if (convex) {
    return [polygon];
  }
  var ret = [];
  var triangles = Triangulate(polygon);
  if (!triangles) return null;
  for (; triangles.length;) {
    var poly = triangles.splice(0, 1)[0];
    for (var iPoly = 0, polyLen = poly.length; iPoly < polyLen; ++iPoly) {
      var diag1 = poly[iPoly];
      var diag2 = poly[(iPoly + 1) % polyLen];
      var tri3 = null;
      var iTri2 = 0;
      for (; iTri2 < triangles.length; ++iTri2) {
        var triangle = triangles[iTri2];
        for (var _i = 0; _i < 3; ++_i) {
          var tri1 = triangle[_i];
          var tri2 = triangle[(_i + 1) % 3];
          if (equals(diag1, tri2) && equals(diag2, tri1)) {
            tri3 = triangle[(_i + 2) % 3];
            break;
          }
        }
        if (tri3) {
          break;
        }
      }
      if (!tri3) {
        continue;
      }
      if (area(poly[(iPoly + polyLen - 1) % polyLen], diag1, tri3) > 0) {
        continue;
      }
      if (area(tri3, diag2, poly[(iPoly + 2) % polyLen]) > 0) {
        continue;
      }
      var newPoly = [];
      for (var _i2 = (iPoly + 1) % polyLen; _i2 !== iPoly; _i2 = (_i2 + 1) % polyLen) {
        newPoly.push(poly[_i2]);
      }
      newPoly.push(diag1, tri3);
      poly = newPoly;
      polyLen = newPoly.length;
      iPoly = -1;
      triangles.splice(iTri2, 1);
    }
    ret.push(poly);
  }
  return ret;
}
var Vertex = function Vertex() {
  this.isActive = false;
  this.isConvex = false;
  this.isEar = false;
  this.point = null;
  this.angleCos = 0;
  this.shouldUpdate = false;
  this.index = 0;
  this.prev = null;
  this.next = null;
};
function area(a, b, c) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}
function isConvex(p1, p2, p3) {
  return area(p1, p2, p3) < 0;
}
function equals(a, b) {
  return a.x === b.x && a.y === b.y;
}
function isClockwise(polygon) {
  var sum = 0;
  for (var i = 0, len = polygon.length; i < len; ++i) {
    var p1 = polygon[i];
    var p2 = polygon[(i + 1) % len];
    sum += (p2.x - p1.x) * (p2.y + p1.y);
  }
  return sum > 0;
}
function ForceCounterClockWise(vertices) {
  if (isClockwise(vertices)) {
    vertices.reverse();
  }
}
function updateVertex(vertex, vertices) {
  if (!vertex.shouldUpdate) {
    return;
  }
  vertex.shouldUpdate = false;
  var v1 = vertex.prev.point;
  var v2 = vertex.point;
  var v3 = vertex.next.point;
  vertex.isConvex = isConvex(v1, v2, v3);
  var v1x = v1.x - v2.x;
  var v1y = v1.y - v2.y;
  var v1Len = Math.sqrt(v1x * v1x + v1y * v1y);
  v1x /= v1Len;
  v1y /= v1Len;
  var v3x = v3.x - v2.x;
  var v3y = v3.y - v2.y;
  var v3Len = Math.sqrt(v3x * v3x + v3y * v3y);
  v3x /= v3Len;
  v3y /= v3Len;
  vertex.angleCos = v1x * v3x + v1y * v3y;
  if (vertex.isConvex) {
    vertex.isEar = true;
    for (var i = 0, len = vertices.length; i < len; ++i) {
      var curr = vertices[i];
      if (!curr.isActive || curr === vertex) {
        continue;
      }
      var currentPoint = curr.point;
      if (equals(v1, currentPoint) || equals(v2, currentPoint) || equals(v3, currentPoint)) {
        continue;
      }
      var areaA = area(v1, currentPoint, v2);
      var areaB = area(v2, currentPoint, v3);
      var areaC = area(v3, currentPoint, v1);
      if (areaA > 0 && areaB > 0 && areaC > 0) {
        vertex.isEar = false;
        break;
      }
      if (areaA === 0 && areaB >= 0 && areaC >= 0) {
        if (area(v1, curr.prev.point, v2) > 0 || area(v1, curr.next.point, v2) > 0) {
          vertex.isEar = false;
          break;
        }
      }
      if (areaB === 0 && areaA >= 0 && areaC >= 0) {
        if (area(v2, curr.prev.point, v3) > 0 || area(v2, curr.next.point, v3) > 0) {
          vertex.isEar = false;
          break;
        }
      }
      if (areaC === 0 && areaA >= 0 && areaB >= 0) {
        if (area(v3, curr.prev.point, v1) > 0 || area(v3, curr.next.point, v1) > 0) {
          vertex.isEar = false;
          break;
        }
      }
    }
  } else {
    vertex.isEar = false;
  }
}
function removeCollinearOrDuplicate(start) {
  for (var curr = start, end = start;;) {
    if (equals(curr.point, curr.next.point) || area(curr.prev.point, curr.point, curr.next.point) === 0) {
      curr.prev.next = curr.next;
      curr.next.prev = curr.prev;
      curr.prev.shouldUpdate = true;
      curr.next.shouldUpdate = true;
      if (curr === curr.next) {
        break;
      }
      end = curr.prev;
      curr = curr.next;
      continue;
    }
    curr = curr.next;
    if (curr === end) {
      break;
    }
  }
}
function Triangulate(polygon) {
  ForceCounterClockWise(polygon);
  if (polygon.length < 4) {
    return [polygon];
  }
  var len = polygon.length;
  var vertices = [];
  var triangles = [];
  for (var i = 0; i < len; ++i) {
    var v = new Vertex();
    v.isActive = true;
    v.isConvex = false;
    v.isEar = false;
    v.point = polygon[i];
    v.angleCos = 0;
    v.shouldUpdate = true;
    v.index = i;
    vertices.push(v);
  }
  for (var _i3 = 0; _i3 < len; ++_i3) {
    var vertex = vertices[_i3];
    vertex.prev = vertices[(_i3 + len - 1) % len];
    vertex.next = vertices[(_i3 + 1) % len];
  }
  vertices.forEach(function (vertex) {
    return updateVertex(vertex, vertices);
  });
  for (var _i4 = 0; _i4 < len - 3; ++_i4) {
    var ear = void 0;
    for (var j = 0; j < len; ++j) {
      var _vertex = vertices[j];
      if (!_vertex.isActive || !_vertex.isEar) {
        continue;
      }
      if (!ear) {
        ear = _vertex;
      } else if (_vertex.angleCos > ear.angleCos) {
        ear = _vertex;
      }
    }
    if (!ear) {
      for (var i_1 = 0; i_1 < len; ++i_1) {
        var _vertex2 = vertices[i_1];
        if (_vertex2.isActive) {
          var p1 = _vertex2.prev.point;
          var p2 = _vertex2.point;
          var p3 = _vertex2.next.point;
          if (Math.abs(area(p1, p2, p3)) > 1e-5) {
            logID(9644);
            return null;
          }
        }
      }
      break;
    }
    triangles.push([ear.prev.point, ear.point, ear.next.point]);
    ear.isActive = false;
    ear.prev.next = ear.next;
    ear.next.prev = ear.prev;
    ear.prev.shouldUpdate = true;
    ear.next.shouldUpdate = true;
    removeCollinearOrDuplicate(ear.next);
    if (_i4 === len - 4) {
      break;
    }
    for (var i_2 = 0; i_2 < len; ++i_2) {
      updateVertex(vertices[i_2], vertices);
    }
  }
  for (var _i5 = 0; _i5 < len; ++_i5) {
    var _vertex3 = vertices[_i5];
    if (_vertex3.isActive) {
      _vertex3.prev.isActive = false;
      _vertex3.next.isActive = false;
      var _p = _vertex3.prev.point;
      var _p2 = _vertex3.point;
      var _p3 = _vertex3.next.point;
      if (Math.abs(area(_p, _p2, _p3)) > 1e-5) {
        triangles.push([_p, _p2, _p3]);
      }
    }
  }
  return triangles;
}

var PolygonPartition = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ConvexPartition: ConvexPartition
});

var ERigidBody2DType;
(function (ERigidBody2DType) {
  ERigidBody2DType[ERigidBody2DType["Static"] = 0] = "Static";
  ERigidBody2DType[ERigidBody2DType["Kinematic"] = 1] = "Kinematic";
  ERigidBody2DType[ERigidBody2DType["Dynamic"] = 2] = "Dynamic";
  ERigidBody2DType[ERigidBody2DType["Animated"] = 3] = "Animated";
})(ERigidBody2DType || (ERigidBody2DType = {}));
Enum(ERigidBody2DType);
var ECollider2DType;
(function (ECollider2DType) {
  ECollider2DType[ECollider2DType["None"] = 0] = "None";
  ECollider2DType[ECollider2DType["BOX"] = 1] = "BOX";
  ECollider2DType[ECollider2DType["CIRCLE"] = 2] = "CIRCLE";
  ECollider2DType[ECollider2DType["POLYGON"] = 3] = "POLYGON";
})(ECollider2DType || (ECollider2DType = {}));
Enum(ECollider2DType);
var EJoint2DType;
(function (EJoint2DType) {
  EJoint2DType[EJoint2DType["None"] = 0] = "None";
  EJoint2DType[EJoint2DType["DISTANCE"] = 1] = "DISTANCE";
  EJoint2DType[EJoint2DType["SPRING"] = 2] = "SPRING";
  EJoint2DType[EJoint2DType["WHEEL"] = 3] = "WHEEL";
  EJoint2DType[EJoint2DType["MOUSE"] = 4] = "MOUSE";
  EJoint2DType[EJoint2DType["FIXED"] = 5] = "FIXED";
  EJoint2DType[EJoint2DType["SLIDER"] = 6] = "SLIDER";
  EJoint2DType[EJoint2DType["RELATIVE"] = 7] = "RELATIVE";
  EJoint2DType[EJoint2DType["HINGE"] = 8] = "HINGE";
})(EJoint2DType || (EJoint2DType = {}));
Enum(EJoint2DType);
var PhysicsGroup2D;
(function (PhysicsGroup2D) {
  PhysicsGroup2D[PhysicsGroup2D["DEFAULT"] = 1] = "DEFAULT";
})(PhysicsGroup2D || (PhysicsGroup2D = {}));
Enum(PhysicsGroup2D);
var PhysicsGroup = PhysicsGroup2D;
var ERaycast2DType;
(function (ERaycast2DType) {
  ERaycast2DType[ERaycast2DType["Closest"] = 0] = "Closest";
  ERaycast2DType[ERaycast2DType["Any"] = 1] = "Any";
  ERaycast2DType[ERaycast2DType["AllClosest"] = 2] = "AllClosest";
  ERaycast2DType[ERaycast2DType["All"] = 3] = "All";
})(ERaycast2DType || (ERaycast2DType = {}));
var Contact2DType = {
  None: 'none-contact',
  BEGIN_CONTACT: 'begin-contact',
  END_CONTACT: 'end-contact',
  PRE_SOLVE: 'pre-solve',
  POST_SOLVE: 'post-solve'
};
var EPhysics2DDrawFlags;
(function (EPhysics2DDrawFlags) {
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["None"] = 0] = "None";
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["Shape"] = 1] = "Shape";
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["Joint"] = 2] = "Joint";
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["Aabb"] = 4] = "Aabb";
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["Pair"] = 8] = "Pair";
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["CenterOfMass"] = 16] = "CenterOfMass";
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["Particle"] = 32] = "Particle";
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["Controller"] = 64] = "Controller";
  EPhysics2DDrawFlags[EPhysics2DDrawFlags["All"] = 63] = "All";
})(EPhysics2DDrawFlags || (EPhysics2DDrawFlags = {}));
var PHYSICS_2D_PTM_RATIO = 32;

function register(id, wrapper) {
  log("[PHYSICS2D]: register " + id + ".");
  selector.backend[id] = wrapper;
  if (!selector.physicsWorld || selector.id === id) {
    var mutableSelector = selector;
    mutableSelector.id = id;
    mutableSelector.wrapper = wrapper;
  }
}
function switchTo(id) {
  var mutableSelector = selector;
  if (selector.physicsWorld && id !== selector.id && selector.backend[id] != null) {
    log("[PHYSICS2D]: switch from " + selector.id + " to " + id + ".");
    mutableSelector.id = id;
    mutableSelector.wrapper = selector.backend[id];
    mutableSelector.physicsWorld = createPhysicsWorld();
  } else {
    log("[PHYSICS2D]: using " + mutableSelector.id + ".");
    mutableSelector.physicsWorld = createPhysicsWorld();
  }
}
var selector = {
  id: '',
  switchTo: switchTo,
  register: register,
  wrapper: {},
  backend: {},
  physicsWorld: null,
  runInEditor: !EDITOR
};
var FUNC = function FUNC() {
  return 0;
};
var ENTIRE_WORLD = {
  impl: null,
  debugDrawFlags: 0,
  setGravity: FUNC,
  setAllowSleep: FUNC,
  step: FUNC,
  syncPhysicsToScene: FUNC,
  syncSceneToPhysics: FUNC,
  raycast: FUNC,
  testPoint: FUNC,
  testAABB: FUNC,
  drawDebug: FUNC
};
function checkPhysicsModule(obj) {
  if (obj == null) {
    errorID(9600);
    return true;
  }
  return false;
}
function createPhysicsWorld() {
  if (checkPhysicsModule(selector.wrapper.PhysicsWorld)) {
    return ENTIRE_WORLD;
  }
  return new selector.wrapper.PhysicsWorld();
}
var EntireBody = {
  impl: null,
  rigidBody: null,
  isAwake: false,
  isSleeping: false,
  initialize: FUNC,
  setType: FUNC,
  setLinearDamping: FUNC,
  setAngularDamping: FUNC,
  setGravityScale: FUNC,
  setFixedRotation: FUNC,
  setAllowSleep: FUNC,
  isActive: FUNC,
  setActive: FUNC,
  wakeUp: FUNC,
  sleep: FUNC,
  getMass: FUNC,
  getInertia: FUNC,
  getLinearVelocity: FUNC,
  setLinearVelocity: FUNC,
  getLinearVelocityFromWorldPoint: FUNC,
  getAngularVelocity: FUNC,
  setAngularVelocity: FUNC,
  getLocalVector: FUNC,
  getWorldVector: FUNC,
  getLocalPoint: FUNC,
  getWorldPoint: FUNC,
  getLocalCenter: FUNC,
  getWorldCenter: FUNC,
  applyForce: FUNC,
  applyForceToCenter: FUNC,
  applyTorque: FUNC,
  applyLinearImpulse: FUNC,
  applyLinearImpulseToCenter: FUNC,
  applyAngularImpulse: FUNC,
  onEnable: FUNC,
  onDisable: FUNC,
  onDestroy: FUNC
};
function createRigidBody() {
  var PHYSICS_2D_BUILTIN = selector.id === 'builtin';
  if (PHYSICS_2D_BUILTIN) {
    return EntireBody;
  } else {
    if (checkPhysicsModule(selector.wrapper.RigidBody)) {
      return EntireBody;
    }
    return new selector.wrapper.RigidBody();
  }
}
var CREATE_COLLIDER_PROXY = {
  INITED: false
};
var ENTIRE_SHAPE = {
  impl: null,
  collider: null,
  worldAABB: null,
  worldPoints: null,
  worldPosition: null,
  worldRadius: null,
  initialize: FUNC,
  apply: FUNC,
  onLoad: FUNC,
  onEnable: FUNC,
  onDisable: FUNC,
  onDestroy: FUNC,
  onGroupChanged: FUNC
};
function createShape(type) {
  initColliderProxy();
  return CREATE_COLLIDER_PROXY[type]();
}
function initColliderProxy() {
  if (CREATE_COLLIDER_PROXY.INITED) return;
  CREATE_COLLIDER_PROXY.INITED = true;
  CREATE_COLLIDER_PROXY[ECollider2DType.BOX] = function createBoxShape() {
    if (checkPhysicsModule(selector.wrapper.BoxShape)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.BoxShape();
  };
  CREATE_COLLIDER_PROXY[ECollider2DType.CIRCLE] = function createCircleShape() {
    if (checkPhysicsModule(selector.wrapper.CircleShape)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.CircleShape();
  };
  CREATE_COLLIDER_PROXY[ECollider2DType.POLYGON] = function createPolygonShape() {
    if (checkPhysicsModule(selector.wrapper.PolygonShape)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.PolygonShape();
  };
}
var CREATE_JOINT_PROXY = {
  INITED: false
};
var ENTIRE_JOINT = {
  impl: null,
  initialize: FUNC,
  apply: FUNC,
  setDampingRatio: FUNC,
  setFrequency: FUNC,
  setMaxForce: FUNC,
  setTarget: FUNC,
  setDistance: FUNC,
  setAngularOffset: FUNC,
  setCorrectionFactor: FUNC,
  setLinearOffset: FUNC,
  setMaxLength: FUNC,
  setMaxTorque: FUNC,
  setLowerLimit: FUNC,
  setUpperLimit: FUNC,
  setMaxMotorForce: FUNC,
  setMaxMotorTorque: FUNC,
  setMotorSpeed: FUNC,
  enableLimit: FUNC,
  enableMotor: FUNC,
  setLowerAngle: FUNC,
  setUpperAngle: FUNC
};
function createJoint(type) {
  initJointProxy();
  return CREATE_JOINT_PROXY[type]();
}
function initJointProxy() {
  if (CREATE_JOINT_PROXY.INITED) return;
  CREATE_JOINT_PROXY.INITED = true;
  var PHYSICS_2D_BUILTIN = selector.id === 'builtin';
  CREATE_JOINT_PROXY[EJoint2DType.SPRING] = function createSpringJoint() {
    if (PHYSICS_2D_BUILTIN) {
      return ENTIRE_JOINT;
    } else {
      if (checkPhysicsModule(selector.wrapper.SpringJoint)) {
        return ENTIRE_JOINT;
      }
      return new selector.wrapper.SpringJoint();
    }
  };
  CREATE_JOINT_PROXY[EJoint2DType.DISTANCE] = function createDistanceJoint() {
    if (PHYSICS_2D_BUILTIN) {
      return ENTIRE_JOINT;
    } else {
      if (checkPhysicsModule(selector.wrapper.DistanceJoint)) {
        return ENTIRE_JOINT;
      }
      return new selector.wrapper.DistanceJoint();
    }
  };
  CREATE_JOINT_PROXY[EJoint2DType.FIXED] = function createFixedJoint() {
    if (PHYSICS_2D_BUILTIN) {
      return ENTIRE_JOINT;
    } else {
      if (checkPhysicsModule(selector.wrapper.FixedJoint)) {
        return ENTIRE_JOINT;
      }
      return new selector.wrapper.FixedJoint();
    }
  };
  CREATE_JOINT_PROXY[EJoint2DType.MOUSE] = function createMouseJoint() {
    if (PHYSICS_2D_BUILTIN) {
      return ENTIRE_JOINT;
    } else {
      if (checkPhysicsModule(selector.wrapper.MouseJoint)) {
        return ENTIRE_JOINT;
      }
      return new selector.wrapper.MouseJoint();
    }
  };
  CREATE_JOINT_PROXY[EJoint2DType.RELATIVE] = function createRelativeJoint() {
    if (PHYSICS_2D_BUILTIN) {
      return ENTIRE_JOINT;
    } else {
      if (checkPhysicsModule(selector.wrapper.RelativeJoint)) {
        return ENTIRE_JOINT;
      }
      return new selector.wrapper.RelativeJoint();
    }
  };
  CREATE_JOINT_PROXY[EJoint2DType.SLIDER] = function createSliderJoint() {
    if (PHYSICS_2D_BUILTIN) {
      return ENTIRE_JOINT;
    } else {
      if (checkPhysicsModule(selector.wrapper.SliderJoint)) {
        return ENTIRE_JOINT;
      }
      return new selector.wrapper.SliderJoint();
    }
  };
  CREATE_JOINT_PROXY[EJoint2DType.WHEEL] = function createWheelJoint() {
    if (PHYSICS_2D_BUILTIN) {
      return ENTIRE_JOINT;
    } else {
      if (checkPhysicsModule(selector.wrapper.WheelJoint)) {
        return ENTIRE_JOINT;
      }
      return new selector.wrapper.WheelJoint();
    }
  };
  CREATE_JOINT_PROXY[EJoint2DType.HINGE] = function createHingeJoint() {
    if (PHYSICS_2D_BUILTIN) {
      return ENTIRE_JOINT;
    } else {
      if (checkPhysicsModule(selector.wrapper.HingeJoint)) {
        return ENTIRE_JOINT;
      }
      return new selector.wrapper.HingeJoint();
    }
  };
}

var instance = null;
cclegacy.internal.PhysicsGroup2D = PhysicsGroup2D;
var PhysicsSystem2D = function (_Eventify) {
  function PhysicsSystem2D() {
    var _settings$querySettin, _settings$querySettin2, _settings$querySettin3, _settings$querySettin4;
    var _this;
    _this = _Eventify.call(this) || this;
    _this.velocityIterations = 10;
    _this.positionIterations = 10;
    _this.collisionMatrix = new CollisionMatrix();
    _this._enable = true;
    _this._allowSleep = true;
    _this._maxSubSteps = 1;
    _this._fixedTimeStep = 1.0 / 60.0;
    _this._autoSimulation = true;
    _this._accumulator = 0;
    _this._steping = false;
    _this._gravity = new Vec2(0, -10 * PHYSICS_2D_PTM_RATIO);
    _this._delayEvents = [];
    var gravity = settings.querySettings(SettingsCategory.PHYSICS, 'gravity');
    if (gravity) {
      Vec2.copy(_this._gravity, gravity);
      _this._gravity.multiplyScalar(PHYSICS_2D_PTM_RATIO);
    }
    _this._allowSleep = (_settings$querySettin = settings.querySettings(SettingsCategory.PHYSICS, 'allowSleep')) !== null && _settings$querySettin !== void 0 ? _settings$querySettin : _this._allowSleep;
    _this._fixedTimeStep = (_settings$querySettin2 = settings.querySettings(SettingsCategory.PHYSICS, 'fixedTimeStep')) !== null && _settings$querySettin2 !== void 0 ? _settings$querySettin2 : _this._fixedTimeStep;
    _this._maxSubSteps = (_settings$querySettin3 = settings.querySettings(SettingsCategory.PHYSICS, 'maxSubSteps')) !== null && _settings$querySettin3 !== void 0 ? _settings$querySettin3 : _this._maxSubSteps;
    _this._autoSimulation = (_settings$querySettin4 = settings.querySettings(SettingsCategory.PHYSICS, 'autoSimulation')) !== null && _settings$querySettin4 !== void 0 ? _settings$querySettin4 : _this._autoSimulation;
    var collisionMatrix = settings.querySettings(SettingsCategory.PHYSICS, 'collisionMatrix');
    if (collisionMatrix) {
      for (var i in collisionMatrix) {
        var bit = parseInt(i);
        var value = 1 << parseInt(i);
        _this.collisionMatrix["" + value] = collisionMatrix[bit];
      }
    }
    var collisionGroups = settings.querySettings(SettingsCategory.PHYSICS, 'collisionGroups');
    if (collisionGroups) {
      var cg = collisionGroups;
      if (cg instanceof Array) {
        cg.forEach(function (v) {
          PhysicsGroup2D[v.name] = 1 << v.index;
        });
        Enum.update(PhysicsGroup2D);
      }
    }
    var mutableSelector = selector;
    mutableSelector.physicsWorld = createPhysicsWorld();
    _this.gravity = _this._gravity;
    _this.allowSleep = _this._allowSleep;
    return _this;
  }
  _inheritsLoose(PhysicsSystem2D, _Eventify);
  var _proto = PhysicsSystem2D.prototype;
  _proto.postUpdate = function postUpdate(deltaTime) {
    if (!this._enable) {
      return;
    }
    if (!this._autoSimulation) {
      return;
    }
    director.emit(DirectorEvent.BEFORE_PHYSICS);
    this.physicsWorld.syncSceneToPhysics();
    this._steping = true;
    var fixedTimeStep = this._fixedTimeStep;
    var velocityIterations = this.velocityIterations;
    var positionIterations = this.positionIterations;
    this._accumulator += deltaTime;
    var substepIndex = 0;
    while (substepIndex++ < this._maxSubSteps && this._accumulator > fixedTimeStep) {
      this.physicsWorld.step(fixedTimeStep, velocityIterations, positionIterations);
      this._accumulator -= fixedTimeStep;
    }
    var events = this._delayEvents;
    for (var i = 0, l = events.length; i < l; i++) {
      var event = events[i];
      event.func.call(event.target);
    }
    events.length = 0;
    this.physicsWorld.syncPhysicsToScene();
    if (this.debugDrawFlags) {
      this.physicsWorld.drawDebug();
    }
    this._steping = false;
    director.emit(DirectorEvent.AFTER_PHYSICS);
  };
  _proto._callAfterStep = function _callAfterStep(target, func) {
    if (this._steping) {
      this._delayEvents.push({
        target: target,
        func: func
      });
    } else {
      func.call(target);
    }
  };
  _proto.resetAccumulator = function resetAccumulator(time) {
    if (time === void 0) {
      time = 0;
    }
    this._accumulator = time;
  };
  _proto.step = function step(fixedTimeStep) {
    this.physicsWorld.step(fixedTimeStep, this.velocityIterations, this.positionIterations);
  };
  _proto.raycast = function raycast(p1, p2, type, mask) {
    if (type === void 0) {
      type = ERaycast2DType.Closest;
    }
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    return this.physicsWorld.raycast(p1, p2, type, mask);
  };
  _proto.testPoint = function testPoint(p) {
    return this.physicsWorld.testPoint(p);
  };
  _proto.testAABB = function testAABB(rect) {
    return this.physicsWorld.testAABB(rect);
  };
  PhysicsSystem2D.constructAndRegister = function constructAndRegister() {
    director.registerSystem(PhysicsSystem2D.ID, PhysicsSystem2D.instance, SystemPriority.LOW);
  };
  return _createClass(PhysicsSystem2D, [{
    key: "enable",
    get: function get() {
      return this._enable;
    },
    set: function set(value) {
      this._enable = value;
    }
  }, {
    key: "allowSleep",
    get: function get() {
      return this._allowSleep;
    },
    set: function set(v) {
      this._allowSleep = v;
      {
        this.physicsWorld.setAllowSleep(v);
      }
    }
  }, {
    key: "gravity",
    get: function get() {
      return this._gravity;
    },
    set: function set(gravity) {
      this._gravity.set(gravity);
      {
        this.physicsWorld.setGravity(new Vec2(gravity.x / PHYSICS_2D_PTM_RATIO, gravity.y / PHYSICS_2D_PTM_RATIO));
      }
    }
  }, {
    key: "maxSubSteps",
    get: function get() {
      return this._maxSubSteps;
    },
    set: function set(value) {
      this._maxSubSteps = value;
    }
  }, {
    key: "fixedTimeStep",
    get: function get() {
      return this._fixedTimeStep;
    },
    set: function set(value) {
      this._fixedTimeStep = value;
    }
  }, {
    key: "autoSimulation",
    get: function get() {
      return this._autoSimulation;
    },
    set: function set(value) {
      this._autoSimulation = value;
    }
  }, {
    key: "debugDrawFlags",
    get: function get() {
      return this.physicsWorld.debugDrawFlags;
    },
    set: function set(v) {
      this.physicsWorld.debugDrawFlags = v;
    }
  }, {
    key: "physicsWorld",
    get: function get() {
      return selector.physicsWorld;
    }
  }, {
    key: "stepping",
    get: function get() {
      return this._steping;
    }
  }], [{
    key: "PHYSICS_NONE",
    get: function get() {
      return !selector.id;
    }
  }, {
    key: "PHYSICS_BUILTIN",
    get: function get() {
      return selector.id === 'builtin';
    }
  }, {
    key: "PHYSICS_BOX2D",
    get: function get() {
      return selector.id === 'box2d';
    }
  }, {
    key: "PHYSICS_BOX2D_WASM",
    get: function get() {
      return selector.id === 'box2d-wasm';
    }
  }, {
    key: "PhysicsGroup",
    get: function get() {
      return PhysicsGroup2D;
    }
  }, {
    key: "instance",
    get: function get() {
      if (!instance) {
        instance = new PhysicsSystem2D();
      }
      return instance;
    }
  }]);
}(Eventify(System));
PhysicsSystem2D.ID = 'PHYSICS_2D';
{
  director.once(DirectorEvent.INIT, function () {
    PhysicsSystem2D.constructAndRegister();
  });
}

var Physics2DManifoldType;
(function (Physics2DManifoldType) {
  Physics2DManifoldType[Physics2DManifoldType["Circles"] = 0] = "Circles";
  Physics2DManifoldType[Physics2DManifoldType["FaceA"] = 1] = "FaceA";
  Physics2DManifoldType[Physics2DManifoldType["FaceB"] = 2] = "FaceB";
})(Physics2DManifoldType || (Physics2DManifoldType = {}));

var _dec$d, _dec2$d, _dec3$a, _dec4$7, _dec5$6, _dec6$5, _dec7$5, _dec8$2, _dec9$1, _dec0, _class$d, _class2$d, _initializer$d, _initializer2$b, _initializer3$8, _initializer4$7, _initializer5$5, _initializer6$5, _initializer7$2, _initializer8$1, _initializer9, _initializer0, _initializer1, _initializer10;
var type$2 = type$3,
  ccclass$d = ccclass$e;
var RigidBody2D = (_dec$d = ccclass$d('cc.RigidBody2D'), _dec2$d = type$2(PhysicsGroup$1), _dec3$a = type$2(ERigidBody2DType), _dec4$7 = type$2(CCBoolean), _dec5$6 = type$2(CCFloat), _dec6$5 = type$2(CCFloat), _dec7$5 = type$2(CCFloat), _dec8$2 = type$2(Vec2), _dec9$1 = type$2(CCFloat), _dec0 = type$2(CCBoolean), _dec$d(_class$d = (_class2$d = function (_Component) {
  function RigidBody2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.enabledContactListener = _initializer$d && _initializer$d();
    _this.bullet = _initializer2$b && _initializer2$b();
    _this.awakeOnLoad = _initializer3$8 && _initializer3$8();
    _this._body = null;
    _this._group = _initializer4$7 && _initializer4$7();
    _this._type = _initializer5$5 && _initializer5$5();
    _this._allowSleep = _initializer6$5 && _initializer6$5();
    _this._gravityScale = _initializer7$2 && _initializer7$2();
    _this._linearDamping = _initializer8$1 && _initializer8$1();
    _this._angularDamping = _initializer9 && _initializer9();
    _this._linearVelocity = _initializer0 && _initializer0();
    _this._angularVelocity = _initializer1 && _initializer1();
    _this._fixedRotation = _initializer10 && _initializer10();
    return _this;
  }
  _inheritsLoose(RigidBody2D, _Component);
  var _proto = RigidBody2D.prototype;
  _proto.isAwake = function isAwake() {
    if (this._body) {
      return this._body.isAwake;
    }
    return false;
  };
  _proto.wakeUp = function wakeUp() {
    if (this._body) {
      this._body.wakeUp();
    }
  };
  _proto.sleep = function sleep() {
    if (this._body) {
      this._body.sleep();
    }
  };
  _proto.getMass = function getMass() {
    if (this._body) {
      return this._body.getMass();
    }
    return 0;
  };
  _proto.applyForce = function applyForce(force, point, wake) {
    if (this._body) {
      this._body.applyForce(force, point, wake);
    }
  };
  _proto.applyForceToCenter = function applyForceToCenter(force, wake) {
    if (this._body) {
      this._body.applyForceToCenter(force, wake);
    }
  };
  _proto.applyTorque = function applyTorque(torque, wake) {
    if (this._body) {
      this._body.applyTorque(torque, wake);
    }
  };
  _proto.applyLinearImpulse = function applyLinearImpulse(impulse, point, wake) {
    if (this._body) {
      this._body.applyLinearImpulse(impulse, point, wake);
    }
  };
  _proto.applyLinearImpulseToCenter = function applyLinearImpulseToCenter(impulse, wake) {
    if (this._body) {
      this._body.applyLinearImpulseToCenter(impulse, wake);
    }
  };
  _proto.applyAngularImpulse = function applyAngularImpulse(impulse, wake) {
    if (this._body) {
      this._body.applyAngularImpulse(impulse, wake);
    }
  };
  _proto.getLinearVelocityFromWorldPoint = function getLinearVelocityFromWorldPoint(worldPoint, out) {
    if (this._body) {
      return this._body.getLinearVelocityFromWorldPoint(worldPoint, out);
    }
    return out;
  };
  _proto.getLocalVector = function getLocalVector(worldVector, out) {
    if (this._body) {
      return this._body.getLocalVector(worldVector, out);
    }
    return out;
  };
  _proto.getWorldVector = function getWorldVector(localVector, out) {
    if (this._body) {
      return this._body.getWorldVector(localVector, out);
    }
    return out;
  };
  _proto.getLocalPoint = function getLocalPoint(worldPoint, out) {
    if (this._body) {
      return this._body.getLocalPoint(worldPoint, out);
    }
    return out;
  };
  _proto.getWorldPoint = function getWorldPoint(localPoint, out) {
    if (this._body) {
      return this._body.getWorldPoint(localPoint, out);
    }
    return out;
  };
  _proto.getLocalCenter = function getLocalCenter(out) {
    if (this._body) {
      return this._body.getLocalCenter(out);
    }
    return out;
  };
  _proto.getWorldCenter = function getWorldCenter(out) {
    if (this._body) {
      return this._body.getWorldCenter(out);
    }
    return out;
  };
  _proto.getInertia = function getInertia() {
    if (this._body) {
      return this._body.getInertia();
    }
    return 0;
  };
  _proto.onLoad = function onLoad() {
    {
      this._body = createRigidBody();
      this._body.initialize(this);
    }
  };
  _proto.onEnable = function onEnable() {
    if (this._body) {
      this._body.onEnable();
    }
  };
  _proto.onDisable = function onDisable() {
    if (this._body) {
      this._body.onDisable();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._body) {
      this._body.onDestroy();
    }
  };
  return _createClass(RigidBody2D, [{
    key: "group",
    get: function get() {
      return this._group;
    },
    set: function set(v) {
      this._group = v;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(v) {
      this._type = v;
      if (this._body) {
        if (v === ERigidBody2DType.Animated) {
          this._body.setType(ERigidBody2DType.Kinematic);
        } else {
          this._body.setType(v);
        }
      }
    }
  }, {
    key: "allowSleep",
    get: function get() {
      return this._allowSleep;
    },
    set: function set(v) {
      this._allowSleep = v;
      if (this._body) {
        this._body.setAllowSleep(v);
      }
    }
  }, {
    key: "gravityScale",
    get: function get() {
      return this._gravityScale;
    },
    set: function set(v) {
      this._gravityScale = v;
      if (this._body) {
        this._body.setGravityScale(v);
      }
    }
  }, {
    key: "linearDamping",
    get: function get() {
      return this._linearDamping;
    },
    set: function set(v) {
      this._linearDamping = v;
      if (this._body) {
        this._body.setLinearDamping(v);
      }
    }
  }, {
    key: "angularDamping",
    get: function get() {
      return this._angularDamping;
    },
    set: function set(v) {
      this._angularDamping = v;
      if (this._body) {
        this._body.setAngularDamping(v);
      }
    }
  }, {
    key: "linearVelocity",
    get: function get() {
      if (this._body) {
        this._body.getLinearVelocity(this._linearVelocity);
      }
      return this._linearVelocity;
    },
    set: function set(v) {
      this._linearVelocity = v;
      if (this._body) {
        this._body.setLinearVelocity(v);
      }
    }
  }, {
    key: "angularVelocity",
    get: function get() {
      if (this._body) {
        this._angularVelocity = this._body.getAngularVelocity();
      }
      return this._angularVelocity;
    },
    set: function set(v) {
      this._angularVelocity = v;
      if (this._body) {
        this._body.setAngularVelocity(v);
      }
    }
  }, {
    key: "fixedRotation",
    get: function get() {
      return this._fixedRotation;
    },
    set: function set(v) {
      this._fixedRotation = v;
      if (this._body) {
        this._body.setFixedRotation(v);
      }
    }
  }, {
    key: "impl",
    get: function get() {
      return this._body;
    }
  }]);
}(Component), _applyDecoratedDescriptor(_class2$d.prototype, "group", [_dec2$d], Object.getOwnPropertyDescriptor(_class2$d.prototype, "group"), _class2$d.prototype), _initializer$d = applyDecoratedInitializer(_class2$d.prototype, "enabledContactListener", [serializable], function () {
  return false;
}), _initializer2$b = applyDecoratedInitializer(_class2$d.prototype, "bullet", [serializable], function () {
  return false;
}), _applyDecoratedDescriptor(_class2$d.prototype, "type", [_dec3$a], Object.getOwnPropertyDescriptor(_class2$d.prototype, "type"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "allowSleep", [_dec4$7], Object.getOwnPropertyDescriptor(_class2$d.prototype, "allowSleep"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "gravityScale", [_dec5$6], Object.getOwnPropertyDescriptor(_class2$d.prototype, "gravityScale"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "linearDamping", [_dec6$5], Object.getOwnPropertyDescriptor(_class2$d.prototype, "linearDamping"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "angularDamping", [_dec7$5], Object.getOwnPropertyDescriptor(_class2$d.prototype, "angularDamping"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "linearVelocity", [_dec8$2], Object.getOwnPropertyDescriptor(_class2$d.prototype, "linearVelocity"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "angularVelocity", [_dec9$1], Object.getOwnPropertyDescriptor(_class2$d.prototype, "angularVelocity"), _class2$d.prototype), _applyDecoratedDescriptor(_class2$d.prototype, "fixedRotation", [_dec0], Object.getOwnPropertyDescriptor(_class2$d.prototype, "fixedRotation"), _class2$d.prototype), _initializer3$8 = applyDecoratedInitializer(_class2$d.prototype, "awakeOnLoad", [serializable], function () {
  return true;
}), _initializer4$7 = applyDecoratedInitializer(_class2$d.prototype, "_group", [serializable], function () {
  return PhysicsGroup$1.DEFAULT;
}), _initializer5$5 = applyDecoratedInitializer(_class2$d.prototype, "_type", [serializable], function () {
  return ERigidBody2DType.Dynamic;
}), _initializer6$5 = applyDecoratedInitializer(_class2$d.prototype, "_allowSleep", [serializable], function () {
  return true;
}), _initializer7$2 = applyDecoratedInitializer(_class2$d.prototype, "_gravityScale", [serializable], function () {
  return 1;
}), _initializer8$1 = applyDecoratedInitializer(_class2$d.prototype, "_linearDamping", [serializable], function () {
  return 0;
}), _initializer9 = applyDecoratedInitializer(_class2$d.prototype, "_angularDamping", [serializable], function () {
  return 0;
}), _initializer0 = applyDecoratedInitializer(_class2$d.prototype, "_linearVelocity", [serializable], function () {
  return new Vec2();
}), _initializer1 = applyDecoratedInitializer(_class2$d.prototype, "_angularVelocity", [serializable], function () {
  return 0;
}), _initializer10 = applyDecoratedInitializer(_class2$d.prototype, "_fixedRotation", [serializable], function () {
  return false;
}), _class2$d)) || _class$d);

var _dec$c, _dec2$c, _dec3$9, _dec4$6, _dec5$5, _dec6$4, _dec7$4, _dec8$1, _class$c, _class2$c, _initializer$c, _initializer2$a, _initializer3$7, _initializer4$6, _initializer5$4, _initializer6$4, _initializer7$1;
var ccclass$c = ccclass$e,
  type$1 = type$3;
var Collider2D = (_dec$c = ccclass$c('cc.Collider2D'), _dec2$c = type$1(CCFloat), _dec3$9 = type$1(PhysicsGroup$1), _dec4$6 = type$1(CCFloat), _dec5$5 = type$1(CCBoolean), _dec6$4 = type$1(CCFloat), _dec7$4 = type$1(CCFloat), _dec8$1 = type$1(Vec2), _dec$c(_class$c = (_class2$c = function (_Eventify) {
  function Collider2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Eventify.call.apply(_Eventify, [this].concat(args)) || this;
    _this.editing = false;
    _this.tag = _initializer$c && _initializer$c();
    _this.TYPE = ECollider2DType.None;
    _this._shape = null;
    _this._body = null;
    _this._group = _initializer2$a && _initializer2$a();
    _this._density = _initializer3$7 && _initializer3$7();
    _this._sensor = _initializer4$6 && _initializer4$6();
    _this._friction = _initializer5$4 && _initializer5$4();
    _this._restitution = _initializer6$4 && _initializer6$4();
    _this._offset = _initializer7$1 && _initializer7$1();
    return _this;
  }
  _inheritsLoose(Collider2D, _Eventify);
  var _proto = Collider2D.prototype;
  _proto.onLoad = function onLoad() {
    {
      this._shape = createShape(this.TYPE);
      this._shape.initialize(this);
      if (this._shape.onLoad) {
        this._shape.onLoad();
      }
      this._body = this.getComponent(RigidBody2D);
    }
  };
  _proto.onEnable = function onEnable() {
    if (this._shape) {
      this._shape.onEnable();
    }
  };
  _proto.onDisable = function onDisable() {
    if (this._shape && this._shape.onDisable) {
      this._shape.onDisable();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._shape && this._shape.onDestroy) {
      this._shape.onDestroy();
    }
  };
  _proto.apply = function apply() {
    if (this._shape && this._shape.apply) {
      this._shape.apply();
    }
  };
  return _createClass(Collider2D, [{
    key: "group",
    get: function get() {
      return this._group;
    },
    set: function set(v) {
      this._group = v;
      if (this._shape && this._shape.onGroupChanged) {
        this._shape.onGroupChanged();
      }
    }
  }, {
    key: "density",
    get: function get() {
      return this._density;
    },
    set: function set(v) {
      this._density = v;
    }
  }, {
    key: "sensor",
    get: function get() {
      return this._sensor;
    },
    set: function set(v) {
      this._sensor = v;
    }
  }, {
    key: "friction",
    get: function get() {
      return this._friction;
    },
    set: function set(v) {
      this._friction = v;
    }
  }, {
    key: "restitution",
    get: function get() {
      return this._restitution;
    },
    set: function set(v) {
      this._restitution = v;
    }
  }, {
    key: "offset",
    get: function get() {
      return this._offset;
    },
    set: function set(v) {
      this._offset = v;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }, {
    key: "worldAABB",
    get: function get() {
      if (this._shape) {
        return this._shape.worldAABB;
      }
      return new Rect();
    }
  }]);
}(Eventify(Component)), _initializer$c = applyDecoratedInitializer(_class2$c.prototype, "tag", [_dec2$c, serializable], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$c.prototype, "group", [_dec3$9], Object.getOwnPropertyDescriptor(_class2$c.prototype, "group"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "density", [_dec4$6], Object.getOwnPropertyDescriptor(_class2$c.prototype, "density"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "sensor", [_dec5$5], Object.getOwnPropertyDescriptor(_class2$c.prototype, "sensor"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "friction", [_dec6$4], Object.getOwnPropertyDescriptor(_class2$c.prototype, "friction"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "restitution", [_dec7$4], Object.getOwnPropertyDescriptor(_class2$c.prototype, "restitution"), _class2$c.prototype), _applyDecoratedDescriptor(_class2$c.prototype, "offset", [_dec8$1], Object.getOwnPropertyDescriptor(_class2$c.prototype, "offset"), _class2$c.prototype), _initializer2$a = applyDecoratedInitializer(_class2$c.prototype, "_group", [serializable], function () {
  return PhysicsGroup$1.DEFAULT;
}), _initializer3$7 = applyDecoratedInitializer(_class2$c.prototype, "_density", [serializable], function () {
  return 1.0;
}), _initializer4$6 = applyDecoratedInitializer(_class2$c.prototype, "_sensor", [serializable], function () {
  return false;
}), _initializer5$4 = applyDecoratedInitializer(_class2$c.prototype, "_friction", [serializable], function () {
  return 0.2;
}), _initializer6$4 = applyDecoratedInitializer(_class2$c.prototype, "_restitution", [serializable], function () {
  return 0;
}), _initializer7$1 = applyDecoratedInitializer(_class2$c.prototype, "_offset", [serializable], function () {
  return new Vec2();
}), _class2$c)) || _class$c);

var _dec$b, _dec2$b, _class$b, _class2$b, _initializer$b;
var ccclass$b = ccclass$e;
var BoxCollider2D = (_dec$b = ccclass$b('cc.BoxCollider2D'), _dec2$b = type$3(Size), _dec$b(_class$b = (_class2$b = function (_Collider2D) {
  function BoxCollider2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Collider2D.call.apply(_Collider2D, [this].concat(args)) || this;
    _this._size = _initializer$b && _initializer$b();
    _this.TYPE = ECollider2DType.BOX;
    return _this;
  }
  _inheritsLoose(BoxCollider2D, _Collider2D);
  return _createClass(BoxCollider2D, [{
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(v) {
      this._size = v;
    }
  }, {
    key: "worldPoints",
    get: function get() {
      if (this._shape) {
        return this._shape.worldPoints;
      }
      return [];
    }
  }]);
}(Collider2D), _initializer$b = applyDecoratedInitializer(_class2$b.prototype, "_size", [serializable], function () {
  return new Size(1, 1);
}), _applyDecoratedDescriptor(_class2$b.prototype, "size", [_dec2$b], Object.getOwnPropertyDescriptor(_class2$b.prototype, "size"), _class2$b.prototype), _class2$b)) || _class$b);

var _dec$a, _dec2$a, _class$a, _class2$a, _initializer$a;
var ccclass$a = ccclass$e;
var CircleCollider2D = (_dec$a = ccclass$a('cc.CircleCollider2D'), _dec2$a = type$3(CCFloat), _dec$a(_class$a = (_class2$a = function (_Collider2D) {
  function CircleCollider2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Collider2D.call.apply(_Collider2D, [this].concat(args)) || this;
    _this._radius = _initializer$a && _initializer$a();
    _this.TYPE = ECollider2DType.CIRCLE;
    return _this;
  }
  _inheritsLoose(CircleCollider2D, _Collider2D);
  return _createClass(CircleCollider2D, [{
    key: "radius",
    get: function get() {
      return this._radius;
    },
    set: function set(v) {
      this._radius = v < 0 ? 0 : v;
    }
  }, {
    key: "worldPosition",
    get: function get() {
      if (this._shape) {
        return this._shape.worldPosition;
      }
      return new Vec2();
    }
  }, {
    key: "worldRadius",
    get: function get() {
      if (this._shape) {
        return this._shape.worldRadius;
      }
      return 0;
    }
  }]);
}(Collider2D), _initializer$a = applyDecoratedInitializer(_class2$a.prototype, "_radius", [serializable], function () {
  return 1;
}), _applyDecoratedDescriptor(_class2$a.prototype, "radius", [_dec2$a], Object.getOwnPropertyDescriptor(_class2$a.prototype, "radius"), _class2$a.prototype), _class2$a)) || _class$a);

var _dec$9, _dec2$9, _dec3$8, _class$9, _class2$9, _initializer$9, _initializer2$9;
var ccclass$9 = ccclass$e;
var PolygonCollider2D = (_dec$9 = ccclass$9('cc.PolygonCollider2D'), _dec2$9 = type$3(CCFloat), _dec3$8 = type$3([Vec2]), _dec$9(_class$9 = (_class2$9 = function (_Collider2D) {
  function PolygonCollider2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Collider2D.call.apply(_Collider2D, [this].concat(args)) || this;
    _this.threshold = _initializer$9 && _initializer$9();
    _this._points = _initializer2$9 && _initializer2$9();
    _this.TYPE = ECollider2DType.POLYGON;
    return _this;
  }
  _inheritsLoose(PolygonCollider2D, _Collider2D);
  return _createClass(PolygonCollider2D, [{
    key: "points",
    get: function get() {
      return this._points;
    },
    set: function set(v) {
      this._points = v;
    }
  }, {
    key: "worldPoints",
    get: function get() {
      if (this._shape) {
        return this._shape.worldPoints;
      }
      return [];
    }
  }]);
}(Collider2D), _initializer$9 = applyDecoratedInitializer(_class2$9.prototype, "threshold", [_dec2$9], function () {
  return 1;
}), _initializer2$9 = applyDecoratedInitializer(_class2$9.prototype, "_points", [serializable], function () {
  return [new Vec2(-1, -1), new Vec2(1, -1), new Vec2(1, 1), new Vec2(-1, 1)];
}), _applyDecoratedDescriptor(_class2$9.prototype, "points", [_dec3$8], Object.getOwnPropertyDescriptor(_class2$9.prototype, "points"), _class2$9.prototype), _class2$9)) || _class$9);

var _dec$8, _dec2$8, _class$8, _class2$8, _initializer$8, _initializer2$8, _initializer3$6, _initializer4$5;
var ccclass$8 = ccclass$e,
  type = type$3;
var Joint2D = (_dec$8 = ccclass$8('cc.Joint2D'), _dec2$8 = type(RigidBody2D), _dec$8(_class$8 = (_class2$8 = function (_Component) {
  function Joint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.anchor = _initializer$8 && _initializer$8();
    _this.connectedAnchor = _initializer2$8 && _initializer2$8();
    _this.collideConnected = _initializer3$6 && _initializer3$6();
    _this.connectedBody = _initializer4$5 && _initializer4$5();
    _this._body = null;
    _this._joint = null;
    _this.TYPE = EJoint2DType.None;
    return _this;
  }
  _inheritsLoose(Joint2D, _Component);
  var _proto = Joint2D.prototype;
  _proto.onLoad = function onLoad() {
    {
      this._joint = createJoint(this.TYPE);
      this._joint.initialize(this);
      this._body = this.getComponent(RigidBody2D);
    }
  };
  _proto.onEnable = function onEnable() {
    if (this._joint && this._joint.onEnable) {
      this._joint.onEnable();
    }
  };
  _proto.onDisable = function onDisable() {
    if (this._joint && this._joint.onDisable) {
      this._joint.onDisable();
    }
  };
  _proto.start = function start() {
    if (this._joint && this._joint.start) {
      this._joint.start();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._joint && this._joint.onDestroy) {
      this._joint.onDestroy();
    }
  };
  _proto.apply = function apply() {
    if (this._joint && this._joint.apply) {
      this._joint.apply();
    }
  };
  return _createClass(Joint2D, [{
    key: "body",
    get: function get() {
      return this._body;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._joint;
    }
  }]);
}(Component), _initializer$8 = applyDecoratedInitializer(_class2$8.prototype, "anchor", [serializable], function () {
  return new Vec2();
}), _initializer2$8 = applyDecoratedInitializer(_class2$8.prototype, "connectedAnchor", [serializable], function () {
  return new Vec2();
}), _initializer3$6 = applyDecoratedInitializer(_class2$8.prototype, "collideConnected", [serializable], function () {
  return false;
}), _initializer4$5 = applyDecoratedInitializer(_class2$8.prototype, "connectedBody", [_dec2$8, serializable], function () {
  return null;
}), _class2$8)) || _class$8);

var _dec$7, _dec2$7, _dec3$7, _class$7, _class2$7, _initializer$7, _initializer2$7;
var ccclass$7 = ccclass$e;
var DistanceJoint2D = (_dec$7 = ccclass$7('cc.DistanceJoint2D'), _dec2$7 = type$3(CCFloat), _dec3$7 = type$3(CCBoolean), _dec$7(_class$7 = (_class2$7 = function (_Joint2D) {
  function DistanceJoint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Joint2D.call.apply(_Joint2D, [this].concat(args)) || this;
    _this.TYPE = EJoint2DType.DISTANCE;
    _this._maxLength = _initializer$7 && _initializer$7();
    _this._autoCalcDistance = _initializer2$7 && _initializer2$7();
    return _this;
  }
  _inheritsLoose(DistanceJoint2D, _Joint2D);
  return _createClass(DistanceJoint2D, [{
    key: "maxLength",
    get: function get() {
      if (this._autoCalcDistance) {
        if (this.connectedBody) {
          return Vec3.distance(this.node.worldPosition, this.connectedBody.node.worldPosition);
        } else {
          return Vec3.len(this.node.worldPosition);
        }
      }
      return this._maxLength;
    },
    set: function set(v) {
      this._maxLength = v;
      if (this._joint) {
        this._joint.setMaxLength(v);
      }
    }
  }, {
    key: "autoCalcDistance",
    get: function get() {
      return this._autoCalcDistance;
    },
    set: function set(v) {
      this._autoCalcDistance = v;
    }
  }]);
}(Joint2D), _applyDecoratedDescriptor(_class2$7.prototype, "maxLength", [_dec2$7], Object.getOwnPropertyDescriptor(_class2$7.prototype, "maxLength"), _class2$7.prototype), _applyDecoratedDescriptor(_class2$7.prototype, "autoCalcDistance", [_dec3$7], Object.getOwnPropertyDescriptor(_class2$7.prototype, "autoCalcDistance"), _class2$7.prototype), _initializer$7 = applyDecoratedInitializer(_class2$7.prototype, "_maxLength", [serializable], function () {
  return 5;
}), _initializer2$7 = applyDecoratedInitializer(_class2$7.prototype, "_autoCalcDistance", [serializable], function () {
  return true;
}), _class2$7)) || _class$7);

var _dec$6, _dec2$6, _dec3$6, _dec4$5, _dec5$4, _class$6, _class2$6, _initializer$6, _initializer2$6, _initializer3$5, _initializer4$4;
var ccclass$6 = ccclass$e;
var SpringJoint2D = (_dec$6 = ccclass$6('cc.SpringJoint2D'), _dec2$6 = type$3(CCFloat), _dec3$6 = type$3(CCFloat), _dec4$5 = type$3(CCFloat), _dec5$4 = type$3(CCBoolean), _dec$6(_class$6 = (_class2$6 = function (_Joint2D) {
  function SpringJoint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Joint2D.call.apply(_Joint2D, [this].concat(args)) || this;
    _this.TYPE = EJoint2DType.SPRING;
    _this._frequency = _initializer$6 && _initializer$6();
    _this._dampingRatio = _initializer2$6 && _initializer2$6();
    _this._distance = _initializer3$5 && _initializer3$5();
    _this._autoCalcDistance = _initializer4$4 && _initializer4$4();
    return _this;
  }
  _inheritsLoose(SpringJoint2D, _Joint2D);
  return _createClass(SpringJoint2D, [{
    key: "frequency",
    get: function get() {
      return this._frequency;
    },
    set: function set(v) {
      this._frequency = v;
      if (this._joint) {
        this._joint.setFrequency(v);
      }
    }
  }, {
    key: "dampingRatio",
    get: function get() {
      return this._dampingRatio;
    },
    set: function set(v) {
      this._dampingRatio = v;
      if (this._joint) {
        this._joint.setDampingRatio(v);
      }
    }
  }, {
    key: "distance",
    get: function get() {
      if (this._autoCalcDistance) {
        if (this.connectedBody) {
          return Vec3.distance(this.node.worldPosition, this.connectedBody.node.worldPosition);
        } else {
          return Vec3.len(this.node.worldPosition);
        }
      }
      return this._distance;
    },
    set: function set(v) {
      this._distance = v;
      if (this._joint) {
        this._joint.setDistance(v);
      }
    }
  }, {
    key: "autoCalcDistance",
    get: function get() {
      return this._autoCalcDistance;
    },
    set: function set(v) {
      this._autoCalcDistance = v;
    }
  }]);
}(Joint2D), _applyDecoratedDescriptor(_class2$6.prototype, "frequency", [_dec2$6], Object.getOwnPropertyDescriptor(_class2$6.prototype, "frequency"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "dampingRatio", [_dec3$6], Object.getOwnPropertyDescriptor(_class2$6.prototype, "dampingRatio"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "distance", [_dec4$5], Object.getOwnPropertyDescriptor(_class2$6.prototype, "distance"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "autoCalcDistance", [_dec5$4], Object.getOwnPropertyDescriptor(_class2$6.prototype, "autoCalcDistance"), _class2$6.prototype), _initializer$6 = applyDecoratedInitializer(_class2$6.prototype, "_frequency", [serializable], function () {
  return 5;
}), _initializer2$6 = applyDecoratedInitializer(_class2$6.prototype, "_dampingRatio", [serializable], function () {
  return 0.7;
}), _initializer3$5 = applyDecoratedInitializer(_class2$6.prototype, "_distance", [serializable], function () {
  return 10;
}), _initializer4$4 = applyDecoratedInitializer(_class2$6.prototype, "_autoCalcDistance", [serializable], function () {
  return true;
}), _class2$6)) || _class$6);

var _dec$5, _dec2$5, _dec3$5, _dec4$4, _class$5, _class2$5, _initializer$5, _initializer2$5, _initializer3$4;
var ccclass$5 = ccclass$e;
var MouseJoint2D = (_dec$5 = ccclass$5('cc.MouseJoint2D'), _dec2$5 = type$3(CCFloat), _dec3$5 = type$3(CCFloat), _dec4$4 = type$3(CCFloat), _dec$5(_class$5 = (_class2$5 = function (_Joint2D) {
  function MouseJoint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Joint2D.call.apply(_Joint2D, [this].concat(args)) || this;
    _this.TYPE = EJoint2DType.MOUSE;
    _this._maxForce = _initializer$5 && _initializer$5();
    _this._dampingRatio = _initializer2$5 && _initializer2$5();
    _this._frequency = _initializer3$4 && _initializer3$4();
    _this._target = new Vec2();
    return _this;
  }
  _inheritsLoose(MouseJoint2D, _Joint2D);
  var _proto = MouseJoint2D.prototype;
  _proto.update = function update(dt) {
    this._joint.update(dt);
  };
  return _createClass(MouseJoint2D, [{
    key: "target",
    get: function get() {
      return this._target;
    },
    set: function set(v) {
      this._target = v;
      if (this._joint) {
        this._joint.setTarget(v);
      }
    }
  }, {
    key: "frequency",
    get: function get() {
      return this._frequency;
    },
    set: function set(v) {
      this._frequency = v;
      if (this._joint) {
        this._joint.setFrequency(v);
      }
    }
  }, {
    key: "dampingRatio",
    get: function get() {
      return this._dampingRatio;
    },
    set: function set(v) {
      this._dampingRatio = v;
      if (this._joint) {
        this._joint.setDampingRatio(v);
      }
    }
  }, {
    key: "maxForce",
    get: function get() {
      return this._maxForce;
    },
    set: function set(v) {
      this._maxForce = v;
      if (this._joint) {
        this._joint.setMaxForce(v);
      }
    }
  }]);
}(Joint2D), _applyDecoratedDescriptor(_class2$5.prototype, "frequency", [_dec2$5], Object.getOwnPropertyDescriptor(_class2$5.prototype, "frequency"), _class2$5.prototype), _applyDecoratedDescriptor(_class2$5.prototype, "dampingRatio", [_dec3$5], Object.getOwnPropertyDescriptor(_class2$5.prototype, "dampingRatio"), _class2$5.prototype), _applyDecoratedDescriptor(_class2$5.prototype, "maxForce", [_dec4$4], Object.getOwnPropertyDescriptor(_class2$5.prototype, "maxForce"), _class2$5.prototype), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "_maxForce", [serializable], function () {
  return 1000;
}), _initializer2$5 = applyDecoratedInitializer(_class2$5.prototype, "_dampingRatio", [serializable], function () {
  return 0.7;
}), _initializer3$4 = applyDecoratedInitializer(_class2$5.prototype, "_frequency", [serializable], function () {
  return 5;
}), _class2$5)) || _class$5);

var _dec$4, _dec2$4, _dec3$4, _dec4$3, _dec5$3, _dec6$3, _dec7$3, _class$4, _class2$4, _initializer$4, _initializer2$4, _initializer3$3, _initializer4$3, _initializer5$3, _initializer6$3;
var tempVec3_1 = new Vec3();
var tempVec3_2 = new Vec3();
var ccclass$4 = ccclass$e;
var RelativeJoint2D = (_dec$4 = ccclass$4('cc.RelativeJoint2D'), _dec2$4 = type$3(CCFloat), _dec3$4 = type$3(CCFloat), _dec4$3 = type$3(CCFloat), _dec5$3 = type$3(Vec2), _dec6$3 = type$3(CCFloat), _dec7$3 = type$3(CCBoolean), _dec$4(_class$4 = (_class2$4 = function (_Joint2D) {
  function RelativeJoint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Joint2D.call.apply(_Joint2D, [this].concat(args)) || this;
    _this.TYPE = EJoint2DType.RELATIVE;
    _this._maxForce = _initializer$4 && _initializer$4();
    _this._maxTorque = _initializer2$4 && _initializer2$4();
    _this._correctionFactor = _initializer3$3 && _initializer3$3();
    _this._angularOffset = _initializer4$3 && _initializer4$3();
    _this._linearOffset = _initializer5$3 && _initializer5$3();
    _this._autoCalcOffset = _initializer6$3 && _initializer6$3();
    return _this;
  }
  _inheritsLoose(RelativeJoint2D, _Joint2D);
  return _createClass(RelativeJoint2D, [{
    key: "maxForce",
    get: function get() {
      return this._maxForce;
    },
    set: function set(v) {
      this._maxForce = v;
      if (this._joint) {
        this._joint.setMaxForce(v);
      }
    }
  }, {
    key: "maxTorque",
    get: function get() {
      return this._maxTorque;
    },
    set: function set(v) {
      this._maxTorque = v;
      if (this._joint) {
        this._joint.setMaxTorque(v);
      }
    }
  }, {
    key: "correctionFactor",
    get: function get() {
      return this._correctionFactor;
    },
    set: function set(v) {
      this._correctionFactor = v;
      if (this._joint) {
        this._joint.setCorrectionFactor(v);
      }
    }
  }, {
    key: "linearOffset",
    get: function get() {
      if (this._autoCalcOffset) {
        if (this.connectedBody) {
          return Vec2.subtract(this._linearOffset, this.connectedBody.node.worldPosition, this.node.worldPosition);
        } else {
          return Vec2.subtract(this._linearOffset, new Vec2(0, 0), this.node.worldPosition);
        }
      }
      return this._linearOffset;
    },
    set: function set(v) {
      this._linearOffset.set(v);
      if (this._joint) {
        this._joint.setLinearOffset(v);
      }
    }
  }, {
    key: "angularOffset",
    get: function get() {
      if (this._autoCalcOffset) {
        Quat.toEuler(tempVec3_1, this.node.worldRotation);
        if (this.connectedBody) {
          Quat.toEuler(tempVec3_2, this.connectedBody.node.worldRotation);
        } else {
          Quat.toEuler(tempVec3_2, new Quat());
        }
        this._angularOffset = tempVec3_2.z - tempVec3_1.z;
      }
      return this._angularOffset;
    },
    set: function set(v) {
      this._angularOffset = v;
      if (this._joint) {
        this._joint.setAngularOffset(v);
      }
    }
  }, {
    key: "autoCalcOffset",
    get: function get() {
      return this._autoCalcOffset;
    },
    set: function set(v) {
      this._autoCalcOffset = v;
    }
  }]);
}(Joint2D), _applyDecoratedDescriptor(_class2$4.prototype, "maxForce", [_dec2$4], Object.getOwnPropertyDescriptor(_class2$4.prototype, "maxForce"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "maxTorque", [_dec3$4], Object.getOwnPropertyDescriptor(_class2$4.prototype, "maxTorque"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "correctionFactor", [_dec4$3], Object.getOwnPropertyDescriptor(_class2$4.prototype, "correctionFactor"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "linearOffset", [_dec5$3], Object.getOwnPropertyDescriptor(_class2$4.prototype, "linearOffset"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "angularOffset", [_dec6$3], Object.getOwnPropertyDescriptor(_class2$4.prototype, "angularOffset"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "autoCalcOffset", [_dec7$3], Object.getOwnPropertyDescriptor(_class2$4.prototype, "autoCalcOffset"), _class2$4.prototype), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "_maxForce", [serializable], function () {
  return 5;
}), _initializer2$4 = applyDecoratedInitializer(_class2$4.prototype, "_maxTorque", [serializable], function () {
  return 0.7;
}), _initializer3$3 = applyDecoratedInitializer(_class2$4.prototype, "_correctionFactor", [serializable], function () {
  return 0.3;
}), _initializer4$3 = applyDecoratedInitializer(_class2$4.prototype, "_angularOffset", [serializable], function () {
  return 0;
}), _initializer5$3 = applyDecoratedInitializer(_class2$4.prototype, "_linearOffset", [serializable], function () {
  return new Vec2();
}), _initializer6$3 = applyDecoratedInitializer(_class2$4.prototype, "_autoCalcOffset", [serializable], function () {
  return true;
}), _class2$4)) || _class$4);

var _dec$3, _dec2$3, _dec3$3, _dec4$2, _dec5$2, _dec6$2, _dec7$2, _dec8, _dec9, _class$3, _class2$3, _initializer$3, _initializer2$3, _initializer3$2, _initializer4$2, _initializer5$2, _initializer6$2, _initializer7, _initializer8;
var tempVec2 = new Vec2();
var ccclass$3 = ccclass$e;
var SliderJoint2D = (_dec$3 = ccclass$3('cc.SliderJoint2D'), _dec2$3 = type$3(CCFloat), _dec3$3 = type$3(CCBoolean), _dec4$2 = type$3(CCBoolean), _dec5$2 = type$3(CCFloat), _dec6$2 = type$3(CCFloat), _dec7$2 = type$3(CCBoolean), _dec8 = type$3(CCFloat), _dec9 = type$3(CCFloat), _dec$3(_class$3 = (_class2$3 = function (_Joint2D) {
  function SliderJoint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Joint2D.call.apply(_Joint2D, [this].concat(args)) || this;
    _this.TYPE = EJoint2DType.SLIDER;
    _this._angle = _initializer$3 && _initializer$3();
    _this._autoCalcAngle = _initializer2$3 && _initializer2$3();
    _this._enableMotor = _initializer3$2 && _initializer3$2();
    _this._maxMotorForce = _initializer4$2 && _initializer4$2();
    _this._motorSpeed = _initializer5$2 && _initializer5$2();
    _this._enableLimit = _initializer6$2 && _initializer6$2();
    _this._lowerLimit = _initializer7 && _initializer7();
    _this._upperLimit = _initializer8 && _initializer8();
    return _this;
  }
  _inheritsLoose(SliderJoint2D, _Joint2D);
  return _createClass(SliderJoint2D, [{
    key: "angle",
    get: function get() {
      if (this._autoCalcAngle) {
        if (this.connectedBody) {
          Vec2.subtract(tempVec2, this.connectedBody.node.worldPosition, this.node.worldPosition);
        } else {
          Vec2.subtract(tempVec2, new Vec2(0, 0), this.node.worldPosition);
        }
        this._angle = toDegree(Math.atan2(tempVec2.y, tempVec2.x));
      }
      return this._angle;
    },
    set: function set(v) {
      this._angle = v;
    }
  }, {
    key: "autoCalcAngle",
    get: function get() {
      return this._autoCalcAngle;
    },
    set: function set(v) {
      this._autoCalcAngle = v;
    }
  }, {
    key: "enableMotor",
    get: function get() {
      return this._enableMotor;
    },
    set: function set(v) {
      this._enableMotor = v;
    }
  }, {
    key: "maxMotorForce",
    get: function get() {
      return this._maxMotorForce;
    },
    set: function set(v) {
      this._maxMotorForce = v;
      if (this._joint) {
        this._joint.setMaxMotorForce(v);
      }
    }
  }, {
    key: "motorSpeed",
    get: function get() {
      return this._motorSpeed;
    },
    set: function set(v) {
      this._motorSpeed = v;
      if (this._joint) {
        this._joint.setMotorSpeed(v);
      }
    }
  }, {
    key: "enableLimit",
    get: function get() {
      return this._enableLimit;
    },
    set: function set(v) {
      this._enableLimit = v;
    }
  }, {
    key: "lowerLimit",
    get: function get() {
      return this._lowerLimit;
    },
    set: function set(v) {
      this._lowerLimit = v;
      if (this._joint) {
        this._joint.setLowerLimit(v);
      }
    }
  }, {
    key: "upperLimit",
    get: function get() {
      return this._upperLimit;
    },
    set: function set(v) {
      this._upperLimit = v;
      if (this._joint) {
        this._joint.setUpperLimit(v);
      }
    }
  }]);
}(Joint2D), _applyDecoratedDescriptor(_class2$3.prototype, "angle", [_dec2$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "angle"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "autoCalcAngle", [_dec3$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "autoCalcAngle"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "enableMotor", [_dec4$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "enableMotor"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "maxMotorForce", [_dec5$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "maxMotorForce"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "motorSpeed", [_dec6$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "motorSpeed"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "enableLimit", [_dec7$2], Object.getOwnPropertyDescriptor(_class2$3.prototype, "enableLimit"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "lowerLimit", [_dec8], Object.getOwnPropertyDescriptor(_class2$3.prototype, "lowerLimit"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "upperLimit", [_dec9], Object.getOwnPropertyDescriptor(_class2$3.prototype, "upperLimit"), _class2$3.prototype), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "_angle", [serializable], function () {
  return 0;
}), _initializer2$3 = applyDecoratedInitializer(_class2$3.prototype, "_autoCalcAngle", [serializable], function () {
  return true;
}), _initializer3$2 = applyDecoratedInitializer(_class2$3.prototype, "_enableMotor", [serializable], function () {
  return false;
}), _initializer4$2 = applyDecoratedInitializer(_class2$3.prototype, "_maxMotorForce", [serializable], function () {
  return 1000;
}), _initializer5$2 = applyDecoratedInitializer(_class2$3.prototype, "_motorSpeed", [serializable], function () {
  return 1000;
}), _initializer6$2 = applyDecoratedInitializer(_class2$3.prototype, "_enableLimit", [serializable], function () {
  return false;
}), _initializer7 = applyDecoratedInitializer(_class2$3.prototype, "_lowerLimit", [serializable], function () {
  return 0;
}), _initializer8 = applyDecoratedInitializer(_class2$3.prototype, "_upperLimit", [serializable], function () {
  return 0;
}), _class2$3)) || _class$3);

var _dec$2, _dec2$2, _dec3$2, _class$2, _class2$2, _initializer$2, _initializer2$2;
var ccclass$2 = ccclass$e;
var FixedJoint2D = (_dec$2 = ccclass$2('cc.FixedJoint2D'), _dec2$2 = type$3(CCFloat), _dec3$2 = type$3(CCFloat), _dec$2(_class$2 = (_class2$2 = function (_Joint2D) {
  function FixedJoint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Joint2D.call.apply(_Joint2D, [this].concat(args)) || this;
    _this.TYPE = EJoint2DType.FIXED;
    _this._frequency = _initializer$2 && _initializer$2();
    _this._dampingRatio = _initializer2$2 && _initializer2$2();
    return _this;
  }
  _inheritsLoose(FixedJoint2D, _Joint2D);
  return _createClass(FixedJoint2D, [{
    key: "frequency",
    get: function get() {
      return this._frequency;
    },
    set: function set(v) {
      this._frequency = v;
      if (this._joint) {
        this._joint.setFrequency(v);
      }
    }
  }, {
    key: "dampingRatio",
    get: function get() {
      return this._dampingRatio;
    },
    set: function set(v) {
      this._dampingRatio = v;
      if (this._joint) {
        this._joint.setDampingRatio(v);
      }
    }
  }]);
}(Joint2D), _applyDecoratedDescriptor(_class2$2.prototype, "frequency", [_dec2$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "frequency"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "dampingRatio", [_dec3$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "dampingRatio"), _class2$2.prototype), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_frequency", [serializable], function () {
  return 0.7;
}), _initializer2$2 = applyDecoratedInitializer(_class2$2.prototype, "_dampingRatio", [serializable], function () {
  return 0.5;
}), _class2$2)) || _class$2);

var _dec$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4$1, _initializer5$1, _initializer6$1;
var ccclass$1 = ccclass$e;
var WheelJoint2D = (_dec$1 = ccclass$1('cc.WheelJoint2D'), _dec2$1 = type$3(CCFloat), _dec3$1 = type$3(CCBoolean), _dec4$1 = type$3(CCFloat), _dec5$1 = type$3(CCFloat), _dec6$1 = type$3(CCFloat), _dec7$1 = type$3(CCFloat), _dec$1(_class$1 = (_class2$1 = function (_Joint2D) {
  function WheelJoint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Joint2D.call.apply(_Joint2D, [this].concat(args)) || this;
    _this.TYPE = EJoint2DType.WHEEL;
    _this._angle = _initializer$1 && _initializer$1();
    _this._enableMotor = _initializer2$1 && _initializer2$1();
    _this._maxMotorTorque = _initializer3$1 && _initializer3$1();
    _this._motorSpeed = _initializer4$1 && _initializer4$1();
    _this._frequency = _initializer5$1 && _initializer5$1();
    _this._dampingRatio = _initializer6$1 && _initializer6$1();
    return _this;
  }
  _inheritsLoose(WheelJoint2D, _Joint2D);
  return _createClass(WheelJoint2D, [{
    key: "angle",
    get: function get() {
      return this._angle;
    },
    set: function set(v) {
      this._angle = v;
    }
  }, {
    key: "enableMotor",
    get: function get() {
      return this._enableMotor;
    },
    set: function set(v) {
      this._enableMotor = v;
      if (this._joint) {
        this._joint.enableMotor(v);
      }
    }
  }, {
    key: "maxMotorTorque",
    get: function get() {
      return this._maxMotorTorque;
    },
    set: function set(v) {
      this._maxMotorTorque = v;
      if (this._joint) {
        this._joint.setMaxMotorTorque(v);
      }
    }
  }, {
    key: "motorSpeed",
    get: function get() {
      return this._motorSpeed;
    },
    set: function set(v) {
      this._motorSpeed = v;
      if (this._joint) {
        this._joint.setMotorSpeed(v);
      }
    }
  }, {
    key: "frequency",
    get: function get() {
      return this._frequency;
    },
    set: function set(v) {
      this._frequency = v;
      if (this._joint) {
        this._joint.setFrequency(v);
      }
    }
  }, {
    key: "dampingRatio",
    get: function get() {
      return this._dampingRatio;
    },
    set: function set(v) {
      this._dampingRatio = v;
      if (this._joint) {
        this._joint.setDampingRatio(v);
      }
    }
  }]);
}(Joint2D), _applyDecoratedDescriptor(_class2$1.prototype, "angle", [_dec2$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "angle"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "enableMotor", [_dec3$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "enableMotor"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "maxMotorTorque", [_dec4$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "maxMotorTorque"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "motorSpeed", [_dec5$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "motorSpeed"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "frequency", [_dec6$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "frequency"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "dampingRatio", [_dec7$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "dampingRatio"), _class2$1.prototype), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_angle", [serializable], function () {
  return 90;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_enableMotor", [serializable], function () {
  return false;
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "_maxMotorTorque", [serializable], function () {
  return 1000;
}), _initializer4$1 = applyDecoratedInitializer(_class2$1.prototype, "_motorSpeed", [serializable], function () {
  return 0;
}), _initializer5$1 = applyDecoratedInitializer(_class2$1.prototype, "_frequency", [serializable], function () {
  return 5;
}), _initializer6$1 = applyDecoratedInitializer(_class2$1.prototype, "_dampingRatio", [serializable], function () {
  return 0.7;
}), _class2$1)) || _class$1);

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6;
var ccclass = ccclass$e;
var HingeJoint2D = (_dec = ccclass('cc.HingeJoint2D'), _dec2 = type$3(CCBoolean), _dec3 = type$3(CCFloat), _dec4 = type$3(CCFloat), _dec5 = type$3(CCBoolean), _dec6 = type$3(CCFloat), _dec7 = type$3(CCFloat), _dec(_class = (_class2 = function (_Joint2D) {
  function HingeJoint2D() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Joint2D.call.apply(_Joint2D, [this].concat(args)) || this;
    _this.TYPE = EJoint2DType.HINGE;
    _this._enableLimit = _initializer && _initializer();
    _this._lowerAngle = _initializer2 && _initializer2();
    _this._upperAngle = _initializer3 && _initializer3();
    _this._enableMotor = _initializer4 && _initializer4();
    _this._maxMotorTorque = _initializer5 && _initializer5();
    _this._motorSpeed = _initializer6 && _initializer6();
    return _this;
  }
  _inheritsLoose(HingeJoint2D, _Joint2D);
  return _createClass(HingeJoint2D, [{
    key: "enableLimit",
    get: function get() {
      return this._enableLimit;
    },
    set: function set(v) {
      this._enableLimit = v;
    }
  }, {
    key: "lowerAngle",
    get: function get() {
      return this._lowerAngle;
    },
    set: function set(v) {
      this._lowerAngle = v;
      if (this._joint) {
        this._joint.setLowerAngle(v);
      }
    }
  }, {
    key: "upperAngle",
    get: function get() {
      return this._upperAngle;
    },
    set: function set(v) {
      this._upperAngle = v;
      if (this._joint) {
        this._joint.setUpperAngle(v);
      }
    }
  }, {
    key: "enableMotor",
    get: function get() {
      return this._enableMotor;
    },
    set: function set(v) {
      this._enableMotor = v;
      if (this._joint) {
        this._joint.enableMotor(v);
      }
    }
  }, {
    key: "maxMotorTorque",
    get: function get() {
      return this._maxMotorTorque;
    },
    set: function set(v) {
      this._maxMotorTorque = v;
      if (this._joint) {
        this._joint.setMaxMotorTorque(v);
      }
    }
  }, {
    key: "motorSpeed",
    get: function get() {
      return this._motorSpeed;
    },
    set: function set(v) {
      this._motorSpeed = v;
      if (this._joint) {
        this._joint.setMotorSpeed(v);
      }
    }
  }]);
}(Joint2D), _applyDecoratedDescriptor(_class2.prototype, "enableLimit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "enableLimit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "lowerAngle", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "lowerAngle"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "upperAngle", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "upperAngle"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "enableMotor", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "enableMotor"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "maxMotorTorque", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "maxMotorTorque"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "motorSpeed", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "motorSpeed"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_enableLimit", [serializable], function () {
  return false;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_lowerAngle", [serializable], function () {
  return 0;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_upperAngle", [serializable], function () {
  return 0;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_enableMotor", [serializable], function () {
  return false;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_maxMotorTorque", [serializable], function () {
  return 1000;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_motorSpeed", [serializable], function () {
  return 0;
}), _class2)) || _class);

var Physics2DUtils = {
  PolygonSeparator: PolygonSeparator,
  PolygonPartition: PolygonPartition
};
cclegacy.internal.physics2d = {
  selector: selector
};

export { BoxCollider2D as B, Contact2DType as C, DistanceJoint2D as D, EPhysics2DDrawFlags as E, FixedJoint2D as F, HingeJoint2D as H, Joint2D as J, MouseJoint2D as M, PhysicsSystem2D as P, RigidBody2D as R, SpringJoint2D as S, WheelJoint2D as W, ERaycast2DType as a, PHYSICS_2D_PTM_RATIO as b, ERigidBody2DType as c, Collider2D as d, ConvexPartition as e, Physics2DUtils as f, ECollider2DType as g, EJoint2DType as h, PhysicsGroup2D as i, PhysicsGroup as j, Physics2DManifoldType as k, CircleCollider2D as l, PolygonCollider2D as m, RelativeJoint2D as n, SliderJoint2D as o, selector as s };
//# sourceMappingURL=physics-2d-framework-CrYpdP1-.js.map
