"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packMods = packMods;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const concat_with_sourcemaps_1 = __importDefault(require("concat-with-sourcemaps"));
/**
 * 打包指定的所有脚本到一个单独的脚本中。
 * @param mods
 * @param chunkMappings
 * @param outFile
 * @param options
 */
async function packMods(mods, chunkMappings, outFile, options) {
    const { sourceMaps } = options;
    const concat = new concat_with_sourcemaps_1.default(true, 'all.js', '\n');
    if (options.wrap) {
        concat.add(null, 'System.register([], function(_export, _context) { return { execute: function () {');
    }
    for (const mod of mods) {
        concat.add(null, mod.code, mod.map);
    }
    if (Object.keys(chunkMappings).length !== 0) {
        concat.add(null, `\
(function(r) {
${Object.keys(chunkMappings).map((mapping) => `  r('${mapping}', '${chunkMappings[mapping]}');`).join('\n')} 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});\
`);
    }
    if (options.wrap) {
        concat.add(null, '} }; });');
    }
    if (sourceMaps && concat.sourceMap) {
        if (sourceMaps === 'inline') {
            const b64 = Buffer.from(concat.sourceMap).toString('base64');
            concat.add(null, `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${b64}`);
        }
        else {
            concat.add(null, `//# sourceMappingURL=${path_1.default.basename(outFile)}.map`);
        }
    }
    await fs_extra_1.default.ensureDir(path_1.default.dirname(outFile));
    await fs_extra_1.default.writeFile(outFile, concat.content.toString());
    if (sourceMaps && concat.sourceMap && sourceMaps !== 'inline') {
        await fs_extra_1.default.writeFile(`${outFile}.map`, concat.sourceMap);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjay1tb2RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci91dGlscy9wYWNrLW1vZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFnQkEsNEJBNERDO0FBNUVELHdEQUEwQjtBQUMxQixnREFBc0I7QUFDdEIsb0ZBQXlEO0FBT3pEOzs7Ozs7R0FNRztBQUNJLEtBQUssVUFBVSxRQUFRLENBQzFCLElBQVksRUFDWixhQUFxQyxFQUNyQyxPQUFlLEVBQ2YsT0FBeUQ7SUFFekQsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUUvQixNQUFNLE1BQU0sR0FBRyxJQUFJLGdDQUFtQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFN0QsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtRkFBbUYsQ0FBQyxDQUFDO0lBQzFHLENBQUM7SUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFOztFQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsUUFBUSxPQUFPLE9BQU8sYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCMUcsQ0FBQyxDQUFDO0lBQ0MsQ0FBQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELElBQUksVUFBVSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQyxJQUFJLFVBQVUsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMxQixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUVBQW1FLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDL0YsQ0FBQzthQUFNLENBQUM7WUFDSixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSx3QkFBd0IsY0FBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekUsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLGtCQUFFLENBQUMsU0FBUyxDQUFDLGNBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4QyxNQUFNLGtCQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDdkQsSUFBSSxVQUFVLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDNUQsTUFBTSxrQkFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzRCxDQUFDO0FBRUwsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCBwcyBmcm9tICdwYXRoJztcclxuaW1wb3J0IGNvbmNhdFdpdGhTb3VyY2VNYXAgZnJvbSAnY29uY2F0LXdpdGgtc291cmNlbWFwcyc7XHJcblxyXG5pbnRlcmZhY2UgSU1vZCB7XHJcbiAgICBjb2RlOiBzdHJpbmc7XHJcbiAgICBtYXA/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmiZPljIXmjIflrprnmoTmiYDmnInohJrmnKzliLDkuIDkuKrljZXni6znmoTohJrmnKzkuK3jgIJcclxuICogQHBhcmFtIG1vZHMgXHJcbiAqIEBwYXJhbSBjaHVua01hcHBpbmdzIFxyXG4gKiBAcGFyYW0gb3V0RmlsZSBcclxuICogQHBhcmFtIG9wdGlvbnMgXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFja01vZHMoXHJcbiAgICBtb2RzOiBJTW9kW10sXHJcbiAgICBjaHVua01hcHBpbmdzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LFxyXG4gICAgb3V0RmlsZTogc3RyaW5nLFxyXG4gICAgb3B0aW9uczoge3NvdXJjZU1hcHM6IGJvb2xlYW4gfCAnaW5saW5lJywgd3JhcD86IGJvb2xlYW59LFxyXG4pIHtcclxuICAgIGNvbnN0IHsgc291cmNlTWFwcyB9ID0gb3B0aW9ucztcclxuXHJcbiAgICBjb25zdCBjb25jYXQgPSBuZXcgY29uY2F0V2l0aFNvdXJjZU1hcCh0cnVlLCAnYWxsLmpzJywgJ1xcbicpO1xyXG5cclxuICAgIGlmIChvcHRpb25zLndyYXApIHtcclxuICAgICAgICBjb25jYXQuYWRkKG51bGwsICdTeXN0ZW0ucmVnaXN0ZXIoW10sIGZ1bmN0aW9uKF9leHBvcnQsIF9jb250ZXh0KSB7IHJldHVybiB7IGV4ZWN1dGU6IGZ1bmN0aW9uICgpIHsnKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IG1vZCBvZiBtb2RzKSB7XHJcbiAgICAgICAgY29uY2F0LmFkZChudWxsLCBtb2QuY29kZSwgbW9kLm1hcCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKE9iamVjdC5rZXlzKGNodW5rTWFwcGluZ3MpLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgIGNvbmNhdC5hZGQobnVsbCwgYFxcXHJcbihmdW5jdGlvbihyKSB7XHJcbiR7T2JqZWN0LmtleXMoY2h1bmtNYXBwaW5ncykubWFwKChtYXBwaW5nKSA9PiBgICByKCcke21hcHBpbmd9JywgJyR7Y2h1bmtNYXBwaW5nc1ttYXBwaW5nXX0nKTtgKS5qb2luKCdcXG4nKX0gXHJcbn0pKGZ1bmN0aW9uKG1pZCwgY2lkKSB7XHJcbiAgICBTeXN0ZW0ucmVnaXN0ZXIobWlkLCBbY2lkXSwgZnVuY3Rpb24gKF9leHBvcnQsIF9jb250ZXh0KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNldHRlcnM6IFtmdW5jdGlvbihfbSkge1xyXG4gICAgICAgICAgICB2YXIgX2V4cG9ydE9iaiA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgX2tleSBpbiBfbSkge1xyXG4gICAgICAgICAgICAgIGlmIChfa2V5ICE9PSBcImRlZmF1bHRcIiAmJiBfa2V5ICE9PSBcIl9fZXNNb2R1bGVcIikgX2V4cG9ydE9ialtfa2V5XSA9IF9tW19rZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAgICAgICBfZXhwb3J0KF9leHBvcnRPYmopO1xyXG4gICAgICAgIH1dLFxyXG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uICgpIHsgfVxyXG4gICAgfTtcclxuICAgIH0pO1xyXG59KTtcXFxyXG5gKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy53cmFwKSB7XHJcbiAgICAgICAgY29uY2F0LmFkZChudWxsLCAnfSB9OyB9KTsnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc291cmNlTWFwcyAmJiBjb25jYXQuc291cmNlTWFwKSB7XHJcbiAgICAgICAgaWYgKHNvdXJjZU1hcHMgPT09ICdpbmxpbmUnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGI2NCA9IEJ1ZmZlci5mcm9tKGNvbmNhdC5zb3VyY2VNYXApLnRvU3RyaW5nKCdiYXNlNjQnKTtcclxuICAgICAgICAgICAgY29uY2F0LmFkZChudWxsLCBgLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCR7YjY0fWApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbmNhdC5hZGQobnVsbCwgYC8vIyBzb3VyY2VNYXBwaW5nVVJMPSR7cHMuYmFzZW5hbWUob3V0RmlsZSl9Lm1hcGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCBmcy5lbnN1cmVEaXIocHMuZGlybmFtZShvdXRGaWxlKSk7XHJcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUob3V0RmlsZSwgY29uY2F0LmNvbnRlbnQudG9TdHJpbmcoKSk7XHJcbiAgICBpZiAoc291cmNlTWFwcyAmJiBjb25jYXQuc291cmNlTWFwICYmIHNvdXJjZU1hcHMgIT09ICdpbmxpbmUnKSB7XHJcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGAke291dEZpbGV9Lm1hcGAsIGNvbmNhdC5zb3VyY2VNYXApO1xyXG4gICAgfVxyXG5cclxufVxyXG4iXX0=