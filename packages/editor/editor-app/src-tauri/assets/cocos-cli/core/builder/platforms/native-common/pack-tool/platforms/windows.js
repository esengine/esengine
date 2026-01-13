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
const fs = __importStar(require("fs-extra"));
const ps = __importStar(require("path"));
const os = __importStar(require("os"));
const utils_1 = require("../utils");
const cocosConfig_1 = __importDefault(require("../cocosConfig"));
const default_1 = __importDefault(require("../base/default"));
class WindowsPackTool extends default_1.default {
    async create() {
        await this.copyCommonTemplate();
        await this.copyPlatformTemplate();
        await this.generateCMakeConfig();
        await this.executeCocosTemplateTask();
        await this.encryptScripts();
        return true;
    }
    async generate() {
        const nativePrjDir = this.paths.nativePrjDir;
        const cmakePath = ps.join(this.paths.platformTemplateDirInPrj, 'CMakeLists.txt');
        if (!fs.existsSync(cmakePath)) {
            throw new Error(`CMakeLists.txt not found in ${cmakePath}`);
        }
        if (!fs.existsSync(nativePrjDir)) {
            utils_1.cchelper.makeDirectoryRecursive(nativePrjDir);
        }
        let generateArgs = [];
        if (!fs.existsSync(ps.join(nativePrjDir, 'CMakeCache.txt'))) {
            const vsVersion = this.getCmakeGenerator();
            // const g = '';
            if (vsVersion) {
                const optlist = cocosConfig_1.default.cmake.windows.generators.filter((x) => x.V === vsVersion);
                if (optlist.length > 0) {
                    generateArgs.push(`-G"${optlist[0].G}"`);
                }
                if (Number.parseInt(vsVersion) <= 2017) {
                    generateArgs.push('-A', this.params.platformParams.targetPlatform);
                }
            }
            else {
                generateArgs = generateArgs.concat(await this.windowsSelectCmakeGeneratorArgs());
            }
        }
        this.appendCmakeCommonArgs(generateArgs);
        await utils_1.toolHelper.runCmake([`-S"${utils_1.cchelper.fixPath(this.paths.platformTemplateDirInPrj)}"`, `-B"${utils_1.cchelper.fixPath(this.paths.nativePrjDir)}"`].concat(generateArgs));
        return true;
    }
    async make() {
        const nativePrjDir = this.paths.nativePrjDir;
        await utils_1.toolHelper.runCmake(['--build', `"${utils_1.cchelper.fixPath(nativePrjDir)}"`, '--config', this.params.debug ? 'Debug' : 'Release', '--', '-verbosity:quiet']);
        return true;
    }
    static async openWithIDE(nativePrjDir) {
        await utils_1.toolHelper.runCmake(['--open', `"${utils_1.cchelper.fixPath(nativePrjDir)}"`]);
        return true;
    }
    async windowsSelectCmakeGeneratorArgs() {
        console.log(`selecting visual studio generator ...`);
        const visualstudioGenerators = cocosConfig_1.default.cmake.windows.generators;
        const testProjDir = await fs.mkdtemp(ps.join(os.tmpdir(), 'cmakeTest_'));
        const testCmakeListsPath = ps.join(testProjDir, 'CMakeLists.txt');
        const testCppFile = ps.join(testProjDir, 'test.cpp');
        {
            const cmakeContent = `
            cmake_minimum_required(VERSION 3.8)
            set(APP_NAME test-cmake)
            project(\${APP_NAME} CXX)
            add_library(\${APP_NAME} test.cpp)
            `;
            const cppSrc = `
            #include<iostream>
            int main(int argc, char **argv)
            {
                std::cout << "Hello World" << std::endl;
                return 0;
            }
            `;
            await fs.writeFile(testCmakeListsPath, cmakeContent);
            await fs.writeFile(testCppFile, cppSrc);
        }
        const availableGenerators = [];
        for (const cfg of visualstudioGenerators) {
            const nativePrjDir = ps.join(testProjDir, `build_${cfg.G.replace(/ /g, '_')}`);
            const args = [`-S"${testProjDir}"`, `-G"${cfg.G}"`, `-B"${nativePrjDir}"`];
            args.push('-A', this.params.platformParams.targetPlatform);
            await fs.mkdir(nativePrjDir);
            try {
                await utils_1.toolHelper.runCmake(args, nativePrjDir);
                availableGenerators.push(cfg.G);
                break;
            }
            catch (error) {
                console.debug(error);
            }
            await utils_1.cchelper.removeDirectoryRecursive(nativePrjDir);
        }
        await utils_1.cchelper.removeDirectoryRecursive(testProjDir);
        const ret = [];
        if (availableGenerators.length === 0) {
            return []; // use cmake default option -G
        }
        const opt = visualstudioGenerators.filter((x) => x.G === availableGenerators[0])[0];
        ret.push('-A', this.params.platformParams.targetPlatform);
        console.log(` using ${opt.G}`);
        return ret;
    }
    getCmakeGenerator() {
        return this.params.platformParams.vsVersion || '';
    }
    async getExecutableFile() {
        const executableDir = ps.join(this.paths.nativePrjDir, this.params.debug ? 'Debug' : 'Release');
        const targetFile = this.getExecutableNameOrDefault();
        const executableFile = ps.join(executableDir, targetFile + '.exe');
        if (!executableFile || !fs.existsSync(executableFile)) {
            throw new Error(`[windows run] '${targetFile}' is not found within ' + ${executableDir}!`);
        }
        return executableFile;
    }
    async run() {
        const executableDir = ps.join(this.paths.nativePrjDir, this.params.debug ? 'Debug' : 'Release');
        const executableFile = await this.getExecutableFile();
        // 不等待，否则运行接口调用会一直卡在那里
        utils_1.cchelper.runCmd(ps.basename(executableFile), [], false, executableDir);
        return true;
    }
}
exports.default = WindowsPackTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvcGxhdGZvcm1zL25hdGl2ZS1jb21tb24vcGFjay10b29sL3BsYXRmb3Jtcy93aW5kb3dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLHlDQUEyQjtBQUMzQix1Q0FBeUI7QUFDekIsb0NBQWdEO0FBQ2hELGlFQUF5QztBQUN6Qyw4REFBOEQ7QUFPOUQsTUFBcUIsZUFBZ0IsU0FBUSxpQkFBYztJQUd2RCxLQUFLLENBQUMsTUFBTTtRQUNSLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDaEMsTUFBTSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNsQyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFFdEMsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRO1FBQ1YsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7UUFFN0MsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDakYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lB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R0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUNyRCxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUNwRCxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixVQUFVLDZCQUE2QixhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFDRCxPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQUc7UUFDTCxNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hHLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDdEQsc0JBQXNCO1FBQ3RCLGdCQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN2RSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUF0SUQsa0NBc0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgKiBhcyBwcyBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xyXG5pbXBvcnQgeyBjY2hlbHBlciwgdG9vbEhlbHBlciB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IGNvY29zQ29uZmlnIGZyb20gJy4uL2NvY29zQ29uZmlnJztcclxuaW1wb3J0IE5hdGl2ZVBhY2tUb29sLCB7IENvY29zUGFyYW1zIH0gZnJvbSAnLi4vYmFzZS9kZWZhdWx0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVdpbmRvd3NQYXJhbSB7XHJcbiAgICB0YXJnZXRQbGF0Zm9ybTogJ3g2NCc7XHJcbiAgICB2c1ZlcnNpb246IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2luZG93c1BhY2tUb29sIGV4dGVuZHMgTmF0aXZlUGFja1Rvb2wge1xyXG4gICAgZGVjbGFyZSBwYXJhbXM6IENvY29zUGFyYW1zPElXaW5kb3dzUGFyYW0+O1xyXG5cclxuICAgIGFzeW5jIGNyZWF0ZSgpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLmNvcHlDb21tb25UZW1wbGF0ZSgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuY29weVBsYXRmb3JtVGVtcGxhdGUoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmdlbmVyYXRlQ01ha2VDb25maWcoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmV4ZWN1dGVDb2Nvc1RlbXBsYXRlVGFzaygpO1xyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLmVuY3J5cHRTY3JpcHRzKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2VuZXJhdGUoKSB7XHJcbiAgICAgICAgY29uc3QgbmF0aXZlUHJqRGlyID0gdGhpcy5wYXRocy5uYXRpdmVQcmpEaXI7XHJcblxyXG4gICAgICAgIGNvbnN0IGNtYWtlUGF0aCA9IHBzLmpvaW4odGhpcy5wYXRocy5wbGF0Zm9ybVRlbXBsYXRlRGlySW5QcmosICdDTWFrZUxpc3RzLnR4dCcpO1xyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhjbWFrZVBhdGgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ01ha2VMaXN0cy50eHQgbm90IGZvdW5kIGluICR7Y21ha2VQYXRofWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG5hdGl2ZVByakRpcikpIHtcclxuICAgICAgICAgICAgY2NoZWxwZXIubWFrZURpcmVjdG9yeVJlY3Vyc2l2ZShuYXRpdmVQcmpEaXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGdlbmVyYXRlQXJnczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHMuam9pbihuYXRpdmVQcmpEaXIsICdDTWFrZUNhY2hlLnR4dCcpKSkge1xyXG4gICAgICAgICAgICBjb25zdCB2c1ZlcnNpb24gPSB0aGlzLmdldENtYWtlR2VuZXJhdG9yKCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IGcgPSAnJztcclxuICAgICAgICAgICAgaWYgKHZzVmVyc2lvbikge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3B0bGlzdCA9IGNvY29zQ29uZmlnLmNtYWtlLndpbmRvd3MuZ2VuZXJhdG9ycy5maWx0ZXIoKHgpID0+IHguViA9PT0gdnNWZXJzaW9uKTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUFyZ3MucHVzaChgLUdcIiR7b3B0bGlzdFswXS5HfVwiYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoTnVtYmVyLnBhcnNlSW50KHZzVmVyc2lvbikgPD0gMjAxNykge1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlQXJncy5wdXNoKCctQScsIHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zLnRhcmdldFBsYXRmb3JtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdlbmVyYXRlQXJncyA9IGdlbmVyYXRlQXJncy5jb25jYXQoYXdhaXQgdGhpcy53aW5kb3dzU2VsZWN0Q21ha2VHZW5lcmF0b3JBcmdzKCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFwcGVuZENtYWtlQ29tbW9uQXJncyhnZW5lcmF0ZUFyZ3MpO1xyXG4gICAgICAgIGF3YWl0IHRvb2xIZWxwZXIucnVuQ21ha2UoW2AtU1wiJHtjY2hlbHBlci5maXhQYXRoKHRoaXMucGF0aHMucGxhdGZvcm1UZW1wbGF0ZURpckluUHJqKX1cImAsIGAtQlwiJHtjY2hlbHBlci5maXhQYXRoKHRoaXMucGF0aHMubmF0aXZlUHJqRGlyKX1cImBdLmNvbmNhdChnZW5lcmF0ZUFyZ3MpKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBtYWtlKCkge1xyXG4gICAgICAgIGNvbnN0IG5hdGl2ZVByakRpciA9IHRoaXMucGF0aHMubmF0aXZlUHJqRGlyO1xyXG4gICAgICAgIGF3YWl0IHRvb2xIZWxwZXIucnVuQ21ha2UoWyctLWJ1aWxkJywgYFwiJHtjY2hlbHBlci5maXhQYXRoKG5hdGl2ZVByakRpcil9XCJgLCAnLS1jb25maWcnLCB0aGlzLnBhcmFtcy5kZWJ1ZyA/ICdEZWJ1ZycgOiAnUmVsZWFzZScsICctLScsICctdmVyYm9zaXR5OnF1aWV0J10pO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElERShuYXRpdmVQcmpEaXI6IHN0cmluZykge1xyXG4gICAgICAgIGF3YWl0IHRvb2xIZWxwZXIucnVuQ21ha2UoWyctLW9wZW4nLCBgXCIke2NjaGVscGVyLmZpeFBhdGgobmF0aXZlUHJqRGlyKX1cImBdKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB3aW5kb3dzU2VsZWN0Q21ha2VHZW5lcmF0b3JBcmdzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYHNlbGVjdGluZyB2aXN1YWwgc3R1ZGlvIGdlbmVyYXRvciAuLi5gKTtcclxuICAgICAgICBjb25zdCB2aXN1YWxzdHVkaW9HZW5lcmF0b3JzID0gY29jb3NDb25maWcuY21ha2Uud2luZG93cy5nZW5lcmF0b3JzO1xyXG5cclxuICAgICAgICBjb25zdCB0ZXN0UHJvakRpciA9IGF3YWl0IGZzLm1rZHRlbXAocHMuam9pbihvcy50bXBkaXIoKSwgJ2NtYWtlVGVzdF8nKSk7XHJcbiAgICAgICAgY29uc3QgdGVzdENtYWtlTGlzdHNQYXRoID0gcHMuam9pbih0ZXN0UHJvakRpciwgJ0NNYWtlTGlzdHMudHh0Jyk7XHJcbiAgICAgICAgY29uc3QgdGVzdENwcEZpbGUgPSBwcy5qb2luKHRlc3RQcm9qRGlyLCAndGVzdC5jcHAnKTtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNtYWtlQ29udGVudCA9IGBcclxuICAgICAgICAgICAgY21ha2VfbWluaW11bV9yZXF1aXJlZChWRVJTSU9OIDMuOClcclxuICAgICAgICAgICAgc2V0KEFQUF9OQU1FIHRlc3QtY21ha2UpXHJcbiAgICAgICAgICAgIHByb2plY3QoXFwke0FQUF9OQU1FfSBDWFgpXHJcbiAgICAgICAgICAgIGFkZF9saWJyYXJ5KFxcJHtBUFBfTkFNRX0gdGVzdC5jcHApXHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIGNvbnN0IGNwcFNyYyA9IGBcclxuICAgICAgICAgICAgI2luY2x1ZGU8aW9zdHJlYW0+XHJcbiAgICAgICAgICAgIGludCBtYWluKGludCBhcmdjLCBjaGFyICoqYXJndilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3RkOjpjb3V0IDw8IFwiSGVsbG8gV29ybGRcIiA8PCBzdGQ6OmVuZGw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUodGVzdENtYWtlTGlzdHNQYXRoLCBjbWFrZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUodGVzdENwcEZpbGUsIGNwcFNyYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhdmFpbGFibGVHZW5lcmF0b3JzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgY2ZnIG9mIHZpc3VhbHN0dWRpb0dlbmVyYXRvcnMpIHtcclxuICAgICAgICAgICAgY29uc3QgbmF0aXZlUHJqRGlyID0gcHMuam9pbih0ZXN0UHJvakRpciwgYGJ1aWxkXyR7Y2ZnLkcucmVwbGFjZSgvIC9nLCAnXycpfWApO1xyXG4gICAgICAgICAgICBjb25zdCBhcmdzOiBzdHJpbmdbXSA9IFtgLVNcIiR7dGVzdFByb2pEaXJ9XCJgLCBgLUdcIiR7Y2ZnLkd9XCJgLCBgLUJcIiR7bmF0aXZlUHJqRGlyfVwiYF07XHJcbiAgICAgICAgICAgIGFyZ3MucHVzaCgnLUEnLCB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcy50YXJnZXRQbGF0Zm9ybSk7XHJcbiAgICAgICAgICAgIGF3YWl0IGZzLm1rZGlyKG5hdGl2ZVByakRpcik7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0b29sSGVscGVyLnJ1bkNtYWtlKGFyZ3MsIG5hdGl2ZVByakRpcik7XHJcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVHZW5lcmF0b3JzLnB1c2goY2ZnLkcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgY2NoZWxwZXIucmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlKG5hdGl2ZVByakRpcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IGNjaGVscGVyLnJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZSh0ZXN0UHJvakRpcik7XHJcblxyXG4gICAgICAgIGNvbnN0IHJldDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBpZiAoYXZhaWxhYmxlR2VuZXJhdG9ycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdOyAvLyB1c2UgY21ha2UgZGVmYXVsdCBvcHRpb24gLUdcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgb3B0ID0gdmlzdWFsc3R1ZGlvR2VuZXJhdG9ycy5maWx0ZXIoKHgpID0+IHguRyA9PT0gYXZhaWxhYmxlR2VuZXJhdG9yc1swXSlbMF07XHJcbiAgICAgICAgcmV0LnB1c2goJy1BJywgdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMudGFyZ2V0UGxhdGZvcm0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGAgdXNpbmcgJHtvcHQuR31gKTtcclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldENtYWtlR2VuZXJhdG9yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcy52c1ZlcnNpb24gfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0RXhlY3V0YWJsZUZpbGUoKSB7XHJcbiAgICAgICAgY29uc3QgZXhlY3V0YWJsZURpciA9IHBzLmpvaW4odGhpcy5wYXRocy5uYXRpdmVQcmpEaXIsIHRoaXMucGFyYW1zLmRlYnVnID8gJ0RlYnVnJyA6ICdSZWxlYXNlJyk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0RmlsZSA9IHRoaXMuZ2V0RXhlY3V0YWJsZU5hbWVPckRlZmF1bHQoKTtcclxuICAgICAgICBjb25zdCBleGVjdXRhYmxlRmlsZSA9IHBzLmpvaW4oZXhlY3V0YWJsZURpciwgdGFyZ2V0RmlsZSArICcuZXhlJyk7XHJcbiAgICAgICAgaWYgKCFleGVjdXRhYmxlRmlsZSB8fCAhZnMuZXhpc3RzU3luYyhleGVjdXRhYmxlRmlsZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbd2luZG93cyBydW5dICcke3RhcmdldEZpbGV9JyBpcyBub3QgZm91bmQgd2l0aGluICcgKyAke2V4ZWN1dGFibGVEaXJ9IWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXhlY3V0YWJsZUZpbGU7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IGV4ZWN1dGFibGVEaXIgPSBwcy5qb2luKHRoaXMucGF0aHMubmF0aXZlUHJqRGlyLCB0aGlzLnBhcmFtcy5kZWJ1ZyA/ICdEZWJ1ZycgOiAnUmVsZWFzZScpO1xyXG4gICAgICAgIGNvbnN0IGV4ZWN1dGFibGVGaWxlID0gYXdhaXQgdGhpcy5nZXRFeGVjdXRhYmxlRmlsZSgpO1xyXG4gICAgICAgIC8vIOS4jeetieW+he+8jOWQpuWImei/kOihjOaOpeWPo+iwg+eUqOS8muS4gOebtOWNoeWcqOmCo+mHjFxyXG4gICAgICAgIGNjaGVscGVyLnJ1bkNtZChwcy5iYXNlbmFtZShleGVjdXRhYmxlRmlsZSksIFtdLCBmYWxzZSwgZXhlY3V0YWJsZURpcik7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuIl19