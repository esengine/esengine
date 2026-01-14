import { f as Vec3 } from './index-uXI1_UMk.js';

function applyDefaultGeometryOptions(options) {
  options = options || {};
  if (options.includeNormal === undefined) {
    options.includeNormal = true;
  }
  if (options.includeUV === undefined) {
    options.includeUV = true;
  }
  return options;
}

function box(options) {
  options = options || {};
  var ws = options.widthSegments || 1;
  var hs = options.heightSegments || 1;
  var ls = options.lengthSegments || 1;
  var hw = (options.width || 1) / 2;
  var hh = (options.height || 1) / 2;
  var hl = (options.length || 1) / 2;
  var corners = [Vec3.set(c0, -hw, -hh, hl), Vec3.set(c1, hw, -hh, hl), Vec3.set(c2, hw, hh, hl), Vec3.set(c3, -hw, hh, hl), Vec3.set(c4, hw, -hh, -hl), Vec3.set(c5, -hw, -hh, -hl), Vec3.set(c6, -hw, hh, -hl), Vec3.set(c7, hw, hh, -hl)];
  var faceAxes = [[2, 3, 1], [4, 5, 7], [7, 6, 2], [1, 0, 4], [1, 4, 2], [5, 0, 6]];
  var faceNormals = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];
  var faceTangents = [[-1, 0, 0, 1], [-1, 0, 0, 1], [-1, 0, 0, 1], [-1, 0, 0, 1], [0, 0, -1, 1], [0, 0, 1, 1]];
  var positions = [];
  var normals = [];
  var uvs = [];
  var tangents = [];
  var indices = [];
  var minPos = new Vec3(-hw, -hh, -hl);
  var maxPos = new Vec3(hw, hh, hl);
  var boundingRadius = Math.sqrt(hw * hw + hh * hh + hl * hl);
  function _buildPlane(side, uSegments, vSegments) {
    var u;
    var v;
    var ix;
    var iy;
    var offset = positions.length / 3;
    var faceAxe = faceAxes[side];
    var faceNormal = faceNormals[side];
    var faceTangent = faceTangents[side];
    for (iy = 0; iy <= vSegments; iy++) {
      for (ix = 0; ix <= uSegments; ix++) {
        u = ix / uSegments;
        v = iy / vSegments;
        Vec3.lerp(temp1$3, corners[faceAxe[0]], corners[faceAxe[1]], u);
        Vec3.lerp(temp2$3, corners[faceAxe[0]], corners[faceAxe[2]], v);
        Vec3.subtract(temp3$1, temp2$3, corners[faceAxe[0]]);
        Vec3.add(r$1, temp1$3, temp3$1);
        positions.push(r$1.x, r$1.y, r$1.z);
        normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
        uvs.push(u, v);
        tangents.push(faceTangent[0], faceTangent[1], faceTangent[2], faceTangent[3]);
        if (ix < uSegments && iy < vSegments) {
          var useg1 = uSegments + 1;
          var a = ix + iy * useg1;
          var b = ix + (iy + 1) * useg1;
          var c = ix + 1 + (iy + 1) * useg1;
          var d = ix + 1 + iy * useg1;
          indices.push(offset + a, offset + d, offset + b);
          indices.push(offset + b, offset + d, offset + c);
        }
      }
    }
  }
  _buildPlane(0, ws, hs);
  _buildPlane(4, ls, hs);
  _buildPlane(1, ws, hs);
  _buildPlane(5, ls, hs);
  _buildPlane(3, ws, ls);
  _buildPlane(2, ws, ls);
  return {
    positions: positions,
    normals: normals,
    uvs: uvs,
    tangents: tangents,
    indices: indices,
    minPos: minPos,
    maxPos: maxPos,
    boundingRadius: boundingRadius
  };
}
var temp1$3 = new Vec3();
var temp2$3 = new Vec3();
var temp3$1 = new Vec3();
var r$1 = new Vec3();
var c0 = new Vec3();
var c1 = new Vec3();
var c2 = new Vec3();
var c3 = new Vec3();
var c4 = new Vec3();
var c5 = new Vec3();
var c6 = new Vec3();
var c7 = new Vec3();

