import CANNON from '@cocos/cannon';
import { P as PhysicsSystem, j as SimplexCollider, s as selector } from './index-UDeHavOr.js';
import { a as _createClass, M as fastRemoveAt, w as warnID, Q as error, _ as _inheritsLoose } from './gc-object-CShF5lzx.js';
import { f as Vec3, Q as Quat, J as AABB, C as Color, a as clamp, al as absMaxComponent } from './index-uXI1_UMk.js';
import { a as ERigidBodyType, P as PhysicsGroup, c as EPhysicsDrawFlags, E as EAxisDirection } from './collision-matrix-55yq71jP.js';
import { g as getWrap, s as setWrap, a as absolute, V as VEC3_0 } from './util-Cxn5lV0H.js';
import './physics-framework.js';
import { T as TransformBit } from './scene-vWcxM1_c.js';
import { g as game, G as Game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './global-exports-DnCP_14L.js';
import './node-event-Ccvtv8bJ.js';
import './deprecated-n0w4kK7g.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './debug-view-BuNhRPv_.js';
import './prefab-DYg_oxpo.js';
import './touch-BKrZ-fxl.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './skeleton-CBhmWmEt.js';
import './terrain-asset-BMvu7XYU.js';
import './capsule-9D-8tsOp.js';
import './base.js';
import './deprecated-CN-RjLP6.js';
import './render-types-D3qsZZI9.js';
import './deprecated-CzzdLkmW.js';
import './camera-component-BFt9vSC_.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './instantiate-DAIJ1YBG.js';
import './move-DnXMCCeG.js';

var v3_cannon0$1 = new CANNON.Vec3();
var v3_cannon1 = new CANNON.Vec3();
var CannonRigidBody = function () {
  function CannonRigidBody() {
    this._rigidBody = void 0;
    this._sharedBody = void 0;
    this._isEnabled = false;
  }
  var _proto = CannonRigidBody.prototype;
  _proto.setAllowSleep = function setAllowSleep(v) {
    if (this.impl.type !== CANNON.Body.DYNAMIC) return;
    this.impl.allowSleep = v;
    this._wakeUpIfSleep();
  };
  _proto.setMass = function setMass(value) {
    if (this.impl.type !== CANNON.Body.DYNAMIC) return;
    this.impl.mass = value;
    this.impl.updateMassProperties();
    this._wakeUpIfSleep();
  };
  _proto.setType = function setType(v) {
    switch (v) {
      case ERigidBodyType.DYNAMIC:
        this.impl.type = CANNON.Body.DYNAMIC;
        this.impl.allowSleep = this._rigidBody.allowSleep;
        this.setMass(this._rigidBody.mass);
        break;
      case ERigidBodyType.KINEMATIC:
        this.impl.type = CANNON.Body.KINEMATIC;
        this.impl.mass = 0;
        this.impl.allowSleep = false;
        this.impl.sleepState = CANNON.Body.AWAKE;
        this.impl.updateMassProperties();
        break;
      case ERigidBodyType.STATIC:
      default:
        this.impl.type = CANNON.Body.STATIC;
        this.impl.mass = 0;
        this.impl.allowSleep = true;
        this.impl.updateMassProperties();
        this.clearState();
        break;
    }
  };
  _proto.setLinearDamping = function setLinearDamping(value) {
    this.impl.linearDamping = value;
  };
  _proto.setAngularDamping = function setAngularDamping(value) {
    this.impl.angularDamping = value;
  };
  _proto.useGravity = function useGravity(value) {
    this.impl.useGravity = value;
    this._wakeUpIfSleep();
  };
  _proto.useCCD = function useCCD(value) {
    this.impl.ccdSpeedThreshold = value ? 0.01 : -1;
  };
  _proto.isUsingCCD = function isUsingCCD() {
    return this.impl.ccdSpeedThreshold !== -1;
  };
  _proto.setLinearFactor = function setLinearFactor(value) {
    Vec3.copy(this.impl.linearFactor, value);
    this._wakeUpIfSleep();
  };
  _proto.setAngularFactor = function setAngularFactor(value) {
    Vec3.copy(this.impl.angularFactor, value);
    var fixR = Vec3.equals(this.impl.angularFactor, Vec3.ZERO);
    if (fixR !== this.impl.fixedRotation) {
      this.impl.fixedRotation = fixR;
      this.impl.updateMassProperties();
    }
    this._wakeUpIfSleep();
  };
  _proto.initialize = function initialize(com) {
    this._rigidBody = com;
    this._sharedBody = PhysicsSystem.instance.physicsWorld.getSharedBody(this._rigidBody.node, this);
    this._sharedBody.reference = true;
    this._sharedBody.wrappedBody = this;
  };
  _proto.onLoad = function onLoad() {};
  _proto.onEnable = function onEnable() {
    this._isEnabled = true;
    this.setType(this._rigidBody.type);
    this.setMass(this._rigidBody.mass);
    this.setAllowSleep(this._rigidBody.allowSleep);
    this.setLinearDamping(this._rigidBody.linearDamping);
    this.setAngularDamping(this._rigidBody.angularDamping);
    this.useGravity(this._rigidBody.useGravity);
    this.setLinearFactor(this._rigidBody.linearFactor);
    this.setAngularFactor(this._rigidBody.angularFactor);
    this._sharedBody.enabled = true;
  };
  _proto.onDisable = function onDisable() {
    this._isEnabled = false;
    this._sharedBody.enabled = false;
  };
  _proto.onDestroy = function onDestroy() {
    this._sharedBody.reference = false;
    this._rigidBody = null;
    this._sharedBody = null;
  };
  _proto.clearVelocity = function clearVelocity() {
    this.impl.velocity.setZero();
    this.impl.angularVelocity.setZero();
  };
  _proto.clearForces = function clearForces() {
    this.impl.force.setZero();
    this.impl.torque.setZero();
  };
  _proto.clearState = function clearState() {
    this.clearVelocity();
    this.clearForces();
  };
  _proto.wakeUp = function wakeUp() {
    return this.impl.wakeUp();
  };
  _proto.sleep = function sleep() {
    return this.impl.sleep();
  };
  _proto.setSleepThreshold = function setSleepThreshold(v) {
    this.impl.sleepSpeedLimit = v;
    this._wakeUpIfSleep();
  };
  _proto.getSleepThreshold = function getSleepThreshold() {
    return this.impl.sleepSpeedLimit;
  };
  _proto.getLinearVelocity = function getLinearVelocity(out) {
    Vec3.copy(out, this.impl.velocity);
    return out;
  };
  _proto.setLinearVelocity = function setLinearVelocity(value) {
    this._wakeUpIfSleep();
    Vec3.copy(this.impl.velocity, value);
  };
  _proto.getAngularVelocity = function getAngularVelocity(out) {
    Vec3.copy(out, this.impl.angularVelocity);
    return out;
  };
  _proto.setAngularVelocity = function setAngularVelocity(value) {
    this._wakeUpIfSleep();
    Vec3.copy(this.impl.angularVelocity, value);
  };
  _proto.applyForce = function applyForce(force, worldPoint) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    if (worldPoint == null) worldPoint = Vec3.ZERO;
    this.impl.applyForce(Vec3.copy(v3_cannon0$1, force), Vec3.copy(v3_cannon1, worldPoint));
  };
  _proto.applyImpulse = function applyImpulse(impulse, worldPoint) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    if (worldPoint == null) worldPoint = Vec3.ZERO;
    this.impl.applyImpulse(Vec3.copy(v3_cannon0$1, impulse), Vec3.copy(v3_cannon1, worldPoint));
  };
  _proto.applyLocalForce = function applyLocalForce(force, localPoint) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    if (localPoint == null) localPoint = Vec3.ZERO;
    this.impl.applyLocalForce(Vec3.copy(v3_cannon0$1, force), Vec3.copy(v3_cannon1, localPoint));
  };
  _proto.applyLocalImpulse = function applyLocalImpulse(impulse, localPoint) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    if (localPoint == null) localPoint = Vec3.ZERO;
    this.impl.applyLocalImpulse(Vec3.copy(v3_cannon0$1, impulse), Vec3.copy(v3_cannon1, localPoint));
  };
  _proto.applyTorque = function applyTorque(torque) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    Vec3.add(this.impl.torque, this.impl.torque, torque);
  };
  _proto.applyLocalTorque = function applyLocalTorque(torque) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    Vec3.copy(v3_cannon0$1, torque);
    this.impl.vectorToWorldFrame(v3_cannon0$1, v3_cannon0$1);
    Vec3.add(this.impl.torque, this.impl.torque, v3_cannon0$1);
  };
  _proto.getGroup = function getGroup() {
    return this.impl.collisionFilterGroup;
  };
  _proto.setGroup = function setGroup(v) {
    this.impl.collisionFilterGroup = v;
    this._wakeUpIfSleep();
  };
  _proto.addGroup = function addGroup(v) {
    this.impl.collisionFilterGroup |= v;
    this._wakeUpIfSleep();
  };
  _proto.removeGroup = function removeGroup(v) {
    this.impl.collisionFilterGroup &= ~v;
    this._wakeUpIfSleep();
  };
  _proto.getMask = function getMask() {
    return this.impl.collisionFilterMask;
  };
  _proto.setMask = function setMask(v) {
    this.impl.collisionFilterMask = v;
    this._wakeUpIfSleep();
  };
  _proto.addMask = function addMask(v) {
    this.impl.collisionFilterMask |= v;
    this._wakeUpIfSleep();
  };
  _proto.removeMask = function removeMask(v) {
    this.impl.collisionFilterMask &= ~v;
    this._wakeUpIfSleep();
  };
  _proto._wakeUpIfSleep = function _wakeUpIfSleep() {
    if (!this.impl.isAwake()) this.impl.wakeUp();
  };
  return _createClass(CannonRigidBody, [{
    key: "isAwake",
    get: function get() {
      return this.impl.isAwake();
    }
  }, {
    key: "isSleepy",
    get: function get() {
      return this.impl.isSleepy();
    }
  }, {
    key: "isSleeping",
    get: function get() {
      return this.impl.isSleeping();
    }
  }, {
    key: "impl",
    get: function get() {
      return this._sharedBody.body;
    }
  }, {
    key: "rigidBody",
    get: function get() {
      return this._rigidBody;
    }
  }, {
    key: "sharedBody",
    get: function get() {
      return this._sharedBody;
    }
  }, {
    key: "isEnabled",
    get: function get() {
      return this._isEnabled;
    }
  }]);
}();

