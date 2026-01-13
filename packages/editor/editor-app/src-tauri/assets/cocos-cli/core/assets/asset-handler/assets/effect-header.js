"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectHeaderHandler = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const effect_compiler_1 = require("../../effect-compiler");
const engine_1 = require("../../../engine");
// 添加所有 builtin 头文件
const builtinChunkDir = (0, path_1.join)(engine_1.Engine.getInfo().typescript.path, './editor/assets/chunks');
const builtinChunks = (() => {
    const arr = [];
    function step(dir) {
        const names = (0, fs_extra_1.readdirSync)(dir);
        names.forEach((name) => {
            const file = (0, path_1.join)(dir, name);
            if (/\.chunk$/.test(name)) {
                arr.push(file);
            }
            else if ((0, fs_extra_1.statSync)(file).isDirectory()) {
                step(file);
            }
        });
    }
    step(builtinChunkDir);
    return arr;
})();
for (let i = 0; i < builtinChunks.length; ++i) {
    const name = (0, path_1.basename)(builtinChunks[i], '.chunk');
    const content = (0, fs_extra_1.readFileSync)(builtinChunks[i], { encoding: 'utf8' });
    (0, effect_compiler_1.addChunk)(name, content);
}
exports.EffectHeaderHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'effect-header',
    // 引擎内对应的类型
    assetType: 'cce.EffectHeader',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newChunk',
                    fullFileName: 'chunk.chunk',
                    template: `db://internal/default_file_content/${exports.EffectHeaderHandler.name}/chunk`,
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.7',
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         *
         * 返回是否导入成功的标记
         * 如果返回 false，则 imported 标记不会变成 true
         * 后续的一系列操作都不会执行
         * @param asset
         */
        async import(asset) {
            try {
                const target = asset._assetDB.options.target;
                const path = (0, path_1.relative)((0, path_1.join)(target, 'chunks'), (0, path_1.dirname)(asset.source)).replace(/\\/g, '/');
                const name = path + (path.length ? '/' : '') + (0, path_1.basename)(asset.source, (0, path_1.extname)(asset.source));
                const content = (0, fs_extra_1.readFileSync)(asset.source, { encoding: 'utf-8' });
                (0, effect_compiler_1.addChunk)(name, content);
                return true;
            }
            catch (err) {
                console.error(err);
                return false;
            }
        },
    },
};
exports.default = exports.EffectHeaderHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0LWhlYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9lZmZlY3QtaGVhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHVDQUErRDtBQUMvRCwrQkFBa0U7QUFDbEUsMkRBQWlEO0FBQ2pELDRDQUF5QztBQUV6QyxtQkFBbUI7QUFDbkIsTUFBTSxlQUFlLEdBQUcsSUFBQSxXQUFJLEVBQUMsZUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztBQUN6RixNQUFNLGFBQWEsR0FBRyxDQUFDLEdBQUcsRUFBRTtJQUN4QixNQUFNLEdBQUcsR0FBYSxFQUFFLENBQUM7SUFDekIsU0FBUyxJQUFJLENBQUMsR0FBVztRQUNyQixNQUFNLEtBQUssR0FBRyxJQUFBLHNCQUFXLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxHQUFHLElBQUEsV0FBSSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3QixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQixDQUFDO2lCQUFNLElBQUksSUFBQSxtQkFBUSxFQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdEIsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUM1QyxNQUFNLElBQUksR0FBRyxJQUFBLGVBQVEsRUFBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEQsTUFBTSxPQUFPLEdBQUcsSUFBQSx1QkFBWSxFQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLElBQUEsMEJBQVEsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVZLFFBQUEsbUJBQW1CLEdBQWlCO0lBQzdDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsZUFBZTtJQUNyQixXQUFXO0lBQ1gsU0FBUyxFQUFFLGtCQUFrQjtJQUM3QixVQUFVLEVBQUU7UUFDUixnQkFBZ0I7WUFDWixPQUFPO2dCQUNIO29CQUNJLEtBQUssRUFBRSw2QkFBNkI7b0JBQ3BDLFlBQVksRUFBRSxhQUFhO29CQUMzQixRQUFRLEVBQUUsc0NBQXNDLDJCQUFtQixDQUFDLElBQUksUUFBUTtvQkFDaEYsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSjtJQUVELFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsT0FBTztRQUVoQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtZQUNyQixJQUFJLENBQUM7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUM3QyxNQUFNLElBQUksR0FBRyxJQUFBLGVBQVEsRUFBQyxJQUFBLFdBQUksRUFBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUUsSUFBQSxjQUFPLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekYsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFBLGVBQVEsRUFBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUEsY0FBTyxFQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUU3RixNQUFNLE9BQU8sR0FBRyxJQUFBLHVCQUFZLEVBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxJQUFBLDBCQUFRLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUV4QixPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1FBQ0wsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLDJCQUFtQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyBBc3NldEhhbmRsZXIgfSBmcm9tICcuLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCByZWFkZGlyU3luYywgc3RhdFN5bmMgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IGJhc2VuYW1lLCBkaXJuYW1lLCBleHRuYW1lLCBqb2luLCByZWxhdGl2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBhZGRDaHVuayB9IGZyb20gJy4uLy4uL2VmZmVjdC1jb21waWxlcic7XHJcbmltcG9ydCB7IEVuZ2luZSB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZSc7XHJcblxyXG4vLyDmt7vliqDmiYDmnIkgYnVpbHRpbiDlpLTmlofku7ZcclxuY29uc3QgYnVpbHRpbkNodW5rRGlyID0gam9pbihFbmdpbmUuZ2V0SW5mbygpLnR5cGVzY3JpcHQucGF0aCwgJy4vZWRpdG9yL2Fzc2V0cy9jaHVua3MnKTtcclxuY29uc3QgYnVpbHRpbkNodW5rcyA9ICgoKSA9PiB7XHJcbiAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gW107XHJcbiAgICBmdW5jdGlvbiBzdGVwKGRpcjogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSByZWFkZGlyU3luYyhkaXIpO1xyXG4gICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGpvaW4oZGlyLCBuYW1lKTtcclxuICAgICAgICAgICAgaWYgKC9cXC5jaHVuayQvLnRlc3QobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGFyci5wdXNoKGZpbGUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRTeW5jKGZpbGUpLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgICAgIHN0ZXAoZmlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoYnVpbHRpbkNodW5rRGlyKTtcclxuICAgIHJldHVybiBhcnI7XHJcbn0pKCk7XHJcblxyXG5mb3IgKGxldCBpID0gMDsgaSA8IGJ1aWx0aW5DaHVua3MubGVuZ3RoOyArK2kpIHtcclxuICAgIGNvbnN0IG5hbWUgPSBiYXNlbmFtZShidWlsdGluQ2h1bmtzW2ldLCAnLmNodW5rJyk7XHJcbiAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGJ1aWx0aW5DaHVua3NbaV0sIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcclxuICAgIGFkZENodW5rKG5hbWUsIGNvbnRlbnQpO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgRWZmZWN0SGVhZGVySGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdlZmZlY3QtaGVhZGVyJyxcclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2NlLkVmZmVjdEhlYWRlcicsXHJcbiAgICBjcmVhdGVJbmZvOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNZW51SW5mbygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46RU5HSU5FLmFzc2V0cy5uZXdDaHVuaycsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbEZpbGVOYW1lOiAnY2h1bmsuY2h1bmsnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBgZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2ZpbGVfY29udGVudC8ke0VmZmVjdEhlYWRlckhhbmRsZXIubmFtZX0vY2h1bmtgLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkZWZhdWx0JyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjcnLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGFzc2V0Ll9hc3NldERCLm9wdGlvbnMudGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IHJlbGF0aXZlKGpvaW4odGFyZ2V0LCAnY2h1bmtzJyksIGRpcm5hbWUoYXNzZXQuc291cmNlKSkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IHBhdGggKyAocGF0aC5sZW5ndGggPyAnLycgOiAnJykgKyBiYXNlbmFtZShhc3NldC5zb3VyY2UsIGV4dG5hbWUoYXNzZXQuc291cmNlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhhc3NldC5zb3VyY2UsIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSk7XHJcbiAgICAgICAgICAgICAgICBhZGRDaHVuayhuYW1lLCBjb250ZW50KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVmZmVjdEhlYWRlckhhbmRsZXI7XHJcbiJdfQ==