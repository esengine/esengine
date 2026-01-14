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
const os = __importStar(require("os"));
const utils_1 = require("../utils");
const mac_os_1 = require("./mac-os");
class IOSPackTool extends mac_os_1.MacOSPackTool {
    async create() {
        await this.copyCommonTemplate();
        await this.copyPlatformTemplate();
        await this.generateCMakeConfig();
        await this.executeCocosTemplateTask();
        await this.setOrientation();
        await this.encryptScripts();
        return true;
    }
    async getExecutableFile() {
        const options = this.params.platformParams;
        let targetDir = '';
        if (options.simulator) {
            targetDir = this.params.debug ? 'Debug-iphonesimulator' : 'Release-iphonesimulator';
        }
        else {
            targetDir = this.params.debug ? 'Debug-iphoneos' : 'Release-iphoneos';
        }
        const executableDir = ps.join(this.paths.nativePrjDir, targetDir);
        const targetFile = this.getExecutableNameOrDefault();
        const executableFile = ps.join(executableDir, targetFile + '.app');
        if (!executableFile || !fs.existsSync(executableFile)) {
            throw new Error(`[ios run] '${targetFile}' is not found within ' + ${executableDir}!`);
        }
        return executableFile;
    }
    async setOrientation() {
        const orientation = this.params.platformParams.orientation;
        const infoPlist = utils_1.cchelper.join(this.paths.platformTemplateDirInPrj, 'Info.plist');
        if (fs.existsSync(infoPlist)) {
            const orientations = [];
            if (orientation.landscapeRight) {
                orientations.push('UIInterfaceOrientationLandscapeRight');
            }
            if (orientation.landscapeLeft) {
                orientations.push('UIInterfaceOrientationLandscapeLeft');
            }
            if (orientation.portrait) {
                orientations.push('UIInterfaceOrientationPortrait');
            }
            if (orientation.upsideDown) {
                orientations.push('UIInterfaceOrientationPortraitUpsideDown');
            }
            const replacement = `\t<key>UISupportedInterfaceOrientations</key>\n\t<array>\n${orientations.map((x) => `\t\t<string>${x}</string>\n`).join('')}\n\t</array>`;
            const newlines = [];
            const lines = (await fs.readFile(infoPlist, 'utf8')).split('\n');
            let foundKey = 0;
            let foundValues = 0;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].indexOf('UISupportedInterfaceOrientations') >= 0) {
                    foundKey += 1;
                    i++;
                    while (i < lines.length && lines[i].indexOf('</array>') < 0) {
                        i++;
                    }
                    if (lines[i].indexOf('</array>') >= 0) {
                        foundValues += 1;
                    }
                    newlines.push(replacement);
                }
                else {
                    newlines.push(lines[i]);
                }
            }
            if (foundKey !== 1 || foundValues !== 1) {
                console.error(`error occurs while setting orientations for iOS`);
            }
            else {
                await fs.writeFile(infoPlist, newlines.join('\n'));
            }
        }
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
        const ext = ['-DCMAKE_CXX_COMPILER=clang++', '-DCMAKE_C_COMPILER=clang'];
        this.appendCmakeCommonArgs(ext);
        const ver = utils_1.toolHelper.getXcodeMajorVerion() >= 12 ? '12' : '1';
        await utils_1.toolHelper.runCmake(['-S', `"${this.paths.platformTemplateDirInPrj}"`, '-GXcode', `-B"${nativePrjDir}"`, '-T', `buildsystem=${ver}`,
            '-DCMAKE_SYSTEM_NAME=iOS'].concat(ext));
        await this.modifyXcodeProject();
        return true;
    }
    async make() {
        const options = this.params.platformParams;
        if (options.iphoneos && !options.teamid) {
            throw new Error('Error: Try to build iphoneos application but no developer team id was given!');
        }
        const nativePrjDir = this.paths.nativePrjDir;
        const projName = this.params.projectName;
        const os = require('os');
        const cpus = os.cpus();
        const model = (cpus && cpus[0] && cpus[0].model) ? cpus[0].model : '';
        // check mac architecture
        // const platform = /Apple/.test(model) ? `-arch arm64` : `-arch x86_64`;
        // get xcode workspace
        const regex = new RegExp(projName + '.xcworkspace$');
        const files = fs.readdirSync(nativePrjDir);
        const xcodeWorkSpace = files.find((file) => regex.test(file));
        if (xcodeWorkSpace) {
            const workspaceCompileParams = `-workspace ${nativePrjDir}/${xcodeWorkSpace} -scheme ALL_BUILD `
                + `-parallelizeTargets -quiet -configuration ${this.params.debug ? 'Debug' : 'Release'} `
                + `-hideShellScriptEnvironment -allowProvisioningUpdates SYMROOT=${nativePrjDir}`;
            if (options.simulator) {
                await utils_1.toolHelper.runXcodeBuild([`-destination generic/platform='iOS Simulator'`,
                    workspaceCompileParams, `CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO`]);
            }
            if (options.iphoneos) {
                await utils_1.toolHelper.runXcodeBuild([`-destination generic/platform='iOS'`,
                    workspaceCompileParams, `DEVELOPMENT_TEAM=${options.teamid}`]);
            }
        }
        else {
            const projCompileParams = `--build "${nativePrjDir}" --config ${this.params.debug ? 'Debug' : 'Release'} -- -allowProvisioningUpdates -quiet`;
            if (options.iphoneos) {
                await utils_1.toolHelper.runCmake([projCompileParams, '-sdk', 'iphoneos', `-arch arm64`]);
            }
            if (options.simulator) {
                await utils_1.toolHelper.runCmake([projCompileParams, '-sdk', 'iphonesimulator', `-arch x86_64`]); //force compile x86_64 app for iPhone simulator on Mac
            }
        }
        return true;
    }
    // ------------------- run ------------------ //
    async run() {
        return await this.runIosSimulator();
        // todo:真机暂时不支持
        // if (this.plugin.enableIosSimulator()) {
        // } else {
        //     return this.runIosDevice();
        // }
    }
    selectSimulatorId() {
        const iphones = (0, child_process_1.execSync)('xcrun xctrace list devices')
            .toString('utf-8')
            .split('\n')
            .filter((x) => x.startsWith('iPhone') && x.indexOf('Simulator') >= 0);
        const exact = (l) => {
            const p = l.split('(')[0].substring(6);
            const m = l.match(/\((\d+\.\d+)\)/);
            if (m) {
                return parseInt(m[1]) + m.index;
            }
            return parseInt(p) * 100 + l.length;
        };
        const ret = iphones.filter((x) => x.indexOf('Apple Watch') < 0).sort((a, b) => {
            return exact(b) - exact(a);
        })[0];
        const m = ret.match(/\(([A-Z0-9-]+)\)/);
        console.log(`selected simualtor ${ret}`);
        return m[1];
    }
    selectIosDevices() {
        const lines = (0, child_process_1.execSync)(`xcrun simctl list`)
            .toString('utf-8')
            .split('\n');
        const readDevices = (lines, idx) => {
            while (idx < lines.length && !lines[idx].match(/== Devices ==/)) {
                idx++;
            }
            return idx < lines.length ? idx : -1;
        };
        const readIOSDevices = (list, idx) => {
            const ret = [];
            while (!list[idx].match(/-- iOS [^ ]* --/)) {
                idx++;
            }
            if (list[idx].indexOf('iOS') < 0) {
                console.error(`can not find iOS section!`);
                return ret;
            }
            idx++;
            while (list[idx].startsWith(' ')) {
                ret.push(list[idx++]);
            }
            return ret.map((x) => x.trim());
        };
        const idx = readDevices(lines, 0);
        if (idx < 0) {
            console.error(`can not find devices section!`);
            return [];
        }
        const list = readIOSDevices(lines, idx);
        const ret = list.filter((x) => x.startsWith('iPhone'));
        return ret;
    }
    readBundleId() {
        const prjName = this.getExecutableNameOrDefault();
        const cmakeTmpDir = fs.readdirSync(ps.join(this.paths.nativePrjDir, 'CMakeFiles'))
            .filter((x) => x.startsWith(prjName))[0];
        const infoPlist = ps.join(this.paths.nativePrjDir, 'CMakeFiles', cmakeTmpDir, 'Info.plist');
        if (fs.existsSync(infoPlist)) {
            const lines = fs.readFileSync(infoPlist).toString('utf-8').split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(/CFBundleIdentifier/)) {
                    i++;
                    while (!lines[i].match(/<string>/)) {
                        i++;
                    }
                    const m = lines[i].match(/<string>([^<]*)<\/string>/);
                    return m[1];
                }
            }
        }
        else {
            throw new Error(`Info.plist not found ${infoPlist}`);
        }
        return null;
    }
    queryIosDevice() {
        const lines = (0, child_process_1.execSync)(`xcrun xctrace list devices`)
            .toString('utf-8')
            .split('\n');
        const ret = [];
        // skip first line
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].indexOf('Simulator') >= 0) {
                continue;
            }
            else if (lines[i].match(/iPhone|iPad|iPod/)) {
                ret.push(lines[i]);
            }
        }
        if (ret.length > 0) {
            console.log(`select ios device ${ret[0]}`);
            return ret[0].match(/\(([A-Z0-9-]+)\)/)[1];
        }
        return null;
    }
    async runIosDevice() {
        const buildDir = this.paths.nativePrjDir;
        const foundApps = (0, child_process_1.execSync)(`find "${buildDir}" -name "*.app"`)
            .toString('utf-8')
            .split('\n')
            .filter((x) => x.trim().length > 0);
        const deviceId = this.queryIosDevice();
        if (!deviceId) {
            console.error(`no connected device found!`);
            return false;
        }
        if (foundApps.length > 0) {
            const cwd = fs.mkdtempSync(ps.join(os.tmpdir(), this.params.projectName));
            await utils_1.cchelper.runCmd('xcrun', ['xctrace', 'record', '--template', `'App Launch'`, '--device', `'${deviceId}'`, '--launch', '--', `"${foundApps[0]}"`], false, cwd);
        }
        return true;
    }
    async runIosSimulator() {
        const simId = this.selectSimulatorId();
        const buildDir = this.paths.nativePrjDir;
        const bundleId = this.readBundleId();
        console.log(` - build dir ${buildDir} - simId ${simId}`);
        console.log(` - bundle id ${bundleId}`);
        const foundApps = (0, child_process_1.execSync)(`find "${buildDir}" -name "*.app"`)
            .toString('utf-8')
            .split('\n')
            .filter((x) => x.trim().length > 0);
        if (foundApps.length > 0 && bundleId) {
            await utils_1.cchelper.runCmd('xcrun', ['simctl', 'boot', simId], true);
            await utils_1.cchelper.runCmd('open', ['`xcode-select -p`/Applications/Simulator.app'], true);
            await utils_1.cchelper.runCmd('xcrun', ['simctl', 'boot', simId], true);
            await utils_1.cchelper.runCmd('xcrun', ['simctl', 'install', simId, `"${foundApps[0].trim()}"`], false);
            await utils_1.cchelper.runCmd('xcrun', ['simctl', 'launch', simId, `"${bundleId}"`], false);
        }
        else {
            throw new Error(`[iOS run] App or BundleId is not found!`);
        }
        return false;
    }
}
exports.default = IOSPackTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvbmF0aXZlLWNvbW1vbi9wYWNrLXRvb2wvcGxhdGZvcm1zL2lvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFnRDtBQUNoRCw2Q0FBK0I7QUFDL0IseUNBQTJCO0FBQzNCLHVDQUF5QjtBQUV6QixvQ0FBdUQ7QUFDdkQscUNBQXlDO0FBbUJ6QyxNQUFxQixXQUFZLFNBQVEsc0JBQWE7SUFHbEQsS0FBSyxDQUFDLE1BQU07UUFDUixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDbEMsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNqQyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBRXRDLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzVCLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzVCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsaUJBQWlCO1FBQ25CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO1FBQzNDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNwQixTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQztRQUN4RixDQUFDO2FBQU0sQ0FBQztZQUNKLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdC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LFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUUsTUFBTSxnQkFBUSxDQUFDLE1BQU0sQ0FDakIsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RFLENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0o7QUF2VEQsOEJBdVRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhlY1N5bmMsIHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0ICogYXMgcHMgZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcclxuaW1wb3J0IHsgQ29jb3NQYXJhbXMgfSBmcm9tICcuLi9iYXNlL2RlZmF1bHQnO1xyXG5pbXBvcnQgeyBjY2hlbHBlciwgdG9vbEhlbHBlciwgUGF0aHMgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IE1hY09TUGFja1Rvb2wgfSBmcm9tICcuL21hYy1vcyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElPcmllbnRhdGlvbiB7XHJcbiAgICBsYW5kc2NhcGVMZWZ0OiBib29sZWFuO1xyXG4gICAgbGFuZHNjYXBlUmlnaHQ6IGJvb2xlYW47XHJcbiAgICBwb3J0cmFpdDogYm9vbGVhbjtcclxuICAgIHVwc2lkZURvd246IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSU9TUGFyYW1zIHtcclxuICAgIG9yaWVudGF0aW9uOiBJT3JpZW50YXRpb247XHJcbiAgICBidW5kbGVJZDogc3RyaW5nO1xyXG4gICAgc2tpcFVwZGF0ZVhjb2RlUHJvamVjdDogYm9vbGVhbjtcclxuICAgIHRlYW1pZDogc3RyaW5nO1xyXG5cclxuICAgIGlwaG9uZW9zOiBib29sZWFuO1xyXG4gICAgc2ltdWxhdG9yPzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSU9TUGFja1Rvb2wgZXh0ZW5kcyBNYWNPU1BhY2tUb29sIHtcclxuICAgIGRlY2xhcmUgcGFyYW1zOiBDb2Nvc1BhcmFtczxJT1NQYXJhbXM+O1xyXG5cclxuICAgIGFzeW5jIGNyZWF0ZSgpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLmNvcHlDb21tb25UZW1wbGF0ZSgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuY29weVBsYXRmb3JtVGVtcGxhdGUoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmdlbmVyYXRlQ01ha2VDb25maWcoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmV4ZWN1dGVDb2Nvc1RlbXBsYXRlVGFzaygpO1xyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLnNldE9yaWVudGF0aW9uKCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5lbmNyeXB0U2NyaXB0cygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldEV4ZWN1dGFibGVGaWxlKCkge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcztcclxuICAgICAgICBsZXQgdGFyZ2V0RGlyID0gJyc7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc2ltdWxhdG9yKSB7XHJcbiAgICAgICAgICAgIHRhcmdldERpciA9IHRoaXMucGFyYW1zLmRlYnVnID8gJ0RlYnVnLWlwaG9uZXNpbXVsYXRvcicgOiAnUmVsZWFzZS1pcGhvbmVzaW11bGF0b3InO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRhcmdldERpciA9IHRoaXMucGFyYW1zLmRlYnVnID8gJ0RlYnVnLWlwaG9uZW9zJyA6ICdSZWxlYXNlLWlwaG9uZW9zJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGV4ZWN1dGFibGVEaXIgPSBwcy5qb2luKHRoaXMucGF0aHMubmF0aXZlUHJqRGlyLCB0YXJnZXREaXIpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldEZpbGUgPSB0aGlzLmdldEV4ZWN1dGFibGVOYW1lT3JEZWZhdWx0KCk7XHJcbiAgICAgICAgY29uc3QgZXhlY3V0YWJsZUZpbGUgPSBwcy5qb2luKGV4ZWN1dGFibGVEaXIsIHRhcmdldEZpbGUgKyAnLmFwcCcpO1xyXG4gICAgICAgIGlmICghZXhlY3V0YWJsZUZpbGUgfHwgIWZzLmV4aXN0c1N5bmMoZXhlY3V0YWJsZUZpbGUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgW2lvcyBydW5dICcke3RhcmdldEZpbGV9JyBpcyBub3QgZm91bmQgd2l0aGluICcgKyAke2V4ZWN1dGFibGVEaXJ9IWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXhlY3V0YWJsZUZpbGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFzeW5jIHNldE9yaWVudGF0aW9uKCkge1xyXG4gICAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMub3JpZW50YXRpb247XHJcbiAgICAgICAgY29uc3QgaW5mb1BsaXN0ID0gY2NoZWxwZXIuam9pbih0aGlzLnBhdGhzLnBsYXRmb3JtVGVtcGxhdGVEaXJJblByaiwgJ0luZm8ucGxpc3QnKTtcclxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhpbmZvUGxpc3QpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWVudGF0aW9uczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uLmxhbmRzY2FwZVJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbnMucHVzaCgnVUlJbnRlcmZhY2VPcmllbnRhdGlvbkxhbmRzY2FwZVJpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uLmxhbmRzY2FwZUxlZnQpIHtcclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9ucy5wdXNoKCdVSUludGVyZmFjZU9yaWVudGF0aW9uTGFuZHNjYXBlTGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbi5wb3J0cmFpdCkge1xyXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb25zLnB1c2goJ1VJSW50ZXJmYWNlT3JpZW50YXRpb25Qb3J0cmFpdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbi51cHNpZGVEb3duKSB7XHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbnMucHVzaCgnVUlJbnRlcmZhY2VPcmllbnRhdGlvblBvcnRyYWl0VXBzaWRlRG93bicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50OiBzdHJpbmcgPSBgXFx0PGtleT5VSVN1cHBvcnRlZEludGVyZmFjZU9yaWVudGF0aW9uczwva2V5PlxcblxcdDxhcnJheT5cXG4ke29yaWVudGF0aW9ucy5tYXAoKHgpID0+IGBcXHRcXHQ8c3RyaW5nPiR7eH08L3N0cmluZz5cXG5gKS5qb2luKCcnKX1cXG5cXHQ8L2FycmF5PmA7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld2xpbmVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IChhd2FpdCBmcy5yZWFkRmlsZShpbmZvUGxpc3QsICd1dGY4JykpLnNwbGl0KCdcXG4nKTtcclxuICAgICAgICAgICAgbGV0IGZvdW5kS2V5ID0gMDtcclxuICAgICAgICAgICAgbGV0IGZvdW5kVmFsdWVzID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzW2ldLmluZGV4T2YoJ1VJU3VwcG9ydGVkSW50ZXJmYWNlT3JpZW50YXRpb25zJykgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kS2V5ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoICYmIGxpbmVzW2ldLmluZGV4T2YoJzwvYXJyYXk+JykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmVzW2ldLmluZGV4T2YoJzwvYXJyYXk+JykgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFZhbHVlcyArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBuZXdsaW5lcy5wdXNoKHJlcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3bGluZXMucHVzaChsaW5lc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZvdW5kS2V5ICE9PSAxIHx8IGZvdW5kVmFsdWVzICE9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBlcnJvciBvY2N1cnMgd2hpbGUgc2V0dGluZyBvcmllbnRhdGlvbnMgZm9yIGlPU2ApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGluZm9QbGlzdCwgbmV3bGluZXMuam9pbignXFxuJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdlbmVyYXRlKCkge1xyXG5cclxuICAgICAgICBpZighYXdhaXQgdGhpcy5jaGVja0lmWGNvZGVJbnN0YWxsZWQoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBQbGVhc2UgY2hlY2sgaWYgWGNvZGUgaXMgaW5zdGFsbGVkLmApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5zaG91bGRTa2lwR2VuZXJhdGUoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5hdGl2ZVByakRpciA9IHRoaXMucGF0aHMubmF0aXZlUHJqRGlyO1xyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhuYXRpdmVQcmpEaXIpKSB7XHJcbiAgICAgICAgICAgIGNjaGVscGVyLm1ha2VEaXJlY3RvcnlSZWN1cnNpdmUobmF0aXZlUHJqRGlyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGV4dDogc3RyaW5nW10gPSBbJy1EQ01BS0VfQ1hYX0NPTVBJTEVSPWNsYW5nKysnLCAnLURDTUFLRV9DX0NPTVBJTEVSPWNsYW5nJ107XHJcblxyXG4gICAgICAgIHRoaXMuYXBwZW5kQ21ha2VDb21tb25BcmdzKGV4dCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZlciA9IHRvb2xIZWxwZXIuZ2V0WGNvZGVNYWpvclZlcmlvbigpID49IDEyID8gJzEyJyA6ICcxJztcclxuICAgICAgICBhd2FpdCB0b29sSGVscGVyLnJ1bkNtYWtlKFsnLVMnLCBgXCIke3RoaXMucGF0aHMucGxhdGZvcm1UZW1wbGF0ZURpckluUHJqfVwiYCwgJy1HWGNvZGUnLCBgLUJcIiR7bmF0aXZlUHJqRGlyfVwiYCwgJy1UJywgYGJ1aWxkc3lzdGVtPSR7dmVyfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICctRENNQUtFX1NZU1RFTV9OQU1FPWlPUyddLmNvbmNhdChleHQpKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdGhpcy5tb2RpZnlYY29kZVByb2plY3QoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbWFrZSgpIHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXM7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuaXBob25lb3MgJiYgIW9wdGlvbnMudGVhbWlkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IFRyeSB0byBidWlsZCBpcGhvbmVvcyBhcHBsaWNhdGlvbiBidXQgbm8gZGV2ZWxvcGVyIHRlYW0gaWQgd2FzIGdpdmVuIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuYXRpdmVQcmpEaXIgPSB0aGlzLnBhdGhzLm5hdGl2ZVByakRpcjtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvak5hbWUgPSB0aGlzLnBhcmFtcy5wcm9qZWN0TmFtZTtcclxuICAgICAgICBjb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XHJcbiAgICAgICAgY29uc3QgY3B1cyA9IG9zLmNwdXMoKTtcclxuICAgICAgICBjb25zdCBtb2RlbCA9IChjcHVzICYmIGNwdXNbMF0gJiYgY3B1c1swXS5tb2RlbCkgPyBjcHVzWzBdLm1vZGVsIDogJyc7XHJcbiAgICAgICAgLy8gY2hlY2sgbWFjIGFyY2hpdGVjdHVyZVxyXG4gICAgICAgIC8vIGNvbnN0IHBsYXRmb3JtID0gL0FwcGxlLy50ZXN0KG1vZGVsKSA/IGAtYXJjaCBhcm02NGAgOiBgLWFyY2ggeDg2XzY0YDtcclxuICAgICAgICAvLyBnZXQgeGNvZGUgd29ya3NwYWNlXHJcbiAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHByb2pOYW1lICsgJy54Y3dvcmtzcGFjZSQnKTtcclxuICAgICAgICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKG5hdGl2ZVByakRpcik7XHJcbiAgICAgICAgY29uc3QgeGNvZGVXb3JrU3BhY2UgPSBmaWxlcy5maW5kKChmaWxlKSA9PiByZWdleC50ZXN0KGZpbGUpKTtcclxuICAgICAgICBpZiAoeGNvZGVXb3JrU3BhY2UpIHtcclxuICAgICAgICAgICAgY29uc3Qgd29ya3NwYWNlQ29tcGlsZVBhcmFtcyA9IGAtd29ya3NwYWNlICR7bmF0aXZlUHJqRGlyfS8ke3hjb2RlV29ya1NwYWNlfSAtc2NoZW1lIEFMTF9CVUlMRCBgXHJcbiAgICAgICAgICAgICAgICArIGAtcGFyYWxsZWxpemVUYXJnZXRzIC1xdWlldCAtY29uZmlndXJhdGlvbiAke3RoaXMucGFyYW1zLmRlYnVnID8gJ0RlYnVnJyA6ICdSZWxlYXNlJ30gYFxyXG4gICAgICAgICAgICAgICAgKyBgLWhpZGVTaGVsbFNjcmlwdEVudmlyb25tZW50IC1hbGxvd1Byb3Zpc2lvbmluZ1VwZGF0ZXMgU1lNUk9PVD0ke25hdGl2ZVByakRpcn1gO1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zaW11bGF0b3IpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRvb2xIZWxwZXIucnVuWGNvZGVCdWlsZChbYC1kZXN0aW5hdGlvbiBnZW5lcmljL3BsYXRmb3JtPSdpT1MgU2ltdWxhdG9yJ2AsXHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlQ29tcGlsZVBhcmFtcywgYENPREVfU0lHTklOR19SRVFVSVJFRD1OTyBDT0RFX1NJR05JTkdfQUxMT1dFRD1OT2BdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5pcGhvbmVvcykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdG9vbEhlbHBlci5ydW5YY29kZUJ1aWxkKFtgLWRlc3RpbmF0aW9uIGdlbmVyaWMvcGxhdGZvcm09J2lPUydgLFxyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZUNvbXBpbGVQYXJhbXMsIGBERVZFTE9QTUVOVF9URUFNPSR7b3B0aW9ucy50ZWFtaWR9YF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9qQ29tcGlsZVBhcmFtcyA9IGAtLWJ1aWxkIFwiJHtuYXRpdmVQcmpEaXJ9XCIgLS1jb25maWcgJHt0aGlzLnBhcmFtcy5kZWJ1ZyA/ICdEZWJ1ZycgOiAnUmVsZWFzZSd9IC0tIC1hbGxvd1Byb3Zpc2lvbmluZ1VwZGF0ZXMgLXF1aWV0YDtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaXBob25lb3MpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRvb2xIZWxwZXIucnVuQ21ha2UoW3Byb2pDb21waWxlUGFyYW1zLCAnLXNkaycsICdpcGhvbmVvcycsIGAtYXJjaCBhcm02NGBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zaW11bGF0b3IpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRvb2xIZWxwZXIucnVuQ21ha2UoW3Byb2pDb21waWxlUGFyYW1zLCAnLXNkaycsICdpcGhvbmVzaW11bGF0b3InLCBgLWFyY2ggeDg2XzY0YF0pOyAvL2ZvcmNlIGNvbXBpbGUgeDg2XzY0IGFwcCBmb3IgaVBob25lIHNpbXVsYXRvciBvbiBNYWNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tIHJ1biAtLS0tLS0tLS0tLS0tLS0tLS0gLy9cclxuICAgIGFzeW5jIHJ1bigpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5ydW5Jb3NTaW11bGF0b3IoKTtcclxuICAgICAgICAvLyB0b2RvOuecn+acuuaaguaXtuS4jeaUr+aMgVxyXG4gICAgICAgIC8vIGlmICh0aGlzLnBsdWdpbi5lbmFibGVJb3NTaW11bGF0b3IoKSkge1xyXG4gICAgICAgIC8vIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiB0aGlzLnJ1bklvc0RldmljZSgpO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RTaW11bGF0b3JJZCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGlwaG9uZXMgPVxyXG4gICAgICAgICAgICBleGVjU3luYygneGNydW4geGN0cmFjZSBsaXN0IGRldmljZXMnKVxyXG4gICAgICAgICAgICAgICAgLnRvU3RyaW5nKCd1dGYtOCcpXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoJ1xcbicpXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgICh4KSA9PiB4LnN0YXJ0c1dpdGgoJ2lQaG9uZScpICYmIHguaW5kZXhPZignU2ltdWxhdG9yJykgPj0gMCk7XHJcbiAgICAgICAgY29uc3QgZXhhY3QgPSAobDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHAgPSBsLnNwbGl0KCcoJylbMF0uc3Vic3RyaW5nKDYpO1xyXG4gICAgICAgICAgICBjb25zdCBtID0gbC5tYXRjaCgvXFwoKFxcZCtcXC5cXGQrKVxcKS8pO1xyXG4gICAgICAgICAgICBpZiAobSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KG1bMV0pICsgbS5pbmRleCE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHApICogMTAwICsgbC5sZW5ndGg7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCByZXQgPSBpcGhvbmVzLmZpbHRlcigoeCkgPT4geC5pbmRleE9mKCdBcHBsZSBXYXRjaCcpIDwgMCkuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhhY3QoYikgLSBleGFjdChhKTtcclxuICAgICAgICB9KVswXTtcclxuICAgICAgICBjb25zdCBtID0gcmV0Lm1hdGNoKC9cXCgoW0EtWjAtOS1dKylcXCkvKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgc2VsZWN0ZWQgc2ltdWFsdG9yICR7cmV0fWApO1xyXG4gICAgICAgIHJldHVybiBtIVsxXTtcclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RJb3NEZXZpY2VzKCk6IHN0cmluZ1tdIHtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IGV4ZWNTeW5jKGB4Y3J1biBzaW1jdGwgbGlzdGApXHJcbiAgICAgICAgICAgIC50b1N0cmluZygndXRmLTgnKVxyXG4gICAgICAgICAgICAuc3BsaXQoJ1xcbicpO1xyXG5cclxuICAgICAgICBjb25zdCByZWFkRGV2aWNlcyA9IChsaW5lczogc3RyaW5nW10sIGlkeDogbnVtYmVyKTpcclxuICAgICAgICAgICAgbnVtYmVyID0+IHtcclxuICAgICAgICAgICAgd2hpbGUgKGlkeCA8IGxpbmVzLmxlbmd0aCAmJiAhbGluZXNbaWR4XS5tYXRjaCgvPT0gRGV2aWNlcyA9PS8pKSB7XHJcbiAgICAgICAgICAgICAgICBpZHgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaWR4IDwgbGluZXMubGVuZ3RoID8gaWR4IDogLTE7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVhZElPU0RldmljZXMgPSAobGlzdDogc3RyaW5nW10sIGlkeDogbnVtYmVyKTogc3RyaW5nW10gPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXQ6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgIHdoaWxlICghbGlzdFtpZHhdLm1hdGNoKC8tLSBpT1MgW14gXSogLS0vKSkge1xyXG4gICAgICAgICAgICAgICAgaWR4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxpc3RbaWR4XS5pbmRleE9mKCdpT1MnKSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbiBub3QgZmluZCBpT1Mgc2VjdGlvbiFgKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWR4Kys7XHJcbiAgICAgICAgICAgIHdoaWxlIChsaXN0W2lkeF0uc3RhcnRzV2l0aCgnICcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXQucHVzaChsaXN0W2lkeCsrXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJldC5tYXAoKHgpID0+IHgudHJpbSgpKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBpZHggPSByZWFkRGV2aWNlcyhsaW5lcywgMCk7XHJcbiAgICAgICAgaWYgKGlkeCA8IDApIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2FuIG5vdCBmaW5kIGRldmljZXMgc2VjdGlvbiFgKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbGlzdCA9IHJlYWRJT1NEZXZpY2VzKGxpbmVzLCBpZHgpO1xyXG4gICAgICAgIGNvbnN0IHJldCA9IGxpc3QuZmlsdGVyKCh4KSA9PiB4LnN0YXJ0c1dpdGgoJ2lQaG9uZScpKTtcclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIHJlYWRCdW5kbGVJZCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICBjb25zdCBwcmpOYW1lID0gdGhpcy5nZXRFeGVjdXRhYmxlTmFtZU9yRGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnN0IGNtYWtlVG1wRGlyID1cclxuICAgICAgICAgICAgZnMucmVhZGRpclN5bmMocHMuam9pbih0aGlzLnBhdGhzLm5hdGl2ZVByakRpciwgJ0NNYWtlRmlsZXMnKSlcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKHgpID0+IHguc3RhcnRzV2l0aChwcmpOYW1lKSlbMF07XHJcblxyXG4gICAgICAgIGNvbnN0IGluZm9QbGlzdCA9IHBzLmpvaW4oXHJcbiAgICAgICAgICAgIHRoaXMucGF0aHMubmF0aXZlUHJqRGlyLCAnQ01ha2VGaWxlcycsIGNtYWtlVG1wRGlyLCAnSW5mby5wbGlzdCcpO1xyXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGluZm9QbGlzdCkpIHtcclxuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoaW5mb1BsaXN0KS50b1N0cmluZygndXRmLTgnKS5zcGxpdCgnXFxuJyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChsaW5lc1tpXS5tYXRjaCgvQ0ZCdW5kbGVJZGVudGlmaWVyLykpIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCFsaW5lc1tpXS5tYXRjaCgvPHN0cmluZz4vKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG0gPSBsaW5lc1tpXS5tYXRjaCgvPHN0cmluZz4oW148XSopPFxcL3N0cmluZz4vKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSFbMV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEluZm8ucGxpc3Qgbm90IGZvdW5kICR7aW5mb1BsaXN0fWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBxdWVyeUlvc0RldmljZSgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IGV4ZWNTeW5jKGB4Y3J1biB4Y3RyYWNlIGxpc3QgZGV2aWNlc2ApXHJcbiAgICAgICAgICAgIC50b1N0cmluZygndXRmLTgnKVxyXG4gICAgICAgICAgICAuc3BsaXQoJ1xcbicpO1xyXG4gICAgICAgIGNvbnN0IHJldDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAvLyBza2lwIGZpcnN0IGxpbmVcclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5lc1tpXS5pbmRleE9mKCdTaW11bGF0b3InKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsaW5lc1tpXS5tYXRjaCgvaVBob25lfGlQYWR8aVBvZC8pKSB7XHJcbiAgICAgICAgICAgICAgICByZXQucHVzaChsaW5lc1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJldC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBzZWxlY3QgaW9zIGRldmljZSAke3JldFswXX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJldFswXS5tYXRjaCgvXFwoKFtBLVowLTktXSspXFwpLykhWzFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW5Jb3NEZXZpY2UoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgY29uc3QgYnVpbGREaXIgPSB0aGlzLnBhdGhzLm5hdGl2ZVByakRpcjtcclxuICAgICAgICBjb25zdCBmb3VuZEFwcHMgPSBleGVjU3luYyhgZmluZCBcIiR7YnVpbGREaXJ9XCIgLW5hbWUgXCIqLmFwcFwiYClcclxuICAgICAgICAgICAgLnRvU3RyaW5nKCd1dGYtOCcpXHJcbiAgICAgICAgICAgIC5zcGxpdCgnXFxuJylcclxuICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4geC50cmltKCkubGVuZ3RoID4gMCk7XHJcbiAgICAgICAgY29uc3QgZGV2aWNlSWQgPSB0aGlzLnF1ZXJ5SW9zRGV2aWNlKCk7XHJcbiAgICAgICAgaWYgKCFkZXZpY2VJZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBubyBjb25uZWN0ZWQgZGV2aWNlIGZvdW5kIWApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmb3VuZEFwcHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBjd2QgPSBmcy5ta2R0ZW1wU3luYyhwcy5qb2luKG9zLnRtcGRpcigpLCB0aGlzLnBhcmFtcy5wcm9qZWN0TmFtZSkpO1xyXG4gICAgICAgICAgICBhd2FpdCBjY2hlbHBlci5ydW5DbWQoXHJcbiAgICAgICAgICAgICAgICd4Y3J1bicsIFsneGN0cmFjZScsICdyZWNvcmQnLCAnLS10ZW1wbGF0ZScsIGAnQXBwIExhdW5jaCdgLCAnLS1kZXZpY2UnLCBgJyR7ZGV2aWNlSWR9J2AsICctLWxhdW5jaCcsICctLScsIGBcIiR7Zm91bmRBcHBzWzBdfVwiYF0sXHJcbiAgICAgICAgICAgICAgIGZhbHNlLCBjd2QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW5Jb3NTaW11bGF0b3IoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgY29uc3Qgc2ltSWQgPSB0aGlzLnNlbGVjdFNpbXVsYXRvcklkKCk7XHJcbiAgICAgICAgY29uc3QgYnVpbGREaXIgPSB0aGlzLnBhdGhzLm5hdGl2ZVByakRpcjtcclxuICAgICAgICBjb25zdCBidW5kbGVJZCA9IHRoaXMucmVhZEJ1bmRsZUlkKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYCAtIGJ1aWxkIGRpciAke2J1aWxkRGlyfSAtIHNpbUlkICR7c2ltSWR9YCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYCAtIGJ1bmRsZSBpZCAke2J1bmRsZUlkfWApO1xyXG5cclxuICAgICAgICBjb25zdCBmb3VuZEFwcHMgPSBleGVjU3luYyhgZmluZCBcIiR7YnVpbGREaXJ9XCIgLW5hbWUgXCIqLmFwcFwiYClcclxuICAgICAgICAgICAgLnRvU3RyaW5nKCd1dGYtOCcpXHJcbiAgICAgICAgICAgIC5zcGxpdCgnXFxuJylcclxuICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4geC50cmltKCkubGVuZ3RoID4gMCk7XHJcblxyXG4gICAgICAgIGlmIChmb3VuZEFwcHMubGVuZ3RoID4gMCAmJiBidW5kbGVJZCkge1xyXG4gICAgICAgICAgICBhd2FpdCBjY2hlbHBlci5ydW5DbWQoJ3hjcnVuJywgWydzaW1jdGwnLCAnYm9vdCcsIHNpbUlkXSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGF3YWl0IGNjaGVscGVyLnJ1bkNtZChcclxuICAgICAgICAgICAgICAgICdvcGVuJywgWydgeGNvZGUtc2VsZWN0IC1wYC9BcHBsaWNhdGlvbnMvU2ltdWxhdG9yLmFwcCddLCB0cnVlKTtcclxuICAgICAgICAgICAgYXdhaXQgY2NoZWxwZXIucnVuQ21kKCd4Y3J1bicsIFsnc2ltY3RsJywgJ2Jvb3QnLCBzaW1JZF0sIHRydWUpO1xyXG4gICAgICAgICAgICBhd2FpdCBjY2hlbHBlci5ydW5DbWQoXHJcbiAgICAgICAgICAgICAgICAneGNydW4nLCBbJ3NpbWN0bCcsICdpbnN0YWxsJywgc2ltSWQsIGBcIiR7Zm91bmRBcHBzWzBdLnRyaW0oKX1cImBdLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGF3YWl0IGNjaGVscGVyLnJ1bkNtZChcclxuICAgICAgICAgICAgICAgICd4Y3J1bicsIFsnc2ltY3RsJywgJ2xhdW5jaCcsIHNpbUlkLCBgXCIke2J1bmRsZUlkfVwiYF0sIGZhbHNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFtpT1MgcnVuXSBBcHAgb3IgQnVuZGxlSWQgaXMgbm90IGZvdW5kIWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuIl19