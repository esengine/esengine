import { a as ERaycast2DType, b as PHYSICS_2D_PTM_RATIO, P as PhysicsSystem2D, c as ERigidBody2DType, C as Contact2DType, d as Collider2D, R as RigidBody2D, e as ConvexPartition, s as selector } from './physics-2d-framework-CrYpdP1-.js';
import { _ as _inheritsLoose, au as remove, d as CCObjectFlags, k as errorID, a as _createClass, e as warn, W as logID } from './gc-object-CShF5lzx.js';
import b2 from '@cocos/box2d';
import './_virtual_internal_constants-DWlew7Dp.js';
import { V as Vec2, C as Color, f as Vec3, Y as toDegree, Q as Quat, a9 as TWO_PI, a8 as HALF_PI, h as toRadian, m as Rect } from './index-uXI1_UMk.js';
import { f as find } from './prefab-DYg_oxpo.js';
import { N as Node } from './scene-vWcxM1_c.js';
import { L as Layers } from './pipeline-state-manager-C5U4ouGL.js';
import { N as NodeEventType } from './node-event-Ccvtv8bJ.js';
import { g as game, G as Game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import { P as PhysicsGroup } from './collision-matrix-55yq71jP.js';
import './global-exports-DnCP_14L.js';
import './touch-BKrZ-fxl.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './debug-view-BuNhRPv_.js';
import './deprecated-n0w4kK7g.js';

var PhysicsContactListener = function (_b2$ContactListener) {
  function PhysicsContactListener() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _b2$ContactListener.call.apply(_b2$ContactListener, [this].concat(args)) || this;
    _this._contactFixtures = [];
    _this._BeginContact = null;
    _this._EndContact = null;
    _this._PreSolve = null;
    _this._PostSolve = null;
    return _this;
  }
  _inheritsLoose(PhysicsContactListener, _b2$ContactListener);
  var _proto = PhysicsContactListener.prototype;
  _proto.setBeginContact = function setBeginContact(cb) {
    this._BeginContact = cb;
  };
  _proto.setEndContact = function setEndContact(cb) {
    this._EndContact = cb;
  };
  _proto.setPreSolve = function setPreSolve(cb) {
    this._PreSolve = cb;
  };
  _proto.setPostSolve = function setPostSolve(cb) {
    this._PostSolve = cb;
  };
  _proto.BeginContact = function BeginContact(contact) {
    if (!this._BeginContact) return;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    var fixtures = this._contactFixtures;
    contact._shouldReport = false;
    if (fixtures.indexOf(fixtureA) !== -1 || fixtures.indexOf(fixtureB) !== -1) {
      contact._shouldReport = true;
      this._BeginContact(contact);
    }
  };
  _proto.EndContact = function EndContact(contact) {
    if (this._EndContact && contact._shouldReport) {
      contact._shouldReport = false;
      this._EndContact(contact);
    }
  };
  _proto.PreSolve = function PreSolve(contact, oldManifold) {
    if (this._PreSolve && contact._shouldReport) {
      this._PreSolve(contact, oldManifold);
    }
  };
  _proto.PostSolve = function PostSolve(contact, impulse) {
    if (this._PostSolve && contact._shouldReport) {
      this._PostSolve(contact, impulse);
    }
  };
  _proto.registerContactFixture = function registerContactFixture(fixture) {
    this._contactFixtures.push(fixture);
  };
  _proto.unregisterContactFixture = function unregisterContactFixture(fixture) {
    remove(this._contactFixtures, fixture);
  };
  return PhysicsContactListener;
}(b2.ContactListener);

var PhysicsAABBQueryCallback = function (_b2$QueryCallback) {
  function PhysicsAABBQueryCallback() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _b2$QueryCallback.call.apply(_b2$QueryCallback, [this].concat(args)) || this;
    _this._point = new b2.Vec2();
    _this._isPoint = false;
    _this._fixtures = [];
    return _this;
  }
  _inheritsLoose(PhysicsAABBQueryCallback, _b2$QueryCallback);
  var _proto = PhysicsAABBQueryCallback.prototype;
  _proto.init = function init(point) {
    if (point) {
      this._isPoint = true;
      this._point.x = point.x;
      this._point.y = point.y;
    } else {
      this._isPoint = false;
    }
    this._fixtures.length = 0;
  };
  _proto.ReportFixture = function ReportFixture(fixture) {
    if (this._isPoint) {
      if (fixture.TestPoint(this._point)) {
        this._fixtures.push(fixture);
      }
    } else {
      this._fixtures.push(fixture);
    }
    return true;
  };
  _proto.getFixture = function getFixture() {
    return this._fixtures[0];
  };
  _proto.getFixtures = function getFixtures() {
    return this._fixtures;
  };
  return PhysicsAABBQueryCallback;
}(b2.QueryCallback);

var PhysicsRayCastCallback = function (_b2$RayCastCallback) {
  function PhysicsRayCastCallback() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _b2$RayCastCallback.call.apply(_b2$RayCastCallback, [this].concat(args)) || this;
    _this._type = ERaycast2DType.Closest;
    _this._fixtures = [];
    _this._points = [];
    _this._normals = [];
    _this._fractions = [];
    _this._mask = 0xffffffff;
    return _this;
  }
  _inheritsLoose(PhysicsRayCastCallback, _b2$RayCastCallback);
  var _proto = PhysicsRayCastCallback.prototype;
  _proto.init = function init(type, mask) {
    this._type = type;
    this._mask = mask;
    this._fixtures.length = 0;
    this._points.length = 0;
    this._normals.length = 0;
    this._fractions.length = 0;
  };
  _proto.ReportFixture = function ReportFixture(fixture, point, normal, fraction) {
    if ((fixture.GetFilterData().categoryBits & this._mask) === 0) {
      return -1;
    }
    if (this._type === ERaycast2DType.Closest) {
      this._fixtures[0] = fixture;
      this._points[0] = point;
      this._normals[0] = normal;
      this._fractions[0] = fraction;
      return fraction;
    }
    this._fixtures.push(fixture);
    this._points.push(new Vec2(point.x, point.y));
    this._normals.push(new Vec2(normal.x, normal.y));
    this._fractions.push(fraction);
    if (this._type === ERaycast2DType.Any) {
      return 0;
    } else if (this._type >= ERaycast2DType.All) {
      return 1;
    }
    return fraction;
  };
  _proto.getFixtures = function getFixtures() {
    return this._fixtures;
  };
  _proto.getPoints = function getPoints() {
    return this._points;
  };
  _proto.getNormals = function getNormals() {
    return this._normals;
  };
  _proto.getFractions = function getFractions() {
    return this._fractions;
  };
  return PhysicsRayCastCallback;
}(b2.RayCastCallback);

var pools = [];
var pointCache = [new Vec2(), new Vec2()];
var b2worldmanifold = new b2.WorldManifold();
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
    this._impulse = null;
    this._inverted = false;
    this._b2contact = null;
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
    var c = b2contact.m_userData;
    if (!c) return;
    pools.push(c);
    c.reset();
  };
  var _proto = PhysicsContact.prototype;
  _proto._setImpulse = function _setImpulse(impulse) {
    this._impulse = impulse;
  };
  _proto.init = function init(b2contact) {
    this.colliderA = b2contact.m_fixtureA.m_userData.collider;
    this.colliderB = b2contact.m_fixtureB.m_userData.collider;
    this.disabled = false;
    this.disabledOnce = false;
    this._impulse = null;
    this._inverted = false;
    this._b2contact = b2contact;
    b2contact.m_userData = this;
  };
  _proto.reset = function reset() {
    this.setTangentSpeed(0);
    this.resetFriction();
    this.resetRestitution();
    this.colliderA = null;
    this.colliderB = null;
    this.disabled = false;
    this._impulse = null;
    this._b2contact.m_userData = null;
    this._b2contact = null;
  };
  _proto.getWorldManifold = function getWorldManifold() {
    var points = worldmanifold.points;
    var separations = worldmanifold.separations;
    var normal = worldmanifold.normal;
    this._b2contact.GetWorldManifold(b2worldmanifold);
    var b2points = b2worldmanifold.points;
    var b2separations = b2worldmanifold.separations;
    var count = this._b2contact.GetManifold().pointCount;
    points.length = separations.length = count;
    for (var i = 0; i < count; i++) {
      var p = pointCache[i];
      p.x = b2points[i].x * PHYSICS_2D_PTM_RATIO;
      p.y = b2points[i].y * PHYSICS_2D_PTM_RATIO;
      points[i] = p;
      separations[i] = b2separations[i] * PHYSICS_2D_PTM_RATIO;
    }
    normal.x = b2worldmanifold.normal.x;
    normal.y = b2worldmanifold.normal.y;
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
    var b2manifold = this._b2contact.GetManifold();
    var b2points = b2manifold.points;
    var count = points.length = b2manifold.pointCount;
    for (var i = 0; i < count; i++) {
      var p = manifoldPointCache[i];
      var b2p = b2points[i];
      p.localPoint.x = b2p.localPoint.x * PHYSICS_2D_PTM_RATIO;
      p.localPoint.y = b2p.localPoint.y * PHYSICS_2D_PTM_RATIO;
      p.normalImpulse = b2p.normalImpulse * PHYSICS_2D_PTM_RATIO;
      p.tangentImpulse = b2p.tangentImpulse;
      points[i] = p;
    }
    localPoint.x = b2manifold.localPoint.x * PHYSICS_2D_PTM_RATIO;
    localPoint.y = b2manifold.localPoint.y * PHYSICS_2D_PTM_RATIO;
    localNormal.x = b2manifold.localNormal.x;
    localNormal.y = b2manifold.localNormal.y;
    manifold.type = b2manifold.type;
    if (this._inverted) {
      localNormal.x *= -1;
      localNormal.y *= -1;
    }
    return manifold;
  };
  _proto.getImpulse = function getImpulse() {
    var b2impulse = this._impulse;
    if (!b2impulse) return null;
    var normalImpulses = impulse.normalImpulses;
    var tangentImpulses = impulse.tangentImpulses;
    var count = b2impulse.count;
    for (var i = 0; i < count; i++) {
      normalImpulses[i] = b2impulse.normalImpulses[i] * PHYSICS_2D_PTM_RATIO;
      tangentImpulses[i] = b2impulse.tangentImpulses[i];
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
    this._b2contact.SetEnabled(value);
  };
  _proto.isTouching = function isTouching() {
    return this._b2contact.IsTouching();
  };
  _proto.setTangentSpeed = function setTangentSpeed(value) {
    this._b2contact.SetTangentSpeed(value);
  };
  _proto.getTangentSpeed = function getTangentSpeed() {
    return this._b2contact.GetTangentSpeed();
  };
  _proto.setFriction = function setFriction(value) {
    this._b2contact.SetFriction(value);
  };
  _proto.getFriction = function getFriction() {
    return this._b2contact.GetFriction();
  };
  _proto.resetFriction = function resetFriction() {
    return this._b2contact.ResetFriction();
  };
  _proto.setRestitution = function setRestitution(value) {
    this._b2contact.SetRestitution(value);
  };
  _proto.getRestitution = function getRestitution() {
    return this._b2contact.GetRestitution();
  };
  _proto.resetRestitution = function resetRestitution() {
    return this._b2contact.ResetRestitution();
  };
  return PhysicsContact;
}();

