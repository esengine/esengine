import './_virtual_internal_constants-DWlew7Dp.js';
import { a as ERaycast2DType, b as PHYSICS_2D_PTM_RATIO, P as PhysicsSystem2D, c as ERigidBody2DType, C as Contact2DType, d as Collider2D, R as RigidBody2D, e as ConvexPartition, s as selector } from './physics-2d-framework-CrYpdP1-.js';
import { L as log, Q as error, d as CCObjectFlags, k as errorID, au as remove, a as _createClass, e as warn, _ as _inheritsLoose } from './gc-object-CShF5lzx.js';
import { e as ensureWasmModuleReady, i as instantiateWasm } from './wasm-web-BpK36a26.js';
import { g as game, G as Game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import { n as sys, V as Vec2, C as Color, f as Vec3, Y as toDegree, Q as Quat, a9 as TWO_PI, a8 as HALF_PI, h as toRadian, m as Rect } from './index-uXI1_UMk.js';
import { C as Canvas } from './sprite-renderer-C7_6H1N4.js';
import './ui-renderer-JpGcj-VM.js';
import { f as find } from './prefab-DYg_oxpo.js';
import { N as Node } from './scene-vWcxM1_c.js';
import { L as Layers } from './pipeline-state-manager-C5U4ouGL.js';
import { N as NodeEventType } from './node-event-Ccvtv8bJ.js';
import { P as PhysicsGroup } from './collision-matrix-55yq71jP.js';
import './global-exports-DnCP_14L.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './debug-view-BuNhRPv_.js';
import './deprecated-n0w4kK7g.js';
import './camera-component-BFt9vSC_.js';
import './sprite-frame-DHXMUUT-.js';
import './create-mesh-CfKC5EQd.js';
import './mesh-XWfHgs1t.js';
import './zlib.min-3VC1ush6.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './sorting-layers-BHqhkSbY.js';
import './touch-BKrZ-fxl.js';

var B2 = {};
function getImplPtr(wasmObject) {
  if (!wasmObject) return 0;
  return wasmObject.$$.ptr;
}
var B2ObjectType = {
  Fixture: 0,
  Body: 1,
  Contact: 2,
  Joint: 3
};
var WASM_OBJECT_PTR_2_TS_OBJECT = new Map();
function addImplPtrReference(Type, TSObject, implPtr) {
  if (implPtr) {
    var map = WASM_OBJECT_PTR_2_TS_OBJECT.get(Type);
    if (!map) {
      map = new Map();
      WASM_OBJECT_PTR_2_TS_OBJECT.set(Type, map);
    }
    map.set(implPtr, TSObject);
  }
}
function removeImplPtrReference(Type, implPtr) {
  if (implPtr) {
    var map = WASM_OBJECT_PTR_2_TS_OBJECT.get(Type);
    if (map && map.has(implPtr)) {
      map["delete"](implPtr);
      if (map.size === 0) {
        WASM_OBJECT_PTR_2_TS_OBJECT["delete"](Type);
      }
    }
  }
}
function getTSObjectFromWASMObjectPtr(Type, implPtr) {
  var map = WASM_OBJECT_PTR_2_TS_OBJECT.get(Type);
  return map == null ? void 0 : map.get(implPtr);
}
var WASM_OBJECT_PTR_2_WASM_OBJECT = new Map();
function addImplPtrReferenceWASM(Type, WASMObject, implPtr) {
  if (implPtr) {
    var map = WASM_OBJECT_PTR_2_WASM_OBJECT.get(Type);
    if (!map) {
      map = new Map();
      WASM_OBJECT_PTR_2_WASM_OBJECT.set(Type, map);
    }
    map.set(implPtr, WASMObject);
  }
}
function removeImplPtrReferenceWASM(Type, implPtr) {
  if (implPtr) {
    var map = WASM_OBJECT_PTR_2_WASM_OBJECT.get(Type);
    if (map && map.has(implPtr)) {
      map["delete"](implPtr);
      if (map.size === 0) {
        WASM_OBJECT_PTR_2_WASM_OBJECT["delete"](Type);
      }
    }
  }
}
function b2Mul(T, v, out) {
  out.x = T.q.c * v.x - T.q.s * v.y + T.p.x;
  out.y = T.q.s * v.x + T.q.c * v.y + T.p.y;
}
function initWasm(wasmFactory, wasmUrl) {
  return new Promise(function (resolve, reject) {
    var errorMessage = function errorMessage(err) {
      return "[box2d]: box2d wasm lib load failed: " + err;
    };
    wasmFactory({
      instantiateWasm: function instantiateWasm$1(importObject, receiveInstance) {
        instantiateWasm(wasmUrl, importObject).then(function (result) {
          receiveInstance(result.instance, result.module);
        })["catch"](function (err) {
          return reject(errorMessage(err));
        });
      }
    }).then(function (Instance) {
      log('[box2d]:box2d wasm lib loaded.');
      B2 = Instance;
    }).then(resolve)["catch"](function (err) {
      return reject(errorMessage(err));
    });
  });
}
function initAsm(asmFactory) {
  return new Promise(function (resolve, reject) {
    var errorMessage = function errorMessage(err) {
      return "[box2d]: box2d asm lib load failed: " + err;
    };
    asmFactory().then(function (instance) {
      log('[box2d]:box2d asm lib loaded.');
      B2 = instance;
    }).then(resolve)["catch"](function (err) {
      return reject(errorMessage(err));
    });
  });
}
function shouldUseWasmModule() {
  {
    return sys.hasFeature(sys.Feature.WASM);
  }
}
function waitForBox2dWasmInstantiation() {
  var errorReport = function errorReport(msg) {
    error(msg);
  };
  return ensureWasmModuleReady().then(function () {
    if (shouldUseWasmModule()) {
      return Promise.all([import('./box2d.release.wasm-jHh2OA5_.js').then(function (n) { return n.b; }), import('./box2d.release.wasm-C-25OXZw.js')]).then(function (_ref) {
        var wasmFactory = _ref[0]["default"],
          wasmUrl = _ref[1]["default"];
        return initWasm(wasmFactory, wasmUrl);
      });
    } else {
      return import('./box2d.release.asm-ClMk6q4A.js').then(function (n) { return n.b; }).then(function (_ref2) {
        var asmFactory = _ref2["default"];
        return initAsm(asmFactory);
      });
    }
  })["catch"](errorReport);
}
{
  game.onPostInfrastructureInitDelegate.add(waitForBox2dWasmInstantiation);
}

var _PhysicsContactListener;
var PhysicsContactListener = function () {
  function PhysicsContactListener() {}
  PhysicsContactListener.BeginContact = function BeginContact(contact) {
    if (this._BeginContact) {
      this._BeginContact(contact);
    }
  };
  PhysicsContactListener.EndContact = function EndContact(contact) {
    if (this._EndContact) {
      this._EndContact(contact);
    }
  };
  PhysicsContactListener.PreSolve = function PreSolve(contact, oldManifold) {
    if (this._PreSolve) {
      this._PreSolve(contact, oldManifold);
    }
  };
  PhysicsContactListener.PostSolve = function PostSolve(contact, impulse) {
    if (this._PostSolve) {
      this._PostSolve(contact, impulse);
    }
  };
  return PhysicsContactListener;
}();
_PhysicsContactListener = PhysicsContactListener;
PhysicsContactListener._BeginContact = null;
PhysicsContactListener._EndContact = null;
PhysicsContactListener._PreSolve = null;
PhysicsContactListener._PostSolve = null;
PhysicsContactListener.callback = {
  BeginContact: function BeginContact(contact) {
    _PhysicsContactListener.BeginContact(contact);
  },
  EndContact: function EndContact(contact) {
    _PhysicsContactListener.EndContact(contact);
  },
  PreSolve: function PreSolve(contact, oldManifold) {
    _PhysicsContactListener.PreSolve(contact, oldManifold);
  },
  PostSolve: function PostSolve(contact, impulse) {
    _PhysicsContactListener.PostSolve(contact, impulse);
  }
};

var _PhysicsAABBQueryCallback;
var PhysicsAABBQueryCallback = function () {
  function PhysicsAABBQueryCallback() {}
  PhysicsAABBQueryCallback.init = function init(point) {
    if (point) {
      this._isPoint = true;
      this._point.x = point.x;
      this._point.y = point.y;
    } else {
      this._isPoint = false;
    }
    this._fixtures.length = 0;
  };
  PhysicsAABBQueryCallback.ReportFixture = function ReportFixture(fixture) {
    if (this._isPoint) {
      if (B2.FixtureTestPoint(fixture, this._point)) {
        this._fixtures.push(fixture);
      }
    } else {
      this._fixtures.push(fixture);
    }
    return true;
  };
  PhysicsAABBQueryCallback.getFixture = function getFixture() {
    return this._fixtures[0];
  };
  PhysicsAABBQueryCallback.getFixtures = function getFixtures() {
    return this._fixtures;
  };
  return PhysicsAABBQueryCallback;
}();
_PhysicsAABBQueryCallback = PhysicsAABBQueryCallback;
PhysicsAABBQueryCallback._point = {
  x: 0,
  y: 0
};
PhysicsAABBQueryCallback._isPoint = false;
PhysicsAABBQueryCallback._fixtures = [];
PhysicsAABBQueryCallback.callback = {
  ReportFixture: function ReportFixture(fixture) {
    return _PhysicsAABBQueryCallback.ReportFixture(fixture);
  }
};

var _PhysicsRayCastCallback;
var PhysicsRayCastCallback = function () {
  function PhysicsRayCastCallback() {}
  PhysicsRayCastCallback.init = function init(type, mask) {
    PhysicsRayCastCallback._type = type;
    PhysicsRayCastCallback._mask = mask;
    PhysicsRayCastCallback._fixtures.length = 0;
    PhysicsRayCastCallback._points.length = 0;
    PhysicsRayCastCallback._normals.length = 0;
    PhysicsRayCastCallback._fractions.length = 0;
  };
  PhysicsRayCastCallback.ReportFixture = function ReportFixture(fixture, point, normal, fraction) {
    if ((B2.FixtureGetFilterData(fixture).categoryBits & PhysicsRayCastCallback._mask) === 0) {
      return -1;
    }
    if (PhysicsRayCastCallback._type === ERaycast2DType.Closest) {
      PhysicsRayCastCallback._fixtures[0] = fixture;
      PhysicsRayCastCallback._points[0] = point;
      PhysicsRayCastCallback._normals[0] = normal;
      PhysicsRayCastCallback._fractions[0] = fraction;
      return fraction;
    }
    PhysicsRayCastCallback._fixtures.push(fixture);
    PhysicsRayCastCallback._points.push(new Vec2(point.x, point.y));
    PhysicsRayCastCallback._normals.push(new Vec2(normal.x, normal.y));
    PhysicsRayCastCallback._fractions.push(fraction);
    if (PhysicsRayCastCallback._type === ERaycast2DType.Any) {
      return 0;
    } else if (PhysicsRayCastCallback._type >= ERaycast2DType.All) {
      return 1;
    }
    return fraction;
  };
  PhysicsRayCastCallback.getFixtures = function getFixtures() {
    return PhysicsRayCastCallback._fixtures;
  };
  PhysicsRayCastCallback.getPoints = function getPoints() {
    return PhysicsRayCastCallback._points;
  };
  PhysicsRayCastCallback.getNormals = function getNormals() {
    return PhysicsRayCastCallback._normals;
  };
  PhysicsRayCastCallback.getFractions = function getFractions() {
    return PhysicsRayCastCallback._fractions;
  };
  return PhysicsRayCastCallback;
}();
_PhysicsRayCastCallback = PhysicsRayCastCallback;
PhysicsRayCastCallback._type = ERaycast2DType.Closest;
PhysicsRayCastCallback._fixtures = [];
PhysicsRayCastCallback._points = [];
PhysicsRayCastCallback._normals = [];
PhysicsRayCastCallback._fractions = [];
PhysicsRayCastCallback._mask = 0xffffffff;
PhysicsRayCastCallback.callback = {
  ReportFixture: function ReportFixture(fixture, point, normal, fraction) {
    return _PhysicsRayCastCallback.ReportFixture(fixture, point, normal, fraction);
  }
};

var pools = [];
var pointCache = [new Vec2(), new Vec2()];
var worldmanifold = {
  points: [],
  separations: [],
  normal: new Vec2()
};
var ManifoldPoint = function ManifoldPoint() {
  this.localPoint = new Vec2();
  this.normalImpulse = 0;
  this.tangentImpulse = 0;
};
var manifoldPointCache = [new ManifoldPoint(), new ManifoldPoint()];
var manifold = {
  type: 0,
  localPoint: new Vec2(),
  localNormal: new Vec2(),
  points: []
};
var impulse = {
  normalImpulses: [],
  tangentImpulses: []
};
var PhysicsContact = function () {
  function PhysicsContact() {
    this.colliderA = null;
    this.colliderB = null;
    this.disabled = false;
    this.disabledOnce = false;
    this._impulsePtr = 0;
    this._inverted = false;
    this._implPtr = 0;
    this._b2WorldmanifoldPtr = 0;
  }
  PhysicsContact.get = function get(b2contact) {
    var c = pools.pop();
    if (!c) {
      c = new PhysicsContact();
    }
    c.init(b2contact);
    return c;
  };
  PhysicsContact.put = function put(b2contact) {
    var c = getTSObjectFromWASMObjectPtr(B2ObjectType.Contact, b2contact);
    if (!c) return;
    pools.push(c);
    c.reset();
  };
  var _proto = PhysicsContact.prototype;
  _proto._setImpulse = function _setImpulse(impulse) {
    this._impulsePtr = impulse;
  };
  _proto.init = function init(b2contact) {
    var ab = B2.ContactGetFixture(b2contact);
    this.colliderA = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, ab.x).collider;
    this.colliderB = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, ab.y).collider;
    this.disabled = false;
    this.disabledOnce = false;
    this._impulsePtr = 0;
    this._inverted = false;
    this._implPtr = b2contact;
    addImplPtrReference(B2ObjectType.Contact, this, this._implPtr);
    this._b2WorldmanifoldPtr = B2.WorldManifoldNew();
  };
  _proto.reset = function reset() {
    this.setTangentSpeed(0);
    this.resetFriction();
    this.resetRestitution();
    this.colliderA = null;
    this.colliderB = null;
    this.disabled = false;
    this._impulsePtr = 0;
    removeImplPtrReference(B2ObjectType.Contact, this._implPtr);
    this._implPtr = 0;
    B2.WorldManifoldDelete(this._b2WorldmanifoldPtr);
    this._b2WorldmanifoldPtr = 0;
  };
  _proto.getWorldManifold = function getWorldManifold() {
    var points = worldmanifold.points;
    var separations = worldmanifold.separations;
    var normal = worldmanifold.normal;
    B2.ContactGetWorldManifold(this._implPtr, this._b2WorldmanifoldPtr);
    var b2Manifold = B2.ContactGetManifold(this._implPtr);
    var count = B2.ManifoldGetPointCount(b2Manifold);
    points.length = separations.length = count;
    for (var i = 0; i < count; i++) {
      var p = pointCache[i];
      p.x = B2.WorldManifoldGetPointValueX(this._b2WorldmanifoldPtr, i) * PHYSICS_2D_PTM_RATIO;
      p.y = B2.WorldManifoldGetPointValueY(this._b2WorldmanifoldPtr, i) * PHYSICS_2D_PTM_RATIO;
      points[i] = p;
      separations[i] = B2.WorldManifoldGetSeparationValue(this._b2WorldmanifoldPtr, i) * PHYSICS_2D_PTM_RATIO;
    }
    normal.x = B2.WorldManifoldGetNormalValueX(this._b2WorldmanifoldPtr);
    normal.y = B2.WorldManifoldGetNormalValueY(this._b2WorldmanifoldPtr);
    if (this._inverted) {
      normal.x *= -1;
      normal.y *= -1;
    }
    return worldmanifold;
  };
  _proto.getManifold = function getManifold() {
    var points = manifold.points;
    var localNormal = manifold.localNormal;
    var localPoint = manifold.localPoint;
    var b2Manifold = B2.ContactGetManifold(this._implPtr);
    var count = points.length = B2.ManifoldGetPointCount(b2Manifold);
    for (var i = 0; i < count; i++) {
      var p = manifoldPointCache[i];
      var b2p = B2.ManifoldGetManifoldPointPtr(b2Manifold, i);
      p.localPoint.x = B2.ManifoldPointGetLocalPointX(b2p) * PHYSICS_2D_PTM_RATIO;
      p.localPoint.y = B2.ManifoldPointGetLocalPointY(b2p) * PHYSICS_2D_PTM_RATIO;
      p.normalImpulse = B2.ManifoldPointGetNormalImpulse(b2p) * PHYSICS_2D_PTM_RATIO;
      p.tangentImpulse = B2.ManifoldPointGetTangentImpulse(b2p);
      points[i] = p;
    }
    localPoint.x = B2.ManifoldGetLocalPointValueX(b2Manifold) * PHYSICS_2D_PTM_RATIO;
    localPoint.y = B2.ManifoldGetLocalPointValueY(b2Manifold) * PHYSICS_2D_PTM_RATIO;
    localNormal.x = B2.ManifoldGetLocalNormalValueX(b2Manifold);
    localNormal.y = B2.ManifoldGetLocalNormalValueY(b2Manifold);
    manifold.type = B2.ManifoldGetType(b2Manifold);
    if (this._inverted) {
      localNormal.x *= -1;
      localNormal.y *= -1;
    }
    return manifold;
  };
  _proto.getImpulse = function getImpulse() {
    var b2impulse = this._impulsePtr;
    if (!b2impulse) return null;
    var normalImpulses = impulse.normalImpulses;
    var tangentImpulses = impulse.tangentImpulses;
    var count = B2.ContactImpulseGetCount(b2impulse);
    for (var i = 0; i < count; i++) {
      normalImpulses[i] = B2.ContactImpulseGetNormalImpulse(b2impulse, i) * PHYSICS_2D_PTM_RATIO;
      tangentImpulses[i] = B2.ContactImpulseGetTangentImpulse(b2impulse, i);
    }
    tangentImpulses.length = normalImpulses.length = count;
    return impulse;
  };
  _proto.emit = function emit(contactType) {
    var _colliderA$body, _colliderB$body;
    var colliderA = this.colliderA;
    var colliderB = this.colliderB;
    var hasListenerA = colliderA == null ? void 0 : (_colliderA$body = colliderA.body) == null ? void 0 : _colliderA$body.enabledContactListener;
    var hasListenerB = colliderB == null ? void 0 : (_colliderB$body = colliderB.body) == null ? void 0 : _colliderB$body.enabledContactListener;
    if (hasListenerA) {
      colliderA.emit(contactType, colliderA, colliderB, this);
    }
    if (hasListenerB) {
      colliderB.emit(contactType, colliderB, colliderA, this);
    }
    if (hasListenerA || hasListenerB) {
      PhysicsSystem2D.instance.emit(contactType, colliderA, colliderB, this);
    }
    if (this.disabled || this.disabledOnce) {
      this.setEnabled(false);
      this.disabledOnce = false;
    }
  };
  _proto.setEnabled = function setEnabled(value) {
    B2.ContactSetEnabled(this._implPtr, value);
  };
  _proto.isTouching = function isTouching() {
    return B2.ContactIsTouching(this._implPtr);
  };
  _proto.setTangentSpeed = function setTangentSpeed(value) {
    B2.ContactSetTangentSpeed(this._implPtr, value);
  };
  _proto.getTangentSpeed = function getTangentSpeed() {
    return B2.ContactGetTangentSpeed(this._implPtr);
  };
  _proto.setFriction = function setFriction(value) {
    B2.ContactSetFriction(this._implPtr, value);
  };
  _proto.getFriction = function getFriction() {
    return B2.ContactGetFriction(this._implPtr);
  };
  _proto.resetFriction = function resetFriction() {
    B2.ContactResetFriction(this._implPtr);
  };
  _proto.setRestitution = function setRestitution(value) {
    B2.ContactSetRestitution(this._implPtr, value);
  };
  _proto.getRestitution = function getRestitution() {
    return B2.ContactGetRestitution(this._implPtr);
  };
  _proto.resetRestitution = function resetRestitution() {
    B2.ContactResetRestitution(this._implPtr);
  };
  return PhysicsContact;
}();