function toCannonRaycastOptions(out, options) {
  out.checkCollisionResponse = !options.queryTrigger;
  out.collisionFilterGroup = -1;
  out.collisionFilterMask = options.mask;
}
function fillRaycastResult(result, cannonResult) {
  result._assign(cannonResult.hitPointWorld, cannonResult.distance, getWrap(cannonResult.shape).collider, cannonResult.hitNormalWorld);
}
function commitShapeUpdates(body) {
  body.aabbNeedsUpdate = true;
  body.updateMassProperties();
  body.updateBoundingRadius();
}

var TriggerEventObject = {
  type: 'onTriggerEnter',
  selfCollider: null,
  otherCollider: null,
  impl: null
};
var cannonQuat_0 = new CANNON.Quaternion();
var cannonVec3_0 = new CANNON.Vec3();
var cannonVec3_1 = new CANNON.Vec3();
var CannonShape = function () {
  function CannonShape() {
    this._collider = void 0;
    this._shape = void 0;
    this._offset = new CANNON.Vec3();
    this._orient = new CANNON.Quaternion();
    this._index = -1;
    this._sharedBody = void 0;
    this.onTriggerListener = this._onTrigger.bind(this);
    this._isBinding = false;
  }
  var _proto = CannonShape.prototype;
  _proto.updateEventListener = function updateEventListener() {};
  _proto.setMaterial = function setMaterial(mat) {
    var mat1 = mat == null ? PhysicsSystem.instance.defaultMaterial : mat;
    if (CannonShape.idToMaterial[mat1.id] == null) {
      CannonShape.idToMaterial[mat1.id] = new CANNON.Material(mat1.id);
    }
    this._shape.material = CannonShape.idToMaterial[mat1.id];
    var smat = this._shape.material;
    smat.friction = mat1.friction;
    smat.restitution = mat1.restitution;
    var coef = CANNON.CC_CONFIG.correctInelastic;
    smat.correctInelastic = smat.restitution === 0 ? coef : 0;
  };
  _proto.setAsTrigger = function setAsTrigger(v) {
    this._shape.collisionResponse = !v;
    if (this._index >= 0) {
      this._body.updateHasTrigger();
    }
  };
  _proto.setCenter = function setCenter(v) {
    this._setCenter(v);
    if (this._index >= 0) {
      commitShapeUpdates(this._body);
    }
  };
  _proto.setAttachedBody = function setAttachedBody(v) {
    if (v) {
      if (this._sharedBody) {
        if (this._sharedBody.wrappedBody === v.body) return;
        this._sharedBody.reference = false;
      }
      this._sharedBody = PhysicsSystem.instance.physicsWorld.getSharedBody(v.node);
      this._sharedBody.reference = true;
    } else {
      if (this._sharedBody) {
        this._sharedBody.reference = false;
      }
      this._sharedBody = PhysicsSystem.instance.physicsWorld.getSharedBody(this._collider.node);
      this._sharedBody.reference = true;
    }
  };
  _proto.getAABB = function getAABB(v) {
    Quat.copy(cannonQuat_0, this._collider.node.worldRotation);
    this._shape.calculateWorldAABB(CANNON.Vec3.ZERO, cannonQuat_0, cannonVec3_0, cannonVec3_1);
    Vec3.subtract(v.halfExtents, cannonVec3_1, cannonVec3_0);
    Vec3.multiplyScalar(v.halfExtents, v.halfExtents, 0.5);
    Vec3.add(v.center, this._collider.node.worldPosition, this._collider.center);
  };
  _proto.getBoundingSphere = function getBoundingSphere(v) {
    v.radius = this._shape.boundingSphereRadius;
    Vec3.add(v.center, this._collider.node.worldPosition, this._collider.center);
  };
  _proto.initialize = function initialize(comp) {
    this._collider = comp;
    this._isBinding = true;
    this._sharedBody = PhysicsSystem.instance.physicsWorld.getSharedBody(this._collider.node);
    this._sharedBody.reference = true;
    this.onComponentSet();
    setWrap(this._shape, this);
    this._shape.addEventListener('cc-trigger', this.onTriggerListener);
  };
  _proto.onComponentSet = function onComponentSet() {};
  _proto.onLoad = function onLoad() {
    this.setMaterial(this._collider.sharedMaterial);
    this.setCenter(this._collider.center);
    this.setAsTrigger(this._collider.isTrigger);
  };
  _proto.onEnable = function onEnable() {
    this._sharedBody.addShape(this);
    this._sharedBody.enabled = true;
  };
  _proto.onDisable = function onDisable() {
    this._sharedBody.removeShape(this);
    this._sharedBody.enabled = false;
  };
  _proto.onDestroy = function onDestroy() {
    this._sharedBody.reference = false;
    this._shape.removeEventListener('cc-trigger', this.onTriggerListener);
    delete CANNON.World.idToShapeMap[this._shape.id];
    this._sharedBody = null;
    setWrap(this._shape, null);
    this._offset = null;
    this._orient = null;
    this._shape = null;
    this._collider = null;
    this.onTriggerListener = null;
  };
  _proto.getGroup = function getGroup() {
    return this._body.collisionFilterGroup;
  };
  _proto.setGroup = function setGroup(v) {
    this._body.collisionFilterGroup = v;
    if (!this._body.isAwake()) this._body.wakeUp();
  };
  _proto.addGroup = function addGroup(v) {
    this._body.collisionFilterGroup |= v;
    if (!this._body.isAwake()) this._body.wakeUp();
  };
  _proto.removeGroup = function removeGroup(v) {
    this._body.collisionFilterGroup &= ~v;
    if (!this._body.isAwake()) this._body.wakeUp();
  };
  _proto.getMask = function getMask() {
    return this._body.collisionFilterMask;
  };
  _proto.setMask = function setMask(v) {
    this._body.collisionFilterMask = v;
    if (!this._body.isAwake()) this._body.wakeUp();
  };
  _proto.addMask = function addMask(v) {
    this._body.collisionFilterMask |= v;
    if (!this._body.isAwake()) this._body.wakeUp();
  };
  _proto.removeMask = function removeMask(v) {
    this._body.collisionFilterMask &= ~v;
    if (!this._body.isAwake()) this._body.wakeUp();
  };
  _proto.setScale = function setScale(scale) {
    this._setCenter(this._collider.center);
  };
  _proto.setIndex = function setIndex(index) {
    this._index = index;
  };
  _proto.setOffsetAndOrient = function setOffsetAndOrient(offset, orient) {
    Vec3.copy(offset, this._offset);
    Quat.copy(orient, this._orient);
    this._offset = offset;
    this._orient = orient;
  };
  _proto._setCenter = function _setCenter(v) {
    var lpos = this._offset;
    Vec3.subtract(lpos, this._sharedBody.node.worldPosition, this._collider.node.worldPosition);
    Vec3.add(lpos, lpos, v);
    Vec3.multiply(lpos, lpos, this._collider.node.worldScale);
  };
  _proto._onTrigger = function _onTrigger(event) {
    TriggerEventObject.type = event.event;
    var self = getWrap(event.selfShape);
    var other = getWrap(event.otherShape);
    if (self && self.collider.needTriggerEvent) {
      TriggerEventObject.selfCollider = self.collider;
      TriggerEventObject.otherCollider = other ? other.collider : null;
      TriggerEventObject.impl = event;
      this._collider.emit(TriggerEventObject.type, TriggerEventObject);
    }
  };
  return _createClass(CannonShape, [{
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }, {
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "attachedRigidBody",
    get: function get() {
      if (this._sharedBody.wrappedBody) {
        return this._sharedBody.wrappedBody.rigidBody;
      }
      return null;
    }
  }, {
    key: "sharedBody",
    get: function get() {
      return this._sharedBody;
    }
  }, {
    key: "_body",
    get: function get() {
      return this._sharedBody.body;
    }
  }]);
}();
CannonShape.idToMaterial = {};

