import { _ as _inheritsLoose, a as _createClass, j as CCString } from './gc-object-CShF5lzx.js';
import { c as ccclass, t as type, M as Mat4, b as applyDecoratedInitializer, s as serializable } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { A as Asset } from './node-event-Ccvtv8bJ.js';
import { m as murmurhash2_32_gc } from './buffer-barrier-BlQXg9Aa.js';

var _dec, _dec2, _dec3, _class, _class2, _initializer, _initializer2, _initializer3;
var Skeleton = (_dec = ccclass('cc.Skeleton'), _dec2 = type([CCString]), _dec3 = type([Mat4]), _dec(_class = (_class2 = function (_Asset) {
  function Skeleton(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this._joints = _initializer && _initializer();
    _this._bindposes = _initializer2 && _initializer2();
    _this._hash = _initializer3 && _initializer3();
    _this._invBindposes = null;
    return _this;
  }
  _inheritsLoose(Skeleton, _Asset);
  var _proto = Skeleton.prototype;
  _proto.destroy = function destroy() {
    var _cclegacy$director$ro, _cclegacy$director$ro2;
    (_cclegacy$director$ro = cclegacy.director.root) == null ? void 0 : (_cclegacy$director$ro2 = _cclegacy$director$ro.dataPoolManager) == null ? void 0 : _cclegacy$director$ro2.releaseSkeleton(this);
    return _Asset.prototype.destroy.call(this);
  };
  _proto.validate = function validate() {
    return this.joints.length > 0 && this.bindposes.length > 0;
  };
  return _createClass(Skeleton, [{
    key: "joints",
    get: function get() {
      return this._joints;
    },
    set: function set(value) {
      this._joints = value;
    }
  }, {
    key: "bindposes",
    get: function get() {
      return this._bindposes;
    },
    set: function set(value) {
      this._bindposes = value;
    }
  }, {
    key: "inverseBindposes",
    get: function get() {
      if (!this._invBindposes) {
        this._invBindposes = [];
        for (var i = 0; i < this._bindposes.length; i++) {
          var inv = new Mat4();
          Mat4.invert(inv, this._bindposes[i]);
          this._invBindposes.push(inv);
        }
      }
      return this._invBindposes;
    }
  }, {
    key: "hash",
    get: function get() {
      if (!this._hash) {
        var str = '';
        for (var i = 0; i < this._bindposes.length; i++) {
          var ibm = this._bindposes[i];
          str += ibm.m00.toPrecision(2) + " " + ibm.m01.toPrecision(2) + " " + ibm.m02.toPrecision(2) + " " + ibm.m03.toPrecision(2) + " " + ibm.m04.toPrecision(2) + " " + ibm.m05.toPrecision(2) + " " + ibm.m06.toPrecision(2) + " " + ibm.m07.toPrecision(2) + " " + ibm.m08.toPrecision(2) + " " + ibm.m09.toPrecision(2) + " " + ibm.m10.toPrecision(2) + " " + ibm.m11.toPrecision(2) + " " + ibm.m12.toPrecision(2) + " " + ibm.m13.toPrecision(2) + " " + ibm.m14.toPrecision(2) + " " + ibm.m15.toPrecision(2) + "\n";
        }
        this._hash = murmurhash2_32_gc(str, 666);
      }
      return this._hash;
    }
  }]);
}(Asset), _initializer = applyDecoratedInitializer(_class2.prototype, "_joints", [_dec2], function () {
  return [];
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_bindposes", [_dec3], function () {
  return [];
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_hash", [serializable], function () {
  return 0;
}), _class2)) || _class);
cclegacy.Skeleton = Skeleton;

export { Skeleton as S };
//# sourceMappingURL=skeleton-CBhmWmEt.js.map
