import { l as _createForOfIteratorHelperLoose } from './gc-object-CShF5lzx.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import './global-exports-DnCP_14L.js';

var spineWasm = function () {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  return function (spineWasm) {
    if (spineWasm === void 0) {
      spineWasm = {};
    }
    var f;
    f || (f = typeof spineWasm !== 'undefined' ? spineWasm : {});
    var aa, ca;
    f.ready = new Promise(function (a, b) {
      aa = a;
      ca = b;
    });
    var da = Object.assign({}, f),
      p = "";
    "undefined" != typeof document && document.currentScript && (p = document.currentScript.src);
    _scriptDir && (p = _scriptDir);
    0 !== p.indexOf("blob:") ? p = p.substr(0, p.replace(/[?#].*/, "").lastIndexOf("/") + 1) : p = "";
    var ea = f.print || console.log.bind(console),
      v = f.printErr || console.error.bind(console);
    Object.assign(f, da);
    da = null;
    var w;
    f.wasmBinary && (w = f.wasmBinary);
    f.noExitRuntime || true;
    "object" != typeof WebAssembly && _z("no native wasm support detected");
    var fa,
      ha = false,
      ia,
      A,
      ja,
      ka,
      B,
      C,
      la,
      ma;
    function na() {
      var a = fa.buffer;
      f.HEAP8 = ia = new Int8Array(a);
      f.HEAP16 = ja = new Int16Array(a);
      f.HEAP32 = B = new Int32Array(a);
      f.HEAPU8 = A = new Uint8Array(a);
      f.HEAPU16 = ka = new Uint16Array(a);
      f.HEAPU32 = C = new Uint32Array(a);
      f.HEAPF32 = la = new Float32Array(a);
      f.HEAPF64 = ma = new Float64Array(a);
    }
    var oa,
      pa = [],
      qa = [],
      ra = [];
    function sa() {
      var a = f.preRun.shift();
      pa.unshift(a);
    }
    var D = 0,
      E = null;
    function _z(a) {
      if (f.onAbort) f.onAbort(a);
      a = "Aborted(" + a + ")";
      v(a);
      ha = true;
      a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
      ca(a);
      throw a;
    }
    function ua(a) {
      return a.startsWith("data:application/octet-stream;base64,");
    }
    var G;
    G = "spine.wasm";
    if (!ua(G)) {
      var va = G;
      G = f.locateFile ? f.locateFile(va, p) : p + va;
    }
    function wa(a) {
      try {
        if (a == G && w) return new Uint8Array(w);
        throw "both async and sync fetching of the wasm failed";
      } catch (b) {
        _z(b);
      }
    }
    function xa(a) {
      return w || "function" != typeof fetch ? Promise.resolve().then(function () {
        return wa(a);
      }) : fetch(a, {
        credentials: "same-origin"
      }).then(function (b) {
        if (!b.ok) throw "failed to load wasm binary file at '" + a + "'";
        return b.arrayBuffer();
      })["catch"](function () {
        return wa(a);
      });
    }
    function ya(a, b, c) {
      return xa(a).then(function (d) {
        return WebAssembly.instantiate(d, b);
      }).then(function (d) {
        return d;
      }).then(c, function (d) {
        v("failed to asynchronously prepare wasm: " + d);
        _z(d);
      });
    }
    function za(a, b) {
      var c = G;
      return w || "function" != typeof WebAssembly.instantiateStreaming || ua(c) || "function" != typeof fetch ? ya(c, a, b) : fetch(c, {
        credentials: "same-origin"
      }).then(function (d) {
        return WebAssembly.instantiateStreaming(d, a).then(b, function (e) {
          v("wasm streaming compile failed: " + e);
          v("falling back to ArrayBuffer instantiation");
          return ya(c, a, b);
        });
      });
    }
    var Ba = {
      26344: function _(a) {
        console.warn("[Spine]", a ? Aa(A, a) : "");
      }
    };
    function Ca(a) {
      for (; 0 < a.length;) a.shift()(f);
    }
    function Da(a) {
      switch (a) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + a);
      }
    }
    var Ea = void 0;
    function H(a) {
      for (var b = ""; A[a];) b += Ea[A[a++]];
      return b;
    }
    var I = {},
      J = {},
      Fa = {};
    function Ga(a) {
      if (void 0 === a) return "_unknown";
      a = a.replace(/[^a-zA-Z0-9_]/g, "$");
      var b = a.charCodeAt(0);
      return 48 <= b && 57 >= b ? "_" + a : a;
    }
    function Ha(a, b) {
      var _a$a;
      a = Ga(a);
      return (_a$a = {}, _a$a[a] = function () {
        return b.apply(this, arguments);
      }, _a$a)[a];
    }
    function Ia(a) {
      var b = Error,
        c = Ha(a, function (d) {
          this.name = a;
          this.message = d;
          d = Error(d).stack;
          void 0 !== d && (this.stack = this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""));
        });
      c.prototype = Object.create(b.prototype);
      c.prototype.constructor = c;
      c.prototype.toString = function () {
        return void 0 === this.message ? this.name : this.name + ": " + this.message;
      };
      return c;
    }
    var K = void 0;
    function L(a) {
      throw new K(a);
    }
    var Ja = void 0;
    function Ka(a) {
      throw new Ja(a);
    }
    function N(a, b, c) {
      function d(g) {
        g = c(g);
        g.length !== a.length && Ka("Mismatched type converter count");
        for (var l = 0; l < a.length; ++l) O(a[l], g[l]);
      }
      a.forEach(function (g) {
        Fa[g] = b;
      });
      var e = Array(b.length),
        h = [],
        k = 0;
      b.forEach(function (g, l) {
        J.hasOwnProperty(g) ? e[l] = J[g] : (h.push(g), I.hasOwnProperty(g) || (I[g] = []), I[g].push(function () {
          e[l] = J[g];
          ++k;
          k === h.length && d(e);
        }));
      });
      0 === h.length && d(e);
    }
    function O(a, b) {
      var c = {};
      if (!("argPackAdvance" in b)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var d = b.name;
      a || L("type \"" + d + "\" must have a positive integer typeid pointer");
      if (J.hasOwnProperty(a)) {
        if (c.ta) return;
        L("Cannot register type '" + d + "' twice");
      }
      J[a] = b;
      delete Fa[a];
      I.hasOwnProperty(a) && (b = I[a], delete I[a], b.forEach(function (e) {
        return e();
      }));
    }
    function La(a) {
      L(a.I.L.J.name + " instance already deleted");
    }
    var Ma = false;
    function Na() {}
    function Oa(a) {
      --a.count.value;
      0 === a.count.value && (a.O ? a.P.V(a.O) : a.L.J.V(a.K));
    }
    function Pa(a, b, c) {
      if (b === c) return a;
      if (void 0 === c.M) return null;
      a = Pa(a, b, c.M);
      return null === a ? null : c.ka(a);
    }
    var Qa = {},
      P = [];
    function Ra() {
      for (; P.length;) {
        var a = P.pop();
        a.I.X = false;
        a["delete"]();
      }
    }
    var Q = void 0,
      R = {};
    function Sa(a, b) {
      for (void 0 === b && L("ptr should not be undefined"); a.M;) b = a.Z(b), a = a.M;
      return R[b];
    }
    function Ta(a, b) {
      b.L && b.K || Ka("makeClassHandle requires ptr and ptrType");
      !!b.P !== !!b.O && Ka("Both smartPtrType and smartPtr must be specified");
      b.count = {
        value: 1
      };
      return S(Object.create(a, {
        I: {
          value: b
        }
      }));
    }
    function S(a) {
      if ("undefined" === typeof FinalizationRegistry) return S = function S(b) {
        return b;
      }, a;
      Ma = new FinalizationRegistry(function (b) {
        Oa(b.I);
      });
      S = function S(b) {
        var c = b.I;
        c.O && Ma.register(b, {
          I: c
        }, b);
        return b;
      };
      Na = function Na(b) {
        Ma.unregister(b);
      };
      return S(a);
    }
    function T() {}
    function Ua(a, b, c) {
      if (void 0 === a[b].N) {
        var d = a[b];
        a[b] = function () {
          a[b].N.hasOwnProperty(arguments.length) || L("Function '" + c + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + a[b].N + ")!");
          return a[b].N[arguments.length].apply(this, arguments);
        };
        a[b].N = [];
        a[b].N[d.W] = d;
      }
    }
    function Va(a, b) {
      f.hasOwnProperty(a) ? (L("Cannot register public name '" + a + "' twice"), Ua(f, a, a), f.hasOwnProperty(void 0) && L("Cannot register multiple overloads of a function with the same number of arguments (undefined)!"), f[a].N[void 0] = b) : f[a] = b;
    }
    function Wa(a, b, c, d, e, h, k, g) {
      this.name = a;
      this.constructor = b;
      this.T = c;
      this.V = d;
      this.M = e;
      this.la = h;
      this.Z = k;
      this.ka = g;
      this.oa = [];
    }
    function Xa(a, b, c) {
      for (; b !== c;) b.Z || L("Expected null or instance of " + c.name + ", got an instance of " + b.name), a = b.Z(a), b = b.M;
      return a;
    }
    function Ya(a, b) {
      if (null === b) return this.ca && L("null is not a valid " + this.name), 0;
      b.I || L("Cannot pass \"" + Za(b) + "\" as a " + this.name);
      b.I.K || L("Cannot pass deleted object as a pointer of type " + this.name);
      return Xa(b.I.K, b.I.L.J, this.J);
    }
    function $a(a, b) {
      if (null === b) {
        this.ca && L("null is not a valid " + this.name);
        if (this.ba) {
          var c = this.pa();
          null !== a && a.push(this.V, c);
          return c;
        }
        return 0;
      }
      b.I || L("Cannot pass \"" + Za(b) + "\" as a " + this.name);
      b.I.K || L("Cannot pass deleted object as a pointer of type " + this.name);
      !this.aa && b.I.L.aa && L("Cannot convert argument of type " + (b.I.P ? b.I.P.name : b.I.L.name) + " to parameter type " + this.name);
      c = Xa(b.I.K, b.I.L.J, this.J);
      if (this.ba) switch (void 0 === b.I.O && L("Passing raw pointer to smart pointer is illegal"), this.sa) {
        case 0:
          b.I.P === this ? c = b.I.O : L("Cannot convert argument of type " + (b.I.P ? b.I.P.name : b.I.L.name) + " to parameter type " + this.name);
          break;
        case 1:
          c = b.I.O;
          break;
        case 2:
          if (b.I.P === this) c = b.I.O;else {
            var d = b.clone();
            c = this.qa(c, U(function () {
              d["delete"]();
            }));
            null !== a && a.push(this.V, c);
          }
          break;
        default:
          L("Unsupporting sharing policy");
      }
      return c;
    }
    function ab(a, b) {
      if (null === b) return this.ca && L("null is not a valid " + this.name), 0;
      b.I || L("Cannot pass \"" + Za(b) + "\" as a " + this.name);
      b.I.K || L("Cannot pass deleted object as a pointer of type " + this.name);
      b.I.L.aa && L("Cannot convert argument of type " + b.I.L.name + " to parameter type " + this.name);
      return Xa(b.I.K, b.I.L.J, this.J);
    }
    function bb(a) {
      return this.fromWireType(B[a >> 2]);
    }
    function V(a, b, c, d) {
      this.name = a;
      this.J = b;
      this.ca = c;
      this.aa = d;
      this.ba = false;
      this.V = this.qa = this.pa = this.ga = this.sa = this.na = void 0;
      void 0 !== b.M ? this.toWireType = $a : (this.toWireType = d ? Ya : ab, this.S = null);
    }
    function cb(a, b) {
      f.hasOwnProperty(a) || Ka("Replacing nonexistant public symbol");
      f[a] = b;
      f[a].W = void 0;
    }
    function db(a, b) {
      var c = [];
      return function () {
        c.length = 0;
        Object.assign(c, arguments);
        if (a.includes("j")) {
          var d = f["dynCall_" + a];
          d = c && c.length ? d.apply(null, [b].concat(c)) : d.call(null, b);
        } else d = oa.get(b).apply(null, c);
        return d;
      };
    }
    function W(a, b) {
      a = H(a);
      var c = a.includes("j") ? db(a, b) : oa.get(b);
      "function" != typeof c && L("unknown function pointer with signature " + a + ": " + b);
      return c;
    }
    var eb = void 0;
    function fb(a) {
      a = gb(a);
      var b = H(a);
      X(a);
      return b;
    }
    function Y(a, b) {
      function c(h) {
        e[h] || J[h] || (Fa[h] ? Fa[h].forEach(c) : (d.push(h), e[h] = true));
      }
      var d = [],
        e = {};
      b.forEach(c);
      throw new eb(a + ": " + d.map(fb).join([", "]));
    }
    function hb(a) {
      for (; a.length;) {
        var b = a.pop();
        a.pop()(b);
      }
    }
    function jb(a, b, c, d, e) {
      var h = b.length;
      2 > h && L("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var k = null !== b[1] && null !== c,
        g = false;
      for (c = 1; c < b.length; ++c) if (null !== b[c] && void 0 === b[c].S) {
        g = true;
        break;
      }
      var l = "void" !== b[0].name,
        n = h - 2,
        m = Array(n),
        q = [],
        r = [];
      return function () {
        arguments.length !== n && L("function " + a + " called with " + arguments.length + " arguments, expected " + n + " args!");
        r.length = 0;
        q.length = k ? 2 : 1;
        q[0] = e;
        if (k) {
          var u = b[1].toWireType(r, this);
          q[1] = u;
        }
        for (var t = 0; t < n; ++t) m[t] = b[t + 2].toWireType(r, arguments[t]), q.push(m[t]);
        t = d.apply(null, q);
        if (g) hb(r);else for (var x = k ? 1 : 2; x < b.length; x++) {
          var F = 1 === x ? u : m[x - 2];
          null !== b[x].S && b[x].S(F);
        }
        u = l ? b[0].fromWireType(t) : void 0;
        return u;
      };
    }
    function kb(a, b) {
      for (var c = [], d = 0; d < a; d++) c.push(C[b + 4 * d >> 2]);
      return c;
    }
    function lb(a, b, c) {
      a instanceof Object || L(c + " with invalid \"this\": " + a);
      a instanceof b.J.constructor || L(c + " incompatible with \"this\" of type " + a.constructor.name);
      a.I.K || L("cannot call emscripten binding method " + c + " on deleted object");
      return Xa(a.I.K, a.I.L.J, b.J);
    }
    var Z = new function () {
      this.R = [void 0];
      this.da = [];
      this.get = function (a) {
        return this.R[a];
      };
      this.has = function (a) {
        return void 0 !== this.R[a];
      };
      this.ha = function (a) {
        var b = this.da.pop() || this.R.length;
        this.R[b] = a;
        return b;
      };
      this.ia = function (a) {
        this.R[a] = void 0;
        this.da.push(a);
      };
    }();
    function mb(a) {
      a >= Z.ea && 0 === --Z.get(a).ra && Z.ia(a);
    }
    var nb = function nb(a) {
        a || L("Cannot use deleted val. handle = " + a);
        return Z.get(a).value;
      },
      U = function U(a) {
        switch (a) {
          case void 0:
            return 1;
          case null:
            return 2;
          case true:
            return 3;
          case false:
            return 4;
          default:
            return Z.ha({
              ra: 1,
              value: a
            });
        }
      };
    function Za(a) {
      if (null === a) return "null";
      var b = typeof a;
      return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
    }
    function ob(a, b) {
      switch (b) {
        case 2:
          return function (c) {
            return this.fromWireType(la[c >> 2]);
          };
        case 3:
          return function (c) {
            return this.fromWireType(ma[c >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + a);
      }
    }
    function pb(a, b, c) {
      switch (b) {
        case 0:
          return c ? function (d) {
            return ia[d];
          } : function (d) {
            return A[d];
          };
        case 1:
          return c ? function (d) {
            return ja[d >> 1];
          } : function (d) {
            return ka[d >> 1];
          };
        case 2:
          return c ? function (d) {
            return B[d >> 2];
          } : function (d) {
            return C[d >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + a);
      }
    }
    var qb = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
    function Aa(a, b, c) {
      var d = b + c;
      for (c = b; a[c] && !(c >= d);) ++c;
      if (16 < c - b && a.buffer && qb) return qb.decode(a.subarray(b, c));
      for (d = ""; b < c;) {
        var e = a[b++];
        if (e & 128) {
          var h = a[b++] & 63;
          if (192 == (e & 224)) d += String.fromCharCode((e & 31) << 6 | h);else {
            var k = a[b++] & 63;
            e = 224 == (e & 240) ? (e & 15) << 12 | h << 6 | k : (e & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
            65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
          }
        } else d += String.fromCharCode(e);
      }
      return d;
    }
    function rb(a, b) {
      var c = J[a];
      void 0 === c && L(b + " has unknown type " + fb(a));
      return c;
    }
    var sb = {},
      tb = [],
      ub = [null, [], []];
    function vb() {
      var a = f.SpineWasmUtil,
        b = a.getCurrentListenerID(),
        c = a.getCurrentTrackEntry(),
        d = a.getCurrentEvent();
      a = a.getCurrentEventType();
      globalThis.TrackEntryListeners.emitListener(b, c, d, a);
    }
    f._spineListenerCallBackFromJS = vb;
    function wb() {
      var a = f.SpineWasmUtil,
        b = a.getCurrentListenerID(),
        c = a.getCurrentEventType(),
        d = a.getCurrentTrackEntry();
      a = a.getCurrentEvent();
      globalThis.TrackEntryListeners.emitTrackEntryListener(b, d, a, c);
    }
    f._spineTrackListenerCallback = wb;
    for (var xb = Array(256), yb = 0; 256 > yb; ++yb) xb[yb] = String.fromCharCode(yb);
    Ea = xb;
    K = f.BindingError = Ia("BindingError");
    Ja = f.InternalError = Ia("InternalError");
    T.prototype.isAliasOf = function (a) {
      if (!(this instanceof T && a instanceof T)) return false;
      var b = this.I.L.J,
        c = this.I.K,
        d = a.I.L.J;
      for (a = a.I.K; b.M;) c = b.Z(c), b = b.M;
      for (; d.M;) a = d.Z(a), d = d.M;
      return b === d && c === a;
    };
    T.prototype.clone = function () {
      this.I.K || La(this);
      if (this.I.Y) return this.I.count.value += 1, this;
      var a = S,
        b = Object,
        c = b.create,
        d = Object.getPrototypeOf(this),
        e = this.I;
      a = a(c.call(b, d, {
        I: {
          value: {
            count: e.count,
            X: e.X,
            Y: e.Y,
            K: e.K,
            L: e.L,
            O: e.O,
            P: e.P
          }
        }
      }));
      a.I.count.value += 1;
      a.I.X = false;
      return a;
    };
    T.prototype["delete"] = function () {
      this.I.K || La(this);
      this.I.X && !this.I.Y && L("Object already scheduled for deletion");
      Na(this);
      Oa(this.I);
      this.I.Y || (this.I.O = void 0, this.I.K = void 0);
    };
    T.prototype.isDeleted = function () {
      return !this.I.K;
    };
    T.prototype.deleteLater = function () {
      this.I.K || La(this);
      this.I.X && !this.I.Y && L("Object already scheduled for deletion");
      P.push(this);
      1 === P.length && Q && Q(Ra);
      this.I.X = true;
      return this;
    };
    f.getInheritedInstanceCount = function () {
      return Object.keys(R).length;
    };
    f.getLiveInheritedInstances = function () {
      var a = [],
        b;
      for (b in R) R.hasOwnProperty(b) && a.push(R[b]);
      return a;
    };
    f.flushPendingDeletes = Ra;
    f.setDelayFunction = function (a) {
      Q = a;
      P.length && Q && Q(Ra);
    };
    V.prototype.ma = function (a) {
      this.ga && (a = this.ga(a));
      return a;
    };
    V.prototype.fa = function (a) {
      this.V && this.V(a);
    };
    V.prototype.argPackAdvance = 8;
    V.prototype.readValueFromPointer = bb;
    V.prototype.deleteObject = function (a) {
      if (null !== a) a["delete"]();
    };
    V.prototype.fromWireType = function (a) {
      function b() {
        return this.ba ? Ta(this.J.T, {
          L: this.na,
          K: c,
          P: this,
          O: a
        }) : Ta(this.J.T, {
          L: this,
          K: a
        });
      }
      var c = this.ma(a);
      if (!c) return this.fa(a), null;
      var d = Sa(this.J, c);
      if (void 0 !== d) {
        if (0 === d.I.count.value) return d.I.K = c, d.I.O = a, d.clone();
        d = d.clone();
        this.fa(a);
        return d;
      }
      d = this.J.la(c);
      d = Qa[d];
      if (!d) return b.call(this);
      d = this.aa ? d.ja : d.pointerType;
      var e = Pa(c, this.J, d.J);
      return null === e ? b.call(this) : this.ba ? Ta(d.J.T, {
        L: d,
        K: e,
        P: this,
        O: a
      }) : Ta(d.J.T, {
        L: d,
        K: e
      });
    };
    eb = f.UnboundTypeError = Ia("UnboundTypeError");
    Z.R.push({
      value: void 0
    }, {
      value: null
    }, {
      value: true
    }, {
      value: false
    });
    Z.ea = Z.R.length;
    f.count_emval_handles = function () {
      for (var a = 0, b = Z.ea; b < Z.R.length; ++b) void 0 !== Z.R[b] && ++a;
      return a;
    };
    var Ab = {
      z: function z() {
        v("missing function: _ZN5spine19getDefaultExtensionEv");
        _z(-1);
      },
      q: function q() {},
      u: function u(a, b, c, d, e) {
        var h = Da(c);
        b = H(b);
        O(a, {
          name: b,
          fromWireType: function fromWireType(k) {
            return !!k;
          },
          toWireType: function toWireType(k, g) {
            return g ? d : e;
          },
          argPackAdvance: 8,
          readValueFromPointer: function readValueFromPointer(k) {
            if (1 === c) var g = ia;else if (2 === c) g = ja;else if (4 === c) g = B;else throw new TypeError("Unknown boolean type size: " + b);
            return this.fromWireType(g[k >> h]);
          },
          S: null
        });
      },
      c: function c(a, b, _c, d, e, h, k, g, l, n, m, q, r) {
        m = H(m);
        h = W(e, h);
        g && (g = W(k, g));
        n && (n = W(l, n));
        r = W(q, r);
        var u = Ga(m);
        Va(u, function () {
          Y("Cannot construct " + m + " due to unbound types", [d]);
        });
        N([a, b, _c], d ? [d] : [], function (t) {
          t = t[0];
          if (d) {
            var x = t.J;
            var F = x.T;
          } else F = T.prototype;
          t = Ha(u, function () {
            if (Object.getPrototypeOf(this) !== M) throw new K("Use 'new' to construct " + m);
            if (void 0 === y.U) throw new K(m + " has no accessible constructor");
            var ib = y.U[arguments.length];
            if (void 0 === ib) throw new K("Tried to invoke ctor of " + m + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(y.U).toString() + ") parameters instead!");
            return ib.apply(this, arguments);
          });
          var M = Object.create(F, {
            constructor: {
              value: t
            }
          });
          t.prototype = M;
          var y = new Wa(m, t, M, r, x, h, g, n);
          y.M && (void 0 === y.M.$ && (y.M.$ = []), y.M.$.push(y));
          x = new V(m, y, true, false);
          F = new V(m + "*", y, false, false);
          var ba = new V(m + " const*", y, false, true);
          Qa[a] = {
            pointerType: F,
            ja: ba
          };
          cb(u, t);
          return [x, F, ba];
        });
      },
      g: function g(a, b, c, d, e, h, k) {
        var g = kb(c, d);
        b = H(b);
        h = W(e, h);
        N([], [a], function (l) {
          function n() {
            Y("Cannot call " + m + " due to unbound types", g);
          }
          l = l[0];
          var m = l.name + "." + b;
          b.startsWith("@@") && (b = Symbol[b.substring(2)]);
          var q = l.J.constructor;
          void 0 === q[b] ? (n.W = c - 1, q[b] = n) : (Ua(q, b, m), q[b].N[c - 1] = n);
          N([], g, function (r) {
            r = jb(m, [r[0], null].concat(r.slice(1)), null, h, k);
            void 0 === q[b].N ? (r.W = c - 1, q[b] = r) : q[b].N[c - 1] = r;
            if (l.J.$) {
              for (var _iterator = _createForOfIteratorHelperLoose(l.J.$), _step; !(_step = _iterator()).done;) {
                var u = _step.value;
                u.constructor.hasOwnProperty(b) || (u.constructor[b] = r);
              }
            }
            return [];
          });
          return [];
        });
      },
      h: function h(a, b, c, d, e, _h, k, g) {
        b = H(b);
        _h = W(e, _h);
        N([], [a], function (l) {
          l = l[0];
          var n = l.name + "." + b,
            m = {
              get: function get() {
                Y("Cannot access " + n + " due to unbound types", [c]);
              },
              enumerable: true,
              configurable: true
            };
          m.set = g ? function () {
            Y("Cannot access " + n + " due to unbound types", [c]);
          } : function () {
            L(n + " is a read-only property");
          };
          Object.defineProperty(l.J.constructor, b, m);
          N([], [c], function (q) {
            q = q[0];
            var r = {
              get: function get() {
                return q.fromWireType(_h(d));
              },
              enumerable: true
            };
            g && (g = W(k, g), r.set = function (u) {
              var t = [];
              g(d, q.toWireType(t, u));
              hb(t);
            });
            Object.defineProperty(l.J.constructor, b, r);
            return [];
          });
          return [];
        });
      },
      d: function d(a, b, c, _d, e, h) {
        0 < b || _z();
        var k = kb(b, c);
        e = W(_d, e);
        N([], [a], function (g) {
          g = g[0];
          var l = "constructor " + g.name;
          void 0 === g.J.U && (g.J.U = []);
          if (void 0 !== g.J.U[b - 1]) throw new K("Cannot register multiple constructors with identical number of parameters (" + (b - 1) + ") for class '" + g.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
          g.J.U[b - 1] = function () {
            Y("Cannot construct " + g.name + " due to unbound types", k);
          };
          N([], k, function (n) {
            n.splice(1, 0, null);
            g.J.U[b - 1] = jb(l, n, null, e, h);
            return [];
          });
          return [];
        });
      },
      a: function a(_a, b, c, d, e, h, k, g) {
        var l = kb(c, d);
        b = H(b);
        h = W(e, h);
        N([], [_a], function (n) {
          function m() {
            Y("Cannot call " + q + " due to unbound types", l);
          }
          n = n[0];
          var q = n.name + "." + b;
          b.startsWith("@@") && (b = Symbol[b.substring(2)]);
          g && n.J.oa.push(b);
          var r = n.J.T,
            u = r[b];
          void 0 === u || void 0 === u.N && u.className !== n.name && u.W === c - 2 ? (m.W = c - 2, m.className = n.name, r[b] = m) : (Ua(r, b, q), r[b].N[c - 2] = m);
          N([], l, function (t) {
            t = jb(q, t, n, h, k);
            void 0 === r[b].N ? (t.W = c - 2, r[b] = t) : r[b].N[c - 2] = t;
            return [];
          });
          return [];
        });
      },
      b: function b(a, _b, c, d, e, h, k, g, l, n) {
        _b = H(_b);
        e = W(d, e);
        N([], [a], function (m) {
          m = m[0];
          var q = m.name + "." + _b,
            r = {
              get: function get() {
                Y("Cannot access " + q + " due to unbound types", [c, k]);
              },
              enumerable: true,
              configurable: true
            };
          r.set = l ? function () {
            Y("Cannot access " + q + " due to unbound types", [c, k]);
          } : function () {
            L(q + " is a read-only property");
          };
          Object.defineProperty(m.J.T, _b, r);
          N([], l ? [c, k] : [c], function (u) {
            var t = u[0],
              x = {
                get: function get() {
                  var M = lb(this, m, q + " getter");
                  return t.fromWireType(e(h, M));
                },
                enumerable: true
              };
            if (l) {
              l = W(g, l);
              var F = u[1];
              x.set = function (M) {
                var y = lb(this, m, q + " setter"),
                  ba = [];
                l(n, y, F.toWireType(ba, M));
                hb(ba);
              };
            }
            Object.defineProperty(m.J.T, _b, x);
            return [];
          });
          return [];
        });
      },
      t: function t(a, b) {
        b = H(b);
        O(a, {
          name: b,
          fromWireType: function fromWireType(c) {
            var d = nb(c);
            mb(c);
            return d;
          },
          toWireType: function toWireType(c, d) {
            return U(d);
          },
          argPackAdvance: 8,
          readValueFromPointer: bb,
          S: null
        });
      },
      o: function o(a, b, c) {
        c = Da(c);
        b = H(b);
        O(a, {
          name: b,
          fromWireType: function fromWireType(d) {
            return d;
          },
          toWireType: function toWireType(d, e) {
            return e;
          },
          argPackAdvance: 8,
          readValueFromPointer: ob(b, c),
          S: null
        });
      },
      f: function f(a, b, c, d, e) {
        b = H(b);
        -1 === e && (e = 4294967295);
        e = Da(c);
        var h = function h(g) {
          return g;
        };
        if (0 === d) {
          var k = 32 - 8 * c;
          h = function h(g) {
            return g << k >>> k;
          };
        }
        c = b.includes("unsigned") ? function (g, l) {
          return l >>> 0;
        } : function (g, l) {
          return l;
        };
        O(a, {
          name: b,
          fromWireType: h,
          toWireType: c,
          argPackAdvance: 8,
          readValueFromPointer: pb(b, e, 0 !== d),
          S: null
        });
      },
      y: function y(a, b) {
        b = H(b);
        var c = "std::string" === b;
        O(a, {
          name: b,
          fromWireType: function fromWireType(d) {
            var e = C[d >> 2],
              h = d + 4;
            if (c) for (var k = h, g = 0; g <= e; ++g) {
              var l = h + g;
              if (g == e || 0 == A[l]) {
                k = k ? Aa(A, k, l - k) : "";
                if (void 0 === n) var n = k;else n += String.fromCharCode(0), n += k;
                k = l + 1;
              }
            } else {
              n = Array(e);
              for (g = 0; g < e; ++g) n[g] = String.fromCharCode(A[h + g]);
              n = n.join("");
            }
            X(d);
            return n;
          },
          toWireType: function toWireType(d, e) {
            e instanceof ArrayBuffer && (e = new Uint8Array(e));
            var h,
              k = "string" == typeof e;
            k || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array || L("Cannot pass non-string to std::string");
            var g;
            if (c && k) for (h = g = 0; h < e.length; ++h) {
              var l = e.charCodeAt(h);
              127 >= l ? g++ : 2047 >= l ? g += 2 : 55296 <= l && 57343 >= l ? (g += 4, ++h) : g += 3;
            } else g = e.length;
            h = g;
            g = zb(4 + h + 1);
            l = g + 4;
            C[g >> 2] = h;
            if (c && k) {
              if (k = l, l = h + 1, h = A, 0 < l) {
                l = k + l - 1;
                for (var n = 0; n < e.length; ++n) {
                  var m = e.charCodeAt(n);
                  if (55296 <= m && 57343 >= m) {
                    var q = e.charCodeAt(++n);
                    m = 65536 + ((m & 1023) << 10) | q & 1023;
                  }
                  if (127 >= m) {
                    if (k >= l) break;
                    h[k++] = m;
                  } else {
                    if (2047 >= m) {
                      if (k + 1 >= l) break;
                      h[k++] = 192 | m >> 6;
                    } else {
                      if (65535 >= m) {
                        if (k + 2 >= l) break;
                        h[k++] = 224 | m >> 12;
                      } else {
                        if (k + 3 >= l) break;
                        h[k++] = 240 | m >> 18;
                        h[k++] = 128 | m >> 12 & 63;
                      }
                      h[k++] = 128 | m >> 6 & 63;
                    }
                    h[k++] = 128 | m & 63;
                  }
                }
                h[k] = 0;
              }
            } else if (k) for (k = 0; k < h; ++k) n = e.charCodeAt(k), 255 < n && (X(l), L("String has UTF-16 code units that do not fit in 8 bits")), A[l + k] = n;else for (k = 0; k < h; ++k) A[l + k] = e[k];
            null !== d && d.push(X, g);
            return g;
          },
          argPackAdvance: 8,
          readValueFromPointer: bb,
          S: function S(d) {
            X(d);
          }
        });
      },
      v: function v(a, b) {
        b = H(b);
        O(a, {
          ua: true,
          name: b,
          argPackAdvance: 0,
          fromWireType: function fromWireType() {},
          toWireType: function toWireType() {}
        });
      },
      j: function j(a, b, c) {
        a = nb(a);
        b = rb(b, "emval::as");
        var d = [],
          e = U(d);
        C[c >> 2] = e;
        return b.toWireType(d, a);
      },
      e: mb,
      k: function k(a, b) {
        a = nb(a);
        b = nb(b);
        return U(a[b]);
      },
      l: function l(a) {
        var b = sb[a];
        return U(void 0 === b ? H(a) : b);
      },
      i: function i(a) {
        var b = nb(a);
        hb(b);
        mb(a);
      },
      p: function p(a, b) {
        a = rb(a, "_emval_take_value");
        a = a.readValueFromPointer(b);
        return U(a);
      },
      n: function n() {
        _z("");
      },
      m: function m(a, b, c) {
        tb.length = 0;
        var d;
        for (c >>= 2; d = A[b++];) c += 105 != d & c, tb.push(105 == d ? B[c] : ma[c++ >> 1]), ++c;
        return Ba[a].apply(null, tb);
      },
      r: function r(a) {
        var b = A.length;
        a >>>= 0;
        if (2147483648 < a) return false;
        for (var c = 1; 4 >= c; c *= 2) {
          var d = b * (1 + .2 / c);
          d = Math.min(d, a + 100663296);
          var e = Math;
          d = Math.max(a, d);
          a: {
            e = e.min.call(e, 2147483648, d + (65536 - d % 65536) % 65536) - fa.buffer.byteLength + 65535 >>> 16;
            try {
              fa.grow(e);
              na();
              var h = 1;
              break a;
            } catch (k) {}
            h = void 0;
          }
          if (h) return true;
        }
        return false;
      },
      s: function s(a, b, c, d) {
        for (var e = 0, h = 0; h < c; h++) {
          var k = C[b >> 2],
            g = C[b + 4 >> 2];
          b += 8;
          for (var l = 0; l < g; l++) {
            var n = A[k + l],
              m = ub[a];
            0 === n || 10 === n ? ((1 === a ? ea : v)(Aa(m, 0)), m.length = 0) : m.push(n);
          }
          e += g;
        }
        C[d >> 2] = e;
        return 0;
      },
      x: vb,
      w: wb
    };
    (function () {
      function a(c) {
        c = c.exports;
        f.asm = c;
        fa = f.asm.A;
        na();
        oa = f.asm.C;
        qa.unshift(f.asm.B);
        D--;
        f.monitorRunDependencies && f.monitorRunDependencies(D);
        if (0 == D && (E)) {
          var d = E;
          E = null;
          d();
        }
        return c;
      }
      var b = {
        a: Ab
      };
      D++;
      f.monitorRunDependencies && f.monitorRunDependencies(D);
      if (f.instantiateWasm) try {
        return f.instantiateWasm(b, a);
      } catch (c) {
        v("Module.instantiateWasm callback failed with error: " + c), ca(c);
      }
      za(b, function (c) {
        a(c.instance);
      })["catch"](ca);
      return {};
    })();
    function zb() {
      return (zb = f.asm.D).apply(null, arguments);
    }
    function X() {
      return (X = f.asm.E).apply(null, arguments);
    }
    function gb() {
      return (gb = f.asm.F).apply(null, arguments);
    }
    f.__embind_initialize_bindings = function () {
      return (f.__embind_initialize_bindings = f.asm.G).apply(null, arguments);
    };
    f.dynCall_jiji = function () {
      return (f.dynCall_jiji = f.asm.H).apply(null, arguments);
    };
    var Bb;
    E = function Cb() {
      Bb || Db();
      Bb || (E = Cb);
    };
    function Db() {
      function a() {
        if (!Bb && (Bb = true, f.calledRun = true, !ha)) {
          Ca(qa);
          aa(f);
          if (f.onRuntimeInitialized) f.onRuntimeInitialized();
          if (f.postRun) for ("function" == typeof f.postRun && (f.postRun = [f.postRun]); f.postRun.length;) {
            var b = f.postRun.shift();
            ra.unshift(b);
          }
          Ca(ra);
        }
      }
      if (!(0 < D)) {
        if (f.preRun) for ("function" == typeof f.preRun && (f.preRun = [f.preRun]); f.preRun.length;) sa();
        Ca(pa);
        0 < D || (f.setStatus ? (f.setStatus("Running..."), setTimeout(function () {
          setTimeout(function () {
            f.setStatus("");
          }, 1);
          a();
        }, 1)) : a());
      }
    }
    if (f.preInit) for ("function" == typeof f.preInit && (f.preInit = [f.preInit]); 0 < f.preInit.length;) f.preInit.pop()();
    Db();
    return spineWasm.ready;
  };
}();

export { spineWasm as default };
//# sourceMappingURL=spine.wasm-CKlzv4Nk.js.map