var quat = new Quat();
var CannonContactEquation = function () {
  function CannonContactEquation(event) {
    this.impl = null;
    this.event = void 0;
    this.event = event;
  }
  var _proto = CannonContactEquation.prototype;
  _proto.getLocalPointOnA = function getLocalPointOnA(out) {
    if (this.impl) Vec3.copy(out, this.impl.rj);
  };
  _proto.getLocalPointOnB = function getLocalPointOnB(out) {
    if (this.impl) Vec3.copy(out, this.impl.ri);
  };
  _proto.getWorldPointOnA = function getWorldPointOnA(out) {
    if (this.impl) Vec3.add(out, this.impl.rj, this.impl.bj.position);
  };
  _proto.getWorldPointOnB = function getWorldPointOnB(out) {
    if (this.impl) Vec3.add(out, this.impl.ri, this.impl.bi.position);
  };
  _proto.getLocalNormalOnA = function getLocalNormalOnA(out) {
    if (this.impl) {
      this.getWorldNormalOnA(out);
      Quat.conjugate(quat, this.impl.bi.quaternion);
      Vec3.transformQuat(out, out, quat);
    }
  };
  _proto.getLocalNormalOnB = function getLocalNormalOnB(out) {
    if (this.impl) {
      Quat.conjugate(quat, this.impl.bj.quaternion);
      Vec3.transformQuat(out, this.impl.ni, quat);
    }
  };
  _proto.getWorldNormalOnA = function getWorldNormalOnA(out) {
    if (this.impl) {
      this.getWorldNormalOnB(out);
      if (!this.isBodyA) Vec3.negate(out, out);
    }
  };
  _proto.getWorldNormalOnB = function getWorldNormalOnB(out) {
    if (this.impl) Vec3.copy(out, this.impl.ni);
  };
  return _createClass(CannonContactEquation, [{
    key: "isBodyA",
    get: function get() {
      if (this.impl) {
        var si = this.event.selfCollider.shape.impl;
        var bj = this.impl.bj;
        return si.body.id === bj.id;
      }
      return false;
    }
  }]);
}();

var v3_0$3 = new Vec3();
var quat_0$1 = new Quat();
var contactsPool = [];
var CollisionEventObject = {
  type: 'onCollisionEnter',
  selfCollider: null,
  otherCollider: null,
  contacts: [],
  impl: null
};
var CannonSharedBody = function () {
  function CannonSharedBody(node, wrappedWorld) {
    this.node = void 0;
    this.wrappedWorld = void 0;
    this.body = void 0;
    this.wrappedShapes = [];
    this.wrappedJoints0 = [];
    this.wrappedJoints1 = [];
    this.wrappedBody = null;
    this.index = -1;
    this.ref = 0;
    this.onCollidedListener = this.onCollided.bind(this);
    this.wrappedWorld = wrappedWorld;
    this.node = node;
    this.body = new CANNON.Body();
    setWrap(this.body, this);
    this.body.collisionFilterGroup = PhysicsSystem.PhysicsGroup.DEFAULT;
    this.body.sleepSpeedLimit = PhysicsSystem.instance.sleepThreshold;
    this.body.material = this.wrappedWorld.impl.defaultMaterial;
    this.body.addEventListener('cc-collide', this.onCollidedListener);
  }
  CannonSharedBody.getSharedBody = function getSharedBody(node, wrappedWorld, wrappedBody) {
    var key = node.uuid;
    var newSB;
    if (CannonSharedBody.sharedBodesMap.has(key)) {
      newSB = CannonSharedBody.sharedBodesMap.get(key);
    } else {
      newSB = new CannonSharedBody(node, wrappedWorld);
      var g = PhysicsGroup.DEFAULT;
      var m = PhysicsSystem.instance.collisionMatrix[g];
      newSB.body.collisionFilterGroup = g;
      newSB.body.collisionFilterMask = m;
      newSB.body.position = new CANNON.Vec3(node.worldPosition.x, node.worldPosition.y, node.worldPosition.z);
      newSB.body.quaternion = new CANNON.Quaternion(node.worldRotation.x, node.worldRotation.y, node.worldRotation.z, node.worldRotation.w);
      CannonSharedBody.sharedBodesMap.set(node.uuid, newSB);
    }
    if (wrappedBody) {
      newSB.wrappedBody = wrappedBody;
      var _g = wrappedBody.rigidBody.group;
      var _m = PhysicsSystem.instance.collisionMatrix[_g];
      newSB.body.collisionFilterGroup = _g;
      newSB.body.collisionFilterMask = _m;
      newSB.body.position = new CANNON.Vec3(node.worldPosition.x, node.worldPosition.y, node.worldPosition.z);
      newSB.body.quaternion = new CANNON.Quaternion(node.worldRotation.x, node.worldRotation.y, node.worldRotation.z, node.worldRotation.w);
    }
    return newSB;
  };
  var _proto = CannonSharedBody.prototype;
  _proto.addShape = function addShape(v) {
    var index = this.wrappedShapes.indexOf(v);
    if (index < 0) {
      var _index = this.body.shapes.length;
      this.body.addShape(v.impl);
      this.wrappedShapes.push(v);
      v.setIndex(_index);
      var offset = this.body.shapeOffsets[_index];
      var orient = this.body.shapeOrientations[_index];
      v.setOffsetAndOrient(offset, orient);
      if (this.body.isSleeping()) this.body.wakeUp();
    }
  };
  _proto.removeShape = function removeShape(v) {
    var index = this.wrappedShapes.indexOf(v);
    if (index >= 0) {
      fastRemoveAt(this.wrappedShapes, index);
      this.body.removeShape(v.impl);
      v.setIndex(-1);
      if (this.body.isSleeping()) this.body.wakeUp();
    }
  };
  _proto.addJoint = function addJoint(v, type) {
    if (type) {
      var i = this.wrappedJoints1.indexOf(v);
      if (i < 0) this.wrappedJoints1.push(v);
    } else {
      var _i = this.wrappedJoints0.indexOf(v);
      if (_i < 0) this.wrappedJoints0.push(v);
    }
  };
  _proto.removeJoint = function removeJoint(v, type) {
    if (type) {
      var i = this.wrappedJoints1.indexOf(v);
      if (i >= 0) fastRemoveAt(this.wrappedJoints1, i);
    } else {
      var _i2 = this.wrappedJoints0.indexOf(v);
      if (_i2 >= 0) fastRemoveAt(this.wrappedJoints0, _i2);
    }
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    var node = this.node;
    var body = this.body;
    if (node.hasChangedFlags) {
      if (body.isSleeping()) body.wakeUp();
      Vec3.copy(body.position, node.worldPosition);
      Quat.copy(body.quaternion, node.worldRotation);
      body.aabbNeedsUpdate = true;
      if (node.hasChangedFlags & TransformBit.SCALE) this.syncScale();
    }
  };
  _proto.syncPhysicsToScene = function syncPhysicsToScene() {
    var n = this.node;
    var b = this.body;
    if (b.type === ERigidBodyType.DYNAMIC) {
      if (!b.isSleeping()) {
        Vec3.copy(v3_0$3, b.position);
        Quat.copy(quat_0$1, b.quaternion);
        n.worldPosition = v3_0$3;
        n.worldRotation = quat_0$1;
      }
    }
  };
  _proto.syncInitial = function syncInitial() {
    var n = this.node;
    var b = this.body;
    Vec3.copy(b.position, n.worldPosition);
    Quat.copy(b.quaternion, n.worldRotation);
    Vec3.copy(b.previousPosition, n.worldPosition);
    Quat.copy(b.previousQuaternion, n.worldRotation);
    b.aabbNeedsUpdate = true;
    this.syncScale();
    if (b.isSleeping()) b.wakeUp();
  };
  _proto.syncScale = function syncScale() {
    for (var i = 0; i < this.wrappedShapes.length; i++) {
      this.wrappedShapes[i].setScale(this.node.worldScale);
    }
    for (var _i3 = 0; _i3 < this.wrappedJoints0.length; _i3++) {
      this.wrappedJoints0[_i3].updateScale0();
    }
    for (var _i4 = 0; _i4 < this.wrappedJoints1.length; _i4++) {
      this.wrappedJoints1[_i4].updateScale1();
    }
    commitShapeUpdates(this.body);
  };
  _proto.destroy = function destroy() {
    setWrap(this.body, null);
    this.body.removeEventListener('cc-collide', this.onCollidedListener);
    CannonSharedBody.sharedBodesMap["delete"](this.node.uuid);
    delete CANNON.World.idToBodyMap[this.body.id];
    this.node = null;
    this.wrappedWorld = null;
    this.body = null;
    this.wrappedShapes = null;
    this.wrappedJoints0 = null;
    this.wrappedJoints1 = null;
    this.onCollidedListener = null;
  };
  _proto.onCollided = function onCollided(event) {
    CollisionEventObject.type = event.event;
    var self = getWrap(event.selfShape);
    var other = getWrap(event.otherShape);
    if (self && self.collider.needCollisionEvent) {
      contactsPool.push.apply(contactsPool, CollisionEventObject.contacts);
      CollisionEventObject.contacts.length = 0;
      CollisionEventObject.impl = event;
      CollisionEventObject.selfCollider = self.collider;
      CollisionEventObject.otherCollider = other ? other.collider : null;
      var i = 0;
      if (CollisionEventObject.type !== 'onCollisionExit') {
        for (i = 0; i < event.contacts.length; i++) {
          var cq = event.contacts[i];
          if (contactsPool.length > 0) {
            var c = contactsPool.pop();
            c.impl = cq;
            CollisionEventObject.contacts.push(c);
          } else {
            var _c = new CannonContactEquation(CollisionEventObject);
            _c.impl = cq;
            CollisionEventObject.contacts.push(_c);
          }
        }
      }
      for (i = 0; i < this.wrappedShapes.length; i++) {
        var shape = this.wrappedShapes[i];
        shape.collider.emit(CollisionEventObject.type, CollisionEventObject);
      }
    }
  };
  return _createClass(CannonSharedBody, [{
    key: "enabled",
    set: function set(v) {
      if (v) {
        if (this.index < 0) {
          this.index = this.wrappedWorld.bodies.length;
          this.wrappedWorld.addSharedBody(this);
          this.syncInitial();
        }
      } else if (this.index >= 0) {
        var isRemove = this.wrappedShapes.length === 0 && this.wrappedBody == null || this.wrappedShapes.length === 0 && this.wrappedBody != null && !this.wrappedBody.isEnabled;
        if (isRemove) {
          this.body.sleep();
          this.index = -1;
          this.wrappedWorld.removeSharedBody(this);
        }
      }
    }
  }, {
    key: "reference",
    set: function set(v) {
      v ? this.ref++ : this.ref--;
      if (this.ref === 0) {
        this.destroy();
      }
    }
  }]);
}();
CannonSharedBody.sharedBodesMap = new Map();

