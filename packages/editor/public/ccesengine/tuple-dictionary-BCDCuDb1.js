var TupleDictionary = function () {
  function TupleDictionary() {
    this.data = void 0;
    this.data = {
      keys: []
    };
  }
  var _proto = TupleDictionary.prototype;
  _proto.get = function get(i, j) {
    if (i > j) {
      var temp = j;
      j = i;
      i = temp;
    }
    return this.data[i + "-" + j];
  };
  _proto.set = function set(i, j, value) {
    if (i > j) {
      var temp = j;
      j = i;
      i = temp;
    }
    var key = i + "-" + j;
    if (value == null) {
      var idx = this.data.keys.indexOf(key);
      if (idx !== -1) {
        this.data.keys.splice(idx, 1);
        delete this.data[key];
        return value;
      }
    }
    if (!this.get(i, j)) {
      this.data.keys.push(key);
    }
    this.data[key] = value;
    return this.data[key];
  };
  _proto.reset = function reset() {
    this.data = {
      keys: []
    };
  };
  _proto.getLength = function getLength() {
    return this.data.keys.length;
  };
  _proto.getKeyByIndex = function getKeyByIndex(index) {
    return this.data.keys[index];
  };
  _proto.getDataByKey = function getDataByKey(Key) {
    return this.data[Key];
  };
  return TupleDictionary;
}();

export { TupleDictionary as T };
//# sourceMappingURL=tuple-dictionary-BCDCuDb1.js.map
