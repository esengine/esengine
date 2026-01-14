import { l as legacyCC } from './global-exports-DnCP_14L.js';
import { l as _createForOfIteratorHelperLoose, k as errorID, w as warnID, e as warn, Q as error, at as nextPow2$1, _ as _inheritsLoose, V as ValueType, ac as CCClass, o as assertIsTrue, a as _createClass, a9 as bits, Y as Orientation, $ as systemInfo, a4 as OS, n as EventTarget, s as settings, S as SettingsCategory, av as Feature, B as BrowserType, aJ as Platform, aO as Language, aP as NetworkType, G as macro, L as log, an as getClassName, aG as getSuper, ap as mixin, aQ as doValidateMethodWithProps_DEV, aR as PropertyStashInternalFlag, aS as getFullFormOfProperty, p as CCInteger, q as CCFloat, C as CCBoolean, j as CCString, aT as popCount, E as Enum, c as assertsArrayIndex, N as assertID, ao as IDGenerator, W as logID, t as createMap } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';

var editorExtrasTag = '__editorExtras__';

var defaultLogTimes = 10;
function setDefaultLogTimes(times) {
  if (times > 0) {
    defaultLogTimes = times;
  }
}
var replaceProperty;
var removeProperty;
var markAsWarning;
var replacePropertyLog;
var markAsWarningLog;
var removePropertyLog;
var messageID = 0;
var messageMap = new Map();
replacePropertyLog = function replacePropertyLog(n, dp, n2, newp, f, id, s) {
  var item = messageMap.get(id);
  if (item && item.logTimes > item.count) {
    f("'%s' is deprecated, please use '%s' instead. " + s, n + "." + dp, n2 + "." + newp);
    item.count++;
  }
};
replaceProperty = function replaceProperty(owner, ownerName, properties) {
  if (owner == null) return;
  properties.forEach(function (item) {
    var id = messageID++;
    messageMap.set(id, {
      id: id,
      count: 0,
      logTimes: item.logTimes !== undefined ? item.logTimes : defaultLogTimes
    });
    var target = item.target != null ? item.target : owner;
    var newName = item.newName != null ? item.newName : item.name;
    var targetName = item.targetName != null ? item.targetName : ownerName;
    var sameTarget = target === owner;
    var suggest = item.suggest ? "(" + item.suggest + ")" : '';
    if (item.customFunction != null) {
      owner[item.name] = function () {
        var _ref;
        replacePropertyLog(ownerName, item.name, targetName, newName, warn, id, suggest);
        return (_ref = item.customFunction).call.apply(_ref, [this].concat(Array.prototype.slice.call(arguments)));
      };
    } else if (item.customSetter != null || item.customGetter != null) {
      var hasSetter = item.customSetter != null;
      var hasGetter = item.customGetter != null;
      if (hasSetter && hasGetter) {
        Object.defineProperty(owner, item.name, {
          get: function get() {
            replacePropertyLog(ownerName, item.name, targetName, newName, warn, id, suggest);
            return item.customGetter.call(this);
          },
          set: function set(v) {
            replacePropertyLog(ownerName, item.name, targetName, newName, warn, id, suggest);
            item.customSetter.call(this, v);
          },
          enumerable: false
        });
      } else if (hasSetter) {
        Object.defineProperty(owner, item.name, {
          set: function set(v) {
            replacePropertyLog(ownerName, item.name, targetName, newName, warn, id, suggest);
            item.customSetter.call(this, v);
          },
          enumerable: false
        });
      } else if (hasGetter) {
        Object.defineProperty(owner, item.name, {
          get: function get() {
            replacePropertyLog(ownerName, item.name, targetName, newName, warn, id, suggest);
            return item.customGetter.call(this);
          },
          enumerable: false
        });
      }
    } else {
      Object.defineProperty(owner, item.name, {
        get: function get() {
          replacePropertyLog(ownerName, item.name, targetName, newName, warn, id, suggest);
          return sameTarget ? this[newName] : target[newName];
        },
        set: function set(v) {
          replacePropertyLog(ownerName, item.name, targetName, newName, warn, id, suggest);
          if (sameTarget) {
            this[newName] = v;
          } else {
            target[newName] = v;
          }
        },
        enumerable: false
      });
    }
  });
};
removePropertyLog = function removePropertyLog(n, dp, f, id, s) {
  var item = messageMap.get(id);
  if (item && item.logTimes > item.count) {
    f("'%s' has been removed. " + s, n + "." + dp);
    item.count++;
  }
};
removeProperty = function removeProperty(owner, ownerName, properties) {
  if (owner == null) return;
  properties.forEach(function (item) {
    var id = messageID++;
    messageMap.set(id, {
      id: id,
      count: 0,
      logTimes: item.logTimes !== undefined ? item.logTimes : defaultLogTimes
    });
    var suggest = item.suggest ? "(" + item.suggest + ")" : '';
    Object.defineProperty(owner, item.name, {
      get: function get() {
        return removePropertyLog(ownerName, item.name, error, id, suggest);
      },
      set: function set() {
        removePropertyLog(ownerName, item.name, error, id, suggest);
      },
      enumerable: false
    });
  });
};
markAsWarningLog = function markAsWarningLog(n, dp, f, id, s) {
  var item = messageMap.get(id);
  if (item && item.logTimes > item.count) {
    f("'%s' is deprecated. " + s, n + "." + dp);
    item.count++;
  }
};
markAsWarning = function markAsWarning(owner, ownerName, properties) {
  if (owner == null) return;
  var _defaultGetSet = function _defaultGetSet(d, n, dp, f, id, s) {
    if (d.get) {
      var oldGet = d.get;
      d.get = function () {
        markAsWarningLog(n, dp, f, id, s);
        return oldGet.call(this);
      };
    }
    if (d.set) {
      var oldSet = d.set;
      d.set = function (v) {
        markAsWarningLog(n, dp, f, id, s);
        oldSet.call(this, v);
      };
    }
    Object.defineProperty(owner, dp, d);
  };
  properties.forEach(function (item) {
    var deprecatedProp = item.name;
    var descriptor = Object.getOwnPropertyDescriptor(owner, deprecatedProp);
    if (!descriptor || !descriptor.configurable) {
      return;
    }
    var id = messageID++;
    messageMap.set(id, {
      id: id,
      count: 0,
      logTimes: item.logTimes !== undefined ? item.logTimes : defaultLogTimes
    });
    var suggest = item.suggest ? "(" + item.suggest + ")" : '';
    if (typeof descriptor.value !== 'undefined') {
      if (typeof descriptor.value === 'function') {
        var oldValue = descriptor.value;
        owner[deprecatedProp] = function () {
          markAsWarningLog(ownerName, deprecatedProp, warn, id, suggest);
          return oldValue.call.apply(oldValue, [this].concat(Array.prototype.slice.call(arguments)));
        };
      } else {
        var _oldValue = descriptor.value;
        Object.defineProperty(owner, deprecatedProp, {
          configurable: true,
          get: function get() {
            markAsWarningLog(ownerName, deprecatedProp, warn, id, suggest);
            return _oldValue;
          }
        });
        if (descriptor.writable) {
          Object.defineProperty(owner, deprecatedProp, {
            set: function set(value) {
              markAsWarningLog(ownerName, deprecatedProp, warn, id, suggest);
              _oldValue = value;
            }
          });
        }
      }
    } else {
      _defaultGetSet(descriptor, ownerName, deprecatedProp, warn, id, suggest);
    }
    Object.defineProperty(owner, deprecatedProp, {
      enumerable: false
    });
  });
};
var topLevelDeprecateList = {};
function deprecateModuleExportedName(deprecateList) {
  for (var deprecateName in deprecateList) {
    var deprecateInfo = deprecateList[deprecateName];
    topLevelDeprecateList[deprecateName] = deprecateInfo;
  }
}
function _checkObsoleteByName(checkName) {
  var deprecateInfo = topLevelDeprecateList[checkName];
  if (!deprecateInfo) {
    return;
  }
  var newName = deprecateInfo.newName,
    since = deprecateInfo.since,
    removed = deprecateInfo.removed;
  if (removed) {
    if (newName) {
      errorID(16003, checkName, since, newName);
    } else {
      errorID(16002, checkName, since);
    }
  } else if (newName) {
    warnID(16001, checkName, since, newName);
  } else {
    warnID(16000, checkName, since);
  }
}
function __checkObsolete__(checkList) {
  for (var _iterator = _createForOfIteratorHelperLoose(checkList), _step; !(_step = _iterator()).done;) {
    var checkName = _step.value;
    _checkObsoleteByName(checkName);
  }
}
var _cachedProxy;
function __checkObsoleteInNamespace__(ccNamespace) {
  if (!_cachedProxy) {
    if (typeof Proxy === 'undefined') {
      _cachedProxy = {};
    } else {
      _cachedProxy = new Proxy(ccNamespace, {
        get: function get(target, name, receiver) {
          _checkObsoleteByName(name);
          return Reflect.get(target, name, receiver);
        }
      });
    }
  }
  return _cachedProxy;
}

var mathAbs$4 = Math.abs;
var mathFloor = Math.floor;
var PI$4 = Math.PI;
var _d2r = PI$4 / 180.0;
var _r2d = 180.0 / PI$4;
var _random = Math.random;
var HALF_PI = PI$4 * 0.5;
var TWO_PI = PI$4 * 2.0;
var EPSILON = 0.000001;
function equals(a, b) {
  return mathAbs$4(a - b) <= EPSILON * Math.max(1.0, mathAbs$4(a), mathAbs$4(b));
}
function approx(a, b, maxDiff) {
  maxDiff = maxDiff || EPSILON;
  return mathAbs$4(a - b) <= maxDiff;
}
function clamp(val, min, max) {
  if (min > max) {
    var temp = min;
    min = max;
    max = temp;
  }
  return val < min ? min : val > max ? max : val;
}
function clamp01(val) {
  return val < 0 ? 0 : val > 1 ? 1 : val;
}
function lerp(from, to, ratio) {
  return from + (to - from) * ratio;
}
function toRadian(a) {
  return a * _d2r;
}
function toDegree(a) {
  return a * _r2d;
}
function random() {
  return _random();
}
function setRandGenerator(func) {
  _random = func;
}
function randomRange(min, max) {
  return random() * (max - min) + min;
}
function randomRangeInt(min, max) {
  return mathFloor(randomRange(min, max));
}
function pseudoRandom(seed) {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280.0;
}
function pseudoRandomRange(seed, min, max) {
  return pseudoRandom(seed) * (max - min) + min;
}
function pseudoRandomRangeInt(seed, min, max) {
  return mathFloor(pseudoRandomRange(seed, min, max));
}
function nextPow2(val) {
  return nextPow2$1(val);
}
function repeat(t, length) {
  return t - mathFloor(t / length) * length;
}
function pingPong(t, length) {
  t = repeat(t, length * 2);
  t = length - mathAbs$4(t - length);
  return t;
}
function inverseLerp(from, to, value) {
  return (value - from) / (to - from);
}
function absMaxComponent(v) {
  if (mathAbs$4(v.x) > mathAbs$4(v.y)) {
    if (mathAbs$4(v.x) > mathAbs$4(v.z)) {
      return v.x;
    } else {
      return v.z;
    }
  } else if (mathAbs$4(v.y) > mathAbs$4(v.z)) {
    return v.y;
  } else {
    return v.z;
  }
}
function absMax(a, b) {
  if (mathAbs$4(a) > mathAbs$4(b)) {
    return a;
  } else {
    return b;
  }
}
function enumerableProps(prototype, attrs) {
  attrs.forEach(function (key) {
    Object.defineProperty(prototype, key, {
      enumerable: true
    });
  });
}
var toHalf = function toHalf() {
  var floatView = new Float32Array(1);
  var int32View = new Int32Array(floatView.buffer);
  return function toHalf(fval) {
    floatView[0] = fval;
    var fbits = int32View[0];
    var s = fbits >> 16 & 0x8000;
    var em = fbits & 0x7fffffff;
    var h = em - (112 << 23) + (1 << 12) >> 13;
    h = em < 113 << 23 ? 0 : h;
    h = em >= 143 << 23 ? 0x7c00 : h;
    h = em > 255 << 23 ? 0x7e00 : h;
    int32View[0] = s | h;
    return int32View[0];
  };
}();
var fromHalf = function fromHalf() {
  var floatView = new Float32Array(1);
  var int32View = new Int32Array(floatView.buffer);
  return function fromHalf(hval) {
    var s = hval >> 15 & 0x00000001;
    var em = hval & 0x00007fff;
    var h = em << 13;
    var fbits = 0;
    if (h !== 0x7c00) {
      h += 112 << 23;
      if (em === 0) {
        h = (h & 0xfffff) >> 1;
      } else if (em === 0x7fff) {
        h = 0x7fffffff;
      }
    } else {
      h = 0x7f800000;
    }
    fbits = s << 31 | h;
    int32View[0] = fbits;
    return floatView[0];
  };
}();
function floatToHalf(val) {
  return toHalf(val);
}
function halfToFloat(val) {
  return fromHalf(val);
}

var abs$5 = Math.abs;
var _max$3 = Math.max;
var _min$3 = Math.min;
var PI$3 = Math.PI;
var sin$4 = Math.sin;
var cos$5 = Math.cos;
var atan2$2 = Math.atan2;
var sqrt$5 = Math.sqrt;
var _ceil$2 = Math.ceil;
var _floor$2 = Math.floor;
var _round$2 = Math.round;
function freezeVec4(x, y, z, w) {
  return Object.freeze(new Vec4(x, y, z, w));
}
var Vec4 = function (_ValueType) {
  function Vec4(x, y, z, w) {
    var _this;
    _this = _ValueType.call(this) || this;
    if (typeof x === 'object') {
      _this.x = x.x;
      _this.y = x.y;
      _this.z = x.z;
      _this.w = x.w;
    } else {
      _this.x = x || 0;
      _this.y = y || 0;
      _this.z = z || 0;
      _this.w = w || 0;
    }
    return _this;
  }
  _inheritsLoose(Vec4, _ValueType);
  Vec4.clone = function clone(a) {
    return new Vec4(a.x, a.y, a.z, a.w);
  };
  Vec4.copy = function copy(out, a) {
    out.x = a.x;
    out.y = a.y;
    out.z = a.z;
    out.w = a.w;
    return out;
  };
  Vec4.set = function set(out, x, y, z, w) {
    out.x = x;
    out.y = y;
    out.z = z;
    out.w = w;
    return out;
  };
  Vec4.fromColor = function fromColor(out, color) {
    out.x = color.r;
    out.y = color.g;
    out.z = color.b;
    out.w = color.a;
    return out;
  };
  Vec4.angle = function angle(a, b) {
    var dx = a.y * b.z - a.z * b.y;
    var dy = a.z * b.x - a.x * b.z;
    var dz = a.x * b.y - a.y * b.x;
    var dotVal = a.x * b.x + a.y * b.y + a.z * b.z;
    return atan2$2(sqrt$5(dx * dx + dy * dy + dz * dz), dotVal);
  };
  Vec4.add = function add(out, a, b) {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    out.z = a.z + b.z;
    out.w = a.w + b.w;
    return out;
  };
  Vec4.subtract = function subtract(out, a, b) {
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    out.z = a.z - b.z;
    out.w = a.w - b.w;
    return out;
  };
  Vec4.multiply = function multiply(out, a, b) {
    out.x = a.x * b.x;
    out.y = a.y * b.y;
    out.z = a.z * b.z;
    out.w = a.w * b.w;
    return out;
  };
  Vec4.divide = function divide(out, a, b) {
    out.x = a.x / b.x;
    out.y = a.y / b.y;
    out.z = a.z / b.z;
    out.w = a.w / b.w;
    return out;
  };
  Vec4.ceil = function ceil(out, a) {
    out.x = _ceil$2(a.x);
    out.y = _ceil$2(a.y);
    out.z = _ceil$2(a.z);
    out.w = _ceil$2(a.w);
    return out;
  };
  Vec4.floor = function floor(out, a) {
    out.x = _floor$2(a.x);
    out.y = _floor$2(a.y);
    out.z = _floor$2(a.z);
    out.w = _floor$2(a.w);
    return out;
  };
  Vec4.min = function min(out, a, b) {
    out.x = _min$3(a.x, b.x);
    out.y = _min$3(a.y, b.y);
    out.z = _min$3(a.z, b.z);
    out.w = _min$3(a.w, b.w);
    return out;
  };
  Vec4.max = function max(out, a, b) {
    out.x = _max$3(a.x, b.x);
    out.y = _max$3(a.y, b.y);
    out.z = _max$3(a.z, b.z);
    out.w = _max$3(a.w, b.w);
    return out;
  };
  Vec4.round = function round(out, a) {
    out.x = _round$2(a.x);
    out.y = _round$2(a.y);
    out.z = _round$2(a.z);
    out.w = _round$2(a.w);
    return out;
  };
  Vec4.multiplyScalar = function multiplyScalar(out, a, b) {
    out.x = a.x * b;
    out.y = a.y * b;
    out.z = a.z * b;
    out.w = a.w * b;
    return out;
  };
  Vec4.scaleAndAdd = function scaleAndAdd(out, a, b, scale) {
    out.x = a.x + b.x * scale;
    out.y = a.y + b.y * scale;
    out.z = a.z + b.z * scale;
    out.w = a.w + b.w * scale;
    return out;
  };
  Vec4.distance = function distance(a, b) {
    var x = b.x - a.x;
    var y = b.y - a.y;
    var z = b.z - a.z;
    var w = b.w - a.w;
    return sqrt$5(x * x + y * y + z * z + w * w);
  };
  Vec4.squaredDistance = function squaredDistance(a, b) {
    var x = b.x - a.x;
    var y = b.y - a.y;
    var z = b.z - a.z;
    var w = b.w - a.w;
    return x * x + y * y + z * z + w * w;
  };
  Vec4.len = function len(a) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    var w = a.w;
    return sqrt$5(x * x + y * y + z * z + w * w);
  };
  Vec4.lengthSqr = function lengthSqr(a) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    var w = a.w;
    return x * x + y * y + z * z + w * w;
  };
  Vec4.negate = function negate(out, a) {
    out.x = -a.x;
    out.y = -a.y;
    out.z = -a.z;
    out.w = -a.w;
    return out;
  };
  Vec4.inverse = function inverse(out, a) {
    out.x = 1.0 / a.x;
    out.y = 1.0 / a.y;
    out.z = 1.0 / a.z;
    out.w = 1.0 / a.w;
    return out;
  };
  Vec4.inverseSafe = function inverseSafe(out, a) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    var w = a.w;
    if (abs$5(x) < EPSILON) {
      out.x = 0;
    } else {
      out.x = 1.0 / x;
    }
    if (abs$5(y) < EPSILON) {
      out.y = 0;
    } else {
      out.y = 1.0 / y;
    }
    if (abs$5(z) < EPSILON) {
      out.z = 0;
    } else {
      out.z = 1.0 / z;
    }
    if (abs$5(w) < EPSILON) {
      out.w = 0;
    } else {
      out.w = 1.0 / w;
    }
    return out;
  };
  Vec4.normalize = function normalize(out, a) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    var w = a.w;
    var len = x * x + y * y + z * z + w * w;
    if (len > 0) {
      len = 1 / sqrt$5(len);
      out.x = x * len;
      out.y = y * len;
      out.z = z * len;
      out.w = w * len;
    } else {
      out.x = 0;
      out.y = 0;
      out.z = 0;
      out.w = 0;
    }
    return out;
  };
  Vec4.dot = function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  };
  Vec4.lerp = function lerp(out, a, b, t) {
    out.x = a.x + t * (b.x - a.x);
    out.y = a.y + t * (b.y - a.y);
    out.z = a.z + t * (b.z - a.z);
    out.w = a.w + t * (b.w - a.w);
    return out;
  };
  Vec4.scale = function scale(out, a, b) {
    out.x = a.x * b;
    out.y = a.y * b;
    out.z = a.z * b;
    out.w = a.w * b;
    return out;
  };
  Vec4.random = function random$1(out, scale) {
    scale = scale || 1.0;
    var phi = random() * 2.0 * PI$3;
    var cosTheta = random() * 2 - 1;
    var sinTheta = sqrt$5(1 - cosTheta * cosTheta);
    out.x = sinTheta * cos$5(phi) * scale;
    out.y = sinTheta * sin$4(phi) * scale;
    out.z = cosTheta * scale;
    out.w = 0;
    return out;
  };
  Vec4.transformMat4 = function transformMat4(out, a, m) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    var w = a.w;
    out.x = m.m00 * x + m.m04 * y + m.m08 * z + m.m12 * w;
    out.y = m.m01 * x + m.m05 * y + m.m09 * z + m.m13 * w;
    out.z = m.m02 * x + m.m06 * y + m.m10 * z + m.m14 * w;
    out.w = m.m03 * x + m.m07 * y + m.m11 * z + m.m15 * w;
    return out;
  };
  Vec4.transformAffine = function transformAffine(out, v, m) {
    var x = v.x;
    var y = v.y;
    var z = v.z;
    var w = v.w;
    out.x = m.m00 * x + m.m04 * y + m.m08 * z + m.m12 * w;
    out.y = m.m01 * x + m.m05 * y + m.m09 * z + m.m13 * w;
    out.z = m.m02 * x + m.m06 * y + m.m10 * z + m.m14 * w;
    out.w = v.w;
    return out;
  };
  Vec4.transformQuat = function transformQuat(out, a, q) {
    var x = a.x,
      y = a.y,
      z = a.z;
    var _x = q.x;
    var _y = q.y;
    var _z = q.z;
    var _w = q.w;
    var ix = _w * x + _y * z - _z * y;
    var iy = _w * y + _z * x - _x * z;
    var iz = _w * z + _x * y - _y * x;
    var iw = -_x * x - _y * y - _z * z;
    out.x = ix * _w + iw * -_x + iy * -_z - iz * -_y;
    out.y = iy * _w + iw * -_y + iz * -_x - ix * -_z;
    out.z = iz * _w + iw * -_z + ix * -_y - iy * -_x;
    out.w = a.w;
    return out;
  };
  Vec4.toArray = function toArray(out, v, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out[ofs + 0] = v.x;
    out[ofs + 1] = v.y;
    out[ofs + 2] = v.z;
    out[ofs + 3] = v.w;
    return out;
  };
  Vec4.fromArray = function fromArray(out, arr, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out.x = arr[ofs + 0];
    out.y = arr[ofs + 1];
    out.z = arr[ofs + 2];
    out.w = arr[ofs + 3];
    return out;
  };
  Vec4.strictEquals = function strictEquals(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
  };
  Vec4.equals = function equals(a, b, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    var inf = Infinity;
    var hasInf = abs$5(a.x) === inf || abs$5(a.y) === inf || abs$5(a.z) === inf || abs$5(a.w) === inf || abs$5(b.x) === inf || abs$5(b.y) === inf || abs$5(b.z) === inf || abs$5(b.w) === inf;
    return !hasInf && abs$5(a.x - b.x) <= epsilon * _max$3(1.0, abs$5(a.x), abs$5(b.x)) && abs$5(a.y - b.y) <= epsilon * _max$3(1.0, abs$5(a.y), abs$5(b.y)) && abs$5(a.z - b.z) <= epsilon * _max$3(1.0, abs$5(a.z), abs$5(b.z)) && abs$5(a.w - b.w) <= epsilon * _max$3(1.0, abs$5(a.w), abs$5(b.w));
  };
  var _proto = Vec4.prototype;
  _proto.clone = function clone() {
    return new Vec4(this.x, this.y, this.z, this.w);
  };
  _proto.set = function set(x, y, z, w) {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
      this.w = x.w;
    } else {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.w = w || 0;
    }
    return this;
  };
  _proto.equals = function equals(other, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    var self = this;
    return abs$5(self.x - other.x) <= epsilon * _max$3(1.0, abs$5(self.x), abs$5(other.x)) && abs$5(self.y - other.y) <= epsilon * _max$3(1.0, abs$5(self.y), abs$5(other.y)) && abs$5(self.z - other.z) <= epsilon * _max$3(1.0, abs$5(self.z), abs$5(other.z)) && abs$5(self.w - other.w) <= epsilon * _max$3(1.0, abs$5(self.w), abs$5(other.w));
  };
  _proto.equals4f = function equals4f(x, y, z, w, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    var self = this;
    return abs$5(self.x - x) <= epsilon * _max$3(1.0, abs$5(self.x), abs$5(x)) && abs$5(self.y - y) <= epsilon * _max$3(1.0, abs$5(self.y), abs$5(y)) && abs$5(self.z - z) <= epsilon * _max$3(1.0, abs$5(self.z), abs$5(z)) && abs$5(self.w - w) <= epsilon * _max$3(1.0, abs$5(self.w), abs$5(w));
  };
  _proto.strictEquals = function strictEquals(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
  };
  _proto.strictEquals4f = function strictEquals4f(x, y, z, w) {
    return this.x === x && this.y === y && this.z === z && this.w === w;
  };
  _proto.lerp = function lerp(to, ratio) {
    var self = this;
    var x = self.x;
    var y = self.y;
    var z = self.z;
    var w = self.w;
    self.x = x + ratio * (to.x - x);
    self.y = y + ratio * (to.y - y);
    self.z = z + ratio * (to.z - z);
    self.w = w + ratio * (to.w - w);
    return self;
  };
  _proto.toString = function toString() {
    return "(" + this.x + ", " + this.y + ", " + this.z + ", " + this.w + ")";
  };
  _proto.clampf = function clampf(minInclusive, maxInclusive) {
    var self = this;
    self.x = clamp(self.x, minInclusive.x, maxInclusive.x);
    self.y = clamp(self.y, minInclusive.y, maxInclusive.y);
    self.z = clamp(self.z, minInclusive.z, maxInclusive.z);
    self.w = clamp(self.w, minInclusive.w, maxInclusive.w);
    return self;
  };
  _proto.add = function add(other) {
    var self = this;
    self.x += other.x;
    self.y += other.y;
    self.z += other.z;
    self.w += other.w;
    return self;
  };
  _proto.add4f = function add4f(x, y, z, w) {
    var self = this;
    self.x += x;
    self.y += y;
    self.z += z;
    self.w += w;
    return self;
  };
  _proto.subtract = function subtract(other) {
    var self = this;
    self.x -= other.x;
    self.y -= other.y;
    self.z -= other.z;
    self.w -= other.w;
    return self;
  };
  _proto.subtract4f = function subtract4f(x, y, z, w) {
    var self = this;
    self.x -= x;
    self.y -= y;
    self.z -= z;
    self.w -= w;
    return self;
  };
  _proto.multiplyScalar = function multiplyScalar(scalar) {
    var self = this;
    self.x *= scalar;
    self.y *= scalar;
    self.z *= scalar;
    self.w *= scalar;
    return self;
  };
  _proto.multiply = function multiply(other) {
    var self = this;
    self.x *= other.x;
    self.y *= other.y;
    self.z *= other.z;
    self.w *= other.w;
    return self;
  };
  _proto.multiply4f = function multiply4f(x, y, z, w) {
    var self = this;
    self.x *= x;
    self.y *= y;
    self.z *= z;
    self.w *= w;
    return self;
  };
  _proto.divide = function divide(other) {
    var self = this;
    self.x /= other.x;
    self.y /= other.y;
    self.z /= other.z;
    self.w /= other.w;
    return self;
  };
  _proto.divide4f = function divide4f(x, y, z, w) {
    var self = this;
    self.x /= x;
    self.y /= y;
    self.z /= z;
    self.w /= w;
    return self;
  };
  _proto.negative = function negative() {
    var self = this;
    self.x = -self.x;
    self.y = -self.y;
    self.z = -self.z;
    self.w = -self.w;
    return self;
  };
  _proto.dot = function dot(vector) {
    var self = this;
    return self.x * vector.x + self.y * vector.y + self.z * vector.z + self.w * vector.w;
  };
  _proto.cross = function cross(vector) {
    var self = this;
    var ax = self.x,
      ay = self.y,
      az = self.z;
    var bx = vector.x,
      by = vector.y,
      bz = vector.z;
    self.x = ay * bz - az * by;
    self.y = az * bx - ax * bz;
    self.z = ax * by - ay * bx;
    return self;
  };
  _proto.length = function length() {
    var self = this;
    var x = self.x;
    var y = self.y;
    var z = self.z;
    var w = self.w;
    return sqrt$5(x * x + y * y + z * z + w * w);
  };
  _proto.lengthSqr = function lengthSqr() {
    var self = this;
    var x = self.x;
    var y = self.y;
    var z = self.z;
    var w = self.w;
    return x * x + y * y + z * z + w * w;
  };
  _proto.normalize = function normalize() {
    var self = this;
    var x = self.x;
    var y = self.y;
    var z = self.z;
    var w = self.w;
    var len = x * x + y * y + z * z + w * w;
    if (len > 0) {
      len = 1 / sqrt$5(len);
      self.x = x * len;
      self.y = y * len;
      self.z = z * len;
      self.w = w * len;
    }
    return self;
  };
  _proto.scale = function scale(scalar) {
    var self = this;
    self.x *= scalar;
    self.y *= scalar;
    self.z *= scalar;
    self.w *= scalar;
    return self;
  };
  _proto.transformMat4 = function transformMat4(matrix) {
    var self = this;
    var x = self.x;
    var y = self.y;
    var z = self.z;
    var w = self.w;
    self.x = matrix.m00 * x + matrix.m04 * y + matrix.m08 * z + matrix.m12 * w;
    self.y = matrix.m01 * x + matrix.m05 * y + matrix.m09 * z + matrix.m13 * w;
    self.z = matrix.m02 * x + matrix.m06 * y + matrix.m10 * z + matrix.m14 * w;
    self.w = matrix.m03 * x + matrix.m07 * y + matrix.m11 * z + matrix.m15 * w;
    return self;
  };
  return Vec4;
}(ValueType);
Vec4.ZERO = freezeVec4(0, 0, 0, 0);
Vec4.ONE = freezeVec4(1, 1, 1, 1);
Vec4.NEG_ONE = freezeVec4(-1, -1, -1, -1);
Vec4.UNIT_X = freezeVec4(1, 0, 0, 0);
Vec4.UNIT_Y = freezeVec4(0, 1, 0, 0);
Vec4.UNIT_Z = freezeVec4(0, 0, 1, 0);
Vec4.UNIT_W = freezeVec4(0, 0, 0, 1);
CCClass.fastDefine('cc.Vec4', Vec4, {
  x: 0,
  y: 0,
  z: 0,
  w: 0
});
legacyCC.Vec4 = Vec4;
function v4(x, y, z, w) {
  return new Vec4(x, y, z, w);
}
legacyCC.v4 = v4;

var _Vec;
var abs$4 = Math.abs;
var _max$2 = Math.max;
var _min$2 = Math.min;
var PI$2 = Math.PI;
var acos$3 = Math.acos;
var sin$3 = Math.sin;
var cos$4 = Math.cos;
var sqrt$4 = Math.sqrt;
var _ceil$1 = Math.ceil;
var _floor$1 = Math.floor;
var _round$1 = Math.round;
function freezeVec3(x, y, z) {
  return Object.freeze(new Vec3(x, y, z));
}
var Vec3 = function (_ValueType) {
  function Vec3(x, y, z) {
    var _this;
    _this = _ValueType.call(this) || this;
    if (typeof x === 'object') {
      _this.x = x.x;
      _this.y = x.y;
      _this.z = x.z;
    } else {
      _this.x = x || 0;
      _this.y = y || 0;
      _this.z = z || 0;
    }
    return _this;
  }
  _inheritsLoose(Vec3, _ValueType);
  Vec3.zero = function zero(out) {
    out.x = 0;
    out.y = 0;
    out.z = 0;
    return out;
  };
  Vec3.clone = function clone(a) {
    return new Vec3(a.x, a.y, a.z);
  };
  Vec3.copy = function copy(out, a) {
    out.x = a.x;
    out.y = a.y;
    out.z = a.z;
    return out;
  };
  Vec3.set = function set(out, x, y, z) {
    out.x = x;
    out.y = y;
    out.z = z;
    return out;
  };
  Vec3.add = function add(out, a, b) {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    out.z = a.z + b.z;
    return out;
  };
  Vec3.subtract = function subtract(out, a, b) {
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    out.z = a.z - b.z;
    return out;
  };
  Vec3.multiply = function multiply(out, a, b) {
    out.x = a.x * b.x;
    out.y = a.y * b.y;
    out.z = a.z * b.z;
    return out;
  };
  Vec3.divide = function divide(out, a, b) {
    out.x = a.x / b.x;
    out.y = a.y / b.y;
    out.z = a.z / b.z;
    return out;
  };
  Vec3.ceil = function ceil(out, a) {
    out.x = _ceil$1(a.x);
    out.y = _ceil$1(a.y);
    out.z = _ceil$1(a.z);
    return out;
  };
  Vec3.floor = function floor(out, a) {
    out.x = _floor$1(a.x);
    out.y = _floor$1(a.y);
    out.z = _floor$1(a.z);
    return out;
  };
  Vec3.min = function min(out, a, b) {
    out.x = _min$2(a.x, b.x);
    out.y = _min$2(a.y, b.y);
    out.z = _min$2(a.z, b.z);
    return out;
  };
  Vec3.max = function max(out, a, b) {
    out.x = _max$2(a.x, b.x);
    out.y = _max$2(a.y, b.y);
    out.z = _max$2(a.z, b.z);
    return out;
  };
  Vec3.round = function round(out, a) {
    out.x = _round$1(a.x);
    out.y = _round$1(a.y);
    out.z = _round$1(a.z);
    return out;
  };
  Vec3.multiplyScalar = function multiplyScalar(out, a, b) {
    out.x = a.x * b;
    out.y = a.y * b;
    out.z = a.z * b;
    return out;
  };
  Vec3.scaleAndAdd = function scaleAndAdd(out, a, b, scale) {
    out.x = a.x + b.x * scale;
    out.y = a.y + b.y * scale;
    out.z = a.z + b.z * scale;
    return out;
  };
  Vec3.distance = function distance(a, b) {
    var x = b.x - a.x;
    var y = b.y - a.y;
    var z = b.z - a.z;
    return sqrt$4(x * x + y * y + z * z);
  };
  Vec3.squaredDistance = function squaredDistance(a, b) {
    var x = b.x - a.x;
    var y = b.y - a.y;
    var z = b.z - a.z;
    return x * x + y * y + z * z;
  };
  Vec3.len = function len(a) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    return sqrt$4(x * x + y * y + z * z);
  };
  Vec3.lengthSqr = function lengthSqr(a) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    return x * x + y * y + z * z;
  };
  Vec3.negate = function negate(out, a) {
    out.x = -a.x;
    out.y = -a.y;
    out.z = -a.z;
    return out;
  };
  Vec3.invert = function invert(out, a) {
    out.x = 1.0 / a.x;
    out.y = 1.0 / a.y;
    out.z = 1.0 / a.z;
    return out;
  };
  Vec3.invertSafe = function invertSafe(out, a) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    if (abs$4(x) < EPSILON) {
      out.x = 0;
    } else {
      out.x = 1.0 / x;
    }
    if (abs$4(y) < EPSILON) {
      out.y = 0;
    } else {
      out.y = 1.0 / y;
    }
    if (abs$4(z) < EPSILON) {
      out.z = 0;
    } else {
      out.z = 1.0 / z;
    }
    return out;
  };
  Vec3.normalize = function normalize(out, a) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    var len = x * x + y * y + z * z;
    if (len > 0) {
      len = 1 / sqrt$4(len);
      out.x = x * len;
      out.y = y * len;
      out.z = z * len;
    } else {
      out.x = 0;
      out.y = 0;
      out.z = 0;
    }
    return out;
  };
  Vec3.dot = function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  };
  Vec3.cross = function cross(out, a, b) {
    var ax = a.x,
      ay = a.y,
      az = a.z;
    var bx = b.x,
      by = b.y,
      bz = b.z;
    out.x = ay * bz - az * by;
    out.y = az * bx - ax * bz;
    out.z = ax * by - ay * bx;
    return out;
  };
  Vec3.lerp = function lerp(out, a, b, t) {
    out.x = a.x + t * (b.x - a.x);
    out.y = a.y + t * (b.y - a.y);
    out.z = a.z + t * (b.z - a.z);
    return out;
  };
  Vec3.random = function random$1(out, scale) {
    scale = scale || 1.0;
    var phi = random() * 2.0 * PI$2;
    var cosTheta = random() * 2 - 1;
    var sinTheta = sqrt$4(1 - cosTheta * cosTheta);
    out.x = sinTheta * cos$4(phi) * scale;
    out.y = sinTheta * sin$3(phi) * scale;
    out.z = cosTheta * scale;
    return out;
  };
  Vec3.transformMat4 = function transformMat4(out, a, m) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    var rhw = m.m03 * x + m.m07 * y + m.m11 * z + m.m15;
    rhw = rhw ? 1 / rhw : 1;
    out.x = (m.m00 * x + m.m04 * y + m.m08 * z + m.m12) * rhw;
    out.y = (m.m01 * x + m.m05 * y + m.m09 * z + m.m13) * rhw;
    out.z = (m.m02 * x + m.m06 * y + m.m10 * z + m.m14) * rhw;
    return out;
  };
  Vec3.transformMat4Normal = function transformMat4Normal(out, a, m) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    var rhw = m.m03 * x + m.m07 * y + m.m11 * z;
    rhw = rhw ? 1 / rhw : 1;
    out.x = (m.m00 * x + m.m04 * y + m.m08 * z) * rhw;
    out.y = (m.m01 * x + m.m05 * y + m.m09 * z) * rhw;
    out.z = (m.m02 * x + m.m06 * y + m.m10 * z) * rhw;
    return out;
  };
  Vec3.transformMat3 = function transformMat3(out, a, m) {
    var x = a.x;
    var y = a.y;
    var z = a.z;
    out.x = x * m.m00 + y * m.m03 + z * m.m06;
    out.y = x * m.m01 + y * m.m04 + z * m.m07;
    out.z = x * m.m02 + y * m.m05 + z * m.m08;
    return out;
  };
  Vec3.transformAffine = function transformAffine(out, v, m) {
    var x = v.x;
    var y = v.y;
    var z = v.z;
    out.x = m.m00 * x + m.m04 * y + m.m08 * z + m.m12;
    out.y = m.m01 * x + m.m05 * y + m.m09 * z + m.m13;
    out.z = m.m02 * x + m.m06 * y + m.m10 * z + m.m14;
    return out;
  };
  Vec3.transformQuat = function transformQuat(out, a, q) {
    var ix = q.w * a.x + q.y * a.z - q.z * a.y;
    var iy = q.w * a.y + q.z * a.x - q.x * a.z;
    var iz = q.w * a.z + q.x * a.y - q.y * a.x;
    var iw = -q.x * a.x - q.y * a.y - q.z * a.z;
    out.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
    out.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
    out.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
    return out;
  };
  Vec3.transformRTS = function transformRTS(out, a, r, t, s) {
    var x = a.x * s.x;
    var y = a.y * s.y;
    var z = a.z * s.z;
    var ix = r.w * x + r.y * z - r.z * y;
    var iy = r.w * y + r.z * x - r.x * z;
    var iz = r.w * z + r.x * y - r.y * x;
    var iw = -r.x * x - r.y * y - r.z * z;
    out.x = ix * r.w + iw * -r.x + iy * -r.z - iz * -r.y + t.x;
    out.y = iy * r.w + iw * -r.y + iz * -r.x - ix * -r.z + t.y;
    out.z = iz * r.w + iw * -r.z + ix * -r.y - iy * -r.x + t.z;
    return out;
  };
  Vec3.transformInverseRTS = function transformInverseRTS(out, a, r, t, s) {
    var x = a.x - t.x;
    var y = a.y - t.y;
    var z = a.z - t.z;
    var ix = r.w * x - r.y * z + r.z * y;
    var iy = r.w * y - r.z * x + r.x * z;
    var iz = r.w * z - r.x * y + r.y * x;
    var iw = r.x * x + r.y * y + r.z * z;
    out.x = (ix * r.w + iw * r.x + iy * r.z - iz * r.y) / s.x;
    out.y = (iy * r.w + iw * r.y + iz * r.x - ix * r.z) / s.y;
    out.z = (iz * r.w + iw * r.z + ix * r.y - iy * r.x) / s.z;
    return out;
  };
  Vec3.rotateX = function rotateX(out, v, o, a) {
    var x = v.x - o.x;
    var y = v.y - o.y;
    var z = v.z - o.z;
    var c = cos$4(a);
    var s = sin$3(a);
    var rx = x;
    var ry = y * c - z * s;
    var rz = y * s + z * c;
    out.x = rx + o.x;
    out.y = ry + o.y;
    out.z = rz + o.z;
    return out;
  };
  Vec3.rotateY = function rotateY(out, v, o, a) {
    var x = v.x - o.x;
    var y = v.y - o.y;
    var z = v.z - o.z;
    var c = cos$4(a);
    var s = sin$3(a);
    var rx = z * s + x * c;
    var ry = y;
    var rz = z * c - x * s;
    out.x = rx + o.x;
    out.y = ry + o.y;
    out.z = rz + o.z;
    return out;
  };
  Vec3.rotateZ = function rotateZ(out, v, o, a) {
    var x = v.x - o.x;
    var y = v.y - o.y;
    var z = v.z - o.z;
    var c = cos$4(a);
    var s = sin$3(a);
    var rx = x * c - y * s;
    var ry = x * s + y * c;
    var rz = z;
    out.x = rx + o.x;
    out.y = ry + o.y;
    out.z = rz + o.z;
    return out;
  };
  Vec3.rotateN = function rotateN(out, v, o, n, a) {
    var x = v.x - o.x;
    var y = v.y - o.y;
    var z = v.z - o.z;
    var nx = n.x;
    var ny = n.y;
    var nz = n.z;
    var c = cos$4(a);
    var s = sin$3(a);
    var rx = x * (nx * nx * (1.0 - c) + c) + y * (nx * ny * (1.0 - c) - nz * s) + z * (nx * nz * (1.0 - c) + ny * s);
    var ry = x * (nx * ny * (1.0 - c) + nz * s) + y * (ny * ny * (1.0 - c) + c) + z * (ny * nz * (1.0 - c) - nx * s);
    var rz = x * (nx * nz * (1.0 - c) - ny * s) + y * (ny * nz * (1.0 - c) + nx * s) + z * (nz * nz * (1.0 - c) + c);
    out.x = rx + o.x;
    out.y = ry + o.y;
    out.z = rz + o.z;
    return out;
  };
  Vec3.toArray = function toArray(out, v, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out[ofs + 0] = v.x;
    out[ofs + 1] = v.y;
    out[ofs + 2] = v.z;
    return out;
  };
  Vec3.fromArray = function fromArray(out, arr, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out.x = arr[ofs + 0];
    out.y = arr[ofs + 1];
    out.z = arr[ofs + 2];
    return out;
  };
  Vec3.strictEquals = function strictEquals(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z;
  };
  Vec3.equals = function equals(a, b, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    var a0 = a.x,
      a1 = a.y,
      a2 = a.z;
    var b0 = b.x,
      b1 = b.y,
      b2 = b.z;
    return abs$4(a0 - b0) <= epsilon * _max$2(1.0, abs$4(a0), abs$4(b0)) && abs$4(a1 - b1) <= epsilon * _max$2(1.0, abs$4(a1), abs$4(b1)) && abs$4(a2 - b2) <= epsilon * _max$2(1.0, abs$4(a2), abs$4(b2));
  };
  Vec3.angle = function angle(a, b) {
    var magSqr1 = a.x * a.x + a.y * a.y + a.z * a.z;
    var magSqr2 = b.x * b.x + b.y * b.y + b.z * b.z;
    if (magSqr1 === 0 || magSqr2 === 0) {
      return 0.0;
    }
    var dot = a.x * b.x + a.y * b.y + a.z * b.z;
    var cosine = dot / sqrt$4(magSqr1 * magSqr2);
    cosine = clamp(cosine, -1, 1.0);
    return acos$3(cosine);
  };
  Vec3.projectOnPlane = function projectOnPlane(out, a, n) {
    return Vec3.subtract(out, a, Vec3.project(out, a, n));
  };
  Vec3.project = function project(out, a, b) {
    var sqrLen = Vec3.lengthSqr(b);
    if (sqrLen < 0.000001) {
      return Vec3.set(out, 0, 0, 0);
    } else {
      return Vec3.multiplyScalar(out, b, Vec3.dot(a, b) / sqrLen);
    }
  };
  Vec3.moveTowards = function moveTowards(out, current, target, maxStep) {
    var deltaX = target.x - current.x;
    var deltaY = target.y - current.y;
    var deltaZ = target.z - current.z;
    var distanceSqr = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
    if (distanceSqr === 0 || maxStep >= 0 && distanceSqr < maxStep * maxStep) {
      out.x = target.x;
      out.y = target.y;
      out.z = target.z;
      return out;
    }
    var distance = sqrt$4(distanceSqr);
    var scale = maxStep / distance;
    out.x = current.x + deltaX * scale;
    out.y = current.y + deltaY * scale;
    out.z = current.z + deltaZ * scale;
    return out;
  };
  Vec3.generateOrthogonal = function generateOrthogonal(out, n) {
    var x = n.x,
      y = n.y,
      z = n.z;
    var absX = abs$4(x);
    var absY = abs$4(y);
    var absZ = abs$4(z);
    if (absX < absY && absX < absZ) {
      Vec3.set(out, 0.0, z, -y);
    } else if (absY < absZ) {
      Vec3.set(out, z, 0.0, -x);
    } else {
      Vec3.set(out, y, -x, 0.0);
    }
    return Vec3.normalize(out, out);
  };
  var _proto = Vec3.prototype;
  _proto.clone = function clone() {
    return new Vec3(this.x, this.y, this.z);
  };
  _proto.set = function set(x, y, z) {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    }
    return this;
  };
  _proto.equals = function equals(other, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return abs$4(this.x - other.x) <= epsilon && abs$4(this.y - other.y) <= epsilon && abs$4(this.z - other.z) <= epsilon;
  };
  _proto.equals3f = function equals3f(x, y, z, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return abs$4(this.x - x) <= epsilon && abs$4(this.y - y) <= epsilon && abs$4(this.z - z) <= epsilon;
  };
  _proto.strictEquals = function strictEquals(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  };
  _proto.strictEquals3f = function strictEquals3f(x, y, z) {
    return this.x === x && this.y === y && this.z === z;
  };
  _proto.toString = function toString() {
    return "(" + this.x + ", " + this.y + ", " + this.z + ")";
  };
  _proto.lerp = function lerp(to, ratio) {
    this.x += ratio * (to.x - this.x);
    this.y += ratio * (to.y - this.y);
    this.z += ratio * (to.z - this.z);
    return this;
  };
  _proto.add = function add(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  };
  _proto.add3f = function add3f(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  };
  _proto.subtract = function subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  };
  _proto.subtract3f = function subtract3f(x, y, z) {
    this.x -= x;
    this.y -= y;
    this.z -= z;
    return this;
  };
  _proto.multiplyScalar = function multiplyScalar(scalar) {
    if (typeof scalar === 'object') {
      warnID(16357);
    }
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  };
  _proto.multiply = function multiply(other) {
    if (typeof other !== 'object') {
      warnID(16358);
    }
    this.x *= other.x;
    this.y *= other.y;
    this.z *= other.z;
    return this;
  };
  _proto.multiply3f = function multiply3f(x, y, z) {
    this.x *= x;
    this.y *= y;
    this.z *= z;
    return this;
  };
  _proto.divide = function divide(other) {
    this.x /= other.x;
    this.y /= other.y;
    this.z /= other.z;
    return this;
  };
  _proto.divide3f = function divide3f(x, y, z) {
    this.x /= x;
    this.y /= y;
    this.z /= z;
    return this;
  };
  _proto.negative = function negative() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  };
  _proto.clampf = function clampf(minInclusive, maxInclusive) {
    this.x = clamp(this.x, minInclusive.x, maxInclusive.x);
    this.y = clamp(this.y, minInclusive.y, maxInclusive.y);
    this.z = clamp(this.z, minInclusive.z, maxInclusive.z);
    return this;
  };
  _proto.dot = function dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  };
  _proto.cross = function cross(other) {
    var ax = this.x,
      ay = this.y,
      az = this.z;
    var bx = other.x,
      by = other.y,
      bz = other.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  };
  _proto.length = function length() {
    var self = this;
    return sqrt$4(self.x * self.x + self.y * self.y + self.z * self.z);
  };
  _proto.lengthSqr = function lengthSqr() {
    var self = this;
    return self.x * self.x + self.y * self.y + self.z * self.z;
  };
  _proto.normalize = function normalize() {
    var self = this;
    var x = self.x;
    var y = self.y;
    var z = self.z;
    var len = x * x + y * y + z * z;
    if (len > 0) {
      len = 1 / sqrt$4(len);
      self.x = x * len;
      self.y = y * len;
      self.z = z * len;
    }
    return self;
  };
  _proto.transformMat4 = function transformMat4(matrix) {
    var self = this;
    var x = self.x;
    var y = self.y;
    var z = self.z;
    var rhw = matrix.m03 * x + matrix.m07 * y + matrix.m11 * z + matrix.m15;
    rhw = rhw ? 1 / rhw : 1;
    self.x = (matrix.m00 * x + matrix.m04 * y + matrix.m08 * z + matrix.m12) * rhw;
    self.y = (matrix.m01 * x + matrix.m05 * y + matrix.m09 * z + matrix.m13) * rhw;
    self.z = (matrix.m02 * x + matrix.m06 * y + matrix.m10 * z + matrix.m14) * rhw;
    return self;
  };
  _proto.toVec2 = function toVec2() {
    return new legacyCC.Vec2(this.x, this.y);
  };
  return Vec3;
}(ValueType);
_Vec = Vec3;
Vec3.UNIT_X = freezeVec3(1, 0, 0);
Vec3.UNIT_Y = freezeVec3(0, 1, 0);
Vec3.UNIT_Z = freezeVec3(0, 0, 1);
Vec3.RIGHT = freezeVec3(1, 0, 0);
Vec3.UP = freezeVec3(0, 1, 0);
Vec3.FORWARD = freezeVec3(0, 0, -1);
Vec3.ZERO = freezeVec3(0, 0, 0);
Vec3.ONE = freezeVec3(1, 1, 1);
Vec3.NEG_ONE = freezeVec3(-1, -1, -1);
Vec3.slerp = function () {
  var cacheV1 = new _Vec();
  var cacheV2 = new _Vec();
  var cacheV3 = new _Vec();
  return function (out, from, to, t) {
    var EPSILON = 1e-5;
    var lenFrom = _Vec.len(from);
    var lenTo = _Vec.len(to);
    if (lenFrom < EPSILON || lenTo < EPSILON) {
      return _Vec.lerp(out, from, to, t);
    }
    var lenLerped = lerp(lenFrom, lenTo, t);
    var dot = _Vec.dot(from, to) / (lenFrom * lenTo);
    if (dot > 1.0 - EPSILON) {
      return _Vec.lerp(out, from, to, t);
    } else if (dot < -1 + EPSILON) {
      var fromNormalized = _Vec.multiplyScalar(cacheV1, from, 1.0 / lenFrom);
      var axis = _Vec.generateOrthogonal(cacheV2, fromNormalized);
      var angle = PI$2 * t;
      rotateAxisAngle(cacheV3, fromNormalized, axis, angle);
      _Vec.multiplyScalar(out, cacheV3, lenLerped);
      return out;
    } else {
      var dotClamped = dot;
      var theta = acos$3(dotClamped) * t;
      var _fromNormalized = _Vec.multiplyScalar(cacheV1, from, 1.0 / lenFrom);
      var toNormalized = _Vec.multiplyScalar(cacheV2, to, 1.0 / lenTo);
      _Vec.scaleAndAdd(cacheV3, toNormalized, _fromNormalized, -dotClamped);
      _Vec.normalize(cacheV3, cacheV3);
      _Vec.multiplyScalar(cacheV3, cacheV3, sin$3(theta));
      _Vec.scaleAndAdd(cacheV3, cacheV3, _fromNormalized, cos$4(theta));
      _Vec.multiplyScalar(out, cacheV3, lenLerped);
      return out;
    }
  };
}();
Vec3.signedAngle = function () {
  var cacheCross = new _Vec();
  return function (a, b, normal) {
    var angle = _Vec.angle(a, b);
    var cross = _Vec.cross(cacheCross, a, b);
    var dot = _Vec.dot(cross, normal);
    return dot < 0 ? -angle : angle;
  };
}();
CCClass.fastDefine('cc.Vec3', Vec3, {
  x: 0,
  y: 0,
  z: 0
});
legacyCC.Vec3 = Vec3;
function v3(x, y, z) {
  return new Vec3(x, y, z);
}
var rotateAxisAngle = function () {
  var cacheQ = {
    x: 0.0,
    y: 0.0,
    z: 0.0,
    w: 0.0
  };
  return function (out, input, axis, angle) {
    var rad = angle * 0.5;
    var s = sin$3(rad);
    cacheQ.x = s * axis.x;
    cacheQ.y = s * axis.y;
    cacheQ.z = s * axis.z;
    cacheQ.w = cos$4(rad);
    Vec3.transformQuat(out, input, cacheQ);
    return out;
  };
}();
legacyCC.v3 = v3;

var toFloat = 1 / 255;
var R_INDEX = 0;
var G_INDEX = 1;
var B_INDEX = 2;
var A_INDEX = 3;
var mathAbs$3 = Math.abs;
var mathMax$1 = Math.max;
function freezeColor(r, g, b, a) {
  return Object.freeze(new Color(r, g, b, a));
}
var Color = function (_ValueType) {
  function Color(r, g, b, a) {
    var _this;
    _this = _ValueType.call(this) || this;
    _this._data = new Uint8ClampedArray(4);
    if (typeof r === 'string') {
      _this.fromHEX(r);
    } else if (g !== undefined) {
      _this.set(r, g, b, a);
    } else {
      _this.set(r);
    }
    return _this;
  }
  _inheritsLoose(Color, _ValueType);
  Color.clone = function clone(a) {
    var out = new Color();
    out.r = a.r;
    out.g = a.g;
    out.b = a.b;
    out.a = a.a;
    return out;
  };
  Color.copy = function copy(out, a) {
    out.r = a.r;
    out.g = a.g;
    out.b = a.b;
    out.a = a.a;
    return out;
  };
  Color.set = function set(out, r, g, b, a) {
    out.r = r;
    out.g = g;
    out.b = b;
    out.a = a;
    return out;
  };
  Color.toVec4 = function toVec4(color, out) {
    var sourceData = color._data;
    out = out !== undefined ? out : new Vec4();
    out.x = sourceData[R_INDEX] * toFloat;
    out.y = sourceData[G_INDEX] * toFloat;
    out.z = sourceData[B_INDEX] * toFloat;
    out.w = sourceData[A_INDEX] * toFloat;
    return out;
  };
  Color.fromVec4 = function fromVec4(value, out) {
    out = out === undefined ? new Color() : out;
    var outData = out._data;
    outData[R_INDEX] = value.x / toFloat;
    outData[G_INDEX] = value.y / toFloat;
    outData[B_INDEX] = value.z / toFloat;
    outData[A_INDEX] = value.w / toFloat;
    return out;
  };
  Color.fromHEX = function fromHEX(out, hex) {
    var hexNumber;
    if (typeof hex === 'string') {
      hex = hex[0] === '#' ? hex.substring(1) : hex;
      if (hex.length === 6) {
        hex += 'FF';
      } else if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + "FF";
      } else if (hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      hexNumber = Number("0x" + hex);
    } else {
      if (hex < 0x1000000) {
        hex = (hex << 8) + 0xff;
      }
      hexNumber = hex;
    }
    out.r = hexNumber >>> 24;
    out.g = (hexNumber & 0x00ff0000) >>> 16;
    out.b = (hexNumber & 0x0000ff00) >>> 8;
    out.a = hexNumber & 0x000000ff;
    return out;
  };
  Color.add = function add(out, a, b) {
    out.r = a.r + b.r;
    out.g = a.g + b.g;
    out.b = a.b + b.b;
    out.a = a.a + b.a;
    return out;
  };
  Color.subtract = function subtract(out, a, b) {
    out.r = a.r - b.r;
    out.g = a.g - b.g;
    out.b = a.b - b.b;
    out.a = a.a - b.a;
    return out;
  };
  Color.multiply = function multiply(out, a, b) {
    out.r = a.r * b.r;
    out.g = a.g * b.g;
    out.b = a.b * b.b;
    out.a = a.a * b.a;
    return out;
  };
  Color.divide = function divide(out, a, b) {
    out.r = a.r / b.r;
    out.g = a.g / b.g;
    out.b = a.b / b.b;
    out.a = a.a / b.a;
    return out;
  };
  Color.scale = function scale(out, a, b) {
    out.r = a.r * b;
    out.g = a.g * b;
    out.b = a.b * b;
    out.a = a.a * b;
    return out;
  };
  Color.lerp = function lerp(out, from, to, ratio) {
    var fromR = from.r;
    var fromG = from.g;
    var fromB = from.b;
    var fromA = from.a;
    out.r = fromR + (to.r - fromR) * ratio;
    out.g = fromG + (to.g - fromG) * ratio;
    out.b = fromB + (to.b - fromB) * ratio;
    out.a = fromA + (to.a - fromA) * ratio;
    return out;
  };
  Color.toArray = function toArray(out, a, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    var scale = a instanceof Color || a.a > 1 ? 1 / 255 : 1;
    out[ofs + 0] = a.r * scale;
    out[ofs + 1] = a.g * scale;
    out[ofs + 2] = a.b * scale;
    out[ofs + 3] = a.a * scale;
    return out;
  };
  Color.fromArray = function fromArray(arr, out, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out.r = arr[ofs + 0] * 255;
    out.g = arr[ofs + 1] * 255;
    out.b = arr[ofs + 2] * 255;
    out.a = arr[ofs + 3] * 255;
    return out;
  };
  Color.fromUint32 = function fromUint32(out, uint32) {
    uint32 >>>= 0;
    out.r = uint32 & 0xff;
    out.g = uint32 >> 8 & 0xff;
    out.b = uint32 >> 16 & 0xff;
    out.a = uint32 >> 24 & 0xff;
    return out;
  };
  Color.toUint32 = function toUint32(color) {
    return (color.a << 24 | color.b << 16 | color.g << 8 | color.r) >>> 0;
  };
  Color.strictEquals = function strictEquals(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  };
  Color.equals = function equals(a, b, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    var hasInf = mathAbs$3(a.r) === Infinity || mathAbs$3(a.g) === Infinity || mathAbs$3(a.b) === Infinity || mathAbs$3(a.a) === Infinity;
    return !hasInf && mathAbs$3(a.r - b.r) <= epsilon * mathMax$1(1.0, mathAbs$3(a.r), mathAbs$3(b.r)) && mathAbs$3(a.g - b.g) <= epsilon * mathMax$1(1.0, mathAbs$3(a.g), mathAbs$3(b.g)) && mathAbs$3(a.b - b.b) <= epsilon * mathMax$1(1.0, mathAbs$3(a.b), mathAbs$3(b.b)) && mathAbs$3(a.a - b.a) <= epsilon * mathMax$1(1.0, mathAbs$3(a.a), mathAbs$3(b.a));
  };
  Color.hex = function hex(a) {
    return (a.r * 255 << 24 | a.g * 255 << 16 | a.b * 255 << 8 | a.a * 255) >>> 0;
  };
  var _proto = Color.prototype;
  _proto.clone = function clone() {
    var ret = new Color();
    ret._data.set(this._data);
    return ret;
  };
  _proto.equals = function equals(other) {
    var otherColor = other;
    var thisData = this._data;
    return other && thisData[R_INDEX] === otherColor.r && thisData[G_INDEX] === otherColor.g && thisData[B_INDEX] === otherColor.b && thisData[A_INDEX] === otherColor.a;
  };
  _proto.lerp = function lerp(to, ratio) {
    Color.lerp(this, this, to, ratio);
    return this;
  };
  _proto.toString = function toString() {
    return "rgba(" + this.r.toFixed() + ", " + this.g.toFixed() + ", " + this.b.toFixed() + ", " + this.a.toFixed() + ")";
  };
  _proto.toCSS = function toCSS(opt) {
    if (opt === void 0) {
      opt = 'rgba';
    }
    if (opt === 'rgba') {
      return "rgba(" + this.r + "," + this.g + "," + this.b + "," + (this.a * toFloat).toFixed(2) + ")";
    } else if (opt === 'rgb') {
      return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    } else {
      return "#" + this.toHEX(opt);
    }
  };
  _proto.fromHEX = function fromHEX(hex) {
    var hexNumber;
    if (typeof hex === 'string') {
      hex = hex[0] === '#' ? hex.substring(1) : hex;
      if (hex.length === 6) {
        hex += 'FF';
      } else if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + "FF";
      } else if (hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      hexNumber = Number("0x" + hex);
    } else {
      if (hex < 0x1000000) {
        hex = (hex << 8) + 0xff;
      }
      hexNumber = hex;
    }
    this.r = hexNumber >>> 24;
    this.g = (hexNumber & 0x00ff0000) >>> 16;
    this.b = (hexNumber & 0x0000ff00) >>> 8;
    this.a = hexNumber & 0x000000ff;
    return this;
  };
  _proto.toHEX = function toHEX(fmt) {
    if (fmt === void 0) {
      fmt = '#rrggbb';
    }
    var thisData = this._data;
    var prefix = '0';
    var hex = [(thisData[R_INDEX] < 16 ? prefix : '') + thisData[R_INDEX].toString(16), (thisData[G_INDEX] < 16 ? prefix : '') + thisData[G_INDEX].toString(16), (thisData[B_INDEX] < 16 ? prefix : '') + thisData[B_INDEX].toString(16)];
    if (fmt === '#rgb') {
      hex[0] = hex[0][0];
      hex[1] = hex[1][0];
      hex[2] = hex[2][0];
    } else if (fmt === '#rrggbbaa') {
      hex.push((thisData[A_INDEX] < 16 ? prefix : '') + thisData[A_INDEX].toString(16));
    }
    return hex.join('');
  };
  _proto.toRGBValue = function toRGBValue() {
    return this._data[B_INDEX] << 16 | this._data[G_INDEX] << 8 | this._data[R_INDEX];
  };
  _proto.fromHSV = function fromHSV(h, s, v) {
    var r = 0;
    var g = 0;
    var b = 0;
    if (s === 0) {
      r = g = b = v;
    } else if (v === 0) {
      r = g = b = 0;
    } else {
      if (h === 1) {
        h = 0;
      }
      h *= 6;
      var i = Math.floor(h);
      var f = h - i;
      var p = v * (1 - s);
      var q = v * (1 - s * f);
      var t = v * (1 - s * (1 - f));
      switch (i) {
        default:
          assertIsTrue(false);
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
      }
    }
    var thisData = this._data;
    thisData[R_INDEX] = r * 255;
    thisData[G_INDEX] = g * 255;
    thisData[B_INDEX] = b * 255;
    return this;
  };
  _proto.toHSV = function toHSV() {
    var r = this._data[R_INDEX] * toFloat;
    var g = this._data[G_INDEX] * toFloat;
    var b = this._data[B_INDEX] * toFloat;
    var hsv = {
      h: 0,
      s: 0,
      v: 0
    };
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var delta = 0;
    hsv.v = max;
    hsv.s = max ? (max - min) / max : 0;
    if (!hsv.s) {
      hsv.h = 0;
    } else {
      delta = max - min;
      if (r === max) {
        hsv.h = (g - b) / delta;
      } else if (g === max) {
        hsv.h = 2 + (b - r) / delta;
      } else {
        hsv.h = 4 + (r - g) / delta;
      }
      hsv.h /= 6;
      if (hsv.h < 0) {
        hsv.h += 1.0;
      }
    }
    return hsv;
  };
  _proto.set = function set(r, g, b, a) {
    var thisData = this._data;
    if (typeof r === 'object') {
      var _other = r;
      if (_other._data) {
        thisData.set(_other._data);
      } else {
        var _other$r, _other$g, _other$b, _other$a;
        thisData[R_INDEX] = (_other$r = _other.r) !== null && _other$r !== void 0 ? _other$r : 0;
        thisData[G_INDEX] = (_other$g = _other.g) !== null && _other$g !== void 0 ? _other$g : 0;
        thisData[B_INDEX] = (_other$b = _other.b) !== null && _other$b !== void 0 ? _other$b : 0;
        thisData[A_INDEX] = (_other$a = _other.a) !== null && _other$a !== void 0 ? _other$a : 255;
      }
    } else {
      thisData[R_INDEX] = r !== null && r !== void 0 ? r : 0;
      thisData[G_INDEX] = g !== null && g !== void 0 ? g : 0;
      thisData[B_INDEX] = b !== null && b !== void 0 ? b : 0;
      thisData[A_INDEX] = a !== null && a !== void 0 ? a : 255;
    }
    return this;
  };
  _proto.multiply = function multiply(other) {
    var thisData = this._data;
    thisData[R_INDEX] *= other.r / 255;
    thisData[G_INDEX] *= other.g / 255;
    thisData[B_INDEX] *= other.b / 255;
    thisData[A_INDEX] *= other.a / 255;
    return this;
  };
  _proto.getModifiableProperties = function getModifiableProperties() {
    return ['r', 'g', 'b', 'a'];
  };
  return _createClass(Color, [{
    key: "r",
    get: function get() {
      return this._data[R_INDEX];
    },
    set: function set(red) {
      this._data[R_INDEX] = red;
    }
  }, {
    key: "g",
    get: function get() {
      return this._data[G_INDEX];
    },
    set: function set(green) {
      this._data[G_INDEX] = green;
    }
  }, {
    key: "b",
    get: function get() {
      return this._data[B_INDEX];
    },
    set: function set(blue) {
      this._data[B_INDEX] = blue;
    }
  }, {
    key: "a",
    get: function get() {
      return this._data[A_INDEX];
    },
    set: function set(alpha) {
      this._data[A_INDEX] = alpha;
    }
  }, {
    key: "x",
    get: function get() {
      return this._data[R_INDEX] * toFloat;
    },
    set: function set(value) {
      this._data[R_INDEX] = value * 255;
    }
  }, {
    key: "y",
    get: function get() {
      return this._data[G_INDEX] * toFloat;
    },
    set: function set(value) {
      this._data[G_INDEX] = value * 255;
    }
  }, {
    key: "z",
    get: function get() {
      return this._data[B_INDEX] * toFloat;
    },
    set: function set(value) {
      this._data[B_INDEX] = value * 255;
    }
  }, {
    key: "w",
    get: function get() {
      return this._data[A_INDEX] * toFloat;
    },
    set: function set(value) {
      this._data[A_INDEX] = value * 255;
    }
  }]);
}(ValueType);
Color.WHITE = freezeColor(255, 255, 255, 255);
Color.GRAY = freezeColor(127, 127, 127, 255);
Color.BLACK = freezeColor(0, 0, 0, 255);
Color.TRANSPARENT = freezeColor(0, 0, 0, 0);
Color.RED = freezeColor(255, 0, 0, 255);
Color.GREEN = freezeColor(0, 255, 0, 255);
Color.BLUE = freezeColor(0, 0, 255, 255);
Color.CYAN = freezeColor(0, 255, 255, 255);
Color.MAGENTA = freezeColor(255, 0, 255, 255);
Color.YELLOW = freezeColor(255, 255, 0, 255);
CCClass.fastDefine('cc.Color', Color, {
  r: 0,
  g: 0,
  b: 0,
  a: 255
});
legacyCC.Color = Color;
function color(r, g, b, a) {
  return new Color(r, g, b, a);
}
legacyCC.color = color;
function clampVec3(val, min, max) {
  if (min > max) {
    var temp = min;
    min = max;
    max = temp;
  }
  return val < min ? min : val > max ? max : val;
}
function floorVec3(val) {
  var temp = val.clone();
  temp.x = Math.floor(val.x);
  temp.y = Math.floor(val.y);
  temp.z = Math.floor(val.z);
  return temp;
}
function stepVec3(a, b) {
  if (a < b) {
    return b;
  } else {
    return a;
  }
}
function packRGBE(rgb) {
  var maxComp = Math.max(Math.max(rgb.x, rgb.y), rgb.z);
  var e = 128.0;
  if (maxComp > 0.0001) {
    e = Math.log(maxComp) / Math.log(1.1);
    e = Math.ceil(e);
    e = clamp(e + 128.0, 0.0, 255.0);
  }
  var sc = 1.0 / Math.pow(1.1, e - 128.0);
  var encode = clampVec3(rgb.multiplyScalar(sc), new Vec3(0.0, 0.0, 0.0), new Vec3(1.0, 1.0, 1.0));
  encode.multiplyScalar(255.0);
  var encode_rounded = floorVec3(encode).add(stepVec3(encode.subtract(floorVec3(encode)), new Vec3(0.5, 0.5, 0.5)));
  return new Vec4(encode_rounded.x / 255.0, encode_rounded.y / 255.0, encode_rounded.z / 255.0, e / 255.0);
}

var _Mat$1;
var abs$3 = Math.abs;
var max$5 = Math.max;
var Mat3 = function (_ValueType) {
  function Mat3(m00, m01, m02, m03, m04, m05, m06, m07, m08) {
    var _this;
    if (m00 === void 0) {
      m00 = 1;
    }
    if (m01 === void 0) {
      m01 = 0;
    }
    if (m02 === void 0) {
      m02 = 0;
    }
    if (m03 === void 0) {
      m03 = 0;
    }
    if (m04 === void 0) {
      m04 = 1;
    }
    if (m05 === void 0) {
      m05 = 0;
    }
    if (m06 === void 0) {
      m06 = 0;
    }
    if (m07 === void 0) {
      m07 = 0;
    }
    if (m08 === void 0) {
      m08 = 1;
    }
    _this = _ValueType.call(this) || this;
    var self = _this;
    if (typeof m00 === 'object') {
      self.m00 = m00.m00;
      self.m01 = m00.m01;
      self.m02 = m00.m02;
      self.m03 = m00.m03;
      self.m04 = m00.m04;
      self.m05 = m00.m05;
      self.m06 = m00.m06;
      self.m07 = m00.m07;
      self.m08 = m00.m08;
    } else {
      self.m00 = m00;
      self.m01 = m01;
      self.m02 = m02;
      self.m03 = m03;
      self.m04 = m04;
      self.m05 = m05;
      self.m06 = m06;
      self.m07 = m07;
      self.m08 = m08;
    }
    return _this;
  }
  _inheritsLoose(Mat3, _ValueType);
  Mat3.clone = function clone(a) {
    return new Mat3(a.m00, a.m01, a.m02, a.m03, a.m04, a.m05, a.m06, a.m07, a.m08);
  };
  Mat3.copy = function copy(out, a) {
    out.m00 = a.m00;
    out.m01 = a.m01;
    out.m02 = a.m02;
    out.m03 = a.m03;
    out.m04 = a.m04;
    out.m05 = a.m05;
    out.m06 = a.m06;
    out.m07 = a.m07;
    out.m08 = a.m08;
    return out;
  };
  Mat3.set = function set(out, m00, m01, m02, m03, m04, m05, m06, m07, m08) {
    out.m00 = m00;
    out.m01 = m01;
    out.m02 = m02;
    out.m03 = m03;
    out.m04 = m04;
    out.m05 = m05;
    out.m06 = m06;
    out.m07 = m07;
    out.m08 = m08;
    return out;
  };
  Mat3.identity = function identity(out) {
    out.m00 = 1;
    out.m01 = 0;
    out.m02 = 0;
    out.m03 = 0;
    out.m04 = 1;
    out.m05 = 0;
    out.m06 = 0;
    out.m07 = 0;
    out.m08 = 1;
    return out;
  };
  Mat3.transpose = function transpose(out, a) {
    if (out === a) {
      var a01 = a.m01;
      var a02 = a.m02;
      var a12 = a.m05;
      out.m01 = a.m03;
      out.m02 = a.m06;
      out.m03 = a01;
      out.m05 = a.m07;
      out.m06 = a02;
      out.m07 = a12;
    } else {
      out.m00 = a.m00;
      out.m01 = a.m03;
      out.m02 = a.m06;
      out.m03 = a.m01;
      out.m04 = a.m04;
      out.m05 = a.m07;
      out.m06 = a.m02;
      out.m07 = a.m05;
      out.m08 = a.m08;
    }
    return out;
  };
  Mat3.invert = function invert(out, a) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a10 = a.m03;
    var a11 = a.m04;
    var a12 = a.m05;
    var a20 = a.m06;
    var a21 = a.m07;
    var a22 = a.m08;
    var b01 = a22 * a11 - a12 * a21;
    var b11 = -a22 * a10 + a12 * a20;
    var b21 = a21 * a10 - a11 * a20;
    var det = a00 * b01 + a01 * b11 + a02 * b21;
    if (det === 0) {
      Mat3.set(out, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      return out;
    }
    det = 1.0 / det;
    out.m00 = b01 * det;
    out.m01 = (-a22 * a01 + a02 * a21) * det;
    out.m02 = (a12 * a01 - a02 * a11) * det;
    out.m03 = b11 * det;
    out.m04 = (a22 * a00 - a02 * a20) * det;
    out.m05 = (-a12 * a00 + a02 * a10) * det;
    out.m06 = b21 * det;
    out.m07 = (-a21 * a00 + a01 * a20) * det;
    out.m08 = (a11 * a00 - a01 * a10) * det;
    return out;
  };
  Mat3.determinant = function determinant(a) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a10 = a.m03;
    var a11 = a.m04;
    var a12 = a.m05;
    var a20 = a.m06;
    var a21 = a.m07;
    var a22 = a.m08;
    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
  };
  Mat3.multiply = function multiply(out, a, b) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a10 = a.m03;
    var a11 = a.m04;
    var a12 = a.m05;
    var a20 = a.m06;
    var a21 = a.m07;
    var a22 = a.m08;
    var b00 = b.m00;
    var b01 = b.m01;
    var b02 = b.m02;
    var b10 = b.m03;
    var b11 = b.m04;
    var b12 = b.m05;
    var b20 = b.m06;
    var b21 = b.m07;
    var b22 = b.m08;
    out.m00 = b00 * a00 + b01 * a10 + b02 * a20;
    out.m01 = b00 * a01 + b01 * a11 + b02 * a21;
    out.m02 = b00 * a02 + b01 * a12 + b02 * a22;
    out.m03 = b10 * a00 + b11 * a10 + b12 * a20;
    out.m04 = b10 * a01 + b11 * a11 + b12 * a21;
    out.m05 = b10 * a02 + b11 * a12 + b12 * a22;
    out.m06 = b20 * a00 + b21 * a10 + b22 * a20;
    out.m07 = b20 * a01 + b21 * a11 + b22 * a21;
    out.m08 = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
  };
  Mat3.multiplyMat4 = function multiplyMat4(out, a, b) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a10 = a.m03;
    var a11 = a.m04;
    var a12 = a.m05;
    var a20 = a.m06;
    var a21 = a.m07;
    var a22 = a.m08;
    var b00 = b.m00;
    var b01 = b.m01;
    var b02 = b.m02;
    var b10 = b.m04;
    var b11 = b.m05;
    var b12 = b.m06;
    var b20 = b.m08;
    var b21 = b.m09;
    var b22 = b.m10;
    out.m00 = b00 * a00 + b01 * a10 + b02 * a20;
    out.m01 = b00 * a01 + b01 * a11 + b02 * a21;
    out.m02 = b00 * a02 + b01 * a12 + b02 * a22;
    out.m03 = b10 * a00 + b11 * a10 + b12 * a20;
    out.m04 = b10 * a01 + b11 * a11 + b12 * a21;
    out.m05 = b10 * a02 + b11 * a12 + b12 * a22;
    out.m06 = b20 * a00 + b21 * a10 + b22 * a20;
    out.m07 = b20 * a01 + b21 * a11 + b22 * a21;
    out.m08 = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
  };
  Mat3.transform = function transform(out, a, v) {
    this.translate(out, a, v);
  };
  Mat3.translate = function translate(out, a, v) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a10 = a.m03;
    var a11 = a.m04;
    var a12 = a.m05;
    var a20 = a.m06;
    var a21 = a.m07;
    var a22 = a.m08;
    var x = v.x;
    var y = v.y;
    out.m00 = a00;
    out.m01 = a01;
    out.m02 = a02;
    out.m03 = a10;
    out.m04 = a11;
    out.m05 = a12;
    out.m06 = x * a00 + y * a10 + a20;
    out.m07 = x * a01 + y * a11 + a21;
    out.m08 = x * a02 + y * a12 + a22;
    return out;
  };
  Mat3.scale = function scale(out, a, v) {
    var x = v.x;
    var y = v.y;
    out.m00 = x * a.m00;
    out.m01 = x * a.m01;
    out.m02 = x * a.m02;
    out.m03 = y * a.m03;
    out.m04 = y * a.m04;
    out.m05 = y * a.m05;
    out.m06 = a.m06;
    out.m07 = a.m07;
    out.m08 = a.m08;
    return out;
  };
  Mat3.rotate = function rotate(out, a, rad) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a10 = a.m03;
    var a11 = a.m04;
    var a12 = a.m05;
    var a20 = a.m06;
    var a21 = a.m07;
    var a22 = a.m08;
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    out.m00 = c * a00 + s * a10;
    out.m01 = c * a01 + s * a11;
    out.m02 = c * a02 + s * a12;
    out.m03 = c * a10 - s * a00;
    out.m04 = c * a11 - s * a01;
    out.m05 = c * a12 - s * a02;
    out.m06 = a20;
    out.m07 = a21;
    out.m08 = a22;
    return out;
  };
  Mat3.fromMat4 = function fromMat4(out, a) {
    out.m00 = a.m00;
    out.m01 = a.m01;
    out.m02 = a.m02;
    out.m03 = a.m04;
    out.m04 = a.m05;
    out.m05 = a.m06;
    out.m06 = a.m08;
    out.m07 = a.m09;
    out.m08 = a.m10;
    return out;
  };
  Mat3.fromViewUp = function fromViewUp(out, view, up) {
    if (Vec3.lengthSqr(view) < EPSILON * EPSILON) {
      Mat3.identity(out);
      return out;
    }
    up = up || Vec3.UNIT_Y;
    Vec3.normalize(v3_1$2, Vec3.cross(v3_1$2, up, view));
    if (Vec3.lengthSqr(v3_1$2) < EPSILON * EPSILON) {
      Mat3.identity(out);
      return out;
    }
    Vec3.cross(v3_2, view, v3_1$2);
    Mat3.set(out, v3_1$2.x, v3_1$2.y, v3_1$2.z, v3_2.x, v3_2.y, v3_2.z, view.x, view.y, view.z);
    return out;
  };
  Mat3.fromTranslation = function fromTranslation(out, v) {
    out.m00 = 1;
    out.m01 = 0;
    out.m02 = 0;
    out.m03 = 0;
    out.m04 = 1;
    out.m05 = 0;
    out.m06 = v.x;
    out.m07 = v.y;
    out.m08 = 1;
    return out;
  };
  Mat3.fromScaling = function fromScaling(out, v) {
    out.m00 = v.x;
    out.m01 = 0;
    out.m02 = 0;
    out.m03 = 0;
    out.m04 = v.y;
    out.m05 = 0;
    out.m06 = 0;
    out.m07 = 0;
    out.m08 = 1;
    return out;
  };
  Mat3.fromRotation = function fromRotation(out, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    out.m00 = c;
    out.m01 = s;
    out.m02 = 0;
    out.m03 = -s;
    out.m04 = c;
    out.m05 = 0;
    out.m06 = 0;
    out.m07 = 0;
    out.m08 = 1;
    return out;
  };
  Mat3.fromQuat = function fromQuat(out, q) {
    var x = q.x;
    var y = q.y;
    var z = q.z;
    var w = q.w;
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var yx = y * x2;
    var yy = y * y2;
    var zx = z * x2;
    var zy = z * y2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    out.m00 = 1 - yy - zz;
    out.m03 = yx - wz;
    out.m06 = zx + wy;
    out.m01 = yx + wz;
    out.m04 = 1 - xx - zz;
    out.m07 = zy - wx;
    out.m02 = zx - wy;
    out.m05 = zy + wx;
    out.m08 = 1 - xx - yy;
    return out;
  };
  Mat3.inverseTransposeMat4 = function inverseTransposeMat4(out, a) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a03 = a.m03;
    var a10 = a.m04;
    var a11 = a.m05;
    var a12 = a.m06;
    var a13 = a.m07;
    var a20 = a.m08;
    var a21 = a.m09;
    var a22 = a.m10;
    var a23 = a.m11;
    var a30 = a.m12;
    var a31 = a.m13;
    var a32 = a.m14;
    var a33 = a.m15;
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1.0 / det;
    out.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out.m01 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out.m02 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out.m03 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out.m04 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out.m05 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out.m06 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out.m07 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out.m08 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    return out;
  };
  Mat3.toArray = function toArray(out, m, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out[ofs + 0] = m.m00;
    out[ofs + 1] = m.m01;
    out[ofs + 2] = m.m02;
    out[ofs + 3] = m.m03;
    out[ofs + 4] = m.m04;
    out[ofs + 5] = m.m05;
    out[ofs + 6] = m.m06;
    out[ofs + 7] = m.m07;
    out[ofs + 8] = m.m08;
    return out;
  };
  Mat3.fromArray = function fromArray(out, arr, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out.m00 = arr[ofs + 0];
    out.m01 = arr[ofs + 1];
    out.m02 = arr[ofs + 2];
    out.m03 = arr[ofs + 3];
    out.m04 = arr[ofs + 4];
    out.m05 = arr[ofs + 5];
    out.m06 = arr[ofs + 6];
    out.m07 = arr[ofs + 7];
    out.m08 = arr[ofs + 8];
    return out;
  };
  Mat3.add = function add(out, a, b) {
    out.m00 = a.m00 + b.m00;
    out.m01 = a.m01 + b.m01;
    out.m02 = a.m02 + b.m02;
    out.m03 = a.m03 + b.m03;
    out.m04 = a.m04 + b.m04;
    out.m05 = a.m05 + b.m05;
    out.m06 = a.m06 + b.m06;
    out.m07 = a.m07 + b.m07;
    out.m08 = a.m08 + b.m08;
    return out;
  };
  Mat3.subtract = function subtract(out, a, b) {
    out.m00 = a.m00 - b.m00;
    out.m01 = a.m01 - b.m01;
    out.m02 = a.m02 - b.m02;
    out.m03 = a.m03 - b.m03;
    out.m04 = a.m04 - b.m04;
    out.m05 = a.m05 - b.m05;
    out.m06 = a.m06 - b.m06;
    out.m07 = a.m07 - b.m07;
    out.m08 = a.m08 - b.m08;
    return out;
  };
  Mat3.multiplyScalar = function multiplyScalar(out, a, b) {
    out.m00 = a.m00 * b;
    out.m01 = a.m01 * b;
    out.m02 = a.m02 * b;
    out.m03 = a.m03 * b;
    out.m04 = a.m04 * b;
    out.m05 = a.m05 * b;
    out.m06 = a.m06 * b;
    out.m07 = a.m07 * b;
    out.m08 = a.m08 * b;
    return out;
  };
  Mat3.multiplyScalarAndAdd = function multiplyScalarAndAdd(out, a, b, scale) {
    out.m00 = b.m00 * scale + a.m00;
    out.m01 = b.m01 * scale + a.m01;
    out.m02 = b.m02 * scale + a.m02;
    out.m03 = b.m03 * scale + a.m03;
    out.m04 = b.m04 * scale + a.m04;
    out.m05 = b.m05 * scale + a.m05;
    out.m06 = b.m06 * scale + a.m06;
    out.m07 = b.m07 * scale + a.m07;
    out.m08 = b.m08 * scale + a.m08;
    return out;
  };
  Mat3.strictEquals = function strictEquals(a, b) {
    return a.m00 === b.m00 && a.m01 === b.m01 && a.m02 === b.m02 && a.m03 === b.m03 && a.m04 === b.m04 && a.m05 === b.m05 && a.m06 === b.m06 && a.m07 === b.m07 && a.m08 === b.m08;
  };
  Mat3.equals = function equals(a, b, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return abs$3(a.m00 - b.m00) <= epsilon * max$5(1.0, abs$3(a.m00), abs$3(b.m00)) && abs$3(a.m01 - b.m01) <= epsilon * max$5(1.0, abs$3(a.m01), abs$3(b.m01)) && abs$3(a.m02 - b.m02) <= epsilon * max$5(1.0, abs$3(a.m02), abs$3(b.m02)) && abs$3(a.m03 - b.m03) <= epsilon * max$5(1.0, abs$3(a.m03), abs$3(b.m03)) && abs$3(a.m04 - b.m04) <= epsilon * max$5(1.0, abs$3(a.m04), abs$3(b.m04)) && abs$3(a.m05 - b.m05) <= epsilon * max$5(1.0, abs$3(a.m05), abs$3(b.m05)) && abs$3(a.m06 - b.m06) <= epsilon * max$5(1.0, abs$3(a.m06), abs$3(b.m06)) && abs$3(a.m07 - b.m07) <= epsilon * max$5(1.0, abs$3(a.m07), abs$3(b.m07)) && abs$3(a.m08 - b.m08) <= epsilon * max$5(1.0, abs$3(a.m08), abs$3(b.m08));
  };
  Mat3.toEuler = function toEuler(matrix, v) {
    var a00 = matrix.m00;
    var a01 = matrix.m01;
    matrix.m02;
    var a10 = matrix.m03;
    var a11 = matrix.m04;
    matrix.m05;
    var a20 = matrix.m06;
    var a21 = matrix.m07;
    var a22 = matrix.m08;
    if (a21 < 0.999) {
      if (a21 > -0.999) {
        v.x = Math.asin(-a21);
        v.y = Math.atan2(a20, a22);
        v.z = Math.atan2(a01, a11);
        return true;
      } else {
        v.x = HALF_PI;
        v.y = Math.atan2(a10, a00);
        v.z = 0.0;
        return false;
      }
    } else {
      v.x = -HALF_PI;
      v.y = Math.atan2(-a10, a00);
      v.z = 0.0;
      return false;
    }
  };
  var _proto = Mat3.prototype;
  _proto.clone = function clone() {
    return new Mat3(this);
  };
  _proto.set = function set(m00, m01, m02, m03, m04, m05, m06, m07, m08) {
    if (m00 === void 0) {
      m00 = 1;
    }
    if (m01 === void 0) {
      m01 = 0;
    }
    if (m02 === void 0) {
      m02 = 0;
    }
    if (m03 === void 0) {
      m03 = 0;
    }
    if (m04 === void 0) {
      m04 = 1;
    }
    if (m05 === void 0) {
      m05 = 0;
    }
    if (m06 === void 0) {
      m06 = 0;
    }
    if (m07 === void 0) {
      m07 = 0;
    }
    if (m08 === void 0) {
      m08 = 1;
    }
    var self = this;
    if (typeof m00 === 'object') {
      self.m00 = m00.m00;
      self.m01 = m00.m01;
      self.m02 = m00.m02;
      self.m03 = m00.m03;
      self.m04 = m00.m04;
      self.m05 = m00.m05;
      self.m06 = m00.m06;
      self.m07 = m00.m07;
      self.m08 = m00.m08;
    } else {
      self.m00 = m00;
      self.m01 = m01;
      self.m02 = m02;
      self.m03 = m03;
      self.m04 = m04;
      self.m05 = m05;
      self.m06 = m06;
      self.m07 = m07;
      self.m08 = m08;
    }
    return self;
  };
  _proto.equals = function equals(other, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return Mat3.equals(this, other, epsilon);
  };
  _proto.strictEquals = function strictEquals(other) {
    return Mat3.strictEquals(this, other);
  };
  _proto.toString = function toString() {
    var t = this;
    return "[\n" + t.m00 + ", " + t.m01 + ", " + t.m02 + ",\n" + t.m03 + ", " + t.m04 + ", " + t.m05 + ",\n" + t.m06 + ", " + t.m07 + ", " + t.m08 + "\n" + "]";
  };
  _proto.identity = function identity() {
    return Mat3.identity(this);
  };
  _proto.transpose = function transpose() {
    var self = this;
    var a01 = self.m01;
    var a02 = self.m02;
    var a12 = self.m05;
    self.m01 = self.m03;
    self.m02 = self.m06;
    self.m03 = a01;
    self.m05 = self.m07;
    self.m06 = a02;
    self.m07 = a12;
    return self;
  };
  _proto.invert = function invert() {
    return Mat3.invert(this, this);
  };
  _proto.determinant = function determinant() {
    return Mat3.determinant(this);
  };
  _proto.add = function add(mat) {
    var self = this;
    self.m00 += mat.m00;
    self.m01 += mat.m01;
    self.m02 += mat.m02;
    self.m03 += mat.m03;
    self.m04 += mat.m04;
    self.m05 += mat.m05;
    self.m06 += mat.m06;
    self.m07 += mat.m07;
    self.m08 += mat.m08;
    return self;
  };
  _proto.subtract = function subtract(mat) {
    var self = this;
    self.m00 -= mat.m00;
    self.m01 -= mat.m01;
    self.m02 -= mat.m02;
    self.m03 -= mat.m03;
    self.m04 -= mat.m04;
    self.m05 -= mat.m05;
    self.m06 -= mat.m06;
    self.m07 -= mat.m07;
    self.m08 -= mat.m08;
    return self;
  };
  _proto.multiply = function multiply(mat) {
    return Mat3.multiply(this, this, mat);
  };
  _proto.multiplyScalar = function multiplyScalar(scalar) {
    var self = this;
    self.m00 *= scalar;
    self.m01 *= scalar;
    self.m02 *= scalar;
    self.m03 *= scalar;
    self.m04 *= scalar;
    self.m05 *= scalar;
    self.m06 *= scalar;
    self.m07 *= scalar;
    self.m08 *= scalar;
    return self;
  };
  _proto.scale = function scale(vec) {
    var x = vec.x;
    var y = vec.y;
    var self = this;
    self.m00 *= x;
    self.m01 *= x;
    self.m02 *= x;
    self.m03 *= y;
    self.m04 *= y;
    self.m05 *= y;
    return self;
  };
  _proto.rotate = function rotate(rad) {
    var self = this;
    var a00 = self.m00;
    var a01 = self.m01;
    var a02 = self.m02;
    var a10 = self.m03;
    var a11 = self.m04;
    var a12 = self.m05;
    var a20 = self.m06;
    var a21 = self.m07;
    var a22 = self.m08;
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    self.m00 = c * a00 + s * a10;
    self.m01 = c * a01 + s * a11;
    self.m02 = c * a02 + s * a12;
    self.m03 = c * a10 - s * a00;
    self.m04 = c * a11 - s * a01;
    self.m05 = c * a12 - s * a02;
    self.m06 = a20;
    self.m07 = a21;
    self.m08 = a22;
    return self;
  };
  _proto.fromQuat = function fromQuat(q) {
    var x = q.x;
    var y = q.y;
    var z = q.z;
    var w = q.w;
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var yx = y * x2;
    var yy = y * y2;
    var zx = z * x2;
    var zy = z * y2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    var self = this;
    self.m00 = 1 - yy - zz;
    self.m03 = yx - wz;
    self.m06 = zx + wy;
    self.m01 = yx + wz;
    self.m04 = 1 - xx - zz;
    self.m07 = zy - wx;
    self.m02 = zx - wy;
    self.m05 = zy + wx;
    self.m08 = 1 - xx - yy;
    return self;
  };
  return Mat3;
}(ValueType);
_Mat$1 = Mat3;
Mat3.IDENTITY = Object.freeze(new _Mat$1());
var v3_1$2 = new Vec3();
var v3_2 = new Vec3();
CCClass.fastDefine('cc.Mat3', Mat3, {
  m00: 1,
  m01: 0,
  m02: 0,
  m03: 0,
  m04: 1,
  m05: 0,
  m06: 0,
  m07: 0,
  m08: 1
});
legacyCC.Mat3 = Mat3;

var _Quat;
var abs$2 = Math.abs;
var max$4 = Math.max;
var min$2 = Math.min;
var PI$1 = Math.PI;
var acos$2 = Math.acos;
var sin$2 = Math.sin;
var cos$3 = Math.cos;
var sqrt$3 = Math.sqrt;
var atan2$1 = Math.atan2;
var asin = Math.asin;
var sign = Math.sign;
var Quat = function (_ValueType) {
  function Quat(x, y, z, w) {
    var _this;
    _this = _ValueType.call(this) || this;
    if (typeof x === 'object') {
      _this.x = x.x;
      _this.y = x.y;
      _this.z = x.z;
      _this.w = x.w;
    } else {
      _this.x = x || 0;
      _this.y = y || 0;
      _this.z = z || 0;
      _this.w = w !== null && w !== void 0 ? w : 1;
    }
    return _this;
  }
  _inheritsLoose(Quat, _ValueType);
  Quat.clone = function clone(a) {
    return new Quat(a.x, a.y, a.z, a.w);
  };
  Quat.copy = function copy(out, a) {
    out.x = a.x;
    out.y = a.y;
    out.z = a.z;
    out.w = a.w;
    return out;
  };
  Quat.set = function set(out, x, y, z, w) {
    out.x = x;
    out.y = y;
    out.z = z;
    out.w = w;
    return out;
  };
  Quat.identity = function identity(out) {
    out.x = 0;
    out.y = 0;
    out.z = 0;
    out.w = 1;
    return out;
  };
  Quat.rotationTo = function rotationTo(out, a, b) {
    var dot = Vec3.dot(a, b);
    if (dot < -0.999999) {
      Vec3.cross(v3_1$1, Vec3.UNIT_X, a);
      if (v3_1$1.length() < 0.000001) {
        Vec3.cross(v3_1$1, Vec3.UNIT_Y, a);
      }
      Vec3.normalize(v3_1$1, v3_1$1);
      Quat.fromAxisAngle(out, v3_1$1, PI$1);
      return out;
    } else if (dot > 0.999999) {
      out.x = 0;
      out.y = 0;
      out.z = 0;
      out.w = 1;
      return out;
    } else {
      Vec3.cross(v3_1$1, a, b);
      out.x = v3_1$1.x;
      out.y = v3_1$1.y;
      out.z = v3_1$1.z;
      out.w = 1 + dot;
      return Quat.normalize(out, out);
    }
  };
  Quat.getAxisAngle = function getAxisAngle(outAxis, q) {
    var rad = acos$2(q.w) * 2.0;
    var s = sin$2(rad / 2.0);
    if (s !== 0.0) {
      outAxis.x = q.x / s;
      outAxis.y = q.y / s;
      outAxis.z = q.z / s;
    } else {
      outAxis.x = 1;
      outAxis.y = 0;
      outAxis.z = 0;
    }
    return rad;
  };
  Quat.multiply = function multiply(out, a, b) {
    var x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
    var y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
    var z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
    var w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
    out.x = x;
    out.y = y;
    out.z = z;
    out.w = w;
    return out;
  };
  Quat.multiplyScalar = function multiplyScalar(out, a, b) {
    out.x = a.x * b;
    out.y = a.y * b;
    out.z = a.z * b;
    out.w = a.w * b;
    return out;
  };
  Quat.scaleAndAdd = function scaleAndAdd(out, a, b, scale) {
    out.x = a.x + b.x * scale;
    out.y = a.y + b.y * scale;
    out.z = a.z + b.z * scale;
    out.w = a.w + b.w * scale;
    return out;
  };
  Quat.rotateX = function rotateX(out, a, rad) {
    rad *= 0.5;
    var bx = sin$2(rad);
    var bw = cos$3(rad);
    var x = a.x,
      y = a.y,
      z = a.z,
      w = a.w;
    out.x = x * bw + w * bx;
    out.y = y * bw + z * bx;
    out.z = z * bw - y * bx;
    out.w = w * bw - x * bx;
    return out;
  };
  Quat.rotateY = function rotateY(out, a, rad) {
    rad *= 0.5;
    var by = sin$2(rad);
    var bw = cos$3(rad);
    var x = a.x,
      y = a.y,
      z = a.z,
      w = a.w;
    out.x = x * bw - z * by;
    out.y = y * bw + w * by;
    out.z = z * bw + x * by;
    out.w = w * bw - y * by;
    return out;
  };
  Quat.rotateZ = function rotateZ(out, a, rad) {
    rad *= 0.5;
    var bz = sin$2(rad);
    var bw = cos$3(rad);
    var x = a.x,
      y = a.y,
      z = a.z,
      w = a.w;
    out.x = x * bw + y * bz;
    out.y = y * bw - x * bz;
    out.z = z * bw + w * bz;
    out.w = w * bw - z * bz;
    return out;
  };
  Quat.rotateAround = function rotateAround(out, rot, axis, rad) {
    Quat.invert(qt_1, rot);
    Vec3.transformQuat(v3_1$1, axis, qt_1);
    Quat.fromAxisAngle(qt_1, v3_1$1, rad);
    Quat.multiply(out, rot, qt_1);
    return out;
  };
  Quat.rotateAroundLocal = function rotateAroundLocal(out, rot, axis, rad) {
    Quat.fromAxisAngle(qt_1, axis, rad);
    Quat.multiply(out, rot, qt_1);
    return out;
  };
  Quat.calculateW = function calculateW(out, a) {
    out.x = a.x;
    out.y = a.y;
    out.z = a.z;
    out.w = sqrt$3(abs$2(1.0 - a.x * a.x - a.y * a.y - a.z * a.z));
    return out;
  };
  Quat.dot = function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  };
  Quat.lerp = function lerp(out, a, b, t) {
    out.x = a.x + t * (b.x - a.x);
    out.y = a.y + t * (b.y - a.y);
    out.z = a.z + t * (b.z - a.z);
    out.w = a.w + t * (b.w - a.w);
    return out;
  };
  Quat.slerp = function slerp(out, a, b, t) {
    var scale0 = 0;
    var scale1 = 0;
    var bx = b.x;
    var by = b.y;
    var bz = b.z;
    var bw = b.w;
    var cosom = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
    if (cosom < 0.0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    if (1.0 - cosom > 0.000001) {
      var omega = acos$2(cosom);
      var sinom = sin$2(omega);
      scale0 = sin$2((1.0 - t) * omega) / sinom;
      scale1 = sin$2(t * omega) / sinom;
    } else {
      scale0 = 1.0 - t;
      scale1 = t;
    }
    out.x = scale0 * a.x + scale1 * bx;
    out.y = scale0 * a.y + scale1 * by;
    out.z = scale0 * a.z + scale1 * bz;
    out.w = scale0 * a.w + scale1 * bw;
    return out;
  };
  Quat.sqlerp = function sqlerp(out, a, b, c, d, t) {
    Quat.slerp(qt_1, a, d, t);
    Quat.slerp(qt_2, b, c, t);
    Quat.slerp(out, qt_1, qt_2, 2 * t * (1 - t));
    return out;
  };
  Quat.invert = function invert(out, a) {
    var dot = a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w;
    var invDot = dot ? 1.0 / dot : 0;
    out.x = -a.x * invDot;
    out.y = -a.y * invDot;
    out.z = -a.z * invDot;
    out.w = a.w * invDot;
    return out;
  };
  Quat.conjugate = function conjugate(out, a) {
    out.x = -a.x;
    out.y = -a.y;
    out.z = -a.z;
    out.w = a.w;
    return out;
  };
  Quat.len = function len(a) {
    return sqrt$3(a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w);
  };
  Quat.lengthSqr = function lengthSqr(a) {
    return a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w;
  };
  Quat.normalize = function normalize(out, a) {
    var len = a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w;
    if (len > 0) {
      len = 1 / sqrt$3(len);
      out.x = a.x * len;
      out.y = a.y * len;
      out.z = a.z * len;
      out.w = a.w * len;
    } else {
      out.x = 0;
      out.y = 0;
      out.z = 0;
      out.w = 0;
    }
    return out;
  };
  Quat.fromAxes = function fromAxes(out, xAxis, yAxis, zAxis) {
    Mat3.set(m3_1$1, xAxis.x, xAxis.y, xAxis.z, yAxis.x, yAxis.y, yAxis.z, zAxis.x, zAxis.y, zAxis.z);
    return Quat.normalize(out, Quat.fromMat3(out, m3_1$1));
  };
  Quat.fromViewUp = function fromViewUp(out, view, up) {
    Mat3.fromViewUp(m3_1$1, view, up);
    return Quat.normalize(out, Quat.fromMat3(out, m3_1$1));
  };
  Quat.fromAxisAngle = function fromAxisAngle(out, axis, rad) {
    rad *= 0.5;
    var s = sin$2(rad);
    out.x = s * axis.x;
    out.y = s * axis.y;
    out.z = s * axis.z;
    out.w = cos$3(rad);
    return out;
  };
  Quat.fromMat3 = function fromMat3(out, m) {
    var m00 = m.m00,
      m01 = m.m01,
      m02 = m.m02,
      m10 = m.m03,
      m11 = m.m04,
      m12 = m.m05,
      m20 = m.m06,
      m21 = m.m07,
      m22 = m.m08;
    var fourXSquaredMinus1 = m00 - m11 - m22;
    var fourYSquaredMinus1 = m11 - m00 - m22;
    var fourZSquaredMinus1 = m22 - m00 - m11;
    var fourWSquaredMinus1 = m00 + m11 + m22;
    var biggestIndex = 0;
    var fourBiggestSquaredMinus1 = fourWSquaredMinus1;
    if (fourXSquaredMinus1 > fourBiggestSquaredMinus1) {
      fourBiggestSquaredMinus1 = fourXSquaredMinus1;
      biggestIndex = 1;
    }
    if (fourYSquaredMinus1 > fourBiggestSquaredMinus1) {
      fourBiggestSquaredMinus1 = fourYSquaredMinus1;
      biggestIndex = 2;
    }
    if (fourZSquaredMinus1 > fourBiggestSquaredMinus1) {
      fourBiggestSquaredMinus1 = fourZSquaredMinus1;
      biggestIndex = 3;
    }
    var biggestVal = sqrt$3(fourBiggestSquaredMinus1 + 1) * 0.5;
    var mult = 0.25 / biggestVal;
    switch (biggestIndex) {
      case 0:
        out.w = biggestVal;
        out.x = (m12 - m21) * mult;
        out.y = (m20 - m02) * mult;
        out.z = (m01 - m10) * mult;
        break;
      case 1:
        out.w = (m12 - m21) * mult;
        out.x = biggestVal;
        out.y = (m01 + m10) * mult;
        out.z = (m20 + m02) * mult;
        break;
      case 2:
        out.w = (m20 - m02) * mult;
        out.x = (m01 + m10) * mult;
        out.y = biggestVal;
        out.z = (m12 + m21) * mult;
        break;
      case 3:
        out.w = (m01 - m10) * mult;
        out.x = (m20 + m02) * mult;
        out.y = (m12 + m21) * mult;
        out.z = biggestVal;
        break;
      default:
        out.w = 1;
        out.x = 0;
        out.y = 0;
        out.z = 0;
        break;
    }
    return out;
  };
  Quat.fromEuler = function fromEuler(out, x, y, z) {
    x *= halfToRad;
    y *= halfToRad;
    z *= halfToRad;
    var sx = sin$2(x);
    var cx = cos$3(x);
    var sy = sin$2(y);
    var cy = cos$3(y);
    var sz = sin$2(z);
    var cz = cos$3(z);
    out.x = sx * cy * cz + cx * sy * sz;
    out.y = cx * sy * cz + sx * cy * sz;
    out.z = cx * cy * sz - sx * sy * cz;
    out.w = cx * cy * cz - sx * sy * sz;
    return out;
  };
  Quat.fromAngleZ = function fromAngleZ(out, z) {
    z *= halfToRad;
    out.x = out.y = 0;
    out.z = sin$2(z);
    out.w = cos$3(z);
    return out;
  };
  Quat.toAxisX = function toAxisX(out, q) {
    var fy = 2.0 * q.y;
    var fz = 2.0 * q.z;
    out.x = 1.0 - fy * q.y - fz * q.z;
    out.y = fy * q.x + fz * q.w;
    out.z = fz * q.x - fy * q.w;
    return out;
  };
  Quat.toAxisY = function toAxisY(out, q) {
    var fx = 2.0 * q.x;
    var fy = 2.0 * q.y;
    var fz = 2.0 * q.z;
    out.x = fy * q.x - fz * q.w;
    out.y = 1.0 - fx * q.x - fz * q.z;
    out.z = fz * q.y + fx * q.w;
    return out;
  };
  Quat.toAxisZ = function toAxisZ(out, q) {
    var fx = 2.0 * q.x;
    var fy = 2.0 * q.y;
    var fz = 2.0 * q.z;
    out.x = fz * q.x + fy * q.w;
    out.y = fz * q.y - fx * q.w;
    out.z = 1.0 - fx * q.x - fy * q.y;
    return out;
  };
  Quat.toEuler = function toEuler(out, q, outerZ) {
    var x = q.x,
      y = q.y,
      z = q.z,
      w = q.w;
    var bank = 0;
    var heading = 0;
    var attitude = 0;
    var test = x * y + z * w;
    if (test > 0.499999) {
      bank = 0;
      heading = toDegree(2 * atan2$1(x, w));
      attitude = 90;
    } else if (test < -0.499999) {
      bank = 0;
      heading = -toDegree(2 * atan2$1(x, w));
      attitude = -90;
    } else {
      var sqx = x * x;
      var sqy = y * y;
      var sqz = z * z;
      bank = toDegree(atan2$1(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz));
      heading = toDegree(atan2$1(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz));
      attitude = toDegree(asin(2 * test));
      if (outerZ) {
        bank = -180 * sign(bank + 1e-6) + bank;
        heading = -180 * sign(heading + 1e-6) + heading;
        attitude = 180 * sign(attitude + 1e-6) - attitude;
      }
    }
    out.x = bank;
    out.y = heading;
    out.z = attitude;
    return out;
  };
  Quat.toEulerInYXZOrder = function toEulerInYXZOrder(out, q) {
    Mat3.fromQuat(m3_1$1, q);
    Mat3.toEuler(m3_1$1, out);
    out.x = toDegree(out.x);
    out.y = toDegree(out.y);
    out.z = toDegree(out.z);
  };
  Quat.toArray = function toArray(out, q, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out[ofs + 0] = q.x;
    out[ofs + 1] = q.y;
    out[ofs + 2] = q.z;
    out[ofs + 3] = q.w;
    return out;
  };
  Quat.fromArray = function fromArray(out, arr, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out.x = arr[ofs + 0];
    out.y = arr[ofs + 1];
    out.z = arr[ofs + 2];
    out.w = arr[ofs + 3];
    return out;
  };
  Quat.strictEquals = function strictEquals(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
  };
  Quat.equals = function equals(a, b, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return abs$2(a.x - b.x) <= epsilon * max$4(1.0, abs$2(a.x), abs$2(b.x)) && abs$2(a.y - b.y) <= epsilon * max$4(1.0, abs$2(a.y), abs$2(b.y)) && abs$2(a.z - b.z) <= epsilon * max$4(1.0, abs$2(a.z), abs$2(b.z)) && abs$2(a.w - b.w) <= epsilon * max$4(1.0, abs$2(a.w), abs$2(b.w));
  };
  Quat.angle = function angle(a, b) {
    var dot = min$2(abs$2(Quat.dot(a, b)), 1.0);
    return acos$2(dot) * 2.0;
  };
  Quat.rotateTowards = function rotateTowards(out, from, to, maxStep) {
    var angle = Quat.angle(from, to);
    if (angle === 0) {
      out.x = to.x;
      out.y = to.y;
      out.z = to.z;
      out.w = to.w;
      return out;
    }
    var t = min$2(maxStep / toDegree(angle), 1.0);
    return Quat.slerp(out, from, to, t);
  };
  var _proto = Quat.prototype;
  _proto.clone = function clone() {
    return new Quat(this.x, this.y, this.z, this.w);
  };
  _proto.set = function set(x, y, z, w) {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
      this.w = x.w;
    } else {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.w = w !== null && w !== void 0 ? w : 1;
    }
    return this;
  };
  _proto.equals = function equals(other, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return Quat.equals(this, other, epsilon);
  };
  _proto.strictEquals = function strictEquals(other) {
    return other && this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
  };
  _proto.getEulerAngles = function getEulerAngles(out) {
    return Quat.toEuler(out, this);
  };
  _proto.lerp = function lerp(to, ratio) {
    var self = this;
    self.x += ratio * (to.x - self.x);
    self.y += ratio * (to.y - self.y);
    self.z += ratio * (to.z - self.z);
    self.w += ratio * (to.w - self.w);
    return self;
  };
  _proto.slerp = function slerp(to, ratio) {
    return Quat.slerp(this, this, to, ratio);
  };
  _proto.length = function length() {
    var self = this;
    var x = self.x,
      y = self.y,
      z = self.z,
      w = self.w;
    return sqrt$3(x * x + y * y + z * z + w * w);
  };
  _proto.lengthSqr = function lengthSqr() {
    var self = this;
    var x = self.x,
      y = self.y,
      z = self.z,
      w = self.w;
    return x * x + y * y + z * z + w * w;
  };
  _proto.toString = function toString() {
    return "(" + this.x + ", " + this.y + ", " + this.z + ", " + this.w + ")";
  };
  return Quat;
}(ValueType);
_Quat = Quat;
Quat.IDENTITY = Object.freeze(new _Quat());
var qt_1 = new Quat();
var qt_2 = new Quat();
var v3_1$1 = new Vec3();
var m3_1$1 = new Mat3();
var halfToRad = 0.5 * PI$1 / 180.0;
CCClass.fastDefine('cc.Quat', Quat, {
  x: 0,
  y: 0,
  z: 0,
  w: 1
});
legacyCC.Quat = Quat;
function quat(x, y, z, w) {
  if (x === void 0) {
    x = 0;
  }
  if (y === void 0) {
    y = 0;
  }
  if (z === void 0) {
    z = 0;
  }
  if (w === void 0) {
    w = 1;
  }
  return new Quat(x, y, z, w);
}
legacyCC.quat = quat;

var _Mat;
var objectFreeze = Object.freeze;
var preTransforms = objectFreeze([objectFreeze([1, 0, 0, 1]), objectFreeze([0, 1, -1, 0]), objectFreeze([-1, 0, 0, -1]), objectFreeze([0, -1, 1, 0])]);
var abs$1 = Math.abs;
var max$3 = Math.max;
var sqrt$2 = Math.sqrt;
var sin$1 = Math.sin;
var cos$2 = Math.cos;
var tan = Math.tan;
var Mat4 = function (_ValueType) {
  function Mat4(m00, m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14, m15) {
    var _this;
    if (m00 === void 0) {
      m00 = 1;
    }
    if (m01 === void 0) {
      m01 = 0;
    }
    if (m02 === void 0) {
      m02 = 0;
    }
    if (m03 === void 0) {
      m03 = 0;
    }
    if (m04 === void 0) {
      m04 = 0;
    }
    if (m05 === void 0) {
      m05 = 1;
    }
    if (m06 === void 0) {
      m06 = 0;
    }
    if (m07 === void 0) {
      m07 = 0;
    }
    if (m08 === void 0) {
      m08 = 0;
    }
    if (m09 === void 0) {
      m09 = 0;
    }
    if (m10 === void 0) {
      m10 = 1;
    }
    if (m11 === void 0) {
      m11 = 0;
    }
    if (m12 === void 0) {
      m12 = 0;
    }
    if (m13 === void 0) {
      m13 = 0;
    }
    if (m14 === void 0) {
      m14 = 0;
    }
    if (m15 === void 0) {
      m15 = 1;
    }
    _this = _ValueType.call(this) || this;
    var self = _this;
    if (typeof m00 === 'object') {
      self.m00 = m00.m00;
      _this.m01 = m00.m01;
      _this.m02 = m00.m02;
      _this.m03 = m00.m03;
      self.m04 = m00.m04;
      _this.m05 = m00.m05;
      _this.m06 = m00.m06;
      _this.m07 = m00.m07;
      self.m08 = m00.m08;
      _this.m09 = m00.m09;
      _this.m10 = m00.m10;
      _this.m11 = m00.m11;
      self.m12 = m00.m12;
      _this.m13 = m00.m13;
      _this.m14 = m00.m14;
      _this.m15 = m00.m15;
    } else {
      self.m00 = m00;
      _this.m01 = m01;
      _this.m02 = m02;
      _this.m03 = m03;
      self.m04 = m04;
      _this.m05 = m05;
      _this.m06 = m06;
      _this.m07 = m07;
      self.m08 = m08;
      _this.m09 = m09;
      _this.m10 = m10;
      _this.m11 = m11;
      self.m12 = m12;
      _this.m13 = m13;
      _this.m14 = m14;
      _this.m15 = m15;
    }
    return _this;
  }
  _inheritsLoose(Mat4, _ValueType);
  Mat4.clone = function clone(a) {
    return new Mat4(a.m00, a.m01, a.m02, a.m03, a.m04, a.m05, a.m06, a.m07, a.m08, a.m09, a.m10, a.m11, a.m12, a.m13, a.m14, a.m15);
  };
  Mat4.copy = function copy(out, a) {
    out.m00 = a.m00;
    out.m01 = a.m01;
    out.m02 = a.m02;
    out.m03 = a.m03;
    out.m04 = a.m04;
    out.m05 = a.m05;
    out.m06 = a.m06;
    out.m07 = a.m07;
    out.m08 = a.m08;
    out.m09 = a.m09;
    out.m10 = a.m10;
    out.m11 = a.m11;
    out.m12 = a.m12;
    out.m13 = a.m13;
    out.m14 = a.m14;
    out.m15 = a.m15;
    return out;
  };
  Mat4.set = function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    out.m00 = m00;
    out.m01 = m01;
    out.m02 = m02;
    out.m03 = m03;
    out.m04 = m10;
    out.m05 = m11;
    out.m06 = m12;
    out.m07 = m13;
    out.m08 = m20;
    out.m09 = m21;
    out.m10 = m22;
    out.m11 = m23;
    out.m12 = m30;
    out.m13 = m31;
    out.m14 = m32;
    out.m15 = m33;
    return out;
  };
  Mat4.identity = function identity(out) {
    out.m00 = 1;
    out.m01 = 0;
    out.m02 = 0;
    out.m03 = 0;
    out.m04 = 0;
    out.m05 = 1;
    out.m06 = 0;
    out.m07 = 0;
    out.m08 = 0;
    out.m09 = 0;
    out.m10 = 1;
    out.m11 = 0;
    out.m12 = 0;
    out.m13 = 0;
    out.m14 = 0;
    out.m15 = 1;
    return out;
  };
  Mat4.zero = function zero(out) {
    out.m00 = 0;
    out.m01 = 0;
    out.m02 = 0;
    out.m03 = 0;
    out.m04 = 0;
    out.m05 = 0;
    out.m06 = 0;
    out.m07 = 0;
    out.m08 = 0;
    out.m09 = 0;
    out.m10 = 0;
    out.m11 = 0;
    out.m12 = 0;
    out.m13 = 0;
    out.m14 = 0;
    out.m15 = 0;
    return out;
  };
  Mat4.transpose = function transpose(out, a) {
    if (out === a) {
      var a01 = a.m01;
      var a02 = a.m02;
      var a03 = a.m03;
      var a12 = a.m06;
      var a13 = a.m07;
      var a23 = a.m11;
      out.m01 = a.m04;
      out.m02 = a.m08;
      out.m03 = a.m12;
      out.m04 = a01;
      out.m06 = a.m09;
      out.m07 = a.m13;
      out.m08 = a02;
      out.m09 = a12;
      out.m11 = a.m14;
      out.m12 = a03;
      out.m13 = a13;
      out.m14 = a23;
    } else {
      out.m00 = a.m00;
      out.m01 = a.m04;
      out.m02 = a.m08;
      out.m03 = a.m12;
      out.m04 = a.m01;
      out.m05 = a.m05;
      out.m06 = a.m09;
      out.m07 = a.m13;
      out.m08 = a.m02;
      out.m09 = a.m06;
      out.m10 = a.m10;
      out.m11 = a.m14;
      out.m12 = a.m03;
      out.m13 = a.m07;
      out.m14 = a.m11;
      out.m15 = a.m15;
    }
    return out;
  };
  Mat4.invert = function invert(out, a) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a03 = a.m03;
    var a10 = a.m04;
    var a11 = a.m05;
    var a12 = a.m06;
    var a13 = a.m07;
    var a20 = a.m08;
    var a21 = a.m09;
    var a22 = a.m10;
    var a23 = a.m11;
    var a30 = a.m12;
    var a31 = a.m13;
    var a32 = a.m14;
    var a33 = a.m15;
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (det === 0) {
      return Mat4.zero(out);
    }
    det = 1.0 / det;
    out.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out.m01 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out.m02 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out.m03 = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out.m04 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out.m05 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out.m06 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out.m07 = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out.m08 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out.m09 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out.m10 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out.m11 = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out.m12 = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out.m13 = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out.m14 = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out.m15 = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  };
  Mat4.determinant = function determinant(a) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a03 = a.m03;
    var a10 = a.m04;
    var a11 = a.m05;
    var a12 = a.m06;
    var a13 = a.m07;
    var a20 = a.m08;
    var a21 = a.m09;
    var a22 = a.m10;
    var a23 = a.m11;
    var a30 = a.m12;
    var a31 = a.m13;
    var a32 = a.m14;
    var a33 = a.m15;
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  };
  Mat4.multiply = function multiply(out, a, b) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a03 = a.m03;
    var a10 = a.m04;
    var a11 = a.m05;
    var a12 = a.m06;
    var a13 = a.m07;
    var a20 = a.m08;
    var a21 = a.m09;
    var a22 = a.m10;
    var a23 = a.m11;
    var a30 = a.m12;
    var a31 = a.m13;
    var a32 = a.m14;
    var a33 = a.m15;
    var b0 = b.m00;
    var b1 = b.m01;
    var b2 = b.m02;
    var b3 = b.m03;
    out.m00 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out.m01 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out.m02 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out.m03 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b.m04;
    b1 = b.m05;
    b2 = b.m06;
    b3 = b.m07;
    out.m04 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out.m05 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out.m06 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out.m07 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b.m08;
    b1 = b.m09;
    b2 = b.m10;
    b3 = b.m11;
    out.m08 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out.m09 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out.m10 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out.m11 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b.m12;
    b1 = b.m13;
    b2 = b.m14;
    b3 = b.m15;
    out.m12 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out.m13 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out.m14 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out.m15 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  };
  Mat4.transform = function transform(out, a, v) {
    var x = v.x;
    var y = v.y;
    var z = v.z;
    if (a === out) {
      out.m12 = a.m00 * x + a.m04 * y + a.m08 * z + a.m12;
      out.m13 = a.m01 * x + a.m05 * y + a.m09 * z + a.m13;
      out.m14 = a.m02 * x + a.m06 * y + a.m10 * z + a.m14;
      out.m15 = a.m03 * x + a.m07 * y + a.m11 * z + a.m15;
    } else {
      var a00 = a.m00;
      var a01 = a.m01;
      var a02 = a.m02;
      var a03 = a.m03;
      var a10 = a.m04;
      var a11 = a.m05;
      var a12 = a.m06;
      var a13 = a.m07;
      var a20 = a.m08;
      var a21 = a.m09;
      var a22 = a.m10;
      var a23 = a.m11;
      out.m00 = a00;
      out.m01 = a01;
      out.m02 = a02;
      out.m03 = a03;
      out.m04 = a10;
      out.m05 = a11;
      out.m06 = a12;
      out.m07 = a13;
      out.m08 = a20;
      out.m09 = a21;
      out.m10 = a22;
      out.m11 = a23;
      out.m12 = a00 * x + a10 * y + a20 * z + a.m12;
      out.m13 = a01 * x + a11 * y + a21 * z + a.m13;
      out.m14 = a02 * x + a12 * y + a22 * z + a.m14;
      out.m15 = a03 * x + a13 * y + a23 * z + a.m15;
    }
    return out;
  };
  Mat4.translate = function translate(out, a, v) {
    if (a === out) {
      out.m12 += v.x;
      out.m13 += v.y;
      out.m14 += v.z;
    } else {
      out.m00 = a.m00;
      out.m01 = a.m01;
      out.m02 = a.m02;
      out.m03 = a.m03;
      out.m04 = a.m04;
      out.m05 = a.m05;
      out.m06 = a.m06;
      out.m07 = a.m07;
      out.m08 = a.m08;
      out.m09 = a.m09;
      out.m10 = a.m10;
      out.m11 = a.m11;
      out.m12 = a.m12 + v.x;
      out.m13 = a.m13 + v.y;
      out.m14 = a.m14 + v.z;
      out.m15 = a.m15;
    }
    return out;
  };
  Mat4.scale = function scale(out, a, v) {
    var x = v.x;
    var y = v.y;
    var z = v.z;
    out.m00 = a.m00 * x;
    out.m01 = a.m01 * x;
    out.m02 = a.m02 * x;
    out.m03 = a.m03 * x;
    out.m04 = a.m04 * y;
    out.m05 = a.m05 * y;
    out.m06 = a.m06 * y;
    out.m07 = a.m07 * y;
    out.m08 = a.m08 * z;
    out.m09 = a.m09 * z;
    out.m10 = a.m10 * z;
    out.m11 = a.m11 * z;
    out.m12 = a.m12;
    out.m13 = a.m13;
    out.m14 = a.m14;
    out.m15 = a.m15;
    return out;
  };
  Mat4.rotate = function rotate(out, a, rad, axis) {
    var x = axis.x;
    var y = axis.y;
    var z = axis.z;
    var len = sqrt$2(x * x + y * y + z * z);
    if (abs$1(len) < EPSILON) {
      return null;
    }
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    var s = sin$1(rad);
    var c = cos$2(rad);
    var t = 1 - c;
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a03 = a.m03;
    var a10 = a.m04;
    var a11 = a.m05;
    var a12 = a.m06;
    var a13 = a.m07;
    var a20 = a.m08;
    var a21 = a.m09;
    var a22 = a.m10;
    var a23 = a.m11;
    var b00 = x * x * t + c;
    var b01 = y * x * t + z * s;
    var b02 = z * x * t - y * s;
    var b10 = x * y * t - z * s;
    var b11 = y * y * t + c;
    var b12 = z * y * t + x * s;
    var b20 = x * z * t + y * s;
    var b21 = y * z * t - x * s;
    var b22 = z * z * t + c;
    out.m00 = a00 * b00 + a10 * b01 + a20 * b02;
    out.m01 = a01 * b00 + a11 * b01 + a21 * b02;
    out.m02 = a02 * b00 + a12 * b01 + a22 * b02;
    out.m03 = a03 * b00 + a13 * b01 + a23 * b02;
    out.m04 = a00 * b10 + a10 * b11 + a20 * b12;
    out.m05 = a01 * b10 + a11 * b11 + a21 * b12;
    out.m06 = a02 * b10 + a12 * b11 + a22 * b12;
    out.m07 = a03 * b10 + a13 * b11 + a23 * b12;
    out.m08 = a00 * b20 + a10 * b21 + a20 * b22;
    out.m09 = a01 * b20 + a11 * b21 + a21 * b22;
    out.m10 = a02 * b20 + a12 * b21 + a22 * b22;
    out.m11 = a03 * b20 + a13 * b21 + a23 * b22;
    if (a !== out) {
      out.m12 = a.m12;
      out.m13 = a.m13;
      out.m14 = a.m14;
      out.m15 = a.m15;
    }
    return out;
  };
  Mat4.rotateX = function rotateX(out, a, rad) {
    var s = sin$1(rad);
    var c = cos$2(rad);
    var a10 = a.m04;
    var a11 = a.m05;
    var a12 = a.m06;
    var a13 = a.m07;
    var a20 = a.m08;
    var a21 = a.m09;
    var a22 = a.m10;
    var a23 = a.m11;
    if (a !== out) {
      out.m00 = a.m00;
      out.m01 = a.m01;
      out.m02 = a.m02;
      out.m03 = a.m03;
      out.m12 = a.m12;
      out.m13 = a.m13;
      out.m14 = a.m14;
      out.m15 = a.m15;
    }
    out.m04 = a10 * c + a20 * s;
    out.m05 = a11 * c + a21 * s;
    out.m06 = a12 * c + a22 * s;
    out.m07 = a13 * c + a23 * s;
    out.m08 = a20 * c - a10 * s;
    out.m09 = a21 * c - a11 * s;
    out.m10 = a22 * c - a12 * s;
    out.m11 = a23 * c - a13 * s;
    return out;
  };
  Mat4.rotateY = function rotateY(out, a, rad) {
    var s = sin$1(rad);
    var c = cos$2(rad);
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a03 = a.m03;
    var a20 = a.m08;
    var a21 = a.m09;
    var a22 = a.m10;
    var a23 = a.m11;
    if (a !== out) {
      out.m04 = a.m04;
      out.m05 = a.m05;
      out.m06 = a.m06;
      out.m07 = a.m07;
      out.m12 = a.m12;
      out.m13 = a.m13;
      out.m14 = a.m14;
      out.m15 = a.m15;
    }
    out.m00 = a00 * c - a20 * s;
    out.m01 = a01 * c - a21 * s;
    out.m02 = a02 * c - a22 * s;
    out.m03 = a03 * c - a23 * s;
    out.m08 = a00 * s + a20 * c;
    out.m09 = a01 * s + a21 * c;
    out.m10 = a02 * s + a22 * c;
    out.m11 = a03 * s + a23 * c;
    return out;
  };
  Mat4.rotateZ = function rotateZ(out, a, rad) {
    var s = sin$1(rad);
    var c = cos$2(rad);
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a03 = a.m03;
    var a10 = a.m04;
    var a11 = a.m05;
    var a12 = a.m06;
    var a13 = a.m07;
    if (a !== out) {
      out.m08 = a.m08;
      out.m09 = a.m09;
      out.m10 = a.m10;
      out.m11 = a.m11;
      out.m12 = a.m12;
      out.m13 = a.m13;
      out.m14 = a.m14;
      out.m15 = a.m15;
    }
    out.m00 = a00 * c + a10 * s;
    out.m01 = a01 * c + a11 * s;
    out.m02 = a02 * c + a12 * s;
    out.m03 = a03 * c + a13 * s;
    out.m04 = a10 * c - a00 * s;
    out.m05 = a11 * c - a01 * s;
    out.m06 = a12 * c - a02 * s;
    out.m07 = a13 * c - a03 * s;
    return out;
  };
  Mat4.fromTranslation = function fromTranslation(out, v) {
    Mat4.identity(out);
    out.m12 = v.x;
    out.m13 = v.y;
    out.m14 = v.z;
    return out;
  };
  Mat4.fromScaling = function fromScaling(out, v) {
    Mat4.identity(out);
    out.m00 = v.x;
    out.m05 = v.y;
    out.m10 = v.z;
    return out;
  };
  Mat4.fromRotation = function fromRotation(out, rad, axis) {
    var x = axis.x;
    var y = axis.y;
    var z = axis.z;
    var len = sqrt$2(x * x + y * y + z * z);
    if (abs$1(len) < EPSILON) {
      return null;
    }
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    var s = sin$1(rad);
    var c = cos$2(rad);
    var t = 1 - c;
    out.m00 = x * x * t + c;
    out.m01 = y * x * t + z * s;
    out.m02 = z * x * t - y * s;
    out.m03 = 0;
    out.m04 = x * y * t - z * s;
    out.m05 = y * y * t + c;
    out.m06 = z * y * t + x * s;
    out.m07 = 0;
    out.m08 = x * z * t + y * s;
    out.m09 = y * z * t - x * s;
    out.m10 = z * z * t + c;
    out.m11 = 0;
    out.m12 = 0;
    out.m13 = 0;
    out.m14 = 0;
    out.m15 = 1;
    return out;
  };
  Mat4.fromXRotation = function fromXRotation(out, rad) {
    var s = sin$1(rad);
    var c = cos$2(rad);
    Mat4.identity(out);
    out.m05 = c;
    out.m06 = s;
    out.m09 = -s;
    out.m10 = c;
    return out;
  };
  Mat4.fromYRotation = function fromYRotation(out, rad) {
    var s = sin$1(rad);
    var c = cos$2(rad);
    Mat4.identity(out);
    out.m00 = c;
    out.m02 = -s;
    out.m08 = s;
    out.m10 = c;
    return out;
  };
  Mat4.fromZRotation = function fromZRotation(out, rad) {
    var s = sin$1(rad);
    var c = cos$2(rad);
    Mat4.identity(out);
    out.m00 = c;
    out.m01 = s;
    out.m04 = -s;
    out.m05 = c;
    return out;
  };
  Mat4.fromRT = function fromRT(out, q, v) {
    var x = q.x;
    var y = q.y;
    var z = q.z;
    var w = q.w;
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    out.m00 = 1 - (yy + zz);
    out.m01 = xy + wz;
    out.m02 = xz - wy;
    out.m03 = 0;
    out.m04 = xy - wz;
    out.m05 = 1 - (xx + zz);
    out.m06 = yz + wx;
    out.m07 = 0;
    out.m08 = xz + wy;
    out.m09 = yz - wx;
    out.m10 = 1 - (xx + yy);
    out.m11 = 0;
    out.m12 = v.x;
    out.m13 = v.y;
    out.m14 = v.z;
    out.m15 = 1;
    return out;
  };
  Mat4.getTranslation = function getTranslation(out, mat) {
    out.x = mat.m12;
    out.y = mat.m13;
    out.z = mat.m14;
    return out;
  };
  Mat4.getScaling = function getScaling(out, mat) {
    var m00 = m3_1.m00 = mat.m00;
    var m01 = m3_1.m01 = mat.m01;
    var m02 = m3_1.m02 = mat.m02;
    var m04 = m3_1.m03 = mat.m04;
    var m05 = m3_1.m04 = mat.m05;
    var m06 = m3_1.m05 = mat.m06;
    var m08 = m3_1.m06 = mat.m08;
    var m09 = m3_1.m07 = mat.m09;
    var m10 = m3_1.m08 = mat.m10;
    out.x = sqrt$2(m00 * m00 + m01 * m01 + m02 * m02);
    out.y = sqrt$2(m04 * m04 + m05 * m05 + m06 * m06);
    out.z = sqrt$2(m08 * m08 + m09 * m09 + m10 * m10);
    if (Mat3.determinant(m3_1) < 0) {
      out.x *= -1;
    }
    return out;
  };
  Mat4.getRotation = function getRotation(out, mat) {
    var trace = mat.m00 + mat.m05 + mat.m10;
    var S = 0;
    if (trace > 0) {
      S = sqrt$2(trace + 1.0) * 2;
      out.w = 0.25 * S;
      out.x = (mat.m06 - mat.m09) / S;
      out.y = (mat.m08 - mat.m02) / S;
      out.z = (mat.m01 - mat.m04) / S;
    } else if (mat.m00 > mat.m05 && mat.m00 > mat.m10) {
      S = sqrt$2(1.0 + mat.m00 - mat.m05 - mat.m10) * 2;
      out.w = (mat.m06 - mat.m09) / S;
      out.x = 0.25 * S;
      out.y = (mat.m01 + mat.m04) / S;
      out.z = (mat.m08 + mat.m02) / S;
    } else if (mat.m05 > mat.m10) {
      S = sqrt$2(1.0 + mat.m05 - mat.m00 - mat.m10) * 2;
      out.w = (mat.m08 - mat.m02) / S;
      out.x = (mat.m01 + mat.m04) / S;
      out.y = 0.25 * S;
      out.z = (mat.m06 + mat.m09) / S;
    } else {
      S = sqrt$2(1.0 + mat.m10 - mat.m00 - mat.m05) * 2;
      out.w = (mat.m01 - mat.m04) / S;
      out.x = (mat.m08 + mat.m02) / S;
      out.y = (mat.m06 + mat.m09) / S;
      out.z = 0.25 * S;
    }
    return out;
  };
  Mat4.toRTS = function toRTS(m, q, v, s) {
    Mat4.toSRT(m, q, v, s);
  };
  Mat4.toSRT = function toSRT(m, q, v, s) {
    if (v) {
      Vec3.set(v, m.m12, m.m13, m.m14);
    }
    var sx = Vec3.set(v3_1, m.m00, m.m01, m.m02).length();
    var sy = Vec3.set(v3_1, m.m04, m.m05, m.m06).length();
    var sz = Vec3.set(v3_1, m.m08, m.m09, m.m10).length();
    if (s) {
      s.x = sx;
      s.y = sy;
      s.z = sz;
    }
    if (sx === 0 || sy === 0 || sz === 0) {
      if (q) {
        Quat.identity(q);
      }
      return;
    }
    m3_1.m00 = m.m00 / sx;
    m3_1.m01 = m.m01 / sx;
    m3_1.m02 = m.m02 / sx;
    m3_1.m03 = m.m04 / sy;
    m3_1.m04 = m.m05 / sy;
    m3_1.m05 = m.m06 / sy;
    m3_1.m06 = m.m08 / sz;
    m3_1.m07 = m.m09 / sz;
    m3_1.m08 = m.m10 / sz;
    var det = Mat3.determinant(m3_1);
    if (s) {
      if (det < 0) {
        s.x *= -1;
      }
    }
    if (q) {
      if (det < 0) {
        m3_1.m00 *= -1;
        m3_1.m01 *= -1;
        m3_1.m02 *= -1;
      }
      Quat.fromMat3(q, m3_1);
    }
  };
  Mat4.toEuler = function toEuler(m, v) {
    Mat3.set(m3_1, m.m00, m.m01, m.m02, m.m04, m.m05, m.m06, m.m08, m.m09, m.m10);
    return Mat3.toEuler(m3_1, v);
  };
  Mat4.fromRTS = function fromRTS(out, q, v, s) {
    return Mat4.fromSRT(out, q, v, s);
  };
  Mat4.fromSRT = function fromSRT(out, q, v, s) {
    var x = q.x,
      y = q.y,
      z = q.z,
      w = q.w;
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    var sx = s.x;
    var sy = s.y;
    var sz = s.z;
    out.m00 = (1 - (yy + zz)) * sx;
    out.m01 = (xy + wz) * sx;
    out.m02 = (xz - wy) * sx;
    out.m03 = 0;
    out.m04 = (xy - wz) * sy;
    out.m05 = (1 - (xx + zz)) * sy;
    out.m06 = (yz + wx) * sy;
    out.m07 = 0;
    out.m08 = (xz + wy) * sz;
    out.m09 = (yz - wx) * sz;
    out.m10 = (1 - (xx + yy)) * sz;
    out.m11 = 0;
    out.m12 = v.x;
    out.m13 = v.y;
    out.m14 = v.z;
    out.m15 = 1;
    return out;
  };
  Mat4.fromRTSOrigin = function fromRTSOrigin(out, q, v, s, o) {
    return Mat4.fromSRTOrigin(out, q, v, s, o);
  };
  Mat4.fromSRTOrigin = function fromSRTOrigin(out, q, v, s, o) {
    var x = q.x;
    var y = q.y;
    var z = q.z;
    var w = q.w;
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    var sx = s.x;
    var sy = s.y;
    var sz = s.z;
    var ox = o.x;
    var oy = o.y;
    var oz = o.z;
    out.m00 = (1 - (yy + zz)) * sx;
    out.m01 = (xy + wz) * sx;
    out.m02 = (xz - wy) * sx;
    out.m03 = 0;
    out.m04 = (xy - wz) * sy;
    out.m05 = (1 - (xx + zz)) * sy;
    out.m06 = (yz + wx) * sy;
    out.m07 = 0;
    out.m08 = (xz + wy) * sz;
    out.m09 = (yz - wx) * sz;
    out.m10 = (1 - (xx + yy)) * sz;
    out.m11 = 0;
    out.m12 = v.x + ox - (out.m00 * ox + out.m04 * oy + out.m08 * oz);
    out.m13 = v.y + oy - (out.m01 * ox + out.m05 * oy + out.m09 * oz);
    out.m14 = v.z + oz - (out.m02 * ox + out.m06 * oy + out.m10 * oz);
    out.m15 = 1;
    return out;
  };
  Mat4.fromQuat = function fromQuat(out, q) {
    var x = q.x;
    var y = q.y;
    var z = q.z;
    var w = q.w;
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var yx = y * x2;
    var yy = y * y2;
    var zx = z * x2;
    var zy = z * y2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    out.m00 = 1 - yy - zz;
    out.m01 = yx + wz;
    out.m02 = zx - wy;
    out.m03 = 0;
    out.m04 = yx - wz;
    out.m05 = 1 - xx - zz;
    out.m06 = zy + wx;
    out.m07 = 0;
    out.m08 = zx + wy;
    out.m09 = zy - wx;
    out.m10 = 1 - xx - yy;
    out.m11 = 0;
    out.m12 = 0;
    out.m13 = 0;
    out.m14 = 0;
    out.m15 = 1;
    return out;
  };
  Mat4.frustum = function frustum(out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left);
    var tb = 1 / (top - bottom);
    var nf = 1 / (near - far);
    out.m00 = near * 2 * rl;
    out.m01 = 0;
    out.m02 = 0;
    out.m03 = 0;
    out.m04 = 0;
    out.m05 = near * 2 * tb;
    out.m06 = 0;
    out.m07 = 0;
    out.m08 = (right + left) * rl;
    out.m09 = (top + bottom) * tb;
    out.m10 = (far + near) * nf;
    out.m11 = -1;
    out.m12 = 0;
    out.m13 = 0;
    out.m14 = far * near * 2 * nf;
    out.m15 = 0;
    return out;
  };
  Mat4.perspective = function perspective(out, fov, aspect, near, far, isFOVY, minClipZ, projectionSignY, orientation) {
    if (isFOVY === void 0) {
      isFOVY = true;
    }
    if (minClipZ === void 0) {
      minClipZ = -1;
    }
    if (projectionSignY === void 0) {
      projectionSignY = 1;
    }
    if (orientation === void 0) {
      orientation = 0;
    }
    var f = 1.0 / tan(fov / 2);
    var nf = 1 / (near - far);
    var x = isFOVY ? f / aspect : f;
    var y = (isFOVY ? f : f * aspect) * projectionSignY;
    var preTransform = preTransforms[orientation];
    out.m00 = x * preTransform[0];
    out.m01 = x * preTransform[1];
    out.m02 = 0;
    out.m03 = 0;
    out.m04 = y * preTransform[2];
    out.m05 = y * preTransform[3];
    out.m06 = 0;
    out.m07 = 0;
    out.m08 = 0;
    out.m09 = 0;
    out.m10 = (far - minClipZ * near) * nf;
    out.m11 = -1;
    out.m12 = 0;
    out.m13 = 0;
    out.m14 = far * near * nf * (1 - minClipZ);
    out.m15 = 0;
    return out;
  };
  Mat4.ortho = function ortho(out, left, right, bottom, top, near, far, minClipZ, projectionSignY, orientation) {
    if (minClipZ === void 0) {
      minClipZ = -1;
    }
    if (projectionSignY === void 0) {
      projectionSignY = 1;
    }
    if (orientation === void 0) {
      orientation = 0;
    }
    var lr = 1 / (left - right);
    var bt = 1 / (bottom - top) * projectionSignY;
    var nf = 1 / (near - far);
    var x = -2 * lr;
    var y = -2 * bt;
    var dx = (left + right) * lr;
    var dy = (top + bottom) * bt;
    var preTransform = preTransforms[orientation];
    out.m00 = x * preTransform[0];
    out.m01 = x * preTransform[1];
    out.m02 = 0;
    out.m03 = 0;
    out.m04 = y * preTransform[2];
    out.m05 = y * preTransform[3];
    out.m06 = 0;
    out.m07 = 0;
    out.m08 = 0;
    out.m09 = 0;
    out.m10 = nf * (1 - minClipZ);
    out.m11 = 0;
    out.m12 = dx * preTransform[0] + dy * preTransform[2];
    out.m13 = dx * preTransform[1] + dy * preTransform[3];
    out.m14 = (near - minClipZ * far) * nf;
    out.m15 = 1;
    return out;
  };
  Mat4.lookAt = function lookAt(out, eye, center, up) {
    var eyex = eye.x;
    var eyey = eye.y;
    var eyez = eye.z;
    var upx = up.x;
    var upy = up.y;
    var upz = up.z;
    var centerx = center.x;
    var centery = center.y;
    var centerz = center.z;
    var z0 = eyex - centerx;
    var z1 = eyey - centery;
    var z2 = eyez - centerz;
    var len = 1 / sqrt$2(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    var x0 = upy * z2 - upz * z1;
    var x1 = upz * z0 - upx * z2;
    var x2 = upx * z1 - upy * z0;
    len = 1 / sqrt$2(x0 * x0 + x1 * x1 + x2 * x2);
    x0 *= len;
    x1 *= len;
    x2 *= len;
    var y0 = z1 * x2 - z2 * x1;
    var y1 = z2 * x0 - z0 * x2;
    var y2 = z0 * x1 - z1 * x0;
    out.m00 = x0;
    out.m01 = y0;
    out.m02 = z0;
    out.m03 = 0;
    out.m04 = x1;
    out.m05 = y1;
    out.m06 = z1;
    out.m07 = 0;
    out.m08 = x2;
    out.m09 = y2;
    out.m10 = z2;
    out.m11 = 0;
    out.m12 = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out.m13 = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out.m14 = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out.m15 = 1;
    return out;
  };
  Mat4.inverseTranspose = function inverseTranspose(out, a) {
    var a00 = a.m00;
    var a01 = a.m01;
    var a02 = a.m02;
    var a03 = a.m03;
    var a10 = a.m04;
    var a11 = a.m05;
    var a12 = a.m06;
    var a13 = a.m07;
    var a20 = a.m08;
    var a21 = a.m09;
    var a22 = a.m10;
    var a23 = a.m11;
    var a30 = a.m12;
    var a31 = a.m13;
    var a32 = a.m14;
    var a33 = a.m15;
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1.0 / det;
    out.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out.m01 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out.m02 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out.m03 = 0;
    out.m04 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out.m05 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out.m06 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out.m07 = 0;
    out.m08 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out.m09 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out.m10 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out.m11 = 0;
    out.m12 = 0;
    out.m13 = 0;
    out.m14 = 0;
    out.m15 = 1;
    return out;
  };
  Mat4.toArray = function toArray(out, m, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out[ofs + 0] = m.m00;
    out[ofs + 1] = m.m01;
    out[ofs + 2] = m.m02;
    out[ofs + 3] = m.m03;
    out[ofs + 4] = m.m04;
    out[ofs + 5] = m.m05;
    out[ofs + 6] = m.m06;
    out[ofs + 7] = m.m07;
    out[ofs + 8] = m.m08;
    out[ofs + 9] = m.m09;
    out[ofs + 10] = m.m10;
    out[ofs + 11] = m.m11;
    out[ofs + 12] = m.m12;
    out[ofs + 13] = m.m13;
    out[ofs + 14] = m.m14;
    out[ofs + 15] = m.m15;
    return out;
  };
  Mat4.fromArray = function fromArray(out, arr, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out.m00 = arr[ofs + 0];
    out.m01 = arr[ofs + 1];
    out.m02 = arr[ofs + 2];
    out.m03 = arr[ofs + 3];
    out.m04 = arr[ofs + 4];
    out.m05 = arr[ofs + 5];
    out.m06 = arr[ofs + 6];
    out.m07 = arr[ofs + 7];
    out.m08 = arr[ofs + 8];
    out.m09 = arr[ofs + 9];
    out.m10 = arr[ofs + 10];
    out.m11 = arr[ofs + 11];
    out.m12 = arr[ofs + 12];
    out.m13 = arr[ofs + 13];
    out.m14 = arr[ofs + 14];
    out.m15 = arr[ofs + 15];
    return out;
  };
  Mat4.add = function add(out, a, b) {
    out.m00 = a.m00 + b.m00;
    out.m01 = a.m01 + b.m01;
    out.m02 = a.m02 + b.m02;
    out.m03 = a.m03 + b.m03;
    out.m04 = a.m04 + b.m04;
    out.m05 = a.m05 + b.m05;
    out.m06 = a.m06 + b.m06;
    out.m07 = a.m07 + b.m07;
    out.m08 = a.m08 + b.m08;
    out.m09 = a.m09 + b.m09;
    out.m10 = a.m10 + b.m10;
    out.m11 = a.m11 + b.m11;
    out.m12 = a.m12 + b.m12;
    out.m13 = a.m13 + b.m13;
    out.m14 = a.m14 + b.m14;
    out.m15 = a.m15 + b.m15;
    return out;
  };
  Mat4.subtract = function subtract(out, a, b) {
    out.m00 = a.m00 - b.m00;
    out.m01 = a.m01 - b.m01;
    out.m02 = a.m02 - b.m02;
    out.m03 = a.m03 - b.m03;
    out.m04 = a.m04 - b.m04;
    out.m05 = a.m05 - b.m05;
    out.m06 = a.m06 - b.m06;
    out.m07 = a.m07 - b.m07;
    out.m08 = a.m08 - b.m08;
    out.m09 = a.m09 - b.m09;
    out.m10 = a.m10 - b.m10;
    out.m11 = a.m11 - b.m11;
    out.m12 = a.m12 - b.m12;
    out.m13 = a.m13 - b.m13;
    out.m14 = a.m14 - b.m14;
    out.m15 = a.m15 - b.m15;
    return out;
  };
  Mat4.multiplyScalar = function multiplyScalar(out, a, b) {
    out.m00 = a.m00 * b;
    out.m01 = a.m01 * b;
    out.m02 = a.m02 * b;
    out.m03 = a.m03 * b;
    out.m04 = a.m04 * b;
    out.m05 = a.m05 * b;
    out.m06 = a.m06 * b;
    out.m07 = a.m07 * b;
    out.m08 = a.m08 * b;
    out.m09 = a.m09 * b;
    out.m10 = a.m10 * b;
    out.m11 = a.m11 * b;
    out.m12 = a.m12 * b;
    out.m13 = a.m13 * b;
    out.m14 = a.m14 * b;
    out.m15 = a.m15 * b;
    return out;
  };
  Mat4.multiplyScalarAndAdd = function multiplyScalarAndAdd(out, a, b, scale) {
    out.m00 = a.m00 + b.m00 * scale;
    out.m01 = a.m01 + b.m01 * scale;
    out.m02 = a.m02 + b.m02 * scale;
    out.m03 = a.m03 + b.m03 * scale;
    out.m04 = a.m04 + b.m04 * scale;
    out.m05 = a.m05 + b.m05 * scale;
    out.m06 = a.m06 + b.m06 * scale;
    out.m07 = a.m07 + b.m07 * scale;
    out.m08 = a.m08 + b.m08 * scale;
    out.m09 = a.m09 + b.m09 * scale;
    out.m10 = a.m10 + b.m10 * scale;
    out.m11 = a.m11 + b.m11 * scale;
    out.m12 = a.m12 + b.m12 * scale;
    out.m13 = a.m13 + b.m13 * scale;
    out.m14 = a.m14 + b.m14 * scale;
    out.m15 = a.m15 + b.m15 * scale;
    return out;
  };
  Mat4.strictEquals = function strictEquals(a, b) {
    return a.m00 === b.m00 && a.m01 === b.m01 && a.m02 === b.m02 && a.m03 === b.m03 && a.m04 === b.m04 && a.m05 === b.m05 && a.m06 === b.m06 && a.m07 === b.m07 && a.m08 === b.m08 && a.m09 === b.m09 && a.m10 === b.m10 && a.m11 === b.m11 && a.m12 === b.m12 && a.m13 === b.m13 && a.m14 === b.m14 && a.m15 === b.m15;
  };
  Mat4.equals = function equals(a, b, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return abs$1(a.m00 - b.m00) <= epsilon * max$3(1.0, abs$1(a.m00), abs$1(b.m00)) && abs$1(a.m01 - b.m01) <= epsilon * max$3(1.0, abs$1(a.m01), abs$1(b.m01)) && abs$1(a.m02 - b.m02) <= epsilon * max$3(1.0, abs$1(a.m02), abs$1(b.m02)) && abs$1(a.m03 - b.m03) <= epsilon * max$3(1.0, abs$1(a.m03), abs$1(b.m03)) && abs$1(a.m04 - b.m04) <= epsilon * max$3(1.0, abs$1(a.m04), abs$1(b.m04)) && abs$1(a.m05 - b.m05) <= epsilon * max$3(1.0, abs$1(a.m05), abs$1(b.m05)) && abs$1(a.m06 - b.m06) <= epsilon * max$3(1.0, abs$1(a.m06), abs$1(b.m06)) && abs$1(a.m07 - b.m07) <= epsilon * max$3(1.0, abs$1(a.m07), abs$1(b.m07)) && abs$1(a.m08 - b.m08) <= epsilon * max$3(1.0, abs$1(a.m08), abs$1(b.m08)) && abs$1(a.m09 - b.m09) <= epsilon * max$3(1.0, abs$1(a.m09), abs$1(b.m09)) && abs$1(a.m10 - b.m10) <= epsilon * max$3(1.0, abs$1(a.m10), abs$1(b.m10)) && abs$1(a.m11 - b.m11) <= epsilon * max$3(1.0, abs$1(a.m11), abs$1(b.m11)) && abs$1(a.m12 - b.m12) <= epsilon * max$3(1.0, abs$1(a.m12), abs$1(b.m12)) && abs$1(a.m13 - b.m13) <= epsilon * max$3(1.0, abs$1(a.m13), abs$1(b.m13)) && abs$1(a.m14 - b.m14) <= epsilon * max$3(1.0, abs$1(a.m14), abs$1(b.m14)) && abs$1(a.m15 - b.m15) <= epsilon * max$3(1.0, abs$1(a.m15), abs$1(b.m15));
  };
  var _proto = Mat4.prototype;
  _proto.clone = function clone() {
    return new Mat4(this.m00, this.m01, this.m02, this.m03, this.m04, this.m05, this.m06, this.m07, this.m08, this.m09, this.m10, this.m11, this.m12, this.m13, this.m14, this.m15);
  };
  _proto.set = function set(m00, m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14, m15) {
    if (m00 === void 0) {
      m00 = 1;
    }
    if (m01 === void 0) {
      m01 = 0;
    }
    if (m02 === void 0) {
      m02 = 0;
    }
    if (m03 === void 0) {
      m03 = 0;
    }
    if (m04 === void 0) {
      m04 = 0;
    }
    if (m05 === void 0) {
      m05 = 1;
    }
    if (m06 === void 0) {
      m06 = 0;
    }
    if (m07 === void 0) {
      m07 = 0;
    }
    if (m08 === void 0) {
      m08 = 0;
    }
    if (m09 === void 0) {
      m09 = 0;
    }
    if (m10 === void 0) {
      m10 = 1;
    }
    if (m11 === void 0) {
      m11 = 0;
    }
    if (m12 === void 0) {
      m12 = 0;
    }
    if (m13 === void 0) {
      m13 = 0;
    }
    if (m14 === void 0) {
      m14 = 0;
    }
    if (m15 === void 0) {
      m15 = 1;
    }
    var self = this;
    if (typeof m00 === 'object') {
      self.m01 = m00.m01;
      self.m02 = m00.m02;
      self.m03 = m00.m03;
      self.m04 = m00.m04;
      self.m05 = m00.m05;
      self.m06 = m00.m06;
      self.m07 = m00.m07;
      self.m08 = m00.m08;
      self.m09 = m00.m09;
      self.m10 = m00.m10;
      self.m11 = m00.m11;
      self.m12 = m00.m12;
      self.m13 = m00.m13;
      self.m14 = m00.m14;
      self.m15 = m00.m15;
      self.m00 = m00.m00;
    } else {
      self.m01 = m01;
      self.m02 = m02;
      self.m03 = m03;
      self.m04 = m04;
      self.m05 = m05;
      self.m06 = m06;
      self.m07 = m07;
      self.m08 = m08;
      self.m09 = m09;
      self.m10 = m10;
      self.m11 = m11;
      self.m12 = m12;
      self.m13 = m13;
      self.m14 = m14;
      self.m15 = m15;
      self.m00 = m00;
    }
    return self;
  };
  _proto.equals = function equals(other, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    var inf = Infinity;
    var self = this;
    var m00 = self.m00;
    var m01 = self.m01;
    var m02 = self.m02;
    var m03 = self.m03;
    var m04 = self.m04;
    var m05 = self.m05;
    var m06 = self.m06;
    var m07 = self.m07;
    var m08 = self.m08;
    var m09 = self.m09;
    var m10 = self.m10;
    var m11 = self.m11;
    var m12 = self.m12;
    var m13 = self.m13;
    var m14 = self.m14;
    var m15 = self.m15;
    var hasInf = abs$1(m00) === inf || abs$1(m01) === inf || abs$1(m02) === inf || abs$1(m03) === inf || abs$1(m04) === inf || abs$1(m05) === inf || abs$1(m06) === inf || abs$1(m07) === inf || abs$1(m08) === inf || abs$1(m09) === inf || abs$1(m10) === inf || abs$1(m11) === inf || abs$1(m12) === inf || abs$1(m13) === inf || abs$1(m14) === inf || abs$1(m15) === inf;
    return !hasInf && abs$1(m00 - other.m00) <= epsilon * max$3(1.0, abs$1(m00), abs$1(other.m00)) && abs$1(m01 - other.m01) <= epsilon * max$3(1.0, abs$1(m01), abs$1(other.m01)) && abs$1(m02 - other.m02) <= epsilon * max$3(1.0, abs$1(m02), abs$1(other.m02)) && abs$1(m03 - other.m03) <= epsilon * max$3(1.0, abs$1(m03), abs$1(other.m03)) && abs$1(m04 - other.m04) <= epsilon * max$3(1.0, abs$1(m04), abs$1(other.m04)) && abs$1(m05 - other.m05) <= epsilon * max$3(1.0, abs$1(m05), abs$1(other.m05)) && abs$1(m06 - other.m06) <= epsilon * max$3(1.0, abs$1(m06), abs$1(other.m06)) && abs$1(m07 - other.m07) <= epsilon * max$3(1.0, abs$1(m07), abs$1(other.m07)) && abs$1(m08 - other.m08) <= epsilon * max$3(1.0, abs$1(m08), abs$1(other.m08)) && abs$1(m09 - other.m09) <= epsilon * max$3(1.0, abs$1(m09), abs$1(other.m09)) && abs$1(m10 - other.m10) <= epsilon * max$3(1.0, abs$1(m10), abs$1(other.m10)) && abs$1(m11 - other.m11) <= epsilon * max$3(1.0, abs$1(m11), abs$1(other.m11)) && abs$1(m12 - other.m12) <= epsilon * max$3(1.0, abs$1(m12), abs$1(other.m12)) && abs$1(m13 - other.m13) <= epsilon * max$3(1.0, abs$1(m13), abs$1(other.m13)) && abs$1(m14 - other.m14) <= epsilon * max$3(1.0, abs$1(m14), abs$1(other.m14)) && abs$1(m15 - other.m15) <= epsilon * max$3(1.0, abs$1(m15), abs$1(other.m15));
  };
  _proto.strictEquals = function strictEquals(other) {
    var self = this;
    return self.m00 === other.m00 && self.m01 === other.m01 && self.m02 === other.m02 && self.m03 === other.m03 && self.m04 === other.m04 && self.m05 === other.m05 && self.m06 === other.m06 && self.m07 === other.m07 && self.m08 === other.m08 && self.m09 === other.m09 && self.m10 === other.m10 && self.m11 === other.m11 && self.m12 === other.m12 && self.m13 === other.m13 && self.m14 === other.m14 && self.m15 === other.m15;
  };
  _proto.toString = function toString() {
    var t = this;
    return "[\n" + t.m00 + ", " + t.m01 + ", " + t.m02 + ", " + t.m03 + ",\n" + t.m04 + ", " + t.m05 + ", " + t.m06 + ", " + t.m07 + ",\n" + t.m08 + ", " + t.m09 + ", " + t.m10 + ", " + t.m11 + ",\n" + t.m12 + ", " + t.m13 + ", " + t.m14 + ", " + t.m15 + "\n" + ']';
  };
  _proto.identity = function identity() {
    return Mat4.identity(this);
  };
  _proto.zero = function zero() {
    return Mat4.zero(this);
  };
  _proto.transpose = function transpose() {
    var self = this;
    var a01 = self.m01;
    var a02 = self.m02;
    var a03 = self.m03;
    var a12 = self.m06;
    var a13 = self.m07;
    var a23 = self.m11;
    self.m01 = self.m04;
    self.m02 = self.m08;
    self.m03 = self.m12;
    self.m04 = a01;
    self.m06 = self.m09;
    self.m07 = self.m13;
    self.m08 = a02;
    self.m09 = a12;
    self.m11 = self.m14;
    self.m12 = a03;
    self.m13 = a13;
    self.m14 = a23;
    return self;
  };
  _proto.invert = function invert() {
    var self = this;
    var a00 = self.m00;
    var a01 = self.m01;
    var a02 = self.m02;
    var a03 = self.m03;
    var a10 = self.m04;
    var a11 = self.m05;
    var a12 = self.m06;
    var a13 = self.m07;
    var a20 = self.m08;
    var a21 = self.m09;
    var a22 = self.m10;
    var a23 = self.m11;
    var a30 = self.m12;
    var a31 = self.m13;
    var a32 = self.m14;
    var a33 = self.m15;
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (det === 0) {
      self.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      return self;
    }
    det = 1.0 / det;
    self.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    self.m01 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    self.m02 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    self.m03 = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    self.m04 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    self.m05 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    self.m06 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    self.m07 = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    self.m08 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    self.m09 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    self.m10 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    self.m11 = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    self.m12 = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    self.m13 = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    self.m14 = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    self.m15 = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return self;
  };
  _proto.determinant = function determinant() {
    var self = this;
    var a00 = self.m00;
    var a01 = self.m01;
    var a02 = self.m02;
    var a03 = self.m03;
    var a10 = self.m04;
    var a11 = self.m05;
    var a12 = self.m06;
    var a13 = self.m07;
    var a20 = self.m08;
    var a21 = self.m09;
    var a22 = self.m10;
    var a23 = self.m11;
    var a30 = self.m12;
    var a31 = self.m13;
    var a32 = self.m14;
    var a33 = self.m15;
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  };
  _proto.add = function add(mat) {
    var self = this;
    self.m00 += mat.m00;
    self.m01 += mat.m01;
    self.m02 += mat.m02;
    self.m03 += mat.m03;
    self.m04 += mat.m04;
    self.m05 += mat.m05;
    self.m06 += mat.m06;
    self.m07 += mat.m07;
    self.m08 += mat.m08;
    self.m09 += mat.m09;
    self.m10 += mat.m10;
    self.m11 += mat.m11;
    self.m12 += mat.m12;
    self.m13 += mat.m13;
    self.m14 += mat.m14;
    self.m15 += mat.m15;
    return self;
  };
  _proto.subtract = function subtract(mat) {
    var self = this;
    self.m00 -= mat.m00;
    self.m01 -= mat.m01;
    self.m02 -= mat.m02;
    self.m03 -= mat.m03;
    self.m04 -= mat.m04;
    self.m05 -= mat.m05;
    self.m06 -= mat.m06;
    self.m07 -= mat.m07;
    self.m08 -= mat.m08;
    self.m09 -= mat.m09;
    self.m10 -= mat.m10;
    self.m11 -= mat.m11;
    self.m12 -= mat.m12;
    self.m13 -= mat.m13;
    self.m14 -= mat.m14;
    self.m15 -= mat.m15;
    return self;
  };
  _proto.multiply = function multiply(mat) {
    return Mat4.multiply(this, this, mat);
  };
  _proto.multiplyScalar = function multiplyScalar(scalar) {
    var self = this;
    self.m00 *= scalar;
    self.m01 *= scalar;
    self.m02 *= scalar;
    self.m03 *= scalar;
    self.m04 *= scalar;
    self.m05 *= scalar;
    self.m06 *= scalar;
    self.m07 *= scalar;
    self.m08 *= scalar;
    self.m09 *= scalar;
    self.m10 *= scalar;
    self.m11 *= scalar;
    self.m12 *= scalar;
    self.m13 *= scalar;
    self.m14 *= scalar;
    self.m15 *= scalar;
    return self;
  };
  _proto.translate = function translate(vec) {
    this.m12 += vec.x;
    this.m13 += vec.y;
    this.m14 += vec.z;
    return this;
  };
  _proto.transform = function transform(vec) {
    var x = vec.x,
      y = vec.y,
      z = vec.z;
    var self = this;
    var a00 = self.m00;
    var a01 = self.m01;
    var a02 = self.m02;
    var a03 = self.m03;
    var a10 = self.m04;
    var a11 = self.m05;
    var a12 = self.m06;
    var a13 = self.m07;
    var a20 = self.m08;
    var a21 = self.m09;
    var a22 = self.m10;
    var a23 = self.m11;
    self.m12 = a00 * x + a10 * y + a20 * z + self.m12;
    self.m13 = a01 * x + a11 * y + a21 * z + self.m13;
    self.m14 = a02 * x + a12 * y + a22 * z + self.m14;
    self.m15 = a03 * x + a13 * y + a23 * z + self.m15;
    return self;
  };
  _proto.scale = function scale(vec) {
    var x = vec.x,
      y = vec.y,
      z = vec.z;
    var self = this;
    self.m00 *= x;
    self.m01 *= x;
    self.m02 *= x;
    self.m03 *= x;
    self.m04 *= y;
    self.m05 *= y;
    self.m06 *= y;
    self.m07 *= y;
    self.m08 *= z;
    self.m09 *= z;
    self.m10 *= z;
    self.m11 *= z;
    return self;
  };
  _proto.rotate = function rotate(rad, axis) {
    var x = axis.x;
    var y = axis.y;
    var z = axis.z;
    var len = sqrt$2(x * x + y * y + z * z);
    if (abs$1(len) < EPSILON) {
      return null;
    }
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    var s = sin$1(rad);
    var c = cos$2(rad);
    var t = 1 - c;
    var self = this;
    var a00 = self.m00;
    var a01 = self.m01;
    var a02 = self.m02;
    var a03 = self.m03;
    var a10 = self.m04;
    var a11 = self.m05;
    var a12 = self.m06;
    var a13 = self.m07;
    var a20 = self.m08;
    var a21 = self.m09;
    var a22 = self.m10;
    var a23 = self.m11;
    var b00 = x * x * t + c;
    var b01 = y * x * t + z * s;
    var b02 = z * x * t - y * s;
    var b10 = x * y * t - z * s;
    var b11 = y * y * t + c;
    var b12 = z * y * t + x * s;
    var b20 = x * z * t + y * s;
    var b21 = y * z * t - x * s;
    var b22 = z * z * t + c;
    self.m00 = a00 * b00 + a10 * b01 + a20 * b02;
    self.m01 = a01 * b00 + a11 * b01 + a21 * b02;
    self.m02 = a02 * b00 + a12 * b01 + a22 * b02;
    self.m03 = a03 * b00 + a13 * b01 + a23 * b02;
    self.m04 = a00 * b10 + a10 * b11 + a20 * b12;
    self.m05 = a01 * b10 + a11 * b11 + a21 * b12;
    self.m06 = a02 * b10 + a12 * b11 + a22 * b12;
    self.m07 = a03 * b10 + a13 * b11 + a23 * b12;
    self.m08 = a00 * b20 + a10 * b21 + a20 * b22;
    self.m09 = a01 * b20 + a11 * b21 + a21 * b22;
    self.m10 = a02 * b20 + a12 * b21 + a22 * b22;
    self.m11 = a03 * b20 + a13 * b21 + a23 * b22;
    return self;
  };
  _proto.getTranslation = function getTranslation(out) {
    out.x = this.m12;
    out.y = this.m13;
    out.z = this.m14;
    return out;
  };
  _proto.getScale = function getScale(out) {
    var self = this;
    var m00 = m3_1.m00 = self.m00;
    var m01 = m3_1.m01 = self.m01;
    var m02 = m3_1.m02 = self.m02;
    var m04 = m3_1.m03 = self.m04;
    var m05 = m3_1.m04 = self.m05;
    var m06 = m3_1.m05 = self.m06;
    var m08 = m3_1.m06 = self.m08;
    var m09 = m3_1.m07 = self.m09;
    var m10 = m3_1.m08 = self.m10;
    out.x = sqrt$2(m00 * m00 + m01 * m01 + m02 * m02);
    out.y = sqrt$2(m04 * m04 + m05 * m05 + m06 * m06);
    out.z = sqrt$2(m08 * m08 + m09 * m09 + m10 * m10);
    if (Mat3.determinant(m3_1) < 0) {
      out.x *= -1;
    }
    return out;
  };
  _proto.getRotation = function getRotation(out) {
    var self = this;
    var sx = Vec3.set(v3_1, self.m00, self.m01, self.m02).length();
    var sy = Vec3.set(v3_1, self.m04, self.m05, self.m06).length();
    var sz = Vec3.set(v3_1, self.m08, self.m09, self.m10).length();
    m3_1.m00 = self.m00 / sx;
    m3_1.m01 = self.m01 / sx;
    m3_1.m02 = self.m02 / sx;
    m3_1.m03 = self.m04 / sy;
    m3_1.m04 = self.m05 / sy;
    m3_1.m05 = self.m06 / sy;
    m3_1.m06 = self.m08 / sz;
    m3_1.m07 = self.m09 / sz;
    m3_1.m08 = self.m10 / sz;
    var det = Mat3.determinant(m3_1);
    if (det < 0) {
      m3_1.m00 *= -1;
      m3_1.m01 *= -1;
      m3_1.m02 *= -1;
    }
    return Quat.fromMat3(out, m3_1);
  };
  _proto.fromRTS = function fromRTS(q, v, s) {
    return Mat4.fromSRT(this, q, v, s);
  };
  _proto.fromSRT = function fromSRT(q, v, s) {
    return Mat4.fromSRT(this, q, v, s);
  };
  _proto.fromQuat = function fromQuat(q) {
    return Mat4.fromQuat(this, q);
  };
  return Mat4;
}(ValueType);
_Mat = Mat4;
Mat4.IDENTITY = Object.freeze(new _Mat());
var v3_1 = new Vec3();
var m3_1 = new Mat3();
CCClass.fastDefine('cc.Mat4', Mat4, {
  m00: 1,
  m01: 0,
  m02: 0,
  m03: 0,
  m04: 0,
  m05: 1,
  m06: 0,
  m07: 0,
  m08: 0,
  m09: 0,
  m10: 1,
  m11: 0,
  m12: 0,
  m13: 0,
  m14: 0,
  m15: 1
});
legacyCC.Mat4 = Mat4;
function mat4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  return new Mat4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
}
legacyCC.mat4 = mat4;

var abs = Math.abs;
var _max$1 = Math.max;
var _min$1 = Math.min;
var PI = Math.PI;
var acos$1 = Math.acos;
var sin = Math.sin;
var cos$1 = Math.cos;
var sqrt$1 = Math.sqrt;
var atan2 = Math.atan2;
var _ceil = Math.ceil;
var _floor = Math.floor;
var _round = Math.round;
function freezeVec2(x, y) {
  return Object.freeze(new Vec2(x, y));
}
var Vec2 = function (_ValueType) {
  function Vec2(x, y) {
    var _this;
    _this = _ValueType.call(this) || this;
    if (typeof x === 'object') {
      _this.x = x.x;
      _this.y = x.y;
    } else {
      _this.x = x || 0;
      _this.y = y || 0;
    }
    return _this;
  }
  _inheritsLoose(Vec2, _ValueType);
  Vec2.clone = function clone(a) {
    return new Vec2(a.x, a.y);
  };
  Vec2.copy = function copy(out, a) {
    out.x = a.x;
    out.y = a.y;
    return out;
  };
  Vec2.set = function set(out, x, y) {
    out.x = x;
    out.y = y;
    return out;
  };
  Vec2.add = function add(out, a, b) {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    return out;
  };
  Vec2.subtract = function subtract(out, a, b) {
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    return out;
  };
  Vec2.multiply = function multiply(out, a, b) {
    out.x = a.x * b.x;
    out.y = a.y * b.y;
    return out;
  };
  Vec2.divide = function divide(out, a, b) {
    out.x = a.x / b.x;
    out.y = a.y / b.y;
    return out;
  };
  Vec2.ceil = function ceil(out, a) {
    out.x = _ceil(a.x);
    out.y = _ceil(a.y);
    return out;
  };
  Vec2.floor = function floor(out, a) {
    out.x = _floor(a.x);
    out.y = _floor(a.y);
    return out;
  };
  Vec2.min = function min(out, a, b) {
    out.x = _min$1(a.x, b.x);
    out.y = _min$1(a.y, b.y);
    return out;
  };
  Vec2.max = function max(out, a, b) {
    out.x = _max$1(a.x, b.x);
    out.y = _max$1(a.y, b.y);
    return out;
  };
  Vec2.round = function round(out, a) {
    out.x = _round(a.x);
    out.y = _round(a.y);
    return out;
  };
  Vec2.multiplyScalar = function multiplyScalar(out, a, b) {
    out.x = a.x * b;
    out.y = a.y * b;
    return out;
  };
  Vec2.scaleAndAdd = function scaleAndAdd(out, a, b, scale) {
    out.x = a.x + b.x * scale;
    out.y = a.y + b.y * scale;
    return out;
  };
  Vec2.distance = function distance(a, b) {
    var x = b.x - a.x;
    var y = b.y - a.y;
    return sqrt$1(x * x + y * y);
  };
  Vec2.squaredDistance = function squaredDistance(a, b) {
    var x = b.x - a.x;
    var y = b.y - a.y;
    return x * x + y * y;
  };
  Vec2.len = function len(a) {
    var x = a.x;
    var y = a.y;
    return sqrt$1(x * x + y * y);
  };
  Vec2.lengthSqr = function lengthSqr(a) {
    var x = a.x;
    var y = a.y;
    return x * x + y * y;
  };
  Vec2.negate = function negate(out, a) {
    out.x = -a.x;
    out.y = -a.y;
    return out;
  };
  Vec2.inverse = function inverse(out, a) {
    out.x = 1.0 / a.x;
    out.y = 1.0 / a.y;
    return out;
  };
  Vec2.inverseSafe = function inverseSafe(out, a) {
    var x = a.x;
    var y = a.y;
    if (abs(x) < EPSILON) {
      out.x = 0;
    } else {
      out.x = 1.0 / x;
    }
    if (abs(y) < EPSILON) {
      out.y = 0;
    } else {
      out.y = 1.0 / y;
    }
    return out;
  };
  Vec2.normalize = function normalize(out, a) {
    var x = a.x;
    var y = a.y;
    var len = x * x + y * y;
    if (len > 0) {
      len = 1 / sqrt$1(len);
      out.x = x * len;
      out.y = y * len;
    } else {
      out.x = 0;
      out.y = 0;
    }
    return out;
  };
  Vec2.dot = function dot(a, b) {
    return a.x * b.x + a.y * b.y;
  };
  Vec2.cross = function cross(out, a, b) {
    if (out instanceof Vec3) {
      out.x = out.y = 0;
      out.z = a.x * b.y - a.y * b.x;
      return out;
    } else {
      return out.x * a.y - out.y * a.x;
    }
  };
  Vec2.lerp = function lerp(out, a, b, t) {
    var x = a.x;
    var y = a.y;
    out.x = x + t * (b.x - x);
    out.y = y + t * (b.y - y);
    return out;
  };
  Vec2.random = function random$1(out, scale) {
    scale = scale || 1.0;
    var r = random() * 2.0 * PI;
    out.x = cos$1(r) * scale;
    out.y = sin(r) * scale;
    return out;
  };
  Vec2.transformMat3 = function transformMat3(out, a, m) {
    var x = a.x;
    var y = a.y;
    out.x = m.m00 * x + m.m03 * y + m.m06;
    out.y = m.m01 * x + m.m04 * y + m.m07;
    return out;
  };
  Vec2.transformMat4 = function transformMat4(out, a, m) {
    var x = a.x;
    var y = a.y;
    out.x = m.m00 * x + m.m04 * y + m.m12;
    out.y = m.m01 * x + m.m05 * y + m.m13;
    return out;
  };
  Vec2.str = function str(a) {
    return "Vec2(" + a.x + ", " + a.y + ")";
  };
  Vec2.toArray = function toArray(out, v, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out[ofs + 0] = v.x;
    out[ofs + 1] = v.y;
    return out;
  };
  Vec2.fromArray = function fromArray(out, arr, ofs) {
    if (ofs === void 0) {
      ofs = 0;
    }
    out.x = arr[ofs + 0];
    out.y = arr[ofs + 1];
    return out;
  };
  Vec2.strictEquals = function strictEquals(a, b) {
    return a.x === b.x && a.y === b.y;
  };
  Vec2.equals = function equals(a, b, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return abs(a.x - b.x) <= epsilon * _max$1(1.0, abs(a.x), abs(b.x)) && abs(a.y - b.y) <= epsilon * _max$1(1.0, abs(a.y), abs(b.y));
  };
  Vec2.angle = function angle(a, b) {
    var magSqr1 = a.x * a.x + a.y * a.y;
    var magSqr2 = b.x * b.x + b.y * b.y;
    if (magSqr1 === 0 || magSqr2 === 0) {
      return 0.0;
    }
    var dot = a.x * b.x + a.y * b.y;
    var cosine = dot / sqrt$1(magSqr1 * magSqr2);
    cosine = clamp(cosine, -1, 1.0);
    return acos$1(cosine);
  };
  var _proto = Vec2.prototype;
  _proto.clone = function clone() {
    return new Vec2(this.x, this.y);
  };
  _proto.set = function set(x, y) {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x || 0;
      this.y = y || 0;
    }
    return this;
  };
  _proto.equals = function equals(other, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return Vec2.equals(this, other, epsilon);
  };
  _proto.equals2f = function equals2f(x, y, epsilon) {
    if (epsilon === void 0) {
      epsilon = EPSILON;
    }
    return abs(this.x - x) <= epsilon * _max$1(1.0, abs(this.x), abs(x)) && abs(this.y - y) <= epsilon * _max$1(1.0, abs(this.y), abs(y));
  };
  _proto.strictEquals = function strictEquals(other) {
    return other && this.x === other.x && this.y === other.y;
  };
  _proto.strictEquals2f = function strictEquals2f(x, y) {
    return this.x === x && this.y === y;
  };
  _proto.toString = function toString() {
    return "(" + this.x + ", " + this.y + ")";
  };
  _proto.lerp = function lerp(to, ratio) {
    var x = this.x;
    var y = this.y;
    this.x = x + ratio * (to.x - x);
    this.y = y + ratio * (to.y - y);
    return this;
  };
  _proto.clampf = function clampf(minInclusive, maxInclusive) {
    this.x = clamp(this.x, minInclusive.x, maxInclusive.x);
    this.y = clamp(this.y, minInclusive.y, maxInclusive.y);
    return this;
  };
  _proto.add = function add(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  };
  _proto.add2f = function add2f(x, y) {
    this.x += x;
    this.y += y;
    return this;
  };
  _proto.subtract = function subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  };
  _proto.subtract2f = function subtract2f(x, y) {
    this.x -= x;
    this.y -= y;
    return this;
  };
  _proto.multiplyScalar = function multiplyScalar(scalar) {
    if (typeof scalar === 'object') {
      warnID(16359);
    }
    this.x *= scalar;
    this.y *= scalar;
    return this;
  };
  _proto.multiply = function multiply(other) {
    if (typeof other !== 'object') {
      warnID(16360);
    }
    this.x *= other.x;
    this.y *= other.y;
    return this;
  };
  _proto.multiply2f = function multiply2f(x, y) {
    this.x *= x;
    this.y *= y;
    return this;
  };
  _proto.divide = function divide(other) {
    this.x /= other.x;
    this.y /= other.y;
    return this;
  };
  _proto.divide2f = function divide2f(x, y) {
    this.x /= x;
    this.y /= y;
    return this;
  };
  _proto.negative = function negative() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  };
  _proto.dot = function dot(other) {
    return this.x * other.x + this.y * other.y;
  };
  _proto.cross = function cross(other) {
    return this.x * other.y - this.y * other.x;
  };
  _proto.length = function length() {
    return sqrt$1(this.x * this.x + this.y * this.y);
  };
  _proto.lengthSqr = function lengthSqr() {
    return this.x * this.x + this.y * this.y;
  };
  _proto.normalize = function normalize() {
    var self = this;
    var x = self.x;
    var y = self.y;
    var len = x * x + y * y;
    if (len > 0) {
      len = 1 / sqrt$1(len);
      self.x *= len;
      self.y *= len;
    }
    return self;
  };
  _proto.angle = function angle(other) {
    var magSqr1 = this.lengthSqr();
    var magSqr2 = other.lengthSqr();
    if (magSqr1 === 0 || magSqr2 === 0) {
      return 0.0;
    }
    var dot = this.dot(other);
    var cosine = dot / sqrt$1(magSqr1 * magSqr2);
    cosine = clamp(cosine, -1, 1.0);
    return acos$1(cosine);
  };
  _proto.signAngle = function signAngle(other) {
    var cross = this.cross(other);
    var dot = this.dot(other);
    return atan2(cross, dot);
  };
  _proto.rotate = function rotate(radians) {
    var x = this.x;
    var y = this.y;
    var s = sin(radians);
    var c = cos$1(radians);
    this.x = c * x - s * y;
    this.y = s * x + c * y;
    return this;
  };
  _proto.project = function project(other) {
    var scalar = this.dot(other) / other.dot(other);
    this.x = other.x * scalar;
    this.y = other.y * scalar;
    return this;
  };
  _proto.transformMat4 = function transformMat4(matrix) {
    var x = this.x;
    var y = this.y;
    this.x = matrix.m00 * x + matrix.m04 * y + matrix.m12;
    this.y = matrix.m01 * x + matrix.m05 * y + matrix.m13;
    return this;
  };
  _proto.toVec3 = function toVec3() {
    return new Vec3(this.x, this.y, 0);
  };
  return Vec2;
}(ValueType);
Vec2.ZERO = freezeVec2(0, 0);
Vec2.ONE = freezeVec2(1, 1);
Vec2.NEG_ONE = freezeVec2(-1, -1);
Vec2.UNIT_X = freezeVec2(1, 0);
Vec2.UNIT_Y = freezeVec2(0, 1);
CCClass.fastDefine('cc.Vec2', Vec2, {
  x: 0,
  y: 0
});
legacyCC.Vec2 = Vec2;
function v2$1(x, y) {
  return new Vec2(x, y);
}
legacyCC.v2 = v2$1;

replaceProperty(Vec2, 'Vec2', [{
  name: 'sub',
  newName: 'subtract',
  target: Vec2,
  targetName: 'Vec2'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Vec2,
  targetName: 'Vec2'
}, {
  name: 'div',
  newName: 'divide',
  target: Vec2,
  targetName: 'Vec2'
}, {
  name: 'dist',
  newName: 'distance',
  target: Vec2,
  targetName: 'Vec2'
}, {
  name: 'sqrDist',
  newName: 'squaredDistance',
  target: Vec2,
  targetName: 'Vec2'
}, {
  name: 'mag',
  newName: 'len',
  target: Vec2,
  targetName: 'Vec2'
}, {
  name: 'sqrMag',
  newName: 'lengthSqr',
  target: Vec2,
  targetName: 'Vec2'
}, {
  name: 'scale',
  newName: 'multiplyScalar',
  target: Vec2,
  targetName: 'Vec2'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Vec2,
  targetName: 'Vec2'
}]);
replaceProperty(Vec2.prototype, 'Vec2', [{
  name: 'mag',
  newName: 'length',
  target: Vec2.prototype,
  targetName: 'Vec2'
}, {
  name: 'magSqr',
  newName: 'lengthSqr',
  target: Vec2.prototype,
  targetName: 'Vec2'
}, {
  name: 'scale',
  newName: 'multiplyScalar',
  target: Vec2.prototype,
  targetName: 'Vec2'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Vec2.prototype,
  targetName: 'Vec2'
}]);
replaceProperty(Vec3, 'Vec3', [{
  name: 'sub',
  newName: 'subtract',
  target: Vec3,
  targetName: 'Vec3'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Vec3,
  targetName: 'Vec3'
}, {
  name: 'div',
  newName: 'divide',
  target: Vec3,
  targetName: 'Vec3'
}, {
  name: 'dist',
  newName: 'distance',
  target: Vec3,
  targetName: 'Vec3'
}, {
  name: 'sqrDist',
  newName: 'squaredDistance',
  target: Vec3,
  targetName: 'Vec3'
}, {
  name: 'mag',
  newName: 'len',
  target: Vec3,
  targetName: 'Vec3'
}, {
  name: 'sqrMag',
  newName: 'lengthSqr',
  target: Vec3,
  targetName: 'Vec3'
}, {
  name: 'scale',
  newName: 'multiplyScalar',
  target: Vec3,
  targetName: 'Vec3'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Vec3,
  targetName: 'Vec3'
}]);
replaceProperty(Vec3.prototype, 'Vec3', [{
  name: 'mag',
  newName: 'length',
  target: Vec3.prototype,
  targetName: 'Vec3'
}, {
  name: 'magSqr',
  newName: 'lengthSqr',
  target: Vec3.prototype,
  targetName: 'Vec3'
}, {
  name: 'scale',
  newName: 'multiplyScalar',
  target: Vec3.prototype,
  targetName: 'Vec3'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Vec3.prototype,
  targetName: 'Vec3'
}]);
replaceProperty(Vec4, 'Vec4', [{
  name: 'sub',
  newName: 'subtract',
  target: Vec4,
  targetName: 'Vec4'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Vec4,
  targetName: 'Vec4'
}, {
  name: 'div',
  newName: 'divide',
  target: Vec4,
  targetName: 'Vec4'
}, {
  name: 'dist',
  newName: 'distance',
  target: Vec4,
  targetName: 'Vec4'
}, {
  name: 'sqrDist',
  newName: 'squaredDistance',
  target: Vec4,
  targetName: 'Vec4'
}, {
  name: 'mag',
  newName: 'len',
  target: Vec4,
  targetName: 'Vec4'
}, {
  name: 'sqrMag',
  newName: 'lengthSqr',
  target: Vec4,
  targetName: 'Vec4'
}, {
  name: 'scale',
  newName: 'multiplyScalar',
  target: Vec4,
  targetName: 'Vec4'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Vec4,
  targetName: 'Vec4'
}]);
replaceProperty(Vec4.prototype, 'Vec4', [{
  name: 'mag',
  newName: 'length',
  target: Vec4.prototype,
  targetName: 'Vec4'
}, {
  name: 'magSqr',
  newName: 'lengthSqr',
  target: Vec4.prototype,
  targetName: 'Vec4'
}, {
  name: 'scale',
  newName: 'multiplyScalar',
  target: Vec4.prototype,
  targetName: 'Vec4'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Vec4.prototype,
  targetName: 'Vec4'
}]);
replaceProperty(Quat, 'Quat', [{
  name: 'mag',
  newName: 'len',
  target: Quat,
  targetName: 'Quat'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Quat,
  targetName: 'Quat'
}, {
  name: 'sqrMag',
  newName: 'lengthSqr',
  target: Quat,
  targetName: 'Quat'
}, {
  name: 'scale',
  newName: 'multiplyScalar',
  target: Quat,
  targetName: 'Quat'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Quat,
  targetName: 'Quat'
}]);
replaceProperty(Quat.prototype, 'Quat', [{
  name: 'scale',
  newName: 'multiplyScalar',
  target: Quat.prototype,
  targetName: 'Quat'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Quat.prototype,
  targetName: 'Quat'
}]);
replaceProperty(Color, 'Color', [{
  name: 'sub',
  newName: 'subtract',
  target: Color,
  targetName: 'Color'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Color,
  targetName: 'Color'
}, {
  name: 'div',
  newName: 'divide',
  target: Color,
  targetName: 'Color'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Color,
  targetName: 'Color'
}, {
  name: 'fromHex',
  newName: 'fromHEX',
  customFunction: function customFunction() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var arg1 = args[1].toString(16);
    return legacyCC.Color.fromHEX(args[0], arg1);
  }
}]);
replaceProperty(Mat3, 'Mat3', [{
  name: 'sub',
  newName: 'subtract',
  target: Mat3,
  targetName: 'Mat3'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Mat3,
  targetName: 'Mat3'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Mat3,
  targetName: 'Mat3'
}, {
  name: 'transfrom',
  newName: 'transform',
  target: Mat3,
  targetName: 'Mat3'
}]);
replaceProperty(Mat3.prototype, 'Mat3', [{
  name: 'sub',
  newName: 'subtract',
  target: Mat3.prototype,
  targetName: 'Mat3'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Mat3.prototype,
  targetName: 'Mat3'
}, {
  name: 'mulScalar',
  newName: 'multiplyScalar',
  target: Mat3.prototype,
  targetName: 'Mat3'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Mat3.prototype,
  targetName: 'Mat3'
}]);
replaceProperty(Mat4, 'Mat4', [{
  name: 'sub',
  newName: 'subtract',
  target: Mat4,
  targetName: 'Mat4'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Mat4,
  targetName: 'Mat4'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Mat4,
  targetName: 'Mat4'
}]);
replaceProperty(Mat4.prototype, 'Mat4', [{
  name: 'sub',
  newName: 'subtract',
  target: Mat4.prototype,
  targetName: 'Mat4'
}, {
  name: 'mul',
  newName: 'multiply',
  target: Mat4.prototype,
  targetName: 'Mat4'
}, {
  name: 'mulScalar',
  newName: 'multiplyScalar',
  target: Mat4.prototype,
  targetName: 'Mat4'
}, {
  name: 'exactEquals',
  newName: 'strictEquals',
  target: Mat4.prototype,
  targetName: 'Mat4'
}]);

var MathType;
(function (MathType) {
  MathType[MathType["VEC2"] = 0] = "VEC2";
  MathType[MathType["VEC3"] = 1] = "VEC3";
  MathType[MathType["VEC4"] = 2] = "VEC4";
  MathType[MathType["QUATERNION"] = 3] = "QUATERNION";
  MathType[MathType["MAT3"] = 4] = "MAT3";
  MathType[MathType["MAT4"] = 5] = "MAT4";
  MathType[MathType["SIZE"] = 6] = "SIZE";
  MathType[MathType["RECT"] = 7] = "RECT";
  MathType[MathType["COLOR"] = 8] = "COLOR";
})(MathType || (MathType = {}));

var _Size;
var Size = function (_ValueType) {
  function Size(width, height) {
    var _this;
    _this = _ValueType.call(this) || this;
    if (typeof width === 'object') {
      _this.width = width.width;
      _this.height = width.height;
    } else {
      _this.width = width || 0;
      _this.height = height || 0;
    }
    return _this;
  }
  _inheritsLoose(Size, _ValueType);
  Size.lerp = function lerp(out, from, to, ratio) {
    out.width = from.width + (to.width - from.width) * ratio;
    out.height = from.height + (to.height - from.height) * ratio;
    return out;
  };
  Size.equals = function equals(a, b) {
    return a.width === b.width && a.height === b.height;
  };
  var _proto = Size.prototype;
  _proto.clone = function clone() {
    return new Size(this.width, this.height);
  };
  _proto.set = function set(width, height) {
    if (typeof width === 'object') {
      this.height = width.height;
      this.width = width.width;
    } else {
      this.width = width || 0;
      this.height = height || 0;
    }
    return this;
  };
  _proto.equals = function equals(other) {
    return this.width === other.width && this.height === other.height;
  };
  _proto.lerp = function lerp(to, ratio) {
    this.width += (to.width - this.width) * ratio;
    this.height += (to.height - this.height) * ratio;
    return this;
  };
  _proto.toString = function toString() {
    return "(" + this.width + ", " + this.height + ")";
  };
  return _createClass(Size, [{
    key: "x",
    get: function get() {
      return this.width;
    },
    set: function set(val) {
      this.width = val;
    }
  }, {
    key: "y",
    get: function get() {
      return this.height;
    },
    set: function set(val) {
      this.height = val;
    }
  }]);
}(ValueType);
_Size = Size;
Size.ZERO = Object.freeze(new _Size(0, 0));
Size.ONE = Object.freeze(new _Size(1, 1));
CCClass.fastDefine('cc.Size', Size, {
  width: 0,
  height: 0
});
function size(width, height) {
  if (width === void 0) {
    width = 0;
  }
  if (height === void 0) {
    height = 0;
  }
  return new Size(width, height);
}
legacyCC.size = size;
legacyCC.Size = Size;

var max$2 = Math.max;
var min$1 = Math.min;
var Rect = function (_ValueType) {
  function Rect(x, y, width, height) {
    var _this;
    _this = _ValueType.call(this) || this;
    if (typeof x === 'object') {
      _this.x = x.x;
      _this.y = x.y;
      _this.width = x.width;
      _this.height = x.height;
    } else {
      _this.x = x || 0;
      _this.y = y || 0;
      _this.width = width || 0;
      _this.height = height || 0;
    }
    return _this;
  }
  _inheritsLoose(Rect, _ValueType);
  Rect.fromMinMax = function fromMinMax(out, v1, v2) {
    var minX = min$1(v1.x, v2.x);
    var minY = min$1(v1.y, v2.y);
    var maxX = max$2(v1.x, v2.x);
    var maxY = max$2(v1.y, v2.y);
    out.x = minX;
    out.y = minY;
    out.width = maxX - minX;
    out.height = maxY - minY;
    return out;
  };
  Rect.lerp = function lerp(out, from, to, ratio) {
    var x = from.x;
    var y = from.y;
    var w = from.width;
    var h = from.height;
    out.x = x + (to.x - x) * ratio;
    out.y = y + (to.y - y) * ratio;
    out.width = w + (to.width - w) * ratio;
    out.height = h + (to.height - h) * ratio;
    return out;
  };
  Rect.intersection = function intersection(out, one, other) {
    var axMin = one.x;
    var ayMin = one.y;
    var axMax = one.x + one.width;
    var ayMax = one.y + one.height;
    var bxMin = other.x;
    var byMin = other.y;
    var bxMax = other.x + other.width;
    var byMax = other.y + other.height;
    out.x = max$2(axMin, bxMin);
    out.y = max$2(ayMin, byMin);
    out.width = min$1(axMax, bxMax) - out.x;
    out.height = min$1(ayMax, byMax) - out.y;
    return out;
  };
  Rect.union = function union(out, one, other) {
    var x = one.x;
    var y = one.y;
    var w = one.width;
    var h = one.height;
    var bx = other.x;
    var by = other.y;
    var bw = other.width;
    var bh = other.height;
    out.x = min$1(x, bx);
    out.y = min$1(y, by);
    out.width = max$2(x + w, bx + bw) - out.x;
    out.height = max$2(y + h, by + bh) - out.y;
    return out;
  };
  Rect.equals = function equals(a, b) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
  };
  var _proto = Rect.prototype;
  _proto.clone = function clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  };
  _proto.set = function set(x, y, width, height) {
    var self = this;
    if (typeof x === 'object') {
      self.x = x.x;
      self.y = x.y;
      self.width = x.width;
      self.height = x.height;
    } else {
      self.x = x || 0;
      self.y = y || 0;
      self.width = width || 0;
      self.height = height || 0;
    }
    return self;
  };
  _proto.equals = function equals(other) {
    var self = this;
    return self.x === other.x && self.y === other.y && self.width === other.width && self.height === other.height;
  };
  _proto.lerp = function lerp(to, ratio) {
    var self = this;
    var x = self.x;
    var y = self.y;
    var w = self.width;
    var h = self.height;
    self.x = x + (to.x - x) * ratio;
    self.y = y + (to.y - y) * ratio;
    self.width = w + (to.width - w) * ratio;
    self.height = h + (to.height - h) * ratio;
    return self;
  };
  _proto.toString = function toString() {
    var self = this;
    return "(" + self.x + ", " + self.y + ", " + self.width + ", " + self.height + ")";
  };
  _proto.intersects = function intersects(other) {
    var self = this;
    var maxax = self.x + self.width;
    var maxay = self.y + self.height;
    var maxbx = other.x + other.width;
    var maxby = other.y + other.height;
    return !(maxax < other.x || maxbx < self.x || maxay < other.y || maxby < self.y);
  };
  _proto.contains = function contains(point) {
    var self = this;
    return self.x <= point.x && self.x + self.width >= point.x && self.y <= point.y && self.y + self.height >= point.y;
  };
  _proto.containsRect = function containsRect(other) {
    var self = this;
    return self.x <= other.x && self.x + self.width >= other.x + other.width && self.y <= other.y && self.y + self.height >= other.y + other.height;
  };
  _proto.transformMat4 = function transformMat4(mat) {
    var self = this;
    var ol = self.x;
    var ob = self.y;
    var or = ol + self.width;
    var ot = ob + self.height;
    var lbx = mat.m00 * ol + mat.m04 * ob + mat.m12;
    var lby = mat.m01 * ol + mat.m05 * ob + mat.m13;
    var rbx = mat.m00 * or + mat.m04 * ob + mat.m12;
    var rby = mat.m01 * or + mat.m05 * ob + mat.m13;
    var ltx = mat.m00 * ol + mat.m04 * ot + mat.m12;
    var lty = mat.m01 * ol + mat.m05 * ot + mat.m13;
    var rtx = mat.m00 * or + mat.m04 * ot + mat.m12;
    var rty = mat.m01 * or + mat.m05 * ot + mat.m13;
    var minX = min$1(lbx, rbx, ltx, rtx);
    var maxX = max$2(lbx, rbx, ltx, rtx);
    var minY = min$1(lby, rby, lty, rty);
    var maxY = max$2(lby, rby, lty, rty);
    self.x = minX;
    self.y = minY;
    self.width = maxX - minX;
    self.height = maxY - minY;
    return self;
  };
  _proto.transformMat4ToPoints = function transformMat4ToPoints(mat, out_lb, out_lt, out_rt, out_rb) {
    var self = this;
    var ol = self.x;
    var ob = self.y;
    var or = ol + self.width;
    var ot = ob + self.height;
    out_lb.x = mat.m00 * ol + mat.m04 * ob + mat.m12;
    out_lb.y = mat.m01 * ol + mat.m05 * ob + mat.m13;
    out_rb.x = mat.m00 * or + mat.m04 * ob + mat.m12;
    out_rb.y = mat.m01 * or + mat.m05 * ob + mat.m13;
    out_lt.x = mat.m00 * ol + mat.m04 * ot + mat.m12;
    out_lt.y = mat.m01 * ol + mat.m05 * ot + mat.m13;
    out_rt.x = mat.m00 * or + mat.m04 * ot + mat.m12;
    out_rt.y = mat.m01 * or + mat.m05 * ot + mat.m13;
  };
  return _createClass(Rect, [{
    key: "xMin",
    get: function get() {
      return this.x;
    },
    set: function set(value) {
      this.width += this.x - value;
      this.x = value;
    }
  }, {
    key: "yMin",
    get: function get() {
      return this.y;
    },
    set: function set(value) {
      this.height += this.y - value;
      this.y = value;
    }
  }, {
    key: "xMax",
    get: function get() {
      return this.x + this.width;
    },
    set: function set(value) {
      this.width = value - this.x;
    }
  }, {
    key: "yMax",
    get: function get() {
      return this.y + this.height;
    },
    set: function set(value) {
      this.height = value - this.y;
    }
  }, {
    key: "center",
    get: function get() {
      return new Vec2(this.x + this.width * 0.5, this.y + this.height * 0.5);
    },
    set: function set(value) {
      this.x = value.x - this.width * 0.5;
      this.y = value.y - this.height * 0.5;
    }
  }, {
    key: "origin",
    get: function get() {
      return new Vec2(this.x, this.y);
    },
    set: function set(value) {
      this.x = value.x;
      this.y = value.y;
    }
  }, {
    key: "size",
    get: function get() {
      return new Size(this.width, this.height);
    },
    set: function set(value) {
      this.width = value.width;
      this.height = value.height;
    }
  }, {
    key: "z",
    get: function get() {
      return this.width;
    },
    set: function set(val) {
      this.width = val;
    }
  }, {
    key: "w",
    get: function get() {
      return this.height;
    },
    set: function set(val) {
      this.height = val;
    }
  }]);
}(ValueType);
CCClass.fastDefine('cc.Rect', Rect, {
  x: 0,
  y: 0,
  width: 0,
  height: 0
});
legacyCC.Rect = Rect;
function rect(x, y, width, height) {
  if (x === void 0) {
    x = 0;
  }
  if (y === void 0) {
    y = 0;
  }
  if (width === void 0) {
    width = 0;
  }
  if (height === void 0) {
    height = 0;
  }
  return new Rect(x, y, width, height);
}
legacyCC.rect = rect;

var MATH_FLOAT_ARRAY = Float64Array;
var MathBase = function (_ValueType) {
  function MathBase() {
    return _ValueType.apply(this, arguments) || this;
  }
  _inheritsLoose(MathBase, _ValueType);
  MathBase.createFloatArray = function createFloatArray(size) {
    return new MATH_FLOAT_ARRAY(size);
  };
  return _createClass(MathBase, [{
    key: "array",
    get: function get() {
      return this._array;
    }
  }]);
}(ValueType);

var math = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Color: Color,
    EPSILON: EPSILON,
    HALF_PI: HALF_PI,
    MATH_FLOAT_ARRAY: MATH_FLOAT_ARRAY,
    Mat3: Mat3,
    Mat4: Mat4,
    MathBase: MathBase,
    Quat: Quat,
    Rect: Rect,
    Size: Size,
    TWO_PI: TWO_PI,
    Vec2: Vec2,
    Vec3: Vec3,
    Vec4: Vec4,
    absMax: absMax,
    absMaxComponent: absMaxComponent,
    approx: approx,
    bits: bits,
    clamp: clamp,
    clamp01: clamp01,
    color: color,
    enumerableProps: enumerableProps,
    equals: equals,
    floatToHalf: floatToHalf,
    halfToFloat: halfToFloat,
    inverseLerp: inverseLerp,
    lerp: lerp,
    mat4: mat4,
    nextPow2: nextPow2,
    pingPong: pingPong,
    preTransforms: preTransforms,
    pseudoRandom: pseudoRandom,
    pseudoRandomRange: pseudoRandomRange,
    pseudoRandomRangeInt: pseudoRandomRangeInt,
    quat: quat,
    random: random,
    randomRange: randomRange,
    randomRangeInt: randomRangeInt,
    rect: rect,
    repeat: repeat,
    setRandGenerator: setRandGenerator,
    size: size,
    toDegree: toDegree,
    toRadian: toRadian,
    v2: v2$1,
    v3: v3,
    v4: v4
});

var X = new Vec3();
var Y = new Vec3();
var Z = new Vec3();
var d = new Vec3();
var min = new Vec3();
var max$1 = new Vec3();
var u = new Array(3);
var e = new Array(3);
function point_plane(point, plane_) {
  return Vec3.dot(plane_.n, point) - plane_.d;
}
function pt_point_plane(out, point, plane_) {
  var t = point_plane(point, plane_);
  return Vec3.subtract(out, point, Vec3.multiplyScalar(out, plane_.n, t));
}
function pt_point_aabb(out, point, aabb_) {
  Vec3.copy(out, point);
  Vec3.subtract(min, aabb_.center, aabb_.halfExtents);
  Vec3.add(max$1, aabb_.center, aabb_.halfExtents);
  out.x = out.x < min.x ? min.x : out.x;
  out.y = out.y < min.y ? min.y : out.y;
  out.z = out.z < min.z ? min.z : out.z;
  out.x = out.x > max$1.x ? max$1.x : out.x;
  out.y = out.y > max$1.y ? max$1.y : out.y;
  out.z = out.z > max$1.z ? max$1.z : out.z;
  return out;
}
function pt_point_obb(out, point, obb_) {
  Vec3.set(X, obb_.orientation.m00, obb_.orientation.m01, obb_.orientation.m02);
  Vec3.set(Y, obb_.orientation.m03, obb_.orientation.m04, obb_.orientation.m05);
  Vec3.set(Z, obb_.orientation.m06, obb_.orientation.m07, obb_.orientation.m08);
  u[0] = X;
  u[1] = Y;
  u[2] = Z;
  e[0] = obb_.halfExtents.x;
  e[1] = obb_.halfExtents.y;
  e[2] = obb_.halfExtents.z;
  Vec3.subtract(d, point, obb_.center);
  Vec3.set(out, obb_.center.x, obb_.center.y, obb_.center.z);
  for (var i = 0; i < 3; i++) {
    var dist = Vec3.dot(d, u[i]);
    if (dist > e[i]) {
      dist = e[i];
    }
    if (dist < -e[i]) {
      dist = -e[i];
    }
    out.x += dist * u[i].x;
    out.y += dist * u[i].y;
    out.z += dist * u[i].z;
  }
  return out;
}
function pt_point_line(out, point, linePointA, linePointB) {
  Vec3.subtract(X, linePointA, linePointB);
  var dir = X.clone();
  var dirSquaredLength = Vec3.lengthSqr(dir);
  if (dirSquaredLength === 0) {
    Vec3.copy(out, linePointA);
  } else {
    Vec3.subtract(X, point, linePointA);
    var t = Vec3.dot(X, dir) / dirSquaredLength;
    if (t < 0) {
      Vec3.copy(out, linePointA);
    } else if (t > 1) {
      Vec3.copy(out, linePointB);
    } else {
      Vec3.scaleAndAdd(out, linePointA, dir, t);
    }
  }
}

var distance = /*#__PURE__*/Object.freeze({
    __proto__: null,
    point_plane: point_plane,
    pt_point_aabb: pt_point_aabb,
    pt_point_line: pt_point_line,
    pt_point_obb: pt_point_obb,
    pt_point_plane: pt_point_plane
});

var ShapeType;
(function (ShapeType) {
  ShapeType[ShapeType["SHAPE_RAY"] = 1] = "SHAPE_RAY";
  ShapeType[ShapeType["SHAPE_LINE"] = 2] = "SHAPE_LINE";
  ShapeType[ShapeType["SHAPE_SPHERE"] = 4] = "SHAPE_SPHERE";
  ShapeType[ShapeType["SHAPE_AABB"] = 8] = "SHAPE_AABB";
  ShapeType[ShapeType["SHAPE_OBB"] = 16] = "SHAPE_OBB";
  ShapeType[ShapeType["SHAPE_PLANE"] = 32] = "SHAPE_PLANE";
  ShapeType[ShapeType["SHAPE_TRIANGLE"] = 64] = "SHAPE_TRIANGLE";
  ShapeType[ShapeType["SHAPE_FRUSTUM"] = 128] = "SHAPE_FRUSTUM";
  ShapeType[ShapeType["SHAPE_FRUSTUM_ACCURATE"] = 256] = "SHAPE_FRUSTUM_ACCURATE";
  ShapeType[ShapeType["SHAPE_CAPSULE"] = 512] = "SHAPE_CAPSULE";
  ShapeType[ShapeType["SHAPE_SPLINE"] = 1024] = "SHAPE_SPLINE";
})(ShapeType || (ShapeType = {}));
var ShapeType_default = ShapeType;

var Line = function () {
  function Line(sx, sy, sz, ex, ey, ez) {
    if (sx === void 0) {
      sx = 0;
    }
    if (sy === void 0) {
      sy = 0;
    }
    if (sz === void 0) {
      sz = 0;
    }
    if (ex === void 0) {
      ex = 0;
    }
    if (ey === void 0) {
      ey = 0;
    }
    if (ez === void 0) {
      ez = -1;
    }
    this.s = void 0;
    this.e = void 0;
    this._type = void 0;
    this._type = ShapeType.SHAPE_LINE;
    this.s = new Vec3(sx, sy, sz);
    this.e = new Vec3(ex, ey, ez);
  }
  Line.create = function create(sx, sy, sz, ex, ey, ez) {
    return new Line(sx, sy, sz, ex, ey, ez);
  };
  Line.clone = function clone(a) {
    return new Line(a.s.x, a.s.y, a.s.z, a.e.x, a.e.y, a.e.z);
  };
  Line.copy = function copy(out, a) {
    Vec3.copy(out.s, a.s);
    Vec3.copy(out.e, a.e);
    return out;
  };
  Line.fromPoints = function fromPoints(out, start, end) {
    Vec3.copy(out.s, start);
    Vec3.copy(out.e, end);
    return out;
  };
  Line.set = function set(out, sx, sy, sz, ex, ey, ez) {
    out.s.x = sx;
    out.s.y = sy;
    out.s.z = sz;
    out.e.x = ex;
    out.e.y = ey;
    out.e.z = ez;
    return out;
  };
  Line.len = function len(a) {
    return Vec3.distance(a.s, a.e);
  };
  var _proto = Line.prototype;
  _proto.length = function length() {
    return Vec3.distance(this.s, this.e);
  };
  return _createClass(Line, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}();

var Ray = function () {
  function Ray(ox, oy, oz, dx, dy, dz) {
    if (ox === void 0) {
      ox = 0;
    }
    if (oy === void 0) {
      oy = 0;
    }
    if (oz === void 0) {
      oz = 0;
    }
    if (dx === void 0) {
      dx = 0;
    }
    if (dy === void 0) {
      dy = 0;
    }
    if (dz === void 0) {
      dz = -1;
    }
    this._type = ShapeType.SHAPE_RAY;
    this.o = new Vec3(ox, oy, oz);
    this.d = new Vec3(dx, dy, dz);
  }
  Ray.create = function create(ox, oy, oz, dx, dy, dz) {
    if (ox === void 0) {
      ox = 0;
    }
    if (oy === void 0) {
      oy = 0;
    }
    if (oz === void 0) {
      oz = 0;
    }
    if (dx === void 0) {
      dx = 0;
    }
    if (dy === void 0) {
      dy = 0;
    }
    if (dz === void 0) {
      dz = 1;
    }
    return new Ray(ox, oy, oz, dx, dy, dz);
  };
  Ray.clone = function clone(a) {
    return new Ray(a.o.x, a.o.y, a.o.z, a.d.x, a.d.y, a.d.z);
  };
  Ray.copy = function copy(out, a) {
    Vec3.copy(out.o, a.o);
    Vec3.copy(out.d, a.d);
    return out;
  };
  Ray.fromPoints = function fromPoints(out, origin, target) {
    Vec3.copy(out.o, origin);
    Vec3.normalize(out.d, Vec3.subtract(out.d, target, origin));
    return out;
  };
  Ray.set = function set(out, ox, oy, oz, dx, dy, dz) {
    out.o.x = ox;
    out.o.y = oy;
    out.o.z = oz;
    out.d.x = dx;
    out.d.y = dy;
    out.d.z = dz;
    return out;
  };
  var _proto = Ray.prototype;
  _proto.computeHit = function computeHit(out, distance) {
    Vec3.normalize(out, this.d);
    Vec3.scaleAndAdd(out, this.o, out, distance);
  };
  return _createClass(Ray, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}();

var _v3_tmp$2 = new Vec3();
var _offset = new Vec3();
var _min = new Vec3();
var _max = new Vec3();
function maxComponent(v) {
  return Math.max(Math.max(v.x, v.y), v.z);
}
var Sphere = function () {
  function Sphere(cx, cy, cz, r) {
    if (cx === void 0) {
      cx = 0;
    }
    if (cy === void 0) {
      cy = 0;
    }
    if (cz === void 0) {
      cz = 0;
    }
    if (r === void 0) {
      r = 1;
    }
    this._type = ShapeType.SHAPE_SPHERE;
    this._center = new Vec3(cx, cy, cz);
    this._radius = r;
  }
  Sphere.create = function create(cx, cy, cz, r) {
    return new Sphere(cx, cy, cz, r);
  };
  Sphere.clone = function clone(p) {
    return new Sphere(p.center.x, p.center.y, p.center.z, p.radius);
  };
  Sphere.copy = function copy(out, p) {
    Vec3.copy(out.center, p.center);
    out.radius = p.radius;
    return out;
  };
  Sphere.fromPoints = function fromPoints(out, minPos, maxPos) {
    Vec3.multiplyScalar(out.center, Vec3.add(_v3_tmp$2, minPos, maxPos), 0.5);
    out.radius = Vec3.subtract(_v3_tmp$2, maxPos, minPos).length() * 0.5;
    return out;
  };
  Sphere.set = function set(out, cx, cy, cz, r) {
    out.center.x = cx;
    out.center.y = cy;
    out.center.z = cz;
    out.radius = r;
    return out;
  };
  var _proto = Sphere.prototype;
  _proto.destroy = function destroy() {};
  _proto.clone = function clone() {
    return Sphere.clone(this);
  };
  _proto.copy = function copy(a) {
    return Sphere.copy(this, a);
  };
  _proto.getBoundary = function getBoundary(minPos, maxPos) {
    Vec3.set(minPos, this.center.x - this.radius, this.center.y - this.radius, this.center.z - this.radius);
    Vec3.set(maxPos, this.center.x + this.radius, this.center.y + this.radius, this.center.z + this.radius);
  };
  _proto.transform = function transform(m, pos, rot, scale, out) {
    Vec3.transformMat4(out.center, this.center, m);
    out.radius = this.radius * maxComponent(scale);
  };
  _proto.translateAndRotate = function translateAndRotate(m, rot, out) {
    Vec3.transformMat4(out.center, this.center, m);
  };
  _proto.setScale = function setScale(scale, out) {
    out.radius = this.radius * maxComponent(scale);
  };
  _proto.mergePoint = function mergePoint(point) {
    if (this.radius < 0.0) {
      this.center.set(point);
      this.radius = 0.0;
    }
    Vec3.subtract(_offset, point, this.center);
    var dist = _offset.length();
    if (dist > this.radius) {
      var half = (dist - this.radius) * 0.5;
      this.radius += half;
      Vec3.multiplyScalar(_offset, _offset, half / dist);
      Vec3.add(this.center, this.center, _offset);
    }
  };
  _proto.mergePoints = function mergePoints(points) {
    var length = points.length;
    if (length < 1) return;
    this.radius = -1;
    for (var i = 0; i < length; i++) {
      this.mergePoint(points[i]);
    }
  };
  _proto.mergeAABB = function mergeAABB(a) {
    a.getBoundary(_min, _max);
    this.mergePoint(_min);
    this.mergePoint(_max);
  };
  return _createClass(Sphere, [{
    key: "center",
    get: function get() {
      return this._center;
    },
    set: function set(val) {
      this._center = val;
    }
  }, {
    key: "radius",
    get: function get() {
      return this._radius;
    },
    set: function set(val) {
      this._radius = val;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}();

var vec3SquaredDistance = Vec3.squaredDistance;
var vec3Subtract = Vec3.subtract;
var vec3Dot = Vec3.dot;
var vec3Set$1 = Vec3.set;
var vec3Cross = Vec3.cross;
var vec3MultiplyScalar$1 = Vec3.multiplyScalar;
var vec3Copy = Vec3.copy;
var vec3Add$1 = Vec3.add;
var vec3ScaleAndAdd = Vec3.scaleAndAdd;
var mathMax = Math.max;
var mathMin = Math.min;
var mathAbs$2 = Math.abs;
var rayPlane = function () {
  return function (ray, plane) {
    var denom = vec3Dot(ray.d, plane.n);
    if (mathAbs$2(denom) < Number.EPSILON) {
      return 0;
    }
    var d = point_plane(ray.o, plane);
    var t = -d / denom;
    if (t < 0) {
      return 0;
    }
    return t;
  };
}();
var rayTriangle = function () {
  var ab = v3();
  var ac = v3();
  var pvec = v3();
  var tvec = v3();
  var qvec = v3();
  return function (ray, triangle, doubleSided) {
    vec3Subtract(ab, triangle.b, triangle.a);
    vec3Subtract(ac, triangle.c, triangle.a);
    vec3Cross(pvec, ray.d, ac);
    var det = vec3Dot(ab, pvec);
    if (det < Number.EPSILON && (!doubleSided || det > -Number.EPSILON)) {
      return 0;
    }
    var inv_det = 1 / det;
    vec3Subtract(tvec, ray.o, triangle.a);
    var u = vec3Dot(tvec, pvec) * inv_det;
    if (u < 0 || u > 1) {
      return 0;
    }
    vec3Cross(qvec, tvec, ab);
    var v = vec3Dot(ray.d, qvec) * inv_det;
    if (v < 0 || u + v > 1) {
      return 0;
    }
    var t = vec3Dot(ac, qvec) * inv_det;
    return t < 0 ? 0 : t;
  };
}();
var raySphere = function () {
  var e = v3();
  return function (ray, sphere) {
    var r = sphere.radius;
    var c = sphere.center;
    var o = ray.o;
    var d = ray.d;
    var rSq = r * r;
    vec3Subtract(e, c, o);
    var eSq = e.lengthSqr();
    var aLength = vec3Dot(e, d);
    var fSq = rSq - (eSq - aLength * aLength);
    if (fSq < 0) {
      return 0;
    }
    var f = Math.sqrt(fSq);
    var t = eSq < rSq ? aLength + f : aLength - f;
    if (t < 0) {
      return 0;
    }
    return t;
  };
}();
var rayAABB = function () {
  var min = v3();
  var max = v3();
  return function (ray, aabb) {
    vec3Subtract(min, aabb.center, aabb.halfExtents);
    vec3Add$1(max, aabb.center, aabb.halfExtents);
    return rayAABB2(ray, min, max);
  };
}();
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
  var tmin = mathMax(mathMax(mathMin(t1, t2), mathMin(t3, t4)), mathMin(t5, t6));
  var tmax = mathMin(mathMin(mathMax(t1, t2), mathMax(t3, t4)), mathMax(t5, t6));
  if (tmax < 0 || tmin > tmax) {
    return 0;
  }
  return tmin > 0 ? tmin : tmax;
}
var rayOBB = function () {
  var center = v3();
  var o = v3();
  var d = v3();
  var X = v3();
  var Y = v3();
  var Z = v3();
  var p = v3();
  var size = new Array(3);
  var f = new Array(3);
  var e = new Array(3);
  var t = new Array(6);
  return function (ray, obb) {
    var halfExtents = obb.halfExtents;
    var orientation = obb.orientation;
    size[0] = halfExtents.x;
    size[1] = halfExtents.y;
    size[2] = halfExtents.z;
    center = obb.center;
    o = ray.o;
    d = ray.d;
    vec3Set$1(X, orientation.m00, orientation.m01, orientation.m02);
    vec3Set$1(Y, orientation.m03, orientation.m04, orientation.m05);
    vec3Set$1(Z, orientation.m06, orientation.m07, orientation.m08);
    vec3Subtract(p, center, o);
    f[0] = vec3Dot(X, d);
    f[1] = vec3Dot(Y, d);
    f[2] = vec3Dot(Z, d);
    e[0] = vec3Dot(X, p);
    e[1] = vec3Dot(Y, p);
    e[2] = vec3Dot(Z, p);
    for (var i = 0; i < 3; ++i) {
      if (f[i] === 0) {
        if (-e[i] - size[i] > 0 || -e[i] + size[i] < 0) {
          return 0;
        }
        f[i] = 0.0000001;
      }
      t[i * 2 + 0] = (e[i] + size[i]) / f[i];
      t[i * 2 + 1] = (e[i] - size[i]) / f[i];
    }
    var tmin = mathMax(mathMax(mathMin(t[0], t[1]), mathMin(t[2], t[3])), mathMin(t[4], t[5]));
    var tmax = mathMin(mathMin(mathMax(t[0], t[1]), mathMax(t[2], t[3])), mathMax(t[4], t[5]));
    if (tmax < 0 || tmin > tmax) {
      return 0;
    }
    return tmin > 0 ? tmin : tmax;
  };
}();
var rayCapsule = function () {
  var v3_0 = v3();
  var v3_1 = v3();
  var v3_2 = v3();
  var v3_3 = v3();
  var v3_4 = v3();
  var v3_5 = v3();
  var v3_6 = v3();
  var sphere_0 = new Sphere();
  return function (ray, capsule) {
    var A = capsule.ellipseCenter0;
    var B = capsule.ellipseCenter1;
    var BA = vec3Subtract(v3_1, B, A);
    if (BA.length() < EPSILON) {
      sphere_0.radius = capsule.radius;
      sphere_0.center.set(capsule.ellipseCenter0);
      return intersect.raySphere(ray, sphere_0);
    }
    var O = ray.o;
    var OA = vec3Subtract(v3_2, O, A);
    var vRayNorm = Vec3.normalize(v3_0, ray.d);
    var VxBA = vec3Cross(v3_3, vRayNorm, BA);
    var a = VxBA.lengthSqr();
    if (a === 0) {
      sphere_0.radius = capsule.radius;
      var BO = vec3Subtract(v3_4, B, O);
      if (OA.lengthSqr() < BO.lengthSqr()) {
        sphere_0.center.set(A);
      } else {
        sphere_0.center.set(B);
      }
      return intersect.raySphere(ray, sphere_0);
    }
    var OAxBA = vec3Cross(v3_4, OA, BA);
    var ab2 = BA.lengthSqr();
    var b = 2 * vec3Dot(VxBA, OAxBA);
    var radiusSqr = capsule.radius * capsule.radius;
    var c = OAxBA.lengthSqr() - radiusSqr * ab2;
    var d = b * b - 4 * a * c;
    if (d < 0) {
      return 0;
    }
    var t = (-b - Math.sqrt(d)) / (2 * a);
    if (t < 0) {
      sphere_0.radius = capsule.radius;
      var _BO = vec3Subtract(v3_5, B, O);
      if (OA.lengthSqr() < _BO.lengthSqr()) {
        sphere_0.center.set(capsule.ellipseCenter0);
      } else {
        sphere_0.center.set(capsule.ellipseCenter1);
      }
      return intersect.raySphere(ray, sphere_0);
    } else {
      var iPos = vec3ScaleAndAdd(v3_5, ray.o, vRayNorm, t);
      var iPosLen = vec3Subtract(v3_6, iPos, A);
      var tLimit = vec3Dot(iPosLen, BA) / ab2;
      if (tLimit >= 0 && tLimit <= 1) {
        return t;
      } else if (tLimit < 0) {
        sphere_0.radius = capsule.radius;
        sphere_0.center.set(capsule.ellipseCenter0);
        return intersect.raySphere(ray, sphere_0);
      } else if (tLimit > 1) {
        sphere_0.radius = capsule.radius;
        sphere_0.center.set(capsule.ellipseCenter1);
        return intersect.raySphere(ray, sphere_0);
      } else {
        return 0;
      }
    }
  };
}();
var linePlane = function () {
  var ab = v3();
  return function (line, plane) {
    vec3Subtract(ab, line.e, line.s);
    var t = -point_plane(line.s, plane) / vec3Dot(ab, plane.n);
    if (t < 0 || t > 1) {
      return 0;
    }
    return t;
  };
}();
var lineTriangle = function () {
  var ab = v3();
  var ac = v3();
  var qp = v3();
  var ap = v3();
  var n = v3();
  var e = v3();
  return function (line, triangle, outPt) {
    vec3Subtract(ab, triangle.b, triangle.a);
    vec3Subtract(ac, triangle.c, triangle.a);
    vec3Subtract(qp, line.s, line.e);
    vec3Cross(n, ab, ac);
    var det = vec3Dot(qp, n);
    if (det <= 0.0) {
      return 0;
    }
    vec3Subtract(ap, line.s, triangle.a);
    var t = vec3Dot(ap, n);
    if (t < 0 || t > det) {
      return 0;
    }
    vec3Cross(e, qp, ap);
    var v = vec3Dot(ac, e);
    if (v < 0 || v > det) {
      return 0;
    }
    var w = -vec3Dot(ab, e);
    if (w < 0.0 || v + w > det) {
      return 0;
    }
    if (outPt) {
      var invDet = 1.0 / det;
      v *= invDet;
      w *= invDet;
      var u = 1.0 - v - w;
      vec3Set$1(outPt, triangle.a.x * u + triangle.b.x * v + triangle.c.x * w, triangle.a.y * u + triangle.b.y * v + triangle.c.y * w, triangle.a.z * u + triangle.b.z * v + triangle.c.z * w);
    }
    return 1;
  };
}();
var r_t = new Ray();
function lineAABB(line, aabb) {
  r_t.o.set(line.s);
  vec3Subtract(r_t.d, line.e, line.s);
  r_t.d.normalize();
  var min = rayAABB(r_t, aabb);
  var len = line.length();
  if (min <= len) {
    return min;
  } else {
    return 0;
  }
}
function lineOBB(line, obb) {
  r_t.o.set(line.s);
  vec3Subtract(r_t.d, line.e, line.s);
  r_t.d.normalize();
  var min = rayOBB(r_t, obb);
  var len = line.length();
  if (min <= len) {
    return min;
  } else {
    return 0;
  }
}
function lineSphere(line, sphere) {
  r_t.o.set(line.s);
  vec3Subtract(r_t.d, line.e, line.s);
  r_t.d.normalize();
  var min = raySphere(r_t, sphere);
  var len = line.length();
  if (min <= len) {
    return min;
  } else {
    return 0;
  }
}
var aabbWithAABB = function () {
  var aMin = v3();
  var aMax = v3();
  var bMin = v3();
  var bMax = v3();
  return function (aabb1, aabb2) {
    vec3Subtract(aMin, aabb1.center, aabb1.halfExtents);
    vec3Add$1(aMax, aabb1.center, aabb1.halfExtents);
    vec3Subtract(bMin, aabb2.center, aabb2.halfExtents);
    vec3Add$1(bMax, aabb2.center, aabb2.halfExtents);
    return aMin.x <= bMax.x && aMax.x >= bMin.x && aMin.y <= bMax.y && aMax.y >= bMin.y && aMin.z <= bMax.z && aMax.z >= bMin.z;
  };
}();
function getAABBVertices(min, max, out) {
  vec3Set$1(out[0], min.x, max.y, max.z);
  vec3Set$1(out[1], min.x, max.y, min.z);
  vec3Set$1(out[2], min.x, min.y, max.z);
  vec3Set$1(out[3], min.x, min.y, min.z);
  vec3Set$1(out[4], max.x, max.y, max.z);
  vec3Set$1(out[5], max.x, max.y, min.z);
  vec3Set$1(out[6], max.x, min.y, max.z);
  vec3Set$1(out[7], max.x, min.y, min.z);
}
function getOBBVertices(c, e, a1, a2, a3, out) {
  vec3Set$1(out[0], c.x + a1.x * e.x + a2.x * e.y + a3.x * e.z, c.y + a1.y * e.x + a2.y * e.y + a3.y * e.z, c.z + a1.z * e.x + a2.z * e.y + a3.z * e.z);
  vec3Set$1(out[1], c.x - a1.x * e.x + a2.x * e.y + a3.x * e.z, c.y - a1.y * e.x + a2.y * e.y + a3.y * e.z, c.z - a1.z * e.x + a2.z * e.y + a3.z * e.z);
  vec3Set$1(out[2], c.x + a1.x * e.x - a2.x * e.y + a3.x * e.z, c.y + a1.y * e.x - a2.y * e.y + a3.y * e.z, c.z + a1.z * e.x - a2.z * e.y + a3.z * e.z);
  vec3Set$1(out[3], c.x + a1.x * e.x + a2.x * e.y - a3.x * e.z, c.y + a1.y * e.x + a2.y * e.y - a3.y * e.z, c.z + a1.z * e.x + a2.z * e.y - a3.z * e.z);
  vec3Set$1(out[4], c.x - a1.x * e.x - a2.x * e.y - a3.x * e.z, c.y - a1.y * e.x - a2.y * e.y - a3.y * e.z, c.z - a1.z * e.x - a2.z * e.y - a3.z * e.z);
  vec3Set$1(out[5], c.x + a1.x * e.x - a2.x * e.y - a3.x * e.z, c.y + a1.y * e.x - a2.y * e.y - a3.y * e.z, c.z + a1.z * e.x - a2.z * e.y - a3.z * e.z);
  vec3Set$1(out[6], c.x - a1.x * e.x + a2.x * e.y - a3.x * e.z, c.y - a1.y * e.x + a2.y * e.y - a3.y * e.z, c.z - a1.z * e.x + a2.z * e.y - a3.z * e.z);
  vec3Set$1(out[7], c.x - a1.x * e.x - a2.x * e.y + a3.x * e.z, c.y - a1.y * e.x - a2.y * e.y + a3.y * e.z, c.z - a1.z * e.x - a2.z * e.y + a3.z * e.z);
}
function getInterval(vertices, axis) {
  var min = vec3Dot(axis, vertices[0]);
  var max = min;
  for (var i = 1; i < 8; ++i) {
    var projection = vec3Dot(axis, vertices[i]);
    min = projection < min ? projection : min;
    max = projection > max ? projection : max;
  }
  return [min, max];
}
var aabbWithOBB = function () {
  var test = new Array(15);
  for (var i = 0; i < 15; i++) {
    test[i] = v3();
  }
  var vertices = new Array(8);
  var vertices2 = new Array(8);
  for (var _i = 0; _i < 8; _i++) {
    vertices[_i] = v3();
    vertices2[_i] = v3();
  }
  var min = v3();
  var max = v3();
  return function (aabb, obb) {
    var orientation = obb.orientation;
    vec3Set$1(test[0], 1, 0, 0);
    vec3Set$1(test[1], 0, 1, 0);
    vec3Set$1(test[2], 0, 0, 1);
    vec3Set$1(test[3], orientation.m00, orientation.m01, orientation.m02);
    vec3Set$1(test[4], orientation.m03, orientation.m04, orientation.m05);
    vec3Set$1(test[5], orientation.m06, orientation.m07, orientation.m08);
    for (var _i2 = 0; _i2 < 3; ++_i2) {
      vec3Cross(test[6 + _i2 * 3 + 0], test[_i2], test[3]);
      vec3Cross(test[6 + _i2 * 3 + 1], test[_i2], test[4]);
      vec3Cross(test[6 + _i2 * 3 + 1], test[_i2], test[5]);
    }
    vec3Subtract(min, aabb.center, aabb.halfExtents);
    vec3Add$1(max, aabb.center, aabb.halfExtents);
    getAABBVertices(min, max, vertices);
    getOBBVertices(obb.center, obb.halfExtents, test[3], test[4], test[5], vertices2);
    for (var j = 0; j < 15; ++j) {
      var a = getInterval(vertices, test[j]);
      var b = getInterval(vertices2, test[j]);
      if (b[0] > a[1] || a[0] > b[1]) {
        return 0;
      }
    }
    return 1;
  };
}();
var aabbPlane = function aabbPlane(aabb, plane) {
  var aabbHalfExtents = aabb.halfExtents;
  var planeN = plane.n;
  var r = aabbHalfExtents.x * mathAbs$2(planeN.x) + aabbHalfExtents.y * mathAbs$2(planeN.y) + aabbHalfExtents.z * mathAbs$2(planeN.z);
  var dot = vec3Dot(planeN, aabb.center);
  if (dot + r < plane.d) {
    return -1;
  } else if (dot - r > plane.d) {
    return 0;
  }
  return 1;
};
var aabbFrustum = function aabbFrustum(aabb, frustum) {
  var frustumPlanes = frustum.planes;
  for (var i = 0; i < frustumPlanes.length; i++) {
    if (aabbPlane(aabb, frustumPlanes[i]) === -1) {
      return 0;
    }
  }
  return 1;
};
var aabbFrustumCompletelyInside = function aabbFrustumCompletelyInside(aabb, frustum) {
  var frustumPlanes = frustum.planes;
  for (var i = 0; i < frustumPlanes.length; i++) {
    if (aabbPlane(aabb, frustumPlanes[i]) !== 0) {
      return 0;
    }
  }
  return 1;
};
var aabbFrustumAccurate = function () {
  var tmp = new Array(8);
  var out1 = 0;
  var out2 = 0;
  for (var i = 0; i < tmp.length; i++) {
    tmp[i] = v3();
  }
  return function (aabb, frustum) {
    var frustumVertices = frustum.vertices;
    var aabbHalfExtents = aabb.halfExtents;
    var result = 0;
    var intersects = false;
    for (var _i3 = 0; _i3 < frustum.planes.length; _i3++) {
      result = aabbPlane(aabb, frustum.planes[_i3]);
      if (result === -1) return 0;else if (result === 1) {
        intersects = true;
      }
    }
    if (!intersects) {
      return 1;
    }
    for (var _i4 = 0; _i4 < frustumVertices.length; _i4++) {
      vec3Subtract(tmp[_i4], frustumVertices[_i4], aabb.center);
    }
    out1 = 0;
    out2 = 0;
    for (var _i5 = 0; _i5 < frustumVertices.length; _i5++) {
      if (tmp[_i5].x > aabbHalfExtents.x) {
        out1++;
      } else if (tmp[_i5].x < -aabbHalfExtents.x) {
        out2++;
      }
    }
    if (out1 === frustumVertices.length || out2 === frustumVertices.length) {
      return 0;
    }
    out1 = 0;
    out2 = 0;
    for (var _i6 = 0; _i6 < frustumVertices.length; _i6++) {
      if (tmp[_i6].y > aabbHalfExtents.y) {
        out1++;
      } else if (tmp[_i6].y < -aabbHalfExtents.y) {
        out2++;
      }
    }
    if (out1 === frustumVertices.length || out2 === frustumVertices.length) {
      return 0;
    }
    out1 = 0;
    out2 = 0;
    for (var _i7 = 0; _i7 < frustumVertices.length; _i7++) {
      if (tmp[_i7].z > aabbHalfExtents.z) {
        out1++;
      } else if (tmp[_i7].z < -aabbHalfExtents.z) {
        out2++;
      }
    }
    if (out1 === frustumVertices.length || out2 === frustumVertices.length) {
      return 0;
    }
    return 1;
  };
}();
var obbPoint = function () {
  var tmp = v3();
  var m3 = new Mat3();
  var lessThan = function lessThan(a, b) {
    return mathAbs$2(a.x) < b.x && mathAbs$2(a.y) < b.y && mathAbs$2(a.z) < b.z;
  };
  return function (obb, point) {
    vec3Subtract(tmp, point, obb.center);
    Vec3.transformMat3(tmp, tmp, Mat3.transpose(m3, obb.orientation));
    return lessThan(tmp, obb.halfExtents);
  };
}();
var obbPlane = function () {
  var absDot = function absDot(n, x, y, z) {
    return mathAbs$2(n.x * x + n.y * y + n.z * z);
  };
  return function (obb, plane) {
    var obbOrientation = obb.orientation;
    var obbHalfExtents = obb.halfExtents;
    var planeN = plane.n;
    var planeD = plane.d;
    var r = obbHalfExtents.x * absDot(planeN, obbOrientation.m00, obbOrientation.m01, obbOrientation.m02) + obbHalfExtents.y * absDot(planeN, obbOrientation.m03, obbOrientation.m04, obbOrientation.m05) + obbHalfExtents.z * absDot(planeN, obbOrientation.m06, obbOrientation.m07, obbOrientation.m08);
    var dot = vec3Dot(planeN, obb.center);
    if (dot + r < planeD) {
      return -1;
    } else if (dot - r > planeD) {
      return 0;
    }
    return 1;
  };
}();
var obbFrustum = function obbFrustum(obb, frustum) {
  var frustumPlanes = frustum.planes;
  for (var i = 0; i < frustumPlanes.length; i++) {
    if (obbPlane(obb, frustumPlanes[i]) === -1) {
      return 0;
    }
  }
  return 1;
};
var obbFrustumAccurate = function () {
  var tmp = new Array(8);
  var dist = 0;
  var out1 = 0;
  var out2 = 0;
  for (var i = 0; i < tmp.length; i++) {
    tmp[i] = v3();
  }
  var dot = function dot(n, x, y, z) {
    return n.x * x + n.y * y + n.z * z;
  };
  return function (obb, frustum) {
    var obbOrientation = obb.orientation;
    var obbHalfExtents = obb.halfExtents;
    var frustumVertices = frustum.vertices;
    var frustumPlanes = frustum.planes;
    var result = 0;
    var intersects = false;
    for (var _i8 = 0; _i8 < frustumPlanes.length; _i8++) {
      result = obbPlane(obb, frustumPlanes[_i8]);
      if (result === -1) return 0;else if (result === 1) {
        intersects = true;
      }
    }
    if (!intersects) {
      return 1;
    }
    for (var _i9 = 0; _i9 < frustumVertices.length; _i9++) {
      vec3Subtract(tmp[_i9], frustumVertices[_i9], obb.center);
    }
    out1 = 0, out2 = 0;
    for (var _i0 = 0; _i0 < frustumVertices.length; _i0++) {
      dist = dot(tmp[_i0], obbOrientation.m00, obbOrientation.m01, obbOrientation.m02);
      if (dist > obbHalfExtents.x) {
        out1++;
      } else if (dist < -obbHalfExtents.x) {
        out2++;
      }
    }
    if (out1 === frustumVertices.length || out2 === frustumVertices.length) {
      return 0;
    }
    out1 = 0;
    out2 = 0;
    for (var _i1 = 0; _i1 < frustumVertices.length; _i1++) {
      dist = dot(tmp[_i1], obbOrientation.m03, obbOrientation.m04, obbOrientation.m05);
      if (dist > obbHalfExtents.y) {
        out1++;
      } else if (dist < -obbHalfExtents.y) {
        out2++;
      }
    }
    if (out1 === frustumVertices.length || out2 === frustumVertices.length) {
      return 0;
    }
    out1 = 0;
    out2 = 0;
    for (var _i10 = 0; _i10 < frustumVertices.length; _i10++) {
      dist = dot(tmp[_i10], obbOrientation.m06, obbOrientation.m07, obbOrientation.m08);
      if (dist > obbHalfExtents.z) {
        out1++;
      } else if (dist < -obbHalfExtents.z) {
        out2++;
      }
    }
    if (out1 === frustumVertices.length || out2 === frustumVertices.length) {
      return 0;
    }
    return 1;
  };
}();
var obbWithOBB = function () {
  var test = new Array(15);
  for (var i = 0; i < 15; i++) {
    test[i] = v3();
  }
  var vertices = new Array(8);
  var vertices2 = new Array(8);
  for (var _i11 = 0; _i11 < 8; _i11++) {
    vertices[_i11] = v3();
    vertices2[_i11] = v3();
  }
  return function (obb1, obb2) {
    var obb1Orientation = obb1.orientation;
    var obb2Orientation = obb2.orientation;
    vec3Set$1(test[0], obb1Orientation.m00, obb1Orientation.m01, obb1Orientation.m02);
    vec3Set$1(test[1], obb1Orientation.m03, obb1Orientation.m04, obb1Orientation.m05);
    vec3Set$1(test[2], obb1Orientation.m06, obb1Orientation.m07, obb1Orientation.m08);
    vec3Set$1(test[3], obb2Orientation.m00, obb2Orientation.m01, obb2Orientation.m02);
    vec3Set$1(test[4], obb2Orientation.m03, obb2Orientation.m04, obb2Orientation.m05);
    vec3Set$1(test[5], obb2Orientation.m06, obb2Orientation.m07, obb2Orientation.m08);
    for (var _i12 = 0; _i12 < 3; ++_i12) {
      vec3Cross(test[6 + _i12 * 3 + 0], test[_i12], test[3]);
      vec3Cross(test[6 + _i12 * 3 + 1], test[_i12], test[4]);
      vec3Cross(test[6 + _i12 * 3 + 2], test[_i12], test[5]);
    }
    getOBBVertices(obb1.center, obb1.halfExtents, test[0], test[1], test[2], vertices);
    getOBBVertices(obb2.center, obb2.halfExtents, test[3], test[4], test[5], vertices2);
    for (var _i13 = 0; _i13 < 15; ++_i13) {
      var a = getInterval(vertices, test[_i13]);
      var b = getInterval(vertices2, test[_i13]);
      if (b[0] > a[1] || a[0] > b[1]) {
        return 0;
      }
    }
    return 1;
  };
}();
var obbCapsule = function () {
  var sphere_0 = new Sphere();
  var v3_0 = v3();
  var v3_1 = v3();
  var v3_2 = v3();
  var v3_verts8 = new Array(8);
  for (var i = 0; i < 8; i++) {
    v3_verts8[i] = v3();
  }
  var v3_axis8 = new Array(8);
  for (var _i14 = 0; _i14 < 8; _i14++) {
    v3_axis8[_i14] = v3();
  }
  return function (obb, capsule) {
    var capsuleEllipseCenter0 = capsule.ellipseCenter0;
    var capsuleEllipseCenter1 = capsule.ellipseCenter1;
    var capsuleRadius = capsule.radius;
    var h = vec3SquaredDistance(capsuleEllipseCenter0, capsuleEllipseCenter1);
    if (h === 0) {
      sphere_0.radius = capsule.radius;
      sphere_0.center.set(capsuleEllipseCenter0);
      return intersect.sphereOBB(sphere_0, obb);
    } else {
      var orientation = obb.orientation;
      v3_0.x = orientation.m00;
      v3_0.y = orientation.m01;
      v3_0.z = orientation.m02;
      v3_1.x = orientation.m03;
      v3_1.y = orientation.m04;
      v3_1.z = orientation.m05;
      v3_2.x = orientation.m06;
      v3_2.y = orientation.m07;
      v3_2.z = orientation.m08;
      getOBBVertices(obb.center, obb.halfExtents, v3_0, v3_1, v3_2, v3_verts8);
      var axes = v3_axis8;
      var a0 = vec3Copy(axes[0], v3_0);
      var a1 = vec3Copy(axes[1], v3_1);
      var a2 = vec3Copy(axes[2], v3_2);
      var C = vec3Subtract(axes[3], capsule.center, obb.center);
      C.normalize();
      var B = vec3Subtract(axes[4], capsuleEllipseCenter0, capsuleEllipseCenter1);
      B.normalize();
      vec3Cross(axes[5], a0, B);
      vec3Cross(axes[6], a1, B);
      vec3Cross(axes[7], a2, B);
      for (var _i15 = 0; _i15 < 8; ++_i15) {
        var a = getInterval(v3_verts8, axes[_i15]);
        var d0 = vec3Dot(axes[_i15], capsuleEllipseCenter0);
        var d1 = vec3Dot(axes[_i15], capsuleEllipseCenter1);
        var max_d = mathMax(d0, d1);
        var min_d = mathMin(d0, d1);
        var d_min = min_d - capsuleRadius;
        var d_max = max_d + capsuleRadius;
        if (d_min > a[1] || a[0] > d_max) {
          return 0;
        }
      }
      return 1;
    }
  };
}();
var spherePlane = function spherePlane(sphere, plane) {
  var dot = vec3Dot(plane.n, sphere.center);
  var r = sphere.radius * plane.n.length();
  if (dot + r < plane.d) {
    return -1;
  } else if (dot - r > plane.d) {
    return 0;
  }
  return 1;
};
var sphereFrustum = function sphereFrustum(sphere, frustum) {
  var frustumPlanes = frustum.planes;
  for (var i = 0; i < frustumPlanes.length; i++) {
    if (spherePlane(sphere, frustumPlanes[i]) === -1) {
      return 0;
    }
  }
  return 1;
};
var sphereFrustumAccurate = function () {
  var pt = v3();
  var map = [1, -1, 1, -1, 1, -1];
  return function (sphere, frustum) {
    for (var i = 0; i < 6; i++) {
      var plane = frustum.planes[i];
      var _r = sphere.radius;
      var c = sphere.center;
      var n = plane.n;
      var d = plane.d;
      var dot = vec3Dot(n, c);
      if (dot + _r < d) return 0;else if (dot - _r > d) {
        continue;
      }
      vec3Add$1(pt, c, vec3MultiplyScalar$1(pt, n, _r));
      for (var j = 0; j < 6; j++) {
        if (j === i || j === i + map[i]) {
          continue;
        }
        var test = frustum.planes[j];
        if (vec3Dot(test.n, pt) < test.d) {
          return 0;
        }
      }
    }
    return 1;
  };
}();
var sphereWithSphere = function sphereWithSphere(sphere0, sphere1) {
  var r = sphere0.radius + sphere1.radius;
  return vec3SquaredDistance(sphere0.center, sphere1.center) < r * r;
};
var sphereAABB = function () {
  var pt = v3();
  return function (sphere, aabb) {
    var sphereRadius = sphere.radius;
    pt_point_aabb(pt, sphere.center, aabb);
    return vec3SquaredDistance(sphere.center, pt) < sphereRadius * sphereRadius;
  };
}();
var sphereOBB = function () {
  var pt = v3();
  return function (sphere, obb) {
    var sphereRadius = sphere.radius;
    pt_point_obb(pt, sphere.center, obb);
    return vec3SquaredDistance(sphere.center, pt) < sphereRadius * sphereRadius;
  };
}();
var sphereCapsule = function () {
  var v3_0 = v3();
  var v3_1 = v3();
  return function (sphere, capsule) {
    var capsuleEllipseCenter0 = capsule.ellipseCenter0;
    var capsuleEllipseCenter1 = capsule.ellipseCenter1;
    var sphereCenter = sphere.center;
    var r = sphere.radius + capsule.radius;
    var squaredR = r * r;
    var h = vec3SquaredDistance(capsuleEllipseCenter0, capsuleEllipseCenter1);
    if (h === 0) {
      return vec3SquaredDistance(sphereCenter, capsule.center) < squaredR;
    } else {
      vec3Subtract(v3_0, sphereCenter, capsuleEllipseCenter0);
      vec3Subtract(v3_1, capsuleEllipseCenter1, capsuleEllipseCenter0);
      var t = vec3Dot(v3_0, v3_1) / h;
      if (t < 0) {
        return vec3SquaredDistance(sphereCenter, capsuleEllipseCenter0) < squaredR;
      } else if (t > 1) {
        return vec3SquaredDistance(sphereCenter, capsuleEllipseCenter1) < squaredR;
      } else {
        vec3ScaleAndAdd(v3_0, capsuleEllipseCenter0, v3_1, t);
        return vec3SquaredDistance(sphereCenter, v3_0) < squaredR;
      }
    }
  };
}();
var capsuleWithCapsule = function () {
  var v3_0 = v3();
  var v3_1 = v3();
  var v3_2 = v3();
  var v3_3 = v3();
  var v3_4 = v3();
  var v3_5 = v3();
  return function capsuleWithCapsule(capsuleA, capsuleB) {
    var capsuleAEllipseCenter0 = capsuleA.ellipseCenter0;
    var capsuleAEllipseCenter1 = capsuleA.ellipseCenter1;
    var capsuleBEllipseCenter1 = capsuleB.ellipseCenter1;
    var capsuleBEllipseCenter0 = capsuleB.ellipseCenter0;
    var u = vec3Subtract(v3_0, capsuleAEllipseCenter1, capsuleAEllipseCenter0);
    var v = vec3Subtract(v3_1, capsuleBEllipseCenter1, capsuleBEllipseCenter0);
    var w = vec3Subtract(v3_2, capsuleAEllipseCenter0, capsuleBEllipseCenter0);
    var a = vec3Dot(u, u);
    var b = vec3Dot(u, v);
    var c = vec3Dot(v, v);
    var d = vec3Dot(u, w);
    var e = vec3Dot(v, w);
    var D = a * c - b * b;
    var sN;
    var sD = D;
    var tN;
    var tD = D;
    if (D < EPSILON) {
      sN = 0.0;
      sD = 1.0;
      tN = e;
      tD = c;
    } else {
      sN = b * e - c * d;
      tN = a * e - b * d;
      if (sN < 0.0) {
        sN = 0.0;
        tN = e;
        tD = c;
      } else if (sN > sD) {
        sN = sD;
        tN = e + b;
        tD = c;
      }
    }
    if (tN < 0.0) {
      tN = 0.0;
      if (-d < 0.0) {
        sN = 0.0;
      } else if (-d > a) {
        sN = sD;
      } else {
        sN = -d;
        sD = a;
      }
    } else if (tN > tD) {
      tN = tD;
      if (-d + b < 0.0) {
        sN = 0;
      } else if (-d + b > a) {
        sN = sD;
      } else {
        sN = -d + b;
        sD = a;
      }
    }
    var sc = mathAbs$2(sN) < EPSILON ? 0.0 : sN / sD;
    var tc = mathAbs$2(tN) < EPSILON ? 0.0 : tN / tD;
    var dP = v3_3;
    dP.set(w);
    dP.add(vec3MultiplyScalar$1(v3_4, u, sc));
    dP.subtract(vec3MultiplyScalar$1(v3_5, v, tc));
    var radius = capsuleA.radius + capsuleB.radius;
    return dP.lengthSqr() < radius * radius;
  };
}();
var intersect = {
  raySphere: raySphere,
  rayAABB: rayAABB,
  rayOBB: rayOBB,
  rayPlane: rayPlane,
  rayTriangle: rayTriangle,
  rayCapsule: rayCapsule,
  raySubMesh: null,
  rayMesh: null,
  rayModel: null,
  lineSphere: lineSphere,
  lineAABB: lineAABB,
  lineOBB: lineOBB,
  linePlane: linePlane,
  lineTriangle: lineTriangle,
  sphereWithSphere: sphereWithSphere,
  sphereAABB: sphereAABB,
  sphereOBB: sphereOBB,
  spherePlane: spherePlane,
  sphereFrustum: sphereFrustum,
  sphereFrustumAccurate: sphereFrustumAccurate,
  sphereCapsule: sphereCapsule,
  aabbWithAABB: aabbWithAABB,
  aabbWithOBB: aabbWithOBB,
  aabbPlane: aabbPlane,
  aabbFrustum: aabbFrustum,
  aabbFrustumAccurate: aabbFrustumAccurate,
  obbWithOBB: obbWithOBB,
  obbPlane: obbPlane,
  obbFrustum: obbFrustum,
  obbFrustumAccurate: obbFrustumAccurate,
  obbPoint: obbPoint,
  obbCapsule: obbCapsule,
  aabbFrustumCompletelyInside: aabbFrustumCompletelyInside,
  capsuleWithCapsule: capsuleWithCapsule,
  resolve: function resolve(g1, g2, outPt) {
    if (outPt === void 0) {
      outPt = null;
    }
    var type1 = g1._type;
    var type2 = g2._type;
    var resolver = this[type1 | type2];
    return type1 < type2 ? resolver(g1, g2, outPt) : resolver(g2, g1, outPt);
  }
};
intersect[ShapeType.SHAPE_RAY | ShapeType.SHAPE_SPHERE] = raySphere;
intersect[ShapeType.SHAPE_RAY | ShapeType.SHAPE_AABB] = rayAABB;
intersect[ShapeType.SHAPE_RAY | ShapeType.SHAPE_OBB] = rayOBB;
intersect[ShapeType.SHAPE_RAY | ShapeType.SHAPE_PLANE] = rayPlane;
intersect[ShapeType.SHAPE_RAY | ShapeType.SHAPE_TRIANGLE] = rayTriangle;
intersect[ShapeType.SHAPE_RAY | ShapeType.SHAPE_CAPSULE] = rayCapsule;
intersect[ShapeType.SHAPE_LINE | ShapeType.SHAPE_SPHERE] = lineSphere;
intersect[ShapeType.SHAPE_LINE | ShapeType.SHAPE_AABB] = lineAABB;
intersect[ShapeType.SHAPE_LINE | ShapeType.SHAPE_OBB] = lineOBB;
intersect[ShapeType.SHAPE_LINE | ShapeType.SHAPE_PLANE] = linePlane;
intersect[ShapeType.SHAPE_LINE | ShapeType.SHAPE_TRIANGLE] = lineTriangle;
intersect[ShapeType.SHAPE_SPHERE] = sphereWithSphere;
intersect[ShapeType.SHAPE_SPHERE | ShapeType.SHAPE_AABB] = sphereAABB;
intersect[ShapeType.SHAPE_SPHERE | ShapeType.SHAPE_OBB] = sphereOBB;
intersect[ShapeType.SHAPE_SPHERE | ShapeType.SHAPE_PLANE] = spherePlane;
intersect[ShapeType.SHAPE_SPHERE | ShapeType.SHAPE_FRUSTUM] = sphereFrustum;
intersect[ShapeType.SHAPE_SPHERE | ShapeType.SHAPE_FRUSTUM_ACCURATE] = sphereFrustumAccurate;
intersect[ShapeType.SHAPE_SPHERE | ShapeType.SHAPE_CAPSULE] = sphereCapsule;
intersect[ShapeType.SHAPE_AABB] = aabbWithAABB;
intersect[ShapeType.SHAPE_AABB | ShapeType.SHAPE_OBB] = aabbWithOBB;
intersect[ShapeType.SHAPE_AABB | ShapeType.SHAPE_PLANE] = aabbPlane;
intersect[ShapeType.SHAPE_AABB | ShapeType.SHAPE_FRUSTUM] = aabbFrustum;
intersect[ShapeType.SHAPE_AABB | ShapeType.SHAPE_FRUSTUM_ACCURATE] = aabbFrustumAccurate;
intersect[ShapeType.SHAPE_OBB] = obbWithOBB;
intersect[ShapeType.SHAPE_OBB | ShapeType.SHAPE_PLANE] = obbPlane;
intersect[ShapeType.SHAPE_OBB | ShapeType.SHAPE_FRUSTUM] = obbFrustum;
intersect[ShapeType.SHAPE_OBB | ShapeType.SHAPE_FRUSTUM_ACCURATE] = obbFrustumAccurate;
intersect[ShapeType.SHAPE_OBB | ShapeType.SHAPE_CAPSULE] = obbCapsule;
intersect[ShapeType.SHAPE_CAPSULE] = capsuleWithCapsule;

replaceProperty(Line.prototype, 'line', [{
  name: 'mag',
  newName: 'len'
}, {
  name: 'magnitude',
  newName: 'len'
}]);
removeProperty(intersect, 'intersect', [{
  name: 'line_quad'
}]);

var v1 = new Vec3(0, 0, 0);
var v2 = new Vec3(0, 0, 0);
var temp_mat = mat4();
var temp_vec4 = v4();
var Plane = function () {
  function Plane(nx, ny, nz, d) {
    if (nx === void 0) {
      nx = 0;
    }
    if (ny === void 0) {
      ny = 1;
    }
    if (nz === void 0) {
      nz = 0;
    }
    if (d === void 0) {
      d = 0;
    }
    this._type = ShapeType.SHAPE_PLANE;
    this.n = new Vec3(nx, ny, nz);
    this.d = d;
  }
  Plane.create = function create(nx, ny, nz, d) {
    return new Plane(nx, ny, nz, d);
  };
  Plane.clone = function clone(p) {
    return new Plane(p.n.x, p.n.y, p.n.z, p.d);
  };
  Plane.copy = function copy(out, p) {
    Vec3.copy(out.n, p.n);
    out.d = p.d;
    return out;
  };
  Plane.fromPoints = function fromPoints(out, a, b, c) {
    Vec3.subtract(v1, b, a);
    Vec3.subtract(v2, c, a);
    Vec3.normalize(out.n, Vec3.cross(out.n, v1, v2));
    out.d = Vec3.dot(out.n, a);
    return out;
  };
  Plane.set = function set(out, nx, ny, nz, d) {
    out.n.x = nx;
    out.n.y = ny;
    out.n.z = nz;
    out.d = d;
    return out;
  };
  Plane.fromNormalAndPoint = function fromNormalAndPoint(out, normal, point) {
    Vec3.copy(out.n, normal);
    out.d = Vec3.dot(normal, point);
    return out;
  };
  Plane.normalize = function normalize(out, a) {
    var len = a.n.length();
    Vec3.normalize(out.n, a.n);
    if (len > 0) {
      out.d = a.d / len;
    }
    return out;
  };
  var _proto = Plane.prototype;
  _proto.transform = function transform(mat) {
    Mat4.invert(temp_mat, mat);
    Mat4.transpose(temp_mat, temp_mat);
    Vec4.set(temp_vec4, this.n.x, this.n.y, this.n.z, -this.d);
    Vec4.transformMat4(temp_vec4, temp_vec4, temp_mat);
    Vec3.set(this.n, temp_vec4.x, temp_vec4.y, temp_vec4.z);
    this.d = -temp_vec4.w;
  };
  return _createClass(Plane, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }, {
    key: "x",
    get: function get() {
      return this.n.x;
    },
    set: function set(val) {
      this.n.x = val;
    }
  }, {
    key: "y",
    get: function get() {
      return this.n.y;
    },
    set: function set(val) {
      this.n.y = val;
    }
  }, {
    key: "z",
    get: function get() {
      return this.n.z;
    },
    set: function set(val) {
      this.n.z = val;
    }
  }, {
    key: "w",
    get: function get() {
      return this.d;
    },
    set: function set(val) {
      this.d = val;
    }
  }]);
}();

var Triangle = function () {
  function Triangle(ax, ay, az, bx, by, bz, cx, cy, cz) {
    if (ax === void 0) {
      ax = 0;
    }
    if (ay === void 0) {
      ay = 0;
    }
    if (az === void 0) {
      az = 0;
    }
    if (bx === void 0) {
      bx = 1;
    }
    if (by === void 0) {
      by = 0;
    }
    if (bz === void 0) {
      bz = 0;
    }
    if (cx === void 0) {
      cx = 0;
    }
    if (cy === void 0) {
      cy = 1;
    }
    if (cz === void 0) {
      cz = 0;
    }
    this._type = ShapeType.SHAPE_TRIANGLE;
    this.a = new Vec3(ax, ay, az);
    this.b = new Vec3(bx, by, bz);
    this.c = new Vec3(cx, cy, cz);
  }
  Triangle.create = function create(ax, ay, az, bx, by, bz, cx, cy, cz) {
    if (ax === void 0) {
      ax = 1;
    }
    if (ay === void 0) {
      ay = 0;
    }
    if (az === void 0) {
      az = 0;
    }
    if (bx === void 0) {
      bx = 0;
    }
    if (by === void 0) {
      by = 0;
    }
    if (bz === void 0) {
      bz = 0;
    }
    if (cx === void 0) {
      cx = 0;
    }
    if (cy === void 0) {
      cy = 0;
    }
    if (cz === void 0) {
      cz = 1;
    }
    return new Triangle(ax, ay, az, bx, by, bz, cx, cy, cz);
  };
  Triangle.clone = function clone(t) {
    return new Triangle(t.a.x, t.a.y, t.a.z, t.b.x, t.b.y, t.b.z, t.c.x, t.c.y, t.c.z);
  };
  Triangle.copy = function copy(out, t) {
    Vec3.copy(out.a, t.a);
    Vec3.copy(out.b, t.b);
    Vec3.copy(out.c, t.c);
    return out;
  };
  Triangle.fromPoints = function fromPoints(out, a, b, c) {
    Vec3.copy(out.a, a);
    Vec3.copy(out.b, b);
    Vec3.copy(out.c, c);
    return out;
  };
  Triangle.set = function set(out, ax, ay, az, bx, by, bz, cx, cy, cz) {
    out.a.x = ax;
    out.a.y = ay;
    out.a.z = az;
    out.b.x = bx;
    out.b.y = by;
    out.b.z = bz;
    out.c.x = cx;
    out.c.y = cy;
    out.c.z = cz;
    return out;
  };
  return _createClass(Triangle, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}();

var _vec3 = new Vec3();
function WorldNode3DToLocalNodeUI(mainCamera, wpos, uiNode, out) {
  if (!out) {
    out = new Vec3();
  }
  mainCamera.convertToUINode(wpos, uiNode, out);
  var pos = uiNode.position;
  out.add(pos);
  return out;
}
function WorldNode3DToWorldNodeUI(mainCamera, wpos, out) {
  if (!out) {
    out = new Vec3();
  }
  mainCamera.worldToScreen(wpos, out);
  out.x /= legacyCC.view.getScaleX();
  out.y /= legacyCC.view.getScaleY();
  return out;
}
var convertUtils = {
  WorldNode3DToLocalNodeUI: WorldNode3DToLocalNodeUI,
  WorldNode3DToWorldNodeUI: WorldNode3DToWorldNodeUI
};
legacyCC.pipelineUtils = convertUtils;
replaceProperty(legacyCC.pipelineUtils, 'cc.pipelineUtils', [{
  name: 'WorldNode3DToLocalNodeUI',
  newName: 'convertToUINode',
  targetName: 'cc.Camera.prototype',
  customFunction: function customFunction() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var camera = args[0];
    var out = args[3] || _vec3;
    camera.convertToUINode(args[1], args[2], out);
    out.add(args[2].position);
    return args[3] || out.clone();
  }
}]);

var EVENT_TIMEOUT = 200;
var orientationMap = {
  auto: Orientation.AUTO,
  landscape: Orientation.LANDSCAPE,
  portrait: Orientation.PORTRAIT
};
var WindowType;
(function (WindowType) {
  WindowType[WindowType["Unknown"] = 0] = "Unknown";
  WindowType[WindowType["SubFrame"] = 1] = "SubFrame";
  WindowType[WindowType["BrowserWindow"] = 2] = "BrowserWindow";
  WindowType[WindowType["Fullscreen"] = 3] = "Fullscreen";
})(WindowType || (WindowType = {}));
var ScreenAdapter = function (_EventTarget) {
  function ScreenAdapter() {
    var _this;
    _this = _EventTarget.call(this) || this;
    _this.isFrameRotated = false;
    _this.handleResizeEvent = true;
    _this._gameFrame = void 0;
    _this._gameContainer = void 0;
    _this._gameCanvas = void 0;
    _this._isProportionalToFrame = false;
    _this._cachedFrameStyle = {
      width: '0px',
      height: '0px'
    };
    _this._cachedContainerStyle = {
      width: '0px',
      height: '0px'
    };
    _this._cbToUpdateFrameBuffer = void 0;
    _this._supportFullScreen = false;
    _this._touchEventName = void 0;
    _this._onFullscreenChange = void 0;
    _this._onFullscreenError = void 0;
    _this._orientationChangeTimeoutId = -1;
    _this._cachedFrameSize = new Size(0, 0);
    _this._exactFitScreen = false;
    _this._isHeadlessMode = false;
    _this._fn = {};
    _this._fnGroup = [['requestFullscreen', 'exitFullscreen', 'fullscreenchange', 'fullscreenEnabled', 'fullscreenElement', 'fullscreenerror'], ['requestFullScreen', 'exitFullScreen', 'fullScreenchange', 'fullScreenEnabled', 'fullScreenElement', 'fullscreenerror'], ['webkitRequestFullScreen', 'webkitCancelFullScreen', 'webkitfullscreenchange', 'webkitIsFullScreen', 'webkitCurrentFullScreenElement', 'webkitfullscreenerror'], ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozfullscreenchange', 'mozFullScreen', 'mozFullScreenElement', 'mozfullscreenerror'], ['msRequestFullscreen', 'msExitFullscreen', 'MSFullscreenChange', 'msFullscreenEnabled', 'msFullscreenElement', 'msfullscreenerror']];
    _this._resolutionScale = 1;
    _this._orientation = Orientation.AUTO;
    _this._orientationDevice = Orientation.AUTO;
    _this._gameFrame = document.getElementById('GameDiv');
    _this._gameContainer = document.getElementById('Cocos3dGameContainer');
    _this._gameCanvas = document.getElementById('GameCanvas');
    {
      if (!_this._gameFrame) {
        var _this$_gameCanvas, _this$_gameCanvas$par;
        _this._gameFrame = document.createElement('div');
        _this._gameFrame.setAttribute('id', 'GameDiv');
        (_this$_gameCanvas = _this._gameCanvas) == null ? void 0 : (_this$_gameCanvas$par = _this$_gameCanvas.parentNode) == null ? void 0 : _this$_gameCanvas$par.insertBefore(_this._gameFrame, _this._gameCanvas);
        _this._gameFrame.appendChild(_this._gameCanvas);
      }
      if (!_this._gameContainer) {
        var _this$_gameCanvas2, _this$_gameCanvas2$pa;
        _this._gameContainer = document.createElement('div');
        _this._gameContainer.setAttribute('id', 'Cocos3dGameContainer');
        (_this$_gameCanvas2 = _this._gameCanvas) == null ? void 0 : (_this$_gameCanvas2$pa = _this$_gameCanvas2.parentNode) == null ? void 0 : _this$_gameCanvas2$pa.insertBefore(_this._gameContainer, _this._gameCanvas);
        _this._gameContainer.appendChild(_this._gameCanvas);
      }
    }
    var fnList;
    var fnGroup = _this._fnGroup;
    for (var i = 0; i < fnGroup.length; i++) {
      fnList = fnGroup[i];
      if (typeof document[fnList[1]] !== 'undefined') {
        for (var _i = 0; _i < fnList.length; _i++) {
          _this._fn[fnGroup[0][_i]] = fnList[_i];
        }
        break;
      }
    }
    _this._supportFullScreen = _this._fn.requestFullscreen !== undefined;
    _this._touchEventName = 'ontouchstart' in window ? 'touchend' : 'mousedown';
    _this._registerEvent();
    return _this;
  }
  _inheritsLoose(ScreenAdapter, _EventTarget);
  var _proto = ScreenAdapter.prototype;
  _proto._updateFrame = function _updateFrame() {
    this._updateFrameState();
    this._resizeFrame();
  };
  _proto.init = function init(options, cbToRebuildFrameBuffer) {
    this._cbToUpdateFrameBuffer = cbToRebuildFrameBuffer;
    this.orientation = orientationMap[options.configOrientation];
    this._exactFitScreen = options.exactFitScreen;
    this._isHeadlessMode = options.isHeadlessMode;
    this._resizeFrame();
  };
  _proto.requestFullScreen = function requestFullScreen() {
    var _this2 = this;
    return new Promise(function (resolve, reject) {
      if (_this2.isFullScreen) {
        resolve();
        return;
      }
      _this2._cachedFrameSize = _this2.windowSize;
      _this2._doRequestFullScreen().then(function () {
        resolve();
      })["catch"](function () {
        var fullscreenTarget = _this2._getFullscreenTarget();
        if (!fullscreenTarget) {
          reject(new Error('Cannot access fullscreen target'));
          return;
        }
        fullscreenTarget.addEventListener(_this2._touchEventName, function () {
          _this2._doRequestFullScreen().then(function () {
            resolve();
          })["catch"](reject);
        }, {
          once: true,
          capture: true
        });
      });
    });
  };
  _proto.exitFullScreen = function exitFullScreen() {
    var _this3 = this;
    return new Promise(function (resolve, reject) {
      var requestPromise = document[_this3._fn.exitFullscreen]();
      if (window.Promise && requestPromise instanceof Promise) {
        requestPromise.then(function () {
          _this3.windowSize = _this3._cachedFrameSize;
          resolve();
        })["catch"](reject);
        return;
      }
      _this3.windowSize = _this3._cachedFrameSize;
      resolve();
    });
  };
  _proto._registerEvent = function _registerEvent() {
    var _this4 = this;
    document.addEventListener(this._fn.fullscreenerror, function () {
      _this4._onFullscreenError == null ? void 0 : _this4._onFullscreenError();
    });
    window.addEventListener('resize', function () {
      _this4._updateFrame();
    });
    var notifyOrientationChange = function notifyOrientationChange(orientation) {
      if (orientation === _this4._orientationDevice) {
        return;
      }
      _this4._orientationDevice = orientation;
      _this4._updateFrame();
      _this4.emit('orientation-change', orientation);
    };
    var getOrientation = function getOrientation() {
      var tmpOrientation = Orientation.PORTRAIT;
      switch (window.orientation) {
        case 0:
          tmpOrientation = Orientation.PORTRAIT;
          break;
        case 90:
          tmpOrientation = Orientation.LANDSCAPE_RIGHT;
          break;
        case -90:
          tmpOrientation = Orientation.LANDSCAPE_LEFT;
          break;
        case 180:
          tmpOrientation = Orientation.PORTRAIT_UPSIDE_DOWN;
          break;
        default:
          tmpOrientation = _this4._orientationDevice;
          break;
      }
      return tmpOrientation;
    };
    var handleOrientationChange;
    var orientationChangeCallback = function orientationChangeCallback() {
      if (_this4._orientationChangeTimeoutId !== -1) {
        clearTimeout(_this4._orientationChangeTimeoutId);
      }
      _this4._orientationChangeTimeoutId = setTimeout(function () {
        handleOrientationChange();
      }, EVENT_TIMEOUT);
    };
    if (typeof window.matchMedia === 'function') {
      var _updateDPRChangeListener = function updateDPRChangeListener() {
        var dpr = _this4.devicePixelRatio;
        var mediaQueryResolution = window.matchMedia("(resolution: " + dpr + "dppx)");
        if (mediaQueryResolution.addEventListener) {
          mediaQueryResolution.addEventListener('change', function () {
            _this4.emit('window-resize', _this4.windowSize.width, _this4.windowSize.height);
            _updateDPRChangeListener();
          }, {
            once: true
          });
        } else if (mediaQueryResolution.addListener) {
          mediaQueryResolution.addListener(function () {
            _this4.emit('window-resize', _this4.windowSize.width, _this4.windowSize.height);
          });
        }
      };
      _updateDPRChangeListener();
      var mediaQueryPortrait = window.matchMedia('(orientation: portrait)');
      var mediaQueryLandscape = window.matchMedia('(orientation: landscape)');
      var hasScreeOrientation = screen.orientation;
      handleOrientationChange = function handleOrientationChange() {
        var tmpOrientation = _this4._orientationDevice;
        if (mediaQueryPortrait.matches) {
          tmpOrientation = Orientation.PORTRAIT;
          if (hasScreeOrientation) {
            var orientationType = screen.orientation.type;
            if (orientationType === 'portrait-primary') {
              tmpOrientation = Orientation.PORTRAIT;
            } else {
              tmpOrientation = Orientation.PORTRAIT_UPSIDE_DOWN;
            }
          }
        } else if (mediaQueryLandscape.matches) {
          tmpOrientation = Orientation.LANDSCAPE;
          if (hasScreeOrientation) {
            var _orientationType = screen.orientation.type;
            if (_orientationType === 'landscape-primary') {
              tmpOrientation = Orientation.LANDSCAPE_LEFT;
            } else {
              tmpOrientation = Orientation.LANDSCAPE_RIGHT;
            }
          }
        }
        notifyOrientationChange(tmpOrientation);
      };
      if (mediaQueryPortrait.addEventListener) {
        mediaQueryPortrait.addEventListener('change', orientationChangeCallback);
        mediaQueryLandscape.addEventListener('change', orientationChangeCallback);
      } else if (mediaQueryPortrait.addListener) {
        mediaQueryPortrait.addListener(orientationChangeCallback);
        mediaQueryLandscape.addListener(orientationChangeCallback);
      }
    } else {
      handleOrientationChange = function handleOrientationChange() {
        var tmpOrientation = getOrientation();
        notifyOrientationChange(tmpOrientation);
      };
      window.addEventListener('orientationchange', orientationChangeCallback);
    }
    document.addEventListener(this._fn.fullscreenchange, function () {
      _this4._onFullscreenChange == null ? void 0 : _this4._onFullscreenChange();
      _this4.emit('fullscreen-change', _this4.windowSize.width, _this4.windowSize.height);
    });
  };
  _proto._convertToSizeInCssPixels = function _convertToSizeInCssPixels(size) {
    var clonedSize = size.clone();
    var dpr = this.devicePixelRatio;
    clonedSize.width /= dpr;
    clonedSize.height /= dpr;
    return clonedSize;
  };
  _proto._resizeFrame = function _resizeFrame(sizeInCssPixels) {
    if (!this._gameFrame) {
      return;
    }
    this._gameFrame.style.display = 'flex';
    this._gameFrame.style['justify-content'] = 'center';
    this._gameFrame.style['align-items'] = 'center';
    if (this._windowType === WindowType.SubFrame) {
      if (!sizeInCssPixels) {
        this._updateContainer();
        return;
      }
      this._gameFrame.style.width = sizeInCssPixels.width + "px";
      this._gameFrame.style.height = sizeInCssPixels.height + "px";
    } else {
      var winWidth = window.innerWidth;
      var winHeight = window.innerHeight;
      var inputHeight = document.body.scrollHeight - winHeight;
      if (systemInfo.os === OS.ANDROID && winHeight < inputHeight) {
        winHeight += inputHeight;
      }
      if (this.isFrameRotated) {
        this._gameFrame.style['-webkit-transform'] = 'rotate(90deg)';
        this._gameFrame.style.transform = 'rotate(90deg)';
        this._gameFrame.style['-webkit-transform-origin'] = '0px 0px 0px';
        this._gameFrame.style.transformOrigin = '0px 0px 0px';
        this._gameFrame.style.margin = "0 0 0 " + winWidth + "px";
        this._gameFrame.style.width = winHeight + "px";
        this._gameFrame.style.height = winWidth + "px";
      } else {
        this._gameFrame.style['-webkit-transform'] = 'rotate(0deg)';
        this._gameFrame.style.transform = 'rotate(0deg)';
        this._gameFrame.style.margin = '0px auto';
        this._gameFrame.style.width = winWidth + "px";
        this._gameFrame.style.height = winHeight + "px";
      }
    }
    this._updateContainer();
  };
  _proto._getFullscreenTarget = function _getFullscreenTarget() {
    var windowType = this._windowType;
    if (windowType === WindowType.Fullscreen) {
      return document[this._fn.fullscreenElement];
    }
    if (windowType === WindowType.SubFrame) {
      return this._gameFrame;
    }
    return document.body;
  };
  _proto._doRequestFullScreen = function _doRequestFullScreen() {
    var _this5 = this;
    return new Promise(function (resolve, reject) {
      if (!_this5._supportFullScreen) {
        reject(new Error('fullscreen is not supported'));
        return;
      }
      var fullscreenTarget = _this5._getFullscreenTarget();
      if (!fullscreenTarget) {
        reject(new Error('Cannot access fullscreen target'));
        return;
      }
      _this5._onFullscreenChange = undefined;
      _this5._onFullscreenError = undefined;
      var requestPromise = fullscreenTarget[_this5._fn.requestFullscreen]();
      if (window.Promise && requestPromise instanceof Promise) {
        requestPromise.then(resolve)["catch"](reject);
      } else {
        _this5._onFullscreenChange = resolve;
        _this5._onFullscreenError = reject;
      }
    });
  };
  _proto._updateFrameState = function _updateFrameState() {
    var orientation = this.orientation;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var isBrowserLandscape = width > height;
    this.isFrameRotated = systemInfo.isMobile && (isBrowserLandscape && orientation === Orientation.PORTRAIT || !isBrowserLandscape && orientation === Orientation.LANDSCAPE);
  };
  _proto._updateContainer = function _updateContainer() {
    if (!this._gameContainer) {
      warnID(9201);
      return;
    }
    if (this.isProportionalToFrame) {
      if (!this._gameFrame) {
        warnID(9201);
        return;
      }
      var designedResolution = legacyCC.view.getDesignResolutionSize();
      var frame = this._gameFrame;
      var frameW = frame.clientWidth;
      var frameH = frame.clientHeight;
      var designW = designedResolution.width;
      var designH = designedResolution.height;
      var scaleX = frameW / designW;
      var scaleY = frameH / designH;
      var containerStyle = this._gameContainer.style;
      var containerW;
      var containerH;
      if (scaleX < scaleY) {
        containerW = frameW;
        containerH = designH * scaleX;
      } else {
        containerW = designW * scaleY;
        containerH = frameH;
      }
      containerStyle.width = containerW + "px";
      containerStyle.height = containerH + "px";
    } else {
      var _containerStyle = this._gameContainer.style;
      _containerStyle.width = '100%';
      _containerStyle.height = '100%';
    }
    if (this._gameFrame && (this._cachedFrameStyle.width !== this._gameFrame.style.width || this._cachedFrameStyle.height !== this._gameFrame.style.height || this._cachedContainerStyle.width !== this._gameContainer.style.width || this._cachedContainerStyle.height !== this._gameContainer.style.height)) {
      this.emit('window-resize', this.windowSize.width, this.windowSize.height);
      this._cachedFrameStyle.width = this._gameFrame.style.width;
      this._cachedFrameStyle.height = this._gameFrame.style.height;
      this._cachedContainerStyle.width = this._gameContainer.style.width;
      this._cachedContainerStyle.height = this._gameContainer.style.height;
    }
  };
  return _createClass(ScreenAdapter, [{
    key: "supportFullScreen",
    get: function get() {
      return this._supportFullScreen;
    }
  }, {
    key: "isFullScreen",
    get: function get() {
      if (!this._supportFullScreen) {
        return false;
      }
      return !!document[this._fn.fullscreenElement];
    }
  }, {
    key: "devicePixelRatio",
    get: function get() {
      var _window$devicePixelRa;
      return Math.min((_window$devicePixelRa = window.devicePixelRatio) !== null && _window$devicePixelRa !== void 0 ? _window$devicePixelRa : 1, 2);
    }
  }, {
    key: "windowSize",
    get: function get() {
      var result = this._windowSizeInCssPixels;
      var dpr = this.devicePixelRatio;
      result.width *= dpr;
      result.height *= dpr;
      return result;
    },
    set: function set(size) {
      if (this._windowType !== WindowType.SubFrame) {
        warnID(9202);
        return;
      }
      this._resizeFrame(this._convertToSizeInCssPixels(size));
    }
  }, {
    key: "resolution",
    get: function get() {
      var windowSize = this.windowSize;
      var resolutionScale = this.resolutionScale;
      return new Size(windowSize.width * resolutionScale, windowSize.height * resolutionScale);
    }
  }, {
    key: "resolutionScale",
    get: function get() {
      return this._resolutionScale;
    },
    set: function set(v) {
      var _this$_cbToUpdateFram;
      if (v === this._resolutionScale) {
        return;
      }
      this._resolutionScale = v;
      (_this$_cbToUpdateFram = this._cbToUpdateFrameBuffer) == null ? void 0 : _this$_cbToUpdateFram.call(this);
    }
  }, {
    key: "orientation",
    get: function get() {
      return this._orientation;
    },
    set: function set(value) {
      if (this._orientation === value) {
        return;
      }
      this._orientation = value;
      this._updateFrame();
    }
  }, {
    key: "safeAreaEdge",
    get: function get() {
      var dpr = this.devicePixelRatio;
      var _top = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-top') || '0') * dpr;
      var _bottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom') || '0') * dpr;
      var _left = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-left') || '0') * dpr;
      var _right = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-right') || '0') * dpr;
      return {
        top: _top,
        bottom: _bottom,
        left: _left,
        right: _right
      };
    }
  }, {
    key: "isProportionalToFrame",
    get: function get() {
      return this._isProportionalToFrame;
    },
    set: function set(v) {
      if (this._isProportionalToFrame === v) {
        return;
      }
      this._isProportionalToFrame = v;
      this._updateContainer();
    }
  }, {
    key: "_windowSizeInCssPixels",
    get: function get() {
      if (this.isProportionalToFrame) {
        if (!this._gameContainer) {
          warnID(9201);
          return new Size(0, 0);
        }
        return new Size(this._gameContainer.clientWidth, this._gameContainer.clientHeight);
      }
      var fullscreenTarget;
      var width;
      var height;
      switch (this._windowType) {
        case WindowType.SubFrame:
          if (!this._gameFrame) {
            warnID(9201);
            return new Size(0, 0);
          }
          return new Size(this._gameFrame.clientWidth, this._gameFrame.clientHeight);
        case WindowType.Fullscreen:
          fullscreenTarget = this._getFullscreenTarget();
          width = this.isFrameRotated ? fullscreenTarget.clientHeight : fullscreenTarget.clientWidth;
          height = this.isFrameRotated ? fullscreenTarget.clientWidth : fullscreenTarget.clientHeight;
          return new Size(width, height);
        case WindowType.BrowserWindow:
          width = this.isFrameRotated ? window.innerHeight : window.innerWidth;
          height = this.isFrameRotated ? window.innerWidth : window.innerHeight;
          return new Size(width, height);
        case WindowType.Unknown:
        default:
          return new Size(1, 1);
      }
    }
  }, {
    key: "_windowType",
    get: function get() {
      if (this._isHeadlessMode) {
        return WindowType.Unknown;
      }
      if (this.isFullScreen) {
        return WindowType.Fullscreen;
      }
      if (!this._gameFrame) {
        warnID(9201);
        return WindowType.Unknown;
      }
      if (this._exactFitScreen) {
        return WindowType.BrowserWindow;
      }
      return WindowType.SubFrame;
    }
  }]);
}(EventTarget);
var screenAdapter = new ScreenAdapter();

var Screen = function () {
  function Screen() {}
  var _proto = Screen.prototype;
  _proto.init = function init() {
    var _settings$querySettin, _settings$querySettin2;
    var exactFitScreen = (_settings$querySettin = settings.querySettings(SettingsCategory.SCREEN, 'exactFitScreen')) !== null && _settings$querySettin !== void 0 ? _settings$querySettin : true;
    var orientation = (_settings$querySettin2 = settings.querySettings(SettingsCategory.SCREEN, 'orientation')) !== null && _settings$querySettin2 !== void 0 ? _settings$querySettin2 : 'auto';
    var isHeadlessMode = settings.querySettings(SettingsCategory.RENDERING, 'renderMode') === 3;
    screenAdapter.init({
      exactFitScreen: exactFitScreen,
      configOrientation: orientation,
      isHeadlessMode: isHeadlessMode
    }, function () {
      var _director$root;
      var director = legacyCC.director;
      if (!((_director$root = director.root) != null && _director$root.pipeline)) {
        warnID(1220);
        return;
      }
      director.root.pipeline.shadingScale = screenAdapter.resolutionScale;
    });
  };
  _proto.fullScreen = function fullScreen() {
    return screenAdapter.isFullScreen;
  };
  _proto.requestFullScreen = function requestFullScreen(element, onFullScreenChange, onFullScreenError) {
    if (arguments.length > 0) {
      warnID(1400, 'screen.requestFullScreen(element, onFullScreenChange?, onFullScreenError?)', 'screen.requestFullScreen(): Promise');
    }
    return screenAdapter.requestFullScreen().then(function () {
      onFullScreenChange == null ? void 0 : onFullScreenChange.call(document);
    })["catch"](function (err) {
      error(err);
      onFullScreenError == null ? void 0 : onFullScreenError.call(document);
    });
  };
  _proto.exitFullScreen = function exitFullScreen() {
    return screenAdapter.exitFullScreen();
  };
  _proto.autoFullScreen = function autoFullScreen(element, onFullScreenChange) {
    var _this$requestFullScre;
    (_this$requestFullScre = this.requestFullScreen(element, onFullScreenChange)) == null ? void 0 : _this$requestFullScre["catch"](function (e) {
      warn(e);
    });
  };
  _proto.disableAutoFullScreen = function disableAutoFullScreen(element) {};
  _proto.on = function on(type, callback, target) {
    screenAdapter.on(type, callback, target);
  };
  _proto.once = function once(type, callback, target) {
    screenAdapter.once(type, callback, target);
  };
  _proto.off = function off(type, callback, target) {
    screenAdapter.off(type, callback, target);
  };
  return _createClass(Screen, [{
    key: "devicePixelRatio",
    get: function get() {
      return screenAdapter.devicePixelRatio;
    }
  }, {
    key: "windowSize",
    get: function get() {
      return screenAdapter.windowSize;
    },
    set: function set(size) {
      screenAdapter.windowSize = size;
    }
  }, {
    key: "resolution",
    get: function get() {
      return screenAdapter.resolution;
    }
  }, {
    key: "supportsFullScreen",
    get: function get() {
      return screenAdapter.supportFullScreen;
    }
  }]);
}();
var screen$1 = new Screen();
legacyCC.screen = screen$1;

var sys = {
  Feature: Feature,
  hasFeature: function hasFeature(feature) {
    return systemInfo.hasFeature(feature);
  },
  NetworkType: NetworkType,
  Language: Language,
  OS: OS,
  Platform: Platform,
  BrowserType: BrowserType,
  isNative: systemInfo.isNative,
  isBrowser: systemInfo.isBrowser,
  isMobile: systemInfo.isMobile,
  isLittleEndian: systemInfo.isLittleEndian,
  platform: systemInfo.platform,
  language: systemInfo.language,
  languageCode: systemInfo.nativeLanguage,
  os: systemInfo.os,
  osVersion: systemInfo.osVersion,
  osMainVersion: systemInfo.osMainVersion,
  browserType: systemInfo.browserType,
  browserVersion: systemInfo.browserVersion,
  isXR: systemInfo.isXR,
  windowPixelResolution: screen$1.windowSize,
  capabilities: {
    canvas: true,
    opengl: true,
    webp: systemInfo.hasFeature(Feature.WEBP),
    imageBitmap: systemInfo.hasFeature(Feature.IMAGE_BITMAP),
    touches: systemInfo.hasFeature(Feature.INPUT_TOUCH),
    mouse: systemInfo.hasFeature(Feature.EVENT_MOUSE),
    keyboard: systemInfo.hasFeature(Feature.EVENT_KEYBOARD),
    accelerometer: systemInfo.hasFeature(Feature.EVENT_ACCELEROMETER)
  },
  localStorage: {},
  getNetworkType: function getNetworkType() {
    return systemInfo.networkType;
  },
  getBatteryLevel: function getBatteryLevel() {
    return systemInfo.getBatteryLevel();
  },
  garbageCollect: function garbageCollect() {
    systemInfo.triggerGC();
  },
  isObjectValid: function isObjectValid(obj) {
    if (obj === null || obj === undefined) {
      return false;
    }
    return true;
  },
  __isWebIOS14OrIPadOS14Env: false,
  dump: function dump() {
    var str = '';
    str += "isMobile : " + this.isMobile + "\r\n";
    str += "language : " + this.language + "\r\n";
    str += "browserType : " + this.browserType + "\r\n";
    str += "browserVersion : " + this.browserVersion + "\r\n";
    str += "supports webp: " + sys.hasFeature(Feature.WEBP) + "\r\n";
    str += "supports bitmap: " + sys.hasFeature(Feature.IMAGE_BITMAP) + "\r\n";
    str += "supports touches: " + sys.hasFeature(Feature.INPUT_TOUCH) + "\r\n";
    str += "supports mouse: " + sys.hasFeature(Feature.EVENT_MOUSE) + "\r\n";
    str += "supports keyboard: " + sys.hasFeature(Feature.EVENT_KEYBOARD) + "\r\n";
    str += "supports accelerometer: " + sys.hasFeature(Feature.EVENT_ACCELEROMETER) + "\r\n";
    str += "os : " + this.os + "\r\n";
    str += "osVersion : " + this.osVersion + "\r\n";
    str += "platform : " + this.platform + "\r\n";
    str += "Using " + (legacyCC.game.renderType === legacyCC.game.RENDER_TYPE_WEBGL ? 'WEBGL' : 'CANVAS') + " renderer.\r\n";
    log(str);
  },
  openURL: function openURL(url) {
    systemInfo.openURL(url);
  },
  init: function init() {
    var _this = this;
    return Promise.resolve().then(function () {
      return systemInfo.init();
    }).then(function () {
      try {
        var localStorage = sys.localStorage = window.localStorage;
        localStorage.setItem('storage', '');
        localStorage.removeItem('storage');
        localStorage = null;
      } catch (e) {
        var warn = function warn() {
          warnID(5200);
        };
        _this.localStorage = {
          getItem: warn,
          setItem: warn,
          clear: warn,
          removeItem: warn,
          key: warn,
          length: 0
        };
      }
      {
        _this.__isWebIOS14OrIPadOS14Env = (sys.os === OS.IOS || sys.os === OS.OSX) && systemInfo.isBrowser && /(OS 14)|(Version\/14)/.test(window.navigator.userAgent);
      }
    });
  },
  now: function now() {
    return systemInfo.now();
  },
  restartVM: function restartVM() {
    systemInfo.restartJSVM();
  },
  getSafeAreaRect: function getSafeAreaRect(symmetric) {
    if (symmetric === void 0) {
      symmetric = true;
    }
    var locView = legacyCC.view;
    var edge = screenAdapter.safeAreaEdge;
    if (symmetric) {
      if (screenAdapter.orientation === macro.ORIENTATION_PORTRAIT) {
        if (edge.top < edge.bottom) {
          edge.top = edge.bottom;
        } else {
          edge.bottom = edge.top;
        }
      } else if (edge.left < edge.right) {
        edge.left = edge.right;
      } else {
        edge.right = edge.left;
      }
    }
    var windowSize = screenAdapter.windowSize;
    var leftBottom = new Vec2(edge.left, edge.bottom);
    var rightTop = new Vec2(windowSize.width - edge.right, windowSize.height - edge.top);
    locView._convertToUISpace(leftBottom);
    locView._convertToUISpace(rightTop);
    var x = leftBottom.x;
    var y = leftBottom.y;
    var width = rightTop.x - leftBottom.x;
    var height = rightTop.y - leftBottom.y;
    return new Rect(x, y, width, height);
  }
};
legacyCC.sys = sys;

markAsWarning(legacyCC, 'cc', [{
  name: 'winSize',
  suggest: 'please use view.getVisibleSize() instead.'
}]);
markAsWarning(sys, 'sys', [{
  name: 'capabilities',
  suggest: 'please use sys.hasFeature() method instead.'
}]);
replaceProperty(sys, 'sys', ['UNKNOWN', 'ENGLISH', 'CHINESE', 'FRENCH', 'ITALIAN', 'GERMAN', 'SPANISH', 'DUTCH', 'RUSSIAN', 'KOREAN', 'JAPANESE', 'HUNGARIAN', 'PORTUGUESE', 'ARABIC', 'NORWEGIAN', 'POLISH', 'TURKISH', 'UKRAINIAN', 'ROMANIAN', 'BULGARIAN'].map(function (item) {
  return {
    name: "LANGUAGE_" + item,
    newName: item,
    target: sys.Language,
    targetName: 'sys.Language'
  };
}));
replaceProperty(sys, 'sys', ['UNKNOWN', 'IOS', 'ANDROID', 'WINDOWS', 'LINUX', 'OSX'].map(function (item) {
  return {
    name: "OS_" + item,
    newName: item,
    target: sys.OS,
    targetName: 'sys.OS'
  };
}));
replaceProperty(sys, 'sys', ['UNKNOWN', 'WECHAT', 'ANDROID', 'IE', 'EDGE', 'QQ', 'MOBILE_QQ', 'UC', 'UCBS', 'BAIDU_APP', 'BAIDU', 'MAXTHON', 'OPERA', 'OUPENG', 'MIUI', 'FIREFOX', 'SAFARI', 'CHROME', 'LIEBAO', 'QZONE', 'SOUGOU', 'HUAWEI'].map(function (item) {
  return {
    name: "BROWSER_TYPE_" + item,
    newName: item,
    target: sys.BrowserType,
    targetName: 'sys.BrowserType'
  };
}));
replaceProperty(sys, 'sys', [{
  name: 'BROWSER_TYPE_360',
  newName: 'BROWSER_360',
  target: sys.BrowserType,
  targetName: 'sys.BrowserType'
}]);
replaceProperty(sys, 'sys', ['UNKNOWN', 'EDITOR_PAGE', 'EDITOR_CORE', 'MOBILE_BROWSER', 'DESKTOP_BROWSER', 'WIN32', 'MACOS', 'IOS', 'ANDROID', 'OHOS', 'WECHAT_GAME', 'XIAOMI_QUICK_GAME', 'ALIPAY_MINI_GAME', 'BYTEDANCE_MINI_GAME', 'OPPO_MINI_GAME', 'VIVO_MINI_GAME', 'HUAWEI_QUICK_GAME'].map(function (item) {
  return {
    name: item,
    target: sys.Platform,
    targetName: 'sys.Platform'
  };
}));
replaceProperty(sys, 'sys', [{
  name: 'IPHONE',
  newName: 'IOS',
  target: sys.Platform,
  targetName: 'sys.Platform'
}, {
  name: 'IPAD',
  newName: 'IOS',
  target: sys.Platform,
  targetName: 'sys.Platform'
}]);
removeProperty(sys, 'sys', ['LINUX', 'BLACKBERRY', 'NACL', 'EMSCRIPTEN', 'TIZEN', 'WINRT', 'WP8', 'QQ_PLAY', 'FB_PLAYABLE_ADS'].map(function (item) {
  return {
    name: item
  };
}));
replaceProperty(sys, 'sys', [{
  name: 'windowPixelResolution',
  target: screen$1,
  targetName: 'screen',
  newName: 'windowSize'
}]);
markAsWarning(screen$1, 'screen', [{
  name: 'autoFullScreen',
  suggest: 'please use screen.requestFullScreen() instead.'
}, {
  name: 'disableAutoFullScreen'
}]);

var visibleRect = {
  topLeft: legacyCC.v2(0, 0),
  topRight: legacyCC.v2(0, 0),
  top: legacyCC.v2(0, 0),
  bottomLeft: legacyCC.v2(0, 0),
  bottomRight: legacyCC.v2(0, 0),
  bottom: legacyCC.v2(0, 0),
  center: legacyCC.v2(0, 0),
  left: legacyCC.v2(0, 0),
  right: legacyCC.v2(0, 0),
  width: 0,
  height: 0,
  init: function init(visibleRect_) {
    var w = this.width = visibleRect_.width;
    var h = this.height = visibleRect_.height;
    var l = visibleRect_.x;
    var b = visibleRect_.y;
    var t = b + h;
    var r = l + w;
    this.topLeft.x = l;
    this.topLeft.y = t;
    this.topRight.x = r;
    this.topRight.y = t;
    this.top.x = l + w / 2;
    this.top.y = t;
    this.bottomLeft.x = l;
    this.bottomLeft.y = b;
    this.bottomRight.x = r;
    this.bottomRight.y = b;
    this.bottom.x = l + w / 2;
    this.bottom.y = b;
    this.center.x = l + w / 2;
    this.center.y = b + h / 2;
    this.left.x = l;
    this.left.y = b + h / 2;
    this.right.x = r;
    this.right.y = b + h / 2;
  }
};
legacyCC.visibleRect = visibleRect;

var _v3_tmp$1 = new Vec3();
var _v3_tmp2$1 = new Vec3();
var _v3_tmp3 = new Vec3();
var _v3_tmp4 = new Vec3();
var _m3_tmp$1 = new Mat3();
var mathAbs$1 = Math.abs;
var transform_extent_m4 = function transform_extent_m4(out, extent, m4) {
  _m3_tmp$1.m00 = mathAbs$1(m4.m00);
  _m3_tmp$1.m01 = mathAbs$1(m4.m01);
  _m3_tmp$1.m02 = mathAbs$1(m4.m02);
  _m3_tmp$1.m03 = mathAbs$1(m4.m04);
  _m3_tmp$1.m04 = mathAbs$1(m4.m05);
  _m3_tmp$1.m05 = mathAbs$1(m4.m06);
  _m3_tmp$1.m06 = mathAbs$1(m4.m08);
  _m3_tmp$1.m07 = mathAbs$1(m4.m09);
  _m3_tmp$1.m08 = mathAbs$1(m4.m10);
  Vec3.transformMat3(out, extent, _m3_tmp$1);
};
var AABB = function () {
  function AABB(px, py, pz, hw, hh, hl) {
    if (px === void 0) {
      px = 0;
    }
    if (py === void 0) {
      py = 0;
    }
    if (pz === void 0) {
      pz = 0;
    }
    if (hw === void 0) {
      hw = 1;
    }
    if (hh === void 0) {
      hh = 1;
    }
    if (hl === void 0) {
      hl = 1;
    }
    this.center = void 0;
    this.halfExtents = void 0;
    this._type = void 0;
    this._type = ShapeType.SHAPE_AABB;
    this.center = new Vec3(px, py, pz);
    this.halfExtents = new Vec3(hw, hh, hl);
  }
  AABB.create = function create(px, py, pz, hw, hh, hl) {
    return new AABB(px, py, pz, hw, hh, hl);
  };
  AABB.clone = function clone(a) {
    {
      warn('The static method AABB.clone has been deprecated. Please use the corresponding instance method instead.');
    }
    return new AABB(a.center.x, a.center.y, a.center.z, a.halfExtents.x, a.halfExtents.y, a.halfExtents.z);
  };
  AABB.copy = function copy(out, a) {
    {
      warn('The static method AABB.copy has been deprecated. Please use the corresponding instance method instead.');
    }
    Vec3.copy(out.center, a.center);
    Vec3.copy(out.halfExtents, a.halfExtents);
    return out;
  };
  AABB.fromPoints = function fromPoints(out, minPos, maxPos) {
    Vec3.add(_v3_tmp$1, maxPos, minPos);
    Vec3.subtract(_v3_tmp2$1, maxPos, minPos);
    Vec3.multiplyScalar(out.center, _v3_tmp$1, 0.5);
    Vec3.multiplyScalar(out.halfExtents, _v3_tmp2$1, 0.5);
    return out;
  };
  AABB.set = function set(out, px, py, pz, hw, hh, hl) {
    out.center.set(px, py, pz);
    out.halfExtents.set(hw, hh, hl);
    return out;
  };
  AABB.merge = function merge(out, a, b) {
    Vec3.subtract(_v3_tmp$1, a.center, a.halfExtents);
    Vec3.subtract(_v3_tmp2$1, b.center, b.halfExtents);
    Vec3.add(_v3_tmp3, a.center, a.halfExtents);
    Vec3.add(_v3_tmp4, b.center, b.halfExtents);
    Vec3.max(_v3_tmp4, _v3_tmp3, _v3_tmp4);
    Vec3.min(_v3_tmp3, _v3_tmp$1, _v3_tmp2$1);
    return AABB.fromPoints(out, _v3_tmp3, _v3_tmp4);
  };
  AABB.toBoundingSphere = function toBoundingSphere(out, a) {
    out.center.set(a.center);
    out.radius = a.halfExtents.length();
    return out;
  };
  AABB.transform = function transform(out, a, matrix) {
    Vec3.transformMat4(out.center, a.center, matrix);
    transform_extent_m4(out.halfExtents, a.halfExtents, matrix);
    return out;
  };
  var _proto = AABB.prototype;
  _proto.getBoundary = function getBoundary(minPos, maxPos) {
    Vec3.subtract(minPos, this.center, this.halfExtents);
    Vec3.add(maxPos, this.center, this.halfExtents);
  };
  _proto.transform = function transform(m, pos, rot, scale, out) {
    Vec3.transformMat4(out.center, this.center, m);
    transform_extent_m4(out.halfExtents, this.halfExtents, m);
  };
  _proto.clone = function clone() {
    var center = this.center;
    var halfExtents = this.halfExtents;
    return new AABB(center.x, center.y, center.z, halfExtents.x, halfExtents.y, halfExtents.z);
  };
  _proto.copy = function copy(a) {
    Vec3.copy(this.center, a.center);
    Vec3.copy(this.halfExtents, a.halfExtents);
    return this;
  };
  _proto.mergePoint = function mergePoint(point) {
    this.getBoundary(_v3_tmp$1, _v3_tmp2$1);
    if (point.x < _v3_tmp$1.x) {
      _v3_tmp$1.x = point.x;
    }
    if (point.y < _v3_tmp$1.y) {
      _v3_tmp$1.y = point.y;
    }
    if (point.z < _v3_tmp$1.z) {
      _v3_tmp$1.z = point.z;
    }
    if (point.x > _v3_tmp2$1.x) {
      _v3_tmp2$1.x = point.x;
    }
    if (point.y > _v3_tmp2$1.y) {
      _v3_tmp2$1.y = point.y;
    }
    if (point.z > _v3_tmp2$1.z) {
      _v3_tmp2$1.z = point.z;
    }
    Vec3.add(_v3_tmp3, _v3_tmp$1, _v3_tmp2$1);
    this.center.set(Vec3.multiplyScalar(_v3_tmp3, _v3_tmp3, 0.5));
    this.halfExtents.set(_v3_tmp2$1.x - _v3_tmp3.x, _v3_tmp2$1.y - _v3_tmp3.y, _v3_tmp2$1.z - _v3_tmp3.z);
  };
  _proto.mergePoints = function mergePoints(points) {
    if (points.length < 1) {
      return;
    }
    for (var i = 0; i < points.length; i++) {
      this.mergePoint(points[i]);
    }
  };
  _proto.mergeFrustum = function mergeFrustum(frustum) {
    this.mergePoints(frustum.vertices);
  };
  return _createClass(AABB, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}();

var Capsule = function () {
  function Capsule(radius, halfHeight, axis) {
    if (radius === void 0) {
      radius = 0.5;
    }
    if (halfHeight === void 0) {
      halfHeight = 0.5;
    }
    if (axis === void 0) {
      axis = 1;
    }
    this._type = void 0;
    this.radius = void 0;
    this.halfHeight = void 0;
    this.axis = void 0;
    this.center = void 0;
    this.rotation = void 0;
    this.ellipseCenter0 = void 0;
    this.ellipseCenter1 = void 0;
    this._type = ShapeType.SHAPE_CAPSULE;
    this.radius = radius;
    this.halfHeight = halfHeight;
    this.axis = axis;
    this.center = new Vec3();
    this.rotation = new Quat();
    this.ellipseCenter0 = new Vec3(0, halfHeight, 0);
    this.ellipseCenter1 = new Vec3(0, -halfHeight, 0);
    this.updateCache();
  }
  var _proto = Capsule.prototype;
  _proto.transform = function transform(m, pos, rot, scale, out) {
    var ws = scale;
    var s = absMaxComponent(ws);
    out.radius = this.radius * Math.abs(s);
    var halfTotalWorldHeight = (this.halfHeight + this.radius) * Math.abs(ws.y);
    var halfWorldHeight = halfTotalWorldHeight - out.radius;
    if (halfWorldHeight < 0) halfWorldHeight = 0;
    out.halfHeight = halfWorldHeight;
    Vec3.transformMat4(out.center, this.center, m);
    Quat.multiply(out.rotation, this.rotation, rot);
    out.updateCache();
  };
  _proto.updateCache = function updateCache() {
    this.updateLocalCenter();
    Vec3.transformQuat(this.ellipseCenter0, this.ellipseCenter0, this.rotation);
    Vec3.transformQuat(this.ellipseCenter1, this.ellipseCenter1, this.rotation);
    this.ellipseCenter0.add(this.center);
    this.ellipseCenter1.add(this.center);
  };
  _proto.updateLocalCenter = function updateLocalCenter() {
    var halfHeight = this.halfHeight;
    var axis = this.axis;
    switch (axis) {
      case 0:
        this.ellipseCenter0.set(halfHeight, 0, 0);
        this.ellipseCenter1.set(-halfHeight, 0, 0);
        break;
      case 1:
        this.ellipseCenter0.set(0, halfHeight, 0);
        this.ellipseCenter1.set(0, -halfHeight, 0);
        break;
      case 2:
        this.ellipseCenter0.set(0, 0, halfHeight);
        this.ellipseCenter1.set(0, 0, -halfHeight);
        break;
    }
  };
  return _createClass(Capsule, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}();

var _v = new Array(8);
_v[0] = v3(1, 1, 1);
_v[1] = v3(-1, 1, 1);
_v[2] = v3(-1, -1, 1);
_v[3] = v3(1, -1, 1);
_v[4] = v3(1, 1, -1);
_v[5] = v3(-1, 1, -1);
_v[6] = v3(-1, -1, -1);
_v[7] = v3(1, -1, -1);
var _nearTemp = v3();
var _farTemp = v3();
var _temp_v3 = v3();
var planeFromPoints = Plane.fromPoints;
var vec3Set = Vec3.set;
var vec3TransformMat4 = Vec3.transformMat4;
var Frustum = function () {
  function Frustum() {
    this.planes = void 0;
    this.vertices = void 0;
    this._type = void 0;
    this._type = ShapeType.SHAPE_FRUSTUM;
    this.planes = new Array(6);
    for (var i = 0; i < 6; ++i) {
      this.planes[i] = Plane.create(0, 0, 0, 0);
    }
    this.vertices = new Array(8);
    for (var _i = 0; _i < 8; ++_i) {
      this.vertices[_i] = new Vec3();
    }
  }
  Frustum.createOrthographic = function createOrthographic(out, width, height, near, far, transform) {
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    vec3Set(_temp_v3, halfWidth, halfHeight, -near);
    vec3TransformMat4(out.vertices[0], _temp_v3, transform);
    vec3Set(_temp_v3, -halfWidth, halfHeight, -near);
    vec3TransformMat4(out.vertices[1], _temp_v3, transform);
    vec3Set(_temp_v3, -halfWidth, -halfHeight, -near);
    vec3TransformMat4(out.vertices[2], _temp_v3, transform);
    vec3Set(_temp_v3, halfWidth, -halfHeight, -near);
    vec3TransformMat4(out.vertices[3], _temp_v3, transform);
    vec3Set(_temp_v3, halfWidth, halfHeight, -far);
    vec3TransformMat4(out.vertices[4], _temp_v3, transform);
    vec3Set(_temp_v3, -halfWidth, halfHeight, -far);
    vec3TransformMat4(out.vertices[5], _temp_v3, transform);
    vec3Set(_temp_v3, -halfWidth, -halfHeight, -far);
    vec3TransformMat4(out.vertices[6], _temp_v3, transform);
    vec3Set(_temp_v3, halfWidth, -halfHeight, -far);
    vec3TransformMat4(out.vertices[7], _temp_v3, transform);
    out.updatePlanes();
  };
  Frustum.createOrtho = function createOrtho(out, width, height, near, far, transform) {
    return Frustum.createOrthographic(out, width, height, near, far, transform);
  };
  Frustum.createPerspective = function createPerspective(out, aspect, fov, near, far, transform) {
    var h = Math.tan(fov * 0.5);
    var w = h * aspect;
    _nearTemp.set(near * w, near * h, near);
    _farTemp.set(far * w, far * h, far);
    var vertexes = out.vertices;
    _temp_v3.set(_nearTemp.x, _nearTemp.y, -_nearTemp.z);
    vec3TransformMat4(vertexes[0], _temp_v3, transform);
    _temp_v3.set(-_nearTemp.x, _nearTemp.y, -_nearTemp.z);
    vec3TransformMat4(vertexes[1], _temp_v3, transform);
    _temp_v3.set(-_nearTemp.x, -_nearTemp.y, -_nearTemp.z);
    vec3TransformMat4(vertexes[2], _temp_v3, transform);
    _temp_v3.set(_nearTemp.x, -_nearTemp.y, -_nearTemp.z);
    vec3TransformMat4(vertexes[3], _temp_v3, transform);
    _temp_v3.set(_farTemp.x, _farTemp.y, -_farTemp.z);
    vec3TransformMat4(vertexes[4], _temp_v3, transform);
    _temp_v3.set(-_farTemp.x, _farTemp.y, -_farTemp.z);
    vec3TransformMat4(vertexes[5], _temp_v3, transform);
    _temp_v3.set(-_farTemp.x, -_farTemp.y, -_farTemp.z);
    vec3TransformMat4(vertexes[6], _temp_v3, transform);
    _temp_v3.set(_farTemp.x, -_farTemp.y, -_farTemp.z);
    vec3TransformMat4(vertexes[7], _temp_v3, transform);
    out.updatePlanes();
  };
  Frustum.createFromAABB = function createFromAABB(out, aabb) {
    var vec3_min = new Vec3();
    var vec3_max = new Vec3();
    Vec3.subtract(vec3_min, aabb.center, aabb.halfExtents);
    Vec3.add(vec3_max, aabb.center, aabb.halfExtents);
    var vertices = out.vertices;
    vertices[0].set(vec3_max.x, vec3_max.y, -vec3_min.z);
    vertices[1].set(vec3_min.x, vec3_max.y, -vec3_min.z);
    vertices[2].set(vec3_min.x, vec3_min.y, -vec3_min.z);
    vertices[3].set(vec3_max.x, vec3_min.y, -vec3_min.z);
    vertices[4].set(vec3_max.x, vec3_max.y, -vec3_max.z);
    vertices[5].set(vec3_min.x, vec3_max.y, -vec3_max.z);
    vertices[6].set(vec3_min.x, vec3_min.y, -vec3_max.z);
    vertices[7].set(vec3_max.x, vec3_min.y, -vec3_max.z);
    out.updatePlanes();
    return out;
  };
  var _proto = Frustum.prototype;
  _proto.split = function split(start, end, aspect, fov, m) {
    return Frustum.createPerspective(this, aspect, fov, start, end, m);
  };
  Frustum.create = function create() {
    return new Frustum();
  };
  Frustum.clone = function clone(f) {
    return Frustum.copy(new Frustum(), f);
  };
  Frustum.copy = function copy(out, f) {
    out._type = f.type;
    for (var i = 0; i < 6; ++i) {
      Plane.copy(out.planes[i], f.planes[i]);
    }
    for (var _i2 = 0; _i2 < 8; ++_i2) {
      Vec3.copy(out.vertices[_i2], f.vertices[_i2]);
    }
    return out;
  };
  _proto.update = function update(m, inv) {
    var planes = this.planes;
    vec3Set(planes[0].n, m.m03 + m.m00, m.m07 + m.m04, m.m11 + m.m08);
    planes[0].d = -(m.m15 + m.m12);
    vec3Set(planes[1].n, m.m03 - m.m00, m.m07 - m.m04, m.m11 - m.m08);
    planes[1].d = -(m.m15 - m.m12);
    vec3Set(planes[2].n, m.m03 + m.m01, m.m07 + m.m05, m.m11 + m.m09);
    planes[2].d = -(m.m15 + m.m13);
    vec3Set(planes[3].n, m.m03 - m.m01, m.m07 - m.m05, m.m11 - m.m09);
    planes[3].d = -(m.m15 - m.m13);
    vec3Set(planes[4].n, m.m03 + m.m02, m.m07 + m.m06, m.m11 + m.m10);
    planes[4].d = -(m.m15 + m.m14);
    vec3Set(planes[5].n, m.m03 - m.m02, m.m07 - m.m06, m.m11 - m.m10);
    planes[5].d = -(m.m15 - m.m14);
    for (var i = 0; i < 6; i++) {
      var pl = planes[i];
      var invDist = 1 / pl.n.length();
      Vec3.multiplyScalar(pl.n, pl.n, invDist);
      pl.d *= invDist;
    }
    for (var _i3 = 0; _i3 < 8; _i3++) {
      vec3TransformMat4(this.vertices[_i3], _v[_i3], inv);
    }
  };
  _proto.transform = function transform(mat) {
    for (var i = 0; i < 8; i++) {
      vec3TransformMat4(this.vertices[i], this.vertices[i], mat);
    }
    this.updatePlanes();
  };
  _proto.zero = function zero() {
    for (var i = 0; i < 8; i++) {
      this.vertices[i].set(0.0, 0.0, 0.0);
    }
    for (var _i4 = 0; _i4 < 6; _i4++) {
      Plane.set(this.planes[_i4], 0, 0, 0, 0);
    }
  };
  _proto.updatePlanes = function updatePlanes() {
    var planes = this.planes;
    var vertices = this.vertices;
    planeFromPoints(planes[0], vertices[1], vertices[6], vertices[5]);
    planeFromPoints(planes[1], vertices[3], vertices[4], vertices[7]);
    planeFromPoints(planes[2], vertices[6], vertices[3], vertices[7]);
    planeFromPoints(planes[3], vertices[0], vertices[5], vertices[4]);
    planeFromPoints(planes[4], vertices[2], vertices[0], vertices[3]);
    planeFromPoints(planes[5], vertices[7], vertices[5], vertices[6]);
  };
  return _createClass(Frustum, [{
    key: "accurate",
    set: function set(b) {
      this._type = b ? ShapeType.SHAPE_FRUSTUM_ACCURATE : ShapeType.SHAPE_FRUSTUM;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}();

var _v3_tmp = new Vec3();
var _v3_tmp2 = new Vec3();
var _m3_tmp = new Mat3();
var mathAbs = Math.abs;
var transform_extent_m3 = function transform_extent_m3(out, extent, m3) {
  _m3_tmp.m00 = mathAbs(m3.m00);
  _m3_tmp.m01 = mathAbs(m3.m01);
  _m3_tmp.m02 = mathAbs(m3.m02);
  _m3_tmp.m03 = mathAbs(m3.m03);
  _m3_tmp.m04 = mathAbs(m3.m04);
  _m3_tmp.m05 = mathAbs(m3.m05);
  _m3_tmp.m06 = mathAbs(m3.m06);
  _m3_tmp.m07 = mathAbs(m3.m07);
  _m3_tmp.m08 = mathAbs(m3.m08);
  Vec3.transformMat3(out, extent, _m3_tmp);
};
var OBB = function () {
  function OBB(cx, cy, cz, hw, hh, hl, ox_1, ox_2, ox_3, oy_1, oy_2, oy_3, oz_1, oz_2, oz_3) {
    if (cx === void 0) {
      cx = 0;
    }
    if (cy === void 0) {
      cy = 0;
    }
    if (cz === void 0) {
      cz = 0;
    }
    if (hw === void 0) {
      hw = 1;
    }
    if (hh === void 0) {
      hh = 1;
    }
    if (hl === void 0) {
      hl = 1;
    }
    if (ox_1 === void 0) {
      ox_1 = 1;
    }
    if (ox_2 === void 0) {
      ox_2 = 0;
    }
    if (ox_3 === void 0) {
      ox_3 = 0;
    }
    if (oy_1 === void 0) {
      oy_1 = 0;
    }
    if (oy_2 === void 0) {
      oy_2 = 1;
    }
    if (oy_3 === void 0) {
      oy_3 = 0;
    }
    if (oz_1 === void 0) {
      oz_1 = 0;
    }
    if (oz_2 === void 0) {
      oz_2 = 0;
    }
    if (oz_3 === void 0) {
      oz_3 = 1;
    }
    this.center = void 0;
    this.halfExtents = void 0;
    this.orientation = void 0;
    this._type = void 0;
    this._type = ShapeType.SHAPE_OBB;
    this.center = new Vec3(cx, cy, cz);
    this.halfExtents = new Vec3(hw, hh, hl);
    this.orientation = new Mat3(ox_1, ox_2, ox_3, oy_1, oy_2, oy_3, oz_1, oz_2, oz_3);
  }
  OBB.create = function create(cx, cy, cz, hw, hh, hl, ox_1, ox_2, ox_3, oy_1, oy_2, oy_3, oz_1, oz_2, oz_3) {
    return new OBB(cx, cy, cz, hw, hh, hl, ox_1, ox_2, ox_3, oy_1, oy_2, oy_3, oz_1, oz_2, oz_3);
  };
  OBB.clone = function clone(a) {
    return new OBB(a.center.x, a.center.y, a.center.z, a.halfExtents.x, a.halfExtents.y, a.halfExtents.z, a.orientation.m00, a.orientation.m01, a.orientation.m02, a.orientation.m03, a.orientation.m04, a.orientation.m05, a.orientation.m06, a.orientation.m07, a.orientation.m08);
  };
  OBB.copy = function copy(out, a) {
    Vec3.copy(out.center, a.center);
    Vec3.copy(out.halfExtents, a.halfExtents);
    Mat3.copy(out.orientation, a.orientation);
    return out;
  };
  OBB.fromPoints = function fromPoints(out, minPos, maxPos) {
    Vec3.multiplyScalar(out.center, Vec3.add(_v3_tmp, minPos, maxPos), 0.5);
    Vec3.multiplyScalar(out.halfExtents, Vec3.subtract(_v3_tmp2, maxPos, minPos), 0.5);
    Mat3.identity(out.orientation);
    return out;
  };
  OBB.set = function set(out, cx, cy, cz, hw, hh, hl, ox_1, ox_2, ox_3, oy_1, oy_2, oy_3, oz_1, oz_2, oz_3) {
    Vec3.set(out.center, cx, cy, cz);
    Vec3.set(out.halfExtents, hw, hh, hl);
    Mat3.set(out.orientation, ox_1, ox_2, ox_3, oy_1, oy_2, oy_3, oz_1, oz_2, oz_3);
    return out;
  };
  var _proto = OBB.prototype;
  _proto.getBoundary = function getBoundary(minPos, maxPos) {
    transform_extent_m3(_v3_tmp, this.halfExtents, this.orientation);
    Vec3.subtract(minPos, this.center, _v3_tmp);
    Vec3.add(maxPos, this.center, _v3_tmp);
  };
  _proto.transform = function transform(m, pos, rot, scale, out) {
    Vec3.transformMat4(out.center, this.center, m);
    Mat3.fromQuat(out.orientation, rot);
    Vec3.multiply(out.halfExtents, this.halfExtents, scale);
  };
  _proto.translateAndRotate = function translateAndRotate(m, rot, out) {
    Vec3.transformMat4(out.center, this.center, m);
    Mat3.fromQuat(out.orientation, rot);
  };
  _proto.setScale = function setScale(scale, out) {
    Vec3.multiply(out.halfExtents, this.halfExtents, scale);
  };
  return _createClass(OBB, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}();

function binarySearch(array, value) {
  return binarySearchEpsilon(array, value, 0);
}
function binarySearchEpsilon(array, value, EPSILON) {
  if (EPSILON === void 0) {
    EPSILON = 1e-6;
  }
  var low = 0;
  var high = array.length - 1;
  var middle = high >>> 1;
  for (; low <= high; middle = low + high >>> 1) {
    var test = array[middle];
    if (test > value + EPSILON) {
      high = middle - 1;
    } else if (test < value - EPSILON) {
      low = middle + 1;
    } else {
      return middle;
    }
  }
  return ~low;
}
function binarySearchBy(array, value, lessThan) {
  var low = 0;
  var high = array.length - 1;
  var middle = high >>> 1;
  for (; low <= high; middle = low + high >>> 1) {
    var test = array[middle];
    if (lessThan(test, value) < 0) {
      high = middle - 1;
    } else if (lessThan(test, value) > 0) {
      low = middle + 1;
    } else {
      return middle;
    }
  }
  return ~low;
}

var KeyframeCurve = function () {
  function KeyframeCurve() {
    this._times = [];
    this._values = [];
  }
  var _proto = KeyframeCurve.prototype;
  _proto[Symbol.iterator] = function () {
    var _this = this;
    var index = 0;
    return {
      next: function next() {
        if (index >= _this._times.length) {
          return {
            done: true,
            value: undefined
          };
        } else {
          var value = [_this._times[index], _this._values[index]];
          ++index;
          return {
            done: false,
            value: value
          };
        }
      }
    };
  };
  _proto.keyframes = function keyframes() {
    return this;
  };
  _proto.times = function times() {
    return this._times;
  };
  _proto.values = function values() {
    return this._values;
  };
  _proto.getKeyframeTime = function getKeyframeTime(index) {
    return this._times[index];
  };
  _proto.getKeyframeValue = function getKeyframeValue(index) {
    return this._values[index];
  };
  _proto.addKeyFrame = function addKeyFrame(time, keyframeValue) {
    return this._insertNewKeyframe(time, keyframeValue);
  };
  _proto.removeKeyframe = function removeKeyframe(index) {
    this._times.splice(index, 1);
    this._values.splice(index, 1);
  };
  _proto.indexOfKeyframe = function indexOfKeyframe(time) {
    return binarySearchEpsilon(this._times, time);
  };
  _proto.updateTime = function updateTime(index, time) {
    var value = this._values[index];
    this.removeKeyframe(index);
    this._insertNewKeyframe(time, value);
  };
  _proto.assignSorted = function assignSorted(times, values) {
    if (values !== undefined) {
      assertIsTrue(Array.isArray(times));
      this.setKeyframes(times.slice(), values.slice());
    } else {
      var _keyframes = Array.from(times);
      this.setKeyframes(_keyframes.map(function (_ref) {
        var time = _ref[0];
        return time;
      }), _keyframes.map(function (_ref2) {
        var value = _ref2[1];
        return value;
      }));
    }
  };
  _proto.clear = function clear() {
    this._times.length = 0;
    this._values.length = 0;
  };
  _proto.searchKeyframe = function searchKeyframe(time) {
    return binarySearchEpsilon(this._times, time);
  };
  _proto.setKeyframes = function setKeyframes(times, values) {
    assertIsTrue(times.length === values.length);
    assertIsTrue(isSorted(times));
    this._times = times;
    this._values = values;
  };
  _proto._insertNewKeyframe = function _insertNewKeyframe(time, value) {
    var times = this._times;
    var values = this._values;
    var nFrames = times.length;
    var index = binarySearchEpsilon(times, time);
    if (index >= 0) {
      return index;
    }
    var iNext = ~index;
    if (iNext === 0) {
      times.unshift(time);
      values.unshift(value);
    } else if (iNext === nFrames) {
      times.push(time);
      values.push(value);
    } else {
      assertIsTrue(nFrames > 1);
      times.splice(iNext - 1, 0, time);
      values.splice(iNext - 1, 0, value);
    }
    return iNext;
  };
  return _createClass(KeyframeCurve, [{
    key: "keyFramesCount",
    get: function get() {
      return this._times.length;
    }
  }, {
    key: "rangeMin",
    get: function get() {
      return this._times[0];
    }
  }, {
    key: "rangeMax",
    get: function get() {
      return this._times[this._values.length - 1];
    }
  }]);
}();
CCClass.fastDefine('cc.KeyframeCurve', KeyframeCurve, {
  _times: [],
  _values: []
});
function isSorted(values) {
  return values.every(function (value, index, array) {
    return index === 0 || value > array[index - 1] || approx(value, array[index - 1], 1e-6);
  });
}

var RealInterpolationMode;
(function (RealInterpolationMode) {
  RealInterpolationMode[RealInterpolationMode["LINEAR"] = 0] = "LINEAR";
  RealInterpolationMode[RealInterpolationMode["CONSTANT"] = 1] = "CONSTANT";
  RealInterpolationMode[RealInterpolationMode["CUBIC"] = 2] = "CUBIC";
})(RealInterpolationMode || (RealInterpolationMode = {}));
var ExtrapolationMode;
(function (ExtrapolationMode) {
  ExtrapolationMode[ExtrapolationMode["LINEAR"] = 0] = "LINEAR";
  ExtrapolationMode[ExtrapolationMode["CLAMP"] = 1] = "CLAMP";
  ExtrapolationMode[ExtrapolationMode["LOOP"] = 2] = "LOOP";
  ExtrapolationMode[ExtrapolationMode["PING_PONG"] = 3] = "PING_PONG";
})(ExtrapolationMode || (ExtrapolationMode = {}));
var TangentWeightMode;
(function (TangentWeightMode) {
  TangentWeightMode[TangentWeightMode["NONE"] = 0] = "NONE";
  TangentWeightMode[TangentWeightMode["LEFT"] = 1] = "LEFT";
  TangentWeightMode[TangentWeightMode["RIGHT"] = 2] = "RIGHT";
  TangentWeightMode[TangentWeightMode["BOTH"] = 3] = "BOTH";
})(TangentWeightMode || (TangentWeightMode = {}));

function solveCubic(coeff0, coeff1, coeff2, coeff3, solutions) {
  var a = coeff2 / coeff3;
  var b = coeff1 / coeff3;
  var c = coeff0 / coeff3;
  var sqrA = a * a;
  var p = 1.0 / 3.0 * (-1 / 3 * sqrA + b);
  var q = 1.0 / 2.0 * (2.0 / 27.0 * a * sqrA - 1.0 / 3 * a * b + c);
  var cubicP = p * p * p;
  var d = q * q + cubicP;
  var nSolutions = 0;
  if (isZero(d)) {
    if (isZero(q)) {
      solutions[0] = 0;
      return 1;
    } else {
      var u = Math.cbrt(-q);
      solutions[0] = 2 * u;
      solutions[1] = -u;
      return 2;
    }
  } else if (d < 0) {
    var phi = 1.0 / 3 * Math.acos(-q / Math.sqrt(-cubicP));
    var t = 2 * Math.sqrt(-p);
    solutions[0] = t * Math.cos(phi);
    solutions[1] = -t * Math.cos(phi + Math.PI / 3);
    solutions[2] = -t * Math.cos(phi - Math.PI / 3);
    nSolutions = 3;
  } else {
    var sqrtD = Math.sqrt(d);
    var _u = Math.cbrt(sqrtD - q);
    var v = -Math.cbrt(sqrtD + q);
    solutions[0] = _u + v;
    nSolutions = 1;
  }
  var sub = 1.0 / 3 * a;
  for (var i = 0; i < nSolutions; ++i) {
    solutions[i] -= sub;
  }
  return nSolutions;
}
var EQN_EPS = 1e-9;
function isZero(x) {
  return x > -EQN_EPS && x < EQN_EPS;
}

function applyDecoratedInitializer(target, property, decorators, initializer) {
  return decorators.slice().reverse().reduce(function (decoratedInitializer, decorator) {
    return decorator(target, property, decoratedInitializer) || decoratedInitializer;
  }, initializer);
}

var emptyDecorator = function emptyDecorator() {};
function makeSmartClassDecorator(decorate) {
  return proxyFn;
  function proxyFn(target) {
    if (typeof target === 'function') {
      return decorate(target);
    } else {
      return function (constructor) {
        return decorate(constructor, target);
      };
    }
  }
}
function writeEditorClassProperty(constructor, propertyName, value) {
  var cache = getClassCache(constructor, propertyName);
  if (cache) {
    var proto = getSubDict(cache, 'proto');
    getSubDict(proto, 'editor')[propertyName] = value;
  }
}
function makeEditorClassDecoratorFn(propertyName) {
  return function (value) {
    return function (constructor) {
      writeEditorClassProperty(constructor, propertyName, value);
    };
  };
}
function makeSmartEditorClassDecorator(propertyName, defaultValue) {
  return makeSmartClassDecorator(function (constructor, decoratedValue) {
    writeEditorClassProperty(constructor, propertyName, defaultValue );
  });
}
var CACHE_KEY = '__ccclassCache__';
function getClassCache(ctor, decoratorName) {
  if (CCClass._isCCClass(ctor)) {
    error('`@%s` should be used after @ccclass for class "%s"', decoratorName, getClassName(ctor));
    return null;
  }
  return getSubDict(ctor, CACHE_KEY);
}
function getSubDict(obj, key) {
  return obj[key] || (obj[key] = {});
}

var ccclass = makeSmartClassDecorator(function (constructor, name) {
  var base = getSuper(constructor);
  if (base === Object) {
    base = null;
  }
  var proto = {
    name: name,
    "extends": base,
    ctor: constructor
  };
  var cache = constructor[CACHE_KEY];
  if (cache) {
    var decoratedProto = cache.proto;
    if (decoratedProto) {
      mixin(proto, decoratedProto);
    }
    constructor[CACHE_KEY] = undefined;
  }
  var res = CCClass(proto);
  {
    var propNames = Object.getOwnPropertyNames(constructor.prototype);
    for (var i = 0; i < propNames.length; ++i) {
      var prop = propNames[i];
      if (prop !== 'constructor') {
        var desc = Object.getOwnPropertyDescriptor(constructor.prototype, prop);
        var func = desc && desc.value;
        if (typeof func === 'function') {
          doValidateMethodWithProps_DEV(func, prop, getClassName(constructor), constructor, base);
        }
      }
    }
  }
  return res;
});

var requireComponent = makeEditorClassDecoratorFn('requireComponent');
var executionOrder = makeEditorClassDecoratorFn('executionOrder');
var disallowMultiple = makeSmartEditorClassDecorator('disallowMultiple', true) ;

function property(target, propertyKey, descriptorOrInitializer) {
  var options = null;
  function normalized(target, propertyKey, descriptorOrInitializer) {
    var classStash = getOrCreateClassStash(target);
    var propertyStash = getOrCreateEmptyPropertyStash(target, propertyKey);
    var classConstructor = target.constructor;
    mergePropertyOptions(classStash, propertyStash, classConstructor, propertyKey, options, descriptorOrInitializer);
  }
  if (target === undefined) {
    return property({
      type: undefined
    });
  } else if (typeof propertyKey === 'undefined') {
    options = target;
    return normalized;
  } else {
    normalized(target, propertyKey, descriptorOrInitializer);
    return undefined;
  }
}
function getDefaultFromInitializer(initializer) {
  var value;
  try {
    value = initializer();
  } catch (e) {
    return initializer;
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  } else {
    return initializer;
  }
}
function extractActualDefaultValues(classConstructor) {
  var dummyObj;
  try {
    dummyObj = new classConstructor();
  } catch (e) {
    {
      warnID(3652, getClassName(classConstructor), e);
    }
    return {};
  }
  return dummyObj;
}
function getOrCreateClassStash(target) {
  var cache = getClassCache(target.constructor);
  return cache;
}
function getOrCreateEmptyPropertyStash(target, propertyKey) {
  var _ref, _properties$_ref;
  var classStash = getClassCache(target.constructor);
  var ccclassProto = getSubDict(classStash, 'proto');
  var properties = getSubDict(ccclassProto, 'properties');
  var propertyStash = (_properties$_ref = properties[_ref = propertyKey]) !== null && _properties$_ref !== void 0 ? _properties$_ref : properties[_ref] = {};
  return propertyStash;
}
function getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer) {
  var _ref2, _properties$_ref2;
  var classStash = getClassCache(target.constructor);
  var ccclassProto = getSubDict(classStash, 'proto');
  var properties = getSubDict(ccclassProto, 'properties');
  var propertyStash = (_properties$_ref2 = properties[_ref2 = propertyKey]) !== null && _properties$_ref2 !== void 0 ? _properties$_ref2 : properties[_ref2] = {};
  propertyStash.__internalFlags |= PropertyStashInternalFlag.STANDALONE;
  if (descriptorOrInitializer && typeof descriptorOrInitializer !== 'function' && (descriptorOrInitializer.get || descriptorOrInitializer.set)) {
    if (descriptorOrInitializer.get) {
      propertyStash.get = descriptorOrInitializer.get;
    }
    if (descriptorOrInitializer.set) {
      propertyStash.set = descriptorOrInitializer.set;
    }
  } else {
    setDefaultValue(classStash, propertyStash, target.constructor, propertyKey, descriptorOrInitializer);
  }
  return propertyStash;
}
function mergePropertyOptions(cache, propertyStash, ctor, propertyKey, options, descriptorOrInitializer) {
  var fullOptions;
  var isGetset = descriptorOrInitializer && typeof descriptorOrInitializer !== 'function' && (descriptorOrInitializer.get || descriptorOrInitializer.set);
  if (options) {
    fullOptions = getFullFormOfProperty(options, isGetset);
  }
  var propertyRecord = mixin(propertyStash, fullOptions || options || {});
  if (isGetset) {
    if (options && ((fullOptions || options).get || (fullOptions || options).set)) {
      var errorProps = getSubDict(cache, 'errorProps');
      if (!errorProps[propertyKey]) {
        errorProps[propertyKey] = true;
        warnID(3655, propertyKey, getClassName(ctor), propertyKey, propertyKey);
      }
    }
    if (descriptorOrInitializer.get) {
      propertyRecord.get = descriptorOrInitializer.get;
    }
    if (descriptorOrInitializer.set) {
      propertyRecord.set = descriptorOrInitializer.set;
    }
  } else {
    if ((propertyRecord.get || propertyRecord.set)) {
      errorID(3655, propertyKey, getClassName(ctor), propertyKey, propertyKey);
      return;
    }
    setDefaultValue(cache, propertyRecord, ctor, propertyKey, descriptorOrInitializer);
  }
}
function setDefaultValue(classStash, propertyStash, classConstructor, propertyKey, descriptorOrInitializer) {
  if (descriptorOrInitializer !== undefined) {
    if (typeof descriptorOrInitializer === 'function') {
      propertyStash["default"] = getDefaultFromInitializer(descriptorOrInitializer);
    } else if (descriptorOrInitializer === null) ; else if (descriptorOrInitializer.initializer) {
      propertyStash["default"] = getDefaultFromInitializer(descriptorOrInitializer.initializer);
    }
  } else {
    var actualDefaultValues = classStash["default"] || (classStash["default"] = extractActualDefaultValues(classConstructor));
    if (actualDefaultValues.hasOwnProperty(propertyKey)) {
      propertyStash["default"] = actualDefaultValues[propertyKey];
    }
  }
}

var sMetadataTag = Symbol('cc:SerializationMetadata');
function getSerializationMetadata(constructor) {
  return constructor[sMetadataTag];
}
function getOrCreateSerializationMetadata(constructor) {
  var _ref, _ref$sMetadataTag;
  return (_ref$sMetadataTag = (_ref = constructor)[sMetadataTag]) !== null && _ref$sMetadataTag !== void 0 ? _ref$sMetadataTag : _ref[sMetadataTag] = {};
}

var serializable = function serializable(target, propertyKey, descriptorOrInitializer) {
  var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
  setImplicitSerializable(propertyStash);
};
function formerlySerializedAs(name) {
  return function (target, propertyKey, descriptorOrInitializer) {
    var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
    propertyStash.formerlySerializedAs = name;
    setImplicitSerializable(propertyStash);
  };
}
var editorOnly = function editorOnly(target, propertyKey, descriptorOrInitializer) {
  var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
  propertyStash.editorOnly = true;
  setImplicitSerializable(propertyStash);
};
function setImplicitSerializable(propertyStash) {
  propertyStash.__internalFlags |= PropertyStashInternalFlag.IMPLICIT_SERIALIZABLE;
}
var uniquelyReferenced = emptyDecorator ;

var executeInEditMode = makeSmartEditorClassDecorator('executeInEditMode', true) ;
var menu = makeEditorClassDecoratorFn('menu') ;
var playOnFocus = makeSmartEditorClassDecorator('playOnFocus', true) ;
var inspector = makeEditorClassDecoratorFn('inspector') ;
var icon = makeEditorClassDecoratorFn('icon') ;
var help = makeEditorClassDecoratorFn('help') ;
var editable = function (target, propertyKey, descriptorOrInitializer) {
  var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
  setImplicitVisible(propertyStash);
};
var visible = setPropertyStashVar1WithImplicitVisible('visible');
var displayName = setPropertyStashVar1WithImplicitVisible('displayName');
var tooltip = setPropertyStashWithImplicitI18n('tooltip');
var range = setPropertyStashVar1WithImplicitVisible('range');
var rangeStep = setPropertyStashVar1WithImplicitVisible('step');
var slide = setPropertyStashWithImplicitVisible('slide', true);
var displayOrder = setPropertyStashVar1WithImplicitVisible('displayOrder');
var disallowAnimation = function (target, propertyKey, descriptorOrInitializer) {
  var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
  propertyStash.animatable = false;
};
function setPropertyStashWithImplicitVisible(key, value) {
  return function (target, propertyKey, descriptorOrInitializer) {
    var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
    propertyStash[key] = value;
    setImplicitVisible(propertyStash);
  };
}
function setPropertyStashVar1WithImplicitVisible(key) {
  return function (value) {
    return function (target, propertyKey, descriptorOrInitializer) {
      var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
      propertyStash[key] = value;
      setImplicitVisible(propertyStash);
    };
  };
}
function setImplicitVisible(propertyStash) {
  propertyStash.__internalFlags |= PropertyStashInternalFlag.IMPLICIT_VISIBLE;
}
function setPropertyStashWithImplicitI18n(key) {
  return function (value) {
    return function (target, propertyKey, descriptorOrInitializer) {
      var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
      var prefix = 'i18n:';
      if (value.startsWith(prefix)) {
        var extensionPrefix = 'ENGINE.';
        propertyStash[key] = "" + prefix + extensionPrefix + value.substring(prefix.length);
      } else {
        propertyStash[key] = value;
      }
      setImplicitVisible(propertyStash);
    };
  };
}

var integer = type(CCInteger);
var _float = type(CCFloat);
var _boolean = type(CCBoolean);
var string = type(CCString);
function type(type) {
  return property({
    type: type
  });
}

var override = function override(target, propertyKey, descriptorOrInitializer) {
  var propertyStash = getOrCreatePropertyStash(target, propertyKey, descriptorOrInitializer);
  propertyStash.override = true;
};

var Empty = function Empty() {};
var EditorExtendable = editorExtendableInternal();
assertIsTrue(editorExtrasTag === '__editorExtras__', 'editorExtrasTag needs to be updated.');
function editorExtendableInternal(Base, className) {
  {
    return Empty;
  }
}

var _decorator = /*#__PURE__*/Object.freeze({
    __proto__: null,
    boolean: _boolean,
    ccclass: ccclass,
    disallowAnimation: disallowAnimation,
    disallowMultiple: disallowMultiple,
    displayName: displayName,
    displayOrder: displayOrder,
    editable: editable,
    executeInEditMode: executeInEditMode,
    executionOrder: executionOrder,
    float: _float,
    formerlySerializedAs: formerlySerializedAs,
    help: help,
    icon: icon,
    inspector: inspector,
    integer: integer,
    menu: menu,
    override: override,
    playOnFocus: playOnFocus,
    property: property,
    range: range,
    rangeStep: rangeStep,
    requireComponent: requireComponent,
    serializable: serializable,
    slide: slide,
    string: string,
    tooltip: tooltip,
    type: type,
    uniquelyReferenced: uniquelyReferenced,
    visible: visible
});

var _dec$2, _class$2, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4$1, _CompactValueTypeArray, _BuiltinElementTypeTr;
var StorageUnit;
(function (StorageUnit) {
  StorageUnit[StorageUnit["Uint8"] = 0] = "Uint8";
  StorageUnit[StorageUnit["Uint16"] = 1] = "Uint16";
  StorageUnit[StorageUnit["Uint32"] = 2] = "Uint32";
  StorageUnit[StorageUnit["Int8"] = 3] = "Int8";
  StorageUnit[StorageUnit["Int16"] = 4] = "Int16";
  StorageUnit[StorageUnit["Int32"] = 5] = "Int32";
  StorageUnit[StorageUnit["Float32"] = 6] = "Float32";
  StorageUnit[StorageUnit["Float64"] = 7] = "Float64";
})(StorageUnit || (StorageUnit = {}));
var ElementType;
(function (ElementType) {
  ElementType[ElementType["Scalar"] = 0] = "Scalar";
  ElementType[ElementType["Vec2"] = 1] = "Vec2";
  ElementType[ElementType["Vec3"] = 2] = "Vec3";
  ElementType[ElementType["Vec4"] = 3] = "Vec4";
  ElementType[ElementType["Quat"] = 4] = "Quat";
  ElementType[ElementType["Mat4"] = 5] = "Mat4";
})(ElementType || (ElementType = {}));
var elementTypeBits = 3;
function combineStorageUnitElementType(unit, elementType) {
  return (elementType << elementTypeBits) + unit;
}
function extractStorageUnitElementType(combined) {
  return {
    storageUnit: 7 & combined,
    elementType: combined >> elementTypeBits
  };
}
var CompactValueTypeArray = (_dec$2 = ccclass('cc.CompactValueTypeArray'), _dec$2(_class$2 = (_class2$1 = (_CompactValueTypeArray = function () {
  function CompactValueTypeArray() {
    this._byteOffset = _initializer$1 && _initializer$1();
    this._unitCount = _initializer2$1 && _initializer2$1();
    this._unitElement = _initializer3$1 && _initializer3$1();
    this._length = _initializer4$1 && _initializer4$1();
  }
  CompactValueTypeArray.lengthFor = function lengthFor(values, elementType, unit) {
    var elementTraits = getElementTraits(elementType);
    return elementTraits.requiredUnits * values.length * getStorageConstructor(unit).BYTES_PER_ELEMENT;
  };
  CompactValueTypeArray.compress = function compress(values, elementType, unit, arrayBuffer, byteOffset, presumedByteOffset) {
    var elementTraits = getElementTraits(elementType);
    var storageConstructor = getStorageConstructor(unit);
    var unitCount = elementTraits.requiredUnits * values.length;
    var storage = new storageConstructor(arrayBuffer, byteOffset, unitCount);
    for (var i = 0; i < values.length; ++i) {
      elementTraits.compress(storage, i, values[i]);
    }
    var result = new CompactValueTypeArray();
    result._unitElement = combineStorageUnitElementType(unit, elementType);
    result._byteOffset = presumedByteOffset;
    result._unitCount = unitCount;
    result._length = values.length;
    return result;
  };
  var _proto = CompactValueTypeArray.prototype;
  _proto.decompress = function decompress(arrayBuffer) {
    var _extractStorageUnitEl = extractStorageUnitElementType(this._unitElement),
      storageUnit = _extractStorageUnitEl.storageUnit,
      elementType = _extractStorageUnitEl.elementType;
    var elementTraits = getElementTraits(elementType);
    var storageConstructor = getStorageConstructor(storageUnit);
    var storage = new storageConstructor(arrayBuffer, this._byteOffset, this._unitCount);
    var result = new Array(this._length);
    for (var i = 0; i < this._length; ++i) {
      result[i] = elementTraits.decompress(storage, i);
    }
    return result;
  };
  return CompactValueTypeArray;
}(), _CompactValueTypeArray.StorageUnit = StorageUnit, _CompactValueTypeArray.ElementType = ElementType, _CompactValueTypeArray), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "_byteOffset", [serializable], function () {
  return 0;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "_unitCount", [serializable], function () {
  return 0;
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "_unitElement", [serializable], function () {
  return combineStorageUnitElementType(StorageUnit.Uint8, ElementType.Scalar);
}), _initializer4$1 = applyDecoratedInitializer(_class2$1.prototype, "_length", [serializable], function () {
  return 0;
}), _class2$1)) || _class$2);
function getElementTraits(elementType) {
  return BuiltinElementTypeTraits[elementType];
}
function getStorageConstructor(unit) {
  switch (unit) {
    case StorageUnit.Uint8:
      return Uint8Array;
    case StorageUnit.Uint16:
      return Uint16Array;
    case StorageUnit.Uint32:
      return Uint32Array;
    case StorageUnit.Int8:
      return Int8Array;
    case StorageUnit.Int16:
      return Int16Array;
    case StorageUnit.Int32:
      return Int32Array;
    case StorageUnit.Float32:
      return Float32Array;
    case StorageUnit.Float64:
      return Float64Array;
  }
}
var BuiltinElementTypeTraits = (_BuiltinElementTypeTr = {}, _BuiltinElementTypeTr[ElementType.Scalar] = {
  requiredUnits: 1,
  compress: function compress(storage, index, value) {
    storage[index] = value;
  },
  decompress: function decompress(storage, index) {
    return storage[index];
  }
}, _BuiltinElementTypeTr[ElementType.Vec2] = {
  requiredUnits: 2,
  compress: function compress(storage, index, value) {
    storage[index * 2] = value.x;
    storage[index * 2 + 1] = value.y;
  },
  decompress: function decompress(storage, index) {
    return new Vec3(storage[index * 2], storage[index * 2 + 1]);
  }
}, _BuiltinElementTypeTr[ElementType.Vec3] = {
  requiredUnits: 3,
  compress: function compress(storage, index, value) {
    storage[index * 3] = value.x;
    storage[index * 3 + 1] = value.y;
    storage[index * 3 + 2] = value.z;
  },
  decompress: function decompress(storage, index) {
    return new Vec3(storage[index * 3], storage[index * 3 + 1], storage[index * 3 + 2]);
  }
}, _BuiltinElementTypeTr[ElementType.Vec4] = {
  requiredUnits: 4,
  compress: function compress(storage, index, value) {
    storage[index * 4] = value.x;
    storage[index * 4 + 1] = value.y;
    storage[index * 4 + 2] = value.z;
    storage[index * 4 + 3] = value.w;
  },
  decompress: function decompress(storage, index) {
    return new Vec4(storage[index * 4], storage[index * 4 + 1], storage[index * 4 + 2], storage[index * 4 + 3]);
  }
}, _BuiltinElementTypeTr[ElementType.Quat] = {
  requiredUnits: 4,
  compress: function compress(storage, index, value) {
    storage[index * 4] = value.x;
    storage[index * 4 + 1] = value.y;
    storage[index * 4 + 2] = value.z;
    storage[index * 4 + 3] = value.w;
  },
  decompress: function decompress(storage, index) {
    return new Quat(storage[index * 4], storage[index * 4 + 1], storage[index * 4 + 2], storage[index * 4 + 3]);
  }
}, _BuiltinElementTypeTr[ElementType.Mat4] = {
  requiredUnits: 16,
  compress: function compress(storage, index, value) {
    Mat4.toArray(storage, value, index * 16);
  },
  decompress: function decompress(storage, index) {
    return Mat4.fromArray(new Mat4(), storage, index * 16);
  }
}, _BuiltinElementTypeTr);

var serializeTag = Symbol('[[Serialize]]');
var deserializeTag = Symbol('[[Deserialize]]');

legacyCC._decorator = _decorator;

function constant() {
  return 0;
}
function linear(k) {
  return k;
}
function quadIn(k) {
  return k * k;
}
function quadOut(k) {
  return k * (2 - k);
}
function quadInOut(k) {
  k *= 2;
  if (k < 1) {
    return 0.5 * k * k;
  }
  return -0.5 * (--k * (k - 2) - 1);
}
function cubicIn(k) {
  return k * k * k;
}
function cubicOut(k) {
  return --k * k * k + 1;
}
function cubicInOut(k) {
  k *= 2;
  if (k < 1) {
    return 0.5 * k * k * k;
  }
  return 0.5 * ((k -= 2) * k * k + 2);
}
function quartIn(k) {
  return k * k * k * k;
}
function quartOut(k) {
  return 1 - --k * k * k * k;
}
function quartInOut(k) {
  k *= 2;
  if (k < 1) {
    return 0.5 * k * k * k * k;
  }
  return -0.5 * ((k -= 2) * k * k * k - 2);
}
function quintIn(k) {
  return k * k * k * k * k;
}
function quintOut(k) {
  return --k * k * k * k * k + 1;
}
function quintInOut(k) {
  k *= 2;
  if (k < 1) {
    return 0.5 * k * k * k * k * k;
  }
  return 0.5 * ((k -= 2) * k * k * k * k + 2);
}
function sineIn(k) {
  if (k === 1) {
    return 1;
  }
  return 1 - Math.cos(k * Math.PI / 2);
}
function sineOut(k) {
  return Math.sin(k * Math.PI / 2);
}
function sineInOut(k) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}
function expoIn(k) {
  return k === 0 ? 0 : Math.pow(1024, k - 1);
}
function expoOut(k) {
  return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
}
function expoInOut(k) {
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  k *= 2;
  if (k < 1) {
    return 0.5 * Math.pow(1024, k - 1);
  }
  return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
}
function circIn(k) {
  return 1 - Math.sqrt(1 - k * k);
}
function circOut(k) {
  return Math.sqrt(1 - --k * k);
}
function circInOut(k) {
  k *= 2;
  if (k < 1) {
    return -0.5 * (Math.sqrt(1 - k * k) - 1);
  }
  return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
}
function elasticIn(k) {
  var s;
  var a = 0.1;
  var p = 0.4;
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = p * Math.asin(1 / a) / (2 * Math.PI);
  }
  return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
}
function elasticOut(k) {
  var s;
  var a = 0.1;
  var p = 0.4;
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = p * Math.asin(1 / a) / (2 * Math.PI);
  }
  return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1;
}
function elasticInOut(k) {
  var s;
  var a = 0.1;
  var p = 0.4;
  if (k === 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = p * Math.asin(1 / a) / (2 * Math.PI);
  }
  k *= 2;
  if (k < 1) {
    return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
  }
  return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
}
function backIn(k) {
  if (k === 1) {
    return 1;
  }
  var s = 1.70158;
  return k * k * ((s + 1) * k - s);
}
function backOut(k) {
  if (k === 0) {
    return 0;
  }
  var s = 1.70158;
  return --k * k * ((s + 1) * k + s) + 1;
}
function backInOut(k) {
  var s = 1.70158 * 1.525;
  k *= 2;
  if (k < 1) {
    return 0.5 * (k * k * ((s + 1) * k - s));
  }
  return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
}
function bounceIn(k) {
  return 1 - bounceOut(1 - k);
}
function bounceOut(k) {
  if (k < 1 / 2.75) {
    return 7.5625 * k * k;
  } else if (k < 2 / 2.75) {
    return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
  } else if (k < 2.5 / 2.75) {
    return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
  } else {
    return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
  }
}
function bounceInOut(k) {
  if (k < 0.5) {
    return bounceIn(k * 2) * 0.5;
  }
  return bounceOut(k * 2 - 1) * 0.5 + 0.5;
}
function smooth(k) {
  if (k <= 0) {
    return 0;
  }
  if (k >= 1) {
    return 1;
  }
  return k * k * (3 - 2 * k);
}
function fade(k) {
  if (k <= 0) {
    return 0;
  }
  if (k >= 1) {
    return 1;
  }
  return k * k * k * (k * (k * 6 - 15) + 10);
}
var quadOutIn = _makeOutIn(quadIn, quadOut);
var cubicOutIn = _makeOutIn(cubicIn, cubicOut);
var quartOutIn = _makeOutIn(quartIn, quartOut);
var quintOutIn = _makeOutIn(quintIn, quintOut);
var sineOutIn = _makeOutIn(sineIn, sineOut);
var expoOutIn = _makeOutIn(expoIn, expoOut);
var circOutIn = _makeOutIn(circIn, circOut);
var elasticOutIn = _makeOutIn(elasticIn, elasticOut);
var backOutIn = _makeOutIn(backIn, backOut);
var bounceOutIn = _makeOutIn(bounceIn, bounceOut);
function _makeOutIn(fnIn, fnOut) {
  return function (k) {
    if (k < 0.5) {
      return fnOut(k * 2) / 2;
    }
    return fnIn(2 * k - 1) / 2 + 0.5;
  };
}

var easing = /*#__PURE__*/Object.freeze({
    __proto__: null,
    backIn: backIn,
    backInOut: backInOut,
    backOut: backOut,
    backOutIn: backOutIn,
    bounceIn: bounceIn,
    bounceInOut: bounceInOut,
    bounceOut: bounceOut,
    bounceOutIn: bounceOutIn,
    circIn: circIn,
    circInOut: circInOut,
    circOut: circOut,
    circOutIn: circOutIn,
    constant: constant,
    cubicIn: cubicIn,
    cubicInOut: cubicInOut,
    cubicOut: cubicOut,
    cubicOutIn: cubicOutIn,
    elasticIn: elasticIn,
    elasticInOut: elasticInOut,
    elasticOut: elasticOut,
    elasticOutIn: elasticOutIn,
    expoIn: expoIn,
    expoInOut: expoInOut,
    expoOut: expoOut,
    expoOutIn: expoOutIn,
    fade: fade,
    linear: linear,
    quadIn: quadIn,
    quadInOut: quadInOut,
    quadOut: quadOut,
    quadOutIn: quadOutIn,
    quartIn: quartIn,
    quartInOut: quartInOut,
    quartOut: quartOut,
    quartOutIn: quartOutIn,
    quintIn: quintIn,
    quintInOut: quintInOut,
    quintOut: quintOut,
    quintOutIn: quintOutIn,
    sineIn: sineIn,
    sineInOut: sineInOut,
    sineOut: sineOut,
    sineOutIn: sineOutIn,
    smooth: smooth
});

var _easingMethodFnMap;
var EasingMethod;
(function (EasingMethod) {
  EasingMethod[EasingMethod["LINEAR"] = 0] = "LINEAR";
  EasingMethod[EasingMethod["CONSTANT"] = 1] = "CONSTANT";
  EasingMethod[EasingMethod["QUAD_IN"] = 2] = "QUAD_IN";
  EasingMethod[EasingMethod["QUAD_OUT"] = 3] = "QUAD_OUT";
  EasingMethod[EasingMethod["QUAD_IN_OUT"] = 4] = "QUAD_IN_OUT";
  EasingMethod[EasingMethod["QUAD_OUT_IN"] = 5] = "QUAD_OUT_IN";
  EasingMethod[EasingMethod["CUBIC_IN"] = 6] = "CUBIC_IN";
  EasingMethod[EasingMethod["CUBIC_OUT"] = 7] = "CUBIC_OUT";
  EasingMethod[EasingMethod["CUBIC_IN_OUT"] = 8] = "CUBIC_IN_OUT";
  EasingMethod[EasingMethod["CUBIC_OUT_IN"] = 9] = "CUBIC_OUT_IN";
  EasingMethod[EasingMethod["QUART_IN"] = 10] = "QUART_IN";
  EasingMethod[EasingMethod["QUART_OUT"] = 11] = "QUART_OUT";
  EasingMethod[EasingMethod["QUART_IN_OUT"] = 12] = "QUART_IN_OUT";
  EasingMethod[EasingMethod["QUART_OUT_IN"] = 13] = "QUART_OUT_IN";
  EasingMethod[EasingMethod["QUINT_IN"] = 14] = "QUINT_IN";
  EasingMethod[EasingMethod["QUINT_OUT"] = 15] = "QUINT_OUT";
  EasingMethod[EasingMethod["QUINT_IN_OUT"] = 16] = "QUINT_IN_OUT";
  EasingMethod[EasingMethod["QUINT_OUT_IN"] = 17] = "QUINT_OUT_IN";
  EasingMethod[EasingMethod["SINE_IN"] = 18] = "SINE_IN";
  EasingMethod[EasingMethod["SINE_OUT"] = 19] = "SINE_OUT";
  EasingMethod[EasingMethod["SINE_IN_OUT"] = 20] = "SINE_IN_OUT";
  EasingMethod[EasingMethod["SINE_OUT_IN"] = 21] = "SINE_OUT_IN";
  EasingMethod[EasingMethod["EXPO_IN"] = 22] = "EXPO_IN";
  EasingMethod[EasingMethod["EXPO_OUT"] = 23] = "EXPO_OUT";
  EasingMethod[EasingMethod["EXPO_IN_OUT"] = 24] = "EXPO_IN_OUT";
  EasingMethod[EasingMethod["EXPO_OUT_IN"] = 25] = "EXPO_OUT_IN";
  EasingMethod[EasingMethod["CIRC_IN"] = 26] = "CIRC_IN";
  EasingMethod[EasingMethod["CIRC_OUT"] = 27] = "CIRC_OUT";
  EasingMethod[EasingMethod["CIRC_IN_OUT"] = 28] = "CIRC_IN_OUT";
  EasingMethod[EasingMethod["CIRC_OUT_IN"] = 29] = "CIRC_OUT_IN";
  EasingMethod[EasingMethod["ELASTIC_IN"] = 30] = "ELASTIC_IN";
  EasingMethod[EasingMethod["ELASTIC_OUT"] = 31] = "ELASTIC_OUT";
  EasingMethod[EasingMethod["ELASTIC_IN_OUT"] = 32] = "ELASTIC_IN_OUT";
  EasingMethod[EasingMethod["ELASTIC_OUT_IN"] = 33] = "ELASTIC_OUT_IN";
  EasingMethod[EasingMethod["BACK_IN"] = 34] = "BACK_IN";
  EasingMethod[EasingMethod["BACK_OUT"] = 35] = "BACK_OUT";
  EasingMethod[EasingMethod["BACK_IN_OUT"] = 36] = "BACK_IN_OUT";
  EasingMethod[EasingMethod["BACK_OUT_IN"] = 37] = "BACK_OUT_IN";
  EasingMethod[EasingMethod["BOUNCE_IN"] = 38] = "BOUNCE_IN";
  EasingMethod[EasingMethod["BOUNCE_OUT"] = 39] = "BOUNCE_OUT";
  EasingMethod[EasingMethod["BOUNCE_IN_OUT"] = 40] = "BOUNCE_IN_OUT";
  EasingMethod[EasingMethod["BOUNCE_OUT_IN"] = 41] = "BOUNCE_OUT_IN";
  EasingMethod[EasingMethod["SMOOTH"] = 42] = "SMOOTH";
  EasingMethod[EasingMethod["FADE"] = 43] = "FADE";
})(EasingMethod || (EasingMethod = {}));
var easingMethodFnMap = (_easingMethodFnMap = {}, _easingMethodFnMap[EasingMethod.CONSTANT] = constant, _easingMethodFnMap[EasingMethod.LINEAR] = linear, _easingMethodFnMap[EasingMethod.QUAD_IN] = quadIn, _easingMethodFnMap[EasingMethod.QUAD_OUT] = quadOut, _easingMethodFnMap[EasingMethod.QUAD_IN_OUT] = quadInOut, _easingMethodFnMap[EasingMethod.QUAD_OUT_IN] = quadOutIn, _easingMethodFnMap[EasingMethod.CUBIC_IN] = cubicIn, _easingMethodFnMap[EasingMethod.CUBIC_OUT] = cubicOut, _easingMethodFnMap[EasingMethod.CUBIC_IN_OUT] = cubicInOut, _easingMethodFnMap[EasingMethod.CUBIC_OUT_IN] = cubicOutIn, _easingMethodFnMap[EasingMethod.QUART_IN] = quartIn, _easingMethodFnMap[EasingMethod.QUART_OUT] = quartOut, _easingMethodFnMap[EasingMethod.QUART_IN_OUT] = quartInOut, _easingMethodFnMap[EasingMethod.QUART_OUT_IN] = quartOutIn, _easingMethodFnMap[EasingMethod.QUINT_IN] = quintIn, _easingMethodFnMap[EasingMethod.QUINT_OUT] = quintOut, _easingMethodFnMap[EasingMethod.QUINT_IN_OUT] = quintInOut, _easingMethodFnMap[EasingMethod.QUINT_OUT_IN] = quintOutIn, _easingMethodFnMap[EasingMethod.SINE_IN] = sineIn, _easingMethodFnMap[EasingMethod.SINE_OUT] = sineOut, _easingMethodFnMap[EasingMethod.SINE_IN_OUT] = sineInOut, _easingMethodFnMap[EasingMethod.SINE_OUT_IN] = sineOutIn, _easingMethodFnMap[EasingMethod.EXPO_IN] = expoIn, _easingMethodFnMap[EasingMethod.EXPO_OUT] = expoOut, _easingMethodFnMap[EasingMethod.EXPO_IN_OUT] = expoInOut, _easingMethodFnMap[EasingMethod.EXPO_OUT_IN] = expoOutIn, _easingMethodFnMap[EasingMethod.CIRC_IN] = circIn, _easingMethodFnMap[EasingMethod.CIRC_OUT] = circOut, _easingMethodFnMap[EasingMethod.CIRC_IN_OUT] = circInOut, _easingMethodFnMap[EasingMethod.CIRC_OUT_IN] = circOutIn, _easingMethodFnMap[EasingMethod.ELASTIC_IN] = elasticIn, _easingMethodFnMap[EasingMethod.ELASTIC_OUT] = elasticOut, _easingMethodFnMap[EasingMethod.ELASTIC_IN_OUT] = elasticInOut, _easingMethodFnMap[EasingMethod.ELASTIC_OUT_IN] = elasticOutIn, _easingMethodFnMap[EasingMethod.BACK_IN] = backIn, _easingMethodFnMap[EasingMethod.BACK_OUT] = backOut, _easingMethodFnMap[EasingMethod.BACK_IN_OUT] = backInOut, _easingMethodFnMap[EasingMethod.BACK_OUT_IN] = backOutIn, _easingMethodFnMap[EasingMethod.BOUNCE_IN] = bounceIn, _easingMethodFnMap[EasingMethod.BOUNCE_OUT] = bounceOut, _easingMethodFnMap[EasingMethod.BOUNCE_IN_OUT] = bounceInOut, _easingMethodFnMap[EasingMethod.BOUNCE_OUT_IN] = bounceOutIn, _easingMethodFnMap[EasingMethod.SMOOTH] = smooth, _easingMethodFnMap[EasingMethod.FADE] = fade, _easingMethodFnMap);
function getEasingFn(easingMethod) {
  assertIsTrue(easingMethod in easingMethodFnMap);
  return easingMethodFnMap[easingMethod];
}

var _CCClass$fastDefine;
var REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_START = 0;
var REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_MASK = 0xFF << REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_START;
var REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_START = 8;
var REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_MASK = 0xFF << REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_START;
var REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_START = 16;
var REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_MASK = 0xFF << REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_START;
assertIsTrue(REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_START === REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_START + popCount(REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_MASK));
assertIsTrue(REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_START === REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_START + popCount(REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_MASK));
var REAL_KEYFRAME_VALUE_DEFAULT_FLAGS = RealInterpolationMode.LINEAR << REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_START | TangentWeightMode.NONE << REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_START | EasingMethod.LINEAR << REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_START;
var RealKeyframeValue = function (_EditorExtendable) {
  function RealKeyframeValue() {
    var _this;
    _this = _EditorExtendable.call(this) || this;
    _this.value = 0.0;
    _this.rightTangent = 0.0;
    _this.rightTangentWeight = 0.0;
    _this.leftTangent = 0.0;
    _this.leftTangentWeight = 0.0;
    _this._flags = REAL_KEYFRAME_VALUE_DEFAULT_FLAGS;
    return _this;
  }
  _inheritsLoose(RealKeyframeValue, _EditorExtendable);
  return _createClass(RealKeyframeValue, [{
    key: "interpolationMode",
    get: function get() {
      return (this._flags & REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_MASK) >> REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_START;
    },
    set: function set(value) {
      this._flags &= ~REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_MASK;
      this._flags |= value << REAL_KEYFRAME_VALUE_FLAGS_INTERPOLATION_MODE_START;
    }
  }, {
    key: "tangentWeightMode",
    get: function get() {
      return (this._flags & REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_MASK) >> REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_START;
    },
    set: function set(value) {
      this._flags &= ~REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_MASK;
      this._flags |= value << REAL_KEYFRAME_VALUE_FLAGS_TANGENT_WEIGHT_MODE_START;
    }
  }, {
    key: "easingMethod",
    get: function get() {
      return (this._flags & REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_MASK) >> REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_START;
    },
    set: function set(value) {
      this._flags &= ~REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_MASK;
      this._flags |= value << REAL_KEYFRAME_VALUE_FLAGS_EASING_METHOD_START;
    }
  }]);
}(EditorExtendable);
CCClass.fastDefine('cc.RealKeyframeValue', RealKeyframeValue, (_CCClass$fastDefine = {
  interpolationMode: RealInterpolationMode.LINEAR,
  tangentWeightMode: TangentWeightMode.NONE,
  value: 0.0,
  rightTangent: 0.0,
  rightTangentWeight: 0.0,
  leftTangent: 0.0,
  leftTangentWeight: 0.0,
  easingMethod: EasingMethod.LINEAR
}, _CCClass$fastDefine[editorExtrasTag] = undefined, _CCClass$fastDefine));
CCClass.Attr.setClassAttr(RealKeyframeValue, editorExtrasTag, 'editorOnly', true);
getOrCreateSerializationMetadata(RealKeyframeValue).uniquelyReferenced = true;
function createRealKeyframeValue(params) {
  var realKeyframeValue = new RealKeyframeValue();
  if (typeof params === 'number') {
    realKeyframeValue.value = params;
  } else {
    var interpolationMode = params.interpolationMode,
      tangentWeightMode = params.tangentWeightMode,
      value = params.value,
      rightTangent = params.rightTangent,
      rightTangentWeight = params.rightTangentWeight,
      leftTangent = params.leftTangent,
      leftTangentWeight = params.leftTangentWeight,
      easingMethod = params.easingMethod,
      editorExtras = params[editorExtrasTag];
    realKeyframeValue.value = value !== null && value !== void 0 ? value : realKeyframeValue.value;
    realKeyframeValue.rightTangent = rightTangent !== null && rightTangent !== void 0 ? rightTangent : realKeyframeValue.rightTangent;
    realKeyframeValue.rightTangentWeight = rightTangentWeight !== null && rightTangentWeight !== void 0 ? rightTangentWeight : realKeyframeValue.rightTangentWeight;
    realKeyframeValue.leftTangent = leftTangent !== null && leftTangent !== void 0 ? leftTangent : realKeyframeValue.leftTangent;
    realKeyframeValue.leftTangentWeight = leftTangentWeight !== null && leftTangentWeight !== void 0 ? leftTangentWeight : realKeyframeValue.leftTangentWeight;
    realKeyframeValue.interpolationMode = interpolationMode !== null && interpolationMode !== void 0 ? interpolationMode : realKeyframeValue.interpolationMode;
    realKeyframeValue.tangentWeightMode = tangentWeightMode !== null && tangentWeightMode !== void 0 ? tangentWeightMode : realKeyframeValue.tangentWeightMode;
    realKeyframeValue.easingMethod = easingMethod !== null && easingMethod !== void 0 ? easingMethod : realKeyframeValue.easingMethod;
    if (editorExtras) {
      realKeyframeValue[editorExtrasTag] = editorExtras;
    }
  }
  return realKeyframeValue;
}
var RealCurve = function (_KeyframeCurve) {
  function RealCurve() {
    var _this2;
    _this2 = _KeyframeCurve.call(this) || this;
    _this2.preExtrapolation = ExtrapolationMode.CLAMP;
    _this2.postExtrapolation = ExtrapolationMode.CLAMP;
    return _this2;
  }
  _inheritsLoose(RealCurve, _KeyframeCurve);
  var _proto = RealCurve.prototype;
  _proto.evaluate = function evaluate(time) {
    var times = this._times,
      values = this._values;
    var nFrames = times.length;
    if (nFrames === 0) {
      return 0.0;
    }
    var firstTime = times[0];
    var lastTime = times[nFrames - 1];
    if (time < firstTime) {
      var preExtrapolation = this.preExtrapolation;
      var _preValue = values[0];
      if (preExtrapolation === ExtrapolationMode.CLAMP || nFrames < 2) {
        return _preValue.value;
      }
      switch (preExtrapolation) {
        case ExtrapolationMode.LINEAR:
          return linearTrend(firstTime, values[0].value, times[1], values[1].value, time);
        case ExtrapolationMode.LOOP:
          time = wrapRepeat(time, firstTime, lastTime);
          break;
        case ExtrapolationMode.PING_PONG:
          time = wrapPingPong(time, firstTime, lastTime);
          break;
        default:
          return _preValue.value;
      }
    } else if (time > lastTime) {
      var postExtrapolation = this.postExtrapolation;
      var preFrame = values[nFrames - 1];
      if (postExtrapolation === ExtrapolationMode.CLAMP || nFrames < 2) {
        return preFrame.value;
      }
      switch (postExtrapolation) {
        case ExtrapolationMode.LINEAR:
          return linearTrend(lastTime, preFrame.value, times[nFrames - 2], values[nFrames - 2].value, time);
        case ExtrapolationMode.LOOP:
          time = wrapRepeat(time, firstTime, lastTime);
          break;
        case ExtrapolationMode.PING_PONG:
          time = wrapPingPong(time, firstTime, lastTime);
          break;
        default:
          return preFrame.value;
      }
    }
    var index = binarySearchEpsilon(times, time);
    if (index >= 0) {
      return values[index].value;
    }
    var iNext = ~index;
    {
      assertIsTrue(iNext !== 0 && iNext !== nFrames && nFrames > 1);
    }
    var iPre = iNext - 1;
    var preTime = times[iPre];
    var preValue = values[iPre];
    var nextTime = times[iNext];
    var nextValue = values[iNext];
    {
      assertIsTrue(nextTime > time && time > preTime);
    }
    var dt = nextTime - preTime;
    var ratio = (time - preTime) / dt;
    return evalBetweenTwoKeyFrames(preTime, preValue, nextTime, nextValue, ratio);
  };
  _proto.addKeyFrame = function addKeyFrame(time, value) {
    return _KeyframeCurve.prototype.addKeyFrame.call(this, time, createRealKeyframeValue(value));
  };
  _proto.assignSorted = function assignSorted(times, values) {
    if (values !== undefined) {
      assertIsTrue(Array.isArray(times));
      this.setKeyframes(times.slice(), values.map(function (value) {
        return createRealKeyframeValue(value);
      }));
    } else {
      var _keyframes = Array.from(times);
      this.setKeyframes(_keyframes.map(function (_ref) {
        var time = _ref[0];
        return time;
      }), _keyframes.map(function (_ref2) {
        var value = _ref2[1];
        return createRealKeyframeValue(value);
      }));
    }
  };
  _proto.isConstant = function isConstant(tolerance) {
    if (this._values.length <= 1) {
      return true;
    }
    var firstVal = this._values[0].value;
    return this._values.every(function (frame) {
      return approx(frame.value, firstVal, tolerance);
    });
  };
  _proto[serializeTag] = function (output, context) {
    if (!context.toCCON) {
      output.writeThis();
      return;
    }
    var times = this._times,
      keyframeValues = this._values;
    var nKeyframes = times.length;
    var dataSize = 0 + OVERFLOW_BYTES + OVERFLOW_BYTES + FRAME_COUNT_BYTES$1 + TIME_BYTES$1 * nKeyframes + REAL_KEY_FRAME_VALUE_MAX_SIZE * nKeyframes;
    var dataView = new DataView(new ArrayBuffer(dataSize));
    var currentOffset = 0;
    dataView.setUint8(currentOffset, this.preExtrapolation);
    currentOffset += OVERFLOW_BYTES;
    dataView.setUint8(currentOffset, this.postExtrapolation);
    currentOffset += OVERFLOW_BYTES;
    dataView.setUint32(currentOffset, nKeyframes, true);
    currentOffset += FRAME_COUNT_BYTES$1;
    times.forEach(function (time, index) {
      return dataView.setFloat32(currentOffset + TIME_BYTES$1 * index, time, true);
    });
    currentOffset += TIME_BYTES$1 * nKeyframes;
    for (var _iterator = _createForOfIteratorHelperLoose(keyframeValues), _step; !(_step = _iterator()).done;) {
      var keyframeValue = _step.value;
      currentOffset = saveRealKeyFrameValue(dataView, keyframeValue, currentOffset);
    }
    var bytes = new Uint8Array(dataView.buffer, 0, currentOffset);
    output.writeProperty('bytes', bytes);
    var keyframeValueEditorExtras = keyframeValues.map(function (keyframeValue) {
      return keyframeValue[editorExtrasTag];
    });
    if (keyframeValueEditorExtras.some(function (extras) {
      return extras !== undefined;
    })) {
      output.writeProperty("keyframeValueEditorExtras", keyframeValueEditorExtras);
    }
  };
  _proto[deserializeTag] = function (input, context) {
    if (!context.fromCCON) {
      input.readThis();
      return;
    }
    var bytes = input.readProperty('bytes');
    var dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var currentOffset = 0;
    this.preExtrapolation = dataView.getUint8(currentOffset);
    currentOffset += OVERFLOW_BYTES;
    this.postExtrapolation = dataView.getUint8(currentOffset);
    currentOffset += OVERFLOW_BYTES;
    var nKeyframes = dataView.getUint32(currentOffset, true);
    currentOffset += FRAME_COUNT_BYTES$1;
    var times = Array.from({
      length: nKeyframes
    }, function (_, index) {
      return dataView.getFloat32(currentOffset + TIME_BYTES$1 * index, true);
    });
    currentOffset += TIME_BYTES$1 * nKeyframes;
    var keyframeValues = new Array(nKeyframes);
    for (var iKeyFrame = 0; iKeyFrame < nKeyframes; ++iKeyFrame) {
      var keyframeValue = createRealKeyframeValue({});
      currentOffset = loadRealKeyFrameValue(dataView, keyframeValue, currentOffset);
      keyframeValues[iKeyFrame] = keyframeValue;
    }
    assertIsTrue(currentOffset === bytes.byteLength);
    var keyframeValueEditorExtras = input.readProperty("keyframeValueEditorExtras");
    if (keyframeValueEditorExtras) {
      assertIsTrue(keyframeValueEditorExtras.length === nKeyframes);
      keyframeValueEditorExtras.forEach(function (extras, index) {
        return keyframeValues[index][editorExtrasTag] = extras;
      });
    }
    this._times = times;
    this._values = keyframeValues;
  };
  return RealCurve;
}(KeyframeCurve);
CCClass.fastDefine('cc.RealCurve', RealCurve, {
  _times: [],
  _values: [],
  preExtrapolation: ExtrapolationMode.CLAMP,
  postExtrapolation: ExtrapolationMode.CLAMP
});
var FLAGS_EASING_METHOD_BITS_START = 8;
var FLAG_EASING_METHOD_MASK = 0xFF << FLAGS_EASING_METHOD_BITS_START;
var KeyframeValueFlagMask;
(function (KeyframeValueFlagMask) {
  KeyframeValueFlagMask[KeyframeValueFlagMask["VALUE"] = 1] = "VALUE";
  KeyframeValueFlagMask[KeyframeValueFlagMask["INTERPOLATION_MODE"] = 2] = "INTERPOLATION_MODE";
  KeyframeValueFlagMask[KeyframeValueFlagMask["TANGENT_WEIGHT_MODE"] = 4] = "TANGENT_WEIGHT_MODE";
  KeyframeValueFlagMask[KeyframeValueFlagMask["LEFT_TANGENT"] = 8] = "LEFT_TANGENT";
  KeyframeValueFlagMask[KeyframeValueFlagMask["LEFT_TANGENT_WEIGHT"] = 16] = "LEFT_TANGENT_WEIGHT";
  KeyframeValueFlagMask[KeyframeValueFlagMask["RIGHT_TANGENT"] = 32] = "RIGHT_TANGENT";
  KeyframeValueFlagMask[KeyframeValueFlagMask["RIGHT_TANGENT_WEIGHT"] = 64] = "RIGHT_TANGENT_WEIGHT";
})(KeyframeValueFlagMask || (KeyframeValueFlagMask = {}));
var OVERFLOW_BYTES = 1;
var FRAME_COUNT_BYTES$1 = 4;
var TIME_BYTES$1 = 4;
var KEY_FRAME_VALUE_FLAGS_BYTES = 4;
var VALUE_BYTES$1 = 4;
var INTERPOLATION_MODE_BYTES$1 = 1;
var TANGENT_WEIGHT_MODE_BYTES = 1;
var LEFT_TANGENT_BYTES = 4;
var LEFT_TANGENT_WEIGHT_BYTES = 4;
var RIGHT_TANGENT_BYTES = 4;
var RIGHT_TANGENT_WEIGHT_BYTES = 4;
var _createRealKeyframeVa = createRealKeyframeValue({}),
  DEFAULT_INTERPOLATION_MODE = _createRealKeyframeVa.interpolationMode,
  DEFAULT_TANGENT_WEIGHT_MODE = _createRealKeyframeVa.tangentWeightMode,
  DEFAULT_LEFT_TANGENT = _createRealKeyframeVa.leftTangent,
  DEFAULT_LEFT_TANGENT_WEIGHT = _createRealKeyframeVa.leftTangentWeight,
  DEFAULT_RIGHT_TANGENT = _createRealKeyframeVa.rightTangent,
  DEFAULT_RIGHT_TANGENT_WEIGHT = _createRealKeyframeVa.rightTangentWeight;
var REAL_KEY_FRAME_VALUE_MAX_SIZE = KEY_FRAME_VALUE_FLAGS_BYTES + VALUE_BYTES$1 + INTERPOLATION_MODE_BYTES$1 + TANGENT_WEIGHT_MODE_BYTES + LEFT_TANGENT_BYTES + LEFT_TANGENT_WEIGHT_BYTES + RIGHT_TANGENT_BYTES + RIGHT_TANGENT_WEIGHT_BYTES + 0;
function saveRealKeyFrameValue(dataView, keyframeValue, offset) {
  var flags = 0;
  var currentOffset = offset;
  var pFlags = currentOffset;
  currentOffset += KEY_FRAME_VALUE_FLAGS_BYTES;
  var value = keyframeValue.value,
    interpolationMode = keyframeValue.interpolationMode,
    tangentWeightMode = keyframeValue.tangentWeightMode,
    rightTangent = keyframeValue.rightTangent,
    rightTangentWeight = keyframeValue.rightTangentWeight,
    leftTangent = keyframeValue.leftTangent,
    leftTangentWeight = keyframeValue.leftTangentWeight,
    easingMethod = keyframeValue.easingMethod;
  dataView.setFloat32(currentOffset, value, true);
  currentOffset += VALUE_BYTES$1;
  if (interpolationMode !== DEFAULT_INTERPOLATION_MODE) {
    flags |= KeyframeValueFlagMask.INTERPOLATION_MODE;
    dataView.setUint8(currentOffset, interpolationMode);
    currentOffset += INTERPOLATION_MODE_BYTES$1;
  }
  if (tangentWeightMode !== DEFAULT_TANGENT_WEIGHT_MODE) {
    flags |= KeyframeValueFlagMask.TANGENT_WEIGHT_MODE;
    dataView.setUint8(currentOffset, tangentWeightMode);
    currentOffset += TANGENT_WEIGHT_MODE_BYTES;
  }
  if (leftTangent !== DEFAULT_LEFT_TANGENT) {
    flags |= KeyframeValueFlagMask.LEFT_TANGENT;
    dataView.setFloat32(currentOffset, leftTangent, true);
    currentOffset += LEFT_TANGENT_BYTES;
  }
  if (leftTangentWeight !== DEFAULT_LEFT_TANGENT_WEIGHT) {
    flags |= KeyframeValueFlagMask.LEFT_TANGENT_WEIGHT;
    dataView.setFloat32(currentOffset, leftTangentWeight, true);
    currentOffset += LEFT_TANGENT_WEIGHT_BYTES;
  }
  if (rightTangent !== DEFAULT_RIGHT_TANGENT) {
    flags |= KeyframeValueFlagMask.RIGHT_TANGENT;
    dataView.setFloat32(currentOffset, rightTangent, true);
    currentOffset += RIGHT_TANGENT_BYTES;
  }
  if (rightTangentWeight !== DEFAULT_RIGHT_TANGENT_WEIGHT) {
    flags |= KeyframeValueFlagMask.RIGHT_TANGENT_WEIGHT;
    dataView.setFloat32(currentOffset, rightTangentWeight, true);
    currentOffset += RIGHT_TANGENT_WEIGHT_BYTES;
  }
  flags |= easingMethod << FLAGS_EASING_METHOD_BITS_START;
  dataView.setUint32(pFlags, flags, true);
  return currentOffset;
}
function loadRealKeyFrameValue(dataView, keyframeValue, offset) {
  var currentOffset = offset;
  var flags = dataView.getUint32(currentOffset, true);
  currentOffset += KEY_FRAME_VALUE_FLAGS_BYTES;
  keyframeValue.value = dataView.getFloat32(currentOffset, true);
  currentOffset += VALUE_BYTES$1;
  if (flags & KeyframeValueFlagMask.INTERPOLATION_MODE) {
    keyframeValue.interpolationMode = dataView.getUint8(currentOffset);
    currentOffset += INTERPOLATION_MODE_BYTES$1;
  }
  if (flags & KeyframeValueFlagMask.TANGENT_WEIGHT_MODE) {
    keyframeValue.tangentWeightMode = dataView.getUint8(currentOffset);
    currentOffset += TANGENT_WEIGHT_MODE_BYTES;
  }
  if (flags & KeyframeValueFlagMask.LEFT_TANGENT) {
    keyframeValue.leftTangent = dataView.getFloat32(currentOffset, true);
    currentOffset += LEFT_TANGENT_BYTES;
  }
  if (flags & KeyframeValueFlagMask.LEFT_TANGENT_WEIGHT) {
    keyframeValue.leftTangentWeight = dataView.getFloat32(currentOffset, true);
    currentOffset += LEFT_TANGENT_WEIGHT_BYTES;
  }
  if (flags & KeyframeValueFlagMask.RIGHT_TANGENT) {
    keyframeValue.rightTangent = dataView.getFloat32(currentOffset, true);
    currentOffset += RIGHT_TANGENT_BYTES;
  }
  if (flags & KeyframeValueFlagMask.RIGHT_TANGENT_WEIGHT) {
    keyframeValue.rightTangentWeight = dataView.getFloat32(currentOffset, true);
    currentOffset += RIGHT_TANGENT_WEIGHT_BYTES;
  }
  var easingMethod = (flags & FLAG_EASING_METHOD_MASK) >> FLAGS_EASING_METHOD_BITS_START;
  keyframeValue.easingMethod = easingMethod;
  return currentOffset;
}
function wrapRepeat(time, prevTime, nextTime) {
  return prevTime + repeat(time - prevTime, nextTime - prevTime);
}
function wrapPingPong(time, prevTime, nextTime) {
  return prevTime + pingPong(time - prevTime, nextTime - prevTime);
}
function linearTrend(prevTime, prevValue, nextTime, nextValue, time) {
  var slope = (nextValue - prevValue) / (nextTime - prevTime);
  return prevValue + (time - prevTime) * slope;
}
function evalBetweenTwoKeyFrames(prevTime, prevValue, nextTime, nextValue, ratio) {
  var dt = nextTime - prevTime;
  switch (prevValue.interpolationMode) {
    default:
    case RealInterpolationMode.CONSTANT:
      return prevValue.value;
    case RealInterpolationMode.LINEAR:
      {
        var transformedRatio = prevValue.easingMethod === EasingMethod.LINEAR ? ratio : getEasingFn(prevValue.easingMethod)(ratio);
        return lerp(prevValue.value, nextValue.value, transformedRatio);
      }
    case RealInterpolationMode.CUBIC:
      {
        var ONE_THIRD = 1.0 / 3.0;
        var prevTangent = prevValue.rightTangent,
          prevTangentWeightSpecified = prevValue.rightTangentWeight;
        var prevTangentWeightEnabled = isRightTangentWeightEnabled(prevValue.tangentWeightMode);
        var nextTangent = nextValue.leftTangent,
          nextTangentWeightSpecified = nextValue.leftTangentWeight;
        var nextTangentWeightEnabled = isLeftTangentWeightEnabled(nextValue.tangentWeightMode);
        if (!prevTangentWeightEnabled && !nextTangentWeightEnabled) {
          var p1 = prevValue.value + ONE_THIRD * prevTangent * dt;
          var p2 = nextValue.value - ONE_THIRD * nextTangent * dt;
          return bezierInterpolate(prevValue.value, p1, p2, nextValue.value, ratio);
        } else {
          var prevTangentWeight = 0.0;
          if (prevTangentWeightEnabled) {
            prevTangentWeight = prevTangentWeightSpecified;
          } else {
            var x = dt;
            var _y = dt * prevTangent;
            prevTangentWeight = Math.sqrt(x * x + _y * _y) * ONE_THIRD;
          }
          var angle0 = Math.atan(prevTangent);
          var tx0 = Math.cos(angle0) * prevTangentWeight + prevTime;
          var ty0 = Math.sin(angle0) * prevTangentWeight + prevValue.value;
          var nextTangentWeight = 0.0;
          if (nextTangentWeightEnabled) {
            nextTangentWeight = nextTangentWeightSpecified;
          } else {
            var _x = dt;
            var _y2 = dt * nextTangent;
            nextTangentWeight = Math.sqrt(_x * _x + _y2 * _y2) * ONE_THIRD;
          }
          var angle1 = Math.atan(nextTangent);
          var tx1 = -Math.cos(angle1) * nextTangentWeight + nextTime;
          var ty1 = -Math.sin(angle1) * nextTangentWeight + nextValue.value;
          var dx = dt;
          var u0x = (tx0 - prevTime) / dx;
          var u1x = (tx1 - prevTime) / dx;
          var u0y = ty0;
          var u1y = ty1;
          var coeff0 = 0.0;
          var coeff1 = 3.0 * u0x;
          var coeff2 = 3.0 * u1x - 6.0 * u0x;
          var coeff3 = 3.0 * (u0x - u1x) + 1.0;
          var solutions = [0.0, 0.0, 0.0];
          var nSolutions = solveCubic(coeff0 - ratio, coeff1, coeff2, coeff3, solutions);
          var param = getParamFromCubicSolution(solutions, nSolutions, ratio);
          var y = bezierInterpolate(prevValue.value, u0y, u1y, nextValue.value, param);
          return y;
        }
      }
  }
}
function isLeftTangentWeightEnabled(tangentWeightMode) {
  return (tangentWeightMode & TangentWeightMode.LEFT) !== 0;
}
function isRightTangentWeightEnabled(tangentWeightMode) {
  return (tangentWeightMode & TangentWeightMode.RIGHT) !== 0;
}
function bezierInterpolate(p0, p1, p2, p3, t) {
  var u = 1 - t;
  var coeff0 = u * u * u;
  var coeff1 = 3 * u * u * t;
  var coeff2 = 3 * u * t * t;
  var coeff3 = t * t * t;
  return coeff0 * p0 + coeff1 * p1 + coeff2 * p2 + coeff3 * p3;
}
function getParamFromCubicSolution(solutions, solutionsCount, x) {
  var param = x;
  if (solutionsCount === 1) {
    param = solutions[0];
  } else {
    param = -Infinity;
    for (var iSolution = 0; iSolution < solutionsCount; ++iSolution) {
      var solution = solutions[iSolution];
      if (solution >= 0.0 && solution <= 1.0) {
        if (solution > param) {
          param = solution;
        }
      }
    }
    if (param === -Infinity) {
      param = 0.0;
    }
  }
  return param;
}

function bezier(C1, C2, C3, C4, t) {
  var t1 = 1 - t;
  return t1 * (t1 * (C1 + (C2 * 3 - C1) * t) + C3 * 3 * t * t) + C4 * t * t * t;
}
legacyCC.bezier = bezier;
var cos = Math.cos;
var acos = Math.acos;
var max = Math.max;
var pi = Math.PI;
var tau = 2 * pi;
var sqrt = Math.sqrt;
function crt(v) {
  if (v < 0) {
    return -Math.pow(-v, 1 / 3);
  } else {
    return Math.pow(v, 1 / 3);
  }
}
function cardano(curve, x) {
  var pa = x - 0;
  var pb = x - curve[0];
  var pc = x - curve[2];
  var pd = x - 1;
  var pa3 = pa * 3;
  var pb3 = pb * 3;
  var pc3 = pc * 3;
  var d = -pa + pb3 - pc3 + pd;
  var rd = 1 / d;
  var r3 = 1 / 3;
  var a = (pa3 - 6 * pb + pc3) * rd;
  var a3 = a * r3;
  var b = (-pa3 + pb3) * rd;
  var c = pa * rd;
  var p = (3 * b - a * a) * r3;
  var p3 = p * r3;
  var q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
  var q2 = q / 2;
  var discriminant = q2 * q2 + p3 * p3 * p3;
  var u1;
  var v1;
  var x1;
  var x2;
  var x3;
  if (discriminant < 0) {
    var mp3 = -p * r3;
    var mp33 = mp3 * mp3 * mp3;
    var r = sqrt(mp33);
    var t = -q / (2 * r);
    var cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
    var phi = acos(cosphi);
    var crtr = crt(r);
    var t1 = 2 * crtr;
    x1 = t1 * cos(phi * r3) - a3;
    x2 = t1 * cos((phi + tau) * r3) - a3;
    x3 = t1 * cos((phi + 2 * tau) * r3) - a3;
    if (x1 >= 0 && x1 <= 1) {
      if (x2 >= 0 && x2 <= 1) {
        if (x3 >= 0 && x3 <= 1) {
          return max(x1, x2, x3);
        } else {
          return max(x1, x2);
        }
      } else if (x3 >= 0 && x3 <= 1) {
        return max(x1, x3);
      } else {
        return x1;
      }
    } else if (x2 >= 0 && x2 <= 1) {
      if (x3 >= 0 && x3 <= 1) {
        return max(x2, x3);
      } else {
        return x2;
      }
    } else {
      return x3;
    }
  } else if (discriminant === 0) {
    u1 = q2 < 0 ? crt(-q2) : -crt(q2);
    x1 = 2 * u1 - a3;
    x2 = -u1 - a3;
    if (x1 >= 0 && x1 <= 1) {
      if (x2 >= 0 && x2 <= 1) {
        return max(x1, x2);
      } else {
        return x1;
      }
    } else {
      return x2;
    }
  } else {
    var sd = sqrt(discriminant);
    u1 = crt(-q2 + sd);
    v1 = crt(q2 + sd);
    x1 = u1 - v1 - a3;
    return x1;
  }
}
function bezierByTime(controlPoints, x) {
  var percent = cardano(controlPoints, x);
  var p1y = controlPoints[1];
  var p2y = controlPoints[3];
  return ((1 - percent) * (p1y + (p2y - p1y) * percent) * 3 + percent * percent) * percent;
}
legacyCC.bezierByTime = bezierByTime;

var _dec$1, _class$1, _class2, _initializer, _initializer2, _initializer3, _dec2, _class3, _class4, _initializer4, _initializer5;
var QuatInterpolationMode;
(function (QuatInterpolationMode) {
  QuatInterpolationMode[QuatInterpolationMode["SLERP"] = 0] = "SLERP";
  QuatInterpolationMode[QuatInterpolationMode["CONSTANT"] = 1] = "CONSTANT";
})(QuatInterpolationMode || (QuatInterpolationMode = {}));
var QuatKeyframeValue = (_dec$1 = ccclass('cc.QuatKeyframeValue'), _dec$1(_class$1 = uniquelyReferenced(_class$1 = (_class2 = function QuatKeyframeValue(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
    value = _ref.value,
    interpolationMode = _ref.interpolationMode,
    easingMethod = _ref.easingMethod;
  this.interpolationMode = _initializer && _initializer();
  this.value = _initializer2 && _initializer2();
  this.easingMethod = _initializer3 && _initializer3();
  this.value = value ? Quat.clone(value) : this.value;
  this.interpolationMode = interpolationMode !== null && interpolationMode !== void 0 ? interpolationMode : this.interpolationMode;
  this.easingMethod = easingMethod !== null && easingMethod !== void 0 ? easingMethod : this.easingMethod;
}, _initializer = applyDecoratedInitializer(_class2.prototype, "interpolationMode", [serializable], function () {
  return QuatInterpolationMode.SLERP;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "value", [serializable], function () {
  return Quat.clone(Quat.IDENTITY);
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "easingMethod", [serializable], function () {
  return EasingMethod.LINEAR;
}), _class2)) || _class$1) || _class$1);
function createQuatKeyframeValue(params) {
  return new QuatKeyframeValue(params);
}
var QuatCurve = (_dec2 = ccclass('cc.QuatCurve'), _dec2(_class3 = (_class4 = function (_KeyframeCurve) {
  function QuatCurve() {
    var _this;
    _this = _KeyframeCurve.call(this) || this;
    _this.preExtrapolation = _initializer4 && _initializer4();
    _this.postExtrapolation = _initializer5 && _initializer5();
    return _this;
  }
  _inheritsLoose(QuatCurve, _KeyframeCurve);
  var _proto = QuatCurve.prototype;
  _proto.evaluate = function evaluate(time, quat) {
    var _quat;
    (_quat = quat) !== null && _quat !== void 0 ? _quat : quat = new Quat();
    var times = this._times,
      values = this._values,
      postExtrapolation = this.postExtrapolation,
      preExtrapolation = this.preExtrapolation;
    var nFrames = times.length;
    if (nFrames === 0) {
      return quat;
    }
    var firstTime = times[0];
    var lastTime = times[nFrames - 1];
    if (time < firstTime) {
      var _preValue = values[0];
      switch (preExtrapolation) {
        case ExtrapolationMode.LOOP:
          time = firstTime + repeat(time - firstTime, lastTime - firstTime);
          break;
        case ExtrapolationMode.PING_PONG:
          time = firstTime + pingPong(time - firstTime, lastTime - firstTime);
          break;
        case ExtrapolationMode.CLAMP:
        default:
          return Quat.copy(quat, _preValue.value);
      }
    } else if (time > lastTime) {
      var _preValue2 = values[nFrames - 1];
      switch (postExtrapolation) {
        case ExtrapolationMode.LOOP:
          time = firstTime + repeat(time - firstTime, lastTime - firstTime);
          break;
        case ExtrapolationMode.PING_PONG:
          time = firstTime + pingPong(time - firstTime, lastTime - firstTime);
          break;
        case ExtrapolationMode.CLAMP:
        default:
          return Quat.copy(quat, _preValue2.value);
      }
    }
    var index = binarySearchEpsilon(times, time);
    if (index >= 0) {
      return Quat.copy(quat, values[index].value);
    }
    var iNext = ~index;
    assertIsTrue(iNext !== 0 && iNext !== nFrames && nFrames > 1);
    var iPre = iNext - 1;
    var preTime = times[iPre];
    var preValue = values[iPre];
    var nextTime = times[iNext];
    var nextValue = values[iNext];
    assertIsTrue(nextTime > time && time > preTime);
    var dt = nextTime - preTime;
    var ratio = (time - preTime) / dt;
    switch (preValue.interpolationMode) {
      default:
      case QuatInterpolationMode.CONSTANT:
        return Quat.copy(quat, preValue.value);
      case QuatInterpolationMode.SLERP:
        {
          var easingMethod = preValue.easingMethod;
          var transformedRatio = easingMethod === EasingMethod.LINEAR ? ratio : Array.isArray(easingMethod) ? bezierByTime(easingMethod, ratio) : getEasingFn(easingMethod)(ratio);
          return Quat.slerp(quat, preValue.value, nextValue.value, transformedRatio);
        }
    }
  };
  _proto.addKeyFrame = function addKeyFrame(time, value) {
    var keyframeValue = new QuatKeyframeValue(value);
    return _KeyframeCurve.prototype.addKeyFrame.call(this, time, keyframeValue);
  };
  _proto.assignSorted = function assignSorted(times, values) {
    if (values !== undefined) {
      assertIsTrue(Array.isArray(times));
      this.setKeyframes(times.slice(), values.map(function (value) {
        return createQuatKeyframeValue(value);
      }));
    } else {
      var _keyframes = Array.from(times);
      this.setKeyframes(_keyframes.map(function (_ref2) {
        var time = _ref2[0];
        return time;
      }), _keyframes.map(function (_ref3) {
        var value = _ref3[1];
        return createQuatKeyframeValue(value);
      }));
    }
  };
  _proto[serializeTag] = function (output, context) {
    if (!context.toCCON) {
      output.writeThis();
      return;
    }
    var times = this._times,
      keyframeValues = this._values;
    var interpolationModeRepeated = true;
    keyframeValues.forEach(function (keyframeValue, _index, _ref4) {
      var firstKeyframeValue = _ref4[0];
      if (interpolationModeRepeated && keyframeValue.interpolationMode !== firstKeyframeValue.interpolationMode) {
        interpolationModeRepeated = false;
      }
    });
    var nKeyframes = times.length;
    var nFrames = nKeyframes;
    var interpolationModesSize = INTERPOLATION_MODE_BYTES * (interpolationModeRepeated ? 1 : nFrames);
    var easingMethodsSize = keyframeValues.reduce(function (result, _ref5) {
      var easingMethod = _ref5.easingMethod;
      return result += Array.isArray(easingMethod) ? EASING_METHOD_BYTES + EASING_METHOD_BEZIER_COMPONENT_BYTES * 4 : EASING_METHOD_BYTES;
    }, 0);
    var dataSize = 0;
    dataSize += FLAGS_BYTES + FRAME_COUNT_BYTES + TIME_BYTES * nFrames + VALUE_BYTES * 4 * nFrames + easingMethodsSize + interpolationModesSize + 0;
    var dataView = new DataView(new ArrayBuffer(dataSize));
    var P = 0;
    var flags = 0;
    if (interpolationModeRepeated) {
      flags |= QuatCurveKeyframeValueFlagMask.INTERPOLATION_MODE;
    }
    dataView.setUint32(P, flags, true);
    P += FLAGS_BYTES;
    dataView.setUint32(P, nFrames, true);
    P += FRAME_COUNT_BYTES;
    times.forEach(function (time, index) {
      return dataView.setFloat32(P + TIME_BYTES * index, time, true);
    });
    P += TIME_BYTES * nFrames;
    keyframeValues.forEach(function (_ref6, index) {
      var _ref6$value = _ref6.value,
        x = _ref6$value.x,
        y = _ref6$value.y,
        z = _ref6$value.z,
        w = _ref6$value.w;
      var pQuat = P + VALUE_BYTES * 4 * index;
      dataView.setFloat32(pQuat + VALUE_BYTES * 0, x, true);
      dataView.setFloat32(pQuat + VALUE_BYTES * 1, y, true);
      dataView.setFloat32(pQuat + VALUE_BYTES * 2, z, true);
      dataView.setFloat32(pQuat + VALUE_BYTES * 3, w, true);
    });
    P += VALUE_BYTES * 4 * nFrames;
    keyframeValues.forEach(function (_ref7, index) {
      var easingMethod = _ref7.easingMethod;
      if (!Array.isArray(easingMethod)) {
        dataView.setUint8(P, easingMethod);
        ++P;
      } else {
        dataView.setUint8(P, EASING_METHOD_BEZIER_TAG);
        ++P;
        dataView.setFloat32(P + EASING_METHOD_BEZIER_COMPONENT_BYTES * 0, easingMethod[0], true);
        dataView.setFloat32(P + EASING_METHOD_BEZIER_COMPONENT_BYTES * 1, easingMethod[1], true);
        dataView.setFloat32(P + EASING_METHOD_BEZIER_COMPONENT_BYTES * 2, easingMethod[2], true);
        dataView.setFloat32(P + EASING_METHOD_BEZIER_COMPONENT_BYTES * 3, easingMethod[3], true);
        P += EASING_METHOD_BEZIER_COMPONENT_BYTES * 4;
      }
    });
    var INTERPOLATION_MODES_START = P;
    P += interpolationModesSize;
    var pInterpolationMode = INTERPOLATION_MODES_START;
    keyframeValues.forEach(function (_ref8) {
      var interpolationMode = _ref8.interpolationMode;
      dataView.setUint8(pInterpolationMode, interpolationMode);
      if (!interpolationModeRepeated) {
        pInterpolationMode += INTERPOLATION_MODE_BYTES;
      }
    });
    var bytes = new Uint8Array(dataView.buffer);
    output.writeProperty('bytes', bytes);
  };
  _proto[deserializeTag] = function (input, context) {
    if (!context.fromCCON) {
      input.readThis();
      return;
    }
    var bytes = input.readProperty('bytes');
    var dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var P = 0;
    var flags = dataView.getUint32(P, true);
    P += FLAGS_BYTES;
    var interpolationModeRepeated = flags & QuatCurveKeyframeValueFlagMask.INTERPOLATION_MODE;
    var nFrames = dataView.getUint32(P, true);
    P += FRAME_COUNT_BYTES;
    var times = Array.from({
      length: nFrames
    }, function (_, index) {
      return dataView.getFloat32(P + TIME_BYTES * index, true);
    });
    P += TIME_BYTES * nFrames;
    var P_VALUES = P;
    P += VALUE_BYTES * 4 * nFrames;
    var keyframeValues = Array.from({
      length: nFrames
    }, function (_, index) {
      var pQuat = P_VALUES + VALUE_BYTES * 4 * index;
      var x = dataView.getFloat32(pQuat + VALUE_BYTES * 0, true);
      var y = dataView.getFloat32(pQuat + VALUE_BYTES * 1, true);
      var z = dataView.getFloat32(pQuat + VALUE_BYTES * 2, true);
      var w = dataView.getFloat32(pQuat + VALUE_BYTES * 3, true);
      var easingMethod = dataView.getUint8(P);
      ++P;
      var keyframeValue = createQuatKeyframeValue({
        value: {
          x: x,
          y: y,
          z: z,
          w: w
        }
      });
      if (easingMethod !== EASING_METHOD_BEZIER_TAG) {
        keyframeValue.easingMethod = easingMethod;
      } else {
        keyframeValue.easingMethod = [dataView.getFloat32(P + EASING_METHOD_BEZIER_COMPONENT_BYTES * 0, true), dataView.getFloat32(P + EASING_METHOD_BEZIER_COMPONENT_BYTES * 1, true), dataView.getFloat32(P + EASING_METHOD_BEZIER_COMPONENT_BYTES * 2, true), dataView.getFloat32(P + EASING_METHOD_BEZIER_COMPONENT_BYTES * 3, true)];
        P += EASING_METHOD_BEZIER_COMPONENT_BYTES * 4;
      }
      return keyframeValue;
    });
    if (interpolationModeRepeated) {
      var interpolationMode = dataView.getUint8(P);
      ++P;
      for (var iKeyframe = 0; iKeyframe < nFrames; ++iKeyframe) {
        keyframeValues[iKeyframe].interpolationMode = interpolationMode;
      }
    } else {
      for (var _iKeyframe = 0; _iKeyframe < nFrames; ++_iKeyframe) {
        var _interpolationMode = dataView.getUint8(P + _iKeyframe);
        keyframeValues[_iKeyframe].interpolationMode = _interpolationMode;
      }
      P += nFrames;
    }
    this._times = times;
    this._values = keyframeValues;
  };
  return QuatCurve;
}(KeyframeCurve), _initializer4 = applyDecoratedInitializer(_class4.prototype, "preExtrapolation", [serializable], function () {
  return ExtrapolationMode.CLAMP;
}), _initializer5 = applyDecoratedInitializer(_class4.prototype, "postExtrapolation", [serializable], function () {
  return ExtrapolationMode.CLAMP;
}), _class4)) || _class3);
var QuatCurveKeyframeValueFlagMask;
(function (QuatCurveKeyframeValueFlagMask) {
  QuatCurveKeyframeValueFlagMask[QuatCurveKeyframeValueFlagMask["INTERPOLATION_MODE"] = 1] = "INTERPOLATION_MODE";
})(QuatCurveKeyframeValueFlagMask || (QuatCurveKeyframeValueFlagMask = {}));
var FLAGS_BYTES = 1;
var FRAME_COUNT_BYTES = 4;
var TIME_BYTES = 4;
var VALUE_BYTES = 4;
var INTERPOLATION_MODE_BYTES = 1;
var EASING_METHOD_BYTES = 1;
var EASING_METHOD_BEZIER_TAG = 255;
var EASING_METHOD_BEZIER_COMPONENT_BYTES = 4;

var _dec, _class;
var ObjectCurve = (_dec = ccclass('cc.ObjectCurve'), _dec(_class = function (_KeyframeCurve) {
  function ObjectCurve() {
    return _KeyframeCurve.apply(this, arguments) || this;
  }
  _inheritsLoose(ObjectCurve, _KeyframeCurve);
  var _proto = ObjectCurve.prototype;
  _proto.evaluate = function evaluate(time) {
    var iSearch = this.searchKeyframe(time);
    if (iSearch >= 0) {
      return this._values[iSearch];
    }
    var iPrev = clamp(~iSearch - 1, 0, this._values.length - 1);
    return this._values[iPrev];
  };
  return ObjectCurve;
}(KeyframeCurve)) || _class);

var GradientMode;
(function (GradientMode) {
  GradientMode[GradientMode["Blend"] = 0] = "Blend";
  GradientMode[GradientMode["Fixed"] = 1] = "Fixed";
})(GradientMode || (GradientMode = {}));
Enum(GradientMode);
var ColorKey = function ColorKey() {
  this.color = Color.WHITE.clone();
  this.time = 0;
};
CCClass.fastDefine('cc.ColorKey', ColorKey, {
  color: Color.WHITE.clone(),
  time: 0
});
CCClass.Attr.setClassAttr(ColorKey, 'color', 'visible', true);
CCClass.Attr.setClassAttr(ColorKey, 'time', 'visible', true);
var AlphaKey = function AlphaKey() {
  this.alpha = 1;
  this.time = 0;
};
CCClass.fastDefine('cc.AlphaKey', AlphaKey, {
  alpha: 1,
  time: 0
});
CCClass.Attr.setClassAttr(AlphaKey, 'alpha', 'visible', true);
CCClass.Attr.setClassAttr(AlphaKey, 'time', 'visible', true);
var Gradient = function () {
  function Gradient() {
    this.colorKeys = [];
    this.alphaKeys = [];
    this.mode = GradientMode.Blend;
  }
  var _proto = Gradient.prototype;
  _proto.setKeys = function setKeys(colorKeys, alphaKeys) {
    this.colorKeys = colorKeys;
    this.alphaKeys = alphaKeys;
  };
  _proto.sortKeys = function sortKeys() {
    if (this.colorKeys.length > 1) {
      this.colorKeys.sort(function (a, b) {
        return a.time - b.time;
      });
    }
    if (this.alphaKeys.length > 1) {
      this.alphaKeys.sort(function (a, b) {
        return a.time - b.time;
      });
    }
  };
  _proto.evaluate = function evaluate(time) {
    return this.evaluateFast(new Color(), time);
  };
  _proto.evaluateFast = function evaluateFast(out, time) {
    this.getRGB(out, time);
    out.a = this.getAlpha(time);
    return out;
  };
  _proto.randomColor = function randomColor() {
    return this.getRandomColor(new Color());
  };
  _proto.getRandomColor = function getRandomColor(out) {
    var c = this.colorKeys[Math.trunc(random() * this.colorKeys.length)];
    var a = this.alphaKeys[Math.trunc(random() * this.alphaKeys.length)];
    out.set(c.color);
    out.a = a.alpha;
    return out;
  };
  _proto.getRGB = function getRGB(out, time) {
    var colorKeys = this.colorKeys;
    var length = colorKeys.length;
    if (length > 1) {
      time = repeat(time, 1.0 + EPSILON);
      for (var i = 1; i < length; ++i) {
        var preTime = colorKeys[i - 1].time;
        var curTime = colorKeys[i].time;
        if (time >= preTime && time < curTime) {
          if (this.mode === GradientMode.Fixed) {
            Color.copy(out, colorKeys[i].color);
            return out;
          }
          var factor = (time - preTime) / (curTime - preTime);
          Color.lerp(out, colorKeys[i - 1].color, colorKeys[i].color, factor);
          return out;
        }
      }
      var lastIndex = length - 1;
      if (approx(time, colorKeys[lastIndex].time, EPSILON)) {
        Color.copy(out, colorKeys[lastIndex].color);
      } else if (time < colorKeys[0].time) {
        Color.lerp(out, Color.BLACK, colorKeys[0].color, time / colorKeys[0].time);
      } else if (time > colorKeys[lastIndex].time) {
        Color.lerp(out, colorKeys[lastIndex].color, Color.BLACK, (time - colorKeys[lastIndex].time) / (1 - colorKeys[lastIndex].time));
      }
    } else if (length === 1) {
      Color.copy(out, colorKeys[0].color);
    } else {
      Color.copy(out, Color.WHITE);
    }
    return out;
  };
  _proto.getAlpha = function getAlpha(time) {
    var basicAlpha = 0;
    var alphaKeys = this.alphaKeys;
    var length = alphaKeys.length;
    if (length > 1) {
      time = repeat(time, 1.0 + EPSILON);
      for (var i = 1; i < length; ++i) {
        var preTime = alphaKeys[i - 1].time;
        var curTime = alphaKeys[i].time;
        if (time >= preTime && time < curTime) {
          if (this.mode === GradientMode.Fixed) {
            return alphaKeys[i].alpha;
          }
          var factor = (time - preTime) / (curTime - preTime);
          return lerp(alphaKeys[i - 1].alpha, alphaKeys[i].alpha, factor);
        }
      }
      var lastIndex = length - 1;
      if (approx(time, alphaKeys[lastIndex].time, EPSILON)) {
        return alphaKeys[lastIndex].alpha;
      } else if (time < alphaKeys[0].time) {
        return lerp(basicAlpha, alphaKeys[0].alpha, time / alphaKeys[0].time);
      } else if (time > alphaKeys[lastIndex].time) {
        return lerp(alphaKeys[lastIndex].alpha, basicAlpha, (time - alphaKeys[lastIndex].time) / (1 - alphaKeys[lastIndex].time));
      }
      return 255;
    } else if (length === 1) {
      return alphaKeys[0].alpha;
    } else {
      return 255;
    }
  };
  return Gradient;
}();
Gradient.Mode = GradientMode;
CCClass.fastDefine('cc.Gradient', Gradient, {
  colorKeys: [],
  alphaKeys: [],
  mode: GradientMode.Blend
});
CCClass.Attr.setClassAttr(Gradient, 'colorKeys', 'visible', true);
CCClass.Attr.setClassAttr(Gradient, 'alphaKeys', 'visible', true);
CCClass.Attr.setClassAttr(Gradient, 'mode', 'visible', true);

var LOOK_FORWARD = 3;
var Keyframe = function Keyframe() {
  this.time = 0;
  this.value = 0;
  this.inTangent = 0;
  this.outTangent = 0;
};
CCClass.fastDefine('cc.Keyframe', Keyframe, {
  time: 0,
  value: 0,
  inTangent: 0,
  outTangent: 0
});
var OptimizedKey = function () {
  function OptimizedKey() {
    this.index = void 0;
    this.time = void 0;
    this.endTime = void 0;
    this.coefficient = void 0;
    this.index = -1;
    this.time = 0;
    this.endTime = 0;
    this.coefficient = new Float32Array(4);
  }
  var _proto = OptimizedKey.prototype;
  _proto.evaluate = function evaluate(T) {
    var t = T - this.time;
    return evalOptCurve(t, this.coefficient);
  };
  return OptimizedKey;
}();
function evalOptCurve(t, coefs) {
  return t * (t * (t * coefs[0] + coefs[1]) + coefs[2]) + coefs[3];
}
var AnimationCurve = function () {
  function AnimationCurve(keyFrames) {
    if (keyFrames === void 0) {
      keyFrames = null;
    }
    this._curve = void 0;
    this.cachedKey = void 0;
    if (keyFrames instanceof RealCurve) {
      this._curve = keyFrames;
    } else {
      var curve = new RealCurve();
      this._curve = curve;
      curve.preExtrapolation = ExtrapolationMode.LOOP;
      curve.postExtrapolation = ExtrapolationMode.CLAMP;
      if (!keyFrames) {
        curve.assignSorted([[0.0, {
          interpolationMode: RealInterpolationMode.CUBIC,
          value: 1.0
        }], [1.0, {
          interpolationMode: RealInterpolationMode.CUBIC,
          value: 1.0
        }]]);
      } else {
        curve.assignSorted(keyFrames.map(function (legacyKeyframe) {
          return [legacyKeyframe.time, {
            interpolationMode: RealInterpolationMode.CUBIC,
            value: legacyKeyframe.value,
            leftTangent: legacyKeyframe.inTangent,
            rightTangent: legacyKeyframe.outTangent
          }];
        }));
      }
    }
    this.cachedKey = new OptimizedKey();
  }
  var _proto2 = AnimationCurve.prototype;
  _proto2.addKey = function addKey(keyFrame) {
    if (!keyFrame) {
      this._curve.clear();
    } else {
      this._curve.addKeyFrame(keyFrame.time, {
        interpolationMode: RealInterpolationMode.CUBIC,
        value: keyFrame.value,
        leftTangent: keyFrame.inTangent,
        rightTangent: keyFrame.outTangent
      });
    }
  };
  _proto2.evaluate_slow = function evaluate_slow(time) {
    return this._curve.evaluate(time);
  };
  _proto2.evaluate = function evaluate(time) {
    var cachedKey = this.cachedKey,
      curve = this._curve;
    var nKeyframes = curve.keyFramesCount;
    var lastKeyframeIndex = nKeyframes - 1;
    var wrappedTime = time;
    var extrapolationMode = time < 0 ? curve.preExtrapolation : curve.postExtrapolation;
    var startTime = curve.getKeyframeTime(0);
    var endTime = curve.getKeyframeTime(lastKeyframeIndex);
    switch (extrapolationMode) {
      case ExtrapolationMode.LOOP:
        wrappedTime = repeat(time - startTime, endTime - startTime) + startTime;
        break;
      case ExtrapolationMode.PING_PONG:
        wrappedTime = pingPong(time - startTime, endTime - startTime) + startTime;
        break;
      case ExtrapolationMode.CLAMP:
      default:
        wrappedTime = clamp(time, startTime, endTime);
        break;
    }
    if (wrappedTime >= cachedKey.time && wrappedTime < cachedKey.endTime) {
      return cachedKey.evaluate(wrappedTime);
    }
    var leftIndex = this.findIndex(cachedKey, wrappedTime);
    var rightIndex = Math.min(leftIndex + 1, lastKeyframeIndex);
    this.calcOptimizedKey(cachedKey, leftIndex, rightIndex);
    return cachedKey.evaluate(wrappedTime);
  };
  _proto2.calcOptimizedKey = function calcOptimizedKey(optKey, leftIndex, rightIndex) {
    var lhsTime = this._curve.getKeyframeTime(leftIndex);
    var rhsTime = this._curve.getKeyframeTime(rightIndex);
    var _this$_curve$getKeyfr = this._curve.getKeyframeValue(leftIndex),
      lhsValue = _this$_curve$getKeyfr.value,
      lhsOutTangent = _this$_curve$getKeyfr.leftTangent;
    var _this$_curve$getKeyfr2 = this._curve.getKeyframeValue(rightIndex),
      rhsValue = _this$_curve$getKeyfr2.value,
      rhsInTangent = _this$_curve$getKeyfr2.rightTangent;
    optKey.index = leftIndex;
    optKey.time = lhsTime;
    optKey.endTime = rhsTime;
    var dx = rhsTime - lhsTime;
    var dy = rhsValue - lhsValue;
    var length = 1 / (dx * dx);
    var d1 = lhsOutTangent * dx;
    var d2 = rhsInTangent * dx;
    optKey.coefficient[0] = (d1 + d2 - dy - dy) * length / dx;
    optKey.coefficient[1] = (dy + dy + dy - d1 - d1 - d2) * length;
    optKey.coefficient[2] = lhsOutTangent;
    optKey.coefficient[3] = lhsValue;
  };
  _proto2.findIndex = function findIndex(optKey, t) {
    var curve = this._curve;
    var nKeyframes = curve.keyFramesCount;
    var cachedIndex = optKey.index;
    if (cachedIndex !== -1) {
      var cachedTime = curve.getKeyframeTime(cachedIndex);
      if (t > cachedTime) {
        for (var i = 0; i < LOOK_FORWARD; i++) {
          var currIndex = cachedIndex + i;
          if (currIndex + 1 < nKeyframes && curve.getKeyframeTime(currIndex + 1) > t) {
            return currIndex;
          }
        }
      } else {
        for (var _i = 0; _i < LOOK_FORWARD; _i++) {
          var _currIndex = cachedIndex - _i;
          if (_currIndex >= 0 && curve.getKeyframeTime(_currIndex - 1) <= t) {
            return _currIndex - 1;
          }
        }
      }
    }
    var left = 0;
    var right = nKeyframes;
    var mid;
    while (right - left > 1) {
      mid = Math.floor((left + right) / 2);
      if (curve.getKeyframeTime(mid) >= t) {
        right = mid;
      } else {
        left = mid;
      }
    }
    return left;
  };
  return _createClass(AnimationCurve, [{
    key: "_internalCurve",
    get: function get() {
      return this._curve;
    }
  }, {
    key: "keyFrames",
    get: function get() {
      return Array.from(this._curve.keyframes()).map(function (_ref) {
        var time = _ref[0],
          value = _ref[1];
        var legacyKeyframe = new Keyframe();
        legacyKeyframe.time = time;
        legacyKeyframe.value = value.value;
        legacyKeyframe.inTangent = value.leftTangent;
        legacyKeyframe.outTangent = value.rightTangent;
        return legacyKeyframe;
      });
    },
    set: function set(value) {
      this._curve.assignSorted(value.map(function (legacyCurve) {
        return [legacyCurve.time, {
          interpolationMode: RealInterpolationMode.CUBIC,
          value: legacyCurve.value,
          leftTangent: legacyCurve.inTangent,
          rightTangent: legacyCurve.outTangent
        }];
      }));
    }
  }, {
    key: "preWrapMode",
    get: function get() {
      return toLegacyWrapMode(this._curve.preExtrapolation);
    },
    set: function set(value) {
      this._curve.preExtrapolation = fromLegacyWrapMode(value);
    }
  }, {
    key: "postWrapMode",
    get: function get() {
      return toLegacyWrapMode(this._curve.postExtrapolation);
    },
    set: function set(value) {
      this._curve.postExtrapolation = fromLegacyWrapMode(value);
    }
  }]);
}();
AnimationCurve.defaultKF = [{
  time: 0,
  value: 1,
  inTangent: 0,
  outTangent: 0
}, {
  time: 1,
  value: 1,
  inTangent: 0,
  outTangent: 0
}];
CCClass.fastDefine('cc.AnimationCurve', AnimationCurve, {
  _curve: null
});
var WrapModeMask;
(function (WrapModeMask) {
  WrapModeMask[WrapModeMask["Default"] = 0] = "Default";
  WrapModeMask[WrapModeMask["Normal"] = 1] = "Normal";
  WrapModeMask[WrapModeMask["Loop"] = 2] = "Loop";
  WrapModeMask[WrapModeMask["ShouldWrap"] = 4] = "ShouldWrap";
  WrapModeMask[WrapModeMask["Clamp"] = 8] = "Clamp";
  WrapModeMask[WrapModeMask["PingPong"] = 22] = "PingPong";
  WrapModeMask[WrapModeMask["Reverse"] = 36] = "Reverse";
})(WrapModeMask || (WrapModeMask = {}));
function fromLegacyWrapMode(legacyWrapMode) {
  switch (legacyWrapMode) {
    default:
    case WrapModeMask.Default:
    case WrapModeMask.Normal:
    case WrapModeMask.Clamp:
      return ExtrapolationMode.CLAMP;
    case WrapModeMask.PingPong:
      return ExtrapolationMode.PING_PONG;
    case WrapModeMask.Loop:
      return ExtrapolationMode.LOOP;
  }
}
function toLegacyWrapMode(extrapolationMode) {
  switch (extrapolationMode) {
    default:
    case ExtrapolationMode.LINEAR:
    case ExtrapolationMode.CLAMP:
      return WrapModeMask.Clamp;
    case ExtrapolationMode.PING_PONG:
      return WrapModeMask.PingPong;
    case ExtrapolationMode.LOOP:
      return WrapModeMask.Loop;
  }
}
function constructLegacyCurveAndConvert() {
  var curve = new RealCurve();
  curve.assignSorted([[0.0, {
    interpolationMode: RealInterpolationMode.CUBIC,
    value: 1.0
  }], [1.0, {
    interpolationMode: RealInterpolationMode.CUBIC,
    value: 1.0
  }]]);
  return curve;
}

var vec3MultiplyScalar = Vec3.multiplyScalar;
var vec3Add = Vec3.add;
var SplineMode;
(function (SplineMode) {
  SplineMode[SplineMode["LINEAR"] = 0] = "LINEAR";
  SplineMode[SplineMode["BEZIER"] = 1] = "BEZIER";
  SplineMode[SplineMode["CATMULL_ROM"] = 2] = "CATMULL_ROM";
})(SplineMode || (SplineMode = {}));
var SPLINE_WHOLE_INDEX = 0xffffffff;
var _v0 = v3();
var _v1 = v3();
var _v2 = v3();
var _v3 = v3();
var Spline = function () {
  function Spline(mode, knots) {
    if (mode === void 0) {
      mode = SplineMode.CATMULL_ROM;
    }
    if (knots === void 0) {
      knots = [];
    }
    this._type = void 0;
    this._knots = [];
    this._type = ShapeType.SHAPE_SPLINE;
    this._mode = mode;
    for (var i = 0; i < knots.length; i++) {
      this._knots[i] = v3(knots[i]);
    }
  }
  Spline.create = function create(mode, knots) {
    if (knots === void 0) {
      knots = [];
    }
    return new Spline(mode, knots);
  };
  Spline.clone = function clone(s) {
    return new Spline(s.mode, s.knots);
  };
  Spline.copy = function copy(out, s) {
    out._mode = s.mode;
    out._knots.length = 0;
    var knots = s.knots;
    var length = knots.length;
    for (var i = 0; i < length; i++) {
      out._knots[i] = v3(knots[i]);
    }
    return out;
  };
  var _proto = Spline.prototype;
  _proto.setModeAndKnots = function setModeAndKnots(mode, knots) {
    this._mode = mode;
    this._knots.length = 0;
    for (var i = 0; i < knots.length; i++) {
      this._knots[i] = v3(knots[i]);
    }
  };
  _proto.clearKnots = function clearKnots() {
    this._knots.length = 0;
  };
  _proto.getKnotCount = function getKnotCount() {
    return this._knots.length;
  };
  _proto.addKnot = function addKnot(knot) {
    this._knots.push(v3(knot));
  };
  _proto.insertKnot = function insertKnot(index, knot) {
    var item = v3(knot);
    if (index >= this._knots.length) {
      this._knots.push(item);
      return;
    }
    this._knots.splice(index, 0, item);
  };
  _proto.removeKnot = function removeKnot(index) {
    assertsArrayIndex(this._knots, index);
    this._knots.splice(index, 1);
  };
  _proto.setKnot = function setKnot(index, knot) {
    assertsArrayIndex(this._knots, index);
    this._knots[index].set(knot);
  };
  _proto.getKnot = function getKnot(index) {
    assertsArrayIndex(this._knots, index);
    return this._knots[index];
  };
  _proto.getPoint = function getPoint(t, index) {
    if (index === void 0) {
      index = SPLINE_WHOLE_INDEX;
    }
    t = clamp(t, 0.0, 1.0);
    var segments = this.getSegments();
    if (segments === 0) {
      return v3();
    }
    if (index === SPLINE_WHOLE_INDEX) {
      var deltaT = 1.0 / segments;
      index = Math.floor(t / deltaT);
      t = t % deltaT / deltaT;
    }
    var knots = this._knots;
    if (index >= segments) {
      return v3(knots[knots.length - 1]);
    }
    switch (this._mode) {
      case SplineMode.LINEAR:
        return Spline.calcLinear(knots[index], knots[index + 1], t);
      case SplineMode.BEZIER:
        {
          var start = index * 4;
          return Spline.calcBezier(knots[start], knots[start + 1], knots[start + 2], knots[start + 3], t);
        }
      case SplineMode.CATMULL_ROM:
        {
          var v0 = index > 0 ? knots[index - 1] : knots[index];
          var _v = index + 2 < knots.length ? knots[index + 2] : knots[index + 1];
          return Spline.calcCatmullRom(v0, knots[index], knots[index + 1], _v, t);
        }
      default:
        return v3();
    }
  };
  _proto.getPoints = function getPoints(num, index) {
    if (index === void 0) {
      index = SPLINE_WHOLE_INDEX;
    }
    if (num === 0) {
      return [];
    }
    if (num === 1) {
      var point = this.getPoint(0.0, index);
      return [point];
    }
    var points = [];
    var deltaT = 1.0 / (num - 1.0);
    for (var i = 0; i < num; i++) {
      var t = i * deltaT;
      var _point = this.getPoint(t, index);
      points.push(_point);
    }
    return points;
  };
  _proto.getSegments = function getSegments() {
    var count = this._knots.length;
    switch (this._mode) {
      case SplineMode.LINEAR:
      case SplineMode.CATMULL_ROM:
        if (count < 2) {
          warnID(14300);
          return 0;
        }
        return count - 1;
      case SplineMode.BEZIER:
        if (count < 4 || count % 4 !== 0) {
          warnID(14301);
          return 0;
        }
        return count / 4;
      default:
        assertID(false, 16407);
        return 0;
    }
  };
  Spline.calcLinear = function calcLinear(v0, v1, t) {
    var result = new Vec3();
    vec3MultiplyScalar(_v0, v0, 1.0 - t);
    vec3MultiplyScalar(_v1, v1, t);
    vec3Add(result, _v0, _v1);
    return result;
  };
  Spline.calcBezier = function calcBezier(v0, v1, v2, v3, t) {
    var result = new Vec3();
    var s = 1.0 - t;
    vec3MultiplyScalar(_v0, v0, s * s * s);
    vec3MultiplyScalar(_v1, v1, 3.0 * t * s * s);
    vec3MultiplyScalar(_v2, v2, 3.0 * t * t * s);
    vec3MultiplyScalar(_v3, v3, t * t * t);
    vec3Add(_v0, _v0, _v1);
    vec3Add(_v2, _v2, _v3);
    vec3Add(result, _v0, _v2);
    return result;
  };
  Spline.calcCatmullRom = function calcCatmullRom(v0, v1, v2, v3, t) {
    var result = new Vec3();
    var t2 = t * t;
    var t3 = t2 * t;
    vec3MultiplyScalar(_v0, v0, -0.5 * t3 + t2 - 0.5 * t);
    vec3MultiplyScalar(_v1, v1, 1.5 * t3 - 2.5 * t2 + 1.0);
    vec3MultiplyScalar(_v2, v2, -1.5 * t3 + 2.0 * t2 + 0.5 * t);
    vec3MultiplyScalar(_v3, v3, 0.5 * t3 - 0.5 * t2);
    vec3Add(_v0, _v0, _v1);
    vec3Add(_v2, _v2, _v3);
    vec3Add(result, _v0, _v2);
    return result;
  };
  return _createClass(Spline, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }, {
    key: "mode",
    get: function get() {
      return this._mode;
    }
  }, {
    key: "knots",
    get: function get() {
      return this._knots;
    }
  }]);
}();

var ERaycastMode;
(function (ERaycastMode) {
  ERaycastMode[ERaycastMode["ALL"] = 0] = "ALL";
  ERaycastMode[ERaycastMode["CLOSEST"] = 1] = "CLOSEST";
  ERaycastMode[ERaycastMode["ANY"] = 2] = "ANY";
})(ERaycastMode || (ERaycastMode = {}));

var geometry = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AABB: AABB,
    AnimationCurve: AnimationCurve,
    Capsule: Capsule,
    get ERaycastMode () { return ERaycastMode; },
    Frustum: Frustum,
    Keyframe: Keyframe,
    Line: Line,
    OBB: OBB,
    OptimizedKey: OptimizedKey,
    Plane: Plane,
    Ray: Ray,
    Sphere: Sphere,
    Spline: Spline,
    get SplineMode () { return SplineMode; },
    Triangle: Triangle,
    get WrapModeMask () { return WrapModeMask; },
    constructLegacyCurveAndConvert: constructLegacyCurveAndConvert,
    distance: distance,
    enums: ShapeType_default,
    evalOptCurve: evalOptCurve,
    intersect: intersect
});

var SystemPriority;
(function (SystemPriority) {
  SystemPriority[SystemPriority["LOW"] = 0] = "LOW";
  SystemPriority[SystemPriority["MEDIUM"] = 100] = "MEDIUM";
  SystemPriority[SystemPriority["HIGH"] = 200] = "HIGH";
  SystemPriority[SystemPriority["SCHEDULER"] = 2147483648] = "SCHEDULER";
})(SystemPriority || (SystemPriority = {}));
var System = function () {
  function System() {
    this._id = '';
    this._priority = 0;
    this._executeInEditMode = false;
  }
  System.sortByPriority = function sortByPriority(a, b) {
    if (a._priority < b._priority) {
      return 1;
    } else if (a._priority > b.priority) {
      return -1;
    } else {
      return 0;
    }
  };
  var _proto = System.prototype;
  _proto.init = function init() {};
  _proto.update = function update(dt) {};
  _proto.postUpdate = function postUpdate(dt) {};
  _proto.destroy = function destroy() {};
  return _createClass(System, [{
    key: "priority",
    get: function get() {
      return this._priority;
    },
    set: function set(value) {
      this._priority = value;
    }
  }, {
    key: "id",
    get: function get() {
      return this._id;
    },
    set: function set(id) {
      this._id = id;
    }
  }]);
}();
System.Priority = Enum({
  LOW: SystemPriority.LOW,
  MEDIUM: SystemPriority.MEDIUM,
  HIGH: SystemPriority.HIGH,
  SCHEDULER: SystemPriority.SCHEDULER
});

var MAX_POOL_SIZE = 20;
var idGenerator = new IDGenerator('Scheduler');
var ListEntry = function () {
  function ListEntry(target, priority, paused, markedForDeletion) {
    this.target = void 0;
    this.priority = void 0;
    this.paused = void 0;
    this.markedForDeletion = void 0;
    this.target = target;
    this.priority = priority;
    this.paused = paused;
    this.markedForDeletion = markedForDeletion;
  }
  ListEntry.get = function get(target, priority, paused, markedForDeletion) {
    var result = ListEntry._listEntries.pop();
    if (result) {
      result.target = target;
      result.priority = priority;
      result.paused = paused;
      result.markedForDeletion = markedForDeletion;
    } else {
      result = new ListEntry(target, priority, paused, markedForDeletion);
    }
    return result;
  };
  ListEntry.put = function put(entry) {
    if (ListEntry._listEntries.length < MAX_POOL_SIZE) {
      entry.target = null;
      ListEntry._listEntries.push(entry);
    }
  };
  return ListEntry;
}();
ListEntry._listEntries = [];
var HashUpdateEntry = function () {
  function HashUpdateEntry(list, entry, target, callback) {
    this.list = void 0;
    this.entry = void 0;
    this.target = void 0;
    this.callback = void 0;
    this.list = list;
    this.entry = entry;
    this.target = target;
    this.callback = callback;
  }
  HashUpdateEntry.get = function get(list, entry, target, callback) {
    var result = HashUpdateEntry._hashUpdateEntries.pop();
    if (result) {
      result.list = list;
      result.entry = entry;
      result.target = target;
      result.callback = callback;
    } else {
      result = new HashUpdateEntry(list, entry, target, callback);
    }
    return result;
  };
  HashUpdateEntry.put = function put(entry) {
    if (HashUpdateEntry._hashUpdateEntries.length < MAX_POOL_SIZE) {
      entry.list = entry.entry = entry.target = entry.callback = null;
      HashUpdateEntry._hashUpdateEntries.push(entry);
    }
  };
  return HashUpdateEntry;
}();
HashUpdateEntry._hashUpdateEntries = [];
var HashTimerEntry = function () {
  function HashTimerEntry(timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused) {
    this.timers = void 0;
    this.target = void 0;
    this.timerIndex = void 0;
    this.currentTimer = void 0;
    this.currentTimerSalvaged = void 0;
    this.paused = void 0;
    this.timers = timers;
    this.target = target;
    this.timerIndex = timerIndex;
    this.currentTimer = currentTimer;
    this.currentTimerSalvaged = currentTimerSalvaged;
    this.paused = paused;
  }
  HashTimerEntry.get = function get(timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused) {
    var result = HashTimerEntry._hashTimerEntries.pop();
    if (result) {
      result.timers = timers;
      result.target = target;
      result.timerIndex = timerIndex;
      result.currentTimer = currentTimer;
      result.currentTimerSalvaged = currentTimerSalvaged;
      result.paused = paused;
    } else {
      result = new HashTimerEntry(timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused);
    }
    return result;
  };
  HashTimerEntry.put = function put(entry) {
    if (HashTimerEntry._hashTimerEntries.length < MAX_POOL_SIZE) {
      entry.timers = entry.target = entry.currentTimer = null;
      HashTimerEntry._hashTimerEntries.push(entry);
    }
  };
  return HashTimerEntry;
}();
HashTimerEntry._hashTimerEntries = [];
var CallbackTimer = function () {
  function CallbackTimer() {
    this._lock = void 0;
    this._scheduler = void 0;
    this._elapsed = void 0;
    this._runForever = void 0;
    this._useDelay = void 0;
    this._timesExecuted = void 0;
    this._repeat = void 0;
    this._delay = void 0;
    this._interval = void 0;
    this._target = void 0;
    this._callback = void 0;
    this._lock = false;
    this._scheduler = null;
    this._elapsed = -1;
    this._runForever = false;
    this._useDelay = false;
    this._timesExecuted = 0;
    this._repeat = 0;
    this._delay = 0;
    this._interval = 0;
    this._target = null;
  }
  CallbackTimer.get = function get() {
    return CallbackTimer._timers.pop() || new CallbackTimer();
  };
  CallbackTimer.put = function put(timer) {
    if (CallbackTimer._timers.length < MAX_POOL_SIZE && !timer._lock) {
      timer._scheduler = timer._target = timer._callback = null;
      CallbackTimer._timers.push(timer);
    }
  };
  var _proto = CallbackTimer.prototype;
  _proto.initWithCallback = function initWithCallback(scheduler, callback, target, seconds, repeat, delay) {
    this._lock = false;
    this._scheduler = scheduler;
    this._target = target;
    this._callback = callback;
    this._timesExecuted = 0;
    this._elapsed = -1;
    this._interval = seconds;
    this._delay = delay;
    this._useDelay = this._delay > 0;
    this._repeat = repeat;
    this._runForever = this._repeat === legacyCC.macro.REPEAT_FOREVER;
    return true;
  };
  _proto.getInterval = function getInterval() {
    return this._interval;
  };
  _proto.setInterval = function setInterval(interval) {
    this._interval = interval;
  };
  _proto.update = function update(dt) {
    if (this._elapsed === -1) {
      this._elapsed = 0;
      this._timesExecuted = 0;
    } else {
      this._elapsed += dt;
      if (this._runForever && !this._useDelay) {
        if (this._elapsed >= this._interval) {
          this.trigger();
          this._elapsed = 0;
        }
      } else {
        if (this._useDelay) {
          if (this._elapsed >= this._delay) {
            this.trigger();
            this._elapsed -= this._delay;
            this._timesExecuted += 1;
            this._useDelay = false;
          }
        } else if (this._elapsed >= this._interval) {
          this.trigger();
          this._elapsed = 0;
          this._timesExecuted += 1;
        }
        if (this._callback && !this._runForever && this._timesExecuted > this._repeat) {
          this.cancel();
        }
      }
    }
  };
  _proto.getCallback = function getCallback() {
    return this._callback;
  };
  _proto.trigger = function trigger() {
    if (this._target && this._callback) {
      this._lock = true;
      this._callback.call(this._target, this._elapsed);
      this._lock = false;
    }
  };
  _proto.cancel = function cancel() {
    if (this._scheduler && this._callback && this._target) {
      this._scheduler.unscheduleForTimer(this, this._target);
    }
  };
  return CallbackTimer;
}();
CallbackTimer._timers = [];
var Scheduler = function (_System) {
  function Scheduler() {
    var _this;
    _this = _System.call(this) || this;
    _this._timeScale = void 0;
    _this._updatesNegList = void 0;
    _this._updates0List = void 0;
    _this._updatesPosList = void 0;
    _this._hashForUpdates = void 0;
    _this._hashForTimers = void 0;
    _this._currentTarget = void 0;
    _this._currentTargetSalvaged = void 0;
    _this._updateHashLocked = void 0;
    _this._arrayForTimers = void 0;
    _this._timeScale = 1.0;
    _this._updatesNegList = [];
    _this._updates0List = [];
    _this._updatesPosList = [];
    _this._hashForUpdates = createMap(true);
    _this._hashForTimers = createMap(true);
    _this._currentTarget = null;
    _this._currentTargetSalvaged = false;
    _this._updateHashLocked = false;
    _this._arrayForTimers = [];
    return _this;
  }
  _inheritsLoose(Scheduler, _System);
  Scheduler.enableForTarget = function enableForTarget(target) {
    var found = false;
    if (target.uuid) {
      found = true;
    } else if (target.id) {
      found = true;
    }
    if (!found) {
      target.id = idGenerator.getNewId();
    }
  };
  var _proto2 = Scheduler.prototype;
  _proto2.setTimeScale = function setTimeScale(timeScale) {
    this._timeScale = timeScale;
  };
  _proto2.getTimeScale = function getTimeScale() {
    return this._timeScale;
  };
  _proto2.update = function update(dt) {
    this._updateHashLocked = true;
    if (this._timeScale !== 1) {
      dt *= this._timeScale;
    }
    var i;
    var list;
    var len;
    var entry;
    for (i = 0, list = this._updatesNegList, len = list.length; i < len; i++) {
      entry = list[i];
      if (!entry.paused && !entry.markedForDeletion && entry.target) {
        entry.target.update == null ? void 0 : entry.target.update(dt);
      }
    }
    for (i = 0, list = this._updates0List, len = list.length; i < len; i++) {
      entry = list[i];
      if (!entry.paused && !entry.markedForDeletion && entry.target) {
        entry.target.update == null ? void 0 : entry.target.update(dt);
      }
    }
    for (i = 0, list = this._updatesPosList, len = list.length; i < len; i++) {
      entry = list[i];
      if (!entry.paused && !entry.markedForDeletion && entry.target) {
        entry.target.update == null ? void 0 : entry.target.update(dt);
      }
    }
    var elt;
    var arr = this._arrayForTimers;
    for (i = 0; i < arr.length; i++) {
      var _this$_currentTarget$;
      elt = arr[i];
      this._currentTarget = elt;
      this._currentTargetSalvaged = false;
      if (!elt.paused && elt.timers) {
        for (elt.timerIndex = 0; elt.timerIndex < elt.timers.length; ++elt.timerIndex) {
          elt.currentTimer = elt.timers[elt.timerIndex];
          elt.currentTimerSalvaged = false;
          elt.currentTimer.update(dt);
          elt.currentTimer = null;
        }
      }
      if (this._currentTargetSalvaged && ((_this$_currentTarget$ = this._currentTarget.timers) == null ? void 0 : _this$_currentTarget$.length) === 0) {
        this._removeHashElement(this._currentTarget);
        --i;
      }
    }
    for (i = 0, list = this._updatesNegList; i < list.length;) {
      entry = list[i];
      if (entry.markedForDeletion) {
        this._removeUpdateFromHash(entry);
      } else {
        i++;
      }
    }
    for (i = 0, list = this._updates0List; i < list.length;) {
      entry = list[i];
      if (entry.markedForDeletion) {
        this._removeUpdateFromHash(entry);
      } else {
        i++;
      }
    }
    for (i = 0, list = this._updatesPosList; i < list.length;) {
      entry = list[i];
      if (entry.markedForDeletion) {
        this._removeUpdateFromHash(entry);
      } else {
        i++;
      }
    }
    this._updateHashLocked = false;
    this._currentTarget = null;
  };
  _proto2.schedule = function schedule(callbackTmp, targetTmp, interval, repeat, delay, paused) {
    var _repeat, _delay;
    var callback;
    var target;
    if (typeof callbackTmp !== 'function') {
      warnID(1514);
      callback = targetTmp;
      target = callbackTmp;
    } else {
      callback = callbackTmp;
      target = targetTmp;
    }
    if (arguments.length === 3 || arguments.length === 4 || arguments.length === 5) {
      paused = !!repeat;
      repeat = legacyCC.macro.REPEAT_FOREVER;
      delay = 0;
    }
    assertID(Boolean(target), 1502);
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return;
    }
    var element = this._hashForTimers[targetId];
    if (!element) {
      element = HashTimerEntry.get(null, target, 0, null, false, Boolean(paused));
      this._arrayForTimers.push(element);
      this._hashForTimers[targetId] = element;
    } else if (element.paused !== paused) {
      warnID(1511);
    }
    var timer;
    var i;
    if (element.timers == null) {
      element.timers = [];
    } else {
      for (i = 0; i < element.timers.length; ++i) {
        timer = element.timers[i];
        if (timer && callback === timer.getCallback()) {
          logID(1507, timer.getInterval(), interval);
          timer.setInterval(interval);
          return;
        }
      }
    }
    timer = CallbackTimer.get();
    timer.initWithCallback(this, callback, target, interval, (_repeat = repeat) !== null && _repeat !== void 0 ? _repeat : 0, (_delay = delay) !== null && _delay !== void 0 ? _delay : 0);
    element.timers.push(timer);
    if (this._currentTarget === element && this._currentTargetSalvaged) {
      this._currentTargetSalvaged = false;
    }
  };
  _proto2.scheduleUpdate = function scheduleUpdate(target, priority, paused) {
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return;
    }
    var hashElement = this._hashForUpdates[targetId];
    if (hashElement && hashElement.entry) {
      if (hashElement.entry.priority !== priority) {
        if (this._updateHashLocked) {
          logID(1506);
          hashElement.entry.markedForDeletion = false;
          hashElement.entry.paused = paused;
          return;
        } else {
          this.unscheduleUpdate(target);
        }
      } else {
        hashElement.entry.markedForDeletion = false;
        hashElement.entry.paused = paused;
        return;
      }
    }
    var listElement = ListEntry.get(target, priority, paused, false);
    var ppList;
    if (priority === 0) {
      ppList = this._updates0List;
      this._appendIn(ppList, listElement);
    } else {
      ppList = priority < 0 ? this._updatesNegList : this._updatesPosList;
      this._priorityIn(ppList, listElement, priority);
    }
    this._hashForUpdates[targetId] = HashUpdateEntry.get(ppList, listElement, target, null);
  };
  _proto2.unschedule = function unschedule(callback, target) {
    if (!target || !callback) {
      return;
    }
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return;
    }
    var element = this._hashForTimers[targetId];
    if (element) {
      var timers = element.timers;
      if (!timers) {
        return;
      }
      for (var i = 0, li = timers.length; i < li; i++) {
        var timer = timers[i];
        if (callback === timer.getCallback()) {
          if (timer === element.currentTimer && !element.currentTimerSalvaged) {
            element.currentTimerSalvaged = true;
          }
          timers.splice(i, 1);
          CallbackTimer.put(timer);
          if (element.timerIndex >= i) {
            element.timerIndex--;
          }
          if (timers.length === 0) {
            if (this._currentTarget === element) {
              this._currentTargetSalvaged = true;
            } else {
              this._removeHashElement(element);
            }
          }
          return;
        }
      }
    }
  };
  _proto2.unscheduleForTimer = function unscheduleForTimer(timerToUnschedule, target) {
    var targetId = target.uuid || target.id;
    var element = this._hashForTimers[targetId];
    var timers = element.timers;
    if (!timers || timers.length === 0) {
      return;
    }
    for (var i = timers.length - 1; i >= 0; i--) {
      var timer = timers[i];
      if (timer === timerToUnschedule) {
        timers.splice(i, 1);
        CallbackTimer.put(timer);
        if (element.timerIndex >= i) {
          element.timerIndex--;
        }
        if (timers.length === 0) {
          this._currentTargetSalvaged = true;
        }
        return;
      }
    }
  };
  _proto2.unscheduleUpdate = function unscheduleUpdate(target) {
    if (!target) {
      return;
    }
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return;
    }
    var element = this._hashForUpdates[targetId];
    if (element != null && element.entry) {
      if (this._updateHashLocked) {
        element.entry.markedForDeletion = true;
      } else {
        this._removeUpdateFromHash(element.entry);
      }
    }
  };
  _proto2.unscheduleAllForTarget = function unscheduleAllForTarget(target) {
    if (!target) {
      return;
    }
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return;
    }
    var element = this._hashForTimers[targetId];
    if (element != null && element.timers) {
      var timers = element.timers;
      if (element.currentTimer && timers.indexOf(element.currentTimer) > -1 && !element.currentTimerSalvaged) {
        element.currentTimerSalvaged = true;
      }
      for (var i = 0, l = timers.length; i < l; i++) {
        CallbackTimer.put(timers[i]);
      }
      timers.length = 0;
      if (this._currentTarget === element) {
        this._currentTargetSalvaged = true;
      } else {
        this._removeHashElement(element);
      }
    }
    this.unscheduleUpdate(target);
  };
  _proto2.unscheduleAll = function unscheduleAll() {
    this.unscheduleAllWithMinPriority(SystemPriority.SCHEDULER);
  };
  _proto2.unscheduleAllWithMinPriority = function unscheduleAllWithMinPriority(minPriority) {
    var i;
    var element;
    var arr = this._arrayForTimers;
    for (i = arr.length - 1; i >= 0; i--) {
      element = arr[i];
      if (element.target) {
        this.unscheduleAllForTarget(element.target);
      }
    }
    var entry;
    var temp_length = 0;
    if (minPriority < 0) {
      for (i = 0; i < this._updatesNegList.length;) {
        var _entry;
        temp_length = this._updatesNegList.length;
        entry = this._updatesNegList[i];
        if ((_entry = entry) != null && _entry.target && entry.priority >= minPriority) {
          this.unscheduleUpdate(entry.target);
        }
        if (temp_length === this._updatesNegList.length) {
          i++;
        }
      }
    }
    if (minPriority <= 0) {
      for (i = 0; i < this._updates0List.length;) {
        var _entry2;
        temp_length = this._updates0List.length;
        entry = this._updates0List[i];
        if ((_entry2 = entry) != null && _entry2.target) {
          this.unscheduleUpdate(entry.target);
        }
        if (temp_length === this._updates0List.length) {
          i++;
        }
      }
    }
    for (i = 0; i < this._updatesPosList.length;) {
      var _entry3;
      temp_length = this._updatesPosList.length;
      entry = this._updatesPosList[i];
      if ((_entry3 = entry) != null && _entry3.target && entry.priority >= minPriority) {
        this.unscheduleUpdate(entry.target);
      }
      if (temp_length === this._updatesPosList.length) {
        i++;
      }
    }
  };
  _proto2.isScheduled = function isScheduled(callback, target) {
    assertID(Boolean(callback), 1508);
    assertID(Boolean(target), 1509);
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return false;
    }
    var element = this._hashForTimers[targetId];
    if (!element) {
      return false;
    }
    if (element.timers == null) {
      return false;
    } else {
      var timers = element.timers;
      for (var i = 0; i < timers.length; ++i) {
        var timer = timers[i];
        if (callback === timer.getCallback()) {
          return true;
        }
      }
      return false;
    }
  };
  _proto2.pauseAllTargets = function pauseAllTargets() {
    return this.pauseAllTargetsWithMinPriority(SystemPriority.SCHEDULER);
  };
  _proto2.pauseAllTargetsWithMinPriority = function pauseAllTargetsWithMinPriority(minPriority) {
    var idsWithSelectors = [];
    var element;
    var locArrayForTimers = this._arrayForTimers;
    var i;
    var li;
    for (i = 0, li = locArrayForTimers.length; i < li; i++) {
      var _element;
      element = locArrayForTimers[i];
      if ((_element = element) != null && _element.target) {
        element.paused = true;
        idsWithSelectors.push(element.target);
      }
    }
    var entry;
    if (minPriority < 0) {
      for (i = 0; i < this._updatesNegList.length; i++) {
        var _entry4;
        entry = this._updatesNegList[i];
        if ((_entry4 = entry) != null && _entry4.target) {
          if (entry.priority >= minPriority) {
            entry.paused = true;
            idsWithSelectors.push(entry.target);
          }
        }
      }
    }
    if (minPriority <= 0) {
      for (i = 0; i < this._updates0List.length; i++) {
        var _entry5;
        entry = this._updates0List[i];
        if ((_entry5 = entry) != null && _entry5.target) {
          entry.paused = true;
          idsWithSelectors.push(entry.target);
        }
      }
    }
    for (i = 0; i < this._updatesPosList.length; i++) {
      var _entry6;
      entry = this._updatesPosList[i];
      if ((_entry6 = entry) != null && _entry6.target) {
        if (entry.priority >= minPriority) {
          entry.paused = true;
          idsWithSelectors.push(entry.target);
        }
      }
    }
    return idsWithSelectors;
  };
  _proto2.resumeTargets = function resumeTargets(targetsToResume) {
    if (!targetsToResume) {
      return;
    }
    for (var i = 0; i < targetsToResume.length; i++) {
      this.resumeTarget(targetsToResume[i]);
    }
  };
  _proto2.pauseTarget = function pauseTarget(target) {
    assertID(Boolean(target), 1503);
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return;
    }
    var element = this._hashForTimers[targetId];
    if (element) {
      element.paused = true;
    }
    var elementUpdate = this._hashForUpdates[targetId];
    if (elementUpdate != null && elementUpdate.entry) {
      elementUpdate.entry.paused = true;
    }
  };
  _proto2.resumeTarget = function resumeTarget(target) {
    assertID(Boolean(target), 1504);
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return;
    }
    var element = this._hashForTimers[targetId];
    if (element) {
      element.paused = false;
    }
    var elementUpdate = this._hashForUpdates[targetId];
    if (elementUpdate != null && elementUpdate.entry) {
      elementUpdate.entry.paused = false;
    }
  };
  _proto2.isTargetPaused = function isTargetPaused(target) {
    assertID(Boolean(target), 1505);
    var targetId = target.uuid || target.id;
    if (!targetId) {
      errorID(1510);
      return false;
    }
    var element = this._hashForTimers[targetId];
    if (element) {
      return element.paused;
    }
    var elementUpdate = this._hashForUpdates[targetId];
    if (elementUpdate != null && elementUpdate.entry) {
      return elementUpdate.entry.paused;
    }
    return false;
  };
  _proto2._removeHashElement = function _removeHashElement(element) {
    if (!element.target) {
      return;
    }
    var targetId = element.target.uuid || element.target.id;
    if (typeof targetId === 'undefined') {
      return;
    }
    delete this._hashForTimers[targetId];
    var arr = this._arrayForTimers;
    for (var i = 0, l = arr.length; i < l; i++) {
      if (arr[i] === element) {
        arr.splice(i, 1);
        break;
      }
    }
    HashTimerEntry.put(element);
  };
  _proto2._removeUpdateFromHash = function _removeUpdateFromHash(entry) {
    if (!entry.target) {
      return;
    }
    var targetId = entry.target.uuid || entry.target.id;
    if (typeof targetId === 'undefined') {
      return;
    }
    var element = this._hashForUpdates[targetId];
    if (element) {
      var list = element.list;
      var listEntry = element.entry;
      if (list) {
        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === listEntry) {
            list.splice(i, 1);
            break;
          }
        }
      }
      delete this._hashForUpdates[targetId];
      if (listEntry) {
        ListEntry.put(listEntry);
      }
      HashUpdateEntry.put(element);
    }
  };
  _proto2._priorityIn = function _priorityIn(ppList, listElement, priority) {
    for (var i = 0; i < ppList.length; i++) {
      if (priority < ppList[i].priority) {
        ppList.splice(i, 0, listElement);
        return;
      }
    }
    ppList.push(listElement);
  };
  _proto2._appendIn = function _appendIn(ppList, listElement) {
    ppList.push(listElement);
  };
  return Scheduler;
}(System);
Scheduler.ID = 'scheduler';
legacyCC.Scheduler = Scheduler;

var vmath = {};
replaceProperty(vmath, 'vmath', [{
  name: 'vec2',
  newName: 'Vec2',
  target: math,
  targetName: 'math'
}, {
  name: 'vec3',
  newName: 'Vec3',
  target: math,
  targetName: 'math'
}, {
  name: 'vec4',
  newName: 'Vec4',
  target: math,
  targetName: 'math'
}, {
  name: 'quat',
  newName: 'Quat',
  target: math,
  targetName: 'math'
}, {
  name: 'mat3',
  newName: 'Mat3',
  target: math,
  targetName: 'math'
}, {
  name: 'mat4',
  newName: 'Mat4',
  target: math,
  targetName: 'math'
}, {
  name: 'color4',
  newName: 'Color',
  target: math,
  targetName: 'math'
}, {
  name: 'rect',
  newName: 'Rect',
  target: math,
  targetName: 'math'
}, {
  name: 'approx',
  newName: 'approx',
  target: math,
  targetName: 'math'
}, {
  name: 'EPSILON',
  newName: 'EPSILON',
  target: math,
  targetName: 'math'
}, {
  name: 'equals',
  newName: 'equals',
  target: math,
  targetName: 'math'
}, {
  name: 'clamp',
  newName: 'clamp',
  target: math,
  targetName: 'math'
}, {
  name: 'clamp01',
  newName: 'clamp01',
  target: math,
  targetName: 'math'
}, {
  name: 'lerp',
  newName: 'lerp',
  target: math,
  targetName: 'math'
}, {
  name: 'toRadian',
  newName: 'toRadian',
  target: math,
  targetName: 'math'
}, {
  name: 'toDegree',
  newName: 'toDegree',
  target: math,
  targetName: 'math'
}, {
  name: 'random',
  newName: 'random',
  target: math,
  targetName: 'math'
}, {
  name: 'randomRange',
  newName: 'randomRange',
  target: math,
  targetName: 'math'
}, {
  name: 'randomRangeInt',
  newName: 'randomRangeInt',
  target: math,
  targetName: 'math'
}, {
  name: 'pseudoRandom',
  newName: 'pseudoRandom',
  target: math,
  targetName: 'math'
}, {
  name: 'pseudoRandomRangeInt',
  newName: 'pseudoRandomRangeInt',
  target: math,
  targetName: 'math'
}, {
  name: 'nextPow2',
  newName: 'nextPow2',
  target: math,
  targetName: 'math'
}, {
  name: 'repeat',
  newName: 'repeat',
  target: math,
  targetName: 'math'
}, {
  name: 'pingPong',
  newName: 'pingPong',
  target: math,
  targetName: 'math'
}, {
  name: 'inverseLerp',
  newName: 'inverseLerp',
  target: math,
  targetName: 'math'
}]);
legacyCC.vmath = vmath;
replaceProperty(Scheduler.prototype, 'Scheduler.prototype', [{
  name: 'enableForTarget',
  newName: 'enableForTarget',
  target: Scheduler,
  targetName: 'Scheduler'
}]);
replaceProperty(Scheduler, 'Scheduler', [{
  name: 'PRIORITY_SYSTEM',
  newName: 'System.Priority.SCHEDULER',
  customGetter: function customGetter() {
    return SystemPriority.SCHEDULER;
  }
}]);
removeProperty(Scheduler, 'Scheduler', [{
  name: 'PRIORITY_NON_SYSTEM',
  suggest: 'Use enum` System.Priority` instead'
}]);

legacyCC.easing = easing;

legacyCC.math = math;
legacyCC.geometry = geometry;

export { Capsule as $, approx as A, Size as B, Color as C, ERaycastMode as D, EPSILON as E, intersect as F, markAsWarning as G, Scheduler as H, nextPow2 as I, AABB as J, halfToFloat as K, override as L, Mat4 as M, visibleRect as N, screenAdapter as O, Mat3 as P, Quat as Q, Ray as R, System as S, Triangle as T, clamp01 as U, Vec2 as V, cubicOut as W, random as X, toDegree as Y, OBB as Z, Sphere as _, clamp as a, binarySearchEpsilon as a$, SplineMode as a0, Spline as a1, SystemPriority as a2, easing as a3, math as a4, geometry as a5, quat as a6, color as a7, HALF_PI as a8, TWO_PI as a9, deserializeTag as aA, serializeTag as aB, getSerializationMetadata as aC, EditorExtendable as aD, RealCurve as aE, RealInterpolationMode as aF, ExtrapolationMode as aG, TangentWeightMode as aH, QuatCurve as aI, QuatInterpolationMode as aJ, ObjectCurve as aK, ColorKey as aL, AlphaKey as aM, Gradient as aN, bezier as aO, bezierByTime as aP, editable as aQ, tooltip as aR, visible as aS, displayName as aT, displayOrder as aU, range as aV, rangeStep as aW, slide as aX, disallowAnimation as aY, EasingMethod as aZ, binarySearch as a_, equals as aa, lerp as ab, setRandGenerator as ac, randomRange as ad, randomRangeInt as ae, pseudoRandom as af, pseudoRandomRange as ag, pseudoRandomRangeInt as ah, repeat as ai, pingPong as aj, inverseLerp as ak, absMaxComponent as al, absMax as am, enumerableProps as an, floatToHalf as ao, MATH_FLOAT_ARRAY as ap, MathBase as aq, setDefaultLogTimes as ar, deprecateModuleExportedName as as, __checkObsolete__ as at, __checkObsoleteInNamespace__ as au, WorldNode3DToLocalNodeUI as av, WorldNode3DToWorldNodeUI as aw, convertUtils as ax, _decorator as ay, CompactValueTypeArray as az, applyDecoratedInitializer as b, binarySearchBy as b0, string as b1, Frustum as b2, packRGBE as b3, WrapModeMask as b4, uniquelyReferenced as b5, editorOnly as b6, constructLegacyCurveAndConvert as b7, AnimationCurve as b8, _float as b9, getOrCreatePropertyStash as ba, ccclass as c, disallowMultiple as d, editorExtrasTag as e, Vec3 as f, Vec4 as g, toRadian as h, replaceProperty as i, removeProperty as j, formerlySerializedAs as k, executionOrder as l, Rect as m, sys as n, screen$1 as o, property as p, preTransforms as q, requireComponent as r, serializable as s, type as t, v3 as u, v2$1 as v, mat4 as w, size as x, rect as y, v4 as z };
//# sourceMappingURL=index-uXI1_UMk.js.map