var _tmp_vec2 = new b2.Vec2();
var _tmp_color = new Color();
var GREEN_COLOR = Color.GREEN;
var RED_COLOR = Color.RED;
var PhysicsDebugDraw = function (_b2$Draw) {
  function PhysicsDebugDraw(drawer) {
    var _this;
    _this = _b2$Draw.call(this) || this;
    _this._drawer = null;
    _this._xf = new b2.Transform();
    _this._dxf = new b2.Transform();
    _this._drawer = drawer;
    return _this;
  }
  _inheritsLoose(PhysicsDebugDraw, _b2$Draw);
  var _proto = PhysicsDebugDraw.prototype;
  _proto._DrawPolygon = function _DrawPolygon(vertices, vertexCount) {
    var drawer = this._drawer;
    for (var i = 0; i < vertexCount; i++) {
      b2.Transform.MulXV(this._xf, vertices[i], _tmp_vec2);
      var x = _tmp_vec2.x * PHYSICS_2D_PTM_RATIO;
      var y = _tmp_vec2.y * PHYSICS_2D_PTM_RATIO;
      if (i === 0) drawer.moveTo(x, y);else {
        drawer.lineTo(x, y);
      }
    }
    drawer.close();
  };
  _proto.DrawPolygon = function DrawPolygon(vertices, vertexCount, color) {
    this._applyStrokeColor(color);
    this._DrawPolygon(vertices, vertexCount);
    this._drawer.stroke();
  };
  _proto.DrawSolidPolygon = function DrawSolidPolygon(vertices, vertexCount, color) {
    this._applyFillColor(color);
    this._DrawPolygon(vertices, vertexCount);
    this._drawer.fill();
    this._drawer.stroke();
  };
  _proto._DrawCircle = function _DrawCircle(center, radius) {
    b2.Transform.MulXV(this._xf, center, _tmp_vec2);
    this._drawer.circle(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO, radius * PHYSICS_2D_PTM_RATIO);
  };
  _proto.DrawCircle = function DrawCircle(center, radius, color) {
    this._applyStrokeColor(color);
    this._DrawCircle(center, radius);
    this._drawer.stroke();
  };
  _proto.DrawSolidCircle = function DrawSolidCircle(center, radius, axis, color) {
    this._applyFillColor(color);
    this._DrawCircle(center, radius);
    this._drawer.fill();
  };
  _proto.DrawSegment = function DrawSegment(p1, p2, color) {
    var drawer = this._drawer;
    if (p1.x === p2.x && p1.y === p2.y) {
      this._applyFillColor(color);
      this._DrawCircle(p1, 2 / PHYSICS_2D_PTM_RATIO);
      drawer.fill();
      return;
    }
    this._applyStrokeColor(color);
    b2.Transform.MulXV(this._xf, p1, _tmp_vec2);
    drawer.moveTo(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO);
    b2.Transform.MulXV(this._xf, p2, _tmp_vec2);
    drawer.lineTo(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO);
    drawer.stroke();
  };
  _proto.DrawTransform = function DrawTransform(xf) {
    var drawer = this._drawer;
    drawer.strokeColor = RED_COLOR;
    _tmp_vec2.x = _tmp_vec2.y = 0;
    b2.Transform.MulXV(xf, _tmp_vec2, _tmp_vec2);
    drawer.moveTo(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO);
    _tmp_vec2.x = 1;
    _tmp_vec2.y = 0;
    b2.Transform.MulXV(xf, _tmp_vec2, _tmp_vec2);
    drawer.lineTo(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO);
    drawer.stroke();
    drawer.strokeColor = GREEN_COLOR;
    _tmp_vec2.x = _tmp_vec2.y = 0;
    b2.Transform.MulXV(xf, _tmp_vec2, _tmp_vec2);
    drawer.moveTo(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO);
    _tmp_vec2.x = 0;
    _tmp_vec2.y = 1;
    b2.Transform.MulXV(xf, _tmp_vec2, _tmp_vec2);
    drawer.lineTo(_tmp_vec2.x * PHYSICS_2D_PTM_RATIO, _tmp_vec2.y * PHYSICS_2D_PTM_RATIO);
    drawer.stroke();
  };
  _proto.DrawPoint = function DrawPoint(center, radius, color) {};
  _proto.DrawParticles = function DrawParticles() {};
  _proto._applyStrokeColor = function _applyStrokeColor(color) {
    this._drawer.strokeColor = _tmp_color.set(color.r * 255, color.g * 255, color.b * 255, 150);
  };
  _proto._applyFillColor = function _applyFillColor(color) {
    this._drawer.fillColor = _tmp_color.set(color.r * 255, color.g * 255, color.b * 255, 150);
  };
  _proto.PushTransform = function PushTransform(xf) {
    this._xf = xf;
  };
  _proto.PopTransform = function PopTransform() {
    this._xf = this._dxf;
  };
  return PhysicsDebugDraw;
}(b2.Draw);

