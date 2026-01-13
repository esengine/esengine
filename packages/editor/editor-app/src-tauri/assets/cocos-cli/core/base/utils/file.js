'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFileNameConflict = void 0;
exports.getName = getName;
exports.trashItem = trashItem;
exports.requireFile = requireFile;
exports.removeCache = removeCache;
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
/**
 * 检查文件在指定文件夹中是否存在，如果存在则通过追加数字后缀的方式生成一个唯一的文件名。
 * @param targetFolder 目标文件夹的路径。
 * @param fileName 需要检查存在的文件名。
 * @returns 返回一个唯一的文件名字符串。
 */
const resolveFileNameConflict = (targetFolder, fileName) => {
    // 如果fileName为空，抛出错误
    if (!fileName)
        throw new Error(`fileName is empty`);
    // 获取文件扩展名
    const fileExt = (0, path_1.extname)(fileName);
    // 获取文件的基础名（不包括扩展名）
    let fileBase = (0, path_1.basename)(fileName, fileExt);
    // 循环检查直到找到一个不存在的文件名
    while ((0, fs_1.existsSync)((0, path_1.join)(targetFolder, `${fileBase}${fileExt}`))) {
        if ((/(\d+)$/.test(fileBase))) {
            fileBase = fileBase.replace(/^(.+?)(\d+)?$/, ($, $1, $2) => {
                let num;
                if (!$2) {
                    // 如果是纯数字的话 $2 是为 undefined，$1 自增就行
                    let num = parseInt($1, 10);
                    num += 1;
                    return num.toString();
                }
                num = parseInt($2, 10);
                num += 1;
                // 返回更新后的文件名
                return `${$1}${num.toString().padStart($2.length, '0')}`;
            });
        }
        else {
            // 如果原文件名不包含数字后缀，则添加-001作为后缀
            fileBase = `${fileBase}-001`;
        }
    }
    // 返回最终生成的唯一文件名
    return `${fileBase}${fileExt}`;
};
exports.resolveFileNameConflict = resolveFileNameConflict;
/**
 * 初始化一个可用的文件名
 * Initializes a available filename
 * 返回可用名称的文件路径
 * Returns the file path with the available name
 *
 * @param file 初始文件路径 Initial file path
 */
function getName(file) {
    if (!(0, fs_1.existsSync)(file)) {
        return file;
    }
    const dir = (0, path_1.dirname)(file);
    const fileName = (0, path_1.basename)(file);
    const newFileName = (0, exports.resolveFileNameConflict)(dir, fileName);
    return (0, path_1.join)(dir, newFileName);
}
async function trashItem(file) {
    // TODO
    // const trash = await import('sudo-trash');
    // return await trash.trash(file);
    await (0, fs_extra_1.remove)(file);
}
function requireFile(file, options) {
    // TODO
    return require(file);
}
function removeCache(file) {
    delete require.cache[file];
    // TODD
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL2Jhc2UvdXRpbHMvZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQXNEYiwwQkFVQztBQUVELDhCQUtDO0FBRUQsa0NBR0M7QUFFRCxrQ0FHQztBQS9FRCwyQkFBZ0M7QUFDaEMsdUNBQWtDO0FBQ2xDLCtCQUF3RDtBQUV4RDs7Ozs7R0FLRztBQUNJLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxZQUFvQixFQUFFLFFBQWdCLEVBQVUsRUFBRTtJQUN0RixvQkFBb0I7SUFDcEIsSUFBSSxDQUFDLFFBQVE7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDcEQsVUFBVTtJQUNWLE1BQU0sT0FBTyxHQUFHLElBQUEsY0FBTyxFQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLG1CQUFtQjtJQUNuQixJQUFJLFFBQVEsR0FBRyxJQUFBLGVBQVEsRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFM0Msb0JBQW9CO0lBQ3BCLE9BQU8sSUFBQSxlQUFVLEVBQUMsSUFBQSxXQUFJLEVBQUMsWUFBWSxFQUFFLEdBQUcsUUFBUSxHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzdELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM1QixRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBVSxFQUFFLEVBQXNCLEVBQUUsRUFBRTtnQkFDM0YsSUFBSSxHQUFHLENBQUM7Z0JBQ1IsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNOLG1DQUFtQztvQkFDbkMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDM0IsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFDVCxPQUFPLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDMUIsQ0FBQztnQkFDRCxHQUFHLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDdkIsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDVCxZQUFZO2dCQUNaLE9BQU8sR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDN0QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO2FBQU0sQ0FBQztZQUNKLDRCQUE0QjtZQUM1QixRQUFRLEdBQUcsR0FBRyxRQUFRLE1BQU0sQ0FBQztRQUNqQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGVBQWU7SUFDZixPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ25DLENBQUMsQ0FBQztBQWhDVyxRQUFBLHVCQUF1QiwyQkFnQ2xDO0FBRUY7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxJQUFZO0lBQ2hDLElBQUksQ0FBQyxJQUFBLGVBQVUsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFBLGVBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxNQUFNLFdBQVcsR0FBRyxJQUFBLCtCQUF1QixFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUUzRCxPQUFPLElBQUEsV0FBSSxFQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRU0sS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFZO0lBQ3hDLE9BQU87SUFDUCw0Q0FBNEM7SUFDNUMsa0NBQWtDO0lBQ2xDLE1BQU0sSUFBQSxpQkFBTSxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxTQUFnQixXQUFXLENBQUMsSUFBWSxFQUFFLE9BQTBCO0lBQ2hFLE9BQU87SUFDUCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLElBQVk7SUFDcEMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLE9BQU87QUFDWCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgcmVtb3ZlIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgZXh0bmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5cclxuLyoqXHJcbiAqIOajgOafpeaWh+S7tuWcqOaMh+WumuaWh+S7tuWkueS4reaYr+WQpuWtmOWcqO+8jOWmguaenOWtmOWcqOWImemAmui/h+i/veWKoOaVsOWtl+WQjue8gOeahOaWueW8j+eUn+aIkOS4gOS4quWUr+S4gOeahOaWh+S7tuWQjeOAglxyXG4gKiBAcGFyYW0gdGFyZ2V0Rm9sZGVyIOebruagh+aWh+S7tuWkueeahOi3r+W+hOOAglxyXG4gKiBAcGFyYW0gZmlsZU5hbWUg6ZyA6KaB5qOA5p+l5a2Y5Zyo55qE5paH5Lu25ZCN44CCXHJcbiAqIEByZXR1cm5zIOi/lOWbnuS4gOS4quWUr+S4gOeahOaWh+S7tuWQjeWtl+espuS4suOAglxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHJlc29sdmVGaWxlTmFtZUNvbmZsaWN0ID0gKHRhcmdldEZvbGRlcjogc3RyaW5nLCBmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgIC8vIOWmguaenGZpbGVOYW1l5Li656m677yM5oqb5Ye66ZSZ6K+vXHJcbiAgICBpZiAoIWZpbGVOYW1lKSB0aHJvdyBuZXcgRXJyb3IoYGZpbGVOYW1lIGlzIGVtcHR5YCk7XHJcbiAgICAvLyDojrflj5bmlofku7bmianlsZXlkI1cclxuICAgIGNvbnN0IGZpbGVFeHQgPSBleHRuYW1lKGZpbGVOYW1lKTtcclxuICAgIC8vIOiOt+WPluaWh+S7tueahOWfuuehgOWQje+8iOS4jeWMheaLrOaJqeWxleWQje+8iVxyXG4gICAgbGV0IGZpbGVCYXNlID0gYmFzZW5hbWUoZmlsZU5hbWUsIGZpbGVFeHQpO1xyXG5cclxuICAgIC8vIOW+queOr+ajgOafpeebtOWIsOaJvuWIsOS4gOS4quS4jeWtmOWcqOeahOaWh+S7tuWQjVxyXG4gICAgd2hpbGUgKGV4aXN0c1N5bmMoam9pbih0YXJnZXRGb2xkZXIsIGAke2ZpbGVCYXNlfSR7ZmlsZUV4dH1gKSkpIHtcclxuICAgICAgICBpZiAoKC8oXFxkKykkLy50ZXN0KGZpbGVCYXNlKSkpIHtcclxuICAgICAgICAgICAgZmlsZUJhc2UgPSBmaWxlQmFzZS5yZXBsYWNlKC9eKC4rPykoXFxkKyk/JC8sICgkOiBzdHJpbmcsICQxOiBzdHJpbmcsICQyOiBzdHJpbmcgfCB1bmRlZmluZWQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBudW07XHJcbiAgICAgICAgICAgICAgICBpZiAoISQyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5piv57qv5pWw5a2X55qE6K+dICQyIOaYr+S4uiB1bmRlZmluZWTvvIwkMSDoh6rlop7lsLHooYxcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbnVtID0gcGFyc2VJbnQoJDEsIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBudW0gKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBudW0gPSBwYXJzZUludCgkMiwgMTApO1xyXG4gICAgICAgICAgICAgICAgbnVtICs9IDE7XHJcbiAgICAgICAgICAgICAgICAvLyDov5Tlm57mm7TmlrDlkI7nmoTmlofku7blkI1cclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHskMX0ke251bS50b1N0cmluZygpLnBhZFN0YXJ0KCQyLmxlbmd0aCwgJzAnKX1gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzljp/mlofku7blkI3kuI3ljIXlkKvmlbDlrZflkI7nvIDvvIzliJnmt7vliqAtMDAx5L2c5Li65ZCO57yAXHJcbiAgICAgICAgICAgIGZpbGVCYXNlID0gYCR7ZmlsZUJhc2V9LTAwMWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOi/lOWbnuacgOe7iOeUn+aIkOeahOWUr+S4gOaWh+S7tuWQjVxyXG4gICAgcmV0dXJuIGAke2ZpbGVCYXNlfSR7ZmlsZUV4dH1gO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIOWIneWni+WMluS4gOS4quWPr+eUqOeahOaWh+S7tuWQjVxyXG4gKiBJbml0aWFsaXplcyBhIGF2YWlsYWJsZSBmaWxlbmFtZVxyXG4gKiDov5Tlm57lj6/nlKjlkI3np7DnmoTmlofku7bot6/lvoRcclxuICogUmV0dXJucyB0aGUgZmlsZSBwYXRoIHdpdGggdGhlIGF2YWlsYWJsZSBuYW1lXHJcbiAqIFxyXG4gKiBAcGFyYW0gZmlsZSDliJ3lp4vmlofku7bot6/lvoQgSW5pdGlhbCBmaWxlIHBhdGhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXROYW1lKGZpbGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAoIWV4aXN0c1N5bmMoZmlsZSkpIHtcclxuICAgICAgICByZXR1cm4gZmlsZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkaXIgPSBkaXJuYW1lKGZpbGUpO1xyXG4gICAgY29uc3QgZmlsZU5hbWUgPSBiYXNlbmFtZShmaWxlKTtcclxuICAgIGNvbnN0IG5ld0ZpbGVOYW1lID0gcmVzb2x2ZUZpbGVOYW1lQ29uZmxpY3QoZGlyLCBmaWxlTmFtZSk7XHJcblxyXG4gICAgcmV0dXJuIGpvaW4oZGlyLCBuZXdGaWxlTmFtZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cmFzaEl0ZW0oZmlsZTogc3RyaW5nKSB7XHJcbiAgICAvLyBUT0RPXHJcbiAgICAvLyBjb25zdCB0cmFzaCA9IGF3YWl0IGltcG9ydCgnc3Vkby10cmFzaCcpO1xyXG4gICAgLy8gcmV0dXJuIGF3YWl0IHRyYXNoLnRyYXNoKGZpbGUpO1xyXG4gICAgYXdhaXQgcmVtb3ZlKGZpbGUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZUZpbGUoZmlsZTogc3RyaW5nLCBvcHRpb25zPzogeyByb290OiBzdHJpbmcgfSkge1xyXG4gICAgLy8gVE9ET1xyXG4gICAgcmV0dXJuIHJlcXVpcmUoZmlsZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVDYWNoZShmaWxlOiBzdHJpbmcpIHtcclxuICAgIGRlbGV0ZSByZXF1aXJlLmNhY2hlW2ZpbGVdO1xyXG4gICAgLy8gVE9ERFxyXG59Il19