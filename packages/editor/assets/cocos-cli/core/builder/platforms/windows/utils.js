'use strict';
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
exports.queryVisualStudioVersion = queryVisualStudioVersion;
exports.executableNameOrDefault = executableNameOrDefault;
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const native_utils_1 = require("../native-common/native-utils");
/**
 * 查询当前设备上安装的 visual studio
 * @returns {name: 用于显示,  value: 用于存储}[]
 */
async function queryVisualStudioVersion() {
    const cmakePath = await (0, native_utils_1.getCmakePath)();
    const tmpDir = os.tmpdir();
    const vsVersions = [
        ['-G', '"Visual Studio 17 2022"'], '2022',
        ['-G', '"Visual Studio 16 2019"'], '2019',
        ['-G', '"Visual Studio 15 2017"', '-A', 'x64'], '2017',
        ['-G', '"Visual Studio 14 2015"', '-A', 'x64'], '2015',
    ];
    const testCMake = (cwd) => async (G, ver) => {
        return new Promise((resolve, reject) => {
            const result = (0, child_process_1.spawn)(cmakePath, G.concat(`-B build_${ver}`), {
                cwd,
                shell: true,
            });
            result.on('close', (code, signal) => {
                resolve(code == 0);
            });
            return false;
        });
    };
    const dir = await (0, fs_extra_1.mkdtemp)((0, path_1.join)(tmpDir, 'cmake-vs'));
    console.log(`Create temp dir ${dir}`);
    const cmakeListFile = (0, path_1.join)(dir, 'CMakeLists.txt');
    const helloFile = (0, path_1.join)(dir, 'hello.cpp');
    const helloSrc = `
	#include <iostream>
	int main(int argc, char **argv) {
	std::cout << "hello cocos" << std::endl;
	return 0;
	}
	`;
    const cmakeListSrc = `
	cmake_minimum_required(VERSION 3.8)
	project(hello CXX)
	add_executable(hello hello.cpp)
	`;
    await (0, fs_extra_1.writeFile)(cmakeListFile, cmakeListSrc);
    await (0, fs_extra_1.writeFile)(helloFile, helloSrc);
    const versions = [];
    const tryCmake = testCMake(dir);
    for (let i = 0; i < vsVersions.length; i += 2) {
        const G = vsVersions[i];
        const verStr = vsVersions[i + 1];
        if (await tryCmake(G.concat('-S.'), verStr)) {
            versions.push({
                name: `Visual Studio ${verStr}`,
                value: verStr,
            });
        }
    }
    return versions;
}
function executableNameOrDefault(projectName, executableName) {
    if (executableName)
        return executableName;
    if (/^[0-9a-zA-Z_-]+$/.test(projectName))
        return projectName;
    return 'CocosGame';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy93aW5kb3dzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFZYiw0REF5REM7QUFHRCwwREFJQztBQTFFRCwrQkFBNEI7QUFDNUIsdUNBQThDO0FBQzlDLGlEQUFzQztBQUN0Qyx1Q0FBeUI7QUFDekIsZ0VBQTZEO0FBRTdEOzs7R0FHRztBQUNJLEtBQUssVUFBVSx3QkFBd0I7SUFFMUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDJCQUFZLEdBQUUsQ0FBQztJQUN2QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0IsTUFBTSxVQUFVLEdBQUc7UUFDZixDQUFDLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxFQUFFLE1BQU07UUFDekMsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLENBQUMsRUFBRSxNQUFNO1FBQ3pDLENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxNQUFNO1FBQ3RELENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxNQUFNO0tBQ3pELENBQUM7SUFDRixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQVcsRUFBRSxHQUFXLEVBQW9CLEVBQUU7UUFDcEYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFBLHFCQUFLLEVBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxFQUFFO2dCQUN6RCxHQUFHO2dCQUNILEtBQUssRUFBRSxJQUFJO2FBQ2QsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztJQUVGLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBQSxrQkFBTyxFQUFDLElBQUEsV0FBSSxFQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBRXBELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFdEMsTUFBTSxhQUFhLEdBQUcsSUFBQSxXQUFJLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBQSxXQUFJLEVBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sUUFBUSxHQUFHOzs7Ozs7RUFNbkIsQ0FBQztJQUNDLE1BQU0sWUFBWSxHQUFHOzs7O0VBSXZCLENBQUM7SUFDQyxNQUFNLElBQUEsb0JBQVMsRUFBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDN0MsTUFBTSxJQUFBLG9CQUFTLEVBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRXJDLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNwQixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxHQUFhLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxNQUFNLE1BQU0sR0FBVyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksTUFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ1YsSUFBSSxFQUFFLGlCQUFpQixNQUFNLEVBQUU7Z0JBQy9CLEtBQUssRUFBRSxNQUFNO2FBQ2hCLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQUdELFNBQWdCLHVCQUF1QixDQUFDLFdBQW1CLEVBQUUsY0FBdUI7SUFDaEYsSUFBSSxjQUFjO1FBQUUsT0FBTyxjQUFjLENBQUM7SUFDMUMsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQUUsT0FBTyxXQUFXLENBQUM7SUFDN0QsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IG1rZHRlbXAsIHdyaXRlRmlsZSB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xyXG5pbXBvcnQgeyBnZXRDbWFrZVBhdGggfSBmcm9tICcuLi9uYXRpdmUtY29tbW9uL25hdGl2ZS11dGlscyc7XHJcblxyXG4vKipcclxuICog5p+l6K+i5b2T5YmN6K6+5aSH5LiK5a6J6KOF55qEIHZpc3VhbCBzdHVkaW9cclxuICogQHJldHVybnMge25hbWU6IOeUqOS6juaYvuekuiwgIHZhbHVlOiDnlKjkuo7lrZjlgqh9W10gXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcXVlcnlWaXN1YWxTdHVkaW9WZXJzaW9uKCkge1xyXG5cclxuICAgIGNvbnN0IGNtYWtlUGF0aCA9IGF3YWl0IGdldENtYWtlUGF0aCgpO1xyXG4gICAgY29uc3QgdG1wRGlyID0gb3MudG1wZGlyKCk7XHJcbiAgICBjb25zdCB2c1ZlcnNpb25zID0gW1xyXG4gICAgICAgIFsnLUcnLCAnXCJWaXN1YWwgU3R1ZGlvIDE3IDIwMjJcIiddLCAnMjAyMicsXHJcbiAgICAgICAgWyctRycsICdcIlZpc3VhbCBTdHVkaW8gMTYgMjAxOVwiJ10sICcyMDE5JyxcclxuICAgICAgICBbJy1HJywgJ1wiVmlzdWFsIFN0dWRpbyAxNSAyMDE3XCInLCAnLUEnLCAneDY0J10sICcyMDE3JyxcclxuICAgICAgICBbJy1HJywgJ1wiVmlzdWFsIFN0dWRpbyAxNCAyMDE1XCInLCAnLUEnLCAneDY0J10sICcyMDE1JyxcclxuICAgIF07XHJcbiAgICBjb25zdCB0ZXN0Q01ha2UgPSAoY3dkOiBzdHJpbmcpID0+IGFzeW5jIChHOiBzdHJpbmdbXSwgdmVyOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzcGF3bihjbWFrZVBhdGgsIEcuY29uY2F0KGAtQiBidWlsZF8ke3Zlcn1gKSwge1xyXG4gICAgICAgICAgICAgICAgY3dkLFxyXG4gICAgICAgICAgICAgICAgc2hlbGw6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXN1bHQub24oJ2Nsb3NlJywgKGNvZGUsIHNpZ25hbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb2RlID09IDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkaXIgPSBhd2FpdCBta2R0ZW1wKGpvaW4odG1wRGlyLCAnY21ha2UtdnMnKSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coYENyZWF0ZSB0ZW1wIGRpciAke2Rpcn1gKTtcclxuXHJcbiAgICBjb25zdCBjbWFrZUxpc3RGaWxlID0gam9pbihkaXIsICdDTWFrZUxpc3RzLnR4dCcpO1xyXG4gICAgY29uc3QgaGVsbG9GaWxlID0gam9pbihkaXIsICdoZWxsby5jcHAnKTtcclxuICAgIGNvbnN0IGhlbGxvU3JjID0gYFxyXG5cdCNpbmNsdWRlIDxpb3N0cmVhbT5cclxuXHRpbnQgbWFpbihpbnQgYXJnYywgY2hhciAqKmFyZ3YpIHtcclxuXHRzdGQ6OmNvdXQgPDwgXCJoZWxsbyBjb2Nvc1wiIDw8IHN0ZDo6ZW5kbDtcclxuXHRyZXR1cm4gMDtcclxuXHR9XHJcblx0YDtcclxuICAgIGNvbnN0IGNtYWtlTGlzdFNyYyA9IGBcclxuXHRjbWFrZV9taW5pbXVtX3JlcXVpcmVkKFZFUlNJT04gMy44KVxyXG5cdHByb2plY3QoaGVsbG8gQ1hYKVxyXG5cdGFkZF9leGVjdXRhYmxlKGhlbGxvIGhlbGxvLmNwcClcclxuXHRgO1xyXG4gICAgYXdhaXQgd3JpdGVGaWxlKGNtYWtlTGlzdEZpbGUsIGNtYWtlTGlzdFNyYyk7XHJcbiAgICBhd2FpdCB3cml0ZUZpbGUoaGVsbG9GaWxlLCBoZWxsb1NyYyk7XHJcblxyXG4gICAgY29uc3QgdmVyc2lvbnMgPSBbXTtcclxuICAgIGNvbnN0IHRyeUNtYWtlID0gdGVzdENNYWtlKGRpcik7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZzVmVyc2lvbnMubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgICAgICBjb25zdCBHID0gPHN0cmluZ1tdPnZzVmVyc2lvbnNbaV07XHJcbiAgICAgICAgY29uc3QgdmVyU3RyID0gPHN0cmluZz52c1ZlcnNpb25zW2kgKyAxXTtcclxuICAgICAgICBpZiAoYXdhaXQgdHJ5Q21ha2UoRy5jb25jYXQoJy1TLicpLCB2ZXJTdHIpKSB7XHJcbiAgICAgICAgICAgIHZlcnNpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogYFZpc3VhbCBTdHVkaW8gJHt2ZXJTdHJ9YCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2ZXJTdHIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB2ZXJzaW9ucztcclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRhYmxlTmFtZU9yRGVmYXVsdChwcm9qZWN0TmFtZTogc3RyaW5nLCBleGVjdXRhYmxlTmFtZT86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAoZXhlY3V0YWJsZU5hbWUpIHJldHVybiBleGVjdXRhYmxlTmFtZTtcclxuICAgIGlmICgvXlswLTlhLXpBLVpfLV0rJC8udGVzdChwcm9qZWN0TmFtZSkpIHJldHVybiBwcm9qZWN0TmFtZTtcclxuICAgIHJldHVybiAnQ29jb3NHYW1lJztcclxufSJdfQ==