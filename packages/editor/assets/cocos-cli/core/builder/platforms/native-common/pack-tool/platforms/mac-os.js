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
exports.MacOSPackTool = void 0;
const fs = __importStar(require("fs-extra"));
const ps = __importStar(require("path"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const default_1 = __importDefault(require("../base/default"));
const utils_1 = require("../utils");
class MacOSPackTool extends default_1.default {
    async create() {
        await this.copyCommonTemplate();
        await this.copyPlatformTemplate();
        await this.generateCMakeConfig();
        await this.executeCocosTemplateTask();
        return true;
    }
    shouldSkipGenerate() {
        const nativePrjDir = this.paths.nativePrjDir;
        const options = this.params.platformParams;
        if (options.skipUpdateXcodeProject && fs.existsSync(ps.join(nativePrjDir, 'CMakeCache.txt'))) {
            console.log('Skip xcode project update');
            return true;
        }
        const cmakePath = ps.join(this.paths.platformTemplateDirInPrj, 'CMakeLists.txt');
        if (!fs.existsSync(cmakePath)) {
            throw new Error(`CMakeLists.txt not found in ${cmakePath}`);
        }
        return false;
    }
    isAppleSilicon() {
        const cpus = os.cpus();
        const model = (cpus && cpus[0] && cpus[0].model) ? cpus[0].model : '';
        return /Apple/.test(model) && process.platform === 'darwin';
    }
    getXcodeMajorVerion() {
        try {
            const output = (0, child_process_1.execSync)('xcrun xcodebuild -version').toString('utf8');
            return Number.parseInt(output.match(/Xcode\s(\d+)\.\d+/)[1]);
        }
        catch (e) {
            console.error(e);
            // fallback to default Xcode version
            return 11;
        }
    }
    async modifyXcodeProject() {
        if (this.params.platformParams.skipUpdateXcodeProject) {
            if (this.getXcodeMajorVerion() < 12) {
                console.error(`SKIP UPDATE XCODE PROJECT is only supported with Xcode 12 or later`);
                return;
            }
            await this.xcodeFixAssetsReferences();
        }
    }
    static async openWithIDE(projPath) {
        await utils_1.toolHelper.runCmake(['--open', `"${utils_1.cchelper.fixPath(projPath)}"`]);
        return true;
    }
    /**
     * When "Skip Xcode Project Update" is checked, changes to the contents of the "data" directory
     * still need to be synchronized with Xcode. One way to achieve this is to modify the Xcode
     * project file directly and use directory references to access the "data" directory.
     * However, this method is not supported in Xcode 11 and earlier project formats due to
     * differences in their formats.
     */
    async xcodeFixAssetsReferences() {
        const nativePrjDir = this.paths.nativePrjDir;
        const xcode = require(ps.join(this.params.enginePath, 'scripts/native-pack-tool/xcode'));
        const projs = fs.readdirSync(nativePrjDir).filter((x) => x.endsWith('.xcodeproj')).map((x) => ps.join(nativePrjDir, x));
        if (projs.length === 0) {
            throw new Error(`can not find xcode project file in ${nativePrjDir}`);
        }
        else {
            try {
                for (const proj of projs) {
                    const pbxfile = ps.join(proj, 'project.pbxproj');
                    console.log(`parsing pbxfile ${pbxfile}`);
                    const projectFile = xcode.project(pbxfile);
                    await (function () {
                        return new Promise((resolve, reject) => {
                            projectFile.parse((err) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(projectFile);
                            });
                        });
                    })();
                    console.log(`  modifiy Xcode project file ${pbxfile}`);
                    {
                        // Resources/ add references to files/folders in assets/ 
                        const assetsDir = this.paths.buildDir;
                        const objects = projectFile.hash.project.objects;
                        const KeyResource = `Resources`;
                        const resources = Object.entries(objects.PBXGroup).filter(([, x]) => x.name === KeyResource);
                        let hash = resources[0][0];
                        if (resources.length > 1) {
                            console.log(`   multiple Resources/ group found!`);
                            const itemWeight = (a) => {
                                const hasImageAsset = a[1].children.filter((c) => c.comment.endsWith('.xcassets')).length > 0;
                                const finalBuildTarget = a[1].children.filter((c) => c.comment.indexOf(`CMakeFiles/${this.params.projectName}`) > -1).length > 0;
                                console.log(`   ${a[0]} hasImageAsset ${hasImageAsset}, is final target ${finalBuildTarget}`);
                                return (finalBuildTarget ? 1 : 0) * 100 + (hasImageAsset ? 1 : 0) * 10 + a[1].children.length;
                            };
                            hash = resources.sort((a, b) => itemWeight(b) - itemWeight(a))[0][0];
                            console.log(`   select ${hash}`);
                        }
                        const filterFolders = (name) => {
                            // NOTE: `assets/remote` should not be linked into Resources/
                            // return name !== '.' && name !== '..' && name !== 'remote';
                            return name === 'data'; // only accept `data` folder
                        };
                        fs.readdirSync(assetsDir, { encoding: 'utf8' }).filter(filterFolders).forEach(f => {
                            const full = ps.normalize(ps.join(assetsDir, f));
                            const options = {};
                            const st = fs.statSync(full);
                            if (st.isDirectory()) {
                                options.lastKnownFileType = 'folder';
                            }
                            // add file ref
                            const newResFile = projectFile.addFile(full, hash, options);
                            {
                                // add file to build file
                                const newBuildFile = {
                                    fileRef: newResFile.fileRef,
                                    uuid: projectFile.generateUuid(),
                                    isa: 'PBXBuildFile',
                                    basename: `${f}`,
                                    group: KeyResource,
                                };
                                projectFile.addToPbxBuildFileSection(newBuildFile);
                                // add file to ResourceBuildPhase of `Resources`
                                const [phaseId] = Object.entries(objects.PBXResourcesBuildPhase).find(([k, x]) => {
                                    return k.endsWith('_comment') && x === KeyResource;
                                });
                                const id = phaseId.split('_comment')[0];
                                objects["PBXResourcesBuildPhase"][id].files.push({
                                    value: newBuildFile.uuid,
                                    comment: full,
                                });
                            }
                        });
                    }
                    fs.writeFileSync(pbxfile, projectFile.writeSync());
                    console.log(`  replace pbxfile: ${pbxfile}.`);
                }
            }
            catch (e) {
                console.error(`disable ZERO_CHECK, failed to update xcode.`);
                console.error(e);
            }
        }
    }
    async checkIfXcodeInstalled() {
        let xcodeFound = false;
        const xcodeInstalled = await utils_1.toolHelper.runCommand('xcode-select', ['-p'], (code, stdout, stderr) => {
            if (code === 0) {
                console.log(`[xcode-select] ${stdout}`);
                if (stdout.indexOf('Xcode') > 0) {
                    xcodeFound = true;
                }
            }
            else {
                console.log(`[xcode-select] ${stdout}`);
                console.error(`[xcode-select] ${stderr}`);
            }
        });
        if (!xcodeInstalled) {
            utils_1.toolHelper.runCommand('xcode-select', ['--install']);
            return false;
        }
        return xcodeFound;
    }
}
exports.MacOSPackTool = MacOSPackTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjLW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvbmF0aXZlLWNvbW1vbi9wYWNrLXRvb2wvcGxhdGZvcm1zL21hYy1vcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFDL0IseUNBQTJCO0FBQzNCLHVDQUF5QjtBQUN6QixpREFBeUM7QUFDekMsOERBQThEO0FBQzlELG9DQUFnRDtBQWNoRCxNQUFzQixhQUFjLFNBQVEsaUJBQWM7SUFHdEQsS0FBSyxDQUFDLE1BQU07UUFDUixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDbEMsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNqQyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3RDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFJRCxrQkFBa0I7UUFDZCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUMzQyxJQUFJLE9BQU8sQ0FBQyxzQkFBc0IsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN6QyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLGdCQUFn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QyxxQkFBcUI7UUFDdkIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLE1BQU0sY0FBYyxHQUFHLE1BQU0sa0JBQVUsQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ2hHLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ3hDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDOUIsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDdEIsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNsQixrQkFBVSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0NBQ0o7QUEvS0Qsc0NBK0tDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgKiBhcyBwcyBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xyXG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XHJcbmltcG9ydCBOYXRpdmVQYWNrVG9vbCwgeyBDb2Nvc1BhcmFtcyB9IGZyb20gJy4uL2Jhc2UvZGVmYXVsdCc7XHJcbmltcG9ydCB7IGNjaGVscGVyLCB0b29sSGVscGVyIH0gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElPcmllbnRhdGlvbiB7XHJcbiAgICBsYW5kc2NhcGVMZWZ0OiBib29sZWFuO1xyXG4gICAgbGFuZHNjYXBlUmlnaHQ6IGJvb2xlYW47XHJcbiAgICBwb3J0cmFpdDogYm9vbGVhbjtcclxuICAgIHVwc2lkZURvd246IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTWFjT1NQYXJhbXMge1xyXG4gICAgYnVuZGxlSWQ6IHN0cmluZztcclxuICAgIHNraXBVcGRhdGVYY29kZVByb2plY3Q6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYWNPU1BhY2tUb29sIGV4dGVuZHMgTmF0aXZlUGFja1Rvb2wge1xyXG4gICAgZGVjbGFyZSBwYXJhbXM6IENvY29zUGFyYW1zPE1hY09TUGFyYW1zPjtcclxuXHJcbiAgICBhc3luYyBjcmVhdGUoKSB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5jb3B5Q29tbW9uVGVtcGxhdGUoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmNvcHlQbGF0Zm9ybVRlbXBsYXRlKCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5nZW5lcmF0ZUNNYWtlQ29uZmlnKCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5leGVjdXRlQ29jb3NUZW1wbGF0ZVRhc2soKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhYnN0cmFjdCBnZW5lcmF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+O1xyXG5cclxuICAgIHNob3VsZFNraXBHZW5lcmF0ZSgpIHtcclxuICAgICAgICBjb25zdCBuYXRpdmVQcmpEaXIgPSB0aGlzLnBhdGhzLm5hdGl2ZVByakRpcjtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXM7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc2tpcFVwZGF0ZVhjb2RlUHJvamVjdCAmJiBmcy5leGlzdHNTeW5jKHBzLmpvaW4obmF0aXZlUHJqRGlyLCAnQ01ha2VDYWNoZS50eHQnKSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NraXAgeGNvZGUgcHJvamVjdCB1cGRhdGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjbWFrZVBhdGggPSBwcy5qb2luKHRoaXMucGF0aHMucGxhdGZvcm1UZW1wbGF0ZURpckluUHJqLCAnQ01ha2VMaXN0cy50eHQnKTtcclxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoY21ha2VQYXRoKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENNYWtlTGlzdHMudHh0IG5vdCBmb3VuZCBpbiAke2NtYWtlUGF0aH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBpc0FwcGxlU2lsaWNvbigpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBjcHVzID0gb3MuY3B1cygpO1xyXG4gICAgICAgIGNvbnN0IG1vZGVsID0gKGNwdXMgJiYgY3B1c1swXSAmJiBjcHVzWzBdLm1vZGVsKSA/IGNwdXNbMF0ubW9kZWwgOiAnJztcclxuICAgICAgICByZXR1cm4gL0FwcGxlLy50ZXN0KG1vZGVsKSAmJiBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0WGNvZGVNYWpvclZlcmlvbigpOiBudW1iZXIge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IGV4ZWNTeW5jKCd4Y3J1biB4Y29kZWJ1aWxkIC12ZXJzaW9uJykudG9TdHJpbmcoJ3V0ZjgnKTtcclxuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5wYXJzZUludChvdXRwdXQubWF0Y2goL1hjb2RlXFxzKFxcZCspXFwuXFxkKy8pIVsxXSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgICAgICAvLyBmYWxsYmFjayB0byBkZWZhdWx0IFhjb2RlIHZlcnNpb25cclxuICAgICAgICAgICAgcmV0dXJuIDExO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBtb2RpZnlYY29kZVByb2plY3QoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zLnNraXBVcGRhdGVYY29kZVByb2plY3QpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0WGNvZGVNYWpvclZlcmlvbigpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFNLSVAgVVBEQVRFIFhDT0RFIFBST0pFQ1QgaXMgb25seSBzdXBwb3J0ZWQgd2l0aCBYY29kZSAxMiBvciBsYXRlcmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMueGNvZGVGaXhBc3NldHNSZWZlcmVuY2VzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElERShwcm9qUGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgYXdhaXQgdG9vbEhlbHBlci5ydW5DbWFrZShbJy0tb3BlbicsIGBcIiR7Y2NoZWxwZXIuZml4UGF0aChwcm9qUGF0aCl9XCJgXSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIFwiU2tpcCBYY29kZSBQcm9qZWN0IFVwZGF0ZVwiIGlzIGNoZWNrZWQsIGNoYW5nZXMgdG8gdGhlIGNvbnRlbnRzIG9mIHRoZSBcImRhdGFcIiBkaXJlY3RvcnlcclxuICAgICAqIHN0aWxsIG5lZWQgdG8gYmUgc3luY2hyb25pemVkIHdpdGggWGNvZGUuIE9uZSB3YXkgdG8gYWNoaWV2ZSB0aGlzIGlzIHRvIG1vZGlmeSB0aGUgWGNvZGVcclxuICAgICAqIHByb2plY3QgZmlsZSBkaXJlY3RseSBhbmQgdXNlIGRpcmVjdG9yeSByZWZlcmVuY2VzIHRvIGFjY2VzcyB0aGUgXCJkYXRhXCIgZGlyZWN0b3J5LlxyXG4gICAgICogSG93ZXZlciwgdGhpcyBtZXRob2QgaXMgbm90IHN1cHBvcnRlZCBpbiBYY29kZSAxMSBhbmQgZWFybGllciBwcm9qZWN0IGZvcm1hdHMgZHVlIHRvIFxyXG4gICAgICogZGlmZmVyZW5jZXMgaW4gdGhlaXIgZm9ybWF0cy5cclxuICAgICAqL1xyXG4gICAgYXN5bmMgeGNvZGVGaXhBc3NldHNSZWZlcmVuY2VzKCkge1xyXG4gICAgICAgIGNvbnN0IG5hdGl2ZVByakRpciA9IHRoaXMucGF0aHMubmF0aXZlUHJqRGlyO1xyXG4gICAgICAgIGNvbnN0IHhjb2RlID0gcmVxdWlyZShwcy5qb2luKHRoaXMucGFyYW1zLmVuZ2luZVBhdGgsICdzY3JpcHRzL25hdGl2ZS1wYWNrLXRvb2wveGNvZGUnKSk7XHJcbiAgICAgICAgY29uc3QgcHJvanMgPSBmcy5yZWFkZGlyU3luYyhuYXRpdmVQcmpEaXIpLmZpbHRlcigoeCkgPT4geC5lbmRzV2l0aCgnLnhjb2RlcHJvaicpKS5tYXAoKHgpID0+IHBzLmpvaW4obmF0aXZlUHJqRGlyLCB4KSk7XHJcbiAgICAgICAgaWYgKHByb2pzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbiBub3QgZmluZCB4Y29kZSBwcm9qZWN0IGZpbGUgaW4gJHtuYXRpdmVQcmpEaXJ9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcHJvaiBvZiBwcm9qcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBieGZpbGUgPSBwcy5qb2luKHByb2osICdwcm9qZWN0LnBieHByb2onKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgcGFyc2luZyBwYnhmaWxlICR7cGJ4ZmlsZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9qZWN0RmlsZSA9IHhjb2RlLnByb2plY3QocGJ4ZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RGaWxlLnBhcnNlKChlcnI6IEVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocHJvamVjdEZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCAgbW9kaWZpeSBYY29kZSBwcm9qZWN0IGZpbGUgJHtwYnhmaWxlfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzb3VyY2VzLyBhZGQgcmVmZXJlbmNlcyB0byBmaWxlcy9mb2xkZXJzIGluIGFzc2V0cy8gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0c0RpciA9IHRoaXMucGF0aHMuYnVpbGREaXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iamVjdHMgPSBwcm9qZWN0RmlsZS5oYXNoLnByb2plY3Qub2JqZWN0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgS2V5UmVzb3VyY2UgPSBgUmVzb3VyY2VzYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSBSZXNvdXJjZUl0ZW0gPSBbc3RyaW5nLCB7IGNoaWxkcmVuOiB7IHZhbHVlOiBzdHJpbmcsIGNvbW1lbnQ6IHN0cmluZyB9W10gfV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc291cmNlczogUmVzb3VyY2VJdGVtW10gPSBPYmplY3QuZW50cmllcyhvYmplY3RzLlBCWEdyb3VwKS5maWx0ZXIoKFssIHhdKSA9PiAoeCBhcyBhbnkpLm5hbWUgPT09IEtleVJlc291cmNlKSBhcyBhbnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBoYXNoOiBzdHJpbmcgPSByZXNvdXJjZXNbMF1bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCAgIG11bHRpcGxlIFJlc291cmNlcy8gZ3JvdXAgZm91bmQhYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtV2VpZ2h0ID0gKGE6IFJlc291cmNlSXRlbSk6IG51bWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzSW1hZ2VBc3NldCA9IGFbMV0uY2hpbGRyZW4uZmlsdGVyKChjKSA9PiBjLmNvbW1lbnQuZW5kc1dpdGgoJy54Y2Fzc2V0cycpKS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmFsQnVpbGRUYXJnZXQgPSBhWzFdLmNoaWxkcmVuLmZpbHRlcigoYykgPT4gYy5jb21tZW50LmluZGV4T2YoYENNYWtlRmlsZXMvJHt0aGlzLnBhcmFtcy5wcm9qZWN0TmFtZX1gKSA+IC0xKS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICAke2FbMF19IGhhc0ltYWdlQXNzZXQgJHtoYXNJbWFnZUFzc2V0fSwgaXMgZmluYWwgdGFyZ2V0ICR7ZmluYWxCdWlsZFRhcmdldH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGZpbmFsQnVpbGRUYXJnZXQgPyAxIDogMCkgKiAxMDAgKyAoaGFzSW1hZ2VBc3NldCA/IDEgOiAwKSAqIDEwICsgYVsxXS5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzaCA9IHJlc291cmNlcy5zb3J0KChhLCBiKSA9PiBpdGVtV2VpZ2h0KGIpIC0gaXRlbVdlaWdodChhKSlbMF1bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgICAgc2VsZWN0ICR7aGFzaH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyRm9sZGVycyA9IChuYW1lOiBzdHJpbmcpOiBib29sZWFuID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IGBhc3NldHMvcmVtb3RlYCBzaG91bGQgbm90IGJlIGxpbmtlZCBpbnRvIFJlc291cmNlcy9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiBuYW1lICE9PSAnLicgJiYgbmFtZSAhPT0gJy4uJyAmJiBuYW1lICE9PSAncmVtb3RlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuYW1lID09PSAnZGF0YSc7IC8vIG9ubHkgYWNjZXB0IGBkYXRhYCBmb2xkZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVhZGRpclN5bmMoYXNzZXRzRGlyLCB7IGVuY29kaW5nOiAndXRmOCcgfSkuZmlsdGVyKGZpbHRlckZvbGRlcnMpLmZvckVhY2goZiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmdWxsID0gcHMubm9ybWFsaXplKHBzLmpvaW4oYXNzZXRzRGlyLCBmKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zOiBhbnkgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0ID0gZnMuc3RhdFN5bmMoZnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubGFzdEtub3duRmlsZVR5cGUgPSAnZm9sZGVyJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCBmaWxlIHJlZlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UmVzRmlsZSA9IHByb2plY3RGaWxlLmFkZEZpbGUoZnVsbCwgaGFzaCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGZpbGUgdG8gYnVpbGQgZmlsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0J1aWxkRmlsZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVJlZjogbmV3UmVzRmlsZS5maWxlUmVmLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBwcm9qZWN0RmlsZS5nZW5lcmF0ZVV1aWQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNhOiAnUEJYQnVpbGRGaWxlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZW5hbWU6IGAke2Z9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IEtleVJlc291cmNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdEZpbGUuYWRkVG9QYnhCdWlsZEZpbGVTZWN0aW9uKG5ld0J1aWxkRmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGZpbGUgdG8gUmVzb3VyY2VCdWlsZFBoYXNlIG9mIGBSZXNvdXJjZXNgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW3BoYXNlSWRdID0gT2JqZWN0LmVudHJpZXMob2JqZWN0cy5QQlhSZXNvdXJjZXNCdWlsZFBoYXNlKS5maW5kKChbaywgeF0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGsuZW5kc1dpdGgoJ19jb21tZW50JykgJiYgeCA9PT0gS2V5UmVzb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gcGhhc2VJZC5zcGxpdCgnX2NvbW1lbnQnKVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RzW1wiUEJYUmVzb3VyY2VzQnVpbGRQaGFzZVwiXVtpZF0uZmlsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuZXdCdWlsZEZpbGUudXVpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWVudDogZnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGJ4ZmlsZSwgcHJvamVjdEZpbGUud3JpdGVTeW5jKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIHJlcGxhY2UgcGJ4ZmlsZTogJHtwYnhmaWxlfS5gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgZGlzYWJsZSBaRVJPX0NIRUNLLCBmYWlsZWQgdG8gdXBkYXRlIHhjb2RlLmApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjaGVja0lmWGNvZGVJbnN0YWxsZWQoKSB7XHJcbiAgICAgICAgbGV0IHhjb2RlRm91bmQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCB4Y29kZUluc3RhbGxlZCA9IGF3YWl0IHRvb2xIZWxwZXIucnVuQ29tbWFuZCgneGNvZGUtc2VsZWN0JywgWyctcCddLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbeGNvZGUtc2VsZWN0XSAke3N0ZG91dH1gKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGRvdXQuaW5kZXhPZignWGNvZGUnKSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB4Y29kZUZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbeGNvZGUtc2VsZWN0XSAke3N0ZG91dH1gKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt4Y29kZS1zZWxlY3RdICR7c3RkZXJyfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCF4Y29kZUluc3RhbGxlZCkge1xyXG4gICAgICAgICAgICB0b29sSGVscGVyLnJ1bkNvbW1hbmQoJ3hjb2RlLXNlbGVjdCcsIFsnLS1pbnN0YWxsJ10pO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB4Y29kZUZvdW5kO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==