"use strict";
/**
 * 配置管理工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByDotPath = getByDotPath;
exports.setByDotPath = setByDotPath;
exports.isValidConfigKey = isValidConfigKey;
exports.removeByDotPath = removeByDotPath;
exports.deepMerge = deepMerge;
/**
 * 通过点号分隔的路径获取嵌套对象的值
 * @param source 源对象
 * @param dotPath 点号分隔的路径，如 'builder.platforms.web-mobile'
 * @returns 找到的值，如果路径不存在返回 undefined
 */
function getByDotPath(source, dotPath) {
    if (!source || !dotPath) {
        return undefined;
    }
    const keys = dotPath.split('.');
    let current = source;
    for (const key of keys) {
        if (current === undefined || current === null || typeof current !== 'object') {
            return undefined;
        }
        current = current[key];
    }
    // 如果路径存在但值为 undefined，返回 undefined
    // 如果路径存在且值为 null，返回 null
    return current;
}
/**
 * 通过点号分隔的路径设置嵌套对象的值
 * @param target 目标对象
 * @param dotPath 点号分隔的路径
 * @param value 要设置的值
 */
function setByDotPath(target, dotPath, value) {
    if (!target || !dotPath) {
        return;
    }
    const keys = dotPath.split('.');
    const lastKey = keys.pop();
    let current = target;
    // 创建嵌套路径
    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }
        current = current[key];
    }
    // 设置最终值
    current[lastKey] = value;
}
/**
 * 验证配置键名是否有效
 * @param key 配置键名
 * @returns 是否有效
 */
function isValidConfigKey(key) {
    return typeof key === 'string' && key.trim().length > 0;
}
/**
 * 通过点号分隔的路径删除嵌套对象的值
 * @param target 目标对象
 * @param dotPath 点号分隔的路径
 * @returns 是否成功删除
 */
function removeByDotPath(target, dotPath) {
    if (!target || !dotPath) {
        return false;
    }
    const keys = dotPath.split('.');
    const lastKey = keys.pop();
    let current = target;
    // 遍历到倒数第二层
    for (const key of keys) {
        if (current === undefined || current === null || typeof current !== 'object') {
            return false;
        }
        current = current[key];
    }
    // 检查最后一层是否存在
    if (current === undefined || current === null || typeof current !== 'object') {
        return false;
    }
    // 删除属性
    if (lastKey in current) {
        delete current[lastKey];
        return true;
    }
    return false;
}
/**
 * 深度合并两个值
 * @param target 目标值
 * @param source 源值
 * @returns 合并后的值
 */