var _PhysicsDebugDraw;
var _tmp_vec2 = {
  x: 0,
  y: 0
};
var _tmp_vec3 = {
  x: 0,
  y: 0
};
var _tmp_color = new Color();
var GREEN_COLOR = Color.GREEN;
var RED_COLOR = Color.RED;
var PhysicsDebugDraw = function () {
  function PhysicsDebugDraw() {}
  PhysicsDebugDraw._DrawPolygon = function _DrawPolygon(vertices, vertexCount) {
    var drawer = PhysicsDebugDraw._drawer;
    var rawVertexBuffer = B2.HEAPF32.subarray(vertices / 4, vertices / 4 + vertexCount * 2);
    for (var i = 0; i < vertexCount; i++) {
      _tmp_vec2.x = rawVertexBuffer[i * 2 + 0];
      _tmp_vec2.y = rawVertexBuffer[i * 2 + 1];
      b2Mul(PhysicsDebugDraw._xf, _tmp_vec2, _tmp_vec3);
      var x = _tmp_vec3.x * PHYSICS_2D_PTM_RATIO;
      var y = _tmp_vec3.y * PHYSICS_2D_PTM_RATIO;
      if (i === 0) drawer.moveTo(x, y);else {
        drawer.lineTo(x, y);
      }
    }
    drawer.close();
  };
  PhysicsDebugDraw.DrawPolygon = function DrawPolygon(vertices, vertexCount, color) {
    PhysicsDebugDraw._applyStrokeColor(color);
    PhysicsDebugDraw._DrawPolygon(vertices, vertexCount);
    PhysicsDebugDraw._drawer.stroke();
  };
  PhysicsDebugDraw.DrawSolidPolygon = function DrawSolidPolygon(vertices, vertexCount, color) {
    PhysicsDebugDraw._applyFillColor(color);
    PhysicsDebugDraw._DrawPolygon(vertices, vertexCount);
    PhysicsDebugDraw._drawer.fill();
    PhysicsDebugDraw._drawer.stroke();
  };
  PhysicsDebugDraw._DrawCircle = function _DrawCircle(center, radius) {
    b2Mul(PhysicsDebugDraw._xf, center, _tmp_vec3);
    PhysicsDebugDraw._drawer.circle(_tmp_vec3.x * PHYSICS_2D_PTM_RATIO, _tmp_vec3.y * PHYSICS_2D_PTM_RATIO, radius * PHYSICS_2D_PTM_RATIO);
  };
  PhysicsDebugDraw.DrawCircle = function DrawCircle(center, radius, color) {
    PhysicsDebugDraw._applyStrokeColor(color);
    PhysicsDebugDraw._DrawCircle(center, radius);
    PhysicsDebugDraw._drawer.stroke();
  };
  PhysicsDebugDraw.DrawSolidCircle = function DrawSolidCircle(center, radius, axis, color) {
    PhysicsDebugDraw._applyFillColor(color);
    PhysicsDebugDraw._DrawCircle(center, radius);
    PhysicsDebugDraw._drawer.fill();
  };
  PhysicsDebugDraw.DrawSegment = function DrawSegment(p1, p2, color) {
    var drawer = PhysicsDebugDraw._drawer;
    if (p1.x === p2.x && p1.y === p2.y) {
      PhysicsDebugDraw._applyFillColor(color);
      PhysicsDebugDraw._DrawCircle(p1, 2 / PHYSICS_2D_PTM_RATIO);
      drawer.fill();
      return;
    }
    PhysicsDebugDraw._applyStrokeColor(color);
    b2Mul(PhysicsDebugDraw._xf, p1, _tmp_vec2);
    drawer.moveTo(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO);
    b2Mul(PhysicsDebugDraw._xf, p2, _tmp_vec2);
    drawer.lineTo(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO);
    drawer.stroke();
  };
  PhysicsDebugDraw.DrawTransform = function DrawTransform(xf) {
    var drawer = PhysicsDebugDraw._drawer;
    drawer.strokeColor = RED_COLOR;
    _tmp_vec2.x = _tmp_vec2.y = 0;
    b2Mul(xf, _tmp_vec2, _tmp_vec3);
    drawer.moveTo(_tmp_vec3.x * PHYSICS_2D_PTM_RATIO, _tmp_vec3.y * PHYSICS_2D_PTM_RATIO);
    _tmp_vec2.x = 1;
    _tmp_vec2.y = 0;
    b2Mul(xf, _tmp_vec2, _tmp_vec3);
    drawer.lineTo(_tmp_vec3.x * PHYSICS_2D_PTM_RATIO, _tmp_vec3.y * PHYSICS_2D_PTM_RATIO);
    drawer.stroke();
    drawer.strokeColor = GREEN_COLOR;
    _tmp_vec2.x = _tmp_vec2.y = 0;
    b2Mul(xf, _tmp_vec2, _tmp_vec3);
    drawer.moveTo(_tmp_vec3.x * PHYSICS_2D_PTM_RATIO, _tmp_vec3.y * PHYSICS_2D_PTM_RATIO);
    _tmp_vec2.x = 0;
    _tmp_vec2.y = 1;
    b2Mul(xf, _tmp_vec2, _tmp_vec3);
    drawer.lineTo(_tmp_vec3.x * PHYSICS_2D_PTM_RATIO, _tmp_vec3.y * PHYSICS_2D_PTM_RATIO);
    drawer.stroke();
  };
  PhysicsDebugDraw.DrawPoint = function DrawPoint(center, size, color) {};
  PhysicsDebugDraw.DrawParticles = function DrawParticles() {};
  PhysicsDebugDraw._applyStrokeColor = function _applyStrokeColor(color) {
    PhysicsDebugDraw._drawer.strokeColor = _tmp_color.set(color.r * 255, color.g * 255, color.b * 255, 150);
  };
  PhysicsDebugDraw._applyFillColor = function _applyFillColor(color) {
    PhysicsDebugDraw._drawer.fillColor = _tmp_color.set(color.r * 255, color.g * 255, color.b * 255, 150);
  };
  var _proto = PhysicsDebugDraw.prototype;
  _proto.PushTransform = function PushTransform(xf) {
    PhysicsDebugDraw._xf = xf;
  };
  _proto.PopTransform = function PopTransform() {
    PhysicsDebugDraw._xf = PhysicsDebugDraw._dxf;
  };
  return PhysicsDebugDraw;
}();
_PhysicsDebugDraw = PhysicsDebugDraw;
PhysicsDebugDraw.callback = {
  DrawPolygon: function DrawPolygon(vertices, vertexCount, color) {
    _PhysicsDebugDraw.DrawPolygon(vertices, vertexCount, color);
  },
  DrawSolidPolygon: function DrawSolidPolygon(vertices, vertexCount, color) {
    _PhysicsDebugDraw.DrawSolidPolygon(vertices, vertexCount, color);
  },
  DrawCircle: function DrawCircle(center, radius, color) {
    _PhysicsDebugDraw.DrawCircle(center, radius, color);
  },
  DrawSolidCircle: function DrawSolidCircle(center, radius, axis, color) {
    _PhysicsDebugDraw.DrawSolidCircle(center, radius, axis, color);
  },
  DrawSegment: function DrawSegment(p1, p2, color) {
    _PhysicsDebugDraw.DrawSegment(p1, p2, color);
  },
  DrawTransform: function DrawTransform(xf) {
    _PhysicsDebugDraw.DrawTransform(xf);
  },
  DrawPoint: function DrawPoint(center, size, color) {
    _PhysicsDebugDraw.DrawPoint(center, size, color);
  }
};
PhysicsDebugDraw._drawer = null;
PhysicsDebugDraw._xf = {
  p: {
    x: 0,
    y: 0
  },
  q: {
    s: 0,
    c: 1
  }
};
PhysicsDebugDraw._dxf = {
  p: {
    x: 0,
    y: 0
  },
  q: {
    s: 0,
    c: 1
  }
};

