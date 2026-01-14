import { P as PhysicsSystem, C as Collider, a as Constraint, B as BoxCollider, S as SphereCollider, b as CapsuleCollider, R as RigidBody, M as MeshCollider, c as CylinderCollider, d as PhysicsMaterial, p as physics } from './index-UDeHavOr.js';
export { o as BoxCharacterController, n as CapsuleCharacterController, e as CharacterController, i as ConeCollider, l as ConfigurableConstraint, f as ConstantForce, F as FixedConstraint, H as HingeConstraint, h as PhysicsLineStripCastResult, g as PhysicsRayResult, k as PlaneCollider, m as PointToPointConstraint, j as SimplexCollider, T as TerrainCollider } from './index-UDeHavOr.js';
import './base.js';
import { i as replaceProperty, j as removeProperty } from './index-uXI1_UMk.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { m as setClassAlias } from './gc-object-CShF5lzx.js';
export { E as EAxisDirection, b as EColliderType, c as EPhysicsDrawFlags, a as ERigidBodyType } from './collision-matrix-55yq71jP.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './deprecated-Dswa7XeN.js';
import './director-F7e_Lqjg.js';
import './debug-view-BuNhRPv_.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './scene-vWcxM1_c.js';
import './node-event-Ccvtv8bJ.js';
import './touch-BKrZ-fxl.js';
import './prefab-DYg_oxpo.js';
import './deprecated-n0w4kK7g.js';
import './util-Cxn5lV0H.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './capsule-9D-8tsOp.js';
import './skeleton-CBhmWmEt.js';
import './terrain-asset-BMvu7XYU.js';
import './deprecated-CN-RjLP6.js';
import './render-types-D3qsZZI9.js';
import './deprecated-CzzdLkmW.js';
import './camera-component-BFt9vSC_.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './instantiate-DAIJ1YBG.js';
import './move-DnXMCCeG.js';

replaceProperty(PhysicsSystem, 'PhysicsSystem', [{
  name: 'ins',
  newName: 'instance'
}, {
  name: 'PHYSICS_AMMO',
  newName: 'PHYSICS_BULLET'
}]);
replaceProperty(PhysicsSystem.prototype, 'PhysicsSystem.prototype', [{
  name: 'deltaTime',
  newName: 'fixedTimeStep'
}, {
  name: 'maxSubStep',
  newName: 'maxSubSteps'
}]);
removeProperty(PhysicsSystem.prototype, 'PhysicsSystem.prototype', [{
  name: 'useFixedTime'
}, {
  name: 'useCollisionMatrix'
}, {
  name: 'updateCollisionMatrix'
}, {
  name: 'resetCollisionMatrix'
}, {
  name: 'isCollisionGroup'
}, {
  name: 'setCollisionGroup'
}]);
replaceProperty(Collider.prototype, 'Collider.prototype', [{
  name: 'attachedRigidbody',
  newName: 'attachedRigidBody'
}, {
  name: 'TYPE',
  newName: 'type'
}]);
replaceProperty(Collider, 'Collider', [{
  name: 'EColliderType',
  newName: 'Type'
}, {
  name: 'EAxisDirection',
  newName: 'Axis'
}]);
replaceProperty(Constraint, 'Constraint', [{
  name: 'EConstraintType',
  newName: 'Type'
}]);
replaceProperty(BoxCollider.prototype, 'BoxCollider.prototype', [{
  name: 'boxShape',
  newName: 'shape'
}]);
replaceProperty(SphereCollider.prototype, 'SphereCollider.prototype', [{
  name: 'sphereShape',
  newName: 'shape'
}]);
replaceProperty(CapsuleCollider.prototype, 'CapsuleCollider.prototype', [{
  name: 'capsuleShape',
  newName: 'shape'
}]);
replaceProperty(RigidBody.prototype, 'RigidBody.prototype', [{
  name: 'rigidBody',
  newName: 'body'
}]);
replaceProperty(RigidBody, 'RigidBody', [{
  name: 'ERigidBodyType',
  newName: 'Type'
}]);
removeProperty(RigidBody.prototype, 'RigidBody.prototype', [{
  name: 'fixedRotation'
}]);
cclegacy.RigidBodyComponent = RigidBody;
setClassAlias(RigidBody, 'cc.RigidBodyComponent');
cclegacy.ColliderComponent = Collider;
setClassAlias(Collider, 'cc.ColliderComponent');
cclegacy.BoxColliderComponent = BoxCollider;
setClassAlias(BoxCollider, 'cc.BoxColliderComponent');
cclegacy.SphereColliderComponent = SphereCollider;
setClassAlias(SphereCollider, 'cc.SphereColliderComponent');
setClassAlias(CapsuleCollider, 'cc.CapsuleColliderComponent');
setClassAlias(MeshCollider, 'cc.MeshColliderComponent');
setClassAlias(CylinderCollider, 'cc.CylinderColliderComponent');
cclegacy.PhysicMaterial = PhysicsMaterial;
setClassAlias(PhysicsMaterial, 'cc.PhysicMaterial');

cclegacy.physics = physics;

export { BoxCollider, BoxCollider as BoxColliderComponent, CapsuleCollider, CapsuleCollider as CapsuleColliderComponent, Collider, Collider as ColliderComponent, Constraint, CylinderCollider, CylinderCollider as CylinderColliderComponent, MeshCollider, MeshCollider as MeshColliderComponent, PhysicsMaterial as PhysicMaterial, PhysicsMaterial, PhysicsSystem, RigidBody, RigidBody as RigidBodyComponent, SphereCollider, SphereCollider as SphereColliderComponent, physics };
//# sourceMappingURL=physics-framework.js.map
