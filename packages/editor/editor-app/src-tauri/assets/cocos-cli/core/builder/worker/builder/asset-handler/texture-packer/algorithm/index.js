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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TexturePackerAlgorithm = void 0;
// https://github.com/finscn/max-rects-packing
// @ts-ignore
const ipacker = __importStar(require("max-rects-packing"));
const maxrects_1 = __importDefault(require("./maxrects"));
function getRectsFromInputs(inputs) {
    return inputs.map((r) => {
        return { width: r.width, height: r.height, origin: r };
    });
}
function getInputsFromRects(rects) {
    return rects.map((rect) => {
        const r = rect.origin;
        for (const name in rect) {
            if (name === 'origin') {
                continue;
            }
            r[name] = rect[name];
        }
        return r;
    });
}
function scoreMaxRects(inputs, binWidth, binHeight, heuristice, allowRotation, result) {
    // 需要克隆 inputs，不能修改到 inputs 里的数据，否则会影响到后面的遍历
    const pack = new maxrects_1.default(binWidth, binHeight, allowRotation);
    const packedRects = pack.insertRects(inputs, heuristice);
    // 已经打包的小图总面积
    let packedArea = 0;
    // 整张大图的面积
    let texArea = 0;
    let texWidth = 0;
    let texHeight = 0;
    for (let i = 0; i < packedRects.length; i++) {
        const rect = packedRects[i];
        packedArea += rect.width * rect.height;
        const right = rect.x + (rect.rotated ? rect.height : rect.width);
        const top = rect.y + (rect.rotated ? rect.width : rect.height);
        if (right > texWidth) {
            texWidth = right;
        }
        if (top > texHeight) {
            texHeight = top;
        }
    }
    texArea = texWidth * texHeight;
    // 打包好的面积除以大图面积得出分数
    const score = packedArea / texArea;
    // 如果打包的小图面积更大，则可以直接替换掉结果
    // 如果打包的分数更大，那么打包的小图面积也要大于等于结果才可以
    if (packedArea > result.packedArea || (score > result.score && packedArea >= result.packedArea)) {
        result.packedRects = packedRects;
        result.unpackedRects = inputs;
        result.score = score;
        result.packedArea = packedArea;
        result.binWidth = binWidth;
        result.binHeight = binHeight;
        result.heuristice = heuristice;
    }
}
function scoreMaxRectsForAllHeuristics(inputs, binWidth, binHeight, allowRotation, result) {
    for (let i = 0; i <= 5; i++) {
        // TODO: 修复 ContactPointRule 算法，这个算法现在会有重叠的部分
        if (i === 4) {
            continue;
        }
        scoreMaxRects(getRectsFromInputs(inputs), binWidth, binHeight, i, allowRotation, result);
    }
}
exports.TexturePackerAlgorithm = {
    ipacker(inputs, maxWidth, maxHeight, allowRotation) {
        // @ts-ignore
        const packer = new ipacker.Packer(maxWidth, maxHeight, {
            allowRotate: allowRotation,
        });
        const rects = getRectsFromInputs(inputs);
        const result = packer.fit(rects);
        return result.rects.map((rect) => {
            return Object.assign(rect.origin, rect.fitInfo);
        });
    },
    MaxRects(inputs, maxWidth, maxHeight, allowRotation) {
        let area = 0;
        for (let i = 0; i < inputs.length; i++) {
            area += inputs[i].width * inputs[i].height;
        }
        const scorePackResult = {
            packedRects: [],
            unpackedRects: [],
            score: -Infinity,
            packedArea: -Infinity,
        };
        // 如果所有小图的总面积大于设置的最大面积，则直接使用 maxWidth maxHeight 测试
        const maxArea = maxWidth * maxHeight;
        if (area < maxArea) {
            // 遍历二次幂宽高，直到大于 maxWidth maxHeight
            // 其中会包括 正方形 和 扁平长方形 的情况
            const startSearchSize = 4;
            for (let testWidth = startSearchSize; testWidth <= maxWidth; testWidth = Math.min(testWidth * 2, maxWidth)) {
                for (let testHeight = startSearchSize; testHeight <= maxHeight; testHeight = Math.min(testHeight * 2, maxHeight)) {
                    const testArea = testWidth * testHeight;
                    if (testArea >= area) {
                        // growArea 会根据测试结果自动增长
                        let growArea = area;
                        // eslint-disable-next-line no-constant-condition
                        while (1) {
                            // 使用测试面积的平方根作为测试宽高
                            const testBinSize = Math.pow(growArea, 0.5);
                            if (testBinSize <= testWidth && testBinSize <= testHeight) {
                                scoreMaxRectsForAllHeuristics(inputs, testBinSize, testBinSize, allowRotation, scorePackResult);
                            }
                            scoreMaxRectsForAllHeuristics(inputs, growArea / testHeight, testHeight, allowRotation, scorePackResult);
                            scoreMaxRectsForAllHeuristics(inputs, testWidth, growArea / testWidth, allowRotation, scorePackResult);
                            // 如果还有小图没有被打包进大图里，则将剩余小图的面积用来扩大测试的面积
                            const unpackedRects = scorePackResult.unpackedRects;
                            if (unpackedRects.length > 0) {
                                let leftArea = 0;
                                for (let i = 0; i < unpackedRects.length; i++) {
                                    leftArea += unpackedRects[i].width * unpackedRects[i].height;
                                }
                                growArea += leftArea / 2;
                            }
                            if (growArea >= testArea || unpackedRects.length === 0) {
                                break;
                            }
                        }
                    }
                    if (testHeight >= maxHeight) {
                        break;
                    }
                }
                if (testWidth >= maxWidth) {
                    break;
                }
            }
        }
        else {
            scoreMaxRectsForAllHeuristics(inputs, maxWidth, maxHeight, allowRotation, scorePackResult);
        }
        // console.debug(`Best heuristice: ${scorePackResult.heuristice}`);
        return getInputsFromRects(scorePackResult.packedRects);
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvdGV4dHVyZS1wYWNrZXIvYWxnb3JpdGhtL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUE4QztBQUM5QyxhQUFhO0FBQ2IsMkRBQTZDO0FBRTdDLDBEQUFvRDtBQXdCcEQsU0FBUyxrQkFBa0IsQ0FBQyxNQUFvQjtJQUM1QyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNwQixPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBb0MsQ0FBQztJQUM3RixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEtBQXlDO0lBQ2pFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3RCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdEIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN0QixJQUFJLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFBQyxTQUFTO1lBQUMsQ0FBQztZQUNuQyxDQUFTLENBQUMsSUFBSSxDQUFDLEdBQUksSUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFDRCxPQUFPLENBQWdCLENBQUM7SUFDNUIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsTUFBMEMsRUFBRSxRQUFnQixFQUFFLFNBQWlCLEVBQUUsVUFBa0IsRUFBRSxhQUFzQixFQUFF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YUFBYSxDQUFDOzRCQUNwRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0NBQzNCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztnQ0FDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQ0FDNUMsUUFBUSxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQ0FDakUsQ0FBQztnQ0FDRCxRQUFRLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQzs0QkFDN0IsQ0FBQzs0QkFFRCxJQUFJLFFBQVEsSUFBSSxRQUFRLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQ0FDckQsTUFBTTs0QkFDVixDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQztvQkFFRCxJQUFJLFVBQVUsSUFBSSxTQUFTLEVBQUUsQ0FBQzt3QkFBQyxNQUFNO29CQUFDLENBQUM7Z0JBQzNDLENBQUM7Z0JBQ0QsSUFBSSxTQUFTLElBQUksUUFBUSxFQUFFLENBQUM7b0JBQUMsTUFBTTtnQkFBQyxDQUFDO1lBQ3pDLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNKLDZCQUE2QixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUMvRixDQUFDO1FBRUQsbUVBQW1FO1FBRW5FLE9BQU8sa0JBQWtCLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZpbnNjbi9tYXgtcmVjdHMtcGFja2luZ1xyXG4vLyBAdHMtaWdub3JlXHJcbmltcG9ydCAqIGFzIGlwYWNrZXIgZnJvbSAnbWF4LXJlY3RzLXBhY2tpbmcnO1xyXG5cclxuaW1wb3J0IE1heFJlY3RzQmluUGFjaywgeyBJUmVjdCB9IGZyb20gJy4vbWF4cmVjdHMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJSW5wdXRSZWN0IHtcclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJUGFja2VkUmVjdCBleHRlbmRzIElJbnB1dFJlY3Qge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgcm90YXRlZD86IGJvb2xlYW47XHJcbn1cclxuXHJcbmludGVyZmFjZSBJU2NvcmVQYWNrUmVzdWx0IHtcclxuICAgIHBhY2tlZFJlY3RzOiAoSVJlY3QgJiB7IG9yaWdpbjogSUlucHV0UmVjdCB9KVtdO1xyXG4gICAgdW5wYWNrZWRSZWN0czogKElSZWN0ICYgeyBvcmlnaW46IElJbnB1dFJlY3QgfSlbXTtcclxuICAgIHNjb3JlOiBudW1iZXI7XHJcbiAgICBwYWNrZWRBcmVhOiBudW1iZXI7XHJcbiAgICBiaW5XaWR0aD86IG51bWJlcjtcclxuICAgIGJpbkhlaWdodD86IG51bWJlcjtcclxuICAgIGhldXJpc3RpY2U/OiBudW1iZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlY3RzRnJvbUlucHV0cyhpbnB1dHM6IElJbnB1dFJlY3RbXSk6IChJUmVjdCAmIHsgb3JpZ2luOiBJSW5wdXRSZWN0IH0pW10ge1xyXG4gICAgcmV0dXJuIGlucHV0cy5tYXAoKHIpID0+IHtcclxuICAgICAgICByZXR1cm4geyB3aWR0aDogci53aWR0aCwgaGVpZ2h0OiByLmhlaWdodCwgb3JpZ2luOiByIH0gYXMgSVJlY3QgJiB7IG9yaWdpbjogSUlucHV0UmVjdCB9O1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldElucHV0c0Zyb21SZWN0cyhyZWN0czogKElSZWN0ICYgeyBvcmlnaW46IElJbnB1dFJlY3QgfSlbXSk6IElQYWNrZWRSZWN0W10ge1xyXG4gICAgcmV0dXJuIHJlY3RzLm1hcCgocmVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHIgPSByZWN0Lm9yaWdpbjtcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcmVjdCkge1xyXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ29yaWdpbicpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgKHIgYXMgYW55KVtuYW1lXSA9IChyZWN0IGFzIGFueSlbbmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByIGFzIElQYWNrZWRSZWN0O1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNjb3JlTWF4UmVjdHMoaW5wdXRzOiAoSVJlY3QgJiB7IG9yaWdpbjogSUlucHV0UmVjdCB9KVtdLCBiaW5XaWR0aDogbnVtYmVyLCBiaW5IZWlnaHQ6IG51bWJlciwgaGV1cmlzdGljZTogbnVtYmVyLCBhbGxvd1JvdGF0aW9uOiBib29sZWFuLCByZXN1bHQ6IElTY29yZVBhY2tSZXN1bHQpOiB2b2lkIHtcclxuICAgIC8vIOmcgOimgeWFi+mahiBpbnB1dHPvvIzkuI3og73kv67mlLnliLAgaW5wdXRzIOmHjOeahOaVsOaNru+8jOWQpuWImeS8muW9seWTjeWIsOWQjumdoueahOmBjeWOhlxyXG4gICAgY29uc3QgcGFjayA9IG5ldyBNYXhSZWN0c0JpblBhY2soYmluV2lkdGgsIGJpbkhlaWdodCwgYWxsb3dSb3RhdGlvbik7XHJcbiAgICBjb25zdCBwYWNrZWRSZWN0cyA9IHBhY2suaW5zZXJ0UmVjdHMoaW5wdXRzLCBoZXVyaXN0aWNlKSBhcyAoSVJlY3QgJiB7IG9yaWdpbjogSUlucHV0UmVjdCB9KVtdO1xyXG5cclxuICAgIC8vIOW3sue7j+aJk+WMheeahOWwj+WbvuaAu+mdouenr1xyXG4gICAgbGV0IHBhY2tlZEFyZWEgPSAwO1xyXG4gICAgLy8g5pW05byg5aSn5Zu+55qE6Z2i56evXHJcbiAgICBsZXQgdGV4QXJlYSA9IDA7XHJcbiAgICBsZXQgdGV4V2lkdGggPSAwO1xyXG4gICAgbGV0IHRleEhlaWdodCA9IDA7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhY2tlZFJlY3RzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgcmVjdCA9IHBhY2tlZFJlY3RzW2ldO1xyXG4gICAgICAgIHBhY2tlZEFyZWEgKz0gcmVjdC53aWR0aCAqIHJlY3QuaGVpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCByaWdodCA9IHJlY3QueCArICgocmVjdCBhcyBhbnkpLnJvdGF0ZWQgPyByZWN0LmhlaWdodCA6IHJlY3Qud2lkdGgpO1xyXG4gICAgICAgIGNvbnN0IHRvcCA9IHJlY3QueSArICgocmVjdCBhcyBhbnkpLnJvdGF0ZWQgPyByZWN0LndpZHRoIDogcmVjdC5oZWlnaHQpO1xyXG4gICAgICAgIGlmIChyaWdodCA+IHRleFdpZHRoKSB7IHRleFdpZHRoID0gcmlnaHQ7IH1cclxuICAgICAgICBpZiAodG9wID4gdGV4SGVpZ2h0KSB7IHRleEhlaWdodCA9IHRvcDsgfVxyXG4gICAgfVxyXG4gICAgdGV4QXJlYSA9IHRleFdpZHRoICogdGV4SGVpZ2h0O1xyXG5cclxuICAgIC8vIOaJk+WMheWlveeahOmdouenr+mZpOS7peWkp+Wbvumdouenr+W+l+WHuuWIhuaVsFxyXG4gICAgY29uc3Qgc2NvcmUgPSBwYWNrZWRBcmVhIC8gdGV4QXJlYTtcclxuXHJcbiAgICAvLyDlpoLmnpzmiZPljIXnmoTlsI/lm77pnaLnp6/mm7TlpKfvvIzliJnlj6/ku6Xnm7TmjqXmm7/mjaLmjonnu5PmnpxcclxuICAgIC8vIOWmguaenOaJk+WMheeahOWIhuaVsOabtOWkp++8jOmCo+S5iOaJk+WMheeahOWwj+Wbvumdouenr+S5n+imgeWkp+S6juetieS6jue7k+aenOaJjeWPr+S7pVxyXG4gICAgaWYgKHBhY2tlZEFyZWEgPiByZXN1bHQucGFja2VkQXJlYSB8fCAoc2NvcmUgPiByZXN1bHQuc2NvcmUgJiYgcGFja2VkQXJlYSA+PSByZXN1bHQucGFja2VkQXJlYSkpIHtcclxuICAgICAgICByZXN1bHQucGFja2VkUmVjdHMgPSBwYWNrZWRSZWN0cztcclxuICAgICAgICByZXN1bHQudW5wYWNrZWRSZWN0cyA9IGlucHV0cztcclxuICAgICAgICByZXN1bHQuc2NvcmUgPSBzY29yZTtcclxuICAgICAgICByZXN1bHQucGFja2VkQXJlYSA9IHBhY2tlZEFyZWE7XHJcbiAgICAgICAgcmVzdWx0LmJpbldpZHRoID0gYmluV2lkdGg7XHJcbiAgICAgICAgcmVzdWx0LmJpbkhlaWdodCA9IGJpbkhlaWdodDtcclxuICAgICAgICByZXN1bHQuaGV1cmlzdGljZSA9IGhldXJpc3RpY2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNjb3JlTWF4UmVjdHNGb3JBbGxIZXVyaXN0aWNzKGlucHV0czogSUlucHV0UmVjdFtdLCBiaW5XaWR0aDogbnVtYmVyLCBiaW5IZWlnaHQ6IG51bWJlciwgYWxsb3dSb3RhdGlvbjogYm9vbGVhbiwgcmVzdWx0OiBJU2NvcmVQYWNrUmVzdWx0KTogdm9pZCB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSA1OyBpKyspIHtcclxuICAgICAgICAvLyBUT0RPOiDkv67lpI0gQ29udGFjdFBvaW50UnVsZSDnrpfms5XvvIzov5nkuKrnrpfms5XnjrDlnKjkvJrmnInph43lj6DnmoTpg6jliIZcclxuICAgICAgICBpZiAoaSA9PT0gNCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgIHNjb3JlTWF4UmVjdHMoZ2V0UmVjdHNGcm9tSW5wdXRzKGlucHV0cyksIGJpbldpZHRoLCBiaW5IZWlnaHQsIGksIGFsbG93Um90YXRpb24sIHJlc3VsdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBUZXh0dXJlUGFja2VyQWxnb3JpdGhtID0ge1xyXG4gICAgaXBhY2tlcihpbnB1dHM6IElJbnB1dFJlY3RbXSwgbWF4V2lkdGg6IG51bWJlciwgbWF4SGVpZ2h0OiBudW1iZXIsIGFsbG93Um90YXRpb246IGJvb2xlYW4pOiBJUGFja2VkUmVjdFtdIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcGFja2VyID0gbmV3IGlwYWNrZXIuUGFja2VyKG1heFdpZHRoLCBtYXhIZWlnaHQsIHtcclxuICAgICAgICAgICAgYWxsb3dSb3RhdGU6IGFsbG93Um90YXRpb24sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3RzID0gZ2V0UmVjdHNGcm9tSW5wdXRzKGlucHV0cyk7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gcGFja2VyLmZpdChyZWN0cyk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5yZWN0cy5tYXAoKHJlY3Q6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihyZWN0Lm9yaWdpbiwgcmVjdC5maXRJbmZvKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgTWF4UmVjdHMoaW5wdXRzOiBJSW5wdXRSZWN0W10sIG1heFdpZHRoOiBudW1iZXIsIG1heEhlaWdodDogbnVtYmVyLCBhbGxvd1JvdGF0aW9uOiBib29sZWFuKTogSVBhY2tlZFJlY3RbXSB7XHJcbiAgICAgICAgbGV0IGFyZWEgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFyZWEgKz0gaW5wdXRzW2ldLndpZHRoICogaW5wdXRzW2ldLmhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNjb3JlUGFja1Jlc3VsdDogSVNjb3JlUGFja1Jlc3VsdCA9IHtcclxuICAgICAgICAgICAgcGFja2VkUmVjdHM6IFtdLFxyXG4gICAgICAgICAgICB1bnBhY2tlZFJlY3RzOiBbXSxcclxuICAgICAgICAgICAgc2NvcmU6IC1JbmZpbml0eSxcclxuICAgICAgICAgICAgcGFja2VkQXJlYTogLUluZmluaXR5LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIOWmguaenOaJgOacieWwj+WbvueahOaAu+mdouenr+Wkp+S6juiuvue9rueahOacgOWkp+mdouenr++8jOWImeebtOaOpeS9v+eUqCBtYXhXaWR0aCBtYXhIZWlnaHQg5rWL6K+VXHJcbiAgICAgICAgY29uc3QgbWF4QXJlYSA9IG1heFdpZHRoICogbWF4SGVpZ2h0O1xyXG4gICAgICAgIGlmIChhcmVhIDwgbWF4QXJlYSkge1xyXG5cclxuICAgICAgICAgICAgLy8g6YGN5Y6G5LqM5qyh5bmC5a696auY77yM55u05Yiw5aSn5LqOIG1heFdpZHRoIG1heEhlaWdodFxyXG4gICAgICAgICAgICAvLyDlhbbkuK3kvJrljIXmi6wg5q2j5pa55b2iIOWSjCDmiYHlubPplb/mlrnlvaIg55qE5oOF5Ya1XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0U2VhcmNoU2l6ZSA9IDQ7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRlc3RXaWR0aCA9IHN0YXJ0U2VhcmNoU2l6ZTsgdGVzdFdpZHRoIDw9IG1heFdpZHRoOyB0ZXN0V2lkdGggPSBNYXRoLm1pbih0ZXN0V2lkdGggKiAyLCBtYXhXaWR0aCkpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHRlc3RIZWlnaHQgPSBzdGFydFNlYXJjaFNpemU7IHRlc3RIZWlnaHQgPD0gbWF4SGVpZ2h0OyB0ZXN0SGVpZ2h0ID0gTWF0aC5taW4odGVzdEhlaWdodCAqIDIsIG1heEhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXN0QXJlYSA9IHRlc3RXaWR0aCAqIHRlc3RIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3RBcmVhID49IGFyZWEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ3Jvd0FyZWEg5Lya5qC55o2u5rWL6K+V57uT5p6c6Ieq5Yqo5aKe6ZW/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBncm93QXJlYSA9IGFyZWE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDkvb/nlKjmtYvor5XpnaLnp6/nmoTlubPmlrnmoLnkvZzkuLrmtYvor5Xlrr3pq5hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlc3RCaW5TaXplID0gTWF0aC5wb3coZ3Jvd0FyZWEsIDAuNSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3RCaW5TaXplIDw9IHRlc3RXaWR0aCAmJiB0ZXN0QmluU2l6ZSA8PSB0ZXN0SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVNYXhSZWN0c0ZvckFsbEhldXJpc3RpY3MoaW5wdXRzLCB0ZXN0QmluU2l6ZSwgdGVzdEJpblNpemUsIGFsbG93Um90YXRpb24sIHNjb3JlUGFja1Jlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZU1heFJlY3RzRm9yQWxsSGV1cmlzdGljcyhpbnB1dHMsIGdyb3dBcmVhIC8gdGVzdEhlaWdodCwgdGVzdEhlaWdodCwgYWxsb3dSb3RhdGlvbiwgc2NvcmVQYWNrUmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlTWF4UmVjdHNGb3JBbGxIZXVyaXN0aWNzKGlucHV0cywgdGVzdFdpZHRoLCBncm93QXJlYSAvIHRlc3RXaWR0aCwgYWxsb3dSb3RhdGlvbiwgc2NvcmVQYWNrUmVzdWx0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzov5jmnInlsI/lm77msqHmnInooqvmiZPljIXov5vlpKflm77ph4zvvIzliJnlsIbliankvZnlsI/lm77nmoTpnaLnp6/nlKjmnaXmianlpKfmtYvor5XnmoTpnaLnp69cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVucGFja2VkUmVjdHMgPSBzY29yZVBhY2tSZXN1bHQudW5wYWNrZWRSZWN0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bnBhY2tlZFJlY3RzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGVmdEFyZWEgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5wYWNrZWRSZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0QXJlYSArPSB1bnBhY2tlZFJlY3RzW2ldLndpZHRoICogdW5wYWNrZWRSZWN0c1tpXS5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dBcmVhICs9IGxlZnRBcmVhIC8gMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3Jvd0FyZWEgPj0gdGVzdEFyZWEgfHwgdW5wYWNrZWRSZWN0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3RIZWlnaHQgPj0gbWF4SGVpZ2h0KSB7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGVzdFdpZHRoID49IG1heFdpZHRoKSB7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY29yZU1heFJlY3RzRm9yQWxsSGV1cmlzdGljcyhpbnB1dHMsIG1heFdpZHRoLCBtYXhIZWlnaHQsIGFsbG93Um90YXRpb24sIHNjb3JlUGFja1Jlc3VsdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmRlYnVnKGBCZXN0IGhldXJpc3RpY2U6ICR7c2NvcmVQYWNrUmVzdWx0LmhldXJpc3RpY2V9YCk7XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRJbnB1dHNGcm9tUmVjdHMoc2NvcmVQYWNrUmVzdWx0LnBhY2tlZFJlY3RzKTtcclxuICAgIH0sXHJcbn07XHJcbiJdfQ==