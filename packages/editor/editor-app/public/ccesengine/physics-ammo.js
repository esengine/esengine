import './_virtual_internal_constants-DWlew7Dp.js';
import { g as game, G as Game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import { P as PhysicsSystem, q as CharacterControllerContact, s as selector } from './index-UDeHavOr.js';
import { L as log, Q as error, a as _createClass, M as fastRemoveAt, _ as _inheritsLoose, e as warn, aC as degreesToRadians } from './gc-object-CShF5lzx.js';
import { n as sys, f as Vec3, Q as Quat, M as Mat4, C as Color, al as absMaxComponent, am as absMax, h as toRadian } from './index-uXI1_UMk.js';
import './device-manager-CBXP-ttm.js';
import { y as PrimitiveMode } from './buffer-barrier-BlQXg9Aa.js';
import { e as ensureWasmModuleReady, i as instantiateWasm } from './wasm-web-BpK36a26.js';
import './physics-framework.js';
import { T as TransformBit } from './scene-vWcxM1_c.js';
import { P as PhysicsGroup, a as ERigidBodyType, b as EColliderType, c as EPhysicsDrawFlags, d as EConstraintMode, e as EDriverMode } from './collision-matrix-55yq71jP.js';
import { A as ArrayCollisionMatrix } from './array-collision-matrix-H0EInS5d.js';
import { T as TupleDictionary } from './tuple-dictionary-BCDCuDb1.js';
import { V as VEC3_0, a as absolute } from './util-Cxn5lV0H.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './node-event-Ccvtv8bJ.js';
import './debug-view-BuNhRPv_.js';
import './global-exports-DnCP_14L.js';
import './deprecated-n0w4kK7g.js';
import './mesh-XWfHgs1t.js';
import './zlib.min-3VC1ush6.js';
import './skeleton-CBhmWmEt.js';
import './terrain-asset-BMvu7XYU.js';
import './base.js';
import './deprecated-CN-RjLP6.js';
import './render-types-D3qsZZI9.js';
import './deprecated-CzzdLkmW.js';
import './camera-component-BFt9vSC_.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './instantiate-DAIJ1YBG.js';
import './touch-BKrZ-fxl.js';
import './move-DnXMCCeG.js';
import './capsule-9D-8tsOp.js';

var EBulletType;
(function (EBulletType) {
  EBulletType[EBulletType["EBulletTypeVec3"] = 0] = "EBulletTypeVec3";
  EBulletType[EBulletType["EBulletTypeQuat"] = 1] = "EBulletTypeQuat";
  EBulletType[EBulletType["EBulletTypeTransform"] = 2] = "EBulletTypeTransform";
  EBulletType[EBulletType["EBulletTypeMotionState"] = 3] = "EBulletTypeMotionState";
  EBulletType[EBulletType["EBulletTypeCollisionObject"] = 4] = "EBulletTypeCollisionObject";
  EBulletType[EBulletType["EBulletTypeCollisionShape"] = 5] = "EBulletTypeCollisionShape";
  EBulletType[EBulletType["EBulletTypeCharacterController"] = 6] = "EBulletTypeCharacterController";
  EBulletType[EBulletType["EBulletTypeStridingMeshInterface"] = 7] = "EBulletTypeStridingMeshInterface";
  EBulletType[EBulletType["EBulletTypeTriangleMesh"] = 8] = "EBulletTypeTriangleMesh";
  EBulletType[EBulletType["EBulletTypeCollisionDispatcher"] = 9] = "EBulletTypeCollisionDispatcher";
  EBulletType[EBulletType["EBulletTypeDbvtBroadPhase"] = 10] = "EBulletTypeDbvtBroadPhase";
  EBulletType[EBulletType["EBulletTypeSequentialImpulseConstraintSolver"] = 11] = "EBulletTypeSequentialImpulseConstraintSolver";
  EBulletType[EBulletType["EBulletTypeCollisionWorld"] = 12] = "EBulletTypeCollisionWorld";
  EBulletType[EBulletType["EBulletTypeTypedConstraint"] = 13] = "EBulletTypeTypedConstraint";
  EBulletType[EBulletType["EBulletTypeDebugDraw"] = 14] = "EBulletTypeDebugDraw";
})(EBulletType || (EBulletType = {}));
var EBulletTriangleRaycastFlag;
(function (EBulletTriangleRaycastFlag) {
  EBulletTriangleRaycastFlag[EBulletTriangleRaycastFlag["NONE"] = 0] = "NONE";
  EBulletTriangleRaycastFlag[EBulletTriangleRaycastFlag["FilterBackfaces"] = 1] = "FilterBackfaces";
  EBulletTriangleRaycastFlag[EBulletTriangleRaycastFlag["KeepUnflippedNormal"] = 2] = "KeepUnflippedNormal";
  EBulletTriangleRaycastFlag[EBulletTriangleRaycastFlag["UseSubSimplexConvexCastRaytest"] = 4] = "UseSubSimplexConvexCastRaytest";
  EBulletTriangleRaycastFlag[EBulletTriangleRaycastFlag["UseGjkConvexCastRaytest"] = 8] = "UseGjkConvexCastRaytest";
})(EBulletTriangleRaycastFlag || (EBulletTriangleRaycastFlag = {}));
var EBulletDebugDrawModes;
(function (EBulletDebugDrawModes) {
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_NoDebug"] = 0] = "DBG_NoDebug";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawWireframe"] = 1] = "DBG_DrawWireframe";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawAabb"] = 2] = "DBG_DrawAabb";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawFeaturesText"] = 4] = "DBG_DrawFeaturesText";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawContactPoints"] = 8] = "DBG_DrawContactPoints";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_NoDeactivation"] = 16] = "DBG_NoDeactivation";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_NoHelpText"] = 32] = "DBG_NoHelpText";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawText"] = 64] = "DBG_DrawText";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_ProfileTimings"] = 128] = "DBG_ProfileTimings";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_EnableSatComparison"] = 256] = "DBG_EnableSatComparison";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DisableBulletLCP"] = 512] = "DBG_DisableBulletLCP";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_EnableCCD"] = 1024] = "DBG_EnableCCD";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawConstraints"] = 2048] = "DBG_DrawConstraints";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawConstraintLimits"] = 4096] = "DBG_DrawConstraintLimits";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_FastWireframe"] = 8192] = "DBG_FastWireframe";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawNormals"] = 16384] = "DBG_DrawNormals";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_DrawFrames"] = 32768] = "DBG_DrawFrames";
  EBulletDebugDrawModes[EBulletDebugDrawModes["DBG_MAX_DEBUG_DRAW_MODE"] = 32769] = "DBG_MAX_DEBUG_DRAW_MODE";
})(EBulletDebugDrawModes || (EBulletDebugDrawModes = {}));
var bt = {};
var btCache = {};
btCache.BODY_CACHE_NAME = 'body';
btCache.CCT_CACHE_NAME = 'cct';
function initWASM(wasmFactory, wasmUrl) {
  return new Promise(function (resolve, reject) {
    var errorMessage = function errorMessage(err) {
      return "[bullet]: bullet wasm lib load failed: " + err;
    };
    wasmFactory({
      instantiateWasm: function instantiateWasm$1(importObject, receiveInstance) {
        instantiateWasm(wasmUrl, importObject).then(function (result) {
          receiveInstance(result.instance, result.module);
        })["catch"](function (err) {
          return reject(errorMessage(err));
        });
      }
    }).then(function (instance) {
      log('[bullet]:bullet wasm lib loaded.');
      bt = instance;
      globalThis.Bullet = bt;
    }).then(resolve)["catch"](function (err) {
      return reject(errorMessage(err));
    });
  });
}
function initASM(asmFactory) {
  if (asmFactory != null) {
    return asmFactory().then(function (instance) {
      log('[bullet]:bullet asm lib loaded.');
      bt = instance;
    });
  } else {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  }
}
function shouldUseWasmModule() {
  {
    return sys.hasFeature(sys.Feature.WASM);
  }
}
function waitForAmmoInstantiation() {
  var errorReport = function errorReport(msg) {
    error(msg);
  };
  return ensureWasmModuleReady().then(function () {
    if (shouldUseWasmModule()) {
      return Promise.all([import('./bullet.release.wasm-BgxtR7N1.js').then(function (n) { return n.b; }), import('./bullet.release.wasm-B1GX7R-w.js')]).then(function (_ref) {
        var bulletWasmFactory = _ref[0]["default"],
          bulletWasmUrl = _ref[1]["default"];
        return initWASM(bulletWasmFactory, bulletWasmUrl);
      });
    } else {
      return import('./bullet.release.asm-CeeSwVeR.js').then(function (n) { return n.b; }).then(function (_ref2) {
        var bulletAsmFactory = _ref2["default"];
        return initASM(bulletAsmFactory);
      });
    }
  })["catch"](errorReport);
}
{
  game.onPostInfrastructureInitDelegate.add(waitForAmmoInstantiation);
}

var TriggerEventObject = {
  type: 'onTriggerEnter',
  selfCollider: null,
  otherCollider: null,
  impl: null
};
var CollisionEventObject = {
  type: 'onCollisionEnter',
  selfCollider: null,
  otherCollider: null,
  contacts: [],
  impl: null
};
var CharacterTriggerEventObject = {
  type: 'onControllerTriggerEnter',
  collider: null,
  characterController: null,
  impl: null
};
var BulletCache = function () {
  function BulletCache() {
    this.BT_TRANSFORM_0 = bt.Transform_new();
    this.BT_TRANSFORM_1 = bt.Transform_new();
    this.BT_V3_0 = bt.Vec3_new(0, 0, 0);
    this.BT_V3_1 = bt.Vec3_new(0, 0, 0);
    this.BT_V3_2 = bt.Vec3_new(0, 0, 0);
    this.BT_QUAT_0 = bt.Quat_new(0, 0, 0, 1);
  }
  BulletCache.setWrapper = function setWrapper(impl, type, wrap) {
    if (!this.ROOT[type]) this.ROOT[type] = {};
    this.ROOT[type][impl] = wrap;
  };
  BulletCache.delWrapper = function delWrapper(impl, type) {
    delete this.ROOT[type][impl];
  };
  BulletCache.getWrapper = function getWrapper(ptr, type) {
    return this.ROOT[type][ptr];
  };
  BulletCache.isNotEmptyShape = function isNotEmptyShape(ptr) {
    return ptr !== bt.EmptyShape_static();
  };
  return _createClass(BulletCache, null, [{
    key: "instance",
    get: function get() {
      if (BulletCache._instance == null) BulletCache._instance = new BulletCache();
      return BulletCache._instance;
    }
  }]);
}();
BulletCache._instance = void 0;
BulletCache.ROOT = {};
BulletCache.world = null;
var CC_V3_0 = new Vec3();
var CC_V3_1 = new Vec3();
var CC_V3_2 = new Vec3();
var CC_QUAT_0 = new Quat();
var CC_QUAT_1 = new Quat();
var CC_MAT4_0 = new Mat4();
new Mat4();
var CC_COLOR_0 = new Color();
btCache.CACHE = BulletCache;

function cocos2BulletVec3(out, v) {
  bt.Vec3_set(out, v.x, v.y, v.z);
  return out;
}
function bullet2CocosVec3(out, v) {
  var rawVertexBuffer = bt.HEAPF32.subarray(v / 4, v / 4 + 3);
  out.x = rawVertexBuffer[0];
  out.y = rawVertexBuffer[1];
  out.z = rawVertexBuffer[2];
  return out;
}
function cocos2BulletQuat(out, q) {
  bt.Quat_set(out, q.x, q.y, q.z, q.w);
  return out;
}
function bullet2CocosQuat(out, q) {
  var rawVertexBuffer = bt.HEAPF32.subarray(q / 4, q / 4 + 4);
  out.x = rawVertexBuffer[0];
  out.y = rawVertexBuffer[1];
  out.z = rawVertexBuffer[2];
  out.w = rawVertexBuffer[3];
  return out;
}
function cocos2BulletTriMesh(out, mesh) {
  var len = mesh.renderingSubMeshes.length;
  for (var i = 0; i < len; i++) {
    var subMesh = mesh.renderingSubMeshes[i];
    var geoInfo = subMesh.geometricInfo;
    if (geoInfo) {
      var primitiveMode = subMesh.primitiveMode;
      var vb = geoInfo.positions;
      var ib = geoInfo.indices;
      var v0 = BulletCache.instance.BT_V3_0;
      var v1 = BulletCache.instance.BT_V3_1;
      var v2 = BulletCache.instance.BT_V3_2;
      if (primitiveMode === PrimitiveMode.TRIANGLE_LIST) {
        var cnt = ib.length;
        for (var j = 0; j < cnt; j += 3) {
          var i0 = ib[j] * 3;
          var i1 = ib[j + 1] * 3;
          var i2 = ib[j + 2] * 3;
          bt.Vec3_set(v0, vb[i0], vb[i0 + 1], vb[i0 + 2]);
          bt.Vec3_set(v1, vb[i1], vb[i1 + 1], vb[i1 + 2]);
          bt.Vec3_set(v2, vb[i2], vb[i2 + 1], vb[i2 + 2]);
          bt.TriangleMesh_addTriangle(out, v0, v1, v2, false);
        }
      } else if (primitiveMode === PrimitiveMode.TRIANGLE_STRIP) {
        var _cnt = ib.length - 2;
        var rev = 0;
        for (var _j = 0; _j < _cnt; _j += 1) {
          var _i = ib[_j - rev] * 3;
          var _i2 = ib[_j + rev + 1] * 3;
          var _i3 = ib[_j + 2] * 3;
          rev = ~rev;
          bt.Vec3_set(v0, vb[_i], vb[_i + 1], vb[_i + 2]);
          bt.Vec3_set(v1, vb[_i2], vb[_i2 + 1], vb[_i2 + 2]);
          bt.Vec3_set(v2, vb[_i3], vb[_i3 + 1], vb[_i3 + 2]);
          bt.TriangleMesh_addTriangle(out, v0, v1, v2, false);
        }
      } else if (primitiveMode === PrimitiveMode.TRIANGLE_FAN) {
        var _cnt2 = ib.length - 1;
        var _i4 = ib[0] * 3;
        bt.Vec3_set(v0, vb[_i4], vb[_i4 + 1], vb[_i4 + 2]);
        for (var _j2 = 1; _j2 < _cnt2; _j2 += 1) {
          var _i5 = ib[_j2] * 3;
          var _i6 = ib[_j2 + 1] * 3;
          bt.Vec3_set(v1, vb[_i5], vb[_i5 + 1], vb[_i5 + 2]);
          bt.Vec3_set(v2, vb[_i6], vb[_i6 + 1], vb[_i6 + 2]);
          bt.TriangleMesh_addTriangle(out, v0, v1, v2, false);
        }
      }
    }
  }
  return out;
}
function force2Impulse(force, dt) {
  return force * dt;
}

var EBtSharedBodyDirty;
(function (EBtSharedBodyDirty) {
  EBtSharedBodyDirty[EBtSharedBodyDirty["NONE"] = 0] = "NONE";
  EBtSharedBodyDirty[EBtSharedBodyDirty["BODY_RE_ADD"] = 1] = "BODY_RE_ADD";
  EBtSharedBodyDirty[EBtSharedBodyDirty["GHOST_RE_ADD"] = 2] = "GHOST_RE_ADD";
})(EBtSharedBodyDirty || (EBtSharedBodyDirty = {}));
var btCollisionFlags;
(function (btCollisionFlags) {
  btCollisionFlags[btCollisionFlags["CF_STATIC_OBJECT"] = 1] = "CF_STATIC_OBJECT";
  btCollisionFlags[btCollisionFlags["CF_KINEMATIC_OBJECT"] = 2] = "CF_KINEMATIC_OBJECT";
  btCollisionFlags[btCollisionFlags["CF_NO_CONTACT_RESPONSE"] = 4] = "CF_NO_CONTACT_RESPONSE";
  btCollisionFlags[btCollisionFlags["CF_CUSTOM_MATERIAL_CALLBACK"] = 8] = "CF_CUSTOM_MATERIAL_CALLBACK";
  btCollisionFlags[btCollisionFlags["CF_CHARACTER_OBJECT"] = 16] = "CF_CHARACTER_OBJECT";
  btCollisionFlags[btCollisionFlags["CF_DISABLE_VISUALIZE_OBJECT"] = 32] = "CF_DISABLE_VISUALIZE_OBJECT";
  btCollisionFlags[btCollisionFlags["CF_DISABLE_SPU_COLLISION_PROCESSING"] = 64] = "CF_DISABLE_SPU_COLLISION_PROCESSING";
})(btCollisionFlags || (btCollisionFlags = {}));
var btCollisionObjectTypes;
(function (btCollisionObjectTypes) {
  btCollisionObjectTypes[btCollisionObjectTypes["CO_COLLISION_OBJECT"] = 1] = "CO_COLLISION_OBJECT";
  btCollisionObjectTypes[btCollisionObjectTypes["CO_RIGID_BODY"] = 2] = "CO_RIGID_BODY";
  btCollisionObjectTypes[btCollisionObjectTypes["CO_GHOST_OBJECT"] = 4] = "CO_GHOST_OBJECT";
  btCollisionObjectTypes[btCollisionObjectTypes["CO_SOFT_BODY"] = 8] = "CO_SOFT_BODY";
  btCollisionObjectTypes[btCollisionObjectTypes["CO_HF_FLUID"] = 16] = "CO_HF_FLUID";
  btCollisionObjectTypes[btCollisionObjectTypes["CO_USER_TYPE"] = 32] = "CO_USER_TYPE";
  btCollisionObjectTypes[btCollisionObjectTypes["CO_FEATHERSTONE_LINK"] = 64] = "CO_FEATHERSTONE_LINK";
})(btCollisionObjectTypes || (btCollisionObjectTypes = {}));
var btCollisionObjectStates;
(function (btCollisionObjectStates) {
  btCollisionObjectStates[btCollisionObjectStates["ACTIVE_TAG"] = 1] = "ACTIVE_TAG";
  btCollisionObjectStates[btCollisionObjectStates["ISLAND_SLEEPING"] = 2] = "ISLAND_SLEEPING";
  btCollisionObjectStates[btCollisionObjectStates["WANTS_DEACTIVATION"] = 3] = "WANTS_DEACTIVATION";
  btCollisionObjectStates[btCollisionObjectStates["DISABLE_DEACTIVATION"] = 4] = "DISABLE_DEACTIVATION";
  btCollisionObjectStates[btCollisionObjectStates["DISABLE_SIMULATION"] = 5] = "DISABLE_SIMULATION";
})(btCollisionObjectStates || (btCollisionObjectStates = {}));
var btRigidBodyFlags;
(function (btRigidBodyFlags) {
  btRigidBodyFlags[btRigidBodyFlags["BT_DISABLE_WORLD_GRAVITY"] = 1] = "BT_DISABLE_WORLD_GRAVITY";
  btRigidBodyFlags[btRigidBodyFlags["BT_ENABLE_GYROPSCOPIC_FORCE"] = 2] = "BT_ENABLE_GYROPSCOPIC_FORCE";
})(btRigidBodyFlags || (btRigidBodyFlags = {}));