var aabbTemp = new AABB();
var AABB_LINE_COUNT = 12;
var CannonWorld = function () {
  function CannonWorld() {
    this.bodies = [];
    this.constraints = [];
    this._world = void 0;
    this._debugLineCount = 0;
    this._MAX_DEBUG_LINE_COUNT = 16384;
    this._debugDrawFlags = EPhysicsDrawFlags.NONE;
    this._debugConstraintSize = 0.3;
    this._aabbColor = new Color(0, 255, 255, 255);
    this._wireframeColor = new Color(255, 0, 255, 255);
    this._world = new CANNON.World();
    this._world.broadphase = new CANNON.NaiveBroadphase();
    this._world.solver.iterations = 10;
    this._world.solver.tolerance = 0.0001;
    this._world.defaultContactMaterial.contactEquationStiffness = 1000000;
    this._world.defaultContactMaterial.frictionEquationStiffness = 1000000;
    this._world.defaultContactMaterial.contactEquationRelaxation = 3;
    this._world.defaultContactMaterial.frictionEquationRelaxation = 3;
  }
  var _proto = CannonWorld.prototype;
  _proto.setDefaultMaterial = function setDefaultMaterial(mat) {
    this._world.defaultMaterial.friction = mat.friction;
    this._world.defaultMaterial.restitution = mat.restitution;
    if (CannonShape.idToMaterial[mat.id] != null) {
      CannonShape.idToMaterial[mat.id] = this._world.defaultMaterial;
    }
  };
  _proto.setAllowSleep = function setAllowSleep(v) {
    this._world.allowSleep = v;
  };
  _proto.setGravity = function setGravity(gravity) {
    Vec3.copy(this._world.gravity, gravity);
  };
  _proto.sweepBox = function sweepBox(worldRay, halfExtent, orientation, options, pool, results) {
    warnID(9641);
    return false;
  };
  _proto.sweepBoxClosest = function sweepBoxClosest(worldRay, halfExtent, orientation, options, result) {
    warnID(9641);
    return false;
  };
  _proto.sweepSphere = function sweepSphere(worldRay, radius, options, pool, results) {
    warnID(9641);
    return false;
  };
  _proto.sweepSphereClosest = function sweepSphereClosest(worldRay, radius, options, result) {
    warnID(9641);
    return false;
  };
  _proto.sweepCapsule = function sweepCapsule(worldRay, radius, height, orientation, options, pool, results) {
    warnID(9641);
    return false;
  };
  _proto.sweepCapsuleClosest = function sweepCapsuleClosest(worldRay, radius, height, orientation, options, result) {
    warnID(9641);
    return false;
  };
  _proto.destroy = function destroy() {
    if (this.constraints.length || this.bodies.length) error('You should destroy all physics component first.');
    this._world.broadphase = null;
    this._world = null;
  };
  _proto.emitEvents = function emitEvents() {
    this._world.emitTriggeredEvents();
    this._world.emitCollisionEvents();
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    for (var i = 0; i < this.bodies.length; i++) {
      this.bodies[i].syncSceneToPhysics();
    }
  };
  _proto.syncAfterEvents = function syncAfterEvents() {
    this.syncSceneToPhysics();
  };
  _proto.step = function step(deltaTime, timeSinceLastCalled, maxSubStep) {
    if (this.bodies.length === 0) return;
    this._world.step(deltaTime, timeSinceLastCalled, maxSubStep);
    for (var i = 0; i < this.bodies.length; i++) {
      this.bodies[i].syncPhysicsToScene();
    }
    this._debugDraw();
  };
  _proto.raycastClosest = function raycastClosest(worldRay, options, result) {
    setupFromAndTo(worldRay, options.maxDistance);
    toCannonRaycastOptions(raycastOpt, options);
    var hit = this._world.raycastClosest(from, to, raycastOpt, CannonWorld.rayResult);
    if (hit) {
      fillRaycastResult(result, CannonWorld.rayResult);
    }
    return hit;
  };
  _proto.raycast = function raycast(worldRay, options, pool, results) {
    setupFromAndTo(worldRay, options.maxDistance);
    toCannonRaycastOptions(raycastOpt, options);
    var hit = this._world.raycastAll(from, to, raycastOpt, function (result) {
      var r = pool.add();
      fillRaycastResult(r, result);
      results.push(r);
    });
    return hit;
  };
  _proto.getSharedBody = function getSharedBody(node, wrappedBody) {
    return CannonSharedBody.getSharedBody(node, this, wrappedBody);
  };
  _proto.addSharedBody = function addSharedBody(sharedBody) {
    var i = this.bodies.indexOf(sharedBody);
    if (i < 0) {
      this.bodies.push(sharedBody);
      this._world.addBody(sharedBody.body);
    }
  };
  _proto.removeSharedBody = function removeSharedBody(sharedBody) {
    var i = this.bodies.indexOf(sharedBody);
    if (i >= 0) {
      fastRemoveAt(this.bodies, i);
      this._world.remove(sharedBody.body);
    }
  };
  _proto.addConstraint = function addConstraint(constraint) {
    var i = this.constraints.indexOf(constraint);
    if (i < 0) {
      this.constraints.push(constraint);
      this._world.addConstraint(constraint.impl);
    }
  };
  _proto.removeConstraint = function removeConstraint(constraint) {
    var i = this.constraints.indexOf(constraint);
    if (i >= 0) {
      fastRemoveAt(this.constraints, i);
      this._world.removeConstraint(constraint.impl);
    }
  };
  _proto._getDebugRenderer = function _getDebugRenderer() {
    var _mainWindow;
    var cameras = (_mainWindow = director.root.mainWindow) == null ? void 0 : _mainWindow.cameras;
    if (!cameras) return null;
    if (cameras.length === 0) return null;
    if (!cameras[0]) return null;
    cameras[0].initGeometryRenderer();
    return cameras[0].geometryRenderer;
  };
  _proto._debugDraw = function _debugDraw() {
    var debugRenderer = this._getDebugRenderer();
    if (!debugRenderer) return;
    this._debugLineCount = 0;
    if (this._debugDrawFlags & EPhysicsDrawFlags.AABB) {
      for (var i = 0; i < this.bodies.length; i++) {
        var body = this.bodies[i];
        for (var j = 0; j < body.wrappedShapes.length; j++) {
          var shape = body.wrappedShapes[j];
          if (this._debugLineCount + AABB_LINE_COUNT < this._MAX_DEBUG_LINE_COUNT) {
            this._debugLineCount += AABB_LINE_COUNT;
            shape.getAABB(aabbTemp);
            debugRenderer.addBoundingBox(aabbTemp, this._aabbColor);
          }
        }
      }
    }
  };
  return _createClass(CannonWorld, [{
    key: "impl",
    get: function get() {
      return this._world;
    }
  }, {
    key: "debugDrawFlags",
    get: function get() {
      return this._debugDrawFlags;
    },
    set: function set(v) {
      this._debugDrawFlags = v;
    }
  }, {
    key: "debugDrawConstraintSize",
    get: function get() {
      return this._debugConstraintSize;
    },
    set: function set(v) {
      this._debugConstraintSize = v;
    }
  }]);
}();
CannonWorld.rayResult = new CANNON.RaycastResult();
var from = new CANNON.Vec3();
var to = new CANNON.Vec3();
function setupFromAndTo(worldRay, distance) {
  Vec3.copy(from, worldRay.o);
  worldRay.computeHit(to, distance);
}
var raycastOpt = {
  checkCollisionResponse: false,
  collisionFilterGroup: -1,
  collisionFilterMask: -1,
  skipBackfaces: true
};

