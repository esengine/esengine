import './_virtual_internal_constants-DWlew7Dp.js';
import { P as PhysicsSystem, q as CharacterControllerContact, s as selector } from './index-UDeHavOr.js';
import { Q as error, M as fastRemoveAt, a as _createClass, aC as degreesToRadians, _ as _inheritsLoose } from './gc-object-CShF5lzx.js';
import { n as sys, f as Vec3, Q as Quat, J as AABB, C as Color, al as absMaxComponent, am as absMax, M as Mat4, h as toRadian } from './index-uXI1_UMk.js';
import { e as ensureWasmModuleReady, i as instantiateWasm } from './wasm-web-BpK36a26.js';
import { b as shrinkPositions, C as CharacterTriggerEventObject, c as CollisionEventObject, T as TriggerEventObject, V as VEC3_0, a as absolute } from './util-Cxn5lV0H.js';
import { g as game, G as Game } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { T as TransformBit } from './scene-vWcxM1_c.js';
import { P as PhysicsGroup, a as ERigidBodyType, c as EPhysicsDrawFlags, E as EAxisDirection, d as EConstraintMode, e as EDriverMode } from './collision-matrix-55yq71jP.js';
import { T as TupleDictionary } from './tuple-dictionary-BCDCuDb1.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './node-event-Ccvtv8bJ.js';
import { c as cylinder } from './capsule-9D-8tsOp.js';
import './deprecated-n0w4kK7g.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './debug-view-BuNhRPv_.js';
import './mesh-XWfHgs1t.js';
import './zlib.min-3VC1ush6.js';
import './skeleton-CBhmWmEt.js';
import './terrain-asset-BMvu7XYU.js';
import './touch-BKrZ-fxl.js';

var PhysXInstance = function PhysXInstance() {};
PhysXInstance.foundation = void 0;
PhysXInstance.physics = void 0;
PhysXInstance.cooking = void 0;
PhysXInstance.pvd = void 0;
PhysXInstance.queryfilterData = void 0;
PhysXInstance.singleResult = void 0;
PhysXInstance.mutipleResults = void 0;
PhysXInstance.simulationCB = void 0;
PhysXInstance.queryFilterCB = void 0;
PhysXInstance.mutipleResultSize = 12;
PhysXInstance.singleSweepResult = void 0;
PhysXInstance.mutipleSweepResults = void 0;

var EFilterDataWord3;
(function (EFilterDataWord3) {
  EFilterDataWord3[EFilterDataWord3["QUERY_FILTER"] = 1] = "QUERY_FILTER";
  EFilterDataWord3[EFilterDataWord3["QUERY_CHECK_TRIGGER"] = 2] = "QUERY_CHECK_TRIGGER";
  EFilterDataWord3[EFilterDataWord3["QUERY_SINGLE_HIT"] = 4] = "QUERY_SINGLE_HIT";
  EFilterDataWord3[EFilterDataWord3["DETECT_TRIGGER_EVENT"] = 8] = "DETECT_TRIGGER_EVENT";
  EFilterDataWord3[EFilterDataWord3["DETECT_CONTACT_EVENT"] = 16] = "DETECT_CONTACT_EVENT";
  EFilterDataWord3[EFilterDataWord3["DETECT_CONTACT_POINT"] = 32] = "DETECT_CONTACT_POINT";
  EFilterDataWord3[EFilterDataWord3["DETECT_CONTACT_CCD"] = 64] = "DETECT_CONTACT_CCD";
})(EFilterDataWord3 || (EFilterDataWord3 = {}));
var PxHitFlag;
(function (PxHitFlag) {
  PxHitFlag[PxHitFlag["ePOSITION"] = 1] = "ePOSITION";
  PxHitFlag[PxHitFlag["eNORMAL"] = 2] = "eNORMAL";
  PxHitFlag[PxHitFlag["eUV"] = 8] = "eUV";
  PxHitFlag[PxHitFlag["eASSUME_NO_INITIAL_OVERLAP"] = 16] = "eASSUME_NO_INITIAL_OVERLAP";
  PxHitFlag[PxHitFlag["eMESH_MULTIPLE"] = 32] = "eMESH_MULTIPLE";
  PxHitFlag[PxHitFlag["eMESH_ANY"] = 64] = "eMESH_ANY";
  PxHitFlag[PxHitFlag["eMESH_BOTH_SIDES"] = 128] = "eMESH_BOTH_SIDES";
  PxHitFlag[PxHitFlag["ePRECISE_SWEEP"] = 256] = "ePRECISE_SWEEP";
  PxHitFlag[PxHitFlag["eMTD"] = 512] = "eMTD";
  PxHitFlag[PxHitFlag["eFACE_INDEX"] = 1024] = "eFACE_INDEX";
  PxHitFlag[PxHitFlag["eDEFAULT"] = PxHitFlag.ePOSITION | PxHitFlag.eNORMAL | PxHitFlag.eFACE_INDEX] = "eDEFAULT";
  PxHitFlag[PxHitFlag["eMODIFIABLE_FLAGS"] = PxHitFlag.eMESH_MULTIPLE | PxHitFlag.eMESH_BOTH_SIDES | PxHitFlag.eASSUME_NO_INITIAL_OVERLAP | PxHitFlag.ePRECISE_SWEEP] = "eMODIFIABLE_FLAGS";
})(PxHitFlag || (PxHitFlag = {}));
var PxQueryFlag;
(function (PxQueryFlag) {
  PxQueryFlag[PxQueryFlag["eSTATIC"] = 1] = "eSTATIC";
  PxQueryFlag[PxQueryFlag["eDYNAMIC"] = 2] = "eDYNAMIC";
  PxQueryFlag[PxQueryFlag["ePREFILTER"] = 4] = "ePREFILTER";
  PxQueryFlag[PxQueryFlag["ePOSTFILTER"] = 8] = "ePOSTFILTER";
  PxQueryFlag[PxQueryFlag["eANY_HIT"] = 16] = "eANY_HIT";
  PxQueryFlag[PxQueryFlag["eNO_BLOCK"] = 32] = "eNO_BLOCK";
  PxQueryFlag[PxQueryFlag["eRESERVED"] = 32768] = "eRESERVED";
})(PxQueryFlag || (PxQueryFlag = {}));
var PxPairFlag;
(function (PxPairFlag) {
  PxPairFlag[PxPairFlag["eSOLVE_CONTACT"] = 1] = "eSOLVE_CONTACT";
  PxPairFlag[PxPairFlag["eMODIFY_CONTACTS"] = 2] = "eMODIFY_CONTACTS";
  PxPairFlag[PxPairFlag["eNOTIFY_TOUCH_FOUND"] = 4] = "eNOTIFY_TOUCH_FOUND";
  PxPairFlag[PxPairFlag["eNOTIFY_TOUCH_PERSISTS"] = 8] = "eNOTIFY_TOUCH_PERSISTS";
  PxPairFlag[PxPairFlag["eNOTIFY_TOUCH_LOST"] = 16] = "eNOTIFY_TOUCH_LOST";
  PxPairFlag[PxPairFlag["eNOTIFY_TOUCH_CCD"] = 32] = "eNOTIFY_TOUCH_CCD";
  PxPairFlag[PxPairFlag["eNOTIFY_THRESHOLD_FORCE_FOUND"] = 64] = "eNOTIFY_THRESHOLD_FORCE_FOUND";
  PxPairFlag[PxPairFlag["eNOTIFY_THRESHOLD_FORCE_PERSISTS"] = 128] = "eNOTIFY_THRESHOLD_FORCE_PERSISTS";
  PxPairFlag[PxPairFlag["eNOTIFY_THRESHOLD_FORCE_LOST"] = 256] = "eNOTIFY_THRESHOLD_FORCE_LOST";
  PxPairFlag[PxPairFlag["eNOTIFY_CONTACT_POINTS"] = 512] = "eNOTIFY_CONTACT_POINTS";
  PxPairFlag[PxPairFlag["eDETECT_DISCRETE_CONTACT"] = 1024] = "eDETECT_DISCRETE_CONTACT";
  PxPairFlag[PxPairFlag["eDETECT_CCD_CONTACT"] = 2048] = "eDETECT_CCD_CONTACT";
  PxPairFlag[PxPairFlag["ePRE_SOLVER_VELOCITY"] = 4096] = "ePRE_SOLVER_VELOCITY";
  PxPairFlag[PxPairFlag["ePOST_SOLVER_VELOCITY"] = 8192] = "ePOST_SOLVER_VELOCITY";
  PxPairFlag[PxPairFlag["eCONTACT_EVENT_POSE"] = 16384] = "eCONTACT_EVENT_POSE";
  PxPairFlag[PxPairFlag["eNEXT_FREE"] = 32768] = "eNEXT_FREE";
  PxPairFlag[PxPairFlag["eCONTACT_DEFAULT"] = 1025] = "eCONTACT_DEFAULT";
  PxPairFlag[PxPairFlag["eTRIGGER_DEFAULT"] = 1044] = "eTRIGGER_DEFAULT";
})(PxPairFlag || (PxPairFlag = {}));
var PxContactPairFlag;
(function (PxContactPairFlag) {
  PxContactPairFlag[PxContactPairFlag["eREMOVED_SHAPE_0"] = 1] = "eREMOVED_SHAPE_0";
  PxContactPairFlag[PxContactPairFlag["eREMOVED_SHAPE_1"] = 2] = "eREMOVED_SHAPE_1";
  PxContactPairFlag[PxContactPairFlag["eACTOR_PAIR_HAS_FIRST_TOUCH"] = 4] = "eACTOR_PAIR_HAS_FIRST_TOUCH";
  PxContactPairFlag[PxContactPairFlag["eACTOR_PAIR_LOST_TOUCH"] = 8] = "eACTOR_PAIR_LOST_TOUCH";
  PxContactPairFlag[PxContactPairFlag["eINTERNAL_HAS_IMPULSES"] = 16] = "eINTERNAL_HAS_IMPULSES";
  PxContactPairFlag[PxContactPairFlag["eINTERNAL_CONTACTS_ARE_FLIPPED"] = 32] = "eINTERNAL_CONTACTS_ARE_FLIPPED";
})(PxContactPairFlag || (PxContactPairFlag = {}));
var PxTriggerPairFlag;
(function (PxTriggerPairFlag) {
  PxTriggerPairFlag[PxTriggerPairFlag["eREMOVED_SHAPE_TRIGGER"] = 1] = "eREMOVED_SHAPE_TRIGGER";
  PxTriggerPairFlag[PxTriggerPairFlag["eREMOVED_SHAPE_OTHER"] = 2] = "eREMOVED_SHAPE_OTHER";
  PxTriggerPairFlag[PxTriggerPairFlag["eNEXT_FREE"] = 4] = "eNEXT_FREE";
})(PxTriggerPairFlag || (PxTriggerPairFlag = {}));

