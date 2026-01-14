import { f as Vec3, P as Mat3, c as ccclass$1, b as applyDecoratedInitializer, s as serializable$1, E as EPSILON, g as Vec4, t as type, d as disallowMultiple } from './index-uXI1_UMk.js';
import { E as Enum, o as assertIsTrue, a as _createClass, _ as _inheritsLoose, b as _applyDecoratedDescriptor, p as CCInteger } from './gc-object-CShF5lzx.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { N as NodeEventType, C as Component } from './node-event-Ccvtv8bJ.js';

var PlaceMethod = Enum({
  UNIFORM: 0,
  ADAPTIVE: 1
});
var AutoPlacement = function () {
  function AutoPlacement() {}
  AutoPlacement.generate = function generate(info) {
    switch (info.method) {
      case PlaceMethod.UNIFORM:
        return this.doGenerateUniform(info);
      case PlaceMethod.ADAPTIVE:
        return this.doGenerateAdaptive(info);
      default:
        return [];
    }
  };
  AutoPlacement.doGenerateUniform = function doGenerateUniform(info) {
    if (info.nProbesX < 2 || info.nProbesY < 2 || info.nProbesZ < 2) {
      return [];
    }
    var probes = [];
    var position = new Vec3(0.0, 0.0, 0.0);
    var gridSize = new Vec3((info.maxPos.x - info.minPos.x) / (info.nProbesX - 1), (info.maxPos.y - info.minPos.y) / (info.nProbesY - 1), (info.maxPos.z - info.minPos.z) / (info.nProbesZ - 1));
    for (var x = 0; x < info.nProbesX; x++) {
      position.x = x * gridSize.x + info.minPos.x;
      for (var y = 0; y < info.nProbesY; y++) {
        position.y = y * gridSize.y + info.minPos.y;
        for (var z = 0; z < info.nProbesZ; z++) {
          position.z = z * gridSize.z + info.minPos.z;
          probes.push(new Vec3(position));
        }
      }
    }
    return probes;
  };
  AutoPlacement.doGenerateAdaptive = function doGenerateAdaptive(info) {
    return this.doGenerateUniform(info);
  };
  return AutoPlacement;
}();

var _dec$2, _class$2, _class2$2, _initializer$2, _initializer2$2, _initializer3$1, _class3, _initializer4$1, _initializer5$1, _initializer6$1, _initializer7$1, _class4, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _dec2$2, _class5, _class6, _initializer14, _initializer15, _dec3$2, _class7, _class8, _initializer16, _initializer17, _initializer18, _initializer19, _initializer20, _initializer21, _initializer22, _initializer23, _initializer24;
var ccclass = ccclass$1,
  serializable = serializable$1;
