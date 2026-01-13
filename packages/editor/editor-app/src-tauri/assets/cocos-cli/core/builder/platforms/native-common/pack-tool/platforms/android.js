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
const utils_1 = require("../utils");
const default_1 = __importDefault(require("../base/default"));
class AndroidPackTool extends default_1.default {
    async create() {
        await this.copyCommonTemplate();
        // 检查 CMakeLists.txt 是否存在，如果不存在，强制复制模板
        // 这通常发生在 native 目录存在但文件不完整的情况下
        const cmakePath = ps.join(this.paths.platformTemplateDirInPrj, 'CMakeLists.txt');
        if (!fs.existsSync(cmakePath)) {
            console.log(`CMakeLists.txt not found in ${cmakePath}, copying template...`);
            // Android 模板在 templates/android/template 目录下
            await fs.copy(ps.join(this.paths.platformTemplateDirInCocos, 'template'), this.paths.platformTemplateDirInPrj, { overwrite: true });
        }
        await this.copyPlatformTemplate();
        await this.generateCMakeConfig();
        await this.executeCocosTemplateTask();
        await this.encryptScripts();
        return true;
    }
    async generate() {
        const nativePrjDir = this.paths.nativePrjDir;
        const platformTemplateDir = this.paths.platformTemplateDirInPrj;
        const buildTemplateDir = ps.join(this.paths.nativeTemplateDirInCocos, 'android', 'build');
        // 1. 确保构建目录存在
        fs.ensureDirSync(nativePrjDir);
        // 2. 复制 Android 项目骨架 (gradlew 等)
        if (fs.existsSync(buildTemplateDir)) {
            await fs.copy(buildTemplateDir, nativePrjDir, { overwrite: true });
        }
        // 3. 复制用户代码 (native/engine/android) 到构建目录，覆盖骨架
        if (fs.existsSync(platformTemplateDir)) {
            // 先删除构建目录中的 res 目录，避免与用户代码中的 res 目录冲突
            const resDirInBuild = ps.join(nativePrjDir, 'res');
            if (fs.existsSync(resDirInBuild)) {
                await fs.remove(resDirInBuild);
                console.log(`[Android] Removed existing res directory in build folder to avoid conflicts`);
            }
            await fs.copy(platformTemplateDir, nativePrjDir, { overwrite: true });
        }
        // 3.1. 替换 settings.gradle 中的项目名
        // 因为复制文件可能会覆盖之前在 create() 阶段替换的内容，需要再次替换
        const settingsGradlePath = ps.join(nativePrjDir, 'settings.gradle');
        if (fs.existsSync(settingsGradlePath)) {
            const projectName = this.params.projectName;
            if (projectName !== 'CocosGame') {
                // 使用全局正则表达式替换所有出现的 CocosGame
                const content = await fs.readFile(settingsGradlePath, 'utf8');
                const newContent = content.replace(/CocosGame/g, projectName);
                await fs.writeFile(settingsGradlePath, newContent, 'utf8');
                console.log(`[Android] Replaced project name in settings.gradle: CocosGame -> ${projectName}`);
            }
        }
        // 4. 生成 local.properties
        // 如果 sdkPath 或 ndkPath 是空字符串，则视为未配置（等同于 undefined）
        const sdkPath = this.params.platformParams.sdkPath && this.params.platformParams.sdkPath.trim() !== ''
            ? this.params.platformParams.sdkPath
            : undefined;
        const ndkPath = this.params.platformParams.ndkPath && this.params.platformParams.ndkPath.trim() !== ''
            ? this.params.platformParams.ndkPath
            : undefined;
        let localProps = '';
        console.log(`[Android] Generating local.properties with SDK: ${sdkPath}, NDK: ${ndkPath}`);
        if (sdkPath) {
            // Windows 下路径分隔符可能需要处理
            localProps += `sdk.dir=${utils_1.cchelper.fixPath(sdkPath)}\n`;
        }
        if (ndkPath) {
            localProps += `ndk.dir=${utils_1.cchelper.fixPath(ndkPath)}\n`;
        }
        if (localProps) {
            const propsPath = ps.join(nativePrjDir, 'local.properties');
            // 如果文件已存在，先读取内容，合并属性
            if (fs.existsSync(propsPath)) {
                const existingProps = await fs.readFile(propsPath, 'utf8');
                // 简单的合并策略：如果新属性不存在于旧内容中，则追加
                // 更严谨的做法是解析 properties 文件
                if (!existingProps.includes('sdk.dir=') && sdkPath) {
                    await fs.appendFile(propsPath, `\nsdk.dir=${utils_1.cchelper.fixPath(sdkPath)}`);
                }
                // 不要写入 ndk.dir，这会导致与 build.gradle 中的 android.ndkVersion 冲突
                // 如果 ndk.dir 与 android.ndkVersion 指定的版本不一致，构建会失败
                // 通过让 Gradle 根据 android.ndkVersion 自动查找 NDK 目录来解决此问题
                // if (!existingProps.includes('ndk.dir=') && ndkPath) {
                //     await fs.appendFile(propsPath, `\nndk.dir=${cchelper.fixPath(ndkPath)}`);
                // }
            }
            else {
                // 仅写入 sdk.dir（如果存在）
                if (sdkPath) {
                    await fs.writeFile(propsPath, `sdk.dir=${utils_1.cchelper.fixPath(sdkPath)}\n`);
                }
            }
            console.log(`[Android] local.properties updated/generated at: ${propsPath}`);
        }
        else {
            console.warn('[Android] local.properties skipped because sdkPath and ndkPath are empty');
        }
        // 5. 更新 gradle.properties 中的 COCOS_ENGINE_PATH
        const gradlePropsPath = ps.join(nativePrjDir, 'gradle.properties');
        if (fs.existsSync(gradlePropsPath)) {
            let gradleProps = await fs.readFile(gradlePropsPath, 'utf8');
            const enginePath = this.params.enginePath;
            let nativeEnginePath = this.params.nativeEnginePath;
            console.log(`[Android] Debug Params - enginePath: ${enginePath}, nativeEnginePath: ${nativeEnginePath}`);
            if (!nativeEnginePath && enginePath) {
                // 如果 nativeEnginePath 未定义，尝试从 enginePath 推断
                // 通常 native 目录在 enginePath/native
                const potentialNativePath = ps.join(enginePath, 'native');
                if (fs.existsSync(potentialNativePath)) {
                    nativeEnginePath = potentialNativePath;
                    console.log(`[Android] Inferred nativeEnginePath: ${nativeEnginePath}`);
                }
            }
            else if (!nativeEnginePath && !enginePath) {
                // 最后的尝试：假设我们正在运行在 cocos-cli 项目中，且 packages/engine 存在
                // 这是一个开发环境的 fallback
                const cliEnginePath = ps.resolve(__dirname, '../../../../../../../../packages/engine');
                if (fs.existsSync(cliEnginePath)) {
                    // nativeEnginePath = ps.join(cliEnginePath, 'native'); // 这似乎不对，cliEnginePath 已经是 packages/engine
                    // 实际上 engineInfo.typescript.path 应该指向这个目录
                    // 但我们这里只是为了获取 native 目录
                    // 无论如何，我们尝试构造一个路径
                    // 实际上，如果 enginePath 都没有，说明初始化流程有问题
                }
            }
            if (nativeEnginePath || this.params.enginePath) {
                // settings.gradle: new File(COCOS_ENGINE_PATH,'cocos/platform/android/libcocos2dx')
                // 这里的路径结构表明 COCOS_ENGINE_PATH 应该指向 native 目录
                // 因为文件实际位于 packages/engine/native/cocos/platform/android/libcocos2dx
                // 优先使用 nativeEnginePath
                let targetEnginePath = nativeEnginePath;
                if (!targetEnginePath && this.params.enginePath) {
                    // 如果 nativeEnginePath 未定义，尝试从 enginePath/native 获取
                    targetEnginePath = ps.join(this.params.enginePath, 'native');
                }
                if (targetEnginePath) {
                    const fixedPath = utils_1.cchelper.fixPath(targetEnginePath);
                    // 替换 COCOS_ENGINE_PATH= 为 COCOS_ENGINE_PATH=path
                    if (gradleProps.includes('COCOS_ENGINE_PATH=')) {
                        gradleProps = gradleProps.replace(/COCOS_ENGINE_PATH=(.*)/, `COCOS_ENGINE_PATH=${fixedPath}`);
                        await fs.writeFile(gradlePropsPath, gradleProps);
                        console.log(`[Android] Updated COCOS_ENGINE_PATH in gradle.properties to: ${fixedPath}`);
                    }
                }
            }
            // 6. 更新 RES_PATH
            // RES_PATH 应该是 build/android 目录
            const resPath = utils_1.cchelper.fixPath(this.paths.buildDir);
            gradleProps = await fs.readFile(gradlePropsPath, 'utf8'); // re-read in case it was updated
            if (gradleProps.includes('RES_PATH=')) {
                // 如果为空或者需要强制更新
                gradleProps = gradleProps.replace(/RES_PATH=(.*)/, `RES_PATH=${resPath}`);
                await fs.writeFile(gradlePropsPath, gradleProps);
                console.log(`[Android] Updated RES_PATH in gradle.properties to: ${resPath}`);
            }
            // 7. 添加/更新签名相关配置
            gradleProps = await fs.readFile(gradlePropsPath, 'utf8'); // re-read in case it was updated
            // 计算 keystore 文件的绝对路径
            const { keystoreAlias, keystoreAliasPassword, keystorePassword, keystorePath } = this.params.platformParams;
            const fixedKeystorePath = utils_1.cchelper.fixPath(keystorePath);
            // 更新或添加 RELEASE_STORE_FILE（处理注释行）
            if (gradleProps.match(/^#?\s*RELEASE_STORE_FILE=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*RELEASE_STORE_FILE=.*$/m, `RELEASE_STORE_FILE=${fixedKeystorePath}`);
            }
            else {
                gradleProps += `\nRELEASE_STORE_FILE=${fixedKeystorePath}`;
            }
            // 更新或添加 RELEASE_STORE_PASSWORD（处理注释行）
            if (gradleProps.match(/^#?\s*RELEASE_STORE_PASSWORD=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*RELEASE_STORE_PASSWORD=.*$/m, `RELEASE_STORE_PASSWORD=${keystorePassword}`);
            }
            else {
                gradleProps += `\nRELEASE_STORE_PASSWORD=${keystorePassword}`;
            }
            // 更新或添加 RELEASE_KEY_ALIAS（处理注释行）
            if (gradleProps.match(/^#?\s*RELEASE_KEY_ALIAS=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*RELEASE_KEY_ALIAS=.*$/m, `RELEASE_KEY_ALIAS=${keystoreAlias}`);
            }
            else {
                gradleProps += `\nRELEASE_KEY_ALIAS=${keystoreAlias}`;
            }
            // 更新或添加 RELEASE_KEY_PASSWORD（处理注释行）
            if (gradleProps.match(/^#?\s*RELEASE_KEY_PASSWORD=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*RELEASE_KEY_PASSWORD=.*$/m, `RELEASE_KEY_PASSWORD=${keystoreAliasPassword}`);
            }
            else {
                gradleProps += `\nRELEASE_KEY_PASSWORD=${keystoreAliasPassword}`;
            }
            // 8. 添加/更新 APPLICATION_ID（使用 packageName，处理注释行）
            const packageName = this.params.platformParams.packageName;
            if (packageName) {
                if (gradleProps.match(/^#?\s*APPLICATION_ID=/m)) {
                    gradleProps = gradleProps.replace(/^#?\s*APPLICATION_ID=.*$/m, `APPLICATION_ID=${packageName}`);
                }
                else {
                    gradleProps += `\nAPPLICATION_ID=${packageName}`;
                }
            }
            // 9. 添加/更新 PROP_NDK_PATH（处理注释行）
            if (ndkPath) {
                const fixedNdkPath = utils_1.cchelper.fixPath(ndkPath);
                if (gradleProps.match(/^#?\s*PROP_NDK_PATH=/m)) {
                    gradleProps = gradleProps.replace(/^#?\s*PROP_NDK_PATH=.*$/m, `PROP_NDK_PATH=${fixedNdkPath}`);
                }
                else {
                    gradleProps += `\nPROP_NDK_PATH=${fixedNdkPath}`;
                }
            }
            // 10. 添加/更新 NATIVE_DIR（处理注释行）
            const nativeDir = utils_1.cchelper.fixPath(this.paths.platformTemplateDirInPrj);
            if (gradleProps.match(/^#?\s*NATIVE_DIR=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*NATIVE_DIR=.*$/m, `NATIVE_DIR=${nativeDir}`);
            }
            else {
                gradleProps += `\nNATIVE_DIR=${nativeDir}`;
            }
            // 11. 设置 SDK 版本
            // 强制设置编译 SDK 版本为 36，以避免 android-36 (Preview) 的资源链接问题
            // 如果用户指定的 apiLevel 大于 36，则使用用户的
            const apiLevel = this.params.platformParams.apiLevel || 36;
            const compileSdkVersion = Math.max(apiLevel, 36);
            if (gradleProps.match(/^#?\s*PROP_COMPILE_SDK_VERSION=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*PROP_COMPILE_SDK_VERSION=.*$/m, `PROP_COMPILE_SDK_VERSION=${compileSdkVersion}`);
            }
            else {
                gradleProps += `\nPROP_COMPILE_SDK_VERSION=${compileSdkVersion}`;
            }
            if (gradleProps.match(/^#?\s*PROP_TARGET_SDK_VERSION=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*PROP_TARGET_SDK_VERSION=.*$/m, `PROP_TARGET_SDK_VERSION=${apiLevel}`);
            }
            else {
                gradleProps += `\nPROP_TARGET_SDK_VERSION=${apiLevel}`;
            }
            // 11. 添加 PROP_MIN_SDK_VERSION（如果不存在）
            if (!gradleProps.match(/^#?\s*PROP_MIN_SDK_VERSION=/m)) {
                gradleProps += `\nPROP_MIN_SDK_VERSION=21`;
            }
            // 12. 更新 PROP_IS_DEBUG（参考 packages/engine 的实现）
            const isDebug = this.params.debug ? 'true' : 'false';
            if (gradleProps.match(/^#?\s*PROP_IS_DEBUG=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*PROP_IS_DEBUG=.*$/m, `PROP_IS_DEBUG=${isDebug}`);
            }
            else {
                gradleProps += `\nPROP_IS_DEBUG=${isDebug}`;
            }
            // 13. 添加 PROP_APP_NAME
            if (gradleProps.match(/^#?\s*PROP_APP_NAME=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*PROP_APP_NAME=.*$/m, `PROP_APP_NAME=${this.params.projectName}`);
            }
            else {
                gradleProps += `\nPROP_APP_NAME=${this.params.projectName}`;
            }
            // 14. 更新 PROP_ENABLE_INSTANT_APP（如果存在）
            const androidInstant = this.params.platformParams.androidInstant || false;
            if (gradleProps.match(/^#?\s*PROP_ENABLE_INSTANT_APP=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*PROP_ENABLE_INSTANT_APP=.*$/m, `PROP_ENABLE_INSTANT_APP=${androidInstant ? 'true' : 'false'}`);
            }
            else if (!gradleProps.match(/^PROP_ENABLE_INSTANT_APP=/m)) {
                gradleProps += `\nPROP_ENABLE_INSTANT_APP=${androidInstant ? 'true' : 'false'}`;
            }
            // 15. 更新 PROP_ENABLE_INPUTSDK（如果存在）
            const inputSDK = this.params.platformParams.inputSDK || false;
            if (gradleProps.match(/^#?\s*PROP_ENABLE_INPUTSDK=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*PROP_ENABLE_INPUTSDK=.*$/m, `PROP_ENABLE_INPUTSDK=${inputSDK ? 'true' : 'false'}`);
            }
            else if (!gradleProps.match(/^PROP_ENABLE_INPUTSDK=/m)) {
                gradleProps += `\nPROP_ENABLE_INPUTSDK=${inputSDK ? 'true' : 'false'}`;
            }
            // 16. 更新 PROP_ENABLE_COMPRESS_SO（如果存在）
            const isSoFileCompressed = this.params.platformParams.isSoFileCompressed || false;
            if (gradleProps.match(/^#?\s*PROP_ENABLE_COMPRESS_SO=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*PROP_ENABLE_COMPRESS_SO=.*$/m, `PROP_ENABLE_COMPRESS_SO=${isSoFileCompressed ? 'true' : 'false'}`);
            }
            else if (!gradleProps.match(/^PROP_ENABLE_COMPRESS_SO=/m)) {
                gradleProps += `\nPROP_ENABLE_COMPRESS_SO=${isSoFileCompressed ? 'true' : 'false'}`;
            }
            // 17. 更新 PROP_APP_ABI
            const appABIs = this.params.platformParams.appABIs && this.params.platformParams.appABIs.length > 0
                ? this.params.platformParams.appABIs.join(':')
                : 'armeabi-v7a';
            if (gradleProps.match(/^#?\s*PROP_APP_ABI=/m)) {
                gradleProps = gradleProps.replace(/^#?\s*PROP_APP_ABI=.*$/m, `PROP_APP_ABI=${appABIs}`);
            }
            else {
                // 使用全局替换，因为可能有注释行
                gradleProps = gradleProps.replace(/PROP_APP_ABI=.*/g, `PROP_APP_ABI=${appABIs}`);
                if (!gradleProps.includes('PROP_APP_ABI=')) {
                    gradleProps += `\nPROP_APP_ABI=${appABIs}`;
                }
            }
            // 18. 更新 PROP_NDK_VERSION（从 NDK 的 source.properties 读取）
            if (ndkPath) {
                const ndkPropertiesPath = ps.join(ndkPath, 'source.properties');
                if (fs.existsSync(ndkPropertiesPath)) {
                    try {
                        const ndkContent = fs.readFileSync(ndkPropertiesPath, 'utf-8');
                        const regexp = /Pkg\.Revision\s*=\s*(.*)/;
                        const match = ndkContent.match(regexp);
                        if (match && match[1]) {
                            const ndkVersion = match[1].trim();
                            if (gradleProps.match(/^#?\s*PROP_NDK_VERSION=/m)) {
                                gradleProps = gradleProps.replace(/^#?\s*PROP_NDK_VERSION=.*$/m, `PROP_NDK_VERSION=${ndkVersion}`);
                            }
                            else if (!gradleProps.match(/^PROP_NDK_VERSION=/m)) {
                                gradleProps += `\nPROP_NDK_VERSION=${ndkVersion}`;
                            }
                        }
                    }
                    catch (e) {
                        console.warn(`[Android] Failed to read NDK version from ${ndkPropertiesPath}:`, e);
                    }
                }
            }
            await fs.writeFile(gradlePropsPath, gradleProps);
            console.log(`[Android] Updated gradle.properties with keystore, applicationId, NDK path, NATIVE_DIR, SDK versions, PROP_IS_DEBUG and PROP_APP_NAME`);
            // 12. 修复 strings.xml (如果为空)
            // 某些情况下，构建目录下的 strings.xml 可能是空的，导致构建失败
            const stringsXmlPath = ps.join(nativePrjDir, 'res', 'values', 'strings.xml');
            if (fs.existsSync(stringsXmlPath)) {
                const content = await fs.readFile(stringsXmlPath, 'utf8');
                if (!content || content.trim() === '' || content.replace(/\s/g, '') === '<resources></resources>') {
                    const appName = this.params.projectName || 'CocosGame';
                    const newContent = `<resources>\n    <string name="app_name" translatable="false">${appName}</string>\n</resources>`;
                    await fs.writeFile(stringsXmlPath, newContent);
                    console.log(`[Android] Repaired empty strings.xml with app_name: ${appName}`);
                }
            }
            // 19. 清理 res 目录，只保留 values
            // 避免与用户代码中的资源重复 (Duplicate resources)
            const resDir = ps.join(nativePrjDir, 'res');
            if (fs.existsSync(resDir)) {
                const items = await fs.readdir(resDir);
                for (const item of items) {
                    if (item !== 'values') {
                        const itemPath = ps.join(resDir, item);
                        await fs.remove(itemPath);
                        console.log(`[Android] Removed duplicated resource directory: ${item}`);
                    }
                }
            }
        }
        return true;
    }
    /**
     * 将项目名称转换为 ASCII 格式（用于 Gradle 任务名）
     * 参考 packages/engine 的实现
     */
    projectNameASCII() {
        // 将项目名称转换为 ASCII，移除特殊字符
        return this.params.projectName.replace(/[^a-zA-Z0-9]/g, '');
    }
    async make() {
        const options = this.params.platformParams;
        const nativePrjDir = this.paths.nativePrjDir;
        // 设置 JAVA_HOME（如果提供）
        if (options.javaHome) {
            if (process.env.JAVA_HOME !== options.javaHome) {
                process.env.JAVA_HOME = options.javaHome;
                console.log(`[Android] Update JAVA_HOME to ${options.javaHome}`);
            }
            const sep = process.platform === 'win32' ? ';' : ':';
            const javaBinPath = ps.join(options.javaHome, 'bin');
            if (!process.env.PATH.includes(javaBinPath)) {
                process.env.PATH = javaBinPath + sep + process.env.PATH;
                console.log(`[Android] Add JAVA_HOME/bin to PATH`);
            }
        }
        if (!fs.existsSync(nativePrjDir)) {
            throw new Error(`[Android] Project directory not found: ${nativePrjDir}`);
        }
        let gradlew = 'gradlew';
        if (process.platform === 'win32') {
            gradlew += '.bat';
        }
        else {
            gradlew = './' + gradlew;
            // 确保 gradlew 有执行权限
            await fs.chmod(ps.join(nativePrjDir, 'gradlew'), '755');
        }
        // 构建模式：Debug 或 Release
        const outputMode = this.params.debug ? 'Debug' : 'Release';
        // 使用项目名而不是 ASCII 版本，因为 settings.gradle 中已经替换为实际项目名
        const projectName = this.params.projectName;
        // 编译 Android APK
        const buildMode = `${projectName}:assemble${outputMode}`;
        // 保存当前工作目录
        const originDir = process.cwd();
        try {
            process.chdir(nativePrjDir);
            await utils_1.cchelper.runCmd(gradlew, [buildMode], false, nativePrjDir);
        }
        catch (e) {
            throw e;
        }
        finally {
            // 恢复工作目录
            process.chdir(originDir);
        }
        // 编译 Android Instant App（如果启用）
        const androidInstant = options.androidInstant || false;
        if (androidInstant) {
            const instantBuildMode = `instantapp:assemble${outputMode}`;
            try {
                process.chdir(nativePrjDir);
                await utils_1.cchelper.runCmd(gradlew, [instantBuildMode], false, nativePrjDir);
            }
            catch (e) {
                console.warn(`[Android] Failed to build instant app:`, e);
            }
            finally {
                process.chdir(originDir);
            }
        }
        // 编译 Google App Bundle（如果启用）
        const appBundle = options.appBundle || false;
        if (appBundle) {
            let bundleBuildMode;
            if (androidInstant) {
                bundleBuildMode = `bundle${outputMode}`;
            }
            else {
                bundleBuildMode = `${projectName}:bundle${outputMode}`;
            }
            try {
                process.chdir(nativePrjDir);
                await utils_1.cchelper.runCmd(gradlew, [bundleBuildMode], false, nativePrjDir);
            }
            catch (e) {
                console.warn(`[Android] Failed to build app bundle:`, e);
            }
            finally {
                process.chdir(originDir);
            }
        }
        // 停止 Gradle 守护进程，释放文件锁定，以便可以删除构建目录
        try {
            process.chdir(nativePrjDir);
            await utils_1.cchelper.runCmd(gradlew, ['--stop'], true, nativePrjDir);
            console.log(`[Android] Stopped Gradle daemon`);
        }
        catch (e) {
            // 忽略停止守护进程的错误，不影响构建结果
            console.warn(`[Android] Failed to stop Gradle daemon (non-critical):`, e);
        }
        finally {
            process.chdir(originDir);
        }
        return await this.copyToDist();
    }
    /**
     * 复制构建产物到发布目录
     * 参考 packages/engine 的实现
     */
    async copyToDist() {
        const options = this.params.platformParams;
        const suffix = this.params.debug ? 'debug' : 'release';
        const destDir = ps.join(this.paths.buildDir, 'publish', suffix);
        fs.ensureDirSync(destDir);
        // 复制 APK
        const apkPath = this.getApkPath();
        if (!fs.existsSync(apkPath)) {
            throw new Error(`[Android] APK not found at ${apkPath}`);
        }
        // 使用项目名而不是 ASCII 版本，与 settings.gradle 中的项目名保持一致
        const apkName = `${this.params.projectName}-${suffix}.apk`;
        fs.copyFileSync(apkPath, ps.join(destDir, apkName));
        console.log(`[Android] Copied APK to ${destDir}`);
        // 复制 Instant App APK（如果存在）
        const androidInstant = options.androidInstant || false;
        if (androidInstant) {
            const instantApkName = `instantapp-${suffix}.apk`;
            const instantApkPath = ps.join(this.paths.nativePrjDir, `build/instantapp/outputs/apk/${suffix}/${instantApkName}`);
            if (fs.existsSync(instantApkPath)) {
                fs.copyFileSync(instantApkPath, ps.join(destDir, instantApkName));
                console.log(`[Android] Copied Instant App APK to ${destDir}`);
            }
        }
        // 复制 App Bundle（如果存在）
        const appBundle = options.appBundle || false;
        if (appBundle) {
            const bundleName = `${this.params.projectName}-${suffix}.aab`;
            const bundlePath = ps.join(this.outputsDir(), `bundle/${suffix}/${bundleName}`);
            if (fs.existsSync(bundlePath)) {
                fs.copyFileSync(bundlePath, ps.join(destDir, bundleName));
                console.log(`[Android] Copied App Bundle to ${destDir}`);
            }
        }
        return true;
    }
    static async openWithIDE(nativePrjDir, androidStudioDir) {
        // 打开 Android Studio
        // 这里需要根据实际的 Android Studio 路径来调用
        if (androidStudioDir) {
            const studioExe = ps.join(androidStudioDir, 'bin', 'studio64.exe');
            if (fs.existsSync(studioExe)) {
                utils_1.cchelper.runCmd(studioExe, [nativePrjDir], false);
                return true;
            }
        }
        console.warn('Android Studio path not found');
        return false;
    }
    /**
     * 获取 APK 路径
     * 参考 packages/engine 的实现
     */
    getApkPath() {
        const suffix = this.params.debug ? 'debug' : 'release';
        // 使用项目名而不是 ASCII 版本，与 settings.gradle 中的项目名保持一致
        const apkName = `${this.params.projectName}-${suffix}.apk`;
        return ps.join(this.outputsDir(), `apk/${suffix}/${apkName}`);
    }
    /**
     * 获取构建输出目录
     * 参考 packages/engine 的实现
     */
    outputsDir() {
        // 使用项目名而不是 ASCII 版本，与 settings.gradle 中的项目名保持一致
        const folderName = this.params.projectName;
        const targetDir = ps.join(this.paths.nativePrjDir, 'build', folderName);
        const fallbackDir = ps.join(this.paths.nativePrjDir, 'build', this.params.projectName);
        return ps.join(fs.existsSync(targetDir) ? targetDir : fallbackDir, 'outputs');
    }
    async getExecutableFile() {
        const apkPath = this.getApkPath();
        if (!fs.existsSync(apkPath)) {
            throw new Error(`[Android] APK file not found at ${apkPath}`);
        }
        return apkPath;
    }
    /**
     * 获取 ADB 路径
     * 参考 packages/engine 的实现
     */
    getAdbPath() {
        const sdkPath = this.params.platformParams.sdkPath;
        return ps.join(sdkPath, `platform-tools/adb${process.platform === 'win32' ? '.exe' : ''}`);
    }
    /**
     * 检查是否有设备连接
     * 参考 packages/engine 的实现
     */
    checkConnectedDevices(adbPath) {
        const { spawnSync } = require('child_process');
        const cp = spawnSync(adbPath, ['devices'], {
            shell: true,
            env: process.env,
            cwd: process.cwd()
        });
        if (cp.stderr && cp.stderr.length > 0) {
            console.log(`[adb devices] stderr: ${cp.stderr.toString('utf8')}`);
        }
        if (cp.error) {
            console.log(`[adb devices] error: ${cp.error}`);
        }
        if (cp.output && cp.output.length > 1) {
            for (const chunk of cp.output) {
                if (chunk) {
                    const chunkStr = chunk.toString();
                    const lines = chunkStr.split('\n');
                    for (const line of lines) {
                        if (/^[0-9a-zA-Z]+\s+\w+/.test(line)) {
                            return true; // device connected
                        }
                    }
                }
            }
        }
        return false;
    }
    /**
     * 检查 APK 是否已安装
     * 参考 packages/engine 的实现
     */
    async checkApkInstalled(adbPath) {
        const { spawn } = require('child_process');
        const packageName = this.params.platformParams.packageName;
        return new Promise((resolve) => {
            const cp = spawn(adbPath, [
                'shell', 'pm', 'list', 'packages', '|', 'grep',
                packageName,
            ], {
                shell: true,
                env: process.env,
                cwd: process.cwd(),
            });
            let output = '';
            cp.stdout.on('data', (chunk) => {
                output += chunk.toString();
            });
            cp.stderr.on('data', () => {
                // ignore stderr
            });
            cp.on('close', () => {
                resolve(output.includes(packageName));
            });
        });
    }
    /**
     * 安装 APK
     * 参考 packages/engine 的实现
     */
    async install() {
        const apkPath = this.getApkPath();
        const adbPath = this.getAdbPath();
        if (!fs.existsSync(apkPath)) {
            throw new Error(`[Android] Cannot find APK at ${apkPath}`);
        }
        if (!fs.existsSync(adbPath)) {
            throw new Error(`[Android] Cannot find ADB at ${adbPath}`);
        }
        if (!this.checkConnectedDevices(adbPath)) {
            console.error(`[Android] Cannot find any connected devices, please connect your device or start an Android emulator`);
            return false;
        }
        // 如果已安装，先卸载
        if (await this.checkApkInstalled(adbPath)) {
            await utils_1.cchelper.runCmd(adbPath, ['uninstall', this.params.platformParams.packageName], false);
        }
        // 安装 APK
        await utils_1.cchelper.runCmd(adbPath, ['install', '-r', apkPath], false);
        return true;
    }
    /**
     * 启动应用
     * 参考 packages/engine 的实现
     */
    async startApp() {
        const adbPath = this.getAdbPath();
        const packageName = this.params.platformParams.packageName;
        await utils_1.cchelper.runCmd(adbPath, [
            'shell', 'am', 'start', '-n',
            `${packageName}/com.cocos.game.AppActivity`,
        ], false);
        return true;
    }
    async run() {
        if (await this.install()) {
            return await this.startApp();
        }
        return false;
    }
}
exports.default = AndroidPackTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvcGxhdGZvcm1zL25hdGl2ZS1jb21tb24vcGFjay10b29sL3BsYXRmb3Jtcy9hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLHlDQUEyQjtBQUMzQixvQ0FBb0M7QUFDcEMsOERBQThEO0FBYTlELE1BQXFCLGVBQWdCLFNBQVEsaUJBQWM7SUFHdkQsS0FBSyxDQUFDLE1BQU07UUFDUixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRWhDLHNDQUFzQztRQUN0QywrQkFBK0I7UUFDL0IsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDakYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixTQUFTLHVCQUF1QixDQUFDLENBQUM7WUFDN0UsNkNBQTZDO1lBQzdDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3hJLENBQUM7UUFFRCxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDakMsTUFBTSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUV0QyxNQUFNLElBQUks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LE1BQU0sZ0JBQVEsQ0FBQyxNQUFNLENBQ2pCLE9BQU8sRUFDUDtZQUNJLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUk7WUFDNUIsR0FBRyxXQUFXLDZCQUE2QjtTQUM5QyxFQUNELEtBQUssQ0FDUixDQUFDO1FBQ0YsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFHO1FBQ0wsSUFBSSxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQTdyQkQsa0NBNnJCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0ICogYXMgcHMgZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGNjaGVscGVyIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgTmF0aXZlUGFja1Rvb2wsIHsgQ29jb3NQYXJhbXMgfSBmcm9tICcuLi9iYXNlL2RlZmF1bHQnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQW5kcm9pZFBhcmFtIHtcclxuICAgIHBhY2thZ2VOYW1lOiBzdHJpbmc7XHJcbiAgICBhcGlMZXZlbDogbnVtYmVyO1xyXG4gICAgYXBwQUJJczogc3RyaW5nW107XHJcbiAgICBzZGtQYXRoOiBzdHJpbmc7XHJcbiAgICBuZGtQYXRoOiBzdHJpbmc7XHJcbiAgICBqYXZhSG9tZT86IHN0cmluZztcclxuICAgIGphdmFQYXRoPzogc3RyaW5nO1xyXG4gICAgW2tleTogc3RyaW5nXTogYW55O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmRyb2lkUGFja1Rvb2wgZXh0ZW5kcyBOYXRpdmVQYWNrVG9vbCB7XHJcbiAgICBkZWNsYXJlIHBhcmFtczogQ29jb3NQYXJhbXM8SUFuZHJvaWRQYXJhbT47XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuY29weUNvbW1vblRlbXBsYXRlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5qOA5p+lIENNYWtlTGlzdHMudHh0IOaYr+WQpuWtmOWcqO+8jOWmguaenOS4jeWtmOWcqO+8jOW8uuWItuWkjeWItuaooeadv1xyXG4gICAgICAgIC8vIOi/memAmuW4uOWPkeeUn+WcqCBuYXRpdmUg55uu5b2V5a2Y5Zyo5L2G5paH5Lu25LiN5a6M5pW055qE5oOF5Ya15LiLXHJcbiAgICAgICAgY29uc3QgY21ha2VQYXRoID0gcHMuam9pbih0aGlzLnBhdGhzLnBsYXRmb3JtVGVtcGxhdGVEaXJJblByaiwgJ0NNYWtlTGlzdHMudHh0Jyk7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGNtYWtlUGF0aCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYENNYWtlTGlzdHMudHh0IG5vdCBmb3VuZCBpbiAke2NtYWtlUGF0aH0sIGNvcHlpbmcgdGVtcGxhdGUuLi5gKTtcclxuICAgICAgICAgICAgLy8gQW5kcm9pZCDmqKHmnb/lnKggdGVtcGxhdGVzL2FuZHJvaWQvdGVtcGxhdGUg55uu5b2V5LiLXHJcbiAgICAgICAgICAgIGF3YWl0IGZzLmNvcHkocHMuam9pbih0aGlzLnBhdGhzLnBsYXRmb3JtVGVtcGxhdGVEaXJJbkNvY29zLCAndGVtcGxhdGUnKSwgdGhpcy5wYXRocy5wbGF0Zm9ybVRlbXBsYXRlRGlySW5QcmosIHsgb3ZlcndyaXRlOiB0cnVlIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXdhaXQgdGhpcy5jb3B5UGxhdGZvcm1UZW1wbGF0ZSgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuZ2VuZXJhdGVDTWFrZUNvbmZpZygpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuZXhlY3V0ZUNvY29zVGVtcGxhdGVUYXNrKCk7XHJcblxyXG4gICAgICAgIGF3YWl0IHRoaXMuZW5jcnlwdFNjcmlwdHMoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZW5lcmF0ZSgpIHtcclxuICAgICAgICBjb25zdCBuYXRpdmVQcmpEaXIgPSB0aGlzLnBhdGhzLm5hdGl2ZVByakRpcjtcclxuICAgICAgICBjb25zdCBwbGF0Zm9ybVRlbXBsYXRlRGlyID0gdGhpcy5wYXRocy5wbGF0Zm9ybVRlbXBsYXRlRGlySW5Qcmo7XHJcbiAgICAgICAgY29uc3QgYnVpbGRUZW1wbGF0ZURpciA9IHBzLmpvaW4odGhpcy5wYXRocy5uYXRpdmVUZW1wbGF0ZURpckluQ29jb3MsICdhbmRyb2lkJywgJ2J1aWxkJyk7XHJcblxyXG4gICAgICAgIC8vIDEuIOehruS/neaehOW7uuebruW9leWtmOWcqFxyXG4gICAgICAgIGZzLmVuc3VyZURpclN5bmMobmF0aXZlUHJqRGlyKTtcclxuXHJcbiAgICAgICAgLy8gMi4g5aSN5Yi2IEFuZHJvaWQg6aG555uu6aqo5p62IChncmFkbGV3IOetiSlcclxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhidWlsZFRlbXBsYXRlRGlyKSkge1xyXG4gICAgICAgICAgICBhd2FpdCBmcy5jb3B5KGJ1aWxkVGVtcGxhdGVEaXIsIG5hdGl2ZVByakRpciwgeyBvdmVyd3JpdGU6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAzLiDlpI3liLbnlKjmiLfku6PnoIEgKG5hdGl2ZS9lbmdpbmUvYW5kcm9pZCkg5Yiw5p6E5bu655uu5b2V77yM6KaG55uW6aqo5p62XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGxhdGZvcm1UZW1wbGF0ZURpcikpIHtcclxuICAgICAgICAgICAgLy8g5YWI5Yig6Zmk5p6E5bu655uu5b2V5Lit55qEIHJlcyDnm67lvZXvvIzpgb/lhY3kuI7nlKjmiLfku6PnoIHkuK3nmoQgcmVzIOebruW9leWGsueqgVxyXG4gICAgICAgICAgICBjb25zdCByZXNEaXJJbkJ1aWxkID0gcHMuam9pbihuYXRpdmVQcmpEaXIsICdyZXMnKTtcclxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocmVzRGlySW5CdWlsZCkpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGZzLnJlbW92ZShyZXNEaXJJbkJ1aWxkKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQW5kcm9pZF0gUmVtb3ZlZCBleGlzdGluZyByZXMgZGlyZWN0b3J5IGluIGJ1aWxkIGZvbGRlciB0byBhdm9pZCBjb25mbGljdHNgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCBmcy5jb3B5KHBsYXRmb3JtVGVtcGxhdGVEaXIsIG5hdGl2ZVByakRpciwgeyBvdmVyd3JpdGU6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAzLjEuIOabv+aNoiBzZXR0aW5ncy5ncmFkbGUg5Lit55qE6aG555uu5ZCNXHJcbiAgICAgICAgLy8g5Zug5Li65aSN5Yi25paH5Lu25Y+v6IO95Lya6KaG55uW5LmL5YmN5ZyoIGNyZWF0ZSgpIOmYtuauteabv+aNoueahOWGheWuue+8jOmcgOimgeWGjeasoeabv+aNolxyXG4gICAgICAgIGNvbnN0IHNldHRpbmdzR3JhZGxlUGF0aCA9IHBzLmpvaW4obmF0aXZlUHJqRGlyLCAnc2V0dGluZ3MuZ3JhZGxlJyk7XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoc2V0dGluZ3NHcmFkbGVQYXRoKSkge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0TmFtZSA9IHRoaXMucGFyYW1zLnByb2plY3ROYW1lO1xyXG4gICAgICAgICAgICBpZiAocHJvamVjdE5hbWUgIT09ICdDb2Nvc0dhbWUnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDkvb/nlKjlhajlsYDmraPliJnooajovr7lvI/mm7/mjaLmiYDmnInlh7rnjrDnmoQgQ29jb3NHYW1lXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnMucmVhZEZpbGUoc2V0dGluZ3NHcmFkbGVQYXRoLCAndXRmOCcpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Q29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvQ29jb3NHYW1lL2csIHByb2plY3ROYW1lKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShzZXR0aW5nc0dyYWRsZVBhdGgsIG5ld0NvbnRlbnQsICd1dGY4Jyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FuZHJvaWRdIFJlcGxhY2VkIHByb2plY3QgbmFtZSBpbiBzZXR0aW5ncy5ncmFkbGU6IENvY29zR2FtZSAtPiAke3Byb2plY3ROYW1lfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyA0LiDnlJ/miJAgbG9jYWwucHJvcGVydGllc1xyXG4gICAgICAgIC8vIOWmguaenCBzZGtQYXRoIOaIliBuZGtQYXRoIOaYr+epuuWtl+espuS4su+8jOWImeinhuS4uuacqumFjee9ru+8iOetieWQjOS6jiB1bmRlZmluZWTvvIlcclxuICAgICAgICBjb25zdCBzZGtQYXRoID0gdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMuc2RrUGF0aCAmJiB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5zZGtQYXRoLnRyaW0oKSAhPT0gJycgXHJcbiAgICAgICAgICAgID8gdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMuc2RrUGF0aCBcclxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgbmRrUGF0aCA9IHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zLm5ka1BhdGggJiYgdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMubmRrUGF0aC50cmltKCkgIT09ICcnIFxyXG4gICAgICAgICAgICA/IHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zLm5ka1BhdGggXHJcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGxldCBsb2NhbFByb3BzID0gJyc7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtBbmRyb2lkXSBHZW5lcmF0aW5nIGxvY2FsLnByb3BlcnRpZXMgd2l0aCBTREs6ICR7c2RrUGF0aH0sIE5ESzogJHtuZGtQYXRofWApO1xyXG4gICAgICAgIGlmIChzZGtQYXRoKSB7XHJcbiAgICAgICAgICAgIC8vIFdpbmRvd3Mg5LiL6Lev5b6E5YiG6ZqU56ym5Y+v6IO96ZyA6KaB5aSE55CGXHJcbiAgICAgICAgICAgIGxvY2FsUHJvcHMgKz0gYHNkay5kaXI9JHtjY2hlbHBlci5maXhQYXRoKHNka1BhdGgpfVxcbmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuZGtQYXRoKSB7XHJcbiAgICAgICAgICAgIGxvY2FsUHJvcHMgKz0gYG5kay5kaXI9JHtjY2hlbHBlci5maXhQYXRoKG5ka1BhdGgpfVxcbmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChsb2NhbFByb3BzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BzUGF0aCA9IHBzLmpvaW4obmF0aXZlUHJqRGlyLCAnbG9jYWwucHJvcGVydGllcycpO1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmlofku7blt7LlrZjlnKjvvIzlhYjor7vlj5blhoXlrrnvvIzlkIjlubblsZ7mgKdcclxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocHJvcHNQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdQcm9wcyA9IGF3YWl0IGZzLnJlYWRGaWxlKHByb3BzUGF0aCwgJ3V0ZjgnKTtcclxuICAgICAgICAgICAgICAgIC8vIOeugOWNleeahOWQiOW5tuetlueVpe+8muWmguaenOaWsOWxnuaAp+S4jeWtmOWcqOS6juaXp+WGheWuueS4re+8jOWImei/veWKoFxyXG4gICAgICAgICAgICAgICAgLy8g5pu05Lil6LCo55qE5YGa5rOV5piv6Kej5p6QIHByb3BlcnRpZXMg5paH5Lu2XHJcbiAgICAgICAgICAgICAgICBpZiAoIWV4aXN0aW5nUHJvcHMuaW5jbHVkZXMoJ3Nkay5kaXI9JykgJiYgc2RrUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGZzLmFwcGVuZEZpbGUocHJvcHNQYXRoLCBgXFxuc2RrLmRpcj0ke2NjaGVscGVyLmZpeFBhdGgoc2RrUGF0aCl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDkuI3opoHlhpnlhaUgbmRrLmRpcu+8jOi/meS8muWvvOiHtOS4jiBidWlsZC5ncmFkbGUg5Lit55qEIGFuZHJvaWQubmRrVmVyc2lvbiDlhrLnqoFcclxuICAgICAgICAgICAgICAgIC8vIOWmguaenCBuZGsuZGlyIOS4jiBhbmRyb2lkLm5ka1ZlcnNpb24g5oyH5a6a55qE54mI5pys5LiN5LiA6Ie077yM5p6E5bu65Lya5aSx6LSlXHJcbiAgICAgICAgICAgICAgICAvLyDpgJrov4forqkgR3JhZGxlIOagueaNriBhbmRyb2lkLm5ka1ZlcnNpb24g6Ieq5Yqo5p+l5om+IE5ESyDnm67lvZXmnaXop6PlhrPmraTpl67pophcclxuICAgICAgICAgICAgICAgIC8vIGlmICghZXhpc3RpbmdQcm9wcy5pbmNsdWRlcygnbmRrLmRpcj0nKSAmJiBuZGtQYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgYXdhaXQgZnMuYXBwZW5kRmlsZShwcm9wc1BhdGgsIGBcXG5uZGsuZGlyPSR7Y2NoZWxwZXIuZml4UGF0aChuZGtQYXRoKX1gKTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAvLyDku4XlhpnlhaUgc2RrLmRpcu+8iOWmguaenOWtmOWcqO+8iVxyXG4gICAgICAgICAgICAgICAgIGlmIChzZGtQYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwcm9wc1BhdGgsIGBzZGsuZGlyPSR7Y2NoZWxwZXIuZml4UGF0aChzZGtQYXRoKX1cXG5gKTtcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtBbmRyb2lkXSBsb2NhbC5wcm9wZXJ0aWVzIHVwZGF0ZWQvZ2VuZXJhdGVkIGF0OiAke3Byb3BzUGF0aH1gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgY29uc29sZS53YXJuKCdbQW5kcm9pZF0gbG9jYWwucHJvcGVydGllcyBza2lwcGVkIGJlY2F1c2Ugc2RrUGF0aCBhbmQgbmRrUGF0aCBhcmUgZW1wdHknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIDUuIOabtOaWsCBncmFkbGUucHJvcGVydGllcyDkuK3nmoQgQ09DT1NfRU5HSU5FX1BBVEhcclxuICAgICAgICBjb25zdCBncmFkbGVQcm9wc1BhdGggPSBwcy5qb2luKG5hdGl2ZVByakRpciwgJ2dyYWRsZS5wcm9wZXJ0aWVzJyk7XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZ3JhZGxlUHJvcHNQYXRoKSkge1xyXG4gICAgICAgICAgICBsZXQgZ3JhZGxlUHJvcHMgPSBhd2FpdCBmcy5yZWFkRmlsZShncmFkbGVQcm9wc1BhdGgsICd1dGY4Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGVuZ2luZVBhdGggPSB0aGlzLnBhcmFtcy5lbmdpbmVQYXRoO1xyXG4gICAgICAgICAgICBsZXQgbmF0aXZlRW5naW5lUGF0aCA9IHRoaXMucGFyYW1zLm5hdGl2ZUVuZ2luZVBhdGg7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQW5kcm9pZF0gRGVidWcgUGFyYW1zIC0gZW5naW5lUGF0aDogJHtlbmdpbmVQYXRofSwgbmF0aXZlRW5naW5lUGF0aDogJHtuYXRpdmVFbmdpbmVQYXRofWApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKCFuYXRpdmVFbmdpbmVQYXRoICYmIGVuZ2luZVBhdGgpIHtcclxuICAgICAgICAgICAgICAgIC8vIOWmguaenCBuYXRpdmVFbmdpbmVQYXRoIOacquWumuS5ie+8jOWwneivleS7jiBlbmdpbmVQYXRoIOaOqOaWrVxyXG4gICAgICAgICAgICAgICAgLy8g6YCa5bi4IG5hdGl2ZSDnm67lvZXlnKggZW5naW5lUGF0aC9uYXRpdmVcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvdGVudGlhbE5hdGl2ZVBhdGggPSBwcy5qb2luKGVuZ2luZVBhdGgsICduYXRpdmUnKTtcclxuICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBvdGVudGlhbE5hdGl2ZVBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmF0aXZlRW5naW5lUGF0aCA9IHBvdGVudGlhbE5hdGl2ZVBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtBbmRyb2lkXSBJbmZlcnJlZCBuYXRpdmVFbmdpbmVQYXRoOiAke25hdGl2ZUVuZ2luZVBhdGh9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW5hdGl2ZUVuZ2luZVBhdGggJiYgIWVuZ2luZVBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAvLyDmnIDlkI7nmoTlsJ3or5XvvJrlgYforr7miJHku6zmraPlnKjov5DooYzlnKggY29jb3MtY2xpIOmhueebruS4re+8jOS4lCBwYWNrYWdlcy9lbmdpbmUg5a2Y5ZyoXHJcbiAgICAgICAgICAgICAgICAgLy8g6L+Z5piv5LiA5Liq5byA5Y+R546v5aKD55qEIGZhbGxiYWNrXHJcbiAgICAgICAgICAgICAgICAgY29uc3QgY2xpRW5naW5lUGF0aCA9IHBzLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvZW5naW5lJyk7XHJcbiAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoY2xpRW5naW5lUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgLy8gbmF0aXZlRW5naW5lUGF0aCA9IHBzLmpvaW4oY2xpRW5naW5lUGF0aCwgJ25hdGl2ZScpOyAvLyDov5nkvLzkuY7kuI3lr7nvvIxjbGlFbmdpbmVQYXRoIOW3sue7j+aYryBwYWNrYWdlcy9lbmdpbmVcclxuICAgICAgICAgICAgICAgICAgICAgLy8g5a6e6ZmF5LiKIGVuZ2luZUluZm8udHlwZXNjcmlwdC5wYXRoIOW6lOivpeaMh+WQkei/meS4quebruW9lVxyXG4gICAgICAgICAgICAgICAgICAgICAvLyDkvYbmiJHku6zov5nph4zlj6rmmK/kuLrkuobojrflj5YgbmF0aXZlIOebruW9lVxyXG4gICAgICAgICAgICAgICAgICAgICAvLyDml6DorrrlpoLkvZXvvIzmiJHku6zlsJ3or5XmnoTpgKDkuIDkuKrot6/lvoRcclxuICAgICAgICAgICAgICAgICAgICAgLy8g5a6e6ZmF5LiK77yM5aaC5p6cIGVuZ2luZVBhdGgg6YO95rKh5pyJ77yM6K+05piO5Yid5aeL5YyW5rWB56iL5pyJ6Zeu6aKYXHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobmF0aXZlRW5naW5lUGF0aCB8fCB0aGlzLnBhcmFtcy5lbmdpbmVQYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzZXR0aW5ncy5ncmFkbGU6IG5ldyBGaWxlKENPQ09TX0VOR0lORV9QQVRILCdjb2Nvcy9wbGF0Zm9ybS9hbmRyb2lkL2xpYmNvY29zMmR4JylcclxuICAgICAgICAgICAgICAgIC8vIOi/memHjOeahOi3r+W+hOe7k+aehOihqOaYjiBDT0NPU19FTkdJTkVfUEFUSCDlupTor6XmjIflkJEgbmF0aXZlIOebruW9lVxyXG4gICAgICAgICAgICAgICAgLy8g5Zug5Li65paH5Lu25a6e6ZmF5L2N5LqOIHBhY2thZ2VzL2VuZ2luZS9uYXRpdmUvY29jb3MvcGxhdGZvcm0vYW5kcm9pZC9saWJjb2NvczJkeFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyDkvJjlhYjkvb/nlKggbmF0aXZlRW5naW5lUGF0aFxyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldEVuZ2luZVBhdGggPSBuYXRpdmVFbmdpbmVQYXRoO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXRFbmdpbmVQYXRoICYmIHRoaXMucGFyYW1zLmVuZ2luZVBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpwgbmF0aXZlRW5naW5lUGF0aCDmnKrlrprkuYnvvIzlsJ3or5Xku44gZW5naW5lUGF0aC9uYXRpdmUg6I635Y+WXHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RW5naW5lUGF0aCA9IHBzLmpvaW4odGhpcy5wYXJhbXMuZW5naW5lUGF0aCwgJ25hdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0RW5naW5lUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpeGVkUGF0aCA9IGNjaGVscGVyLmZpeFBhdGgodGFyZ2V0RW5naW5lUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5pu/5o2iIENPQ09TX0VOR0lORV9QQVRIPSDkuLogQ09DT1NfRU5HSU5FX1BBVEg9cGF0aFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChncmFkbGVQcm9wcy5pbmNsdWRlcygnQ09DT1NfRU5HSU5FX1BBVEg9JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9DT0NPU19FTkdJTkVfUEFUSD0oLiopLywgYENPQ09TX0VOR0lORV9QQVRIPSR7Zml4ZWRQYXRofWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUoZ3JhZGxlUHJvcHNQYXRoLCBncmFkbGVQcm9wcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQW5kcm9pZF0gVXBkYXRlZCBDT0NPU19FTkdJTkVfUEFUSCBpbiBncmFkbGUucHJvcGVydGllcyB0bzogJHtmaXhlZFBhdGh9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyA2LiDmm7TmlrAgUkVTX1BBVEhcclxuICAgICAgICAgICAgLy8gUkVTX1BBVEgg5bqU6K+l5pivIGJ1aWxkL2FuZHJvaWQg55uu5b2VXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc1BhdGggPSBjY2hlbHBlci5maXhQYXRoKHRoaXMucGF0aHMuYnVpbGREaXIpO1xyXG4gICAgICAgICAgICBncmFkbGVQcm9wcyA9IGF3YWl0IGZzLnJlYWRGaWxlKGdyYWRsZVByb3BzUGF0aCwgJ3V0ZjgnKTsgLy8gcmUtcmVhZCBpbiBjYXNlIGl0IHdhcyB1cGRhdGVkXHJcbiAgICAgICAgICAgIGlmIChncmFkbGVQcm9wcy5pbmNsdWRlcygnUkVTX1BBVEg9JykpIHtcclxuICAgICAgICAgICAgICAgICAvLyDlpoLmnpzkuLrnqbrmiJbogIXpnIDopoHlvLrliLbmm7TmlrBcclxuICAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyA9IGdyYWRsZVByb3BzLnJlcGxhY2UoL1JFU19QQVRIPSguKikvLCBgUkVTX1BBVEg9JHtyZXNQYXRofWApO1xyXG4gICAgICAgICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShncmFkbGVQcm9wc1BhdGgsIGdyYWRsZVByb3BzKTtcclxuICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FuZHJvaWRdIFVwZGF0ZWQgUkVTX1BBVEggaW4gZ3JhZGxlLnByb3BlcnRpZXMgdG86ICR7cmVzUGF0aH1gKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gNy4g5re75YqgL+abtOaWsOetvuWQjeebuOWFs+mFjee9rlxyXG4gICAgICAgICAgICBncmFkbGVQcm9wcyA9IGF3YWl0IGZzLnJlYWRGaWxlKGdyYWRsZVByb3BzUGF0aCwgJ3V0ZjgnKTsgLy8gcmUtcmVhZCBpbiBjYXNlIGl0IHdhcyB1cGRhdGVkXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyDorqHnrpcga2V5c3RvcmUg5paH5Lu255qE57ud5a+56Lev5b6EXHJcbiAgICAgICAgICAgIGNvbnN0IHsga2V5c3RvcmVBbGlhcywga2V5c3RvcmVBbGlhc1Bhc3N3b3JkLCBrZXlzdG9yZVBhc3N3b3JkLCBrZXlzdG9yZVBhdGggfSA9IHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zO1xyXG4gICAgICAgICAgICBjb25zdCBmaXhlZEtleXN0b3JlUGF0aCA9IGNjaGVscGVyLmZpeFBhdGgoa2V5c3RvcmVQYXRoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIOabtOaWsOaIlua3u+WKoCBSRUxFQVNFX1NUT1JFX0ZJTEXvvIjlpITnkIbms6jph4rooYzvvIlcclxuICAgICAgICAgICAgaWYgKGdyYWRsZVByb3BzLm1hdGNoKC9eIz9cXHMqUkVMRUFTRV9TVE9SRV9GSUxFPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqUkVMRUFTRV9TVE9SRV9GSUxFPS4qJC9tLCBgUkVMRUFTRV9TVE9SRV9GSUxFPSR7Zml4ZWRLZXlzdG9yZVBhdGh9YCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyArPSBgXFxuUkVMRUFTRV9TVE9SRV9GSUxFPSR7Zml4ZWRLZXlzdG9yZVBhdGh9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g5pu05paw5oiW5re75YqgIFJFTEVBU0VfU1RPUkVfUEFTU1dPUkTvvIjlpITnkIbms6jph4rooYzvvIlcclxuICAgICAgICAgICAgaWYgKGdyYWRsZVByb3BzLm1hdGNoKC9eIz9cXHMqUkVMRUFTRV9TVE9SRV9QQVNTV09SRD0vbSkpIHtcclxuICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzID0gZ3JhZGxlUHJvcHMucmVwbGFjZSgvXiM/XFxzKlJFTEVBU0VfU1RPUkVfUEFTU1dPUkQ9LiokL20sIGBSRUxFQVNFX1NUT1JFX1BBU1NXT1JEPSR7a2V5c3RvcmVQYXNzd29yZH1gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzICs9IGBcXG5SRUxFQVNFX1NUT1JFX1BBU1NXT1JEPSR7a2V5c3RvcmVQYXNzd29yZH1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyDmm7TmlrDmiJbmt7vliqAgUkVMRUFTRV9LRVlfQUxJQVPvvIjlpITnkIbms6jph4rooYzvvIlcclxuICAgICAgICAgICAgaWYgKGdyYWRsZVByb3BzLm1hdGNoKC9eIz9cXHMqUkVMRUFTRV9LRVlfQUxJQVM9L20pKSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyA9IGdyYWRsZVByb3BzLnJlcGxhY2UoL14jP1xccypSRUxFQVNFX0tFWV9BTElBUz0uKiQvbSwgYFJFTEVBU0VfS0VZX0FMSUFTPSR7a2V5c3RvcmVBbGlhc31gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzICs9IGBcXG5SRUxFQVNFX0tFWV9BTElBUz0ke2tleXN0b3JlQWxpYXN9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g5pu05paw5oiW5re75YqgIFJFTEVBU0VfS0VZX1BBU1NXT1JE77yI5aSE55CG5rOo6YeK6KGM77yJXHJcbiAgICAgICAgICAgIGlmIChncmFkbGVQcm9wcy5tYXRjaCgvXiM/XFxzKlJFTEVBU0VfS0VZX1BBU1NXT1JEPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqUkVMRUFTRV9LRVlfUEFTU1dPUkQ9LiokL20sIGBSRUxFQVNFX0tFWV9QQVNTV09SRD0ke2tleXN0b3JlQWxpYXNQYXNzd29yZH1gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzICs9IGBcXG5SRUxFQVNFX0tFWV9QQVNTV09SRD0ke2tleXN0b3JlQWxpYXNQYXNzd29yZH1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyA4LiDmt7vliqAv5pu05pawIEFQUExJQ0FUSU9OX0lE77yI5L2/55SoIHBhY2thZ2VOYW1l77yM5aSE55CG5rOo6YeK6KGM77yJXHJcbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMucGFja2FnZU5hbWU7XHJcbiAgICAgICAgICAgIGlmIChwYWNrYWdlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGdyYWRsZVByb3BzLm1hdGNoKC9eIz9cXHMqQVBQTElDQVRJT05fSUQ9L20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqQVBQTElDQVRJT05fSUQ9LiokL20sIGBBUFBMSUNBVElPTl9JRD0ke3BhY2thZ2VOYW1lfWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyArPSBgXFxuQVBQTElDQVRJT05fSUQ9JHtwYWNrYWdlTmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyA5LiDmt7vliqAv5pu05pawIFBST1BfTkRLX1BBVEjvvIjlpITnkIbms6jph4rooYzvvIlcclxuICAgICAgICAgICAgaWYgKG5ka1BhdGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpeGVkTmRrUGF0aCA9IGNjaGVscGVyLmZpeFBhdGgobmRrUGF0aCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ3JhZGxlUHJvcHMubWF0Y2goL14jP1xccypQUk9QX05ES19QQVRIPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzID0gZ3JhZGxlUHJvcHMucmVwbGFjZSgvXiM/XFxzKlBST1BfTkRLX1BBVEg9LiokL20sIGBQUk9QX05ES19QQVRIPSR7Zml4ZWROZGtQYXRofWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyArPSBgXFxuUFJPUF9OREtfUEFUSD0ke2ZpeGVkTmRrUGF0aH1gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyAxMC4g5re75YqgL+abtOaWsCBOQVRJVkVfRElS77yI5aSE55CG5rOo6YeK6KGM77yJXHJcbiAgICAgICAgICAgIGNvbnN0IG5hdGl2ZURpciA9IGNjaGVscGVyLmZpeFBhdGgodGhpcy5wYXRocy5wbGF0Zm9ybVRlbXBsYXRlRGlySW5QcmopO1xyXG4gICAgICAgICAgICBpZiAoZ3JhZGxlUHJvcHMubWF0Y2goL14jP1xccypOQVRJVkVfRElSPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqTkFUSVZFX0RJUj0uKiQvbSwgYE5BVElWRV9ESVI9JHtuYXRpdmVEaXJ9YCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyArPSBgXFxuTkFUSVZFX0RJUj0ke25hdGl2ZURpcn1gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxMS4g6K6+572uIFNESyDniYjmnKxcclxuICAgICAgICAgICAgLy8g5by65Yi26K6+572u57yW6K+RIFNESyDniYjmnKzkuLogMzbvvIzku6Xpgb/lhY0gYW5kcm9pZC0zNiAoUHJldmlldykg55qE6LWE5rqQ6ZO+5o6l6Zeu6aKYXHJcbiAgICAgICAgICAgIC8vIOWmguaenOeUqOaIt+aMh+WumueahCBhcGlMZXZlbCDlpKfkuo4gMzbvvIzliJnkvb/nlKjnlKjmiLfnmoRcclxuICAgICAgICAgICAgY29uc3QgYXBpTGV2ZWwgPSB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5hcGlMZXZlbCB8fCAzNjtcclxuICAgICAgICAgICAgY29uc3QgY29tcGlsZVNka1ZlcnNpb24gPSBNYXRoLm1heChhcGlMZXZlbCwgMzYpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGdyYWRsZVByb3BzLm1hdGNoKC9eIz9cXHMqUFJPUF9DT01QSUxFX1NES19WRVJTSU9OPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqUFJPUF9DT01QSUxFX1NES19WRVJTSU9OPS4qJC9tLCBgUFJPUF9DT01QSUxFX1NES19WRVJTSU9OPSR7Y29tcGlsZVNka1ZlcnNpb259YCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyArPSBgXFxuUFJPUF9DT01QSUxFX1NES19WRVJTSU9OPSR7Y29tcGlsZVNka1ZlcnNpb259YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGdyYWRsZVByb3BzLm1hdGNoKC9eIz9cXHMqUFJPUF9UQVJHRVRfU0RLX1ZFUlNJT049L20pKSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyA9IGdyYWRsZVByb3BzLnJlcGxhY2UoL14jP1xccypQUk9QX1RBUkdFVF9TREtfVkVSU0lPTj0uKiQvbSwgYFBST1BfVEFSR0VUX1NES19WRVJTSU9OPSR7YXBpTGV2ZWx9YCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyArPSBgXFxuUFJPUF9UQVJHRVRfU0RLX1ZFUlNJT049JHthcGlMZXZlbH1gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxMS4g5re75YqgIFBST1BfTUlOX1NES19WRVJTSU9O77yI5aaC5p6c5LiN5a2Y5Zyo77yJXHJcbiAgICAgICAgICAgIGlmICghZ3JhZGxlUHJvcHMubWF0Y2goL14jP1xccypQUk9QX01JTl9TREtfVkVSU0lPTj0vbSkpIHtcclxuICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzICs9IGBcXG5QUk9QX01JTl9TREtfVkVSU0lPTj0yMWA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIDEyLiDmm7TmlrAgUFJPUF9JU19ERUJVR++8iOWPguiAgyBwYWNrYWdlcy9lbmdpbmUg55qE5a6e546w77yJXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRGVidWcgPSB0aGlzLnBhcmFtcy5kZWJ1ZyA/ICd0cnVlJyA6ICdmYWxzZSc7XHJcbiAgICAgICAgICAgIGlmIChncmFkbGVQcm9wcy5tYXRjaCgvXiM/XFxzKlBST1BfSVNfREVCVUc9L20pKSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyA9IGdyYWRsZVByb3BzLnJlcGxhY2UoL14jP1xccypQUk9QX0lTX0RFQlVHPS4qJC9tLCBgUFJPUF9JU19ERUJVRz0ke2lzRGVidWd9YCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyArPSBgXFxuUFJPUF9JU19ERUJVRz0ke2lzRGVidWd9YDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gMTMuIOa3u+WKoCBQUk9QX0FQUF9OQU1FXHJcbiAgICAgICAgICAgIGlmIChncmFkbGVQcm9wcy5tYXRjaCgvXiM/XFxzKlBST1BfQVBQX05BTUU9L20pKSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyA9IGdyYWRsZVByb3BzLnJlcGxhY2UoL14jP1xccypQUk9QX0FQUF9OQU1FPS4qJC9tLCBgUFJPUF9BUFBfTkFNRT0ke3RoaXMucGFyYW1zLnByb2plY3ROYW1lfWApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgKz0gYFxcblBST1BfQVBQX05BTUU9JHt0aGlzLnBhcmFtcy5wcm9qZWN0TmFtZX1gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxNC4g5pu05pawIFBST1BfRU5BQkxFX0lOU1RBTlRfQVBQ77yI5aaC5p6c5a2Y5Zyo77yJXHJcbiAgICAgICAgICAgIGNvbnN0IGFuZHJvaWRJbnN0YW50ID0gKHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zIGFzIGFueSkuYW5kcm9pZEluc3RhbnQgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChncmFkbGVQcm9wcy5tYXRjaCgvXiM/XFxzKlBST1BfRU5BQkxFX0lOU1RBTlRfQVBQPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqUFJPUF9FTkFCTEVfSU5TVEFOVF9BUFA9LiokL20sIGBQUk9QX0VOQUJMRV9JTlNUQU5UX0FQUD0ke2FuZHJvaWRJbnN0YW50ID8gJ3RydWUnIDogJ2ZhbHNlJ31gKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghZ3JhZGxlUHJvcHMubWF0Y2goL15QUk9QX0VOQUJMRV9JTlNUQU5UX0FQUD0vbSkpIHtcclxuICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzICs9IGBcXG5QUk9QX0VOQUJMRV9JTlNUQU5UX0FQUD0ke2FuZHJvaWRJbnN0YW50ID8gJ3RydWUnIDogJ2ZhbHNlJ31gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxNS4g5pu05pawIFBST1BfRU5BQkxFX0lOUFVUU0RL77yI5aaC5p6c5a2Y5Zyo77yJXHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0U0RLID0gKHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zIGFzIGFueSkuaW5wdXRTREsgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChncmFkbGVQcm9wcy5tYXRjaCgvXiM/XFxzKlBST1BfRU5BQkxFX0lOUFVUU0RLPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqUFJPUF9FTkFCTEVfSU5QVVRTREs9LiokL20sIGBQUk9QX0VOQUJMRV9JTlBVVFNESz0ke2lucHV0U0RLID8gJ3RydWUnIDogJ2ZhbHNlJ31gKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghZ3JhZGxlUHJvcHMubWF0Y2goL15QUk9QX0VOQUJMRV9JTlBVVFNESz0vbSkpIHtcclxuICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzICs9IGBcXG5QUk9QX0VOQUJMRV9JTlBVVFNESz0ke2lucHV0U0RLID8gJ3RydWUnIDogJ2ZhbHNlJ31gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxNi4g5pu05pawIFBST1BfRU5BQkxFX0NPTVBSRVNTX1NP77yI5aaC5p6c5a2Y5Zyo77yJXHJcbiAgICAgICAgICAgIGNvbnN0IGlzU29GaWxlQ29tcHJlc3NlZCA9ICh0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcyBhcyBhbnkpLmlzU29GaWxlQ29tcHJlc3NlZCB8fCBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKGdyYWRsZVByb3BzLm1hdGNoKC9eIz9cXHMqUFJPUF9FTkFCTEVfQ09NUFJFU1NfU089L20pKSB7XHJcbiAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyA9IGdyYWRsZVByb3BzLnJlcGxhY2UoL14jP1xccypQUk9QX0VOQUJMRV9DT01QUkVTU19TTz0uKiQvbSwgYFBST1BfRU5BQkxFX0NPTVBSRVNTX1NPPSR7aXNTb0ZpbGVDb21wcmVzc2VkID8gJ3RydWUnIDogJ2ZhbHNlJ31gKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghZ3JhZGxlUHJvcHMubWF0Y2goL15QUk9QX0VOQUJMRV9DT01QUkVTU19TTz0vbSkpIHtcclxuICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzICs9IGBcXG5QUk9QX0VOQUJMRV9DT01QUkVTU19TTz0ke2lzU29GaWxlQ29tcHJlc3NlZCA/ICd0cnVlJyA6ICdmYWxzZSd9YDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gMTcuIOabtOaWsCBQUk9QX0FQUF9BQklcclxuICAgICAgICAgICAgY29uc3QgYXBwQUJJcyA9IHRoaXMucGFyYW1zLnBsYXRmb3JtUGFyYW1zLmFwcEFCSXMgJiYgdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMuYXBwQUJJcy5sZW5ndGggPiAwIFxyXG4gICAgICAgICAgICAgICAgPyB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5hcHBBQklzLmpvaW4oJzonKSBcclxuICAgICAgICAgICAgICAgIDogJ2FybWVhYmktdjdhJztcclxuICAgICAgICAgICAgaWYgKGdyYWRsZVByb3BzLm1hdGNoKC9eIz9cXHMqUFJPUF9BUFBfQUJJPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqUFJPUF9BUFBfQUJJPS4qJC9tLCBgUFJPUF9BUFBfQUJJPSR7YXBwQUJJc31gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIOS9v+eUqOWFqOWxgOabv+aNou+8jOWboOS4uuWPr+iDveacieazqOmHiuihjFxyXG4gICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9QUk9QX0FQUF9BQkk9LiovZywgYFBST1BfQVBQX0FCST0ke2FwcEFCSXN9YCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWdyYWRsZVByb3BzLmluY2x1ZGVzKCdQUk9QX0FQUF9BQkk9JykpIHtcclxuICAgICAgICAgICAgICAgICAgICBncmFkbGVQcm9wcyArPSBgXFxuUFJPUF9BUFBfQUJJPSR7YXBwQUJJc31gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxOC4g5pu05pawIFBST1BfTkRLX1ZFUlNJT07vvIjku44gTkRLIOeahCBzb3VyY2UucHJvcGVydGllcyDor7vlj5bvvIlcclxuICAgICAgICAgICAgaWYgKG5ka1BhdGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ka1Byb3BlcnRpZXNQYXRoID0gcHMuam9pbihuZGtQYXRoLCAnc291cmNlLnByb3BlcnRpZXMnKTtcclxuICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKG5ka1Byb3BlcnRpZXNQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ka0NvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMobmRrUHJvcGVydGllc1BhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWdleHAgPSAvUGtnXFwuUmV2aXNpb25cXHMqPVxccyooLiopLztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBuZGtDb250ZW50Lm1hdGNoKHJlZ2V4cCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaFsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmRrVmVyc2lvbiA9IG1hdGNoWzFdLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmFkbGVQcm9wcy5tYXRjaCgvXiM/XFxzKlBST1BfTkRLX1ZFUlNJT049L20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhZGxlUHJvcHMgPSBncmFkbGVQcm9wcy5yZXBsYWNlKC9eIz9cXHMqUFJPUF9OREtfVkVSU0lPTj0uKiQvbSwgYFBST1BfTkRLX1ZFUlNJT049JHtuZGtWZXJzaW9ufWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghZ3JhZGxlUHJvcHMubWF0Y2goL15QUk9QX05ES19WRVJTSU9OPS9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYWRsZVByb3BzICs9IGBcXG5QUk9QX05ES19WRVJTSU9OPSR7bmRrVmVyc2lvbn1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtBbmRyb2lkXSBGYWlsZWQgdG8gcmVhZCBOREsgdmVyc2lvbiBmcm9tICR7bmRrUHJvcGVydGllc1BhdGh9OmAsIGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGdyYWRsZVByb3BzUGF0aCwgZ3JhZGxlUHJvcHMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FuZHJvaWRdIFVwZGF0ZWQgZ3JhZGxlLnByb3BlcnRpZXMgd2l0aCBrZXlzdG9yZSwgYXBwbGljYXRpb25JZCwgTkRLIHBhdGgsIE5BVElWRV9ESVIsIFNESyB2ZXJzaW9ucywgUFJPUF9JU19ERUJVRyBhbmQgUFJPUF9BUFBfTkFNRWApO1xyXG5cclxuICAgICAgICAgICAgLy8gMTIuIOS/ruWkjSBzdHJpbmdzLnhtbCAo5aaC5p6c5Li656m6KVxyXG4gICAgICAgICAgICAvLyDmn5Dkupvmg4XlhrXkuIvvvIzmnoTlu7rnm67lvZXkuIvnmoQgc3RyaW5ncy54bWwg5Y+v6IO95piv56m655qE77yM5a+86Ie05p6E5bu65aSx6LSlXHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmluZ3NYbWxQYXRoID0gcHMuam9pbihuYXRpdmVQcmpEaXIsICdyZXMnLCAndmFsdWVzJywgJ3N0cmluZ3MueG1sJyk7XHJcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHN0cmluZ3NYbWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzLnJlYWRGaWxlKHN0cmluZ3NYbWxQYXRoLCAndXRmOCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb250ZW50IHx8IGNvbnRlbnQudHJpbSgpID09PSAnJyB8fCBjb250ZW50LnJlcGxhY2UoL1xccy9nLCAnJykgPT09ICc8cmVzb3VyY2VzPjwvcmVzb3VyY2VzPicpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcHBOYW1lID0gdGhpcy5wYXJhbXMucHJvamVjdE5hbWUgfHwgJ0NvY29zR2FtZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3Q29udGVudCA9IGA8cmVzb3VyY2VzPlxcbiAgICA8c3RyaW5nIG5hbWU9XCJhcHBfbmFtZVwiIHRyYW5zbGF0YWJsZT1cImZhbHNlXCI+JHthcHBOYW1lfTwvc3RyaW5nPlxcbjwvcmVzb3VyY2VzPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKHN0cmluZ3NYbWxQYXRoLCBuZXdDb250ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FuZHJvaWRdIFJlcGFpcmVkIGVtcHR5IHN0cmluZ3MueG1sIHdpdGggYXBwX25hbWU6ICR7YXBwTmFtZX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gMTkuIOa4heeQhiByZXMg55uu5b2V77yM5Y+q5L+d55WZIHZhbHVlc1xyXG4gICAgICAgICAgICAvLyDpgb/lhY3kuI7nlKjmiLfku6PnoIHkuK3nmoTotYTmupDph43lpI0gKER1cGxpY2F0ZSByZXNvdXJjZXMpXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc0RpciA9IHBzLmpvaW4obmF0aXZlUHJqRGlyLCAncmVzJyk7XHJcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHJlc0RpcikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgZnMucmVhZGRpcihyZXNEaXIpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0gIT09ICd2YWx1ZXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1QYXRoID0gcHMuam9pbihyZXNEaXIsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBmcy5yZW1vdmUoaXRlbVBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FuZHJvaWRdIFJlbW92ZWQgZHVwbGljYXRlZCByZXNvdXJjZSBkaXJlY3Rvcnk6ICR7aXRlbX1gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlsIbpobnnm67lkI3np7DovazmjaLkuLogQVNDSUkg5qC85byP77yI55So5LqOIEdyYWRsZSDku7vliqHlkI3vvIlcclxuICAgICAqIOWPguiAgyBwYWNrYWdlcy9lbmdpbmUg55qE5a6e546wXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBwcm9qZWN0TmFtZUFTQ0lJKCk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8g5bCG6aG555uu5ZCN56ew6L2s5o2i5Li6IEFTQ0lJ77yM56e76Zmk54m55q6K5a2X56ymXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLnByb2plY3ROYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbWFrZSgpIHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXM7XHJcbiAgICAgICAgY29uc3QgbmF0aXZlUHJqRGlyID0gdGhpcy5wYXRocy5uYXRpdmVQcmpEaXI7XHJcblxyXG4gICAgICAgIC8vIOiuvue9riBKQVZBX0hPTUXvvIjlpoLmnpzmj5DkvpvvvIlcclxuICAgICAgICBpZiAob3B0aW9ucy5qYXZhSG9tZSkge1xyXG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuSkFWQV9IT01FICE9PSBvcHRpb25zLmphdmFIb21lKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmVudi5KQVZBX0hPTUUgPSBvcHRpb25zLmphdmFIb21lO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtBbmRyb2lkXSBVcGRhdGUgSkFWQV9IT01FIHRvICR7b3B0aW9ucy5qYXZhSG9tZX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzZXAgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gJzsnIDogJzonO1xyXG4gICAgICAgICAgICBjb25zdCBqYXZhQmluUGF0aCA9IHBzLmpvaW4ob3B0aW9ucy5qYXZhSG9tZSwgJ2JpbicpO1xyXG4gICAgICAgICAgICBpZiAoIXByb2Nlc3MuZW52LlBBVEghLmluY2x1ZGVzKGphdmFCaW5QYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuUEFUSCA9IGphdmFCaW5QYXRoICsgc2VwICsgcHJvY2Vzcy5lbnYuUEFUSDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQW5kcm9pZF0gQWRkIEpBVkFfSE9NRS9iaW4gdG8gUEFUSGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMobmF0aXZlUHJqRGlyKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFtBbmRyb2lkXSBQcm9qZWN0IGRpcmVjdG9yeSBub3QgZm91bmQ6ICR7bmF0aXZlUHJqRGlyfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGdyYWRsZXcgPSAnZ3JhZGxldyc7XHJcbiAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcclxuICAgICAgICAgICAgZ3JhZGxldyArPSAnLmJhdCc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ3JhZGxldyA9ICcuLycgKyBncmFkbGV3O1xyXG4gICAgICAgICAgICAvLyDnoa7kv50gZ3JhZGxldyDmnInmiafooYzmnYPpmZBcclxuICAgICAgICAgICAgYXdhaXQgZnMuY2htb2QocHMuam9pbihuYXRpdmVQcmpEaXIsICdncmFkbGV3JyksICc3NTUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOaehOW7uuaooeW8j++8mkRlYnVnIOaIliBSZWxlYXNlXHJcbiAgICAgICAgY29uc3Qgb3V0cHV0TW9kZSA9IHRoaXMucGFyYW1zLmRlYnVnID8gJ0RlYnVnJyA6ICdSZWxlYXNlJztcclxuICAgICAgICAvLyDkvb/nlKjpobnnm67lkI3ogIzkuI3mmK8gQVNDSUkg54mI5pys77yM5Zug5Li6IHNldHRpbmdzLmdyYWRsZSDkuK3lt7Lnu4/mm7/mjaLkuLrlrp7pmYXpobnnm67lkI1cclxuICAgICAgICBjb25zdCBwcm9qZWN0TmFtZSA9IHRoaXMucGFyYW1zLnByb2plY3ROYW1lO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOe8luivkSBBbmRyb2lkIEFQS1xyXG4gICAgICAgIGNvbnN0IGJ1aWxkTW9kZSA9IGAke3Byb2plY3ROYW1lfTphc3NlbWJsZSR7b3V0cHV0TW9kZX1gO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOS/neWtmOW9k+WJjeW3peS9nOebruW9lVxyXG4gICAgICAgIGNvbnN0IG9yaWdpbkRpciA9IHByb2Nlc3MuY3dkKCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihuYXRpdmVQcmpEaXIpO1xyXG4gICAgICAgICAgICBhd2FpdCBjY2hlbHBlci5ydW5DbWQoZ3JhZGxldywgW2J1aWxkTW9kZV0sIGZhbHNlLCBuYXRpdmVQcmpEaXIpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAvLyDmgaLlpI3lt6XkvZznm67lvZVcclxuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihvcmlnaW5EaXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g57yW6K+RIEFuZHJvaWQgSW5zdGFudCBBcHDvvIjlpoLmnpzlkK/nlKjvvIlcclxuICAgICAgICBjb25zdCBhbmRyb2lkSW5zdGFudCA9IChvcHRpb25zIGFzIGFueSkuYW5kcm9pZEluc3RhbnQgfHwgZmFsc2U7XHJcbiAgICAgICAgaWYgKGFuZHJvaWRJbnN0YW50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluc3RhbnRCdWlsZE1vZGUgPSBgaW5zdGFudGFwcDphc3NlbWJsZSR7b3V0cHV0TW9kZX1gO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihuYXRpdmVQcmpEaXIpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgY2NoZWxwZXIucnVuQ21kKGdyYWRsZXcsIFtpbnN0YW50QnVpbGRNb2RlXSwgZmFsc2UsIG5hdGl2ZVByakRpcik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0FuZHJvaWRdIEZhaWxlZCB0byBidWlsZCBpbnN0YW50IGFwcDpgLCBlKTtcclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIob3JpZ2luRGlyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g57yW6K+RIEdvb2dsZSBBcHAgQnVuZGxl77yI5aaC5p6c5ZCv55So77yJXHJcbiAgICAgICAgY29uc3QgYXBwQnVuZGxlID0gKG9wdGlvbnMgYXMgYW55KS5hcHBCdW5kbGUgfHwgZmFsc2U7XHJcbiAgICAgICAgaWYgKGFwcEJ1bmRsZSkge1xyXG4gICAgICAgICAgICBsZXQgYnVuZGxlQnVpbGRNb2RlOiBzdHJpbmc7XHJcbiAgICAgICAgICAgIGlmIChhbmRyb2lkSW5zdGFudCkge1xyXG4gICAgICAgICAgICAgICAgYnVuZGxlQnVpbGRNb2RlID0gYGJ1bmRsZSR7b3V0cHV0TW9kZX1gO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnVuZGxlQnVpbGRNb2RlID0gYCR7cHJvamVjdE5hbWV9OmJ1bmRsZSR7b3V0cHV0TW9kZX1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmNoZGlyKG5hdGl2ZVByakRpcik7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBjY2hlbHBlci5ydW5DbWQoZ3JhZGxldywgW2J1bmRsZUJ1aWxkTW9kZV0sIGZhbHNlLCBuYXRpdmVQcmpEaXIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtBbmRyb2lkXSBGYWlsZWQgdG8gYnVpbGQgYXBwIGJ1bmRsZTpgLCBlKTtcclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIob3JpZ2luRGlyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5YGc5q2iIEdyYWRsZSDlrojmiqTov5vnqIvvvIzph4rmlL7mlofku7bplIHlrprvvIzku6Xkvr/lj6/ku6XliKDpmaTmnoTlu7rnm67lvZVcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyKG5hdGl2ZVByakRpcik7XHJcbiAgICAgICAgICAgIGF3YWl0IGNjaGVscGVyLnJ1bkNtZChncmFkbGV3LCBbJy0tc3RvcCddLCB0cnVlLCBuYXRpdmVQcmpEaXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FuZHJvaWRdIFN0b3BwZWQgR3JhZGxlIGRhZW1vbmApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgLy8g5b+955Wl5YGc5q2i5a6I5oqk6L+b56iL55qE6ZSZ6K+v77yM5LiN5b2x5ZON5p6E5bu657uT5p6cXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0FuZHJvaWRdIEZhaWxlZCB0byBzdG9wIEdyYWRsZSBkYWVtb24gKG5vbi1jcml0aWNhbCk6YCwgZSk7XHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihvcmlnaW5EaXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY29weVRvRGlzdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5aSN5Yi25p6E5bu65Lqn54mp5Yiw5Y+R5biD55uu5b2VXHJcbiAgICAgKiDlj4LogIMgcGFja2FnZXMvZW5naW5lIOeahOWunueOsFxyXG4gICAgICovXHJcbiAgICBhc3luYyBjb3B5VG9EaXN0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcztcclxuICAgICAgICBjb25zdCBzdWZmaXggPSB0aGlzLnBhcmFtcy5kZWJ1ZyA/ICdkZWJ1ZycgOiAncmVsZWFzZSc7XHJcbiAgICAgICAgY29uc3QgZGVzdERpciA9IHBzLmpvaW4odGhpcy5wYXRocy5idWlsZERpciwgJ3B1Ymxpc2gnLCBzdWZmaXgpO1xyXG4gICAgICAgIGZzLmVuc3VyZURpclN5bmMoZGVzdERpcik7XHJcblxyXG4gICAgICAgIC8vIOWkjeWItiBBUEtcclxuICAgICAgICBjb25zdCBhcGtQYXRoID0gdGhpcy5nZXRBcGtQYXRoKCk7XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGFwa1BhdGgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgW0FuZHJvaWRdIEFQSyBub3QgZm91bmQgYXQgJHthcGtQYXRofWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDkvb/nlKjpobnnm67lkI3ogIzkuI3mmK8gQVNDSUkg54mI5pys77yM5LiOIHNldHRpbmdzLmdyYWRsZSDkuK3nmoTpobnnm67lkI3kv53mjIHkuIDoh7RcclxuICAgICAgICBjb25zdCBhcGtOYW1lID0gYCR7dGhpcy5wYXJhbXMucHJvamVjdE5hbWV9LSR7c3VmZml4fS5hcGtgO1xyXG4gICAgICAgIGZzLmNvcHlGaWxlU3luYyhhcGtQYXRoLCBwcy5qb2luKGRlc3REaXIsIGFwa05hbWUpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW0FuZHJvaWRdIENvcGllZCBBUEsgdG8gJHtkZXN0RGlyfWApO1xyXG5cclxuICAgICAgICAvLyDlpI3liLYgSW5zdGFudCBBcHAgQVBL77yI5aaC5p6c5a2Y5Zyo77yJXHJcbiAgICAgICAgY29uc3QgYW5kcm9pZEluc3RhbnQgPSAob3B0aW9ucyBhcyBhbnkpLmFuZHJvaWRJbnN0YW50IHx8IGZhbHNlO1xyXG4gICAgICAgIGlmIChhbmRyb2lkSW5zdGFudCkge1xyXG4gICAgICAgICAgICBjb25zdCBpbnN0YW50QXBrTmFtZSA9IGBpbnN0YW50YXBwLSR7c3VmZml4fS5hcGtgO1xyXG4gICAgICAgICAgICBjb25zdCBpbnN0YW50QXBrUGF0aCA9IHBzLmpvaW4odGhpcy5wYXRocy5uYXRpdmVQcmpEaXIsIGBidWlsZC9pbnN0YW50YXBwL291dHB1dHMvYXBrLyR7c3VmZml4fS8ke2luc3RhbnRBcGtOYW1lfWApO1xyXG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhpbnN0YW50QXBrUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGZzLmNvcHlGaWxlU3luYyhpbnN0YW50QXBrUGF0aCwgcHMuam9pbihkZXN0RGlyLCBpbnN0YW50QXBrTmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtBbmRyb2lkXSBDb3BpZWQgSW5zdGFudCBBcHAgQVBLIHRvICR7ZGVzdERpcn1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5aSN5Yi2IEFwcCBCdW5kbGXvvIjlpoLmnpzlrZjlnKjvvIlcclxuICAgICAgICBjb25zdCBhcHBCdW5kbGUgPSAob3B0aW9ucyBhcyBhbnkpLmFwcEJ1bmRsZSB8fCBmYWxzZTtcclxuICAgICAgICBpZiAoYXBwQnVuZGxlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1bmRsZU5hbWUgPSBgJHt0aGlzLnBhcmFtcy5wcm9qZWN0TmFtZX0tJHtzdWZmaXh9LmFhYmA7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1bmRsZVBhdGggPSBwcy5qb2luKHRoaXMub3V0cHV0c0RpcigpLCBgYnVuZGxlLyR7c3VmZml4fS8ke2J1bmRsZU5hbWV9YCk7XHJcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGJ1bmRsZVBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBmcy5jb3B5RmlsZVN5bmMoYnVuZGxlUGF0aCwgcHMuam9pbihkZXN0RGlyLCBidW5kbGVOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0FuZHJvaWRdIENvcGllZCBBcHAgQnVuZGxlIHRvICR7ZGVzdERpcn1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIG9wZW5XaXRoSURFKG5hdGl2ZVByakRpcjogc3RyaW5nLCBhbmRyb2lkU3R1ZGlvRGlyPzogc3RyaW5nKSB7XHJcbiAgICAgICAgLy8g5omT5byAIEFuZHJvaWQgU3R1ZGlvXHJcbiAgICAgICAgLy8g6L+Z6YeM6ZyA6KaB5qC55o2u5a6e6ZmF55qEIEFuZHJvaWQgU3R1ZGlvIOi3r+W+hOadpeiwg+eUqFxyXG4gICAgICAgIGlmIChhbmRyb2lkU3R1ZGlvRGlyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0dWRpb0V4ZSA9IHBzLmpvaW4oYW5kcm9pZFN0dWRpb0RpciwgJ2JpbicsICdzdHVkaW82NC5leGUnKTtcclxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoc3R1ZGlvRXhlKSkge1xyXG4gICAgICAgICAgICAgICAgY2NoZWxwZXIucnVuQ21kKHN0dWRpb0V4ZSwgW25hdGl2ZVByakRpcl0sIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUud2FybignQW5kcm9pZCBTdHVkaW8gcGF0aCBub3QgZm91bmQnKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5YgQVBLIOi3r+W+hFxyXG4gICAgICog5Y+C6ICDIHBhY2thZ2VzL2VuZ2luZSDnmoTlrp7njrBcclxuICAgICAqL1xyXG4gICAgZ2V0QXBrUGF0aCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHN1ZmZpeCA9IHRoaXMucGFyYW1zLmRlYnVnID8gJ2RlYnVnJyA6ICdyZWxlYXNlJztcclxuICAgICAgICAvLyDkvb/nlKjpobnnm67lkI3ogIzkuI3mmK8gQVNDSUkg54mI5pys77yM5LiOIHNldHRpbmdzLmdyYWRsZSDkuK3nmoTpobnnm67lkI3kv53mjIHkuIDoh7RcclxuICAgICAgICBjb25zdCBhcGtOYW1lID0gYCR7dGhpcy5wYXJhbXMucHJvamVjdE5hbWV9LSR7c3VmZml4fS5hcGtgO1xyXG4gICAgICAgIHJldHVybiBwcy5qb2luKHRoaXMub3V0cHV0c0RpcigpLCBgYXBrLyR7c3VmZml4fS8ke2Fwa05hbWV9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmnoTlu7rovpPlh7rnm67lvZVcclxuICAgICAqIOWPguiAgyBwYWNrYWdlcy9lbmdpbmUg55qE5a6e546wXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBvdXRwdXRzRGlyKCk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8g5L2/55So6aG555uu5ZCN6ICM5LiN5pivIEFTQ0lJIOeJiOacrO+8jOS4jiBzZXR0aW5ncy5ncmFkbGUg5Lit55qE6aG555uu5ZCN5L+d5oyB5LiA6Ie0XHJcbiAgICAgICAgY29uc3QgZm9sZGVyTmFtZSA9IHRoaXMucGFyYW1zLnByb2plY3ROYW1lO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldERpciA9IHBzLmpvaW4odGhpcy5wYXRocy5uYXRpdmVQcmpEaXIsICdidWlsZCcsIGZvbGRlck5hbWUpO1xyXG4gICAgICAgIGNvbnN0IGZhbGxiYWNrRGlyID0gcHMuam9pbih0aGlzLnBhdGhzLm5hdGl2ZVByakRpciwgJ2J1aWxkJywgdGhpcy5wYXJhbXMucHJvamVjdE5hbWUpO1xyXG4gICAgICAgIHJldHVybiBwcy5qb2luKGZzLmV4aXN0c1N5bmModGFyZ2V0RGlyKSA/IHRhcmdldERpciA6IGZhbGxiYWNrRGlyLCAnb3V0cHV0cycpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldEV4ZWN1dGFibGVGaWxlKCkge1xyXG4gICAgICAgIGNvbnN0IGFwa1BhdGggPSB0aGlzLmdldEFwa1BhdGgoKTtcclxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoYXBrUGF0aCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbQW5kcm9pZF0gQVBLIGZpbGUgbm90IGZvdW5kIGF0ICR7YXBrUGF0aH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFwa1BhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5YgQURCIOi3r+W+hFxyXG4gICAgICog5Y+C6ICDIHBhY2thZ2VzL2VuZ2luZSDnmoTlrp7njrBcclxuICAgICAqL1xyXG4gICAgZ2V0QWRiUGF0aCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHNka1BhdGggPSB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5zZGtQYXRoO1xyXG4gICAgICAgIHJldHVybiBwcy5qb2luKFxyXG4gICAgICAgICAgICBzZGtQYXRoLFxyXG4gICAgICAgICAgICBgcGxhdGZvcm0tdG9vbHMvYWRiJHtwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gJy5leGUnIDogJyd9YFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XmmK/lkKbmnInorr7lpIfov57mjqVcclxuICAgICAqIOWPguiAgyBwYWNrYWdlcy9lbmdpbmUg55qE5a6e546wXHJcbiAgICAgKi9cclxuICAgIGNoZWNrQ29ubmVjdGVkRGV2aWNlcyhhZGJQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCB7IHNwYXduU3luYyB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xyXG4gICAgICAgIGNvbnN0IGNwID0gc3Bhd25TeW5jKGFkYlBhdGgsIFsnZGV2aWNlcyddLCB7IFxyXG4gICAgICAgICAgICBzaGVsbDogdHJ1ZSwgXHJcbiAgICAgICAgICAgIGVudjogcHJvY2Vzcy5lbnYsIFxyXG4gICAgICAgICAgICBjd2Q6IHByb2Nlc3MuY3dkKCkgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNwLnN0ZGVyciAmJiBjcC5zdGRlcnIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2FkYiBkZXZpY2VzXSBzdGRlcnI6ICR7Y3Auc3RkZXJyLnRvU3RyaW5nKCd1dGY4Jyl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcC5lcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2FkYiBkZXZpY2VzXSBlcnJvcjogJHtjcC5lcnJvcn1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNwLm91dHB1dCAmJiBjcC5vdXRwdXQubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rIG9mIGNwLm91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNodW5rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtTdHIgPSBjaHVuay50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gY2h1bmtTdHIuc3BsaXQoJ1xcbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoL15bMC05YS16QS1aXStcXHMrXFx3Ky8udGVzdChsaW5lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIGRldmljZSBjb25uZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6UgQVBLIOaYr+WQpuW3suWuieijhVxyXG4gICAgICog5Y+C6ICDIHBhY2thZ2VzL2VuZ2luZSDnmoTlrp7njrBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY2hlY2tBcGtJbnN0YWxsZWQoYWRiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgY29uc3QgeyBzcGF3biB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xyXG4gICAgICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gdGhpcy5wYXJhbXMucGxhdGZvcm1QYXJhbXMucGFja2FnZU5hbWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNwID0gc3Bhd24oXHJcbiAgICAgICAgICAgICAgICBhZGJQYXRoLFxyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICdzaGVsbCcsICdwbScsICdsaXN0JywgJ3BhY2thZ2VzJywgJ3wnLCAnZ3JlcCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFja2FnZU5hbWUsXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoZWxsOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGVudjogcHJvY2Vzcy5lbnYsXHJcbiAgICAgICAgICAgICAgICAgICAgY3dkOiBwcm9jZXNzLmN3ZCgpLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG91dHB1dCA9ICcnO1xyXG4gICAgICAgICAgICBjcC5zdGRvdXQub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGNodW5rLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjcC5zdGRlcnIub24oJ2RhdGEnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBpZ25vcmUgc3RkZXJyXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjcC5vbignY2xvc2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKG91dHB1dC5pbmNsdWRlcyhwYWNrYWdlTmFtZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWuieijhSBBUEtcclxuICAgICAqIOWPguiAgyBwYWNrYWdlcy9lbmdpbmUg55qE5a6e546wXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGluc3RhbGwoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgY29uc3QgYXBrUGF0aCA9IHRoaXMuZ2V0QXBrUGF0aCgpO1xyXG4gICAgICAgIGNvbnN0IGFkYlBhdGggPSB0aGlzLmdldEFkYlBhdGgoKTtcclxuXHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGFwa1BhdGgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgW0FuZHJvaWRdIENhbm5vdCBmaW5kIEFQSyBhdCAke2Fwa1BhdGh9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoYWRiUGF0aCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbQW5kcm9pZF0gQ2Fubm90IGZpbmQgQURCIGF0ICR7YWRiUGF0aH1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5jaGVja0Nvbm5lY3RlZERldmljZXMoYWRiUGF0aCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW0FuZHJvaWRdIENhbm5vdCBmaW5kIGFueSBjb25uZWN0ZWQgZGV2aWNlcywgcGxlYXNlIGNvbm5lY3QgeW91ciBkZXZpY2Ugb3Igc3RhcnQgYW4gQW5kcm9pZCBlbXVsYXRvcmApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlpoLmnpzlt7Llronoo4XvvIzlhYjljbjovb1cclxuICAgICAgICBpZiAoYXdhaXQgdGhpcy5jaGVja0Fwa0luc3RhbGxlZChhZGJQYXRoKSkge1xyXG4gICAgICAgICAgICBhd2FpdCBjY2hlbHBlci5ydW5DbWQoXHJcbiAgICAgICAgICAgICAgICBhZGJQYXRoLFxyXG4gICAgICAgICAgICAgICAgWyd1bmluc3RhbGwnLCB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5wYWNrYWdlTmFtZV0sXHJcbiAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5a6J6KOFIEFQS1xyXG4gICAgICAgIGF3YWl0IGNjaGVscGVyLnJ1bkNtZChhZGJQYXRoLCBbJ2luc3RhbGwnLCAnLXInLCBhcGtQYXRoXSwgZmFsc2UpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZCv5Yqo5bqU55SoXHJcbiAgICAgKiDlj4LogIMgcGFja2FnZXMvZW5naW5lIOeahOWunueOsFxyXG4gICAgICovXHJcbiAgICBhc3luYyBzdGFydEFwcCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICBjb25zdCBhZGJQYXRoID0gdGhpcy5nZXRBZGJQYXRoKCk7XHJcbiAgICAgICAgY29uc3QgcGFja2FnZU5hbWUgPSB0aGlzLnBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5wYWNrYWdlTmFtZTtcclxuICAgICAgICBhd2FpdCBjY2hlbHBlci5ydW5DbWQoXHJcbiAgICAgICAgICAgIGFkYlBhdGgsXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICdzaGVsbCcsICdhbScsICdzdGFydCcsICctbicsXHJcbiAgICAgICAgICAgICAgICBgJHtwYWNrYWdlTmFtZX0vY29tLmNvY29zLmdhbWUuQXBwQWN0aXZpdHlgLFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGlmIChhd2FpdCB0aGlzLmluc3RhbGwoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydEFwcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdfQ==