import { l as legacyCC } from './global-exports-DnCP_14L.js';
import './_virtual_internal_constants-DWlew7Dp.js';

var AffineTransform = function () {
  function AffineTransform(a, b, c, d, tx, ty) {
    if (a === void 0) {
      a = 1;
    }
    if (b === void 0) {
      b = 0;
    }
    if (c === void 0) {
      c = 0;
    }
    if (d === void 0) {
      d = 1;
    }
    if (tx === void 0) {
      tx = 0;
    }
    if (ty === void 0) {
      ty = 0;
    }
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }
  AffineTransform.identity = function identity() {
    return new AffineTransform();
  };
  AffineTransform.clone = function clone(affineTransform) {
    return new AffineTransform(affineTransform.a, affineTransform.b, affineTransform.c, affineTransform.d, affineTransform.tx, affineTransform.ty);
  };
  AffineTransform.concat = function concat(out, t1, t2) {
    var a = t1.a;
    var b = t1.b;
    var c = t1.c;
    var d = t1.d;
    var tx = t1.tx;
    var ty = t1.ty;
    out.a = a * t2.a + b * t2.c;
    out.b = a * t2.b + b * t2.d;
    out.c = c * t2.a + d * t2.c;
    out.d = c * t2.b + d * t2.d;
    out.tx = tx * t2.a + ty * t2.c + t2.tx;
    out.ty = tx * t2.b + ty * t2.d + t2.ty;
  };
  AffineTransform.invert = function invert(out, t) {
    var determinant = 1 / (t.a * t.d - t.b * t.c);
    out.a = determinant * t.d;
    out.b = -determinant * t.b;
    out.c = -determinant * t.c;
    out.d = determinant * t.a;
    out.tx = determinant * (t.c * t.ty - t.d * t.tx);
    out.ty = determinant * (t.b * t.tx - t.a * t.ty);
  };
  AffineTransform.fromMat4 = function fromMat4(out, mat) {
    out.a = mat.m00;
    out.b = mat.m01;
    out.c = mat.m04;
    out.d = mat.m05;
    out.tx = mat.m12;
    out.ty = mat.m13;
  };
  AffineTransform.transformVec2 = function transformVec2(out, point, transOrY, t) {
    var x;
    var y;
    if (!t) {
      t = transOrY;
      x = point.x;
      y = point.y;
    } else {
      x = point;
      y = transOrY;
    }
    out.x = t.a * x + t.c * y + t.tx;
    out.y = t.b * x + t.d * y + t.ty;
  };
  AffineTransform.transformSize = function transformSize(out, size, t) {
    out.width = t.a * size.width + t.c * size.height;
    out.height = t.b * size.width + t.d * size.height;
  };
  AffineTransform.transformRect = function transformRect(out, rect, t) {
    var or = rect.x + rect.width;
    var ot = rect.y + rect.height;
    var lbx = t.a * rect.x + t.c * rect.y + t.tx;
    var lby = t.b * rect.x + t.d * rect.y + t.ty;
    var rbx = t.a * or + t.c * rect.y + t.tx;
    var rby = t.b * or + t.d * rect.y + t.ty;
    var ltx = t.a * rect.x + t.c * ot + t.tx;
    var lty = t.b * rect.x + t.d * ot + t.ty;
    var rtx = t.a * or + t.c * ot + t.tx;
    var rty = t.b * or + t.d * ot + t.ty;
    var minX = Math.min(lbx, rbx, ltx, rtx);
    var maxX = Math.max(lbx, rbx, ltx, rtx);
    var minY = Math.min(lby, rby, lty, rty);
    var maxY = Math.max(lby, rby, lty, rty);
    out.x = minX;
    out.y = minY;
    out.width = maxX - minX;
    out.height = maxY - minY;
  };
  AffineTransform.transformObb = function transformObb(out_bl, out_tl, out_tr, out_br, rect, anAffineTransform, flipY) {
    if (flipY === void 0) {
      flipY = true;
    }
    var tx = anAffineTransform.a * rect.x + anAffineTransform.c * rect.y + anAffineTransform.tx;
    var ty = anAffineTransform.b * rect.x + anAffineTransform.d * rect.y + anAffineTransform.ty;
    var xa = anAffineTransform.a * rect.width;
    var xb = anAffineTransform.b * rect.width;
    var yc = anAffineTransform.c * rect.height;
    var yd = anAffineTransform.d * rect.height;
    if (flipY) {
      out_tl.x = tx;
      out_tl.y = ty;
      out_tr.x = xa + tx;
      out_tr.y = xb + ty;
      out_bl.x = yc + tx;
      out_bl.y = yd + ty;
      out_br.x = xa + yc + tx;
      out_br.y = xb + yd + ty;
    } else {
      out_bl.x = tx;
      out_bl.y = ty;
      out_br.x = xa + tx;
      out_br.y = xb + ty;
      out_tl.x = yc + tx;
      out_tl.y = yd + ty;
      out_tr.x = xa + yc + tx;
      out_tr.y = xb + yd + ty;
    }
  };
  return AffineTransform;
}();
legacyCC.AffineTransform = AffineTransform;

export { AffineTransform };
//# sourceMappingURL=affine-transform.js.map