var CannonBoxShape = function (_CannonShape) {
  function CannonBoxShape() {
    var _this;
    _this = _CannonShape.call(this) || this;
    _this.halfExtent = void 0;
    _this.halfExtent = new CANNON.Vec3(0.5, 0.5, 0.5);
    _this._shape = new CANNON.Box(_this.halfExtent.clone());
    return _this;
  }
  _inheritsLoose(CannonBoxShape, _CannonShape);
  var _proto = CannonBoxShape.prototype;
  _proto.updateSize = function updateSize() {
    Vec3.multiplyScalar(this.halfExtent, this.collider.size, 0.5);
    var ws = absolute(VEC3_0.set(this.collider.node.worldScale));
    var x = this.halfExtent.x * ws.x;
    var y = this.halfExtent.y * ws.y;
    var z = this.halfExtent.z * ws.z;
    var minVolumeSize = PhysicsSystem.instance.minVolumeSize;
    this.impl.halfExtents.x = clamp(x, minVolumeSize, Number.MAX_VALUE);
    this.impl.halfExtents.y = clamp(y, minVolumeSize, Number.MAX_VALUE);
    this.impl.halfExtents.z = clamp(z, minVolumeSize, Number.MAX_VALUE);
    this.impl.updateConvexPolyhedronRepresentation();
    if (this._index !== -1) {
      commitShapeUpdates(this._body);
    }
  };
  _proto.onLoad = function onLoad() {
    _CannonShape.prototype.onLoad.call(this);
    this.updateSize();
  };
  _proto.setScale = function setScale(scale) {
    _CannonShape.prototype.setScale.call(this, scale);
    this.updateSize();
  };
  return _createClass(CannonBoxShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }]);
}(CannonShape);

var CannonSphereShape = function (_CannonShape) {
  function CannonSphereShape(radius) {
    var _this;
    if (radius === void 0) {
      radius = 0.5;
    }
    _this = _CannonShape.call(this) || this;
    _this._shape = new CANNON.Sphere(radius);
    return _this;
  }
  _inheritsLoose(CannonSphereShape, _CannonShape);
  var _proto = CannonSphereShape.prototype;
  _proto.updateRadius = function updateRadius() {
    var max = Math.abs(absMaxComponent(this.collider.node.worldScale));
    this.impl.radius = clamp(this.collider.radius * Math.abs(max), PhysicsSystem.instance.minVolumeSize, Number.MAX_VALUE);
    this.impl.updateBoundingSphereRadius();
    if (this._index !== -1) {
      commitShapeUpdates(this._body);
    }
  };
  _proto.onLoad = function onLoad() {
    _CannonShape.prototype.onLoad.call(this);
    this.updateRadius();
  };
  _proto.setScale = function setScale(scale) {
    _CannonShape.prototype.setScale.call(this, scale);
    this.updateRadius();
  };
  return _createClass(CannonSphereShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }]);
}(CannonShape);

var v3_cannon0 = new CANNON.Vec3();
var CannonTrimeshShape = function (_CannonShape) {
  function CannonTrimeshShape() {
    return _CannonShape.apply(this, arguments) || this;
  }
  _inheritsLoose(CannonTrimeshShape, _CannonShape);
  var _proto = CannonTrimeshShape.prototype;
  _proto.setMesh = function setMesh(v) {
    if (!this._isBinding) return;
    var mesh = v;
    if (this._shape != null) {
      if (mesh && mesh.renderingSubMeshes.length > 0) {
        var vertices = mesh.renderingSubMeshes[0].geometricInfo.positions;
        var indices = mesh.renderingSubMeshes[0].geometricInfo.indices;
        if (indices instanceof Uint8Array) {
          this.updateProperties(vertices, new Uint16Array(indices));
        } else if (indices instanceof Uint16Array) {
          this.updateProperties(vertices, indices);
        } else if (indices instanceof Uint32Array) {
          this.updateProperties(vertices, new Uint16Array(indices));
        } else {
          this.updateProperties(vertices, new Uint16Array());
        }
      } else {
        this.updateProperties(new Float32Array(), new Uint16Array());
      }
    } else if (mesh && mesh.renderingSubMeshes.length > 0) {
      var _vertices = mesh.renderingSubMeshes[0].geometricInfo.positions;
      var _indices = mesh.renderingSubMeshes[0].geometricInfo.indices;
      this._shape = new CANNON.Trimesh(_vertices, _indices);
    } else {
      this._shape = new CANNON.Trimesh(new Float32Array(), new Uint16Array());
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    this.setMesh(this.collider.mesh);
  };
  _proto.onLoad = function onLoad() {
    _CannonShape.prototype.onLoad.call(this);
    this.setMesh(this.collider.mesh);
  };
  _proto.setScale = function setScale(scale) {
    _CannonShape.prototype.setScale.call(this, scale);
    Vec3.copy(v3_cannon0, scale);
    this.impl.setScale(v3_cannon0);
  };
  _proto.updateProperties = function updateProperties(vertices, indices) {
    this.impl.vertices = new Float32Array(vertices);
    this.impl.indices = new Int16Array(indices);
    this.impl.normals = new Float32Array(indices.length);
    this.impl.aabb = new CANNON.AABB();
    this.impl.edges = [];
    this.impl.tree = new CANNON.Octree(new CANNON.AABB());
    this.impl.updateEdges();
    this.impl.updateNormals();
    this.impl.updateAABB();
    this.impl.updateBoundingSphereRadius();
    this.impl.updateTree();
    this.impl.setScale(this.impl.scale);
    if (this._index >= 0) {
      commitShapeUpdates(this._body);
    }
  };
  return _createClass(CannonTrimeshShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }]);
}(CannonShape);

var CannonCylinderShape = function (_CannonShape) {
  function CannonCylinderShape(radius, height, direction) {
    var _this;
    if (radius === void 0) {
      radius = 0.5;
    }
    if (height === void 0) {
      height = 2;
    }
    if (direction === void 0) {
      direction = EAxisDirection.Y_AXIS;
    }
    _this = _CannonShape.call(this) || this;
    _this._shape = new CANNON.Cylinder(radius, radius, height, CANNON.CC_CONFIG.numSegmentsCylinder, direction === EAxisDirection.Y_AXIS);
    return _this;
  }
  _inheritsLoose(CannonCylinderShape, _CannonShape);
  var _proto = CannonCylinderShape.prototype;
  _proto.setRadius = function setRadius(v) {
    this.updateProperties(this.collider.radius, this.collider.height, CANNON.CC_CONFIG.numSegmentsCylinder, this.collider.direction, this.collider.node.worldScale);
    if (this._index !== -1) commitShapeUpdates(this._body);
  };
  _proto.setHeight = function setHeight(v) {
    this.updateProperties(this.collider.radius, this.collider.height, CANNON.CC_CONFIG.numSegmentsCylinder, this.collider.direction, this.collider.node.worldScale);
    if (this._index !== -1) commitShapeUpdates(this._body);
  };
  _proto.setDirection = function setDirection(v) {
    this.updateProperties(this.collider.radius, this.collider.height, CANNON.CC_CONFIG.numSegmentsCylinder, this.collider.direction, this.collider.node.worldScale);
    if (this._index !== -1) commitShapeUpdates(this._body);
  };
  _proto.onLoad = function onLoad() {
    _CannonShape.prototype.onLoad.call(this);
    this.setRadius(this.collider.radius);
  };
  _proto.setScale = function setScale(scale) {
    _CannonShape.prototype.setScale.call(this, scale);
    this.setRadius(this.collider.radius);
  };
  _proto.updateProperties = function updateProperties(radius, height, numSegments, direction, scale) {
    var wh = height;
    var wr = radius;
    var cos = Math.cos;
    var sin = Math.sin;
    var abs = Math.abs;
    var max = Math.max;
    if (direction === 1) {
      wh = abs(scale.y) * height;
      wr = max(abs(scale.x), abs(scale.z)) * radius;
    } else if (direction === 2) {
      wh = abs(scale.z) * height;
      wr = max(abs(scale.x), abs(scale.y)) * radius;
    } else {
      wh = abs(scale.x) * height;
      wr = max(abs(scale.y), abs(scale.z)) * radius;
    }
    var N = numSegments;
    var hH = wh / 2;
    var vertices = [];
    var indices = [];
    var axes = [];
    var theta = Math.PI * 2 / N;
    if (direction === 1) {
      var bf = [1];
      var tf = [0];
      for (var i = 0; i < N; i++) {
        var x = wr * cos(theta * i);
        var z = wr * sin(theta * i);
        vertices.push(new CANNON.Vec3(x, hH, z));
        vertices.push(new CANNON.Vec3(x, -hH, z));
        if (i < N - 1) {
          indices.push([2 * i + 2, 2 * i + 3, 2 * i + 1, 2 * i]);
          tf.push(2 * i + 2);
          bf.push(2 * i + 3);
        } else {
          indices.push([0, 1, 2 * i + 1, 2 * i]);
        }
        if (N % 2 === 1 || i < N / 2) {
          axes.push(new CANNON.Vec3(cos(theta * (i + 0.5)), 0, sin(theta * (i + 0.5))));
        }
      }
      indices.push(bf);
      var temp = [];
      for (var _i = 0; _i < tf.length; _i++) {
        temp.push(tf[tf.length - _i - 1]);
      }
      indices.push(temp);
      axes.push(new CANNON.Vec3(0, 1, 0));
    } else if (direction === 2) {
      var _bf = [0];
      var _tf = [1];
      for (var _i2 = 0; _i2 < N; _i2++) {
        var _x = wr * cos(theta * _i2);
        var y = wr * sin(theta * _i2);
        vertices.push(new CANNON.Vec3(_x, y, hH));
        vertices.push(new CANNON.Vec3(_x, y, -hH));
        if (_i2 < N - 1) {
          indices.push([2 * _i2, 2 * _i2 + 1, 2 * _i2 + 3, 2 * _i2 + 2]);
          _bf.push(2 * _i2 + 2);
          _tf.push(2 * _i2 + 3);
        } else {
          indices.push([2 * _i2, 2 * _i2 + 1, 0, 1]);
        }
        if (N % 2 === 1 || _i2 < N / 2) {
          axes.push(new CANNON.Vec3(cos(theta * (_i2 + 0.5)), sin(theta * (_i2 + 0.5)), 0));
        }
      }
      indices.push(_bf);
      var _temp = [];
      for (var _i3 = 0; _i3 < _tf.length; _i3++) {
        _temp.push(_tf[_tf.length - _i3 - 1]);
      }
      indices.push(_temp);
      axes.push(new CANNON.Vec3(0, 0, 1));
    } else {
      var _bf2 = [0];
      var _tf2 = [1];
      for (var _i4 = 0; _i4 < N; _i4++) {
        var _y = wr * cos(theta * _i4);
        var _z = wr * sin(theta * _i4);
        vertices.push(new CANNON.Vec3(hH, _y, _z));
        vertices.push(new CANNON.Vec3(-hH, _y, _z));
        if (_i4 < N - 1) {
          indices.push([2 * _i4, 2 * _i4 + 1, 2 * _i4 + 3, 2 * _i4 + 2]);
          _bf2.push(2 * _i4 + 2);
          _tf2.push(2 * _i4 + 3);
        } else {
          indices.push([2 * _i4, 2 * _i4 + 1, 0, 1]);
        }
        if (N % 2 === 1 || _i4 < N / 2) {
          axes.push(new CANNON.Vec3(0, cos(theta * (_i4 + 0.5)), sin(theta * (_i4 + 0.5))));
        }
      }
      indices.push(_bf2);
      var _temp2 = [];
      for (var _i5 = 0; _i5 < _tf2.length; _i5++) {
        _temp2.push(_tf2[_tf2.length - _i5 - 1]);
      }
      indices.push(_temp2);
      axes.push(new CANNON.Vec3(1, 0, 0));
    }
    this.impl.vertices = vertices;
    this.impl.faces = indices;
    this.impl.uniqueAxes = axes;
    this.impl.worldVerticesNeedsUpdate = true;
    this.impl.worldFaceNormalsNeedsUpdate = true;
    this.impl.computeNormals();
    this.impl.computeEdges();
    this.impl.updateBoundingSphereRadius();
  };
  return _createClass(CannonCylinderShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }]);
}(CannonShape);

