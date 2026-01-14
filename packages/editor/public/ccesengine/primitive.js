import './device-manager-CBXP-ttm.js';
import { y as PrimitiveMode } from './buffer-barrier-BlQXg9Aa.js';
import { c as cylinder, a as applyDefaultGeometryOptions, b as box, d as capsule, p as plane } from './capsule-9D-8tsOp.js';
import { f as Vec3, c as ccclass, t as type, b as applyDecoratedInitializer, s as serializable } from './index-uXI1_UMk.js';
import { c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';
import { E as Enum, _ as _inheritsLoose } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './prefab-DYg_oxpo.js';
import { _ as _createMesh } from './create-mesh-CfKC5EQd.js';
import './debug-view-BuNhRPv_.js';
import { M as Mesh } from './mesh-XWfHgs1t.js';
import './scene-vWcxM1_c.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './node-event-Ccvtv8bJ.js';
import './touch-BKrZ-fxl.js';
import './wasm-web-BpK36a26.js';
import './deprecated-Dswa7XeN.js';
import './director-F7e_Lqjg.js';
import './deprecated-n0w4kK7g.js';
import './zlib.min-3VC1ush6.js';

function wireframe(indices) {
  var offsets = [[0, 1], [1, 2], [2, 0]];
  var lines = [];
  var lineIDs = {};
  for (var i = 0; i < indices.length; i += 3) {
    for (var k = 0; k < 3; ++k) {
      var i1 = indices[i + offsets[k][0]];
      var i2 = indices[i + offsets[k][1]];
      var id = i1 > i2 ? i2 << 16 | i1 : i1 << 16 | i2;
      if (lineIDs[id] === undefined) {
        lineIDs[id] = 0;
        lines.push(i1, i2);
      }
    }
  }
  return lines;
}
function invWinding(indices) {
  var newIB = [];
  for (var i = 0; i < indices.length; i += 3) {
    newIB.push(indices[i], indices[i + 2], indices[i + 1]);
  }
  return newIB;
}
function toWavefrontOBJ(primitive, scale) {
  if (scale === void 0) {
    scale = 1;
  }
  if (!primitive.indices || !primitive.uvs || !primitive.normals || primitive.primitiveMode !== undefined && primitive.primitiveMode !== PrimitiveMode.TRIANGLE_LIST) {
    return '';
  }
  var v = primitive.positions;
  var t = primitive.uvs;
  var n = primitive.normals;
  var IB = primitive.indices;
  var V = function V(i) {
    return IB[i] + 1 + "/" + (IB[i] + 1) + "/" + (IB[i] + 1);
  };
  var content = '';
  for (var i = 0; i < v.length; i += 3) {
    content += "v " + v[i] * scale + " " + v[i + 1] * scale + " " + v[i + 2] * scale + "\n";
  }
  for (var _i = 0; _i < t.length; _i += 2) {
    content += "vt " + t[_i] + " " + t[_i + 1] + "\n";
  }
  for (var _i2 = 0; _i2 < n.length; _i2 += 3) {
    content += "vn " + n[_i2] + " " + n[_i2 + 1] + " " + n[_i2 + 2] + "\n";
  }
  for (var _i3 = 0; _i3 < IB.length; _i3 += 3) {
    content += "f " + V(_i3) + " " + V(_i3 + 1) + " " + V(_i3 + 2) + "\n";
  }
  return content;
}
function normals(positions, nms, length) {
  if (length === void 0) {
    length = 1;
  }
  var verts = new Array(2 * positions.length);
  for (var i = 0; i < positions.length / 3; ++i) {
    var i3 = 3 * i;
    var i6 = 6 * i;
    verts[i6 + 0] = positions[i3 + 0];
    verts[i6 + 1] = positions[i3 + 1];
    verts[i6 + 2] = positions[i3 + 2];
    verts[i6 + 3] = positions[i3 + 0] + nms[i3 + 0] * length;
    verts[i6 + 4] = positions[i3 + 1] + nms[i3 + 1] * length;
    verts[i6 + 5] = positions[i3 + 2] + nms[i3 + 2] * length;
  }
  return verts;
}

function cone(radius, height, opts) {
  if (radius === void 0) {
    radius = 0.5;
  }
  if (height === void 0) {
    height = 1;
  }
  if (opts === void 0) {
    opts = {};
  }
  return cylinder(0, radius, height, opts);
}

function quad(options) {
  var normalizedOptions = applyDefaultGeometryOptions(options);
  var result = {
    positions: [-0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0],
    indices: [0, 3, 1, 3, 2, 1],
    minPos: {
      x: -0.5,
      y: -0.5,
      z: 0
    },
    maxPos: {
      x: 0.5,
      y: 0.5,
      z: 0
    },
    boundingRadius: Math.sqrt(0.5 * 0.5 + 0.5 * 0.5)
  };
  if (normalizedOptions.includeNormal !== false) {
    result.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
  }
  if (normalizedOptions.includeUV !== false) {
    result.uvs = [0, 0, 0, 1, 1, 1, 1, 0];
  }
  return result;
}

function sphere(radius, opts) {
  if (radius === void 0) {
    radius = 0.5;
  }
  if (opts === void 0) {
    opts = {};
  }
  var segments = opts.segments !== undefined ? opts.segments : 32;
  var positions = [];
  var normals = [];
  var uvs = [];
  var indices = [];
  var minPos = new Vec3(-radius, -radius, -radius);
  var maxPos = new Vec3(radius, radius, radius);
  var boundingRadius = radius;
  for (var lat = 0; lat <= segments; ++lat) {
    var theta = lat * Math.PI / segments;
    var sinTheta = Math.sin(theta);
    var cosTheta = -Math.cos(theta);
    for (var lon = 0; lon <= segments; ++lon) {
      var phi = lon * 2 * Math.PI / segments - Math.PI / 2.0;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      var x = sinPhi * sinTheta;
      var y = cosTheta;
      var z = cosPhi * sinTheta;
      var u = lon / segments;
      var v = lat / segments;
      positions.push(x * radius, y * radius, z * radius);
      normals.push(x, y, z);
      uvs.push(u, v);
      if (lat < segments && lon < segments) {
        var seg1 = segments + 1;
        var a = seg1 * lat + lon;
        var b = seg1 * (lat + 1) + lon;
        var c = seg1 * (lat + 1) + lon + 1;
        var d = seg1 * lat + lon + 1;
        indices.push(a, d, b);
        indices.push(d, c, b);
      }
    }
  }
  return {
    positions: positions,
    indices: indices,
    normals: normals,
    uvs: uvs,
    minPos: minPos,
    maxPos: maxPos,
    boundingRadius: boundingRadius
  };
}

function torus(radius, tube, opts) {
  if (radius === void 0) {
    radius = 0.4;
  }
  if (tube === void 0) {
    tube = 0.1;
  }
  if (opts === void 0) {
    opts = {};
  }
  var radialSegments = opts.radialSegments || 32;
  var tubularSegments = opts.tubularSegments || 32;
  var arc = opts.arc || 2.0 * Math.PI;
  var positions = [];
  var normals = [];
  var uvs = [];
  var indices = [];
  var minPos = new Vec3(-radius - tube, -tube, -radius - tube);
  var maxPos = new Vec3(radius + tube, tube, radius + tube);
  var boundingRadius = radius + tube;
  for (var j = 0; j <= radialSegments; j++) {
    for (var i = 0; i <= tubularSegments; i++) {
      var u = i / tubularSegments;
      var v = j / radialSegments;
      var u1 = u * arc;
      var v1 = v * Math.PI * 2;
      var x = (radius + tube * Math.cos(v1)) * Math.sin(u1);
      var y = tube * Math.sin(v1);
      var z = (radius + tube * Math.cos(v1)) * Math.cos(u1);
      var nx = Math.sin(u1) * Math.cos(v1);
      var ny = Math.sin(v1);
      var nz = Math.cos(u1) * Math.cos(v1);
      positions.push(x, y, z);
      normals.push(nx, ny, nz);
      uvs.push(u, v);
      if (i < tubularSegments && j < radialSegments) {
        var seg1 = tubularSegments + 1;
        var a = seg1 * j + i;
        var b = seg1 * (j + 1) + i;
        var c = seg1 * (j + 1) + i + 1;
        var d = seg1 * j + i + 1;
        indices.push(a, d, b);
        indices.push(d, c, b);
      }
    }
  }
  return {
    positions: positions,
    normals: normals,
    uvs: uvs,
    indices: indices,
    minPos: minPos,
    maxPos: maxPos,
    boundingRadius: boundingRadius
  };
}

function applyDefaultCircleOptions(options) {
  options = applyDefaultGeometryOptions(options);
  options.segments = 64;
  return options;
}
function circle(options) {
  var normalizedOptions = applyDefaultCircleOptions(options);
  var segments = normalizedOptions.segments;
  var positions = new Array(3 * (segments + 1));
  positions[0] = 0;
  positions[1] = 0;
  positions[2] = 0;
  var indices = new Array(1 + segments * 2);
  indices[0] = 0;
  var step = Math.PI * 2 / segments;
  for (var iSegment = 0; iSegment < segments; ++iSegment) {
    var angle = step * iSegment;
    var x = Math.cos(angle);
    var y = Math.sin(angle);
    var p = (iSegment + 1) * 3;
    positions[p + 0] = x;
    positions[p + 1] = y;
    positions[p + 2] = 0;
    var i = iSegment * 2;
    indices[1 + i] = iSegment + 1;
    indices[1 + (i + 1)] = iSegment + 2;
  }
  if (segments > 0) {
    indices[indices.length - 1] = 1;
  }
  var result = {
    positions: positions,
    indices: indices,
    minPos: {
      x: 1,
      y: 1,
      z: 0
    },
    maxPos: {
      x: -1,
      y: -1,
      z: 0
    },
    boundingRadius: 1,
    primitiveMode: PrimitiveMode.TRIANGLE_FAN
  };
  return result;
}

function translate(geometry, offset) {
  var x = offset.x || 0;
  var y = offset.y || 0;
  var z = offset.z || 0;
  var nVertex = Math.floor(geometry.positions.length / 3);
  for (var iVertex = 0; iVertex < nVertex; ++iVertex) {
    var iX = iVertex * 3;
    var iY = iVertex * 3 + 1;
    var iZ = iVertex * 3 + 2;
    geometry.positions[iX] += x;
    geometry.positions[iY] += y;
    geometry.positions[iZ] += z;
  }
  if (geometry.minPos) {
    geometry.minPos.x += x;
    geometry.minPos.y += y;
    geometry.minPos.z += z;
  }
  if (geometry.maxPos) {
    geometry.maxPos.x += x;
    geometry.maxPos.y += y;
    geometry.maxPos.z += z;
  }
  return geometry;
}
function scale(geometry, value) {
  var _value$x, _value$y, _value$z;
  var x = (_value$x = value.x) !== null && _value$x !== void 0 ? _value$x : 1.0;
  var y = (_value$y = value.y) !== null && _value$y !== void 0 ? _value$y : 1.0;
  var z = (_value$z = value.z) !== null && _value$z !== void 0 ? _value$z : 1.0;
  var nVertex = Math.floor(geometry.positions.length / 3);
  for (var iVertex = 0; iVertex < nVertex; ++iVertex) {
    var iX = iVertex * 3;
    var iY = iVertex * 3 + 1;
    var iZ = iVertex * 3 + 2;
    geometry.positions[iX] *= x;
    geometry.positions[iY] *= y;
    geometry.positions[iZ] *= z;
  }
  var minPos = geometry.minPos,
    maxPos = geometry.maxPos;
  if (minPos) {
    minPos.x *= x;
    minPos.y *= y;
    minPos.z *= z;
  }
  if (maxPos) {
    maxPos.x *= x;
    maxPos.y *= y;
    maxPos.z *= z;
  }
  if (minPos && maxPos) {
    if (x < 0) {
      var tmp = minPos.x;
      minPos.x = maxPos.x;
      maxPos.x = tmp;
    }
    if (y < 0) {
      var _tmp = minPos.y;
      minPos.y = maxPos.y;
      maxPos.y = _tmp;
    }
    if (z < 0) {
      var _tmp2 = minPos.z;
      minPos.z = maxPos.z;
      maxPos.z = _tmp2;
    }
  }
  if (typeof geometry.boundingRadius !== 'undefined') {
    geometry.boundingRadius *= Math.max(Math.max(Math.abs(x), Math.abs(y)), Math.abs(z));
  }
  return geometry;
}
function wireframed(geometry) {
  var indices = geometry.indices;
  if (!indices) {
    return geometry;
  }
  if (geometry.primitiveMode && geometry.primitiveMode !== PrimitiveMode.TRIANGLE_LIST) {
    return geometry;
  }
  var offsets = [[0, 1], [1, 2], [2, 0]];
  var lines = [];
  var lineIDs = {};
  for (var i = 0; i < indices.length; i += 3) {
    for (var k = 0; k < 3; ++k) {
      var i1 = indices[i + offsets[k][0]];
      var i2 = indices[i + offsets[k][1]];
      var id = i1 > i2 ? i2 << 16 | i1 : i1 << 16 | i2;
      if (lineIDs[id] === undefined) {
        lineIDs[id] = 0;
        lines.push(i1, i2);
      }
    }
  }
  geometry.indices = lines;
  geometry.primitiveMode = PrimitiveMode.LINE_LIST;
  return geometry;
}

var primitives = /*#__PURE__*/Object.freeze({
    __proto__: null,
    applyDefaultGeometryOptions: applyDefaultGeometryOptions,
    box: box,
    capsule: capsule,
    circle: circle,
    cone: cone,
    cylinder: cylinder,
    invWinding: invWinding,
    normals: normals,
    plane: plane,
    quad: quad,
    scale: scale,
    sphere: sphere,
    toWavefrontOBJ: toWavefrontOBJ,
    torus: torus,
    translate: translate,
    wireframe: wireframe,
    wireframed: wireframed
});

var _dec, _dec2, _class, _class2, _initializer, _initializer2, _Primitive;
var PrimitiveType;
(function (PrimitiveType) {
  PrimitiveType[PrimitiveType["BOX"] = 0] = "BOX";
  PrimitiveType[PrimitiveType["SPHERE"] = 1] = "SPHERE";
  PrimitiveType[PrimitiveType["CYLINDER"] = 2] = "CYLINDER";
  PrimitiveType[PrimitiveType["CONE"] = 3] = "CONE";
  PrimitiveType[PrimitiveType["CAPSULE"] = 4] = "CAPSULE";
  PrimitiveType[PrimitiveType["TORUS"] = 5] = "TORUS";
  PrimitiveType[PrimitiveType["PLANE"] = 6] = "PLANE";
  PrimitiveType[PrimitiveType["QUAD"] = 7] = "QUAD";
})(PrimitiveType || (PrimitiveType = {}));
Enum(PrimitiveType);
var Primitive = (_dec = ccclass('cc.Primitive'), _dec2 = type(PrimitiveType), _dec(_class = (_class2 = (_Primitive = function (_Mesh) {
  function Primitive(type) {
    var _this;
    if (type === void 0) {
      type = PrimitiveType.BOX;
    }
    _this = _Mesh.call(this) || this;
    _this.type = _initializer && _initializer();
    _this.info = _initializer2 && _initializer2();
    _this.type = type;
    return _this;
  }
  _inheritsLoose(Primitive, _Mesh);
  var _proto = Primitive.prototype;
  _proto.onLoaded = function onLoaded() {
    var factory = primitives[PrimitiveType[this.type].toLowerCase()];
    _createMesh(factory(this.info), this);
  };
  return Primitive;
}(Mesh), _Primitive.PrimitiveType = PrimitiveType, _Primitive), _initializer = applyDecoratedInitializer(_class2.prototype, "type", [_dec2], function () {
  return PrimitiveType.BOX;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "info", [serializable], function () {
  return {};
}), _class2)) || _class);
cclegacy.Primitive = Primitive;

legacyCC.primitives = primitives;

export { Primitive, primitives };
//# sourceMappingURL=primitive.js.map
