"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.animationCurveDump = void 0;
const real_curve_dump_1 = require("./real-curve-dump");
const cc = __importStar(require("cc"));
// 即将废弃的数据结构
class AnimationCurveDump {
    encode(object, data, opts) {
        real_curve_dump_1.realCurveDump.encode(object._internalCurve, data, opts);
    }
    decode(data, info, dump, opts) {
        const type = cc.js.getClassName(data);
        // 引擎为了兼容旧的接口使用方式，curveRange 内将存在使用 RealCurve 封装的 AnimationCurve，界面只会编辑 RealCurve 的新字段，
        // 此时的 dump 数据不需要还原上去，否则由于 dump 顺序的不可控会覆盖用户已修改的数据
        if (type === 'cc.CurveRange') {
            return;
        }
        // @ts-ignore
        const curve = data[info.key]._internalCurve;
        real_curve_dump_1.realCurveDump.decodeByDump(dump, curve, opts);
    }
}
exports.animationCurveDump = new AnimationCurveDump();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLWN1cnZlLWR1bXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9zY2VuZS1wcm9jZXNzL3NlcnZpY2UvZHVtcC90eXBlcy9hbmltYXRpb24tY3VydmUtZHVtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSx1REFBa0Q7QUFDbEQsdUNBQXlCO0FBR3pCLFlBQVk7QUFDWixNQUFNLGtCQUFrQjtJQUNiLE1BQU0sQ0FBQyxNQUFXLEVBQUUsSUFBZSxFQUFFLElBQVU7UUFDbEQsK0JBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFtQixFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBVTtRQUMvRCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0Qyx1RkFBdUY7UUFDdkYsaURBQWlEO1FBQ2pELElBQUksSUFBSSxLQUFLLGVBQWUsRUFBRSxDQUFDO1lBQzNCLE9BQU87UUFDWCxDQUFDO1FBQ0QsYUFBYTtRQUNiLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQzVDLCtCQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUNKO0FBRVksUUFBQSxrQkFBa0IsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IHsgRHVtcEludGVyZmFjZSB9IGZyb20gJy4vZHVtcC1pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyByZWFsQ3VydmVEdW1wIH0gZnJvbSAnLi9yZWFsLWN1cnZlLWR1bXAnO1xyXG5pbXBvcnQgKiBhcyBjYyBmcm9tICdjYyc7XHJcbmltcG9ydCB7IElQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uLy4uL0B0eXBlcy9wdWJsaWMnO1xyXG5cclxuLy8g5Y2z5bCG5bqf5byD55qE5pWw5o2u57uT5p6EXHJcbmNsYXNzIEFuaW1hdGlvbkN1cnZlRHVtcCBpbXBsZW1lbnRzIER1bXBJbnRlcmZhY2Uge1xyXG4gICAgcHVibGljIGVuY29kZShvYmplY3Q6IGFueSwgZGF0YTogSVByb3BlcnR5LCBvcHRzPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgcmVhbEN1cnZlRHVtcC5lbmNvZGUob2JqZWN0Ll9pbnRlcm5hbEN1cnZlLCBkYXRhLCBvcHRzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVjb2RlKGRhdGE6IGNjLkN1cnZlUmFuZ2UsIGluZm86IGFueSwgZHVtcDogYW55LCBvcHRzPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdHlwZSA9IGNjLmpzLmdldENsYXNzTmFtZShkYXRhKTtcclxuICAgICAgICAvLyDlvJXmk47kuLrkuoblhbzlrrnml6fnmoTmjqXlj6Pkvb/nlKjmlrnlvI/vvIxjdXJ2ZVJhbmdlIOWGheWwhuWtmOWcqOS9v+eUqCBSZWFsQ3VydmUg5bCB6KOF55qEIEFuaW1hdGlvbkN1cnZl77yM55WM6Z2i5Y+q5Lya57yW6L6RIFJlYWxDdXJ2ZSDnmoTmlrDlrZfmrrXvvIxcclxuICAgICAgICAvLyDmraTml7bnmoQgZHVtcCDmlbDmja7kuI3pnIDopoHov5jljp/kuIrljrvvvIzlkKbliJnnlLHkuo4gZHVtcCDpobrluo/nmoTkuI3lj6/mjqfkvJropobnm5bnlKjmiLflt7Lkv67mlLnnmoTmlbDmja5cclxuICAgICAgICBpZiAodHlwZSA9PT0gJ2NjLkN1cnZlUmFuZ2UnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IGN1cnZlID0gZGF0YVtpbmZvLmtleV0uX2ludGVybmFsQ3VydmU7XHJcbiAgICAgICAgcmVhbEN1cnZlRHVtcC5kZWNvZGVCeUR1bXAoZHVtcCwgY3VydmUsIG9wdHMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYW5pbWF0aW9uQ3VydmVEdW1wID0gbmV3IEFuaW1hdGlvbkN1cnZlRHVtcCgpO1xyXG4iXX0=