var v3_0$6 = CC_V3_0;
var v3_1$2 = CC_V3_1;
var BulletRigidBody = function () {
  function BulletRigidBody() {
    this.id = void 0;
    this._isEnabled = false;
    this._isUsingCCD = false;
    this._sharedBody = void 0;
    this._rigidBody = void 0;
    this.id = BulletRigidBody.idCounter++;
  }
  var _proto = BulletRigidBody.prototype;
  _proto.setMass = function setMass(value) {
    if (!this._rigidBody.isDynamic) return;
    bt.RigidBody_setMass(this.impl, value);
    this._wakeUpIfSleep();
    this._sharedBody.dirty |= EBtSharedBodyDirty.BODY_RE_ADD;
  };
  _proto.setType = function setType(v) {
    this._sharedBody.setType(v);
  };
  _proto.setLinearDamping = function setLinearDamping(value) {
    bt.RigidBody_setDamping(this.impl, this._rigidBody.linearDamping, this._rigidBody.angularDamping);
  };
  _proto.setAngularDamping = function setAngularDamping(value) {
    bt.RigidBody_setDamping(this.impl, this._rigidBody.linearDamping, this._rigidBody.angularDamping);
  };
  _proto.useGravity = function useGravity(value) {
    if (!this._rigidBody.isDynamic) return;
    var m_rigidBodyFlag = bt.RigidBody_getFlags(this.impl);
    if (value) {
      m_rigidBodyFlag &= ~btRigidBodyFlags.BT_DISABLE_WORLD_GRAVITY;
    } else {
      bt.RigidBody_setGravity(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, Vec3.ZERO));
      m_rigidBodyFlag |= btRigidBodyFlags.BT_DISABLE_WORLD_GRAVITY;
    }
    bt.RigidBody_setFlags(this.impl, m_rigidBodyFlag);
    this._wakeUpIfSleep();
    this._sharedBody.dirty |= EBtSharedBodyDirty.BODY_RE_ADD;
  };
  _proto.useCCD = function useCCD(value) {
    bt.CollisionObject_setCcdMotionThreshold(this.impl, value ? 0.01 : 0);
    bt.CollisionObject_setCcdSweptSphereRadius(this.impl, value ? 0.1 : 0);
    this._isUsingCCD = value;
  };
  _proto.isUsingCCD = function isUsingCCD() {
    return this._isUsingCCD;
  };
  _proto.setLinearFactor = function setLinearFactor(v) {
    bt.RigidBody_setLinearFactor(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, v));
    this._wakeUpIfSleep();
  };
  _proto.setAngularFactor = function setAngularFactor(v) {
    bt.RigidBody_setAngularFactor(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, v));
    this._wakeUpIfSleep();
  };
  _proto.setAllowSleep = function setAllowSleep(v) {
    if (!this._rigidBody.isDynamic) return;
    if (v) {
      bt.CollisionObject_forceActivationState(this.impl, btCollisionObjectStates.ACTIVE_TAG);
    } else {
      bt.CollisionObject_forceActivationState(this.impl, btCollisionObjectStates.DISABLE_DEACTIVATION);
    }
    this._wakeUpIfSleep();
  };
  _proto.clearState = function clearState() {
    bt.RigidBody_clearState(this.impl);
  };
  _proto.clearVelocity = function clearVelocity() {
    this.setLinearVelocity(Vec3.ZERO);
    this.setAngularVelocity(Vec3.ZERO);
  };
  _proto.clearForces = function clearForces() {
    bt.RigidBody_clearForces(this.impl);
  };
  _proto.initialize = function initialize(com) {
    this._rigidBody = com;
    this._sharedBody = PhysicsSystem.instance.physicsWorld.getSharedBody(this._rigidBody.node, this);
    this._sharedBody.reference = true;
  };
  _proto.onEnable = function onEnable() {
    this._isEnabled = true;
    this.setMass(this._rigidBody.mass);
    this.setAllowSleep(this._rigidBody.allowSleep);
    this.setLinearDamping(this._rigidBody.linearDamping);
    this.setAngularDamping(this._rigidBody.angularDamping);
    this.setLinearFactor(this._rigidBody.linearFactor);
    this.setAngularFactor(this._rigidBody.angularFactor);
    this.useGravity(this._rigidBody.useGravity);
    this._sharedBody.bodyEnabled = true;
  };
  _proto.onDisable = function onDisable() {
    this._isEnabled = false;
    this._sharedBody.bodyEnabled = false;
  };
  _proto.onDestroy = function onDestroy() {
    this._sharedBody.reference = false;
    this._rigidBody = null;
    this._sharedBody = null;
  };
  _proto.wakeUp = function wakeUp(force) {
    if (force === void 0) {
      force = true;
    }
    bt.CollisionObject_activate(this.impl, force);
  };
  _proto.sleep = function sleep() {
    var state = bt.CollisionObject_getActivationState(this.impl);
    if (state !== btCollisionObjectStates.DISABLE_DEACTIVATION && state !== btCollisionObjectStates.DISABLE_SIMULATION) {
      bt.CollisionObject_forceActivationState(this.impl, btCollisionObjectStates.ISLAND_SLEEPING);
    }
  };
  _proto.setSleepThreshold = function setSleepThreshold(v) {
    this._wakeUpIfSleep();
    bt.RigidBody_setSleepingThresholds(this.impl, v, v);
  };
  _proto.getSleepThreshold = function getSleepThreshold() {
    return bt.RigidBody_getLinearSleepingThreshold(this.impl);
  };
  _proto.getLinearVelocity = function getLinearVelocity(out) {
    return bullet2CocosVec3(out, bt.RigidBody_getLinearVelocity(this.impl));
  };
  _proto.setLinearVelocity = function setLinearVelocity(value) {
    this._wakeUpIfSleep();
    cocos2BulletVec3(bt.RigidBody_getLinearVelocity(this.impl), value);
  };
  _proto.getAngularVelocity = function getAngularVelocity(out) {
    return bullet2CocosVec3(out, bt.RigidBody_getAngularVelocity(this.impl));
  };
  _proto.setAngularVelocity = function setAngularVelocity(value) {
    this._wakeUpIfSleep();
    cocos2BulletVec3(bt.RigidBody_getAngularVelocity(this.impl), value);
  };
  _proto.applyLocalForce = function applyLocalForce(force, rel_pos) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    var quat = this._sharedBody.node.worldRotation;
    var v = Vec3.transformQuat(v3_0$6, force, quat);
    var rp = rel_pos ? Vec3.transformQuat(v3_1$2, rel_pos, quat) : Vec3.ZERO;
    bt.RigidBody_applyForce(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, v), cocos2BulletVec3(BulletCache.instance.BT_V3_1, rp));
  };
  _proto.applyLocalTorque = function applyLocalTorque(torque) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    Vec3.transformQuat(v3_0$6, torque, this._sharedBody.node.worldRotation);
    bt.RigidBody_applyTorque(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, v3_0$6));
  };
  _proto.applyLocalImpulse = function applyLocalImpulse(impulse, rel_pos) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    var quat = this._sharedBody.node.worldRotation;
    var v = Vec3.transformQuat(v3_0$6, impulse, quat);
    var rp = rel_pos ? Vec3.transformQuat(v3_1$2, rel_pos, quat) : Vec3.ZERO;
    bt.RigidBody_applyImpulse(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, v), cocos2BulletVec3(BulletCache.instance.BT_V3_1, rp));
  };
  _proto.applyForce = function applyForce(force, rel_pos) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    var rp = rel_pos || Vec3.ZERO;
    bt.RigidBody_applyForce(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, force), cocos2BulletVec3(BulletCache.instance.BT_V3_1, rp));
  };
  _proto.applyTorque = function applyTorque(torque) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    bt.RigidBody_applyTorque(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, torque));
  };
  _proto.applyImpulse = function applyImpulse(impulse, rel_pos) {
    this._sharedBody.syncSceneToPhysics();
    this._wakeUpIfSleep();
    var rp = rel_pos || Vec3.ZERO;
    bt.RigidBody_applyImpulse(this.impl, cocos2BulletVec3(BulletCache.instance.BT_V3_0, impulse), cocos2BulletVec3(BulletCache.instance.BT_V3_1, rp));
  };
  _proto.getGroup = function getGroup() {
    return this._sharedBody.collisionFilterGroup;
  };
  _proto.setGroup = function setGroup(v) {
    this._sharedBody.collisionFilterGroup = v;
  };
  _proto.addGroup = function addGroup(v) {
    this._sharedBody.collisionFilterGroup |= v;
  };
  _proto.removeGroup = function removeGroup(v) {
    this._sharedBody.collisionFilterGroup &= ~v;
  };
  _proto.getMask = function getMask() {
    return this._sharedBody.collisionFilterMask;
  };
  _proto.setMask = function setMask(v) {
    this._sharedBody.collisionFilterMask = v;
  };
  _proto.addMask = function addMask(v) {
    this._sharedBody.collisionFilterMask |= v;
  };
  _proto.removeMask = function removeMask(v) {
    this._sharedBody.collisionFilterMask &= ~v;
  };
  _proto._wakeUpIfSleep = function _wakeUpIfSleep() {
    if (!this.isAwake) {
      bt.CollisionObject_activate(this.impl, true);
    }
  };
  return _createClass(BulletRigidBody, [{
    key: "isAwake",
    get: function get() {
      var state = bt.CollisionObject_getActivationState(this.impl);
      return state === btCollisionObjectStates.ACTIVE_TAG || state === btCollisionObjectStates.DISABLE_DEACTIVATION;
    }
  }, {
    key: "isSleepy",
    get: function get() {
      var state = bt.CollisionObject_getActivationState(this.impl);
      return state === btCollisionObjectStates.WANTS_DEACTIVATION;
    }
  }, {
    key: "isSleeping",
    get: function get() {
      var state = bt.CollisionObject_getActivationState(this.impl);
      return state === btCollisionObjectStates.ISLAND_SLEEPING;
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
BulletRigidBody.idCounter = 0;

var importFunc = {
  syncPhysicsToGraphics: function syncPhysicsToGraphics(id) {
    var body = btCache.CACHE.getWrapper(id, btCache.BODY_CACHE_NAME);
    body.syncPhysicsToGraphics();
  },
  onShapeHitExt: function onShapeHitExt(hit, controller) {
    var cct = btCache.CACHE.getWrapper(controller, btCache.CCT_CACHE_NAME);
    cct.onShapeHitExt(hit);
  },
  onDebugDrawLine: function onDebugDrawLine(from, to, color) {
    var world = btCache.CACHE.world;
    if (world) {
      world.onDebugDrawLine(from, to, color);
    }
  },
  clearLines: function clearLines() {
    var world = btCache.CACHE.world;
    if (world) {
      world.onClearLines();
    }
  },
  flushLines: function flushLines() {}
};

var v3_0$5 = CC_V3_0;
var quat_0 = CC_QUAT_0;
var IDCounter = 0;
var BulletSharedBody = function () {
  function BulletSharedBody(node, wrappedWorld) {
    this.id = void 0;
    this.node = void 0;
    this.wrappedWorld = void 0;
    this.wrappedJoints0 = [];
    this.wrappedJoints1 = [];
    this.dirty = 0;
    this._collisionFilterGroup = PhysicsSystem.PhysicsGroup.DEFAULT;
    this._collisionFilterMask = -1;
    this.ref = 0;
    this.bodyIndex = -1;
    this.ghostIndex = -1;
    this._bodyStruct = void 0;
    this._ghostStruct = void 0;
    this._wrappedBody = null;
    this.id = BulletSharedBody.idCounter++;
    this.wrappedWorld = wrappedWorld;
    this.node = node;
  }
  BulletSharedBody.getSharedBody = function getSharedBody(node, wrappedWorld, wrappedBody) {
    var key = node.uuid;
    var newSB;
    if (BulletSharedBody.sharedBodesMap.has(key)) {
      newSB = BulletSharedBody.sharedBodesMap.get(key);
    } else {
      newSB = new BulletSharedBody(node, wrappedWorld);
      var g = PhysicsGroup.DEFAULT;
      var m = PhysicsSystem.instance.collisionMatrix[g];
      newSB._collisionFilterGroup = g;
      newSB._collisionFilterMask = m;
      BulletSharedBody.sharedBodesMap.set(node.uuid, newSB);
    }
    if (wrappedBody) {
      newSB._wrappedBody = wrappedBody;
      var _g = wrappedBody.rigidBody.group;
      var _m = PhysicsSystem.instance.collisionMatrix[_g];
      newSB._collisionFilterGroup = _g;
      newSB._collisionFilterMask = _m;
    }
    return newSB;
  };
  var _proto = BulletSharedBody.prototype;
  _proto._instantiateBodyStruct = function _instantiateBodyStruct() {
    if (this._bodyStruct) return;
    var mass = 0;
    if (this._wrappedBody && this._wrappedBody.rigidBody.enabled && this._wrappedBody.rigidBody.isDynamic) {
      mass = this._wrappedBody.rigidBody.mass;
    }
    var trans = BulletCache.instance.BT_TRANSFORM_0;
    var quat = BulletCache.instance.BT_QUAT_0;
    cocos2BulletVec3(bt.Transform_getOrigin(trans), this.node.worldPosition);
    cocos2BulletQuat(quat, this.node.worldRotation);
    bt.Transform_setRotation(trans, quat);
    var motionState = bt.MotionState.implement(importFunc).$$.ptr;
    bt.ccMotionState_setup(motionState, this.id, trans);
    var body = bt.RigidBody_new(mass, motionState);
    var sleepTd = PhysicsSystem.instance.sleepThreshold;
    bt.RigidBody_setSleepingThresholds(body, sleepTd, sleepTd);
    this._bodyStruct = {
      id: IDCounter++,
      body: body,
      motionState: motionState,
      compound: bt.ccCompoundShape_new(),
      wrappedShapes: [],
      useCompound: false
    };
    BulletCache.setWrapper(this.id, btCache.BODY_CACHE_NAME, this);
    if (this._ghostStruct) bt.CollisionObject_setIgnoreCollisionCheck(this.ghost, this.body, true);
    if (this._wrappedBody) this.setBodyType(this._wrappedBody.rigidBody.type);
  };
  _proto._instantiateGhostStruct = function _instantiateGhostStruct() {
    if (this._ghostStruct) return;
    var ghost = bt.CollisionObject_new();
    var ghostShape = bt.ccCompoundShape_new();
    bt.CollisionObject_setCollisionShape(ghost, ghostShape);
    bt.CollisionObject_setCollisionFlags(ghost, btCollisionFlags.CF_STATIC_OBJECT | btCollisionFlags.CF_NO_CONTACT_RESPONSE);
    this._ghostStruct = {
      id: IDCounter++,
      ghost: ghost,
      compound: ghostShape,
      wrappedShapes: []
    };
    if (this._bodyStruct) bt.CollisionObject_setIgnoreCollisionCheck(this.body, this.ghost, true);
    if (this._wrappedBody) this.setGhostType(this._wrappedBody.rigidBody.type);
  };
  _proto.setType = function setType(v) {
    this.setBodyType(v);
    this.setGhostType(v);
  };
  _proto.setBodyType = function setBodyType(v) {
    if (this._bodyStruct && this._wrappedBody) {
      var body = this._bodyStruct.body;
      var wrap = this._wrappedBody;
      var com = wrap.rigidBody;
      var m_bcf = bt.CollisionObject_getCollisionFlags(body);
      var localInertia = BulletCache.instance.BT_V3_0;
      switch (v) {
        case ERigidBodyType.DYNAMIC:
          m_bcf &= ~btCollisionFlags.CF_KINEMATIC_OBJECT;
          m_bcf &= ~btCollisionFlags.CF_STATIC_OBJECT;
          bt.CollisionObject_setCollisionFlags(body, m_bcf);
          wrap.setMass(com.mass);
          wrap.useGravity(com.useGravity);
          wrap.setAllowSleep(com.allowSleep);
          break;
        case ERigidBodyType.KINEMATIC:
          bt.Vec3_set(localInertia, 0, 0, 0);
          bt.RigidBody_setMassProps(body, 0, localInertia);
          m_bcf |= btCollisionFlags.CF_KINEMATIC_OBJECT;
          m_bcf &= ~btCollisionFlags.CF_STATIC_OBJECT;
          bt.CollisionObject_setCollisionFlags(body, m_bcf);
          bt.CollisionObject_forceActivationState(body, btCollisionObjectStates.DISABLE_DEACTIVATION);
          break;
        case ERigidBodyType.STATIC:
        default:
          bt.Vec3_set(localInertia, 0, 0, 0);
          bt.RigidBody_setMassProps(body, 0, localInertia);
          m_bcf |= btCollisionFlags.CF_STATIC_OBJECT;
          m_bcf &= ~btCollisionFlags.CF_KINEMATIC_OBJECT;
          bt.CollisionObject_setCollisionFlags(body, m_bcf);
          bt.CollisionObject_forceActivationState(body, btCollisionObjectStates.ISLAND_SLEEPING);
          break;
      }
      this.dirty |= EBtSharedBodyDirty.BODY_RE_ADD;
    }
  };
  _proto.setGhostType = function setGhostType(v) {
    if (this._ghostStruct) {
      var ghost = this._ghostStruct.ghost;
      var m_gcf = bt.CollisionObject_getCollisionFlags(ghost);
      switch (v) {
        case ERigidBodyType.DYNAMIC:
        case ERigidBodyType.KINEMATIC:
          m_gcf &= ~btCollisionFlags.CF_STATIC_OBJECT;
          m_gcf |= btCollisionFlags.CF_KINEMATIC_OBJECT;
          bt.CollisionObject_setCollisionFlags(ghost, m_gcf);
          bt.CollisionObject_forceActivationState(ghost, btCollisionObjectStates.DISABLE_DEACTIVATION);
          break;
        case ERigidBodyType.STATIC:
        default:
          m_gcf &= ~btCollisionFlags.CF_KINEMATIC_OBJECT;
          m_gcf |= btCollisionFlags.CF_STATIC_OBJECT;
          bt.CollisionObject_setCollisionFlags(ghost, m_gcf);
          bt.CollisionObject_forceActivationState(ghost, btCollisionObjectStates.ISLAND_SLEEPING);
          break;
      }
      this.dirty |= EBtSharedBodyDirty.GHOST_RE_ADD;
    }
  };
  _proto.addShape = function addShape(v, isTrigger) {
    function switchShape(that, shape) {
      bt.CollisionObject_setCollisionShape(that.body, shape);
      that.dirty |= EBtSharedBodyDirty.BODY_RE_ADD;
      if (that._wrappedBody && that._wrappedBody.isEnabled) {
        that._wrappedBody.setMass(that._wrappedBody.rigidBody.mass);
      }
    }
    if (isTrigger) {
      var index = this.ghostStruct.wrappedShapes.indexOf(v);
      if (index < 0) {
        this.ghostStruct.wrappedShapes.push(v);
        v.setCompound(this.ghostCompoundShape);
        this.ghostEnabled = true;
      }
    } else {
      var _index = this.bodyStruct.wrappedShapes.indexOf(v);
      if (_index < 0) {
        this.bodyStruct.wrappedShapes.push(v);
        if (this.bodyStruct.useCompound) {
          v.setCompound(this.bodyCompoundShape);
        } else {
          var l = this.bodyStruct.wrappedShapes.length;
          if (l === 1 && !v.needCompound()) {
            switchShape(this, v.impl);
          } else {
            this.bodyStruct.useCompound = true;
            for (var i = 0; i < l; i++) {
              var childShape = this.bodyStruct.wrappedShapes[i];
              childShape.setCompound(this.bodyCompoundShape);
            }
            switchShape(this, this.bodyStruct.compound);
          }
        }
        this.bodyEnabled = true;
      }
    }
  };
  _proto.removeShape = function removeShape(v, isTrigger) {
    if (isTrigger) {
      var index = this.ghostStruct.wrappedShapes.indexOf(v);
      if (index >= 0) {
        fastRemoveAt(this.ghostStruct.wrappedShapes, index);
        v.setCompound(0);
        this.ghostEnabled = false;
      }
    } else {
      var _index2 = this.bodyStruct.wrappedShapes.indexOf(v);
      if (_index2 >= 0) {
        if (this.bodyStruct.useCompound) {
          v.setCompound(0);
        } else {
          bt.CollisionObject_setCollisionShape(this.body, bt.EmptyShape_static());
        }
        bt.CollisionObject_activate(this.body, true);
        this.dirty |= EBtSharedBodyDirty.BODY_RE_ADD;
        fastRemoveAt(this.bodyStruct.wrappedShapes, _index2);
        this.bodyEnabled = false;
      }
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
  _proto.updateDirty = function updateDirty() {
    if (this.dirty) {
      if (this.bodyIndex >= 0 && this.dirty & EBtSharedBodyDirty.BODY_RE_ADD) this.updateBodyByReAdd();
      if (this.ghostIndex >= 0 && this.dirty & EBtSharedBodyDirty.GHOST_RE_ADD) this.updateGhostByReAdd();
      this.dirty = 0;
    }
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    if (this.node.hasChangedFlags) {
      var bt_quat = BulletCache.instance.BT_QUAT_0;
      var bt_transform = bt.CollisionObject_getWorldTransform(this.body);
      cocos2BulletQuat(bt_quat, this.node.worldRotation);
      cocos2BulletVec3(bt.Transform_getOrigin(bt_transform), this.node.worldPosition);
      bt.Transform_setRotation(bt_transform, bt_quat);
      if (this.node.hasChangedFlags & TransformBit.SCALE) {
        this.syncBodyScale();
      }
      if (bt.CollisionObject_isKinematicObject(this.body)) {
        var ms = bt.RigidBody_getMotionState(this.body);
        if (ms) bt.MotionState_setWorldTransform(ms, bt_transform);
      } else if (this.isBodySleeping()) bt.CollisionObject_activate(this.body, false);
    }
  };
  _proto.syncPhysicsToScene = function syncPhysicsToScene() {
    if (bt.CollisionObject_isStaticOrKinematicObject(this.body)) return;
    this.syncPhysicsToGraphics();
  };
  _proto.syncPhysicsToGraphics = function syncPhysicsToGraphics() {
    if (this.isBodySleeping()) return;
    var bt_quat = BulletCache.instance.BT_QUAT_0;
    var bt_transform = BulletCache.instance.BT_TRANSFORM_0;
    bt.RigidBody_getWorldTransform(this.body, bt_transform);
    var originPosPtr = bt.Transform_getRotationAndOrigin(bt_transform, bt_quat);
    this.node.worldRotation = bullet2CocosQuat(quat_0, bt_quat);
    this.node.worldPosition = bullet2CocosVec3(v3_0$5, originPosPtr);
    if (this._ghostStruct) {
      var bt_transform1 = bt.CollisionObject_getWorldTransform(this.ghost);
      cocos2BulletVec3(bt.Transform_getOrigin(bt_transform1), this.node.worldPosition);
      cocos2BulletQuat(bt_quat, this.node.worldRotation);
      bt.Transform_setRotation(bt_transform1, bt_quat);
    }
  };
  _proto.syncSceneToGhost = function syncSceneToGhost() {
    if (this.node.hasChangedFlags) {
      var bt_quat = BulletCache.instance.BT_QUAT_0;
      var bt_transform = bt.CollisionObject_getWorldTransform(this.ghost);
      cocos2BulletVec3(bt.Transform_getOrigin(bt_transform), this.node.worldPosition);
      cocos2BulletQuat(bt_quat, this.node.worldRotation);
      bt.Transform_setRotation(bt_transform, bt_quat);
      if (this.node.hasChangedFlags & TransformBit.SCALE) this.syncGhostScale();
      bt.CollisionObject_activate(this.ghost, false);
    }
  };
  _proto.syncInitialBody = function syncInitialBody() {
    var bt_quat = BulletCache.instance.BT_QUAT_0;
    var bt_transform = bt.CollisionObject_getWorldTransform(this.body);
    cocos2BulletVec3(bt.Transform_getOrigin(bt_transform), this.node.worldPosition);
    cocos2BulletQuat(bt_quat, this.node.worldRotation);
    bt.Transform_setRotation(bt_transform, bt_quat);
    this.syncBodyScale();
    bt.CollisionObject_activate(this.body, false);
  };
  _proto.syncInitialGhost = function syncInitialGhost() {
    var bt_quat = BulletCache.instance.BT_QUAT_0;
    var bt_transform = bt.CollisionObject_getWorldTransform(this.ghost);
    cocos2BulletVec3(bt.Transform_getOrigin(bt_transform), this.node.worldPosition);
    cocos2BulletQuat(bt_quat, this.node.worldRotation);
    bt.Transform_setRotation(bt_transform, bt_quat);
    this.syncGhostScale();
    bt.CollisionObject_activate(this.body, false);
  };
  _proto.syncBodyScale = function syncBodyScale() {
    for (var i = 0; i < this.bodyStruct.wrappedShapes.length; i++) {
      this.bodyStruct.wrappedShapes[i].updateScale();
    }
    for (var _i3 = 0; _i3 < this.wrappedJoints0.length; _i3++) {
      this.wrappedJoints0[_i3].updateScale0();
    }
    for (var _i4 = 0; _i4 < this.wrappedJoints1.length; _i4++) {
      this.wrappedJoints1[_i4].updateScale1();
    }
  };
  _proto.syncGhostScale = function syncGhostScale() {
    for (var i = 0; i < this.ghostStruct.wrappedShapes.length; i++) {
      this.ghostStruct.wrappedShapes[i].updateScale();
    }
  };
  _proto.updateBodyByReAdd = function updateBodyByReAdd() {
    if (this.bodyIndex >= 0) {
      this.wrappedWorld.removeSharedBody(this);
      this.bodyIndex = this.wrappedWorld.bodies.length;
      this.wrappedWorld.addSharedBody(this);
    }
  };
  _proto.updateGhostByReAdd = function updateGhostByReAdd() {
    if (this.ghostIndex >= 0) {
      this.wrappedWorld.removeGhostObject(this);
      this.ghostIndex = this.wrappedWorld.ghosts.length;
      this.wrappedWorld.addGhostObject(this);
    }
  };
  _proto.destroy = function destroy() {
    BulletSharedBody.sharedBodesMap["delete"](this.node.uuid);
    this.node = null;
    this.wrappedWorld = null;
    if (this._bodyStruct) {
      var bodyStruct = this._bodyStruct;
      BulletCache.delWrapper(this.id, btCache.BODY_CACHE_NAME);
      bt._safe_delete(bodyStruct.motionState, EBulletType.EBulletTypeMotionState);
      bt._safe_delete(bodyStruct.compound, EBulletType.EBulletTypeCollisionShape);
      bt._safe_delete(bodyStruct.body, EBulletType.EBulletTypeCollisionObject);
      this._bodyStruct = null;
    }
    if (this._ghostStruct) {
      var ghostStruct = this._ghostStruct;
      bt._safe_delete(ghostStruct.compound, EBulletType.EBulletTypeCollisionShape);
      bt._safe_delete(ghostStruct.ghost, EBulletType.EBulletTypeCollisionObject);
      this._ghostStruct = null;
    }
  };
  _proto.isBodySleeping = function isBodySleeping() {
    return bt.CollisionObject_isSleeping(this.body);
  };
  return _createClass(BulletSharedBody, [{
    key: "wrappedBody",
    get: function get() {
      return this._wrappedBody;
    }
  }, {
    key: "bodyCompoundShape",
    get: function get() {
      return this.bodyStruct.compound;
    }
  }, {
    key: "ghostCompoundShape",
    get: function get() {
      return this.ghostStruct.compound;
    }
  }, {
    key: "body",
    get: function get() {
      return this.bodyStruct.body;
    }
  }, {
    key: "ghost",
    get: function get() {
      return this.ghostStruct.ghost;
    }
  }, {
    key: "collisionFilterGroup",
    get: function get() {
      return this._collisionFilterGroup;
    },
    set: function set(v) {
      if (v !== this._collisionFilterGroup) {
        this._collisionFilterGroup = v;
        this.dirty |= EBtSharedBodyDirty.BODY_RE_ADD;
        this.dirty |= EBtSharedBodyDirty.GHOST_RE_ADD;
      }
    }
  }, {
    key: "collisionFilterMask",
    get: function get() {
      return this._collisionFilterMask;
    },
    set: function set(v) {
      if (v !== this._collisionFilterMask) {
        this._collisionFilterMask = v;
        this.dirty |= EBtSharedBodyDirty.BODY_RE_ADD;
        this.dirty |= EBtSharedBodyDirty.GHOST_RE_ADD;
      }
    }
  }, {
    key: "bodyStruct",
    get: function get() {
      this._instantiateBodyStruct();
      return this._bodyStruct;
    }
  }, {
    key: "ghostStruct",
    get: function get() {
      this._instantiateGhostStruct();
      return this._ghostStruct;
    }
  }, {
    key: "bodyEnabled",
    set: function set(v) {
      var _this = this;
      if (v) {
        if (this.bodyIndex < 0) {
          if (this.bodyStruct.wrappedShapes.length === 0) {
            if (!this.wrappedBody) return;
            if (!this.wrappedBody.rigidBody.isDynamic) return;
          }
          this.bodyIndex = this.wrappedWorld.bodies.length;
          this.wrappedWorld.addSharedBody(this);
          this.syncInitialBody();
        }
      } else if (this.bodyIndex >= 0) {
        var isRemoveBody = this.bodyStruct.wrappedShapes.length === 0 && this.wrappedBody == null || this.bodyStruct.wrappedShapes.length === 0 && this.wrappedBody != null && !this.wrappedBody.isEnabled || this.bodyStruct.wrappedShapes.length === 0 && this.wrappedBody != null && !this.wrappedBody.rigidBody.enabledInHierarchy;
        if (isRemoveBody) {
          var impl = this.body;
          var constraints = this.wrappedWorld.constraints;
          constraints.forEach(function (worldConstraint) {
            var _worldConstraint$cons, _worldConstraint$cons2;
            if (((_worldConstraint$cons = worldConstraint.constraint.attachedBody) == null ? void 0 : (_worldConstraint$cons2 = _worldConstraint$cons.body) == null ? void 0 : _worldConstraint$cons2.impl) === impl) {
              _this.wrappedWorld.removeConstraint(worldConstraint);
            }
          });
          bt.RigidBody_clearState(this.body);
          this.bodyIndex = -1;
          this.wrappedWorld.removeSharedBody(this);
        }
      }
    }
  }, {
    key: "ghostEnabled",
    set: function set(v) {
      if (v) {
        if (this.ghostIndex < 0 && this.ghostStruct.wrappedShapes.length > 0) {
          this.ghostIndex = 1;
          this.wrappedWorld.addGhostObject(this);
          this.syncInitialGhost();
        }
      } else if (this.ghostIndex >= 0) {
        var isRemoveGhost = this.ghostStruct.wrappedShapes.length === 0 && this.ghost;
        if (isRemoveGhost) {
          this.ghostIndex = -1;
          this.wrappedWorld.removeGhostObject(this);
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
BulletSharedBody.idCounter = 0;
BulletSharedBody.sharedBodesMap = new Map();

var v3_0$4 = CC_V3_0;
var ccMaterialBooks = {};
var BulletShape = function () {
  function BulletShape() {
    this.id = BulletShape.idCounter++;
    this._isEnabled = false;
    this._isTrigger = false;
    this._isInitialized = false;
    this._impl = 0;
    this._compound = 0;
    this.quat = bt.Quat_new(0, 0, 0, 1);
    this.transform = bt.Transform_new();
    this._collider = void 0;
    this._sharedBody = void 0;
  }
  var _proto = BulletShape.prototype;
  _proto.updateEventListener = function updateEventListener() {
    if (!this._sharedBody.wrappedWorld) return;
    this._sharedBody.wrappedWorld.updateNeedEmitEvents(this.collider.needCollisionEvent || this.collider.needTriggerEvent);
  };
  _proto.setMaterial = function setMaterial(v) {
    var v1 = v == null ? PhysicsSystem.instance.defaultMaterial : v;
    if (!this._isTrigger && this._isEnabled) {
      if (this._compound) {
        if (!ccMaterialBooks[v1._uuid]) ccMaterialBooks[v1._uuid] = bt.ccMaterial_new();
        var mat = ccMaterialBooks[v1._uuid];
        bt.ccMaterial_set(mat, v1.restitution, v1.friction, v1.rollingFriction, v1.spinningFriction);
        bt.CollisionShape_setMaterial(this._impl, mat);
      } else {
        bt.CollisionObject_setMaterial(this._sharedBody.body, v1.restitution, v1.friction, v1.rollingFriction, v1.spinningFriction);
      }
    }
  };
  _proto.setCenter = function setCenter(v) {
    Vec3.copy(v3_0$4, v);
    v3_0$4.multiply(this._collider.node.worldScale);
    cocos2BulletVec3(bt.Transform_getOrigin(this.transform), v3_0$4);
    this.updateCompoundTransform();
  };
  _proto.setAsTrigger = function setAsTrigger(v) {
    if (this._isTrigger === v) return;
    if (this._isEnabled) {
      this._sharedBody.removeShape(this, !v);
      this._sharedBody.addShape(this, v);
    }
    this._isTrigger = v;
  };
  _proto.getAABB = function getAABB(v) {
    var bt_transform = BulletCache.instance.BT_TRANSFORM_0;
    bt.Transform_setIdentity(bt_transform);
    bt.Transform_setRotation(bt_transform, cocos2BulletQuat(BulletCache.instance.BT_QUAT_0, this._collider.node.worldRotation));
    var MIN = BulletCache.instance.BT_V3_0;
    var MAX = BulletCache.instance.BT_V3_1;
    bt.CollisionShape_getAabb(this._impl, bt_transform, MIN, MAX);
    v.halfExtents.x = (bt.Vec3_x(MAX) - bt.Vec3_x(MIN)) / 2;
    v.halfExtents.y = (bt.Vec3_y(MAX) - bt.Vec3_y(MIN)) / 2;
    v.halfExtents.z = (bt.Vec3_z(MAX) - bt.Vec3_z(MIN)) / 2;
    Vec3.add(v.center, this._collider.node.worldPosition, this._collider.center);
  };
  _proto.getBoundingSphere = function getBoundingSphere(v) {
    v.radius = bt.CollisionShape_getLocalBoundingSphere(this._impl);
    Vec3.add(v.center, this._collider.node.worldPosition, this._collider.center);
  };
  _proto.initialize = function initialize(com) {
    this._collider = com;
    this._isInitialized = true;
    this._sharedBody = PhysicsSystem.instance.physicsWorld.getSharedBody(this._collider.node);
    this._sharedBody.reference = true;
    this.onComponentSet();
    this.setWrapper();
  };
  _proto.setWrapper = function setWrapper() {
    if (BulletCache.isNotEmptyShape(this._impl)) {
      bt.CollisionShape_setUserPointer(this._impl, this._impl);
      BulletCache.setWrapper(this._impl, BulletShape.TYPE, this);
    }
  };
  _proto.onLoad = function onLoad() {
    this.setCenter(this._collider.center);
    this.setAsTrigger(this._collider.isTrigger);
  };
  _proto.onEnable = function onEnable() {
    this._isEnabled = true;
    this._sharedBody.addShape(this, this._isTrigger);
    this.setMaterial(this.collider.sharedMaterial);
  };
  _proto.onDisable = function onDisable() {
    this._isEnabled = false;
    this._sharedBody.removeShape(this, this._isTrigger);
  };
  _proto.onDestroy = function onDestroy() {
    this._sharedBody.reference = false;
    this._collider = null;
    bt._safe_delete(this.quat, EBulletType.EBulletTypeQuat);
    bt._safe_delete(this.transform, EBulletType.EBulletTypeTransform);
    if (this._compound) bt._safe_delete(this._compound, EBulletType.EBulletTypeCollisionShape);
    if (BulletCache.isNotEmptyShape(this._impl)) {
      bt._safe_delete(this._impl, EBulletType.EBulletTypeCollisionShape);
      BulletCache.delWrapper(this._impl, BulletShape.TYPE);
    }
  };
  _proto.updateByReAdd = function updateByReAdd() {
    if (this._isEnabled) {
      this._sharedBody.removeShape(this, this._isTrigger);
      this._sharedBody.addShape(this, this._isTrigger);
    }
  };
  _proto.getGroup = function getGroup() {
    return this._sharedBody.collisionFilterGroup;
  };
  _proto.setGroup = function setGroup(v) {
    this._sharedBody.collisionFilterGroup = v;
  };
  _proto.addGroup = function addGroup(v) {
    this._sharedBody.collisionFilterGroup |= v;
  };
  _proto.removeGroup = function removeGroup(v) {
    this._sharedBody.collisionFilterGroup &= ~v;
  };
  _proto.getMask = function getMask() {
    return this._sharedBody.collisionFilterMask;
  };
  _proto.setMask = function setMask(v) {
    this._sharedBody.collisionFilterMask = v;
  };
  _proto.addMask = function addMask(v) {
    this._sharedBody.collisionFilterMask |= v;
  };
  _proto.removeMask = function removeMask(v) {
    this._sharedBody.collisionFilterMask &= ~v;
  };
  _proto.setCompound = function setCompound(compound) {
    if (this._compound) bt.CompoundShape_removeChildShape(this._compound, this._impl);
    if (compound) bt.CompoundShape_addChildShape(compound, this.transform, this._impl);
    this._compound = compound;
  };
  _proto.updateScale = function updateScale() {
    this.setCenter(this._collider.center);
  };
  _proto.updateCompoundTransform = function updateCompoundTransform() {
    if (this._compound) {
      bt.CompoundShape_updateChildTransform(this._compound, this._impl, this.transform, true);
    } else if (this._isEnabled && !this._isTrigger) {
      if (this._sharedBody && !this._sharedBody.bodyStruct.useCompound) {
        this._sharedBody.dirty |= EBtSharedBodyDirty.BODY_RE_ADD;
      }
    }
  };
  _proto.needCompound = function needCompound() {
    if (this._collider.type === EColliderType.TERRAIN) {
      return true;
    }
    if (this._collider.center.equals(Vec3.ZERO)) {
      return false;
    }
    return true;
  };
  return _createClass(BulletShape, [{
    key: "attachedRigidBody",
    get: function get() {
      if (this._sharedBody.wrappedBody) return this._sharedBody.wrappedBody.rigidBody;
      return null;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._impl;
    }
  }, {
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }, {
    key: "sharedBody",
    get: function get() {
      return this._sharedBody;
    }
  }]);
}();
BulletShape.TYPE = 'shape';
BulletShape.idCounter = 0;

var BulletContactData = function () {
  function BulletContactData(event) {
    this.impl = 0;
    this.event = void 0;
    this.event = event;
  }
  var _proto = BulletContactData.prototype;
  _proto.getLocalPointOnA = function getLocalPointOnA(out) {
    if (this.impl) bullet2CocosVec3(out, bt.ManifoldPoint_get_m_localPointA(this.impl));
  };
  _proto.getLocalPointOnB = function getLocalPointOnB(out) {
    if (this.impl) bullet2CocosVec3(out, bt.ManifoldPoint_get_m_localPointB(this.impl));
  };
  _proto.getWorldPointOnA = function getWorldPointOnA(out) {
    if (this.impl) bullet2CocosVec3(out, bt.ManifoldPoint_get_m_positionWorldOnA(this.impl));
  };
  _proto.getWorldPointOnB = function getWorldPointOnB(out) {
    if (this.impl) bullet2CocosVec3(out, bt.ManifoldPoint_get_m_positionWorldOnB(this.impl));
  };
  _proto.getLocalNormalOnA = function getLocalNormalOnA(out) {
    if (this.impl) {
      var bt_rot = BulletCache.instance.BT_QUAT_0;
      var body = bt.PersistentManifold_getBody0(this.event.impl);
      var trans = bt.CollisionObject_getWorldTransform(body);
      bt.Transform_getRotation(trans, bt_rot);
      var inv_rot = CC_QUAT_0;
      bullet2CocosQuat(inv_rot, bt_rot);
      Quat.conjugate(inv_rot, inv_rot);
      bullet2CocosVec3(out, bt.ManifoldPoint_get_m_normalWorldOnB(this.impl));
      if (!this.isBodyA) Vec3.negate(out, out);
      Vec3.transformQuat(out, out, inv_rot);
    }
  };
  _proto.getLocalNormalOnB = function getLocalNormalOnB(out) {
    if (this.impl) {
      var bt_rot = BulletCache.instance.BT_QUAT_0;
      var body = bt.PersistentManifold_getBody1(this.event.impl);
      var trans = bt.CollisionObject_getWorldTransform(body);
      bt.Transform_getRotation(trans, bt_rot);
      var inv_rot = CC_QUAT_0;
      bullet2CocosQuat(inv_rot, bt_rot);
      Quat.conjugate(inv_rot, inv_rot);
      bullet2CocosVec3(out, bt.ManifoldPoint_get_m_normalWorldOnB(this.impl));
      Vec3.transformQuat(out, out, inv_rot);
    }
  };
  _proto.getWorldNormalOnA = function getWorldNormalOnA(out) {
    if (this.impl) {
      bullet2CocosVec3(out, bt.ManifoldPoint_get_m_normalWorldOnB(this.impl));
      if (!this.isBodyA) Vec3.negate(out, out);
    }
  };
  _proto.getWorldNormalOnB = function getWorldNormalOnB(out) {
    if (this.impl) bullet2CocosVec3(out, bt.ManifoldPoint_get_m_normalWorldOnB(this.impl));
  };
  return _createClass(BulletContactData, [{
    key: "isBodyA",
    get: function get() {
      var sb = this.event.selfCollider.shape.sharedBody.body;
      return sb === bt.PersistentManifold_getBody0(this.event.impl);
    }
  }]);
}();

var contactsPool = [];
var v3_0$3 = CC_V3_0;
var v3_1$1 = CC_V3_1;
var v3_2 = CC_V3_2;
var c_0 = CC_COLOR_0;
var emitHit = new CharacterControllerContact();
var BulletWorld = function () {
  function BulletWorld() {
    this._world = void 0;
    this._broadphase = void 0;
    this._solver = void 0;
    this._dispatcher = void 0;
    this._debugDraw = void 0;
    this._debugLineCount = 0;
    this._MAX_DEBUG_LINE_COUNT = 16384;
    this._debugDrawFlags = EPhysicsDrawFlags.NONE;
    this._debugConstraintSize = 0.3;
    this._needEmitEvents = false;
    this._needSyncAfterEvents = false;
    this._needEmitCCTEvents = false;
    this.bodies = [];
    this.ghosts = [];
    this.ccts = [];
    this.constraints = [];
    this.triggerArrayMat = new ArrayCollisionMatrix();
    this.characterControllerArrayMat = new ArrayCollisionMatrix();
    this.collisionArrayMat = new ArrayCollisionMatrix();
    this.contactsDic = new TupleDictionary();
    this.oldContactsDic = new TupleDictionary();
    this.cctShapeEventDic = new TupleDictionary();
    this.cctContactsDic = new TupleDictionary();
    this.cctOldContactsDic = new TupleDictionary();
    btCache.CACHE.world = this;
    this._broadphase = bt.DbvtBroadphase_new();
    this._dispatcher = bt.CollisionDispatcher_new();
    this._solver = bt.SequentialImpulseConstraintSolver_new();
    this._world = bt.ccDiscreteDynamicsWorld_new(this._dispatcher, this._broadphase, this._solver);
    var debugDraw = bt.DebugDraw.implement(importFunc);
    this._debugDraw = debugDraw.$$.ptr;
    bt.CollisionWorld_setDebugDrawer(this._world, this._debugDraw);
    bt.DebugDraw_setDebugMode(this._debugDraw, EBulletDebugDrawModes.DBG_NoDebug);
    bt.DebugDraw_setAABBColor(this._debugDraw, 0, 1, 1);
    bt.DebugDraw_setActiveObjectColor(this._debugDraw, 1, 0, 1);
    bt.DebugDraw_setDeactiveObjectColor(this._debugDraw, 1, 0, 1);
    bt.DebugDraw_setWantsDeactivationObjectColor(this._debugDraw, 1, 0, 1);
    bt.DebugDraw_setDisabledDeactivationObjectColor(this._debugDraw, 1, 0, 1);
    bt.DebugDraw_setDisabledSimulationObjectColor(this._debugDraw, 1, 0, 1);
    bt.DebugDraw_setConstraintLimitColor(this._debugDraw, 0.5, 0.5, 0.5);
  }
  var _proto = BulletWorld.prototype;
  _proto.setDefaultMaterial = function setDefaultMaterial(v) {};
  _proto.setAllowSleep = function setAllowSleep(v) {
    bt.ccDiscreteDynamicsWorld_setAllowSleep(this._world, v);
  };
  _proto.setGravity = function setGravity(gravity) {
    bt.DynamicsWorld_setGravity(this._world, cocos2BulletVec3(BulletCache.instance.BT_V3_0, gravity));
  };
  _proto.updateNeedEmitEvents = function updateNeedEmitEvents(v) {
    if (!this.ghosts) return;
    if (v) {
      this._needEmitEvents = true;
    } else {
      this._needEmitEvents = false;
      for (var i = 0; i < this.ghosts.length; i++) {
        var ghost = this.ghosts[i];
        var shapes = ghost.ghostStruct.wrappedShapes;
        for (var j = 0; j < shapes.length; j++) {
          var collider = shapes[j].collider;
          if (collider.needCollisionEvent || collider.needTriggerEvent) {
            this._needEmitEvents = true;
            return;
          }
        }
      }
      for (var _i = 0; _i < this.bodies.length; _i++) {
        var body = this.bodies[_i];
        var _shapes = body.bodyStruct.wrappedShapes;
        for (var _j = 0; _j < _shapes.length; _j++) {
          var _collider = _shapes[_j].collider;
          if (_collider.needCollisionEvent || _collider.needTriggerEvent) {
            this._needEmitEvents = true;
            return;
          }
        }
      }
    }
  };
  _proto.updateNeedEmitCCTEvents = function updateNeedEmitCCTEvents(force) {
    if (!this.ccts) return;
    if (force) {
      this._needEmitCCTEvents = true;
    } else {
      this._needEmitCCTEvents = false;
      var ccts = this.ccts;
      var length = ccts.length;
      for (var i = 0; i < length; i++) {
        var cctCom = ccts[i].characterController;
        if (cctCom.needCollisionEvent) {
          this._needEmitCCTEvents = true;
          return;
        }
      }
    }
  };
  _proto.destroy = function destroy() {
    if (this.constraints.length || this.bodies.length || this.ccts.length) error('You should destroy all physics component first.');
    bt._safe_delete(this._world, EBulletType.EBulletTypeCollisionWorld);
    bt._safe_delete(this._broadphase, EBulletType.EBulletTypeDbvtBroadPhase);
    bt._safe_delete(this._dispatcher, EBulletType.EBulletTypeCollisionDispatcher);
    bt._safe_delete(this._solver, EBulletType.EBulletTypeSequentialImpulseConstraintSolver);
    bt._safe_delete(this._debugDraw, EBulletType.EBulletTypeDebugDraw);
    this.bodies = null;
    this.ghosts = null;
    this.ccts = null;
    this.constraints = null;
    this.triggerArrayMat = null;
    this.characterControllerArrayMat = null;
    this.collisionArrayMat = null;
    this.contactsDic = null;
    this.oldContactsDic = null;
    this.cctShapeEventDic = null;
    this.cctShapeEventPool = null;
    contactsPool.length = 0;
  };
  _proto.step = function step(deltaTime, timeSinceLastCalled, maxSubStep) {
    if (maxSubStep === void 0) {
      maxSubStep = 0;
    }
    if (!this.bodies.length && !this.ghosts.length) return;
    if (timeSinceLastCalled === undefined) timeSinceLastCalled = deltaTime;
    bt.DynamicsWorld_stepSimulation(this._world, timeSinceLastCalled, maxSubStep, deltaTime);
    bt.CollisionWorld_debugDrawWorld(this._world);
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    for (var i = this.ghosts.length - 1; i >= 0; i--) {
      var ghost = this.ghosts[i];
      ghost.updateDirty();
      ghost.syncSceneToGhost();
    }
    for (var _i2 = this.bodies.length - 1; _i2 >= 0; _i2--) {
      var body = this.bodies[_i2];
      body.updateDirty();
      body.syncSceneToPhysics();
    }
    var ccts = this.ccts;
    var length = ccts.length;
    for (var _i3 = length - 1; _i3 >= 0; _i3--) {
      var cct = ccts[_i3];
      cct.updateDirty();
      cct.syncSceneToPhysics();
    }
  };
  _proto.syncAfterEvents = function syncAfterEvents() {
    if (!this._needSyncAfterEvents) return;
    this.syncSceneToPhysics();
  };
  _proto.raycast = function raycast(worldRay, options, pool, results) {
    worldRay.computeHit(v3_0$3, options.maxDistance);
    var to = cocos2BulletVec3(BulletCache.instance.BT_V3_0, v3_0$3);
    var from = cocos2BulletVec3(BulletCache.instance.BT_V3_1, worldRay.o);
    var allHitsCB = bt.ccAllRayCallback_static();
    bt.ccAllRayCallback_reset(allHitsCB, from, to, options.mask >>> 0, options.queryTrigger);
    bt.ccAllRayCallback_setFlags(allHitsCB, EBulletTriangleRaycastFlag.UseSubSimplexConvexCastRaytest);
    bt.CollisionWorld_rayTest(this._world, from, to, allHitsCB);
    if (bt.RayCallback_hasHit(allHitsCB)) {
      var posArray = bt.ccAllRayCallback_getHitPointWorld(allHitsCB);
      var normalArray = bt.ccAllRayCallback_getHitNormalWorld(allHitsCB);
      var ptrArray = bt.ccAllRayCallback_getCollisionShapePtrs(allHitsCB);
      var closestHitFraction = bt.ccAllRayCallback_getClosestHitFraction(allHitsCB);
      for (var i = 0, n = bt.int_array_size(ptrArray); i < n; i++) {
        bullet2CocosVec3(v3_0$3, bt.Vec3_array_at(posArray, i));
        bullet2CocosVec3(v3_1$1, bt.Vec3_array_at(normalArray, i));
        var shape = BulletCache.getWrapper(bt.int_array_at(ptrArray, i), BulletShape.TYPE);
        var r = pool.add();
        results.push(r);
        r._assign(v3_0$3, Vec3.distance(worldRay.o, v3_0$3), shape.collider, v3_1$1, closestHitFraction);
      }
      return true;
    }
    return false;
  };
  _proto.raycastClosest = function raycastClosest(worldRay, options, result) {
    worldRay.computeHit(v3_0$3, options.maxDistance);
    var to = cocos2BulletVec3(BulletCache.instance.BT_V3_0, v3_0$3);
    var from = cocos2BulletVec3(BulletCache.instance.BT_V3_1, worldRay.o);
    var closeHitCB = bt.ccClosestRayCallback_static();
    bt.ccClosestRayCallback_reset(closeHitCB, from, to, options.mask >>> 0, options.queryTrigger);
    bt.ccClosestRayCallback_setFlags(closeHitCB, EBulletTriangleRaycastFlag.UseSubSimplexConvexCastRaytest);
    bt.CollisionWorld_rayTest(this._world, from, to, closeHitCB);
    if (bt.RayCallback_hasHit(closeHitCB)) {
      bullet2CocosVec3(v3_0$3, bt.ccClosestRayCallback_getHitPointWorld(closeHitCB));
      bullet2CocosVec3(v3_1$1, bt.ccClosestRayCallback_getHitNormalWorld(closeHitCB));
      var shape = BulletCache.getWrapper(bt.ccClosestRayCallback_getCollisionShapePtr(closeHitCB), BulletShape.TYPE);
      var closestHitFraction = bt.ccClosestConvexCallback_getClosestHitFraction(closeHitCB);
      result._assign(v3_0$3, Vec3.distance(worldRay.o, v3_0$3), shape.collider, v3_1$1, closestHitFraction);
      return true;
    }
    return false;
  };
  _proto.sweepBox = function sweepBox(worldRay, halfExtent, orientation, options, pool, results) {
    var hf = BulletCache.instance.BT_V3_0;
    cocos2BulletVec3(hf, halfExtent);
    if (!BulletWorld._sweepBoxGeometry) {
      BulletWorld._sweepBoxGeometry = bt.BoxShape_new(hf);
    }
    bt.BoxShape_setUnscaledHalfExtents(BulletWorld._sweepBoxGeometry, hf);
    return this.sweep(worldRay, BulletWorld._sweepBoxGeometry, orientation, options, pool, results);
  };
  _proto.sweepBoxClosest = function sweepBoxClosest(worldRay, halfExtent, orientation, options, result) {
    var hf = BulletCache.instance.BT_V3_0;
    cocos2BulletVec3(hf, halfExtent);
    if (!BulletWorld._sweepBoxGeometry) {
      BulletWorld._sweepBoxGeometry = bt.BoxShape_new(hf);
    }
    bt.BoxShape_setUnscaledHalfExtents(BulletWorld._sweepBoxGeometry, hf);
    return this.sweepClosest(worldRay, BulletWorld._sweepBoxGeometry, orientation, options, result);
  };
  _proto.sweepSphere = function sweepSphere(worldRay, radius, options, pool, results) {
    if (!BulletWorld._sweepSphereGeometry) {
      BulletWorld._sweepSphereGeometry = bt.SphereShape_new(radius);
    }
    bt.SphereShape_setUnscaledRadius(BulletWorld._sweepSphereGeometry, radius);
    return this.sweep(worldRay, BulletWorld._sweepSphereGeometry, Quat.IDENTITY, options, pool, results);
  };
  _proto.sweepSphereClosest = function sweepSphereClosest(worldRay, radius, options, result) {
    if (!BulletWorld._sweepSphereGeometry) {
      BulletWorld._sweepSphereGeometry = bt.SphereShape_new(radius);
    }
    bt.SphereShape_setUnscaledRadius(BulletWorld._sweepSphereGeometry, radius);
    return this.sweepClosest(worldRay, BulletWorld._sweepSphereGeometry, Quat.IDENTITY, options, result);
  };
  _proto.sweepCapsule = function sweepCapsule(worldRay, radius, height, orientation, options, pool, results) {
    if (!BulletWorld._sweepCapsuleGeometry) {
      BulletWorld._sweepCapsuleGeometry = bt.CapsuleShape_new(radius, height);
    }
    bt.CapsuleShape_updateProp(BulletWorld._sweepCapsuleGeometry, radius, height * 0.5, 1);
    return this.sweep(worldRay, BulletWorld._sweepCapsuleGeometry, orientation, options, pool, results);
  };
  _proto.sweepCapsuleClosest = function sweepCapsuleClosest(worldRay, radius, height, orientation, options, result) {
    if (!BulletWorld._sweepCapsuleGeometry) {
      BulletWorld._sweepCapsuleGeometry = bt.CapsuleShape_new(radius, height);
    }
    bt.CapsuleShape_updateProp(BulletWorld._sweepCapsuleGeometry, radius, height * 0.5, 1);
    return this.sweepClosest(worldRay, BulletWorld._sweepCapsuleGeometry, orientation, options, result);
  };
  _proto.sweep = function sweep(worldRay, btShapePtr, orientation, options, pool, results) {
    var BT_fromTransform = bt.Transform_new();
    var BT_toTransform = bt.Transform_new();
    var BT_orientation = bt.Quat_new(0, 0, 0, 1);
    cocos2BulletVec3(bt.Transform_getOrigin(BT_fromTransform), worldRay.o);
    cocos2BulletQuat(BT_orientation, orientation);
    bt.Transform_setRotation(BT_fromTransform, BT_orientation);
    worldRay.computeHit(v3_0$3, options.maxDistance);
    cocos2BulletVec3(bt.Transform_getOrigin(BT_toTransform), v3_0$3);
    cocos2BulletQuat(BT_orientation, orientation);
    bt.Transform_setRotation(BT_toTransform, BT_orientation);
    var allHitsCB = bt.ccAllConvexCallback_static();
    bt.ccAllConvexCallback_reset(allHitsCB, BT_fromTransform, BT_toTransform, options.mask >>> 0, options.queryTrigger);
    bt.CollisionWorld_convexSweepTest(this._world, btShapePtr, BT_fromTransform, BT_toTransform, allHitsCB, 0);
    bt._safe_delete(BT_fromTransform, EBulletType.EBulletTypeTransform);
    bt._safe_delete(BT_toTransform, EBulletType.EBulletTypeTransform);
    bt._safe_delete(BT_orientation, EBulletType.EBulletTypeQuat);
    if (bt.ConvexCallback_hasHit(allHitsCB)) {
      var posArray = bt.ccAllConvexCallback_getHitPointWorld(allHitsCB);
      var normalArray = bt.ccAllConvexCallback_getHitNormalWorld(allHitsCB);
      var ptrArray = bt.ccAllConvexCallback_getCollisionShapePtrs(allHitsCB);
      var closestHitFraction = bt.ccAllConvexCallback_getClosestHitFraction(allHitsCB);
      for (var i = 0, n = bt.int_array_size(ptrArray); i < n; i++) {
        bullet2CocosVec3(v3_0$3, bt.Vec3_array_at(posArray, i));
        bullet2CocosVec3(v3_1$1, bt.Vec3_array_at(normalArray, i));
        var shape = BulletCache.getWrapper(bt.int_array_at(ptrArray, i), BulletShape.TYPE);
        var r = pool.add();
        results.push(r);
        r._assign(v3_0$3, Vec3.distance(worldRay.o, v3_0$3), shape.collider, v3_1$1, closestHitFraction);
      }
      return true;
    }
    return false;
  };
  _proto.sweepClosest = function sweepClosest(worldRay, btShapePtr, orientation, options, result) {
    var BT_fromTransform = bt.Transform_new();
    var BT_toTransform = bt.Transform_new();
    var BT_orientation = bt.Quat_new(0, 0, 0, 1);
    cocos2BulletVec3(bt.Transform_getOrigin(BT_fromTransform), worldRay.o);
    cocos2BulletQuat(BT_orientation, orientation);
    bt.Transform_setRotation(BT_fromTransform, BT_orientation);
    worldRay.computeHit(v3_0$3, options.maxDistance);
    cocos2BulletVec3(bt.Transform_getOrigin(BT_toTransform), v3_0$3);
    cocos2BulletQuat(BT_orientation, orientation);
    bt.Transform_setRotation(BT_toTransform, BT_orientation);
    var closeHitCB = bt.ccClosestConvexCallback_static();
    bt.ccClosestConvexCallback_reset(closeHitCB, BT_fromTransform, BT_toTransform, options.mask >>> 0, options.queryTrigger);
    bt.CollisionWorld_convexSweepTest(this._world, btShapePtr, BT_fromTransform, BT_toTransform, closeHitCB, 0);
    bt._safe_delete(BT_fromTransform, EBulletType.EBulletTypeTransform);
    bt._safe_delete(BT_toTransform, EBulletType.EBulletTypeTransform);
    bt._safe_delete(BT_orientation, EBulletType.EBulletTypeQuat);
    if (bt.ConvexCallback_hasHit(closeHitCB)) {
      bullet2CocosVec3(v3_0$3, bt.ccClosestConvexCallback_getHitPointWorld(closeHitCB));
      bullet2CocosVec3(v3_1$1, bt.ccClosestConvexCallback_getHitNormalWorld(closeHitCB));
      var shape = BulletCache.getWrapper(bt.ccClosestConvexCallback_getCollisionShapePtr(closeHitCB), BulletShape.TYPE);
      var closestHitFraction = bt.ccClosestConvexCallback_getClosestHitFraction(closeHitCB);
      result._assign(v3_0$3, Vec3.distance(worldRay.o, v3_0$3), shape.collider, v3_1$1, closestHitFraction);
      return true;
    }
    return false;
  };
  _proto.getSharedBody = function getSharedBody(node, wrappedBody) {
    return BulletSharedBody.getSharedBody(node, this, wrappedBody);
  };
  _proto.addSharedBody = function addSharedBody(sharedBody) {
    var i = this.bodies.indexOf(sharedBody);
    if (i < 0) {
      this.bodies.push(sharedBody);
      var group = sharedBody.collisionFilterGroup;
      var mask = sharedBody.collisionFilterMask;
      bt.DynamicsWorld_addRigidBody(this._world, sharedBody.body, group >>> 0, mask >>> 0);
    }
  };
  _proto.removeSharedBody = function removeSharedBody(sharedBody) {
    var i = this.bodies.indexOf(sharedBody);
    if (i >= 0) {
      fastRemoveAt(this.bodies, i);
      bt.DynamicsWorld_removeRigidBody(this._world, sharedBody.body);
    }
  };
  _proto.addGhostObject = function addGhostObject(sharedBody) {
    var i = this.ghosts.indexOf(sharedBody);
    if (i < 0) {
      this.ghosts.push(sharedBody);
      var group = sharedBody.collisionFilterGroup;
      var mask = sharedBody.collisionFilterMask;
      bt.CollisionWorld_addCollisionObject(this._world, sharedBody.ghost, group >>> 0, mask >>> 0);
    }
  };
  _proto.removeGhostObject = function removeGhostObject(sharedBody) {
    var i = this.ghosts.indexOf(sharedBody);
    if (i >= 0) {
      fastRemoveAt(this.ghosts, i);
      bt.CollisionWorld_removeCollisionObject(this._world, sharedBody.ghost);
    }
  };
  _proto.addCCT = function addCCT(cct) {
    var index = this.ccts.indexOf(cct);
    if (index < 0) {
      this.ccts.push(cct);
      var cctGhost = bt.CharacterController_getGhostObject(cct.impl);
      var group = cct.getGroup();
      var mask = cct.getMask();
      bt.CollisionWorld_addCollisionObject(this._world, cctGhost, group >>> 0, mask >>> 0);
      bt.DynamicsWorld_addAction(this._world, cct.impl);
    }
  };
  _proto.removeCCT = function removeCCT(cct) {
    var index = this.ccts.indexOf(cct);
    if (index >= 0) {
      fastRemoveAt(this.ccts, index);
      var cctGhost = bt.CharacterController_getGhostObject(cct.impl);
      bt.CollisionWorld_removeCollisionObject(this._world, cctGhost);
      bt.DynamicsWorld_removeAction(this._world, cct.impl);
    }
  };
  _proto.addConstraint = function addConstraint(constraint) {
    var i = this.constraints.indexOf(constraint);
    if (i < 0) {
      this.constraints.push(constraint);
      bt.DynamicsWorld_addConstraint(this.impl, constraint.impl, !constraint.constraint.enableCollision);
      constraint.index = i;
    }
  };
  _proto.removeConstraint = function removeConstraint(constraint) {
    var i = this.constraints.indexOf(constraint);
    if (i >= 0) {
      this.constraints.splice(i, 1);
      bt.DynamicsWorld_removeConstraint(this.impl, constraint.impl);
      constraint.index = -1;
    }
  };
  _proto.emitEvents = function emitEvents() {
    this._needSyncAfterEvents = false;
    if (this._needEmitEvents) {
      this.gatherConatactData();
      this.emitCollisionAndTriggerEvent();
      this.emitCCTTriggerEvent();
    }
    if (this._needEmitCCTEvents) {
      this.emitCCTCollisionEvent();
    }
  };
  _proto.emitCollisionAndTriggerEvent = function emitCollisionAndTriggerEvent() {
    var dicL = this.contactsDic.getLength();
    while (dicL--) {
      contactsPool.push.apply(contactsPool, CollisionEventObject.contacts);
      CollisionEventObject.contacts.length = 0;
      var key = this.contactsDic.getKeyByIndex(dicL);
      var data = this.contactsDic.getDataByKey(key);
      var shape0 = data.shape0;
      var shape1 = data.shape1;
      this.oldContactsDic.set(shape0.id, shape1.id, data);
      var collider0 = shape0.collider;
      var collider1 = shape1.collider;
      if (collider0 && collider1) {
        var isTrigger = collider0.isTrigger || collider1.isTrigger;
        if (isTrigger) {
          if (this.triggerArrayMat.get(shape0.id, shape1.id)) {
            TriggerEventObject.type = 'onTriggerStay';
          } else {
            TriggerEventObject.type = 'onTriggerEnter';
            this.triggerArrayMat.set(shape0.id, shape1.id, true);
          }
          TriggerEventObject.impl = data.impl;
          TriggerEventObject.selfCollider = collider0;
          TriggerEventObject.otherCollider = collider1;
          collider0.emit(TriggerEventObject.type, TriggerEventObject);
          TriggerEventObject.selfCollider = collider1;
          TriggerEventObject.otherCollider = collider0;
          collider1.emit(TriggerEventObject.type, TriggerEventObject);
          this._needSyncAfterEvents = true;
        } else {
          var body0 = collider0.attachedRigidBody;
          var body1 = collider1.attachedRigidBody;
          if (body0 && body1) {
            if (body0.isSleeping && body1.isSleeping) continue;
          } else if (!body0 && body1) {
            if (body1.isSleeping) continue;
          } else if (!body1 && body0) {
            if (body0.isSleeping) continue;
          }
          if (this.collisionArrayMat.get(shape0.id, shape1.id)) {
            CollisionEventObject.type = 'onCollisionStay';
          } else {
            CollisionEventObject.type = 'onCollisionEnter';
            this.collisionArrayMat.set(shape0.id, shape1.id, true);
          }
          for (var i = 0; i < data.contacts.length; i++) {
            var cq = data.contacts[i];
            if (contactsPool.length > 0) {
              var c = contactsPool.pop();
              c.impl = cq;
              CollisionEventObject.contacts.push(c);
            } else {
              var _c = new BulletContactData(CollisionEventObject);
              _c.impl = cq;
              CollisionEventObject.contacts.push(_c);
            }
          }
          CollisionEventObject.impl = data.impl;
          CollisionEventObject.selfCollider = collider0;
          CollisionEventObject.otherCollider = collider1;
          collider0.emit(CollisionEventObject.type, CollisionEventObject);
          CollisionEventObject.selfCollider = collider1;
          CollisionEventObject.otherCollider = collider0;
          collider1.emit(CollisionEventObject.type, CollisionEventObject);
          this._needSyncAfterEvents = true;
        }
        if (this.oldContactsDic.get(shape0.id, shape1.id) == null) {
          this.oldContactsDic.set(shape0.id, shape1.id, data);
        }
      }
    }
    var oldDicL = this.oldContactsDic.getLength();
    while (oldDicL--) {
      var _key = this.oldContactsDic.getKeyByIndex(oldDicL);
      var _data = this.oldContactsDic.getDataByKey(_key);
      var _shape = _data.shape0;
      var _shape2 = _data.shape1;
      var _collider2 = _shape.collider;
      var _collider3 = _shape2.collider;
      if (_collider2 && _collider3) {
        var _isTrigger = _collider2.isTrigger || _collider3.isTrigger;
        if (this.contactsDic.getDataByKey(_key) == null) {
          if (_isTrigger) {
            if (this.triggerArrayMat.get(_shape.id, _shape2.id)) {
              TriggerEventObject.type = 'onTriggerExit';
              TriggerEventObject.selfCollider = _collider2;
              TriggerEventObject.otherCollider = _collider3;
              _collider2.emit(TriggerEventObject.type, TriggerEventObject);
              TriggerEventObject.selfCollider = _collider3;
              TriggerEventObject.otherCollider = _collider2;
              _collider3.emit(TriggerEventObject.type, TriggerEventObject);
              this.triggerArrayMat.set(_shape.id, _shape2.id, false);
              this.oldContactsDic.set(_shape.id, _shape2.id, null);
              this._needSyncAfterEvents = true;
            }
          } else if (this.collisionArrayMat.get(_shape.id, _shape2.id)) {
            contactsPool.push.apply(contactsPool, CollisionEventObject.contacts);
            CollisionEventObject.contacts.length = 0;
            CollisionEventObject.type = 'onCollisionExit';
            CollisionEventObject.selfCollider = _collider2;
            CollisionEventObject.otherCollider = _collider3;
            _collider2.emit(CollisionEventObject.type, CollisionEventObject);
            CollisionEventObject.selfCollider = _collider3;
            CollisionEventObject.otherCollider = _collider2;
            _collider3.emit(CollisionEventObject.type, CollisionEventObject);
            this.collisionArrayMat.set(_shape.id, _shape2.id, false);
            this.oldContactsDic.set(_shape.id, _shape2.id, null);
            this._needSyncAfterEvents = true;
          }
        }
      }
    }
    this.contactsDic.reset();
  };
  _proto.emitCCTTriggerEvent = function emitCCTTriggerEvent() {
    var dicL = this.cctContactsDic.getLength();
    while (dicL--) {
      var key = this.cctContactsDic.getKeyByIndex(dicL);
      var data = this.cctContactsDic.getDataByKey(key);
      var shape = data.shape;
      var cct = data.cct;
      this.cctOldContactsDic.set(shape.id, cct.id, data);
      var collider = shape.collider;
      var characterController = cct.characterController;
      if (collider && characterController) {
        var isTrigger = collider.isTrigger;
        if (isTrigger) {
          if (this.characterControllerArrayMat.get(shape.id, cct.id)) {
            CharacterTriggerEventObject.type = 'onControllerTriggerStay';
          } else {
            CharacterTriggerEventObject.type = 'onControllerTriggerEnter';
            this.characterControllerArrayMat.set(shape.id, cct.id, true);
          }
          CharacterTriggerEventObject.impl = data.impl;
          CharacterTriggerEventObject.collider = collider;
          CharacterTriggerEventObject.characterController = characterController;
          collider.emit(CharacterTriggerEventObject.type, CharacterTriggerEventObject);
          CharacterTriggerEventObject.collider = collider;
          CharacterTriggerEventObject.characterController = characterController;
          characterController.emit(CharacterTriggerEventObject.type, CharacterTriggerEventObject);
          this._needSyncAfterEvents = true;
        }
        if (this.cctOldContactsDic.get(shape.id, cct.id) == null) {
          this.cctOldContactsDic.set(shape.id, cct.id, data);
        }
      }
    }
    var oldDicL = this.cctOldContactsDic.getLength();
    while (oldDicL--) {
      var _key2 = this.cctOldContactsDic.getKeyByIndex(oldDicL);
      var _data2 = this.cctOldContactsDic.getDataByKey(_key2);
      var _shape3 = _data2.shape;
      var _cct = _data2.cct;
      var _collider4 = _shape3.collider;
      var _characterController = _cct.characterController;
      if (_collider4 && _characterController) {
        var _isTrigger2 = _collider4.isTrigger;
        if (this.cctContactsDic.getDataByKey(_key2) == null) {
          if (_isTrigger2) {
            if (this.characterControllerArrayMat.get(_shape3.id, _cct.id)) {
              CharacterTriggerEventObject.type = 'onControllerTriggerExit';
              CharacterTriggerEventObject.collider = _collider4;
              CharacterTriggerEventObject.characterController = _characterController;
              _collider4.emit(CharacterTriggerEventObject.type, CharacterTriggerEventObject);
              CharacterTriggerEventObject.collider = _collider4;
              CharacterTriggerEventObject.characterController = _characterController;
              _characterController.emit(CharacterTriggerEventObject.type, CharacterTriggerEventObject);
              this.characterControllerArrayMat.set(_shape3.id, _cct.id, false);
              this.cctOldContactsDic.set(_shape3.id, _cct.id, null);
              this._needSyncAfterEvents = true;
            }
          }
        }
      }
    }
    this.cctContactsDic.reset();
  };
  _proto.emitCCTCollisionEvent = function emitCCTCollisionEvent() {
    var dicL = this.cctShapeEventDic.getLength();
    while (dicL--) {
      var _emitHit$controller;
      var key = this.cctShapeEventDic.getKeyByIndex(dicL);
      var data = this.cctShapeEventDic.getDataByKey(key);
      var cct = data.BulletCharacterController;
      var shape = data.BulletShape;
      var worldPos = data.worldPos;
      var worldNormal = data.worldNormal;
      var motionDir = data.motionDir;
      var motionLength = data.motionLength;
      emitHit.controller = cct.characterController;
      emitHit.collider = shape.collider;
      emitHit.worldPosition.set(worldPos.x, worldPos.y, worldPos.z);
      emitHit.worldNormal.set(worldNormal.x, worldNormal.y, worldNormal.z);
      emitHit.motionDirection.set(motionDir.x, motionDir.y, motionDir.z);
      emitHit.motionLength = motionLength;
      (_emitHit$controller = emitHit.controller) == null ? void 0 : _emitHit$controller.emit('onControllerColliderHit', emitHit);
      this._needSyncAfterEvents = true;
    }
    this.cctShapeEventDic.reset();
  };
  _proto.gatherConatactData = function gatherConatactData() {
    var numManifolds = bt.Dispatcher_getNumManifolds(this._dispatcher);
    for (var i = 0; i < numManifolds; i++) {
      var manifold = bt.Dispatcher_getManifoldByIndexInternal(this._dispatcher, i);
      var numContacts = bt.PersistentManifold_getNumContacts(manifold);
      for (var j = 0; j < numContacts; j++) {
        var manifoldPoint = bt.PersistentManifold_getContactPoint(manifold, j);
        var s0 = bt.ManifoldPoint_getShape0(manifoldPoint);
        var s1 = bt.ManifoldPoint_getShape1(manifoldPoint);
        var processed = false;
        if (!processed) {
          var shape0 = BulletCache.getWrapper(s0, BulletShape.TYPE);
          var shape1 = BulletCache.getWrapper(s1, BulletShape.TYPE);
          if (shape0 && shape1) {
            processed = true;
            if (shape0.collider.needTriggerEvent || shape1.collider.needTriggerEvent || shape0.collider.needCollisionEvent || shape1.collider.needCollisionEvent) {
              var item = this.contactsDic.get(shape0.id, shape1.id);
              if (!item) {
                item = this.contactsDic.set(shape0.id, shape1.id, {
                  shape0: shape0,
                  shape1: shape1,
                  contacts: [],
                  impl: manifold
                });
              }
              item.contacts.push(manifoldPoint);
            }
          }
        }
        if (!processed) {
          var shape = BulletCache.getWrapper(s0, BulletShape.TYPE);
          var cct = BulletCache.getWrapper(s1, btCache.CCT_CACHE_NAME);
          if (shape && cct) {
            processed = true;
            if (shape.collider.needTriggerEvent) {
              var _item = this.cctContactsDic.get(shape.id, cct.id);
              if (!_item) {
                _item = this.cctContactsDic.set(shape.id, cct.id, {
                  shape: shape,
                  cct: cct,
                  contacts: [],
                  impl: manifold
                });
              }
              _item.contacts.push(manifoldPoint);
              processed = true;
            }
          }
        }
        if (!processed) {
          var _cct2 = BulletCache.getWrapper(s0, btCache.CCT_CACHE_NAME);
          var _shape4 = BulletCache.getWrapper(s1, BulletShape.TYPE);
          if (_shape4 && _cct2) {
            processed = true;
            if (_shape4.collider.needTriggerEvent) {
              var _item2 = this.cctContactsDic.get(_shape4.id, _cct2.id);
              if (!_item2) {
                _item2 = this.cctContactsDic.set(_shape4.id, _cct2.id, {
                  shape: _shape4,
                  cct: _cct2,
                  contacts: [],
                  impl: manifold
                });
              }
              _item2.contacts.push(manifoldPoint);
              processed = true;
            }
          }
        }
      }
    }
  };
  _proto._setDebugDrawMode = function _setDebugDrawMode() {
    var btDrawMode = 0;
    if (this._debugDrawFlags & EPhysicsDrawFlags.WIRE_FRAME) {
      btDrawMode |= EBulletDebugDrawModes.DBG_DrawWireframe;
    }
    if (this._debugDrawFlags & EPhysicsDrawFlags.CONSTRAINT) {
      btDrawMode |= EBulletDebugDrawModes.DBG_DrawConstraints;
      btDrawMode |= EBulletDebugDrawModes.DBG_DrawConstraintLimits;
    }
    if (this._debugDrawFlags & EPhysicsDrawFlags.AABB) {
      btDrawMode |= EBulletDebugDrawModes.DBG_DrawAabb;
    }
    bt.DebugDraw_setDebugMode(this._debugDraw, btDrawMode);
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
  _proto.onDebugDrawLine = function onDebugDrawLine(from, to, color) {
    var debugRenderer = this._getDebugRenderer();
    if (debugRenderer && this._debugLineCount < this._MAX_DEBUG_LINE_COUNT) {
      this._debugLineCount++;
      bullet2CocosVec3(v3_0$3, from);
      bullet2CocosVec3(v3_1$1, to);
      bullet2CocosVec3(v3_2, color);
      c_0.set(v3_2.x * 255, v3_2.y * 255, v3_2.z * 255, 255);
      debugRenderer.addLine(v3_0$3, v3_1$1, c_0);
    }
  };
  _proto.onClearLines = function onClearLines() {
    this._debugLineCount = 0;
  };
  return _createClass(BulletWorld, [{
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
      if (this._debugDraw) {
        this._setDebugDrawMode();
      }
    }
  }, {
    key: "debugDrawConstraintSize",
    get: function get() {
      return this._debugConstraintSize;
    },
    set: function set(v) {
      this._debugConstraintSize = v;
      for (var i = 0; i < this.constraints.length; i++) {
        this.constraints[i].updateDebugDrawSize();
      }
    }
  }]);
}();
BulletWorld._sweepBoxGeometry = void 0;
BulletWorld._sweepSphereGeometry = void 0;
BulletWorld._sweepCapsuleGeometry = void 0;

var BulletBoxShape = function (_BulletShape) {
  function BulletBoxShape() {
    return _BulletShape.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletBoxShape, _BulletShape);
  var _proto = BulletBoxShape.prototype;
  _proto.updateSize = function updateSize() {
    var hf = BulletCache.instance.BT_V3_0;
    cocos2BulletVec3(hf, this.getMinUnscaledHalfExtents(VEC3_0));
    bt.BoxShape_setUnscaledHalfExtents(this.impl, hf);
    this.updateCompoundTransform();
  };
  _proto.onComponentSet = function onComponentSet() {
    var hf = BulletCache.instance.BT_V3_0;
    cocos2BulletVec3(hf, this.getMinUnscaledHalfExtents(VEC3_0));
    this._impl = bt.BoxShape_new(hf);
    this.updateScale();
  };
  _proto.updateScale = function updateScale() {
    _BulletShape.prototype.updateScale.call(this);
    var bt_v3 = BulletCache.instance.BT_V3_0;
    bt.CollisionShape_setLocalScaling(this._impl, cocos2BulletVec3(bt_v3, this.getMinScale(VEC3_0)));
    this.updateCompoundTransform();
  };
  _proto.getMinUnscaledHalfExtents = function getMinUnscaledHalfExtents(out) {
    var size = this.collider.size;
    var ws = absolute(VEC3_0.set(this._collider.node.worldScale));
    var minVolumeSize = PhysicsSystem.instance.minVolumeSize;
    var halfSizeX = size.x / 2;
    var halfSizeY = size.y / 2;
    var halfSizeZ = size.z / 2;
    var halfX = halfSizeX * ws.x < minVolumeSize ? minVolumeSize / ws.x : halfSizeX;
    var halfY = halfSizeY * ws.y < minVolumeSize ? minVolumeSize / ws.y : halfSizeY;
    var halfZ = halfSizeZ * ws.z < minVolumeSize ? minVolumeSize / ws.z : halfSizeZ;
    out.set(halfX, halfY, halfZ);
    return out;
  };
  _proto.getMinScale = function getMinScale(out) {
    var size = this.collider.size;
    var ws = absolute(VEC3_0.set(this._collider.node.worldScale));
    var minVolumeSize = PhysicsSystem.instance.minVolumeSize;
    var halfSizeX = size.x / 2;
    var halfSizeY = size.y / 2;
    var halfSizeZ = size.z / 2;
    var scaleX = halfSizeX * ws.x < minVolumeSize ? minVolumeSize / halfSizeX : ws.x;
    var scaleY = halfSizeY * ws.y < minVolumeSize ? minVolumeSize / halfSizeY : ws.y;
    var scaleZ = halfSizeZ * ws.z < minVolumeSize ? minVolumeSize / halfSizeZ : ws.z;
    out.set(scaleX, scaleY, scaleZ);
    return out;
  };
  return _createClass(BulletBoxShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletSphereShape = function (_BulletShape) {
  function BulletSphereShape() {
    return _BulletShape.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletSphereShape, _BulletShape);
  var _proto = BulletSphereShape.prototype;
  _proto.updateRadius = function updateRadius() {
    bt.SphereShape_setUnscaledRadius(this.impl, this.getMinUnscaledRadius());
    this.updateCompoundTransform();
  };
  _proto.onComponentSet = function onComponentSet() {
    this._impl = bt.SphereShape_new(this.getMinUnscaledRadius());
    this.updateScale();
  };
  _proto.updateScale = function updateScale() {
    _BulletShape.prototype.updateScale.call(this);
    var scale = this.getMinScale();
    CC_V3_0.set(scale, scale, scale);
    var bt_v3 = BulletCache.instance.BT_V3_0;
    bt.CollisionShape_setLocalScaling(this._impl, cocos2BulletVec3(bt_v3, CC_V3_0));
    this.updateCompoundTransform();
  };
  _proto.getMinUnscaledRadius = function getMinUnscaledRadius() {
    var radius = this.collider.radius;
    var ws = Math.abs(absMaxComponent(this._collider.node.worldScale));
    var minVolumeSize = PhysicsSystem.instance.minVolumeSize;
    return ws * radius < minVolumeSize ? minVolumeSize / ws : radius;
  };
  _proto.getMinScale = function getMinScale() {
    var radius = this.collider.radius;
    var ws = Math.abs(absMaxComponent(this._collider.node.worldScale));
    var minVolumeSize = PhysicsSystem.instance.minVolumeSize;
    return ws * radius < minVolumeSize ? minVolumeSize / radius : ws;
  };
  return _createClass(BulletSphereShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletCapsuleShape = function (_BulletShape) {
  function BulletCapsuleShape() {
    return _BulletShape.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletCapsuleShape, _BulletShape);
  var _proto = BulletCapsuleShape.prototype;
  _proto.setCylinderHeight = function setCylinderHeight(v) {
    this.updateProperties(this.collider.radius, this.collider.cylinderHeight, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.setDirection = function setDirection(v) {
    this.updateProperties(this.collider.radius, this.collider.cylinderHeight, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.setRadius = function setRadius(v) {
    this.updateProperties(this.collider.radius, this.collider.cylinderHeight, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.onComponentSet = function onComponentSet() {
    this._impl = bt.CapsuleShape_new(0.5, 1);
    this.setRadius(this.collider.radius);
  };
  _proto.updateScale = function updateScale() {
    _BulletShape.prototype.updateScale.call(this);
    this.setRadius(this.collider.radius);
  };
  _proto.updateProperties = function updateProperties(radius, height, direction, scale) {
    var ws = scale;
    var upAxis = direction;
    var wr;
    var halfH;
    if (upAxis === 1) {
      wr = radius * Math.abs(absMax(ws.x, ws.z));
      halfH = height / 2 * Math.abs(ws.y);
    } else if (upAxis === 0) {
      wr = radius * Math.abs(absMax(ws.y, ws.z));
      halfH = height / 2 * Math.abs(ws.x);
    } else {
      wr = radius * Math.abs(absMax(ws.x, ws.y));
      halfH = height / 2 * Math.abs(ws.z);
    }
    bt.CapsuleShape_updateProp(this._impl, wr, halfH, upAxis);
    this.updateCompoundTransform();
  };
  return _createClass(BulletCapsuleShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletBvhTriangleMeshShape = function () {
  function BulletBvhTriangleMeshShape(key, mesh) {
    this.key = void 0;
    this.ref = 0;
    this.bulletBvhTriangleMeshShapePtr = void 0;
    this.btTriangleMeshPtr = 0;
    this.reference = true;
    this.key = key;
    this.btTriangleMeshPtr = bt.TriangleMesh_new();
    cocos2BulletTriMesh(this.btTriangleMeshPtr, mesh);
    this.bulletBvhTriangleMeshShapePtr = bt.BvhTriangleMeshShape_new(this.btTriangleMeshPtr, true, true);
  }
  BulletBvhTriangleMeshShape.getBulletBvhTriangleMeshShape = function getBulletBvhTriangleMeshShape(key, mesh) {
    var newBulletBvhTriangleMeshShape;
    if (BulletBvhTriangleMeshShape.BulletBvhTriangleMeshShapeMap.has(key)) {
      newBulletBvhTriangleMeshShape = BulletBvhTriangleMeshShape.BulletBvhTriangleMeshShapeMap.get(key);
      newBulletBvhTriangleMeshShape.reference = true;
    } else {
      newBulletBvhTriangleMeshShape = new BulletBvhTriangleMeshShape(key, mesh);
      BulletBvhTriangleMeshShape.BulletBvhTriangleMeshShapeMap.set(key, newBulletBvhTriangleMeshShape);
    }
    return newBulletBvhTriangleMeshShape;
  };
  var _proto = BulletBvhTriangleMeshShape.prototype;
  _proto.destroy = function destroy() {
    if (this.bulletBvhTriangleMeshShapePtr) {
      bt._safe_delete(this.bulletBvhTriangleMeshShapePtr, EBulletType.EBulletTypeCollisionShape);
    }
    if (this.btTriangleMeshPtr) {
      bt._safe_delete(this.btTriangleMeshPtr, EBulletType.EBulletTypeTriangleMesh);
    }
    BulletBvhTriangleMeshShape.BulletBvhTriangleMeshShapeMap["delete"](this.key);
  };
  return _createClass(BulletBvhTriangleMeshShape, [{
    key: "reference",
    set: function set(v) {
      v ? this.ref++ : this.ref--;
      if (this.ref === 0) {
        this.destroy();
      }
    }
  }]);
}();
BulletBvhTriangleMeshShape.BulletBvhTriangleMeshShapeMap = new Map();

var BulletTrimeshShape = function (_BulletShape) {
  function BulletTrimeshShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BulletShape.call.apply(_BulletShape, [this].concat(args)) || this;
    _this.btBVHMeshShape = null;
    _this.refBtTriangleMesh = 0;
    return _this;
  }
  _inheritsLoose(BulletTrimeshShape, _BulletShape);
  var _proto = BulletTrimeshShape.prototype;
  _proto.setMesh = function setMesh(v) {
    if (!this._isInitialized) return;
    if (this._impl && BulletCache.isNotEmptyShape(this._impl)) {
      if (this._compound) {
        bt.CompoundShape_removeChildShape(this._compound, this._impl);
      }
      bt._safe_delete(this._impl, EBulletType.EBulletTypeCollisionShape);
      BulletCache.delWrapper(this._impl, BulletShape.TYPE);
      this._impl = 0;
    }
    var mesh = v;
    if (mesh && mesh.renderingSubMeshes.length > 0) {
      if (this.collider.convex) {
        var btTriangleMesh = this._getBtTriangleMesh(mesh);
        this._impl = bt.ConvexTriangleMeshShape_new(btTriangleMesh);
      } else {
        this.btBVHMeshShape = BulletBvhTriangleMeshShape.getBulletBvhTriangleMeshShape(mesh.hash, mesh);
        this._impl = bt.ScaledBvhTriangleMeshShape_new(this.btBVHMeshShape.bulletBvhTriangleMeshShapePtr, 1, 1, 1);
      }
      var bt_v3 = BulletCache.instance.BT_V3_0;
      cocos2BulletVec3(bt_v3, this._collider.node.worldScale);
      bt.CollisionShape_setLocalScaling(this._impl, bt_v3);
      bt.CollisionShape_setMargin(this._impl, 0.01);
      this.setCompound(this._compound);
      this.updateByReAdd();
      this.setWrapper();
    } else {
      this._impl = bt.EmptyShape_static();
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    this.setMesh(this.collider.mesh);
  };
  _proto.onDestroy = function onDestroy() {
    if (this.collider.convex) {
      if (this.refBtTriangleMesh) {
        bt._safe_delete(this.refBtTriangleMesh, EBulletType.EBulletTypeTriangleMesh);
      }
    } else if (this.btBVHMeshShape) {
      this.btBVHMeshShape.reference = false;
    }
    _BulletShape.prototype.onDestroy.call(this);
  };
  _proto.updateScale = function updateScale() {
    _BulletShape.prototype.updateScale.call(this);
    var bt_v3 = BulletCache.instance.BT_V3_0;
    cocos2BulletVec3(bt_v3, this._collider.node.worldScale);
    bt.CollisionShape_setLocalScaling(this._impl, bt_v3);
    this.updateCompoundTransform();
  };
  _proto._getBtTriangleMesh = function _getBtTriangleMesh(mesh) {
    this.refBtTriangleMesh = bt.TriangleMesh_new();
    cocos2BulletTriMesh(this.refBtTriangleMesh, mesh);
    return this.refBtTriangleMesh;
  };
  return _createClass(BulletTrimeshShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletCylinderShape = function (_BulletShape) {
  function BulletCylinderShape() {
    return _BulletShape.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletCylinderShape, _BulletShape);
  var _proto = BulletCylinderShape.prototype;
  _proto.setHeight = function setHeight(v) {
    this.updateProperties(this.collider.radius, this.collider.height, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.setDirection = function setDirection(v) {
    this.updateProperties(this.collider.radius, this.collider.height, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.setRadius = function setRadius(v) {
    this.updateProperties(this.collider.radius, this.collider.height, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.onComponentSet = function onComponentSet() {
    var bt_v3 = BulletCache.instance.BT_V3_0;
    bt.Vec3_set(bt_v3, 0.5, 1, 0.5);
    this._impl = bt.CylinderShape_new(bt_v3);
    this.setRadius(this.collider.radius);
  };
  _proto.updateScale = function updateScale() {
    _BulletShape.prototype.updateScale.call(this);
    this.setRadius(this.collider.radius);
  };
  _proto.updateProperties = function updateProperties(radius, height, direction, scale) {
    var ws = scale;
    var upAxis = direction;
    var wr;
    var wh;
    if (upAxis === 1) {
      wh = height * Math.abs(ws.y);
      wr = radius * Math.abs(absMax(ws.x, ws.z));
    } else if (upAxis === 0) {
      wh = height * Math.abs(ws.x);
      wr = radius * Math.abs(absMax(ws.y, ws.z));
    } else {
      wh = height * Math.abs(ws.z);
      wr = radius * Math.abs(absMax(ws.x, ws.y));
    }
    bt.CylinderShape_updateProp(this._impl, wr, wh / 2, upAxis);
    this.updateCompoundTransform();
  };
  return _createClass(BulletCylinderShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletConeShape = function (_BulletShape) {
  function BulletConeShape() {
    return _BulletShape.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletConeShape, _BulletShape);
  var _proto = BulletConeShape.prototype;
  _proto.setHeight = function setHeight(v) {
    this.updateProperties(this.collider.radius, this.collider.height, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.setDirection = function setDirection(v) {
    this.updateProperties(this.collider.radius, this.collider.height, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.setRadius = function setRadius(v) {
    this.updateProperties(this.collider.radius, this.collider.height, this.collider.direction, this._collider.node.worldScale);
  };
  _proto.onComponentSet = function onComponentSet() {
    this._impl = bt.ConeShape_new(0.5, 1);
    this.setRadius(this.collider.radius);
  };
  _proto.updateScale = function updateScale() {
    _BulletShape.prototype.updateScale.call(this);
    this.setRadius(this.collider.radius);
  };
  _proto.updateProperties = function updateProperties(radius, height, direction, scale) {
    var ws = scale;
    var upAxis = direction;
    var wr;
    var wh;
    if (upAxis === 1) {
      wh = height * Math.abs(ws.y);
      wr = radius * Math.abs(absMax(ws.x, ws.z));
    } else if (upAxis === 0) {
      wh = height * Math.abs(ws.x);
      wr = radius * Math.abs(absMax(ws.y, ws.z));
    } else {
      wh = height * Math.abs(ws.z);
      wr = radius * Math.abs(absMax(ws.x, ws.y));
    }
    bt.ConeShape_setRadius(this._impl, wr);
    bt.ConeShape_setHeight(this._impl, wh);
    bt.ConeShape_setConeUpIndex(this._impl, upAxis);
    var bt_v3 = BulletCache.instance.BT_V3_0;
    bt.Vec3_set(bt_v3, 1, 1, 1);
    bt.CollisionShape_setLocalScaling(this._impl, bt_v3);
    this.updateCompoundTransform();
  };
  return _createClass(BulletConeShape, [{
    key: "impl",
    get: function get() {
      return this._impl;
    }
  }, {
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletTerrainShape = function (_BulletShape) {
  function BulletTerrainShape() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _BulletShape.call.apply(_BulletShape, [this].concat(args)) || this;
    _this._bufPtr = 0;
    _this._tileSize = 0;
    _this._localOffset = new Vec3();
    return _this;
  }
  _inheritsLoose(BulletTerrainShape, _BulletShape);
  var _proto = BulletTerrainShape.prototype;
  _proto.setTerrain = function setTerrain(v) {
    if (!this._isInitialized) return;
    if (this._impl && BulletCache.isNotEmptyShape(this._impl)) {
      warn('[Physics][Bullet]: change the terrain asset after initialization is not support.');
    } else {
      var terrain = v;
      if (terrain) {
        this._tileSize = terrain.tileSize;
        var sizeI = terrain.getVertexCountI();
        var sizeJ = terrain.getVertexCountJ();
        this._bufPtr = bt._malloc(4 * sizeI * sizeJ);
        var offset = 0;
        var min = Number.MAX_SAFE_INTEGER;
        var max = Number.MIN_SAFE_INTEGER;
        for (var j = 0; j < sizeJ; j++) {
          for (var i = 0; i < sizeI; i++) {
            var _v = terrain.getHeight(i, j);
            bt._write_f32(this._bufPtr + offset, _v);
            if (min > _v) min = _v;
            if (_v > max) max = _v;
            offset += 4;
          }
        }
        max += 0.01;
        min -= 0.01;
        this._localOffset.set((sizeI - 1) / 2 * this._tileSize, (max + min) / 2, (sizeJ - 1) / 2 * this._tileSize);
        this._impl = bt.TerrainShape_new(sizeI, sizeJ, this._bufPtr, 1, min, max);
        var bt_v3 = BulletCache.instance.BT_V3_0;
        bt.Vec3_set(bt_v3, this._tileSize, 1, this._tileSize);
        bt.CollisionShape_setLocalScaling(this._impl, bt_v3);
        this.setCompound(this._compound);
        this.updateByReAdd();
        this.setWrapper();
      } else {
        this._impl = bt.EmptyShape_static();
      }
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    this.setTerrain(this.collider.terrain);
  };
  _proto.onDestroy = function onDestroy() {
    if (this._bufPtr) bt._free(this._bufPtr);
    _BulletShape.prototype.onDestroy.call(this);
  };
  _proto.setCenter = function setCenter(v) {
    Vec3.copy(CC_V3_0, v);
    CC_V3_0.add(this._localOffset);
    cocos2BulletVec3(bt.Transform_getOrigin(this.transform), CC_V3_0);
    this.updateCompoundTransform();
  };
  return _createClass(BulletTerrainShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletSimplexShape = function (_BulletShape) {
  function BulletSimplexShape() {
    return _BulletShape.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletSimplexShape, _BulletShape);
  var _proto = BulletSimplexShape.prototype;
  _proto.setShapeType = function setShapeType(v) {};
  _proto.setVertices = function setVertices(v) {};
  _proto.onComponentSet = function onComponentSet() {
    this._impl = bt.SimplexShape_new();
    var length = this.collider.shapeType;
    var vertices = this.collider.vertices;
    var bt_v3 = BulletCache.instance.BT_V3_0;
    for (var i = 0; i < length; i++) {
      bt.SimplexShape_addVertex(this._impl, cocos2BulletVec3(bt_v3, vertices[i]));
    }
    bt.CollisionShape_setLocalScaling(this._impl, cocos2BulletVec3(bt_v3, this._collider.node.worldScale));
  };
  _proto.onLoad = function onLoad() {
    _BulletShape.prototype.onLoad.call(this);
    this.collider.updateVertices();
  };
  _proto.updateScale = function updateScale() {
    _BulletShape.prototype.updateScale.call(this);
    var bt_v3 = BulletCache.instance.BT_V3_0;
    bt.CollisionShape_setLocalScaling(this._impl, cocos2BulletVec3(bt_v3, this._collider.node.worldScale));
  };
  return _createClass(BulletSimplexShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletPlaneShape = function (_BulletShape) {
  function BulletPlaneShape() {
    return _BulletShape.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletPlaneShape, _BulletShape);
  var _proto = BulletPlaneShape.prototype;
  _proto.setNormal = function setNormal(v) {
    cocos2BulletVec3(bt.StaticPlaneShape_getPlaneNormal(this.impl), v);
    this.updateCompoundTransform();
  };
  _proto.setConstant = function setConstant(v) {
    bt.StaticPlaneShape_setPlaneConstant(this.impl, v);
    this.updateCompoundTransform();
  };
  _proto.updateScale = function updateScale() {
    _BulletShape.prototype.updateScale.call(this);
    var bt_v3 = BulletCache.instance.BT_V3_0;
    cocos2BulletVec3(bt_v3, this._collider.node.worldScale);
    bt.CollisionShape_setLocalScaling(this._impl, bt_v3);
    this.updateCompoundTransform();
  };
  _proto.onComponentSet = function onComponentSet() {
    var normal = BulletCache.instance.BT_V3_0;
    cocos2BulletVec3(normal, this.collider.normal);
    this._impl = bt.StaticPlaneShape_new(normal, this.collider.constant);
    this.updateScale();
  };
  return _createClass(BulletPlaneShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(BulletShape);

var BulletConstraint = function () {
  function BulletConstraint() {
    this.dirty = 0;
    this.index = -1;
    this._impl = 0;
    this._com = void 0;
    this._rigidBody = void 0;
    this._connectedBody = null;
    this._collided = false;
  }
  var _proto = BulletConstraint.prototype;
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
      bt._safe_delete(this._impl, EBulletType.EBulletTypeTypedConstraint);
    }
    this._connectedBody = v;
    var connect = this._connectedBody;
    this.onComponentSet();
    this.setEnableCollision(this._collided);
    sb.wrappedWorld.addConstraint(this);
    sb.addJoint(this, 0);
    if (connect) {
      var sb2 = connect.body.sharedBody;
      sb2.addJoint(this, 1);
    }
  };
  _proto.setEnableCollision = function setEnableCollision(v) {
    if (this._collided !== v) {
      this._collided = v;
      this.updateByReAdd();
    }
  };
  _proto.updateByReAdd = function updateByReAdd() {
    if (this._rigidBody && this.index >= 0) {
      var sb = this._rigidBody.body.sharedBody;
      sb.wrappedWorld.removeConstraint(this);
      sb.wrappedWorld.addConstraint(this);
    }
  };
  _proto.initialize = function initialize(v) {
    this._com = v;
    this._rigidBody = v.attachedBody;
    this._connectedBody = v.connectedBody;
    this._collided = v.enableCollision;
    this.onComponentSet();
    this.setEnableCollision(this._collided);
  };
  _proto.updateDebugDrawSize = function updateDebugDrawSize() {
    if (this.impl) {
      var size = PhysicsSystem.instance.physicsWorld.debugDrawConstraintSize;
      bt.TypedConstraint_setDbgDrawSize(this.impl, size);
    }
  };
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
    bt._safe_delete(this._impl, EBulletType.EBulletTypeTypedConstraint);
    this._com = null;
    this._rigidBody = null;
    this._connectedBody = null;
  };
  return _createClass(BulletConstraint, [{
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

var BulletP2PConstraint = function (_BulletConstraint) {
  function BulletP2PConstraint() {
    return _BulletConstraint.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletP2PConstraint, _BulletConstraint);
  var _proto = BulletP2PConstraint.prototype;
  _proto.setPivotA = function setPivotA(v) {
    var cs = this.constraint;
    var pivotA = BulletCache.instance.BT_V3_0;
    Vec3.multiply(CC_V3_0, cs.node.worldScale, cs.pivotA);
    cocos2BulletVec3(pivotA, CC_V3_0);
    bt.P2PConstraint_setPivotA(this._impl, pivotA);
    if (!cs.connectedBody) this.setPivotB(cs.pivotB);
  };
  _proto.setPivotB = function setPivotB(v) {
    var cs = this.constraint;
    var node = this._rigidBody.node;
    var pivotB = BulletCache.instance.BT_V3_0;
    var cb = cs.connectedBody;
    if (cb) {
      Vec3.multiply(CC_V3_0, cb.node.worldScale, cs.pivotB);
      cocos2BulletVec3(pivotB, CC_V3_0);
    } else {
      Vec3.multiply(CC_V3_0, node.worldScale, cs.pivotA);
      Vec3.transformQuat(CC_V3_0, CC_V3_0, node.worldRotation);
      Vec3.add(CC_V3_0, CC_V3_0, node.worldPosition);
      cocos2BulletVec3(pivotB, CC_V3_0);
    }
    bt.P2PConstraint_setPivotB(this._impl, pivotB);
  };
  _proto.onComponentSet = function onComponentSet() {
    var cb = this.constraint.connectedBody;
    var bodyA = this._rigidBody.body.impl;
    var bodyB = cb ? cb.body.impl : bt.TypedConstraint_getFixedBody();
    var pivotA = BulletCache.instance.BT_V3_0;
    var pivotB = BulletCache.instance.BT_V3_1;
    this._impl = bt.P2PConstraint_new(bodyA, bodyB, pivotA, pivotB);
    this.setPivotA(this.constraint.pivotA);
    this.setPivotB(this.constraint.pivotB);
    this.updateDebugDrawSize();
  };
  _proto.updateScale0 = function updateScale0() {
    this.setPivotA(this.constraint.pivotA);
  };
  _proto.updateScale1 = function updateScale1() {
    this.setPivotB(this.constraint.pivotB);
  };
  return _createClass(BulletP2PConstraint, [{
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(BulletConstraint);

var BulletFixedConstraint = function (_BulletConstraint) {
  function BulletFixedConstraint() {
    return _BulletConstraint.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletFixedConstraint, _BulletConstraint);
  var _proto = BulletFixedConstraint.prototype;
  _proto.setBreakForce = function setBreakForce(v) {
    bt.TypedConstraint_setMaxImpulseThreshold(this._impl, v);
  };
  _proto.setBreakTorque = function setBreakTorque(v) {};
  _proto.onComponentSet = function onComponentSet() {
    var cb = this.constraint.connectedBody;
    var bodyA = this._rigidBody.body.impl;
    var bodyB = cb ? cb.body.impl : bt.TypedConstraint_getFixedBody();
    var trans0 = BulletCache.instance.BT_TRANSFORM_0;
    var trans1 = BulletCache.instance.BT_TRANSFORM_1;
    this._impl = bt.FixedConstraint_new(bodyA, bodyB, trans0, trans1);
    this.setBreakForce(this.constraint.breakForce);
    this.setBreakTorque(this.constraint.breakTorque);
    this.updateFrames();
    this.updateDebugDrawSize();
  };
  _proto.updateFrames = function updateFrames() {
    var cb = this.constraint.connectedBody;
    var bodyA = this._rigidBody.body.sharedBody;
    var pos = CC_V3_0;
    var rot = CC_QUAT_0;
    var trans0 = bt.Transform_new();
    var trans1 = bt.Transform_new();
    var quat = bt.Quat_new(0, 0, 0, 1);
    var trans = CC_MAT4_0;
    Mat4.fromRT(trans, bodyA.node.worldRotation, bodyA.node.worldPosition);
    Mat4.invert(trans, trans);
    Mat4.getRotation(rot, trans);
    Mat4.getTranslation(pos, trans);
    cocos2BulletVec3(bt.Transform_getOrigin(trans0), pos);
    cocos2BulletQuat(quat, rot);
    bt.Transform_setRotation(trans0, quat);
    if (cb) {
      var bodyB = cb.body.sharedBody;
      Mat4.fromRT(trans, bodyB.node.worldRotation, bodyB.node.worldPosition);
      Mat4.invert(trans, trans);
      Mat4.getRotation(rot, trans);
      Mat4.getTranslation(pos, trans);
      cocos2BulletVec3(bt.Transform_getOrigin(trans1), pos);
      cocos2BulletQuat(quat, rot);
      bt.Transform_setRotation(trans1, quat);
    } else {
      bt.Transform_setIdentity(trans1);
    }
    bt.FixedConstraint_setFrames(this._impl, trans0, trans1);
    bt._safe_delete(trans0, EBulletType.EBulletTypeTransform);
    bt._safe_delete(trans1, EBulletType.EBulletTypeTransform);
    bt._safe_delete(quat, EBulletType.EBulletTypeQuat);
  };
  _proto.updateScale0 = function updateScale0() {
    this.updateFrames();
  };
  _proto.updateScale1 = function updateScale1() {
    this.updateFrames();
  };
  return _createClass(BulletFixedConstraint, [{
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(BulletConstraint);

var BulletHingeConstraint = function (_BulletConstraint) {
  function BulletHingeConstraint() {
    return _BulletConstraint.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletHingeConstraint, _BulletConstraint);
  var _proto = BulletHingeConstraint.prototype;
  _proto.setPivotA = function setPivotA(v) {
    this.updateFrames();
  };
  _proto.setPivotB = function setPivotB(v) {
    this.updateFrames();
  };
  _proto.setAxis = function setAxis(v) {
    this.updateFrames();
  };
  _proto.setLimitEnabled = function setLimitEnabled(v) {
    if (this.constraint.limitEnabled) {
      bt.HingeConstraint_setLimit(this._impl, toRadian(this.constraint.lowerLimit), toRadian(this.constraint.upperLimit), 0.9, 0.3, 1.0);
    } else {
      bt.HingeConstraint_setLimit(this._impl, 1, 0, 0.9, 0.3, 1.0);
    }
  };
  _proto.setLowerLimit = function setLowerLimit(min) {
    if (this.constraint.limitEnabled) {
      bt.HingeConstraint_setLimit(this._impl, toRadian(this.constraint.lowerLimit), toRadian(this.constraint.upperLimit), 0.9, 0.3, 1.0);
    }
  };
  _proto.setUpperLimit = function setUpperLimit(max) {
    if (this.constraint.limitEnabled) {
      bt.HingeConstraint_setLimit(this._impl, toRadian(this.constraint.lowerLimit), toRadian(this.constraint.upperLimit), 0.9, 0.3, 1.0);
    }
  };
  _proto.setMotorEnabled = function setMotorEnabled(v) {
    bt.HingeConstraint_enableMotor(this._impl, v);
    var velocity = -this.constraint.motorVelocity / 60.0;
    var impulse = force2Impulse(this.constraint.motorForceLimit, PhysicsSystem.instance.fixedTimeStep);
    bt.HingeConstraint_setMotorVelocity(this._impl, velocity);
    bt.HingeConstraint_setMaxMotorImpulse(this._impl, impulse);
  };
  _proto.setMotorVelocity = function setMotorVelocity(v) {
    if (this.constraint.motorEnabled) {
      var velocity = -v / 60.0;
      bt.HingeConstraint_setMotorVelocity(this._impl, velocity);
    }
  };
  _proto.setMotorForceLimit = function setMotorForceLimit(v) {
    if (this.constraint.motorEnabled) {
      var impulse = force2Impulse(v, PhysicsSystem.instance.fixedTimeStep);
      bt.HingeConstraint_setMaxMotorImpulse(this._impl, impulse);
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    var cb = this.constraint.connectedBody;
    var bodyA = this._rigidBody.body.impl;
    var bodyB = cb ? cb.body.impl : bt.TypedConstraint_getFixedBody();
    var trans0 = BulletCache.instance.BT_TRANSFORM_0;
    var trans1 = BulletCache.instance.BT_TRANSFORM_1;
    this._impl = bt.HingeConstraint_new(bodyA, bodyB, trans0, trans1);
    this.setLimitEnabled(this.constraint.limitEnabled);
    this.setLowerLimit(this.constraint.lowerLimit);
    this.setUpperLimit(this.constraint.upperLimit);
    this.setMotorEnabled(this.constraint.motorEnabled);
    this.setMotorVelocity(this.constraint.motorVelocity);
    this.setMotorForceLimit(this.constraint.motorForceLimit);
    this.updateFrames();
    this.updateDebugDrawSize();
  };
  _proto.updateFrames = function updateFrames() {
    var cs = this.constraint;
    var node = cs.node;
    var v3_0 = CC_V3_0;
    var rot_0 = CC_QUAT_0;
    var rot_1 = CC_QUAT_1;
    var trans0 = BulletCache.instance.BT_TRANSFORM_0;
    Vec3.multiply(v3_0, node.worldScale, cs.pivotA);
    cocos2BulletVec3(bt.Transform_getOrigin(trans0), v3_0);
    var quat = BulletCache.instance.BT_QUAT_0;
    Vec3.normalize(v3_0, cs.axis);
    Quat.rotationTo(rot_1, Vec3.UNIT_Z, v3_0);
    cocos2BulletQuat(quat, rot_1);
    bt.Transform_setRotation(trans0, quat);
    var trans1 = BulletCache.instance.BT_TRANSFORM_1;
    var cb = this.constraint.connectedBody;
    if (cb) {
      Vec3.multiply(v3_0, cb.node.worldScale, cs.pivotB);
      Quat.multiply(rot_1, node.worldRotation, rot_1);
      Quat.invert(rot_0, cb.node.worldRotation);
      Quat.multiply(rot_1, rot_0, rot_1);
    } else {
      Vec3.multiply(v3_0, node.worldScale, cs.pivotA);
      Vec3.transformQuat(v3_0, v3_0, node.worldRotation);
      Vec3.add(v3_0, v3_0, node.worldPosition);
      Quat.multiply(rot_1, node.worldRotation, rot_1);
    }
    cocos2BulletVec3(bt.Transform_getOrigin(trans1), v3_0);
    cocos2BulletQuat(quat, rot_1);
    bt.Transform_setRotation(trans1, quat);
    bt.HingeConstraint_setFrames(this._impl, trans0, trans1);
  };
  _proto.updateScale0 = function updateScale0() {
    this.updateFrames();
  };
  _proto.updateScale1 = function updateScale1() {
    this.updateFrames();
  };
  return _createClass(BulletHingeConstraint, [{
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(BulletConstraint);

var RotateOrder;
(function (RotateOrder) {
  RotateOrder[RotateOrder["RO_XYZ"] = 0] = "RO_XYZ";
  RotateOrder[RotateOrder["RO_XZY"] = 1] = "RO_XZY";
  RotateOrder[RotateOrder["RO_YXZ"] = 2] = "RO_YXZ";
  RotateOrder[RotateOrder["RO_YZX"] = 3] = "RO_YZX";
  RotateOrder[RotateOrder["RO_ZXY"] = 4] = "RO_ZXY";
  RotateOrder[RotateOrder["RO_ZYX"] = 5] = "RO_ZYX";
})(RotateOrder || (RotateOrder = {}));
var BulletDofAxis;
(function (BulletDofAxis) {
  BulletDofAxis[BulletDofAxis["X"] = 0] = "X";
  BulletDofAxis[BulletDofAxis["Y"] = 1] = "Y";
  BulletDofAxis[BulletDofAxis["Z"] = 2] = "Z";
  BulletDofAxis[BulletDofAxis["TWIST"] = 3] = "TWIST";
  BulletDofAxis[BulletDofAxis["SWING1"] = 4] = "SWING1";
  BulletDofAxis[BulletDofAxis["SWING2"] = 5] = "SWING2";
})(BulletDofAxis || (BulletDofAxis = {}));
var BulletConfigurableConstraint = function (_BulletConstraint) {
  function BulletConfigurableConstraint() {
    return _BulletConstraint.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletConfigurableConstraint, _BulletConstraint);
  var _proto = BulletConfigurableConstraint.prototype;
  _proto._setLimit = function _setLimit(v, axis, lower, upper) {
    switch (v) {
      case EConstraintMode.LOCKED:
        bt.Generic6DofSpring2Constraint_setLimit(this._impl, axis, 0, 0);
        break;
      case EConstraintMode.LIMITED:
        bt.Generic6DofSpring2Constraint_setLimit(this._impl, axis, lower, upper);
        break;
      case EConstraintMode.FREE:
        bt.Generic6DofSpring2Constraint_setLimit(this._impl, axis, 1, 0);
        break;
    }
  };
  _proto.setConstraintMode = function setConstraintMode(idx, v) {
    var ll = this.constraint.linearLimitSettings;
    var al = this.constraint.angularLimitSettings;
    var lowers = [0, 0, 0];
    var uppers = [0, 0, 0];
    var upper = 0;
    var lower = 0;
    switch (idx) {
      case 0:
      case 1:
      case 2:
        Vec3.toArray(lowers, ll.lower);
        Vec3.toArray(uppers, ll.upper);
        lower = lowers[idx];
        upper = uppers[idx];
        break;
      case 3:
        upper = toRadian(al.twistExtent) * 0.5;
        lower = -upper;
        break;
      case 4:
        upper = toRadian(al.swingExtent1) * 0.5;
        lower = -upper;
        break;
      case 5:
        upper = toRadian(al.swingExtent2) * 0.5;
        lower = -upper;
        break;
      default:
        error("idx should be in [0, 5], but give " + idx);
        break;
    }
    this._setLimit(v, idx, lower, upper);
  };
  _proto.setLinearLimit = function setLinearLimit(idx, lower, upper) {
    var cm = 0;
    var ll = this.constraint.linearLimitSettings;
    switch (idx) {
      case 0:
        cm = ll.xMotion;
        break;
      case 1:
        cm = ll.yMotion;
        break;
      case 2:
        cm = ll.zMotion;
        break;
    }
    this._setLimit(cm, idx, lower, upper);
  };
  _proto.setAngularExtent = function setAngularExtent(twist, swing1, swing2) {
    var al = this.constraint.angularLimitSettings;
    this._setLimit(al.twistMotion, BulletDofAxis.TWIST, -toRadian(twist) * 0.5, toRadian(twist) * 0.5);
    this._setLimit(al.swingMotion1, BulletDofAxis.SWING1, -toRadian(swing1) * 0.5, toRadian(swing1) * 0.5);
    this._setLimit(al.swingMotion2, BulletDofAxis.SWING2, -toRadian(swing2) * 0.5, toRadian(swing2) * 0.5);
  };
  _proto.setSwingSoftConstraint = function setSwingSoftConstraint(v) {
    bt.Generic6DofSpring2Constraint_enableSpring(this._impl, BulletDofAxis.SWING1, v);
    bt.Generic6DofSpring2Constraint_enableSpring(this._impl, BulletDofAxis.SWING2, v);
  };
  _proto.setTwistSoftConstraint = function setTwistSoftConstraint(v) {
    bt.Generic6DofSpring2Constraint_enableSpring(this._impl, BulletDofAxis.TWIST, v);
  };
  _proto.setLinearSoftConstraint = function setLinearSoftConstraint(v) {
    bt.Generic6DofSpring2Constraint_enableSpring(this._impl, BulletDofAxis.X, v);
    bt.Generic6DofSpring2Constraint_enableSpring(this._impl, BulletDofAxis.Y, v);
    bt.Generic6DofSpring2Constraint_enableSpring(this._impl, BulletDofAxis.Z, v);
  };
  _proto.setLinearStiffness = function setLinearStiffness(v) {
    bt.Generic6DofSpring2Constraint_setStiffness(this._impl, BulletDofAxis.X, v);
    bt.Generic6DofSpring2Constraint_setStiffness(this._impl, BulletDofAxis.Y, v);
    bt.Generic6DofSpring2Constraint_setStiffness(this._impl, BulletDofAxis.Z, v);
  };
  _proto.setLinearDamping = function setLinearDamping(v) {
    bt.Generic6DofSpring2Constraint_setDamping(this._impl, BulletDofAxis.X, v);
    bt.Generic6DofSpring2Constraint_setDamping(this._impl, BulletDofAxis.Y, v);
    bt.Generic6DofSpring2Constraint_setDamping(this._impl, BulletDofAxis.Z, v);
  };
  _proto.setLinearRestitution = function setLinearRestitution(v) {
    bt.Generic6DofSpring2Constraint_setBounce(this._impl, BulletDofAxis.X, v);
    bt.Generic6DofSpring2Constraint_setBounce(this._impl, BulletDofAxis.Y, v);
    bt.Generic6DofSpring2Constraint_setBounce(this._impl, BulletDofAxis.Z, v);
  };
  _proto.setSwingStiffness = function setSwingStiffness(v) {
    bt.Generic6DofSpring2Constraint_setStiffness(this._impl, BulletDofAxis.SWING1, v);
    bt.Generic6DofSpring2Constraint_setStiffness(this._impl, BulletDofAxis.SWING2, v);
  };
  _proto.setSwingDamping = function setSwingDamping(v) {
    bt.Generic6DofSpring2Constraint_setDamping(this._impl, BulletDofAxis.SWING1, v);
    bt.Generic6DofSpring2Constraint_setDamping(this._impl, BulletDofAxis.SWING2, v);
  };
  _proto.setSwingRestitution = function setSwingRestitution(v) {
    bt.Generic6DofSpring2Constraint_setBounce(this._impl, BulletDofAxis.SWING1, v);
    bt.Generic6DofSpring2Constraint_setBounce(this._impl, BulletDofAxis.SWING2, v);
  };
  _proto.setTwistStiffness = function setTwistStiffness(v) {
    bt.Generic6DofSpring2Constraint_setStiffness(this._impl, BulletDofAxis.TWIST, v);
  };
  _proto.setTwistDamping = function setTwistDamping(v) {
    bt.Generic6DofSpring2Constraint_setDamping(this._impl, BulletDofAxis.TWIST, v);
  };
  _proto.setTwistRestitution = function setTwistRestitution(v) {
    bt.Generic6DofSpring2Constraint_setBounce(this._impl, BulletDofAxis.TWIST, v);
  };
  _proto.setDriverMode = function setDriverMode(idx, v) {
    if (v === EDriverMode.DISABLED) {
      bt.Generic6DofSpring2Constraint_enableMotor(this._impl, idx, false);
    } else if (v === EDriverMode.SERVO) {
      bt.Generic6DofSpring2Constraint_enableMotor(this._impl, idx, true);
      bt.Generic6DofSpring2Constraint_setServo(this._impl, idx, true);
    } else if (v === EDriverMode.INDUCTION) {
      bt.Generic6DofSpring2Constraint_enableMotor(this._impl, idx, true);
      bt.Generic6DofSpring2Constraint_setServo(this._impl, idx, false);
    }
  };
  _proto._updateMotorTargetAndVelocity = function _updateMotorTargetAndVelocity(index) {
    var mode = EDriverMode.DISABLED;
    var axis = 0;
    var target = 0;
    var velocity = 0;
    var ld = this.constraint.linearDriverSettings;
    var ad = this.constraint.angularDriverSettings;
    switch (index) {
      case 0:
        axis = BulletDofAxis.X;
        mode = ld.xDrive;
        target = ld.targetPosition.x;
        velocity = -ld.targetVelocity.x;
        break;
      case 1:
        axis = BulletDofAxis.Y;
        mode = ld.yDrive;
        target = ld.targetPosition.y;
        velocity = -ld.targetVelocity.y;
        break;
      case 2:
        axis = BulletDofAxis.Z;
        mode = ld.zDrive;
        target = ld.targetPosition.z;
        velocity = -ld.targetVelocity.z;
        break;
      case 3:
        axis = BulletDofAxis.TWIST;
        mode = ad.twistDrive;
        target = -toRadian(ad.targetOrientation.x);
        velocity = -toRadian(ad.targetVelocity.x);
        break;
      case 4:
        axis = BulletDofAxis.SWING1;
        mode = ad.swingDrive1;
        target = -toRadian(ad.targetOrientation.y);
        velocity = -toRadian(ad.targetVelocity.y);
        break;
      case 5:
        axis = BulletDofAxis.SWING2;
        mode = ad.swingDrive2;
        target = -toRadian(ad.targetOrientation.z);
        velocity = -toRadian(ad.targetVelocity.z);
        break;
    }
    var strength = index > 2 ? ad.strength : ld.strength;
    bt.Generic6DofSpring2Constraint_setServoTarget(this._impl, axis, target);
    if (mode === EDriverMode.SERVO) {
      if (index > 2) {
        bt.Generic6DofSpring2Constraint_setTargetVelocity(this._impl, axis, -target * strength * 0.1);
      } else {
        bt.Generic6DofSpring2Constraint_setTargetVelocity(this._impl, axis, target * strength * 0.1);
      }
    } else if (mode === EDriverMode.INDUCTION) {
      bt.Generic6DofSpring2Constraint_setTargetVelocity(this._impl, axis, velocity);
    }
  };
  _proto.setLinearMotorTarget = function setLinearMotorTarget(v) {
    this._updateMotorTargetAndVelocity(0);
    this._updateMotorTargetAndVelocity(1);
    this._updateMotorTargetAndVelocity(2);
  };
  _proto.setLinearMotorVelocity = function setLinearMotorVelocity(v) {
    this._updateMotorTargetAndVelocity(0);
    this._updateMotorTargetAndVelocity(1);
    this._updateMotorTargetAndVelocity(2);
  };
  _proto.setLinearMotorForceLimit = function setLinearMotorForceLimit(v) {
    bt.Generic6DofSpring2Constraint_setMaxMotorForce(this._impl, BulletDofAxis.X, v);
    bt.Generic6DofSpring2Constraint_setMaxMotorForce(this._impl, BulletDofAxis.Y, v);
    bt.Generic6DofSpring2Constraint_setMaxMotorForce(this._impl, BulletDofAxis.Z, v);
  };
  _proto.setAngularMotorTarget = function setAngularMotorTarget(v) {
    this._updateMotorTargetAndVelocity(3);
    this._updateMotorTargetAndVelocity(4);
    this._updateMotorTargetAndVelocity(5);
  };
  _proto.setAngularMotorVelocity = function setAngularMotorVelocity(v) {
    this._updateMotorTargetAndVelocity(3);
    this._updateMotorTargetAndVelocity(4);
    this._updateMotorTargetAndVelocity(5);
  };
  _proto.setAngularMotorForceLimit = function setAngularMotorForceLimit(v) {
    bt.Generic6DofSpring2Constraint_setMaxMotorForce(this._impl, BulletDofAxis.TWIST, v);
    bt.Generic6DofSpring2Constraint_setMaxMotorForce(this._impl, BulletDofAxis.SWING1, v);
    bt.Generic6DofSpring2Constraint_setMaxMotorForce(this._impl, BulletDofAxis.SWING2, v);
  };
  _proto.setPivotA = function setPivotA(v) {
    this.updateFrames();
  };
  _proto.setPivotB = function setPivotB(v) {
    this.updateFrames();
  };
  _proto.setAutoPivotB = function setAutoPivotB(v) {
    this.updateFrames();
  };
  _proto.setAxis = function setAxis(v) {
    this.updateFrames();
  };
  _proto.setSecondaryAxis = function setSecondaryAxis(v) {
    this.updateFrames();
  };
  _proto.setBreakForce = function setBreakForce(v) {
    var maxForce = Math.max(this.constraint.breakForce, this.constraint.breakTorque);
    var impulse = force2Impulse(maxForce, PhysicsSystem.instance.fixedTimeStep);
    bt.TypedConstraint_setMaxImpulseThreshold(this._impl, impulse);
  };
  _proto.setBreakTorque = function setBreakTorque(v) {
    var maxForce = Math.max(this.constraint.breakForce, this.constraint.breakTorque);
    var impulse = force2Impulse(maxForce, PhysicsSystem.instance.fixedTimeStep);
    bt.TypedConstraint_setMaxImpulseThreshold(this._impl, impulse);
  };
  _proto.onComponentSet = function onComponentSet() {
    var cb = this.constraint.connectedBody;
    var bodyA = this._rigidBody.body.impl;
    var bodyB = cb && cb.body.impl || bt.TypedConstraint_getFixedBody();
    var trans0 = BulletCache.instance.BT_TRANSFORM_0;
    var trans1 = BulletCache.instance.BT_TRANSFORM_1;
    this._impl = bt.Generic6DofSpring2Constraint_new(bodyA, bodyB, trans0, trans1, RotateOrder.RO_YZX);
    var linearLimit = this.constraint.linearLimitSettings;
    var angularLimit = this.constraint.angularLimitSettings;
    this.setConstraintMode(0, linearLimit.xMotion);
    this.setConstraintMode(1, linearLimit.yMotion);
    this.setConstraintMode(2, linearLimit.zMotion);
    this.setConstraintMode(3, angularLimit.twistMotion);
    this.setConstraintMode(4, angularLimit.swingMotion1);
    this.setConstraintMode(5, angularLimit.swingMotion2);
    this.setLinearSoftConstraint(linearLimit.enableSoftConstraint);
    this.setLinearStiffness(linearLimit.stiffness);
    this.setLinearDamping(linearLimit.damping);
    this.setLinearRestitution(linearLimit.restitution);
    this.setSwingSoftConstraint(angularLimit.enableSoftConstraintSwing);
    this.setSwingRestitution(angularLimit.swingRestitution);
    this.setSwingStiffness(angularLimit.swingStiffness);
    this.setSwingDamping(angularLimit.swingDamping);
    this.setTwistSoftConstraint(angularLimit.enableSoftConstraintTwist);
    this.setTwistRestitution(angularLimit.twistRestitution);
    this.setTwistStiffness(angularLimit.twistStiffness);
    this.setTwistDamping(angularLimit.twistDamping);
    var linearMotor = this.constraint.linearDriverSettings;
    var angularMotor = this.constraint.angularDriverSettings;
    this.setDriverMode(0, linearMotor.xDrive);
    this.setDriverMode(1, linearMotor.yDrive);
    this.setDriverMode(2, linearMotor.zDrive);
    this.setDriverMode(3, angularMotor.twistDrive);
    this.setDriverMode(4, angularMotor.swingDrive1);
    this.setDriverMode(5, angularMotor.swingDrive2);
    this.setLinearMotorTarget(linearMotor.targetPosition);
    this.setLinearMotorVelocity(linearMotor.targetVelocity);
    this.setLinearMotorForceLimit(linearMotor.strength);
    this.setAngularMotorTarget(angularMotor.targetOrientation);
    this.setAngularMotorVelocity(angularMotor.targetVelocity);
    this.setAngularMotorForceLimit(angularMotor.strength);
    this.setBreakForce(this.constraint.breakForce);
    this.setBreakTorque(this.constraint.breakTorque);
    this.updateFrames();
    this.updateDebugDrawSize();
  };
  _proto.updateFrames = function updateFrames() {
    var cs = this.constraint;
    var node = cs.node;
    var v3_0 = CC_V3_0;
    var rot_0 = CC_QUAT_0;
    var rot_1 = CC_QUAT_1;
    var trans0 = bt.Transform_new();
    Vec3.multiply(v3_0, node.worldScale, cs.pivotA);
    cocos2BulletVec3(bt.Transform_getOrigin(trans0), v3_0);
    var quat = bt.Quat_new(0, 0, 0, 1);
    var axisX = cs.axis;
    var axisY = cs.secondaryAxis;
    var axisZ = Vec3.cross(CC_V3_1, axisX, axisY);
    var mat = Mat4.set(CC_MAT4_0, axisX.x, axisX.y, axisX.z, 0, axisY.x, axisY.y, axisY.z, 0, axisZ.x, axisZ.y, axisZ.z, 0, 0, 0, 0, 1);
    mat.getRotation(rot_0);
    cocos2BulletQuat(quat, rot_0);
    bt.Transform_setRotation(trans0, quat);
    var trans1 = bt.Transform_new();
    var cb = this.constraint.connectedBody;
    if (cb) {
      Quat.multiply(rot_0, node.worldRotation, rot_0);
      Quat.invert(rot_1, cb.node.worldRotation);
      Quat.multiply(rot_0, rot_1, rot_0);
      if (cs.autoPivotB) {
        Vec3.multiply(v3_0, cs.node.worldScale, cs.pivotA);
        Vec3.transformQuat(v3_0, v3_0, node.worldRotation);
        Vec3.add(v3_0, v3_0, cs.node.worldPosition);
        Vec3.subtract(v3_0, v3_0, cb.node.worldPosition);
        Vec3.transformQuat(v3_0, v3_0, rot_1);
      } else {
        Vec3.multiply(v3_0, cb.node.worldScale, cs.pivotB);
      }
    } else {
      Vec3.multiply(v3_0, node.worldScale, cs.pivotA);
      Vec3.transformQuat(v3_0, v3_0, node.worldRotation);
      Vec3.add(v3_0, v3_0, node.worldPosition);
      Quat.multiply(rot_0, node.worldRotation, rot_0);
    }
    cocos2BulletVec3(bt.Transform_getOrigin(trans1), v3_0);
    cocos2BulletQuat(quat, rot_0);
    bt.Transform_setRotation(trans1, quat);
    bt.Generic6DofSpring2Constraint_setFrames(this._impl, trans0, trans1);
    bt._safe_delete(trans0, EBulletType.EBulletTypeTransform);
    bt._safe_delete(trans1, EBulletType.EBulletTypeTransform);
    bt._safe_delete(quat, EBulletType.EBulletTypeQuat);
  };
  _proto.updateScale0 = function updateScale0() {
    this.updateFrames();
  };
  _proto.updateScale1 = function updateScale1() {
    this.updateFrames();
  };
  return _createClass(BulletConfigurableConstraint, [{
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(BulletConstraint);

var v3_0$2 = new Vec3(0, 0, 0);
var v3_1 = new Vec3(0, 0, 0);
new Vec3(0, 0, 0);
var BulletCharacterController = function () {
  function BulletCharacterController() {
    this.wrappedWorld = void 0;
    this._isEnabled = false;
    this._impl = 0;
    this._comp = null;
    this._btCollisionFlags = 0;
    this._word3 = 0;
    this._dirty = false;
    this._collisionFilterGroup = PhysicsGroup.DEFAULT;
    this._collisionFilterMask = -1;
    this.id = BulletCharacterController.idCounter++;
    this.wrappedWorld = PhysicsSystem.instance.physicsWorld;
  }
  var _proto = BulletCharacterController.prototype;
  _proto.onComponentSet = function onComponentSet() {};
  _proto.updateScale = function updateScale() {};
  _proto.initialize = function initialize(comp) {
    this._comp = comp;
    var group = this._comp.group;
    var mask = PhysicsSystem.instance.collisionMatrix[group];
    this._collisionFilterGroup = group;
    this._collisionFilterMask = mask;
    this.onComponentSet();
    if (this._impl === 0) {
      error('[Physics]: Initialize BulletCharacterController failed');
      return false;
    } else {
      return true;
    }
  };
  _proto.setWrapper = function setWrapper() {
    BulletCache.setWrapper(this._impl, btCache.CCT_CACHE_NAME, this);
    var cctCollisionShapeImpl = bt.CharacterController_getCollisionShape(this.impl);
    BulletCache.setWrapper(cctCollisionShapeImpl, btCache.CCT_CACHE_NAME, this);
  };
  _proto.onEnable = function onEnable() {
    this._isEnabled = true;
    if (!this._impl) {
      this.onComponentSet();
    }
    this.setDetectCollisions(false);
    this.setOverlapRecovery(true);
    PhysicsSystem.instance.physicsWorld.addCCT(this);
    this.setWrapper();
  };
  _proto.onDisable = function onDisable() {
    this._isEnabled = false;
    this.wrappedWorld.removeCCT(this);
    this.onDestroy();
  };
  _proto.onDestroy = function onDestroy() {
    bt._safe_delete(this._impl, EBulletType.EBulletTypeCharacterController);
    BulletCache.delWrapper(this._impl, btCache.CCT_CACHE_NAME);
    this._impl = 0;
  };
  _proto.onLoad = function onLoad() {};
  _proto.getPosition = function getPosition(out) {
    if (!this._impl) return;
    bullet2CocosVec3(out, bt.CharacterController_getPosition(this.impl));
  };
  _proto.setPosition = function setPosition(value) {
    if (!this._impl) return;
    cocos2BulletVec3(bt.CharacterController_getPosition(this.impl), value);
    this.syncPhysicsToScene();
  };
  _proto.setContactOffset = function setContactOffset(value) {
    if (!this._impl) return;
    bt.CharacterController_setContactOffset(this._impl, value);
  };
  _proto.setStepOffset = function setStepOffset(value) {
    if (!this._impl) return;
    bt.CharacterController_setStepOffset(this._impl, value);
  };
  _proto.setSlopeLimit = function setSlopeLimit(value) {
    if (!this._impl) return;
    bt.CharacterController_setSlopeLimit(this._impl, degreesToRadians(value));
  };
  _proto.setDetectCollisions = function setDetectCollisions(value) {
    if (!this._impl) return;
    bt.CharacterController_setCollision(this.impl, value);
  };
  _proto.setOverlapRecovery = function setOverlapRecovery(value) {
    if (!this._impl) return;
    bt.CharacterController_setOverlapRecovery(this.impl, value);
  };
  _proto.onGround = function onGround() {
    return (this._btCollisionFlags & 1 << 2) > 0;
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    var node = this.characterController.node;
    if (node.hasChangedFlags) {
      if (node.hasChangedFlags & TransformBit.SCALE) this.syncScale();
      if (node.hasChangedFlags & TransformBit.POSITION) {
        Vec3.add(v3_0$2, node.worldPosition, this.scaledCenter);
        this.setPosition(v3_0$2);
      }
    }
  };
  _proto.syncPhysicsToScene = function syncPhysicsToScene() {
    this.getPosition(v3_0$2);
    v3_0$2.subtract(this.scaledCenter);
    this._comp.node.setWorldPosition(v3_0$2);
  };
  _proto.syncScale = function syncScale() {
    this.updateScale();
  };
  _proto.move = function move(movement, minDist, elapsedTime) {
    if (!this._isEnabled) {
      return;
    }
    var movementBT = BulletCache.instance.BT_V3_0;
    bt.Vec3_set(movementBT, movement.x, movement.y, movement.z);
    this._btCollisionFlags = bt.CharacterController_move(this.impl, movementBT, minDist, elapsedTime);
  };
  _proto.setGroup = function setGroup(v) {
    if (v !== this._collisionFilterGroup) {
      this._collisionFilterGroup = v;
      this._dirty = true;
    }
  };
  _proto.getGroup = function getGroup() {
    return this._collisionFilterGroup;
  };
  _proto.addGroup = function addGroup(v) {
    this._collisionFilterGroup |= v;
    this._dirty = true;
  };
  _proto.removeGroup = function removeGroup(v) {
    this._collisionFilterGroup &= ~v;
    this._dirty = true;
  };
  _proto.setMask = function setMask(v) {
    if (v !== this._collisionFilterMask) {
      this._collisionFilterMask = v;
      this._dirty = true;
    }
  };
  _proto.getMask = function getMask() {
    return this._collisionFilterMask;
  };
  _proto.addMask = function addMask(v) {
    this._collisionFilterMask |= v;
    this._dirty = true;
  };
  _proto.removeMask = function removeMask(v) {
    this._collisionFilterMask &= ~v;
    this._dirty = true;
  };
  _proto.updateEventListener = function updateEventListener() {
    this.wrappedWorld.updateNeedEmitCCTEvents(this.characterController.needCollisionEvent);
  };
  _proto.updateDirty = function updateDirty() {
    if (this._dirty) {
      PhysicsSystem.instance.physicsWorld.removeCCT(this);
      PhysicsSystem.instance.physicsWorld.addCCT(this);
      this._dirty = false;
    }
  };
  _proto.onShapeHitExt = function onShapeHitExt(hit) {
    var shapePtr = bt.ControllerShapeHit_getHitShape(hit);
    var bulletWorld = PhysicsSystem.instance.physicsWorld;
    bulletWorld.cctShapeEventDic.get(this.impl, shapePtr);
    var worldPos = new Vec3();
    bullet2CocosVec3(worldPos, bt.ControllerHit_getHitWorldPos(hit));
    var worldNormal = new Vec3();
    bullet2CocosVec3(worldNormal, bt.ControllerHit_getHitWorldNormal(hit));
    var motionDir = new Vec3();
    bullet2CocosVec3(motionDir, bt.ControllerHit_getHitMotionDir(hit));
    var motionLength = bt.ControllerHit_getHitMotionLength(hit);
    var s = BulletCache.getWrapper(shapePtr, BulletShape.TYPE);
    if (s) {
      bulletWorld.cctShapeEventDic.set(this.impl, shapePtr, {
        BulletCharacterController: this,
        BulletShape: s,
        worldPos: worldPos,
        worldNormal: worldNormal,
        motionDir: motionDir,
        motionLength: motionLength
      });
    }
  };
  return _createClass(BulletCharacterController, [{
    key: "isEnabled",
    get: function get() {
      return this._isEnabled;
    }
  }, {
    key: "impl",
    get: function get() {
      return this._impl;
    }
  }, {
    key: "characterController",
    get: function get() {
      return this._comp;
    }
  }, {
    key: "scaledCenter",
    get: function get() {
      Vec3.multiply(v3_1, this._comp.center, this._comp.node.worldScale);
      return v3_1;
    }
  }]);
}();
BulletCharacterController.idCounter = 0;

var v3_0$1 = new Vec3(0, 0, 0);
var BulletCapsuleCharacterController = function (_BulletCharacterContr) {
  function BulletCapsuleCharacterController() {
    return _BulletCharacterContr.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletCapsuleCharacterController, _BulletCharacterContr);
  var _proto = BulletCapsuleCharacterController.prototype;
  _proto.onComponentSet = function onComponentSet() {
    this.component.node.getWorldPosition(v3_0$1);
    v3_0$1.add(this.scaledCenter);
    var pos = BulletCache.instance.BT_V3_0;
    bt.Vec3_set(pos, v3_0$1.x, v3_0$1.y, v3_0$1.z);
    var upDir = Vec3.UNIT_Y;
    var up = BulletCache.instance.BT_V3_1;
    bt.Vec3_set(up, upDir.x, upDir.y, upDir.z);
    var report = bt.ControllerHitReport.implement(importFunc).$$.ptr;
    var bulletWorld = PhysicsSystem.instance.physicsWorld;
    var controllerDesc = bt.CapsuleCharacterControllerDesc_new(degreesToRadians(this.component.slopeLimit), this.component.stepOffset, this.component.skinWidth, up, pos, report, this.component.radius, this.component.height);
    this._impl = bt.CapsuleCharacterController_new(bulletWorld.impl, controllerDesc, 0);
    this.updateScale();
  };
  _proto.setRadius = function setRadius(value) {
    this.updateScale();
  };
  _proto.setHeight = function setHeight(value) {
    this.updateScale();
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
  };
  _proto.updateGeometry = function updateGeometry() {
    var ws = this.component.node.worldScale;
    var r = this.component.radius * absMax(ws.x, ws.z);
    var h = this.component.height * Math.abs(ws.y);
    bt.CapsuleCharacterController_setRadius(this.impl, r);
    bt.CapsuleCharacterController_setHeight(this.impl, h);
    this._dirty = true;
  };
  return _createClass(BulletCapsuleCharacterController, [{
    key: "component",
    get: function get() {
      return this._comp;
    }
  }]);
}(BulletCharacterController);

var v3_0 = new Vec3(0, 0, 0);
var BulletBoxCharacterController = function (_BulletCharacterContr) {
  function BulletBoxCharacterController() {
    return _BulletCharacterContr.apply(this, arguments) || this;
  }
  _inheritsLoose(BulletBoxCharacterController, _BulletCharacterContr);
  var _proto = BulletBoxCharacterController.prototype;
  _proto.onComponentSet = function onComponentSet() {
    this.component.node.getWorldPosition(v3_0);
    v3_0.add(this.scaledCenter);
    var pos = BulletCache.instance.BT_V3_0;
    bt.Vec3_set(pos, v3_0.x, v3_0.y, v3_0.z);
    var upDir = Vec3.UNIT_Y;
    var up = BulletCache.instance.BT_V3_1;
    bt.Vec3_set(up, upDir.x, upDir.y, upDir.z);
    var report = bt.ControllerHitReport.implement(importFunc).$$.ptr;
    var bulletWorld = PhysicsSystem.instance.physicsWorld;
    var controllerDesc = bt.BoxCharacterControllerDesc_new(degreesToRadians(this.component.slopeLimit), this.component.stepOffset, this.component.skinWidth, up, pos, report, this.component.halfHeight, this.component.halfSideExtent, this.component.halfForwardExtent);
    this._impl = bt.BoxCharacterController_new(bulletWorld.impl, controllerDesc, 0);
    this.updateScale();
  };
  _proto.setHalfHeight = function setHalfHeight(value) {
    this.updateScale();
  };
  _proto.setHalfSideExtent = function setHalfSideExtent(value) {
    this.updateScale();
  };
  _proto.setHalfForwardExtent = function setHalfForwardExtent(value) {
    this.updateScale();
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
  };
  _proto.updateGeometry = function updateGeometry() {
    var ws = this.component.node.worldScale;
    bt.BoxCharacterController_setHalfSideExtent(this.impl, this.component.halfSideExtent * ws.x);
    bt.BoxCharacterController_setHalfHeight(this.impl, this.component.halfHeight * ws.y);
    bt.BoxCharacterController_setHalfForwardExtent(this.impl, this.component.halfForwardExtent * ws.z);
    this._dirty = true;
  };
  return _createClass(BulletBoxCharacterController, [{
    key: "component",
    get: function get() {
      return this._comp;
    }
  }]);
}(BulletCharacterController);

game.once(Game.EVENT_PRE_SUBSYSTEM_INIT, function () {
  selector.register('bullet', {
    PhysicsWorld: BulletWorld,
    RigidBody: BulletRigidBody,
    BoxShape: BulletBoxShape,
    SphereShape: BulletSphereShape,
    CapsuleShape: BulletCapsuleShape,
    TrimeshShape: BulletTrimeshShape,
    CylinderShape: BulletCylinderShape,
    ConeShape: BulletConeShape,
    TerrainShape: BulletTerrainShape,
    SimplexShape: BulletSimplexShape,
    PlaneShape: BulletPlaneShape,
    PointToPointConstraint: BulletP2PConstraint,
    HingeConstraint: BulletHingeConstraint,
    FixedConstraint: BulletFixedConstraint,
    ConfigurableConstraint: BulletConfigurableConstraint,
    BoxCharacterController: BulletBoxCharacterController,
    CapsuleCharacterController: BulletCapsuleCharacterController
  });
});
function loadWasmModuleBullet() {
  {
    return Promise.resolve();
  }
}

export { loadWasmModuleBullet };
//# sourceMappingURL=physics-ammo.js.map
