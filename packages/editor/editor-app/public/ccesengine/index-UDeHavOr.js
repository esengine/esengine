import { _ as _inheritsLoose, a as _createClass, b as _applyDecoratedDescriptor, q as CCFloat, L as log, e as warn, k as errorID, s as settings, S as SettingsCategory, w as warnID, E as Enum, R as RecyclePool, Q as error, Z as Eventify, C as CCBoolean } from './gc-object-CShF5lzx.js';
import { E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';
import { c as ccclass, t as type, aa as equals, b as applyDecoratedInitializer, s as serializable, f as Vec3, R as Ray, S as System, d as disallowMultiple, l as executionOrder, J as AABB, _ as Sphere, am as absMax, r as requireComponent, k as formerlySerializedAs } from './index-uXI1_UMk.js';
import { g as game } from './deprecated-Dswa7XeN.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { A as Asset, C as Component } from './node-event-Ccvtv8bJ.js';
import { b as EColliderType, f as EConstraintType, g as ECharacterControllerType, P as PhysicsGroup, C as CollisionMatrix, a as ERigidBodyType, E as EAxisDirection, h as ESimplexType, d as EConstraintMode, e as EDriverMode, i as ED6Axis, c as EPhysicsDrawFlags } from './collision-matrix-55yq71jP.js';
import { d as builtinResMgr, k as assetManager } from './scene-vWcxM1_c.js';
import './deprecated-n0w4kK7g.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { a as absolute, u as util } from './util-Cxn5lV0H.js';
import { M as Mesh } from './mesh-XWfHgs1t.js';
import './skeleton-CBhmWmEt.js';
import { c as TerrainAsset } from './terrain-asset-BMvu7XYU.js';

var _dec$k, _dec2$j, _dec3$a, _dec4$9, _dec5$7, _class$k, _class2$k, _initializer$k, _initializer2$h, _initializer3$a, _initializer4$5, _PhysicsMaterial;
var PhysicsMaterial = (_dec$k = ccclass('cc.PhysicsMaterial'), _dec2$j = type(CCFloat), _dec3$a = type(CCFloat), _dec4$9 = type(CCFloat), _dec5$7 = type(CCFloat), _dec$k(_class$k = (_class2$k = (_PhysicsMaterial = function (_Asset) {
  function PhysicsMaterial() {
    var _this;
    _this = _Asset.call(this) || this;
    _this.id = void 0;
    _this._friction = _initializer$k && _initializer$k();
    _this._rollingFriction = _initializer2$h && _initializer2$h();
    _this._spinningFriction = _initializer3$a && _initializer3$a();
    _this._restitution = _initializer4$5 && _initializer4$5();
    PhysicsMaterial.allMaterials.push(_this);
    _this.id = PhysicsMaterial._idCounter++;
    if (!_this._uuid) _this._uuid = "pm_" + _this.id;
    return _this;
  }
  _inheritsLoose(PhysicsMaterial, _Asset);
  var _proto = PhysicsMaterial.prototype;
  _proto.clone = function clone() {
    var c = new PhysicsMaterial();
    c._friction = this._friction;
    c._restitution = this._restitution;
    c._rollingFriction = this._rollingFriction;
    c._spinningFriction = this._spinningFriction;
    return c;
  };
  _proto.destroy = function destroy() {
    if (_Asset.prototype.destroy.call(this)) {
      var idx = PhysicsMaterial.allMaterials.indexOf(this);
      if (idx >= 0) {
        PhysicsMaterial.allMaterials.splice(idx, 1);
      }
      return true;
    }
    return false;
  };
  _proto.setValues = function setValues(friction, rollingFriction, spinningFriction, restitution) {
    var emitUpdate = this._friction !== friction || this._rollingFriction !== rollingFriction || this._spinningFriction !== spinningFriction || this._restitution !== restitution;
    this._friction = friction;
    this._rollingFriction = rollingFriction;
    this._spinningFriction = spinningFriction;
    this._restitution = restitution;
    if (emitUpdate) this.emit(PhysicsMaterial.EVENT_UPDATE);
  };
  return _createClass(PhysicsMaterial, [{
    key: "friction",
    get: function get() {
      return this._friction;
    },
    set: function set(value) {
      if (!equals(this._friction, value)) {
        this._friction = value;
        this.emit(PhysicsMaterial.EVENT_UPDATE);
      }
    }
  }, {
    key: "rollingFriction",
    get: function get() {
      return this._rollingFriction;
    },
    set: function set(value) {
      if (!equals(this._rollingFriction, value)) {
        this._rollingFriction = value;
        this.emit(PhysicsMaterial.EVENT_UPDATE);
      }
    }
  }, {
    key: "spinningFriction",
    get: function get() {
      return this._spinningFriction;
    },
    set: function set(value) {
      if (!equals(this._spinningFriction, value)) {
        this._spinningFriction = value;
        this.emit(PhysicsMaterial.EVENT_UPDATE);
      }
    }
  }, {
    key: "restitution",
    get: function get() {
      return this._restitution;
    },
    set: function set(value) {
      if (!equals(this._restitution, value)) {
        this._restitution = value;
        this.emit(PhysicsMaterial.EVENT_UPDATE);
      }
    }
  }]);
}(Asset), _PhysicsMaterial.allMaterials = [], _PhysicsMaterial.EVENT_UPDATE = 'event_update', _PhysicsMaterial._idCounter = 0, _PhysicsMaterial), _applyDecoratedDescriptor(_class2$k.prototype, "friction", [_dec2$j], Object.getOwnPropertyDescriptor(_class2$k.prototype, "friction"), _class2$k.prototype), _applyDecoratedDescriptor(_class2$k.prototype, "rollingFriction", [_dec3$a], Object.getOwnPropertyDescriptor(_class2$k.prototype, "rollingFriction"), _class2$k.prototype), _applyDecoratedDescriptor(_class2$k.prototype, "spinningFriction", [_dec4$9], Object.getOwnPropertyDescriptor(_class2$k.prototype, "spinningFriction"), _class2$k.prototype), _applyDecoratedDescriptor(_class2$k.prototype, "restitution", [_dec5$7], Object.getOwnPropertyDescriptor(_class2$k.prototype, "restitution"), _class2$k.prototype), _initializer$k = applyDecoratedInitializer(_class2$k.prototype, "_friction", [serializable], function () {
  return 0.6;
}), _initializer2$h = applyDecoratedInitializer(_class2$k.prototype, "_rollingFriction", [serializable], function () {
  return 0.0;
}), _initializer3$a = applyDecoratedInitializer(_class2$k.prototype, "_spinningFriction", [serializable], function () {
  return 0.0;
}), _initializer4$5 = applyDecoratedInitializer(_class2$k.prototype, "_restitution", [serializable], function () {
  return 0.0;
}), _class2$k)) || _class$k);

var PhysicsRayResult = function () {
  function PhysicsRayResult() {
    this._hitPoint = new Vec3();
    this._hitNormal = new Vec3();
    this._distance = 0;
    this._collider = null;
    this._closestHitFraction = 0;
  }
  var _proto = PhysicsRayResult.prototype;
  _proto._assign = function _assign(hitPoint, distance, collider, hitNormal, closestHitFraction) {
    Vec3.copy(this._hitPoint, hitPoint);
    Vec3.copy(this._hitNormal, hitNormal);
    this._distance = distance;
    this._collider = collider;
    if (closestHitFraction) this._closestHitFraction = closestHitFraction;
  };
  _proto.clone = function clone() {
    var c = new PhysicsRayResult();
    Vec3.copy(c._hitPoint, this._hitPoint);
    Vec3.copy(c._hitNormal, this._hitNormal);
    c._distance = this._distance;
    c._collider = this._collider;
    c._closestHitFraction = this._closestHitFraction;
    return c;
  };
  return _createClass(PhysicsRayResult, [{
    key: "hitPoint",
    get: function get() {
      return this._hitPoint;
    }
  }, {
    key: "distance",
    get: function get() {
      return this._distance;
    }
  }, {
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "hitNormal",
    get: function get() {
      return this._hitNormal;
    }
  }, {
    key: "closestHitFraction",
    get: function get() {
      return this._closestHitFraction;
    }
  }]);
}();
var PhysicsLineStripCastResult = function (_PhysicsRayResult2) {
  function PhysicsLineStripCastResult() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PhysicsRayResult2.call.apply(_PhysicsRayResult2, [this].concat(args)) || this;
    _this._id = 0;
    return _this;
  }
  _inheritsLoose(PhysicsLineStripCastResult, _PhysicsRayResult2);
  var _proto2 = PhysicsLineStripCastResult.prototype;
  _proto2._assign = function _assign(hitPoint, distance, collider, hitNormal, id) {
    if (id === void 0) {
      id = 0;
    }
    _PhysicsRayResult2.prototype._assign.call(this, hitPoint, distance, collider, hitNormal);
    this._id = id;
  };
  _proto2.clone = function clone() {
    var c = new PhysicsLineStripCastResult();
    Vec3.copy(c._hitPoint, this._hitPoint);
    Vec3.copy(c._hitNormal, this._hitNormal);
    c._distance = this._distance;
    c._collider = this._collider;
    c._id = this._id;
    return c;
  };
  return _createClass(PhysicsLineStripCastResult, [{
    key: "id",
    get: function get() {
      return this._id;
    }
  }]);
}(PhysicsRayResult);

