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
exports.compileEffect = compileEffect;
exports.startAutoGenEffectBin = startAutoGenEffectBin;
exports.getEffectBinPath = getEffectBinPath;
async function compileEffect(force) {
    // TODO 暂不支持 effect 导入
    // 需要做好容错，要保证能执行这个返回数据的函数，否则后续流启动程会被中断
    const { afterImport } = await Promise.resolve().then(() => __importStar(require('./assets/effect')));
    try {
        await afterImport(force);
    }
    catch (error) {
        console.error(error);
    }
}
async function startAutoGenEffectBin() {
    const { autoGenEffectBinInfo } = await Promise.resolve().then(() => __importStar(require('./assets/effect')));
    autoGenEffectBinInfo.autoGenEffectBin = true;
}
async function getEffectBinPath() {
    const { autoGenEffectBinInfo, afterImport } = await Promise.resolve().then(() => __importStar(require('./assets/effect')));
    if (!autoGenEffectBinInfo.effectBinPath) {
        await afterImport(true);
    }
    return autoGenEffectBinInfo.effectBinPath;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNDQVNDO0FBRUQsc0RBR0M7QUFFRCw0Q0FNQztBQXRCTSxLQUFLLFVBQVUsYUFBYSxDQUFDLEtBQWU7SUFDL0Msc0JBQXNCO0lBQ3RCLHNDQUFzQztJQUN0QyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsd0RBQWEsaUJBQWlCLEdBQUMsQ0FBQztJQUN4RCxJQUFJLENBQUM7UUFDRCxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekIsQ0FBQztBQUNMLENBQUM7QUFFTSxLQUFLLFVBQVUscUJBQXFCO0lBQ3ZDLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxHQUFHLHdEQUFhLGlCQUFpQixHQUFDLENBQUM7SUFDakUsb0JBQW9CLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQ2pELENBQUM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCO0lBQ2xDLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxXQUFXLEVBQUUsR0FBRyx3REFBYSxpQkFBaUIsR0FBQyxDQUFDO0lBQzlFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0QsT0FBTyxvQkFBb0IsQ0FBQyxhQUFhLENBQUM7QUFDOUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21waWxlRWZmZWN0KGZvcmNlPzogYm9vbGVhbikge1xyXG4gICAgLy8gVE9ETyDmmoLkuI3mlK/mjIEgZWZmZWN0IOWvvOWFpVxyXG4gICAgLy8g6ZyA6KaB5YGa5aW95a656ZSZ77yM6KaB5L+d6K+B6IO95omn6KGM6L+Z5Liq6L+U5Zue5pWw5o2u55qE5Ye95pWw77yM5ZCm5YiZ5ZCO57ut5rWB5ZCv5Yqo56iL5Lya6KKr5Lit5patXHJcbiAgICBjb25zdCB7IGFmdGVySW1wb3J0IH0gPSBhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2VmZmVjdCcpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBhZnRlckltcG9ydChmb3JjZSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRBdXRvR2VuRWZmZWN0QmluKCkge1xyXG4gICAgY29uc3QgeyBhdXRvR2VuRWZmZWN0QmluSW5mbyB9ID0gYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9lZmZlY3QnKTtcclxuICAgIGF1dG9HZW5FZmZlY3RCaW5JbmZvLmF1dG9HZW5FZmZlY3RCaW4gPSB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RWZmZWN0QmluUGF0aCgpIHtcclxuICAgIGNvbnN0IHsgYXV0b0dlbkVmZmVjdEJpbkluZm8sIGFmdGVySW1wb3J0IH0gPSBhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2VmZmVjdCcpO1xyXG4gICAgaWYgKCFhdXRvR2VuRWZmZWN0QmluSW5mby5lZmZlY3RCaW5QYXRoKSB7XHJcbiAgICAgICAgYXdhaXQgYWZ0ZXJJbXBvcnQodHJ1ZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXV0b0dlbkVmZmVjdEJpbkluZm8uZWZmZWN0QmluUGF0aDtcclxufSJdfQ==