var PX = {};
var globalThis = cclegacy._global;
var USE_EXTERNAL_PHYSX = !!globalThis.PHYSX;
{
  game.onPostInfrastructureInitDelegate.add(initPhysXLibs);
}
function initPhysXLibs() {
  var errorReport = function errorReport(msg) {
    error(msg);
  };
  return ensureWasmModuleReady().then(function () {
    if (shouldUseWasmModule()) {
      return Promise.all([import('./physx.release.wasm-CqyB_1uA.js').then(function (n) { return n.p; }), import('./physx.release.wasm-CsJZKUlI.js')]).then(function (_ref) {
        var physxWasmFactory = _ref[0]["default"],
          physxWasmUrl = _ref[1]["default"];
        return initWASM(physxWasmFactory, physxWasmUrl);
      });
    } else {
      return import('./physx.release.asm-BoNWUnrf.js').then(function (n) { return n.p; }).then(function (_ref2) {
        var physxAsmFactory = _ref2["default"];
        return initASM(physxAsmFactory);
      });
    }
  })["catch"](errorReport);
}
function initASM(physxAsmFactory) {
  globalThis.PhysX = globalThis.PHYSX ? globalThis.PHYSX : physxAsmFactory;
  if (globalThis.PhysX != null) {
    return globalThis.PhysX().then(function (Instance) {
      console.debug('[PHYSICS]:', (USE_EXTERNAL_PHYSX ? 'External' : 'Internal') + " PhysX asm libs loaded.");
      initAdaptWrapper(Instance);
      initConfigAndCacheObject(Instance);
      Object.assign(PX, Instance);
    }, function (reason) {
      console.error('[PHYSICS]:', "PhysX asm load failed: " + reason);
    });
  } else {
    console.error('[PHYSICS]:', 'Failed to load PhysX js libs, package may be not found.');
    return new Promise(function (resolve, reject) {
      resolve();
    });
  }
}
function initWASM(physxWasmFactory, physxWasmUrl) {
  globalThis.PhysX = globalThis.PHYSX ? globalThis.PHYSX : physxWasmFactory;
  if (globalThis.PhysX != null) {
    return globalThis.PhysX({
      instantiateWasm: function instantiateWasm$1(importObject, receiveInstance) {
        return instantiateWasm(physxWasmUrl, importObject).then(function (result) {
          receiveInstance(result.instance, result.module);
        });
      }
    }).then(function (Instance) {
      console.debug('[PHYSICS]:', (USE_EXTERNAL_PHYSX ? 'External' : 'Internal') + " PhysX wasm libs loaded.");
      initAdaptWrapper(Instance);
      initConfigAndCacheObject(Instance);
      PX = Instance;
    }, function (reason) {
      console.error('[PHYSICS]:', "PhysX wasm load failed: " + reason);
    });
  } else {
    console.error('[PHYSICS]:', 'Failed to load PhysX wasm libs, package may be not found.');
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
function initConfigAndCacheObject(PX) {
  globalThis.PhysX = PX;
  PX.EPSILON = 1e-3;
  PX.MULTI_THREAD = false;
  PX.SUB_THREAD_COUNT = 1;
  PX.CACHE_MAT = {};
  PX.IMPL_PTR = {};
  PX.MESH_CONVEX = {};
  PX.MESH_STATIC = {};
  PX.TERRAIN_STATIC = {};
}
function initAdaptWrapper(obj) {
  obj.VECTOR_MAT = new obj.PxMaterialVector();
  obj.MeshScale = obj.PxMeshScale;
  obj.ShapeFlag = obj.PxShapeFlag;
  obj.ActorFlag = obj.PxActorFlag;
  obj.ForceMode = obj.PxForceMode;
  obj.CombineMode = obj.PxCombineMode;
  obj.BoxGeometry = obj.PxBoxGeometry;
  obj.QueryHitType = obj.PxQueryHitType;
  obj.RigidBodyFlag = obj.PxRigidBodyFlag;
  obj.PlaneGeometry = obj.PxPlaneGeometry;
  obj.SphereGeometry = obj.PxSphereGeometry;
  obj.CapsuleGeometry = obj.PxCapsuleGeometry;
  obj.ConvexMeshGeometry = obj.PxConvexMeshGeometry;
  obj.D6Motion = obj.PxD6Motion;
  obj.D6Axis = obj.PxD6Axis;
  obj.D6Drive = obj.PxD6Drive;
  obj.D6JointDrive = obj.PxD6JointDrive;
  obj.LinearLimitPair = obj.PxJointLinearLimitPair;
  obj.AngularLimitPair = obj.PxJointAngularLimitPair;
  obj.TriangleMeshGeometry = obj.PxTriangleMeshGeometry;
  obj.RigidDynamicLockFlag = obj.PxRigidDynamicLockFlag;
  obj.TolerancesScale = obj.PxTolerancesScale;
  obj.RevoluteJointFlags = {
    eLIMIT_ENABLED: 1 << 0,
    eDRIVE_ENABLED: 1 << 1,
    eDRIVE_FREESPIN: 1 << 2
  };
  obj.JointAngularLimitPair = obj.PxJointAngularLimitPair;
  obj.createRevoluteJoint = function (a, b, c, d) {
    return obj.PxRevoluteJointCreate(PX.physics, a, b, c, d);
  };
  obj.createFixedConstraint = function (a, b, c, d) {
    return obj.PxFixedJointCreate(PX.physics, a, b, c, d);
  };
  obj.createSphericalJoint = function (a, b, c, d) {
    return obj.PxSphericalJointCreate(PX.physics, a, b, c, d);
  };
  obj.createD6Joint = function (a, b, c, d) {
    return obj.PxD6JointCreate(PX.physics, a, b, c, d);
  };
}
var _v3 = {
  x: 0,
  y: 0,
  z: 0
};
var _v4 = {
  x: 0,
  y: 0,
  z: 0,
  w: 1
};
var _trans = {
  translation: _v3,
  rotation: _v4,
  p: _v3,
  q: _v4
};
function getColorPXColor(color, rgba) {
  color.b = rgba >> 16 & 0xff;
  color.g = rgba >> 8 & 0xff;
  color.r = rgba & 0xff;
  color.a = 255;
}
var _pxtrans = _trans;
function addReference(shape, impl) {
  if (!impl) return;
  if (impl.$$) PX.IMPL_PTR[impl.$$.ptr] = shape;
}
function removeReference(shape, impl) {
  if (!impl) return;
  if (impl.$$) {
    PX.IMPL_PTR[impl.$$.ptr] = null;
    delete PX.IMPL_PTR[impl.$$.ptr];
  }
}
function getWrapShape(pxShape) {
  return PX.IMPL_PTR[pxShape.$$.ptr];
}
function getTempTransform(pos, quat) {
  Vec3.copy(_pxtrans.translation, pos);
  Quat.copy(_pxtrans.rotation, quat);
  return _pxtrans;
}
function getJsTransform(pos, quat) {
  Vec3.copy(_trans.p, pos);
  Quat.copy(_trans.q, quat);
  return _trans;
}
function addActorToScene(scene, actor) {
  scene.addActor(actor, null);
}
function setJointActors(joint, actor0, actor1) {
  joint.setActors(actor0, actor1);
}
function setMassAndUpdateInertia(impl, mass) {
  impl.setMassAndUpdateInertia(mass);
}
function copyPhysXTransform(node, transform) {
  var wp = node.worldPosition;
  var wr = node.worldRotation;
  var dontUpdate = physXEqualsCocosVec3(transform, wp) && physXEqualsCocosQuat(transform, wr);
  if (dontUpdate) return;
  node.setWorldPosition(transform.translation);
  node.setWorldRotation(transform.rotation);
}
function physXEqualsCocosVec3(trans, v3) {
  return Vec3.equals(trans.translation, v3, PX.EPSILON);
}
function physXEqualsCocosQuat(trans, q) {
  return Quat.equals(trans.rotation, q, PX.EPSILON);
}
function applyImpulse(isGlobal, impl, vec, rp) {
  if (isGlobal) {
    impl.applyImpulse(vec, rp);
  } else {
    impl.applyLocalImpulse(vec, rp);
  }
}
function applyForce(isGlobal, impl, vec, rp) {
  if (isGlobal) {
    impl.applyForce(vec, rp);
  } else {
    impl.applyLocalForce(vec, rp);
  }
}
function applyTorqueForce(impl, vec) {
  impl.addTorque(vec);
}
function getShapeFlags(isTrigger) {
  var flag = (isTrigger ? PX.PxShapeFlag.eTRIGGER_SHAPE.value : PX.PxShapeFlag.eSIMULATION_SHAPE.value) | PX.PxShapeFlag.eSCENE_QUERY_SHAPE.value | PX.PxShapeFlag.eVISUALIZATION.value;
  return new PX.PxShapeFlags(flag);
}
function getShapeWorldBounds(shape, actor, i, out) {
  var b3 = shape.getWorldBounds(actor, i);
  AABB.fromPoints(out, b3.minimum, b3.maximum);
}
function getShapeMaterials(pxMtl) {
  if (PX.VECTOR_MAT.size() > 0) {
    PX.VECTOR_MAT.set(0, pxMtl);
  } else {
    PX.VECTOR_MAT.push_back(pxMtl);
  }
  return PX.VECTOR_MAT;
}
function createConvexMesh(_buffer, cooking, physics) {
  var vertices = shrinkPositions(_buffer);
  var l = vertices.length;
  var vArr = new PX.PxVec3Vector();
  for (var i = 0; i < l; i += 3) {
    vArr.push_back({
      x: vertices[i],
      y: vertices[i + 1],
      z: vertices[i + 2]
    });
  }
  var r = cooking.createConvexMesh(vArr, physics);
  vArr["delete"]();
  return r;
}
function createMeshGeometryFlags(flags, isConvex) {
  return isConvex ? new PX.PxConvexMeshGeometryFlags(flags) : new PX.PxMeshGeometryFlags(flags);
}
function createTriangleMesh(vertices, indices, cooking, physics) {
  var l = vertices.length;
  var l2 = indices.length;
  var vArr = new PX.PxVec3Vector();
  for (var i = 0; i < l; i += 3) {
    vArr.push_back({
      x: vertices[i],
      y: vertices[i + 1],
      z: vertices[i + 2]
    });
  }
  var iArr = new PX.PxU16Vector();
  for (var _i = 0; _i < l2; _i += 3) {
    iArr.push_back(indices[_i]);
    iArr.push_back(indices[_i + 1]);
    iArr.push_back(indices[_i + 2]);
  }
  var r = cooking.createTriMeshExt(vArr, iArr, physics);
  vArr["delete"]();
  iArr["delete"]();
  return r;
}
function createHeightField(terrain, heightScale, cooking, physics) {
  var sizeI = terrain.getVertexCountI();
  var sizeJ = terrain.getVertexCountJ();
  var samples = new PX.PxHeightFieldSampleVector();
  for (var i = 0; i < sizeI; i++) {
    for (var j = 0; j < sizeJ; j++) {
      var s = new PX.PxHeightFieldSample();
      s.height = terrain.getHeight(i, j) / heightScale;
      samples.push_back(s);
    }
  }
  return cooking.createHeightFieldExt(sizeI, sizeJ, samples, physics);
}
function createHeightFieldGeometry(hf, flags, hs, xs, zs) {
  return new PX.PxHeightFieldGeometry(hf, new PX.PxMeshGeometryFlags(flags), hs, xs, zs);
}
function simulateScene(scene, deltaTime) {
  scene.simulate(deltaTime, true);
}
function raycastAll(world, worldRay, options, pool, results) {
  var maxDistance = options.maxDistance;
  var flags = PxHitFlag.ePOSITION | PxHitFlag.eNORMAL;
  var word3 = EFilterDataWord3.QUERY_FILTER | (options.queryTrigger ? 0 : EFilterDataWord3.QUERY_CHECK_TRIGGER);
  var queryFlags = PxQueryFlag.eSTATIC | PxQueryFlag.eDYNAMIC | PxQueryFlag.ePREFILTER | PxQueryFlag.eNO_BLOCK;
  var queryfilterData = PhysXInstance.queryfilterData;
  var queryFilterCB = PhysXInstance.queryFilterCB;
  var mutipleResults = PhysXInstance.mutipleResults;
  PhysXInstance.mutipleResultSize;
  queryfilterData.setWords(options.mask >>> 0, 0);
  queryfilterData.setWords(word3, 3);
  queryfilterData.setFlags(queryFlags);
  var blocks = mutipleResults;
  var r = world.scene.raycastMultiple(worldRay.o, worldRay.d, maxDistance, flags, blocks, blocks.size(), queryfilterData, queryFilterCB, null);
  if (r > 0) {
    for (var i = 0; i < r; i++) {
      var block = blocks.get(i);
      var collider = getWrapShape(block.getShape()).collider;
      var result = pool.add();
      result._assign(block.position, block.distance, collider, block.normal);
      results.push(result);
    }
    return true;
  }
  if (r === -1) {
    console.error('not enough memory.');
  }
  return false;
}
function raycastClosest(world, worldRay, options, result) {
  options.maxDistance;
  var flags = PxHitFlag.ePOSITION | PxHitFlag.eNORMAL;
  var word3 = EFilterDataWord3.QUERY_FILTER | (options.queryTrigger ? 0 : EFilterDataWord3.QUERY_CHECK_TRIGGER) | EFilterDataWord3.QUERY_SINGLE_HIT;
  var queryFlags = PxQueryFlag.eSTATIC | PxQueryFlag.eDYNAMIC | PxQueryFlag.ePREFILTER;
  var queryfilterData = PhysXInstance.queryfilterData;
  var queryFilterCB = PhysXInstance.queryFilterCB;
  queryfilterData.setWords(options.mask >>> 0, 0);
  queryfilterData.setWords(word3, 3);
  queryfilterData.setFlags(queryFlags);
  var block = PhysXInstance.singleResult;
  var r = world.scene.raycastSingle(worldRay.o, worldRay.d, options.maxDistance, flags, block, queryfilterData, queryFilterCB, null);
  if (r) {
    var collider = getWrapShape(block.getShape()).collider;
    result._assign(block.position, block.distance, collider, block.normal);
    return true;
  }
  return false;
}
function sweepAll(world, worldRay, geometry, geometryRotation, options, pool, results) {
  var maxDistance = options.maxDistance;
  var flags = PxHitFlag.ePOSITION | PxHitFlag.eNORMAL;
  var word3 = EFilterDataWord3.QUERY_FILTER | (options.queryTrigger ? 0 : EFilterDataWord3.QUERY_CHECK_TRIGGER);
  var queryFlags = PxQueryFlag.eSTATIC | PxQueryFlag.eDYNAMIC | PxQueryFlag.ePREFILTER | PxQueryFlag.eNO_BLOCK;
  var queryfilterData = PhysXInstance.queryfilterData;
  var queryFilterCB = PhysXInstance.queryFilterCB;
  var mutipleResults = PhysXInstance.mutipleSweepResults;
  PhysXInstance.mutipleResultSize;
  queryfilterData.setWords(options.mask >>> 0, 0);
  queryfilterData.setWords(word3, 3);
  queryfilterData.setFlags(queryFlags);
  var blocks = mutipleResults;
  var r = world.scene.sweepMultiple(geometry, getTempTransform(worldRay.o, geometryRotation), worldRay.d, maxDistance, flags, blocks, blocks.size(), queryfilterData, queryFilterCB, null, 0);
  if (r > 0) {
    for (var i = 0; i < r; i++) {
      var block = blocks.get(i);
      var collider = getWrapShape(block.getShape()).collider;
      var result = pool.add();
      result._assign(block.position, block.distance, collider, block.normal);
      results.push(result);
    }
    return true;
  }
  if (r === -1) {
    console.error('not enough memory.');
  }
  return false;
}
function sweepClosest(world, worldRay, geometry, geometryRotation, options, result) {
  var maxDistance = options.maxDistance;
  var flags = PxHitFlag.ePOSITION | PxHitFlag.eNORMAL;
  var word3 = EFilterDataWord3.QUERY_FILTER | (options.queryTrigger ? 0 : EFilterDataWord3.QUERY_CHECK_TRIGGER) | EFilterDataWord3.QUERY_SINGLE_HIT;
  var queryFlags = PxQueryFlag.eSTATIC | PxQueryFlag.eDYNAMIC | PxQueryFlag.ePREFILTER;
  var queryfilterData = PhysXInstance.queryfilterData;
  queryfilterData.setWords(options.mask >>> 0, 0);
  queryfilterData.setWords(word3, 3);
  queryfilterData.setFlags(queryFlags);
  var queryFilterCB = PhysXInstance.queryFilterCB;
  var block = PhysXInstance.singleSweepResult;
  var r = world.scene.sweepSingle(geometry, getTempTransform(worldRay.o, geometryRotation), worldRay.d, maxDistance, flags, block, queryfilterData, queryFilterCB, null, 0);
  if (r) {
    var collider = getWrapShape(block.getShape()).collider;
    result._assign(block.position, block.distance, collider, block.normal);
    return true;
  }
  return false;
}
function initializeWorld(world) {
  if (!PhysXInstance.foundation) {
    var version = PX.PX_PHYSICS_VERSION;
    var allocator = new PX.PxDefaultAllocator();
    var defaultErrorCallback = new PX.PxDefaultErrorCallback();
    var foundation = PhysXInstance.foundation = PX.PxCreateFoundation(version, allocator, defaultErrorCallback);
    PhysXInstance.pvd = null;
    var scale = new PX.PxTolerancesScale();
    PhysXInstance.physics = PX.physics = PX.PxCreatePhysics(version, foundation, scale, false, PhysXInstance.pvd);
    PhysXInstance.cooking = PX.PxCreateCooking(version, foundation, new PX.PxCookingParams(scale));
    PX.PxInitExtensions(PhysXInstance.physics, PhysXInstance.pvd);
    PhysXInstance.singleResult = new PX.PxRaycastHit();
    PhysXInstance.mutipleResults = new PX.PxRaycastHitVector();
    PhysXInstance.mutipleResults.resize(PhysXInstance.mutipleResultSize, PhysXInstance.singleResult);
    PhysXInstance.queryfilterData = new PX.PxQueryFilterData();
    PhysXInstance.simulationCB = PX.PxSimulationEventCallback.implement(world.callback.eventCallback);
    PhysXInstance.queryFilterCB = PX.PxQueryFilterCallback.implement(world.callback.queryCallback);
    PhysXInstance.singleSweepResult = new PX.PxSweepHit();
    PhysXInstance.mutipleSweepResults = new PX.PxSweepHitVector();
    PhysXInstance.mutipleSweepResults.resize(PhysXInstance.mutipleResultSize, PhysXInstance.singleSweepResult);
  }
  var sceneDesc = PX.getDefaultSceneDesc(PhysXInstance.physics.getTolerancesScale(), 0, PhysXInstance.simulationCB);
  world.scene = PhysXInstance.physics.createScene(sceneDesc);
  world.scene.setVisualizationParameter(PX.PxVisualizationParameter.eSCALE, 1);
  world.controllerManager = PX.PxCreateControllerManager(world.scene, false);
}
function getContactPosition(pxContactOrOffset, out, buf) {
  Vec3.copy(out, pxContactOrOffset.position);
}
function getContactNormal(pxContactOrOffset, out, buf) {
  Vec3.copy(out, pxContactOrOffset.normal);
}
function getContactDataOrByteOffset(index, offset) {
  var gc = PX.getGContacts();
  var data = gc.get(index + offset);
  return data;
}
function syncNoneStaticToSceneIfWaking(actor, node) {
  if (actor.isSleeping()) return;
  copyPhysXTransform(node, actor.getGlobalPose());
}

var PhysXSharedBody = function () {
  function PhysXSharedBody(node, wrappedWorld) {
    this.id = void 0;
    this.node = void 0;
    this.wrappedWorld = void 0;
    this.wrappedShapes = [];
    this.wrappedJoints0 = [];
    this.wrappedJoints1 = [];
    this._index = -1;
    this._ref = 0;
    this._isStatic = false;
    this._isKinematic = false;
    this._dynamicActor = void 0;
    this._staticActor = void 0;
    this._wrappedBody = null;
    this._filterData = void 0;
    this.id = PhysXSharedBody.idCounter++;
    this.node = node;
    this.wrappedWorld = wrappedWorld;
    this._filterData = {
      word0: 1,
      word1: 1,
      word2: 1,
      word3: 0
    };
  }
  PhysXSharedBody.getSharedBody = function getSharedBody(node, wrappedWorld, wrappedBody) {
    var key = node.uuid;
    var newSB;
    if (PhysXSharedBody.sharedBodesMap.has(key)) {
      newSB = PhysXSharedBody.sharedBodesMap.get(key);
    } else {
      newSB = new PhysXSharedBody(node, wrappedWorld);
      newSB.filterData.word0 = PhysicsGroup.DEFAULT;
      newSB.filterData.word1 = PhysicsSystem.instance.collisionMatrix[PhysicsGroup.DEFAULT];
      PhysXSharedBody.sharedBodesMap.set(node.uuid, newSB);
    }
    if (wrappedBody) {
      newSB._wrappedBody = wrappedBody;
      var g = wrappedBody.rigidBody.group;
      var m = PhysicsSystem.instance.collisionMatrix[g];
      newSB.filterData.word0 = g;
      newSB.filterData.word1 = m;
    }
    return newSB;
  };
  var _proto = PhysXSharedBody.prototype;
  _proto._initActor = function _initActor() {
    var st = this._isStatic;
    var wb = this.wrappedBody;
    if (wb) {
      var rb = wb.rigidBody;
      if (rb.type === ERigidBodyType.STATIC) {
        this._isStatic = true;
        this._isKinematic = false;
        this._initStaticActor();
      } else {
        this._isStatic = false;
        this._initDynamicActor();
      }
    } else {
      this._isStatic = true;
      this._isKinematic = false;
      this._initStaticActor();
    }
    if (st !== this._isStatic) {
      this._switchActor(st);
    }
  };
  _proto._initStaticActor = function _initStaticActor() {
    if (this._staticActor) return;
    var t = getTempTransform(this.node.worldPosition, this.node.worldRotation);
    this._staticActor = PhysXInstance.physics.createRigidStatic(t);
    this._staticActor.setActorFlag(PX.ActorFlag.eVISUALIZATION, true);
    if (this._staticActor.$$) PX.IMPL_PTR[this._staticActor.$$.ptr] = this;
  };
  _proto._initDynamicActor = function _initDynamicActor() {
    if (this._dynamicActor) return;
    var t = getTempTransform(this.node.worldPosition, this.node.worldRotation);
    this._dynamicActor = PhysXInstance.physics.createRigidDynamic(t);
    if (this._dynamicActor.$$) PX.IMPL_PTR[this._dynamicActor.$$.ptr] = this;
    var wb = this.wrappedBody;
    if (wb) {
      var rb = wb.rigidBody;
      this._dynamicActor.setMass(rb.mass);
      this._dynamicActor.setActorFlag(PX.ActorFlag.eVISUALIZATION, true);
      this._dynamicActor.setActorFlag(PX.ActorFlag.eDISABLE_GRAVITY, !rb.useGravity);
      this.setLinearDamping(rb.linearDamping);
      this.setAngularDamping(rb.angularDamping);
      this.setRigidBodyFlag(PX.RigidBodyFlag.eKINEMATIC, rb.isKinematic);
      var lf = rb.linearFactor;
      this._dynamicActor.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_LINEAR_X, !lf.x);
      this._dynamicActor.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_LINEAR_Y, !lf.y);
      this._dynamicActor.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_LINEAR_Z, !lf.z);
      var af = rb.angularFactor;
      this._dynamicActor.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_ANGULAR_X, !af.x);
      this._dynamicActor.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_ANGULAR_Y, !af.y);
      this._dynamicActor.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_ANGULAR_Z, !af.z);
    }
  };
  _proto._switchActor = function _switchActor(isStaticBefore) {
    if (!this._staticActor || !this._dynamicActor) return;
    var a0 = isStaticBefore ? this._staticActor : this._dynamicActor;
    var a1 = !isStaticBefore ? this._staticActor : this._dynamicActor;
    if (this._index >= 0) {
      this.wrappedWorld.scene.removeActor(a0, false);
      addActorToScene(this.wrappedWorld.scene, a1);
    }
    for (var i = 0; i < this.wrappedShapes.length; i++) {
      var ws = this.wrappedShapes[i];
      a0.detachShape(ws.impl, false);
      a1.attachShape(ws.impl);
    }
    if (isStaticBefore) {
      var da = this._dynamicActor;
      setMassAndUpdateInertia(da, this._wrappedBody.rigidBody.mass);
    }
  };
  _proto.addShape = function addShape(ws) {
    var index = this.wrappedShapes.indexOf(ws);
    if (index < 0) {
      ws.setIndex(this.wrappedShapes.length);
      ws.updateFilterData(this._filterData);
      this.impl.attachShape(ws.impl);
      this.wrappedShapes.push(ws);
      if (!ws.collider.isTrigger) {
        if (this.isDynamic) setMassAndUpdateInertia(this.impl, this._wrappedBody.rigidBody.mass);
      }
    }
  };
  _proto.removeShape = function removeShape(ws) {
    var index = this.wrappedShapes.indexOf(ws);
    if (index >= 0) {
      ws.setIndex(-1);
      this.impl.detachShape(ws.impl, true);
      fastRemoveAt(this.wrappedShapes, index);
      if (!ws.collider.isTrigger) {
        if (this.isDynamic) setMassAndUpdateInertia(this.impl, this._wrappedBody.rigidBody.mass);
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
  _proto.setLinearDamping = function setLinearDamping(linDamp) {
    if (!this._dynamicActor) return;
    var dt = PhysicsSystem.instance.fixedTimeStep;
    this._dynamicActor.setLinearDamping((1 - Math.pow(1 - linDamp, dt)) / dt);
  };
  _proto.setAngularDamping = function setAngularDamping(angDamp) {
    if (!this._dynamicActor) return;
    var dt = PhysicsSystem.instance.fixedTimeStep;
    this._dynamicActor.setAngularDamping((1 - Math.pow(1 - angDamp, dt)) / dt);
  };
  _proto.setMass = function setMass(v) {
    if (v <= 0) return;
    if (!this.isDynamic) return;
    setMassAndUpdateInertia(this.impl, v);
  };
  _proto.setType = function setType(v) {
    this._initActor();
    if (this.isStatic) return;
    switch (v) {
      case ERigidBodyType.DYNAMIC:
        this.setRigidBodyFlag(PX.RigidBodyFlag.eKINEMATIC, false);
        break;
      case ERigidBodyType.KINEMATIC:
      default:
        this.setRigidBodyFlag(PX.RigidBodyFlag.eKINEMATIC, true);
        break;
    }
  };
  _proto.setRigidBodyFlag = function setRigidBodyFlag(v, b) {
    if (v === PX.RigidBodyFlag.eKINEMATIC) this._isKinematic = b;
    this.impl.setRigidBodyFlag(v, b);
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    var node = this.node;
    if (node.hasChangedFlags) {
      if (node.hasChangedFlags & TransformBit.SCALE) this.syncScale();
      if (this._isKinematic) {
        var trans = getTempTransform(node.worldPosition, node.worldRotation);
        this.impl.setKinematicTarget(trans);
      } else {
        var _trans = getJsTransform(node.worldPosition, node.worldRotation);
        this.impl.setGlobalPose(_trans, true);
      }
    }
  };
  _proto.syncSceneWithCheck = function syncSceneWithCheck() {
    var node = this.node;
    if (node.hasChangedFlags) {
      if (node.hasChangedFlags & TransformBit.SCALE) this.syncScale();
      var wp = node.worldPosition;
      var wr = node.worldRotation;
      var pose = this.impl.getGlobalPose();
      var dontUpdate = physXEqualsCocosVec3(pose, wp) && physXEqualsCocosQuat(pose, wr);
      if (!dontUpdate) {
        if (this._isKinematic) {
          var trans = getTempTransform(node.worldPosition, node.worldRotation);
          this.impl.setKinematicTarget(trans);
        } else {
          var _trans2 = getJsTransform(node.worldPosition, node.worldRotation);
          this.impl.setGlobalPose(_trans2, true);
        }
      }
    }
  };
  _proto.syncPhysicsToScene = function syncPhysicsToScene() {
    if (!this.isDynamic) return;
    syncNoneStaticToSceneIfWaking(this._dynamicActor, this.node);
  };
  _proto.syncScale = function syncScale() {
    for (var i = 0; i < this.wrappedShapes.length; i++) {
      this.wrappedShapes[i].updateScale();
    }
    for (var _i3 = 0; _i3 < this.wrappedJoints0.length; _i3++) {
      this.wrappedJoints0[_i3].updateScale0();
    }
    for (var _i4 = 0; _i4 < this.wrappedJoints1.length; _i4++) {
      this.wrappedJoints1[_i4].updateScale1();
    }
  };
  _proto.setGroup = function setGroup(v) {
    v >>>= 0;
    this._filterData.word0 = v;
    this.updateFilterData();
  };
  _proto.getGroup = function getGroup() {
    return this._filterData.word0;
  };
  _proto.addGroup = function addGroup(v) {
    v >>>= 0;
    this._filterData.word0 |= v;
    this.updateFilterData();
  };
  _proto.removeGroup = function removeGroup(v) {
    v >>>= 0;
    this._filterData.word0 &= ~v;
    this.updateFilterData();
  };
  _proto.setMask = function setMask(v) {
    v >>>= 0;
    this._filterData.word1 = v;
    this.updateFilterData();
  };
  _proto.getMask = function getMask() {
    return this._filterData.word1;
  };
  _proto.addMask = function addMask(v) {
    v >>>= 0;
    this._filterData.word1 |= v;
    this.updateFilterData();
  };
  _proto.removeMask = function removeMask(v) {
    v >>>= 0;
    this._filterData.word1 &= ~v;
    this.updateFilterData();
  };
  _proto.updateFilterData = function updateFilterData() {
    for (var i = 0; i < this.wrappedShapes.length; i++) {
      this.wrappedShapes[i].updateFilterData(this._filterData);
    }
  };
  _proto.clearForces = function clearForces() {
    if (this._isStatic || this._isKinematic) return;
    this.impl.clearForce(PX.ForceMode.eFORCE);
    this.impl.clearForce(PX.ForceMode.eIMPULSE);
    this.impl.clearTorque(PX.ForceMode.eFORCE);
    this.impl.clearTorque(PX.ForceMode.eIMPULSE);
  };
  _proto.clearVelocity = function clearVelocity() {
    if (this._isStatic || this._isKinematic) return;
    this.impl.setLinearVelocity(Vec3.ZERO, false);
    this.impl.setAngularVelocity(Vec3.ZERO, false);
  };
  _proto.destroy = function destroy() {
    if (this._dynamicActor) {
      if (this._dynamicActor.$$) {
        PX.IMPL_PTR[this._dynamicActor.$$.ptr] = null;
        delete PX.IMPL_PTR[this._dynamicActor.$$.ptr];
      }
      this._dynamicActor.release();
      this._dynamicActor = null;
    }
    if (this._staticActor) {
      if (this._staticActor.$$) {
        PX.IMPL_PTR[this._staticActor.$$.ptr] = null;
        delete PX.IMPL_PTR[this._staticActor.$$.ptr];
      }
      this._staticActor.release();
      this._staticActor = null;
    }
    PhysXSharedBody.sharedBodesMap["delete"](this.node.uuid);
  };
  return _createClass(PhysXSharedBody, [{
    key: "isStatic",
    get: function get() {
      return this._isStatic;
    }
  }, {
    key: "isKinematic",
    get: function get() {
      return this._isKinematic;
    }
  }, {
    key: "isDynamic",
    get: function get() {
      return !this._isStatic && !this._isKinematic;
    }
  }, {
    key: "wrappedBody",
    get: function get() {
      return this._wrappedBody;
    }
  }, {
    key: "filterData",
    get: function get() {
      return this._filterData;
    }
  }, {
    key: "isInScene",
    get: function get() {
      return this._index !== -1;
    }
  }, {
    key: "impl",
    get: function get() {
      this._initActor();
      return this.isStatic ? this._staticActor : this._dynamicActor;
    }
  }, {
    key: "reference",
    set: function set(v) {
      this._ref = v ? this._ref + 1 : this._ref - 1;
      if (this._ref === 0) {
        this.destroy();
      }
    }
  }, {
    key: "enabled",
    set: function set(v) {
      if (v) {
        if (this._index < 0) {
          this._index = this.wrappedWorld.wrappedBodies.length;
          this.wrappedWorld.addActor(this);
        }
      } else if (this._index >= 0) {
        var ws = this.wrappedShapes;
        var wb = this.wrappedBody;
        var isRemove = ws.length === 0 && wb == null || ws.length === 0 && wb != null && !wb.isEnabled;
        if (isRemove) {
          this._index = -1;
          this.clearForces();
          this.clearVelocity();
          this.wrappedWorld.removeActor(this);
        }
      }
    }
  }]);
}();
PhysXSharedBody.idCounter = 0;
PhysXSharedBody.sharedBodesMap = new Map();

var quat = new Quat();
var PhysXContactEquation = function () {
  function PhysXContactEquation(event) {
    this.impl = null;
    this.event = void 0;
    this.colliderA = void 0;
    this.colliderB = void 0;
    this.event = event;
  }
  var _proto = PhysXContactEquation.prototype;
  _proto.getLocalPointOnA = function getLocalPointOnA(out) {
    getContactPosition(this.impl, out, this.event.impl);
    Vec3.subtract(out, out, this.colliderA.node.worldPosition);
  };
  _proto.getLocalPointOnB = function getLocalPointOnB(out) {
    getContactPosition(this.impl, out, this.event.impl);
    Vec3.subtract(out, out, this.colliderB.node.worldPosition);
  };
  _proto.getWorldPointOnA = function getWorldPointOnA(out) {
    getContactPosition(this.impl, out, this.event.impl);
  };
  _proto.getWorldPointOnB = function getWorldPointOnB(out) {
    getContactPosition(this.impl, out, this.event.impl);
  };
  _proto.getLocalNormalOnA = function getLocalNormalOnA(out) {
    this.getWorldNormalOnA(out);
    Quat.conjugate(quat, this.colliderA.node.worldRotation);
    Vec3.transformQuat(out, out, quat);
  };
  _proto.getLocalNormalOnB = function getLocalNormalOnB(out) {
    this.getWorldNormalOnB(out);
    Quat.conjugate(quat, this.colliderB.node.worldRotation);
    Vec3.transformQuat(out, out, quat);
  };
  _proto.getWorldNormalOnA = function getWorldNormalOnA(out) {
    getContactNormal(this.impl, out, this.event.impl);
    if (!this.isBodyA) Vec3.negate(out, out);
  };
  _proto.getWorldNormalOnB = function getWorldNormalOnB(out) {
    getContactNormal(this.impl, out, this.event.impl);
  };
  return _createClass(PhysXContactEquation, [{
    key: "isBodyA",
    get: function get() {
      return this.colliderA.uuid === this.event.selfCollider.uuid;
    }
  }]);
}();

var EPhysXShapeType;
(function (EPhysXShapeType) {
  EPhysXShapeType[EPhysXShapeType["SPHERE"] = 0] = "SPHERE";
  EPhysXShapeType[EPhysXShapeType["BOX"] = 1] = "BOX";
  EPhysXShapeType[EPhysXShapeType["CAPSULE"] = 2] = "CAPSULE";
  EPhysXShapeType[EPhysXShapeType["CYLINDER"] = 3] = "CYLINDER";
  EPhysXShapeType[EPhysXShapeType["CONE"] = 4] = "CONE";
  EPhysXShapeType[EPhysXShapeType["PLANE"] = 5] = "PLANE";
  EPhysXShapeType[EPhysXShapeType["TERRAIN"] = 6] = "TERRAIN";
  EPhysXShapeType[EPhysXShapeType["MESH"] = 7] = "MESH";
})(EPhysXShapeType || (EPhysXShapeType = {}));
var PhysXShape = function () {
  function PhysXShape(type) {
    this.id = void 0;
    this.type = void 0;
    this._impl = null;
    this._collider = null;
    this._flags = void 0;
    this._sharedBody = void 0;
    this._rotation = new Quat(0, 0, 0, 1);
    this._index = -1;
    this._word3 = 0;
    this._isEnabled = false;
    this.type = type;
    this.id = PhysXShape.idCounter++;
  }
  var _proto = PhysXShape.prototype;
  _proto.initialize = function initialize(v) {
    this._collider = v;
    this._flags = getShapeFlags(v.isTrigger);
    this._sharedBody = PhysicsSystem.instance.physicsWorld.getSharedBody(v.node);
    this._sharedBody.reference = true;
    this.onComponentSet();
    addReference(this, this._impl);
  };
  _proto.setIndex = function setIndex(v) {
    this._index = v;
  };
  _proto.onComponentSet = function onComponentSet() {};
  _proto.updateScale = function updateScale() {};
  _proto.onLoad = function onLoad() {
    this.setMaterial(this._collider.sharedMaterial);
    this.setCenter(this._collider.center);
  };
  _proto.onEnable = function onEnable() {
    this.addToBody();
    this._isEnabled = true;
    this._sharedBody.enabled = true;
  };
  _proto.onDisable = function onDisable() {
    this.removeFromBody();
    this._isEnabled = false;
    this._sharedBody.enabled = false;
  };
  _proto.onDestroy = function onDestroy() {
    this._sharedBody.reference = false;
    if (this._impl) {
      removeReference(this, this._impl);
      this._impl.release();
      this._impl = null;
    }
    this._flags = null;
    this._collider = null;
  };
  _proto.setMaterial = function setMaterial(v) {
    var mat = this.getSharedMaterial(v);
    this._impl.setMaterials(getShapeMaterials(mat));
  };
  _proto.getSharedMaterial = function getSharedMaterial(v) {
    var v1 = v == null ? PhysicsSystem.instance.defaultMaterial : v;
    if (!PX.CACHE_MAT[v1.id]) {
      var physics = PhysXInstance.physics;
      var _mat = physics.createMaterial(v1.friction, v1.friction, v1.restitution);
      _mat.setFrictionCombineMode(PX.CombineMode.eMULTIPLY);
      _mat.setRestitutionCombineMode(PX.CombineMode.eMULTIPLY);
      PX.CACHE_MAT[v1.id] = _mat;
      return _mat;
    }
    var mat = PX.CACHE_MAT[v1.id];
    mat.setStaticFriction(v1.friction);
    mat.setDynamicFriction(v1.friction);
    mat.setRestitution(v1.restitution);
    return mat;
  };
  _proto.setAsTrigger = function setAsTrigger(v) {
    if (v) {
      this._impl.setFlag(PX.ShapeFlag.eSIMULATION_SHAPE, !v);
      this._impl.setFlag(PX.ShapeFlag.eTRIGGER_SHAPE, v);
    } else {
      this._impl.setFlag(PX.ShapeFlag.eTRIGGER_SHAPE, v);
      this._impl.setFlag(PX.ShapeFlag.eSIMULATION_SHAPE, !v);
    }
    if (this._index >= 0) {
      this._sharedBody.removeShape(this);
      this._sharedBody.addShape(this);
    }
  };
  _proto.setCenter = function setCenter(v) {
    var pos = _trans.translation;
    var rot = _trans.rotation;
    Vec3.multiply(pos, v, this._collider.node.worldScale);
    Quat.copy(rot, this._rotation);
    var trans = getTempTransform(pos, rot);
    this._impl.setLocalPose(trans);
  };
  _proto.getAABB = function getAABB(v) {
    getShapeWorldBounds(this.impl, this._sharedBody.impl, 1, v);
  };
  _proto.getBoundingSphere = function getBoundingSphere(v) {
    AABB.toBoundingSphere(v, this._collider.worldBounds);
  };
  _proto.setGroup = function setGroup(v) {
    this._sharedBody.setGroup(v);
  };
  _proto.getGroup = function getGroup() {
    return this._sharedBody.getGroup();
  };
  _proto.addGroup = function addGroup(v) {
    this._sharedBody.addGroup(v);
  };
  _proto.removeGroup = function removeGroup(v) {
    this._sharedBody.removeGroup(v);
  };
  _proto.setMask = function setMask(v) {
    this._sharedBody.setMask(v);
  };
  _proto.getMask = function getMask() {
    return this._sharedBody.getMask();
  };
  _proto.addMask = function addMask(v) {
    this._sharedBody.addMask(v);
  };
  _proto.removeMask = function removeMask(v) {
    this._sharedBody.removeMask(v);
  };
  _proto.updateFilterData = function updateFilterData(filterData) {
    this._word3 = EFilterDataWord3.DETECT_CONTACT_CCD;
    if (this._collider.needTriggerEvent) {
      this._word3 |= EFilterDataWord3.DETECT_TRIGGER_EVENT;
    }
    if (this._collider.needCollisionEvent) {
      this._word3 |= EFilterDataWord3.DETECT_CONTACT_EVENT | EFilterDataWord3.DETECT_CONTACT_POINT;
    }
    filterData.word3 = this._word3;
    this.setFilerData(filterData);
  };
  _proto.updateEventListener = function updateEventListener() {
    if (this._sharedBody) this.updateFilterData(this._sharedBody.filterData);
  };
  _proto.updateByReAdd = function updateByReAdd() {
    if (this._isEnabled) {
      this.removeFromBody();
      this.addToBody();
    }
  };
  _proto.setFilerData = function setFilerData(filterData) {
    this._impl.setQueryFilterData(filterData);
    this._impl.setSimulationFilterData(filterData);
  };
  _proto.addToBody = function addToBody() {
    this._sharedBody.addShape(this);
  };
  _proto.removeFromBody = function removeFromBody() {
    this._sharedBody.removeShape(this);
  };
  return _createClass(PhysXShape, [{
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
    key: "attachedRigidBody",
    get: function get() {
      return null;
    }
  }], [{
    key: "MESH_SCALE",
    get: function get() {
      if (!this._MESH_SCALE) {
        this._MESH_SCALE = new PX.MeshScale(Vec3.ZERO, Quat.IDENTITY);
      }
      return this._MESH_SCALE;
    }
  }]);
}();
PhysXShape._MESH_SCALE = void 0;
PhysXShape.idCounter = 0;

var v3_0$5 = new Vec3(0, 0, 0);
var v3_1$1 = new Vec3(0, 0, 0);
var PhysXCharacterController = function () {
  function PhysXCharacterController() {
    this._isEnabled = false;
    this._impl = null;
    this._comp = null;
    this._pxCollisionFlags = 0;
    this._filterData = void 0;
    this._queryFilterCB = null;
    this._word3 = 0;
    this._overlapRecovery = true;
    this.id = void 0;
    this.id = PhysXCharacterController.idCounter++;
    this._filterData = {
      word0: 1,
      word1: 1,
      word2: 1,
      word3: 0
    };
  }
  var _proto = PhysXCharacterController.prototype;
  _proto.onComponentSet = function onComponentSet() {};
  _proto.create = function create() {};
  _proto.updateScale = function updateScale() {};
  _proto.initialize = function initialize(comp) {
    this._comp = comp;
    this._queryFilterCB = PX.PxQueryFilterCallback.implement(PhysXCharacterController.queryCallback);
    var group = this._comp.group;
    this._filterData.word0 = this._comp.group;
    var mask = PhysicsSystem.instance.collisionMatrix[group];
    this._filterData.word1 = mask;
    this.onComponentSet();
    if (this._impl == null) {
      error('[Physics]: Initialize PhysXCharacterController Failed');
      return false;
    } else {
      return true;
    }
  };
  _proto.onEnable = function onEnable() {
    this._isEnabled = true;
    if (!this._impl) {
      this.onComponentSet();
    }
    this.setDetectCollisions(true);
    this.setOverlapRecovery(true);
    PhysicsSystem.instance.physicsWorld.addCCT(this);
  };
  _proto.onDisable = function onDisable() {
    this._isEnabled = false;
    PhysicsSystem.instance.physicsWorld.removeCCT(this);
    this.onDestroy();
  };
  _proto.onLoad = function onLoad() {};
  _proto.release = function release() {
    if (this._impl) {
      if (this._impl.$$) {
        PX.IMPL_PTR[this._impl.$$.ptr] = null;
        delete PX.IMPL_PTR[this._impl.$$.ptr];
        var shapePtr = this._impl.getShape().$$.ptr;
        PX.IMPL_PTR[shapePtr] = null;
        delete PX.IMPL_PTR[shapePtr];
      }
      this._impl.release();
      this._impl = null;
    }
  };
  _proto.onDestroy = function onDestroy() {
    this.release();
  };
  _proto.getPosition = function getPosition(out) {
    if (!this._impl) return;
    Vec3.copy(out, this._impl.getPosition());
  };
  _proto.setPosition = function setPosition(value) {
    if (!this._impl) return;
    this._impl.setPosition(value);
    this.syncPhysicsToScene();
  };
  _proto.setContactOffset = function setContactOffset(value) {
    if (!this._impl) return;
    this._impl.setContactOffset(value);
  };
  _proto.setStepOffset = function setStepOffset(value) {
    if (!this._impl) return;
    this._impl.setStepOffset(value);
  };
  _proto.setSlopeLimit = function setSlopeLimit(value) {
    if (!this._impl) return;
    this._impl.setSlopeLimit(Math.cos(degreesToRadians(value)));
  };
  _proto.setDetectCollisions = function setDetectCollisions(value) {
    if (!this._impl) return;
    this._impl.setCollision(value);
  };
  _proto.setQuery = function setQuery(value) {
    if (!this._impl) return;
    this._impl.setQuery(value);
  };
  _proto.setOverlapRecovery = function setOverlapRecovery(value) {
    this._overlapRecovery = value;
  };
  _proto.onGround = function onGround() {
    return (this._pxCollisionFlags & 1 << 2) > 0;
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    var node = this.characterController.node;
    if (node.hasChangedFlags) {
      if (node.hasChangedFlags & TransformBit.SCALE) this.syncScale();
      if (node.hasChangedFlags & TransformBit.POSITION) {
        Vec3.add(v3_0$5, node.worldPosition, this.scaledCenter);
        this.setPosition(v3_0$5);
      }
    }
  };
  _proto.syncPhysicsToScene = function syncPhysicsToScene() {
    this.getPosition(v3_0$5);
    v3_0$5.subtract(this.scaledCenter);
    this._comp.node.setWorldPosition(v3_0$5);
  };
  _proto.syncScale = function syncScale() {
    this.updateScale();
  };
  _proto.move = function move(movement, minDist, elapsedTime) {
    if (!this._isEnabled) {
      return;
    }
    PhysicsSystem.instance.physicsWorld.controllerManager.setOverlapRecoveryModule(this._overlapRecovery);
    this._pxCollisionFlags = this._impl.move(movement, minDist, elapsedTime, this.filterData, this.queryFilterCB);
  };
  _proto.setGroup = function setGroup(v) {
    v >>>= 0;
    this._filterData.word0 = v;
    this.updateFilterData();
  };
  _proto.getGroup = function getGroup() {
    return this._filterData.word0;
  };
  _proto.addGroup = function addGroup(v) {
    v >>>= 0;
    this._filterData.word0 |= v;
    this.updateFilterData();
  };
  _proto.removeGroup = function removeGroup(v) {
    v >>>= 0;
    this._filterData.word0 &= ~v;
    this.updateFilterData();
  };
  _proto.setMask = function setMask(v) {
    v >>>= 0;
    this._filterData.word1 = v;
    this.updateFilterData();
  };
  _proto.getMask = function getMask() {
    return this._filterData.word1;
  };
  _proto.addMask = function addMask(v) {
    v >>>= 0;
    this._filterData.word1 |= v;
    this.updateFilterData();
  };
  _proto.removeMask = function removeMask(v) {
    v >>>= 0;
    this._filterData.word1 &= ~v;
    this.updateFilterData();
  };
  _proto.updateEventListener = function updateEventListener() {
    this.updateFilterData();
  };
  _proto.updateFilterData = function updateFilterData() {
    if (!this._impl) return;
    this._impl.setSimulationFilterData(this.filterData);
  };
  return _createClass(PhysXCharacterController, [{
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
    key: "filterData",
    get: function get() {
      return this._filterData;
    }
  }, {
    key: "queryFilterCB",
    get: function get() {
      return this._queryFilterCB;
    }
  }, {
    key: "scaledCenter",
    get: function get() {
      Vec3.multiply(v3_1$1, this._comp.center, this._comp.node.worldScale);
      return v3_1$1;
    }
  }]);
}();
PhysXCharacterController.idCounter = 0;
PhysXCharacterController.queryCallback = {
  preFilter: function preFilter(filterData, shape, _actor, _out) {
    var pxShape = getWrapShape(shape);
    if (!pxShape) {
      return PX.QueryHitType.eNONE;
    }
    var collider = pxShape.collider;
    if (!(filterData.word0 & collider.getMask()) || !(filterData.word1 & collider.getGroup())) {
      return PX.QueryHitType.eNONE;
    }
    return PX.QueryHitType.eBLOCK;
  }
};

var CC_QUAT_0$1 = new Quat();
var CC_V3_0$1 = new Vec3();
var CC_V3_1$1 = new Vec3();
var CC_V3_2 = new Vec3();
var CC_COLOR_0 = new Color(0, 0, 0, 0);
var PhysXWorld = function (_PhysXInstance) {
  function PhysXWorld() {
    var _this;
    _this = _PhysXInstance.call(this) || this;
    _this.scene = void 0;
    _this.callback = PhysXCallback;
    _this.wrappedBodies = [];
    _this.ccts = [];
    _this.controllerManager = void 0;
    _this._isNeedFetch = false;
    _this._debugLineCount = 0;
    _this._MAX_DEBUG_LINE_COUNT = 16384;
    _this._debugDrawFlags = EPhysicsDrawFlags.NONE;
    _this._debugConstraintSize = 0.3;
    initializeWorld(_this);
    return _this;
  }
  _inheritsLoose(PhysXWorld, _PhysXInstance);
  var _proto = PhysXWorld.prototype;
  _proto.setAllowSleep = function setAllowSleep(_v) {};
  _proto.setDefaultMaterial = function setDefaultMaterial(_v) {};
  _proto.setGravity = function setGravity(gravity) {
    this.scene.setGravity(gravity);
  };
  _proto.destroy = function destroy() {
    if (this.wrappedBodies.length) error('You should destroy all physics component first.');
    this.scene.release();
  };
  _proto.step = function step(deltaTime, _timeSinceLastCalled, _maxSubStep) {
    if (this.wrappedBodies.length === 0) return;
    this._simulate(deltaTime);
    if (!PX.MULTI_THREAD) {
      this._fetchResults();
      for (var i = 0; i < this.wrappedBodies.length; i++) {
        var body = this.wrappedBodies[i];
        body.syncPhysicsToScene();
      }
    }
    this._debugDraw();
  };
  _proto._simulate = function _simulate(dt) {
    if (!this._isNeedFetch) {
      simulateScene(this.scene, dt);
      this._isNeedFetch = true;
    }
  };
  _proto._fetchResults = function _fetchResults() {
    if (this._isNeedFetch) {
      this.scene.fetchResults(true);
      this._isNeedFetch = false;
    }
  };
  _proto.syncSceneToPhysics = function syncSceneToPhysics() {
    for (var i = 0; i < this.wrappedBodies.length; i++) {
      var body = this.wrappedBodies[i];
      body.syncSceneToPhysics();
    }
    var ccts = this.ccts;
    var length = ccts.length;
    for (var _i = 0; _i < length; _i++) {
      var cct = ccts[_i];
      cct.syncSceneToPhysics();
    }
  };
  _proto.syncPhysicsToScene = function syncPhysicsToScene() {
    this._fetchResults();
    for (var i = 0; i < this.wrappedBodies.length; i++) {
      var body = this.wrappedBodies[i];
      body.syncPhysicsToScene();
    }
  };
  _proto.syncAfterEvents = function syncAfterEvents() {
    for (var i = 0; i < this.wrappedBodies.length; i++) {
      var body = this.wrappedBodies[i];
      body.syncSceneWithCheck();
    }
  };
  _proto._setDebugDrawMode = function _setDebugDrawMode() {
    if (this._debugDrawFlags & EPhysicsDrawFlags.WIRE_FRAME) {
      this.scene.setVisualizationParameter(PX.PxVisualizationParameter.eCOLLISION_SHAPES, 1);
    } else {
      this.scene.setVisualizationParameter(PX.PxVisualizationParameter.eCOLLISION_SHAPES, 0);
    }
    var drawConstraint = Boolean(this._debugDrawFlags & EPhysicsDrawFlags.CONSTRAINT);
    var internalConstraintSize = drawConstraint ? this._debugConstraintSize : 0;
    this.scene.setVisualizationParameter(PX.PxVisualizationParameter.eJOINT_LOCAL_FRAMES, internalConstraintSize);
    this.scene.setVisualizationParameter(PX.PxVisualizationParameter.eJOINT_LIMITS, internalConstraintSize);
    if (this._debugDrawFlags & EPhysicsDrawFlags.AABB) {
      this.scene.setVisualizationParameter(PX.PxVisualizationParameter.eCOLLISION_AABBS, 1);
    } else {
      this.scene.setVisualizationParameter(PX.PxVisualizationParameter.eCOLLISION_AABBS, 0);
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
    var rbPtr = this.scene.getRenderBufferPtr();
    var nbLine = PX.PxRenderBuffer_GetNbLines(rbPtr);
    for (var i = 0; i < nbLine; i++) {
      var linePtr = PX.PxRenderBuffer_GetLineAt(rbPtr, i);
      this._onDebugDrawLine(linePtr);
    }
    var nbTriangle = PX.PxRenderBuffer_GetNbTriangles(rbPtr);
    for (var _i2 = 0; _i2 < nbTriangle; _i2++) {
      var trianglePtr = PX.PxRenderBuffer_GetTriangleAt(rbPtr, _i2);
      this._onDebugDrawTriangle(trianglePtr);
    }
  };
  _proto._onDebugDrawLine = function _onDebugDrawLine(linePtr) {
    var debugRenderer = this._getDebugRenderer();
    if (debugRenderer && this._debugLineCount < this._MAX_DEBUG_LINE_COUNT) {
      this._debugLineCount++;
      var f32RawPtr = PX.HEAPF32.subarray(linePtr / 4, linePtr / 4 + 3 * 8);
      var u32RawPtr = PX.HEAPU32.subarray(linePtr / 4, linePtr / 4 + 3 * 8);
      CC_V3_0$1.x = f32RawPtr[0];
      CC_V3_0$1.y = f32RawPtr[1];
      CC_V3_0$1.z = f32RawPtr[2];
      var color0 = u32RawPtr[3];
      CC_V3_1$1.x = f32RawPtr[4];
      CC_V3_1$1.y = f32RawPtr[5];
      CC_V3_1$1.z = f32RawPtr[6];
      getColorPXColor(CC_COLOR_0, color0);
      debugRenderer.addLine(CC_V3_0$1, CC_V3_1$1, CC_COLOR_0);
    }
  };
  _proto._onDebugDrawTriangle = function _onDebugDrawTriangle(trianglePtr) {
    var debugRenderer = this._getDebugRenderer();
    if (debugRenderer && this._MAX_DEBUG_LINE_COUNT - this._debugLineCount >= 3) {
      this._debugLineCount += 3;
      var f32RawPtr = PX.HEAPF32.subarray(trianglePtr / 4, trianglePtr / 4 + 3 * 12);
      var u32RawPtr = PX.HEAPU32.subarray(trianglePtr / 4, trianglePtr / 4 + 3 * 12);
      CC_V3_0$1.x = f32RawPtr[0];
      CC_V3_0$1.y = f32RawPtr[1];
      CC_V3_0$1.z = f32RawPtr[2];
      var color0 = u32RawPtr[3];
      CC_V3_1$1.x = f32RawPtr[4];
      CC_V3_1$1.y = f32RawPtr[5];
      CC_V3_1$1.z = f32RawPtr[6];
      CC_V3_2.x = f32RawPtr[8];
      CC_V3_2.y = f32RawPtr[9];
      CC_V3_2.z = f32RawPtr[10];
      getColorPXColor(CC_COLOR_0, color0);
      debugRenderer.addLine(CC_V3_0$1, CC_V3_1$1, CC_COLOR_0);
      debugRenderer.addLine(CC_V3_1$1, CC_V3_2, CC_COLOR_0);
      debugRenderer.addLine(CC_V3_2, CC_V3_0$1, CC_COLOR_0);
    }
  };
  _proto.getSharedBody = function getSharedBody(node, wrappedBody) {
    return PhysXSharedBody.getSharedBody(node, this, wrappedBody);
  };
  _proto.addActor = function addActor(body) {
    var index = this.wrappedBodies.indexOf(body);
    if (index < 0) {
      addActorToScene(this.scene, body.impl);
      this.wrappedBodies.push(body);
    }
  };
  _proto.removeActor = function removeActor(body) {
    var index = this.wrappedBodies.indexOf(body);
    if (index >= 0) {
      this.scene.removeActor(body.impl, true);
      fastRemoveAt(this.wrappedBodies, index);
    }
  };
  _proto.addCCT = function addCCT(cct) {
    var index = this.ccts.indexOf(cct);
    if (index < 0) {
      this.ccts.push(cct);
    }
  };
  _proto.removeCCT = function removeCCT(cct) {
    var index = this.ccts.indexOf(cct);
    if (index >= 0) {
      fastRemoveAt(this.ccts, index);
    }
  };
  _proto.addConstraint = function addConstraint(_constraint) {};
  _proto.removeConstraint = function removeConstraint(_constraint) {};
  _proto.raycast = function raycast(worldRay, options, pool, results) {
    return raycastAll(this, worldRay, options, pool, results);
  };
  _proto.raycastClosest = function raycastClosest$1(worldRay, options, result) {
    return raycastClosest(this, worldRay, options, result);
  };
  _proto.sweepBox = function sweepBox(worldRay, halfExtent, orientation, options, pool, results) {
    if (!PhysXWorld._sweepBoxGeometry) {
      PhysXWorld._sweepBoxGeometry = new PX.BoxGeometry(halfExtent);
    }
    PhysXWorld._sweepBoxGeometry.setHalfExtents(halfExtent);
    return sweepAll(this, worldRay, PhysXWorld._sweepBoxGeometry, orientation, options, pool, results);
  };
  _proto.sweepBoxClosest = function sweepBoxClosest(worldRay, halfExtent, orientation, options, result) {
    if (!PhysXWorld._sweepBoxGeometry) {
      PhysXWorld._sweepBoxGeometry = new PX.BoxGeometry(halfExtent);
    }
    PhysXWorld._sweepBoxGeometry.setHalfExtents(halfExtent);
    return sweepClosest(this, worldRay, PhysXWorld._sweepBoxGeometry, orientation, options, result);
  };
  _proto.sweepSphere = function sweepSphere(worldRay, radius, options, pool, results) {
    if (!PhysXWorld._sweepSphereGeometry) {
      PhysXWorld._sweepSphereGeometry = new PX.SphereGeometry(radius);
    }
    PhysXWorld._sweepSphereGeometry.setRadius(radius);
    return sweepAll(this, worldRay, PhysXWorld._sweepSphereGeometry, Quat.IDENTITY, options, pool, results);
  };
  _proto.sweepSphereClosest = function sweepSphereClosest(worldRay, radius, options, result) {
    if (!PhysXWorld._sweepSphereGeometry) {
      PhysXWorld._sweepSphereGeometry = new PX.SphereGeometry(radius);
    }
    PhysXWorld._sweepSphereGeometry.setRadius(radius);
    return sweepClosest(this, worldRay, PhysXWorld._sweepSphereGeometry, Quat.IDENTITY, options, result);
  };
  _proto.sweepCapsule = function sweepCapsule(worldRay, radius, height, orientation, options, pool, results) {
    if (!PhysXWorld._sweepCapsuleGeometry) {
      PhysXWorld._sweepCapsuleGeometry = new PX.CapsuleGeometry(radius, height / 2);
    }
    PhysXWorld._sweepCapsuleGeometry.setRadius(radius);
    PhysXWorld._sweepCapsuleGeometry.setHalfHeight(height / 2);
    var finalOrientation = CC_QUAT_0$1;
    Quat.fromEuler(finalOrientation, 0, 0, 90);
    Quat.multiply(finalOrientation, orientation, finalOrientation);
    return sweepAll(this, worldRay, PhysXWorld._sweepCapsuleGeometry, finalOrientation, options, pool, results);
  };
  _proto.sweepCapsuleClosest = function sweepCapsuleClosest(worldRay, radius, height, orientation, options, result) {
    if (!PhysXWorld._sweepCapsuleGeometry) {
      PhysXWorld._sweepCapsuleGeometry = new PX.CapsuleGeometry(radius, height / 2);
    }
    PhysXWorld._sweepCapsuleGeometry.setRadius(radius);
    PhysXWorld._sweepCapsuleGeometry.setHalfHeight(height / 2);
    var finalOrientation = CC_QUAT_0$1;
    Quat.fromEuler(finalOrientation, 0, 0, 90);
    Quat.multiply(finalOrientation, orientation, finalOrientation);
    return sweepClosest(this, worldRay, PhysXWorld._sweepCapsuleGeometry, finalOrientation, options, result);
  };
  _proto.emitEvents = function emitEvents() {
    PhysXCallback.emitTriggerEvent();
    PhysXCallback.emitCollisionEvent();
    PhysXCallback.emitCCTCollisionEvent();
    PhysXCallback.emitCCTTriggerEvent();
  };
  return _createClass(PhysXWorld, [{
    key: "impl",
    get: function get() {
      return this.scene;
    }
  }, {
    key: "debugDrawFlags",
    get: function get() {
      return this._debugDrawFlags;
    },
    set: function set(v) {
      this._debugDrawFlags = v;
      this._setDebugDrawMode();
    }
  }, {
    key: "debugDrawConstraintSize",
    get: function get() {
      return this._debugConstraintSize;
    },
    set: function set(v) {
      this._debugConstraintSize = v;
      this._setDebugDrawMode();
    }
  }]);
}(PhysXInstance);
PhysXWorld._sweepBoxGeometry = void 0;
PhysXWorld._sweepSphereGeometry = void 0;
PhysXWorld._sweepCapsuleGeometry = void 0;
var triggerEventBeginDic = new TupleDictionary();
var triggerEventEndDic = new TupleDictionary();
var triggerEventsPool = [];
var contactEventDic = new TupleDictionary();
var contactEventsPool = [];
var contactsPool = [];
var cctShapeEventDic = new TupleDictionary();
var emitHit = new CharacterControllerContact();
var cctTriggerEventBeginDic = new TupleDictionary();
var cctTriggerEventEndDic = new TupleDictionary();
var cctTriggerEventsPool = [];
var PhysXCallback = {
  eventCallback: {
    onContactBegin: function onContactBegin(a, b, c, d, o) {
      var wpa = getWrapShape(a);
      var wpb = getWrapShape(b);
      PhysXCallback.onCollision('onCollisionEnter', wpa, wpb, c, d, o);
    },
    onContactEnd: function onContactEnd(a, b, c, d, o) {
      var wpa = getWrapShape(a);
      var wpb = getWrapShape(b);
      PhysXCallback.onCollision('onCollisionExit', wpa, wpb, c, d, o);
    },
    onContactPersist: function onContactPersist(a, b, c, d, o) {
      var wpa = getWrapShape(a);
      var wpb = getWrapShape(b);
      PhysXCallback.onCollision('onCollisionStay', wpa, wpb, c, d, o);
    },
    onTriggerBegin: function onTriggerBegin(a, b) {
      var wpa = getWrapShape(a);
      var wpb = getWrapShape(b);
      if (wpa instanceof PhysXShape && wpb instanceof PhysXShape) {
        PhysXCallback.onTrigger('onTriggerEnter', wpa, wpb, true);
      } else if (wpa instanceof PhysXShape && wpb instanceof PhysXCharacterController) {
        PhysXCallback.onTriggerCCT('onControllerTriggerEnter', wpa, wpb, true);
      } else if (wpa instanceof PhysXCharacterController && wpb instanceof PhysXShape) {
        PhysXCallback.onTriggerCCT('onControllerTriggerEnter', wpb, wpa, true);
      }
    },
    onTriggerEnd: function onTriggerEnd(a, b) {
      var wpa = getWrapShape(a);
      var wpb = getWrapShape(b);
      if (wpa instanceof PhysXShape && wpb instanceof PhysXShape) {
        PhysXCallback.onTrigger('onTriggerExit', wpa, wpb, false);
      } else if (wpa instanceof PhysXShape && wpb instanceof PhysXCharacterController) {
        PhysXCallback.onTriggerCCT('onControllerTriggerExit', wpa, wpb, false);
      } else if (wpa instanceof PhysXCharacterController && wpb instanceof PhysXShape) {
        PhysXCallback.onTriggerCCT('onControllerTriggerExit', wpb, wpa, false);
      }
    }
  },
  queryCallback: {
    preFilter: function preFilter(filterData, shape, _actor, _out) {
      var word3 = filterData.word3;
      var shapeFlags = shape.getFlags();
      if (word3 & EFilterDataWord3.QUERY_CHECK_TRIGGER && shapeFlags.isSet(PX.ShapeFlag.eTRIGGER_SHAPE)) {
        return PX.QueryHitType.eNONE;
      }
      return word3 & EFilterDataWord3.QUERY_SINGLE_HIT ? PX.QueryHitType.eBLOCK : PX.QueryHitType.eTOUCH;
    },
    preFilterForByteDance: function preFilterForByteDance(filterData, shapeFlags, hitFlags) {
      var word3 = filterData.word3;
      if (word3 & EFilterDataWord3.QUERY_CHECK_TRIGGER && shapeFlags & PX.ShapeFlag.eTRIGGER_SHAPE) {
        return PX.QueryHitType.eNONE;
      }
      return word3 & EFilterDataWord3.QUERY_SINGLE_HIT ? PX.QueryHitType.eBLOCK : PX.QueryHitType.eTOUCH;
    }
  },
  onTrigger: function onTrigger(type, wpa, wpb, isEnter) {
    if (wpa && wpb) {
      if (wpa.collider.needTriggerEvent || wpb.collider.needTriggerEvent) {
        var tE;
        if (triggerEventsPool.length > 0) {
          tE = triggerEventsPool.pop();
          tE.a = wpa;
          tE.b = wpb;
          tE.times = 0;
        } else {
          tE = {
            a: wpa,
            b: wpb,
            times: 0
          };
        }
        if (isEnter) {
          triggerEventBeginDic.set(wpa.id, wpb.id, tE);
        } else {
          triggerEventEndDic.set(wpa.id, wpb.id, tE);
        }
      }
    }
  },
  onTriggerCCT: function onTriggerCCT(type, wpa, cct, isEnter) {
    if (wpa && cct) {
      if (wpa.collider.needTriggerEvent) {
        var tE;
        if (cctTriggerEventsPool.length > 0) {
          tE = cctTriggerEventsPool.pop();
          tE.a = wpa;
          tE.b = cct;
          tE.times = 0;
        } else {
          tE = {
            a: wpa,
            b: cct,
            times: 0
          };
        }
        if (isEnter) {
          cctTriggerEventBeginDic.set(wpa.id, cct.id, tE);
        } else {
          cctTriggerEventEndDic.set(wpa.id, cct.id, tE);
        }
      }
    }
  },
  emitTriggerEvent: function emitTriggerEvent() {
    var len = triggerEventEndDic.getLength();
    while (len--) {
      var key = triggerEventEndDic.getKeyByIndex(len);
      var data = triggerEventEndDic.getDataByKey(key);
      triggerEventsPool.push(data);
      var dataBeg = triggerEventBeginDic.getDataByKey(key);
      if (dataBeg) {
        triggerEventsPool.push(dataBeg);
        triggerEventBeginDic.set(data.a.id, data.b.id, null);
      }
      var colliderA = data.a.collider;
      var colliderB = data.b.collider;
      if (colliderA && colliderB) {
        var type = 'onTriggerExit';
        TriggerEventObject.type = type;
        if (colliderA.needTriggerEvent) {
          TriggerEventObject.selfCollider = colliderA;
          TriggerEventObject.otherCollider = colliderB;
          colliderA.emit(type, TriggerEventObject);
        }
        if (colliderB.needTriggerEvent) {
          TriggerEventObject.selfCollider = colliderB;
          TriggerEventObject.otherCollider = colliderA;
          colliderB.emit(type, TriggerEventObject);
        }
      }
    }
    triggerEventEndDic.reset();
    len = triggerEventBeginDic.getLength();
    while (len--) {
      var _key = triggerEventBeginDic.getKeyByIndex(len);
      var _data = triggerEventBeginDic.getDataByKey(_key);
      var _colliderA = _data.a.collider;
      var _colliderB = _data.b.collider;
      if (!_colliderA || !_colliderA.isValid || !_colliderB || !_colliderB.isValid) {
        triggerEventsPool.push(_data);
        triggerEventBeginDic.set(_data.a.id, _data.b.id, null);
      } else {
        var _type = _data.times++ ? 'onTriggerStay' : 'onTriggerEnter';
        TriggerEventObject.type = _type;
        if (_colliderA.needTriggerEvent) {
          TriggerEventObject.selfCollider = _colliderA;
          TriggerEventObject.otherCollider = _colliderB;
          _colliderA.emit(_type, TriggerEventObject);
        }
        if (_colliderB.needTriggerEvent) {
          TriggerEventObject.selfCollider = _colliderB;
          TriggerEventObject.otherCollider = _colliderA;
          _colliderB.emit(_type, TriggerEventObject);
        }
      }
    }
  },
  onCollision: function onCollision(type, wpa, wpb, c, d, o) {
    if (wpa && wpb) {
      if (wpa.collider.needCollisionEvent || wpb.collider.needCollisionEvent) {
        if (contactEventsPool.length > 0) {
          var cE = contactEventsPool.pop();
          cE.type = type;
          cE.a = wpa;
          cE.b = wpb;
          cE.contactCount = c;
          cE.buffer = d;
          cE.offset = o;
          contactEventDic.set(wpa.id, wpb.id, cE);
        } else {
          var _cE = {
            type: type,
            a: wpa,
            b: wpb,
            contactCount: c,
            buffer: d,
            offset: o
          };
          contactEventDic.set(wpa.id, wpb.id, _cE);
        }
      }
    }
  },
  emitCollisionEvent: function emitCollisionEvent() {
    var len = contactEventDic.getLength();
    while (len--) {
      var key = contactEventDic.getKeyByIndex(len);
      var data = contactEventDic.getDataByKey(key);
      contactEventsPool.push(data);
      var colliderA = data.a.collider;
      var colliderB = data.b.collider;
      if (colliderA && colliderA.isValid && colliderB && colliderB.isValid) {
        CollisionEventObject.type = data.type;
        CollisionEventObject.impl = data.buffer;
        var c = data.contactCount;
        data.buffer;
        var o = data.offset;
        var contacts = CollisionEventObject.contacts;
        contactsPool.push.apply(contactsPool, contacts);
        contacts.length = 0;
        for (var i = 0; i < c; i++) {
          if (contactsPool.length > 0) {
            var _c = contactsPool.pop();
            _c.colliderA = colliderA;
            _c.colliderB = colliderB;
            _c.impl = getContactDataOrByteOffset(i, o);
            contacts.push(_c);
          } else {
            var _c2 = new PhysXContactEquation(CollisionEventObject);
            _c2.colliderA = colliderA;
            _c2.colliderB = colliderB;
            _c2.impl = getContactDataOrByteOffset(i, o);
            contacts.push(_c2);
          }
        }
        if (colliderA.needCollisionEvent) {
          CollisionEventObject.selfCollider = colliderA;
          CollisionEventObject.otherCollider = colliderB;
          colliderA.emit(CollisionEventObject.type, CollisionEventObject);
        }
        if (colliderB.needCollisionEvent) {
          CollisionEventObject.selfCollider = colliderB;
          CollisionEventObject.otherCollider = colliderA;
          colliderB.emit(CollisionEventObject.type, CollisionEventObject);
        }
      }
    }
    contactEventDic.reset();
  },
  controllerHitReportCB: {
    onShapeHit: function onShapeHit(hit) {
      var cct = getWrapShape(hit.getCurrentController());
      var s = getWrapShape(hit.getTouchedShape());
      var item = cctShapeEventDic.get(hit.getCurrentController(), hit.getTouchedShape());
      if (!item) {
        var worldPos = new Vec3();
        worldPos.set(hit.worldPos.x, hit.worldPos.y, hit.worldPos.z);
        var worldNormal = new Vec3();
        worldNormal.set(hit.worldNormal.x, hit.worldNormal.y, hit.worldNormal.z);
        var motionDir = new Vec3();
        motionDir.set(hit.dir.x, hit.dir.y, hit.dir.z);
        var motionLength = hit.length;
        item = cctShapeEventDic.set(hit.getCurrentController(), hit.getTouchedShape(), {
          PhysXCharacterController: cct,
          PhysXShape: s,
          worldPos: worldPos,
          worldNormal: worldNormal,
          motionDir: motionDir,
          motionLength: motionLength
        });
      }
    },
    onControllerHit: function onControllerHit(hit) {}
  },
  emitCCTCollisionEvent: function emitCCTCollisionEvent() {
    var dicL = cctShapeEventDic.getLength();
    while (dicL--) {
      var key = cctShapeEventDic.getKeyByIndex(dicL);
      var data = cctShapeEventDic.getDataByKey(key);
      var cct = data.PhysXCharacterController.characterController;
      var collider = data.PhysXShape.collider;
      if (cct && cct.isValid && collider && collider.isValid) {
        emitHit.controller = cct;
        emitHit.collider = collider;
        emitHit.worldPosition.set(data.worldPos);
        emitHit.worldNormal.set(data.worldNormal);
        emitHit.motionDirection.set(data.motionDir);
        emitHit.motionLength = data.motionLength;
        cct.emit('onControllerColliderHit', emitHit);
      }
    }
    cctShapeEventDic.reset();
  },
  emitCCTTriggerEvent: function emitCCTTriggerEvent() {
    var len = cctTriggerEventEndDic.getLength();
    while (len--) {
      var key = cctTriggerEventEndDic.getKeyByIndex(len);
      var data = cctTriggerEventEndDic.getDataByKey(key);
      cctTriggerEventsPool.push(data);
      var dataBeg = cctTriggerEventBeginDic.getDataByKey(key);
      if (dataBeg) {
        cctTriggerEventsPool.push(dataBeg);
        cctTriggerEventBeginDic.set(data.a.id, data.b.id, null);
      }
      var collider = data.a.collider;
      var characterController = data.b.characterController;
      if (collider && characterController) {
        var type = 'onControllerTriggerExit';
        CharacterTriggerEventObject.type = type;
        if (collider.needTriggerEvent) {
          CharacterTriggerEventObject.collider = collider;
          CharacterTriggerEventObject.characterController = characterController;
          collider.emit(type, CharacterTriggerEventObject);
        }
        if (characterController.needTriggerEvent) {
          CharacterTriggerEventObject.collider = collider;
          CharacterTriggerEventObject.characterController = characterController;
          characterController.emit(type, CharacterTriggerEventObject);
        }
      }
    }
    cctTriggerEventEndDic.reset();
    len = cctTriggerEventBeginDic.getLength();
    while (len--) {
      var _key2 = cctTriggerEventBeginDic.getKeyByIndex(len);
      var _data2 = cctTriggerEventBeginDic.getDataByKey(_key2);
      var _collider = _data2.a.collider;
      var _characterController = _data2.b.characterController;
      if (!_collider || !_collider.isValid || !_characterController || !_characterController.isValid) {
        cctTriggerEventsPool.push(_data2);
        cctTriggerEventBeginDic.set(_data2.a.id, _data2.b.id, null);
      } else {
        var _type2 = _data2.times++ ? 'onControllerTriggerStay' : 'onControllerTriggerEnter';
        CharacterTriggerEventObject.type = _type2;
        if (_collider.needTriggerEvent) {
          CharacterTriggerEventObject.collider = _collider;
          CharacterTriggerEventObject.characterController = _characterController;
          _collider.emit(_type2, CharacterTriggerEventObject);
        }
        if (_characterController.needTriggerEvent) {
          CharacterTriggerEventObject.collider = _collider;
          CharacterTriggerEventObject.characterController = _characterController;
          _characterController.emit(_type2, CharacterTriggerEventObject);
        }
      }
    }
  }
};

var v3_0$4 = new Vec3();
var PhysXRigidBody = function () {
  function PhysXRigidBody() {
    this.isSleepy = false;
    this._isEnabled = false;
    this._isUsingCCD = false;
    this._rigidBody = void 0;
    this._sharedBody = void 0;
  }
  var _proto = PhysXRigidBody.prototype;
  _proto.initialize = function initialize(v) {
    this._rigidBody = v;
    this._sharedBody = PhysicsSystem.instance.physicsWorld.getSharedBody(v.node, this);
    this._sharedBody.reference = true;
    this.setSleepThreshold(PhysicsSystem.instance.sleepThreshold);
  };
  _proto.onEnable = function onEnable() {
    this._isEnabled = true;
    this.setMass(this._rigidBody.mass);
    this.setType(this._rigidBody.type);
    this.setAllowSleep(this._rigidBody.allowSleep);
    this.setLinearDamping(this._rigidBody.linearDamping);
    this.setAngularDamping(this._rigidBody.angularDamping);
    this.setLinearFactor(this._rigidBody.linearFactor);
    this.setAngularFactor(this._rigidBody.angularFactor);
    this.useGravity(this._rigidBody.useGravity);
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
  _proto.setType = function setType(v) {
    this._sharedBody.setType(v);
  };
  _proto.setMass = function setMass(v) {
    if (this.isStatic) return;
    this._sharedBody.setMass(v);
  };
  _proto.setLinearDamping = function setLinearDamping(v) {
    this._sharedBody.setLinearDamping(v);
  };
  _proto.setAngularDamping = function setAngularDamping(v) {
    this._sharedBody.setAngularDamping(v);
  };
  _proto.useGravity = function useGravity(v) {
    if (this.isStatic) return;
    this.impl.setActorFlag(PX.ActorFlag.eDISABLE_GRAVITY, !v);
  };
  _proto.useCCD = function useCCD(v) {
    if (this.isStatic) return;
    this.impl.setRigidBodyFlag(PX.RigidBodyFlag.eENABLE_CCD, v);
    this._isUsingCCD = v;
  };
  _proto.isUsingCCD = function isUsingCCD() {
    return this._isUsingCCD;
  };
  _proto.setLinearFactor = function setLinearFactor(v) {
    if (this.isStatic) return;
    this.impl.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_LINEAR_X, !v.x);
    this.impl.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_LINEAR_Y, !v.y);
    this.impl.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_LINEAR_Z, !v.z);
  };
  _proto.setAngularFactor = function setAngularFactor(v) {
    if (this.isStatic) return;
    this.impl.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_ANGULAR_X, !v.x);
    this.impl.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_ANGULAR_Y, !v.y);
    this.impl.setRigidDynamicLockFlag(PX.RigidDynamicLockFlag.eLOCK_ANGULAR_Z, !v.z);
  };
  _proto.setAllowSleep = function setAllowSleep(v) {
    if (this.isStaticOrKinematic) return;
    var wc = v ? 0.0001 : 0xffffffff;
    this.impl.setWakeCounter(wc);
  };
  _proto.wakeUp = function wakeUp() {
    if (!this.isInScene || this.isStatic) return;
    this.impl.wakeUp();
  };
  _proto.sleep = function sleep() {
    if (!this.isInScene || this.isStatic) return;
    this.impl.putToSleep();
  };
  _proto.clearState = function clearState() {
    if (!this.isInScene || this.isStatic) return;
    this.clearForces();
    this.clearVelocity();
  };
  _proto.clearForces = function clearForces() {
    if (!this.isInScene || this.isStatic) return;
    this._sharedBody.clearForces();
  };
  _proto.clearVelocity = function clearVelocity() {
    if (this.isStatic) return;
    this._sharedBody.clearVelocity();
  };
  _proto.setSleepThreshold = function setSleepThreshold(v) {
    if (this.isStatic) return;
    var ke = 0.5 * v * v;
    this.impl.setSleepThreshold(ke);
  };
  _proto.getSleepThreshold = function getSleepThreshold() {
    if (this.isStatic) return 0;
    var ke = this.impl.getSleepThreshold();
    var v = Math.sqrt(2 * ke);
    return v;
  };
  _proto.getLinearVelocity = function getLinearVelocity(out) {
    if (this.isStatic) return;
    Vec3.copy(out, this.impl.getLinearVelocity());
  };
  _proto.setLinearVelocity = function setLinearVelocity(value) {
    if (this.isStaticOrKinematic) return;
    this.impl.setLinearVelocity(value, true);
  };
  _proto.getAngularVelocity = function getAngularVelocity(out) {
    if (this.isStatic) return;
    Vec3.copy(out, this.impl.getAngularVelocity());
  };
  _proto.setAngularVelocity = function setAngularVelocity(value) {
    if (this.isStaticOrKinematic) return;
    this.impl.setAngularVelocity(value, true);
  };
  _proto.applyForce = function applyForce$1(force, relativePoint) {
    if (!this.isInScene || this.isStaticOrKinematic) return;
    this._sharedBody.syncSceneToPhysics();
    var rp = relativePoint || Vec3.ZERO;
    applyForce(true, this.impl, force, rp);
  };
  _proto.applyLocalForce = function applyLocalForce(force, relativePoint) {
    if (!this.isInScene || this.isStaticOrKinematic) return;
    this._sharedBody.syncSceneToPhysics();
    var rp = relativePoint || Vec3.ZERO;
    applyForce(false, this.impl, force, rp);
  };
  _proto.applyImpulse = function applyImpulse$1(force, relativePoint) {
    if (!this.isInScene || this.isStaticOrKinematic) return;
    this._sharedBody.syncSceneToPhysics();
    var rp = relativePoint || Vec3.ZERO;
    applyImpulse(true, this.impl, force, rp);
  };
  _proto.applyLocalImpulse = function applyLocalImpulse(force, relativePoint) {
    if (!this.isInScene || this.isStaticOrKinematic) return;
    this._sharedBody.syncSceneToPhysics();
    var rp = relativePoint || Vec3.ZERO;
    applyImpulse(false, this.impl, force, rp);
  };
  _proto.applyTorque = function applyTorque(torque) {
    if (!this.isInScene || this.isStaticOrKinematic) return;
    applyTorqueForce(this.impl, torque);
  };
  _proto.applyLocalTorque = function applyLocalTorque(torque) {
    if (!this.isInScene || this.isStaticOrKinematic) return;
    this._sharedBody.syncSceneToPhysics();
    Vec3.transformQuat(v3_0$4, torque, this._sharedBody.node.worldRotation);
    applyTorqueForce(this.impl, v3_0$4);
  };
  _proto.setGroup = function setGroup(v) {
    this._sharedBody.setGroup(v);
  };
  _proto.getGroup = function getGroup() {
    return this._sharedBody.getGroup();
  };
  _proto.addGroup = function addGroup(v) {
    this._sharedBody.addGroup(v);
  };
  _proto.removeGroup = function removeGroup(v) {
    this._sharedBody.removeGroup(v);
  };
  _proto.setMask = function setMask(v) {
    this._sharedBody.setMask(v);
  };
  _proto.getMask = function getMask() {
    return this._sharedBody.getMask();
  };
  _proto.addMask = function addMask(v) {
    this._sharedBody.addMask(v);
  };
  _proto.removeMask = function removeMask(v) {
    this._sharedBody.removeMask(v);
  };
  return _createClass(PhysXRigidBody, [{
    key: "impl",
    get: function get() {
      return this._sharedBody.impl;
    }
  }, {
    key: "isAwake",
    get: function get() {
      if (!this.isInScene || this.isStatic) return false;
      return !this.impl.isSleeping();
    }
  }, {
    key: "isSleeping",
    get: function get() {
      if (!this.isInScene || this.isStatic) return true;
      return this.impl.isSleeping();
    }
  }, {
    key: "isEnabled",
    get: function get() {
      return this._isEnabled;
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
    key: "isStatic",
    get: function get() {
      return !this.impl || this._sharedBody.isStatic;
    }
  }, {
    key: "isStaticOrKinematic",
    get: function get() {
      return !this.impl || this._sharedBody.isStatic || this._sharedBody.isKinematic;
    }
  }, {
    key: "isInScene",
    get: function get() {
      return this._sharedBody.isInScene;
    }
  }]);
}();

