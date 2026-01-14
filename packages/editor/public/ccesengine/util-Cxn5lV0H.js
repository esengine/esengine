import { i as replaceProperty, j as removeProperty, f as Vec3 } from './index-uXI1_UMk.js';
import { M as Mesh } from './mesh-XWfHgs1t.js';
import './device-manager-CBXP-ttm.js';
import { m as murmurhash2_32_gc } from './buffer-barrier-BlQXg9Aa.js';
import { c as cylinder } from './capsule-9D-8tsOp.js';

replaceProperty(Mesh.prototype, 'Mesh.prototype', [{
  name: 'renderingMesh',
  newName: 'renderingSubMeshes'
}]);
removeProperty(Mesh.prototype, 'Mesh.prototype', [{
  name: 'hasFlatBuffers'
}, {
  name: 'destroyFlatBuffers'
}]);

function setWrap(object, wrapper) {
  object.__cc_wrapper__ = wrapper;
}
function getWrap(object) {
  return object.__cc_wrapper__;
}
function maxComponent(v) {
  return Math.max(v.x, Math.max(v.y, v.z));
}
var VEC3_0 = new Vec3();
var TriggerEventObject = {
  type: 'onTriggerEnter',
  selfCollider: null,
  otherCollider: null,
  impl: null
};
var CharacterTriggerEventObject = {
  type: 'onControllerTriggerEnter',
  collider: null,
  characterController: null,
  impl: null
};
var CollisionEventObject = {
  type: 'onCollisionEnter',
  selfCollider: null,
  otherCollider: null,
  contacts: [],
  impl: null
};
function shrinkPositions(buffer) {
  var pos = [];
  var posHashMap = {};
  if (buffer.length >= 3) {
    pos[0] = buffer[0];
    pos[1] = buffer[1];
    pos[2] = buffer[2];
    var len = buffer.length;
    for (var i = 3; i < len; i += 3) {
      var p0 = buffer[i];
      var p1 = buffer[i + 1];
      var p2 = buffer[i + 2];
      var str = String(p0) + String(p1) + String(p2);
      var hash = murmurhash2_32_gc(str, 666);
      if (posHashMap[hash] !== str) {
        posHashMap[hash] = str;
        pos.push(p0);
        pos.push(p1);
        pos.push(p2);
      }
    }
  }
  return pos;
}
function absolute(v) {
  v.x = Math.abs(v.x);
  v.y = Math.abs(v.y);
  v.z = Math.abs(v.z);
  return v;
}

var util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CharacterTriggerEventObject: CharacterTriggerEventObject,
    CollisionEventObject: CollisionEventObject,
    TriggerEventObject: TriggerEventObject,
    VEC3_0: VEC3_0,
    absolute: absolute,
    cylinder: cylinder,
    getWrap: getWrap,
    maxComponent: maxComponent,
    setWrap: setWrap,
    shrinkPositions: shrinkPositions
});

export { CharacterTriggerEventObject as C, TriggerEventObject as T, VEC3_0 as V, absolute as a, shrinkPositions as b, CollisionEventObject as c, getWrap as g, maxComponent as m, setWrap as s, util as u };
//# sourceMappingURL=util-Cxn5lV0H.js.map