var v3_0$2 = new Vec3();
var v3_1 = new Vec3();
var CannonConeShape = function (_CannonShape) {
  function CannonConeShape(radius, height, direction) {
    var _this;
    if (radius === void 0) {
      radius = 0.5;
    }
    if (height === void 0) {
      height = 1;
    }
    if (direction === void 0) {
      direction = EAxisDirection.Y_AXIS;
    }
    _this = _CannonShape.call(this) || this;
    _this._shape = new CANNON.Cylinder(0, radius, height, CANNON.CC_CONFIG.numSegmentsCone, direction === EAxisDirection.Y_AXIS);
    return _this;
  }
  _inheritsLoose(CannonConeShape, _CannonShape);
  var _proto = CannonConeShape.prototype;
  _proto.setRadius = function setRadius(v) {
    this.updateProperties(this.collider.radius, this.collider.height, CANNON.CC_CONFIG.numSegmentsCone, this.collider.direction, this.collider.node.worldScale);
    if (this._index !== -1) commitShapeUpdates(this._body);
  };
  _proto.setHeight = function setHeight(v) {
    this.updateProperties(this.collider.radius, this.collider.height, CANNON.CC_CONFIG.numSegmentsCone, this.collider.direction, this.collider.node.worldScale);
    if (this._index !== -1) commitShapeUpdates(this._body);
  };
  _proto.setDirection = function setDirection(v) {
    this.updateProperties(this.collider.radius, this.collider.height, CANNON.CC_CONFIG.numSegmentsCone, this.collider.direction, this.collider.node.worldScale);
    if (this._index !== -1) commitShapeUpdates(this._body);
  };
  _proto.onLoad = function onLoad() {
    _CannonShape.prototype.onLoad.call(this);
    this.setRadius(this.collider.radius);
  };
  _proto.setScale = function setScale(scale) {
    _CannonShape.prototype.setScale.call(this, scale);
    this.setRadius(this.collider.radius);
  };
  _proto.updateProperties = function updateProperties(radius, height, numSegments, direction, scale) {
    var wh = height;
    var wr = radius;
    var cos = Math.cos;
    var sin = Math.sin;
    var abs = Math.abs;
    var max = Math.max;
    if (direction === 1) {
      wh = abs(scale.y) * height;
      wr = max(abs(scale.x), abs(scale.z)) * radius;
    } else if (direction === 2) {
      wh = abs(scale.z) * height;
      wr = max(abs(scale.x), abs(scale.y)) * radius;
    } else {
      wh = abs(scale.x) * height;
      wr = max(abs(scale.y), abs(scale.z)) * radius;
    }
    var N = numSegments;
    var hH = wh / 2;
    var vertices = [];
    var indices = [];
    var axes = [];
    var theta = Math.PI * 2 / N;
    if (direction === 1) {
      var bf = [];
      indices.push(bf);
      vertices.push(new CANNON.Vec3(0, hH, 0));
      for (var i = 0; i < N; i++) {
        var x = wr * cos(theta * i);
        var z = wr * sin(theta * i);
        vertices.push(new CANNON.Vec3(x, -hH, z));
      }
      for (var _i = 0; _i < N; _i++) {
        if (_i !== 0) bf.push(_i);
        var face = void 0;
        if (_i < N - 1) {
          face = [0, _i + 2, _i + 1];
        } else {
          face = [0, 1, _i + 1];
        }
        indices.push(face);
        Vec3.subtract(v3_0$2, vertices[0], vertices[face[1]]);
        Vec3.subtract(v3_1, vertices[face[2]], vertices[face[1]]);
        Vec3.cross(v3_0$2, v3_1, v3_0$2);
        v3_0$2.normalize();
        axes.push(new CANNON.Vec3(v3_0$2.x, v3_0$2.y, v3_0$2.z));
      }
      axes.push(new CANNON.Vec3(0, -1, 0));
    } else if (direction === 2) {
      var _bf = [];
      indices.push(_bf);
      vertices.push(new CANNON.Vec3(0, 0, hH));
      for (var _i2 = 0; _i2 < N; _i2++) {
        var _x = wr * cos(theta * _i2);
        var y = wr * sin(theta * _i2);
        vertices.push(new CANNON.Vec3(_x, y, -hH));
      }
      for (var _i3 = 0; _i3 < N; _i3++) {
        if (_i3 !== 0) _bf.push(N - _i3);
        var _face = void 0;
        if (_i3 < N - 1) {
          _face = [0, _i3 + 1, _i3 + 2];
        } else {
          _face = [0, _i3 + 1, 1];
        }
        indices.push(_face);
        Vec3.subtract(v3_0$2, vertices[0], vertices[_face[1]]);
        Vec3.subtract(v3_1, vertices[_face[2]], vertices[_face[1]]);
        Vec3.cross(v3_0$2, v3_0$2, v3_1);
        v3_0$2.normalize();
        axes.push(new CANNON.Vec3(v3_0$2.x, v3_0$2.y, v3_0$2.z));
      }
      axes.push(new CANNON.Vec3(0, 0, -1));
    } else {
      var _bf2 = [];
      indices.push(_bf2);
      vertices.push(new CANNON.Vec3(hH, 0, 0));
      for (var _i4 = 0; _i4 < N; _i4++) {
        var _y = wr * cos(theta * _i4);
        var _z = wr * sin(theta * _i4);
        vertices.push(new CANNON.Vec3(-hH, _y, _z));
      }
      for (var _i5 = 0; _i5 < N; _i5++) {
        if (_i5 !== 0) _bf2.push(N - _i5);
        var _face2 = void 0;
        if (_i5 < N - 1) {
          _face2 = [0, _i5 + 1, _i5 + 2];
        } else {
          _face2 = [0, _i5 + 1, 1];
        }
        indices.push(_face2);
        Vec3.subtract(v3_0$2, vertices[0], vertices[_face2[1]]);
        Vec3.subtract(v3_1, vertices[_face2[2]], vertices[_face2[1]]);
        Vec3.cross(v3_0$2, v3_0$2, v3_1);
        v3_0$2.normalize();
        axes.push(new CANNON.Vec3(v3_0$2.x, v3_0$2.y, v3_0$2.z));
      }
      axes.push(new CANNON.Vec3(-1, 0, 0));
    }
    this.impl.vertices = vertices;
    this.impl.faces = indices;
    this.impl.uniqueAxes = axes;
    this.impl.worldVerticesNeedsUpdate = true;
    this.impl.worldFaceNormalsNeedsUpdate = true;
    this.impl.computeNormals();
    this.impl.computeEdges();
    this.impl.updateBoundingSphereRadius();
  };
  return _createClass(CannonConeShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }]);
}(CannonShape);

