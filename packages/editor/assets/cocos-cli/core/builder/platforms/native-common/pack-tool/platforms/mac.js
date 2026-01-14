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
const child_process_1 = require("child_process");
const fs = __importStar(require("fs-extra"));
const ps = __importStar(require("path"));
const utils_1 = require("../utils");
const mac_os_1 = require("./mac-os");
class MacPackTool extends mac_os_1.MacOSPackTool {
    async create() {
        await super.create();
        await this.encryptScripts();
        return true;
    }
    async getExecutableFile() {
        const executableDir = ps.join(this.paths.nativePrjDir, this.params.debug ? 'Debug' : 'Release');
        const targetFile = this.getExecutableNameOrDefault();
        const executableFile = ps.join(executableDir, targetFile + '.app');
        if (!executableFile || !fs.existsSync(executableFile)) {
            throw new Error(`[mac run] '${targetFile}' is not found within ' + ${executableDir}!`);
        }
        return executableFile;
    }
    async generate() {
        if (!await this.checkIfXcodeInstalled()) {
            console.error(`Please check if Xcode is installed.`);
        }
        if (this.shouldSkipGenerate()) {
            return false;
        }
        const nativePrjDir = this.paths.nativePrjDir;
        if (!fs.existsSync(nativePrjDir)) {
            utils_1.cchelper.makeDirectoryRecursive(nativePrjDir);
        }
        const ver = utils_1.toolHelper.getXcodeMajorVerion() >= 12 ? "12" : "1";
        const cmakeArgs = ['-S', `"${this.paths.platformTemplateDirInPrj}"`, '-GXcode', '-T', `buildsystem=${ver}`,
            `-B"${nativePrjDir}"`, '-DCMAKE_SYSTEM_NAME=Darwin'];
        this.appendCmakeCommonArgs(cmakeArgs);
        await utils_1.toolHelper.runCmake(cmakeArgs);
        await this.modifyXcodeProject();
        return true;
    }
    async make() {
        const nativePrjDir = this.paths.nativePrjDir;
        const platform = this.isAppleSilicon() ? `-arch arm64` : `-arch x86_64`;
        await utils_1.toolHelper.runCmake(["--build", `"${nativePrjDir}"`, "--config", this.params.debug ? 'Debug' : 'Release', "--", "-quiet", platform]);
        return true;
    }
    async run() {
        await this.macRun(this.params.projectName);
        return true;
    }
    macOpen(app) {
        return new Promise((resolve, reject) => {
            console.log(`open ${app}`);
            const cp = (0, child_process_1.spawn)(`open`, [`"${app}"`], {
                shell: true,
                env: process.env,
            });
            cp.stdout.on('data', (data) => {
                console.log(`[open app] ${data}`);
            });
            cp.stderr.on('data', (data) => {
                console.error(`[open app error] ${data}`);
            });
            cp.on('close', (code, sig) => {
                console.log(`${app} exit with ${code}, sig: ${sig}`);
                if (code !== 0) {
                    reject(`[open app error] Child process exit width code ${code}`);
                }
                else {
                    resolve();
                }
            });
            cp.on('exit', (code, sig) => {
                resolve();
            });
            cp.on('error', (err) => {
                console.log(`${app} exit with error: ${err.message}`);
                reject(err);
            });
        });
    }
    async macRun(projectName) {
        const debugDir = ps.join(this.paths.nativePrjDir, this.params.debug ? 'Debug' : 'Release');
        if (!fs.existsSync(debugDir)) {
            throw new Error(`[mac run] ${debugDir} is not exist!`);
        }
        let appPath;
        if (projectName) {
            appPath = ps.join(debugDir, `${projectName}-desktop.app`);
            if (fs.existsSync(appPath)) {
                await this.macOpen(appPath);
                return;
            }
        }
        const appList = fs.readdirSync(debugDir).filter((x) => x.endsWith('.app'));
        if (appList.length === 1) {
            await this.macOpen(ps.join(debugDir, appList[0]));
            return;
        }
        throw new Error(`found ${appList.length} apps, failed to open.`);
    }
}
exports.default = MacPackTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvbmF0aXZlLWNvbW1vbi9wYWNrLXRvb2wvcGxhdGZvcm1zL21hYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFzQztBQUN0Qyw2Q0FBK0I7QUFDL0IseUNBQTJCO0FBRTNCLG9DQUF1RDtBQUN2RCxxQ0FBeUM7QUFPekMsTUFBcUIsV0FBWSxTQUFRLHNCQUFhO0lBR2xELEtBQUssQ0FBQyxNQUFNO1FBQ1IsTUFBTSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFckIsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxpQkFBaUI7UUFDbkIsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUNyRCxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUNwRCxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsVUFBVSw2QkFBNkIsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUMzRixDQUFDO1FBQ0QsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQztJQUVELEtBQUss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QyxDQUFDO1FBQzNELENBQUM7UUFDRCxJQUFJLE9BQWUsQ0FBQztRQUNwQixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2QsT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsV0FBVyxjQUFjLENBQUMsQ0FBQztZQUMxRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QixPQUFPO1lBQ1gsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzNFLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2QixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxPQUFPO1FBQ1gsQ0FBQztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxPQUFPLENBQUMsTUFBTSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FDSjtBQWpIRCw4QkFpSEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCAqIGFzIHBzIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBDb2Nvc1BhcmFtcyB9IGZyb20gJy4uL2Jhc2UvZGVmYXVsdCc7XHJcbmltcG9ydCB7IGNjaGVscGVyLCB0b29sSGVscGVyLCBQYXRocyB9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5pbXBvcnQgeyBNYWNPU1BhY2tUb29sIH0gZnJvbSBcIi4vbWFjLW9zXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElNYWNQYXJhbXMge1xyXG4gICAgYnVuZGxlSWQ6IHN0cmluZztcclxuICAgIHNraXBVcGRhdGVYY29kZVByb2plY3Q6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hY1BhY2tUb29sIGV4dGVuZHMgTWFjT1NQYWNrVG9vbCB7XHJcbiAgICBkZWNsYXJlIHBhcmFtczogQ29jb3NQYXJhbXM8SU1hY1BhcmFtcz47XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLmNyZWF0ZSgpO1xyXG4gICAgICAgXHJcbiAgICAgICAgYXdhaXQgdGhpcy5lbmNyeXB0U2NyaXB0cygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldEV4ZWN1dGFibGVGaWxlKCkge1xyXG4gICAgICAgIGNvbnN0IGV4ZWN1dGFibGVEaXIgPSBwcy5qb2luKHRoaXMucGF0aHMubmF0aXZlUHJqRGlyLCB0aGlzLnBhcmFtcy5kZWJ1ZyA/ICdEZWJ1ZycgOiAnUmVsZWFzZScpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldEZpbGUgPSB0aGlzLmdldEV4ZWN1dGFibGVOYW1lT3JEZWZhdWx0KCk7XHJcbiAgICAgICAgY29uc3QgZXhlY3V0YWJsZUZpbGUgPSBwcy5qb2luKGV4ZWN1dGFibGVEaXIsIHRhcmdldEZpbGUgKyAnLmFwcCcpO1xyXG4gICAgICAgIGlmICghZXhlY3V0YWJsZUZpbGUgfHwgIWZzLmV4aXN0c1N5bmMoZXhlY3V0YWJsZUZpbGUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgW21hYyBydW5dICcke3RhcmdldEZpbGV9JyBpcyBub3QgZm91bmQgd2l0aGluICcgKyAke2V4ZWN1dGFibGVEaXJ9IWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXhlY3V0YWJsZUZpbGU7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2VuZXJhdGUoKSB7XHJcblxyXG4gICAgICAgIGlmKCFhd2FpdCB0aGlzLmNoZWNrSWZYY29kZUluc3RhbGxlZCgpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFBsZWFzZSBjaGVjayBpZiBYY29kZSBpcyBpbnN0YWxsZWQuYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnNob3VsZFNraXBHZW5lcmF0ZSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmF0aXZlUHJqRGlyID0gdGhpcy5wYXRocy5uYXRpdmVQcmpEaXI7XHJcblxyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhuYXRpdmVQcmpEaXIpKSB7XHJcbiAgICAgICAgICAgIGNjaGVscGVyLm1ha2VEaXJlY3RvcnlSZWN1cnNpdmUobmF0aXZlUHJqRGlyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZlciA9IHRvb2xIZWxwZXIuZ2V0WGNvZGVNYWpvclZlcmlvbigpID49IDEyID8gXCIxMlwiIDogXCIxXCI7XHJcbiAgICAgICAgY29uc3QgY21ha2VBcmdzID0gWyctUycsIGBcIiR7dGhpcy5wYXRocy5wbGF0Zm9ybVRlbXBsYXRlRGlySW5Qcmp9XCJgLCAnLUdYY29kZScsICctVCcsIGBidWlsZHN5c3RlbT0ke3Zlcn1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBgLUJcIiR7bmF0aXZlUHJqRGlyfVwiYCwgJy1EQ01BS0VfU1lTVEVNX05BTUU9RGFyd2luJ107XHJcbiAgICAgICAgdGhpcy5hcHBlbmRDbWFrZUNvbW1vbkFyZ3MoY21ha2VBcmdzKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdG9vbEhlbHBlci5ydW5DbWFrZShjbWFrZUFyZ3MpO1xyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLm1vZGlmeVhjb2RlUHJvamVjdCgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIG1ha2UoKSB7XHJcbiAgICAgICAgY29uc3QgbmF0aXZlUHJqRGlyID0gdGhpcy5wYXRocy5uYXRpdmVQcmpEaXI7XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXRmb3JtID0gdGhpcy5pc0FwcGxlU2lsaWNvbigpID8gYC1hcmNoIGFybTY0YCA6IGAtYXJjaCB4ODZfNjRgO1xyXG4gICAgICAgIGF3YWl0IHRvb2xIZWxwZXIucnVuQ21ha2UoW1wiLS1idWlsZFwiLCBgXCIke25hdGl2ZVByakRpcn1cImAsIFwiLS1jb25maWdcIiwgdGhpcy5wYXJhbXMuZGVidWcgPyAnRGVidWcnIDogJ1JlbGVhc2UnLCBcIi0tXCIsIFwiLXF1aWV0XCIsIHBsYXRmb3JtXSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGF3YWl0IHRoaXMubWFjUnVuKHRoaXMucGFyYW1zLnByb2plY3ROYW1lKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1hY09wZW4oYXBwOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgb3BlbiAke2FwcH1gKTtcclxuICAgICAgICAgICAgY29uc3QgY3AgPSBzcGF3bihgb3BlbmAsIFtgXCIke2FwcH1cImBdLCB7XHJcbiAgICAgICAgICAgICAgICBzaGVsbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGVudjogcHJvY2Vzcy5lbnYsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjcC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtvcGVuIGFwcF0gJHtkYXRhfWApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY3Auc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtvcGVuIGFwcCBlcnJvcl0gJHtkYXRhfWApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY3Aub24oJ2Nsb3NlJywgKGNvZGUsIHNpZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7YXBwfSBleGl0IHdpdGggJHtjb2RlfSwgc2lnOiAke3NpZ31gKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2RlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBbb3BlbiBhcHAgZXJyb3JdIENoaWxkIHByb2Nlc3MgZXhpdCB3aWR0aCBjb2RlICR7Y29kZX1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY3Aub24oJ2V4aXQnLCAoY29kZSwgc2lnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjcC5vbignZXJyb3InLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHthcHB9IGV4aXQgd2l0aCBlcnJvcjogJHtlcnIubWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIG1hY1J1bihwcm9qZWN0TmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGRlYnVnRGlyID0gcHMuam9pbihcclxuICAgICAgICAgICAgdGhpcy5wYXRocy5uYXRpdmVQcmpEaXIsXHJcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmRlYnVnID8gJ0RlYnVnJyA6ICdSZWxlYXNlJyk7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRlYnVnRGlyKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFttYWMgcnVuXSAke2RlYnVnRGlyfSBpcyBub3QgZXhpc3QhYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhcHBQYXRoOiBzdHJpbmc7XHJcbiAgICAgICAgaWYgKHByb2plY3ROYW1lKSB7XHJcbiAgICAgICAgICAgIGFwcFBhdGggPSBwcy5qb2luKGRlYnVnRGlyLCBgJHtwcm9qZWN0TmFtZX0tZGVza3RvcC5hcHBgKTtcclxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYXBwUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWFjT3BlbihhcHBQYXRoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXBwTGlzdCA9IGZzLnJlYWRkaXJTeW5jKGRlYnVnRGlyKS5maWx0ZXIoKHgpID0+IHguZW5kc1dpdGgoJy5hcHAnKSk7XHJcbiAgICAgICAgaWYgKGFwcExpc3QubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubWFjT3Blbihwcy5qb2luKGRlYnVnRGlyLCBhcHBMaXN0WzBdKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmb3VuZCAke2FwcExpc3QubGVuZ3RofSBhcHBzLCBmYWlsZWQgdG8gb3Blbi5gKTtcclxuICAgIH1cclxufVxyXG4iXX0=