var tempVec3$1 = new Vec3();
var tempVec2_1$1 = new Vec2();
var tempVec2_2$1 = new Vec2();
var testResults = [];
var B2PhysicsWorld = function () {
  function B2PhysicsWorld() {
    this._world = void 0;
    this._bodies = [];
    this._animatedBodies = [];
    this._rotationAxis = new Vec3();
    this._physicsGroundBody = void 0;
    this._contactListener = void 0;
    this._aabbQueryCallback = void 0;
    this._raycastQueryCallback = void 0;
    this._temoBodyDef = void 0;
    this._tempB2AABB = void 0;
    this.tempB2FixtureDefPtr = void 0;
    this._debugGraphics = null;
    this._b2DebugDrawer = null;
    this._debugDrawFlags = 0;
    this._world = new B2.World({
      x: 0,
      y: -10
    });
    this._physicsGroundBody = this._world.CreateBody(new B2.BodyDef());
    PhysicsContactListener._BeginContact = this._onBeginContact;
    PhysicsContactListener._EndContact = this._onEndContact;
    PhysicsContactListener._PreSolve = this._onPreSolve;
    PhysicsContactListener._PostSolve = this._onPostSolve;
    this._contactListener = B2.ContactListener.implement(PhysicsContactListener.callback);
    this._world.SetContactListener(this._contactListener);
    this._aabbQueryCallback = B2.QueryCallback.implement(PhysicsAABBQueryCallback.callback);
    this._raycastQueryCallback = B2.RayCastCallback.implement(PhysicsRayCastCallback.callback);
    this._temoBodyDef = new B2.BodyDef();
    this._tempB2AABB = new B2.AABB();
    this.tempB2FixtureDefPtr = B2.FixtureDefNew();
  }
  var _proto = B2PhysicsWorld.prototype;
  _proto._checkDebugDrawValid = function _checkDebugDrawValid() {
    if (!this._debugGraphics || !this._debugGraphics.isValid) {
      var canvas = find('Canvas');
      if (!canvas) {
        var scene = director.getScene();
        if (!scene) {
          return;
        }
        canvas = new Node('Canvas');
        canvas.addComponent(Canvas);
        canvas.parent = scene;
      }
      var node = new Node('PHYSICS_2D_DEBUG_DRAW');
      node.hideFlags |= CCObjectFlags.DontSave;
      node.parent = canvas;
      node.worldPosition = Vec3.ZERO;
      node.layer = Layers.Enum.UI_2D;
      try {
        this._debugGraphics = node.addComponent('cc.Graphics');
        this._debugGraphics.lineWidth = 3;
        PhysicsDebugDraw._drawer = this._debugGraphics;
        var debugDraw = B2.Draw.implement(PhysicsDebugDraw.callback);
        this._b2DebugDrawer = debugDraw;
        this._world.SetDebugDraw(debugDraw);
      } catch (e) {
        errorID(4501, e.message);
        node.destroy();
        node = null;
      }
    }
    if (this._debugGraphics) {
      var parent = this._debugGraphics.node.parent;
      this._debugGraphics.node.setSiblingIndex(parent.children.length - 1);
    }
    if (this._b2DebugDrawer) {
      this._b2DebugDrawer.SetFlags(this.debugDrawFlags);
    }
  };
  _proto.setGravity = function setGravity(v) {
    this._world.SetGravity(v);
  };
  _proto.setAllowSleep = function setAllowSleep(v) {
    this._world.SetAllowSleeping(true);
  };
  _proto.step = function step(deltaTime, velocityIterations, positionIterations) {
    if (velocityIterations === void 0) {
      velocityIterations = 10;
    }
    if (positionIterations === void 0) {
      positionIterations = 10;
    }
    var animatedBodies = this._animatedBodies;
    for (var i = 0, l = animatedBodies.length; i < l; i++) {
      animatedBodies[i].animate(deltaTime);
    }
    this._world.Step(deltaTime, velocityIterations, positionIterations);
  };
  _proto.raycast = function raycast(p1, p2, type, mask) {
    if (p1.equals(p2)) {
      return [];
    }
    type = type || ERaycast2DType.Closest;
    tempVec2_1$1.x = p1.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_1$1.y = p1.y / PHYSICS_2D_PTM_RATIO;
    tempVec2_2$1.x = p2.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_2$1.y = p2.y / PHYSICS_2D_PTM_RATIO;
    PhysicsRayCastCallback.init(type, mask);
    this._world.RayCast(this._raycastQueryCallback, tempVec2_1$1, tempVec2_2$1);
    var fixtures = PhysicsRayCastCallback.getFixtures();
    if (fixtures.length > 0) {
      var points = PhysicsRayCastCallback.getPoints();
      var normals = PhysicsRayCastCallback.getNormals();
      var fractions = PhysicsRayCastCallback.getFractions();
      var results = [];
      for (var i = 0, l = fixtures.length; i < l; i++) {
        var fixture = fixtures[i];
        var shape = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, fixture);
        var collider = shape.collider;
        if (type === ERaycast2DType.AllClosest) {
          var result = void 0;
          for (var j = 0; j < results.length; j++) {
            if (results[j].collider === collider) {
              result = results[j];
            }
          }
          if (result) {
            if (fractions[i] < result.fraction) {
              result.fixtureIndex = shape.getFixtureIndex(fixture);
              result.point.x = points[i].x * PHYSICS_2D_PTM_RATIO;
              result.point.y = points[i].y * PHYSICS_2D_PTM_RATIO;
              result.normal.x = normals[i].x;
              result.normal.y = normals[i].y;
              result.fraction = fractions[i];
            }
            continue;
          }
        }
        results.push({
          collider: collider,
          fixtureIndex: shape.getFixtureIndex(fixture),
          point: new Vec2(points[i].x * PHYSICS_2D_PTM_RATIO, points[i].y * PHYSICS_2D_PTM_RATIO),
          normal: new Vec2(normals[i].x, normals[i].y),
          fraction: fractions[i]
        });
      }
      return results;
    }
    return [];
  };
  _proto.syncPhysicsToScene = function syncPhysicsToScene() {
    var bodies = this._bodies;
    for (var i = 0, l = bodies.length; i < l; i++) {
      var body = bodies[i];
      var bodyComp = body.rigidBody;
      if (bodyComp.type === ERigidBody2DType.Animated) {
        body.resetVelocity();
        continue;
      }
      var node = bodyComp.node;
      var b2body = body.impl;
      var pos = b2body.GetPosition();
      tempVec3$1.x = pos.x * PHYSICS_2D_PTM_RATIO;
      tempVec3$1.y = pos.y * PHYSICS_2D_PTM_RATIO;
      tempVec3$1.z = 0;
      node.worldPosition = tempVec3$1;
      var angle = toDegree(b2body.GetAngle());
      node.setWorldRotationFromEuler(0, 0, angle);
    }
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    var bodies = this._bodies;
    for (var i = 0; i < bodies.length; i++) {
      bodies[i].syncSceneToPhysics();
    }
  };
  _proto.addBody = function addBody(body) {
    var bodies = this._bodies;
    if (bodies.includes(body)) {
      return;
    }
    var bodyDef = this._temoBodyDef;
    var comp = body.rigidBody;
    bodyDef.allowSleep = comp.allowSleep;
    bodyDef.gravityScale = comp.gravityScale;
    bodyDef.linearDamping = comp.linearDamping;
    bodyDef.angularDamping = comp.angularDamping;
    bodyDef.fixedRotation = comp.fixedRotation;
    bodyDef.bullet = comp.bullet;
    var node = comp.node;
    var pos = node.worldPosition;
    bodyDef.position = {
      x: pos.x / PHYSICS_2D_PTM_RATIO,
      y: pos.y / PHYSICS_2D_PTM_RATIO
    };
    tempVec3$1.z = Quat.getAxisAngle(this._rotationAxis, node.worldRotation);
    if (this._rotationAxis.z < 0.0) {
      tempVec3$1.z = Math.PI * 2 - tempVec3$1.z;
    }
    bodyDef.angle = tempVec3$1.z;
    bodyDef.awake = comp.awakeOnLoad;
    if (comp.type === ERigidBody2DType.Animated) {
      bodyDef.type = B2.BodyType.b2_kinematicBody;
      this._animatedBodies.push(body);
      body._animatedPos.set(bodyDef.position.x, bodyDef.position.y);
      body._animatedAngle = bodyDef.angle;
    } else {
      switch (comp.type) {
        case ERigidBody2DType.Dynamic:
          bodyDef.type = B2.BodyType.b2_dynamicBody;
          break;
        case ERigidBody2DType.Static:
          bodyDef.type = B2.BodyType.b2_staticBody;
          break;
        case ERigidBody2DType.Kinematic:
          bodyDef.type = B2.BodyType.b2_kinematicBody;
          break;
        default:
          bodyDef.type = B2.BodyType.b2_staticBody;
          break;
      }
    }
    var compPrivate = comp;
    var linearVelocity = compPrivate._linearVelocity;
    bodyDef.linearVelocity = {
      x: linearVelocity.x,
      y: linearVelocity.y
    };
    bodyDef.angularVelocity = compPrivate._angularVelocity;
    var b2Body = this._world.CreateBody(bodyDef);
    addImplPtrReference(B2ObjectType.Body, body, getImplPtr(b2Body));
    addImplPtrReferenceWASM(B2ObjectType.Body, b2Body, getImplPtr(b2Body));
    body._imp = b2Body;
    this._bodies.push(body);
  };
  _proto.removeBody = function removeBody(body) {
    if (!this._bodies.includes(body)) {
      return;
    }
    if (body.impl) {
      removeImplPtrReference(B2ObjectType.Body, getImplPtr(body.impl));
      removeImplPtrReferenceWASM(B2ObjectType.Body, getImplPtr(body.impl));
      this._world.DestroyBody(body.impl);
      body._imp = null;
    }
    remove(this._bodies, body);
    var comp = body.rigidBody;
    if (comp.type === ERigidBody2DType.Animated) {
      remove(this._animatedBodies, body);
    }
  };
  _proto._updateBodyType = function _updateBodyType(body) {
    var animatedBodies = this._animatedBodies;
    var comp = body.rigidBody;
    if (comp.type !== ERigidBody2DType.Animated) {
      remove(animatedBodies, body);
    } else {
      if (animatedBodies.includes(body)) {
        return;
      }
      animatedBodies.push(body);
    }
  };
  _proto.registerContactFixture = function registerContactFixture(fixture) {
    this._contactListener.registerContactFixture(fixture);
  };
  _proto.unregisterContactFixture = function unregisterContactFixture(fixture) {
    this._contactListener.unregisterContactFixture(fixture);
  };
  _proto.testPoint = function testPoint(point) {
    var x = tempVec2_1$1.x = point.x / PHYSICS_2D_PTM_RATIO;
    var y = tempVec2_1$1.y = point.y / PHYSICS_2D_PTM_RATIO;
    var d = 0.2 / PHYSICS_2D_PTM_RATIO;
    this._tempB2AABB.lowerBound = {
      x: x - d,
      y: y - d
    };
    this._tempB2AABB.upperBound = {
      x: x + d,
      y: y + d
    };
    var callback = this._aabbQueryCallback;
    PhysicsAABBQueryCallback.init(tempVec2_1$1);
    this._world.QueryAABB(callback, this._tempB2AABB);
    var fixtures = PhysicsAABBQueryCallback.getFixtures();
    testResults.length = 0;
    for (var i = 0; i < fixtures.length; i++) {
      var collider = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, fixtures[i]).collider;
      if (!testResults.includes(collider)) {
        testResults.push(collider);
      }
    }
    return testResults;
  };
  _proto.testAABB = function testAABB(rect) {
    this._tempB2AABB.lowerBound = {
      x: rect.xMin / PHYSICS_2D_PTM_RATIO,
      y: rect.yMin / PHYSICS_2D_PTM_RATIO
    };
    this._tempB2AABB.upperBound = {
      x: rect.xMax / PHYSICS_2D_PTM_RATIO,
      y: rect.yMax / PHYSICS_2D_PTM_RATIO
    };
    var callback = this._aabbQueryCallback;
    PhysicsAABBQueryCallback.init();
    this._world.QueryAABB(callback, this._tempB2AABB);
    var fixtures = PhysicsAABBQueryCallback.getFixtures();
    testResults.length = 0;
    for (var i = 0; i < fixtures.length; i++) {
      var collider = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, fixtures[i]).collider;
      if (!testResults.includes(collider)) {
        testResults.push(collider);
      }
    }
    return testResults;
  };
  _proto.drawDebug = function drawDebug() {
    this._checkDebugDrawValid();
    if (!this._debugGraphics) {
      return;
    }
    this._debugGraphics.clear();
    this._world.DebugDraw();
  };
  _proto._onBeginContact = function _onBeginContact(b2contact) {
    var c = PhysicsContact.get(b2contact);
    c.emit(Contact2DType.BEGIN_CONTACT);
  };
  _proto._onEndContact = function _onEndContact(b2contact) {
    var c = getTSObjectFromWASMObjectPtr(B2ObjectType.Contact, b2contact);
    if (!c) {
      return;
    }
    c.emit(Contact2DType.END_CONTACT);
    PhysicsContact.put(b2contact);
  };
  _proto._onPreSolve = function _onPreSolve(b2contact) {
    var c = getTSObjectFromWASMObjectPtr(B2ObjectType.Contact, b2contact);
    if (!c) {
      return;
    }
    c.emit(Contact2DType.PRE_SOLVE);
  };
  _proto._onPostSolve = function _onPostSolve(b2contact, impulse) {
    var c = getTSObjectFromWASMObjectPtr(B2ObjectType.Contact, b2contact);
    if (!c) {
      return;
    }
    c._setImpulse(impulse);
    c.emit(Contact2DType.POST_SOLVE);
    c._setImpulse(0);
  };
  return _createClass(B2PhysicsWorld, [{
    key: "impl",
    get: function get() {
      return this._world;
    }
  }, {
    key: "groundBodyImpl",
    get: function get() {
      return this._physicsGroundBody;
    }
  }, {
    key: "debugDrawFlags",
    get: function get() {
      return this._debugDrawFlags;
    },
    set: function set(v) {
      if (!v) {
        if (this._debugGraphics) {
          this._debugGraphics.node.parent = null;
        }
      }
      this._debugDrawFlags = v;
    }
  }]);
}();