var CANNON_AABB_LOCAL = new CANNON.AABB();
var CANNON_AABB = new CANNON.AABB();
var CANNON_TRANSFORM = new CANNON.Transform();
CANNON.Heightfield.prototype.calculateWorldAABB = function (pos, quat, min, max) {
  var frame = CANNON_TRANSFORM;
  var result = CANNON_AABB;
  Vec3.copy(frame.position, pos);
  Quat.copy(frame.quaternion, quat);
  var s = this.elementSize;
  var data = this.data;
  CANNON_AABB_LOCAL.lowerBound.set(0, 0, this.minValue);
  CANNON_AABB_LOCAL.upperBound.set((data.length - 1) * s, (data[0].length - 1) * s, this.maxValue);
  CANNON_AABB_LOCAL.toWorldFrame(frame, result);
  min.copy(result.lowerBound);
  max.copy(result.upperBound);
};
var CannonTerrainShape = function (_CannonShape) {
  function CannonTerrainShape() {
    var _this;
    _this = _CannonShape.call(this) || this;
    _this.data = void 0;
    _this.options = void 0;
    _this._terrainID = void 0;
    _this.data = [[]];
    _this.options = {
      elementSize: 0
    };
    _this._terrainID = '';
    return _this;
  }
  _inheritsLoose(CannonTerrainShape, _CannonShape);
  var _proto = CannonTerrainShape.prototype;
  _proto.setTerrain = function setTerrain(v) {
    if (v) {
      if (this._terrainID !== v._uuid) {
        var terrain = v;
        var sizeI = terrain.getVertexCountI();
        var sizeJ = terrain.getVertexCountJ();
        this._terrainID = terrain._uuid;
        this.data.length = sizeI - 1;
        for (var i = 0; i < sizeI; i++) {
          if (this.data[i] == null) this.data[i] = [];
          this.data[i].length = sizeJ - 1;
          for (var j = 0; j < sizeJ; j++) {
            this.data[i][j] = terrain.getHeight(i, sizeJ - 1 - j);
          }
        }
        this.options.elementSize = terrain.tileSize;
        this.updateProperties(this.data, this.options.elementSize);
      }
    } else if (this._terrainID !== '') {
      this._terrainID = '';
      this.data.length = 1;
      this.data[0] = this.data[0] || [];
      this.data[0].length = 0;
      this.options.elementSize = 0;
      this.updateProperties(this.data, this.options.elementSize);
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    var terrain = this.collider.terrain;
    if (terrain) {
      var sizeI = terrain.getVertexCountI();
      var sizeJ = terrain.getVertexCountJ();
      for (var i = 0; i < sizeI; i++) {
        if (this.data[i] == null) this.data[i] = [];
        for (var j = 0; j < sizeJ; j++) {
          this.data[i][j] = terrain.getHeight(i, sizeJ - 1 - j);
        }
      }
      this.options.elementSize = terrain.tileSize;
      this._terrainID = terrain._uuid;
    }
    this._shape = new CANNON.Heightfield(this.data, this.options);
  };
  _proto.onLoad = function onLoad() {
    _CannonShape.prototype.onLoad.call(this);
    this.setTerrain(this.collider.terrain);
  };
  _proto.updateProperties = function updateProperties(data, elementSize) {
    var impl = this.impl;
    impl.data = data;
    impl.elementSize = elementSize;
    impl.updateMinValue();
    impl.updateMaxValue();
    impl.updateBoundingSphereRadius();
    impl.update();
    if (this._index >= 0) {
      commitShapeUpdates(this._body);
    }
  };
  _proto._setCenter = function _setCenter(v) {
    var terrain = this.collider.terrain;
    if (terrain) {
      Quat.fromEuler(this._orient, -90, 0, 0);
      var lpos = this._offset;
      Vec3.set(lpos, 0, 0, (terrain.getVertexCountJ() - 1) * terrain.tileSize);
      Vec3.add(lpos, lpos, v);
    }
  };
  return _createClass(CannonTerrainShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }]);
}(CannonShape);

var CannonSimplexShape = function (_CannonShape) {
  function CannonSimplexShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _CannonShape.call.apply(_CannonShape, [this].concat(args)) || this;
    _this.vertices = [];
    return _this;
  }
  _inheritsLoose(CannonSimplexShape, _CannonShape);
  var _proto = CannonSimplexShape.prototype;
  _proto.setShapeType = function setShapeType(v) {
    if (this._isBinding) ;
  };
  _proto.setVertices = function setVertices(v) {
    var length = this.vertices.length;
    if (length === 4) {
      var ws = this._collider.node.worldScale;
      for (var i = 0; i < length; i++) {
        Vec3.multiply(this.vertices[i], ws, v[i]);
      }
      var impl = this.impl;
      impl.computeNormals();
      impl.computeEdges();
      impl.updateBoundingSphereRadius();
    }
    if (this._index !== -1) {
      commitShapeUpdates(this._body);
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    var type = this.collider.shapeType;
    if (type === SimplexCollider.ESimplexType.TETRAHEDRON) {
      for (var i = 0; i < 4; i++) {
        this.vertices[i] = new CANNON.Vec3(0, 0, 0);
      }
      this._shape = createTetra(this.vertices);
    } else {
      if (type !== SimplexCollider.ESimplexType.VERTEX) ;
      this._shape = new CANNON.Particle();
    }
  };
  _proto.onLoad = function onLoad() {
    _CannonShape.prototype.onLoad.call(this);
    this.collider.updateVertices();
  };
  _proto.setScale = function setScale(scale) {
    _CannonShape.prototype.setScale.call(this, scale);
    this.collider.updateVertices();
  };
  return _createClass(CannonSimplexShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }]);
}(CannonShape);
var createTetra = function () {
  var faces = [[0, 3, 2], [0, 1, 3], [0, 2, 1], [1, 2, 3]];
  return function (verts) {
    return new CANNON.ConvexPolyhedron(verts, faces);
  };
}();

var CannonPlaneShape = function (_CannonShape) {
  function CannonPlaneShape() {
    var _this;
    _this = _CannonShape.call(this) || this;
    _this._shape = new CANNON.Plane();
    return _this;
  }
  _inheritsLoose(CannonPlaneShape, _CannonShape);
  var _proto = CannonPlaneShape.prototype;
  _proto.setNormal = function setNormal(v) {
    Quat.rotationTo(this._orient, Vec3.UNIT_Z, v);
    if (this._index !== -1) {
      commitShapeUpdates(this._body);
    }
  };
  _proto.setConstant = function setConstant(v) {
    Vec3.scaleAndAdd(this._offset, this._collider.center, this.collider.normal, v);
  };
  _proto.onLoad = function onLoad() {
    _CannonShape.prototype.onLoad.call(this);
    this.setConstant(this.collider.constant);
    this.setNormal(this.collider.normal);
  };
  _proto._setCenter = function _setCenter(v) {
    _CannonShape.prototype._setCenter.call(this, v);
    this.setConstant(this.collider.constant);
  };
  return _createClass(CannonPlaneShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._shape;
    }
  }]);
}(CannonShape);