var tempVec3$1 = new Vec3();
var tempVec2_1$1 = new Vec2();
var tempVec2_2 = new Vec2();
var temoBodyDef = new b2.BodyDef();
var tempB2AABB = new b2.AABB();
var testResults = [];
var b2PhysicsWorld = function () {
  function b2PhysicsWorld() {
    this._world = void 0;
    this._bodies = [];
    this._animatedBodies = [];
    this._rotationAxis = new Vec3();
    this._physicsGroundBody = void 0;
    this._contactListener = void 0;
    this._aabbQueryCallback = void 0;
    this._raycastQueryCallback = void 0;
    this._debugGraphics = null;
    this._b2DebugDrawer = null;
    this._debugDrawFlags = 0;
    this._world = new b2.World(new b2.Vec2(0, -10));
    var tempBodyDef = new b2.BodyDef();
    this._physicsGroundBody = this._world.CreateBody(tempBodyDef);
    var listener = new PhysicsContactListener();
    listener.setBeginContact(this._onBeginContact);
    listener.setEndContact(this._onEndContact);
    listener.setPreSolve(this._onPreSolve);
    listener.setPostSolve(this._onPostSolve);
    this._world.SetContactListener(listener);
    this._contactListener = listener;
    this._aabbQueryCallback = new PhysicsAABBQueryCallback();
    this._raycastQueryCallback = new PhysicsRayCastCallback();
  }
  var _proto = b2PhysicsWorld.prototype;
  _proto._checkDebugDrawValid = function _checkDebugDrawValid() {
    if (!this._debugGraphics || !this._debugGraphics.isValid) {
      var canvas = find('Canvas');
      if (!canvas) {
        var scene = director.getScene();
        if (!scene) {
          return;
        }
        canvas = new Node('Canvas');
        canvas.addComponent('cc.Canvas');
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
        var debugDraw = new PhysicsDebugDraw(this._debugGraphics);
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
    tempVec2_2.x = p2.x / PHYSICS_2D_PTM_RATIO;
    tempVec2_2.y = p2.y / PHYSICS_2D_PTM_RATIO;
    var callback = this._raycastQueryCallback;
    callback.init(type, mask);
    this._world.RayCast(callback, tempVec2_1$1, tempVec2_2);
    var fixtures = callback.getFixtures();
    if (fixtures.length > 0) {
      var points = callback.getPoints();
      var normals = callback.getNormals();
      var fractions = callback.getFractions();
      var results = [];
      for (var i = 0, l = fixtures.length; i < l; i++) {
        var fixture = fixtures[i];
        var shape = fixture.m_userData;
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
    var bodyDef = temoBodyDef;
    var comp = body.rigidBody;
    bodyDef.allowSleep = comp.allowSleep;
    bodyDef.gravityScale = comp.gravityScale;
    bodyDef.linearDamping = comp.linearDamping;
    bodyDef.angularDamping = comp.angularDamping;
    bodyDef.fixedRotation = comp.fixedRotation;
    bodyDef.bullet = comp.bullet;
    var node = comp.node;
    var pos = node.worldPosition;
    bodyDef.position.Set(pos.x / PHYSICS_2D_PTM_RATIO, pos.y / PHYSICS_2D_PTM_RATIO);
    tempVec3$1.z = Quat.getAxisAngle(this._rotationAxis, node.worldRotation);
    if (this._rotationAxis.z < 0.0) {
      tempVec3$1.z = Math.PI * 2 - tempVec3$1.z;
    }
    bodyDef.angle = tempVec3$1.z;
    bodyDef.awake = comp.awakeOnLoad;
    if (comp.type === ERigidBody2DType.Animated) {
      bodyDef.type = ERigidBody2DType.Kinematic;
      this._animatedBodies.push(body);
      body._animatedPos.set(bodyDef.position.x, bodyDef.position.y);
      body._animatedAngle = bodyDef.angle;
    } else {
      bodyDef.type = comp.type;
    }
    var compPrivate = comp;
    var linearVelocity = compPrivate._linearVelocity;
    bodyDef.linearVelocity.Set(linearVelocity.x, linearVelocity.y);
    bodyDef.angularVelocity = compPrivate._angularVelocity;
    var b2Body = this._world.CreateBody(bodyDef);
    b2Body.m_userData = body;
    body._imp = b2Body;
    this._bodies.push(body);
  };
  _proto.removeBody = function removeBody(body) {
    if (!this._bodies.includes(body)) {
      return;
    }
    if (body.impl) {
      body.impl.m_userData = null;
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
    tempB2AABB.lowerBound.x = x - d;
    tempB2AABB.lowerBound.y = y - d;
    tempB2AABB.upperBound.x = x + d;
    tempB2AABB.upperBound.y = y + d;
    var callback = this._aabbQueryCallback;
    callback.init(tempVec2_1$1);
    this._world.QueryAABB(callback, tempB2AABB);
    var fixtures = callback.getFixtures();
    testResults.length = 0;
    for (var i = 0; i < fixtures.length; i++) {
      var collider = fixtures[i].m_userData.collider;
      if (!testResults.includes(collider)) {
        testResults.push(collider);
      }
    }
    return testResults;
  };
  _proto.testAABB = function testAABB(rect) {
    tempB2AABB.lowerBound.x = rect.xMin / PHYSICS_2D_PTM_RATIO;
    tempB2AABB.lowerBound.y = rect.yMin / PHYSICS_2D_PTM_RATIO;
    tempB2AABB.upperBound.x = rect.xMax / PHYSICS_2D_PTM_RATIO;
    tempB2AABB.upperBound.y = rect.yMax / PHYSICS_2D_PTM_RATIO;
    var callback = this._aabbQueryCallback;
    callback.init();
    this._world.QueryAABB(callback, tempB2AABB);
    var fixtures = callback.getFixtures();
    testResults.length = 0;
    for (var i = 0; i < fixtures.length; i++) {
      var collider = fixtures[i].m_userData.collider;
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
    this._world.DrawDebugData();
  };
  _proto._onBeginContact = function _onBeginContact(b2contact) {
    var c = PhysicsContact.get(b2contact);
    c.emit(Contact2DType.BEGIN_CONTACT);
  };
  _proto._onEndContact = function _onEndContact(b2contact) {
    var c = b2contact.m_userData;
    if (!c) {
      return;
    }
    c.emit(Contact2DType.END_CONTACT);
    PhysicsContact.put(b2contact);
  };
  _proto._onPreSolve = function _onPreSolve(b2contact) {
    var c = b2contact.m_userData;
    if (!c) {
      return;
    }
    c.emit(Contact2DType.PRE_SOLVE);
  };
  _proto._onPostSolve = function _onPostSolve(b2contact, impulse) {
    var c = b2contact.m_userData;
    if (!c) {
      return;
    }
    c._setImpulse(impulse);
    c.emit(Contact2DType.POST_SOLVE);
    c._setImpulse(null);
  };
  return _createClass(b2PhysicsWorld, [{
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
var tempVec2_1 = new b2.Vec2();
var b2RigidBody2D = function () {
  function b2RigidBody2D() {
    this._animatedPos = new Vec2();
    this._animatedAngle = 0;
    this._body = null;
    this._rigidBody = void 0;
    this._inited = false;
  }
  var _proto = b2RigidBody2D.prototype;
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
    if (!this._inited) return;
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
    var temp;
    var bodyType = this._rigidBody.type;
    if (bodyType === ERigidBody2DType.Animated) {
      temp = b2body.GetLinearVelocity();
    } else {
      temp = b2body.GetPosition();
    }
    temp.x = pos.x / PHYSICS_2D_PTM_RATIO;
    temp.y = pos.y / PHYSICS_2D_PTM_RATIO;
    if (bodyType === ERigidBody2DType.Animated && enableAnimated) {
      this._animatedPos.set(temp.x, temp.y);
    } else {
      b2body.SetTransformVec(temp, b2body.GetAngle());
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
      b2body.SetTransformVec(b2body.GetPosition(), rotation);
    }
  };
  _proto.resetVelocity = function resetVelocity() {
    var b2body = this._body;
    if (!b2body) return;
    var temp = b2body.m_linearVelocity;
    temp.Set(0, 0);
    b2body.SetLinearVelocity(temp);
    b2body.SetAngularVelocity(0);
  };
  _proto.setType = function setType(v) {
    PhysicsSystem2D.instance.physicsWorld._updateBodyType(this);
    this._body.SetType(v);
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
    return this._body.IsActive();
  };
  _proto.setActive = function setActive(v) {
    if (!this._body.m_world.IsLocked()) {
      this._body.SetActive(v);
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
    tempVec2_1.Set(worldPoint.x / PHYSICS_2D_PTM_RATIO, worldPoint.y / PHYSICS_2D_PTM_RATIO);
    this._body.GetLinearVelocityFromWorldPoint(tempVec2_1, out);
    out.x *= PHYSICS_2D_PTM_RATIO;
    out.y *= PHYSICS_2D_PTM_RATIO;
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
    tempVec2_1.Set(worldVector.x / PHYSICS_2D_PTM_RATIO, worldVector.y / PHYSICS_2D_PTM_RATIO);
    this._body.GetLocalVector(tempVec2_1, out);
    out.x *= PHYSICS_2D_PTM_RATIO;
    out.y *= PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getWorldVector = function getWorldVector(localVector, out) {
    tempVec2_1.Set(localVector.x / PHYSICS_2D_PTM_RATIO, localVector.y / PHYSICS_2D_PTM_RATIO);
    this._body.GetWorldVector(tempVec2_1, out);
    out.x *= PHYSICS_2D_PTM_RATIO;
    out.y *= PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getLocalPoint = function getLocalPoint(worldPoint, out) {
    out = out || new Vec2();
    tempVec2_1.Set(worldPoint.x / PHYSICS_2D_PTM_RATIO, worldPoint.y / PHYSICS_2D_PTM_RATIO);
    this._body.GetLocalPoint(tempVec2_1, out);
    out.x *= PHYSICS_2D_PTM_RATIO;
    out.y *= PHYSICS_2D_PTM_RATIO;
    return out;
  };
  _proto.getWorldPoint = function getWorldPoint(localPoint, out) {
    out = out || new Vec2();
    tempVec2_1.Set(localPoint.x / PHYSICS_2D_PTM_RATIO, localPoint.y / PHYSICS_2D_PTM_RATIO);
    this._body.GetWorldPoint(tempVec2_1, out);
    out.x *= PHYSICS_2D_PTM_RATIO;
    out.y *= PHYSICS_2D_PTM_RATIO;
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
      tempVec2_1.Set(point.x / PHYSICS_2D_PTM_RATIO, point.y / PHYSICS_2D_PTM_RATIO);
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
      tempVec2_1.Set(point.x / PHYSICS_2D_PTM_RATIO, point.y / PHYSICS_2D_PTM_RATIO);
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
  return _createClass(b2RigidBody2D, [{
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

var tempFilter = new b2.Filter();
var lowerBound = new b2.Vec2();
var upperBound = new b2.Vec2();
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
var b2Shape2D = function () {
  function b2Shape2D() {
    this._shapes = [];
    this._fixtures = [];
    this._collider = null;
    this._body = null;
    this._inited = false;
    this._rect = new Rect();
  }
  var _proto = b2Shape2D.prototype;
  _proto.initialize = function initialize(comp) {
    this._collider = comp;
  };
  _proto.onLoad = function onLoad() {};
  _proto.onEnable = function onEnable() {
    PhysicsSystem2D.instance._callAfterStep(this, this._init);
  };
  _proto.onDisable = function onDisable() {
    PhysicsSystem2D.instance._callAfterStep(this, this._destroy);
  };
  _proto.start = function start() {};
  _proto.onGroupChanged = function onGroupChanged() {
    var filter = getFilter(this);
    this._fixtures.forEach(function (f) {
      f.SetFilterData(filter);
    });
  };
  _proto.apply = function apply() {
    this._destroy();
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
      var fixDef = {
        density: comp.density,
        isSensor: comp.sensor,
        friction: comp.friction,
        restitution: comp.restitution,
        shape: shape,
        filter: filter
      };
      var fixture = this._body.CreateFixture(fixDef);
      fixture.m_userData = this;
      if (body != null && body.enabledContactListener) {
        PhysicsSystem2D.instance.physicsWorld.registerContactFixture(fixture);
      }
      this._shapes.push(shape);
      this._fixtures.push(fixture);
    }
    this._inited = true;
  };
  _proto._destroy = function _destroy() {
    if (!this._inited) return;
    var fixtures = this._fixtures;
    var body = this._body;
    for (var i = fixtures.length - 1; i >= 0; i--) {
      var fixture = fixtures[i];
      fixture.m_userData = null;
      PhysicsSystem2D.instance.physicsWorld.unregisterContactFixture(fixture);
      if (body) {
        body.DestroyFixture(fixture);
      }
    }
    this._body = null;
    this._fixtures.length = 0;
    this._shapes.length = 0;
    this._inited = false;
  };
  return _createClass(b2Shape2D, [{
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
        var count = fixture.GetShape().GetChildCount();
        for (var j = 0; j < count; j++) {
          lowerBound.Copy(fixture.GetAABB(j).lowerBound);
          upperBound.Copy(fixture.GetAABB(j).upperBound);
          if (fixture.GetShape().m_type === 2) {
            var skinWidth = fixture.GetShape().m_radius;
            lowerBound.SelfAddXY(skinWidth, skinWidth);
            upperBound.SelfSubXY(skinWidth, skinWidth);
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
var b2BoxShape = function (_b2Shape2D) {
  function b2BoxShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _b2Shape2D.call.apply(_b2Shape2D, [this].concat(args)) || this;
    _this._worldPoints = [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
    return _this;
  }
  _inheritsLoose(b2BoxShape, _b2Shape2D);
  var _proto = b2BoxShape.prototype;
  _proto._createShapes = function _createShapes(scaleX, scaleY, relativePositionX, relativePositionY) {
    scaleX = Math.abs(scaleX);
    scaleY = Math.abs(scaleY);
    var comp = this.collider;
    var width = comp.size.width / 2 / PHYSICS_2D_PTM_RATIO * scaleX;
    var height = comp.size.height / 2 / PHYSICS_2D_PTM_RATIO * scaleY;
    var offsetX = (relativePositionX + comp.offset.x * scaleX) / PHYSICS_2D_PTM_RATIO;
    var offsetY = (relativePositionY + comp.offset.y * scaleY) / PHYSICS_2D_PTM_RATIO;
    var shape = new b2.PolygonShape();
    shape.SetAsBox(width, height, new b2.Vec2(offsetX, offsetY), 0);
    return [shape];
  };
  return _createClass(b2BoxShape, [{
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
}(b2Shape2D);

var b2CircleShape = function (_b2Shape2D) {
  function b2CircleShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _b2Shape2D.call.apply(_b2Shape2D, [this].concat(args)) || this;
    _this._worldPosition = new Vec2();
    return _this;
  }
  _inheritsLoose(b2CircleShape, _b2Shape2D);
  var _proto = b2CircleShape.prototype;
  _proto._createShapes = function _createShapes(scaleX, scaleY, relativePositionX, relativePositionY) {
    scaleX = Math.abs(scaleX);
    scaleY = Math.abs(scaleY);
    var comp = this.collider;
    var offsetX = (relativePositionX + comp.offset.x * scaleX) / PHYSICS_2D_PTM_RATIO;
    var offsetY = (relativePositionY + comp.offset.y * scaleY) / PHYSICS_2D_PTM_RATIO;
    var shape = new b2.CircleShape();
    shape.m_radius = comp.radius / PHYSICS_2D_PTM_RATIO * scaleX;
    shape.m_p.Set(offsetX, offsetY);
    return [shape];
  };
  return _createClass(b2CircleShape, [{
    key: "worldRadius",
    get: function get() {
      return this._shapes[0].m_radius * PHYSICS_2D_PTM_RATIO;
    }
  }, {
    key: "worldPosition",
    get: function get() {
      var p = this._shapes[0].m_p;
      return this._worldPosition.set(p.x * PHYSICS_2D_PTM_RATIO, p.y * PHYSICS_2D_PTM_RATIO);
    }
  }]);
}(b2Shape2D);

var b2PolygonShape = function (_b2Shape2D) {
  function b2PolygonShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _b2Shape2D.call.apply(_b2Shape2D, [this].concat(args)) || this;
    _this._worldPoints = [];
    return _this;
  }
  _inheritsLoose(b2PolygonShape, _b2Shape2D);
  var _proto = b2PolygonShape.prototype;
  _proto._createShapes = function _createShapes(scaleX, scaleY, relativePositionX, relativePositionY) {
    var shapes = [];
    var comp = this.collider;
    var points = comp.points;
    if (points.length > 0 && points[0].equals(points[points.length - 1])) {
      points.length -= 1;
    }
    var polys = ConvexPartition(points);
    if (!polys) {
      logID(16408, comp.node.name);
      return shapes;
    }
    var offset = comp.offset;
    for (var i = 0; i < polys.length; i++) {
      var poly = polys[i];
      var shape = null;
      var vertices = [];
      var firstVertice = null;
      for (var j = 0, l = poly.length; j < l; j++) {
        if (!shape) {
          shape = new b2.PolygonShape();
        }
        var p = poly[j];
        var x = (relativePositionX + (p.x + offset.x) * scaleX) / PHYSICS_2D_PTM_RATIO;
        var y = (relativePositionY + (p.y + offset.y) * scaleY) / PHYSICS_2D_PTM_RATIO;
        var v = new b2.Vec2(x, y);
        vertices.push(v);
        if (!firstVertice) {
          firstVertice = v;
        }
        if (vertices.length === b2.maxPolygonVertices) {
          shape.Set(vertices, vertices.length);
          shapes.push(shape);
          shape = null;
          if (j < l - 1) {
            vertices = [firstVertice, vertices[vertices.length - 1]];
          }
        }
      }
      if (shape) {
        shape.Set(vertices, vertices.length);
        shapes.push(shape);
      }
    }
    return shapes;
  };
  return _createClass(b2PolygonShape, [{
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
}(b2Shape2D);

var b2Joint = function () {
  function b2Joint() {
    this._b2joint = null;
    this._jointComp = null;
    this._body = null;
    this._inited = false;
  }
  var _proto = b2Joint.prototype;
  _proto.initialize = function initialize(comp) {
    this._jointComp = comp;
  };
  _proto.onEnable = function onEnable() {
    PhysicsSystem2D.instance._callAfterStep(this, this._init);
  };
  _proto.onDisable = function onDisable() {
    PhysicsSystem2D.instance._callAfterStep(this, this._destroy);
  };
  _proto.start = function start() {
    PhysicsSystem2D.instance._callAfterStep(this, this._init);
  };
  _proto.apply = function apply() {
    PhysicsSystem2D.instance._callAfterStep(this, this._destroy);
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
    var def = this._createJointDef();
    if (!def) {
      return;
    }
    def.bodyA = this._body.impl.impl;
    var connectedBody = comp.connectedBody;
    if (connectedBody && !connectedBody.enabledInHierarchy) {
      return;
    }
    if (!connectedBody) {
      def.bodyB = PhysicsSystem2D.instance.physicsWorld.groundBodyImpl;
    } else {
      def.bodyB = connectedBody.impl.impl;
    }
    def.collideConnected = comp.collideConnected;
    this._b2joint = PhysicsSystem2D.instance.physicsWorld.impl.CreateJoint(def);
    this._inited = true;
  };
  _proto._destroy = function _destroy() {
    if (!this._inited) return;
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
  return _createClass(b2Joint, [{
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

var tempB2Vec2 = new b2.Vec2();
var b2MouseJoint = function (_b2Joint) {
  function b2MouseJoint() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _b2Joint.call.apply(_b2Joint, [this].concat(args)) || this;
    _this._touchPoint = new Vec2();
    _this._isTouched = false;
    return _this;
  }
  _inheritsLoose(b2MouseJoint, _b2Joint);
  var _proto = b2MouseJoint.prototype;
  _proto.setTarget = function setTarget(v) {
    if (this._b2joint) {
      tempB2Vec2.x = v.x / PHYSICS_2D_PTM_RATIO;
      tempB2Vec2.y = v.y / PHYSICS_2D_PTM_RATIO;
      this._b2joint.SetTarget(tempB2Vec2);
    }
  };
  _proto.setDampingRatio = function setDampingRatio(v) {
    if (this._b2joint) {
      this._b2joint.SetDampingRatio(v);
    }
  };
  _proto.setFrequency = function setFrequency(v) {
    if (this._b2joint) {
      this._b2joint.SetFrequency(v);
    }
  };
  _proto.setMaxForce = function setMaxForce(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxForce(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var def = new b2.MouseJointDef();
    var comp = this._jointComp;
    def.target.Set(this._touchPoint.x / PHYSICS_2D_PTM_RATIO, this._touchPoint.y / PHYSICS_2D_PTM_RATIO);
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
    _b2Joint.prototype.onDisable.call(this);
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
    this._destroy();
    this._isTouched = false;
  };
  _proto.update = function update() {
    if (!this._isTouched || !this.isValid()) {
      return;
    }
    this.setTarget(this._touchPoint);
  };
  return b2MouseJoint;
}(b2Joint);

var b2DistanceJoint = function (_b2Joint) {
  function b2DistanceJoint() {
    return _b2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(b2DistanceJoint, _b2Joint);
  var _proto = b2DistanceJoint.prototype;
  _proto.setMaxLength = function setMaxLength(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxLength(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new b2.RopeJointDef();
    def.localAnchorA.Set(comp.anchor.x / PHYSICS_2D_PTM_RATIO, comp.anchor.y / PHYSICS_2D_PTM_RATIO);
    def.localAnchorB.Set(comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO, comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO);
    def.maxLength = comp.maxLength / PHYSICS_2D_PTM_RATIO;
    return def;
  };
  return b2DistanceJoint;
}(b2Joint);

var b2SpringJoint = function (_b2Joint) {
  function b2SpringJoint() {
    return _b2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(b2SpringJoint, _b2Joint);
  var _proto = b2SpringJoint.prototype;
  _proto.setDampingRatio = function setDampingRatio(v) {
    if (this._b2joint) {
      this._b2joint.SetDampingRatio(v);
    }
  };
  _proto.setFrequency = function setFrequency(v) {
    if (this._b2joint) {
      this._b2joint.SetFrequency(v);
    }
  };
  _proto.setDistance = function setDistance(v) {
    if (this._b2joint) {
      this._b2joint.SetLength(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new b2.DistanceJointDef();
    def.localAnchorA.Set(comp.anchor.x / PHYSICS_2D_PTM_RATIO, comp.anchor.y / PHYSICS_2D_PTM_RATIO);
    def.localAnchorB.Set(comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO, comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO);
    def.length = comp.distance / PHYSICS_2D_PTM_RATIO;
    def.dampingRatio = comp.dampingRatio;
    def.frequencyHz = comp.frequency;
    return def;
  };
  return b2SpringJoint;
}(b2Joint);

var b2RelativeJoint = function (_b2Joint) {
  function b2RelativeJoint() {
    return _b2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(b2RelativeJoint, _b2Joint);
  var _proto = b2RelativeJoint.prototype;
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
      this._b2joint.SetLinearOffset(new b2.Vec2(v.x / PHYSICS_2D_PTM_RATIO, v.y / PHYSICS_2D_PTM_RATIO));
    }
  };
  _proto.setCorrectionFactor = function setCorrectionFactor(v) {
    if (this._b2joint) {
      this._b2joint.m_correctionFactor = v;
    }
  };
  _proto.setMaxTorque = function setMaxTorque(v) {
    if (this._b2joint) {
      this._b2joint.SetMaxTorque(v);
    }
  };
  _proto._createJointDef = function _createJointDef() {
    var comp = this._jointComp;
    var def = new b2.MotorJointDef();
    def.linearOffset.Set(comp.linearOffset.x / PHYSICS_2D_PTM_RATIO, comp.linearOffset.y / PHYSICS_2D_PTM_RATIO);
    def.angularOffset = toRadian(comp.angularOffset);
    def.maxForce = comp.maxForce;
    def.maxTorque = comp.maxTorque;
    def.correctionFactor = comp.correctionFactor;
    return def;
  };
  return b2RelativeJoint;
}(b2Joint);

var b2SliderJoint = function (_b2Joint) {
  function b2SliderJoint() {
    return _b2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(b2SliderJoint, _b2Joint);
  var _proto = b2SliderJoint.prototype;
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
    var def = new b2.PrismaticJointDef();
    def.localAnchorA.Set(comp.anchor.x / PHYSICS_2D_PTM_RATIO, comp.anchor.y / PHYSICS_2D_PTM_RATIO);
    def.localAnchorB.Set(comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO, comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO);
    var angle = toRadian(comp.angle);
    def.localAxisA.Set(Math.cos(angle), Math.sin(angle));
    def.referenceAngle = 0;
    def.enableLimit = comp.enableLimit;
    def.lowerTranslation = comp.lowerLimit / PHYSICS_2D_PTM_RATIO;
    def.upperTranslation = comp.upperLimit / PHYSICS_2D_PTM_RATIO;
    def.enableMotor = comp.enableMotor;
    def.maxMotorForce = comp.maxMotorForce;
    def.motorSpeed = comp.motorSpeed;
    return def;
  };
  return b2SliderJoint;
}(b2Joint);

var b2FixedJoint = function (_b2Joint) {
  function b2FixedJoint() {
    return _b2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(b2FixedJoint, _b2Joint);
  var _proto = b2FixedJoint.prototype;
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
    var def = new b2.WeldJointDef();
    def.localAnchorA.Set(comp.anchor.x / PHYSICS_2D_PTM_RATIO, comp.anchor.y / PHYSICS_2D_PTM_RATIO);
    def.localAnchorB.Set(comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO, comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO);
    def.referenceAngle = 0;
    def.frequencyHz = comp.frequency;
    def.dampingRatio = comp.dampingRatio;
    return def;
  };
  return b2FixedJoint;
}(b2Joint);

var b2WheelJoint = function (_b2Joint) {
  function b2WheelJoint() {
    return _b2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(b2WheelJoint, _b2Joint);
  var _proto = b2WheelJoint.prototype;
  _proto.setDampingRatio = function setDampingRatio(v) {
    if (this._b2joint) {
      this._b2joint.SetSpringDampingRatio(v);
    }
  };
  _proto.setFrequency = function setFrequency(v) {
    if (this._b2joint) {
      this._b2joint.SetSpringFrequencyHz(v);
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
    var def = new b2.WheelJointDef();
    def.localAnchorA.Set(comp.anchor.x / PHYSICS_2D_PTM_RATIO, comp.anchor.y / PHYSICS_2D_PTM_RATIO);
    def.localAnchorB.Set(comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO, comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO);
    var angle = toRadian(comp.angle);
    def.localAxisA.Set(Math.cos(angle), Math.sin(angle));
    def.maxMotorTorque = comp.maxMotorTorque;
    def.motorSpeed = toRadian(comp.motorSpeed);
    def.enableMotor = comp.enableMotor;
    def.dampingRatio = comp.dampingRatio;
    def.frequencyHz = comp.frequency;
    return def;
  };
  return b2WheelJoint;
}(b2Joint);

var b2HingeJoint = function (_b2Joint) {
  function b2HingeJoint() {
    return _b2Joint.apply(this, arguments) || this;
  }
  _inheritsLoose(b2HingeJoint, _b2Joint);
  var _proto = b2HingeJoint.prototype;
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
    var def = new b2.RevoluteJointDef();
    def.localAnchorA.Set(comp.anchor.x / PHYSICS_2D_PTM_RATIO, comp.anchor.y / PHYSICS_2D_PTM_RATIO);
    def.localAnchorB.Set(comp.connectedAnchor.x / PHYSICS_2D_PTM_RATIO, comp.connectedAnchor.y / PHYSICS_2D_PTM_RATIO);
    def.enableMotor = comp.enableMotor;
    def.maxMotorTorque = comp.maxMotorTorque;
    def.motorSpeed = toRadian(comp.motorSpeed);
    def.enableLimit = comp.enableLimit;
    def.lowerAngle = toRadian(comp.lowerAngle);
    def.upperAngle = toRadian(comp.upperAngle);
    return def;
  };
  return b2HingeJoint;
}(b2Joint);

game.once(Game.EVENT_PRE_SUBSYSTEM_INIT, function () {
  selector.register('box2d', {
    PhysicsWorld: b2PhysicsWorld,
    RigidBody: b2RigidBody2D,
    BoxShape: b2BoxShape,
    CircleShape: b2CircleShape,
    PolygonShape: b2PolygonShape,
    MouseJoint: b2MouseJoint,
    DistanceJoint: b2DistanceJoint,
    SpringJoint: b2SpringJoint,
    RelativeJoint: b2RelativeJoint,
    SliderJoint: b2SliderJoint,
    FixedJoint: b2FixedJoint,
    WheelJoint: b2WheelJoint,
    HingeJoint: b2HingeJoint
  });
});
//# sourceMappingURL=physics-2d-box2d.js.map