var _mat = new Mat3();
var _n = new Vec3(0.0, 0.0, 0.0);
var _a = new Vec3(0.0, 0.0, 0.0);
var _ap = new Vec3(0.0, 0.0, 0.0);
var _b = new Vec3(0.0, 0.0, 0.0);
var _bp = new Vec3(0.0, 0.0, 0.0);
var _p2 = new Vec3(0.0, 0.0, 0.0);
var _cp = new Vec3(0.0, 0.0, 0.0);
var Vertex = (_dec$2 = ccclass('cc.Vertex'), _dec$2(_class$2 = (_class2$2 = function Vertex(pos) {
  this.position = _initializer$2 && _initializer$2();
  this.normal = _initializer2$2 && _initializer2$2();
  this.coefficients = _initializer3$1 && _initializer3$1();
  this.position.set(pos);
}, _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "position", [serializable], function () {
  return new Vec3(0, 0, 0);
}), _initializer2$2 = applyDecoratedInitializer(_class2$2.prototype, "normal", [serializable], function () {
  return new Vec3(0, 0, 0);
}), _initializer3$1 = applyDecoratedInitializer(_class2$2.prototype, "coefficients", [serializable], function () {
  return [];
}), _class2$2)) || _class$2);
var Edge = (_class3 = function () {
  function Edge(tet, i, v0, v1) {
    this.tetrahedron = _initializer4$1 && _initializer4$1();
    this.index = _initializer5$1 && _initializer5$1();
    this.vertex0 = _initializer6$1 && _initializer6$1();
    this.vertex1 = _initializer7$1 && _initializer7$1();
    this.tetrahedron = tet;
    this.index = i;
    if (v0 < v1) {
      this.vertex0 = v0;
      this.vertex1 = v1;
    } else {
      this.vertex0 = v1;
      this.vertex1 = v0;
    }
  }
  var _proto = Edge.prototype;
  _proto.set = function set(tet, i, v0, v1) {
    this.tetrahedron = tet;
    this.index = i;
    if (v0 < v1) {
      this.vertex0 = v0;
      this.vertex1 = v1;
    } else {
      this.vertex0 = v1;
      this.vertex1 = v0;
    }
  };
  _proto.isSame = function isSame(other) {
    return this.vertex0 === other.vertex0 && this.vertex1 === other.vertex1;
  };
  return Edge;
}(), _initializer4$1 = applyDecoratedInitializer(_class3.prototype, "tetrahedron", [serializable], function () {
  return -1;
}), _initializer5$1 = applyDecoratedInitializer(_class3.prototype, "index", [serializable], function () {
  return -1;
}), _initializer6$1 = applyDecoratedInitializer(_class3.prototype, "vertex0", [serializable], function () {
  return -1;
}), _initializer7$1 = applyDecoratedInitializer(_class3.prototype, "vertex1", [serializable], function () {
  return -1;
}), _class3);
var Triangle = (_class4 = function () {
  function Triangle(tet, i, v0, v1, v2, v3) {
    this.invalid = _initializer8 && _initializer8();
    this.isOuterFace = _initializer9 && _initializer9();
    this.tetrahedron = _initializer0 && _initializer0();
    this.index = _initializer1 && _initializer1();
    this.vertex0 = _initializer10 && _initializer10();
    this.vertex1 = _initializer11 && _initializer11();
    this.vertex2 = _initializer12 && _initializer12();
    this.vertex3 = _initializer13 && _initializer13();
    this.tetrahedron = tet;
    this.index = i;
    this.vertex3 = v3;
    if (v0 < v1 && v0 < v2) {
      this.vertex0 = v0;
      if (v1 < v2) {
        this.vertex1 = v1;
        this.vertex2 = v2;
      } else {
        this.vertex1 = v2;
        this.vertex2 = v1;
      }
    } else if (v1 < v0 && v1 < v2) {
      this.vertex0 = v1;
      if (v0 < v2) {
        this.vertex1 = v0;
        this.vertex2 = v2;
      } else {
        this.vertex1 = v2;
        this.vertex2 = v0;
      }
    } else {
      this.vertex0 = v2;
      if (v0 < v1) {
        this.vertex1 = v0;
        this.vertex2 = v1;
      } else {
        this.vertex1 = v1;
        this.vertex2 = v0;
      }
    }
  }
  var _proto2 = Triangle.prototype;
  _proto2.set = function set(tet, i, v0, v1, v2, v3) {
    this.invalid = false;
    this.isOuterFace = true;
    this.tetrahedron = tet;
    this.index = i;
    this.vertex3 = v3;
    if (v0 < v1 && v0 < v2) {
      this.vertex0 = v0;
      if (v1 < v2) {
        this.vertex1 = v1;
        this.vertex2 = v2;
      } else {
        this.vertex1 = v2;
        this.vertex2 = v1;
      }
    } else if (v1 < v0 && v1 < v2) {
      this.vertex0 = v1;
      if (v0 < v2) {
        this.vertex1 = v0;
        this.vertex2 = v2;
      } else {
        this.vertex1 = v2;
        this.vertex2 = v0;
      }
    } else {
      this.vertex0 = v2;
      if (v0 < v1) {
        this.vertex1 = v0;
        this.vertex2 = v1;
      } else {
        this.vertex1 = v1;
        this.vertex2 = v0;
      }
    }
  };
  _proto2.isSame = function isSame(other) {
    return this.vertex0 === other.vertex0 && this.vertex1 === other.vertex1 && this.vertex2 === other.vertex2;
  };
  return Triangle;
}(), _initializer8 = applyDecoratedInitializer(_class4.prototype, "invalid", [serializable], function () {
  return false;
}), _initializer9 = applyDecoratedInitializer(_class4.prototype, "isOuterFace", [serializable], function () {
  return true;
}), _initializer0 = applyDecoratedInitializer(_class4.prototype, "tetrahedron", [serializable], function () {
  return -1;
}), _initializer1 = applyDecoratedInitializer(_class4.prototype, "index", [serializable], function () {
  return -1;
}), _initializer10 = applyDecoratedInitializer(_class4.prototype, "vertex0", [serializable], function () {
  return -1;
}), _initializer11 = applyDecoratedInitializer(_class4.prototype, "vertex1", [serializable], function () {
  return -1;
}), _initializer12 = applyDecoratedInitializer(_class4.prototype, "vertex2", [serializable], function () {
  return -1;
}), _initializer13 = applyDecoratedInitializer(_class4.prototype, "vertex3", [serializable], function () {
  return -1;
}), _class4);
var CircumSphere = (_dec2$2 = ccclass('cc.CircumSphere'), _dec2$2(_class5 = (_class6 = function () {
  function CircumSphere() {
    this.center = _initializer14 && _initializer14();
    this.radiusSquared = _initializer15 && _initializer15();
  }
  var _proto3 = CircumSphere.prototype;
  _proto3.init = function init(p0, p1, p2, p3) {
    _mat.set(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z, p2.x - p0.x, p2.y - p0.y, p2.z - p0.z, p3.x - p0.x, p3.y - p0.y, p3.z - p0.z);
    _mat.invert();
    _mat.transpose();
    _n.set(((p1.x + p0.x) * (p1.x - p0.x) + (p1.y + p0.y) * (p1.y - p0.y) + (p1.z + p0.z) * (p1.z - p0.z)) * 0.5, ((p2.x + p0.x) * (p2.x - p0.x) + (p2.y + p0.y) * (p2.y - p0.y) + (p2.z + p0.z) * (p2.z - p0.z)) * 0.5, ((p3.x + p0.x) * (p3.x - p0.x) + (p3.y + p0.y) * (p3.y - p0.y) + (p3.z + p0.z) * (p3.z - p0.z)) * 0.5);
    Vec3.transformMat3(this.center, _n, _mat);
    this.radiusSquared = Vec3.squaredDistance(p0, this.center);
  };
  return CircumSphere;
}(), _initializer14 = applyDecoratedInitializer(_class6.prototype, "center", [serializable], function () {
  return new Vec3(0, 0, 0);
}), _initializer15 = applyDecoratedInitializer(_class6.prototype, "radiusSquared", [serializable], function () {
  return 0.0;
}), _class6)) || _class5);
var Tetrahedron = (_dec3$2 = ccclass('cc.Tetrahedron'), _dec3$2(_class7 = (_class8 = function () {
  function Tetrahedron(delaunay, v0, v1, v2, v3) {
    if (v3 === void 0) {
      v3 = -1;
    }
    this.invalid = _initializer16 && _initializer16();
    this.vertex0 = _initializer17 && _initializer17();
    this.vertex1 = _initializer18 && _initializer18();
    this.vertex2 = _initializer19 && _initializer19();
    this.vertex3 = _initializer20 && _initializer20();
    this.neighbours = _initializer21 && _initializer21();
    this.matrix = _initializer22 && _initializer22();
    this.offset = _initializer23 && _initializer23();
    this.sphere = _initializer24 && _initializer24();
    this.vertex0 = v0;
    this.vertex1 = v1;
    this.vertex2 = v2;
    this.vertex3 = v3;
    if (v3 >= 0) {
      var probes = delaunay._probes;
      var p0 = probes[this.vertex0].position;
      var p1 = probes[this.vertex1].position;
      var p2 = probes[this.vertex2].position;
      var p3 = probes[this.vertex3].position;
      this.sphere.init(p0, p1, p2, p3);
    }
  }
  var _proto4 = Tetrahedron.prototype;
  _proto4.isInCircumSphere = function isInCircumSphere(point) {
    return Vec3.squaredDistance(point, this.sphere.center) < this.sphere.radiusSquared - EPSILON;
  };
  _proto4.contain = function contain(vertexIndex) {
    return this.vertex0 === vertexIndex || this.vertex1 === vertexIndex || this.vertex2 === vertexIndex || this.vertex3 === vertexIndex;
  };
  _proto4.isInnerTetrahedron = function isInnerTetrahedron() {
    return this.vertex3 >= 0;
  };
  _proto4.isOuterCell = function isOuterCell() {
    return this.vertex3 < 0;
  };
  return Tetrahedron;
}(), _initializer16 = applyDecoratedInitializer(_class8.prototype, "invalid", [serializable], function () {
  return false;
}), _initializer17 = applyDecoratedInitializer(_class8.prototype, "vertex0", [serializable], function () {
  return -1;
}), _initializer18 = applyDecoratedInitializer(_class8.prototype, "vertex1", [serializable], function () {
  return -1;
}), _initializer19 = applyDecoratedInitializer(_class8.prototype, "vertex2", [serializable], function () {
  return -1;
}), _initializer20 = applyDecoratedInitializer(_class8.prototype, "vertex3", [serializable], function () {
  return -1;
}), _initializer21 = applyDecoratedInitializer(_class8.prototype, "neighbours", [serializable], function () {
  return [-1, -1, -1, -1];
}), _initializer22 = applyDecoratedInitializer(_class8.prototype, "matrix", [serializable], function () {
  return new Mat3();
}), _initializer23 = applyDecoratedInitializer(_class8.prototype, "offset", [serializable], function () {
  return new Vec3(0.0, 0.0, 0.0);
}), _initializer24 = applyDecoratedInitializer(_class8.prototype, "sphere", [serializable], function () {
  return new CircumSphere();
}), _class8)) || _class7);
var Delaunay = function () {
  function Delaunay(probes) {
    this._probes = [];
    this._tetrahedrons = [];
    this._triangles = [];
    this._edges = [];
    this._probes = probes;
  }
  var _proto5 = Delaunay.prototype;
  _proto5.build = function build() {
    this.reset();
    this.tetrahedralize();
    this.computeAdjacency();
    this.computeMatrices();
    return this._tetrahedrons;
  };
  _proto5.reset = function reset() {
    this._tetrahedrons.length = 0;
    this._triangles.length = 0;
    this._edges.length = 0;
  };
  _proto5.tetrahedralize = function tetrahedralize() {
    var probeCount = this._probes.length;
    var center = this.initTetrahedron();
    for (var i = 0; i < probeCount; i++) {
      this.addProbe(i);
    }
    this._tetrahedrons = this._tetrahedrons.filter(function (tetrahedron) {
      var vertexIndex = probeCount;
      var isSuperTetrahedron = tetrahedron.contain(vertexIndex) || tetrahedron.contain(vertexIndex + 1) || tetrahedron.contain(vertexIndex + 2) || tetrahedron.contain(vertexIndex + 3);
      return !isSuperTetrahedron;
    });
    this._probes.length = probeCount;
    this.reorder(center);
  };
  _proto5.initTetrahedron = function initTetrahedron() {
    var minPos = new Vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    var maxPos = new Vec3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    for (var i = 0; i < this._probes.length; i++) {
      var position = this._probes[i].position;
      minPos.x = Math.min(minPos.x, position.x);
      maxPos.x = Math.max(maxPos.x, position.x);
      minPos.y = Math.min(minPos.y, position.y);
      maxPos.y = Math.max(maxPos.y, position.y);
      minPos.z = Math.min(minPos.z, position.z);
      maxPos.z = Math.max(maxPos.z, position.z);
    }
    var center = new Vec3(0.0, 0.0, 0.0);
    Vec3.add(center, minPos, maxPos);
    Vec3.multiplyScalar(center, center, 0.5);
    var extent = new Vec3(0.0, 0.0, 0.0);
    Vec3.subtract(extent, maxPos, minPos);
    var offset = Math.max(extent.x, extent.y, extent.z) * 10.0;
    var p0 = new Vec3(center.x, center.y + offset, center.z);
    var p1 = new Vec3(center.x - offset, center.y - offset, center.z - offset);
    var p2 = new Vec3(center.x - offset, center.y - offset, center.z + offset);
    var p3 = new Vec3(center.x + offset, center.y - offset, center.z);
    var index = this._probes.length;
    this._probes.push(new Vertex(p0));
    this._probes.push(new Vertex(p1));
    this._probes.push(new Vertex(p2));
    this._probes.push(new Vertex(p3));
    this._tetrahedrons.push(new Tetrahedron(this, index, index + 1, index + 2, index + 3));
    return center;
  };
  _proto5.addTriangle = function addTriangle(index, tet, i, v0, v1, v2, v3) {
    if (index < this._triangles.length) {
      this._triangles[index].set(tet, i, v0, v1, v2, v3);
    } else {
      this._triangles.push(new Triangle(tet, i, v0, v1, v2, v3));
    }
  };
  _proto5.addEdge = function addEdge(index, tet, i, v0, v1) {
    if (index < this._edges.length) {
      this._edges[index].set(tet, i, v0, v1);
    } else {
      this._edges.push(new Edge(tet, i, v0, v1));
    }
  };
  _proto5.addProbe = function addProbe(vertexIndex) {
    var probe = this._probes[vertexIndex];
    var position = probe.position;
    var triangleIndex = 0;
    for (var i = 0; i < this._tetrahedrons.length; i++) {
      var tetrahedron = this._tetrahedrons[i];
      if (tetrahedron.isInCircumSphere(position)) {
        tetrahedron.invalid = true;
        this.addTriangle(triangleIndex, i, 0, tetrahedron.vertex1, tetrahedron.vertex3, tetrahedron.vertex2, tetrahedron.vertex0);
        this.addTriangle(triangleIndex + 1, i, 1, tetrahedron.vertex0, tetrahedron.vertex2, tetrahedron.vertex3, tetrahedron.vertex1);
        this.addTriangle(triangleIndex + 2, i, 2, tetrahedron.vertex0, tetrahedron.vertex3, tetrahedron.vertex1, tetrahedron.vertex2);
        this.addTriangle(triangleIndex + 3, i, 3, tetrahedron.vertex0, tetrahedron.vertex1, tetrahedron.vertex2, tetrahedron.vertex3);
        triangleIndex += 4;
      }
    }
    for (var _i = 0; _i < triangleIndex; _i++) {
      if (this._triangles[_i].invalid) {
        continue;
      }
      for (var k = _i + 1; k < triangleIndex; k++) {
        if (this._triangles[_i].isSame(this._triangles[k])) {
          this._triangles[_i].invalid = true;
          this._triangles[k].invalid = true;
          break;
        }
      }
    }
    this._tetrahedrons = this._tetrahedrons.filter(function (tetrahedron) {
      return !tetrahedron.invalid;
    });
    for (var _i2 = 0; _i2 < triangleIndex; _i2++) {
      var triangle = this._triangles[_i2];
      if (!triangle.invalid) {
        this._tetrahedrons.push(new Tetrahedron(this, triangle.vertex0, triangle.vertex1, triangle.vertex2, vertexIndex));
      }
    }
  };
  _proto5.reorder = function reorder(center) {
    this._tetrahedrons.sort(function (a, b) {
      return Vec3.squaredDistance(a.sphere.center, center) - Vec3.squaredDistance(b.sphere.center, center);
    });
  };
  _proto5.computeAdjacency = function computeAdjacency() {
    var normal = new Vec3(0.0, 0.0, 0.0);
    var edge1 = new Vec3(0.0, 0.0, 0.0);
    var edge2 = new Vec3(0.0, 0.0, 0.0);
    var edge3 = new Vec3(0.0, 0.0, 0.0);
    var tetrahedronCount = this._tetrahedrons.length;
    var triangleIndex = 0;
    for (var i = 0; i < this._tetrahedrons.length; i++) {
      var tetrahedron = this._tetrahedrons[i];
      this.addTriangle(triangleIndex, i, 0, tetrahedron.vertex1, tetrahedron.vertex3, tetrahedron.vertex2, tetrahedron.vertex0);
      this.addTriangle(triangleIndex + 1, i, 1, tetrahedron.vertex0, tetrahedron.vertex2, tetrahedron.vertex3, tetrahedron.vertex1);
      this.addTriangle(triangleIndex + 2, i, 2, tetrahedron.vertex0, tetrahedron.vertex3, tetrahedron.vertex1, tetrahedron.vertex2);
      this.addTriangle(triangleIndex + 3, i, 3, tetrahedron.vertex0, tetrahedron.vertex1, tetrahedron.vertex2, tetrahedron.vertex3);
      triangleIndex += 4;
    }
    for (var _i3 = 0; _i3 < triangleIndex; _i3++) {
      if (!this._triangles[_i3].isOuterFace) {
        continue;
      }
      for (var k = _i3 + 1; k < triangleIndex; k++) {
        if (this._triangles[_i3].isSame(this._triangles[k])) {
          this._tetrahedrons[this._triangles[_i3].tetrahedron].neighbours[this._triangles[_i3].index] = this._triangles[k].tetrahedron;
          this._tetrahedrons[this._triangles[k].tetrahedron].neighbours[this._triangles[k].index] = this._triangles[_i3].tetrahedron;
          this._triangles[_i3].isOuterFace = false;
          this._triangles[k].isOuterFace = false;
          break;
        }
      }
      if (this._triangles[_i3].isOuterFace) {
        var probe0 = this._probes[this._triangles[_i3].vertex0];
        var probe1 = this._probes[this._triangles[_i3].vertex1];
        var probe2 = this._probes[this._triangles[_i3].vertex2];
        var probe3 = this._probes[this._triangles[_i3].vertex3];
        Vec3.subtract(edge1, probe1.position, probe0.position);
        Vec3.subtract(edge2, probe2.position, probe0.position);
        Vec3.cross(normal, edge1, edge2);
        Vec3.subtract(edge3, probe3.position, probe0.position);
        var negative = Vec3.dot(normal, edge3);
        if (negative > 0.0) {
          Vec3.negate(normal, normal);
        }
        Vec3.add(probe0.normal, probe0.normal, normal);
        Vec3.add(probe1.normal, probe1.normal, normal);
        Vec3.add(probe2.normal, probe2.normal, normal);
        var v0 = this._triangles[_i3].vertex0;
        var v1 = negative > 0.0 ? this._triangles[_i3].vertex2 : this._triangles[_i3].vertex1;
        var v2 = negative > 0.0 ? this._triangles[_i3].vertex1 : this._triangles[_i3].vertex2;
        var _tetrahedron = new Tetrahedron(this, v0, v1, v2);
        _tetrahedron.neighbours[3] = this._triangles[_i3].tetrahedron;
        this._tetrahedrons[this._triangles[_i3].tetrahedron].neighbours[this._triangles[_i3].index] = this._tetrahedrons.length;
        this._tetrahedrons.push(_tetrahedron);
      }
    }
    var edgeIndex = 0;
    for (var _i4 = tetrahedronCount; _i4 < this._tetrahedrons.length; _i4++) {
      var _tetrahedron2 = this._tetrahedrons[_i4];
      this.addEdge(edgeIndex, _i4, 0, _tetrahedron2.vertex1, _tetrahedron2.vertex2);
      this.addEdge(edgeIndex + 1, _i4, 1, _tetrahedron2.vertex2, _tetrahedron2.vertex0);
      this.addEdge(edgeIndex + 2, _i4, 2, _tetrahedron2.vertex0, _tetrahedron2.vertex1);
      edgeIndex += 3;
    }
    for (var _i5 = 0; _i5 < edgeIndex; _i5++) {
      for (var _k = _i5 + 1; _k < edgeIndex; _k++) {
        if (this._edges[_i5].isSame(this._edges[_k])) {
          this._tetrahedrons[this._edges[_i5].tetrahedron].neighbours[this._edges[_i5].index] = this._edges[_k].tetrahedron;
          this._tetrahedrons[this._edges[_k].tetrahedron].neighbours[this._edges[_k].index] = this._edges[_i5].tetrahedron;
        }
      }
    }
    for (var _i6 = 0; _i6 < this._probes.length; _i6++) {
      this._probes[_i6].normal.normalize();
    }
  };
  _proto5.computeMatrices = function computeMatrices() {
    for (var i = 0; i < this._tetrahedrons.length; i++) {
      var tetrahedron = this._tetrahedrons[i];
      if (tetrahedron.vertex3 >= 0) {
        this.computeTetrahedronMatrix(tetrahedron);
      } else {
        this.computeOuterCellMatrix(tetrahedron);
      }
    }
  };
  _proto5.computeTetrahedronMatrix = function computeTetrahedronMatrix(tetrahedron) {
    var p0 = this._probes[tetrahedron.vertex0].position;
    var p1 = this._probes[tetrahedron.vertex1].position;
    var p2 = this._probes[tetrahedron.vertex2].position;
    var p3 = this._probes[tetrahedron.vertex3].position;
    tetrahedron.matrix.set(p0.x - p3.x, p1.x - p3.x, p2.x - p3.x, p0.y - p3.y, p1.y - p3.y, p2.y - p3.y, p0.z - p3.z, p1.z - p3.z, p2.z - p3.z);
    tetrahedron.matrix.invert();
    tetrahedron.matrix.transpose();
  };
  _proto5.computeOuterCellMatrix = function computeOuterCellMatrix(tetrahedron) {
    var v = [];
    var p = [];
    v[0] = this._probes[tetrahedron.vertex0].normal;
    v[1] = this._probes[tetrahedron.vertex1].normal;
    v[2] = this._probes[tetrahedron.vertex2].normal;
    p[0] = this._probes[tetrahedron.vertex0].position;
    p[1] = this._probes[tetrahedron.vertex1].position;
    p[2] = this._probes[tetrahedron.vertex2].position;
    Vec3.subtract(_a, p[0], p[2]);
    Vec3.subtract(_ap, v[0], v[2]);
    Vec3.subtract(_b, p[1], p[2]);
    Vec3.subtract(_bp, v[1], v[2]);
    _p2.set(p[2]);
    Vec3.negate(_cp, v[2]);
    var m = [];
    m[0] = _ap.y * _bp.z - _ap.z * _bp.y;
    m[3] = -_ap.x * _bp.z + _ap.z * _bp.x;
    m[6] = _ap.x * _bp.y - _ap.y * _bp.x;
    m[9] = _a.x * _bp.y * _cp.z - _a.y * _bp.x * _cp.z + _ap.x * _b.y * _cp.z - _ap.y * _b.x * _cp.z + _a.z * _bp.x * _cp.y - _a.z * _bp.y * _cp.x + _ap.z * _b.x * _cp.y - _ap.z * _b.y * _cp.x - _a.x * _bp.z * _cp.y + _a.y * _bp.z * _cp.x - _ap.x * _b.z * _cp.y + _ap.y * _b.z * _cp.x;
    m[9] -= _p2.x * m[0] + _p2.y * m[3] + _p2.z * m[6];
    m[1] = _ap.y * _b.z + _a.y * _bp.z - _ap.z * _b.y - _a.z * _bp.y;
    m[4] = -_a.x * _bp.z - _ap.x * _b.z + _a.z * _bp.x + _ap.z * _b.x;
    m[7] = _a.x * _bp.y - _a.y * _bp.x + _ap.x * _b.y - _ap.y * _b.x;
    m[10] = _a.x * _b.y * _cp.z - _a.y * _b.x * _cp.z - _a.x * _b.z * _cp.y + _a.y * _b.z * _cp.x + _a.z * _b.x * _cp.y - _a.z * _b.y * _cp.x;
    m[10] -= _p2.x * m[1] + _p2.y * m[4] + _p2.z * m[7];
    m[2] = -_a.z * _b.y + _a.y * _b.z;
    m[5] = -_a.x * _b.z + _a.z * _b.x;
    m[8] = _a.x * _b.y - _a.y * _b.x;
    m[11] = 0.0;
    m[11] -= _p2.x * m[2] + _p2.y * m[5] + _p2.z * m[8];
    var c = _ap.x * _bp.y * _cp.z - _ap.y * _bp.x * _cp.z + _ap.z * _bp.x * _cp.y - _ap.z * _bp.y * _cp.x + _ap.y * _bp.z * _cp.x - _ap.x * _bp.z * _cp.y;
    if (Math.abs(c) > EPSILON) {
      for (var k = 0; k < 12; k++) {
        m[k] /= c;
      }
    } else {
      tetrahedron.vertex3 = -2;
    }
    tetrahedron.matrix.set(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);
    tetrahedron.offset.set(m[9], m[10], m[11]);
  };
  return Delaunay;
}();