var temp1$2 = new Vec3(0, 0, 0);
var temp2$2 = new Vec3(0, 0, 0);
function cylinder(radiusTop, radiusBottom, height, opts) {
  if (radiusTop === void 0) {
    radiusTop = 0.5;
  }
  if (radiusBottom === void 0) {
    radiusBottom = 0.5;
  }
  if (height === void 0) {
    height = 2;
  }
  if (opts === void 0) {
    opts = {};
  }
  var halfHeight = height * 0.5;
  var radialSegments = opts.radialSegments || 32;
  var heightSegments = opts.heightSegments || 1;
  var capped = opts.capped !== undefined ? opts.capped : true;
  var arc = opts.arc || 2.0 * Math.PI;
  var cntCap = 0;
  if (capped) {
    if (radiusTop > 0) {
      cntCap++;
    }
    if (radiusBottom > 0) {
      cntCap++;
    }
  }
  var vertCount = (radialSegments + 1) * (heightSegments + 1);
  if (capped) {
    vertCount += (radialSegments + 1) * cntCap + radialSegments * cntCap;
  }
  var indexCount = radialSegments * heightSegments * 2 * 3;
  if (capped) {
    indexCount += radialSegments * cntCap * 3;
  }
  var indices = new Array(indexCount);
  var positions = new Array(vertCount * 3);
  var normals = new Array(vertCount * 3);
  var uvs = new Array(vertCount * 2);
  var maxRadius = Math.max(radiusTop, radiusBottom);
  var minPos = new Vec3(-maxRadius, -halfHeight, -maxRadius);
  var maxPos = new Vec3(maxRadius, halfHeight, maxRadius);
  var boundingRadius = Math.sqrt(maxRadius * maxRadius + halfHeight * halfHeight);
  var index = 0;
  var indexOffset = 0;
  generateTorso();
  if (capped) {
    if (radiusBottom > 0) {
      generateCap(false);
    }
    if (radiusTop > 0) {
      generateCap(true);
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
  function generateTorso() {
    var indexArray = [];
    var r = radiusTop - radiusBottom;
    var slope = r * r / height * Math.sign(r);
    for (var y = 0; y <= heightSegments; y++) {
      var indexRow = [];
      var v = y / heightSegments;
      var radius = v * r + radiusBottom;
      for (var x = 0; x <= radialSegments; ++x) {
        var u = x / radialSegments;
        var theta = u * arc;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        positions[3 * index] = radius * sinTheta;
        positions[3 * index + 1] = v * height - halfHeight;
        positions[3 * index + 2] = radius * cosTheta;
        Vec3.normalize(temp1$2, Vec3.set(temp2$2, sinTheta, -slope, cosTheta));
        normals[3 * index] = temp1$2.x;
        normals[3 * index + 1] = temp1$2.y;
        normals[3 * index + 2] = temp1$2.z;
        uvs[2 * index] = (1 - u) * 2 % 1;
        uvs[2 * index + 1] = v;
        indexRow.push(index);
        ++index;
      }
      indexArray.push(indexRow);
    }
    for (var _y = 0; _y < heightSegments; ++_y) {
      for (var _x = 0; _x < radialSegments; ++_x) {
        var i1 = indexArray[_y][_x];
        var i2 = indexArray[_y + 1][_x];
        var i3 = indexArray[_y + 1][_x + 1];
        var i4 = indexArray[_y][_x + 1];
        indices[indexOffset] = i1;
        ++indexOffset;
        indices[indexOffset] = i4;
        ++indexOffset;
        indices[indexOffset] = i2;
        ++indexOffset;
        indices[indexOffset] = i4;
        ++indexOffset;
        indices[indexOffset] = i3;
        ++indexOffset;
        indices[indexOffset] = i2;
        ++indexOffset;
      }
    }
  }
  function generateCap(top) {
    var radius = top ? radiusTop : radiusBottom;
    var sign = top ? 1 : -1;
    var centerIndexStart = index;
    for (var x = 1; x <= radialSegments; ++x) {
      positions[3 * index] = 0;
      positions[3 * index + 1] = halfHeight * sign;
      positions[3 * index + 2] = 0;
      normals[3 * index] = 0;
      normals[3 * index + 1] = sign;
      normals[3 * index + 2] = 0;
      uvs[2 * index] = 0.5;
      uvs[2 * index + 1] = 0.5;
      ++index;
    }
    var centerIndexEnd = index;
    for (var _x2 = 0; _x2 <= radialSegments; ++_x2) {
      var u = _x2 / radialSegments;
      var theta = u * arc;
      var cosTheta = Math.cos(theta);
      var sinTheta = Math.sin(theta);
      positions[3 * index] = radius * sinTheta;
      positions[3 * index + 1] = halfHeight * sign;
      positions[3 * index + 2] = radius * cosTheta;
      normals[3 * index] = 0;
      normals[3 * index + 1] = sign;
      normals[3 * index + 2] = 0;
      uvs[2 * index] = 0.5 - sinTheta * 0.5 * sign;
      uvs[2 * index + 1] = 0.5 + cosTheta * 0.5;
      ++index;
    }
    for (var _x3 = 0; _x3 < radialSegments; ++_x3) {
      var c = centerIndexStart + _x3;
      var i = centerIndexEnd + _x3;
      if (top) {
        indices[indexOffset] = i + 1;
        ++indexOffset;
        indices[indexOffset] = c;
        ++indexOffset;
        indices[indexOffset] = i;
        ++indexOffset;
      } else {
        indices[indexOffset] = c;
        ++indexOffset;
        indices[indexOffset] = i + 1;
        ++indexOffset;
        indices[indexOffset] = i;
        ++indexOffset;
      }
    }
  }
}

function applyDefaultPlaneOptions(options) {
  options = applyDefaultGeometryOptions(options);
  options.width = options.width || 10;
  options.length = options.length || 10;
  options.widthSegments = options.widthSegments || 10;
  options.lengthSegments = options.lengthSegments || 10;
  return options;
}
var temp1$1 = new Vec3(0, 0, 0);
var temp2$1 = new Vec3(0, 0, 0);
var temp3 = new Vec3(0, 0, 0);
var r = new Vec3(0, 0, 0);
var c00 = new Vec3(0, 0, 0);
var c10 = new Vec3(0, 0, 0);
var c01 = new Vec3(0, 0, 0);
function plane(options) {
  var normalizedOptions = applyDefaultPlaneOptions(options);
  var width = normalizedOptions.width,
    length = normalizedOptions.length,
    uSegments = normalizedOptions.widthSegments,
    vSegments = normalizedOptions.lengthSegments;
  var hw = width * 0.5;
  var hl = length * 0.5;
  var positions = [];
  var uvs = [];
  var indices = [];
  var minPos = new Vec3(-hw, 0, -hl);
  var maxPos = new Vec3(hw, 0, hl);
  var boundingRadius = Math.sqrt(width * width + length * length);
  Vec3.set(c00, -hw, 0, hl);
  Vec3.set(c10, hw, 0, hl);
  Vec3.set(c01, -hw, 0, -hl);
  for (var y = 0; y <= vSegments; y++) {
    for (var x = 0; x <= uSegments; x++) {
      var u = x / uSegments;
      var v = y / vSegments;
      Vec3.lerp(temp1$1, c00, c10, u);
      Vec3.lerp(temp2$1, c00, c01, v);
      Vec3.subtract(temp3, temp2$1, c00);
      Vec3.add(r, temp1$1, temp3);
      positions.push(r.x, r.y, r.z);
      if (normalizedOptions.includeUV) {
        uvs.push(u, v);
      }
      if (x < uSegments && y < vSegments) {
        var useg1 = uSegments + 1;
        var a = x + y * useg1;
        var b = x + (y + 1) * useg1;
        var c = x + 1 + (y + 1) * useg1;
        var d = x + 1 + y * useg1;
        indices.push(a, d, b);
        indices.push(d, c, b);
      }
    }
  }
  var result = {
    positions: positions,
    indices: indices,
    minPos: minPos,
    maxPos: maxPos,
    boundingRadius: boundingRadius
  };
  if (normalizedOptions.includeNormal) {
    var nVertex = (vSegments + 1) * (uSegments + 1);
    var normals = new Array(3 * nVertex);
    result.normals = normals;
    for (var i = 0; i < nVertex; ++i) {
      normals[i * 3 + 0] = 0;
      normals[i * 3 + 1] = 1;
      normals[i * 3 + 2] = 0;
    }
  }
  if (normalizedOptions.includeUV) {
    result.uvs = uvs;
  }
  return result;
}

var temp1 = new Vec3(0, 0, 0);
var temp2 = new Vec3(0, 0, 0);
function capsule(radiusTop, radiusBottom, height, opts) {
  if (radiusTop === void 0) {
    radiusTop = 0.5;
  }
  if (radiusBottom === void 0) {
    radiusBottom = 0.5;
  }
  if (height === void 0) {
    height = 2;
  }
  if (opts === void 0) {
    opts = {};
  }
  var torsoHeight = height - radiusTop - radiusBottom;
  var sides = opts.sides || 32;
  var heightSegments = opts.heightSegments || 32;
  var bottomProp = radiusBottom / height;
  var torProp = torsoHeight / height;
  var topProp = radiusTop / height;
  var bottomSegments = Math.floor(heightSegments * bottomProp);
  var topSegments = Math.floor(heightSegments * topProp);
  var torSegments = Math.floor(heightSegments * torProp);
  var topOffset = torsoHeight + radiusBottom - height / 2;
  var torOffset = radiusBottom - height / 2;
  var bottomOffset = radiusBottom - height / 2;
  var arc = opts.arc || 2.0 * Math.PI;
  var positions = [];
  var normals = [];
  var uvs = [];
  var indices = [];
  var maxRadius = Math.max(radiusTop, radiusBottom);
  var minPos = new Vec3(-maxRadius, -height / 2, -maxRadius);
  var maxPos = new Vec3(maxRadius, height / 2, maxRadius);
  var boundingRadius = height / 2;
  var index = 0;
  var indexArray = [];
  generateBottom();
  generateTorso();
  generateTop();
  return {
    positions: positions,
    normals: normals,
    uvs: uvs,
    indices: indices,
    minPos: minPos,
    maxPos: maxPos,
    boundingRadius: boundingRadius
  };
  function generateTorso() {
    var slope = (radiusTop - radiusBottom) / torsoHeight;
    for (var y = 0; y <= torSegments; y++) {
      var indexRow = [];
      var lat = y / torSegments;
      var radius = lat * (radiusTop - radiusBottom) + radiusBottom;
      for (var x = 0; x <= sides; ++x) {
        var u = x / sides;
        var v = lat * torProp + bottomProp;
        var theta = u * arc - arc / 4;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        positions.push(radius * sinTheta);
        positions.push(lat * torsoHeight + torOffset);
        positions.push(radius * cosTheta);
        Vec3.normalize(temp1, Vec3.set(temp2, sinTheta, -slope, cosTheta));
        normals.push(temp1.x);
        normals.push(temp1.y);
        normals.push(temp1.z);
        uvs.push(u, v);
        indexRow.push(index);
        ++index;
      }
      indexArray.push(indexRow);
    }
    for (var _y = 0; _y < torSegments; ++_y) {
      for (var _x = 0; _x < sides; ++_x) {
        var i1 = indexArray[_y][_x];
        var i2 = indexArray[_y + 1][_x];
        var i3 = indexArray[_y + 1][_x + 1];
        var i4 = indexArray[_y][_x + 1];
        indices.push(i1);
        indices.push(i4);
        indices.push(i2);
        indices.push(i4);
        indices.push(i3);
        indices.push(i2);
      }
    }
  }
  function generateBottom() {
    for (var lat = 0; lat <= bottomSegments; ++lat) {
      var theta = lat * Math.PI / bottomSegments / 2;
      var sinTheta = Math.sin(theta);
      var cosTheta = -Math.cos(theta);
      for (var lon = 0; lon <= sides; ++lon) {
        var phi = lon * 2 * Math.PI / sides - Math.PI / 2.0;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var x = sinPhi * sinTheta;
        var y = cosTheta;
        var z = cosPhi * sinTheta;
        var u = lon / sides;
        var v = lat / heightSegments;
        positions.push(x * radiusBottom, y * radiusBottom + bottomOffset, z * radiusBottom);
        normals.push(x, y, z);
        uvs.push(u, v);
        if (lat < bottomSegments && lon < sides) {
          var seg1 = sides + 1;
          var a = seg1 * lat + lon;
          var b = seg1 * (lat + 1) + lon;
          var c = seg1 * (lat + 1) + lon + 1;
          var d = seg1 * lat + lon + 1;
          indices.push(a, d, b);
          indices.push(d, c, b);
        }
        ++index;
      }
    }
  }
  function generateTop() {
    for (var lat = 0; lat <= topSegments; ++lat) {
      var theta = lat * Math.PI / topSegments / 2 + Math.PI / 2;
      var sinTheta = Math.sin(theta);
      var cosTheta = -Math.cos(theta);
      for (var lon = 0; lon <= sides; ++lon) {
        var phi = lon * 2 * Math.PI / sides - Math.PI / 2.0;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var x = sinPhi * sinTheta;
        var y = cosTheta;
        var z = cosPhi * sinTheta;
        var u = lon / sides;
        var v = lat / heightSegments + (1 - topProp);
        positions.push(x * radiusTop, y * radiusTop + topOffset, z * radiusTop);
        normals.push(x, y, z);
        uvs.push(u, v);
        if (lat < topSegments && lon < sides) {
          var seg1 = sides + 1;
          var a = seg1 * lat + lon + indexArray[torSegments][sides] + 1;
          var b = seg1 * (lat + 1) + lon + indexArray[torSegments][sides] + 1;
          var c = seg1 * (lat + 1) + lon + 1 + indexArray[torSegments][sides] + 1;
          var d = seg1 * lat + lon + 1 + indexArray[torSegments][sides] + 1;
          indices.push(a, d, b);
          indices.push(d, c, b);
        }
      }
    }
  }
}

export { applyDefaultGeometryOptions as a, box as b, cylinder as c, capsule as d, plane as p };
//# sourceMappingURL=capsule-9D-8tsOp.js.map