var tempVec3 = new Vec3();
var tempVec2_1 = {
  x: 0,
  y: 0
};
var tempVec2_2 = {
  x: 0,
  y: 0
};
var B2RigidBody2D = function () {
  function B2RigidBody2D() {
    this._animatedPos = new Vec2();
    this._animatedAngle = 0;
    this._body = null;
    this._rigidBody = void 0;
    this._inited = false;
  }
  var _proto = B2RigidBody2D.prototype;
  _proto.initialize = function initialize(com) {
    this._rigidBody = com;
    PhysicsSystem2D.instance._callAfterStep(this, this._init);
  };
  _proto.onDestroy = function onDestroy() {
    PhysicsSystem2D.instance._callAfterStep(this, this._destroy);
  };
  _proto.onEnable = function onEnable() {
    this.setActive(true);
  };
  _proto.onDisable = function onDisable() {
    this.setActive(false);
  };
  _proto.nodeTransformChanged = function nodeTransformChanged(type) {
    if (PhysicsSystem2D.instance.stepping) {
      return;
    }
    if (type & Node.TransformBit.SCALE) {
      var colliders = this.rigidBody.getComponents(Collider2D);
      for (var i = 0; i < colliders.length; i++) {
        colliders[i].apply();
      }
    }
    if (type & Node.TransformBit.POSITION) {
      this.syncPositionToPhysics(true);
    }
    if (type & Node.TransformBit.ROTATION) {
      this.syncRotationToPhysics(true);
    }
  };
  _proto._init = function _init() {
    if (this._inited) {
      return;
    }
    PhysicsSystem2D.instance.physicsWorld.addBody(this);
    this.setActive(false);
    this._inited = true;
  };
  _proto._destroy = function _destroy() {
    var _this$impl, _this$impl2;
    if (!this._inited) return;
    var fixtureList = (_this$impl = this.impl) == null ? void 0 : _this$impl.GetFixtureList();
    if (fixtureList) {
      var shapeTSObj = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, fixtureList);
      while (shapeTSObj && shapeTSObj.impl) {
        shapeTSObj.destroy();
        var nextFixture = B2.FixtureGetNext(fixtureList);
        shapeTSObj = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, nextFixture);
      }
    }
    var jointListPtr = (_this$impl2 = this.impl) == null ? void 0 : _this$impl2.GetJointList();
    if (jointListPtr) {
      var jointWASMPtr = B2.JointEdgeGetJoint(jointListPtr);
      var jointTSObj = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, jointWASMPtr);
      while (jointTSObj) {
        jointTSObj.destroy();
        jointWASMPtr = B2.JointEdgeGetNext(jointListPtr);
        jointTSObj = getTSObjectFromWASMObjectPtr(B2ObjectType.Fixture, jointWASMPtr);
      }
    }
    PhysicsSystem2D.instance.physicsWorld.removeBody(this);
    this._inited = false;
  };
  _proto.animate = function animate(dt) {
    var b2body = this._body;
    if (!b2body) return;
    var b2Pos = b2body.GetPosition();
    b2body.SetAwake(true);
    var timeStep = 1 / dt;
    tempVec2_1.x = (this._animatedPos.x - b2Pos.x) * timeStep;
    tempVec2_1.y = (this._animatedPos.y - b2Pos.y) * timeStep;
    b2body.SetLinearVelocity(tempVec2_1);
    var b2Rotation = b2body.GetAngle() % TWO_PI;
    if (b2Rotation > Math.PI) {
      b2Rotation -= TWO_PI;
    }
    var angularVelocity = (this._animatedAngle - b2Rotation) * timeStep;
    if (this._animatedAngle < -HALF_PI && b2Rotation > HALF_PI) {
      angularVelocity = (this._animatedAngle + TWO_PI - b2Rotation) * timeStep;
    }
    if (this._animatedAngle > HALF_PI && b2Rotation < -HALF_PI) {
      angularVelocity = (this._animatedAngle - TWO_PI - b2Rotation) * timeStep;
    }
    b2body.SetAngularVelocity(angularVelocity);
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    var dirty = this._rigidBody.node.hasChangedFlags;
    if (dirty) {
      this.nodeTransformChanged(dirty);
    }
  };
  _proto.syncPositionToPhysics = function syncPositionToPhysics(enableAnimated) {
    if (enableAnimated === void 0) {
      enableAnimated = false;
    }
    var b2body = this._body;
    if (!b2body) return;
    var pos = this._rigidBody.node.worldPosition;
    tempVec2_2.x = pos.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_2.y = pos.y / PHYSICS_2D_PTM_RATIO;
    if (this._rigidBody.type === ERigidBody2DType.Animated && enableAnimated) {
      this._animatedPos.set(tempVec2_2.x, tempVec2_2.y);
    } else {
      b2body.SetTransform(tempVec2_2, b2body.GetAngle());
    }
  };
  _proto.syncRotationToPhysics = function syncRotationToPhysics(enableAnimated) {
    if (enableAnimated === void 0) {
      enableAnimated = false;
    }
    var b2body = this._body;
    if (!b2body) return;
    var rot = this._rigidBody.node.worldRotation;
    var euler = tempVec3;
    Quat.toEulerInYXZOrder(euler, rot);
    var rotation = toRadian(euler.z);
    var bodyType = this._rigidBody.type;
    if (bodyType === ERigidBody2DType.Animated && enableAnimated) {
      this._animatedAngle = rotation;
    } else {
      b2body.SetTransform(b2body.GetPosition(), rotation);
    }
  };
  _proto.resetVelocity = function resetVelocity() {
    var b2body = this._body;
    if (!b2body) return;
    tempVec2_1.x = 0;
    tempVec2_1.y = 0;
    b2body.SetLinearVelocity(tempVec2_1);
    b2body.SetAngularVelocity(0);
  };
  _proto.setType = function setType(v) {
    PhysicsSystem2D.instance.physicsWorld._updateBodyType(this);
    if (v === ERigidBody2DType.Dynamic) {
      this._body.SetType(B2.BodyType.b2_dynamicBody);
    } else if (v === ERigidBody2DType.Kinematic) {
      this._body.SetType(B2.BodyType.b2_kinematicBody);
    } else if (v === ERigidBody2DType.Static) {
      this._body.SetType(B2.BodyType.b2_staticBody);
    }
  };
  _proto.setLinearDamping = function setLinearDamping(v) {
    this._body.SetLinearDamping(v);
  };
  _proto.setAngularDamping = function setAngularDamping(v) {
    this._body.SetAngularDamping(v);
  };
  _proto.setGravityScale = function setGravityScale(v) {
    this._body.SetGravityScale(v);
  };
  _proto.setFixedRotation = function setFixedRotation(v) {
    this._body.SetFixedRotation(v);
  };
  _proto.setAllowSleep = function setAllowSleep(v) {
    this._body.SetSleepingAllowed(v);
  };
  _proto.isActive = function isActive() {
    return this._body.IsEnabled();
  };
  _proto.setActive = function setActive(v) {
    if (!this._body.GetWorld().IsLocked()) {
      this._body.SetEnabled(v);
    } else {
      warn('Can not active RigidBody in contract listener.');
    }
  };
  _proto.wakeUp = function wakeUp() {
    this._body.SetAwake(true);
  };
  _proto.sleep = function sleep() {
    this._body.SetAwake(false);
  };
  _proto.getMass = function getMass() {
    return this._body.GetMass();
  };
  _proto.setLinearVelocity = function setLinearVelocity(v) {
    this._body.SetLinearVelocity(v);
  };
  _proto.getLinearVelocity = function getLinearVelocity(out) {
    var velocity = this._body.GetLinearVelocity();
    out.x = velocity.x;
    out.y = velocity.y;
    return out;
  };
  _proto.getLinearVelocityFromWorldPoint = function getLinearVelocityFromWorldPoint(worldPoint, out) {
    out = out || new Vec2();
    tempVec2_1.x = worldPoint.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_1.y = worldPoint.y / PHYSICS_2D_PTM_RATIO;
    var temp = this._body.GetLinearVelocityFromWorldPoint(tempVec2_1);
    out.x = temp.x * PHYSICS_2D_PTM_RATIO;
    out.y = temp.y * PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.setAngularVelocity = function setAngularVelocity(v) {
    this._body.SetAngularVelocity(v);
  };
  _proto.getAngularVelocity = function getAngularVelocity() {
    return this._body.GetAngularVelocity();
  };
  _proto.getLocalVector = function getLocalVector(worldVector, out) {
    out = out || new Vec2();
    tempVec2_1.x = worldVector.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_1.y = worldVector.y / PHYSICS_2D_PTM_RATIO;
    var temp = this._body.GetLocalVector(tempVec2_1);
    out.x = temp.x * PHYSICS_2D_PTM_RATIO;
    out.y = temp.y * PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getWorldVector = function getWorldVector(localVector, out) {
    tempVec2_1.x = localVector.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_1.y = localVector.y / PHYSICS_2D_PTM_RATIO;
    var temp = this._body.GetWorldVector(tempVec2_1);
    out.x = temp.x * PHYSICS_2D_PTM_RATIO;
    out.y = temp.y * PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getLocalPoint = function getLocalPoint(worldPoint, out) {
    out = out || new Vec2();
    tempVec2_1.x = worldPoint.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_1.y = worldPoint.y / PHYSICS_2D_PTM_RATIO;
    var temp = this._body.GetLocalPoint(tempVec2_1);
    out.x = temp.x * PHYSICS_2D_PTM_RATIO;
    out.y = temp.y * PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getWorldPoint = function getWorldPoint(localPoint, out) {
    out = out || new Vec2();
    tempVec2_1.x = localPoint.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_1.y = localPoint.y / PHYSICS_2D_PTM_RATIO;
    var temp = this._body.GetWorldPoint(tempVec2_1);
    out.x = temp.x * PHYSICS_2D_PTM_RATIO;
    out.y = temp.y * PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getLocalCenter = function getLocalCenter(out) {
    out = out || new Vec2();
    var pos = this._body.GetLocalCenter();
    out.x = pos.x * PHYSICS_2D_PTM_RATIO;
    out.y = pos.y * PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getWorldCenter = function getWorldCenter(out) {
    out = out || new Vec2();
    var pos = this._body.GetWorldCenter();
    out.x = pos.x * PHYSICS_2D_PTM_RATIO;
    out.y = pos.y * PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getInertia = function getInertia() {
    return this._body.GetInertia();
  };
  _proto.applyForce = function applyForce(force, point, wake) {
    if (this._body) {
      tempVec2_1.x = point.x / PHYSICS_2D_PTM_RATIO;
      tempVec2_1.y = point.y / PHYSICS_2D_PTM_RATIO;
      this._body.ApplyForce(force, tempVec2_1, wake);
    }
  };
  _proto.applyForceToCenter = function applyForceToCenter(force, wake) {
    if (this._body) {
      this._body.ApplyForceToCenter(force, wake);
    }
  };
  _proto.applyTorque = function applyTorque(torque, wake) {
    if (this._body) {
      this._body.ApplyTorque(torque, wake);
    }
  };
  _proto.applyLinearImpulse = function applyLinearImpulse(impulse, point, wake) {
    if (this._body) {
      tempVec2_1.x = point.x / PHYSICS_2D_PTM_RATIO;
      tempVec2_1.y = point.y / PHYSICS_2D_PTM_RATIO;
      this._body.ApplyLinearImpulse(impulse, tempVec2_1, wake);
    }
  };
  _proto.applyLinearImpulseToCenter = function applyLinearImpulseToCenter(impulse, wake) {
    if (this._body) {
      this._body.ApplyLinearImpulse(impulse, this._body.GetPosition(), wake);
    }
  };
  _proto.applyAngularImpulse = function applyAngularImpulse(impulse, wake) {
    if (this._body) {
      this._body.ApplyAngularImpulse(impulse, wake);
    }
  };
  return _createClass(B2RigidBody2D, [{
    key: "impl",
    get: function get() {
      return this._body;
    }
  }, {
    key: "_imp",
    set: function set(v) {
      this._body = v;
    }
  }, {
    key: "rigidBody",
    get: function get() {
      return this._rigidBody;
    }
  }, {
    key: "isAwake",
    get: function get() {
      return this._body.IsAwake();
    }
  }, {
    key: "isSleeping",
    get: function get() {
      return !this._body.IsAwake();
    }
  }]);
}();

var tempFilter = {
  categoryBits: 0,
  maskBits: 0,
  groupIndex: 0
};
var lowerBound = {
  x: 0,
  y: 0
};
var upperBound = {
  x: 0,
  y: 0
};
function getFilter(shape) {
  var comp = shape.collider;
  if (comp.body) {
    tempFilter.categoryBits = comp.group === PhysicsGroup.DEFAULT ? comp.body.group : comp.group;
  } else {
    tempFilter.categoryBits = comp.group;
  }
  tempFilter.maskBits = PhysicsSystem2D.instance.collisionMatrix[tempFilter.categoryBits];
  return tempFilter;
}
var B2Shape2D = function () {
  function B2Shape2D() {
    this._shapes = [];
    this._fixtures = [];
    this._collider = null;
    this._body = null;
    this._inited = false;
    this._rect = new Rect();
  }
  var _proto = B2Shape2D.prototype;
  _proto.initialize = function initialize(comp) {
    this._collider = comp;
  };
  _proto.onLoad = function onLoad() {};
  _proto.onEnable = function onEnable() {
    PhysicsSystem2D.instance._callAfterStep(this, this._init);
  };
  _proto.onDisable = function onDisable() {
    PhysicsSystem2D.instance._callAfterStep(this, this.destroy);
  };
  _proto.start = function start() {};
  _proto.onGroupChanged = function onGroupChanged() {
    var filter = getFilter(this);
    this._fixtures.forEach(function (f) {
      B2.FixtureSetFilterData(f, filter);
    });
  };
  _proto.apply = function apply() {
    this.destroy();
    if (this.collider.enabledInHierarchy) {
      this._init();
    }
  };
  _proto.getFixtureIndex = function getFixtureIndex(fixture) {
    return this._fixtures.indexOf(fixture);
  };
  _proto._createShapes = function _createShapes(scaleX, scaleY, relativePositionX, relativePositionY) {
    return [];
  };
  _proto._init = function _init() {
    if (this._inited) return;
    var comp = this.collider;
    var scale = comp.node.worldScale;
    var relativePosition = Vec3.ZERO;
    var body = comp.getComponent(RigidBody2D);
    if (body && body.impl && body.impl.impl) {
      this._body = body.impl.impl;
    } else {
      this._body = PhysicsSystem2D.instance.physicsWorld.groundBodyImpl;
      relativePosition = comp.node.worldPosition;
    }
    var shapes = scale.x === 0 && scale.y === 0 ? [] : this._createShapes(scale.x, scale.y, relativePosition.x, relativePosition.y);
    var filter = getFilter(this);
    for (var i = 0; i < shapes.length; i++) {
      var shape = shapes[i];
      var fixDef = PhysicsSystem2D.instance.physicsWorld.tempB2FixtureDefPtr;
      B2.FixtureDefSetAll(fixDef, shape, 0, comp.friction, comp.restitution, comp.density, comp.sensor, filter.categoryBits, filter.maskBits, filter.groupIndex);
      var fixture = B2.BodyCreateFixture(getImplPtr(this._body), fixDef);
      addImplPtrReference(B2ObjectType.Fixture, this, fixture);
      addImplPtrReferenceWASM(B2ObjectType.Fixture, fixture, fixture);
      if (body != null && body.enabledContactListener) {
        PhysicsSystem2D.instance.physicsWorld.registerContactFixture(fixture);
      }
      this._shapes.push(shape);
      this._fixtures.push(fixture);
    }
    this._inited = true;
  };
  _proto.destroy = function destroy() {
    if (!this._inited) return;
    var fixtures = this._fixtures;
    var body = this._body;
    for (var i = fixtures.length - 1; i >= 0; i--) {
      var fixture = fixtures[i];
      removeImplPtrReference(B2ObjectType.Fixture, fixture);
      removeImplPtrReferenceWASM(B2ObjectType.Fixture, fixture);
      PhysicsSystem2D.instance.physicsWorld.unregisterContactFixture(fixture);
      if (body) {
        B2.BodyDestroyFixture(getImplPtr(body), fixture);
      }
    }
    this._body = null;
    this._fixtures.length = 0;
    this._shapes.length = 0;
    this._inited = false;
  };
  return _createClass(B2Shape2D, [{
    key: "impl",
    get: function get() {
      return this._shapes;
    }
  }, {
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "worldAABB",
    get: function get() {
      var MAX = 10e6;
      var minX = MAX;
      var minY = MAX;
      var maxX = -MAX;
      var maxY = -MAX;
      var fixtures = this._fixtures;
      for (var i = 0; i < fixtures.length; i++) {
        var fixture = fixtures[i];
        var shape = B2.FixtureGetShape(fixture);
        var count = B2.ShapeGetChildCount(shape);
        for (var j = 0; j < count; j++) {
          var aabb = B2.FixtureGetAABB(fixture, j);
          lowerBound.x = aabb.lowerBound.x;
          lowerBound.y = aabb.lowerBound.y;
          upperBound.x = aabb.upperBound.x;
          upperBound.y = aabb.upperBound.y;
          if (B2.ShapeGetType(shape) === 2) {
            var skinWidth = B2.ShapeGetRadius(shape);
            lowerBound.x += skinWidth;
            lowerBound.y += skinWidth;
            upperBound.x += skinWidth;
            upperBound.y += skinWidth;
          }
          if (lowerBound.x < minX) minX = lowerBound.x;
          if (lowerBound.y < minY) minY = lowerBound.y;
          if (upperBound.x > maxX) maxX = upperBound.x;
          if (upperBound.y > maxY) maxY = upperBound.y;
        }
      }
      minX *= PHYSICS_2D_PTM_RATIO;
      minY *= PHYSICS_2D_PTM_RATIO;
      maxX *= PHYSICS_2D_PTM_RATIO;
      maxY *= PHYSICS_2D_PTM_RATIO;
      var r = this._rect;
      r.x = minX;
      r.y = minY;
      r.width = maxX - minX;
      r.height = maxY - minY;
      return r;
    }
  }]);
}();

var tempAabb = new Rect();
var B2BoxShape = function (_B2Shape2D) {
  function B2BoxShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _B2Shape2D.call.apply(_B2Shape2D, [this].concat(args)) || this;
    _this._worldPoints = [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
    return _this;
  }
  _inheritsLoose(B2BoxShape, _B2Shape2D);
  var _proto = B2BoxShape.prototype;
  _proto._createShapes = function _createShapes(scaleX, scaleY, relativePositionX, relativePositionY) {
    scaleX = Math.abs(scaleX);
    scaleY = Math.abs(scaleY);
    var comp = this.collider;
    var width = comp.size.width / 2 / PHYSICS_2D_PTM_RATIO * scaleX;
    var height = comp.size.height / 2 / PHYSICS_2D_PTM_RATIO * scaleY;
    var offsetX = (relativePositionX + comp.offset.x * scaleX) / PHYSICS_2D_PTM_RATIO;
    var offsetY = (relativePositionY + comp.offset.y * scaleY) / PHYSICS_2D_PTM_RATIO;
    var shape = B2.PolygonShapeNew();
    B2.PolygonShapeSetAsBoxWithCenterAndAngle(shape, width, height, offsetX, offsetY, 0);
    return [shape];
  };
  return _createClass(B2BoxShape, [{
    key: "worldPoints",
    get: function get() {
      var aabb = tempAabb;
      var collider = this.collider;
      var size = collider.size;
      var offset = collider.offset;
      aabb.x = offset.x - size.width / 2;
      aabb.y = offset.y - size.height / 2;
      aabb.width = size.width;
      aabb.height = size.height;
      var wps = this._worldPoints;
      var wp0 = wps[0];
      var wp1 = wps[1];
      var wp2 = wps[2];
      var wp3 = wps[3];
      aabb.transformMat4ToPoints(collider.node.worldMatrix, wp0, wp1, wp2, wp3);
      return wps;
    }
  }]);
}(B2Shape2D);

var B2CircleShape = function (_B2Shape2D) {
  function B2CircleShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _B2Shape2D.call.apply(_B2Shape2D, [this].concat(args)) || this;
    _this._worldPosition = new Vec2();
    return _this;
  }
  _inheritsLoose(B2CircleShape, _B2Shape2D);
  var _proto = B2CircleShape.prototype;
  _proto._createShapes = function _createShapes(scaleX, scaleY, relativePositionX, relativePositionY) {
    scaleX = Math.abs(scaleX);
    scaleY = Math.abs(scaleY);
    var comp = this.collider;
    var offsetX = (relativePositionX + comp.offset.x * scaleX) / PHYSICS_2D_PTM_RATIO;
    var offsetY = (relativePositionY + comp.offset.y * scaleY) / PHYSICS_2D_PTM_RATIO;
    var shape = B2.CircleShapeNew();
    B2.ShapeSetRadius(shape, comp.radius / PHYSICS_2D_PTM_RATIO * scaleX);
    B2.CircleShapeSetPosition(shape, offsetX, offsetY);
    return [shape];
  };
  return _createClass(B2CircleShape, [{
    key: "worldRadius",
    get: function get() {
      return B2.CircleShapeGetRadius(this._shapes[0]) * PHYSICS_2D_PTM_RATIO;
    }
  }, {
    key: "worldPosition",
    get: function get() {
      var p = B2.CircleShapeGetPosition(this._shapes[0]);
      return this._worldPosition.set(p.x * PHYSICS_2D_PTM_RATIO, p.y * PHYSICS_2D_PTM_RATIO);
    }
  }]);
}(B2Shape2D);

var B2PolygonShape = function (_B2Shape2D) {
  function B2PolygonShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _B2Shape2D.call.apply(_B2Shape2D, [this].concat(args)) || this;
    _this._worldPoints = [];
    return _this;
  }
  _inheritsLoose(B2PolygonShape, _B2Shape2D);
  var _proto = B2PolygonShape.prototype;
  _proto._createShapes = function _createShapes(scaleX, scaleY, relativePositionX, relativePositionY) {
    var shapes = [];
    var comp = this.collider;
    var points = comp.points;
    if (points.length > 0 && points[0].equals(points[points.length - 1])) {
      points.length -= 1;
    }
    var polys = ConvexPartition(points);
    if (!polys) {
      warn('[Physics2D] b2PolygonShape failed to decompose polygon into convex polygons, node name: ', comp.node.name);
      return shapes;
    }
    var offset = comp.offset;
    for (var i = 0; i < polys.length; i++) {
      var poly = polys[i];
      var shape = 0;
      var vertices = B2.Vec2VectorNew();
      var firstVertice = null;
      for (var j = 0, l = poly.length; j < l; j++) {
        if (!shape) {
          shape = B2.PolygonShapeNew();
        }
        var p = poly[j];
        var x = (relativePositionX + (p.x + offset.x) * scaleX) / PHYSICS_2D_PTM_RATIO;
        var y = (relativePositionY + (p.y + offset.y) * scaleY) / PHYSICS_2D_PTM_RATIO;
        var v = {
          x: x,
          y: y
        };
        B2.Vec2VectorPush(vertices, x, y);
        if (!firstVertice) {
          firstVertice = v;
        }
        if (B2.Vec2VectorSize(vertices) === B2.maxPolygonVertices) {
          B2.PolygonShapeSet(shape, B2.Vec2VectorGetPtr(vertices), B2.Vec2VectorSize(vertices));
          shapes.push(shape);
          shape = 0;
          if (j < l - 1) {
            var temp = B2.Vec2VectorGet(vertices, B2.Vec2VectorSize(vertices) - 1);
            B2.Vec2VectorResize(vertices, 0, 0, 0);
            B2.Vec2VectorPush(vertices, firstVertice.x, firstVertice.y);
            B2.Vec2VectorPush(vertices, temp.x, temp.y);
          }
        }
      }
      if (shape) {
        B2.PolygonShapeSet(shape, B2.Vec2VectorGetPtr(vertices), B2.Vec2VectorSize(vertices));
        shapes.push(shape);
      }
      B2.Vec2VectorDelete(vertices);
    }
    return shapes;
  };
  return _createClass(B2PolygonShape, [{
    key: "worldPoints",
    get: function get() {
      var comp = this.collider;
      var points = comp.points;
      var worldPoints = this._worldPoints;
      var m = comp.node.worldMatrix;
      for (var i = 0; i < points.length; i++) {
        if (!worldPoints[i]) {
          worldPoints[i] = new Vec2();
        }
        Vec2.transformMat4(worldPoints[i], points[i], m);
      }
      worldPoints.length = points.length;
      return this._worldPoints;
    }
  }]);
}(B2Shape2D);

var B2Joint = function () {
  function B2Joint() {
    this._b2joint = null;
    this._jointComp = null;
    this._body = null;
    this._inited = false;
  }
  var _proto = B2Joint.prototype;
  _proto.initialize = function initialize(comp) {
    this._jointComp = comp;
  };
  _proto.onEnable = function onEnable() {
    PhysicsSystem2D.instance._callAfterStep(this, this._init);
  };
  _proto.onDisable = function onDisable() {
    PhysicsSystem2D.instance._callAfterStep(this, this.destroy);
  };
  _proto.start = function start() {
    PhysicsSystem2D.instance._callAfterStep(this, this._init);
  };
  _proto.apply = function apply() {
    PhysicsSystem2D.instance._callAfterStep(this, this.destroy);
    if (this.comp.enabledInHierarchy) {
      PhysicsSystem2D.instance._callAfterStep(this, this._init);
    }
  };
  _proto._init = function _init() {
    if (this._inited) return;
    var comp = this._jointComp;
    if (!comp.isValid) {
      return;
    }
    this._body = comp.getComponent(RigidBody2D);
    if (!this._body) {
      warn("Joint2D: Body is not found, can not create joint. Node Name: " + comp.node.name);
      return;
    }
    var def = this._createJointDef();
    if (!def) {
      return;
    }
    def.SetBodyA(this._body.impl.impl);
    var connectedBody = comp.connectedBody;
    if (connectedBody && !connectedBody.enabledInHierarchy) {
      return;
    }
    if (!connectedBody) {
      def.SetBodyB(PhysicsSystem2D.instance.physicsWorld.groundBodyImpl);
    } else {
      def.SetBodyB(connectedBody.impl.impl);
    }
    def.collideConnected = comp.collideConnected;
    this._b2joint = PhysicsSystem2D.instance.physicsWorld.impl.CreateJoint(def);
    addImplPtrReference(B2ObjectType.Joint, this, getImplPtr(this._b2joint));
    addImplPtrReferenceWASM(B2ObjectType.Joint, this._b2joint, getImplPtr(this._b2joint));
    this._inited = true;
  };
  _proto.destroy = function destroy() {
    if (!this._inited) return;
    removeImplPtrReference(B2ObjectType.Joint, getImplPtr(this._b2joint));
    removeImplPtrReferenceWASM(B2ObjectType.Joint, getImplPtr(this._b2joint));
    PhysicsSystem2D.instance.physicsWorld.impl.DestroyJoint(this._b2joint);
    this._b2joint = null;
    this._inited = false;
  };
  _proto._createJointDef = function _createJointDef() {
    return null;
  };
  _proto.isValid = function isValid() {
    return this._b2joint && this._body && this._body.impl && this._jointComp;
  };
  return _createClass(B2Joint, [{
    key: "impl",
    get: function get() {
      return this._b2joint;
    }
  }, {
    key: "comp",
    get: function get() {
      return this._jointComp;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    }
  }]);
}();

var tempB2Vec2$1 = {
  x: 0,
  y: 0
};
var B2MouseJoint = function (_B2Joint) {
  function B2MouseJoint() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _B2Joint.call.apply(_B2Joint, [this].concat(args)) || this;
    _this._touchPoint = new Vec2();
    _this._isTouched = false;
    return _this;
  }
  _inheritsLoose(B2MouseJoint, _B2Joint);
  var _proto = B2MouseJoint.prototype;
  _proto.setTarget = function setTarget(v) {
    if (this._b2joint) {
      tempB2Vec2$1.x = v.x / PHYSICS_2D_PTM_RATIO;
      tempB2Vec2$1.y = v.y / PHYSICS_2D_PTM_RATIO;
      this._b2joint.SetTarget(tempB2Vec2$1);
    }
  };
  _proto.setFrequency = function setFrequency(v) {
    if (this._b2joint) {
      this._b2joint.SetFrequency(v);
    }
  };
  _proto.setDampingRatio = function setDampingRatio(v) {
    if (this._b2joint) {
      this._b2joint.SetDampingRatio(v);
    }
  };
  _proto.setMaxForce = function setMaxForce(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxForce(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var def = new B2.MouseJointDef();
    var comp = this._jointComp;
    def.target = {
      x: this._touchPoint.x / PHYSICS_2D_PTM_RATIO,
      y: this._touchPoint.y / PHYSICS_2D_PTM_RATIO
    };
    def.maxForce = comp.maxForce;
    def.dampingRatio = comp.dampingRatio;
    def.frequencyHz = comp.frequency;
    return def;
  };
  _proto.start = function start() {};
  _proto.onEnable = function onEnable() {
    this._enableTouch(true);
  };
  _proto.onDisable = function onDisable() {
    _B2Joint.prototype.onDisable.call(this);
    this._enableTouch(false);
  };
  _proto._enableTouch = function _enableTouch(v) {
    var canvas = find('Canvas');
    if (canvas) {
      var cb = v ? canvas.on : canvas.off;
      cb.call(canvas, NodeEventType.TOUCH_START, this.onTouchBegan, this);
      cb.call(canvas, NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
      cb.call(canvas, NodeEventType.TOUCH_END, this.onTouchEnd, this);
      cb.call(canvas, NodeEventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
  };
  _proto.onTouchBegan = function onTouchBegan(event) {
    this._isTouched = true;
    var target = this._touchPoint.set(event.getUILocation());
    var world = PhysicsSystem2D.instance.physicsWorld;
    var colliders = world.testPoint(target);
    if (colliders.length <= 0) return;
    var body = colliders[0].body;
    body.wakeUp();
    var comp = this._jointComp;
    comp.connectedBody = body;
    this._init();
    this.setMaxForce(comp.maxForce * body.getMass());
    this.setTarget(target);
  };
  _proto.onTouchMove = function onTouchMove(event) {
    this._touchPoint = event.getUILocation();
  };
  _proto.onTouchEnd = function onTouchEnd(event) {
    this.destroy();
    this._isTouched = false;
  };
  _proto.update = function update() {
    if (!this._isTouched || !this.isValid()) {
      return;
    }
    this.setTarget(this._touchPoint);
  };
  return B2MouseJoint;
}(B2Joint);

var B2DistanceJoint = function (_B2Joint) {
  function B2DistanceJoint() {
    return _B2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(B2DistanceJoint, _B2Joint);
  var _proto = B2DistanceJoint.prototype;
  _proto.setMaxLength = function setMaxLength(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxLength(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new B2.RopeJointDef();
    def.localAnchorA = {
      x: comp.anchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.anchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.localAnchorB = {
      x: comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.maxLength = comp.maxLength / PHYSICS_2D_PTM_RATIO;
    return def;
  };
  return B2DistanceJoint;
}(B2Joint);

var B2SpringJoint = function (_B2Joint) {
  function B2SpringJoint() {
    return _B2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(B2SpringJoint, _B2Joint);
  var _proto = B2SpringJoint.prototype;
  _proto.setFrequency = function setFrequency(v) {
    if (this._b2joint) {
      this._b2joint.SetFrequency(v);
    }
  };
  _proto.setDampingRatio = function setDampingRatio(v) {
    if (this._b2joint) {
      this._b2joint.SetDampingRatio(v);
    }
  };
  _proto.setDistance = function setDistance(v) {
    if (this._b2joint) {
      this._b2joint.SetLength(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new B2.DistanceJointDef();
    def.localAnchorA = {
      x: comp.anchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.anchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.localAnchorB = {
      x: comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.length = comp.distance / PHYSICS_2D_PTM_RATIO;
    def.dampingRatio = comp.dampingRatio;
    def.frequencyHz = comp.frequency;
    return def;
  };
  return B2SpringJoint;
}(B2Joint);

var tempB2Vec2 = {
  x: 0,
  y: 0
};
var B2RelativeJoint = function (_B2Joint) {
  function B2RelativeJoint() {
    return _B2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(B2RelativeJoint, _B2Joint);
  var _proto = B2RelativeJoint.prototype;
  _proto.setMaxForce = function setMaxForce(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxForce(v);
    }
  };
  _proto.setAngularOffset = function setAngularOffset(v) {
    if (this._b2joint) {
      this._b2joint.SetAngularOffset(toRadian(v));
    }
  };
  _proto.setLinearOffset = function setLinearOffset(v) {
    if (this._b2joint) {
      tempB2Vec2.x = v.x / PHYSICS_2D_PTM_RATIO;
      tempB2Vec2.y = v.y / PHYSICS_2D_PTM_RATIO;
      this._b2joint.SetLinearOffset(tempB2Vec2);
    }
  };
  _proto.setCorrectionFactor = function setCorrectionFactor(v) {
    if (this._b2joint) {
      this._b2joint.SetCorrectionFactor(v);
    }
  };
  _proto.setMaxTorque = function setMaxTorque(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxTorque(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new B2.MotorJointDef();
    def.linearOffset = {
      x: comp.linearOffset.x / PHYSICS_2D_PTM_RATIO,
      y: comp.linearOffset.y / PHYSICS_2D_PTM_RATIO
    };
    def.angularOffset = toRadian(comp.angularOffset);
    def.maxForce = comp.maxForce;
    def.maxTorque = comp.maxTorque;
    def.correctionFactor = comp.correctionFactor;
    return def;
  };
  return B2RelativeJoint;
}(B2Joint);

var B2SliderJoint = function (_B2Joint) {
  function B2SliderJoint() {
    return _B2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(B2SliderJoint, _B2Joint);
  var _proto = B2SliderJoint.prototype;
  _proto.enableLimit = function enableLimit(v) {
    if (this._b2joint) {
      this._b2joint.EnableLimit(v);
    }
  };
  _proto.setLowerLimit = function setLowerLimit(v) {
    this.updateLimits();
  };
  _proto.setUpperLimit = function setUpperLimit(v) {
    this.updateLimits();
  };
  _proto.updateLimits = function updateLimits() {
    if (this._b2joint) {
      var comp = this._jointComp;
      this._b2joint.SetLimits(comp.lowerLimit / PHYSICS_2D_PTM_RATIO, comp.upperLimit / PHYSICS_2D_PTM_RATIO);
    }
  };
  _proto.enableMotor = function enableMotor(v) {
    if (this._b2joint) {
      this._b2joint.EnableMotor(v);
    }
  };
  _proto.setMaxMotorForce = function setMaxMotorForce(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxMotorForce(v);
    }
  };
  _proto.setMotorSpeed = function setMotorSpeed(v) {
    if (this._b2joint) {
      this._b2joint.SetMotorSpeed(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new B2.PrismaticJointDef();
    def.localAnchorA = {
      x: comp.anchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.anchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.localAnchorB = {
      x: comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO
    };
    var angle = toRadian(comp.angle);
    def.localAxisA = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
    def.referenceAngle = 0;
    def.enableLimit = comp.enableLimit;
    def.lowerTranslation = comp.lowerLimit / PHYSICS_2D_PTM_RATIO;
    def.upperTranslation = comp.upperLimit / PHYSICS_2D_PTM_RATIO;
    def.enableMotor = comp.enableMotor;
    def.maxMotorForce = comp.maxMotorForce;
    def.motorSpeed = comp.motorSpeed;
    return def;
  };
  return B2SliderJoint;
}(B2Joint);

var B2FixedJoint = function (_B2Joint) {
  function B2FixedJoint() {
    return _B2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(B2FixedJoint, _B2Joint);
  var _proto = B2FixedJoint.prototype;
  _proto.setFrequency = function setFrequency(v) {
    if (this._b2joint) {
      this._b2joint.SetFrequency(v);
    }
  };
  _proto.setDampingRatio = function setDampingRatio(v) {
    if (this._b2joint) {
      this._b2joint.SetDampingRatio(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new B2.WeldJointDef();
    def.localAnchorA = {
      x: comp.anchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.anchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.localAnchorB = {
      x: comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.referenceAngle = 0;
    def.dampingRatio = comp.dampingRatio;
    def.frequencyHz = comp.frequency;
    return def;
  };
  return B2FixedJoint;
}(B2Joint);

var B2WheelJoint = function (_B2Joint) {
  function B2WheelJoint() {
    return _B2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(B2WheelJoint, _B2Joint);
  var _proto = B2WheelJoint.prototype;
  _proto.setFrequency = function setFrequency(v) {
    if (this._b2joint) {
      this._b2joint.SetSpringFrequencyHz(v);
    }
  };
  _proto.setDampingRatio = function setDampingRatio(v) {
    if (this._b2joint) {
      this._b2joint.SetSpringDampingRatio(v);
    }
  };
  _proto.enableMotor = function enableMotor(v) {
    if (this._b2joint) {
      this._b2joint.EnableMotor(v);
    }
  };
  _proto.setMaxMotorTorque = function setMaxMotorTorque(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxMotorTorque(v);
    }
  };
  _proto.setMotorSpeed = function setMotorSpeed(v) {
    if (this._b2joint) {
      this._b2joint.SetMotorSpeed(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new B2.WheelJointDef();
    def.localAnchorA = {
      x: comp.anchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.anchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.localAnchorB = {
      x: comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO
    };
    var angle = toRadian(comp.angle);
    def.localAxisA = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
    def.maxMotorTorque = comp.maxMotorTorque;
    def.motorSpeed = toRadian(comp.motorSpeed);
    def.enableMotor = comp.enableMotor;
    def.dampingRatio = comp.dampingRatio;
    def.frequencyHz = comp.frequency;
    return def;
  };
  return B2WheelJoint;
}(B2Joint);

var B2HingeJoint = function (_B2Joint) {
  function B2HingeJoint() {
    return _B2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(B2HingeJoint, _B2Joint);
  var _proto = B2HingeJoint.prototype;
  _proto.enableLimit = function enableLimit(v) {
    if (this._b2joint) {
      this._b2joint.EnableLimit(v);
    }
  };
  _proto.setLowerAngle = function setLowerAngle(v) {
    this.updateLimits();
  };
  _proto.setUpperAngle = function setUpperAngle(v) {
    this.updateLimits();
  };
  _proto.updateLimits = function updateLimits() {
    if (this._b2joint) {
      var comp = this._jointComp;
      this._b2joint.SetLimits(toRadian(comp.lowerAngle), toRadian(comp.upperAngle));
    }
  };
  _proto.enableMotor = function enableMotor(v) {
    if (this._b2joint) {
      this._b2joint.EnableMotor(v);
    }
  };
  _proto.setMaxMotorTorque = function setMaxMotorTorque(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxMotorTorque(v);
    }
  };
  _proto.setMotorSpeed = function setMotorSpeed(v) {
    if (this._b2joint) {
      this._b2joint.SetMotorSpeed(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new B2.RevoluteJointDef();
    def.localAnchorA = {
      x: comp.anchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.anchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.localAnchorB = {
      x: comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO,
      y: comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO
    };
    def.enableMotor = comp.enableMotor;
    def.maxMotorTorque = comp.maxMotorTorque;
    def.motorSpeed = toRadian(comp.motorSpeed);
    def.enableLimit = comp.enableLimit;
    def.lowerAngle = toRadian(comp.lowerAngle);
    def.upperAngle = toRadian(comp.upperAngle);
    return def;
  };
  return B2HingeJoint;
}(B2Joint);

game.once(Game.EVENT_PRE_SUBSYSTEM_INIT, function () {
  selector.register('box2d-wasm', {
    PhysicsWorld: B2PhysicsWorld,
    RigidBody: B2RigidBody2D,
    BoxShape: B2BoxShape,
    CircleShape: B2CircleShape,
    PolygonShape: B2PolygonShape,
    MouseJoint: B2MouseJoint,
    DistanceJoint: B2DistanceJoint,
    SpringJoint: B2SpringJoint,
    RelativeJoint: B2RelativeJoint,
    SliderJoint: B2SliderJoint,
    FixedJoint: B2FixedJoint,
    WheelJoint: B2WheelJoint,
    HingeJoint: B2HingeJoint
  });
});
function loadWasmModuleBox2D() {
  {
    return Promise.resolve();
  }
}

export { loadWasmModuleBox2D };
//# sourceMappingURL=physics-2d-box2d-wasm.js.map
