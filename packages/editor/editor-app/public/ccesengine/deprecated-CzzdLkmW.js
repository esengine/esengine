import { T as Triangle, D as ERaycastMode, R as Ray, M as Mat4, F as intersect, f as Vec3, c as ccclass$2, t as type$1, b as applyDecoratedInitializer, s as serializable$1, i as replaceProperty, G as markAsWarning } from './index-uXI1_UMk.js';
import './device-manager-CBXP-ttm.js';
import { y as PrimitiveMode } from './buffer-barrier-BlQXg9Aa.js';
import { _ as _inheritsLoose, m as setClassAlias } from './gc-object-CShF5lzx.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import { P as Prefab } from './prefab-DYg_oxpo.js';
import { C as Camera } from './camera-component-BFt9vSC_.js';
import { M as ModelRenderer } from './model-renderer-BBapFDY7.js';
import { R as Renderer } from './renderer-C7HM72NY.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';

function rayAABB2(ray, min, max) {
  var o = ray.o;
  var d = ray.d;
  var ix = 1 / d.x;
  var iy = 1 / d.y;
  var iz = 1 / d.z;
  var t1 = (min.x - o.x) * ix;
  var t2 = (max.x - o.x) * ix;
  var t3 = (min.y - o.y) * iy;
  var t4 = (max.y - o.y) * iy;
  var t5 = (min.z - o.z) * iz;
  var t6 = (max.z - o.z) * iz;
  var tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
  var tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
  if (tmax < 0 || tmin > tmax) {
    return 0;
  }
  return tmin > 0 ? tmin : tmax;
}
var raySubMesh = function () {
  var tri = Triangle.create();
  var deOpt = {
    distance: Infinity,
    doubleSided: false,
    mode: ERaycastMode.ANY
  };
  var minDis = 0;
  var fillResult = function fillResult(m, d, i0, i1, i2, r) {
    if (m === ERaycastMode.CLOSEST) {
      if (minDis > d || minDis === 0) {
        minDis = d;
        if (r) {
          if (r.length === 0) {
            r.push({
              distance: d,
              vertexIndex0: i0 / 3,
              vertexIndex1: i1 / 3,
              vertexIndex2: i2 / 3
            });
          } else {
            r[0].distance = d;
            r[0].vertexIndex0 = i0 / 3;
            r[0].vertexIndex1 = i1 / 3;
            r[0].vertexIndex2 = i2 / 3;
          }
        }
      }
    } else {
      minDis = d;
      if (r) r.push({
        distance: d,
        vertexIndex0: i0 / 3,
        vertexIndex1: i1 / 3,
        vertexIndex2: i2 / 3
      });
    }
  };
  var narrowphase = function narrowphase(vb, ib, pm, ray, opt) {
    if (pm === PrimitiveMode.TRIANGLE_LIST) {
      var cnt = ib.length;
      for (var j = 0; j < cnt; j += 3) {
        var i0 = ib[j] * 3;
        var i1 = ib[j + 1] * 3;
        var i2 = ib[j + 2] * 3;
        Vec3.set(tri.a, vb[i0], vb[i0 + 1], vb[i0 + 2]);
        Vec3.set(tri.b, vb[i1], vb[i1 + 1], vb[i1 + 2]);
        Vec3.set(tri.c, vb[i2], vb[i2 + 1], vb[i2 + 2]);
        var dist = intersect.rayTriangle(ray, tri, opt.doubleSided);
        if (dist === 0 || dist > opt.distance) continue;
        fillResult(opt.mode, dist, i0, i1, i2, opt.result);
        if (opt.mode === ERaycastMode.ANY) return dist;
      }
    } else if (pm === PrimitiveMode.TRIANGLE_STRIP) {
      var _cnt = ib.length - 2;
      var rev = 0;
      for (var _j = 0; _j < _cnt; _j += 1) {
        var _i = ib[_j - rev] * 3;
        var _i2 = ib[_j + rev + 1] * 3;
        var _i3 = ib[_j + 2] * 3;
        Vec3.set(tri.a, vb[_i], vb[_i + 1], vb[_i + 2]);
        Vec3.set(tri.b, vb[_i2], vb[_i2 + 1], vb[_i2 + 2]);
        Vec3.set(tri.c, vb[_i3], vb[_i3 + 1], vb[_i3 + 2]);
        rev = ~rev;
        var _dist = intersect.rayTriangle(ray, tri, opt.doubleSided);
        if (_dist === 0 || _dist > opt.distance) continue;
        fillResult(opt.mode, _dist, _i, _i2, _i3, opt.result);
        if (opt.mode === ERaycastMode.ANY) return _dist;
      }
    } else if (pm === PrimitiveMode.TRIANGLE_FAN) {
      var _cnt2 = ib.length - 1;
      var _i4 = ib[0] * 3;
      Vec3.set(tri.a, vb[_i4], vb[_i4 + 1], vb[_i4 + 2]);
      for (var _j2 = 1; _j2 < _cnt2; _j2 += 1) {
        var _i5 = ib[_j2] * 3;
        var _i6 = ib[_j2 + 1] * 3;
        Vec3.set(tri.b, vb[_i5], vb[_i5 + 1], vb[_i5 + 2]);
        Vec3.set(tri.c, vb[_i6], vb[_i6 + 1], vb[_i6 + 2]);
        var _dist2 = intersect.rayTriangle(ray, tri, opt.doubleSided);
        if (_dist2 === 0 || _dist2 > opt.distance) continue;
        fillResult(opt.mode, _dist2, _i4, _i5, _i6, opt.result);
        if (opt.mode === ERaycastMode.ANY) return _dist2;
      }
    }
    return minDis;
  };
  return function (ray, submesh, options) {
    minDis = 0;
    if (submesh.geometricInfo.positions.length === 0) return minDis;
    var opt = options === undefined ? deOpt : options;
    var min = submesh.geometricInfo.boundingBox.min;
    var max = submesh.geometricInfo.boundingBox.max;
    if (rayAABB2(ray, min, max)) {
      var pm = submesh.primitiveMode;
      var _submesh$geometricInf = submesh.geometricInfo,
        vb = _submesh$geometricInf.positions,
        ib = _submesh$geometricInf.indices;
      narrowphase(vb, ib, pm, ray, opt);
    }
    return minDis;
  };
}();
var rayMesh = function () {
  var minDis = 0;
  var deOpt = {
    distance: Infinity,
    doubleSided: false,
    mode: ERaycastMode.ANY
  };
  return function (ray, mesh, options) {
    minDis = 0;
    var opt = options === undefined ? deOpt : options;
    var length = mesh.renderingSubMeshes.length;
    var min = mesh.struct.minPosition;
    var max = mesh.struct.maxPosition;
    if (min && max && !rayAABB2(ray, min, max)) return minDis;
    for (var i = 0; i < length; i++) {
      var sm = mesh.renderingSubMeshes[i];
      var dis = raySubMesh(ray, sm, opt);
      if (dis) {
        if (opt.mode === ERaycastMode.CLOSEST) {
          if (minDis === 0 || minDis > dis) {
            minDis = dis;
            if (opt.subIndices) opt.subIndices[0] = i;
          }
        } else {
          minDis = dis;
          if (opt.subIndices) opt.subIndices.push(i);
          if (opt.mode === ERaycastMode.ANY) {
            return dis;
          }
        }
      }
    }
    if (minDis && opt.mode === ERaycastMode.CLOSEST) {
      if (opt.result) {
        opt.result[0].distance = minDis;
        opt.result.length = 1;
      }
      if (opt.subIndices) opt.subIndices.length = 1;
    }
    return minDis;
  };
}();
var rayModel = function () {
  var minDis = 0;
  var deOpt = {
    distance: Infinity,
    doubleSided: false,
    mode: ERaycastMode.ANY
  };
  var modelRay = new Ray();
  var m4 = new Mat4();
  return function (r, model, options) {
    minDis = 0;
    var opt = options === undefined ? deOpt : options;
    var wb = model.worldBounds;
    if (wb && !intersect.rayAABB(r, wb)) return minDis;
    Ray.copy(modelRay, r);
    if (model.node) {
      Mat4.invert(m4, model.node.getWorldMatrix(m4));
      Vec3.transformMat4(modelRay.o, r.o, m4);
      Vec3.transformMat4Normal(modelRay.d, r.d, m4);
    }
    var subModels = model.subModels;
    for (var i = 0; i < subModels.length; i++) {
      var subMesh = subModels[i].subMesh;
      var dis = raySubMesh(modelRay, subMesh, opt);
      if (dis) {
        if (opt.mode === ERaycastMode.CLOSEST) {
          if (minDis === 0 || minDis > dis) {
            minDis = dis;
            if (opt.subIndices) opt.subIndices[0] = i;
          }
        } else {
          minDis = dis;
          if (opt.subIndices) opt.subIndices.push(i);
          if (opt.mode === ERaycastMode.ANY) {
            return dis;
          }
        }
      }
    }
    if (minDis && opt.mode === ERaycastMode.CLOSEST) {
      if (opt.result) {
        opt.result[0].distance = minDis;
        opt.result.length = 1;
      }
      if (opt.subIndices) opt.subIndices.length = 1;
    }
    return minDis;
  };
}();
intersect.rayModel = rayModel;
intersect.raySubMesh = raySubMesh;
intersect.rayMesh = rayMesh;

