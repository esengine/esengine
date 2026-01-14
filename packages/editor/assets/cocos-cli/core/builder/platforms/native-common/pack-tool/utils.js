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
exports.Paths = exports.toolHelper = exports.cchelper = exports.EXT_LIST = void 0;
const ps = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const iconv = require('iconv-lite');
// 因为加密后有多个后缀
exports.EXT_LIST = ['.js', '.ccc', '.ccd', '.jsg', '.jsc'];
class cchelper {
    static replaceEnvVariables(str) {
        return str.replace(/\$\{([^}]*)\}/g, (_, n) => process.env[n] === undefined ? _ : process.env[n])
            .replace(/(~)/g, (_, n) => process.env.HOME);
    }
    static fixPath(p) {
        p = this.replaceEnvVariables(p);
        if (os.platform() === 'win32') {
            // 目前未限制空格，无需报错
            // if (p.indexOf(' ') >= 0) {
            //     console.error(`space found in path "${p}"`);
            // }
            return p.replace(/\\/g, '/').replace(/\/+/, '/');
        }
        return p;
    }
    static async delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                resolve();
            }, ms);
        });
    }
    static join(p1, ...p2) {
        const l = p2.map((x) => this.replaceEnvVariables(x));
        if (ps.isAbsolute(l[l.length - 1])) {
            return l[l.length - 1];
        }
        return ps.join(this.replaceEnvVariables(p1), ...p2);
    }
    static copyFileSync(srcRoot, srcFile, dstRoot, dstFile) {
        // console.log(`copyFileSync args: ${JSON.stringify(arguments)}`);
        srcRoot = this.replaceEnvVariables(srcRoot);
        srcFile = this.replaceEnvVariables(srcFile);
        dstRoot = this.replaceEnvVariables(dstRoot);
        dstFile = this.replaceEnvVariables(dstFile);
        const src = ps.isAbsolute(srcFile) ? srcFile : ps.join(srcRoot, srcFile);
        const dst = ps.isAbsolute(dstFile) ? dstFile : ps.join(dstRoot, dstFile);
        // console.error(`copyFileSync ${src} -> ${dst}`);
        this.makeDirectoryRecursive(ps.dirname(dst));
        fs.copyFileSync(src, dst);
    }
    static async copyFileAsync(src, dst) {
        // console.log(`[async] copyFile ${src} -> ${dst}`);
        this.makeDirectoryRecursive(ps.parse(dst).dir);
        await fs.copyFile(src, dst);
    }
    static async copyRecursiveAsync(srcDir, dst) {
        srcDir = this.replaceEnvVariables(srcDir);
        dst = this.replaceEnvVariables(dst);
        const tasks = [];
        const srcStat = await fs.stat(srcDir);
        if (!srcStat) {
            console.error(`failed to stat ${srcDir}`);
            return;
        }
        if (srcStat.isDirectory()) {
            this.makeDirectoryRecursive(dst);
            const files = await fs.readdir(srcDir);
            for (const f of files) {
                if (f === '.' || f === '..') {
                    continue;
                }
                const fp = ps.join(srcDir, f);
                const tsk = this.copyRecursiveAsync(fp, ps.join(dst, f));
                tasks.push(tsk);
            }
            await Promise.all(tasks);
        }
        else if (srcStat.isFile()) {
            try {
                await this.copyFileAsync(srcDir, dst);
            }
            catch (e) {
                await this.delay(10);
                // console.log(`error: retry copying ${srcDir} -> to ${dst} ... ${e}`);
                await this.copyFileAsync(srcDir, dst);
            }
        }
    }
    static prepareDirsForFiles(srcRoot, files, dstDir) {
        const tree = {};
        for (const f of files) {
            const parts = f.split('/');
            let p = tree;
            for (const i of parts) {
                if (i in p) {
                    p = p[i];
                }
                else {
                    p = p[i] = {};
                }
            }
        }
        const mkdirs = (srcDir, attrs, dstDir) => {
            const srcStat = fs.statSync(srcDir);
            if (!srcStat.isDirectory()) {
                return;
            }
            if (!fs.existsSync(dstDir)) {
                // console.log(`prepereDir ${dstDir}`);
                fs.mkdirSync(dstDir);
            }
            for (const i in attrs) {
                if (i !== '.' && i !== '..') {
                    mkdirs(ps.join(srcDir, i), attrs[i], ps.join(dstDir, i));
                }
            }
        };
        mkdirs(srcRoot, tree, dstDir);
    }
    static parallelCopyFiles(par, srcRoot, files, dstDir) {
        let runningTasks = 0;
        dstDir = this.replaceEnvVariables(dstDir);
        cchelper.prepareDirsForFiles(srcRoot, files, dstDir);
        return new Promise((resolve, reject) => {
            const copyAsync = async (src, dst) => {
                runningTasks += 1;
                await this.copyRecursiveAsync(src, dst);
                runningTasks -= 1;
                scheduleCopy();
            };
            const scheduleCopy = () => {
                if (files.length > 0 && runningTasks < par) {
                    const f = files.shift();
                    const srcFile = ps.join(srcRoot, f);
                    if (fs.existsSync(srcFile)) {
                        copyAsync(srcFile, ps.join(dstDir, f));
                    }
                    else {
                        console.log(`warning: copyFile: ${srcFile} not exists!`);
                    }
                }
                if (files.length === 0 && runningTasks === 0) {
                    resolve();
                }
            };
            for (let i = 0; i < par; i++) {
                scheduleCopy();
            }
        });
    }
    static makeDirectoryRecursive(dir) {
        if (dir.length === 0) {
            return;
        }
        const dirs = [];
        let p = dir;
        while (!fs.existsSync(p)) {
            dirs.push(p);
            p = ps.join(p, '..');
        }
        while (dirs.length > 0) {
            fs.mkdirSync(dirs[dirs.length - 1]);
            dirs.length = dirs.length - 1;
        }
    }
    static async removeDirectoryRecursive(dir) {
        const stat = await fs.stat(dir);
        if (stat.isFile()) {
            await fs.unlink(dir);
        }
        else if (stat.isDirectory()) {
            const list = await fs.readdir(dir);
            const tasks = [];
            for (const f of list) {
                if (f === '.' || f === '..') {
                    continue;
                }
                const fp = ps.join(dir, f);
                tasks.push(this.removeDirectoryRecursive(fp));
            }
            await Promise.all(tasks);
            await fs.rmdir(dir);
        }
    }
    static async copyFilesWithConfig(cfg, srcRoot, dstRoot) {
        if (!fs.existsSync(srcRoot)) {
            console.error(`copy file srcRoot ${srcRoot} is not exists!`);
            return;
        }
        srcRoot = this.replaceEnvVariables(srcRoot);
        dstRoot = this.replaceEnvVariables(dstRoot);
        let from = this.replaceEnvVariables(cfg.from);
        let to = this.replaceEnvVariables(cfg.to);
        if (ps.isAbsolute(from)) {
            srcRoot = from;
            from = '.';
        }
        if (ps.isAbsolute(to)) {
            dstRoot = to;
            to = '.';
        }
        // console.log(`copy ${JSON.stringify(cfg)}, ${from} -> ${to} from ${srcRoot} -> ${dstRoot}`);
        const buildPrefixTree = (list0) => {
            const tree = {};
            const list = list0.map((x) => Array.from(x));
            while (list.length > 0) {
                const t = list.shift();
                let p = tree;
                while (t.length > 0) {
                    const c = t.shift();
                    if (!(c in p)) {
                        p[c] = {};
                    }
                    p = p[c];
                }
            }
            return tree;
        };
        const matchPrefixTree = (str, tree) => {
            if (tree === null) {
                return false;
            }
            const arr = Array.from(str);
            let i = 0;
            let p = tree;
            while (arr[i] in p) {
                p = p[arr[i]];
                i++;
            }
            return i === arr.length && Object.keys(p).length === 0;
        };
        const includePrefix = cfg.include ? buildPrefixTree(cfg.include) : null;
        const excludePrefix = cfg.exclude ? buildPrefixTree(cfg.exclude) : null;
        const cpRAsync = async (srcRoot, srcDir, dstRoot) => {
            const currFullDir = ps.join(srcRoot, srcDir);
            const stat = await fs.stat(currFullDir);
            if (stat.isDirectory()) {
                const files = await fs.readdir(currFullDir);
                const subCopies = [];
                for (const f of files) {
                    if (f === '.' || f === '..') {
                        continue;
                    }
                    const pathInSrcRoot = ps.join(srcDir, f);
                    if (excludePrefix && matchPrefixTree(pathInSrcRoot, excludePrefix)) {
                        if (includePrefix && matchPrefixTree(pathInSrcRoot, includePrefix)) {
                            // include
                        }
                        else {
                            console.log(` - skip copy ${srcRoot} ${pathInSrcRoot} to ${dstRoot}`);
                            continue;
                        }
                    }
                    subCopies.push(cpRAsync(srcRoot, pathInSrcRoot, dstRoot));
                }
                await Promise.all(subCopies);
            }
            else if (stat.isFile()) {
                // let dstFileAbs = ps.isAbsolute(srcDir) ? srcDir : ps.join(dstRoot, srcDir);
                await this.copyFileAsync(currFullDir, ps.join(dstRoot, srcDir));
            }
        };
        const copyFrom = this.replaceEnvVariables(ps.normalize(ps.join(srcRoot, from)));
        const copyTo = this.replaceEnvVariables(ps.normalize(ps.join(dstRoot, to)));
        await cpRAsync(srcRoot, from, copyTo);
    }
    static async replaceInFile(patterns, filepath) {
        filepath = this.replaceEnvVariables(filepath);
        if (!fs.existsSync(filepath)) {
            console.log(`While replace template content, file ${filepath}`);
            return;
        }
        // console.log(`replace ${filepath} with ${JSON.stringify(patterns)}`);
        const lines = (await fs.readFile(filepath)).toString('utf8').split('\n');
        const newContent = lines.map((l) => {
            patterns.forEach((p) => {
                l = l.replace(new RegExp(p.reg), this.replaceEnvVariables(p.text));
            });
            return l;
        }).join('\n');
        await fs.writeFile(filepath, newContent);
    }
    static exactValueFromFile(regexp, filename, idx) {
        if (!(fs.existsSync(filename))) {
            console.error(`file ${filename} not exist!`);
            return;
        }
        const lines = fs.readFileSync(filename).toString('utf-8').split('\n');
        for (const l of lines) {
            const r = l.match(regexp);
            if (r) {
                return r[idx];
            }
        }
    }
    static async runCmd(cmd, args, slient, cwd) {
        return new Promise((resolve, reject) => {
            console.log(`[runCmd]: ${cmd} ${args.join(' ')}`);
            const cp = (0, child_process_1.spawn)(cmd, args, {
                shell: true,
                env: process.env,
                cwd: cwd || process.cwd(),
            });
            if (!slient) {
                cp.stdout.on(`data`, (chunk) => {
                    console.log(`[runCmd ${cmd}] ${chunk}`);
                });
                cp.stderr.on(`data`, (chunk) => {
                    console.log(`[runCmd ${cmd} - error] ${chunk}`);
                });
            }
            cp.on('exit', (code, signal) => {
                if (code !== 0 && !slient) {
                    reject(`failed to exec ${cmd} ${args.join(' ')}`);
                }
                else {
                    resolve();
                }
            });
            cp.on('error', (err) => {
                reject(err);
            });
            cp.on('close', (code, signal) => {
                if (code !== 0 && !slient) {
                    reject(`failed to exec ${cmd} ${args.join(' ')}`);
                }
                else {
                    resolve();
                }
            });
        });
    }
    static existsSync(filePath) {
        const extName = ps.extname(filePath);
        const filePathNotExt = ps.basename(filePath, extName);
        filePath = ps.join(ps.dirname(filePath), filePathNotExt);
        return !!exports.EXT_LIST.find((ext) => {
            return fs.existsSync(filePath + ext);
        });
    }
    static checkJavaHome() {
        if (!process.env.JAVA_HOME) {
            console.log('warning: $JAVA_HOME is not set!');
        }
        const javaPath = cchelper.which('java');
        if (!javaPath) {
            console.error(`'java' is not found in PATH`);
        }
        else {
            try {
                const version = (0, child_process_1.execSync)(`"${cchelper.fixPath(javaPath)}" -version`).toString();
                if (/Java\(TM\)/.test(version)) {
                    return true;
                }
                else {
                    console.error(`Oracle JDK is expected.`);
                }
            }
            catch (e) {
                console.error(`Error checking java runtime...`);
                console.error(e);
            }
        }
        return false;
    }
    static accessSync(file, mode) {
        try {
            fs.accessSync(file, mode);
            return true;
        }
        catch (e) { }
        return false;
    }
    static which(executable) {
        // possible executable names
        const execs = [executable];
        const IS_WINDOWS = os.platform() === 'win32';
        if (IS_WINDOWS) {
            execs.push(executable + '.exe');
        }
        // seprate PATH environment variable
        const pathList = IS_WINDOWS ? process.env.PATH?.split(';') : process.env.PATH?.split(':');
        if (!pathList || pathList.length === 0) {
            return null;
        }
        // search for executable in each PATH segment
        for (const dir of pathList) {
            for (const execName of execs) {
                const testFile = ps.join(dir, execName);
                if (fs.existsSync(testFile)) {
                    if (IS_WINDOWS || cchelper.accessSync(testFile, fs.constants.X_OK)) {
                        return testFile;
                    }
                }
            }
        }
        return null;
    }
}
exports.cchelper = cchelper;
exports.toolHelper = {
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
    },
    async runCommand(cmd, args, cb) {
        return new Promise((resolve, reject) => {
            const cp = (0, child_process_1.spawn)(cmd, args);
            const stdErr = [];
            const stdOut = [];
            cp.stderr.on('data', (d) => stdErr.push(d));
            cp.stdout.on('data', (d) => stdOut.push(d));
            cp.on('close', (code, signal) => {
                if (cb) {
                    cb(code, Buffer.concat(stdOut).toString('utf8'), Buffer.concat(stdErr).toString('utf8'));
                }
                resolve(code === 0);
            });
        });
    },
    runCmake(args, workDir) {
        let cmakePath = Paths.cmakePath;
        if (process.platform === 'win32' && cmakePath.indexOf(' ') > -1) {
            cmakePath = `"${cmakePath}"`;
        }
        else {
            cmakePath = cmakePath.replace(/ /g, '\\ ');
        }
        // Delete environment variables start with `npm_`, which may cause compile error on windows
        const newEnv = {};
        Object.assign(newEnv, process.env);
        Object.keys(newEnv).filter(x => x.toLowerCase().startsWith('npm_')).forEach(e => delete newEnv[e]);
        return new Promise((resolve, reject) => {
            console.log(`run ${cmakePath} ${args.join(' ')}`);
            const cp = (0, child_process_1.spawn)(cmakePath, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: newEnv,
                shell: true,
                cwd: workDir,
            });
            cp.stdout.on('data', (data) => {
                const msg = iconv.decode(data, 'gbk').toString();
                if (/warning/i.test(msg)) {
                    console.log(`[cmake-warn] ${msg}`);
                }
                else {
                    console.log(`[cmake] ${msg}`);
                }
            });
            cp.stderr.on('data', (data) => {
                const msg = iconv.decode(data, 'gbk').toString();
                if (/CMake Warning/.test(msg) || /warning/i.test(msg)) {
                    console.log(`[cmake-warn] ${msg}`);
                }
                else {
                    console.error(`[cmake-err] ${msg}`);
                }
            });
            cp.on('close', (code, sig) => {
                if (code !== 0) {
                    reject(new Error(`run cmake failed "cmake ${args.join(' ')}", code: ${code}, signal: ${sig}`));
                    return;
                }
                resolve();
            });
        });
    },
    runXcodeBuild(args) {
        // only runs on mac os, run with `xcodebuild` directly
        // Delete environment variables start with `npm_`, which may cause compile error on windows
        const newEnv = {};
        Object.assign(newEnv, process.env);
        Object.keys(newEnv).filter(x => x.toLowerCase().startsWith('npm_')).forEach(e => delete newEnv[e]);
        return new Promise((resolve, reject) => {
            console.log(`run xcodebuild with ${args.join(' ')}`);
            const xcodebuildPath = cchelper.which('xcodebuild');
            if (!xcodebuildPath) {
                console.error(`'xcodebuild' is not in the path`);
            }
            else {
                console.log(`run xcodebuild with ${args.join(' ')}`);
                const cp = (0, child_process_1.spawn)(xcodebuildPath, args, {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    env: newEnv,
                    shell: true,
                });
                cp.stdout.on('data', (data) => {
                    console.log(`[xcodebuild] ${iconv.decode(data, 'gbk').toString()}`);
                });
                cp.stderr.on('data', (data) => {
                    console.error(`[xcodebuild] ${iconv.decode(data, 'gbk').toString()}`);
                });
                cp.on('close', (code, sig) => {
                    if (code !== 0) {
                        reject(new Error(`run xcodebuild failed "xcodebuild ${args.join(' ')}", code: ${code}, signal: ${sig}`));
                        return;
                    }
                    resolve();
                });
            }
        });
    }
};
class Paths {
    static enginePath; // [engine]
    static nativeRoot; // [engine-native]
    static projectDir; // [project]
    static cmakePath;
    /**
     * ios/mac/windows/android
     */
    platform;
    /**
     * ios/mac/win64/win32/android
     */
    platformTemplateDirName;
    /**
     * build/[platform]
     */
    buildDir;
    /**
     * build/[platform]/data
     */
    buildAssetsDir;
    constructor(params) {
        Paths.enginePath = params.enginePath;
        Paths.projectDir = params.projDir;
        Paths.nativeRoot = params.nativeEnginePath;
        Paths.cmakePath = params.cmakePath;
        this.platform = params.platform;
        this.buildDir = params.buildDir;
        this.buildAssetsDir = params.buildAssetsDir;
        if (params.platform === 'windows') {
            this.platformTemplateDirName = params.platformParams.targetPlatform === 'win32' ? 'win32' : 'win64';
        }
        else {
            this.platformTemplateDirName = params.platformName ? params.platformName : this.platform;
        }
    }
    /**
     * [project]/native/engine/common
     */
    get commonDirInPrj() {
        return ps.join(Paths.projectDir, 'native', 'engine', 'common');
    }
    /**
     * [engine]/templates/common
     */
    get commonDirInCocos() {
        return ps.join(this.nativeTemplateDirInCocos, 'common');
    }
    /**
     * [project]/native/engine
     */
    get nativeTemplateDirInPrj() {
        return ps.join(Paths.projectDir, 'native', 'engine');
    }
    /**
     * [engine]/templates
     */
    get nativeTemplateDirInCocos() {
        return ps.join(Paths.enginePath, 'templates');
    }
    /**
     * [project]/native/engine/[platformTemplateDirName]
     */
    get platformTemplateDirInPrj() {
        return ps.join(this.nativeTemplateDirInPrj, this.platformTemplateDirName);
    }
    /**
     * [engine]/templates/[platformTemplateDirName]
     */
    get platformTemplateDirInCocos() {
        return ps.join(this.nativeTemplateDirInCocos, this.platform);
    }
    /**
     * build/[platform]/proj
     */
    get nativePrjDir() {
        return ps.join(this.buildDir, 'proj');
    }
}
exports.Paths = Paths;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy9uYXRpdmUtY29tbW9uL3BhY2stdG9vbC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBMkI7QUFDM0IsNkNBQStCO0FBQy9CLGlEQUFnRDtBQUNoRCx1Q0FBeUI7QUFFekIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBR3BDLGFBQWE7QUFDQSxRQUFBLFFBQVEsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUVoRSxNQUFhLFFBQVE7SUFFakIsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEdBQVc7UUFDbEMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUUsQ0FBQzthQUM3RixPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBR0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFTO1FBQ3BCLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDNUIsZUFBZTtZQUNmLDZCQUE2QjtZQUM3QixtREFBbUQ7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Q0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUksMEJBQTBCO1FBQzFCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUksWUFBWTtRQUNaLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDSjtBQXZGRCxzQkF1RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwcyBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBleGVjU3luYywgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xyXG5pbXBvcnQgdHlwZSB7IENvY29zUGFyYW1zIH0gZnJvbSAnLi9iYXNlL2RlZmF1bHQnO1xyXG5jb25zdCBpY29udiA9IHJlcXVpcmUoJ2ljb252LWxpdGUnKTtcclxuXHJcblxyXG4vLyDlm6DkuLrliqDlr4blkI7mnInlpJrkuKrlkI7nvIBcclxuZXhwb3J0IGNvbnN0IEVYVF9MSVNUID0gWycuanMnLCAnLmNjYycsICcuY2NkJywgJy5qc2cnLCAnLmpzYyddO1xyXG5cclxuZXhwb3J0IGNsYXNzIGNjaGVscGVyIHtcclxuXHJcbiAgICBzdGF0aWMgcmVwbGFjZUVudlZhcmlhYmxlcyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXCRcXHsoW159XSopXFx9L2csIChfLCBuKSA9PiBwcm9jZXNzLmVudltuXSA9PT0gdW5kZWZpbmVkID8gXyA6IHByb2Nlc3MuZW52W25dISlcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyh+KS9nLCAoXywgbikgPT4gcHJvY2Vzcy5lbnYuSE9NRSEpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzdGF0aWMgZml4UGF0aChwOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHAgPSB0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMocCk7XHJcbiAgICAgICAgaWYgKG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicpIHtcclxuICAgICAgICAgICAgLy8g55uu5YmN5pyq6ZmQ5Yi256m65qC877yM5peg6ZyA5oql6ZSZXHJcbiAgICAgICAgICAgIC8vIGlmIChwLmluZGV4T2YoJyAnKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmVycm9yKGBzcGFjZSBmb3VuZCBpbiBwYXRoIFwiJHtwfVwiYCk7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgcmV0dXJuIHAucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoL1xcLysvLCAnLycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZGVsYXkobXM6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9LCBtcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGpvaW4ocDE6IHN0cmluZywgLi4ucDI6IHN0cmluZ1tdKTogc3RyaW5nIHtcclxuXHJcbiAgICAgICAgY29uc3QgbCA9IHAyLm1hcCgoeCkgPT4gdGhpcy5yZXBsYWNlRW52VmFyaWFibGVzKHgpKTtcclxuICAgICAgICBpZiAocHMuaXNBYnNvbHV0ZShsW2wubGVuZ3RoIC0gMV0pKSB7IHJldHVybiBsW2wubGVuZ3RoIC0gMV07IH1cclxuICAgICAgICByZXR1cm4gcHMuam9pbih0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMocDEpLCAuLi5wMik7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNvcHlGaWxlU3luYyhzcmNSb290OiBzdHJpbmcsIHNyY0ZpbGU6IHN0cmluZywgZHN0Um9vdDogc3RyaW5nLCBkc3RGaWxlOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYGNvcHlGaWxlU3luYyBhcmdzOiAke0pTT04uc3RyaW5naWZ5KGFyZ3VtZW50cyl9YCk7XHJcbiAgICAgICAgc3JjUm9vdCA9IHRoaXMucmVwbGFjZUVudlZhcmlhYmxlcyhzcmNSb290KTtcclxuICAgICAgICBzcmNGaWxlID0gdGhpcy5yZXBsYWNlRW52VmFyaWFibGVzKHNyY0ZpbGUpO1xyXG4gICAgICAgIGRzdFJvb3QgPSB0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMoZHN0Um9vdCk7XHJcbiAgICAgICAgZHN0RmlsZSA9IHRoaXMucmVwbGFjZUVudlZhcmlhYmxlcyhkc3RGaWxlKTtcclxuICAgICAgICBjb25zdCBzcmMgPSBwcy5pc0Fic29sdXRlKHNyY0ZpbGUpID8gc3JjRmlsZSA6IHBzLmpvaW4oc3JjUm9vdCwgc3JjRmlsZSk7XHJcbiAgICAgICAgY29uc3QgZHN0ID0gcHMuaXNBYnNvbHV0ZShkc3RGaWxlKSA/IGRzdEZpbGUgOiBwcy5qb2luKGRzdFJvb3QsIGRzdEZpbGUpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoYGNvcHlGaWxlU3luYyAke3NyY30gLT4gJHtkc3R9YCk7XHJcbiAgICAgICAgdGhpcy5tYWtlRGlyZWN0b3J5UmVjdXJzaXZlKHBzLmRpcm5hbWUoZHN0KSk7XHJcbiAgICAgICAgZnMuY29weUZpbGVTeW5jKHNyYywgZHN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgY29weUZpbGVBc3luYyhzcmM6IHN0cmluZywgZHN0OiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgW2FzeW5jXSBjb3B5RmlsZSAke3NyY30gLT4gJHtkc3R9YCk7XHJcbiAgICAgICAgdGhpcy5tYWtlRGlyZWN0b3J5UmVjdXJzaXZlKHBzLnBhcnNlKGRzdCkuZGlyKTtcclxuICAgICAgICBhd2FpdCBmcy5jb3B5RmlsZShzcmMsIGRzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGNvcHlSZWN1cnNpdmVBc3luYyhzcmNEaXI6IHN0cmluZywgZHN0OiBzdHJpbmcpIHtcclxuICAgICAgICBzcmNEaXIgPSB0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMoc3JjRGlyKTtcclxuICAgICAgICBkc3QgPSB0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMoZHN0KTtcclxuXHJcbiAgICAgICAgY29uc3QgdGFza3M6IFByb21pc2U8YW55PltdID0gW107XHJcbiAgICAgICAgY29uc3Qgc3JjU3RhdCA9IGF3YWl0IGZzLnN0YXQoc3JjRGlyKTtcclxuXHJcbiAgICAgICAgaWYgKCFzcmNTdGF0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGZhaWxlZCB0byBzdGF0ICR7c3JjRGlyfWApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzcmNTdGF0LmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5tYWtlRGlyZWN0b3J5UmVjdXJzaXZlKGRzdCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgZnMucmVhZGRpcihzcmNEaXIpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGYgb2YgZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmID09PSAnLicgfHwgZiA9PT0gJy4uJykgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZnAgPSBwcy5qb2luKHNyY0RpciwgZik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0c2sgPSB0aGlzLmNvcHlSZWN1cnNpdmVBc3luYyhmcCwgcHMuam9pbihkc3QsIGYpKTtcclxuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2godHNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0YXNrcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzcmNTdGF0LmlzRmlsZSgpKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNvcHlGaWxlQXN5bmMoc3JjRGlyLCBkc3QpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRlbGF5KDEwKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBlcnJvcjogcmV0cnkgY29weWluZyAke3NyY0Rpcn0gLT4gdG8gJHtkc3R9IC4uLiAke2V9YCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNvcHlGaWxlQXN5bmMoc3JjRGlyLCBkc3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBwcmVwYXJlRGlyc0ZvckZpbGVzKHNyY1Jvb3Q6IHN0cmluZywgZmlsZXM6IHN0cmluZ1tdLCBkc3REaXI6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHRyZWU6IGFueSA9IHt9O1xyXG4gICAgICAgIGZvciAoY29uc3QgZiBvZiBmaWxlcykge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJ0cyA9IGYuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgbGV0IHAgPSB0cmVlO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGkgb2YgcGFydHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpIGluIHApIHtcclxuICAgICAgICAgICAgICAgICAgICBwID0gcFtpXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcCA9IHBbaV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWtkaXJzID0gKHNyY0Rpcjogc3RyaW5nLCBhdHRyczogYW55LCBkc3REaXI6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzcmNTdGF0ID0gZnMuc3RhdFN5bmMoc3JjRGlyKTtcclxuICAgICAgICAgICAgaWYgKCFzcmNTdGF0LmlzRGlyZWN0b3J5KCkpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhkc3REaXIpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgcHJlcGVyZURpciAke2RzdERpcn1gKTtcclxuICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyhkc3REaXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgaSBpbiBhdHRycykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgIT09ICcuJyAmJiBpICE9PSAnLi4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWtkaXJzKHBzLmpvaW4oc3JjRGlyLCBpKSwgYXR0cnNbaV0sIHBzLmpvaW4oZHN0RGlyLCBpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBta2RpcnMoc3JjUm9vdCwgdHJlZSwgZHN0RGlyKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHBhcmFsbGVsQ29weUZpbGVzKHBhcjogbnVtYmVyLCBzcmNSb290OiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSwgZHN0RGlyOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgcnVubmluZ1Rhc2tzID0gMDtcclxuICAgICAgICBkc3REaXIgPSB0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMoZHN0RGlyKTtcclxuICAgICAgICBjY2hlbHBlci5wcmVwYXJlRGlyc0ZvckZpbGVzKHNyY1Jvb3QsIGZpbGVzLCBkc3REaXIpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvcHlBc3luYyA9IGFzeW5jIChzcmM6IHN0cmluZywgZHN0OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcyArPSAxO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jb3B5UmVjdXJzaXZlQXN5bmMoc3JjLCBkc3QpO1xyXG4gICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzIC09IDE7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZUNvcHkoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgc2NoZWR1bGVDb3B5ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IDAgJiYgcnVubmluZ1Rhc2tzIDwgcGFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZiA9IGZpbGVzLnNoaWZ0KCkhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNyY0ZpbGUgPSBwcy5qb2luKHNyY1Jvb3QsIGYpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHNyY0ZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlBc3luYyhzcmNGaWxlLCBwcy5qb2luKGRzdERpciwgZikpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGB3YXJuaW5nOiBjb3B5RmlsZTogJHtzcmNGaWxlfSBub3QgZXhpc3RzIWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDAgJiYgcnVubmluZ1Rhc2tzID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcjsgaSsrKSB7IHNjaGVkdWxlQ29weSgpOyB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIG1ha2VEaXJlY3RvcnlSZWN1cnNpdmUoZGlyOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoZGlyLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cclxuICAgICAgICBjb25zdCBkaXJzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGxldCBwID0gZGlyO1xyXG4gICAgICAgIHdoaWxlICghZnMuZXhpc3RzU3luYyhwKSkge1xyXG4gICAgICAgICAgICBkaXJzLnB1c2gocCk7XHJcbiAgICAgICAgICAgIHAgPSBwcy5qb2luKHAsICcuLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAoZGlycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyhkaXJzW2RpcnMubGVuZ3RoIC0gMV0pO1xyXG4gICAgICAgICAgICBkaXJzLmxlbmd0aCA9IGRpcnMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZShkaXI6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBmcy5zdGF0KGRpcik7XHJcbiAgICAgICAgaWYgKHN0YXQuaXNGaWxlKCkpIHtcclxuICAgICAgICAgICAgYXdhaXQgZnMudW5saW5rKGRpcik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGF3YWl0IGZzLnJlYWRkaXIoZGlyKTtcclxuICAgICAgICAgICAgY29uc3QgdGFza3M6IFByb21pc2U8YW55PltdID0gW107XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZiBvZiBsaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZiA9PT0gJy4nIHx8IGYgPT09ICcuLicpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGZwID0gcHMuam9pbihkaXIsIGYpO1xyXG4gICAgICAgICAgICAgICAgdGFza3MucHVzaCh0aGlzLnJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZShmcCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHRhc2tzKTtcclxuICAgICAgICAgICAgYXdhaXQgZnMucm1kaXIoZGlyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGNvcHlGaWxlc1dpdGhDb25maWcoY2ZnOiB7IGZyb206IHN0cmluZywgdG86IHN0cmluZywgaW5jbHVkZT86IHN0cmluZ1tdLCBleGNsdWRlPzogc3RyaW5nW10gfSwgc3JjUm9vdDogc3RyaW5nLCBkc3RSb290OiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHNyY1Jvb3QpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNvcHkgZmlsZSBzcmNSb290ICR7c3JjUm9vdH0gaXMgbm90IGV4aXN0cyFgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHNyY1Jvb3QgPSB0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMoc3JjUm9vdCk7XHJcbiAgICAgICAgZHN0Um9vdCA9IHRoaXMucmVwbGFjZUVudlZhcmlhYmxlcyhkc3RSb290KTtcclxuICAgICAgICBsZXQgZnJvbSA9IHRoaXMucmVwbGFjZUVudlZhcmlhYmxlcyhjZmcuZnJvbSk7XHJcbiAgICAgICAgbGV0IHRvID0gdGhpcy5yZXBsYWNlRW52VmFyaWFibGVzKGNmZy50byk7XHJcbiAgICAgICAgaWYgKHBzLmlzQWJzb2x1dGUoZnJvbSkpIHtcclxuICAgICAgICAgICAgc3JjUm9vdCA9IGZyb207XHJcbiAgICAgICAgICAgIGZyb20gPSAnLic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcy5pc0Fic29sdXRlKHRvKSkge1xyXG4gICAgICAgICAgICBkc3RSb290ID0gdG87XHJcbiAgICAgICAgICAgIHRvID0gJy4nO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBjb3B5ICR7SlNPTi5zdHJpbmdpZnkoY2ZnKX0sICR7ZnJvbX0gLT4gJHt0b30gZnJvbSAke3NyY1Jvb3R9IC0+ICR7ZHN0Um9vdH1gKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnVpbGRQcmVmaXhUcmVlID0gKGxpc3QwOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0cmVlOiBhbnkgPSB7fTtcclxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGxpc3QwLm1hcCgoeCkgPT4gQXJyYXkuZnJvbSh4KSk7XHJcbiAgICAgICAgICAgIHdoaWxlIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBsaXN0LnNoaWZ0KCkhO1xyXG4gICAgICAgICAgICAgICAgbGV0IHAgPSB0cmVlO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGMgPSB0LnNoaWZ0KCkhO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGMgaW4gcCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcFtjXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwID0gcFtjXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJlZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBtYXRjaFByZWZpeFRyZWUgPSAoc3RyOiBzdHJpbmcsIHRyZWU6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG4gICAgICAgICAgICBpZiAodHJlZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGFyciA9IEFycmF5LmZyb20oc3RyKTtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcCA9IHRyZWU7XHJcbiAgICAgICAgICAgIHdoaWxlIChhcnJbaV0gaW4gcCkge1xyXG4gICAgICAgICAgICAgICAgcCA9IHBbYXJyW2ldXTtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaSA9PT0gYXJyLmxlbmd0aCAmJiBPYmplY3Qua2V5cyhwKS5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgaW5jbHVkZVByZWZpeCA9IGNmZy5pbmNsdWRlID8gYnVpbGRQcmVmaXhUcmVlKGNmZy5pbmNsdWRlKSA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgZXhjbHVkZVByZWZpeCA9IGNmZy5leGNsdWRlID8gYnVpbGRQcmVmaXhUcmVlKGNmZy5leGNsdWRlKSA6IG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0IGNwUkFzeW5jID0gYXN5bmMgKHNyY1Jvb3Q6IHN0cmluZywgc3JjRGlyOiBzdHJpbmcsIGRzdFJvb3Q6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyRnVsbERpciA9IHBzLmpvaW4oc3JjUm9vdCwgc3JjRGlyKTtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGZzLnN0YXQoY3VyckZ1bGxEaXIpO1xyXG4gICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGZzLnJlYWRkaXIoY3VyckZ1bGxEaXIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViQ29waWVzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmIG9mIGZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGYgPT09ICcuJyB8fCBmID09PSAnLi4nKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aEluU3JjUm9vdCA9IHBzLmpvaW4oc3JjRGlyLCBmKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZVByZWZpeCAmJiBtYXRjaFByZWZpeFRyZWUocGF0aEluU3JjUm9vdCwgZXhjbHVkZVByZWZpeCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVQcmVmaXggJiYgbWF0Y2hQcmVmaXhUcmVlKHBhdGhJblNyY1Jvb3QsIGluY2x1ZGVQcmVmaXgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbmNsdWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgIC0gc2tpcCBjb3B5ICR7c3JjUm9vdH0gJHtwYXRoSW5TcmNSb290fSB0byAke2RzdFJvb3R9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzdWJDb3BpZXMucHVzaChjcFJBc3luYyhzcmNSb290LCBwYXRoSW5TcmNSb290LCBkc3RSb290KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChzdWJDb3BpZXMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXQuaXNGaWxlKCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGxldCBkc3RGaWxlQWJzID0gcHMuaXNBYnNvbHV0ZShzcmNEaXIpID8gc3JjRGlyIDogcHMuam9pbihkc3RSb290LCBzcmNEaXIpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jb3B5RmlsZUFzeW5jKGN1cnJGdWxsRGlyLCBwcy5qb2luKGRzdFJvb3QsIHNyY0RpcikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgY29weUZyb20gPSB0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMocHMubm9ybWFsaXplKHBzLmpvaW4oc3JjUm9vdCwgZnJvbSkpKTtcclxuICAgICAgICBjb25zdCBjb3B5VG8gPSB0aGlzLnJlcGxhY2VFbnZWYXJpYWJsZXMocHMubm9ybWFsaXplKHBzLmpvaW4oZHN0Um9vdCwgdG8pKSk7XHJcbiAgICAgICAgYXdhaXQgY3BSQXN5bmMoc3JjUm9vdCwgZnJvbSwgY29weVRvKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgcmVwbGFjZUluRmlsZShwYXR0ZXJuczogeyByZWc6IHN0cmluZyB8IFJlZ0V4cCwgdGV4dDogc3RyaW5nIH1bXSwgZmlsZXBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGZpbGVwYXRoID0gdGhpcy5yZXBsYWNlRW52VmFyaWFibGVzKGZpbGVwYXRoKTtcclxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZXBhdGgpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBXaGlsZSByZXBsYWNlIHRlbXBsYXRlIGNvbnRlbnQsIGZpbGUgJHtmaWxlcGF0aH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgcmVwbGFjZSAke2ZpbGVwYXRofSB3aXRoICR7SlNPTi5zdHJpbmdpZnkocGF0dGVybnMpfWApO1xyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gKGF3YWl0IGZzLnJlYWRGaWxlKGZpbGVwYXRoKSkudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnXFxuJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld0NvbnRlbnQgPSBsaW5lcy5tYXAoKGwpID0+IHtcclxuICAgICAgICAgICAgcGF0dGVybnMuZm9yRWFjaCgocCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbCA9IGwucmVwbGFjZShuZXcgUmVnRXhwKHAucmVnKSwgdGhpcy5yZXBsYWNlRW52VmFyaWFibGVzKHAudGV4dCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGw7XHJcbiAgICAgICAgfSkuam9pbignXFxuJyk7XHJcblxyXG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShmaWxlcGF0aCwgbmV3Q29udGVudCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHN0YXRpYyBleGFjdFZhbHVlRnJvbUZpbGUocmVnZXhwOiBSZWdFeHAsIGZpbGVuYW1lOiBzdHJpbmcsIGlkeDogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAoIShmcy5leGlzdHNTeW5jKGZpbGVuYW1lKSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgZmlsZSAke2ZpbGVuYW1lfSBub3QgZXhpc3QhYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUpLnRvU3RyaW5nKCd1dGYtOCcpLnNwbGl0KCdcXG4nKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGwgb2YgbGluZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgciA9IGwubWF0Y2gocmVnZXhwKTtcclxuICAgICAgICAgICAgaWYgKHIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByW2lkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJ1bkNtZChjbWQ6IHN0cmluZywgYXJnczogc3RyaW5nW10sIHNsaWVudDogYm9vbGVhbiwgY3dkPzogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtydW5DbWRdOiAke2NtZH0gJHthcmdzLmpvaW4oJyAnKX1gKTtcclxuICAgICAgICAgICAgY29uc3QgY3AgPSBzcGF3bihjbWQsIGFyZ3MsIHtcclxuICAgICAgICAgICAgICAgIHNoZWxsOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZW52OiBwcm9jZXNzLmVudixcclxuICAgICAgICAgICAgICAgIGN3ZDogY3dkISB8fCBwcm9jZXNzLmN3ZCgpLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCFzbGllbnQpIHtcclxuICAgICAgICAgICAgICAgIGNwLnN0ZG91dC5vbihgZGF0YWAsIChjaHVuaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbcnVuQ21kICR7Y21kfV0gJHtjaHVua31gKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY3Auc3RkZXJyLm9uKGBkYXRhYCwgKGNodW5rKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtydW5DbWQgJHtjbWR9IC0gZXJyb3JdICR7Y2h1bmt9YCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjcC5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChjb2RlICE9PSAwICYmICFzbGllbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoYGZhaWxlZCB0byBleGVjICR7Y21kfSAke2FyZ3Muam9pbignICcpfWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjcC5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjcC5vbignY2xvc2UnLCAoY29kZSwgc2lnbmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29kZSAhPT0gMCAmJiAhc2xpZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBmYWlsZWQgdG8gZXhlYyAke2NtZH0gJHthcmdzLmpvaW4oJyAnKX1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZXhpc3RzU3luYyhmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgZXh0TmFtZSA9IHBzLmV4dG5hbWUoZmlsZVBhdGgpO1xyXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoTm90RXh0ID0gcHMuYmFzZW5hbWUoZmlsZVBhdGgsIGV4dE5hbWUpO1xyXG4gICAgICAgIGZpbGVQYXRoID0gcHMuam9pbihwcy5kaXJuYW1lKGZpbGVQYXRoKSwgZmlsZVBhdGhOb3RFeHQpO1xyXG5cclxuICAgICAgICByZXR1cm4gISFFWFRfTElTVC5maW5kKChleHQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoZmlsZVBhdGggKyBleHQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjaGVja0phdmFIb21lKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghcHJvY2Vzcy5lbnYuSkFWQV9IT01FKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXJuaW5nOiAkSkFWQV9IT01FIGlzIG5vdCBzZXQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGphdmFQYXRoID0gY2NoZWxwZXIud2hpY2goJ2phdmEnKTtcclxuICAgICAgICBpZiAoIWphdmFQYXRoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCdqYXZhJyBpcyBub3QgZm91bmQgaW4gUEFUSGApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gZXhlY1N5bmMoYFwiJHtjY2hlbHBlci5maXhQYXRoKGphdmFQYXRoKX1cIiAtdmVyc2lvbmApLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoL0phdmFcXChUTVxcKS8udGVzdCh2ZXJzaW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBPcmFjbGUgSkRLIGlzIGV4cGVjdGVkLmApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBjaGVja2luZyBqYXZhIHJ1bnRpbWUuLi5gKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhY2Nlc3NTeW5jKGZpbGU6IHN0cmluZywgbW9kZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhmaWxlLCBtb2RlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB3aGljaChleGVjdXRhYmxlOiBzdHJpbmcpOiBudWxsIHwgc3RyaW5nIHtcclxuICAgICAgICAvLyBwb3NzaWJsZSBleGVjdXRhYmxlIG5hbWVzXHJcbiAgICAgICAgY29uc3QgZXhlY3MgPSBbZXhlY3V0YWJsZV07XHJcbiAgICAgICAgY29uc3QgSVNfV0lORE9XUyA9IG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMic7XHJcbiAgICAgICAgaWYgKElTX1dJTkRPV1MpIHtcclxuICAgICAgICAgICAgZXhlY3MucHVzaChleGVjdXRhYmxlICsgJy5leGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2VwcmF0ZSBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlXHJcbiAgICAgICAgY29uc3QgcGF0aExpc3QgPSBJU19XSU5ET1dTID8gcHJvY2Vzcy5lbnYuUEFUSD8uc3BsaXQoJzsnKSA6IHByb2Nlc3MuZW52LlBBVEg/LnNwbGl0KCc6Jyk7XHJcbiAgICAgICAgaWYgKCFwYXRoTGlzdCB8fCBwYXRoTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNlYXJjaCBmb3IgZXhlY3V0YWJsZSBpbiBlYWNoIFBBVEggc2VnbWVudFxyXG4gICAgICAgIGZvciAoY29uc3QgZGlyIG9mIHBhdGhMaXN0KSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZXhlY05hbWUgb2YgZXhlY3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRlc3RGaWxlID0gcHMuam9pbihkaXIsIGV4ZWNOYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRlc3RGaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChJU19XSU5ET1dTIHx8IGNjaGVscGVyLmFjY2Vzc1N5bmModGVzdEZpbGUsIGZzLmNvbnN0YW50cy5YX09LKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdEZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgdG9vbEhlbHBlciA9IHtcclxuICAgIGdldFhjb2RlTWFqb3JWZXJpb24oKTogbnVtYmVyIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBvdXRwdXQgPSBleGVjU3luYygneGNydW4geGNvZGVidWlsZCAtdmVyc2lvbicpLnRvU3RyaW5nKCd1dGY4Jyk7XHJcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIucGFyc2VJbnQob3V0cHV0Lm1hdGNoKC9YY29kZVxccyhcXGQrKVxcLlxcZCsvKSFbMV0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgLy8gZmFsbGJhY2sgdG8gZGVmYXVsdCBYY29kZSB2ZXJzaW9uXHJcbiAgICAgICAgICAgIHJldHVybiAxMTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIHJ1bkNvbW1hbmQoY21kOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCBjYj86IChjb2RlOiBudW1iZXIsIHN0ZG91dDogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4gdm9pZCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNwID0gc3Bhd24oY21kLCBhcmdzKTtcclxuICAgICAgICAgICAgY29uc3Qgc3RkRXJyOiBCdWZmZXJbXSA9IFtdO1xyXG4gICAgICAgICAgICBjb25zdCBzdGRPdXQ6IEJ1ZmZlcltdID0gW107XHJcbiAgICAgICAgICAgIGNwLnN0ZGVyci5vbignZGF0YScsIChkKSA9PiBzdGRFcnIucHVzaChkKSk7XHJcbiAgICAgICAgICAgIGNwLnN0ZG91dC5vbignZGF0YScsIChkKSA9PiBzdGRPdXQucHVzaChkKSk7XHJcbiAgICAgICAgICAgIGNwLm9uKCdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChjYikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNiKGNvZGUgYXMgYW55LCBCdWZmZXIuY29uY2F0KHN0ZE91dCkudG9TdHJpbmcoJ3V0ZjgnKSwgQnVmZmVyLmNvbmNhdChzdGRFcnIpLnRvU3RyaW5nKCd1dGY4JykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb2RlID09PSAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJ1bkNtYWtlKGFyZ3M6IHN0cmluZ1tdLCB3b3JrRGlyPzogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGNtYWtlUGF0aCA9IFBhdGhzLmNtYWtlUGF0aDtcclxuICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyAmJiBjbWFrZVBhdGguaW5kZXhPZignICcpID4gLTEpIHtcclxuICAgICAgICAgICAgY21ha2VQYXRoID0gYFwiJHtjbWFrZVBhdGh9XCJgO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNtYWtlUGF0aCA9IGNtYWtlUGF0aC5yZXBsYWNlKC8gL2csICdcXFxcICcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBEZWxldGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIHN0YXJ0IHdpdGggYG5wbV9gLCB3aGljaCBtYXkgY2F1c2UgY29tcGlsZSBlcnJvciBvbiB3aW5kb3dzXHJcbiAgICAgICAgY29uc3QgbmV3RW52OiBhbnkgPSB7fTtcclxuICAgICAgICBPYmplY3QuYXNzaWduKG5ld0VudiwgcHJvY2Vzcy5lbnYpO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKG5ld0VudikuZmlsdGVyKHggPT4geC50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoJ25wbV8nKSkuZm9yRWFjaChlID0+IGRlbGV0ZSBuZXdFbnZbZV0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgcnVuICR7Y21ha2VQYXRofSAke2FyZ3Muam9pbignICcpfWApO1xyXG4gICAgICAgICAgICBjb25zdCBjcCA9IHNwYXduKGNtYWtlUGF0aCwgYXJncywge1xyXG4gICAgICAgICAgICAgICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgJ3BpcGUnXSxcclxuICAgICAgICAgICAgICAgIGVudjogbmV3RW52LFxyXG4gICAgICAgICAgICAgICAgc2hlbGw6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjd2Q6IHdvcmtEaXIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjcC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBpY29udi5kZWNvZGUoZGF0YSwgJ2diaycpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoL3dhcm5pbmcvaS50ZXN0KG1zZykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NtYWtlLXdhcm5dICR7bXNnfWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2NtYWtlXSAke21zZ31gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNwLnN0ZGVyci5vbignZGF0YScsIChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGljb252LmRlY29kZShkYXRhLCAnZ2JrJykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGlmICgvQ01ha2UgV2FybmluZy8udGVzdChtc2cpIHx8IC93YXJuaW5nL2kudGVzdChtc2cpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtjbWFrZS13YXJuXSAke21zZ31gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW2NtYWtlLWVycl0gJHttc2d9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjcC5vbignY2xvc2UnLCAoY29kZTogbnVtYmVyLCBzaWc6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBydW4gY21ha2UgZmFpbGVkIFwiY21ha2UgJHthcmdzLmpvaW4oJyAnKX1cIiwgY29kZTogJHtjb2RlfSwgc2lnbmFsOiAke3NpZ31gKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgcnVuWGNvZGVCdWlsZChhcmdzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIC8vIG9ubHkgcnVucyBvbiBtYWMgb3MsIHJ1biB3aXRoIGB4Y29kZWJ1aWxkYCBkaXJlY3RseVxyXG4gICAgICAgIC8vIERlbGV0ZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgc3RhcnQgd2l0aCBgbnBtX2AsIHdoaWNoIG1heSBjYXVzZSBjb21waWxlIGVycm9yIG9uIHdpbmRvd3NcclxuICAgICAgICBjb25zdCBuZXdFbnY6IGFueSA9IHt9O1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24obmV3RW52LCBwcm9jZXNzLmVudik7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobmV3RW52KS5maWx0ZXIoeCA9PiB4LnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnbnBtXycpKS5mb3JFYWNoKGUgPT4gZGVsZXRlIG5ld0VudltlXSk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBydW4geGNvZGVidWlsZCB3aXRoICR7YXJncy5qb2luKCcgJyl9YCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHhjb2RlYnVpbGRQYXRoID0gY2NoZWxwZXIud2hpY2goJ3hjb2RlYnVpbGQnKTtcclxuICAgICAgICAgICAgaWYgKCF4Y29kZWJ1aWxkUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJ3hjb2RlYnVpbGQnIGlzIG5vdCBpbiB0aGUgcGF0aGApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYHJ1biB4Y29kZWJ1aWxkIHdpdGggJHthcmdzLmpvaW4oJyAnKX1gKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNwID0gc3Bhd24oeGNvZGVidWlsZFBhdGgsIGFyZ3MsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCAncGlwZSddLFxyXG4gICAgICAgICAgICAgICAgICAgIGVudjogbmV3RW52LFxyXG4gICAgICAgICAgICAgICAgICAgIHNoZWxsOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjcC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt4Y29kZWJ1aWxkXSAke2ljb252LmRlY29kZShkYXRhLCAnZ2JrJykudG9TdHJpbmcoKX1gKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY3Auc3RkZXJyLm9uKCdkYXRhJywgKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt4Y29kZWJ1aWxkXSAke2ljb252LmRlY29kZShkYXRhLCAnZ2JrJykudG9TdHJpbmcoKX1gKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY3Aub24oJ2Nsb3NlJywgKGNvZGU6IG51bWJlciwgc2lnOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBydW4geGNvZGVidWlsZCBmYWlsZWQgXCJ4Y29kZWJ1aWxkICR7YXJncy5qb2luKCcgJyl9XCIsIGNvZGU6ICR7Y29kZX0sIHNpZ25hbDogJHtzaWd9YCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgUGF0aHMge1xyXG4gICAgcHVibGljIHN0YXRpYyBlbmdpbmVQYXRoOiBzdHJpbmc7IC8vIFtlbmdpbmVdXHJcbiAgICBwdWJsaWMgc3RhdGljIG5hdGl2ZVJvb3Q6IHN0cmluZzsgLy8gW2VuZ2luZS1uYXRpdmVdXHJcbiAgICBwdWJsaWMgc3RhdGljIHByb2plY3REaXI6IHN0cmluZzsgLy8gW3Byb2plY3RdXHJcbiAgICBwdWJsaWMgc3RhdGljIGNtYWtlUGF0aDogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiBpb3MvbWFjL3dpbmRvd3MvYW5kcm9pZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHBsYXRmb3JtOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIGlvcy9tYWMvd2luNjQvd2luMzIvYW5kcm9pZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHBsYXRmb3JtVGVtcGxhdGVEaXJOYW1lOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIGJ1aWxkL1twbGF0Zm9ybV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGJ1aWxkRGlyOiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBidWlsZC9bcGxhdGZvcm1dL2RhdGFcclxuICAgICAqL1xyXG4gICAgcHVibGljIGJ1aWxkQXNzZXRzRGlyOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGFyYW1zOiBDb2Nvc1BhcmFtczxPYmplY3Q+KSB7XHJcbiAgICAgICAgUGF0aHMuZW5naW5lUGF0aCA9IHBhcmFtcy5lbmdpbmVQYXRoO1xyXG4gICAgICAgIFBhdGhzLnByb2plY3REaXIgPSBwYXJhbXMucHJvakRpcjtcclxuICAgICAgICBQYXRocy5uYXRpdmVSb290ID0gcGFyYW1zLm5hdGl2ZUVuZ2luZVBhdGg7XHJcbiAgICAgICAgUGF0aHMuY21ha2VQYXRoID0gcGFyYW1zLmNtYWtlUGF0aDtcclxuICAgICAgICB0aGlzLnBsYXRmb3JtID0gcGFyYW1zLnBsYXRmb3JtO1xyXG4gICAgICAgIHRoaXMuYnVpbGREaXIgPSBwYXJhbXMuYnVpbGREaXI7XHJcbiAgICAgICAgdGhpcy5idWlsZEFzc2V0c0RpciA9IHBhcmFtcy5idWlsZEFzc2V0c0RpcjtcclxuICAgICAgICBpZiAocGFyYW1zLnBsYXRmb3JtID09PSAnd2luZG93cycpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybVRlbXBsYXRlRGlyTmFtZSA9IChwYXJhbXMucGxhdGZvcm1QYXJhbXMgYXMgYW55KS50YXJnZXRQbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/ICd3aW4zMicgOiAnd2luNjQnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxhdGZvcm1UZW1wbGF0ZURpck5hbWUgPSBwYXJhbXMucGxhdGZvcm1OYW1lID8gcGFyYW1zLnBsYXRmb3JtTmFtZSA6IHRoaXMucGxhdGZvcm07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFtwcm9qZWN0XS9uYXRpdmUvZW5naW5lL2NvbW1vblxyXG4gICAgICovXHJcbiAgICBnZXQgY29tbW9uRGlySW5QcmooKSB7XHJcbiAgICAgICAgcmV0dXJuIHBzLmpvaW4oUGF0aHMucHJvamVjdERpciwgJ25hdGl2ZScsICdlbmdpbmUnLCAnY29tbW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBbZW5naW5lXS90ZW1wbGF0ZXMvY29tbW9uXHJcbiAgICAgKi9cclxuICAgIGdldCBjb21tb25EaXJJbkNvY29zKCkge1xyXG4gICAgICAgIHJldHVybiBwcy5qb2luKHRoaXMubmF0aXZlVGVtcGxhdGVEaXJJbkNvY29zLCAnY29tbW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBbcHJvamVjdF0vbmF0aXZlL2VuZ2luZVxyXG4gICAgICovXHJcbiAgICBnZXQgbmF0aXZlVGVtcGxhdGVEaXJJblByaigpIHtcclxuICAgICAgICByZXR1cm4gcHMuam9pbihQYXRocy5wcm9qZWN0RGlyLCAnbmF0aXZlJywgJ2VuZ2luZScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogW2VuZ2luZV0vdGVtcGxhdGVzXHJcbiAgICAgKi9cclxuICAgIGdldCBuYXRpdmVUZW1wbGF0ZURpckluQ29jb3MoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBzLmpvaW4oUGF0aHMuZW5naW5lUGF0aCwgJ3RlbXBsYXRlcycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogW3Byb2plY3RdL25hdGl2ZS9lbmdpbmUvW3BsYXRmb3JtVGVtcGxhdGVEaXJOYW1lXVxyXG4gICAgICovXHJcbiAgICBnZXQgcGxhdGZvcm1UZW1wbGF0ZURpckluUHJqKCkge1xyXG4gICAgICAgIHJldHVybiBwcy5qb2luKHRoaXMubmF0aXZlVGVtcGxhdGVEaXJJblByaiwgdGhpcy5wbGF0Zm9ybVRlbXBsYXRlRGlyTmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBbZW5naW5lXS90ZW1wbGF0ZXMvW3BsYXRmb3JtVGVtcGxhdGVEaXJOYW1lXVxyXG4gICAgICovXHJcbiAgICBnZXQgcGxhdGZvcm1UZW1wbGF0ZURpckluQ29jb3MoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBzLmpvaW4odGhpcy5uYXRpdmVUZW1wbGF0ZURpckluQ29jb3MsIHRoaXMucGxhdGZvcm0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYnVpbGQvW3BsYXRmb3JtXS9wcm9qXHJcbiAgICAgKi9cclxuICAgIGdldCBuYXRpdmVQcmpEaXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBzLmpvaW4odGhpcy5idWlsZERpciwgJ3Byb2onKTtcclxuICAgIH1cclxufVxyXG4iXX0=