var SH_BASIS_COUNT = 9;
var LightProbeSampler = function () {
  function LightProbeSampler() {}
  LightProbeSampler.uniformSampleSphere = function uniformSampleSphere(u1, u2) {
    var z = 1.0 - 2.0 * u1;
    var r = Math.sqrt(Math.max(0.0, 1.0 - z * z));
    var phi = 2.0 * Math.PI * u2;
    var x = r * Math.cos(phi);
    var y = r * Math.sin(phi);
    return new Vec3(x, y, z);
  };
  LightProbeSampler.uniformSampleSphereAll = function uniformSampleSphereAll(sampleCount) {
    assertIsTrue(sampleCount > 0);
    var uCount1 = Math.floor(Math.sqrt(sampleCount));
    var uCount2 = uCount1;
    var samples = [];
    var uDelta1 = 1.0 / uCount1;
    var uDelta2 = 1.0 / uCount2;
    for (var i = 0; i < uCount1; i++) {
      var u1 = (i + 0.5) * uDelta1;
      for (var j = 0; j < uCount2; j++) {
        var u2 = (j + 0.5) * uDelta2;
        var sample = this.uniformSampleSphere(u1, u2);
        samples.push(sample);
      }
    }
    return samples;
  };
  LightProbeSampler.uniformSpherePdf = function uniformSpherePdf() {
    return 1.0 / (4.0 * Math.PI);
  };
  return LightProbeSampler;
}();
var SH = function () {
  function SH() {}
  SH.updateUBOData = function updateUBOData(data, offset, coefficients) {
    data[offset++] = coefficients[3].x * this.basisOverPI[3];
    data[offset++] = coefficients[1].x * this.basisOverPI[1];
    data[offset++] = coefficients[2].x * this.basisOverPI[2];
    data[offset++] = coefficients[0].x * this.basisOverPI[0] - coefficients[6].x * this.basisOverPI[6] / 3.0;
    data[offset++] = coefficients[3].y * this.basisOverPI[3];
    data[offset++] = coefficients[1].y * this.basisOverPI[1];
    data[offset++] = coefficients[2].y * this.basisOverPI[2];
    data[offset++] = coefficients[0].y * this.basisOverPI[0] - coefficients[6].y * this.basisOverPI[6] / 3.0;
    data[offset++] = coefficients[3].z * this.basisOverPI[3];
    data[offset++] = coefficients[1].z * this.basisOverPI[1];
    data[offset++] = coefficients[2].z * this.basisOverPI[2];
    data[offset++] = coefficients[0].z * this.basisOverPI[0] - coefficients[6].z * this.basisOverPI[6] / 3.0;
    data[offset++] = coefficients[4].x * this.basisOverPI[4];
    data[offset++] = coefficients[5].x * this.basisOverPI[5];
    data[offset++] = coefficients[6].x * this.basisOverPI[6];
    data[offset++] = coefficients[7].x * this.basisOverPI[7];
    data[offset++] = coefficients[4].y * this.basisOverPI[4];
    data[offset++] = coefficients[5].y * this.basisOverPI[5];
    data[offset++] = coefficients[6].y * this.basisOverPI[6];
    data[offset++] = coefficients[7].y * this.basisOverPI[7];
    data[offset++] = coefficients[4].z * this.basisOverPI[4];
    data[offset++] = coefficients[5].z * this.basisOverPI[5];
    data[offset++] = coefficients[6].z * this.basisOverPI[6];
    data[offset++] = coefficients[7].z * this.basisOverPI[7];
    data[offset++] = coefficients[8].x * this.basisOverPI[8];
    data[offset++] = coefficients[8].y * this.basisOverPI[8];
    data[offset++] = coefficients[8].z * this.basisOverPI[8];
    data[offset++] = 0.0;
  };
  SH.shaderEvaluate = function shaderEvaluate(normal, coefficients) {
    var linearConstR = new Vec4(coefficients[3].x * this.basisOverPI[3], coefficients[1].x * this.basisOverPI[1], coefficients[2].x * this.basisOverPI[2], coefficients[0].x * this.basisOverPI[0] - coefficients[6].x * this.basisOverPI[6] / 3.0);
    var linearConstG = new Vec4(coefficients[3].y * this.basisOverPI[3], coefficients[1].y * this.basisOverPI[1], coefficients[2].y * this.basisOverPI[2], coefficients[0].y * this.basisOverPI[0] - coefficients[6].y * this.basisOverPI[6] / 3.0);
    var linearConstB = new Vec4(coefficients[3].z * this.basisOverPI[3], coefficients[1].z * this.basisOverPI[1], coefficients[2].z * this.basisOverPI[2], coefficients[0].z * this.basisOverPI[0] - coefficients[6].z * this.basisOverPI[6] / 3.0);
    var quadraticR = new Vec4(coefficients[4].x * this.basisOverPI[4], coefficients[5].x * this.basisOverPI[5], coefficients[6].x * this.basisOverPI[6], coefficients[7].x * this.basisOverPI[7]);
    var quadraticG = new Vec4(coefficients[4].y * this.basisOverPI[4], coefficients[5].y * this.basisOverPI[5], coefficients[6].y * this.basisOverPI[6], coefficients[7].y * this.basisOverPI[7]);
    var quadraticB = new Vec4(coefficients[4].z * this.basisOverPI[4], coefficients[5].z * this.basisOverPI[5], coefficients[6].z * this.basisOverPI[6], coefficients[7].z * this.basisOverPI[7]);
    var quadraticA = new Vec3(coefficients[8].x * this.basisOverPI[8], coefficients[8].y * this.basisOverPI[8], coefficients[8].z * this.basisOverPI[8]);
    var result = new Vec3(0.0, 0.0, 0.0);
    var normal4 = new Vec4(normal.x, normal.y, normal.z, 1.0);
    result.x = Vec4.dot(linearConstR, normal4);
    result.y = Vec4.dot(linearConstG, normal4);
    result.z = Vec4.dot(linearConstB, normal4);
    var n14 = new Vec4(normal.x * normal.y, normal.y * normal.z, normal.z * normal.z, normal.z * normal.x);
    var n5 = normal.x * normal.x - normal.y * normal.y;
    result.x += Vec4.dot(quadraticR, n14);
    result.y += Vec4.dot(quadraticG, n14);
    result.z += Vec4.dot(quadraticB, n14);
    Vec3.scaleAndAdd(result, result, quadraticA, n5);
    return result;
  };
  SH.evaluate = function evaluate(sample, coefficients) {
    var result = new Vec3(0.0, 0.0, 0.0);
    var size = coefficients.length;
    for (var i = 0; i < size; i++) {
      var c = coefficients[i];
      Vec3.scaleAndAdd(result, result, c, this.evaluateBasis(i, sample));
    }
    return result;
  };
  SH.project = function project(samples, values) {
    assertIsTrue(samples.length > 0 && samples.length === values.length);
    var basisCount = this.getBasisCount();
    var sampleCount = samples.length;
    var scale = 1.0 / (LightProbeSampler.uniformSpherePdf() * sampleCount);
    var coefficients = [];
    for (var i = 0; i < basisCount; i++) {
      var coefficient = new Vec3(0.0, 0.0, 0.0);
      for (var k = 0; k < sampleCount; k++) {
        Vec3.scaleAndAdd(coefficient, coefficient, values[k], this.evaluateBasis(i, samples[k]));
      }
      Vec3.multiplyScalar(coefficient, coefficient, scale);
      coefficients.push(coefficient);
    }
    return coefficients;
  };
  SH.convolveCosine = function convolveCosine(radianceCoefficients) {
    var cosTheta = [0.8862268925, 1.0233267546, 0.4954159260];
    var irradianceCoefficients = [];
    for (var l = 0; l <= this.LMAX; l++) {
      for (var m = -l; m <= l; m++) {
        var i = this.toIndex(l, m);
        var coefficient = new Vec3(0.0, 0.0, 0.0);
        Vec3.multiplyScalar(coefficient, radianceCoefficients[i], this.lambda(l) * cosTheta[l]);
        irradianceCoefficients.push(coefficient);
      }
    }
    return irradianceCoefficients;
  };
  SH.getBasisCount = function getBasisCount() {
    return SH_BASIS_COUNT;
  };
  SH.evaluateBasis = function evaluateBasis(index, sample) {
    assertIsTrue(index < this.getBasisCount());
    var func = this.basisFunctions[index];
    return func(sample);
  };
  SH.reduceRinging = function reduceRinging(coefficients, lambda) {
    if (lambda === 0.0) {
      return;
    }
    for (var l = 0; l <= this.LMAX; ++l) {
      var scale = 1.0 / (1.0 + lambda * l * l * (l + 1) * (l + 1));
      for (var m = -l; m <= l; ++m) {
        var i = this.toIndex(l, m);
        Vec3.multiplyScalar(coefficients[i], coefficients[i], scale);
      }
    }
  };
  SH.lambda = function lambda(l) {
    return Math.sqrt(4.0 * Math.PI / (2.0 * l + 1.0));
  };
  SH.toIndex = function toIndex(l, m) {
    return l * l + l + m;
  };
  return SH;
}();
SH.LMAX = 2;
SH.basisFunctions = [function (v) {
  return 0.282095;
}, function (v) {
  return 0.488603 * v.y;
}, function (v) {
  return 0.488603 * v.z;
}, function (v) {
  return 0.488603 * v.x;
}, function (v) {
  return 1.09255 * v.y * v.x;
}, function (v) {
  return 1.09255 * v.y * v.z;
}, function (v) {
  return 0.946175 * (v.z * v.z - 1.0 / 3.0);
}, function (v) {
  return 1.09255 * v.z * v.x;
}, function (v) {
  return 0.546274 * (v.x * v.x - v.y * v.y);
}];
SH.basisOverPI = [0.0897936, 0.155527, 0.155527, 0.155527, 0.347769, 0.347769, 0.301177, 0.347769, 0.173884];
cclegacy.internal.SH = SH;

