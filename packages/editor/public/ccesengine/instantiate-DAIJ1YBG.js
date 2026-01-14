import './_virtual_internal_constants-DWlew7Dp.js';
import { e as editorExtrasTag } from './index-uXI1_UMk.js';
import { N as Node } from './scene-vWcxM1_c.js';
import { C as Component } from './node-event-Ccvtv8bJ.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { d as CCObjectFlags, g as getError, e as warn, i as isCCObject, f as isDomNode, v as value, h as isCCClassOrFastDefined, V as ValueType } from './gc-object-CShF5lzx.js';

var Destroyed = CCObjectFlags.Destroyed;
var PersistentMask = CCObjectFlags.PersistentMask;
var objsToClearTmpVar = [];
function hasImplementedInstantiate(original) {
  return typeof original._instantiate === 'function';
}
function isMountedChild(node) {
  var editorExtras = node[editorExtrasTag];
  if (typeof editorExtras === 'object') {
    return !!editorExtras.mountedRoot;
  }
  return false;
}
function instantiate(original, internalForce) {
  if (!internalForce) {
    {
      if (typeof original !== 'object' || Array.isArray(original)) {
        throw new TypeError(getError(6900));
      }
      if (!original) {
        throw new TypeError(getError(6901));
      }
      if (!cclegacy.isValid(original)) {
        throw new TypeError(getError(6901));
      }
      if (original instanceof Component) {
        warn('Should not instantiate a single cc.Component directly, you must instantiate the entire node.');
      }
    }
  }
  var clone;
  if (isCCObject(original)) {
    if (hasImplementedInstantiate(original)) {
      cclegacy.game._isCloning = true;
      clone = original._instantiate(null, true);
      cclegacy.game._isCloning = false;
      return clone;
    } else if (original instanceof cclegacy.Asset) {
      throw new TypeError(getError(6903));
    }
  }
  cclegacy.game._isCloning = true;
  clone = doInstantiate(original);
  cclegacy.game._isCloning = false;
  return clone;
}
function doInstantiate(obj, parent) {
  {
    if (Array.isArray(obj)) {
      throw new TypeError(getError(6904));
    }
    if (isDomNode(obj)) {
      throw new TypeError(getError(6905));
    }
  }
  var clone;
  if (obj._iN$t) {
    clone = obj._iN$t;
  } else if (obj.constructor) {
    var Klass = obj.constructor;
    clone = new Klass();
  } else {
    clone = Object.create(null);
  }
  enumerateObject(obj, clone, parent);
  for (var i = 0, len = objsToClearTmpVar.length; i < len; ++i) {
    objsToClearTmpVar[i]._iN$t = null;
  }
  objsToClearTmpVar.length = 0;
  return clone;
}
function enumerateCCClass(klass, obj, clone, parent) {
  var props = klass.__values__;
  for (var p = 0; p < props.length; p++) {
    var key = props[p];
    var value = obj[key];
    if (typeof value === 'object' && value) {
      var initValue = clone[key];
      if (initValue instanceof ValueType && initValue.constructor === value.constructor) {
        initValue.set(value);
      } else {
        clone[key] = value._iN$t || instantiateObj(value, parent);
      }
    } else {
      clone[key] = value;
    }
  }
}
function enumerateObject(obj, clone, parent) {
  value(obj, '_iN$t', clone, true);
  objsToClearTmpVar.push(obj);
  var klass = obj.constructor;
  if (isCCClassOrFastDefined(klass)) {
    enumerateCCClass(klass, obj, clone, parent);
  } else {
    for (var key in obj) {
      if (!obj.hasOwnProperty(key) || key.charCodeAt(0) === 95 && key.charCodeAt(1) === 95 && key !== '__type__' && key !== '__prefab') {
        continue;
      }
      var value$1 = obj[key];
      if (typeof value$1 === 'object' && value$1) {
        if (value$1 === clone) {
          continue;
        }
        clone[key] = value$1._iN$t || instantiateObj(value$1, parent);
      } else {
        clone[key] = value$1;
      }
    }
  }
  if (isCCObject(obj)) {
    clone._objFlags &= PersistentMask;
  }
}
function instantiateObj(obj, parent) {
  if (obj instanceof ValueType) {
    return obj.clone();
  }
  if (obj instanceof cclegacy.Asset) {
    return obj;
  }
  var clone;
  if (ArrayBuffer.isView(obj)) {
    var len = obj.length;
    clone = new obj.constructor(len);
    obj._iN$t = clone;
    objsToClearTmpVar.push(obj);
    for (var i = 0; i < len; ++i) {
      clone[i] = obj[i];
    }
    return clone;
  }
  if (Array.isArray(obj)) {
    var _len = obj.length;
    clone = new Array(_len);
    obj._iN$t = clone;
    objsToClearTmpVar.push(obj);
    for (var _i = 0; _i < _len; ++_i) {
      var value = obj[_i];
      if (typeof value === 'object' && value) {
        clone[_i] = value._iN$t || instantiateObj(value, parent);
      } else {
        clone[_i] = value;
      }
    }
    return clone;
  } else if (obj._objFlags & Destroyed) {
    return null;
  }
  var ctor = obj.constructor;
  if (isCCClassOrFastDefined(ctor)) {
    if (parent) {
      if (parent instanceof Component) {
        if (obj instanceof Node || obj instanceof Component) {
          return obj;
        }
      } else if (parent instanceof Node) {
        if (obj instanceof Node) {
          if (!obj.isChildOf(parent) && !isMountedChild(obj)) {
            return obj;
          }
        } else if (obj instanceof Component) {
          if (obj.node && !obj.node.isChildOf(parent)) {
            return obj;
          }
        }
      }
    }
    clone = new ctor();
  } else if (ctor === Object) {
    clone = {};
  } else if (!ctor) {
    clone = Object.create(null);
  } else {
    return obj;
  }
  enumerateObject(obj, clone, parent);
  return clone;
}
instantiate._clone = doInstantiate;
cclegacy.instantiate = instantiate;

export { instantiate as i };
//# sourceMappingURL=instantiate-DAIJ1YBG.js.map