CANNON.World.staticBody = new CANNON.Body();
CANNON.World.idToConstraintMap = {};
var CannonConstraint = function () {
  function CannonConstraint() {
    this._impl = void 0;
    this._com = void 0;
    this._rigidBody = void 0;
    this._connectedBody = void 0;
  }
  var _proto = CannonConstraint.prototype;
  _proto.setConnectedBody = function setConnectedBody(v) {
    if (this._connectedBody === v) return;
    var oldBody2 = this._connectedBody;
    if (oldBody2) {
      var oldSB2 = oldBody2.body.sharedBody;
      oldSB2.removeJoint(this, 1);
    }
    var sb = this._rigidBody.body.sharedBody;
    sb.removeJoint(this, 0);
    if (this._impl) {
      sb.wrappedWorld.removeConstraint(this);
      delete CANNON.World.idToConstraintMap[this._impl.id];
      this._impl = null;
    }
    this._connectedBody = v;
    var connect = this._connectedBody;
    this.onComponentSet();
    this.setEnableCollision(this._com.enableCollision);
    CANNON.World.idToConstraintMap[this._impl.id] = this._impl;
    sb.wrappedWorld.addConstraint(this);
    sb.addJoint(this, 0);
    if (connect) {
      var newSB2 = connect.body.sharedBody;
      newSB2.addJoint(this, 1);
    }
  };
  _proto.setEnableCollision = function setEnableCollision(v) {
    this._impl.collideConnected = v;
  };
  _proto.initialize = function initialize(v) {
    this._com = v;
    this._rigidBody = v.attachedBody;
    this._connectedBody = v.connectedBody;
    this.onComponentSet();
    this.setEnableCollision(v.enableCollision);
    CANNON.World.idToConstraintMap[this._impl.id] = this._impl;
  };
  _proto.onComponentSet = function onComponentSet() {};
  _proto.updateScale0 = function updateScale0() {};
  _proto.updateScale1 = function updateScale1() {};
  _proto.onEnable = function onEnable() {
    var sb = this._rigidBody.body.sharedBody;
    sb.wrappedWorld.addConstraint(this);
    sb.addJoint(this, 0);
    var connect = this._connectedBody;
    if (connect) {
      var sb2 = connect.body.sharedBody;
      sb2.addJoint(this, 1);
    }
  };
  _proto.onDisable = function onDisable() {
    var sb = this._rigidBody.body.sharedBody;
    sb.wrappedWorld.removeConstraint(this);
    sb.removeJoint(this, 0);
    var connect = this._connectedBody;
    if (connect) {
      var sb2 = connect.body.sharedBody;
      sb2.removeJoint(this, 1);
    }
  };
  _proto.onDestroy = function onDestroy() {
    delete CANNON.World.idToConstraintMap[this._impl.id];
    this._com = null;
    this._rigidBody = null;
    this._connectedBody = null;
    this._impl = null;
  };
  return _createClass(CannonConstraint, [{
    key: "impl",
    get: function get() {
      return this._impl;
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}();

var v3_0$1 = new Vec3();
var CannonPointToPointConstraint = function (_CannonConstraint) {
  function CannonPointToPointConstraint() {
    return _CannonConstraint.apply(this, arguments) || this;
  }
  _inheritsLoose(CannonPointToPointConstraint, _CannonConstraint);
  var _proto = CannonPointToPointConstraint.prototype;
  _proto.setPivotA = function setPivotA(v) {
    var cs = this.constraint;
    Vec3.multiply(this.impl.pivotA, cs.node.worldScale, cs.pivotA);
    if (!cs.connectedBody) this.setPivotB(cs.pivotB);
  };
  _proto.setPivotB = function setPivotB(v) {
    var cs = this.constraint;
    var cb = cs.connectedBody;
    if (cb) {
      Vec3.multiply(this.impl.pivotB, cb.node.worldScale, cs.pivotB);
    } else {
      var node = cs.node;
      Vec3.multiply(v3_0$1, node.worldScale, cs.pivotA);
      Vec3.transformQuat(v3_0$1, v3_0$1, node.worldRotation);
      Vec3.add(v3_0$1, v3_0$1, node.worldPosition);
      Vec3.copy(this.impl.pivotB, v3_0$1);
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    var bodyA = this._rigidBody.body.impl;
    var cb = this.constraint.connectedBody;
    var bodyB = CANNON.World.staticBody;
    if (cb) {
      bodyB = cb.body.impl;
    }
    this._impl = new CANNON.PointToPointConstraint(bodyA, null, bodyB);
    this.setPivotA(this.constraint.pivotA);
    this.setPivotB(this.constraint.pivotB);
  };
  _proto.updateScale0 = function updateScale0() {
    this.setPivotA(this.constraint.pivotA);
  };
  _proto.updateScale1 = function updateScale1() {
    this.setPivotB(this.constraint.pivotB);
  };
  return _createClass(CannonPointToPointConstraint, [{
    key: "impl",
    get: function get() {
      return this._impl;
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(CannonConstraint);

var v3_0 = new Vec3();
var quat_0 = new Quat();
var CannonHingeConstraint = function (_CannonConstraint) {
  function CannonHingeConstraint() {
    return _CannonConstraint.apply(this, arguments) || this;
  }
  _inheritsLoose(CannonHingeConstraint, _CannonConstraint);
  var _proto = CannonHingeConstraint.prototype;
  _proto.setPivotA = function setPivotA(v) {
    var cs = this.constraint;
    Vec3.multiply(this.impl.pivotA, this.constraint.node.worldScale, cs.pivotA);
    if (!cs.connectedBody) this.setPivotB(cs.pivotB);
  };
  _proto.setPivotB = function setPivotB(v) {
    var cs = this.constraint;
    var cb = cs.connectedBody;
    if (cb) {
      Vec3.multiply(this.impl.pivotB, cb.node.worldScale, cs.pivotB);
    } else {
      var node = this.constraint.node;
      Vec3.multiply(v3_0, node.worldScale, cs.pivotA);
      Vec3.transformQuat(v3_0, v3_0, node.worldRotation);
      Vec3.add(v3_0, v3_0, node.worldPosition);
      Vec3.copy(this.impl.pivotB, v3_0);
    }
  };
  _proto.setAxis = function setAxis(v) {
    var equations = this.impl.equations;
    Vec3.copy(this.impl.axisA, v);
    Vec3.copy(equations[3].axisA, v);
    Vec3.copy(equations[4].axisA, v);
    Vec3.copy(equations[5].axisA, v);
    if (this.constraint.connectedBody) {
      Vec3.transformQuat(this.impl.axisB, v, this.constraint.node.worldRotation);
      Quat.invert(quat_0, this.constraint.connectedBody.node.worldRotation);
      Vec3.transformQuat(this.impl.axisB, this.impl.axisB, quat_0);
      Vec3.copy(equations[3].axisB, this.impl.axisB);
      Vec3.copy(equations[4].axisB, this.impl.axisB);
      Vec3.copy(equations[5].axisB, this.impl.axisB);
    } else {
      Vec3.transformQuat(this.impl.axisB, v, this.constraint.node.worldRotation);
      Vec3.copy(equations[3].axisB, this.impl.axisB);
      Vec3.copy(equations[4].axisB, this.impl.axisB);
      Vec3.copy(equations[5].axisB, this.impl.axisB);
    }
  };
  _proto.setLimitEnabled = function setLimitEnabled(v) {
    warnID(9613);
  };
  _proto.setLowerLimit = function setLowerLimit(min) {
    warnID(9613);
  };
  _proto.setUpperLimit = function setUpperLimit(max) {
    warnID(9613);
  };
  _proto.setMotorEnabled = function setMotorEnabled(v) {
    warnID(9613);
  };
  _proto.setMotorVelocity = function setMotorVelocity(v) {
    warnID(9613);
  };
  _proto.setMotorForceLimit = function setMotorForceLimit(v) {
    warnID(9613);
  };
  _proto.onComponentSet = function onComponentSet() {
    var bodyA = this._rigidBody.body.impl;
    var cb = this.constraint.connectedBody;
    var bodyB = CANNON.World.staticBody;
    if (cb) {
      bodyB = cb.body.impl;
    }
    this._impl = new CANNON.HingeConstraint(bodyA, bodyB);
    this.setPivotA(this.constraint.pivotA);
    this.setPivotB(this.constraint.pivotB);
    this.setAxis(this.constraint.axis);
  };
  _proto.updateScale0 = function updateScale0() {
    this.setPivotA(this.constraint.pivotA);
  };
  _proto.updateScale1 = function updateScale1() {
    this.setPivotB(this.constraint.pivotB);
  };
  return _createClass(CannonHingeConstraint, [{
    key: "impl",
    get: function get() {
      return this._impl;
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(CannonConstraint);

var CannonLockConstraint = function (_CannonConstraint) {
  function CannonLockConstraint() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _CannonConstraint.call.apply(_CannonConstraint, [this].concat(args)) || this;
    _this._breakForce = 1e9;
    return _this;
  }
  _inheritsLoose(CannonLockConstraint, _CannonConstraint);
  var _proto = CannonLockConstraint.prototype;
  _proto.setBreakForce = function setBreakForce(v) {
    this._breakForce = v;
    this.updateFrame();
  };
  _proto.setBreakTorque = function setBreakTorque(v) {};
  _proto.onComponentSet = function onComponentSet() {
    this._breakForce = this.constraint.breakForce;
    this.updateFrame();
  };
  _proto.updateFrame = function updateFrame() {
    var bodyA = this._rigidBody.body.impl;
    var cb = this.constraint.connectedBody;
    var bodyB = CANNON.World.staticBody;
    if (cb) {
      bodyB = cb.body.impl;
    }
    this._impl = new CANNON.LockConstraint(bodyA, bodyB, {
      maxForce: this._breakForce
    });
  };
  _proto.updateScale0 = function updateScale0() {
    this.updateFrame();
  };
  _proto.updateScale1 = function updateScale1() {
    this.updateFrame();
  };
  return _createClass(CannonLockConstraint, [{
    key: "impl",
    get: function get() {
      return this._impl;
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(CannonConstraint);

game.once(Game.EVENT_PRE_SUBSYSTEM_INIT, function () {
  selector.register('cannon.js', {
    PhysicsWorld: CannonWorld,
    RigidBody: CannonRigidBody,
    BoxShape: CannonBoxShape,
    SphereShape: CannonSphereShape,
    TrimeshShape: CannonTrimeshShape,
    CylinderShape: CannonCylinderShape,
    ConeShape: CannonConeShape,
    TerrainShape: CannonTerrainShape,
    SimplexShape: CannonSimplexShape,
    PlaneShape: CannonPlaneShape,
    PointToPointConstraint: CannonPointToPointConstraint,
    HingeConstraint: CannonHingeConstraint,
    FixedConstraint: CannonLockConstraint
  });
});

if (globalThis) globalThis.CANNON = CANNON;
CANNON.CC_CONFIG = {
  numSegmentsCone: 12,
  numSegmentsCylinder: 12,
  ignoreSelfBody: true,
  correctInelastic: 3
};
CANNON.ArrayCollisionMatrix.prototype.reset = function reset() {
  for (var key in this.matrix) {
    delete this.matrix[key];
  }
};
CANNON.Ray.perBodyFilter = function (r, b) {
  return (r.collisionFilterMask & b.collisionFilterGroup) !== 0;
};
//# sourceMappingURL=physics-cannon.js.map