var PolynomialSolver = function () {
  function PolynomialSolver() {}
  PolynomialSolver.getQuadraticUniqueRoot = function getQuadraticUniqueRoot(b, c, d) {
    if (b !== 0.0) {
      return -c / (2.0 * b);
    }
    if (c !== 0.0) {
      return -d / c;
    }
    return 0.0;
  };
  PolynomialSolver.getCubicUniqueRoot = function getCubicUniqueRoot(b, c, d) {
    var roots = [];
    var offset = -b / 3.0;
    var p = c / 3.0 - b * b / 9.0;
    var q = d / 2.0 + b * b * b / 27.0 - b * c / 6.0;
    var delta = p * p * p + q * q;
    if (delta > 0.0) {
      var sqrtDelta = Math.sqrt(delta);
      roots.push(Math.cbrt(-q + sqrtDelta) + Math.cbrt(-q - sqrtDelta));
    } else if (delta < 0.0) {
      var angle = Math.acos(-q * Math.sqrt(-p) / (p * p)) / 3.0;
      roots.push(2.0 * Math.sqrt(-p) * Math.cos(angle));
      roots.push(2.0 * Math.sqrt(-p) * Math.cos(angle + 2.0 * Math.PI / 3.0));
      roots.push(2.0 * Math.sqrt(-p) * Math.cos(angle + 4.0 * Math.PI / 3.0));
    } else if (q === 0.0) {
      roots.push(0.0);
    } else {
      var root = Math.cbrt(q);
      roots.push(root);
      roots.push(-2 * root);
    }
    for (var i = 0; i < roots.length; i++) {
      if (roots[i] + offset >= 0.0) {
        return roots[i] + offset;
      }
    }
    return 0.0;
  };
  return PolynomialSolver;
}();

