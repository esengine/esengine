var ArrayCollisionMatrix = function () {
  function ArrayCollisionMatrix() {
    this.matrix = [];
  }
  var _proto = ArrayCollisionMatrix.prototype;
  _proto.get = function get(i, j) {
    if (j > i) {
      var temp = j;
      j = i;
      i = temp;
    }
    return this.matrix[(i * (i + 1) >> 1) + j - 1];
  };
  _proto.set = function set(i, j, value) {
    if (j > i) {
      var temp = j;
      j = i;
      i = temp;
    }
    this.matrix[(i * (i + 1) >> 1) + j - 1] = value ? 1 : 0;
  };
  _proto.reset = function reset() {
    this.matrix.length = 0;
  };
  _proto.setNumObjects = function setNumObjects(n) {
    this.matrix.length = n * (n - 1) >> 1;
  };
  return ArrayCollisionMatrix;
}();

export { ArrayCollisionMatrix as A };
//# sourceMappingURL=array-collision-matrix-H0EInS5d.js.map