var _dec$1, _dec2, _class$1, _class2, _initializer;
var ccclass$1 = ccclass$2,
  serializable = serializable$1,
  type = type$1;
var PrefabLink = (_dec$1 = ccclass$1('cc.PrefabLink'), _dec2 = type(Prefab), _dec$1(_class$1 = (_class2 = function (_Component) {
  function PrefabLink() {
    var _this;
    _this = _Component.call(this) || this;
    _this.prefab = _initializer && _initializer();
    return _this;
  }
  _inheritsLoose(PrefabLink, _Component);
  return PrefabLink;
}(Component), _initializer = applyDecoratedInitializer(_class2.prototype, "prefab", [_dec2, serializable], function () {
  return null;
}), _class2)) || _class$1);

var _dec, _class;
var ccclass = ccclass$2;
var FeedStatusController = (_dec = ccclass('FeedStatusController'), _dec(_class = function (_Component) {
  function FeedStatusController() {
    return _Component.apply(this, arguments) || this;
  }
  _inheritsLoose(FeedStatusController, _Component);
  var _proto = FeedStatusController.prototype;
  _proto.start = function start() {
    if (minigame && minigame.onFeedStatusChange) {
      minigame.onFeedStatusChange(this.feedStatusChangeCallBack);
    }
  };
  _proto.feedStatusChangeCallBack = function feedStatusChangeCallBack(type) {};
  _proto.onDestroy = function onDestroy() {
    if (minigame && minigame.offFeedStatusChange) {
      minigame.offFeedStatusChange(this.feedStatusChangeCallBack);
    }
  };
  return FeedStatusController;
}(Component)) || _class);

replaceProperty(Camera, 'Camera', [{
  name: 'CameraClearFlag',
  newName: 'ClearFlag'
}]);
replaceProperty(Camera.prototype, 'Camera.prototype', [{
  name: 'color',
  newName: 'clearColor'
}, {
  name: 'depth',
  newName: 'clearDepth'
}, {
  name: 'stencil',
  newName: 'clearStencil'
}]);
markAsWarning(Renderer.prototype, 'Renderer.prototype', [{
  name: 'getMaterial',
  suggest: 'please use renderer.getSharedMaterial instead.'
}]);
cclegacy.CameraComponent = Camera;
setClassAlias(Camera, 'cc.CameraComponent');
cclegacy.RenderableComponent = ModelRenderer;
setClassAlias(ModelRenderer, 'cc.RenderableComponent');

export { FeedStatusController as F, PrefabLink as P };
//# sourceMappingURL=deprecated-CzzdLkmW.js.map