var _dec$1, _dec2$1, _dec3$1, _class$1, _class2$1, _initializer$1, _initializer2$1;
var _v1 = new Vec3(0.0, 0.0, 0.0);
var _v2 = new Vec3(0.0, 0.0, 0.0);
var _normal = new Vec3(0.0, 0.0, 0.0);
var _edgeP0 = new Vec3(0.0, 0.0, 0.0);
var _edgeP1 = new Vec3(0.0, 0.0, 0.0);
var _edgeP2 = new Vec3(0.0, 0.0, 0.0);
var _crossP12 = new Vec3(0.0, 0.0, 0.0);
var _crossP20 = new Vec3(0.0, 0.0, 0.0);
var _normal2 = new Vec3(0.0, 0.0, 0.0);
var _edge1 = new Vec3(0.0, 0.0, 0.0);
var _edge2 = new Vec3(0.0, 0.0, 0.0);
var _v = new Vec3(0.0, 0.0, 0.0);
var _vp0 = new Vec3(0.0, 0.0, 0.0);
var _vp1 = new Vec3(0.0, 0.0, 0.0);
var _vp2 = new Vec3(0.0, 0.0, 0.0);
var LightProbesData = (_dec$1 = ccclass$1('cc.LightProbesData'), _dec2$1 = type([Vertex]), _dec3$1 = type([Tetrahedron]), _dec$1(_class$1 = (_class2$1 = function () {
  function LightProbesData() {
    this._probes = _initializer$1 && _initializer$1();
    this._tetrahedrons = _initializer2$1 && _initializer2$1();
  }
  var _proto = LightProbesData.prototype;
  _proto.empty = function empty() {
    return this._probes.length === 0 || this._tetrahedrons.length === 0;
  };
  _proto.reset = function reset() {
    this._probes.length = 0;
    this._tetrahedrons.length = 0;
  };
  _proto.updateProbes = function updateProbes(points) {
    this._probes.length = points.length;
    var pointCount = this._probes.length;
    for (var i = 0; i < pointCount; i++) {
      var probe = this._probes[i];
      if (!probe) {
        probe = new Vertex(points[i]);
        for (var j = 0; j < SH.getBasisCount(); j++) {
          probe.coefficients[j] = Vec3.ZERO;
        }
        this._probes[i] = probe;
      } else {
        probe.position.set(points[i]);
      }
    }
  };
  _proto.updateTetrahedrons = function updateTetrahedrons() {
    var delaunay = new Delaunay(this._probes);
    this._tetrahedrons = delaunay.build();
  };
  _proto.getInterpolationSHCoefficients = function getInterpolationSHCoefficients(tetIndex, weights, coefficients) {
    if (!this.hasCoefficients()) {
      return false;
    }
    var length = SH.getBasisCount();
    var tetrahedron = this._tetrahedrons[tetIndex];
    var c0 = this._probes[tetrahedron.vertex0].coefficients;
    var c1 = this._probes[tetrahedron.vertex1].coefficients;
    var c2 = this._probes[tetrahedron.vertex2].coefficients;
    if (tetrahedron.vertex3 >= 0) {
      var c3 = this._probes[tetrahedron.vertex3].coefficients;
      for (var i = 0; i < length; i++) {
        coefficients[i] = new Vec3(0.0, 0.0, 0.0);
        Vec3.scaleAndAdd(coefficients[i], coefficients[i], c0[i], weights.x);
        Vec3.scaleAndAdd(coefficients[i], coefficients[i], c1[i], weights.y);
        Vec3.scaleAndAdd(coefficients[i], coefficients[i], c2[i], weights.z);
        Vec3.scaleAndAdd(coefficients[i], coefficients[i], c3[i], weights.w);
      }
    } else {
      for (var _i = 0; _i < length; _i++) {
        coefficients[_i] = new Vec3(0.0, 0.0, 0.0);
        Vec3.scaleAndAdd(coefficients[_i], coefficients[_i], c0[_i], weights.x);
        Vec3.scaleAndAdd(coefficients[_i], coefficients[_i], c1[_i], weights.y);
        Vec3.scaleAndAdd(coefficients[_i], coefficients[_i], c2[_i], weights.z);
      }
    }
    return true;
  };
  _proto.getInterpolationWeights = function getInterpolationWeights(position, tetIndex, weights) {
    var tetrahedronCount = this._tetrahedrons.length;
    if (tetIndex < 0 || tetIndex >= tetrahedronCount) {
      tetIndex = 0;
    }
    var lastIndex = -1;
    var nextIndex = -1;
    for (var i = 0; i < tetrahedronCount; i++) {
      var tetrahedron = this._tetrahedrons[tetIndex];
      this.getBarycentricCoord(position, tetrahedron, weights);
      if (weights.x >= 0.0 && weights.y >= 0.0 && weights.z >= 0.0 && weights.w >= 0.0) {
        break;
      }
      if (weights.x < weights.y && weights.x < weights.z && weights.x < weights.w) {
        nextIndex = tetrahedron.neighbours[0];
      } else if (weights.y < weights.z && weights.y < weights.w) {
        nextIndex = tetrahedron.neighbours[1];
      } else if (weights.z < weights.w) {
        nextIndex = tetrahedron.neighbours[2];
      } else {
        nextIndex = tetrahedron.neighbours[3];
      }
      if (lastIndex === nextIndex) {
        break;
      }
      lastIndex = tetIndex;
      tetIndex = nextIndex;
    }
    return tetIndex;
  };
  _proto.hasCoefficients = function hasCoefficients() {
    return !this.empty() && this._probes[0].coefficients.length !== 0;
  };
  LightProbesData.getTriangleBarycentricCoord = function getTriangleBarycentricCoord(p0, p1, p2, position) {
    Vec3.subtract(_v1, p1, p0);
    Vec3.subtract(_v2, p2, p0);
    Vec3.cross(_normal, _v1, _v2);
    if (_normal.lengthSqr() <= EPSILON) {
      return new Vec3(0.0, 0.0, 0.0);
    }
    var n = _normal.clone();
    n.normalize();
    var area012Inv = 1.0 / n.dot(_normal);
    Vec3.subtract(_edgeP0, p0, position);
    Vec3.subtract(_edgeP1, p1, position);
    Vec3.subtract(_edgeP2, p2, position);
    Vec3.cross(_crossP12, _edgeP1, _edgeP2);
    var areaP12 = n.dot(_crossP12);
    var alpha = areaP12 * area012Inv;
    Vec3.cross(_crossP20, _edgeP2, _edgeP0);
    var areaP20 = n.dot(_crossP20);
    var beta = areaP20 * area012Inv;
    return new Vec3(alpha, beta, 1.0 - alpha - beta);
  };
  _proto.getBarycentricCoord = function getBarycentricCoord(position, tetrahedron, weights) {
    if (tetrahedron.vertex3 >= 0) {
      this.getTetrahedronBarycentricCoord(position, tetrahedron, weights);
    } else {
      this.getOuterCellBarycentricCoord(position, tetrahedron, weights);
    }
  };
  _proto.getTetrahedronBarycentricCoord = function getTetrahedronBarycentricCoord(position, tetrahedron, weights) {
    var result = new Vec3(0.0, 0.0, 0.0);
    Vec3.subtract(result, position, this._probes[tetrahedron.vertex3].position);
    Vec3.transformMat3(result, result, tetrahedron.matrix);
    weights.set(result.x, result.y, result.z, 1.0 - result.x - result.y - result.z);
  };
  _proto.getOuterCellBarycentricCoord = function getOuterCellBarycentricCoord(position, tetrahedron, weights) {
    var p0 = this._probes[tetrahedron.vertex0].position;
    var p1 = this._probes[tetrahedron.vertex1].position;
    var p2 = this._probes[tetrahedron.vertex2].position;
    Vec3.subtract(_edge1, p1, p0);
    Vec3.subtract(_edge2, p2, p0);
    Vec3.cross(_normal2, _edge1, _edge2);
    Vec3.subtract(_v, position, p0);
    var t = Vec3.dot(_v, _normal2);
    if (t < 0.0) {
      weights.set(0.0, 0.0, 0.0, -1);
      return;
    }
    var coefficients = new Vec3(0.0, 0.0, 0.0);
    Vec3.transformMat3(coefficients, position, tetrahedron.matrix);
    Vec3.add(coefficients, coefficients, tetrahedron.offset);
    if (tetrahedron.vertex3 === -1) {
      t = PolynomialSolver.getCubicUniqueRoot(coefficients.x, coefficients.y, coefficients.z);
    } else {
      t = PolynomialSolver.getQuadraticUniqueRoot(coefficients.x, coefficients.y, coefficients.z);
    }
    Vec3.scaleAndAdd(_vp0, p0, this._probes[tetrahedron.vertex0].normal, t);
    Vec3.scaleAndAdd(_vp1, p1, this._probes[tetrahedron.vertex1].normal, t);
    Vec3.scaleAndAdd(_vp2, p2, this._probes[tetrahedron.vertex2].normal, t);
    var result = LightProbesData.getTriangleBarycentricCoord(_vp0, _vp1, _vp2, position);
    weights.set(result.x, result.y, result.z, 0.0);
  };
  return _createClass(LightProbesData, [{
    key: "probes",
    get: function get() {
      return this._probes;
    }
  }, {
    key: "tetrahedrons",
    get: function get() {
      return this._tetrahedrons;
    }
  }]);
}(), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_probes", [serializable$1, _dec2$1], function () {
  return [];
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_tetrahedrons", [serializable$1, _dec3$1], function () {
  return [];
}), _class2$1)) || _class$1);
cclegacy.internal.LightProbesData = LightProbesData;
var LightProbes = function () {
  function LightProbes() {
    this._giScale = 1.0;
    this._giSamples = 1024;
    this._bounces = 2;
    this._reduceRinging = 0.0;
    this._showProbe = true;
    this._showWireframe = true;
    this._showConvex = false;
    this._data = null;
    this._lightProbeSphereVolume = 1.0;
  }
  var _proto2 = LightProbes.prototype;
  _proto2.initialize = function initialize(info) {
    this._giScale = info.giScale;
    this._giSamples = info.giSamples;
    this._bounces = info.bounces;
    this._reduceRinging = info.reduceRinging;
    this._showProbe = info.showProbe;
    this._showWireframe = info.showWireframe;
    this._showConvex = info.showConvex;
    this._data = info.data;
    this._lightProbeSphereVolume = info.lightProbeSphereVolume;
  };
  _proto2.empty = function empty() {
    if (!this._data) {
      return true;
    }
    return this._data.empty();
  };
  return _createClass(LightProbes, [{
    key: "giScale",
    get: function get() {
      return this._giScale;
    },
    set: function set(val) {
      this._giScale = val;
    }
  }, {
    key: "giSamples",
    get: function get() {
      return this._giSamples;
    },
    set: function set(val) {
      this._giSamples = val;
    }
  }, {
    key: "bounces",
    get: function get() {
      return this._bounces;
    },
    set: function set(val) {
      this._bounces = val;
    }
  }, {
    key: "reduceRinging",
    get: function get() {
      return this._reduceRinging;
    },
    set: function set(val) {
      this._reduceRinging = val;
    }
  }, {
    key: "showProbe",
    get: function get() {
      return this._showProbe;
    },
    set: function set(val) {
      this._showProbe = val;
    }
  }, {
    key: "showWireframe",
    get: function get() {
      return this._showWireframe;
    },
    set: function set(val) {
      this._showWireframe = val;
    }
  }, {
    key: "showConvex",
    get: function get() {
      return this._showConvex;
    },
    set: function set(val) {
      this._showConvex = val;
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    },
    set: function set(val) {
      this._data = val;
    }
  }, {
    key: "lightProbeSphereVolume",
    get: function get() {
      return this._lightProbeSphereVolume;
    },
    set: function set(val) {
      this._lightProbeSphereVolume = val;
    }
  }]);
}();
cclegacy.internal.LightProbes = LightProbes;

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7;
var LightProbeGroup = (_dec = ccclass$1('cc.LightProbeGroup'), _dec2 = type([Vec3]), _dec3 = type(PlaceMethod), _dec4 = type(CCInteger), _dec5 = type(CCInteger), _dec6 = type(CCInteger), _dec(_class = disallowMultiple(_class = (_class2 = function (_Component) {
  function LightProbeGroup() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this._probes = _initializer && _initializer();
    _this._method = _initializer2 && _initializer2();
    _this._minPos = _initializer3 && _initializer3();
    _this._maxPos = _initializer4 && _initializer4();
    _this._nProbesX = _initializer5 && _initializer5();
    _this._nProbesY = _initializer6 && _initializer6();
    _this._nProbesZ = _initializer7 && _initializer7();
    return _this;
  }
  _inheritsLoose(LightProbeGroup, _Component);
  var _proto = LightProbeGroup.prototype;
  _proto.onLoad = function onLoad() {
    {
      return;
    }
  };
  _proto.onEnable = function onEnable() {
    {
      return;
    }
  };
  _proto.onDisable = function onDisable() {
    {
      return;
    }
  };
  _proto.generateLightProbes = function generateLightProbes() {
    if (!this.node) {
      return;
    }
    this._probes = AutoPlacement.generate({
      method: this._method,
      nProbesX: this._nProbesX,
      nProbesY: this._nProbesY,
      nProbesZ: this._nProbesZ,
      minPos: this._minPos,
      maxPos: this._maxPos
    });
    this.onProbeChanged();
  };
  _proto.onProbeChanged = function onProbeChanged(updateTet, emitEvent) {
    if (updateTet === void 0) {
      updateTet = true;
    }
    if (emitEvent === void 0) {
      emitEvent = true;
    }
    var lightProbeInfo = this.node.scene.globals.lightProbeInfo;
    lightProbeInfo.syncData(this.node, this.probes);
    lightProbeInfo.update(updateTet);
    if (emitEvent) {
      this.node.emit(NodeEventType.LIGHT_PROBE_CHANGED);
    }
  };
  return _createClass(LightProbeGroup, [{
    key: "probes",
    get: function get() {
      return this._probes;
    },
    set: function set(val) {
      this._probes = val;
    }
  }, {
    key: "method",
    get: function get() {
      return this._method;
    }
  }, {
    key: "minPos",
    get: function get() {
      return this._minPos;
    },
    set: function set(val) {
      this._minPos = val;
    }
  }, {
    key: "maxPos",
    get: function get() {
      return this._maxPos;
    },
    set: function set(val) {
      this._maxPos = val;
    }
  }, {
    key: "nProbesX",
    get: function get() {
      return this._nProbesX;
    },
    set: function set(val) {
      this._nProbesX = val;
    }
  }, {
    key: "nProbesY",
    get: function get() {
      return this._nProbesY;
    },
    set: function set(val) {
      this._nProbesY = val;
    }
  }, {
    key: "nProbesZ",
    get: function get() {
      return this._nProbesZ;
    },
    set: function set(val) {
      this._nProbesZ = val;
    }
  }]);
}(Component), _initializer = applyDecoratedInitializer(_class2.prototype, "_probes", [serializable$1], function () {
  return [];
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_method", [serializable$1], function () {
  return PlaceMethod.UNIFORM;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_minPos", [serializable$1], function () {
  return new Vec3(-5, -5, -5);
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_maxPos", [serializable$1], function () {
  return new Vec3(5, 5, 5);
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_nProbesX", [serializable$1], function () {
  return 3;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_nProbesY", [serializable$1], function () {
  return 3;
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "_nProbesZ", [serializable$1], function () {
  return 3;
}), _applyDecoratedDescriptor(_class2.prototype, "probes", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "probes"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "method", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "method"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "nProbesX", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "nProbesX"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "nProbesY", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "nProbesY"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "nProbesZ", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "nProbesZ"), _class2.prototype), _class2)) || _class) || _class);

export { AutoPlacement, CircumSphere, Delaunay, LightProbeGroup, LightProbeSampler, LightProbes, LightProbesData, PlaceMethod, SH, Tetrahedron, Vertex };
//# sourceMappingURL=light-probe.js.map