function deepMerge(target, source) {
    // 如果源值为 null 或 undefined，返回目标值
    if (source === null || source === undefined) {
        return target;
    }
    // 如果目标值为 null 或 undefined，返回源值
    if (target === null || target === undefined) {
        return source;
    }
    // 检查是否为非对象类型（包括数组）
    const isSourcePrimitive = typeof source !== 'object' || Array.isArray(source);
    const isTargetPrimitive = typeof target !== 'object' || Array.isArray(target);
    // 如果任一值为非对象类型，返回源值（覆盖）
    if (isSourcePrimitive || isTargetPrimitive) {
        return source;
    }
    // 两个都是普通对象，进行深度合并
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            // 递归合并：只有当两个值都是普通对象时才进行深度合并
            if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) &&
                typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9jb25maWd1cmF0aW9uL3NjcmlwdC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBUUgsb0NBa0JDO0FBUUQsb0NBbUJDO0FBT0QsNENBRUM7QUFRRCwwQ0E2QkM7QUFRRCw4QkF1Q0M7QUFoSkQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixZQUFZLENBQUMsTUFBVyxFQUFFLE9BQWU7SUFDckQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RCLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUVyQixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3JCLElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzNFLE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMseUJBQXlCO0lBQ3pCLE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLFlBQVksQ0FBQyxNQUFXLEVBQUUsT0FBZSxFQUFFLEtBQVU7SUFDakUsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RCLE9BQU87SUFDWCxDQUFDO0lBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FB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R0FBRyxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFFN0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUN2QixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM3QixNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWhDLDRCQUE0QjtZQUM1QixJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7Z0JBQ3RGLE9BQU8sV0FBVyxLQUFLLFFBQVEsSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUN6RixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN0RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQztZQUM5QixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIOmFjee9rueuoeeQhuW3peWFt+WHveaVsFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiDpgJrov4fngrnlj7fliIbpmpTnmoTot6/lvoTojrflj5bltYzlpZflr7nosaHnmoTlgLxcclxuICogQHBhcmFtIHNvdXJjZSDmupDlr7nosaFcclxuICogQHBhcmFtIGRvdFBhdGgg54K55Y+35YiG6ZqU55qE6Lev5b6E77yM5aaCICdidWlsZGVyLnBsYXRmb3Jtcy53ZWItbW9iaWxlJ1xyXG4gKiBAcmV0dXJucyDmib7liLDnmoTlgLzvvIzlpoLmnpzot6/lvoTkuI3lrZjlnKjov5Tlm54gdW5kZWZpbmVkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnlEb3RQYXRoKHNvdXJjZTogYW55LCBkb3RQYXRoOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgaWYgKCFzb3VyY2UgfHwgIWRvdFBhdGgpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCBrZXlzID0gZG90UGF0aC5zcGxpdCgnLicpO1xyXG4gICAgbGV0IGN1cnJlbnQgPSBzb3VyY2U7XHJcbiAgICBcclxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcclxuICAgICAgICBpZiAoY3VycmVudCA9PT0gdW5kZWZpbmVkIHx8IGN1cnJlbnQgPT09IG51bGwgfHwgdHlwZW9mIGN1cnJlbnQgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tleV07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIOWmguaenOi3r+W+hOWtmOWcqOS9huWAvOS4uiB1bmRlZmluZWTvvIzov5Tlm54gdW5kZWZpbmVkXHJcbiAgICAvLyDlpoLmnpzot6/lvoTlrZjlnKjkuJTlgLzkuLogbnVsbO+8jOi/lOWbniBudWxsXHJcbiAgICByZXR1cm4gY3VycmVudDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOmAmui/h+eCueWPt+WIhumalOeahOi3r+W+hOiuvue9ruW1jOWll+WvueixoeeahOWAvFxyXG4gKiBAcGFyYW0gdGFyZ2V0IOebruagh+WvueixoVxyXG4gKiBAcGFyYW0gZG90UGF0aCDngrnlj7fliIbpmpTnmoTot6/lvoRcclxuICogQHBhcmFtIHZhbHVlIOimgeiuvue9rueahOWAvFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEJ5RG90UGF0aCh0YXJnZXQ6IGFueSwgZG90UGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICBpZiAoIXRhcmdldCB8fCAhZG90UGF0aCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3Qga2V5cyA9IGRvdFBhdGguc3BsaXQoJy4nKTtcclxuICAgIGNvbnN0IGxhc3RLZXkgPSBrZXlzLnBvcCgpITtcclxuICAgIGxldCBjdXJyZW50ID0gdGFyZ2V0O1xyXG4gICAgXHJcbiAgICAvLyDliJvlu7rltYzlpZfot6/lvoRcclxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcclxuICAgICAgICBpZiAoIShrZXkgaW4gY3VycmVudCkgfHwgdHlwZW9mIGN1cnJlbnRba2V5XSAhPT0gJ29iamVjdCcgfHwgY3VycmVudFtrZXldID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRba2V5XSA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudFtrZXldO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyDorr7nva7mnIDnu4jlgLxcclxuICAgIGN1cnJlbnRbbGFzdEtleV0gPSB2YWx1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOmqjOivgemFjee9rumUruWQjeaYr+WQpuacieaViFxyXG4gKiBAcGFyYW0ga2V5IOmFjee9rumUruWQjVxyXG4gKiBAcmV0dXJucyDmmK/lkKbmnInmlYhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkQ29uZmlnS2V5KGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3N0cmluZycgJiYga2V5LnRyaW0oKS5sZW5ndGggPiAwO1xyXG59XHJcblxyXG4vKipcclxuICog6YCa6L+H54K55Y+35YiG6ZqU55qE6Lev5b6E5Yig6Zmk5bWM5aWX5a+56LGh55qE5YC8XHJcbiAqIEBwYXJhbSB0YXJnZXQg55uu5qCH5a+56LGhXHJcbiAqIEBwYXJhbSBkb3RQYXRoIOeCueWPt+WIhumalOeahOi3r+W+hFxyXG4gKiBAcmV0dXJucyDmmK/lkKbmiJDlip/liKDpmaRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVCeURvdFBhdGgodGFyZ2V0OiBhbnksIGRvdFBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0YXJnZXQgfHwgIWRvdFBhdGgpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0IGtleXMgPSBkb3RQYXRoLnNwbGl0KCcuJyk7XHJcbiAgICBjb25zdCBsYXN0S2V5ID0ga2V5cy5wb3AoKSE7XHJcbiAgICBsZXQgY3VycmVudCA9IHRhcmdldDtcclxuICAgIFxyXG4gICAgLy8g6YGN5Y6G5Yiw5YCS5pWw56ys5LqM5bGCXHJcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQgPT09IHVuZGVmaW5lZCB8fCBjdXJyZW50ID09PSBudWxsIHx8IHR5cGVvZiBjdXJyZW50ICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tleV07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIOajgOafpeacgOWQjuS4gOWxguaYr+WQpuWtmOWcqFxyXG4gICAgaWYgKGN1cnJlbnQgPT09IHVuZGVmaW5lZCB8fCBjdXJyZW50ID09PSBudWxsIHx8IHR5cGVvZiBjdXJyZW50ICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8g5Yig6Zmk5bGe5oCnXHJcbiAgICBpZiAobGFzdEtleSBpbiBjdXJyZW50KSB7XHJcbiAgICAgICAgZGVsZXRlIGN1cnJlbnRbbGFzdEtleV07XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOa3seW6puWQiOW5tuS4pOS4quWAvFxyXG4gKiBAcGFyYW0gdGFyZ2V0IOebruagh+WAvFxyXG4gKiBAcGFyYW0gc291cmNlIOa6kOWAvFxyXG4gKiBAcmV0dXJucyDlkIjlubblkI7nmoTlgLxcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWVwTWVyZ2UodGFyZ2V0OiBhbnksIHNvdXJjZTogYW55KTogYW55IHtcclxuICAgIC8vIOWmguaenOa6kOWAvOS4uiBudWxsIOaIliB1bmRlZmluZWTvvIzov5Tlm57nm67moIflgLxcclxuICAgIGlmIChzb3VyY2UgPT09IG51bGwgfHwgc291cmNlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyDlpoLmnpznm67moIflgLzkuLogbnVsbCDmiJYgdW5kZWZpbmVk77yM6L+U5Zue5rqQ5YC8XHJcbiAgICBpZiAodGFyZ2V0ID09PSBudWxsIHx8IHRhcmdldCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8g5qOA5p+l5piv5ZCm5Li66Z2e5a+56LGh57G75Z6L77yI5YyF5ous5pWw57uE77yJXHJcbiAgICBjb25zdCBpc1NvdXJjZVByaW1pdGl2ZSA9IHR5cGVvZiBzb3VyY2UgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoc291cmNlKTtcclxuICAgIGNvbnN0IGlzVGFyZ2V0UHJpbWl0aXZlID0gdHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheSh0YXJnZXQpO1xyXG4gICAgXHJcbiAgICAvLyDlpoLmnpzku7vkuIDlgLzkuLrpnZ7lr7nosaHnsbvlnovvvIzov5Tlm57mupDlgLzvvIjopobnm5bvvIlcclxuICAgIGlmIChpc1NvdXJjZVByaW1pdGl2ZSB8fCBpc1RhcmdldFByaW1pdGl2ZSkge1xyXG4gICAgICAgIHJldHVybiBzb3VyY2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIOS4pOS4qumDveaYr+aZrumAmuWvueixoe+8jOi/m+ihjOa3seW6puWQiOW5tlxyXG4gICAgY29uc3QgcmVzdWx0ID0geyAuLi50YXJnZXQgfTtcclxuICAgIFxyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XHJcbiAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZVZhbHVlID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFZhbHVlID0gcmVzdWx0W2tleV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyDpgJLlvZLlkIjlubbvvJrlj6rmnInlvZPkuKTkuKrlgLzpg73mmK/mma7pgJrlr7nosaHml7bmiY3ov5vooYzmt7HluqblkIjlubZcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2VWYWx1ZSA9PT0gJ29iamVjdCcgJiYgc291cmNlVmFsdWUgIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkoc291cmNlVmFsdWUpICYmXHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFyZ2V0VmFsdWUgPT09ICdvYmplY3QnICYmIHRhcmdldFZhbHVlICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KHRhcmdldFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBkZWVwTWVyZ2UodGFyZ2V0VmFsdWUsIHNvdXJjZVZhbHVlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gc291cmNlVmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuIl19