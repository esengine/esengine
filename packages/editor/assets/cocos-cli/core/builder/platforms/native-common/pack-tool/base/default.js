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
exports.CocosParams = void 0;
const ps = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const utils_1 = require("../utils");
const zlib_1 = require("zlib");
const globby_1 = require("globby");
const xxtea = require('xxtea-node');
const PackageNewConfig = 'cocos-project-template.json';
const ErrorCodeIncompatible = 15004;
class NativePackTool {
    // 收集初始化的一些路径信息
    paths;
    // 存储调用 cmake 的命令行参数
    cmakeArgs = [];
    // 设置命令行调用时的环境参数
    setEnv(key, value) {
        process.env[key] = value;
    }
    init(params) {
        this.params = new CocosParams(params);
        this.paths = new utils_1.Paths(params);
        this.setEnv('NATIVE_DIR', this.paths.platformTemplateDirInPrj);
        this.setEnv('COMMON_DIR', this.paths.commonDirInPrj);
        this.setEnv('PROJECT_NAME', this.params.projectName);
    }
    parseVersion(content, key, def) {
        const regexp = new RegExp(`${key}=(.*)`);
        const r = content.match(regexp);
        if (!r) {
            return def;
        }
        const v = Number.parseInt(r[1], 10);
        return Number.isNaN(v) ? def : v;
    }
    async copyCommonTemplate() {
        if (!fs.existsSync(ps.join(this.paths.commonDirInPrj, 'CMakeLists.txt'))) {
            await fs.copy(this.paths.commonDirInCocos, this.paths.commonDirInPrj, { overwrite: false });
        }
    }
    get projEngineVersionPath() {
        return ps.join(this.paths.commonDirInPrj, 'cocos-version.json');
    }
    _debugInfo = null;
    get DebugInfos() {
        if (!this._debugInfo) {
            this._debugInfo = require(ps.join(utils_1.Paths.enginePath, 'DebugInfos.json'));
            if (!this._debugInfo) {
                console.error(`Failed to load DebugInfos.json`);
            }
        }
        return this._debugInfo;
    }
    _versionParser = null;
    get versionParser() {
        if (!this._versionParser) {
            const scriptPath = ps.join(utils_1.Paths.enginePath, 'native/cmake/scripts/plugin_support/plugin_cfg.js');
            this._versionParser = require(scriptPath);
        }
        return this._versionParser;
    }
    /**
     * Debug / Release
     */
    get buildType() {
        return this.params.debug ? 'Debug' : 'Release';
    }
    /**
     * Read version number from cocos-version.json
     */
    tryReadProjectTemplateVersion() {
        const versionJsonPath = this.projEngineVersionPath;
        if (!fs.existsSync(versionJsonPath)) {
            console.log(`warning: ${versionJsonPath} not exists`);
            return null;
        }
        try {
            const content = fs.readJsonSync(versionJsonPath);
            if (content.version === undefined) {
                console.error(`Field 'version' missing in ${versionJsonPath}`);
                return null;
            }
            return content;
        }
        catch (e) {
            console.error(`Failed to read json file ${versionJsonPath}`);
            console.error(e);
        }
        return null;
    }
    /**
     * Read package.json file in the root folder and return the version field.
     */
    tryGetEngineVersion() {
        const pkgJSON = ps.join(utils_1.Paths.enginePath, 'package.json');
        if (!fs.existsSync(pkgJSON)) {
            console.error(`Failed to read file ${pkgJSON}`);
            return null;
        }
        return fs.readJsonSync(pkgJSON).version || '3.6.0';
    }
    /**
     * Version condition from compatibility-info.json for current platform.
     */
    tryGetCompatibilityInfo() {
        const compInfo = ps.join(utils_1.Paths.enginePath, 'templates/compatibility-info.json');
        if (!fs.existsSync(compInfo)) {
            console.error(`${compInfo} does not exist`);
            return null;
        }
        const json = fs.readJsonSync(compInfo);
        if (!json.native) {
            console.error(`${compInfo} does not contain "native" field`);
            return null;
        }
        const native = json.native;
        const defaultCfg = native.default;
        if (!defaultCfg) {
            console.error(`${compInfo} does not contain "native.default" field`);
            return null;
        }
        const plt = this.params.platform;
        if (!native[plt]) {
            return defaultCfg;
        }
        return native[plt];
    }
    commonDirAreIdentical() {
        const commonSrc = this.paths.commonDirInCocos;
        const commonDst = this.paths.commonDirInPrj;
        const compFile = (src, dst) => {
            const linesSrc = fs.readFileSync(src).toString('utf8').split('\n').map((line) => line.trim());
            const linesDst = fs.readFileSync(dst).toString('utf8').split('\n').map((line) => line.trim());
            return linesSrc.length === linesDst.length && linesSrc.every((line, index) => line === linesDst[index]);
        };
        const compFiles = ['Classes/Game.h', 'Classes/Game.cpp'];
        for (const f of compFiles) {
            const srcFile = ps.join(commonSrc, f);
            const dstFile = ps.join(commonDst, f);
            if (!fs.existsSync(dstFile)) {
                return false;
            }
            if (!fs.existsSync(srcFile)) {
                console.warn(`${f} not exists in ${commonSrc}`);
                return false;
            }
            if (!compFile(srcFile, dstFile)) {
                console.log(`File ${dstFile} differs from ${srcFile}`);
                return false;
            }
        }
        return true;
    }
    skipVersionCheck = false;
    /**
     * The engine version used to generate the 'native/' folder should match the
     * condition written in the 'compatibility-info.json' file.
     */
    validateTemplateVersion() {
        console.log(`Checking template version...`);
        const engineVersion = this.tryGetEngineVersion();
        const projEngineVersionObj = this.tryReadProjectTemplateVersion();
        if (projEngineVersionObj === null) {
            if (this.commonDirAreIdentical()) {
                console.log(`The files under common/Classes directory are identical with the ones in the template. Append version file to the project.`);
                this.writeEngineVersion();
                return true;
            }
            console.error(`Error code ${ErrorCodeIncompatible}, ${this.DebugInfos[ErrorCodeIncompatible]}`);
            return false;
        }
        const versionRange = this.tryGetCompatibilityInfo();
        const projEngineVersion = projEngineVersionObj?.version;
        if (!versionRange) {
            console.warn(`Ignore version range check`);
            return true;
        }
        if (projEngineVersionObj.skipCheck === true) {
            console.log(`Skip version range check by project`);
            this.skipVersionCheck = true;
            return true;
        }
        const cond = this.versionParser.parse(versionRange);
        if (!cond) {
            return true;
        }
        if (cond.match(projEngineVersion)) {
            const newerThanEngineVersion = this.versionParser.parse(`>${engineVersion}`);
            if (newerThanEngineVersion.match(projEngineVersion)) {
                console.log(`warning: ${projEngineVersion} is newer than engine version ${engineVersion}`);
            }
            return true;
        }
        console.error(`'native/' folder was generated by ${projEngineVersion} which is incompatible with ${engineVersion}, condition: '${versionRange}'`);
        console.error(`${this.DebugInfos[ErrorCodeIncompatible]}`);
        return false;
    }
    /**
     * Utility function to check if a file exists dst as in src.
     */
    validateDirectory(src, dst, missingDirs) {
        if (!fs.existsSync(dst)) {
            missingDirs.push(dst);
            return;
        }
        const st = fs.statSync(src);
        if (!st.isDirectory()) {
            return;
        }
        const list = fs.readdirSync(src);
        for (const f of list) {
            if (f.startsWith('.'))
                continue;
            this.validateDirectory(ps.join(src, f), ps.join(dst, f), missingDirs);
        }
    }
    /**
     *  Check files under `native/engine/platform` folder
     */
    validatePlatformDirectory(missing) {
        console.log(`Validating platform source code directories...`);
        const srcDir = ps.join(this.paths.nativeTemplateDirInCocos, this.params.platform);
        const dstDir = this.paths.platformTemplateDirInPrj;
        this.validateDirectory(srcDir, dstDir, missing);
    }
    /**
     * Check if any file removed from the 'native/' folder
     */
    validateTemplateConsistency() {
        console.log(`Validating template consistency...`);
        const commonSrc = this.paths.commonDirInCocos;
        const commonDst = this.paths.commonDirInPrj;
        const missingDirs = [];
        // validate common directory
        this.validateDirectory(commonSrc, commonDst, missingDirs);
        this.validatePlatformDirectory(missingDirs);
        if (missingDirs.length > 0) {
            console.log(`Following files are missing`);
            for (const f of missingDirs) {
                console.log(`  ${f}`);
            }
            console.log(`Consider fix the problem or remove the directory`);
            console.log('To avoid this warning, set field \'skipCheck\' in cocos-version.json to true.');
            return false;
        }
        return true;
    }
    /**
     * - Ensure the engine version used to generete 'native/' folder is compatible
     *   with the current engine version.
     * - Check if any file under the 'native/' folder is removed.
     */
    validateNativeDir() {
        try {
            if (this.validateTemplateVersion()) {
                if (!this.skipVersionCheck && !this.validateTemplateConsistency()) {
                    console.log(`Failed to validate "native" directory`);
                }
            }
        }
        catch (e) {
            console.warn(`Failed to validate native directory`);
            console.warn(e);
        }
    }
    /**
     * Write cocos-version.json into native/common/cocos-version.json
     */
    writeEngineVersion() {
        if (!fs.existsSync(this.projEngineVersionPath)) {
            fs.writeJSON(this.projEngineVersionPath, {
                version: this.tryGetEngineVersion(),
                skipCheck: false,
            });
        }
    }
    async copyPlatformTemplate() {
        if (!fs.existsSync(this.paths.platformTemplateDirInPrj)) {
            // 拷贝 templates/平台/ 文件到 "native" 目录
            await fs.copy(ps.join(this.paths.nativeTemplateDirInCocos, this.params.platform), this.paths.platformTemplateDirInPrj, { overwrite: false });
            this.writeEngineVersion();
        }
        else {
            this.validateNativeDir();
        }
    }
    projectNameASCII() {
        return /^[0-9a-zA-Z_-]+$/.test(this.params.projectName) ? this.params.projectName : 'CocosGame';
    }
    getExecutableNameOrDefault() {
        const en = this.params.executableName;
        return en ? en : this.projectNameASCII();
    }
    async executeTemplateTask(tasks) {
        if (tasks.appendFile) {
            await Promise.all(tasks.appendFile.map((task) => {
                const dest = utils_1.cchelper.replaceEnvVariables(task.to);
                fs.ensureDirSync(ps.dirname(dest));
                return fs.copy(ps.join(utils_1.Paths.nativeRoot, task.from), dest);
            }));
            delete tasks.appendFile;
        }
        const replaceFilesDelay = {};
        if (tasks.projectReplaceProjectName) {
            const cmd = tasks.projectReplaceProjectName;
            cmd.files.forEach((file) => {
                const fp = utils_1.cchelper.join(this.paths.buildDir, file);
                replaceFilesDelay[fp] = replaceFilesDelay[fp] || [];
                replaceFilesDelay[fp].push({
                    reg: cmd.srcProjectName,
                    content: this.params.projectName,
                });
            });
            delete tasks.projectReplaceProjectName;
        }
        if (tasks.projectReplaceProjectNameASCII) {
            const cmd = tasks.projectReplaceProjectNameASCII;
            if (cmd.srcProjectName !== this.projectNameASCII()) {
                cmd.files.forEach((file) => {
                    const fp = utils_1.cchelper.join(this.paths.buildDir, file);
                    replaceFilesDelay[fp] = replaceFilesDelay[fp] || [];
                    replaceFilesDelay[fp].push({
                        reg: cmd.srcProjectName,
                        content: this.projectNameASCII(),
                    });
                });
            }
            delete tasks.projectReplaceProjectNameASCII;
        }
        if (tasks.projectReplacePackageName) {
            const cmd = tasks.projectReplacePackageName;
            const name = cmd.srcPackageName.replace(/\./g, '\\.');
            cmd.files.forEach((file) => {
                const fp = utils_1.cchelper.join(this.paths.buildDir, file);
                replaceFilesDelay[fp] = replaceFilesDelay[fp] || [];
                replaceFilesDelay[fp].push({
                    reg: name,
                    content: this.params.platformParams.packageName,
                });
            });
            delete tasks.projectReplacePackageName;
        }
        for (const fullpath in replaceFilesDelay) {
            const cfg = replaceFilesDelay[fullpath];
            await utils_1.cchelper.replaceInFile(cfg.map((x) => {
                return { reg: x.reg, text: x.content };
            }), fullpath);
        }
        if (Object.keys(tasks).length > 0) {
            for (const f in tasks) {
                console.error(`command "${f}" is not parsed in ${PackageNewConfig}`);
            }
        }
    }
    async generateCMakeConfig() {
        // 添加一些 cmake 配置到 cfg.cmake
        const file = ps.join(this.paths.nativePrjDir, 'cfg.cmake');
        let content = '';
        const config = this.params.cMakeConfig;
        Object.keys(config).forEach((key) => {
            // convert boolean to CMake option.
            if (typeof config[key] === 'boolean') {
                config[key] = `set(${key} ${config[key] ? 'ON' : 'OFF'})`;
            }
        });
        Object.keys(config).forEach((key) => {
            if (typeof config[key] !== 'string') {
                console.error(`cMakeConfig.${key} is not a string, "${config[key]}"`);
            }
            else {
                content += config[key] + '\n';
            }
        });
        console.debug(`generateCMakeConfig, ${JSON.stringify(config)}`);
        await fs.outputFile(file, content);
    }
    appendCmakeCommonArgs(args) {
        args.push(`-DRES_DIR="${utils_1.cchelper.fixPath(this.paths.buildDir)}"`);
        args.push(`-DAPP_NAME="${this.params.projectName}"`);
        args.push(`-DLAUNCH_TYPE="${this.buildType}"`);
        if (this.params.platformParams.skipUpdateXcodeProject) {
            args.push(`-DCMAKE_SUPPRESS_REGENERATION=ON`);
        }
    }
    /**
     * 加密脚本，加密后，会修改 cmake 参数，因而需要再次执行 cmake 配置文件的生成
     * @returns
     */
    async encryptScripts() {
        if (!this.params.encrypted) {
            return;
        }
        if (!this.params.xxteaKey) {
            throw new Error('Encryption Key can not be empty');
        }
        console.debug('Start encrypte scripts...');
        // native 加密步骤(1/3)：生成完工程所有文件添加 cmake 配置
        if (this.params.encrypted) {
            this.params.cMakeConfig.XXTEAKEY = `set(XXTEAKEY "${this.params.xxteaKey}")`;
        }
        const backupPath = ps.join(this.paths.buildDir, 'script-backup');
        fs.ensureDirSync(backupPath);
        fs.emptyDirSync(backupPath);
        const allBundleConfigs = await (0, globby_1.globby)([
            ps.join(this.paths.buildAssetsDir, 'assets/*/cc.config*.json'),
            ps.join(this.paths.buildAssetsDir, 'remote/*/cc.config*.json'),
        ]);
        for (const configPath of allBundleConfigs) {
            const config = await fs.readJSON(configPath);
            // native 加密步骤(2/3)：加密的标志位，需要写入到 bundle 的 config.json 内运行时需要
            const version = configPath.match(/\/cc.config(.*).json/)[1];
            const scriptDest = ps.join(ps.dirname(configPath), `index${version}.js`);
            let content = fs.readFileSync(scriptDest, 'utf8');
            if (this.params.compressZip) {
                content = (0, zlib_1.gzipSync)(content);
                content = xxtea.encrypt(content, xxtea.toBytes(this.params.xxteaKey));
            }
            else {
                content = xxtea.encrypt(xxtea.toBytes(content), xxtea.toBytes(this.params.xxteaKey));
            }
            const newScriptDest = ps.join(ps.dirname(scriptDest), ps.basename(scriptDest, ps.extname(scriptDest)) + '.jsc');
            fs.writeFileSync(newScriptDest, content);
            config.encrypted = true;
            fs.writeJSONSync(configPath, config);
            fs.copySync(scriptDest, ps.join(backupPath, ps.relative(this.paths.buildAssetsDir, scriptDest)));
            fs.removeSync(scriptDest);
        }
        await this.generateCMakeConfig();
        console.debug('Encrypt scripts success');
    }
    /**
     * 解析、执行 cocos-template.json 模板任务
     */
    async executeCocosTemplateTask() {
        const templateTaskMap = await fs.readJSON(ps.join(this.paths.nativeTemplateDirInCocos, PackageNewConfig));
        for (const templateTask of Object.values(templateTaskMap)) {
            await this.executeTemplateTask(templateTask);
        }
    }
}
exports.default = NativePackTool;
// cocos.compile.json 
class CocosParams {
    platformParams;
    debug;
    projectName;
    cmakePath;
    platform;
    platformName;
    executableName;
    /**
     * engine root
     */
    enginePath;
    /**
     * native engine root
     */
    nativeEnginePath;
    /**
     * project path
     */
    projDir;
    /**
     * build/[platform]
     */
    buildDir;
    /**
     * @zh 构建资源路径
     * @en /build/[platform]/data
     */
    buildAssetsDir;
    /**
     * @zh 是否加密脚本
     * @en is encrypted
     */
    encrypted;
    /**
     * @zh 是否压缩脚本
     * @en is compress script
     */
    compressZip;
    /**
     * @zh 加密密钥
     * @en encrypt Key
     */
    xxteaKey;
    /**
     * @zh 是否为模拟器
     * @en is simulator
     */
    simulator;
    cMakeConfig = {
        CC_USE_GLES3: false,
        CC_USE_GLES2: true,
        USE_SERVER_MODE: 'set(USE_SERVER_MODE OFF)',
        NET_MODE: 'set(NET_MODE 0)',
        XXTEAKEY: '',
        CC_ENABLE_SWAPPY: false,
    };
    constructor(params) {
        this.buildAssetsDir = params.buildAssetsDir;
        this.projectName = params.projectName;
        this.debug = params.debug;
        this.cmakePath = params.cmakePath;
        this.platform = params.platform;
        this.platformName = params.platformName;
        this.enginePath = params.enginePath;
        this.nativeEnginePath = params.nativeEnginePath;
        this.projDir = params.projDir;
        this.buildDir = params.buildDir;
        this.xxteaKey = params.xxteaKey;
        this.encrypted = params.encrypted;
        this.compressZip = params.compressZip;
        this.executableName = params.executableName;
        Object.assign(this.cMakeConfig, params.cMakeConfig);
        this.platformParams = params.platformParams;
    }
}
exports.CocosParams = CocosParams;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvcGxhdGZvcm1zL25hdGl2ZS1jb21tb24vcGFjay10b29sL2Jhc2UvZGVmYXVsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBMkI7QUFDM0IsNkNBQStCO0FBQy9CLG9DQUEyQztBQUUzQywrQkFBZ0M7QUFFaEMsbUNBQWdDO0FBQ2hDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUVwQyxNQUFNLGdCQUFnQixHQUFHLDZCQUE2QixDQUFDO0FBSXZELE1BQU0scUJBQXFCLEdBQUcsS0FBSyxDQUFDO0FBWXBDLE1BQThCLGNBQWM7SUFHeEMsZUFBZTtJQUNmLEtBQUssQ0FBUztJQUNkLG9CQUFvQjtJQUNwQixTQUFTLEdBQWEsRUFBRSxDQUFDO0lBRXpCLGdCQUFnQjtJQUNoQixNQUFNLENBQUMsR0FBVyxFQUFFLEtBQVU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQUksQ0FBQyxNQUEyQjtRQUM1QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE1B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LE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUM1QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztJQUNoRCxDQUFDO0NBQ0o7QUEvRUQsa0NBK0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcHMgZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgY2NoZWxwZXIsIFBhdGhzIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBDb2Nvc1Byb2plY3RUYXNrcyB9IGZyb20gJy4vY29jb3NQcm9qZWN0VHlwZXMnO1xyXG5pbXBvcnQgeyBnemlwU3luYyB9IGZyb20gJ3psaWInO1xyXG5pbXBvcnQgeyBJQ01ha2VDb25maWcgfSBmcm9tICcuLi8uLi90eXBlJztcclxuaW1wb3J0IHsgZ2xvYmJ5IH0gZnJvbSAnZ2xvYmJ5JztcclxuY29uc3QgeHh0ZWEgPSByZXF1aXJlKCd4eHRlYS1ub2RlJyk7XHJcblxyXG5jb25zdCBQYWNrYWdlTmV3Q29uZmlnID0gJ2NvY29zLXByb2plY3QtdGVtcGxhdGUuanNvbic7XHJcblxyXG5leHBvcnQgdHlwZSBJbnRlcm5hbE5hdGl2ZVBsYXRmb3JtID0gJ21hYycgfCAnYW5kcm9pZCcgfCAnd2luZG93cycgfCAnaW9zJztcclxuXHJcbmNvbnN0IEVycm9yQ29kZUluY29tcGF0aWJsZSA9IDE1MDA0O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJTmF0aXZlUGxhdGZvcm1PcHRpb25zIHtcclxuICAgIGV4dGVuZHM/OiBJbnRlcm5hbE5hdGl2ZVBsYXRmb3JtLCAvL+S8oOWFpee7p+aJv+eahOW5s+WPsO+8jOWwhuS8mue7p+aJv+W3suacieW5s+WPsOazqOWGjOeahOS4gOS6m+S7o+eggVxyXG4gICAgb3ZlcndyaXRlPzogSW50ZXJuYWxOYXRpdmVQbGF0Zm9ybSwgLy/kvKDlhaXnu6fmib/kvYblpoLmnpzmnInlkIzlkI3nmoTmlrnms5XnrYnkvJrlpI3lhpnlubPlj7DvvIzlsIbkvJrnu6fmib/lt7LmnInlubPlj7Dms6jlhoznmoTkuIDkupvku6PnoIFcclxuICAgIGNyZWF0ZTogKCkgPT4gUHJvbWlzZTxib29sZWFuPjtcclxuICAgIGdlbnJhdGU6ICgpID0+IFByb21pc2U8Ym9vbGVhbj47XHJcbiAgICBtYWtlPzogKCkgPT4gUHJvbWlzZTxib29sZWFuPjtcclxuICAgIHJ1bj86ICgpID0+IFByb21pc2U8Ym9vbGVhbj47XHJcbiAgICBpbml0OiAocGFyYW1zOiBDb2Nvc1BhcmFtczxPYmplY3Q+KSA9PiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBOYXRpdmVQYWNrVG9vbCB7XHJcbiAgICAvLyDkvKDlhaXnmoTmiZPljIXlj4LmlbBcclxuICAgIGRlY2xhcmUgcGFyYW1zOiBDb2Nvc1BhcmFtczxPYmplY3Q+O1xyXG4gICAgLy8g5pS26ZuG5Yid5aeL5YyW55qE5LiA5Lqb6Lev5b6E5L+h5oGvXHJcbiAgICBwYXRocyE6IFBhdGhzO1xyXG4gICAgLy8g5a2Y5YKo6LCD55SoIGNtYWtlIOeahOWRveS7pOihjOWPguaVsFxyXG4gICAgY21ha2VBcmdzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIC8vIOiuvue9ruWRveS7pOihjOiwg+eUqOaXtueahOeOr+Wig+WPguaVsFxyXG4gICAgc2V0RW52KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgcHJvY2Vzcy5lbnZba2V5XSA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQocGFyYW1zOiBDb2Nvc1BhcmFtczxPYmplY3Q+KSB7XHJcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBuZXcgQ29jb3NQYXJhbXMocGFyYW1zKTtcclxuICAgICAgICB0aGlzLnBhdGhzID0gbmV3IFBhdGhzKHBhcmFtcyk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0RW52KCdOQVRJVkVfRElSJywgdGhpcy5wYXRocy5wbGF0Zm9ybVRlbXBsYXRlRGlySW5QcmopO1xyXG4gICAgICAgIHRoaXMuc2V0RW52KCdDT01NT05fRElSJywgdGhpcy5wYXRocy5jb21tb25EaXJJblByaik7XHJcbiAgICAgICAgdGhpcy5zZXRFbnYoJ1BST0pFQ1RfTkFNRScsIHRoaXMucGFyYW1zLnByb2plY3ROYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgcGFyc2VWZXJzaW9uKGNvbnRlbnQ6IHN0cmluZywga2V5OiBzdHJpbmcsIGRlZjogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCByZWdleHAgPSBuZXcgUmVnRXhwKGAke2tleX09KC4qKWApO1xyXG4gICAgICAgIGNvbnN0IHIgPSBjb250ZW50Lm1hdGNoKHJlZ2V4cCk7XHJcbiAgICAgICAgaWYgKCFyKSB7IHJldHVybiBkZWY7IH1cclxuICAgICAgICBjb25zdCB2ID0gTnVtYmVyLnBhcnNlSW50KHJbMV0sIDEwKTtcclxuICAgICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKHYpID8gZGVmIDogdjtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYXN5bmMgY29weUNvbW1vblRlbXBsYXRlKCkge1xyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcy5qb2luKHRoaXMucGF0aHMuY29tbW9uRGlySW5QcmosICdDTWFrZUxpc3RzLnR4dCcpKSkge1xyXG4gICAgICAgICAgICBhd2FpdCBmcy5jb3B5KHRoaXMucGF0aHMuY29tbW9uRGlySW5Db2NvcywgdGhpcy5wYXRocy5jb21tb25EaXJJblByaiwgeyBvdmVyd3JpdGU6IGZhbHNlIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldCBwcm9qRW5naW5lVmVyc2lvblBhdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBzLmpvaW4odGhpcy5wYXRocy5jb21tb25EaXJJblByaiwgJ2NvY29zLXZlcnNpb24uanNvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RlYnVnSW5mbzogYW55ID0gbnVsbDtcclxuICAgIHByaXZhdGUgZ2V0IERlYnVnSW5mb3MoKTogeyBba2V5OiBudW1iZXJdOiBzdHJpbmcgfSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9kZWJ1Z0luZm8pIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVidWdJbmZvID0gcmVxdWlyZShwcy5qb2luKFBhdGhzLmVuZ2luZVBhdGgsICdEZWJ1Z0luZm9zLmpzb24nKSk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fZGVidWdJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBEZWJ1Z0luZm9zLmpzb25gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVidWdJbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3ZlcnNpb25QYXJzZXI6IGFueSA9IG51bGw7XHJcbiAgICBwcml2YXRlIGdldCB2ZXJzaW9uUGFyc2VyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdmVyc2lvblBhcnNlcikge1xyXG4gICAgICAgICAgICBjb25zdCBzY3JpcHRQYXRoID0gcHMuam9pbihQYXRocy5lbmdpbmVQYXRoLCAnbmF0aXZlL2NtYWtlL3NjcmlwdHMvcGx1Z2luX3N1cHBvcnQvcGx1Z2luX2NmZy5qcycpO1xyXG4gICAgICAgICAgICB0aGlzLl92ZXJzaW9uUGFyc2VyID0gcmVxdWlyZShzY3JpcHRQYXRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlcnNpb25QYXJzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWJ1ZyAvIFJlbGVhc2VcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldCBidWlsZFR5cGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZGVidWcgPyAnRGVidWcnIDogJ1JlbGVhc2UnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVhZCB2ZXJzaW9uIG51bWJlciBmcm9tIGNvY29zLXZlcnNpb24uanNvblxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgdHJ5UmVhZFByb2plY3RUZW1wbGF0ZVZlcnNpb24oKTogeyB2ZXJzaW9uOiBzdHJpbmcsIHNraXBDaGVjazogYm9vbGVhbiB8IHVuZGVmaW5lZCB9IHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgdmVyc2lvbkpzb25QYXRoID0gdGhpcy5wcm9qRW5naW5lVmVyc2lvblBhdGg7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHZlcnNpb25Kc29uUGF0aCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHdhcm5pbmc6ICR7dmVyc2lvbkpzb25QYXRofSBub3QgZXhpc3RzYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEpzb25TeW5jKHZlcnNpb25Kc29uUGF0aCk7XHJcbiAgICAgICAgICAgIGlmIChjb250ZW50LnZlcnNpb24gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmllbGQgJ3ZlcnNpb24nIG1pc3NpbmcgaW4gJHt2ZXJzaW9uSnNvblBhdGh9YCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY29udGVudDtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byByZWFkIGpzb24gZmlsZSAke3ZlcnNpb25Kc29uUGF0aH1gKTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWFkIHBhY2thZ2UuanNvbiBmaWxlIGluIHRoZSByb290IGZvbGRlciBhbmQgcmV0dXJuIHRoZSB2ZXJzaW9uIGZpZWxkLiBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHRyeUdldEVuZ2luZVZlcnNpb24oKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgcGtnSlNPTiA9IHBzLmpvaW4oUGF0aHMuZW5naW5lUGF0aCwgJ3BhY2thZ2UuanNvbicpO1xyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwa2dKU09OKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gcmVhZCBmaWxlICR7cGtnSlNPTn1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmcy5yZWFkSnNvblN5bmMocGtnSlNPTikudmVyc2lvbiB8fCAnMy42LjAnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVmVyc2lvbiBjb25kaXRpb24gZnJvbSBjb21wYXRpYmlsaXR5LWluZm8uanNvbiBmb3IgY3VycmVudCBwbGF0Zm9ybS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHRyeUdldENvbXBhdGliaWxpdHlJbmZvKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IGNvbXBJbmZvID0gcHMuam9pbihQYXRocy5lbmdpbmVQYXRoLCAndGVtcGxhdGVzL2NvbXBhdGliaWxpdHktaW5mby5qc29uJyk7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGNvbXBJbmZvKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2NvbXBJbmZvfSBkb2VzIG5vdCBleGlzdGApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhjb21wSW5mbyk7XHJcbiAgICAgICAgaWYgKCFqc29uLm5hdGl2ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2NvbXBJbmZvfSBkb2VzIG5vdCBjb250YWluIFwibmF0aXZlXCIgZmllbGRgKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5hdGl2ZSA9IGpzb24ubmF0aXZlO1xyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRDZmcgPSBuYXRpdmUuZGVmYXVsdDtcclxuICAgICAgICBpZiAoIWRlZmF1bHRDZmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjb21wSW5mb30gZG9lcyBub3QgY29udGFpbiBcIm5hdGl2ZS5kZWZhdWx0XCIgZmllbGRgKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBsdCA9IHRoaXMucGFyYW1zLnBsYXRmb3JtO1xyXG4gICAgICAgIGlmICghbmF0aXZlW3BsdF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRDZmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuYXRpdmVbcGx0XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbW1vbkRpckFyZUlkZW50aWNhbCgpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBjb21tb25TcmMgPSB0aGlzLnBhdGhzLmNvbW1vbkRpckluQ29jb3M7XHJcbiAgICAgICAgY29uc3QgY29tbW9uRHN0ID0gdGhpcy5wYXRocy5jb21tb25EaXJJblByajtcclxuICAgICAgICBjb25zdCBjb21wRmlsZSA9IChzcmM6IHN0cmluZywgZHN0OiBzdHJpbmcpOiBib29sZWFuID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbGluZXNTcmM6IHN0cmluZ1tdID0gZnMucmVhZEZpbGVTeW5jKHNyYykudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnXFxuJykubWFwKChsaW5lKSA9PiBsaW5lLnRyaW0oKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzRHN0OiBzdHJpbmdbXSA9IGZzLnJlYWRGaWxlU3luYyhkc3QpLnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJ1xcbicpLm1hcCgobGluZSkgPT4gbGluZS50cmltKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gbGluZXNTcmMubGVuZ3RoID09PSBsaW5lc0RzdC5sZW5ndGggJiYgbGluZXNTcmMuZXZlcnkoKGxpbmUsIGluZGV4KSA9PiBsaW5lID09PSBsaW5lc0RzdFtpbmRleF0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgY29tcEZpbGVzID0gWydDbGFzc2VzL0dhbWUuaCcsICdDbGFzc2VzL0dhbWUuY3BwJ107XHJcbiAgICAgICAgZm9yIChjb25zdCBmIG9mIGNvbXBGaWxlcykge1xyXG4gICAgICAgICAgICBjb25zdCBzcmNGaWxlID0gcHMuam9pbihjb21tb25TcmMsIGYpO1xyXG4gICAgICAgICAgICBjb25zdCBkc3RGaWxlID0gcHMuam9pbihjb21tb25Ec3QsIGYpO1xyXG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZHN0RmlsZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHNyY0ZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7Zn0gbm90IGV4aXN0cyBpbiAke2NvbW1vblNyY31gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFjb21wRmlsZShzcmNGaWxlLCBkc3RGaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEZpbGUgJHtkc3RGaWxlfSBkaWZmZXJzIGZyb20gJHtzcmNGaWxlfWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2tpcFZlcnNpb25DaGVjayA9IGZhbHNlO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW5naW5lIHZlcnNpb24gdXNlZCB0byBnZW5lcmF0ZSB0aGUgJ25hdGl2ZS8nIGZvbGRlciBzaG91bGQgbWF0Y2ggdGhlIFxyXG4gICAgICogY29uZGl0aW9uIHdyaXR0ZW4gaW4gdGhlICdjb21wYXRpYmlsaXR5LWluZm8uanNvbicgZmlsZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVRlbXBsYXRlVmVyc2lvbigpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgQ2hlY2tpbmcgdGVtcGxhdGUgdmVyc2lvbi4uLmApO1xyXG4gICAgICAgIGNvbnN0IGVuZ2luZVZlcnNpb24gPSB0aGlzLnRyeUdldEVuZ2luZVZlcnNpb24oKTtcclxuICAgICAgICBjb25zdCBwcm9qRW5naW5lVmVyc2lvbk9iaiA9IHRoaXMudHJ5UmVhZFByb2plY3RUZW1wbGF0ZVZlcnNpb24oKTtcclxuICAgICAgICBpZiAocHJvakVuZ2luZVZlcnNpb25PYmogPT09IG51bGwpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29tbW9uRGlyQXJlSWRlbnRpY2FsKCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBUaGUgZmlsZXMgdW5kZXIgY29tbW9uL0NsYXNzZXMgZGlyZWN0b3J5IGFyZSBpZGVudGljYWwgd2l0aCB0aGUgb25lcyBpbiB0aGUgdGVtcGxhdGUuIEFwcGVuZCB2ZXJzaW9uIGZpbGUgdG8gdGhlIHByb2plY3QuYCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlRW5naW5lVmVyc2lvbigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgY29kZSAke0Vycm9yQ29kZUluY29tcGF0aWJsZX0sICR7dGhpcy5EZWJ1Z0luZm9zW0Vycm9yQ29kZUluY29tcGF0aWJsZV19YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdmVyc2lvblJhbmdlID0gdGhpcy50cnlHZXRDb21wYXRpYmlsaXR5SW5mbygpO1xyXG4gICAgICAgIGNvbnN0IHByb2pFbmdpbmVWZXJzaW9uID0gcHJvakVuZ2luZVZlcnNpb25PYmo/LnZlcnNpb247XHJcbiAgICAgICAgaWYgKCF2ZXJzaW9uUmFuZ2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBJZ25vcmUgdmVyc2lvbiByYW5nZSBjaGVja2ApO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb2pFbmdpbmVWZXJzaW9uT2JqLnNraXBDaGVjayA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgU2tpcCB2ZXJzaW9uIHJhbmdlIGNoZWNrIGJ5IHByb2plY3RgKTtcclxuICAgICAgICAgICAgdGhpcy5za2lwVmVyc2lvbkNoZWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvbmQgPSB0aGlzLnZlcnNpb25QYXJzZXIucGFyc2UodmVyc2lvblJhbmdlKTtcclxuICAgICAgICBpZiAoIWNvbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb25kLm1hdGNoKHByb2pFbmdpbmVWZXJzaW9uKSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbmV3ZXJUaGFuRW5naW5lVmVyc2lvbiA9IHRoaXMudmVyc2lvblBhcnNlci5wYXJzZShgPiR7ZW5naW5lVmVyc2lvbn1gKTtcclxuICAgICAgICAgICAgaWYgKG5ld2VyVGhhbkVuZ2luZVZlcnNpb24ubWF0Y2gocHJvakVuZ2luZVZlcnNpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgd2FybmluZzogJHtwcm9qRW5naW5lVmVyc2lvbn0gaXMgbmV3ZXIgdGhhbiBlbmdpbmUgdmVyc2lvbiAke2VuZ2luZVZlcnNpb259YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYCduYXRpdmUvJyBmb2xkZXIgd2FzIGdlbmVyYXRlZCBieSAke3Byb2pFbmdpbmVWZXJzaW9ufSB3aGljaCBpcyBpbmNvbXBhdGlibGUgd2l0aCAke2VuZ2luZVZlcnNpb259LCBjb25kaXRpb246ICcke3ZlcnNpb25SYW5nZX0nYCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgJHt0aGlzLkRlYnVnSW5mb3NbRXJyb3JDb2RlSW5jb21wYXRpYmxlXX1gKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNoZWNrIGlmIGEgZmlsZSBleGlzdHMgZHN0IGFzIGluIHNyYy5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHZhbGlkYXRlRGlyZWN0b3J5KHNyYzogc3RyaW5nLCBkc3Q6IHN0cmluZywgbWlzc2luZ0RpcnM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGRzdCkpIHtcclxuICAgICAgICAgICAgbWlzc2luZ0RpcnMucHVzaChkc3QpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN0ID0gZnMuc3RhdFN5bmMoc3JjKTtcclxuICAgICAgICBpZiAoIXN0LmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsaXN0ID0gZnMucmVhZGRpclN5bmMoc3JjKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGYgb2YgbGlzdCkge1xyXG4gICAgICAgICAgICBpZiAoZi5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlRGlyZWN0b3J5KHBzLmpvaW4oc3JjLCBmKSwgcHMuam9pbihkc3QsIGYpLCBtaXNzaW5nRGlycyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIENoZWNrIGZpbGVzIHVuZGVyIGBuYXRpdmUvZW5naW5lL3BsYXRmb3JtYCBmb2xkZXJcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHZhbGlkYXRlUGxhdGZvcm1EaXJlY3RvcnkobWlzc2luZzogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgVmFsaWRhdGluZyBwbGF0Zm9ybSBzb3VyY2UgY29kZSBkaXJlY3Rvcmllcy4uLmApO1xyXG4gICAgICAgIGNvbnN0IHNyY0RpciA9IHBzLmpvaW4odGhpcy5wYXRocy5uYXRpdmVUZW1wbGF0ZURpckluQ29jb3MsIHRoaXMucGFyYW1zLnBsYXRmb3JtKTtcclxuICAgICAgICBjb25zdCBkc3REaXIgPSB0aGlzLnBhdGhzLnBsYXRmb3JtVGVtcGxhdGVEaXJJblByajtcclxuICAgICAgICB0aGlzLnZhbGlkYXRlRGlyZWN0b3J5KHNyY0RpciwgZHN0RGlyLCBtaXNzaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIGFueSBmaWxlIHJlbW92ZWQgZnJvbSB0aGUgJ25hdGl2ZS8nIGZvbGRlclxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlVGVtcGxhdGVDb25zaXN0ZW5jeSgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgVmFsaWRhdGluZyB0ZW1wbGF0ZSBjb25zaXN0ZW5jeS4uLmApO1xyXG4gICAgICAgIGNvbnN0IGNvbW1vblNyYyA9IHRoaXMucGF0aHMuY29tbW9uRGlySW5Db2NvcztcclxuICAgICAgICBjb25zdCBjb21tb25Ec3QgPSB0aGlzLnBhdGhzLmNvbW1vbkRpckluUHJqO1xyXG4gICAgICAgIGNvbnN0IG1pc3NpbmdEaXJzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIC8vIHZhbGlkYXRlIGNvbW1vbiBkaXJlY3RvcnlcclxuICAgICAgICB0aGlzLnZhbGlkYXRlRGlyZWN0b3J5KGNvbW1vblNyYywgY29tbW9uRHN0LCBtaXNzaW5nRGlycyk7XHJcbiAgICAgICAgdGhpcy52YWxpZGF0ZVBsYXRmb3JtRGlyZWN0b3J5KG1pc3NpbmdEaXJzKTtcclxuICAgICAgICBpZiAobWlzc2luZ0RpcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRm9sbG93aW5nIGZpbGVzIGFyZSBtaXNzaW5nYCk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZiBvZiBtaXNzaW5nRGlycykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCAgJHtmfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb25zaWRlciBmaXggdGhlIHByb2JsZW0gb3IgcmVtb3ZlIHRoZSBkaXJlY3RvcnlgKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RvIGF2b2lkIHRoaXMgd2FybmluZywgc2V0IGZpZWxkIFxcJ3NraXBDaGVja1xcJyBpbiBjb2Nvcy12ZXJzaW9uLmpzb24gdG8gdHJ1ZS4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIC0gRW5zdXJlIHRoZSBlbmdpbmUgdmVyc2lvbiB1c2VkIHRvIGdlbmVyZXRlICduYXRpdmUvJyBmb2xkZXIgaXMgY29tcGF0aWJsZVxyXG4gICAgICogICB3aXRoIHRoZSBjdXJyZW50IGVuZ2luZSB2ZXJzaW9uLlxyXG4gICAgICogLSBDaGVjayBpZiBhbnkgZmlsZSB1bmRlciB0aGUgJ25hdGl2ZS8nIGZvbGRlciBpcyByZW1vdmVkLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgdmFsaWRhdGVOYXRpdmVEaXIoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVUZW1wbGF0ZVZlcnNpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNraXBWZXJzaW9uQ2hlY2sgJiYgIXRoaXMudmFsaWRhdGVUZW1wbGF0ZUNvbnNpc3RlbmN5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRmFpbGVkIHRvIHZhbGlkYXRlIFwibmF0aXZlXCIgZGlyZWN0b3J5YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHZhbGlkYXRlIG5hdGl2ZSBkaXJlY3RvcnlgKTtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdyaXRlIGNvY29zLXZlcnNpb24uanNvbiBpbnRvIG5hdGl2ZS9jb21tb24vY29jb3MtdmVyc2lvbi5qc29uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCB3cml0ZUVuZ2luZVZlcnNpb24oKSB7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMucHJvakVuZ2luZVZlcnNpb25QYXRoKSkge1xyXG4gICAgICAgICAgICBmcy53cml0ZUpTT04odGhpcy5wcm9qRW5naW5lVmVyc2lvblBhdGgsIHtcclxuICAgICAgICAgICAgICAgIHZlcnNpb246IHRoaXMudHJ5R2V0RW5naW5lVmVyc2lvbigpLFxyXG4gICAgICAgICAgICAgICAgc2tpcENoZWNrOiBmYWxzZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhc3luYyBjb3B5UGxhdGZvcm1UZW1wbGF0ZSgpIHtcclxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5wYXRocy5wbGF0Zm9ybVRlbXBsYXRlRGlySW5QcmopKSB7XHJcbiAgICAgICAgICAgIC8vIOaLt+i0nSB0ZW1wbGF0ZXMv5bmz5Y+wLyDmlofku7bliLAgXCJuYXRpdmVcIiDnm67lvZVcclxuICAgICAgICAgICAgYXdhaXQgZnMuY29weShwcy5qb2luKHRoaXMucGF0aHMubmF0aXZlVGVtcGxhdGVEaXJJbkNvY29zLCB0aGlzLnBhcmFtcy5wbGF0Zm9ybSksIHRoaXMucGF0aHMucGxhdGZvcm1UZW1wbGF0ZURpckluUHJqLCB7IG92ZXJ3cml0ZTogZmFsc2UgfSk7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVFbmdpbmVWZXJzaW9uKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZU5hdGl2ZURpcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgcHJvamVjdE5hbWVBU0NJSSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAvXlswLTlhLXpBLVpfLV0rJC8udGVzdCh0aGlzLnBhcmFtcy5wcm9qZWN0TmFtZSkgPyB0aGlzLnBhcmFtcy5wcm9qZWN0TmFtZSA6ICdDb2Nvc0dhbWUnO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRFeGVjdXRhYmxlTmFtZU9yRGVmYXVsdCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGVuID0gdGhpcy5wYXJhbXMuZXhlY3V0YWJsZU5hbWU7XHJcbiAgICAgICAgcmV0dXJuIGVuID8gZW4gOiB0aGlzLnByb2plY3ROYW1lQVNDSUkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYXN5bmMgZXhlY3V0ZVRlbXBsYXRlVGFzayh0YXNrczogQ29jb3NQcm9qZWN0VGFza3MpIHtcclxuICAgICAgICBpZiAodGFza3MuYXBwZW5kRmlsZSkge1xyXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0YXNrcy5hcHBlbmRGaWxlLm1hcCgodGFzaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdCA9IGNjaGVscGVyLnJlcGxhY2VFbnZWYXJpYWJsZXModGFzay50byk7XHJcbiAgICAgICAgICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKHBzLmRpcm5hbWUoZGVzdCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZzLmNvcHkocHMuam9pbihQYXRocy5uYXRpdmVSb290LCB0YXNrLmZyb20pLCBkZXN0KTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGFza3MuYXBwZW5kRmlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlcGxhY2VGaWxlc0RlbGF5OiB7IFtrZXk6IHN0cmluZ106IHsgcmVnOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyB9W10gfSA9IHt9O1xyXG5cclxuICAgICAgICBpZiAodGFza3MucHJvamVjdFJlcGxhY2VQcm9qZWN0TmFtZSkge1xyXG4gICAgICAgICAgICBjb25zdCBjbWQgPSB0YXNrcy5wcm9qZWN0UmVwbGFjZVByb2plY3ROYW1lO1xyXG5cclxuICAgICAgICAgICAgY21kLmZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZwID0gY2NoZWxwZXIuam9pbih0aGlzLnBhdGhzLmJ1aWxkRGlyLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgIHJlcGxhY2VGaWxlc0RlbGF5W2ZwXSA9IHJlcGxhY2VGaWxlc0RlbGF5W2ZwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIHJlcGxhY2VGaWxlc0RlbGF5W2ZwXS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICByZWc6IGNtZC5zcmNQcm9qZWN0TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB0aGlzLnBhcmFtcy5wcm9qZWN0TmFtZSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZGVsZXRlIHRhc2tzLnByb2plY3RSZXBsYWNlUHJvamVjdE5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGFza3MucHJvamVjdFJlcGxhY2VQcm9qZWN0TmFtZUFTQ0lJKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNtZCA9IHRhc2tzLnByb2plY3RSZXBsYWNlUHJvamVjdE5hbWVBU0NJSTtcclxuICAgICAgICAgICAgaWYgKGNtZC5zcmNQcm9qZWN0TmFtZSAhPT0gdGhpcy5wcm9qZWN0TmFtZUFTQ0lJKCkpIHtcclxuICAgICAgICAgICAgICAgIGNtZC5maWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnAgPSBjY2hlbHBlci5qb2luKHRoaXMucGF0aHMuYnVpbGREaXIsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VGaWxlc0RlbGF5W2ZwXSA9IHJlcGxhY2VGaWxlc0RlbGF5W2ZwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlRmlsZXNEZWxheVtmcF0ucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZzogY21kLnNyY1Byb2plY3ROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB0aGlzLnByb2plY3ROYW1lQVNDSUkoKSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0YXNrcy5wcm9qZWN0UmVwbGFjZVByb2plY3ROYW1lQVNDSUk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGFza3MucHJvamVjdFJlcGxhY2VQYWNrYWdlTmFtZSkge1xyXG4gICAgICAgICAgICBjb25zdCBjbWQgPSB0YXNrcy5wcm9qZWN0UmVwbGFjZVBhY2thZ2VOYW1lO1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY21kLnNyY1BhY2thZ2VOYW1lLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKTtcclxuICAgICAgICAgICAgY21kLmZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZwID0gY2NoZWxwZXIuam9pbih0aGlzLnBhdGhzLmJ1aWxkRGlyLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgIHJlcGxhY2VGaWxlc0RlbGF5W2ZwXSA9IHJlcGxhY2VGaWxlc0RlbGF5W2ZwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIHJlcGxhY2VGaWxlc0RlbGF5W2ZwXS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICByZWc6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogKHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zIGFzIGFueSkucGFja2FnZU5hbWUhLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBkZWxldGUgdGFza3MucHJvamVjdFJlcGxhY2VQYWNrYWdlTmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgZnVsbHBhdGggaW4gcmVwbGFjZUZpbGVzRGVsYXkpIHtcclxuICAgICAgICAgICAgY29uc3QgY2ZnID0gcmVwbGFjZUZpbGVzRGVsYXlbZnVsbHBhdGhdO1xyXG4gICAgICAgICAgICBhd2FpdCBjY2hlbHBlci5yZXBsYWNlSW5GaWxlKGNmZy5tYXAoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IHJlZzogeC5yZWcsIHRleHQ6IHguY29udGVudCB9O1xyXG4gICAgICAgICAgICB9KSwgZnVsbHBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRhc2tzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZiBpbiB0YXNrcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY29tbWFuZCBcIiR7Zn1cIiBpcyBub3QgcGFyc2VkIGluICR7UGFja2FnZU5ld0NvbmZpZ31gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYXN5bmMgZ2VuZXJhdGVDTWFrZUNvbmZpZygpIHtcclxuICAgICAgICAvLyDmt7vliqDkuIDkupsgY21ha2Ug6YWN572u5YiwIGNmZy5jbWFrZVxyXG4gICAgICAgIGNvbnN0IGZpbGUgPSBwcy5qb2luKHRoaXMucGF0aHMubmF0aXZlUHJqRGlyLCAnY2ZnLmNtYWtlJyk7XHJcbiAgICAgICAgbGV0IGNvbnRlbnQgPSAnJztcclxuICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLnBhcmFtcy5jTWFrZUNvbmZpZztcclxuICAgICAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgYm9vbGVhbiB0byBDTWFrZSBvcHRpb24uXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnW2tleV0gPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnW2tleV0gPSBgc2V0KCR7a2V5fSAke2NvbmZpZ1trZXldID8gJ09OJyA6ICdPRkYnfSlgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgT2JqZWN0LmtleXMoY29uZmlnKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ1trZXldICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY01ha2VDb25maWcuJHtrZXl9IGlzIG5vdCBhIHN0cmluZywgXCIke2NvbmZpZ1trZXldfVwiYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50ICs9IGNvbmZpZ1trZXldICsgJ1xcbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBnZW5lcmF0ZUNNYWtlQ29uZmlnLCAke0pTT04uc3RyaW5naWZ5KGNvbmZpZyl9YCk7XHJcbiAgICAgICAgYXdhaXQgZnMub3V0cHV0RmlsZShmaWxlLCBjb250ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYXBwZW5kQ21ha2VDb21tb25BcmdzKGFyZ3M6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgYXJncy5wdXNoKGAtRFJFU19ESVI9XCIke2NjaGVscGVyLmZpeFBhdGgodGhpcy5wYXRocy5idWlsZERpcil9XCJgKTtcclxuICAgICAgICBhcmdzLnB1c2goYC1EQVBQX05BTUU9XCIke3RoaXMucGFyYW1zLnByb2plY3ROYW1lfVwiYCk7XHJcbiAgICAgICAgYXJncy5wdXNoKGAtRExBVU5DSF9UWVBFPVwiJHt0aGlzLmJ1aWxkVHlwZX1cImApO1xyXG4gICAgICAgIGlmICgodGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMgYXMgYW55KS5za2lwVXBkYXRlWGNvZGVQcm9qZWN0KSB7XHJcbiAgICAgICAgICAgIGFyZ3MucHVzaChgLURDTUFLRV9TVVBQUkVTU19SRUdFTkVSQVRJT049T05gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yqg5a+G6ISa5pys77yM5Yqg5a+G5ZCO77yM5Lya5L+u5pS5IGNtYWtlIOWPguaVsO+8jOWboOiAjOmcgOimgeWGjeasoeaJp+ihjCBjbWFrZSDphY3nva7mlofku7bnmoTnlJ/miJBcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYXN5bmMgZW5jcnlwdFNjcmlwdHMoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBhcmFtcy5lbmNyeXB0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnBhcmFtcy54eHRlYUtleSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VuY3J5cHRpb24gS2V5IGNhbiBub3QgYmUgZW1wdHknKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnU3RhcnQgZW5jcnlwdGUgc2NyaXB0cy4uLicpO1xyXG4gICAgICAgIC8vIG5hdGl2ZSDliqDlr4bmraXpqqQoMS8zKe+8mueUn+aIkOWujOW3peeoi+aJgOacieaWh+S7tua3u+WKoCBjbWFrZSDphY3nva5cclxuICAgICAgICBpZiAodGhpcy5wYXJhbXMuZW5jcnlwdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmNNYWtlQ29uZmlnLlhYVEVBS0VZID0gYHNldChYWFRFQUtFWSBcIiR7dGhpcy5wYXJhbXMueHh0ZWFLZXl9XCIpYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYmFja3VwUGF0aCA9IHBzLmpvaW4odGhpcy5wYXRocy5idWlsZERpciwgJ3NjcmlwdC1iYWNrdXAnKTtcclxuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKGJhY2t1cFBhdGgpO1xyXG4gICAgICAgIGZzLmVtcHR5RGlyU3luYyhiYWNrdXBQYXRoKTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxsQnVuZGxlQ29uZmlnczogc3RyaW5nW10gPSBhd2FpdCBnbG9iYnkoW1xyXG4gICAgICAgICAgICBwcy5qb2luKHRoaXMucGF0aHMuYnVpbGRBc3NldHNEaXIsICdhc3NldHMvKi9jYy5jb25maWcqLmpzb24nKSxcclxuICAgICAgICAgICAgcHMuam9pbih0aGlzLnBhdGhzLmJ1aWxkQXNzZXRzRGlyLCAncmVtb3RlLyovY2MuY29uZmlnKi5qc29uJyksXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgZm9yIChjb25zdCBjb25maWdQYXRoIG9mIGFsbEJ1bmRsZUNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gYXdhaXQgZnMucmVhZEpTT04oY29uZmlnUGF0aCk7XHJcblxyXG4gICAgICAgICAgICAvLyBuYXRpdmUg5Yqg5a+G5q2l6aqkKDIvMynvvJrliqDlr4bnmoTmoIflv5fkvY3vvIzpnIDopoHlhpnlhaXliLAgYnVuZGxlIOeahCBjb25maWcuanNvbiDlhoXov5DooYzml7bpnIDopoFcclxuICAgICAgICAgICAgY29uc3QgdmVyc2lvbiA9IGNvbmZpZ1BhdGgubWF0Y2goL1xcL2NjLmNvbmZpZyguKikuanNvbi8pIVsxXTtcclxuICAgICAgICAgICAgY29uc3Qgc2NyaXB0RGVzdCA9IHBzLmpvaW4ocHMuZGlybmFtZShjb25maWdQYXRoKSwgYGluZGV4JHt2ZXJzaW9ufS5qc2ApO1xyXG4gICAgICAgICAgICBsZXQgY29udGVudDogYW55ID0gZnMucmVhZEZpbGVTeW5jKHNjcmlwdERlc3QsICd1dGY4Jyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5jb21wcmVzc1ppcCkge1xyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IGd6aXBTeW5jKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IHh4dGVhLmVuY3J5cHQoY29udGVudCwgeHh0ZWEudG9CeXRlcyh0aGlzLnBhcmFtcy54eHRlYUtleSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IHh4dGVhLmVuY3J5cHQoeHh0ZWEudG9CeXRlcyhjb250ZW50KSwgeHh0ZWEudG9CeXRlcyh0aGlzLnBhcmFtcy54eHRlYUtleSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1NjcmlwdERlc3QgPSBwcy5qb2luKHBzLmRpcm5hbWUoc2NyaXB0RGVzdCksIHBzLmJhc2VuYW1lKHNjcmlwdERlc3QsIHBzLmV4dG5hbWUoc2NyaXB0RGVzdCkpICsgJy5qc2MnKTtcclxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhuZXdTY3JpcHREZXN0LCBjb250ZW50KTtcclxuXHJcbiAgICAgICAgICAgIGNvbmZpZy5lbmNyeXB0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBmcy53cml0ZUpTT05TeW5jKGNvbmZpZ1BhdGgsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICBmcy5jb3B5U3luYyhzY3JpcHREZXN0LCBwcy5qb2luKGJhY2t1cFBhdGgsIHBzLnJlbGF0aXZlKHRoaXMucGF0aHMuYnVpbGRBc3NldHNEaXIsIHNjcmlwdERlc3QpKSk7XHJcbiAgICAgICAgICAgIGZzLnJlbW92ZVN5bmMoc2NyaXB0RGVzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMuZ2VuZXJhdGVDTWFrZUNvbmZpZygpO1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ0VuY3J5cHQgc2NyaXB0cyBzdWNjZXNzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDop6PmnpDjgIHmiafooYwgY29jb3MtdGVtcGxhdGUuanNvbiDmqKHmnb/ku7vliqFcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGFzeW5jIGV4ZWN1dGVDb2Nvc1RlbXBsYXRlVGFzaygpIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZVRhc2tNYXA6IFJlY29yZDxzdHJpbmcsIENvY29zUHJvamVjdFRhc2tzPiA9IGF3YWl0IGZzLnJlYWRKU09OKHBzLmpvaW4odGhpcy5wYXRocy5uYXRpdmVUZW1wbGF0ZURpckluQ29jb3MsIFBhY2thZ2VOZXdDb25maWcpKTtcclxuICAgICAgICBmb3IgKGNvbnN0IHRlbXBsYXRlVGFzayBvZiBPYmplY3QudmFsdWVzKHRlbXBsYXRlVGFza01hcCkpIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5leGVjdXRlVGVtcGxhdGVUYXNrKHRlbXBsYXRlVGFzayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFic3RyYWN0IGNyZWF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gICAgYWJzdHJhY3QgZ2V0RXhlY3V0YWJsZUZpbGUoKTogUHJvbWlzZTxzdHJpbmc+O1xyXG4gICAgZ2VuZXJhdGU/KCk6IFByb21pc2U8Ym9vbGVhbj47XHJcbiAgICBtYWtlPygpOiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gICAgcnVuPygpOiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gICAgc3RhdGljIG9wZW5XaXRoSURFPyhwcm9qUGF0aDogc3RyaW5nLCBJREU/OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+O1xyXG59XHJcblxyXG4vLyBjb2Nvcy5jb21waWxlLmpzb24gXHJcbmV4cG9ydCBjbGFzcyBDb2Nvc1BhcmFtczxUPiB7XHJcbiAgICBwbGF0Zm9ybVBhcmFtczogVDtcclxuICAgIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBwcm9qZWN0TmFtZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGNtYWtlUGF0aDogc3RyaW5nO1xyXG4gICAgcHVibGljIHBsYXRmb3JtOiBJbnRlcm5hbE5hdGl2ZVBsYXRmb3JtO1xyXG4gICAgcHVibGljIHBsYXRmb3JtTmFtZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGV4ZWN1dGFibGVOYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmdpbmUgcm9vdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZW5naW5lUGF0aDogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiBuYXRpdmUgZW5naW5lIHJvb3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIG5hdGl2ZUVuZ2luZVBhdGg6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICogcHJvamVjdCBwYXRoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwcm9qRGlyOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIGJ1aWxkL1twbGF0Zm9ybV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGJ1aWxkRGlyOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIEB6aCDmnoTlu7rotYTmupDot6/lvoRcclxuICAgICAqIEBlbiAvYnVpbGQvW3BsYXRmb3JtXS9kYXRhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBidWlsZEFzc2V0c0Rpcjogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiBAemgg5piv5ZCm5Yqg5a+G6ISa5pysXHJcbiAgICAgKiBAZW4gaXMgZW5jcnlwdGVkXHJcbiAgICAgKi9cclxuICAgIGVuY3J5cHRlZD86IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIEB6aCDmmK/lkKbljovnvKnohJrmnKxcclxuICAgICAqIEBlbiBpcyBjb21wcmVzcyBzY3JpcHRcclxuICAgICAqL1xyXG4gICAgY29tcHJlc3NaaXA/OiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiBAemgg5Yqg5a+G5a+G6ZKlXHJcbiAgICAgKiBAZW4gZW5jcnlwdCBLZXlcclxuICAgICAqL1xyXG4gICAgeHh0ZWFLZXk/OiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIEB6aCDmmK/lkKbkuLrmqKHmi5/lmahcclxuICAgICAqIEBlbiBpcyBzaW11bGF0b3JcclxuICAgICAqL1xyXG4gICAgc2ltdWxhdG9yPzogYm9vbGVhbjtcclxuXHJcblxyXG4gICAgcHVibGljIGNNYWtlQ29uZmlnOiBJQ01ha2VDb25maWcgPSB7XHJcbiAgICAgICAgQ0NfVVNFX0dMRVMzOiBmYWxzZSxcclxuICAgICAgICBDQ19VU0VfR0xFUzI6IHRydWUsXHJcbiAgICAgICAgVVNFX1NFUlZFUl9NT0RFOiAnc2V0KFVTRV9TRVJWRVJfTU9ERSBPRkYpJyxcclxuICAgICAgICBORVRfTU9ERTogJ3NldChORVRfTU9ERSAwKScsXHJcbiAgICAgICAgWFhURUFLRVk6ICcnLFxyXG4gICAgICAgIENDX0VOQUJMRV9TV0FQUFk6IGZhbHNlLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXM6IENvY29zUGFyYW1zPFQ+KSB7XHJcbiAgICAgICAgdGhpcy5idWlsZEFzc2V0c0RpciA9IHBhcmFtcy5idWlsZEFzc2V0c0RpcjtcclxuICAgICAgICB0aGlzLnByb2plY3ROYW1lID0gcGFyYW1zLnByb2plY3ROYW1lO1xyXG4gICAgICAgIHRoaXMuZGVidWcgPSBwYXJhbXMuZGVidWc7XHJcbiAgICAgICAgdGhpcy5jbWFrZVBhdGggPSBwYXJhbXMuY21ha2VQYXRoO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm0gPSBwYXJhbXMucGxhdGZvcm07XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybU5hbWUgPSBwYXJhbXMucGxhdGZvcm1OYW1lO1xyXG4gICAgICAgIHRoaXMuZW5naW5lUGF0aCA9IHBhcmFtcy5lbmdpbmVQYXRoO1xyXG4gICAgICAgIHRoaXMubmF0aXZlRW5naW5lUGF0aCA9IHBhcmFtcy5uYXRpdmVFbmdpbmVQYXRoO1xyXG4gICAgICAgIHRoaXMucHJvakRpciA9IHBhcmFtcy5wcm9qRGlyO1xyXG4gICAgICAgIHRoaXMuYnVpbGREaXIgPSBwYXJhbXMuYnVpbGREaXI7XHJcbiAgICAgICAgdGhpcy54eHRlYUtleSA9IHBhcmFtcy54eHRlYUtleTtcclxuICAgICAgICB0aGlzLmVuY3J5cHRlZCA9IHBhcmFtcy5lbmNyeXB0ZWQ7XHJcbiAgICAgICAgdGhpcy5jb21wcmVzc1ppcCA9IHBhcmFtcy5jb21wcmVzc1ppcDtcclxuICAgICAgICB0aGlzLmV4ZWN1dGFibGVOYW1lID0gcGFyYW1zLmV4ZWN1dGFibGVOYW1lO1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5jTWFrZUNvbmZpZywgcGFyYW1zLmNNYWtlQ29uZmlnKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3JtUGFyYW1zID0gcGFyYW1zLnBsYXRmb3JtUGFyYW1zO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==