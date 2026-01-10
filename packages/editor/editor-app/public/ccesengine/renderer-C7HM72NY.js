import { _ as _inheritsLoose, k as errorID, w as warnID, a as _createClass, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import { c as ccclass$1, t as type$1, d as disallowMultiple$1, b as applyDecoratedInitializer } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { M as MaterialInstance, b as Material } from './scene-vWcxM1_c.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';

var _dec, _dec2, _dec3, _class, _class2, _initializer;
var _matInsInfo = {
  parent: null,
  owner: null,
  subModelIdx: 0
};
var ccclass = ccclass$1,
  disallowMultiple = disallowMultiple$1,
  type = type$1;
var Renderer = (_dec = ccclass('cc.Renderer'), _dec2 = type(Material), _dec3 = type([Material]), _dec(_class = disallowMultiple(_class = (_class2 = function (_Component) {
  function Renderer() {
    var _this;
    _this = _Component.call(this) || this;
    _this._materials = _initializer && _initializer();
    _this._materialInstances = [];
    return _this;
  }
  _inheritsLoose(Renderer, _Component);
  var _proto = Renderer.prototype;
  _proto.getMaterial = function getMaterial(idx) {
    return this.getSharedMaterial(idx);
  };
  _proto.setMaterial = function setMaterial(material, index) {
    this.setSharedMaterial(material, index);
  };
  _proto.getSharedMaterial = function getSharedMaterial(idx) {
    if (idx < 0 || idx >= this._materials.length) {
      return null;
    }
    return this._materials[idx];
  };
  _proto.setSharedMaterial = function setSharedMaterial(material, index, forceUpdate) {
    if (forceUpdate === void 0) {
      forceUpdate = false;
    }
    if (material && material instanceof MaterialInstance) {
      errorID(12012);
    }
    if (!forceUpdate && this._materials[index] === material) return;
    this._materials[index] = material;
    var inst = this._materialInstances[index];
    if (inst) {
      inst.destroy();
      this._materialInstances[index] = null;
    }
    this._onMaterialModified(index, this._materials[index]);
  };
  _proto.getMaterialInstance = function getMaterialInstance(idx) {
    var mat = this._materials[idx];
    if (!mat) {
      return null;
    }
    if (!this._materialInstances[idx]) {
      _matInsInfo.parent = this._materials[idx];
      _matInsInfo.owner = this;
      _matInsInfo.subModelIdx = idx;
      var instantiated = new MaterialInstance(_matInsInfo);
      _matInsInfo.parent = null;
      _matInsInfo.owner = null;
      _matInsInfo.subModelIdx = 0;
      this.setMaterialInstance(instantiated, idx);
    }
    return this._materialInstances[idx];
  };
  _proto.setMaterialInstance = function setMaterialInstance(matInst, index) {
    if (typeof matInst === 'number') {
      warnID(12007);
      var temp = matInst;
      matInst = index;
      index = temp;
    }
    var curInst = this._materialInstances[index];
    if (matInst && matInst.parent) {
      if (matInst !== curInst) {
        this._materialInstances[index] = matInst;
        this._onMaterialModified(index, matInst);
      }
      return;
    }
    if (matInst !== this._materials[index] || curInst) {
      this.setSharedMaterial(matInst, index);
    }
  };
  _proto.getRenderMaterial = function getRenderMaterial(index) {
    return this._materialInstances[index] || this._materials[index];
  };
  _proto._onMaterialModified = function _onMaterialModified(index, material) {};
  _proto._onRebuildPSO = function _onRebuildPSO(index, material) {};
  _proto._clearMaterials = function _clearMaterials() {};
  return _createClass(Renderer, [{
    key: "sharedMaterial",
    get: function get() {
      return this.getSharedMaterial(0);
    }
  }, {
    key: "sharedMaterials",
    get: function get() {
      return this._materials;
    },
    set: function set(val) {
      for (var i = 0; i < val.length; i++) {
        if (val[i] !== this._materials[i]) {
          this.setSharedMaterial(val[i], i);
        }
      }
      if (val.length < this._materials.length) {
        for (var _i = val.length; _i < this._materials.length; _i++) {
          this.setSharedMaterial(null, _i);
        }
        this._materials.splice(val.length);
      }
    }
  }, {
    key: "material",
    get: function get() {
      return this.getMaterialInstance(0);
    },
    set: function set(val) {
      if (this._materials.length === 1 && !this._materialInstances[0] && this._materials[0] === val) {
        return;
      }
      this.setMaterialInstance(val, 0);
    }
  }, {
    key: "materials",
    get: function get() {
      for (var i = 0; i < this._materials.length; i++) {
        this._materialInstances[i] = this.getMaterialInstance(i);
      }
      return this._materialInstances;
    },
    set: function set(val) {
      var newLength = val.length;
      var oldLength = this._materials.length;
      for (var i = newLength; i < oldLength; i++) {
        this.setMaterialInstance(null, i);
      }
      this._materials.length = newLength;
      this._materialInstances.length = newLength;
      for (var _i2 = 0; _i2 < newLength; _i2++) {
        if (this._materialInstances[_i2] != val[_i2]) {
          this.setMaterialInstance(val[_i2], _i2);
        }
      }
    }
  }]);
}(Component), _applyDecoratedDescriptor(_class2.prototype, "sharedMaterials", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "sharedMaterials"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_materials", [_dec3], function () {
  return [];
}), _class2)) || _class) || _class);

export { Renderer as R };
//# sourceMappingURL=renderer-C7HM72NY.js.map