function updateLegacyMacro(id) {
  cclegacy._global.CC_PHYSICS_BUILTIN = id === 'builtin';
  cclegacy._global.CC_PHYSICS_CANNON = id === 'cannon.js';
  cclegacy._global.CC_PHYSICS_AMMO = id === 'bullet';
}
function register(id, wrapper) {
  log("[PHYSICS]: register " + id + ".");
  selector.backend[id] = wrapper;
  if (!selector.physicsWorld || selector.id === id) {
    updateLegacyMacro(id);
    var mutableSelector = selector;
    mutableSelector.id = id;
    mutableSelector.wrapper = wrapper;
  }
}
var worldInitData;
function switchTo(id) {
  if (!selector.runInEditor) return;
  var mutableSelector = selector;
  if (selector.physicsWorld && id !== selector.id && selector.backend[id] != null) {
    selector.physicsWorld.destroy();
    log("[PHYSICS]: switch from " + selector.id + " to " + id + ".");
    updateLegacyMacro(id);
    mutableSelector.id = id;
    mutableSelector.wrapper = selector.backend[id];
    mutableSelector.physicsWorld = createPhysicsWorld();
  } else {
    log("[PHYSICS]: using " + id + ".");
    mutableSelector.physicsWorld = createPhysicsWorld();
  }
  if (worldInitData) {
    var world = mutableSelector.physicsWorld;
    world.setGravity(worldInitData.gravity);
    world.setAllowSleep(worldInitData.allowSleep);
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
function constructDefaultWorld(data) {
  if (!worldInitData) worldInitData = data;
  if (!selector.runInEditor) return;
  if (!selector.physicsWorld) {
    log("[PHYSICS]: using " + selector.id + ".");
    var mutableSelector = selector;
    var world = mutableSelector.physicsWorld = createPhysicsWorld();
    world.setGravity(worldInitData.gravity);
    world.setAllowSleep(worldInitData.allowSleep);
  }
}
var FUNC = function FUNC() {
  return 0;
};
var ENTIRE_WORLD = {
  impl: null,
  debugDrawFlags: 0,
  debugDrawConstraintSize: 0,
  setGravity: FUNC,
  setAllowSleep: FUNC,
  setDefaultMaterial: FUNC,
  step: FUNC,
  syncAfterEvents: FUNC,
  syncSceneToPhysics: FUNC,
  raycast: FUNC,
  raycastClosest: FUNC,
  sweepBox: FUNC,
  sweepBoxClosest: FUNC,
  sweepSphere: FUNC,
  sweepSphereClosest: FUNC,
  sweepCapsule: FUNC,
  sweepCapsuleClosest: FUNC,
  emitEvents: FUNC,
  destroy: FUNC
};
var ECheckType;
(function (ECheckType) {
  ECheckType[ECheckType["World"] = 0] = "World";
  ECheckType[ECheckType["RigidBody"] = 1] = "RigidBody";
  ECheckType[ECheckType["BoxCollider"] = 2] = "BoxCollider";
  ECheckType[ECheckType["SphereCollider"] = 3] = "SphereCollider";
  ECheckType[ECheckType["CapsuleCollider"] = 4] = "CapsuleCollider";
  ECheckType[ECheckType["MeshCollider"] = 5] = "MeshCollider";
  ECheckType[ECheckType["CylinderCollider"] = 6] = "CylinderCollider";
  ECheckType[ECheckType["ConeCollider"] = 7] = "ConeCollider";
  ECheckType[ECheckType["TerrainCollider"] = 8] = "TerrainCollider";
  ECheckType[ECheckType["SimplexCollider"] = 9] = "SimplexCollider";
  ECheckType[ECheckType["PlaneCollider"] = 10] = "PlaneCollider";
  ECheckType[ECheckType["PointToPointConstraint"] = 11] = "PointToPointConstraint";
  ECheckType[ECheckType["HingeConstraint"] = 12] = "HingeConstraint";
  ECheckType[ECheckType["FixedConstraint"] = 13] = "FixedConstraint";
  ECheckType[ECheckType["ConfigurableConstraint"] = 14] = "ConfigurableConstraint";
  ECheckType[ECheckType["BoxCharacterController"] = 15] = "BoxCharacterController";
  ECheckType[ECheckType["CapsuleCharacterController"] = 16] = "CapsuleCharacterController";
})(ECheckType || (ECheckType = {}));
function check(obj, type) {
  if (obj == null) {
    if (selector.id) {
      warn(selector.id + " physics does not support " + ECheckType[type]);
    } else {
      errorID(9600);
    }
    return true;
  }
  return false;
}
function createPhysicsWorld() {
  if (check(selector.wrapper.PhysicsWorld, ECheckType.World)) {
    return ENTIRE_WORLD;
  }
  return new selector.wrapper.PhysicsWorld();
}
var ENTIRE_RIGID_BODY = {
  impl: null,
  rigidBody: null,
  isAwake: false,
  isSleepy: false,
  isSleeping: false,
  initialize: FUNC,
  onEnable: FUNC,
  onDisable: FUNC,
  onDestroy: FUNC,
  setType: FUNC,
  setMass: FUNC,
  setLinearDamping: FUNC,
  setAngularDamping: FUNC,
  useGravity: FUNC,
  setLinearFactor: FUNC,
  setAngularFactor: FUNC,
  setAllowSleep: FUNC,
  wakeUp: FUNC,
  sleep: FUNC,
  clearState: FUNC,
  clearForces: FUNC,
  clearVelocity: FUNC,
  setSleepThreshold: FUNC,
  getSleepThreshold: FUNC,
  getLinearVelocity: FUNC,
  setLinearVelocity: FUNC,
  getAngularVelocity: FUNC,
  setAngularVelocity: FUNC,
  applyForce: FUNC,
  applyLocalForce: FUNC,
  applyImpulse: FUNC,
  applyLocalImpulse: FUNC,
  applyTorque: FUNC,
  applyLocalTorque: FUNC,
  setGroup: FUNC,
  getGroup: FUNC,
  addGroup: FUNC,
  removeGroup: FUNC,
  setMask: FUNC,
  getMask: FUNC,
  addMask: FUNC,
  removeMask: FUNC,
  isUsingCCD: FUNC,
  useCCD: FUNC
};
function createRigidBody() {
  if (check(selector.wrapper.RigidBody, ECheckType.RigidBody)) {
    return ENTIRE_RIGID_BODY;
  }
  return new selector.wrapper.RigidBody();
}
var CREATE_COLLIDER_PROXY = {
  INITED: false
};
var ENTIRE_SHAPE = {
  impl: null,
  collider: null,
  attachedRigidBody: null,
  initialize: FUNC,
  onLoad: FUNC,
  onEnable: FUNC,
  onDisable: FUNC,
  onDestroy: FUNC,
  setGroup: FUNC,
  getGroup: FUNC,
  addGroup: FUNC,
  removeGroup: FUNC,
  setMask: FUNC,
  getMask: FUNC,
  addMask: FUNC,
  removeMask: FUNC,
  setMaterial: FUNC,
  setAsTrigger: FUNC,
  setCenter: FUNC,
  getAABB: FUNC,
  getBoundingSphere: FUNC,
  updateSize: FUNC,
  updateRadius: FUNC,
  setRadius: FUNC,
  setCylinderHeight: FUNC,
  setDirection: FUNC,
  setHeight: FUNC,
  setShapeType: FUNC,
  setVertices: FUNC,
  setMesh: FUNC,
  setTerrain: FUNC,
  setNormal: FUNC,
  setConstant: FUNC,
  updateEventListener: FUNC
};
function createShape(type) {
  initColliderProxy();
  return CREATE_COLLIDER_PROXY[type]();
}
function initColliderProxy() {
  if (CREATE_COLLIDER_PROXY.INITED) return;
  CREATE_COLLIDER_PROXY.INITED = true;
  CREATE_COLLIDER_PROXY[EColliderType.BOX] = function createBoxShape() {
    if (check(selector.wrapper.BoxShape, ECheckType.BoxCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.BoxShape();
  };
  CREATE_COLLIDER_PROXY[EColliderType.SPHERE] = function createSphereShape() {
    if (check(selector.wrapper.SphereShape, ECheckType.SphereCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.SphereShape();
  };
  CREATE_COLLIDER_PROXY[EColliderType.CAPSULE] = function createCapsuleShape() {
    if (check(selector.wrapper.CapsuleShape, ECheckType.CapsuleCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.CapsuleShape();
  };
  CREATE_COLLIDER_PROXY[EColliderType.CYLINDER] = function createCylinderShape() {
    if (check(selector.wrapper.CylinderShape, ECheckType.CylinderCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.CylinderShape();
  };
  CREATE_COLLIDER_PROXY[EColliderType.CONE] = function createConeShape() {
    if (check(selector.wrapper.ConeShape, ECheckType.ConeCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.ConeShape();
  };
  CREATE_COLLIDER_PROXY[EColliderType.MESH] = function createTrimeshShape() {
    if (check(selector.wrapper.TrimeshShape, ECheckType.MeshCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.TrimeshShape();
  };
  CREATE_COLLIDER_PROXY[EColliderType.TERRAIN] = function createTerrainShape() {
    if (check(selector.wrapper.TerrainShape, ECheckType.TerrainCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.TerrainShape();
  };
  CREATE_COLLIDER_PROXY[EColliderType.SIMPLEX] = function createSimplexShape() {
    if (check(selector.wrapper.SimplexShape, ECheckType.SimplexCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.SimplexShape();
  };
  CREATE_COLLIDER_PROXY[EColliderType.PLANE] = function createPlaneShape() {
    if (check(selector.wrapper.PlaneShape, ECheckType.PlaneCollider)) {
      return ENTIRE_SHAPE;
    }
    return new selector.wrapper.PlaneShape();
  };
}
var CREATE_CONSTRAINT_PROXY = {
  INITED: false
};
var ENTIRE_CONSTRAINT = {
  impl: null,
  initialize: FUNC,
  onLoad: FUNC,
  onEnable: FUNC,
  onDisable: FUNC,
  onDestroy: FUNC,
  setEnableCollision: FUNC,
  setConnectedBody: FUNC,
  setPivotA: FUNC,
  setPivotB: FUNC,
  setAxis: FUNC,
  setSecondaryAxis: FUNC,
  setBreakForce: FUNC,
  setBreakTorque: FUNC,
  setConstraintMode: FUNC,
  setLinearLimit: FUNC,
  setAngularExtent: FUNC,
  setLinearSoftConstraint: FUNC,
  setLinearStiffness: FUNC,
  setLinearDamping: FUNC,
  setLinearRestitution: FUNC,
  setSwingSoftConstraint: FUNC,
  setTwistSoftConstraint: FUNC,
  setSwingStiffness: FUNC,
  setSwingDamping: FUNC,
  setSwingRestitution: FUNC,
  setTwistStiffness: FUNC,
  setTwistDamping: FUNC,
  setTwistRestitution: FUNC,
  setDriverMode: FUNC,
  setLinearMotorTarget: FUNC,
  setLinearMotorVelocity: FUNC,
  setLinearMotorForceLimit: FUNC,
  setAngularMotorTarget: FUNC,
  setAngularMotorVelocity: FUNC,
  setAngularMotorForceLimit: FUNC,
  setAutoPivotB: FUNC,
  setLimitEnabled: FUNC,
  setLowerLimit: FUNC,
  setUpperLimit: FUNC,
  setMotorEnabled: FUNC,
  setMotorVelocity: FUNC,
  setMotorForceLimit: FUNC
};
function createConstraint(type) {
  initConstraintProxy();
  return CREATE_CONSTRAINT_PROXY[type]();
}
function initConstraintProxy() {
  if (CREATE_CONSTRAINT_PROXY.INITED) return;
  CREATE_CONSTRAINT_PROXY.INITED = true;
  CREATE_CONSTRAINT_PROXY[EConstraintType.POINT_TO_POINT] = function createPointToPointConstraint() {
    if (check(selector.wrapper.PointToPointConstraint, ECheckType.PointToPointConstraint)) {
      return ENTIRE_CONSTRAINT;
    }
    return new selector.wrapper.PointToPointConstraint();
  };
  CREATE_CONSTRAINT_PROXY[EConstraintType.HINGE] = function createHingeConstraint() {
    if (check(selector.wrapper.HingeConstraint, ECheckType.HingeConstraint)) {
      return ENTIRE_CONSTRAINT;
    }
    return new selector.wrapper.HingeConstraint();
  };
  CREATE_CONSTRAINT_PROXY[EConstraintType.FIXED] = function createFixedConstraint() {
    if (check(selector.wrapper.FixedConstraint, ECheckType.FixedConstraint)) {
      return ENTIRE_CONSTRAINT;
    }
    return new selector.wrapper.FixedConstraint();
  };
  CREATE_CONSTRAINT_PROXY[EConstraintType.CONFIGURABLE] = function createConfigurableConstraint() {
    if (check(selector.wrapper.ConfigurableConstraint, ECheckType.ConfigurableConstraint)) {
      return ENTIRE_CONSTRAINT;
    }
    return new selector.wrapper.ConfigurableConstraint();
  };
}
var CREATE_CHARACTER_CONTROLLER_PROXY = {
  INITED: false
};
var ENTIRE_CHARACTER_CONTROLLER = {
  initialize: FUNC,
  onLoad: FUNC,
  onEnable: FUNC,
  onDisable: FUNC,
  onDestroy: FUNC,
  onGround: FUNC,
  getPosition: FUNC,
  setPosition: FUNC,
  setStepOffset: FUNC,
  setSlopeLimit: FUNC,
  setContactOffset: FUNC,
  setDetectCollisions: FUNC,
  setOverlapRecovery: FUNC,
  setGroup: FUNC,
  getGroup: FUNC,
  addGroup: FUNC,
  removeGroup: FUNC,
  setMask: FUNC,
  getMask: FUNC,
  addMask: FUNC,
  removeMask: FUNC,
  move: FUNC,
  syncPhysicsToScene: FUNC,
  updateEventListener: FUNC,
  setHalfHeight: FUNC,
  setHalfSideExtent: FUNC,
  setHalfForwardExtent: FUNC,
  setRadius: FUNC,
  setHeight: FUNC
};
function createCharacterController(type) {
  initCharacterControllerProxy();
  return CREATE_CHARACTER_CONTROLLER_PROXY[type]();
}
function initCharacterControllerProxy() {
  if (CREATE_CHARACTER_CONTROLLER_PROXY.INITED) return;
  CREATE_CHARACTER_CONTROLLER_PROXY.INITED = true;
  CREATE_CHARACTER_CONTROLLER_PROXY[ECharacterControllerType.BOX] = function createBoxCharacterController() {
    if (check(selector.wrapper.BoxCharacterController, ECheckType.BoxCharacterController)) {
      return ENTIRE_CHARACTER_CONTROLLER;
    }
    return new selector.wrapper.BoxCharacterController();
  };
  CREATE_CHARACTER_CONTROLLER_PROXY[ECharacterControllerType.CAPSULE] = function createCapsuleCharacterController() {
    if (check(selector.wrapper.CapsuleCharacterController, ECheckType.CapsuleCharacterController)) {
      return ENTIRE_CHARACTER_CONTROLLER;
    }
    return new selector.wrapper.CapsuleCharacterController();
  };
}

cclegacy.internal.PhysicsGroup = PhysicsGroup;
var querySettings = settings.querySettings.bind(settings);
var PhysicsSystem = function (_System) {
  function PhysicsSystem() {
    var _this;
    _this = _System.call(this) || this;
    _this.raycastClosestResult = new PhysicsRayResult();
    _this.raycastResults = [];
    _this.lineStripCastClosestResult = new PhysicsLineStripCastResult();
    _this.lineStripCastResults = [];
    _this.sweepCastClosestResult = new PhysicsRayResult();
    _this.sweepCastResults = [];
    _this.collisionMatrix = new CollisionMatrix(1);
    _this.minVolumeSize = 1e-5;
    _this.useNodeChains = false;
    _this._enable = true;
    _this._allowSleep = true;
    _this._maxSubSteps = 1;
    _this._subStepCount = 0;
    _this._fixedTimeStep = 1.0 / 60.0;
    _this._autoSimulation = true;
    _this._accumulator = 0;
    _this._sleepThreshold = 0.1;
    _this._gravity = new Vec3(0, -10, 0);
    _this._material = void 0;
    _this.raycastOptions = {
      group: -1,
      mask: -1,
      queryTrigger: true,
      maxDistance: 10000000
    };
    _this.raycastResultPool = new RecyclePool(function () {
      return new PhysicsRayResult();
    }, 1);
    _this.sweepResultPool = new RecyclePool(function () {
      return new PhysicsRayResult();
    }, 1);
    return _this;
  }
  _inheritsLoose(PhysicsSystem, _System);
  var _proto = PhysicsSystem.prototype;
  _proto.setDefaultPhysicsMaterial = function setDefaultPhysicsMaterial(material) {
    this._material = material;
    this.physicsWorld.setDefaultMaterial(this._material);
    this._material.on(PhysicsMaterial.EVENT_UPDATE, this._updateMaterial, this);
  };
  _proto.initDefaultMaterial = function initDefaultMaterial() {
    var _this2 = this;
    if (this._material != null) return Promise.resolve();
    var builtinMaterial = builtinResMgr.get('default-physics-material');
    if (!builtinMaterial) {
      errorID(9642);
      return Promise.resolve();
    }
    var userMaterial = querySettings(SettingsCategory.PHYSICS, 'defaultMaterial');
    if (!userMaterial) {
      this.setDefaultPhysicsMaterial(builtinMaterial);
      return Promise.resolve();
    } else {
      return new Promise(function (resolve, reject) {
        assetManager.loadAny(userMaterial, function (err, asset) {
          return err || !(asset instanceof PhysicsMaterial) ? reject(err) : resolve(asset);
        });
      }).then(function (asset) {
        _this2.setDefaultPhysicsMaterial(asset);
      })["catch"](function (reason) {
        warn(reason);
        warnID(9643, userMaterial);
        _this2.setDefaultPhysicsMaterial(builtinMaterial);
      });
    }
  };
  _proto.postUpdate = function postUpdate(deltaTime) {
    if (!this.physicsWorld) return;
    if (!this._enable) {
      this.physicsWorld.syncSceneToPhysics();
      return;
    }
    if (this._autoSimulation) {
      this._subStepCount = 0;
      this._accumulator += deltaTime;
      director.emit(DirectorEvent.BEFORE_PHYSICS);
      while (this._subStepCount < this._maxSubSteps) {
        if (this._accumulator >= this._fixedTimeStep) {
          this.physicsWorld.syncSceneToPhysics();
          this.physicsWorld.step(this._fixedTimeStep);
          this.physicsWorld.emitEvents();
          this.physicsWorld.syncAfterEvents();
          this._accumulator -= this._fixedTimeStep;
          this._subStepCount++;
        } else {
          this.physicsWorld.syncSceneToPhysics();
          break;
        }
      }
      director.emit(DirectorEvent.AFTER_PHYSICS);
    }
  };
  _proto.resetConfiguration = function resetConfiguration(config) {
    var allowSleep = config ? config.allowSleep : querySettings(SettingsCategory.PHYSICS, 'allowSleep');
    if (typeof allowSleep === 'boolean') this._allowSleep = allowSleep;
    var fixedTimeStep = config ? config.fixedTimeStep : querySettings(SettingsCategory.PHYSICS, 'fixedTimeStep');
    if (typeof fixedTimeStep === 'number') this._fixedTimeStep = fixedTimeStep;
    var maxSubSteps = config ? config.maxSubSteps : querySettings(SettingsCategory.PHYSICS, 'maxSubSteps');
    if (typeof maxSubSteps === 'number') this._maxSubSteps = maxSubSteps;
    var sleepThreshold = config ? config.sleepThreshold : querySettings(SettingsCategory.PHYSICS, 'sleepThreshold');
    if (typeof sleepThreshold === 'number') this._sleepThreshold = sleepThreshold;
    var autoSimulation = config ? config.autoSimulation : querySettings(SettingsCategory.PHYSICS, 'autoSimulation');
    if (typeof autoSimulation === 'boolean') this.autoSimulation = autoSimulation;
    var gravity = config ? config.gravity : querySettings(SettingsCategory.PHYSICS, 'gravity');
    if (gravity) Vec3.copy(this._gravity, gravity);
    var collisionMatrix = config ? config.collisionMatrix : querySettings(SettingsCategory.PHYSICS, 'collisionMatrix');
    if (collisionMatrix) {
      for (var i in collisionMatrix) {
        this.collisionMatrix["" + (1 << parseInt(i))] = collisionMatrix[i];
      }
    }
    var collisionGroups = config ? config.collisionGroups : querySettings(SettingsCategory.PHYSICS, 'collisionGroups');
    if (collisionGroups) {
      var cg = collisionGroups;
      if (cg instanceof Array) {
        cg.forEach(function (v) {
          PhysicsGroup[v.name] = 1 << v.index;
        });
        Enum.update(PhysicsGroup);
      }
    }
    if (this.physicsWorld) {
      this.physicsWorld.setGravity(this._gravity);
      this.physicsWorld.setAllowSleep(this._allowSleep);
    }
  };
  _proto.resetAccumulator = function resetAccumulator(time) {
    if (time === void 0) {
      time = 0;
    }
    this._accumulator = time;
  };
  _proto.step = function step(fixedTimeStep, deltaTime, maxSubSteps) {
    if (this.physicsWorld) this.physicsWorld.step(fixedTimeStep, deltaTime, maxSubSteps);
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    if (this.physicsWorld) this.physicsWorld.syncSceneToPhysics();
  };
  _proto.emitEvents = function emitEvents() {
    if (this.physicsWorld) this.physicsWorld.emitEvents();
  };
  _proto.raycast = function raycast(worldRay, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (!this.physicsWorld) return false;
    this.raycastResultPool.reset();
    this.raycastResults.length = 0;
    this.raycastOptions.mask = mask >>> 0;
    this.raycastOptions.maxDistance = maxDistance;
    this.raycastOptions.queryTrigger = queryTrigger;
    return this.physicsWorld.raycast(worldRay, this.raycastOptions, this.raycastResultPool, this.raycastResults);
  };
  _proto.raycastClosest = function raycastClosest(worldRay, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (!this.physicsWorld) return false;
    this.raycastOptions.mask = mask >>> 0;
    this.raycastOptions.maxDistance = maxDistance;
    this.raycastOptions.queryTrigger = queryTrigger;
    return this.physicsWorld.raycastClosest(worldRay, this.raycastOptions, this.raycastClosestResult);
  };
  _proto.lineStripCast = function lineStripCast(samplePointsWorldSpace, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (samplePointsWorldSpace.length < 2) return false;
    this.lineStripCastResults = [];
    var distance = 0;
    var worldRay = new Ray();
    for (var i = 1; i < samplePointsWorldSpace.length; ++i) {
      if (distance > maxDistance) break;
      var fromPoint = samplePointsWorldSpace[i - 1];
      var toPoint = samplePointsWorldSpace[i];
      var direction = new Vec3();
      Vec3.subtract(direction, toPoint, fromPoint);
      var stepLength = Vec3.len(direction);
      distance += stepLength;
      var EPSILON = 1e-6;
      if (Math.abs(stepLength) < EPSILON) {
        continue;
      }
      Vec3.multiplyScalar(direction, direction, 1.0 / stepLength);
      worldRay.d = direction;
      worldRay.o = fromPoint;
      var hit = this.raycast(worldRay, mask, stepLength, queryTrigger);
      if (hit) {
        for (var re = 0; re < this.raycastResults.length; re++) {
          var result = this.raycastResults[re];
          if (re === 0 && Vec3.equals(fromPoint, result.hitPoint)) {
            continue;
          }
          var copiedResult = new PhysicsLineStripCastResult();
          copiedResult._assign(result.hitPoint, result.distance, result.collider, result.hitNormal, i - 1);
          this.lineStripCastResults.push(copiedResult);
        }
      }
    }
    return this.lineStripCastResults.length > 0;
  };
  _proto.lineStripCastClosest = function lineStripCastClosest(samplePointsWorldSpace, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (samplePointsWorldSpace.length < 2) {
      return false;
    }
    var distance = 0;
    var worldRay = new Ray();
    var hit = false;
    for (var i = 1; i < samplePointsWorldSpace.length; ++i) {
      if (distance > maxDistance) break;
      var fromPoint = samplePointsWorldSpace[i - 1];
      var toPoint = samplePointsWorldSpace[i];
      var direction = new Vec3();
      Vec3.subtract(direction, toPoint, fromPoint);
      var stepLength = Vec3.len(direction);
      distance += stepLength;
      Vec3.multiplyScalar(direction, direction, 1.0 / stepLength);
      worldRay.d = direction;
      worldRay.o = fromPoint;
      hit = this.raycastClosest(worldRay, mask, stepLength, queryTrigger);
      if (hit) {
        var result = this.raycastClosestResult;
        var copiedResult = new PhysicsLineStripCastResult();
        copiedResult._assign(result.hitPoint, result.distance, result.collider, result.hitNormal, i - 1);
        this.lineStripCastClosestResult = copiedResult;
        break;
      }
    }
    return hit;
  };
  _proto.sweepBox = function sweepBox(worldRay, halfExtent, orientation, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (!this.physicsWorld) return false;
    this.sweepResultPool.reset();
    this.sweepCastResults.length = 0;
    this.raycastOptions.mask = mask >>> 0;
    this.raycastOptions.maxDistance = maxDistance;
    this.raycastOptions.queryTrigger = queryTrigger;
    return this.physicsWorld.sweepBox(worldRay, halfExtent, orientation, this.raycastOptions, this.sweepResultPool, this.sweepCastResults);
  };
  _proto.sweepBoxClosest = function sweepBoxClosest(worldRay, halfExtent, orientation, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (!this.physicsWorld) return false;
    this.raycastOptions.mask = mask >>> 0;
    this.raycastOptions.maxDistance = maxDistance;
    this.raycastOptions.queryTrigger = queryTrigger;
    return this.physicsWorld.sweepBoxClosest(worldRay, halfExtent, orientation, this.raycastOptions, this.sweepCastClosestResult);
  };
  _proto.sweepSphere = function sweepSphere(worldRay, radius, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (!this.physicsWorld) return false;
    this.sweepResultPool.reset();
    this.sweepCastResults.length = 0;
    this.raycastOptions.mask = mask >>> 0;
    this.raycastOptions.maxDistance = maxDistance;
    this.raycastOptions.queryTrigger = queryTrigger;
    return this.physicsWorld.sweepSphere(worldRay, radius, this.raycastOptions, this.sweepResultPool, this.sweepCastResults);
  };
  _proto.sweepSphereClosest = function sweepSphereClosest(worldRay, radius, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (!this.physicsWorld) return false;
    this.raycastOptions.mask = mask >>> 0;
    this.raycastOptions.maxDistance = maxDistance;
    this.raycastOptions.queryTrigger = queryTrigger;
    return this.physicsWorld.sweepSphereClosest(worldRay, radius, this.raycastOptions, this.sweepCastClosestResult);
  };
  _proto.sweepCapsule = function sweepCapsule(worldRay, radius, height, orientation, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (!this.physicsWorld) return false;
    this.sweepResultPool.reset();
    this.sweepCastResults.length = 0;
    this.raycastOptions.mask = mask >>> 0;
    this.raycastOptions.maxDistance = maxDistance;
    this.raycastOptions.queryTrigger = queryTrigger;
    return this.physicsWorld.sweepCapsule(worldRay, radius, height, orientation, this.raycastOptions, this.sweepResultPool, this.sweepCastResults);
  };
  _proto.sweepCapsuleClosest = function sweepCapsuleClosest(worldRay, radius, height, orientation, mask, maxDistance, queryTrigger) {
    if (mask === void 0) {
      mask = 0xffffffff;
    }
    if (maxDistance === void 0) {
      maxDistance = 10000000;
    }
    if (queryTrigger === void 0) {
      queryTrigger = true;
    }
    if (!this.physicsWorld) return false;
    this.raycastOptions.mask = mask >>> 0;
    this.raycastOptions.maxDistance = maxDistance;
    this.raycastOptions.queryTrigger = queryTrigger;
    return this.physicsWorld.sweepCapsuleClosest(worldRay, radius, height, orientation, this.raycastOptions, this.sweepCastClosestResult);
  };
  _proto._updateMaterial = function _updateMaterial() {
    if (this.physicsWorld) this.physicsWorld.setDefaultMaterial(this._material);
  };
  PhysicsSystem.constructAndRegister = function constructAndRegister() {
    if (!PhysicsSystem._instance) {
      var sys = this.doConstructAndRegister();
      if (sys) game.onPostProjectInitDelegate.add(sys.initDefaultMaterial.bind(sys));
    }
  };
  PhysicsSystem.constructAndRegisterManually = function constructAndRegisterManually() {
    return Promise.resolve();
  };
  PhysicsSystem.doConstructAndRegister = function doConstructAndRegister() {
    var _querySettings;
    var enabled = (_querySettings = querySettings(SettingsCategory.PHYSICS, 'enabled')) !== null && _querySettings !== void 0 ? _querySettings : true;
    if (!enabled) {
      return null;
    }
    if (!PhysicsSystem._instance) {
      var sys = new PhysicsSystem();
      PhysicsSystem._instance = sys;
      sys.resetConfiguration();
      constructDefaultWorld(sys);
      director.registerSystem(PhysicsSystem.ID, sys, sys.priority);
    }
    return PhysicsSystem._instance;
  };
  return _createClass(PhysicsSystem, [{
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
      if (this.physicsWorld) {
        this.physicsWorld.setAllowSleep(v);
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
    key: "gravity",
    get: function get() {
      return this._gravity;
    },
    set: function set(gravity) {
      this._gravity.set(gravity);
      if (this.physicsWorld) {
        this.physicsWorld.setGravity(gravity);
      }
    }
  }, {
    key: "sleepThreshold",
    get: function get() {
      return this._sleepThreshold;
    },
    set: function set(v) {
      this._sleepThreshold = v;
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
    key: "defaultMaterial",
    get: function get() {
      return this._material;
    }
  }, {
    key: "physicsWorld",
    get: function get() {
      return selector.physicsWorld;
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
    key: "debugDrawConstraintSize",
    get: function get() {
      return this.physicsWorld.debugDrawConstraintSize;
    },
    set: function set(v) {
      this.physicsWorld.debugDrawConstraintSize = v;
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
    key: "PHYSICS_CANNON",
    get: function get() {
      return selector.id === 'cannon.js';
    }
  }, {
    key: "PHYSICS_BULLET",
    get: function get() {
      return selector.id === 'bullet';
    }
  }, {
    key: "PHYSICS_PHYSX",
    get: function get() {
      return selector.id === 'physx';
    }
  }, {
    key: "PhysicsGroup",
    get: function get() {
      return PhysicsGroup;
    }
  }, {
    key: "instance",
    get: function get() {
      return PhysicsSystem._instance;
    }
  }]);
}(System);
PhysicsSystem.ID = 'PHYSICS';
PhysicsSystem._instance = null;
director.once(DirectorEvent.INIT, function () {
  PhysicsSystem.constructAndRegister();
});

var _dec$j, _dec2$i, _dec3$9, _dec4$8, _class$j, _class2$j, _initializer$j, _initializer2$g, _initializer3$9, _initializer4$4, _initializer5$3, _initializer6$3, _initializer7$2, _initializer8$2, _initializer9$2, _RigidBody;
var RigidBody = (_dec$j = ccclass('cc.RigidBody'), _dec2$i = executionOrder(-1), _dec3$9 = type(PhysicsSystem.PhysicsGroup), _dec4$8 = type(ERigidBodyType), _dec$j(_class$j = disallowMultiple(_class$j = _dec2$i(_class$j = (_class2$j = (_RigidBody = function (_Component) {
  function RigidBody() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this._body = null;
    _this._group = _initializer$j && _initializer$j();
    _this._type = _initializer2$g && _initializer2$g();
    _this._mass = _initializer3$9 && _initializer3$9();
    _this._allowSleep = _initializer4$4 && _initializer4$4();
    _this._linearDamping = _initializer5$3 && _initializer5$3();
    _this._angularDamping = _initializer6$3 && _initializer6$3();
    _this._useGravity = _initializer7$2 && _initializer7$2();
    _this._linearFactor = _initializer8$2 && _initializer8$2();
    _this._angularFactor = _initializer9$2 && _initializer9$2();
    return _this;
  }
  _inheritsLoose(RigidBody, _Component);
  var _proto = RigidBody.prototype;
  _proto.onLoad = function onLoad() {
    if (!selector.runInEditor) return;
    this._body = createRigidBody();
    this._body.initialize(this);
  };
  _proto.onEnable = function onEnable() {
    if (this._body) this._body.onEnable();
  };
  _proto.onDisable = function onDisable() {
    if (this._body) this._body.onDisable();
  };
  _proto.onDestroy = function onDestroy() {
    if (this._body) this._body.onDestroy();
  };
  _proto.applyForce = function applyForce(force, relativePoint) {
    if (this._isInitialized) this._body.applyForce(force, relativePoint);
  };
  _proto.applyLocalForce = function applyLocalForce(force, localPoint) {
    if (this._isInitialized) this._body.applyLocalForce(force, localPoint);
  };
  _proto.applyImpulse = function applyImpulse(impulse, relativePoint) {
    if (this._isInitialized) this._body.applyImpulse(impulse, relativePoint);
  };
  _proto.applyLocalImpulse = function applyLocalImpulse(impulse, localPoint) {
    if (this._isInitialized) this._body.applyLocalImpulse(impulse, localPoint);
  };
  _proto.applyTorque = function applyTorque(torque) {
    if (this._isInitialized) this._body.applyTorque(torque);
  };
  _proto.applyLocalTorque = function applyLocalTorque(torque) {
    if (this._isInitialized) this._body.applyLocalTorque(torque);
  };
  _proto.wakeUp = function wakeUp() {
    if (this._isInitialized) this._body.wakeUp();
  };
  _proto.sleep = function sleep() {
    if (this._isInitialized) this._body.sleep();
  };
  _proto.clearState = function clearState() {
    if (this._isInitialized) this._body.clearState();
  };
  _proto.clearForces = function clearForces() {
    if (this._isInitialized) this._body.clearForces();
  };
  _proto.clearVelocity = function clearVelocity() {
    if (this._isInitialized) this._body.clearVelocity();
  };
  _proto.getLinearVelocity = function getLinearVelocity(out) {
    if (this._isInitialized) this._body.getLinearVelocity(out);
  };
  _proto.setLinearVelocity = function setLinearVelocity(value) {
    if (this._isInitialized) this._body.setLinearVelocity(value);
  };
  _proto.getAngularVelocity = function getAngularVelocity(out) {
    if (this._isInitialized) this._body.getAngularVelocity(out);
  };
  _proto.setAngularVelocity = function setAngularVelocity(value) {
    if (this._isInitialized) this._body.setAngularVelocity(value);
  };
  _proto.getGroup = function getGroup() {
    if (this._isInitialized) return this._body.getGroup();
    return 0;
  };
  _proto.setGroup = function setGroup(v) {
    if (this._isInitialized) this._body.setGroup(v);
  };
  _proto.addGroup = function addGroup(v) {
    if (this._isInitialized) this._body.addGroup(v);
  };
  _proto.removeGroup = function removeGroup(v) {
    if (this._isInitialized) this._body.removeGroup(v);
  };
  _proto.getMask = function getMask() {
    if (this._isInitialized) return this._body.getMask();
    return 0;
  };
  _proto.setMask = function setMask(v) {
    if (this._isInitialized) this._body.setMask(v);
  };
  _proto.addMask = function addMask(v) {
    if (this._isInitialized) this._body.addMask(v);
  };
  _proto.removeMask = function removeMask(v) {
    if (this._isInitialized) this._body.removeMask(v);
  };
  return _createClass(RigidBody, [{
    key: "group",
    get: function get() {
      return this._group;
    },
    set: function set(v) {
      if (!Number.isInteger(Math.log2(v >>> 0))) warn('[Physics]: The group should only have one bit.');
      this._group = v;
      if (this._body) {
        if (this._body.getGroup() !== v) this._body.setGroup(v);
      }
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(v) {
      if (this._type === v) return;
      this._type = v;
      if (this._body) this._body.setType(v);
    }
  }, {
    key: "mass",
    get: function get() {
      return this._mass;
    },
    set: function set(value) {
      if (value <= 0) warn('[Physics]: The mass should be greater than zero.');
      if (this._mass === value) return;
      value = value <= 0 ? 0.0001 : value;
      this._mass = value;
      if (this._body) this._body.setMass(value);
    }
  }, {
    key: "allowSleep",
    get: function get() {
      return this._allowSleep;
    },
    set: function set(v) {
      this._allowSleep = v;
      if (this._body) this._body.setAllowSleep(v);
    }
  }, {
    key: "linearDamping",
    get: function get() {
      return this._linearDamping;
    },
    set: function set(value) {
      if ((value < 0 || value > 1)) warn('[Physics]: The damping should be between zero to one.');
      this._linearDamping = value;
      if (this._body) this._body.setLinearDamping(value);
    }
  }, {
    key: "angularDamping",
    get: function get() {
      return this._angularDamping;
    },
    set: function set(value) {
      if ((value < 0 || value > 1)) warn('[Physics]: The damping should be between zero to one.');
      this._angularDamping = value;
      if (this._body) this._body.setAngularDamping(value);
    }
  }, {
    key: "useGravity",
    get: function get() {
      return this._useGravity;
    },
    set: function set(value) {
      this._useGravity = value;
      if (this._body) this._body.useGravity(value);
    }
  }, {
    key: "linearFactor",
    get: function get() {
      return this._linearFactor;
    },
    set: function set(value) {
      Vec3.copy(this._linearFactor, value);
      if (this._body) {
        this._body.setLinearFactor(this._linearFactor);
      }
    }
  }, {
    key: "angularFactor",
    get: function get() {
      return this._angularFactor;
    },
    set: function set(value) {
      Vec3.copy(this._angularFactor, value);
      if (this._body) {
        this._body.setAngularFactor(this._angularFactor);
      }
    }
  }, {
    key: "sleepThreshold",
    get: function get() {
      if (this._isInitialized) {
        return this._body.getSleepThreshold();
      }
      return 0.1;
    },
    set: function set(v) {
      if (this._isInitialized) {
        this._body.setSleepThreshold(v);
      }
    }
  }, {
    key: "useCCD",
    get: function get() {
      if (this._isInitialized) {
        return this._body.isUsingCCD();
      }
      return false;
    },
    set: function set(v) {
      if (this._isInitialized) {
        this._body.useCCD(v);
      }
    }
  }, {
    key: "isAwake",
    get: function get() {
      if (this._isInitialized) return this._body.isAwake;
      return false;
    }
  }, {
    key: "isSleepy",
    get: function get() {
      if (this._isInitialized) return this._body.isSleepy;
      return false;
    }
  }, {
    key: "isSleeping",
    get: function get() {
      if (this._isInitialized) return this._body.isSleeping;
      return false;
    }
  }, {
    key: "isStatic",
    get: function get() {
      return this._type === ERigidBodyType.STATIC;
    },
    set: function set(v) {
      if (v && this.isStatic || !v && !this.isStatic) return;
      this.type = v ? ERigidBodyType.STATIC : ERigidBodyType.DYNAMIC;
    }
  }, {
    key: "isDynamic",
    get: function get() {
      return this._type === ERigidBodyType.DYNAMIC;
    },
    set: function set(v) {
      if (v && this.isDynamic || !v && !this.isDynamic) return;
      this.type = v ? ERigidBodyType.DYNAMIC : ERigidBodyType.KINEMATIC;
    }
  }, {
    key: "isKinematic",
    get: function get() {
      return this._type === ERigidBodyType.KINEMATIC;
    },
    set: function set(v) {
      if (v && this.isKinematic || !v && !this.isKinematic) return;
      this.type = v ? ERigidBodyType.KINEMATIC : ERigidBodyType.DYNAMIC;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    }
  }, {
    key: "_isInitialized",
    get: function get() {
      var r = this._body === null;
      if (r) {
        error('[Physics]: This component has not been call onLoad yet, please make sure the node has been added to the scene.');
      }
      return !r;
    }
  }]);
}(Component), _RigidBody.Type = ERigidBodyType, _RigidBody), _applyDecoratedDescriptor(_class2$j.prototype, "group", [_dec3$9], Object.getOwnPropertyDescriptor(_class2$j.prototype, "group"), _class2$j.prototype), _applyDecoratedDescriptor(_class2$j.prototype, "type", [_dec4$8], Object.getOwnPropertyDescriptor(_class2$j.prototype, "type"), _class2$j.prototype), _initializer$j = applyDecoratedInitializer(_class2$j.prototype, "_group", [serializable], function () {
  return PhysicsSystem.PhysicsGroup.DEFAULT;
}), _initializer2$g = applyDecoratedInitializer(_class2$j.prototype, "_type", [serializable], function () {
  return ERigidBodyType.DYNAMIC;
}), _initializer3$9 = applyDecoratedInitializer(_class2$j.prototype, "_mass", [serializable], function () {
  return 1;
}), _initializer4$4 = applyDecoratedInitializer(_class2$j.prototype, "_allowSleep", [serializable], function () {
  return true;
}), _initializer5$3 = applyDecoratedInitializer(_class2$j.prototype, "_linearDamping", [serializable], function () {
  return 0.1;
}), _initializer6$3 = applyDecoratedInitializer(_class2$j.prototype, "_angularDamping", [serializable], function () {
  return 0.1;
}), _initializer7$2 = applyDecoratedInitializer(_class2$j.prototype, "_useGravity", [serializable], function () {
  return true;
}), _initializer8$2 = applyDecoratedInitializer(_class2$j.prototype, "_linearFactor", [serializable], function () {
  return new Vec3(1, 1, 1);
}), _initializer9$2 = applyDecoratedInitializer(_class2$j.prototype, "_angularFactor", [serializable], function () {
  return new Vec3(1, 1, 1);
}), _class2$j)) || _class$j) || _class$j) || _class$j);
(function (_RigidBody2) {})(RigidBody || (RigidBody = {}));

var _dec$i, _dec2$h, _dec3$8, _dec4$7, _dec5$6, _class$i, _class2$i, _initializer$i, _initializer2$f, _initializer3$8, _Collider;
var Collider = (_dec$i = ccclass('cc.Collider'), _dec2$h = type(RigidBody), _dec3$8 = type(PhysicsMaterial), _dec4$7 = type(Vec3), _dec5$6 = type(PhysicsMaterial), _dec$i(_class$i = (_class2$i = (_Collider = function (_Eventify) {
  function Collider(type) {
    var _this;
    _this = _Eventify.call(this) || this;
    _this.type = void 0;
    _this._shape = null;
    _this._aabb = null;
    _this._boundingSphere = null;
    _this._isSharedMaterial = true;
    _this._needTriggerEvent = false;
    _this._needCollisionEvent = false;
    _this._material = _initializer$i && _initializer$i();
    _this._isTrigger = _initializer2$f && _initializer2$f();
    _this._center = _initializer3$8 && _initializer3$8();
    _this.type = type;
    return _this;
  }
  _inheritsLoose(Collider, _Eventify);
  var _proto = Collider.prototype;
  _proto.on = function on(type, callback, target, once) {
    var ret = _Eventify.prototype.on.call(this, type, callback, target, once);
    this._updateNeedEvent(type);
    return ret;
  };
  _proto.off = function off(type, callback, target) {
    _Eventify.prototype.off.call(this, type, callback, target);
    this._updateNeedEvent();
  };
  _proto.once = function once(type, callback, target) {
    var ret = _Eventify.prototype.once.call(this, type, callback, target);
    this._updateNeedEvent(type);
    return ret;
  };
  _proto.removeAll = function removeAll(typeOrTarget) {
    _Eventify.prototype.removeAll.call(this, typeOrTarget);
    this._updateNeedEvent();
  };
  _proto.getGroup = function getGroup() {
    if (this._isInitialized) {
      return this._shape.getGroup();
    }
    return 0;
  };
  _proto.setGroup = function setGroup(v) {
    if (this._isInitialized) {
      this._shape.setGroup(v);
    }
  };
  _proto.addGroup = function addGroup(v) {
    if (this._isInitialized) {
      this._shape.addGroup(v);
    }
  };
  _proto.removeGroup = function removeGroup(v) {
    if (this._isInitialized) {
      this._shape.removeGroup(v);
    }
  };
  _proto.getMask = function getMask() {
    if (this._isInitialized) {
      return this._shape.getMask();
    }
    return 0;
  };
  _proto.setMask = function setMask(v) {
    if (this._isInitialized) {
      this._shape.setMask(v);
    }
  };
  _proto.addMask = function addMask(v) {
    if (this._isInitialized) {
      this._shape.addMask(v);
    }
  };
  _proto.removeMask = function removeMask(v) {
    if (this._isInitialized) {
      this._shape.removeMask(v);
    }
  };
  _proto.onLoad = function onLoad() {
    if (!selector.runInEditor) return;
    this.sharedMaterial = this._material;
    this._shape = createShape(this.type);
    this._shape.initialize(this);
    this._shape.onLoad();
  };
  _proto.onEnable = function onEnable() {
    if (this._shape) {
      this._shape.onEnable();
    }
  };
  _proto.onDisable = function onDisable() {
    if (this._shape) {
      this._shape.onDisable();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._shape) {
      this._needTriggerEvent = false;
      this._needCollisionEvent = false;
      this._shape.updateEventListener();
      if (this._material) this._material.off(PhysicsMaterial.EVENT_UPDATE, this._updateMaterial, this);
      this._shape.onDestroy();
    }
    if (this._boundingSphere) this._boundingSphere.destroy();
  };
  _proto._updateMaterial = function _updateMaterial() {
    if (this._shape) this._shape.setMaterial(this._material);
  };
  _proto._updateNeedEvent = function _updateNeedEvent(type) {
    if (this.isValid) {
      if (type !== undefined) {
        if (type === 'onCollisionEnter' || type === 'onCollisionStay' || type === 'onCollisionExit') {
          this._needCollisionEvent = true;
        }
        if (type === 'onTriggerEnter' || type === 'onTriggerStay' || type === 'onTriggerExit' || type === 'onControllerTriggerEnter' || type === 'onControllerTriggerStay' || type === 'onControllerTriggerExit') {
          this._needTriggerEvent = true;
        }
      } else {
        if (!(this.hasEventListener('onTriggerEnter') || this.hasEventListener('onTriggerStay') || this.hasEventListener('onTriggerExit') || this.hasEventListener('onControllerTriggerEnter') || this.hasEventListener('onControllerTriggerStay') || this.hasEventListener('onControllerTriggerExit'))) {
          this._needTriggerEvent = false;
        }
        if (!(this.hasEventListener('onCollisionEnter') || this.hasEventListener('onCollisionStay') || this.hasEventListener('onCollisionExit'))) {
          this._needCollisionEvent = false;
        }
      }
      if (this._shape) this._shape.updateEventListener();
    }
  };
  return _createClass(Collider, [{
    key: "attachedRigidBody",
    get: function get() {
      return findAttachedBody(this.node);
    }
  }, {
    key: "sharedMaterial",
    get: function get() {
      return this._material;
    },
    set: function set(value) {
      {
        this.material = value;
      }
    }
  }, {
    key: "material",
    get: function get() {
      if (this._isSharedMaterial && this._material) {
        this._material.off(PhysicsMaterial.EVENT_UPDATE, this._updateMaterial, this);
        this._material = this._material.clone();
        this._material.on(PhysicsMaterial.EVENT_UPDATE, this._updateMaterial, this);
        this._isSharedMaterial = false;
      }
      return this._material;
    },
    set: function set(value) {
      if (this._shape) {
        if (value && this._material) {
          if (this._material.id !== value.id) {
            this._material.off(PhysicsMaterial.EVENT_UPDATE, this._updateMaterial, this);
            value.on(PhysicsMaterial.EVENT_UPDATE, this._updateMaterial, this);
            this._isSharedMaterial = false;
            this._material = value;
          }
        } else if (value && !this._material) {
          value.on(PhysicsMaterial.EVENT_UPDATE, this._updateMaterial, this);
          this._material = value;
        } else if (!value && this._material) {
          this._material.off(PhysicsMaterial.EVENT_UPDATE, this._updateMaterial, this);
          this._material = value;
        }
        this._updateMaterial();
      } else {
        this._material = value;
      }
    }
  }, {
    key: "isTrigger",
    get: function get() {
      return this._isTrigger;
    },
    set: function set(value) {
      this._isTrigger = value;
      if (this._shape) {
        this._shape.setAsTrigger(this._isTrigger);
      }
    }
  }, {
    key: "center",
    get: function get() {
      return this._center;
    },
    set: function set(value) {
      Vec3.copy(this._center, value);
      if (this._shape) {
        this._shape.setCenter(this._center);
      }
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }, {
    key: "worldBounds",
    get: function get() {
      if (this._aabb == null) this._aabb = new AABB();
      if (this._shape) this._shape.getAABB(this._aabb);
      return this._aabb;
    }
  }, {
    key: "boundingSphere",
    get: function get() {
      if (this._boundingSphere == null) this._boundingSphere = new Sphere();
      if (this._shape) this._shape.getBoundingSphere(this._boundingSphere);
      return this._boundingSphere;
    }
  }, {
    key: "needTriggerEvent",
    get: function get() {
      return this._needTriggerEvent;
    }
  }, {
    key: "needCollisionEvent",
    get: function get() {
      return this._needCollisionEvent;
    }
  }, {
    key: "_isInitialized",
    get: function get() {
      var r = this._shape === null;
      if (r) {
        error('[Physics]: This component has not been call onLoad yet, please make sure the node has been added to the scene.');
      }
      return !r;
    }
  }]);
}(Eventify(Component)), _Collider.Type = EColliderType, _Collider.Axis = EAxisDirection, _Collider), _applyDecoratedDescriptor(_class2$i.prototype, "attachedRigidBody", [_dec2$h], Object.getOwnPropertyDescriptor(_class2$i.prototype, "attachedRigidBody"), _class2$i.prototype), _applyDecoratedDescriptor(_class2$i.prototype, "sharedMaterial", [_dec3$8], Object.getOwnPropertyDescriptor(_class2$i.prototype, "sharedMaterial"), _class2$i.prototype), _applyDecoratedDescriptor(_class2$i.prototype, "center", [_dec4$7], Object.getOwnPropertyDescriptor(_class2$i.prototype, "center"), _class2$i.prototype), _initializer$i = applyDecoratedInitializer(_class2$i.prototype, "_material", [_dec5$6], function () {
  return null;
}), _initializer2$f = applyDecoratedInitializer(_class2$i.prototype, "_isTrigger", [serializable], function () {
  return false;
}), _initializer3$8 = applyDecoratedInitializer(_class2$i.prototype, "_center", [serializable], function () {
  return new Vec3();
}), _class2$i)) || _class$i);
(function (_Collider2) {})(Collider || (Collider = {}));
function findAttachedBody(node) {
  var rb = node.getComponent(RigidBody);
  if (rb && rb.isValid) {
    return rb;
  }
  return null;
}

var _dec$h, _dec2$g, _class$h, _class2$h, _initializer$h;
var BoxCollider = (_dec$h = ccclass('cc.BoxCollider'), _dec2$g = type(Vec3), _dec$h(_class$h = (_class2$h = function (_Collider) {
  function BoxCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.BOX) || this;
    _this._size = _initializer$h && _initializer$h();
    return _this;
  }
  _inheritsLoose(BoxCollider, _Collider);
  return _createClass(BoxCollider, [{
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(value) {
      if (Vec3.strictEquals(this._size, value)) return;
      Vec3.copy(this._size, value);
      absolute(this._size);
      if (this._shape) {
        this.shape.updateSize();
      }
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }]);
}(Collider), _applyDecoratedDescriptor(_class2$h.prototype, "size", [_dec2$g], Object.getOwnPropertyDescriptor(_class2$h.prototype, "size"), _class2$h.prototype), _initializer$h = applyDecoratedInitializer(_class2$h.prototype, "_size", [serializable], function () {
  return new Vec3(1, 1, 1);
}), _class2$h)) || _class$h);

var _dec$g, _class$g, _class2$g, _initializer$g;
var SphereCollider = (_dec$g = ccclass('cc.SphereCollider'), _dec$g(_class$g = (_class2$g = function (_Collider) {
  function SphereCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.SPHERE) || this;
    _this._radius = _initializer$g && _initializer$g();
    return _this;
  }
  _inheritsLoose(SphereCollider, _Collider);
  return _createClass(SphereCollider, [{
    key: "radius",
    get: function get() {
      return this._radius;
    },
    set: function set(value) {
      if (this._radius === value) return;
      this._radius = Math.abs(value);
      if (this._shape) {
        this.shape.updateRadius();
      }
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }]);
}(Collider), _initializer$g = applyDecoratedInitializer(_class2$g.prototype, "_radius", [serializable], function () {
  return 0.5;
}), _class2$g)) || _class$g);

var _dec$f, _dec2$f, _class$f, _class2$f, _initializer$f, _initializer2$e, _initializer3$7;
var CapsuleCollider = (_dec$f = ccclass('cc.CapsuleCollider'), _dec2$f = type(EAxisDirection), _dec$f(_class$f = (_class2$f = function (_Collider) {
  function CapsuleCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.CAPSULE) || this;
    _this._radius = _initializer$f && _initializer$f();
    _this._cylinderHeight = _initializer2$e && _initializer2$e();
    _this._direction = _initializer3$7 && _initializer3$7();
    return _this;
  }
  _inheritsLoose(CapsuleCollider, _Collider);
  var _proto = CapsuleCollider.prototype;
  _proto._getRadiusScale = function _getRadiusScale() {
    if (this.node == null) return 1;
    var ws = this.node.worldScale;
    if (this._direction === EAxisDirection.Y_AXIS) return Math.abs(absMax(ws.x, ws.z));
    if (this._direction === EAxisDirection.X_AXIS) return Math.abs(absMax(ws.y, ws.z));
    return Math.abs(absMax(ws.x, ws.y));
  };
  _proto._getHeightScale = function _getHeightScale() {
    if (this.node == null) return 1;
    var ws = this.node.worldScale;
    if (this._direction === EAxisDirection.Y_AXIS) return Math.abs(ws.y);
    if (this._direction === EAxisDirection.X_AXIS) return Math.abs(ws.x);
    return Math.abs(ws.z);
  };
  return _createClass(CapsuleCollider, [{
    key: "radius",
    get: function get() {
      return this._radius;
    },
    set: function set(value) {
      if (this._radius === value) return;
      this._radius = Math.abs(value);
      if (this._shape) {
        this.shape.setRadius(value);
      }
    }
  }, {
    key: "cylinderHeight",
    get: function get() {
      return this._cylinderHeight;
    },
    set: function set(value) {
      if (this._cylinderHeight === value) return;
      this._cylinderHeight = Math.abs(value);
      if (this._shape) {
        this.shape.setCylinderHeight(value);
      }
    }
  }, {
    key: "direction",
    get: function get() {
      return this._direction;
    },
    set: function set(value) {
      value = Math.floor(value);
      if (value < EAxisDirection.X_AXIS || value > EAxisDirection.Z_AXIS) return;
      if (this._direction === value) return;
      this._direction = value;
      if (this._shape) {
        this.shape.setDirection(value);
      }
    }
  }, {
    key: "height",
    get: function get() {
      return this._radius * 2 + this._cylinderHeight;
    },
    set: function set(value) {
      var ch = value - this._radius * 2;
      if (ch < 0) ch = 0;
      this.cylinderHeight = ch;
    }
  }, {
    key: "worldHeight",
    get: function get() {
      return this._radius * 2 * this._getRadiusScale() + this._cylinderHeight * this._getHeightScale();
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }]);
}(Collider), _applyDecoratedDescriptor(_class2$f.prototype, "direction", [_dec2$f], Object.getOwnPropertyDescriptor(_class2$f.prototype, "direction"), _class2$f.prototype), _initializer$f = applyDecoratedInitializer(_class2$f.prototype, "_radius", [serializable], function () {
  return 0.5;
}), _initializer2$e = applyDecoratedInitializer(_class2$f.prototype, "_cylinderHeight", [serializable], function () {
  return 1;
}), _initializer3$7 = applyDecoratedInitializer(_class2$f.prototype, "_direction", [serializable], function () {
  return EAxisDirection.Y_AXIS;
}), _class2$f)) || _class$f);

var _dec$e, _dec2$e, _class$e, _class2$e, _initializer$e, _initializer2$d, _initializer3$6;
var CylinderCollider = (_dec$e = ccclass('cc.CylinderCollider'), _dec2$e = type(EAxisDirection), _dec$e(_class$e = (_class2$e = function (_Collider) {
  function CylinderCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.CYLINDER) || this;
    _this._radius = _initializer$e && _initializer$e();
    _this._height = _initializer2$d && _initializer2$d();
    _this._direction = _initializer3$6 && _initializer3$6();
    return _this;
  }
  _inheritsLoose(CylinderCollider, _Collider);
  return _createClass(CylinderCollider, [{
    key: "radius",
    get: function get() {
      return this._radius;
    },
    set: function set(value) {
      if (this._radius === value) return;
      this._radius = Math.abs(value);
      if (this._shape) {
        this.shape.setRadius(value);
      }
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(value) {
      if (this._height === value) return;
      this._height = Math.abs(value);
      if (this._shape) {
        this.shape.setHeight(value);
      }
    }
  }, {
    key: "direction",
    get: function get() {
      return this._direction;
    },
    set: function set(value) {
      if (this._direction === value) return;
      if (value < EAxisDirection.X_AXIS || value > EAxisDirection.Z_AXIS) return;
      this._direction = value;
      if (this._shape) {
        this.shape.setDirection(value);
      }
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }]);
}(Collider), _applyDecoratedDescriptor(_class2$e.prototype, "direction", [_dec2$e], Object.getOwnPropertyDescriptor(_class2$e.prototype, "direction"), _class2$e.prototype), _initializer$e = applyDecoratedInitializer(_class2$e.prototype, "_radius", [serializable], function () {
  return 0.5;
}), _initializer2$d = applyDecoratedInitializer(_class2$e.prototype, "_height", [serializable], function () {
  return 2;
}), _initializer3$6 = applyDecoratedInitializer(_class2$e.prototype, "_direction", [serializable], function () {
  return EAxisDirection.Y_AXIS;
}), _class2$e)) || _class$e);

var _dec$d, _dec2$d, _class$d, _class2$d, _initializer$d, _initializer2$c, _initializer3$5;
var ConeCollider = (_dec$d = ccclass('cc.ConeCollider'), _dec2$d = type(EAxisDirection), _dec$d(_class$d = (_class2$d = function (_Collider) {
  function ConeCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.CONE) || this;
    _this._radius = _initializer$d && _initializer$d();
    _this._height = _initializer2$c && _initializer2$c();
    _this._direction = _initializer3$5 && _initializer3$5();
    return _this;
  }
  _inheritsLoose(ConeCollider, _Collider);
  return _createClass(ConeCollider, [{
    key: "radius",
    get: function get() {
      return this._radius;
    },
    set: function set(value) {
      if (this._radius === value) return;
      this._radius = Math.abs(value);
      if (this._shape) {
        this.shape.setRadius(value);
      }
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(value) {
      if (this._height === value) return;
      if (value < 0) value = 0;
      this._height = value;
      if (this._shape) {
        this.shape.setHeight(value);
      }
    }
  }, {
    key: "direction",
    get: function get() {
      return this._direction;
    },
    set: function set(value) {
      if (this._direction === value) return;
      if (value < EAxisDirection.X_AXIS || value > EAxisDirection.Z_AXIS) return;
      this._direction = value;
      if (this._shape) {
        this.shape.setDirection(value);
      }
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }]);
}(Collider), _applyDecoratedDescriptor(_class2$d.prototype, "direction", [_dec2$d], Object.getOwnPropertyDescriptor(_class2$d.prototype, "direction"), _class2$d.prototype), _initializer$d = applyDecoratedInitializer(_class2$d.prototype, "_radius", [serializable], function () {
  return 0.5;
}), _initializer2$c = applyDecoratedInitializer(_class2$d.prototype, "_height", [serializable], function () {
  return 1;
}), _initializer3$5 = applyDecoratedInitializer(_class2$d.prototype, "_direction", [serializable], function () {
  return EAxisDirection.Y_AXIS;
}), _class2$d)) || _class$d);

var _dec$c, _dec2$c, _class$c, _class2$c, _initializer$c, _initializer2$b;
var MeshCollider = (_dec$c = ccclass('cc.MeshCollider'), _dec2$c = type(Mesh), _dec$c(_class$c = (_class2$c = function (_Collider) {
  function MeshCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.MESH) || this;
    _this._mesh = _initializer$c && _initializer$c();
    _this._convex = _initializer2$b && _initializer2$b();
    return _this;
  }
  _inheritsLoose(MeshCollider, _Collider);
  var _proto = MeshCollider.prototype;
  _proto.onEnable = function onEnable() {
    _Collider.prototype.onEnable.call(this);
    if (this.node) {
      var body = this.node.getComponent(RigidBody);
      if (body && body.isValid && body.type === ERigidBodyType.DYNAMIC && !this.convex) {
        warnID(9630, this.node.name);
      }
    }
  };
  return _createClass(MeshCollider, [{
    key: "mesh",
    get: function get() {
      return this._mesh;
    },
    set: function set(value) {
      if (this._mesh === value) return;
      this._mesh = value;
      if (this._shape) this.shape.setMesh(this._mesh);
    }
  }, {
    key: "convex",
    get: function get() {
      return this._convex;
    },
    set: function set(value) {
      if (this._convex === value) return;
      this._convex = value;
      if (this._shape && this._mesh) this.shape.setMesh(this._mesh);
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }]);
}(Collider), _applyDecoratedDescriptor(_class2$c.prototype, "mesh", [_dec2$c], Object.getOwnPropertyDescriptor(_class2$c.prototype, "mesh"), _class2$c.prototype), _initializer$c = applyDecoratedInitializer(_class2$c.prototype, "_mesh", [serializable], function () {
  return null;
}), _initializer2$b = applyDecoratedInitializer(_class2$c.prototype, "_convex", [serializable], function () {
  return false;
}), _class2$c)) || _class$c);

var _dec$b, _dec2$b, _class$b, _class2$b, _initializer$b, _initializer2$a, _initializer3$4, _initializer4$3;
var ConstantForce = (_dec$b = ccclass('cc.ConstantForce'), _dec2$b = requireComponent(RigidBody), _dec$b(_class$b = _dec2$b(_class$b = disallowMultiple(_class$b = (_class2$b = function (_Component) {
  function ConstantForce() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this._rigidBody = null;
    _this._force = _initializer$b && _initializer$b();
    _this._localForce = _initializer2$a && _initializer2$a();
    _this._torque = _initializer3$4 && _initializer3$4();
    _this._localTorque = _initializer4$3 && _initializer4$3();
    _this._mask = 0;
    return _this;
  }
  _inheritsLoose(ConstantForce, _Component);
  var _proto = ConstantForce.prototype;
  _proto.onLoad = function onLoad() {
    this._rigidBody = this.node.getComponent(RigidBody);
    this._maskUpdate(this._force, 1);
    this._maskUpdate(this._localForce, 2);
    this._maskUpdate(this._torque, 4);
    this._maskUpdate(this._localTorque, 8);
  };
  _proto.lateUpdate = function lateUpdate(dt) {
    {
      if (this._rigidBody != null && this._mask !== 0) {
        if (this._mask & 1) this._rigidBody.applyForce(this._force);
        if (this._mask & 2) this._rigidBody.applyLocalForce(this.localForce);
        if (this._mask & 4) this._rigidBody.applyTorque(this._torque);
        if (this._mask & 8) this._rigidBody.applyLocalTorque(this._localTorque);
      }
    }
  };
  _proto._maskUpdate = function _maskUpdate(t, m) {
    if (t.strictEquals(Vec3.ZERO)) {
      this._mask &= ~m;
    } else {
      this._mask |= m;
    }
  };
  return _createClass(ConstantForce, [{
    key: "force",
    get: function get() {
      return this._force;
    },
    set: function set(value) {
      Vec3.copy(this._force, value);
      this._maskUpdate(this._force, 1);
    }
  }, {
    key: "localForce",
    get: function get() {
      return this._localForce;
    },
    set: function set(value) {
      Vec3.copy(this._localForce, value);
      this._maskUpdate(this.localForce, 2);
    }
  }, {
    key: "torque",
    get: function get() {
      return this._torque;
    },
    set: function set(value) {
      Vec3.copy(this._torque, value);
      this._maskUpdate(this._torque, 4);
    }
  }, {
    key: "localTorque",
    get: function get() {
      return this._localTorque;
    },
    set: function set(value) {
      Vec3.copy(this._localTorque, value);
      this._maskUpdate(this._localTorque, 8);
    }
  }]);
}(Component), _initializer$b = applyDecoratedInitializer(_class2$b.prototype, "_force", [serializable], function () {
  return new Vec3();
}), _initializer2$a = applyDecoratedInitializer(_class2$b.prototype, "_localForce", [serializable], function () {
  return new Vec3();
}), _initializer3$4 = applyDecoratedInitializer(_class2$b.prototype, "_torque", [serializable], function () {
  return new Vec3();
}), _initializer4$3 = applyDecoratedInitializer(_class2$b.prototype, "_localTorque", [serializable], function () {
  return new Vec3();
}), _class2$b)) || _class$b) || _class$b) || _class$b);

var _dec$a, _dec2$a, _class$a, _class2$a, _initializer$a;
var TerrainCollider = (_dec$a = ccclass('cc.TerrainCollider'), _dec2$a = type(TerrainAsset), _dec$a(_class$a = (_class2$a = function (_Collider) {
  function TerrainCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.TERRAIN) || this;
    _this._terrain = _initializer$a && _initializer$a();
    return _this;
  }
  _inheritsLoose(TerrainCollider, _Collider);
  var _proto = TerrainCollider.prototype;
  _proto.onEnable = function onEnable() {
    _Collider.prototype.onEnable.call(this);
    if (this.node) {
      var body = this.node.getComponent(RigidBody);
      if (body && body.isValid && body.type === ERigidBodyType.DYNAMIC) {
        warnID(9630, this.node.name);
      }
    }
  };
  return _createClass(TerrainCollider, [{
    key: "terrain",
    get: function get() {
      return this._terrain;
    },
    set: function set(value) {
      this._terrain = value;
      if (this._shape) this.shape.setTerrain(this._terrain);
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }]);
}(Collider), _applyDecoratedDescriptor(_class2$a.prototype, "terrain", [_dec2$a], Object.getOwnPropertyDescriptor(_class2$a.prototype, "terrain"), _class2$a.prototype), _initializer$a = applyDecoratedInitializer(_class2$a.prototype, "_terrain", [serializable], function () {
  return null;
}), _class2$a)) || _class$a);

var _dec$9, _dec2$9, _class$9, _class2$9, _initializer$9, _initializer2$9, _SimplexCollider;
var SimplexCollider = (_dec$9 = ccclass('cc.SimplexCollider'), _dec2$9 = type(ESimplexType), _dec$9(_class$9 = (_class2$9 = (_SimplexCollider = function (_Collider) {
  function SimplexCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.SIMPLEX) || this;
    _this._shapeType = _initializer$9 && _initializer$9();
    _this._vertices = _initializer2$9 && _initializer2$9();
    return _this;
  }
  _inheritsLoose(SimplexCollider, _Collider);
  var _proto = SimplexCollider.prototype;
  _proto.updateVertices = function updateVertices() {
    if (this._shape) {
      this.shape.setVertices(this._vertices);
    }
  };
  return _createClass(SimplexCollider, [{
    key: "shapeType",
    get: function get() {
      return this._shapeType;
    },
    set: function set(v) {
      this._shapeType = v;
      if (this._shape) {
        this.shape.setShapeType(v);
      }
    }
  }, {
    key: "vertex0",
    get: function get() {
      return this._vertices[0];
    },
    set: function set(v) {
      Vec3.copy(this._vertices[0], v);
      this.updateVertices();
    }
  }, {
    key: "vertex1",
    get: function get() {
      return this._vertices[1];
    },
    set: function set(v) {
      Vec3.copy(this._vertices[1], v);
      this.updateVertices();
    }
  }, {
    key: "vertex2",
    get: function get() {
      return this._vertices[2];
    },
    set: function set(v) {
      Vec3.copy(this._vertices[2], v);
      this.updateVertices();
    }
  }, {
    key: "vertex3",
    get: function get() {
      return this._vertices[3];
    },
    set: function set(v) {
      Vec3.copy(this._vertices[3], v);
      this.updateVertices();
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }, {
    key: "vertices",
    get: function get() {
      return this._vertices;
    }
  }]);
}(Collider), _SimplexCollider.ESimplexType = ESimplexType, _SimplexCollider), _applyDecoratedDescriptor(_class2$9.prototype, "shapeType", [_dec2$9], Object.getOwnPropertyDescriptor(_class2$9.prototype, "shapeType"), _class2$9.prototype), _initializer$9 = applyDecoratedInitializer(_class2$9.prototype, "_shapeType", [serializable], function () {
  return ESimplexType.TETRAHEDRON;
}), _initializer2$9 = applyDecoratedInitializer(_class2$9.prototype, "_vertices", [serializable], function () {
  return [new Vec3(0, 0, 0), new Vec3(0, 0, 1), new Vec3(1, 0, 0), new Vec3(0, 1, 0)];
}), _class2$9)) || _class$9);
(function (_SimplexCollider2) {})(SimplexCollider || (SimplexCollider = {}));

var _dec$8, _dec2$8, _class$8, _class2$8, _initializer$8, _initializer2$8;
var PlaneCollider = (_dec$8 = ccclass('cc.PlaneCollider'), _dec2$8 = type(Vec3), _dec$8(_class$8 = (_class2$8 = function (_Collider) {
  function PlaneCollider() {
    var _this;
    _this = _Collider.call(this, EColliderType.PLANE) || this;
    _this._normal = _initializer$8 && _initializer$8();
    _this._constant = _initializer2$8 && _initializer2$8();
    return _this;
  }
  _inheritsLoose(PlaneCollider, _Collider);
  var _proto = PlaneCollider.prototype;
  _proto.onEnable = function onEnable() {
    _Collider.prototype.onEnable.call(this);
    if (this.node) {
      var body = this.node.getComponent(RigidBody);
      if (body && body.isValid && body.type === ERigidBodyType.DYNAMIC) {
        warnID(9630, this.node.name);
      }
    }
  };
  return _createClass(PlaneCollider, [{
    key: "normal",
    get: function get() {
      return this._normal;
    },
    set: function set(value) {
      if (Vec3.strictEquals(this._normal, value)) return;
      Vec3.copy(this._normal, value);
      if (this._shape) {
        this.shape.setNormal(this._normal);
      }
    }
  }, {
    key: "constant",
    get: function get() {
      return this._constant;
    },
    set: function set(v) {
      if (this._constant === v) return;
      this._constant = v;
      if (this._shape) {
        this.shape.setConstant(this._constant);
      }
    }
  }, {
    key: "shape",
    get: function get() {
      return this._shape;
    }
  }]);
}(Collider), _applyDecoratedDescriptor(_class2$8.prototype, "normal", [_dec2$8], Object.getOwnPropertyDescriptor(_class2$8.prototype, "normal"), _class2$8.prototype), _initializer$8 = applyDecoratedInitializer(_class2$8.prototype, "_normal", [serializable], function () {
  return new Vec3(0, 1, 0);
}), _initializer2$8 = applyDecoratedInitializer(_class2$8.prototype, "_constant", [serializable], function () {
  return 0;
}), _class2$8)) || _class$8);

var _dec$7, _dec2$7, _dec3$7, _dec4$6, _dec5$5, _class$7, _class2$7, _initializer$7, _initializer2$7, _Constraint;
var Constraint = (_dec$7 = ccclass('cc.Constraint'), _dec2$7 = requireComponent(RigidBody), _dec3$7 = type(RigidBody), _dec4$6 = type(RigidBody), _dec5$5 = type(RigidBody), _dec$7(_class$7 = _dec2$7(_class$7 = (_class2$7 = (_Constraint = function (_Eventify) {
  function Constraint(type) {
    var _this;
    _this = _Eventify.call(this) || this;
    _this.TYPE = void 0;
    _this._enableCollision = _initializer$7 && _initializer$7();
    _this._connectedBody = _initializer2$7 && _initializer2$7();
    _this._constraint = null;
    _this.TYPE = type;
    return _this;
  }
  _inheritsLoose(Constraint, _Eventify);
  var _proto = Constraint.prototype;
  _proto.onLoad = function onLoad() {
    if (!selector.runInEditor) return;
    this._constraint = createConstraint(this.TYPE);
    this._constraint.initialize(this);
  };
  _proto.onEnable = function onEnable() {
    if (this._constraint) {
      this._constraint.onEnable();
    }
  };
  _proto.onDisable = function onDisable() {
    if (this._constraint) {
      this._constraint.onDisable();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._constraint) {
      this._constraint.onDestroy();
    }
  };
  return _createClass(Constraint, [{
    key: "attachedBody",
    get: function get() {
      return this.getComponent(RigidBody);
    }
  }, {
    key: "connectedBody",
    get: function get() {
      return this._connectedBody;
    },
    set: function set(v) {
      this._connectedBody = v;
      {
        if (this._constraint) this._constraint.setConnectedBody(v);
      }
    }
  }, {
    key: "enableCollision",
    get: function get() {
      return this._enableCollision;
    },
    set: function set(v) {
      this._enableCollision = v;
      {
        if (this._constraint) this._constraint.setEnableCollision(v);
      }
    }
  }]);
}(Eventify(Component)), _Constraint.Type = EConstraintType, _Constraint), _applyDecoratedDescriptor(_class2$7.prototype, "attachedBody", [_dec3$7], Object.getOwnPropertyDescriptor(_class2$7.prototype, "attachedBody"), _class2$7.prototype), _applyDecoratedDescriptor(_class2$7.prototype, "connectedBody", [_dec4$6], Object.getOwnPropertyDescriptor(_class2$7.prototype, "connectedBody"), _class2$7.prototype), _initializer$7 = applyDecoratedInitializer(_class2$7.prototype, "_enableCollision", [serializable], function () {
  return true;
}), _initializer2$7 = applyDecoratedInitializer(_class2$7.prototype, "_connectedBody", [_dec5$5], function () {
  return null;
}), _class2$7)) || _class$7) || _class$7);
(function (_Constraint2) {})(Constraint || (Constraint = {}));

var _dec$6, _dec2$6, _dec3$6, _dec4$5, _dec5$4, _dec6$2, _dec7$2, _class$6, _class2$6, _initializer$6, _initializer2$6, _initializer3$3, _dec8$1, _dec9$1, _dec0$1, _dec1$1, _dec10$1, _dec11$1, _dec12$1, _class3$1, _class4$1, _initializer4$2, _initializer5$2, _initializer6$2, _dec13$1, _dec14$1, _dec15$1, _dec16$1, _dec17$1, _dec18$1, _dec19$1, _dec20$1, _dec21$1, _dec22$1, _dec23$1, _dec24$1, _dec25$1, _dec26$1, _dec27$1, _class5$1, _class6$1, _initializer7$1, _initializer8$1, _initializer9$1, _initializer0$1, _initializer1$1;
var HingeLimitData = (_dec$6 = ccclass('cc.HingeLimitData'), _dec2$6 = formerlySerializedAs('enabled'), _dec3$6 = formerlySerializedAs('upperLimit'), _dec4$5 = formerlySerializedAs('lowerLimit'), _dec5$4 = type(CCBoolean), _dec6$2 = type(CCFloat), _dec7$2 = type(CCFloat), _dec$6(_class$6 = (_class2$6 = function () {
  function HingeLimitData() {
    this._enabled = _initializer$6 && _initializer$6();
    this._upperLimit = _initializer2$6 && _initializer2$6();
    this._lowerLimit = _initializer3$3 && _initializer3$3();
  }
  return _createClass(HingeLimitData, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(v) {
      this._enabled = v;
    }
  }, {
    key: "upperLimit",
    get: function get() {
      return this._upperLimit;
    },
    set: function set(v) {
      this._upperLimit = v;
    }
  }, {
    key: "lowerLimit",
    get: function get() {
      return this._lowerLimit;
    },
    set: function set(v) {
      this._lowerLimit = v;
    }
  }]);
}(), _initializer$6 = applyDecoratedInitializer(_class2$6.prototype, "_enabled", [serializable, _dec2$6], function () {
  return false;
}), _initializer2$6 = applyDecoratedInitializer(_class2$6.prototype, "_upperLimit", [serializable, _dec3$6], function () {
  return Number.MAX_VALUE;
}), _initializer3$3 = applyDecoratedInitializer(_class2$6.prototype, "_lowerLimit", [serializable, _dec4$5], function () {
  return -Number.MAX_VALUE;
}), _applyDecoratedDescriptor(_class2$6.prototype, "enabled", [_dec5$4], Object.getOwnPropertyDescriptor(_class2$6.prototype, "enabled"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "upperLimit", [_dec6$2], Object.getOwnPropertyDescriptor(_class2$6.prototype, "upperLimit"), _class2$6.prototype), _applyDecoratedDescriptor(_class2$6.prototype, "lowerLimit", [_dec7$2], Object.getOwnPropertyDescriptor(_class2$6.prototype, "lowerLimit"), _class2$6.prototype), _class2$6)) || _class$6);
var HingeMotorData = (_dec8$1 = ccclass('cc.HingeMotorData'), _dec9$1 = formerlySerializedAs('enabled'), _dec0$1 = formerlySerializedAs('motorVelocity'), _dec1$1 = formerlySerializedAs('motorForceLimit'), _dec10$1 = type(CCBoolean), _dec11$1 = type(CCFloat), _dec12$1 = type(CCFloat), _dec8$1(_class3$1 = (_class4$1 = function () {
  function HingeMotorData() {
    this._enabled = _initializer4$2 && _initializer4$2();
    this._motorVelocity = _initializer5$2 && _initializer5$2();
    this._motorForceLimit = _initializer6$2 && _initializer6$2();
  }
  return _createClass(HingeMotorData, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(v) {
      this._enabled = v;
    }
  }, {
    key: "motorVelocity",
    get: function get() {
      return this._motorVelocity;
    },
    set: function set(v) {
      this._motorVelocity = v;
    }
  }, {
    key: "motorForceLimit",
    get: function get() {
      return this._motorForceLimit;
    },
    set: function set(v) {
      this._motorForceLimit = v;
    }
  }]);
}(), _initializer4$2 = applyDecoratedInitializer(_class4$1.prototype, "_enabled", [serializable, _dec9$1], function () {
  return false;
}), _initializer5$2 = applyDecoratedInitializer(_class4$1.prototype, "_motorVelocity", [serializable, _dec0$1], function () {
  return 0;
}), _initializer6$2 = applyDecoratedInitializer(_class4$1.prototype, "_motorForceLimit", [serializable, _dec1$1], function () {
  return 0;
}), _applyDecoratedDescriptor(_class4$1.prototype, "enabled", [_dec10$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "enabled"), _class4$1.prototype), _applyDecoratedDescriptor(_class4$1.prototype, "motorVelocity", [_dec11$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "motorVelocity"), _class4$1.prototype), _applyDecoratedDescriptor(_class4$1.prototype, "motorForceLimit", [_dec12$1], Object.getOwnPropertyDescriptor(_class4$1.prototype, "motorForceLimit"), _class4$1.prototype), _class4$1)) || _class3$1);
var HingeConstraint = (_dec13$1 = ccclass('cc.HingeConstraint'), _dec14$1 = type(Vec3), _dec15$1 = type(Vec3), _dec16$1 = type(Vec3), _dec17$1 = type(CCBoolean), _dec18$1 = type(CCFloat), _dec19$1 = type(CCFloat), _dec20$1 = type(CCBoolean), _dec21$1 = type(CCFloat), _dec22$1 = type(CCFloat), _dec23$1 = formerlySerializedAs('axisA'), _dec24$1 = formerlySerializedAs('pivotA'), _dec25$1 = formerlySerializedAs('pivotB'), _dec26$1 = formerlySerializedAs('limitData'), _dec27$1 = formerlySerializedAs('motorData'), _dec13$1(_class5$1 = (_class6$1 = function (_Constraint) {
  function HingeConstraint() {
    var _this;
    _this = _Constraint.call(this, EConstraintType.HINGE) || this;
    _this._axis = _initializer7$1 && _initializer7$1();
    _this._pivotA = _initializer8$1 && _initializer8$1();
    _this._pivotB = _initializer9$1 && _initializer9$1();
    _this._limitData = _initializer0$1 && _initializer0$1();
    _this._motorData = _initializer1$1 && _initializer1$1();
    return _this;
  }
  _inheritsLoose(HingeConstraint, _Constraint);
  return _createClass(HingeConstraint, [{
    key: "pivotA",
    get: function get() {
      return this._pivotA;
    },
    set: function set(v) {
      Vec3.copy(this._pivotA, v);
      {
        this.constraint.setPivotA(this._pivotA);
      }
    }
  }, {
    key: "pivotB",
    get: function get() {
      return this._pivotB;
    },
    set: function set(v) {
      Vec3.copy(this._pivotB, v);
      {
        this.constraint.setPivotB(this._pivotB);
      }
    }
  }, {
    key: "axis",
    get: function get() {
      return this._axis;
    },
    set: function set(v) {
      Vec3.copy(this._axis, v);
      {
        this.constraint.setAxis(this._axis);
      }
    }
  }, {
    key: "limitEnabled",
    get: function get() {
      return this._limitData.enabled;
    },
    set: function set(v) {
      this._limitData.enabled = v;
      {
        this.constraint.setLimitEnabled(v);
      }
    }
  }, {
    key: "upperLimit",
    get: function get() {
      return this._limitData.upperLimit;
    },
    set: function set(v) {
      this._limitData.upperLimit = v;
      {
        this.constraint.setUpperLimit(v);
      }
    }
  }, {
    key: "lowerLimit",
    get: function get() {
      return this._limitData.lowerLimit;
    },
    set: function set(v) {
      this._limitData.lowerLimit = v;
      {
        this.constraint.setLowerLimit(v);
      }
    }
  }, {
    key: "motorEnabled",
    get: function get() {
      return this._motorData.enabled;
    },
    set: function set(v) {
      this._motorData.enabled = v;
      {
        this.constraint.setMotorEnabled(v);
      }
    }
  }, {
    key: "motorVelocity",
    get: function get() {
      return this._motorData.motorVelocity;
    },
    set: function set(v) {
      this._motorData.motorVelocity = v;
      {
        this.constraint.setMotorVelocity(v);
      }
    }
  }, {
    key: "motorForceLimit",
    get: function get() {
      return this._motorData.motorForceLimit;
    },
    set: function set(v) {
      this._motorData.motorForceLimit = v;
      {
        this.constraint.setMotorForceLimit(v);
      }
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._constraint;
    }
  }]);
}(Constraint), _applyDecoratedDescriptor(_class6$1.prototype, "pivotA", [_dec14$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "pivotA"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "pivotB", [_dec15$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "pivotB"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "axis", [_dec16$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "axis"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "limitEnabled", [_dec17$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "limitEnabled"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "upperLimit", [_dec18$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "upperLimit"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "lowerLimit", [_dec19$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "lowerLimit"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "motorEnabled", [_dec20$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "motorEnabled"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "motorVelocity", [_dec21$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "motorVelocity"), _class6$1.prototype), _applyDecoratedDescriptor(_class6$1.prototype, "motorForceLimit", [_dec22$1], Object.getOwnPropertyDescriptor(_class6$1.prototype, "motorForceLimit"), _class6$1.prototype), _initializer7$1 = applyDecoratedInitializer(_class6$1.prototype, "_axis", [serializable, _dec23$1], function () {
  return new Vec3();
}), _initializer8$1 = applyDecoratedInitializer(_class6$1.prototype, "_pivotA", [serializable, _dec24$1], function () {
  return new Vec3();
}), _initializer9$1 = applyDecoratedInitializer(_class6$1.prototype, "_pivotB", [serializable, _dec25$1], function () {
  return new Vec3();
}), _initializer0$1 = applyDecoratedInitializer(_class6$1.prototype, "_limitData", [serializable, _dec26$1], function () {
  return new HingeLimitData();
}), _initializer1$1 = applyDecoratedInitializer(_class6$1.prototype, "_motorData", [serializable, _dec27$1], function () {
  return new HingeMotorData();
}), _class6$1)) || _class5$1);

var _dec$5, _dec2$5, _dec3$5, _dec4$4, _dec5$3, _class$5, _class2$5, _initializer$5, _initializer2$5;
var FixedConstraint = (_dec$5 = ccclass('cc.FixedConstraint'), _dec2$5 = type(CCFloat), _dec3$5 = type(CCFloat), _dec4$4 = formerlySerializedAs('breakForce'), _dec5$3 = formerlySerializedAs('breakTorque'), _dec$5(_class$5 = (_class2$5 = function (_Constraint) {
  function FixedConstraint() {
    var _this;
    _this = _Constraint.call(this, EConstraintType.FIXED) || this;
    _this._breakForce = _initializer$5 && _initializer$5();
    _this._breakTorque = _initializer2$5 && _initializer2$5();
    return _this;
  }
  _inheritsLoose(FixedConstraint, _Constraint);
  return _createClass(FixedConstraint, [{
    key: "breakForce",
    get: function get() {
      return this._breakForce;
    },
    set: function set(v) {
      this._breakForce = v;
      {
        this.constraint.setBreakForce(v);
      }
    }
  }, {
    key: "breakTorque",
    get: function get() {
      return this._breakTorque;
    },
    set: function set(v) {
      this._breakTorque = v;
      {
        this.constraint.setBreakTorque(v);
      }
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._constraint;
    }
  }]);
}(Constraint), _applyDecoratedDescriptor(_class2$5.prototype, "breakForce", [_dec2$5], Object.getOwnPropertyDescriptor(_class2$5.prototype, "breakForce"), _class2$5.prototype), _applyDecoratedDescriptor(_class2$5.prototype, "breakTorque", [_dec3$5], Object.getOwnPropertyDescriptor(_class2$5.prototype, "breakTorque"), _class2$5.prototype), _initializer$5 = applyDecoratedInitializer(_class2$5.prototype, "_breakForce", [serializable, _dec4$4], function () {
  return 1e8;
}), _initializer2$5 = applyDecoratedInitializer(_class2$5.prototype, "_breakTorque", [serializable, _dec5$3], function () {
  return 1e8;
}), _class2$5)) || _class$5);

var _dec$4, _dec2$4, _dec3$4, _dec4$3, _dec5$2, _dec6$1, _dec7$1, _dec8, _dec9, _dec0, _class$4, _class2$4, _initializer$4, _initializer2$4, _initializer3$2, _initializer4$1, _initializer5$1, _initializer6$1, _initializer7, _initializer8, _initializer9, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _class3, _class4, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _initializer20, _initializer21, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _class5, _class6, _initializer22, _initializer23, _initializer24, _initializer25, _initializer26, _initializer27, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _class7, _class8, _initializer28, _initializer29, _initializer30, _initializer31, _initializer32, _initializer33, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _class9, _class0, _initializer34, _initializer35, _initializer36, _initializer37, _initializer38, _initializer39, _initializer40, _initializer41, _initializer42, _initializer43, _initializer44;
var LinearLimitSettings = (_dec$4 = ccclass('cc.LinearLimitSettings'), _dec2$4 = type(EConstraintMode), _dec3$4 = type(EConstraintMode), _dec4$3 = type(EConstraintMode), _dec5$2 = type(Vec3), _dec6$1 = type(Vec3), _dec7$1 = type(CCFloat), _dec8 = type(CCBoolean), _dec9 = type(CCFloat), _dec0 = type(CCFloat), _dec$4(_class$4 = (_class2$4 = function () {
  function LinearLimitSettings(configurableConstraint) {
    this._xMotion = _initializer$4 && _initializer$4();
    this._yMotion = _initializer2$4 && _initializer2$4();
    this._zMotion = _initializer3$2 && _initializer3$2();
    this._upper = _initializer4$1 && _initializer4$1();
    this._lower = _initializer5$1 && _initializer5$1();
    this._enableSoftConstraint = _initializer6$1 && _initializer6$1();
    this._bounciness = _initializer7 && _initializer7();
    this._stiffness = _initializer8 && _initializer8();
    this._damping = _initializer9 && _initializer9();
    this._impl = void 0;
    this._impl = configurableConstraint;
  }
  return _createClass(LinearLimitSettings, [{
    key: "xMotion",
    get: function get() {
      return this._xMotion;
    },
    set: function set(v) {
      this._xMotion = v;
      {
        this._impl.setConstraintMode(0, v);
      }
    }
  }, {
    key: "yMotion",
    get: function get() {
      return this._yMotion;
    },
    set: function set(v) {
      this._yMotion = v;
      {
        this._impl.setConstraintMode(1, v);
      }
    }
  }, {
    key: "zMotion",
    get: function get() {
      return this._zMotion;
    },
    set: function set(v) {
      this._zMotion = v;
      {
        this._impl.setConstraintMode(2, v);
      }
    }
  }, {
    key: "upper",
    get: function get() {
      return this._upper;
    },
    set: function set(v) {
      Vec3.copy(this._upper, v);
      {
        var lower = this.lower;
        this._impl.setLinearLimit(0, lower.x, v.x);
        this._impl.setLinearLimit(1, lower.y, v.y);
        this._impl.setLinearLimit(2, lower.z, v.z);
      }
    }
  }, {
    key: "lower",
    get: function get() {
      return this._lower;
    },
    set: function set(v) {
      Vec3.copy(this._lower, v);
      {
        var upper = this.upper;
        this._impl.setLinearLimit(0, v.x, upper.x);
        this._impl.setLinearLimit(1, v.y, upper.y);
        this._impl.setLinearLimit(2, v.z, upper.z);
      }
    }
  }, {
    key: "restitution",
    get: function get() {
      return this._bounciness;
    },
    set: function set(v) {
      this._bounciness = v;
      {
        this._impl.setLinearRestitution(v);
      }
    }
  }, {
    key: "enableSoftConstraint",
    get: function get() {
      return this._enableSoftConstraint;
    },
    set: function set(v) {
      this._enableSoftConstraint = v;
      {
        this._impl.setLinearSoftConstraint(v);
      }
    }
  }, {
    key: "stiffness",
    get: function get() {
      return this._stiffness;
    },
    set: function set(v) {
      this._stiffness = v;
      {
        this._impl.setLinearStiffness(v);
      }
    }
  }, {
    key: "damping",
    get: function get() {
      return this._damping;
    },
    set: function set(v) {
      this._damping = v;
      {
        this._impl.setLinearDamping(v);
      }
    }
  }, {
    key: "impl",
    set: function set(v) {
      this._impl = v;
    }
  }]);
}(), _applyDecoratedDescriptor(_class2$4.prototype, "xMotion", [_dec2$4], Object.getOwnPropertyDescriptor(_class2$4.prototype, "xMotion"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "yMotion", [_dec3$4], Object.getOwnPropertyDescriptor(_class2$4.prototype, "yMotion"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "zMotion", [_dec4$3], Object.getOwnPropertyDescriptor(_class2$4.prototype, "zMotion"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "upper", [_dec5$2], Object.getOwnPropertyDescriptor(_class2$4.prototype, "upper"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "lower", [_dec6$1], Object.getOwnPropertyDescriptor(_class2$4.prototype, "lower"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "restitution", [_dec7$1], Object.getOwnPropertyDescriptor(_class2$4.prototype, "restitution"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "enableSoftConstraint", [_dec8], Object.getOwnPropertyDescriptor(_class2$4.prototype, "enableSoftConstraint"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "stiffness", [_dec9], Object.getOwnPropertyDescriptor(_class2$4.prototype, "stiffness"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "damping", [_dec0], Object.getOwnPropertyDescriptor(_class2$4.prototype, "damping"), _class2$4.prototype), _initializer$4 = applyDecoratedInitializer(_class2$4.prototype, "_xMotion", [serializable], function () {
  return EConstraintMode.FREE;
}), _initializer2$4 = applyDecoratedInitializer(_class2$4.prototype, "_yMotion", [serializable], function () {
  return EConstraintMode.FREE;
}), _initializer3$2 = applyDecoratedInitializer(_class2$4.prototype, "_zMotion", [serializable], function () {
  return EConstraintMode.FREE;
}), _initializer4$1 = applyDecoratedInitializer(_class2$4.prototype, "_upper", [serializable], function () {
  return new Vec3();
}), _initializer5$1 = applyDecoratedInitializer(_class2$4.prototype, "_lower", [serializable], function () {
  return new Vec3();
}), _initializer6$1 = applyDecoratedInitializer(_class2$4.prototype, "_enableSoftConstraint", [serializable], function () {
  return false;
}), _initializer7 = applyDecoratedInitializer(_class2$4.prototype, "_bounciness", [serializable], function () {
  return 0;
}), _initializer8 = applyDecoratedInitializer(_class2$4.prototype, "_stiffness", [serializable], function () {
  return 0;
}), _initializer9 = applyDecoratedInitializer(_class2$4.prototype, "_damping", [serializable], function () {
  return 0;
}), _class2$4)) || _class$4);
var AngularLimitSettings = (_dec1 = ccclass('cc.AngularLimitSettings'), _dec10 = type(EConstraintMode), _dec11 = type(EConstraintMode), _dec12 = type(EConstraintMode), _dec13 = type(CCFloat), _dec14 = type(CCFloat), _dec15 = type(CCFloat), _dec16 = type(CCFloat), _dec17 = type(CCFloat), _dec18 = type(CCBoolean), _dec19 = type(CCFloat), _dec20 = type(CCFloat), _dec21 = type(CCBoolean), _dec22 = type(CCFloat), _dec23 = type(CCFloat), _dec1(_class3 = (_class4 = function () {
  function AngularLimitSettings(configurableConstraint) {
    this._swing1Motion = _initializer0 && _initializer0();
    this._swing2Motion = _initializer1 && _initializer1();
    this._twistMotion = _initializer10 && _initializer10();
    this._twistExtent = _initializer11 && _initializer11();
    this._swingExtent1 = _initializer12 && _initializer12();
    this._swingExtent2 = _initializer13 && _initializer13();
    this._enableSoftConstraintSwing = _initializer14 && _initializer14();
    this._swingBounciness = _initializer15 && _initializer15();
    this._swingStiffness = _initializer16 && _initializer16();
    this._swingDamping = _initializer17 && _initializer17();
    this._enableSoftConstraintTwist = _initializer18 && _initializer18();
    this._twistBounciness = _initializer19 && _initializer19();
    this._twistStiffness = _initializer20 && _initializer20();
    this._twistDamping = _initializer21 && _initializer21();
    this._impl = void 0;
    this._impl = configurableConstraint;
  }
  return _createClass(AngularLimitSettings, [{
    key: "twistMotion",
    get: function get() {
      return this._twistMotion;
    },
    set: function set(v) {
      this._twistMotion = v;
      {
        this._impl.setConstraintMode(3, v);
      }
    }
  }, {
    key: "swingMotion1",
    get: function get() {
      return this._swing1Motion;
    },
    set: function set(v) {
      this._swing1Motion = v;
      {
        this._impl.setConstraintMode(4, v);
      }
    }
  }, {
    key: "swingMotion2",
    get: function get() {
      return this._swing2Motion;
    },
    set: function set(v) {
      this._swing2Motion = v;
      {
        this._impl.setConstraintMode(5, v);
      }
    }
  }, {
    key: "twistExtent",
    get: function get() {
      return this._twistExtent;
    },
    set: function set(v) {
      this._twistExtent = v;
      {
        this._impl.setAngularExtent(v, this.swingExtent1, this.swingExtent2);
      }
    }
  }, {
    key: "swingExtent1",
    get: function get() {
      return this._swingExtent1;
    },
    set: function set(v) {
      this._swingExtent1 = v;
      {
        this._impl.setAngularExtent(this.twistExtent, v, this.swingExtent2);
      }
    }
  }, {
    key: "swingExtent2",
    get: function get() {
      return this._swingExtent2;
    },
    set: function set(v) {
      this._swingExtent2 = v;
      {
        this._impl.setAngularExtent(this.twistExtent, this.swingExtent1, v);
      }
    }
  }, {
    key: "twistRestitution",
    get: function get() {
      return this._twistBounciness;
    },
    set: function set(v) {
      this._twistBounciness = v;
      {
        this._impl.setTwistRestitution(v);
      }
    }
  }, {
    key: "swingRestitution",
    get: function get() {
      return this._swingBounciness;
    },
    set: function set(v) {
      this._swingBounciness = v;
      {
        this._impl.setSwingRestitution(v);
      }
    }
  }, {
    key: "enableSoftConstraintTwist",
    get: function get() {
      return this._enableSoftConstraintTwist;
    },
    set: function set(v) {
      this._enableSoftConstraintTwist = v;
      {
        this._impl.setTwistSoftConstraint(v);
      }
    }
  }, {
    key: "twistStiffness",
    get: function get() {
      return this._twistStiffness;
    },
    set: function set(v) {
      this._twistStiffness = v;
      {
        this._impl.setTwistStiffness(v);
      }
    }
  }, {
    key: "twistDamping",
    get: function get() {
      return this._twistDamping;
    },
    set: function set(v) {
      this._twistDamping = v;
      {
        this._impl.setTwistDamping(v);
      }
    }
  }, {
    key: "enableSoftConstraintSwing",
    get: function get() {
      return this._enableSoftConstraintSwing;
    },
    set: function set(v) {
      this._enableSoftConstraintSwing = v;
      {
        this._impl.setSwingSoftConstraint(v);
      }
    }
  }, {
    key: "swingStiffness",
    get: function get() {
      return this._swingStiffness;
    },
    set: function set(v) {
      this._swingStiffness = v;
      {
        this._impl.setSwingStiffness(v);
      }
    }
  }, {
    key: "swingDamping",
    get: function get() {
      return this._swingDamping;
    },
    set: function set(v) {
      this._swingDamping = v;
      {
        this._impl.setSwingDamping(v);
      }
    }
  }, {
    key: "impl",
    set: function set(v) {
      this._impl = v;
    }
  }]);
}(), _applyDecoratedDescriptor(_class4.prototype, "twistMotion", [_dec10], Object.getOwnPropertyDescriptor(_class4.prototype, "twistMotion"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "swingMotion1", [_dec11], Object.getOwnPropertyDescriptor(_class4.prototype, "swingMotion1"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "swingMotion2", [_dec12], Object.getOwnPropertyDescriptor(_class4.prototype, "swingMotion2"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "twistExtent", [_dec13], Object.getOwnPropertyDescriptor(_class4.prototype, "twistExtent"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "swingExtent1", [_dec14], Object.getOwnPropertyDescriptor(_class4.prototype, "swingExtent1"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "swingExtent2", [_dec15], Object.getOwnPropertyDescriptor(_class4.prototype, "swingExtent2"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "twistRestitution", [_dec16], Object.getOwnPropertyDescriptor(_class4.prototype, "twistRestitution"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "swingRestitution", [_dec17], Object.getOwnPropertyDescriptor(_class4.prototype, "swingRestitution"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "enableSoftConstraintTwist", [_dec18], Object.getOwnPropertyDescriptor(_class4.prototype, "enableSoftConstraintTwist"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "twistStiffness", [_dec19], Object.getOwnPropertyDescriptor(_class4.prototype, "twistStiffness"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "twistDamping", [_dec20], Object.getOwnPropertyDescriptor(_class4.prototype, "twistDamping"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "enableSoftConstraintSwing", [_dec21], Object.getOwnPropertyDescriptor(_class4.prototype, "enableSoftConstraintSwing"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "swingStiffness", [_dec22], Object.getOwnPropertyDescriptor(_class4.prototype, "swingStiffness"), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, "swingDamping", [_dec23], Object.getOwnPropertyDescriptor(_class4.prototype, "swingDamping"), _class4.prototype), _initializer0 = applyDecoratedInitializer(_class4.prototype, "_swing1Motion", [serializable], function () {
  return EConstraintMode.FREE;
}), _initializer1 = applyDecoratedInitializer(_class4.prototype, "_swing2Motion", [serializable], function () {
  return EConstraintMode.FREE;
}), _initializer10 = applyDecoratedInitializer(_class4.prototype, "_twistMotion", [serializable], function () {
  return EConstraintMode.FREE;
}), _initializer11 = applyDecoratedInitializer(_class4.prototype, "_twistExtent", [serializable], function () {
  return 0;
}), _initializer12 = applyDecoratedInitializer(_class4.prototype, "_swingExtent1", [serializable], function () {
  return 0;
}), _initializer13 = applyDecoratedInitializer(_class4.prototype, "_swingExtent2", [serializable], function () {
  return 0;
}), _initializer14 = applyDecoratedInitializer(_class4.prototype, "_enableSoftConstraintSwing", [serializable], function () {
  return false;
}), _initializer15 = applyDecoratedInitializer(_class4.prototype, "_swingBounciness", [serializable], function () {
  return 0;
}), _initializer16 = applyDecoratedInitializer(_class4.prototype, "_swingStiffness", [serializable], function () {
  return 0;
}), _initializer17 = applyDecoratedInitializer(_class4.prototype, "_swingDamping", [serializable], function () {
  return 0;
}), _initializer18 = applyDecoratedInitializer(_class4.prototype, "_enableSoftConstraintTwist", [serializable], function () {
  return false;
}), _initializer19 = applyDecoratedInitializer(_class4.prototype, "_twistBounciness", [serializable], function () {
  return 0;
}), _initializer20 = applyDecoratedInitializer(_class4.prototype, "_twistStiffness", [serializable], function () {
  return 0;
}), _initializer21 = applyDecoratedInitializer(_class4.prototype, "_twistDamping", [serializable], function () {
  return 0;
}), _class4)) || _class3);
var LinearDriverSettings = (_dec24 = ccclass('cc.LinearDriverSettings'), _dec25 = type(EDriverMode), _dec26 = type(EDriverMode), _dec27 = type(EDriverMode), _dec28 = type(Vec3), _dec29 = type(Vec3), _dec30 = type(CCFloat), _dec24(_class5 = (_class6 = function () {
  function LinearDriverSettings(configurableConstraint) {
    this._target = _initializer22 && _initializer22();
    this._velocity = _initializer23 && _initializer23();
    this._xDrive = _initializer24 && _initializer24();
    this._yDrive = _initializer25 && _initializer25();
    this._zDrive = _initializer26 && _initializer26();
    this._strength = _initializer27 && _initializer27();
    this._impl = void 0;
    this._impl = configurableConstraint;
  }
  return _createClass(LinearDriverSettings, [{
    key: "xDrive",
    get: function get() {
      return this._xDrive;
    },
    set: function set(v) {
      this._xDrive = v;
      {
        this._impl.setDriverMode(0, v);
      }
    }
  }, {
    key: "yDrive",
    get: function get() {
      return this._yDrive;
    },
    set: function set(v) {
      this._yDrive = v;
      {
        this._impl.setDriverMode(1, v);
      }
    }
  }, {
    key: "zDrive",
    get: function get() {
      return this._zDrive;
    },
    set: function set(v) {
      this._zDrive = v;
      {
        this._impl.setDriverMode(2, v);
      }
    }
  }, {
    key: "targetPosition",
    get: function get() {
      return this._target;
    },
    set: function set(v) {
      Vec3.copy(this._target, v);
      {
        this._impl.setLinearMotorTarget(v);
      }
    }
  }, {
    key: "targetVelocity",
    get: function get() {
      return this._velocity;
    },
    set: function set(v) {
      Vec3.copy(this._velocity, v);
      {
        this._impl.setLinearMotorVelocity(v);
      }
    }
  }, {
    key: "strength",
    get: function get() {
      return this._strength;
    },
    set: function set(v) {
      this._strength = v;
      {
        this._impl.setLinearMotorForceLimit(v);
      }
    }
  }, {
    key: "impl",
    set: function set(v) {
      this._impl = v;
    }
  }]);
}(), _applyDecoratedDescriptor(_class6.prototype, "xDrive", [_dec25], Object.getOwnPropertyDescriptor(_class6.prototype, "xDrive"), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, "yDrive", [_dec26], Object.getOwnPropertyDescriptor(_class6.prototype, "yDrive"), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, "zDrive", [_dec27], Object.getOwnPropertyDescriptor(_class6.prototype, "zDrive"), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, "targetPosition", [_dec28], Object.getOwnPropertyDescriptor(_class6.prototype, "targetPosition"), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, "targetVelocity", [_dec29], Object.getOwnPropertyDescriptor(_class6.prototype, "targetVelocity"), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, "strength", [_dec30], Object.getOwnPropertyDescriptor(_class6.prototype, "strength"), _class6.prototype), _initializer22 = applyDecoratedInitializer(_class6.prototype, "_target", [serializable], function () {
  return new Vec3();
}), _initializer23 = applyDecoratedInitializer(_class6.prototype, "_velocity", [serializable], function () {
  return new Vec3();
}), _initializer24 = applyDecoratedInitializer(_class6.prototype, "_xDrive", [serializable], function () {
  return EDriverMode.DISABLED;
}), _initializer25 = applyDecoratedInitializer(_class6.prototype, "_yDrive", [serializable], function () {
  return EDriverMode.DISABLED;
}), _initializer26 = applyDecoratedInitializer(_class6.prototype, "_zDrive", [serializable], function () {
  return EDriverMode.DISABLED;
}), _initializer27 = applyDecoratedInitializer(_class6.prototype, "_strength", [serializable], function () {
  return 0;
}), _class6)) || _class5);
var AngularDriverSettings = (_dec31 = ccclass('cc.AngularDriverSettings'), _dec32 = type(EDriverMode), _dec33 = type(EDriverMode), _dec34 = type(EDriverMode), _dec35 = type(Vec3), _dec36 = type(Vec3), _dec37 = type(CCFloat), _dec31(_class7 = (_class8 = function () {
  function AngularDriverSettings(configurableConstraint) {
    this._swingDrive1 = _initializer28 && _initializer28();
    this._swingDrive2 = _initializer29 && _initializer29();
    this._twistDrive = _initializer30 && _initializer30();
    this._targetOrientation = _initializer31 && _initializer31();
    this._targetVelocity = _initializer32 && _initializer32();
    this._strength = _initializer33 && _initializer33();
    this._impl = void 0;
    this._impl = configurableConstraint;
  }
  return _createClass(AngularDriverSettings, [{
    key: "twistDrive",
    get: function get() {
      return this._twistDrive;
    },
    set: function set(v) {
      this._twistDrive = v;
      {
        this._impl.setDriverMode(3, v);
      }
    }
  }, {
    key: "swingDrive1",
    get: function get() {
      return this._swingDrive1;
    },
    set: function set(v) {
      this._swingDrive1 = v;
      {
        this._impl.setDriverMode(4, v);
      }
    }
  }, {
    key: "swingDrive2",
    get: function get() {
      return this._swingDrive2;
    },
    set: function set(v) {
      this._swingDrive2 = v;
      {
        this._impl.setDriverMode(5, v);
      }
    }
  }, {
    key: "targetOrientation",
    get: function get() {
      return this._targetOrientation;
    },
    set: function set(v) {
      Vec3.copy(this._targetOrientation, v);
      {
        this._impl.setAngularMotorTarget(v);
      }
    }
  }, {
    key: "targetVelocity",
    get: function get() {
      return this._targetVelocity;
    },
    set: function set(v) {
      Vec3.copy(this._targetVelocity, v);
      {
        this._impl.setAngularMotorVelocity(v);
      }
    }
  }, {
    key: "strength",
    get: function get() {
      return this._strength;
    },
    set: function set(v) {
      this._strength = v;
      {
        this._impl.setAngularMotorForceLimit(v);
      }
    }
  }, {
    key: "impl",
    set: function set(v) {
      this._impl = v;
    }
  }]);
}(), _applyDecoratedDescriptor(_class8.prototype, "twistDrive", [_dec32], Object.getOwnPropertyDescriptor(_class8.prototype, "twistDrive"), _class8.prototype), _applyDecoratedDescriptor(_class8.prototype, "swingDrive1", [_dec33], Object.getOwnPropertyDescriptor(_class8.prototype, "swingDrive1"), _class8.prototype), _applyDecoratedDescriptor(_class8.prototype, "swingDrive2", [_dec34], Object.getOwnPropertyDescriptor(_class8.prototype, "swingDrive2"), _class8.prototype), _applyDecoratedDescriptor(_class8.prototype, "targetOrientation", [_dec35], Object.getOwnPropertyDescriptor(_class8.prototype, "targetOrientation"), _class8.prototype), _applyDecoratedDescriptor(_class8.prototype, "targetVelocity", [_dec36], Object.getOwnPropertyDescriptor(_class8.prototype, "targetVelocity"), _class8.prototype), _applyDecoratedDescriptor(_class8.prototype, "strength", [_dec37], Object.getOwnPropertyDescriptor(_class8.prototype, "strength"), _class8.prototype), _initializer28 = applyDecoratedInitializer(_class8.prototype, "_swingDrive1", [serializable], function () {
  return EDriverMode.DISABLED;
}), _initializer29 = applyDecoratedInitializer(_class8.prototype, "_swingDrive2", [serializable], function () {
  return EDriverMode.DISABLED;
}), _initializer30 = applyDecoratedInitializer(_class8.prototype, "_twistDrive", [serializable], function () {
  return EDriverMode.DISABLED;
}), _initializer31 = applyDecoratedInitializer(_class8.prototype, "_targetOrientation", [serializable], function () {
  return new Vec3();
}), _initializer32 = applyDecoratedInitializer(_class8.prototype, "_targetVelocity", [serializable], function () {
  return new Vec3();
}), _initializer33 = applyDecoratedInitializer(_class8.prototype, "_strength", [serializable], function () {
  return 0;
}), _class8)) || _class7);
var ConfigurableConstraint = (_dec38 = ccclass('cc.ConfigurableConstraint'), _dec39 = type(Vec3), _dec40 = type(Vec3), _dec41 = type(Vec3), _dec42 = type(Vec3), _dec43 = type(CCBoolean), _dec44 = type(CCFloat), _dec45 = type(CCFloat), _dec46 = type(LinearLimitSettings), _dec47 = type(AngularLimitSettings), _dec48 = type(LinearDriverSettings), _dec49 = type(AngularDriverSettings), _dec50 = formerlySerializedAs('linearLimitSettings'), _dec51 = formerlySerializedAs('angularLimitSettings'), _dec52 = formerlySerializedAs('linearDriverSettings'), _dec53 = formerlySerializedAs('angularDriverSettings'), _dec38(_class9 = (_class0 = function (_Constraint) {
  function ConfigurableConstraint() {
    var _this;
    _this = _Constraint.call(this, EConstraintType.CONFIGURABLE) || this;
    _this._breakForce = _initializer34 && _initializer34();
    _this._breakTorque = _initializer35 && _initializer35();
    _this._linearLimitSettings = _initializer36 && _initializer36();
    _this._angularLimitSettings = _initializer37 && _initializer37();
    _this._linearDriverSettings = _initializer38 && _initializer38();
    _this._angularDriverSettings = _initializer39 && _initializer39();
    _this._pivotA = _initializer40 && _initializer40();
    _this._pivotB = _initializer41 && _initializer41();
    _this._autoPivotB = _initializer42 && _initializer42();
    _this._axis = _initializer43 && _initializer43();
    _this._secondaryAxis = _initializer44 && _initializer44();
    _this._linearLimitSettings = new LinearLimitSettings(_this.constraint);
    _this._angularLimitSettings = new AngularLimitSettings(_this.constraint);
    _this._linearDriverSettings = new LinearDriverSettings(_this.constraint);
    _this._angularDriverSettings = new AngularDriverSettings(_this.constraint);
    return _this;
  }
  _inheritsLoose(ConfigurableConstraint, _Constraint);
  var _proto = ConfigurableConstraint.prototype;
  _proto.onLoad = function onLoad() {
    _Constraint.prototype.onLoad.call(this);
    {
      this.linearLimitSettings.impl = this.constraint;
      this.angularLimitSettings.impl = this.constraint;
      this.linearDriverSettings.impl = this.constraint;
      this.angularDriverSettings.impl = this.constraint;
    }
  };
  return _createClass(ConfigurableConstraint, [{
    key: "axis",
    get: function get() {
      return this._axis;
    },
    set: function set(v) {
      Vec3.copy(this._axis, v);
      {
        this.constraint.setAxis(this._axis);
      }
    }
  }, {
    key: "secondaryAxis",
    get: function get() {
      return this._secondaryAxis;
    },
    set: function set(v) {
      Vec3.copy(this._secondaryAxis, v);
      {
        this.constraint.setSecondaryAxis(this._secondaryAxis);
      }
    }
  }, {
    key: "pivotA",
    get: function get() {
      return this._pivotA;
    },
    set: function set(v) {
      Vec3.copy(this._pivotA, v);
      {
        this.constraint.setPivotA(this._pivotA);
      }
    }
  }, {
    key: "pivotB",
    get: function get() {
      return this._pivotB;
    },
    set: function set(v) {
      Vec3.copy(this._pivotB, v);
      {
        this.constraint.setPivotB(this._pivotB);
      }
    }
  }, {
    key: "autoPivotB",
    get: function get() {
      return this._autoPivotB;
    },
    set: function set(v) {
      this._autoPivotB = v;
      {
        this.constraint.setAutoPivotB(this._autoPivotB);
      }
    }
  }, {
    key: "breakForce",
    get: function get() {
      return this._breakForce;
    },
    set: function set(v) {
      this._breakForce = v;
      {
        this.constraint.setBreakForce(v);
      }
    }
  }, {
    key: "breakTorque",
    get: function get() {
      return this._breakTorque;
    },
    set: function set(v) {
      this._breakTorque = v;
      {
        this.constraint.setBreakTorque(v);
      }
    }
  }, {
    key: "linearLimitSettings",
    get: function get() {
      return this._linearLimitSettings;
    },
    set: function set(v) {
      this._linearLimitSettings = v;
      {
        var constraint = this.constraint;
        constraint.setConstraintMode(0, v.xMotion);
        constraint.setConstraintMode(1, v.yMotion);
        constraint.setConstraintMode(2, v.zMotion);
        var upper = v.upper;
        var lower = v.lower;
        constraint.setLinearLimit(0, lower.x, upper.x);
        constraint.setLinearLimit(1, lower.y, upper.y);
        constraint.setLinearLimit(2, lower.z, upper.z);
        constraint.setLinearSoftConstraint(v.enableSoftConstraint);
        constraint.setLinearDamping(v.damping);
        constraint.setLinearStiffness(v.stiffness);
        constraint.setLinearRestitution(v.restitution);
      }
    }
  }, {
    key: "angularLimitSettings",
    get: function get() {
      return this._angularLimitSettings;
    },
    set: function set(v) {
      this._angularLimitSettings = v;
      {
        var constraint = this.constraint;
        constraint.setConstraintMode(3, v.twistMotion);
        constraint.setConstraintMode(4, v.swingMotion1);
        constraint.setConstraintMode(5, v.swingMotion2);
        constraint.setAngularExtent(v.twistExtent, v.swingExtent1, v.swingExtent2);
        constraint.setTwistRestitution(v.twistRestitution);
        constraint.setSwingRestitution(v.swingRestitution);
        constraint.setTwistSoftConstraint(v.enableSoftConstraintTwist);
        constraint.setSwingSoftConstraint(v.enableSoftConstraintSwing);
        constraint.setTwistDamping(v.twistDamping);
        constraint.setSwingDamping(v.swingDamping);
        constraint.setTwistStiffness(v.twistStiffness);
        constraint.setSwingStiffness(v.swingStiffness);
      }
    }
  }, {
    key: "linearDriverSettings",
    get: function get() {
      return this._linearDriverSettings;
    },
    set: function set(v) {
      this._linearDriverSettings = v;
      {
        var constraint = this.constraint;
        constraint.setDriverMode(0, v.xDrive);
        constraint.setDriverMode(1, v.yDrive);
        constraint.setDriverMode(2, v.zDrive);
        constraint.setLinearMotorTarget(v.targetPosition);
        constraint.setLinearMotorVelocity(v.targetVelocity);
        constraint.setLinearMotorForceLimit(v.strength);
      }
    }
  }, {
    key: "angularDriverSettings",
    get: function get() {
      return this._angularDriverSettings;
    },
    set: function set(v) {
      this._angularDriverSettings = v;
      {
        var constraint = this.constraint;
        constraint.setDriverMode(3, v.twistDrive);
        constraint.setDriverMode(4, v.swingDrive1);
        constraint.setDriverMode(5, v.swingDrive2);
        constraint.setAngularMotorTarget(v.targetOrientation);
        constraint.setAngularMotorVelocity(v.targetVelocity);
        constraint.setAngularMotorForceLimit(v.strength);
      }
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._constraint;
    }
  }]);
}(Constraint), _applyDecoratedDescriptor(_class0.prototype, "axis", [_dec39], Object.getOwnPropertyDescriptor(_class0.prototype, "axis"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "secondaryAxis", [_dec40], Object.getOwnPropertyDescriptor(_class0.prototype, "secondaryAxis"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "pivotA", [_dec41], Object.getOwnPropertyDescriptor(_class0.prototype, "pivotA"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "pivotB", [_dec42], Object.getOwnPropertyDescriptor(_class0.prototype, "pivotB"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "autoPivotB", [_dec43], Object.getOwnPropertyDescriptor(_class0.prototype, "autoPivotB"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "breakForce", [_dec44], Object.getOwnPropertyDescriptor(_class0.prototype, "breakForce"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "breakTorque", [_dec45], Object.getOwnPropertyDescriptor(_class0.prototype, "breakTorque"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "linearLimitSettings", [_dec46], Object.getOwnPropertyDescriptor(_class0.prototype, "linearLimitSettings"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "angularLimitSettings", [_dec47], Object.getOwnPropertyDescriptor(_class0.prototype, "angularLimitSettings"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "linearDriverSettings", [_dec48], Object.getOwnPropertyDescriptor(_class0.prototype, "linearDriverSettings"), _class0.prototype), _applyDecoratedDescriptor(_class0.prototype, "angularDriverSettings", [_dec49], Object.getOwnPropertyDescriptor(_class0.prototype, "angularDriverSettings"), _class0.prototype), _initializer34 = applyDecoratedInitializer(_class0.prototype, "_breakForce", [serializable], function () {
  return 1e8;
}), _initializer35 = applyDecoratedInitializer(_class0.prototype, "_breakTorque", [serializable], function () {
  return 1e8;
}), _initializer36 = applyDecoratedInitializer(_class0.prototype, "_linearLimitSettings", [serializable, _dec50], null), _initializer37 = applyDecoratedInitializer(_class0.prototype, "_angularLimitSettings", [serializable, _dec51], null), _initializer38 = applyDecoratedInitializer(_class0.prototype, "_linearDriverSettings", [serializable, _dec52], null), _initializer39 = applyDecoratedInitializer(_class0.prototype, "_angularDriverSettings", [serializable, _dec53], null), _initializer40 = applyDecoratedInitializer(_class0.prototype, "_pivotA", [serializable], function () {
  return new Vec3();
}), _initializer41 = applyDecoratedInitializer(_class0.prototype, "_pivotB", [serializable], function () {
  return new Vec3();
}), _initializer42 = applyDecoratedInitializer(_class0.prototype, "_autoPivotB", [serializable], function () {
  return false;
}), _initializer43 = applyDecoratedInitializer(_class0.prototype, "_axis", [serializable], function () {
  return new Vec3(0, 1, 0);
}), _initializer44 = applyDecoratedInitializer(_class0.prototype, "_secondaryAxis", [serializable], function () {
  return new Vec3(1, 0, 0);
}), _class0)) || _class9);

var _dec$3, _dec2$3, _dec3$3, _class$3, _class2$3, _initializer$3, _initializer2$3;
var PointToPointConstraint = (_dec$3 = ccclass('cc.PointToPointConstraint'), _dec2$3 = type(Vec3), _dec3$3 = type(Vec3), _dec$3(_class$3 = (_class2$3 = function (_Constraint) {
  function PointToPointConstraint() {
    var _this;
    _this = _Constraint.call(this, EConstraintType.POINT_TO_POINT) || this;
    _this._pivotA = _initializer$3 && _initializer$3();
    _this._pivotB = _initializer2$3 && _initializer2$3();
    return _this;
  }
  _inheritsLoose(PointToPointConstraint, _Constraint);
  return _createClass(PointToPointConstraint, [{
    key: "pivotA",
    get: function get() {
      return this._pivotA;
    },
    set: function set(v) {
      Vec3.copy(this._pivotA, v);
      {
        this.constraint.setPivotA(this._pivotA);
      }
    }
  }, {
    key: "pivotB",
    get: function get() {
      return this._pivotB;
    },
    set: function set(v) {
      Vec3.copy(this._pivotB, v);
      {
        this.constraint.setPivotB(this._pivotB);
      }
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._constraint;
    }
  }]);
}(Constraint), _applyDecoratedDescriptor(_class2$3.prototype, "pivotA", [_dec2$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "pivotA"), _class2$3.prototype), _applyDecoratedDescriptor(_class2$3.prototype, "pivotB", [_dec3$3], Object.getOwnPropertyDescriptor(_class2$3.prototype, "pivotB"), _class2$3.prototype), _initializer$3 = applyDecoratedInitializer(_class2$3.prototype, "_pivotA", [serializable], function () {
  return new Vec3();
}), _initializer2$3 = applyDecoratedInitializer(_class2$3.prototype, "_pivotB", [serializable], function () {
  return new Vec3();
}), _class2$3)) || _class$3);

var _dec$2, _dec2$2, _dec3$2, _dec4$2, _dec5$1, _dec6, _dec7, _class$2, _class2$2, _initializer$2, _initializer2$2, _initializer3$1, _initializer4, _initializer5, _initializer6;
var CharacterController = (_dec$2 = ccclass('cc.CharacterController'), _dec2$2 = type(PhysicsSystem.PhysicsGroup), _dec3$2 = type(CCFloat), _dec4$2 = type(CCFloat), _dec5$1 = type(CCFloat), _dec6 = type(CCFloat), _dec7 = type(Vec3), _dec$2(_class$2 = disallowMultiple(_class$2 = (_class2$2 = function (_Eventify) {
  function CharacterController(type) {
    var _this;
    _this = _Eventify.call(this) || this;
    _this.type = void 0;
    _this._cct = null;
    _this._group = _initializer$2 && _initializer$2();
    _this._minMoveDistance = _initializer2$2 && _initializer2$2();
    _this._stepOffset = _initializer3$1 && _initializer3$1();
    _this._slopeLimit = _initializer4 && _initializer4();
    _this._skinWidth = _initializer5 && _initializer5();
    _this._center = _initializer6 && _initializer6();
    _this._initialized = false;
    _this._prevPos = new Vec3();
    _this._currentPos = new Vec3();
    _this._velocity = new Vec3();
    _this._centerWorldPosition = new Vec3();
    _this._needCollisionEvent = false;
    _this._needTriggerEvent = false;
    _this.type = type;
    return _this;
  }
  _inheritsLoose(CharacterController, _Eventify);
  var _proto = CharacterController.prototype;
  _proto.onLoad = function onLoad() {
    if (!selector.runInEditor) return;
    this._cct = createCharacterController(this.type);
    this._initialized = this._cct.initialize(this);
    this._cct.onLoad();
  };
  _proto.onEnable = function onEnable() {
    if (this._cct) {
      this._cct.onEnable();
    }
  };
  _proto.onDisable = function onDisable() {
    if (this._cct) {
      this._cct.onDisable();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._cct) {
      this._needCollisionEvent = false;
      this._needTriggerEvent = false;
      this._cct.updateEventListener();
      this._cct.onDestroy();
      this._cct = null;
    }
  };
  _proto.move = function move(movement) {
    if (!this._isInitialized) {
      return;
    }
    this._prevPos.set(this.centerWorldPosition);
    var elapsedTime = PhysicsSystem.instance.fixedTimeStep;
    this._cct.move(movement, this._minMoveDistance, elapsedTime);
    this._currentPos.set(this.centerWorldPosition);
    this._velocity = this._currentPos.subtract(this._prevPos).multiplyScalar(1.0 / elapsedTime);
    this._cct.syncPhysicsToScene();
  };
  _proto.on = function on(type, callback, target, once) {
    var ret = _Eventify.prototype.on.call(this, type, callback, target, once);
    this._updateNeedEvent(type);
    return ret;
  };
  _proto.off = function off(type, callback, target) {
    _Eventify.prototype.off.call(this, type, callback, target);
    this._updateNeedEvent();
  };
  _proto.once = function once(type, callback, target) {
    var ret = _Eventify.prototype.once.call(this, type, callback, target);
    this._updateNeedEvent(type);
    return ret;
  };
  _proto.getGroup = function getGroup() {
    if (this._isInitialized) return this._cct.getGroup();
    return 0;
  };
  _proto.setGroup = function setGroup(v) {
    if (this._isInitialized) this._cct.setGroup(v);
  };
  _proto.addGroup = function addGroup(v) {
    if (this._isInitialized) this._cct.addGroup(v);
  };
  _proto.removeGroup = function removeGroup(v) {
    if (this._isInitialized) this._cct.removeGroup(v);
  };
  _proto.getMask = function getMask() {
    if (this._isInitialized) return this._cct.getMask();
    return 0;
  };
  _proto.setMask = function setMask(v) {
    if (this._isInitialized) this._cct.setMask(v);
  };
  _proto.addMask = function addMask(v) {
    if (this._isInitialized) this._cct.addMask(v);
  };
  _proto.removeMask = function removeMask(v) {
    if (this._isInitialized) this._cct.removeMask(v);
  };
  _proto._updateNeedEvent = function _updateNeedEvent(type) {
    if (this.isValid) {
      if (type !== undefined) {
        if (type === 'onControllerColliderHit') {
          this._needCollisionEvent = true;
        }
        if (type === 'onControllerTriggerEnter' || type === 'onControllerTriggerStay' || type === 'onControllerTriggerExit') {
          this._needTriggerEvent = true;
        }
      } else {
        if (!this.hasEventListener('onControllerColliderHit')) {
          this._needCollisionEvent = false;
        }
        if (!(this.hasEventListener('onControllerTriggerEnter') || this.hasEventListener('onControllerTriggerStay') || this.hasEventListener('onControllerTriggerExit'))) {
          this._needTriggerEvent = false;
        }
      }
      if (this._cct) this._cct.updateEventListener();
    }
  };
  return _createClass(CharacterController, [{
    key: "group",
    get: function get() {
      return this._group;
    },
    set: function set(v) {
      if (!Number.isInteger(Math.log2(v >>> 0))) {
        warn('[Physics]: The group should only have one bit.');
      }
      this._group = v;
      if (this._cct) {
        if (this._cct.getGroup() !== v) this._cct.setGroup(v);
      }
    }
  }, {
    key: "minMoveDistance",
    get: function get() {
      return this._minMoveDistance;
    },
    set: function set(value) {
      if (this._minMoveDistance === value) return;
      this._minMoveDistance = Math.abs(value);
    }
  }, {
    key: "stepOffset",
    get: function get() {
      return this._stepOffset;
    },
    set: function set(value) {
      if (this._stepOffset === value) return;
      this._stepOffset = Math.abs(value);
      if (this._cct) {
        this._cct.setStepOffset(value);
      }
    }
  }, {
    key: "slopeLimit",
    get: function get() {
      return this._slopeLimit;
    },
    set: function set(value) {
      if (this._slopeLimit === value) return;
      this._slopeLimit = Math.abs(value);
      if (this._cct) {
        this._cct.setSlopeLimit(value);
      }
    }
  }, {
    key: "skinWidth",
    get: function get() {
      return this._skinWidth;
    },
    set: function set(value) {
      if (this._skinWidth === value) return;
      this._skinWidth = Math.abs(value);
      if (this._cct) {
        this._cct.setContactOffset(Math.max(0.0001, value));
      }
    }
  }, {
    key: "center",
    get: function get() {
      return this._center;
    },
    set: function set(value) {
      if (Vec3.equals(this._center, value)) return;
      Vec3.copy(this._center, value);
    }
  }, {
    key: "_isInitialized",
    get: function get() {
      if (this._cct === null || !this._initialized) {
        return false;
      } else {
        return true;
      }
    }
  }, {
    key: "centerWorldPosition",
    get: function get() {
      if (this._isInitialized) this._cct.getPosition(this._centerWorldPosition);
      return this._centerWorldPosition;
    },
    set: function set(value) {
      if (this._isInitialized) this._cct.setPosition(value);
    }
  }, {
    key: "velocity",
    get: function get() {
      return this._velocity;
    }
  }, {
    key: "isGrounded",
    get: function get() {
      return this._cct.onGround();
    }
  }, {
    key: "needCollisionEvent",
    get: function get() {
      return this._needCollisionEvent;
    }
  }, {
    key: "needTriggerEvent",
    get: function get() {
      return this._needTriggerEvent;
    }
  }]);
}(Eventify(Component)), _applyDecoratedDescriptor(_class2$2.prototype, "group", [_dec2$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "group"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "minMoveDistance", [_dec3$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "minMoveDistance"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "stepOffset", [_dec4$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "stepOffset"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "slopeLimit", [_dec5$1], Object.getOwnPropertyDescriptor(_class2$2.prototype, "slopeLimit"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "skinWidth", [_dec6], Object.getOwnPropertyDescriptor(_class2$2.prototype, "skinWidth"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "center", [_dec7], Object.getOwnPropertyDescriptor(_class2$2.prototype, "center"), _class2$2.prototype), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_group", [serializable], function () {
  return PhysicsSystem.PhysicsGroup.DEFAULT;
}), _initializer2$2 = applyDecoratedInitializer(_class2$2.prototype, "_minMoveDistance", [serializable], function () {
  return 0.001;
}), _initializer3$1 = applyDecoratedInitializer(_class2$2.prototype, "_stepOffset", [serializable], function () {
  return 0.5;
}), _initializer4 = applyDecoratedInitializer(_class2$2.prototype, "_slopeLimit", [serializable], function () {
  return 45.0;
}), _initializer5 = applyDecoratedInitializer(_class2$2.prototype, "_skinWidth", [serializable], function () {
  return 0.01;
}), _initializer6 = applyDecoratedInitializer(_class2$2.prototype, "_center", [serializable], function () {
  return new Vec3();
}), _class2$2)) || _class$2) || _class$2);

var _dec$1, _dec2$1, _dec3$1, _dec4$1, _dec5, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3;
new Vec3(0, 0, 0);
var BoxCharacterController = (_dec$1 = ccclass('cc.BoxCharacterController'), _dec2$1 = executionOrder(-1), _dec3$1 = type(CCFloat), _dec4$1 = type(CCFloat), _dec5 = type(CCFloat), _dec$1(_class$1 = _dec2$1(_class$1 = (_class2$1 = function (_CharacterController) {
  function BoxCharacterController() {
    var _this;
    _this = _CharacterController.call(this, ECharacterControllerType.BOX) || this;
    _this._halfHeight = _initializer$1 && _initializer$1();
    _this._halfSideExtent = _initializer2$1 && _initializer2$1();
    _this._halfForwardExtent = _initializer3 && _initializer3();
    return _this;
  }
  _inheritsLoose(BoxCharacterController, _CharacterController);
  return _createClass(BoxCharacterController, [{
    key: "halfHeight",
    get: function get() {
      return this._halfHeight;
    },
    set: function set(value) {
      if (this._halfHeight === value) return;
      this._halfHeight = Math.abs(value);
      if (this._cct) {
        this._cct.setHalfHeight(value);
      }
    }
  }, {
    key: "halfSideExtent",
    get: function get() {
      return this._halfSideExtent;
    },
    set: function set(value) {
      if (this._halfSideExtent === value) return;
      this._halfSideExtent = Math.abs(value);
      if (this._cct) {
        this._cct.setHalfSideExtent(value);
      }
    }
  }, {
    key: "halfForwardExtent",
    get: function get() {
      return this._halfForwardExtent;
    },
    set: function set(value) {
      if (this._halfForwardExtent === value) return;
      this._halfForwardExtent = Math.abs(value);
      if (this._cct) {
        this._cct.setHalfForwardExtent(value);
      }
    }
  }]);
}(CharacterController), _applyDecoratedDescriptor(_class2$1.prototype, "halfHeight", [_dec3$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "halfHeight"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "halfSideExtent", [_dec4$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "halfSideExtent"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "halfForwardExtent", [_dec5], Object.getOwnPropertyDescriptor(_class2$1.prototype, "halfForwardExtent"), _class2$1.prototype), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_halfHeight", [serializable], function () {
  return 0.5;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_halfSideExtent", [serializable], function () {
  return 0.5;
}), _initializer3 = applyDecoratedInitializer(_class2$1.prototype, "_halfForwardExtent", [serializable], function () {
  return 0.5;
}), _class2$1)) || _class$1) || _class$1);

var _dec, _dec2, _dec3, _dec4, _class, _class2, _initializer, _initializer2;
new Vec3(0, 0, 0);
var CapsuleCharacterController = (_dec = ccclass('cc.CapsuleCharacterController'), _dec2 = executionOrder(-1), _dec3 = type(CCFloat), _dec4 = type(CCFloat), _dec(_class = _dec2(_class = (_class2 = function (_CharacterController) {
  function CapsuleCharacterController() {
    var _this;
    _this = _CharacterController.call(this, ECharacterControllerType.CAPSULE) || this;
    _this._radius = _initializer && _initializer();
    _this._height = _initializer2 && _initializer2();
    return _this;
  }
  _inheritsLoose(CapsuleCharacterController, _CharacterController);
  return _createClass(CapsuleCharacterController, [{
    key: "radius",
    get: function get() {
      return this._radius;
    },
    set: function set(value) {
      if (this._radius === value) return;
      this._radius = Math.abs(value);
      if (this._cct) {
        this._cct.setRadius(value);
      }
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(value) {
      if (this._height === value) return;
      this._height = Math.abs(value);
      if (this._cct) {
        this._cct.setHeight(value);
      }
    }
  }]);
}(CharacterController), _applyDecoratedDescriptor(_class2.prototype, "radius", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "radius"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "height", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "height"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_radius", [serializable], function () {
  return 0.5;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_height", [serializable], function () {
  return 1.0;
}), _class2)) || _class) || _class);

var CharacterControllerContact = function CharacterControllerContact() {
  this.worldPosition = new Vec3();
  this.worldNormal = new Vec3();
  this.motionDirection = new Vec3();
  this.motionLength = 0;
};

cclegacy.PhysicsSystem = PhysicsSystem;
cclegacy.PhysicsMaterial = PhysicsMaterial;
cclegacy.PhysicsRayResult = PhysicsRayResult;
cclegacy.ConstantForce = ConstantForce;

var physics = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BoxCharacterController: BoxCharacterController,
    BoxCollider: BoxCollider,
    CapsuleCharacterController: CapsuleCharacterController,
    CapsuleCollider: CapsuleCollider,
    CharacterController: CharacterController,
    CharacterControllerContact: CharacterControllerContact,
    get Collider () { return Collider; },
    ConeCollider: ConeCollider,
    ConfigurableConstraint: ConfigurableConstraint,
    ConstantForce: ConstantForce,
    get Constraint () { return Constraint; },
    CylinderCollider: CylinderCollider,
    get EAxisDirection () { return EAxisDirection; },
    get ECharacterControllerType () { return ECharacterControllerType; },
    get EColliderType () { return EColliderType; },
    get EConstraintMode () { return EConstraintMode; },
    get EConstraintType () { return EConstraintType; },
    get ED6Axis () { return ED6Axis; },
    get EDriverMode () { return EDriverMode; },
    get EPhysicsDrawFlags () { return EPhysicsDrawFlags; },
    get ERigidBodyType () { return ERigidBodyType; },
    get ESimplexType () { return ESimplexType; },
    FixedConstraint: FixedConstraint,
    HingeConstraint: HingeConstraint,
    MeshCollider: MeshCollider,
    get PhysicsGroup () { return PhysicsGroup; },
    PhysicsLineStripCastResult: PhysicsLineStripCastResult,
    PhysicsMaterial: PhysicsMaterial,
    PhysicsRayResult: PhysicsRayResult,
    PhysicsSystem: PhysicsSystem,
    PlaneCollider: PlaneCollider,
    PointToPointConstraint: PointToPointConstraint,
    get RigidBody () { return RigidBody; },
    get SimplexCollider () { return SimplexCollider; },
    SphereCollider: SphereCollider,
    TerrainCollider: TerrainCollider,
    selector: selector,
    utils: util
});

export { BoxCollider as B, Collider as C, FixedConstraint as F, HingeConstraint as H, MeshCollider as M, PhysicsSystem as P, RigidBody as R, SphereCollider as S, TerrainCollider as T, Constraint as a, CapsuleCollider as b, CylinderCollider as c, PhysicsMaterial as d, CharacterController as e, ConstantForce as f, PhysicsRayResult as g, PhysicsLineStripCastResult as h, ConeCollider as i, SimplexCollider as j, PlaneCollider as k, ConfigurableConstraint as l, PointToPointConstraint as m, CapsuleCharacterController as n, BoxCharacterController as o, physics as p, CharacterControllerContact as q, selector as s };
//# sourceMappingURL=index-UDeHavOr.js.map