var PhysXSphereShape = function (_PhysXShape) {
  function PhysXSphereShape() {
    var _this;
    _this = _PhysXShape.call(this, EPhysXShapeType.SPHERE) || this;
    if (!PhysXSphereShape.SPHERE_GEOMETRY) {
      PhysXSphereShape.SPHERE_GEOMETRY = new PX.SphereGeometry(0.5);
    }
    return _this;
  }
  _inheritsLoose(PhysXSphereShape, _PhysXShape);
  var _proto = PhysXSphereShape.prototype;
  _proto.updateRadius = function updateRadius() {
    this.updateScale();
  };
  _proto.onComponentSet = function onComponentSet() {
    this.updateGeometry();
    var pxmat = this.getSharedMaterial(this.collider.sharedMaterial);
    this._impl = PhysXInstance.physics.createShape(PhysXSphereShape.SPHERE_GEOMETRY, pxmat, true, this._flags);
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
    this._impl.setGeometry(PhysXSphereShape.SPHERE_GEOMETRY);
    this.setCenter(this._collider.center);
  };
  _proto.updateGeometry = function updateGeometry() {
    var co = this.collider;
    var maxSp = Math.abs(absMaxComponent(this.collider.node.worldScale));
    PhysXSphereShape.SPHERE_GEOMETRY.setRadius(Math.max(0.0001, co.radius * maxSp));
  };
  return _createClass(PhysXSphereShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(PhysXShape);
PhysXSphereShape.SPHERE_GEOMETRY = void 0;

var PhysXBoxShape = function (_PhysXShape) {
  function PhysXBoxShape() {
    var _this;
    _this = _PhysXShape.call(this, EPhysXShapeType.BOX) || this;
    if (!PhysXBoxShape.BOX_GEOMETRY) {
      VEC3_0.set(0.5, 0.5, 0.5);
      PhysXBoxShape.BOX_GEOMETRY = new PX.BoxGeometry(VEC3_0);
    }
    return _this;
  }
  _inheritsLoose(PhysXBoxShape, _PhysXShape);
  var _proto = PhysXBoxShape.prototype;
  _proto.updateSize = function updateSize() {
    this.updateScale();
  };
  _proto.onComponentSet = function onComponentSet() {
    this.updateGeometry();
    var pxmat = this.getSharedMaterial(this._collider.sharedMaterial);
    this._impl = PhysXInstance.physics.createShape(PhysXBoxShape.BOX_GEOMETRY, pxmat, true, this._flags);
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
    this._impl.setGeometry(PhysXBoxShape.BOX_GEOMETRY);
    this.setCenter(this._collider.center);
  };
  _proto.updateGeometry = function updateGeometry() {
    var co = this.collider;
    var ws = co.node.worldScale;
    VEC3_0.set(co.size).multiplyScalar(0.5).multiply(ws);
    PhysXBoxShape.BOX_GEOMETRY.setHalfExtents(absolute(VEC3_0));
  };
  return _createClass(PhysXBoxShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(PhysXShape);
PhysXBoxShape.BOX_GEOMETRY = void 0;

var PhysXCapsuleShape = function (_PhysXShape) {
  function PhysXCapsuleShape() {
    var _this;
    _this = _PhysXShape.call(this, EPhysXShapeType.CAPSULE) || this;
    if (!PhysXCapsuleShape.CAPSULE_GEOMETRY) {
      PhysXCapsuleShape.CAPSULE_GEOMETRY = new PX.CapsuleGeometry(0.5, 0.5);
    }
    return _this;
  }
  _inheritsLoose(PhysXCapsuleShape, _PhysXShape);
  var _proto = PhysXCapsuleShape.prototype;
  _proto.setCylinderHeight = function setCylinderHeight(v) {
    this.updateScale();
  };
  _proto.setDirection = function setDirection(v) {
    this.updateScale();
  };
  _proto.setRadius = function setRadius(v) {
    this.updateScale();
  };
  _proto.onComponentSet = function onComponentSet() {
    this.updateGeometry();
    var pxmat = this.getSharedMaterial(this._collider.sharedMaterial);
    this._impl = PhysXInstance.physics.createShape(PhysXCapsuleShape.CAPSULE_GEOMETRY, pxmat, true, this._flags);
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
    this._impl.setGeometry(PhysXCapsuleShape.CAPSULE_GEOMETRY);
    this.setCenter(this._collider.center);
  };
  _proto.updateGeometry = function updateGeometry() {
    var co = this.collider;
    var ws = co.node.worldScale;
    var upAxis = co.direction;
    var r = 0.5;
    var hf = 0.5;
    if (upAxis === EAxisDirection.Y_AXIS) {
      r = co.radius * Math.abs(absMax(ws.x, ws.z));
      hf = co.cylinderHeight / 2 * Math.abs(ws.y);
      Quat.fromEuler(this._rotation, 0, 0, 90);
    } else if (upAxis === EAxisDirection.X_AXIS) {
      r = co.radius * Math.abs(absMax(ws.y, ws.z));
      hf = co.cylinderHeight / 2 * Math.abs(ws.x);
      Quat.fromEuler(this._rotation, 0, 0, 0);
    } else {
      r = co.radius * Math.abs(absMax(ws.x, ws.y));
      hf = co.cylinderHeight / 2 * Math.abs(ws.z);
      Quat.fromEuler(this._rotation, 0, 90, 0);
    }
    PhysXCapsuleShape.CAPSULE_GEOMETRY.setRadius(Math.max(0.0001, r));
    PhysXCapsuleShape.CAPSULE_GEOMETRY.setHalfHeight(Math.max(0.0001, hf));
  };
  return _createClass(PhysXCapsuleShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(PhysXShape);
PhysXCapsuleShape.CAPSULE_GEOMETRY = void 0;

var PhysXPlaneShape = function (_PhysXShape) {
  function PhysXPlaneShape() {
    var _this;
    _this = _PhysXShape.call(this, EPhysXShapeType.PLANE) || this;
    if (!PhysXPlaneShape.PLANE_GEOMETRY) {
      PhysXPlaneShape.PLANE_GEOMETRY = new PX.PlaneGeometry();
    }
    return _this;
  }
  _inheritsLoose(PhysXPlaneShape, _PhysXShape);
  var _proto = PhysXPlaneShape.prototype;
  _proto.setNormal = function setNormal(v) {
    this.setCenter();
  };
  _proto.setConstant = function setConstant(v) {
    this.setCenter();
  };
  _proto.setCenter = function setCenter() {
    var co = this.collider;
    var pos = _trans.translation;
    var rot = _trans.rotation;
    Vec3.scaleAndAdd(pos, co.center, co.normal, co.constant);
    Quat.rotationTo(rot, Vec3.UNIT_X, co.normal);
    var trans = getTempTransform(pos, rot);
    this._impl.setLocalPose(trans);
  };
  _proto.onComponentSet = function onComponentSet() {
    var co = this.collider;
    var pxmat = this.getSharedMaterial(co.sharedMaterial);
    this._impl = PhysXInstance.physics.createShape(PhysXPlaneShape.PLANE_GEOMETRY, pxmat, true, this._flags);
    this.setCenter();
  };
  _proto.updateScale = function updateScale() {
    this.setCenter();
  };
  return _createClass(PhysXPlaneShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(PhysXShape);
PhysXPlaneShape.PLANE_GEOMETRY = void 0;

var PhysXTrimeshShape = function (_PhysXShape) {
  function PhysXTrimeshShape() {
    var _this;
    _this = _PhysXShape.call(this, EPhysXShapeType.MESH) || this;
    _this.geometry = void 0;
    return _this;
  }
  _inheritsLoose(PhysXTrimeshShape, _PhysXShape);
  var _proto = PhysXTrimeshShape.prototype;
  _proto.setMesh = function setMesh(v) {
    if (v && v.renderingSubMeshes.length > 0) {
      if (this._impl != null) {
        this.removeFromBody();
        removeReference(this, this._impl);
        this._impl.release();
        this._impl = null;
      }
      var physics = PhysXInstance.physics;
      var collider = this.collider;
      var pxmat = this.getSharedMaterial(collider.sharedMaterial);
      var meshScale = PhysXShape.MESH_SCALE;
      meshScale.setScale(Vec3.ONE);
      meshScale.setRotation(Quat.IDENTITY);
      var posBuf = v.renderingSubMeshes[0].geometricInfo.positions;
      var indBuf = v.renderingSubMeshes[0].geometricInfo.indices;
      if (indBuf instanceof Uint16Array) {
        indBuf = new Uint32Array(indBuf);
      }
      if (indBuf instanceof Uint8Array) {
        indBuf = new Uint32Array(indBuf);
      }
      if (collider.convex || indBuf === undefined) {
        if (PX.MESH_CONVEX[v._uuid] == null) {
          var cooking = PhysXInstance.cooking;
          PX.MESH_CONVEX[v._uuid] = createConvexMesh(posBuf, cooking, physics);
        }
        var convexMesh = PX.MESH_CONVEX[v._uuid];
        this.geometry = new PX.ConvexMeshGeometry(convexMesh, meshScale, createMeshGeometryFlags(0, true));
      } else {
        if (PX.MESH_STATIC[v._uuid] == null) {
          var _cooking = PhysXInstance.cooking;
          PX.MESH_STATIC[v._uuid] = createTriangleMesh(posBuf, indBuf, _cooking, physics);
        }
        var trimesh = PX.MESH_STATIC[v._uuid];
        this.geometry = new PX.TriangleMeshGeometry(trimesh, meshScale, createMeshGeometryFlags(0, false));
      }
      this.updateGeometry();
      this._impl = physics.createShape(this.geometry, pxmat, true, this._flags);
      this.addToBody();
      addReference(this, this._impl);
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    this.setMesh(this.collider.mesh);
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
    this.setCenter(this._collider.center);
  };
  _proto.updateGeometry = function updateGeometry() {
    var meshScale = PhysXShape.MESH_SCALE;
    meshScale.setScale(this.collider.node.worldScale);
    meshScale.setRotation(Quat.IDENTITY);
    this.geometry.setScale(meshScale);
  };
  _proto.setMaterial = function setMaterial(v) {
    if (this._impl) _PhysXShape.prototype.setMaterial.call(this, v);
  };
  _proto.setCenter = function setCenter(v) {
    if (this._impl) _PhysXShape.prototype.setCenter.call(this, v);
  };
  _proto.setAsTrigger = function setAsTrigger(v) {
    if (this._impl) _PhysXShape.prototype.setAsTrigger.call(this, v);
  };
  _proto.setFilerData = function setFilerData(v) {
    if (this._impl) _PhysXShape.prototype.setFilerData.call(this, v);
  };
  _proto.addToBody = function addToBody() {
    if (this._impl) _PhysXShape.prototype.addToBody.call(this);
  };
  _proto.removeFromBody = function removeFromBody() {
    if (this._impl) _PhysXShape.prototype.removeFromBody.call(this);
  };
  return _createClass(PhysXTrimeshShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(PhysXShape);

var PhysXTerrainShape = function (_PhysXShape) {
  function PhysXTerrainShape() {
    return _PhysXShape.call(this, EPhysXShapeType.TERRAIN) || this;
  }
  _inheritsLoose(PhysXTerrainShape, _PhysXShape);
  var _proto = PhysXTerrainShape.prototype;
  _proto.setTerrain = function setTerrain(v) {
    if (v && this._impl == null) {
      var physics = PhysXInstance.physics;
      var collider = this.collider;
      if (PX.TERRAIN_STATIC[v._uuid] == null) {
        var cooking = PhysXInstance.cooking;
        PX.TERRAIN_STATIC[v._uuid] = createHeightField(v, PhysXTerrainShape.heightScale, cooking, physics);
      }
      var hf = PX.TERRAIN_STATIC[v._uuid];
      var pxmat = this.getSharedMaterial(collider.sharedMaterial);
      var geometry = createHeightFieldGeometry(hf, 0, PhysXTerrainShape.heightScale, v.tileSize, v.tileSize);
      this._impl = physics.createShape(geometry, pxmat, true, this._flags);
      this.updateByReAdd();
    }
  };
  _proto.onComponentSet = function onComponentSet() {
    this.setTerrain(this.collider.terrain);
  };
  _proto.updateScale = function updateScale() {
    this.setCenter(this._collider.center);
  };
  _proto.setCenter = function setCenter(v) {
    if (this._impl) this._impl.setLocalPose(getTempTransform(v, this._rotation));
  };
  _proto.setMaterial = function setMaterial(v) {
    if (this._impl) _PhysXShape.prototype.setMaterial.call(this, v);
  };
  _proto.setAsTrigger = function setAsTrigger(v) {
    if (this._impl) _PhysXShape.prototype.setAsTrigger.call(this, v);
  };
  _proto.setFilerData = function setFilerData(v) {
    if (this._impl) _PhysXShape.prototype.setFilerData.call(this, v);
  };
  _proto.addToBody = function addToBody() {
    if (this._impl) _PhysXShape.prototype.addToBody.call(this);
  };
  _proto.removeFromBody = function removeFromBody() {
    if (this._impl) _PhysXShape.prototype.removeFromBody.call(this);
  };
  return _createClass(PhysXTerrainShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(PhysXShape);
PhysXTerrainShape.heightScale = 1 / 512;

var PhysXCylinderShape = function (_PhysXShape) {
  function PhysXCylinderShape() {
    var _this;
    _this = _PhysXShape.call(this, EPhysXShapeType.CYLINDER) || this;
    _this.geometry = void 0;
    return _this;
  }
  _inheritsLoose(PhysXCylinderShape, _PhysXShape);
  var _proto = PhysXCylinderShape.prototype;
  _proto.setRadius = function setRadius(v) {
    this.updateGeometry();
  };
  _proto.setHeight = function setHeight(v) {
    this.updateGeometry();
  };
  _proto.setDirection = function setDirection(v) {
    this.updateGeometry();
  };
  _proto.onComponentSet = function onComponentSet() {
    var collider = this.collider;
    var physics = PhysXInstance.physics;
    if (!PhysXCylinderShape.CONVEX_MESH) {
      var cooking = PhysXInstance.cooking;
      var primitive = cylinder(0.5, 0.5, 2, {
        radialSegments: 32,
        heightSegments: 1
      });
      PhysXCylinderShape.CONVEX_MESH = createConvexMesh(primitive.positions, cooking, physics);
    }
    var meshScale = PhysXShape.MESH_SCALE;
    meshScale.setScale(Vec3.ONE);
    meshScale.setRotation(Quat.IDENTITY);
    var convexMesh = PhysXCylinderShape.CONVEX_MESH;
    var pxmat = this.getSharedMaterial(collider.sharedMaterial);
    this.geometry = new PX.ConvexMeshGeometry(convexMesh, meshScale, createMeshGeometryFlags(0, true));
    this.updateGeometry();
    this._impl = physics.createShape(this.geometry, pxmat, true, this._flags);
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
    this.setCenter(this._collider.center);
  };
  _proto.updateGeometry = function updateGeometry() {
    var collider = this.collider;
    var r = collider.radius;
    var h = collider.height;
    var a = collider.direction;
    var scale = _trans.translation;
    Vec3.copy(scale, collider.node.worldScale);
    scale.y *= Math.max(0.0001, h / 2);
    var radius = Math.max(0.0001, r / 0.5);
    var xzMaxNorm = Math.max(scale.x, scale.z);
    scale.x = scale.z = xzMaxNorm * radius;
    var quat = _trans.rotation;
    switch (a) {
      case EAxisDirection.X_AXIS:
        Quat.fromEuler(quat, 0, 0, 90);
        break;
      case EAxisDirection.Y_AXIS:
      default:
        Quat.copy(quat, Quat.IDENTITY);
        break;
      case EAxisDirection.Z_AXIS:
        Quat.fromEuler(quat, 90, 0, 0);
        break;
    }
    var meshScale = PhysXShape.MESH_SCALE;
    meshScale.setScale(scale);
    meshScale.setRotation(quat);
    this.geometry.setScale(meshScale);
    Quat.copy(this._rotation, quat);
  };
  return _createClass(PhysXCylinderShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(PhysXShape);
PhysXCylinderShape.CONVEX_MESH = void 0;

var PhysXConeShape = function (_PhysXShape) {
  function PhysXConeShape() {
    var _this;
    _this = _PhysXShape.call(this, EPhysXShapeType.CONE) || this;
    _this.geometry = void 0;
    return _this;
  }
  _inheritsLoose(PhysXConeShape, _PhysXShape);
  var _proto = PhysXConeShape.prototype;
  _proto.setRadius = function setRadius(v) {
    this.updateGeometry();
  };
  _proto.setHeight = function setHeight(v) {
    this.updateGeometry();
  };
  _proto.setDirection = function setDirection(v) {
    this.updateGeometry();
  };
  _proto.onComponentSet = function onComponentSet() {
    var collider = this.collider;
    var physics = PhysXInstance.physics;
    if (!PhysXConeShape.CONVEX_MESH) {
      var cooking = PhysXInstance.cooking;
      var primitive = cylinder(0, 0.5, 1, {
        radialSegments: 32,
        heightSegments: 1
      });
      PhysXConeShape.CONVEX_MESH = createConvexMesh(primitive.positions, cooking, physics);
    }
    var meshScale = PhysXShape.MESH_SCALE;
    meshScale.setScale(Vec3.ONE);
    meshScale.setRotation(Quat.IDENTITY);
    var convexMesh = PhysXConeShape.CONVEX_MESH;
    var pxmat = this.getSharedMaterial(collider.sharedMaterial);
    this.geometry = new PX.ConvexMeshGeometry(convexMesh, meshScale, createMeshGeometryFlags(0, true));
    this.updateGeometry();
    this._impl = physics.createShape(this.geometry, pxmat, true, this._flags);
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
    this.setCenter(this._collider.center);
  };
  _proto.updateGeometry = function updateGeometry() {
    var collider = this.collider;
    var r = collider.radius;
    var h = collider.height;
    var a = collider.direction;
    var scale = _trans.translation;
    Vec3.copy(scale, collider.node.worldScale);
    scale.y *= Math.max(0.0001, h / 1);
    var radius = Math.max(0.0001, r / 0.5);
    var xzMaxNorm = Math.max(scale.x, scale.z);
    scale.x = scale.z = xzMaxNorm * radius;
    var quat = _trans.rotation;
    switch (a) {
      case EAxisDirection.X_AXIS:
        Quat.fromEuler(quat, 0, 0, 90);
        break;
      case EAxisDirection.Y_AXIS:
      default:
        Quat.copy(quat, Quat.IDENTITY);
        break;
      case EAxisDirection.Z_AXIS:
        Quat.fromEuler(quat, 90, 0, 0);
        break;
    }
    var meshScale = PhysXShape.MESH_SCALE;
    meshScale.setScale(scale);
    meshScale.setRotation(quat);
    this.geometry.setScale(meshScale);
    Quat.copy(this._rotation, quat);
  };
  return _createClass(PhysXConeShape, [{
    key: "collider",
    get: function get() {
      return this._collider;
    }
  }]);
}(PhysXShape);
PhysXConeShape.CONVEX_MESH = void 0;

var PhysXJoint = function () {
  function PhysXJoint() {
    this._impl = void 0;
    this._com = void 0;
    this._rigidBody = void 0;
    this._connectedBody = null;
  }
  var _proto = PhysXJoint.prototype;
  _proto.setConnectedBody = function setConnectedBody(v) {
    if (this._connectedBody === v) return;
    var oldBody2 = this._connectedBody;
    if (oldBody2) {
      var oldSB2 = oldBody2.body.sharedBody;
      oldSB2.removeJoint(this, 1);
    }
    var sb = this._rigidBody.body.sharedBody;
    sb.removeJoint(this, 0);
    sb.addJoint(this, 0);
    if (v) {
      var sb2 = v.body.sharedBody;
      setJointActors(this._impl, sb.impl, sb2.impl);
      sb2.addJoint(this, 1);
    } else {
      setJointActors(this._impl, sb.impl, null);
    }
    if (oldBody2) {
      oldBody2.wakeUp();
    }
    this._connectedBody = v;
    this.updateScale0();
    this.updateScale1();
  };
  _proto.setEnableCollision = function setEnableCollision(v) {
    this._impl.setConstraintFlag(1 << 3, v);
  };
  _proto.initialize = function initialize(v) {
    this._com = v;
    this._rigidBody = v.attachedBody;
    this._connectedBody = v.connectedBody;
    this.onComponentSet();
    this.setEnableCollision(this._com.enableCollision);
    if (this._impl.$$) {
      PX.IMPL_PTR[this._impl.$$.ptr] = this;
    }
  };
  _proto.enableDebugVisualization = function enableDebugVisualization(v) {
    if (this.impl) {
      this.impl.setConstraintFlag(1 << 4, v);
    }
  };
  _proto.onComponentSet = function onComponentSet() {};
  _proto.updateScale0 = function updateScale0() {};
  _proto.updateScale1 = function updateScale1() {};
  _proto.onEnable = function onEnable() {
    var sb = this._rigidBody.body.sharedBody;
    var connect = this._com.connectedBody;
    sb.addJoint(this, 0);
    if (connect) {
      var sb2 = connect.body.sharedBody;
      setJointActors(this._impl, sb.impl, sb2.impl);
      sb2.addJoint(this, 1);
    } else {
      setJointActors(this._impl, sb.impl, null);
    }
  };
  _proto.onDisable = function onDisable() {
    setJointActors(this._impl, PhysXJoint.tempActor, null);
    var sb = this._rigidBody.body.sharedBody;
    sb.removeJoint(this, 0);
    var connect = this.constraint.connectedBody;
    if (connect) {
      var sb2 = connect.body.sharedBody;
      sb2.removeJoint(this, 1);
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._impl.$$) {
      PX.IMPL_PTR[this._impl.$$.ptr] = null;
      delete PX.IMPL_PTR[this._impl.$$.ptr];
    }
    this._impl.release();
    this._com = null;
    this._rigidBody = null;
    this._connectedBody = null;
    this._impl = null;
  };
  return _createClass(PhysXJoint, [{
    key: "impl",
    get: function get() {
      return this._impl;
    }
  }, {
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }], [{
    key: "tempActor",
    get: function get() {
      if (!this._tempActor) {
        this._tempActor = PhysXInstance.physics.createRigidDynamic(_pxtrans);
      }
      return this._tempActor;
    }
  }]);
}();
PhysXJoint._tempActor = void 0;

var v3_0$3 = new Vec3();
var quat_0$1 = new Quat();
var mat_0$1 = new Mat4();
var PhysXFixedJoint = function (_PhysXJoint) {
  function PhysXFixedJoint() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PhysXJoint.call.apply(_PhysXJoint, [this].concat(args)) || this;
    _this._breakForce = 0;
    _this._breakTorque = 0;
    return _this;
  }
  _inheritsLoose(PhysXFixedJoint, _PhysXJoint);
  var _proto = PhysXFixedJoint.prototype;
  _proto.setBreakForce = function setBreakForce(v) {
    this._breakForce = this.constraint.breakForce;
    this._impl.setBreakForce(this._breakForce, this._breakTorque);
  };
  _proto.setBreakTorque = function setBreakTorque(v) {
    this._breakTorque = this.constraint.breakTorque;
    this._impl.setBreakForce(this._breakForce, this._breakTorque);
  };
  _proto.onComponentSet = function onComponentSet() {
    this._impl = PX.createFixedConstraint(PhysXJoint.tempActor, _pxtrans, null, _pxtrans);
    this.setBreakForce(this.constraint.breakForce);
    this.setBreakTorque(this.constraint.breakTorque);
    this.updateFrame();
    this.enableDebugVisualization(true);
  };
  _proto.updateFrame = function updateFrame() {
    var bodyA = this._rigidBody.body.sharedBody;
    var cb = this.constraint.connectedBody;
    Mat4.fromRT(mat_0$1, bodyA.node.worldRotation, bodyA.node.worldPosition);
    Mat4.invert(mat_0$1, mat_0$1);
    Mat4.getRotation(quat_0$1, mat_0$1);
    Mat4.getTranslation(v3_0$3, mat_0$1);
    this._impl.setLocalPose(0, getTempTransform(v3_0$3, quat_0$1));
    if (cb) {
      var bodyB = cb.body.sharedBody;
      Mat4.fromRT(mat_0$1, bodyB.node.worldRotation, bodyB.node.worldPosition);
      Mat4.invert(mat_0$1, mat_0$1);
      Mat4.getRotation(quat_0$1, mat_0$1);
      Mat4.getTranslation(v3_0$3, mat_0$1);
      this._impl.setLocalPose(1, getTempTransform(v3_0$3, quat_0$1));
    } else {
      this._impl.setLocalPose(1, getTempTransform(Vec3.ZERO, Quat.IDENTITY));
    }
  };
  _proto.updateScale0 = function updateScale0() {
    this.updateFrame();
  };
  _proto.updateScale1 = function updateScale1() {
    this.updateFrame();
  };
  return _createClass(PhysXFixedJoint, [{
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(PhysXJoint);

var PhysXSphericalJoint = function (_PhysXJoint) {
  function PhysXSphericalJoint() {
    return _PhysXJoint.apply(this, arguments) || this;
  }
  _inheritsLoose(PhysXSphericalJoint, _PhysXJoint);
  var _proto = PhysXSphericalJoint.prototype;
  _proto.setPivotA = function setPivotA(v) {
    var cs = this.constraint;
    var pos = _trans.translation;
    var rot = _trans.rotation;
    Vec3.multiply(pos, cs.node.worldScale, cs.pivotA);
    Quat.copy(rot, Quat.IDENTITY);
    this._impl.setLocalPose(0, getTempTransform(pos, rot));
    if (!cs.connectedBody) this.setPivotB(cs.pivotB);
  };
  _proto.setPivotB = function setPivotB(v) {
    var cs = this.constraint;
    var cb = cs.connectedBody;
    var pos = _trans.translation;
    var rot = _trans.rotation;
    Vec3.copy(pos, cs.pivotB);
    Quat.copy(rot, Quat.IDENTITY);
    if (cb) {
      Vec3.multiply(pos, cb.node.worldScale, cs.pivotB);
    } else {
      var node = cs.node;
      Vec3.multiply(pos, node.worldScale, cs.pivotA);
      Vec3.transformQuat(pos, pos, node.worldRotation);
      Vec3.add(pos, pos, node.worldPosition);
      Quat.multiply(rot, rot, node.worldRotation);
    }
    this._impl.setLocalPose(1, getTempTransform(pos, rot));
  };
  _proto.onComponentSet = function onComponentSet() {
    this._impl = PX.createSphericalJoint(PhysXJoint.tempActor, _pxtrans, null, _pxtrans);
    this.setPivotA(this.constraint.pivotA);
    this.setPivotB(this.constraint.pivotB);
    this.enableDebugVisualization(true);
  };
  _proto.updateScale0 = function updateScale0() {
    this.setPivotA(this.constraint.pivotA);
  };
  _proto.updateScale1 = function updateScale1() {
    this.setPivotB(this.constraint.pivotB);
  };
  return _createClass(PhysXSphericalJoint, [{
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(PhysXJoint);

var v3_0$2 = new Vec3();
var v3_1 = new Vec3();
var v3_2 = new Vec3();
var quat_0 = new Quat();
var mat_0 = new Mat4();
var PhysXRevoluteJoint = function (_PhysXJoint) {
  function PhysXRevoluteJoint() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _PhysXJoint.call.apply(_PhysXJoint, [this].concat(args)) || this;
    _this._limitPair = new PX.PxJointAngularLimitPair(0, 0);
    return _this;
  }
  _inheritsLoose(PhysXRevoluteJoint, _PhysXJoint);
  var _proto = PhysXRevoluteJoint.prototype;
  _proto.setLimitEnabled = function setLimitEnabled(v) {
    this._impl.setRevoluteJointFlag(PX.RevoluteJointFlags.eLIMIT_ENABLED, v);
    if (v) {
      this._impl.setLimit(this._limitPair);
    }
  };
  _proto.setLowerLimit = function setLowerLimit(min) {
    this._limitPair.lower = toRadian(this.constraint.lowerLimit);
    if (this.constraint.limitEnabled) {
      this._impl.setLimit(this._limitPair);
    }
  };
  _proto.setUpperLimit = function setUpperLimit(max) {
    this._limitPair.upper = toRadian(this.constraint.upperLimit);
    if (this.constraint.limitEnabled) {
      this._impl.setLimit(this._limitPair);
    }
  };
  _proto.setMotorEnabled = function setMotorEnabled(v) {
    this._impl.setRevoluteJointFlag(PX.RevoluteJointFlags.eDRIVE_ENABLED, v);
    if (v) {
      this._impl.setDriveVelocity(this.constraint.motorVelocity / 60.0, true);
      this._impl.setDriveForceLimit(this.constraint.motorForceLimit);
    }
  };
  _proto.setMotorVelocity = function setMotorVelocity(v) {
    if (this.constraint.motorEnabled) {
      this._impl.setDriveVelocity(v / 60.0, true);
    }
  };
  _proto.setMotorForceLimit = function setMotorForceLimit(v) {
    if (this.constraint.motorEnabled) {
      this._impl.setDriveForceLimit(v);
    }
  };
  _proto.setPivotA = function setPivotA(v) {
    this.updateFrames();
  };
  _proto.setPivotB = function setPivotB(v) {
    this.updateFrames();
  };
  _proto.setAxis = function setAxis(v) {
    this.updateFrames();
  };
  _proto.onComponentSet = function onComponentSet() {
    this._impl = PX.createRevoluteJoint(PhysXJoint.tempActor, _pxtrans, null, _pxtrans);
    this._limitPair.stiffness = 0;
    this._limitPair.damping = 0;
    this._limitPair.restitution = 0.4;
    this._limitPair.contactDistance = 0.01;
    this._impl.setConstraintFlag(6, true);
    this._impl.setConstraintFlag(32, true);
    this._impl.setProjectionAngularTolerance(0.2);
    this._impl.setProjectionLinearTolerance(0.2);
    this.setPivotA(this.constraint.pivotA);
    this.setPivotB(this.constraint.pivotB);
    this.setLimitEnabled(this.constraint.limitEnabled);
    this.setMotorEnabled(this.constraint.motorEnabled);
    this.setLowerLimit(this.constraint.lowerLimit);
    this.setUpperLimit(this.constraint.upperLimit);
    this.setMotorVelocity(this.constraint.motorVelocity);
    this.setMotorForceLimit(this.constraint.motorForceLimit);
    this.updateFrames();
    this.enableDebugVisualization(true);
  };
  _proto.updateFrames = function updateFrames() {
    var cs = this.constraint;
    var cb = cs.connectedBody;
    var pos = _trans.translation;
    var rot = _trans.rotation;
    var node = cs.node;
    Vec3.normalize(v3_0$2, cs.axis);
    Vec3.cross(v3_2, v3_0$2, Vec3.UNIT_Y);
    if (Vec3.len(v3_2) < 0.0001) {
      Vec3.cross(v3_1, Vec3.UNIT_Z, v3_0$2);
      Vec3.cross(v3_2, v3_0$2, v3_1);
    } else {
      Vec3.cross(v3_1, v3_2, v3_0$2);
    }
    Vec3.normalize(v3_1, v3_1);
    Vec3.normalize(v3_2, v3_2);
    mat_0.set(v3_0$2.x, v3_0$2.y, v3_0$2.z, 0, v3_1.x, v3_1.y, v3_1.z, 0, v3_2.x, v3_2.y, v3_2.z, 0, 0, 0, 0, 1);
    mat_0.getRotation(quat_0);
    Vec3.multiply(pos, cs.node.worldScale, cs.pivotA);
    this._impl.setLocalPose(0, getTempTransform(pos, quat_0));
    if (cb) {
      Quat.multiply(quat_0, node.worldRotation, quat_0);
      Quat.invert(rot, cb.node.worldRotation);
      Quat.multiply(quat_0, rot, quat_0);
      Vec3.multiply(pos, cb.node.worldScale, cs.pivotB);
    } else {
      Quat.multiply(quat_0, node.worldRotation, quat_0);
      Vec3.multiply(pos, node.worldScale, cs.pivotA);
      Vec3.transformQuat(pos, pos, node.worldRotation);
      Vec3.add(pos, pos, node.worldPosition);
    }
    this._impl.setLocalPose(1, getTempTransform(pos, quat_0));
  };
  _proto.updateScale0 = function updateScale0() {
    this.updateFrames();
  };
  _proto.updateScale1 = function updateScale1() {
    this.updateFrames();
  };
  return _createClass(PhysXRevoluteJoint, [{
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(PhysXJoint);

var CC_V3_0 = new Vec3();
var CC_V3_1 = new Vec3();
var CC_QUAT_0 = new Quat();
var CC_MAT4_0 = new Mat4();
function getConstraintFlag(v) {
  switch (v) {
    case EConstraintMode.FREE:
      return PX.D6Motion.eFREE;
    case EConstraintMode.LIMITED:
      return PX.D6Motion.eLIMITED;
    case EConstraintMode.LOCKED:
      return PX.D6Motion.eLOCKED;
    default:
      return PX.D6Motion.eFREE;
  }
}
var PhysXConfigurableJoint = function (_PhysXJoint) {
  function PhysXConfigurableJoint() {
    return _PhysXJoint.apply(this, arguments) || this;
  }
  _inheritsLoose(PhysXConfigurableJoint, _PhysXJoint);
  var _proto = PhysXConfigurableJoint.prototype;
  _proto._setLinearLimit = function _setLinearLimit() {
    var linearLimit = this.constraint.linearLimitSettings;
    var limitPairX = PhysXConfigurableJoint._linearLimitX;
    var limitPairY = PhysXConfigurableJoint._linearLimitY;
    var limitPairZ = PhysXConfigurableJoint._linearLimitZ;
    var setLimitPair = function setLimitPair(limitPair) {
      if (linearLimit.enableSoftConstraint) {
        limitPair.stiffness = linearLimit.stiffness;
        limitPair.damping = linearLimit.damping;
      } else {
        limitPair.stiffness = 0;
        limitPair.damping = 0;
      }
      limitPair.bounceThreshold = 0.1;
      limitPair.contactDistance = 0.1;
      limitPair.restitution = linearLimit.restitution;
    };
    setLimitPair(limitPairX);
    setLimitPair(limitPairY);
    setLimitPair(limitPairZ);
    var lower = linearLimit.lower;
    var upper = linearLimit.upper;
    if (linearLimit.xMotion === EConstraintMode.LIMITED) {
      limitPairX.lower = lower.x;
      limitPairX.upper = upper.x;
      this._impl.setLinearLimit(PX.D6Axis.eX, limitPairX);
    }
    if (linearLimit.yMotion === EConstraintMode.LIMITED) {
      limitPairY.lower = lower.y;
      limitPairY.upper = upper.y;
      this._impl.setLinearLimit(PX.D6Axis.eY, limitPairY);
    }
    if (linearLimit.zMotion === EConstraintMode.LIMITED) {
      limitPairZ.lower = lower.z;
      limitPairZ.upper = upper.z;
      this._impl.setLinearLimit(PX.D6Axis.eZ, limitPairZ);
    }
  };
  _proto._setSwingLimit = function _setSwingLimit() {
    var angularLimit = this.constraint.angularLimitSettings;
    var limitCone = PhysXConfigurableJoint._swingLimit;
    if (angularLimit.enableSoftConstraintSwing) {
      limitCone.stiffness = angularLimit.swingStiffness;
      limitCone.damping = angularLimit.swingDamping;
    } else {
      limitCone.stiffness = 0;
      limitCone.springDamping = 0;
    }
    limitCone.yAngle = Math.PI;
    limitCone.zAngle = Math.PI;
    limitCone.contactDistance = 0.1;
    limitCone.bounceThreshold = 0.1;
    limitCone.restitution = angularLimit.swingRestitution;
    if (angularLimit.swingMotion1 === EConstraintMode.LIMITED) {
      limitCone.yAngle = toRadian(Math.max(angularLimit.swingExtent1, 1e-9)) * 0.5;
      this._impl.setSwingLimit(limitCone);
    }
    if (angularLimit.swingMotion2 === EConstraintMode.LIMITED) {
      limitCone.zAngle = toRadian(Math.max(angularLimit.swingExtent2, 1e-9)) * 0.5;
      this._impl.setSwingLimit(limitCone);
    }
  };
  _proto._setTwistLimit = function _setTwistLimit() {
    var angularLimit = this.constraint.angularLimitSettings;
    var limitPair = PhysXConfigurableJoint._twistLimit;
    if (angularLimit.enableSoftConstraintTwist) {
      limitPair.stiffness = angularLimit.twistStiffness;
      limitPair.damping = angularLimit.twistDamping;
    } else {
      limitPair.stiffness = 0;
      limitPair.damping = 0;
    }
    limitPair.contactDistance = 0.1;
    limitPair.bounceThreshold = 0.1;
    limitPair.restitution = angularLimit.twistRestitution;
    if (angularLimit.twistMotion === EConstraintMode.LIMITED) {
      limitPair.lower = toRadian(Math.max(angularLimit.twistExtent, 1e-9)) * -0.5;
      limitPair.upper = toRadian(Math.max(angularLimit.twistExtent, 1e-9)) * 0.5;
      this._impl.setTwistLimit(limitPair);
    }
  };
  _proto._updateDrive = function _updateDrive(idx) {
    var _this = this;
    var axis = PX.D6Axis.eX;
    var driveMode = EDriverMode.DISABLED;
    var com = this.constraint;
    var ld = com.linearDriverSettings;
    var ad = com.angularDriverSettings;
    var getSwingDriveMode = function getSwingDriveMode() {
      var ad = _this.constraint.angularDriverSettings;
      if (ad.swingDrive1 === EDriverMode.INDUCTION || ad.swingDrive2 === EDriverMode.INDUCTION) {
        return EDriverMode.INDUCTION;
      } else if (ad.swingDrive1 === EDriverMode.SERVO || ad.swingDrive2 === EDriverMode.SERVO) {
        return EDriverMode.SERVO;
      } else {
        return EDriverMode.DISABLED;
      }
    };
    switch (idx) {
      case 0:
        axis = PX.D6Drive.eX;
        driveMode = ld.xDrive;
        break;
      case 1:
        axis = PX.D6Drive.eY;
        driveMode = ld.yDrive;
        break;
      case 2:
        axis = PX.D6Drive.eZ;
        driveMode = ld.zDrive;
        break;
      case 3:
        axis = PX.D6Drive.eTWIST;
        driveMode = ad.twistDrive;
        break;
      case 4:
        axis = PX.D6Drive.eSWING;
        driveMode = getSwingDriveMode();
        break;
      case 5:
        axis = PX.D6Drive.eSWING;
        driveMode = getSwingDriveMode();
        break;
    }
    var drive = PhysXConfigurableJoint._drive[idx];
    if (idx >= 0 && idx < 3) {
      drive.forceLimit = com.linearDriverSettings.strength;
    } else if (idx < 6) {
      drive.forceLimit = com.angularDriverSettings.strength;
    }
    if (driveMode === EDriverMode.DISABLED) {
      drive.forceLimit = 0;
    } else if (driveMode === EDriverMode.SERVO) {
      drive.damping = 0;
      drive.stiffness = 1000;
    } else if (driveMode === EDriverMode.INDUCTION) {
      drive.damping = 1000;
      drive.stiffness = 0;
    }
    this._impl.setDrive(axis, drive);
  };
  _proto._updateDriveTarget = function _updateDriveTarget() {
    var linearTarget = this.constraint.linearDriverSettings.targetPosition;
    var angularTarget = this.constraint.angularDriverSettings.targetOrientation;
    var quat = Quat.fromEuler(CC_QUAT_0, angularTarget.x, angularTarget.y, angularTarget.z);
    getTempTransform(linearTarget, quat);
    this._impl.setDrivePosition(_pxtrans, true);
  };
  _proto._updateDriveVelocity = function _updateDriveVelocity() {
    var linearVelocity = this.constraint.linearDriverSettings.targetVelocity;
    var angularVelocity = this.constraint.angularDriverSettings.targetVelocity;
    var lv = Vec3.set(CC_V3_0, linearVelocity.x, linearVelocity.y, linearVelocity.z);
    var av = Vec3.set(CC_V3_1, toRadian(-angularVelocity.x), toRadian(-angularVelocity.y), toRadian(-angularVelocity.z));
    this._impl.setDriveVelocity(lv, av, true);
  };
  _proto._updateDriveSettings = function _updateDriveSettings() {
    this._updateDrive(0);
    this._updateDrive(1);
    this._updateDrive(2);
    this._updateDrive(3);
    this._updateDrive(4);
    this._updateDrive(5);
    this._updateDriveTarget();
    this._updateDriveVelocity();
  };
  _proto.setConstraintMode = function setConstraintMode(idx, v) {
    var axis = PX.D6Axis.eX;
    switch (idx) {
      case 0:
        axis = PX.D6Axis.eX;
        break;
      case 1:
        axis = PX.D6Axis.eY;
        break;
      case 2:
        axis = PX.D6Axis.eZ;
        break;
      case 3:
        axis = PX.D6Axis.eTWIST;
        break;
      case 4:
        axis = PX.D6Axis.eSWING1;
        break;
      case 5:
        axis = PX.D6Axis.eSWING2;
        break;
    }
    var mode = getConstraintFlag(v);
    this._impl.setMotion(axis, mode);
  };
  _proto.setLinearLimit = function setLinearLimit(idx, lower, upper) {
    this._setLinearLimit();
  };
  _proto.setAngularExtent = function setAngularExtent(twist, swing1, swing2) {
    this._setSwingLimit();
    this._setTwistLimit();
  };
  _proto.setLinearRestitution = function setLinearRestitution(v) {
    this._setLinearLimit();
  };
  _proto.setSwingRestitution = function setSwingRestitution(v) {
    this._setSwingLimit();
  };
  _proto.setTwistRestitution = function setTwistRestitution(v) {
    this._setTwistLimit();
  };
  _proto.setLinearSoftConstraint = function setLinearSoftConstraint(v) {
    this._setLinearLimit();
  };
  _proto.setLinearStiffness = function setLinearStiffness(v) {
    this._setLinearLimit();
  };
  _proto.setLinearDamping = function setLinearDamping(v) {
    this._setLinearLimit();
  };
  _proto.setSwingSoftConstraint = function setSwingSoftConstraint(v) {
    this._setSwingLimit();
  };
  _proto.setSwingStiffness = function setSwingStiffness(v) {
    this._setSwingLimit();
  };
  _proto.setSwingDamping = function setSwingDamping(v) {
    this._setSwingLimit();
  };
  _proto.setTwistSoftConstraint = function setTwistSoftConstraint(v) {
    this._setTwistLimit();
  };
  _proto.setTwistStiffness = function setTwistStiffness(v) {
    this._setTwistLimit();
  };
  _proto.setTwistDamping = function setTwistDamping(v) {
    this._setTwistLimit();
  };
  _proto.setDriverMode = function setDriverMode(idx, v) {
    this._updateDrive(idx);
  };
  _proto.setLinearMotorTarget = function setLinearMotorTarget(v) {
    this._updateDriveTarget();
  };
  _proto.setLinearMotorVelocity = function setLinearMotorVelocity(v) {
    this._updateDriveVelocity();
  };
  _proto.setLinearMotorForceLimit = function setLinearMotorForceLimit(v) {
    this._updateDrive(0);
    this._updateDrive(1);
    this._updateDrive(2);
  };
  _proto.setAngularMotorTarget = function setAngularMotorTarget(v) {
    this._updateDriveTarget();
  };
  _proto.setAngularMotorVelocity = function setAngularMotorVelocity(v) {
    this._updateDriveVelocity();
  };
  _proto.setAngularMotorForceLimit = function setAngularMotorForceLimit(v) {
    this._updateDrive(3);
    this._updateDrive(4);
    this._updateDrive(5);
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
    var force = this.constraint.breakForce;
    var torque = this.constraint.breakTorque;
    this._impl.setBreakForce(force, torque);
  };
  _proto.setBreakTorque = function setBreakTorque(v) {
    var force = this.constraint.breakForce;
    var torque = this.constraint.breakTorque;
    this._impl.setBreakForce(force, torque);
  };
  _proto.onComponentSet = function onComponentSet() {
    PhysXConfigurableJoint._initCache();
    var cs = this.constraint;
    this._impl = PX.createD6Joint(PhysXJoint.tempActor, _pxtrans, null, _pxtrans);
    this.setBreakForce(cs.breakForce);
    this.setBreakTorque(cs.breakTorque);
    var ll = cs.linearLimitSettings;
    var al = cs.angularLimitSettings;
    this.setConstraintMode(0, ll.xMotion);
    this.setConstraintMode(1, ll.yMotion);
    this.setConstraintMode(2, ll.zMotion);
    this.setConstraintMode(3, al.twistMotion);
    this.setConstraintMode(4, al.swingMotion1);
    this.setConstraintMode(5, al.swingMotion2);
    this._setLinearLimit();
    this._setSwingLimit();
    this._setTwistLimit();
    this._updateDriveSettings();
    this.updateFrames();
    this.enableDebugVisualization(true);
  };
  _proto.updateFrames = function updateFrames() {
    var cs = this.constraint;
    var node = cs.node;
    var pos = _trans.translation;
    var rot = _trans.rotation;
    var cb = cs.connectedBody;
    var axisX = cs.axis;
    var axisY = cs.secondaryAxis;
    var axisZ = Vec3.cross(CC_V3_0, axisX, axisY);
    var _rot = CC_QUAT_0;
    var mat = Mat4.set(CC_MAT4_0, axisX.x, axisX.y, axisX.z, 0, axisY.x, axisY.y, axisY.z, 0, axisZ.x, axisZ.y, axisZ.z, 0, 0, 0, 0, 1);
    mat.getRotation(_rot);
    Vec3.multiply(pos, cs.node.worldScale, cs.pivotA);
    this._impl.setLocalPose(0, getTempTransform(pos, _rot));
    if (cb) {
      Quat.multiply(_rot, node.worldRotation, _rot);
      Quat.invert(rot, cb.node.worldRotation);
      Quat.multiply(_rot, rot, _rot);
      if (cs.autoPivotB) {
        Vec3.multiply(pos, cs.node.worldScale, cs.pivotA);
        Vec3.transformQuat(pos, pos, node.worldRotation);
        Vec3.add(pos, pos, node.worldPosition);
        Vec3.subtract(pos, pos, cb.node.worldPosition);
        Vec3.transformQuat(pos, pos, rot);
      } else {
        Vec3.multiply(pos, cb.node.worldScale, cs.pivotB);
      }
    } else {
      Vec3.multiply(pos, node.worldScale, cs.pivotA);
      Vec3.transformQuat(pos, pos, node.worldRotation);
      Vec3.add(pos, pos, node.worldPosition);
      Quat.multiply(_rot, node.worldRotation, _rot);
    }
    this._impl.setLocalPose(1, getTempTransform(pos, _rot));
  };
  _proto.updateScale0 = function updateScale0() {
    this.updateFrames();
  };
  _proto.updateScale1 = function updateScale1() {
    this.updateFrames();
  };
  PhysXConfigurableJoint._initCache = function _initCache() {
    if (!PhysXConfigurableJoint._jointToleranceScale) {
      PhysXConfigurableJoint._jointToleranceScale = PhysXInstance.physics.getTolerancesScale();
      PhysXConfigurableJoint._linearLimitX = new PX.PxJointLinearLimitPair(PhysXConfigurableJoint._jointToleranceScale, 0, 0);
      PhysXConfigurableJoint._linearLimitY = new PX.PxJointLinearLimitPair(PhysXConfigurableJoint._jointToleranceScale, 0, 0);
      PhysXConfigurableJoint._linearLimitZ = new PX.PxJointLinearLimitPair(PhysXConfigurableJoint._jointToleranceScale, 0, 0);
      PhysXConfigurableJoint._twistLimit = new PX.PxJointAngularLimitPair(0, 0);
      PhysXConfigurableJoint._swingLimit = new PX.PxJointLimitCone(1.5, 1.5);
      PhysXConfigurableJoint._drive_x = new PX.D6JointDrive();
      PhysXConfigurableJoint._drive_y = new PX.D6JointDrive();
      PhysXConfigurableJoint._drive_z = new PX.D6JointDrive();
      PhysXConfigurableJoint._drive_twist = new PX.D6JointDrive();
      PhysXConfigurableJoint._drive_swing1 = new PX.D6JointDrive();
      PhysXConfigurableJoint._drive_swing2 = new PX.D6JointDrive();
      PhysXConfigurableJoint._drive = [PhysXConfigurableJoint._drive_x, PhysXConfigurableJoint._drive_y, PhysXConfigurableJoint._drive_z, PhysXConfigurableJoint._drive_twist, PhysXConfigurableJoint._drive_swing1, PhysXConfigurableJoint._drive_swing2];
    }
  };
  return _createClass(PhysXConfigurableJoint, [{
    key: "constraint",
    get: function get() {
      return this._com;
    }
  }]);
}(PhysXJoint);
PhysXConfigurableJoint._jointToleranceScale = null;
PhysXConfigurableJoint._linearLimitX = null;
PhysXConfigurableJoint._linearLimitY = null;
PhysXConfigurableJoint._linearLimitZ = null;
PhysXConfigurableJoint._twistLimit = null;
PhysXConfigurableJoint._swingLimit = null;
PhysXConfigurableJoint._drive_x = null;
PhysXConfigurableJoint._drive_y = null;
PhysXConfigurableJoint._drive_z = null;
PhysXConfigurableJoint._drive_twist = null;
PhysXConfigurableJoint._drive_swing1 = null;
PhysXConfigurableJoint._drive_swing2 = null;
PhysXConfigurableJoint._drive = [];

var v3_0$1 = new Vec3(0, 0, 0);
var upDir$1 = new Vec3(0, 1, 0);
var PhysXBoxCharacterController = function (_PhysXCharacterContro) {
  function PhysXBoxCharacterController() {
    return _PhysXCharacterContro.apply(this, arguments) || this;
  }
  _inheritsLoose(PhysXBoxCharacterController, _PhysXCharacterContro);
  var _proto = PhysXBoxCharacterController.prototype;
  _proto.onComponentSet = function onComponentSet() {
    this.create();
  };
  _proto.create = function create() {
    _PhysXCharacterContro.prototype.release.call(this);
    this.component.node.getWorldPosition(v3_0$1);
    v3_0$1.add(this.scaledCenter);
    var pxMtl = PhysXInstance.physics.createMaterial(0.5, 0.5, 0.5);
    var physxWorld = PhysicsSystem.instance.physicsWorld;
    var controllerDesc = new PX.PxBoxControllerDesc();
    controllerDesc.halfHeight = this.component.halfHeight;
    controllerDesc.halfSideExtent = this.component.halfSideExtent;
    controllerDesc.halfForwardExtent = this.component.halfForwardExtent;
    controllerDesc.density = 10.0;
    controllerDesc.scaleCoeff = 0.8;
    controllerDesc.volumeGrowth = 1.5;
    controllerDesc.contactOffset = this.component.skinWidth;
    controllerDesc.stepOffset = this.component.stepOffset;
    controllerDesc.slopeLimit = Math.cos(degreesToRadians(this.component.slopeLimit));
    controllerDesc.upDirection = upDir$1;
    controllerDesc.position = {
      x: v3_0$1.x,
      y: v3_0$1.y,
      z: v3_0$1.z
    };
    controllerDesc.setMaterial(pxMtl);
    controllerDesc.setReportCallback(PX.PxUserControllerHitReport.implement(physxWorld.callback.controllerHitReportCB));
    this._impl = PX.createBoxCharacterController(physxWorld.controllerManager, controllerDesc);
    if (this._impl.$$) {
      PX.IMPL_PTR[this._impl.$$.ptr] = this;
      var shapePtr = this._impl.getShape().$$.ptr;
      PX.IMPL_PTR[shapePtr] = this;
    }
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
    this._impl.setHalfSideExtent(this.component.halfSideExtent * ws.x);
    this._impl.setHalfHeight(this.component.halfHeight * ws.y);
    this._impl.setHalfForwardExtent(this.component.halfForwardExtent * ws.z);
  };
  return _createClass(PhysXBoxCharacterController, [{
    key: "component",
    get: function get() {
      return this._comp;
    }
  }]);
}(PhysXCharacterController);

var v3_0 = new Vec3(0, 0, 0);
var upDir = new Vec3(0, 1, 0);
var PhysXCapsuleCharacterController = function (_PhysXCharacterContro) {
  function PhysXCapsuleCharacterController() {
    return _PhysXCharacterContro.apply(this, arguments) || this;
  }
  _inheritsLoose(PhysXCapsuleCharacterController, _PhysXCharacterContro);
  var _proto = PhysXCapsuleCharacterController.prototype;
  _proto.onComponentSet = function onComponentSet() {
    this.create();
  };
  _proto.create = function create() {
    _PhysXCharacterContro.prototype.release.call(this);
    this.component.node.getWorldPosition(v3_0);
    v3_0.add(this.scaledCenter);
    var pxMtl = PhysXInstance.physics.createMaterial(0.5, 0.5, 0.5);
    var physxWorld = PhysicsSystem.instance.physicsWorld;
    var controllerDesc = new PX.PxCapsuleControllerDesc();
    controllerDesc.radius = this.component.radius;
    controllerDesc.height = this.component.height;
    controllerDesc.climbingMode = PX.PxCapsuleClimbingMode.eCONSTRAINED;
    controllerDesc.density = 10.0;
    controllerDesc.scaleCoeff = 0.8;
    controllerDesc.volumeGrowth = 1.5;
    controllerDesc.contactOffset = this.component.skinWidth;
    controllerDesc.stepOffset = this.component.stepOffset;
    controllerDesc.slopeLimit = Math.cos(degreesToRadians(this.component.slopeLimit));
    controllerDesc.upDirection = upDir;
    controllerDesc.position = {
      x: v3_0.x,
      y: v3_0.y,
      z: v3_0.z
    };
    controllerDesc.setMaterial(pxMtl);
    controllerDesc.setReportCallback(PX.PxUserControllerHitReport.implement(physxWorld.callback.controllerHitReportCB));
    this._impl = PX.createCapsuleCharacterController(physxWorld.controllerManager, controllerDesc);
    if (this._impl.$$) {
      PX.IMPL_PTR[this._impl.$$.ptr] = this;
      var shapePtr = this._impl.getShape().$$.ptr;
      PX.IMPL_PTR[shapePtr] = this;
    }
    this.updateScale();
  };
  _proto.setRadius = function setRadius(value) {
    if (!this._impl) return;
    this.updateScale();
  };
  _proto.setHeight = function setHeight(value) {
    if (!this._impl) return;
    this.updateScale();
  };
  _proto.updateScale = function updateScale() {
    this.updateGeometry();
  };
  _proto.updateGeometry = function updateGeometry() {
    var ws = this.component.node.worldScale;
    var r = this.component.radius * Math.abs(absMax(ws.x, ws.z));
    var h = this.component.height * Math.abs(ws.y);
    this._impl.setRadius(Math.max(0.0001, r));
    this._impl.setHeight(Math.max(0.0001, h));
  };
  return _createClass(PhysXCapsuleCharacterController, [{
    key: "component",
    get: function get() {
      return this._comp;
    }
  }]);
}(PhysXCharacterController);

game.once(Game.EVENT_PRE_SUBSYSTEM_INIT, function () {
  selector.register('physx', {
    PhysicsWorld: PhysXWorld,
    RigidBody: PhysXRigidBody,
    BoxShape: PhysXBoxShape,
    SphereShape: PhysXSphereShape,
    CapsuleShape: PhysXCapsuleShape,
    TrimeshShape: PhysXTrimeshShape,
    CylinderShape: PhysXCylinderShape,
    ConeShape: PhysXConeShape,
    TerrainShape: PhysXTerrainShape,
    PlaneShape: PhysXPlaneShape,
    PointToPointConstraint: PhysXSphericalJoint,
    HingeConstraint: PhysXRevoluteJoint,
    FixedConstraint: PhysXFixedJoint,
    ConfigurableConstraint: PhysXConfigurableJoint,
    BoxCharacterController: PhysXBoxCharacterController,
    CapsuleCharacterController: PhysXCapsuleCharacterController
  });
});
function loadWasmModulePhysX() {
  {
    return Promise.resolve();
  }
}

export { loadWasmModulePhysX };
//# sourceMappingURL=physics-physx.js.map
